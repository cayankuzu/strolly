/**
 * What stands in the room: twelve double desks with full-height front panels
 * and solid sides (they hide everything below the desktops — the twist
 * depends on them), the chairs, what lies on the desks, the bags, the
 * teacher's desk, the bin corner, the coats on the back wall.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { chair as woodChair, desk as officeDesk, rbox, rgeo, tube } from '../kit/props'
import { mesh } from '../util'
import type { BuildContext } from '../kit/SetScene'
import { BIN, CHAIR_Z, COLS, DESK, EREN_SEAT, HEART, IBRAHIM_SEAT, R_EYE, ROOM, ROWS, SALIM_SEAT, SEAT_DX, TEACHER_DESK } from './layout'
import type { Pal } from './materials'
import { carvedHeart, gradedSheet, lessonNotebook, notebookSpread, readerNotebook } from './canvas'

export type Who = 'salim' | 'girl' | 'ibrahim' | 'eren' | 'glasses' | 'R' | `k${number}` | null
export type Seat = { col: number; row: number; side: -1 | 1; x: number; z: number; who: Who }

/** Who sits where (docs §2.3). */
export function seating(): Seat[] {
  const seats: Seat[] = []
  let k = 0
  for (let col = 0; col < 3; col++)
    for (let row = 0; row < 4; row++)
      for (const side of [-1, 1] as const) {
        const x = COLS[col] + side * SEAT_DX
        const z = CHAIR_Z[row]
        let who: Who = null
        if (col === 2 && row === 2) who = side < 0 ? 'salim' : 'girl'
        else if (col === 2 && row === 3) who = side < 0 ? 'ibrahim' : 'eren'
        else if (col === 1 && row === 1) who = side < 0 ? 'glasses' : 'R'
        else if (col === 0 && row === 3) who = null
        else if (col === 1 && row === 3 && side > 0) who = null
        else who = `k${k++}`
        if (who === 'salim') seats.push({ col, row, side, x: SALIM_SEAT.x, z: SALIM_SEAT.z, who })
        else if (who === 'ibrahim') seats.push({ col, row, side, x: IBRAHIM_SEAT.x, z: IBRAHIM_SEAT.z, who })
        else if (who === 'eren') seats.push({ col, row, side, x: EREN_SEAT.x, z: EREN_SEAT.z, who })
        else seats.push({ col, row, side, x, z, who })
      }
  return seats
}

/** The model chair faces +z; the class faces −z. */
const CHAIR_SCALE = 0.86

export type Furniture = {
  seats: Seat[]
  /** Chairs by the seat's occupant (for the ones that move). */
  chairs: Map<string, THREE.Group>
  /** The pen that rolls in `hush` (on the glasses boy's half of the desk). */
  pen: THREE.Mesh
  bin: THREE.Group
  /** The lesson notebook's position (teacher's desk). */
  textures: THREE.Texture[]
  /** İbrahim's backpack, hanging on his chair toward Eren. */
  backpack: THREE.Group
  /** Desk parts (occluders for the twist sweep). */
  desks: THREE.InstancedMesh[]
}

function backpack(body: THREE.Material, strap: THREE.Material) {
  const g = new THREE.Group()
  rbox(0.27, 0.36, 0.13, body, 0, 0, 0, g, 0.05)
  rbox(0.2, 0.17, 0.05, body, 0, -0.07, 0.08, g, 0.025)
  rbox(0.2, 0.012, 0.012, strap, 0, 0.01, 0.106, g, 0.004)
  for (const s of [-1, 1]) tube([[s * 0.08, 0.17, -0.06], [s * 0.1, 0.05, -0.1], [s * 0.09, -0.15, -0.075]], 0.012, strap, g, 10)
  tube([[-0.04, 0.18, 0], [0, 0.23, 0], [0.04, 0.18, 0]], 0.008, strap, g, 8)
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return g
}

/**
 * A child's coat on a hook: a padded, flat body with sloping shoulders (an
 * extruded outline, not a sausage), sleeves hanging at its sides, a zip and
 * two pockets; some with the hood rolled up behind the collar. Local frame:
 * the hook at the origin, the coat hanging down −y, its front toward +z.
 */
