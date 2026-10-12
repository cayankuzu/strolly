/**
 * PARALEL-LEŞ — shared helpers for the sets: noise, terrain, scatter,
 * instancing, the per-set direction context.
 */
import * as THREE from 'three'
import { clamp, mulberry32 } from '@/lib/math'
import type { BuildContext, SetFrame, Shot } from '../kit/SetScene'
import type { SegmentId } from '@/stories/paralel/timeline'
import type { Env } from './env'
import type { Cast } from './cast'
import type { Pal } from './materials'

export const PI = Math.PI
export const DEG = PI / 180

// ——— Noise ———

function hash2(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

/** Smooth value noise in [0, 1]. */
export function noise2(x: number, y: number, seed = 1) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** Fractal noise in roughly [−1, 1]. */
export function fbm(x: number, y: number, octaves = 4, seed = 1) {
  let sum = 0
  let amp = 1
  let norm = 0
  let f = 1
  for (let i = 0; i < octaves; i++) {
    sum += (noise2(x * f, y * f, seed + i * 17) * 2 - 1) * amp
    norm += amp
    amp *= 0.5
    f *= 2.03
  }
  return sum / norm
}

/** Ridged noise in [0, 1] (sharp crests). */
export function ridged(x: number, y: number, octaves = 4, seed = 1) {
  let sum = 0
  let amp = 1
  let norm = 0
  let f = 1
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise2(x * f, y * f, seed + i * 31) * 2 - 1)
    sum += n * n * amp
    norm += amp
    amp *= 0.5
    f *= 2.1
  }
  return sum / norm
}

export const rng = (seed: number) => mulberry32(seed)

// ——— Geometry ———

/**
 * A heightfield over x0..x1 × z0..z1 (world-aligned, centred in its group at
 * the origin of world space): `h(x, z)` gives y. Optional vertex colours.
 */
export function terrain(o: { x0: number; x1: number; z0: number; z1: number; nx: number; nz: number; h: (x: number, z: number) => number; color?: (x: number, z: number, y: number, out: THREE.Color) => void }) {
  const geo = new THREE.PlaneGeometry(o.x1 - o.x0, o.z1 - o.z0, o.nx, o.nz)
  geo.rotateX(-PI / 2)
  geo.translate((o.x0 + o.x1) / 2, 0, (o.z0 + o.z1) / 2)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = o.color ? new Float32Array(pos.count * 3) : null
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const y = o.h(x, z)
    pos.setY(i, y)
    if (colors && o.color) {
      o.color(x, z, y, c)
      c.toArray(colors, i * 3)
    }
  }
  if (colors) geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

