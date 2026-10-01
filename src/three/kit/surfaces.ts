/**
 * Procedural PBR surfaces. Every material in STROLLY is generated, so the
 * build ships no images; a surface is three tileable maps made from seeded
 * noise on first use and shared by every story after that:
 *
 *   detail   albedo variation (sRGB, near-white; the material's color tints it)
 *   normal   tangent-space relief derived from a height field
 *   orm      packed cavity (R), roughness (G) and metalness (B)
 *
 * Each surface also knows its real-world size (meters per tile). Geometry is
 * given metric UVs (`applyMetricUVs`) so wood grain, weave and brick keep
 * their true scale on every object, whatever its dimensions.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'

export type SurfaceKind =
  | 'wood'
  | 'planks'
  | 'fabric'
  | 'knit'
  | 'denim'
  | 'leather'
  | 'plaster'
  | 'concrete'
  | 'brick'
  | 'asphalt'
  | 'paving'
  | 'tile'
  | 'carpet'
  | 'metal'
  | 'painted'
  | 'plastic'
  | 'rubber'
  | 'paper'
  | 'ceramic'
  | 'skin'
  | 'hair'
  | 'laminate'

type Maps = { detail: THREE.Texture; normal: THREE.Texture; orm: THREE.Texture }

/** Meters covered by one tile of each surface. */
const METERS: Record<SurfaceKind, number> = {
  wood: 0.9,
  planks: 1.5,
  fabric: 0.12,
  knit: 0.09,
  denim: 0.1,
  leather: 0.35,
  plaster: 1.6,
  concrete: 2.2,
  brick: 1.3,
  asphalt: 3.2,
  paving: 1.8,
  tile: 1.2,
  carpet: 0.6,
  metal: 0.5,
  painted: 1.2,
  plastic: 0.6,
  rubber: 0.25,
  paper: 0.3,
  ceramic: 0.5,
  skin: 0.06,
  hair: 0.05,
  laminate: 1.4,
}

// ——— Noise ———

/** Tileable value-noise fBm with separate x/y base frequencies (integers keep it seamless). */
function fbm(size: number, seed: number, fx: number, fy: number, octaves: number, gain = 0.5) {
  const rand = mulberry32(seed)
  const G = 256
  const lattice = new Float32Array(G * G)
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand()
  const out = new Float32Array(size * size)
  let amp = 1
  let total = 0
  let ox = fx
  let oy = fy
  for (let o = 0; o < octaves; o++) {
    const px = Math.min(G, ox)
    const py = Math.min(G, oy)
    const shift = o * 37
    for (let y = 0; y < size; y++) {
      const gy = (y / size) * py
      const yi = Math.floor(gy)
      const yf = gy - yi
      const v = yf * yf * (3 - 2 * yf)
      const r0 = ((yi % py) + shift) % G
      const r1 = (((yi + 1) % py) + shift) % G
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * px
        const xi = Math.floor(gx)
        const xf = gx - xi
        const u = xf * xf * (3 - 2 * xf)
        const c0 = ((xi % px) + shift) % G
        const c1 = (((xi + 1) % px) + shift) % G
        const a = lattice[r0 * G + c0] + (lattice[r0 * G + c1] - lattice[r0 * G + c0]) * u
        const b = lattice[r1 * G + c0] + (lattice[r1 * G + c1] - lattice[r1 * G + c0]) * u
        out[y * size + x] += amp * (a + (b - a) * v)
      }
    }
    total += amp
    amp *= gain
    ox *= 2
    oy *= 2
  }
  for (let i = 0; i < out.length; i++) out[i] /= total
  return out
}

const fract = (v: number) => v - Math.floor(v)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const sstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Stamps small blobs (pores, aggregate, specks) into a height field, wrapping at the edges. */
function stamp(h: Float32Array, size: number, seed: number, count: number, rMin: number, rMax: number, depth: number, stretch = 1) {
  const rand = mulberry32(seed)
  for (let n = 0; n < count; n++) {
    const cx = rand() * size
    const cy = rand() * size
    const r = rMin + rand() * (rMax - rMin)
    const d = depth * (0.5 + rand() * 0.5)
    const rx = Math.ceil(r * stretch)
    const ry = Math.ceil(r)
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++) {
        const q = (x / stretch) * (x / stretch) + y * y
        if (q > r * r) continue
        const px = (Math.floor(cx + x) + size) % size
        const py = (Math.floor(cy + y) + size) % size
        h[py * size + px] += d * (1 - q / (r * r))
      }
  }
}

