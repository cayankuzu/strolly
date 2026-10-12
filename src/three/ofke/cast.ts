/**
 * ÖFKE's people: Arif in three outfits (shirt and tie, the evening jacket, the
 * service's overalls), the boss and his two copies, the office, the staff of
 * ÖFKE NÖBETİ, the orderlies and cleaners, the guards, 333 and 334.
 *
 * Everyone is the shared figure rig; what makes them themselves is attached
 * here: shirt collars and a tie, a bald crown and a beard, a hood, a numbered
 * neck band, cuffs and shackles, masks, caps, gloves, a bun.
 */
import * as THREE from 'three'
import { Figure, makePose, type FigureLook } from '../figure/Figure'
import { headPoint, type FaceShape } from '../figure/figureBody'
import * as P from '../figure/poses'
import { rbox, std } from '../kit/props'
import { pbr, skinMaterial } from '../kit/surfaces'
import { cyl, mesh } from '../util'
import { mono } from '../screens'

const PI = Math.PI

// ——— Poses (local to this story) ———

/** Seated very straight, both hands flat on the desk. Rehearsing. */
export const SIT_FLAT = makePose({ spine: [0.04, 0, 0], chest: [0.02, 0, 0], neck: [0, 0, 0], head: [0.02, 0, 0], lUpper: [-0.62, 0, 0.18], rUpper: [-0.62, 0, -0.18], lFore: [-0.95, 0.1, 0], rFore: [-0.95, -0.1, 0], lHand: [0.5, 0, 0], rHand: [0.5, 0, 0] }, P.SIT)
/** A deep breath: chest up, shoulders back. */
export const BREATHE_IN = makePose({ spine: [-0.06, 0, 0], chest: [-0.1, 0, 0], neck: [-0.04, 0, 0], head: [-0.06, 0, 0], lUpper: [0.08, 0, 0.12], rUpper: [0.08, 0, -0.12] }, P.STAND)
/** Shoulders dropped after the breath. */
export const BREATHE_OUT = makePose({ spine: [0.08, 0, 0], chest: [0.06, 0, 0], head: [0.1, 0, 0], lUpper: [0.06, 0, 0.05], rUpper: [0.06, 0, -0.05], lFore: [-0.08, 0, 0], rFore: [-0.08, 0, 0] }, P.STAND)
/** Hands clasped low in front, head a little bowed. */
export const CLASPED = makePose({ spine: [0.06, 0, 0], chest: [0.04, 0, 0], neck: [0.1, 0, 0], head: [0.16, 0, 0], lUpper: [-0.2, 0, 0.18], rUpper: [-0.2, 0, -0.18], lFore: [-1.05, 0.5, 0], rFore: [-1.05, -0.5, 0] }, P.STAND)
/** One hand open in appeal, a half step forward. */
export const APPEAL = makePose({ hipZ: 0.02, spine: [0.1, 0, 0], chest: [0.04, 0.05, 0], head: [0.04, 0, 0], rUpper: [-0.75, 0, -0.18], rFore: [-0.9, 0.4, 0], rHand: [-0.3, 0, -0.4], lUpper: [-0.15, 0, 0.12], lFore: [-0.5, 0, 0] }, P.STAND)
/** Mouth opening, a hand half raised: about to speak. */
export const BUT = makePose({ spine: [0.05, 0, 0], head: [0.0, 0, 0], rUpper: [-0.55, 0, -0.2], rFore: [-1.2, 0.3, 0], rHand: [-0.3, 0, 0], lUpper: [0.02, 0, 0.08], lFore: [-0.2, 0, 0] }, P.STAND)
/** A nod, chin down. */
export const NOD = makePose({ neck: [0.2, 0, 0], head: [0.28, 0, 0] }, P.STAND)
/** Reclined in the chair, feet on the desk (soles toward the door), phone at the chest. */
export const FEET_UP = makePose({
  // Slid forward on the seat; thighs up over the desk's edge, calves resting on the top.
  hipY: 0.58,
  hipZ: 0.1,
  spine: [-0.5, 0, 0],
  chest: [-0.06, 0, 0],
  neck: [0.36, 0, 0],
  head: [0.4, 0, 0],
  lThigh: [-2.3, 0, 0.06],
  rThigh: [-2.28, 0, -0.02],
  lShin: [0.79, 0, 0],
  rShin: [0.77, 0, 0],
  lFoot: [0.18, 0, 0],
  rFoot: [0.12, 0, 0],
  lUpper: [-0.35, 0, 0.3],
  rUpper: [-0.5, 0, -0.25],
  lFore: [-1.2, 0, 0],
  rFore: [-1.7, -0.3, 0],
})
/** The laugh: head thrown back. */
export const FEET_UP_LAUGH = makePose({ spine: [-0.55, 0, 0], neck: [-0.25, 0, 0], head: [-0.35, 0, 0], lUpper: [-0.15, 0, 0.45], lFore: [-0.9, 0, 0] }, FEET_UP)
/** Pointing the phone (right hand) forward. */
export const FEET_UP_POINT = makePose({ neck: [0.15, 0, 0], head: [0.1, 0, 0], rUpper: [-1.25, 0.1, -0.2], rFore: [-0.35, 0, 0] }, FEET_UP)
/** Standing copy, scrolling a phone held low in the right hand. */
export const STAND_PHONE = makePose({ neck: [0.24, 0, 0], head: [0.38, 0, 0], rUpper: [-0.3, 0, -0.15], rFore: [-1.45, -0.25, 0], lUpper: [0.03, 0, 0.12], lFore: [-0.3, 0, 0], hips: [0, -0.06, 0] }, P.STAND)
/** Hauled up by the collar: off balance, head back, arms loose. */
export const HAULED = makePose({ hipZ: 0.04, spine: [-0.18, 0, 0], chest: [-0.1, 0, 0], neck: [-0.15, 0, 0], head: [-0.2, 0.1, 0], lUpper: [-0.3, 0, 0.35], rUpper: [-0.4, 0, -0.35], lFore: [-0.7, 0, 0], rFore: [-0.5, 0, 0], lThigh: [0.05, 0, 0.05], rThigh: [-0.15, 0, -0.08], rShin: [0.25, 0, 0] })
/** Lunging forward over the desk. */
export const LUNGE = makePose({ hipZ: 0.05, spine: [0.5, 0, 0], chest: [0.25, 0, 0], neck: [-0.2, 0, 0], head: [-0.25, 0, 0], lUpper: [-1.5, 0, 0.15], rUpper: [-1.5, 0, -0.15], lFore: [-0.3, 0, 0], rFore: [-0.3, 0, 0], lThigh: [-0.5, 0, 0.05], lShin: [0.6, 0, 0], rThigh: [0.3, 0, -0.05], rShin: [0.2, 0, 0] })
/** Gripping a collar at chest height, screaming into a face. */
export const GRIP = makePose({ hipZ: 0.02, spine: [0.12, 0, 0], chest: [0.06, 0, 0], neck: [-0.08, 0, 0], head: [-0.12, 0, 0], lUpper: [-1.0, 0, 0.25], rUpper: [-1.0, 0, -0.25], lFore: [-1.2, 0, 0], rFore: [-1.2, 0, 0], lThigh: [-0.25, 0, 0.06], lShin: [0.3, 0, 0], rThigh: [0.15, 0, -0.06] })
/** The swing cocked back (right arm). */
export const COCK = makePose({ hipZ: 0.02, hips: [0, 0.35, 0], spine: [0.08, 0.25, 0], chest: [0.02, 0.3, 0], head: [-0.05, -0.5, 0], rUpper: [-0.6, 0.3, -1.1], rFore: [-1.9, 0, 0], rHand: [0.2, 0, 0], lUpper: [-1.1, 0, 0.3], lFore: [-0.9, 0, 0], lThigh: [-0.3, 0, 0.1], lShin: [0.35, 0, 0], rThigh: [0.25, 0, -0.08] })
/** The swing landing (never shown landing on anyone). */
export const SWING = makePose({ hipZ: 0.03, hips: [0, -0.3, 0], spine: [0.22, -0.3, 0], chest: [0.1, -0.35, 0], head: [0.05, 0.4, 0], rUpper: [-1.45, -0.2, -0.15], rFore: [-0.25, 0, 0], lUpper: [-0.4, 0, 0.35], lFore: [-1.3, 0, 0], lThigh: [-0.35, 0, 0.1], lShin: [0.4, 0, 0], rThigh: [0.3, 0, -0.08], rShin: [0.15, 0, 0] })
/** Heaving after: hands hanging, shoulders up and down. */
export const HEAVE = makePose({ spine: [0.3, 0, 0], chest: [0.16, 0, 0], neck: [0.12, 0, 0], head: [0.25, 0, 0], lUpper: [0.02, 0, 0.12], rUpper: [0.02, 0, -0.12], lFore: [-0.25, 0, 0], rFore: [-0.25, 0, 0], lThigh: [-0.12, 0, 0.08], rThigh: [-0.12, 0, -0.08], lShin: [0.2, 0, 0], rShin: [0.2, 0, 0], hipY: 0.96 })
/** Bench: elbows on knees, head down, eyes closed. */
export const SIT_ELBOWS = makePose({ spine: [0.42, 0, 0], chest: [0.24, 0, 0], neck: [0.12, 0, 0], head: [0.2, 0, 0], lUpper: [-0.55, 0, 0.25], rUpper: [-0.55, 0, -0.25], lFore: [-1.6, 0.4, 0], rFore: [-1.6, -0.4, 0] }, P.SIT)
/** Bench: sitting back, a towel at the face. */
export const SIT_DRY = makePose({ spine: [0.08, 0, 0], neck: [0.1, 0, 0], head: [0.15, 0, 0], lUpper: [-0.9, 0, 0.3], rUpper: [-0.9, 0, -0.3], lFore: [-1.9, 0, 0], rFore: [-1.9, 0, 0] }, P.SIT)
/** Driving: seated, hands up on the wheel. */
export const DRIVE = makePose({ hipY: 0.555, hipZ: 0.02, spine: [-0.3, 0, 0], chest: [-0.02, 0, 0], neck: [0.22, 0, 0], head: [0.14, 0, 0], lThigh: [-1.3, 0, 0.1], rThigh: [-1.25, 0, -0.08], lShin: [1.0, 0, 0], rShin: [0.9, 0, 0], lUpper: [-0.9, 0, 0.2], rUpper: [-0.9, 0, -0.2], lFore: [-0.8, 0, 0], rFore: [-0.8, 0, 0] })
/** Seated in the prep chair, reclined a little, hands on the armrests. */
export const RECLINE = makePose({ hipY: 0.52, spine: [-0.3, 0, 0], chest: [-0.04, 0, 0], neck: [0.2, 0, 0], head: [0.15, 0, 0], lThigh: [-1.35, 0, 0.08], rThigh: [-1.35, 0, -0.08], lShin: [1.1, 0, 0], rShin: [1.1, 0, 0], lUpper: [-0.3, 0, 0.2], rUpper: [-0.3, 0, -0.2], lFore: [-0.9, 0, 0], rFore: [-0.9, 0, 0] })
/** Running down stairs: leaning in, arms out. */
export const RUN = makePose({ spine: [0.22, 0, 0], chest: [0.1, 0, 0], head: [0.2, 0, 0], lUpper: [-0.2, 0, 0.35], rUpper: [-0.4, 0, -0.45], lFore: [-0.8, 0, 0], rFore: [-0.6, 0, 0] })
/** A leap: knees up, arms out for balance. */
export const LEAP = makePose({ hipY: 0.9, spine: [0.3, 0, 0], chest: [0.1, 0, 0], head: [0.3, 0, 0], lThigh: [-0.9, 0, 0.1], lShin: [1.2, 0, 0], rThigh: [-0.2, 0, -0.1], rShin: [0.9, 0, 0], lUpper: [-0.6, 0, 0.6], rUpper: [-0.3, 0, -0.7], lFore: [-0.6, 0, 0], rFore: [-0.5, 0, 0] })
/** Pulling on a jacket: arms back. */
export const JACKET_ON = makePose({ spine: [0.04, 0, 0], chest: [-0.08, 0, 0], lUpper: [0.5, 0, 0.5], rUpper: [0.5, 0, -0.5], lFore: [-0.8, 0, 0], rFore: [-0.8, 0, 0], head: [0.15, 0, 0] })
/** Hands at the throat: a tie, buttons, a zip. */
export const AT_THROAT = makePose({ neck: [0.18, 0, 0], head: [0.25, 0, 0], lUpper: [-0.5, 0, 0.35], rUpper: [-0.5, 0, -0.35], lFore: [-2.0, 0.6, 0], rFore: [-2.0, -0.6, 0] }, P.STAND)
/** Hands cuffed in front, head bowed (the convict standing). */
export const CUFFED = makePose({ spine: [0.08, 0, 0], chest: [0.06, 0, 0], neck: [0.15, 0, 0], head: [0.2, 0, 0], lUpper: [-0.15, 0.45, 0.12], rUpper: [-0.15, -0.45, -0.12], lFore: [-0.85, 0.3, 0], rFore: [-0.85, -0.3, 0], lHand: [0.1, 0, 0.2], rHand: [0.1, 0, -0.2] }, P.STAND)
/** Cuffed and flinching: shoulders up, head pulled in. */
export const FLINCH = makePose({ spine: [0.2, 0, 0], chest: [0.14, 0, 0], neck: [0.25, 0, 0], head: [0.25, 0, 0.08], lUpper: [-0.3, 0.5, 0.2], rUpper: [-0.3, -0.5, -0.2] }, CUFFED)
/** Sagging: knees bending, head dropped. */
export const SAG = makePose({ hipY: 0.88, spine: [0.32, 0, 0], chest: [0.2, 0, 0], neck: [0.35, 0, 0], head: [0.4, 0, 0.1], lThigh: [-0.35, 0, 0.05], rThigh: [-0.3, 0, -0.05], lShin: [0.6, 0, 0], rShin: [0.55, 0, 0] }, CUFFED)
/** Lying on his side (the scene turns the root), knees a little drawn up, cuffed hands in front. */
export const SIDE = makePose({ hipY: 0.0, spine: [0.15, 0, 0], chest: [0.1, 0, 0], neck: [0.1, 0, 0], head: [0.15, 0, 0.2], lThigh: [-0.55, 0, 0.05], rThigh: [-0.4, 0, -0.05], lShin: [0.8, 0, 0], rShin: [0.7, 0, 0], lUpper: [-0.6, 0.4, 0.1], rUpper: [-0.6, -0.4, -0.1], lFore: [-0.9, 0.2, 0], rFore: [-0.9, -0.2, 0] })
/** Bent over, pulling something heavy behind (walking backward). */
export const HAUL = makePose({ hipY: 0.9, spine: [0.45, 0, 0], chest: [0.2, 0, 0], head: [0.1, 0, 0], lThigh: [-0.45, 0, 0.1], rThigh: [-0.3, 0, -0.1], lShin: [0.55, 0, 0], rShin: [0.45, 0, 0], lUpper: [-0.9, 0, 0.15], rUpper: [-0.9, 0, -0.15], lFore: [-0.3, 0, 0], rFore: [-0.3, 0, 0] })
/** Holding a mop handle in both hands, leaning into it. */
export const MOP = makePose({ spine: [0.25, 0, 0], chest: [0.1, 0.1, 0], head: [0.3, 0, 0], lUpper: [-0.6, 0, 0.25], rUpper: [-0.4, 0, -0.2], lFore: [-1.1, 0, 0], rFore: [-0.9, 0, 0], lThigh: [-0.2, 0, 0.08], lShin: [0.25, 0, 0] })
/** Hands clasped in front at the waist, a hotel smile. */
export const HOST = makePose({ spine: [0.02, 0, 0], neck: [0.04, 0, 0], head: [0.06, 0, 0.05], lUpper: [-0.25, 0.3, 0.15], rUpper: [-0.25, -0.3, -0.15], lFore: [-1.25, 0.6, 0], rFore: [-1.25, -0.6, 0] }, P.STAND)
/** A small bow. */
export const BOW = makePose({ spine: [0.22, 0, 0], chest: [0.12, 0, 0], neck: [0.12, 0, 0], head: [0.2, 0, 0] }, HOST)
/** Holding a tablet at chest height, looking at it and up. */
export const TABLET = makePose({ spine: [0.12, 0, 0], neck: [0.1, 0, 0], head: [0.15, 0, 0], lUpper: [-0.45, 0, 0.12], lFore: [-1.4, 0.4, 0], rUpper: [-0.3, 0, -0.15], rFore: [-1.1, -0.2, 0] }, P.STAND)
/** Guard: one hand on a convict's upper arm. */
export const ESCORT = makePose({ rUpper: [-0.6, 0, -0.1], rFore: [-0.7, 0, 0], lUpper: [0.03, 0, 0.1], lFore: [-0.3, 0, 0] }, P.STAND)

