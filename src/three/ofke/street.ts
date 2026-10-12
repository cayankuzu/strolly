/**
 * Set C — the street at dusk beside the office tower, and the drive. The
 * street runs along z (one way, toward −z): the tower's side exit at
 * (80, 0, 4), sidewalk x 78.5…81, parking lane, road to x 88, the far
 * sidewalk and blocks beyond. Arif's car is parked at (82.2, 0, 2), nose −z;
 * during the drive the whole car moves down the street. The billboard stands
 * at (90, 6, −60).
 *
 * The car is the kit's body with an interior of its own (dash, the touch
 * screen, wheel, seats, door cards, roof liner), so the camera can sit in it.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { canvasPlane, car, facade, rbox, std, streetLamp } from '../kit/props'
import { pbr } from '../kit/surfaces'
import * as S from './screens'

const PI = Math.PI
export const CAR = { x: 82.2, z: 2 }

export function duskSky() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 512
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#1d1f3c')
  grad.addColorStop(0.3, '#3e3560')
  grad.addColorStop(0.44, '#8a5a78')
  grad.addColorStop(0.5, '#e0905a')
  grad.addColorStop(0.53, '#f0b070')
  grad.addColorStop(1, '#2a2430')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export type CarRig = {
  root: THREE.Group
  door: THREE.Group
  screen: ReturnType<typeof canvasPlane>
  wheel: THREE.Group
  card: THREE.Mesh
  lights: THREE.MeshBasicMaterial
  tail: THREE.MeshBasicMaterial
  /** The kit's solid body shell; hidden for shots inside the car (its top would cut the cabin). */
  shell: THREE.Object3D
  /** Hood, deck and sills seen from inside (shown when the shell is hidden). */
  inner: THREE.Group
}

