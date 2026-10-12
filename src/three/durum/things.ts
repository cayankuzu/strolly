/**
 * The small objects DURUM's ideas happen to, built to real size: the 1 TL
 * coin, the receipt printer and its slip, the tally counter, the envelope
 * and its page, the water glass, the two boxes (with the notes, the seal, the
 * cheque), the phone and its edge glow, Selin's tea and tablet, the coat (on
 * the rack and on Arif), the bag, the shards and the stain, the butterfly.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mulberry32 } from '@/lib/math'
import { mesh } from '../util'
import { canvasPlane, hardware, rbox, std, tube } from '../kit/props'
import { pbr } from '../kit/surfaces'
import type { Figure } from '../figure/Figure'
import * as P from './paper'

const PI = Math.PI

/** Smooth metal (the shared 'metal' scan is a tread plate, wrong for boxes, coins and stands). */
export function brushed(color: THREE.ColorRepresentation, roughness = 0.45) {
  return pbr('painted', color, { bump: 0.12, roughness, metalness: 0.8 })
}

// ——— Attaching things to hands ———

const _m = new THREE.Matrix4()
const _l = new THREE.Matrix4()
const _p = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()
const _e = new THREE.Euler()
const ONE = new THREE.Vector3(1, 1, 1)

/** Puts `obj` (a child of the scene) at a pose given in `bone`'s frame. */
export function attach(obj: THREE.Object3D, bone: THREE.Object3D, pos: readonly [number, number, number], rot: readonly [number, number, number] = [0, 0, 0]) {
  bone.updateWorldMatrix(true, false)
  _l.compose(_p.set(pos[0], pos[1], pos[2]), _q.setFromEuler(_e.set(rot[0], rot[1], rot[2])), ONE)
  _m.multiplyMatrices(bone.matrixWorld, _l)
  _m.decompose(obj.position, obj.quaternion, _s)
}

/** World position of a figure's grip. */
export function gripOf(f: Figure, side: 'l' | 'r', out = new THREE.Vector3()) {
  return (side === 'l' ? f.lGrip : f.rGrip).getWorldPosition(out)
}

/** Points an object's local +z at a world point (its "face"), keeping it upright-ish. */
export function faceToward(obj: THREE.Object3D, target: THREE.Vector3, roll = 0) {
  const m = new THREE.Matrix4().lookAt(target, obj.position, new THREE.Vector3(0, 1, 0))
  obj.quaternion.setFromRotationMatrix(m)
  if (roll) obj.rotateZ(roll)
}

// ——— The coin ———

export function coin() {
  const g = new THREE.Group()
  const r = 0.013
  const h = 0.0018
  const tura = canvasPlane(0.026, 0.026, 256, (c, W, H) => P.drawCoin(c, W, H, 'tura'), { transparent: true })
  const yazi = canvasPlane(0.026, 0.026, 256, (c, W, H) => P.drawCoin(c, W, H, 'yazi'), { transparent: true })
  for (const [pl, up] of [
    [tura, 1],
    [yazi, -1],
  ] as const) {
    const m = pl.material as THREE.MeshStandardMaterial
    m.metalness = 0.75
    m.roughness = 0.38
    m.alphaTest = 0.5
    pl.mesh.rotation.x = -up * (PI / 2)
    pl.mesh.position.y = (up * h) / 2 + up * 0.0001
    g.add(pl.mesh)
  }
  // The rim: brass, reeded.
  const rim = mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), brushed(0xc99f4a, 0.35), 0, 0, 0, g)
  rim.castShadow = true
  g.traverse((o) => (o.castShadow = true))
  return g
}

/**
 * Arif's right fist for the coin toss (the rig's hands are open): curled
 * fingers, knuckles toward local −z, the thumb lying on top with its nail up.
 * The origin is the wrist; `nail` is the point the coin rests on.
 */
