/**
 * EMANET's camera and plan. Until the truth, the camera stays near Derin —
 * at her shoulder, at her hands, at her feet. In GERÇEK it cuts, for the first
 * time, to the other side of the table.
 */
import * as THREE from 'three'
import { SEG, at, local, segmentAt, type SegmentId } from '@/stories/emanet/timeline'
import { clamp, easeInOutCubic, easeInOutSine, lerp, smoothstep } from '@/lib/math'
import { APT } from './Apartment'
import type { Choreo } from './choreography'

export type Cam = { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number }
export const makeCam = (): Cam => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3(), fov: 40 })

type V7 = readonly [number, number, number, number, number, number, number]

/** Keyed shots per segment: [u, shot]. Linear in between with the segment's ease. */
const SHOTS: Partial<Record<SegmentId, ReadonlyArray<readonly [number, V7]>>> = {
  // The reader on the console, from the side away from her: her hand comes into the frame.
  open: [[0, [-2.05, 1.28, 2.2, -1.42, 0.9, 3.0, 30]]],
  logo: [
    [0, [-2.05, 1.28, 2.2, -1.42, 0.9, 3.0, 30]],
    [1, [-2.02, 1.26, 2.25, -1.42, 0.9, 3.0, 29]],
  ],
  insert: [
    [0, [-2.02, 1.26, 2.25, -1.42, 0.9, 3.0, 29]],
    [1, [-1.96, 1.22, 2.33, -1.42, 0.9, 3.0, 26]],
  ],
  // The house assembles around the camera as it pulls back and turns to the kitchen.
  form: [
    [0, [-1.96, 1.22, 2.33, -1.42, 0.9, 3.0, 26]],
    [0.35, [-2.25, 1.42, 1.95, -1.5, 1.0, 2.95, 34]],
    [0.72, [-2.5, 1.6, 1.9, -1.9, 1.15, -1.6, 44]],
    [1, [-2.35, 1.62, 2.0, -1.7, 1.15, -1.6, 44]],
  ],
  enter: [
    [0, [-2.35, 1.62, 2.0, -1.7, 1.15, -1.6, 44]],
    [0.55, [-2.1, 1.62, 1.75, -2.3, 1.25, -2.3, 40]],
    [1, [-1.75, 1.6, 1.35, -2.45, 1.35, -2.35, 36]],
  ],
  // Over her shoulder: she watches him cross the kitchen; we never see her face.
  voice: [
    [0, [-0.62, 1.62, 0.6, -2.6, 1.3, -1.9, 36]],
    [1, [-0.7, 1.6, 0.5, -2.7, 1.25, -1.1, 34]],
  ],
  cup: [
    [0, [-1.55, 1.02, -0.1, -2.08, 0.77, -0.62, 30]],
    [1, [-1.62, 0.98, -0.18, -2.08, 0.77, -0.62, 28]],
  ],
  curtain: [
    [0, [1.75, 1.45, 0.75, 4.5, 1.35, -0.45, 42]],
    [1, [2.3, 1.45, 0.45, 4.5, 1.35, -0.45, 40]],
  ],
  doorCheck: [
    [0, [-4.0, 1.42, 1.85, -3.0, 1.0, 3.1, 36]],
    [1, [-3.95, 1.38, 1.95, -3.0, 1.0, 3.1, 33]],
  ],
  keys: [
    [0, [-1.45, 1.36, 2.2, -2.12, 0.86, 3.0, 32]],
    [1, [-1.52, 1.3, 2.3, -2.12, 0.86, 3.0, 30]],
  ],
  drawer: [
    [0, [-2.8, 1.5, 2.15, -1.92, 0.8, 2.8, 36]],
    [0.65, [-2.75, 1.46, 2.2, -1.92, 0.82, 2.78, 34]],
    [1, [-2.7, 1.5, 2.2, -1.86, 1.1, 2.66, 34]],
  ],
  photo: [
    [0, [-2.2, 1.84, 2.02, -1.8, 1.2, 2.69, 30]],
    [1, [-2.1, 1.74, 2.14, -1.8, 1.22, 2.69, 25]],
  ],
  noon: [
    [0, [-3.75, 1.72, -2.35, 2.6, 1.05, 0.3, 50]],
    [1, [-3.45, 1.68, -2.1, 2.6, 1.05, 0.3, 48]],
  ],
  // The light moves across the floor; the two of them do not.
  afternoon: [
    [0, [-4.05, 2.05, -2.75, 2.4, 0.55, 1.2, 48]],
    [1, [-3.9, 2.0, -2.6, 2.4, 0.55, 1.2, 47]],
  ],
  clock: [
    [0, [-1.75, 2.15, -2.25, -2.1, 2.42, -3.13, 26]],
    [1, [-1.88, 2.28, -2.6, -2.1, 2.42, -3.13, 24]],
  ],
  loop: [
    [0, [2.7, 1.85, 3.0, -2.0, 1.0, -1.6, 50]],
    [1, [2.55, 1.82, 2.88, -2.0, 1.0, -1.6, 49]],
  ],
  // PARÇALAR: the reading looks at the afternoon slowly, one detail at a time.
  rewind: [
    [0, [2.4, 1.75, 2.6, -2.0, 1.1, -1.4, 48]],
    [1, [2.1, 1.7, 2.3, -2.0, 1.1, -1.4, 46]],
  ],
  fragments: [
    [0, [-0.2, 1.7, 1.2, -2.0, 1.0, -1.6, 46]],
    [0.12, [-0.25, 1.68, 1.1, -2.0, 1.0, -1.6, 45]],
    [0.22, [-1.0, 1.15, -0.72, -1.45, 0.76, -1.22, 32]],
    [0.4, [-1.02, 1.12, -0.76, -1.45, 0.76, -1.22, 30]],
    [0.47, [-2.6, 1.0, 1.85, -3.45, 0.08, 2.86, 34]],
    [0.62, [-2.62, 0.96, 1.9, -3.45, 0.08, 2.86, 32]],
    [0.69, [-1.25, 1.36, -1.95, -1.45, 0.92, -2.78, 32]],
    [0.82, [-1.27, 1.33, -2.0, -1.45, 0.92, -2.78, 30]],
    [0.89, [-2.45, 1.38, -1.95, -2.82, 0.96, -2.76, 32]],
    [1, [-2.47, 1.35, -2.0, -2.82, 0.96, -2.76, 30]],
  ],
  absent: [
    [0, [-1.6, 1.55, 1.2, -3.3, 0.6, 2.9, 40]],
    [1, [-1.9, 1.5, 1.5, -3.35, 0.5, 2.9, 38]],
  ],
  // From his right: the phone at his ear, the sofa far behind him.
  call: [
    [0, [-3.1, 1.4, -0.7, -1.95, 1.15, -1.6, 38]],
    [1, [-2.95, 1.36, -0.85, -1.95, 1.17, -1.6, 33]],
  ],
  dissolve: [
    // Starts wherever the approach left the camera (see cameraFor).
    [1, [1.2, 2.5, 1.9, -1.9, 0.9, -1.45, 44]],
  ],
  hush: [
    [0, [0.35, 1.55, -0.6, -1.7, 1.2, -1.2, 40]],
    [1, [0.2, 1.55, -0.65, -1.7, 1.2, -1.2, 38]],
  ],
  system: [
    [0, [-2.35, 1.58, -2.45, -1.25, 1.36, -0.25, 40]],
    [1, [-2.28, 1.55, -2.32, -1.25, 1.36, -0.25, 36]],
  ],
  document: [
    [0, [-1.6, 1.25, -1.25, -1.55, 0.754, -0.86, 30]],
    [1, [-1.58, 1.12, -1.12, -1.55, 0.754, -0.86, 28]],
  ],
  // Toward him — near enough to see that his face is clear now, never so near that it is all we see.
  closer: [
    [0, [-0.6, 1.6, 0.45, -1.9, 1.15, -1.55, 36]],
    [1, [-1.12, 1.5, -0.28, -1.9, 1.18, -1.55, 32]],
  ],
  // EMANET: the two of them at the table, from the side; then the house going to light.
  minute: [
    [0, [-0.4, 1.55, 0.35, -1.6, 1.15, -1.25, 40]],
    [1, [-0.3, 1.5, 0.2, -1.65, 1.15, -1.1, 38]],
  ],
  stay: [
    [0, [-0.05, 1.45, -1.65, -1.5, 1.1, -0.85, 44]],
    [1, [-0.15, 1.43, -1.6, -1.5, 1.1, -0.85, 42]],
  ],
  complete: [
    [0, [-0.15, 1.43, -1.6, -1.5, 1.1, -0.85, 42]],
    [1, [0.6, 1.9, 0.6, -1.8, 1.0, -0.9, 44]],
  ],
  end: [[0, [0.6, 1.9, 0.6, -1.8, 1.0, -0.9, 44]]],
}

