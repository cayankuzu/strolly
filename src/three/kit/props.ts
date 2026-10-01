/**
 * The set-dressing kit: rooms with trim, doors, furniture, electronics,
 * street pieces, people in the distance. Every piece is built to real
 * dimensions with softened edges (light catches a 2–5 mm bevel the way it
 * does on real objects) and dressed in procedural PBR surfaces (`surfaces.ts`).
 * Stories light and color their own place from the same parts.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { pbr } from './surfaces'

type M = THREE.Material

export const std = (color: number, roughness = 0.8, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra })

// ——— Shared small materials (hardware the stories do not color themselves) ———

let hw: ReturnType<typeof makeHardware> | null = null
function makeHardware() {
  return {
    chrome: pbr('metal', 0xc9ccd0, { roughness: 0.35 }),
    steel: pbr('metal', 0x8d9196, { roughness: 0.7 }),
    rubber: pbr('rubber', 0x1a1a1b),
    plasticDark: pbr('plastic', 0x1d1f22, { roughness: 0.8 }),
    plasticGrey: pbr('plastic', 0x5c6066, { roughness: 0.75 }),
    plasticLight: pbr('plastic', 0xd9d6cf, { roughness: 0.7 }),
    ledGreen: new THREE.MeshBasicMaterial({ color: 0x5dff9a }),
    ledAmber: new THREE.MeshBasicMaterial({ color: 0xffb347 }),
    ledBlue: new THREE.MeshBasicMaterial({ color: 0x7fb4ff }),
    tail: new THREE.MeshStandardMaterial({ color: 0x5a0a0a, emissive: 0x3a0303, roughness: 0.3 }),
    plate: pbr('plastic', 0xe9e7e0, { roughness: 0.5 }),
    soil: pbr('concrete', 0x2b2119, { roughness: 1 }),
    paper: pbr('paper', 0xf1ede4),
    glassClear: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.18, metalness: 0, depthWrite: false }),
  }
}
/** Hardware materials shared by every set (recreated after a story disposes them). */
export function hardware() {
  if (!hw) hw = makeHardware()
  return hw
}

// ——— Geometry helpers ———

/** A box with rounded edges (r in meters, clamped to the box). */
export function rgeo(w: number, h: number, d: number, r = 0.004, seg = 2) {
  const rr = Math.max(0.0005, Math.min(r, w / 2 - 0.0002, h / 2 - 0.0002, d / 2 - 0.0002))
  return new RoundedBoxGeometry(w, h, d, seg, rr)
}

export function rbox(w: number, h: number, d: number, mat: M, x = 0, y = 0, z = 0, parent?: THREE.Object3D, r = 0.004) {
  return mesh(rgeo(w, h, d, r), mat, x, y, z, parent)
}

/** A cable or bent rod along a curve through `points`. */
export function tube(points: Array<[number, number, number]>, radius: number, mat: M, parent?: THREE.Object3D, segments = 24) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
  return mesh(new THREE.TubeGeometry(curve, segments, radius, 6, false), mat, 0, 0, 0, parent)
}

/** A turned profile ([radius, height] pairs). */
export function turned(profile: Array<[number, number]>, mat: M, segments = 32, parent?: THREE.Object3D) {
  return mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments), mat, 0, 0, 0, parent)
}

/** A square leg tapering toward the floor. */
function taperedLeg(top: number, bottom: number, h: number, mat: M, x: number, z: number, parent: THREE.Object3D, y0 = 0) {
  const g = new THREE.CylinderGeometry(top * Math.SQRT1_2, bottom * Math.SQRT1_2, h, 4, 1)
  g.rotateY(Math.PI / 4)
  return mesh(g, mat, x, y0 + h / 2, z, parent)
}

export type Side = 'n' | 's' | 'e' | 'w'
export type Opening = { side: Side; at: number; width: number; height: number; bottom?: number }

/**
 * A box room centered on (x, z): floor, ceiling, four walls with openings,
 * skirting boards and casings around the openings. n is the −z wall, s the
 * +z wall, w the −x wall, e the +x wall. Walls sit outside the interior so the
 * inner faces are exactly on the bounds.
 */
export function room(o: { w: number; d: number; h: number; x?: number; z?: number; wall: M; floor: M; ceiling?: M | null; openings?: Opening[]; t?: number; skip?: Side[]; trim?: M | null }) {
  const g = new THREE.Group()
  const { w, d, h } = o
  const t = o.t ?? 0.15
  g.position.set(o.x ?? 0, 0, o.z ?? 0)
  const floor = mesh(new THREE.PlaneGeometry(w, d), o.floor, 0, 0, 0, g)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  if (o.ceiling) {
    const c = mesh(new THREE.PlaneGeometry(w, d), o.ceiling, 0, h, 0, g)
    c.rotation.x = Math.PI / 2
    c.receiveShadow = true
  }
  const trim = o.trim === null ? null : (o.trim ?? o.wall)
  const sides: Side[] = ['n', 's', 'w', 'e']
  for (const side of sides) {
    if (o.skip?.includes(side)) continue
    const along = side === 'n' || side === 's' ? w : d
    const holes = (o.openings ?? []).filter((op) => op.side === side).sort((a, b) => a.at - b.at)
    // Pieces along the wall in local coordinate u ∈ [−along/2, along/2].
    const pieces: Array<[number, number, number, number]> = [] // u0, u1, y0, y1
    const floorRuns: Array<[number, number]> = []
    let u = -along / 2
    for (const hole of holes) {
      const a = hole.at - hole.width / 2
      const b = hole.at + hole.width / 2
      if (a > u) {
        pieces.push([u, a, 0, h])
        floorRuns.push([u, a])
      }
      const bottom = hole.bottom ?? 0
      if (bottom > 0) {
        pieces.push([a, b, 0, bottom])
        floorRuns.push([a, b])
      }
      if (bottom + hole.height < h) pieces.push([a, b, bottom + hole.height, h])
      u = b
    }
    if (u < along / 2) {
      pieces.push([u, along / 2, 0, h])
      floorRuns.push([u, along / 2])
    }
    // Wall pieces in the wall's own frame: x along the wall, z into the room is +z.
    const frame = new THREE.Group()
    if (side === 'n') frame.position.set(0, 0, -d / 2)
    else if (side === 's') {
      frame.position.set(0, 0, d / 2)
      frame.rotation.y = Math.PI
    } else if (side === 'w') {
      frame.position.set(-w / 2, 0, 0)
      frame.rotation.y = Math.PI / 2
    } else {
      frame.position.set(w / 2, 0, 0)
      frame.rotation.y = -Math.PI / 2
    }
    g.add(frame)
    // In the s and w frames local x runs against u; flip so openings land where asked.
    const flip = side === 's' || side === 'w' ? -1 : 1
    for (const [u0, u1, y0, y1] of pieces) {
      const len = u1 - u0
      const height = y1 - y0
      if (len <= 0.001 || height <= 0.001) continue
      const piece = box(len, height, t, o.wall, flip * ((u0 + u1) / 2), y0 + height / 2, -t / 2, frame)
      piece.receiveShadow = true
      piece.castShadow = true
    }
    if (!trim) continue
    // Skirting along the floor, casings around each opening.
    for (const [u0, u1] of floorRuns) if (u1 - u0 > 0.05) rbox(u1 - u0, 0.08, 0.014, trim, flip * ((u0 + u1) / 2), 0.04, 0.007, frame, 0.003)
    for (const hole of holes) {
      const bottom = hole.bottom ?? 0
      const cx = flip * hole.at
      const top = bottom + hole.height
      if (top < h - 0.02) rbox(hole.width + 0.14, 0.07, 0.018, trim, cx, top + 0.035, 0.009, frame, 0.003)
      for (const s of [-1, 1]) rbox(0.07, hole.height + (bottom > 0 ? 0.07 : 0.035), 0.018, trim, cx + s * (hole.width / 2 + 0.035), bottom + hole.height / 2 + (bottom > 0 ? 0 : 0.0175), 0.009, frame, 0.003)
      // Window: sill and a reveal on the inside.
      if (bottom > 0) rbox(hole.width + 0.18, 0.03, 0.12, trim, cx, bottom - 0.015, 0.03, frame, 0.004)
    }
  }
  return g
}