// ——— Looks ———

type Mats = ReturnType<typeof castMaterials>

export function castMaterials() {
  const skin = (c: number) => std(c, 0.55)
  const head = (c: number) => std(c, 0.52, { vertexColors: true })
  return {
    eye: std(0x2a1c12, 0.15),
    eyeGrey: std(0x4a5560, 0.15),
    sole: std(0x111111, 0.8),
    soleTan: std(0x8a6a4c, 0.85),
    // Arif
    skinArif: skin(0xc69b7f),
    headArif: head(0xc69b7f),
    hairArif: std(0x2b1f18, 0.72),
    shirt: std(0xeef0ee, 0.85),
    tie: pbr('fabric', 0x1c2a46, { roughness: 0.7 }),
    trousers: std(0x34373c, 0.9),
    shoesBlack: std(0x161616, 0.55),
    jacket: std(0x26324a, 0.88),
    overalls: std(0xcfd3d6, 0.9),
    overallsPanel: pbr('fabric', 0xf2f3f2, { roughness: 1 }),
    slipOn: std(0xeeeeec, 0.7),
    zip: pbr('metal', 0xb8bcc0, { roughness: 0.35 }),
    glassFrame: std(0x141414, 0.35),
    glassLens: new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false }),
    // The boss
    skinBoss: skin(0xd2a184),
    headBoss: head(0xd2a184),
    hairBoss: std(0x8f8b86, 0.8),
    shirtBoss: std(0xa9c1dc, 0.85),
    trousersBoss: std(0x1f2633, 0.9),
    shoesBrown: std(0x5a3a22, 0.5),
    gold: pbr('metal', 0xd6b25e, { roughness: 0.3 }),
    // The office
    shirts: [std(0x7d8288, 0.9), std(0xb8a98e, 0.9), std(0x2f3b55, 0.9), std(0x6b6b45, 0.9), std(0x8e5f4a, 0.9), std(0x55606b, 0.9), std(0xa39e93, 0.9), std(0x3e4a3c, 0.9)],
    coats: [0x3a3d42, 0x5b4a3a, 0x22283a, 0x4b4f3a, 0x6b3f33, 0x2e3238, 0x7a6f60, 0x30352d].map((c) => pbr('fabric', c, { roughness: 1 })),
    slacks: [std(0x2d3036, 0.9), std(0x3b3833, 0.9), std(0x25282e, 0.9), std(0x4a4740, 0.9)],
    skins: [skin(0xc89f84), skin(0xb88a6e), skin(0xd8b49a), skin(0xa97c62), skin(0xcfa588)],
    heads: [head(0xc89f84), head(0xb88a6e), head(0xd8b49a), head(0xa97c62), head(0xcfa588)],
    hairs: [std(0x1f1915, 0.75), std(0x4a3626, 0.75), std(0x2a2522, 0.75), std(0x6b5b4b, 0.75), std(0x151210, 0.75)],
    // ÖFKE NÖBETİ
    mint: std(0x7fd1c1, 0.85),
    mintDeep: std(0x63b9a8, 0.85),
    white: std(0xf1f3f2, 0.85),
    whiteGlove: std(0xf4f6f5, 0.6),
    badge: std(0xffffff, 0.4),
    // The line
    coverall: std(0x6d7277, 0.9),
    glove: std(0x101112, 0.6),
    boot: pbr('rubber', 0x141516, { roughness: 0.6 }),
    mask: std(0xb9d3e0, 0.95),
    cleaner: std(0xc9c4a6, 0.9),
    navy: std(0x1d2536, 0.9),
    cap: std(0x161c2a, 0.8),
    skin333: skinMaterial(0xc8a58e, { roughness: 0.6 }),
    skin333b: skin(0xc8a58e),
    head333: head(0xc8a58e),
    stubble333: std(0x5d4c42, 0.95),
    skin334: skinMaterial(0xb99178, { roughness: 0.6 }),
    skin334b: skin(0xb99178),
    head334: head(0xb99178),
    briefs: pbr('fabric', 0x6e7073, { roughness: 1 }),
    hood: pbr('fabric', 0x0f0f10, { roughness: 1, side: THREE.DoubleSide }),
    hoodWet: pbr('fabric', 0x060606, { roughness: 0.38, side: THREE.DoubleSide }),
    steel: pbr('metal', 0xa7acb0, { roughness: 0.3 }),
    bandWhite: std(0xf6f6f2, 0.45),
  }
}