// ——— Building the maps ———

type Field = { height: Float32Array; albedo: Float32Array; rough: Float32Array; metal?: number; normalStrength: number }

function toTextures(size: number, f: Field): Maps {
  const { height, albedo, rough } = f
  const detail = new Uint8Array(size * size * 4)
  const normal = new Uint8Array(size * size * 4)
  const orm = new Uint8Array(size * size * 4)
  const s = f.normalStrength * (size / 256)
  // Cavity: how far below its neighbourhood each point sits.
  const blur = boxBlur(height, size, Math.max(2, size >> 6))
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x
      const l = height[y * size + ((x - 1 + size) % size)]
      const r = height[y * size + ((x + 1) % size)]
      const u = height[((y - 1 + size) % size) * size + x]
      const d = height[((y + 1) % size) * size + x]
      let nx = (l - r) * s
      let ny = (d - u) * s
      let nz = 1
      const len = Math.hypot(nx, ny, nz)
      nx /= len
      ny /= len
      nz /= len
      normal[i * 4] = Math.round((nx * 0.5 + 0.5) * 255)
      normal[i * 4 + 1] = Math.round((ny * 0.5 + 0.5) * 255)
      normal[i * 4 + 2] = Math.round((nz * 0.5 + 0.5) * 255)
      normal[i * 4 + 3] = 255
      const a = Math.round(clamp01(albedo[i]) * 255)
      detail[i * 4] = detail[i * 4 + 1] = detail[i * 4 + 2] = a
      detail[i * 4 + 3] = 255
      const cav = clamp01(1 - Math.max(0, blur[i] - height[i]) * 6)
      orm[i * 4] = Math.round(cav * 255)
      orm[i * 4 + 1] = Math.round(clamp01(rough[i]) * 255)
      orm[i * 4 + 2] = Math.round((f.metal ?? 0) * 255)
      orm[i * 4 + 3] = 255
    }
  }
  return { detail: dataTexture(detail, size, true), normal: dataTexture(normal, size, false), orm: dataTexture(orm, size, false) }
}

function boxBlur(src: Float32Array, size: number, r: number) {
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const w = 2 * r + 1
  for (let y = 0; y < size; y++) {
    let acc = 0
    for (let k = -r; k <= r; k++) acc += src[y * size + ((k + size) % size)]
    for (let x = 0; x < size; x++) {
      tmp[y * size + x] = acc / w
      acc += src[y * size + ((x + r + 1) % size)] - src[y * size + ((x - r + size) % size)]
    }
  }
  for (let x = 0; x < size; x++) {
    let acc = 0
    for (let k = -r; k <= r; k++) acc += tmp[((k + size) % size) * size + x]
    for (let y = 0; y < size; y++) {
      out[y * size + x] = acc / w
      acc += tmp[((y + r + 1) % size) * size + x] - tmp[((y - r + size) % size) * size + x]
    }
  }
  return out
}

