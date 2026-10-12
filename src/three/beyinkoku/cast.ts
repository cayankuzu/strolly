/**
 * The people of BEYİN-KÖKÜ: articulated figures with their own materials (so a
 * set can re-dress them), the ring scar everyone inside the simulation wears,
 * the "monster" kit of the second floor (stretched head, black eyes, the scar
 * splitting open), the devices in the staff's hands, and the story's poses.
 */
import * as THREE from 'three'
import { smoothstep } from '@/lib/math'
import { Figure, makePose, type FigureLook, type Pose } from '../figure/Figure'
import { headPoint, type FaceShape, type HairStyle } from '../figure/figureBody'
import * as P from '../figure/poses'
import { Actor } from '../kit/direct'
import { std } from '../kit/props'
import type { SurfaceKind } from '../kit/surfaces'
import { mesh } from '../util'
import type { Pal } from './materials'

// ——— Looks ———

export type Spec = {
  name: string
  build: 'm' | 'f'
  face?: FaceShape
  hair: HairStyle
  skin: number
  hairColor: number
  top: number
  bottom: number
  shoes?: number
  cuff?: number
  collar?: 'mock' | 'crew'
  topSurface?: SurfaceKind
  bottomSurface?: SurfaceKind
  height?: number
  eye?: number
  glasses?: boolean
  belt?: boolean
}

export type Wear = {
  skin: THREE.MeshStandardMaterial
  skinHead: THREE.MeshStandardMaterial
  hair: THREE.MeshStandardMaterial
  top: THREE.MeshStandardMaterial
  cuff: THREE.MeshStandardMaterial
  bottom: THREE.MeshStandardMaterial
  shoes: THREE.MeshStandardMaterial
}

export type Person = { figure: Figure; actor: Actor; wear: Wear; scar: THREE.Mesh | null; kit: MonsterKit | null; name: string }

const FACE_M: FaceShape = { jaw: 0.3, nose: 0.2, lips: 0.045, stubble: 0.22 }
const FACE_F: FaceShape = { jaw: 0.16, nose: 0.14, lips: 0.07, stubble: 0 }

export function person(spec: Spec, pal: Pal, opts: { scar?: 'old' | 'new' | null; monster?: boolean } = {}): Person {
  const top = std(spec.top, 0.92)
  const cuff = spec.cuff !== undefined ? std(spec.cuff, 0.9) : top
  const look: FigureLook = {
    name: spec.name,
    build: spec.build,
    face: spec.face ?? (spec.build === 'm' ? FACE_M : FACE_F),
    hairStyle: spec.hair,
    skin: std(spec.skin, 0.55),
    skinHead: std(spec.skin, 0.52, { vertexColors: true }),
    eye: std(spec.eye ?? 0x1d1610, 0.15),
    hair: std(spec.hairColor, 0.72),
    top,
    bottom: std(spec.bottom, 0.9),
    shoes: std(spec.shoes ?? 0x1c1a18, 0.7),
    sole: pal.sole,
    cuff,
    collar: spec.collar ?? 'crew',
    topSurface: spec.topSurface,
    bottomSurface: spec.bottomSurface,
    height: spec.height,
    belt: spec.belt,
    glasses: spec.glasses ? { frame: std(0x2a2522, 0.4), lens: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.12, depthWrite: false }) } : undefined,
  }
  const figure = new Figure(look)
  const body = (region: string) => (figure.root.getObjectByName(`${spec.name}-${region}`) as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial
  const wear: Wear = {
    skin: body('skin'),
    skinHead: figure.headMeshes[0].material as THREE.MeshStandardMaterial,
    hair: figure.headMeshes[1].material as THREE.MeshStandardMaterial,
    top: look.top as THREE.MeshStandardMaterial,
    cuff: look.cuff as THREE.MeshStandardMaterial,
    bottom: look.bottom as THREE.MeshStandardMaterial,
    shoes: look.shoes as THREE.MeshStandardMaterial,
  }
  const scar = opts.scar ? ringScar(figure, spec, pal, opts.scar) : null
  const kit = opts.monster ? new MonsterKit(figure, spec, pal) : null
  return { figure, actor: new Actor(figure), wear, scar, kit, name: spec.name }
}

