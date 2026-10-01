export const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Maps v from [a, b] to [0, 1], clamped. */
export const invLerp = (a: number, b: number, v: number) => (a === b ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)))

export const smoothstep = (a: number, b: number, v: number) => {
  const t = invLerp(a, b, v)
  return t * t * (3 - 2 * t)
}

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export type Ease = (t: number) => number
export const linear: Ease = (t) => t

/** Rises 0→1 over [a, b] and falls 1→0 over [c, d]. */
export const window4 = (a: number, b: number, c: number, d: number, v: number) =>
  smoothstep(a, b, v) * (1 - smoothstep(c, d, v))

/** Deterministic PRNG so every scroll pass produces the same scene. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const angleLerp = (a: number, b: number, t: number) => {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

export const finiteOr = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback)
