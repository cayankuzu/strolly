/**
 * Arif, about forty-five: short dark hair greying at the temples, light
 * stubble, thin round glasses. Before the right door: a worn dark-olive
 * cardigan, dark trousers, grey socks. After: a clean off-white shirt,
 * charcoal trousers, hair damp and combed back. A third copy is a ghost (the
 * remembered catch in `thousands`).
 *
 * And the poses this story needs beyond the shared ones.
 */
import * as THREE from 'three'
import { Figure, makePose, type FigureLook } from '../figure/Figure'
import * as P from '../figure/poses'
import { pbr } from '../kit/surfaces'

const std = (color: number, roughness: number, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra })

export function arifLooks() {
  const skin = std(0xc39a7e, 0.55)
  const skinHead = std(0xc39a7e, 0.52, { vertexColors: true })
  const eye = std(0x2b1d14, 0.2)
  const socks = std(0x5e5d5a, 0.95)
  const frame = std(0x22201e, 0.35, { metalness: 0.6 })
  const lens = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.12, depthWrite: false })
  const face = { jaw: 0.4, nose: 0.28, lips: 0.04, stubble: 0.38 }
  const base = { build: 'm' as const, face, hairStyle: 'short' as const, skin, skinHead, eye, shoes: socks, sole: socks, glasses: { frame, lens }, height: 1.0 }
  const cardigan: FigureLook = {
    ...base,
    name: 'arif',
    hair: std(0x3b3530, 0.7),
    top: std(0x4b4a34, 0.95),
    cuff: std(0x4b4a34, 0.95),
    bottom: std(0x29292c, 0.9),
    collar: 'crew',
    topSurface: 'knit',
  }
  const shirt: FigureLook = {
    ...base,
    name: 'arif-shirt',
    hair: std(0x221d1a, 0.32),
    top: std(0xe6e1d6, 0.8),
    cuff: std(0xe6e1d6, 0.8),
    bottom: std(0x323336, 0.85),
    collar: 'mock',
    topSurface: 'fabric',
    belt: true,
  }
  const g = () => new THREE.MeshStandardMaterial({ color: 0xe8eef2, roughness: 0.6, transparent: true, opacity: 0.2, depthWrite: false, emissive: new THREE.Color(0x30363a) })
  const gm = g()
  const gh = g()
  gh.vertexColors = true
  const ghost: FigureLook = { ...shirt, name: 'arif-ghost', skin: gm, skinHead: gh, hair: gm, top: gm, cuff: gm, bottom: gm, shoes: gm, sole: gm, eye: gm, glasses: undefined }
  return { cardigan, shirt, ghost, ghostMats: [gm, gh] }
}

/** Closes (1) or opens (0) the figure's eyes after `apply` (the rig blinks on its own otherwise). */
export function setEyes(f: Figure, closed: number) {
  const lids = (f as unknown as { lids: THREE.Mesh[] }).lids
  if (closed <= 0.001) return
  for (const lid of lids) lid.rotation.x = Math.max(lid.rotation.x, (lid.userData.open as number) + closed * 0.78)
}

/** Glasses askew on the nose (1) or straight (0). */
export function setGlasses(f: Figure, askew: number) {
  f.glasses.rotation.set(0.05 * askew, 0.12 * askew, -0.28 * askew)
  f.glasses.position.set(0.006 * askew, 0.123 - 0.012 * askew, 0.108 + 0.004 * askew)
}

// ——— Poses ———

/** Asleep at the desk: folded forward, the head on the glass (left cheek down), arms hanging straight. */
export const ASLEEP = makePose(
  {
    hipZ: -0.02,
    spine: [0.6, 0.0, 0.0],
    chest: [0.42, 0.0, 0.06],
    neck: [0.18, 0.3, 0.2],
    head: [0.1, 0.62, 0.5],
    // The chest is folded ~1.06 rad forward: −1.06 brings the arms back to plumb; they splay
    // out past the thighs and the seat's front edge and dangle beside the chair, in front of its arms.
    lUpper: [-1.02, 0.0, 0.3],
    rUpper: [-1.02, 0.0, -0.3],
    lFore: [-0.14, 0, 0],
    rFore: [-0.14, 0, 0],
    lHand: [0.08, 0, 0.05],
    rHand: [0.08, 0, -0.05],
  },
  P.SIT,
)

/** The same, the head a little lifted (waking under it). */
export const ASLEEP_LIFT = makePose({ spine: [0.56, 0, 0], chest: [0.4, 0, 0.04], neck: [0.12, 0.25, 0.14], head: [0.06, 0.5, 0.38] }, ASLEEP)

/**
 * Forearms resting on the glass: the elbows come forward to the desk's edge so
 * the hands lie on the surface (the shared seated poses put them through it).
 * `lean` is how far the chest is pitched forward, so the arms keep their place.
 */
const deskArms = (lean: number, fore = -0.46) =>
  ({
    lUpper: [-0.9 - lean, 0, 0.14],
    rUpper: [-0.9 - lean, 0, -0.14],
    lFore: [fore, 0.25, 0],
    rFore: [fore, -0.25, 0],
    lHand: [0.14, 0, 0],
    rHand: [0.14, 0, 0],
  }) as const

/** Sitting up, slack, forearms on the desk. */
export const SIT_UP = makePose(
  {
    spine: [0.06, 0, 0],
    chest: [0.04, 0, 0],
    neck: [0.04, 0, 0],
    head: [0.06, 0, 0],
    ...deskArms(0.1),
  },
  P.SIT,
)

