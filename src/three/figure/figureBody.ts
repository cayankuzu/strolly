/**
 * Sculpted geometry for the cast. A head is a sphere pushed into a face
 * (brow, sockets, nose, cheekbones, lips, chin) so profiles read in
 * silhouette; hands, ears, brows and shoes are shaped the same way. The body
 * itself is a skinned surface (skin.ts).
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { smoothstep } from '@/lib/math'

const G = (x: number, s: number) => Math.exp(-(x * x) / (2 * s * s))

export type FaceShape = {
  /** Jaw narrowing toward the chin (0 soft – 1 angular). */
  jaw: number
  /** Nose tip projection. */
  nose: number
  /** Lip fullness. */
  lips: number
  /** Stubble darkening on the jaw (0 none). */
  stubble: number
}

export const MALE_FACE: FaceShape = { jaw: 0.3, nose: 0.2, lips: 0.045, stubble: 0.26 }

function sculpt(unit: THREE.Vector3, out: THREE.Vector3, radius: number, face: FaceShape | null) {
  const { x, y, z } = unit
  // A head is narrower than it is deep or tall (≈ 16 × 20 × 23 cm).
  let sx = 0.8
  const sy = 1.1
  let sz = 1.0
  const jaw = face?.jaw ?? 0.3
  if (y < -0.1) {
    // The jaw keeps its width down to its angle, then narrows to the chin.
    const t = (-y - 0.1) / 0.9
    sx *= 1 - jaw * Math.pow(t, 1.6) * 0.85
    if (z < 0) sz *= 1 - 0.2 * t
  }
  // The back of the skull: fuller above the nape, blended (a step here showed as a ridge).
  if (z < 0) sz *= 1 + 0.08 * smoothstep(-0.5, -0.1, y)
  let px = x * sx
  const py = y * sy
  let pz = z * sz
  if (face) {
    const front = Math.max(0, z)
    // A face is flatter than a ball: fill the lower front out toward a near-
    // vertical plane, so jaw and chin come forward under the mouth.
    const plane = 0.9 - 0.12 * Math.max(0, -y - 0.55)
    if (plane > z) pz += (plane - z) * 0.5 * G(x, 0.6) * smoothstep(-1.02, -0.7, y) * (1 - smoothstep(0.2, 0.55, y)) * smoothstep(0.05, 0.4, z)
    pz += 0.05 * G(y - 0.28, 0.07) * G(x, 0.42) * front
    for (const ex of [-0.39, 0.39]) pz -= 0.075 * G(x - ex, 0.13) * G(y - 0.13, 0.09) * front
    // Nose: a bridge from between the eyes, a tip, wings at its base.
    const nose = G(x, 0.085) * front
    pz += nose * (0.05 * G(y + 0.02, 0.14) + face.nose * 1.1 * G(y + 0.3, 0.08))
    for (const nx of [-0.12, 0.12]) pz += 0.05 * G(x - nx, 0.065) * G(y + 0.35, 0.05) * front
    // Cheekbones, under and outside the eyes.
    for (const cx of [-0.52, 0.52]) {
      const k = 0.045 * G(x - cx, 0.18) * G(y + 0.12, 0.14) * front
      px += Math.sign(cx) * k
      pz += k * 0.5
    }
    // Philtrum, lips and the line between them.
    pz += 0.012 * G(x, 0.07) * G(y + 0.47, 0.05) * front
    pz += face.lips * G(x, 0.2) * G(y + 0.57, 0.05) * front
    pz -= 0.028 * G(x, 0.24) * G(y + 0.62, 0.022) * front
    pz += face.lips * 0.8 * G(x, 0.17) * G(y + 0.67, 0.04) * front
    // The hollow under the lower lip, then the chin.
    pz -= 0.016 * G(x, 0.16) * G(y + 0.75, 0.035) * front
    pz += 0.075 * G(x, 0.21) * G(y + 0.87, 0.07) * front
  }
  return out.set(px * radius, py * radius, pz * radius)
}

/** A point on the sculpted head surface in the direction `dir` (head-geometry space). */
export function headPoint(dir: THREE.Vector3, radius: number, face: FaceShape | null, out = new THREE.Vector3()) {
  return sculpt(dir.clone().normalize(), out, radius, face)
}

