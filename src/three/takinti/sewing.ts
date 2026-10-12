/**
 * The mother's room: the treadle machine on its cast-iron stand, the stool,
 * the dress form in the corner, the heap of clothes, the lace on the window,
 * the pale pieces on the table at dawn, the marks on the wall and the floor.
 * Everything that moves exposes a handle the director drives from progress.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { rbox, std, tube, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'

// ——— Shared canvas helpers ———

function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat = false) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Gloss black japanning with gold scrollwork. */
function decalTex() {
  return canvas(512, 256, (g, w, h) => {
    g.fillStyle = '#0b0a09'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#b8954a'
    g.fillStyle = '#c9a659'
    g.lineWidth = 3
    const rand = mulberry32(3)
    for (let k = 0; k < 7; k++) {
      const cx = 40 + k * 70
      const cy = h / 2 + (k % 2 ? 30 : -30)
      g.beginPath()
      for (let a = 0; a < Math.PI * 3; a += 0.15) {
        const r = 4 + a * 7
        g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7)
      }
      g.stroke()
      for (let i = 0; i < 6; i++) {
        g.beginPath()
        g.ellipse(cx + (rand() - 0.5) * 60, cy + (rand() - 0.5) * 50, 6, 2.5, rand() * 3, 0, Math.PI * 2)
        g.fill()
      }
    }
    g.lineWidth = 2
    g.strokeRect(10, 14, w - 20, h - 28)
  })
}

/** Lace: a net of holes and little flowers, white where the thread is (alpha-tested). */
function laceTex() {
  return canvas(
    256,
    256,
    (g, w, h) => {
      g.clearRect(0, 0, w, h)
      g.strokeStyle = 'rgba(240,236,226,1)'
      g.fillStyle = 'rgba(240,236,226,1)'
      g.lineWidth = 2.2
      const step = 16
      for (let y = 0; y <= h; y += step)
        for (let x = 0; x <= w; x += step) {
          g.beginPath()
          g.arc(x + ((y / step) % 2 ? step / 2 : 0), y, 5.5, 0, Math.PI * 2)
          g.stroke()
        }
      for (let k = 0; k < 4; k++) {
        const cx = 64 + (k % 2) * 128
        const cy = 64 + Math.floor(k / 2) * 128
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2
          g.beginPath()
          g.ellipse(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 10, 5, a, 0, Math.PI * 2)
          g.fill()
        }
        g.beginPath()
        g.arc(cx, cy, 7, 0, Math.PI * 2)
        g.fill()
      }
    },
    true,
  )
}

/** The pale pieces: matte, faintly mottled, with hemmed edges and a stitched seam. */
function pieceTex() {
  return canvas(
    512,
    512,
    (g, w, h) => {
      const rand = mulberry32(21)
      g.fillStyle = '#e6d3c2'
      g.fillRect(0, 0, w, h)
      for (let i = 0; i < 260; i++) {
        g.fillStyle = `rgba(${170 + rand() * 40},${120 + rand() * 40},${110 + rand() * 30},${0.04 + rand() * 0.05})`
        g.beginPath()
        g.arc(rand() * w, rand() * h, 6 + rand() * 30, 0, Math.PI * 2)
        g.fill()
      }
      // Faint weave so it reads as cloth.
      g.fillStyle = 'rgba(255,255,255,0.05)'
      for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h)
    },
    true,
  )
}

/** Near-black smears on a wall: horizontal, ragged, heavier low down. */
function smearTex() {
  return canvas(1024, 256, (g, w, h) => {
    const rand = mulberry32(77)
    g.clearRect(0, 0, w, h)
    for (let i = 0; i < 70; i++) {
      const y = h * (0.25 + rand() * 0.6)
      const x0 = rand() * w * 0.9
      const len = 80 + rand() * 380
      const th = 3 + rand() * 18
      g.globalAlpha = 0.35 + rand() * 0.5
      g.fillStyle = rand() < 0.5 ? '#241010' : '#1a0b0a'
      g.beginPath()
      g.moveTo(x0, y)
      for (let x = 0; x <= len; x += 12) g.lineTo(x0 + x, y + Math.sin(x * 0.03 + i) * 3 - th / 2 + rand() * 2)
      for (let x = len; x >= 0; x -= 12) g.lineTo(x0 + x, y + Math.sin(x * 0.03 + i) * 3 + th / 2 * (1 - x / len * 0.6) + rand() * 2)
      g.closePath()
      g.fill()
    }
    // A heavier band where the back rubbed along.
    g.globalAlpha = 0.75
    g.fillStyle = '#1e0c0b'
    g.beginPath()
    g.moveTo(0, h * 0.62)
    for (let x = 0; x <= w; x += 16) g.lineTo(x, h * 0.6 + Math.sin(x * 0.02) * 6 + rand() * 6)
    for (let x = w; x >= 0; x -= 16) g.lineTo(x, h * 0.8 + Math.sin(x * 0.015) * 8 + rand() * 6)
    g.closePath()
    g.fill()
    g.globalAlpha = 1
  })
}

