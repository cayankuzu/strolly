/**
 * E. The Bilişsel Stabilizasyon Merkezi (x ≈ 300): a garden of cone-trimmed
 * trees, a pond and two information boards; a white façade with the sign; a
 * glossy white hall where two lines start side by side at the door. Here the
 * hall is laid out with the reception, the coffee machine, the waiting area
 * and the form counter on the EAST, so that a man standing at the split and
 * facing the glass doors has the red line under his RIGHT toe: blue (x 300.3)
 * turns east in front of the desk, loops the waiting area and comes back to
 * the door; red (x 299.7) runs on to z 0 and turns WEST to the stair door
 * (x 285.1), up the one flight of the stairwell (x 280…285) and under the
 * door marked "2".
 *
 * H. The small room on the third floor (x ≈ 600) lives here too.
 */
import * as THREE from 'three'
import { canvasPlane, chair, coffeeMachine, rbox, wallClock } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { coneTrees, wall, windowIn } from './parts'

const PI = Math.PI

export const MARK = new THREE.Vector3(300, 0, 10)
export const DESK = new THREE.Vector3(303.5, 0, 8.5)
export const COFFEE = new THREE.Vector3(311.5, 0, 6)
export const FORMS = new THREE.Vector3(308, 0, 3)
export const STAIR_DOOR = new THREE.Vector3(285.1, 0, 0)
export const DOOR2 = new THREE.Vector3(282.5, 4.5, -6)

/** The lines as polylines (x, z) with their rounded corners. */
export const BLUE: Array<[number, number]> = [
  [300.3, 14.2],
  [300.3, 10.1],
  [300.5, 9.7],
  [300.9, 9.5],
  [312.4, 9.5],
  [312.8, 9.7],
  [313.0, 10.1],
  [313.0, 13.2],
  [312.8, 13.6],
  [312.4, 13.8],
  [301.2, 13.8],
  [300.8, 14.0],
  [300.6, 14.6],
]
export const RED: Array<[number, number]> = [
  [299.7, 14.2],
  [299.7, 0.6],
  [299.5, 0.2],
  [299.1, 0.0],
  [285.0, 0.0],
]

/** A flat ribbon along a polyline (on the floor). */
export function ribbon(pts: Array<[number, number]>, width: number, y = 0.005) {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  let along = 0
  for (let i = 0; i < pts.length; i++) {
    const [x, z] = pts[i]
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    let dx = b[0] - a[0]
    let dz = b[1] - a[1]
    const l = Math.hypot(dx, dz) || 1
    dx /= l
    dz /= l
    if (i > 0) along += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1])
    const nx = -dz * (width / 2)
    const nz = dx * (width / 2)
    pos.push(x + nx, y, z + nz, x - nx, y, z - nz)
    uv.push(along, 0, along, 1)
    if (i > 0) {
      const k = i * 2
      idx.push(k - 2, k - 1, k, k - 1, k + 1, k)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  // Normals up regardless of winding.
  const n = g.attributes.normal as THREE.BufferAttribute
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0)
  return g
}

export class Centre {
  readonly garden = new THREE.Group()
  readonly hall = new THREE.Group()
  readonly stairs = new THREE.Group()
  readonly small = new THREE.Group()
  sign!: ReturnType<typeof canvasPlane>
  boardW!: ReturnType<typeof canvasPlane>
  boardE!: ReturnType<typeof canvasPlane>
  reception!: ReturnType<typeof canvasPlane>
  doorL!: THREE.Mesh
  doorR!: THREE.Mesh
  stairDoor!: THREE.Group
  fountain!: THREE.Mesh
  ripple!: THREE.Mesh
  cup = new THREE.Group()
  spill!: THREE.Mesh
  stream!: THREE.Mesh
  formHeld!: THREE.Mesh
  clock!: ReturnType<typeof wallClock>
  smallDoor!: THREE.Group
  formOnKnee!: ReturnType<typeof canvasPlane>
  formHanded!: ReturnType<typeof canvasPlane>
  bulb!: THREE.Mesh
  /** Pond, form-woman's paper, the visitors' forms. */
  forms: THREE.Mesh[] = []

