/**
 * F — the hilltop cliff (x 300): a limestone rim with dry grass, a sheer face
 * to a boulder-strewn ravine a hundred metres down. A twelve-year-old sits
 * with his legs over the edge, drops stones and times them; then leans out
 * to see where they went — and the other one leans a little further.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { makePath } from '../../figure/paths'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { mesh } from '../../util'
import { PI, DEG, fbm, rng, ss, win, instances, type Ctx, type Dir, type PSet } from '../common'
import { bunched, gridSurface, tuftGeometry, mergeAll } from '../geo'
import { carry, pivotFrame } from '../rig'
import { Burst } from '../fx'
import * as PP from '../poses'
import * as P from '../../figure/poses'
import { sunDir, type SkyPreset } from '../env'

const X = 300
const FLOOR = -100
const SEAT = { x: 300, z: -1.6 }
const PILE = { x: 300.52, z: -1.22 }

const NOON: SkyPreset = { zenith: 0x2f63b0, horizon: 0xb8cce0, below: 0x6a6a62, haze: 0xc8d6e4, hazeAmt: 0.35, sunColor: 0xfff2d8, disc: 3, glow: 0.5, cloud: 0.22, cloudLit: 0xffffff, cloudShade: 0xaab8cc, power: 1.1 }

/** The rim line: z of the edge at x. */
export function rimZ(x: number) {
  const dx = x - X
  return -2 + (0.7 * fbm(x * 0.13, 7.7, 3, 81) + 0.004 * dx * dx * 0.2) * ss(1.5, 7, Math.abs(dx)) + 0.06 * fbm(x * 0.9, 1.1, 2, 83)
}

/** The hilltop: flat by the boy, falling to where he climbs up from, and away on the sides. */
export function hTop(x: number, z: number) {
  const dx = x - X
  const near = Math.hypot(dx, z - 1)
  const base = -0.0016 * dx * dx
  const behind = -0.65 * ss(3.2, 6.6, z) - 0.05 * Math.max(0, z - 8) * (1 + 0.4 * fbm(x * 0.05, z * 0.05, 2, 91))
  const bumps = 0.1 * fbm(x * 0.6, z * 0.6, 3, 85) * ss(1.2, 3.5, Math.hypot(dx, z + 1.6))
  const far = 5 * fbm(x * 0.02, z * 0.02, 3, 87) * ss(15, 60, near)
  return base + behind + bumps + far
}

/** The face's depth (z) at height y below the rim at x: undercut, ledges, a slight outward lean. */
export function faceZ(x: number, y: number) {
  const ze = rimZ(x)
  const depth = hTop(x, ze) - y
  const rough = (2.2 * fbm(x * 0.05, y * 0.05, 4, 31) + 0.8 * fbm(x * 0.22, y * 0.22, 3, 33) + 0.22 * fbm(x * 1.2, y * 1.2, 2, 35)) * ss(0.2, 4, depth)
  const ledge = 0.5 * Math.max(0, Math.sin(y * 0.31 + 2 * fbm(x * 0.03, y * 0.02, 2, 37))) * ss(0, 5, depth)
  return ze + 0.32 * ss(0, 0.9, depth) * (1 - ss(5, 14, depth)) - 0.03 * depth + rough - ledge
}

const SHOTS: Record<string, ShotKeys> = {
  rehearsal: [
    [0, [300.15, -2.6, -4.6, 300.45, 0.25, -1.75, 45]],
    [0.3, [300.1, -2.5, -4.5, 300.45, 0.3, -1.8, 45]],
    [0.6, [300.05, -2.7, -4.6, 300.4, 0.1, -1.9, 46]],
    [1, [300.0, -2.4, -4.4, 300.45, 0.3, -1.7, 44]],
  ],
}