function dataTexture(data: Uint8Array, size: number, color: boolean) {
  const t = new THREE.DataTexture(data, size, size)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

// ——— The surfaces ———

function build(kind: SurfaceKind, size: number): Field {
  const N = size * size
  const height = new Float32Array(N)
  const albedo = new Float32Array(N).fill(1)
  const rough = new Float32Array(N).fill(1)
  const at = (i: number) => [i % size, Math.floor(i / size)] as const
  switch (kind) {
    case 'wood':
    case 'laminate': {
      // Long grain along u: fine growth rings that wander, streaks of figure.
      // Wood keeps a little relief and its pores; laminate is a printed grain
      // under a flat, slightly glossy film.
      const lam = kind === 'laminate'
      const warp = fbm(size, 11, 2, 6, 4)
      const fine = fbm(size, 12, 2, 128, 3)
      const figure = fbm(size, 13, 1, 4, 3)
      for (let i = 0; i < N; i++) {
        const [, y] = at(i)
        const ring = fract((y / size) * 46 + warp[i] * 2.4 + figure[i] * 1.4)
        const late = sstep(0.72, 0.95, ring) * (1 - sstep(0.95, 1, ring))
        height[i] = lam ? (fine[i] - 0.5) * 0.08 : -late * 0.2 + (fine[i] - 0.5) * 0.3
        albedo[i] = 0.93 - late * (lam ? 0.08 : 0.1) + (fine[i] - 0.5) * 0.1 + (figure[i] - 0.5) * (lam ? 0.08 : 0.12)
        rough[i] = lam ? 0.5 + (fine[i] - 0.5) * 0.06 : 0.78 + late * 0.1 + (fine[i] - 0.5) * 0.08
      }
      if (!lam) stamp(height, size, 14, size, 0.5, 0.9, -0.25, 5)
      return { height, albedo, rough, normalStrength: lam ? 0.5 : 1.1 }
    }
    case 'planks': {
      // Floor boards: 8 rows of planks with staggered joints, each its own grain.
      const rows = 8
      const warp = fbm(size, 21, 1, 16, 4)
      const fine = fbm(size, 22, 2, 128, 3)
      const rand = mulberry32(23)
      const tone = Array.from({ length: rows * 4 }, () => 0.88 + rand() * 0.14)
      const joints = Array.from({ length: rows }, () => rand())
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i)
        const v = (y / size) * rows
        const row = Math.floor(v)
        const fy = v - row
        const u = fract(x / size + joints[row] * 0.5)
        const plank = Math.floor((x / size + joints[row] * 0.5) * 2) % 2
        const gap = Math.min(fy, 1 - fy) < 0.03 || Math.min(fract(u * 2), 1 - fract(u * 2)) < 0.006
        const ring = fract(fy * 3 + warp[i] * 3 + plank * 0.37)
        const late = sstep(0.6, 0.95, ring) * (1 - sstep(0.95, 1, ring))
        height[i] = gap ? -1 : -late * 0.4 + (fine[i] - 0.5) * 0.4
        albedo[i] = gap ? 0.5 : tone[row * 4 + plank * 2 + (u > 0.5 ? 1 : 0)] - late * 0.12 + (fine[i] - 0.5) * 0.1
        rough[i] = gap ? 1 : 0.62 + late * 0.15 + (fine[i] - 0.5) * 0.12
      }
      return { height, albedo, rough, normalStrength: 2.4 }
    }
    case 'fabric':
    case 'denim': {
      // Plain weave (fabric) or twill (denim): threads over and under.
      const k = kind === 'denim' ? 96 : 80
      const slub = fbm(size, 31, 8, 64, 3)
      const fuzz = fbm(size, 32, 64, 64, 2)
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i)
        const tx = (x / size) * k
        const ty = (y / size) * k
        const cell = kind === 'denim' ? (Math.floor(tx) + Math.floor(ty)) % 4 < 2 : (Math.floor(tx) + Math.floor(ty)) % 2 === 0
        const warpT = Math.sin(fract(tx) * Math.PI)
        const weftT = Math.sin(fract(ty) * Math.PI)
        const thread = cell ? warpT : weftT
        height[i] = thread * 0.9 + (slub[i] - 0.5) * 0.4 + (fuzz[i] - 0.5) * 0.2
        albedo[i] = 0.8 + thread * 0.16 + (slub[i] - 0.5) * 0.14 + (kind === 'denim' && cell ? 0.06 : 0)
        rough[i] = 0.93 + (fuzz[i] - 0.5) * 0.08
      }
      return { height, albedo, rough, normalStrength: 1.4 }
    }
    case 'knit': {
      // Stockinette: columns of V-shaped stitches.
      const cols = 40
      const rows = 52
      const fuzz = fbm(size, 41, 64, 64, 2)
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i)
        const cx = fract((x / size) * cols)
        const cy = fract((y / size) * rows + Math.abs(cx - 0.5) * 0.9)
        const loop = Math.sin(cy * Math.PI) * (1 - Math.pow(Math.abs(cx - 0.5) * 2, 6))
        height[i] = loop + (fuzz[i] - 0.5) * 0.3
        albedo[i] = 0.78 + loop * 0.2 + (fuzz[i] - 0.5) * 0.1
        rough[i] = 0.96
      }
      return { height, albedo, rough, normalStrength: 1.5 }
    }
    case 'leather': {
      const grain = fbm(size, 51, 24, 24, 4)
      const fold = fbm(size, 52, 3, 3, 3)
      for (let i = 0; i < N; i++) {
        const ridge = 1 - Math.abs(grain[i] - 0.5) * 2
        height[i] = ridge * 0.6 + fold[i] * 0.6
        albedo[i] = 0.86 + (fold[i] - 0.5) * 0.22 + ridge * 0.06
        rough[i] = 0.55 + (1 - ridge) * 0.2 + (fold[i] - 0.5) * 0.12
      }
      return { height, albedo, rough, normalStrength: 1.6 }
    }
    case 'plaster':
    case 'painted': {
      // Rolled paint over a wall: low relief, a little orange peel.
      const low = fbm(size, kind === 'plaster' ? 61 : 62, 4, 4, 5)
      const peel = fbm(size, 63, 48, 48, 2)
      for (let i = 0; i < N; i++) {
        // Kept faint: under a grazing light anything stronger reads as stains.
        height[i] = (low[i] - 0.5) * 0.3 + (peel[i] - 0.5) * (kind === 'plaster' ? 0.2 : 0.12)
        albedo[i] = 0.96 + (low[i] - 0.5) * 0.05
        rough[i] = (kind === 'plaster' ? 0.9 : 0.62) + (peel[i] - 0.5) * 0.08
      }
      return { height, albedo, rough, normalStrength: 0.55 }
    }
    case 'concrete': {
      const low = fbm(size, 71, 3, 3, 6)
      const mid = fbm(size, 72, 16, 16, 3)
      for (let i = 0; i < N; i++) {
        height[i] = (mid[i] - 0.5) * 0.5 + (low[i] - 0.5) * 0.4
        albedo[i] = 0.86 + (low[i] - 0.5) * 0.2 + (mid[i] - 0.5) * 0.1
        rough[i] = 0.9 + (mid[i] - 0.5) * 0.1
      }
      // A few small air holes, not a pitted surface.
      stamp(height, size, 73, Math.round(size * 0.5), 0.4, 1.1, -0.6)
      return { height, albedo, rough, normalStrength: 1.2 }
    }
    case 'brick': {
      // Stretcher bond: 215 × 65 mm bricks, 10 mm mortar, each brick its own fired tone.
      const courses = 17
      const across = 6
      const tex = fbm(size, 81, 32, 32, 3)
      const stain = fbm(size, 82, 3, 3, 4)
      const rand = mulberry32(83)
      const tone = Array.from({ length: courses * across }, () => 0.72 + rand() * 0.3)
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i)
        const v = (y / size) * courses
        const c = Math.floor(v)
        const fy = v - c
        const uu = (x / size) * across + (c % 2) * 0.5
        const b = Math.floor(uu)
        const fx = uu - b
        const mortar = fy < 0.13 || fx < 0.045
        const edge = Math.min(sstep(0.13, 0.2, fy), sstep(0.045, 0.08, fx), sstep(1, 0.95, fy), sstep(1, 0.97, fx))
        height[i] = mortar ? -1 : -1 + edge * (1 + (tex[i] - 0.5) * 0.5)
        albedo[i] = mortar ? 0.95 + (tex[i] - 0.5) * 0.1 : tone[(c * across + ((b % across) + across)) % tone.length] * (0.9 + (tex[i] - 0.5) * 0.25) - (stain[i] - 0.5) * 0.15
        rough[i] = mortar ? 0.98 : 0.86 + (tex[i] - 0.5) * 0.1
      }
      return { height, albedo, rough, normalStrength: 2.2 }
    }
    case 'asphalt': {
      const low = fbm(size, 91, 2, 2, 5)
      const crack = fbm(size, 92, 6, 6, 4)
      // Cracks are rare: only where the surface is worn (a sparse mask), and thin.
      const worn = fbm(size, 95, 3, 3, 3)
      for (let i = 0; i < N; i++) {
        const c = (1 - sstep(0, 0.018, Math.abs(crack[i] - 0.5))) * sstep(0.62, 0.72, worn[i])
        height[i] = (low[i] - 0.5) * 0.3 - c * 0.5
        albedo[i] = 0.85 + (low[i] - 0.5) * 0.25 - c * 0.18
        rough[i] = 0.9 - (low[i] - 0.5) * 0.15
      }
      stamp(height, size, 93, size * 10, 0.4, 1.6, 0.6)
      stamp(albedo, size, 94, size * 6, 0.4, 1.2, 0.25)
      return { height, albedo, rough, normalStrength: 2.4 }
    }
    case 'paving': {
      // Square concrete pavers, 0.45 m, with sand joints.
      const n = 4
      const low = fbm(size, 101, 8, 8, 4)
      const rand = mulberry32(102)
      const tone = Array.from({ length: n * n }, () => 0.86 + rand() * 0.14)
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i)
        const u = (x / size) * n
        const v = (y / size) * n
        const fx = fract(u)
        const fy = fract(v)
        const joint = Math.min(fx, fy, 1 - fx, 1 - fy)
        const j = joint < 0.015
        height[i] = j ? -1 : -1 + sstep(0.015, 0.05, joint) + (low[i] - 0.5) * 0.3
        albedo[i] = j ? 0.7 : tone[Math.floor(v) * n + Math.floor(u)] + (low[i] - 0.5) * 0.15
        rough[i] = j ? 1 : 0.88
      }
      stamp(height, size, 103, size * 3, 0.4, 1.0, -0.4)
      return { height, albedo, rough, normalStrength: 2 }
    }
    case 'tile': {
      // 0.3 m glazed tiles with grout.
      const n = 4
      const wave = fbm(size, 111, 4, 4, 3)
      const rand = mulberry32(112)
      const tone = Array.from({ length: n * n }, () => 0.94 + rand() * 0.06)
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i)
        const u = (x / size) * n
        const v = (y / size) * n
        const joint = Math.min(fract(u), fract(v), 1 - fract(u), 1 - fract(v))
        const g = joint < 0.012
        height[i] = g ? -1 : -1 + sstep(0.012, 0.03, joint) + (wave[i] - 0.5) * 0.12
        albedo[i] = g ? 0.62 : tone[Math.floor(v) * n + Math.floor(u)]
        rough[i] = g ? 0.95 : 0.18 + (wave[i] - 0.5) * 0.08
      }
      return { height, albedo, rough, normalStrength: 1.6 }
    }
    case 'carpet': {
      const pile = fbm(size, 121, 128, 128, 2)
      const low = fbm(size, 122, 4, 4, 4)
      for (let i = 0; i < N; i++) {
        height[i] = pile[i] * 0.8 + (low[i] - 0.5) * 0.3
        albedo[i] = 0.8 + (pile[i] - 0.5) * 0.3 + (low[i] - 0.5) * 0.12
        rough[i] = 1
      }
      return { height, albedo, rough, normalStrength: 1.2 }
    }
    case 'metal': {
      // Brushed: long streaks along u, a few handling marks.
      const streak = fbm(size, 131, 1, 160, 3)
      const smudge = fbm(size, 132, 3, 3, 4)
      for (let i = 0; i < N; i++) {
        height[i] = (streak[i] - 0.5) * 0.25
        albedo[i] = 0.92 + (streak[i] - 0.5) * 0.12
        rough[i] = 0.5 + (streak[i] - 0.5) * 0.25 + (smudge[i] - 0.5) * 0.3
      }
      return { height, albedo, rough, metal: 1, normalStrength: 0.6 }
    }
    case 'plastic':
    case 'rubber': {
      const fine = fbm(size, 141, 96, 96, 2)
      const scuff = fbm(size, 142, 4, 4, 4)
      for (let i = 0; i < N; i++) {
        height[i] = (fine[i] - 0.5) * 0.4
        albedo[i] = 0.96 + (scuff[i] - 0.5) * 0.06
        rough[i] = (kind === 'plastic' ? 0.62 : 0.92) + (scuff[i] - 0.5) * 0.2
      }
      return { height, albedo, rough, normalStrength: 0.5 }
    }
    case 'paper': {
      const fibre = fbm(size, 151, 64, 8, 3)
      const fibre2 = fbm(size, 152, 8, 64, 3)
      for (let i = 0; i < N; i++) {
        height[i] = (fibre[i] + fibre2[i] - 1) * 0.5
        albedo[i] = 0.97 + (fibre[i] - 0.5) * 0.05
        rough[i] = 0.96
      }
      return { height, albedo, rough, normalStrength: 0.5 }
    }
    case 'ceramic': {
      const wave = fbm(size, 161, 3, 3, 3)
      for (let i = 0; i < N; i++) {
        height[i] = (wave[i] - 0.5) * 0.2
        albedo[i] = 0.98
        rough[i] = 0.16 + (wave[i] - 0.5) * 0.06
      }
      return { height, albedo, rough, normalStrength: 0.4 }
    }
    case 'skin': {
      // Pores and fine lines; blotchy tone the material's color sits on.
      const pores = fbm(size, 171, 48, 48, 3)
      const blotch = fbm(size, 172, 3, 3, 4)
      for (let i = 0; i < N; i++) {
        height[i] = -Math.max(0, 0.42 - pores[i]) * 2 + (blotch[i] - 0.5) * 0.15
        albedo[i] = 0.94 + (blotch[i] - 0.5) * 0.1
        rough[i] = 0.62 + (pores[i] - 0.5) * 0.12
      }
      return { height, albedo, rough, normalStrength: 0.7 }
    }
    case 'hair': {
      // Strands along v, in clumps; soft enough not to band into stripes at a distance.
      const strands = fbm(size, 181, 48, 3, 4)
      const clumps = fbm(size, 182, 8, 2, 3)
      for (let i = 0; i < N; i++) {
        height[i] = strands[i] * 0.7 + clumps[i] * 0.3
        albedo[i] = 0.8 + (strands[i] - 0.5) * 0.24 + (clumps[i] - 0.5) * 0.12
        rough[i] = 0.55 + (1 - strands[i]) * 0.2
      }
      return { height, albedo, rough, normalStrength: 0.9 }
    }
  }
}

