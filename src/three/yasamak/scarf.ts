/**
 * The mother's scarf as real knitted cloth: a thick, soft band swept along a
 * curve with garter ridges across it (one ridge every two rows, the way a
 * hand-knitted scarf catches the light), rounded edges and a slightly uneven
 * width. Used twice: the unfinished strip on her needles, and the same strip
 * wrapped once round his neck with its two ends hanging on his chest.
 */
import * as THREE from 'three'

const PI = Math.PI

export type RibbonOptions = {
  /** Width of the band (across), meters; may vary along the band (s 0…1). */
  width: number | ((s: number) => number)
  /** Thickness of the band (through), meters. */
  thick: number | ((s: number) => number)
  /** Desired direction of the band's width (projected off the tangent). A function gets s. */
  side: THREE.Vector3 | ((s: number, out: THREE.Vector3) => THREE.Vector3)
  /** Ridge pitch along the band, meters (0 = smooth). */
  ridge?: number
  /** Ridge height, meters. */
  ridgeDepth?: number
  /** Segments along the band and around its section. */
  lenSeg?: number
  ringSeg?: number
  /** Meters one texture tile covers (material.userData.meters); UVs are written in tiles. */
  meters?: number
  /** Close the ends with flat caps (open curves only). */
  caps?: boolean
}

const P = new THREE.Vector3()
const T = new THREE.Vector3()
const S = new THREE.Vector3()
const N = new THREE.Vector3()
const H = new THREE.Vector3()

/** A rounded-rectangle section (superellipse) at angle φ: [across, through] in units of half-size. */
function section(phi: number): [number, number] {
  const c = Math.cos(phi)
  const s = Math.sin(phi)
  const e = 2 / 5
  return [Math.sign(c) * Math.pow(Math.abs(c), e), Math.sign(s) * Math.pow(Math.abs(s), e)]
}

/**
 * Sweeps a knitted band along `curve`. The geometry is indexed and seamless
 * around its section (smooth normals); UVs run in texture tiles: u across the
 * band, v along it, so the stitch columns follow the scarf's length.
 */
export function knittedBand(curve: THREE.Curve<THREE.Vector3>, o: RibbonOptions): THREE.BufferGeometry {
  const closed = (curve as THREE.CatmullRomCurve3).closed === true
  const lenSeg = o.lenSeg ?? 96
  const ring = o.ringSeg ?? 14
  const meters = o.meters ?? 0.27
  const ridge = o.ridge ?? 0.011
  const depth = o.ridgeDepth ?? 0.0018
  const width = typeof o.width === 'number' ? () => o.width as number : o.width
  const thick = typeof o.thick === 'number' ? () => o.thick as number : o.thick
  const side = o.side instanceof THREE.Vector3 ? (_s: number, out: THREE.Vector3) => out.copy(o.side as THREE.Vector3) : o.side
  const length = curve.getLength()
  const rows = closed ? lenSeg : lenSeg + 1
  const pos: number[] = []
  const uv: number[] = []
  const index: number[] = []
  const frames: Array<{ p: THREE.Vector3; s: THREE.Vector3; n: THREE.Vector3; w: number; t: number }> = []
  for (let i = 0; i < rows; i++) {
    const s = i / lenSeg
    curve.getPointAt(Math.min(1, s), P)
    curve.getTangentAt(Math.min(1, s), T).normalize()
    side(s, H)
    S.copy(H).addScaledVector(T, -H.dot(T))
    if (S.lengthSq() < 1e-8) S.set(1, 0, 0)
    S.normalize()
    N.crossVectors(T, S).normalize()
    const w = width(s)
    const t = thick(s)
    frames.push({ p: P.clone(), s: S.clone(), n: N.clone(), w, t })
    // Garter ridges: the faces swell a little every `ridge` meters, the edges stay soft.
    const along = s * length
    const swell = ridge > 0 ? depth * (0.5 + 0.5 * Math.cos((along / ridge) * PI * 2)) : 0
    // Hand-knitted: the width breathes a little along the band.
    const wobble = 1 + 0.035 * Math.sin(along * 37.0) + 0.02 * Math.sin(along * 91.0 + 1.3)
    for (let j = 0; j < ring; j++) {
      const phi = (j / ring) * PI * 2
      const [a, b] = section(phi)
      const face = Math.pow(Math.abs(Math.sin(phi)), 3)
      const across = a * (w / 2) * wobble
      const through = b * (t / 2) + Math.sign(b) * swell * face
      pos.push(P.x + S.x * across + N.x * through, P.y + S.y * across + N.y * through, P.z + S.z * across + N.z * through)
      uv.push((across + w / 2) / meters, along / meters)
    }
  }
  const segs = closed ? lenSeg : lenSeg
  for (let i = 0; i < segs; i++) {
    const i2 = closed ? (i + 1) % rows : i + 1
    for (let j = 0; j < ring; j++) {
      const j2 = (j + 1) % ring
      const a = i * ring + j
      const b = i2 * ring + j
      const c = i2 * ring + j2
      const d = i * ring + j2
      index.push(a, b, d, b, c, d)
    }
  }
  if (!closed && o.caps !== false) {
    // Flat caps: their own vertices, so the band's rounded normals stay soft.
    for (const end of [0, rows - 1]) {
      const f = frames[end]
      const base = pos.length / 3
      pos.push(f.p.x, f.p.y, f.p.z)
      uv.push(0.5 / meters, 0)
      for (let j = 0; j < ring; j++) {
        const k = (end * ring + j) * 3
        pos.push(pos[k], pos[k + 1], pos[k + 2])
        uv.push(uv[(end * ring + j) * 2], uv[(end * ring + j) * 2 + 1])
      }
      for (let j = 0; j < ring; j++) {
        const j2 = (j + 1) % ring
        if (end === 0) index.push(base, base + 1 + j2, base + 1 + j)
        else index.push(base, base + 1 + j, base + 1 + j2)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(index)
  g.computeVertexNormals()
  g.computeBoundingBox()
  g.computeBoundingSphere()
  // UVs are already in tiles of this surface: keep applyMetricUVs off them.
  g.userData.metric = meters
  return g
}

/** Two steel knitting needles crossing through the last row (in the band's local frame: x across, y along). */
export function needles(mat: THREE.Material, len = 0.3) {
  const g = new THREE.Group()
  const shaft = new THREE.CylinderGeometry(0.0024, 0.0024, len, 8)
  const tip = new THREE.ConeGeometry(0.0024, 0.018, 8)
  const knob = new THREE.SphereGeometry(0.0055, 12, 8)
  for (const k of [-1, 1]) {
    // The two needles cross at a shallow angle, tips out on opposite sides.
    const n = new THREE.Group()
    n.rotation.z = k * (PI / 2 + 0.1)
    n.position.set(0.035 * k, 0.003 * k, 0.003 * k)
    const sh = new THREE.Mesh(shaft, mat)
    n.add(sh)
    const tp = new THREE.Mesh(tip, mat)
    tp.position.y = len / 2 + 0.009
    n.add(tp)
    const kb = new THREE.Mesh(knob, mat)
    kb.position.y = -len / 2 - 0.004
    n.add(kb)
    n.name = 'needle'
    g.add(n)
  }
  g.traverse((c) => (c.castShadow = true))
  return g
}
