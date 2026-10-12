/**
 * The classroom shell: walls in two coats of oil paint, the checkered
 * linoleum, the ceiling with its stain and switched-off tubes, three tall
 * windows onto a bright schoolyard, the door with its ramp, the chalkboard
 * wall (board, flag, portrait, clock) and the back wall (cork board, coats).
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { radiator, rbox, room, wallClock } from '../kit/props'
import { mesh } from '../util'
import { BOARD, CLOCK_POS, DOOR, LAW, ROOM, SEAM_Z, STAIN, TITLE, WIN, WINDOWS } from './layout'
import type { Pal } from './materials'
import { boardBase, canvasTexture, ChalkBlock, classSign, clockFace, drawing, flag, forcePoster, linoleum, portrait, stain, textPanel } from './canvas'

export type Shell = {
  clock: ReturnType<typeof wallClock>
  title: ChalkBlock
  law: ChalkBlock
  /** Canvas px → world on the board, per block. */
  titleAt: (x: number, y: number, out: THREE.Vector3) => THREE.Vector3
  lawAt: (x: number, y: number, out: THREE.Vector3) => THREE.Vector3
  floor: THREE.Mesh
  /** Materials that brighten with the outside light (backdrop). */
  outside: THREE.MeshBasicMaterial
  /** Window panes (for the twist sweep's occluders etc.). */
  glass: THREE.Mesh[]
  textures: THREE.Texture[]
}

const PI = Math.PI

