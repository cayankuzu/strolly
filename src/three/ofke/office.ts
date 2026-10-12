/**
 * Set A — the 7th floor: the open-plan office (x −7…7, z −3.85…8) and the
 * boss's office behind the north wall (x −2.5…2.5, z −9…−4). The boss's office
 * is built by `bossOffice()`, which ÖFKE NÖBETİ's white room uses again —
 * translated by (+160, 0, +6.5) and painted with the reveal shader — so the
 * hallucination is the morning's room exactly.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { canvasPlane, ceilingPanel, desk, facade, hardware, keyboard, monitor, mouse, mug, officeChair, papers, plant, printer, rbox, room, std, tube, wallClock, whiteboard, binder, bin } from '../kit/props'
import { pbr } from '../kit/surfaces'
import * as S from './screens'

const PI = Math.PI

export function officeMaterials() {
  return {
    carpet: pbr('carpet', 0x55626e, { roughness: 1 }),
    bossCarpet: pbr('carpet', 0x3d4148, { roughness: 1 }),
    wall: pbr('painted', 0xd9cfbd, { roughness: 1 }),
    bossWall: pbr('painted', 0xd3c7b2, { roughness: 1 }),
    ceiling: pbr('plaster', 0xeeece6, { roughness: 1 }),
    trim: pbr('painted', 0xb9b2a4, { roughness: 0.8 }),
    walnut: pbr('wood', 0x5a3a26, { roughness: 0.55 }),
    walnutDark: pbr('wood', 0x3f281a, { roughness: 0.5 }),
    oak: pbr('laminate', 0xc4b59b, { roughness: 0.7 }),
    deskBody: pbr('painted', 0x9a9a96, { roughness: 0.8 }),
    chairFab: pbr('fabric', 0x2e3440, { roughness: 1 }),
    leather: pbr('leather', 0x141416, { roughness: 0.45 }),
    chrome: pbr('metal', 0xc9ccd0, { roughness: 0.25 }),
    steel: pbr('metal', 0x9aa0a6, { roughness: 0.4 }),
    brushed: pbr('metal', 0xb7bcc0, { roughness: 0.35 }),
    frost: new THREE.MeshPhysicalMaterial({ color: 0xeef3f4, roughness: 0.42, transmission: 0, transparent: true, opacity: 0.82 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xdfeef3, roughness: 0.04, transparent: true, opacity: 0.12, depthWrite: false }),
    panelLight: new THREE.MeshBasicMaterial({ color: 0xf6f8ff }),
    pot: pbr('ceramic', 0xe8e4dc, { roughness: 0.5 }),
    leaf: pbr('plastic', 0x3f6b35, { roughness: 0.7 }),
    paper: pbr('paper', 0xf3f0e8),
    black: std(0x0e0f10, 0.6),
    plasticDark: pbr('plastic', 0x24272b, { roughness: 0.7 }),
    plasticLight: pbr('plastic', 0xd8d6d0, { roughness: 0.6 }),
    gold: pbr('metal', 0xd6b25e, { roughness: 0.3 }),
    pen: [std(0x1a3d8a, 0.4), std(0x111111, 0.4), std(0xb02a2a, 0.4), std(0xe8e2d0, 0.4), std(0x1a6a3a, 0.4), std(0x222222, 0.4)],
    ground: std(0x2a2d31, 1),
    tower: pbr('concrete', 0x8a8d92, { roughness: 1 }),
    tower2: pbr('concrete', 0xb5aea2, { roughness: 1 }),
    tower3: pbr('concrete', 0x5d6670, { roughness: 1 }),
  }
}
export type OfficeMats = ReturnType<typeof officeMaterials>

// ——— The city outside: a painted far skyline and real blocks below the window line. ———

export function skyline(time: 'morning' | 'dusk') {
  return (c: CanvasRenderingContext2D, W: number, H: number) => {
    const g = c.createLinearGradient(0, 0, 0, H)
    if (time === 'morning') {
      g.addColorStop(0, '#7fa9cf')
      g.addColorStop(0.55, '#c9dbe6')
      g.addColorStop(0.75, '#f1e3c4')
      g.addColorStop(1, '#d9c7a4')
    } else {
      g.addColorStop(0, '#2b2a4a')
      g.addColorStop(0.45, '#7a4e6a')
      g.addColorStop(0.7, '#e08a4a')
      g.addColorStop(1, '#5a3a3a')
    }
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
    const rand = mulberry32(time === 'morning' ? 7 : 8)
    // Two layers of distant towers.
    for (const [layer, col] of [
      [0, time === 'morning' ? 'rgba(120,140,160,0.55)' : 'rgba(40,30,50,0.75)'],
      [1, time === 'morning' ? 'rgba(90,105,120,0.8)' : 'rgba(25,20,32,0.92)'],
    ] as const) {
      c.fillStyle = col
      let x = 0
      while (x < W) {
        const w = W * (0.015 + rand() * 0.04)
        const h = H * (0.08 + rand() * (layer ? 0.22 : 0.32))
        c.fillRect(x, H * 0.82 - h + layer * H * 0.06, w, h + H)
        // Lit windows at dusk.
        if (time === 'dusk' && layer === 1)
          for (let k = 0; k < 10; k++) {
            if (rand() < 0.5) continue
            c.fillStyle = 'rgba(255,200,130,0.7)'
            c.fillRect(x + rand() * w, H * 0.88 - rand() * h, 2, 2)
            c.fillStyle = col
          }
        x += w + W * rand() * 0.01
      }
    }
    if (time === 'morning') {
      // The low sun's haze on the right.
      const s = c.createRadialGradient(W * 0.85, H * 0.62, 0, W * 0.85, H * 0.62, W * 0.35)
      s.addColorStop(0, 'rgba(255,240,205,0.9)')
      s.addColorStop(1, 'rgba(255,240,205,0)')
      c.fillStyle = s
      c.fillRect(0, 0, W, H)
    }
  }
}

/** Blocks under the window line, as seen from the 7th floor (their bases far below). */
function cityBelow(m: OfficeMats, parent: THREE.Object3D, along: 'x' | 'z', facing: 1 | -1, near: number, far: number, seed: number) {
  const rand = mulberry32(seed)
  const walls = [m.tower, m.tower2, m.tower3]
  for (let i = 0; i < 9; i++) {
    const w = 8 + rand() * 10
    const d = 8 + rand() * 8
    const h = 8 + rand() * 17
    const f = facade({ w, h, d, wall: walls[i % 3], facing: 1, seed: seed + i, lit: 0.2, ground: false })
    const lat = -40 + i * 10 + rand() * 4
    const dep = near + rand() * (far - near)
    if (along === 'x') {
      // a row running along x, faces toward −facing·z
      f.rotation.y = facing === 1 ? PI / 2 : -PI / 2
      f.position.set(lat, -22, facing * dep)
    } else {
      f.rotation.y = facing === 1 ? PI : 0
      f.position.set(facing * dep, -22, lat)
    }
    parent.add(f)
  }
}

