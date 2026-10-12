/**
 * B. Levy's suburb (x ≈ 100) and C. the bus interior (x ≈ 170, z ≈ −60).
 *
 * Levy's house: x 96…106, z −6…+4, floor 0.3, with a bedroom (NE… the east
 * window), bathroom, kitchen, living room, entry hall and veranda. The street
 * runs along x: his lawn z 6…9, picket fence z 9, sidewalk z 9…10.5, road
 * z 10.5…16.5, sidewalk z 16.5…18, Bayan Elen's fence z 18; her house
 * x 95…103, z 23.5…31. Identical pastel houses repeat along both sides; a bus
 * stop with its PSA panel at x 140. Everything soft-edged; the light never
 * moves.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { canvasPlane, chair, counter, door, plant, rbox, tube } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { bicycle, bird, dog, houseGeometries, mailboxGeometry, picketFence, picketFenceZ, rockingChairGeometry, roundTrees, wall, windowIn } from './parts'
import { drawStreetStrip } from './screens'

export const FLOOR = 0.3
const PI = Math.PI

/** House centres along the street (x). */
export const NORTH_LOTS = [69, 83, 117, 131, 145, 159]
export const SOUTH_LOTS = [71, 85, 113, 127, 141, 155, 169]

export type SuburbModels = { lamp: THREE.Group | null; hydrant: THREE.Group | null; can: THREE.Group | null; sofa: THREE.Group | null; planter: THREE.Group | null }

export class Suburb {
  readonly group = new THREE.Group()
  readonly bus = new THREE.Group()
  /** The bus interior (C). */
  readonly busInside = new THREE.Group()
  // Animated pieces
  curtainL!: THREE.Mesh
  curtainR!: THREE.Mesh
  curtainsClosed = new THREE.Group()
  frontDoor!: THREE.Group
  bedroomDoor!: THREE.Group
  weather!: ReturnType<typeof canvasPlane>
  clock!: ReturnType<typeof canvasPlane>
  tvScreen!: THREE.Mesh
  tvOverlay!: ReturnType<typeof canvasPlane>
  psa!: ReturnType<typeof canvasPlane>
  letter!: ReturnType<typeof canvasPlane>
  envelope!: ReturnType<typeof canvasPlane>
  envelopeOnTable!: ReturnType<typeof canvasPlane>
  phoneScreen!: ReturnType<typeof canvasPlane>
  phone = new THREE.Group()
  mirror!: THREE.Mesh
  mirrorAt = new THREE.Vector3(97.5, 1.75, -5.94)
  remote = new THREE.Group()
  cup = new THREE.Group()
  canHeld = new THREE.Group()
  canOnSteps = new THREE.Group()
  bedSoil!: THREE.Mesh
  bedSoilWet!: THREE.Mesh
  rockers!: THREE.InstancedMesh
  rockerSpots: Array<[number, number, number]> = []
  bikes: THREE.Group[] = []
  dogParts!: ReturnType<typeof dog>
  bird = new THREE.Group()
  busDoors: THREE.Mesh[] = []
  stripTex!: THREE.CanvasTexture
  floorLamp!: THREE.Mesh
  drop!: THREE.Mesh
  shirtOnChair!: THREE.Mesh
  private dummy = new THREE.Object3D()

  constructor(private pal: Pal) {}

  build(scene: THREE.Scene, models: SuburbModels) {
    scene.add(this.group, this.busInside)
    this.buildGround()
    this.buildLevyHouse(models)
    this.buildStreet(models)
    this.buildElen(models)
    this.buildBusStop()
    this.buildBus()
    this.buildBusInside()
  }

  // ——— Ground and sky ———

  private buildGround() {
    const m = this.pal
    const g = this.group
    // A sky dome: pale blue, whiter at the horizon.
    const skyGeo = new THREE.SphereGeometry(420, 32, 16)
    const col: number[] = []
    const p = skyGeo.attributes.position as THREE.BufferAttribute
    const top = new THREE.Color(0x9fd2f7)
    const hor = new THREE.Color(0xe9f6fd)
    for (let i = 0; i < p.count; i++) {
      const t = Math.max(0, p.getY(i) / 420)
      const c = hor.clone().lerp(top, Math.pow(t, 0.6))
      col.push(c.r, c.g, c.b)
    }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    const sky = mesh(skyGeo, m.sky, 120, 0, 10, g)
    sky.renderOrder = -1
    sky.frustumCulled = false
    // Lawns everywhere, the road and sidewalks along x.
    const lawn = mesh(new THREE.PlaneGeometry(260, 160), m.lawn, 120, 0, 10, g)
    lawn.rotation.x = -PI / 2
    lawn.receiveShadow = true
    const road = mesh(new THREE.PlaneGeometry(240, 6), m.road, 120, 0.012, 13.5, g)
    road.rotation.x = -PI / 2
    road.receiveShadow = true
    for (const z of [9.75, 17.25]) {
      const sw = rbox(240, 0.12, 1.5, m.sidewalk, 120, 0.06, z, g, 0.03)
      sw.receiveShadow = true
    }
  }

  // ——— Levy's house ———