/** Re-dresses a figure (colours only; surfaces stay). */
export function dress(w: Wear, c: { top?: number; bottom?: number; cuff?: number; hair?: number; skin?: number; shoes?: number }) {
  if (c.top !== undefined) w.top.color.setHex(c.top)
  if (c.cuff !== undefined && w.cuff !== w.top) w.cuff.color.setHex(c.cuff)
  if (c.bottom !== undefined) w.bottom.color.setHex(c.bottom)
  if (c.hair !== undefined) w.hair.color.setHex(c.hair)
  if (c.shoes !== undefined) w.shoes.color.setHex(c.shoes)
  if (c.skin !== undefined) {
    w.skin.color.setHex(c.skin)
    w.skinHead.color.setHex(c.skin)
  }
}

// ——— The ring scar ———

const G = (x: number, s: number) => Math.exp(-(x * x) / (2 * s * s))

/** Copy of the rig's hairline (figureBody.ts), to know where the scar crosses hair. */
function hairlineAt(style: HairStyle, ux: number, uz: number) {
  if (style === 'short') return 0.5 - 0.42 * smoothstep(1, 0, uz) - 1.15 * smoothstep(0, -0.6, uz) + 0.1 * G(Math.abs(ux) - 0.55, 0.15) * Math.max(0, uz)
  if (uz > 0.42) return 0.44 + 0.06 * G(Math.abs(ux) - 0.5, 0.15)
  return -1.1 + 0.75 * smoothstep(-1, 0.42, uz)
}

/** The scar's path around a head: across the forehead at the hairline, over the temples, round the back of the skull. */
function scarCurve(spec: Spec, lift = 1) {
  const headR = spec.build === 'f' ? 0.1 : 0.105
  const face = spec.face ?? (spec.build === 'm' ? FACE_M : FACE_F)
  const pts: THREE.Vector3[] = []
  const dir = new THREE.Vector3()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2
    dir.set(Math.sin(t), 0.35 + 0.12 * Math.cos(t), Math.cos(t)).normalize()
    headPoint(dir, headR, face, a)
    headPoint(dir, headR, null, b)
    const tuft = 1 + 0.035 * smoothstep(-0.6, 1, dir.y)
    b.multiplyScalar(1.05 * tuft * 1.012)
    const under = smoothstep(-0.05, 0.05, dir.y - hairlineAt(spec.hair, dir.x, dir.z))
    a.multiplyScalar(1.004).lerp(b, under)
    pts.push(a.clone().multiplyScalar(lift))
  }
  return new THREE.CatmullRomCurve3(pts, true)
}

function ringScar(figure: Figure, spec: Spec, pal: Pal, kind: 'old' | 'new') {
  const curve = scarCurve(spec)
  const m = mesh(new THREE.TubeGeometry(curve, 144, 0.0019, 5, true), kind === 'new' ? pal.scarNew : pal.scar, 0, 0.108, 0.008, figure.joints.head)
  m.castShadow = false
  if (kind === 'new') {
    // A pink rim around the fresh line.
    const rim = mesh(new THREE.TubeGeometry(curve, 144, 0.0042, 5, true), pal.scarNew, 0, 0.108, 0.008, figure.joints.head)
    rim.scale.setScalar(0.998)
  }
  return m
}

// ——— The second floor's distortion ———

/**
 * Brief and light-carried: the head stretches, the eyes become flat black
 * discs, a thin black band opens along the scar, the mouth lengthens. A faint
 * second face (30 %) slides off the first for the swarm's overlap.
 */
export class MonsterKit {
  private eyes: THREE.Mesh[] = []
  private split: THREE.Mesh
  private mouth: THREE.Mesh
  private ghost: THREE.Mesh
  amount = 0