/** Sitting straight (the screens waking), forearms on the desk. */
export const SIT_TALL = makePose({ spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], ...deskArms(0) }, P.SIT)

/** Still, the head lowered, forearms on the desk (after the word). */
export const SIT_QUIET = makePose({ spine: [0.1, 0, 0], chest: [0.08, 0, 0], neck: [0.16, 0, 0], head: [0.36, 0, 0], ...deskArms(0.18) }, P.SIT)

/** Both hands to the face. */
export const RUB = makePose(
  {
    spine: [0.2, 0, 0],
    chest: [0.12, 0, 0],
    neck: [0.14, 0, 0],
    head: [0.26, 0, 0],
    lUpper: [-0.85, -0.25, 0.32],
    rUpper: [-0.85, 0.25, -0.32],
    lFore: [-2.1, 0, 0],
    rFore: [-2.1, 0, 0],
    lHand: [0.2, 0, 0],
    rHand: [0.2, 0, 0],
  },
  P.SIT,
)

/** Bending to the side to reach under the seat. */
export const BEND_SEAT = makePose(
  {
    spine: [0.5, 0, -0.18],
    chest: [0.3, 0, -0.1],
    neck: [0.2, 0, 0],
    head: [0.25, -0.2, 0],
    lUpper: [-0.4, 0, 0.15],
    lFore: [-0.8, 0, 0],
    rUpper: [0.1, 0, -0.2],
    rFore: [-0.3, 0, 0],
  },
  P.SIT,
)

/** Leaning over the desk (wiping, checking a screen), forearms on the glass. */
export const LEAN_DESK = makePose(
  {
    spine: [0.32, 0, 0],
    chest: [0.18, 0, 0],
    neck: [0.08, 0, 0],
    head: [0.22, 0, 0],
    ...deskArms(0.42, -0.36),
  },
  P.SIT,
)

/** Seated, the throwing arm cocked back and up beside the head. */
export const THROW_COCK = makePose(
  {
    spine: [0.0, -0.25, 0],
    chest: [-0.06, -0.2, 0],
    head: [0.04, 0.42, 0],
    lUpper: [-0.86, 0, 0.14],
    lFore: [-0.46, 0.25, 0],
    lHand: [0.14, 0, 0],
    rUpper: [-2.3, 0, -0.45],
    rFore: [-1.35, 0, 0],
    rHand: [0.3, 0, 0],
  },
  P.SIT,
)

/** The release: the arm extended forward-up toward the corner, the eyes still ahead. */
export const THROW_RELEASE = makePose(
  {
    spine: [0.06, 0.15, 0],
    chest: [0.04, 0.2, 0],
    head: [0.06, -0.3, 0],
    lUpper: [-1.0, 0, 0.14],
    lFore: [-0.46, 0.25, 0],
    lHand: [0.14, 0, 0],
    rUpper: [-1.75, 0.0, -0.75],
    rFore: [-0.2, 0, 0],
    rHand: [-0.2, 0, 0],
  },
  P.SIT,
)

/** Seated, the right hand out into the empty air to his right, palm up. */
export const HAND_OUT = makePose(
  {
    spine: [0.04, 0, 0],
    head: [0.04, 0, 0],
    lUpper: [-0.94, 0, 0.14],
    lFore: [-0.46, 0.25, 0],
    lHand: [0.14, 0, 0],
    rUpper: [-0.55, 0, -0.75],
    rFore: [-0.6, 1.2, 0],
    rHand: [0, 0, 0],
  },
  P.SIT,
)

/** The cup at his lips. */
export const SIP = makePose(
  {
    spine: [0.02, 0, 0],
    neck: [-0.06, 0, 0],
    head: [-0.1, 0, 0],
    lUpper: [-0.94, 0, 0.14],
    lFore: [-0.46, 0.25, 0],
    lHand: [0.14, 0, 0],
    rUpper: [-0.55, 0.35, -0.3],
    rFore: [-2.0, 0, 0],
  },
  P.SIT,
)

/** Leaning back slowly in the chair, the hands sliding back into his lap. */
export const SIT_BACK_SLOW = makePose(
  {
    spine: [-0.1, 0, 0],
    chest: [-0.06, 0, 0],
    head: [0.1, 0, 0],
    lUpper: [-0.19, 0, 0.16],
    rUpper: [-0.19, 0, -0.16],
    lFore: [-0.72, 0.3, 0],
    rFore: [-0.72, -0.3, 0],
    lHand: [0.2, 0, 0],
    rHand: [0.2, 0, 0],
  },
  P.SIT_BACK,
)

/** On the threshold, the head lowered: listening. */
export const LISTENING = makePose({ neck: [0.22, 0, 0.05], head: [0.28, 0.05, 0.08], lUpper: [0.04, 0, 0.06], rUpper: [-0.1, 0, -0.08], rFore: [-0.3, 0, 0] }, P.STAND)

/** Standing, the weight shifted onto one leg. */
export const STAND_SHIFT = makePose({ hips: [0, -0.04, -0.03], spine: [0, 0.03, 0.03], lThigh: [0.06, 0, 0.05], lShin: [0.12, 0, 0], rThigh: [0, 0, 0.02] }, P.STAND)

export function makeArif(look: FigureLook) {
  const f = new Figure(look)
  f.root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) m.receiveShadow = true
  })
  return f
}

export { pbr }
