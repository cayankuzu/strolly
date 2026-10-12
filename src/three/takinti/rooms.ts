/**
 * The rest of the house's furniture: the boys' room (two beds, the TV and its
 * two controllers, posters, the empty bed's headphones), the upper hallway's
 * linen cupboard full of tagged rags, the toilet, and the kitchen (stove,
 * sink, fridge, table, the dry mop, the bucket and the rag).
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { rbox, std, tube, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { UP } from './house'

type G = THREE.Group | null

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function shadowAll(g: THREE.Object3D) {
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
}

/** Height of the mattress top above its floor. */
export const MATTRESS = 0.5

/** A procedural iron bed frame (only if the model fails). */
function fallbackBed() {
  const g = new THREE.Group()
  const iron = pbr('metal', 0x5b5a55, { roughness: 0.6 })
  for (const z of [-0.98, 0.98]) {
    const h = z < 0 ? 1.1 : 0.8
    for (const x of [-0.43, 0.43]) cyl(0.015, 0.015, h, iron, x, h / 2, z, g, 8)
    box(0.86, 0.02, 0.02, iron, 0, h - 0.05, z, g)
    for (let i = 0; i < 6; i++) box(0.012, h * 0.5, 0.012, iron, -0.3 + i * 0.12, h * 0.55, z, g)
  }
  for (const x of [-0.43, 0.43]) box(0.03, 0.04, 1.96, iron, x, 0.32, 0, g)
  return g
}

export type BoysRoom = {
  group: THREE.Group
  /** The boy's duvet: fold 0 covers the bed, 1 is thrown back to the foot; `under` 0…1 his body under it. */
  setDuvet(fold: number, under?: number): void
  dusty: THREE.Mesh
  dust: THREE.MeshStandardMaterial
  clean: THREE.Mesh
  headphones: THREE.Group
  /** The controller he picks up (its own group, to put in his hand). */
  pad: THREE.Group
  padHome: THREE.Vector3
}

/** A game controller: a rounded body with two grips, sticks and buttons. */
function controller(body: THREE.Material, detail: THREE.Material) {
  const g = new THREE.Group()
  rbox(0.11, 0.025, 0.055, body, 0, 0.0125, 0, g, 0.012)
  for (const s of [-1, 1]) {
    const grip = cyl(0.02, 0.016, 0.05, body, s * 0.045, 0.012, 0.03, g, 12)
    grip.rotation.x = Math.PI / 2 - 0.3
    cyl(0.007, 0.007, 0.008, detail, s * 0.022, 0.028, 0.008, g, 10)
  }
  for (const [x, z] of [
    [0.035, -0.01],
    [0.045, 0.0],
    [0.035, 0.01],
    [0.025, 0.0],
  ])
    cyl(0.004, 0.004, 0.005, detail, x, 0.026, z, g, 8)
  return g
}

/**
 * The boy's duvet as one cloth mesh: it lies on the mattress (x 2.33 … 4.25,
 * the bed against the north wall), hangs over the room-side edge, tucks
 * against the wall, swells over the legs (and the body) of whoever is under
 * it, and folds back from the head end with a rounded roll.
 */