  constructor(
    private figure: Figure,
    spec: Spec,
    pal: Pal,
  ) {
    const J = figure.joints
    const headR = spec.build === 'f' ? 0.1 : 0.105
    const k = headR / 0.105
    for (const sx of [-1, 1]) {
      const d = mesh(new THREE.CircleGeometry(0.017, 20), pal.black, sx * 0.033 * k, 0.1225, 0.0832 * k + 0.008 + 0.0128, J.head)
      d.scale.set(1, 1.25, 1)
      d.visible = false
      this.eyes.push(d)
    }
    this.split = mesh(new THREE.TubeGeometry(scarCurve(spec, 1.012), 144, 0.0045, 6, true), pal.split, 0, 0.108, 0.008, J.head)
    this.split.visible = false
    const mouth = new THREE.CircleGeometry(0.02, 20)
    this.mouth = mesh(mouth, pal.black, 0, 0.046, 0.0985 * k + 0.012, J.head)
    this.mouth.visible = false
    this.ghost = mesh(figure.headMeshes[0].geometry, pal.ghostFace, 0.025, 0.118, 0.02, J.head)
    this.ghost.visible = false
  }

  /** 0 human … 1 creature. Call after the actor's apply(). `overlap` adds the faint second face. */
  set(amount: number, overlap = 0) {
    this.amount = amount
    const on = amount > 0.02
    const h = this.figure.joints.head
    h.scale.set(1 - 0.08 * amount, 1 + 0.38 * amount, 1 + 0.04 * amount)
    for (const e of this.eyes) e.visible = on
    this.split.visible = on
    this.mouth.visible = on
    this.mouth.scale.set(0.8 + 0.1 * amount, 0.4 + 0.75 * amount, 1)
    this.mouth.position.y = 0.048 - 0.006 * amount
    this.ghost.visible = on && overlap > 0.01
    this.ghost.scale.set(1.04, 1.1 + 0.2 * overlap, 1.04)
    this.ghost.position.x = 0.03 * overlap
  }
}

// ——— Devices ———

export type Device = { group: THREE.Group; set(mode: 'pen' | 'needle' | 'hook' | 'pipe' | 'none', grow?: number): void }

/** The staff's pen-like device (0.14 m) and what it becomes. Held along the hand's −y. */
export function device(pal: Pal, parent: THREE.Object3D): Device {
  const g = new THREE.Group()
  parent.add(g)
  const pen = mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.14, 12), pal.device, 0, -0.03, 0, g)
  const tip = mesh(new THREE.ConeGeometry(0.0065, 0.02, 12), pal.device, 0, -0.11, 0, g)
  tip.rotation.x = Math.PI
  // Base at the pen's tip, point 0.6 m further along −y.
  const needleGeo = new THREE.ConeGeometry(0.0055, 0.6, 10)
  needleGeo.rotateX(Math.PI)
  needleGeo.translate(0, -0.3, 0)
  const needle = mesh(needleGeo, pal.needle, 0, -0.1, 0, g)
  const hook = mesh(new THREE.TorusGeometry(0.07, 0.006, 8, 24, Math.PI * 1.3), pal.needle, 0, -0.17, 0.05, g)
  hook.rotation.y = Math.PI / 2
  const pipe = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.42, 14), pal.steelDark, 0, -0.21, 0, g)
  return {
    group: g,
    set(mode, grow = 1) {
      g.visible = mode !== 'none'
      pen.visible = tip.visible = mode === 'pen' || mode === 'needle'
      needle.visible = mode === 'needle'
      needle.scale.set(1, Math.max(0.01, grow), 1)
      hook.visible = mode === 'hook'
      pipe.visible = mode === 'pipe'
    },
  }
}

// ——— Poses ———

/** A body in a station frame: reclined 45°, arms on the rests, slack. */
export const RECLINE = makePose({
  hipY: 0.6,
  hips: [-0.78, 0, 0],
  spine: [0.04, 0, 0],
  chest: [0.02, 0, 0],
  neck: [-0.02, 0, 0],
  head: [0.06, 0, 0],
  lThigh: [-0.79, 0, 0.08],
  rThigh: [-0.79, 0, -0.08],
  lShin: [0.59, 0, 0],
  rShin: [0.59, 0, 0],
  lFoot: [0.3, 0, 0],
  rFoot: [0.3, 0, 0],
  lUpper: [-0.2, 0, 0.16],
  rUpper: [-0.2, 0, -0.16],
  lFore: [-0.75, 0, 0],
  rFore: [-0.75, 0, 0],
  lHand: [0.1, 0, 0],
  rHand: [0.1, 0, 0],
})