const base = (m: Mats, name: string) => ({ name, eye: m.eye, sole: m.sole, collar: 'crew' as const })

const ARIF_FACE: FaceShape = { jaw: 0.36, nose: 0.22, lips: 0.045, stubble: 0.42 }
const BOSS_FACE: FaceShape = { jaw: 0.12, nose: 0.26, lips: 0.05, stubble: 0.85 }

export function arifLook(m: Mats, outfit: 'shirt' | 'jacket' | 'overalls'): FigureLook {
  const top = outfit === 'shirt' ? m.shirt : outfit === 'jacket' ? m.jacket : m.overalls
  return {
    ...base(m, `Arif-${outfit}`),
    build: 'm',
    face: ARIF_FACE,
    hairStyle: 'short',
    skin: m.skinArif,
    skinHead: m.headArif,
    hair: m.hairArif,
    top,
    bottom: outfit === 'overalls' ? m.overalls : m.trousers,
    cuff: top,
    shoes: outfit === 'overalls' ? m.slipOn : m.shoesBlack,
    belt: outfit !== 'overalls',
    topSurface: outfit === 'shirt' ? 'fabric' : outfit === 'jacket' ? 'fabric' : 'denim',
    bottomSurface: outfit === 'overalls' ? 'denim' : 'fabric',
  }
}

