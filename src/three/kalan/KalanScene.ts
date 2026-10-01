/**
 * KALAN — Deniz's apartment, and the lives it could have held.
 *
 * World layout (meters): living room x −4…4, z −3.5…3.5, height 2.7. Front
 * door on the east wall (x = 4, z = 0.8). Kitchen along the north wall's west
 * half. A window on the south wall behind the sofa. The table with the tape
 * recorder at (−0.5, −0.3). In the end a door opens in the north wall at
 * x = 0.2 onto another apartment built behind it.
 *
 * The kitchen changes only while nobody is looking at it. So do the door and
 * the people at the end. The reader is never shown a change happening.
 */
import * as THREE from 'three'
import { SEG, local, segmentAt, type SegmentId } from '@/stories/kalan/timeline'
import { smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { Figure, type FigureLook } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { box, cyl, disposeTree, mesh } from '../util'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed, type ShotKeys } from '../kit/direct'
import { canvasPlane, chair, counter, door, mug, plant, room, shelf, sofa, std, table, facade } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mono, sans } from '../screens'

const PI = Math.PI
const TABLE = { x: -0.5, z: -0.3 }
const SEAT = { x: -0.5, z: 0.35 }
const FRONT_DOOR = { x: 4, z: 0.8 }
const AT_DOOR = { x: 3.35, z: 0.8 }
const PHOTO = new THREE.Vector3(1.6, 1.55, -3.47)
const NEW_DOOR = { x: 0.2, z: -3.5 }
const KITCHEN = new THREE.Vector3(-2.6, 1.1, -3.0)
const RECORDER = new THREE.Vector3(-0.35, 0.775, -0.35)
const RECORDER_FLOOR = new THREE.Vector3(0.4, 0.0, -1.2)

function palette() {
  return {
    wall: pbr('plaster', 0xd9cbb6, { roughness: 1 }),
    wallOther: pbr('plaster', 0xc9b49a, { roughness: 1 }),
    floor: pbr('planks', 0x6b4f3a, { roughness: 1 }),
    ceiling: pbr('plaster', 0xeee6da, { roughness: 1 }),
    trim: pbr('painted', 0xf0ebe2, { roughness: 1 }),
    wood: pbr('wood', 0x7a5a40, { roughness: 0.9 }),
    darkWood: pbr('wood', 0x3d2d22, { roughness: 0.9 }),
    door: pbr('wood', 0x5a4334, { roughness: 0.9 }),
    brass: pbr('metal', 0xb48f58, { roughness: 0.6 }),
    counterTop: pbr('concrete', 0xcfc7ba, { roughness: 0.55 }),
    cabinet: pbr('painted', 0x6e7f74, { roughness: 1 }),
    fridge: pbr('painted', 0xe6e2da, { roughness: 0.6 }),
    sofa: pbr('fabric', 0x5d6f78, { roughness: 1 }),
    cushion: pbr('fabric', 0xb98d64, { roughness: 1 }),
    mugWhite: pbr('ceramic', 0xefebe4, { roughness: 1 }),
    mugRed: pbr('ceramic', 0xa8433a, { roughness: 1 }),
    coffee: std(0x2a170c, 0.1),
    book: pbr('paper', 0x8c6f5a, { roughness: 0.9 }),
    bookB: pbr('paper', 0x55697d, { roughness: 0.9 }),
    bookC: pbr('paper', 0xc2b29a, { roughness: 0.9 }),
    bookNew: pbr('paper', 0x9b2f2a, { roughness: 0.8 }),
    pot: pbr('plaster', 0xa96f50, { roughness: 1 }),
    leaf: std(0x5c6b47, 0.85, { side: THREE.DoubleSide }),
    recorder: pbr('plastic', 0x2a2522, { roughness: 0.8 }),
    reel: std(0x14110f, 0.4),
    led: new THREE.MeshBasicMaterial({ color: 0x240806 }),
    sheet: pbr('fabric', 0xd8d4cc, { roughness: 1 }),
    box: pbr('paper', 0xa9865d, { roughness: 1 }),
    glassWine: std(0xcfd8de, 0.05, { transparent: true, opacity: 0.35 }),
    wine: std(0x5a1520, 0.2),
    flower: std(0xd88a9a, 0.8),
    nail: std(0x8a8a8a, 0.4, { metalness: 0.9 }),
    lampShade: std(0xf1e2c8, 0.8, { emissive: new THREE.Color(0xffd8a0), emissiveIntensity: 0.5 }),
    sky: new THREE.MeshBasicMaterial({ color: 0x0b1220 }),
    facadeWall: pbr('brick', 0x1c1f26, { roughness: 1 }),
    // The cast
    skin: std(0xc49a80, 0.55),
    skinHead: std(0xc49a80, 0.52, { vertexColors: true }),
    skinW: std(0xd0a68b, 0.55),
    skinWHead: std(0xd0a68b, 0.52, { vertexColors: true }),
    eye: std(0x120d0a, 0.15),
    hair: std(0x2a211c, 0.75),
    hairW: std(0x5a3d2a, 0.75),
    sweater: std(0x4f5a4c, 0.9),
    shirt: std(0xc9cfd6, 0.7),
    jeans: std(0x2a3240, 0.9),
    trousers: std(0x3a3532, 0.9),
    dress: std(0x8b5a62, 0.9),
    shoe: std(0x1a1a1a, 0.7),
    sole: std(0x0f0f0f, 0.8),
    ghost: new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.6, transparent: true, opacity: 0.32, depthWrite: false, emissive: new THREE.Color(0x3a332a) }),
    ghostHead: new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.6, transparent: true, opacity: 0.32, depthWrite: false, vertexColors: true, emissive: new THREE.Color(0x3a332a) }),
  }
}
type Pal = ReturnType<typeof palette>

