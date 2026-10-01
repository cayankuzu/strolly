/**
 * Applies the reader's look (yaw/pitch offsets) to a story camera that has
 * already been aimed by the director. Roll stays zero; pitch never flips.
 */
import * as THREE from 'three'
import type { LookLimits } from '@/lib/look'

export type Look = { yaw: number; pitch: number }

const euler = new THREE.Euler(0, 0, 0, 'YXZ')
const forward = new THREE.Vector3()
const MAX_PITCH = 1.45

export function applyLook(camera: THREE.Camera, look: Look) {
  if (Math.abs(look.yaw) < 1e-5 && Math.abs(look.pitch) < 1e-5) return
  camera.getWorldDirection(forward)
  const yaw = Math.atan2(-forward.x, -forward.z)
  const pitch = Math.asin(Math.max(-1, Math.min(1, forward.y)))
  euler.set(Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch + look.pitch)), yaw + look.yaw, 0, 'YXZ')
  camera.quaternion.setFromEuler(euler)
}

/** A story's request to turn the reader's view (each id is honored once). */
export type LookRequest = { id: string; yaw: number; pitch: number; seconds: number }

/** What a scene tells the look system about the current frame. */
export type LookFrame = { locked: boolean; limits: LookLimits | null; request?: LookRequest | null }
