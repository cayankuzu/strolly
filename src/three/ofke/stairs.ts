/**
 * Set B — the stairwell: a 4.5 × 4.5 m concrete shaft centred on (40, ·, 0),
 * eight levels of 3.2 m (Z, 1 … 7). Switchback flights: from each floor
 * landing (south, z 1.05…2.25) a flight runs north down the east side to the
 * mid landing (north), the next runs south down the west side to the floor
 * below. A 1.6 m well between them, green steel rails, a tube light per
 * landing, huge stencilled floor numbers. The ground exit is in the south
 * wall at (40, 0, 2.25) with a push bar.
 *
 * `runPoint(s)` gives Arif's position on the way down from 7 to Z.
 */
import * as THREE from 'three'
import { box, cyl, mesh } from '../util'
import { canvasPlane, rbox, std } from '../kit/props'
import { pbr } from '../kit/surfaces'
import * as S from './screens'

const PI = Math.PI
export const SX = 40
export const LEVEL = 3.2
const RISE = 0.2
const TREAD = 0.3
const LABELS = ['Z', '1', '2', '3', '4', '5', '6', '7']

export class Stairs {
  readonly group = new THREE.Group()
  exitLeaf!: THREE.Group
  lights: THREE.Group[] = []
  outside!: THREE.Mesh