export function fist(skin: THREE.Material) {
  const g = new THREE.Group()
  const nailMat = new THREE.MeshStandardMaterial({ color: 0xe9c3b0, roughness: 0.35 })
  const crease = new THREE.MeshStandardMaterial({ color: 0x8a5a44, roughness: 0.9 })
  const body = new RoundedBoxGeometry(0.05, 0.082, 0.076, 3, 0.018)
  mesh(body, skin, 0.002, -0.008, -0.045, g)
  // Four knuckles down the front, index on top; the creases between the curled fingers.
  for (const [i, y] of [0.026, 0.006, -0.013, -0.031].entries()) {
    mesh(new THREE.SphereGeometry(0.0108 - i * 0.0006, 12, 10), skin, 0.006, y, -0.079, g)
    if (i < 3) mesh(new THREE.BoxGeometry(0.03, 0.0012, 0.004), crease, -0.012, y - 0.0098, -0.083, g)
  }
  // The thumb along the top of the index finger, from the root by the wrist to the tip.
  const root = new THREE.Vector3(-0.016, 0.03, -0.01)
  const tip = new THREE.Vector3(-0.009, 0.041, -0.066)
  const len = root.distanceTo(tip)
  const thumb = mesh(new THREE.CapsuleGeometry(0.0108, len, 6, 12), skin, (root.x + tip.x) / 2, (root.y + tip.y) / 2, (root.z + tip.z) / 2, g)
  thumb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.clone().sub(root).normalize())
  const nail = mesh(new THREE.CylinderGeometry(0.0068, 0.0068, 0.0016, 16), nailMat, tip.x, tip.y + 0.0097, tip.z + 0.004, g)
  nail.scale.set(1, 1, 1.25)
  g.traverse((o) => (o.castShadow = true))
  g.userData.nail = new THREE.Vector3(tip.x, tip.y + 0.0106, tip.z + 0.004)
  return g
}

// ——— The receipt printer and its slip ———

/** A thermal slip as a bendable ribbon (0.06 wide). `shape` places it along a path. */
export class Ribbon {
  readonly mesh: THREE.Mesh
  readonly paper: ReturnType<typeof canvasPlane>
  private geo: THREE.PlaneGeometry
  constructor(
    readonly width: number,
    readonly length: number,
    px: number,
    draw: (c: CanvasRenderingContext2D, W: number, H: number) => void,
    private segs = 16,
  ) {
    this.paper = canvasPlane(width, length, px, draw)
    const mat = this.paper.material as THREE.MeshStandardMaterial
    mat.side = THREE.DoubleSide
    mat.roughness = 0.55
    this.geo = new THREE.PlaneGeometry(width, length, 1, segs)
    this.mesh = new THREE.Mesh(this.geo, mat)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.frustumCulled = false
    this.paper.mesh.geometry.dispose()
  }

  /**
   * Bends the ribbon: `at(s)` gives the centre point and the normal of the
   * paper at distance s (0 = the top of the printed text, which comes out last…
   * here s runs along the paper from its free end). Only the first `shown`
   * metres are drawn; the rest is still inside the printer.
   */
  shape(at: (s: number, outP: THREE.Vector3, outSide: THREE.Vector3) => void, shown = this.length) {
    const pos = this.geo.attributes.position as THREE.BufferAttribute
    const uv = this.geo.attributes.uv as THREE.BufferAttribute
    const c = new THREE.Vector3()
    const side = new THREE.Vector3()
    const rows = this.segs + 1
    for (let j = 0; j < rows; j++) {
      // Row j: v from 1 (top of the canvas, the free end) to 0.
      const f = j / this.segs
      const s = f * shown
      at(s, c, side)
      for (let i = 0; i < 2; i++) {
        const k = j * 2 + i
        const sx = i === 0 ? -0.5 : 0.5
        pos.setXYZ(k, c.x + side.x * sx * this.width, c.y + side.y * sx * this.width, c.z + side.z * sx * this.width)
        uv.setXY(k, i, 1 - (s / this.length))
      }
    }
    pos.needsUpdate = true
    uv.needsUpdate = true
    this.geo.computeVertexNormals()
    this.geo.computeBoundingSphere()
  }
}

/** A small thermal receipt printer (front toward +z), the slot on its top front edge. */
export function receiptPrinter() {
  const g = new THREE.Group()
  const hw = hardware()
  // Smooth injection-moulded ABS (the scanned 'plastic' grain reads as stone at this size).
  const body = new THREE.MeshStandardMaterial({ color: 0xc2c5c7, roughness: 0.42, metalness: 0 })
  rbox(0.12, 0.085, 0.14, body, 0, 0.0425, 0, g, 0.012)
  // The lid, a little rounded, with the cutter lip at the front.
  rbox(0.116, 0.02, 0.1, body, 0, 0.092, -0.016, g, 0.009)
  rbox(0.1, 0.004, 0.012, hw.plasticDark, 0, 0.098, 0.04, g, 0.0015)
  rbox(0.104, 0.008, 0.006, hw.steel, 0, 0.096, 0.05, g, 0.002)
  mesh(new THREE.CircleGeometry(0.0025, 10), hw.ledGreen, 0.042, 0.06, 0.0705, g)
  rbox(0.016, 0.008, 0.003, hw.plasticDark, -0.035, 0.06, 0.0705, g, 0.001)
  g.traverse((o) => (o.castShadow = true))
  return g
}

