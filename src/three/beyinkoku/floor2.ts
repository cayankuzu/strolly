/**
 * F. The Centre's second floor (x ≈ 400): a long white corridor along −z
 * (x 398.5…401.5, z +6…−34) with calming posters, a side room that hums, and
 * at the far end a locked steel stair door and three kiosks.
 */
import * as THREE from 'three'
import { canvasPlane, rbox } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { ribbon } from './centre'
import { wall } from './parts'

const PI = Math.PI

export const POSTERS: Array<{ x: number; z: number; side: 1 | -1 }> = [
  { x: 398.55, z: 0, side: 1 },
  { x: 401.45, z: -3, side: -1 },
  { x: 398.55, z: -6, side: 1 },
  { x: 401.45, z: -9, side: -1 },
  { x: 401.45, z: 4.5, side: -1 },
]
export const KIOSKS = [-29, -30.5, -32]

export class Floor2 {
  readonly group = new THREE.Group()
  posters: Array<ReturnType<typeof canvasPlane>> = []
  kiosks: Array<ReturnType<typeof canvasPlane>> = []
  panels: THREE.Mesh[] = []
  endDoor!: THREE.Group
  staffDoor!: THREE.Group
  sideDoor!: THREE.Group
  roomDoor!: THREE.Group
  panelOn: THREE.Material
  panelOff: THREE.Material

  constructor(private pal: Pal) {
    this.panelOn = pal.panelLight
    this.panelOff = new THREE.MeshStandardMaterial({ color: 0x9a9da0, roughness: 0.6 })
  }