/** A dark pool on the floor; `wiped` gives the morning's half-wiped arcs. */
function poolTex(seed: number, wiped: boolean) {
  return canvas(256, 256, (g, w, h) => {
    const rand = mulberry32(seed)
    g.clearRect(0, 0, w, h)
    if (!wiped) {
      g.fillStyle = '#1c0a09'
      for (let i = 0; i < 9; i++) {
        g.globalAlpha = 0.5 + rand() * 0.4
        g.beginPath()
        g.ellipse(w / 2 + (rand() - 0.5) * 90, h / 2 + (rand() - 0.5) * 70, 30 + rand() * 50, 20 + rand() * 35, rand() * 3, 0, Math.PI * 2)
        g.fill()
      }
    } else {
      g.strokeStyle = '#2b1410'
      g.lineCap = 'round'
      for (let i = 0; i < 14; i++) {
        g.globalAlpha = 0.18 + rand() * 0.25
        g.lineWidth = 6 + rand() * 18
        g.beginPath()
        g.arc(w / 2 + (rand() - 0.5) * 60, h / 2 + (rand() - 0.5) * 60, 40 + rand() * 60, rand() * 6, rand() * 6 + 1.5 + rand())
        g.stroke()
      }
    }
    g.globalAlpha = 1
  })
}

/** A procedural pile of cloth: lumps and draped sheets over an elliptical dome. */
export function clothPile(seed: number, sx: number, sz: number, h: number, colors: number[], kinds: Array<'fabric' | 'knit' | 'denim'>) {
  const g = new THREE.Group()
  const rand = mulberry32(seed)
  const mats = colors.map((c, i) => pbr(kinds[i % kinds.length], c, { roughness: 1, scale: 1.4 }))
  const dome = (x: number, z: number) => {
    const r = (x / sx) ** 2 + (z / sz) ** 2
    return r >= 1 ? 0 : h * Math.pow(1 - r, 0.65)
  }
  const lump = new THREE.SphereGeometry(1, 18, 12)
  const lp = lump.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < 14; i++) {
    const geo = lump.clone()
    const p = geo.attributes.position as THREE.BufferAttribute
    const k1 = rand() * 6
    const k2 = rand() * 6
    for (let j = 0; j < lp.count; j++) {
      v.fromBufferAttribute(lp, j)
      const n = 1 + 0.18 * Math.sin(v.x * 4 + k1) * Math.cos(v.z * 3 + k2) + 0.08 * Math.sin(v.y * 9 + k1)
      p.setXYZ(j, v.x * n, Math.max(-0.35, v.y) * n, v.z * n)
    }
    geo.computeVertexNormals()
    const a = rand() * Math.PI * 2
    const rr = Math.sqrt(rand()) * 0.75
    const x = Math.cos(a) * rr * sx
    const z = Math.sin(a) * rr * sz
    const top = dome(x, z)
    const m = mesh(geo, mats[i % mats.length], x, Math.max(0.03, top * 0.55), z, g)
    m.scale.set(0.12 + rand() * 0.2, Math.max(0.05, top * 0.5 + 0.03), 0.1 + rand() * 0.18)
    m.rotation.y = rand() * Math.PI
    m.castShadow = true
    m.receiveShadow = true
  }
  // Sheets laid over the top.
  for (let i = 0; i < 5; i++) {
    const w = sx * (1.1 + rand() * 0.6)
    const d = sz * (1.0 + rand() * 0.6)
    const geo = new THREE.PlaneGeometry(w, d, 18, 14)
    geo.rotateX(-Math.PI / 2)
    const ox = (rand() - 0.5) * sx * 0.6
    const oz = (rand() - 0.5) * sz * 0.6
    const yaw = rand() * Math.PI
    const c = Math.cos(yaw)
    const s = Math.sin(yaw)
    const p = geo.attributes.position as THREE.BufferAttribute
    for (let j = 0; j < p.count; j++) {
      const lx = p.getX(j)
      const lz = p.getZ(j)
      const wx = ox + lx * c - lz * s
      const wz = oz + lx * s + lz * c
      const y = dome(wx, wz) + 0.012 + 0.02 * Math.sin(lx * 13 + i) * Math.cos(lz * 11) + i * 0.006
      p.setXYZ(j, lx, Math.max(0.006, y), lz)
    }
    geo.computeVertexNormals()
    const m = mesh(geo, mats[(i + 2) % mats.length], ox, 0, oz, g)
    m.rotation.y = -yaw
    m.castShadow = true
    m.receiveShadow = true
    ;(m.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  }
  lump.dispose()
  return g
}

