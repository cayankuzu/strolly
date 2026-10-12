/**
 * Set E — ODA 3 (x 157.5…162.5, z −2.5…2.5, 3 m) and the white corridor south
 * of it (x 158.5…161.5, z 2.65…12).
 *
 * Two rooms in one place. `hallu` is what Arif sees: the boss's office of set
 * A translated by (+160, 0, +6.5), every surface on the reveal shader, so the
 * office arrives over the white. `real` is the room as it is: white, lit,
 * a flush door with a hairline seam, a hatch at floor level in the north wall,
 * the tray, and what the orderlies and the cleaners deal with.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { canvasPlane, ceilingPanel, hardware, rbox, room, std, tube } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { bossOffice, type BossOffice, type OfficeMats } from './office'
import { revealify, revealUniforms, type RevealU } from './reveal'
import * as S from './screens'

const PI = Math.PI
export const ROOM = { x: 160, z: 0 }
export const OFFICE_SHIFT = new THREE.Vector3(160, 0, 6.5)

function blotTexture(seed: number, streak = false) {
  const c = document.createElement('canvas')
  c.width = streak ? 512 : 256
  c.height = streak ? 128 : 256
  const g = c.getContext('2d')!
  const rand = mulberry32(seed)
  g.clearRect(0, 0, c.width, c.height)
  const n = streak ? 26 : 14
  for (let i = 0; i < n; i++) {
    const x = streak ? (i / n) * c.width : c.width * (0.3 + rand() * 0.4)
    const y = c.height * (0.5 + (rand() - 0.5) * (streak ? 0.35 : 0.4))
    const r = (streak ? 26 : 30) * (0.5 + rand())
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    const a = 0.55 + rand() * 0.35
    grad.addColorStop(0, `rgba(58,18,14,${a})`)
    grad.addColorStop(0.7, `rgba(70,24,18,${a * 0.6})`)
    grad.addColorStop(1, 'rgba(70,24,18,0)')
    g.fillStyle = grad
    g.beginPath()
    g.ellipse(x, y, r * (streak ? 1.6 : 1), r * (0.6 + rand() * 0.5), rand() * PI, 0, PI * 2)
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62)
  grad.addColorStop(0, 'rgba(70,74,78,0.32)')
  grad.addColorStop(1, 'rgba(70,74,78,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export class WhiteRoom {
  readonly group = new THREE.Group()
  readonly hallu = new THREE.Group()
  readonly real = new THREE.Group()
  readonly corridor = new THREE.Group()
  office!: BossOffice
  uShell!: RevealU
  uFurn!: RevealU
  uDoor!: RevealU
  uView!: RevealU
  uMon!: RevealU
  seam!: THREE.Group
  seamMat = new THREE.MeshBasicMaterial({ color: 0x8e979b, transparent: true, opacity: 1, depthWrite: false })
  realDoor!: THREE.Group
  halluLeaf!: THREE.Group
  hatch!: THREE.Mesh
  tray!: THREE.Group
  trayWide!: THREE.Mesh
  ceilNE!: THREE.Mesh
  ceilMat!: THREE.MeshBasicMaterial
  ceilNEMat!: THREE.MeshBasicMaterial
  blood!: THREE.Group
  bloodMats: THREE.MeshBasicMaterial[] = []
  smear!: THREE.Mesh
  smearMat!: THREE.MeshBasicMaterial
  smear2!: THREE.Mesh
  shadow!: THREE.Mesh
  plate!: ReturnType<typeof canvasPlane>
  statusLight!: THREE.Mesh
  statusMat = new THREE.MeshBasicMaterial({ color: 0xe8a040 })
  trolley!: THREE.Group
  mop!: THREE.Group
  scrubber!: THREE.Group
  clipboard!: THREE.Group
  wetSign: THREE.Group | null = null
  shards!: THREE.InstancedMesh
  shardSeeds: Array<[number, number, number, number]> = []
  rays: THREE.Mesh[] = []
  rayMat!: THREE.MeshBasicMaterial
  white = std(0xf2f4f4, 0.92)
  mintWall = pbr('painted', 0xe6f1ee, { roughness: 1 })

  build(m: OfficeMats, models: { camera: THREE.Group | null; wetSign: THREE.Group | null }, morning: THREE.Texture) {
    const g = this.group
    g.add(this.hallu, this.real, this.corridor)

    // ——— The hallucination: the boss's office, arriving over white ———
    const holder = new THREE.Group()
    holder.position.copy(OFFICE_SHIFT)
    this.hallu.add(holder)
    this.office = bossOffice(m, { doorW: 1.0, morning })
    holder.add(this.office.root)
    // The leaf slides into the wall here; its face sits flush with the wall.
    this.halluLeaf = this.office.door.leaf
    this.halluLeaf.position.z = -0.051
    this.uShell = revealUniforms()
    this.uFurn = revealUniforms(this.uShell)
    this.uFurn.uDelay.value = 0.7
    this.uDoor = revealUniforms(this.uShell)
    this.uDoor.uHide.value = 1
    this.uView = revealUniforms(this.uShell)
    this.uView.uMode.value = 1
    this.uView.uSeed.value.set(160, 1.7, -2.5, 0.0035)
    this.uMon = revealUniforms(this.uShell)
    this.uMon.uDelay.value = 0.76
    // Door frame first (it discards until it arrives), then the rest.
    const leaf = this.office.door.leaf
    this.office.door.frame.remove(leaf)
    revealify(this.office.door.frame, this.uDoor)
    this.office.door.frame.add(leaf)
    revealify(leaf, this.uShell)
    revealify(this.office.monitor, this.uMon)
    revealify(this.office.view, this.uView)
    revealify(this.office.furniture, this.uFurn)
    revealify(this.office.shell, this.uShell)
    // Light shafts from the window (part of the morning that arrives).
    this.rayMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    for (let i = 0; i < 3; i++) {
      const ray = mesh(new THREE.PlaneGeometry(0.9, 3.6), this.rayMat, 159.0 + i * 0.95, 1.55, -1.25, this.hallu)
      ray.rotation.set(-0.95, -0.55, 0)
      this.rays.push(ray)
    }
    // The faint shadow cast by nothing.
    this.shadow = mesh(new THREE.PlaneGeometry(1.9, 0.9), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }), 161.3, 0.004, -1.9, this.hallu)
    this.shadow.rotation.x = -PI / 2

    // White shards for the monitor bursting.
    this.shards = new THREE.InstancedMesh(new THREE.BoxGeometry(0.028, 0.028, 0.028), new THREE.MeshBasicMaterial({ color: 0xffffff }), 140)
    this.shards.frustumCulled = false
    this.shards.count = 0
    const rand = mulberry32(77)
    for (let i = 0; i < 140; i++) this.shardSeeds.push([rand() * 2 - 1, rand() * 1.2 - 0.2, rand() * 2 - 1, 0.4 + rand() * 0.9])
    this.hallu.add(this.shards)

    // ——— The room as it is ———
    const r = room({
      w: 5,
      d: 5,
      h: 3,
      x: ROOM.x,
      z: ROOM.z,
      wall: this.white,
      floor: std(0xeef0f0, 0.85),
      ceiling: null,
      trim: null,
      openings: [
        { side: 's', at: 0, width: 1.0, height: 2.1 },
        { side: 'n', at: 1.25, width: 2.1, height: 0.5 },
      ],
    })
    this.real.add(r)
    // The luminous ceiling: four panels, the north-east one can go dim.
    this.ceilMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.62, 1.62) })
    this.ceilNEMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.62, 1.62) })
    for (const [x, z] of [
      [158.75, -1.25],
      [158.75, 1.25],
      [161.25, 1.25],
      [161.25, -1.25],
    ] as const) {
      const ne = x > 160 && z < 0
      const p = mesh(new THREE.PlaneGeometry(2.48, 2.48), ne ? this.ceilNEMat : this.ceilMat, x, 3.0, z, this.real)
      p.rotation.x = PI / 2
      if (ne) this.ceilNE = p
    }
    // Ceiling grid lines between the panels.
    const grid = std(0xd5dadb, 0.6)
    box(5, 0.02, 0.03, grid, 160, 2.995, 0, this.real)
    box(0.03, 0.02, 5, grid, 160, 2.995, 0, this.real)
    // A camera high in the south-west corner.
    if (models.camera) {
      const cam = models.camera.clone(true)
      cam.position.set(157.72, 2.62, 2.28)
      cam.rotation.set(0, -2.35, 0)
      this.real.add(cam)
    }

    // The doors (real flush panel; the hallucinated leaf slides with it).
    this.realDoor = new THREE.Group()
    this.realDoor.position.set(160, 0, 2.548)
    this.real.add(this.realDoor)
    rbox(1.0, 2.1, 0.09, this.white, 0, 1.05, 0, this.realDoor, 0.002)
    // The hairline seam round the closed door, on both faces.
    this.seam = new THREE.Group()
    this.seam.position.set(160, 0, 2.497)
    this.group.add(this.seam)
    for (const [w, h, x, y] of [
      [0.004, 2.1, -0.5, 1.05],
      [0.004, 2.1, 0.5, 1.05],
      [1.004, 0.004, 0, 2.1],
    ] as const)
      mesh(new THREE.PlaneGeometry(w, h), this.seamMat, x, y, 0, this.seam).rotation.y = PI
    // The hatch: flush when shut, slides up into the wall; a dark slot behind it.
    this.hatch = box(2.1, 0.5, 0.06, this.white, 161.25, 0.25, -2.533, this.real)
    const dark = std(0x050505, 1)
    box(2.2, 0.05, 2.0, dark, 161.25, 0.55, -3.6, this.real)
    box(0.05, 0.6, 2.0, dark, 160.15, 0.25, -3.6, this.real)
    box(0.05, 0.6, 2.0, dark, 162.35, 0.25, -3.6, this.real)
    box(2.2, 0.6, 0.05, dark, 161.25, 0.25, -4.6, this.real)
    // The tray on its rails.
    this.tray = new THREE.Group()
    this.real.add(this.tray)
    const trayMat = std(0xf4f6f6, 0.45)
    rbox(2.0, 0.06, 0.9, trayMat, 0, 0.06, 0, this.tray, 0.01)
    this.trayWide = rbox(2.0, 0.06, 0.9, trayMat, 0, 0.06, 0.82, this.tray, 0.01)
    for (const sz of [-0.38, 0.38]) rbox(2.0, 0.03, 0.04, pbr('metal', 0xb9bec2, { roughness: 0.3 }), 0, 0.015, sz, this.tray, 0.006)
    // Rails in the floor.
    for (const x of [160.4, 162.1]) box(0.03, 0.004, 1.1, std(0xc9cfd1, 0.5), x, 0.002, -2.0, this.real)

    // Blood: dark smears round the corner, and the long one drawn toward the door.
    this.blood = new THREE.Group()
    this.real.add(this.blood)
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: blotTexture(30 + i), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
      this.bloodMats.push(mat)
      const b = mesh(new THREE.PlaneGeometry(0.7 + i * 0.12, 0.55), mat, [161.6, 160.7, 162.1, 161.0][i], 0.004 + i * 0.0005, [-1.25, -1.35, -1.0, -0.95][i], this.blood)
      b.rotation.set(-PI / 2, 0, i * 0.7)
    }
    this.smearMat = new THREE.MeshBasicMaterial({ map: blotTexture(44, true), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    // A streak from the tray to the door: its length is scaled as it is drawn.
    this.smear = mesh(new THREE.PlaneGeometry(1, 0.32), this.smearMat, 0, 0.006, 0, this.real)
    this.smear.rotation.x = -PI / 2
    this.smear2 = mesh(new THREE.PlaneGeometry(1, 0.32), this.smearMat, 0, 0.0065, 0, this.real)
    this.smear2.rotation.x = -PI / 2

    // The cleaners' trolley, the mop, the scrubber, the clipboard.
    this.trolley = new THREE.Group()
    this.real.add(this.trolley)
    const yellow = pbr('plastic', 0xe8c440, { roughness: 0.6 })
    const grey = pbr('plastic', 0x5a6066, { roughness: 0.7 })
    const chrome = pbr('metal', 0xb9bec2, { roughness: 0.3 })
    rbox(0.9, 0.04, 0.45, grey, 0, 0.18, 0, this.trolley, 0.01)
    rbox(0.9, 0.04, 0.45, grey, 0, 0.82, 0, this.trolley, 0.01)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.012, 0.012, 0.8, chrome, sx * 0.42, 0.5, sz * 0.2, this.trolley, 8)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.04, 0.04, 0.03, hardware().rubber, sx * 0.4, 0.05, sz * 0.18, this.trolley, 12).rotation.x = PI / 2
    const bucket = cyl(0.17, 0.14, 0.3, yellow, -0.2, 0.36, 0, this.trolley, 20)
    bucket.castShadow = true
    cyl(0.155, 0.155, 0.01, std(0x8aa0a4, 0.1), -0.2, 0.49, 0, this.trolley, 20)
    rbox(0.25, 0.25, 0.3, grey, 0.25, 0.32, 0, this.trolley, 0.02)
    for (let i = 0; i < 3; i++) cyl(0.035, 0.035, 0.22, [yellow, std(0x3a7ac8, 0.4), std(0xe0e0e0, 0.4)][i], 0.15 + i * 0.1, 0.95, -0.1, this.trolley, 12)
    this.clipboard = new THREE.Group()
    this.clipboard.position.set(0.15, 0.845, 0.08)
    this.trolley.add(this.clipboard)
    rbox(0.24, 0.008, 0.32, std(0x6a4a2a, 0.6), 0, 0, 0, this.clipboard, 0.003)
    const log = canvasPlane(0.21, 0.28, 512, S.cleaningLog)
    log.mesh.rotation.x = -PI / 2
    log.mesh.position.y = 0.006
    this.clipboard.add(log.mesh)
    rbox(0.08, 0.012, 0.03, chrome, 0, 0.008, -0.14, this.clipboard, 0.004)
    this.mop = new THREE.Group()
    this.real.add(this.mop)
    cyl(0.012, 0.012, 1.4, std(0x2d6ab0, 0.5), 0, 0.72, 0, this.mop, 8)
    const head = rbox(0.42, 0.03, 0.1, std(0xd8d4c8, 1), 0, 0.03, 0, this.mop, 0.01)
    head.castShadow = true
    this.scrubber = new THREE.Group()
    this.real.add(this.scrubber)
    cyl(0.22, 0.22, 0.14, grey, 0, 0.09, 0, this.scrubber, 24)
    rbox(0.3, 0.3, 0.25, yellow, 0, 0.3, -0.05, this.scrubber, 0.03)
    tube(
      [
        [0, 0.4, -0.1],
        [0, 0.8, -0.3],
        [0, 1.0, -0.38],
      ],
      0.015,
      chrome,
      this.scrubber,
    )
    rbox(0.4, 0.03, 0.03, std(0x111111, 0.6), 0, 1.0, -0.38, this.scrubber, 0.01)
    if (models.wetSign) {
      this.wetSign = models.wetSign.clone(true)
      this.real.add(this.wetSign)
    }

    // ——— The corridor ———
    const cor = room({
      w: 3,
      d: 9.5,
      h: 3,
      x: 160,
      z: 7.4,
      wall: this.mintWall,
      floor: pbr('tile', 0xd9dedd, { roughness: 0.6 }),
      ceiling: pbr('plaster', 0xf2f4f3),
      trim: std(0x9fc9bf, 0.6),
      skip: ['n'],
    })
    this.corridor.add(cor)
    for (const z of [4.2, 7.0, 9.8]) {
      const p = ceilingPanel(1.2, 0.6, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.25, 1.42, 1.38) }))
      p.position.set(160, 3.0, z)
      this.corridor.add(p)
    }
    // The other rooms' doors along the corridor, flush, each with its plate.
    const doorMat = std(0xf0f3f2, 0.8)
    for (const [x, z, n, side] of [
      [158.5, 5.6, 'ODA 2', 1],
      [161.5, 5.6, 'ODA 4', -1],
      [158.5, 9.4, 'ODA 1', 1],
      [161.5, 9.4, 'ODA 5', -1],
    ] as const) {
      const d = new THREE.Group()
      d.position.set(x + side * 0.01, 0, z)
      d.rotation.y = side * PI / 2
      this.corridor.add(d)
      rbox(1.0, 2.1, 0.02, doorMat, 0, 1.05, 0, d, 0.002)
      for (const sx of [-0.5, 0.5]) mesh(new THREE.PlaneGeometry(0.004, 2.1), this.seamMat, sx, 1.05, 0.012, d)
      const pl = canvasPlane(0.42, 0.13, 256, (c, W, H) => S.plateText(c, W, H, n))
      pl.mesh.position.set(0, 2.35, 0.012)
      d.add(pl.mesh)
      const light = mesh(new THREE.CircleGeometry(0.03, 16), new THREE.MeshBasicMaterial({ color: 0xe8a040 }), 0.3, 2.35, 0.013, d)
      light.userData.status = true
    }
    // Double doors at the far end, toward the prep rooms.
    const end = new THREE.Group()
    end.position.set(160, 0, 12.14)
    end.rotation.y = PI
    this.corridor.add(end)
    for (const sx of [-1, 1]) {
      rbox(0.68, 2.2, 0.04, doorMat, sx * 0.35, 1.1, 0, end, 0.003)
      box(0.3, 0.4, 0.01, new THREE.MeshPhysicalMaterial({ color: 0xd8efe9, roughness: 0.2, transparent: true, opacity: 0.6 }), sx * 0.35, 1.5, 0.022, end)
      rbox(0.03, 0.3, 0.03, pbr('metal', 0xb9bec2, { roughness: 0.3 }), sx * 0.08, 1.05, 0.04, end, 0.008)
    }
    if (models.camera) {
      const cam = models.camera.clone(true)
      cam.position.set(161.32, 2.7, 11.8)
      cam.rotation.set(0, PI + 0.4, 0)
      this.corridor.add(cam)
    }
    // ODA 3's plate and status light over the door (corridor side).
    this.plate = canvasPlane(0.52, 0.16, 512, (c, W, H) => S.roomPlate(c, W, H, 0))
    this.plate.mesh.position.set(160, 2.45, 2.661)
    this.corridor.add(this.plate.mesh)
    this.statusLight = mesh(new THREE.SphereGeometry(0.03, 16, 10), this.statusMat, 160.33, 2.45, 2.67, this.corridor)
  }

  /** The door: 0 shut (a hairline) … 1 open (slid into the wall). */
  setDoor(open: number) {
    this.realDoor.position.x = 160 + open * 1.02
    this.halluLeaf.position.x = -0.5 + open * 1.02
    this.seamMat.opacity = Math.max(0, 1 - open * 8)
  }

  setReady(ready: boolean) {
    this.plate.redraw((c, W, H) => S.roomPlate(c, W, H, ready ? 1 : 0), ready ? 'ready' : 'busy')
    this.statusMat.color.set(ready ? 0x2fbf71 : 0xe8a040)
  }
}

export { revealify }