export function bossLook(m: Mats, name: string): FigureLook {
  return { ...base(m, name), sole: m.soleTan, build: 'm', face: BOSS_FACE, hairStyle: 'short', skin: m.skinBoss, skinHead: m.headBoss, hair: m.hairBoss, top: m.shirtBoss, bottom: m.trousersBoss, cuff: m.shirtBoss, shoes: m.shoesBrown, height: 1.04, belt: true }
}

export function colleagueLook(m: Mats, i: number): FigureLook {
  const f = i === 1 || i === 4 || i === 6
  const k = i % 5
  return {
    ...base(m, `colleague-${i}`),
    build: f ? 'f' : 'm',
    face: f ? { jaw: 0.14, nose: 0.14, lips: 0.065, stubble: 0 } : { jaw: 0.2 + (i % 3) * 0.12, nose: 0.18 + (i % 2) * 0.06, lips: 0.045, stubble: 0.15 + (i % 3) * 0.15 },
    hairStyle: f ? 'long' : 'short',
    skin: m.skins[k],
    skinHead: m.heads[k],
    hair: m.hairs[(i * 3) % 5],
    top: m.shirts[i],
    bottom: m.slacks[i % 4],
    cuff: m.shirts[i],
    shoes: m.shoesBlack,
    collar: i % 3 === 1 ? 'mock' : 'crew',
    height: f ? 0.95 : 0.98 + (i % 3) * 0.02,
    topSurface: i % 3 === 1 ? 'knit' : 'fabric',
  }
}

