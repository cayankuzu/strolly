/**
 * ÖTE — the people. One rig per person, re-placed from set to set: the man
 * (K3-33), the official who never speaks until the end, "we" behind the glass,
 * the guards and escorts, the thirty-two others (six by name, six more as
 * full figures, the rest a crowd), and the next client.
 */
import * as THREE from 'three'
import { Figure, makePose, type FigureLook, type Pose } from '../figure/Figure'
import { handGeometry } from '../figure/figureBody'
import * as P from '../figure/poses'
import { Actor } from '../kit/direct'
import { canvasPlane, std } from '../kit/props'
import { mesh } from '../util'
import type { Pal } from './materials'
import { drawPatch } from './draw'

export const CAST = ['M', 'G', 'B1', 'B2', 'B3', 'B4', 'Q1', 'Q2', 'Q3', 'Q4', 'O1', 'O2', 'W1', 'Y', 'C1', 'C2', 'H', 'S', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'N'] as const
export type CastId = (typeof CAST)[number]

// ——— Poses of this story ———

/** Seated upright at the table, forearms forward (hands placed by reach). */
export const SIT_TABLE = makePose({ spine: [0.08, 0, 0], chest: [0.04, 0, 0], neck: [0.05, 0, 0], head: [0.12, 0, 0], lUpper: [-0.55, 0, 0.12], rUpper: [-0.55, 0, -0.12], lFore: [-1.1, 0, 0], rFore: [-1.1, 0, 0] }, P.SIT)
/** Head bowed over the pages. */
export const SIT_BOWED = makePose({ spine: [0.2, 0, 0], chest: [0.12, 0, 0], neck: [0.16, 0, 0], head: [0.36, 0, 0] }, SIT_TABLE)
/** The official: upright, still. */
export const SIT_STILL_UP = makePose({ spine: [0.02, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0.04, 0, 0] }, SIT_TABLE)
/** Standing at attention: heels together, arms straight, chin up. */
export const ATTENTION = makePose({
  spine: [-0.03, 0, 0],
  chest: [-0.02, 0, 0],
  head: [-0.05, 0, 0],
  lUpper: [0.02, 0, 0.035],
  rUpper: [0.02, 0, -0.035],
  lFore: [-0.04, 0, 0],
  rFore: [-0.04, 0, 0],
  lThigh: [0, 0, 0.01],
  rThigh: [0, 0, -0.01],
})
/** Guards and escorts: hands clasped in front. */
export const CLASPED = makePose({ head: [0.03, 0, 0], lUpper: [-0.25, 0, 0.12], rUpper: [-0.25, 0, -0.12], lFore: [-0.75, 0.55, 0], rFore: [-0.75, -0.55, 0] })
/** Seated in the shuttle, hands on the armrests. */
export const SIT_ARMS = makePose({ spine: [-0.04, 0, 0], chest: [-0.02, 0, 0], head: [0.04, 0, 0], lUpper: [-0.15, 0, 0.2], rUpper: [-0.15, 0, -0.2], lFore: [-1.35, 0, 0], rFore: [-1.35, 0, 0], lHand: [0.2, 0, 0], rHand: [0.2, 0, 0] }, P.SIT)
/** Pressed into the seat by the G-force: head back into the headrest. */
export const SIT_G = makePose({ spine: [-0.14, 0, 0], chest: [-0.08, 0, 0], neck: [-0.12, 0, 0], head: [-0.16, 0, 0] }, SIT_ARMS)
/** Knitting: hands together in the lap, head down a little. */
export const SIT_KNIT = makePose({ spine: [0.06, 0, 0], neck: [0.12, 0, 0], head: [0.3, 0, 0], lUpper: [-0.4, 0, 0.1], rUpper: [-0.4, 0, -0.1], lFore: [-1.25, 0.35, 0], rFore: [-1.25, -0.35, 0] }, P.SIT)
/** On a stool. */
export const STOOL = makePose({
  hipY: 0.78,
  lThigh: [-1.25, 0, 0.14],
  rThigh: [-1.1, 0, -0.08],
  lShin: [1.55, 0, 0],
  rShin: [1.2, 0, 0],
  lFoot: [0.1, 0, 0],
  rFoot: [0.15, 0, 0],
  spine: [0.1, 0, 0],
  chest: [0.05, 0, 0],
  neck: [0.05, 0, 0],
  head: [0.18, 0.1, 0],
  lUpper: [-0.6, 0.3, 0.3],
  rUpper: [-0.35, 0, -0.25],
  lFore: [-1.4, 0, 0],
  rFore: [-1.2, 0, 0],
})
/** Leaning toward a window, forehead nearly on the glass. */
export const GLASS_LEAN = makePose({ hipZ: -0.03, spine: [0.1, 0, 0], chest: [0.06, 0, 0], neck: [0.08, 0, 0], head: [0.1, 0, 0], lUpper: [-0.1, 0, 0.08], rUpper: [0.02, 0, -0.06], lFore: [-0.5, 0, 0], rFore: [-0.15, 0, 0] })
/** An arm raised at arm's length, toward the window. */
export const ARM_UP = makePose({ rUpper: [-1.62, 0, -0.08], rFore: [-0.08, 0, 0], rHand: [-0.9, 0, 0], head: [-0.06, 0, 0] }, P.STAND)
/** Stretching, both arms up. */
export const STRETCH = makePose({ spine: [-0.1, 0, 0], chest: [-0.08, 0, 0], head: [-0.15, 0, 0], lUpper: [-2.8, 0, 0.2], rUpper: [-2.8, 0, -0.2], lFore: [-0.3, 0, 0], rFore: [-0.3, 0, 0] })
/** Standing with a tablet held at the chest in one hand. */
export const TABLET = makePose({ neck: [0.1, 0, 0], head: [0.22, 0, 0], lUpper: [-0.32, 0, 0.18], rUpper: [-0.1, 0, -0.1], lFore: [-1.35, 0.4, 0], rFore: [-0.5, 0, 0] })
/** On the lounge sofa, upright, a cup in the lap. */
export const SOFA_UP = makePose({ hipY: 0.575, lThigh: [-1.5, 0, 0.1], rThigh: [-1.48, 0, -0.06], lShin: [1.42, 0, 0], rShin: [1.5, 0, 0], spine: [-0.08, 0, 0], chest: [-0.02, 0, 0], neck: [0.05, 0, 0], head: [0.1, 0, 0], lUpper: [-0.35, 0, 0.15], rUpper: [-0.4, 0, -0.15], lFore: [-1.1, 0.3, 0], rFore: [-1.2, -0.3, 0] }, P.SOFA)