/** A vertical-ish face: a plane in x–y at depth z(x, y) (for cliffs). */
export function face(o: { x0: number; x1: number; y0: number; y1: number; nx: number; ny: number; z: (x: number, y: number) => number; flip?: boolean; color?: (x: number, y: number, z: number, out: THREE.Color) => void }) {
  const geo = new THREE.PlaneGeometry(o.x1 - o.x0, o.y1 - o.y0, o.nx, o.ny)
  if (o.flip) geo.rotateY(PI)
  geo.translate((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, 0)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = o.color ? new Float32Array(pos.count * 3) : null
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = o.z(x, y)
    pos.setZ(i, z)
    if (colors && o.color) {
      o.color(x, y, z, c)
      c.toArray(colors, i * 3)
    }
  }
  if (colors) geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

const m4 = new THREE.Matrix4()
const q = new THREE.Quaternion()
const e = new THREE.Euler()
const vp = new THREE.Vector3()
const vs = new THREE.Vector3()

/** Fills an instanced mesh: `place(i)` returns [x, y, z, yaw, scale, (pitch), (roll), (sy)] or null to skip. */
export function instances(geo: THREE.BufferGeometry, mat: THREE.Material, count: number, place: (i: number) => readonly number[] | null, opts: { shadow?: boolean; receive?: boolean; color?: (i: number, out: THREE.Color) => void } = {}) {
  const im = new THREE.InstancedMesh(geo, mat, count)
  const c = new THREE.Color()
  let n = 0
  for (let i = 0; i < count; i++) {
    const t = place(i)
    if (!t) continue
    const [x, y, z, yaw = 0, s = 1, pitch = 0, roll = 0, sy = s] = t
    e.set(pitch, yaw, roll, 'YXZ')
    q.setFromEuler(e)
    vp.set(x, y, z)
    vs.set(s, sy, s)
    im.setMatrixAt(n, m4.compose(vp, q, vs))
    if (opts.color) {
      opts.color(i, c)
      im.setColorAt(n, c)
    }
    n++
  }
  im.count = n
  im.castShadow = opts.shadow ?? false
  im.receiveShadow = opts.receive ?? true
  im.instanceMatrix.needsUpdate = true
  im.computeBoundingSphere()
  return im
}

/** Sets instance i of an instanced mesh from position / euler / scale. */
export function setInstance(im: THREE.InstancedMesh, i: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s = 1, sy = s, sz = s) {
  e.set(rx, ry, rz, 'YXZ')
  q.setFromEuler(e)
  vp.set(x, y, z)
  vs.set(s, sy, sz)
  im.setMatrixAt(i, m4.compose(vp, q, vs))
}

/** A canvas texture (sRGB) drawn once. */
export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void, repeat = false) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** A grayscale data texture from a function (linear, repeat). */
export function dataTexture(size: number, fn: (x: number, y: number) => number) {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const v = Math.round(clamp(fn(x / size, y / size)) * 255)
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = v
      data[i + 3] = 255
    }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.needsUpdate = true
  return t
}

/** Smooth window: rises over [a, b], falls over [c, d]. */
export const win = (a: number, b: number, c: number, d: number, v: number) => {
  const up = b > a ? clamp((v - a) / (b - a)) : v >= a ? 1 : 0
  const down = d > c ? 1 - clamp((v - c) / (d - c)) : v < c ? 1 : 0
  const s = (t: number) => t * t * (3 - 2 * t)
  return s(up) * s(down)
}

/** 0→1 over [a, b], smooth. */
export const ss = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Linear 0→1 over [a, b]. */
export const lin = (a: number, b: number, v: number) => clamp((v - a) / (b - a))

// ——— Direction context ———

export type Models = Record<'rockFace' | 'boulder' | 'aircon' | 'duct' | 'lifebuoy' | 'trunk', THREE.Group | null>

export type Ctx = {
  build: BuildContext
  pal: Pal
  env: Env
  cast: Cast
  models: Models
  scene: THREE.Scene
}

export type Dir = {
  f: SetFrame
  shot: Shot
  seg: SegmentId
  u: number
  /** u for camera keys (held when motion is reduced). */
  cu: number
  cast: Cast
  env: Env
  /** The reader chose to keep swinging (default) or to stop. */
  stop: boolean
  /** Camera roll (radians), applied after the look (motion: off with reduced motion). */
  roll: number
  /** A compositional roll that always applies (e.g. to read a watch face upright). */
  level: number
  /** Footsteps for the sound (the walker's step count and gait amount). */
  step: number
  walking: number
}

export interface PSet {
  readonly group: THREE.Group
  build(c: Ctx): Promise<void> | void
  direct(d: Dir): void
  dispose?(): void
}

const lf = new THREE.Vector3()
const lr = new THREE.Vector3()
const lu = new THREE.Vector3()
const lt = new THREE.Vector3()
const WORLD_UP = new THREE.Vector3(0, 1, 0)

/** The camera roll that makes world direction `up` read as screen-up for this shot (see Dir.level). */
export function levelTo(shot: Shot, up: THREE.Vector3) {
  lf.copy(shot.tgt).sub(shot.pos).normalize()
  lr.crossVectors(lf, WORLD_UP)
  if (lr.lengthSq() < 1e-8) lr.set(1, 0, 0)
  lr.normalize()
  lu.crossVectors(lr, lf)
  lt.copy(up).addScaledVector(lf, -up.dot(lf))
  if (lt.lengthSq() < 1e-8) return 0
  const a = Math.atan2(lt.dot(lr), lt.dot(lu))
  return -a
}
