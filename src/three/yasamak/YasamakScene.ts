/**
 * YAŞAMAK — the internet cafe. Two rows of desks facing a window onto a
 * street whose seasons turn; a wall clock behind Arif that runs faster than
 * his screen; people who age, leave and come back — only while nobody is
 * looking at them. Then the walls fall away toward an event horizon, and at
 * 00:00 there is nothing behind him.
 *
 * World layout (meters): cafe x −6…6, z −5…5 (window wall z = −5, entrance
 * wall z = +5). Row 1 seats at z = 0.6, row 2 at z = −1.6; everyone faces −z.
 * Arif's seat (0.75, 0.6).
 */
import * as THREE from 'three'
import { SEG, local, segmentAt, sessionSeconds, mmss, type SegmentId } from '@/stories/yasamak/timeline'
import { lerp, mulberry32, smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { Figure, type FigureLook } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { box, cyl, disposeTree, mesh } from '../util'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed, type ShotKeys } from '../kit/direct'
import { Crowd, canvasPlane, counter, facade, monitor, officeChair, room, std } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mono, sans } from '../screens'

const PI = Math.PI
const ROW1 = 0.6
const ROW2 = -1.6
const ARIF = { x: 0.75, z: ROW1 }
const CHILD = { x: -0.75, z: ROW1 }
const MOTHER = { x: 2.25, z: ROW1 }
const ELDER = { x: -4.5, z: ROW2 }
const NEAR_ELDER = { x: -3.75, z: -0.95 }
const SEATS1 = [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75]
const SEATS2 = [-4.5, -3, -1.5, 0, 1.5, 3, 4.5]

function palette() {
  return {
    wall: pbr('plaster', 0x2a2723, { roughness: 1 }),
    wallTrim: pbr('wood', 0x3a352f, { roughness: 1 }),
    floor: pbr('laminate', 0x231f1c, { roughness: 1 }),
    ceiling: pbr('plaster', 0x1a1816, { roughness: 1 }),
    desk: pbr('wood', 0x4a3d32, { roughness: 0.9 }),
    deskTop: pbr('laminate', 0x5b4b3e, { roughness: 0.9 }),
    chair: pbr('plastic', 0x1e2125, { roughness: 1 }),
    metal: pbr('metal', 0x6f7277, { roughness: 0.8 }),
    frame: pbr('plastic', 0x15171a, { roughness: 0.9 }),
    counterTop: pbr('laminate', 0x6a5a4a, { roughness: 0.8 }),
    counterBody: pbr('wood', 0x2e2924, { roughness: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fb3c7, roughness: 0.05, transparent: true, opacity: 0.12, depthWrite: false }),
    asphalt: pbr('asphalt', 0x16181b, { roughness: 1 }),
    facadeWall: pbr('brick', 0x1f2228, { roughness: 1 }),
    snow: std(0xe8edf2, 0.9),
    leafAutumn: std(0xb5652a, 0.8),
    leafSpring: std(0x6f9a4a, 0.8),
    trunk: pbr('wood', 0x2a2019, { roughness: 1 }),
    screenOff: new THREE.MeshBasicMaterial({ color: 0x050607 }),
    screenGlow: new THREE.MeshBasicMaterial({ color: 0x6d8fb8 }),
    clockFace: std(0xe8e2d6, 0.6),
    clockHand: std(0x15120f, 0.6),
    // The cast
    skin: std(0xc49a80, 0.55),
    skinHead: std(0xc49a80, 0.52, { vertexColors: true }),
    skinOld: std(0xd2b5a2, 0.6),
    skinOldHead: std(0xd2b5a2, 0.58, { vertexColors: true }),
    eye: std(0x120d0a, 0.15),
    hair: std(0x221b17, 0.75),
    hairGrey: std(0xb9b4ad, 0.8),
    hairChild: std(0x4a3426, 0.75),
    coat: std(0x41372e, 0.88),
    jeans: std(0x262d3a, 0.9),
    cardigan: std(0x7a5f62, 0.92),
    skirt: std(0x3b3440, 0.9),
    shawl: std(0x6b6258, 0.95),
    hoodie: std(0x3d5a6e, 0.9),
    apron: std(0x2b2b2b, 0.85),
    shoe: std(0x161616, 0.7),
    sole: std(0x0d0d0d, 0.8),
    crowdBody: std(0x3b3f45, 0.85),
    crowdHead: std(0xb48d74, 0.6),
    glow: new THREE.MeshBasicMaterial({ color: 0x8fb0d8 }),
  }
}
type Pal = ReturnType<typeof palette>