function draped(mat: THREE.Material, top: number) {
  const NX = 40
  const NZ = 18
  const X0 = 2.33
  const L = 1.92
  const ZC = -3.9
  const geo = new THREE.PlaneGeometry(1, 1, NX, NZ)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.frustumCulled = false
  const rand = mulberry32(12)
  const lump = Array.from({ length: (NX + 1) * (NZ + 1) }, () => (rand() - 0.5) * 0.012)
  // Across: t −1 (wall, north) … 1 (room, south). The sheet is 1.36 wide: 0.84 on top.
  // A rounded roll over each mattress edge (radius R), then a hanging drop.
  const R = 0.07
  const across = (t: number, a: number) => {
    const w = t * 0.68
    const side = Math.sign(w)
    const o = Math.abs(w) - (0.42 - R)
    if (o <= 0) return { z: ZC + w, dy: 0 }
    // Wall side: tucked, short; room side: a longer, wavering drop.
    const reach = side < 0 ? 0.04 : 0.06 + 0.025 * Math.sin(a * 9) + 0.015 * Math.sin(a * 23)
    const arc = (Math.PI / 2) * R
    if (o < arc) {
      const th = o / R
      return { z: ZC + side * (0.42 - R + Math.sin(th) * R), dy: -(1 - Math.cos(th)) * R }
    }
    const d = o - arc
    const drop = Math.min(d, side < 0 ? 0.12 : 0.34)
    return { z: ZC + side * (0.42 + Math.min(reach, d * 0.25)), dy: -R - drop }
  }
  const set = (fold: number, under: number) => {
    const af = L * (1 - 0.62 * fold)
    const r = 0.04
    for (let j = 0; j <= NZ; j++)
      for (let i = 0; i <= NX; i++) {
        const k = j * (NX + 1) + i
        const a = (i / NX) * L
        const t = (j / NZ) * 2 - 1
        const { z, dy } = across(t, a)
        // The swell over the legs (always, while under) and the chest (lying).
        const zb = Math.exp(-Math.pow((z - ZC - 0.02) / 0.2, 2))
        const legs = Math.min(1, under * 2) * 0.1 * zb * smooth(0.02, 0.25, a) * (1 - smooth(1.0, 1.3, a))
        const chest = Math.max(0, under * 2 - 1) * 0.15 * zb * smooth(0.9, 1.1, a) * (1 - smooth(1.55, 1.75, a))
        const h = top + 0.03 + Math.max(dy, -0.36) + (dy === 0 ? legs + chest : (legs + chest) * 0.5) + lump[k]
        let x: number
        let y: number
        let zz = z
        if (a <= af) {
          x = X0 + a
          y = h
        } else {
          // Rolled back over itself at the fold, then lying on top.
          const d = a - af
          const th = Math.min(d / r, Math.PI)
          const base = top + 0.03 + Math.max(dy, -0.36) * 0.25 + lump[k]
          if (d < Math.PI * r) {
            x = X0 + af + Math.sin(th) * r
            y = base + r * (1 - Math.cos(th))
          } else {
            x = X0 + af - (d - Math.PI * r)
            y = base + 2 * r + 0.012
          }
          zz = ZC + (z - ZC) * 0.92
        }
        pos.setXYZ(k, x, y, zz)
      }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  }
  return { mesh, set }
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function boysRoom(models: { bed: G; chair: G }): BoysRoom {
  const g = new THREE.Group()
  const y0 = UP
  const sheet = pbr('fabric', 0xd5d2c8, { roughness: 1 })
  const ticking = pbr('fabric', 0xb9b4a6, { roughness: 1 })
  const duvetBoy = pbr('fabric', 0x56677a, { roughness: 1, scale: 1.3 })
  const duvetBro = pbr('knit', 0x4a1c22, { roughness: 1 })
  const pillowMat = pbr('fabric', 0xdcd8ce, { roughness: 1 })
  // Two beds along the north and south walls, headboards east.
  const beds: Array<[number, number]> = [
    [3.3, -3.9],
    [3.3, -0.9],
  ]
  for (const [x, z] of beds) {
    const frame = models.bed ? models.bed.clone(true) : fallbackBed()
    frame.rotation.y = -Math.PI / 2
    frame.position.set(x, y0, z)
    g.add(frame)
    const mat = rbox(1.88, 0.16, 0.84, ticking, x - 0.02, y0 + MATTRESS - 0.08, z, g, 0.04)
    mat.castShadow = true
    rbox(1.9, 0.02, 0.86, sheet, x - 0.02, y0 + MATTRESS - 0.005, z, g, 0.01)
    const pillow = rbox(0.42, 0.12, 0.62, pillowMat, x + 0.7, y0 + MATTRESS + 0.05, z, g, 0.05)
    pillow.scale.set(1, 0.9, 1)
  }
  // The boy's duvet (north bed): one draped sheet over the mattress and his
  // legs, its head end folding back toward the foot as he gets up.
  const duvet = draped(duvetBoy, y0 + MATTRESS)
  g.add(duvet.mesh)
  const setDuvet = (fold: number, under = 0) => duvet.set(fold, under)
  setDuvet(0)
  // The brother's duvet: pushed to the foot, crumpled — one soft wrinkled mound, a corner hanging off the foot.
  const heap = new THREE.Group()
  heap.position.set(2.68, y0 + MATTRESS + 0.02, -0.92)
  g.add(heap)
  const mound = new THREE.SphereGeometry(1, 48, 24)
  const mp = mound.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < mp.count; i++) {
    let x = mp.getX(i)
    let y = mp.getY(i)
    let z = mp.getZ(i)
    // Wrinkles: crossing ridges, stronger on the top.
    const w = 0.22 * Math.sin(x * 5 + z * 3) * Math.sin(z * 4 - x * 2) + 0.12 * Math.sin(x * 11 + y * 4 + z * 9) + 0.18 * Math.max(0, Math.sin(z * 2.2 + 0.7))
    const k = 1 + w * (0.3 + 0.7 * Math.max(0, y))
    x *= 1 + w * 0.25
    z *= 1 + w * 0.25
    y = Math.max(-0.1, y * k)
    mp.setXYZ(i, x * 0.36, y * 0.2 + 0.03, z * 0.48)
  }
  mound.computeVertexNormals()
  mesh(mound, duvetBro, 0, 0, 0, heap)
  const corner = new THREE.PlaneGeometry(0.42, 0.36, 8, 8)
  const cp2 = corner.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < cp2.count; i++) cp2.setZ(i, 0.025 * Math.sin(cp2.getX(i) * 22) * (0.5 - cp2.getY(i)))
  corner.computeVertexNormals()
  const hang = mesh(corner, duvetBro, -0.36, -0.14, 0.08, heap)
  hang.rotation.set(0, -Math.PI / 2, 0.08)
  ;(duvetBro as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  shadowAll(heap)
  // Headphones on the empty pillow, the cable tangled across it.
  const headphones = new THREE.Group()
  headphones.position.set(3.95, y0 + MATTRESS + 0.115, -0.95)
  g.add(headphones)
  const hpMat = std(0x111214, 0.45)
  const pad = std(0x1d1d1f, 0.9)
  const band = mesh(new THREE.TorusGeometry(0.085, 0.009, 8, 24, Math.PI), hpMat, 0, 0.0, 0, headphones)
  band.rotation.set(-Math.PI / 2, 0, 0.2)
  for (const s of [-1, 1]) {
    const cup = cyl(0.045, 0.045, 0.035, pad, s * 0.085, 0.015, 0.0, headphones, 20)
    cup.rotation.z = Math.PI / 2 + s * 0.5
  }
  tube(
    [
      [0.08, 0.0, 0.02],
      [0.16, -0.02, 0.1],
      [0.05, -0.02, 0.18],
      [-0.12, -0.03, 0.12],
      [-0.05, -0.04, 0.25],
      [0.12, -0.05, 0.3],
      [0.06, -0.06, 0.45],
    ],
    0.0025,
    hpMat,
    headphones,
    48,
  )
  shadowAll(headphones)
  // Two dark posters above the empty bed (south wall, facing north).
  const posters: Array<[number, (c: CanvasRenderingContext2D, w: number, h: number) => void]> = [
    [
      2.75,
      (c, w, h) => {
        const gr = c.createLinearGradient(0, 0, 0, h)
        gr.addColorStop(0, '#191c22')
        gr.addColorStop(1, '#0a0b0e')
        c.fillStyle = gr
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#8d2f26'
        c.beginPath()
        c.arc(w / 2, h * 0.38, w * 0.26, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = '#0a0b0e'
        c.fillRect(w * 0.18, h * 0.42, w * 0.64, h * 0.06)
        c.fillStyle = '#c9c3b5'
        c.font = `700 ${w * 0.13}px sans-serif`
        c.textAlign = 'center'
        c.fillText('KARANLIK', w / 2, h * 0.82)
      },
    ],
    [
      3.85,
      (c, w, h) => {
        c.fillStyle = '#12161a'
        c.fillRect(0, 0, w, h)
        c.strokeStyle = '#3b5560'
        c.lineWidth = 4
        for (let i = 0; i < 9; i++) {
          c.beginPath()
          c.moveTo(0, h * 0.75 - i * 6)
          for (let x = 0; x <= w; x += 20) c.lineTo(x, h * 0.75 - i * 6 - Math.abs(Math.sin(x * 0.02 + i)) * 40)
          c.stroke()
        }
        c.fillStyle = '#a7b3b5'
        c.font = `600 ${w * 0.09}px monospace`
        c.fillText('LEVEL 7', w * 0.1, h * 0.15)
      },
    ],
  ]
  for (const [x, draw] of posters) {
    const p = mesh(new THREE.PlaneGeometry(0.48, 0.66), new THREE.MeshStandardMaterial({ map: canvasTex(256, 352, draw), roughness: 0.7 }), x, y0 + 1.5, -0.405, g)
    p.rotation.y = Math.PI
  }
  // The TV cabinet on the west wall, the CRT, the console, two controllers.
  const cab = pbr('wood', 0x5a4232, { roughness: 0.6 })
  const cabinet = rbox(0.45, 0.5, 1.2, cab, 1.15, y0 + 0.25, -3.3, g, 0.01)
  cabinet.castShadow = true
  rbox(0.01, 0.38, 0.55, cab, 1.38, y0 + 0.24, -3.6, g, 0.004)
  rbox(0.01, 0.38, 0.55, cab, 1.38, y0 + 0.24, -3.0, g, 0.004)
  const tvBody = std(0x2b2b2a, 0.55)
  const tv = new THREE.Group()
  tv.position.set(1.12, y0 + 0.5, -3.55)
  g.add(tv)
  rbox(0.36, 0.36, 0.44, tvBody, 0.0, 0.18, 0, tv, 0.03)
  rbox(0.22, 0.26, 0.3, tvBody, -0.18, 0.17, 0, tv, 0.04)
  const screen = mesh(new THREE.PlaneGeometry(0.34, 0.27), new THREE.MeshStandardMaterial({ color: 0x0e1111, roughness: 0.12, metalness: 0.2, envMapIntensity: 1.5 }), 0.181, 0.19, 0, tv)
  screen.rotation.y = Math.PI / 2
  shadowAll(tv)
  const consoleBox = rbox(0.22, 0.06, 0.26, std(0x1b1c1e, 0.5), 1.12, y0 + 0.53, -3.2, g, 0.01)
  consoleBox.castShadow = true
  cyl(0.004, 0.004, 0.003, new THREE.MeshBasicMaterial({ color: 0x3a6a3a }), 1.235, y0 + 0.53, -3.11, g, 8).rotation.z = Math.PI / 2
  const cleanMat = std(0x1c1d20, 0.5)
  const detail = std(0x0d0d0e, 0.6)
  const clean = new THREE.Group()
  clean.add(controller(cleanMat, detail))
  clean.position.set(1.1, y0 + 0.5, -2.99)
  clean.rotation.y = 0.3
  g.add(clean)
  const pad2 = controller(cleanMat, detail)
  const dust = new THREE.MeshStandardMaterial({ color: 0x8b8a84, roughness: 1, transparent: true, opacity: 0.88, depthWrite: false })
  // The dust: a thin grey film over the second controller.
  const film = rbox(0.112, 0.004, 0.057, dust, 0, 0.0265, 0, pad2, 0.003)
  const padG = new THREE.Group()
  padG.add(pad2)
  padG.position.set(1.12, y0 + 0.5, -2.8)
  padG.rotation.y = -0.25
  g.add(padG)
  shadowAll(clean)
  shadowAll(padG)
  film.castShadow = false
  // A faded kilim between the beds.
  const rug = mesh(
    new THREE.PlaneGeometry(1.5, 0.95),
    new THREE.MeshStandardMaterial({
      map: canvasTex(512, 320, (c, w, h) => {
        c.fillStyle = '#6b3a30'
        c.fillRect(0, 0, w, h)
        c.strokeStyle = '#b08a5a'
        c.lineWidth = 10
        c.strokeRect(16, 16, w - 32, h - 32)
        c.fillStyle = '#2f3a44'
        for (let i = 0; i < 5; i++) {
          c.save()
          c.translate(70 + i * 93, h / 2)
          c.rotate(Math.PI / 4)
          c.fillRect(-26, -26, 52, 52)
          c.restore()
        }
        const rand = mulberry32(4)
        for (let i = 0; i < 2000; i++) {
          c.fillStyle = `rgba(0,0,0,${rand() * 0.12})`
          c.fillRect(rand() * w, rand() * h, 3, 2)
        }
      }),
      roughness: 1,
    }),
    3.1,
    y0 + 0.004,
    -2.4,
    g,
  )
  rug.rotation.x = -Math.PI / 2
  rug.receiveShadow = true
  // A chair by the door with clothes thrown over it.
  if (models.chair) {
    const ch = models.chair.clone(true)
    ch.position.set(1.25, y0, -0.75)
    ch.rotation.y = Math.PI / 2
    g.add(ch)
    const clothes = rbox(0.4, 0.06, 0.38, pbr('denim', 0x3b4656, { roughness: 1 }), 1.25, y0 + 0.5, -0.75, g, 0.03)
    clothes.rotation.z = 0.05
    clothes.castShadow = true
  }
  // A ceiling lamp, off.
  const shade = pbr('painted', 0xd9d2bf, { roughness: 0.7 })
  cyl(0.004, 0.004, 0.5, std(0x222222, 0.8), 2.9, y0 + 2.45, -2.4, g, 6)
  turned(
    [
      [0.03, 0],
      [0.16, -0.12],
      [0.17, -0.13],
    ],
    shade,
    24,
    g,
  ).position.set(2.9, y0 + 2.2, -2.4)
  return { group: g, setDuvet, dusty: film, dust, clean: clean.children[0] as THREE.Mesh, headphones, pad: padG, padHome: padG.position.clone() }
}

// ——— Upper hallway: the linen cupboard and a bare bulb ———

export type Cupboard = { group: THREE.Group; door: THREE.Group }

export function linenCupboard(): Cupboard {
  const g = new THREE.Group()
  const y0 = UP
  const wood = pbr('painted', 0xcfc7b4, { roughness: 0.8 })
  const inside = pbr('wood', 0x7a6048, { roughness: 0.8 })
  // Recess x 0.92 … 1.45, z 3.6 … 4.5, up to 2.1.
  box(0.02, 2.1, 0.9, inside, 1.45, y0 + 1.05, 4.05, g)
  box(0.55, 2.1, 0.02, inside, 1.18, y0 + 1.05, 3.6, g)
  box(0.55, 2.1, 0.02, inside, 1.18, y0 + 1.05, 4.5, g)
  box(0.55, 0.02, 0.9, inside, 1.18, y0 + 2.1, 4.05, g)
  const rand = mulberry32(31)
  // Faded, washed-out colours: old clothes, curtains, sheets.
  const colors = [0xa88a80, 0x8e9aa2, 0xb9ae90, 0x8a957e, 0xae98a2, 0x9c8c78, 0xc8bba4, 0x7f8b97, 0xb08470, 0xa6a69a, 0xd2c9b6]
  const mats = colors.map((c, i) => pbr(i % 3 === 0 ? 'knit' : 'fabric', c, { roughness: 1 }))
  const tag = std(0xf6f2e8, 0.9)
  const ink = std(0x3a3530, 0.9)
  for (let s = 0; s < 5; s++) {
    const sy = y0 + 0.08 + s * 0.42
    box(0.53, 0.02, 0.88, inside, 1.18, sy, 4.05, g)
    let z = 3.66
    while (z < 4.42) {
      const w = 0.2 + rand() * 0.08
      if (z + w > 4.46) break
      let y = sy + 0.01
      const n = 2 + Math.floor(rand() * 4)
      for (let k = 0; k < n; k++) {
        const h = 0.04 + rand() * 0.035
        // Soft, pillowy folds: rounded to almost half their height, never squared like books.
        const ww = w * (0.9 + rand() * 0.14)
        const f = rbox(0.36 + rand() * 0.05, h, ww, mats[Math.floor(rand() * mats.length)], 1.18 + (rand() - 0.5) * 0.04, y + h / 2, z + w / 2 + (rand() - 0.5) * 0.025, g, Math.min(0.03, h * 0.46))
        f.rotation.y = (rand() - 0.5) * 0.12
        f.scale.y = 0.92
        f.castShadow = true
        y += h * 0.9
        // A small paper tag sewn to the front corner, a word in pencil.
        if (rand() < 0.75) {
          const t = box(0.002, 0.026, 0.038, tag, 0.975, y - h * 0.45, z + 0.035, g)
          t.rotation.x = (rand() - 0.5) * 0.4
          box(0.001, 0.003, 0.026, ink, 0.973, y - h * 0.45 + 0.004, z + 0.035, g)
          box(0.001, 0.003, 0.018, ink, 0.973, y - h * 0.45 - 0.003, z + 0.031, g)
        }
      }
      z += w + 0.015
    }
  }
  // The door: hinged on the south jamb, ajar into the hall.
  const door = new THREE.Group()
  door.position.set(0.8, y0, 4.5)
  g.add(door)
  rbox(0.03, 2.08, 0.88, wood, -0.015, 1.04, -0.44, door, 0.004)
  rbox(0.008, 0.8, 0.7, wood, -0.034, 1.5, -0.44, door, 0.003)
  rbox(0.008, 0.8, 0.7, wood, -0.034, 0.6, -0.44, door, 0.003)
  cyl(0.012, 0.012, 0.03, pbr('metal', 0x9a8456, { roughness: 0.4 }), -0.05, 1.05, -0.8, door, 10).rotation.z = Math.PI / 2
  door.rotation.y = -0.7
  shadowAll(door)
  // A bare bulb on a cord, off; a runner down the hall; a framed photograph.
  const glassBulb = new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 0.15, transparent: true, opacity: 0.7 })
  cyl(0.003, 0.003, 0.4, std(0x1e1e1e, 0.8), 0, y0 + 2.5, -1.0, g, 6)
  mesh(new THREE.SphereGeometry(0.035, 16, 12), glassBulb, 0, y0 + 2.27, -1.0, g)
  cyl(0.015, 0.015, 0.04, pbr('metal', 0x8a8478, { roughness: 0.5 }), 0, y0 + 2.31, -1.0, g, 10)
  const runner = mesh(
    new THREE.PlaneGeometry(0.75, 7.2),
    new THREE.MeshStandardMaterial({
      map: canvasTex(128, 1024, (c, w, h) => {
        c.fillStyle = '#5a2e2a'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#7b5a3c'
        c.fillRect(6, 0, 6, h)
        c.fillRect(w - 12, 0, 6, h)
        const rand2 = mulberry32(2)
        for (let i = 0; i < 1600; i++) {
          c.fillStyle = `rgba(0,0,0,${rand2() * 0.15})`
          c.fillRect(rand2() * w, rand2() * h, 2, 2)
        }
      }),
      roughness: 1,
    }),
    0,
    y0 + 0.004,
    -0.6,
    g,
  )
  runner.rotation.x = -Math.PI / 2
  runner.receiveShadow = true
  const photo = mesh(
    new THREE.PlaneGeometry(0.3, 0.38),
    new THREE.MeshStandardMaterial({
      map: canvasTex(150, 190, (c, w, h) => {
        c.fillStyle = '#3d3226'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#b8a888'
        c.fillRect(14, 14, w - 28, h - 28)
        c.fillStyle = '#6f6150'
        for (const x of [50, 92]) {
          c.beginPath()
          c.arc(x, 80, 14, 0, Math.PI * 2)
          c.fill()
          c.fillRect(x - 18, 96, 36, 70)
        }
      }),
      roughness: 0.6,
    }),
    -0.735,
    y0 + 1.55,
    -0.4,
    g,
  )
  photo.rotation.y = Math.PI / 2
  return { group: g, door }
}

