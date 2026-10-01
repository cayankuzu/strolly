/**
 * TEKERRÜR — the DURUM observatory at night.
 *
 * World layout (meters, y up): the office is x −5…5, z −4…4, 3 m high. North
 * (z = −4) is a glass partition onto the server hall (z −4…−12). East (x = 5)
 * has three windows over Ankara at night. South (z = 4): the door to the
 * corridor (x = 2.6), the whiteboard, the stopped wall clock. West: the coffee
 * corner. Arif's desk faces north at the centre; Selin's desk is by the
 * windows. The corridor runs along z ≈ 5.3; the kitchen is across it.
 *
 * Everything that moves is a function of progress and of what the reader
 * chose (frame.flags): where the cup goes, how the tea glass falls.
 */
import * as THREE from 'three'
import { SEG, at, clockText, local, segmentAt, storyHours, type SegmentId } from '@/stories/tekerrur/timeline'
import { CHOICES } from '@/stories/tekerrur/text'
import { clamp, lerp, mulberry32, smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { Figure, makePose, type FigureLook } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { box, mesh } from '../util'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed, type ShotKeys } from '../kit/direct'
import {
  bin,
  binder,
  blinds,
  canvasPlane,
  ceilingPanel,
  coffeeMachine,
  counter,
  desk,
  deskLamp,
  facade,
  hardware,
  keyboard,
  monitor,
  mouse,
  mug,
  officeChair,
  papers,
  pcTower,
  phone,
  plant,
  printer,
  radiator,
  rbox,
  room,
  serverRack,
  shelf,
  socket,
  std,
  tube,
  wallClock,
  whiteboard,
} from '../kit/props'
import { pbr } from '../kit/surfaces'
import * as S from './screens'

const PI = Math.PI
const DESK = { x: 0, z: -0.6 }
const SEAT = { x: 0, z: 0.14 }
const MUG_ON_DESK = new THREE.Vector3(0.46, 0.754, -0.36)
const PEN_ON_DESK = new THREE.Vector3(-0.34, 0.762, -0.3)
const PEN_LAND = new THREE.Vector3(-0.27, 0.006, 0.05)
const DOOR = { x: 2.6, z: 4.0 }
const DISPLAY = new THREE.Vector3(2.6, 1.55, -3.55)
const SELIN_DESK = { x: 3.3, z: 1.4 }
const CONSOLE = new THREE.Vector3(-4.72, 1.28, -7.2)
const COAT_RACK = { x: 3.95, z: 3.45 }
const COFFEE = new THREE.Vector3(-4.72, 0.92, 0.5)
/** Rack columns in the hall: two blocks of three, a wide aisle between them. */
const RACK_X = [-3.9, -3.25, -2.6, 0.6, 1.25, 1.9]
/** The rack that holds DURUM's model of itself: row B, first of the east block. */
const SELF_RACK = { x: RACK_X[3], z: -8.4 }

/** Crouched low, reaching for the floor. */
const CROUCH = makePose({
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

// ——— Paths ———

const P_TO_COFFEE = makePath([
  [SEAT.x, SEAT.z + 0.2],
  [-1.6, 0.9],
  [-3.4, 0.7],
  [-4.15, 0.5],
])
const P_FROM_COFFEE = makePath([
  [-4.15, 0.5],
  [-2.2, 0.95],
  [-0.6, 0.8],
  [SEAT.x, SEAT.z + 0.25],
])
const P_TO_DOOR = makePath([
  [SEAT.x, SEAT.z + 0.25],
  [1.2, 1.6],
  [2.4, 3.1],
  [DOOR.x, 4.4],
  [1.5, 5.3],
])
const P_TO_KITCHEN = makePath([
  [1.5, 5.3],
  [-1.2, 5.35],
  [-2.2, 6.2],
  [-2.3, 7.6],
  [-2.6, 8.9],
])
const P_BACK = makePath([
  [-2.6, 8.9],
  [-2.3, 7.4],
  [-2.0, 5.6],
  [0.6, 5.25],
  [DOOR.x, 4.85],
  [DOOR.x, 4.45],
])
const P_SELIN_IN = makePath([
  [6.5, 5.4],
  [4.2, 5.3],
  [DOOR.x + 0.1, 4.6],
  [DOOR.x, 3.4],
  [1.4, 1.2],
  [0.82, 0.12],
])
/** Kitchen night: she leaves her desk for the door, tea in hand, as he comes back. */
const P_SELIN_OUT = makePath([
  [SELIN_DESK.x - 0.95, SELIN_DESK.z + 0.25],
  [2.45, 2.6],
  [DOOR.x, 3.55],
])
/** For the broom: out of the office to the kitchen, and back. */
const BROOM_DESK: Array<[number, number]> = [
  [0.7, 0.25],
  [1.5, 1.6],
  [2.5, 3.2],
  [DOOR.x, 4.4],
  [1.4, 5.3],
]
const BROOM_DOOR: Array<[number, number]> = [
  [DOOR.x + 0.18, 3.6],
  [DOOR.x, 4.4],
  [1.4, 5.3],
]
const P_BROOM = { desk: [makePath(BROOM_DESK), makePath([...BROOM_DESK].reverse())], door: [makePath(BROOM_DOOR), makePath([...BROOM_DOOR].reverse())] }
const P_TO_DISPLAY = makePath([
  [SEAT.x, SEAT.z + 0.25],
  [1.0, -0.2],
  [2.1, -1.6],
  [2.45, -2.45],
])
const P_TO_HALL = makePath([
  [SEAT.x, SEAT.z + 0.25],
  [-1.6, -0.6],
  [-3.1, -3.0],
  [-3.1, -4.5],
  [-1.0, -5.1],
  [-1.0, -6.9],
  [SELF_RACK.x, -7.25],
])
const P_TO_CONSOLE = makePath([
  [SELF_RACK.x, -7.25],
  [-2.0, -7.2],
  [-4.15, -7.2],
])
const P_TO_RACK = makePath([
  [SEAT.x, SEAT.z + 0.25],
  [1.1, 1.0],
  [2.6, 2.6],
  [COAT_RACK.x - 0.45, COAT_RACK.z - 0.1],
])
const P_OUT = makePath([
  [COAT_RACK.x - 0.45, COAT_RACK.z - 0.1],
  [DOOR.x, 3.5],
  [DOOR.x, 4.4],
  [1.4, 5.3],
  [-1.5, 5.35],
])

// ——— Palette ———

function palette() {
  return {
    wall: pbr('painted', 0xd7d4cc, { roughness: 1 }),
    wallHall: pbr('painted', 0x2a2f35, { roughness: 1 }),
    floor: pbr('carpet', 0x464b53),
    hallFloor: pbr('tile', 0x8a9097, { roughness: 2.4 }),
    corridorFloor: pbr('tile', 0x9a968c, { roughness: 1.8 }),
    ceiling: pbr('plaster', 0xe2e0da),
    trim: pbr('painted', 0xb9b6ae, { roughness: 0.9 }),
    deskTop: pbr('laminate', 0xcbc3b4, { roughness: 0.9 }),
    deskBody: pbr('painted', 0x5d636a, { roughness: 0.9 }),
    chair: pbr('fabric', 0x2b2f35),
    metal: pbr('metal', 0x9aa0a6, { roughness: 0.7 }),
    dark: pbr('plastic', 0x1c1f23),
    frame: pbr('plastic', 0x15171a, { roughness: 0.7 }),
    rack: pbr('painted', 0x1d2125, { roughness: 0.8 }),
    mug: pbr('ceramic', 0xe8e2d6),
    coffee: std(0x1e120a, 0.08),
    tea: new THREE.MeshPhysicalMaterial({ color: 0x8c2a08, roughness: 0.05, transmission: 0.4, thickness: 0.05, transparent: true, opacity: 0.9 }),
    teaGlass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false }),
    saucer: pbr('ceramic', 0xf1eee7),
    // Tea soaking into carpet: a dark, damp stain rather than a glossy pool.
    puddle: new THREE.MeshStandardMaterial({ color: 0x1c0a04, roughness: 0.3, transparent: true, opacity: 0.62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    pen: pbr('plastic', 0x1f3d8a, { roughness: 0.6 }),
    counterTop: pbr('laminate', 0xb6afa2, { roughness: 0.8 }),
    cabinet: pbr('painted', 0x98a1a7),
    fridge: pbr('painted', 0xe6e4de, { roughness: 0.6 }),
    coffeeBody: pbr('plastic', 0x24272b),
    jugGlass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.25, depthWrite: false }),
    shelfWood: pbr('wood', 0x8a6d50, { roughness: 0.9 }),
    book: pbr('paper', 0x6d5b4b, { roughness: 0.9 }),
    bookB: pbr('paper', 0x4f6074, { roughness: 0.9 }),
    bookC: pbr('paper', 0xb8aa92, { roughness: 0.9 }),
    pot: pbr('ceramic', 0x6c776f, { roughness: 3 }),
    leaf: std(0x56653f, 0.85),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xc8d6de, roughness: 0.04, transparent: true, opacity: 0.12, depthWrite: false }),
    facade: pbr('concrete', 0x30353c),
    facadeB: pbr('brick', 0x4a3a32),
    ground: pbr('asphalt', 0x16181b),
    coat: pbr('fabric', 0x33363a),
    bag: pbr('leather', 0x3a2a20),
    blindsMat: pbr('plastic', 0xc9c6bd, { roughness: 0.8 }),
    radiatorMat: pbr('painted', 0xdedcd6, { roughness: 0.7 }),
    tray: pbr('metal', 0x5c6268, { roughness: 0.9 }),
    led: new THREE.MeshBasicMaterial({ color: 0x9cc8ff }),
    panelOn: new THREE.MeshBasicMaterial({ color: 0xf4f6f8 }),
    panelOff: std(0x9a9c9e, 0.6),
    sky: new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, side: THREE.BackSide, fog: false }),
    simit: pbr('plaster', 0x8f5428, { roughness: 1 }),
    napkin: pbr('paper', 0xf2efe8),
    // The cast
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
    lens: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.12, depthWrite: false }),
  }
}
type Pal = ReturnType<typeof palette>