// ——— The machine ———

export type Machine = {
  group: THREE.Group
  needle: THREE.Object3D
  handWheel: THREE.Object3D
  flywheel: THREE.Object3D
  plate: THREE.Object3D
  pitman: THREE.Mesh
  /** Pale cloth under the presser foot (its texture slides). */
  feed: THREE.Mesh
  /** Where the needle meets the cloth (world). */
  needlePoint: THREE.Vector3
  crank: THREE.Vector3
}

/** The sewing table under the window, with the treadle stand and the machine head. */
export function sewingTable(): Machine {
  const g = new THREE.Group()
  const iron = pbr('metal', 0x161514, { roughness: 0.55 })
  const japan = new THREE.MeshStandardMaterial({ map: decalTex(), roughness: 0.22, metalness: 0.1, envMapIntensity: 1.2 })
  const black = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 0.25, metalness: 0.1, envMapIntensity: 1.2 })
  const steel = pbr('metal', 0xb9bcbf, { roughness: 0.3 })
  const wood = pbr('wood', 0x3a2618, { roughness: 0.6 })
  const leather = pbr('leather', 0x2a1a12, { roughness: 0.8 })
  // Table: x 4.38 … 4.98, z −3.05 … −1.75, top at 0.76.
  const TX = 4.68
  const TZ = -2.4
  rbox(0.6, 0.035, 1.3, wood, TX, 0.7425, TZ, g, 0.008)
  // An apron with a small drawer under the front edge.
  rbox(0.02, 0.09, 1.2, wood, 4.4, 0.68, TZ, g, 0.004)
  rbox(0.012, 0.07, 0.3, wood, 4.392, 0.68, -2.85, g, 0.003)
  cyl(0.008, 0.008, 0.02, steel, 4.38, 0.68, -2.85, g, 8).rotation.z = Math.PI / 2
  // The cast-iron stand: two openwork side frames.
  const frame = new THREE.Shape()
  frame.moveTo(-0.27, 0)
  frame.lineTo(-0.2, 0)
  frame.quadraticCurveTo(-0.12, 0.12, -0.16, 0.3)
  frame.quadraticCurveTo(-0.22, 0.52, -0.25, 0.7)
  frame.lineTo(0.25, 0.7)
  frame.quadraticCurveTo(0.22, 0.52, 0.16, 0.3)
  frame.quadraticCurveTo(0.12, 0.12, 0.2, 0)
  frame.lineTo(0.27, 0)
  frame.lineTo(0.27, 0.04)
  frame.lineTo(0.0, 0.08)
  frame.lineTo(-0.27, 0.04)
  frame.closePath()
  const hole = new THREE.Path()
  hole.absellipse(0, 0.47, 0.1, 0.16, 0, Math.PI * 2, false, 0)
  frame.holes.push(hole)
  const hole2 = new THREE.Path()
  hole2.absellipse(0, 0.2, 0.06, 0.08, 0, Math.PI * 2, false, 0)
  frame.holes.push(hole2)
  const frameGeo = new THREE.ExtrudeGeometry(frame, { depth: 0.022, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 16 })
  for (const z of [-2.98, -1.84]) {
    const f = mesh(frameGeo, iron, TX - 0.05, 0, z - 0.011, g)
    f.castShadow = true
    f.receiveShadow = true
  }
  // Stretcher bar between the frames.
  cyl(0.012, 0.012, 1.14, iron, TX - 0.05, 0.62, TZ, g, 10).rotation.x = Math.PI / 2
  cyl(0.01, 0.01, 1.14, iron, TX - 0.05, 0.1, TZ, g, 10).rotation.x = Math.PI / 2
  // The treadle plate on its axle (pivot along z at x 4.48, y 0.1).
  const plate = new THREE.Group()
  plate.position.set(4.48, 0.1, TZ)
  g.add(plate)
  const pShape = new THREE.Shape()
  pShape.moveTo(-0.2, -0.27)
  pShape.lineTo(0.18, -0.27)
  pShape.lineTo(0.18, 0.27)
  pShape.lineTo(-0.2, 0.27)
  pShape.closePath()
  for (let i = 0; i < 6; i++) {
    const hp = new THREE.Path()
    hp.absellipse(-0.12 + (i % 3) * 0.12, -0.12 + Math.floor(i / 3) * 0.24, 0.035, 0.08, 0, Math.PI * 2, false, 0)
    pShape.holes.push(hp)
  }
  const plateGeo = new THREE.ExtrudeGeometry(pShape, { depth: 0.014, bevelEnabled: false, curveSegments: 10 })
  plateGeo.rotateX(Math.PI / 2)
  const pm = mesh(plateGeo, iron, 0, 0.012, 0, plate)
  pm.castShadow = true
  pm.receiveShadow = true
  cyl(0.012, 0.012, 1.14, iron, 0, 0, 0, plate, 10).rotation.x = Math.PI / 2
  // The flywheel inside the south frame.
  const flywheel = new THREE.Group()
  flywheel.position.set(4.63, 0.4, -1.9)
  g.add(flywheel)
  const rim = mesh(new THREE.TorusGeometry(0.2, 0.014, 8, 40), iron, 0, 0, 0, flywheel)
  rim.castShadow = true
  for (let k = 0; k < 5; k++) {
    const sp = box(0.012, 0.2, 0.012, iron, 0, 0, 0, flywheel)
    sp.rotation.z = (k / 5) * Math.PI * 2
    sp.position.set(Math.sin(-sp.rotation.z) * 0.1, Math.cos(sp.rotation.z) * 0.1, 0)
  }
  cyl(0.03, 0.03, 0.05, iron, 0, 0, 0, flywheel, 12).rotation.x = Math.PI / 2
  // Pitman rod (from the plate's back edge to the crank pin), updated each frame.
  const pitman = cyl(0.007, 0.007, 1, iron, 0, 0, 0, g, 8)
  pitman.castShadow = true
  // Belt up to the hand wheel.
  tube(
    [
      [4.63, 0.6, -1.9],
      [4.635, 0.8, -1.97],
      [4.64, 1.0, -2.02],
    ],
    0.004,
    leather,
    g,
    8,
  )

  // The machine head: bed along z, needle at the north end, hand wheel at the south.
  const head = new THREE.Group()
  head.position.set(4.6, 0.76, -2.23)
  g.add(head)
  const bed = rbox(0.17, 0.045, 0.4, japan, 0, 0.0225, 0, head, 0.008)
  bed.castShadow = true
  const pillar = rbox(0.085, 0.2, 0.08, black, 0.02, 0.145, 0.15, head, 0.02)
  pillar.castShadow = true
  const armM = rbox(0.07, 0.065, 0.36, japan, 0.02, 0.245, -0.01, head, 0.025)
  armM.castShadow = true
  const nose = rbox(0.075, 0.12, 0.07, black, 0.01, 0.2, -0.17, head, 0.015)
  nose.castShadow = true
  // Needle bar and presser foot.
  const needle = new THREE.Group()
  needle.position.set(-0.012, 0.13, -0.175)
  head.add(needle)
  cyl(0.004, 0.004, 0.07, steel, 0, 0, 0, needle, 8)
  cyl(0.0012, 0.0012, 0.03, steel, 0, -0.048, 0, needle, 6)
  box(0.02, 0.006, 0.03, steel, -0.01, 0.058, -0.175, head)
  cyl(0.003, 0.003, 0.08, steel, 0.008, 0.1, -0.16, head, 6)
  // Hand wheel at the south end, spinning about z.
  const handWheel = new THREE.Group()
  handWheel.position.set(0.02, 0.245, 0.215)
  head.add(handWheel)
  const hw = mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 28), steel, 0, 0, 0, handWheel)
  hw.castShadow = true
  for (let k = 0; k < 4; k++) {
    const sp = box(0.008, 0.11, 0.006, steel, 0, 0, 0, handWheel)
    sp.rotation.z = (k / 4) * Math.PI
  }
  // Spool on its pin: thread the colour of skin.
  const thread = std(0xd9a58c, 0.85)
  cyl(0.003, 0.003, 0.06, steel, 0.02, 0.3, 0.07, head, 6)
  const spool = new THREE.Group()
  spool.position.set(0.02, 0.29, 0.07)
  head.add(spool)
  cyl(0.02, 0.02, 0.005, wood, 0, -0.022, 0, spool, 16)
  cyl(0.02, 0.02, 0.005, wood, 0, 0.022, 0, spool, 16)
  cyl(0.016, 0.016, 0.04, thread, 0, 0, 0, spool, 16)
  tube(
    [
      [0.02, 0.29, 0.054],
      [0.02, 0.3, -0.05],
      [0.0, 0.27, -0.17],
      [-0.012, 0.17, -0.18],
    ],
    0.0006,
    thread,
    head,
    16,
  )
  // Pale cloth under the foot; its texture slides as she feeds it.
  const feedTex = pieceTex()
  feedTex.repeat.set(2, 2)
  const feed = mesh(new THREE.PlaneGeometry(0.22, 0.42), new THREE.MeshStandardMaterial({ map: feedTex, roughness: 0.95, side: THREE.DoubleSide }), 4.56, 0.807, -2.38, g)
  feed.rotation.x = -Math.PI / 2
  feed.receiveShadow = true

  g.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && !m.castShadow) m.castShadow = true
  })
  feed.castShadow = false
  return { group: g, needle, handWheel, flywheel, plate, pitman, feed, needlePoint: new THREE.Vector3(4.588, 0.81, -2.405), crank: new THREE.Vector3() }
}

