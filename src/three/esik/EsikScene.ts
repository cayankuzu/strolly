/**
 * EŞİK — a night street where nobody looks at Mira.
 *
 * World layout (meters): a street along −z, road x −4…4, sidewalks to
 * x = ±6.5, facades beyond. A shop window on the east facade at z = −14.
 * The cafe on the west side, x −14.5…−6.5, z −36…−26, with two great panes in
 * its back wall that look onto other versions of the city. A wall across the
 * street at z = −60 with a door; behind it a dark room with one screen.
 *
 * Perception is the mechanic: the reflection is late once; the street is the
 * same street with different details; a building changes only while the
 * reader is not looking at it; at the end the view is turned around for them,
 * and the one who was watched is gone.
 */
import * as THREE from 'three'
import { SEG, local, segmentAt, type SegmentId } from '@/stories/esik/timeline'
import { STORIES, STORY_ORDER } from '@/stories/registry'
import { lerp, mulberry32, smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { Figure, type FigureLook } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { box, cyl, disposeTree, mesh } from '../util'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed, type ShotKeys } from '../kit/direct'
import { Crowd, canvasPlane, car, chair, counter, door, facade, room, std, streetLamp, table } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mono, sans } from '../screens'

const PI = Math.PI
const SHOP_Z = -14
const MAN = { x: -11.1, z: -31 }
const MIRA_AT_MAN = { x: -9.7, z: -31 }
const PANE_A = -29.5
const PANE_B = -33.5
const TERMINAL = new THREE.Vector3(-8.5, 1.15, -35.25)
const WALL_Z = -60
const SCREEN = new THREE.Vector3(0, 1.85, -67.8)
const CHAIR = new THREE.Vector3(0, 0, -61.3)
const CHANGER = { x: 9.5, z: -47 }
const CROWD = 26

function palette() {
  return {
    asphalt: pbr('asphalt', 0x14161a, { roughness: 1 }),
    sidewalk: pbr('paving', 0x2a2d33, { roughness: 1 }),
    curb: pbr('concrete', 0x3a3d43, { roughness: 1 }),
    facadeA: pbr('brick', 0x1c2028, { roughness: 1 }),
    facadeB: pbr('concrete', 0x262229, { roughness: 1 }),
    facadeC: pbr('plaster', 0x202a26, { roughness: 1 }),
    wall: pbr('concrete', 0x2e2a26, { roughness: 1 }),
    cafeWall: pbr('plaster', 0x6b5646, { roughness: 1 }),
    cafeFloor: pbr('planks', 0x3b2d23, { roughness: 1 }),
    ceiling: pbr('plaster', 0x2a2420, { roughness: 1 }),
    wood: pbr('wood', 0x6a4e38, { roughness: 0.9 }),
    darkWood: pbr('wood', 0x2f241c, { roughness: 0.9 }),
    metal: pbr('metal', 0x5c6066, { roughness: 0.8 }),
    lampHead: new THREE.MeshBasicMaterial({ color: 0xffe2b0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x8aa4c0, roughness: 0.02, transparent: true, opacity: 0.18, depthWrite: false }),
    shopGlow: new THREE.MeshBasicMaterial({ color: 0x2b3442 }),
    tire: pbr('rubber', 0x0d0d0e, { roughness: 1 }),
    carRed: pbr('painted', 0x7a1f1f, { roughness: 0.6, metalness: 0.5 }),
    carBlue: pbr('painted', 0x1f3c6e, { roughness: 0.6, metalness: 0.5 }),
    carGrey: pbr('painted', 0x4a4d52, { roughness: 0.6, metalness: 0.5 }),
    carGlass: std(0x0a0d12, 0.1),
    carLight: new THREE.MeshBasicMaterial({ color: 0xfff1d6 }),
    door: pbr('wood', 0x3c3530, { roughness: 0.9 }),
    trim: pbr('painted', 0x9a8f84, { roughness: 1 }),
    brass: pbr('metal', 0xb48f58, { roughness: 0.6 }),
    room: pbr('concrete', 0x0d0e10, { roughness: 1 }),
    chair: pbr('wood', 0x5a4636, { roughness: 0.9 }),
    // The cast
    skinM: std(0xd0a68b, 0.55),
    skinMHead: std(0xd0a68b, 0.52, { vertexColors: true }),
    skinO: std(0xb79079, 0.56),
    skinOHead: std(0xb79079, 0.53, { vertexColors: true }),
    eye: std(0x120d0a, 0.15),
    hairM: std(0x1c1512, 0.7),
    hairO: std(0x8f8a84, 0.8),
    coatM: std(0x8a7a66, 0.88),
    trousersM: std(0x23262d, 0.9),
    coatO: std(0x2b3036, 0.85),
    trousersO: std(0x3a3632, 0.9),
    shoe: std(0x141414, 0.7),
    sole: std(0x0b0b0b, 0.8),
    reflection: new THREE.MeshStandardMaterial({ color: 0x9fb2c8, roughness: 0.4, transparent: true, opacity: 0.32, depthWrite: false }),
    reflectionHead: new THREE.MeshStandardMaterial({ color: 0x9fb2c8, roughness: 0.4, transparent: true, opacity: 0.32, depthWrite: false, vertexColors: true }),
    crowdBody: std(0x22252b, 0.85),
    crowdHead: std(0x8a6a58, 0.6),
    phone: new THREE.MeshBasicMaterial({ color: 0x9cc4ff }),
  }
}
type Pal = ReturnType<typeof palette>

function look(m: Pal, name: string, kind: 'mira' | 'man' | 'reflection'): FigureLook {
  const base = { name, eye: m.eye, shoes: m.shoe, sole: m.sole, collar: 'crew' as const }
  if (kind === 'mira') return { ...base, build: 'f', face: { jaw: 0.14, nose: 0.13, lips: 0.07, stubble: 0 }, hairStyle: 'long', skin: m.skinM, skinHead: m.skinMHead, hair: m.hairM, top: m.coatM, bottom: m.trousersM, cuff: m.coatM, collar: 'mock', height: 0.95 }
  if (kind === 'man') return { ...base, build: 'm', face: { jaw: 0.34, nose: 0.22, lips: 0.04, stubble: 0.4 }, hairStyle: 'short', skin: m.skinO, skinHead: m.skinOHead, hair: m.hairO, top: m.coatO, bottom: m.trousersO, cuff: m.coatO }
  const r = m.reflection
  return { ...base, build: 'f', face: { jaw: 0.14, nose: 0.13, lips: 0.07, stubble: 0 }, hairStyle: 'long', skin: r, skinHead: m.reflectionHead, hair: r, top: r, bottom: r, cuff: r, shoes: r, sole: r, eye: r, collar: 'mock', height: 0.95 }
}

