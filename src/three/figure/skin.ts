/**
 * A continuous body for the figure rig: one skin from the neck to the wrists
 * and ankles, so shoulders, armpits, hips and knees bend as a surface instead
 * of meeting as balls and tubes.
 *
 * The body is modelled as a signed distance field (smooth unions of tapered
 * capsules and ellipsoids, in an A-pose), meshed once per build with surface
 * nets, then skinned to the rig's bones by distance. It is split into three
 * pieces by the bone that owns each triangle — neck (skin), torso and arms
 * (top), pelvis and legs (bottom) — so each wears its own material; the
 * collar, hem, cuffs and shoes the rig adds cover the seams.
 */
import * as THREE from 'three'

export type BuildParams = { chest: number; chestR: number; waist: number; hip: number; arm: number; leg: number; upperR: number }

type V = [number, number, number]
type Prim = { d: (x: number, y: number, z: number) => number; min: V; max: V; k: number }

/** The A-pose the body is modelled and bound in (radians). */
export const BIND = { arm: 0.38, leg: 0.06 }

/** Rest positions of the rig's joints in the bind pose (root at the origin). */
export function bindJoints(b: BuildParams) {
  const hips = 0.985
  const chest = hips + 0.1 + 0.17
  const shoulderY = chest + 0.215
  const sa = Math.sin(BIND.arm)
  const ca = Math.cos(BIND.arm)
  const sl = Math.sin(BIND.leg)
  const cl = Math.cos(BIND.leg)
  const side = (sx: number) => {
    const shoulder: V = [sx * b.arm, shoulderY, 0]
    const elbow: V = [shoulder[0] + sx * 0.29 * sa, shoulderY - 0.29 * ca, 0]
    const wrist: V = [elbow[0] + sx * 0.26 * sa, elbow[1] - 0.26 * ca, 0]
    const hip: V = [sx * b.leg, hips - 0.05, 0]
    const knee: V = [hip[0] + sx * 0.44 * sl, hip[1] - 0.44 * cl, 0]
    const ankle: V = [knee[0] + sx * 0.43 * sl, knee[1] - 0.43 * cl, 0]
    return { shoulder, elbow, wrist, hip, knee, ankle }
  }
  return { hips, spine: hips + 0.1, chest, neck: chest + 0.28, l: side(1), r: side(-1) }
}

// ——— Distance functions ———

function roundCone(a: V, b: V, ra: number, rb: number) {
  const bax = b[0] - a[0]
  const bay = b[1] - a[1]
  const baz = b[2] - a[2]
  const l2 = bax * bax + bay * bay + baz * baz
  return (x: number, y: number, z: number) => {
    const px = x - a[0]
    const py = y - a[1]
    const pz = z - a[2]
    const h = Math.min(1, Math.max(0, (px * bax + py * bay + pz * baz) / l2))
    const dx = px - bax * h
    const dy = py - bay * h
    const dz = pz - baz * h
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h)
  }
}

function ellipsoid(c: V, r: V) {
  return (x: number, y: number, z: number) => {
    const qx = (x - c[0]) / r[0]
    const qy = (y - c[1]) / r[1]
    const qz = (z - c[2]) / r[2]
    const k0 = Math.sqrt(qx * qx + qy * qy + qz * qz)
    const k1 = Math.sqrt((qx / r[0]) ** 2 + (qy / r[1]) ** 2 + (qz / r[2]) ** 2)
    return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(r[0], r[1], r[2])
  }
}

const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b)
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

function capsulePrim(a: V, b: V, ra: number, rb: number, k: number): Prim {
  const r = Math.max(ra, rb) + k
  return { d: roundCone(a, b, ra, rb), min: [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r], max: [Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r], k }
}

function ellipsoidPrim(c: V, r: V, k: number): Prim {
  return { d: ellipsoid(c, r), min: [c[0] - r[0] - k, c[1] - r[1] - k, c[2] - r[2] - k], max: [c[0] + r[0] + k, c[1] + r[1] + k, c[2] + r[2] + k], k }
}