/** The head, with stubble and lip colour through vertex colours. */
export function headGeometry(radius: number, face: FaceShape, style: HairStyle = 'short') {
  const geo = new THREE.SphereGeometry(1, 112, 84)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const unit = new THREE.Vector3()
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    unit.fromBufferAttribute(pos, i)
    sculpt(unit, p, radius, face)
    pos.setXYZ(i, p.x, p.y, p.z)
    const front = Math.max(0, unit.z)
    const lips = G(unit.x, 0.19) * G(unit.y + 0.62, 0.06) * front
    const parting = G(unit.x, 0.16) * G(unit.y + 0.62, 0.02) * front
    // Stubble: jaw, chin and upper lip, not the cheeks; cool rather than dark.
    const stubble = 0.65 * smoothstep(-0.3, -0.58, unit.y) * smoothstep(-0.35, 0.2, unit.z) * (1 - lips)
    // Natural shading of a face: deeper tone in the sockets, warmth on the cheeks and nose.
    let socket = 0
    let cheek = 0
    for (const ex of [-0.39, 0.39]) {
      socket += G(unit.x - ex, 0.14) * G(unit.y - 0.11, 0.09) * front
      cheek += G(unit.x - ex * 1.25, 0.18) * G(unit.y + 0.25, 0.14) * front
    }
    const nose = G(unit.x, 0.08) * G(unit.y + 0.22, 0.12) * front
    // Baked occlusion where a face is never fully lit: under the brow, under
    // the nose, the corners of the mouth, under the chin.
    const underNose = G(unit.x, 0.11) * G(unit.y + 0.42, 0.035) * front
    const corners = (G(unit.x - 0.2, 0.05) + G(unit.x + 0.2, 0.05)) * G(unit.y + 0.62, 0.03) * front
    // Hair grows in, it does not start at an edge: the scalp darkens just below the hairline.
    const below = hairlineAt(style, unit.x, unit.z) - unit.y
    // (Lighter at the forehead, where a shadow band would read as dirt.)
    const growth = smoothstep(0.16, 0.0, below) * smoothstep(-0.04, 0.02, below) * (style === 'short' ? 1 : 0.6) * (1 - 0.6 * smoothstep(0.3, 0.8, unit.z))
    // The fold above each eye, and a little shadow under it.
    let crease = 0
    for (const ex of [-0.39, 0.39]) crease += G(unit.x - ex, 0.11) * (G(unit.y - 0.22, 0.022) + 0.6 * G(unit.y - 0.03, 0.025)) * front
    const underChin = smoothstep(-0.9, -1, unit.y) * front
    const c = (1 - 0.22 * socket) * (1 - 0.38 * parting) * (1 - 0.14 * underNose) * (1 - 0.12 * corners) * (1 - 0.2 * underChin) * (1 - 0.45 * growth) * (1 - 0.16 * crease)
    const st = face.stubble * stubble
    colors[i * 3] = c * (1 - 0.95 * st) * (1 + 0.04 * lips + 0.035 * cheek + 0.025 * nose)
    colors[i * 3 + 1] = c * (1 - 0.88 * st) * (1 - 0.4 * lips - 0.05 * cheek - 0.03 * nose)
    colors[i * 3 + 2] = c * (1 - 0.78 * st) * (1 - 0.3 * lips - 0.05 * cheek - 0.03 * nose)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

export type HairStyle = 'short' | 'long'

/** Where the hair starts, as a height on the unit head for a direction (ux, uz). */
function hairlineAt(style: HairStyle, ux: number, uz: number) {
  // Short: off the forehead, just above the ears, down to the nape at the back.
  // (The skull is round down to where the neck meets it, so at the back the hair goes that far.)
  if (style === 'short') return 0.5 - 0.42 * smoothstep(1, 0, uz) - 1.15 * smoothstep(0, -0.6, uz) + 0.1 * G(Math.abs(ux) - 0.55, 0.15) * Math.max(0, uz)
  if (uz > 0.42) return 0.44 + 0.06 * G(Math.abs(ux) - 0.5, 0.15)
  return -1.1 + 0.75 * smoothstep(-1, 0.42, uz)
}

/**
 * Hair: a slightly larger shell of the skull cut along a hairline. Long hair
 * frames the face and falls past the jaw toward the shoulders.
 */
export function hairGeometry(radius: number, style: HairStyle) {
  const src = new THREE.SphereGeometry(1, 144, 108)
  const pos = src.attributes.position as THREE.BufferAttribute
  const index = src.index!
  const unit = new THREE.Vector3()
  const p = new THREE.Vector3()
  const hairline = (ux: number, uz: number) => hairlineAt(style, ux, uz)
  // Keep only triangles near or above the hairline (the rest are hidden anyway).
  const keep: number[] = []
  for (let i = 0; i < index.count; i += 3) {
    let above = false
    for (let k = 0; k < 3; k++) {
      const vi = index.getX(i + k)
      if (pos.getY(vi) > hairline(pos.getX(vi), pos.getZ(vi)) - 0.08) above = true
    }
    if (above) keep.push(index.getX(i), index.getX(i + 1), index.getX(i + 2))
  }
  for (let i = 0; i < pos.count; i++) {
    unit.fromBufferAttribute(pos, i)
    sculpt(unit, p, radius, null)
    // Volume grows smoothly toward the crown (a kink here showed as a crease round the head).
    // (A ripple term here read as cornrows; the strands are in the texture instead.)
    const tuft = 1 + 0.035 * smoothstep(-0.6, 1, unit.y) + 0.003 * Math.sin(unit.x * 23 + unit.z * 7)
    // Below the hairline the shell sinks under the scalp: the visible edge is smooth.
    const below = smoothstep(0, -0.05, unit.y - hairline(unit.x, unit.z))
    const tuck = 1 - 0.09 * below
    let y = p.y * 1.05 * tuft * tuck
    let flare = tuck
    if (style === 'long' && unit.z < 0.45 && unit.y < 0.2) {
      // Let the back and sides fall: stretch downward and away from the neck.
      const fall = (0.2 - unit.y) * 0.62
      y -= fall * radius
      flare = 1 + 0.12 * fall
    }
    pos.setXYZ(i, p.x * 1.05 * tuft * flare, y, p.z * 1.05 * tuft * tuck * (style === 'long' ? 1.04 : 1))
  }
  src.setIndex(keep)
  src.computeVertexNormals()
  return src
}

// ——— Hands, ears, brows, shoes ———

const ni = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g)

