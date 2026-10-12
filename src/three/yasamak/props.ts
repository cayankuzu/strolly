/**
 * Small things that matter in YAŞAMAK: coins, the wallet (and, if he offers
 * everything, his banknotes and cards), Emre's lighter, Dede's cap, the baby
 * carriage, the mother's knitting, Baba's reading glasses, coats draped on
 * chair backs, the gamepads, a tea cup.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { cyl, mesh } from '../util'
import { rbox, std, tube } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { SCARF_RED } from './cast'

const PI = Math.PI

export function propMaterials() {
  return {
    brass: pbr('metal', 0xc9b27a, { roughness: 0.35 }),
    silver: pbr('metal', 0xb8bcc0, { roughness: 0.3 }),
    leather: pbr('leather', 0x4a2e1c),
    chrome: pbr('metal', 0xc8ccd0, { roughness: 0.22 }),
    wool: pbr('fabric', 0x6f6a62),
    navy: pbr('fabric', 0x1e2a44),
    white: pbr('fabric', 0xf1eee6),
    tyre: std(0x161616, 0.85),
    knit: pbr('knit', SCARF_RED, { scale: 0.5 }),
    needle: pbr('metal', 0xc0c4c8, { roughness: 0.3 }),
    flame: new THREE.MeshBasicMaterial({
      color: 0xffb35a,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    glassFrame: std(0x2a221c, 0.4),
    notes: [0x6f9a5a, 0xd98a3a, 0x4a7ab0, 0xc0607a, 0x8a6aa8].map((c) => pbr('paper', c)),
    cards: [0x2a4a8a, 0xb8b8b8, 0x8a1f2a].map((c) => pbr('plastic', c, { roughness: 0.35 })),
  }
}
export type PropMats = ReturnType<typeof propMaterials>

/** A 50-kuruş coin (or a smaller coin with `r`). Lies flat, origin at its bottom face. */
export function coin(m: PropMats, r = 0.0121) {
  const g = new THREE.Group()
  cyl(r, r, 0.0019, m.silver, 0, 0.00095, 0, g, 24)
  cyl(r * 0.7, r * 0.7, 0.0021, m.brass, 0, 0.00105, 0, g, 20)
  return g
}

export function wallet(m: PropMats) {
  const g = new THREE.Group()
  rbox(0.112, 0.017, 0.092, m.leather, 0, 0.0085, 0, g, 0.006)
  rbox(0.108, 0.003, 0.004, std(0x2a1a10, 0.8), 0, 0.017, 0.044, g, 0.001)
  g.traverse((c) => (c.castShadow = true))
  return g
}

/** Everything he has: banknotes and cards, each a separate piece (spread or piled by the director). */
export function money(m: PropMats) {
  const pieces: THREE.Mesh[] = []
  const g = new THREE.Group()
  m.notes.forEach((mat) => pieces.push(rbox(0.14, 0.0012, 0.068, mat, 0, 0, 0, g, 0.0005)))
  m.cards.forEach((mat) => pieces.push(rbox(0.0856, 0.0016, 0.054, mat, 0, 0, 0, g, 0.003)))
  pieces.forEach((p) => (p.castShadow = true))
  return { group: g, pieces }
}

/** A flip lighter; `lid` opens about its hinge (rotation.z). Origin at the base. */
export function lighter(m: PropMats) {
  const g = new THREE.Group()
  rbox(0.038, 0.038, 0.013, m.chrome, 0, 0.019, 0, g, 0.004)
  const chimney = rbox(0.03, 0.014, 0.011, m.chrome, 0, 0.045, 0, g, 0.002)
  chimney.castShadow = true
  const lid = new THREE.Group()
  lid.position.set(0.019, 0.038, 0)
  g.add(lid)
  rbox(0.038, 0.018, 0.013, m.chrome, -0.019, 0.009, 0, lid, 0.004)
  const flame = mesh(new THREE.ConeGeometry(0.006, 0.03, 10), m.flame, 0, 0.068, 0, g)
  flame.visible = false
  g.traverse((c) => (c.castShadow = c !== flame))
  return { group: g, lid, flame }
}

/** Dede's grey flat cap, lying on the desk. */
export function flatCap() {
  const mat = pbr('fabric', 0x6c6a66)
  const g = new THREE.Group()
  const crown = mesh(new THREE.SphereGeometry(0.1, 24, 12, 0, PI * 2, 0, PI / 2), mat, 0, 0.0, 0, g)
  crown.scale.set(1, 0.32, 1.12)
  const brim = mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.008, 20, 1, false, -PI / 2.4, PI / 1.2), mat, 0, 0.004, 0.075, g)
  brim.scale.set(1.2, 1, 0.7)
  rbox(0.06, 0.004, 0.02, std(0xd9cfb8, 0.8), 0, 0.034, -0.02, g, 0.001).visible = false
  g.traverse((c) => (c.castShadow = true))
  return { group: g, material: mat }
}

