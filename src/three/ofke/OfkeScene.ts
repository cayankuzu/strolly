/**
 * ÖFKE NÖBETİ — the center. A clinical lobby that sells calm, a corridor of
 * identical glass booths, one booth with one copy, and the same booth again
 * from the copy's chair.
 *
 * World layout (meters): street z 6…16 · lobby x −6…6, z −2…6 · corridor
 * x −1.5…1.5, z −2…−21 · booths 3×3 on both sides, Arif's booth centered at
 * (3, −11.5) with its glass front at x = 1.5.
 *
 * The violence is never shown landing on anyone: fists hit a table, a chair
 * hits a wall, and "termination" is the service's euphemism — a body turning
 * into light. What the story looks at is the meter, the price, the stars.
 */
import * as THREE from 'three'
import { SEG, at, local, segmentAt, type SegmentId } from '@/stories/ofke/timeline'
import { lerp, smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { Figure, type FigureLook } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { box, disposeTree, mesh } from '../util'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed, type ShotKeys } from '../kit/direct'
import { Crowd, bench, canvasPlane, car, chair, counter, facade, phone, room, std, table } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mono, sans } from '../screens'

const PI = Math.PI
const BOOTH = { x: 3, z: -11.5 }
const ARIF_IN_BOOTH = { x: 2.15, z: -11.5 }
const COPY_SEAT = { x: 4.05, z: -11.5 }
const SPARE_CHAIR = new THREE.Vector3(2.05, 0, -12.6)
const BOOTH_Z = [-4.5, -8, -11.5, -15, -18.5]

function palette() {
  return {
    wall: pbr('painted', 0xe6eaec, { roughness: 1.1 }),
    wallWarm: pbr('painted', 0xd9dcd8, { roughness: 1.1 }),
    floor: pbr('tile', 0xbac2c6, { roughness: 1.6 }),
    ceiling: pbr('plaster', 0xf2f4f5, { roughness: 1 }),
    panel: new THREE.MeshBasicMaterial({ color: 0xf4fbff }),
    steel: pbr('metal', 0x9aa3a8, { roughness: 0.7 }),
    dark: pbr('plastic', 0x2a2f33, { roughness: 1 }),
    desk: pbr('plastic', 0xf0f2f2, { roughness: 0.8 }),
    bench: pbr('painted', 0x8e989e, { roughness: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe7ee, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false }),
    frame: pbr('metal', 0xc9d0d3, { roughness: 0.8 }),
    asphalt: pbr('asphalt', 0x1d2024, { roughness: 1 }),
    sidewalk: pbr('paving', 0x50555a, { roughness: 1 }),
    facadeWall: pbr('concrete', 0x2b2f36, { roughness: 1 }),
    chair: pbr('plastic', 0xdfe3e5, { roughness: 0.9 }),
    tire: pbr('rubber', 0x111214, { roughness: 1 }),
    carBody: pbr('painted', 0x3b4652, { roughness: 0.6, metalness: 0.5 }),
    carGlass: std(0x0d1116, 0.1),
    carLight: new THREE.MeshBasicMaterial({ color: 0xfff1d6 }),
    // The cast
    skinA: std(0xc49a80, 0.55),
    skinAHead: std(0xc49a80, 0.52, { vertexColors: true }),
    skinB: std(0xb79079, 0.55),
    skinBHead: std(0xb79079, 0.52, { vertexColors: true }),
    eye: std(0x120d0a, 0.15),
    hairDark: std(0x231d1a, 0.75),
    buzz: std(0x6e5c52, 0.95),
    jacket: std(0x36433b, 0.85),
    jeans: std(0x2a3240, 0.9),
    shoe: std(0x1a1a1a, 0.7),
    sole: std(0x0f0f0f, 0.8),
    uniform: std(0x8c9196, 0.92),
    uniformDark: std(0x6f747a, 0.92),
    clerk: std(0xf3f5f6, 0.7),
    crowdBody: std(0x5a6168, 0.85),
    crowdHead: std(0xb48d74, 0.6),
    glow: new THREE.MeshBasicMaterial({ color: 0x9fc4ff }),
  }
}
type Pal = ReturnType<typeof palette>

function look(pal: Pal, name: string, kind: 'arif' | 'copy' | 'clerk' | 'user'): FigureLook {
  const base = { name, eye: pal.eye, sole: pal.sole, shoes: pal.shoe, collar: 'crew' as const }
  if (kind === 'arif') return { ...base, build: 'm', face: { jaw: 0.3, nose: 0.22, lips: 0.045, stubble: 0.35 }, hairStyle: 'short', skin: pal.skinA, skinHead: pal.skinAHead, hair: pal.hairDark, top: pal.jacket, bottom: pal.jeans, cuff: pal.jacket, collar: 'mock' }
  if (kind === 'copy') return { ...base, build: 'm', face: { jaw: 0.42, nose: 0.18, lips: 0.04, stubble: 0.5 }, hairStyle: 'short', skin: pal.skinB, skinHead: pal.skinBHead, hair: pal.buzz, top: pal.uniform, bottom: pal.uniformDark, cuff: pal.uniform, height: 1.02 }
  if (kind === 'clerk') return { ...base, build: 'f', face: { jaw: 0.14, nose: 0.14, lips: 0.07, stubble: 0 }, hairStyle: 'long', skin: pal.skinA, skinHead: pal.skinAHead, hair: pal.hairDark, top: pal.clerk, bottom: pal.clerk, cuff: pal.clerk, height: 0.95 }
  return { ...base, build: 'm', face: { jaw: 0.3, nose: 0.2, lips: 0.045, stubble: 0.2 }, hairStyle: 'short', skin: pal.skinB, skinHead: pal.skinBHead, hair: pal.hairDark, top: pal.dark, bottom: pal.jeans, cuff: pal.dark }
}

/** The copy that dissolves gets materials of its own, so only he turns to light. */
function fadeable(f: Figure) {
  const mats = new Map<THREE.Material, THREE.MeshStandardMaterial>()
  for (const m of f.meshes) {
    const base = m.material as THREE.MeshStandardMaterial
    let c = mats.get(base)
    if (!c) {
      c = base.clone()
      c.transparent = true
      mats.set(base, c)
    }
    m.material = c
  }
  return [...mats.values()]
}

// ——— Screens ———

