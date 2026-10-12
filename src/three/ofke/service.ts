/**
 * Set D — ÖFKE NÖBETİ. The building's front (facade at z 0, x 132…148) on a
 * street running along x, the reception behind it (x 134…146, z 0…−10), and
 * the preparation room that is also the locker room (x 134…142, z −11…−19):
 * the prep chair, the helmet on its arm, the map screen, the lens applicator,
 * the side table with the pill, the lockers (17 has a mirror), the bench and
 * the explainer screen on the north wall.
 */
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { bench, canvasPlane, car, ceilingPanel, facade, plant, rbox, room, std, streetLamp, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'
import * as S from './screens'

const PI = Math.PI

/** The twin-cup lens applicator on a jointed arm (the prep room's and the line's). */
export function lensArm(white: THREE.Material, dark: THREE.Material) {
  const group = new THREE.Group()
  const mount = new THREE.Group()
  group.add(mount)
  cyl(0.07, 0.07, 0.04, white, 0, 0, 0, mount, 24)
  const rod = cyl(0.025, 0.025, 1, white, 0, -0.5, 0, mount, 12)
  const elbow = new THREE.Group()
  group.add(elbow)
  mesh(new THREE.SphereGeometry(0.045, 16, 12), white, 0, 0, 0, elbow)
  const fore = cyl(0.022, 0.022, 1, white, 0, 0, 0, group, 12)
  const head = new THREE.Group()
  group.add(head)
  rbox(0.13, 0.06, 0.08, white, 0, 0, -0.02, head, 0.02)
  for (const sx of [-1, 1]) {
    const cup = cyl(0.022, 0.026, 0.05, white, sx * 0.032, 0, 0.035, head, 20)
    cup.rotation.x = PI / 2
    const lens = mesh(new THREE.CircleGeometry(0.02, 20), dark, sx * 0.032, 0, 0.061, head)
    lens.rotation.y = 0
  }
  const v = new THREE.Vector3()
  const a = new THREE.Vector3()
  /** Places the arm: mount point, elbow point, the eyepiece at `at` looking along `toward`. */
  const pose = (mountAt: THREE.Vector3, elbowAt: THREE.Vector3, at: THREE.Vector3, toward: THREE.Vector3) => {
    mount.position.copy(mountAt)
    const drop = mountAt.y - elbowAt.y
    rod.scale.y = Math.max(0.01, drop)
    rod.position.y = -drop / 2
    mount.position.x = elbowAt.x
    mount.position.z = elbowAt.z
    elbow.position.copy(elbowAt)
    head.position.copy(at)
    head.lookAt(v.copy(at).add(toward))
    a.subVectors(at, elbowAt)
    const len = a.length()
    fore.position.copy(elbowAt).addScaledVector(a, 0.5)
    fore.scale.y = Math.max(0.01, len - 0.06)
    fore.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.normalize())
  }
  return { group, head, pose }
}

