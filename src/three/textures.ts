/**
 * Seeded procedural textures. Every surface in STROLLY is generated, so the
 * build ships no image assets and every visit looks the same.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'

export function valueNoise(size: number, seed: number, octaves: number, scale: number) {
  const rand = mulberry32(seed)
  const grid = 256
  const lattice = new Float32Array(grid * grid).map(() => rand())
  // The lattice wraps at the octave's frequency, which keeps the texture tileable.
  const at = (x: number, y: number, period: number) => lattice[(y % period) * grid + (x % period)]
  const sample = (x: number, y: number, period: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const a = at(xi, yi, period) + (at(xi + 1, yi, period) - at(xi, yi, period)) * u
    const b = at(xi, yi + 1, period) + (at(xi + 1, yi + 1, period) - at(xi, yi + 1, period)) * u
    return a + (b - a) * v
  }
  const out = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let s = 0
      let amp = 0.5
      let f = scale
      for (let o = 0; o < octaves; o++) {
        s += amp * sample((x / size) * f, (y / size) * f, f)
        amp *= 0.5
        f *= 2
      }
      out[y * size + x] = s
    }
  }
  return out
}

/**
 * @param fn maps (noise 0–1, random 0–1, x, y) to an sRGB colour
 */
export function noiseTexture(size: number, seed: number, fn: (n: number, speck: number, x: number, y: number) => [number, number, number], color = true) {
  const n = valueNoise(size, seed, 5, 8)
  const rand = mulberry32(seed * 7 + 1)
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const [r, g, b] = fn(n[i], rand(), i % size, Math.floor(i / size))
    data[i * 4] = r
    data[i * 4 + 1] = g
    data[i * 4 + 2] = b
    data[i * 4 + 3] = 255
  }
  const tex = new THREE.DataTexture(data, size, size)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/** Fine fabric grain for bump maps: knit and twill read under a raking light. */
export function fabricBump(seed = 53, repeat = 10) {
  const tex = noiseTexture(
    128,
    seed,
    (n, s) => {
      const v = 128 + (n - 0.5) * 120 + (s - 0.5) * 60
      return [v, v, v]
    },
    false,
  )
  tex.repeat.set(repeat, repeat)
  return tex
}