const cache = new Map<string, Maps>()

/** The maps for a surface, generated once per visit (re-uploaded if a story disposed them). */
export function surfaceMaps(kind: SurfaceKind, size = 512): Maps {
  const key = `${kind}:${size}`
  let maps = cache.get(key)
  if (!maps) {
    maps = toTextures(size, build(kind, size))
    cache.set(key, maps)
  }
  return maps
}

let defaultSize = 512
/** Lower tiers use smaller maps. */
export function setSurfaceResolution(size: 256 | 512) {
  defaultSize = size
}

export type PbrOptions = THREE.MeshStandardMaterialParameters & {
  /** Normal strength. */
  bump?: number
  /** Real-world scale multiplier for the tile. */
  scale?: number
}

/**
 * A standard material on a procedural surface. `color` tints the detail map;
 * `roughness` scales the surface's own roughness pattern.
 */
export function pbr(kind: SurfaceKind, color: THREE.ColorRepresentation, opts: PbrOptions = {}) {
  const { bump = 1, scale = 1, ...params } = opts
  const maps = surfaceMaps(kind, defaultSize)
  const metal = kind === 'metal'
  const m = new THREE.MeshStandardMaterial({
    color,
    map: maps.detail,
    normalMap: maps.normal,
    normalScale: new THREE.Vector2(bump, bump),
    roughnessMap: maps.orm,
    metalnessMap: metal ? maps.orm : null,
    aoMap: maps.orm,
    aoMapIntensity: 0.6,
    roughness: 1,
    metalness: metal ? 1 : 0,
    ...params,
  })
  m.userData.surface = kind
  m.userData.meters = METERS[kind] * scale
  return m
}