export class HillSet implements PSet {
  readonly group = new THREE.Group()
  private stone!: THREE.Mesh
  private lap!: THREE.InstancedMesh
  private pile!: THREE.InstancedMesh
  private knock = [new Burst(40, 0xd8cfbf, 0.06, false, 3), new Burst(40, 0xd8cfbf, 0.06, false, 5)]
  private puff = new Burst(90, 0xcfc4b2, 0.5, false, 9)
  private frameM = new THREE.Matrix4()
  private v = new THREE.Vector3()
  private n = new THREE.Vector3()
  private q = new THREE.Quaternion()
  private ghostT = 0
  private climb = makePath([
    [303.4, 6.4],
    [302.7, 4.4],
    [301.4, 1.4],
    [300.35, -1.15],
  ])

  build(c: Ctx) {
    const g = this.group
    const pal = c.pal
    const rand = rng(3003)
    const xs = bunched(200, 0.5, 2.2).map((t) => 140 + t * 320)
    const nu = xs.length - 1
    const lime = new THREE.Color(0xd8cfbf)
    const dryC = new THREE.Color(0xb8a468)
    const grey = new THREE.Color(0xa49c8e)

    // Hilltop: from the rim back over the hill.
    const top = gridSurface(
      nu,
      90,
      (i, j, out) => {
        const x = xs[i]
        const s = 360 * Math.pow(j / 90, 2.2)
        const z = rimZ(x) + s
        out.set(x, hTop(x, z), z)
      },
      1,
      (i, j, p, out) => {
        const n = fbm(p.x * 0.35, p.z * 0.35, 3, 95)
        out.copy(lime).lerp(dryC, ss(-0.1, 0.35, n) * ss(0.4, 1.6, p.z - rimZ(p.x)))
        out.lerp(grey, 0.3 * ss(0.2, 0.6, fbm(p.x * 0.08, p.z * 0.08, 2, 97)))
        out.multiplyScalar(0.66 + 0.18 * fbm(p.x * 1.4, p.z * 1.4, 2, 99))
      },
    )
    const ground = mesh(top, pbr('rock', 0xffffff, { vertexColors: true, roughness: 1 }), 0, 0, 0, g)
    ground.receiveShadow = true
    ground.name = 'hilltop'

    // The face: from the rim down to the talus. Rows bunched toward the top.
    const ny = 120
    const faceRow = (x: number, t: number, out: THREE.Vector3) => {
      if (t <= 0.94) {
        const y = lerp(hTop(x, rimZ(x)), FLOOR + 3, t / 0.94)
        return out.set(x, y, faceZ(x, y))
      }
      const k = (t - 0.94) / 0.06
      const zf = faceZ(x, FLOOR + 3)
      return out.set(x, FLOOR + 3 - 3 * Math.pow(k, 0.6), zf - 6 * Math.pow(k, 1.2) + 1.2 * fbm(x * 0.07, 4.4, 2, 39) * k)
    }
    const faceGeo = gridSurface(
      nu,
      ny,
      (i, j, out) => faceRow(xs[i], Math.pow(j / ny, 1.7), out),
      1,
      (i, j, p, out) => {
        const streak = fbm(p.x * 0.4, p.y * 0.015, 3, 51)
        const v = 0.78 + 0.2 * fbm(p.x * 0.07, p.y * 0.07, 3, 53) - 0.16 * ss(0.1, 0.5, streak)
        out.setRGB(0.66 * v, 0.62 * v, 0.55 * v)
        if (p.y < FLOOR + 8) out.multiplyScalar(0.85)
      },
    )
    const face = mesh(faceGeo, pbr('rock', 0xffffff, { vertexColors: true, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0, g)
    face.receiveShadow = true
    face.castShadow = true
    face.name = 'cliff-face'

    // The ravine floor, the far wall and the land beyond, sharing the x samples.
    const creek = (x: number) => -30 + 6 * Math.sin(x * 0.02) + 3 * Math.sin(x * 0.07 + 1)
    const farH = (x: number, s: number) => {
      // s 0..1 across: floor (0–0.32), far wall (0.32–0.4), far land.
      const dx = x - X
      if (s < 0.32) return FLOOR + 1.6 * fbm(x * 0.06, s * 9, 3, 61) - 1.2 * Math.exp(-Math.pow((lerp(-6, -56, s / 0.32) - creek(x)) / 3, 2))
      if (s < 0.4) return lerp(FLOOR, 4 + 6 * fbm(x * 0.04, 3.3, 2, 63), ss(0.32, 0.4, s))
      return 4 + 40 * ss(0.4, 1, s) * (0.5 + fbm(x * 0.006, s * 3, 4, 65)) + 0.0004 * dx * dx
    }
    const farZ = (x: number, s: number) => {
      if (s < 0.32) return lerp(rimZ(x) - 14, -56, s / 0.32)
      if (s < 0.4) return lerp(-56, -63, (s - 0.32) / 0.08) + 1.5 * fbm(x * 0.08, s * 30, 2, 67)
      return lerp(-63, -900, Math.pow((s - 0.4) / 0.6, 1.6))
    }
    const floorGeo = gridSurface(
      nu,
      120,
      (i, j, out) => {
        const s = j / 120
        out.set(xs[i], farH(xs[i], s), farZ(xs[i], s))
      },
      1,
      (i, j, p, out) => {
        const r = Math.abs(p.z - creek(p.x))
        out.setRGB(0.5, 0.47, 0.41).multiplyScalar(0.8 + 0.25 * fbm(p.x * 0.2, p.z * 0.2, 2, 71))
        if (p.y < FLOOR + 3 && r < 3.5) out.setRGB(0.38, 0.36, 0.33)
        if (p.y > -10) out.lerp(new THREE.Color(0xa49a72), 0.6)
      },
    )
    // The talus row meets the face's last row.
    const fp = floorGeo.attributes.position as THREE.BufferAttribute
    const cp = faceGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i <= nu; i++) {
      const k = ny * (nu + 1) + i
      fp.setXYZ(i, cp.getX(k), cp.getY(k), cp.getZ(k))
    }
    floorGeo.computeVertexNormals()
    const floor = mesh(floorGeo, pbr('rock', 0xffffff, { vertexColors: true, roughness: 1 }), 0, 0, 0, g)
    floor.receiveShadow = true
    floor.name = 'ravine'

    // Boulders on the ravine floor and the last rocks he climbs over.
    const bm = c.models.boulder
    if (bm) {
      for (let k = 0; k < 18; k++) {
        const x = X - 40 + rand() * 80
        const z = -10 - rand() * 40
        const s = 1.5 + rand() * 4
        const b = bm.clone(true)
        b.scale.setScalar(s)
        b.position.set(x, FLOOR - 0.3 * s + 1.2 * fbm(x * 0.06, 2, 3, 61), z)
        b.rotation.y = rand() * PI * 2
        g.add(b)
      }
      for (const [x, z, s, yaw] of [
        [304.6, 6.9, 0.9, 0.4],
        [302.0, 7.4, 0.7, 2.0],
        [305.8, 4.6, 0.55, 1.2],
        [296.5, 5.5, 0.8, 2.8],
        [293.0, 1.5, 0.6, 0.9],
      ] as const) {
        const b = bm.clone(true)
        b.scale.setScalar(s)
        b.position.set(x, hTop(x, z) - 0.25 * s, z)
        b.rotation.y = yaw
        g.add(b)
      }
    }
    if (c.models.rockFace) {
      const r = c.models.rockFace.clone(true)
      r.scale.set(0.9, 0.55, 0.7)
      r.position.set(306.5, hTop(306.5, 9) - 0.6, 9.2)
      r.rotation.y = 2.4
      g.add(r)
    }
    // A dead log at the hill's shoulder.
    if (c.models.trunk) {
      const t = c.models.trunk.clone(true)
      t.position.set(295.2, hTop(295.2, 4.2) - 0.05, 4.2)
      t.rotation.y = 0.5
      g.add(t)
    }

    // Dry grass on the hilltop (thin near the rim and the boy's path), a thorn bush.
    const grassMat = new THREE.MeshStandardMaterial({ color: 0xc9b46a, roughness: 0.95, side: THREE.DoubleSide })
    const tuft = tuftGeometry(7, 0.34, 11)
    g.add(
      instances(
        tuft,
        grassMat,
        5200,
        () => {
          const a = rand() * PI * 2
          const r = 0.8 + Math.pow(rand(), 0.75) * 46
          const x = X + Math.cos(a) * r
          const z = 2 + Math.sin(a) * r * 0.9
          if (z < rimZ(x) + 0.35) return null
          if (Math.hypot(x - SEAT.x, z - SEAT.z) < 0.9) return null
          // Keep his climbing line clear.
          if (Math.abs(x - (300.4 + (z + 1.2) * 0.42)) < 0.45 && z < 7) return null
          if (fbm(x * 0.2, z * 0.2, 2, 101) > 0.2 && rand() < 0.7) return null
          return [x, hTop(x, z) - 0.02, z, rand() * PI * 2, 0.6 + rand() * 0.9]
        },
        { color: (i, out) => out.setHSL(0.11 + rand() * 0.04, 0.38, 0.5 + rand() * 0.18) },
      ),
    )
    const thorn = new THREE.Group()
    const twig = pbr('wood', 0x4a3a2c, { roughness: 1 })
    for (let k = 0; k < 26; k++) {
      const a = rand() * PI * 2
      const len = 0.25 + rand() * 0.45
      const b = mesh(new THREE.CylinderGeometry(0.004, 0.009, len, 4), twig, 0, 0, 0, thorn)
      const tilt = 0.4 + rand() * 0.9
      b.position.set(Math.cos(a) * Math.sin(tilt) * len * 0.5, Math.cos(tilt) * len * 0.5, Math.sin(a) * Math.sin(tilt) * len * 0.5)
      b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)))
      b.castShadow = true
    }
    const leaves = instances(new THREE.TetrahedronGeometry(0.02), new THREE.MeshStandardMaterial({ color: 0x5a6234, roughness: 0.9 }), 60, () => [(rand() - 0.5) * 0.7, 0.1 + rand() * 0.45, (rand() - 0.5) * 0.7, rand() * 6, 1])
    thorn.add(leaves)
    thorn.position.set(297.4, hTop(297.4, -0.3), -0.3)
    thorn.scale.setScalar(1.3)
    g.add(thorn)

    // Stones: the pile by his right hip, the ones in his lap, the one he drops.
    const stoneGeo = mergeAll([new THREE.DodecahedronGeometry(0.03, 0)])
    stoneGeo.scale(1.2, 0.85, 1)
    const stoneMat = pbr('rock', 0xcfc6b5, { roughness: 1, scale: 0.2 })
    this.pile = instances(
      stoneGeo,
      stoneMat,
      8,
      (i) => {
        const a = i * 2.4
        const r = i === 0 ? 0 : 0.05 + (i % 3) * 0.025
        return [PILE.x + Math.cos(a) * r, 0.022 + (i === 0 ? 0.03 : 0), PILE.z + Math.sin(a) * r, a, 0.9 + (i % 4) * 0.12]
      },
      { shadow: true },
    )
    this.pile.name = 'stone-pile'
    g.add(this.pile)
    this.lap = instances(stoneGeo, stoneMat, 3, (i) => [0, 0, 0, i, 1], { shadow: true })
    this.lap.name = 'lap-stones'
    g.add(this.lap)
    this.stone = mesh(stoneGeo, stoneMat, 0, 0, 0, g)
    this.stone.castShadow = true
    this.stone.name = 'stone'
    for (const b of [...this.knock, this.puff]) g.add(b.points)

    void pal
  }

  /** Watch digits for the fall: 0 before the drop, running, stopped at 4.6 s. */
  private digits(seg: string, u: number) {
    let s = 0
    if (seg === 'stone') s = u < 0.22 ? 0 : Math.min(4.6, ((u - 0.22) / 0.54) * 4.6)
    else if (seg === 'rehearsal') s = 4.6
    const whole = Math.floor(s)
    const tenth = Math.floor((s - whole) * 10 + 1e-6)
    return `00:0${whole}.${tenth}`
  }

  /** The stone's fall after the drop: along the face, two knocks, the floor at 0.76. */
  private stoneAt(u: number, out: THREE.Vector3) {
    const t = clamp((u - 0.22) / 0.54)
    const y0 = 0.42
    const y = y0 + (FLOOR + 0.12 - y0) * t * t
    const x = 299.82 + 0.5 * t
    // It drops close along the face; the knocks throw it out; it lands beyond the talus.
    const land = faceZ(300.2, FLOOR + 3) - 7.5
    let z = -2.25 - 0.5 * ss(0.34, 0.38, u) - 1.6 * ss(0.5, 0.56, u) + (land + 4.4) * Math.pow(ss(0.52, 0.76, u), 1.4)
    if (y > FLOOR + 3) z = Math.min(z, faceZ(x, y) - 0.25)
    return out.set(x, y, z)
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const sd = sunDir(PI - 0.55, 62 * DEG)
    env.sky.set(NOON, sd)
    const wide = seg !== 'rehearsal'
    env.setSun(wide ? new THREE.Vector3(300, -40, -18) : new THREE.Vector3(300, -0.5, -1.8), sd, 0xfff1dc, 2.8, wide ? 60 : 9)
    env.setHemi(0x9ab8e0, 0x7a6a50, 0.55)
    env.setFill(new THREE.Vector3(300, 3, -12), new THREE.Vector3(300, 0.4, -1.6), 0xd0dcf0, 0.45)
    env.setFog(0xaec2da, 0.0009)
    env.ibl('kloofendal_48d_partly_cloudy_puresky', 0.6, PI)
    cast.watch.show(this.digits(seg, u))

    const boy = cast.solids.boy12
    boy.begin()
    this.stone.visible = false
    this.lap.visible = false
    for (const k of this.knock) k.hide()
    this.puff.hide()
    switch (seg) {
      case 'cliff':
        this.cliff(d, boy)
        break
      case 'stone':
        this.stoneSeg(d, boy)
        break
      case 'rehearsal':
        this.rehearsal(d, boy)
        break
    }
    void cu
    void t
    void shot
  }

  private seat(boy: Actor) {
    boy.place(SEAT.x, SEAT.z, PI)
    boy.y = 0.0
  }

  private showLap(n: number) {
    if (n <= 0) return
    this.lap.visible = true
    this.lap.count = n
    const m = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      m.compose(this.v.set(SEAT.x - 0.05 + i * 0.05, 0.135 + (i % 2) * 0.012, SEAT.z - 0.22 - (i % 2) * 0.03), this.q.setFromEuler(new THREE.Euler(i, i * 2, 0)), new THREE.Vector3(1, 1, 1))
      this.lap.setMatrixAt(i, m)
    }
    this.lap.instanceMatrix.needsUpdate = true
  }

  private cliff(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    if (u < 0.62) {
      // Up over the last rocks, then across to the edge.
      const wu = ss(0.0, 0.62, u)
      boy.walk(this.climb, wu, P.STAND, undefined, PI, 0.9)
      boy.y = hTop(boy.x, boy.z)
      const climb = 1 - ss(0.08, 0.2, u)
      if (climb > 0) {
        const base = boy.pose.slice() as Float32Array
        for (let i = 0; i < base.length; i++) boy.pose[i] = base[i] + (PP.CLIMB[i] - P.STAND[i]) * climb * 0.8
      }
      d.step = boy.step
      d.walking = boy.walking
    } else {
      // He sits down at the edge, legs over, and scoops stones from the pile into his lap.
      const k = ss(0.62, 0.8, u)
      boy.place(lerp(300.35, SEAT.x, k), lerp(-1.15, SEAT.z, k), PI)
      boy.blend(
        [
          [0, P.STAND],
          [0.5, PP.KNEEL],
          [1, PP.SIT_EDGE],
        ],
        k,
      )
      const scoop = win(0.8, 0.85, 0.9, 0.96, u)
      boy.reach('r', scoop, PILE.x, 0.06, PILE.z, 0.3)
      boy.lookAt(PILE.x + 0.4, PILE.z + 0.6, scoop * 0.6)
      this.showLap(u > 0.9 ? 3 : u > 0.86 ? 1 : 0)
    }
    boy.apply(f.time, true)
    // Wide side view from out over the ravine; it follows him to the rim.
    const k = ss(0, 1, cu)
    shot.pos.set(lerp(309.6, 308.4, k), lerp(2.6, 1.8, k), lerp(-9.2, -8.4, k))
    shot.tgt.set(lerp(boy.x, 300.4, 0.4) + 0.3, lerp(-0.6, -1.6, k), lerp(boy.z, -1.6, 0.4) + 1.6)
    shot.fov = 50
    shot.handheld = 0.4
  }

  private stoneSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    this.seat(boy)
    boy.hold(PP.SIT_EDGE)
    // The left arm out over the edge with the stone; the right thumb on the watch button.
    // After the drop the arm rests on his thigh; at 0.72 he lifts the wrist to read the watch.
    const hold = 1 - ss(0.3, 0.42, u)
    const check = win(0.72, 0.8, 0.9, 0.95, u)
    const lt = this.v.set(lerp(299.85, 299.87, hold), lerp(0.18, 0.44, hold), lerp(-1.86, -2.2, hold))
    lt.set(lerp(lt.x, 299.86, check), lerp(lt.y, 0.6, check), lerp(lt.z, -1.98, check))
    boy.reach('l', 1, lt.x, lt.y, lt.z, 0.25)
    const press = Math.max(win(0.0, 0.06, 0.26, 0.34, u), check)
    // His right fingers on the left wrist (a little back from the hand, toward the elbow).
    boy.reach('r', press * (1 - ss(0.92, 0.95, u)), lt.x + 0.03, lt.y + 0.035, lt.z + 0.085, 0.3)
    // He picks up the next stone and weighs it.
    const next = ss(0.94, 0.99, u)
    if (next > 0) boy.reach('r', next, PILE.x - 0.06 * next, 0.06 + 0.3 * ss(0.975, 1, u), PILE.z - 0.3 * ss(0.975, 1, u), 0.3)
    boy.lookAt(299.6, -3.0, 0.3 * (1 - check))
    // Looking down after the stone; at the watch.
    boy.pose[2 + 4 * 3] += 0.35 * ss(0.22, 0.3, u) * (1 - check) + 0.3 * check
    boy.apply(f.time, true)
    this.showLap(3)

    // The stone: in his hand, then falling along the face.
    const st = this.stone
    st.visible = true
    if (u < 0.22) {
      boy.figure.lGrip.getWorldPosition(this.v)
      st.position.copy(this.v)
      st.position.y -= 0.01
      st.rotation.set(0.3, 1.1, 0.2)
    } else if (u < 0.76) {
      this.stoneAt(u, st.position)
      st.rotation.set(u * 40, u * 23, u * 31)
      const s = 1 + 0.6 * ss(0.3, 0.7, u)
      st.scale.setScalar(s)
    } else st.visible = false
    // Two knocks against the face, the dust puff on the floor.
    for (const [i, at] of [
      [0, 0.34],
      [1, 0.5],
    ] as const) {
      const p = this.stoneAt(at, this.n)
      this.knock[i].set(p.x, p.y, p.z + 0.3, (u - at) / 0.08, { r: 0.5, h: 0.4, fall: 1.2, opacity: 0.8 })
    }
    this.puff.set(300.2, FLOOR + 0.1, this.stoneAt(0.759, this.n).z, (u - 0.755) / 0.2, { r: 2.2, h: 1.4, drift: [0.6, 0.4, 0], opacity: 0.85 })

    // Camera.
    if (cu < 0.22) {
      // Over his right shoulder: the hand, the stone, the watch.
      shot.pos.set(300.42, 0.66, -1.12)
      shot.tgt.set(299.88, 0.4, -2.12)
      shot.fov = 32
      shot.handheld = 0.3
    } else if (cu < 0.8) {
      // Following the stone down the face, the stone in the upper third.
      const sp = this.stoneAt(Math.min(u, 0.758), this.v)
      const y = Math.max(sp.y, FLOOR + 4)
      const k = ss(0.22, 0.32, cu)
      shot.pos.set(lerp(300.42, 302.6, k), lerp(0.66, y + 4.2, k), lerp(-1.12, -8.2, k))
      shot.tgt.set(lerp(299.88, sp.x, k), lerp(0.4, y - 7, k), lerp(-2.12, sp.z + 0.6, k))
      shot.fov = lerp(32, 45, k)
      shot.handheld = 0.2
    } else if (cu < 0.92) {
      // The watch: 00:04.6.
      const wf = boy.figure.root.getObjectByName('watch-face')
      if (wf) {
        wf.getWorldPosition(this.v)
        wf.getWorldQuaternion(this.q)
        this.n.set(0, 0, 1).applyQuaternion(this.q)
        shot.pos.copy(this.v).addScaledVector(this.n, 0.16)
        shot.pos.y += 0.03
        shot.tgt.copy(this.v)
      }
      shot.fov = 30
      shot.handheld = 0.2
    } else {
      // His face over the rim.
      boy.figure.joints.head.getWorldPosition(this.v)
      shot.pos.set(this.v.x + 0.35, this.v.y - 0.12, this.v.z - 0.75)
      shot.tgt.set(this.v.x - 0.08, this.v.y + 0.02, this.v.z)
      shot.fov = 34
      shot.handheld = 0.3
    }
  }

  private rehearsal(d: Dir, boy: Actor) {
    const { u, cu, f, shot, cast } = d
    this.seat(boy)
    // Leaning out, hands on the rim; at 0.45 he sits back and takes the next stone.
    const lean = ss(0.04, 0.28, u) * (1 - ss(0.45, 0.62, u))
    boy.blend(
      [
        [0, PP.SIT_EDGE],
        [1, PP.LEAN_OUT],
      ],
      lean,
    )
    boy.reach('l', lean, 299.72, 0.03, rimZ(299.72) + 0.12, 0.3)
    boy.reach('r', lean, 300.28, 0.03, rimZ(300.28) + 0.12, 0.3)
    const take = ss(0.66, 0.78, u)
    if (take > 0) boy.reach('r', take * (1 - ss(0.86, 0.96, u)), PILE.x - 0.02, 0.05, PILE.z, 0.3)
    boy.apply(f.time, true)
    this.showLap(2)

    // The split at 0.3: the other one leans past the balance point and slides off.
    if (u >= 0.3 && u < 0.6) {
      const gh = cast.ghosts.stones
      cast.ghost(
        gh,
        u,
        (a, uu) => {
          const tt = Math.max(0, uu - 0.3)
          a.place(SEAT.x, SEAT.z, PI)
          a.blend(
            [
              [0, PP.LEAN_OUT],
              [0.05, PP.LEAN_OUT],
              [0.14, PP.FALL],
            ],
            tt,
          )
          this.ghostT = tt
          const y = -30 * Math.pow(tt / 0.25, 2)
          return 0.34 * (1 - ss(-18, -30, y))
        },
        f.time,
        {
          flash: u < 0.33 ? 1 - (u - 0.3) / 0.03 : 0,
          trail: 0.012,
          alpha: true,
          after: (a) => {
            const tt = this.ghostT
            const tip = Math.min(1.9, tt * 14)
            const y = -30 * Math.pow(tt / 0.25, 2)
            const out = -Math.min(0.9, tt * 5)
            carry(a.figure, pivotFrame(SEAT.x, 0.05, -1.95, -tip, 0, 0.12 * tip, 0, y, out, this.frameM))
          },
        },
      )
    }
    keyed(SHOTS.rehearsal, cu, shot)
    shot.handheld = 0.35
  }
}