function coat(m: THREE.Material, trim: THREE.Material, len: number, hood: boolean) {
  const g = new THREE.Group()
  g.name = 'coat'
  const s = new THREE.Shape()
  s.moveTo(-0.045, -0.03)
  s.lineTo(0.045, -0.03)
  s.quadraticCurveTo(0.1, -0.05, 0.13, -0.09)
  s.lineTo(0.14, -0.2)
  s.lineTo(0.15, -len + 0.03)
  s.quadraticCurveTo(0, -len - 0.02, -0.15, -len + 0.03)
  s.lineTo(-0.14, -0.2)
  s.lineTo(-0.13, -0.09)
  s.quadraticCurveTo(-0.1, -0.05, -0.045, -0.03)
  const body = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.026, bevelSize: 0.018, bevelSegments: 3, curveSegments: 8 })
  body.translate(0, 0, -0.0175)
  body.computeVertexNormals()
  const b = mesh(body, m, 0, 0, 0, g)
  b.castShadow = true
  b.receiveShadow = true
  // The zip and two pockets (a darker trim), on the front.
  rbox(0.006, len - 0.08, 0.004, trim, 0, -len / 2 - 0.01, 0.045, g, 0.002)
  for (const sx of [-1, 1]) rbox(0.075, 0.055, 0.008, m, sx * 0.08, -len + 0.16, 0.044, g, 0.003)
  // Sleeves hanging at the sides, a little in front of the body.
  for (const sx of [-1, 1]) {
    const sl = mesh(new THREE.CapsuleGeometry(0.036, len * 0.5, 4, 10), m, sx * 0.15, -0.12 - len * 0.27, 0.02, g)
    sl.scale.set(1, 1, 0.8)
    sl.rotation.z = sx * 0.05
    sl.castShadow = true
  }
  if (hood) {
    const h = mesh(new THREE.SphereGeometry(0.085, 16, 10), m, 0, -0.035, -0.02, g)
    h.scale.set(1.15, 0.7, 0.55)
    h.castShadow = true
  }
  return g
}

