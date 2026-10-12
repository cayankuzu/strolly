/**
 * The house, built once: two storeys of old plaster, worn boards and faded
 * wallpaper, a straight wooden stair, the street outside with its lamps. Every
 * room a camera stands in is closed on all sides, so the reader can look
 * around anywhere. Coordinates follow docs/stories/takinti.md (meters; x east,
 * y up, z south). Ground floor y 0–2.7, upper floor y 3.0–5.7.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { facade, rbox, std } from '../kit/props'
import { mapsFor, pbr } from '../kit/surfaces'

type M = THREE.Material

export const UP = 3.0
export const H_GROUND = 2.7
export const H_UP = 2.7

// ——— Canvas surfaces ———

function canvasTex(px: number, draw: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = px
  draw(c.getContext('2d')!, px)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

/** Faded wallpaper: thin stripes and a small half-drop motif, foxed and sun-bleached. */
function wallpaperTex() {
  return canvasTex(512, (g, s) => {
    const rand = mulberry32(17)
    g.fillStyle = '#cdc4a8'
    g.fillRect(0, 0, s, s)
    for (let x = 0; x < s; x += 64) {
      g.fillStyle = 'rgba(150,140,110,0.22)'
      g.fillRect(x + 30, 0, 4, s)
      g.fillStyle = 'rgba(255,250,235,0.2)'
      g.fillRect(x + 36, 0, 2, s)
    }
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 8; col++) {
        const x = col * 64 + (row % 2 ? 32 : 0) + 0
        const y = row * 64 + 20
        g.save()
        g.translate(x, y)
        g.fillStyle = 'rgba(120,128,96,0.42)'
        for (let k = 0; k < 4; k++) {
          g.rotate(Math.PI / 2)
          g.beginPath()
          g.ellipse(0, 6, 3, 6, 0, 0, Math.PI * 2)
          g.fill()
        }
        g.fillStyle = 'rgba(150,96,80,0.4)'
        g.beginPath()
        g.arc(0, 0, 2.5, 0, Math.PI * 2)
        g.fill()
        g.restore()
      }
    // Foxing and old water marks.
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(110,90,60,${0.03 + rand() * 0.05})`
      g.beginPath()
      g.arc(rand() * s, rand() * s, 4 + rand() * 30, 0, Math.PI * 2)
      g.fill()
    }
  })
}

function checkerTex(a: string, b: string, n: number, grout: string) {
  return canvasTex(512, (g, s) => {
    const rand = mulberry32(5)
    const t = s / n
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        g.fillStyle = (i + j) % 2 ? a : b
        g.fillRect(i * t, j * t, t, t)
        g.fillStyle = `rgba(0,0,0,${rand() * 0.05})`
        g.fillRect(i * t, j * t, t, t)
      }
    g.strokeStyle = grout
    g.lineWidth = 3
    for (let i = 0; i <= n; i++) {
      g.beginPath()
      g.moveTo(i * t, 0)
      g.lineTo(i * t, s)
      g.moveTo(0, i * t)
      g.lineTo(s, i * t)
      g.stroke()
    }
  })
}

function roofTex() {
  return canvasTex(256, (g, s) => {
    const rand = mulberry32(9)
    g.fillStyle = '#2a2420'
    g.fillRect(0, 0, s, s)
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const l = 30 + rand() * 18
        g.fillStyle = `rgb(${l + 18},${l + 4},${l - 4})`
        g.fillRect(c * 32 + (r % 2 ? 16 : 0) - 16, r * 32, 30, 28)
        g.fillStyle = 'rgba(0,0,0,0.5)'
        g.fillRect(c * 32 + (r % 2 ? 16 : 0) - 16, r * 32 + 26, 30, 4)
      }
  })
}

/** A textured material with real-scale UVs (`meters` per texture tile) and a scanned relief. */
function papered(map: THREE.Texture, meters: number, relief: 'plaster' | 'tile' | 'planks' | 'concrete', opts: THREE.MeshStandardMaterialParameters = {}) {
  const { maps } = mapsFor(relief)
  const m = new THREE.MeshStandardMaterial({ map, normalMap: maps.normal, normalScale: new THREE.Vector2(0.5, 0.5), roughnessMap: maps.orm, roughness: 1, ...opts })
  m.userData.meters = meters
  return m
}

export function housePalette() {
  return {
    wallpaper: papered(wallpaperTex(), 0.55, 'plaster', { roughness: 1 }),
    plaster: pbr('plaster', 0xbdb5a3, { roughness: 1 }),
    sewingWall: pbr('plaster', 0xb3ab98, { roughness: 1 }),
    boysWall: pbr('painted', 0xaebcc2, { roughness: 1 }),
    kitchenWall: pbr('painted', 0xe8e4da, { roughness: 1 }),
    toiletTile: papered(checkerTex('#e9e6dc', '#e2ded2', 4, '#b9b3a4'), 0.6, 'tile', { roughness: 0.5 }),
    kitchenTile: papered(checkerTex('#efe6cf', '#b9cdb4', 2, '#a9a28f'), 0.6, 'tile', { roughness: 0.45 }),
    backsplash: papered(checkerTex('#eae6db', '#e4e0d4', 6, '#bdb6a6'), 0.6, 'tile', { roughness: 0.4 }),
    floorWood: pbr('planks', 0x6e5240, { roughness: 1 }),
    floorWoodPale: pbr('planks', 0x8a6c55, { roughness: 1 }),
    ceiling: pbr('plaster', 0xd9d4c8, { roughness: 1 }),
    exterior: pbr('plaster', 0x8b857a, { roughness: 1 }),
    plinth: pbr('concrete', 0x55524c, { roughness: 1 }),
    roof: papered(roofTex(), 1.2, 'concrete', { roughness: 0.9 }),
    trim: pbr('painted', 0xd5cebd, { roughness: 0.8 }),
    doorLeaf: pbr('painted', 0xc9c1ae, { roughness: 0.75 }),
    stairWood: pbr('wood', 0x5b3f2b, { roughness: 0.7 }),
    rail: pbr('wood', 0x3f2a1c, { roughness: 0.55 }),
    brass: pbr('metal', 0x9a8456, { roughness: 0.45 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9fb0b8, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.12, depthWrite: false, envMapIntensity: 1.4 }),
    frosted: new THREE.MeshStandardMaterial({ color: 0x9bb2cf, roughness: 0.6, emissive: 0x2a3b58, emissiveIntensity: 1 }),
    windowFrame: pbr('painted', 0xcfc9bb, { roughness: 0.7 }),
    shutter: pbr('wood', 0x3b3a33, { roughness: 0.9 }),
    asphalt: pbr('asphalt', 0x24262a, { roughness: 1 }),
    paving: pbr('paving', 0x4b4b48, { roughness: 1 }),
    curb: pbr('concrete', 0x6a6862, { roughness: 1 }),
    farWall: pbr('concrete', 0x2b2d31, { roughness: 1 }),
    neighbour: pbr('plaster', 0x5f5a52, { roughness: 1 }),
    black: std(0x050505, 1),
    lampPole: pbr('metal', 0x1d2123, { roughness: 0.6 }),
    lampGlass: new THREE.MeshBasicMaterial({ color: 0xe9fff2 }),
  }
}
export type HousePalette = ReturnType<typeof housePalette>

// ——— Walls with holes ———

export type Hole = { a: number; b: number; y0: number; y1: number }

/**
 * A wall along an axis. axis 'x': runs along x from a0 to a1 at z = c;
 * axis 'z': runs along z at x = c. Thickness t is centered on c (or offset by
 * `shift`). Holes are cut as gaps in [a, b] × [y0, y1].
 */
export function wall(parent: THREE.Object3D, axis: 'x' | 'z', c: number, a0: number, a1: number, y0: number, y1: number, t: number, mat: M, holes: Hole[] = [], shift = 0) {
  const pieces: Array<[number, number, number, number]> = []
  const hs = [...holes].sort((p, q) => p.a - q.a)
  let a = a0
  for (const h of hs) {
    if (h.a > a) pieces.push([a, h.a, y0, y1])
    if (h.y0 > y0) pieces.push([h.a, h.b, y0, h.y0])
    if (h.y1 < y1) pieces.push([h.b > h.a ? h.a : h.b, h.b, h.y1, y1])
    a = h.b
  }
  if (a < a1) pieces.push([a, a1, y0, y1])
  const out: THREE.Mesh[] = []
  for (const [p0, p1, q0, q1] of pieces) {
    const len = p1 - p0
    const ht = q1 - q0
    if (len < 0.002 || ht < 0.002) continue
    const m = axis === 'x' ? box(len, ht, t, mat, (p0 + p1) / 2, (q0 + q1) / 2, c + shift, parent) : box(t, ht, len, mat, c + shift, (q0 + q1) / 2, (p0 + p1) / 2, parent)
    m.castShadow = true
    m.receiveShadow = true
    out.push(m)
  }
  return out
}

/** Skirting along a wall face. `face` is the coordinate of the face, `dir` the side it looks to. */
export function skirting(parent: THREE.Object3D, axis: 'x' | 'z', face: number, dir: 1 | -1, a0: number, a1: number, y: number, mat: M) {
  if (a1 - a0 < 0.05) return
  if (axis === 'x') rbox(a1 - a0, 0.1, 0.016, mat, (a0 + a1) / 2, y + 0.05, face + dir * 0.008, parent, 0.003)
  else rbox(0.016, 0.1, a1 - a0, mat, face + dir * 0.008, y + 0.05, (a0 + a1) / 2, parent, 0.003)
}

/** Casing boards around an opening on both faces of a wall of thickness t. */
export function casing(parent: THREE.Object3D, axis: 'x' | 'z', c: number, a: number, b: number, y0: number, y1: number, t: number, mat: M, sill = false) {
  const w = 0.07
  for (const side of [-1, 1]) {
    const f = c + side * (t / 2 + 0.009)
    const put = (along: number, alongLen: number, y: number, h: number) =>
      axis === 'x' ? rbox(alongLen, h, 0.018, mat, along, y, f, parent, 0.003) : rbox(0.018, h, alongLen, mat, f, y, along, parent, 0.003)
    put(a - w / 2, w, (y0 + y1 + w) / 2, y1 - y0 + w)
    put(b + w / 2, w, (y0 + y1 + w) / 2, y1 - y0 + w)
    put((a + b) / 2, b - a + 2 * w, y1 + w / 2, w)
    if (sill) put((a + b) / 2, b - a + 2 * w, y0 - w / 2, w)
  }
  // The reveal: the opening's own faces.
  const r = 0.012
  if (axis === 'x') {
    box(r, y1 - y0, t, mat, a + r / 2, (y0 + y1) / 2, c, parent)
    box(r, y1 - y0, t, mat, b - r / 2, (y0 + y1) / 2, c, parent)
    box(b - a, r, t, mat, (a + b) / 2, y1 - r / 2, c, parent)
  } else {
    box(t, y1 - y0, r, mat, c, (y0 + y1) / 2, a + r / 2, parent)
    box(t, y1 - y0, r, mat, c, (y0 + y1) / 2, b - r / 2, parent)
    box(t, r, b - a, mat, c, y1 - r / 2, (a + b) / 2, parent)
  }
}

/** A horizontal slab (floor or ceiling plane) over a rectangle. `up` faces it to +y. */
export function plane(parent: THREE.Object3D, x0: number, x1: number, z0: number, z1: number, y: number, mat: M, up = true) {
  const m = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat, (x0 + x1) / 2, y, (z0 + z1) / 2, parent)
  m.rotation.x = up ? -Math.PI / 2 : Math.PI / 2
  m.receiveShadow = true
  return m
}

/** A window in an x-facing (east/west) wall: frame, a cross bar, two casements of glass, a sill. */
export function windowZ(parent: THREE.Object3D, x: number, z0: number, z1: number, y0: number, y1: number, pal: HousePalette, outward: 1 | -1) {
  const g = new THREE.Group()
  parent.add(g)
  const fw = 0.05
  const zc = (z0 + z1) / 2
  const fx = x + outward * 0.06
  for (const zz of [z0 + fw / 2, z1 - fw / 2, zc]) rbox(0.06, y1 - y0, fw, pal.windowFrame, fx, (y0 + y1) / 2, zz, g, 0.004)
  for (const yy of [y0 + fw / 2, y1 - fw / 2, y0 + (y1 - y0) * 0.72]) rbox(0.06, fw, z1 - z0, pal.windowFrame, fx, yy, zc, g, 0.004)
  const glass = box(0.006, y1 - y0 - 2 * fw, z1 - z0 - 2 * fw, pal.glass, fx, (y0 + y1) / 2, zc, g)
  glass.castShadow = false
  glass.renderOrder = 2
  // Outside sill.
  rbox(0.2, 0.05, z1 - z0 + 0.16, pal.plinth, x + outward * 0.2, y0 - 0.03, zc, g, 0.006)
  return { group: g, glass }
}

export type House = {
  group: THREE.Group
  street: THREE.Group
  /** The sewing room door leaf group (rotate .rotation.y; hinge on the south jamb). */
  sewDoor: THREE.Group
  /** The toilet door leaf (hinge on its south jamb, opening into the toilet). */
  toiletDoor: THREE.Group
  /** The boys' room door leaf (open at night). */
  boysDoor: THREE.Group
  /** Blind slats over the boys' window: set(open, raised). */
  blind: { set(open: number, raised: number): void; group: THREE.Group }
  /** Window panes facing the street (exterior views). */
  frontGlass: THREE.Mesh[]
  /** The faint frosted pane in the toilet. */
  frosted: THREE.Mesh
  /** The street lamp's bulbs (emissive), A then B. */
  lampBulbs: THREE.Mesh[]
  /** Where the two street lamps shine from. */
  lampA: THREE.Vector3
  lampB: THREE.Vector3
}

/** A door leaf on a hinge: returns the pivot group; the leaf closes along +z from the hinge (rotation 0). */
function leafOnHinge(pal: HousePalette, w: number, h: number) {
  const pivot = new THREE.Group()
  const lw = w - 0.01
  rbox(0.04, h - 0.01, lw, pal.doorLeaf, 0, h / 2, lw / 2, pivot, 0.004)
  // Raised panels on both faces.
  for (const sx of [-1, 1])
    for (const [py, ph] of [
      [h * 0.72, h * 0.34],
      [h * 0.28, h * 0.38],
    ] as const)
      rbox(0.008, ph, lw - 0.2, pal.doorLeaf, sx * 0.022, py, lw / 2, pivot, 0.003)
  // Knob on both faces at the free edge.
  for (const sx of [-1, 1]) {
    const k = cyl(0.026, 0.022, 0.05, pal.brass, sx * 0.045, 1.0, lw - 0.07, pivot, 16)
    k.rotation.z = Math.PI / 2
    rbox(0.006, 0.16, 0.045, pal.brass, sx * 0.024, 0.98, lw - 0.07, pivot, 0.003)
  }
  for (const hy of [0.25, h - 0.3]) cyl(0.009, 0.009, 0.1, pal.brass, 0, hy, 0.005, pivot, 8)
  pivot.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return pivot
}

/** A thin facing layer on an x-facing wall (z from a0 to a1), leaving a door opening clear. */
function facing(g: THREE.Object3D, x: number, a0: number, a1: number, y0: number, y1: number, door: { a: number; b: number; y1: number }, mat: M) {
  const put = (z0: number, z1: number, q0: number, q1: number) => {
    if (z1 - z0 < 0.002 || q1 - q0 < 0.002) return
    box(0.004, q1 - q0, z1 - z0, mat, x, (q0 + q1) / 2, (z0 + z1) / 2, g).receiveShadow = true
  }
  put(a0, door.a, y0, y1)
  put(door.b, a1, y0, y1)
  put(door.a, door.b, door.y1, y1)
}

export function buildHouse(scene: THREE.Scene, pal: HousePalette): House {
  const g = new THREE.Group()
  g.name = 'house'
  scene.add(g)
  const T = 0.12 // interior partitions
  const TE = 0.25 // exterior walls
  const Y1 = H_GROUND
  const U0 = UP
  const U1 = UP + H_UP
  const SLAB0 = Y1
  const ROOF_Y = U1 + 0.25

  // ——— Exterior shell (inner faces: x −2.6 … 5.0, z −11.0 … 5.6) ———
  const X0 = -2.6
  const X1 = 5.0
  const Z0 = -11.0
  const Z1 = 5.6
  // East (street) wall: two windows over each other at z −2.9 … −1.7, plus shuttered ones elsewhere.
  const eastHoles: Hole[] = [
    { a: -2.9, b: -1.7, y0: 0.85, y1: 2.2 },
    { a: -2.9, b: -1.7, y0: U0 + 0.85, y1: U0 + 2.2 },
    { a: -8.6, b: -7.4, y0: 0.85, y1: 2.2 },
    { a: -8.6, b: -7.4, y0: U0 + 0.85, y1: U0 + 2.2 },
    { a: 2.4, b: 3.6, y0: 0.85, y1: 2.2 },
    { a: 2.4, b: 3.6, y0: U0 + 0.85, y1: U0 + 2.2 },
  ]
  // The wall is split in two heights so each floor's holes cut cleanly.
  wall(g, 'z', X1 + TE / 2, Z0 - TE, Z1 + TE, 0, U0, TE, pal.exterior, eastHoles.filter((h) => h.y1 <= U0))
  wall(
    g,
    'z',
    X1 + TE / 2,
    Z0 - TE,
    Z1 + TE,
    U0,
    ROOF_Y,
    TE,
    pal.exterior,
    eastHoles.filter((h) => h.y0 >= U0),
  )
  wall(g, 'z', X0 - TE / 2, Z0 - TE, Z1 + TE, 0, ROOF_Y, TE, pal.exterior, [{ a: -3.3, b: -2.8, y0: U0 + 1.7, y1: U0 + 2.2 }])
  // North wall: the kitchen window.
  wall(g, 'x', Z0 - TE / 2, X0, X1, 0, ROOF_Y, TE, pal.exterior, [{ a: -0.7, b: 0.7, y0: 1.0, y1: 2.0 }])
  // South wall: the front door (hall) and the landing window.
  wall(g, 'x', Z1 + TE / 2, X0, X1, 0, ROOF_Y, TE, pal.exterior, [
    { a: -0.55, b: 0.55, y0: 0, y1: 2.15 },
    { a: -0.6, b: 0.2, y0: U0 + 1.0, y1: U0 + 1.8 },
  ])
  // Plinth along the street face.
  box(0.06, 0.45, Z1 - Z0 + 2 * TE, pal.plinth, X1 + TE + 0.03, 0.225, (Z0 + Z1) / 2, g)
  // Floor band between the storeys, outside.
  box(0.05, 0.12, Z1 - Z0 + 2 * TE, pal.plinth, X1 + TE + 0.025, U0 - 0.12, (Z0 + Z1) / 2, g)

  // ——— Windows ———
  const frontGlass: THREE.Mesh[] = []
  frontGlass.push(windowZ(g, X1 + 0.03, -2.9, -1.7, 0.85, 2.2, pal, 1).glass)
  frontGlass.push(windowZ(g, X1 + 0.03, -2.9, -1.7, U0 + 0.85, U0 + 2.2, pal, 1).glass)
  for (const [a, b] of [
    [-8.6, -7.4],
    [2.4, 3.6],
  ] as const)
    for (const y of [0, U0]) {
      frontGlass.push(windowZ(g, X1 + 0.03, a, b, y + 0.85, y + 2.2, pal, 1).glass)
      // Closed wooden shutters outside, and the room behind blocked off.
      for (const s of [0, 1]) {
        const sh = rbox(0.04, 1.4, 0.6, pal.shutter, X1 + TE + 0.03, y + 1.52, a + 0.3 + s * 0.6, g, 0.004)
        sh.castShadow = true
        for (let k = 0; k < 8; k++) rbox(0.012, 0.03, 0.52, pal.shutter, X1 + TE + 0.055, y + 0.95 + k * 0.165, a + 0.3 + s * 0.6, g, 0.002)
      }
      box(0.02, 1.4, 1.2, pal.black, X1 - 0.02, y + 1.52, (a + b) / 2, g)
    }
  // Inner casings for the two story windows.
  casing(g, 'z', X1 + TE / 2, -2.9, -1.7, 0.85, 2.2, TE, pal.trim, true)
  casing(g, 'z', X1 + TE / 2, -2.9, -1.7, U0 + 0.85, U0 + 2.2, TE, pal.trim, true)
  // Toilet: the frosted window high in the west wall.
  const frosted = box(0.01, 0.46, 0.46, pal.frosted, X0 - 0.06, U0 + 1.95, -3.05, g)
  rbox(0.05, 0.5, 0.05, pal.windowFrame, X0 - 0.05, U0 + 1.95, -3.05, g, 0.004).scale.set(1, 1, 1)
  // Kitchen window (north) and the landing window (south).
  const kw = new THREE.Group()
  g.add(kw)
  for (const xx of [-0.675, 0, 0.675]) rbox(0.05, 1.0, 0.06, pal.windowFrame, xx, 1.5, Z0 - 0.06, kw, 0.004)
  for (const yy of [1.025, 1.975, 1.6]) rbox(1.4, 0.05, 0.06, pal.windowFrame, 0, yy, Z0 - 0.06, kw, 0.004)
  box(1.3, 0.9, 0.006, pal.glass, 0, 1.5, Z0 - 0.06, kw).castShadow = false
  casing(g, 'x', Z0 - TE / 2, -0.7, 0.7, 1.0, 2.0, TE, pal.trim, true)
  for (const xx of [-0.575, -0.2, 0.175]) rbox(0.05, 0.8, 0.06, pal.windowFrame, xx, U0 + 1.4, Z1 + 0.06, g, 0.004)
  for (const yy of [U0 + 1.025, U0 + 1.775]) rbox(0.8, 0.05, 0.06, pal.windowFrame, -0.2, yy, Z1 + 0.06, g, 0.004)
  box(0.7, 0.7, 0.006, pal.glass, -0.2, U0 + 1.4, Z1 + 0.06, g).castShadow = false
  casing(g, 'x', Z1 + TE / 2, -0.6, 0.2, U0 + 1.0, U0 + 1.8, TE, pal.trim, true)

  // ——— Slab between the floors (with the stairwell x −1.8 … −0.8, z 0.9 … 4.6) ———
  // (Kept 2 mm off the floor and ceiling planes so they never fight.)
  const slab = (x0: number, x1: number, z0: number, z1: number) => {
    const m = box(x1 - x0, U0 - SLAB0 - 0.004, z1 - z0, pal.plaster, (x0 + x1) / 2, (SLAB0 + U0) / 2, (z0 + z1) / 2, g)
    m.castShadow = true
    m.receiveShadow = true
  }
  slab(X0, X1, Z0, 0.9)
  slab(X0, X1, 4.6, Z1)
  slab(-0.8, X1, 0.9, 4.6)
  slab(X0, -1.8, 0.9, 4.6)
  // Ceiling of the upper floor + the roof slab.
  box(X1 - X0, 0.2, Z1 - Z0, pal.plaster, (X0 + X1) / 2, U1 + 0.102, (Z0 + Z1) / 2, g).castShadow = true

  // ——— Floors and ceilings, room by room ———
  // Ground floor.
  plane(g, -0.8, 0.8, -7.5, Z1, 0, pal.floorWood) // lower hallway
  plane(g, -1.8, -0.8, 0, Z1, 0, pal.floorWood) // stair hall
  plane(g, 0.8, X1, -4.4, -0.4, 0, pal.floorWood) // sewing room
  plane(g, -2.5, 2.5, Z0, -7.5, 0, pal.kitchenTile) // kitchen
  plane(g, -0.8, 0.8, -7.5, Z1, Y1, pal.ceiling, false)
  plane(g, -1.8, -0.8, 0, 0.9, Y1, pal.ceiling, false)
  plane(g, 0.8, X1, -4.4, -0.4, Y1, pal.ceiling, false)
  plane(g, -2.5, 2.5, Z0, -7.5, Y1, pal.ceiling, false)
  // Upper floor.
  plane(g, 0.8, X1, -4.4, -0.4, U0, pal.floorWoodPale) // boys' room
  plane(g, -0.8, 0.8, -4.4, 4.6, U0, pal.floorWood) // upper hallway
  plane(g, -1.8, 0.8, 4.6, Z1, U0, pal.floorWood) // landing
  plane(g, -2.6, -0.8, -4.4, -2.2, U0, pal.toiletTile) // toilet
  plane(g, 0.8, X1, -4.4, -0.4, U1, pal.ceiling, false)
  plane(g, -0.8, 0.8, -4.4, Z1, U1, pal.ceiling, false)
  plane(g, -1.8, -0.8, 0.9, Z1, U1, pal.ceiling, false)
  plane(g, -2.6, -0.8, -4.4, -2.2, U1, pal.ceiling, false)

  // ——— Ground floor partitions ———
  // Hallway west wall (x −0.8): solid from the kitchen to the stair hall.
  wall(g, 'z', -0.8 - T / 2, -7.5, 0, 0, Y1, T, pal.wallpaper)
  skirting(g, 'z', -0.8, 1, -7.5, 0, 0, pal.trim)
  // Stair hall: north wall at z 0, west wall at x −1.8 (both storeys).
  wall(g, 'x', 0 - T / 2, -1.8 - T, -0.8, 0, Y1, T, pal.wallpaper)
  wall(g, 'z', -1.8 - T / 2, -2.2, Z1, 0, U1, T, pal.wallpaper)
  skirting(g, 'z', -1.8, 1, 0, Z1, 0, pal.trim)
  // Under the stairs: a panelled side along x −0.8, rising with the flight.
  // Hallway east wall (x 0.8): the sewing room door at z −1.6 … −0.7.
  wall(g, 'z', 0.8 + T / 2, -7.5, Z1, 0, Y1, T, pal.wallpaper, [{ a: -1.6, b: -0.7, y0: 0, y1: 2.05 }])
  casing(g, 'z', 0.8 + T / 2, -1.6, -0.7, 0, 2.05, T, pal.trim)
  skirting(g, 'z', 0.8, -1, -7.5, -1.67, 0, pal.trim)
  skirting(g, 'z', 0.8, -1, -0.63, Z1, 0, pal.trim)
  // Sewing room: north and south walls; its west wall is the hallway's (other face).
  wall(g, 'x', -4.4 - T / 2, 0.8, X1, 0, Y1, T, pal.sewingWall)
  wall(g, 'x', -0.4 + T / 2, 0.8, X1, 0, Y1, T, pal.sewingWall)
  // The sewing-room face of the hallway wall wears plaster, not paper.
  // (Split around the door opening z −1.6 … −0.7, up to 2.05.)
  facing(g, 0.8 + T + 0.003, -4.39, -0.41, 0, Y1, { a: -1.6, b: -0.7, y1: 2.05 }, pal.sewingWall)
  skirting(g, 'x', -4.4, 1, 0.8 + T, X1, 0, pal.trim)
  skirting(g, 'x', -0.4, -1, 0.8 + T, X1, 0, pal.trim)
  skirting(g, 'z', X1, -1, -4.4, -0.4, 0, pal.trim)
  // Kitchen: south wall with the doorway (x −0.8 … 0.8), west and east walls.
  wall(g, 'x', -7.5 + T / 2, -2.5, 2.5, 0, Y1, T, pal.kitchenWall, [{ a: -0.8, b: 0.8, y0: 0, y1: 2.1 }])
  casing(g, 'x', -7.5 + T / 2, -0.8, 0.8, 0, 2.1, T, pal.trim)
  wall(g, 'z', -2.5 - T / 2, Z0, -7.5, 0, Y1, T, pal.kitchenWall)
  wall(g, 'z', 2.5 + T / 2, Z0, -7.5, 0, Y1, T, pal.kitchenWall)
  // The kitchen's north wall face (the exterior wall's inside): paint, with tiles over the counter.
  // (Left open around the window, x −0.7 … 0.7, y 1.0 … 2.0.)
  for (const [x0, x1, y0, y1] of [
    [-2.5, -0.7, 0, Y1],
    [0.7, 2.5, 0, Y1],
    [-0.7, 0.7, 0, 1.0],
    [-0.7, 0.7, 2.0, Y1],
  ] as const)
    box(x1 - x0, y1 - y0, 0.004, pal.kitchenWall, (x0 + x1) / 2, (y0 + y1) / 2, Z0 + 0.003, g).receiveShadow = true
  skirting(g, 'x', -7.5, -1, -2.5, -0.87, 0, pal.trim)
  skirting(g, 'x', -7.5, -1, 0.87, 2.5, 0, pal.trim)
  skirting(g, 'z', -2.5, 1, Z0, -7.5, 0, pal.trim)
  skirting(g, 'z', 2.5, -1, Z0, -7.5, 0, pal.trim)
  // Hallway: the front door (closed) at the south end.
  const front = leafOnHinge(pal, 1.1, 2.15)
  front.position.set(0.55, 0, Z1 - 0.02)
  front.rotation.y = -Math.PI / 2
  g.add(front)
  casing(g, 'x', Z1 + TE / 2, -0.55, 0.55, 0, 2.15, TE, pal.trim)

  // ——— Upper floor partitions ———
  // Hallway west wall (x −0.8): toilet door at z −3.275 … −2.525; solid to z 0.9.
  wall(g, 'z', -0.8 - T / 2, -4.4, 0.9, U0, U1, T, pal.wallpaper, [{ a: -3.275, b: -2.525, y0: U0, y1: U0 + 2.0 }])
  casing(g, 'z', -0.8 - T / 2, -3.275, -2.525, U0, U0 + 2.0, T, pal.trim)
  skirting(g, 'z', -0.8, 1, -4.4, -3.34, U0, pal.trim)
  skirting(g, 'z', -0.8, 1, -2.46, 0.9, U0, pal.trim)
  // The stairwell's north face (z 0.9) from the stair hall up to the upper ceiling.
  wall(g, 'x', 0.9 - T / 2, -1.8, -0.8, Y1 - 0.02, U1, T, pal.wallpaper)
  // Hallway east wall (x 0.8): the boys' room door z −2.0 … −1.15; the linen cupboard z 3.6 … 4.5.
  wall(g, 'z', 0.8 + T / 2, -4.4, Z1, U0, U1, T, pal.wallpaper, [
    { a: -2.0, b: -1.15, y0: U0, y1: U0 + 2.05 },
    { a: 3.6, b: 4.5, y0: U0, y1: U0 + 2.1 },
  ])
  casing(g, 'z', 0.8 + T / 2, -2.0, -1.15, U0, U0 + 2.05, T, pal.trim)
  skirting(g, 'z', 0.8, -1, -4.4, -2.07, U0, pal.trim)
  skirting(g, 'z', 0.8, -1, -1.08, 3.53, U0, pal.trim)
  skirting(g, 'z', 0.8, -1, 4.57, Z1, U0, pal.trim)
  // North end of the hallway.
  wall(g, 'x', -4.4 - T / 2, -0.8 - T, 0.8 + T, U0, U1, T, pal.wallpaper)
  // Boys' room: north and south walls (west wall = the hallway's east wall, other face).
  wall(g, 'x', -4.4 - T / 2, 0.8, X1, U0, U1, T, pal.boysWall)
  wall(g, 'x', -0.4 + T / 2, 0.8, X1, U0, U1, T, pal.boysWall)
  facing(g, 0.8 + T + 0.003, -4.39, -0.41, U0, U0 + H_UP, { a: -2.0, b: -1.15, y1: U0 + 2.05 }, pal.boysWall)
  skirting(g, 'x', -4.4, 1, 0.8 + T, X1, U0, pal.trim)
  skirting(g, 'x', -0.4, -1, 0.8 + T, X1, U0, pal.trim)
  skirting(g, 'z', X1, -1, -4.4, -0.4, U0, pal.trim)
  // Toilet: north and south walls; its tiles to shoulder height.
  wall(g, 'x', -4.4 - T / 2, X0, -0.8, U0, U1, T, pal.plaster)
  wall(g, 'x', -2.2 + T / 2, X0, -0.8, U0, U1, T, pal.plaster)
  for (const [c, a0, a1] of [
    [-4.4 + 0.004, X0, -0.8 - T],
    [-2.2 - 0.004, X0, -0.8 - T],
  ] as const)
    box(a1 - a0, 1.5, 0.006, pal.toiletTile, (a0 + a1) / 2, U0 + 0.75, c, g).receiveShadow = true
  box(0.006, 1.5, 2.2, pal.toiletTile, X0 + 0.004, U0 + 0.75, -3.3, g).receiveShadow = true
  box(0.006, 1.5, 0.7, pal.toiletTile, -0.8 - T - 0.004, U0 + 0.75, -3.85, g).receiveShadow = true
  box(0.006, 1.5, 0.27, pal.toiletTile, -0.8 - T - 0.004, U0 + 0.75, -2.36, g).receiveShadow = true
  // Landing: the south wall is the exterior; west is x −1.8.

  // ——— Doors ———
  // Sewing room: hinge on the south jamb (0.8, −0.7); closed, the leaf runs north to z −1.6.
  const sewDoor = leafOnHinge(pal, 0.9, 2.05)
  sewDoor.position.set(0.8 + T / 2, 0, -0.7)
  sewDoor.rotation.y = Math.PI
  g.add(sewDoor)
  // Toilet: hinge on its south jamb (−0.8, −2.525), opens into the toilet (−x).
  const toiletDoor = leafOnHinge(pal, 0.75, 2.0)
  toiletDoor.position.set(-0.8 - T / 2, U0, -2.525)
  toiletDoor.rotation.y = Math.PI
  g.add(toiletDoor)
  // Boys' room: hinge on the north jamb (0.8, −2.0), opens into the room (+x), open at night.
  const boysDoor = leafOnHinge(pal, 0.85, 2.05)
  boysDoor.position.set(0.8 + T / 2, U0, -2.0)
  g.add(boysDoor)

  // ——— Blind over the boys' window (inside) ———
  const blindG = new THREE.Group()
  blindG.position.set(X1 - 0.07, U0 + 0.85, -2.3)
  g.add(blindG)
  const slatMat = pbr('plastic', 0xd8d4c8, { roughness: 0.6 })
  const nSlats = 24
  const slatGeo = new THREE.BoxGeometry(0.05, 0.003, 1.14)
  const slats = new THREE.InstancedMesh(slatGeo, slatMat, nSlats)
  slats.castShadow = true
  slats.receiveShadow = true
  blindG.add(slats)
  const head = rbox(0.06, 0.05, 1.2, slatMat, 0, 1.38, 0, blindG, 0.006)
  head.castShadow = true
  const bottomBar = rbox(0.05, 0.02, 1.16, slatMat, 0, 0, 0, blindG, 0.004)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const pv = new THREE.Vector3()
  const sv = new THREE.Vector3(1, 1, 1)
  const zAxis = new THREE.Vector3(0, 0, 1)
  const blind = {
    group: blindG,
    set(open: number, raised: number) {
      // Raised: the slats stack up under the head rail.
      const span = 1.32 * (1 - raised)
      const pitch = span / nSlats
      q.setFromAxisAngle(zAxis, (1 - open) * 1.35 + open * 0.35)
      for (let i = 0; i < nSlats; i++) {
        pv.set(0, 1.33 - (i + 1) * Math.max(0.006, pitch), 0)
        slats.setMatrixAt(i, m4.compose(pv, q, sv))
      }
      slats.instanceMatrix.needsUpdate = true
      bottomBar.position.y = 1.33 - nSlats * Math.max(0.006, pitch) - 0.015
    },
  }
  blind.set(0.6, 0)

  buildStairs(g, pal)

  // ——— Roof (gable, ridge along z) ———
  const ridgeX = (X0 + X1) / 2
  const eaveY = ROOF_Y
  const ridgeY = 7.6
  const halfW = (X1 - X0) / 2 + TE + 0.35
  const slope = Math.hypot(halfW, ridgeY - eaveY)
  const ang = Math.atan2(ridgeY - eaveY, halfW)
  for (const s of [-1, 1]) {
    const r = box(slope, 0.12, Z1 - Z0 + 2 * TE + 0.5, pal.roof, ridgeX + (s * halfW) / 2, (eaveY + ridgeY) / 2, (Z0 + Z1) / 2, g)
    r.rotation.z = -s * ang
    r.castShadow = true
  }
  for (const z of [Z0 - TE, Z1 + TE]) {
    const tri = new THREE.Shape()
    tri.moveTo(-halfW + 0.35, 0)
    tri.lineTo(halfW - 0.35, 0)
    tri.lineTo(0, ridgeY - eaveY - 0.05)
    tri.closePath()
    const gm = mesh(new THREE.ShapeGeometry(tri), pal.exterior, ridgeX, eaveY, z, g)
    if (z < 0) gm.rotation.y = Math.PI
  }
  // Gutter and eaves board along the street.
  cyl(0.06, 0.06, Z1 - Z0 + 2 * TE + 0.5, pal.lampPole, X1 + TE + 0.3, eaveY - 0.02, (Z0 + Z1) / 2, g, 10).rotation.x = Math.PI / 2
  cyl(0.035, 0.035, eaveY, pal.lampPole, X1 + TE + 0.08, eaveY / 2, Z1 + 0.1, g, 8)

  // ——— The street ———
  const street = new THREE.Group()
  street.name = 'street'
  scene.add(street)
  const SZ0 = -45
  const SZ1 = 40
  const strip = (x0: number, x1: number, y: number, mat: M) => plane(street, x0, x1, SZ0, SZ1, y, mat)
  strip(X1 + TE, 7.0, 0.12, pal.paving)
  strip(7.0, 12.0, 0, pal.asphalt)
  strip(12.0, 15.0, 0.12, pal.paving)
  // Ground under/around the house, out of sight but never a void.
  plane(street, -30, X1 + TE, SZ0, SZ1, -0.01, pal.paving)
  for (const x of [7.0, 12.0]) box(0.16, 0.13, SZ1 - SZ0, pal.curb, x + (x < 10 ? -0.08 : 0.08), 0.065, (SZ0 + SZ1) / 2, street)
  // Road markings: a broken centre line.
  const dash = std(0x8c8a80, 0.9)
  for (let z = SZ0; z < SZ1; z += 6) box(0.1, 0.004, 3, dash, 9.5, 0.003, z, street).receiveShadow = true
  // Across the street: dark façades (no lit windows: it is late).
  const across = facade({ w: SZ1 - SZ0, h: 11, d: 4, wall: pal.farWall, facing: -1, seed: 51, lit: 0.04 })
  across.position.set(17.2, 0, (SZ0 + SZ1) / 2)
  street.add(across)
  // Neighbours on this side, north and south of the house.
  for (const [z0, z1, seed] of [
    [SZ0, Z0 - TE - 0.05, 61],
    [Z1 + TE + 0.05, SZ1, 67],
  ] as const) {
    const n = facade({ w: z1 - z0, h: 7.4, d: 8, wall: pal.neighbour, facing: 1, seed, lit: 0.03, floorH: 3.0 })
    n.position.set(X1 + TE - 4, 0, (z0 + z1) / 2)
    street.add(n)
  }

  // Lamp B: a tall arm lamp over the road, south-east of the house (keys the upstairs bars).
  const lampB = new THREE.Group()
  lampB.position.set(12.35, 0.12, 1.2)
  street.add(lampB)
  cyl(0.09, 0.12, 0.6, pal.lampPole, 0, 0.3, 0, lampB, 14)
  cyl(0.06, 0.09, 7.4, pal.lampPole, 0, 3.8, 0, lampB, 14)
  const arm = cyl(0.035, 0.035, 1.3, pal.lampPole, -0.6, 7.45, 0, lampB, 10)
  arm.rotation.z = Math.PI / 2 - 0.12
  const headB = rbox(0.55, 0.12, 0.26, pal.lampPole, -1.3, 7.42, 0, lampB, 0.04)
  headB.rotation.z = 0.06
  const bulbB = rbox(0.42, 0.02, 0.18, pal.lampGlass, -1.3, 7.355, 0, lampB, 0.008)
  bulbB.rotation.z = 0.06
  lampB.traverse((o) => (o.castShadow = false))

  return {
    group: g,
    street,
    sewDoor,
    toiletDoor,
    boysDoor,
    blind,
    frontGlass,
    frosted,
    lampBulbs: [bulbB],
    lampA: new THREE.Vector3(12.6, 4.8, 3.3),
    lampB: new THREE.Vector3(12.35 - 1.3, 7.3, 1.2),
  }
}

/** The flight: 16 risers from (−1.3, 0, 0.9) up toward +z to the landing at (−1.3, 3.0, 4.6). */
export const STAIR = { x0: -1.8, x1: -0.8, z0: 0.9, run: (4.59 - 0.9) / 16, rise: UP / 16, n: 16 }

/** Height of the stair surface (top of the tread) under a point z on the flight. */
export function stairY(z: number) {
  if (z < STAIR.z0) return 0
  const i = Math.floor((z - STAIR.z0) / STAIR.run)
  return Math.min(UP, (i + 1) * STAIR.rise)
}

function buildStairs(g: THREE.Group, pal: HousePalette) {
  const { x0, x1, z0, run, rise, n } = STAIR
  const w = x1 - x0
  const xc = (x0 + x1) / 2
  for (let i = 0; i < n; i++) {
    const top = (i + 1) * rise
    const za = z0 + i * run
    // The solid flight (closed underneath: a cupboard under the stairs).
    const body = box(w, top - 0.025, run, pal.trim, xc, (top - 0.025) / 2, za + run / 2, g)
    body.castShadow = true
    body.receiveShadow = true
    // Tread with a nosing over the riser.
    const tread = rbox(w + 0.02, 0.028, run + 0.035, pal.stairWood, xc + 0.01, top - 0.014, za + run / 2 - 0.0175, g, 0.006)
    tread.castShadow = true
    tread.receiveShadow = true
  }
  // Panelled side under the flight (the hallway face).
  const pitch = Math.atan2(UP, n * run)
  const len = Math.hypot(UP, n * run)
  const stringer = rbox(0.05, 0.3, len + 0.1, pal.stairWood, x1 + 0.025, UP / 2 + 0.04, z0 + (n * run) / 2, g, 0.006)
  stringer.rotation.x = -pitch
  // Handrail, balusters, newel posts.
  const rail = rbox(0.06, 0.05, len + 0.1, pal.rail, x1 - 0.03, UP / 2 + 0.92, z0 + (n * run) / 2, g, 0.012)
  rail.rotation.x = -pitch
  rail.castShadow = true
  for (let i = 0; i < n; i++) {
    const top = (i + 1) * rise
    const zc = z0 + i * run + run / 2
    const railY = UP / 2 + 0.92 + (zc - (z0 + (n * run) / 2)) * Math.tan(pitch)
    const b = box(0.032, railY - top, 0.032, pal.rail, x1 - 0.03, (railY + top) / 2, zc, g)
    b.castShadow = true
  }
  const newel = rbox(0.1, 1.15, 0.1, pal.rail, x1 - 0.03, 0.575, z0, g, 0.008)
  newel.castShadow = true
  cyl(0.045, 0.06, 0.08, pal.rail, x1 - 0.03, 1.19, z0, g, 16)
  // Upstairs: the guard along the stairwell (x −0.8, z 0.9 … 4.6).
  const gy = UP + 0.92
  rbox(0.06, 0.05, 3.75, pal.rail, x1 - 0.03, gy, (0.9 + 4.6) / 2, g, 0.012).castShadow = true
  rbox(0.05, 0.05, 3.75, pal.rail, x1 - 0.03, UP + 0.04, (0.9 + 4.6) / 2, g, 0.006)
  for (let z = 1.0; z < 4.55; z += 0.13) box(0.03, 0.86, 0.03, pal.rail, x1 - 0.03, UP + 0.47, z, g).castShadow = true
  for (const z of [0.95, 4.6]) {
    rbox(0.1, 1.1, 0.1, pal.rail, x1 - 0.03, UP + 0.55, z, g, 0.008).castShadow = true
    cyl(0.045, 0.06, 0.08, pal.rail, x1 - 0.03, UP + 1.14, z, g, 16)
  }
}
