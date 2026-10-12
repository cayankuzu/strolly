/**
 * PARALEL-LEŞ — custom geometry: grids with free sample spacing, tapered
 * tubes (trunks, branches, ropes), leaf and grass cards.
 */
import * as THREE from 'three'
import { PI } from './common'

/**
 * A grid surface from per-row/column samples: `at(i, j, out)` writes the
 * vertex for column i (0..nu) and row j (0..nv). UVs are in meters (along
 * the surface) divided by `meters`.
 */
export function gridSurface(nu: number, nv: number, at: (i: number, j: number, out: THREE.Vector3) => void, meters = 1, color?: (i: number, j: number, p: THREE.Vector3, out: THREE.Color) => void) {
  const count = (nu + 1) * (nv + 1)
  const pos = new Float32Array(count * 3)
  const uv = new Float32Array(count * 2)
  const col = color ? new Float32Array(count * 3) : null
  const v = new THREE.Vector3()
  const prevRow: THREE.Vector3[] = []
  const c = new THREE.Color()
  const vAcc = new Float32Array(nu + 1)
  for (let j = 0; j <= nv; j++) {
    let uAcc = 0
    let prev: THREE.Vector3 | null = null
    for (let i = 0; i <= nu; i++) {
      at(i, j, v)
      const k = j * (nu + 1) + i
      pos[k * 3] = v.x
      pos[k * 3 + 1] = v.y
      pos[k * 3 + 2] = v.z
      if (prev) uAcc += v.distanceTo(prev)
      if (j > 0 && prevRow[i]) vAcc[i] += v.distanceTo(prevRow[i])
      uv[k * 2] = uAcc / meters
      uv[k * 2 + 1] = vAcc[i] / meters
      if (col && color) {
        color(i, j, v, c)
        c.toArray(col, k * 3)
      }
      prev = (prev ?? new THREE.Vector3()).copy(v)
      prevRow[i] = (prevRow[i] ?? new THREE.Vector3()).copy(v)
    }
  }
  const index: number[] = []
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i
      const b = a + 1
      const d = a + nu + 1
      const e = d + 1
      index.push(a, d, b, b, d, e)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  geo.setIndex(index)
  geo.computeVertexNormals()
  return geo
}

/** Samples 0..1 bunched toward `focus` (0..1) with strength k (1 = uniform). */
export function bunched(n: number, focus: number, k: number) {
  const out: number[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const d = t - focus
    const span = d >= 0 ? 1 - focus : focus
    const r = span > 0 ? Math.abs(d) / span : 0
    out.push(focus + Math.sign(d) * span * Math.pow(r, k))
  }
  return out
}

/**
 * A tube along a curve with a radius that varies along it (and a little
 * gnarl noise). UVs in meters / `meters` so bark keeps its scale.
 */
export function taperTube(points: THREE.Vector3[], radius: (t: number) => number, opts: { segments?: number; radial?: number; meters?: number; gnarl?: number; seed?: number; closed?: boolean } = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
  const seg = opts.segments ?? 32
  const rad = opts.radial ?? 12
  const meters = opts.meters ?? 1
  const frames = curve.computeFrenetFrames(seg, false)
  const len = curve.getLength()
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const seed = opts.seed ?? 1
  const gnarl = opts.gnarl ?? 0
  for (let i = 0; i <= seg; i++) {
    const t = i / seg
    curve.getPointAt(t, p)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    const r0 = radius(t)
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * PI * 2
      const wob = gnarl ? 1 + gnarl * (Math.sin(a * 3 + t * 17 + seed) * 0.5 + Math.sin(a * 5 - t * 29 + seed * 2) * 0.3 + Math.sin(t * 41 + seed) * 0.2) : 1
      const r = r0 * wob
      n.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a)).normalize()
      pos.push(p.x + n.x * r, p.y + n.y * r, p.z + n.z * r)
      nor.push(n.x, n.y, n.z)
      uv.push(((j / rad) * PI * 2 * r0) / meters, (t * len) / meters)
    }
  }
  const index: number[] = []
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < rad; j++) {
      const a = i * (rad + 1) + j
      const b = a + rad + 1
      index.push(a, b, a + 1, a + 1, b, b + 1)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(index)
  if (gnarl) geo.computeVertexNormals()
  geo.userData.metric = meters
  return geo
}

