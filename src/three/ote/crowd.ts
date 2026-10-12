/**
 * The passengers nobody is introduced to: instanced bodies, standing or
 * seated, with their own coat colour, skin, hair (grey for most of them —
 * they are old) and a face that turns. Behind the full figures, at the
 * depth of a cabin or a lounge, they read as people.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { pbr } from '../kit/surfaces'

type G = THREE.BufferGeometry

function capsule(r: number, len: number, from: THREE.Vector3, to: THREE.Vector3, sx = 1, sz = 1): G {
  const g = new THREE.CapsuleGeometry(r, len, 6, 12)
  g.scale(sx, 1, sz)
  const dir = new THREE.Vector3().subVectors(to, from)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  g.applyQuaternion(q)
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
  g.translate(mid.x, mid.y, mid.z)
  return g
}
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

function merge(parts: G[]) {
  const out = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))
  parts.forEach((p) => p.dispose())
  return out
}

/** A standing body (head excluded), feet at y 0, facing +z. */
function standingBody() {
  const parts: G[] = []
  const torso = new THREE.CapsuleGeometry(0.165, 0.4, 6, 14)
  torso.scale(1, 1, 0.62)
  torso.translate(0, 1.2, 0)
  parts.push(torso)
  const hips = new THREE.CapsuleGeometry(0.15, 0.1, 6, 12)
  hips.scale(1.05, 1, 0.7)
  hips.translate(0, 0.92, 0)
  parts.push(hips)
  for (const sx of [-1, 1]) {
    parts.push(capsule(0.066, 0.74, v(sx * 0.09, 0.88, 0), v(sx * 0.095, 0.08, 0)))
    parts.push(capsule(0.048, 0.12, v(sx * 0.095, 0.05, -0.02), v(sx * 0.095, 0.05, 0.12)))
    parts.push(capsule(0.05, 0.26, v(sx * 0.21, 1.4, 0), v(sx * 0.235, 1.1, 0.01)))
    parts.push(capsule(0.042, 0.24, v(sx * 0.235, 1.08, 0.01), v(sx * 0.23, 0.82, 0.05)))
  }
  const neck = new THREE.CylinderGeometry(0.05, 0.056, 0.12, 10)
  neck.translate(0, 1.5, 0)
  parts.push(neck)
  return merge(parts)
}

/** A seated body for a 0.45 m seat, facing +z, forearms on the thighs. */
function seatedBody() {
  const parts: G[] = []
  const torso = new THREE.CapsuleGeometry(0.165, 0.36, 6, 14)
  torso.scale(1, 1, 0.62)
  torso.rotateX(-0.08)
  torso.translate(0, 0.86, -0.06)
  parts.push(torso)
  const hips = new THREE.CapsuleGeometry(0.15, 0.08, 6, 12)
  hips.scale(1.05, 1, 0.75)
  hips.translate(0, 0.56, -0.04)
  parts.push(hips)
  for (const sx of [-1, 1]) {
    parts.push(capsule(0.07, 0.36, v(sx * 0.1, 0.55, -0.02), v(sx * 0.11, 0.55, 0.4)))
    parts.push(capsule(0.058, 0.38, v(sx * 0.11, 0.53, 0.43), v(sx * 0.12, 0.08, 0.47)))
    parts.push(capsule(0.048, 0.12, v(sx * 0.12, 0.05, 0.44), v(sx * 0.12, 0.05, 0.58)))
    parts.push(capsule(0.05, 0.24, v(sx * 0.21, 1.02, -0.06), v(sx * 0.23, 0.76, 0.02)))
    parts.push(capsule(0.042, 0.22, v(sx * 0.23, 0.74, 0.04), v(sx * 0.16, 0.66, 0.3)))
  }
  const neck = new THREE.CylinderGeometry(0.05, 0.056, 0.12, 10)
  neck.translate(0, 1.13, -0.07)
  parts.push(neck)
  return merge(parts)
}

/** Hair: a cap over the crown and down the back of the head (the face stays bare). */
function hairGeometry() {
  const top = new THREE.SphereGeometry(0.107, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42)
  const back = new THREE.SphereGeometry(0.106, 20, 8, Math.PI + 0.35, Math.PI - 0.7, Math.PI * 0.4, Math.PI * 0.32)
  const g = merge([top, back])
  g.scale(0.92, 1.1, 1.04)
  return g
}

function faceGeometry() {
  const parts: G[] = []
  for (const sx of [-1, 1]) {
    const eye = new THREE.SphereGeometry(0.0105, 8, 6)
    eye.scale(1, 0.75, 0.5)
    eye.translate(sx * 0.031, 0.016, 0.094)
    parts.push(eye)
    const brow = new THREE.BoxGeometry(0.03, 0.006, 0.006)
    brow.rotateZ(sx * -0.12)
    brow.translate(sx * 0.032, 0.04, 0.094)
    parts.push(brow)
  }
  const mouth = new THREE.BoxGeometry(0.03, 0.004, 0.006)
  mouth.translate(0, -0.05, 0.094)
  parts.push(mouth)
  return merge(parts)
}

