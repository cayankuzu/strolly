/**
 * I — the hollow mountain slope (x 600): a goat path across a 30° scree
 * slope; between x 598 and 606 the path is only a thin crust over an
 * eroded black hollow. Pebbles trickle into the dark under a sneaker; the
 * ground bargains; under the other one it gives.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { makePath } from '../../figure/paths'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { mesh } from '../../util'
import { PI, DEG, fbm, rng, ss, win, instances, setInstance, type Ctx, type Dir, type PSet } from '../common'
import { gridSurface, tuftGeometry } from '../geo'
import { carry, pivotFrame } from '../rig'
import { Burst } from '../fx'
import * as P from '../../figure/poses'
import { addWalk } from '../../figure/Figure'
import { sunDir, type SkyPreset } from '../env'

const X = 600
const C0 = 598
const C1 = 606
const PATCH0 = 602.8
const PATCH1 = 604.2
const HOLLOW = -2.2
const DUSTY: SkyPreset = { zenith: 0x5a7aa8, horizon: 0xe0bc8a, below: 0x6a5a48, haze: 0xd6b07e, hazeAmt: 0.75, sunColor: 0xffc27a, disc: 4, glow: 1.1, cloud: 0.22, cloudLit: 0xffd6a2, cloudShade: 0x9a8a88, power: 1.1 }
const GREY: SkyPreset = { zenith: 0x5e646c, horizon: 0x9a9ea2, below: 0x55575a, haze: 0x9a9ea2, hazeAmt: 0.7, sunColor: 0xa0a4a8, disc: 0, glow: 0.2, cloud: 0.5, cloudLit: 0xb4b8bc, cloudShade: 0x6a7076, power: 0.9 }

/** The slope without the hollow: uphill at ~35° above the path, downhill at 30° below it. */
export function hSlope(x: number, z: number) {
  const n = 0.12 * fbm(x * 0.4, z * 0.4, 3, 5) + 1.4 * fbm(x * 0.03, z * 0.03, 3, 7) * ss(3, 14, Math.abs(z))
  const up = z > 0.6 ? (z - 0.6) * Math.tan(35 * DEG) : 0
  const down = z < -0.6 ? -(-0.6 - z) * Math.tan(30 * DEG) : 0
  // The far gully: the slope eases out 80 m down.
  const ease = z < -120 ? (-120 - z) * Math.tan(30 * DEG) * 0.8 : 0
  return up + down + ease + n * (Math.abs(z) < 0.7 ? 0.15 : 1)
}

/** Weight of the hollow at x (1 inside the crust span, easing out over 0.4 m). */
const inHollow = (x: number) => ss(C0 - 0.4, C0 + 0.1, x) * (1 - ss(C1 - 0.1, C1 + 0.4, x))

/** The ground with the hollow cut under the path. */
function hGround(x: number, z: number) {
  const base = hSlope(x, z)
  const w = inHollow(x)
  if (w <= 0) return base
  // Floor of the void from the mouth back to 2 m into the slope; a steep back wall.
  let hz: number
  if (z > 1.6) hz = base
  else if (z > 1.35) hz = lerp(HOLLOW, base, ss(1.35, 1.6, z))
  else hz = Math.min(base, HOLLOW + 0.15 * fbm(x * 2, z * 2, 2, 9))
  return lerp(base, hz, w)
}

/** Where the walker's sneakers are (+x along the path). */
const SHOTS: Record<string, ShotKeys> = {
  slope: [
    [0, [598.4, -1.75, -2.7, 597.6, 0.5, 0.1, 46]],
    [1, [599.6, -1.6, -2.5, 600.0, 0.45, 0.0, 46]],
  ],
  // Further along the path and a little up: the patch, the walk onto the rock, the hole opening.
  bargainB: [
    [0, [610.3, 2.5, 1.7, 603.9, -0.3, -0.15, 45]],
    [1, [610.1, 2.55, 1.6, 604.4, -0.2, -0.15, 45]],
  ],
  fell: [
    [0, [604.6, 3.7, 3.7, 603.5, -0.8, 0, 45]],
    [1, [604.5, 3.5, 3.4, 603.5, -0.8, 0, 44]],
  ],
}