function look(m: Pal, name: string, kind: 'deniz' | 'other' | 'ghost' | 'woman'): FigureLook {
  const base = { name, eye: m.eye, shoes: m.shoe, sole: m.sole, collar: 'crew' as const }
  const face = { jaw: 0.28, nose: 0.2, lips: 0.05, stubble: 0.22 }
  if (kind === 'deniz') return { ...base, build: 'm', face, hairStyle: 'short', skin: m.skin, skinHead: m.skinHead, hair: m.hair, top: m.sweater, bottom: m.jeans, cuff: m.sweater }
  if (kind === 'other') return { ...base, build: 'm', face, hairStyle: 'short', skin: m.skin, skinHead: m.skinHead, hair: m.hair, top: m.shirt, bottom: m.trousers, cuff: m.shirt, collar: 'mock' }
  if (kind === 'woman') return { ...base, build: 'f', face: { jaw: 0.14, nose: 0.13, lips: 0.07, stubble: 0 }, hairStyle: 'long', skin: m.ghost, skinHead: m.ghostHead, hair: m.ghost, top: m.ghost, bottom: m.ghost, cuff: m.ghost, shoes: m.ghost, sole: m.ghost, eye: m.ghost, height: 0.94 }
  return { ...base, build: 'm', face, hairStyle: 'short', skin: m.ghost, skinHead: m.ghostHead, hair: m.ghost, top: m.ghost, bottom: m.ghost, cuff: m.ghost, shoes: m.ghost, sole: m.ghost, eye: m.ghost }
}

function photoDraw(life: 'empty' | 'pair', back = false) {
  return (c: CanvasRenderingContext2D, W: number, H: number) => {
    if (back) {
      c.fillStyle = '#e8dfcf'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#3b2f25'
      sans(c, 64, 400)
      c.fillText('2018', 40, 100)
      sans(c, 26, 400)
      c.fillText('Bizim ilk yılımız.', 40, 150)
      return
    }
    const g = c.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#9fb6c8')
    g.addColorStop(1, '#e7d2b4')
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#6d8a5a'
    c.beginPath()
    c.moveTo(0, H * 0.7)
    c.quadraticCurveTo(W * 0.4, H * 0.55, W, H * 0.68)
    c.lineTo(W, H)
    c.lineTo(0, H)
    c.fill()
    if (life === 'pair') {
      for (const [x, tone, hair, long] of [
        [W * 0.4, '#c49a80', '#2a211c', false],
        [W * 0.6, '#d0a68b', '#5a3d2a', true],
      ] as const) {
        c.fillStyle = long ? '#8b5a62' : '#4f5a4c'
        c.fillRect(x - 40, H * 0.55, 80, H * 0.45)
        c.fillStyle = hair
        c.beginPath()
        c.ellipse(x, H * 0.4 + (long ? 18 : 0), 32, long ? 52 : 34, 0, 0, PI * 2)
        c.fill()
        c.fillStyle = tone
        c.beginPath()
        c.ellipse(x, H * 0.43, 24, 31, 0, 0, PI * 2)
        c.fill()
      }
    }
    c.fillStyle = 'rgba(255,214,160,0.12)'
    c.fillRect(0, 0, W, H)
  }
}

function signDraw(c: CanvasRenderingContext2D, W: number, H: number) {
  c.fillStyle = '#16120f'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#efe3d1'
  mono(c, 34, 500)
  c.textAlign = 'center'
  c.fillText("THE LIFE YOU DIDN'T CHOOSE", W / 2, H * 0.62)
  c.textAlign = 'left'
}

const P_TO_DOOR = makePath([
  [SEAT.x, SEAT.z + 0.1],
  [1.2, 1.2],
  [AT_DOOR.x, AT_DOOR.z],
])
const P_KITCHEN_WALK = makePath([
  [SEAT.x, SEAT.z + 0.1],
  [-1.6, -1.2],
  [-2.0, -2.2],
  [-0.6, -1.0],
  [1.0, 0.6],
])
const P_TO_PHOTO = makePath([
  [SEAT.x, SEAT.z + 0.1],
  [0.6, -1.2],
  [1.55, -2.75],
])
const P_TO_NEW_DOOR = makePath([
  [0.4, 0.4],
  [0.25, -1.6],
  [NEW_DOOR.x, -2.85],
])