// ——— The boss's office ———

export type BossOffice = {
  root: THREE.Group
  shell: THREE.Group
  furniture: THREE.Group
  view: THREE.Group
  door: { frame: THREE.Group; leaf: THREE.Group; glass: THREE.Mesh }
  chair: { group: THREE.Group; back: THREE.Group }
  guest: THREE.Group
  monitor: THREE.Group
  monitorScreen: THREE.Mesh
  penHolder: THREE.Group
  pens: THREE.Mesh[]
  photo: THREE.Group
  plant: THREE.Group
  clock: ReturnType<typeof wallClock>
  windowPos: THREE.Vector3
}

/** An executive chair facing +z: five-star base, a high padded back that reclines. */
function execChair(m: OfficeMats) {
  const g = new THREE.Group()
  const hw = hardware()
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * PI * 2 + PI / 10
    const arm = new THREE.Group()
    arm.rotation.y = a
    g.add(arm)
    rbox(0.33, 0.035, 0.05, m.chrome, 0.16, 0.09, 0, arm, 0.012).rotation.z = 0.08
    cyl(0.032, 0.032, 0.03, hw.rubber, 0.31, 0.035, 0, arm, 14).rotation.x = PI / 2
  }
  cyl(0.05, 0.055, 0.06, m.chrome, 0, 0.11, 0, g, 20)
  cyl(0.028, 0.028, 0.26, m.chrome, 0, 0.26, 0, g, 16)
  rbox(0.54, 0.1, 0.52, m.leather, 0, 0.46, 0.01, g, 0.04)
  const back = new THREE.Group()
  back.position.set(0, 0.5, -0.24)
  g.add(back)
  rbox(0.52, 0.82, 0.1, m.leather, 0, 0.42, 0, back, 0.05)
  rbox(0.32, 0.16, 0.06, m.leather, 0, 0.86, 0.02, back, 0.04)
  for (const sx of [-1, 1]) {
    rbox(0.06, 0.03, 0.34, m.leather, sx * 0.29, 0.66, 0.0, g, 0.012)
    rbox(0.03, 0.18, 0.04, m.chrome, sx * 0.29, 0.56, 0.02, g, 0.008)
  }
  return { group: g, back }
}