// ——— The tally counter ———

export function tallyCounter() {
  const g = new THREE.Group()
  const hw = hardware()
  const body = mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.024, 32), hw.chrome, 0, 0, 0, g)
  body.rotation.x = PI / 2
  // Finger ring and the button.
  const ring = mesh(new THREE.TorusGeometry(0.014, 0.0025, 8, 24), hw.chrome, 0, -0.034, 0, g)
  ring.rotation.y = PI / 2
  mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.012, 12), hw.chrome, 0.012, 0.027, 0, g)
  const win = canvasPlane(0.026, 0.009, 128, (c, W, H) => P.drawCounter(c, W, H, 0))
  win.mesh.position.set(0, 0.004, 0.0125)
  g.add(win.mesh)
  g.traverse((o) => (o.castShadow = true))
  return { group: g, set: (n: number) => win.redraw((c, W, H) => P.drawCounter(c, W, H, n), `n${n}`) }
}

// ——— The envelope and its page ———

export function envelope() {
  const g = new THREE.Group()
  const cream = pbr('paper', 0xefe6d2, { roughness: 0.85 })
  // Body (front face down, flap side up), the flap's shadow line, the seal.
  rbox(0.22, 0.003, 0.11, cream, 0, 0.0015, 0, g, 0.001)
  const flap = new THREE.Shape()
  flap.moveTo(-0.11, 0.055)
  flap.lineTo(0.11, 0.055)
  flap.lineTo(0, -0.005)
  flap.closePath()
  const fl = mesh(new THREE.ShapeGeometry(flap), new THREE.MeshStandardMaterial({ color: 0xe6dcc6, roughness: 0.85 }), 0, 0.0032, 0, g)
  fl.rotation.x = -PI / 2
  const seal = mesh(new THREE.CylinderGeometry(0.0135, 0.014, 0.0035, 24), pbr('plastic', 0x9b2a22, { roughness: 0.45 }), 0, 0.005, 0.004, g)
  seal.castShadow = true
  // The embossed D.
  const d = mesh(new THREE.TorusGeometry(0.005, 0.0012, 6, 16, PI), pbr('plastic', 0x7d1f19, { roughness: 0.5 }), 0.001, 0.0068, 0.004, g)
  d.rotation.set(-PI / 2, 0, PI / 2)
  rbox(0.0024, 0.0015, 0.01, pbr('plastic', 0x7d1f19), -0.002, 0.0068, 0.004, g, 0.0005)
  g.traverse((o) => (o.castShadow = true))
  return g
}

/** The page: A4, its print, held unfolded. */
export function page(draw: (c: CanvasRenderingContext2D, W: number, H: number) => void) {
  const p = canvasPlane(0.21, 0.297, 768, draw)
  const mat = p.material as THREE.MeshStandardMaterial
  mat.side = THREE.FrontSide
  // A little sag along the creases.
  const geo = new THREE.PlaneGeometry(0.21, 0.297, 4, 6)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const x = pos.getX(i)
    pos.setZ(i, 0.006 * Math.cos((y / 0.297) * PI * 3) + 0.004 * (x / 0.105) ** 2)
  }
  geo.computeVertexNormals()
  p.mesh.geometry.dispose()
  p.mesh.geometry = geo
  p.mesh.castShadow = true
  // The back of the sheet: plain paper (the print only shows from the front).
  const back = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: 0.9, side: THREE.BackSide }))
  p.mesh.add(back)
  return p
}

// ——— The water glass ———

