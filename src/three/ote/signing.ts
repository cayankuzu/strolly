/**
 * Set A — the signing room (x −3…4, z −4…3) and, behind the dark glass wall at
 * x −3, the observation room where "we" stand. A walnut table under one
 * pendant cone; the client's chair (+z) and the official's (−z); the door he
 * came in by (z +3) and, directly opposite, the steel door he will leave by
 * (z −4), with cold white light beyond it.
 */
import * as THREE from 'three'
import { canvasPlane, door, pendant, rbox, room, table, tube, turned } from '../kit/props'
import { box, cyl, mesh } from '../util'
import type { Pal } from './materials'
import { drawClausePage, drawFolder, drawLastPage, drawPhotoBack, keyhole } from './draw'

const PI = Math.PI
export const A = {
  chairM: { x: 0, z: 0.85 },
  chairG: { x: 0, z: -0.85 },
  stack: new THREE.Vector3(-0.1, 0.776, 0.3),
  lastStart: new THREE.Vector3(0, 0.7765, -0.32),
  folder: new THREE.Vector3(-0.45, 0.776, -0.2),
  tray: new THREE.Vector3(0.65, 0.776, 0.3),
  penRest1: new THREE.Vector3(0.24, 0.783, 0.47),
  penRest2: new THREE.Vector3(0.25, 0.783, 0.35),
  door2: { x: 0, z: -4.0, hinge: -0.65 },
  /** B1, B2, B3 behind the glass: B2 and B3 frame the table from the opening camera. */
  watchers: [
    { x: -3.6, z: -0.65 },
    { x: -3.75, z: 0.3 },
    { x: -3.62, z: 1.55 },
  ],
} as const

export const HEADERS = ['MADDE 7 · TANIMLAR', 'MADDE 9 · HİZMETİN KAPSAMI', 'MADDE 12 · SORUMLULUK', 'MADDE 14 · İADE KOŞULLARI']

type Plane = ReturnType<typeof canvasPlane>

export class SigningRoom {
  readonly group = new THREE.Group()
  readonly door2 = new THREE.Group()
  readonly pen = new THREE.Group()
  /** Pages: the stack (its top sheet shows the current clause), the sheet being turned, the turned pile. */
  readonly stack = new THREE.Group()
  private stackTop!: Plane
  private stackBody!: THREE.Mesh
  readonly turning = new THREE.Group()
  private turningFront!: Plane
  readonly pile = new THREE.Group()
  private pileBody!: THREE.Mesh
  readonly lastPage = new THREE.Group()
  private lastPlane!: Plane
  readonly folder = new THREE.Group()
  readonly folderCover = new THREE.Group()
  private folderLabel!: Plane
  readonly tray = new THREE.Group()
  readonly lampGlow: THREE.Mesh
  readonly reflection: THREE.Sprite
  readonly coldLight: THREE.Mesh
  readonly underDoor: THREE.Mesh
  readonly tablet: THREE.Group
  private headerKey = -1
  private signKey = -1

