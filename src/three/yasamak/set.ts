/**
 * The internet cafe, built once: one room (x −6…6, z −5…5, 3 m high), the
 * window wall onto a street with a plane tree, the door behind everyone with
 * its bell, the counter with the register and the cashier's monitor, the wall
 * clock, two long rows of desks. Two eras of dressing share the furniture:
 * the child's (beige CRTs, posters, ceiling fans, the price board, fluorescent
 * panels) and the man's (flat panels, tungsten pendants, an air conditioner,
 * the note on the counter). Everything here is static or driven by the
 * director through the handles this module returns.
 *
 * Layout: docs/stories/yasamak.md, "World layout".
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import type { BuildContext } from '../kit/SetScene'
import { canvasPlane, ceilingPanel, counter, facade, hardware, keyboard, mouse, officeChair, radiator, rbox, room, streetLamp, tube, turned, car } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { sans } from '../screens'
import { Surface, staticTexture, strangerScreen, teenScreen, adminScreen, CORNER_UV, type Era } from './screens'

const PI = Math.PI

export const ROW1_Z = 0.6
export const ROW2_Z = -1.6
export const DESK_Y = 0.765
export const X1 = [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75]
export const X2 = [-4.5, -3, -1.5, 0, 1.5, 3, 4.5]
/** Desks whose chairs move (the people of his life sit there). */
export const LIVE_DESKS = [3, 4, 5, 6, 9, 11]
/** Desks with screens of their own (the rest share static pictures). */
export const HERO_DESKS = [3, 4, 5, 6, 9, 11]

export const DOOR = { x: 3.5, z: 5, w: 1.0, h: 2.1 }
export const COUNTER = { x: -3.5, z: 4.0, w: 2.4, d: 0.7, h: 1.05 }
export const NOTE_POS = new THREE.Vector3(-3.0, 1.067, 3.79)
export const COIN_CRACK = new THREE.Vector3(0.4, 0.766, 0.205)

export type Desk = {
  n: number
  x: number
  row: 1 | 2
  /** Seat centre z. */
  chairZ: number
  /** Desk-top centre z. */
  topZ: number
  /** Keyboard centre (world) and mouse. */
  kb: THREE.Vector3
  mouse: THREE.Vector3
  screen: THREE.Mesh
  surface: Surface | null
  chair: THREE.Group
}

function monZ(row: 1 | 2, era: Era) {
  const base = row === 1 ? -0.22 : -2.42
  return era === 'kid' ? base + 0.07 : base
}
/** Screen size by era. */
export const SCREEN_SIZE: Record<Era, [number, number]> = {
  kid: [0.37, 0.28],
  adult: [0.5, 0.31],
}
export const SCREEN_Y: Record<Era, number> = { kid: 1.0, adult: 1.0 }
/** How far the lit screen sits in front of the monitor's face plane. */
export const SCREEN_GAP: Record<Era, number> = { kid: 0.005, adult: 0.002 }

/** Places a desk's screen plane for an era. */
export function poseScreen(d: Desk, era: Era) {
  const [w, h] = SCREEN_SIZE[era]
  d.screen.position.set(d.x, SCREEN_Y[era], monZ(d.row, era) + SCREEN_GAP[era])
  d.screen.scale.set(w, h, 1)
}

/** Where the KALAN SÜRE readout of desk n is, in the world, for an era. */
export function cornerOf(d: Desk, era: Era, out = new THREE.Vector3()) {
  const [w, h] = SCREEN_SIZE[era]
  return out.set(d.x + (CORNER_UV.x - 0.5) * w, SCREEN_Y[era] + (0.5 - CORNER_UV.y) * h, monZ(d.row, era) + 0.003)
}
/** Where a screen's centre is. */
export function screenOf(d: Desk, era: Era, out = new THREE.Vector3()) {
  return out.set(d.x, SCREEN_Y[era], monZ(d.row, era) + SCREEN_GAP[era])
}

/** Merges every plain mesh under `src` into one mesh per material (static set dressing). */
function bake(src: THREE.Object3D, name: string) {
  src.updateMatrixWorld(true)
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const loose: THREE.Object3D[] = []
  src.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    if ((m as THREE.InstancedMesh).isInstancedMesh || Array.isArray(m.material)) {
      loose.push(m)
      return
    }
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k)
    if (!g.attributes.normal) g.computeVertexNormals()
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    g.applyMatrix4(m.matrixWorld)
    const list = buckets.get(m.material as THREE.Material) ?? []
    list.push(g)
    buckets.set(m.material as THREE.Material, list)
  })
  const out = new THREE.Group()
  out.name = name
  for (const [mat, list] of buckets) {
    const merged = mergeGeometries(list)
    list.forEach((g) => g.dispose())
    if (!merged) continue
    const mm = new THREE.Mesh(merged, mat)
    mm.castShadow = true
    mm.receiveShadow = true
    out.add(mm)
  }
  for (const o of loose) {
    const w = o.matrixWorld.clone()
    o.removeFromParent()
    o.matrixAutoUpdate = true
    w.decompose(o.position, o.quaternion, o.scale)
    out.add(o)
  }
  // Dispose the sources' geometries (the merged copies own their data now).
  src.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && !loose.includes(m)) m.geometry.dispose()
  })
  return out
}