// ——— Paths ———

const P_WALK = makePath([
  [5.0, 8],
  [5.1, -4],
  [5.0, SHOP_Z + 2.5],
  [5.2, SHOP_Z],
])
const P_PAST_SHOP = makePath([
  [5.2, SHOP_Z],
  [5.0, -20],
])
const P_AGAIN = makePath([
  [5.0, 8],
  [5.1, -2],
  [5.0, -8],
])
const P_TO_CAFE = makePath([
  [5.0, -8],
  [4.8, -22],
  [0, -28],
  [-5.2, -30],
  [-7.2, -30],
  [-8.4, -30.4],
  [MIRA_AT_MAN.x, MIRA_AT_MAN.z],
])
const P_TO_GLASS = makePath([
  [MIRA_AT_MAN.x, MIRA_AT_MAN.z],
  [-12.2, -30.0],
  [-13.6, PANE_A],
])
const P_TO_PANE_B = makePath([
  [-13.6, PANE_A],
  [-13.6, PANE_B],
])
const P_TO_TERMINAL = makePath([
  [-13.6, PANE_B],
  [-11.0, -34.2],
  [-8.5, -34.55],
])
const P_OUT = makePath([
  [-8.5, -34.55],
  [-7.8, -31.5],
  [-6.0, -30.2],
  [-5.2, -33],
])
const P_ON = makePath([
  [-5.2, -33],
  [-5.0, -52],
])
const P_TO_DOOR = makePath([
  [-5.0, -52],
  [-1.5, -56.5],
  [0, -58.6],
])
const P_THROUGH = makePath([
  [0, -58.6],
  [0, -61.0],
  [0.6, -63.6],
])

/** Mira's whole state as a function of progress — so her reflection can be her a moment ago. */
function miraAt(a: Actor, p: number) {
  const seg = segmentAt(p).id as SegmentId
  const u = local(p, seg)
  a.begin()
  switch (seg) {
    case 'open':
    case 'walk':
    case 'phones':
    case 'shop': {
      const t = (p - SEG.open.start) / (SEG.shop.end - SEG.open.start)
      a.walk(P_WALK, smoothstep(0, 1, t), P.STAND, undefined, PI)
      break
    }
    case 'reflect':
      // She stops and turns to the window; turns back.
      a.place(5.2, SHOP_Z, lerp(PI, PI / 2 + 0.1, smoothstep(0.15, 0.4, u) * (1 - smoothstep(0.7, 0.92, u)))).hold(P.STAND)
      a.lookAt(6.5, SHOP_Z, smoothstep(0.2, 0.45, u) * (1 - smoothstep(0.65, 0.9, u)))
      break
    case 'corner':
      a.walk(P_PAST_SHOP, smoothstep(0, 1, u), P.STAND, PI)
      break
    case 'same':
      a.walk(P_AGAIN, smoothstep(0, 1, u), P.STAND, undefined, PI)
      break
    case 'enter':
      a.walk(P_TO_CAFE, smoothstep(0, 1, u), P.STAND, PI, -PI / 2)
      break
    case 'seen':
    case 'talk':
      a.place(MIRA_AT_MAN.x, MIRA_AT_MAN.z, -PI / 2).hold(seg === 'talk' ? P.STAND_EASY : P.STAND)
      break
    case 'glass':
      a.walk(P_TO_GLASS, smoothstep(0.05, 0.9, u), P.STAND, -PI / 2, -PI / 2)
      break
    case 'versions':
      if (u < 0.45) a.place(-13.6, PANE_A, -PI / 2).hold(P.STAND)
      else if (u < 0.65) a.walk(P_TO_PANE_B, (u - 0.45) / 0.2, P.STAND, -PI / 2, -PI / 2)
      else a.place(-13.6, PANE_B, -PI / 2).hold(P.STAND)
      break
    case 'observe':
    case 'nothing':
      a.place(-13.4, PANE_B, PI / 2 - 0.4).hold(P.ARMS_CROSSED)
      break
    case 'terminal':
      a.walk(P_TO_TERMINAL, smoothstep(0, 0.95, u), P.STAND, PI / 2, PI)
      break
    case 'words':
    case 'user':
      a.place(-8.5, -34.55, PI).hold(P.STAND)
      break
    case 'outside':
      // Out through the door; on the sidewalk she stops, and the city is there.
      a.walk(P_OUT, smoothstep(0, 0.75, u), P.STAND, 0, PI)
      if (u > 0.75) a.lookAt(-2, -38, Math.sin(PI * smoothstep(0.75, 1, u)) * 0.5)
      break
    case 'shift':
      a.walk(P_ON, smoothstep(0, 1, u), P.STAND, PI, PI)
      break
    case 'door':
      a.walk(P_TO_DOOR, smoothstep(0, 0.9, u), P.STAND, PI, PI)
      break
    case 'voice':
    case 'around':
      a.place(0, -58.6, PI).hold(P.STAND)
      if (seg === 'around') a.lookAt(-2, -58, Math.sin(PI * u) * 0.6)
      break
    case 'opens':
      a.place(0, -58.6, PI).hold(P.STAND)
      a.reach('r', smoothstep(0.1, 0.3, u) * (1 - smoothstep(0.5, 0.7, u)), -0.36, 1.0, WALL_Z + 0.08, 0.5)
      break
    case 'list':
    case 'watching':
      a.walk(P_THROUGH, seg === 'list' ? smoothstep(0, 0.6, u) : 1, P.STAND, PI, PI)
      break
    default:
      a.place(0.6, -63.6, PI).hold(P.STAND)
      a.visible = false
  }
  return a
}

// ——— The other cities ———

/** A window texture for daylit or ruined facades: white wall (tinted by the material), glass or holes. */
function facadeTexture(kind: 'day' | 'ruin') {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, 128, 128)
  const rand = mulberry32(kind === 'day' ? 61 : 62)
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 2; x++) {
      const broken = kind === 'ruin' && rand() < 0.35
      g.fillStyle = kind === 'day' ? (rand() < 0.3 ? '#7f9bb6' : '#5f7a96') : broken ? '#000000' : '#1a1715'
      g.fillRect(x * 64 + 14, y * 64 + 12, 36, broken ? 46 : 38)
      if (kind === 'day') {
        g.fillStyle = 'rgba(255,255,255,0.35)'
        g.fillRect(x * 64 + 14, y * 64 + 12, 36, 6)
      }
    }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/**
 * Another version of the city, seen through one of the cafe's panes: the same
 * street in daylight, or the same street after something ended. It carries its
 * own light (unlit, unfogged materials), and an inside-out sky box closes it in
 * so each pane shows only its own city.
 */