/** Strapped upright: arms at the sides, chin a little down. */
export const STRAPPED = makePose({
  lUpper: [0.02, 0, 0.12],
  rUpper: [0.02, 0, -0.12],
  lFore: [-0.08, 0, 0],
  rFore: [-0.08, 0, 0],
  head: [0.1, 0, 0],
  neck: [0.04, 0, 0],
})

/** Asleep on his back (the scene turns the root to lie along the bed). */
export const SLEEP = makePose({
  hipY: 0.12,
  hips: [-1.47, 0, 0],
  lThigh: [-0.04, 0, 0.04],
  rThigh: [-0.04, 0, -0.04],
  lShin: [0.06, 0, 0],
  rShin: [0.06, 0, 0],
  lUpper: [0.05, 0, 0.14],
  rUpper: [-0.4, 0, -0.1],
  lFore: [-0.3, 0, 0],
  rFore: [-1.3, 0, 0],
  lFoot: [0.85, 0, 0],
  rFoot: [0.85, 0, 0],
  head: [-0.15, 0.25, 0],
})

/** Sitting up on the edge of the bed, feet down. */
export const BED_SIT = makePose({ hipY: 0.5, spine: [0.12, 0, 0], chest: [0.06, 0, 0], head: [0.15, 0, 0] }, P.SIT)

/** One hand up in greeting. */
export const WAVE = makePose(
  {
    rUpper: [-0.3, 0, -1.9],
    rFore: [-0.15, 0, -0.7],
    rHand: [0.1, 0.4, 0],
    head: [0, 0, 0],
    spine: [-0.02, 0, 0],
  },
  P.STAND,
)
/** The greeting hand, stalled in the air. */
export const WAVE_STALL = makePose({ rUpper: [-0.4, 0, -1.6], rFore: [-0.6, 0, -0.3], head: [0.06, 0, 0] }, WAVE)

/** A coffee cup at the chest. */
export const CUP = makePose({ rUpper: [-0.25, 0, -0.18], rFore: [-1.7, 0, 0.15], rHand: [0.3, 0, 0], head: [0.04, 0, 0] }, P.STAND)

/** Watering: the can held forward and low in the right hand, tipped. */
export const WATER = makePose(
  {
    spine: [0.18, 0, 0],
    chest: [0.08, 0, 0],
    head: [0.36, 0, 0],
    rUpper: [-0.75, 0, -0.12],
    rFore: [-0.35, 0, 0],
    rHand: [0.2, 0, 0],
    lUpper: [-0.2, 0, 0.1],
    lFore: [-1.1, 0, 0],
  },
  P.STAND,
)
/** Her laugh: straightening up, the can lifted a little, head back. */
export const LAUGH = makePose({ spine: [-0.04, 0, 0], chest: [-0.06, 0, 0], head: [-0.12, 0, 0], rUpper: [-0.95, 0, -0.14], rFore: [-0.5, 0, 0] }, WATER)

/** Fingertips at both temples, lifting the hair. */
export const TEMPLES = makePose({
  lUpper: [-0.6, 0, 1.2],
  rUpper: [-0.6, 0, -1.2],
  lFore: [-2.2, 0, 0],
  rFore: [-2.2, 0, 0],
  lHand: [0.3, 0, 0],
  rHand: [0.3, 0, 0],
  head: [0.02, 0, 0],
})
/** One fingertip on the scar, head tilted. */
export const TRACE = makePose({ lUpper: [0.03, 0, 0.07], lFore: [-0.12, 0, 0], lHand: [0, 0, 0], head: [0.04, 0.12, 0.1] }, TEMPLES)
/** Straightening the collar with both hands. */
export const COLLAR = makePose({
  lUpper: [-0.28, 0, 0.42],
  rUpper: [-0.28, 0, -0.42],
  lFore: [-2.25, 0.45, 0],
  rFore: [-2.25, -0.45, 0],
  lHand: [0.2, 0, 0],
  rHand: [0.2, 0, 0],
  head: [-0.04, 0, 0],
})