export function staffLook(m: Mats, who: 'g1' | 'g2' | 'tech'): FigureLook {
  const f = who !== 'g2'
  return {
    ...base(m, who),
    build: f ? 'f' : 'm',
    face: f ? { jaw: 0.12, nose: 0.13, lips: 0.07, stubble: 0 } : { jaw: 0.3, nose: 0.2, lips: 0.05, stubble: 0.2 },
    hairStyle: who === 'tech' ? 'long' : 'short',
    skin: m.skins[who === 'g1' ? 2 : who === 'g2' ? 0 : 4],
    skinHead: m.heads[who === 'g1' ? 2 : who === 'g2' ? 0 : 4],
    hair: m.hairs[who === 'g1' ? 0 : who === 'g2' ? 2 : 1],
    top: who === 'g1' ? m.mint : m.mintDeep,
    bottom: who === 'g1' ? m.white : m.mintDeep,
    cuff: who === 'g1' ? m.mint : m.mintDeep,
    shoes: m.white,
    height: f ? 0.95 : 1.0,
    topSurface: 'fabric',
  }
}

export function workerLook(m: Mats, who: 'orderly' | 'cleaner' | 'guard', i: number): FigureLook {
  const f = who === 'cleaner' && i === 1
  const top = who === 'orderly' ? m.coverall : who === 'cleaner' ? m.cleaner : m.navy
  return {
    ...base(m, `${who}-${i}`),
    build: f ? 'f' : 'm',
    face: f ? { jaw: 0.14, nose: 0.15, lips: 0.06, stubble: 0 } : { jaw: 0.35 + i * 0.1, nose: 0.2, lips: 0.045, stubble: 0.35 },
    hairStyle: f ? 'long' : 'short',
    skin: m.skins[(i + (who === 'guard' ? 3 : 1)) % 5],
    skinHead: m.heads[(i + (who === 'guard' ? 3 : 1)) % 5],
    hair: m.hairs[(i + 2) % 5],
    top,
    bottom: top,
    cuff: top,
    shoes: who === 'cleaner' ? m.shoesBlack : m.boot,
    height: f ? 0.96 : 1.0 + i * 0.02,
    topSurface: who === 'guard' ? 'fabric' : 'denim',
    bottomSurface: who === 'guard' ? 'fabric' : 'denim',
  }
}