function otherCity(kind: 'day' | 'ruin', z0: number, z1: number) {
  const day = kind === 'day'
  const group = new THREE.Group()
  const X0 = -14.65
  const X1 = -64
  const depth = z0 - z1
  const zc = (z0 + z1) / 2
  const flat = (color: THREE.ColorRepresentation, extra: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color, fog: false, ...extra })
  const rand = mulberry32(day ? 41 : 43)

  // Sky: zenith to horizon, all around.
  const skyGeo = new THREE.BoxGeometry(X0 - X1, 70, depth, 1, 14, 1)
  const top = new THREE.Color(day ? 0x5f93cc : 0x1c0a08)
  const horizon = new THREE.Color(day ? 0xdde8f0 : 0xb0603e)
  const pos = skyGeo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const col = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + 33
    col.copy(horizon).lerp(top, Math.pow(THREE.MathUtils.clamp(y / 34, 0, 1), 0.6))
    col.toArray(colors, i * 3)
  }
  skyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const sky = new THREE.Mesh(skyGeo, flat(0xffffff, { vertexColors: true, side: THREE.BackSide }))
  sky.position.set((X0 + X1) / 2, 33, zc)
  group.add(sky)

  // Ground: a sidewalk under the panes, the road, the far sidewalk.
  const strip = (xa: number, xb: number, color: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(xa - xb, depth), flat(color))
    m.rotation.x = -PI / 2
    m.position.set((xa + xb) / 2, 0.02, zc)
    group.add(m)
  }
  strip(X0, -18.5, day ? 0xbdb6aa : 0x3b332e)
  strip(-18.5, -27, day ? 0x6f6e6c : 0x27211e)
  strip(-27, X1, day ? 0xaaa398 : 0x302925)
  if (day)
    for (let z = z0 - 1; z > z1; z -= 4) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2), flat(0xe8e4dc))
      dash.rotation.x = -PI / 2
      dash.position.set(-22.75, 0.03, z)
      group.add(dash)
    }

  // Buildings across the road, and a taller row behind.
  const tex = facadeTexture(kind)
  const shades = day ? [0xe0d3bd, 0xcdbda4, 0xeae2d2, 0xc9b49a] : [0x4a413c, 0x3d3532, 0x544841, 0x352e2b]
  for (const [front, minH, maxH, deep] of [
    [-29, 9, 17, 7],
    [-42, 18, 36, 9],
  ] as const) {
    let z = z0
    while (z > z1 + 0.5) {
      const w = Math.min(6 + rand() * 6, z - z1)
      const h = (minH + rand() * (maxH - minH)) * (day ? 1 : 0.5 + rand() * 0.35)
      const base = new THREE.Color(shades[Math.floor(rand() * shades.length)])
      const map = tex.clone()
      map.repeat.set(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 3)))
      map.needsUpdate = true
      const side = base.clone().multiplyScalar(day ? 0.78 : 0.62)
      const mats = [flat(base, { map }), flat(side), flat(base.clone().multiplyScalar(1.06)), flat(0x000000), flat(side), flat(side.clone().multiplyScalar(0.86))]
      const b = new THREE.Mesh(new THREE.BoxGeometry(deep, h, w - 0.5), mats)
      b.position.set(front - deep / 2, h / 2, z - w / 2)
      group.add(b)
      if (!day) {
        // Broken tops: slabs and chunks, at angles.
        for (let k = 0; k < 3; k++) {
          const s = 0.8 + rand() * 2.4
          const chunk = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.7, s * 1.2), mats[2])
          chunk.position.set(front - deep * rand(), h + s * 0.15, z - w * rand())
          chunk.rotation.set(rand() * 0.8, rand() * PI, rand() * 0.8)
          group.add(chunk)
        }
      }
      z -= w
    }
  }

  let update: (time: number) => void
  if (day) {
    // Trees along the sidewalk, and people walking in daylight.
    for (let z = z0 - 2.5; z > z1; z -= 7) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 2.4, 6), flat(0x5b4636))
      trunk.position.set(-18.1, 1.2, z)
      const crownGeo = new THREE.IcosahedronGeometry(1.0, 0)
      const cc = new Float32Array(crownGeo.attributes.position.count * 3)
      for (let i = 0; i < cc.length; i += 9) {
        col.setHSL(0.27 + rand() * 0.05, 0.35, 0.3 + rand() * 0.14)
        for (let v = 0; v < 3; v++) col.toArray(cc, i + v * 3)
      }
      crownGeo.setAttribute('color', new THREE.BufferAttribute(cc, 3))
      const crown = new THREE.Mesh(crownGeo, flat(0xffffff, { vertexColors: true }))
      crown.position.set(-18.1, 2.9, z)
      crown.scale.set(1, 1.15, 1)
      group.add(trunk, crown)
    }
    const people = Array.from({ length: 6 }, (_, i) => {
      const p = new THREE.Group()
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.95, 3, 8), flat([0x3b4250, 0x6b4f3e, 0x2f3a33, 0x7a6a5a][i % 4]))
      body.position.y = 0.8
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), flat(0xc69c80))
      head.position.y = 1.58
      p.add(body, head)
      group.add(p)
      return { p, x: i % 2 ? -19.0 : -28.2, speed: 0.9 + rand() * 0.5, phase: rand() * depth, dir: i % 3 ? 1 : -1 }
    })
    update = (time) => {
      for (const w of people) {
        const s = (w.phase + time * w.speed) % depth
        w.p.position.set(w.x, Math.abs(Math.sin(time * w.speed * 4)) * 0.03, w.dir > 0 ? z1 + s : z0 - s)
      }
    }
  } else {
    // Haze in layers, and ash falling.
    for (const [x, o] of [
      [-25, 0.14],
      [-38, 0.3],
      [-53, 0.45],
    ] as const) {
      const haze = new THREE.Mesh(new THREE.PlaneGeometry(depth, 24), flat(0xb0603e, { transparent: true, opacity: o, depthWrite: false }))
      haze.rotation.y = PI / 2
      haze.position.set(x, 12, zc)
      group.add(haze)
    }
    const N = 260
    const seeds = Array.from({ length: N }, () => [rand(), rand(), rand(), rand()] as const)
    const ashPos = new Float32Array(N * 3)
    const ashGeo = new THREE.BufferGeometry()
    ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3))
    const ash = new THREE.Points(ashGeo, new THREE.PointsMaterial({ color: 0xa69a92, size: 0.07, fog: false, transparent: true, opacity: 0.85, depthWrite: false }))
    ash.frustumCulled = false
    group.add(ash)
    update = (time) => {
      for (let i = 0; i < N; i++) {
        const [a, b, c, d] = seeds[i]
        const y = 14 - ((b * 14 + time * (0.25 + d * 0.3)) % 14)
        ashPos[i * 3] = -15.2 - a * 26 + Math.sin(time * 0.5 + d * 9) * 0.4
        ashPos[i * 3 + 1] = y
        ashPos[i * 3 + 2] = z1 + c * depth
      }
      ashGeo.attributes.position.needsUpdate = true
    }
  }
  return { group, update }
}