/** A segment of a finger: a capsule from `a` along direction `d`. */
function phalanx(a: THREE.Vector3, d: THREE.Vector3, len: number, r: number) {
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r * 0.6), 4, 8)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d))
  const mid = a.clone().addScaledVector(d, len / 2)
  g.translate(mid.x, mid.y, mid.z)
  return ni(g)
}

/**
 * A relaxed hand hanging from the wrist (fingers toward −y, palm facing −z,
 * thumb on the inner side `−sx`): palm, four three-jointed fingers with a
 * gentle curl, a two-jointed thumb and the pad at its root. One geometry.
 */
export function handGeometry(sx: number, scale: number, curl = 0.22) {
  const parts: THREE.BufferGeometry[] = []
  const palm = new RoundedBoxGeometry(0.074, 0.088, 0.026, 3, 0.011)
  palm.translate(0, -0.05, 0)
  parts.push(ni(palm))
  const pad = new THREE.SphereGeometry(0.019, 12, 10)
  pad.scale(1, 1.3, 0.75)
  pad.translate(-sx * 0.024, -0.042, -0.007)
  parts.push(ni(pad))
  // Index (inner) to little finger (outer).
  const fingers = [
    { x: -0.026, len: 0.076, r: 0.0085 },
    { x: -0.0085, len: 0.084, r: 0.0088 },
    { x: 0.0085, len: 0.079, r: 0.0084 },
    { x: 0.025, len: 0.063, r: 0.0074 },
  ]
  for (const [i, f] of fingers.entries()) {
    const a = new THREE.Vector3(sx * f.x, -0.092 + Math.abs(i - 1.5) * 0.004, 0)
    const d = new THREE.Vector3(sx * f.x * 0.12, -1, 0).normalize()
    const lens = [0.45, 0.31, 0.24].map((k) => k * f.len)
    lens.forEach((len, k) => {
      parts.push(phalanx(a, d, len, f.r * (1 - k * 0.1)))
      a.addScaledVector(d, len * 0.92)
      // Each joint folds a little toward the palm (−z).
      d.applyAxisAngle(new THREE.Vector3(1, 0, 0), curl * (1 + k * 0.4) * (1 + i * 0.12))
    })
  }
  const ta = new THREE.Vector3(-sx * 0.03, -0.028, -0.006)
  const td = new THREE.Vector3(-sx * 0.55, -0.75, -0.35).normalize()
  for (const [k, len] of [0.034, 0.03].entries()) {
    parts.push(phalanx(ta, td, len, 0.0098 - k * 0.0008))
    ta.addScaledVector(td, len * 0.9)
    td.applyAxisAngle(new THREE.Vector3(0, 1, 0), sx * 0.3).normalize()
    td.y -= 0.25
    td.normalize()
  }
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  g.scale(scale, scale, scale)
  g.computeVertexNormals()
  return g
}

