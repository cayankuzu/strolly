/**
 * A jointed figure built from sculpted geometry — every character in STROLLY
 * is the same rig with a different look: a sculpted head with eyes that have
 * irises and lids, brows, shaped ears; hands with jointed fingers; clothes
 * and skin on procedural cloth and skin surfaces. It breathes and blinks.
 *
 * Poses are flat Float32Arrays (hip height, hip forward offset, then XYZ
 * rotations per joint) so blending is a single loop with no allocation.
 */
import * as THREE from 'three'
import { mesh } from '../util'
import { applyMetricUVs, pbr, skinMaterial, surfaceMaps, type SurfaceKind } from '../kit/surfaces'
import { browGeometry, earGeometry, hairGeometry, handGeometry, headGeometry, headPoint, shoeGeometry, type FaceShape, type HairStyle } from './figureBody'
import { BIND, bodyGeometry } from './skin'

export const JOINTS = [
  'hips',
  'spine',
  'chest',
  'neck',
  'head',
  'lUpper',
  'lFore',
  'lHand',
  'rUpper',
  'rFore',
  'rHand',
  'lThigh',
  'lShin',
  'lFoot',
  'rThigh',
  'rShin',
  'rFoot',
] as const
export type JointName = (typeof JOINTS)[number]
type R3 = readonly [number, number, number]
export type PoseSpec = { hipY?: number; hipZ?: number } & Partial<Record<JointName, R3>>

const HEADER = 2
export const POSE_SIZE = HEADER + JOINTS.length * 3
export type Pose = Float32Array

export function makePose(spec: PoseSpec, base?: Pose): Pose {
  const p = base ? new Float32Array(base) : new Float32Array(POSE_SIZE)
  if (!base) p[0] = 0.985
  if (spec.hipY !== undefined) p[0] = spec.hipY
  if (spec.hipZ !== undefined) p[1] = spec.hipZ
  JOINTS.forEach((j, i) => {
    const r = spec[j]
    if (r) {
      p[HEADER + i * 3] = r[0]
      p[HEADER + i * 3 + 1] = r[1]
      p[HEADER + i * 3 + 2] = r[2]
    }
  })
  return p
}

export function blendPose(a: Pose, b: Pose, t: number, out: Pose): Pose {
  for (let i = 0; i < POSE_SIZE; i++) out[i] = a[i] + (b[i] - a[i]) * t
  return out
}

const idx = (j: JointName, axis: 0 | 1 | 2) => HEADER + JOINTS.indexOf(j) * 3 + axis

/** Adds a gait to a pose. `phase` is in radians and grows with distance walked. */
export function addWalk(pose: Pose, phase: number, amount: number) {
  if (amount <= 0) return pose
  const s = Math.sin(phase)
  const swing = 0.5 * amount
  pose[idx('lThigh', 0)] += -swing * s
  pose[idx('rThigh', 0)] += swing * s
  pose[idx('lShin', 0)] += amount * (0.1 + 0.8 * Math.pow(Math.max(0, Math.cos(phase + 0.9)), 2))
  pose[idx('rShin', 0)] += amount * (0.1 + 0.8 * Math.pow(Math.max(0, Math.cos(phase + 0.9 + Math.PI)), 2))
  pose[idx('lFoot', 0)] += amount * (0.25 * Math.max(0, s) - 0.12 * Math.max(0, -s))
  pose[idx('rFoot', 0)] += amount * (0.25 * Math.max(0, -s) - 0.12 * Math.max(0, s))
  pose[idx('lUpper', 0)] += 0.4 * amount * s
  pose[idx('rUpper', 0)] += -0.4 * amount * s
  pose[idx('lFore', 0)] += -amount * (0.28 + 0.12 * Math.max(0, -s))
  pose[idx('rFore', 0)] += -amount * (0.28 + 0.12 * Math.max(0, s))
  pose[idx('spine', 0)] += 0.05 * amount
  pose[idx('spine', 1)] += 0.07 * amount * s
  pose[idx('chest', 1)] += -0.1 * amount * s
  pose[idx('head', 0)] += 0.04 * amount
  pose[0] += amount * (0.016 * Math.cos(phase * 2) - 0.02)
  return pose
}

