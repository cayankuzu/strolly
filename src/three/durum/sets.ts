/**
 * DURUM's places, built once: the control room in the old observatory's
 * basement (A), the server hall behind its glass (B) with the mirror rows of
 * AYNA, the corridor and the kitchen (C), Ankara three floors down and the
 * avenue Arif walks home along (D), and Belgrad Ormanı at night (E).
 * World layout: docs/stories/durum.md §2 (metres; x right, y up, z toward
 * the default camera).
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { mesh } from '../util'
import {
  bin,
  binder,
  blinds,
  canvasPlane,
  car,
  ceilingPanel,
  counter,
  desk,
  deskLamp,
  door,
  facade,
  hardware,
  keyboard,
  monitor,
  mouse,
  mug,
  officeChair,
  papers,
  pcTower,
  plant,
  printer,
  radiator,
  rbox,
  room,
  shelf,
  socket,
  std,
  streetLamp,
  tube,
  wallClock,
  whiteboard,
} from '../kit/props'
import { pbr } from '../kit/surfaces'
import type { BuildContext } from '../kit/SetScene'
import { RackField } from './racks'
import * as P from './paper'
import { brushed, hangingCoat, leatherBag, receiptPrinter, simitBag, teaGlass } from './things'

const PI = Math.PI

export const DESK = { x: 0, z: -0.6 }
export const SEAT = { x: 0, z: 0.14 }
/** The wall display's pivot (its centre) and its yaws: facing Arif, facing the observer, facing the door. */
export const WD_C = new THREE.Vector3(2.6, 1.55, -3.0)
export const WD_YAW = { arif: -0.69, observer: 0.29, door: 0 }
export const OBS = new THREE.Vector3(4.3, 1.62, 2.6)
export const DOOR = { x: 2.6, z: 4.0 }
export const SELIN_DESK = { x: 3.3, z: 1.4 }
export const SELIN_CHAIR = { x: 2.68, z: 1.4 }
export const COAT_RACK = { x: 3.95, z: 3.45 }
export const CONSOLE = new THREE.Vector3(-4.72, 1.28, -7.2)
export const OLD_PRINTER = new THREE.Vector3(-4.62, 0.72, 2.7)
export const COFFEE = new THREE.Vector3(-4.72, 0.92, 0.5)
export const FOREST = new THREE.Vector3(-200, 0, 0)
export const STREET_DOOR = new THREE.Vector3(5.15, -9.5, 5.0)
/** Where things sit on Arif's desk. */
export const ON_DESK = {
  mug: new THREE.Vector3(0.5, 0.754, -0.3),
  phone: new THREE.Vector3(0.72, 0.754, -0.3),
  glass: new THREE.Vector3(-0.55, 0.754, -0.28),
  pen: new THREE.Vector3(-0.34, 0.762, -0.3),
  penFloor: new THREE.Vector3(-0.27, 0.006, 0.05),
  printer: new THREE.Vector3(0.78, 0.754, -0.55),
  tray: new THREE.Vector3(0.3, 0.754, -0.68),
  envelope: new THREE.Vector3(-0.25, 0.756, -0.25),
  keyboard: new THREE.Vector3(0, 0.754, -0.44),
  mouse: new THREE.Vector3(0.33, 0.754, -0.42),
  boxA: new THREE.Vector3(-0.24, 0.754, -0.4),
  boxB: new THREE.Vector3(0.24, 0.754, -0.4),
}

export function palette() {
  return {
    wall: pbr('painted', 0xd7d4cc, { roughness: 1 }),
    wallHall: pbr('painted', 0x2a2f35, { roughness: 1 }),
    floor: pbr('carpet', 0x464b53),
    hallFloor: pbr('tile', 0x8a9097, { roughness: 2.2 }),
    corridorFloor: pbr('tile', 0x9a968c, { roughness: 1.8 }),
    ceiling: pbr('plaster', 0xe2e0da),
    trim: pbr('painted', 0xb9b6ae, { roughness: 0.9 }),
    deskTop: pbr('laminate', 0xcbc3b4, { roughness: 0.9 }),
    deskBody: pbr('painted', 0x5d636a, { roughness: 0.9 }),
    chair: pbr('fabric', 0x2b2f35),
    metal: brushed(0x9aa0a6, 0.5),
    dark: pbr('plastic', 0x1c1f23),
    frame: pbr('plastic', 0x15171a, { roughness: 0.7 }),
    mug: pbr('ceramic', 0xe8e2d6),
    coffee: std(0x1e120a, 0.08),
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
    glass: new THREE.MeshPhysicalMaterial({ color: 0xc8d6de, roughness: 0.04, transparent: true, opacity: 0.1, depthWrite: false }),
    facade: pbr('concrete', 0x30353c),
    facadeB: pbr('brick', 0x4a3a32),
    ground: pbr('asphalt', 0x16181b),
    paving: pbr('paving', 0x3a3b3d),
    coat: pbr('fabric', 0x33363a),
    bag: pbr('leather', 0x4a3324),
    blindsMat: pbr('plastic', 0xc9c6bd, { roughness: 0.8 }),
    radiatorMat: pbr('painted', 0xdedcd6, { roughness: 0.7 }),
    tray: brushed(0x5c6268, 0.6),
    panelOn: new THREE.MeshBasicMaterial({ color: 0xf4f6f8 }),
    panelOff: std(0x9a9c9e, 0.6),
    hallLamp: new THREE.MeshBasicMaterial({ color: 0xbcd4f2 }),
    sky: new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, side: THREE.BackSide, fog: false }),
    brass: brushed(0xb08a44, 0.38),
    sodium: new THREE.MeshBasicMaterial({ color: 0xffb46a }),
    darkPanel: pbr('painted', 0x23272c, { roughness: 0.7 }),
    unit: pbr('painted', 0xd9d7d0, { roughness: 0.7 }),
  }
}
export type Pal = ReturnType<typeof palette>

type Screen = ReturnType<typeof canvasPlane>

export type Sets = Awaited<ReturnType<typeof buildSets>>