/** Physical skin: soft sheen and a hint of light passing through. */
export function skinMaterial(color: THREE.ColorRepresentation, opts: { vertexColors?: boolean; roughness?: number } = {}) {
  const maps = surfaceMaps('skin', defaultSize)
  const m = new THREE.MeshPhysicalMaterial({
    color,
    map: maps.detail,
    normalMap: maps.normal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: maps.orm,
    roughness: opts.roughness ?? 0.68,
    // Skin reflects less than plastic does (F0 ≈ 0.028).
    ior: 1.4,
    specularIntensity: 0.65,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0xffc8b0),
    vertexColors: opts.vertexColors ?? false,
  })
  m.userData.surface = 'skin'
  m.userData.meters = METERS.skin
  return m
}

// ——— Metric UVs ———

const pos = new THREE.Vector3()
const nrm = new THREE.Vector3()
const scl = new THREE.Vector3()
const quat = new THREE.Quaternion()
const tr = new THREE.Vector3()

const RADIAL = new Set(['CylinderGeometry', 'LatheGeometry', 'CapsuleGeometry', 'SphereGeometry', 'TorusGeometry', 'ConeGeometry', 'TubeGeometry'])

/**
 * Gives every mesh whose material is a procedural surface UVs in meters of
 * that surface: box-projected for flat-sided geometry (the grain runs along
 * each face's longer side), stretched to true size for turned geometry.
 */
