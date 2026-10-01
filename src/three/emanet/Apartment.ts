/**
 * The apartment in EMANET: one open room — kitchen, table, living area,
 * entry — with a wall of windows onto a balcony and the city. Ordinary on
 * purpose. Every piece is adopted into a memory group so it can be
 * remembered sharply, vaguely, or not at all.
 *
 * Coordinates: floor y = 0, x ∈ [−4.5, 4.5], z ∈ [−3.2, 3.2]. Kitchen along
 * z = −3.2, front door and console along z = +3.2, windows on x = +4.5.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { shoeGeometry } from '../figure/figureBody'
import { shelf, sofa, table as tableProp } from '../kit/props'
import type { EmanetMaterials } from './materials'
import type { Memory } from './memory'

export const APT = {
  x0: -4.5,
  x1: 4.5,
  z0: -3.2,
  z1: 3.2,
  H: 2.75,
  table: new THREE.Vector3(-1.9, 0.75, -0.9),
  derinSeat: { x: -1.9, z: -0.2 },
  egeSeat: { x: -1.9, z: -1.62 },
  cupSpot: new THREE.Vector3(-2.08, 0.754, -0.62),
  counterCup: new THREE.Vector3(-2.3, 0.9, -2.8),
  docSpot: new THREE.Vector3(-1.55, 0.754, -0.86),
  photoTable: new THREE.Vector3(-1.4, 0.754, -0.58),
  device: new THREE.Vector3(-1.42, 0.82, 3.0),
  bowl: new THREE.Vector3(-2.12, 0.82, 3.0),
  clock: new THREE.Vector3(-2.1, 2.42, -3.13),
  handle: new THREE.Vector3(-3.0, 1.0, 3.12),
  // The details around 14:18.
  phone: new THREE.Vector3(-1.45, 0.756, -1.22),
  shoes: new THREE.Vector3(-3.45, 0, 2.86),
  pills: new THREE.Vector3(-1.45, 0.9, -2.78),
  glasses: new THREE.Vector3(-2.82, 0.9, -2.76),
}

export class Apartment {
  readonly group = new THREE.Group()
  readonly lights = new THREE.Group()
  readonly sun: THREE.DirectionalLight
  readonly hemi: THREE.HemisphereLight
  readonly pendant: THREE.PointLight
  readonly windowFill: THREE.DirectionalLight
  readonly curtainL = new THREE.Group()
  readonly curtainR = new THREE.Group()
  readonly drawer = new THREE.Group()
  readonly handle = new THREE.Group()
  readonly windowHandle = new THREE.Group()
  readonly cup = new THREE.Group()
  readonly steam: THREE.Mesh
  readonly steamMaterial: THREE.MeshBasicMaterial
  readonly keys = new THREE.Group()
  readonly phone = new THREE.Group()
  readonly phoneScreen: THREE.MeshBasicMaterial
  readonly derinPhone = new THREE.Group()
  readonly capsule = new THREE.Group()
  readonly photo = new THREE.Group()
  readonly photoMaterial: THREE.MeshStandardMaterial
  readonly doc: THREE.Mesh
  readonly docMaterial: THREE.MeshStandardMaterial
  readonly clockMaterial: THREE.MeshBasicMaterial
  readonly deviceLight: THREE.MeshBasicMaterial
  readonly skyMaterial: THREE.MeshBasicMaterial
  readonly cityWindows: THREE.MeshStandardMaterial
  readonly outsideGlow: THREE.MeshBasicMaterial

  constructor(m: EmanetMaterials, memory: Memory, shadowsOn: boolean) {
    const g = this.group
    const { x0, x1, z0, z1, H } = APT
    const part = (name: string) => {
      const p = new THREE.Group()
      p.name = name
      g.add(p)
      return p
    }

    // ——— Shell ———
    const shell = part('shell')
    const floor = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m.floor, 0, 0, 0, shell)
    floor.rotation.x = -Math.PI / 2
    const ceil = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m.ceiling, 0, H, 0, shell)
    ceil.rotation.x = Math.PI / 2
    const T = 0.12
    // Back wall with the kitchen window (x −2.6…−1.6, y 1.35…2.15)
    box(-2.6 - x0, H, T, m.plaster, (x0 - 2.6) / 2, H / 2, z0 - T / 2, shell)
    box(x1 + 1.6, H, T, m.plaster, (x1 - 1.6) / 2, H / 2, z0 - T / 2, shell)
    box(1.0, 1.35, T, m.plaster, -2.1, 0.675, z0 - T / 2, shell)
    box(1.0, H - 2.15, T, m.plaster, -2.1, (H + 2.15) / 2, z0 - T / 2, shell)
    // Front wall with the front door (x −3.8…−2.85, y 0…2.1)
    box(0.7, H, T, m.plaster, -4.15, H / 2, z1 + T / 2, shell)
    box(x1 + 2.85, H, T, m.plaster, (x1 - 2.85) / 2, H / 2, z1 + T / 2, shell)
    box(0.95, H - 2.1, T, m.plaster, -3.325, (H + 2.1) / 2, z1 + T / 2, shell)
    // Left wall with the bedroom door (z 0.55…1.45, y 0…2.05)
    box(T, H, 0.55 - z0, m.plaster, x0 - T / 2, H / 2, (z0 + 0.55) / 2, shell)
    box(T, H, z1 - 1.45, m.plaster, x0 - T / 2, H / 2, (z1 + 1.45) / 2, shell)
    box(T, H - 2.05, 0.9, m.plaster, x0 - T / 2, (H + 2.05) / 2, 1.0, shell)
    // Right wall around the glazing (z −2.4…1.6, y 0…2.5)
    box(T, H, -2.4 - z0, m.plaster, x1 + T / 2, H / 2, (z0 - 2.4) / 2, shell)
    box(T, H, z1 - 1.6, m.plaster, x1 + T / 2, H / 2, (z1 + 1.6) / 2, shell)
    box(T, H - 2.5, 4.0, m.plaster, x1 + T / 2, (H + 2.5) / 2, -0.4, shell)
    // Baseboards
    for (const [x, z, w, d] of [
      [0, z0 + 0.01, x1 - x0, 0.02],
      [0.8, z1 - 0.01, 6.6, 0.02],
      [x0 + 0.01, -1.3, 0.02, 3.8],
      [x0 + 0.01, 2.3, 0.02, 1.7],
    ])
      box(w, 0.08, d, m.trim, x, 0.04, z, shell)
    memory.group('shell').adopt(shell)

    // ——— Kitchen ———
    const kitchen = part('kitchen')
    box(0.66, 1.86, 0.66, m.enamel, -4.13, 0.93, -2.86, kitchen)
    box(0.03, 0.5, 0.03, m.metal, -3.83, 1.35, -2.5, kitchen)
    const kx = (-3.78 + -0.8) / 2
    const kw = 2.98
    box(kw, 0.84, 0.6, m.cabinet, kx, 0.44, -2.9, kitchen)
    box(kw + 0.04, 0.04, 0.64, m.counter, kx, 0.88, -2.88, kitchen)
    box(kw, 0.06, 0.56, m.darkWood, kx, 0.03, -2.92, kitchen)
    for (let i = 0; i < 5; i++) box(0.012, 0.8, 0.005, m.darkWood, -3.78 + 0.6 * (i + 0.5) + 0.3, 0.46, -2.6, kitchen)
    for (let i = 0; i < 5; i++) box(0.12, 0.012, 0.02, m.metal, -3.78 + 0.6 * i + 0.3, 0.76, -2.59, kitchen)
    box(0.52, 0.012, 0.4, m.metal, -2.1, 0.9, -2.88, kitchen)
    box(1.1, 0.64, 0.34, m.cabinet, -3.2, 1.88, -3.03, kitchen)
    box(0.78, 0.64, 0.34, m.cabinet, -1.15, 1.88, -3.03, kitchen)
    // The window above the sink, with soft daylight behind it
    for (const [x, y, w, h] of [
      [-2.1, 1.35, 1.04, 0.05],
      [-2.1, 2.15, 1.04, 0.05],
      [-2.6, 1.75, 0.05, 0.84],
      [-1.6, 1.75, 0.05, 0.84],
      [-2.1, 1.75, 0.03, 0.8],
    ])
      box(w, h, 0.08, m.trim, x, y, z0 - 0.02, kitchen)
    this.outsideGlow = own(new THREE.MeshBasicMaterial({ color: 0xffffff }))
    const outside = mesh(new THREE.PlaneGeometry(1.0, 0.8), this.outsideGlow, -2.1, 1.75, z0 - 0.25, kitchen)
    outside.rotation.y = 0
    // Kettle and a spare mug
    const kettle = new THREE.Group()
    kettle.position.set(-3.1, 0.9, -2.82)
    mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.09, 0],
          [0.1, 0.06],
          [0.085, 0.17],
          [0.04, 0.2],
          [0.0, 0.205],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        28,
      ),
      m.enamel,
      0,
      0,
      0,
      kettle,
    )
    const spout = cyl(0.012, 0.025, 0.12, m.enamel, 0.1, 0.11, 0, kettle, 12)
    spout.rotation.z = -0.9
    const kh = mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 18, Math.PI), m.darkWood, -0.02, 0.2, 0, kettle)
    kh.rotation.y = Math.PI / 2
    kitchen.add(kettle)
    this.mug(m.ceramic, m.coffee, kitchen, -3.5, 0.9, -2.75)
    // Two tea glasses on a small tray by the kettle: one upright, one turned over, waiting.
    const tray = new THREE.Group()
    tray.position.copy(APT.glasses)
    cyl(0.11, 0.11, 0.008, m.metal, 0, 0.004, 0, tray, 28)
    const tulip = [
      [0.0, 0.0],
      [0.022, 0.0],
      [0.026, 0.01],
      [0.02, 0.045],
      [0.024, 0.075],
      [0.03, 0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    mesh(new THREE.LatheGeometry(tulip, 24), m.teaGlass, -0.045, 0.008, 0.01, tray)
    const over = mesh(new THREE.LatheGeometry(tulip, 24), m.teaGlass, 0.045, 0.108, -0.01, tray)
    over.rotation.x = Math.PI
    for (const x of [-0.045, 0.045]) cyl(0.04, 0.035, 0.006, m.ceramic, x, 0.011, 0, tray, 20)
    kitchen.add(tray)
    // The weekly pill box on the counter: seven lids, one compartment still full.
    const pills = new THREE.Group()
    pills.position.copy(APT.pills)
    pills.rotation.y = 0.15
    box(0.235, 0.022, 0.06, m.enamel, 0, 0.011, 0, pills)
    for (let i = 0; i < 7; i++) {
      const lid = box(0.03, 0.005, 0.056, m.pillLid, -0.0975 + i * 0.0325, 0.0245, 0, pills)
      lid.castShadow = false
      if (i === 3)
        for (const [px, pz, mat] of [
          [-0.006, -0.01, m.pill],
          [0.006, 0.006, m.pillB],
          [-0.004, 0.014, m.pill],
        ] as const) {
          const pill = mesh(new THREE.CapsuleGeometry(0.0035, 0.009, 4, 8), mat, -0.0975 + i * 0.0325 + px, 0.018, pz, pills)
          pill.rotation.set(Math.PI / 2, 0, px * 40)
        }
    }
    kitchen.add(pills)
    memory.group('kitchen').adopt(kitchen)

    // The clock: digital, on the kitchen wall
    const clock = part('clock')
    box(0.36, 0.15, 0.03, m.darkWood, APT.clock.x, APT.clock.y, APT.clock.z, clock)
    this.clockMaterial = own(new THREE.MeshBasicMaterial({ color: 0xffffff }))
    mesh(new THREE.PlaneGeometry(0.32, 0.12), this.clockMaterial, APT.clock.x, APT.clock.y, APT.clock.z + 0.016, clock)
    memory.group('clock').adopt(clock)

    // ——— Table ———
    const table = part('table')
    const dining = tableProp(1.4, 0.86, 0.752, m.oak)
    dining.position.set(APT.table.x, 0, APT.table.z)
    table.add(dining)
    this.chair(m, table, APT.derinSeat.x, APT.derinSeat.z, 1)
    const egeChair = part('chair')
    this.chair(m, egeChair, APT.egeSeat.x, APT.egeSeat.z, -1)
    memory.adopt('chair', egeChair)
    const vase = mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.045, 0],
          [0.05, 0.05],
          [0.03, 0.14],
          [0.022, 0.18],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        20,
      ),
      m.ceramic,
      -2.35,
      0.753,
      -1.05,
      table,
    )
    vase.castShadow = true
    for (let i = 0; i < 3; i++) {
      const stem = cyl(0.002, 0.002, 0.26, m.leaf, -2.35 + (i - 1) * 0.02, 0.98, -1.05, table, 4)
      stem.rotation.z = (i - 1) * 0.25
    }
    // The ring a cup leaves when it is always put in the same place.
    const ring = mesh(new THREE.RingGeometry(0.03, 0.037, 28), new THREE.MeshBasicMaterial({ color: 0x5a3e2a, transparent: true, opacity: 0.35 }), APT.cupSpot.x, 0.7535, APT.cupSpot.z, table)
    ring.rotation.x = -Math.PI / 2
    // Pendant lamp above the table
    cyl(0.004, 0.004, 0.75, m.darkWood, APT.table.x, H - 0.375, APT.table.z, table, 6)
    cyl(0.05, 0.22, 0.2, m.lampShade, APT.table.x, H - 0.85, APT.table.z, table, 28).material = m.lampShade
    memory.group('table').adopt(table)

    // ——— Derin's mug (it moves) ———
    this.steamMaterial = own(new THREE.MeshBasicMaterial({ color: 0xffffff, map: steamTexture(), transparent: true, opacity: 0, depthWrite: false }))
    this.steam = mesh(new THREE.PlaneGeometry(0.07, 0.2), this.steamMaterial, 0, 0.2, 0)
    this.steam.userData.noMask = true
    this.mug(m.mug, m.coffee, this.cup, 0, 0, 0).add(this.steam)
    g.add(this.cup)
    memory.group('cup').adopt(this.cup)

    // ——— The record lying on the table ———
    this.docMaterial = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }))
    const docGroup = part('doc')
    this.doc = mesh(new THREE.PlaneGeometry(0.21, 0.15), this.docMaterial, APT.docSpot.x, APT.docSpot.y, APT.docSpot.z, docGroup)
    // Readable from Ege's side of the table.
    this.doc.rotation.set(-Math.PI / 2, 0, Math.PI + 0.18)
    memory.group('doc').adopt(docGroup)

    // ——— The photograph (in the console drawer, then in Derin's hands, then on the table) ———
    this.photoMaterial = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }))
    box(0.2, 0.15, 0.012, m.darkWood, 0, 0, -0.004, this.photo)
    mesh(new THREE.PlaneGeometry(0.17, 0.12), this.photoMaterial, 0, 0, 0.0025, this.photo)
    g.add(this.photo)
    memory.group('photo').adopt(this.photo)

    // ——— Living area ———
    const living = part('living')
    const rug = mesh(new THREE.PlaneGeometry(2.6, 1.8), m.rug, 2.0, 0.006, 0.9, living)
    rug.rotation.x = -Math.PI / 2
    // The sofa against the front wall, facing the room; the low table; the bookshelf.
    const couch = sofa(2.1, m.sofa, m.cushion)
    couch.position.set(2.0, 0, 2.66)
    couch.rotation.y = Math.PI
    living.add(couch)
    const low = tableProp(1.0, 0.55, 0.42, m.oak)
    low.position.set(2.0, 0, 1.45)
    living.add(low)
    box(0.24, 0.035, 0.17, m.bookB, 1.8, 0.44, 1.4, living).rotation.y = 0.2
    const books = shelf(0.9, 2.0, 0.3, m.oak, [m.book, m.bookB, m.bookC], 37)
    books.position.set(3.85, 0, 3.0)
    books.rotation.y = Math.PI
    living.add(books)
    // Floor lamp
    cyl(0.14, 0.16, 0.03, m.darkWood, 3.25, 0.015, 2.65, living)
    cyl(0.01, 0.01, 1.5, m.darkWood, 3.25, 0.78, 2.65, living, 8)
    cyl(0.12, 0.16, 0.24, m.lampShade, 3.25, 1.58, 2.65, living).material = m.lampShade
    // A plant by the windows
    this.plant(m, living, 3.95, 2.05, 1.2)
    // A print on the left wall
    const printMat = new THREE.MeshBasicMaterial({ map: printTexture() })
    box(0.62, 0.82, 0.03, m.darkWood, x0 + 0.02, 1.55, -1.4, living)
    const print = mesh(new THREE.PlaneGeometry(0.54, 0.74), printMat, x0 + 0.04, 1.55, -1.4, living)
    print.rotation.y = Math.PI / 2
    // A tear-off calendar by the kitchen, stopped on a Sunday three years ago.
    box(0.2, 0.27, 0.02, m.darkWood, x0 + 0.012, 1.55, -2.22, living)
    const calendarMat = new THREE.MeshStandardMaterial({ map: calendarTexture(), roughness: 0.9 })
    const calendar = mesh(new THREE.PlaneGeometry(0.17, 0.2), calendarMat, x0 + 0.024, 1.53, -2.22, living)
    calendar.rotation.y = Math.PI / 2
    memory.group('living').adopt(living)

    // ——— Windows and curtains ———
    const win = part('window')
    for (const z of [-2.4, -1.4, -0.6, 0.4, 1.6]) box(0.1, 2.5, 0.07, m.trim, x1 - 0.02, 1.25, z, win)
    box(0.1, 0.06, 4.0, m.trim, x1 - 0.02, 2.12, -0.4, win)
    box(0.18, 0.05, 4.0, m.trim, x1 + 0.02, 0.02, -0.4, win)
    for (const [za, zb] of [
      [-2.4, -1.4],
      [-1.4, -0.6],
      [-0.6, 0.4],
      [0.4, 1.6],
    ]) {
      const pane = mesh(new THREE.PlaneGeometry(zb - za, 2.45), m.glass, x1, 1.25, (za + zb) / 2, win)
      pane.rotation.y = -Math.PI / 2
      pane.userData.noMask = true
    }
    // The balcony door's lever: closed every afternoon.
    this.windowHandle.position.set(x1 - 0.07, 1.0, 0.32)
    box(0.024, 0.024, 0.13, m.metal, 0, 0, -0.05, this.windowHandle)
    win.add(this.windowHandle)
    cyl(0.012, 0.012, 4.4, m.metal, x1 - 0.18, 2.6, -0.4, win, 8).rotation.x = Math.PI / 2
    for (const [grp, zc, w] of [
      [this.curtainL, -1.45, 2.1],
      [this.curtainR, 0.65, 2.1],
    ] as const) {
      const geo = new THREE.PlaneGeometry(w, 2.5, 60, 1)
      const pos = geo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 26) * 0.035)
      geo.computeVertexNormals()
      const c = mesh(geo, m.curtain, 0, 0, 0, grp)
      c.rotation.y = -Math.PI / 2
      grp.position.set(x1 - 0.2, 1.33, zc)
      grp.userData.home = zc
      grp.userData.width = w
      win.add(grp)
    }
    memory.group('window').adopt(win)

    // ——— Balcony and the city ———
    const balcony = part('balcony')
    box(1.9, 0.12, 4.4, m.concrete, x1 + 0.95, -0.06, -0.4, balcony)
    box(0.05, 0.05, 4.4, m.metal, x1 + 1.82, 1.05, -0.4, balcony)
    for (let z = -2.55; z <= 1.75; z += 0.12) box(0.02, 1.0, 0.02, m.metal, x1 + 1.82, 0.5, z, balcony)
    this.plant(m, balcony, x1 + 1.45, -2.2, 0.8)
    this.plant(m, balcony, x1 + 1.5, 1.4, 0.7)
    memory.group('balcony').adopt(balcony)

    const city = part('city')
    this.skyMaterial = own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }))
    const skyGeo = new THREE.SphereGeometry(120, 32, 16)
    const sp = skyGeo.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(sp.count * 3)
    const top = new THREE.Color(0x8fa9c4)
    const hor = new THREE.Color(0xf1dcc0)
    const tmp = new THREE.Color()
    for (let i = 0; i < sp.count; i++) {
      tmp.copy(hor).lerp(top, Math.pow(Math.max(0, sp.getY(i) / 120), 0.6))
      colors.set([tmp.r, tmp.g, tmp.b], i * 3)
    }
    skyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    mesh(skyGeo, this.skyMaterial, 0, 0, 0, city)
    this.cityWindows = own(new THREE.MeshStandardMaterial({ map: facadeTexture(), emissiveMap: facadeTexture(true), emissive: new THREE.Color(0xffd29a), emissiveIntensity: 0.1, roughness: 0.9 }))
    const cr = mulberry32(5)
    for (let i = 0; i < 9; i++) {
      const w = 6 + cr() * 8
      const h = 10 + cr() * 22
      const z = -26 + i * 6.5 + cr() * 2
      const x = 24 + cr() * 14
      const b = box(4 + cr() * 4, h, w, this.cityWindows, x, h / 2 - 6, z, city)
      b.castShadow = false
    }
    memory.group('city').adopt(city)

    // ——— Entry: front door, coats, console with the drawer, the bowl, the reader ———
    const entry = part('entry')
    box(0.93, 2.08, 0.05, m.trim, -3.325, 1.04, z1 - 0.03, entry)
    for (const x of [-3.8, -2.85]) box(0.05, 2.12, 0.08, m.trim, x, 1.06, z1 - 0.03, entry)
    box(1.0, 0.05, 0.08, m.trim, -3.325, 2.12, z1 - 0.03, entry)
    this.handle.position.copy(APT.handle)
    box(0.13, 0.022, 0.022, m.metal, -0.05, 0, 0, this.handle)
    cyl(0.018, 0.018, 0.04, m.metal, 0, 0, 0.02, this.handle, 10).rotation.x = Math.PI / 2
    entry.add(this.handle)
    // Coats on hooks
    for (const [x, c] of [
      [-4.25, m.denim],
      [-4.05, m.cushion],
    ] as const) {
      const coat = mesh(new THREE.CapsuleGeometry(0.14, 0.62, 4, 10), c, x, 1.32, z1 - 0.12, entry)
      coat.scale.set(1, 1, 0.45)
    }
    // Console
    const cz = 3.0
    box(1.1, 0.04, 0.36, m.walnut, -1.8, 0.8, cz, entry)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.035, 0.78, 0.035, m.walnut, -1.8 + sx * 0.5, 0.39, cz + sz * 0.14, entry)
    box(0.08, 0.14, 0.32, m.walnut, -2.35 + 0.04, 0.71, cz, entry)
    this.drawer.position.set(-1.92, 0.71, cz)
    box(0.7, 0.13, 0.32, m.walnut, 0, 0, 0, this.drawer)
    box(0.08, 0.016, 0.016, m.brass, 0, 0, -0.17, this.drawer)
    entry.add(this.drawer)
    mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.05, 0],
          [0.09, 0.03],
          [0.1, 0.05],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        24,
      ),
      m.ceramic,
      APT.bowl.x,
      APT.bowl.y,
      APT.bowl.z,
      entry,
    ).material = m.ceramic
    // One pair of shoes by the door. His.
    for (const sx of [-1, 1]) {
      const shoe = new THREE.Group()
      shoe.position.set(APT.shoes.x + sx * 0.075, 0, APT.shoes.z)
      shoe.rotation.y = Math.PI + sx * 0.08
      entry.add(shoe)
      mesh(shoeGeometry(), m.leather, 0, 0.069, 0, shoe).scale.set(1.05, 1.1, 1.05)
      // Sole and heel, a little proud of the upper.
      const outline = new THREE.Shape()
      for (let i = 0; i <= 32; i++) {
        const a = (i / 32) * Math.PI * 2
        const z = Math.sin(a) * 0.145 + 0.05
        const w = 0.05 * (1 + 0.12 * Math.exp(-((Math.sin(a) - 0.35) ** 2) / 0.1))
        if (i === 0) outline.moveTo(Math.cos(a) * w, z)
        else outline.lineTo(Math.cos(a) * w, z)
      }
      const sole = mesh(new THREE.ExtrudeGeometry(outline, { depth: 0.014, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 }), m.sole, 0, 0.017, 0, shoe)
      sole.rotation.x = Math.PI / 2
      box(0.07, 0.022, 0.06, m.sole, 0, 0.011, -0.055, shoe)
      // The opening at the back, and the laces.
      const collar = mesh(new THREE.CircleGeometry(0.034, 20), m.sole, 0, 0.1, -0.035, shoe)
      collar.rotation.x = -Math.PI / 2 + 0.25
      collar.scale.set(1, 1.35, 1)
      for (let k = 0; k < 4; k++) box(0.04 - k * 0.004, 0.003, 0.006, m.trim, 0, 0.094 - k * 0.006, 0.0 + k * 0.022, shoe).rotation.x = -0.35
    }
    // Bedroom door (closed)
    box(0.05, 2.03, 0.88, m.trim, x0 + 0.03, 1.02, 1.0, entry)
    box(0.03, 0.022, 0.12, m.metal, x0 + 0.07, 1.0, 0.68, entry)
    memory.group('entry').adopt(entry)

    // Keys
    box(0.05, 0.004, 0.018, m.brass, 0, 0, 0, this.keys)
    box(0.045, 0.004, 0.016, m.metal, 0.012, 0.004, 0.02, this.keys).rotation.y = 0.6
    mesh(new THREE.TorusGeometry(0.014, 0.002, 6, 16), m.metal, -0.03, 0, 0, this.keys).rotation.x = Math.PI / 2
    g.add(this.keys)
    memory.group('keys').adopt(this.keys)

    // Ege's phone: on the table, then at his ear. Derin's, only once.
    this.phoneScreen = own(new THREE.MeshBasicMaterial({ color: 0x5a5a5a, map: null }))
    for (const [grp, lit] of [
      [this.phone, true],
      [this.derinPhone, false],
    ] as const) {
      box(0.072, 0.008, 0.15, m.phoneBody, 0, 0.004, 0, grp)
      if (lit) mesh(new THREE.PlaneGeometry(0.066, 0.142), this.phoneScreen, 0, 0.0084, 0, grp).rotation.x = -Math.PI / 2
      g.add(grp)
    }
    this.phone.rotation.y = 0.3
    memory.group('table').adopt(this.phone)
    memory.group('keys').adopt(this.derinPhone)

    // ——— The reader: where the record is loaded ———
    const device = part('device')
    box(0.2, 0.07, 0.15, m.walnut, APT.device.x, APT.device.y + 0.035, APT.device.z, device)
    box(0.07, 0.004, 0.022, m.brass, APT.device.x, APT.device.y + 0.072, APT.device.z, device)
    this.deviceLight = own(new THREE.MeshBasicMaterial({ color: 0x000000 }))
    mesh(new THREE.SphereGeometry(0.006, 10, 8), this.deviceLight, APT.device.x + 0.07, APT.device.y + 0.072, APT.device.z - 0.055, device)
    cyl(0.017, 0.017, 0.07, m.capsule, 0, 0, 0, this.capsule, 16)
    cyl(0.018, 0.018, 0.012, m.brass, 0, 0.035, 0, this.capsule, 16)
    g.add(this.capsule)
    memory.group('device').adopt(device)
    memory.group('device').adopt(this.capsule)

    // ——— Light ———
    this.hemi = new THREE.HemisphereLight(0xdfe7ef, 0x8a6f58, 0.6)
    this.sun = new THREE.DirectionalLight(0xffe2bc, 2)
    this.sun.position.set(14, 9, -3)
    this.sun.target.position.set(0, 0, 0)
    this.sun.castShadow = shadowsOn
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.camera.left = -6
    this.sun.shadow.camera.right = 6
    this.sun.shadow.camera.top = 6
    this.sun.shadow.camera.bottom = -6
    this.sun.shadow.camera.near = 1
    this.sun.shadow.camera.far = 40
    this.sun.shadow.bias = -0.0005
    this.sun.shadow.normalBias = 0.03
    this.pendant = new THREE.PointLight(0xffc98f, 0, 5, 2)
    this.pendant.position.set(APT.table.x, H - 0.95, APT.table.z)
    // Daylight bounced in from the windows: soft, directional, no hot spots on whoever stands near them.
    this.windowFill = new THREE.DirectionalLight(0xfff1e0, 1)
    this.windowFill.position.set(9, 3.2, 0.6)
    this.windowFill.target.position.set(0, 0.8, -0.2)
    this.lights.add(this.hemi, this.sun, this.sun.target, this.pendant, this.windowFill, this.windowFill.target)

    g.traverse((o) => {
      const mo = o as THREE.Mesh
      if (!mo.isMesh) return
      mo.receiveShadow = true
      if (mo.material !== m.glass && mo.material !== m.curtain) mo.castShadow = true
    })
    // The window glass and curtains must not block the sun.
    win.traverse((o) => {
      const mo = o as THREE.Mesh
      if (mo.isMesh && (mo.geometry as THREE.BufferGeometry).type === 'PlaneGeometry') mo.castShadow = false
    })
  }

  private mug(body: THREE.Material, coffee: THREE.Material, parent: THREE.Object3D, x: number, y: number, z: number) {
    const cup = new THREE.Group()
    cup.position.set(x, y, z)
    mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.036, 0],
          [0.04, 0.01],
          [0.041, 0.095],
          [0.037, 0.097],
          [0.036, 0.012],
        ].map(([a, b]) => new THREE.Vector2(a, b)),
        28,
      ),
      body,
      0,
      0,
      0,
      cup,
    )
    const handle = mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 16, Math.PI * 1.2), body, 0.042, 0.05, 0, cup)
    handle.rotation.z = -Math.PI * 0.6
    const surface = mesh(new THREE.CircleGeometry(0.036, 24), coffee, 0, 0.082, 0, cup)
    surface.rotation.x = -Math.PI / 2
    parent.add(cup)
    return cup
  }

  private chair(m: EmanetMaterials, parent: THREE.Object3D, x: number, z: number, facing: 1 | -1) {
    const c = new THREE.Group()
    c.position.set(x, 0, z)
    box(0.44, 0.04, 0.42, m.oak, 0, 0.45, 0, c)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.018, 0.016, 0.45, m.oak, sx * 0.19, 0.225, sz * 0.18, c, 8)
    for (const sx of [-1, 1]) box(0.03, 0.48, 0.03, m.oak, sx * 0.19, 0.7, facing * 0.19, c)
    box(0.4, 0.08, 0.025, m.oak, 0, 0.88, facing * 0.19, c)
    box(0.4, 0.05, 0.02, m.oak, 0, 0.66, facing * 0.19, c)
    parent.add(c)
  }

  private plant(m: EmanetMaterials, parent: THREE.Object3D, x: number, z: number, size: number) {
    const p = new THREE.Group()
    p.position.set(x, 0, z)
    cyl(0.16 * size, 0.12 * size, 0.32 * size, m.pot, 0, 0.16 * size, 0, p, 18)
    const rand = mulberry32(Math.round(x * 100 + z * 10))
    for (let i = 0; i < 9; i++) {
      const leaf = mesh(new THREE.SphereGeometry(0.11 * size, 10, 8), m.leaf, 0, 0, 0, p)
      leaf.scale.set(0.35, 1.0, 0.12)
      const a = rand() * Math.PI * 2
      const r = 0.06 + rand() * 0.1
      leaf.position.set(Math.cos(a) * r * size, (0.42 + rand() * 0.35) * size, Math.sin(a) * r * size)
      leaf.rotation.set((rand() - 0.5) * 1.2, a, (rand() - 0.5) * 0.9)
    }
    parent.add(p)
  }

  /** Curtain openness 0 (closed) … 1 (gathered at the sides). */
  setCurtains(open: number) {
    const e = open * open * (3 - 2 * open)
    for (const [c, dir] of [
      [this.curtainL, -1],
      [this.curtainR, 1],
    ] as const) {
      const w = c.userData.width as number
      const s = 1 - 0.74 * e
      c.scale.set(1, 1, 1)
      c.children[0].scale.set(s, 1, 1)
      c.position.z = (c.userData.home as number) + dir * (w * (1 - s)) * 0.5
    }
  }

  dispose() {
    ;(this.skyMaterial.map as THREE.Texture | null)?.dispose()
  }
}