function drawFace(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tone: string, hair: string) {
  ctx.fillStyle = hair
  ctx.beginPath()
  ctx.ellipse(x, y - s * 0.38, s * 0.44, s * 0.3, 0, PI, 0)
  ctx.fill()
  ctx.fillStyle = tone
  ctx.beginPath()
  ctx.ellipse(x, y, s * 0.4, s * 0.52, 0, 0, PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1a1310'
  for (const sx of [-1, 1]) ctx.fillRect(x + sx * s * 0.16 - s * 0.05, y - s * 0.06, s * 0.1, s * 0.04)
  ctx.fillRect(x - s * 0.12, y + s * 0.24, s * 0.24, s * 0.03)
  ctx.fillStyle = '#5a6168'
  ctx.fillRect(x - s * 0.5, y + s * 0.52, s, s * 0.5)
}

function kioskDraw(selected: boolean) {
  return (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = '#0d1418'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#9fb3bc'
    mono(ctx, 22, 500)
    ctx.fillText('SELECT TARGET', 30, 44)
    const faces = [
      ['0388', '#c49a80', '#2b211c'],
      ['0412', '#b79079', '#6e5c52'],
      ['0457', '#a77a62', '#151110'],
      ['0501', '#d0a98e', '#4b3a2e'],
      ['0533', '#b08a74', '#2a2320'],
      ['0560', '#c4a28a', '#5a4535'],
    ]
    faces.forEach(([id, tone, hair], i) => {
      const cx = 110 + (i % 3) * 200
      const cy = 150 + Math.floor(i / 3) * 190
      const on = selected && id === '0412'
      ctx.fillStyle = on ? '#1e3640' : '#141d22'
      ctx.fillRect(cx - 80, cy - 70, 160, 160)
      if (on) {
        ctx.strokeStyle = '#d44a35'
        ctx.lineWidth = 4
        ctx.strokeRect(cx - 80, cy - 70, 160, 160)
      }
      drawFace(ctx, cx, cy, 90, tone, hair)
      ctx.fillStyle = on ? '#f0d0c8' : '#7f9099'
      mono(ctx, 18, 500)
      ctx.fillText(id, cx - 22, cy + 82)
    })
  }
}

type MeterState = 'level' | 'terminated' | 'rate' | 'complete' | 'idle' | 'notice' | 'file' | 'early'

/** 0412's source file, as the service shows it to a user who taps KAYNAK. */
const FILE_LINES = ['HEDEF 0412 · KAYNAK DOSYASI', 'K. AYDOĞAN · 46 · HÜKÜMLÜ', '· Konuşmadan önce masaya üç kez vurur.', '· Kapı sesinden korkar.', '· Saat 23.00’te uyur.', '· Salı günleri iştahsızdır.', 'SUÇ: ERİŞİM YETKİNİZ YOK']

function meterDraw(level: number, state: MeterState, stars = 0) {
  return (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = '#0c1114'
    ctx.fillRect(0, 0, W, H)
    if (state === 'idle') return
    if (state === 'file') {
      FILE_LINES.forEach((line, i) => {
        ctx.fillStyle = i === 0 ? '#8fa2ab' : i === FILE_LINES.length - 1 ? '#e25a43' : i === 1 ? '#e8eef0' : '#b9c7cd'
        mono(ctx, i < 2 ? 17 : 15, i < 2 ? 600 : 400)
        ctx.fillText(line, 28, 34 + i * 29)
      })
      return
    }
    ctx.textAlign = 'center'
    if (state === 'notice') {
      ctx.fillStyle = '#c9d6dc'
      mono(ctx, 17, 500)
      ctx.fillText('MODEL YALNIZCA DAVRANIŞI TAKLİT EDER.', W / 2, 100)
      ctx.fillStyle = '#8fa2ab'
      mono(ctx, 15, 400)
      ctx.fillText('Hatırlıyormuş gibi yapmak da bir davranıştır.', W / 2, 140)
    } else if (state === 'early') {
      ctx.fillStyle = '#e2b062'
      mono(ctx, 20, 600)
      ctx.fillText('OTURUM ERKEN SONLANDIRILDI', W / 2, 104)
      ctx.fillStyle = '#8fa2ab'
      mono(ctx, 16, 400)
      ctx.fillText('KREDİ İADE EDİLMEZ', W / 2, 142)
    }
    if (state === 'level') {
      ctx.fillStyle = '#8fa2ab'
      mono(ctx, 20, 500)
      ctx.fillText('ANGER LEVEL', W / 2, 46)
      ctx.fillStyle = '#1c262b'
      ctx.fillRect(40, 80, W - 80, 34)
      const hue = Math.round(40 - level * 0.4)
      ctx.fillStyle = `hsl(${hue}, 80%, ${55 - level * 0.1}%)`
      ctx.fillRect(40, 80, ((W - 80) * level) / 100, 34)
      mono(ctx, 52, 400)
      ctx.fillStyle = '#e8eef0'
      ctx.fillText(`%${Math.round(level)}`, W / 2, 190)
    } else if (state === 'terminated') {
      ctx.fillStyle = '#e25a43'
      mono(ctx, 30, 600)
      ctx.fillText('TARGET TERMINATED', W / 2, H / 2)
    } else if (state === 'rate') {
      ctx.fillStyle = '#c9d6dc'
      mono(ctx, 22, 500)
      ctx.fillText('OTURUMU DEĞERLENDİRİN', W / 2, 80)
      ctx.fillStyle = '#ffd27a'
      sans(ctx, 54, 400)
      ctx.fillText(Array.from({ length: 5 }, (_, i) => (i < stars ? '★' : '☆')).join(' '), W / 2, 160)
    } else if (state === 'complete') {
      ctx.fillStyle = '#9fd0bf'
      mono(ctx, 24, 600)
      ctx.fillText('ANGER SESSION COMPLETE', W / 2, H / 2)
    }
    ctx.textAlign = 'left'
  }
}

// ——— The director ———

type Bodies = { arif: Actor; copy: Actor; clerk: Actor; user: Actor; copies: Actor[] }

const P_STREET = makePath([
  [-5.5, 12],
  [-1.2, 9],
  [0, 6.8],
])
const P_LOBBY = makePath([
  [0, 6.8],
  [0, 4.3],
  [0.1, 2.3],
])
const P_TO_BENCH = makePath([
  [0.1, 2.3],
  [2.8, 2.7],
  [4.15, 2.6],
])
/** From the bench to the reception desk, where the rules are read out. */
const P_TO_DESK = makePath([
  [4.15, 2.6],
  [2.4, 2.25],
  [0.3, 1.78],
])
const P_TO_KIOSK = makePath([
  [0.3, 1.78],
  [-2.0, 1.6],
  [-3.4, 0.2],
  [-4.2, -0.55],
])
/** Out through the glass doors to the street (after a session, and at the end). */
const P_LEAVE = makePath([
  [0.1, 3.0],
  [0, 6.8],
  [-1.2, 9],
  [-3.4, 10.6],
])
const P_TO_BOOTH = makePath([
  [-4.2, -0.55],
  [-1.0, -1.2],
  [0, -2.6],
  [0.3, -10.4],
  [1.3, -11.5],
  [ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z],
])
const P_CORRIDOR = makePath([
  [0, -2.4],
  [0.3, -10.4],
  [1.3, -11.5],
  [ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z],
])
const P_OUT = makePath([
  [ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z],
  [1.2, -11.5],
  [0.3, -10.2],
  [0.1, -6],
])

const SHOTS: Partial<Record<SegmentId, ShotKeys>> = {
  open: [[0, [4.5, 1.6, 15.5, 0, 1.9, 6.5, 40]]],
  street: [
    [0, [4.5, 1.6, 15.5, 0, 1.9, 6.5, 40]],
    [1, [3.4, 1.6, 12.6, 0, 1.6, 6.0, 38]],
  ],
  lobby: [
    [0, [-3.4, 1.65, -0.2, 0.4, 1.3, 5.2, 46]],
    [1, [-2.9, 1.6, -0.6, 0.4, 1.2, 3.0, 44]],
  ],
  wait: [
    [0, [-3.2, 1.35, 3.2, 4.4, 1.0, 2.2, 42]],
    [1, [-2.8, 1.3, 3.0, 4.4, 1.0, 2.3, 40]],
  ],
  ads: [
    [0, [-1.5, 1.6, 3.2, 4.4, 1.1, 2.4, 42]],
    [1, [-1.2, 1.65, 2.4, 5.9, 1.9, 2.4, 40]],
  ],
  // From behind the reception desk: a man reading the same message again.
  reason: [
    [0, [1.0, 1.6, 0.4, 0.1, 1.35, 2.3, 36]],
    [1, [0.95, 1.6, 0.45, 0.1, 1.38, 2.3, 32]],
  ],
  call: [
    [0, [2.0, 1.55, 4.6, 4.3, 1.2, 2.5, 40]],
    [1, [2.6, 1.6, 3.6, 0.2, 1.3, 1.2, 44]],
  ],
  rules: [
    [0, [2.6, 1.6, 2.6, 0.15, 1.35, 1.1, 40]],
    [0.5, [2.3, 1.56, 2.45, 0.1, 1.4, 1.0, 36]],
    [1, [-0.9, 1.62, 2.7, 0.15, 1.35, 1.2, 36]],
  ],
  console: [
    [0, [-3.3, 1.8, 0.75, -4.25, 1.3, -1.45, 36]],
    [1, [-3.45, 1.75, 0.5, -4.2, 1.32, -1.45, 32]],
  ],
  pick: [
    [0, [-3.9, 1.6, -0.45, -4.2, 1.35, -1.45, 28]],
    [1, [-3.95, 1.55, -0.6, -4.2, 1.35, -1.45, 26]],
  ],
  prepare: [
    [0, [0.6, 1.6, 1.4, 0, 1.5, -8, 40]],
    [1, [0.4, 1.6, -1.6, 0.6, 1.4, -12, 40]],
  ],
  enter: [
    [0, [1.75, 1.75, -10.25, 4.05, 1.0, -11.5, 46]],
    [1, [1.8, 1.72, -10.3, 4.0, 1.05, -11.5, 42]],
  ],
  stare: [
    [0, [1.62, 1.62, -11.12, 4.05, 1.15, -11.55, 32]],
    [1, [1.72, 1.6, -11.18, 4.05, 1.15, -11.55, 29]],
  ],
  rise: [
    [0, [1.7, 1.75, -10.3, 3.6, 1.45, -11.6, 44]],
    [1, [1.75, 1.72, -10.35, 3.6, 1.4, -11.6, 40]],
  ],
  throw: [
    [0, [2.0, 1.75, -10.2, 2.7, 1.2, -12.8, 48]],
    [1, [2.1, 1.7, -10.25, 2.7, 1.2, -12.8, 46]],
  ],
  terminate: [
    [0, [1.7, 1.62, -11.0, 4.1, 1.05, -11.6, 40]],
    [1, [1.65, 1.6, -10.95, 4.1, 1.05, -11.6, 38]],
  ],
  rate: [
    [0, [1.95, 1.55, -10.6, 4.4, 2.0, -11.5, 38]],
    [1, [2.0, 1.55, -10.65, 4.4, 2.05, -11.5, 34]],
  ],
  relief: [
    [0, [2.8, 1.6, 12.4, -1.0, 1.4, 8.4, 40]],
    [1, [2.5, 1.6, 12.0, -1.6, 1.5, 9.0, 37]],
  ],
  week: [
    [0, [-3.4, 1.65, -0.2, 0.4, 1.3, 5.2, 46]],
    [1, [-3.1, 1.62, -0.45, 0.3, 1.25, 3.4, 44]],
  ],
  again: [
    [0, [1.75, 1.75, -10.25, 4.05, 1.0, -11.5, 46]],
    [1, [1.8, 1.72, -10.3, 4.0, 1.05, -11.5, 42]],
  ],
  // Watched through the glass from the corridor, like everyone in this building is.
  yet: [
    [0, [0.85, 1.55, -10.3, 3.3, 1.2, -11.6, 46]],
    [1, [0.95, 1.52, -10.4, 3.3, 1.2, -11.6, 44]],
  ],
  knows: [
    [0, [0.95, 1.52, -10.4, 3.3, 1.2, -11.6, 44]],
    [1, [1.05, 1.48, -10.55, 3.4, 1.2, -11.6, 38]],
  ],
  doubt: [
    [0, [0.6, 1.6, -11.0, 3.2, 1.3, -11.6, 40]],
    [1, [0.7, 1.6, -11.05, 3.2, 1.3, -11.6, 38]],
  ],
  mimic: [
    [0, [1.75, 1.72, -10.3, 4.4, 2.1, -11.5, 40]],
    [1, [1.8, 1.7, -10.35, 4.4, 2.15, -11.5, 36]],
  ],
  file: [
    [0, [1.9, 1.85, -11.12, 4.47, 2.15, -11.5, 32]],
    [1, [2.0, 1.86, -11.18, 4.47, 2.18, -11.5, 28]],
  ],
  plead: [
    [0, [3.1, 1.45, -10.25, 3.15, 1.0, -11.5, 48]],
    [0.4, [3.1, 1.43, -10.3, 3.15, 1.0, -11.5, 46]],
    [0.5, [1.75, 1.32, -11.2, 4.05, 1.05, -11.55, 34]],
    [1, [1.8, 1.3, -11.22, 4.05, 1.08, -11.55, 32]],
  ],
  leave: [
    [0, [4.2, 1.65, -12.6, 1.6, 1.25, -10.8, 44]],
    [1, [4.15, 1.66, -12.55, 0.4, 1.35, -8.6, 42]],
  ],
  exit: [
    [0, [2.8, 1.6, 12.4, -1.0, 1.35, 8.6, 40]],
    [0.55, [1.2, 1.6, 11.6, -2.3, 1.3, 9.8, 36]],
    [1, [-4.6, 1.7, 11.6, -2.3, 1.35, 9.8, 36]],
  ],
  copyside: [
    [0, [4.0, 1.18, -11.5, 3.7, 1.25, -10.1, 48]],
    [0.5, [4.0, 1.18, -11.5, 3.7, 1.26, -10.1, 46]],
    [0.72, [4.0, 1.18, -11.5, 3.3, 1.45, -12.9, 46]],
    [1, [4.0, 1.17, -11.5, 3.3, 1.47, -12.9, 44]],
  ],
  question: [[0, [4.0, 1.18, -11.5, 1.6, 1.3, -11.5, 50]]],
  end: [[0, [4.0, 1.18, -11.5, 1.6, 1.3, -11.5, 50]]],
}
const POV: ShotKeys = [
  [0, [4.0, 1.18, -11.5, 1.6, 1.3, -11.5, 50]],
  [1, [4.0, 1.17, -11.5, 1.6, 1.27, -11.5, 48]],
]
for (const seg of ['swap', 'marks', 'oneway', 'replay', 'watch', 'complete', 'retained'] as const) SHOTS[seg] = POV

class OfkeDirector implements SetDirector {
  private pal = palette()
  private b!: Bodies
  private copyMats: THREE.MeshStandardMaterial[] = []
  private kiosk!: ReturnType<typeof canvasPlane>
  private meter!: ReturnType<typeof canvasPlane>
  private small!: ReturnType<typeof canvasPlane>
  private entrance!: { left: THREE.Object3D; right: THREE.Object3D }
  private boothDoor!: THREE.Object3D
  private spare!: THREE.Group
  private crowd!: Crowd
  private boothLight!: THREE.SpotLight
  private streetLight!: THREE.PointLight
  private lobbyLights: THREE.PointLight[] = []
  private hemi!: THREE.HemisphereLight
  private street!: THREE.Group
  private marks!: THREE.Group
  private newMark!: THREE.Mesh
  private phone!: ReturnType<typeof phone>
  private phoneScreen!: ReturnType<typeof canvasPlane>
  private watcher = 0

  build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.pal
    scene.environment = ctx.environment
    scene.environmentIntensity = 0.25
    scene.background = new THREE.Color(0x07090c)
    scene.fog = new THREE.Fog(0x07090c, 28, 70)

    // ——— Street ———
    const street = (this.street = new THREE.Group())
    scene.add(street)
    const road = mesh(new THREE.PlaneGeometry(40, 14), m.asphalt, 0, 0, 13, street)
    road.rotation.x = -PI / 2
    const walkway = mesh(new THREE.PlaneGeometry(40, 3), m.sidewalk, 0, 0.01, 7.5, street)
    walkway.rotation.x = -PI / 2
    for (const [x, w] of [
      [-12, 10],
      [12, 10],
    ] as const) {
      const f = facade({ w, h: 14, d: 4, wall: m.facadeWall, facing: 1, seed: 31 + x, lit: 0.3 })
      f.rotation.y = -PI / 2
      f.position.set(x, 0, 6 - 2)
      street.add(f)
    }
    const across = facade({ w: 40, h: 16, d: 4, wall: m.facadeWall, facing: 1, seed: 37, lit: 0.3 })
    across.rotation.y = PI / 2
    across.position.set(0, 0, 22)
    street.add(across)
    const parked = car(m.carBody, m.carGlass, m.tire, m.carLight)
    parked.position.set(5.5, 0, 10.5)
    parked.rotation.y = PI / 2
    street.add(parked)
    // The building's own front: glass and a sign.
    box(4.5, 3.2, 0.2, m.facadeWall, -4.25, 1.6, 6.1, street)
    box(4.5, 3.2, 0.2, m.facadeWall, 4.25, 1.6, 6.1, street)
    box(12, 1.8, 0.2, m.facadeWall, 0, 4.1, 6.1, street)
    const sign = canvasPlane(4.6, 0.6, 1024, (c, W, H) => {
      c.fillStyle = '#0a1013'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#e9f3f6'
      sans(c, 64, 500)
      c.textAlign = 'center'
      c.fillText('ÖFKE BOŞALTMA MERKEZİ', W / 2, H * 0.58)
      c.fillStyle = '#7e959e'
      mono(c, 26, 500)
      c.fillText('KAMU HİZMETİ', W / 2, H * 0.9)
    }, { emissive: true })
    sign.mesh.position.set(0, 3.5, 6.22)
    street.add(sign.mesh)
    // A public screen beside the doors: the service's own figures.
    const stats = canvasPlane(2.4, 1.3, 768, (c, W, H) => {
      c.fillStyle = '#081014'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#7e959e'
      mono(c, 24, 500)
      c.fillText('BU AY', 40, 64)
      c.fillStyle = '#e9f3f6'
      sans(c, 76, 500)
      c.fillText('1.204.311 oturum', 40, 160)
      c.fillStyle = '#9fd0bf'
      sans(c, 40, 400)
      c.fillText('Şiddet suçları %38 azaldı.', 40, 240)
      c.fillStyle = '#7e959e'
      mono(c, 22, 500)
      c.fillText('KAMU HİZMETİ · ÖFKE BOŞALTMA MERKEZİ', 40, H - 40)
    }, { emissive: true })
    stats.mesh.position.set(-4.25, 2.05, 6.22)
    street.add(stats.mesh)

    // ——— Lobby ———
    const lobby = room({ w: 12, d: 8, h: 3.2, x: 0, z: 2, wall: m.wall, floor: m.floor, ceiling: m.ceiling, openings: [
      { side: 's', at: 0, width: 2.2, height: 2.5 },
      { side: 'n', at: 0, width: 2.4, height: 2.5 },
    ] })
    scene.add(lobby)
    // Glass entrance doors that slide apart.
    const left = box(1.1, 2.45, 0.04, m.glass, -0.55, 1.225, 6.0, scene)
    const right = box(1.1, 2.45, 0.04, m.glass, 0.55, 1.225, 6.0, scene)
    this.entrance = { left, right }
    for (let i = 0; i < 6; i++) {
      const panel = box(1.6, 0.02, 0.5, m.panel, -4 + (i % 3) * 4, 3.19, i < 3 ? 0.5 : 4.0, scene)
      panel.castShadow = false
    }
    const reception = counter(3.2, 0.7, 1.05, m.desk, m.wallWarm)
    reception.position.set(0, 0, 1.0)
    scene.add(reception)
    for (const sx of [-1, 1]) box(0.16, 1.2, 0.5, m.steel, sx * 1.25, 0.6, 4.2, scene)
    const benchL = bench(3.4, m.bench, m.steel)
    benchL.rotation.y = PI / 2
    benchL.position.set(-4.6, 0, 2.7)
    scene.add(benchL)
    const benchR = bench(3.4, m.bench, m.steel)
    benchR.rotation.y = -PI / 2
    benchR.position.set(4.6, 0, 2.7)
    scene.add(benchR)
    // The price board (left wall), the big ad (right wall), the poster by the door.
    const price = canvasPlane(2.0, 1.2, 768, (c, W, H) => {
      c.fillStyle = '#0d1418'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#d5e2e7'
      sans(c, 40, 500)
      c.fillText('OTURUM ÜCRETLERİ', 40, 70)
      mono(c, 28, 400)
      c.fillStyle = '#9fb3bc'
      const rows = [
        ['30 DK · STANDART', '1 KREDİ'],
        ['60 DK · DERİN ARINMA', '2 KREDİ'],
        ['HEDEF YENİLEME', 'ÜCRETSİZ'],
        ['ÖFKE KREDİSİ', 'AYLIK'],
      ]
      rows.forEach(([a, b], i) => {
        c.fillText(a, 40, 150 + i * 60)
        c.fillText(b, W - 260, 150 + i * 60)
      })
    }, { emissive: true })
    price.mesh.position.set(-5.97, 1.9, 2.5)
    price.mesh.rotation.y = PI / 2
    scene.add(price.mesh)
    const ad = canvasPlane(3.0, 1.6, 1024, (c, W, H) => {
      const g = c.createLinearGradient(0, 0, W, H)
      g.addColorStop(0, '#dfeef3')
      g.addColorStop(1, '#a9c7d1')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#12303a'
      sans(c, 74, 600)
      c.fillText('ÖFKENİZİ', 60, 170)
      c.fillText('EVE GÖTÜRMEYİN.', 60, 260)
      sans(c, 30, 400)
      c.fillStyle = '#2d5664'
      c.fillText('Kopyalar acı hissetmez. Siz rahatlarsınız.', 60, 340)
    }, { emissive: true })
    ad.mesh.position.set(5.97, 1.9, 2.5)
    ad.mesh.rotation.y = -PI / 2
    scene.add(ad.mesh)
    const poster = canvasPlane(0.8, 1.1, 512, (c, W, H) => {
      c.fillStyle = '#f1f3f3'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#20282c'
      mono(c, 22, 600)
      c.fillText('AYIN EN ÇOK', 40, 60)
      c.fillText('SEÇİLEN HEDEFİ', 40, 92)
      drawFace(c, W / 2, 330, 260, '#b79079', '#6e5c52')
      c.fillStyle = '#d44a35'
      mono(c, 64, 600)
      c.textAlign = 'center'
      c.fillText('0412', W / 2, H - 50)
    })
    poster.mesh.position.set(3.4, 1.7, 5.96)
    poster.mesh.rotation.y = PI
    scene.add(poster.mesh)
    // The kiosk.
    box(0.9, 1.6, 0.35, m.wallWarm, -4.2, 0.8, -1.65, scene)
    this.kiosk = canvasPlane(0.78, 0.6, 768, kioskDraw(false), { emissive: true })
    this.kiosk.mesh.position.set(-4.2, 1.35, -1.47)
    scene.add(this.kiosk.mesh)

    // ——— Corridor and booths ———
    const corridor = room({ w: 3, d: 19, h: 3, x: 0, z: -11.5, wall: m.wall, floor: m.floor, ceiling: m.ceiling, skip: ['e', 'w', 's'] })
    scene.add(corridor)
    for (let i = 0; i < 6; i++) box(0.5, 0.02, 1.6, m.panel, 0, 2.99, -4 - i * 3.2, scene).castShadow = false
    for (const side of [-1, 1] as const) {
      BOOTH_Z.forEach((z, k) => {
        const bx = side * 3
        const booth = room({ w: 3, d: 3.2, h: 3, x: bx, z, wall: m.wall, floor: m.floor, ceiling: m.ceiling, skip: [side === 1 ? 'w' : 'e'] })
        scene.add(booth)
        const glass = box(0.04, 2.9, 3.2, m.glass, side * 1.5, 1.45, z, scene)
        glass.castShadow = false
        box(0.08, 0.1, 3.2, m.frame, side * 1.5, 2.95, z, scene)
        box(0.08, 0.06, 3.2, m.frame, side * 1.5, 0.03, z, scene)
        const t = table(0.8, 0.6, 0.74, m.desk, m.steel)
        t.position.set(bx + side * 0.05, 0, z)
        scene.add(t)
        const c = chair(m.steel, m.chair)
        c.position.set(bx + side * 1.05, 0, z)
        c.rotation.y = side === 1 ? -PI / 2 : PI / 2
        scene.add(c)
        if (side === 1 && k === 2) {
          // Arif's booth: its door (a glass slab in the front), the spare chair, the light.
          this.boothDoor = box(0.05, 2.4, 0.95, m.frame, 1.48, 1.2, z + 0.9, scene)
          ;(this.boothDoor as THREE.Mesh).material = m.glass
        }
      })
    }
    this.spare = chair(m.steel, m.chair)
    this.spare.position.copy(SPARE_CHAIR)
    this.spare.rotation.y = PI / 4
    scene.add(this.spare)
    // The meter on the back wall above the copy, the small screen only he can see, the tally.
    this.meter = canvasPlane(1.1, 0.5, 512, meterDraw(0, 'idle'), { emissive: true })
    this.meter.mesh.position.set(4.47, 2.2, BOOTH.z)
    this.meter.mesh.rotation.y = -PI / 2
    scene.add(this.meter.mesh)
    this.small = canvasPlane(0.34, 0.2, 256, (c, W, H) => {
      c.fillStyle = '#05080a'
      c.fillRect(0, 0, W, H)
    }, { emissive: true })
    this.small.mesh.position.set(3.7, 1.3, -10.08)
    this.small.mesh.rotation.y = PI
    scene.add(this.small.mesh)
    this.marks = new THREE.Group()
    const scratch = new THREE.MeshBasicMaterial({ color: 0x7c868b })
    for (let i = 0; i < 82; i++) {
      const groupX = Math.floor(i / 5)
      const inGroup = i % 5
      const x = 3.0 + (groupX % 12) * 0.075 + (inGroup < 4 ? inGroup * 0.012 : 0.018)
      const y = 1.7 - Math.floor(groupX / 12) * 0.13
      const mark = box(inGroup === 4 ? 0.06 : 0.004, inGroup === 4 ? 0.004 : 0.08, 0.002, scratch, x, y, -12.985, this.marks)
      if (inGroup === 4) mark.rotation.z = 0.5
    }
    scene.add(this.marks)
    // The notch added after the last session.
    this.newMark = box(0.004, 0.08, 0.002, scratch, 3.324, 1.57, -12.985, scene)
    // Arif's phone: in his hands in the lobby and at the end.
    this.phone = phone(m.dark, new THREE.MeshBasicMaterial({ color: 0x000000 }))
    this.phoneScreen = canvasPlane(0.066, 0.145, 256, () => {}, { emissive: true })
    this.phoneScreen.mesh.rotation.x = -PI / 2
    this.phoneScreen.mesh.position.y = 0.0086
    this.phone.group.add(this.phoneScreen.mesh)
    scene.add(this.phone.group)

    // ——— Light ———
    this.hemi = new THREE.HemisphereLight(0xeef6fa, 0x8a8f92, 0.9)
    scene.add(this.hemi)
    for (const [x, z] of [
      [-3, 2],
      [3, 2],
      [0, -6],
      [0, -15],
    ] as const) {
      const l = new THREE.PointLight(0xf2f8ff, 6, 12, 1.5)
      l.position.set(x, 2.8, z)
      this.lobbyLights.push(l)
      scene.add(l)
    }
    // Lights stay in the scene (hiding one recompiles every material); they are dimmed instead.
    this.streetLight = new THREE.PointLight(0xffc98a, 18, 18, 1.6)
    this.streetLight.position.set(-3, 4.5, 9)
    scene.add(this.streetLight)
    this.boothLight = new THREE.SpotLight(0xf6fbff, 26, 9, 0.8, 0.5, 1.5)
    this.boothLight.position.set(3.0, 2.95, BOOTH.z)
    this.boothLight.target.position.set(3.6, 0, BOOTH.z)
    this.boothLight.castShadow = ctx.quality.shadows
    this.boothLight.shadow.mapSize.set(1024, 1024)
    this.boothLight.shadow.bias = -0.0004
    scene.add(this.boothLight, this.boothLight.target)

    // ——— Cast ———
    const arif = new Figure(look(m, 'Arif', 'arif'))
    const copy = new Figure(look(m, '0412', 'copy'))
    this.copyMats = fadeable(copy)
    const clerk = new Figure(look(m, 'Görevli', 'clerk'))
    const user = new Figure(look(m, 'Kullanıcı', 'user'))
    scene.add(arif.root, copy.root, clerk.root, user.root)
    const copies: Actor[] = []
    for (const [side, k] of [
      [-1, 1],
      [-1, 3],
      [1, 0],
      [1, 3],
    ] as const) {
      const f = new Figure(look(m, `0412-${side}-${k}`, 'copy'))
      scene.add(f.root)
      const a = new Actor(f)
      a.begin().place(side * 4.05, BOOTH_Z[k], side === 1 ? -PI / 2 : PI / 2).hold(P.COWER)
      a.apply(0, false)
      copies.push(a)
    }
    this.b = { arif: new Actor(arif), copy: new Actor(copy), clerk: new Actor(clerk), user: new Actor(user), copies }
    this.crowd = new Crowd(10, m.crowdBody, m.crowdHead, m.glow)
    scene.add(this.crowd.group)
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const { arif, copy, clerk, user, copies } = this.b
    arif.begin()
    copy.begin()
    clerk.begin().place(0, 0.35, 0).hold(P.STAND_EASY)
    user.begin().place(4.62, 1.55, -PI / 2).hold(P.SIT_SLUMP)
    const inBooth = f.p >= SEG.enter.start
    const lobbyTime = f.p < SEG.prepare.start || (f.p >= SEG.week.start && f.p < SEG.again.start) || seg === 'exit'

    // ——— Arif ———
    switch (seg) {
      case 'open':
      case 'street':
        arif.walk(P_STREET, seg === 'open' ? 0 : smoothstep(0, 0.85, u), P.STAND, undefined, PI)
        break
      case 'lobby':
      case 'week':
        arif.walk(P_LOBBY, smoothstep(0.05, 0.9, u), P.STAND, PI, PI)
        break
      case 'reason':
        arif.place(0.1, 2.3, PI).blend([
          [0.0, P.STAND],
          [0.12, P.PHONE],
          [0.9, P.PHONE],
          [1.0, P.STAND],
        ], u)
        break
      case 'wait':
        if (u < 0.36) arif.walk(P_TO_BENCH, u / 0.36, P.STAND, PI, -PI / 2)
        else arif.place(4.2, 2.6, -PI / 2).blend([
          [0.36, P.STAND],
          [0.52, P.SIT_SLUMP],
        ], u)
        break
      case 'ads':
        arif.place(4.2, 2.6, -PI / 2).hold(P.SIT_SLUMP).lookAt(5.9, 2.5, 0.4)
        break
      case 'call':
        if (u < 0.3) arif.place(4.2, 2.6, -PI / 2).blend([
          [0.05, P.SIT_SLUMP],
          [0.28, P.STAND],
        ], u)
        else arif.walk(P_TO_DESK, smoothstep(0.3, 1, u), P.STAND, -PI / 2, PI)
        break
      case 'rules':
        arif.place(0.3, 1.78, PI).hold(P.STAND_EASY).lookAt(0, 0.35, 0.5)
        // He signs.
        arif.reach('r', Math.sin(PI * smoothstep(0.84, 1, u)), 0.22, 1.06, 1.42, 0.3)
        break
      case 'console':
        if (u < 0.32) arif.walk(P_TO_KIOSK, smoothstep(0, 0.32, u), P.STAND, PI, PI)
        else arif.place(-4.2, -0.55, PI).hold(P.STAND)
        break
      case 'pick': {
        arif.place(-4.2, -0.55, PI).hold(P.STAND)
        const w = smoothstep(0.15, 0.4, u) * (1 - smoothstep(0.6, 0.85, u))
        arif.reach('r', w, -4.33, 1.33, -1.43, 0.3)
        break
      }
      case 'prepare':
        arif.walk(P_TO_BOOTH, smoothstep(0, 1, u) * 0.82, P.STAND, PI)
        break
      case 'enter':
      case 'again':
        if (seg === 'enter' && u < 0.3) arif.walk(P_TO_BOOTH, 0.82 + (u / 0.3) * 0.18, P.STAND, undefined, PI / 2)
        else arif.place(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, PI / 2).hold(P.STAND)
        break
      case 'stare':
        arif.place(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, PI / 2).blend([
          [0.2, P.STAND],
          [0.6, P.ARMS_CROSSED],
        ], u)
        break
      case 'rise':
        this.rise(arif, u)
        break
      case 'throw':
        this.throwChair(arif, u)
        break
      case 'terminate':
      case 'rate':
        arif.place(2.25, -11.9, 0.9).hold(P.SPENT).lookAt(COPY_SEAT.x, COPY_SEAT.z, seg === 'rate' ? 0.6 : 1)
        break
      case 'relief':
        // Out into the evening; he stops a few steps from the doors and breathes.
        if (u < 0.62) arif.walk(P_LEAVE, lerp(0.3, 0.84, smoothstep(0, 0.62, u)), P.STAND, PI)
        else {
          arif.walk(P_LEAVE, 0.84, P.STAND)
          arif.place(arif.x, arif.z, arif.yaw).hold(P.STAND_EASY).lookAt(arif.x - 1, arif.z + 3, 0.4)
          arif.walking = 0
        }
        break
      case 'exit':
        if (u < 0.55) arif.walk(P_LEAVE, 0.85 * smoothstep(0, 0.55, u), P.STAND, PI)
        else {
          arif.walk(P_LEAVE, 0.85, P.STAND)
          arif.place(arif.x, arif.z, arif.yaw).blend([
            [0.55, P.STAND],
            [0.68, P.PHONE],
          ], u)
          arif.walking = 0
        }
        break
      case 'corridor':
        arif.walk(P_CORRIDOR, smoothstep(0, 1, u), P.STAND, PI, PI / 2)
        break
      case 'yet':
      case 'knows':
        arif.place(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, PI / 2).hold(seg === 'yet' ? P.STAND : P.ARMS_CROSSED)
        break
      case 'mimic':
        arif.place(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, PI / 2).hold(P.STAND).lookAt(4.47, BOOTH.z, 0.2)
        break
      case 'file':
        arif.place(ARIF_IN_BOOTH.x + 0.3 * smoothstep(0, 0.2, u), ARIF_IN_BOOTH.z, PI / 2).hold(P.STAND_EASY)
        break
      case 'doubt':
        arif.place(ARIF_IN_BOOTH.x - 0.25 * smoothstep(0, 0.4, u), ARIF_IN_BOOTH.z, PI / 2).hold(P.SPENT)
        break
      case 'plead':
        // He sits down across from the copy, on the chair he once threw.
        arif.place(2.25, BOOTH.z, PI / 2).blend([
          [0.0, P.SPENT],
          [0.14, P.SIT_STILL],
        ], u).lookAt(COPY_SEAT.x, COPY_SEAT.z, 0.8)
        break
      case 'leave':
        if (u < 0.22) arif.place(2.25, BOOTH.z, PI / 2).blend([
          [0.04, P.SIT_STILL],
          [0.2, P.STAND],
        ], u)
        else arif.walk(P_OUT, smoothstep(0.22, 0.9, u), P.STAND, PI / 2)
        if (u > 0.92) arif.visible = false
        break
      case 'replay': {
        // The first session again, from where the copy sat.
        const r = u < 0.5 ? u / 0.5 : (u - 0.5) / 0.5
        if (u < 0.5) this.rise(arif, r)
        else this.throwChair(arif, r)
        break
      }
      case 'swap':
      case 'marks':
      case 'oneway':
      case 'watch':
        arif.place(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, PI / 2).hold(seg === 'watch' ? P.SPENT : P.STAND).lookAt(COPY_SEAT.x, COPY_SEAT.z)
        break
      case 'complete':
        if (u < 0.2) arif.place(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, PI / 2).hold(P.SPENT)
        else arif.walk(P_OUT, smoothstep(0.2, 0.8, u), P.STAND, PI / 2)
        if (u > 0.85) arif.visible = false
        break
      default:
        arif.visible = false
    }

    // ——— The copy ———
    let fade = 0
    if (seg === 'terminate') fade = smoothstep(0.25, 0.7, u)
    else if (seg === 'rate') fade = 1
    copy.place(COPY_SEAT.x, COPY_SEAT.z, -PI / 2)
    if (f.p < SEG.enter.start) copy.visible = false
    else if (seg === 'rise' || seg === 'throw') copy.blend([
      [0.5, P.SIT_STILL],
      [0.62, P.COWER],
    ], seg === 'throw' ? 1 : u)
    else if (seg === 'terminate') copy.hold(P.COWER)
    else if (seg === 'yet' || seg === 'knows') copy.blend([
      [0.1, P.SIT_STILL],
      [0.35, P.SIT_LOOK],
    ], seg === 'knows' ? 1 : u).lookAt(ARIF_IN_BOOTH.x, ARIF_IN_BOOTH.z, 0.6)
    else if (seg === 'plead' || seg === 'leave') {
      copy.hold(P.SIT_LOOK).lookAt(seg === 'leave' ? arif.x : 2.25, seg === 'leave' ? arif.z : BOOTH.z, 0.7)
      // Three knocks on the table before he speaks.
      if (seg === 'plead' && u > 0.02 && u < 0.22) copy.reach('r', 1, 3.66, 0.8 + 0.06 * Math.abs(Math.sin(PI * 3 * smoothstep(0.04, 0.18, u))), BOOTH.z + 0.08, 0.25)
    } else copy.hold(P.SIT_STILL)
    // From his chair we are him: the body is ours, out of sight.
    if (f.p >= SEG.swap.start + SEG.swap.len * 0.3) copy.visible = false
    for (const mat of this.copyMats) {
      mat.opacity = 1 - fade
      mat.emissive?.setRGB(fade * 1.2, fade * 1.2, fade * 1.25)
      mat.depthWrite = fade < 0.5
    }
    if (fade >= 0.999) copy.visible = false

    // Other booths only exist for the corridor walk (and the reader's glance down it later).
    const corridorScene = f.p >= SEG.prepare.start
    for (const c of copies) c.figure.root.visible = corridorScene
    // The background people.
    this.placeCrowd(f.p, lobbyTime)

    // ——— Things ———
    const doorsOpen =
      seg === 'street'
        ? smoothstep(0.55, 0.8, u)
        : seg === 'lobby' || seg === 'week'
          ? 1 - smoothstep(0.35, 0.6, u)
          : seg === 'relief'
            ? smoothstep(0.05, 0.2, u) * (1 - smoothstep(0.45, 0.6, u))
            : seg === 'exit'
              ? smoothstep(0.12, 0.25, u) * (1 - smoothstep(0.42, 0.55, u))
              : 0
    this.entrance.left.position.x = -0.55 - doorsOpen * 1.0
    this.entrance.right.position.x = 0.55 + doorsOpen * 1.0
    const boothOpen =
      seg === 'enter'
        ? 1 - smoothstep(0.25, 0.45, u)
        : seg === 'prepare'
          ? smoothstep(0.7, 0.95, u)
          : seg === 'complete'
            ? smoothstep(0.2, 0.35, u) * (1 - smoothstep(0.75, 0.9, u))
            : seg === 'leave'
              ? smoothstep(0.3, 0.45, u) * (1 - smoothstep(0.85, 0.98, u))
              : seg === 'corridor'
                ? smoothstep(0.7, 0.9, u)
                : seg === 'again'
                  ? 1 - smoothstep(0.0, 0.2, u)
                  : 0
    this.boothDoor.position.z = BOOTH.z + 0.9 - boothOpen * 0.95
    this.kiosk.redraw(kioskDraw(seg === 'pick' ? u > 0.42 : seg === 'prepare'), seg === 'pick' && u > 0.42 ? 'sel' : seg === 'prepare' ? 'sel' : 'idle')
    // The spare chair: in the corner, in his hands, against the wall, on the floor.
    this.placeSpare(seg, u)
    // The meter.
    let level = 0
    let state: MeterState = 'idle'
    const stars = [5, 4, 3, 1].find((n) => f.flags.has(`rate:${n}`)) ?? 0
    if (seg === 'enter' || seg === 'stare') {
      state = 'level'
      level = seg === 'stare' ? lerp(12, 38, u) : 12
    } else if (seg === 'rise' || seg === 'throw' || seg === 'replay') {
      state = 'level'
      const r = seg === 'replay' ? (u < 0.5 ? u / 0.5 : (u - 0.5) / 0.5) : u
      level = seg === 'rise' || (seg === 'replay' && u < 0.5) ? lerp(38, 94, smoothstep(0.1, 0.9, r)) : 94 + 5 * r
    } else if (seg === 'terminate') state = u < 0.25 ? 'level' : 'terminated'
    else if (seg === 'rate') state = 'rate'
    else if (seg === 'mimic') state = 'notice'
    else if (seg === 'file') state = u > 0.12 ? 'file' : 'level'
    else if (seg === 'leave') state = u > 0.2 ? 'early' : 'level'
    else if (seg === 'again' || seg === 'yet' || seg === 'knows' || seg === 'doubt' || seg === 'plead' || seg === 'swap' || seg === 'marks' || seg === 'oneway' || seg === 'watch') {
      state = 'level'
      level = 9
    } else if (seg === 'complete' || seg === 'retained') state = 'complete'
    if (state === 'terminated' || state === 'level') level = Math.min(99, level)
    this.meter.redraw(meterDraw(level, state, stars), `${state}:${Math.round(level)}:${stars}`)
    const retained = seg === 'retained' || seg === 'question'
    const done = seg === 'copyside' || seg === 'end'
    this.small.redraw((c, W, H) => {
      c.fillStyle = '#05080a'
      c.fillRect(0, 0, W, H)
      if (retained) {
        c.fillStyle = '#e25a43'
        mono(c, 20, 600)
        c.fillText('USER MEMORY', 18, 70)
        c.fillText('RETAINED', 18, 100)
        c.fillStyle = '#8a9aa1'
        mono(c, 14, 400)
        c.fillText('USER: ARİF · 0412', 18, 140)
      } else if (done) {
        // The same sentence the user got, on this side of the glass.
        c.fillStyle = '#9fd0bf'
        mono(c, 17, 600)
        c.fillText('OTURUM BAŞARIYLA', 18, 60)
        c.fillText('TAMAMLANDI.', 18, 86)
        c.fillStyle = '#8a9aa1'
        mono(c, 14, 400)
        c.fillText('KULLANICI PUANI', 18, 124)
        c.fillStyle = '#ffd27a'
        c.fillText(stars ? Array.from({ length: 5 }, (_, i) => (i < stars ? '★' : '☆')).join('') : '—', 150, 124)
      }
    }, retained ? 'on' : done ? `done:${stars}` : 'off')
    this.marks.visible = inBooth
    this.newMark.visible = f.p >= at('copyside', 0.78)
    // Light: the booth light flares as he "terminates"; the lights go down at the end.
    const flare = seg === 'terminate' ? Math.sin(PI * smoothstep(0.2, 0.75, u)) : 0
    const dim = seg === 'complete' ? smoothstep(0.7, 1, u) : seg === 'retained' || seg === 'question' || seg === 'end' ? 1 : seg === 'copyside' ? 0.4 : 0
    this.boothLight.intensity = 26 * (1 - 0.75 * dim) + flare * 140
    for (const l of this.lobbyLights) l.intensity = 6 * (1 - 0.8 * dim)
    this.hemi.intensity = 0.9 * (1 - 0.7 * dim) + flare * 0.6
    this.street.visible = f.p < SEG.lobby.start + SEG.lobby.len * 0.6 || (f.p >= SEG.week.start && f.p < SEG.week.end) || seg === 'relief' || seg === 'exit'
    this.streetLight.intensity = this.street.visible ? 18 : 0

    // ——— Watcher in the corridor, behind the glass ———
    this.watcher = seg === 'stare' || seg === 'rise' ? 1 : 0

    arif.apply(f.time, !f.reduced)
    copy.apply(f.time, !f.reduced)
    this.placePhone(seg, u)
    clerk.visible = lobbyTime
    clerk.apply(f.time, !f.reduced)
    user.visible = seg === 'reason' || seg === 'wait' || seg === 'ads' || seg === 'call'
    user.blend([
      [0, P.SIT_SLUMP],
      [1, P.SIT_TYPE],
    ], 0.35)
    user.apply(f.time, !f.reduced)

    // ——— Camera ———
    const keys = SHOTS[seg] ?? SHOTS.open!
    if (seg === 'corridor') {
      // Follow him down the corridor, a few steps behind.
      shot.pos.set(arif.x - 0.25, 1.62, arif.z + 2.6)
      shot.tgt.set(arif.x, 1.35, arif.z - 3)
      shot.fov = 44
    } else keyed(keys, held(u, f.reduced), shot)
    shot.fade =
      seg === 'open' || seg === 'end'
        ? 0
        : seg === 'street'
          ? smoothstep(0, 0.3, u)
          : seg === 'swap'
            ? u < 0.22
              ? 1 - smoothstep(0, 0.2, u)
              : smoothstep(0.25, 0.6, u)
            : seg === 'question'
              ? 1 - smoothstep(0.15, 0.7, u)
              : seg === 'relief' || seg === 'exit'
                ? smoothstep(0, 0.2, u)
                : seg === 'copyside'
                  ? smoothstep(0, 0.2, u) * (1 - smoothstep(0.9, 1, u))
                  : seg === 'replay'
                    ? Math.min(smoothstep(0, 0.1, u), 1 - 0.85 * Math.sin(PI * smoothstep(0.46, 0.54, u)))
                    : 1
    if (seg === 'swap' || seg === 'marks' || seg === 'oneway' || seg === 'replay' || seg === 'watch' || seg === 'complete' || seg === 'retained' || seg === 'question' || seg === 'copyside') shot.handheld = 0.4
    // In his chair: a gentle nudge toward the small screen, once.
    if (seg === 'retained' && u > 0.12 && u < 0.6 && !f.seen.has('retained-screen')) shot.request = { id: 'ofke-retained', yaw: 1.35, pitch: 0.05, seconds: 2.6 }
  }

  /** The anger rising: arms crossed, fists, a fist on the table. */
  private rise(arif: Actor, u: number) {
    arif.place(ARIF_IN_BOOTH.x + 0.25 * smoothstep(0.3, 0.55, u), ARIF_IN_BOOTH.z, PI / 2).blend([
      [0.05, P.ARMS_CROSSED],
      [0.3, P.FISTS],
      [0.52, P.FISTS],
      [0.6, P.SLAM],
      [0.75, P.SLAM],
      [0.95, P.FISTS],
    ], u)
  }

  /** The spare chair, picked up and thrown at the wall. */
  private throwChair(arif: Actor, u: number) {
    const toChair = smoothstep(0, 0.25, u)
    arif.place(lerp(ARIF_IN_BOOTH.x + 0.25, 2.2, toChair), lerp(ARIF_IN_BOOTH.z, -12.05, toChair), lerp(PI / 2, PI, toChair)).blend([
      [0.2, P.FISTS],
      [0.32, P.LEAN],
      [0.5, P.WINDUP],
      [0.62, P.THROW],
      [0.85, P.SPENT],
    ], u)
  }

  /** The phone in his right hand, screen toward his face, when he reads it. */
  private placePhone(seg: SegmentId, u: number) {
    const on = (seg === 'reason' && u > 0.1 && u < 0.92) || (seg === 'exit' && u > 0.66)
    this.phone.group.visible = on
    if (!on) return
    const a = this.b.arif
    a.figure.rGrip.getWorldPosition(this.phone.group.position)
    this.phone.group.rotation.set(-0.85, a.yaw, 0, 'YXZ')
    const reason = seg === 'reason'
    this.phoneScreen.redraw((c, W, H) => {
      c.fillStyle = '#0b0f12'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#e9f3f6'
      sans(c, 34, 500)
      c.fillText(reason ? '18.31' : '19.04', 18, 52)
      c.fillStyle = '#16232a'
      c.fillRect(12, 90, W - 24, reason ? 190 : 130)
      c.fillStyle = '#7e959e'
      mono(c, 13, 500)
      c.fillText(reason ? 'E-DEVLET · BİLDİRİM' : 'ÖFKE BOŞALTMA MERKEZİ', 22, 114)
      c.fillStyle = '#d5e2e7'
      sans(c, 17, 500)
      const lines = reason ? ['Yaşlı bakım desteği', 'başvurunuz uygun', 'bulunmamıştır.', '(4. değerlendirme)'] : ['Oturum başarıyla', 'tamamlandı.']
      lines.forEach((t, i) => c.fillText(t, 22, 146 + i * 28))
    }, reason ? 'reason' : 'exit')
  }

  private placeCrowd(p: number, lobby: boolean) {
    const c = this.crowd
    const col = new THREE.Color()
    const people: Array<[number, number, number, number]> = [
      [-4.62, 1.6, PI / 2, 0],
      [-4.62, 2.5, PI / 2, 1],
      [-4.62, 3.6, PI / 2, 0],
      [4.62, 3.6, -PI / 2, 1],
      [-2.2, 4.6, 0.4, 0],
      [2.4, 0.2, PI, 0],
    ]
    people.forEach(([x, z, yaw, phone], i) => {
      col.setHSL(0.58 + i * 0.03, 0.08, 0.3 + (i % 3) * 0.08)
      c.set(i, x, z, yaw, { visible: lobby, color: col, phone, headDown: phone ? 1 : 0.3, scale: i < 4 ? 0.82 : 1 })
    })
    // Users in the other booths (only seen from the corridor).
    const inside = p >= SEG.prepare.start
    const booths: Array<[number, number]> = [
      [-1, 1],
      [-1, 3],
      [1, 0],
      [1, 3],
    ]
    booths.forEach(([side, k], j) => {
      col.setHSL(0.05 + j * 0.1, 0.12, 0.28)
      c.set(6 + j, side * 2.3, BOOTH_Z[k] + 0.2, side === 1 ? PI / 2 : -PI / 2, { visible: inside, color: col })
    })
    c.commit()
  }

  private placeSpare(seg: SegmentId, u: number): void {
    const s = this.spare
    const arif = this.b.arif.figure
    if (seg === 'replay' && u >= 0.5) return this.placeSpare('throw', (u - 0.5) / 0.5)
    if (seg === 'plead' || seg === 'leave') {
      s.position.set(2.2, 0, BOOTH.z)
      s.rotation.set(0, PI / 2, 0)
      return
    }
    if (seg === 'watch') {
      s.position.set(2.6, 0, -12.6)
      s.rotation.set(PI / 2, PI / 2, 0.6)
      return
    }
    if (seg === 'throw' && u > 0.3 && u < 0.62) {
      // Between his hands.
      arif.root.updateMatrixWorld(true)
      const a = arif.lGrip.getWorldPosition(new THREE.Vector3())
      const b = arif.rGrip.getWorldPosition(new THREE.Vector3())
      s.position.copy(a).add(b).multiplyScalar(0.5)
      s.position.y -= 0.5
      s.rotation.set(0.4, PI / 2, 0)
    } else if (seg === 'throw' && u >= 0.62) {
      // Thrown against the wall, then on the floor.
      const t = smoothstep(0.62, 0.8, u)
      const fall = smoothstep(0.8, 0.95, u)
      s.position.set(lerp(2.3, 2.6, t), lerp(1.3, 1.0, t) - fall * 1.0, lerp(-12.3, -12.7, t))
      s.rotation.set(lerp(0.4, 1.4, t), PI / 2, lerp(0, 0.6, fall))
    } else if (seg === 'terminate' || seg === 'rate') {
      s.position.set(2.6, 0, -12.6)
      s.rotation.set(PI / 2, PI / 2, 0.6)
    } else {
      s.position.copy(SPARE_CHAIR)
      s.rotation.set(0, PI / 4, 0)
    }
  }

  motion(m: SceneInfo['motion']) {
    const a = this.b.arif
    m.walking = a.walking
    m.step = a.step
    m.doors = this.watcher
  }

  dispose() {
    for (const mat of this.copyMats) mat.dispose()
    for (const mat of Object.values(this.pal)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
    this.kiosk.texture.dispose()
    this.meter.texture.dispose()
    this.small.texture.dispose()
    this.phoneScreen.texture.dispose()
    disposeTree(this.crowd.group)
  }
}

export const createOfkeScene = (options: SceneOptions): StoryScene => createSetScene(new OfkeDirector(), options)