/** A plain padded guest chair (seat faces +z). */
function guestChair(m: OfficeMats) {
  const g = new THREE.Group()
  rbox(0.48, 0.08, 0.46, m.leather, 0, 0.46, 0, g, 0.03)
  const back = rbox(0.48, 0.5, 0.06, m.leather, 0, 0.78, -0.22, g, 0.03)
  back.rotation.x = -0.12
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const leg = cyl(0.012, 0.01, 0.44, m.chrome, sx * 0.2, 0.22, sz * 0.19, g, 10)
      leg.rotation.z = sx * 0.05
    }
  return g
}

/** The door: frame with casings on both faces, a leaf with a walnut lower half and frosted glass above. Hinge on −x; the leaf faces +z when closed. */
function officeDoor(m: OfficeMats, w: number, h: number) {
  const frame = new THREE.Group()
  for (const sx of [-1, 1]) {
    rbox(0.05, h + 0.05, 0.17, m.walnutDark, sx * (w / 2 + 0.025), (h + 0.05) / 2, 0, frame, 0.004)
    for (const sz of [-1, 1]) rbox(0.08, h + 0.09, 0.016, m.walnutDark, sx * (w / 2 + 0.05), (h + 0.09) / 2, sz * 0.09, frame, 0.004)
  }
  rbox(w + 0.1, 0.05, 0.17, m.walnutDark, 0, h + 0.025, 0, frame, 0.004)
  for (const sz of [-1, 1]) rbox(w + 0.26, 0.08, 0.016, m.walnutDark, 0, h + 0.09, sz * 0.09, frame, 0.004)
  const leaf = new THREE.Group()
  leaf.position.set(-w / 2, 0, 0)
  const lw = w - 0.008
  const t = 0.044
  // Lower panel, stiles and rails round the glass.
  rbox(lw, 1.0, t, m.walnut, lw / 2, 0.5, 0, leaf, 0.003)
  rbox(0.11, h - 1.0, t, m.walnut, 0.055, 1.0 + (h - 1.0) / 2, 0, leaf, 0.003)
  rbox(0.11, h - 1.0, t, m.walnut, lw - 0.055, 1.0 + (h - 1.0) / 2, 0, leaf, 0.003)
  rbox(lw, 0.12, t, m.walnut, lw / 2, h - 0.06, 0, leaf, 0.003)
  const glass = box(lw - 0.22, h - 1.12, 0.012, m.frost, lw / 2, 1.0 + (h - 1.12) / 2, 0, leaf)
  glass.castShadow = false
  // Raised moulding on the lower panel.
  for (const sz of [-1, 1]) rbox(lw - 0.2, 0.7, 0.008, m.walnut, lw / 2, 0.48, sz * 0.024, leaf, 0.004)
  const handle = new THREE.Group()
  handle.position.set(lw - 0.075, 1.0, 0)
  for (const sz of [-1, 1]) {
    cyl(0.025, 0.025, 0.008, m.brushed, 0, 0, sz * 0.026, handle, 20).rotation.x = PI / 2
    cyl(0.009, 0.009, 0.05, m.brushed, 0, 0, sz * 0.05, handle, 12).rotation.x = PI / 2
    rbox(0.12, 0.018, 0.02, m.brushed, -0.05, 0, sz * 0.074, handle, 0.008)
  }
  leaf.add(handle)
  for (const hy of [0.25, h - 0.28]) cyl(0.009, 0.009, 0.1, m.brushed, 0.004, hy, 0.024, leaf, 10)
  // The nameplate, on the office side (+z face).
  const plate = canvasPlane(0.3, 0.07, 512, S.nameplate)
  plate.mesh.position.set(lw / 2, 1.56, 0.03)
  leaf.add(plate.mesh)
  return { frame, leaf, glass }
}

/**
 * The boss's office in set-A coordinates: interior x −2.5…2.5, z −9…−4, 2.9 m
 * high; its south wall (with the door) is the open office's north wall.
 */