/** A door in its frame; the leaf swings on `leaf.rotation.y` (hinge on the −x edge, closed facing +z). */
export function door(o: { w?: number; h?: number; frame: M; leaf: M; handle: M }) {
  const w = o.w ?? 0.9
  const h = o.h ?? 2.05
  const g = new THREE.Group()
  // Frame with a casing on each face.
  for (const sx of [-1, 1]) {
    rbox(0.05, h + 0.05, 0.13, o.frame, sx * (w / 2 + 0.025), (h + 0.05) / 2, 0, g, 0.004)
    for (const sz of [-1, 1]) rbox(0.075, h + 0.09, 0.016, o.frame, sx * (w / 2 + 0.05), (h + 0.09) / 2, sz * 0.073, g, 0.004)
  }
  rbox(w + 0.1, 0.05, 0.13, o.frame, 0, h + 0.025, 0, g, 0.004)
  for (const sz of [-1, 1]) rbox(w + 0.25, 0.075, 0.016, o.frame, 0, h + 0.09, sz * 0.073, g, 0.004)
  const leaf = new THREE.Group()
  leaf.position.set(-w / 2, 0, 0)
  const lw = w - 0.006
  rbox(lw, h - 0.008, 0.042, o.leaf, w / 2, h / 2, 0, leaf, 0.003)
  // Two raised panels on each face.
  for (const sz of [-1, 1])
    for (const [py, ph] of [
      [h * 0.72, h * 0.36],
      [h * 0.27, h * 0.38],
    ] as const)
      rbox(lw - 0.2, ph, 0.008, o.leaf, w / 2, py, sz * 0.022, leaf, 0.004)
  // Hinges on the hinge edge.
  const hwm = hardware()
  for (const hy of [0.22, h - 0.25]) cyl(0.008, 0.008, 0.1, hwm.steel, 0.004, hy, 0.022, leaf, 10)
  const handle = new THREE.Group()
  handle.position.set(w - 0.07, 1.0, 0)
  for (const sz of [-1, 1]) {
    cyl(0.026, 0.026, 0.008, o.handle, 0, 0, sz * 0.025, handle, 20).rotation.x = Math.PI / 2
    cyl(0.009, 0.009, 0.05, o.handle, 0, 0, sz * 0.05, handle, 12).rotation.x = Math.PI / 2
    const lever = rbox(0.12, 0.018, 0.02, o.handle, -0.05, 0, sz * 0.072, handle, 0.008)
    lever.rotation.z = 0.04
    // Keyhole escutcheon below.
    cyl(0.016, 0.016, 0.006, o.handle, 0, -0.08, sz * 0.024, handle, 16).rotation.x = Math.PI / 2
  }
  leaf.add(handle)
  g.add(leaf)
  return { group: g, leaf, handle }
}

/** A table: top with a softened edge, aprons, legs tapering to the floor. */
export function table(w: number, d: number, h: number, top: M, legs: M = top) {
  const g = new THREE.Group()
  rbox(w, 0.032, d, top, 0, h - 0.016, 0, g, 0.006)
  const inset = 0.055
  rbox(w - inset * 2, 0.07, 0.02, legs, 0, h - 0.068, d / 2 - inset, g, 0.003)
  rbox(w - inset * 2, 0.07, 0.02, legs, 0, h - 0.068, -d / 2 + inset, g, 0.003)
  rbox(0.02, 0.07, d - inset * 2, legs, w / 2 - inset, h - 0.068, 0, g, 0.003)
  rbox(0.02, 0.07, d - inset * 2, legs, -w / 2 + inset, h - 0.068, 0, g, 0.003)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) taperedLeg(0.045, 0.03, h - 0.032, legs, sx * (w / 2 - inset), sz * (d / 2 - inset), g)
  return g
}

/** A chair whose seat faces +z (its back on the −z side). */
export function chair(wood: M, seat: M = wood) {
  const g = new THREE.Group()
  rbox(0.44, 0.03, 0.42, seat, 0, 0.455, 0.005, g, 0.008)
  // Front legs straight, back legs rise into the back posts with a slight rake.
  for (const sx of [-1, 1]) {
    taperedLeg(0.034, 0.028, 0.44, wood, sx * 0.19, 0.18, g)
    const post = rbox(0.032, 0.92, 0.034, wood, sx * 0.19, 0.46, -0.185, g, 0.006)
    post.rotation.x = -0.07
    // Side stretchers.
    rbox(0.018, 0.022, 0.34, wood, sx * 0.19, 0.17, 0, g, 0.004)
  }
  rbox(0.36, 0.022, 0.018, wood, 0, 0.2, 0.18, g, 0.004)
  rbox(0.36, 0.05, 0.022, wood, 0, 0.42, -0.18, g, 0.004)
  // Curved top rail and two slats.
  const rail = rbox(0.4, 0.075, 0.024, wood, 0, 0.86, -0.215, g, 0.008)
  rail.rotation.x = -0.07
  for (const sx of [-0.07, 0.07]) {
    const slat = rbox(0.045, 0.3, 0.014, wood, sx, 0.66, -0.2, g, 0.004)
    slat.rotation.x = -0.07
  }
  return g
}

/** An office chair (seat faces +z): five-star base on casters, gas lift, padded seat and back, arms. */
export function officeChair(shell: M, metal: M) {
  const g = new THREE.Group()
  const h = hardware()
  // Base: five arms with casters.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 10
    const arm = new THREE.Group()
    arm.rotation.y = a
    g.add(arm)
    const leg = rbox(0.3, 0.03, 0.045, metal, 0.15, 0.085, 0, arm, 0.01)
    leg.rotation.z = 0.08
    const caster = new THREE.Group()
    caster.position.set(0.29, 0.035, 0)
    arm.add(caster)
    cyl(0.03, 0.03, 0.02, h.rubber, 0, 0, 0.012, caster, 16).rotation.x = Math.PI / 2
    cyl(0.03, 0.03, 0.02, h.rubber, 0, 0, -0.012, caster, 16).rotation.x = Math.PI / 2
    rbox(0.03, 0.04, 0.008, h.plasticDark, 0.01, 0.03, 0, caster, 0.003)
  }
  cyl(0.045, 0.05, 0.05, metal, 0, 0.1, 0, g, 20)
  cyl(0.026, 0.026, 0.24, h.chrome, 0, 0.23, 0, g, 16)
  cyl(0.034, 0.034, 0.12, h.plasticDark, 0, 0.17, 0, g, 16)
  rbox(0.2, 0.04, 0.22, h.plasticDark, 0, 0.375, 0, g, 0.01)
  // Seat: a padded cushion on a shell.
  rbox(0.5, 0.02, 0.48, h.plasticDark, 0, 0.405, 0, g, 0.008)
  rbox(0.48, 0.07, 0.47, shell, 0, 0.45, 0.005, g, 0.03)
  // Back: two rods up to a curved padded back.
  for (const sx of [-1, 1]) {
    const rod = rbox(0.03, 0.3, 0.02, metal, sx * 0.08, 0.53, -0.26, g, 0.006)
    rod.rotation.x = -0.1
  }
  const back = rbox(0.44, 0.5, 0.06, shell, 0, 0.84, -0.27, g, 0.028)
  back.rotation.x = -0.12
  rbox(0.36, 0.08, 0.03, shell, 0, 0.68, -0.235, g, 0.014).rotation.x = -0.12
  // Arms.
  for (const sx of [-1, 1]) {
    rbox(0.03, 0.2, 0.05, h.plasticDark, sx * 0.26, 0.55, -0.02, g, 0.008)
    rbox(0.07, 0.025, 0.24, h.plasticDark, sx * 0.26, 0.655, 0.0, g, 0.012)
    rbox(0.03, 0.025, 0.2, h.plasticDark, sx * 0.235, 0.43, -0.02, g, 0.006)
  }
  return g
}

export function stool(seat: M, metal: M) {
  const g = new THREE.Group()
  const top = turned(
    [
      [0, 0.64],
      [0.17, 0.64],
      [0.185, 0.655],
      [0.188, 0.675],
      [0.18, 0.69],
      [0, 0.695],
    ],
    seat,
    40,
    g,
  )
  top.castShadow = true
  cyl(0.024, 0.024, 0.62, metal, 0, 0.32, 0, g, 16)
  const ring = mesh(new THREE.TorusGeometry(0.15, 0.009, 8, 40), metal, 0, 0.26, 0, g)
  ring.rotation.x = Math.PI / 2
  for (let i = 0; i < 3; i++) {
    const s = rbox(0.15, 0.012, 0.012, metal, 0, 0.26, 0, g, 0.004)
    s.rotation.y = (i / 3) * Math.PI * 2
    s.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.075, 0.26, -Math.sin((i / 3) * Math.PI * 2) * 0.075)
  }
  turned(
    [
      [0, 0],
      [0.21, 0],
      [0.215, 0.008],
      [0.2, 0.024],
      [0.03, 0.03],
      [0, 0.03],
    ],
    metal,
    40,
    g,
  )
  return g
}