  constructor(
    m: Pal,
    private scene: THREE.Scene,
  ) {
    const g = this.group
    scene.add(g)
    // ——— The room ———
    const r = room({
      w: 7,
      d: 7,
      h: 3.0,
      x: 0.5,
      z: -0.5,
      wall: m.wallFabric,
      floor: m.carpet,
      ceiling: m.ceilingDark,
      trim: m.walnutDark,
      skip: ['w'],
      openings: [
        { side: 'n', at: -0.5, width: 1.3, height: 2.4 },
        { side: 's', at: -0.5, width: 0.9, height: 2.1 },
      ],
    })
    g.add(r)
    // Walnut panelling to 1.1 m, with a rail and vertical joints.
    const wains = (x0: number, x1: number, z: number, faceZ: number) => {
      const len = x1 - x0
      if (len <= 0.02) return
      rbox(len, 1.1, 0.03, m.walnut, (x0 + x1) / 2, 0.55, z + faceZ * 0.015, g, 0.004)
      rbox(len, 0.05, 0.05, m.walnutDark, (x0 + x1) / 2, 1.12, z + faceZ * 0.025, g, 0.01)
      for (let x = x0 + 0.6; x < x1 - 0.1; x += 0.6) rbox(0.012, 1.06, 0.006, m.walnutDark, x, 0.55, z + faceZ * 0.033, g, 0.002)
    }
    wains(-3, -0.65, -4, 1)
    wains(0.65, 4, -4, 1)
    wains(-3, -0.45, 3, -1)
    wains(0.45, 4, 3, -1)
    const wainsX = (z0: number, z1: number, x: number, face: number) => {
      const len = z1 - z0
      const p = rbox(0.03, 1.1, len, m.walnut, x + face * 0.015, 0.55, (z0 + z1) / 2, g, 0.004)
      p.castShadow = false
      rbox(0.05, 0.05, len, m.walnutDark, x + face * 0.025, 1.12, (z0 + z1) / 2, g, 0.01)
      for (let z = z0 + 0.6; z < z1 - 0.1; z += 0.6) rbox(0.006, 1.06, 0.012, m.walnutDark, x + face * 0.033, 0.55, z, g, 0.002)
    }
    wainsX(-4, 3, 4, -1)
    // The west side: solid ends and the glass wall between z −3.5 and +2.5.
    box(0.15, 3.0, 0.5, m.wallFabric, -3.075, 1.5, -3.75, g)
    box(0.15, 3.0, 0.5, m.wallFabric, -3.075, 1.5, 2.75, g)
    const glass = mesh(new THREE.PlaneGeometry(6.0, 3.0), m.darkGlass, -3.0, 1.5, -0.5, g)
    glass.rotation.y = PI / 2
    glass.renderOrder = 2
    for (const z of [-3.5, -1.5, 0.5, 2.5]) rbox(0.07, 3.0, 0.07, m.blackMetal, -3.0, 1.5, z, g, 0.01)
    rbox(0.08, 0.06, 6.0, m.blackMetal, -3.0, 0.03, -0.5, g, 0.01)
    rbox(0.08, 0.06, 6.0, m.blackMetal, -3.0, 2.97, -0.5, g, 0.01)
    // The lamp's reflection in the glass: a glow at the lamp's mirror image (x −6), seen through the
    // dark glass from the room side only (the scene hides it when the camera is behind the glass).
    const rc = document.createElement('canvas')
    rc.width = rc.height = 128
    const rx = rc.getContext('2d')!
    const rg = rx.createRadialGradient(64, 64, 2, 64, 64, 62)
    rg.addColorStop(0, 'rgba(255,236,200,1)')
    rg.addColorStop(0.12, 'rgba(255,214,150,0.75)')
    rg.addColorStop(0.4, 'rgba(255,190,120,0.16)')
    rg.addColorStop(1, 'rgba(255,190,120,0)')
    rx.fillStyle = rg
    rx.fillRect(0, 0, 128, 128)
    this.reflection = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 }))
    this.reflection.scale.set(0.7, 0.7, 1)
    this.reflection.position.set(-6.0, 1.78, 0)
    this.reflection.name = 'lampReflection'
    g.add(this.reflection)
    // ——— The observation room (x −6.5…−3): dark, carpet, a low ceiling ———
    const obs = room({ w: 3.5, d: 7, h: 2.8, x: -4.75, z: -0.5, wall: m.obsWall, floor: m.obsFloor, ceiling: m.ceilingDark, trim: null, skip: ['e'] })
    g.add(obs)
    // A console ledge under the glass, a chair pushed in, a door at the back.
    rbox(0.5, 0.06, 5.4, m.blackMetal, -3.3, 0.95, -0.5, g, 0.01)
    rbox(0.04, 0.9, 5.4, m.obsWall, -3.1, 0.47, -0.5, g, 0.01)
    rbox(0.05, 2.1, 0.95, m.blackMetal, -6.47, 1.05, 2.0, g, 0.01)
    // A frosted partition at the back, faintly lit from behind: "we" read as silhouettes from the room.
    const frost = mesh(new THREE.PlaneGeometry(3.4, 2.0), new THREE.MeshBasicMaterial({ color: 0x1b2430 }), -6.44, 1.25, -0.4, g)
    frost.rotation.y = PI / 2
    frost.name = 'frost'
    // B2's tablet (placed by the scene in her hand).
    this.tablet = new THREE.Group()
    rbox(0.18, 0.012, 0.25, m.blackMetal, 0, 0, 0, this.tablet, 0.01)
    const tScreen = mesh(new THREE.PlaneGeometry(0.16, 0.23), m.tabletGlow, 0, 0.0065, 0, this.tablet)
    tScreen.rotation.x = -PI / 2
    scene.add(this.tablet)

    // ——— Door 1 (south, the way he came in): walnut, closed; daylight under it ———
    const d1 = door({ w: 0.9, h: 2.1, frame: m.walnutDark, leaf: m.walnut, handle: m.brass })
    d1.group.position.set(0, 0, 3.0)
    d1.group.rotation.y = PI
    g.add(d1.group)
    this.underDoor = mesh(new THREE.PlaneGeometry(0.86, 0.016), m.daylightLine, 0, 0.008, 2.985, g)
    this.underDoor.rotation.y = PI
    // A little daylight on the carpet in front of it.
    const spill = mesh(
      new THREE.PlaneGeometry(1.0, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffe2b8, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending }),
      0,
      0.003,
      2.75,
      g,
    )
    spill.rotation.x = -PI / 2

    // ——— Door 2 (north, the other door): brushed steel, flush, no handle on this side ———
    this.door2.position.set(A.door2.hinge, 0, -4.0)
    g.add(this.door2)
    const leaf = rbox(1.38, 2.44, 0.12, m.brushed, 0.65, 1.22, -0.06, this.door2, 0.006)
    leaf.name = 'door2'
    leaf.castShadow = true
    const emblem = canvasPlane(0.14, 0.14, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      keyhole(ctx, w / 2, h * 0.32, w * 0.16, '#2a2c2f', 7)
    }, { transparent: true })
    emblem.mesh.position.set(0.65, 1.5, 0.002)
    this.door2.add(emblem.mesh)
    // The frame and a shadow gap around the opening.
    for (const sx of [-1, 1]) rbox(0.04, 2.44, 0.2, m.blackMetal, sx * 0.67, 1.22, -4.0, g, 0.004)
    rbox(1.38, 0.04, 0.2, m.blackMetal, 0, 2.42, -4.0, g, 0.004)
    // Beyond it: a short white passage that glows.
    const passage = room({ w: 1.3, d: 2.2, h: 2.4, x: 0, z: -5.1, wall: m.coldLight, floor: m.coldLight, ceiling: m.coldLight, trim: null, skip: ['s'] })
    g.add(passage)
    this.coldLight = passage.children[0] as THREE.Mesh

    // ——— The table, the chairs, the lamp ———
    const t = table(2.0, 1.1, 0.76, m.walnutTop, m.walnut)
    g.add(t)
    for (const [z, yaw] of [
      [A.chairM.z, PI],
      [A.chairG.z, 0],
    ] as const) {
      const c = leatherChair(m)
      c.position.set(0, 0, z)
      c.rotation.y = yaw
      g.add(c)
    }
    const lamp = pendant(m.lampShade, m.blackMetal, 1.02)
    lamp.position.set(0, 3.0, 0)
    lamp.scale.set(1.12, 1, 1.12)
    g.add(lamp)
    lamp.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh && mm.material === m.lampShade) mm.material = m.lampShade
    })
    // Brass rim, the glow inside the cone, the bulb.
    const rim = mesh(new THREE.TorusGeometry(0.224, 0.006, 8, 48), m.brass, 0, 1.75, 0, g)
    rim.rotation.x = PI / 2
    this.lampGlow = mesh(new THREE.CircleGeometry(0.215, 40), m.lampInner, 0, 1.752, 0, g)
    this.lampGlow.rotation.x = PI / 2
    mesh(new THREE.SphereGeometry(0.035, 16, 12), m.bulb, 0, 1.84, 0, g)

    // ——— On the table ———
    // The stack of ~42 sheets; the top one shows a clause.
    this.stackBody = rbox(0.21, 0.008, 0.297, m.paper, 0, 0.004, 0, this.stack, 0.001)
    this.stackTop = canvasPlane(0.21, 0.297, 512, drawClausePage(HEADERS[0], 7))
    this.stackTop.mesh.rotation.x = -PI / 2
    this.stackTop.mesh.position.y = 0.0085
    this.stack.add(this.stackTop.mesh)
    this.stack.position.copy(A.stack)
    g.add(this.stack)
    // The sheet being turned (hinged at its left edge) and the pile of turned sheets beside the stack.
    this.turningFront = canvasPlane(0.21, 0.297, 512, drawClausePage(HEADERS[0], 7))
    this.turningFront.mesh.position.set(0.105, 0, 0)
    this.turningFront.mesh.rotation.x = -PI / 2
    this.turning.add(this.turningFront.mesh)
    const back = mesh(new THREE.PlaneGeometry(0.21, 0.297), m.paperWarm, 0.105, -0.0004, 0, this.turning)
    back.rotation.x = PI / 2
    g.add(this.turning)
    this.pileBody = rbox(0.21, 0.004, 0.297, m.paperWarm, 0, 0.002, 0, this.pile, 0.001)
    this.pile.position.set(A.stack.x - 0.215, A.stack.y, A.stack.z)
    g.add(this.pile)
    // The last page.
    this.lastPlane = canvasPlane(0.21, 0.297, 768, drawLastPage(0))
    this.lastPlane.mesh.rotation.x = -PI / 2
    this.lastPage.add(this.lastPlane.mesh)
    g.add(this.lastPage)
    // The folder: a back cover and a cover hinged on its left edge; the label on top.
    rbox(0.24, 0.003, 0.32, m.folderCard, 0, 0.0015, 0, this.folder, 0.001)
    this.folderCover.position.set(-0.12, 0.004, 0)
    rbox(0.24, 0.003, 0.32, m.folderCard, 0.12, 0, 0, this.folderCover, 0.001)
    this.folderLabel = canvasPlane(0.24, 0.32, 512, drawFolder('DOSYA K3-33'))
    this.folderLabel.mesh.rotation.x = -PI / 2
    this.folderLabel.mesh.position.set(0.12, 0.0017, 0)
    this.folderCover.add(this.folderLabel.mesh)
    this.folder.add(this.folderCover)
    this.folder.position.copy(A.folder)
    g.add(this.folder)
    // The tray: keys on a ring, an empty open wallet, a photo face down.
    const trayBase = rbox(0.3, 0.008, 0.2, m.brushed, 0, 0.004, 0, this.tray, 0.002)
    trayBase.receiveShadow = true
    for (const [w, d, x, z] of [
      [0.3, 0.012, 0, 0.1],
      [0.3, 0.012, 0, -0.1],
      [0.012, 0.2, 0.15, 0],
      [0.012, 0.2, -0.15, 0],
    ] as const)
      rbox(w, 0.016, d, m.brushed, x, 0.012, z, this.tray, 0.002)
    const ring = mesh(new THREE.TorusGeometry(0.014, 0.0016, 6, 20), m.brushed, -0.08, 0.011, -0.03, this.tray)
    ring.rotation.x = PI / 2
    for (let k = 0; k < 3; k++) {
      const key = new THREE.Group()
      key.position.set(-0.08 + Math.cos(k * 0.9) * 0.014, 0.0105, -0.03 + Math.sin(k * 0.9) * 0.014)
      key.rotation.y = -0.5 + k * 0.7
      cyl(0.009, 0.009, 0.002, k === 1 ? m.brass : m.brushed, 0, 0, 0.012, key, 16)
      rbox(0.006, 0.0015, 0.04, k === 1 ? m.brass : m.brushed, 0, 0, 0.04, key, 0.0006)
      this.tray.add(key)
    }
    // The wallet, open and empty.
    const wl = new THREE.Group()
    wl.position.set(0.035, 0.01, 0.0)
    wl.rotation.y = 0.15
    rbox(0.095, 0.004, 0.08, m.wallet, -0.048, 0, 0, wl, 0.003)
    rbox(0.095, 0.004, 0.08, m.wallet, 0.048, 0.001, 0, wl, 0.003)
    rbox(0.085, 0.002, 0.02, m.walnutDark, 0.048, 0.0035, -0.025, wl, 0.001)
    this.tray.add(wl)
    const photo = canvasPlane(0.1, 0.15, 256, drawPhotoBack)
    photo.mesh.rotation.set(-PI / 2, 0, 1.45)
    photo.mesh.position.set(0.075, 0.0095, 0.045)
    this.tray.add(photo.mesh)
    this.tray.position.copy(A.tray)
    g.add(this.tray)
    // The blue pen: navy barrel, silver clip and cap ring, a fine tip (axis along +y, tip at −y).
    cyl(0.0052, 0.0058, 0.12, m.pen, 0, 0.0, 0, this.pen, 16)
    cyl(0.0058, 0.0058, 0.006, m.penClip, 0, 0.036, 0, this.pen, 16)
    const cone = mesh(new THREE.ConeGeometry(0.0052, 0.016, 16), m.penClip, 0, -0.068, 0, this.pen)
    cone.rotation.x = PI
    rbox(0.0025, 0.04, 0.003, m.penClip, 0, 0.042, 0.0062, this.pen, 0.001)
    this.pen.traverse((o) => (o.castShadow = true))
    scene.add(this.pen)
    // A carafe and a glass, untouched, at the far end.
    const carafe = turned(
      [
        [0, 0],
        [0.045, 0],
        [0.05, 0.02],
        [0.052, 0.12],
        [0.03, 0.19],
        [0.026, 0.23],
        [0.028, 0.235],
      ],
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transparent: true, opacity: 0.22, depthWrite: false }),
      32,
      g,
    )
    carafe.position.set(0.82, 0.776, -0.35)
    tube(
      [
        [0.4, 0.776, -0.5],
        [0.38, 0.776, -0.52],
      ],
      0.001,
      m.blackMetal,
      g,
    )
  }

  /** Which clause shows on top of the stack (index into HEADERS). */
  setHeader(i: number) {
    if (i === this.headerKey) return
    this.headerKey = i
    this.stackTop.redraw(drawClausePage(HEADERS[i], 7 + i * 5), `h${i}`)
  }

  /** The sheet being turned: shows header i, flipped by `t` (0 flat on the stack … 1 on the pile). */
  setTurning(i: number, t: number) {
    this.turning.visible = t > 0.001 && t < 0.999
    if (!this.turning.visible) return
    this.turningFront.redraw(drawClausePage(HEADERS[i], 7 + i * 5), `t${i}`)
    this.turning.position.set(A.stack.x - 0.105, A.stack.y + 0.0095 + Math.sin(t * PI) * 0.004, A.stack.z)
    this.turning.rotation.set(0, 0, t * PI)
    // Paper bends: lift in the middle of the turn.
    this.turning.scale.set(1, 1, 1)
  }

  /** The turned pile's height (number of sheets). */
  setPile(n: number) {
    this.pile.visible = n > 0
    this.pileBody.scale.y = Math.max(0.25, n / 2)
    this.pileBody.position.y = 0.001 * Math.max(0.25, n / 2)
  }

  setSigned(t: number) {
    const k = Math.round(Math.min(1, t) * 40)
    if (k === this.signKey) return
    this.signKey = k
    this.lastPlane.redraw(drawLastPage(k / 40), `s${k}`)
  }

  setFolderLabel(label: string) {
    this.folderLabel.redraw(drawFolder(label), label)
  }

  dispose() {
    this.scene.remove(this.pen, this.tablet)
  }
}

