/** Walking along polylines with a trapezoid speed profile, as a pure function of time. */
import { angleLerp, clamp, smoothstep } from '@/lib/math'
import { yawTo } from '../util'

export type Path = { pts: Array<[number, number]>; cum: number[]; total: number }

export function makePath(pts: Array<[number, number]>): Path {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return { pts, cum, total: cum[cum.length - 1] }
}

export type Sample = { x: number; z: number; yaw: number; dist: number; speed: number }

/** Position at distance fraction s ∈ [0, 1]. */
export function pointAt(path: Path, s: number, out: Sample): Sample {
  const d = clamp(s) * path.total
  let i = 1
  while (i < path.cum.length - 1 && path.cum[i] < d) i++
  const a = path.pts[i - 1]
  const b = path.pts[i]
  const segLen = path.cum[i] - path.cum[i - 1] || 1
  const t = (d - path.cum[i - 1]) / segLen
  out.x = a[0] + (b[0] - a[0]) * t
  out.z = a[1] + (b[1] - a[1]) * t
  out.yaw = yawTo(b[0] - a[0], b[1] - a[1])
  out.dist = d
  return out
}

/**
 * Trapezoid velocity profile: accelerate over `accel`, cruise, decelerate.
 * Returns distance fraction and normalized speed (1 while cruising).
 */
export function trapezoid(u: number, accelIn: number, accelOut: number) {
  const x = clamp(u)
  const area = 1 - accelIn / 2 - accelOut / 2
  let s: number
  let v: number
  if (accelIn > 0 && x < accelIn) {
    v = x / accelIn
    s = (x * x) / (2 * accelIn)
  } else if (accelOut > 0 && x > 1 - accelOut) {
    const r = 1 - x
    v = r / accelOut
    s = area - (r * r) / (2 * accelOut)
  } else {
    v = 1
    s = accelIn / 2 + (x - accelIn)
  }
  return { s: s / area, v }
}

const STRIDE = 1.45
const ahead: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }

/**
 * @param u local 0–1 time of the walk
 * @param startYaw yaw before the first step; the turn blends in over the first steps
 * @param endYaw optional yaw to settle into at the end
 */
export function walk(path: Path, u: number, out: Sample & { phase: number; amount: number }, accelIn = 0.14, accelOut = 0.14, startYaw?: number, endYaw?: number) {
  const { s, v } = trapezoid(u, accelIn, accelOut)
  pointAt(path, s, out)
  // Smooth corners: look slightly ahead.
  pointAt(path, Math.min(1, s + 0.6 / path.total), ahead)
  const lookYaw = Math.hypot(ahead.x - out.x, ahead.z - out.z) > 0.05 ? yawTo(ahead.x - out.x, ahead.z - out.z) : out.yaw
  let yaw = lookYaw
  if (startYaw !== undefined) yaw = angleLerp(startYaw, yaw, smoothstep(0, 0.1, u))
  if (endYaw !== undefined) yaw = angleLerp(yaw, endYaw, smoothstep(0.86, 1, u))
  out.yaw = yaw
  out.phase = (out.dist / STRIDE) * Math.PI * 2
  out.amount = u <= 0 || u >= 1 ? 0 : Math.min(1, v * 1.4)
  out.speed = v
  return out
}