function look(m: Pal, name: string, kind: 'arif' | 'child' | 'mother' | 'elder' | 'cashier'): FigureLook {
  const base = { name, eye: m.eye, shoes: m.shoe, sole: m.sole, collar: 'crew' as const }
  switch (kind) {
    case 'arif':
      return { ...base, build: 'm', face: { jaw: 0.3, nose: 0.2, lips: 0.045, stubble: 0.3 }, hairStyle: 'short', skin: m.skin, skinHead: m.skinHead, hair: m.hair, top: m.coat, bottom: m.jeans, cuff: m.coat }
    case 'child':
      return { ...base, build: 'm', face: { jaw: 0.1, nose: 0.12, lips: 0.05, stubble: 0 }, hairStyle: 'short', skin: m.skin, skinHead: m.skinHead, hair: m.hairChild, top: m.hoodie, bottom: m.jeans, cuff: m.hoodie }
    case 'mother':
      return { ...base, build: 'f', face: { jaw: 0.16, nose: 0.15, lips: 0.06, stubble: 0 }, hairStyle: 'long', skin: m.skinOld, skinHead: m.skinOldHead, hair: m.hairGrey, top: m.cardigan, bottom: m.skirt, cuff: m.cardigan, height: 0.93 }
    case 'elder':
      return { ...base, build: 'f', face: { jaw: 0.2, nose: 0.17, lips: 0.04, stubble: 0 }, hairStyle: 'short', skin: m.skinOld, skinHead: m.skinOldHead, hair: m.hairGrey, top: m.shawl, bottom: m.skirt, cuff: m.shawl, height: 0.9 }
    case 'cashier':
      return { ...base, build: 'm', face: { jaw: 0.35, nose: 0.2, lips: 0.04, stubble: 0.5 }, hairStyle: 'short', skin: m.skin, skinHead: m.skinHead, hair: m.hair, top: m.apron, bottom: m.jeans, cuff: m.apron }
  }
}

// ——— Seasons outside the window, and the timer on Arif's screen ———

type Season = 'autumn' | 'winter' | 'spring' | 'summer'
function seasonAt(p: number): Season {
  if (p < SEG.child.start) return 'autumn'
  if (p < SEG.returns.start + SEG.returns.len * 0.4) return 'winter'
  if (p < SEG.endless.start) return 'spring'
  if (p < SEG.corner.start) return 'summer'
  return 'autumn'
}

function screenDraw(seconds: number, on: boolean, pain = false) {
  return (c: CanvasRenderingContext2D, W: number, H: number) => {
    c.fillStyle = on ? '#0f141a' : '#030405'
    c.fillRect(0, 0, W, H)
    if (!on) return
    if (pain) {
      c.fillStyle = '#3a2a2a'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#d8c3b0'
      sans(c, 34, 400)
      c.fillText('Torunlar', 40, 70)
      for (let i = 0; i < 6; i++) {
        c.fillStyle = `hsl(${30 + i * 25}, 25%, ${35 + (i % 3) * 8}%)`
        c.fillRect(40 + (i % 3) * 150, 100 + Math.floor(i / 3) * 110, 130, 95)
      }
      return
    }
    // A browser window, and the session clock in the corner.
    c.fillStyle = '#1b2430'
    c.fillRect(24, 24, W - 48, 38)
    c.fillStyle = '#2b3746'
    c.fillRect(24, 80, W * 0.6, H - 110)
    c.fillStyle = '#3a4a5c'
    for (let i = 0; i < 5; i++) c.fillRect(44, 100 + i * 34, W * 0.6 - 60, 12)
    c.fillStyle = '#ffc77f'
    mono(c, 64, 500)
    c.textAlign = 'right'
    c.fillText(mmss(seconds), W - 40, H - 40)
    c.fillStyle = '#8b6a45'
    mono(c, 18, 500)
    c.fillText('KALAN SÜRE', W - 40, H - 120)
    c.textAlign = 'left'
  }
}

const P_DOOR = makePath([
  [3.5, 5.6],
  [3.4, 4.2],
  [-1.8, 3.9],
])
const P_TO_SEAT = makePath([
  [-1.8, 3.9],
  [-0.2, 2.2],
  [0.75, 1.3],
])
const P_TO_ELDER = makePath([
  [ARIF.x, ARIF.z + 0.4],
  [-1.2, 1.4],
  [-3.2, 0.2],
  [NEAR_ELDER.x, NEAR_ELDER.z],
])
const P_BACK = makePath([
  [NEAR_ELDER.x, NEAR_ELDER.z],
  [-2.6, 1.2],
  [0.2, 1.4],
  [ARIF.x, ARIF.z + 0.4],
])