// ——— Screens ———

function terminalDraw(n: number) {
  const words = ['OBSERVER', 'SUBJECT', 'ENVIRONMENT', 'USER']
  return (c: CanvasRenderingContext2D, W: number, H: number) => {
    c.fillStyle = '#050a07'
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#7dd99a'
    mono(c, 34, 500)
    for (let i = 0; i < n; i++) c.fillText(`> ${words[i]}`, 30, 70 + i * 52)
    if (n < 4) c.fillRect(30 + (n > 0 ? 0 : 0), 52 + n * 52, 18, 28)
  }
}

function listDraw(stage: 'list' | 'user' | 'watching' | 'off') {
  return (c: CanvasRenderingContext2D, W: number, H: number) => {
    c.fillStyle = '#050505'
    c.fillRect(0, 0, W, H)
    if (stage === 'off') return
    if (stage === 'watching') {
      c.fillStyle = '#ece8e1'
      sans(c, 72, 300)
      c.textAlign = 'center'
      c.fillText('WHO IS WATCHING?', W / 2, H / 2 + 24)
      c.textAlign = 'left'
      return
    }
    c.fillStyle = '#7b7670'
    sans(c, 22, 500)
    c.fillText('S T R O L L Y   ·   H İ K Â Y E L E R', 80, 80)
    STORY_ORDER.forEach((id, i) => {
      c.fillStyle = '#d9d4cc'
      mono(c, 26, 400)
      c.fillText(String(i + 1).padStart(2, '0'), 80, 170 + i * 62)
      sans(c, 40, 300)
      c.fillText(STORIES[id].meta.title, 150, 172 + i * 62)
    })
    if (stage === 'user') {
      const y = 172 + STORY_ORDER.length * 62
      c.fillStyle = '#8fb8ff'
      mono(c, 26, 400)
      c.fillText(String(STORY_ORDER.length + 1).padStart(2, '0'), 80, y - 2)
      sans(c, 40, 300)
      c.fillText('USER', 150, y)
    }
  }
}

const SHOTS: Partial<Record<SegmentId, ShotKeys>> = {
  open: [[0, [2.0, 1.7, 13.5, 5.0, 1.4, 0, 46]]],
  walk: [
    [0, [2.0, 1.7, 13.5, 5.0, 1.4, 0, 46]],
    [1, [1.2, 1.7, 2.5, 5.0, 1.3, -10, 46]],
  ],
  phones: [
    [0, [1.0, 1.65, -1.5, 5.0, 1.3, -12, 46]],
    [1, [0.8, 1.6, -4.5, 5.0, 1.3, -14, 44]],
  ],
  shop: [
    [0, [2.6, 1.6, -6.5, 5.6, 1.4, -15, 42]],
    [1, [2.8, 1.6, -9.5, 5.6, 1.4, -15, 40]],
  ],
  reflect: [
    [0, [3.4, 1.62, -12.0, 6.4, 1.55, -14.6, 38]],
    [1, [3.5, 1.6, -12.3, 6.4, 1.55, -14.6, 34]],
  ],
  corner: [
    [0, [2.0, 1.7, -10.5, 5.0, 1.3, -22, 46]],
    [1, [2.2, 1.7, -12.5, 6.5, 1.3, -24, 46]],
  ],
  same: [
    [0, [2.0, 1.7, 13.5, 5.0, 1.4, 0, 46]],
    [1, [1.4, 1.7, 5.0, 5.0, 1.4, -8, 46]],
  ],
  // (Before 0.78 the camera pans with her from across the street; see frame().)
  enter: [
    [0.78, [-13.8, 1.68, -26.7, -7.0, 1.35, -30.4, 48]],
    [1, [-13.7, 1.66, -26.9, -8.8, 1.3, -30.8, 46]],
  ],
  seen: [
    [0, [-7.6, 1.7, -27.2, -10.5, 1.3, -31, 50]],
    [1, [-8.4, 1.62, -28.6, -11.0, 1.25, -31.2, 42]],
  ],
  talk: [
    [0, [-8.6, 1.6, -29.0, -11.0, 1.3, -31.2, 40]],
    [1, [-9.0, 1.58, -29.4, -11.0, 1.3, -31.2, 36]],
  ],
  glass: [
    [0, [-9.0, 1.65, -28.4, -14.5, 1.6, -30.0, 46]],
    [1, [-11.2, 1.7, -28.0, -15.5, 1.6, -29.5, 46]],
  ],
  versions: [
    [0, [-11.6, 1.7, -28.3, -16.5, 1.7, -29.5, 44]],
    [0.5, [-11.6, 1.7, -30.0, -16.5, 1.7, -32.0, 44]],
    [1, [-11.8, 1.7, -32.0, -16.5, 1.7, -33.5, 42]],
  ],
  observe: [
    [0, [-10.0, 1.6, -33.2, -12.6, 1.4, -32.6, 42]],
    [1, [-10.3, 1.58, -33.4, -12.6, 1.4, -32.6, 38]],
  ],
  nothing: [
    [0, [-12.4, 1.6, -32.4, -7.0, 1.5, -31.0, 50]],
    [1, [-12.4, 1.6, -32.4, -7.0, 1.5, -31.0, 50]],
  ],
  terminal: [
    [0, [-11.0, 1.7, -31.5, -8.5, 1.2, -35.3, 44]],
    [1, [-9.6, 1.7, -32.8, -8.5, 1.15, -35.3, 40]],
  ],
  words: [
    [0, [-7.7, 1.64, -33.45, -8.6, 1.2, -35.3, 34]],
    [1, [-7.8, 1.6, -33.65, -8.6, 1.2, -35.3, 30]],
  ],
  user: [
    [0, [-7.35, 1.58, -35.0, -8.4, 1.45, -34.7, 38]],
    [1, [-7.45, 1.56, -35.0, -8.45, 1.47, -34.65, 34]],
  ],
  // (outside: a fixed camera on the street turning with her; see frame().)
  shift: [
    [0, [-2.6, 1.7, -36.0, 6.0, 3.0, -47.0, 52]],
    [0.5, [-2.4, 1.7, -40.0, -4.0, 1.5, -50.0, 50]],
    [1, [-2.2, 1.7, -44.0, 6.0, 3.0, -48.0, 52]],
  ],
  door: [
    [0, [-1.5, 1.7, -50.0, 0, 1.6, -60, 46]],
    [1, [-0.4, 1.7, -55.5, 0, 1.6, -60, 44]],
  ],
  voice: [
    [0, [1.0, 1.65, -56.4, 0, 1.4, -60, 40]],
    [1, [0.8, 1.62, -56.9, 0, 1.4, -60, 36]],
  ],
  around: [
    [0, [0.8, 1.62, -56.9, 0, 1.4, -60, 40]],
    [1, [1.6, 1.62, -57.2, -0.4, 1.4, -60, 44]],
  ],
  opens: [
    [0, [0.6, 1.66, -56.6, 0, 1.4, -62, 44]],
    [1, [0.3, 1.66, -57.3, 0, 1.5, -66, 44]],
  ],
  list: [
    [0, [0.3, 1.66, -57.3, 0, 1.6, -66, 44]],
    [1, [0.0, 1.62, -62.4, SCREEN.x, SCREEN.y, SCREEN.z, 46]],
  ],
  watching: [
    [0, [0.0, 1.62, -62.4, SCREEN.x, SCREEN.y, SCREEN.z, 46]],
    [1, [0.0, 1.6, -63.0, SCREEN.x, SCREEN.y, SCREEN.z, 42]],
  ],
  turn: [[0, [0.0, 1.6, -63.0, SCREEN.x, SCREEN.y, SCREEN.z, 42]]],
  chair: [[0, [0.0, 1.6, -63.0, SCREEN.x, SCREEN.y, SCREEN.z, 42]]],
  end: [[0, [0.0, 1.6, -63.0, SCREEN.x, SCREEN.y, SCREEN.z, 42]]],
}