/** Arif's car: dark grey, nose toward +z in its own frame (the set turns it), with an interior. */
export function arifCar(): CarRig {
  const root = new THREE.Group()
  const body = pbr('painted', 0x3b4652, { roughness: 0.32, metalness: 0.55 })
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x1a2229, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.3, depthWrite: false })
  const tire = pbr('rubber', 0x121314)
  const lights = new THREE.MeshBasicMaterial({ color: 0xfff1d6 })
  const kit = car(body, glass, tire, lights)
  root.add(kit)
  const shell = kit.children.find((o) => (o as THREE.Mesh).isMesh) as THREE.Mesh
  shell.name = 'carShell'
  // What the shell gives from outside, rebuilt thin for the shots inside: hood, rear deck, sills, a cowl.
  const inner = new THREE.Group()
  inner.visible = false
  root.add(inner)
  const hood = rbox(1.62, 0.04, 0.95, body, 0, 0.93, 1.55, inner, 0.02)
  hood.rotation.x = 0.16
  rbox(1.62, 0.05, 0.7, body, 0, 0.97, -1.72, inner, 0.02)
  for (const sx of [-1, 1]) rbox(0.06, 0.66, 3.6, body, sx * 0.86, 0.66, 0, inner, 0.02)
  rbox(1.62, 0.66, 0.06, body, 0, 0.66, 2.0, inner, 0.02)
  // Its own tail lights, so they can glow without touching the kit's shared material.
  const tail = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.02, 0.02) })
  for (const sx of [-1, 1]) rbox(0.3, 0.12, 0.02, tail, sx * 0.62, 0.86, -2.07, root, 0.02)
  // Interior.
  const dash = pbr('plastic', 0x23262a, { roughness: 0.7 })
  const dashSoft = pbr('leather', 0x2c2f33, { roughness: 0.7 })
  const seat = pbr('fabric', 0x34383e, { roughness: 1 })
  const liner = pbr('fabric', 0x8d8a84, { roughness: 1 })
  const card = pbr('plastic', 0x2a2d31, { roughness: 0.8 })
  // Floor, door cards, roof liner.
  box(1.56, 0.04, 2.6, std(0x1d1f22, 1), 0, 0.32, -0.3, root)
  for (const sx of [-1, 1]) {
    rbox(0.04, 0.62, 2.7, card, sx * 0.79, 0.68, -0.35, root, 0.01)
    rbox(0.06, 0.04, 2.6, dashSoft, sx * 0.76, 0.98, -0.35, root, 0.01)
  }
  rbox(1.42, 0.02, 2.0, liner, 0, 1.385, -0.05, root, 0.01)
  // Pillars seen from inside.
  for (const sx of [-1, 1]) {
    const a = rbox(0.06, 0.55, 0.06, dash, sx * 0.7, 1.2, 1.0, root, 0.01)
    a.rotation.x = -0.95
    rbox(0.07, 0.42, 0.12, card, sx * 0.72, 1.18, -0.75, root, 0.01)
  }
  // The dashboard and its touch screen.
  const d = new THREE.Group()
  root.add(d)
  rbox(1.5, 0.22, 0.6, dash, 0, 0.83, 0.92, d, 0.04)
  const top = rbox(1.5, 0.05, 0.62, dashSoft, 0, 0.955, 0.88, d, 0.02)
  top.rotation.x = 0.12
  rbox(0.3, 0.42, 0.5, dash, 0, 0.55, 0.62, d, 0.03)
  rbox(0.22, 0.05, 0.4, dash, 0, 0.6, 0.15, d, 0.02)
  const screenHolder = new THREE.Group()
  screenHolder.position.set(-0.04, 1.07, 0.62)
  screenHolder.rotation.set(-0.12, -0.3, 0)
  rbox(0.05, 0.08, 0.05, dash, -0.04, 1.0, 0.66, root, 0.01)
  root.add(screenHolder)
  rbox(0.29, 0.19, 0.025, std(0x0b0c0d, 0.3), 0, 0, -0.014, screenHolder, 0.008)
  const screen = canvasPlane(0.26, 0.16, 512, (c, W, H) => S.route(c, W, H, 0, 0), { emissive: true })
  screen.mesh.rotation.y = PI
  screen.mesh.position.z = -0.0275
  screenHolder.add(screen.mesh)
  // The radio's dark display.
  rbox(0.16, 0.04, 0.01, std(0x050506, 0.2), -0.05, 0.84, 0.62, root, 0.004)
  // Instrument cluster and the wheel in front of the driver (+x in this frame is the driver's side? no: −x; see below).
  const wheel = new THREE.Group()
  wheel.position.set(0.4, 0.95, 0.32)
  wheel.rotation.x = 0.43
  root.add(wheel)
  const rim = mesh(new THREE.TorusGeometry(0.18, 0.016, 10, 36), dashSoft, 0, 0, 0, wheel)
  rim.castShadow = true
  rbox(0.1, 0.1, 0.05, dash, 0, 0, 0, wheel, 0.02)
  for (const a of [0, 2.1, -2.1]) {
    const sp = rbox(0.17, 0.025, 0.015, dash, Math.cos(a - PI / 2) * 0.085, Math.sin(a - PI / 2) * 0.085, 0, wheel, 0.006)
    sp.rotation.z = a - PI / 2
  }
  cyl(0.03, 0.03, 0.3, dash, 0.4, 0.86, 0.47, root, 12).rotation.x = -1.15
  rbox(0.32, 0.12, 0.04, std(0x0a0b0c, 0.3), 0.4, 1.0, 0.62, root, 0.02).rotation.x = -0.3
  // Seats (facing +z).
  for (const sx of [-1, 1]) {
    const s = new THREE.Group()
    s.position.set(sx * 0.4, 0, -0.25)
    root.add(s)
    rbox(0.5, 0.12, 0.52, seat, 0, 0.44, 0.05, s, 0.05)
    const back = rbox(0.5, 0.66, 0.12, seat, 0, 0.8, -0.24, s, 0.05)
    back.rotation.x = -0.22
    rbox(0.26, 0.18, 0.1, seat, 0, 1.22, -0.33, s, 0.04).rotation.x = -0.2
  }
  rbox(1.4, 0.4, 0.5, seat, 0, 0.5, -1.25, root, 0.06)
  rbox(1.4, 0.55, 0.14, seat, 0, 0.85, -1.5, root, 0.06).rotation.x = -0.15
  // The membership card on the passenger seat.
  const cardMesh = canvasPlane(0.0856, 0.054, 256, S.memberCard)
  cardMesh.mesh.rotation.set(-PI / 2, 0, 0.5)
  cardMesh.mesh.position.set(-0.4, 0.502, -0.2)
  root.add(cardMesh.mesh)
  // The driver's door (it opens, then shuts).
  const door = new THREE.Group()
  door.position.set(0.9, 0, 0.45)
  root.add(door)
  rbox(0.05, 0.62, 1.05, body, 0.0, 0.66, -0.52, door, 0.02)
  rbox(0.03, 0.42, 0.95, glass, -0.01, 1.18, -0.55, door, 0.01)
  return { root, door, screen, wheel, card: cardMesh.mesh, lights, tail, shell, inner }
}

