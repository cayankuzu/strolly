/**
 * PARALEL-LEŞ — hands that hold on: a closed fist wrapped round a rope or a
 * steel flange (the shared hand only hooks its fingertips), and the wrist
 * turned so the fist sits on the line it holds, thumb up.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Figure } from '../figure/Figure'
import { reach } from '../figure/reach'

const ni = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g)

function bone(a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const d = b.clone().sub(a)
  const len = d.length()
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len - r * 0.4), 4, 8)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()))
  const m = a.clone().add(b).multiplyScalar(0.5)
  g.translate(m.x, m.y, m.z)
  return ni(g)
}

/** Where the held line runs through the fist (hand-bone space; the axis is along x). */
export const FIST_AXIS = new THREE.Vector3(0, -0.104, -0.0135)
const R = 0.021

/** A fist closed round a line of radius ≈ 13 mm running along the hand's x axis. */
export function fistGeometry(sx: number) {
  const parts: THREE.BufferGeometry[] = []
  const palm = new RoundedBoxGeometry(0.074, 0.088, 0.026, 3, 0.011)
  palm.translate(0, -0.046, 0)
  parts.push(ni(palm))
  const pad = new THREE.SphereGeometry(0.019, 12, 10)
  pad.scale(1, 1.3, 0.75)
  pad.translate(-sx * 0.024, -0.038, -0.007)
  parts.push(ni(pad))
  const yc = FIST_AXIS.y
  const zc = FIST_AXIS.z
  const fingers = [
    { x: -0.026, r: 0.0088, k: 1 },
    { x: -0.0085, r: 0.0091, k: 1.04 },
    { x: 0.0085, r: 0.0087, k: 1 },
    { x: 0.025, r: 0.0077, k: 0.9 },
  ]
  const deg = Math.PI / 180
  for (const f of fingers) {
    const at = (a: number) => new THREE.Vector3(sx * f.x, yc + R * f.k * Math.sin(a * deg), zc + R * f.k * Math.cos(a * deg))
    const knots = [50, -30, -118, -196].map(at)
    for (let i = 0; i < 3; i++) parts.push(bone(knots[i], knots[i + 1], f.r * (1 - i * 0.08)))
  }
  // The thumb closes across the front of the index and middle fingers.
  const t0 = new THREE.Vector3(-sx * 0.03, -0.03, -0.006)
  const t1 = new THREE.Vector3(-sx * 0.022, -0.074, -0.03)
  const t2 = new THREE.Vector3(-sx * 0.002, -0.098, -0.04)
  parts.push(bone(t0, t1, 0.0102), bone(t1, t2, 0.0094))
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  g.computeVertexNormals()
  return g
}

const FIST: Record<'l' | 'r', THREE.BufferGeometry | null> = { l: null, r: null }

/** Swaps a hand to the fist (or back to the relaxed hand). */
export function setFist(fig: Figure, closed: boolean, sides: ReadonlyArray<'l' | 'r'> = ['l', 'r']) {
  for (const side of sides) {
    const b = fig.joints[side === 'l' ? 'lHand' : 'rHand']
    const hand = b.children.find((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh | undefined
    if (!hand) continue
    if (!hand.userData.relaxed) hand.userData.relaxed = hand.geometry
    if (closed && !FIST[side]) FIST[side] = fistGeometry(side === 'l' ? 1 : -1)
    const want = closed ? (FIST[side] as THREE.BufferGeometry) : (hand.userData.relaxed as THREE.BufferGeometry)
    if (hand.geometry !== want) hand.geometry = want
  }
}

const vUp = new THREE.Vector3()
const vP = new THREE.Vector3()
const vX = new THREE.Vector3()
const vY = new THREE.Vector3()
const vZ = new THREE.Vector3()
const vW = new THREE.Vector3()
const vE = new THREE.Vector3()
const vC = new THREE.Vector3()
const vT = new THREE.Vector3()
const mB = new THREE.Matrix4()
const qW = new THREE.Quaternion()
const qP = new THREE.Quaternion()

/**
 * Closes a hand round a line: the fist's axis lies along `dir` through
 * `point` (world), thumb toward +dir, knuckles toward `forward`. Call after
 * the figure is posed and placed (Actor.apply); bends the arm with the
 * two-bone reach so the fist lands on the line.
 */
export function gripLine(fig: Figure, side: 'l' | 'r', point: THREE.Vector3, dir: THREE.Vector3, forward: THREE.Vector3, out = 0.4) {
  const sx = side === 'l' ? 1 : -1
  const fore = fig.joints[side === 'l' ? 'lFore' : 'rFore']
  const hand = fig.joints[side === 'l' ? 'lHand' : 'rHand']
  setFist(fig, true, [side])
  vUp.copy(dir).normalize()
  let target = vT.copy(point)
  for (let it = 0; it < 3; it++) {
    reach(fig, side, target, 1, out)
    fig.root.updateMatrixWorld(true)
    // Knuckles: the forearm's way, squared to the line, leaning toward `forward`.
    fore.getWorldPosition(vE)
    hand.getWorldPosition(vW)
    vP.copy(vW).sub(vE).normalize().addScaledVector(forward, 0.8)
    vP.addScaledVector(vUp, -vP.dot(vUp))
    if (vP.lengthSq() < 1e-6) vP.copy(forward)
    vP.normalize()
    // Hand basis: x along the line (thumb end up), y back toward the wrist, z = x × y.
    vX.copy(vUp).multiplyScalar(-sx)
    vY.copy(vP).negate()
    vZ.crossVectors(vX, vY).normalize()
    vY.crossVectors(vZ, vX).normalize()
    mB.makeBasis(vX, vY, vZ)
    qW.setFromRotationMatrix(mB)
    fore.getWorldQuaternion(qP)
    hand.quaternion.copy(qP.invert().multiply(qW))
    hand.updateMatrixWorld(true)
    // Where the line now runs through the fist, and how far that is from where it should.
    vC.copy(FIST_AXIS).setY(FIST_AXIS.y + 0.004)
    hand.localToWorld(vC)
    const miss = vC.sub(point)
    miss.addScaledVector(vUp, -miss.dot(vUp))
    if (miss.lengthSq() < 1e-6) break
    target = vT.sub(miss)
  }
}