const SHOTS: Partial<Record<SegmentId, ShotKeys>> = {
  open: [[0, [3.2, 1.7, 2.9, -1.0, 0.9, -1.2, 50]]],
  night: [
    [0, [3.2, 1.7, 2.9, -1.0, 0.9, -1.2, 50]],
    [1, [2.8, 1.65, 2.6, -0.8, 0.9, -1.0, 48]],
  ],
  find: [
    [0, [0.35, 1.38, 0.65, -0.4, 0.8, -0.35, 36]],
    [1, [0.25, 1.32, 0.5, -0.4, 0.8, -0.35, 32]],
  ],
  play: [
    [0, [0.8, 1.45, 0.45, -0.5, 1.15, -0.05, 38]],
    [1, [0.7, 1.42, 0.35, -0.5, 1.18, -0.05, 34]],
  ],
  voice: [
    [0, [0.7, 1.42, 0.35, -0.5, 1.18, -0.05, 34]],
    [1, [0.55, 1.4, 0.2, -0.45, 1.22, 0.05, 30]],
  ],
  knock: [
    [0, [-1.8, 1.6, 1.6, 4.0, 1.2, 0.8, 46]],
    [1, [-1.6, 1.6, 1.5, 4.0, 1.2, 0.8, 44]],
  ],
  walk: [
    [0, [-1.6, 1.6, 1.5, 4.0, 1.2, 0.8, 44]],
    [1, [1.6, 1.6, 2.4, 4.0, 1.15, 0.8, 42]],
  ],
  dont: [
    [0, [2.4, 1.6, 2.2, 3.98, 1.1, 0.8, 40]],
    [1, [2.55, 1.58, 2.05, 3.98, 1.1, 0.8, 36]],
  ],
  gone: [
    [0, [2.55, 1.58, 2.05, 3.98, 1.1, 0.8, 36]],
    [1, [2.7, 1.56, 1.9, 3.98, 1.1, 0.8, 32]],
  ],
  sleep: [
    [0, [-1.5, 1.6, -0.6, 1.8, 0.6, 2.6, 46]],
    [1, [-1.3, 1.55, -0.4, 1.8, 0.6, 2.6, 44]],
  ],
  morning: [
    [0, [-1.3, 1.55, -0.4, 1.8, 0.6, 2.6, 44]],
    [1, [-1.8, 1.6, -0.9, 0.5, 0.8, 1.6, 48]],
  ],
  mug: [
    [0, [-0.15, 1.25, 0.45, -0.8, 0.8, -0.4, 34]],
    [1, [-0.25, 1.2, 0.35, -0.8, 0.8, -0.4, 30]],
  ],
  details: [
    [0, [-2.0, 1.5, 0.55, -4.0, 1.3, 1.2, 40]],
    [1, [-2.2, 1.48, 0.5, -4.0, 1.3, 1.2, 36]],
  ],
  notice: [
    [0, [-1.5, 1.62, 1.8, 1.4, 1.45, -3.2, 42]],
    [1, [-1.1, 1.6, 1.3, 1.5, 1.5, -3.4, 40]],
  ],
  photo: [
    [0, [2.35, 1.62, -1.95, 1.55, 1.55, -3.45, 36]],
    [1, [2.25, 1.6, -2.2, 1.6, 1.55, -3.45, 30]],
  ],
  back: [
    [0, [1.1, 1.55, -1.75, 1.55, 1.25, -2.45, 34]],
    [1, [1.15, 1.52, -1.85, 1.55, 1.25, -2.45, 30]],
  ],
  tape: [
    [0, [0.4, 1.3, 0.5, -0.35, 0.82, -0.35, 34]],
    [1, [0.3, 1.25, 0.4, -0.35, 0.82, -0.35, 30]],
  ],
  other: [
    [0, [-2.0, 1.5, 1.5, -0.5, 1.0, -0.3, 40]],
    [1, [-1.8, 1.45, 1.35, -0.5, 1.0, -0.3, 38]],
  ],
  rooms: [
    [0, [3.4, 1.7, 3.0, -2.6, 1.0, -3.0, 50]],
    [0.45, [3.4, 1.7, 3.0, -2.6, 1.0, -3.0, 50]],
    [1, [-0.4, 1.6, -1.6, 2.0, 0.8, 2.8, 48]],
  ],
  kitchen: [
    [0, [-0.4, 1.6, -1.6, 2.0, 0.8, 2.8, 48]],
    [0.35, [-0.4, 1.6, -1.6, 2.0, 0.8, 2.8, 48]],
    [0.6, [1.6, 1.65, 1.6, -2.6, 1.0, -3.0, 48]],
    [1, [1.4, 1.62, 1.4, -2.6, 1.0, -3.0, 46]],
  ],
  married: [
    [0, [1.4, 1.62, 1.4, -2.6, 1.0, -3.0, 46]],
    [1, [1.2, 1.6, 1.2, -1.5, 1.0, -2.5, 46]],
  ],
  city: [
    [0, [1.0, 1.55, -1.4, -1.0, 1.4, 3.5, 48]],
    [1, [0.8, 1.55, -1.6, -1.2, 1.5, 3.5, 46]],
  ],
  never: [
    [0, [3.4, 1.8, 3.0, -1.0, 0.8, -1.5, 52]],
    [1, [3.2, 1.75, 2.8, -1.0, 0.8, -1.5, 50]],
  ],
  died: [
    [0, [2.8, 1.6, -0.5, -2.6, 1.0, -3.0, 44]],
    [1, [2.6, 1.55, -0.8, -2.6, 0.9, -3.0, 42]],
  ],
  ask: [
    [0, [-1.9, 1.45, 0.9, -0.5, 1.05, -0.3, 40]],
    [1, [-1.7, 1.42, 0.75, -0.5, 1.05, -0.3, 36]],
  ],
  remain: [
    [0, [2.5, 1.6, 1.8, -0.2, 1.1, -0.5, 48]],
    [1, [-1.5, 1.6, 2.3, 0.2, 1.1, -0.8, 48]],
  ],
  sign: [
    [0, [0.25, 1.6, 1.6, 0.2, 1.45, -3.5, 46]],
    [1, [0.25, 1.6, 1.2, 0.2, 1.45, -3.5, 42]],
  ],
  approach: [
    [0, [0.6, 1.65, 1.2, 0.2, 1.3, -3.5, 44]],
    [1, [0.55, 1.65, 0.2, 0.2, 1.3, -3.5, 42]],
  ],
  opens: [
    [0, [0.55, 1.65, 0.2, 0.2, 1.3, -4.5, 42]],
    [1, [0.5, 1.62, -0.4, 0.2, 1.3, -5.5, 40]],
  ],
  // Over his shoulder, through the door, to the other one.
  facing: [
    [0, [0.85, 1.6, -1.3, 0.2, 1.45, -5.4, 40]],
    [1, [0.75, 1.58, -1.6, 0.2, 1.45, -5.4, 36]],
  ],
  behind: [
    [0, [0.75, 1.58, -1.6, 0.2, 1.45, -5.4, 38]],
    [1, [0.75, 1.58, -1.6, 0.2, 1.45, -5.4, 40]],
  ],
  recording: [
    [0, [1.3, 1.5, -0.2, 0.4, 0.1, -1.2, 40]],
    [1, [1.1, 1.3, -0.45, 0.4, 0.05, -1.2, 34]],
  ],
  end: [[0, [1.1, 1.3, -0.45, 0.4, 0.05, -1.2, 34]]],
}