const vA = new THREE.Vector3()
const vB = new THREE.Vector3()
const yAxis = new THREE.Vector3(0, 1, 0)

/** One phase per stitch cycle (0…1): the needle bobs, the wheels turn, the plate rocks. */
export function runMachine(m: Machine, phase: number, plateTilt: number, slide: number) {
  const a = phase * Math.PI * 2
  m.needle.position.y = 0.13 - 0.025 * (0.5 + 0.5 * Math.cos(a))
  m.handWheel.rotation.z = -a
  m.flywheel.rotation.z = -a
  m.plate.rotation.z = plateTilt
  // Crank pin on the flywheel, then the rod to the plate's back edge.
  m.flywheel.updateMatrixWorld(true)
  vA.set(0, 0.06, 0).applyMatrix4(m.flywheel.matrixWorld)
  m.plate.updateMatrixWorld(true)
  vB.set(0.16, 0.012, 0.27).applyMatrix4(m.plate.matrixWorld)
  m.crank.copy(vA)
  m.pitman.position.copy(vA).add(vB).multiplyScalar(0.5)
  const len = vA.distanceTo(vB)
  m.pitman.scale.set(1, len, 1)
  m.pitman.quaternion.setFromUnitVectors(yAxis, vB.sub(vA).normalize())
  const map = (m.feed.material as THREE.MeshStandardMaterial).map
  if (map) map.offset.set(0, slide)
}