export function applyMetricUVs(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || !m.geometry) return
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material | undefined
    const meters = mat?.userData?.meters as number | undefined
    if (!meters) return
    const geo = m.geometry
    if (geo.userData.metric === meters) return
    const uv = geo.attributes.uv as THREE.BufferAttribute | undefined
    const p = geo.attributes.position as THREE.BufferAttribute
    if (!uv || !p) return
    m.matrixWorld.decompose(tr, quat, scl)
    scl.set(Math.abs(scl.x), Math.abs(scl.y), Math.abs(scl.z))
    if (RADIAL.has(geo.type)) {
      geo.computeBoundingBox()
      const bb = geo.boundingBox!
      const r = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) * 0.5 * Math.max(scl.x, scl.z)
      const h = (bb.max.y - bb.min.y) * scl.y
      const su = Math.max(0.01, (Math.PI * 2 * r) / meters)
      const sv = Math.max(0.01, (geo.type === 'TorusGeometry' ? r * 0.6 : h) / meters)
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
    } else {
      geo.computeBoundingBox()
      const bb = geo.boundingBox!
      const sx = (bb.max.x - bb.min.x) * scl.x
      const sy = (bb.max.y - bb.min.y) * scl.y
      const sz = (bb.max.z - bb.min.z) * scl.z
      const n = geo.attributes.normal as THREE.BufferAttribute | undefined
      if (!n) geo.computeVertexNormals()
      const normals = geo.attributes.normal as THREE.BufferAttribute
      for (let i = 0; i < uv.count; i++) {
        pos.fromBufferAttribute(p, i).multiply(scl)
        nrm.fromBufferAttribute(normals, i)
        const ax = Math.abs(nrm.x)
        const ay = Math.abs(nrm.y)
        const az = Math.abs(nrm.z)
        let a: number
        let b: number
        if (ax >= ay && ax >= az) {
          // Face across x: in-plane axes z and y.
          ;[a, b] = sz >= sy ? [pos.z, pos.y] : [pos.y, pos.z]
        } else if (ay >= az) {
          ;[a, b] = sx >= sz ? [pos.x, pos.z] : [pos.z, pos.x]
        } else {
          ;[a, b] = sx >= sy ? [pos.x, pos.y] : [pos.y, pos.x]
        }
        uv.setXY(i, a / meters, b / meters)
      }
    }
    uv.needsUpdate = true
    geo.userData.metric = meters
  })
}
