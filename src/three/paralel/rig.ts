/**
 * PARALEL-LEŞ — placing a posed figure inside a moving frame (a swing seat,
 * a tumbling body, a bike in the air): pose and reach at a canonical place,
 * then carry the whole figure rigidly into the frame.
 */
import * as THREE from 'three'
import type { Figure } from '../figure/Figure'

const local = new THREE.Matrix4()
const world = new THREE.Matrix4()
const s = new THREE.Vector3()

/** root := frame × root (the root's current local transform is taken as canonical). */
export function carry(fig: Figure, frame: THREE.Matrix4) {
  const r = fig.root
  s.copy(r.scale)
  local.compose(r.position, r.quaternion, s)
  world.multiplyMatrices(frame, local)
  world.decompose(r.position, r.quaternion, r.scale)
  r.updateMatrixWorld(true)
}

const q = new THREE.Quaternion()
const e = new THREE.Euler()
const p = new THREE.Vector3()
const one = new THREE.Vector3(1, 1, 1)

/** A frame from a position and euler angles (YXZ). */
export function frameOf(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, out = new THREE.Matrix4(), order: THREE.EulerOrder = 'YXZ') {
  e.set(rx, ry, rz, order)
  q.setFromEuler(e)
  p.set(x, y, z)
  return out.compose(p, q, one)
}

/** Rotation about a pivot point (pivot in the canonical space), then a translation. */
export function pivotFrame(px: number, py: number, pz: number, rx: number, ry: number, rz: number, tx: number, ty: number, tz: number, out = new THREE.Matrix4()) {
  const t1 = new THREE.Matrix4().makeTranslation(-px, -py, -pz)
  const r = new THREE.Matrix4().makeRotationFromEuler(e.set(rx, ry, rz, 'YXZ'))
  const t2 = new THREE.Matrix4().makeTranslation(px + tx, py + ty, pz + tz)
  return out.copy(t2).multiply(r).multiply(t1)
}