/** Seated at a table with a spoon or fork raised. */
export const SIT_SPOON = makePose({ rUpper: [-0.65, 0, -0.18], rFore: [-1.45, 0, 0], rHand: [0.2, 0, 0], head: [0.2, 0, 0] }, P.SIT_READ)
/** The fork stopped in the air. */
export const SIT_FORK_UP = makePose({ rUpper: [-0.75, 0, -0.2], rFore: [-1.75, 0, 0], head: [0.05, 0, 0], spine: [0.06, 0, 0] }, P.SIT_READ)

/** On the sofa, upright, watching. */
export const SOFA_WATCH = makePose({
  hipY: 0.52,
  lThigh: [-1.45, 0, 0.08],
  rThigh: [-1.45, 0, -0.08],
  lShin: [1.4, 0, 0],
  rShin: [1.4, 0, 0],
  lFoot: [0.1, 0, 0],
  rFoot: [0.1, 0, 0],
  spine: [-0.18, 0, 0],
  chest: [-0.06, 0, 0],
  neck: [0.04, 0, 0],
  head: [0.06, 0, 0],
  lUpper: [-0.35, 0, 0.18],
  rUpper: [-0.35, 0, -0.18],
  lFore: [-1.1, 0, 0],
  rFore: [-1.1, 0, 0],
})

/** Bent over his shoes on the bench. */
export const TIE = makePose({ spine: [0.55, 0, 0], chest: [0.3, 0, 0], neck: [0.2, 0, 0], head: [0.3, 0, 0], lUpper: [-0.9, 0, 0.1], rUpper: [-0.9, 0, -0.1], lFore: [-0.6, 0, 0], rFore: [-0.6, 0, 0] }, P.SIT)

/** Back flat against a door, breathing. */
export const BACK_TO_DOOR = makePose({ spine: [-0.08, 0, 0], chest: [-0.06, 0, 0], head: [-0.16, 0, 0], lUpper: [0.1, 0, 0.2], rUpper: [0.1, 0, -0.2], lFore: [-0.1, 0, 0], rFore: [-0.1, 0, 0] })

/** A hand pressed flat on the chest, shoulders up. */
export const HAND_CHEST = makePose({ spine: [0.1, 0, 0], head: [0.14, 0, 0], rUpper: [-0.4, 0.5, -0.1], rFore: [-2.1, 0, 0], rHand: [0.2, 0, 0] }, BACK_TO_DOOR)

/** Hands up at the ears. */
export const EARS = makePose({ lUpper: [-0.4, 0, 1.0], rUpper: [-0.4, 0, -1.0], lFore: [-2.4, 0, 0], rFore: [-2.4, 0, 0], head: [0.2, 0, 0], spine: [0.15, 0, 0] })

/** Running: torso forward. */
export const RUN = makePose({ spine: [0.22, 0, 0], chest: [0.06, 0, 0], head: [-0.1, 0, 0], lFore: [-1.2, 0, 0], rFore: [-1.2, 0, 0] })

/** Staff at rest: device hand slightly forward. */
export const STAFF = makePose({ rUpper: [-0.3, 0, -0.1], rFore: [-0.9, 0, 0], rHand: [0.2, 0, 0], lUpper: [0.02, 0, 0.08], lFore: [-0.2, 0, 0] }, P.STAND)
/** A hand raised gently, palm out. */
export const STAFF_HAND = makePose({ lUpper: [-1.1, 0, 0.2], lFore: [-0.6, 0, 0], lHand: [-0.4, 0, 0] }, STAFF)
/** Reaching out with the device. */
export const STAFF_REACH = makePose({ spine: [0.12, 0, 0], rUpper: [-1.3, 0, -0.1], rFore: [-0.3, 0, 0], head: [0.1, 0, 0] }, STAFF)