// ——— Toilet ———

export type Toilet = { group: THREE.Group; drip: THREE.Mesh; switchPlate: THREE.Vector3; sinkEdge: THREE.Vector3 }

export function toilet(): Toilet {
  const g = new THREE.Group()
  const y0 = UP
  const ceramic = pbr('ceramic', 0xe8e6e0, { roughness: 0.18 })
  const chrome = pbr('metal', 0xc8cbce, { roughness: 0.25 })
  // The bowl against the west wall, facing east.
  const bowl = turned(
    [
      [0.0, 0.0],
      [0.13, 0.0],
      [0.12, 0.12],
      [0.17, 0.3],
      [0.19, 0.4],
      [0.165, 0.41],
      [0.14, 0.33],
      [0.05, 0.25],
      [0.0, 0.25],
    ],
    ceramic,
    32,
    g,
  )
  bowl.scale.set(1.15, 1, 0.9)
  bowl.position.set(-2.25, y0, -3.9)
  const seat = mesh(new THREE.TorusGeometry(0.15, 0.025, 8, 28), std(0xdedbd2, 0.4), -2.24, y0 + 0.42, -3.9, g)
  seat.rotation.x = Math.PI / 2
  seat.scale.set(1.2, 1, 1)
  rbox(0.18, 0.4, 0.42, ceramic, -2.5, y0 + 0.62, -3.9, g, 0.03)
  rbox(0.2, 0.03, 0.44, ceramic, -2.5, y0 + 0.835, -3.9, g, 0.01)
  // Sink and a dark mirror on the north wall.
  const sink = turned(
    [
      [0, 0.0],
      [0.05, 0.0],
      [0.2, 0.12],
      [0.22, 0.16],
      [0.2, 0.17],
      [0.05, 0.05],
      [0, 0.05],
    ],
    ceramic,
    32,
    g,
  )
  sink.scale.set(1, 1, 0.75)
  sink.position.set(-1.25, y0 + 0.68, -4.22)
  cyl(0.05, 0.06, 0.68, ceramic, -1.25, y0 + 0.34, -4.33, g, 16)
  const tap = new THREE.Group()
  tap.position.set(-1.25, y0 + 0.86, -4.36)
  g.add(tap)
  cyl(0.012, 0.012, 0.07, chrome, 0, 0.0, 0, tap, 10)
  const spout = cyl(0.009, 0.009, 0.09, chrome, 0, 0.035, 0.045, tap, 10)
  spout.rotation.x = Math.PI / 2
  cyl(0.02, 0.02, 0.012, chrome, 0, 0.04, 0, tap, 10)
  const drip = mesh(new THREE.SphereGeometry(0.004, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc8d6e0, roughness: 0.05, transparent: true, opacity: 0.8 }), -1.25, y0 + 0.86, -4.27, g)
  const mirror = mesh(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x1b2025, roughness: 0.04, metalness: 0.9, envMapIntensity: 1.2 }), -1.25, y0 + 1.45, -4.395, g)
  mirror.receiveShadow = true
  rbox(0.54, 0.64, 0.015, std(0x8c8a84, 0.5), -1.25, y0 + 1.45, -4.405, g, 0.004)
  // The towel rack on the west wall, and the rag on it: striped pajama cloth, densely hemmed.
  cyl(0.008, 0.008, 0.45, chrome, -2.55, y0 + 1.12, -2.6, g, 8).rotation.x = Math.PI / 2
  for (const z of [-2.82, -2.38]) box(0.05, 0.02, 0.02, chrome, -2.575, y0 + 1.12, z, g)
  const stripes = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#c9cfd8'
    c.fillRect(0, 0, w, h)
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = '#3c4f74'
      c.fillRect(x, 0, 10, h)
      c.fillStyle = '#7e8faa'
      c.fillRect(x + 14, 0, 3, h)
    }
    c.strokeStyle = '#2b3550'
    c.setLineDash([3, 3])
    c.lineWidth = 2
    c.strokeRect(6, 6, w - 12, h - 12)
    c.strokeRect(11, 11, w - 22, h - 22)
  })
  const rag = new THREE.PlaneGeometry(0.4, 0.5, 6, 8)
  const rp = rag.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < rp.count; i++) {
    const yy = rp.getY(i)
    // Folded over the bar: the top half hangs behind, the bottom in front.
    rp.setZ(i, yy > 0.2 ? -0.02 * (yy - 0.2) * 10 : 0.012 * Math.sin(rp.getX(i) * 20))
  }
  rag.computeVertexNormals()
  const ragM = mesh(rag, new THREE.MeshStandardMaterial({ map: stripes, roughness: 1, side: THREE.DoubleSide }), -2.535, y0 + 0.9, -2.6, g)
  ragM.rotation.y = Math.PI / 2
  // The light switch by the door.
  rbox(0.012, 0.09, 0.07, std(0xe7e3d8, 0.6), -0.935, y0 + 1.2, -3.42, g, 0.004)
  rbox(0.008, 0.03, 0.02, std(0xd6d1c4, 0.6), -0.945, y0 + 1.2, -3.42, g, 0.003)
  // Paper on its holder.
  const roll = cyl(0.055, 0.055, 0.1, std(0xf0ede6, 1), -2.53, y0 + 0.62, -3.45, g, 16)
  roll.rotation.x = Math.PI / 2
  shadowAll(g)
  return { group: g, drip, switchPlate: new THREE.Vector3(-0.95, y0 + 1.2, -3.42), sinkEdge: new THREE.Vector3(-1.25, y0 + 0.84, -4.05) }
}