type Life = 'normal' | 'child' | 'married' | 'packed' | 'dust'
const LIFE_ORDER: Life[] = ['normal', 'child', 'married', 'packed', 'dust']

class KalanDirector implements SetDirector {
  private pal = palette()
  private deniz!: Actor
  private other!: Actor
  private ghosts: Actor[] = []
  private woman!: Actor
  private ghostMats: THREE.MeshStandardMaterial[] = []
  private recorder = new THREE.Group()
  private reels: THREE.Mesh[] = []
  private photo!: ReturnType<typeof canvasPlane>
  private photoGroup = new THREE.Group()
  private mugWhite!: THREE.Group
  private mugRed!: THREE.Group
  private newBook!: THREE.Mesh
  private frontDoor!: ReturnType<typeof door>
  private newDoor!: ReturnType<typeof door>
  private patch!: THREE.Mesh
  private sign!: ReturnType<typeof canvasPlane>
  private beyond = new THREE.Group()
  private warm!: THREE.PointLight
  private lives: Record<Exclude<Life, 'normal'>, THREE.Group> = { child: new THREE.Group(), married: new THREE.Group(), packed: new THREE.Group(), dust: new THREE.Group() }
  private windowNight!: THREE.Mesh
  private cityA = new THREE.Group()
  private cityB = new THREE.Group()
  private lamp!: THREE.PointLight
  private ceilingLight!: THREE.PointLight
  private sun!: THREE.DirectionalLight
  private hemi!: THREE.HemisphereLight
  // Perception state: what the reader has, and has not, been looking at.
  private kitchenLife = 0
  private kitchenAway = 0
  private kitchenSeen = false
  private doorGone = false
  private doorAway = 0
  private v = new THREE.Vector3()

  build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.pal
    scene.environment = ctx.environment
    scene.environmentIntensity = 0.2
    scene.background = new THREE.Color(0x050506)