const SHOTS: Partial<Record<SegmentId, ShotKeys>> = {
  open: [[0, [-1.5, 1.6, 2.5, 3.5, 1.3, 4.9, 46]]],
  door: [
    [0, [-1.5, 1.6, 2.5, 3.5, 1.3, 4.9, 46]],
    [1, [-1.2, 1.6, 2.3, 1.5, 1.3, 4.6, 44]],
  ],
  pay: [
    [0, [-1.6, 1.55, 2.4, -3.5, 1.25, 4.3, 40]],
    [1, [-1.8, 1.55, 2.6, -3.4, 1.2, 4.2, 38]],
  ],
  seat: [
    [0, [-5.2, 1.9, -3.8, 1.5, 0.9, 1.2, 50]],
    [1, [-4.8, 1.85, -3.6, 1.2, 0.95, 1.0, 48]],
  ],
  start: [
    [0, [1.12, 1.48, 1.4, 0.75, 1.05, -0.25, 34]],
    [1, [1.05, 1.42, 1.25, 0.75, 1.05, -0.25, 30]],
  ],
  screen: [
    [0, [1.05, 1.42, 1.25, 0.75, 1.05, -0.25, 30]],
    [1, [0.98, 1.36, 1.0, 0.75, 1.05, -0.25, 27]],
  ],
  clock: [
    [0, [0.75, 1.3, -0.9, 0.75, 1.3, 1.5, 44]],
    [1, [0.75, 1.32, -1.0, 0.6, 1.5, 3.5, 44]],
  ],
  child: [
    [0, [-2.4, 1.35, 1.9, 0.0, 1.05, 0.4, 44]],
    [1, [-2.2, 1.32, 1.8, 0.0, 1.05, 0.4, 42]],
  ],
  leave: [
    [0, [5.3, 2.0, 4.2, -1.0, 0.8, -1.0, 52]],
    [1, [5.1, 1.95, 4.0, -1.0, 0.8, -1.0, 50]],
  ],
  returns: [
    [0, [5.1, 1.95, 4.0, -1.0, 0.8, -1.0, 50]],
    [1, [4.9, 1.9, 3.8, -1.0, 0.9, -2.0, 50]],
  ],
  mother: [
    [0, [3.9, 1.32, 2.0, 1.4, 1.05, 0.45, 42]],
    [1, [3.7, 1.3, 1.85, 1.4, 1.05, 0.45, 40]],
  ],
  think: [
    [0, [-0.5, 1.3, 1.6, 0.75, 1.25, 0.5, 34]],
    [1, [-0.4, 1.3, 1.5, 0.75, 1.25, 0.5, 32]],
  ],
  gone: [
    [0, [0.98, 1.36, 1.0, 0.75, 1.05, -0.25, 27]],
    [0.38, [0.98, 1.36, 1.0, 0.75, 1.05, -0.25, 27]],
    [0.42, [1.5, 1.45, -1.9, 1.5, 1.0, 0.8, 46]],
    [1, [1.55, 1.42, -1.75, 1.5, 1.0, 0.8, 44]],
  ],
  endless: [
    [0, [0, 2.5, -4.3, 0, 0.9, 2.5, 56]],
    [1, [0.4, 2.4, -4.2, 0, 0.9, 2.5, 55]],
  ],
  still: [
    [0, [0.4, 2.4, -4.2, 0, 0.9, 2.5, 55]],
    [1, [0.8, 2.3, -4.1, 0, 0.9, 2.5, 54]],
  ],
  meaning: [
    [0, [0.8, 2.3, -4.1, 0, 0.9, 2.5, 54]],
    [1, [1.1, 2.2, -4.0, 0, 0.9, 2.5, 53]],
  ],
  corner: [
    [0, [-1.4, 1.5, 1.2, -4.2, 1.0, -1.8, 44]],
    [1, [-2.2, 1.45, 0.6, -4.3, 1.0, -1.8, 42]],
  ],
  pain: [
    [0, [-3.5, 1.35, -0.75, -4.5, 1.05, -2.25, 36]],
    [1, [-3.6, 1.32, -0.85, -4.5, 1.05, -2.25, 34]],
  ],
  // Across her desk: both of them, the screen between.
  owner: [
    [0, [-2.5, 1.45, -3.0, -4.1, 1.15, -1.25, 46]],
    [1, [-2.65, 1.42, -2.9, -4.1, 1.15, -1.25, 42]],
  ],
  answer: [
    [0, [-5.4, 1.6, 0.4, -4.3, 1.0, -1.9, 40]],
    [1, [-5.3, 1.55, 0.2, -4.3, 1.0, -1.9, 38]],
  ],
  depart: [
    [0, [0.95, 1.5, 1.9, 0.75, 1.3, -8, 50]],
    [1, [0.9, 1.5, 2.1, 0.6, 1.8, -30, 54]],
  ],
  horizon: [
    [0, [0.9, 1.5, 2.1, 0.6, 1.8, -30, 54]],
    [1, [0.85, 1.55, 2.4, 0.3, 2.6, -70, 58]],
  ],
  dilation: [
    [0, [3.5, 2.3, 3.6, 0, 1.0, -3, 60]],
    [1, [3.2, 2.2, 3.4, 0, 1.0, -3, 58]],
  ],
  slow: [
    [0, [1.3, 1.4, 1.2, 0.75, 1.1, -0.2, 40]],
    [1, [1.2, 1.38, 1.1, 0.75, 1.1, -0.2, 36]],
  ],
  one: [
    [0, [0.95, 1.2, 0.55, 0.75, 1.05, -0.25, 32]],
    [1, [0.9, 1.15, 0.4, 0.75, 1.05, -0.25, 28]],
  ],
  zero: [
    [0, [0.9, 1.15, 0.4, 0.75, 1.05, -0.25, 28]],
    [1, [1.3, 1.32, 1.05, 0.75, 1.05, -0.25, 38]],
  ],
  behind: [
    [0, [1.3, 1.32, 1.05, 0.75, 1.05, -0.25, 42]],
    [1, [1.3, 1.32, 1.05, 0.75, 1.05, -0.25, 46]],
  ],
  last: [[0, [1.3, 1.32, 1.05, 0.75, 1.05, -0.25, 46]]],
}