type M = THREE.Material

export type FigureLook = {
  name: string
  build: 'm' | 'f'
  face: FaceShape
  hairStyle: HairStyle
  skin: M
  /** Head skin with vertexColors on (stubble, lips). */
  skinHead: M
  eye: M
  hair: M
  top: M
  /** The waist section, if not the top (high-waisted trousers). */
  waist?: M
  bottom: M
  shoes: M
  sole: M
  cuff: M
  collar: 'mock' | 'crew'
  glasses?: { frame: M; lens: M }
  /** Overall height multiplier. */
  height?: number
  /** Cloth of the top and the trousers (knit sweater, woven shirt, denim…). */
  topSurface?: SurfaceKind
  bottomSurface?: SurfaceKind
  /** A belt at the waist. */
  belt?: boolean
}

const dressed = new WeakMap<THREE.Material, THREE.Material>()
const eyeWhite = () => new THREE.MeshPhysicalMaterial({ color: 0xd9cfc4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 })
const pupilMat = () => new THREE.MeshBasicMaterial({ color: 0x050403 })
const CLOTH_METERS: Partial<Record<SurfaceKind, number>> = { fabric: 0.12, knit: 0.09, denim: 0.1, leather: 0.35, rubber: 0.25 }

/** Gives a plain material a procedural surface in place (opaque standard materials only). */
function clothe(mat: M, kind: SurfaceKind) {
  const m = mat as THREE.MeshStandardMaterial
  if (!m.isMeshStandardMaterial || m.transparent || m.map || m.userData.meters) return mat
  const maps = surfaceMaps(kind)
  m.map = maps.detail
  m.normalMap = maps.normal
  m.roughnessMap = maps.orm
  m.aoMap = maps.orm
  m.aoMapIntensity = 0.5
  m.userData.surface = kind
  m.userData.meters = CLOTH_METERS[kind] ?? 0.2
  m.needsUpdate = true
  return mat
}

/** Skin and hair get their own physical materials; the story's colors are kept. */
function upgrade(mat: M, make: (c: THREE.Color, r: number) => M) {
  const m = mat as THREE.MeshStandardMaterial
  if (!m.isMeshStandardMaterial || m.transparent || m.map) return mat
  let out = dressed.get(mat)
  if (!out) {
    out = make(m.color.clone(), m.roughness)
    dressed.set(mat, out)
  }
  return out
}

const BUILD = {
  m: { chest: 1.14, chestR: 1, waist: 1.2, hip: 0.98, arm: 0.178, leg: 0.093, upperR: 0.049 },
  f: { chest: 1.06, chestR: 0.9, waist: 1.0, hip: 1.12, arm: 0.162, leg: 0.088, upperR: 0.042 },
}

export class Figure {
  readonly root = new THREE.Group()
  readonly joints = {} as Record<JointName, THREE.Bone>
  readonly glasses = new THREE.Group()
  readonly rGrip = new THREE.Object3D()
  readonly lGrip = new THREE.Object3D()
  readonly mouth = new THREE.Object3D()
  /** Meshes of the head, for effects that treat the face apart from the body. */
  readonly headMeshes: THREE.Mesh[] = []
  readonly meshes: THREE.Mesh[] = []
  private lids: THREE.Mesh[] = []
  private eyes: THREE.Group[] = []
  private blinkAt = 2 + Math.random() * 3
  private gazeAt = 0
  private gaze = new THREE.Vector2()