export type PassengerState = {
  seated?: boolean
  visible?: boolean
  /** Turn of the head relative to the body (radians). */
  headYaw?: number
  /** 0 upright … 1 looking down. */
  headDown?: number
  /** Lean back into a seat (radians), e.g. under the G-force. */
  lean?: number
  /** Extra height for the head (sitting on a higher seat). */
  lift?: number
}

const SKINS = [0xd8b39b, 0xc89d82, 0xe2c2ab, 0xb88a6c, 0xd4a98f, 0xa87a5e]
const COATS = [0x5b5f66, 0x6d6252, 0x3f4a55, 0x7a6f63, 0x4b5045, 0x655a6e, 0x8a8174, 0x3a3e44, 0x6e5a48, 0x52606a]
const HAIRS = [0xd9d6d0, 0xb7b4ae, 0x8f8b85, 0xe6e3dd, 0x5a4a3c, 0x2a221c, 0xcac7c1]

export class Passengers {
  readonly group = new THREE.Group()
  private sets: Array<{ body: THREE.InstancedMesh; head: THREE.InstancedMesh; hair: THREE.InstancedMesh; face: THREE.InstancedMesh; headY: number; headZ: number }>
  private d = new THREE.Object3D()
  private h = new THREE.Object3D()
  readonly colors: Array<{ coat: THREE.Color; skin: THREE.Color; hair: THREE.Color }> = []

  constructor(
    readonly count: number,
    seed = 3,
  ) {
    const body = pbr('fabric', 0xffffff)
    const skin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62 })
    const hair = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 })
    const face = new THREE.MeshStandardMaterial({ color: 0x2a1d16, roughness: 0.6 })
    const headGeo = new THREE.SphereGeometry(0.1, 20, 16)
    headGeo.scale(0.88, 1.12, 1)
    const hairGeo = hairGeometry()
    const faceGeo = faceGeometry()
    this.sets = [
      { geo: standingBody(), headY: 1.66, headZ: 0.0 },
      { geo: seatedBody(), headY: 1.27, headZ: -0.06 },
    ].map(({ geo, headY, headZ }) => {
      const set = {
        body: new THREE.InstancedMesh(geo, body, count),
        head: new THREE.InstancedMesh(headGeo, skin, count),
        hair: new THREE.InstancedMesh(hairGeo, hair, count),
        face: new THREE.InstancedMesh(faceGeo, face, count),
        headY,
        headZ,
      }
      for (const m of [set.body, set.head, set.hair, set.face]) {
        m.castShadow = m !== set.face
        m.receiveShadow = true
        m.frustumCulled = false
        this.group.add(m)
      }
      return set
    })
    let s = seed
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < count; i++) {
      const c = {
        coat: new THREE.Color(COATS[Math.floor(rand() * COATS.length)]).multiplyScalar(0.85 + rand() * 0.3),
        skin: new THREE.Color(SKINS[Math.floor(rand() * SKINS.length)]),
        hair: new THREE.Color(HAIRS[Math.floor(rand() * HAIRS.length)]),
      }
      this.colors.push(c)
      for (const set of this.sets) {
        set.body.setColorAt(i, c.coat)
        set.head.setColorAt(i, c.skin)
        set.hair.setColorAt(i, c.hair)
      }
    }
    for (const set of this.sets) for (const m of [set.body, set.head, set.hair]) m.instanceColor!.needsUpdate = true
  }

  /** Places passenger i at (x, z) facing yaw. */
  set(i: number, x: number, z: number, yaw: number, o: PassengerState = {}) {
    const shown = o.visible !== false
    for (let k = 0; k < 2; k++) {
      const set = this.sets[k]
      const on = shown && (k === 1) === !!o.seated
      const d = this.d
      d.position.set(x, 0, z)
      d.rotation.set(0, yaw, 0)
      d.scale.setScalar(on ? 1 : 0.0001)
      d.updateMatrix()
      set.body.setMatrixAt(i, d.matrix)
      // The head: on the neck, turned and bowed on its own.
      const lean = o.lean ?? 0
      const h = this.h
      const hy = set.headY + (o.lift ?? 0)
      const back = Math.sin(lean) * (hy - 0.55)
      h.position.set(x + Math.sin(yaw) * (set.headZ - back), hy - (1 - Math.cos(lean)) * 0.5 - (o.headDown ?? 0) * 0.03, z + Math.cos(yaw) * (set.headZ - back))
      h.rotation.set(0.45 * (o.headDown ?? 0) - lean, yaw + (o.headYaw ?? 0), 0, 'YXZ')
      h.scale.setScalar(on ? 1 : 0.0001)
      h.updateMatrix()
      set.head.setMatrixAt(i, h.matrix)
      set.hair.setMatrixAt(i, h.matrix)
      set.face.setMatrixAt(i, h.matrix)
    }
  }

  hideAll() {
    for (let i = 0; i < this.count; i++) this.set(i, 0, 0, 0, { visible: false })
  }

  commit() {
    for (const set of this.sets)
      for (const m of [set.body, set.head, set.hair, set.face]) {
        m.instanceMatrix.needsUpdate = true
      }
  }
}