// ——— Stool, dress form, lace, scissors ———

export function stool() {
  const g = new THREE.Group()
  const wood = pbr('wood', 0x4a3424, { roughness: 0.65 })
  const seat = cyl(0.17, 0.165, 0.04, wood, 0, 0.48, 0, g, 28)
  seat.castShadow = true
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    const leg = cyl(0.016, 0.02, 0.5, wood, Math.cos(a) * 0.11, 0.24, Math.sin(a) * 0.11, g, 8)
    leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12)
    leg.castShadow = true
  }
  const ring = mesh(new THREE.TorusGeometry(0.115, 0.008, 6, 24), wood, 0, 0.18, 0, g)
  ring.rotation.x = Math.PI / 2
  return g
}

export function dressForm() {
  const g = new THREE.Group()
  const linen = pbr('fabric', 0xd6cdb9, { roughness: 1 })
  const wood = pbr('wood', 0x2c1e14, { roughness: 0.6 })
  const torso = turned(
    [
      [0, 0.74],
      [0.12, 0.75],
      [0.165, 0.82],
      [0.17, 0.9],
      [0.135, 1.03],
      [0.15, 1.13],
      [0.16, 1.2],
      [0.15, 1.29],
      [0.12, 1.36],
      [0.06, 1.41],
      [0.045, 1.46],
      [0.04, 1.5],
      [0, 1.51],
    ],
    linen,
    32,
    g,
  )
  torso.scale.set(1, 1, 0.72)
  torso.castShadow = true
  torso.receiveShadow = true
  cyl(0.045, 0.045, 0.01, wood, 0, 1.515, 0, g, 16)
  cyl(0.012, 0.012, 0.66, wood, 0, 0.41, 0, g, 10).castShadow = true
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4
    const leg = box(0.025, 0.02, 0.26, wood, Math.cos(a) * 0.11, 0.05, Math.sin(a) * 0.11, g)
    leg.rotation.y = -a + Math.PI / 2
    leg.rotation.x = 0.25
    leg.castShadow = true
  }
  return g
}