export function convictLook(m: Mats, n: 333 | 334): FigureLook {
  const s = n === 333
  return {
    ...base(m, `convict-${n}`),
    build: 'm',
    face: { jaw: 0.5, nose: 0.24, lips: 0.04, stubble: 0.5 },
    hairStyle: 'short',
    skin: s ? m.skin333b : m.skin334b,
    skinHead: s ? m.head333 : m.head334,
    hair: m.stubble333,
    top: s ? m.skin333 : m.skin334,
    bottom: s ? m.skin333 : m.skin334,
    cuff: s ? m.skin333 : m.skin334,
    shoes: s ? m.skin333 : m.skin334,
    sole: s ? m.skin333 : m.skin334,
    height: s ? 0.98 : 1.02,
  }
}

// ——— Attachments ———

const HEAD_R = 0.105

/** The figure's own (upgraded) body skin material, read off its hand. */
export function skinOf(f: Figure) {
  const hand = f.joints.rHand.children.find((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh
  return hand.material as THREE.Material
}

/** A shell over part of the head: theta/phi ranges on the unit sphere, lifted off the skin. */
function headShell(face: FaceShape, lift: number, phi0: number, phiL: number, th0: number, thL: number, seg = [40, 18]) {
  const g = new THREE.SphereGeometry(1, seg[0], seg[1], phi0, phiL, th0, thL)
  const p = g.attributes.position as THREE.BufferAttribute
  const u = new THREE.Vector3()
  const o = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    u.fromBufferAttribute(p, i).normalize()
    headPoint(u, HEAD_R, face, o)
    o.addScaledVector(u, lift)
    p.setXYZ(i, o.x, o.y, o.z)
  }
  g.computeVertexNormals()
  return g
}

/** A shirt collar: a band round the neck and two points in front, open or buttoned. */
export function shirtCollar(f: Figure, mat: THREE.Material, open: boolean) {
  const c = f.joints.chest
  const band = mesh(new THREE.CylinderGeometry(0.062, 0.07, 0.04, 28, 1, true), mat, 0, 0.292, 0.004, c)
  band.scale.z = 0.95
  ;(mat as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  for (const sx of [-1, 1]) {
    const pt = new THREE.Group()
    pt.position.set(sx * 0.03, 0.29, 0.068)
    pt.rotation.set(-0.5, sx * (open ? 0.75 : 0.35), sx * (open ? 0.95 : 0.55))
    c.add(pt)
    rbox(0.058, 0.045, 0.004, mat, 0, -0.018, 0, pt, 0.0015)
  }
  if (open) {
    // The open neck: a small V of skin and the first button.
    const v = mesh(new THREE.CircleGeometry(0.03, 3), skinOf(f), 0, 0.262, 0.088, c)
    v.rotation.set(-0.25, 0, -PI / 2)
    v.scale.set(1.3, 0.8, 1)
  }
}

/** A tie: knot at the collar and the blade down the shirt front. */
export function tie(f: Figure, mat: THREE.Material) {
  const c = f.joints.chest
  const knot = rbox(0.03, 0.028, 0.016, mat, 0, 0.27, 0.092, c, 0.006)
  knot.rotation.x = -0.25
  const s = new THREE.Shape()
  s.moveTo(-0.014, 0)
  s.lineTo(0.014, 0)
  s.lineTo(0.034, -0.31)
  s.lineTo(0, -0.345)
  s.lineTo(-0.034, -0.31)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: false })
  const blade = mesh(g, mat, 0, 0.258, 0.098, c)
  blade.rotation.x = -0.12
  return { knot, blade }
}

/** The jacket's open front: a white shirt V with its tie. */
export function jacketFront(f: Figure, shirt: THREE.Material, tieMat: THREE.Material) {
  const c = f.joints.chest
  const s = new THREE.Shape()
  s.moveTo(-0.06, 0.03)
  s.lineTo(0.06, 0.03)
  s.lineTo(0, -0.2)
  s.closePath()
  const v = mesh(new THREE.ShapeGeometry(s), shirt, 0, 0.262, 0.1, c)
  v.rotation.x = -0.14
  shirtCollar(f, shirt, false)
  tie(f, tieMat)
}