/** An outer ear: the rim (helix), the bowl and the lobe. Faces +x for sx = 1. */
export function earGeometry(sx: number) {
  const parts: THREE.BufferGeometry[] = []
  const shell = new THREE.SphereGeometry(0.022, 16, 14)
  shell.scale(0.78, 1.18, 0.34)
  parts.push(ni(shell))
  const helix = new THREE.TorusGeometry(0.0175, 0.0042, 8, 20, Math.PI * 1.3)
  helix.rotateZ(-Math.PI * 0.05)
  helix.scale(0.82, 1.3, 1)
  helix.translate(0, 0.002, 0.0035)
  parts.push(ni(helix))
  const lobe = new THREE.SphereGeometry(0.0078, 10, 8)
  lobe.scale(0.95, 1.15, 0.55)
  lobe.translate(0.002, -0.024, 0.001)
  parts.push(ni(lobe))
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  // The ear's flat side lies against the head (local z → world ±x).
  g.rotateY((sx * Math.PI) / 2)
  g.computeVertexNormals()
  return g
}

/** An eyebrow: a tapered arch of hair over the eye socket. */
/** An eyebrow lying on the brow ridge of the head (head-geometry space). */
export function browGeometry(sx: number, radius: number, face: FaceShape, thickness = 1) {
  const k = radius / 0.105
  const pts = [
    [0.17, 0.235],
    [0.36, 0.29],
    [0.55, 0.28],
    [0.68, 0.23],
  ].map(([ux, uy]) => {
    const dir = new THREE.Vector3(sx * ux, uy, Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy)))
    const p = headPoint(dir, radius, face)
    return p.addScaledVector(dir.normalize(), 0.0016)
  })
  const curve = new THREE.CatmullRomCurve3(pts)
  const g = new THREE.TubeGeometry(curve, 12, 0.0041 * k * thickness, 5, false)
  // Taper toward the outer end.
  const pos = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  const c = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    const t = Math.floor(i / 6) / 12
    curve.getPoint(Math.min(1, t), c)
    v.fromBufferAttribute(pos, i).sub(c).multiplyScalar(1.15 - t * 0.6)
    pos.setXYZ(i, c.x + v.x, c.y + v.y * 0.8, c.z + v.z)
  }
  g.computeVertexNormals()
  return g
}

/** A shoe: a shaped upper with a rounded toe on a sole with a heel (toe toward +z). */
export function shoeGeometry() {
  const upper = new THREE.SphereGeometry(1, 24, 14)
  const p = upper.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    // Long, low, wider at the ball of the foot, flat underneath.
    const z = v.z * 0.135 + 0.05
    const width = 0.046 * (1 + 0.12 * Math.exp(-((v.z - 0.35) ** 2) / 0.1))
    const y = v.y < 0 ? v.y * 0.012 : v.y * (0.055 - 0.03 * Math.max(0, v.z))
    p.setXYZ(i, v.x * width, y - 0.045, z)
  }
  upper.computeVertexNormals()
  return upper
}