export async function buildSets(scene: THREE.Scene, ctx: BuildContext, m: Pal) {
  const hw = hardware()
  const screenMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff })
  const models = await ctx.models({
    shelves: ['steel_frame_shelves_01', { height: 1.95 }],
    box: ['cardboard_box_01', { height: 0.3 }],
    stapler: ['vintage_stapler'],
    lens: ['magnifying_glass_01'],
    fern: ['fern_02', { height: 0.62 }],
    log: ['dead_tree_trunk'],
  })
  await ctx.surfaces(['rock', 'gravel'])

  const office = new THREE.Group()
  const hall = new THREE.Group()
  const kitchen = new THREE.Group()
  const outside = new THREE.Group()
  const forest = new THREE.Group()
  scene.add(office, hall, kitchen, outside, forest)

  // ——— A · The office ———
  office.add(
    room({
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
    }),
  )
  // The glass partition: mullions every 1.25 m, rails, panes; pane 1 is the door.
  for (let i = 0; i <= 8; i++) rbox(0.06, 3.0, 0.08, m.frame, -5 + i * 1.25, 1.5, -4.0, office, 0.01)
  rbox(10, 0.08, 0.1, m.frame, 0, 2.98, -4.0, office, 0.01)
  rbox(10, 0.1, 0.1, m.frame, 0, 0.05, -4.0, office, 0.01)
  rbox(10, 0.04, 0.06, m.frame, 0, 2.2, -4.0, office, 0.01)
  for (let i = 0; i < 8; i++) {
    if (i === 1) continue
    mesh(new THREE.PlaneGeometry(1.19, 2.88), m.glass, -5 + 0.625 + i * 1.25, 1.5, -4.0, office).userData.noAO = true
  }
  // Above the door, a dark panel carrying the brass plaque.
  rbox(1.19, 0.74, 0.03, m.darkPanel, -3.125, 2.58, -3.985, office, 0.004)
  const plaque = canvasPlane(0.7, 0.14, 1024, P.drawPlaque)
  ;(plaque.material as THREE.MeshStandardMaterial).metalness = 0.65
  ;(plaque.material as THREE.MeshStandardMaterial).roughness = 0.35
  plaque.mesh.position.set(-3.125, 2.42, -3.966)
  office.add(plaque.mesh)
  rbox(0.72, 0.16, 0.006, m.brass, -3.125, 2.42, -3.97, office, 0.002)
  // The glass door (hinge at x −3.72), opening into the hall.
  const glassDoor = new THREE.Group()
  glassDoor.position.set(-3.72, 0, -4.0)
  office.add(glassDoor)
  const gdLeaf = new THREE.Group()
  glassDoor.add(gdLeaf)
  mesh(new THREE.PlaneGeometry(1.16, 2.08), m.glass, 0.6, 1.06, 0, gdLeaf).userData.noAO = true
  for (const [x, y, w, h] of [
    [0.02, 1.06, 0.04, 2.1],
    [1.18, 1.06, 0.04, 2.1],
    [0.6, 2.1, 1.2, 0.04],
    [0.6, 0.04, 1.2, 0.08],
  ] as const)
    rbox(w, h, 0.05, m.frame, x, y, 0, gdLeaf, 0.006)
  rbox(0.025, 0.6, 0.025, hw.chrome, 0.97, 1.05, 0.05, gdLeaf, 0.01)
  rbox(0.025, 0.6, 0.025, hw.chrome, 0.97, 1.05, -0.05, gdLeaf, 0.01)
  // The rule, taped on the glass beside the door.
  const rule = canvasPlane(0.21, 0.297, 512, P.drawRule)
  {
    const geo = new THREE.PlaneGeometry(0.21, 0.297, 6, 8)
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      // The lower right corner curls away from the glass.
      const k = Math.max(0, (x - 0.04) / 0.065) * Math.max(0, (-y - 0.08) / 0.07)
      pos.setZ(i, 0.018 * k * k)
    }
    geo.computeVertexNormals()
    rule.mesh.geometry.dispose()
    rule.mesh.geometry = geo
    ;(rule.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  }
  rule.mesh.position.set(-1.6, 1.55, -3.994)
  office.add(rule.mesh)
  // Windows: frames, glass, blinds (the middle one raised half), radiators.
  for (const z of [-2.3, 0, 2.3]) {
    const g = new THREE.Group()
    g.position.set(5, 0, z)
    g.rotation.y = -PI / 2
    office.add(g)
    rbox(1.7, 0.06, 0.08, m.frame, 0, 0.93, -0.02, g, 0.01)
    rbox(1.7, 0.06, 0.08, m.frame, 0, 2.47, -0.02, g, 0.01)
    rbox(0.05, 1.6, 0.08, m.frame, 0, 1.7, -0.02, g, 0.01)
    mesh(new THREE.PlaneGeometry(1.66, 1.56), m.glass, 0, 1.7, -0.03, g)
    const bl = blinds(1.62, 1.5, m.blindsMat)
    if (z === 0) {
      bl.group.scale.y = 0.42
      bl.group.position.set(0, 2.5 - 0.75 * 0.42, 0.08)
      bl.set(0.1)
    } else {
      bl.group.position.set(0, 1.75, 0.08)
      bl.set(0.35)
    }
    g.add(bl.group)
    const rad = radiator(1.2, m.radiatorMat)
    rad.position.set(0, 0, 0.12)
    g.add(rad)
  }
  // Ceiling panels: only the south-west one is on tonight.
  for (const [x, z, on] of [
    [-2.5, -2, false],
    [2.5, -2, false],
    [-2.5, 2, true],
    [2.5, 2, false],
  ] as const) {
    const pl = ceilingPanel(0.6, 0.6, on ? m.panelOn : m.panelOff)
    pl.position.set(x, 3.0, z)
    office.add(pl)
  }
  for (const [x, z, r] of [
    [-0.8, 3.97, PI],
    [4.97, 1.4, -PI / 2],
    [-4.97, -0.8, PI / 2],
  ] as const) {
    const s = socket()
    s.position.set(x, 0.32, z)
    s.rotation.y = r
    office.add(s)
  }

  // ——— Arif's desk ———
  const d = desk(1.8, 0.8, m.deskTop, m.deskBody)
  d.position.set(DESK.x, 0, DESK.z)
  d.rotation.y = PI
  office.add(d)
  const chair = officeChair(m.chair, m.metal)
  office.add(chair)
  const monMain = monitor(m.frame, screenMat(), 0.6, 0.34)
  monMain.group.position.set(0, 1.115, -0.86)
  office.add(monMain.group)
  const monL = monitor(m.frame, screenMat(), 0.5, 0.3)
  monL.group.position.set(-0.66, 1.1, -0.76)
  monL.group.rotation.y = 0.45
  office.add(monL.group)
  const monR = monitor(m.frame, screenMat(), 0.5, 0.3)
  monR.group.position.set(0.66, 1.1, -0.76)
  monR.group.rotation.y = -0.45
  office.add(monR.group)
  const mm = canvasPlane(0.6, 0.34, 1024, () => {}, { emissive: true })
  mm.mesh.position.z = 0.002
  monMain.group.add(mm.mesh)
  const lm = canvasPlane(0.5, 0.3, 768, () => {}, { emissive: true })
  lm.mesh.position.z = 0.002
  monL.group.add(lm.mesh)
  const rm = canvasPlane(0.5, 0.3, 768, () => {}, { emissive: true })
  rm.mesh.position.z = 0.002
  monR.group.add(rm.mesh)
  const note = canvasPlane(0.075, 0.075, 256, P.drawNote)
  note.mesh.position.set(0.28, 0.155, 0.006)
  note.mesh.rotation.z = -0.07
  monMain.group.add(note.mesh)
  const kb = keyboard()
  kb.position.copy(ON_DESK.keyboard)
  kb.rotation.y = PI
  office.add(kb)
  const ms = mouse()
  ms.position.copy(ON_DESK.mouse)
  office.add(ms)
  const lamp = deskLamp(m.metal, m.dark)
  lamp.group.position.set(-0.78, 0.74, -0.85)
  lamp.group.rotation.y = 0.5
  office.add(lamp.group)
  lamp.group.updateMatrixWorld(true)
  const lampBulb = lamp.bulb.clone().applyMatrix4(lamp.group.matrixWorld)
  // The bulb's glow inside the shade (on with the lamp).
  const lampGlow = mesh(new THREE.SphereGeometry(0.018, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a8 }), lampBulb.x, lampBulb.y + 0.02, lampBulb.z, office)
  const rep = papers(5, 3)
  rep.position.set(-0.42, 0.754, -0.56)
  office.add(rep)
  const report = canvasPlane(0.21, 0.297, 512, P.drawReport)
  report.mesh.rotation.set(-PI / 2, 0, 0.12)
  report.mesh.position.set(-0.42, 0.7585, -0.56)
  office.add(report.mesh)
  const bd = binder(m.bookB)
  bd.position.set(0.82, 0.754, -0.88)
  bd.rotation.y = PI / 2 + 0.1
  office.add(bd)
  const tower = pcTower(m.dark)
  tower.position.set(0.5, 0, -0.78)
  tower.rotation.y = PI
  office.add(tower)
  const b = bin(m.dark)
  b.position.set(1.15, 0, -0.72)
  office.add(b)
  // The bin's contents from İKİ KUTU on: the torn envelope and the crumpled page.
  const crumple = new THREE.Group()
  crumple.position.set(1.15, 0.3, -0.72)
  office.add(crumple)
  mesh(new THREE.IcosahedronGeometry(0.06, 1), pbr('paper', 0xf1ede4, { roughness: 0.9 }), 0.02, 0.0, 0.01, crumple).scale.set(1, 0.85, 0.9)
  rbox(0.2, 0.004, 0.1, pbr('paper', 0xefe6d2), -0.03, 0.03, -0.02, crumple, 0.001).rotation.set(0.9, 0.3, 0.2)
  crumple.visible = false
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
    office,
    48,
  )
  const rp = receiptPrinter()
  rp.position.copy(ON_DESK.printer)
  rp.rotation.y = -0.35
  office.add(rp)
  // A shallow desk tray (the tally counter lives here).
  const trayG = new THREE.Group()
  trayG.position.copy(ON_DESK.tray)
  trayG.rotation.y = 0.15
  office.add(trayG)
  rbox(0.2, 0.006, 0.12, m.tray, 0, 0.003, 0, trayG, 0.002)
  for (const [x, z, w, dd] of [
    [0, 0.058, 0.2, 0.006],
    [0, -0.058, 0.2, 0.006],
    [0.097, 0, 0.006, 0.12],
    [-0.097, 0, 0.006, 0.12],
  ] as const)
    rbox(w, 0.025, dd, m.tray, x, 0.0125, z, trayG, 0.001)
  // A few clips and a rubber in the tray.
  for (let i = 0; i < 3; i++) rbox(0.03, 0.002, 0.008, hw.steel, 0.05 - i * 0.012, 0.008, 0.03, trayG, 0.001).rotation.y = 0.3 * i
  if (models.stapler) {
    const st = models.stapler
    st.position.set(-0.76, 0.754, -0.46)
    st.rotation.y = 0.55
    office.add(st)
  }
  if (models.lens) {
    // Lying flat on the desk (the model stands on its handle).
    const ln = models.lens
    const lb = new THREE.Box3().setFromObject(ln)
    const lt = lb.max.z - lb.min.z
    ln.rotation.set(-PI / 2, 0, -0.7, 'YXZ')
    ln.position.set(-0.4, 0.754 + lt / 2 + 0.001, -0.66)
    office.add(ln)
  }

  // ——— Selin's desk by the windows ———
  const sd = desk(1.4, 0.7, m.deskTop, m.deskBody)
  sd.position.set(SELIN_DESK.x, 0, SELIN_DESK.z)
  sd.rotation.y = -PI / 2
  office.add(sd)
  const selinChair = officeChair(m.chair, m.metal)
  selinChair.position.set(SELIN_CHAIR.x, 0, SELIN_CHAIR.z)
  selinChair.rotation.y = PI / 2
  office.add(selinChair)
  const monS = monitor(m.frame, screenMat(), 0.5, 0.3)
  monS.group.position.set(3.52, 1.1, SELIN_DESK.z)
  monS.group.rotation.y = -PI / 2
  office.add(monS.group)
  const sm = canvasPlane(0.5, 0.3, 512, () => {}, { emissive: true })
  sm.mesh.position.z = 0.002
  monS.group.add(sm.mesh)
  const skb = keyboard()
  skb.position.set(3.12, 0.754, SELIN_DESK.z)
  skb.rotation.y = PI / 2
  office.add(skb)
  // Her low partition with the drawing.
  rbox(0.04, 1.4, 1.5, m.chair, 3.72 + 0.02, 0.7, SELIN_DESK.z, office, 0.02)
  const drawing = canvasPlane(0.24, 0.17, 512, P.drawDrawing)
  drawing.mesh.position.set(3.695, 1.22, 0.98)
  drawing.mesh.rotation.set(0, -PI / 2, 0.03)
  office.add(drawing.mesh)
  for (const [y, z] of [
    [1.3, 0.88],
    [1.3, 1.08],
  ])
    mesh(new THREE.SphereGeometry(0.005, 8, 6), std(0xd23a2a, 0.4), 3.69, y, z, office)
  const sLamp = deskLamp(m.metal, m.dark)
  sLamp.group.position.set(3.55, 0.74, 1.9)
  sLamp.group.rotation.y = -PI / 2 - 0.5
  office.add(sLamp.group)
  sLamp.group.updateMatrixWorld(true)
  const selinBulb = sLamp.bulb.clone().applyMatrix4(sLamp.group.matrixWorld)
  const selinGlow = mesh(new THREE.SphereGeometry(0.018, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a8 }), selinBulb.x, selinBulb.y + 0.02, selinBulb.z, office)
  const bag = simitBag()
  bag.position.set(3.1, 0.754, 1.88)
  office.add(bag)
  const pl = plant(m.pot, m.leaf, 0.9, 12)
  pl.position.set(4.45, 0, -1.2)
  office.add(pl)

  // ——— The wall display on its turning stand ———
  const wdPivot = new THREE.Group()
  wdPivot.position.copy(WD_C)
  office.add(wdPivot)
  rbox(2.34, 1.36, 0.06, m.frame, 0, 0, -0.035, wdPivot, 0.01)
  rbox(0.9, 0.5, 0.08, m.frame, 0, 0, -0.1, wdPivot, 0.02)
  const wd = canvasPlane(2.24, 1.26, 1024, () => {}, { emissive: true })
  wd.mesh.position.z = 0.002
  wdPivot.add(wd.mesh)
  // Column, turntable base, the small microphone LED under the screen.
  rbox(0.12, WD_C.y - 0.04, 0.1, m.metal, 0, -(WD_C.y - 0.04) / 2 - 0.02, -0.16, wdPivot, 0.01)
  mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 40), m.dark, 0, -WD_C.y + 0.02, -0.1, wdPivot).castShadow = true
  mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.012, 40), m.metal, 0, -WD_C.y + 0.046, -0.1, wdPivot)
  const micLed = mesh(new THREE.CircleGeometry(0.006, 12), new THREE.MeshBasicMaterial({ color: 0xffb347 }), 0, -0.665, 0.0, wdPivot)
  rbox(0.05, 0.016, 0.02, m.dark, 0, -0.665, -0.008, wdPivot, 0.004)

  // ——— Coffee corner (west) ———
  const ctr = counter(2.2, 0.62, 0.92, m.counterTop, m.cabinet)
  ctr.position.set(-4.69, 0, 0.3)
  ctr.rotation.y = PI / 2
  office.add(ctr)
  // The coffee machine (front toward +x), its jug separate so it can be lifted.
  const cm = new THREE.Group()
  cm.position.copy(COFFEE)
  cm.rotation.y = PI / 2
  office.add(cm)
  rbox(0.24, 0.04, 0.26, m.coffeeBody, 0, 0.02, 0, cm, 0.01)
  rbox(0.24, 0.38, 0.1, m.coffeeBody, 0, 0.19, -0.08, cm, 0.02)
  rbox(0.24, 0.07, 0.26, m.coffeeBody, 0, 0.36, 0, cm, 0.02)
  mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.008, 28), hw.steel, 0, 0.044, 0.04, cm)
  const coffeeLed = mesh(new THREE.CircleGeometry(0.004, 12), hw.ledAmber, 0.08, 0.36, 0.131, cm)
  const jug = new THREE.Group()
  const jugProfile: Array<[number, number]> = [
    [0, 0],
    [0.06, 0],
    [0.065, 0.03],
    [0.066, 0.1],
    [0.05, 0.14],
    [0.052, 0.15],
  ]
  mesh(new THREE.LatheGeometry(jugProfile.map(([r, y]) => new THREE.Vector2(r, y)), 32), m.jugGlass, 0, 0, 0, jug)
  mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.058, 0],
        [0.062, 0.03],
        [0.063, 0.06],
        [0, 0.06],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      32,
    ),
    m.coffee,
    0,
    0.002,
    0,
    jug,
  )
  rbox(0.02, 0.09, 0.02, hw.plasticDark, 0.085, 0.08, 0, jug, 0.006)
  rbox(0.13, 0.012, 0.13, hw.plasticDark, 0, 0.152, 0, jug, 0.006)
  office.add(jug)
  const jugHome = new THREE.Vector3(COFFEE.x + 0.04, COFFEE.y + 0.048, COFFEE.z)
  jug.position.copy(jugHome)
  jug.rotation.y = PI / 2
  // Spare mugs; the sugar bowl with paper-wrapped cubes.
  const spare = mug(m.mug)
  spare.position.set(-4.78, 0.92, -0.45)
  office.add(spare)
  const bowl = new THREE.Group()
  bowl.position.set(-4.62, 0.92, 0.85)
  office.add(bowl)
  mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.04, 0],
        [0.055, 0.03],
        [0.058, 0.055],
        [0.054, 0.055],
        [0.05, 0.03],
        [0, 0.006],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      32,
    ),
    m.mug,
    0,
    0,
    0,
    bowl,
  ).castShadow = true
  const wrapMat = pbr('paper', 0xf3efe6, { roughness: 0.8 })
  const rnd = mulberry32(8)
  for (let i = 0; i < 9; i++) rbox(0.022, 0.012, 0.016, wrapMat, (rnd() - 0.5) * 0.06, 0.03 + rnd() * 0.02, (rnd() - 0.5) * 0.06, bowl, 0.002).rotation.set(rnd(), rnd() * 3, rnd())
  // Two empty wrappers, left on the counter (from coffee on).
  const wrappers = new THREE.Group()
  wrappers.position.set(-4.55, 0.921, 0.72)
  office.add(wrappers)
  for (const [x, z, r] of [
    [0, 0, 0.4],
    [0.03, 0.025, 1.6],
  ] as const) {
    const w = mesh(new THREE.PlaneGeometry(0.034, 0.024), wrapMat, x, 0.0006, z, wrappers)
    w.rotation.set(-PI / 2, 0, r)
  }
  wrappers.visible = false
  // Fridge, bookshelf.
  rbox(0.62, 0.86, 0.6, m.fridge, -4.68, 0.43, -1.25, office, 0.02)
  rbox(0.02, 0.3, 0.02, hw.chrome, -4.36, 0.62, -1.0, office, 0.008)
  const sh = shelf(1.2, 1.8, 0.32, m.shelfWood, [m.book, m.bookB, m.bookC], 21)
  sh.position.set(-4.82, 0, -2.7)
  sh.rotation.y = PI / 2
  office.add(sh)
  // The old printer on its cabinet, with the envelope inserter on its +z side, a tray, a seal arm, an LCD.
  rbox(0.6, 0.72, 0.6, m.cabinet, -4.68, 0.36, OLD_PRINTER.z, office, 0.01)
  const pr = printer(m.fridge)
  pr.position.copy(OLD_PRINTER)
  pr.rotation.y = PI / 2
  office.add(pr)
  const inserter = new THREE.Group()
  inserter.position.set(OLD_PRINTER.x + 0.02, OLD_PRINTER.y, OLD_PRINTER.z + 0.36)
  office.add(inserter)
  rbox(0.25, 0.12, 0.3, m.fridge, 0, 0.06, 0, inserter, 0.012)
  rbox(0.18, 0.008, 0.02, hw.plasticDark, 0.0, 0.118, -0.06, inserter, 0.002)
  // Output tray (front, toward +x) and the seal arm above it.
  rbox(0.16, 0.012, 0.26, m.dark, 0.2, 0.012, 0, inserter, 0.003)
  rbox(0.012, 0.03, 0.26, m.dark, 0.275, 0.03, 0, inserter, 0.002)
  const sealArm = new THREE.Group()
  sealArm.position.set(0.05, 0.13, 0)
  inserter.add(sealArm)
  rbox(0.2, 0.02, 0.03, hw.steel, 0.1, 0, 0, sealArm, 0.004)
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 16), pbr('plastic', 0x9b2a22), 0.19, -0.02, 0, sealArm)
  const lcd = canvasPlane(0.08, 0.03, 256, (c, W, H) => P.drawLcd(c, W, H, '', false), { emissive: true })
  lcd.mesh.position.set(OLD_PRINTER.x + 0.215, OLD_PRINTER.y + 0.2, OLD_PRINTER.z - 0.1)
  lcd.mesh.rotation.y = PI / 2
  office.add(lcd.mesh)
  const printerLed = mesh(new THREE.CircleGeometry(0.004, 10), new THREE.MeshBasicMaterial({ color: 0x5dff9a }), OLD_PRINTER.x + 0.214, OLD_PRINTER.y + 0.2, OLD_PRINTER.z + 0.14, office)
  printerLed.rotation.y = PI / 2

  // ——— South wall: whiteboard, the stopped clock, the coat rack, the door ———
  const wb = whiteboard(2.3, 1.15, m.metal, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }))
  wb.group.position.set(-1.6, 1.55, 3.985)
  wb.group.rotation.y = PI
  office.add(wb.group)
  const board = canvasPlane(2.3, 1.15, 1024, P.drawBoard)
  board.mesh.position.z = 0.012
  wb.group.add(board.mesh)
  const clock = wallClock(m.metal, new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.6 }), m.dark)
  clock.group.position.set(0.6, 2.35, 3.98)
  clock.group.rotation.y = PI
  office.add(clock.group)
  const rack = new THREE.Group()
  rack.position.set(COAT_RACK.x, 0, COAT_RACK.z)
  office.add(rack)
  mesh(new THREE.CylinderGeometry(0.02, 0.025, 1.8, 12), m.metal, 0, 0.9, 0, rack).castShadow = true
  mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.025, 24), m.metal, 0, 0.012, 0, rack)
  for (let i = 0; i < 4; i++) {
    const hook = rbox(0.18, 0.015, 0.015, m.metal, 0, 1.75, 0, rack, 0.006)
    hook.rotation.y = (i * PI) / 2
  }
  const coat = hangingCoat(m.coat)
  office.add(coat)
  const bagRack = leatherBag(m.bag)
  office.add(bagRack)
  const officeDoor = door({ w: 0.9, h: 2.05, frame: m.trim, leaf: pbr('painted', 0x8d9298, { roughness: 0.8 }), handle: hw.chrome })
  officeDoor.group.position.set(DOOR.x, 0, DOOR.z + 0.075)
  officeDoor.group.rotation.y = PI
  office.add(officeDoor.group)

  // ——— B · The server hall ———
  hall.add(room({ w: 10, d: 7.8, h: 3.3, z: -8.05, wall: m.wallHall, floor: m.hallFloor, ceiling: m.wallHall, trim: null, skip: ['s', 'n'] }))
  const northWall = rbox(10, 3.3, 0.15, m.wallHall, 0, 1.65, -11.95 - 0.075, hall, 0.01)
  // Above the glass, the hall's own south wall from 3.0 to 3.3.
  rbox(10, 0.3, 0.15, m.wallHall, 0, 3.15, -4.08, hall, 0.01)
  const racks = new RackField()
  hall.add(racks.group)
  for (const z of [-6.0, -8.4, -10.8]) {
    rbox(2.1, 0.06, 0.4, m.tray, -3.25, 2.55, z, hall, 0.01)
    rbox(2.1, 0.06, 0.4, m.tray, 1.25, 2.55, z, hall, 0.01)
  }
  rbox(0.4, 0.06, 6.2, m.tray, -1.0, 2.62, -8.4, hall, 0.01)
  // The cooling unit (louvres on its +x face) and the console on the west wall.
  rbox(0.9, 2.0, 1.6, m.unit, -4.5, 1.0, -10.4, hall, 0.03)
  for (let i = 0; i < 14; i++) rbox(0.02, 0.05, 1.3, m.dark, -4.045, 0.45 + i * 0.09, -10.4, hall, 0.004).rotation.z = 0.5
  rbox(0.02, 0.22, 0.3, m.dark, -4.04, 1.85, -9.85, hall, 0.004)
  const coolPanel = mesh(new THREE.PlaneGeometry(0.08, 0.03), new THREE.MeshBasicMaterial({ color: 0x5dff9a }), -4.035, 1.85, -9.8, hall)
  coolPanel.rotation.y = PI / 2
  const con = monitor(m.frame, screenMat(), 0.56, 0.34)
  con.group.position.copy(CONSOLE)
  con.group.rotation.y = PI / 2
  hall.add(con.group)
  rbox(0.5, 1.0, 0.5, m.darkPanel, -4.72, 0.5, -7.2, hall, 0.02)
  const hc = canvasPlane(0.56, 0.34, 768, () => {}, { emissive: true })
  hc.mesh.position.z = 0.002
  con.group.add(hc.mesh)
  // A second plane over the console screen for the live camera feed (AYNA).
  const feedMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const feed = mesh(new THREE.PlaneGeometry(0.56, 0.34), feedMat, 0, 0, 0.003, con.group)
  feed.visible = false
  // The camera that feeds it, high on the east wall.
  const cctv = new THREE.Group()
  cctv.position.set(4.85, 2.75, -11.2)
  hall.add(cctv)
  rbox(0.06, 0.06, 0.2, m.unit, -0.08, 0, 0, cctv, 0.01).rotation.y = 0.5
  rbox(0.12, 0.09, 0.22, m.unit, -0.2, -0.05, 0.08, cctv, 0.02).rotation.set(0.3, -0.9, 0)
  // Hall light fixtures (their light is the scene's point lights).
  for (const [x, z] of [
    [-2, -6.0],
    [2, -8.4],
    [-1, -10.8],
  ] as const)
    rbox(1.2, 0.04, 0.18, m.hallLamp, x, 3.27, z, hall, 0.01)
  // Steel shelves along the east wall: spares and cardboard boxes.
  const shelfSpots: Array<[number, number]> = [
    [4.62, -7.0],
    [4.62, -9.9],
  ]
  for (const [x, z] of shelfSpots) {
    if (models.shelves) {
      const s = models.shelves.clone(true)
      s.position.set(x, 0, z)
      s.rotation.y = -PI / 2
      hall.add(s)
    } else {
      const s = shelf(1.1, 2.0, 0.5, m.metal, [m.dark, m.cabinet], 3)
      s.position.set(x, 0, z)
      s.rotation.y = -PI / 2
      hall.add(s)
    }
  }
  if (models.box) {
    const spots: Array<[number, number, number, number]> = [
      [4.55, 0.02, -7.3, 0.1],
      [4.58, 0.02, -6.75, -0.2],
      [4.55, 0.86, -7.1, 0.05],
      [4.55, 0.02, -10.2, 0.3],
      [4.52, 1.62, -9.7, -0.1],
      [-4.1, 0.0, -11.5, 0.6],
    ]
    for (const [x, y, z, r] of spots) {
      const bx = models.box.clone(true)
      bx.position.set(x, y, z)
      bx.rotation.y = r
      hall.add(bx)
    }
  }
  // The mirror extension: floor, ceiling and walls running on to z −62.
  const mirrorShell = new THREE.Group()
  hall.add(mirrorShell)
  const extLen = 50
  const ez = -11.95 - extLen / 2
  const floorExt = mesh(new THREE.PlaneGeometry(10, extLen), m.hallFloor, 0, 0, ez, mirrorShell)
  floorExt.rotation.x = -PI / 2
  floorExt.receiveShadow = true
  const ceilExt = mesh(new THREE.PlaneGeometry(10, extLen), m.wallHall, 0, 3.3, ez, mirrorShell)
  ceilExt.rotation.x = PI / 2
  for (const sx of [-1, 1]) {
    const w = mesh(new THREE.PlaneGeometry(extLen, 3.3), m.wallHall, sx * 5, 1.65, ez, mirrorShell)
    w.rotation.y = -sx * (PI / 2)
  }
  // Repeated light fixtures and their pools (their light is faked).
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(4.5, 3.2), poolMaterial(0x7fa6d8, 0.22), 21)
  const fixtures = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.04, 0.18), m.hallLamp, 21)
  {
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-PI / 2, 0, 0))
    for (let i = 0; i < 21; i++) {
      const z = -13.2 - i * 2.4
      const x = [-2, 2, -1][i % 3]
      m4.compose(new THREE.Vector3(x, 0.012, z), q, new THREE.Vector3(1, 1, 1))
      pools.setMatrixAt(i, m4)
      m4.makeTranslation(x, 3.27, z)
      fixtures.setMatrixAt(i, m4)
    }
  }
  pools.frustumCulled = false
  fixtures.frustumCulled = false
  mirrorShell.add(pools, fixtures)
  mirrorShell.visible = false

  // ——— C · Corridor and kitchen ———
  kitchen.add(room({ w: 16, d: 2.4, h: 2.8, z: 5.35, wall: m.wall, floor: m.corridorFloor, ceiling: m.ceiling, trim: m.trim, skip: ['n'], openings: [{ side: 's', at: -2.2, width: 1.0, height: 2.1 }] }))
  // The corridor's north wall (the office's south wall seen from the other side) with the door hole.
  for (const [x0, x1] of [
    [-8, DOOR.x - 0.5],
    [DOOR.x + 0.5, 8],
  ] as const)
    if (x1 - x0 > 0.01) rbox(x1 - x0, 2.8, 0.02, m.wall, (x0 + x1) / 2, 1.4, 4.155, kitchen, 0.002)
  rbox(1.0, 0.7, 0.02, m.wall, DOOR.x, 2.45, 4.155, kitchen, 0.002)
  for (const x of [-4.5, 1.5, 6]) {
    const pl2 = ceilingPanel(1.2, 0.3, m.panelOn)
    pl2.position.set(x, 2.8, 5.35)
    kitchen.add(pl2)
  }
  kitchen.add(room({ w: 4, d: 3.2, h: 2.8, x: -2.2, z: 8.3, wall: m.wall, floor: m.corridorFloor, ceiling: m.ceiling, trim: m.trim, skip: ['n'] }))
  const kc = counter(2.4, 0.62, 0.92, m.counterTop, m.cabinet)
  kc.position.set(-2.2, 0, 9.55)
  kc.rotation.y = PI
  kitchen.add(kc)
  rbox(2.4, 0.7, 0.33, m.cabinet, -2.2, 1.9, 9.735, kitchen, 0.008)
  let cupDoor = new THREE.Group()
  for (let i = 0; i < 4; i++) {
    const x0 = -3.4 + i * 0.6
    const dr = new THREE.Group()
    dr.position.set(x0 + 0.003, 1.9, 9.565)
    kitchen.add(dr)
    rbox(0.594, 0.69, 0.02, m.cabinet, 0.297, 0, 0, dr, 0.004)
    rbox(0.012, 0.16, 0.02, hw.chrome, 0.55, -0.2, -0.018, dr, 0.005)
    if (i === 1) cupDoor = dr
  }
  rbox(1.15, 0.015, 0.28, m.cabinet, -2.6, 1.9, 9.74, kitchen, 0.003).receiveShadow = true
  for (let i = 0; i < 3; i++) {
    const cup = mug(m.mug)
    cup.position.set(-3.2 + i * 0.13, 1.908, 9.72)
    kitchen.add(cup)
  }
  rbox(0.52, 0.012, 0.42, hw.steel, -2.6, 0.926, 9.55, kitchen, 0.004)
  rbox(0.44, 0.004, 0.34, m.dark, -2.6, 0.931, 9.55, kitchen, 0.002)
  tube(
    [
      [-2.6, 0.93, 9.8],
      [-2.6, 1.15, 9.79],
      [-2.6, 1.22, 9.7],
      [-2.6, 1.14, 9.6],
    ],
    0.011,
    hw.chrome,
    kitchen,
    24,
  )
  const stream = mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.2, 8), new THREE.MeshPhysicalMaterial({ color: 0xdfeef4, roughness: 0.05, transparent: true, opacity: 0.5 }), -2.6, 1.03, 9.6, kitchen)
  stream.visible = false
  // The oven under the counter at x −1.6, a tea towel over its handle.
  rbox(0.58, 0.58, 0.02, brushed(0x2a2c2f, 0.45), -1.6, 0.45, 9.235, kitchen, 0.006)
  rbox(0.46, 0.3, 0.004, new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: 0.05 }), -1.6, 0.42, 9.222, kitchen, 0.002)
  tube(
    [
      [-1.86, 0.85, 9.2],
      [-1.86, 0.85, 9.19],
      [-1.34, 0.85, 9.19],
      [-1.34, 0.85, 9.2],
    ],
    0.008,
    hw.chrome,
    kitchen,
    8,
  )
  const towel = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.4, 2, 6), pbr('fabric', 0xb85c3c))
  {
    const pos = towel.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      pos.setZ(i, y > 0.15 ? -0.02 * (y - 0.15) * 20 : 0)
    }
    towel.geometry.computeVertexNormals()
  }
  towel.position.set(-1.55, 0.67, 9.18)
  ;(towel.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  kitchen.add(towel)
  const kitchenGlass = new THREE.Group()
  kitchen.add(kitchenGlass)

  // ——— D · Outside: Ankara at night, three floors down ———
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
  mesh(skyGeo, m.sky, 0, 0, 0, outside)
  const ground = mesh(new THREE.PlaneGeometry(600, 600), m.ground, 0, -9.5, 0, outside)
  ground.rotation.x = -PI / 2
  ground.receiveShadow = true
  // The building below the office: its east face flush with the office's outer wall (x 5.15), the
  // street door in it. Nothing sticks out under the windows, so the last shot looks straight down.
  rbox(2.0, 9.5, 14, m.facade, 4.15, -4.75, 0, outside, 0.02)
  for (let i = 0; i < 3; i++) {
    // Dark windows of the floors below, one per office window.
    for (const wz of [-2.3, 0, 2.3]) {
      const w = mesh(new THREE.PlaneGeometry(1.6, 1.4), std(0x0c0f13, 0.25), 5.16, -2.0 - i * 3.0, wz, outside)
      w.rotation.y = PI / 2
    }
  }
  rbox(1.2, 2.3, 0.08, hw.plasticDark, STREET_DOOR.x + 0.01, -8.35, STREET_DOOR.z, outside, 0.01).rotation.y = PI / 2
  const doorLight = mesh(new THREE.PlaneGeometry(1.0, 2.1), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), STREET_DOOR.x + 0.05, -8.45, STREET_DOOR.z, outside)
  doorLight.rotation.y = PI / 2
  rbox(1.6, 0.08, 0.6, m.facade, STREET_DOOR.x + 0.3, -7.05, STREET_DOOR.z, outside, 0.01)
  // Forecourt, pavement with a kerb, the avenue with lane markings.
  const forecourt = mesh(new THREE.PlaneGeometry(5.35, 120), m.paving, 7.825, -9.49, -20, outside)
  forecourt.rotation.x = -PI / 2
  rbox(2.0, 0.15, 120, m.paving, 11.5, -9.425, -20, outside, 0.02)
  rbox(0.15, 0.16, 120, std(0x6d6f72, 0.8), 12.5, -9.42, -20, outside, 0.01)
  const laneMat = new THREE.MeshBasicMaterial({ color: 0x8c8a82 })
  for (let z = 40; z > -90; z -= 6) {
    const l = mesh(new THREE.PlaneGeometry(0.12, 3), laneMat, 16.2, -9.488, z, outside)
    l.rotation.x = -PI / 2
  }
  // Sodium streetlights on the west pavement, their pools on the ground.
  const poleMat = brushed(0x3a3d40, 0.6)
  const streetPools = new THREE.InstancedMesh(new THREE.PlaneGeometry(9, 9), poolMaterial(0xffb46a, 0.42), 6)
  const lampZ = [18, 6, -6, -18, -30, -42]
  lampZ.forEach((z, i) => {
    const sl = streetLamp(poleMat, m.sodium)
    sl.position.set(12.2, -9.35, z)
    outside.add(sl)
    const m4 = new THREE.Matrix4().compose(new THREE.Vector3(13.1, -9.33, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(-PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1))
    streetPools.setMatrixAt(i, m4)
  })
  streetPools.frustumCulled = false
  outside.add(streetPools)
  const carMats = [pbr('painted', 0x2f3a46, { roughness: 0.35 }), new THREE.MeshPhysicalMaterial({ color: 0x0a0c0f, roughness: 0.05, metalness: 0.2 }), hw.rubber, new THREE.MeshBasicMaterial({ color: 0xfff2d8 })] as const
  const parked = car(carMats[0], carMats[1], carMats[2], std(0x30302c, 0.4))
  parked.position.set(14, -9.5, -12)
  outside.add(parked)
  const movingCar = car(pbr('painted', 0x6d6f73, { roughness: 0.35 }), carMats[1], carMats[2], carMats[3])
  movingCar.rotation.y = PI / 2
  outside.add(movingCar)
  // Ankara: buildings across the avenue, and the city's lights further out.
  const crand = mulberry32(77)
  const litPanes: Array<{ mesh: THREE.InstancedMesh; full: number; at: number }> = []
  for (let i = 0; i < 26; i++) {
    const x = 26 + crand() * 160
    const z = -90 + crand() * 180
    const h = 12 + crand() * 40
    const f = facade({ w: 10 + crand() * 16, h, d: 10, wall: crand() < 0.5 ? m.facade : m.facadeB, facing: -1, seed: 300 + i, lit: 0.18 + crand() * 0.25 })
    f.position.set(x, -9.5, z)
    outside.add(f)
    const at = crand()
    f.traverse((o) => {
      const im = o as THREE.InstancedMesh
      if (im.isInstancedMesh && (im.material as THREE.MeshBasicMaterial).customProgramCacheKey?.() === 'facade-lit') litPanes.push({ mesh: im, full: im.count, at })
    })
  }
  const cityGeo = new THREE.BufferGeometry()
  {
    const pts: number[] = []
    const cols: number[] = []
    const r = mulberry32(91)
    const c = new THREE.Color()
    for (let i = 0; i < 2600; i++) {
      const a = -PI / 2 + (r() - 0.5) * PI * 1.1
      const dist = 200 + Math.pow(r(), 0.6) * 260
      pts.push(Math.cos(a) * dist + 40, -9.5 + r() * 6 + Math.max(0, (dist - 260) * 0.08), Math.sin(a) * dist)
      c.setHSL(0.08 + r() * 0.04, 0.8, 0.55 + r() * 0.25)
      cols.push(c.r, c.g, c.b)
    }
    cityGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    cityGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
  }
  const cityLights = new THREE.Points(cityGeo, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.9, fog: false, depthWrite: false }))
  outside.add(cityLights)

  // ——— E · Belgrad Ormanı ———
  forest.position.copy(FOREST)
  const litter = mesh(new THREE.CircleGeometry(16, 48), pbr('gravel', 0x1f1a12, { roughness: 1 }), 0, 0, 0, forest)
  litter.rotation.x = -PI / 2
  litter.receiveShadow = true
  const bark = pbr('rock', 0x2a2622, { roughness: 1 })
  const trunkGeo = new THREE.CylinderGeometry(0.85, 1, 1, 14, 3)
  trunkGeo.translate(0, 0.5, 0)
  const trunks = new THREE.InstancedMesh(trunkGeo, bark, 38)
  {
    const r = mulberry32(31)
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < 38; i++) {
      const a = r() * PI * 2
      const dist = 3 + Math.pow(r(), 0.7) * 9.5
      const rad = 0.15 + r() * 0.2
      const h = 12 + r() * 6
      m4.compose(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.06, r() * PI, (r() - 0.5) * 0.06)), new THREE.Vector3(rad, h, rad))
      trunks.setMatrixAt(i, m4)
    }
  }
  trunks.castShadow = true
  forest.add(trunks)
  const ferns: THREE.Group[] = []
  if (models.fern) {
    for (const [x, z, r, s] of [
      [0.5, -0.85, 0.2, 1.0],
      [-0.95, 0.05, 2.1, 0.9],
      [1.05, 0.95, 4.0, 1.1],
      [-1.4, -1.1, 1.0, 1.2],
      [1.8, -1.6, 2.6, 1.0],
      [-2.2, 1.6, 5.0, 1.3],
      [2.6, 1.9, 0.6, 1.1],
    ] as const) {
      const f = models.fern.clone(true)
      f.position.set(x, 0, z)
      f.rotation.y = r
      f.scale.setScalar(s)
      forest.add(f)
      ferns.push(f)
    }
  }
  if (models.log) {
    const lg = models.log
    lg.position.set(2.5, 0, -1.5)
    lg.rotation.y = 0.5
    forest.add(lg)
  } else {
    const lg = mesh(new THREE.CylinderGeometry(0.18, 0.2, 3, 12), bark, 2.5, 0.2, -1.5, forest)
    lg.rotation.set(0, 0.5, PI / 2)
  }

  return {
    office,
    hall,
    kitchen,
    outside,
    forest,
    northWall,
    mirrorShell,
    racks,
    glassDoor: gdLeaf,
    officeDoor,
    rule,
    plaque,
    chair,
    selinChair,
    mm,
    lm,
    rm,
    sm,
    hc,
    feed,
    feedMat,
    cctv,
    wd,
    wdPivot,
    micLed,
    lcd,
    printerLed,
    sealArm,
    inserter,
    lampBulb,
    lampGlow,
    selinBulb,
    selinGlow,
    jug,
    jugHome,
    coffeeLed,
    wrappers,
    crumple,
    clock,
    coat,
    bagRack,
    cupDoor,
    stream,
    kitchenGlass,
    keyboard: kb,
    mouse: ms,
    receipt: rp,
    trayG,
    coolPanel,
    movingCar,
    litPanes,
    cityLights,
    ferns,
    selinBag: bag,
    teaHome: new THREE.Vector3(3.25, 0.754, 1.0),
    screens: [mm, lm, rm, sm, hc, wd, lcd] as Screen[],
  }
}

/** A soft pool of light on the floor (additive), for lights the scene only pretends to have. */
function poolMaterial(color: number, strength: number) {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  const col = new THREE.Color(color).multiplyScalar(strength)
  return new THREE.MeshBasicMaterial({ map: t, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
}

/** A tea glass for Selin (re-exported so the director owns one instance). */
export const makeTea = teaGlass