const tmp: number[] = [0, 0, 0, 0, 0, 0, 0]

function keyed(keys: ReadonlyArray<readonly [number, V7]>, u: number, out: Cam, ease = easeInOutSine) {
  let i = 1
  while (i < keys.length - 1 && keys[i][0] < u) i++
  const a = keys[Math.max(0, i - 1)]
  const b = keys[Math.min(keys.length - 1, i)]
  const t = a === b ? 0 : ease(clamp((u - a[0]) / (b[0] - a[0] || 1)))
  for (let j = 0; j < 7; j++) tmp[j] = lerp(a[1][j], b[1][j], t)
  out.pos.set(tmp[0], tmp[1], tmp[2])
  out.tgt.set(tmp[3], tmp[4], tmp[5])
  out.fov = tmp[6]
  return out
}

const bounds = (v: THREE.Vector3) => {
  v.x = clamp(v.x, APT.x0 + 0.25, APT.x1 - 0.25)
  v.z = clamp(v.z, APT.z0 + 0.25, APT.z1 - 0.25)
  return v
}

/** Just behind Derin's shoulder, at her pace. */
function follow(c: Choreo, out: Cam) {
  const d = c.derin
  const fx = Math.sin(d.yaw)
  const fz = Math.cos(d.yaw)
  out.pos.set(d.x - fx * 1.15 - fz * 0.32, 1.64, d.z - fz * 1.15 + fx * 0.32)
  bounds(out.pos)
  out.tgt.set(d.x + fx * 2.2, 1.22, d.z + fz * 2.2)
  out.fov = 42
  return out
}