export const POSES = { SIT_TABLE, SIT_BOWED, SIT_STILL_UP, ATTENTION, CLASPED, SIT_ARMS, SIT_G, SIT_KNIT, STOOL, GLASS_LEAN, ARM_UP, STRETCH, TABLET, SOFA_UP }

// ——— Looks ———

type Kind = { build: 'm' | 'f'; height: number; face: FigureLook['face']; hair: THREE.Material; hairStyle: FigureLook['hairStyle']; skin: THREE.Material; skinHead: THREE.Material; top: THREE.Material; bottom: THREE.Material; cuff?: THREE.Material; collar?: 'mock' | 'crew'; topSurface?: FigureLook['topSurface']; bottomSurface?: FigureLook['bottomSurface']; eye?: THREE.Material; belt?: boolean }

function look(m: Pal, name: string, k: Kind): FigureLook {
  return {
    name,
    build: k.build,
    face: k.face,
    hairStyle: k.hairStyle,
    skin: k.skin,
    skinHead: k.skinHead,
    eye: k.eye ?? m.eye,
    hair: k.hair,
    top: k.top,
    bottom: k.bottom,
    shoes: m.shoe,
    sole: m.sole,
    cuff: k.cuff ?? k.top,
    collar: k.collar ?? 'crew',
    topSurface: k.topSurface,
    bottomSurface: k.bottomSurface,
    belt: k.belt,
    height: k.height,
  }
}