function bodyPrims(b: BuildParams, female: boolean) {
  const J = bindJoints(b)
  const P: Prim[] = []
  // Torso: pelvis, abdomen, ribcage, the shoulder girdle and the trapezius.
  P.push(ellipsoidPrim([0, J.hips, -0.006], [0.148 * b.hip, 0.112, 0.104], 0.05))
  P.push(ellipsoidPrim([0, J.spine + 0.04, 0.006], [0.128 * b.waist, 0.13, 0.094], 0.06))
  P.push(ellipsoidPrim([0, J.chest + 0.075, 0.0], [0.152 * b.chest, 0.168, 0.108 * b.chestR], 0.06))
  P.push(capsulePrim([-0.135 * b.chest, J.chest + 0.2, -0.012], [0.135 * b.chest, J.chest + 0.2, -0.012], 0.054, 0.054, 0.05))
  for (const sx of [-1, 1]) P.push(capsulePrim([0, J.neck - 0.005, -0.022], [sx * 0.14, J.chest + 0.215, -0.016], 0.046, 0.04, 0.04))
  // The neck rises from behind the collarbones (its base sits back from the chest).
  P.push(capsulePrim([0, J.neck - 0.045, -0.014], [0, J.neck + 0.13, 0.01], female ? 0.05 : 0.056, female ? 0.043 : 0.048, 0.035))
  for (const sx of [-1, 1]) {
    if (female) P.push(ellipsoidPrim([sx * 0.064, J.chest + 0.05, 0.072], [0.06, 0.056, 0.05], 0.045))
    // His chest: broad and flat, not rounded.
    else P.push(ellipsoidPrim([sx * 0.064, J.chest + 0.11, 0.042], [0.088, 0.045, 0.024], 0.06))
    // Glutes: fuller on her, flatter on him.
    if (female) P.push(ellipsoidPrim([sx * 0.07, J.hips - 0.04, -0.052], [0.088 * b.hip, 0.098, 0.074], 0.04))
    else P.push(ellipsoidPrim([sx * 0.066, J.hips - 0.035, -0.04], [0.078 * b.hip, 0.085, 0.06], 0.04))
  }
  // Arms and legs.
  for (const s of [J.l, J.r]) {
    const sx = Math.sign(s.shoulder[0])
    const r = b.upperR
    P.push(capsulePrim(s.shoulder, s.elbow, r + 0.004, r - 0.008, 0.03))
    // Deltoid: rounds the shoulder without padding it.
    P.push(ellipsoidPrim([s.shoulder[0] + sx * 0.01, s.shoulder[1] - 0.03, 0], female ? [0.044, 0.064, 0.046] : [0.05, 0.07, 0.051], 0.035))
    P.push(capsulePrim(s.elbow, s.wrist, r - 0.006, r - 0.019, 0.02))
    const fm: V = [s.elbow[0] + (s.wrist[0] - s.elbow[0]) * 0.28, s.elbow[1] + (s.wrist[1] - s.elbow[1]) * 0.28, 0.004]
    P.push(ellipsoidPrim(fm, [r - 0.004, 0.07, r - 0.008], 0.02))
    P.push(capsulePrim(s.hip, s.knee, female ? 0.08 : 0.077, 0.052, 0.04))
    P.push(capsulePrim(s.knee, s.ankle, 0.05, 0.034, 0.025))
    P.push(ellipsoidPrim([s.knee[0], s.knee[1] - 0.13, -0.022], [0.048, 0.105, 0.05], 0.03))
    P.push(ellipsoidPrim([s.knee[0], s.knee[1], 0.03], [0.04, 0.042, 0.025], 0.02))
  }
  return P
}

function makeField(prims: Prim[]) {
  return (x: number, y: number, z: number) => {
    let d = 1
    for (const p of prims) {
      if (x < p.min[0] || y < p.min[1] || z < p.min[2] || x > p.max[0] || y > p.max[1] || z > p.max[2]) continue
      d = smin(d, p.d(x, y, z), p.k)
    }
    return d
  }
}

// ——— Meshing: naive surface nets ———