/** A tuft of grass blades (crossed curved strips), base at the origin. */
export function tuftGeometry(blades = 7, height = 0.35, seed = 3) {
  const parts: number[] = []
  const idx: number[] = []
  let base = 0
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let b = 0; b < blades; b++) {
    const a = rnd() * PI * 2
    const lean = 0.15 + rnd() * 0.35
    const h = height * (0.6 + rnd() * 0.6)
    const w = 0.018 + rnd() * 0.012
    const ox = (rnd() - 0.5) * 0.08
    const oz = (rnd() - 0.5) * 0.08
    const dx = Math.cos(a)
    const dz = Math.sin(a)
    for (let k = 0; k <= 3; k++) {
      const t = k / 3
      const y = h * t
      const off = lean * h * t * t
      const ww = w * (1 - t * 0.9)
      parts.push(ox + dx * off - dz * ww, y, oz + dz * off + dx * ww, ox + dx * off + dz * ww, y, oz + dz * off - dx * ww)
    }
    for (let k = 0; k < 3; k++) {
      const a0 = base + k * 2
      idx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2)
    }
    base += 8
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(parts, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  // Normals up-ish, so the tuft lights like a meadow and not like paper.
  const n = geo.attributes.normal as THREE.BufferAttribute
  for (let i = 0; i < n.count; i++) {
    const y = n.getY(i)
    n.setXYZ(i, n.getX(i) * 0.4, Math.abs(y) * 0.4 + 0.9, n.getZ(i) * 0.4)
  }
  geo.normalizeNormals()
  const uv = new Float32Array((parts.length / 3) * 2)
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geo
}

/** A cluster of leaves: a few small quads around a point. */
export function leafCluster(n = 9, size = 0.09, spread = 0.28, seed = 5) {
  const pos: number[] = []
  const idx: number[] = []
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const v = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    const c = new THREE.Vector3((rnd() - 0.5) * spread, (rnd() - 0.5) * spread * 0.6, (rnd() - 0.5) * spread)
    e.set(rnd() * PI, rnd() * PI * 2, rnd() * PI)
    q.setFromEuler(e)
    const sz = size * (0.7 + rnd() * 0.6)
    const corners = [
      [0, -sz],
      [sz * 0.5, 0],
      [0, sz],
      [-sz * 0.5, 0],
    ]
    for (const [x, y] of corners) {
      v.set(x, y, 0).applyQuaternion(q).add(c)
      pos.push(v.x, v.y, v.z)
    }
    const b = i * 4
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

/** A low pine: a trunk and three stacked cones, merged (for instancing). */
export function pineGeometry() {
  const parts = [new THREE.CylinderGeometry(0.06, 0.1, 1, 5).translate(0, 0.5, 0)]
  for (let k = 0; k < 3; k++) {
    const r = 0.55 - k * 0.14
    parts.push(new THREE.ConeGeometry(r, 1.0 - k * 0.15, 7).translate(0, 1.0 + k * 0.45, 0))
  }
  return mergeAll(parts)
}

/** A rounded deciduous crown on a short trunk (for instancing). */
export function crownGeometry() {
  const parts = [new THREE.CylinderGeometry(0.05, 0.08, 0.8, 5).translate(0, 0.4, 0), new THREE.IcosahedronGeometry(0.6, 1).scale(1, 0.85, 1).translate(0, 1.15, 0)]
  return mergeAll(parts)
}

export function mergeAll(parts: THREE.BufferGeometry[]) {
  const geos = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k)
    return g
  })
  let total = 0
  for (const g of geos) total += g.attributes.position.count
  const pos = new Float32Array(total * 3)
  const nor = new Float32Array(total * 3)
  const uv = new Float32Array(total * 2)
  let o = 0
  for (const g of geos) {
    pos.set(g.attributes.position.array as Float32Array, o * 3)
    nor.set(g.attributes.normal.array as Float32Array, o * 3)
    uv.set(g.attributes.uv.array as Float32Array, o * 2)
    o += g.attributes.position.count
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return out
}