// ——— Kitchen ———

export type Kitchen = {
  group: THREE.Group
  bucket: THREE.Group
  water: THREE.MeshStandardMaterial
  rag: THREE.Mesh
  ragMat: THREE.MeshStandardMaterial
}

export function kitchen(models: { table: G; chair: G; pot: G; kettle: G; broom: G; cabinet: G }, ragTexture: THREE.Texture): Kitchen {
  const g = new THREE.Group()
  const enamel = pbr('ceramic', 0xece8dc, { roughness: 0.3 })
  const chrome = pbr('metal', 0xc5c8cb, { roughness: 0.3 })
  const counterTop = pbr('laminate', 0xd8d0bd, { roughness: 0.6 })
  const cabinetMat = pbr('painted', 0xb9c4b1, { roughness: 0.7 })
  const iron = pbr('metal', 0x2a2a2a, { roughness: 0.6 })
  // Counter along the north wall, x −2.5 … 1.4, with the sink under the window.
  rbox(3.9, 0.04, 0.62, counterTop, -0.55, 0.9, -10.69, g, 0.006)
  rbox(3.86, 0.86, 0.56, cabinetMat, -0.55, 0.43, -10.72, g, 0.006)
  for (let i = 0; i < 6; i++) {
    const x = -2.3 + i * 0.62
    rbox(0.58, 0.7, 0.02, cabinetMat, x, 0.45, -10.43, g, 0.004)
    rbox(0.1, 0.015, 0.02, chrome, x, 0.72, -10.41, g, 0.004)
  }
  // Tiles behind the counter.
  box(3.9, 0.6, 0.006, (() => {
    const m = pbr('tile', 0xe9e6dc, { roughness: 0.3 })
    return m
  })(), -0.55, 1.22, -10.995, g)
  // The sink: a recessed basin and a tap.
  rbox(0.6, 0.02, 0.46, chrome, 0, 0.915, -10.69, g, 0.004)
  box(0.52, 0.16, 0.38, std(0x8d9196, 0.35), 0, 0.84, -10.69, g)
  const tap = cyl(0.014, 0.014, 0.28, chrome, 0, 1.06, -10.92, g, 10)
  tap.castShadow = true
  const spout = cyl(0.011, 0.011, 0.2, chrome, 0, 1.19, -10.83, g, 10)
  spout.rotation.x = Math.PI / 2
  // A café curtain on the window's lower half.
  const curtain = mesh(new THREE.PlaneGeometry(1.36, 0.45, 20, 2), new THREE.MeshStandardMaterial({ color: 0xe9e2cf, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), 0, 1.27, -10.93, g)
  const cp = curtain.geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.015 * Math.sin(cp.getX(i) * 30))
  curtain.geometry.computeVertexNormals()
  cyl(0.006, 0.006, 1.42, chrome, 0, 1.5, -10.93, g, 6).rotation.z = Math.PI / 2
  // The stove on the west wall: white enamel, four burners, oven door. Cold.
  const stove = new THREE.Group()
  stove.position.set(-2.18, 0, -9.95)
  g.add(stove)
  rbox(0.6, 0.86, 0.6, enamel, 0, 0.43, 0, stove, 0.02)
  rbox(0.62, 0.025, 0.62, enamel, 0, 0.87, 0, stove, 0.008)
  for (const [x, z] of [
    [-0.13, -0.14],
    [-0.13, 0.14],
    [0.13, -0.14],
    [0.13, 0.14],
  ]) {
    cyl(0.07, 0.075, 0.012, iron, x, 0.888, z, stove, 20)
    for (let k = 0; k < 4; k++) box(0.15, 0.012, 0.012, iron, x, 0.9, z, stove).rotation.y = (k * Math.PI) / 4
  }
  rbox(0.02, 0.4, 0.5, std(0x1a1a1a, 0.15), 0.3, 0.42, 0, stove, 0.01)
  rbox(0.03, 0.025, 0.4, chrome, 0.33, 0.68, 0, stove, 0.008)
  for (let k = 0; k < 4; k++) cyl(0.018, 0.018, 0.02, std(0x222222, 0.5), 0.31, 0.79, -0.18 + k * 0.12, stove, 12).rotation.z = Math.PI / 2
  // On the stove: the enamel pot and an empty copper cezve.
  if (models.pot) {
    const pot = models.pot.clone(true)
    pot.position.set(-2.31, 0.895, -10.09)
    pot.rotation.y = 0.4
    g.add(pot)
  }
  const copper = pbr('metal', 0xb06a3c, { roughness: 0.35 })
  const cezve = turned(
    [
      [0, 0],
      [0.04, 0],
      [0.045, 0.03],
      [0.035, 0.07],
      [0.04, 0.085],
      [0.042, 0.088],
    ],
    copper,
    24,
    g,
  )
  cezve.position.set(-2.05, 0.895, -9.83)
  const handle = cyl(0.006, 0.005, 0.18, copper, -1.97, 0.97, -9.83, g, 8)
  handle.rotation.z = Math.PI / 2 - 0.35
  // The kettle on the counter by the stove.
  if (models.kettle) {
    const k = models.kettle.clone(true)
    k.position.set(-1.95, 0.92, -10.72)
    k.rotation.y = 0.6
    g.add(k)
  }
  // The fridge on the east wall: an old rounded one, humming.
  const fridge = new THREE.Group()
  fridge.position.set(2.12, 0, -10.45)
  g.add(fridge)
  rbox(0.66, 1.52, 0.66, enamel, 0, 0.76, 0, fridge, 0.08)
  box(0.006, 1.2, 0.6, std(0xd9d5c8, 0.5), -0.335, 0.85, 0, fridge)
  rbox(0.04, 0.3, 0.04, chrome, -0.36, 1.05, 0.22, fridge, 0.015)
  // The table and two chairs.
  if (models.table) {
    const t = models.table.clone(true)
    t.scale.set(0.58, 0.8, 0.72)
    t.position.set(1.2, 0, -8.55)
    g.add(t)
  } else {
    const t = new THREE.Group()
    rbox(1.4, 0.04, 0.8, pbr('wood', 0x8a6a4a), 0, 0.75, 0, t, 0.008)
    for (const x of [-0.62, 0.62]) for (const z of [-0.33, 0.33]) box(0.05, 0.73, 0.05, pbr('wood', 0x7a5a3a), x, 0.365, z, t)
    t.position.set(1.2, 0, -8.55)
    g.add(t)
  }
  if (models.chair) {
    const c1 = models.chair.clone(true)
    c1.position.set(0.9, 0, -7.9)
    c1.rotation.y = Math.PI
    g.add(c1)
    const c2 = models.chair.clone(true)
    c2.position.set(1.65, 0, -9.2)
    c2.rotation.y = 0.15
    g.add(c2)
  }
  // A sideboard on the east wall with jars.
  if (models.cabinet) {
    const s = models.cabinet.clone(true)
    s.position.set(2.18, 0, -8.4)
    s.rotation.y = -Math.PI / 2
    s.scale.setScalar(0.85)
    g.add(s)
    const glassJar = new THREE.MeshStandardMaterial({ color: 0xcfd8d0, roughness: 0.1, transparent: true, opacity: 0.45 })
    for (let i = 0; i < 3; i++) cyl(0.05, 0.05, 0.16 + i * 0.03, glassJar, 2.18, 1.0 + 0.08 + i * 0.015, -8.7 + i * 0.16, g, 16)
  }
  // The mop, dry and grey, against the east wall; the broom beside it.
  const mop = new THREE.Group()
  mop.position.set(2.32, 0, -9.65)
  mop.rotation.z = 0.12
  g.add(mop)
  cyl(0.012, 0.012, 1.35, pbr('wood', 0xb59b74, { roughness: 0.7 }), 0, 0.72, 0, mop, 8)
  const strands = std(0x9d9a92, 1)
  const rand = mulberry32(12)
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const r = 0.03 + rand() * 0.07
    const s = cyl(0.008, 0.006, 0.28, strands, Math.cos(a) * r, 0.14, Math.sin(a) * r, mop, 5)
    s.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4)
  }
  cyl(0.04, 0.04, 0.06, iron, 0, 0.29, 0, mop, 10)
  if (models.broom) {
    const b = models.broom.clone(true)
    b.position.set(2.43, 0, -9.25)
    b.rotation.y = Math.PI / 2
    g.add(b)
  }
  // A calendar on the wall.
  const cal = mesh(
    new THREE.PlaneGeometry(0.3, 0.45),
    new THREE.MeshStandardMaterial({
      map: canvasTex(150, 225, (c, w, h) => {
        c.fillStyle = '#f2efe6'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#7d8c6a'
        c.fillRect(0, 0, w, 80)
        c.fillStyle = '#3a3a36'
        c.font = '600 16px sans-serif'
        c.fillText('EKİM', 10, 100)
        for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) c.fillRect(10 + k * 19, 115 + r * 20, 10, 2)
      }),
      roughness: 0.9,
    }),
    -2.495,
    1.6,
    -8.6,
    g,
  )
  cal.rotation.y = Math.PI / 2
  // The bucket: galvanised, the water faintly pink.
  const bucket = new THREE.Group()
  bucket.position.set(-1.1, 0, -9.1)
  g.add(bucket)
  const zinc = pbr('metal', 0x9aa0a3, { roughness: 0.45 })
  turned(
    [
      [0, 0],
      [0.12, 0],
      [0.125, 0.01],
      [0.15, 0.28],
      [0.153, 0.285],
      [0.146, 0.285],
      [0.12, 0.012],
      [0, 0.012],
    ],
    zinc,
    32,
    bucket,
  )
  const water = new THREE.MeshStandardMaterial({ color: 0xc9a3a0, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.88, envMapIntensity: 1.3 })
  const surf = mesh(new THREE.CircleGeometry(0.142, 28), water, 0, 0.2, 0, bucket)
  surf.rotation.x = -Math.PI / 2
  const bail = mesh(new THREE.TorusGeometry(0.15, 0.004, 6, 24, Math.PI), zinc, 0, 0.28, 0, bucket)
  bail.rotation.y = 0.5
  // The rag: large, pale, its edges hemmed, a long darker seam across it.
  const ragMat = new THREE.MeshStandardMaterial({ map: ragTexture, roughness: 0.95, side: THREE.DoubleSide })
  const ragGeo = new THREE.PlaneGeometry(0.55, 0.45, 16, 12)
  ragGeo.rotateX(-Math.PI / 2)
  const rag = mesh(ragGeo, ragMat, -0.5, 0.006, -9.85, g)
  shadowAll(g)
  curtain.castShadow = false
  surf.castShadow = false
  rag.castShadow = false
  return { group: g, bucket, water, rag, ragMat }
}