class EsikDirector implements SetDirector {
  private pal = palette()
  private mira!: Actor
  private reflection!: Actor
  private man!: Actor
  private crowd!: Crowd
  private cars: THREE.Group[] = []
  private parked!: { red: THREE.Group; blue: THREE.Group }
  private plate!: ReturnType<typeof canvasPlane>
  private clock!: ReturnType<typeof canvasPlane>
  private terminal!: ReturnType<typeof canvasPlane>
  private list!: ReturnType<typeof canvasPlane>
  private paper!: ReturnType<typeof canvasPlane>
  private gate!: ReturnType<typeof door>
  private changer: THREE.Group[] = []
  private changerState = 0
  private changerAway = 0
  private changerSeen = false
  private versions = new THREE.Group()
  private backRoom = new THREE.Group()
  private chair!: THREE.Group
  private chairLight!: THREE.SpotLight
  private roomGlow!: THREE.PointLight
  private shopLight!: THREE.PointLight
  private street = new THREE.Group()
  private dayCity!: ReturnType<typeof otherCity>
  private ruinCity!: ReturnType<typeof otherCity>
  private cafeLights: THREE.PointLight[] = []
  private lampLights: THREE.PointLight[] = []
  private hemi!: THREE.HemisphereLight
  private v = new THREE.Vector3()

  build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.pal
    scene.environment = ctx.environment
    scene.environmentIntensity = 0.08
    scene.background = new THREE.Color(0x03050a)
    scene.fog = new THREE.FogExp2(0x05070d, 0.022)

    // ——— The street ——— (its lights stay in the scene: hiding a light recompiles every material)
    const street = this.street
    scene.add(street)
    const road = mesh(new THREE.PlaneGeometry(8, 90), m.asphalt, 0, 0, -26, street)
    road.rotation.x = -PI / 2
    for (const sx of [-1, 1]) {
      const walk = mesh(new THREE.PlaneGeometry(2.5, 90), m.sidewalk, sx * 5.25, 0.08, -26, street)
      walk.rotation.x = -PI / 2
      box(0.2, 0.16, 90, m.curb, sx * 4.05, 0.08, -26, street)
    }
    for (let i = 0; i < 6; i++) box(0.15, 0.01, 2.2, m.curb, 0, 0.005, 8 - i * 12, street)
    const rand = mulberry32(17)
    // Facades: blocks along both sides, leaving room for the shop, the cafe and the changing building.
    type Block = { x: number; y: number; z: number; w: number; h: number; d: number; wall: THREE.Material; facing: 1 | -1 }
    const facades: Block[] = []
    const reserved: Record<-1 | 1, Array<[number, number]>> = {
      [-1]: [[-36, -26]],
      [1]: [
        [SHOP_Z - 3.3, SHOP_Z + 3.3],
        [CHANGER.z - 6, CHANGER.z + 6],
      ],
    }
    for (const sx of [-1, 1] as const) {
      let z = 14
      let k = 0
      while (z > -58) {
        let w = 7 + rand() * 5
        const hole = reserved[sx].find(([lo, hi]) => z > lo && z - w < hi)
        if (hole) {
          if (z <= hole[1] + 0.01) {
            z = hole[0]
            continue
          }
          w = z - hole[1]
        }
        const h = 10 + rand() * 14
        facades.push({ x: sx * 9.5, y: 0, z: z - w / 2, w, h, d: 6, wall: [m.facadeA, m.facadeB, m.facadeC][k % 3], facing: sx === 1 ? -1 : 1 })
        z -= w
        k++
      }
    }
    // Upper floors above the shop and the cafe.
    facades.push({ x: 9.5, y: 4, z: SHOP_Z, w: 6.6, h: 12, d: 6, wall: m.facadeB, facing: -1 }, { x: -10.5, y: 3.2, z: -31, w: 10, h: 9, d: 8, wall: m.facadeC, facing: 1 })
    facades.forEach(({ x, y, z, w, h, d, wall, facing }, i) => {
      const f = facade({ w, h, d, wall, facing, seed: 100 + i, lit: 0.25 + rand() * 0.2, ground: y === 0 })
      f.position.set(x, y, z)
      street.add(f)
    })
    // The shop window on the east side, lit from within.
    box(4.6, 4, 0.3, m.facadeB, 8.8, 2, SHOP_Z + 3.15, street)
    box(4.6, 4, 0.3, m.facadeB, 8.8, 2, SHOP_Z - 3.15, street)
    box(0.3, 1.0, 6, m.facadeB, 6.65, 3.5, SHOP_Z, street)
    box(0.3, 0.3, 6, m.facadeB, 6.65, 0.15, SHOP_Z, street)
    const shopBack = mesh(new THREE.PlaneGeometry(6, 4), m.shopGlow, 10.9, 2, SHOP_Z, street)
    shopBack.rotation.y = -PI / 2
    this.shopLight = new THREE.PointLight(0xdfe8ff, 10, 8, 1.5)
    this.shopLight.position.set(9, 2.6, SHOP_Z)
    scene.add(this.shopLight)
    mesh(new THREE.PlaneGeometry(5.6, 2.9), m.glass, 6.5, 1.75, SHOP_Z, street).rotation.y = -PI / 2
    for (let i = 0; i < 4; i++) box(0.6, 1.1 + (i % 2) * 0.4, 0.5, m.trim, 9.5, 0.55 + (i % 2) * 0.2, SHOP_Z - 2 + i * 1.3, street)
    // The number plate and the street clock (they will not be the same next time).
    this.plate = canvasPlane(0.42, 0.3, 256, () => {}, { emissive: true })
    this.plate.mesh.position.set(6.48, 3.0, -6)
    this.plate.mesh.rotation.y = -PI / 2
    street.add(this.plate.mesh)
    cyl(0.06, 0.07, 3.0, m.metal, 4.5, 1.5, -11, street, 10)
    box(0.5, 0.36, 0.12, m.metal, 4.5, 3.15, -11, street)
    this.clock = canvasPlane(0.42, 0.26, 256, () => {}, { emissive: true })
    this.clock.mesh.position.set(4.5, 3.15, -10.93)
    street.add(this.clock.mesh)
    // Streetlights.
    for (let i = 0; i < 7; i++) {
      const sx = i % 2 ? 1 : -1
      const lamp = streetLamp(m.metal, m.lampHead)
      lamp.position.set(sx * 4.35, 0, 6 - i * 10)
      lamp.rotation.y = sx === 1 ? PI : 0
      street.add(lamp)
      if (i % 2 === 0 || ctx.quality.tier !== 'low') {
        const l = new THREE.PointLight(0xffc98a, 22, 16, 1.4)
        l.position.set(sx * 3.5, 4.7, 6 - i * 10)
        this.lampLights.push(l)
        scene.add(l)
      }
    }
    // Cars: two passing, one parked (red, and later blue).
    for (const body of [m.carGrey, m.carGrey]) {
      const c = car(body, m.carGlass, m.tire, m.carLight)
      street.add(c)
      this.cars.push(c)
    }
    const red = car(m.carRed, m.carGlass, m.tire, m.carLight)
    const blue = car(m.carBlue, m.carGlass, m.tire, m.carLight)
    for (const c of [red, blue]) {
      c.position.set(-3.0, 0, -8)
      street.add(c)
    }
    this.parked = { red, blue }