export function waterGlass() {
  const g = new THREE.Group()
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide })
  const water = new THREE.MeshPhysicalMaterial({ color: 0xcfe4ea, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false })
  const prof: Array<[number, number]> = [
    [0.0, 0.0],
    [0.033, 0.0],
    [0.034, 0.004],
    [0.035, 0.11],
    [0.0345, 0.11],
    [0.0325, 0.006],
    [0.0, 0.006],
  ]
  mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 36), glass, 0, 0, 0, g)
  const w = mesh(new THREE.CylinderGeometry(0.0318, 0.0318, 0.05, 32), water, 0, 0.032, 0, g)
  w.name = 'water'
  g.traverse((o) => (o.renderOrder = 2))
  return g
}

/** The broken glass: shards on the carpet (instanced) and a darker, damp patch. */
export function shardsAndStain() {
  const shardGeo = new THREE.BufferGeometry()
  shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.022, 0, 0.005, 0.007, 0, 0.026, 0, 0, 0, 0.007, 0, 0.026, -0.01, 0.004, 0.012], 3))
  shardGeo.computeVertexNormals()
  const shardMat = new THREE.MeshPhysicalMaterial({ color: 0xe8f2f4, roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
  const shards = new THREE.InstancedMesh(shardGeo, shardMat, 34)
  shards.frustumCulled = false
  const sr = mulberry32(5)
  const sm = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  for (let i = 0; i < 34; i++) {
    const a = sr() * PI * 2
    const r = Math.pow(sr(), 0.7) * 0.32
    q.setFromEuler(new THREE.Euler((sr() - 0.5) * 0.3, sr() * PI * 2, (sr() - 0.5) * 0.3))
    const s = 0.5 + sr() * 1.1
    sm.compose(new THREE.Vector3(Math.cos(a) * r, 0.004, Math.sin(a) * r), q, new THREE.Vector3(s, 1, s))
    shards.setMatrixAt(i, sm)
  }
  // The base of the glass, still in one piece.
  const base = mesh(new THREE.CylinderGeometry(0.03, 0.033, 0.008, 24, 1, true), shardMat, 0.06, 0.004, -0.04)
  base.rotation.z = 0.15
  const shape = new THREE.Shape()
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * PI * 2
    const r = 0.18 * (1 + 0.22 * Math.sin(3 * a + 1) + 0.12 * Math.sin(5 * a + 2) + 0.06 * Math.sin(11 * a))
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  // Water on carpet: a darker, slightly glossier, greyer patch (not tea).
  const stainMat = new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.45, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
  const stain = mesh(new THREE.ShapeGeometry(shape, 2), stainMat)
  stain.rotation.x = -PI / 2
  stain.position.y = 0.004
  return { shards, base, stain }
}

// ——— The two boxes ———

export type Boxes = ReturnType<typeof twoBoxes>

/**
 * A: clear acrylic, a fan of five 200-lira notes in a paper band. B: matte
 * grey metal, its lid hinged at the back, a paper seal over lid and front.
 * Both 0.28 × 0.2 × 0.2, built at their footprint centre.
 */
export function twoBoxes() {
  const W = 0.28
  const H = 0.2
  const D = 0.2
  const hw = hardware()
  // A
  const a = new THREE.Group()
  const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xeef6f8, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })
  const edge = new THREE.MeshStandardMaterial({ color: 0xdfeef2, roughness: 0.15, transparent: true, opacity: 0.5 })
  mesh(new THREE.BoxGeometry(W, H, D), acrylic, 0, H / 2, 0, a).renderOrder = 3
  for (const [x, y, z, w, h, d] of [
    [0, H, D / 2, W, 0.004, 0.004],
    [0, H, -D / 2, W, 0.004, 0.004],
    [W / 2, H, 0, 0.004, 0.004, D],
    [-W / 2, H, 0, 0.004, 0.004, D],
    [W / 2, H / 2, D / 2, 0.004, H, 0.004],
    [-W / 2, H / 2, D / 2, 0.004, H, 0.004],
    [W / 2, H / 2, -D / 2, 0.004, H, 0.004],
    [-W / 2, H / 2, -D / 2, 0.004, H, 0.004],
  ] as const)
    mesh(new THREE.BoxGeometry(w, h, d), edge, x, y, z, a)
  // The banded notes lean against A's back wall, so they read through the acrylic from the front.
  const notes = noteFan()
  notes.position.set(0, 0.034, -0.035)
  notes.rotation.x = 0.75
  a.add(notes)
  // B
  const b = new THREE.Group()
  const metal = pbr('painted', 0x6f757b, { bump: 0.15, roughness: 0.62, metalness: 0.55 })
  const t = 0.004
  for (const [x, y, z, w, h, d] of [
    [0, t / 2, 0, W, t, D],
    [0, H / 2, D / 2 - t / 2, W, H, t],
    [0, H / 2, -D / 2 + t / 2, W, H, t],
    [W / 2 - t / 2, H / 2, 0, t, H, D],
    [-W / 2 + t / 2, H / 2, 0, t, H, D],
  ] as const)
    rbox(w, h, d, metal, x, y, z, b, 0.0015)
  // The lid on a hinge at the back top edge.
  const lid = new THREE.Group()
  lid.position.set(0, H, -D / 2)
  b.add(lid)
  rbox(W + 0.006, 0.008, D + 0.006, metal, 0, 0.004, D / 2, lid, 0.002)
  rbox(0.06, 0.006, 0.012, hw.steel, 0, 0.008, D - 0.01, lid, 0.002)
  // The seal: one strip over the lid's front edge and down the front.
  const sealTop = canvasPlane(0.05, 0.12, 256, P.drawSeal)
  sealTop.mesh.rotation.set(-PI / 2, 0, PI / 2)
  sealTop.mesh.position.set(0, 0.0085, D - 0.05)
  lid.add(sealTop.mesh)
  const sealFront = canvasPlane(0.05, 0.08, 256, P.drawSeal)
  sealFront.mesh.position.set(0, H - 0.04, D / 2 + 0.0008)
  b.add(sealFront.mesh)
  // Inside B: the cheque with a slip clipped to its corner, or a slip taped flat to the floor.
  const cheque = new THREE.Group()
  const ch = canvasPlane(0.18, 0.08, 512, P.drawCheque)
  ch.mesh.rotation.x = -PI / 2
  cheque.add(ch.mesh)
  const clip = rbox(0.012, 0.004, 0.03, hw.steel, 0.085, 0.003, -0.025, cheque, 0.001)
  clip.castShadow = true
  cheque.position.set(0, t + 0.002, 0)
  b.add(cheque)
  const slipOne = canvasPlane(0.06, 0.13, 256, () => {})
  slipOne.mesh.rotation.set(-PI / 2, 0, 0.35)
  slipOne.mesh.position.set(0.07, 0.003, -0.02)
  cheque.add(slipOne.mesh)
  const slipTwo = canvasPlane(0.06, 0.13, 256, () => {})
  slipTwo.mesh.rotation.set(-PI / 2, 0, 0.1)
  slipTwo.mesh.position.set(0.02, t + 0.0015, 0.0)
  b.add(slipTwo.mesh)
  const tape = new THREE.MeshStandardMaterial({ color: 0xf3efe2, roughness: 0.4, transparent: true, opacity: 0.5 })
  for (const dz of [-0.06, 0.06]) mesh(new THREE.PlaneGeometry(0.05, 0.016), tape, 0.02, t + 0.0018, dz, b).rotation.x = -PI / 2
  for (const g of [a, b]) g.traverse((o) => (o.castShadow = true))
  return { a, b, lid, notes, cheque, slipOne, slipTwo, sealTop, sealFront, size: { W, H, D } }
}