/** A high-backed leather chair, seat facing +z: walnut frame, buttoned back. */
function leatherChair(m: Pal) {
  const g = new THREE.Group()
  rbox(0.52, 0.1, 0.5, m.leather, 0, 0.42, 0.02, g, 0.04)
  rbox(0.54, 0.04, 0.5, m.walnut, 0, 0.355, 0.02, g, 0.008)
  const back = rbox(0.52, 0.78, 0.1, m.leather, 0, 0.86, -0.22, g, 0.045)
  back.rotation.x = -0.1
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const b = mesh(new THREE.SphereGeometry(0.008, 8, 6), m.walnutDark, -0.12 + i * 0.12, 0.72 + j * 0.2, -0.165 + j * 0.02, g)
      b.scale.z = 0.5
    }
  for (const sx of [-1, 1]) {
    rbox(0.04, 0.36, 0.04, m.walnut, sx * 0.23, 0.18, 0.22, g, 0.006)
    rbox(0.04, 0.36, 0.04, m.walnut, sx * 0.23, 0.18, -0.18, g, 0.006)
    // Arms.
    rbox(0.06, 0.04, 0.44, m.walnut, sx * 0.27, 0.66, 0.0, g, 0.012)
    rbox(0.035, 0.22, 0.035, m.walnut, sx * 0.27, 0.53, 0.18, g, 0.006)
  }
  g.traverse((o) => {
    const mm = o as THREE.Mesh
    if (mm.isMesh) {
      mm.castShadow = true
      mm.receiveShadow = true
    }
  })
  return g
}