function palette() {
  const hw = hardware()
  return {
    hw,
    wall: pbr('plaster', 0xc4b59c),
    ceiling: pbr('plaster', 0xd9d1c3),
    wainscot: pbr('wood', 0x5e412b),
    trim: pbr('wood', 0x4a3322),
    floor: pbr('planks', 0x5a4030),
    deskTop: pbr('wood', 0x87643f),
    deskEdge: pbr('wood', 0x5a3f28),
    deskBody: pbr('wood', 0x4f3826),
    chairFabric: pbr('fabric', 0x2a2f3a),
    chairMetal: pbr('metal', 0x5b5e63, { roughness: 0.55 }),
    crt: pbr('plastic', 0xcfc5aa, { roughness: 0.6 }),
    crtDark: pbr('plastic', 0x8c846f, { roughness: 0.7 }),
    flat: pbr('plastic', 0x141619, { roughness: 0.45 }),
    kbKid: pbr('plastic', 0xd3cab0, { roughness: 0.65 }),
    kbKidCaps: pbr('plastic', 0xe6dfcb, { roughness: 0.6 }),
    towerKid: pbr('plastic', 0xcfc6ab, { roughness: 0.65 }),
    counterBody: pbr('wood', 0x553a26),
    counterTop: pbr('wood', 0x6d4c33, { roughness: 0.7 }),
    frame: pbr('metal', 0x2b2d30, { roughness: 0.5 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xc8d6e0,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      envMapIntensity: 0.6,
    }),
    brass: pbr('metal', 0xb38b45, { roughness: 0.3 }),
    paper: pbr('paper', 0xefe6cf),
    paperOld: pbr('paper', 0xe0cf9a),
    tape: new THREE.MeshStandardMaterial({
      color: 0xe8e2c8,
      roughness: 0.4,
      transparent: true,
      opacity: 0.55,
    }),
    screenOff: new THREE.MeshStandardMaterial({
      color: 0x07090c,
      roughness: 0.18,
      metalness: 0.2,
    }),
    crack: new THREE.MeshBasicMaterial({ color: 0x0a0806 }),
    coin: pbr('metal', 0xc9b27a, { roughness: 0.35 }),
    coinRim: pbr('metal', 0xb8bcc0, { roughness: 0.35 }),
    // Outside
    asphalt: pbr('asphalt', 0x3a3c40),
    paving: pbr('paving', 0x8d8780),
    curb: pbr('concrete', 0x9a958c),
    brick: pbr('brick', 0x8a5e4a),
    plasterOut: pbr('plaster', 0xb7a88f),
    bark: pbr('wood', 0x6d6a5c, { roughness: 1 }),
    snow: new THREE.MeshStandardMaterial({
      color: 0xf2f5f8,
      roughness: 0.85,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    }),
    lampGlow: new THREE.MeshBasicMaterial({ color: 0xffc27a }),
    lampPole: pbr('metal', 0x2e3134, { roughness: 0.55 }),
    carBody: pbr('painted', 0x7b2a24, { roughness: 0.35 }),
    carGlass: new THREE.MeshStandardMaterial({
      color: 0x0d1418,
      roughness: 0.08,
      metalness: 0.4,
    }),
    carLight: new THREE.MeshBasicMaterial({ color: 0xf4e6c4 }),
    doorLeaf: pbr('painted', 0x3b4a44, { roughness: 0.5 }),
    poster: [] as THREE.Material[],
    fanBlade: pbr('wood', 0x6b4a2e),
    fanBody: pbr('metal', 0xd8d4c8, { roughness: 0.4 }),
    shade: pbr('metal', 0x2f4a3c, { roughness: 0.45, side: THREE.DoubleSide }),
    bulb: new THREE.MeshBasicMaterial({ color: 0xffd59a }),
    panelOn: new THREE.MeshBasicMaterial({ color: 0xeef4ff }),
    ac: pbr('plastic', 0xe9e8e2, { roughness: 0.5 }),
    shelf: pbr('wood', 0x5a3e29),
    boxes: [pbr('paper', 0xb98a52), pbr('plastic', 0x2f4c6e), pbr('plastic', 0x8a2f2a)],
    kettle: pbr('metal', 0xbfc3c7, { roughness: 0.25 }),
    radiator: pbr('painted', 0xe6e1d6, { roughness: 0.5 }),
  }
}
export type SetPalette = ReturnType<typeof palette>

/** A beige CRT whose screen faces +z; its front at z = 0. */
function crt(m: SetPalette) {
  const g = new THREE.Group()
  rbox(0.46, 0.39, 0.05, m.crt, 0, 0, -0.025, g, 0.02)
  rbox(0.4, 0.33, 0.24, m.crt, 0, 0.005, -0.17, g, 0.04)
  rbox(0.3, 0.24, 0.12, m.crt, 0, 0.01, -0.33, g, 0.04)
  // Screen recess.
  rbox(0.395, 0.305, 0.006, m.crtDark, 0, 0.012, 0.0, g, 0.006)
  // Base swivel and a power button.
  cyl(0.11, 0.13, 0.025, m.crt, 0, -0.205, -0.12, g, 24)
  rbox(0.2, 0.02, 0.18, m.crt, 0, -0.19, -0.12, g, 0.008)
  cyl(0.008, 0.008, 0.008, m.crtDark, 0.17, -0.165, 0.002, g, 12).rotation.x = PI / 2
  mesh(new THREE.CircleGeometry(0.003, 10), m.hw.ledGreen, 0.145, -0.165, 0.003, g)
  return g
}

/** A slim flat panel whose screen face is at z = 0 (centre at the origin), on a short stand down to the desk 0.235 below. */
function flatPanel(m: SetPalette, w: number, h: number) {
  const g = new THREE.Group()
  rbox(w + 0.02, h + 0.022, 0.016, m.flat, 0, 0, -0.008, g, 0.004)
  rbox(w * 0.86, h * 0.76, 0.03, m.flat, 0, -0.01, -0.03, g, 0.012)
  rbox(w + 0.02, 0.018, 0.01, m.flat, 0, -h / 2 - 0.013, -0.004, g, 0.003)
  mesh(new THREE.CircleGeometry(0.0022, 10), hardware().ledBlue, w / 2 - 0.02, -h / 2 - 0.013, 0.0012, g)
  rbox(0.05, 0.16, 0.02, m.flat, 0, -0.16, -0.055, g, 0.006).rotation.x = 0.08
  rbox(0.22, 0.01, 0.16, m.flat, 0, -0.23, -0.05, g, 0.005)
  return g
}

/** A PC tower standing on the floor (front toward +z). */
function tower(mat: THREE.Material, w = 0.19, h = 0.42, d = 0.44) {
  const g = new THREE.Group()
  rbox(w, h, d, mat, 0, h / 2 + 0.01, 0, g, 0.006)
  rbox(w * 0.8, 0.04, 0.006, hardware().plasticDark, 0, h - 0.06, d / 2 + 0.002, g, 0.002)
  mesh(new THREE.CircleGeometry(0.004, 10), hardware().ledGreen, w * 0.3, h - 0.12, d / 2 + 0.004, g)
  return g
}

/** A canvas poster (game art, no brands). */
function posterDraw(kind: number) {
  return (c: CanvasRenderingContext2D, W: number, H: number) => {
    const r = mulberry32(90 + kind)
    const themes = [
      ['#0b1a3a', '#3a8fd9', '#ffd23a', 'GALAKSİ 2000'],
      ['#3a0b0b', '#d9572a', '#fff0c0', 'RALLİ'],
      ['#0b2a14', '#3fae5a', '#f2f2e0', 'KALE SAVAŞI'],
    ][kind % 3]
    const g = c.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, themes[0])
    g.addColorStop(1, themes[1])
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
    c.fillStyle = 'rgba(255,255,255,0.7)'
    for (let i = 0; i < 40; i++) c.fillRect(r() * W, r() * H * 0.6, 2, 2)
    c.fillStyle = themes[2]
    c.beginPath()
    c.moveTo(W * 0.5, H * 0.25)
    c.lineTo(W * 0.2, H * 0.7)
    c.lineTo(W * 0.8, H * 0.7)
    c.closePath()
    c.fill()
    c.fillStyle = 'rgba(0,0,0,0.35)'
    c.fillRect(0, H * 0.78, W, H * 0.22)
    c.fillStyle = themes[2]
    sans(c, Math.round(W * 0.12), 800)
    c.textAlign = 'center'
    c.fillText(themes[3], W / 2, H * 0.9)
    c.textAlign = 'left'
  }
}