export function bossOffice(m: OfficeMats, opts: { doorW?: number; morning: THREE.Texture | null }): BossOffice {
  const root = new THREE.Group()
  const shell = new THREE.Group()
  const furniture = new THREE.Group()
  const view = new THREE.Group()
  root.add(shell, furniture, view)
  const dw = opts.doorW ?? 0.95
  const r = room({
    w: 5,
    d: 5,
    h: 2.9,
    x: 0,
    z: -6.5,
    wall: m.bossWall,
    floor: m.bossCarpet,
    ceiling: m.ceiling,
    trim: m.trim,
    openings: [
      { side: 'n', at: 0, width: 3.0, height: 1.6, bottom: 0.9 },
      { side: 's', at: 0, width: dw, height: 2.1 },
    ],
  })
  shell.add(r)
  // Ceiling: two soft panels.
  for (const z of [-5.4, -7.6]) {
    const cp = ceilingPanel(1.2, 0.6, m.panelLight)
    cp.position.set(0, 2.9, z)
    shell.add(cp)
  }
  // The window: frame, mullion, the glass, a sill.
  const win = new THREE.Group()
  win.position.set(0, 0, -9.0)
  shell.add(win)
  rbox(3.0, 0.05, 0.08, m.plasticLight, 0, 0.9, -0.04, win, 0.004)
  rbox(3.0, 0.05, 0.08, m.plasticLight, 0, 2.5, -0.04, win, 0.004)
  for (const x of [-1.5, 0, 1.5]) rbox(0.05, 1.6, 0.08, m.plasticLight, x, 1.7, -0.04, win, 0.004)
  const pane = box(3.0, 1.6, 0.01, m.glass, 0, 1.7, -0.05, win)
  pane.castShadow = false
  // Door.
  const door = officeDoor(m, dw, 2.1)
  door.frame.position.set(0, 0, -3.925)
  door.leaf.position.z = 0
  door.frame.add(door.leaf)
  shell.add(door.frame)
  // A credenza under the window, a cabinet, the clock on the east wall.
  const cred = new THREE.Group()
  cred.position.set(1.0, 0, -8.7)
  furniture.add(cred)
  rbox(1.6, 0.6, 0.45, m.walnut, 0, 0.3, 0, cred, 0.006)
  for (let i = 0; i < 3; i++) rbox(0.5, 0.5, 0.01, m.walnutDark, -0.53 + i * 0.53, 0.32, 0.226, cred, 0.003)
  const clock = wallClock(m.walnutDark, std(0xf2efe6, 0.5), m.black)
  clock.group.position.set(2.48, 2.15, -6.2)
  clock.group.rotation.y = -PI / 2
  shell.add(clock.group)
  // The photo: the boss on a boat, on the west wall.
  const photo = new THREE.Group()
  photo.position.set(-2.48, 1.6, -6.5)
  photo.rotation.y = PI / 2
  shell.add(photo)
  rbox(0.62, 0.46, 0.03, m.gold, 0, 0, 0.015, photo, 0.006)
  const pic = canvasPlane(0.54, 0.38, 512, S.photo)
  pic.mesh.position.z = 0.032
  photo.add(pic.mesh)
  // A bookcase of binders on the west wall.
  const shelfG = new THREE.Group()
  shelfG.position.set(-2.3, 0, -8.1)
  shelfG.rotation.y = PI / 2
  furniture.add(shelfG)
  rbox(1.2, 2.0, 0.36, m.walnutDark, 0, 1.0, 0, shelfG, 0.006)
  const binderMats = [std(0x1f3550, 0.6), std(0x6b1f1f, 0.6), std(0x2b2b2b, 0.6)]
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 14; k++) {
      const b = binder(binderMats[(k + row) % 3])
      b.position.set(-0.5 + k * 0.07, 0.25 + row * 0.6, 0.18)
      b.rotation.y = PI / 2
      b.scale.set(1, 0.95, 0.9)
      shelfG.add(b)
    }
  // The desk: dark walnut, a modesty panel, two pedestals.
  const deskG = new THREE.Group()
  deskG.position.set(0, 0, -7.0)
  furniture.add(deskG)
  rbox(1.8, 0.045, 0.85, m.walnut, 0, 0.7275, 0, deskG, 0.008)
  for (const sx of [-1, 1]) rbox(0.42, 0.7, 0.78, m.walnutDark, sx * 0.67, 0.35, -0.01, deskG, 0.004)
  rbox(0.96, 0.45, 0.025, m.walnutDark, 0, 0.47, 0.38, deskG, 0.004)
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) rbox(0.12, 0.012, 0.012, m.brushed, sx * 0.67, 0.15 + i * 0.22, -0.405, deskG, 0.004)
  // Desk things: a leather pad, papers, a notebook, a glass of water.
  rbox(0.6, 0.004, 0.4, m.leather, 0.05, 0.752, -0.05, deskG, 0.002)
  const ps = papers(3, 9)
  ps.position.set(0.35, 0.752, 0.15)
  deskG.add(ps)
  // The monitor, turned toward the chair.
  const mon = monitor(m.plasticDark, std(0x0a0d10, 0.3), 0.55, 0.33)
  const monG = new THREE.Group()
  monG.position.set(-0.6, 0.75 + 0.33 / 2 + 0.205, -7.2)
  monG.rotation.y = 2.5
  monG.add(mon.group)
  furniture.add(monG)
  const monScreen = canvasPlane(0.55, 0.33, 512, S.bossMonitor, { emissive: true })
  monScreen.mesh.position.z = 0.002
  mon.group.add(monScreen.mesh)
  mon.screen.visible = false
  const kb = keyboard()
  kb.position.set(-0.52, 0.75, -6.95)
  kb.rotation.y = PI - 0.75
  furniture.add(kb)
  // The pen holder with six pens.
  const penHolder = new THREE.Group()
  penHolder.position.set(0.62, 0.75, -6.85)
  furniture.add(penHolder)
  const cup = cyl(0.04, 0.04, 0.1, m.black, 0, 0.05, 0, penHolder, 24)
  cup.castShadow = true
  const pens: THREE.Mesh[] = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * PI * 2
    const pen = cyl(0.0045, 0.0045, 0.145, m.pen[i], Math.cos(a) * 0.018, 0.1, Math.sin(a) * 0.018, penHolder, 8)
    pen.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18)
    pen.castShadow = true
    pens.push(pen)
  }
  // The chair, reclined; the guest chair; the plant.
  const ch = execChair(m)
  ch.group.position.set(0, 0, -7.85)
  furniture.add(ch.group)
  const guest = guestChair(m)
  guest.position.set(0.55, 0, -6.0)
  guest.rotation.y = PI + 0.35
  furniture.add(guest)
  const pl = plant(m.pot, m.leaf, 1.5, 4)
  pl.position.set(2.1, 0, -8.6)
  furniture.add(pl)
  const binCan = bin(m.plasticDark)
  binCan.position.set(0.95, 0, -7.7)
  furniture.add(binCan)
  // A glass of water on the desk.
  const water = cyl(0.03, 0.026, 0.1, m.glass, 0.78, 0.8, -7.3, furniture, 18)
  water.castShadow = false
  // The view: the morning city, far below and beyond.
  if (opts.morning) {
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(90, 34), new THREE.MeshBasicMaterial({ map: opts.morning }))
    sky.position.set(0, 4, -45)
    view.add(sky)
  }
  cityBelow(m, view, 'x', -1, 16, 32, 21)
  const ground = mesh(new THREE.PlaneGeometry(120, 80), m.ground, 0, -22, -40, view)
  ground.rotation.x = -PI / 2
  return {
    root,
    shell,
    furniture,
    view,
    door,
    chair: ch,
    guest,
    monitor: monG,
    monitorScreen: monScreen.mesh,
    penHolder,
    pens,
    photo,
    plant: pl,
    clock,
    windowPos: new THREE.Vector3(0, 1.7, -9),
  }
}