export function buildShell(scene: THREE.Scene, m: Pal): Shell {
  const textures: THREE.Texture[] = []
  const tex = <T extends THREE.Texture>(t: T) => (textures.push(t), t)
  // Every unnamed thing a section adds is named after it (readable camera-collision reports).
  let mark = scene.children.length
  let current = ''
  const section = (name: string) => {
    for (let i = mark; i < scene.children.length; i++) if (!scene.children[i].name && current) scene.children[i].name = current
    mark = scene.children.length
    current = name
  }
  const W = ROOM.x1 - ROOM.x0
  const D = ROOM.z1 - ROOM.z0

  section('floor')
  // ——— Floor: 0.3 m linoleum tiles, a seam exactly on z −2.62 ———
  const lino = tex(linoleum())
  lino.wrapS = lino.wrapT = THREE.RepeatWrapping
  lino.repeat.set(W / 1.2, D / 1.2)
  // v runs from z +3.5 (0) to z −3.5 (1); one texture tile is 1.2 m (4 seams).
  const t = (ROOM.z1 - SEAM_Z) / 1.2
  lino.offset.set(0.0, -(t % 0.25))
  const floorMat = new THREE.MeshStandardMaterial({ map: lino, roughness: 0.42, metalness: 0, envMapIntensity: 0.7 })
  const shell = room({
    w: W,
    d: D,
    h: ROOM.h,
    wall: m.wall,
    floor: floorMat,
    ceiling: m.ceiling,
    trim: m.trim,
    t: 0.3,
    openings: [
      ...WINDOWS.map((z) => ({ side: 'w' as const, at: z, width: WIN.w, height: WIN.y1 - WIN.y0, bottom: WIN.y0 })),
      { side: 'e' as const, at: DOOR.z, width: DOOR.w, height: DOOR.h },
    ],
  })
  scene.add(shell)
  const floor = shell.children[0] as THREE.Mesh
  // The ceiling must stop the sun too (else the low sun shines through it onto the door wall).
  const ceil = shell.children[1] as THREE.Mesh
  ceil.castShadow = true
  ;(ceil.material as THREE.Material).shadowSide = THREE.DoubleSide

  section('walls')
  // ——— Two coats of oil paint: a darker dado to 1.0 m with a brown line ———
  const dado = (x0: number, x1: number, wall: 'n' | 's' | 'e' | 'w') => {
    const len = x1 - x0
    if (len <= 0.01) return
    const g = new THREE.Group()
    const c = (x0 + x1) / 2
    if (wall === 'n') g.position.set(c, 0, ROOM.z0 + 0.003)
    if (wall === 's') {
      g.position.set(c, 0, ROOM.z1 - 0.003)
      g.rotation.y = PI
    }
    if (wall === 'w') {
      g.position.set(ROOM.x0 + 0.003, 0, c)
      g.rotation.y = PI / 2
    }
    if (wall === 'e') {
      g.position.set(ROOM.x1 - 0.003, 0, c)
      g.rotation.y = -PI / 2
    }
    const p = mesh(new THREE.PlaneGeometry(len, 0.92), m.dado, 0, 0.08 + 0.46, 0, g)
    p.receiveShadow = true
    rbox(len, 0.022, 0.008, m.dadoLine, 0, 1.0, 0.002, g, 0.002)
    scene.add(g)
  }
  dado(ROOM.x0, ROOM.x1, 'n')
  dado(ROOM.x0, ROOM.x1, 's')
  dado(ROOM.z0, DOOR.z - DOOR.w / 2 - 0.08, 'e')
  dado(DOOR.z + DOOR.w / 2 + 0.08, ROOM.z1, 'e')
  dado(ROOM.z0, ROOM.z1, 'w')

  section('windows')
  // ——— Windows: painted casements, a fanlight, glass, radiators under them ———
  const glass: THREE.Mesh[] = []
  for (const z of WINDOWS) {
    const g = new THREE.Group()
    g.position.set(ROOM.x0 - 0.12, 0, z)
    g.rotation.y = PI / 2
    scene.add(g)
    const h = WIN.y1 - WIN.y0
    const fan = 2.42
    // Outer frame, mullion and transom.
    rbox(WIN.w, 0.07, 0.07, m.windowFrame, 0, WIN.y0 + 0.035, 0, g, 0.006)
    rbox(WIN.w, 0.07, 0.07, m.windowFrame, 0, WIN.y1 - 0.035, 0, g, 0.006)
    rbox(0.07, h, 0.07, m.windowFrame, -WIN.w / 2 + 0.035, (WIN.y0 + WIN.y1) / 2, 0, g, 0.006)
    rbox(0.07, h, 0.07, m.windowFrame, WIN.w / 2 - 0.035, (WIN.y0 + WIN.y1) / 2, 0, g, 0.006)
    rbox(0.06, fan - WIN.y0, 0.075, m.windowFrame, 0, (WIN.y0 + fan) / 2, 0.01, g, 0.006)
    rbox(WIN.w, 0.06, 0.075, m.windowFrame, 0, fan, 0.01, g, 0.006)
    // Casement sashes (inner frames) and glazing bars.
    for (const s of [-1, 1]) {
      const cx = s * (WIN.w / 4)
      const cw = WIN.w / 2 - 0.08
      const ch = fan - WIN.y0 - 0.1
      const cy = (WIN.y0 + fan) / 2
      rbox(cw, 0.04, 0.05, m.windowFrame, cx, cy - ch / 2, 0.02, g, 0.004)
      rbox(cw, 0.04, 0.05, m.windowFrame, cx, cy + ch / 2, 0.02, g, 0.004)
      rbox(0.04, ch, 0.05, m.windowFrame, cx - cw / 2, cy, 0.02, g, 0.004)
      rbox(0.04, ch, 0.05, m.windowFrame, cx + cw / 2, cy, 0.02, g, 0.004)
      rbox(cw, 0.025, 0.03, m.windowFrame, cx, cy, 0.02, g, 0.003)
      // A latch.
      rbox(0.016, 0.07, 0.02, m.handle, s * 0.05, cy, 0.05, g, 0.004)
    }
    for (const [gy, gh] of [
      [(WIN.y0 + fan) / 2, fan - WIN.y0 - 0.08],
      [(fan + WIN.y1) / 2, WIN.y1 - fan - 0.07],
    ] as const) {
      const pane = mesh(new THREE.PlaneGeometry(WIN.w - 0.1, gh), m.glass, 0, gy, 0.0, g)
      pane.userData.noAO = true
      pane.castShadow = false
      glass.push(pane)
    }
    const rad = radiator(1.2, m.radiator)
    rad.position.set(ROOM.x0 + 0.12, 0.03, z)
    rad.rotation.y = PI / 2
    scene.add(rad)
    // Brackets and a valve.
    rbox(0.03, 0.03, 0.08, m.radiator, ROOM.x0 + 0.05, 0.5, z - 0.5, scene, 0.004)
    rbox(0.03, 0.03, 0.08, m.radiator, ROOM.x0 + 0.05, 0.5, z + 0.5, scene, 0.004)
    mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 12), m.handle, ROOM.x0 + 0.12, 0.12, z + 0.66, scene)
  }

  section('outside')
  // ——— Outside: a bright yard, trees in October, the school's other wing ———
  const yard = tex(
    canvasTexture(2048, 1024, (g, w, h) => {
      const rand = mulberry32(19)
      const sky = g.createLinearGradient(0, 0, 0, h * 0.7)
      sky.addColorStop(0, '#9fc3dd')
      sky.addColorStop(0.6, '#d9e6ea')
      sky.addColorStop(1, '#f4ead2')
      g.fillStyle = sky
      g.fillRect(0, 0, w, h)
      // The other wing of the school across the yard.
      g.fillStyle = '#e6d9bd'
      g.fillRect(0, h * 0.46, w, h * 0.3)
      g.fillStyle = '#c9b68f'
      g.fillRect(0, h * 0.455, w, h * 0.012)
      for (let x = 30; x < w; x += 120)
        for (const y of [0.5, 0.62]) {
          g.fillStyle = '#7c8f99'
          g.fillRect(x, h * y, 70, h * 0.075)
          g.fillStyle = 'rgba(255,255,255,0.35)'
          g.fillRect(x + 4, h * y + 3, 30, h * 0.03)
        }
      // Trees: autumn crowns.
      for (let i = 0; i < 26; i++) {
        const x = rand() * w
        const y = h * (0.52 + rand() * 0.18)
        const r = 60 + rand() * 110
        g.fillStyle = '#5a4632'
        g.fillRect(x - 6, y, 12, h - y)
        for (let k = 0; k < 18; k++) {
          const hue = 38 + rand() * 40
          g.fillStyle = `hsla(${hue},${45 + rand() * 25}%,${42 + rand() * 18}%,0.85)`
          g.beginPath()
          g.arc(x + (rand() - 0.5) * r * 1.4, y - rand() * r * 1.1, r * (0.3 + rand() * 0.35), 0, PI * 2)
          g.fill()
        }
      }
      // The yard: pale asphalt, painted lines.
      g.fillStyle = '#b7ad9a'
      g.fillRect(0, h * 0.82, w, h * 0.18)
      g.strokeStyle = 'rgba(255,255,255,0.6)'
      g.lineWidth = 4
      g.beginPath()
      g.moveTo(0, h * 0.9)
      g.lineTo(w, h * 0.88)
      g.stroke()
    }),
  )
  const outside = new THREE.MeshBasicMaterial({ map: yard, color: new THREE.Color(1.25, 1.22, 1.15), fog: false })
  const back = mesh(new THREE.PlaneGeometry(36, 18), outside, -13, 3.2, 0, scene)
  back.rotation.y = PI / 2
  back.castShadow = false
  back.receiveShadow = false
  // The yard below the windows (the class is on the first floor).
  const ground = mesh(new THREE.PlaneGeometry(10, 36), new THREE.MeshStandardMaterial({ color: 0xb8ad98, roughness: 0.95 }), -8.6, -3.4, 0, scene)
  ground.rotation.x = -PI / 2
  ground.receiveShadow = false

  section('door')
  // ——— The door (right wall), a small window, the class sign; the ramp on the threshold ———
  {
    const g = new THREE.Group()
    g.position.set(DOOR.x + 0.04, 0, DOOR.z)
    g.rotation.y = -PI / 2
    scene.add(g)
    const fr = 0.06
    rbox(fr, DOOR.h + fr, 0.16, m.doorFrame, -DOOR.w / 2 - fr / 2, (DOOR.h + fr) / 2, 0, g, 0.004)
    rbox(fr, DOOR.h + fr, 0.16, m.doorFrame, DOOR.w / 2 + fr / 2, (DOOR.h + fr) / 2, 0, g, 0.004)
    rbox(DOOR.w + 2 * fr, fr, 0.16, m.doorFrame, 0, DOOR.h + fr / 2, 0, g, 0.004)
    for (const s of [-1, 1]) rbox(0.08, DOOR.h + 0.1, 0.02, m.doorFrame, s * (DOOR.w / 2 + 0.07), (DOOR.h + 0.1) / 2, 0.08, g, 0.004)
    rbox(DOOR.w + 0.3, 0.08, 0.02, m.doorFrame, 0, DOOR.h + 0.1, 0.08, g, 0.004)
    const leaf = new THREE.Group()
    g.add(leaf)
    rbox(DOOR.w - 0.01, DOOR.h - 0.01, 0.045, m.door, 0, DOOR.h / 2, 0, leaf, 0.004)
    rbox(DOOR.w - 0.24, 0.62, 0.01, m.door, 0, 0.5, 0.025, leaf, 0.004)
    // The small window: wired glass onto a dim corridor.
    const corridor = tex(
      canvasTexture(128, 256, (gg, w, h) => {
        const grad = gg.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, '#a9aea8')
        grad.addColorStop(1, '#6d6f69')
        gg.fillStyle = grad
        gg.fillRect(0, 0, w, h)
        gg.strokeStyle = 'rgba(60,60,60,0.35)'
        for (let i = -h; i < w + h; i += 14) {
          gg.beginPath()
          gg.moveTo(i, 0)
          gg.lineTo(i + h, h)
          gg.moveTo(i + h, 0)
          gg.lineTo(i, h)
          gg.stroke()
        }
      }),
    )
    rbox(0.32, 0.62, 0.05, m.doorFrame, 0, 1.55, 0, leaf, 0.004)
    mesh(new THREE.PlaneGeometry(0.26, 0.56), new THREE.MeshStandardMaterial({ map: corridor, roughness: 0.15 }), 0, 1.55, 0.026, leaf)
    const sign = mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshStandardMaterial({ map: tex(classSign()), roughness: 0.6 }), 0, 1.97, 0.024, leaf)
    sign.castShadow = false
    // Lever handle and plate on the room side.
    rbox(0.05, 0.2, 0.012, m.handle, -DOOR.w / 2 + 0.1, 1.0, 0.028, leaf, 0.004)
    rbox(0.13, 0.02, 0.025, m.handle, -DOOR.w / 2 + 0.15, 1.04, 0.045, leaf, 0.008)
    // The ramp: a low aluminum wedge, its edges polished by daily use.
    const shape = new THREE.Shape()
    shape.moveTo(-0.22, 0)
    shape.lineTo(0.18, 0)
    shape.lineTo(0.18, 0.032)
    shape.lineTo(0.12, 0.034)
    shape.lineTo(-0.22, 0.004)
    const wedge = new THREE.ExtrudeGeometry(shape, { depth: 1.0, bevelEnabled: false })
    wedge.translate(0, 0, -0.5)
    const alu = m.rampAlu
    const ramp = mesh(wedge, alu, DOOR.x - 0.06, 0, DOOR.z, scene)
    ramp.receiveShadow = true
    ramp.castShadow = true
    // Diamond plate: a few ridges.
    for (let i = 0; i < 9; i++) rbox(0.3, 0.003, 0.012, alu, DOOR.x - 0.08, 0.02 + (i % 2) * 0.001, DOOR.z - 0.4 + i * 0.1, scene, 0.001).rotation.z = 0.08
  }

  section('board-wall')
  // ——— The board wall ———
  const bw = BOARD.w
  const bh = BOARD.h
  rbox(bw + 0.1, bh + 0.1, 0.03, m.boardFrame, BOARD.x, BOARD.y, BOARD.z - 0.015, scene, 0.006)
  const base = tex(boardBase())
  const boardMesh = mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshStandardMaterial({ map: base, roughness: 0.93, envMapIntensity: 0.3 }), BOARD.x, BOARD.y, BOARD.z + 0.002, scene)
  boardMesh.receiveShadow = true
  // The chalk tray, chalk, the felt eraser.
  rbox(bw + 0.06, 0.02, 0.07, m.tray, BOARD.x, BOARD.tray, BOARD.z + 0.035, scene, 0.004)
  rbox(bw + 0.06, 0.035, 0.01, m.tray, BOARD.x, BOARD.tray + 0.012, BOARD.z + 0.068, scene, 0.003)
  const rand = mulberry32(4)
  for (let i = 0; i < 6; i++) {
    const c = mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.03 + rand() * 0.05, 8), m.chalkStick, -1.5 + rand() * 3.0, BOARD.tray + 0.016, BOARD.z + 0.04, scene)
    c.rotation.z = PI / 2
    c.rotation.y = (rand() - 0.5) * 0.4
  }
  const eraser = new THREE.Group()
  rbox(0.14, 0.03, 0.05, m.boardFrame, 0, 0.015, 0, eraser, 0.006)
  rbox(0.135, 0.012, 0.046, new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 1 }), 0, -0.004, 0, eraser, 0.003)
  eraser.position.set(1.15, BOARD.tray + 0.022, BOARD.z + 0.035)
  scene.add(eraser)

  // Chalk writing: the title (center-left) and the law (right half).
  const title = new ChalkBlock([{ text: 'Dengelenmiş kuvvetler', x: 40, y: 168, size: 104, tilt: -0.012 }], 1280, 320, true)
  const tw = 1.3
  const th = 0.325
  const tx = (TITLE.x0 + TITLE.x1) / 2
  const titleMesh = mesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshStandardMaterial({ map: title.live.texture, transparent: true, roughness: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), tx, TITLE.y, BOARD.z + 0.004, scene)
  titleMesh.receiveShadow = true
  textures.push(title.live.texture)
  const lw = 1.6
  const lh = 0.8
  const lx = (LAW.x0 + LAW.x1) / 2
  const ly = LAW.y1 + 0.05 - lh / 2
  const law = new ChalkBlock(
    [
      { text: 'Dengelenmiş kuvvetlerin etkisindeki', x: 36, y: 70, size: 44, tilt: -0.02 },
      { text: 'bir cisim, duruyorsa durmaya', x: 36, y: 140, size: 44, tilt: -0.02 },
      { text: 'devam eder.', x: 36, y: 210, size: 44, tilt: -0.02 },
      { text: 'Hareket ediyorsa, aynı süratle', x: 60, y: 282, size: 34, tilt: -0.015 },
      { text: 'hareketine devam eder.', x: 60, y: 334, size: 34, tilt: -0.015 },
      { text: 'Örnek: masanın üstündeki kitap', x: 200, y: 412, size: 36, tilt: -0.02 },
    ],
    1024,
    512,
    false,
  )
  const lawMesh = mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshStandardMaterial({ map: law.live.texture, transparent: true, roughness: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), lx, ly, BOARD.z + 0.004, scene)
  lawMesh.receiveShadow = true
  textures.push(law.live.texture)
  const titleAt = (x: number, y: number, out: THREE.Vector3) => out.set(tx - tw / 2 + (x / 1280) * tw, TITLE.y + th / 2 - (y / 320) * th, BOARD.z + 0.006)
  const lawAt = (x: number, y: number, out: THREE.Vector3) => out.set(lx - lw / 2 + (x / 1024) * lw, ly + lh / 2 - (y / 512) * lh, BOARD.z + 0.006)

  // Over the board: flag, portrait, a framed text.
  const fl = mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshStandardMaterial({ map: tex(flag()), roughness: 0.9 }), -1.2, 2.55, ROOM.z0 + 0.012, scene)
  fl.receiveShadow = true
  rbox(0.02, 0.02, 0.05, m.handle, -1.66, 2.86, ROOM.z0 + 0.025, scene, 0.004)
  rbox(0.02, 0.02, 0.05, m.handle, -0.74, 2.86, ROOM.z0 + 0.025, scene, 0.004)
  rbox(0.5, 0.62, 0.03, m.gilt, 0, 2.6, ROOM.z0 + 0.015, scene, 0.008)
  mesh(new THREE.PlaneGeometry(0.4, 0.52), new THREE.MeshStandardMaterial({ map: tex(portrait()), roughness: 0.5 }), 0, 2.6, ROOM.z0 + 0.032, scene)
  rbox(0.46, 0.56, 0.025, m.frameDark, 1.2, 2.55, ROOM.z0 + 0.013, scene, 0.006)
  mesh(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshStandardMaterial({ map: tex(textPanel()), roughness: 0.4 }), 1.2, 2.55, ROOM.z0 + 0.027, scene)

  // The clock above the bin corner: white face, black hands, a thin red second hand.
  const clock = wallClock(m.handle, new THREE.MeshStandardMaterial({ map: tex(clockFace()), roughness: 0.35 }), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }))
  clock.group.position.copy(CLOCK_POS)
  clock.group.scale.setScalar(1.0)
  scene.add(clock.group)

  section('back-wall')
  // ——— Back wall: cork board with drawings and the unit poster; coat hooks ———
  rbox(3.46, 1.06, 0.03, m.corkFrame, -1.5, 1.5, ROOM.z1 - 0.015, scene, 0.006)
  const cork = mesh(new THREE.PlaneGeometry(3.4, 1.0), m.cork, -1.5, 1.5, ROOM.z1 - 0.032, scene)
  cork.rotation.y = PI
  const pin = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4 })
  const rr = mulberry32(8)
  for (let i = 0; i < 7; i++) {
    const x = -3.0 + i * 0.42 + (rr() - 0.5) * 0.06
    const y = 1.5 + (rr() - 0.5) * 0.4
    const d = mesh(new THREE.PlaneGeometry(0.3, 0.234), new THREE.MeshStandardMaterial({ map: tex(drawing(i + 1)), roughness: 0.9 }), x, y, ROOM.z1 - 0.036, scene)
    d.rotation.set(0, PI, (rr() - 0.5) * 0.12)
    mesh(new THREE.SphereGeometry(0.008, 8, 6), pin, x, y + 0.1, ROOM.z1 - 0.04, scene)
  }
  const poster = mesh(new THREE.PlaneGeometry(0.62, 0.44), new THREE.MeshStandardMaterial({ map: tex(forcePoster()), roughness: 0.6 }), -0.25, 1.52, ROOM.z1 - 0.037, scene)
  poster.rotation.y = PI
  // Hook rail.
  rbox(2.95, 0.07, 0.02, m.corkFrame, 2.45, 1.58, ROOM.z1 - 0.012, scene, 0.004)

  section('ceiling')
  // ——— Ceiling: switched-off fluorescent fittings, the stain ———
  for (const x of [-2.4, 0, 2.4])
    for (const z of [-1.7, 1.3]) {
      const g = new THREE.Group()
      g.position.set(x, ROOM.h, z)
      scene.add(g)
      rbox(0.22, 0.06, 1.28, m.fixture, 0, -0.03, 0, g, 0.01)
      for (const s of [-1, 1]) {
        const tb = mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.2, 10), m.tube, s * 0.05, -0.08, 0, g)
        tb.rotation.x = PI / 2
        tb.castShadow = false
      }
      rbox(0.24, 0.02, 0.04, m.fixture, 0, -0.07, -0.61, g, 0.004)
      rbox(0.24, 0.02, 0.04, m.fixture, 0, -0.07, 0.61, g, 0.004)
    }
  const st = mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshStandardMaterial({ map: tex(stain()), transparent: true, depthWrite: false, roughness: 1 }), STAIN.x, ROOM.h - 0.003, STAIN.z, scene)
  st.rotation.set(PI / 2, 0, 0.5)
  st.castShadow = false

  // A light switch and a socket by the door, a socket on the front wall.
  rbox(0.08, 0.12, 0.012, m.fixture, ROOM.x1 - 0.006, 1.1, DOOR.z + 0.75, scene, 0.006).rotation.y = PI / 2
  rbox(0.08, 0.08, 0.012, m.fixture, -3.3, 0.35, ROOM.z0 + 0.006, scene, 0.006)

  section('')
  return { clock, title, law, titleAt, lawAt, floor, outside, glass, textures }
}