    // ——— The changing building (east side, z −47) ———
    const looks: Array<[THREE.Material, number, number]> = [
      [m.facadeA, 16, 201],
      [m.facadeC, 26, 202],
      [m.facadeB, 11, 203],
    ]
    for (const [wall, h, seed] of looks) {
      const f = facade({ w: 12, h, d: 6, wall, facing: -1, seed, lit: 0.4 })
      f.position.set(CHANGER.x, 0, CHANGER.z)
      f.visible = false
      street.add(f)
      this.changer.push(f)
    }

    // ——— The cafe ———
    const cafe = room({
      w: 8,
      d: 10,
      h: 3.2,
      x: -10.5,
      z: -31,
      wall: m.cafeWall,
      floor: m.cafeFloor,
      ceiling: m.ceiling,
      openings: [
        { side: 'e', at: 1, width: 1.1, height: 2.2 },
        { side: 'e', at: -2.2, width: 3, height: 1.6, bottom: 0.8 },
        { side: 'w', at: PANE_A + 31, width: 2.6, height: 2.4, bottom: 0.3 },
        { side: 'w', at: PANE_B + 31, width: 2.6, height: 2.4, bottom: 0.3 },
      ],
    })
    scene.add(cafe)
    mesh(new THREE.PlaneGeometry(3, 1.6), m.glass, -6.5, 1.6, -33.2, scene).rotation.y = PI / 2
    for (const z of [PANE_A, PANE_B]) mesh(new THREE.PlaneGeometry(2.6, 2.4), m.glass, -14.5, 1.5, z, scene).rotation.y = PI / 2
    const t = table(0.9, 0.7, 0.75, m.wood, m.darkWood)
    t.position.set(-10.5, 0, MAN.z)
    scene.add(t)
    const c1 = chair(m.chair)
    c1.position.set(MAN.x, 0, MAN.z)
    c1.rotation.y = PI / 2
    scene.add(c1)
    for (const [x, z] of [
      [-12.6, -27.5],
      [-8.2, -27.2],
      [-12.8, -34.6],
    ] as const) {
      const tt = table(0.7, 0.7, 0.75, m.wood, m.darkWood)
      tt.position.set(x, 0, z)
      scene.add(tt)
    }
    const ctr = counter(3.0, 0.6, 1.05, m.wood, m.darkWood)
    ctr.position.set(-8.6, 0, -35.55)
    scene.add(ctr)
    box(0.42, 0.3, 0.3, m.darkWood, TERMINAL.x, 1.25, TERMINAL.z - 0.08, scene)
    this.terminal = canvasPlane(0.36, 0.24, 512, terminalDraw(0), { emissive: true })
    this.terminal.mesh.position.copy(TERMINAL).setY(1.25)
    this.terminal.mesh.position.z += 0.075
    scene.add(this.terminal.mesh)
    for (const [x, z] of [
      [-10.5, -28.5],
      [-10.5, -33.5],
    ] as const) {
      const l = new THREE.PointLight(0xffc28a, 8, 8, 1.6)
      l.position.set(x, 2.9, z)
      this.cafeLights.push(l)
      scene.add(l)
    }

    // A sign over the cafe door.
    const cafeSign = canvasPlane(1.3, 0.36, 512, (c, W, H) => {
      c.fillStyle = '#120d0a'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#ffcf8f'
      sans(c, 92, 300)
      c.textAlign = 'center'
      c.fillText('K A F E', W / 2, H * 0.72)
    }, { emissive: true })
    cafeSign.mesh.position.set(-6.4, 2.72, -30)
    cafeSign.mesh.rotation.y = PI / 2
    scene.add(cafeSign.mesh)

    // ——— Other versions of the city, behind the panes ———
    this.dayCity = otherCity('day', -12, -31.5)
    this.ruinCity = otherCity('ruin', -31.5, -52)
    this.versions.add(this.dayCity.group, this.ruinCity.group)
    scene.add(this.versions)