  constructor(source: FigureLook) {
    // Dress the look: skin and hair become physical materials, cloth gets a weave.
    const cloth = source.topSurface ?? (source.collar === 'mock' ? 'knit' : 'fabric')
    const look: FigureLook = {
      ...source,
      skin: upgrade(source.skin, (c, r) => skinMaterial(c, { roughness: Math.max(0.64, r) })),
      skinHead: upgrade(source.skinHead, (c, r) => skinMaterial(c, { vertexColors: true, roughness: Math.max(0.62, r) })),
      hair: upgrade(source.hair, (c, r) => pbr('hair', c, { roughness: Math.min(0.75, r) })),
      top: clothe(source.top, cloth),
      bottom: clothe(source.bottom, source.bottomSurface ?? 'fabric'),
      cuff: clothe(source.cuff, cloth),
      shoes: clothe(source.shoes, 'leather'),
      sole: clothe(source.sole, 'rubber'),
    }
    if (source.waist) look.waist = clothe(source.waist, source.bottomSurface ?? 'fabric')
    this.root.name = look.name
    const b = BUILD[look.build]
    for (const j of JOINTS) {
      const g = new THREE.Bone()
      g.name = j
      this.joints[j] = g
    }
    const J = this.joints
    this.root.add(J.hips)
    J.hips.add(J.spine, J.lThigh, J.rThigh)
    J.spine.position.y = 0.1
    J.spine.add(J.chest)
    J.chest.position.y = 0.17
    J.chest.add(J.neck)
    J.neck.position.y = 0.28
    J.neck.add(J.head)
    J.head.position.y = 0.078

    if (look.collar === 'mock') {
      mesh(new THREE.CylinderGeometry(0.056, 0.07, 0.07, 28), look.top, 0, 0.3, 0.006, J.chest)
      const fold = mesh(new THREE.TorusGeometry(0.058, 0.008, 8, 28), look.top, 0, 0.335, 0.006, J.chest)
      fold.rotation.x = Math.PI / 2
    } else {
      // A ribbed band from the shoulders up to the base of the neck, rolled at the edge.
      const band = mesh(new THREE.CylinderGeometry(0.058, 0.086, 0.052, 28, 1, true), look.top, 0, 0.266, 0.004, J.chest)
      band.scale.z = 0.9
      const crew = mesh(new THREE.TorusGeometry(0.059, 0.0085, 8, 28), look.top, 0, 0.291, 0.006, J.chest)
      crew.rotation.x = Math.PI / 2 - 0.12
      crew.scale.y = 0.92
    }
    // A belt if the look has one (the top ends on the body itself, see skin.ts).
    if (look.belt) {
      const belt = mesh(new THREE.TorusGeometry(0.128, 0.012, 4, 40), look.shoes, 0, 0.115, 0, J.hips)
      belt.rotation.x = Math.PI / 2
      belt.scale.set(b.hip, 0.8, 1)
      mesh(new THREE.BoxGeometry(0.03, 0.024, 0.006), look.cuff, 0, 0.115, 0.108, J.hips)
    }

    // Head
    const headR = look.build === 'f' ? 0.1 : 0.105
    this.headMeshes.push(mesh(headGeometry(headR, look.face), look.skinHead, 0, 0.108, 0.008, J.head))
    this.headMeshes.push(mesh(hairGeometry(headR, look.hairStyle), look.hair, 0, 0.108, 0.008, J.head))
    const k = headR / 0.105
    const white = eyeWhite()
    const pupil = pupilMat()
    for (const sx of [-1, 1]) {
      // Ears sit on the side of the skull, level with the nose.
      const earAt = headPoint(new THREE.Vector3(sx * 0.97, -0.17, -0.15), headR, null)
      const ear = mesh(earGeometry(sx), look.skin, earAt.x + sx * 0.004, 0.108 + earAt.y, 0.008 + earAt.z, J.head)
      ear.rotation.y = sx * 0.25
      // The eye: a white ball in the socket, an iris and pupil, a lid over its upper third.
      const eye = new THREE.Group()
      eye.position.set(sx * 0.033 * k, 0.1225, 0.0832 * k + 0.008)
      J.head.add(eye)
      this.eyes.push(eye)
      const ball = mesh(new THREE.SphereGeometry(0.0118, 20, 14), white, 0, 0, 0, eye)
      const iris = mesh(new THREE.CircleGeometry(0.0061, 24), look.eye, 0, 0, 0.0114, eye)
      const pup = mesh(new THREE.CircleGeometry(0.0026, 16), pupil, 0, 0, 0.01155, eye)
      const lid = mesh(new THREE.SphereGeometry(0.0128, 24, 8, 0, Math.PI * 2, 0, Math.PI * 0.43), look.skin, 0, 0.0004, 0.0004, eye)
      lid.userData.open = 0.2
      lid.rotation.x = lid.userData.open
      // The lash line along the lid's edge: what makes an eye read from across a room.
      const lash = mesh(new THREE.TorusGeometry(0.0125, 0.00075, 4, 24, Math.PI), look.hair, 0, 0.0028, 0, lid)
      lash.rotation.x = Math.PI / 2
      this.lids.push(lid)
      const lower = mesh(new THREE.SphereGeometry(0.0126, 24, 6, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28), look.skin, 0, 0, 0.0004, eye)
      lower.rotation.x = -0.46
      const brow = mesh(browGeometry(sx, headR, look.face, look.build === 'f' ? 0.8 : 1.1), look.hair, 0, 0.108, 0.008, J.head)
      this.headMeshes.push(ear, ball, iris, pup, lid, lash, lower, brow)
    }

    // Glasses, pivoting on the bridge of the nose.
    this.glasses.position.set(0, 0.123, 0.108)
    J.head.add(this.glasses)
    if (look.glasses) {
      const { frame, lens } = look.glasses
      for (const sx of [-1, 1]) {
        mesh(new THREE.TorusGeometry(0.025, 0.0028, 8, 28), frame, sx * 0.037, 0, 0, this.glasses)
        mesh(new THREE.CircleGeometry(0.024, 24), lens, sx * 0.037, 0, 0, this.glasses)
        const side = headPoint(new THREE.Vector3(sx, 0.12, 0.25), headR, null)
        const temple = mesh(new THREE.BoxGeometry(0.003, 0.003, 0.12), frame, side.x + sx * 0.004, 0.004, -0.058, this.glasses)
        temple.rotation.y = sx * 0.1
      }
      mesh(new THREE.BoxGeometry(0.02, 0.003, 0.003), frame, 0, 0.006, 0, this.glasses)
    }

    this.mouth.position.set(0, 0.044, 0.1)
    J.head.add(this.mouth)

    // Arms and legs
    for (const side of ['l', 'r'] as const) {
      const sx = side === 'l' ? 1 : -1
      const upper = J[`${side}Upper`]
      const fore = J[`${side}Fore`]
      const hand = J[`${side}Hand`]
      J.chest.add(upper)
      upper.position.set(sx * b.arm, 0.215, 0)
      upper.add(fore)
      fore.position.y = -0.29
      mesh(new THREE.CylinderGeometry(b.upperR - 0.014, b.upperR - 0.012, 0.032, 20, 1, true), look.cuff, 0, -0.238, 0, fore)
      fore.add(hand)
      hand.position.y = -0.26
      const hs = look.build === 'f' ? 0.88 : 1
      mesh(handGeometry(sx, hs), look.skin, 0, 0.004, 0, hand)
      const grip = side === 'l' ? this.lGrip : this.rGrip
      grip.position.set(0, -0.085, 0.03)
      hand.add(grip)

      const thigh = J[`${side}Thigh`]
      const shin = J[`${side}Shin`]
      const foot = J[`${side}Foot`]
      thigh.position.set(sx * b.leg, -0.05, 0)
      thigh.add(shin)
      shin.position.y = -0.44
      // Trouser hem over the top of the shoe.
      const hemLeg = mesh(new THREE.CylinderGeometry(0.041, 0.043, 0.03, 20, 1, true), look.bottom, 0, -0.4, 0.004, shin)
      hemLeg.scale.set(1, 1, 1.05)
      shin.add(foot)
      foot.position.y = -0.43
      mesh(shoeGeometry(), look.shoes, 0, -0.012, 0.01, foot)
      const sole = mesh(new THREE.CapsuleGeometry(0.044, 0.17, 4, 12), look.sole, 0, -0.064, 0.058, foot)
      sole.rotation.x = Math.PI / 2
      sole.scale.set(1.05, 1, 0.16)
      const heel = mesh(new THREE.CylinderGeometry(0.036, 0.034, 0.022, 16), look.sole, 0, -0.06, -0.035, foot)
      heel.scale.set(1, 1, 1.1)
    }

    // The body: one continuous skin from the neck to the wrists and ankles,
    // bound to the bones in the A-pose it was modelled in.
    J.hips.position.set(0, 0.985, 0)
    J.lUpper.rotation.z = BIND.arm
    J.rUpper.rotation.z = -BIND.arm
    J.lThigh.rotation.z = BIND.leg
    J.rThigh.rotation.z = -BIND.leg
    this.root.updateMatrixWorld(true)
    const skeleton = new THREE.Skeleton(JOINTS.map((j) => J[j]))
    const index = (j: JointName) => JOINTS.indexOf(j)
    const pieces = bodyGeometry(b, look.build === 'f', {
      hips: index('hips'),
      spine: index('spine'),
      chest: index('chest'),
      neck: index('neck'),
      lUpper: index('lUpper'),
      lFore: index('lFore'),
      rUpper: index('rUpper'),
      rFore: index('rFore'),
      lThigh: index('lThigh'),
      lShin: index('lShin'),
      rThigh: index('rThigh'),
      rShin: index('rShin'),
    })
    const wear = { skin: look.skin, top: look.top, waist: look.waist ?? look.top, bottom: look.bottom }
    for (const [region, geo] of Object.entries(pieces) as Array<[keyof typeof wear, THREE.BufferGeometry | null]>) {
      if (!geo) continue
      const body = new THREE.SkinnedMesh(geo.clone(), wear[region])
      body.name = `${look.name}-${region}`
      // Posed limbs leave the bind-pose bounds; never cull a person by them.
      body.frustumCulled = false
      body.receiveShadow = true
      this.root.add(body)
      body.bind(skeleton)
    }
    J.lUpper.rotation.z = 0
    J.rUpper.rotation.z = 0
    J.lThigh.rotation.z = 0
    J.rThigh.rotation.z = 0
    this.root.scale.setScalar(look.height ?? 1)

    this.root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      this.meshes.push(m)
      if (m.material !== look.glasses?.lens) m.castShadow = true
    })
    applyMetricUVs(this.root)
  }

  /**
   * The small life of a face: blinks every few seconds, eyes that settle on
   * one point and then another. `alive` false holds them open and still.
   */
  life(time: number, alive: boolean) {
    let close = 0
    if (alive) {
      if (time > this.blinkAt + 0.16) this.blinkAt = time + 2.2 + Math.random() * 4.5
      const t = time - this.blinkAt
      close = t > 0 && t < 0.16 ? Math.sin((t / 0.16) * Math.PI) : 0
      if (time > this.gazeAt) {
        this.gazeAt = time + 0.6 + Math.random() * 2.4
        this.gaze.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.14)
      }
    }
    for (const lid of this.lids) lid.rotation.x = lid.userData.open + close * 0.75
    for (const eye of this.eyes) eye.rotation.set(-this.gaze.y, this.gaze.x, 0)
  }

  applyPose(pose: Pose) {
    this.joints.hips.position.set(0, pose[0], pose[1])
    for (let i = 0; i < JOINTS.length; i++) {
      const o = HEADER + i * 3
      this.joints[JOINTS[i]].rotation.set(pose[o], pose[o + 1], pose[o + 2])
    }
  }
}