/** A monitor whose screen faces +z. Returns the screen mesh so its material can be driven. */
export function monitor(frame: M, screen: M, w = 0.56, h = 0.34) {
  const g = new THREE.Group()
  const hwm = hardware()
  // Thin bezel, a deeper back casing, a vented bump for the electronics.
  rbox(w + 0.022, h + 0.024, 0.018, frame, 0, 0, -0.008, g, 0.005)
  rbox(w * 0.9, h * 0.8, 0.03, frame, 0, -0.01, -0.03, g, 0.012)
  rbox(w * 0.36, h * 0.36, 0.02, frame, 0, 0.0, -0.05, g, 0.008)
  rbox(w + 0.022, 0.02, 0.012, frame, 0, -h / 2 - 0.016, -0.004, g, 0.004)
  const s = mesh(new THREE.PlaneGeometry(w, h), screen, 0, 0, 0.0015, g)
  // Power light under the bezel.
  mesh(new THREE.CircleGeometry(0.0022, 10), hwm.ledBlue, w / 2 - 0.02, -h / 2 - 0.016, 0.0025, g)
  // Neck and foot.
  const neck = rbox(0.05, h * 0.62 + 0.06, 0.022, frame, 0, -h / 2 - 0.03 - h * 0.18, -0.062, g, 0.008)
  neck.rotation.x = 0.06
  rbox(0.24, 0.012, 0.17, frame, 0, -h / 2 - 0.205, -0.04, g, 0.006)
  // A cable from the back down behind the foot.
  tube(
    [
      [0.03, -0.02, -0.05],
      [0.05, -h / 2 - 0.05, -0.09],
      [0.07, -h / 2 - 0.2, -0.16],
      [0.1, -h / 2 - 0.205, -0.3],
    ],
    0.0035,
    hwm.plasticDark,
    g,
  )
  return { group: g, screen: s }
}

/** A keyboard (front edge toward +z), caps instanced. */
export function keyboard(body: M = hardware().plasticDark, caps: M = hardware().plasticGrey) {
  const g = new THREE.Group()
  rbox(0.44, 0.016, 0.145, body, 0, 0.008, 0, g, 0.004)
  const rows = [14, 14, 13, 12, 11]
  const unit = 0.0186
  const cap = rgeo(0.0158, 0.008, 0.0158, 0.002, 1)
  const count = rows.reduce((a, b) => a + b, 0) + 1
  const inst = new THREE.InstancedMesh(cap, caps, count)
  const m = new THREE.Matrix4()
  let n = 0
  rows.forEach((keys, r) => {
    const z = -0.052 + r * unit
    const x0 = -((keys - 1) * unit) / 2
    for (let k = 0; k < keys; k++) {
      const wide = (r === 2 && k === keys - 1) || (r === 3 && (k === 0 || k === keys - 1)) ? 1.6 : 1
      m.makeScale(wide, 1, 1).setPosition(x0 + k * unit, 0.02 - r * 0.0006, z)
      inst.setMatrixAt(n++, m)
    }
  })
  m.makeScale(6.2, 1, 1).setPosition(0, 0.018, -0.052 + 5 * unit)
  inst.setMatrixAt(n++, m)
  inst.count = n
  inst.castShadow = true
  g.add(inst)
  return g
}

/** A mouse (front toward −z). */
export function mouse(body: M = hardware().plasticDark) {
  const g = new THREE.Group()
  const shell = mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), body, 0, 0, 0, g)
  shell.scale.set(0.031, 0.022, 0.058)
  mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 12), hardware().rubber, 0, 0.021, -0.026, g).rotation.z = Math.PI / 2
  return g
}

/** A phone lying flat, screen up (top toward −z). Returns the screen mesh. */
export function phone(body: M, screen: M) {
  const g = new THREE.Group()
  rbox(0.072, 0.0082, 0.152, body, 0, 0.0041, 0, g, 0.004)
  const s = mesh(new THREE.PlaneGeometry(0.066, 0.145), screen, 0, 0.0083, 0, g)
  s.rotation.x = -Math.PI / 2
  rbox(0.024, 0.0016, 0.03, body, -0.018, 0.0, -0.05, g, 0.003)
  return { group: g, screen: s }
}

export function bench(len: number, seat: M, legs: M) {
  const g = new THREE.Group()
  for (const z of [-0.14, 0, 0.14]) rbox(len, 0.035, 0.12, seat, 0, 0.452, z, g, 0.006)
  for (const sx of [-1, 1]) {
    const x = sx * (len / 2 - 0.15)
    for (const sz of [-1, 1]) rbox(0.04, 0.43, 0.04, legs, x, 0.215, sz * 0.17, g, 0.006)
    rbox(0.04, 0.04, 0.38, legs, x, 0.415, 0, g, 0.006)
    rbox(0.04, 0.03, 0.38, legs, x, 0.06, 0, g, 0.006)
  }
  rbox(len - 0.3, 0.03, 0.03, legs, 0, 0.06, 0, g, 0.006)
  return g
}

/** A sofa facing +z: frame, seat and back cushions per seat, rolled arms, a throw cushion. */
export function sofa(w: number, body: M, cushion: M) {
  const g = new THREE.Group()
  const seats = Math.max(2, Math.round((w - 0.4) / 0.7))
  const inner = w - 0.4
  rbox(w, 0.26, 0.88, body, 0, 0.2, 0, g, 0.04)
  rbox(w, 0.46, 0.2, body, 0, 0.55, -0.34, g, 0.07)
  for (const sx of [-1, 1]) rbox(0.2, 0.32, 0.88, body, sx * (w / 2 - 0.1), 0.48, 0, g, 0.08)
  for (let i = 0; i < seats; i++) {
    const cx = -inner / 2 + (i + 0.5) * (inner / seats)
    rbox(inner / seats - 0.01, 0.13, 0.66, body, cx, 0.39, 0.08, g, 0.05)
    const back = rbox(inner / seats - 0.02, 0.4, 0.17, body, cx, 0.62, -0.2, g, 0.07)
    back.rotation.x = -0.12
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) taperedLeg(0.04, 0.03, 0.07, hardware().plasticDark, sx * (w / 2 - 0.08), sz * 0.36, g)
  const throwCushion = rbox(0.42, 0.4, 0.14, cushion, -w * 0.28, 0.62, -0.12, g, 0.07)
  throwCushion.rotation.set(-0.3, 0.3, 0.05)
  return g
}

/** A run of base cabinets: doors with pulls, a recessed plinth, a top with an overhang. Front faces +z. */
export function counter(len: number, d: number, h: number, top: M, body: M) {
  const g = new THREE.Group()
  const hwm = hardware()
  rbox(len, 0.1, d - 0.06, body, 0, 0.05, -0.03, g, 0.003)
  rbox(len, h - 0.14, d - 0.02, body, 0, 0.1 + (h - 0.14) / 2, -0.01, g, 0.003)
  const doors = Math.max(1, Math.round(len / 0.6))
  const dw = len / doors
  for (let i = 0; i < doors; i++) {
    const cx = -len / 2 + (i + 0.5) * dw
    rbox(dw - 0.006, h - 0.15, 0.018, body, cx, 0.1 + (h - 0.15) / 2, d / 2 - 0.009, g, 0.003)
    rbox(0.012, 0.012, 0.13, hwm.chrome, cx + (i % 2 ? -1 : 1) * (dw / 2 - 0.05), h - 0.14, d / 2 + 0.012, g, 0.005).rotation.x = Math.PI / 2
  }
  rbox(len + 0.02, 0.035, d + 0.03, top, 0, h - 0.0175, 0.015, g, 0.006)
  return g
}

