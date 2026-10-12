/**
 * H — the bike jump over a cleft (x 500): a dirt track down a dry hillside
 * to a lip, a dark cleft six metres wide and thirty deep, a landing bank
 * beyond. A fifteen-year-old on a black BMX who never touches the brakes;
 * in the air the other one's front wheel drops.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { type Actor } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { box, mesh } from '../../util'
import { PI, DEG, fbm, rng, ss, win, canvasTexture, instances, type Ctx, type Dir, type PSet } from '../common'
import { gridSurface, pineGeometry, tuftGeometry } from '../geo'
import { carry, frameOf } from '../rig'
import { Burst, Motes } from '../fx'
import { ghostMaterial } from '../ghost'
import * as PP from '../poses'
import { sunDir, type SkyPreset } from '../env'
import { H15 } from '../cast'
import { gripLine } from '../grip'

const X = 500
const BAR_IN_L = new THREE.Vector3(-1, 0, 0)
const BAR_IN_R = new THREE.Vector3(1, 0, 0)
const BAR_FWD = new THREE.Vector3(0, 0.4, 0.92)
const DEPTH = -30
const DUSTY: SkyPreset = { zenith: 0x5a7aa8, horizon: 0xe2c08e, below: 0x7a6650, haze: 0xd8b688, hazeAmt: 0.7, sunColor: 0xffc27a, disc: 4, glow: 1.2, cloud: 0.2, cloudLit: 0xffd8a8, cloudShade: 0x9a8a88, power: 1.15 }

/** The track's height along z (downhill toward the lip; the last two metres kick up). */
export function track(z: number) {
  if (z >= 2) return -0.5 + 6.5 * Math.pow(ss(2, 32, z), 0.9)
  if (z >= 0) return -0.5 + 0.5 * Math.pow(1 - z / 2, 1.6)
  return 0
}

/** Ground on the near side (z ≥ 0): the track in a shallow worn trench, banks either side. */
function hNear(x: number, z: number) {
  const dx = Math.abs(x - X)
  const t = track(Math.max(z, 0))
  const bank = 0.35 * ss(0.7, 2.2, dx) + 0.05 * Math.max(0, dx - 2.2) + 2.5 * fbm(x * 0.03, z * 0.03, 3, 7) * ss(4, 20, dx)
  return t + bank + 0.04 * fbm(x * 0.8, z * 0.8, 2, 9)
}

/** The landing bank beyond the cleft (z ≤ −6): 25° down, flattening far out. */
function hFar(x: number, z: number) {
  const d = -6 - z
  const dx = Math.abs(x - X)
  return -3 - Math.tan(25 * DEG) * Math.min(d, 40) - 0.15 * Math.max(0, d - 40) + 0.4 * fbm(x * 0.2, z * 0.2, 2, 11) * ss(1, 3, d) + 2 * fbm(x * 0.02, z * 0.02, 3, 13) * ss(6, 30, dx)
}