/** Five 200-lira notes fanned, a paper band round them. Built lying flat. */
export function noteFan() {
  const g = new THREE.Group()
  const face = canvasPlane(0.155, 0.072, 256, P.drawNoteFace)
  const mat = face.material as THREE.MeshStandardMaterial
  mat.side = THREE.DoubleSide
  for (let i = 0; i < 5; i++) {
    const n = new THREE.Mesh(face.mesh.geometry, mat)
    n.rotation.set(-PI / 2, 0, -0.18 + i * 0.09)
    n.position.set(-0.02 + i * 0.01, 0.0008 * i, 0)
    g.add(n)
  }
  const band = canvasPlane(0.03, 0.08, 128, P.drawBand)
  band.mesh.rotation.set(-PI / 2, 0, PI / 2 + 0.05)
  band.mesh.position.set(0, 0.0048, 0)
  g.add(band.mesh)
  g.traverse((o) => (o.castShadow = true))
  return g
}

// ——— The phone and its glow ———

export function phoneProp() {
  const g = new THREE.Group()
  const body = pbr('plastic', 0x17191c, { roughness: 0.35, metalness: 0.2 })
  rbox(0.072, 0.0082, 0.152, body, 0, 0.0041, 0, g, 0.004)
  // Camera bump on the back (down when it lies face up).
  rbox(0.024, 0.0016, 0.03, body, -0.018, 0.0, -0.05, g, 0.003)
  const screen = canvasPlane(0.066, 0.145, 300, () => {}, { emissive: true })
  screen.mesh.rotation.x = -PI / 2
  screen.mesh.position.y = 0.0084
  g.add(screen.mesh)
  // Light that escapes round its edges when it lights face down.
  const glowTex = (() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 256
    const x = c.getContext('2d')!
    const grd = x.createRadialGradient(64, 128, 30, 64, 128, 128)
    grd.addColorStop(0, 'rgba(200,220,255,1)')
    grd.addColorStop(0.5, 'rgba(200,220,255,0.5)')
    grd.addColorStop(1, 'rgba(200,220,255,0)')
    x.fillStyle = grd
    x.fillRect(0, 0, 128, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })()
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.26), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  glow.rotation.x = -PI / 2
  glow.renderOrder = 4
  g.traverse((o) => (o.castShadow = true))
  return { group: g, screen, glow }
}