/** Overalls: a zip from the collar down, white yoke panels. */
export function overallsDetail(f: Figure, m: Mats) {
  const c = f.joints.chest
  rbox(0.008, 0.36, 0.006, m.zip, 0, 0.1, 0.106, c, 0.002).rotation.x = -0.05
  for (const sx of [-1, 1]) {
    const p = rbox(0.09, 0.06, 0.004, m.overallsPanel, sx * 0.075, 0.24, 0.088, c, 0.002)
    p.rotation.set(-0.35, sx * 0.35, 0)
  }
  mesh(new THREE.CylinderGeometry(0.06, 0.072, 0.03, 28, 1, true), m.overalls, 0, 0.292, 0.004, c)
}

/** Rectangular dark glasses (Arif's), on the figure's own glasses pivot. */
export function rectGlasses(frame: THREE.Material, lens: THREE.Material) {
  const g = new THREE.Group()
  for (const sx of [-1, 1]) {
    const cx = sx * 0.035
    rbox(0.052, 0.005, 0.005, frame, cx, 0.016, 0, g, 0.002)
    rbox(0.052, 0.004, 0.004, frame, cx, -0.015, 0, g, 0.0015)
    rbox(0.005, 0.034, 0.005, frame, cx + sx * 0.026, 0, 0, g, 0.002)
    rbox(0.004, 0.03, 0.004, frame, cx - sx * 0.026, 0, 0, g, 0.0015)
    mesh(new THREE.PlaneGeometry(0.05, 0.03), lens, cx, 0, 0.001, g)
    const temple = rbox(0.004, 0.005, 0.115, frame, sx * 0.066, 0.012, -0.056, g, 0.0015)
    temple.rotation.y = sx * 0.12
  }
  rbox(0.018, 0.004, 0.004, frame, 0, 0.01, 0, g, 0.0015)
  return g
}

/** The same glasses, folded (in a hand, on a shelf). */
export function foldedGlasses(frame: THREE.Material, lens: THREE.Material) {
  const g = new THREE.Group()
  const front = rectGlasses(frame, lens)
  // Drop the temples and lay them folded behind the lenses.
  front.children.filter((c) => (c as THREE.Mesh).geometry && Math.abs(c.position.z + 0.056) < 0.001).forEach((c) => {
    c.position.set(c.position.x * 0.55, 0.005, -0.008)
    c.rotation.set(0, PI / 2, 0)
  })
  g.add(front)
  return g
}

/** A bald crown over short grey sides, and a trimmed beard. */
export function bossHead(f: Figure, m: Mats) {
  const h = f.joints.head
  const crown = mesh(headShell(BOSS_FACE, 0.006, 0, PI * 2, 0, PI * 0.3), skinOf(f), 0, 0.108, 0.008, h)
  crown.castShadow = true
  const beard = mesh(headShell(BOSS_FACE, 0.006, PI * 0.08, PI * 0.84, PI * 0.71, PI * 0.25), m.hairBoss, 0, 0.108, 0.008, h)
  beard.castShadow = true
  const moustache = mesh(headShell(BOSS_FACE, 0.005, PI * 0.36, PI * 0.28, PI * 0.63, PI * 0.035, [16, 4]), m.hairBoss, 0, 0.108, 0.008, h)
  moustache.castShadow = true
  // The belly, under the shirt.
  const belly = mesh(new THREE.SphereGeometry(1, 28, 18), m.shirtBoss, 0, 0.05, 0.035, f.joints.spine)
  belly.scale.set(0.155, 0.14, 0.12)
  // The gold watch.
  const watch = mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 20), m.gold, 0, -0.235, 0, f.joints.lFore)
  watch.rotation.x = PI / 2
}

/** A low bun at the back of the head. */
export function bun(f: Figure, hair: THREE.Material) {
  const b = mesh(new THREE.SphereGeometry(0.042, 16, 12), hair, 0, 0.07, -0.1, f.joints.head)
  b.scale.set(1.15, 0.85, 0.9)
}

/** A name badge on the chest. */
export function badge(f: Figure, mat: THREE.Material, sx = 1) {
  rbox(0.06, 0.022, 0.004, mat, sx * 0.07, 0.2, 0.107, f.joints.chest, 0.002).rotation.y = sx * 0.2
}

/** Gloves: the hands take another material. */
export function gloves(f: Figure, mat: THREE.Material) {
  for (const j of [f.joints.lHand, f.joints.rHand]) for (const c of j.children) if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = mat
}

/** A surgical mask over the lower face. */
export function faceMask(f: Figure, mat: THREE.Material) {
  const face: FaceShape = { jaw: 0.4, nose: 0.2, lips: 0.045, stubble: 0.3 }
  mesh(headShell(face, 0.008, PI * 0.12, PI * 0.76, PI * 0.55, PI * 0.33), mat, 0, 0.108, 0.008, f.joints.head)
  for (const sx of [-1, 1]) {
    const strap = mesh(new THREE.TorusGeometry(0.085, 0.002, 4, 24, PI * 0.5), mat, sx * 0.005, 0.11, -0.02, f.joints.head)
    strap.rotation.set(0, sx > 0 ? 0 : PI, 0.1)
  }
}