/** A black BMX: wheels r 0.25, forward along local +z, ground contact at y 0. */
function buildBike(frame: THREE.Material, tire: THREE.Material, metal: THREE.Material, grip: THREE.Material) {
  const g = new THREE.Group()
  const tube = (a: [number, number, number], b: [number, number, number], r: number, mat = frame) => {
    const va = new THREE.Vector3(...a)
    const vb = new THREE.Vector3(...b)
    const m = mesh(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 8), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, g)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize())
    m.castShadow = true
    return m
  }
  const R = 0.25
  const rear: [number, number, number] = [0, R, -0.47]
  const front: [number, number, number] = [0, R, 0.48]
  const bb: [number, number, number] = [0, 0.3, -0.04]
  const head: [number, number, number] = [0, 0.72, 0.36]
  const seat: [number, number, number] = [0, 0.7, -0.2]
  tube(bb, head, 0.022)
  tube(seat, [0, 0.66, 0.34], 0.02)
  tube(bb, seat, 0.02)
  for (const sx of [-0.05, 0.05]) {
    tube(bb, [sx, R, -0.47], 0.012)
    tube(seat, [sx, R, -0.47], 0.011)
    tube(head, [sx, R, 0.48], 0.014)
  }
  tube(head, [0, 0.86, 0.33], 0.016)
  // Bars: a riser and the crossbar with grips and brake levers (untouched).
  tube([0, 0.86, 0.33], [0, 0.95, 0.37], 0.012, metal)
  tube([-0.34, 0.95, 0.37], [0.34, 0.95, 0.37], 0.012, metal)
  tube([-0.14, 0.86, 0.33], [0.14, 0.86, 0.33], 0.009, metal)
  for (const sx of [-1, 1]) {
    tube([sx * 0.23, 0.95, 0.37], [sx * 0.34, 0.95, 0.37], 0.018, grip).name = 'grip'
    const lever = tube([sx * 0.19, 0.955, 0.385], [sx * 0.31, 0.94, 0.45], 0.006, metal)
    lever.name = 'brake-lever'
  }
  // Seat, cranks, pedals, chainring.
  const s = box(0.08, 0.04, 0.22, grip, 0, 0.73, -0.21, g)
  s.castShadow = true
  const ring = mesh(new THREE.TorusGeometry(0.08, 0.008, 6, 24), metal, 0.03, bb[1], bb[2], g)
  ring.rotation.y = PI / 2
  const cranks = new THREE.Group()
  cranks.name = 'cranks'
  cranks.position.set(0, bb[1], bb[2])
  for (const sx of [-1, 1]) {
    const arm = box(0.016, 0.17, 0.02, metal, sx * 0.07, -sx * 0.085, 0, cranks)
    arm.castShadow = true
    box(0.09, 0.02, 0.08, grip, sx * 0.12, -sx * 0.17, 0, cranks)
  }
  g.add(cranks)
  const wheels: THREE.Group[] = []
  for (const at of [rear, front]) {
    const w = new THREE.Group()
    w.position.set(...at)
    const t = mesh(new THREE.TorusGeometry(R - 0.028, 0.028, 10, 36), tire, 0, 0, 0, w)
    t.rotation.y = PI / 2
    t.castShadow = true
    const rim = mesh(new THREE.TorusGeometry(R - 0.055, 0.008, 6, 36), metal, 0, 0, 0, w)
    rim.rotation.y = PI / 2
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * PI * 2
      const sp = mesh(new THREE.CylinderGeometry(0.0018, 0.0018, R - 0.06, 3), metal, 0, Math.cos(a) * (R - 0.06) * 0.5, Math.sin(a) * (R - 0.06) * 0.5, w)
      sp.rotation.x = a
    }
    mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 10), metal, 0, 0, 0, w).rotation.z = PI / 2
    g.add(w)
    wheels.push(w)
  }
  g.userData.wheels = wheels
  return g
}

export class BikeSet implements PSet {
  readonly group = new THREE.Group()
  private bike!: THREE.Group
  private ghostBike!: THREE.Group
  private ghostMat = ghostMaterial()
  private plume!: Motes
  private land = new Burst(260, 0xc49a5c, 0.14, false, 41)
  private frameM = new THREE.Matrix4()
  private v = new THREE.Vector3()
  private gp = new THREE.Vector3()