// ——— Selin's tea ———

/** An ince belli çay bardağı on its saucer, tea inside. Built at the saucer's base. */
export function teaGlass() {
  const g = new THREE.Group()
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false })
  const tea = new THREE.MeshPhysicalMaterial({ color: 0x8c2a08, roughness: 0.05, transparent: true, opacity: 0.9 })
  const saucer = pbr('ceramic', 0xf1eee7)
  const prof = (scale: number) =>
    [
      [0.0, 0.0],
      [0.022, 0.0],
      [0.026, 0.01],
      [0.02, 0.045],
      [0.024, 0.075],
      [0.03, 0.1],
    ].map(([r, y]) => new THREE.Vector2(r * scale, y))
  mesh(new THREE.LatheGeometry(prof(1), 32), glass, 0, 0.012, 0, g).renderOrder = 2
  mesh(new THREE.LatheGeometry(prof(0.92).slice(0, 5), 32), tea, 0, 0.014, 0, g)
  mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.05, 0.0],
        [0.058, 0.008],
        [0.06, 0.012],
        [0.03, 0.006],
        [0, 0.006],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      40,
    ),
    saucer,
    0,
    0,
    0,
    g,
  ).castShadow = true
  // A teaspoon on the saucer.
  rbox(0.004, 0.002, 0.07, hardware().chrome, 0.038, 0.009, 0.0, g, 0.001).rotation.y = 0.4
  return g
}

/** The paper bakery bag with two simits (one sticks out of the top). */
/** The bakery's paper bag, open at the top, two simits standing in it with their tops showing. */
export function simitBag() {
  const g = new THREE.Group()
  // Plain kraft (the scanned paper weave reads as wicker at this size).
  const paperM = new THREE.MeshStandardMaterial({ color: 0xc9ad7f, roughness: 0.95, side: THREE.DoubleSide })
  const W = 0.16
  const H = 0.19
  const D = 0.09
  const t = 0.002
  const bag = new THREE.Group()
  bag.rotation.y = 0.2
  g.add(bag)
  rbox(W, t, D, paperM, 0, t / 2, 0, bag, 0.0008)
  rbox(W, H, t, paperM, 0, H / 2, D / 2, bag, 0.0008)
  // The back panel a little lower and leaning out: paper, not a box.
  rbox(W, H * 0.93, t, paperM, 0, (H * 0.93) / 2, -D / 2, bag, 0.0008).rotation.x = -0.05
  rbox(t, H, D, paperM, W / 2, H / 2, 0, bag, 0.0008)
  rbox(t, H, D, paperM, -W / 2, H / 2, 0, bag, 0.0008)
  for (const [x, z, tilt, roll] of [
    [-0.006, -0.016, -0.22, 0.1],
    [0.008, 0.016, 0.2, -0.12],
  ] as const) {
    const sim = simit()
    sim.rotation.set(PI / 2 + tilt, 0, roll)
    sim.position.set(x, 0.17, z)
    bag.add(sim)
  }
  g.traverse((o) => (o.castShadow = true))
  return g
}