/** Seated with a form on the knee, pen in hand. */
export const SIT_FORM = makePose({ lUpper: [-0.4, 0, 0.12], lFore: [-1.1, 0.3, 0], rUpper: [-0.5, 0, -0.1], rFore: [-1.2, -0.3, 0], head: [0.25, 0, 0] }, P.SIT)

/** Veyl at the desk, leaning back, hands folded. */
export const SIT_LEAN_BACK = makePose({ spine: [-0.22, 0, 0], chest: [-0.06, 0, 0], head: [-0.08, 0, 0], lUpper: [-0.25, 0, 0.12], rUpper: [-0.25, 0, -0.12], lFore: [-1.2, 0.5, 0], rFore: [-1.2, -0.5, 0] }, P.SIT)
/** At the desk: one hand above the keys. */
export const SIT_HOVER = makePose({ rUpper: [-0.6, 0, -0.14], rFore: [-1.3, -0.2, 0], rHand: [0.5, 0, 0] }, P.SIT_TYPE)
/** Writing in the notebook. */
export const SIT_WRITE = makePose({ spine: [0.22, 0, 0], neck: [0.15, 0, 0], head: [0.35, 0, 0] }, P.SIT_READ)

/** Pointing at a screen with the right hand. */
export const POINT = makePose({ rUpper: [-1.35, 0, -0.35], rFore: [-0.15, 0, 0], rHand: [0.1, 0, 0], head: [0, 0, 0] }, P.STAND)
/** Rubbing the eyes. */
export const RUB_EYES = makePose({ rUpper: [-0.9, 0.3, -0.1], rFore: [-2.3, 0, 0], rHand: [0.3, 0, 0], head: [0.3, 0, 0], neck: [0.12, 0, 0] }, P.STAND)
/** Leaning in to whisper. */
export const WHISPER = makePose({ spine: [0.2, 0, 0], chest: [0.1, 0, 0], neck: [0.05, 0, 0], head: [0.05, 0.4, 0.1] }, P.STAND)
/** The head bowed to the floor, hands loose. */
export const LOOK_DOWN = makePose({ neck: [0.3, 0, 0], head: [0.42, 0, 0], spine: [0.08, 0, 0] }, P.STAND)

/** The technician, bent toward the head with the rod. */
export const TECH = makePose({ spine: [0.3, 0, 0], chest: [0.12, 0, 0], head: [0.2, 0, 0], rUpper: [-1.2, 0, -0.1], rFore: [-0.6, 0, 0], lUpper: [-1.0, 0, 0.15], lFore: [-0.8, 0, 0] }, P.STAND)

/** A child riding a bike: seated high, hands forward. */
export const RIDE = makePose({
  hipY: 0.62,
  spine: [0.25, 0, 0],
  head: [-0.1, 0, 0],
  lUpper: [-1.1, 0, 0.1],
  rUpper: [-1.1, 0, -0.1],
  lFore: [-0.3, 0, 0],
  rFore: [-0.3, 0, 0],
  lThigh: [-1.1, 0, 0.06],
  rThigh: [-0.7, 0, -0.06],
  lShin: [1.2, 0, 0],
  rShin: [0.9, 0, 0],
})

/** A sleeping child across a lap (the scene lays the root down). */
export const CURLED = makePose({
  hipY: 0.1,
  hips: [-1.57, 0, 0],
  lThigh: [-1.2, 0, 0.1],
  rThigh: [-1.0, 0, -0.1],
  lShin: [1.6, 0, 0],
  rShin: [1.5, 0, 0],
  lUpper: [-0.8, 0, 0.3],
  rUpper: [-0.6, 0, -0.2],
  lFore: [-1.4, 0, 0],
  rFore: [-1.2, 0, 0],
  head: [0.1, 0.5, 0],
})

/** The mother, seated, her hand on the boy's hair. */
export const SIT_STROKE = makePose({ rUpper: [-0.6, 0, -0.3], rFore: [-0.9, 0, 0], head: [0.4, 0, 0], neck: [0.15, 0, 0] }, P.SIT)

export type PoseKey = readonly [number, Pose]
