/**
 * Story-local building parts: double-faced walls with openings, window and
 * door frames, picket fences, round trees, bikes, a dog, a bird, a rocking
 * chair, the suburb's identical houses (merged per material, for instancing).
 * The simulation's rule holds here: every edge is bevelled.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '@/lib/math'
import { rbox, rgeo, tube } from '../kit/props'
import { cyl, mesh } from '../util'

/** Merge input: indexed geometries are flattened, the rest pass through. */
const flat = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g)

type M = THREE.Material

export type Hole = { at: number; width: number; bottom?: number; height: number }

/**
 * A wall from (x0, z0) to (x1, z1): `a` faces the left-hand normal (−dz, dx),
 * `b` the other side. Openings are measured along the wall from (x0, z0).
 */
export function wall(parent: THREE.Object3D, x0: number, z0: number, x1: number, z1: number, y0: number, h: number, mats: { a: M; b: M; edge?: M }, holes: Hole[] = [], t = 0.12) {
  const dx = x1 - x0
  const dz = z1 - z0
  const len = Math.hypot(dx, dz)
  const g = new THREE.Group()
  g.position.set(x0, y0, z0)
  g.rotation.y = Math.atan2(-dz, dx)
  parent.add(g)
  const edge = mats.edge ?? mats.a
  // Face order of BoxGeometry: +x, −x, +y, −y, +z (a), −z (b).
  const faces = [edge, edge, edge, edge, mats.a, mats.b]
  const piece = (u0: number, u1: number, v0: number, v1: number) => {
    if (u1 - u0 < 0.005 || v1 - v0 < 0.005) return
    const m = new THREE.Mesh(new THREE.BoxGeometry(u1 - u0, v1 - v0, t), faces)
    m.position.set((u0 + u1) / 2, (v0 + v1) / 2, 0)
    m.castShadow = true
    m.receiveShadow = true
    g.add(m)
  }
  let u = 0
  for (const o of [...holes].sort((a, b) => a.at - b.at)) {
    const a = o.at - o.width / 2
    const b = o.at + o.width / 2
    piece(u, a, 0, h)
    const bottom = o.bottom ?? 0
    piece(a, b, 0, bottom)
    piece(a, b, bottom + o.height, h)
    u = b
  }
  piece(u, len, 0, h)
  return g
}

/** A window frame with a sill, a cross muntin and its glass, in a wall frame (x along the wall, z out of side a). */
export function windowIn(parent: THREE.Object3D, o: { w: number; h: number; trim: M; glass: M; depth?: number; muntin?: boolean; sill?: boolean; r?: number }) {
  const g = new THREE.Group()
  parent.add(g)
  const d = o.depth ?? 0.16
  const r = o.r ?? 0.012
  for (const sx of [-1, 1]) rbox(0.06, o.h + 0.06, d, o.trim, sx * (o.w / 2 + 0.0), o.h / 2, 0, g, r)
  rbox(o.w + 0.06, 0.06, d, o.trim, 0, o.h, 0, g, r)
  rbox(o.w + 0.06, 0.05, d, o.trim, 0, 0, 0, g, r)
  if (o.sill !== false) rbox(o.w + 0.2, 0.035, d + 0.12, o.trim, 0, -0.02, 0, g, r)
  if (o.muntin !== false) {
    rbox(0.035, o.h, 0.04, o.trim, 0, o.h / 2, 0, g, 0.008)
    rbox(o.w, 0.035, 0.04, o.trim, 0, o.h * 0.55, 0, g, 0.008)
  }
  const pane = mesh(new THREE.PlaneGeometry(o.w, o.h), o.glass, 0, o.h / 2, 0, g)
  pane.renderOrder = 2
  return g
}

/** A picket fence along x from x0 to x1 at z (pickets instanced), gaps where `gates` are. */
export function picketFence(parent: THREE.Object3D, x0: number, x1: number, z: number, mat: M, gates: Array<[number, number]> = [], h = 0.95) {
  const step = 0.14
  const pts: number[] = []
  for (let x = x0; x <= x1; x += step) if (!gates.some(([a, b]) => x > a && x < b)) pts.push(x)
  const shape = new THREE.Shape()
  shape.moveTo(-0.04, 0)
  shape.lineTo(0.04, 0)
  shape.lineTo(0.04, h - 0.06)
  shape.lineTo(0, h)
  shape.lineTo(-0.04, h - 0.06)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1 })
  geo.translate(0, 0, -0.011)
  const im = new THREE.InstancedMesh(geo, mat, pts.length)
  const m4 = new THREE.Matrix4()
  pts.forEach((x, i) => im.setMatrixAt(i, m4.makeTranslation(x, 0, z)))
  im.castShadow = true
  im.receiveShadow = true
  parent.add(im)
  // Rails between the gates.
  const runs: Array<[number, number]> = []
  let a = x0
  for (const [g0, g1] of [...gates].sort((p, q) => p[0] - q[0])) {
    runs.push([a, g0])
    a = g1
  }
  runs.push([a, x1])
  for (const [r0, r1] of runs) if (r1 - r0 > 0.2) for (const y of [0.28, h - 0.22]) rbox(r1 - r0, 0.07, 0.025, mat, (r0 + r1) / 2, y, z - 0.03, parent, 0.008)
  return im
}