class YasamakDirector implements SetDirector {
  private pal = palette()
  private arif!: Actor
  private child!: Actor
  private mother!: Actor
  private elder!: Actor
  private cashier!: Actor
  private crowd!: Crowd
  private arifScreen!: ReturnType<typeof canvasPlane>
  private elderScreen!: ReturnType<typeof canvasPlane>
  private otherScreens: THREE.Mesh[] = []
  private cafe = new THREE.Group()
  private walls!: THREE.Group
  private wallMats: THREE.MeshStandardMaterial[] = []
  private outside = new THREE.Group()
  private snow!: THREE.Points
  private tree!: { leaves: THREE.Mesh; group: THREE.Group }
  private space = new THREE.Group()
  private disk!: THREE.Mesh
  private hand = { minute: new THREE.Object3D(), hour: new THREE.Object3D() }
  private door!: THREE.Object3D
  private lights: THREE.PointLight[] = []
  private hemi!: THREE.HemisphereLight
  private streetLight!: THREE.PointLight
  // What changes only when no one is looking.
  private childStage = 0
  private childAway = 0
  private motherGone = false
  private motherAway = 0
  private crowdState: Array<{ shown: boolean; age: number; away: number }> = []
  private v = new THREE.Vector3()
  /** What survives 00:00. */
  private keep: THREE.Object3D[] = []

  build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.pal
    scene.environment = ctx.environment
    scene.environmentIntensity = 0.18
    scene.background = new THREE.Color(0x020203)
    scene.add(this.cafe, this.outside, this.space)

    // ——— The cafe ———
    const shell = room({
      w: 12,
      d: 10,
      h: 3,
      wall: m.wall,
      floor: m.floor,
      ceiling: m.ceiling,
      openings: [
        { side: 'n', at: 0, width: 10, height: 1.8, bottom: 0.8 },
        { side: 's', at: 3.5, width: 1.0, height: 2.1 },
      ],
    })
    this.walls = shell
    shell.traverse((o) => {
      const mo = o as THREE.Mesh
      if (!mo.isMesh) return
      const c = (mo.material as THREE.MeshStandardMaterial).clone()
      c.transparent = true
      mo.material = c
      this.wallMats.push(c)
    })
    this.cafe.add(shell)
    mesh(new THREE.PlaneGeometry(10, 1.8), m.glass, 0, 1.7, -4.99, this.cafe)
    for (let i = 0; i <= 5; i++) box(0.06, 1.8, 0.08, m.frame, -5 + i * 2, 1.7, -5.0, this.cafe)
    this.door = box(1.0, 2.1, 0.05, m.wallTrim, 3.5, 1.05, 5.02, this.cafe)
    // Desks, chairs, monitors.
    const seat = (x: number, z: number, i: number) => {
      const c = officeChair(m.chair, m.metal)
      c.position.set(x, 0, z)
      c.rotation.y = PI
      this.cafe.add(c)
      const mon = monitor(m.frame, i === -1 ? m.screenOff : m.screenGlow, 0.5, 0.31)
      mon.group.position.set(x, 1.0, z - 0.82)
      this.cafe.add(mon.group)
      if (z === ROW1 && x === ARIF.x) this.keep.push(c, mon.group)
      return mon.screen
    }
    for (const [row, zs] of [
      [SEATS1, ROW1],
      [SEATS2, ROW2],
    ] as const) {
      box(row.length * 1.5 + 0.3, 0.05, 0.75, m.deskTop, (row[0] + row[row.length - 1]) / 2, 0.74, zs - 0.75, this.cafe)
      box(row.length * 1.5 + 0.3, 0.7, 0.04, m.desk, (row[0] + row[row.length - 1]) / 2, 0.37, zs - 1.1, this.cafe)
      row.forEach((x, i) => {
        const isArif = zs === ROW1 && x === ARIF.x
        const isElder = zs === ROW2 && x === ELDER.x
        const screen = seat(x, zs, isArif || isElder ? -1 : i)
        if (!isArif && !isElder) this.otherScreens.push(screen)
      })
    }
    this.arifScreen = canvasPlane(0.5, 0.31, 768, screenDraw(3600, true), { emissive: true })
    this.arifScreen.mesh.position.set(ARIF.x, 1.0, ARIF.z - 0.815)
    this.cafe.add(this.arifScreen.mesh)
    this.elderScreen = canvasPlane(0.5, 0.31, 512, screenDraw(0, true, true), { emissive: true })
    this.elderScreen.mesh.position.set(ELDER.x, 1.0, ELDER.z - 0.815)
    this.cafe.add(this.elderScreen.mesh)
    // A receipt on Arif's desk.
    const receipt = canvasPlane(0.07, 0.12, 128, (c, W, H) => {
      c.fillStyle = '#efe9dc'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#3a3530'
      mono(c, 12, 500)
      c.fillText('1 SAAT', 12, 30)
      c.fillText('ÖDENDİ', 12, 50)
    })
    receipt.mesh.rotation.set(-PI / 2, 0, 0.3)
    receipt.mesh.position.set(1.2, 0.768, -0.15)
    this.cafe.add(receipt.mesh)
    // The counter and the clock behind everyone.
    const ctr = counter(2.4, 0.7, 1.05, m.counterTop, m.counterBody)
    ctr.position.set(-3.5, 0, 4.0)
    this.cafe.add(ctr)
    const clock = new THREE.Group()
    clock.position.set(0, 2.3, 4.93)
    clock.rotation.y = PI
    cyl(0.28, 0.28, 0.04, m.clockFace, 0, 0, 0, clock, 40).rotation.x = PI / 2
    for (let i = 0; i < 12; i++) {
      const t = box(0.012, 0.04, 0.005, m.clockHand, Math.sin((i / 12) * PI * 2) * 0.24, Math.cos((i / 12) * PI * 2) * 0.24, 0.022, clock)
      t.rotation.z = -(i / 12) * PI * 2
    }
    for (const [hnd, len, w] of [
      [this.hand.hour, 0.13, 0.016],
      [this.hand.minute, 0.21, 0.01],
    ] as const) {
      hnd.position.z = 0.03
      box(w, len, 0.005, m.clockHand, 0, len / 2, 0, hnd)
      clock.add(hnd)
    }
    this.cafe.add(clock)