/** Lace on the window's north half (it casts a lace shadow into the light). */
export function lace(w: number, h: number) {
  const tex = laceTex()
  tex.repeat.set(w / 0.16, h / 0.16)
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide, color: 0xe8e2d4, roughness: 0.95 })
  const geo = new THREE.PlaneGeometry(w, h, 24, 4)
  const p = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) p.setZ(i, 0.018 * Math.sin(p.getX(i) * 38))
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function scissors() {
  const g = new THREE.Group()
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.35, metalness: 0.6 })
  const blades: THREE.Group[] = []
  for (const s of [-1, 1]) {
    const b = new THREE.Group()
    g.add(b)
    const blade = new THREE.Shape()
    blade.moveTo(0, -0.006)
    blade.lineTo(0.14, -0.002)
    blade.lineTo(0.15, 0.0)
    blade.lineTo(0, 0.008)
    blade.closePath()
    const bm = mesh(new THREE.ExtrudeGeometry(blade, { depth: 0.002, bevelEnabled: false }), black, 0, 0, s * 0.0015, b)
    bm.castShadow = true
    const ring = mesh(new THREE.TorusGeometry(0.02, 0.005, 6, 16), black, -0.04, s * 0.012, 0, b)
    ring.scale.set(1.2, 0.8, 1)
    blades.push(b)
  }
  g.rotation.x = -Math.PI / 2
  return { group: g, blades }
}

// ——— The pale pieces (dawn) ———

export type Pieces = { group: THREE.Group; torso: THREE.Mesh; head: THREE.Mesh; arms: THREE.Mesh[]; legs: THREE.Mesh[]; loose: THREE.Mesh; mat: THREE.MeshStandardMaterial }

function blob(points: Array<[number, number]>, seed: number, wobble: number) {
  const rand = mulberry32(seed)
  const s = new THREE.Shape()
  points.forEach(([x, z], i) => {
    const jx = x + (rand() - 0.5) * wobble
    const jz = z + (rand() - 0.5) * wobble
    if (i === 0) s.moveTo(jx, jz)
    else s.lineTo(jx, jz)
  })
  s.closePath()
  const pts = s.getSpacedPoints(60)
  const smooth = new THREE.Shape(new THREE.SplineCurve(pts).getPoints(80))
  const geo = new THREE.ShapeGeometry(smooth, 2)
  geo.rotateX(Math.PI / 2)
  // Lie flat with a little relief so the light catches the edges.
  const p = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) p.setY(i, 0.002 * Math.sin(p.getX(i) * 60 + p.getZ(i) * 40))
  geo.computeVertexNormals()
  return geo
}