  constructor(private pal: Pal) {}

  build(scene: THREE.Scene, models: { seating: THREE.Group | null; planter: THREE.Group | null; camera: THREE.Group | null }) {
    scene.add(this.garden, this.hall, this.stairs, this.small)
    this.buildGarden(models)
    this.buildHall(models)
    this.buildStairs()
    this.buildSmallRoom()
  }

  // ——— Garden and façade ———

  private buildGarden(models: { seating: THREE.Group | null; planter: THREE.Group | null }) {
    const m = this.pal
    const g = this.garden
    const sky = new THREE.SphereGeometry(300, 32, 16)
    const col: number[] = []
    const p = sky.attributes.position as THREE.BufferAttribute
    const top = new THREE.Color(0xb6d9f2)
    const hor = new THREE.Color(0xf0f6fa)
    for (let i = 0; i < p.count; i++) {
      const c = hor.clone().lerp(top, Math.pow(Math.max(0, p.getY(i) / 300), 0.6))
      col.push(c.r, c.g, c.b)
    }
    sky.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    const s = mesh(sky, m.sky, 300, 0, 20, g)
    s.frustumCulled = false
    s.renderOrder = -1
    const lawn = mesh(new THREE.PlaneGeometry(120, 90), m.lawnDark, 300, 0, 40, g)
    lawn.rotation.x = -PI / 2
    lawn.receiveShadow = true
    // The white stone path along x 300, splitting around the pond.
    const path = mesh(new THREE.PlaneGeometry(2.2, 30), m.stone, 300, 0.01, 30, g)
    path.rotation.x = -PI / 2
    path.receiveShadow = true
    const ring = mesh(new THREE.RingGeometry(3.0, 4.4, 64), m.stone, 300, 0.012, 31, g)
    ring.rotation.x = -PI / 2
    // The pond: a low white rim, water, a small fountain.
    const rim = mesh(new THREE.TorusGeometry(3.0, 0.14, 10, 64), m.white, 300, 0.12, 31, g)
    rim.rotation.x = PI / 2
    rim.scale.z = 1.6
    const water = mesh(new THREE.CircleGeometry(2.95, 64), m.pondWater, 300, 0.16, 31, g)
    water.rotation.x = -PI / 2
    this.ripple = mesh(new THREE.RingGeometry(0.4, 0.46, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }), 300, 0.17, 31, g)
    this.ripple.rotation.x = -PI / 2
    cyl(0.25, 0.3, 0.4, m.white, 300, 0.2, 31, g, 24)
    this.fountain = mesh(new THREE.CylinderGeometry(0.02, 0.08, 0.9, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.55, depthWrite: false }), 300, 0.85, 31, g)
    // Cone-trimmed trees in two rows, every 4 m.
    const spots: Array<[number, number]> = []
    for (let z = 17.5; z <= 44; z += 4) spots.push([293, z], [307, z])
    coneTrees(g, spots, m.leafDark, m.bark)
    // Benches with calm visitors (figures placed by the director).
    for (const [x, z] of [
      [295, 26],
      [305, 26],
      [295, 36],
      [305, 36],
    ]) {
      if (models.seating) {
        const b = models.seating.clone(true)
        b.position.set(x, 0, z)
        b.rotation.y = x < 300 ? PI / 2 : -PI / 2
        b.scale.setScalar(0.62)
        g.add(b)
      } else {
        rbox(1.8, 0.06, 0.45, m.deskWood, x, 0.45, z, g, 0.02).rotation.y = PI / 2
      }
    }
    // Information boards at (297.6, 21) and (302.4, 21), turned 70° toward the path.
    const board = (x: number, ry: number) => {
      const b = new THREE.Group()
      b.position.set(x, 0, 21)
      b.rotation.y = ry
      g.add(b)
      for (const sx of [-0.62, 0.62]) rbox(0.07, 2.2, 0.07, m.steelDoor, sx, 1.1, -0.05, b, 0.02)
      rbox(1.5, 1.1, 0.06, m.white, 0, 1.6, -0.04, b, 0.03)
      const c = canvasPlane(1.4, 1.0, 768, () => {})
      c.mesh.position.set(0, 1.6, -0.005)
      b.add(c.mesh)
      return c
    }
    this.boardW = board(297.6, 1.22)
    this.boardE = board(302.4, -1.22)
    // The façade at z 15: white, a glass front, 12 m high.
    const fac = new THREE.Group()
    fac.position.set(300, 0, 15)
    g.add(fac)
    rbox(30.4, 0.6, 1.0, m.white, 0, 11.7, -0.3, fac, 0.06)
    rbox(30.4, 1.2, 0.5, m.white, 0, 7.0, 0.0, fac, 0.06)
    for (const sx of [-15, 15]) rbox(0.8, 12, 1.0, m.white, sx, 6, -0.3, fac, 0.06)
    for (let i = 0; i <= 12; i++) {
      const x = -14.6 + i * 2.43
      if (Math.abs(x) < 1.3) continue
      rbox(0.12, 11.4, 0.16, m.white, x, 5.7, -0.05, fac, 0.03)
    }
    for (const y of [3.0, 6.2, 9.4]) rbox(29.2, 0.1, 0.14, m.white, 0, y, -0.05, fac, 0.02)
    const glassL = mesh(new THREE.PlaneGeometry(13.7, 11.4), m.facadeGlass, -7.95, 5.7, -0.1, fac)
    const glassR = mesh(new THREE.PlaneGeometry(13.7, 11.4), m.facadeGlass, 7.95, 5.7, -0.1, fac)
    glassL.renderOrder = glassR.renderOrder = 2
    mesh(new THREE.PlaneGeometry(2.6, 8.4), m.facadeGlass, 0, 7.2, -0.1, fac).renderOrder = 2
    // The sign over the doors.
    this.sign = canvasPlane(14, 1.25, 2048, () => {}, { transparent: true })
    this.sign.mesh.position.set(300, 7.0, 15.27)
    g.add(this.sign.mesh)
    // The sliding glass doors: no handle, no button.
    rbox(2.6, 0.18, 0.3, m.white, 300, 2.5, 15, g, 0.03)
    this.doorL = mesh(new THREE.PlaneGeometry(1.2, 2.4), m.facadeGlass, 299.4, 1.2, 15.0, g)
    this.doorR = mesh(new THREE.PlaneGeometry(1.2, 2.4), m.facadeGlass, 300.6, 1.2, 15.0, g)
    for (const d of [this.doorL, this.doorR]) {
      d.renderOrder = 3
      const frame = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.2, 2.4)), new THREE.LineBasicMaterial({ color: 0xd8dde2 }))
      d.add(frame)
    }
    const mat = rbox(2.4, 0.015, 1.4, m.armchair, 300, 0.008, 15.9, g, 0.005)
    mat.receiveShadow = true
    if (models.planter) {
      for (const x of [296.2, 303.8]) {
        const pl = models.planter.clone(true)
        pl.position.set(x, 0, 16.1)
        g.add(pl)
      }
    }
  }

  // ——— The hall ———

  private buildHall(models: { planter: THREE.Group | null; camera: THREE.Group | null }) {
    const m = this.pal
    const g = this.hall
    const H = 7
    const fl = mesh(new THREE.PlaneGeometry(30, 21), m.gloss, 300, 0, 4.5, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const ce = mesh(new THREE.PlaneGeometry(30, 21), m.whiteMatte, 300, H, 4.5, g)
    ce.rotation.x = PI / 2
    const w = { a: m.whiteMatte, b: m.white }
    wall(g, 285, -6, 315, -6, 0, H, w)
    wall(g, 315, -6, 315, 15, 0, H, w)
    wall(g, 285, 15, 285, -6, 0, H, w, [{ at: 15, width: 1.05, height: 2.2 }])
    // Inside face of the glass front: mullions (the glass itself belongs to the façade).
    for (let i = 0; i <= 12; i++) {
      const x = 285.4 + i * 2.43
      if (Math.abs(x - 300) < 1.3) continue
      rbox(0.1, H, 0.12, m.white, x, H / 2, 14.85, g, 0.03)
    }
    const glassIn = mesh(new THREE.PlaneGeometry(30, H), m.facadeGlass, 300, H / 2, 14.82, g)
    glassIn.rotation.y = PI
    glassIn.renderOrder = 2
    // Soft ceiling panels.
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) rbox(2.4, 0.04, 2.4, m.panelLight, 289 + i * 5.5, H - 0.03, -3 + j * 5, g, 0.02)
    // Round columns.
    for (const [x, z] of [
      [292, 6],
      [308, 6],
      [292, -1],
      [308, -1],
    ])
      cyl(0.35, 0.35, H, m.white, x, H / 2, z, g, 32)
    // The lines on the floor (blue, red), slightly emissive; the mark at the split.
    mesh(ribbon(BLUE, 0.22, 0.006), m.lineBlue, 0, 0, 0, g).receiveShadow = true
    mesh(ribbon(RED, 0.22, 0.007), m.lineRed, 0, 0, 0, g).receiveShadow = true
    // Reception desk: curved white, top 1.1, the screen.
    const desk = new THREE.Group()
    desk.position.copy(DESK)
    g.add(desk)
    const front = mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.05, 48, 1, true, -0.8, 1.6), m.white, 0, 0.525, -1.6, desk)
    front.castShadow = true
    const inner = mesh(new THREE.CylinderGeometry(1.92, 1.92, 1.05, 48, 1, true, -0.8, 1.6), m.white, 0, 0.525, -1.6, desk)
    ;(inner.material as THREE.Material).side = THREE.DoubleSide
    const top = mesh(new THREE.RingGeometry(1.88, 2.3, 48, 1, -PI / 2 - 0.82, 1.64), m.white, 0, 1.1, -1.6, desk)
    top.rotation.x = -PI / 2
    const topUnder = mesh(new THREE.RingGeometry(1.88, 2.3, 48, 1, -PI / 2 - 0.82, 1.64), m.white, 0, 1.06, -1.6, desk)
    topUnder.rotation.x = PI / 2
    for (const sx of [-1, 1]) {
      const end = mesh(new THREE.PlaneGeometry(0.3, 1.1), m.white, sx * 2.1 * Math.sin(0.8), 0.55, -1.6 + 2.1 * Math.cos(0.8), desk)
      end.rotation.y = sx * (PI / 2 - 0.8)
      ;(end.material as THREE.Material).side = THREE.DoubleSide
    }
    rbox(3.4, 0.05, 0.5, m.white, 0, 0.76, -0.25, desk, 0.02)
    const scr = new THREE.Group()
    scr.position.set(-0.3, 1.32, -0.25)
    scr.rotation.y = PI + 0.2
    desk.add(scr)
    rbox(0.44, 0.3, 0.03, m.ink, 0, 0, -0.02, scr, 0.01)
    this.reception = canvasPlane(0.4, 0.26, 512, () => {}, { emissive: true })
    scr.add(this.reception.mesh)
    rbox(0.4, 0.02, 0.14, m.ink, 0.25, 0.79, -0.15, desk, 0.005)
    // Coffee machine and the coffee man's cup.
    const cmTable = rbox(1.2, 0.9, 0.55, m.white, COFFEE.x, 0.45, COFFEE.z - 0.15, g, 0.03)
    cmTable.castShadow = true
    const cm = coffeeMachine(m.ink, m.waterGlass, m.soup)
    cm.group.position.set(COFFEE.x, 0.9, COFFEE.z - 0.2)
    cm.group.scale.setScalar(1.3)
    g.add(cm.group)
    cyl(0.04, 0.035, 0.1, m.ceramic, 0, 0.05, 0, this.cup, 16)
    mesh(new THREE.CircleGeometry(0.037, 16), m.soup, 0, 0.095, 0, this.cup).rotation.x = -PI / 2
    g.add(this.cup)
    this.stream = mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.9, 8), m.soup, 0, 0, 0, g)
    this.stream.visible = false
    this.spill = mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshPhysicalMaterial({ color: 0x3a2010, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -3 }), COFFEE.x - 0.1, 0.004, COFFEE.z + 0.5, g)
    this.spill.rotation.x = -PI / 2
    // Waiting area: two rows of wide grey armchairs x 306…312, z 10…12.5.
    for (const z of [10.3, 12.2])
      for (let i = 0; i < 5; i++) {
        const a = new THREE.Group()
        a.position.set(306.6 + i * 1.3, 0, z)
        a.rotation.y = z < 11 ? PI : 0
        g.add(a)
        rbox(1.1, 0.42, 0.8, m.armchair, 0, 0.21, 0, a, 0.08)
        rbox(1.1, 0.5, 0.18, m.armchair, 0, 0.62, -0.32, a, 0.08)
        for (const sx of [-0.5, 0.5]) rbox(0.14, 0.25, 0.8, m.armchair, sx, 0.52, 0, a, 0.06)
      }
    // The form counter with forms and pens.
    rbox(2.2, 1.05, 0.6, m.white, FORMS.x, 0.525, FORMS.z - 0.45, g, 0.03)
    for (let i = 0; i < 4; i++) rbox(0.21, 0.01, 0.29, m.paper, FORMS.x - 0.7 + i * 0.45, 1.06, FORMS.z - 0.45, g, 0.002).rotation.y = 0.1 * i
    // Planters, a camera, a sign to the floors.
    if (models.planter) {
      for (const [x, z] of [
        [289, 14],
        [311, 14],
        [289, -5],
        [295, 2],
      ]) {
        const pl = models.planter.clone(true)
        pl.position.set(x, 0, z)
        g.add(pl)
        for (let k = 0; k < 5; k++) {
          const b = mesh(new THREE.SphereGeometry(0.22, 10, 8), m.leafDark, x - 0.3 + k * 0.15, 0.55, z, g)
          b.scale.y = 0.8
        }
      }
    }
    if (models.camera) {
      models.camera.position.set(314.6, 5.2, 14.2)
      models.camera.rotation.y = -2.4
      g.add(models.camera)
    }
    // Stair door in the west wall: grey steel, small wire-glass window, ajar.
    this.stairDoor = new THREE.Group()
    this.stairDoor.position.set(STAIR_DOOR.x, 0, STAIR_DOOR.z - 0.5)
    g.add(this.stairDoor)
    rbox(0.06, 2.2, 1.0, m.steelDoor, 0, 1.1, 0.5, this.stairDoor, 0.01)
    const wg = mesh(new THREE.PlaneGeometry(0.3, 0.4), m.shelterGlass, 0.035, 1.55, 0.5, this.stairDoor)
    wg.rotation.y = PI / 2
    cyl(0.012, 0.012, 0.14, m.chrome, 0.08, 1.05, 0.88, this.stairDoor, 8).rotation.z = PI / 2
    for (const sz of [-0.56, 0.56]) rbox(0.16, 2.3, 0.1, m.steelDoor, STAIR_DOOR.x - 0.02, 1.15, STAIR_DOOR.z + sz, g, 0.01)
    rbox(0.16, 0.1, 1.22, m.steelDoor, STAIR_DOOR.x - 0.02, 2.25, STAIR_DOOR.z, g, 0.01)
  }

  // ——— The stairwell (x 280…285, z −6…2): one bulb, one flight up to "2" ———

  private buildStairs() {
    const m = this.pal
    const g = this.stairs
    const H = 7.6
    const w = { a: m.concreteStair, b: m.concreteStair }
    const fl = mesh(new THREE.PlaneGeometry(5, 8), m.concreteStair, 282.5, 0.001, -2, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    wall(g, 280, -6, 285, -6, 0, H, w, [{ at: 2.5, width: 1.0, bottom: 4.5, height: 2.1 }])
    wall(g, 284.86, -6, 284.86, 2, 0, H, w, [{ at: 6.0, width: 1.05, height: 2.2 }])
    wall(g, 285, 2, 280, 2, 0, H, w)
    wall(g, 280, 2, 280, -6, 0, H, w)
    const ce = mesh(new THREE.PlaneGeometry(5, 8), m.concreteStair, 282.5, H, -2, g)
    ce.rotation.x = PI / 2
    // The flight: z 1.0 → −4.5, rising to 4.5 (18 steps), 2 m wide, centred x 282.5.
    const steps = 18
    const run = 5.5 / steps
    const rise = 4.5 / steps
    for (let i = 0; i < steps; i++) {
      const s = rbox(2.0, rise, run + 0.02, m.concreteStair, 282.5, rise * (i + 0.5), 1.0 - run * (i + 0.5), g, 0.008)
      s.receiveShadow = true
      s.castShadow = true
      // The red line climbs the middle of every step (tread and riser).
      mesh(new THREE.PlaneGeometry(0.22, run), m.lineRed, 282.5, rise * (i + 1) + 0.004, 1.0 - run * (i + 0.5), g).rotation.x = -PI / 2
      mesh(new THREE.PlaneGeometry(0.22, rise), m.lineRed, 282.5, rise * (i + 0.5), 1.0 - run * i + 0.011, g)
    }
    // Under the flight: a solid mass, so the stair reads as concrete.
    const under = new THREE.Shape()
    under.moveTo(1.0, 0)
    under.lineTo(-4.5, 4.5)
    under.lineTo(-4.5, 0)
    under.closePath()
    const ug = new THREE.ExtrudeGeometry(under, { depth: 2.0, bevelEnabled: false })
    const um = mesh(ug, m.concreteStair, 281.5, 0, 0, g)
    um.rotation.y = -PI / 2
    um.position.set(283.5, 0, 0)
    // Landing at 4.5 (z −4.5…−6), the door "2".
    rbox(5, 0.25, 1.5, m.concreteStair, 282.5, 4.375, -5.25, g, 0.01)
    mesh(new THREE.PlaneGeometry(0.22, 1.5), m.lineRed, 282.5, 4.505, -5.25, g).rotation.x = -PI / 2
    // Red line on the ground floor from the hall door to the foot of the flight.
    mesh(ribbon([[285.0, 0.0], [283.2, 0.0], [282.8, 0.25], [282.5, 0.7], [282.5, 1.02]], 0.22, 0.006), m.lineRed, 0, 0, 0, g)
    const d2 = new THREE.Group()
    d2.position.set(DOOR2.x, DOOR2.y, DOOR2.z + 0.06)
    g.add(d2)
    rbox(1.0, 2.1, 0.06, m.steelDoor, 0, 1.05, 0, d2, 0.01)
    const sign2 = canvasPlane(0.3, 0.3, 128, (c, W, H2) => {
      c.fillStyle = '#e9ebee'
      c.fillRect(0, 0, W, H2)
      c.fillStyle = '#e8322f'
      c.font = `700 ${Math.round(H2 * 0.75)}px sans-serif`
      c.textAlign = 'center'
      c.fillText('2', W / 2, H2 * 0.8)
    })
    sign2.mesh.position.set(0, 1.6, 0.035)
    d2.add(sign2.mesh)
    cyl(0.012, 0.012, 0.14, m.chrome, 0.38, 1.0, 0.08, d2, 8).rotation.x = PI / 2
    // Rail.
    for (let i = 0; i < 6; i++) cyl(0.015, 0.015, 0.95, m.steelDoor, 283.45, rise * (i * 3 + 1) + 0.47, 1.0 - run * (i * 3 + 0.5), g, 8)
    const rail = mesh(new THREE.CylinderGeometry(0.02, 0.02, Math.hypot(5.5, 4.5), 8), m.steelDoor, 283.45, 2.25 + 0.95, -1.75, g)
    rail.rotation.x = -Math.atan2(5.5, 4.5)
    // One bare bulb on a cord.
    cyl(0.004, 0.004, 1.2, m.ink, 282.0, H - 0.6, -0.5, g, 6)
    this.bulb = mesh(new THREE.SphereGeometry(0.05, 12, 10), m.bulb, 282.0, H - 1.25, -0.5, g)
  }

  // ——— H. The small room on the third floor (x 597…603, z −3…3) ———

  private buildSmallRoom() {
    const m = this.pal
    const g = this.small
    const H = 2.7
    const fl = mesh(new THREE.PlaneGeometry(6, 6), m.floorWood, 600, 0, 0, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const ce = mesh(new THREE.PlaneGeometry(6, 6), m.softWhite, 600, H, 0, g)
    ce.rotation.x = PI / 2
    const w = { a: m.softWhite, b: m.softWhite }
    wall(g, 597, -3, 603, -3, 0, H, w)
    wall(g, 603, -3, 603, 3, 0, H, w, [{ at: 4.6, width: 0.95, height: 2.1 }])
    wall(g, 603, 3, 597, 3, 0, H, w)
    wall(g, 597, 3, 597, -3, 0, H, w, [{ at: 3.0, width: 1.6, bottom: 0.9, height: 1.3 }])
    const wf = new THREE.Group()
    wf.position.set(597, 0.9, 0)
    wf.rotation.y = -PI / 2
    g.add(wf)
    windowIn(wf, { w: 1.6, h: 1.3, trim: m.trimWhite, glass: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.52, 1.5) }), r: 0.03 })
    // Door in the east wall (603, 0, 1.6): it opens.
    this.smallDoor = new THREE.Group()
    this.smallDoor.position.set(603, 0, 1.6 + 0.47)
    g.add(this.smallDoor)
    rbox(0.05, 2.08, 0.94, m.trimWhite, 0, 1.04, -0.47, this.smallDoor, 0.02)
    cyl(0.012, 0.012, 0.12, m.chrome, -0.07, 1.0, -0.85, this.smallDoor, 8).rotation.z = PI / 2
    // Chairs, the small table with water and lilies.
    const c1 = chair(m.white, m.armchair)
    c1.position.set(600, 0, 0.8)
    c1.rotation.y = PI
    g.add(c1)
    const c2 = chair(m.white, m.armchair)
    c2.position.set(600, 0, -1.2)
    g.add(c2)
    rbox(0.8, 0.04, 0.6, m.white, 600, 0.7, -0.2, g, 0.03)
    for (const [dx, dz] of [
      [-0.35, -0.25],
      [0.35, -0.25],
      [-0.35, 0.25],
      [0.35, 0.25],
    ])
      cyl(0.02, 0.018, 0.68, m.white, 600 + dx, 0.34, -0.2 + dz, g, 10)
    mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 20), m.waterGlass, 599.8, 0.78, -0.1, g).renderOrder = 3
    mesh(new THREE.CylinderGeometry(0.031, 0.027, 0.09, 20), m.water, 599.8, 0.765, -0.1, g)
    mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.24, 20), m.vase, 600.2, 0.84, -0.3, g).renderOrder = 3
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2
      cyl(0.004, 0.004, 0.3, m.stem, 600.2 + Math.cos(a) * 0.03, 1.05, -0.3 + Math.sin(a) * 0.03, g, 5).rotation.set(Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2)
      const lily = mesh(new THREE.ConeGeometry(0.045, 0.09, 6, 1, true), m.lily, 600.2 + Math.cos(a) * 0.07, 1.22, -0.3 + Math.sin(a) * 0.07, g)
      lily.rotation.x = PI
      ;(lily.material as THREE.Material).side = THREE.DoubleSide
    }
    // The wall clock on the north wall: 11.40.
    this.clock = wallClock(m.trimWhite, new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.6 }), m.ink)
    this.clock.group.position.set(600, 2.05, -2.97)
    this.clock.set(11 + 40 / 60)
    g.add(this.clock.group)
    // The form: on her knee, then in his hands.
    this.formOnKnee = canvasPlane(0.21, 0.297, 256, () => {})
    this.formHanded = canvasPlane(0.21, 0.297, 256, () => {})
    g.add(this.formOnKnee.mesh, this.formHanded.mesh)
    // A soft panel light.
    rbox(1.2, 0.03, 1.2, m.panelLight, 600, H - 0.02, 0, g, 0.02)
  }
}
