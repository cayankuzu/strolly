/**
 * Keyframe tracks: the building block of "visual state = f(progress)".
 * A key's ease shapes the interval that ends on that key.
 */
import { easeInOutSine, type Ease } from './math'

export type Key<T> = readonly [p: number, value: T, ease?: Ease]

const span: [number, number, number] = [0, 0, 0]

function locate<T>(keys: readonly Key<T>[], p: number): [number, number, number] {
  const last = keys.length - 1
  if (p <= keys[0][0]) {
    span[0] = span[1] = 0
    span[2] = 0
    return span
  }
  if (p >= keys[last][0]) {
    span[0] = span[1] = last
    span[2] = 0
    return span
  }
  for (let i = 1; i <= last; i++) {
    if (p < keys[i][0]) {
      const k0 = keys[i - 1]
      const k1 = keys[i]
      span[0] = i - 1
      span[1] = i
      span[2] = (k1[2] ?? easeInOutSine)((p - k0[0]) / (k1[0] - k0[0] || 1))
      return span
    }
  }
  span[0] = span[1] = last
  span[2] = 0
  return span
}

export function evalNumber(keys: readonly Key<number>[], p: number): number {
  const [i0, i1, t] = locate(keys, p)
  const a = keys[i0][1]
  return a + (keys[i1][1] - a) * t
}

/** Writes an interpolated vector into `out` (no allocation). */
export function evalVec(keys: readonly Key<readonly number[]>[], p: number, out: number[]): number[] {
  const [i0, i1, t] = locate(keys, p)
  const a = keys[i0][1]
  const b = keys[i1][1]
  for (let j = 0; j < a.length; j++) out[j] = a[j] + (b[j] - a[j]) * t
  return out
}

/** Step track: the value of the last key at or before p. */
export function evalStep<T>(keys: readonly Key<T>[], p: number): T {
  let v = keys[0][1]
  for (const k of keys) {
    if (p >= k[0]) v = k[1]
    else break
  }
  return v
}

/** The two keyed states around p and the eased blend between them. */
export function evalBlend<T>(keys: readonly Key<T>[], p: number): { a: T; b: T; t: number } {
  const [i0, i1, t] = locate(keys, p)
  return { a: keys[i0][1], b: keys[i1][1], t }
}