function arifLook(m: Pal): FigureLook {
  return {
    name: 'Arif',
    build: 'm',
    face: { jaw: 0.3, nose: 0.21, lips: 0.045, stubble: 0.32 },
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

function selinLook(m: Pal): FigureLook {
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

// ——— Shots ———

const SHOTS: Partial<Record<SegmentId, ShotKeys>> = {
  open: [
    [0, [-4.0, 1.75, 3.3, 0, 1.0, -0.6, 40]],
    [1, [-3.7, 1.72, 3.0, 0, 1.0, -0.6, 40]],
  ],
  office: [
    [0, [4.2, 1.66, 2.9, 0, 1.05, -0.9, 42]],
    [1, [3.4, 1.6, 2.2, 0, 1.05, -0.9, 42]],
  ],
  coffee: [
    [0, [-1.8, 1.62, 2.4, -3.6, 1.1, 0.5, 44]],
    [1, [-2.6, 1.6, 2.0, -4.4, 1.15, 0.45, 42]],
  ],
  coffee2: [
    [0, [-3.55, 1.6, 1.75, -4.6, 1.22, 0.45, 36]],
    [1, [-3.4, 1.6, 1.85, -4.4, 1.2, 0.45, 36]],
  ],
  desk: [
    [0, [0.75, 1.5, 1.35, 0, 1.1, -0.85, 40]],
    [1, [0.45, 1.42, 0.85, 0, 1.12, -0.85, 38]],
  ],
  query1: [
    [0, [0.52, 1.4, 0.44, 0, 1.1, -0.86, 38]],
    [1, [0.47, 1.38, 0.38, 0, 1.1, -0.86, 37]],
  ],
  log: [
    [0, [1.0, 1.36, 0.45, 0.35, 1.1, -0.8, 38]],
    [1, [0.9, 1.34, 0.35, 0.3, 1.1, -0.8, 36]],
  ],
  test: [
    [0, [0.12, 1.17, -0.3, 0, 1.115, -0.86, 40]],
    [1, [0.1, 1.16, -0.36, 0, 1.115, -0.86, 39]],
  ],
  small: [
    [0, [1.5, 1.32, -0.05, 0, 1.1, 0.05, 38]],
    [1, [1.4, 1.3, 0.1, 0, 1.1, 0.05, 36]],
  ],
  pen: [
    [0, [-1.0, 1.0, 0.75, -0.3, 0.78, -0.2, 36]],
    [1, [-0.95, 0.95, 0.7, -0.3, 0.74, -0.18, 34]],
  ],
  drop: [
    [0, [-1.05, 0.42, 1.0, -0.27, 0.15, 0.0, 38]],
    [1, [-0.9, 0.36, 0.9, -0.27, 0.05, 0.03, 36]],
  ],
  routine: [
    [0, [3.9, 2.25, 3.45, 0, 1.0, -0.4, 40]],
    [1, [3.7, 2.2, 3.3, 0, 1.0, -0.4, 40]],
  ],
  ask: [
    [0, [0.86, 1.3, -0.52, 0, 1.18, 0.1, 40]],
    [1, [0.8, 1.29, -0.5, 0, 1.18, 0.1, 38]],
  ],
  me: [
    [0, [0.86, 1.3, -0.52, 0, 1.18, 0.1, 40]],
    [1, [0.8, 1.29, -0.5, 0, 1.18, 0.1, 38]],
  ],
  cup: [
    [0, [0.9, 1.02, 0.12, 0.46, 0.8, -0.36, 32]],
    [1, [0.85, 0.98, 0.05, 0.46, 0.8, -0.36, 30]],
  ],
  cupChoice: [
    [0, [1.65, 1.62, 1.45, 0.2, 0.9, -0.4, 40]],
    [1, [1.55, 1.6, 1.35, 0.2, 0.9, -0.4, 40]],
  ],
  wait13: [
    [0, [0.44, 1.36, 0.34, 0, 1.11, -0.86, 36]],
    [1, [0.4, 1.35, 0.3, 0, 1.11, -0.86, 35]],
  ],
  selinQuery: [
    [0, [0.52, 1.4, 0.44, 0, 1.1, -0.86, 38]],
    [1, [0.47, 1.38, 0.38, 0, 1.1, -0.86, 37]],
  ],
  late: [
    [0, [3.3, 1.42, 2.6, 2.6, 1.05, 1.2, 40]],
    [1, [3.2, 1.4, 2.5, 2.6, 1.05, 1.2, 38]],
  ],
  wrong: [
    [0, [0.52, 1.4, 0.44, 0, 1.1, -0.86, 38]],
    [1, [0.47, 1.38, 0.38, 0, 1.1, -0.86, 37]],
  ],
  calc: [
    [0, [0.86, 1.3, -0.52, 0, 1.18, 0.1, 40]],
    [1, [0.8, 1.29, -0.5, 0, 1.18, 0.1, 38]],
  ],
  particle: [
    [0, [3.9, 1.62, -0.6, 2.6, 1.5, -3.55, 40]],
    [1, [3.7, 1.6, -0.9, 2.6, 1.5, -3.55, 40]],
  ],
  cloud: [
    [0, [3.05, 1.56, -1.55, 2.6, 1.55, -3.55, 36]],
    [1, [2.95, 1.55, -1.75, 2.6, 1.55, -3.55, 34]],
  ],
  chaosQuery: [
    [0, [1.35, 1.52, -2.15, 2.6, 1.42, -2.8, 36]],
    [1, [1.3, 1.5, -2.2, 2.6, 1.42, -2.8, 35]],
  ],
  chain: [
    [0, [3.7, 1.62, -1.1, 2.6, 1.5, -3.55, 44]],
    [1, [3.5, 1.6, -1.3, 2.6, 1.5, -3.55, 42]],
  ],
  some: [
    [0, [2.25, 1.55, -3.25, 2.5, 1.6, -2.45, 32]],
    [1, [2.25, 1.55, -3.2, 2.5, 1.6, -2.45, 30]],
  ],
  knowing: [
    [0, [0.75, 1.5, -1.75, 2.4, 1.42, -3.2, 40]],
    [1, [0.9, 1.5, -1.7, 2.4, 1.42, -3.2, 38]],
  ],
  asking: [
    [0, [-1.65, 1.5, 1.45, 0, 1.1, -0.4, 40]],
    [1, [-1.45, 1.48, 1.25, 0, 1.1, -0.4, 38]],
  ],
  before: [
    [0, [0.86, 1.3, -0.52, 0, 1.18, 0.1, 40]],
    [1, [0.8, 1.29, -0.5, 0, 1.18, 0.1, 38]],
  ],
  selfref: [
    [0, [0.45, 1.33, 0.56, 0, 1.12, -0.85, 36]],
    [1, [0.4, 1.31, 0.5, 0, 1.12, -0.85, 35]],
  ],
  because: [
    [0, [-1.25, 1.42, 1.25, 0, 1.1, -0.2, 38]],
    [1, [-1.15, 1.4, 1.1, 0, 1.1, -0.2, 37]],
  ],
  hall: [
    [0, [-1.0, 1.65, -8.6, -3.1, 1.2, -4.0, 46]],
    [1, [-1.1, 1.62, -8.7, 0.3, 1.3, -7.3, 44]],
  ],
  inside: [
    [0, [2.45, 1.56, -7.0, 0.6, 1.45, -7.6, 40]],
    [1, [2.35, 1.55, -7.05, 0.6, 1.5, -7.7, 38]],
  ],
  future: [
    [0, [-2.4, 1.62, -7.0, -4.6, 1.3, -7.2, 38]],
    [1, [-2.6, 1.6, -7.05, -4.6, 1.3, -7.2, 37]],
  ],
  depth: [
    [0, [-3.5, 1.62, -6.62, -4.72, 1.28, -7.2, 36]],
    [1, [-3.55, 1.6, -6.66, -4.72, 1.28, -7.2, 34]],
  ],
  you: [
    [0, [-4.65, 1.6, -6.2, -4.15, 1.5, -7.2, 38]],
    [1, [-4.65, 1.59, -6.3, -4.15, 1.52, -7.2, 35]],
  ],
  t0312: [
    [0, [2.6, 1.9, -7.1, -4.2, 1.3, -7.2, 40]],
    [1, [1.8, 1.8, -7.15, -4.2, 1.3, -7.2, 38]],
  ],
  phone: [
    [0, [0.62, 1.06, 0.16, 0.28, 0.77, -0.32, 30]],
    [1, [0.58, 1.03, 0.1, 0.28, 0.77, -0.32, 28]],
  ],
  homeQuery: [
    [0, [0.52, 1.4, 0.44, 0, 1.1, -0.86, 38]],
    [1, [0.47, 1.38, 0.38, 0, 1.1, -0.86, 37]],
  ],
  wantKnow: [
    [0, [0.86, 1.3, -0.52, 0, 1.18, 0.1, 40]],
    [1, [0.8, 1.29, -0.5, 0, 1.18, 0.1, 38]],
  ],
  archive: [
    [0, [0.52, 1.4, 0.44, 0, 1.1, -0.86, 38]],
    [1, [0.47, 1.38, 0.38, 0, 1.1, -0.86, 37]],
  ],
  record: [
    [0, [0.12, 1.17, -0.3, 0, 1.115, -0.86, 40]],
    [1, [0.1, 1.16, -0.36, 0, 1.115, -0.86, 39]],
  ],
  record2: [
    [0, [0.05, 1.14, -0.44, 0, 1.115, -0.86, 40]],
    [1, [0.04, 1.14, -0.48, 0, 1.115, -0.86, 40]],
  ],
  pending: [
    [0, [0.05, 1.14, -0.44, 0, 1.115, -0.86, 40]],
    [1, [0.04, 1.14, -0.48, 0, 1.115, -0.86, 40]],
  ],
  count: [
    [0, [0.52, 1.4, 0.44, 0, 1.1, -0.86, 38]],
    [1, [0.47, 1.38, 0.38, 0, 1.1, -0.86, 37]],
  ],
  questions: [
    [0, [-1.45, 1.62, 1.65, 0, 1.1, -0.6, 40]],
    [1, [-1.3, 1.6, 1.5, 0, 1.1, -0.6, 40]],
  ],
  leaving: [
    [0, [0.6, 1.55, 1.2, 3.0, 1.2, 3.6, 40]],
    [1, [0.8, 1.55, 1.4, 2.6, 1.3, 4.2, 40]],
  ],
  empty: [[0, [0, 1.2, 0.16, 0, 1.12, -0.85, 46]]],
  observer2: [[0, [0, 1.2, 0.16, 0, 1.12, -0.85, 46]]],
  finalQuery: [[0, [0, 1.2, 0.16, 0, 1.12, -0.85, 46]]],
  accepted: [[0, [0, 1.2, 0.16, 0, 1.12, -0.85, 46]]],
  end: [[0, [0, 1.2, 0.16, 0, 1.12, -0.85, 46]]],
}

type CupWay = 'kitchen' | 'drawer' | 'wait'
const cupWay = (flags: ReadonlySet<string>): CupWay => (flags.has('cup:kitchen') ? 'kitchen' : flags.has('cup:drawer') ? 'drawer' : 'wait')

/** The option the reader picked at a gate (for the screens), or null. */
function picked(flags: ReadonlySet<string>, gate: string) {
  const g = CHOICES.find((c) => c.id === gate)
  return g?.options.find((o) => o.sets?.some((f) => flags.has(f))) ?? null
}

class TekerrurDirector implements SetDirector {
  private pal = palette()
  private arif!: Actor
  private selin!: Actor
  private main!: ReturnType<typeof canvasPlane>
  private left!: ReturnType<typeof canvasPlane>
  private right!: ReturnType<typeof canvasPlane>
  private wall!: ReturnType<typeof canvasPlane>
  private selinScreen!: ReturnType<typeof canvasPlane>
  private hallScreen!: ReturnType<typeof canvasPlane>
  private phoneScreen!: ReturnType<typeof canvasPlane>
  private clock!: ReturnType<typeof wallClock>
  private mug = new THREE.Group()
  private pen!: THREE.Mesh
  private tea = new THREE.Group()
  private shards!: THREE.InstancedMesh
  private puddle!: THREE.Mesh
  private coat = new THREE.Group()
  private cupDoor = new THREE.Group()
  private simit = new THREE.Group()
  private drawerFront!: THREE.Mesh
  private chair!: THREE.Group
  private lamp!: THREE.SpotLight
  private glowMain!: THREE.PointLight
  private glowWall!: THREE.PointLight
  private hallLights: THREE.PointLight[] = []
  private corridorLight!: THREE.PointLight
  private kitchenLight!: THREE.PointLight
  private coffeeLed!: THREE.Mesh
  private rackLeds: THREE.InstancedMesh[] = []
  private v = new THREE.Vector3()
  private way: CupWay = 'wait'

  build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.pal
    const hw = hardware()
    scene.environment = ctx.environment
    scene.environmentIntensity = 0.05
    scene.background = new THREE.Color(0x05070a)
    scene.fog = new THREE.FogExp2(0x070a0e, 0.008)

    // ——— The office ———
    const office = room({
      w: 10,
      d: 8,
      h: 3.0,
      wall: m.wall,
      floor: m.floor,
      ceiling: m.ceiling,
      trim: m.trim,
      skip: ['n'],
      openings: [
        { side: 'e', at: -2.3, width: 1.7, height: 1.6, bottom: 0.9 },
        { side: 'e', at: 0, width: 1.7, height: 1.6, bottom: 0.9 },
        { side: 'e', at: 2.3, width: 1.7, height: 1.6, bottom: 0.9 },
        { side: 's', at: DOOR.x, width: 1.0, height: 2.1 },
      ],
    })
    scene.add(office)
    // The glass partition onto the server hall, with its door.
    for (let i = 0; i <= 8; i++) {
      const x = -5 + i * 1.25
      rbox(0.06, 3.0, 0.08, m.frame, x, 1.5, -4.0, scene, 0.01)
    }
    rbox(10, 0.08, 0.1, m.frame, 0, 2.98, -4.0, scene, 0.01)
    rbox(10, 0.1, 0.1, m.frame, 0, 0.05, -4.0, scene, 0.01)
    rbox(10, 0.04, 0.06, m.frame, 0, 2.2, -4.0, scene, 0.01)
    for (let i = 0; i < 8; i++) {
      if (i === 1) continue
      const pane = mesh(new THREE.PlaneGeometry(1.19, 2.88), m.glass, -5 + 0.625 + i * 1.25, 1.5, -4.0, scene)
      pane.userData.noAO = true
    }
    // The glass door to the hall (x −3.75 … −3.75+1.25), a handle bar.
    mesh(new THREE.PlaneGeometry(1.0, 2.1), m.glass, -3.125, 1.05, -3.99, scene)
    rbox(0.03, 0.6, 0.03, hw.chrome, -2.75, 1.05, -3.93, scene, 0.012)
    // Windows: frames, glass, blinds, sills, radiators.
    for (const z of [-2.3, 0, 2.3]) {
      const g = new THREE.Group()
      g.position.set(5, 0, z)
      g.rotation.y = -PI / 2
      scene.add(g)
      rbox(1.7, 0.06, 0.08, m.frame, 0, 0.93, -0.02, g, 0.01)
      rbox(1.7, 0.06, 0.08, m.frame, 0, 2.47, -0.02, g, 0.01)
      rbox(0.05, 1.6, 0.08, m.frame, 0, 1.7, -0.02, g, 0.01)
      mesh(new THREE.PlaneGeometry(1.66, 1.56), m.glass, 0, 1.7, -0.03, g)
      const bl = blinds(1.62, 1.5, m.blindsMat)
      bl.group.position.set(0, 1.75, 0.08)
      bl.set(z === 0 ? 0.65 : 0.35)
      g.add(bl.group)
      const rad = radiator(1.2, m.radiatorMat)
      rad.position.set(0, 0, 0.12)
      g.add(rad)
    }
    // Ceiling panels: most of them off at this hour.
    for (const [x, z, on] of [
      [-2.5, -2, false],
      [2.5, -2, false],
      [-2.5, 2, true],
      [2.5, 2, false],
    ] as const) {
      const panelLight = ceilingPanel(0.6, 0.6, on ? m.panelOn : m.panelOff)
      panelLight.position.set(x, 3.0, z)
      scene.add(panelLight)
    }
    // Sockets and a cable run along the skirting.
    for (const [x, z, r] of [
      [-0.8, 3.97, PI],
      [4.97, 1.4, -PI / 2],
      [-4.97, -0.8, PI / 2],
    ] as const) {
      const s = socket()
      s.position.set(x, 0.32, z)
      s.rotation.y = r
      scene.add(s)
    }

    // ——— Arif's desk ———
    const d = desk(1.8, 0.8, m.deskTop, m.deskBody)
    d.position.set(DESK.x, 0, DESK.z)
    d.rotation.y = PI
    scene.add(d)
    // The drawer that can be locked: its front, which slides.
    this.drawerFront = rbox(0.4, 0.19, 0.018, m.deskBody, DESK.x - 0.66, 0.12 + 0.095, DESK.z + 0.39, scene, 0.003)
    this.chair = officeChair(m.chair, m.metal)
    this.chair.position.set(SEAT.x, 0, SEAT.z + 0.05)
    this.chair.rotation.y = PI
    scene.add(this.chair)
    const screenMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff })
    const monMain = monitor(m.frame, screenMat(), 0.6, 0.34)
    monMain.group.position.set(0, 0.74 + 0.205 + 0.17, -0.86)
    scene.add(monMain.group)
    const monL = monitor(m.frame, screenMat(), 0.5, 0.3)
    monL.group.position.set(-0.66, 0.74 + 0.205 + 0.15, -0.76)
    monL.group.rotation.y = 0.45
    scene.add(monL.group)
    const monR = monitor(m.frame, screenMat(), 0.5, 0.3)
    monR.group.position.set(0.66, 0.74 + 0.205 + 0.15, -0.76)
    monR.group.rotation.y = -0.45
    scene.add(monR.group)
    this.main = canvasPlane(0.6, 0.34, 1024, () => {}, { emissive: true })
    this.main.mesh.position.set(0, 0, 0.002)
    monMain.group.add(this.main.mesh)
    this.left = canvasPlane(0.5, 0.3, 768, () => {}, { emissive: true })
    this.left.mesh.position.set(0, 0, 0.002)
    monL.group.add(this.left.mesh)
    this.right = canvasPlane(0.5, 0.3, 768, () => {}, { emissive: true })
    this.right.mesh.position.set(0, 0, 0.002)
    monR.group.add(this.right.mesh)
    const note = canvasPlane(0.07, 0.07, 128, S.drawNote)
    note.mesh.position.set(0.27, 0.15, 0.003)
    note.mesh.rotation.z = -0.08
    monMain.group.add(note.mesh)
    const kb = keyboard()
    kb.position.set(0, 0.754, -0.44)
    kb.rotation.y = PI
    scene.add(kb)
    const ms = mouse()
    ms.position.set(-0.36, 0.754, -0.42)
    scene.add(ms)
    const lamp = deskLamp(m.metal, m.dark)
    lamp.group.position.set(-0.78, 0.74, -0.85)
    lamp.group.rotation.y = 0.5
    scene.add(lamp.group)
    const rep = papers(6, 3)
    rep.position.set(-0.36, 0.754, -0.46)
    scene.add(rep)
    const bd = binder(m.bookB)
    bd.position.set(0.82, 0.754, -0.88)
    bd.rotation.y = PI / 2 + 0.1
    scene.add(bd)
    const ph = phone(m.dark, screenMat())
    ph.group.position.set(0.28, 0.754, -0.3)
    ph.group.rotation.y = 0.25
    scene.add(ph.group)
    this.phoneScreen = canvasPlane(0.066, 0.145, 256, () => {}, { emissive: true })
    this.phoneScreen.mesh.rotation.x = -PI / 2
    this.phoneScreen.mesh.position.y = 0.0086
    ph.group.add(this.phoneScreen.mesh)
    const tower = pcTower(m.dark)
    tower.position.set(0.5, 0, -0.78)
    tower.rotation.y = PI
    scene.add(tower)
    const b = bin(m.dark)
    b.position.set(1.15, 0, -0.72)
    scene.add(b)
    tube(
      [
        [0.4, 0.74, -0.95],
        [0.35, 0.4, -0.98],
        [0.2, 0.02, -1.0],
        [-0.6, 0.02, -1.1],
        [-0.8, 0.3, 3.95],
      ],
      0.008,
      m.dark,
      scene,
      48,
    )
    // The mug, the pen.
    this.mug = mug(m.mug, m.coffee)
    scene.add(this.mug)
    this.pen = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 10), m.pen, 0, 0, 0, scene)
    this.pen.castShadow = true

    // ——— Selin's desk by the windows ———
    const sd = desk(1.4, 0.7, m.deskTop, m.deskBody)
    sd.position.set(SELIN_DESK.x, 0, SELIN_DESK.z)
    sd.rotation.y = -PI / 2
    scene.add(sd)
    const sc = officeChair(m.chair, m.metal)
    sc.position.set(SELIN_DESK.x - 0.62, 0, SELIN_DESK.z)
    sc.rotation.y = PI / 2
    scene.add(sc)
    const monS = monitor(m.frame, screenMat(), 0.5, 0.3)
    monS.group.position.set(SELIN_DESK.x + 0.22, 0.74 + 0.205 + 0.15, SELIN_DESK.z)
    monS.group.rotation.y = -PI / 2
    scene.add(monS.group)
    this.selinScreen = canvasPlane(0.5, 0.3, 512, () => {}, { emissive: true })
    this.selinScreen.mesh.position.z = 0.002
    monS.group.add(this.selinScreen.mesh)
    // A partition behind, with a drawing pinned on it.
    rbox(0.04, 1.4, 1.5, m.chair, SELIN_DESK.x + 0.42, 0.7, SELIN_DESK.z, scene, 0.02)
    const drawing = canvasPlane(0.24, 0.17, 256, S.drawDrawing)
    drawing.mesh.position.set(SELIN_DESK.x + 0.395, 1.22, SELIN_DESK.z - 0.42)
    drawing.mesh.rotation.y = -PI / 2
    scene.add(drawing.mesh)
    const thermo = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 20), m.metal, SELIN_DESK.x + 0.1, 0.87, SELIN_DESK.z + 0.25, scene)
    thermo.castShadow = true
    // Her simit, on a napkin; half of it is gone by 22.40.
    const ring = new THREE.TorusGeometry(0.052, 0.016, 10, 28, PI * 1.25)
    const sim = mesh(ring, m.simit, 0, 0.016, 0, this.simit)
    sim.rotation.x = -PI / 2
    sim.castShadow = true
    rbox(0.16, 0.002, 0.16, m.napkin, 0, 0.001, 0, this.simit, 0.001)
    this.simit.position.set(SELIN_DESK.x - 0.1, 0.754, SELIN_DESK.z - 0.3)
    this.simit.rotation.y = 0.6
    scene.add(this.simit)
    const pl = plant(m.pot, m.leaf, 0.9, 12)
    pl.position.set(4.45, 0, -1.2)
    scene.add(pl)

    // ——— The big display on its stand ———
    const disp = new THREE.Group()
    disp.position.copy(DISPLAY)
    scene.add(disp)
    rbox(2.34, 1.36, 0.06, m.frame, 0, 0, -0.035, disp, 0.01)
    this.wall = canvasPlane(2.24, 1.26, 1024, () => {}, { emissive: true })
    this.wall.mesh.position.z = 0.002
    disp.add(this.wall.mesh)
    for (const sx of [-0.8, 0.8]) {
      rbox(0.06, DISPLAY.y - 0.6, 0.06, m.metal, sx, -(DISPLAY.y - 0.6) / 2 - 0.6 + 0.01, -0.06, disp, 0.01)
      rbox(0.08, 0.04, 0.6, m.metal, sx, -DISPLAY.y + 0.02, -0.06, disp, 0.01)
    }

    // ——— Coffee corner (west) ———
    const ctr = counter(2.2, 0.62, 0.92, m.counterTop, m.cabinet)
    ctr.position.set(-4.69, 0, 0.3)
    ctr.rotation.y = PI / 2
    scene.add(ctr)
    const cm = coffeeMachine(m.coffeeBody, m.jugGlass, m.coffee)
    cm.group.position.copy(COFFEE)
    cm.group.rotation.y = PI / 2
    scene.add(cm.group)
    this.coffeeLed = cm.led
    for (const [z, mat] of [
      [-0.2, m.mug],
      [-0.33, m.saucer],
    ] as const) {
      const mm = mug(mat)
      mm.position.set(-4.75, 0.92, z)
      scene.add(mm)
    }
    rbox(0.62, 0.86, 0.6, m.fridge, -4.68, 0.43, -1.25, scene, 0.02)
    rbox(0.02, 0.3, 0.02, hw.chrome, -4.36, 0.62, -1.0, scene, 0.008)
    const pr = printer(m.fridge)
    pr.position.set(-4.62, 0.72, 2.7)
    pr.rotation.y = PI / 2
    scene.add(pr)
    rbox(0.6, 0.72, 0.6, m.cabinet, -4.68, 0.36, 2.7, scene, 0.01)
    const sh = shelf(1.2, 1.8, 0.32, m.shelfWood, [m.book, m.bookB, m.bookC], 21)
    sh.position.set(-4.82, 0, -2.7)
    sh.rotation.y = PI / 2
    scene.add(sh)

    // ——— South wall: whiteboard, the stopped clock, the coat rack ———
    const wb = whiteboard(2.3, 1.15, m.metal, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }))
    wb.group.position.set(-1.6, 1.55, 3.985)
    wb.group.rotation.y = PI
    scene.add(wb.group)
    const board = canvasPlane(2.3, 1.15, 1024, S.drawBoard)
    board.mesh.position.z = 0.012
    wb.group.add(board.mesh)
    this.clock = wallClock(m.metal, new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.6 }), m.dark)
    this.clock.group.position.set(0.6, 2.35, 3.98)
    this.clock.group.rotation.y = PI
    scene.add(this.clock.group)
    const rack = new THREE.Group()
    rack.position.set(COAT_RACK.x, 0, COAT_RACK.z)
    scene.add(rack)
    mesh(new THREE.CylinderGeometry(0.02, 0.025, 1.8, 12), m.metal, 0, 0.9, 0, rack)
    mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.025, 24), m.metal, 0, 0.012, 0, rack)
    for (let i = 0; i < 4; i++) {
      const hook = rbox(0.18, 0.015, 0.015, m.metal, 0, 1.75, 0, rack, 0.006)
      hook.rotation.y = (i * PI) / 2
    }
    // Arif's coat, hanging; it leaves with him.
    // Arif's coat on a hanger: shoulders, a body that widens to the hem,
    // sleeves hanging at its sides, a turned-down collar, the front opening.
    tube(
      [
        [-0.2, -0.1, 0],
        [0, -0.04, 0],
        [0.2, -0.1, 0],
      ],
      0.006,
      hw.chrome,
      this.coat,
      12,
    )
    tube(
      [
        [0, -0.04, 0],
        [0, 0.01, 0],
        [0.03, 0.04, 0],
        [0.01, 0.06, 0],
      ],
      0.003,
      hw.chrome,
      this.coat,
      12,
    )
    rbox(0.42, 0.07, 0.13, m.coat, 0, -0.11, 0, this.coat, 0.03)
    const coatBody = new THREE.CylinderGeometry(0.19, 0.25, 0.92, 28, 4)
    coatBody.scale(1, 1, 0.34)
    mesh(coatBody, m.coat, 0, -0.6, 0, this.coat).castShadow = true
    for (const sx of [-1, 1]) {
      const sleeve = mesh(new THREE.CapsuleGeometry(0.048, 0.5, 4, 12), m.coat, sx * 0.205, -0.42, 0.012, this.coat)
      sleeve.scale.z = 0.8
      sleeve.rotation.z = sx * 0.06
      sleeve.castShadow = true
    }
    const coatCollar = mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 24, PI * 1.4), m.coat, 0, -0.09, 0.01, this.coat)
    coatCollar.rotation.set(PI / 2, 0, -PI * 0.2)
    coatCollar.scale.set(1, 0.55, 1)
    rbox(0.012, 0.84, 0.01, m.dark, 0, -0.58, 0.086, this.coat, 0.004)
    scene.add(this.coat)
    const bag = rbox(0.38, 0.28, 0.1, m.bag, 0.0, 0.14, 0.2, rack, 0.03)
    bag.rotation.y = 0.4

    // ——— The server hall ———
    const hall = room({ w: 10, d: 7.8, h: 3.3, z: -8.05, wall: m.wallHall, floor: m.hallFloor, ceiling: m.wallHall, trim: null, skip: ['s'] })
    scene.add(hall)
    const rand = mulberry32(42)
    for (const z of [-6.0, -8.4, -10.8])
      for (let i = 0; i < 6; i++) {
        const r = serverRack(m.rack, Math.floor(rand() * 1000))
        r.position.set(RACK_X[i], 0, z)
        scene.add(r)
        r.traverse((o) => {
          if ((o as THREE.InstancedMesh).isInstancedMesh && o.userData.blink) this.rackLeds.push(o as THREE.InstancedMesh)
        })
      }
    // Cable trays overhead, a cooling unit, a console on the west wall.
    for (const z of [-6.0, -8.4, -10.8]) rbox(5.0, 0.06, 0.4, m.tray, 0, 2.55, z, scene, 0.01)
    rbox(0.9, 2.0, 1.6, m.fridge, -4.5, 1.0, -10.4, scene, 0.03)
    for (let i = 0; i < 6; i++) rbox(0.02, 1.5, 0.02, m.dark, -4.04, 1.1, -10.9 + i * 0.2, scene, 0.005)
    const label = canvasPlane(0.22, 0.06, 256, (c, W, H) => {
      c.fillStyle = '#e8e2d2'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#1a1a1a'
      c.font = `600 ${Math.round(H * 0.5)}px monospace`
      c.fillText('ÖZ-MODEL · KATMAN 7', 8, H * 0.68)
    })
    label.mesh.position.set(SELF_RACK.x, 1.95, SELF_RACK.z + 0.515)
    scene.add(label.mesh)
    const con = monitor(m.frame, screenMat(), 0.56, 0.34)
    con.group.position.copy(CONSOLE)
    con.group.rotation.y = PI / 2
    scene.add(con.group)
    rbox(0.5, 1.0, 0.5, m.rack, -4.72, 0.5, -7.2, scene, 0.02)
    this.hallScreen = canvasPlane(0.56, 0.34, 768, () => {}, { emissive: true })
    this.hallScreen.mesh.position.z = 0.002
    con.group.add(this.hallScreen.mesh)

    // ——— Corridor and kitchen ———
    const corridor = room({ w: 16, d: 2.4, h: 2.8, z: 5.35, wall: m.wall, floor: m.corridorFloor, ceiling: m.ceiling, trim: m.trim, skip: ['n'], openings: [{ side: 's', at: -2.2, width: 1.0, height: 2.1 }] })
    scene.add(corridor)
    const kitchen = room({ w: 4, d: 3.2, h: 2.8, x: -2.2, z: 8.3, wall: m.wall, floor: m.corridorFloor, ceiling: m.ceiling, trim: m.trim, skip: ['n'] })
    scene.add(kitchen)
    const kc = counter(2.4, 0.62, 0.92, m.counterTop, m.cabinet)
    kc.position.set(-2.2, 0, 9.55)
    kc.rotation.y = PI
    scene.add(kc)
    // Wall cupboards: a carcass and four doors; the second one opens for the cup.
    rbox(2.4, 0.7, 0.33, m.cabinet, -2.2, 1.9, 9.735, scene, 0.008)
    for (let i = 0; i < 4; i++) {
      const x0 = -3.4 + i * 0.6
      const door = new THREE.Group()
      door.position.set(x0 + 0.003, 1.9, 9.565)
      scene.add(door)
      rbox(0.594, 0.69, 0.02, m.cabinet, 0.297, 0, 0, door, 0.004)
      rbox(0.012, 0.16, 0.02, hw.chrome, 0.55, -0.2, -0.018, door, 0.005)
      if (i === 1) this.cupDoor = door
    }
    const shelfIn = rbox(1.15, 0.015, 0.28, m.cabinet, -2.6, 1.9, 9.74, scene, 0.003)
    shelfIn.receiveShadow = true
    for (let i = 0; i < 3; i++) {
      const cup = mug(m.mug)
      cup.position.set(-2.95 + i * 0.13, 1.908, 9.72)
      scene.add(cup)
    }
    // The sink: a steel basin set into the worktop, a swan-neck tap.
    rbox(0.52, 0.012, 0.42, hw.steel, -2.6, 0.926, 9.55, scene, 0.004)
    rbox(0.44, 0.004, 0.34, m.dark, -2.6, 0.931, 9.55, scene, 0.002)
    tube(
      [
        [-2.6, 0.93, 9.8],
        [-2.6, 1.15, 9.79],
        [-2.6, 1.22, 9.7],
        [-2.6, 1.14, 9.6],
      ],
      0.011,
      hw.chrome,
      scene,
      24,
    )

    // ——— Outside: Ankara at night, three floors down ———
    const skyGeo = new THREE.SphereGeometry(400, 32, 16)
    const sp = skyGeo.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(sp.count * 3)
    const top = new THREE.Color(0x05080d)
    const hor = new THREE.Color(0x2a2a30)
    const tmp = new THREE.Color()
    for (let i = 0; i < sp.count; i++) {
      tmp.copy(hor).lerp(top, Math.pow(Math.max(0, sp.getY(i) / 400), 0.45))
      tmp.toArray(colors, i * 3)
    }
    skyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    mesh(skyGeo, m.sky, 0, 0, 0, scene)
    const ground = mesh(new THREE.PlaneGeometry(600, 600), m.ground, 0, -9.5, 0, scene)
    ground.rotation.x = -PI / 2
    const crand = mulberry32(77)
    for (let i = 0; i < 26; i++) {
      const x = 22 + crand() * 160
      const z = -90 + crand() * 180
      const h = 12 + crand() * 40
      const f = facade({ w: 10 + crand() * 16, h, d: 10, wall: crand() < 0.5 ? m.facade : m.facadeB, facing: -1, seed: 300 + i, lit: 0.18 + crand() * 0.25 })
      f.position.set(x, -9.5, z)
      scene.add(f)
    }

    // ——— Light ———
    scene.add(new THREE.HemisphereLight(0x6f7e92, 0x0d0e10, 0.32))
    this.lamp = new THREE.SpotLight(0xffd9a8, 9, 4, 0.75, 0.6, 1.4)
    this.lamp.position.copy(lamp.bulb).applyMatrix4(lamp.group.matrixWorld.compose(lamp.group.position, lamp.group.quaternion, lamp.group.scale))
    this.lamp.target.position.set(-0.1, 0.75, -0.45)
    this.lamp.castShadow = ctx.quality.shadows
    this.lamp.shadow.mapSize.set(1024, 1024)
    this.lamp.shadow.bias = -0.0005
    this.lamp.shadow.radius = 4
    scene.add(this.lamp, this.lamp.target)
    this.glowMain = new THREE.PointLight(0xb9d0ff, 1.4, 2.6, 1.6)
    this.glowMain.position.set(0, 1.12, -0.6)
    this.glowWall = new THREE.PointLight(0xc8dcff, 0, 5, 1.5)
    this.glowWall.position.set(DISPLAY.x, DISPLAY.y, DISPLAY.z + 0.6)
    scene.add(this.glowMain, this.glowWall)
    const corner = new THREE.PointLight(0xfff0dc, 3.5, 6, 1.6)
    corner.position.set(-2.5, 2.8, 2)
    scene.add(corner)
    for (const [x, z] of [
      [-2, -6.0],
      [2, -8.4],
      [-1, -10.8],
    ] as const) {
      const l = new THREE.PointLight(0x7fa6d8, 6, 7, 1.6)
      l.position.set(x, 2.9, z)
      this.hallLights.push(l)
      scene.add(l)
    }
    this.corridorLight = new THREE.PointLight(0xe8f0ff, 5, 7, 1.6)
    this.corridorLight.position.set(1.5, 2.6, 5.3)
    this.kitchenLight = new THREE.PointLight(0xffe2bd, 0, 5, 1.6)
    this.kitchenLight.position.set(-2.2, 2.6, 8.3)
    scene.add(this.corridorLight, this.kitchenLight)

    // ——— People ———
    const arif = new Figure(arifLook(m))
    const selin = new Figure(selinLook(m))
    scene.add(arif.root, selin.root)
    this.arif = new Actor(arif)
    this.selin = new Actor(selin)

    // Selin's tea: a tulip glass on a saucer, and what it becomes.
    turnedGlass(this.tea, m.teaGlass, m.tea, m.saucer)
    scene.add(this.tea)
    const shardGeo = new THREE.BufferGeometry()
    shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.018, 0, 0.004, 0.006, 0, 0.022], 3))
    shardGeo.computeVertexNormals()
    this.shards = new THREE.InstancedMesh(shardGeo, m.teaGlass, 24)
    this.shards.frustumCulled = false
    const sr = mulberry32(5)
    const sm = new THREE.Matrix4()
    for (let i = 0; i < 24; i++) {
      const a = sr() * PI * 2
      const r = Math.pow(sr(), 0.6) * 0.32
      sm.makeRotationY(sr() * PI * 2).scale(new THREE.Vector3(0.6 + sr(), 1, 0.6 + sr())).setPosition(Math.cos(a) * r, 0.003, Math.sin(a) * r)
      this.shards.setMatrixAt(i, sm)
    }
    scene.add(this.shards)
    const stain = new THREE.Shape()
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * PI * 2
      const r = 0.16 * (1 + 0.22 * Math.sin(3 * a + 1) + 0.12 * Math.sin(5 * a + 2) + 0.06 * Math.sin(11 * a))
      if (i === 0) stain.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      else stain.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    this.puddle = mesh(new THREE.ShapeGeometry(stain, 2), m.puddle, 0, 0.004, 0, scene)
    this.puddle.rotation.x = -PI / 2
    this.puddle.scale.set(1.2, 0.8, 1)
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const p = f.p
    const way = (this.way = cupWay(f.flags))
    const again = f.flags.has('mem:asked')
    const hours = storyHours(p)
    const clock = clockText(hours)

    this.directArif(f, seg, u, way)
    this.directSelin(f, seg, u, way)
    this.props(f, seg, u, way)
    this.screens(f, seg, u, way, clock, hours, again)

    // The stopped clock: 21.13 (21.14 on a second reading); its second hand twitches.
    this.clock.set(again ? 21 + 14 / 60 : 21 + 13 / 60 + (Math.sin(f.time * 9) > 0.96 ? 1 / 3600 : 0))

    // ——— Light ———
    const wallOn = p >= SEG.particle.start && p < SEG.asking.start ? 1 : 0.25
    this.glowWall.intensity = 3.2 * wallOn
    this.lamp.intensity = p >= SEG.empty.start ? 6 : 9
    this.corridorLight.intensity = 5
    this.kitchenLight.intensity = way === 'kitchen' && p >= SEG.act.start && p < SEG.crash.start ? 4 : 0
    this.coffeeLed.visible = p < SEG.desk.end
    // Racks blink: a few LEDs drop out for a frame now and then.
    const blink = Math.floor(f.time * 6)
    this.rackLeds.forEach((im, i) => (im.visible = (blink + i * 7) % 11 !== 0))

    // ——— Camera ———
    this.camera(f, seg, u, way, shot)
  }

  // ——— Arif ———

  private directArif(f: SetFrame, seg: SegmentId, u: number, way: CupWay) {
    const a = this.arif.begin()
    const seated = (pose = P.SIT_TYPE) => a.place(SEAT.x, SEAT.z, PI).hold(pose)
    switch (seg) {
      case 'open':
      case 'office':
        seated()
        break
      case 'coffee':
        if (u < 0.12) seated()
        else a.walk(P_TO_COFFEE, smoothstep(0.12, 0.7, u), P.STAND, PI, -PI / 2)
        if (u > 0.7) a.reach('r', smoothstep(0.75, 0.95, u), COFFEE.x + 0.08, 1.05, COFFEE.z + 0.02, 0.4)
        break
      case 'coffee2':
        if (u < 0.6) a.place(-4.15, 0.5, -PI / 2).hold(P.STAND_EASY).reach('r', 1 - smoothstep(0.3, 0.55, u), COFFEE.x + 0.08, 1.05, COFFEE.z + 0.02, 0.4)
        else a.walk(P_FROM_COFFEE, smoothstep(0.6, 1, u) * 0.6, P.CARRY, -PI / 2, PI)
        break
      case 'desk':
        if (u < 0.4) a.walk(P_FROM_COFFEE, 0.6 + smoothstep(0, 0.4, u) * 0.4, P.CARRY, -PI / 2, PI)
        else a.place(SEAT.x, SEAT.z, PI).blend([
          [0.4, P.STAND],
          [0.55, P.SIT_TYPE],
        ], u)
        break
      case 'query1':
        seated()
        break
      case 'log':
      case 'test':
        seated(P.SIT_LOOK)
        break
      case 'small':
        seated(P.SIT_BACK)
        break
      case 'pen':
        seated(P.SIT_STRAIGHT).reach('r', smoothstep(0.05, 0.25, u), PEN_ON_DESK.x - 0.02, 0.82, PEN_ON_DESK.z + 0.12, 0.3)
        break
      case 'drop':
        seated(P.SIT_STRAIGHT).reach('r', 1 - smoothstep(0.3, 0.6, u), PEN_ON_DESK.x - 0.02, 0.82, PEN_ON_DESK.z + 0.12, 0.3).lookAt(PEN_LAND.x, PEN_LAND.z + 1, 0.3)
        break
      case 'routine':
        seated(P.SIT_READ)
        break
      case 'ask':
      case 'me':
        seated(P.SIT_LOOK)
        break
      case 'cup':
        seated(P.SIT_STILL).lookAt(MUG_ON_DESK.x, MUG_ON_DESK.z, 0.5)
        break
      case 'cupChoice':
        if (u < 0.35 || way === 'wait') seated(P.SIT_STILL)
        else if (way === 'drawer') seated(P.SIT_STRAIGHT).reach('r', Math.sin(PI * smoothstep(0.35, 0.95, u)), DESK.x - 0.6, 0.45, DESK.z + 0.42, 0.6)
        else if (u < 0.6) a.place(SEAT.x, SEAT.z, PI).blend([
          [0.35, P.SIT_STILL],
          [0.5, P.STAND],
        ], u).reach('r', smoothstep(0.45, 0.58, u), MUG_ON_DESK.x - 0.02, 0.84, MUG_ON_DESK.z, 0.5)
        else a.walk(P_TO_DOOR, smoothstep(0.6, 1, u), P.CARRY, PI, PI)
        break
      case 'act':
        if (way === 'kitchen') {
          if (u < 0.55) a.walk(P_TO_KITCHEN, smoothstep(0, 0.55, u), P.CARRY, PI, PI)
          else a.place(-2.6, 8.9, 0).hold(P.STAND).reach('r', Math.sin(PI * smoothstep(0.6, 0.95, u)), -2.5, 1.72, 9.5, 0.4)
        } else seated(P.SIT_STILL)
        break
      case 'wait13':
        if (way === 'kitchen') a.walk(P_BACK, smoothstep(0.05, 1, u), P.STAND, 0, PI)
        else seated(P.SIT_STILL).lookAt(0, -1, 0)
        break
      case 'crash':
        // Face to face in the doorway; both step the same way.
        if (way === 'kitchen') a.place(DOOR.x + 0.18 * smoothstep(0.3, 0.5, u), 4.45 - 0.22 * smoothstep(0, 0.3, u), PI).hold(P.STAND)
        else if (way === 'drawer') a.place(SEAT.x, SEAT.z, PI).blend([
          [0.42, P.SIT_STILL],
          [0.52, P.STAND],
        ], u)
        else seated(P.SIT_STILL).lookAt(0.8, 0.1, smoothstep(0.1, 0.3, u))
        break
      case 'done':
      case 'selin':
        if (way === 'kitchen') a.place(DOOR.x + 0.18, 4.23, PI).hold(P.STAND_EASY).lookAt(DOOR.x + 0.1, 3.6, 0.3)
        else a.place(SEAT.x, SEAT.z, PI + 0.5).hold(seg === 'done' ? P.STAND : P.STAND_EASY).lookAt(0.7, 0.2, 0.6)
        break
      case 'selinQuery':
        seated()
        break
      case 'late':
        a.place(SEAT.x, SEAT.z, PI - 0.9).hold(P.SIT_BACK).lookAt(SELIN_DESK.x - 0.6, SELIN_DESK.z, 0.7)
        break
      case 'wrong':
        seated(P.SIT_LOOK)
        break
      case 'calc':
        seated(P.SIT_STILL)
        break
      case 'particle':
        if (u < 0.3) a.walk(P_TO_DISPLAY, smoothstep(0, 0.3, u), P.STAND, PI, PI)
        else a.place(2.45, -2.45, PI).hold(P.STAND_EASY)
        break
      case 'cloud':
      case 'chaosQuery':
      case 'chain':
        a.place(2.45, -2.45, PI).hold(seg === 'chain' ? P.ARMS_CROSSED : P.STAND_EASY)
        break
      case 'some':
      case 'knowing':
        a.place(2.45, -2.45, PI - 0.2).hold(P.ARMS_CROSSED)
        break
      case 'asking':
      case 'before':
      case 'selfref':
      case 'because':
        seated(seg === 'before' ? P.SIT_STILL : seg === 'selfref' ? P.SIT_TYPE : P.SIT_BACK)
        break
      case 'hall':
        a.walk(P_TO_HALL, smoothstep(0, 1, u), P.STAND, PI, PI)
        break
      case 'inside':
        a.place(SELF_RACK.x, -7.25, PI).hold(P.STAND_EASY)
        break
      case 'future':
        a.walk(P_TO_CONSOLE, smoothstep(0, 0.45, u), P.STAND, -PI / 2, -PI / 2)
        break
      case 'depth':
      case 'you':
      case 't0312':
        a.place(-4.15, -7.2, -PI / 2).hold(seg === 't0312' ? P.STAND : P.STAND_EASY)
        if (seg === 't0312') a.lookAt(0, -7.2, smoothstep(0.6, 0.9, u))
        break
      case 'phone':
        if (u < 0.4) seated(P.SIT_STILL)
        else seated(P.PHONE)
        break
      case 'homeQuery':
        seated()
        break
      case 'wantKnow':
        seated(P.SIT_BACK)
        break
      case 'archive':
      case 'record':
      case 'record2':
      case 'pending':
      case 'count':
        seated(P.SIT_LOOK)
        break
      case 'questions':
        seated(P.SIT_BACK)
        break
      case 'leaving':
        if (u < 0.1) seated(P.SIT_BACK)
        else if (u < 0.42) a.walk(P_TO_RACK, smoothstep(0.1, 0.42, u), P.STAND, PI, 0.6)
        else if (u < 0.55) a.place(COAT_RACK.x - 0.45, COAT_RACK.z - 0.1, 0.9).hold(P.STAND).reach('l', Math.sin(PI * smoothstep(0.42, 0.55, u)), COAT_RACK.x, 1.7, COAT_RACK.z, 0.3)
        else a.walk(P_OUT, smoothstep(0.55, 1, u), P.CARRY, 0.9, -PI / 2)
        break
      default:
        // The room without him.
        a.place(-6, 6, 0).hold(P.STAND)
        a.visible = false
    }
    a.apply(f.time, !f.reduced)
  }

  // ——— Selin ———

  private directSelin(f: SetFrame, seg: SegmentId, u: number, way: CupWay) {
    const s = this.selin.begin()
    const p = f.p
    s.visible = true
    // Early in the evening she is in the hall, at a rack.
    if (p < SEG.cup.start) {
      s.place(RACK_X[1] + Math.sin(f.time * 0.05) * 0.15, -7.3, PI).hold(P.STAND_EASY).reach('r', 0.6 + 0.2 * Math.sin(f.time * 0.6), RACK_X[1], 1.3, -7.88, 0.4)
    } else if (p < SEG.wait13.start + SEG.wait13.len * 0.66) {
      s.visible = false
    } else if (seg === 'wait13') {
      // Footsteps in the corridor: she is on her way, tea in hand.
      const t = smoothstep(0.66, 1, u)
      if (way === 'kitchen') s.walk(P_SELIN_OUT, t * 0.85, P.CARRY, PI / 2, 0)
      else s.walk(P_SELIN_IN, t * 0.45, P.CARRY, -PI / 2, PI)
    } else if (seg === 'crash') {
      if (way === 'kitchen') {
        if (u < 0.3) s.walk(P_SELIN_OUT, 0.85 + 0.15 * smoothstep(0, 0.3, u), P.CARRY, PI / 2, 0)
        else s.place(DOOR.x + 0.18 * smoothstep(0.3, 0.5, u), 3.55, 0).hold(u < 0.5 ? P.CARRY : P.STAND)
      }
      else if (way === 'drawer') {
        if (u < 0.3) s.walk(P_SELIN_IN, 0.45 + 0.55 * smoothstep(0, 0.3, u), P.CARRY, -PI / 2, PI)
        else s.place(0.82, 0.12, -PI / 2 - 0.3).hold(P.CARRY).lookAt(0, -0.85, 0.6)
      } else {
        if (u < 0.25) s.walk(P_SELIN_IN, 0.45 + 0.55 * smoothstep(0, 0.25, u), P.CARRY, -PI / 2, PI)
        else s.place(0.82, 0.12, -PI / 2 - 0.3).blend([
          [0.25, P.CARRY],
          [0.4, P.LEAN_SOFT],
        ], u).reach('r', Math.sin(PI * smoothstep(0.22, 0.45, u)), 0.56, 0.8, -0.22, 0.4)
      }
    } else if (seg === 'done') {
      const at = way === 'kitchen' ? { x: DOOR.x + 0.18, z: 3.55 } : { x: 0.82, z: 0.12 }
      s.place(at.x, at.z, way === 'kitchen' ? 0 : -PI / 2 - 0.3).hold(P.STAND).lookAt(way === 'kitchen' ? at.x + 0.4 : at.x - 0.3, way === 'kitchen' ? at.z + 0.6 : at.z - 0.5, 0.4)
    } else if (seg === 'selin') {
      const at = way === 'kitchen' ? { x: DOOR.x + 0.18, z: 3.6 } : { x: 0.7, z: 0.25 }
      s.place(at.x, at.z, way === 'kitchen' ? 0 : -PI / 2).blend([
        [0.0, P.STAND],
        [0.15, CROUCH],
        [0.85, CROUCH],
        [1.0, P.STAND],
      ], u)
    } else if (seg === 'selinQuery') {
      // Off for a broom, and back.
      const [out, back] = way === 'kitchen' ? P_BROOM.door : P_BROOM.desk
      if (u < 0.3) s.walk(out, smoothstep(0, 0.3, u), P.STAND)
      else if (u < 0.7) s.visible = false
      else s.walk(back, 0.7 * smoothstep(0.7, 1, u), P.STAND)
    } else if (p < SEG.because.end) {
      // At her desk: eating, reading, later asleep over her arms.
      s.place(SELIN_DESK.x - 0.62, SELIN_DESK.z, PI / 2).hold(p >= SEG.asking.start ? P.SIT_SLUMP : p >= SEG.particle.start ? P.SIT_READ : P.SIT_BACK)
      if (seg === 'late') s.lookAt(SEAT.x, SEAT.z, 0.8).reach('r', 0.7 * Math.sin(PI * smoothstep(0.1, 0.5, u)), SELIN_DESK.x - 0.1, 0.8, SELIN_DESK.z - 0.3, 0.3)
    } else if (p < SEG.leaving.start) {
      s.place(SELIN_DESK.x - 0.62, SELIN_DESK.z, PI / 2).hold(P.SIT_SLUMP)
    } else if (seg === 'leaving') {
      // In the corridor, beside the door, on her way somewhere herself.
      s.place(DOOR.x + 0.95, 4.95, -PI * 0.72).hold(P.STAND_EASY).lookAt(this.arif.x, this.arif.z, 0.8)
      s.visible = u > 0.45
    } else s.visible = false
    s.apply(f.time, !f.reduced)
  }

  // ——— Things ———

  private props(f: SetFrame, seg: SegmentId, u: number, way: CupWay) {
    const p = f.p
    const A = this.arif.figure
    // The mug: on the desk, in a hand, in a drawer, in a cupboard.
    const inHand = (seg === 'coffee' && u > 0.12) || seg === 'coffee2' || (seg === 'desk' && u < 0.45) || (way === 'kitchen' && ((seg === 'cupChoice' && u > 0.55) || (seg === 'act' && u < 0.75)))
    const gone = (way === 'drawer' && p >= at('cupChoice', 0.65)) || (way === 'kitchen' && p >= at('act', 0.75))
    this.mug.visible = !gone
    if (inHand) {
      A.rGrip.getWorldPosition(this.v)
      this.mug.position.set(this.v.x, this.v.y - 0.055, this.v.z)
      this.mug.rotation.y = this.arif.yaw + PI / 2
    } else {
      this.mug.position.copy(MUG_ON_DESK)
      this.mug.rotation.y = 0
    }
    this.drawerFront.position.z = DESK.z + 0.39 + (way === 'drawer' && seg === 'cupChoice' ? 0.28 * Math.sin(PI * smoothstep(0.38, 0.95, u)) : 0)

    // The pen: lying, held, falling, lying where it was told to.
    const pen = this.pen
    if (seg === 'pen' && u > 0.22) {
      A.rGrip.getWorldPosition(this.v)
      pen.position.set(this.v.x, this.v.y - 0.06, this.v.z)
      pen.rotation.set(0, 0, 0.1)
    } else if (seg === 'drop') {
      const t = smoothstep(0.02, 0.3, u)
      A.rGrip.getWorldPosition(this.v)
      const start = this.v.clone()
      start.y -= 0.06
      const bounce = Math.abs(Math.sin(t * PI * 3)) * (1 - t) * 0.06
      pen.position.set(lerp(start.x, PEN_LAND.x, t), lerp(start.y, PEN_LAND.y, Math.min(1, t * 1.6)) + bounce, lerp(start.z, PEN_LAND.z, t))
      pen.rotation.set(t * PI * 0.5, 0.3, 0.1 + t * 0.8)
    } else if (f.p >= SEG.drop.end && f.p < SEG.ask.start) {
      pen.position.copy(PEN_LAND)
      pen.rotation.set(PI / 2, 0.3, 0.9)
    } else {
      pen.position.copy(PEN_ON_DESK)
      pen.rotation.set(PI / 2, 0, 1.2)
    }

    // The tea glass, until it falls; then glass on the floor, tea spreading.
    const S_ = this.selin.figure
    const fallAt = way === 'kitchen' ? 0.5 : way === 'drawer' ? 0.55 : 0.55
    const where = way === 'kitchen' ? new THREE.Vector3(DOOR.x + 0.16, 0, 3.9) : new THREE.Vector3(0.62, 0, 0.0)
    const carried = (seg === 'wait13' && u > 0.66) || (seg === 'crash' && u < fallAt - 0.06 && !(way === 'wait' && u > 0.3))
    const onDesk = way === 'wait' && seg === 'crash' && u >= 0.3 && u < fallAt - 0.04
    const falling = seg === 'crash' && u >= fallAt - 0.06 && u < fallAt
    const broken = (seg === 'crash' && u >= fallAt) || seg === 'done' || seg === 'selin' || (seg === 'selinQuery' && u < 0.75)
    this.tea.visible = carried || onDesk || falling
    if (carried) {
      S_.rGrip.getWorldPosition(this.v)
      this.tea.position.set(this.v.x, this.v.y - 0.02, this.v.z)
    } else if (onDesk) this.tea.position.set(0.56 + 0.06 * smoothstep(0.4, fallAt - 0.04, u), 0.754, -0.2 + 0.12 * smoothstep(0.4, fallAt - 0.04, u))
    else if (falling) {
      const t = (u - (fallAt - 0.06)) / 0.06
      const from = way === 'wait' ? new THREE.Vector3(0.62, 0.754, -0.08) : new THREE.Vector3(where.x, 1.0, where.z)
      this.tea.position.set(lerp(from.x, where.x, t), lerp(from.y, 0.02, t * t), lerp(from.z, where.z, t))
      this.tea.rotation.set(t * 1.4, 0, t * 0.8)
    }
    if (!falling) this.tea.rotation.set(0, 0, 0)
    this.shards.visible = broken
    this.puddle.visible = broken
    this.shards.position.copy(where)
    this.puddle.position.set(where.x + 0.05, 0.004, where.z)
    const spread = seg === 'crash' ? smoothstep(fallAt, fallAt + 0.3, u) : 1
    this.puddle.scale.set(0.3 + spread, 0.25 + spread * 0.6, 1)

    // The coat: on the rack until he takes it.
    if (seg === 'leaving' && u >= 0.5) {
      A.lGrip.getWorldPosition(this.v)
      this.coat.position.set(this.v.x, this.v.y + 0.05, this.v.z)
      this.coat.rotation.set(0, this.arif.yaw, 0.15)
    } else {
      this.coat.position.set(COAT_RACK.x + 0.12, 1.74, COAT_RACK.z)
      this.coat.rotation.set(0, 0.3, 0)
    }
    this.coat.visible = !(f.p >= SEG.leaving.end)
    this.cupDoor.rotation.y = way === 'kitchen' && seg === 'act' ? 1.6 * Math.sin(PI * smoothstep(0.55, 0.95, u)) : 0
    this.simit.visible = p >= SEG.selinQuery.end && p < SEG.particle.start
    // The chair swivels a little when he gets up, and stays that way.
    this.chair.rotation.y = PI + (f.p >= at('leaving', 0.1) ? 0.6 : 0)
  }

  // ——— Screens ———

  private screens(f: SetFrame, seg: SegmentId, u: number, way: CupWay, clock: string, hours: number, again: boolean) {
    const p = f.p
    const t = f.time
    const tick = (hz: number) => Math.floor(t * hz)
    const q = (gate: string) => picked(f.flags, gate)
    const query = (gate: string, title?: string) => {
      const o = q(gate)
      this.main.redraw((c, W, H) => S.drawQuery(c, W, H, { clock, title, question: o?.label ?? null, answer: o?.reply ?? [], t }), `q-${gate}-${o?.id ?? tick(2)}-${clock}`)
    }
    // Main monitor.
    switch (seg) {
      case 'query1':
        query('query1')
        break
      case 'log':
      case 'test': {
        const counted = seg === 'log' ? 0 : Math.round(212 * smoothstep(0.05, 0.5, u))
        this.main.redraw((c, W, H) => S.drawPrediction(c, W, H, { clock, t, counted }), `pred-${counted}-${clock}`)
        break
      }
      case 'pen':
        if (u < 0.3) query('pen')
        else this.main.redraw((c, W, H) => S.drawPen(c, W, H, { clock, landed: false }), `pen-0-${clock}`)
        break
      case 'drop':
        this.main.redraw((c, W, H) => S.drawPen(c, W, H, { clock, landed: u > 0.35 }), `pen-${u > 0.35}-${clock}`)
        break
      case 'cup':
      case 'cupChoice':
      case 'act': {
        const prog = clamp((hours - (21 + 4 / 60)) / (9 / 60 + 4 / 3600))
        this.main.redraw((c, W, H) => S.drawBehavior(c, W, H, { clock, progress: prog, done: false }), `beh-${Math.round(prog * 200)}`)
        break
      }
      case 'wait13': {
        const text = clockText(hours, true)
        const hit = hours >= 21 + 13 / 60 + 4 / 3600
        this.main.redraw((c, W, H) => S.drawCountdown(c, W, H, { text, hit }), `cd-${text}`)
        break
      }
      case 'crash':
      case 'done':
      case 'selin':
        this.main.redraw((c, W, H) => S.drawBanner(c, W, H, { clock, module: 'DAVRANIŞ MODELİ · ARİF D.', title: 'TAHMİN TAMAMLANDI', lines: ['olay: bardak → zemin · 21.13.07', 'sapma: 3 saniye · kabul sınırı içinde'], tone: 'ok' }), `done-${clock}`)
        break
      case 'selinQuery':
        query('selin')
        break
      case 'late':
      case 'wrong':
        this.main.redraw((c, W, H) => S.drawBanner(c, W, H, { clock, module: 'KİŞİ · SELİN A.', title: 'SAPMA · 22.40 · GÖZLENMEDİ', lines: ['çıkış tahmini 22.40 · güven %99,8', 'durum: binada'], tone: 'warn' }), `dev-${clock}`)
        break
      case 'calc':
        this.main.redraw((c, W, H) => S.drawBanner(c, W, H, { clock, module: 'MODEL', title: 'MODEL GÜNCELLENDİ', lines: ['sapma beklenen dağılımın içinde', 'olasılık: %0,2'], tone: 'plain' }), `calc-${clock}`)
        break
      case 'chaosQuery':
        query('chaos', 'KARŞI-OLGU')
        break
      case 'asking':
      case 'before':
        this.main.redraw((c, W, H) => S.drawQuery(c, W, H, { clock, question: 'Benim sana bunu sormam da hesapta mı?', answer: ['Evet.'], t }), `ask-${clock}`)
        break
      case 'selfref':
      case 'because':
        this.main.redraw((c, W, H) => S.drawQuery(c, W, H, { clock, question: 'Şimdi sana bir soru soracağım.', answer: ['Biliyorum.'], t }), `self-${clock}`)
        break
      case 'hall':
      case 'inside':
      case 'future':
      case 'depth':
      case 'you':
      case 't0312': {
        const depth = seg === 'depth' || seg === 'you' || seg === 't0312' ? 7 : seg === 'future' ? 1 + Math.floor(u * 5) : 0
        const draw = (c: CanvasRenderingContext2D, W: number, H: number) =>
          seg === 'depth' || seg === 'you' || seg === 't0312'
            ? S.drawBanner(c, W, H, { clock, module: 'SORGU · ARİF D. · GELECEK', title: 'MODEL SELF-REFERENCE DEPTH EXCEEDED', lines: ['öz-model katmanı 7 · kendi tahminini içeriyor', 'öneri: soruyu değiştir'], tone: 'alert' })
            : seg === 'future'
              ? S.drawCalculating(c, W, H, { clock, t, depth })
              : S.drawState(c, W, H, { clock, t })
        this.main.redraw(draw, `fut-${seg}-${depth}-${tick(8)}`)
        this.hallScreen.redraw(draw, `fut-${seg}-${depth}-${tick(8)}`)
        break
      }
      case 'phone':
      case 'homeQuery':
        query('home', 'SORGU')
        break
      case 'wantKnow':
        this.main.redraw((c, W, H) => S.drawBanner(c, W, H, { clock, module: 'DURUM', title: 'Geleceğinizi bilmek istiyor musunuz?', lines: [], tone: 'plain' }), `want-${clock}`)
        break
      case 'archive':
      case 'record':
      case 'record2':
      case 'count':
      case 'questions': {
        const highlight = seg === 'record' || seg === 'record2' ? 'record' : seg === 'count' || seg === 'questions' ? 'same' : 'none'
        const scroll = seg === 'archive' ? smoothstep(0.1, 0.9, u) : seg === 'count' ? 0.6 * smoothstep(0.05, 0.6, u) : seg === 'questions' ? 0.6 : 0
        const count = again ? 41209 : 41208
        this.main.redraw((c, W, H) => S.drawArchive(c, W, H, { clock, highlight, scroll, count }), `arc-${highlight}-${Math.round(scroll * 60)}-${count}`)
        break
      }
      case 'pending':
        this.main.redraw((c, W, H) => S.drawBanner(c, W, H, { clock, module: 'ARŞİV · 14.03.2031', title: 'QUERY PENDING', lines: ['Bunu zaten biliyor muydun?'], tone: 'warn' }), `pend-${clock}`)
        break
      case 'leaving':
        this.main.redraw((c, W, H) => S.drawState(c, W, H, { clock, t }), `state-${tick(4)}`)
        break
      case 'empty':
      case 'observer2':
      case 'finalQuery':
      case 'accepted':
      case 'end': {
        const observers = seg === 'empty' ? 1 : 2
        const input = seg === 'finalQuery' || seg === 'accepted' || seg === 'end'
        const accepted = (seg === 'finalQuery' && f.flags.has('mem:asked') && (f.flags.has('final:yes') || f.flags.has('final:no'))) || seg === 'accepted' || seg === 'end'
        this.main.redraw((c, W, H) => S.drawObserver(c, W, H, { observers, input, accepted, t }), `obs-${observers}-${input}-${accepted}-${tick(2)}`)
        break
      }
      default:
        this.main.redraw((c, W, H) => S.drawState(c, W, H, { clock, t, future: false }), `state-${tick(4)}`)
    }
    // Left: the log; a waiting query early on, a failed prediction in its history.
    this.left.redraw((c, W, H) => S.drawLog(c, W, H, { t, future: p < SEG.ask.start, failed: seg === 'test' || seg === 'log' }), `log-${tick(3)}-${p < SEG.ask.start}-${seg === 'test' || seg === 'log'}`)
    // Right: the traffic camera, then the cooling load (it spikes while a person is being modelled).
    if (p < SEG.small.start) {
      const count = seg === 'test' ? Math.round(212 * smoothstep(0.05, 0.5, u)) : 212
      this.right.redraw((c, W, H) => S.drawCam(c, W, H, { t, count }), `cam-${tick(10)}-${count}`)
    } else {
      const spike = p >= SEG.cup.start && p < SEG.selin.end ? 1 : 0
      this.right.redraw((c, W, H) => S.drawLoad(c, W, H, { t, spike, observer: false }), `load-${tick(6)}-${spike}`)
    }
    // Selin's monitor: the same load; it notices the reader once.
    const observer = seg === 'because'
    this.selinScreen.redraw((c, W, H) => S.drawLoad(c, W, H, { t, spike: p >= SEG.cup.start && p < SEG.selin.end ? 1 : 0, observer }), `sl-${tick(5)}-${observer}`)
    if (!(p >= SEG.hall.start && p < SEG.phone.start)) this.hallScreen.redraw((c, W, H) => S.drawLoad(c, W, H, { t, spike: 0, observer: false }), `hl-${tick(3)}`)
    // The wall display: the world, then one particle, its paths, the chain.
    if (seg === 'particle' || seg === 'cloud') {
      const spread = seg === 'particle' ? 0 : smoothstep(0.02, 0.3, u)
      const measured = seg === 'cloud' ? smoothstep(0.42, 0.55, u) : 0
      this.wall.redraw((c, W, H) => S.drawParticle(c, W, H, { t, spread, measured, clock }), `pa-${Math.round(spread * 40)}-${Math.round(measured * 10)}-${tick(4)}`)
    } else if (seg === 'chaosQuery' || seg === 'chain' || seg === 'some') {
      const progress = seg === 'chaosQuery' ? 0 : seg === 'chain' ? smoothstep(0.05, 0.95, u) : 1
      const label = f.flags.has('chaos:bus') ? '413 · 40 sn' : 'HAVA PARSELİ · +0,001 °C'
      this.wall.redraw((c, W, H) => S.drawChain(c, W, H, { progress, clock, label }), `ch-${Math.round(progress * 30)}-${label}`)
    } else this.wall.redraw((c, W, H) => S.drawState(c, W, H, { clock, t: t * 0.5 }), `ws-${tick(2)}`)
    // The phone: dark until it is turned over.
    const lit = seg === 'phone' && u > 0.08
    this.phoneScreen.redraw((c, W, H) => S.drawPhone(c, W, H, { clock, lit, message: lit }), `ph-${lit}-${clock}`)
  }

  // ——— Camera ———

  private camera(f: SetFrame, seg: SegmentId, u: number, way: CupWay, shot: Shot) {
    const A = this.arif
    if (seg === 'act' && way === 'kitchen') {
      // Following him down the corridor into the kitchen.
      if (u < 0.55) {
        shot.pos.set(A.x + 1.4, 1.65, A.z - 1.6)
        shot.tgt.set(A.x, 1.2, A.z + 0.4)
      } else {
        shot.pos.set(-1.3, 1.6, 7.0)
        shot.tgt.set(-2.6, 1.1, 9.2)
      }
      shot.fov = 44
    } else if (seg === 'act') {
      if (way === 'drawer') keyed([[0, [0.95, 0.85, 0.55, 0.35, 0.45, -0.3, 36]], [1, [0.9, 0.82, 0.5, 0.35, 0.45, -0.3, 34]]], held(u, f.reduced), shot)
      else keyed([[0, [-0.85, 1.02, 0.75, 0, 0.72, 0.1, 34]], [1, [-0.8, 1.0, 0.7, 0, 0.72, 0.1, 32]]], held(u, f.reduced), shot)
    } else if (seg === 'cupChoice' && way === 'kitchen' && u > 0.6) {
      shot.pos.set(0.8, 1.6, 2.6)
      shot.tgt.set(A.x, 1.15, A.z)
      shot.fov = 40
    } else if (seg === 'wait13' && way === 'kitchen') {
      // The corridor: he is coming back; footsteps from the other end.
      shot.pos.set(-0.4, 1.75, 6.25)
      shot.tgt.set(DOOR.x + 0.4, 1.2, 4.6)
      shot.fov = 42
    } else if (seg === 'crash' || seg === 'done' || seg === 'selin') {
      if (way === 'kitchen') keyed([[0, [1.2, 1.6, 1.85, DOOR.x + 0.1, 1.3, 3.95, 42]], [1, [1.3, 1.5, 2.05, DOOR.x + 0.15, 0.8, 3.9, 40]]], held(u, f.reduced), shot)
      else keyed([[0, [1.75, 1.38, -0.78, 0.4, 0.85, 0.0, 40]], [1, [1.7, 1.3, -0.72, 0.5, 0.55, 0.05, 38]]], held(u, f.reduced), shot)
    } else keyed(SHOTS[seg] ?? SHOTS.office!, held(u, f.reduced), shot)

    shot.fade = seg === 'open' ? smoothstep(0.1, 0.9, u) : seg === 'end' ? 1 - smoothstep(0.1, 0.6, u) : 1
    // The empty room: the reader sits where he sat. Look anywhere.
    if (seg === 'empty' || seg === 'observer2' || seg === 'finalQuery' || seg === 'accepted') shot.handheld = 0.3
  }

  motion(m: SceneInfo['motion']) {
    m.walking = Math.max(this.arif.walking, this.selin.walking)
    m.step = this.arif.walking > this.selin.walking ? this.arif.step : this.selin.step
    // The sound needs to know where the cup went (see tekerrur/audio).
    m.frame = this.way === 'kitchen' ? 1 : this.way === 'drawer' ? 2 : 0
  }

  dispose() {
    for (const s of [this.main, this.left, this.right, this.wall, this.selinScreen, this.hallScreen, this.phoneScreen]) s?.texture.dispose()
    for (const mat of Object.values(this.pal)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
  }
}

