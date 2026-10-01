/**
 * Two-bone reach: bends an arm so its grip lands on a point in the world.
 * Used for the small things that have to touch exactly — a cup set on its
 * ring, a key dropped in a bowl, a hand on a door handle.
 *
 * Call after `applyPose` and after the figure's root is placed.
 */
import * as THREE from 'three'
import { clamp } from '@/lib/math'
import type { Figure } from './Figure'

const L1 = 0.29
const L2 = 0.345

const inv = new THREE.Matrix4()
const t = new THREE.Vector3()
const d = new THREE.Vector3()
const e = new THREE.Vector3()
const elbow = new THREE.Vector3()
const pole = new THREE.Vector3()
const a = new THREE.Vector3()
const b = new THREE.Vector3()
const c = new THREE.Vector3()
const qAlign = new THREE.Quaternion()
const qIK = new THREE.Quaternion()
const qPose = new THREE.Quaternion()

/**
 * @param weight 0 keeps the pose's own arm, 1 reaches fully
 * @param out how far the elbow swings outward (0 tucked … 1 wide)
 */
export function reach(f: Figure, side: 'l' | 'r', target: THREE.Vector3, weight: number, out = 0.5) {
  if (weight <= 0.001) return
  const upper = f.joints[side === 'l' ? 'lUpper' : 'rUpper']
  const fore = f.joints[side === 'l' ? 'lFore' : 'rFore']
  const chest = f.joints.chest
  chest.updateWorldMatrix(true, false)
  t.copy(target).applyMatrix4(inv.copy(chest.matrixWorld).invert())
  d.copy(t).sub(upper.position)
  const dist = clamp(d.length(), Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3)
  const bend = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1))
  // Where the grip lands in the upper arm's frame once the elbow bends by `bend`.
  e.set(0, -L1 - L2 * Math.cos(bend), L2 * Math.sin(bend)).normalize()
  d.normalize()
  qAlign.setFromUnitVectors(e, d)
  // Twist about the reach direction so the elbow hangs down and a little out.
  elbow.set(0, -1, 0).applyQuaternion(qAlign)
  pole.set((side === 'l' ? 1 : -1) * out, -1, -0.35)
  a.copy(elbow).addScaledVector(d, -elbow.dot(d))
  b.copy(pole).addScaledVector(d, -pole.dot(d))
  let twist = 0
  if (a.lengthSq() > 1e-6 && b.lengthSq() > 1e-6) twist = Math.atan2(c.crossVectors(a, b).dot(d), a.dot(b))
  qIK.setFromAxisAngle(d, twist).multiply(qAlign)
  qPose.setFromEuler(upper.rotation)
  upper.quaternion.copy(qPose.slerp(qIK, clamp(weight)))
  const w = clamp(weight)
  fore.rotation.set(fore.rotation.x + (-bend - fore.rotation.x) * w, fore.rotation.y * (1 - w), fore.rotation.z * (1 - w))
}