/** A uniform cap. */
export function cap(f: Figure, mat: THREE.Material) {
  const face: FaceShape = { jaw: 0.4, nose: 0.2, lips: 0.045, stubble: 0.3 }
  mesh(headShell(face, 0.018, 0, PI * 2, 0, PI * 0.36), mat, 0, 0.108, 0.008, f.joints.head)
  const brim = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.006, 24, 1, false, -PI / 2, PI), mat, 0, 0.165, 0.07, f.joints.head)
  brim.rotation.x = 0.12
  brim.scale.z = 0.9
}

/** The black cloth hood: over the whole head, gathered at the neck. */
export function hood(f: Figure, mat: THREE.Material) {
  const face: FaceShape = { jaw: 0.1, nose: 0.05, lips: 0.04, stubble: 0 }
  const g = new THREE.Group()
  f.joints.head.add(g)
  const top = mesh(headShell(face, 0.022, 0, PI * 2, 0, PI * 0.82, [36, 20]), mat, 0, 0.108, 0.008, g)
  const skirt = mesh(new THREE.CylinderGeometry(0.078, 0.074, 0.075, 28, 3, true), mat, 0, 0.022, 0.0, g)
  skirt.scale.z = 1.1
  top.castShadow = skirt.castShadow = true
  return g
}

/** The white neck band printed with the number (the "yaka"). */
export function neckBand(f: Figure, n: number, mat: THREE.Material) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 48
  const x = c.getContext('2d')!
  x.fillStyle = '#f6f6f2'
  x.fillRect(0, 0, 512, 48)
  x.fillStyle = '#16181a'
  mono(x, 30, 700)
  x.textAlign = 'center'
  for (let k = 0; k < 4; k++) x.fillText(String(n), 64 + k * 128, 36)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const m = (mat as THREE.MeshStandardMaterial).clone()
  m.map = tex
  const band = mesh(new THREE.CylinderGeometry(0.058, 0.06, 0.034, 32, 1, true), m, 0, 0.012, 0.005, f.joints.neck)
  band.rotation.y = PI / 2
  band.castShadow = true
  return band
}

/** Grey boxer briefs over the hips and the tops of the thighs. */
export function briefs(f: Figure, mat: THREE.Material) {
  const hips = mesh(new THREE.CylinderGeometry(0.148, 0.16, 0.17, 30, 1, true), mat, 0, 0.03, 0.002, f.joints.hips)
  hips.scale.set(1.04, 1, 0.8)
  const seat = mesh(new THREE.SphereGeometry(1, 24, 12, 0, PI * 2, PI * 0.5, PI * 0.5), mat, 0, -0.05, 0.002, f.joints.hips)
  seat.scale.set(0.162, 0.08, 0.13)
  for (const [j, sx] of [
    [f.joints.lThigh, 1],
    [f.joints.rThigh, -1],
  ] as const) {
    const leg = mesh(new THREE.CylinderGeometry(0.084, 0.078, 0.14, 20, 1, true), mat, sx * 0.004, -0.07, 0.004, j)
    leg.scale.z = 0.95
  }
}

/** Steel cuffs at both wrists (the chain between them is drawn by the director). */
export function cuffs(f: Figure, mat: THREE.Material) {
  for (const j of [f.joints.lFore, f.joints.rFore]) {
    const r = mesh(new THREE.TorusGeometry(0.036, 0.007, 8, 20), mat, 0, -0.232, 0, j)
    r.rotation.x = PI / 2
  }
  for (const j of [f.joints.lShin, f.joints.rShin]) {
    const r = mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 20), mat, 0, -0.38, 0, j)
    r.rotation.x = PI / 2
  }
}

/** A short chain between two moving points: a run of small links. */
export class Chain {
  readonly mesh: THREE.InstancedMesh
  private m4 = new THREE.Matrix4()
  private q = new THREE.Quaternion()
  private s = new THREE.Vector3(1, 1, 1)
  private p = new THREE.Vector3()
  constructor(
    private links: number,
    mat: THREE.Material,
  ) {
    const g = new THREE.TorusGeometry(0.011, 0.0028, 6, 12)
    this.mesh = new THREE.InstancedMesh(g, mat, links)
    this.mesh.frustumCulled = false
    this.mesh.castShadow = true
  }
  /** Hangs the links between a and b with a sag. */
  set(a: THREE.Vector3, b: THREE.Vector3, sag = 0.03) {
    const e = new THREE.Euler()
    for (let i = 0; i < this.links; i++) {
      const t = (i + 0.5) / this.links
      this.p.lerpVectors(a, b, t)
      this.p.y -= Math.sin(t * PI) * sag
      e.set(i % 2 ? PI / 2 : 0, Math.atan2(b.x - a.x, b.z - a.z), 0, 'YXZ')
      this.q.setFromEuler(e)
      this.m4.compose(this.p, this.q, this.s)
      this.mesh.setMatrixAt(i, this.m4)
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }
}

/** Records which meshes wear a material, so an outfit can change later. */
export function wearers(f: Figure, mat: THREE.Material) {
  return f.meshes.filter((m) => m.material === mat)
}

/** Every mesh of a figure stops casting shadows (background people). */
export function noShadows(f: Figure) {
  for (const m of f.meshes) m.castShadow = false
}

export { cyl }