function surfaceNets(field: (x: number, y: number, z: number) => number, min: V, max: V, cell: number) {
  const nx = Math.ceil((max[0] - min[0]) / cell) + 1
  const ny = Math.ceil((max[1] - min[1]) / cell) + 1
  const nz = Math.ceil((max[2] - min[2]) / cell) + 1
  const vals = new Float32Array(nx * ny * nz)
  const id = (i: number, j: number, k: number) => (k * ny + j) * nx + i
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) vals[id(i, j, k)] = field(min[0] + i * cell, min[1] + j * cell, min[2] + k * cell)
  const cx = nx - 1
  const cy = ny - 1
  const cz = nz - 1
  const cellVert = new Int32Array(cx * cy * cz).fill(-1)
  const cid = (i: number, j: number, k: number) => (k * cy + j) * cx + i
  const positions: number[] = []
  const corners: V[] = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ]
  const edges = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  const v = new Float32Array(8)
  for (let k = 0; k < cz; k++)
    for (let j = 0; j < cy; j++)
      for (let i = 0; i < cx; i++) {
        let mask = 0
        for (let c = 0; c < 8; c++) {
          const [a, b2, d] = corners[c]
          v[c] = vals[id(i + a, j + b2, k + d)]
          if (v[c] < 0) mask |= 1 << c
        }
        if (mask === 0 || mask === 255) continue
        let sx = 0
        let sy = 0
        let sz = 0
        let n = 0
        for (const [e0, e1] of edges) {
          const a0 = v[e0] < 0
          if (a0 === v[e1] < 0) continue
          const t = v[e0] / (v[e0] - v[e1])
          const p0 = corners[e0]
          const p1 = corners[e1]
          sx += p0[0] + (p1[0] - p0[0]) * t
          sy += p0[1] + (p1[1] - p0[1]) * t
          sz += p0[2] + (p1[2] - p0[2]) * t
          n++
        }
        cellVert[cid(i, j, k)] = positions.length / 3
        positions.push(min[0] + (i + sx / n) * cell, min[1] + (j + sy / n) * cell, min[2] + (k + sz / n) * cell)
      }
  // A quad for every grid edge the surface crosses, joining the four cells around it.
  const index: number[] = []
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return
    if (flip) index.push(a, b, c, a, c, d)
    else index.push(a, c, b, a, d, c)
  }
  for (let k = 1; k < cz; k++)
    for (let j = 1; j < cy; j++)
      for (let i = 0; i < cx; i++) {
        const s0 = vals[id(i, j, k)] < 0
        if (s0 === vals[id(i + 1, j, k)] < 0) continue
        quad(cellVert[cid(i, j - 1, k - 1)], cellVert[cid(i, j, k - 1)], cellVert[cid(i, j, k)], cellVert[cid(i, j - 1, k)], s0)
      }
  for (let k = 1; k < cz; k++)
    for (let j = 0; j < cy; j++)
      for (let i = 1; i < cx; i++) {
        const s0 = vals[id(i, j, k)] < 0
        if (s0 === vals[id(i, j + 1, k)] < 0) continue
        quad(cellVert[cid(i - 1, j, k - 1)], cellVert[cid(i - 1, j, k)], cellVert[cid(i, j, k)], cellVert[cid(i, j, k - 1)], s0)
      }
  for (let k = 0; k < cz; k++)
    for (let j = 1; j < cy; j++)
      for (let i = 1; i < cx; i++) {
        const s0 = vals[id(i, j, k)] < 0
        if (s0 === vals[id(i, j, k + 1)] < 0) continue
        quad(cellVert[cid(i - 1, j - 1, k)], cellVert[cid(i, j - 1, k)], cellVert[cid(i, j, k)], cellVert[cid(i - 1, j, k)], s0)
      }
  return { positions: new Float32Array(positions), index }
}

// ——— Skinning ———

/** Joint indices (in the rig's JOINTS order) the body is weighted to. */
export type BoneRef = { hips: number; spine: number; chest: number; neck: number; lUpper: number; lFore: number; rUpper: number; rFore: number; lThigh: number; lShin: number; rThigh: number; rShin: number }

type Region = 'skin' | 'top' | 'waist' | 'bottom'
export type BodyPieces = Record<Region, THREE.BufferGeometry | null>

const cache = new Map<string, BodyPieces>()