/** The baby carriage, pushed from its handle (handle toward −z of the group, front toward +z). */
export function carriage(m: PropMats) {
  const g = new THREE.Group()
  const body = rbox(0.42, 0.3, 0.72, m.navy, 0, 0.62, 0, g, 0.09)
  body.castShadow = true
  const hood = mesh(new THREE.SphereGeometry(0.23, 20, 12, 0, PI, 0, PI / 2), m.navy, 0, 0.75, -0.2, g)
  hood.rotation.set(0, PI / 2, 0)
  hood.scale.set(1.0, 0.9, 0.95)
  // The baby, a white bundle.
  const bundle = mesh(new THREE.SphereGeometry(0.11, 16, 12), m.white, 0, 0.78, 0.05, g)
  bundle.scale.set(1, 0.6, 1.5)
  mesh(new THREE.SphereGeometry(0.05, 14, 10), std(0xe2b49a, 0.6), 0, 0.8, -0.12, g)
  // Chassis, wheels, handle.
  for (const sx of [-1, 1]) {
    tube(
      [
        [sx * 0.17, 0.48, -0.3],
        [sx * 0.2, 0.25, -0.25],
        [sx * 0.2, 0.14, -0.28],
      ],
      0.009,
      m.chrome,
      g,
      10,
    )
    tube(
      [
        [sx * 0.17, 0.48, 0.3],
        [sx * 0.2, 0.25, 0.25],
        [sx * 0.2, 0.12, 0.28],
      ],
      0.009,
      m.chrome,
      g,
      10,
    )
    for (const z of [-0.28, 0.28]) {
      const w = mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 20), m.tyre, sx * 0.22, 0.12, z, g)
      w.rotation.y = PI / 2
      cyl(0.02, 0.02, 0.03, m.chrome, sx * 0.22, 0.12, z, g, 10).rotation.z = PI / 2
    }
    tube(
      [
        [sx * 0.16, 0.7, -0.33],
        [sx * 0.17, 0.9, -0.5],
        [sx * 0.17, 1.02, -0.58],
      ],
      0.01,
      m.chrome,
      g,
      10,
    )
  }
  cyl(0.016, 0.016, 0.38, m.tyre, 0, 1.02, -0.58, g, 10).rotation.z = PI / 2
  g.traverse((c) => (c.castShadow = true))
  return g
}

/**
 * The unfinished scarf on its needles: a knitted strip hanging from the needles
 * (origin at the needles' middle, the strip falling along −y). `length` sets how far it has grown.
 */
export function knitting(m: PropMats) {
  const g = new THREE.Group()
  const strip = rbox(0.17, 1, 0.012, m.knit, 0, -0.5, 0, g, 0.005)
  for (const dx of [-0.006, 0.006]) {
    const n = cyl(0.0022, 0.0022, 0.3, m.needle, 0, 0, dx, g, 6)
    n.rotation.z = PI / 2 + dx * 30
    cyl(0.005, 0.005, 0.006, m.needle, (dx > 0 ? 1 : -1) * 0.15, (dx > 0 ? 1 : -1) * 0.025, dx, g, 8).rotation.z = PI / 2
  }
  const ball = mesh(new THREE.SphereGeometry(0.045, 16, 12), m.knit, 0, 0, 0)
  g.traverse((c) => (c.castShadow = true))
  return {
    group: g,
    ball,
    set(length: number) {
      strip.scale.y = Math.max(0.02, length)
      strip.position.y = -length / 2
    },
  }
}

/** Reading glasses (folded with scale.x). */
export function readingGlasses(m: PropMats) {
  const g = new THREE.Group()
  for (const sx of [-1, 1]) mesh(new THREE.TorusGeometry(0.022, 0.0025, 8, 24), m.glassFrame, sx * 0.032, 0, 0, g)
  rbox(0.018, 0.003, 0.003, m.glassFrame, 0, 0.005, 0, g, 0.001)
  for (const sx of [-1, 1]) rbox(0.003, 0.003, 0.11, m.glassFrame, sx * 0.055, 0.004, -0.055, g, 0.001)
  return g
}

/** A coat draped over a chair back (in the chair's frame: the back is at −z). */
export function drapedCoat(mat: THREE.Material) {
  const g = new THREE.Group()
  const back = rbox(0.48, 0.56, 0.05, mat, 0, 0.79, -0.32, g, 0.02)
  back.rotation.x = -0.12
  const front = rbox(0.46, 0.36, 0.05, mat, 0, 0.9, -0.22, g, 0.02)
  front.rotation.x = -0.15
  const collar = rbox(0.42, 0.06, 0.12, mat, 0, 1.1, -0.27, g, 0.025)
  collar.rotation.x = -0.1
  for (const sx of [-1, 1]) {
    const sleeve = rbox(0.09, 0.42, 0.07, mat, sx * 0.24, 0.72, -0.31, g, 0.03)
    sleeve.rotation.z = sx * 0.08
  }
  g.traverse((c) => (c.castShadow = true))
  return g
}

/** A stack of fanned coins, pre-arranged (for the counter). */
export function coinSpread(m: PropMats, n: number, seed: number) {
  const r = mulberry32(seed)
  const g = new THREE.Group()
  const coins: THREE.Group[] = []
  for (let i = 0; i < n; i++) {
    const c = coin(m, i % 3 === 2 ? 0.0105 : 0.0121)
    c.userData.spread = new THREE.Vector3((r() - 0.5) * 0.14, 0, (r() - 0.5) * 0.08)
    c.rotation.y = r() * PI
    g.add(c)
    coins.push(c)
  }
  return { group: g, coins }
}
