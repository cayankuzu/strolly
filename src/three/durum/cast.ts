/**
 * The cast of DURUM on the shared figure rig: Arif (43, tired shoulders,
 * slate-blue knit, thin black glasses) and Selin (38, olive work jacket,
 * jeans, always a tulip glass of tea). Story-local poses for the beats the
 * shared vocabulary does not have.
 */
import * as THREE from 'three'
import { makePose, type FigureLook } from '../figure/Figure'
import * as P from '../figure/poses'
import { std } from '../kit/props'

export function castPalette() {
  return {
    skinA: std(0xc49a80, 0.55),
    skinAHead: std(0xc49a80, 0.52, { vertexColors: true }),
    skinS: std(0xd3aa90, 0.55),
    skinSHead: std(0xd3aa90, 0.52, { vertexColors: true }),
    eye: std(0x1a120c, 0.15),
    hairA: std(0x2f2a26, 0.7),
    hairS: std(0x3b2a20, 0.72),
    sweater: std(0x4f5a66, 0.95),
    shirt: std(0xc9ced4, 0.8),
    trousersA: std(0x2a2e35, 0.9),
    jacketS: std(0x3e4a3d, 0.9),
    jeans: std(0x2b3546, 0.9),
    shoe: std(0x1c1a18, 0.7),
    sole: std(0x0e0e0e, 0.8),
    glassesFrame: std(0x111111, 0.4),
    lens: new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, roughness: 0.25, transparent: true, opacity: 0.04, depthWrite: false, envMapIntensity: 0.15, specularIntensity: 0.3 }),
  }
}
export type CastPal = ReturnType<typeof castPalette>

export function arifLook(m: CastPal): FigureLook {
  return {
    name: 'Arif',
    build: 'm',
    face: { jaw: 0.3, nose: 0.21, lips: 0.045, stubble: 0.34 },
    hairStyle: 'short',
    skin: m.skinA,
    skinHead: m.skinAHead,
    eye: m.eye,
    hair: m.hairA,
    top: m.sweater,
    bottom: m.trousersA,
    shoes: m.shoe,
    sole: m.sole,
    cuff: m.shirt,
    collar: 'crew',
    topSurface: 'knit',
    belt: true,
    glasses: { frame: m.glassesFrame, lens: m.lens },
  }
}

export function selinLook(m: CastPal): FigureLook {
  return {
    name: 'Selin',
    build: 'f',
    face: { jaw: 0.16, nose: 0.14, lips: 0.07, stubble: 0 },
    hairStyle: 'long',
    skin: m.skinS,
    skinHead: m.skinSHead,
    eye: m.eye,
    hair: m.hairS,
    top: m.jacketS,
    bottom: m.jeans,
    shoes: m.shoe,
    sole: m.sole,
    cuff: m.jacketS,
    collar: 'mock',
    topSurface: 'fabric',
    bottomSurface: 'denim',
    height: 0.96,
  }
}

/** Astride the reversed chair: legs either side, forearms folded on the backrest. */
export const SIT_ASTRIDE = makePose(
  {
    hipY: 0.6,
    lThigh: [-1.4, 0, 0.42],
    rThigh: [-1.4, 0, -0.42],
    lShin: [1.55, 0, -0.1],
    rShin: [1.55, 0, 0.1],
    lFoot: [0.1, 0, 0],
    rFoot: [0.1, 0, 0],
    spine: [0.12, 0, 0],
    chest: [0.06, 0, 0],
    neck: [0.04, 0, 0],
    head: [0.06, 0, 0],
    lUpper: [-1.1, -0.45, 0.2],
    rUpper: [-1.1, 0.45, -0.2],
    lFore: [-1.6, 0, 0],
    rFore: [-1.6, 0, 0],
  },
  P.SIT,
)

/** Leaning in, elbows on the desk, hands loosely together under the chin. */
export const SIT_ELBOWS = makePose(
  {
    spine: [0.3, 0, 0],
    chest: [0.14, 0, 0],
    neck: [-0.02, 0, 0],
    head: [-0.08, 0, 0],
    lUpper: [-0.85, -0.3, 0.22],
    rUpper: [-0.85, 0.3, -0.22],
    lFore: [-1.9, 0, 0],
    rFore: [-1.9, 0, 0],
    lHand: [0.2, 0, 0],
    rHand: [0.2, 0, 0],
  },
  P.SIT,
)