/** Low beside her feet, going to the window. */
function feet(c: Choreo, out: Cam) {
  const d = c.derin
  out.pos.set(d.x + 0.2, 0.22, d.z + 0.85)
  out.tgt.set(d.x + 0.6, 0.07, d.z)
  out.fov = 42
  return out
}

export type Plan = { sp: number; seg: SegmentId; u: number; fade: number; ghost: number; ghostSp: number }

/** What moment is shown at story progress p, and how. */
export function planFor(p: number, out: Plan, reduced: boolean): Plan {
  const seg = segmentAt(p).id as SegmentId
  const u = local(p, seg)
  out.seg = seg
  out.u = u
  out.sp = p
  out.ghost = 0
  out.ghostSp = p
  out.fade = 1
  if (seg === 'open') out.fade = 0
  else if (seg === 'logo') out.fade = 0.32 * smoothstep(0.2, 0.9, u)
  else if (seg === 'insert') out.fade = lerp(0.32, 1, smoothstep(0, 0.5, u))
  else if (seg === 'end') out.fade = 1 - smoothstep(0, 0.35, u)
  if (seg === 'loop') {
    // The day rewinds to the morning it always rewinds to.
    const r = reduced ? smoothstep(0.1, 0.9, u) : easeInOutCubic(u)
    out.sp = lerp(SEG.clock.end - 1e-4, at('form', 0.97), r)
    out.ghostSp = Math.min(SEG.clock.end - 1e-4, out.sp + 0.01)
    out.ghost = (reduced ? 0.25 : 0.5) * Math.sin(Math.PI * u)
  }
  return out
}

const approachEnd = makeCam()

/** Camera for the shown moment. `c` must already hold the choreography for `plan.sp`. */
export function cameraFor(plan: Plan, c: Choreo, out: Cam, reduced: boolean) {
  const { seg } = plan
  // Reduced motion: each shot holds still at its middle.
  const u = reduced && seg !== 'slippers' && seg !== 'approach' ? 0.5 : plan.u
  if (seg === 'slippers') return feet(c, out)
  if (seg === 'approach') return follow(c, out)
  if (seg === 'dissolve') {
    // Pick up exactly where the approach left off (she has stopped), then rise away.
    follow(c, approachEnd)
    const end = SHOTS.dissolve![0][1]
    const t = easeInOutSine(smoothstep(0.1, 0.95, u))
    out.pos.set(lerp(approachEnd.pos.x, end[0], t), lerp(approachEnd.pos.y, end[1], t), lerp(approachEnd.pos.z, end[2], t))
    out.tgt.set(lerp(approachEnd.tgt.x, end[3], t), lerp(approachEnd.tgt.y, end[4], t), lerp(approachEnd.tgt.z, end[5], t))
    out.fov = lerp(approachEnd.fov, end[6], t)
    return out
  }
  return keyed(SHOTS[seg]!, u, out)
}