  build(scene: THREE.Scene, camera: THREE.Group | null) {
    const m = this.pal
    const g = this.group
    scene.add(g)
    const H = 3.0
    const fl = mesh(new THREE.PlaneGeometry(3, 40), m.corridorFloor, 400, 0, -14, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const ce = mesh(new THREE.PlaneGeometry(3, 40), m.whiteMatte, 400, H, -14, g)
    ce.rotation.x = PI / 2
    const w = { a: m.whiteMatte, b: m.whiteMatte }
    // West wall (door to the side room at z −2), east wall (doors at z −20 and −27), ends.
    wall(g, 398.5, 6, 398.5, -34, 0, H, w, [{ at: 8, width: 0.95, height: 2.1 }])
    wall(g, 401.5, -34, 401.5, 6, 0, H, w, [
      { at: 7, width: 1.0, height: 2.15 },
      { at: 14, width: 1.0, height: 2.15 },
    ])
    wall(g, 401.5, 6, 398.5, 6, 0, H, w, [{ at: 1.5, width: 1.0, height: 2.15 }])
    wall(g, 398.5, -34, 401.5, -34, 0, H, w, [{ at: 1.5, width: 1.05, height: 2.2 }])
    // A pale band along the walls at handrail height.
    for (const x of [398.57, 401.43]) {
      const band = rbox(0.03, 0.12, 39.6, m.kiosk, x, 0.95, -14, g, 0.01)
      band.receiveShadow = true
    }
    // Fluorescent panels every 3 m.
    for (let z = 4.5; z > -34; z -= 3) {
      rbox(0.65, 0.05, 1.3, m.kiosk, 400, H - 0.025, z, g, 0.01)
      const p = mesh(new THREE.PlaneGeometry(0.55, 1.2), this.panelOn, 400, H - 0.052, z, g)
      p.rotation.x = PI / 2
      this.panels.push(p)
    }
    // The red line along x 400 to the far door.
    mesh(ribbon([[400, 6], [400, -34.05]], 0.22, 0.005), m.lineRed, 0, 0, 0, g)
    // Posters: framed, 0.9 × 1.2, centre y 1.6.
    for (const p of POSTERS) {
      const f = new THREE.Group()
      f.position.set(p.x, 1.6, p.z)
      f.rotation.y = p.side > 0 ? PI / 2 : -PI / 2
      g.add(f)
      rbox(0.96, 1.26, 0.03, m.steelDoor, 0, 0, -0.01, f, 0.01)
      const c = canvasPlane(0.9, 1.2, 512, () => {})
      c.mesh.position.z = 0.008
      f.add(c.mesh)
      this.posters.push(c)
    }
    // Doors: entry (z +6), staff (east, z −20 and −27), far stair door (locked).
    const steelDoor = (x: number, z: number, ry: number, w2 = 1.0) => {
      const d = new THREE.Group()
      d.position.set(x, 0, z)
      d.rotation.y = ry
      g.add(d)
      const leaf = new THREE.Group()
      leaf.position.x = -w2 / 2
      d.add(leaf)
      rbox(w2 - 0.01, 2.12, 0.05, m.steelDoor, w2 / 2, 1.06, 0, leaf, 0.008)
      cyl(0.012, 0.012, 0.14, m.chrome, w2 - 0.1, 1.02, 0.05, leaf, 8).rotation.x = PI / 2
      cyl(0.012, 0.012, 0.14, m.chrome, w2 - 0.1, 1.02, -0.05, leaf, 8).rotation.x = PI / 2
      for (const sx of [-1, 1]) rbox(0.06, 2.2, 0.16, m.kiosk, sx * (w2 / 2 + 0.03), 1.1, 0, d, 0.01)
      rbox(w2 + 0.12, 0.06, 0.16, m.kiosk, 0, 2.2, 0, d, 0.01)
      return leaf
    }
    this.sideDoor = steelDoor(400, 6, 0)
    this.staffDoor = steelDoor(401.5, -20, -PI / 2)
    steelDoor(401.5, -27, -PI / 2)
    this.endDoor = steelDoor(400, -34, 0, 1.05)
    // A wire-glass window in the far door, the exit sign above.
    const wg = mesh(new THREE.PlaneGeometry(0.3, 0.45), m.shelterGlass, 0.52, 1.6, 0.03, this.endDoor)
    wg.renderOrder = 2
    rbox(0.5, 0.18, 0.06, m.statusOff, 400, 2.55, -33.9, g, 0.02)
    // The three kiosks along the west wall, facing +x.
    const labels = ['PERSONEL ONAYI', 'PERDE UYUM ÖLÇÜMÜ', 'HAFIZA EŞLEME KAYDI']
    KIOSKS.forEach((z, i) => {
      const k = new THREE.Group()
      k.position.set(398.9, 0, z)
      k.rotation.y = PI / 2
      g.add(k)
      rbox(0.5, 1.2, 0.35, m.kiosk, 0, 0.6, 0, k, 0.04)
      const head = new THREE.Group()
      head.position.set(0, 1.3, 0.02)
      head.rotation.x = -0.45
      k.add(head)
      rbox(0.5, 0.38, 0.08, m.kiosk, 0, 0, -0.03, head, 0.03)
      const c = canvasPlane(0.4, 0.3, 512, () => {}, { emissive: true })
      c.mesh.position.z = 0.013
      head.add(c.mesh)
      this.kiosks.push(c)
      const lab = canvasPlane(0.5, 0.08, 256, (cx, W, H2) => {
        cx.fillStyle = '#2b3440'
        cx.fillRect(0, 0, W, H2)
        cx.fillStyle = '#e9eef3'
        cx.font = `700 ${Math.round(H2 * 0.5)}px sans-serif`
        cx.fillText(labels[i], W * 0.04, H2 * 0.68)
      })
      lab.mesh.position.set(0, 1.62, -0.06)
      k.add(lab.mesh)
    })
    // The side room (x 393.5…398.5, z −5…+1): four plastic chairs, four black speakers.
    const room = new THREE.Group()
    g.add(room)
    const rf = mesh(new THREE.PlaneGeometry(5, 6), m.corridorFloor, 396, 0.001, -2, room)
    rf.rotation.x = -PI / 2
    rf.receiveShadow = true
    const rc = mesh(new THREE.PlaneGeometry(5, 6), m.whiteMatte, 396, H, -2, room)
    rc.rotation.x = PI / 2
    wall(room, 393.5, -5, 398.38, -5, 0, H, w)
    wall(room, 398.38, 1, 393.5, 1, 0, H, w)
    wall(room, 393.5, 1, 393.5, -5, 0, H, w)
    for (const [x, z, ry] of [
      [394.4, -3.4, PI / 2],
      [394.4, -2.3, PI / 2],
      [394.4, -1.2, PI / 2],
      [395.8, -4.3, 0],
    ] as const) {
      const c = new THREE.Group()
      c.position.set(x, 0, z)
      c.rotation.y = ry
      room.add(c)
      rbox(0.44, 0.04, 0.42, m.plasticChair, 0, 0.45, 0, c, 0.02)
      rbox(0.42, 0.36, 0.035, m.plasticChair, 0, 0.7, -0.2, c, 0.02).rotation.x = -0.1
      for (const sx of [-0.19, 0.19]) for (const sz of [-0.18, 0.18]) cyl(0.012, 0.012, 0.45, m.chrome, sx, 0.225, sz, c, 6)
    }
    for (const [x, z] of [
      [393.75, -4.75],
      [398.2, -4.75],
      [393.75, 0.75],
      [398.2, 0.75],
    ]) {
      const sp = rbox(0.3, 0.42, 0.26, m.speaker, x, 2.45, z, room, 0.02)
      sp.rotation.y = Math.atan2(396 - x, -2 - z)
      const cone = mesh(new THREE.CircleGeometry(0.09, 20), m.ink, 0, -0.04, 0.131, sp)
      cone.castShadow = false
    }
    rbox(0.5, 0.03, 0.5, m.panelLight, 396, H - 0.02, -2, room, 0.01)
    // The side room's door (in the west corridor wall at z −2), hinge at its north edge.
    this.roomDoor = new THREE.Group()
    this.roomDoor.position.set(398.5, 0, -2.47)
    room.add(this.roomDoor)
    rbox(0.05, 2.08, 0.93, m.steelDoor, 0, 1.04, 0.47, this.roomDoor, 0.008)
    cyl(0.012, 0.012, 0.14, m.chrome, 0.06, 1.02, 0.84, this.roomDoor, 8).rotation.z = PI / 2
    cyl(0.012, 0.012, 0.14, m.chrome, -0.06, 1.02, 0.84, this.roomDoor, 8).rotation.z = PI / 2
    if (camera) {
      camera.position.set(401.3, 2.75, -12)
      camera.rotation.y = -PI / 2 - 0.5
      g.add(camera)
    }
  }

  /** Fluorescents: 1 on … 0 off, per panel (stutter is the director's). */
  light(on: (i: number) => boolean) {
    this.panels.forEach((p, i) => (p.material = on(i) ? this.panelOn : this.panelOff))
  }

  dispose() {
    this.panelOff.dispose()
  }
}