    // ——— Outside: the street, a tree, snow ———
    const road = mesh(new THREE.PlaneGeometry(40, 18), m.asphalt, 0, -0.01, -14, this.outside)
    road.rotation.x = -PI / 2
    const ground = mesh(new THREE.PlaneGeometry(40, 18), m.snow, 0, 0.0, -14, this.outside)
    ground.rotation.x = -PI / 2
    ground.name = 'snowGround'
    const across = facade({ w: 36, h: 14, d: 4, wall: m.facadeWall, facing: 1, seed: 51, lit: 0.4 })
    across.rotation.y = PI / 2
    across.position.set(0, 0, -23)
    this.outside.add(across)
    const treeGroup = new THREE.Group()
    treeGroup.position.set(-2.5, 0, -9)
    cyl(0.12, 0.18, 3.2, m.trunk, 0, 1.6, 0, treeGroup, 10)
    const leaves = mesh(new THREE.IcosahedronGeometry(1.5, 1), m.leafAutumn, 0, 3.6, 0, treeGroup)
    this.tree = { leaves, group: treeGroup }
    this.outside.add(treeGroup)
    const flakes = new Float32Array(900 * 3)
    const rand = mulberry32(5)
    for (let i = 0; i < 900; i++) flakes.set([(rand() - 0.5) * 24, rand() * 8, -6 - rand() * 14], i * 3)
    const snowGeo = new THREE.BufferGeometry()
    snowGeo.setAttribute('position', new THREE.BufferAttribute(flakes, 3))
    this.snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 }))
    this.outside.add(this.snow)
    this.streetLight = new THREE.PointLight(0xffc98a, 24, 22, 1.5)
    this.streetLight.position.set(2, 4.5, -9)
    // Lights stay in the scene (hiding one recompiles every material); they are dimmed instead.
    scene.add(this.streetLight)

    // ——— Space: stars, the event horizon, its disk ———
    const stars = new Float32Array(2600 * 3)
    for (let i = 0; i < 2600; i++) {
      const u = rand() * 2 - 1
      const a = rand() * PI * 2
      const r = 150
      const s = Math.sqrt(1 - u * u)
      stars.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(stars, 3))
    this.space.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.35, sizeAttenuation: true })))
    // The black hole: a camera-facing card shaded as a lensed Schwarzschild hole
    // (units of the shadow radius, 7 m): the shadow, the thin photon ring, the
    // disk seen nearly edge-on crossing in front of it, and the far side of the
    // disk bent over the top and under the bottom. The approaching side is
    // brighter and bluer (Doppler beaming); the gas turns faster further in.
    this.disk = mesh(
      new THREE.PlaneGeometry(84, 84),
      new THREE.ShaderMaterial({
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          varying vec2 vP;
          void main(){
            vP = position.xy / 7.0;
            vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            c.xy += position.xy;
            gl_Position = projectionMatrix * c;
          }`,
        fragmentShader: `
          uniform float uTime; varying vec2 vP;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p){
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          // Disk light at radius R (shadow radii) and azimuth phi; side > 0 is coming toward us.
          vec3 disk(float R, float phi, float side){
            float edge = smoothstep(1.2, 1.42, R) * smoothstep(5.2, 3.0, R);
            if (edge <= 0.0) return vec3(0.0);
            float t = pow(1.25 / R, 1.5);
            float omega = 0.42 / pow(R, 1.5);
            float a = phi - uTime * omega;
            float lanes = 0.55 + 0.45 * noise(vec2(a * 5.0, R * 7.0));
            float fine = 0.75 + 0.25 * noise(vec2(a * 19.0, R * 23.0));
            float beam = 1.0 + 0.6 * side;
            vec3 col = mix(vec3(1.0, 0.42, 0.13), vec3(1.0, 0.88, 0.72), t);
            col = mix(col, col * vec3(0.82, 0.95, 1.2), clamp(side, 0.0, 1.0) * 0.6);
            return col * edge * t * lanes * fine * beam * 2.6;
          }
          void main(){
            vec2 p = vP;
            float r = length(p);
            float shadow = 1.0 - smoothstep(0.985, 1.0, r);
            // Primary image: the disk plane, nearly edge-on (cos i = 0.11).
            float ci = 0.11;
            vec2 q = vec2(p.x, p.y / ci);
            float Rp = length(q);
            bool near = p.y < 0.0;
            vec3 prim = disk(Rp, atan(q.y, q.x), -q.x / max(Rp, 1e-3));
            if (!near) prim *= smoothstep(1.0, 1.03, r);
            // Secondary image: the far side lensed around the shadow, fullest above and below.
            float phiS = atan(p.y, p.x);
            // The lensed image is compressed into a thin band hugging the shadow.
            float Rs = 1.25 + max(r - 1.03, 0.0) * 11.0;
            float arc = smoothstep(1.02, 1.05, r) * (0.25 + 0.75 * pow(abs(sin(phiS)), 1.5)) * (p.y > 0.0 ? 1.0 : 0.6);
            vec3 sec = disk(Rs, phiS * 2.0 + 1.3, -cos(phiS)) * arc * 1.1;
            // Photon ring.
            float ring = exp(-pow((r - 1.012) / 0.01, 2.0)) * 1.4 * (0.8 + 0.4 * (0.5 - 0.5 * cos(phiS)));
            vec3 col = sec + vec3(1.0, 0.86, 0.72) * ring;
            col *= 1.0 - shadow;
            col += prim * (near ? 1.0 : 1.0 - shadow);
            float lum = max(max(col.r, col.g), col.b);
            gl_FragColor = vec4(col, clamp(max(shadow, lum), 0.0, 1.0));
          }`,
      }),
      0,
      6,
      -80,
      this.space,
    )
    this.disk.renderOrder = 2
    this.disk.frustumCulled = false
    this.space.visible = false

    // ——— Light ———
    this.hemi = new THREE.HemisphereLight(0xffe2c0, 0x18120d, 0.35)
    scene.add(this.hemi)
    for (const [x, z] of [
      [-3, 0],
      [2, 0],
      [-2, 3.5],
      [2.5, 3.5],
    ] as const) {
      const l = new THREE.PointLight(0xffc68e, 7, 8, 1.6)
      l.position.set(x, 2.8, z)
      this.lights.push(l)
      scene.add(l)
    }

    // ——— Cast ———
    const mk = (name: string, kind: Parameters<typeof look>[2]) => {
      const f = new Figure(look(m, name, kind))
      scene.add(f.root)
      return new Actor(f)
    }
    this.arif = mk('Arif', 'arif')
    this.child = mk('Çocuk', 'child')
    this.mother = mk('Anne', 'mother')
    this.elder = mk('Yaşlı kadın', 'elder')
    this.cashier = mk('Kasiyer', 'cashier')
    this.crowd = new Crowd(9, m.crowdBody, m.crowdHead, m.glow)
    scene.add(this.crowd.group)
    for (let i = 0; i < 9; i++) this.crowdState.push({ shown: true, age: 0, away: 0 })
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const { arif, child, mother, elder, cashier } = this
    const m = this.pal
    arif.begin()
    child.begin()
    mother.begin()
    elder.begin()
    cashier.begin().place(-3.5, 4.75, PI).hold(P.STAND_EASY)

    // ——— Arif ———
    switch (seg) {
      case 'open':
      case 'door':
        arif.walk(P_DOOR, seg === 'open' ? 0 : smoothstep(0.05, 0.95, u), P.STAND, PI)
        break
      case 'pay':
        arif.place(-1.8, 3.9, PI / 2 + 0.6).hold(P.STAND).lookAt(-3.5, 4.75)
        arif.reach('r', smoothstep(0.25, 0.4, u) * (1 - smoothstep(0.55, 0.7, u)), -2.4, 1.07, 3.95)
        break
      case 'seat':
        if (u < 0.55) arif.walk(P_TO_SEAT, u / 0.55, P.STAND, PI / 2, PI)
        else arif.place(ARIF.x, lerp(1.3, ARIF.z, smoothstep(0.55, 0.75, u)), PI).blend([
          [0.55, P.STAND],
          [0.8, P.SIT_TYPE],
        ], u)
        break
      case 'corner':
        if (u < 0.15) arif.place(ARIF.x, ARIF.z, PI).blend([
          [0, P.SIT_TYPE],
          [0.15, P.STAND],
        ], u)
        else arif.walk(P_TO_ELDER, smoothstep(0.15, 0.85, u), P.STAND, PI, -2.4)
        break
      case 'pain':
      case 'owner':
      case 'answer':
        arif.place(NEAR_ELDER.x, NEAR_ELDER.z, -2.4).hold(seg === 'owner' ? P.STAND_EASY : P.ARMS_CROSSED).lookAt(ELDER.x, ELDER.z)
        if (seg === 'answer' && u > 0.6) arif.walk(P_BACK, smoothstep(0.6, 1, u), P.STAND, -2.4, PI)
        break
      case 'depart':
        arif.place(ARIF.x, ARIF.z, PI).blend([
          [0, P.STAND],
          [0.3, P.SIT_TYPE],
        ], u)
        break
      default:
        arif.place(ARIF.x, ARIF.z, PI).hold(f.p >= SEG.endless.start && f.p < SEG.corner.start ? P.SIT_BACK : seg === 'think' || seg === 'gone' ? P.SIT_SLUMP : P.SIT_TYPE)
        if (seg === 'mother') arif.lookAt(MOTHER.x, MOTHER.z, 0.4 * smoothstep(0.2, 0.5, u))
    }

    // ——— Those around him ———
    const ageTarget = f.p < SEG.child.start ? 0 : f.p < SEG.child.start + SEG.child.len * 0.5 ? 1 : 2
    this.childAway = this.track(child.figure, f, this.childAway)
    if (this.childStage < ageTarget && this.childAway > 0.6) this.childStage++
    if (f.p < SEG.child.start) this.childStage = 0
    const scale = [0.66, 0.84, 1][this.childStage]
    child.figure.root.scale.setScalar(scale)
    child.place(CHILD.x, CHILD.z, PI).hold(this.childStage === 0 ? P.SIT_TYPE : this.childStage === 1 ? P.SIT_BACK : P.SIT_TYPE)
    child.visible = f.p < SEG.dilation.start + SEG.dilation.len * 0.3

    // Mother: there, always — until no one is looking.
    this.motherAway = this.track(mother.figure, f, this.motherAway)
    if (f.p < SEG.gone.start) this.motherGone = false
    else if (!this.motherGone && (this.motherAway > 0.4 || f.p > SEG.gone.end)) this.motherGone = true
    mother.place(MOTHER.x, MOTHER.z, PI).hold(P.SIT_TYPE)
    mother.visible = f.p >= SEG.mother.start - SEG.clock.len && !this.motherGone

    elder.place(ELDER.x, ELDER.z, PI).hold(f.p >= SEG.answer.start + SEG.answer.len * 0.4 ? P.SIT_BACK : P.SIT_SLUMP)
    if (seg === 'owner') elder.lookAt(NEAR_ELDER.x, NEAR_ELDER.z, smoothstep(0.05, 0.2, u))
    elder.visible = f.p >= SEG.child.start && f.p < SEG.dilation.start + SEG.dilation.len * 0.55

    this.placeCrowd(f)

    // ——— The world around the cafe ———
    const season = seasonAt(f.p)
    const ground = this.outside.getObjectByName('snowGround')!
    ground.visible = season === 'winter'
    this.snow.visible = season === 'winter'
    if (this.snow.visible) this.snow.position.y = -((f.time * 0.6) % 8)
    this.tree.leaves.visible = season !== 'winter'
    this.tree.leaves.material = season === 'spring' || season === 'summer' ? m.leafSpring : m.leafAutumn
    this.tree.leaves.scale.setScalar(season === 'summer' ? 1.15 : season === 'spring' ? 0.9 : 1)

    // The session clock on his screen, and the wall clock behind him that runs faster.
    const secs = sessionSeconds(f.p)
    const screenOn = !(seg === 'zero' && u > 0.34) && seg !== 'behind' && seg !== 'last'
    this.arifScreen.redraw(screenDraw(secs, screenOn), `${secs}:${screenOn}`)
    this.elderScreen.mesh.visible = elder.visible
    const wallMinutes = 19 * 60 + 12 + (f.p - SEG.start.start) * 60 * 26
    this.hand.minute.rotation.z = -((wallMinutes % 60) / 60) * PI * 2
    this.hand.hour.rotation.z = -(((wallMinutes / 60) % 12) / 12) * PI * 2

    // ——— Toward the event horizon ———
    const away = smoothstep(SEG.depart.start + SEG.depart.len * 0.2, SEG.horizon.start + SEG.horizon.len * 0.6, f.p)
    const voidNow = f.p >= SEG.zero.start + SEG.zero.len * 0.4
    for (const mat of this.wallMats) {
      mat.opacity = 1 - away
      mat.depthWrite = away < 0.5
    }
    this.walls.visible = away < 0.999
    this.outside.visible = away < 0.6
    this.streetLight.intensity = this.outside.visible ? 24 : 0
    this.space.visible = away > 0.01 && !voidNow
    ;(this.disk.material as THREE.ShaderMaterial).uniforms.uTime.value = f.time
    for (const s of this.otherScreens) s.visible = away < 0.9 && !voidNow
    // At 00:00: nothing behind him. Only his chair, his dark screen and him remain.
    for (const c of this.cafe.children) {
      if (c === this.arifScreen.mesh || c === this.walls) continue
      c.visible = !voidNow || this.keep.includes(c)
    }
    cashier.visible = f.p < SEG.dilation.start + SEG.dilation.len * 0.2
    this.door.rotation.y = seg === 'door' ? -1.2 * Math.sin(PI * smoothstep(0.05, 0.5, u)) : 0

    // Light: the cafe dims as it empties; a cold light from the horizon.
    const dim = smoothstep(SEG.dilation.start, SEG.slow.end, f.p)
    for (const l of this.lights) l.intensity = (voidNow ? 0 : 7) * (1 - 0.6 * dim)
    this.hemi.intensity = voidNow ? 0.08 : 0.35 * (1 - 0.5 * dim) + away * 0.25
    this.hemi.color.setRGB(1, lerp(0.89, 0.7, away), lerp(0.75, 0.55, away))

    arif.apply(f.time, !f.reduced)
    child.apply(f.time, !f.reduced)
    mother.apply(f.time, !f.reduced)
    elder.apply(f.time, !f.reduced)
    cashier.apply(f.time, !f.reduced)

    // ——— Camera ———
    keyed(SHOTS[seg] ?? SHOTS.open!, held(u, f.reduced), shot)
    shot.fade = seg === 'open' ? 0 : seg === 'door' ? smoothstep(0, 0.35, u) : seg === 'last' ? 1 - smoothstep(0.4, 0.9, u) : 1
    if (seg === 'behind' && u > 0.15 && u < 0.7 && !f.seen.has('void-behind')) shot.request = { id: 'yasamak-behind', yaw: PI, pitch: 0, seconds: 3.2 }
  }

  /** Seconds a figure has been out of the reader's view (resets when seen). */
  private track(fig: Figure, f: SetFrame, away: number) {
    fig.joints.head.getWorldPosition(this.v)
    return f.inView(this.v, 0.5) ? 0 : away + f.dt
  }

  /** The other customers: they leave, come back older, or are replaced — while unwatched. */
  private placeCrowd(f: SetFrame) {
    const c = this.crowd
    const col = new THREE.Color()
    const seats: Array<[number, number]> = [
      [SEATS1[0], ROW1],
      [SEATS1[1], ROW1],
      [SEATS1[5], ROW1],
      [SEATS2[1], ROW2],
      [SEATS2[2], ROW2],
      [SEATS2[3], ROW2],
      [SEATS2[4], ROW2],
      [SEATS2[5], ROW2],
      [SEATS2[6], ROW2],
    ]
    const phase = f.p < SEG.leave.start ? 0 : f.p < SEG.returns.start ? 1 : f.p < SEG.dilation.start ? 2 : 3
    seats.forEach(([x, z], i) => {
      const s = this.crowdState[i]
      this.v.set(x, 1.3, z)
      s.away = f.inView(this.v, 0.5) ? 0 : s.away + f.dt
      // What each seat should become; it only becomes it while no one is watching.
      const wantShown = phase === 0 ? true : phase === 1 ? i !== 4 : phase === 2 ? true : f.p < SEG.dilation.start + SEG.dilation.len * (0.1 + i * 0.09)
      const wantAge = phase >= 2 ? (i === 4 ? 2 : 1) : 0
      if (f.p < SEG.leave.start) {
        s.shown = true
        s.age = 0
      } else if (s.away > 0.5 || f.p >= SEG.dilation.start) {
        s.shown = wantShown
        s.age = wantAge
      }
      const old = s.age
      col.setHSL(0.6 - i * 0.04, 0.1 - old * 0.04, 0.26 + old * 0.12)
      c.set(i, x, z - 0.05, PI, { visible: s.shown && f.p < SEG.zero.start, color: col, scale: 0.78 - old * 0.03, headDown: 0.5 + old * 0.3 })
    })
    c.commit()
  }

  motion(m: SceneInfo['motion']) {
    m.walking = this.arif.walking
    m.step = this.arif.step
    m.frame = this.motherGone ? 1 : 0
  }

  dispose() {
    for (const mat of this.wallMats) mat.dispose()
    for (const mat of Object.values(this.pal)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
    this.arifScreen.texture.dispose()
    this.elderScreen.texture.dispose()
    disposeTree(this.crowd.group)
  }
}

export const createYasamakScene = (options: SceneOptions): StoryScene => createSetScene(new YasamakDirector(), options)