/** A paper cup (open top), optionally with water or one white pill in it. */
export function paperCup(mat: THREE.Material, fill?: THREE.Material, pill?: THREE.Material) {
  const g = new THREE.Group()
  const cup = turned(
    [
      [0, 0],
      [0.022, 0],
      [0.03, 0.07],
      [0.0315, 0.072],
      [0.029, 0.069],
      [0.021, 0.004],
      [0, 0.004],
    ],
    mat,
    24,
    g,
  )
  cup.castShadow = true
  ;(mat as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  if (fill) mesh(new THREE.CircleGeometry(0.027, 20), fill, 0, 0.055, 0, g).rotation.x = -PI / 2
  if (pill) {
    const p = mesh(new THREE.SphereGeometry(0.006, 12, 8), pill, 0, 0.008, 0, g)
    p.scale.set(1.4, 0.6, 1)
  }
  return g
}

export class Service {
  readonly group = new THREE.Group()
  readonly exterior = new THREE.Group()
  readonly reception = new THREE.Group()
  readonly prep = new THREE.Group()
  doors!: { l: THREE.Mesh; r: THREE.Mesh }
  logoScreen!: ReturnType<typeof canvasPlane>
  helmet!: THREE.Group
  helmetBands: THREE.MeshBasicMaterial[] = []
  helmetRod!: THREE.Mesh
  mapScreen!: ReturnType<typeof canvasPlane>
  mapArm!: THREE.Group
  lens!: ReturnType<typeof lensArm>
  cupPill!: THREE.Group
  cupWater!: THREE.Group
  tray!: THREE.Group
  locker17!: THREE.Group
  shelfOveralls!: THREE.Group
  shelfShirt!: THREE.Group
  shelfGlasses!: THREE.Group
  info!: ReturnType<typeof canvasPlane>
  mirror!: Reflector
  prepDoor!: THREE.Group
  corridorDoor!: THREE.Group
  towel!: THREE.Mesh
  signMat!: THREE.MeshBasicMaterial
  litMats: THREE.MeshBasicMaterial[] = []
  lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.82, 0.58) })
  lampPositions: THREE.Vector3[] = []
  chairBack!: THREE.Group

  build(models: { cart: THREE.Group | null; medical: THREE.Group | null; camera: THREE.Group | null; tube: THREE.Group | null }, glasses: THREE.Group, shirtMat: THREE.Material, tieMat: THREE.Material, overallsMat: THREE.Material, slipMat: THREE.Material) {
    const g = this.group
    g.add(this.exterior, this.reception, this.prep)
    const stone = pbr('plaster', 0xf1eee7, { roughness: 0.9 })
    const wood = pbr('wood', 0xd8bf98, { roughness: 0.7 })
    const white = std(0xf5f6f5, 0.6)
    const whiteSoft = pbr('leather', 0xf0f2f1, { roughness: 0.55 })
    const mint = std(0x7fd1c1, 0.6)
    const mintGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 1.1, 0.95) })
    const floorPale = pbr('tile', 0xe7e4dc, { roughness: 0.5 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xdff2ee, roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false })
    const steel = std(0xc2c6c8, 0.28, { metalness: 0.85 })
    const dark = std(0x0d1012, 0.3)

    // ——— Street in front ———
    const asphalt = pbr('asphalt', 0x2a2c30, { roughness: 0.9 })
    const paving = pbr('paving', 0x77746e, { roughness: 1 })
    const road = mesh(new THREE.PlaneGeometry(140, 7.5), asphalt, 140, 0, 7.25, this.exterior)
    road.rotation.x = -PI / 2
    road.receiveShadow = true
    box(140, 0.14, 3.5, paving, 140, 0.07, 1.75, this.exterior).receiveShadow = true
    box(140, 0.14, 8, paving, 140, 0.07, 15, this.exterior).receiveShadow = true
    for (const z of [3.5, 11]) box(140, 0.16, 0.16, pbr('concrete', 0x8d8b86), 140, 0.08, z, this.exterior)
    const dash = new THREE.MeshBasicMaterial({ color: 0xbdbab0 })
    for (let x = 90; x < 190; x += 6) mesh(new THREE.PlaneGeometry(2.6, 0.12), dash, x, 0.005, 7.25, this.exterior).rotation.x = -PI / 2
    const walls = [pbr('concrete', 0x6e6a64), pbr('brick', 0x7a5446), pbr('plaster', 0x9a8f80), pbr('concrete', 0x585c62)]
    const rand = mulberry32(23)
    // Neighbours either side, and the row across the street.
    for (const [x0, x1] of [
      [96, 131.8],
      [148.2, 186],
    ]) {
      let x = x0
      while (x < x1 - 4) {
        const w = Math.min(x1 - x, 9 + rand() * 9)
        const f = facade({ w, h: 10 + rand() * 18, d: 10, wall: walls[Math.floor(rand() * 4)], facing: 1, seed: Math.floor(rand() * 999), lit: 0.5 })
        f.rotation.y = -PI / 2
        f.position.set(x + w / 2, 0, -5)
        this.exterior.add(f)
        x += w + 0.3
      }
    }
    let ax = 96
    while (ax < 186) {
      const w = 10 + rand() * 12
      const f = facade({ w, h: 12 + rand() * 20, d: 10, wall: walls[Math.floor(rand() * 4)], facing: 1, seed: Math.floor(rand() * 999), lit: 0.5 })
      f.rotation.y = PI / 2
      f.position.set(ax + w / 2, 0, 24)
      this.exterior.add(f)
      ax += w + 0.3
    }
    const pole = pbr('metal', 0x3a3e42, { roughness: 0.6 })
    for (let x = 104; x < 184; x += 16) {
      for (const side of [-1, 1] as const) {
        const lamp = streetLamp(pole, this.lampMat)
        lamp.position.set(x + (side > 0 ? 8 : 0), 0, side < 0 ? 3.0 : 11.5)
        lamp.rotation.y = side < 0 ? -PI / 2 : PI / 2
        this.exterior.add(lamp)
        this.lampPositions.push(new THREE.Vector3(lamp.position.x, 5.0, lamp.position.z + (side < 0 ? 0.95 : -0.95)))
      }
    }
    // Parked cars across the street.
    const parkedGlass = new THREE.MeshPhysicalMaterial({ color: 0x1a2229, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.55, depthWrite: false })
    const tire = pbr('rubber', 0x121314)
    const head = new THREE.MeshBasicMaterial({ color: 0xc8c0b0 })
    for (let i = 0; i < 6; i++) {
      const c = car(pbr('painted', [0x7a1e1e, 0xb8bcc0, 0x20242a, 0x2a4a6a, 0xd8d4c8, 0x4a4f3a][i], { roughness: 0.35, metalness: 0.5 }), parkedGlass, tire, head)
      c.rotation.y = i % 2 ? PI / 2 : -PI / 2
      c.position.set(118 + i * 9.5 + (i > 2 ? 6 : 0), 0, 9.9)
      this.exterior.add(c)
    }

    // ——— The facade ———
    const fx = 140
    const H = 8
    // Ground floor piers between the glass, an upper storey of stone and pale wood slats.
    for (const [x0, x1] of [
      [132, 134.2],
      [137.9, 138.8],
      [141.2, 142.1],
      [145.8, 148],
    ])
      box(x1 - x0, 3.5, 0.4, stone, (x0 + x1) / 2, 1.75, 0.2, this.exterior).receiveShadow = true
    box(16, H - 3.5, 0.4, stone, fx, 3.5 + (H - 3.5) / 2, 0.2, this.exterior).receiveShadow = true
    box(16.4, 0.3, 0.6, stone, fx, H + 0.15, 0.25, this.exterior)
    for (const x of [132, 148]) {
      const c = cyl(0.3, 0.3, H + 0.3, stone, x, (H + 0.3) / 2, 0.1, this.exterior, 24)
      c.receiveShadow = true
    }
    // Wood slats over the upper storey, with windows behind them.
    const slat = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 3.3, 0.08), wood, 60)
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < 60; i++) {
      m4.makeTranslation(132.8 + i * 0.245, 6.05, 0.47)
      slat.setMatrixAt(i, m4)
    }
    slat.castShadow = true
    this.exterior.add(slat)
    const upperGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.86, 0.66) })
    this.litMats.push(upperGlow)
    for (const x of [134.5, 138.2, 141.8, 145.5]) mesh(new THREE.PlaneGeometry(2.6, 1.8), upperGlow, x, 6.0, 0.41, this.exterior)
    // Glass to the reception (the interior is real behind it).
    for (const [x0, x1] of [
      [134.2, 137.9],
      [142.1, 145.8],
    ]) {
      const pane = box(x1 - x0, 3.2, 0.02, glass, (x0 + x1) / 2, 1.9, 0.1, this.exterior)
      pane.castShadow = false
      box(x1 - x0, 0.3, 0.4, stone, (x0 + x1) / 2, 0.15, 0.2, this.exterior)
    }
    // The sliding doors and their frame, a canopy over them.
    for (const sx of [-1, 1]) rbox(0.1, 2.75, 0.2, steel, fx + sx * 1.25, 1.375, 0.12, this.exterior, 0.01)
    rbox(2.6, 0.25, 0.25, steel, fx, 2.875, 0.12, this.exterior, 0.01)
    box(2.4, 0.5, 0.4, stone, fx, 3.25, 0.2, this.exterior)
    const l = box(1.2, 2.7, 0.03, glass, fx - 0.6, 1.35, 0.08, this.exterior)
    const r = box(1.2, 2.7, 0.03, glass, fx + 0.6, 1.35, 0.08, this.exterior)
    l.castShadow = r.castShadow = false
    this.doors = { l, r }
    rbox(4.2, 0.12, 1.6, stone, fx, 3.2, 0.95, this.exterior, 0.04)
    const strip = mesh(new THREE.PlaneGeometry(3.8, 0.04), mintGlow, fx, 3.13, 1.74, this.exterior)
    strip.rotation.x = 0
    for (const sx of [-1.2, 0, 1.2]) {
      const dl = mesh(new THREE.CircleGeometry(0.06, 16), this.lampMat, fx + sx, 3.135, 0.9, this.exterior)
      dl.rotation.x = PI / 2
    }
    // The sign: mint letters, the logo, the line under it.
    const sign = canvasPlane(7.2, 1.6, 1024, S.facadeSign, { emissive: true, transparent: true })
    this.signMat = sign.material as THREE.MeshBasicMaterial
    this.signMat.color = new THREE.Color(1.25, 1.25, 1.25)
    sign.mesh.position.set(fx - 0.6, 4.15, 0.42)
    this.exterior.add(sign.mesh)
    // Planters, a bench, wall lights.
    const planterMat = pbr('concrete', 0xcfccc4)
    const leaf = pbr('plastic', 0x3f6b35, { roughness: 0.7 })
    for (const x of [134.8, 145.2]) {
      rbox(2.0, 0.55, 0.7, planterMat, x, 0.275, 1.2, this.exterior, 0.04)
      for (let k = 0; k < 3; k++) {
        const p = plant(planterMat, leaf, 1.1, 30 + k + x)
        p.position.set(x - 0.6 + k * 0.6, 0.25, 1.2)
        p.scale.setScalar(0.9)
        this.exterior.add(p)
      }
    }
    const bn = bench(1.8, wood, steel)
    bn.position.set(fx + 3.5, 0.14, 2.4)
    this.exterior.add(bn)
    for (const x of [133.2, 146.8]) {
      const wl = rbox(0.14, 0.4, 0.12, this.lampMat, x, 2.4, 0.46, this.exterior, 0.03)
      wl.castShadow = false
    }
    // A camera over the door.
    if (models.camera) {
      const cam = models.camera.clone(true)
      cam.position.set(fx + 1.9, 3.0, 0.5)
      cam.rotation.y = -0.4
      this.exterior.add(cam)
    }

    // ——— Reception ———
    const rec = room({
      w: 12,
      d: 10,
      h: 3.5,
      x: 140,
      z: -5,
      wall: pbr('painted', 0xf3f4f2, { roughness: 1 }),
      floor: floorPale,
      ceiling: pbr('plaster', 0xf6f6f4),
      trim: mint,
      skip: ['s'],
      openings: [{ side: 'n', at: 0, width: 1.2, height: 2.2 }],
    })
    this.reception.add(rec)
    // Mint band along the walls.
    for (const [w, d, x, z] of [
      [12, 0.01, 140, -9.99],
      [0.01, 10, 134.01, -5],
      [0.01, 10, 145.99, -5],
    ] as const)
      box(w, 0.12, d, mint, x, 1.1, z, this.reception)
    // Downlights.
    for (const x of [136.5, 140, 143.5])
      for (const z of [-2, -5, -8]) {
        const d = mesh(new THREE.CircleGeometry(0.11, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.45, 1.35) }), x, 3.495, z, this.reception)
        d.rotation.x = PI / 2
      }
    // The curved counter.
    const ring = new THREE.Shape()
    const a0 = PI / 2 - 0.8
    const a1 = PI / 2 + 0.8
    ring.absarc(0, 0, 2.3, a0, a1, false)
    ring.absarc(0, 0, 1.7, a1, a0, true)
    const ctr = new THREE.ExtrudeGeometry(ring, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 40 })
    ctr.rotateX(-PI / 2)
    const counter = mesh(ctr, wood, 140, 0, -7.5, this.reception)
    counter.castShadow = counter.receiveShadow = true
    counter.rotation.y = PI
    const topRing = new THREE.Shape()
    topRing.absarc(0, 0, 2.36, a0 - 0.02, a1 + 0.02, false)
    topRing.absarc(0, 0, 1.64, a1 + 0.02, a0 - 0.02, true)
    const tg = new THREE.ExtrudeGeometry(topRing, { depth: 0.04, bevelEnabled: false, curveSegments: 40 })
    tg.rotateX(-PI / 2)
    const topMesh = mesh(tg, white, 140, 1.02, -7.5, this.reception)
    topMesh.castShadow = true
    topMesh.rotation.y = PI
    // A mint light along the foot of the counter's front.
    const ledG = new THREE.TorusGeometry(2.315, 0.012, 6, 60, 1.6)
    ledG.rotateZ(PI / 2 - 0.8)
    const led = mesh(ledG, mintGlow, 140, 0.06, -7.5, this.reception)
    led.rotation.x = PI / 2
    // Things on the counter: a screen, a tablet, a bell.
    rbox(0.4, 0.26, 0.02, dark, 139.3, 1.22, -5.9, this.reception, 0.01)
    // The logo screen on the north wall.
    this.logoScreen = canvasPlane(2.4, 1.35, 768, (c, W, H2) => S.logoLoop(c, W, H2, 0), { emissive: true })
    this.logoScreen.mesh.position.set(140, 2.15, -9.97)
    this.reception.add(this.logoScreen.mesh)
    // Waiting area: two benches, a plant, the coffee cart.
    const sofaMat = pbr('fabric', 0xd9e9e4, { roughness: 1 })
    for (const z of [-3.2, -6.4]) {
      const b = new THREE.Group()
      b.position.set(135.0, 0, z)
      b.rotation.y = PI / 2
      this.reception.add(b)
      rbox(1.9, 0.42, 0.6, sofaMat, 0, 0.21, 0, b, 0.06)
      rbox(1.9, 0.5, 0.15, sofaMat, 0, 0.55, -0.28, b, 0.06)
    }
    const p1 = plant(std(0xe8e4dc, 0.5), leaf, 1.7, 41)
    p1.position.set(135.0, 0, -8.8)
    this.reception.add(p1)
    const p2 = plant(std(0xe8e4dc, 0.5), leaf, 1.5, 42)
    p2.position.set(145.2, 0, -1.0)
    this.reception.add(p2)
    if (models.cart) {
      const cart = models.cart.clone(true)
      cart.position.set(135.2, 0, -1.3)
      cart.rotation.y = PI / 2
      this.reception.add(cart)
    }
    // A poster by the corridor.
    const poster = canvasPlane(1.2, 0.6, 512, S.billboard)
    poster.mesh.position.set(145.98, 1.7, -6.5)
    poster.mesh.rotation.y = -PI / 2
    this.reception.add(poster.mesh)
    // The passage to the prep room.
    box(1.2, 0.1, 1.0, floorPale, 140, -0.05, -10.5, this.reception)
    for (const sx of [-1, 1]) box(0.1, 2.2, 1.0, pbr('painted', 0xf3f4f2), 140 + sx * 0.65, 1.1, -10.5, this.reception)
    box(1.4, 0.2, 1.0, pbr('painted', 0xf3f4f2), 140, 2.3, -10.5, this.reception)

    // ——— Prep room / locker room ———
    const pr = room({
      w: 8,
      d: 8,
      h: 3.0,
      x: 138,
      z: -15,
      wall: pbr('painted', 0xf2f4f3, { roughness: 1 }),
      floor: pbr('tile', 0xd8dcdb, { roughness: 0.55 }),
      ceiling: pbr('plaster', 0xf6f6f4),
      trim: mint,
      openings: [
        { side: 's', at: 2, width: 1.0, height: 2.1 },
        { side: 'e', at: 0, width: 1.0, height: 2.1 },
      ],
    })
    this.prep.add(pr)
    box(8, 0.1, 0.01, mint, 138, 1.2, -18.99, this.prep)
    box(0.01, 0.1, 8, mint, 141.99, 1.2, -15, this.prep)
    for (const [x, z] of [
      [136.2, -13.2],
      [139.8, -13.2],
      [136.2, -16.8],
      [139.8, -16.8],
    ] as const) {
      const p = ceilingPanel(1.2, 0.6, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.45, 1.5, 1.52) }))
      p.position.set(x, 3.0, z)
      this.prep.add(p)
    }
    // Doors: from reception (south) and to the white corridor (east), both shut flush panels.
    this.prepDoor = new THREE.Group()
    this.prepDoor.position.set(140, 0, -11.0)
    this.prep.add(this.prepDoor)
    rbox(0.98, 2.08, 0.05, white, 0, 1.04, 0, this.prepDoor, 0.003)
    this.corridorDoor = new THREE.Group()
    this.corridorDoor.position.set(142.0, 0, -15)
    this.corridorDoor.rotation.y = PI / 2
    this.prep.add(this.corridorDoor)
    rbox(0.98, 2.08, 0.05, white, 0, 1.04, 0, this.corridorDoor, 0.003)
    const cplate = canvasPlane(0.5, 0.14, 256, (c, W, H2) => S.plateText(c, W, H2, 'ODALAR →'))
    cplate.mesh.position.set(141.98, 2.35, -15)
    cplate.mesh.rotation.y = -PI / 2
    this.prep.add(cplate.mesh)

    // The prep chair (faces −z): pedestal, seat, reclined back, headrest, arms, footrest.
    const chair = new THREE.Group()
    chair.position.set(138, 0, -15)
    chair.rotation.y = PI
    this.prep.add(chair)
    cyl(0.32, 0.36, 0.06, steel, 0, 0.03, 0, chair, 32)
    cyl(0.09, 0.11, 0.38, steel, 0, 0.24, 0, chair, 20)
    rbox(0.56, 0.12, 0.56, whiteSoft, 0, 0.47, 0.02, chair, 0.05)
    this.chairBack = new THREE.Group()
    this.chairBack.position.set(0, 0.5, -0.25)
    this.chairBack.rotation.x = -0.32
    chair.add(this.chairBack)
    rbox(0.54, 0.75, 0.12, whiteSoft, 0, 0.38, -0.04, this.chairBack, 0.05)
    rbox(0.28, 0.2, 0.1, whiteSoft, 0, 0.86, -0.02, this.chairBack, 0.05)
    for (const sx of [-1, 1]) {
      rbox(0.09, 0.06, 0.48, whiteSoft, sx * 0.33, 0.68, 0.02, chair, 0.025)
      rbox(0.04, 0.18, 0.04, steel, sx * 0.33, 0.58, 0.02, chair, 0.01)
    }
    const foot = rbox(0.5, 0.08, 0.42, whiteSoft, 0, 0.32, 0.5, chair, 0.035)
    foot.rotation.x = 0.55
    // The helmet on its arm.
    this.helmet = new THREE.Group()
    this.prep.add(this.helmet)
    const shell = turned(
      [
        [0.162, 0],
        [0.17, 0.02],
        [0.172, 0.12],
        [0.162, 0.24],
        [0.13, 0.32],
        [0.08, 0.365],
        [0.0, 0.38],
        [0.0, 0.37],
        [0.075, 0.355],
        [0.12, 0.31],
        [0.15, 0.235],
        [0.158, 0.12],
        [0.155, 0.02],
        [0.15, 0.0],
      ],
      pbr('plastic', 0xf4f5f5, { roughness: 0.25, side: THREE.DoubleSide }),
      48,
      this.helmet,
    )
    shell.castShadow = true
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.45, 1.0) })
      this.helmetBands.push(mat)
      const band = mesh(new THREE.TorusGeometry(0.173 - i * 0.004 - (i === 3 ? 0.02 : 0), 0.006, 6, 48), mat, 0, 0.05 + i * 0.075, 0, this.helmet)
      band.rotation.x = PI / 2
    }
    this.helmetRod = cyl(0.03, 0.03, 1, steel, 0, 0, 0, this.prep, 14)
    cyl(0.12, 0.12, 0.04, steel, 138, 2.98, -15.15, this.prep, 24)
    // The map screen on its own arm, in front of the chair.
    this.mapArm = new THREE.Group()
    this.mapArm.position.set(138, 0, -16.1)
    this.prep.add(this.mapArm)
    cyl(0.025, 0.025, 0.95, steel, 0, 0.47, -0.06, this.mapArm, 12)
    cyl(0.18, 0.2, 0.03, steel, 0, 0.015, -0.06, this.mapArm, 24)
    rbox(0.94, 0.59, 0.03, dark, 0, 1.25, -0.02, this.mapArm, 0.012)
    this.mapScreen = canvasPlane(0.9, 0.55, 1024, (c, W, H2) => S.prepScreen(c, W, H2, { kind: 'idle' }), { emissive: true })
    this.mapScreen.mesh.position.set(0, 1.25, -0.003)
    this.mapArm.add(this.mapScreen.mesh)
    // The lens applicator (shares its model with the line's injection station).
    this.lens = lensArm(std(0xf2f4f4, 0.28), std(0x16303a, 0.1))
    this.prep.add(this.lens.group)
    // The side table with the tray: a pill in a paper cup, a cup of water.
    const table = new THREE.Group()
    table.position.set(139.0, 0, -14.6)
    this.prep.add(table)
    cyl(0.02, 0.02, 0.8, steel, 0, 0.4, 0, table, 10)
    cyl(0.2, 0.22, 0.02, steel, 0, 0.01, 0, table, 20)
    rbox(0.5, 0.02, 0.36, steel, 0, 0.81, 0, table, 0.008)
    this.tray = new THREE.Group()
    this.tray.position.set(0, 0.825, 0)
    table.add(this.tray)
    rbox(0.36, 0.012, 0.24, pbr('metal', 0xd0d4d6, { roughness: 0.2 }), 0, 0.006, 0, this.tray, 0.004)
    const paper = std(0xf6f4ee, 0.85)
    this.cupPill = paperCup(paper, undefined, std(0xffffff, 0.3))
    this.cupPill.position.set(-0.08, 0.012, 0)
    this.cupWater = paperCup(paper, new THREE.MeshPhysicalMaterial({ color: 0xcfe8f0, roughness: 0.05, transparent: true, opacity: 0.6 }))
    this.cupWater.position.set(0.08, 0.012, 0)
    this.tray.add(this.cupPill, this.cupWater)
    if (models.medical) {
      const med = models.medical.clone(true)
      med.position.set(141.5, 0.0, -17.6)
      med.rotation.y = -PI / 2
      const cab = new THREE.Group()
      this.prep.add(cab)
      rbox(0.6, 0.9, 0.5, white, 141.65, 0.45, -17.6, cab, 0.01)
      med.position.y = 0.9
      cab.add(med)
    }
    // Lockers along the west wall, numbered 9…20; 17 opens.
    const lockerMat = pbr('painted', 0xe3e7e8, { roughness: 0.6 })
    const lockerLine = std(0xb9c1c3, 0.6)
    for (let i = 0; i < 12; i++) {
      const z = -12.5 - 0.5 * i
      const n = 9 + i
      rbox(0.5, 1.9, 0.02, lockerMat, 134.25, 0.95, z - 0.24, this.prep, 0.003).rotation.y = PI / 2
      rbox(0.48, 0.02, 0.48, lockerMat, 134.25, 1.9, z, this.prep, 0.003)
      const back = box(0.02, 1.9, 0.48, lockerLine, 134.01, 0.95, z, this.prep)
      back.receiveShadow = true
      const door = new THREE.Group()
      door.position.set(134.5, 0.05, z - 0.24)
      this.prep.add(door)
      rbox(0.02, 1.82, 0.47, lockerMat, 0, 0.91, 0.235, door, 0.004)
      for (let k = 0; k < 4; k++) box(0.002, 0.012, 0.3, lockerLine, 0.011, 1.6 + k * 0.03, 0.235, door)
      const lbl = canvasPlane(0.08, 0.05, 64, (c, W, H2) => S.lockerLabel(c, W, H2, n))
      lbl.mesh.position.set(0.012, 1.45, 0.235)
      lbl.mesh.rotation.y = PI / 2
      door.add(lbl.mesh)
      rbox(0.02, 0.1, 0.02, steel, 0.02, 1.0, 0.42, door, 0.006)
      if (n === 17) {
        this.locker17 = door
        // The mirror on the inside of its door.
        this.mirror = new Reflector(new THREE.PlaneGeometry(0.3, 0.54), { textureWidth: 512, textureHeight: 920, color: 0xb8bcbe, clipBias: 0.003 })
        this.mirror.position.set(-0.021, 1.5, 0.235)
        this.mirror.rotation.y = -PI / 2
        door.add(this.mirror)
        rbox(0.008, 0.56, 0.32, steel, -0.011, 1.5, 0.235, door, 0.003)
        // The shelf inside and what lies on it.
        rbox(0.46, 0.015, 0.46, lockerMat, 134.25, 1.5, z, this.prep, 0.003)
        this.shelfOveralls = new THREE.Group()
        this.shelfOveralls.position.set(134.27, 1.508, z)
        this.prep.add(this.shelfOveralls)
        rbox(0.3, 0.09, 0.34, overallsMat, 0, 0.045, 0, this.shelfOveralls, 0.03)
        for (const sz of [-0.07, 0.07]) rbox(0.11, 0.06, 0.25, slipMat, 0, 0.12, sz, this.shelfOveralls, 0.03)
        this.shelfShirt = new THREE.Group()
        this.shelfShirt.position.set(134.27, 1.508, z)
        this.prep.add(this.shelfShirt)
        rbox(0.3, 0.06, 0.36, shirtMat, 0, 0.03, 0, this.shelfShirt, 0.02)
        const tieFold = rbox(0.05, 0.01, 0.3, tieMat, 0.05, 0.065, 0, this.shelfShirt, 0.004)
        tieFold.rotation.y = 0.2
        this.shelfGlasses = glasses
        glasses.position.set(134.3, 1.578, z + 0.05)
        glasses.rotation.set(0, PI / 2 + 0.3, 0)
        this.prep.add(glasses)
      }
    }
    const bn2 = bench(2.0, wood, steel)
    bn2.position.set(135.4, 0, -15)
    bn2.rotation.y = PI / 2
    this.prep.add(bn2)
    // A towel, folded on the bench (and round his neck later).
    this.towel = mesh(new THREE.BoxGeometry(0.3, 0.05, 0.4), pbr('fabric', 0xf7f7f5, { roughness: 1 }), 135.4, 0.5, -14.2, this.prep)
    this.towel.castShadow = true
    // The explainer screen on the north wall.
    rbox(1.66, 0.96, 0.04, dark, 136, 1.8, -18.97, this.prep, 0.01)
    this.info = canvasPlane(1.6, 0.9, 1024, (c, W, H2) => S.explainer(c, W, H2, 0, 0, false), { emissive: true })
    this.info.mesh.position.set(136, 1.8, -18.945)
    this.prep.add(this.info.mesh)
    if (models.camera) {
      const cam = models.camera.clone(true)
      cam.position.set(141.75, 2.75, -11.3)
      cam.rotation.y = PI + 0.7
      this.prep.add(cam)
    }
  }

  /** Lowers (1) or parks (0) the helmet over a head position (x, z), rim at `rimY`. */
  setHelmet(down: number, head: THREE.Vector3) {
    const park = new THREE.Vector3(138, 2.07, -15.1)
    const x = park.x + (head.x - park.x) * down
    const z = park.z + (head.z - park.z) * down
    const y = park.y + (head.y - 0.13 - park.y) * down
    this.helmet.position.set(x, y, z)
    this.helmet.rotation.set(-0.12 * down, 0, 0)
    const top = y + 0.38
    this.helmetRod.position.set(x, (3.0 + top) / 2, z)
    this.helmetRod.scale.y = Math.max(0.01, 3.0 - top)
  }
}

export { rbox }