export function simit(half = false) {
  const m = pbr('plaster', 0x8f5428, { roughness: 1 })
  const ring = new THREE.TorusGeometry(0.052, 0.016, 10, 28, half ? PI : PI * 2)
  const s = mesh(ring, m)
  s.rotation.x = -PI / 2
  s.castShadow = true
  const g = new THREE.Group()
  s.position.y = 0.016
  g.add(s)
  // Sesame: a few pale specks.
  const seed = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0022, 4, 3), std(0xe9d6a8, 0.8), 60)
  const r = mulberry32(half ? 3 : 4)
  const mm = new THREE.Matrix4()
  for (let i = 0; i < 60; i++) {
    const a = r() * (half ? PI : PI * 2)
    const b = r() * PI
    const x = Math.cos(a) * (0.052 + Math.cos(b) * 0.016)
    const z = -Math.sin(a) * (0.052 + Math.cos(b) * 0.016)
    mm.makeScale(1, 0.4, 1.6).setPosition(x, 0.016 + Math.sin(b) * 0.016, z)
    seed.setMatrixAt(i, mm)
  }
  g.add(seed)
  return g
}

// ——— The tablet ———

export function tablet() {
  const g = new THREE.Group()
  rbox(0.25, 0.17, 0.008, pbr('plastic', 0x1b1d20, { roughness: 0.4 }), 0, 0, -0.004, g, 0.008)
  const screen = canvasPlane(0.234, 0.154, 512, () => {}, { emissive: true })
  screen.mesh.position.z = 0.0005
  g.add(screen.mesh)
  return { group: g, screen }
}

// ——— The coat and the bag ———

/** Arif's coat on a hanger (built hanging from the hook point). */
export function hangingCoat(mat: THREE.Material) {
  const g = new THREE.Group()
  const hw = hardware()
  tube(
    [
      [-0.2, -0.1, 0],
      [0, -0.04, 0],
      [0.2, -0.1, 0],
    ],
    0.006,
    hw.chrome,
    g,
    12,
  )
  tube(
    [
      [0, -0.04, 0],
      [0, 0.01, 0],
      [0.03, 0.04, 0],
      [0.01, 0.06, 0],
    ],
    0.003,
    hw.chrome,
    g,
    12,
  )
  rbox(0.42, 0.07, 0.13, mat, 0, -0.11, 0, g, 0.03)
  const body = new THREE.CylinderGeometry(0.19, 0.25, 0.92, 28, 4)
  body.scale(1, 1, 0.34)
  mesh(body, mat, 0, -0.6, 0, g)
  for (const sx of [-1, 1]) {
    const sleeve = mesh(new THREE.CapsuleGeometry(0.048, 0.5, 4, 12), mat, sx * 0.205, -0.42, 0.012, g)
    sleeve.scale.z = 0.8
    sleeve.rotation.z = sx * 0.06
  }
  const collar = mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 24, PI * 1.4), mat, 0, -0.09, 0.01, g)
  collar.rotation.set(PI / 2, 0, -PI * 0.2)
  collar.scale.set(1, 0.55, 1)
  rbox(0.012, 0.84, 0.01, hw.plasticDark, 0, -0.58, 0.086, g, 0.004)
  g.traverse((o) => (o.castShadow = true))
  return g
}

/**
 * The coat as worn: shells parented to the figure's bones (torso, skirt to
 * mid-thigh, sleeves, collar). Toggle `visible` on the returned list.
 */
export function wornCoat(f: Figure, mat: THREE.Material) {
  const parts: THREE.Object3D[] = []
  mat.side = THREE.DoubleSide
  const J = f.joints
  // Roomy enough at the back that the sweater never shows through.
  const torso = new THREE.CylinderGeometry(0.178, 0.184, 0.36, 24, 1, true)
  torso.scale(1, 1, 0.98)
  parts.push(mesh(torso, mat, 0, 0.1, -0.02, J.chest))
  const shoulders = new THREE.SphereGeometry(0.18, 24, 10, 0, PI * 2, 0, PI * 0.36)
  shoulders.scale(1.05, 0.55, 0.98)
  parts.push(mesh(shoulders, mat, 0, 0.27, -0.02, J.chest))
  const waist = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 24, 1, true)
  waist.scale(1, 1, 0.98)
  parts.push(mesh(waist, mat, 0, 0.05, 0, J.spine))
  const skirt = new THREE.CylinderGeometry(0.165, 0.215, 0.42, 24, 1, true)
  skirt.scale(1, 1, 1.05)
  parts.push(mesh(skirt, mat, 0, -0.1, 0.0, J.hips))
  const collar = mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 24), mat, 0, 0.3, 0.0, J.chest)
  collar.rotation.x = PI / 2 - 0.15
  collar.scale.set(1, 0.85, 1)
  parts.push(collar)
  for (const side of ['l', 'r'] as const) {
    const up = mesh(new THREE.CapsuleGeometry(0.058, 0.2, 4, 12), mat, 0, -0.14, 0, J[`${side}Upper`])
    const fo = mesh(new THREE.CapsuleGeometry(0.052, 0.17, 4, 12), mat, 0, -0.12, 0, J[`${side}Fore`])
    parts.push(up, fo)
  }
  // A placket line down the front.
  parts.push(rbox(0.012, 0.3, 0.006, hardware().plasticDark, 0, 0.1, 0.13, J.chest, 0.002))
  for (const p of parts) {
    p.castShadow = true
    p.visible = false
  }
  return parts
}