/** A bookshelf facing +z, with books that lean, stack and vary. */
export function shelf(w: number, h: number, d: number, wood: M, books: M[], seed = 3) {
  const g = new THREE.Group()
  rbox(w, h, 0.012, wood, 0, h / 2, -d / 2 + 0.006, g, 0.002)
  for (const sx of [-1, 1]) rbox(0.022, h, d, wood, sx * (w / 2 - 0.011), h / 2, 0, g, 0.003)
  const rows = Math.max(2, Math.floor(h / 0.36))
  const rand = mulberry32(seed)
  const step = (h - 0.06) / rows
  for (let r = 0; r <= rows; r++) rbox(w - 0.04, 0.02, d - 0.012, wood, 0, 0.03 + r * step, 0.006, g, 0.003)
  const bookGeo: Record<string, THREE.BufferGeometry[]> = {}
  for (let r = 0; r < rows; r++) {
    const y = 0.04 + r * step
    let x = -w / 2 + 0.035
    const end = w / 2 - 0.035
    while (x < end - 0.03) {
      const roll = rand()
      if (roll < 0.08 && x < end - 0.25) {
        // A small horizontal stack.
        let sy = y
        for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) {
          const bh = 0.025 + rand() * 0.02
          const geo = rgeo(0.17 + rand() * 0.05, bh, d * 0.7, 0.003, 1)
          geo.translate(x + 0.1, sy + bh / 2, 0.01)
          ;(bookGeo[k % books.length] ??= []).push(geo)
          sy += bh
        }
        x += 0.24
        continue
      }
      const bw = 0.018 + rand() * 0.035
      const bh = Math.min(step - 0.04, 0.17 + rand() * 0.11)
      const bd = d * (0.6 + rand() * 0.2)
      const geo = rgeo(bw, bh, bd, 0.0025, 1)
      if (roll > 0.94) {
        // Leaning against its neighbour.
        geo.translate(0, bh / 2, 0)
        geo.rotateZ(-0.25)
        geo.translate(x + bw / 2 + 0.03, y, 0.02)
        x += 0.06
      } else geo.translate(x + bw / 2, y + bh / 2, 0.02 - (d - bd) * 0.2)
      ;(bookGeo[Math.floor(rand() * books.length)] ??= []).push(geo)
      x += bw + 0.002
      if (rand() < 0.04) x += 0.05 + rand() * 0.08
    }
  }
  for (const [k, list] of Object.entries(bookGeo)) {
    const merged = mergeGeometries(list)
    list.forEach((l) => l.dispose())
    const b = mesh(merged, books[Number(k)], 0, 0, 0, g)
    b.castShadow = true
    b.receiveShadow = true
  }
  return g
}

/** A potted plant: turned pot with a rim, soil, stems and many shaped leaves (merged). */
export function plant(pot: M, leaf: M, size = 1, seed = 1) {
  const p = new THREE.Group()
  const s = size
  turned(
    [
      [0, 0],
      [0.11 * s, 0],
      [0.13 * s, 0.03 * s],
      [0.16 * s, 0.28 * s],
      [0.175 * s, 0.3 * s],
      [0.175 * s, 0.33 * s],
      [0.155 * s, 0.33 * s],
      [0.15 * s, 0.29 * s],
      [0, 0.29 * s],
    ],
    pot,
    40,
    p,
  )
  const soil = mesh(new THREE.CircleGeometry(0.15 * s, 32), hardware().soil, 0, 0.295 * s, 0, p)
  soil.rotation.x = -Math.PI / 2
  const rand = mulberry32(seed)
  const leaves: THREE.BufferGeometry[] = []
  const stems: THREE.BufferGeometry[] = []
  const count = 16 + Math.floor(rand() * 8)
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2
    const tilt = 0.25 + rand() * 0.7
    const len = (0.28 + rand() * 0.35) * s
    // Stem: a bent line from the soil outward.
    const tip = new THREE.Vector3(Math.cos(a) * Math.sin(tilt) * len, 0.3 * s + Math.cos(tilt) * len, Math.sin(a) * Math.sin(tilt) * len)
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.29 * s, 0), new THREE.Vector3(tip.x * 0.3, tip.y * 0.9, tip.z * 0.3), tip)
    stems.push(new THREE.TubeGeometry(curve, 6, 0.0035 * s, 4, false))
    // Leaf: a cupped blade, widest a third of the way along, drooping at the tip.
    const L = (0.13 + rand() * 0.09) * s
    const W = L * (0.38 + rand() * 0.12)
    const blade = new THREE.PlaneGeometry(W, L, 4, 8)
    const bp = blade.attributes.position as THREE.BufferAttribute
    for (let k = 0; k < bp.count; k++) {
      const x = bp.getX(k)
      // Clamped: float error at the base would put pow() below zero (NaN).
      const y = Math.min(1, Math.max(0, bp.getY(k) / L + 0.5))
      const width = Math.sin(Math.PI * Math.pow(y, 0.75))
      bp.setXYZ(k, x * width, y * L, -Math.pow(Math.abs(x) / W, 2) * W * 0.6 - y * y * L * 0.35)
    }
    blade.computeVertexNormals()
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.4 - rand() * 0.6, -a + Math.PI / 2, (rand() - 0.5) * 0.4, 'YXZ'))
    blade.applyQuaternion(q)
    blade.translate(tip.x, tip.y, tip.z)
    leaves.push(blade)
  }
  const leafMesh = mesh(mergeGeometries(leaves), leaf, 0, 0, 0, p)
  const leafMat = leaf as THREE.MeshStandardMaterial
  leafMat.side = THREE.DoubleSide
  leafMesh.castShadow = true
  mesh(mergeGeometries(stems), leaf, 0, 0, 0, p)
  leaves.forEach((l) => l.dispose())
  stems.forEach((l) => l.dispose())
  return p
}

/** A pendant lamp hanging `drop` below its canopy (origin at the ceiling). */
export function pendant(shade: M, cord: M, drop = 0.7) {
  const g = new THREE.Group()
  cyl(0.05, 0.05, 0.02, cord, 0, -0.01, 0, g, 24)
  cyl(0.0025, 0.0025, drop, cord, 0, -drop / 2, 0, g, 6)
  cyl(0.018, 0.018, 0.05, cord, 0, -drop - 0.02, 0, g, 16)
  const sh = turned(
    [
      [0.03, 0],
      [0.06, -0.03],
      [0.15, -0.13],
      [0.2, -0.2],
      [0.197, -0.202],
      [0.146, -0.135],
      [0.057, -0.035],
      [0.027, -0.004],
    ],
    shade,
    48,
    g,
  )
  sh.position.y = -drop - 0.03
  return g
}

export function mug(body: M, liquid?: M) {
  const g = new THREE.Group()
  turned(
    [
      [0, 0],
      [0.034, 0],
      [0.039, 0.004],
      [0.04, 0.012],
      [0.0415, 0.092],
      [0.0405, 0.0965],
      [0.0375, 0.0965],
      [0.0365, 0.092],
      [0.035, 0.012],
      [0, 0.01],
    ],
    body,
    40,
    g,
  )
  const handle = mesh(new THREE.TorusGeometry(0.024, 0.0055, 10, 20, Math.PI * 1.15), body, 0.043, 0.05, 0, g)
  handle.rotation.z = -Math.PI * 0.58
  handle.scale.set(1, 1.15, 1)
  if (liquid) mesh(new THREE.CircleGeometry(0.0355, 28), liquid, 0, 0.08, 0, g).rotation.x = -Math.PI / 2
  g.traverse((o) => (o.castShadow = true))
  return g
}

/** A canvas-drawn plane (signs, posters, screens). `redraw` re-renders it when its content changes. */
export function canvasPlane(w: number, h: number, px: number, draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void, opts: { emissive?: boolean; transparent?: boolean } = {}) {
  const c = document.createElement('canvas')
  c.width = px
  c.height = Math.max(8, Math.round((px * h) / w))
  const ctx = c.getContext('2d')!
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const transparent = opts.transparent ?? false
  const material = opts.emissive ? new THREE.MeshBasicMaterial({ map: texture, transparent, toneMapped: true }) : new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, transparent })
  const m = mesh(new THREE.PlaneGeometry(w, h), material)
  let key = ''
  const redraw = (next: (ctx: CanvasRenderingContext2D, W: number, H: number) => void, id = '') => {
    if (id && id === key) return
    key = id
    ctx.clearRect(0, 0, c.width, c.height)
    next(ctx, c.width, c.height)
    texture.needsUpdate = true
  }
  redraw(draw, '\u0000init')
  return { mesh: m, material, texture, redraw }
}

// ——— Buildings ———