/** Picket fence along z (rotated copy). */
export function picketFenceZ(parent: THREE.Object3D, z0: number, z1: number, x: number, mat: M, h = 0.95) {
  const g = new THREE.Group()
  g.position.set(x, 0, 0)
  g.rotation.y = -Math.PI / 2
  parent.add(g)
  picketFence(g, z0, z1, 0, mat, [], h)
  return g
}

/** Merged round trees (instanced canopy and trunk). Returns the two instanced meshes. */
export function roundTrees(parent: THREE.Object3D, spots: Array<[number, number, number]>, leaf: M, bark: M, seed = 3) {
  const rand = mulberry32(seed)
  const canopy = new THREE.IcosahedronGeometry(1, 3)
  const p = canopy.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = 1 + 0.06 * Math.sin(v.x * 7 + v.y * 5) + 0.05 * Math.sin(v.z * 9 - v.y * 4)
    v.multiplyScalar(n)
    p.setXYZ(i, v.x, v.y * 0.92, v.z)
  }
  canopy.computeVertexNormals()
  const trunk = new THREE.CylinderGeometry(0.09, 0.13, 1, 10)
  trunk.translate(0, 0.5, 0)
  const cm = new THREE.InstancedMesh(canopy, leaf, spots.length)
  const tm = new THREE.InstancedMesh(trunk, bark, spots.length)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  spots.forEach(([x, z, s], i) => {
    const r = s * (0.9 + rand() * 0.2)
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6)
    m4.compose(new THREE.Vector3(x, 1.2 * s + r * 0.85, z), q, new THREE.Vector3(r, r, r))
    cm.setMatrixAt(i, m4)
    m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(s, 1.2 * s + r * 0.4, s))
    tm.setMatrixAt(i, m4)
  })
  for (const im of [cm, tm]) {
    im.castShadow = true
    im.receiveShadow = true
    parent.add(im)
  }
  return { canopy: cm, trunk: tm }
}

/** Cone-trimmed tree (the Centre's garden). */
export function coneTrees(parent: THREE.Object3D, spots: Array<[number, number]>, leaf: M, bark: M) {
  const cone = new THREE.ConeGeometry(0.9, 3.2, 24, 4)
  cone.translate(0, 2.4, 0)
  const trunk = new THREE.CylinderGeometry(0.08, 0.1, 0.9, 10)
  trunk.translate(0, 0.45, 0)
  const cm = new THREE.InstancedMesh(cone, leaf, spots.length)
  const tm = new THREE.InstancedMesh(trunk, bark, spots.length)
  const m4 = new THREE.Matrix4()
  spots.forEach(([x, z], i) => {
    m4.makeTranslation(x, 0, z)
    cm.setMatrixAt(i, m4)
    tm.setMatrixAt(i, m4)
  })
  for (const im of [cm, tm]) {
    im.castShadow = true
    im.receiveShadow = true
    parent.add(im)
  }
  return cm
}

/** A bicycle (wheels along z), ~1.7 m long; origin on the ground between the wheels. */
export function bicycle(frame: M, tyre: M, metal: M) {
  const g = new THREE.Group()
  for (const z of [-0.52, 0.52]) {
    const w = mesh(new THREE.TorusGeometry(0.3, 0.022, 8, 28), tyre, 0, 0.32, z, g)
    w.rotation.y = Math.PI / 2
    const hub = cyl(0.025, 0.025, 0.08, metal, 0, 0.32, z, g, 10)
    hub.rotation.z = Math.PI / 2
  }
  tube(
    [
      [0, 0.32, -0.52],
      [0, 0.62, -0.18],
      [0, 0.36, 0.0],
      [0, 0.32, -0.52],
    ],
    0.018,
    frame,
    g,
    20,
  )
  tube(
    [
      [0, 0.36, 0.0],
      [0, 0.68, 0.36],
      [0, 0.32, 0.52],
    ],
    0.018,
    frame,
    g,
    16,
  )
  tube(
    [
      [0, 0.62, -0.18],
      [0, 0.68, 0.36],
    ],
    0.018,
    frame,
    g,
    6,
  )
  rbox(0.12, 0.04, 0.24, tyre, 0, 0.78, -0.22, g, 0.02)
  cyl(0.012, 0.012, 0.18, metal, 0, 0.7, -0.2, g, 8)
  const bar = cyl(0.012, 0.012, 0.5, metal, 0, 0.86, 0.38, g, 8)
  bar.rotation.z = Math.PI / 2
  cyl(0.014, 0.014, 0.2, metal, 0, 0.77, 0.37, g, 8)
  return g
}