  build(models: { tube: THREE.Group | null }) {
    const g = this.group
    const concrete = pbr('concrete', 0x8c8d88, { roughness: 1 })
    const slab = pbr('concrete', 0x7a7b77, { roughness: 1 })
    const paintLow = pbr('painted', 0x6f8a7c, { roughness: 0.8 })
    const paintHigh = pbr('painted', 0xd8d9d0, { roughness: 1 })
    const rail = pbr('metal', 0x2f7a4a, { roughness: 0.5, metalness: 0.4 })
    const nosing = pbr('metal', 0xb8b2a0, { roughness: 0.5 })
    const top = 8 * LEVEL + 0.4
    // Shaft walls: painted green-grey to 1.2 m above each landing, off-white above.
    for (const [w, d, x, z] of [
      [4.5, 0.3, SX, -2.4],
      [0.3, 5.1, SX - 2.4, 0],
      [0.3, 5.1, SX + 2.4, 0],
    ] as const) {
      const wall = box(w, top, d, paintHigh, x, top / 2 - 0.2, z, g)
      wall.receiveShadow = true
    }
    // The south wall, with the ground exit cut into it.
    box(1.75, 2.32, 0.3, paintHigh, SX - 1.375, 0.96, 2.4, g).receiveShadow = true
    box(1.75, 2.32, 0.3, paintHigh, SX + 1.375, 0.96, 2.4, g).receiveShadow = true
    box(4.5, top - 2.32, 0.3, paintHigh, SX, (2.12 + top - 0.2) / 2, 2.4, g).receiveShadow = true
    // The green band of each level (a skin on the inner faces).
    for (let L = 0; L < 8; L++) {
      const y0 = L * LEVEL
      for (const [w, d, x, z] of [
        [4.5, 0.02, SX, -2.24],
        [4.5, 0.02, SX, 2.24],
        [0.02, 4.5, SX - 2.24, 0],
        [0.02, 4.5, SX + 2.24, 0],
      ] as const) {
        box(w, 1.25, d, paintLow, x, y0 + 0.62, z, g)
        box(w, 0.6, d, paintLow, x, y0 - 1.6 + 0.3, z, g)
      }
    }
    // Floor landings (south) and mid landings (north).
    const land = new THREE.InstancedMesh(new THREE.BoxGeometry(4.5, 0.22, 1.2), slab, 16)
    const m4 = new THREE.Matrix4()
    let li = 0
    for (let L = 0; L < 8; L++) {
      m4.makeTranslation(SX, L * LEVEL - 0.11, 1.65)
      land.setMatrixAt(li++, m4)
      if (L > 0) {
        m4.makeTranslation(SX, L * LEVEL - 1.6 - 0.11, -1.65)
        land.setMatrixAt(li++, m4)
      }
    }
    land.count = li
    land.receiveShadow = true
    land.castShadow = true
    g.add(land)
    // Steps and soffits, instanced.
    const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(1.45, RISE, TREAD), concrete, 7 * 14)
    const noses = new THREE.InstancedMesh(new THREE.BoxGeometry(1.45, 0.012, 0.04), nosing, 7 * 14)
    const soffits = new THREE.InstancedMesh(new THREE.BoxGeometry(1.45, 0.18, Math.hypot(2.1, 1.6) + 0.1), slab, 14)
    let si = 0
    let fi = 0
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const one = new THREE.Vector3(1, 1, 1)
    for (let L = 1; L < 8; L++) {
      const y0 = L * LEVEL
      for (const [x, dir, ys] of [
        [SX + 1.525, -1, y0],
        [SX - 1.525, 1, y0 - 1.6],
      ] as const) {
        for (let k = 0; k < 7; k++) {
          const yTop = ys - RISE * (k + 1)
          const z = -dir * 1.05 + dir * TREAD * (k + 0.5)
          m4.makeTranslation(x, yTop - RISE / 2, z)
          steps.setMatrixAt(si, m4)
          m4.makeTranslation(x, yTop + 0.006, z - dir * (TREAD / 2 - 0.02))
          noses.setMatrixAt(si, m4)
          si++
        }
        // The sloped soffit under the flight.
        const ang = Math.atan2(1.6, 2.1)
        q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), dir > 0 ? ang : -ang)
        v.set(x, ys - 0.8 - 0.22, 0)
        m4.compose(v, q, one)
        soffits.setMatrixAt(fi++, m4)
      }
    }
    for (const im of [steps, noses, soffits]) {
      im.castShadow = true
      im.receiveShadow = true
      g.add(im)
    }
    // Rails on the well side of each flight and round the landings.
    const posts: THREE.Matrix4[] = []
    for (let L = 1; L < 8; L++) {
      const y0 = L * LEVEL
      for (const [x, dir, ys] of [
        [SX + 0.8, -1, y0],
        [SX - 0.8, 1, y0 - 1.6],
      ] as const) {
        const z0 = -dir * 1.05
        const z1 = dir * 1.05
        tube(
          [
            [x, ys + 0.95, z0 - dir * 0.15],
            [x, ys + 0.95, z0],
            [x, ys - 1.6 + 0.95, z1],
            [x, ys - 1.6 + 0.95, z1 + dir * 0.15],
          ],
          0.024,
          rail,
          g,
        )
        for (let k = 0; k <= 6; k++) {
          const t = k / 6
          const z = z0 + (z1 - z0) * t
          const y = ys - 1.6 * t
          posts.push(new THREE.Matrix4().makeTranslation(x, y + 0.45, z))
        }
      }
      // Around the well at the floor landing and the mid landing.
      tube(
        [
          [SX - 0.8, y0 + 0.95, 1.05],
          [SX, y0 + 0.97, 1.05],
          [SX + 0.8, y0 + 0.95, 1.05],
        ],
        0.024,
        rail,
        g,
      )
      tube(
        [
          [SX - 0.8, y0 - 1.6 + 0.95, -1.05],
          [SX, y0 - 1.6 + 0.97, -1.05],
          [SX + 0.8, y0 - 1.6 + 0.95, -1.05],
        ],
        0.024,
        rail,
        g,
      )
    }
    const postMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6), rail, posts.length)
    posts.forEach((p, i) => postMesh.setMatrixAt(i, p))
    postMesh.castShadow = true
    g.add(postMesh)

    // Doors, numbers and lights on every level.
    const doorMat = pbr('painted', 0x5d6a72, { roughness: 0.6 })
    for (let L = 0; L < 8; L++) {
      const y0 = L * LEVEL
      const d = new THREE.Group()
      d.position.set(SX, y0, 2.25)
      d.rotation.y = PI
      g.add(d)
      for (const sx of [-1, 1]) rbox(0.06, 2.14, 0.12, doorMat, sx * 0.53, 1.07, 0, d, 0.004)
      rbox(1.12, 0.06, 0.12, doorMat, 0, 2.13, 0, d, 0.004)
      const leaf = new THREE.Group()
      leaf.position.set(-0.5, 0, 0)
      d.add(leaf)
      rbox(1.0, 2.08, 0.05, doorMat, 0.5, 1.04, 0, leaf, 0.004)
      // Push bar on the stair side.
      rbox(0.8, 0.05, 0.05, pbr('metal', 0xc8c8c0, { roughness: 0.3 }), 0.5, 1.0, 0.07, leaf, 0.012)
      if (L === 0) this.exitLeaf = leaf
      const exit = canvasPlane(0.42, 0.16, 256, S.exitSign, { emissive: true })
      exit.mesh.position.set(0, 2.42, 0.06)
      d.add(exit.mesh)
      // The stencilled number, big, on the east wall at the floor landing and the west wall below.
      const num = canvasPlane(1.0, 1.2, 256, (c, W, H) => S.floorNumber(c, W, H, LABELS[L]), { transparent: true })
      num.mesh.position.set(SX + 2.23, y0 + 1.55, 1.6)
      num.mesh.rotation.y = -PI / 2
      g.add(num.mesh)
      const num2 = canvasPlane(0.8, 0.96, 256, (c, W, H) => S.floorNumber(c, W, H, LABELS[L]), { transparent: true })
      num2.mesh.position.set(SX - 2.23, y0 + 1.45, 1.6)
      num2.mesh.rotation.y = PI / 2
      g.add(num2.mesh)
      // A tube light on the wall over each landing.
      for (const [y, z] of [
        [y0 + 2.6, 2.2],
        [y0 - 1.6 + 2.6, -2.2],
      ] as const) {
        if (L === 0 && z < 0) continue
        const lamp = new THREE.Group()
        lamp.position.set(SX, y, z)
        lamp.rotation.y = z > 0 ? PI : 0
        g.add(lamp)
        if (models.tube) {
          const t = models.tube.clone(true)
          t.rotation.x = PI / 2
          t.position.set(0, 0, 0.03)
          lamp.add(t)
        } else {
          rbox(1.2, 0.08, 0.1, std(0xdedede, 0.5), 0, 0, 0.05, lamp, 0.01)
          box(1.1, 0.04, 0.04, new THREE.MeshBasicMaterial({ color: 0xf2fff6 }), 0, -0.03, 0.07, lamp)
        }
        this.lights.push(lamp)
      }
    }
    // Outside the ground exit: the street at dusk, glimpsed.
    this.outside = mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.55, 0.35) }), SX, 2, 4.2, g)
    this.outside.rotation.y = PI
    // A ceiling on top.
    box(4.5, 0.2, 4.5, slab, SX, top - 0.1, 0, g)
    const floor = box(4.5, 0.1, 4.5, slab, SX, -0.05, 0, g)
    floor.receiveShadow = true
  }

  /** The leaf of the ground exit: 0 shut … 1 swung out. */
  setExit(open: number) {
    this.exitLeaf.rotation.y = open * 1.6
  }
}