/** Marks a material as belonging to a single memory group (patched in place, never copied). */
function own<M extends THREE.Material>(m: M) {
  m.userData.own = true
  return m
}

function steamTexture() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 160
  const ctx = c.getContext('2d')!
  for (let i = 0; i < 26; i++) {
    const y = 150 - i * 5.6
    const x = 32 + Math.sin(i * 0.5) * (4 + i * 0.5)
    const g = ctx.createRadialGradient(x, y, 0, x, y, 10 + i * 0.4)
    g.addColorStop(0, `rgba(255,255,255,${0.11 * (1 - i / 26)})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 160)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** One page of a tear-off calendar: Sunday, 16 April 2023. */
function calendarTexture() {
  const c = document.createElement('canvas')
  c.width = 220
  c.height = 260
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f2ece0'
  ctx.fillRect(0, 0, 220, 260)
  ctx.fillStyle = '#b8402f'
  ctx.fillRect(0, 0, 220, 46)
  ctx.fillStyle = '#f8f1e6'
  ctx.textAlign = 'center'
  ctx.font = '600 22px sans-serif'
  ctx.fillText('NİSAN 2023', 110, 31)
  ctx.fillStyle = '#b8402f'
  ctx.font = '700 120px Georgia, serif'
  ctx.fillText('16', 110, 178)
  ctx.font = '600 24px sans-serif'
  ctx.fillText('PAZAR', 110, 222)
  ctx.fillStyle = '#9a9187'
  ctx.font = '400 13px sans-serif'
  ctx.fillText('Hicri 1444 · Ramazan 25', 110, 246)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function printTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 352
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#efe6d6'
  ctx.fillRect(0, 0, 256, 352)
  ctx.fillStyle = '#c9a27c'
  ctx.beginPath()
  ctx.arc(150, 140, 70, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7c8fa3'
  ctx.fillRect(40, 210, 176, 90)
  ctx.fillStyle = '#3d3a36'
  ctx.fillRect(40, 300, 176, 6)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function facadeTexture(glow = false) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = glow ? '#000' : '#c8bdae'
  ctx.fillRect(0, 0, 256, 256)
  const rand = mulberry32(glow ? 12 : 11)
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 6; x++) {
      const lit = rand() > 0.6
      ctx.fillStyle = glow ? (lit ? '#fff' : '#000') : '#8f8a84'
      ctx.fillRect(12 + x * 41, 10 + y * 31, 22, 18)
    }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 3)
  return t
}