let interiorTex: THREE.CanvasTexture | null = null
/** What a lit window shows from the street: a warm room, a curtain edge, a lamp. Shared by every lit pane. */
function interiorTexture() {
  if (interiorTex) return interiorTex
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!
  const rand = mulberry32(404)
  for (let k = 0; k < 8; k++) {
    const x0 = (k % 4) * 128
    const y0 = Math.floor(k / 4) * 128
    const grad = g.createLinearGradient(x0, y0, x0, y0 + 128)
    const warm = 0.75 + rand() * 0.25
    grad.addColorStop(0, `rgb(${255 * warm},${200 * warm},${140 * warm})`)
    grad.addColorStop(1, `rgb(${170 * warm},${120 * warm},${80 * warm})`)
    g.fillStyle = grad
    g.fillRect(x0, y0, 128, 128)
    // A back wall line, a shelf or a picture, a curtain at one side.
    g.fillStyle = 'rgba(80,50,30,0.35)'
    g.fillRect(x0, y0 + 88 + rand() * 12, 128, 40)
    if (rand() < 0.6) {
      g.fillStyle = 'rgba(60,40,30,0.5)'
      g.fillRect(x0 + 20 + rand() * 60, y0 + 30 + rand() * 20, 24 + rand() * 20, 18 + rand() * 12)
    }
    g.fillStyle = `rgba(${120 + rand() * 80},${90 + rand() * 60},${70 + rand() * 40},0.75)`
    const cw = 20 + rand() * 30
    g.fillRect(rand() < 0.5 ? x0 : x0 + 128 - cw, y0, cw, 128)
    if (rand() < 0.35) {
      // Someone in the room, or a lamp.
      g.fillStyle = 'rgba(30,20,15,0.55)'
      g.beginPath()
      g.ellipse(x0 + 40 + rand() * 50, y0 + 70, 12, 30, 0, 0, Math.PI * 2)
      g.fill()
    }
  }
  interiorTex = new THREE.CanvasTexture(c)
  interiorTex.colorSpace = THREE.SRGBColorSpace
  return interiorTex
}

/**
 * A building: a block with real windows on its street face (+x when facing 1,
 * −x when −1) — recessed frames, sills, glass that is dark or lit from inside —
 * floor bands, a cornice and a ground floor of its own.
 */
export function facade(o: { w: number; h: number; d: number; wall: M; facing: 1 | -1; seed?: number; lit?: number; floorH?: number; ground?: boolean }) {
  const g = new THREE.Group()
  const { w, h, d } = o
  const rand = mulberry32(o.seed ?? 7)
  const lit = o.lit ?? 0.35
  const hwm = hardware()
  box(d, h, w, o.wall, 0, h / 2, 0, g).receiveShadow = true
  // Work in a frame whose +z points out of the street face.
  const face = new THREE.Group()
  face.position.x = (o.facing * d) / 2
  face.rotation.y = (o.facing * Math.PI) / 2
  g.add(face)
  const floorH = o.floorH ?? 3.1
  const hasGround = o.ground !== false
  const ground = hasGround ? 4 : 0.3
  const floors = Math.max(1, Math.floor((h - ground - 0.6) / floorH))
  const bay = 2.4 + rand() * 0.6
  const cols = Math.max(1, Math.floor((w - 0.8) / bay))
  const winW = Math.min(1.5, bay * (0.5 + rand() * 0.15))
  const winH = Math.min(floorH - 1.0, 1.55 + rand() * 0.35)
  const x0 = -((cols - 1) * bay) / 2
  // Floor bands and cornice.
  for (let f = 0; f <= floors; f++) rbox(w + 0.02, 0.12, 0.08, o.wall, 0, ground + f * floorH - 0.06, 0.04, face, 0.01)
  rbox(w + 0.12, 0.3, 0.22, o.wall, 0, h - 0.15, 0.08, face, 0.02)
  // Windows, instanced: frame, sill, glass (lit and dark).
  const n = cols * floors
  const frameGeo = new THREE.BoxGeometry(1, 1, 1)
  const frames = new THREE.InstancedMesh(frameGeo, hwm.plasticLight, n * 4)
  const sills = new THREE.InstancedMesh(rgeo(1, 1, 1, 0.08, 1), o.wall, n)
  const paneGeo = new THREE.PlaneGeometry(1, 1)
  const litMat = new THREE.MeshBasicMaterial({ map: interiorTexture(), color: 0xffffff })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0e12, roughness: 0.08, metalness: 0.6 })
  const litPanes = new THREE.InstancedMesh(paneGeo, litMat, n)
  const darkPanes = new THREE.InstancedMesh(paneGeo, darkMat, n)
  // Each lit pane samples one of eight rooms from the shared texture.
  const uvOffset = new Float32Array(n * 2)
  const m4 = new THREE.Matrix4()
  const col = new THREE.Color()
  let fi = 0
  let li = 0
  let di = 0
  for (let f = 0; f < floors; f++) {
    const cy = ground + f * floorH + 0.9 + winH / 2
    for (let c = 0; c < cols; c++) {
      const cx = x0 + c * bay
      const t = 0.05
      for (const [px, py, sw, sh] of [
        [cx, cy + winH / 2 + t / 2, winW + 2 * t, t],
        [cx, cy - winH / 2 - t / 2, winW + 2 * t, t],
        [cx - winW / 2 - t / 2, cy, t, winH],
        [cx + winW / 2 + t / 2, cy, t, winH],
      ] as const) {
        m4.makeScale(sw, sh, 0.05).setPosition(px, py, 0.035)
        frames.setMatrixAt(fi++, m4)
      }
      m4.makeScale(winW + 0.22, 0.06, 0.14).setPosition(cx, cy - winH / 2 - 0.08, 0.07)
      sills.setMatrixAt(f * cols + c, m4)
      m4.makeScale(winW, winH, 1).setPosition(cx, cy, 0.016)
      if (rand() < lit) {
        litPanes.setMatrixAt(li, m4)
        col.setHSL(0.08 + rand() * 0.04, 0.5, 0.45 + rand() * 0.2)
        litPanes.setColorAt(li, col)
        uvOffset[li * 2] = Math.floor(rand() * 4) / 4
        uvOffset[li * 2 + 1] = Math.floor(rand() * 2) / 2
        li++
      } else {
        darkPanes.setMatrixAt(di++, m4)
      }
    }
  }
  litPanes.count = li
  darkPanes.count = di
  litPanes.geometry = paneGeo.clone()
  litPanes.geometry.setAttribute('uvOffset', new THREE.InstancedBufferAttribute(uvOffset, 2))
  litMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 uvOffset;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vMapUv * vec2(0.25, 0.5) + uvOffset;\n#endif')
  }
  litMat.customProgramCacheKey = () => 'facade-lit'
  // The reveal: the wall is cut back around each window.
  const reveal = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), hwm.plasticDark, n)
  for (let f = 0, k = 0; f < floors; f++)
    for (let c = 0; c < cols; c++, k++) {
      m4.makeScale(winW + 0.16, winH + 0.16, 0.012).setPosition(x0 + c * bay, ground + f * floorH + 0.9 + winH / 2, 0.006)
      reveal.setMatrixAt(k, m4)
    }
  face.add(reveal, frames, sills, litPanes, darkPanes)
  for (const im of [frames, sills, litPanes, darkPanes, reveal]) {
    im.frustumCulled = false
    im.instanceMatrix.needsUpdate = true
  }
  if (!hasGround) return g
  // Ground floor: a door, a shopfront or two, a plinth.
  rbox(w, 0.5, 0.06, hwm.plasticDark, 0, 0.25, 0.03, face, 0.01)
  const doorX = (rand() - 0.5) * (w - 3)
  rbox(1.2, 2.4, 0.08, hwm.plasticDark, doorX, 1.2, -0.02, face, 0.01)
  mesh(new THREE.PlaneGeometry(1.0, 2.2), darkMat, doorX, 1.15, 0.025, face)
  const shopW = Math.min(4, (w - 2) / 2)
  if (shopW > 1.6)
    for (const sx of [-1, 1]) {
      const sxp = doorX + sx * (0.8 + shopW / 2)
      if (Math.abs(sxp) + shopW / 2 > w / 2 - 0.3) continue
      const shopLit = rand() < lit * 1.4
      const paneGeo2 = new THREE.PlaneGeometry(shopW, 2.2)
      // One room of the atlas, not all eight.
      const uv = paneGeo2.attributes.uv as THREE.BufferAttribute
      const cell = Math.floor(rand() * 8)
      for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 0.25 + (cell % 4) * 0.25, uv.getY(k) * 0.5 + Math.floor(cell / 4) * 0.5)
      mesh(paneGeo2, shopLit ? new THREE.MeshBasicMaterial({ color: 0xffe2b8, map: interiorTexture() }) : darkMat, sxp, 1.6, 0.014, face)
      rbox(shopW + 0.12, 0.12, 0.1, hwm.plasticDark, sxp, 2.76, 0.05, face, 0.01)
      for (const ex of [-1, 1]) rbox(0.08, 2.3, 0.06, hwm.plasticDark, sxp + ex * (shopW / 2 + 0.04), 1.6, 0.03, face, 0.01)
    }
  return g
}