/** The rag's cloth: pale, hemmed all round, a long darker seam across. */
export function ragTexture() {
  return canvasTex(512, 420, (c, w, h) => {
    const rand = mulberry32(44)
    c.fillStyle = '#e2cfbf'
    c.fillRect(0, 0, w, h)
    for (let i = 0; i < 180; i++) {
      c.fillStyle = `rgba(${150 + rand() * 40},${110 + rand() * 30},${100 + rand() * 30},${0.04 + rand() * 0.06})`
      c.beginPath()
      c.arc(rand() * w, rand() * h, 5 + rand() * 26, 0, Math.PI * 2)
      c.fill()
    }
    // Hem: a folded edge and tight stitches.
    c.strokeStyle = 'rgba(140,100,86,0.8)'
    c.lineWidth = 3
    c.strokeRect(10, 10, w - 20, h - 20)
    c.setLineDash([4, 3])
    c.lineWidth = 2
    c.strokeRect(18, 18, w - 36, h - 36)
    // The seam.
    c.setLineDash([])
    c.strokeStyle = '#8f6151'
    c.lineWidth = 6
    c.beginPath()
    c.moveTo(30, h * 0.35)
    c.bezierCurveTo(w * 0.35, h * 0.42, w * 0.6, h * 0.3, w - 30, h * 0.48)
    c.stroke()
    c.setLineDash([3, 4])
    c.lineWidth = 2
    c.strokeStyle = '#6d4436'
    c.beginPath()
    c.moveTo(30, h * 0.35 + 7)
    c.bezierCurveTo(w * 0.35, h * 0.42 + 7, w * 0.6, h * 0.3 + 7, w - 30, h * 0.48 + 7)
    c.stroke()
  })
}