export async function buildFurniture(scene: THREE.Scene, m: Pal, ctx: BuildContext): Promise<Furniture> {
  const textures: THREE.Texture[] = []
  const tex = <T extends THREE.Texture>(t: T) => (textures.push(t), t)
  const seats = seating()
  const rand = mulberry32(21)

  // ——— Desks (instanced): top, front panel down to the floor, solid sides, book shelf ———
  const n = COLS.length * ROWS.length
  const panelH = DESK.top - 0.028 - DESK.panelBottom
  const parts = [
    { name: 'desk-top', geo: rgeo(DESK.w + 0.04, 0.028, DESK.d + 0.04, 0.006), mat: m.deskTop, at: (x: number, z: number) => [x, DESK.top - 0.014, z] },
    { name: 'desk-front', geo: rgeo(DESK.w, panelH, 0.018, 0.003), mat: m.deskBody, at: (x: number, z: number) => [x, DESK.panelBottom + panelH / 2, z - DESK.d / 2 + 0.009] },
    { name: 'desk-side', geo: rgeo(0.022, panelH, DESK.d, 0.003), mat: m.deskBody, at: (x: number, z: number) => [x - DESK.w / 2 + 0.011, DESK.panelBottom + panelH / 2, z] },
    { name: 'desk-side', geo: rgeo(0.022, panelH, DESK.d, 0.003), mat: m.deskBody, at: (x: number, z: number) => [x + DESK.w / 2 - 0.011, DESK.panelBottom + panelH / 2, z] },
    { name: 'desk-shelf', geo: rgeo(DESK.w - 0.044, 0.014, 0.32, 0.003), mat: m.deskBody, at: (x: number, z: number) => [x, 0.56, z - DESK.d / 2 + 0.18] },
    { name: 'desk-edge', geo: rgeo(DESK.w + 0.044, 0.012, DESK.d + 0.044, 0.004), mat: m.deskEdge, at: (x: number, z: number) => [x, DESK.top - 0.022, z] },
  ]
  const desks: THREE.InstancedMesh[] = []
  const m4 = new THREE.Matrix4()
  for (const part of parts) {
    const im = new THREE.InstancedMesh(part.geo, part.mat, n)
    im.name = part.name
    let i = 0
    for (const x of COLS)
      for (const z of ROWS) {
        const [px, py, pz] = part.at(x, z)
        im.setMatrixAt(i++, m4.makeTranslation(px, py, pz))
      }
    im.castShadow = true
    im.receiveShadow = true
    scene.add(im)
    desks.push(im)
  }

  // ——— Chairs: the CC0 school chair, a wooden stand-in if it fails ———
  const model = await ctx.model('SchoolChair_01', { scale: CHAIR_SCALE })
  const chairs = new Map<string, THREE.Group>()
  for (const s of seats) {
    if (s.who === 'eren') continue
    const holder = new THREE.Group()
    const inner = model ? model.clone(true) : woodChair(m.deskTop, m.deskBody)
    if (!model) inner.scale.setScalar(0.9)
    holder.add(inner)
    // Facing −z with the class; R's chair pulled out a hand's width; empty ones pushed in.
    let z = s.z
    if (s.who === 'R') z += 0.09
    if (s.who === null) z -= 0.12
    holder.position.set(s.x, 0, z)
    holder.rotation.y = Math.PI + (s.who === null ? (rand() - 0.5) * 0.1 : (rand() - 0.5) * 0.06)
    scene.add(holder)
    chairs.set(s.who ?? `empty-${s.col}-${s.row}-${s.side}`, holder)
  }

  // ——— On the desks: open notebooks, pens, pencil cases, books ———
  const spreads = [0, 1, 2, 3].map((i) => tex(notebookSpread(40 + i, i % 2 ? 'Dengelenmiş kuvvetler' : null, 5 + i)))
  const spreadMats = spreads.map((t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }))
  const coverMats = [0x2f5d8a, 0x8a2f3a, 0x3d6b47, 0xc9a23a, 0x5b3d7a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }))
  const notebookGeo = new THREE.PlaneGeometry(0.34, 0.24)
  let pen: THREE.Mesh | null = null
  for (const s of seats) {
    if (!s.who || s.who === 'R') continue
    const deskZ = ROWS[s.row]
    const x = s.x + (rand() - 0.5) * 0.04
    const z = deskZ + 0.06 + (rand() - 0.5) * 0.03
    const g = new THREE.Group()
    g.position.set(x, DESK.top + 0.001, z)
    g.rotation.y = (rand() - 0.5) * 0.25
    scene.add(g)
    // The cover under the spread, then the pages.
    rbox(0.35, 0.004, 0.245, coverMats[Math.floor(rand() * coverMats.length)], 0, 0.002, 0, g, 0.001)
    const pg = mesh(notebookGeo, spreadMats[Math.floor(rand() * spreadMats.length)], 0, 0.0045, 0, g)
    pg.rotation.x = -Math.PI / 2
    pg.receiveShadow = true
    // A pen or a pencil beside it.
    const p = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 8), rand() < 0.5 ? m.pen : m.penRed, s.side * 0.21, 0.0045, 0.02, g)
    p.rotation.set(Math.PI / 2, 0, rand() - 0.5)
    p.castShadow = true
    if (s.who === 'glasses') pen = p
    // Some have a closed book or a pencil case at the far edge.
    if (rand() < 0.45) rbox(0.17, 0.02, 0.24, coverMats[Math.floor(rand() * coverMats.length)], -s.side * 0.05, 0.01, -0.2, g, 0.003).castShadow = true
    else if (rand() < 0.6) {
      const pc = mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 10), m.pencilCase, s.side * 0.1, 0.03, -0.19, g)
      pc.rotation.z = Math.PI / 2
      pc.castShadow = true
    }
  }

  // The reader's desk: your notebook ("Dengelenmiş kuvvetler" underlined), your pencil case, the old carved heart.
  {
    const deskZ = ROWS[1]
    const g = new THREE.Group()
    g.position.set(R_EYE.x - 0.02, DESK.top + 0.001, deskZ + 0.09)
    g.rotation.y = 0.05
    scene.add(g)
    rbox(0.345, 0.004, 0.245, coverMats[0], 0, 0.002, 0, g, 0.001)
    const pg = mesh(notebookGeo, new THREE.MeshStandardMaterial({ map: tex(readerNotebook()), roughness: 0.9 }), 0, 0.0045, 0, g)
    pg.rotation.x = -Math.PI / 2
    pg.receiveShadow = true
    const pc = mesh(new THREE.CapsuleGeometry(0.03, 0.15, 4, 10), m.pencilCase, -0.24, 0.03, -0.12, g)
    pc.rotation.set(0, 0.3, Math.PI / 2)
    pc.castShadow = true
    const pencil = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6), new THREE.MeshStandardMaterial({ color: 0xd8a830, roughness: 0.6 }), 0.13, 0.005, 0.07, g)
    pencil.rotation.set(Math.PI / 2, 0, 0.6)
    const heart = mesh(new THREE.PlaneGeometry(0.11, 0.11), new THREE.MeshStandardMaterial({ map: tex(carvedHeart()), transparent: true, depthWrite: false, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }), HEART.x, DESK.top + 0.0012, HEART.z, scene)
    heart.rotation.set(-Math.PI / 2, 0, 0.2)
  }
  if (!pen) pen = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 8), m.pen, 0, 0, 0, scene)

  // ——— Under the desks: books on the shelves; on the floor, a dropped eraser, a pencil, paper balls ———
  {
    const n = COLS.length * ROWS.length * 5
    const bookGeo = new THREE.BoxGeometry(1, 1, 1)
    const books = new THREE.InstancedMesh(bookGeo, new THREE.MeshStandardMaterial({ roughness: 0.75 }), n)
    const m4b = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const col = new THREE.Color()
    const tints = [0x2f5d8a, 0x8a2f3a, 0x3d6b47, 0xc9a23a, 0x5b3d7a, 0xd9d2c0, 0x2a2a2e]
    let k = 0
    for (const cx of COLS)
      for (const dz of ROWS)
        for (let i = 0; i < 5; i++) {
          if (rand() < 0.3) continue
          const w = 0.17 + rand() * 0.06
          const h = 0.012 + rand() * 0.02
          const d = 0.22 + rand() * 0.05
          const x = cx - 0.45 + i * 0.22 + (rand() - 0.5) * 0.04
          q.setFromEuler(new THREE.Euler(0, (rand() - 0.5) * 0.3, 0))
          m4b.compose(new THREE.Vector3(x, 0.567 + h / 2, dz - 0.07), q, new THREE.Vector3(w, h, d))
          books.setMatrixAt(k, m4b)
          books.setColorAt(k, col.setHex(tints[Math.floor(rand() * tints.length)]))
          k++
        }
    books.count = k
    books.name = 'books'
    books.castShadow = true
    books.receiveShadow = true
    scene.add(books)
    // The floor of the runway and the rows: a pink eraser, a pencil, a paper ball or two.
    const eraser = rbox(0.05, 0.012, 0.025, m.eraser, 1.05, 0.006, -0.62, scene, 0.003)
    eraser.rotation.y = 0.7
    const pencil = mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0xd8a830, roughness: 0.6 }), 1.32, 0.004, 0.42, scene)
    pencil.rotation.set(Math.PI / 2, 0, 1.1)
    for (const [x, z] of [
      [0.82, 1.62],
      [-1.5, 0.55],
      [1.52, -1.0],
    ] as const) {
      const geo = new THREE.IcosahedronGeometry(0.03, 1)
      const pos = geo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (0.8 + rand() * 0.4), pos.getY(i) * (0.7 + rand() * 0.4), pos.getZ(i) * (0.8 + rand() * 0.4))
      geo.computeVertexNormals()
      mesh(geo, m.paperBall, x, 0.026, z, scene).castShadow = true
    }
  }

  // ——— Bags: on the floor by some chairs, on the desk hooks; İbrahim's on his chair, toward Eren ———
  const bagMats = [m.bag, m.bagB, m.bagC]
  for (const s of seats) {
    if (!s.who || s.who === 'R' || s.who === 'ibrahim' || s.who === 'eren') continue
    if (rand() < 0.45) continue
    const b = backpack(bagMats[Math.floor(rand() * 3)], m.bagStrap)
    const deskZ = ROWS[s.row]
    // Hanging on the desk's side hook (outer side), or leaning on the floor by the chair leg.
    if (rand() < 0.5) {
      b.position.set(COLS[s.col] + s.side * (DESK.w / 2 + 0.07), 0.42, deskZ + 0.05)
      b.rotation.y = s.side * Math.PI / 2
    } else {
      b.position.set(s.x + s.side * 0.32, 0.17, s.z + 0.05)
      b.rotation.set(-0.25, s.side * 1.3, 0)
    }
    scene.add(b)
  }
  const ibBag = backpack(m.bag, m.bagStrap)
  ibBag.position.set(IBRAHIM_SEAT.x + 0.27, 0.43, IBRAHIM_SEAT.z + 0.08)
  ibBag.rotation.y = Math.PI / 2
  scene.add(ibBag)

  // ——— The teacher's desk: thermos, red pen, the lesson notebook, graded quizzes, chalk ———
  {
    const d = officeDesk(1.2, 0.6, m.teacherDesk, m.teacherDesk)
    d.position.set(TEACHER_DESK.x, 0, TEACHER_DESK.z)
    d.rotation.y = Math.PI
    d.scale.y = TEACHER_DESK.top / 0.74
    d.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    scene.add(d)
    const ch = woodChair(m.teacherDesk, m.teacherDesk)
    ch.position.set(TEACHER_DESK.x + 0.1, 0, TEACHER_DESK.z - 0.55)
    ch.rotation.y = 0.15
    scene.add(ch)
    const top = TEACHER_DESK.top
    const th = mesh(new THREE.CylinderGeometry(0.038, 0.04, 0.26, 20), m.thermos, -2.85, top + 0.13, -2.5, scene)
    th.castShadow = true
    mesh(new THREE.CylinderGeometry(0.036, 0.038, 0.05, 20), m.tray, -2.85, top + 0.285, -2.5, scene).castShadow = true
    const nb = new THREE.Group()
    nb.position.set(-2.3, top + 0.002, -2.45)
    nb.rotation.y = Math.PI + 0.12
    scene.add(nb)
    rbox(0.35, 0.006, 0.25, new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.6 }), 0, 0.003, 0, nb, 0.002)
    const lp = mesh(notebookGeo, new THREE.MeshStandardMaterial({ map: tex(lessonNotebook()), roughness: 0.9 }), 0, 0.0065, 0, nb)
    lp.rotation.x = -Math.PI / 2
    const red = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 8), m.penRed, -2.12, top + 0.006, -2.33, scene)
    red.rotation.set(Math.PI / 2, 0, 0.8)
    red.castShadow = true
    const sheetMat = [1, 2, 3].map((i) => new THREE.MeshStandardMaterial({ map: tex(gradedSheet(70 + i)), roughness: 0.9 }))
    for (let i = 0; i < 9; i++) {
      const sh = mesh(new THREE.PlaneGeometry(0.21, 0.297), sheetMat[i % 3], -2.66 + (rand() - 0.5) * 0.01, top + 0.002 + i * 0.0012, -2.36 + (rand() - 0.5) * 0.01, scene)
      sh.rotation.set(-Math.PI / 2, 0, Math.PI + (rand() - 0.5) * 0.12)
      sh.receiveShadow = true
    }
    const cb = rbox(0.12, 0.06, 0.08, m.chalkBox, -2.05, top + 0.03, -2.6, scene, 0.004)
    cb.castShadow = true
    // Closed books from the CC0 notebook model, if it loads.
    const binder = await ctx.model('binder_notebook')
    if (binder) {
      binder.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && o.name === 'binder_notebook') o.visible = false
      })
      binder.position.set(-2.95, top, -2.25)
      binder.rotation.y = 0.4
      scene.add(binder)
      const b2 = binder.clone(true)
      b2.position.set(-2.95, top + 0.026, -2.22)
      b2.rotation.y = 0.2
      scene.add(b2)
    }
  }

  // ——— The bin corner: blue plastic bin with crumpled paper, a broom and a dustpan ———
  const bin = new THREE.Group()
  {
    const prof: Array<[number, number]> = [
      [0, 0.004],
      [0.135, 0.004],
      [0.142, 0.01],
      [0.16, 0.41],
      [0.168, 0.418],
      [0.168, 0.428],
      [0.156, 0.428],
      [0.15, 0.415],
      [0.132, 0.016],
      [0, 0.016],
    ]
    const shell = mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40), m.binBlue, 0, 0, 0, bin)
    shell.castShadow = true
    shell.receiveShadow = true
    // Crumpled paper inside, a few at the top.
    for (let i = 0; i < 9; i++) {
      const geo = new THREE.IcosahedronGeometry(0.035 + rand() * 0.02, 1)
      const pos = geo.attributes.position as THREE.BufferAttribute
      for (let k = 0; k < pos.count; k++) pos.setXYZ(k, pos.getX(k) * (0.8 + rand() * 0.4), pos.getY(k) * (0.8 + rand() * 0.4), pos.getZ(k) * (0.8 + rand() * 0.4))
      geo.computeVertexNormals()
      const a = rand() * Math.PI * 2
      const r = rand() * 0.09
      mesh(geo, m.paperBall, Math.cos(a) * r, 0.3 + rand() * 0.1, Math.sin(a) * r, bin).castShadow = true
    }
    bin.position.set(BIN.x, 0, BIN.z)
    scene.add(bin)
    // Broom and dustpan leaning on the front wall by the door wall.
    const broom = new THREE.Group()
    mesh(new THREE.CylinderGeometry(0.011, 0.011, 1.2, 10), m.broomStick, 0, 0.6, 0, broom).castShadow = true
    rbox(0.26, 0.05, 0.05, m.broom, 0, 0.02, 0, broom, 0.01)
    rbox(0.25, 0.06, 0.035, m.bristle, 0, -0.03, 0, broom, 0.006)
    broom.position.set(3.86, 0.08, -3.4)
    broom.rotation.set(0.12, 0.6, -0.08)
    scene.add(broom)
    const pan = new THREE.Group()
    rbox(0.24, 0.006, 0.22, m.broom, 0, 0, 0, pan, 0.003)
    rbox(0.24, 0.05, 0.006, m.broom, 0, 0.025, -0.11, pan, 0.003)
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), m.broom, 0, 0.03, -0.2, pan).rotation.x = Math.PI / 2
    pan.position.set(3.82, 0.2, -3.42)
    pan.rotation.set(-1.25, 0.3, 0)
    scene.add(pan)
  }

  // ——— Coats on the back-wall hooks (they curtain the back-right corner) ———
  const coatMats = [m.coatA, m.coatB, m.coatD, m.coatC, m.coatA, m.bagC, m.coatB]
  for (let i = 0; i < 7; i++) {
    const x = 1.15 + i * 0.42
    mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 6), m.hook, x, 1.6, ROOM.z1 - 0.04, scene).rotation.x = Math.PI / 2
    if (i === 3) continue
    const c = coat(coatMats[i], m.bagStrap, 0.56 + rand() * 0.12, i % 2 === 0)
    c.position.set(x, 1.6, ROOM.z1 - 0.075)
    c.rotation.set(0.04, Math.PI + (rand() - 0.5) * 0.2, (rand() - 0.5) * 0.05)
    scene.add(c)
  }
  // A satchel on the hook between them.
  const sat = backpack(m.bagB, m.bagStrap)
  sat.position.set(1.15 + 3 * 0.42, 1.38, ROOM.z1 - 0.1)
  sat.rotation.y = Math.PI
  scene.add(sat)

  // ——— A standing chalkboard in the back-left corner (CC0), the duty roster on it ———
  const easel = await ctx.model('standing_chalkboard_01', { height: 1.45 })
  if (easel) {
    easel.position.set(-3.45, 0, 3.0)
    easel.rotation.y = Math.PI * 0.82
    scene.add(easel)
  }

  // Name what is still unnamed (readable camera-collision reports).
  for (const o of scene.children) if (!o.name && !(o as THREE.Light).isLight) o.name = 'furniture'
  return { seats, chairs, pen, bin, textures, backpack: ibBag, desks }
}