/** A street light: plinth, tapered pole, an arm curving out over the road (+x), a luminaire with its diffuser. */
export function streetLamp(pole: M, lamp: M) {
  const g = new THREE.Group()
  cyl(0.11, 0.13, 0.5, pole, 0, 0.25, 0, g, 16)
  rbox(0.06, 0.18, 0.012, pole, 0, 0.32, 0.12, g, 0.003)
  cyl(0.055, 0.085, 4.6, pole, 0, 2.8, 0, g, 16)
  tube(
    [
      [0, 4.9, 0],
      [0.05, 5.15, 0],
      [0.3, 5.25, 0],
      [0.75, 5.2, 0],
    ],
    0.035,
    pole,
    g,
    16,
  )
  const head = rbox(0.5, 0.09, 0.22, pole, 0.95, 5.16, 0, g, 0.03)
  head.rotation.z = -0.06
  const diffuser = rbox(0.42, 0.02, 0.16, lamp, 0.95, 5.105, 0, g, 0.008)
  diffuser.rotation.z = -0.06
  return g
}

/**
 * A hatchback facing +z, built from extruded side profiles: body with
 * wheel arches, a glass greenhouse, wheels with rims, lights, mirrors, plates.
 */
export function car(body: M, glass: M, tire: M, light: M) {
  const g = new THREE.Group()
  const hwm = hardware()
  const L = 4.1
  const W = 1.78
  // Side profile (z along length, y up), with arches cut for the wheels.
  const s = new THREE.Shape()
  const wz = [-1.32, 1.36]
  const wr = 0.36
  s.moveTo(-L / 2, 0.3)
  s.lineTo(-L / 2, 0.82)
  s.quadraticCurveTo(-L / 2 + 0.05, 0.98, -L / 2 + 0.35, 1.0)
  s.lineTo(L / 2 - 0.55, 0.96)
  s.quadraticCurveTo(L / 2 - 0.02, 0.9, L / 2, 0.66)
  s.lineTo(L / 2, 0.3)
  s.lineTo(wz[1] + wr + 0.06, 0.3)
  s.absarc(wz[1], 0.33, wr + 0.06, 0, Math.PI, false)
  s.lineTo(wz[0] + wr + 0.06, 0.3)
  s.absarc(wz[0], 0.33, wr + 0.06, 0, Math.PI, false)
  s.lineTo(-L / 2, 0.3)
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: W - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 20 })
  bodyGeo.translate(0, 0, -(W - 0.12) / 2)
  bodyGeo.rotateY(-Math.PI / 2)
  const shell = mesh(bodyGeo, body, 0, 0, 0, g)
  shell.castShadow = true
  // Greenhouse.
  const gh = new THREE.Shape()
  gh.moveTo(-L / 2 + 0.3, 0.99)
  gh.lineTo(-L / 2 + 0.55, 1.4)
  gh.lineTo(0.55, 1.42)
  gh.lineTo(L / 2 - 0.62, 0.97)
  gh.lineTo(-L / 2 + 0.3, 0.99)
  const ghGeo = new THREE.ExtrudeGeometry(gh, { depth: W - 0.36, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 })
  ghGeo.translate(0, 0, -(W - 0.36) / 2)
  ghGeo.rotateY(-Math.PI / 2)
  mesh(ghGeo, glass, 0, 0, 0, g)
  // Roof panel over the glass.
  rbox(W - 0.34, 0.04, 1.75, body, 0, 1.43, -0.08, g, 0.02)
  // Wheels: tyre, rim, hub.
  for (const sx of [-1, 1])
    for (const z of wz) {
      const wheel = new THREE.Group()
      wheel.position.set(sx * (W / 2 - 0.12), 0.33, z)
      g.add(wheel)
      const tyre = mesh(new THREE.TorusGeometry(0.26, 0.085, 12, 28), tire, 0, 0, 0, wheel)
      tyre.rotation.y = Math.PI / 2
      tyre.scale.set(1, 1, 1.4)
      const rim = cyl(0.21, 0.21, 0.16, hwm.steel, 0, 0, 0, wheel, 24)
      rim.rotation.z = Math.PI / 2
      for (let k = 0; k < 5; k++) {
        const spoke = rbox(0.02, 0.36, 0.04, hwm.chrome, sx * 0.08, 0, 0, wheel, 0.008)
        spoke.rotation.x = (k / 5) * Math.PI * 2
      }
      cyl(0.04, 0.04, 0.18, hwm.chrome, 0, 0, 0, wheel, 16).rotation.z = Math.PI / 2
    }
  // Lights, grille, plates, mirrors, handles.
  for (const sx of [-1, 1]) {
    rbox(0.36, 0.11, 0.06, light, sx * 0.58, 0.78, L / 2 + 0.01, g, 0.03)
    rbox(0.3, 0.12, 0.05, hwm.tail, sx * 0.62, 0.86, -L / 2 - 0.01, g, 0.03)
    const mirror = rbox(0.16, 0.1, 0.08, body, sx * (W / 2 + 0.06), 1.06, 0.62, g, 0.03)
    mirror.rotation.y = sx * 0.2
    for (const z of [0.15, -0.75]) rbox(0.02, 0.025, 0.14, hwm.chrome, sx * (W / 2 + 0.005), 0.92, z, g, 0.008)
  }
  rbox(0.9, 0.16, 0.04, hwm.plasticDark, 0, 0.55, L / 2 + 0.02, g, 0.02)
  rbox(0.52, 0.12, 0.02, hwm.plate, 0, 0.42, L / 2 + 0.035, g, 0.006)
  rbox(0.52, 0.12, 0.02, hwm.plate, 0, 0.62, -L / 2 - 0.035, g, 0.006)
  rbox(W - 0.06, 0.18, 0.1, hwm.plasticDark, 0, 0.36, L / 2 - 0.02, g, 0.04)
  rbox(W - 0.06, 0.18, 0.1, hwm.plasticDark, 0, 0.36, -L / 2 + 0.02, g, 0.04)
  return g
}

// ——— Desk and office pieces ———

/** A desk with a drawer pedestal on the right (front toward +z). */
export function desk(w: number, d: number, top: M, body: M) {
  const g = new THREE.Group()
  const h = 0.74
  const hwm = hardware()
  rbox(w, 0.028, d, top, 0, h - 0.014, 0, g, 0.004)
  // Left: a panel leg; right: three drawers.
  rbox(0.025, h - 0.03, d - 0.06, body, -w / 2 + 0.03, (h - 0.03) / 2, 0, g, 0.003)
  rbox(0.42, h - 0.03, d - 0.06, body, w / 2 - 0.24, (h - 0.03) / 2, 0, g, 0.003)
  for (let i = 0; i < 3; i++) {
    const dy = 0.1 + i * 0.205
    rbox(0.4, 0.19, 0.016, body, w / 2 - 0.24, dy + 0.095, d / 2 - 0.03 + 0.008, g, 0.003)
    rbox(0.12, 0.01, 0.012, hwm.chrome, w / 2 - 0.24, dy + 0.16, d / 2 - 0.012, g, 0.004)
  }
  rbox(w - 0.5, 0.3, 0.012, body, -0.2, h - 0.2, -d / 2 + 0.06, g, 0.002)
  return g
}

/** A small desk lamp with an articulated arm (head toward +z). Returns the bulb position for a light. */
export function deskLamp(metal: M, shade: M) {
  const g = new THREE.Group()
  cyl(0.075, 0.08, 0.02, metal, 0, 0.01, 0, g, 28)
  const a1 = rbox(0.014, 0.32, 0.014, metal, 0, 0.17, -0.04, g, 0.006)
  a1.rotation.x = 0.35
  const a2 = rbox(0.014, 0.3, 0.014, metal, 0, 0.38, 0.06, g, 0.006)
  a2.rotation.x = -0.9
  const head = turned(
    [
      [0.012, 0],
      [0.05, -0.04],
      [0.062, -0.1],
      [0.059, -0.101],
      [0.047, -0.042],
      [0.01, -0.003],
    ],
    shade,
    32,
    g,
  )
  head.position.set(0, 0.47, 0.17)
  head.rotation.x = 0.6
  return { group: g, bulb: new THREE.Vector3(0, 0.4, 0.22) }
}