    // ——— The apartment ———
    scene.add(
      room({
        w: 8,
        d: 7,
        h: 2.7,
        wall: m.wall,
        floor: m.floor,
        ceiling: m.ceiling,
        openings: [
          { side: 'e', at: FRONT_DOOR.z, width: 0.95, height: 2.1 },
          { side: 'n', at: NEW_DOOR.x, width: 0.95, height: 2.1 },
          { side: 's', at: -1.5, width: 2.0, height: 1.4, bottom: 0.9 },
        ],
      }),
    )
    // The wall where the new door will be: normally whole.
    this.patch = box(0.95, 2.1, 0.15, m.wall, NEW_DOOR.x, 1.05, NEW_DOOR.z - 0.075, scene)
    this.frontDoor = door({ w: 0.9, h: 2.05, frame: m.trim, leaf: m.door, handle: m.brass })
    this.frontDoor.group.position.set(FRONT_DOOR.x - 0.02, 0, FRONT_DOOR.z)
    this.frontDoor.group.rotation.y = -PI / 2
    scene.add(this.frontDoor.group)
    this.newDoor = door({ w: 0.9, h: 2.05, frame: m.trim, leaf: m.door, handle: m.brass })
    this.newDoor.group.position.set(NEW_DOOR.x, 0, NEW_DOOR.z + 0.02)
    scene.add(this.newDoor.group)
    this.sign = canvasPlane(1.6, 0.18, 1024, signDraw, { emissive: true })
    this.sign.mesh.position.set(NEW_DOOR.x, 2.32, NEW_DOOR.z + 0.03)
    scene.add(this.sign.mesh)
    // The window to the night, and two cities to see through it.
    this.windowNight = mesh(new THREE.PlaneGeometry(2.0, 1.4), m.sky, -1.5, 1.6, 3.7, scene)
    this.windowNight.rotation.y = PI
    const fa = facade({ w: 16, h: 18, d: 3, wall: m.facadeWall, facing: 1, seed: 61, lit: 0.35 })
    fa.rotation.y = -PI / 2
    fa.position.set(-1.5, -8, 14)
    this.cityA.add(fa)
    const fb = facade({ w: 30, h: 40, d: 3, wall: m.facadeWall, facing: 1, seed: 73, lit: 0.6 })
    fb.rotation.y = -PI / 2
    fb.position.set(-1.5, -12, 22)
    this.cityB.add(fb)
    scene.add(this.cityA, this.cityB)
    // Kitchen.
    const fridge = box(0.65, 1.8, 0.62, m.fridge, -3.62, 0.9, -3.15, scene)
    fridge.name = 'fridge'
    const ctr = counter(2.3, 0.6, 0.9, m.counterTop, m.cabinet)
    ctr.position.set(-2.1, 0, -3.18)
    scene.add(ctr)
    box(2.3, 0.6, 0.32, m.cabinet, -2.1, 1.9, -3.32, scene)
    // Table, chairs, the recorder, the mugs.
    const t = table(1.2, 0.8, 0.75, m.wood, m.darkWood)
    t.position.set(TABLE.x, 0, TABLE.z)
    scene.add(t)
    const c1 = chair(m.wood)
    c1.position.set(SEAT.x, 0, SEAT.z + 0.15)
    c1.rotation.y = PI
    scene.add(c1)
    const c2 = chair(m.wood)
    c2.position.set(TABLE.x, 0, TABLE.z - 0.65)
    scene.add(c2)
    box(0.24, 0.07, 0.15, m.recorder, 0, 0.035, 0, this.recorder)
    for (const sx of [-1, 1]) {
      const r = cyl(0.03, 0.03, 0.012, m.reel, sx * 0.05, 0.072, -0.01, this.recorder, 16)
      this.reels.push(r)
    }
    mesh(new THREE.SphereGeometry(0.006, 8, 6), m.led, 0.095, 0.072, 0.05, this.recorder)
    this.recorder.position.copy(RECORDER)
    scene.add(this.recorder)
    this.mugWhite = mug(m.mugWhite, m.coffee)
    this.mugWhite.position.set(-0.8, 0.752, -0.4)
    scene.add(this.mugWhite)
    this.mugRed = mug(m.mugRed, m.coffee)
    this.mugRed.position.set(-0.8, 0.752, -0.4)
    scene.add(this.mugRed)
    // Shelf, the unfamiliar book, the nail where a clock was, a plant, the sofa, a lamp.
    const sh = shelf(1.4, 1.9, 0.32, m.wood, [m.book, m.bookB, m.bookC], 9)
    sh.position.set(-3.82, 0, 1.2)
    sh.rotation.y = PI / 2
    scene.add(sh)
    this.newBook = box(0.04, 0.27, 0.22, m.bookNew, -3.85, 1.3, 1.2, scene)
    cyl(0.004, 0.004, 0.04, m.nail, -3.98, 2.0, -0.8, scene, 6).rotation.z = PI / 2
    const pl = plant(m.pot, m.leaf, 1, 4)
    pl.position.set(3.4, 0, 2.9)
    scene.add(pl)
    const so = sofa(2.0, m.sofa, m.cushion)
    so.position.set(1.8, 0, 2.6)
    so.rotation.y = PI
    scene.add(so)
    cyl(0.12, 0.15, 0.03, m.darkWood, 3.3, 0.015, 2.0, scene)
    cyl(0.01, 0.01, 1.45, m.darkWood, 3.3, 0.75, 2.0, scene, 8)
    cyl(0.12, 0.16, 0.22, m.lampShade, 3.3, 1.55, 2.0, scene, 20)
    // The photo on the north wall.
    this.photo = canvasPlane(0.42, 0.3, 512, photoDraw('empty'))
    box(0.47, 0.35, 0.02, m.darkWood, 0, 0, -0.012, this.photoGroup)
    this.photoGroup.add(this.photo.mesh)
    this.photo.mesh.position.z = 0.002
    this.photoGroup.position.copy(PHOTO)
    scene.add(this.photoGroup)