/** Head back, shoulders up: the laugh. */
export const SIT_LAUGH = makePose(
  {
    spine: [-0.16, 0, 0],
    chest: [-0.1, 0, 0],
    neck: [-0.18, 0, 0],
    head: [-0.32, 0, 0],
    lUpper: [-0.3, 0, 0.16],
    rUpper: [-0.3, 0, -0.16],
    lFore: [-1.2, 0, 0],
    rFore: [-1.2, 0, 0],
  },
  P.SIT,
)

/** Standing, head thrown back a little (a laugh on his feet). */
export const STAND_LAUGH = makePose({ spine: [-0.1, 0, 0], neck: [-0.15, 0, 0], head: [-0.28, 0, 0], lUpper: [0.05, 0, 0.1], rUpper: [0.05, 0, -0.1] }, P.STAND)

/** Leaning back, rubbing his eyes. */
export const SIT_RUB = makePose(
  {
    spine: [-0.2, 0, 0],
    chest: [-0.06, 0, 0],
    neck: [0.0, 0, 0],
    head: [0.12, 0, 0],
    lUpper: [-1.1, 0.4, 0.4],
    rUpper: [-1.1, -0.4, -0.4],
    lFore: [-2.2, 0, 0],
    rFore: [-2.2, 0, 0],
  },
  P.SIT,
)

/** Standing at the counter, both hands busy in front. */
export const STAND_WORK = makePose({ spine: [0.12, 0, 0], chest: [0.05, 0, 0], head: [0.3, 0, 0], lUpper: [-0.5, 0, 0.12], rUpper: [-0.5, 0, -0.12], lFore: [-1.1, 0, 0], rFore: [-1.1, 0, 0] }, P.STAND)

/** Crouched low (sweeping up the shards). */
export const CROUCH = makePose({
  hipY: 0.48,
  spine: [0.55, 0, 0],
  chest: [0.25, 0, 0],
  head: [0.35, 0, 0],
  lThigh: [-1.75, 0, 0.12],
  rThigh: [-1.55, 0, -0.12],
  lShin: [2.1, 0, 0],
  rShin: [2.05, 0, 0],
  lFoot: [-0.4, 0, 0],
  rFoot: [-0.45, 0, 0],
  lUpper: [-0.9, 0, 0.15],
  rUpper: [-1.2, 0, -0.1],
  lFore: [-0.4, 0, 0],
  rFore: [-0.25, 0, 0],
})

/** Carrying two boxes stacked, forearms level under them. */
export const CARRY_BOX = makePose({ spine: [-0.06, 0, 0], head: [0.1, 0, 0], lUpper: [-0.55, 0, 0.32], rUpper: [-0.55, 0, -0.32], lFore: [-1.05, -0.35, 0], rFore: [-1.05, 0.35, 0], lHand: [0, 0, 0.5], rHand: [0, 0, -0.5] }, P.STAND)

/** Holding a tablet in front, looking at it. */
export const TABLET = makePose({ neck: [0.15, 0, 0], head: [0.3, 0, 0], lUpper: [-0.35, 0, 0.2], rUpper: [-0.35, 0, -0.2], lFore: [-1.4, 0.2, 0], rFore: [-1.4, -0.2, 0] }, P.STAND)

/** Seated, a phone in both hands, looking down at it. */
export const SIT_PHONE = makePose({ neck: [0.2, 0, 0], head: [0.38, 0, 0], lUpper: [-0.4, 0, 0.2], rUpper: [-0.4, 0, -0.2], lFore: [-1.55, 0.25, 0], rFore: [-1.55, -0.25, 0], lHand: [0.3, 0, 0], rHand: [0.3, 0, 0] }, P.SIT)

/** Seated upright, alert, looking up (the screens flip). */
export const SIT_ALERT = makePose({ spine: [-0.02, 0, 0], chest: [-0.04, 0, 0], neck: [-0.06, 0, 0], head: [-0.12, 0, 0] }, P.SIT_STRAIGHT)

/** Slumped back, looking through the glass. */
export const SIT_SLOUCH = makePose({ hipZ: 0.08, spine: [-0.3, 0, 0], chest: [-0.1, 0, 0], neck: [0.1, 0, 0], head: [0.1, 0, 0], lUpper: [-0.15, 0, 0.12], rUpper: [-0.15, 0, -0.12], lFore: [-0.9, 0.3, 0], rFore: [-0.9, -0.3, 0] }, P.SIT)

export { P }