    // ——— The wall across the street, its door, the room behind ———
    for (const [x, w] of [
      [-5.25, 9.5],
      [5.25, 9.5],
    ] as const) box(w, 7, 0.4, m.wall, x, 3.5, WALL_Z - 0.2, scene)
    box(1.0, 4.85, 0.4, m.wall, 0, 4.575, WALL_Z - 0.2, scene)
    this.gate = door({ w: 0.92, h: 2.12, frame: m.trim, leaf: m.door, handle: m.brass })
    this.gate.group.position.set(0, 0, WALL_Z + 0.02)
    scene.add(this.gate.group)
    const sign = canvasPlane(1.4, 0.3, 512, (c, W, H) => {
      c.fillStyle = '#0d0c0b'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#d44a35'
      mono(c, 54, 600)
      c.textAlign = 'center'
      c.fillText('DO NOT OPEN', W / 2, H * 0.68)
    }, { emissive: true })
    sign.mesh.position.set(0, 2.55, WALL_Z + 0.03)
    scene.add(sign.mesh)
    const back = room({ w: 6, d: 8, h: 3.2, x: 0, z: WALL_Z - 4.2, wall: m.room, floor: m.room, ceiling: m.room, skip: ['s'] })
    this.backRoom.add(back)
    this.list = canvasPlane(3.2, 1.8, 1024, listDraw('off'), { emissive: true })
    this.list.mesh.position.copy(SCREEN)
    this.backRoom.add(this.list.mesh)
    this.chair = chair(m.chair)
    this.chair.position.copy(CHAIR)
    this.chair.rotation.y = PI
    this.paper = canvasPlane(0.36, 0.22, 512, (c, W, H) => {
      c.fillStyle = '#efe9dc'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#26221e'
      mono(c, 44, 600)
      c.textAlign = 'center'
      c.fillText('THANK YOU', W / 2, H * 0.42)
      c.fillText('FOR OBSERVING.', W / 2, H * 0.78)
    })
    // On the seat, readable from where the view will turn to.
    this.paper.mesh.rotation.set(-PI / 2, 0, 0.08)
    this.paper.mesh.position.set(0, 0.476, 0.01)
    this.chair.add(this.paper.mesh)
    this.backRoom.add(this.chair)
    scene.add(this.backRoom)
    // The room's lights live outside it (hiding a light recompiles every material); they are dimmed instead.
    this.roomGlow = new THREE.PointLight(0x8fb8ff, 0, 9, 1.4)
    this.roomGlow.position.set(0, 2.2, -65.5)
    // When the view turns, one cold light on the empty chair.
    this.chairLight = new THREE.SpotLight(0xdde4ee, 0, 5, 0.42, 0.75, 1.2)
    this.chairLight.position.set(0, 3.05, -62.1)
    this.chairLight.target.position.set(CHAIR.x, 0.45, CHAIR.z)
    scene.add(this.roomGlow, this.chairLight, this.chairLight.target)