function priceBoard(c: CanvasRenderingContext2D, W: number, H: number) {
  c.fillStyle = '#efe6cf'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = '#3a2a1c'
  c.lineWidth = 10
  c.strokeRect(5, 5, W - 10, H - 10)
  c.fillStyle = '#2a1f16'
  sans(c, Math.round(H * 0.15), 800)
  c.textAlign = 'center'
  c.fillText('1 SAAT · 1 LİRA', W / 2, H * 0.26)
  c.fillText('YARIM SAAT · 50 KURUŞ', W / 2, H * 0.48)
  c.fillText('ÇAY · 25 KURUŞ', W / 2, H * 0.7)
  // The pencilled rule underneath.
  c.fillStyle = 'rgba(70,70,80,0.75)'
  sans(c, Math.round(H * 0.075), 400)
  c.fillText('okul saatinde çocuk alınmaz', W / 2, H * 0.89)
  c.textAlign = 'left'
}

function noteDraw(c: CanvasRenderingContext2D, W: number, H: number) {
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#e9d9a6')
  g.addColorStop(1, '#d8c48a')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  c.fillStyle = 'rgba(120,90,40,0.18)'
  for (let i = 0; i < 6; i++) c.fillRect(Math.random() * W, Math.random() * H, 40, 3)
  c.fillStyle = '#1c1a22'
  sans(c, Math.round(H * 0.2), 800)
  c.textAlign = 'center'
  c.fillText('SÜRE UZATMA', W / 2, H * 0.45)
  c.fillText('YOKTUR', W / 2, H * 0.75)
  c.textAlign = 'left'
}

export class Cafe {
  readonly m = palette()
  readonly root = new THREE.Group()
  readonly kid = new THREE.Group()
  readonly adult = new THREE.Group()
  readonly outside = new THREE.Group()
  readonly desks: Desk[] = []
  readonly door = new THREE.Group()
  readonly doorLeaf = new THREE.Group()
  readonly bell = new THREE.Group()
  clockHands: {
    hour: THREE.Object3D
    minute: THREE.Object3D
    second: THREE.Object3D
    a0: [number, number, number]
  } | null = null
  readonly fans: THREE.Object3D[] = []
  readonly pendants: Array<{ pos: THREE.Vector3; bulb: THREE.Mesh }> = []
  readonly admin = {
    kid: null as unknown as ReturnType<typeof canvasPlane>,
    adult: null as unknown as ReturnType<typeof canvasPlane>,
  }
  readonly lights = {
    hemi: new THREE.HemisphereLight(0xdfe8ff, 0x2a2018, 0.3),
    sun: new THREE.DirectionalLight(0xfff0d8, 0),
    pools: [0, 1, 2, 3].map(() => new THREE.SpotLight(0xffc887, 0, 7, 0.75, 0.75, 1.6)),
    door: new THREE.SpotLight(0xffa64d, 0, 12, 0.42, 0.65, 1.3),
    glowA: new THREE.PointLight(0x7fa6d8, 0, 2.2, 1.6),
    glowB: new THREE.PointLight(0x7fa6d8, 0, 2.2, 1.6),
  }
  /** Shared static screens of the crowd. */
  readonly crowdTex: Record<Era, THREE.Texture[]> = { kid: [], adult: [] }
  readonly crowdMats: Record<Era, THREE.MeshBasicMaterial[]> = {
    kid: [],
    adult: [],
  }
  /** Sky dome and things outside that follow the season. */
  sky!: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>
  tree!: {
    leaves: THREE.InstancedMesh
    leafMat: THREE.MeshStandardMaterial
    group: THREE.Group
  }
  snowGround: THREE.Mesh[] = []
  snowFall!: THREE.Points
  leavesFall!: THREE.Points
  dust!: THREE.Points
  doorSnow!: THREE.Points
  wedge!: THREE.Mesh
  litWindows: THREE.MeshBasicMaterial[] = []
  streetGlow: THREE.Mesh[] = []
  register: THREE.Object3D | null = null
  drawer: THREE.Object3D | null = null
  drawerZ = 0
  note!: THREE.Mesh
  coin!: THREE.Group
  coinGlint!: THREE.Sprite
  readonly textures: THREE.Texture[] = []
  readonly surfaces: Surface[] = []
  /** Kid-era fluorescent faces (dimmed with the hour). */
  panelFace = this.m.panelOn

  async build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.m
    scene.add(this.root)
    this.root.add(this.kid, this.adult, this.outside)
    const models = await ctx.models({
      register: ['CashRegister_01', { scale: 0.68 }],
      clock: ['wall_clock', { ground: false }],
      tea: ['tea_set_01', { ground: false }],
      plant: ['potted_plant_01', {}],
    })