// ——— The open-plan floor ———

export type Desk = { group: THREE.Group; chair: THREE.Group; screen: ReturnType<typeof canvasPlane> }

export class Office {
  readonly group = new THREE.Group()
  readonly m = officeMaterials()
  boss!: BossOffice
  clock!: ReturnType<typeof wallClock>
  arif!: Desk
  desks: Desk[] = []
  letter!: THREE.Group
  elevators: Array<{ l: THREE.Mesh; r: THREE.Mesh; cab: THREE.Group; light: THREE.Mesh; panel: ReturnType<typeof canvasPlane> }> = []
  stairLeaf!: THREE.Group
  skyMorning!: THREE.CanvasTexture
  skyDusk!: THREE.CanvasTexture
  eastSky!: THREE.Mesh
  windows: THREE.Mesh[] = []
  panels: THREE.Mesh[] = []
  arifMonitor!: THREE.Group

  build(models: { laptop: THREE.Group | null; notepads: THREE.Group | null }) {
    const m = this.m
    const g = this.group
    const mk = (draw: (c: CanvasRenderingContext2D, W: number, H: number) => void) => {
      const c = document.createElement('canvas')
      c.width = 1024
      c.height = 384
      draw(c.getContext('2d')!, c.width, c.height)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    }
    this.skyMorning = mk(skyline('morning'))
    this.skyDusk = mk(skyline('dusk'))
    this.boss = bossOffice(m, { morning: this.skyMorning })
    g.add(this.boss.root)

    // The open plan: north wall built here so its face lines up with the boss's door wall.
    const r = room({
      w: 14,
      d: 11.85,
      h: 3.0,
      x: 0,
      z: 2.075,
      wall: m.wall,
      floor: m.carpet,
      ceiling: m.ceiling,
      trim: m.trim,
      skip: ['n'],
      openings: [
        { side: 'w', at: 2.0 - 2.075, width: 1.1, height: 2.2 },
        { side: 'w', at: 4.4 - 2.075, width: 1.1, height: 2.2 },
        { side: 'w', at: 6.8 - 2.075, width: 0.95, height: 2.1 },
        ...[-4.6, -2.3, 0, 2.3, 4.6].map((z) => ({ side: 'e' as const, at: z - 0.075, width: 1.8, height: 1.75, bottom: 0.85 })),
      ],
    })
    g.add(r)
    for (const [x0, x1] of [
      [-7, -2.5],
      [2.5, 7],
    ])
      box(x1 - x0, 3.0, 0.15, m.wall, (x0 + x1) / 2, 1.5, -3.925, g).receiveShadow = true
    box(5, 0.1, 0.15, m.wall, 0, 2.95, -3.925, g)
    rbox(14, 0.08, 0.014, m.trim, 0, 0.04, -3.843, g, 0.003)
    // The east windows: frames and glass, and the city.
    for (const z of [-4.6, -2.3, 0, 2.3, 4.6]) {
      const zz = z + 2.0
      for (const y of [0.85, 2.6]) rbox(0.08, 0.05, 1.8, m.plasticLight, 7.02, y, zz, g, 0.004)
      rbox(0.08, 1.75, 0.05, m.plasticLight, 7.02, 1.725, zz, g, 0.004)
      const pane = box(0.01, 1.75, 1.8, m.glass, 7.03, 1.725, zz, g)
      pane.castShadow = false
      this.windows.push(pane)
    }
    this.eastSky = new THREE.Mesh(new THREE.PlaneGeometry(110, 36), new THREE.MeshBasicMaterial({ map: this.skyMorning }))
    this.eastSky.position.set(48, 4, 2)
    this.eastSky.rotation.y = -PI / 2
    g.add(this.eastSky)
    cityBelow(m, g, 'z', 1, 16, 30, 33)
    const ground = mesh(new THREE.PlaneGeometry(80, 140), m.ground, 30, -22, 2, g)
    ground.rotation.x = -PI / 2
    // Ceiling panels in rows over the desks and the aisle.
    for (const x of [-3.9, -1.6, 1.6, 3.9])
      for (const z of [-2.2, 0.8, 3.4, 6.2]) {
        const p = ceilingPanel(1.2, 0.6, m.panelLight)
        p.position.set(x, 3.0, z)
        g.add(p)
      }
    for (const z of [-1.0, 2.2, 5.2]) {
      const p = ceilingPanel(0.6, 1.2, m.panelLight)
      p.position.set(0, 3.0, z)
      g.add(p)
    }
    // The clock over the boss's door.
    this.clock = wallClock(m.plasticDark, std(0xf2efe6, 0.5), m.black)
    this.clock.group.position.set(1.6, 2.4, -3.83)
    g.add(this.clock.group)

    // Desks: Arif's at the end of the aisle, eight colleagues' in two rows.
    const rand = mulberry32(5)
    const makeDesk = (x: number, z: number, seed: number, laptop: boolean): Desk => {
      const dg = new THREE.Group()
      dg.position.set(x, 0, z)
      g.add(dg)
      dg.add(desk(1.4, 0.7, m.oak, m.deskBody))
      // A low screen between rows.
      rbox(1.4, 0.36, 0.03, m.chairFab, 0, 0.92, -0.36, dg, 0.01)
      const mon = monitor(m.plasticDark, std(0x05080a, 0.3), 0.54, 0.32)
      mon.group.position.set(0.25, 0.74 + 0.16 + 0.205, -0.15)
      dg.add(mon.group)
      const screen = canvasPlane(0.54, 0.32, 512, (c, W, H) => S.spreadsheet(c, W, H, seed), { emissive: true })
      screen.mesh.position.z = 0.002
      mon.group.add(screen.mesh)
      mon.screen.visible = false
      const kb = keyboard()
      kb.position.set(0.1, 0.74, 0.12)
      dg.add(kb)
      const ms = mouse()
      ms.position.set(0.45, 0.74, 0.14)
      ms.rotation.y = PI
      dg.add(ms)
      if (laptop && models.laptop) {
        const lp = models.laptop.clone(true)
        lp.position.set(-0.4, 0.74, -0.05)
        lp.rotation.y = 0.3
        dg.add(lp)
      } else {
        const ps = papers(4, seed)
        ps.position.set(-0.4, 0.742, 0.05)
        dg.add(ps)
      }
      if (rand() < 0.6) {
        const mg = mug(std([0xe9e4d8, 0x3a5a7a, 0xb8432f][seed % 3], 0.4), std(0x2a1a10, 0.2))
        mg.position.set(-0.15, 0.74, 0.18)
        dg.add(mg)
      }
      const chair = officeChair(m.chairFab, m.plasticDark)
      chair.position.set(x, 0, z + 0.62)
      chair.rotation.y = PI
      g.add(chair)
      return { group: dg, chair, screen }
    }
    let k = 0
    for (const z of [0.6, 3.0])
      for (const x of [-3.9, -1.6, 1.6, 3.9]) {
        this.desks.push(makeDesk(x, z, 11 + k, k % 3 === 1))
        k++
      }
    this.arif = makeDesk(0, 5.6, 3, false)
    this.arifMonitor = this.arif.group.children.find((c) => c.type === 'Group' && c.position.y > 0.9) as THREE.Group
    // At the end of the aisle nobody sits across: no privacy panel, the monitor to one side, so his face shows from the door.
    for (const c of this.arif.group.children) if ((c as THREE.Mesh).isMesh && Math.abs(c.position.y - 0.92) < 0.01 && c.position.z < -0.3) c.visible = false
    this.arifMonitor.position.x = 0.44
    this.arifMonitor.rotation.y = -0.28
    // Arif's desk things: the stapler on the letter, the notepads.
    this.letter = new THREE.Group()
    this.letter.position.set(-0.35, 0.742, 5.45)
    g.add(this.letter)
    const sheet = canvasPlane(0.21, 0.297, 512, S.letter)
    sheet.mesh.rotation.x = -PI / 2
    sheet.mesh.rotation.z = 0.12
    sheet.mesh.position.y = 0.0015
    this.letter.add(sheet.mesh)
    const stapler = new THREE.Group()
    stapler.position.set(0.02, 0.002, -0.06)
    stapler.rotation.y = 0.4
    this.letter.add(stapler)
    rbox(0.04, 0.012, 0.16, m.black, 0, 0.006, 0, stapler, 0.004)
    const top = rbox(0.036, 0.025, 0.15, m.black, 0, 0.026, -0.005, stapler, 0.008)
    top.rotation.x = 0.06
    rbox(0.03, 0.004, 0.05, m.chrome, 0, 0.04, 0.05, stapler, 0.002)
    if (models.notepads) {
      const np = models.notepads.clone(true)
      // Only the yellow pad and the sticky stack, at the desk's left.
      np.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && !/yellow_pad|sticky_stack/.test(o.name)) o.visible = false
      })
      np.position.set(-0.75, 0.742, 5.6)
      np.scale.setScalar(0.8)
      g.add(np)
    }

    // The west wall: two elevators and the stairwell door.
    for (const z of [2.0, 4.4]) {
      const cab = new THREE.Group()
      cab.position.set(-7.0, 0, z)
      g.add(cab)
      const cabMat = pbr('metal', 0xb9bdc0, { roughness: 0.3 })
      box(0.05, 2.3, 1.6, cabMat, -1.6, 1.15, 0, cab)
      box(1.6, 2.3, 0.05, cabMat, -0.8, 1.15, -0.78, cab)
      box(1.6, 2.3, 0.05, cabMat, -0.8, 1.15, 0.78, cab)
      box(1.6, 0.04, 1.6, pbr('tile', 0x3a3c40), -0.8, 0.0, 0, cab)
      box(1.6, 0.04, 1.6, cabMat, -0.8, 2.3, 0, cab)
      const light = mesh(new THREE.PlaneGeometry(1.2, 1.2), m.panelLight, -0.8, 2.27, 0, cab)
      light.rotation.x = PI / 2
      const l = box(0.04, 2.2, 0.56, m.brushed, -0.02, 1.1, -0.28, cab)
      const rr = box(0.04, 2.2, 0.56, m.brushed, -0.02, 1.1, 0.28, cab)
      // Frame, call buttons, the floor indicator.
      rbox(0.04, 0.08, 1.3, m.brushed, 0.02, 2.24, 0, cab, 0.004)
      for (const sz of [-1, 1]) rbox(0.04, 2.28, 0.08, m.brushed, 0.02, 1.14, sz * 0.61, cab, 0.004)
      const btn = rbox(0.02, 0.18, 0.08, m.brushed, 0.02, 1.15, 0.85, cab, 0.004)
      btn.castShadow = false
      mesh(new THREE.CircleGeometry(0.014, 16), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), 0.035, 1.18, 0.85, cab).rotation.y = PI / 2
      const panel = canvasPlane(0.22, 0.1, 128, (c, W, H) => S.elevatorPanel(c, W, H, '7'), { emissive: true })
      panel.mesh.position.set(0.03, 2.45, 0)
      panel.mesh.rotation.y = PI / 2
      cab.add(panel.mesh)
      this.elevators.push({ l, r: rr, cab, light, panel })
    }
    // Stairwell door with its green sign.
    const sd = new THREE.Group()
    sd.position.set(-6.99, 0, 6.8)
    sd.rotation.y = PI / 2
    g.add(sd)
    for (const sx of [-1, 1]) rbox(0.06, 2.14, 0.17, m.steel, sx * 0.505, 1.07, 0, sd, 0.004)
    rbox(1.07, 0.06, 0.17, m.steel, 0, 2.13, 0, sd, 0.004)
    this.stairLeaf = new THREE.Group()
    this.stairLeaf.position.set(-0.475, 0, 0)
    sd.add(this.stairLeaf)
    rbox(0.94, 2.08, 0.05, pbr('painted', 0x7a8288, { roughness: 0.6 }), 0.47, 1.04, 0, this.stairLeaf, 0.004)
    rbox(0.6, 0.04, 0.05, m.brushed, 0.47, 1.0, 0.04, this.stairLeaf, 0.01)
    const exit = canvasPlane(0.42, 0.16, 256, S.exitSign, { emissive: true })
    exit.mesh.position.set(0, 2.38, 0.02)
    sd.add(exit.mesh)

    // The south wall behind Arif: printer, a cabinet, a whiteboard, a coat rack, a plant.
    const cab2 = new THREE.Group()
    cab2.position.set(-3.6, 0, 7.75)
    cab2.rotation.y = PI
    g.add(cab2)
    rbox(1.6, 1.0, 0.45, m.deskBody, 0, 0.5, 0, cab2, 0.006)
    const pr = printer(m.plasticLight)
    pr.position.set(-0.4, 1.0, 0)
    cab2.add(pr)
    const wb = whiteboard(1.8, 1.0, m.brushed, std(0xf4f4f2, 0.3))
    wb.group.position.set(2.6, 1.55, 7.98)
    wb.group.rotation.y = PI
    g.add(wb.group)
    const pl1 = plant(m.pot, m.leaf, 1.6, 9)
    pl1.position.set(6.3, 0, 7.4)
    g.add(pl1)
    const pl2 = plant(m.pot, m.leaf, 1.3, 12)
    pl2.position.set(-6.4, 0, -3.2)
    g.add(pl2)
    // A coat rack by the elevators.
    const rack = new THREE.Group()
    rack.position.set(-6.5, 0, 0.4)
    g.add(rack)
    cyl(0.018, 0.018, 1.8, m.walnutDark, 0, 0.9, 0, rack, 10)
    cyl(0.2, 0.22, 0.03, m.walnutDark, 0, 0.015, 0, rack, 20)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2
      tube(
        [
          [0, 1.72, 0],
          [Math.cos(a) * 0.12, 1.78, Math.sin(a) * 0.12],
          [Math.cos(a) * 0.16, 1.86, Math.sin(a) * 0.16],
        ],
        0.01,
        m.walnutDark,
        rack,
        6,
      )
    }
  }

  /** Morning or dusk outside the windows. */
  setTime(time: 'morning' | 'dusk') {
    ;(this.eastSky.material as THREE.MeshBasicMaterial).map = time === 'morning' ? this.skyMorning : this.skyDusk
  }
}