    // ——— Light and people ———
    this.hemi = new THREE.HemisphereLight(0x2a3550, 0x0a0a0c, 0.35)
    scene.add(this.hemi)
    const mira = new Figure(look(m, 'Mira', 'mira'))
    const refl = new Figure(look(m, 'Yansıma', 'reflection'))
    refl.root.traverse((o) => (o.castShadow = false))
    const man = new Figure(look(m, 'Adam', 'man'))
    scene.add(mira.root, refl.root, man.root)
    this.mira = new Actor(mira)
    this.reflection = new Actor(refl)
    this.man = new Actor(man)
    this.crowd = new Crowd(CROWD, m.crowdBody, m.crowdHead, m.phone)
    scene.add(this.crowd.group)
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)

    // ——— Mira, and the one in the glass ———
    miraAt(this.mira, f.p)
    // The reflection is her a moment ago — but only once, and only for a moment.
    const lag = seg === 'reflect' ? 0.012 * Math.sin(PI * smoothstep(0.3, 0.8, u)) : 0
    miraAt(this.reflection, f.p - lag)
    const r = this.reflection
    r.x = 13 - r.x
    r.yaw = -r.yaw
    r.look = -r.look
    r.visible = f.p >= SEG.shop.start && f.p < SEG.corner.start + SEG.corner.len * 0.4

    // ——— The man ———
    const man = this.man.begin()
    man.place(MAN.x, MAN.z, PI / 2).hold(P.SIT_READ)
    if (seg === 'seen' || seg === 'talk') man.blend([
      [0.1, P.SIT_READ],
      [0.35, P.SIT_LOOK],
    ], seg === 'talk' ? 1 : u).lookAt(MIRA_AT_MAN.x, MIRA_AT_MAN.z, 0.6)
    else if (seg === 'glass') man.walk(P_TO_GLASS, smoothstep(0, 0.85, u), P.STAND, PI / 2, -PI / 2).place(man.x - 0.3, man.z + 0.9, man.yaw)
    else if (seg === 'versions' || seg === 'observe' || seg === 'nothing') man.place(-13.2, -31.2, -2.2).hold(P.STAND_EASY).lookAt(this.mira.x, this.mira.z, 0.8)
    else if (f.p >= SEG.terminal.start && f.p < SEG.outside.start) man.place(-13.2, -31.2, -0.9).hold(P.ARMS_CROSSED)
    man.visible = f.p >= SEG.enter.start && f.p < SEG.outside.start

    // ——— Crowd: everyone looks at a phone; nobody at her ———
    this.placeCrowd(f, seg)

    // ——— The same street, not the same ———
    const again = f.p >= SEG.same.start
    this.parked.red.visible = !again
    this.parked.blue.visible = again
    this.plate.redraw((c, W, H) => {
      c.fillStyle = '#1b2733'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#e6ecf7'
      sans(c, 120, 500)
      c.textAlign = 'center'
      c.fillText(again ? '32' : '23', W / 2, H * 0.72)
    }, again ? 'b' : 'a')
    this.clock.redraw((c, W, H) => {
      c.fillStyle = '#05070a'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#ffb46a'
      mono(c, 96, 500)
      c.textAlign = 'center'
      c.fillText(again ? '01:41' : '01:14', W / 2, H * 0.72)
    }, again ? 'b' : 'a')
    // Passing cars, as a function of progress (so scrolling back brings them back).
    this.cars.forEach((c, i) => {
      const t = (f.p * 40 + i * 0.5) % 1
      c.position.set(i ? 2.0 : -2.0, 0, i ? lerp(-60, 20, t) : lerp(20, -60, t))
      c.rotation.y = i ? 0 : PI
      c.visible = f.p < SEG.door.start
    })

    // ——— The building that changes only when unobserved ———
    this.v.set(CHANGER.x - 3, 4, CHANGER.z)
    const seen = f.inView(this.v, 4)
    this.changerAway = seen ? 0 : this.changerAway + f.dt
    if (f.p < SEG.shift.start) {
      this.changerState = 0
      this.changerSeen = false
    } else if (f.p < SEG.door.start) {
      if (seen) this.changerSeen = true
      if (this.changerSeen && this.changerAway > 0.4) {
        this.changerState = (this.changerState + 1) % this.changer.length
        this.changerSeen = false
      }
    }
    this.changer.forEach((g, i) => (g.visible = i === this.changerState))

    // ——— Screens and doors ———
    const words = seg === 'words' ? 1 + Math.floor(smoothstep(0.05, 0.85, u) * 3.99) : f.p >= SEG.user.start ? 4 : 0
    this.terminal.redraw(terminalDraw(words), `w${words}`)
    const open = seg === 'opens' ? smoothstep(0.3, 0.8, u) : f.p >= SEG.list.start ? 1 : 0
    this.gate.leaf.rotation.y = open * 1.5
    this.backRoom.visible = open > 0.01
    const listStage = seg === 'list' ? (u > 0.45 ? 'user' : 'list') : seg === 'watching' ? (u < 0.12 ? 'user' : 'watching') : 'off'
    this.list.redraw(listDraw(listStage), listStage)
    // The other cities exist only while she is inside (the street must not see a daylit sky).
    this.versions.visible = (seg === 'enter' && u >= 0.78) || (f.p >= SEG.seen.start && f.p < SEG.outside.start)
    if (this.versions.visible) {
      this.dayCity.update(f.time)
      this.ruinCity.update(f.time)
    }
    // "Who observes you?" — and behind her, through the cafe's own window, there is nothing at all.
    const nothing = seg === 'nothing'
    this.street.visible = !nothing
    // At the turn the watched one is gone; only the chair is left, with its note.
    if (f.p >= SEG.turn.start) this.mira.visible = false
    this.chair.visible = f.p >= SEG.turn.start

    // ——— Light ———
    const inCafe = f.p >= SEG.enter.start && f.p < SEG.shift.start
    for (const l of this.cafeLights) l.intensity = inCafe ? 8 : 0
    const dark = smoothstep(SEG.watching.start, SEG.turn.start + SEG.turn.len * 0.3, f.p)
    for (const l of this.lampLights) l.intensity = nothing ? 0 : 22 * (1 - dark)
    this.shopLight.intensity = nothing || f.p >= SEG.door.start ? 0 : 10
    this.hemi.intensity = 0.35 * (1 - 0.7 * dark)
    this.roomGlow.intensity = 4 * open
    this.chairLight.intensity = 9 * smoothstep(SEG.turn.start + SEG.turn.len * 0.15, SEG.turn.start + SEG.turn.len * 0.55, f.p)

    this.mira.apply(f.time, !f.reduced)
    this.reflection.apply(f.time, false)
    man.apply(f.time, !f.reduced)

    // ——— Camera ———
    if (seg === 'walk' || seg === 'phones' || seg === 'same' || seg === 'shift') {
      // Walk with her, a little behind and to the street side.
      const a = this.mira
      // (Between the sidewalk and the passing lane, so no car drives through the lens.)
      shot.pos.set(a.x - Math.sign(a.x) * 1.5, 1.68, a.z + 3.6)
      shot.tgt.set(a.x + (seg === 'shift' ? 6 : 0.2), seg === 'shift' ? 3.4 : 1.35, a.z - 6)
      shot.fov = 46
      if (seg === 'same') shot.tgt.set(a.x + 1.4, 1.8, a.z - 5)
    } else if ((seg === 'enter' && u < 0.78) || seg === 'outside') {
      // A camera on the street, turning with her: across to the cafe door, and out again.
      if (seg === 'enter') shot.pos.set(-1.5, 1.75, -19.5)
      else shot.pos.set(-1.8, 1.72, -38.5)
      shot.tgt.set(this.mira.x, 1.3, this.mira.z)
      shot.fov = 44
    } else keyed(SHOTS[seg] ?? SHOTS.open!, held(u, f.reduced), shot)
    shot.fade = seg === 'open' ? 0 : seg === 'walk' ? smoothstep(0, 0.2, u) : seg === 'corner' ? 1 - 0.85 * Math.sin(PI * smoothstep(0.55, 1, u)) : seg === 'same' ? smoothstep(0, 0.15, u) : seg === 'end' ? 1 - smoothstep(0, 0.35, u) : 1
    // "Who is watching?" — the view turns, slowly, toward whoever is behind. Then it is theirs again.
    if (seg === 'turn' && u > 0.05 && u < 0.5) shot.request = { id: 'esik-turn', yaw: PI, pitch: -0.42, seconds: 4.5 }
    if (seg === 'turn' || seg === 'chair' || seg === 'end') shot.handheld = 0.4
  }

  private placeCrowd(f: SetFrame, seg: SegmentId) {
    const c = this.crowd
    const col = new THREE.Color()
    const rand = mulberry32(9)
    const allAtOnce = seg === 'phones' ? 1 : 0
    for (let i = 0; i < CROWD; i++) {
      const sx = rand() < 0.5 ? -1 : 1
      const z0 = 10 - rand() * 60
      const drift = (rand() - 0.5) * 0.8
      const walking = rand() < 0.4
      const z = walking ? z0 - ((f.p * 30 + i) % 1) * 4 : z0
      // Facing away from wherever Mira is, always slightly down at the screen.
      const yaw = (rand() - 0.5) * 0.8 + (rand() < 0.5 ? 0 : PI)
      col.setHSL(0.6 + rand() * 0.1, 0.08, 0.12 + rand() * 0.1)
      const glowing = allAtOnce || rand() < 0.7
      c.set(i, sx * (5.1 + drift), z, yaw, { color: col, phone: glowing ? 1 : 0, headDown: 1, visible: f.p < SEG.door.start, scale: 0.92 + rand() * 0.1 })
    }
    c.commit()
  }

  motion(m: SceneInfo['motion']) {
    m.walking = this.mira.walking
    m.step = this.mira.step
    m.frame = this.changerState
  }

  dispose() {
    for (const mat of Object.values(this.pal)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
    for (const s of [this.plate, this.clock, this.terminal, this.list, this.paper]) s.texture.dispose()
    disposeTree(this.crowd.group)
  }
}

export const createEsikScene = (options: SceneOptions): StoryScene => createSetScene(new EsikDirector(), options)