  build(c: Ctx) {
    const g = this.group
    const rand = rng(5005)
    const ochre = new THREE.Color(0xb48e5a)
    const scrubC = new THREE.Color(0x8a7a52)
    const rock = new THREE.Color(0x7d6e5e)
    const colour = (p: THREE.Vector3, out: THREE.Color) => {
      const n = fbm(p.x * 0.15, p.z * 0.15, 3, 21)
      out.copy(ochre).lerp(scrubC, ss(0.05, 0.4, n) * ss(1.2, 3, Math.abs(p.x - X)))
      out.lerp(rock, 0.4 * ss(0.3, 0.7, fbm(p.x * 0.05, p.z * 0.05, 2, 23)))
      out.multiplyScalar(0.62 + 0.18 * fbm(p.x * 1.1, p.z * 1.1, 2, 25))
    }
    const dirt = pbr('gravel', 0xffffff, { vertexColors: true, roughness: 1, scale: 1.4 })
    // Near hillside with the track.
    const near = gridSurface(
      180,
      110,
      (i, j, out) => {
        const x = X - 90 + 180 * (0.5 + 0.5 * Math.sign(i / 180 - 0.5) * Math.pow(Math.abs(i / 180 - 0.5) * 2, 1.8))
        const z = 0 + 220 * Math.pow(j / 110, 1.7)
        out.set(x, hNear(x, z), z)
      },
      1,
      (i, j, p, out) => colour(p, out),
    )
    mesh(near, dirt, 0, 0, 0, g).receiveShadow = true
    // The track surface: compacted, darker, with ruts.
    const trackGeo = gridSurface(6, 160, (i, j, out) => {
      const z = 0.02 + 34 * Math.pow(j / 160, 1.2)
      const x = X - 0.75 + (i / 6) * 1.5
      out.set(x, hNear(x, z) + 0.012, z)
    })
    const trackMat = pbr('gravel', 0x8a6a46, { roughness: 1, scale: 0.8, polygonOffset: true, polygonOffsetFactor: -1 })
    mesh(trackGeo, trackMat, 0, 0, 0, g).receiveShadow = true

    // The cleft: near wall under the lip, far wall under the landing rim, the dark floor.
    const wallMat = pbr('rock', 0xffffff, { vertexColors: true, roughness: 1, side: THREE.DoubleSide })
    const wall = (zTop: (x: number) => number, yTop: (x: number) => number, lean: number, seed: number) =>
      gridSurface(
        150,
        60,
        (i, j, out) => {
          const x = X - 90 + 180 * (0.5 + 0.5 * Math.sign(i / 150 - 0.5) * Math.pow(Math.abs(i / 150 - 0.5) * 2, 1.8))
          const t = Math.pow(j / 60, 1.4)
          const y0 = yTop(x)
          const y = lerp(y0, DEPTH, t)
          out.set(x, y, zTop(x) + lean * t * 1.5 + 0.5 * fbm(x * 0.2, y * 0.2, 3, seed) * ss(0, 0.05, t))
        },
        1,
        (i, j, p, out) => {
          const d = ss(-2, -18, p.y)
          out.setRGB(0.5, 0.42, 0.33).multiplyScalar((0.7 + 0.2 * fbm(p.x * 0.3, p.y * 0.3, 2, seed + 1)) * (1 - 0.85 * d))
        },
      )
    mesh(
      wall(
        () => 0,
        (x) => hNear(x, 0),
        -0.6,
        31,
      ),
      wallMat,
      0,
      0,
      0,
      g,
    ).receiveShadow = true
    mesh(
      wall(
        () => -6,
        (x) => hFar(x, -6),
        0.6,
        33,
      ),
      wallMat,
      0,
      0,
      0,
      g,
    ).receiveShadow = true
    const floor = mesh(new THREE.PlaneGeometry(200, 8).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0x0a0806 }), X, DEPTH + 0.2, -3, g)
    floor.name = 'cleft-floor'
    // The landing bank and the valley beyond.
    const far = gridSurface(
      180,
      110,
      (i, j, out) => {
        const x = X - 90 + 180 * (0.5 + 0.5 * Math.sign(i / 180 - 0.5) * Math.pow(Math.abs(i / 180 - 0.5) * 2, 1.8))
        const z = -6 - 400 * Math.pow(j / 110, 1.8)
        out.set(x, hFar(x, z), z)
      },
      1,
      (i, j, p, out) => colour(p, out),
    )
    mesh(far, dirt, 0, 0, 0, g).receiveShadow = true

    // Scrub, dry grass, a few pines; rocks.
    const scrubMat = new THREE.MeshStandardMaterial({ color: 0x6a6a3a, roughness: 1 })
    g.add(
      instances(
        new THREE.IcosahedronGeometry(0.45, 0).translate(0, 0.3, 0),
        scrubMat,
        420,
        () => {
          const x = X - 60 + rand() * 120
          const farSide = rand() < 0.5
          const z = farSide ? -8 - rand() * 60 : 2 + rand() * 60
          if (Math.abs(x - X) < 2.4) return null
          return [x, (farSide ? hFar(x, z) : hNear(x, z)) - 0.1, z, rand() * PI, 0.5 + rand() * 1.1, 0, 0, 0.4 + rand() * 0.6]
        },
        { color: (i, out) => out.setHSL(0.15 + rand() * 0.06, 0.3, 0.22 + rand() * 0.12) },
      ),
    )
    g.add(
      instances(
        tuftGeometry(6, 0.35, 5),
        new THREE.MeshStandardMaterial({ color: 0xc9b46a, roughness: 1, side: THREE.DoubleSide }),
        2600,
        () => {
          const x = X - 30 + rand() * 60
          const farSide = rand() < 0.45
          const z = farSide ? -6.6 - rand() * 30 : 0.4 + rand() * 32
          if (Math.abs(x - X) < 1.0) return null
          return [x, (farSide ? hFar(x, z) : hNear(x, z)) - 0.02, z, rand() * PI * 2, 0.6 + rand() * 0.8]
        },
        { color: (i, out) => out.setHSL(0.11 + rand() * 0.04, 0.4, 0.45 + rand() * 0.15) },
      ),
    )
    g.add(
      instances(
        pineGeometry(),
        new THREE.MeshStandardMaterial({ color: 0x2f3d2a, roughness: 1 }),
        90,
        () => {
          const x = X - 70 + rand() * 140
          const farSide = rand() < 0.5
          const z = farSide ? -14 - rand() * 90 : 8 + rand() * 90
          if (Math.abs(x - X) < 6) return null
          const s = 2.5 + rand() * 3
          return [x, (farSide ? hFar(x, z) : hNear(x, z)) - 0.2, z, rand() * PI, s, 0, 0, s * (1 + rand() * 0.4)]
        },
      ),
    )
    if (c.models.boulder)
      for (const [x, z, s, yaw] of [
        [503.2, 3.5, 0.6, 0.3],
        [496.4, 6.2, 0.8, 1.7],
        [504.5, -9.5, 0.9, 2.6],
        [494.8, -12, 1.1, 0.8],
      ] as const) {
        const b = c.models.boulder.clone(true)
        b.scale.setScalar(s)
        b.position.set(x, (z > 0 ? hNear(x, z) : hFar(x, z)) - 0.2 * s, z)
        b.rotation.y = yaw
        g.add(b)
      }

    // Two tyre tracks at the lip: one goes on, the other stops at the edge.
    const tracks = canvasTexture(128, 256, (tg, W, H) => {
      tg.clearRect(0, 0, W, H)
      tg.fillStyle = 'rgba(40,28,18,0.55)'
      tg.fillRect(36, 0, 14, H)
      tg.fillRect(76, 40, 14, H - 40)
      for (let y = 0; y < H; y += 10) {
        tg.fillStyle = 'rgba(30,20,12,0.35)'
        tg.fillRect(36, y, 14, 4)
        if (y > 40) tg.fillRect(76, y + 4, 14, 4)
      }
    })
    const tr = mesh(new THREE.PlaneGeometry(0.6, 1.6, 1, 8), new THREE.MeshStandardMaterial({ map: tracks, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -3 }), 0, 0, 0, g)
    const tp = tr.geometry.attributes.position as THREE.BufferAttribute
    tr.geometry.rotateX(-PI / 2)
    for (let i = 0; i < tp.count; i++) tp.setY(i, hNear(X + tp.getX(i), 0.85 + tp.getZ(i)) + 0.02)
    tr.position.set(X, 0, 0.85)
    tr.name = 'tyre-tracks'

    // The bike and its ghost.
    const frame = pbr('painted', 0x141416, { roughness: 0.35, metalness: 0.4 })
    const tire = pbr('rubber', 0x151515, { roughness: 0.9 })
    const metal = pbr('metal', 0x9a9ea2, { roughness: 0.35 })
    const grip = pbr('rubber', 0x1c1c1c, { roughness: 0.8 })
    this.bike = buildBike(frame, tire, metal, grip)
    this.bike.name = 'bmx'
    g.add(this.bike)
    this.ghostBike = buildBike(this.ghostMat, this.ghostMat, this.ghostMat, this.ghostMat)
    this.ghostBike.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = false
        m.renderOrder = 5
      }
    })
    g.add(this.ghostBike)
    this.plume = new Motes(380, 0xc8a26a, 0.12, [3.2, 1.6, 6], 0.35, false, 43)
    g.add(this.plume.points, this.land.points)
  }

  /** The rider's place on the run-in (bike origin = ground under the BB), progress u of `bike`. */
  private runZ(u: number) {
    return lerp(32, 1.2, Math.pow(u, 1.05))
  }

  /** In the air: s 0 → 1 from the lip to the bank. */
  private arc(s: number) {
    const z = -7.5 * s
    const y = 0.42 + 2.1 * s - 6.32 * s * s
    const pitch = lerp(14, -25, ss(0.05, 1, s)) * DEG
    return { z, y, pitch }
  }

  private placeBike(b: THREE.Group, x: number, y: number, z: number, pitch: number, roll: number, wheelSpin: number, crank: number, frontDrop = 0) {
    // Pitch about the rear contact so landing reads right; the bike faces −z.
    b.position.set(x, y, z)
    b.rotation.set(-pitch, PI, roll, 'YXZ')
    const [rear, front] = b.userData.wheels as THREE.Group[]
    rear.rotation.x = wheelSpin
    front.rotation.x = wheelSpin * 1.02
    front.position.y = 0.25 - frontDrop
    const c = b.getObjectByName('cranks')
    if (c) c.rotation.x = crank
    b.updateMatrixWorld(true)
  }

  /** Rider on the bike: standing on the pedals, hands on the grips. */
  private ride(a: Actor, b: THREE.Group, time: number, crouch: number, breathe = true) {
    a.begin()
    a.place(0, 0, 0)
    a.blend(
      [
        [0, PP.BIKE_STAND],
        [1, PP.BIKE_AIR],
      ],
      crouch,
    )
    // Canonical: rider at the origin facing +z; the bike's frame carries him.
    a.y = 0.26
    a.z = -0.08
    a.apply(time, breathe)
    // Fists round the bar ends (thumbs in toward the stem, knuckles forward), fingers off the levers.
    gripLine(a.figure, 'l', this.gp.set(0.3, 0.95, 0.37), BAR_IN_L, BAR_FWD, 0.2)
    gripLine(a.figure, 'r', this.gp.set(-0.3, 0.95, 0.37), BAR_IN_R, BAR_FWD, 0.2)
    carry(a.figure, b.matrixWorld)
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const sd = sunDir(PI / 2 - 0.35, 17 * DEG)
    env.sky.set(DUSTY, sd)
    env.setSun(new THREE.Vector3(500, -1, -2), sd, 0xffc68a, 3.0, 22)
    env.setHemi(0x9ab0d0, 0x8a6a48, 0.7)
    env.setFill(new THREE.Vector3(470, 8, 10), new THREE.Vector3(500, 0, 0), 0x9aa8c8, 0.35)
    env.setFog(0xd2b48c, 0.0032)
    env.ibl('belfast_sunset_puresky', 0.5, -PI / 2)

    const boy = cast.solids.boy15
    this.ghostBike.visible = false
    this.land.hide()
    this.plume.points.visible = false
    if (seg === 'bike') this.run(d, boy)
    else this.air(d, boy)
    void t
    void cu
    void shot
    void u
  }

  private run(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    const t = f.time
    const z = this.runZ(u)
    const y = track(z)
    const ahead = track(z - 0.5)
    const pitch = Math.atan2(y - ahead, 0.5)
    const dist = (32 - z) / (0.25 * 2 * PI)
    this.placeBike(this.bike, X + 0.05 * Math.sin(z * 0.5), y, z, -pitch, 0.04 * Math.sin(t * 2.3), -dist * 2 * PI * 0.25 * 4, -dist * 1.4)
    this.ride(boy, this.bike, t, 0.15 + 0.2 * ss(0.8, 1, u))
    // Dust behind the rear wheel.
    this.plume.points.visible = true
    this.plume.update(X, y + 0.5, z + 3.4, t, [0.3, 0.2, 1.4])
    d.walking = 0.8
    d.step = Math.floor(dist * 2)
    // Camera.
    if (cu < 0.48) {
      // Low by the track; he comes at us down the hill; we pan with him.
      const cz = 11.5
      shot.pos.set(503.2, track(cz) + 0.75, cz)
      shot.tgt.set(X + 0.9, y + 0.9, z)
      shot.fov = 46
      shot.handheld = 0.5
    } else if (cu < 0.62) {
      // Insert from above and in front: his hand over the grip; the brake lever untouched.
      this.v.set(-0.29, 0.95, 0.4).applyMatrix4(this.bike.matrixWorld)
      shot.pos.set(this.v.x - 0.26, this.v.y + 0.3, this.v.z - 0.42)
      shot.tgt.copy(this.v)
      shot.fov = 36
      shot.handheld = 0.7
    } else {
      // Chase from behind and above: the lip, the dark cleft beyond it.
      shot.pos.set(X + 0.6, y + 3.4, z + 5.2)
      shot.tgt.set(X, -1.2, -4)
      shot.fov = 48
      shot.handheld = 0.6
    }
  }

  private air(d: Dir, boy: Actor) {
    const { u, cu, f, shot, cast } = d
    const t = f.time
    // Slow motion: the arc spans most of the segment; the wheel keeps turning.
    const s = clamp(u / 0.92)
    const a = this.arc(s)
    let y = a.y
    let z = a.z
    let pitch = a.pitch
    const landed = u >= 0.92
    if (landed) {
      const k = (u - 0.92) / 0.08
      z = -7.5 - 1.2 * k
      y = hFar(X, z)
      pitch = -25 * DEG
    }
    this.placeBike(this.bike, X, y, z, pitch, 0.06 * Math.sin(u * 3), -t * 6, -t * 0.5)
    this.ride(boy, this.bike, t, landed ? 1 - (u - 0.92) / 0.08 : ss(0, 0.1, u))
    // Dust hanging behind the lip; the burst on landing.
    this.plume.points.visible = u < 0.5
    this.plume.update(X, 0.6, 1.2, t * 0.15, [0.1, 0.05, 0.2])
    this.land.set(X, hFar(X, -7.6), -7.6, (u - 0.92) / 0.2, { r: 2.2, h: 1.2, drift: [0.8, 0.2, -1.0], opacity: 0.85 })

    // The split at 0.5: the other one's front wheel drops; it noses into the dark.
    if (u >= 0.5 && u < 0.7) {
      const a0 = this.arc(0.5 / 0.92)
      const flash = u < 0.53 ? 1 - (u - 0.5) / 0.03 : 0
      let op = 0
      cast.ghost(
        cast.ghosts.bike,
        u,
        (ga, uu) => {
          const tt = Math.max(0, uu - 0.5)
          const gy = a0.y - 3.2 * tt - 300 * tt * tt
          this.placeBike(this.ghostBike, X - 0.04, gy, a0.z - 4.5 * tt, a0.pitch - ss(0, 0.12, tt) * 1.3, 0.1, -t * 6, 0, 0.06 * ss(0, 0.04, tt))
          op = 0.36 * (1 - ss(-7, -12, gy))
          return op
        },
        t,
        { flash, alpha: true, after: (ga) => this.ride(ga, this.ghostBike, t, 1, false) },
      )
      this.ghostBike.visible = op > 0.01
      const gu = this.ghostMat.uniforms
      gu.uOpacity.value = op
      gu.uFlash.value = flash
      gu.uAlpha.value = 1
      this.ghostMat.blending = THREE.NormalBlending
    }

    // Camera: side-on at the cleft; tilt down with the ghost; back to him as the bank comes.
    const fz = z
    if (cu < 0.5) {
      const k = ss(0, 0.5, cu)
      shot.pos.set(507.2, 0.2 + 0.3 * k, lerp(-1.6, -3.2, k))
      shot.tgt.set(X, lerp(0.6, 0.2, k), fz + 1.4)
      shot.fov = 50
    } else if (cu < 0.7) {
      // Back along the cleft and up a little: its two walls converging on the dark, the rider
      // above it, the other one's front wheel dropping into it.
      const k = win(0.5, 0.56, 0.64, 0.7, cu)
      shot.pos.set(lerp(507.2, 508.6, k), lerp(0.5, 1.5, k), lerp(-3.2, -3.3, k))
      shot.tgt.set(X, lerp(0.2, -3.6, k), lerp(fz + 1.2, -3.4, k))
      shot.fov = lerp(50, 54, k)
    } else {
      const k = ss(0.7, 1, cu)
      shot.pos.set(lerp(507.2, 505.4, k), lerp(0.5, -1.4, k), lerp(-3.4, -6.4, k))
      shot.tgt.set(X, y + 0.8, fz + 0.6)
      shot.fov = lerp(50, 44, k)
    }
    shot.handheld = 0.4
    void H15
    void win
  }
}

export { frameOf }
