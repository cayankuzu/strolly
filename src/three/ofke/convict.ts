/**
 * Set F — the convict line: one long industrial hall along −z at x 220.
 * The loading bay (z 2…8, the prison van backed in), a steel conveyor from
 * z 2 to −38 with a restraint frame riding on it, the wash tunnel (z −6…−13:
 * foam, water, brushes), the dark reading room (z −16…−27: two giant
 * speakers, a wall of twelve screens), the injection station (z −30…−34,
 * three white arms) and the dark slot at the line's end (z −38) — the back
 * of ODA 3's hatch.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { canvasPlane, hardware, rbox, std, turned, wallClock } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { lensArm, paperCup } from './service'
import * as S from './screens'

const PI = Math.PI
export const LINE_X = 220
export const BELT_Y = 0.14

export type Frame = { group: THREE.Group; tilt: THREE.Group; post: THREE.Mesh }

function restraintFrame(steel: THREE.Material, dark: THREE.Material): Frame {
  const group = new THREE.Group()
  const tilt = new THREE.Group()
  group.add(tilt)
  rbox(0.8, 0.04, 0.6, steel, 0, 0.02, 0.0, tilt, 0.01)
  const post = rbox(0.09, 2.1, 0.09, steel, 0, 1.07, 0.24, tilt, 0.01)
  rbox(0.5, 0.06, 0.06, steel, 0, 2.05, 0.24, tilt, 0.01)
  // The wrist bar in front at hip height, on two side arms.
  for (const sx of [-1, 1]) rbox(0.04, 0.04, 0.42, steel, sx * 0.3, 0.95, 0.04, tilt, 0.008)
  rbox(0.64, 0.04, 0.04, steel, 0, 0.95, -0.17, tilt, 0.008)
  // Ankle clamps.
  for (const sx of [-1, 1]) {
    const c = mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20, PI), dark, sx * 0.1, 0.1, 0.0, tilt)
    c.rotation.x = 0
    rbox(0.05, 0.1, 0.05, steel, sx * 0.1, 0.06, 0.06, tilt, 0.008)
  }
  return { group, tilt, post }
}

/** The van, rear toward −z in its own frame: a white box body with a cab, rear doors that swing open. */
function van(white: THREE.Material, dark: THREE.Material, glass: THREE.Material) {
  const g = new THREE.Group()
  const L = 5.5
  rbox(2.1, 2.2, 4.0, white, 0, 1.4, -0.75, g, 0.08)
  rbox(2.06, 1.6, 1.5, white, 0, 1.1, 2.0, g, 0.12)
  const ws = rbox(1.9, 0.65, 0.05, glass, 0, 1.55, 2.7, g, 0.02)
  ws.rotation.x = -0.3
  for (const sx of [-1, 1]) {
    for (const z of [-2.0, 1.6]) {
      const w = new THREE.Group()
      w.position.set(sx * 0.9, 0.38, z)
      g.add(w)
      const t = mesh(new THREE.TorusGeometry(0.28, 0.1, 10, 24), pbr('rubber', 0x121314), 0, 0, 0, w)
      t.rotation.y = PI / 2
      cyl(0.22, 0.22, 0.18, hardware().steel, 0, 0, 0, w, 20).rotation.z = PI / 2
    }
    rbox(0.02, 0.5, 1.0, glass, sx * 1.04, 1.5, 2.0, g, 0.01)
  }
  // The interior: dark, a bench along one side, a dome light.
  box(1.9, 0.04, 3.8, dark, 0, 0.52, -0.75, g)
  box(1.9, 2.0, 0.04, dark, 0, 1.5, 1.12, g)
  box(0.04, 2.0, 3.8, dark, -0.98, 1.5, -0.75, g)
  box(0.04, 2.0, 3.8, dark, 0.98, 1.5, -0.75, g)
  box(1.9, 0.04, 3.8, dark, 0, 2.46, -0.75, g)
  rbox(0.42, 0.06, 2.4, pbr('metal', 0x7a7f84, { roughness: 0.5 }), -0.72, 0.95, -0.9, g, 0.01)
  for (const z of [-1.9, 0.1]) rbox(0.04, 0.42, 0.04, pbr('metal', 0x7a7f84, { roughness: 0.5 }), -0.72, 0.73, z, g, 0.01)
  const dome = mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.25, 1.1) }), 0, 2.43, -0.8, g)
  dome.rotation.x = PI / 2
  // Rear doors, hinged at the sides.
  const doors: THREE.Group[] = []
  for (const sx of [-1, 1]) {
    const d = new THREE.Group()
    d.position.set(sx * 1.04, 0.45, -2.75)
    g.add(d)
    rbox(1.02, 2.05, 0.05, white, -sx * 0.51, 1.0, -0.03, d, 0.01)
    rbox(0.04, 0.3, 0.04, hardware().steel, -sx * 0.9, 1.0, -0.07, d, 0.01)
    doors.push(d)
  }
  // Sides: the blue stripe and SEVK ARACI.
  for (const sx of [-1, 1]) {
    const side = canvasPlane(3.8, 1.2, 1024, S.vanSide, { transparent: true })
    side.mesh.position.set(sx * 1.052, 1.55, -0.75)
    side.mesh.rotation.y = (sx * PI) / 2
    g.add(side.mesh)
  }
  // Rear lights, plate.
  for (const sx of [-1, 1]) rbox(0.14, 0.3, 0.04, std(0x6a1010, 0.4), sx * 0.95, 1.0, -2.78, g, 0.01)
  rbox(0.5, 0.11, 0.02, hardware().plate, 0, 0.6, -2.79, g, 0.004)
  void L
  return { group: g, doors }
}