export function leatherBag(mat: THREE.Material) {
  const g = new THREE.Group()
  rbox(0.38, 0.28, 0.1, mat, 0, 0.14, 0, g, 0.03)
  rbox(0.38, 0.12, 0.012, mat, 0, 0.22, 0.055, g, 0.006)
  tube(
    [
      [-0.08, 0.28, 0],
      [-0.06, 0.34, 0],
      [0.06, 0.34, 0],
      [0.08, 0.28, 0],
    ],
    0.008,
    mat,
    g,
    12,
  )
  rbox(0.03, 0.02, 0.006, hardware().chrome, 0, 0.18, 0.062, g, 0.002)
  g.traverse((o) => (o.castShadow = true))
  return g
}

// ——— The butterfly ———

/** Wingspan 6 cm: a slender body and two wings hinged on it (velvet brown, a cream border). */
export function butterfly() {
  const g = new THREE.Group()
  const tex = (() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const x = c.getContext('2d')!
    x.clearRect(0, 0, 128, 128)
    // One wing (forewing + hindwing), body at the left edge.
    x.fillStyle = '#e8dcc0'
    x.beginPath()
    x.moveTo(0, 64)
    x.bezierCurveTo(30, 0, 110, 4, 124, 30)
    x.bezierCurveTo(128, 60, 96, 70, 80, 70)
    x.bezierCurveTo(110, 90, 100, 124, 60, 122)
    x.bezierCurveTo(30, 118, 12, 92, 0, 66)
    x.closePath()
    x.fill()
    x.fillStyle = '#3a2418'
    x.beginPath()
    x.moveTo(2, 64)
    x.bezierCurveTo(30, 10, 100, 12, 114, 32)
    x.bezierCurveTo(116, 56, 92, 64, 74, 68)
    x.bezierCurveTo(100, 88, 92, 114, 60, 113)
    x.bezierCurveTo(32, 110, 14, 90, 2, 66)
    x.closePath()
    x.fill()
    // Eye spots.
    x.fillStyle = '#1c120c'
    x.beginPath()
    x.arc(78, 34, 7, 0, PI * 2)
    x.fill()
    x.fillStyle = '#c9b48a'
    x.beginPath()
    x.arc(78, 34, 2.5, 0, PI * 2)
    x.fill()
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })()
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 })
  const body = mesh(new THREE.CapsuleGeometry(0.0018, 0.018, 4, 8), std(0x2a1a12, 0.8), 0, 0, 0, g)
  body.rotation.x = PI / 2
  const wings: THREE.Group[] = []
  for (const sx of [-1, 1]) {
    const hinge = new THREE.Group()
    g.add(hinge)
    const w = mesh(new THREE.PlaneGeometry(0.03, 0.03), mat, (sx * 0.03) / 2, 0, 0, hinge)
    w.rotation.x = -PI / 2
    if (sx < 0) w.scale.x = -1
    wings.push(hinge)
  }
  // Antennae.
  for (const sx of [-1, 1]) tube([[0, 0, -0.009], [sx * 0.003, 0.004, -0.016], [sx * 0.006, 0.006, -0.02]], 0.0003, std(0x2a1a12), g, 6)
  /** open: 0 folded upright, 1 flat. */
  const set = (open: number) => {
    const a = (1 - open) * (PI / 2 - 0.06)
    wings[0].rotation.z = -a
    wings[1].rotation.z = a
  }
  set(0)
  return { group: g, set }
}