/** A PC tower (front toward +z) with a power light. */
export function pcTower(body: M) {
  const g = new THREE.Group()
  const hwm = hardware()
  rbox(0.2, 0.44, 0.45, body, 0, 0.22, 0, g, 0.008)
  rbox(0.16, 0.1, 0.004, hwm.plasticGrey, 0, 0.36, 0.226, g, 0.002)
  mesh(new THREE.CircleGeometry(0.004, 12), hwm.ledBlue, 0.05, 0.4, 0.2275, g)
  for (let i = 0; i < 6; i++) rbox(0.14, 0.004, 0.003, hwm.plasticDark, 0, 0.08 + i * 0.022, 0.2265, g, 0.001)
  return g
}

/** A server rack (front toward +z): cabinet, 1U units, rows of status lights (instanced). */
export function serverRack(body: M, seed = 1) {
  const g = new THREE.Group()
  const hwm = hardware()
  const H = 2.0
  rbox(0.62, H, 1.0, body, 0, H / 2, 0, g, 0.01)
  const rand = mulberry32(seed)
  const units = 30
  const unitGeo = rgeo(0.54, 0.042, 0.01, 0.003, 1)
  const faces = new THREE.InstancedMesh(unitGeo, hwm.plasticDark, units)
  const lights: Record<'g' | 'a' | 'b', THREE.Matrix4[]> = { g: [], a: [], b: [] }
  const m4 = new THREE.Matrix4()
  for (let u = 0; u < units; u++) {
    const y = 0.15 + u * 0.058
    m4.makeTranslation(0, y, 0.505)
    faces.setMatrixAt(u, m4)
    const n = 2 + Math.floor(rand() * 5)
    for (let k = 0; k < n; k++) {
      const kind = rand() < 0.7 ? 'g' : rand() < 0.6 ? 'a' : 'b'
      lights[kind].push(new THREE.Matrix4().makeTranslation(-0.22 + k * 0.018, y, 0.512))
    }
  }
  g.add(faces)
  const dot = new THREE.CircleGeometry(0.0028, 8)
  for (const [k, mat] of [
    ['g', hwm.ledGreen],
    ['a', hwm.ledAmber],
    ['b', hwm.ledBlue],
  ] as const) {
    const list = lights[k]
    if (!list.length) continue
    const im = new THREE.InstancedMesh(dot, mat, list.length)
    list.forEach((mm, i) => im.setMatrixAt(i, mm))
    im.userData.blink = true
    g.add(im)
  }
  // Perforated door frame.
  for (const sx of [-1, 1]) rbox(0.03, H - 0.04, 0.02, hwm.steel, sx * 0.29, H / 2, 0.51, g, 0.004)
  return g
}

/** A drip coffee machine (front toward +z) with its glass jug. Returns the warmer light. */
export function coffeeMachine(body: M, glass: M, coffee: M) {
  const g = new THREE.Group()
  const hwm = hardware()
  rbox(0.24, 0.04, 0.26, body, 0, 0.02, 0, g, 0.01)
  rbox(0.24, 0.38, 0.1, body, 0, 0.19, -0.08, g, 0.02)
  rbox(0.24, 0.07, 0.26, body, 0, 0.36, 0, g, 0.02)
  cyl(0.065, 0.065, 0.008, hwm.steel, 0, 0.044, 0.04, g, 28)
  // The jug.
  turned(
    [
      [0, 0],
      [0.06, 0],
      [0.065, 0.03],
      [0.066, 0.1],
      [0.05, 0.14],
      [0.052, 0.15],
    ],
    glass,
    32,
    g,
  ).position.set(0, 0.048, 0.04)
  turned(
    [
      [0, 0],
      [0.058, 0],
      [0.062, 0.03],
      [0.063, 0.07],
      [0, 0.07],
    ],
    coffee,
    32,
    g,
  ).position.set(0, 0.05, 0.04)
  rbox(0.02, 0.09, 0.02, hwm.plasticDark, 0.085, 0.13, 0.04, g, 0.006)
  const led = mesh(new THREE.CircleGeometry(0.004, 12), hwm.ledAmber, 0.08, 0.36, 0.131, g)
  return { group: g, led }
}

/** A laser printer (front toward +z), paper in its tray. */
export function printer(body: M) {
  const g = new THREE.Group()
  const hwm = hardware()
  rbox(0.42, 0.26, 0.38, body, 0, 0.13, 0, g, 0.015)
  rbox(0.3, 0.012, 0.16, hwm.paper, 0, 0.262, 0.04, g, 0.002)
  rbox(0.34, 0.03, 0.04, hwm.plasticDark, 0, 0.2, 0.19, g, 0.006)
  rbox(0.12, 0.05, 0.01, hwm.plasticDark, 0.12, 0.23, 0.191, g, 0.003)
  mesh(new THREE.CircleGeometry(0.003, 10), hwm.ledGreen, 0.16, 0.24, 0.197, g)
  return g
}

/** Loose paper: a few sheets, slightly askew. */
export function papers(count = 5, seed = 1) {
  const g = new THREE.Group()
  const rand = mulberry32(seed)
  const mat = hardware().paper
  for (let i = 0; i < count; i++) {
    const sheet = mesh(new THREE.PlaneGeometry(0.21, 0.297), mat, (rand() - 0.5) * 0.04, 0.0006 + i * 0.0007, (rand() - 0.5) * 0.04, g)
    sheet.rotation.set(-Math.PI / 2, 0, (rand() - 0.5) * 0.3)
    sheet.receiveShadow = true
  }
  return g
}

/** A ring binder standing on its edge (spine toward +z). */
export function binder(cover: M) {
  const g = new THREE.Group()
  rbox(0.05, 0.31, 0.28, cover, 0, 0.155, 0, g, 0.004)
  rbox(0.04, 0.29, 0.27, hardware().paper, 0, 0.155, -0.006, g, 0.002)
  cyl(0.012, 0.012, 0.003, hardware().steel, 0, 0.06, 0.141, g, 16).rotation.x = Math.PI / 2
  return g
}

/** A wall-mounted whiteboard (face toward +z). Returns the writing surface for a canvas texture. */
export function whiteboard(w: number, h: number, frame: M, surface: M) {
  const g = new THREE.Group()
  rbox(w + 0.04, h + 0.04, 0.02, frame, 0, 0, 0, g, 0.006)
  const s = mesh(new THREE.PlaneGeometry(w, h), surface, 0, 0, 0.0105, g)
  rbox(w * 0.6, 0.02, 0.06, frame, 0, -h / 2 - 0.03, 0.03, g, 0.006)
  return { group: g, surface: s }
}

/** A round wall clock (face toward +z) with hands that can be set. */
export function wallClock(rim: M, face: M, hands: M) {
  const g = new THREE.Group()
  const r = turned(
    [
      [0, -0.02],
      [0.15, -0.02],
      [0.158, -0.01],
      [0.158, 0.012],
      [0.148, 0.016],
      [0.145, 0.004],
      [0, 0.004],
    ],
    rim,
    48,
    g,
  )
  r.rotation.x = Math.PI / 2
  const dial = mesh(new THREE.CircleGeometry(0.145, 48), face, 0, 0, 0.005, g)
  dial.receiveShadow = true
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.004, 0.018, 0.001), hands, 12)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    m4.makeRotationZ(-a).setPosition(Math.sin(a) * 0.125, Math.cos(a) * 0.125, 0.006)
    ticks.setMatrixAt(i, m4)
  }
  g.add(ticks)
  const hour = new THREE.Group()
  const minute = new THREE.Group()
  const second = new THREE.Group()
  rbox(0.008, 0.075, 0.002, hands, 0, 0.03, 0, hour, 0.001)
  rbox(0.005, 0.115, 0.002, hands, 0, 0.05, 0, minute, 0.001)
  rbox(0.0018, 0.125, 0.0015, hardware().tail, 0, 0.045, 0, second, 0.0005)
  hour.position.z = 0.008
  minute.position.z = 0.0095
  second.position.z = 0.011
  g.add(hour, minute, second)
  return {
    group: g,
    /** Sets the hands from a time in hours (fractional). */
    set(hours: number) {
      hour.rotation.z = -((hours % 12) / 12) * Math.PI * 2
      minute.rotation.z = -((hours * 60) % 60 / 60) * Math.PI * 2
      second.rotation.z = -((hours * 3600) % 60 / 60) * Math.PI * 2
    },
  }
}