/** The body for a build, meshed once and shared (callers clone what they keep). */
export function bodyGeometry(b: BuildParams, female: boolean, bones: BoneRef): BodyPieces {
  const key = `${female ? 'f' : 'm'}:${b.chest}:${b.hip}:${b.arm}:${b.leg}`
  const hit = cache.get(key)
  if (hit) return hit
  const J = bindJoints(b)
  const field = makeField(bodyPrims(b, female))
  const { positions, index } = surfaceNets(field, [-0.44, 0.03, -0.19], [0.44, J.neck + 0.16, 0.19], 0.0095)
  const count = positions.length / 3
  // Normals from the field's gradient: smooth everywhere, no faceting.
  const normals = new Float32Array(count * 3)
  const e = 0.002
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3]
    const y = positions[i * 3 + 1]
    const z = positions[i * 3 + 2]
    const gx = field(x + e, y, z) - field(x - e, y, z)
    const gy = field(x, y + e, z) - field(x, y - e, z)
    const gz = field(x, y, z + e) - field(x, y, z - e)
    const l = Math.hypot(gx, gy, gz) || 1
    normals[i * 3] = gx / l
    normals[i * 3 + 1] = gy / l
    normals[i * 3 + 2] = gz / l
  }
  // Each vertex follows its two nearest bones, blended by distance.
  type Seg = { bone: number; a: V; b: V; r: number; region: Region }
  const segs: Seg[] = [
    { bone: bones.hips, a: [0, J.hips - 0.06, 0], b: [0, J.spine, 0], r: 0.1, region: 'bottom' },
    { bone: bones.spine, a: [0, J.spine, 0], b: [0, J.chest, 0], r: 0.1, region: 'waist' },
    { bone: bones.chest, a: [0, J.chest, 0], b: [0, J.neck - 0.03, 0], r: 0.115, region: 'top' },
    { bone: bones.neck, a: [0, J.neck, 0], b: [0, J.neck + 0.16, 0], r: 0.03, region: 'skin' },
    { bone: bones.lUpper, a: J.l.shoulder, b: J.l.elbow, r: 0.012, region: 'top' },
    { bone: bones.lFore, a: J.l.elbow, b: J.l.wrist, r: 0.01, region: 'top' },
    { bone: bones.rUpper, a: J.r.shoulder, b: J.r.elbow, r: 0.012, region: 'top' },
    { bone: bones.rFore, a: J.r.elbow, b: J.r.wrist, r: 0.01, region: 'top' },
    { bone: bones.lThigh, a: J.l.hip, b: J.l.knee, r: 0.02, region: 'bottom' },
    { bone: bones.lShin, a: J.l.knee, b: J.l.ankle, r: 0.012, region: 'bottom' },
    { bone: bones.rThigh, a: J.r.hip, b: J.r.knee, r: 0.02, region: 'bottom' },
    { bone: bones.rShin, a: J.r.knee, b: J.r.ankle, r: 0.012, region: 'bottom' },
  ]
  const segDist = (s: Seg, x: number, y: number, z: number) => {
    const bx = s.b[0] - s.a[0]
    const by = s.b[1] - s.a[1]
    const bz = s.b[2] - s.a[2]
    const px = x - s.a[0]
    const py = y - s.a[1]
    const pz = z - s.a[2]
    const h = Math.min(1, Math.max(0, (px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz)))
    return Math.max(0, Math.hypot(px - bx * h, py - by * h, pz - bz * h) - s.r) + 1e-4
  }
  const skinIndex = new Uint16Array(count * 4)
  const skinWeight = new Float32Array(count * 4)
  const owner = new Uint8Array(count)
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3]
    const y = positions[i * 3 + 1]
    const z = positions[i * 3 + 2]
    let b1 = 0
    let b2 = 1
    let d1 = Infinity
    let d2 = Infinity
    segs.forEach((s, si) => {
      const d = segDist(s, x, y, z)
      if (d < d1) {
        d2 = d1
        b2 = b1
        d1 = d
        b1 = si
      } else if (d < d2) {
        d2 = d
        b2 = si
      }
    })
    const w1 = 1 / d1 ** 4
    const w2 = 1 / d2 ** 4
    skinIndex[i * 4] = segs[b1].bone
    skinIndex[i * 4 + 1] = segs[b2].bone
    skinWeight[i * 4] = w1 / (w1 + w2)
    skinWeight[i * 4 + 1] = w2 / (w1 + w2)
    owner[i] = b1
  }
  // Garments end on straight lines: the torso is split by horizontal planes
  // (collar, chest, hem) and triangles that cross one are cut along it.
  // Arms always wear the top, legs the bottom.
  const P = Array.from(positions)
  const N = Array.from(normals)
  const SI = Array.from(skinIndex)
  const SW = Array.from(skinWeight)
  const ORDER: Region[] = ['bottom', 'waist', 'top', 'skin']
  const planes = [J.spine + 0.012, J.chest, J.neck + 0.01]
  const limbTop = new Set([bones.lUpper, bones.lFore, bones.rUpper, bones.rFore])
  const limbBottom = new Set([bones.lThigh, bones.lShin, bones.rThigh, bones.rShin])
  const kind = (i: number): Region | null => {
    const bone = segs[owner[i]].bone
    if (limbTop.has(bone)) return 'top'
    if (limbBottom.has(bone)) return 'bottom'
    return null
  }
  const byHeight = (y: number): Region => (y >= planes[2] ? 'skin' : y >= planes[1] ? 'top' : y >= planes[0] ? 'waist' : 'bottom')
  const classOf = (i: number) => kind(i) ?? byHeight(P[i * 3 + 1])
  const cut = (a: number, b: number, y: number) => {
    const ya = P[a * 3 + 1]
    const t = (y - ya) / (P[b * 3 + 1] - ya)
    const n = P.length / 3
    for (let k = 0; k < 3; k++) P.push(P[a * 3 + k] + (P[b * 3 + k] - P[a * 3 + k]) * t)
    let nx = N[a * 3] + (N[b * 3] - N[a * 3]) * t
    let ny = N[a * 3 + 1] + (N[b * 3 + 1] - N[a * 3 + 1]) * t
    let nz = N[a * 3 + 2] + (N[b * 3 + 2] - N[a * 3 + 2]) * t
    const l = Math.hypot(nx, ny, nz) || 1
    nx /= l
    ny /= l
    nz /= l
    N.push(nx, ny, nz)
    // Blend the two corners' bone influences, keep the strongest four.
    const w = new Map<number, number>()
    for (let k = 0; k < 4; k++) {
      w.set(SI[a * 4 + k], (w.get(SI[a * 4 + k]) ?? 0) + SW[a * 4 + k] * (1 - t))
      w.set(SI[b * 4 + k], (w.get(SI[b * 4 + k]) ?? 0) + SW[b * 4 + k] * t)
    }
    const top = [...w.entries()].sort((p, q) => q[1] - p[1]).slice(0, 4)
    const sum = top.reduce((acc, [, v]) => acc + v, 0) || 1
    for (let k = 0; k < 4; k++) {
      SI.push(top[k]?.[0] ?? 0)
      SW.push((top[k]?.[1] ?? 0) / sum)
    }
    return n
  }
  const lists: Record<Region, number[]> = { skin: [], top: [], waist: [], bottom: [] }
  for (let t = 0; t < index.length; t += 3) {
    const tri = [index[t], index[t + 1], index[t + 2]]
    const cls = tri.map(classOf)
    if (cls[0] === cls[1] && cls[1] === cls[2]) {
      lists[cls[0]].push(...tri)
      continue
    }
    const torso = tri.every((i) => kind(i) === null)
    const ranks = cls.map((c) => ORDER.indexOf(c))
    const lo = Math.min(...ranks)
    const hi = Math.max(...ranks)
    if (!torso || hi - lo !== 1) {
      // At the armpit or a tiny sliver: the majority wins.
      const pick = cls[0] === cls[1] || cls[0] === cls[2] ? cls[0] : cls[1]
      lists[pick].push(...tri)
      continue
    }
    const y = planes[lo]
    const above = ranks.map((r) => r === hi)
    const lone = above.filter(Boolean).length === 1 ? above.indexOf(true) : above.indexOf(false)
    const L = tri[lone]
    const Nn = tri[(lone + 1) % 3]
    const M = tri[(lone + 2) % 3]
    const p = cut(L, Nn, y)
    const q = cut(L, M, y)
    const loneRegion = ORDER[ranks[lone]]
    const restRegion = ORDER[ranks[lone] === hi ? lo : hi]
    lists[loneRegion].push(L, p, q)
    lists[restRegion].push(p, Nn, M, p, M, q)
  }
  const total = P.length / 3
  // Each piece keeps only its own vertices.
  const piece = (list: number[]) => {
    if (!list.length) return null
    const remap = new Int32Array(total).fill(-1)
    const used: number[] = []
    const idx = list.map((o) => {
      if (remap[o] < 0) {
        remap[o] = used.length
        used.push(o)
      }
      return remap[o]
    })
    const n = used.length
    const pos = new Float32Array(n * 3)
    const nor = new Float32Array(n * 3)
    const si = new Uint16Array(n * 4)
    const sw = new Float32Array(n * 4)
    used.forEach((o, k) => {
      for (let c = 0; c < 3; c++) {
        pos[k * 3 + c] = P[o * 3 + c]
        nor[k * 3 + c] = N[o * 3 + c]
      }
      for (let c = 0; c < 4; c++) {
        si[k * 4 + c] = SI[o * 4 + c]
        sw[k * 4 + c] = SW[o * 4 + c]
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2))
    g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4))
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4))
    g.setIndex(idx)
    return g
  }
  const pieces: BodyPieces = { skin: piece(lists.skin), top: piece(lists.top), waist: piece(lists.waist), bottom: piece(lists.bottom) }
  cache.set(key, pieces)
  return pieces
}