function tube(points: Array<[number, number, number]>, r: number, mat: THREE.Material, parent: THREE.Object3D) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', 0.05)
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, r, 6, false), mat)
  m.castShadow = true
  parent.add(m)
  return m
}

/**
 * Arif's way down, as a function of s ∈ [0, 1] (level 7 to Z). Returns the
 * position, facing yaw and whether he is mid-leap (for the pose).
 */
export function runPoint(s: number, out: { x: number; y: number; z: number; yaw: number; leap: number; level: number }) {
  const legs = 7
  const t = Math.max(0, Math.min(0.99999, s)) * legs
  const L = 7 - Math.floor(t)
  const f = t - Math.floor(t)
  const y0 = L * LEVEL
  // Each level: landing → flight A (east, going −z) → mid landing → flight B (west, going +z).
  const pts: Array<[number, number, number]> = [
    [SX + 0.2, y0, 1.55],
    [SX + 1.5, y0, 1.15],
    [SX + 1.5, y0 - 1.6, -1.05],
    [SX + 1.2, y0 - 1.6, -1.65],
    [SX - 1.2, y0 - 1.6, -1.65],
    [SX - 1.5, y0 - 1.6, -1.05],
    [SX - 1.5, y0 - 3.2, 1.05],
    [SX - 1.1, y0 - 3.2, 1.55],
    [SX + 0.2, y0 - 3.2, 1.55],
  ]
  const lens: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2])
    lens.push(l)
    total += l
  }
  let d = f * total
  let i = 0
  while (i < lens.length - 1 && d > lens[i]) d -= lens[i++]
  const a = pts[i]
  const b = pts[i + 1]
  const k = lens[i] > 0 ? d / lens[i] : 0
  out.x = a[0] + (b[0] - a[0]) * k
  out.z = a[2] + (b[2] - a[2]) * k
  const onFlight = i === 1 || i === 4
  // On a flight he leaps: three, five steps at a time.
  let y = a[1] + (b[1] - a[1]) * k
  let leap = 0
  if (onFlight) {
    const hops = i === 1 ? 2 : 3
    const h = (k * hops) % 1
    leap = Math.sin(h * PI)
    y += leap * 0.28
  }
  out.y = y
  out.yaw = Math.atan2(b[0] - a[0], b[2] - a[2])
  out.leap = leap
  out.level = L
  return out
}

export { cyl }
