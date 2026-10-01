/**
 * Direction helpers shared by the set-based stories: keyed camera shots per
 * segment, and actors — a figure with a place, a pose, a walk, a glance and
 * hands that reach — all written as pure functions of story progress.
 */
import * as THREE from 'three'
import { clamp, easeInOutSine, lerp, type Ease } from '@/lib/math'
import { evalBlend, type Key } from '@/lib/track'
import { addWalk, blendPose, makePose, type Figure, type Pose } from '../figure/Figure'
import { walk, type Path, type Sample } from '../figure/paths'
import { reach } from '../figure/reach'
import { yawTo } from '../util'
import type { Shot } from './SetScene'

export type V7 = readonly [number, number, number, number, number, number, number]
export type ShotKeys = ReadonlyArray<readonly [number, V7]>

const tmp = [0, 0, 0, 0, 0, 0, 0]

/** Interpolates keyed shots ([u, shot] pairs inside one segment) into `shot`. */
export function keyed(keys: ShotKeys, u: number, shot: Shot, ease: Ease = easeInOutSine) {
  let i = 1
  while (i < keys.length - 1 && keys[i][0] < u) i++
  const a = keys[Math.max(0, i - 1)]
  const b = keys[Math.min(keys.length - 1, i)]
  const t = a === b ? 0 : ease(clamp((u - a[0]) / (b[0] - a[0] || 1)))
  for (let j = 0; j < 7; j++) tmp[j] = lerp(a[1][j], b[1][j], t)
  shot.pos.set(tmp[0], tmp[1], tmp[2])
  shot.tgt.set(tmp[3], tmp[4], tmp[5])
  shot.fov = tmp[6]
  return shot
}

/** Reduced motion: every keyed shot holds at its middle. */
export const held = (u: number, reduced: boolean) => (reduced ? 0.5 : u)

const walkS = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0, phase: 0, amount: 0 } as Sample & { phase: number; amount: number }
const v = new THREE.Vector3()

export class Actor {
  x = 0
  z = 0
  y = 0
  yaw = 0
  visible = true
  walking = 0
  step = 0
  /** Extra head turn, radians (clamped by the neck). */
  look = 0
  readonly pose: Pose = makePose({})
  private reaches: Array<{ side: 'l' | 'r'; w: number; x: number; y: number; z: number; out: number }> = []
  /** Breathing phase offset, so two people never breathe in step. */
  phase = Math.random() * 6

  constructor(readonly figure: Figure) {}

  /** Resets the per-frame extras; call before writing the actor's state. */
  begin() {
    this.look = 0
    this.walking = 0
    this.reaches.length = 0
    this.y = 0
    this.visible = true
    return this
  }

  place(x: number, z: number, yaw: number) {
    this.x = x
    this.z = z
    this.yaw = yaw
    return this
  }

  hold(p: Pose) {
    blendPose(p, p, 0, this.pose)
    return this
  }

  blend(keys: ReadonlyArray<Key<Pose>>, u: number) {
    const { a, b, t } = evalBlend(keys, u)
    blendPose(a, b, t, this.pose)
    return this
  }

  walk(path: Path, u: number, base: Pose, startYaw?: number, endYaw?: number, stride = 1) {
    walk(path, u, walkS, 0.16, 0.2, startYaw, endYaw)
    this.x = walkS.x
    this.z = walkS.z
    this.yaw = walkS.yaw
    this.hold(base)
    addWalk(this.pose, walkS.phase, walkS.amount * stride)
    this.step = Math.floor(walkS.phase / Math.PI)
    this.walking = walkS.amount
    return this
  }

  lookAt(x: number, z: number, amount = 1) {
    let d = yawTo(x - this.x, z - this.z) - this.yaw
    d = Math.atan2(Math.sin(d), Math.cos(d))
    this.look = clamp(d, -1.1, 1.1) * amount
    return this
  }

  reach(side: 'l' | 'r', w: number, x: number, y: number, z: number, out = 0.5) {
    if (w > 0.001) this.reaches.push({ side, w, x, y, z, out })
    return this
  }

  /** Writes the state to the figure. */
  apply(time: number, breathe: boolean) {
    const f = this.figure
    f.root.visible = this.visible
    if (!this.visible) return
    f.root.position.set(this.x, this.y, this.z)
    f.root.rotation.set(0, this.yaw, 0)
    f.applyPose(this.pose)
    if (breathe) {
      f.joints.chest.rotation.x += Math.sin(time * 1.5 + this.phase) * 0.012
      // Weight that never quite settles.
      f.joints.hips.rotation.z += Math.sin(time * 0.37 + this.phase) * 0.008 * (1 - this.walking)
      f.joints.head.rotation.x += Math.sin(time * 0.53 + this.phase * 2) * 0.012
    }
    f.life(time, breathe)
    f.joints.neck.rotation.y += this.look * 0.35
    f.joints.head.rotation.y += this.look * 0.55
    f.root.updateMatrixWorld(true)
    for (const r of this.reaches) reach(f, r.side, v.set(r.x, r.y, r.z), r.w, r.out)
    if (this.reaches.length) f.root.updateMatrixWorld(true)
  }
}

/** A pose blend track helper: [u, pose] keys. */
export type PoseKeys = ReadonlyArray<Key<Pose>>