/** Flat, pale, matte pieces — nothing that reads as anything but cloth. */
export function pieces(): Pieces {
  const g = new THREE.Group()
  const tex = pieceTex()
  tex.repeat.set(2.4, 2.4)
  const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: 0.97, side: THREE.DoubleSide, envMapIntensity: 0.4 })
  // A long darker seam across the large piece.
  const seamMat = std(0xa77f6c, 1)
  const torso = mesh(
    blob(
      [
        [-0.17, -0.2],
        [0.17, -0.21],
        [0.19, 0.0],
        [0.16, 0.2],
        [-0.16, 0.21],
        [-0.19, 0.02],
      ],
      4,
      0.03,
    ),
    mat,
  )
  g.add(torso)
  const seam = box(0.004, 0.003, 0.4, seamMat, 0.02, 0.003, 0, torso)
  seam.rotation.y = 0.12
  const head = mesh(
    blob(
      [
        [-0.09, -0.07],
        [0.09, -0.08],
        [0.1, 0.05],
        [0.0, 0.1],
        [-0.1, 0.05],
      ],
      9,
      0.02,
    ),
    mat,
  )
  g.add(head)
  // Folded under: a second layer just below.
  const fold = mesh(head.geometry, mat, 0, -0.004, 0.01, head)
  fold.scale.set(0.95, 1, 0.9)
  const long = (len: number, w: number, seed: number) =>
    mesh(
      blob(
        [
          [-w / 2, -len / 2],
          [w / 2, -len / 2],
          [w * 0.6, 0],
          [w / 2, len / 2],
          [-w / 2, len / 2],
          [-w * 0.55, 0],
        ],
        seed,
        0.015,
      ),
      mat,
    )
  const arms = [long(0.42, 0.09, 12), long(0.4, 0.085, 13)]
  const legs = [long(0.56, 0.13, 14), long(0.54, 0.12, 15)]
  for (const m of [...arms, ...legs]) g.add(m)
  const loose = long(0.18, 0.07, 19)
  g.add(loose)
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.receiveShadow = true
      o.castShadow = true
    }
  })
  return { group: g, torso, head, arms, legs, loose, mat }
}

// ——— Marks ———

export type Marks = {
  wall: THREE.Mesh
  wallMat: THREE.MeshStandardMaterial
  cut: { value: number }
  pools: THREE.Mesh[]
  wiped: THREE.Mesh[]
}

/** The smears on the north wall (revealed east → west) and the pools on the floor. */
export function marks(): Marks {
  const tex = smearTex()
  const cut = { value: 1 }
  const wallMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
  wallMat.onBeforeCompile = (shader) => {
    shader.uniforms.uCut = cut
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uCut;')
      .replace('#include <map_fragment>', '#include <map_fragment>\n#ifdef USE_MAP\ndiffuseColor.a *= smoothstep(uCut - 0.04, uCut + 0.01, vMapUv.x);\n#endif')
  }
  wallMat.customProgramCacheKey = () => 'takinti-smear'
  // x 2.15 … 3.75, y 0.18 … 1.0 on the north wall (z −4.4).
  const wall = mesh(new THREE.PlaneGeometry(1.6, 0.82), wallMat, 2.95, 0.59, -4.395)
  wall.receiveShadow = true
  const pools: THREE.Mesh[] = []
  const spots: Array<[number, number, number]> = [
    [3.35, -4.12, 0.55],
    [3.05, -4.1, 0.5],
    [2.75, -4.08, 0.5],
    [2.45, -4.06, 0.55],
    [2.05, -3.9, 0.75],
  ]
  spots.forEach(([x, z, s], i) => {
    const m = mesh(new THREE.PlaneGeometry(s, s * 0.8), new THREE.MeshStandardMaterial({ map: poolTex(30 + i, false), transparent: true, roughness: 0.18, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), x, 0.004, z)
    m.rotation.x = -Math.PI / 2
    m.receiveShadow = true
    pools.push(m)
  })
  const wiped: THREE.Mesh[] = []
  const wipes: Array<[number, number, number]> = [
    [3.1, -3.7, 1.0],
    [2.3, -3.5, 1.1],
    [1.9, -3.0, 0.8],
  ]
  wipes.forEach(([x, z, s], i) => {
    const m = mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: poolTex(50 + i, true), transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), x, 0.004, z)
    m.rotation.x = -Math.PI / 2
    m.receiveShadow = true
    wiped.push(m)
  })
  return { wall, wallMat, cut, pools, wiped }
}