/** A small dog (facing +z) whose legs can swing: returns the leg pivots. */
export function dog(coat: M, dark: M) {
  const g = new THREE.Group()
  const body = mesh(new THREE.CapsuleGeometry(0.13, 0.42, 6, 12), coat, 0, 0.42, 0, g)
  body.rotation.x = Math.PI / 2
  const head = new THREE.Group()
  head.position.set(0, 0.56, 0.32)
  g.add(head)
  mesh(new THREE.SphereGeometry(0.11, 16, 12), coat, 0, 0, 0, head)
  const snout = mesh(new THREE.CapsuleGeometry(0.05, 0.08, 4, 8), coat, 0, -0.03, 0.1, head)
  snout.rotation.x = Math.PI / 2
  mesh(new THREE.SphereGeometry(0.02, 8, 6), dark, 0, -0.02, 0.17, head)
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.05, 8, 6), dark, sx * 0.08, 0.06, -0.02, head)
    ear.scale.set(0.5, 1.2, 0.9)
  }
  const legs: THREE.Group[] = []
  for (const [x, z] of [
    [-0.08, 0.2],
    [0.08, 0.2],
    [-0.08, -0.2],
    [0.08, -0.2],
  ]) {
    const l = new THREE.Group()
    l.position.set(x, 0.38, z)
    g.add(l)
    const leg = mesh(new THREE.CapsuleGeometry(0.035, 0.28, 4, 8), coat, 0, -0.18, 0, l)
    leg.castShadow = true
    legs.push(l)
  }
  const tail = mesh(new THREE.CapsuleGeometry(0.025, 0.2, 4, 8), coat, 0, 0.52, -0.32, g)
  tail.rotation.x = -0.7
  g.traverse((o) => (o.castShadow = true))
  return { group: g, legs, head, tail }
}

/** A small bird (side profile along z). */
export function bird(body: M, dark: M) {
  const g = new THREE.Group()
  const b = mesh(new THREE.SphereGeometry(0.045, 12, 10), body, 0, 0.05, 0, g)
  b.scale.set(0.8, 0.8, 1.3)
  mesh(new THREE.SphereGeometry(0.03, 10, 8), body, 0, 0.09, 0.05, g)
  const beak = mesh(new THREE.ConeGeometry(0.008, 0.025, 6), dark, 0, 0.09, 0.085, g)
  beak.rotation.x = Math.PI / 2
  const tail = rbox(0.03, 0.006, 0.06, dark, 0, 0.055, -0.07, g, 0.002)
  tail.rotation.x = 0.4
  return g
}

/** A rocking chair facing +z (merged per material): rockers, seat, spindle back. */
export function rockingChairGeometry() {
  const parts: THREE.BufferGeometry[] = []
  const add = (g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, rz = 0) => {
    if (rx) g.rotateX(rx)
    if (rz) g.rotateZ(rz)
    g.translate(x, y, z)
    parts.push(flat(g))
  }
  for (const sx of [-0.24, 0.24]) {
    const rocker = new THREE.TorusGeometry(1.2, 0.018, 6, 24, 0.62)
    rocker.rotateZ(-Math.PI / 2 - 0.31)
    rocker.rotateY(Math.PI / 2)
    rocker.translate(sx, 1.22, 0)
    parts.push(flat(rocker))
    add(rgeo(0.035, 0.42, 0.035, 0.008), sx, 0.22, 0.2)
    add(rgeo(0.035, 1.05, 0.035, 0.008), sx, 0.5, -0.2, -0.12)
    add(rgeo(0.04, 0.03, 0.46, 0.008), sx, 0.62, 0.02)
  }
  add(rgeo(0.52, 0.04, 0.46, 0.012), 0, 0.44, 0.0)
  for (let i = 0; i < 6; i++) add(rgeo(0.025, 0.55, 0.025, 0.006), -0.18 + i * 0.072, 0.75, -0.24, -0.12)
  add(rgeo(0.54, 0.07, 0.04, 0.012), 0, 1.02, -0.28, -0.12)
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}