export class Street {
  readonly group = new THREE.Group()
  car!: CarRig
  carHolder = new THREE.Group()
  traffic: Array<{ g: THREE.Group; lane: number; speed: number; z0: number }> = []
  lampHeads: THREE.Mesh[] = []
  lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.8, 0.55) })
  lampPositions: THREE.Vector3[] = []
  sideDoor!: THREE.Group
  billboard!: THREE.Group
  signals: THREE.MeshBasicMaterial[] = []
  sky!: THREE.Mesh

  build() {
    const g = this.group
    const asphalt = pbr('asphalt', 0x2a2c30, { roughness: 0.9 })
    const paving = pbr('paving', 0x6b6a66, { roughness: 1 })
    const kerb = pbr('concrete', 0x8d8b86, { roughness: 1 })
    const walls = [pbr('concrete', 0x6e6a64), pbr('brick', 0x7a5446), pbr('concrete', 0x8a8478), pbr('plaster', 0x9a8f80), pbr('concrete', 0x585c62)]
    const glassTower = pbr('metal', 0x3c4a56, { roughness: 0.2, metalness: 0.7 })
    // Sky.
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(380, 32, 16), new THREE.MeshBasicMaterial({ map: duskSky(), side: THREE.BackSide, fog: false }))
    this.sky.position.set(84, -40, -60)
    g.add(this.sky)
    // Ground: road, kerbs, sidewalks along the whole drive.
    const len = 230
    const zc = -55
    const road = mesh(new THREE.PlaneGeometry(7.0, len), asphalt, 84.5, 0.0, zc, g)
    road.rotation.x = -PI / 2
    road.receiveShadow = true
    for (const [x, w] of [
      [79.75, 2.5],
      [90.75, 5.5],
    ] as const) {
      const sw = box(w, 0.14, len, paving, x, 0.07, zc, g)
      sw.receiveShadow = true
      box(0.16, 0.16, len, kerb, x + (x < 84 ? w / 2 : -w / 2), 0.08, zc, g)
    }
    // Lane lines.
    const dash = new THREE.MeshBasicMaterial({ color: 0xbdbab0 })
    for (let z = 25; z > -170; z -= 6) {
      const l = mesh(new THREE.PlaneGeometry(0.12, 2.6), dash, 85.4, 0.005, z, g)
      l.rotation.x = -PI / 2
    }
    // The office tower beside the exit, then blocks on both sides.
    const tower = facade({ w: 30, h: 60, d: 12, wall: glassTower, facing: 1, seed: 91, lit: 0.55, floorH: 3.2 })
    tower.position.set(72.5, 0, 4)
    g.add(tower)
    // The side exit door in the tower's ground floor.
    this.sideDoor = new THREE.Group()
    this.sideDoor.position.set(78.55, 0, 4)
    this.sideDoor.rotation.y = PI / 2
    g.add(this.sideDoor)
    const steel = pbr('painted', 0x50585e, { roughness: 0.5 })
    for (const sx of [-1, 1]) rbox(0.08, 2.3, 0.2, steel, sx * 0.55, 1.15, 0, this.sideDoor, 0.004)
    rbox(1.18, 0.08, 0.2, steel, 0, 2.3, 0, this.sideDoor, 0.004)
    const leaf = new THREE.Group()
    leaf.position.set(-0.5, 0, 0.02)
    leaf.name = 'leaf'
    this.sideDoor.add(leaf)
    rbox(1.0, 2.24, 0.05, steel, 0.5, 1.12, 0, leaf, 0.004)
    const exit = canvasPlane(0.42, 0.16, 256, S.exitSign, { emissive: true })
    exit.mesh.position.set(0, 2.55, 0.12)
    this.sideDoor.add(exit.mesh)
    const over = mesh(new THREE.PlaneGeometry(1.4, 0.06), new THREE.MeshBasicMaterial({ color: 0xffe6c0 }), 0, 2.42, 0.11, this.sideDoor)
    over.userData.lamp = true
    const rand = mulberry32(17)
    for (const side of [-1, 1] as const) {
      let z = side < 0 ? -12 : 26
      if (side > 0) z = 26
      const end = -175
      while (z > end) {
        const w = 14 + rand() * 16
        const h = 14 + rand() * 26
        if (side < 0 && z > -12) {
          z -= w
          continue
        }
        const f = facade({ w, h, d: 10, wall: walls[Math.floor(rand() * walls.length)], facing: side < 0 ? 1 : -1, seed: Math.floor(rand() * 1000), lit: 0.45 })
        f.position.set(side < 0 ? 73.5 : 98.5, 0, z - w / 2)
        g.add(f)
        z -= w + 0.4
      }
    }
    // A block across the street at the very start, behind the tower's exit.
    const across = facade({ w: 24, h: 30, d: 10, wall: walls[1], facing: -1, seed: 5, lit: 0.45 })
    across.position.set(98.5, 0, 8)
    g.add(across)
    const far = facade({ w: 30, h: 40, d: 10, wall: walls[4], facing: 1, seed: 6, lit: 0.4 })
    far.rotation.y = -PI / 2
    far.position.set(84, 0, 34)
    g.add(far)
    // Street lamps every 15 m on both sides, lamps coming on.
    const pole = pbr('metal', 0x3a3e42, { roughness: 0.6 })
    for (let z = 20; z > -170; z -= 15) {
      for (const side of [-1, 1] as const) {
        const lamp = streetLamp(pole, this.lampMat)
        lamp.position.set(side < 0 ? 80.7 : 88.3, 0, z + (side > 0 ? 7 : 0))
        lamp.rotation.y = side < 0 ? 0 : PI
        g.add(lamp)
        this.lampPositions.push(new THREE.Vector3(lamp.position.x + (side < 0 ? 0.95 : -0.95), 5.0, lamp.position.z))
      }
    }
    // Traffic lights at two crossings.
    for (const z of [-30, -110]) {
      for (const side of [-1, 1] as const) {
        const tl = new THREE.Group()
        tl.position.set(side < 0 ? 80.6 : 88.4, 0, z)
        g.add(tl)
        cyl(0.07, 0.08, 3.4, pole, 0, 1.7, 0, tl, 12)
        rbox(0.3, 0.85, 0.25, std(0x16181a, 0.6), 0, 3.6, 0, tl, 0.03)
        for (const [i, col] of [
          [0, 0x3a0a08],
          [1, 0x3a2a08],
          [2, 0x29ff7a],
        ] as const) {
          const mat = new THREE.MeshBasicMaterial({ color: col })
          this.signals.push(mat)
          const lamp = mesh(new THREE.CircleGeometry(0.08, 16), mat, 0, 3.88 - i * 0.26, 0.13, tl)
          lamp.rotation.y = 0
        }
      }
    }
    // Parked cars along both kerbs.
    const carCols = [0x7a1e1e, 0xb8bcc0, 0x20242a, 0x2a4a6a, 0xd8d4c8, 0x4a4f3a]
    const parkedGlass = new THREE.MeshPhysicalMaterial({ color: 0x1a2229, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.55, depthWrite: false })
    const tire = pbr('rubber', 0x121314)
    const light = new THREE.MeshBasicMaterial({ color: 0xc8c0b0 })
    // Parked cars along the left kerb (the lane Arif's own car waits in; he drives in the lane beside it).
    for (let i = 0; i < 12; i++) {
      const z = -8 - i * 13 - rand() * 4
      if (z > -14) continue
      const c = car(pbr('painted', carCols[i % carCols.length], { roughness: 0.35, metalness: 0.5 }), parkedGlass, tire, light)
      c.position.set(82.0, 0, z)
      c.rotation.y = PI
      c.name = 'parkedCar'
      g.add(c)
    }
    // Moving traffic, all of it faster than Arif: two ahead in his lane pulling away, two in the left lane passing him.
    const head = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.3) })
    const flow: Array<[number, number, number]> = [
      [84.1, 1.1, -18],
      [86.3, 1.32, 12],
      [84.1, 1.06, -48],
      [86.3, 1.22, -30],
    ]
    for (let i = 0; i < 4; i++) {
      const c = car(pbr('painted', carCols[(i + 2) % carCols.length], { roughness: 0.35, metalness: 0.5 }), parkedGlass, tire, head)
      const wrap = new THREE.Group()
      wrap.add(c)
      c.rotation.y = PI
      c.name = 'trafficCar'
      g.add(wrap)
      this.traffic.push({ g: wrap, lane: flow[i][0], speed: flow[i][1], z0: flow[i][2] })
    }
    // The billboard: on the wide right sidewalk, turned to the oncoming lane, far enough down the street to come up ahead of the car in `dusk`.
    this.billboard = new THREE.Group()
    this.billboard.position.set(90.3, 0, -82)
    this.billboard.rotation.y = -0.3
    g.add(this.billboard)
    for (const sx of [-1.8, 1.8]) cyl(0.12, 0.14, 6.5, pole, sx, 3.25, -0.2, this.billboard, 12)
    rbox(6.3, 3.3, 0.25, std(0x1a1c1f, 0.6), 0, 6, -0.15, this.billboard, 0.02)
    const bb = canvasPlane(6, 3, 1024, S.billboard, { emissive: true })
    bb.mesh.position.set(0, 6, 0)
    this.billboard.add(bb.mesh)
    for (const sx of [-2, 0, 2]) {
      const l = rbox(0.3, 0.08, 0.3, std(0x222222, 0.5), sx, 7.75, 0.4, this.billboard, 0.02)
      l.rotation.x = 0.4
    }

    // The car.
    this.car = arifCar()
    this.carHolder.add(this.car.root)
    this.car.root.rotation.y = PI
    this.carHolder.position.set(CAR.x, 0, CAR.z)
    g.add(this.carHolder)
  }

  setDoor(open: number) {
    const leaf = this.sideDoor.getObjectByName('leaf')!
    leaf.rotation.y = -open * 1.4
  }
}

export { cyl }