const MF = (stubble: number, jaw = 0.3, nose = 0.2) => ({ jaw, nose, lips: 0.045, stubble })
const FF = (jaw = 0.15, nose = 0.13) => ({ jaw, nose, lips: 0.068, stubble: 0 })

/** The hair colours that change with the years (ageing is a colour, read per frame). */
export const HAIR = {
  M: [0x3a2a20, 0x9c9a96],
  W1: [0xdedad3, 0xf2f0ec],
  Y: [0x2a1f18, 0x3a2e26],
  C1: [0xcfccc6, 0xf1efeb],
  C2: [0xb9b8b6, 0xeceae6],
} as const

export type Cast = {
  actors: Record<CastId, Actor>
  /** Per-person hair materials (the upgraded ones on the figure) for ageing. */
  hair: Partial<Record<CastId, THREE.MeshStandardMaterial>>
  /** Y's beard, grown in the years. */
  beard: THREE.Mesh
  /** W1's round spectacles (the CC0 model when it loaded). */
  spectacles: THREE.Object3D | null
}

/** Right hands that can close around a pen (M's and N's): the relaxed and the curled geometry. */
const grips = new Map<Figure, { mesh: THREE.Mesh; relaxed: THREE.BufferGeometry; grip: THREE.BufferGeometry }>()
/** Curls a figure's right hand around something (the pen), or relaxes it. */
export function setGrip(f: Figure, on: boolean) {
  const g = grips.get(f)
  if (g) g.mesh.geometry = on ? g.grip : g.relaxed
}
function makeGrip(f: Figure, scale: number) {
  const m = f.joints.rHand.children.find((o) => (o as THREE.Mesh).isMesh) as THREE.Mesh | undefined
  if (!m) return
  const grip = handGeometry(-1, scale, 0.95)
  grips.set(f, { mesh: m, relaxed: m.geometry, grip })
}
export function disposeGrips() {
  for (const g of grips.values()) {
    g.mesh.geometry = g.relaxed
    g.grip.dispose()
  }
  grips.clear()
}

/** The eyelids of a figure (meshes that remember their open angle). */
const lidCache = new WeakMap<Figure, THREE.Mesh[]>()
const pendingEyes = new Map<Figure, number>()
/**
 * Asks for a figure's eyes this frame: 1 closed … 0 as they are (blinking);
 * below 0, held wide open (no blink). Applied by `flushEyes` after the
 * figures' own life (blinks) has run.
 */
export function setEyes(f: Figure, closed: number) {
  pendingEyes.set(f, closed)
}
export function flushEyes() {
  for (const [f, closed] of pendingEyes) {
    let lids = lidCache.get(f)
    if (!lids) {
      lids = f.headMeshes.filter((h) => h.userData.open !== undefined)
      lidCache.set(f, lids)
    }
    if (closed === 0) continue
    for (const lid of lids) lid.rotation.x = closed > 0 ? Math.max(lid.rotation.x, lid.userData.open + closed * 0.78) : lid.userData.open + closed * 0.22
  }
  pendingEyes.clear()
}

