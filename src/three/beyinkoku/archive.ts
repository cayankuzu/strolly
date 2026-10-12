/**
 * D. The archive building (x ≈ 200): the basement office where Levy repairs
 * old file names, and the cantina next door with its big window onto a sunny
 * courtyard where nothing ever happens.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { canvasPlane, chair, officeChair, rbox } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { roundTrees, wall, windowIn } from './parts'

const PI = Math.PI

/** Cantina tables: [x, z]; the last is Levy's. */
export const TABLES: Array<[number, number]> = [
  [207, -7],
  [209, -5],
  [212.5, -5],
  [209, -1.5],
  [212.5, -1.5],
  [213.5, 1],
  [210.8, -3.3],
]
export const LEVY_TABLE = TABLES[6]

export class Archive {
  readonly office = new THREE.Group()
  readonly cantina = new THREE.Group()
  monitor!: ReturnType<typeof canvasPlane>
  levyChair!: THREE.Group
  spoonLevy = new THREE.Group()
  spoonKadin = new THREE.Group()
  private dummy = new THREE.Object3D()

  constructor(private pal: Pal) {}

  build(scene: THREE.Scene, lamp: THREE.Group | null, tv: THREE.Group | null) {
    scene.add(this.office, this.cantina)
    this.buildOffice()
    this.buildCantina(lamp, tv)
  }