  private buildLevyHouse(models: SuburbModels) {
    const m = this.pal
    const g = this.group
    const H = 2.65
    const y0 = FLOOR
    const out = { a: m.cream, b: m.clapboard, edge: m.trimWhite }
    const inn = { a: m.cream, b: m.cream, edge: m.cream }
    // Foundation and floors.
    rbox(10.2, FLOOR, 10.2, m.trimWhite, 101, FLOOR / 2, -1, g, 0.04)
    const fl = mesh(new THREE.PlaneGeometry(10, 10), m.floorWood, 101, FLOOR + 0.002, -1, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const bath = mesh(new THREE.PlaneGeometry(3, 3), m.tileBath, 97.5, FLOOR + 0.004, -4.5, g)
    bath.rotation.x = -PI / 2
    const ceil = mesh(new THREE.PlaneGeometry(10, 10), m.cream, 101, FLOOR + H, -1, g)
    ceil.rotation.x = PI / 2
    // Exterior walls (cream inside, clapboard outside). a faces left of the direction of travel.
    wall(g, 96, -6, 106, -6, y0, H, { a: m.cream, b: m.clapboard, edge: m.trimWhite })
    wall(g, 106, -6, 106, 4, y0, H, out, [
      { at: 2.4, width: 2.0, bottom: 0.9, height: 1.2 },
      { at: 7.8, width: 1.6, bottom: 0.75, height: 1.4 },
    ])
    wall(g, 106, 4, 96, 4, y0, H, out, [
      { at: 2.5, width: 2.0, bottom: 0.75, height: 1.4 },
      { at: 6.0, width: 1.0, height: 2.1 },
      { at: 8.3, width: 1.4, bottom: 0.9, height: 1.2 },
    ])
    wall(g, 96, 4, 96, -6, y0, H, out, [
      { at: 6.1, width: 1.0, bottom: 0.9, height: 1.2 },
      { at: 8.5, width: 0.7, bottom: 1.35, height: 0.6 },
    ])
    // Interior walls.
    wall(g, 101, -6, 101, -1, y0, H, inn, [{ at: 0.7, width: 0.9, height: 2.1 }])
    wall(g, 96, -3, 101, -3, y0, H, inn, [{ at: 4.0, width: 0.9, height: 2.1 }])
    wall(g, 99, -6, 99, -3, y0, H, inn, [{ at: 1.5, width: 0.8, height: 2.1 }])
    wall(g, 101, -1, 106, -1, y0, H, inn)
    wall(g, 101, 1.7, 101, 4, y0, H, inn)
    wall(g, 96, 1.0, 98.4, 1.0, y0, H, inn)
    // Rounded corner posts where walls meet (no sharp corners in here).
    for (const [x, z] of [
      [101, -1],
      [101, -3],
      [99, -3],
      [101, 1.7],
      [98.4, 1.0],
    ])
      cyl(0.075, 0.075, H, m.cream, x, y0 + H / 2, z, g, 16)
    // Skirting.
    for (const [x0, z0, x1, z1] of [
      [96.07, -5.93, 105.93, -5.93],
      [96.07, 3.93, 105.93, 3.93],
    ])
      rbox(Math.hypot(x1 - x0, z1 - z0), 0.08, 0.02, m.trimWhite, (x0 + x1) / 2, y0 + 0.04, (z0 + z1) / 2, g, 0.008)
    // Windows: frames and glass, in the wall frames.
    const winAt = (x: number, z: number, ry: number, w: number, h: number, bottom: number) => {
      const f = new THREE.Group()
      f.position.set(x, y0 + bottom, z)
      f.rotation.y = ry
      g.add(f)
      windowIn(f, { w, h, trim: m.trimWhite, glass: m.waterGlass, depth: 0.16, r: 0.02 })
      return f
    }
    winAt(106, -3.6, PI / 2, 2.0, 1.2, 0.9)
    winAt(106, 1.8, PI / 2, 1.6, 1.4, 0.75)
    winAt(103.5, 4, 0, 2.0, 1.4, 0.75)
    winAt(97.7, 4, 0, 1.4, 1.2, 0.9)
    winAt(96, -2.1, -PI / 2, 1.0, 1.2, 0.9)
    winAt(96, -4.5, -PI / 2, 0.7, 0.6, 1.35)
    // Doors: front (opens inward, hinge west), bedroom, bathroom, kitchen–hall.
    const mkDoor = (x: number, z: number, ry: number, w = 0.9) => {
      const d = door({ w, h: 2.08, frame: m.trimWhite, leaf: m.trimWhite, handle: m.chrome })
      d.group.position.set(x, y0, z)
      d.group.rotation.y = ry
      g.add(d.group)
      return d
    }
    const fd = mkDoor(100, 4, PI, 1.0)
    this.frontDoor = fd.leaf
    const bd = mkDoor(101, -5.3, PI / 2)
    this.bedroomDoor = bd.leaf
    bd.leaf.rotation.y = -1.2
    mkDoor(99, -4.5, PI / 2, 0.8).leaf.rotation.y = 1.1
    mkDoor(100, -3, 0).leaf.rotation.y = -1.3
    // Exterior: roof, trim, veranda.
    const rise = 1.9
    const ang = Math.atan2(rise, 5.6)
    for (const s of [-1, 1]) {
      const r = rbox(10.8, 0.12, Math.hypot(5.6, rise), m.roof, 101, y0 + H + 0.05 + rise / 2, -1 + (s * 5.6) / 2, g, 0.03)
      r.rotation.x = s * ang
    }
    const gable = new THREE.Shape()
    gable.moveTo(-5.1, 0)
    gable.lineTo(5.1, 0)
    gable.lineTo(0, rise)
    gable.closePath()
    for (const sx of [-1, 1]) {
      const gg = mesh(new THREE.ShapeGeometry(gable), m.clapboard, 101 + sx * 5.06, y0 + H, -1, g)
      gg.rotation.y = sx * PI / 2
      ;(m.clapboard as THREE.Material).side = THREE.DoubleSide
    }
    rbox(10.4, 0.16, 10.4, m.trimWhite, 101, y0 + H + 0.05, -1, g, 0.04)
    for (const [x, z] of [
      [96, -6],
      [106, -6],
      [96, 4],
      [106, 4],
    ])
      rbox(0.16, H + 0.3, 0.16, m.trimWhite, x, y0 + H / 2 - 0.15, z, g, 0.04)
    // Veranda x 97…105, z 4…6.
    rbox(8, 0.1, 2.1, m.deskWood, 101, FLOOR - 0.04, 5.0, g, 0.03)
    for (const x of [97.2, 100 - 0.75, 100 + 0.75, 104.8]) rbox(0.12, 2.5, 0.12, m.trimWhite, x, FLOOR + 1.25, 5.92, g, 0.03)
    for (const [a, b] of [
      [97.2, 99.25],
      [100.75, 104.8],
    ]) {
      rbox(b - a, 0.06, 0.06, m.trimWhite, (a + b) / 2, FLOOR + 0.92, 5.92, g, 0.02)
      for (let x = a + 0.15; x < b - 0.1; x += 0.16) rbox(0.03, 0.62, 0.03, m.trimWhite, x, FLOOR + 0.6, 5.92, g, 0.008)
    }
    const vr = rbox(8.4, 0.08, 2.5, m.roof, 101, FLOOR + 2.55, 5.05, g, 0.02)
    vr.rotation.x = 0.1
    // Steps down to the path (100, 0, 6.3).
    for (let i = 0; i < 2; i++) rbox(1.4, 0.15, 0.32, m.deskWood, 100, 0.075 + i * 0.15 - 0.075 * i, 6.45 - i * 0.3, g, 0.03)
    const path = mesh(new THREE.PlaneGeometry(1.2, 2.4), m.sidewalk, 100, 0.01, 7.8, g)
    path.rotation.x = -PI / 2
    // Doormat with room for the envelope.
    rbox(0.9, 0.012, 0.55, m.rug, 100, FLOOR + 0.008, 4.55, g, 0.004)

    // ——— Bedroom ———
    // Bed: headboard on the north wall, mattress top 0.85.
    rbox(1.62, 0.32, 2.08, m.deskWood, 103.6, FLOOR + 0.2, -4.92, g, 0.05)
    rbox(1.66, 0.95, 0.08, m.deskWood, 103.6, FLOOR + 0.62, -5.93, g, 0.04)
    rbox(1.5, 0.2, 1.98, m.linenWhite, 103.6, 0.75, -4.92, g, 0.07)
    const duvet = rbox(1.56, 0.3, 1.32, m.linen, 103.6, 0.99, -4.33, g, 0.09)
    duvet.castShadow = true
    for (const sx of [-0.36, 0.36]) rbox(0.6, 0.13, 0.36, m.linenWhite, 103.6 + sx, 0.92, -5.6, g, 0.06)
    // Nightstand, lamp.
    rbox(0.45, 0.5, 0.4, m.deskWood, 102.45, FLOOR + 0.25, -5.6, g, 0.04)
    cyl(0.06, 0.08, 0.3, m.ceramic, 102.45, FLOOR + 0.65, -5.6, g, 16)
    cyl(0.12, 0.16, 0.18, m.linenWhite, 102.45, FLOOR + 0.88, -5.6, g, 20)
    // The window's curtains (two sage panels; they slide apart by themselves).
    const curtainGeo = new THREE.PlaneGeometry(1.15, 1.75, 12, 1)
    const cp = curtainGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 18) * 0.025)
    curtainGeo.computeVertexNormals()
    this.curtainL = mesh(curtainGeo, m.curtain, 105.86, FLOOR + 1.62, -4.1, g)
    this.curtainR = mesh(curtainGeo, m.curtain, 105.86, FLOOR + 1.62, -3.1, g)
    for (const c of [this.curtainL, this.curtainR]) {
      c.rotation.y = -PI / 2
      c.castShadow = true
    }
    cyl(0.015, 0.015, 2.6, m.chrome, 105.88, FLOOR + 2.52, -3.6, g, 8).rotation.x = PI / 2
    // Desk in the SW corner, chair, the ironed shirt, the glass of water, slippers.
    rbox(1.0, 0.04, 0.5, m.deskWood, 101.5, 1.03, -1.6, g, 0.03)
    for (const [dx, dz] of [
      [-0.44, -0.2],
      [0.44, -0.2],
      [-0.44, 0.2],
      [0.44, 0.2],
    ])
      rbox(0.04, 0.72, 0.04, m.deskWood, 101.5 + dx, FLOOR + 0.36, -1.6 + dz, g, 0.015)
    const ch = chair(m.deskWood, m.deskWood)
    ch.position.set(101.5, FLOOR, -2.2)
    g.add(ch)
    this.shirtOnChair = rbox(0.42, 0.55, 0.05, m.linenWhite, 101.5, FLOOR + 0.78, -2.43, g, 0.03)
    this.shirtOnChair.rotation.x = -0.07
    rbox(0.44, 0.06, 0.12, m.linenWhite, 101.5, FLOOR + 1.07, -2.44, g, 0.03)
    const glass = mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.032, 0],
          [0.036, 0.12],
          [0.034, 0.12],
          [0.03, 0.004],
          [0, 0.004],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        24,
      ),
      m.waterGlass,
      101.25,
      1.05,
      -1.5,
      g,
    )
    glass.renderOrder = 3
    mesh(new THREE.CylinderGeometry(0.03, 0.028, 0.1, 20), m.water, 101.25, 1.105, -1.5, g).renderOrder = 2
    for (const sx of [-0.07, 0.07]) {
      const s = rbox(0.1, 0.04, 0.26, m.linen, 102.6 + sx, FLOOR + 0.02, -3.6, g, 0.02)
      s.rotation.y = 0.15
    }
    // Weather screen on the west wall.
    const wf = rbox(0.66, 0.41, 0.03, m.trimWhite, 101.08, 1.9, -4.0, g, 0.02)
    wf.rotation.y = PI / 2
    this.weather = canvasPlane(0.6, 0.35, 512, () => {}, { emissive: true })
    this.weather.mesh.position.set(101.1, 1.9, -4.0)
    this.weather.mesh.rotation.y = PI / 2
    g.add(this.weather.mesh)
    // The closed curtains of Wednesday (same panels, drawn).
    // (Handled by curtain positions.)

    // ——— Bathroom: mirror (a real reflection, set by the director), sink ———
    rbox(0.8, 1.0, 0.04, m.mirrorFrame, 97.5, 1.75, -5.965, g, 0.03)
    const mirror = new Reflector(new THREE.PlaneGeometry(0.7, 0.9), { textureWidth: 560, textureHeight: 720, color: 0xd8dde0, clipBias: 0.003 })
    mirror.position.copy(this.mirrorAt)
    g.add(mirror)
    this.mirror = mirror
    const sink = new THREE.Group()
    sink.position.set(97.5, FLOOR, -5.72)
    g.add(sink)
    cyl(0.1, 0.13, 0.78, m.ceramic, 0, 0.39, 0, sink, 20)
    rbox(0.56, 0.12, 0.42, m.ceramic, 0, 0.82, 0.02, sink, 0.06)
    cyl(0.015, 0.015, 0.16, m.chrome, 0, 0.94, -0.12, sink, 10)
    rbox(0.8, 1.9, 0.75, m.ceramic, 96.45, FLOOR + 0.3, -5.6, g, 0.08).scale.y = 0.32
    const tiles = mesh(new THREE.PlaneGeometry(3, 1.3), m.tileBath, 97.5, FLOOR + 0.65, -5.93, g)
    tiles.receiveShadow = true
    rbox(0.42, 0.45, 0.62, m.ceramic, 98.6, FLOOR + 0.22, -3.5, g, 0.1)

    // ——— Kitchen ———
    const ctr = counter(4.3, 0.62, 0.92, m.counter, m.cabinet)
    ctr.position.set(98.3, FLOOR, -2.66)
    g.add(ctr)
    for (let i = 0; i < 4; i++) rbox(0.9, 0.7, 0.34, m.cabinet, 96.7 + i * 1.0, FLOOR + 1.95, -2.82, g, 0.03)
    rbox(0.75, 1.85, 0.68, m.trimWhite, 100.55, FLOOR + 0.93, -2.6, g, 0.06)
    // Coffee machine on the counter (99, 1.25, −2.75).
    const cm = new THREE.Group()
    cm.position.set(99.0, FLOOR + 0.92, -2.75)
    g.add(cm)
    rbox(0.26, 0.36, 0.3, m.trimWhite, 0, 0.18, 0, cm, 0.04)
    cyl(0.06, 0.05, 0.1, m.ceramic, 0, 0.05, 0.1, cm, 16)
    // Round table, two chairs.
    const tb = new THREE.Group()
    tb.position.set(98.3, FLOOR, -0.6)
    g.add(tb)
    // A painted top: the wood scan magnified into jagged grain at this size, and paper reads better on paint.
    cyl(0.45, 0.45, 0.04, new THREE.MeshStandardMaterial({ color: 0xc9d4d8, roughness: 0.62 }), 0, 0.73, 0, tb, 48)
    cyl(0.05, 0.06, 0.7, m.deskWood, 0, 0.36, 0, tb, 16)
    cyl(0.28, 0.3, 0.03, m.deskWood, 0, 0.015, 0, tb, 32)
    for (const [dx, dz, ry] of [
      [0, 0.68, PI],
      [-0.68, 0, PI / 2],
    ] as const) {
      const c = chair(m.deskWood, m.deskWood)
      c.position.set(98.3 + dx, FLOOR, -0.6 + dz)
      c.rotation.y = ry
      g.add(c)
    }
    // The digital clock on the west wall.
    rbox(0.42, 0.18, 0.04, m.trimWhite, 96.08, 2.0, -0.8, g, 0.02).rotation.y = PI / 2
    this.clock = canvasPlane(0.38, 0.14, 256, () => {}, { emissive: true })
    this.clock.mesh.position.set(96.11, 2.0, -0.8)
    this.clock.mesh.rotation.y = PI / 2
    g.add(this.clock.mesh)
    // The letter and envelope on the table; the phone.
    this.letter = canvasPlane(0.21, 0.297, 768, () => {})
    this.letter.mesh.rotation.x = -PI / 2
    this.letter.mesh.position.set(98.3, FLOOR + 0.752, -0.55)
    g.add(this.letter.mesh)
    this.envelopeOnTable = canvasPlane(0.22, 0.11, 256, () => {})
    this.envelopeOnTable.mesh.rotation.set(-PI / 2, 0, 0.3)
    this.envelopeOnTable.mesh.position.set(98.0, FLOOR + 0.753, -0.85)
    g.add(this.envelopeOnTable.mesh)
    this.envelope = canvasPlane(0.22, 0.11, 256, () => {})
    this.envelope.mesh.rotation.set(-PI / 2, 0, 0.2)
    this.envelope.mesh.position.set(100.0, FLOOR + 0.016, 4.6)
    g.add(this.envelope.mesh)
    rbox(0.075, 0.009, 0.155, m.ink, 0, 0.0045, 0, this.phone, 0.004)
    this.phoneScreen = canvasPlane(0.068, 0.146, 256, () => {}, { emissive: true })
    this.phoneScreen.mesh.rotation.x = -PI / 2
    this.phoneScreen.mesh.position.y = 0.0095
    this.phone.add(this.phoneScreen.mesh)
    g.add(this.phone)
    // A coffee cup (Levy's), placed by the director.
    const cupMesh = mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.035, 0],
          [0.042, 0.085],
          [0.038, 0.085],
          [0.032, 0.006],
          [0, 0.006],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        24,
      ),
      m.ceramic,
      0,
      -0.04,
      0,
      this.cup,
    )
    cupMesh.castShadow = true
    g.add(this.cup)

    // ——— Living room ———
    if (models.sofa) {
      models.sofa.position.set(103.5, FLOOR, 2.62)
      models.sofa.rotation.y = PI
      g.add(models.sofa)
    } else {
      rbox(1.9, 0.8, 0.9, m.sofa, 103.5, FLOOR + 0.4, 2.65, g, 0.12)
    }
    // Coffee table (103.5, 0.3, 1.4): empty.
    rbox(1.0, 0.05, 0.5, m.deskWood, 103.5, FLOOR + 0.425, 1.4, g, 0.03)
    for (const [dx, dz] of [
      [-0.44, -0.2],
      [0.44, -0.2],
      [-0.44, 0.2],
      [0.44, 0.2],
    ])
      cyl(0.022, 0.018, 0.4, m.deskWood, 103.5 + dx, FLOOR + 0.2, 1.4 + dz, g, 10)
    const rug = rbox(2.6, 0.01, 1.9, m.rug, 103.5, FLOOR + 0.007, 1.8, g, 0.004)
    rug.receiveShadow = true
    // TV on the north wall: a flat panel whose picture is the studio, rendered live.
    rbox(1.26, 0.76, 0.05, m.ink, 103.5, 1.45 + 0.0, -0.93, g, 0.015)
    this.tvScreen = mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshBasicMaterial({ color: 0x0a0c10 }), 103.5, 1.45, -0.903, g)
    this.tvOverlay = canvasPlane(1.2, 0.7, 768, () => {}, { emissive: true, transparent: true })
    this.tvOverlay.mesh.position.set(103.5, 1.45, -0.9)
    ;(this.tvOverlay.material as THREE.MeshBasicMaterial).depthWrite = false
    g.add(this.tvOverlay.mesh)
    rbox(1.8, 0.45, 0.42, m.deskWood, 103.5, FLOOR + 0.225, -0.76, g, 0.04)
    // Floor lamp (105.4, 0.3, 3.4).
    cyl(0.16, 0.18, 0.03, m.ink, 105.4, FLOOR + 0.015, 3.4, g, 24)
    cyl(0.012, 0.012, 1.5, m.chrome, 105.4, FLOOR + 0.78, 3.4, g, 8)
    this.floorLamp = mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.28, 24, 1, true), m.linenWhite, 105.4, FLOOR + 1.56, 3.4, g)
    ;(this.floorLamp.material as THREE.Material).side = THREE.DoubleSide
    // A bookshelf and a plant on the east wall.
    rbox(0.35, 1.6, 1.0, m.deskWood, 105.78, FLOOR + 0.8, 0.0, g, 0.03)
    const pl = plant(m.ceramic, m.leaf, 0.9, 4)
    pl.position.set(105.5, FLOOR, -0.6)
    g.add(pl)
    // The remote (Tuesday evening: in his other hand).
    rbox(0.05, 0.018, 0.17, m.ink, 0, 0, 0, this.remote, 0.008)
    for (let i = 0; i < 3; i++) rbox(0.01, 0.004, 0.016, m.chrome, -0.012 + (i % 2) * 0.024, 0.011, -0.04 + i * 0.03, this.remote, 0.002)
    g.add(this.remote)
    // Entry: bench by the door, hooks.
    rbox(1.1, 0.06, 0.38, m.deskWood, 99.0, FLOOR + 0.45, 3.2, g, 0.03)
    for (const sx of [-0.48, 0.48]) rbox(0.05, 0.43, 0.34, m.deskWood, 99.0 + sx, FLOOR + 0.215, 3.2, g, 0.02)
    for (let i = 0; i < 3; i++) cyl(0.012, 0.012, 0.08, m.chrome, 98.6 + i * 0.4, 1.95, 3.94, g, 8).rotation.x = PI / 2
    rbox(0.5, 0.75, 0.08, m.clapboard, 98.6, 1.55, 3.86, g, 0.04)
    // Lights inside: ceiling fixtures (soft discs).
    for (const [x, z] of [
      [103.5, -3.5],
      [98.5, -1],
      [103.5, 1.5],
      [97.5, -4.5],
    ])
      cyl(0.18, 0.2, 0.06, m.linenWhite, x, FLOOR + H - 0.03, z, g, 24)
  }

  // ——— Street ———

  private buildStreet(models: SuburbModels) {
    const m = this.pal
    const g = this.group
    // The identical houses: walls tinted per instance.
    const geo = houseGeometries()
    const lots = [...NORTH_LOTS.map((x) => [x, -1, 0] as const), ...SOUTH_LOTS.filter((x) => x !== 99).map((x) => [x, 27.25, PI] as const)]
    const wallMat = (m.clapboard as THREE.MeshStandardMaterial).clone()
    wallMat.color.set(0xffffff)
    const pastel = [0xf4e3c8, 0xdfeaf0, 0xf3dede, 0xe2efd8, 0xefe6f5, 0xf6efd2]
    const make = (gg: THREE.BufferGeometry, mat: THREE.Material) => {
      const im = new THREE.InstancedMesh(gg, mat, lots.length)
      im.castShadow = true
      im.receiveShadow = true
      g.add(im)
      return im
    }
    const ims = {
      walls: make(geo.walls, wallMat),
      trim: make(geo.trim, m.trimWhite),
      roof: make(geo.roof, m.roof),
      glass: make(geo.glass, m.busGlass),
      door: make(geo.door, m.mailbox),
      deck: make(geo.deck, m.deskWood),
    }
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const col = new THREE.Color()
    lots.forEach(([x, z, ry], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry)
      m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, 1, 1))
      for (const im of Object.values(ims)) im.setMatrixAt(i, m4)
      ims.walls.setColorAt(i, col.setHex(pastel[i % pastel.length]))
      const front = z < 10 ? 1 : -1
      this.rockerSpots.push([x + 2.2, z + front * (3.75 + 1.1), ry])
    })
    // Rocking chairs on every veranda, Levy's too; they rock in sync.
    this.rockerSpots.push([104, 5.2, 0])
    this.rockers = new THREE.InstancedMesh(rockingChairGeometry(), m.deskWood, this.rockerSpots.length)
    this.rockers.castShadow = true
    this.rockers.frustumCulled = false
    g.add(this.rockers)
    this.rock(0)
    // Fences: Levy's side z 9 with gates at each path, Elen's side z 18.
    picketFence(g, 62, 176, 9.0, m.picket, [...NORTH_LOTS, 100].map((x) => [x - 0.6, x + 0.6] as [number, number]))
    picketFence(g, 62, 176, 18.0, m.picket, SOUTH_LOTS.concat([99]).map((x) => [x - 0.6, x + 0.6] as [number, number]))
    // Side fences between Levy and his east neighbour (the bedroom window's view).
    picketFenceZ(g, -6, 8.8, 109.2, m.picket)
    // Paths from the gates to the doors (north lots).
    for (const x of NORTH_LOTS) {
      const p = mesh(new THREE.PlaneGeometry(1.1, 4.4), m.sidewalk, x, 0.01, 6.9, g)
      p.rotation.x = -PI / 2
    }
    for (const x of SOUTH_LOTS) {
      const p = mesh(new THREE.PlaneGeometry(1.1, 3.6), m.sidewalk, x, 0.01, 20.0, g)
      p.rotation.x = -PI / 2
    }
    // Trees: round, in front yards and between lots; one in the side yard for the window.
    const rand = mulberry32(12)
    const trees: Array<[number, number, number]> = [
      [110.8, -4.2, 1.0],
      [108.2, -9.5, 1.2],
      [94.0, -9.0, 1.1],
    ]
    for (const x of NORTH_LOTS) trees.push([x - 3.4, 7.2, 0.8 + rand() * 0.3])
    for (const x of SOUTH_LOTS) trees.push([x + 3.2, 20.0, 0.8 + rand() * 0.3])
    for (let i = 0; i < 18; i++) trees.push([64 + i * 6.5 + rand() * 2, -12 - rand() * 5, 1 + rand() * 0.5])
    for (let i = 0; i < 18; i++) trees.push([64 + i * 6.5 + rand() * 2, 36 + rand() * 5, 1 + rand() * 0.5])
    roundTrees(g, trees, m.leaf, m.bark, 5)
    // Mailboxes at the fence.
    const mb = new THREE.InstancedMesh(mailboxGeometry(), m.mailbox, NORTH_LOTS.length + SOUTH_LOTS.length + 1)
    let n = 0
    for (const x of [...NORTH_LOTS, 100]) mb.setMatrixAt(n++, m4.makeTranslation(x + 1.1, 0, 8.7))
    for (const x of SOUTH_LOTS) mb.setMatrixAt(n++, m4.compose(new THREE.Vector3(x - 1.1, 0, 18.3), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), PI), new THREE.Vector3(1, 1, 1)))
    mb.castShadow = true
    g.add(mb)
    // Street lamps and hydrants (models).
    if (models.lamp) {
      for (let i = 0; i < 8; i++) {
        const l = i === 0 ? models.lamp : models.lamp.clone(true)
        const north = i % 2 === 0
        l.position.set(80 + i * 13, 0.12, north ? 10.25 : 16.75)
        l.rotation.y = north ? 0 : PI
        g.add(l)
      }
    }
    if (models.hydrant) {
      for (const [i, x] of [92, 124, 152].entries()) {
        const h = i === 0 ? models.hydrant : models.hydrant.clone(true)
        h.position.set(x, 0.12, i % 2 ? 17.0 : 10.1)
        h.rotation.y = rand() * 6
        g.add(h)
      }
    }
    // Kids' bikes (riders are figures, placed by the director).
    this.bikes = [bicycle(m.bike, m.tire, m.chrome), bicycle(m.bikeB, m.tire, m.chrome)]
    for (const b of this.bikes) {
      b.scale.setScalar(0.85)
      g.add(b)
    }
    this.dogParts = dog(m.dog, m.ink)
    g.add(this.dogParts.group)
    // The bird that lands on the side fence, exactly on a post.
    const b = bird(m.mailbox, m.ink)
    this.bird.add(b)
    g.add(this.bird)
    // Levy's lawn and path planters.
    if (models.planter) {
      models.planter.position.set(98.3, FLOOR, 5.7)
      g.add(models.planter)
      const p2 = models.planter.clone(true)
      p2.position.set(102.6, FLOOR, 5.7)
      g.add(p2)
    }
  }

  /** The rocking chairs, all in step (a function of time). */
  rock(time: number) {
    const a = Math.sin(time * 1.3) * 0.09
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    this.rockerSpots.forEach(([x, z, ry], i) => {
      e.set(a, ry, 0, 'YXZ')
      q.setFromEuler(e)
      this.dummy.position.set(x, z > 10 ? 0.3 : FLOOR, z)
      this.dummy.quaternion.copy(q)
      this.dummy.scale.set(1, 1, 1)
      this.dummy.updateMatrix()
      this.rockers.setMatrixAt(i, this.dummy.matrix)
    })
    this.rockers.instanceMatrix.needsUpdate = true
  }

  // ——— Bayan Elen's house ———

  private buildElen(models: SuburbModels) {
    const m = this.pal
    const g = this.group
    const geo = houseGeometries(8, 7.5)
    const yellow = (m.clapboard as THREE.MeshStandardMaterial).clone()
    yellow.color.set(0xf6ecbf)
    const house = new THREE.Group()
    house.position.set(99, 0, 27.25)
    house.rotation.y = PI
    g.add(house)
    for (const [k, mat] of [
      ['walls', yellow],
      ['trim', m.trimWhite],
      ['roof', m.roof],
      ['glass', m.busGlass],
      ['door', m.busStripe],
      ['deck', m.deskWood],
    ] as const) {
      const me = mesh(geo[k], mat, 0, 0, 0, house)
      me.castShadow = true
      me.receiveShadow = true
    }
    // The front garden: flowerbeds along x 96…102, z 20…21, soil that darkens when watered.
    this.bedSoil = rbox(6, 0.1, 1.0, m.soil, 99, 0.05, 20.5, g, 0.03)
    this.bedSoilWet = rbox(6.01, 0.1, 1.0, m.soilWet, 99, 0.051, 20.5, g, 0.03)
    this.bedSoilWet.visible = false
    rbox(6.2, 0.14, 0.06, m.trimWhite, 99, 0.07, 19.97, g, 0.02)
    const rand = mulberry32(8)
    const blooms = [m.flowerA, m.flowerB, m.flowerC]
    for (let i = 0; i < 36; i++) {
      const x = 96.2 + rand() * 5.6
      const z = 20.1 + rand() * 0.8
      const h = 0.18 + rand() * 0.18
      cyl(0.006, 0.006, h, m.stem, x, 0.1 + h / 2, z, g, 5)
      const f = mesh(new THREE.SphereGeometry(0.04 + rand() * 0.02, 8, 6), blooms[i % 3], x, 0.1 + h, z, g)
      f.scale.y = 0.6
      const lf = mesh(new THREE.SphereGeometry(0.05, 6, 4), m.leaf, x + 0.02, 0.14, z, g)
      lf.scale.set(1.4, 0.4, 0.7)
    }
    // A drop falling from a leaf (Wednesday).
    this.drop = mesh(new THREE.SphereGeometry(0.008, 8, 6), m.water, 98.9, 0.3, 20.4, g)
    // Path, steps (99, 0, 21.8).
    const p = mesh(new THREE.PlaneGeometry(1.1, 4), m.sidewalk, 99, 0.012, 20.0, g)
    p.rotation.x = -PI / 2
    // The watering can: in her hand, and on the steps on Wednesday.
    if (models.can) {
      this.canHeld.add(models.can)
      const c2 = models.can.clone(true)
      this.canOnSteps.add(c2)
    } else {
      for (const grp of [this.canHeld, this.canOnSteps]) {
        cyl(0.09, 0.1, 0.2, m.can, 0, 0.1, 0, grp, 20)
        tube(
          [
            [0, 0.08, 0.09],
            [0, 0.2, 0.25],
            [0, 0.26, 0.32],
          ],
          0.012,
          m.can,
          grp,
          8,
        )
      }
    }
    g.add(this.canHeld, this.canOnSteps)
    this.canOnSteps.position.set(98.6, 0.15, 21.6)
    this.canOnSteps.rotation.y = 0.4
    // Its label "E-07".
    const lab = canvasPlane(0.06, 0.03, 128, (c, W, H) => {
      c.fillStyle = '#fff'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#222'
      c.font = `700 ${Math.round(H * 0.7)}px monospace`
      c.fillText('E-07', W * 0.08, H * 0.78)
    })
    lab.mesh.position.set(0.0, 0.1, 0.0)
    this.canOnSteps.add(lab.mesh)
    lab.mesh.position.set(0.097, 0.1, 0)
    lab.mesh.rotation.y = PI / 2
  }

  // ——— Bus stop ———

  private buildBusStop() {
    const m = this.pal
    const g = this.group
    const s = new THREE.Group()
    s.position.set(140, 0.12, 9.65)
    g.add(s)
    for (const [x, z] of [
      [-1.5, -0.6],
      [1.5, -0.6],
      [-1.5, 0.6],
      [1.5, 0.6],
    ])
      rbox(0.07, 2.3, 0.07, m.shelter, x, 1.15, z, s, 0.02)
    rbox(3.2, 0.08, 1.45, m.shelter, 0, 2.32, 0, s, 0.03)
    mesh(new THREE.PlaneGeometry(3.0, 2.0), m.shelterGlass, 0, 1.15, -0.62, s)
    const side = mesh(new THREE.PlaneGeometry(1.2, 2.0), m.shelterGlass, -1.5, 1.15, 0, s)
    side.rotation.y = PI / 2
    rbox(2.4, 0.05, 0.4, m.deskWood, 0, 0.46, -0.35, s, 0.02)
    for (const x of [-1, 1]) rbox(0.05, 0.44, 0.35, m.shelter, x, 0.22, -0.35, s, 0.01)
    // The PSA panel: portrait LED at the shelter's east end, facing the street.
    rbox(1.0, 1.62, 0.12, m.shelter, 1.6, 1.38, 0.05, s, 0.03)
    this.psa = canvasPlane(0.9, 1.5, 512, () => {}, { emissive: true })
    this.psa.mesh.position.set(141.6, 1.5, 9.77)
    g.add(this.psa.mesh)
    rbox(0.08, 0.6, 0.08, m.shelter, 1.6, 0.3, 0.05, s, 0.02)
  }

  // ——— The bus (outside) ———

  private buildBus() {
    const m = this.pal
    const b = this.bus
    this.group.add(b)
    // 11 m × 2.5 m, along x, doors on the +z… the curb side (−z, toward the stop).
    rbox(11, 2.6, 2.5, m.busCream, 0, 1.6, 0, b, 0.25)
    rbox(11.02, 0.3, 2.52, m.busStripe, 0, 1.05, 0, b, 0.05)
    for (const sz of [-1, 1]) {
      const w = mesh(new THREE.PlaneGeometry(9.6, 0.95), m.busGlass, -0.3, 2.1, sz * 1.255, b)
      if (sz < 0) w.rotation.y = PI
    }
    const ws = mesh(new THREE.PlaneGeometry(2.2, 1.3), m.busGlass, 5.505, 2.0, 0, b)
    ws.rotation.y = PI / 2
    for (const x of [-3.6, 3.4])
      for (const sz of [-1, 1]) {
        const t = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 24), m.tire, x, 0.5, sz * 1.15, b)
        t.rotation.x = PI / 2
      }
    // Two door leaves on the curb side, sliding.
    for (const x of [3.9, -1.0]) {
      const d = rbox(1.1, 2.1, 0.04, m.busGlass, x, 1.25, -1.27, b, 0.02)
      this.busDoors.push(d)
    }
    for (const sx of [-0.7, 0.7]) rbox(0.25, 0.14, 0.05, m.statusOff, 5.5, 0.9, sx, b, 0.03).rotation.y = PI / 2
    b.traverse((o) => (o.castShadow = true))
  }

  // ——— C. Inside the bus (x 165…175, z −61.25…−58.75) ———

  private buildBusInside() {
    const m = this.pal
    const g = this.busInside
    g.position.set(0, 0, -60)
    const L = 10
    rbox(L, 0.1, 2.5, m.busFloor, 170, -0.05, 0, g, 0.02)
    rbox(L, 0.08, 2.5, m.busCream, 170, 2.24, 0, g, 0.02)
    // Walls with long windows (y 0.9…1.9) on both sides.
    for (const sz of [-1, 1]) {
      rbox(L, 0.9, 0.08, m.busCream, 170, 0.45, sz * 1.25, g, 0.02)
      rbox(L, 0.3, 0.08, m.busCream, 170, 2.05, sz * 1.25, g, 0.02)
      for (let i = 0; i <= 5; i++) rbox(0.1, 1.0, 0.1, m.busCream, 165 + i * 2, 1.4, sz * 1.25, g, 0.03)
      rbox(L, 0.04, 0.1, m.chrome, 170, 1.0, sz * 1.18, g, 0.015)
    }
    for (const sx of [-1, 1]) rbox(0.08, 2.3, 2.5, m.busCream, 170 + sx * 5, 1.15, 0, g, 0.02)
    // The street outside: a strip texture scrolled by the director.
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 256
    drawStreetStrip(c.getContext('2d')!, 2048, 256)
    this.stripTex = new THREE.CanvasTexture(c)
    this.stripTex.colorSpace = THREE.SRGBColorSpace
    this.stripTex.wrapS = THREE.RepeatWrapping
    this.stripTex.repeat.set(0.6, 1)
    const outside = new THREE.MeshBasicMaterial({ map: this.stripTex, color: new THREE.Color(1.25, 1.25, 1.25) })
    for (const sz of [-1, 1]) {
      const w = mesh(new THREE.PlaneGeometry(L, 1.6), outside, 170, 1.4, sz * 1.6, g)
      w.rotation.y = sz < 0 ? 0 : PI
      const gl = mesh(new THREE.PlaneGeometry(L, 1.0), m.busGlass, 170, 1.4, sz * 1.23, g)
      gl.rotation.y = sz < 0 ? 0 : PI
      ;(gl.material as THREE.MeshPhysicalMaterial).opacity = 0.25
    }
    // Seats: facing bench pairs along both sides.
    for (const sz of [-1, 1])
      for (let i = 0; i < 4; i++) {
        const x = 166 + i * 2.4
        for (const [dx, ry] of [
          [-0.7, PI / 2],
          [0.7, -PI / 2],
        ] as const) {
          const seat = new THREE.Group()
          seat.position.set(x + dx, 0, sz * 0.8)
          seat.rotation.y = ry
          g.add(seat)
          rbox(0.9, 0.12, 0.45, m.busSeat, 0, 0.46, 0.0, seat, 0.04)
          rbox(0.9, 0.6, 0.1, m.busSeat, 0, 0.82, -0.24, seat, 0.04)
          rbox(0.7, 0.4, 0.06, m.chrome, 0, 0.2, -0.05, seat, 0.02)
        }
      }
    // Poles and grab rail.
    for (let i = 0; i < 4; i++) cyl(0.02, 0.02, 2.2, m.chrome, 167.2 + i * 2.4, 1.1, 0.35, g, 10)
    const rail = cyl(0.016, 0.016, L, m.chrome, 170, 1.95, 0.4, g, 10)
    rail.rotation.z = PI / 2
    // Ceiling lights.
    for (let i = 0; i < 4; i++) rbox(1.2, 0.03, 0.2, m.panelLight, 166.2 + i * 2.5, 2.19, 0, g, 0.01)
  }

  /** Curtains: 0 closed … 1 open. */
  curtains(open: number) {
    const o = Math.max(0, Math.min(1, open))
    this.curtainL.position.z = -4.1 - o * 0.85
    this.curtainR.position.z = -3.1 + o * 0.85
    this.curtainL.scale.x = 1 - 0.45 * o
    this.curtainR.scale.x = 1 - 0.45 * o
  }

  dispose() {
    this.stripTex?.dispose()
  }
}