/** A recessed ceiling panel light (face down). The emissive face can be dimmed. */
export function ceilingPanel(w: number, d: number, face: M) {
  const g = new THREE.Group()
  rbox(w + 0.03, 0.02, d + 0.03, hardware().plasticLight, 0, -0.01, 0, g, 0.004)
  const f = mesh(new THREE.PlaneGeometry(w, d), face, 0, -0.021, 0, g)
  f.rotation.x = Math.PI / 2
  return g
}

/** A wall radiator (front toward +z). */
export function radiator(len: number, mat: M) {
  const g = new THREE.Group()
  const fins = Math.max(4, Math.round(len / 0.05))
  const fin = rgeo(0.04, 0.55, 0.08, 0.01, 1)
  const im = new THREE.InstancedMesh(fin, mat, fins)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < fins; i++) im.setMatrixAt(i, m4.makeTranslation(-len / 2 + (i + 0.5) * (len / fins), 0.4, 0))
  im.castShadow = true
  g.add(im)
  cyl(0.012, 0.012, len, mat, 0, 0.14, 0, g, 10).rotation.z = Math.PI / 2
  cyl(0.012, 0.012, len, mat, 0, 0.66, 0, g, 10).rotation.z = Math.PI / 2
  return g
}

/** A swing-top bin. */
export function bin(mat: M) {
  const g = new THREE.Group()
  turned(
    [
      [0, 0],
      [0.13, 0],
      [0.15, 0.34],
      [0.155, 0.35],
      [0.15, 0.355],
      [0.142, 0.34],
      [0.122, 0.01],
      [0, 0.01],
    ],
    mat,
    32,
    g,
  )
  return g
}

/** A wall power socket with a switch plate beside it (face toward +z). */
export function socket(mat: M = hardware().plasticLight) {
  const g = new THREE.Group()
  rbox(0.08, 0.08, 0.01, mat, 0, 0, 0, g, 0.006)
  for (const sx of [-1, 1]) cyl(0.004, 0.004, 0.01, hardware().plasticDark, sx * 0.01, 0, 0.004, g, 8).rotation.x = Math.PI / 2
  rbox(0.08, 0.08, 0.01, mat, 0.09, 0, 0, g, 0.006)
  rbox(0.03, 0.045, 0.012, mat, 0.09, 0, 0.004, g, 0.004)
  return g
}

/** Venetian blinds over a window (face toward +z), slats instanced; `open` 0–1 tilts them. */
export function blinds(w: number, h: number, mat: M) {
  const g = new THREE.Group()
  const n = Math.round(h / 0.025)
  const slat = rgeo(w, 0.002, 0.024, 0.0008, 1)
  const im = new THREE.InstancedMesh(slat, mat, n)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const p = new THREE.Vector3()
  const s = new THREE.Vector3(1, 1, 1)
  const set = (open: number) => {
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.15 + open * 1.2)
    for (let i = 0; i < n; i++) {
      p.set(0, h / 2 - (i + 0.5) * (h / n), 0)
      im.setMatrixAt(i, m4.compose(p, q, s))
    }
    im.instanceMatrix.needsUpdate = true
  }
  set(0.3)
  rbox(w + 0.02, 0.04, 0.05, mat, 0, h / 2 + 0.02, 0, g, 0.006)
  g.add(im)
  return { group: g, set }
}

// ——— People in the distance ———

/**
 * Background people for crowds: an instanced body (torso, arms, legs in one
 * silhouette), a head and hair, and an optional phone glow.
 */
export class Crowd {
  readonly group = new THREE.Group()
  readonly bodies: THREE.InstancedMesh
  readonly heads: THREE.InstancedMesh
  readonly hair: THREE.InstancedMesh
  readonly glows: THREE.InstancedMesh
  private dummy = new THREE.Object3D()

  constructor(
    readonly count: number,
    body: M,
    head: M,
    glow: M,
  ) {
    const parts: THREE.BufferGeometry[] = []
    const torso = new THREE.CapsuleGeometry(0.17, 0.42, 6, 14)
    torso.scale(1, 1, 0.62)
    torso.translate(0, 1.22, 0)
    parts.push(torso)
    const hips = new THREE.CapsuleGeometry(0.15, 0.12, 6, 12)
    hips.scale(1.05, 1, 0.7)
    hips.translate(0, 0.92, 0)
    parts.push(hips)
    for (const sx of [-1, 1]) {
      const leg = new THREE.CapsuleGeometry(0.068, 0.72, 6, 10)
      leg.translate(sx * 0.09, 0.47, 0)
      parts.push(leg)
      const shoe = new THREE.CapsuleGeometry(0.05, 0.13, 4, 8)
      shoe.rotateX(Math.PI / 2)
      shoe.translate(sx * 0.09, 0.05, 0.05)
      parts.push(shoe)
      const arm = new THREE.CapsuleGeometry(0.052, 0.56, 6, 10)
      arm.rotateZ(sx * 0.08)
      arm.translate(sx * 0.215, 1.1, 0)
      parts.push(arm)
    }
    const neck = new THREE.CylinderGeometry(0.05, 0.055, 0.12, 10)
    neck.translate(0, 1.5, 0)
    parts.push(neck)
    const bodyGeo = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))
    parts.forEach((p) => p.dispose())
    this.bodies = new THREE.InstancedMesh(bodyGeo, body, count)
    const headGeo = new THREE.SphereGeometry(0.1, 18, 14)
    headGeo.scale(0.9, 1.12, 1)
    this.heads = new THREE.InstancedMesh(headGeo, head, count)
    const hairGeo = new THREE.SphereGeometry(0.106, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)
    hairGeo.scale(0.92, 1.1, 1.04)
    this.hair = new THREE.InstancedMesh(hairGeo, hardware().plasticDark, count)
    this.glows = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.13), glow, count)
    for (const m of [this.bodies, this.heads, this.hair]) {
      m.castShadow = true
      m.receiveShadow = true
    }
    // People move every frame; a bounding sphere computed once would cull them wrongly.
    for (const m of [this.bodies, this.heads, this.hair, this.glows]) m.frustumCulled = false
    this.group.add(this.bodies, this.heads, this.hair, this.glows)
  }

  /** Places person i; `phone` lifts a small lit screen under the face (0 = none). */
  set(i: number, x: number, z: number, yaw: number, opts: { scale?: number; color?: THREE.Color; phone?: number; headDown?: number; visible?: boolean } = {}) {
    const d = this.dummy
    const s = opts.visible === false ? 0.0001 : (opts.scale ?? 1)
    d.position.set(x, 0, z)
    d.rotation.set(0, yaw, 0)
    d.scale.setScalar(s)
    d.updateMatrix()
    this.bodies.setMatrixAt(i, d.matrix)
    if (opts.color) this.bodies.setColorAt(i, opts.color)
    const down = opts.headDown ?? 0
    d.position.set(x + Math.sin(yaw) * 0.05 * down * s, (1.67 - 0.04 * down) * s, z + Math.cos(yaw) * 0.05 * down * s)
    d.rotation.set(0.35 * down, yaw, 0, 'YXZ')
    d.scale.setScalar(s)
    d.updateMatrix()
    this.heads.setMatrixAt(i, d.matrix)
    this.hair.setMatrixAt(i, d.matrix)
    const phone = opts.phone ?? 0
    d.position.set(x + Math.sin(yaw) * 0.28 * s, 1.3 * s, z + Math.cos(yaw) * 0.28 * s)
    d.rotation.set(-0.9, yaw, 0)
    d.scale.setScalar(phone > 0 ? s : 0.0001)
    d.updateMatrix()
    this.glows.setMatrixAt(i, d.matrix)
  }

  commit() {
    this.bodies.instanceMatrix.needsUpdate = true
    this.heads.instanceMatrix.needsUpdate = true
    this.hair.instanceMatrix.needsUpdate = true
    this.glows.instanceMatrix.needsUpdate = true
    if (this.bodies.instanceColor) this.bodies.instanceColor.needsUpdate = true
  }
}