/** A giant speaker cabinet facing +z in its own frame. */
function speaker(black: THREE.Material, cone: THREE.Material) {
  const g = new THREE.Group()
  rbox(2.0, 3.5, 1.0, black, 0, 1.75, 0, g, 0.03)
  const drivers: THREE.Group[] = []
  for (const [y, r] of [
    [0.85, 0.62],
    [2.2, 0.62],
  ] as const) {
    const d = new THREE.Group()
    d.position.set(0, y, 0.5)
    g.add(d)
    mesh(new THREE.TorusGeometry(r, 0.04, 8, 40), hardware().plasticDark, 0, 0, 0.01, d)
    const c = turned(
      [
        [0.0, -0.16],
        [r * 0.25, -0.15],
        [r * 0.95, -0.02],
        [r, 0.0],
      ],
      cone,
      40,
      d,
    )
    c.rotation.x = PI / 2
    mesh(new THREE.SphereGeometry(r * 0.22, 20, 10, 0, PI * 2, 0, PI / 2), cone, 0, 0, -0.13, d).rotation.x = PI / 2
    drivers.push(d)
  }
  rbox(0.9, 0.35, 0.1, hardware().plasticDark, 0, 3.2, 0.5, g, 0.04)
  return { group: g, drivers }
}

export class ConvictLine {
  readonly group = new THREE.Group()
  van!: ReturnType<typeof van>
  frames: Frame[] = []
  beltTex!: THREE.CanvasTexture
  brushes: THREE.Mesh[] = []
  topBrush!: THREE.Mesh
  beacons: THREE.Group[] = []
  beaconMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 0.7, 0.15) })
  startLamp!: ReturnType<typeof canvasPlane>
  foam!: THREE.InstancedMesh
  spray!: THREE.InstancedMesh
  foamSeeds: Array<[number, number, number, number]> = []
  speakers: Array<ReturnType<typeof speaker>> = []
  screens!: ReturnType<typeof canvasPlane>
  screenMat!: THREE.MeshBasicMaterial
  gantry!: THREE.Group
  gripper!: THREE.Group
  lens!: ReturnType<typeof lensArm>
  pillArm!: THREE.Group
  pillCup!: THREE.Group
  injector!: THREE.Group
  manifest!: THREE.Group
  sodium = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.95, 0.4) })
  private sub: HTMLCanvasElement | null = null

  build(models: { tube: THREE.Group | null; camera: THREE.Group | null; medical: THREE.Group | null; wetSign: THREE.Group | null }) {
    const g = this.group
    const X = LINE_X
    const concrete = pbr('concrete', 0x6d6a64, { roughness: 1 })
    const floor = pbr('concrete', 0x5a5852, { roughness: 0.9 })
    const steel = pbr('metal', 0x9aa0a4, { roughness: 0.35 })
    const galv = pbr('metal', 0x8a9096, { roughness: 0.55 })
    const black = pbr('painted', 0x0c0d0e, { roughness: 0.9 })
    const dark = std(0x0a0b0c, 0.9)
    const white = std(0xf2f3f2, 0.55)
    const whiteGloss = pbr('plastic', 0xf4f5f5, { roughness: 0.25 })
    // ——— The hall ———
    const fl = box(11, 0.1, 47, floor, X, -0.05, -15.5, g)
    fl.receiveShadow = true
    for (const sx of [-1, 1]) box(0.3, 5, 24, concrete, X + sx * 5.65, 2.5, -4, g).receiveShadow = true
    box(11.6, 0.3, 24, concrete, X, 5.15, -4, g)
    // The bay opening at z 8 (a roll-up door rolled up), night outside.
    for (const sx of [-1, 1]) box(3.5, 5, 0.3, concrete, X + sx * 3.75, 2.5, 8.15, g)
    box(4.0, 1.0, 0.3, concrete, X, 4.5, 8.15, g)
    cyl(0.25, 0.25, 4.2, galv, X, 4.2, 7.9, g, 16).rotation.z = PI / 2
    const night = mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0x07090c }), X, 3, 11.5, g)
    night.rotation.y = PI
    const yard = mesh(new THREE.PlaneGeometry(10, 10), pbr('asphalt', 0x1f2023), X, 0.001, 13, g)
    yard.rotation.x = -PI / 2
    // Wall between wash and reading room, with a passage for the line.
    for (const sx of [-1, 1]) box(4.9, 7.2, 0.3, concrete, X + sx * 3.1, 3.6, -16, g)
    box(1.3, 4.9, 0.3, concrete, X, 4.75, -16, g)
    // Strip curtain in the passage.
    const strips = new THREE.MeshPhysicalMaterial({ color: 0xc8d6d0, roughness: 0.3, transparent: true, opacity: 0.25, depthWrite: false })
    for (let i = 0; i < 6; i++) box(0.2, 2.2, 0.01, strips, X - 0.5 + i * 0.2, 1.2, -16.2, g).castShadow = false
    // Hazard stripes along the conveyor.
    const hazard = this.stripes()
    for (const sx of [-1, 1]) {
      const h = mesh(new THREE.PlaneGeometry(0.2, 40), new THREE.MeshStandardMaterial({ map: hazard, roughness: 0.8 }), X + sx * 0.82, 0.003, -18, g)
      h.rotation.x = -PI / 2
    }
    // Sodium high-bay lamps over the bay and the wash.
    for (const z of [5, 0, -5, -10]) {
      const lamp = new THREE.Group()
      lamp.position.set(X, 4.95, z)
      g.add(lamp)
      cyl(0.02, 0.02, 0.6, galv, 0, -0.3, 0, lamp, 6)
      const shade = turned(
        [
          [0.05, 0],
          [0.12, -0.05],
          [0.32, -0.3],
          [0.3, -0.31],
          [0.1, -0.06],
        ],
        galv,
        24,
        lamp,
      )
      shade.position.y = -0.6
      const bulb = mesh(new THREE.CircleGeometry(0.28, 24), this.sodium, 0, -0.9, 0, lamp)
      bulb.rotation.x = PI / 2
    }
    if (models.camera) {
      for (const [x, y, z, ry] of [
        [X + 5.3, 4.2, 7.5, PI + 0.6],
        [X - 5.3, 4.2, -14.5, -0.5],
      ] as const) {
        const cam = models.camera.clone(true)
        cam.position.set(x, y, z)
        cam.rotation.y = ry
        g.add(cam)
      }
    }
    // Lockers of a sort: crates and a wet-floor sign in the bay.
    if (models.wetSign) {
      const ws = models.wetSign.clone(true)
      ws.position.set(X - 1.6, 0, -4.5)
      ws.rotation.y = 0.4
      g.add(ws)
    }
    // The guards' desk with a lamp and the manifest's clipboard spot.
    const deskG = new THREE.Group()
    deskG.position.set(X + 4.3, 0, 1.5)
    g.add(deskG)
    rbox(1.2, 0.04, 0.6, galv, 0, 0.76, 0, deskG, 0.01)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.02, 0.02, 0.76, galv, sx * 0.55, 0.38, sz * 0.26, deskG, 8)
    // The clipboard held by Guard 1 (the director moves it with his hand).
    this.manifest = new THREE.Group()
    g.add(this.manifest)
    rbox(0.24, 0.32, 0.008, std(0x6a4a2a, 0.6), 0, 0, 0, this.manifest, 0.003)
    const sheet = canvasPlane(0.21, 0.28, 512, S.manifest)
    sheet.mesh.position.z = 0.006
    this.manifest.add(sheet.mesh)
    rbox(0.08, 0.03, 0.012, hardware().steel, 0, 0.14, 0.008, this.manifest, 0.004)

    // ——— The van ———
    this.van = van(pbr('painted', 0xf0f1ef, { roughness: 0.4 }), dark, new THREE.MeshPhysicalMaterial({ color: 0x15191d, roughness: 0.05, transparent: true, opacity: 0.6 }))
    this.van.group.position.set(X, 0, 6.5)
    this.van.group.rotation.y = 0
    g.add(this.van.group)

    // ——— The conveyor ———
    const bc = document.createElement('canvas')
    bc.width = 64
    bc.height = 256
    const bx = bc.getContext('2d')!
    bx.fillStyle = '#26282a'
    bx.fillRect(0, 0, 64, 256)
    bx.fillStyle = '#3a3d40'
    for (let y = 0; y < 256; y += 16) bx.fillRect(0, y, 64, 5)
    this.beltTex = new THREE.CanvasTexture(bc)
    this.beltTex.wrapS = this.beltTex.wrapT = THREE.RepeatWrapping
    this.beltTex.repeat.set(1, 40 / 2.4)
    this.beltTex.colorSpace = THREE.SRGBColorSpace
    const belt = mesh(new THREE.PlaneGeometry(1.2, 40), new THREE.MeshStandardMaterial({ map: this.beltTex, roughness: 0.6, metalness: 0.2 }), X, BELT_Y, -18, g)
    belt.rotation.x = -PI / 2
    belt.receiveShadow = true
    for (const sx of [-1, 1]) {
      box(0.12, 0.2, 40, galv, X + sx * 0.66, 0.1, -18, g).receiveShadow = true
      box(0.04, 0.04, 40, steel, X + sx * 0.64, 0.24, -18, g)
    }
    // Two restraint frames (333's, and 334's behind him).
    for (let i = 0; i < 2; i++) {
      const f = restraintFrame(steel, std(0x1a1b1c, 0.4))
      g.add(f.group)
      this.frames.push(f)
    }

    // ——— The wash tunnel ———
    for (const z of [-7, -9.5, -11]) {
      for (const sx of [-1, 1]) rbox(0.18, 2.9, 0.18, galv, X + sx * 1.35, 1.45, z, g, 0.02)
      rbox(2.88, 0.22, 0.24, galv, X, 2.95, z, g, 0.02)
      const beacon = new THREE.Group()
      beacon.position.set(X + 1.2, 3.12, z)
      g.add(beacon)
      cyl(0.08, 0.09, 0.05, std(0x222222, 0.5), 0, 0, 0, beacon, 16)
      const dome = mesh(new THREE.SphereGeometry(0.075, 16, 10, 0, PI * 2, 0, PI / 2), this.beaconMat, 0, 0.02, 0, beacon)
      dome.userData.dome = true
      const flap = rbox(0.02, 0.07, 0.12, std(0x111111, 0.5), 0, 0.05, 0, beacon, 0.005)
      flap.userData.flap = true
      this.beacons.push(beacon)
    }
    // Foam bar (z −7) and water bars (z −9.5): pipes with nozzles.
    for (const [z, col] of [
      [-7, 0xe8e8e0],
      [-9.5, 0x8fb4c8],
    ] as const) {
      const pipeMat = pbr('plastic', col, { roughness: 0.4 })
      cyl(0.05, 0.05, 2.6, pipeMat, X, 2.7, z + 0.2, g, 12).rotation.z = PI / 2
      for (const sx of [-1, 1]) cyl(0.04, 0.04, 2.4, pipeMat, X + sx * 1.15, 1.4, z + 0.2, g, 10)
    }
    // Brushes: two vertical (blue-grey), one horizontal on top.
    const bristle = pbr('fabric', 0x5d7183, { roughness: 1, bump: 3 })
    for (const sx of [-1, 1]) {
      const b = cyl(0.35, 0.35, 2.2, bristle, X + sx * 0.9, 1.3, -11, g, 24)
      b.castShadow = true
      this.brushes.push(b)
      cyl(0.03, 0.03, 2.6, steel, X + sx * 0.9, 1.4, -11, g, 8)
    }
    this.topBrush = cyl(0.25, 0.25, 2.2, bristle, X, 2.15, -11.3, g, 24)
    this.topBrush.rotation.z = PI / 2
    // Drain grates.
    const grate = std(0x1b1c1d, 0.6)
    for (let i = 0; i < 8; i++) box(2.4, 0.01, 0.06, grate, X, 0.006, -7.2 - i * 0.7, g)
    // BAŞLA.
    rbox(0.1, 1.6, 0.1, galv, X - 1.7, 0.8, -6.3, g, 0.01)
    this.startLamp = canvasPlane(0.42, 0.16, 256, (c, W, H) => S.startLamp(c, W, H, false), { emissive: true })
    this.startLamp.mesh.position.set(X - 1.7, 1.7, -6.24)
    g.add(this.startLamp.mesh)
    // Foam and spray particles (placed by the director round the man).
    this.foam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 1), std(0xf8f8f4, 0.9), 220)
    this.foam.frustumCulled = false
    this.foam.count = 0
    const rand = mulberry32(3)
    for (let i = 0; i < 220; i++) this.foamSeeds.push([rand(), rand(), rand(), rand()])
    g.add(this.foam)
    this.spray = new THREE.InstancedMesh(new THREE.BoxGeometry(0.006, 0.006, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 1.0, 1.1), transparent: true, opacity: 0.45, depthWrite: false }), 160)
    this.spray.frustumCulled = false
    this.spray.count = 0
    g.add(this.spray)

    // ——— The reading room ———
    const room = new THREE.Group()
    g.add(room)
    const wallDark = pbr('concrete', 0x1a1b1c, { roughness: 1 })
    for (const sx of [-1, 1]) box(0.3, 7.2, 11, wallDark, X + sx * 4.65, 3.6, -21.5, room).receiveShadow = true
    box(9.6, 0.3, 11, wallDark, X, 7.35, -21.5, room)
    // The far wall with the screens over the passage on.
    for (const sx of [-1, 1]) box(4.0, 7.2, 0.3, wallDark, X + sx * 2.65, 3.6, -27.15, room)
    box(1.3, 4.9, 0.3, wallDark, X, 4.75, -27.15, room)
    const sc = canvasPlane(8, 4.5, 1280, (c, W, H) => this.drawScreens(c, W, H, 0, 0), { emissive: true })
    this.screens = sc
    this.screenMat = sc.material as THREE.MeshBasicMaterial
    sc.mesh.position.set(X, 4.65, -26.98)
    room.add(sc.mesh)
    rbox(8.2, 4.7, 0.06, dark, X, 4.65, -27.0, room, 0.01)
    const cone = pbr('fabric', 0x1c1d1f, { roughness: 1 })
    for (const sx of [-1, 1]) {
      const sp = speaker(black, cone)
      sp.group.position.set(X + sx * 4.4, 0, -21)
      sp.group.rotation.y = -sx * PI / 2
      room.add(sp.group)
      this.speakers.push(sp)
    }
    const clock = wallClock(std(0x222222, 0.5), std(0xe8e4d8, 0.5), std(0x111111, 0.5))
    clock.set(18 + 44 / 60)
    clock.group.position.set(X - 4.48, 4.7, -24.2)
    clock.group.rotation.y = PI / 2
    room.add(clock.group)
    // The overhead arm that lifts the hood.
    this.gantry = new THREE.Group()
    this.gantry.position.set(X, 7.2, -17.2)
    room.add(this.gantry)
    rbox(0.3, 0.2, 0.3, galv, 0, 0, 0, this.gantry, 0.02)
    const rod = cyl(0.03, 0.03, 1, steel, 0, -0.5, 0, this.gantry, 10)
    rod.name = 'rod'
    this.gripper = new THREE.Group()
    this.gantry.add(this.gripper)
    rbox(0.18, 0.06, 0.18, galv, 0, 0, 0, this.gripper, 0.01)
    for (const sx of [-1, 1]) rbox(0.02, 0.14, 0.05, steel, sx * 0.08, -0.08, 0, this.gripper, 0.006)

    // ——— The injection station ———
    const st = new THREE.Group()
    g.add(st)
    for (const sx of [-1, 1]) box(0.1, 2.4, 4.2, white, X + sx * 2.5, 1.2, -32, st).receiveShadow = true
    box(5.1, 0.1, 4.2, white, X, 2.45, -32, st)
    for (const z of [-29.9, -34.1]) {
      for (const sx of [-1, 1]) box(1.85, 2.4, 0.1, white, X + sx * 1.6, 1.2, z, st)
      box(1.3, 0.1, 0.1, white, X, 2.35, z, st)
    }
    const panel = mesh(new THREE.PlaneGeometry(3, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.55, 1.6) }), X, 2.39, -32, st)
    panel.rotation.x = PI / 2
    // The three arms: the pill arm (left), the lens arm (top right), the injector (right).
    this.pillArm = new THREE.Group()
    st.add(this.pillArm)
    const pa = cyl(0.03, 0.03, 0.8, whiteGloss, 0, 0.4, 0, this.pillArm, 12)
    pa.rotation.z = PI / 2
    pa.position.set(0.4, 0, 0)
    mesh(new THREE.SphereGeometry(0.05, 14, 10), whiteGloss, 0.8, 0, 0, this.pillArm)
    this.pillCup = paperCup(std(0xf6f4ee, 0.85), undefined, std(0xffffff, 0.3))
    this.pillCup.position.set(0, 0, 0)
    this.pillArm.add(this.pillCup)
    this.lens = lensArm(whiteGloss, std(0x16303a, 0.1))
    st.add(this.lens.group)
    this.injector = new THREE.Group()
    st.add(this.injector)
    const body = cyl(0.025, 0.025, 0.32, whiteGloss, 0, 0, 0, this.injector, 14)
    body.rotation.x = PI / 2
    const tip = cyl(0.002, 0.008, 0.06, pbr('metal', 0xd0d4d6, { roughness: 0.2 }), 0, 0, -0.19, this.injector, 8)
    tip.rotation.x = PI / 2
    const injArm = cyl(0.025, 0.025, 1.0, whiteGloss, 0.5, 0, 0.1, this.injector, 10)
    injArm.rotation.z = PI / 2
    if (models.medical) {
      const med = models.medical.clone(true)
      med.position.set(X - 2.2, 1.0, -33.4)
      med.rotation.y = PI / 2
      st.add(med)
      rbox(0.5, 1.0, 0.6, white, X - 2.2, 0.5, -33.4, st, 0.01)
    }
    // ——— The line's end: a dark slot ———
    box(6, 3, 0.3, concrete, X, 1.5 + 0.6, -38.15, g)
    for (const sx of [-1, 1]) box(2.1, 0.6, 0.3, concrete, X + sx * 1.95, 0.3, -38.15, g)
    const slot = mesh(new THREE.PlaneGeometry(1.8, 0.6), new THREE.MeshBasicMaterial({ color: 0x000000 }), X, 0.3, -38.3, g)
    slot.rotation.y = 0
    for (const sx of [-1, 1]) box(0.3, 3, 4.0, concrete, X + sx * 3.0, 1.5, -36.2, g)
    box(6.3, 0.2, 4.0, concrete, X, 3.0, -36.2, g)
    if (models.tube) {
      for (const z of [-17.5, -36]) {
        const t = models.tube.clone(true)
        t.position.set(X, z < -30 ? 2.88 : 7.1, z)
        t.rotation.x = PI
        g.add(t)
      }
    }
  }

  private stripes() {
    const c = document.createElement('canvas')
    c.width = 32
    c.height = 256
    const x = c.getContext('2d')!
    x.fillStyle = '#d8a020'
    x.fillRect(0, 0, 32, 256)
    x.fillStyle = '#151515'
    for (let y = -32; y < 256; y += 32) {
      x.beginPath()
      x.moveTo(0, y)
      x.lineTo(32, y + 16)
      x.lineTo(32, y + 32)
      x.lineTo(0, y + 16)
      x.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1, 40)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }

  /** The twelve screens, drawn into one canvas (4 × 3), bezels between them. */
  drawScreens(c: CanvasRenderingContext2D, W: number, H: number, t: number, amp: number) {
    c.fillStyle = '#020304'
    c.fillRect(0, 0, W, H)
    const cw = W / 4
    const ch = H / 3
    if (!this.sub) {
      this.sub = document.createElement('canvas')
      this.sub.width = Math.round(cw)
      this.sub.height = Math.round(ch)
    }
    const sub = this.sub
    const sx = sub.getContext('2d')!
    for (let i = 0; i < 12; i++) {
      const col = i % 4
      const row = Math.floor(i / 4)
      S.readingScreen(sx, sub.width, sub.height, i, t, amp)
      c.drawImage(sub, col * cw + 6, row * ch + 6, cw - 12, ch - 12)
    }
  }

  /** Redraws the wall (at most ~12 times a second) with the voice's loudness. */
  updateScreens(t: number, amp: number, on: number) {
    const k = Math.floor(t * 8)
    this.screens.redraw((c, W, H) => this.drawScreens(c, W, H, k / 8, amp), `${k}:${Math.round(amp * 5)}`)
    this.screenMat.color.setScalar(on)
  }
}

export { std }