    // ——— The room ———
    const shell = room({
      w: 12,
      d: 10,
      h: 3,
      wall: m.wall,
      floor: m.floor,
      ceiling: m.ceiling,
      trim: m.trim,
      openings: [
        { side: 'n', at: 0, width: 10, height: 1.8, bottom: 0.8 },
        { side: 's', at: DOOR.x, width: DOOR.w, height: DOOR.h },
      ],
    })
    this.root.add(shell)
    shell.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) c.castShadow = true
    })
    const statics = new THREE.Group()
    // Wainscot on the side walls, the entrance wall and under the window, with a rail.
    const wains = (x: number, z: number, len: number, rotY: number, h: number) => {
      const g = new THREE.Group()
      g.position.set(x, 0, z)
      g.rotation.y = rotY
      const n = Math.max(1, Math.round(len / 0.12))
      for (let i = 0; i < n; i++) rbox(len / n - 0.004, h, 0.018, m.wainscot, -len / 2 + (i + 0.5) * (len / n), h / 2, 0.009, g, 0.003)
      rbox(len, 0.045, 0.035, m.trim, 0, h + 0.02, 0.017, g, 0.006)
      statics.add(g)
    }
    wains(-6, 0, 10, PI / 2, 1.0)
    wains(6, 0, 10, -PI / 2, 1.0)
    wains(-2.25, 5, 7.5, PI, 1.0)
    wains(5.5, 5, 1.0, PI, 1.0)
    wains(-5.5, -5, 1.0, 0, 0.78)
    wains(5.5, -5, 1.0, 0, 0.78)
    wains(0, -5, 10, 0, 0.78)
    // Window: mullions, transom, head and the glass.
    for (let i = 0; i <= 5; i++) rbox(0.06, 1.8, 0.09, m.frame, -5 + i * 2, 1.7, -5.0, statics, 0.006)
    rbox(10, 0.05, 0.09, m.frame, 0, 2.18, -5.0, statics, 0.006)
    rbox(10.06, 0.06, 0.1, m.frame, 0, 2.6, -5.0, statics, 0.006)
    rbox(10.06, 0.05, 0.1, m.frame, 0, 0.82, -5.0, statics, 0.006)
    const glass = mesh(new THREE.PlaneGeometry(10, 1.8), m.glass, 0, 1.7, -5.0, this.root)
    glass.castShadow = false
    glass.renderOrder = 2
    // Radiators under the window.
    for (const x of [-3.9, -0.9, 2.1]) {
      const r = radiator(1.2, m.radiator)
      r.position.set(x, 0, -4.86)
      statics.add(r)
    }

    // The door: frame, a leaf with a glass upper panel, hinged on the +x jamb, opening inward.
    this.door.position.set(DOOR.x, 0, DOOR.z)
    this.root.add(this.door)
    for (const sx of [-1, 1]) rbox(0.06, DOOR.h + 0.06, 0.16, m.frame, sx * (DOOR.w / 2 + 0.03), (DOOR.h + 0.06) / 2, 0, this.door, 0.006)
    rbox(DOOR.w + 0.12, 0.06, 0.16, m.frame, 0, DOOR.h + 0.03, 0, this.door, 0.006)
    this.doorLeaf.position.set(DOOR.w / 2, 0, -0.02)
    this.door.add(this.doorLeaf)
    const lw = DOOR.w - 0.01
    const leafGroup = new THREE.Group()
    leafGroup.position.x = -lw / 2
    this.doorLeaf.add(leafGroup)
    // In the leaf's frame: x from −lw/2 … lw/2 measured from the hinge at +x.
    rbox(lw, 0.9, 0.045, m.doorLeaf, 0, 0.46, 0, leafGroup, 0.006)
    rbox(0.09, DOOR.h - 0.92, 0.045, m.doorLeaf, -lw / 2 + 0.045, 0.92 + (DOOR.h - 0.92) / 2, 0, leafGroup, 0.006)
    rbox(0.09, DOOR.h - 0.92, 0.045, m.doorLeaf, lw / 2 - 0.045, 0.92 + (DOOR.h - 0.92) / 2, 0, leafGroup, 0.006)
    rbox(lw, 0.1, 0.045, m.doorLeaf, 0, DOOR.h - 0.05, 0, leafGroup, 0.006)
    const doorGlass = mesh(new THREE.PlaneGeometry(lw - 0.18, DOOR.h - 1.02), m.glass, 0, 0.92 + (DOOR.h - 1.02) / 2, 0, leafGroup)
    doorGlass.renderOrder = 2
    // A push bar inside and a handle outside.
    const bar = cyl(0.014, 0.014, 0.6, m.hw.chrome, -lw / 2 + 0.12, 1.02, -0.06, leafGroup, 12)
    bar.rotation.z = PI / 2
    bar.position.x = 0
    for (const sx of [-0.25, 0.25]) cyl(0.01, 0.01, 0.05, m.hw.chrome, sx, 1.02, -0.035, leafGroup, 8).rotation.x = PI / 2
    // "İTİNİZ" sticker on the glass, from inside "ÇEKİNİZ".
    const sticker = canvasPlane(
      0.22,
      0.06,
      256,
      (c, W, H) => {
        c.fillStyle = 'rgba(0,0,0,0)'
        c.clearRect(0, 0, W, H)
        c.fillStyle = '#f2ead6'
        sans(c, Math.round(H * 0.7), 700)
        c.textAlign = 'center'
        c.fillText('ÇEKİNİZ', W / 2, H * 0.78)
      },
      { transparent: true },
    )
    sticker.mesh.position.set(0, 1.25, -0.026)
    sticker.mesh.rotation.y = PI
    leafGroup.add(sticker.mesh)
    this.textures.push(sticker.texture)
    // The bell on its curled spring above the door.
    this.bell.position.set(DOOR.x - 0.25, 2.2, 4.86)
    this.root.add(this.bell)
    tube(
      [
        [0, 0.12, 0.13],
        [0, 0.16, 0.06],
        [0, 0.1, 0.0],
        [0, 0.04, 0.0],
      ],
      0.004,
      m.brass,
      this.bell,
      16,
    )
    rbox(0.03, 0.05, 0.01, m.brass, 0, 0.14, 0.135, this.bell, 0.003)
    const bellBody = turned(
      [
        [0.0, 0.04],
        [0.012, 0.038],
        [0.022, 0.025],
        [0.026, 0.0],
        [0.034, -0.03],
        [0.036, -0.034],
        [0.03, -0.034],
        [0.0, -0.01],
      ],
      m.brass,
      32,
      this.bell,
    )
    bellBody.castShadow = true

    // ——— Counter, register, the cashier's monitor, shelves, the price board ———
    const ctr = counter(COUNTER.w, COUNTER.d, COUNTER.h, m.counterTop, m.counterBody)
    ctr.position.set(COUNTER.x, 0, COUNTER.z)
    statics.add(ctr)
    // The customer side: a plain panelled front with a foot rail.
    const front = new THREE.Group()
    front.position.set(COUNTER.x, 0, COUNTER.z - COUNTER.d / 2 - 0.012)
    statics.add(front)
    for (let i = 0; i < 4; i++) rbox(COUNTER.w / 4 - 0.03, 0.78, 0.02, m.counterBody, -COUNTER.w / 2 + (i + 0.5) * (COUNTER.w / 4), 0.55, -0.008, front, 0.006)
    rbox(COUNTER.w, 0.1, 0.03, m.trim, 0, 0.05, -0.005, front, 0.004)
    cyl(0.016, 0.016, COUNTER.w - 0.1, m.brass, 0, 0.18, -0.12, front, 12).rotation.z = PI / 2
    for (const sx of [-1, 0, 1]) cyl(0.01, 0.01, 0.11, m.brass, sx * (COUNTER.w / 2 - 0.15), 0.18, -0.065, front, 8).rotation.x = PI / 2

    if (models.register) {
      const r = models.register
      r.position.set(-2.66, COUNTER.h, 4.1)
      this.root.add(r)
      this.register = r
      this.drawer = r.getObjectByName('CashRegister_011_drawer') ?? null
      if (this.drawer) this.drawerZ = this.drawer.position.z
    } else {
      // Stand-in: a squat register.
      const r = new THREE.Group()
      r.position.set(-2.66, COUNTER.h, 4.1)
      rbox(0.36, 0.2, 0.3, m.lampPole, 0, 0.1, 0, r, 0.02)
      rbox(0.3, 0.06, 0.12, m.brass, 0, 0.23, -0.05, r, 0.01)
      this.root.add(r)
      this.register = r
    }

    // Shelves behind the counter with the tea things, a kettle, boxes.
    const shelfG = new THREE.Group()
    shelfG.position.set(-3.5, 0, 4.86)
    statics.add(shelfG)
    for (const y of [1.36, 1.72]) {
      rbox(2.0, 0.025, 0.24, m.shelf, 0, y, 0, shelfG, 0.004)
      for (const sx of [-0.85, 0.85]) rbox(0.02, 0.06, 0.2, m.hw.steel, sx, y - 0.04, 0.02, shelfG, 0.004)
    }
    const kettle = turned(
      [
        [0, 0],
        [0.08, 0],
        [0.09, 0.02],
        [0.085, 0.14],
        [0.05, 0.19],
        [0.012, 0.2],
        [0, 0.2],
      ],
      m.kettle,
      28,
      shelfG,
    )
    kettle.position.set(0.55, 1.3725, 0)
    const upper = turned(
      [
        [0, 0],
        [0.055, 0],
        [0.06, 0.02],
        [0.05, 0.1],
        [0.02, 0.13],
        [0, 0.13],
      ],
      m.kettle,
      24,
      shelfG,
    )
    upper.position.set(0.55, 1.5725, 0)
    for (let i = 0; i < 5; i++) rbox(0.12 + (i % 2) * 0.05, 0.18 + (i % 3) * 0.04, 0.16, m.boxes[i % 3], -0.85 + i * 0.17, 1.7325 + (0.18 + (i % 3) * 0.04) / 2, 0, shelfG, 0.004)
    if (models.tea) {
      const tea = models.tea
      const pick = (name: string) => tea.getObjectByName(name)
      const set = new THREE.Group()
      set.position.set(-3.95, 1.3725, 4.84)
      this.root.add(set)
      const place = (name: string, x: number, y: number, z: number) => {
        const o = pick(name)
        if (!o) return
        const c = o.clone()
        c.position.set(x, y + (o.position.y || 0), z)
        set.add(c)
      }
      place('tea_set_01_teapot_01', 0, 0, 0)
      place('tea_set_01_teapot_01_lid', 0, 0, -0.007)
      place('tea_set_01_saucer_circular_03', 0.24, -0.0005, 0.02)
      place('tea_set_01_cup_small_01', 0.24, 0.01, 0.02)
      place('tea_set_01_saucer_circular_04', 0.4, -0.0005, 0.03)
      place('tea_set_01_cup_small_02', 0.4, 0.01, 0.03)
      place('tea_set_01_sugar_cup_01', -0.22, 0, 0.02)
      place('tea_set_01_sugar_cup_01_lid', -0.22, 0, 0.02)
      this.teaSource = tea
    }

    // The cashier's monitor at the left end of the counter, screen toward the room (+x).
    const adminAt = new THREE.Vector3(-4.3, COUNTER.h, 4.0)
    const adminKid = new THREE.Group()
    adminKid.position.copy(adminAt)
    adminKid.rotation.y = PI / 2
    const ac = crt(m)
    ac.scale.setScalar(0.85)
    ac.position.set(0, 0.235, 0.05)
    adminKid.add(ac)
    this.admin.kid = canvasPlane(0.315, 0.24, 512, adminScreen('kid', false), {
      emissive: true,
    })
    this.admin.kid.mesh.position.set(0, 0.245, 0.0545)
    adminKid.add(this.admin.kid.mesh)
    this.kid.add(adminKid)
    const adminAdult = new THREE.Group()
    adminAdult.position.copy(adminAt)
    adminAdult.rotation.y = PI / 2
    const am = flatPanel(m, 0.42, 0.26)
    am.position.set(0, 0.255, 0.0)
    adminAdult.add(am)
    this.admin.adult = canvasPlane(0.42, 0.26, 512, adminScreen('adult', false), { emissive: true })
    this.admin.adult.mesh.position.set(0, 0.255, 0.0035)
    adminAdult.add(this.admin.adult.mesh)
    this.adult.add(adminAdult)
    this.textures.push(this.admin.kid.texture, this.admin.adult.texture)
    // Its keyboard on the counter.
    for (const [era, mat, caps] of [
      ['kid', m.kbKid, m.kbKidCaps],
      ['adult', m.hw.plasticDark, m.hw.plasticGrey],
    ] as const) {
      const k = keyboard(mat, caps)
      k.scale.setScalar(0.85)
      k.position.set(-3.98, COUNTER.h, 4.12)
      k.rotation.y = PI / 2 + 0.25
      ;(era === 'kid' ? this.kid : this.adult).add(k)
    }

    // The price board (child era) and its paler ghost on the plaster (now).
    const board = canvasPlane(0.9, 0.5, 512, priceBoard)
    board.mesh.position.set(-3.5, 2.25, 4.94)
    board.mesh.rotation.y = PI
    rbox(0.94, 0.54, 0.02, m.trim, -3.5, 2.25, 4.955, this.kid, 0.004)
    this.kid.add(board.mesh)
    this.textures.push(board.texture)
    const ghost = mesh(new THREE.PlaneGeometry(0.94, 0.54), new THREE.MeshStandardMaterial({ color: 0xd8ccb4, roughness: 1 }), -3.5, 2.25, 4.996, this.adult)
    ghost.rotation.y = PI
    // The note taped flat on the counter (now).
    const note = canvasPlane(0.3, 0.21, 512, noteDraw)
    note.mesh.rotation.x = -PI / 2
    note.mesh.rotation.z = 0.04
    note.mesh.position.copy(NOTE_POS)
    this.adult.add(note.mesh)
    this.note = note.mesh
    this.textures.push(note.texture)
    for (const [dx, dz] of [
      [-0.15, -0.105],
      [0.15, -0.105],
      [-0.15, 0.105],
      [0.15, 0.105],
    ])
      box(0.06, 0.0008, 0.02, m.tape, NOTE_POS.x + dx, NOTE_POS.y + 0.0006, NOTE_POS.z + dz, this.adult).rotation.y = 0.6 * Math.sign(dx * dz)

    // ——— The wall clock (behind everyone) ———
    const clockAt = new THREE.Vector3(0, 2.3, 4.995)
    if (models.clock) {
      const c = models.clock
      c.position.copy(clockAt)
      c.rotation.y = PI
      this.root.add(c)
      const hands: THREE.Object3D[] = []
      const a0: number[] = []
      for (const name of ['wall_clock_hours_hand', 'wall_clock_minute_hand', 'wall_clock_second_hand']) {
        const h = c.getObjectByName(name)
        if (!h || !h.parent) {
          hands.push(new THREE.Object3D())
          a0.push(0)
          continue
        }
        const pivot = new THREE.Group()
        pivot.position.set(0, 0, h.position.z)
        h.parent.add(pivot)
        a0.push(Math.atan2(h.position.x, h.position.y))
        h.position.z = 0
        pivot.add(h)
        hands.push(pivot)
      }
      this.clockHands = {
        hour: hands[0],
        minute: hands[1],
        second: hands[2],
        a0: [a0[0], a0[1], a0[2]],
      }
    }

    // ——— Desks ———
    const kidMon = new THREE.Group()
    const adultMon = new THREE.Group()
    const deskStatic = new THREE.Group()
    const chairStatic = new THREE.Group()
    const rows: Array<[1 | 2, number[], number]> = [
      [1, X1, ROW1_Z],
      [2, X2, ROW2_Z],
    ]
    let n = 0
    for (const [row, xs, chairZ] of rows) {
      const topZ = chairZ - 0.75
      const x0 = xs[0] - 0.9
      const x1 = xs[xs.length - 1] + 0.9
      const len = x1 - x0
      const cx = (x0 + x1) / 2
      rbox(len, 0.03, 0.75, m.deskTop, cx, DESK_Y - 0.015, topZ, deskStatic, 0.005)
      rbox(len, 0.035, 0.025, m.deskEdge, cx, DESK_Y - 0.018, topZ + 0.3875, deskStatic, 0.006)
      // Modesty panel on the window side, end panels and dividers under the top.
      rbox(len, 0.48, 0.022, m.deskBody, cx, DESK_Y - 0.03 - 0.24 - 0.04, topZ - 0.36, deskStatic, 0.004)
      const legs = row === 1 ? [x0 + 0.03, -1.5, 1.5, x1 - 0.03] : [x0 + 0.03, -2.25, 2.25, x1 - 0.03]
      for (const lx of legs) rbox(0.03, DESK_Y - 0.03, 0.7, m.deskBody, lx, (DESK_Y - 0.03) / 2, topZ, deskStatic, 0.004)
      // A cable tray at the back.
      rbox(len - 0.2, 0.06, 0.1, m.hw.steel, cx, DESK_Y - 0.1, topZ - 0.28, deskStatic, 0.004)
      for (const x of xs) {
        n++
        const kb = new THREE.Vector3(x, DESK_Y, topZ + 0.22)
        const ms = new THREE.Vector3(x + 0.31, DESK_Y, topZ + 0.23)
        // Keyboards and mice (one of each era).
        for (const era of ['kid', 'adult'] as const) {
          const k = keyboard(era === 'kid' ? m.kbKid : m.hw.plasticDark, era === 'kid' ? m.kbKidCaps : m.hw.plasticGrey)
          k.position.copy(kb)
          ;(era === 'kid' ? this.kid : this.adult).add(k)
          const mo = mouse(era === 'kid' ? m.kbKid : m.hw.plasticDark)
          mo.position.set(ms.x, DESK_Y + 0.003, ms.z)
          mo.rotation.y = PI
          ;(era === 'kid' ? kidMon : adultMon).add(mo)
        }
        rbox(0.22, 0.003, 0.19, m.hw.rubber, ms.x, DESK_Y + 0.0015, ms.z, deskStatic, 0.001)
        // Monitors.
        const c = crt(m)
        c.position.set(x, 0.985, monZ(row, 'kid'))
        kidMon.add(c)
        const f = flatPanel(m, SCREEN_SIZE.adult[0], SCREEN_SIZE.adult[1])
        f.position.set(x, SCREEN_Y.adult, monZ(row, 'adult'))
        adultMon.add(f)
        // Towers under the desk.
        const tk = tower(m.towerKid)
        tk.position.set(x + 0.42, 0, topZ - 0.08)
        kidMon.add(tk)
        const ta = tower(m.flat, 0.17, 0.36, 0.38)
        ta.position.set(x + 0.42, 0, topZ - 0.1)
        adultMon.add(ta)
        // The screen plane (geometry 1×1, scaled per era).
        const hero = HERO_DESKS.includes(n)
        const surface = hero ? new Surface() : null
        if (surface) this.surfaces.push(surface)
        const screen = mesh(new THREE.PlaneGeometry(1, 1), surface ? surface.material : m.screenOff, x, SCREEN_Y.adult, monZ(row, 'adult') + SCREEN_GAP.adult, this.root)
        screen.castShadow = false
        screen.receiveShadow = false
        // Chair.
        const chair = officeChair(m.chairFabric, m.chairMetal)
        chair.position.set(x, 0, chairZ)
        chair.rotation.y = PI
        if (LIVE_DESKS.includes(n)) this.root.add(chair)
        else chairStatic.add(chair)
        this.desks.push({
          n,
          x,
          row,
          chairZ,
          topZ,
          kb,
          mouse: ms,
          screen,
          surface,
          chair,
        })
      }
    }
    // The crack along the near edge of desk 4 (the coin's place).
    box(0.62, 0.002, 0.009, m.crack, 0.62, DESK_Y + 0.0005, 0.205, deskStatic)
    this.root.add(bake(deskStatic, 'desks'), bake(chairStatic, 'chairs'))
    this.kid.add(bake(kidMon, 'crts'))
    this.adult.add(bake(adultMon, 'flats'))

    // Crowd screens: a few static pictures per era.
    for (let i = 0; i < 4; i++) {
      const t = staticTexture(512, 318, strangerScreen(i))
      this.crowdTex.adult.push(t)
      this.crowdMats.adult.push(new THREE.MeshBasicMaterial({ map: t }))
    }
    for (let i = 0; i < 3; i++) {
      const t = staticTexture(512, 384, teenScreen(i))
      this.crowdTex.kid.push(t)
      this.crowdMats.kid.push(new THREE.MeshBasicMaterial({ map: t }))
    }

    // The coin (bimetal 50 kuruş) — in the crack, or in a hand, or on the counter.
    this.coin = coinMesh(m)
    this.root.add(this.coin)
    const glintTex = staticTexture(64, 64, (c, W, H) => {
      const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2)
      g.addColorStop(0, 'rgba(255,240,200,1)')
      g.addColorStop(0.2, 'rgba(255,220,150,0.5)')
      g.addColorStop(1, 'rgba(255,220,150,0)')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
      c.fillStyle = 'rgba(255,245,220,0.9)'
      c.fillRect(W / 2 - 1, 4, 2, H - 8)
      c.fillRect(4, H / 2 - 1, W - 8, 2)
    })
    this.textures.push(glintTex)
    this.coinGlint = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glintTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    )
    this.coinGlint.scale.setScalar(0.05)
    this.coinGlint.position.copy(COIN_CRACK).add(new THREE.Vector3(0, 0.012, 0))
    this.root.add(this.coinGlint)

    // ——— Child-era dressing: posters, fans, fluorescent panels ———
    const posters: Array<[number, number, number, number, number]> = [
      [-5.985, 1.75, -1.6, PI / 2, 0],
      [-5.985, 1.75, 1.4, PI / 2, 1],
      [5.985, 1.75, -0.6, -PI / 2, 2],
      [5.985, 1.75, 2.1, -PI / 2, 0],
      [1.6, 1.75, 4.985, PI, 1],
    ]
    posters.forEach(([x, y, z, ry, k], i) => {
      const p = canvasPlane(0.5, 0.7, 256, posterDraw(k + i))
      p.mesh.position.set(x, y, z)
      p.mesh.rotation.y = ry
      this.kid.add(p.mesh)
      this.textures.push(p.texture)
    })
    for (const fx of [-2.6, 2.6]) {
      const fan = new THREE.Group()
      fan.position.set(fx, 3, -0.5)
      cyl(0.02, 0.02, 0.32, m.fanBody, 0, -0.16, 0, fan, 10)
      cyl(0.09, 0.07, 0.1, m.fanBody, 0, -0.36, 0, fan, 20)
      const rotor = new THREE.Group()
      rotor.position.y = -0.42
      fan.add(rotor)
      for (let i = 0; i < 4; i++) {
        const blade = rbox(0.62, 0.008, 0.12, m.fanBlade, 0.38, 0, 0, undefined, 0.004)
        const arm = new THREE.Group()
        arm.rotation.y = (i / 4) * PI * 2
        blade.rotation.x = 0.12
        arm.add(blade)
        rotor.add(arm)
      }
      this.kid.add(fan)
      this.fans.push(rotor)
    }
    for (const [x, z] of [
      [-3, -0.6],
      [0, -0.6],
      [3, -0.6],
      [-1.5, 2.6],
      [1.5, 2.6],
    ]) {
      const panel = ceilingPanel(1.2, 0.3, m.panelOn)
      panel.position.set(x, 3, z)
      this.kid.add(panel)
    }

    // ——— Adult-era dressing: pendants over the desks, the air conditioner ———
    for (const d of this.desks) {
      const g = new THREE.Group()
      const z = d.topZ + 0.05
      g.position.set(d.x, 3, z)
      cyl(0.04, 0.04, 0.02, m.lampPole, 0, -0.01, 0, g, 16)
      cyl(0.003, 0.003, 0.72, m.lampPole, 0, -0.37, 0, g, 6)
      const sh = turned(
        [
          [0.02, 0],
          [0.05, -0.03],
          [0.13, -0.12],
          [0.17, -0.2],
          [0.168, -0.202],
          [0.126, -0.124],
          [0.047, -0.033],
          [0.018, -0.003],
        ],
        m.shade,
        36,
        g,
      )
      sh.position.y = -0.73
      const bulb = mesh(new THREE.SphereGeometry(0.035, 16, 10), m.bulb, 0, -0.86, 0, g)
      this.adult.add(g)
      this.pendants.push({ pos: new THREE.Vector3(d.x, 2.12, z), bulb })
    }
    const acG = new THREE.Group()
    acG.position.set(-5.88, 2.5, -1.2)
    acG.rotation.y = PI / 2
    rbox(0.9, 0.29, 0.22, m.ac, 0, 0, 0, acG, 0.04)
    rbox(0.84, 0.03, 0.02, m.hw.plasticGrey, 0, -0.1, 0.105, acG, 0.006)
    mesh(new THREE.CircleGeometry(0.004, 10), m.hw.ledBlue, 0.36, -0.05, 0.111, acG)
    this.adult.add(acG)

    // Plants in the window corners.
    if (models.plant) {
      for (const [x, z] of [
        [-5.5, -4.45],
        [5.5, -4.45],
      ]) {
        const pl = models.plant.clone(true)
        pl.position.set(x, 0, z)
        pl.rotation.y = x
        this.root.add(pl)
      }
    }

    this.root.add(bake(statics, 'statics'))
    this.buildOutside(m)
    this.buildLights(scene)
  }

  /** Kept for the tea cup at her desk (a clone of one piece of the set). */
  teaSource: THREE.Group | null = null

  private buildOutside(m: SetPalette) {
    const o = this.outside
    const ground = (x: number, z: number, w: number, d: number, mat: THREE.Material) => {
      const g = mesh(new THREE.PlaneGeometry(w, d), mat, x, 0, z, o)
      g.rotation.x = -PI / 2
      g.receiveShadow = true
      return g
    }
    // Window side: sidewalk with the tree, the road, the far side, the houses across.
    ground(0, -7.48, 60, 4.7, m.paving)
    ground(0, -13.4, 60, 7.2, m.asphalt)
    ground(0, -19, 60, 4, m.paving)
    for (const z of [-9.83, -16.97]) rbox(60, 0.14, 0.18, m.curb, 0, 0.07, z, o, 0.01)
    // Door side.
    ground(0, 7.08, 60, 4.0, m.paving)
    ground(0, 12.5, 60, 7, m.asphalt)
    rbox(60, 0.14, 0.18, m.curb, 0, 0.07, 9.05, o, 0.01)
    for (const [z, w] of [
      [-7.48, 4.7],
      [-13.4, 7.2],
      [-19, 4],
      [7.08, 4.0],
      [12.5, 7],
    ]) {
      const s = mesh(new THREE.PlaneGeometry(60, w), m.snow, 0, 0.02, z, o)
      s.rotation.x = -PI / 2
      s.renderOrder = 1
      this.snowGround.push(s)
    }
    const across = [
      { x: -11, w: 20, h: 15, wall: m.brick, seed: 51 },
      { x: 9.5, w: 17, h: 12, wall: m.plasterOut, seed: 52 },
    ]
    for (const a of across) {
      const f = facade({
        w: a.w,
        h: a.h,
        d: 4,
        wall: a.wall,
        facing: 1,
        seed: a.seed,
        lit: 0.45,
      })
      f.rotation.y = -PI / 2
      f.position.set(a.x, 0, -23)
      o.add(f)
    }
    const behind = facade({
      w: 30,
      h: 14,
      d: 4,
      wall: m.plasterOut,
      facing: 1,
      seed: 53,
      lit: 0.4,
    })
    behind.rotation.y = PI / 2
    behind.position.set(0, 0, 18)
    o.add(behind)
    o.traverse((c) => {
      const mm = c as THREE.Mesh
      if (mm.isMesh && (mm.material as THREE.MeshBasicMaterial).isMeshBasicMaterial && (mm.material as THREE.MeshBasicMaterial).map) this.litWindows.push(mm.material as THREE.MeshBasicMaterial)
    })
    // Street lamps (and their pools of light on the pavement).
    const lampAt: Array<[number, number, number]> = [
      [2.6, -9.45, PI / 2],
      [-9, -9.45, PI / 2],
      [4.9, 6.7, PI],
    ]
    const poolTex = staticTexture(128, 128, (c, W, H) => {
      const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2)
      g.addColorStop(0, 'rgba(255,170,90,0.55)')
      g.addColorStop(1, 'rgba(255,170,90,0)')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
    })
    this.textures.push(poolTex)
    const poolMat = new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    for (const [x, z, ry] of lampAt) {
      const l = streetLamp(m.lampPole, m.lampGlow)
      l.position.set(x, 0, z)
      l.rotation.y = ry
      o.add(l)
      const head = new THREE.Vector3(0.95, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry)
      const pool = mesh(new THREE.PlaneGeometry(6, 6), poolMat, x + head.x, 0.03, z + head.z, o)
      pool.rotation.x = -PI / 2
      pool.renderOrder = 2
      this.streetGlow.push(pool)
    }
    // A parked car by the far curb.
    const parked = car(m.carBody, m.carGlass, m.hw.rubber, m.carLight)
    parked.position.set(5.2, 0, -10.9)
    parked.rotation.y = -PI / 2
    o.add(parked)
    // The plane tree.
    this.tree = planeTree(m)
    this.tree.group.position.set(-2.5, 0, -9)
    o.add(this.tree.group)
    // Sky dome.
    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(120, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color(0x0a1020) },
          horizon: { value: new THREE.Color(0x203048) },
          bottom: { value: new THREE.Color(0x0a0c10) },
        },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h * 2.2, 0.0, 1.0), 0.7)) : mix(horizon, bottom, clamp(-h * 6.0, 0.0, 1.0)); gl_FragColor = vec4(c, 1.0); }',
      }),
    )
    this.sky.renderOrder = -1
    this.sky.frustumCulled = false
    o.add(this.sky)
    // Weather: snow, leaves on the wind, and dust in the sun inside.
    const rand = mulberry32(7)
    const pts = (count: number, fill: (i: number) => [number, number, number], mat: THREE.PointsMaterial) => {
      const a = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) a.set(fill(i), i * 3)
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(a, 3))
      const p = new THREE.Points(g, mat)
      p.frustumCulled = false
      return p
    }
    this.snowFall = pts(
      1400,
      () => [(rand() - 0.5) * 30, rand() * 8, -5.3 - rand() * 16],
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.045,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    )
    o.add(this.snowFall)
    this.doorSnow = pts(
      300,
      () => [DOOR.x + (rand() - 0.5) * 3, rand() * 3, 5.2 + rand() * 4],
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    )
    o.add(this.doorSnow)
    this.leavesFall = pts(
      160,
      () => [(rand() - 0.5) * 22, rand() * 6, -5.4 - rand() * 8],
      new THREE.PointsMaterial({
        color: 0xc0662a,
        size: 0.07,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    )
    o.add(this.leavesFall)
    this.dust = pts(
      500,
      () => [(rand() - 0.5) * 9, 0.4 + rand() * 2.4, -4.6 + rand() * 6],
      new THREE.PointsMaterial({
        color: 0xfff1d0,
        size: 0.012,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.root.add(this.dust)
    // The wedge of street light the open door throws across the floor.
    const wedgeTex = staticTexture(256, 512, (c, W, H) => {
      const g = c.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, 'rgba(255,170,80,0.85)')
      g.addColorStop(1, 'rgba(255,170,80,0)')
      c.fillStyle = g
      c.beginPath()
      c.moveTo(W * 0.3, 0)
      c.lineTo(W * 0.7, 0)
      c.lineTo(W, H)
      c.lineTo(0, H)
      c.closePath()
      c.fill()
    })
    this.textures.push(wedgeTex)
    this.wedge = mesh(
      new THREE.PlaneGeometry(1.6, 4.2),
      new THREE.MeshBasicMaterial({
        map: wedgeTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
      0,
      0.004,
      0,
      this.root,
    )
    this.wedge.rotation.x = -PI / 2
    this.wedge.renderOrder = 3
  }

  private buildLights(scene: THREE.Scene) {
    const L = this.lights
    scene.add(L.hemi)
    L.sun.position.set(-4, 9, -16)
    L.sun.target.position.set(0, 0, 0)
    L.sun.castShadow = true
    L.sun.shadow.mapSize.set(2048, 2048)
    const sc = L.sun.shadow.camera
    sc.left = -9
    sc.right = 9
    sc.top = 9
    sc.bottom = -9
    sc.near = 1
    sc.far = 40
    L.sun.shadow.bias = -0.0004
    L.sun.shadow.normalBias = 0.02
    scene.add(L.sun, L.sun.target)
    for (const s of L.pools) {
      s.position.set(0, 2.15, 0)
      s.target.position.set(0, 0, 0)
      scene.add(s, s.target)
    }
    L.door.position.set(DOOR.x + 0.4, 2.7, 8.5)
    L.door.target.position.set(2.2, 0, 1.5)
    scene.add(L.door, L.door.target)
    scene.add(L.glowA, L.glowB)
  }

  /** Sets which era of dressing shows. */
  era(e: Era) {
    this.kid.visible = e === 'kid'
    this.adult.visible = e === 'adult'
  }

  dispose() {
    for (const t of this.textures) t.dispose()
    for (const t of [...this.crowdTex.kid, ...this.crowdTex.adult]) t.dispose()
    for (const mm of [...this.crowdMats.kid, ...this.crowdMats.adult]) mm.dispose()
    for (const s of this.surfaces) s.dispose()
  }
}

/** The 50-kuruş coin: a brass disc with a silver ring. */
function coinMesh(m: SetPalette) {
  const g = new THREE.Group()
  cyl(0.0121, 0.0121, 0.0019, m.coinRim, 0, 0.00095, 0, g, 28)
  cyl(0.0085, 0.0085, 0.0021, m.coin, 0, 0.00105, 0, g, 24)
  g.traverse((c) => (c.castShadow = true))
  return g
}

/** A plane tree: a mottled trunk forking into limbs, and a canopy of leaf cards whose colour follows the season. */
function planeTree(m: SetPalette) {
  const group = new THREE.Group()
  const rand = mulberry32(31)
  const trunk = tube(
    [
      [0, 0, 0],
      [0.05, 1.5, 0.02],
      [-0.05, 2.8, 0],
    ],
    0.2,
    m.bark,
    group,
    12,
  )
  trunk.castShadow = true
  const tips: THREE.Vector3[] = []
  const limb = (from: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const to = from.clone().addScaledVector(dir, len)
    const mid = from
      .clone()
      .lerp(to, 0.5)
      .add(new THREE.Vector3((rand() - 0.5) * 0.3, 0.1, (rand() - 0.5) * 0.3))
    tube(
      [
        [from.x, from.y, from.z],
        [mid.x, mid.y, mid.z],
        [to.x, to.y, to.z],
      ],
      r,
      m.bark,
      group,
      8,
    ).castShadow = true
    if (depth <= 0) {
      tips.push(to)
      return
    }
    for (let i = 0; i < 2 + (depth > 1 ? 1 : 0); i++) {
      const d = dir
        .clone()
        .add(new THREE.Vector3((rand() - 0.5) * 1.2, 0.35 + rand() * 0.4, (rand() - 0.5) * 1.2))
        .normalize()
      limb(to, d, len * 0.68, r * 0.62, depth - 1)
    }
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * PI * 2 + 0.4
    limb(new THREE.Vector3(-0.05, 2.7, 0), new THREE.Vector3(Math.cos(a) * 0.6, 0.8, Math.sin(a) * 0.6).normalize(), 1.6, 0.11, 2)
  }
  const leafGeo = new THREE.PlaneGeometry(0.34, 0.3)
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x6e9a45,
    roughness: 0.75,
    side: THREE.DoubleSide,
  })
  const count = tips.length * 26
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, count)
  const d = new THREE.Object3D()
  let k = 0
  for (const t of tips)
    for (let i = 0; i < 26; i++) {
      d.position.set(t.x + (rand() - 0.5) * 1.3, t.y + (rand() - 0.4) * 0.9, t.z + (rand() - 0.5) * 1.3)
      d.rotation.set(rand() * PI, rand() * PI, rand() * PI)
      d.scale.setScalar(0.7 + rand() * 0.6)
      d.updateMatrix()
      leaves.setMatrixAt(k++, d.matrix)
    }
  leaves.castShadow = true
  group.add(leaves)
  return { leaves, leafMat, group }
}