  private buildOffice() {
    const m = this.pal
    const g = this.office
    const H = 2.6
    const fl = mesh(new THREE.PlaneGeometry(14, 12), m.officeFloor, 197, 0, -4, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const ce = mesh(new THREE.PlaneGeometry(14, 12), m.officeWall, 197, H, -4, g)
    ce.rotation.x = PI / 2
    const w = { a: m.officeWall, b: m.officeWall }
    // North wall with its narrow high windows onto the street.
    wall(g, 190, -10, 204, -10, 0, H, w, [1.5, 4.5, 7.5, 10.5, 13].map((at) => ({ at, width: 1.6, bottom: 2.0, height: 0.45 })))
    wall(g, 204, -10, 204, 2, 0, H, w, [{ at: 9.5, width: 1.0, height: 2.1 }])
    wall(g, 204, 2, 190, 2, 0, H, w)
    wall(g, 190, 2, 190, -10, 0, H, w)
    for (const at of [1.5, 4.5, 7.5, 10.5, 13]) {
      const f = new THREE.Group()
      f.position.set(190 + at, 2.0, -10)
      g.add(f)
      windowIn(f, { w: 1.6, h: 0.45, trim: m.shelfSteel, glass: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.62, 1.55) }), muntin: false, sill: false, depth: 0.14 })
    }
    // Fluorescent strips.
    for (let i = 0; i < 4; i++) for (const z of [-7, -2]) rbox(1.2, 0.04, 0.16, m.panelLight, 192 + i * 3.4, H - 0.03, z, g, 0.01)
    // Steel shelving rows x 190…196 with file boxes (instanced).
    const rand = mulberry32(3)
    const boxGeo = new THREE.BoxGeometry(0.32, 0.26, 0.38)
    const boxesA = new THREE.InstancedMesh(boxGeo, m.fileBox, 400)
    const boxesB = new THREE.InstancedMesh(boxGeo, m.fileBoxB, 400)
    let na = 0
    let nb = 0
    for (const z of [-8.6, -6.6, -4.6, -2.6, -0.6]) {
      for (const x of [191.2, 194.6]) {
        const s = new THREE.Group()
        s.position.set(x, 0, z)
        g.add(s)
        for (const sx of [-1.25, 0, 1.25]) for (const sz of [-0.25, 0.25]) rbox(0.04, 2.3, 0.04, m.shelfSteel, sx, 1.15, sz, s, 0.006)
        for (let k = 0; k < 6; k++) {
          rbox(2.55, 0.025, 0.55, m.shelfSteel, 0, 0.12 + k * 0.4, 0, s, 0.006)
          if (k === 5) continue
          for (let i = 0; i < 7; i++) {
            if (rand() < 0.12) continue
            this.dummy.position.set(x - 1.08 + i * 0.36, 0.26 + k * 0.4, z + (rand() - 0.5) * 0.04)
            this.dummy.rotation.set(0, (rand() - 0.5) * 0.08, 0)
            this.dummy.updateMatrix()
            if (rand() < 0.65) boxesA.setMatrixAt(na++, this.dummy.matrix)
            else boxesB.setMatrixAt(nb++, this.dummy.matrix)
          }
        }
      }
    }
    boxesA.count = na
    boxesB.count = nb
    for (const b of [boxesA, boxesB]) {
      b.castShadow = true
      b.receiveShadow = true
      g.add(b)
    }
    // Desks x 197…203: two rows; Levy's (200, −3.0) facing −z.
    const desks: Array<[number, number]> = [
      [198, -3.0],
      [200, -3.0],
      [202.2, -3.0],
      [198, -6.5],
      [200, -6.5],
      [202.2, -6.5],
    ]
    for (const [x, z] of desks) {
      rbox(1.5, 0.035, 0.75, m.deskOffice, x, 0.74, z, g, 0.012)
      rbox(0.04, 0.72, 0.68, m.shelfSteel, x - 0.72, 0.36, z, g, 0.006)
      rbox(0.42, 0.72, 0.68, m.shelfSteel, x + 0.52, 0.36, z, g, 0.006)
      // Beige monitors, a little old-fashioned (a deep back).
      rbox(0.56, 0.44, 0.06, m.beige, x, 1.15, z - 0.4, g, 0.02)
      rbox(0.42, 0.34, 0.3, m.beige, x, 1.13, z - 0.58, g, 0.03)
      rbox(0.18, 0.2, 0.16, m.beige, x, 0.85, z - 0.45, g, 0.02)
      rbox(0.44, 0.02, 0.15, m.beige, x, 0.765, z + 0.02, g, 0.006)
      if (x !== 200 || z !== -3.0) {
        const sc = mesh(new THREE.PlaneGeometry(0.5, 0.38), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.82, 0.86) }), x, 1.15, z - 0.367, g)
        sc.userData.noAO = true
        const c = officeChair(m.shelfSteel, m.shelfSteel)
        c.position.set(x, 0, z + 0.65)
        c.rotation.y = PI
        g.add(c)
      }
      // Paper stacks.
      rbox(0.24, 0.05 + rand() * 0.05, 0.32, m.paper, x - 0.5, 0.78, z + 0.05, g, 0.004)
    }
    this.monitor = canvasPlane(0.5, 0.38, 512, () => {}, { emissive: true })
    this.monitor.mesh.position.set(200, 1.15, -3.367)
    g.add(this.monitor.mesh)
    this.levyChair = officeChair(m.shelfSteel, m.shelfSteel)
    this.levyChair.position.set(200, 0, -2.38)
    this.levyChair.rotation.y = PI
    g.add(this.levyChair)
  }

  private buildCantina(lamp: THREE.Group | null, tv: THREE.Group | null) {
    const m = this.pal
    const g = this.cantina
    const H = 3.0
    const fl = mesh(new THREE.PlaneGeometry(10, 10), m.cantinaFloor, 211, 0, -3, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const ce = mesh(new THREE.PlaneGeometry(10, 10), m.whiteWall, 211, H, -3, g)
    ce.rotation.x = PI / 2
    const w = { a: m.creamWarm, b: m.creamWarm }
    wall(g, 206, -8, 216, -8, 0, H, w)
    // The big window: x 216, z −6…−0.5, y 0.9…2.7.
    wall(g, 216, -8, 216, 2, 0, H, w, [{ at: 4.75, width: 5.5, bottom: 0.9, height: 1.8 }])
    wall(g, 216, 2, 206, 2, 0, H, w, [{ at: 8.5, width: 1.2, height: 2.2 }])
    wall(g, 206, 2, 206, -8, 0, H, w, [{ at: 5, width: 2.0, height: 2.2 }])
    const f = new THREE.Group()
    f.position.set(216, 0.9, -3.25)
    f.rotation.y = PI / 2
    g.add(f)
    windowIn(f, { w: 5.5, h: 1.8, trim: m.trimWhite, glass: m.waterGlass, muntin: false, depth: 0.2, r: 0.03 })
    for (const dz of [-1.83, 0, 1.83]) rbox(0.06, 1.8, 0.08, m.trimWhite, 216, 1.8, -3.25 + dz, g, 0.015)
    // Small reversed text on the glass, readable from the courtyard: the wave is a test.
    const cal = canvasPlane(0.6, 0.06, 512, (c, W, H2) => {
      c.clearRect(0, 0, W, H2)
      c.save()
      c.translate(W, 0)
      c.scale(-1, 1)
      c.fillStyle = 'rgba(30,40,50,0.75)'
      c.font = `600 ${Math.round(H2 * 0.62)}px monospace`
      c.fillText('DİKKAT KALİBRASYONU · 12.40', 6, H2 * 0.74)
      c.restore()
    }, { transparent: true })
    cal.mesh.position.set(215.95, 2.5, -0.8)
    cal.mesh.rotation.y = -PI / 2
    g.add(cal.mesh)
    // Ceiling panels, a counter on the west wall with trays.
    for (let i = 0; i < 3; i++) for (const z of [-6, -3, 0]) rbox(0.9, 0.03, 0.9, m.panelLight, 208 + i * 3, H - 0.02, z, g, 0.01)
    rbox(0.8, 0.95, 4.5, m.counter, 206.5, 0.475, -4.2, g, 0.03)
    for (let i = 0; i < 6; i++) rbox(0.35, 0.02, 0.45, m.tray, 206.55, 0.97 + i * 0.022, -2.4, g, 0.01)
    if (tv) {
      tv.position.set(206.4, 2.1, -6.6)
      tv.rotation.y = PI / 2 + 0.3
      g.add(tv)
      rbox(0.5, 0.03, 0.4, m.shelfSteel, 206.32, 2.08, -6.6, g, 0.005)
    }
    // Round tables with two or three chairs; soup bowls.
    TABLES.forEach(([x, z], ti) => {
      cyl(0.5, 0.5, 0.035, m.tableTop, x, 0.74, z, g, 40)
      cyl(0.045, 0.05, 0.72, m.chrome, x, 0.36, z, g, 12)
      cyl(0.28, 0.3, 0.025, m.chrome, x, 0.013, z, g, 28)
      for (const s of [-1, 1]) {
        const c = chair(m.deskWood, m.deskWood)
        c.position.set(x, 0, z + s * 0.62)
        c.rotation.y = s > 0 ? PI : 0
        g.add(c)
        // A bowl of soup on a tray in front of each seat.
        rbox(0.36, 0.015, 0.28, m.tray, x, 0.765, z + s * 0.24, g, 0.006)
        const bowl = mesh(
          new THREE.LatheGeometry(
            [
              [0, 0],
              [0.05, 0],
              [0.075, 0.05],
              [0.072, 0.052],
              [0.0, 0.03],
            ].map(([r, y]) => new THREE.Vector2(r, y)),
            24,
          ),
          m.ceramic,
          x - 0.04,
          0.773,
          z + s * 0.22,
          g,
        )
        bowl.castShadow = true
        mesh(new THREE.CircleGeometry(0.066, 24), m.soup, x - 0.04, 0.817, z + s * 0.22, g).rotation.x = -PI / 2
      }
      if (ti === 0 || ti === 3) {
        const c = chair(m.deskWood, m.deskWood)
        c.position.set(x - 0.62, 0, z)
        c.rotation.y = PI / 2
        g.add(c)
      }
    })
    // Spoons (held by the director).
    for (const s of [this.spoonLevy, this.spoonKadin]) {
      cyl(0.004, 0.004, 0.14, m.chrome, 0, -0.07, 0, s, 6)
      const head = mesh(new THREE.SphereGeometry(0.018, 10, 6), m.chrome, 0, -0.15, 0, s)
      head.scale.set(1, 1.4, 0.4)
      g.add(s)
    }
    // The courtyard: lawn, one lamppost, one bench, a white wall; nothing happens there.
    const lawn = mesh(new THREE.PlaneGeometry(14, 16), m.lawn, 223, -0.01, -3, g)
    lawn.rotation.x = -PI / 2
    lawn.receiveShadow = true
    rbox(0.3, 3.2, 16, m.whiteWall, 229.5, 1.6, -3, g, 0.03)
    rbox(13.5, 3.2, 0.3, m.whiteWall, 223, 1.6, -11, g, 0.03)
    rbox(13.5, 3.2, 0.3, m.whiteWall, 223, 1.6, 5, g, 0.03)
    const path = mesh(new THREE.PlaneGeometry(1.2, 13), m.sidewalk, 221.5, 0.0, -3, g)
    path.rotation.x = -PI / 2
    if (lamp) {
      lamp.position.set(220.5, 0, -1.2)
      lamp.rotation.y = -PI / 2
      g.add(lamp)
    }
    const bench = new THREE.Group()
    bench.position.set(224, 0, -4.5)
    bench.rotation.y = -PI / 2
    g.add(bench)
    for (const z of [-0.12, 0, 0.12]) rbox(1.8, 0.035, 0.1, m.deskWood, 0, 0.45, z, bench, 0.01)
    for (const x of [-0.75, 0.75]) rbox(0.05, 0.45, 0.38, m.ink, x, 0.22, 0, bench, 0.01)
    roundTrees(g, [[226.5, 1.5, 0.9]], m.leaf, m.bark, 2)
    const sky = mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.78, 0.9, 1.0) }), 235, 8, -3, g)
    sky.rotation.y = -PI / 2
  }
}