/** The suburb's house (front toward +z), merged by material: walls, trim, roof, glass, door, veranda floor. */
export function houseGeometries(w = 9, d = 7.5) {
  const walls: THREE.BufferGeometry[] = []
  const trim: THREE.BufferGeometry[] = []
  const roof: THREE.BufferGeometry[] = []
  const glass: THREE.BufferGeometry[] = []
  const door: THREE.BufferGeometry[] = []
  const deck: THREE.BufferGeometry[] = []
  const put = (list: THREE.BufferGeometry[], g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    if (rz) g.rotateZ(rz)
    if (rx) g.rotateX(rx)
    if (ry) g.rotateY(ry)
    g.translate(x, y, z)
    list.push(flat(g))
  }
  const H = 3.0
  put(walls, rgeo(w, H, d, 0.05), 0, H / 2, 0)
  put(trim, rgeo(w + 0.1, 0.32, d + 0.1, 0.04), 0, 0.16, 0)
  // Gable roof along x.
  const rise = 1.9
  const slope = Math.hypot(d / 2 + 0.5, rise)
  const ang = Math.atan2(rise, d / 2 + 0.5)
  for (const s of [-1, 1]) put(roof, rgeo(w + 0.6, 0.1, slope, 0.03), 0, H + rise / 2, (s * (d / 2 + 0.5)) / 2, s * ang)
  const gable = new THREE.Shape()
  gable.moveTo(-d / 2, 0)
  gable.lineTo(d / 2, 0)
  gable.lineTo(0, rise)
  gable.closePath()
  for (const sx of [-1, 1]) {
    const gg = new THREE.ShapeGeometry(gable)
    gg.rotateY(sx * Math.PI / 2)
    gg.translate(sx * (w / 2 + 0.002), H, 0)
    walls.push(flat(gg))
  }
  // Windows on the front (+z) and sides; the door.
  const win = (x: number, z: number, ry: number, ww = 1.2, wh = 1.4) => {
    const fr = new THREE.Group()
    put(glass, new THREE.PlaneGeometry(ww, wh), 0, 0, 0)
    const g = glass.pop()!
    g.rotateY(ry)
    g.translate(x, 1.75, z)
    glass.push(g)
    for (const sx of [-1, 1]) {
      const p = rgeo(0.08, wh + 0.1, 0.06, 0.015)
      p.translate(sx * (ww / 2 + 0.04), 0, 0)
      p.rotateY(ry)
      p.translate(x, 1.75, z)
      trim.push(flat(p))
    }
    for (const sy of [-1, 1]) {
      const p = rgeo(ww + 0.24, 0.08, 0.08, 0.015)
      p.translate(0, sy * (wh / 2 + 0.04), 0)
      p.rotateY(ry)
      p.translate(x, 1.75, z)
      trim.push(flat(p))
    }
    void fr
  }
  win(-2.6, d / 2 + 0.005, 0)
  win(2.6, d / 2 + 0.005, 0)
  win(w / 2 + 0.005, 0, Math.PI / 2)
  win(-w / 2 - 0.005, 0, -Math.PI / 2)
  put(door, rgeo(1.0, 2.1, 0.06, 0.02), 0, 1.35, d / 2 + 0.02)
  put(trim, rgeo(1.2, 0.1, 0.08, 0.02), 0, 2.45, d / 2 + 0.03)
  // Veranda: deck, posts, rail, a low roof.
  put(deck, rgeo(w - 1, 0.12, 2.0, 0.03), 0, 0.24, d / 2 + 1.0)
  for (const sx of [-1, 1]) {
    put(trim, rgeo(0.12, 2.6, 0.12, 0.03), sx * (w / 2 - 0.6), 1.55, d / 2 + 1.9)
    put(trim, rgeo(w / 2 - 1.3, 0.06, 0.05, 0.01), sx * (w / 4 + 0.05), 0.95, d / 2 + 1.92)
  }
  put(roof, rgeo(w - 0.6, 0.08, 2.4, 0.02), 0, 2.9, d / 2 + 1.1, 0.12)
  put(deck, rgeo(1.4, 0.15, 0.35, 0.03), 0, 0.075, d / 2 + 2.15)
  const merged = (l: THREE.BufferGeometry[]) => {
    const g = mergeGeometries(l)
    l.forEach((x) => x.dispose())
    return g
  }
  return { walls: merged(walls), trim: merged(trim), roof: merged(roof), glass: merged(glass), door: merged(door), deck: merged(deck) }
}

/** A mailbox on a post (door toward +z). */
export function mailboxGeometry() {
  const parts: THREE.BufferGeometry[] = []
  const post = rgeo(0.08, 1.05, 0.08, 0.01)
  post.translate(0, 0.52, 0)
  parts.push(flat(post))
  const boxG = new THREE.CapsuleGeometry(0.11, 0.3, 4, 12)
  boxG.rotateX(Math.PI / 2)
  boxG.scale(1, 0.9, 1)
  boxG.translate(0, 1.15, 0)
  parts.push(flat(boxG))
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}