    // ——— Other lives (shown only when nobody is watching the kitchen) ———
    const L = this.lives
    // A child's: a drawing on the fridge, a high chair.
    const drawing = canvasPlane(0.24, 0.3, 256, (c, W, H) => {
      c.fillStyle = '#f7f3ea'
      c.fillRect(0, 0, W, H)
      c.lineWidth = 6
      c.strokeStyle = '#e0542f'
      c.beginPath()
      c.arc(W * 0.5, H * 0.35, 40, 0, PI * 2)
      c.stroke()
      c.strokeStyle = '#3d6fb2'
      c.strokeRect(40, H * 0.6, W - 80, 60)
    })
    drawing.mesh.position.set(-3.62, 1.35, -2.83)
    L.child.add(drawing.mesh)
    const hc = new THREE.Group()
    box(0.36, 0.05, 0.36, m.wood, 0, 0.6, 0, hc)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.03, 0.6, 0.03, m.wood, sx * 0.16, 0.3, sz * 0.16, hc)
    box(0.36, 0.3, 0.03, m.wood, 0, 0.78, -0.17, hc)
    hc.position.set(-1.6, 0, -2.3)
    L.child.add(hc)
    // A marriage: two glasses, flowers.
    for (const x of [-1.9, -1.7]) {
      cyl(0.03, 0.022, 0.12, m.glassWine, x, 0.96, -3.1, L.married, 12)
      cyl(0.026, 0.026, 0.03, m.wine, x, 0.94, -3.1, L.married, 12)
    }
    cyl(0.05, 0.06, 0.18, m.mugWhite, -2.6, 0.99, -3.15, L.married, 14)
    for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(0.035, 8, 6), m.flower, -2.6 + Math.cos(i) * 0.04, 1.14 + (i % 2) * 0.03, -3.15 + Math.sin(i) * 0.04, L.married)
    // Never moved in: boxes.
    for (const [x, y, z, s] of [
      [-2.8, 0.25, -2.4, 0.5],
      [-2.2, 0.25, -2.3, 0.5],
      [-2.5, 0.72, -2.35, 0.44],
      [-1.6, 0.2, -2.0, 0.4],
    ] as const)
      box(s, s, s, m.box, x, y, z, L.packed).rotation.y = x
    // Years ago: dust sheets.
    box(2.35, 0.95, 0.66, m.sheet, -2.1, 0.47, -3.16, L.dust)
    box(0.7, 1.84, 0.66, m.sheet, -3.62, 0.92, -3.13, L.dust)
    for (const g of Object.values(L)) {
      g.visible = false
      scene.add(g)
    }

    // ——— Beyond the new door: another apartment, warmer ———
    const other = room({ w: 6, d: 6, h: 2.7, x: 0.2, z: -6.6, wall: m.wallOther, floor: m.floor, ceiling: m.ceiling, skip: ['s'] })
    this.beyond.add(other)
    const ot = table(1.0, 0.7, 0.75, m.wood, m.darkWood)
    ot.position.set(-1.4, 0, -7.5)
    this.beyond.add(ot)
    const os = sofa(1.8, m.cushion, m.sofa)
    os.position.set(1.8, 0, -8.8)
    this.beyond.add(os)
    const op = plant(m.pot, m.leaf, 1.2, 8)
    op.position.set(-2.2, 0, -9.0)
    this.beyond.add(op)
    // Its light stays in the scene (hiding a light recompiles every material); it is dimmed instead.
    this.warm = new THREE.PointLight(0xffc98f, 0, 9, 1.6)
    this.warm.position.set(0.2, 2.3, -6.6)
    scene.add(this.warm)
    this.beyond.visible = false
    scene.add(this.beyond)

    // ——— Light ———
    this.hemi = new THREE.HemisphereLight(0xd8e2ee, 0x3a2c22, 0.25)
    this.lamp = new THREE.PointLight(0xffc98f, 6, 7, 1.6)
    this.lamp.position.set(3.3, 1.5, 2.0)
    this.ceilingLight = new THREE.PointLight(0xffd7a8, 5, 8, 1.6)
    this.ceilingLight.position.set(-0.5, 2.5, -0.3)
    this.sun = new THREE.DirectionalLight(0xfff0dc, 0)
    this.sun.position.set(-3, 5, 9)
    this.sun.target.position.set(0, 0, 0)
    this.sun.castShadow = ctx.quality.shadows
    this.sun.shadow.mapSize.set(1024, 1024)
    this.sun.shadow.camera.left = -6
    this.sun.shadow.camera.right = 6
    this.sun.shadow.camera.top = 6
    this.sun.shadow.camera.bottom = -6
    scene.add(this.hemi, this.lamp, this.ceilingLight, this.sun, this.sun.target)

    // ——— Cast ———
    const mk = (name: string, kind: Parameters<typeof look>[2]) => {
      const f = new Figure(look(m, name, kind))
      if (kind === 'ghost' || kind === 'woman') f.root.traverse((o) => (o.castShadow = false))
      scene.add(f.root)
      return new Actor(f)
    }
    this.deniz = mk('Deniz', 'deniz')
    this.other = mk('Diğer Deniz', 'other')
    for (let i = 0; i < 4; i++) this.ghosts.push(mk(`Deniz ${i + 2}`, 'ghost'))
    this.woman = mk('Kadın', 'woman')
    this.ghostMats = [m.ghost, m.ghostHead]
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const { deniz, other, woman } = this
    deniz.begin()
    other.begin()
    woman.begin()
    for (const g of this.ghosts) g.begin()
    const morning = f.p >= SEG.morning.start && f.p < SEG.rooms.start
    const lateStory = f.p >= SEG.sign.start

    // ——— Deniz ———
    switch (seg) {
      case 'open':
      case 'night':
      case 'find':
        deniz.place(SEAT.x, SEAT.z, PI).hold(seg === 'find' ? P.SIT_READ : P.SIT)
        break
      case 'play':
      case 'voice':
        deniz.place(SEAT.x, SEAT.z, PI).hold(P.SIT_STILL)
        break
      case 'knock':
        deniz.place(SEAT.x, SEAT.z, PI).blend([
          [0.3, P.SIT_STILL],
          [0.6, P.SIT_LOOK],
        ], u).lookAt(FRONT_DOOR.x, FRONT_DOOR.z, smoothstep(0.3, 0.6, u))
        break
      case 'walk':
        if (u < 0.2) deniz.place(SEAT.x, SEAT.z, PI).blend([
          [0, P.SIT],
          [0.2, P.STAND],
        ], u)
        else deniz.walk(P_TO_DOOR, smoothstep(0.2, 1, u), P.STAND, PI, PI / 2)
        break
      case 'dont':
      case 'gone':
        deniz.place(AT_DOOR.x, AT_DOOR.z, PI / 2).hold(P.STAND)
        deniz.reach('r', seg === 'dont' ? smoothstep(0.1, 0.3, u) * (1 - smoothstep(0.5, 0.7, u)) : 0, 3.93, 1.0, 1.15, 0.5)
        break
      case 'sleep':
        deniz.place(1.4, 2.62, PI / 2).hold(P.LIE)
        break
      case 'morning':
        deniz.place(1.4, 2.62, PI / 2).hold(P.LIE)
        if (u > 0.5) deniz.place(1.6, 2.0, PI).hold(P.STAND)
        break
      case 'mug':
      case 'details':
        deniz.place(-0.1, 0.6, -2.6).hold(P.STAND_EASY).lookAt(seg === 'mug' ? -0.8 : -3.8, seg === 'mug' ? -0.4 : 1.2)
        break
      case 'notice':
        deniz.walk(P_TO_PHOTO, smoothstep(0, 0.9, u), P.STAND, PI, PI)
        break
      case 'photo':
        deniz.place(1.55, -2.75, PI).hold(P.STAND)
        break
      case 'back':
        deniz.place(1.55, -2.75, PI).hold(P.HOLD)
        break
      case 'tape':
      case 'other':
        deniz.place(SEAT.x, SEAT.z, PI).hold(seg === 'tape' ? P.SIT_LOOK : P.SIT_STILL)
        break
      case 'rooms':
        deniz.walk(P_KITCHEN_WALK, smoothstep(0, 1, u), P.STAND, PI)
        break
      case 'ask':
        deniz.place(SEAT.x, SEAT.z, PI).hold(P.SIT_STILL)
        break
      case 'approach':
        deniz.walk(P_TO_NEW_DOOR, smoothstep(0, 0.9, u), P.STAND, PI, PI)
        break
      case 'opens':
      case 'facing':
        deniz.place(NEW_DOOR.x, -2.85, PI).hold(P.STAND)
        deniz.reach('r', seg === 'opens' ? smoothstep(0.05, 0.25, u) * (1 - smoothstep(0.5, 0.7, u)) : 0, NEW_DOOR.x + 0.33, 1.0, -3.42, 0.5)
        break
      case 'behind':
        deniz.place(NEW_DOOR.x, -2.85, PI).hold(P.STAND)
        break
      default:
        deniz.place(0.4, 0.4, PI).hold(P.STAND_EASY)
    }
    // During the other lives he stands aside, watching them; in the end, in the middle of the room.
    if (seg === 'kitchen' || seg === 'married' || seg === 'city' || seg === 'never' || seg === 'died') deniz.place(2.8, -1.2, -2.0).hold(P.ARMS_CROSSED)
    if (seg === 'remain' || seg === 'sign') deniz.place(0.4, 0.2, PI).hold(P.STAND_EASY)
    if (seg === 'play' || seg === 'voice') deniz.reach('r', 1, RECORDER.x - 0.05, 1.18, 0.2, 0.3)

    // The sleeping figure lies along the sofa.
    const lying = seg === 'sleep' || (seg === 'morning' && u <= 0.5)

    // ——— The kitchen: other lives move in while no one looks ———
    this.kitchenAway = f.inView(KITCHEN, 1.2) ? 0 : this.kitchenAway + f.dt
    if (f.p < SEG.rooms.start) {
      this.kitchenLife = 0
      this.kitchenSeen = false
    } else if (f.p < SEG.married.start) {
      if (f.inView(KITCHEN, 1.2)) this.kitchenSeen = true
      if (this.kitchenSeen && this.kitchenAway > 0.8 && this.kitchenLife < 4) {
        this.kitchenLife++
        this.kitchenSeen = false
      }
    }
    // Then each unchosen life is shown on its own (married, another city, never moved in, died).
    let life: Life = LIFE_ORDER[this.kitchenLife]
    if (seg === 'married') life = 'married'
    else if (seg === 'never') life = 'packed'
    else if (seg === 'died') life = 'dust'
    else if (seg === 'city') life = 'normal'
    else if (f.p >= SEG.ask.start) life = 'normal'
    for (const [k, g] of Object.entries(this.lives)) g.visible = k === life

    // ——— Things ———
    const otherLife = f.p >= SEG.morning.start
    this.mugWhite.visible = !otherLife
    this.mugRed.visible = otherLife
    this.newBook.visible = otherLife
    const back = seg === 'back'
    this.photo.redraw(photoDraw(otherLife ? 'pair' : 'empty', back), `${otherLife}:${back}`)
    if (back) {
      // In Deniz's hands, turned to show its back.
      this.photoGroup.position.set(1.55, 1.25, -2.45)
      this.photoGroup.rotation.set(-0.4, 0, 0)
    } else {
      this.photoGroup.position.copy(PHOTO)
      this.photoGroup.rotation.set(0, 0, 0)
    }
    const playing = seg === 'play' || seg === 'voice' || seg === 'dont' || seg === 'tape' || seg === 'other' || seg === 'ask' || seg === 'approach' || seg === 'recording'
    for (const r of this.reels) r.rotation.y = playing ? f.time * 3 : 0
    ;(this.pal.led as THREE.MeshBasicMaterial).color.setHex(playing ? 0xff3a20 : 0x240806)
    // The recorder: on the table, in his hand, then on the floor at the end.
    if (seg === 'play' || seg === 'voice') {
      deniz.apply(f.time, !f.reduced)
      deniz.figure.rGrip.getWorldPosition(this.v)
      this.recorder.position.copy(this.v)
      this.recorder.position.y -= 0.05
      this.recorder.rotation.set(0, PI / 2, PI / 2)
    } else if (f.p >= SEG.recording.start || (seg === 'behind' && this.doorGone)) {
      this.recorder.position.copy(RECORDER_FLOOR)
      this.recorder.rotation.set(0, 0.6, 0)
    } else {
      this.recorder.position.copy(RECORDER)
      this.recorder.rotation.set(0, 0, 0)
    }
    this.frontDoor.leaf.rotation.y = 0

    // ——— The new door ———
    const doorShown = f.p >= SEG.sign.start
    if (f.p < SEG.behind.start) {
      this.doorGone = false
      this.doorAway = 0
    } else {
      this.v.set(NEW_DOOR.x, 1.1, NEW_DOOR.z)
      this.doorAway = f.inView(this.v, 0.6) ? 0 : this.doorAway + f.dt
      if (this.doorAway > 0.6) this.doorGone = true
    }
    const doorOpen = seg === 'opens' ? smoothstep(0.25, 0.75, u) : f.p >= SEG.facing.start && !this.doorGone ? 1 : 0
    this.patch.visible = !doorShown || this.doorGone
    this.newDoor.group.visible = doorShown && !this.doorGone
    this.newDoor.leaf.rotation.y = -doorOpen * 1.6
    this.sign.mesh.visible = doorShown && !this.doorGone
    this.beyond.visible = doorOpen > 0.01 && !this.doorGone
    this.warm.intensity = this.beyond.visible ? 9 : 0
    other.place(NEW_DOOR.x, -5.4, 0).hold(P.STAND).lookAt(deniz.x, deniz.z)
    other.visible = f.p >= SEG.opens.start + SEG.opens.len * 0.4 && !this.doorGone
    if (this.doorGone && seg === 'behind') deniz.visible = false
    if (f.p >= SEG.recording.start) deniz.visible = false

    // ——— Ghosts: the Denizes of the other lives ———
    const ghostOpacity = (on: boolean) => (on ? 0.32 : 0)
    let anyGhost = false
    if (seg === 'married') {
      this.ghosts[0].place(-1.6, -1.6, -2.6).hold(P.STAND_EASY)
      woman.place(-2.3, -2.1, 0.8).hold(P.STAND_EASY)
      woman.visible = true
      anyGhost = true
    } else woman.visible = false
    this.ghosts.forEach((g, i) => {
      g.visible = false
      if (seg === 'married' && i === 0) g.visible = true
      if (seg === 'city' && i === 1) {
        g.place(-1.4, 2.6, PI).hold(P.ARMS_CROSSED)
        g.visible = true
      }
      if (seg === 'never' && i === 2) {
        g.place(2.6, 0.9, -PI / 2).hold(P.STAND)
        g.visible = true
      }
      if (seg === 'remain') {
        // Each appears for a moment, one after another; one sits on the sofa, behind.
        const spots: Array<[number, number, number]> = [
          [-2.4, -2.2, 0],
          [3.2, 0.8, -PI / 2],
          [1.8, 2.45, PI],
          [-1.0, 1.6, PI],
        ]
        const [x, z, yaw] = spots[i]
        const windowStart = i * 0.22
        const on = u > windowStart && u < windowStart + (i === 2 ? 0.7 : 0.16)
        g.place(x, z, yaw).hold(i === 2 ? P.SIT_BACK : P.STAND)
        g.visible = on
      }
      if (g.visible) anyGhost = true
    })
    for (const mat of this.ghostMats) mat.opacity = ghostOpacity(anyGhost)

    // ——— Light: night, then morning, then evening light that never quite settles ———
    const night = !morning
    this.sun.intensity = morning ? 2.4 : 0
    this.hemi.intensity = morning ? 0.7 : lateStory ? 0.18 : 0.25
    this.lamp.intensity = night ? 6 : 1.5
    this.ceilingLight.intensity = night ? (seg === 'died' ? 1.5 : 5) : 2
    ;(this.pal.sky as THREE.MeshBasicMaterial).color.setHex(morning ? 0xbfd4e6 : 0x0b1220)
    this.cityA.visible = seg !== 'city'
    this.cityB.visible = seg === 'city'

    if (!(seg === 'play' || seg === 'voice')) deniz.apply(f.time, !f.reduced)
    if (lying) {
      // On his back along the sofa, head toward the lamp.
      deniz.figure.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)))
      deniz.figure.root.position.set(1.9, 0.52, 2.62)
    }
    other.apply(f.time, !f.reduced)
    woman.apply(f.time, false)
    for (const g of this.ghosts) g.apply(f.time, false)

    // ——— Camera ———
    keyed(SHOTS[seg] ?? SHOTS.open!, held(u, f.reduced), shot)
    shot.fade = seg === 'open' ? 0 : seg === 'night' ? smoothstep(0, 0.35, u) : seg === 'end' ? 1 - smoothstep(0, 0.4, u) : seg === 'sleep' ? 1 - 0.6 * Math.sin(PI * smoothstep(0.5, 1, u)) : 1
    if (seg === 'behind' && u > 0.1 && u < 0.6 && !this.doorGone) shot.request = { id: 'kalan-behind', yaw: PI, pitch: 0, seconds: 3 }
    if (seg === 'recording') shot.handheld = 0.6
  }

  motion(m: SceneInfo['motion']) {
    m.walking = this.deniz.walking
    m.step = this.deniz.step
    m.doors = this.doorGone ? 1 : 0
    m.frame = this.kitchenLife
  }

  dispose() {
    for (const mat of Object.values(this.pal)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
    this.photo.texture.dispose()
    this.sign.texture.dispose()
    disposeTree(this.beyond)
  }
}

export const createKalanScene = (options: SceneOptions): StoryScene => createSetScene(new KalanDirector(), options)