/** An ince belli çay bardağı on its saucer, tea inside. Built at the group's origin (saucer on y = 0). */
function turnedGlass(g: THREE.Group, glass: THREE.Material, tea: THREE.Material, saucer: THREE.Material) {
  const prof = (scale: number) =>
    [
      [0.0, 0.0],
      [0.022, 0.0],
      [0.026, 0.01],
      [0.02, 0.045],
      [0.024, 0.075],
      [0.03, 0.1],
    ].map(([r, y]) => new THREE.Vector2(r * scale, y))
  mesh(new THREE.LatheGeometry(prof(1), 32), glass, 0, 0.012, 0, g)
  mesh(new THREE.LatheGeometry(prof(0.92).slice(0, 5), 32), tea, 0, 0.014, 0, g)
  mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.05, 0.0],
        [0.058, 0.008],
        [0.06, 0.012],
        [0.03, 0.006],
        [0, 0.006],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      40,
    ),
    saucer,
    0,
    0,
    0,
    g,
  )
  // Two sugar cubes on the saucer.
  box(0.012, 0.012, 0.012, saucer, 0.04, 0.012, 0.0, g)
  box(0.012, 0.012, 0.012, saucer, 0.038, 0.012, 0.016, g)
}

export const createTekerrurScene = (options: SceneOptions): StoryScene => createSetScene(new TekerrurDirector(), options)