export function buildCast(m: Pal, scene: THREE.Scene, spectaclesModel: THREE.Group | null): Cast {
  const hairOf = (c: number, rough = 0.7) => std(c, rough)
  const hM = hairOf(HAIR.M[0])
  const hW = hairOf(HAIR.W1[0], 0.6)
  const hY = hairOf(HAIR.Y[0])
  const hC1 = hairOf(HAIR.C1[0], 0.6)
  const hC2 = hairOf(HAIR.C2[0], 0.6)
  const shortDark = hairOf(0x241c16)
  const brownHair = hairOf(0x4a3424)
  const greyHair = hairOf(0x8e8c88, 0.65)
  const nearBald = hairOf(0x9c7a62, 0.8)
  const blackHair = hairOf(0x15110e)
  const silver = hairOf(0xa9a7a2, 0.6)

  const looks: Record<CastId, FigureLook> = {
    M: look(m, 'K3-33', { build: 'm', height: 1.0, face: MF(0.42, 0.32, 0.22), hair: hM, hairStyle: 'short', skin: m.skinM, skinHead: m.skinMHead, top: m.navyCoat, bottom: m.darkTrousers, cuff: m.greyKnit, topSurface: 'fabric' }),
    G: look(m, 'Görevli', { build: 'm', height: 1.03, face: MF(0.08, 0.38, 0.2), hair: nearBald, hairStyle: 'short', skin: m.skinG, skinHead: m.skinGHead, top: m.blackSuit, bottom: m.blackSuit, cuff: m.whiteShirt, collar: 'mock', belt: true }),
    B1: look(m, 'B1', { build: 'm', height: 1.0, face: MF(0.2), hair: shortDark, hairStyle: 'short', skin: m.skinB, skinHead: m.skinBHead, top: m.charcoal, bottom: m.charcoal, cuff: m.whiteShirt, collar: 'mock' }),
    B2: look(m, 'B2', { build: 'f', height: 0.97, face: FF(), hair: brownHair, hairStyle: 'short', skin: m.skinP, skinHead: m.skinPHead, top: m.charcoal, bottom: m.charcoal, collar: 'mock' }),
    B3: look(m, 'B3', { build: 'm', height: 1.02, face: MF(0.3, 0.34), hair: greyHair, hairStyle: 'short', skin: m.skinG, skinHead: m.skinGHead, top: m.charcoal, bottom: m.charcoal, cuff: m.whiteShirt, collar: 'mock' }),
    B4: look(m, 'B4', { build: 'm', height: 0.98, face: MF(0.15, 0.26), hair: blackHair, hairStyle: 'short', skin: m.skinY, skinHead: m.skinYHead, top: m.charcoal, bottom: m.charcoal, cuff: m.whiteShirt, collar: 'mock' }),
    Q1: look(m, 'Q1', { build: 'm', height: 1.05, face: MF(0.3, 0.4), hair: shortDark, hairStyle: 'short', skin: m.skinM, skinHead: m.skinMHead, top: m.guard, bottom: m.guard, collar: 'mock', belt: true }),
    Q2: look(m, 'Q2', { build: 'm', height: 1.06, face: MF(0.36, 0.42), hair: blackHair, hairStyle: 'short', skin: m.skinB, skinHead: m.skinBHead, top: m.guard, bottom: m.guard, collar: 'mock', belt: true }),
    Q3: look(m, 'Q3', { build: 'm', height: 1.04, face: MF(0.22, 0.4), hair: brownHair, hairStyle: 'short', skin: m.skinG, skinHead: m.skinGHead, top: m.guard, bottom: m.guard, collar: 'mock', belt: true }),
    Q4: look(m, 'Q4', { build: 'm', height: 1.05, face: MF(0.3, 0.38), hair: shortDark, hairStyle: 'short', skin: m.skinY, skinHead: m.skinYHead, top: m.guard, bottom: m.guard, collar: 'mock', belt: true }),
    O1: look(m, 'O1', { build: 'm', height: 1.0, face: MF(0.12, 0.3), hair: greyHair, hairStyle: 'short', skin: m.skinP, skinHead: m.skinPHead, top: m.blackSuit, bottom: m.blackSuit, cuff: m.whiteShirt, collar: 'mock' }),
    O2: look(m, 'O2', { build: 'f', height: 0.98, face: FF(0.18), hair: blackHair, hairStyle: 'long', skin: m.skinG, skinHead: m.skinGHead, top: m.blackSuit, bottom: m.blackSuit, collar: 'mock' }),
    W1: look(m, 'Yaşlı kadın', { build: 'f', height: 0.93, face: { jaw: 0.12, nose: 0.15, lips: 0.04, stubble: 0 }, hair: hW, hairStyle: 'short', skin: m.skinW, skinHead: m.skinWHead, top: m.lilac, bottom: m.greySkirt, cuff: m.cream, topSurface: 'knit', eye: m.eyeBlue }),
    Y: look(m, 'Gitarlı genç', { build: 'm', height: 1.02, face: MF(0.3, 0.26, 0.18), hair: hY, hairStyle: 'long', skin: m.skinY, skinHead: m.skinYHead, top: m.denimJacket, bottom: m.jeans, cuff: m.tee, topSurface: 'denim', bottomSurface: 'denim' }),
    C1: look(m, 'Yaşlı adam', { build: 'm', height: 0.97, face: MF(0.12, 0.28, 0.24), hair: hC1, hairStyle: 'short', skin: m.skinW, skinHead: m.skinWHead, top: m.beige, bottom: m.darkTrousers, cuff: m.beigeDark }),
    C2: look(m, 'Yaşlı kadın 2', { build: 'f', height: 0.92, face: FF(0.12, 0.14), hair: hC2, hairStyle: 'short', skin: m.skinP, skinHead: m.skinPHead, top: m.beige, bottom: m.greySkirt, cuff: m.beigeDark }),
    H: look(m, 'Bileklikli kadın', { build: 'f', height: 0.98, face: FF(0.17, 0.13), hair: blackHair, hairStyle: 'short', skin: m.skinH, skinHead: m.skinHHead, top: m.greenSweater, bottom: m.darkTrousers, topSurface: 'knit', collar: 'mock' }),
    S: look(m, 'Takım elbiseli adam', { build: 'm', height: 1.0, face: MF(0.1, 0.34, 0.24), hair: silver, hairStyle: 'short', skin: m.skinG, skinHead: m.skinGHead, top: m.navySuit, bottom: m.navySuit, cuff: m.whiteShirt, collar: 'mock', belt: true }),
    P1: look(m, 'P1', { build: 'm', height: 1.02, face: MF(0.3), hair: greyHair, hairStyle: 'short', skin: m.skinP, skinHead: m.skinPHead, top: std(0x4b4f45, 0.95), bottom: m.darkTrousers, topSurface: 'knit' }),
    P2: look(m, 'P2', { build: 'f', height: 0.96, face: FF(), hair: brownHair, hairStyle: 'long', skin: m.skinM, skinHead: m.skinMHead, top: std(0x6b4a3e, 0.95), bottom: m.jeans, bottomSurface: 'denim', collar: 'mock' }),
    P3: look(m, 'P3', { build: 'm', height: 0.98, face: MF(0.2, 0.3), hair: silver, hairStyle: 'short', skin: m.skinW, skinHead: m.skinWHead, top: std(0x3d4652, 0.92), bottom: std(0x575a5e, 0.9) }),
    P4: look(m, 'P4', { build: 'f', height: 0.95, face: FF(0.14), hair: greyHair, hairStyle: 'short', skin: m.skinH, skinHead: m.skinHHead, top: std(0x7a6e5a, 0.95), bottom: m.darkTrousers, topSurface: 'knit' }),
    P5: look(m, 'P5', { build: 'm', height: 1.04, face: MF(0.45, 0.36), hair: shortDark, hairStyle: 'short', skin: m.skinB, skinHead: m.skinBHead, top: std(0x2e3a33, 0.92), bottom: m.jeans, bottomSurface: 'denim' }),
    P6: look(m, 'P6', { build: 'f', height: 0.97, face: FF(0.16), hair: silver, hairStyle: 'short', skin: m.skinG, skinHead: m.skinGHead, top: std(0x5a4e66, 0.95), bottom: std(0x3a3a3d, 0.9), collar: 'mock' }),
    N: look(m, 'Yeni müşteri', { build: 'f', height: 0.97, face: FF(0.16, 0.13), hair: blackHair, hairStyle: 'long', skin: m.skinH, skinHead: m.skinHHead, top: m.greenCoat, bottom: m.darkTrousers, cuff: m.greenCoat, collar: 'mock' }),
  }
  const actors = {} as Record<CastId, Actor>
  for (const id of CAST) {
    const fig = new Figure(looks[id])
    scene.add(fig.root)
    fig.root.visible = false
    actors[id] = new Actor(fig)
  }
  const J = (id: CastId) => actors[id].figure.joints
  makeGrip(actors.M.figure, 1)
  makeGrip(actors.N.figure, 0.88)
  const hair: Cast['hair'] = {}
  for (const id of ['M', 'W1', 'Y', 'C1', 'C2'] as CastId[]) hair[id] = actors[id].figure.headMeshes[1].material as THREE.MeshStandardMaterial

  // Suits: the white shirt collar at the neck.
  for (const id of ['G', 'B1', 'B3', 'B4', 'O1', 'S'] as CastId[]) {
    const collar = mesh(new THREE.TorusGeometry(0.064, 0.011, 8, 28), m.whiteShirt, 0, 0.305, 0.006, J(id).chest)
    collar.rotation.x = Math.PI / 2 - 0.16
    collar.scale.set(1, 0.9, 1)
  }
  // Guards: the keyhole patch on the left shoulder.
  for (const id of ['Q1', 'Q2', 'Q3', 'Q4'] as CastId[]) {
    const patch = canvasPlane(0.075, 0.075, 128, drawPatch, { transparent: true })
    patch.mesh.position.set(0.052, -0.07, 0)
    patch.mesh.rotation.y = Math.PI / 2
    J(id).lUpper.add(patch.mesh)
  }
  // W1: a bun at the back of the head.
  mesh(new THREE.SphereGeometry(0.045, 20, 14), hair.W1!, 0, 0.165, -0.085, J('W1').head).scale.set(1, 0.85, 0.9)
  // Y: his hair tied back.
  mesh(new THREE.SphereGeometry(0.03, 14, 10), hair.Y!, 0, 0.11, -0.115, J('Y').head)
  // H: the red scarf and the white hospital bracelet on her left wrist.
  const scarf = mesh(new THREE.TorusGeometry(0.075, 0.026, 10, 28), m.redScarf, 0, 0.29, 0.01, J('H').chest)
  scarf.rotation.x = Math.PI / 2 - 0.2
  const tail = mesh(new THREE.BoxGeometry(0.07, 0.2, 0.02), m.redScarf, 0.03, 0.2, 0.09, J('H').chest)
  tail.rotation.set(-0.15, 0, 0.1)
  const bracelet = mesh(new THREE.TorusGeometry(0.03, 0.0065, 8, 24), m.bracelet, 0, 0.012, 0, J('H').lHand)
  bracelet.rotation.x = Math.PI / 2
  mesh(new THREE.BoxGeometry(0.018, 0.014, 0.006), m.bracelet, 0, 0.012, 0.033, J('H').lHand)
  // S: the wristwatch he keeps checking.
  const strap = mesh(new THREE.TorusGeometry(0.031, 0.006, 8, 24), m.shoe, 0, 0.014, 0, J('S').lHand)
  strap.rotation.x = Math.PI / 2
  const face = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 20), m.watch, 0, 0.014, 0.034, J('S').lHand)
  face.rotation.x = Math.PI / 2
  // Y: a beard that grows over the years (scaled in by the scene).
  const beardGeo = new THREE.SphereGeometry(1, 36, 18, Math.PI / 2 - 1.15, 2.3, Math.PI * 0.6, Math.PI * 0.36)
  const beard = mesh(beardGeo, hair.Y!, 0, 0.104, 0.012, J('Y').head)
  beard.scale.set(0.105 * 0.82, 0.105 * 1.12, 0.105 * 1.12)
  beard.visible = false
  // W1's round spectacles: the real model when it loaded, the rig's own glasses otherwise.
  let spectacles: THREE.Object3D | null = null
  if (spectaclesModel) {
    spectacles = spectaclesModel
    spectacles.position.set(0, 0.124, 0.112)
    spectacles.scale.multiplyScalar(0.92)
    J('W1').head.add(spectacles)
  } else {
    const g = actors.W1.figure.glasses
    for (const sx of [-1, 1]) {
      mesh(new THREE.TorusGeometry(0.023, 0.0022, 8, 28), m.glassesFrame, sx * 0.034, 0, 0, g)
      mesh(new THREE.CircleGeometry(0.022, 24), m.lens, sx * 0.034, 0, 0, g)
    }
  }
  return { actors, hair, beard, spectacles }
}

/** Blends a pose track quickly: [u, pose] keys. */
export type Keys = ReadonlyArray<readonly [number, Pose]>