export class SlopeSet implements PSet {
  readonly group = new THREE.Group()
  private patch = new THREE.Group()
  private pebbles!: THREE.InstancedMesh
  private pebbleSeed: number[] = []
  private dust = new Burst(420, 0xc49a5c, 0.3, false, 61)
  private settle = new Burst(200, 0xbca07a, 0.2, false, 63)
  private frameM = new THREE.Matrix4()
  private gx = 0
  private gy = 0
  private walk = makePath([
    [594.6, 0.05],
    [597.5, 0.02],
    [600.5, 0.0],
  ])
  private walkOn = makePath([
    [600.5, 0.0],
    [601.5, 0.02],
    [602.5, 0.0],
    [603.5, 0.0],
    [604.5, 0.0],
    [605.5, 0.02],
    [606.6, 0.05],
  ])

  build(c: Ctx) {
    const g = this.group
    const rand = rng(6006)
    const ochre = new THREE.Color(0xc49a5c)
    const scree = new THREE.Color(0x7d6e5e)
    const xs = Array.from({ length: 241 }, (_, i) => {
      const t = i / 240
      const k = Math.sign(t - 0.5) * Math.pow(Math.abs(t - 0.5) * 2, 2.2)
      return X + 2 + 140 * k
    })
    const zs = Array.from({ length: 181 }, (_, j) => {
      const t = j / 180
      const k = Math.sign(t - 0.45) * Math.pow(Math.abs(t - 0.45) / (t < 0.45 ? 0.45 : 0.55), 2.0)
      return k < 0 ? 200 * k : 120 * k
    })
    const ground = gridSurface(
      xs.length - 1,
      zs.length - 1,
      (i, j, out) => out.set(xs[i], hGround(xs[i], zs[j]), zs[j]),
      1,
      (i, j, p, out) => {
        const n = fbm(p.x * 0.18, p.z * 0.18, 3, 21)
        out.copy(scree).lerp(ochre, ss(-0.2, 0.3, n))
        out.multiplyScalar(0.62 + 0.18 * fbm(p.x * 1.2, p.z * 1.2, 2, 23))
        // The hollow is black inside.
        const w = inHollow(p.x)
        if (w > 0 && p.z < 1.55 && p.z > -0.8 && p.y < -0.25) out.multiplyScalar(lerp(1, 0.04, w * ss(-0.4, 0.4, p.z)))
        // The worn path: lighter, compacted.
        if (Math.abs(p.z) < 0.6 && p.y > -0.2) out.lerp(new THREE.Color(0xa88a62), 0.4)
      },
    )
    const groundMesh = mesh(ground, pbr('gravel', 0xffffff, { vertexColors: true, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0, g)
    groundMesh.receiveShadow = true
    groundMesh.castShadow = true
    groundMesh.name = 'slope'

    // The crust: the path's top skin over the hollow, 0.3 m thick, with a ragged front lip.
    const crustTop = new THREE.Color(0xa88a62)
    const crustMat = pbr('gravel', 0xffffff, { vertexColors: true, roughness: 1, side: THREE.DoubleSide })
    const crust = (x0: number, x1: number, parent: THREE.Object3D, seed: number) => {
      const nx = Math.max(4, Math.round((x1 - x0) * 10))
      const nz = 22
      // Top skin from the lip (z −0.6) back into the slope (z 1.8), following the unhollowed ground.
      const top = gridSurface(
        nx,
        nz,
        (i, j, out) => {
          const x = lerp(x0, x1, i / nx)
          const z = lerp(-0.6 + 0.1 * fbm(x * 3, 1, 2, seed), 1.8, j / nz)
          out.set(x, hSlope(x, z) + 0.012, z)
        },
        1,
        (i, j, p, out) => out.copy(crustTop).multiplyScalar(0.7 + 0.2 * fbm(p.x * 1.4, p.z * 1.4, 2, seed + 2)),
      )
      mesh(top, crustMat, 0, 0, 0, parent).castShadow = true
      // The front lip, ragged underneath.
      const lip = gridSurface(
        nx,
        3,
        (i, j, out) => {
          const x = lerp(x0, x1, i / nx)
          const z = -0.6 + 0.1 * fbm(x * 3, 1, 2, seed)
          const thick = 0.24 + 0.12 * fbm(x * 5, 2, 2, seed + 4)
          out.set(x, hSlope(x, z) + 0.012 - (j / 3) * thick, z + 0.06 * (j / 3))
        },
        1,
        (i, j, p, out) => out.setRGB(0.42, 0.34, 0.26).multiplyScalar(1 - (j / 3) * 0.5),
      )
      mesh(lip, crustMat, 0, 0, 0, parent).castShadow = true
      // Underside, dark.
      const under = gridSurface(nx, 6, (i, j, out) => {
        const x = lerp(x0, x1, i / nx)
        const z = lerp(-0.54, 1.5, j / 6)
        out.set(x, hSlope(x, z) - 0.3 - 0.05 * fbm(x * 4, z * 4, 2, seed + 6), z)
      })
      mesh(under, new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0, parent)
    }
    const crustA = new THREE.Group()
    crust(C0 - 0.05, PATCH0, crustA, 3)
    crust(PATCH1, C1 + 0.05, crustA, 5)
    crustA.name = 'crust'
    g.add(crustA)
    crust(PATCH0, PATCH1, this.patch, 7)
    this.patch.name = 'crust-patch'
    g.add(this.patch)

    // The rock outcrop the path runs onto.
    if (c.models.rockFace) {
      const r = c.models.rockFace.clone(true)
      r.scale.set(0.9, 0.8, 0.75)
      r.rotation.y = -PI / 2
      r.position.set(608.4, -2.4, 0.4)
      g.add(r)
      const r2 = c.models.rockFace.clone(true)
      r2.scale.set(0.7, 0.9, 0.7)
      r2.rotation.y = 2.6
      r2.position.set(609.5, -0.5, 3.4)
      g.add(r2)
    }
    if (c.models.boulder)
      for (const [x, z, s, yaw] of [
        [607.4, -1.8, 1.3, 0.5],
        [592.4, -6.0, 1.0, 1.4],
        [613.6, 4.4, 1.4, 2.2],
        [596.2, 4.2, 0.8, 0.2],
        [588.0, -14, 2.2, 1.1],
        [615.0, -10, 1.8, 2.6],
      ] as const) {
        const b = c.models.boulder.clone(true)
        b.scale.setScalar(s)
        b.position.set(x, hSlope(x, z) - 0.25 * s, z)
        b.rotation.y = yaw
        g.add(b)
      }
    // A flat rock top for the path where it leaves the crust.
    const slab = mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.5, 9), pbr('rock', 0x8a7a68, { roughness: 1 }), 607.0, -0.22, 0.05, g)
    slab.scale.set(1, 1, 0.75)
    slab.receiveShadow = true
    slab.castShadow = true
    slab.name = 'outcrop'

    // Scree stones, sparse dry grass.
    const stoneGeo = new THREE.DodecahedronGeometry(0.12, 0)
    g.add(
      instances(
        stoneGeo,
        pbr('rock', 0x8a7a68, { roughness: 1 }),
        900,
        () => {
          const x = X - 40 + rand() * 80
          const z = -1 - Math.pow(rand(), 1.4) * 40
          if (inHollow(x) > 0 && z > -4.5) return null
          return [x, hGround(x, z) + 0.02, z, rand() * PI, 0.4 + rand() * 1.4, rand(), rand(), 0.5 + rand() * 0.6]
        },
        { shadow: true },
      ),
    )
    g.add(
      instances(
        tuftGeometry(6, 0.3, 9),
        new THREE.MeshStandardMaterial({ color: 0xb8a060, roughness: 1, side: THREE.DoubleSide }),
        900,
        () => {
          const x = X - 30 + rand() * 60
          const z = rand() < 0.6 ? 0.9 + rand() * 14 : -1 - rand() * 14
          if (Math.abs(z) < 0.8 || (inHollow(x) > 0 && z < 2 && z > -4)) return null
          return [x, hGround(x, z) - 0.02, z, rand() * PI * 2, 0.6 + rand() * 0.7]
        },
        { color: (i, out) => out.setHSL(0.11 + rand() * 0.04, 0.35, 0.42 + rand() * 0.15) },
      ),
    )

    // Pebbles trickling off the lip into the dark.
    this.pebbles = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.018, 0), pbr('rock', 0x9a8a72, { roughness: 1 }), 30)
    this.pebbles.frustumCulled = false
    this.pebbles.name = 'pebbles'
    for (let i = 0; i < 30 * 3; i++) this.pebbleSeed.push(rand())
    g.add(this.pebbles, this.dust.points, this.settle.points)
  }

  /** Pebbles dropping off the lip near x (looped by time while `on`). */
  private trickle(x: number, t: number, on: number) {
    const im = this.pebbles
    im.visible = on > 0.01
    if (!im.visible) return
    const s = this.pebbleSeed
    for (let i = 0; i < 30; i++) {
      const per = 0.9 + s[i * 3] * 0.8
      const ph = (t / per + s[i * 3 + 1]) % 1
      const px = x + (s[i * 3 + 2] - 0.5) * 0.7
      const y = -0.04 - 4.9 * Math.pow(ph * per * 0.75, 2)
      const z = -0.6 + 0.02 - ph * 0.12
      setInstance(im, i, px, Math.max(HOLLOW, y), z, ph * 9, ph * 7, 0, ph < 0.97 ? on : 0)
    }
    im.instanceMatrix.needsUpdate = true
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const grey = seg === 'earthFell'
    const sd = sunDir(PI / 2 - 0.2, 18 * DEG)
    env.sky.set(grey ? GREY : DUSTY, sd)
    env.setSun(new THREE.Vector3(602, -0.5, 0), sd, grey ? 0xb0b4b8 : 0xffc68a, grey ? 0.8 : 3.0, 12)
    env.setHemi(grey ? 0x9aa0a8 : 0x9ab0d0, grey ? 0x4a4a4a : 0x8a6a48, grey ? 0.9 : 0.7)
    env.setFill(new THREE.Vector3(600, 3, -14), new THREE.Vector3(602, 0, 0), grey ? 0x8a9098 : 0xb8a890, 0.45)
    env.setFog(grey ? 0x8e9298 : 0xcaa880, grey ? 0.012 : 0.0035)
    env.ibl(grey ? 'kloofendal_48d_partly_cloudy_puresky' : 'belfast_sunset_puresky', grey ? 0.4 : 0.5, -PI / 2)
    if (grey) env.grade.value = 1

    // The patch: whole until 0.62 of `bargain`, then it drops into the hollow; gone after.
    const collapse = seg === 'bargain' ? ss(0.62, 0.72, u) : seg === 'earthFell' ? 1 : 0
    this.patch.visible = collapse < 0.999
    if (this.patch.visible) {
      const fall = collapse * collapse
      this.patch.position.set(0.04 * fall, -2.4 * fall, 0.2 * fall)
      this.patch.rotation.set(-0.4 * fall, 0, 0.25 * fall)
    }
    this.dust.set(603.5, HOLLOW + 0.8, -0.2, seg === 'bargain' ? (u - 0.62) / 0.4 : -1, { r: 1.8, h: 3.6, drift: [0.8, 1.4, -1.2], opacity: 1.0 })
    this.settle.set(603.5, -1.0, 0.0, grey ? 0.55 + 0.1 * Math.sin(t * 0.3) : -1, { r: 2.6, h: 1.0, drift: [0.4, -0.4, -0.8], opacity: 0.5 })

    const boy = cast.solids.boy15
    boy.begin()
    if (seg === 'slope') {
      boy.walk(this.walk, ss(0, 1, u), P.STAND, PI / 2, PI / 2, 0.9)
      boy.y = 0.01
      boy.lookAt(boy.x + 2, -1.5, 0.35)
      this.trickle(boy.x + 0.2, t, ss(0.5, 0.7, u) * inHollow(boy.x + 0.2))
    } else if (seg === 'bargain') this.bargain(d, boy)
    else boy.visible = false
    boy.apply(t, true)
    if (seg !== 'earthFell') {
      d.step = boy.step
      d.walking = boy.walking
    }

    // The split: the other one stays on the patch, shifts its weight, one more step; it goes down with it.
    if (seg === 'bargain' && u >= 0.5 && u < 0.8) {
      cast.ghost(
        cast.ghosts.slope,
        u,
        (a, uu) => {
          const step = ss(0.57, 0.61, uu)
          this.gx = lerp(603.5, 603.95, step)
          const fall = ss(0.62, 0.75, uu)
          this.gy = -2.6 * fall * fall
          a.place(this.gx, 0, PI / 2)
          a.hold(P.STAND)
          // The small bounce of weight at 0.56.
          a.pose[0] -= 0.04 * win(0.54, 0.56, 0.56, 0.58, uu)
          a.pose[2 + 11 * 3] -= 0.35 * Math.sin(step * PI)
          a.pose[2 + 12 * 3] += 0.5 * Math.sin(step * PI)
          a.pose[2 + 4 * 3] += 0.25
          return 0.38 * (1 - ss(0.66, 0.76, uu))
        },
        t,
        {
          flash: u < 0.53 ? 1 - (u - 0.5) / 0.03 : 0,
          alpha: true,
          after: (a) => carry(a.figure, pivotFrame(this.gx, 0, 0, -0.3 * clamp((u - 0.62) / 0.1), 0, 0, 0, this.gy, 0, this.frameM)),
        },
      )
    }

    // Camera.
    if (seg === 'slope') {
      keyed(SHOTS.slope, cu, shot)
      shot.tgt.x = lerp(shot.tgt.x, boy.x + 0.4, 0.6)
      shot.handheld = 0.5
    } else if (seg === 'bargain') {
      if (cu < 0.44) {
        // Low on the downhill side, under the lip: the sneaker on the crust, pebbles into the dark.
        const k = ss(0, 0.44, cu)
        shot.pos.set(lerp(600.95, 601.8, k), -0.4, -2.2)
        shot.tgt.set(lerp(601.5, 602.35, k), 0.0, -0.25)
        shot.fov = 34
        shot.handheld = 0.4
      } else {
        keyed(SHOTS.bargainB, (cu - 0.44) / 0.56, shot)
        shot.handheld = 0.45
      }
    } else {
      keyed(SHOTS.fell, cu, shot)
      shot.handheld = 0.15
    }
  }

  private bargain(d: Dir, boy: Actor) {
    const { u, f } = d
    const t = f.time
    // Short careful steps: 601.5 (0–0.2), 602.5 (0.3–0.42), 603.5 (0.5), then on to the rock by 0.62.
    let x: number
    if (u < 0.12) x = lerp(600.5, 601.5, ss(0.0, 0.12, u))
    else if (u < 0.3) x = 601.5
    else if (u < 0.42) x = lerp(601.5, 602.5, ss(0.3, 0.42, u))
    else if (u < 0.5) x = lerp(602.5, 603.5, ss(0.42, 0.5, u))
    else x = lerp(603.5, 606.6, ss(0.5, 0.62, u))
    boy.place(x, 0.02, PI / 2)
    boy.hold(P.STAND)
    const moving = u < 0.12 || (u > 0.3 && u < 0.62)
    addWalk(boy.pose, (x - 600.5) * 4.2, moving ? 0.8 : 0)
    boy.step = Math.floor(((x - 600.5) * 4.2) / PI)
    boy.walking = moving ? 0.8 : 0
    // The foot sinks a little into the crumbling edge.
    boy.y = 0.01 - 0.02 * win(0.12, 0.2, 0.3, 0.34, u)
    boy.pose[2 + 4 * 3] += 0.3
    // On the rock he turns and looks back at the hole.
    if (u > 0.64) {
      const k = ss(0.64, 0.78, u)
      boy.yaw = lerp(PI / 2, -PI / 2 + 0.25, k)
      boy.lookAt(603.5, -0.6, k)
      boy.y = 0.03
    }
    this.trickle(601.5 + (u > 0.3 ? 1 : 0), t, win(0.04, 0.1, 0.44, 0.5, u))
  }
}
