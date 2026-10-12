/**
 * TEKERRÜR — a room whose walls are a forest, a man asleep at its desk, three
 * robots, an archive that does not forget, one square across a century, a
 * spiral that is a circle, a record of tomorrow, and a lens that turns.
 *
 * World (docs/stories/tekerrur.md §2): the room at the origin (10 × 10 m,
 * screens all round), the walkway at x 5…9, the archive at x −5…−60, the
 * square at x 300, the network void at x 600.
 *
 * Every frame is a pure function of progress: the director resets the state,
 * lets the current segment write it (who is where doing what, the screens,
 * the sky, the camera), then applies it. Shots that show another place or
 * moment on a screen (the dive into the square, the record on the centre
 * screen, the ghost of the previous era) render that moment first into a
 * texture with the same machinery, then the present.
 */
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { angleLerp, clamp, lerp, linear, smoothstep, window4 } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import { BASE_ITERATION, SEG, at, eraAt, local, recordAt, segmentAt, type SegmentId } from '@/stories/tekerrur/timeline'
import { RECORDER_LENS, iterationDate } from '@/stories/tekerrur/text'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { createSetScene, makeShot, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed } from '../kit/direct'
import { addWalk } from '../figure/Figure'
import { makePath, pointAt, type Path, type Sample } from '../figure/paths'
import * as P from '../figure/poses'
import { fitFov } from '../lens'
import { mesh } from '../util'
import { ASLEEP, BEND_SEAT, HAND_OUT, LEAN_DESK, LISTENING, RUB, SIP, SIT_BACK_SLOW, SIT_UP, STAND_SHIFT, THROW_COCK, THROW_RELEASE, arifLooks, makeArif, setEyes, setGlasses } from './cast'
import { RoomSet, BUTTON, CENTER_SCREEN, CHAIR_IN, CHAIR_OUT, DESK, MARKS, NICHES, type ScreenSet } from './room'
import { Robot } from './robots'
import { ArchiveSet } from './archive'
import { SquareSet, SQUARE_CAM } from './square'
import { NetworkSet, SQUARE_TO_VOID } from './network'
import { LOOKS, Sky, type LookName } from './sky'
import { RECORD_AIM, RECORD_TIMES, SHOTS } from './shots'
import { drawDates, drawFlash, drawGrid, drawLine, drawObserver, drawPlayer, drawSorting, drawTimecode, drawTouch, drawVignette, drawWindow } from './screens'

const PI = Math.PI
const SEAT_BACK = 0.06
/** Where his right hand goes out into the empty air (palm up) and the robot meets it. */
const HAND = new THREE.Vector3(0.56, 0.99, 1.04)
/** The coffee robot's place at the hand-off (its cupSpot lands under HAND). */
const HANDOFF = { x: HAND.x + 0.04, z: HAND.z - 0.08, yaw: -PI / 2 }
const CHEEK_SPOT = new THREE.Vector3(-0.22, DESK.y + 0.002, 0.42)
const HOVER_AT = new THREE.Vector3(0.02, BUTTON.y + 0.1, BUTTON.z + 0.1)
const LEFT_HANDLE = new THREE.Vector3(-0.1, 1.05, 1.15)
const RIGHT_HANDLE = new THREE.Vector3(-0.1, 1.05, 1.15)
const SWITCH_HANDLE = new THREE.Vector3(0, 0.43, 0)

type SetName = 'room' | 'archive' | 'square' | 'void' | 'black'
type ScreenMode = 'off' | 'sort' | 'dates' | 'observer' | 'line' | 'grid' | 'flash' | 'circle' | 'record'
type ScreenState = { mode: ScreenMode; a: number; b: number; t: number; level: number }

const W = {
  rise: makePath([
    [0, CHAIR_IN.z],
    [0.45, 1.16],
    [0.7, 1.2],
  ]),
  walk: makePath([
    [0.7, 1.2],
    [2.2, 1.2],
    [3.4, 0.8],
  ]),
  floor: makePath([
    [3.4, 0.8],
    [4.35, 0.3],
  ]),
  through: makePath([
    [4.75, 0.2],
    [5.9, 0.08],
    [6.6, 0.0],
  ]),
  inside: makePath([
    [6.2, 0.0],
    [5.2, 0.12],
    [4.3, 0.35],
    [3.3, 0.85],
  ]),
  toDesk: makePath([
    [3.3, 0.85],
    [1.6, 0.98],
    [0.35, 1.02],
    [0.05, 1.02],
  ]),
  toLeft: makePath([
    [0, 1.02],
    [-0.6, 1.3],
    [-2.2, 1.3],
    [-3.5, 1.0],
    [-4.4, -0.2],
  ]),
  inArchive: makePath([
    [-4.6, -0.3],
    [-5.4, -0.55],
    [-6.05, -0.95],
  ]),
  back: makePath([
    [-6.05, -0.95],
    [-5.0, -0.25],
    [-4.0, 0.2],
    [-2.2, 1.25],
    [-0.6, 1.25],
    [0.0, 1.06],
  ]),
  halt: makePath([
    [0.7, 1.2],
    [2.2, 1.2],
  ]),
}

const R = {
  recOut: makePath([
    [-3.2, 0.35],
    [-2.2, 1.9],
    [-0.2, 2.2],
    [1.6, 1.8],
    [2.9, 1.1],
    [3.9, 0.45],
    [5.6, 0.0],
    [7.6, 0.0],
    [8.0, 1.15],
  ]),
  coffeeIn: makePath([
    [NICHES.coffee[0], NICHES.coffee[1]],
    [6.3, 0.15],
    [5.0, 0.0],
    [3.7, 0.75],
    [2.3, 1.85],
    [1.25, 1.85],
    [MARKS.coffee[0], MARKS.coffee[1]],
  ]),
  snackIn: makePath([
    [NICHES.snack[0], NICHES.snack[1]],
    [7.0, 0.05],
    [5.0, 0.0],
    [3.7, 0.75],
    [2.2, 2.05],
    [0.6, 2.4],
    [-0.5, 2.15],
    [MARKS.snack[0], MARKS.snack[1]],
  ]),
  recIn: makePath([
    [NICHES.recorder[0], NICHES.recorder[1]],
    [7.8, 0.0],
    [5.0, 0.0],
    [3.6, 0.8],
    [2.0, 2.25],
    [0.2, 2.75],
    [-1.6, 2.2],
    [-2.7, 1.2],
    [MARKS.recorder[0], MARKS.recorder[1]],
  ]),
  recHalt: makePath([
    [MARKS.recorder[0], MARKS.recorder[1]],
    [-2.0, 1.55],
    [-0.3, 1.9],
  ]),
}
const reversed = (p: Path) => makePath([...p.pts].reverse())
const R_OUT = { coffee: reversed(R.coffeeIn), snack: reversed(R.snackIn) }

const k = (p: number, v: number): Key<number> => [p, v, linear]
/** How far along its path the recorder is while it follows Arif to the right door. */
const REC_FOLLOW: Key<number>[] = [k(at('rise', 0.6), 0), k(at('walk', 0), 0.1), k(at('walk', 1), 0.42), k(at('floor', 0.7), 0.5), k(at('rightDoor', 0.55), 0.53), k(at('rightDoor', 0.83), 0.55), k(at('rightDoor', 0.94), 0.76), k(at('forty', 0.25), 1)]
const COFFEE_IN: Key<number>[] = [k(at('reopen', 0.55), 0), k(at('robots', 1), 0.86), k(at('sits', 0.45), 1)]
const SNACK_IN: Key<number>[] = [k(at('reopen', 0.68), 0), k(at('robots', 1), 0.8), k(at('sits', 0.5), 1)]
const REC_IN: Key<number>[] = [k(at('reopen', 0.8), 0), k(at('robots', 1), 0.62), k(at('sits', 0.75), 1)]

const sample: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }
const ahead: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }
const ease = (t: number) => t * t * (3 - 2 * t)
const ramp = (a: number, b: number, u: number) => smoothstep(a, b, u)

type Rig = {
  hemi: THREE.HemisphereLight
  key: THREE.DirectionalLight
  lamp: THREE.SpotLight
  spill: THREE.SpotLight
  strip: THREE.RectAreaLight
  screen: THREE.RectAreaLight
  points: THREE.PointLight[]
}

type State = {
  set: SetName
  room: boolean
  archive: boolean
  walkway: boolean
  who: 'c' | 's' | null
  eyes: number
  askew: number
  breath: 'sleep' | 'awake' | 'still'
  drool: number
  wet: number
  windowA: number
  clothFolded: boolean
  clothHand: boolean
  clothFly: THREE.Vector3 | null
  clothTop: boolean
  extraCloth: boolean
  cupHand: boolean
  cupFall: number
  chairZ: number
  rightDoor: number
  leftDoor: number
  lookA: LookName
  lookB: LookName
  lookT: number
  onT: number
  paint: number
  hair: number
  offT: number
  wallDim: number
  ceilDim: number
  grid: number
  circle: number
  rain: number
  scan: number
  redraw: number
  ceiling: boolean
  ring: number
  lamp: number
  roomLight: number
  center: ScreenState
  left: ScreenState
  right: ScreenState
  hud: { code1: string; code2: string; vignette: number } | null
  thumb: number
  ghost: number
  hideRecorder: boolean
  recAway: number
  recAim: 'arif' | 'camera'
  ringLevel: number
  era: number
  eraT: number
  hook: number
  spill: number
  record: number
}

const screenOff = (): ScreenState => ({ mode: 'off', a: 0, b: 0, t: 0, level: 0 })

class TekerrurDirector implements SetDirector {
  iteration = BASE_ITERATION
  private scene!: THREE.Scene
  private renderer!: THREE.WebGLRenderer
  private room = new RoomSet()
  private archive = new ArchiveSet()
  private square = new SquareSet()
  private net = new NetworkSet()
  private arifC!: Actor
  private arifS!: Actor
  private ghost!: Actor
  private ghostMats: THREE.MeshStandardMaterial[] = []
  private coffee = new Robot('coffee')
  private snack = new Robot('snack')
  private rec = new Robot('recorder')
  private cup!: THREE.Group
  private drool!: THREE.Mesh
  private wetSpot!: THREE.Mesh
  private wetMat!: THREE.MeshStandardMaterial
  private rig!: Rig
  private env: THREE.Texture | null = null
  private sky = new Sky()
  private rt!: THREE.WebGLRenderTarget
  private rtCam = new THREE.PerspectiveCamera(42, 16 / 9, 0.05, 600)
  private altShot = makeShot()
  private thumb!: THREE.Mesh
  private thumbMat!: THREE.MeshBasicMaterial
  private player!: { mesh: THREE.Mesh; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; key: string }
  private hudVignette!: THREE.Mesh
  private hudCode!: { mesh: THREE.Mesh; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; key: string }
  private hudGhost!: THREE.Mesh
  private hudGhostMat!: THREE.MeshBasicMaterial
  private windowCtx!: CanvasRenderingContext2D
  private windowTex!: THREE.CanvasTexture
  private windowKey = ''
  private releasePoint = new THREE.Vector3(0.45, 1.62, 0.98)
  private time = 0
  private st!: State
  private v = new THREE.Vector3()
  private v2 = new THREE.Vector3()
  private v3 = new THREE.Vector3()
  private size = new THREE.Vector2()
  private motionInfo = { step: 0, walking: 0, robots: 0, doors: 0, frame: 0 }
  private lastRobots = new THREE.Vector3()
  private stepBase = 0

  async build(scene: THREE.Scene, ctx: BuildContext) {
    RectAreaLightUniformsLib.init()
    this.scene = scene
    this.renderer = ctx.renderer
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(0x000000, 500, 1000)
    const [env] = await Promise.all([ctx.hdri('xanderklinge'), this.room.build(scene, ctx)])
    this.env = env ?? ctx.environment
    scene.environment = this.env
    // Align the HDRI with the walls' photograph (the same place, the same yaw).
    scene.environmentRotation.set(0, -0.491 * PI * 2, 0)
    scene.environmentIntensity = 0.4

    this.archive.build()
    scene.add(this.archive.group)
    this.square.build()
    scene.add(this.square.group)
    this.net.build()
    scene.add(this.net.group)

    // ——— Cast ———
    const looks = arifLooks()
    this.arifC = new Actor(makeArif(looks.cardigan))
    this.arifS = new Actor(makeArif(looks.shirt))
    this.ghost = new Actor(makeArif(looks.ghost))
    this.ghostMats = looks.ghostMats
    this.ghost.figure.root.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = false
        m.receiveShadow = false
        m.renderOrder = 5
      }
    })
    this.room.group.add(this.arifC.figure.root, this.arifS.figure.root, this.ghost.figure.root)
    for (const r of [this.coffee, this.snack, this.rec]) this.room.group.add(r.group)
    this.cup = this.coffee.cup!
    this.room.group.add(this.cup)
    // Where the throwing hand lets go: measured once from the pose.
    this.arifC.begin().place(0, CHAIR_IN.z + SEAT_BACK, PI).hold(THROW_RELEASE)
    this.arifC.apply(0, false)
    this.arifC.figure.rGrip.getWorldPosition(this.releasePoint)

    // Drool: a thin strand from the corner of his mouth to the glass, and the wet mark it leaves.
    const droolMat = new THREE.MeshPhysicalMaterial({ color: 0xe8eef0, roughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false, clearcoat: 1 })
    const dg = new THREE.CylinderGeometry(0.0016, 0.003, 1, 6, 1)
    dg.translate(0, -0.5, 0)
    this.drool = mesh(dg, droolMat, 0, 0, 0, this.room.group)
    this.wetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.0, depthWrite: false, envMapIntensity: 2.5, polygonOffset: true, polygonOffsetFactor: -3 })
    this.wetSpot = mesh(new THREE.CircleGeometry(0.035, 20), this.wetMat, CHEEK_SPOT.x, DESK.y + 0.0012, CHEEK_SPOT.z, this.room.group)
    this.wetSpot.rotation.x = -PI / 2
    this.wetSpot.scale.set(1.4, 0.8, 1)

    // The pale window under his cheek.
    const wc = document.createElement('canvas')
    wc.width = 512
    wc.height = 300
    this.windowCtx = wc.getContext('2d')!
    this.windowTex = new THREE.CanvasTexture(wc)
    this.windowTex.colorSpace = THREE.SRGBColorSpace
    this.room.windowMat.map = this.windowTex
    this.room.windowMat.needsUpdate = true
    this.room.window.position.set(-0.36, DESK.y + 0.0016, 0.38)
    this.room.window.rotation.z = 0.25
    drawTouch(this.room.touchCtx, 1024, 452, 1)
    this.room.touchTex.needsUpdate = true

    // ——— The light rig: the same lights for every set (a constant light count, no recompiles) ———
    const hemi = new THREE.HemisphereLight(0xffffff, 0x333333, 0.3)
    const key = new THREE.DirectionalLight(0xffffff, 1)
    key.castShadow = ctx.quality.shadows
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.03
    const lamp = new THREE.SpotLight(0xffb26b, 3.2, 5, 0.9, 0.7, 2)
    lamp.castShadow = ctx.quality.shadows
    lamp.shadow.mapSize.set(1024, 1024)
    lamp.shadow.bias = -0.0006
    lamp.shadow.normalBias = 0.02
    lamp.shadow.camera.near = 0.05
    const spill = new THREE.SpotLight(0xf1f3f5, 0, 18, 0.42, 0.25, 1.2)
    spill.castShadow = ctx.quality.shadows
    spill.shadow.mapSize.set(1024, 1024)
    spill.shadow.bias = -0.0008
    spill.shadow.camera.near = 0.5
    const strip = new THREE.RectAreaLight(0xffa860, 8, 2.4, 0.06)
    const screen = new THREE.RectAreaLight(0xbfd0e0, 0, CENTER_SCREEN.w, CENTER_SCREEN.h)
    const points = [0, 1, 2].map(() => new THREE.PointLight(0xffffff, 0, 4, 2))
    this.rig = { hemi, key, lamp, spill, strip, screen, points }
    scene.add(hemi, key, key.target, lamp, lamp.target, spill, spill.target, strip, screen, ...points)

    // ——— Render target for screens that show another place or moment ———
    this.rt = new THREE.WebGLRenderTarget(1024, 576, { type: THREE.HalfFloatType, samples: ctx.quality.msaa ? 2 : 0 })
    this.thumbMat = new THREE.MeshBasicMaterial({ map: this.rt.texture, toneMapped: true, transparent: true, opacity: 1, depthWrite: false })
    this.thumb = mesh(new THREE.PlaneGeometry(1, 1), this.thumbMat, 0, 0, 0, this.room.group)
    this.thumb.renderOrder = 3
    const pc = document.createElement('canvas')
    pc.width = 1024
    pc.height = 582
    const ptex = new THREE.CanvasTexture(pc)
    ptex.colorSpace = THREE.SRGBColorSpace
    const pmesh = mesh(new THREE.PlaneGeometry(CENTER_SCREEN.w, CENTER_SCREEN.h), new THREE.MeshBasicMaterial({ map: ptex, transparent: true, depthWrite: false }), CENTER_SCREEN.pos.x, CENTER_SCREEN.pos.y, CENTER_SCREEN.pos.z + 0.004, this.room.group)
    pmesh.renderOrder = 4
    this.player = { mesh: pmesh, ctx: pc.getContext('2d')!, tex: ptex, key: '' }

    // ——— The record frame: a vignette and a timecode laid in front of the lens ———
    const vc = document.createElement('canvas')
    vc.width = 512
    vc.height = 288
    drawVignette(vc.getContext('2d')!, 512, 288)
    const vtex = new THREE.CanvasTexture(vc)
    vtex.colorSpace = THREE.SRGBColorSpace
    this.hudVignette = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: vtex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }), 0, 0, 0, scene)
    this.hudVignette.renderOrder = 20
    const cc = document.createElement('canvas')
    cc.width = 640
    cc.height = 100
    const ctex = new THREE.CanvasTexture(cc)
    ctex.colorSpace = THREE.SRGBColorSpace
    const cmesh = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ctex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }), 0, 0, 0, scene)
    cmesh.renderOrder = 21
    this.hudCode = { mesh: cmesh, ctx: cc.getContext('2d')!, tex: ctex, key: '' }
    this.hudGhostMat = new THREE.MeshBasicMaterial({ map: this.rt.texture, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: true })
    this.hudGhost = mesh(new THREE.PlaneGeometry(1, 1), this.hudGhostMat, 0, 0, 0, scene)
    this.hudGhost.renderOrder = 19
    for (const m of [this.hudVignette, cmesh, this.hudGhost]) m.frustumCulled = false
  }

  // ————————————————————————————————————————————————————————————————
  // The frame

  frame(f: SetFrame, shot: Shot) {
    this.time = f.time
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    // A screen in this shot shows another place or moment: render that first.
    const alt = this.altFor(seg, u)
    if (alt) {
      this.compose(alt.p, f, this.altShot, true)
      this.altShot.pos.copy(alt.pos)
      this.altShot.tgt.copy(alt.tgt)
      this.rtCam.position.copy(alt.pos)
      this.rtCam.lookAt(alt.tgt)
      this.rtCam.fov = alt.fov
      this.rtCam.aspect = 16 / 9
      this.rtCam.updateProjectionMatrix()
      this.hideHud()
      const r = this.renderer
      const prev = r.getRenderTarget()
      r.setRenderTarget(this.rt)
      r.clear()
      r.render(this.scene, this.rtCam)
      r.setRenderTarget(prev)
    }
    this.compose(f.p, f, shot, false)
  }

  /** Which shots need a picture of somewhere else first. */
  private altFor(seg: SegmentId, u: number): { p: number; pos: THREE.Vector3; tgt: THREE.Vector3; fov: number } | null {
    if (seg === 'dive' && u > 0.25) return { p: at('history', 0.06), pos: SQUARE_CAM.pos, tgt: SQUARE_CAM.tgt, fov: SQUARE_CAM.fov }
    if ((seg === 'feed' && u < 0.25) || (seg === 'checked' && u > 0.97)) return { p: at('feed', 0.4), pos: this.v.set(...RECORDER_LENS.pos), tgt: this.v2.set(3.3, 0.85, 0.27), fov: 55 }
    if (seg === 'history' || seg === 'repeat') {
      const { era, t } = eraAt(seg === 'history' ? at('history', u) : at('repeat', u))
      const n = seg === 'history' ? 5 : 4
      const window = 0.035 * n
      if (era > 0 && t < window && era !== 5) {
        const first = seg === 'history' ? 0 : 5
        const k0 = era - first
        const prevP = seg === 'history' ? at('history', (k0 - 0.02) / n) : at('repeat', (k0 - 0.02) / n)
        return { p: prevP, pos: SQUARE_CAM.pos, tgt: SQUARE_CAM.tgt, fov: SQUARE_CAM.fov }
      }
    }
    return null
  }

  private reset(): State {
    return {
      set: 'room',
      room: true,
      archive: false,
      walkway: false,
      who: null,
      eyes: 0,
      askew: 0,
      breath: 'awake',
      drool: 0,
      wet: 0,
      windowA: 0,
      clothFolded: true,
      clothHand: false,
      clothFly: null,
      clothTop: false,
      extraCloth: false,
      cupHand: false,
      cupFall: -1,
      chairZ: CHAIR_IN.z,
      rightDoor: 0,
      leftDoor: 0,
      lookA: 'afternoon',
      lookB: 'afternoon',
      lookT: 0,
      onT: 1,
      paint: 1,
      hair: 0,
      offT: -1,
      wallDim: 0,
      ceilDim: 0,
      grid: 0,
      circle: 0,
      rain: 0,
      scan: -1,
      redraw: 0,
      ceiling: true,
      ring: 0,
      lamp: 1,
      roomLight: 1,
      center: screenOff(),
      left: screenOff(),
      right: screenOff(),
      hud: null,
      thumb: 0,
      ghost: 0,
      hideRecorder: false,
      recAway: 0,
      recAim: 'arif',
      ringLevel: 1,
      era: -1,
      eraT: 0,
      hook: 0,
      spill: 0,
      record: -1,
    }
  }

  private compose(p: number, f: SetFrame, shot: Shot, alt: boolean) {
    const seg = segmentAt(p).id as SegmentId
    const u = local(p, seg)
    this.st = this.reset()
    this.arifC.begin()
    this.arifS.begin()
    this.ghost.begin()
    this.worldByProgress(p, seg, u)
    const keys = SHOTS[seg]
    if (keys) keyed(keys, held(u, f.reduced), shot)
    this.direct(seg, u, p, f, shot)
    this.apply(p, seg, u, f, shot, alt)
  }

  // ————————————————————————————————————————————————————————————————
  // The world as a function of progress (doors, chair, cloths, the clock, robots)

  private worldByProgress(p: number, seg: SegmentId, u: number) {
    const st = this.st
    // The clock of the room.
    const look = (a: LookName, b: LookName, t: number) => {
      st.lookA = a
      st.lookB = b
      st.lookT = clamp(t)
    }
    if (p < at('ceiling', 0.4)) look('afternoon', 'afternoon', 0)
    else if (p < SEG.wake.start) look('afternoon', 'golden', ramp(0.4, 1, local(p, 'ceiling')))
    else if (p < SEG.rise.start) look('golden', 'golden', 0)
    else if (p < SEG.walk.start) look('golden', 'sunset', local(p, 'rise'))
    else if (p < at('walk', 0.68)) look('sunset', 'dusk', ramp(0.2, 0.68, local(p, 'walk')))
    else if (p < SEG.forty.start) look('dusk', 'blue', (p - at('walk', 0.68)) / (SEG.forty.start - at('walk', 0.68)))
    else if (p < SEG.reopen.start) look('blue', 'night', ramp(0.05, 0.6, local(p, 'forty')))
    else look('night', 'night', 0)
    // Drizzle from `forty` 0.38; lighter through the night.
    if (p >= at('forty', 0.38) && p < SEG.records.start) st.rain = p < SEG.reopen.start ? ramp(0.38, 0.5, local(p, 'forty')) : p < SEG.hover.start ? 0.7 : 0.45
    // The scan line redraws the forest a little differently.
    if (p >= at('forty', 0.6)) st.redraw = 1
    if (seg === 'forty' && u >= 0.6 && u < 0.72) {
      st.redraw = 0
      st.scan = ((u - 0.6) / 0.12) * 4.8
    }
    // The chair.
    const out = CHAIR_OUT.z
    if (p >= at('rise', 0.15) && p < at('sits', 0.4)) st.chairZ = seg === 'rise' ? lerp(CHAIR_IN.z, out, ramp(0.15, 0.45, u)) : seg === 'sits' ? lerp(out, CHAIR_IN.z, ramp(0.25, 0.4, u)) : out
    if (p >= at('hover', 0.75) && p < at('whistle', 0.95)) st.chairZ = seg === 'hover' ? lerp(CHAIR_IN.z, out, ramp(0.75, 0.95, u)) : seg === 'whistle' ? lerp(out, CHAIR_IN.z, ramp(0.78, 0.95, u)) : out
    if (p >= SEG.halt.start) st.chairZ = out
    // Doors.
    if (seg === 'rightDoor') st.rightDoor = 1.3 * ease(ramp(0.25, 0.55, u)) * (1 - ramp(0.95, 0.99, u))
    if (seg === 'reopen') st.rightDoor = 1.3 * ease(ramp(0.1, 0.3, u))
    if (seg === 'robots') st.rightDoor = 1.3 * (1 - ease(ramp(0.6, 0.8, u)))
    if (seg === 'again') st.rightDoor = 1.25 * ramp(0.4, 0.44, u) * (1 - ramp(0.52, 0.56, u))
    if (p >= at('leftDoor', 0.35)) st.leftDoor = seg === 'leftDoor' ? 1.45 * ease(ramp(0.35, 0.95, u)) : 1.45
    // The left door's light across the planks.
    st.spill = seg === 'leftDoor' ? ramp(0.38, 0.9, u) : p >= SEG.deep.start ? 1 : 0
    // Cloths.
    st.clothFolded = p < at('wipe', 0.6) || (p >= at('again', 0.45) && p < at('again', 0.715))
    st.clothTop = p >= at('throw', 0.48)
    st.extraCloth = p >= at('again', 0.9) || this.iteration > BASE_ITERATION
    // The button's ring: deep red from `red` 0.08, out at the end of `press`.
    if (p >= at('red', 0.08) && p < SEG.dark.start) st.ring = seg === 'red' ? ramp(0.08, 0.3, u) : seg === 'press' ? 1 - ramp(0.75, 0.95, u) : 1
    // Robot rings dim after RUTİN.
    st.ringLevel = p >= SEG.hover.start ? 0.25 : 1
    // The hooked cloud: in its first-evening place, a little shifted on other passes.
    st.hook = this.iteration % 2 === 1 ? 1 : 0
  }

  // ————————————————————————————————————————————————————————————————
  // Direction: what each segment shows

  private direct(seg: SegmentId, u: number, p: number, f: SetFrame, shot: Shot) {
    const st = this.st
    const C = this.arifC
    const S = this.arifS
    switch (seg) {
      // ——— 01 UYANIŞ ———
      case 'black': {
        this.asleep(C)
        st.hair = ramp(0.3, 0.4, u)
        st.onT = u < 0.4 ? -0.01 : ((u - 0.4) / 0.5) * 1.001
        st.paint = ramp(0.9, 1.0, u)
        st.roomLight = clamp(st.onT) * 0.8 + st.hair * 0.04
        st.lamp = ramp(0.45, 0.9, u)
        if (u < 0.3) shot.fade = 1
        break
      }
      case 'asleep':
        this.asleep(C)
        st.windowA = u > 0.3 ? this.breathWindow() : 0
        break
      case 'desk':
        this.asleep(C)
        st.windowA = u > 0.6 ? this.breathWindow() : 0.4 * this.breathWindow()
        break
      case 'walls':
      case 'stream':
      case 'doors':
      case 'ceiling':
        this.asleep(C)
        break
      case 'wake':
        this.wake(C, u)
        break
      case 'wipe':
        this.wipe(C, u)
        break
      case 'throw':
        this.throwAct(C, u)
        if (u > 0.25 && u < 0.5 && st.clothFly) {
          // The camera stays put and pans with the arc.
          const w = ramp(0.25, 0.32, u)
          shot.tgt.lerp(st.clothFly, w * (1 - ramp(0.46, 0.5, u)))
        }
        break
      // ——— 02 DIŞARISI ———
      case 'rise':
        this.rise(C, u)
        break
      case 'walk': {
        C.walk(W.walk, u, LISTENING, undefined, undefined, 0.85)
        this.heavy(C)
        st.clothFolded = false
        this.follow(shot, C, 1.2, 0.35)
        break
      }
      case 'floor':
        C.walk(W.floor, u / 0.7, LISTENING, undefined, PI / 2, 0.85)
        this.heavy(C)
        break
      case 'rightDoor':
        this.rightDoor(C, u)
        break
      case 'forty':
        break
      // ——— 03 RUTİN ———
      case 'reopen':
        this.reopen(S, u)
        break
      case 'robots': {
        S.walk(W.toDesk, u, P.STAND, undefined, PI)
        // The camera keeps the robots in view.
        const cx = (this.coffee.x + this.snack.x + this.rec.x) / 3
        const cz = (this.coffee.z + this.snack.z + this.rec.z) / 3
        shot.tgt.set(lerp(shot.tgt.x, cx, 0.6), 0.55, lerp(shot.tgt.z, cz, 0.6))
        if (u > 0.5) shot.tgt.lerp(this.v.set(this.rec.x, 0.8, this.rec.z), ramp(0.5, 0.65, u) * 0.6)
        break
      }
      case 'sits':
        this.sits(S, u)
        break
      case 'reach':
        this.reachAct(S, u)
        break
      case 'sip':
        this.sipAct(S, u)
        break
      case 'thousands': {
        const r = u < 0.45 ? 0.05 + (u / 0.45) * 0.88 : 1
        if (u < 0.45) this.reachAct(S, r)
        else this.sipAct(S, 0.1 + ((u - 0.45) / 0.55) * 0.9)
        // The ghost of the previous catch, a beat behind.
        st.ghost = 0.22 * window4(0.42, 0.52, 0.68, 0.8, u)
        if (st.ghost > 0) this.sipAct(this.ghost, clamp(0.1 + ((u - 0.42) / 0.55) * 0.9), true)
        this.recordFrame(shot, null)
        break
      }
      // ——— 04 ARŞİV ———
      case 'hover':
        this.hover(S, u)
        break
      case 'toLeft':
        S.walk(W.toLeft, u, P.STAND, PI, -PI / 2)
        this.follow(shot, S, 0.25, 0)
        break
      case 'leftDoor':
        this.leftDoor(S, u)
        break
      case 'deep':
        S.place(-4.6, -0.3, -PI / 2).hold(P.STAND).lookAt(-12, 0, 0.3)
        st.archive = true
        break
      case 'aisles':
      case 'core':
        S.place(-4.6, -0.3, -PI / 2).hold(P.STAND)
        st.archive = true
        st.set = 'archive'
        break
      case 'lever':
        this.lever(S, u)
        st.archive = true
        break
      case 'whistle':
        this.whistle(S, u)
        break
      // ——— 05 TARİH ———
      case 'red':
        this.seated(S, P.SIT_STRAIGHT)
        S.lookAt(0, -2, 1)
        st.center = { mode: 'sort', a: 1, b: 0, t: ramp(0.5, 1, u), level: ramp(0.5, 0.58, u) }
        st.left = { mode: 'sort', a: 1, b: 0, t: ramp(0.55, 1, u), level: ramp(0.52, 0.6, u) }
        st.right = { mode: 'sort', a: 1, b: 0, t: ramp(0.58, 1, u), level: ramp(0.55, 0.62, u) }
        break
      case 'dive':
        this.seated(S, P.SIT_STRAIGHT)
        st.center = { mode: 'sort', a: 1, b: 0, t: 1, level: 1 }
        st.left = { mode: 'sort', a: 1, b: 0, t: 1, level: 1 }
        st.right = { mode: 'sort', a: 1, b: 0, t: 1, level: 1 }
        st.thumb = ramp(0.25, 0.9, u)
        break
      case 'history':
      case 'repeat': {
        const { era, t } = eraAt(p)
        st.set = 'square'
        st.era = era
        st.eraT = t
        shot.pos.copy(SQUARE_CAM.pos)
        shot.tgt.copy(SQUARE_CAM.tgt)
        shot.fov = SQUARE_CAM.fov
        // The ghost of the previous era (≤ 0.3), crossfading out.
        const n = seg === 'history' ? 5 : 4
        const win = 0.035 * n
        if (era > 0 && era !== 5 && t < win) {
          st.ghost = 0.3 * (1 - t / win)
          shot.locked = true
        }
        break
      }
      // ——— 06 ÖRÜNTÜ ———
      case 'network': {
        if (u < 0.1) {
          // The square goes dark around its points.
          const { era } = eraAt(SEG.network.start - 1e-6)
          st.set = 'square'
          st.era = era
          st.eraT = 1
          shot.pos.copy(SQUARE_CAM.pos)
          shot.tgt.copy(SQUARE_CAM.tgt)
          shot.fov = SQUARE_CAM.fov
          shot.locked = true
        } else st.set = 'void'
        break
      }
      case 'spiral':
      case 'above':
      case 'beyond':
      case 'anomaly':
        st.set = 'void'
        break
      // ——— 07 ANOMALİ ———
      case 'checked':
        this.checked(S, u)
        break
      case 'feed':
        if (u < 0.25) {
          this.seated(S, LEAN_DESK)
          S.lookAt(0, -2, 1)
          st.thumb = 1
          st.center = { mode: 'record', a: 1, b: 0, t: 0, level: 1 }
        } else this.recordOfTomorrow(shot, 'subject', u)
        break
      case 'feedWide':
        if (u < 0.5) this.recordOfTomorrow(shot, 'subject', 1)
        else {
          this.seated(S, SIT_BACK_SLOW)
          S.lookAt(MARKS.recorder[0], MARKS.recorder[1], ramp(0.6, 0.75, u))
          st.center = { mode: 'grid', a: 0.6, b: 0, t: 0, level: 0.5 }
        }
        break
      // ——— 08 TEKERRÜR ———
      case 'back':
        this.button(S, u, 'back')
        break
      case 'press':
        this.button(S, u, 'press')
        break
      case 'dark':
        this.seated(S, P.SIT_STILL)
        st.set = 'black'
        shot.fade = 0
        break
      case 'word':
        this.seated(S, P.SIT_STILL)
        st.onT = 1
        st.grid = 1
        st.wallDim = 1 - 0.7 * ramp(0.62, 1, u)
        st.ceilDim = 1 - 0.5 * ramp(0.7, 1, u)
        st.lamp = 0
        st.roomLight = 0.06 * ramp(0.62, 1, u)
        st.center = u < 0.62 ? { mode: 'line', a: ramp(0.05, 0.12, u), b: 0, t: 0, level: 1 } : { mode: 'grid', a: ramp(0.62, 1, u), b: 0, t: 0, level: 0.35 }
        st.left = u < 0.62 ? screenOff() : { mode: 'grid', a: ramp(0.65, 1, u), b: 0, t: 0, level: 0.25 }
        st.right = st.left
        if (u < 0.05) shot.fade = 0
        break
      case 'law':
        this.seated(S, P.SIT_STILL)
        S.lookAt(-1.5, -4, 0.4)
        st.grid = 0.5
        st.circle = 1
        st.wallDim = 0.25
        st.ceilDim = 0.5
        st.lamp = 0
        st.roomLight = 0.16
        st.center = { mode: 'circle', a: 1, b: 0, t: 0, level: 0.4 }
        st.left = { mode: 'grid', a: 1, b: 0, t: 0, level: 0.25 }
        st.right = st.left
        break
      // ——— 09 GÖZLEMCİ ———
      case 'records':
        this.records(p, u, shot)
        break
      case 'engine':
        this.seated(S, P.SIT_STILL)
        st.circle = 1
        st.grid = 0.4
        st.wallDim = 0.3
        st.ceiling = false
        st.lamp = 0.2
        st.roomLight = 0.2
        st.center = { mode: 'circle', a: 1, b: 0, t: 0, level: 0.4 }
        st.left = { mode: 'grid', a: 1, b: 0, t: 0, level: 0.25 }
        st.right = st.left
        {
          const a = (u - 0.5) * (10 * PI) / 180
          shot.pos.set(Math.sin(a) * 0.01, 14, Math.cos(a) * 0.01)
          shot.locked = true
        }
        break
      case 'again':
        this.again(C, u, shot)
        break
      case 'halt':
        this.halt(C, u, shot)
        break
      case 'turn':
        this.turnAct(C, u)
        break
      case 'observer':
        this.observer(C, u, shot)
        break
      case 'maybe':
        this.observer(C, 1, shot)
        st.wallDim = ramp(0.0, 0.35, u)
        st.ceilDim = ramp(0.3, 0.6, u)
        st.center = { mode: 'observer', a: 1 - ramp(0.55, 0.8, u), b: 1 - ramp(0.55, 0.8, u), t: 0, level: 1 - ramp(0.55, 0.8, u) }
        st.lamp = 1 - ramp(0.2, 0.7, u)
        st.roomLight = 1 - ramp(0.0, 0.75, u)
        st.spill *= 1 - ramp(0.2, 0.7, u)
        break
      case 'end':
        this.observer(C, 1, shot)
        st.wallDim = 1
        st.ceilDim = 1
        st.lamp = 0
        st.roomLight = 0
        st.spill = 0
        shot.fade = 0
        break
    }
    void f
  }

  // ——— Acts ———

  private seated(a: Actor, pose = P.SIT, chairZ = this.st.chairZ) {
    this.st.who = a === this.arifC ? 'c' : a === this.arifS ? 's' : this.st.who
    a.place(0, chairZ + SEAT_BACK, PI).hold(pose)
    return a
  }

  private asleep(a: Actor) {
    const st = this.st
    this.seated(a, ASLEEP, CHAIR_IN.z)
    st.eyes = 1
    st.askew = 1
    st.breath = 'sleep'
    st.drool = 1
    st.wet = 1
  }

  /** The small pale window opening and closing with each breath. */
  private breathWindow() {
    const b = Math.sin(this.time * 1.25 + 0.6 * Math.sin(this.time * 0.37))
    return 0.35 + 0.65 * smoothstep(-0.2, 0.9, b)
  }

  private wake(a: Actor, u: number) {
    const st = this.st
    this.seated(a, ASLEEP, CHAIR_IN.z)
    a.blend(
      [
        [0, ASLEEP],
        [0.62, ASLEEP],
        [0.8, SIT_UP],
        [0.86, RUB],
        [1, RUB],
      ],
      u,
    )
    st.eyes = 1 - ramp(0.45, 0.6, u)
    st.askew = 1 - ramp(0.24, 0.32, u)
    st.drool = 1 - ramp(0.55, 0.65, u)
    st.wet = 1
    st.breath = u < 0.6 ? 'sleep' : 'awake'
    // The hanging right arm rises; two fingers push the glasses straight.
    const wr = window4(0.05, 0.22, 0.32, 0.42, u)
    if (wr > 0) {
      a.apply(this.time, false)
      a.figure.glasses.getWorldPosition(this.v)
      this.v.y -= 0.01
      a.reach('r', wr, this.v.x, this.v.y, this.v.z, 0.7)
    }
    // Both hands to the face, rubbing.
    const wf = ramp(0.8, 0.88, u)
    if (wf > 0) {
      a.apply(this.time, false)
      const head = a.figure.joints.head
      const rub = Math.sin(this.time * 7) * 0.012
      head.localToWorld(this.v.set(0.03, 0.12 + rub, 0.13))
      head.localToWorld(this.v2.set(-0.03, 0.12 - rub, 0.13))
      a.reach('l', wf, this.v.x, this.v.y, this.v.z, 0.6)
      a.reach('r', wf, this.v2.x, this.v2.y, this.v2.z, 0.6)
    }
  }

  private wipe(a: Actor, u: number) {
    const st = this.st
    this.seated(a, SIT_UP, CHAIR_IN.z)
    a.blend(
      [
        [0, SIT_UP],
        [0.45, SIT_UP],
        [0.52, BEND_SEAT],
        [0.62, BEND_SEAT],
        [0.7, LEAN_DESK],
        [0.95, LEAN_DESK],
        [1, SIT_UP],
      ],
      u,
    )
    st.wet = 1 - ramp(0.72, 0.9, u)
    st.windowA = (1 - ramp(0.6, 0.72, u)) * 0.6
    st.clothFolded = u < 0.6
    st.clothHand = u >= 0.6
    // The back of the left hand across the cheek.
    const wc = window4(0.05, 0.16, 0.32, 0.42, u)
    if (wc > 0) {
      a.apply(this.time, false)
      const s = Math.sin(((u - 0.12) / 0.2) * PI * 2) * 0.03
      a.figure.joints.head.localToWorld(this.v.set(0.085, 0.07, 0.06 + s))
      a.reach('l', wc, this.v.x, this.v.y, this.v.z, 0.8)
    }
    // Down to the cloth under the seat.
    const wb = window4(0.48, 0.56, 0.6, 0.66, u)
    if (wb > 0) {
      this.room.clothFolded.getWorldPosition(this.v)
      a.reach('r', wb, this.v.x, this.v.y + 0.03, this.v.z, 0.6)
    }
    // Wiping the glass where his cheek was.
    const ww = window4(0.64, 0.72, 0.92, 0.98, u)
    if (ww > 0) {
      const t = (u - 0.64) * 40
      a.reach('r', ww, CHEEK_SPOT.x + 0.05 + Math.cos(t) * 0.06, DESK.y + 0.05, CHEEK_SPOT.z + 0.02 + Math.sin(t) * 0.04, 0.7)
    }
  }

  private throwAct(a: Actor, u: number) {
    const st = this.st
    this.seated(a, SIT_UP, CHAIR_IN.z)
    a.blend(
      [
        [0, SIT_UP],
        [0.1, SIT_UP],
        [0.2, THROW_COCK],
        [0.25, THROW_RELEASE],
        [0.32, THROW_RELEASE],
        [0.6, SIT_UP],
      ],
      u,
    )
    st.clothFolded = false
    st.clothHand = u < 0.25
    if (u >= 0.25 && u < 0.48) {
      const t = (u - 0.25) / 0.23
      const from = this.releasePoint
      const to = this.boxTop()
      st.clothFly = this.v3.set(lerp(from.x, to.x, t), lerp(from.y, to.y, t) + 2.0 * 4 * t * (1 - t), lerp(from.z, to.z, t))
    }
  }

  private boxTop() {
    this.room.clothTop.getWorldPosition(this.v2)
    return this.v2
  }

  private rise(a: Actor, u: number) {
    const st = this.st
    st.clothFolded = false
    if (u < 0.6) {
      a.place(0, lerp(CHAIR_IN.z + SEAT_BACK, CHAIR_IN.z - 0.02, ramp(0.15, 0.45, u)), PI)
      a.blend(
        [
          [0, SIT_UP],
          [0.15, SIT_UP],
          [0.32, P.LEAN_SOFT],
          [0.45, P.STAND],
        ],
        u,
      )
      this.st.who = 'c'
    } else a.walk(W.rise, (u - 0.6) / 0.4, P.STAND, PI)
    this.st.who = 'c'
  }

  /** Heavy steps: shoulders down, the head lowered. */
  private heavy(a: Actor) {
    this.st.who = a === this.arifC ? 'c' : 's'
  }

  private rightDoor(a: Actor, u: number) {
    const st = this.st
    st.walkway = true
    st.who = 'c'
    if (u < 0.85) {
      const x = lerp(4.35, 4.75, ramp(0.3, 0.55, u))
      const z = lerp(0.3, 0.2, ramp(0.3, 0.55, u))
      a.place(x, z, PI / 2).blend(
        [
          [0, P.STAND],
          [0.55, P.STAND],
          [0.65, LISTENING],
        ],
        u,
      )
      // The hand on the heavy handle, pushing the leaf out.
      const wh = window4(0.08, 0.22, 0.42, 0.52, u)
      if (wh > 0) {
        this.room.rightLeaf.rotation.y = st.rightDoor
        this.room.rightLeaf.updateMatrixWorld(true)
        this.room.rightLeaf.localToWorld(this.v.copy(RIGHT_HANDLE))
        a.reach('r', wh, this.v.x, this.v.y, this.v.z, 0.5)
      }
    } else {
      a.walk(W.through, (u - 0.85) / 0.15, P.STAND, PI / 2)
    }
  }

  private reopen(a: Actor, u: number) {
    const st = this.st
    st.walkway = true
    st.who = 's'
    if (u < 0.3) a.place(6.2, 0.0, -PI / 2).hold(P.STAND)
    else a.walk(W.inside, (u - 0.3) / 0.7, P.STAND, -PI / 2)
  }

  private sits(a: Actor, u: number) {
    const st = this.st
    st.who = 's'
    if (u < 0.1) {
      a.place(0.05, 1.02, PI).hold(P.STAND)
      return
    }
    // Back onto the pushed-out chair, sitting, and rolling in with it.
    const back = ramp(0.1, 0.25, u)
    const z = lerp(1.02, CHAIR_OUT.z + SEAT_BACK, back)
    const chairZ = lerp(CHAIR_OUT.z, CHAIR_IN.z, ramp(0.4, 0.55, u))
    st.chairZ = chairZ
    a.place(lerp(0.05, 0, back), u < 0.4 ? z : chairZ + SEAT_BACK, PI)
    a.blend(
      [
        [0.1, P.STAND],
        [0.22, P.LEAN_SOFT],
        [0.4, P.SIT],
        [0.6, SIT_UP],
      ],
      u,
    )
    a.lookAt(MARKS.coffee[0], MARKS.coffee[1], 0)
  }

  /** The right hand out into the empty air; the robot brings the cup; the cup to his lips. */
  private reachAct(a: Actor, u: number, ghost = false) {
    const st = this.st
    this.seated(a, SIT_UP, CHAIR_IN.z)
    a.blend(
      [
        [0, SIT_UP],
        [0.05, SIT_UP],
        [0.22, HAND_OUT],
        [0.5, HAND_OUT],
        [0.62, SIT_UP],
        [0.75, SIP],
        [0.9, SIP],
      ],
      u,
    )
    a.lookAt(0, -2, 1)
    const wo = ramp(0.05, 0.22, u) * (1 - ramp(0.48, 0.6, u))
    if (wo > 0) a.reach('r', wo, HAND.x, HAND.y + 0.02, HAND.z, 0.9)
    if (u >= 0.6) {
      a.apply(this.time, false)
      a.figure.mouth.getWorldPosition(this.v)
      const w = ramp(0.6, 0.78, u)
      a.reach('r', w, this.v.x + 0.05, this.v.y - 0.06, this.v.z - 0.07, 0.4)
    }
    if (!ghost) st.cupHand = u >= 0.42
  }

  /** One sip, the cup held out to the same place, let go, caught. */
  private sipAct(a: Actor, u: number, ghost = false) {
    const st = this.st
    this.seated(a, SIP, CHAIR_IN.z)
    a.blend(
      [
        [0, SIP],
        [0.22, SIP],
        [0.38, HAND_OUT],
        [0.5, HAND_OUT],
        [0.7, SIT_UP],
      ],
      u,
    )
    a.lookAt(0, -2, 1)
    if (u < 0.25) {
      a.apply(this.time, false)
      a.figure.mouth.getWorldPosition(this.v)
      const tip = window4(0.08, 0.14, 0.2, 0.25, u)
      a.reach('r', 1 - ramp(0.22, 0.25, u) * 0, this.v.x + 0.05 - tip * 0.02, this.v.y - 0.06 + tip * 0.02, this.v.z - 0.07 + tip * 0.03, 0.4)
      if (u > 0.2) {
        const w = ramp(0.2, 0.25, u)
        a.reach('r', w, HAND.x, HAND.y + 0.02, HAND.z, 0.9)
      }
    } else {
      const w = 1 - ramp(0.5, 0.62, u)
      if (w > 0) a.reach('r', w, HAND.x, HAND.y + 0.02, HAND.z, 0.9)
    }
    if (ghost) return
    st.cupHand = u < 0.42
    st.cupFall = u >= 0.42 ? ramp(0.42, 0.48, u) : -1
  }

  private hover(a: Actor, u: number) {
    const st = this.st
    st.who = 's'
    if (u < 0.75) {
      this.seated(a, SIT_UP, CHAIR_IN.z)
      a.lookAt(0, -2, 1 - ramp(0.58, 0.72, u))
      if (u > 0.58) a.lookAt(-5, 0, ramp(0.58, 0.72, u))
      // The index finger comes down toward the button and stops a centimetre above it.
      const w = ramp(0.06, 0.2, u) * (1 - ramp(0.55, 0.7, u))
      if (w > 0) {
        const d = 1 - ease(ramp(0.1, 0.48, u))
        a.reach('r', w, HOVER_AT.x + 0.04 * d, HOVER_AT.y + 0.16 * d, HOVER_AT.z + 0.22 * d, 0.5)
      }
    } else {
      a.place(0, lerp(CHAIR_IN.z + SEAT_BACK, CHAIR_IN.z - 0.03, ramp(0.75, 0.95, u)), PI)
      a.blend(
        [
          [0.75, SIT_UP],
          [0.86, P.LEAN_SOFT],
          [0.97, P.STAND],
        ],
        u,
      )
      a.lookAt(-5, 0, 0.6)
    }
  }

  private leftDoor(a: Actor, u: number) {
    const st = this.st
    st.who = 's'
    st.archive = u > 0.3
    const x = lerp(-4.4, -4.6, ramp(0.4, 0.9, u))
    const z = lerp(-0.2, -0.3, ramp(0.4, 0.9, u))
    a.place(x, z, -PI / 2).hold(P.STAND)
    const wh = window4(0.05, 0.25, 0.6, 0.75, u)
    if (wh > 0) {
      this.room.leftLeaf.rotation.y = st.leftDoor
      this.room.leftLeaf.updateMatrixWorld(true)
      this.room.leftLeaf.localToWorld(this.v.copy(LEFT_HANDLE))
      a.reach('r', wh, this.v.x, this.v.y, this.v.z, 0.5)
    }
  }

  private lever(a: Actor, u: number) {
    const st = this.st
    st.who = 's'
    if (u < 0.25) a.walk(W.inArchive, u / 0.25, P.STAND, -PI / 2, 2.1)
    else a.place(-6.05, -0.95, 2.1).hold(P.STAND)
    st.set = 'archive'
    const wl = window4(0.24, 0.36, 0.5, 0.6, u)
    if (wl > 0) {
      this.archive.lever.updateMatrixWorld(true)
      this.archive.lever.localToWorld(this.v.copy(SWITCH_HANDLE))
      a.reach('r', wl, this.v.x - 0.02, this.v.y, this.v.z, 0.5)
    }
  }

  private whistle(a: Actor, u: number) {
    const st = this.st
    st.who = 's'
    if (u < 0.75) {
      a.walk(W.back, u / 0.75, P.STAND, 2.1, PI)
      // Shoulders bobbing to the rhythm.
      a.figure.joints.chest.rotation.z += 0
      a.pose[2 + 2 * 3 + 2] += Math.sin(this.time * 9) * 0.04
    } else {
      const sit = ramp(0.8, 0.92, u)
      a.place(0, lerp(1.06, CHAIR_IN.z + SEAT_BACK, sit), PI)
      a.blend(
        [
          [0.75, P.STAND],
          [0.8, P.LEAN_SOFT],
          [0.92, P.SIT],
          [1, SIT_UP],
        ],
        u,
      )
      // Two fingers drumming on the desk.
      const wt = window4(0.74, 0.78, 0.88, 0.94, u)
      if (wt > 0) a.reach('l', wt, -0.32, DESK.y + 0.04 + Math.max(0, Math.sin(this.time * 14)) * 0.025, 0.66, 0.6)
    }
  }

  private checked(a: Actor, u: number) {
    const st = this.st
    this.seated(a, SIT_UP, CHAIR_IN.z)
    a.blend(
      [
        [0, SIT_UP],
        [0.08, LEAN_DESK],
        [0.56, LEAN_DESK],
        [0.85, SIT_BACK_SLOW],
      ],
      u,
    )
    a.lookAt(2.15, -0.25, 1 - ramp(0.56, 0.8, u) * 0.6)
    st.right = { mode: 'dates', a: ramp(0.08, 0.15, u), b: ramp(0.24, 0.32, u), t: 0, level: 1 }
    st.center = { mode: 'circle', a: 1, b: 0, t: 0, level: 0.75 }
    st.left = { mode: 'sort', a: 1, b: 0, t: 1, level: 0.6 }
  }

  /** The record of tomorrow, 05:12, from the recorder's lens: the room asleep. */
  private recordOfTomorrow(shot: Shot, label: 'subject', u: number) {
    this.predawnRoom()
    this.recordFrame(shot, { code1: `SUBJECT · ${iterationDate(this.iteration + 1)} · 05:12`, code2: '' })
    void label
    void u
  }

  /** The room at 05:12: the sleeper in the cardigan, the robots on their marks, rings dim. */
  private predawnRoom() {
    const st = this.st
    this.asleep(this.arifC)
    st.lookA = 'predawn'
    st.lookB = 'predawn'
    st.lookT = 0
    st.rain = 0
    st.chairZ = CHAIR_IN.z
    st.ring = 0
    st.lamp = 0
    st.ringLevel = 0.25
    st.center = screenOff()
    st.left = screenOff()
    st.right = screenOff()
    st.clothFolded = true
    st.hideRecorder = true
  }

  /** The recorder's framing: locked, a soft vignette, a timecode at the top right. */
  private recordFrame(shot: Shot, code: { code1: string; code2: string } | null) {
    shot.locked = true
    shot.handheld = 0
    this.st.hideRecorder = true
    this.st.hud = { code1: code?.code1 ?? '', code2: code?.code2 ?? '', vignette: 1 }
  }

  private button(a: Actor, u: number, which: 'back' | 'press') {
    const st = this.st
    this.seated(a, SIT_UP, CHAIR_IN.z)
    a.lookAt(0, -2, 1)
    st.center = { mode: 'record', a: 0.6, b: 0, t: 0, level: 0.55 }
    st.left = { mode: 'grid', a: 0.7, b: 0, t: 0, level: 0.35 }
    st.right = { mode: 'dates', a: 0.8, b: 0.8, t: 0, level: 0.45 }
    st.thumb = 0.55
    if (which === 'back') {
      const w = ramp(0.45, 0.62, u)
      if (w > 0) a.reach('r', w, HOVER_AT.x + 0.03, HOVER_AT.y + 0.06 * (1 - ramp(0.62, 1, u)), HOVER_AT.z + 0.04, 0.5)
      return
    }
    // The press: down, past the place where it stopped, and in.
    const down = ramp(0.0, 0.32, u)
    a.reach('r', 1 - ramp(0.5, 0.7, u), HOVER_AT.x + 0.03 - down * 0.01, HOVER_AT.y + 0.06 - down * 0.105, HOVER_AT.z + 0.04 - down * 0.08, 0.5)
    // Everything goes black in sequence.
    const off = ramp(0.4, 0.75, u)
    st.offT = u < 0.4 ? -1 : off
    const screens = 1 - ramp(0.38, 0.43, u)
    st.center.level *= screens
    st.left.level *= screens
    st.right.level *= screens
    st.thumb *= screens
    st.lamp = 1 - ramp(0.42, 0.6, u)
    st.roomLight = 1 - ramp(0.4, 0.78, u)
    st.spill = 1 - ramp(0.55, 0.75, u)
    st.rain = st.rain * (1 - off)
    if (u > 0.75) {
      // Only the ring.
      st.roomLight = 0
      st.spill = 0
      st.offT = 1.1
    }
  }

  private records(p: number, u: number, shot: Shot) {
    const st = this.st
    const { record, t } = recordAt(p)
    st.record = record
    if (u < 0.02) {
      // The centre screen flashes: the match cut into the first record.
      this.seated(this.arifS, P.SIT_STILL)
      st.grid = 0.5
      st.circle = 1
      st.wallDim = 0.25
      st.ceilDim = 0.5
      st.lamp = 0
      st.roomLight = 0.16
      st.center = { mode: 'flash', a: 1, b: 0, t: 0, level: 1 }
      shot.pos.set(0, 1.5, 1.6)
      shot.tgt.set(0, 1.55, -0.6)
      shot.fov = 40
      return
    }
    // Each record: an earlier evening, from the recorder's stop.
    const aim = RECORD_AIM[record]
    shot.pos.set(...RECORDER_LENS.pos)
    shot.tgt.set(aim[0], aim[1], aim[2])
    shot.fov = aim[3]
    this.recordFrame(shot, { code1: iterationDate(this.iteration + record), code2: RECORD_TIMES[record] })
    st.redraw = record % 2 ? 1 : 0
    st.leftDoor = 0
    st.spill = 0
    st.ring = 0
    st.ringLevel = 1
    st.archive = false
    st.center = screenOff()
    st.left = screenOff()
    st.right = screenOff()
    // Something tiny differs in each: the cloud, one more cloth.
    st.hook = record === 0 || record === 3 ? 1 : 0
    st.extraCloth = record >= 2
    const lt = 0.08 + t * 0.84
    switch (record) {
      case 0:
        st.lookA = 'golden'
        st.lookB = 'golden'
        st.chairZ = CHAIR_IN.z
        st.clothTop = false
        st.clothFolded = true
        this.wake(this.arifC, 0.02 + lt * 0.45)
        break
      case 1:
        st.lookA = 'golden'
        st.lookB = 'golden'
        st.chairZ = CHAIR_IN.z
        st.clothTop = false
        this.throwAct(this.arifC, 0.05 + lt * 0.55)
        st.clothTop = 0.05 + lt * 0.55 >= 0.48
        break
      case 2:
        st.lookA = 'night'
        st.lookB = 'night'
        st.rain = 0.45
        st.chairZ = CHAIR_IN.z
        st.clothTop = true
        this.hover(this.arifS, 0.05 + lt * 0.6)
        break
      case 3:
        st.lookA = 'night'
        st.lookB = 'night'
        st.rain = 0.6
        st.chairZ = CHAIR_IN.z
        st.clothTop = true
        this.sipAct(this.arifS, 0.2 + lt * 0.5)
        break
      case 4:
        st.lookA = 'sunset'
        st.lookB = 'dusk'
        st.lookT = t
        st.chairZ = CHAIR_OUT.z
        st.clothTop = true
        st.clothFolded = false
        this.arifC.walk(W.walk, 0.1 + lt * 0.8, LISTENING, undefined, undefined, 0.85)
        st.who = 'c'
        break
    }
  }

  private again(a: Actor, u: number, shot: Shot) {
    const st = this.st
    if (u < 0.45) {
      this.predawnRoom()
      st.hideRecorder = u < 0.45
      if (u < 0.45) this.recordFrame(shot, null)
      // The time-lapse: the sky runs from dawn through noon to late afternoon.
      if (u >= 0.4) {
        const t = (u - 0.4) / 0.15
        if (t < 0.33) {
          st.lookA = 'predawn'
          st.lookB = 'dawn'
          st.lookT = t / 0.33
        } else {
          st.lookA = 'dawn'
          st.lookB = 'noon'
          st.lookT = (t - 0.33) / 0.67
        }
      }
      return
    }
    st.hideRecorder = false
    st.ringLevel = 1
    if (u < 0.55) {
      this.asleep(a)
      const t = (u - 0.4) / 0.15
      st.lookA = t < 0.6 ? 'dawn' : 'noon'
      st.lookB = t < 0.6 ? 'noon' : 'afternoon'
      st.lookT = t < 0.6 ? (t - 0.0) / 0.6 : (t - 0.6) / 0.4
      st.redraw = 0
      st.clothTop = true
      return
    }
    st.lookA = 'afternoon'
    st.lookB = 'afternoon'
    st.redraw = 0
    st.rain = 0
    st.ring = 0
    // A quick replay of the waking: glasses, the cheek, the cloth (it lands at 0.9).
    const v = (u - 0.55) / 0.45
    if (v < 0.25) this.wake(a, 0.02 + (v / 0.25) * 0.6)
    else if (v < 0.36) this.wake(a, 0.62 + ((v - 0.25) / 0.11) * 0.18)
    else if (v < 0.52) this.wipe(a, 0.05 + ((v - 0.36) / 0.16) * 0.9)
    else this.throwAct(a, 0.05 + ((v - 0.52) / 0.48) * 0.6)
    st.clothTop = true
    if (v >= 0.52) {
      const tu = 0.05 + ((v - 0.52) / 0.48) * 0.6
      if (tu > 0.25 && tu < 0.48 && st.clothFly) shot.tgt.lerp(st.clothFly, 0.5)
    }
  }

  private halt(a: Actor, u: number, shot: Shot) {
    const st = this.st
    st.who = 'c'
    st.clothFolded = false
    st.clothTop = true
    st.extraCloth = true
    if (u < 0.52) a.walk(W.halt, u / 0.52, LISTENING, undefined, PI / 2, 0.85)
    else
      a.place(2.2, 1.2, PI / 2).blend(
        [
          [0.52, P.STAND],
          [0.62, P.STAND],
          [0.75, STAND_SHIFT],
          [0.88, P.STAND],
        ],
        u,
      )
    this.follow(shot, a, 1.15, 0.5)
  }

  private turnAct(a: Actor, u: number) {
    const st = this.st
    st.who = 'c'
    st.clothFolded = false
    st.clothTop = true
    st.extraCloth = true
    const yaw = angleLerp(PI / 2, Math.atan2(-2.2, -1.2), ease(ramp(0.05, 0.4, u)))
    a.place(2.2, 1.2, yaw).hold(P.STAND)
    const turning = window4(0.05, 0.12, 0.33, 0.4, u)
    if (turning > 0) addWalk(a.pose, u * 40, turning * 0.25)
    a.lookAt(0, -0.6, ramp(0.2, 0.4, u))
    st.recAway = ramp(0.45, 0.75, u)
  }

  private observer(a: Actor, u: number, shot: Shot) {
    const st = this.st
    st.who = 'c'
    st.clothFolded = false
    st.clothTop = true
    st.extraCloth = true
    const face = Math.atan2(-2.2, -1.2)
    const toCam = Math.atan2(shot.pos.x - 2.2, shot.pos.z - 1.2)
    const turn = ease(ramp(0.55, 0.95, u))
    a.place(2.2, 1.2, angleLerp(face, angleLerp(face, toCam, 0.55), turn)).hold(P.STAND)
    if (turn < 0.01) a.lookAt(0, -0.6, 1)
    else a.lookAt(shot.pos.x, shot.pos.z, turn)
    st.recAway = 1
    st.recAim = 'camera'
    st.center = { mode: 'observer', a: ramp(0.08, 0.16, u), b: ramp(0.48, 0.56, u), t: 0, level: 1 }
  }

  /** A side-tracking shot: the target follows his chest. */
  private follow(shot: Shot, a: Actor, y: number, lead: number) {
    shot.tgt.set(a.x + Math.sin(a.yaw) * lead, y, a.z + Math.cos(a.yaw) * lead)
  }

  // ————————————————————————————————————————————————————————————————
  // Applying the state

  private apply(p: number, seg: SegmentId, u: number, f: SetFrame, shot: Shot, alt: boolean) {
    const st = this.st
    const time = f.time
    // ——— Sets ———
    const inRoom = st.set === 'room' || st.set === 'archive' || st.set === 'black'
    this.room.group.visible = inRoom && st.set !== 'black'
    const archiveShown = st.archive || st.leftDoor > 0.02 || st.set === 'archive'
    this.archive.group.visible = archiveShown && inRoom && st.set !== 'black'
    this.square.group.visible = st.set === 'square'
    this.net.group.visible = st.set === 'void' || (seg === 'network' && u < 0.1)
    this.room.walkway.visible = st.rightDoor > 0.01 || st.walkway
    const scene = this.scene
    const fog = scene.fog as THREE.Fog
    if (st.set === 'square' && st.era >= 0) {
      scene.background = null
      this.square.setEra(st.era, st.eraT, time, scene, { key: this.rig.key, hemi: this.rig.hemi, points: this.rig.points })
      scene.environmentIntensity = [0.5, 0.35, 0.35, 0.3, 0.55, 0.15, 0.3, 0.5, 0.3][st.era]
      this.offRoomLights()
      if (seg === 'network') {
        // The square goes dark around the points.
        const d = ramp(0.0, 0.1, u)
        fog.color.setRGB(0, 0, 0)
        fog.near = lerp(fog.near, 0.1, d)
        fog.far = lerp(fog.far, 1, d)
        this.rig.key.intensity *= 1 - d
        this.rig.hemi.intensity *= 1 - d
        this.net.group.position.copy(SQUARE_TO_VOID).multiplyScalar(-1)
      }
    } else {
      this.net.group.position.set(0, 0, 0)
    }
    if (st.set === 'void') {
      scene.background = (scene.background as THREE.Color | null)?.isColor ? scene.background : new THREE.Color(0x000000)
      ;(scene.background as THREE.Color).setRGB(0.004, 0.004, 0.005)
      fog.near = 500
      fog.far = 1000
      scene.environmentIntensity = 0
      this.offRoomLights()
      this.rig.key.intensity = 0
      this.rig.hemi.intensity = 0
    }
    if (this.net.group.visible) this.updateNetwork(seg, u, shot)
    if (inRoom) this.applyRoom(p, seg, u, f, shot, alt)
    this.applyHud(shot, alt)
    // Sound follows.
    if (!alt) this.updateMotion(seg, u)
  }

  private offRoomLights() {
    const r = this.rig
    r.lamp.intensity = 0
    r.spill.intensity = 0
    r.strip.intensity = 0
    r.screen.intensity = 0
    for (const pl of r.points) pl.intensity = 0
  }

  private updateNetwork(seg: SegmentId, u: number, shot: Shot) {
    const o = { dissolve: 0, grow: 0, gather: 0, deleted: 0, labels: 0, pulse: 0, anomaly: 0, time: this.time, camera: shot.pos, flat: 0 }
    if (seg === 'network') {
      o.dissolve = ramp(0.1, 0.3, u)
      o.grow = ramp(0.2, 1, u)
      o.deleted = ramp(0.72, 0.8, u)
    } else if (seg === 'spiral') {
      o.dissolve = 1
      o.grow = 1
      o.deleted = 1
      o.gather = ease(ramp(0.0, 0.6, u))
      o.labels = ramp(0.45, 0.65, u)
    } else {
      o.dissolve = 1
      o.grow = 1
      o.deleted = 1
      o.gather = 1
      o.labels = 1
      if (seg === 'beyond') o.pulse = window4(0.42, 0.47, 0.55, 0.7, u)
      if (seg === 'anomaly') o.anomaly = ramp(0.1, 0.16, u)
    }
    this.net.update(o)
  }

  private applyRoom(p: number, seg: SegmentId, u: number, f: SetFrame, shot: Shot, alt: boolean) {
    const st = this.st
    const time = f.time
    const room = this.room
    const r = this.rig
    const scene = this.scene
    scene.background = new THREE.Color(0x000000)
    const fog = scene.fog as THREE.Fog
    const camInArchive = shot.pos.x < -5.35
    fog.color.set(camInArchive ? 0xc4c8ca : 0x9aa0a4)
    fog.near = camInArchive ? 10 : 9
    fog.far = camInArchive ? 75 : 70
    if (!this.archive.group.visible) {
      fog.near = 500
      fog.far = 1000
    }
    // ——— The clock ———
    const sky = this.sky.set(LOOKS[st.lookA], LOOKS[st.lookB], st.lookT)
    for (const m of [room.forest, room.walkForest]) {
      const un = m.uniforms
      sky.apply(un)
      un.uTime.value = time
      un.uDrift.value.set(p * 18 + time * 0.004, p * 6)
      un.uHook.value.set(0.5 + st.hook * 0.35, 2.55, -1.5 - st.hook * 0.2).normalize()
      un.uOnT.value = st.onT
      un.uPaint.value = st.paint
      un.uHair.value = st.hair
      un.uOffT.value = st.offT
      un.uWallDim.value = st.wallDim
      un.uCeilDim.value = st.ceilDim
      un.uGrid.value = st.grid
      un.uCircle.value = st.circle
      un.uRain.value = st.rain
      un.uScan.value = st.scan
      un.uRedraw.value = st.redraw
    }
    room.walkForest.uniforms.uBright.value *= 1.05
    const ceiling = room.group.getObjectByName('ceiling')
    if (ceiling) ceiling.visible = st.ceiling
    // How much the screens light the room right now.
    const panels = clamp(st.onT) * (st.offT < 0 ? 1 : 1 - clamp(st.offT)) * (1 - st.wallDim * 0.9) * (1 - st.grid * 0.85) * st.roomLight
    scene.environmentIntensity = sky.env * panels * (st.circle > 0 ? 0.3 : 1)
    r.hemi.color.copy(sky.hemiSky)
    r.hemi.groundColor.copy(sky.hemiGround)
    r.hemi.intensity = sky.hemi * panels + (st.circle > 0 ? 0.12 : 0) * st.roomLight
    r.hemi.position.set(0, 4, 0)
    // The key: from the bright side of the sky, or the moon.
    const kd = sky.el > 0 ? sky.sunDir : this.v.set(0.45, 0.75, 0.35).normalize()
    r.key.position.set(kd.x * 6, Math.max(2.5, kd.y * 6), kd.z * 6)
    r.key.target.position.set(0, 0, 0.5)
    r.key.color.copy(sky.keyCol)
    r.key.intensity = sky.key * panels
    const sc = r.key.shadow.camera
    if (sc.right !== 7) {
      sc.left = -7
      sc.right = 7
      sc.top = 7
      sc.bottom = -7
      sc.near = 0.5
      sc.far = 16
      sc.updateProjectionMatrix()
    }
    // The desk lamp: warm, the face always readable.
    const lampOn = st.lamp * sky.lamp + (sky.lamp < 0.5 ? st.lamp * 0.0 : 0)
    r.lamp.position.set(-1.16, DESK.y + 0.56, 0.22)
    r.lamp.target.position.set(-0.05, DESK.y, 0.5)
    r.lamp.intensity = 2.6 * lampOn
    r.lamp.angle = 0.95
    r.lamp.penumbra = 0.75
    r.lamp.distance = 5
    room.lampBulb.visible = lampOn > 0.05
    // The LED strip under the desk's lip.
    r.strip.position.set(0, DESK.y - 0.095, 0.69)
    r.strip.lookAt(0, -1, 1.0)
    r.strip.intensity = 9 * clamp(st.roomLight + (st.circle > 0 ? 0.3 : 0)) * (st.offT > 0.3 ? 0 : 1)
    room.strip.color.setRGB(1.0, 0.62, 0.3).multiplyScalar(2.2 * clamp(st.roomLight + 0.2) * (st.offT > 0.3 ? 0 : 1))
    // The archive's light across the planks.
    r.spill.position.set(-9.5, 2.4, -0.15)
    r.spill.target.position.set(-1.0, 0, 0.7)
    r.spill.intensity = 220 * st.spill * (camInArchive ? 0.4 : 1)
    r.spill.angle = 0.42
    r.spill.distance = 20
    r.spill.color.set(p >= at('lever', 0.5) ? 0xfff6ea : 0xeef2f6)
    if (this.archive.group.visible) {
      const cascade = seg === 'lever' ? ramp(0.45, 1, u) : p > SEG.lever.end ? 1 : 0
      this.archive.update(time, cascade, seg === 'lever' ? ramp(0.38, 0.45, u) : p > SEG.lever.end ? 1 : 0, seg === 'lever' ? window4(0.9, 0.95, 0.98, 1, u) : 0)
      if (camInArchive) {
        // Inside the hall: an even, cool light from the bands.
        r.hemi.color.set(0xeef1f3)
        r.hemi.groundColor.set(0x3a3c3e)
        r.hemi.intensity = 1.05
        r.key.position.set(-20, 30, 6)
        r.key.target.position.set(-24, 0, 2)
        r.key.color.set(0xf2f4f6)
        r.key.intensity = 0.9
        if (sc.right !== 26) {
          sc.left = -26
          sc.right = 26
          sc.top = 26
          sc.bottom = -26
          sc.near = 5
          sc.far = 70
          sc.updateProjectionMatrix()
        }
        scene.environmentIntensity = 0.15
      }
    }
    // Small lights: the red ring's glow, the walkway's warm door and its daylight.
    const [p0, p1, p2] = r.points
    p0.position.set(BUTTON.x, BUTTON.y + 0.06, BUTTON.z + 0.08)
    p0.color.set(0xff1a10)
    p0.distance = 1.8
    p0.decay = 2
    p0.intensity = 0.9 * st.ring
    room.ring.color.setRGB(st.ring * 3.2, st.ring * 0.08, st.ring * 0.04)
    room.buttonCap.position.y = 0.024 - (seg === 'press' && u > 0.3 && u < 0.45 ? 0.006 : 0)
    p1.position.set(8.5, 2.2, 0)
    p1.color.set(0xffb070)
    p1.distance = 3.5
    p1.decay = 2
    p1.intensity = room.walkway.visible ? 1.2 : 0
    p2.position.set(6.8, 2.6, -0.2)
    p2.color.set(0xdfe8d8)
    p2.distance = 5
    p2.decay = 2
    p2.intensity = room.walkway.visible ? 0.8 * (sky.bright + 0.3) : 0
    if (camInArchive && st.set === 'archive') {
      p1.position.set(-6.5, 2.6, 0)
      p1.color.set(0xfff2e0)
      p1.distance = 6
      p1.intensity = 0.4
    }
    // ——— The room's moving parts ———
    room.rightLeaf.rotation.y = st.rightDoor
    room.leftLeaf.rotation.y = st.leftDoor
    room.chair.position.set(CHAIR_IN.x, 0, st.chairZ)
    room.clothFolded.visible = st.clothFolded
    room.clothTop.visible = st.clothTop
    room.extraCloth.visible = st.extraCloth
    room.clothFly.visible = !!st.clothFly
    if (st.clothFly) {
      room.clothFly.position.copy(st.clothFly)
      room.clothFly.rotation.set(time * 3, time * 2, 0)
    }
    room.windowMat.opacity = st.windowA
    room.window.visible = st.windowA > 0.01
    if (room.window.visible) {
      const key = String(Math.floor(time * 6))
      if (key !== this.windowKey) {
        this.windowKey = key
        drawWindow(this.windowCtx, 512, 300, time * 6)
        this.windowTex.needsUpdate = true
      }
    }
    this.wetMat.opacity = 0.65 * st.wet
    this.wetSpot.visible = st.wet > 0.01
    // ——— The screens ———
    this.screen(room.center, st.center, 'c', time)
    this.screen(room.left, st.left, 'l', time)
    this.screen(room.right, st.right, 'r', time)
    const screenLevel = Math.max(st.center.level, st.left.level * 0.6, st.right.level * 0.6, st.thumb)
    r.screen.position.set(CENTER_SCREEN.pos.x, CENTER_SCREEN.pos.y, CENTER_SCREEN.pos.z + 0.03)
    r.screen.lookAt(0, 1.2, 2.5)
    r.screen.intensity = 5 * screenLevel * (st.center.mode === 'grid' || st.center.mode === 'circle' ? 0.3 : 1)
    r.screen.color.set(st.center.mode === 'sort' ? 0xd8dde0 : 0xc8d6e4)
    // The record or the square on the centre screen.
    this.thumb.visible = st.thumb > 0.001 && !alt
    if (this.thumb.visible) {
      const k = seg === 'dive' ? st.thumb : 1
      const w = lerp(0.12, CENTER_SCREEN.w, ease(k))
      const h = w * (9 / 16) > CENTER_SCREEN.h ? CENTER_SCREEN.h : w * (9 / 16)
      this.thumb.scale.set(w, h, 1)
      this.thumb.position.set(lerp(0.55, 0, ease(k)) * (seg === 'dive' ? 1 : 0), CENTER_SCREEN.pos.y + lerp(0.3, 0, ease(k)) * (seg === 'dive' ? 1 : 0), CENTER_SCREEN.pos.z + 0.003)
      this.thumbMat.opacity = seg === 'dive' ? ramp(0.25, 0.32, u) : st.thumb
    }
    this.player.mesh.visible = st.center.mode === 'record' && !alt
    if (this.player.mesh.visible) {
      const label = `SUBJECT · ${iterationDate(this.iteration + 1)} · 05:12`
      const key = `${label}|${st.center.a.toFixed(2)}`
      if (key !== this.player.key) {
        this.player.key = key
        drawPlayer(this.player.ctx, 1024, 582, label, st.center.a)
        this.player.tex.needsUpdate = true
      }
    }
    // ——— Arif ———
    this.applyArif(time)
    // ——— Robots ———
    this.applyRobots(p, seg, u, shot)
  }

  private screen(s: ScreenSet, state: ScreenState, side: 'c' | 'l' | 'r', time: number) {
    const W = s.canvas.width
    const H = s.canvas.height
    const g = s.ctx
    let key = ''
    switch (state.mode) {
      case 'off':
        s.material.emissiveIntensity = 0
        return
      case 'sort':
        key = `sort${state.t.toFixed(3)}|${Math.floor(time * 8)}`
        if (key !== s.key) drawSorting(g, W, H, state.t, time, side === 'c' ? 0 : side === 'l' ? 1 : 2)
        break
      case 'dates': {
        const today = `TODAY ${iterationDate(this.iteration)}`
        const rec = `RECORD ${iterationDate(this.iteration + 1)} · 05:12`
        key = `dates${today}${state.a.toFixed(2)}${state.b.toFixed(2)}`
        if (key !== s.key) drawDates(g, W, H, today, rec, state.a, state.b)
        break
      }
      case 'observer':
        key = `obs${state.a.toFixed(2)}${state.b.toFixed(2)}`
        if (key !== s.key) drawObserver(g, W, H, state.a, state.b)
        break
      case 'line':
        key = `line${state.a.toFixed(2)}`
        if (key !== s.key) drawLine(g, W, H, state.a)
        break
      case 'grid':
        key = `grid${state.a.toFixed(2)}`
        if (key !== s.key) drawGrid(g, W, H, state.a, 0)
        break
      case 'circle':
        key = `circle${state.a.toFixed(2)}`
        if (key !== s.key) drawGrid(g, W, H, 0.6, state.a)
        break
      case 'flash':
        key = `flash${state.a.toFixed(2)}`
        if (key !== s.key) drawFlash(g, W, H, state.a)
        break
      case 'record':
        key = 'record'
        if (key !== s.key) drawFlash(g, W, H, 0.0)
        break
    }
    if (key !== s.key) {
      s.key = key
      s.texture.needsUpdate = true
    }
    s.material.emissiveIntensity = 1.15 * state.level
  }

  private applyArif(time: number) {
    const st = this.st
    const C = this.arifC
    const S = this.arifS
    C.visible = st.who === 'c'
    S.visible = st.who === 's'
    const sleeping = st.breath === 'sleep'
    for (const a of [C, S]) {
      a.apply(time, !sleeping && a.visible)
      if (!a.visible) continue
      if (sleeping) {
        // Shallow, uneven breath in the shoulders.
        const b = Math.sin(time * 1.9 + 0.7 * Math.sin(time * 0.43)) * (0.7 + 0.3 * Math.sin(time * 0.21))
        a.figure.joints.chest.rotation.x += b * 0.018
        a.figure.joints.lUpper.rotation.z += b * 0.01
        a.figure.joints.rUpper.rotation.z -= b * 0.01
        a.figure.root.updateMatrixWorld(true)
      }
      setEyes(a.figure, st.eyes)
      setGlasses(a.figure, st.askew)
    }
    const g = this.ghost
    g.visible = st.ghost > 0.001
    g.apply(time, false)
    for (const m of this.ghostMats) m.opacity = st.ghost
    // The drool from the corner of his mouth to the glass.
    const shown = st.who === 'c' ? C : st.who === 's' ? S : null
    this.drool.visible = !!shown && st.drool > 0.02
    if (this.drool.visible && shown) {
      shown.figure.mouth.getWorldPosition(this.v)
      shown.figure.joints.head.localToWorld(this.v2.set(0.03, 0.04, 0.095))
      const len = Math.max(0.005, this.v2.y - DESK.y)
      this.drool.position.copy(this.v2)
      this.drool.scale.set(1, len * st.drool, 1)
      this.drool.rotation.set(0, 0, 0)
      this.wetSpot.position.set(this.v2.x - 0.01, DESK.y + 0.0012, this.v2.z)
    } else this.wetSpot.position.set(CHEEK_SPOT.x, DESK.y + 0.0012, CHEEK_SPOT.z)
    // The cloth in his hand.
    this.room.clothHand.visible = st.clothHand && !!shown
    if (this.room.clothHand.visible && shown) {
      shown.figure.rGrip.getWorldPosition(this.v)
      this.room.clothHand.position.copy(this.v)
    }
  }

  private applyRobots(p: number, seg: SegmentId, u: number, shot: Shot) {
    const st = this.st
    const co = this.coffee
    const sn = this.snack
    const re = this.rec
    // Defaults: coffee and snack in their niches, the recorder at its stop facing him.
    co.place(NICHES.coffee[0], NICHES.coffee[1], PI)
    sn.place(NICHES.snack[0], NICHES.snack[1], PI)
    re.place(MARKS.recorder[0], MARKS.recorder[1], Math.atan2(3.3, 0.6))
    co.setTray(0)
    sn.setTray(0)
    const onPath = (r: Robot, path: Path, s: number, settleYaw?: number) => {
      pointAt(path, s, sample)
      pointAt(path, Math.min(1, s + 0.35 / path.total), ahead)
      let yaw = Math.atan2(ahead.x - sample.x, ahead.z - sample.z)
      if (Math.hypot(ahead.x - sample.x, ahead.z - sample.z) < 0.02) yaw = settleYaw ?? r.yaw
      if (settleYaw !== undefined) yaw = angleLerp(yaw, settleYaw, smoothstep(0.92, 1, s))
      r.place(sample.x, sample.z, yaw)
    }
    const markYaw = (x: number, z: number) => Math.atan2(0 - x, 0.9 - z)
    const arrived = p >= at('sits', 0.45)
    // Coffee and snack.
    if (p >= at('reopen', 0.55) && p < SEG.again.start) {
      if (!arrived || p < at('sits', 0.5)) {
        onPath(co, R.coffeeIn, evalNumber(COFFEE_IN, p), markYaw(MARKS.coffee[0], MARKS.coffee[1]))
        onPath(sn, R.snackIn, evalNumber(SNACK_IN, p), markYaw(MARKS.snack[0], MARKS.snack[1]))
      } else {
        co.place(MARKS.coffee[0], MARKS.coffee[1], markYaw(MARKS.coffee[0], MARKS.coffee[1]))
        sn.place(MARKS.snack[0], MARKS.snack[1], markYaw(MARKS.snack[0], MARKS.snack[1]))
      }
    }
    // The feed (05:12) and the records: on their marks.
    if (st.hud && (seg === 'feed' || seg === 'feedWide' || seg === 'again')) {
      co.place(MARKS.coffee[0], MARKS.coffee[1], markYaw(MARKS.coffee[0], MARKS.coffee[1]))
      sn.place(MARKS.snack[0], MARKS.snack[1], markYaw(MARKS.snack[0], MARKS.snack[1]))
    }
    if (seg === 'records' && st.record >= 2) {
      co.place(MARKS.coffee[0], MARKS.coffee[1], markYaw(MARKS.coffee[0], MARKS.coffee[1]))
      sn.place(MARKS.snack[0], MARKS.snack[1], markYaw(MARKS.snack[0], MARKS.snack[1]))
    }
    if (seg === 'again') {
      if (u < 0.4) {
        co.place(MARKS.coffee[0], MARKS.coffee[1], markYaw(MARKS.coffee[0], MARKS.coffee[1]))
        sn.place(MARKS.snack[0], MARKS.snack[1], markYaw(MARKS.snack[0], MARKS.snack[1]))
      } else {
        onPath(co, R_OUT.coffee, ease(ramp(0.4, 0.53, u)), PI)
        onPath(sn, R_OUT.snack, ease(ramp(0.42, 0.55, u)), PI)
      }
    }
    // The hand-offs: the coffee robot to his right hand and back.
    const handoff = (t: number) => {
      const s = ease(clamp(t))
      co.place(lerp(MARKS.coffee[0], HANDOFF.x, s), lerp(MARKS.coffee[1], HANDOFF.z, s), angleLerp(markYaw(MARKS.coffee[0], MARKS.coffee[1]), HANDOFF.yaw, s))
    }
    let cupOnTray = true
    if (seg === 'reach') {
      handoff(ramp(0.2, 0.4, u))
      co.setTray(0.05 * ramp(0.3, 0.42, u) * (1 - ramp(0.45, 0.55, u)))
    }
    if (seg === 'sip') {
      handoff(1 - ramp(0.6, 0.9, u))
      co.setTray(0.02 * window4(0.38, 0.42, 0.46, 0.52, u))
    }
    if (seg === 'thousands') {
      handoff(u < 0.5 ? ramp(0.05, 0.25, u) : 1 - ramp(0.75, 0.95, u))
      co.setTray(u < 0.45 ? 0.05 * ramp(0.15, 0.3, u) * (1 - ramp(0.3, 0.4, u)) : 0.02 * window4(0.45, 0.5, 0.56, 0.62, u))
    }
    if (seg === 'records' && st.record === 3) {
      co.place(HANDOFF.x, HANDOFF.z, HANDOFF.yaw)
    }
    // The cup: on the tray, in his hand, or falling the last 4 cm.
    const holder = st.who === 's' ? this.arifS : this.arifC
    if (st.cupHand) {
      cupOnTray = false
      holder.figure.rGrip.getWorldPosition(this.v)
      this.cup.position.set(this.v.x, this.v.y - 0.035, this.v.z)
      this.cup.rotation.set(0, 0.6, 0)
    }
    co.group.updateMatrixWorld(true)
    co.cupSpot.getWorldPosition(this.v2)
    if (st.cupFall >= 0) {
      cupOnTray = false
      this.cup.position.set(this.v2.x, this.v2.y + 0.04 * (1 - st.cupFall * st.cupFall), this.v2.z)
      this.cup.rotation.set(0, 0.6, 0)
    }
    if (cupOnTray) {
      this.cup.position.copy(this.v2)
      this.cup.rotation.set(0, co.yaw + 0.6, 0)
    }
    this.cup.visible = this.room.group.visible
    // The recorder: follows him to the right door, back with the robots, and in the end follows him halfway.
    if (p >= at('rise', 0.6) && p < at('forty', 0.25)) onPath(re, R.recOut, evalNumber(REC_FOLLOW, p))
    else if (p >= at('forty', 0.25) && p < at('reopen', 0.8)) re.place(NICHES.recorder[0], NICHES.recorder[1], PI)
    else if (p >= at('reopen', 0.8) && p < at('sits', 0.75)) onPath(re, R.recIn, evalNumber(REC_IN, p), Math.atan2(3.3, 0.6))
    if (seg === 'halt') onPath(re, R.recHalt, ease(ramp(0.0, 0.55, u)), Math.atan2(2.5, -0.7))
    if (p >= SEG.turn.start) re.place(-0.3, 1.9, Math.atan2(2.5, -0.7))
    re.group.visible = !st.hideRecorder
    // Its head: on Arif — until it turns to us.
    const shown = st.who === 'c' ? this.arifC : st.who === 's' ? this.arifS : null
    if (shown) shown.figure.joints.head.getWorldPosition(this.v3)
    else this.v3.set(0, 1.2, 1.05)
    if (st.recAim === 'camera' || st.recAway > 0) {
      re.aim(this.v3, 1)
      const yArif = re.head.rotation.y
      const pArif = re.tilt.rotation.x
      re.aim(shot.pos, 1)
      const yCam = re.head.rotation.y
      const pCam = re.tilt.rotation.x
      const t = st.recAim === 'camera' ? 1 : ease(st.recAway)
      re.head.rotation.y = angleLerp(yArif, yCam, t)
      re.tilt.rotation.x = lerp(pArif, pCam, t)
    } else re.aim(this.v3, 1)
    // Rings: bright while working, dim after; the lens light never goes out.
    co.setRing(st.ringLevel)
    sn.setRing(st.ringLevel)
    re.setRing(st.ringLevel)
    // How much they move (for the wheels' sound).
    const moved = Math.abs(co.x - this.lastRobots.x) + Math.abs(sn.x - this.lastRobots.y) + Math.abs(re.x - this.lastRobots.z)
    this.motionInfo.robots = clamp(moved * 20)
    this.lastRobots.set(co.x, sn.x, re.x)
    void shot
  }

  /** The record frame's overlay, laid in front of the lens. */
  private applyHud(shot: Shot, alt: boolean) {
    const st = this.st
    const hud = st.hud
    const show = !!hud && !alt
    this.hudVignette.visible = show
    this.hudCode.mesh.visible = show && !!hud?.code1
    this.hudGhost.visible = st.ghost > 0.001 && !alt && st.set === 'square'
    if (!show && !this.hudGhost.visible) return
    this.renderer.getSize(this.size)
    const aspect = this.size.x / Math.max(1, this.size.y)
    const fov = fitFov(shot.fov, aspect)
    const d = 0.12
    const h = 2 * d * Math.tan((fov * PI) / 360)
    const w = h * aspect
    const fwd = this.v.copy(shot.tgt).sub(shot.pos).normalize()
    const right = this.v2.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize()
    const up = this.v3.crossVectors(right, fwd).normalize()
    const place = (m: THREE.Mesh, x: number, y: number, sw: number, sh: number) => {
      m.position.copy(shot.pos).addScaledVector(fwd, d).addScaledVector(right, x).addScaledVector(up, y)
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd.clone().negate()))
      m.scale.set(sw, sh, 1)
    }
    if (this.hudGhost.visible) {
      place(this.hudGhost, 0, 0, w, h)
      this.hudGhostMat.opacity = st.ghost
    }
    if (!show || !hud) return
    place(this.hudVignette, 0, 0, w * 1.01, h * 1.01)
    if (hud.code1) {
      const key = hud.code1 + hud.code2
      if (key !== this.hudCode.key) {
        this.hudCode.key = key
        drawTimecode(this.hudCode.ctx, 640, 100, hud.code1, hud.code2)
        this.hudCode.tex.needsUpdate = true
      }
      const cw = w * 0.34
      const ch = cw * (100 / 640)
      place(this.hudCode.mesh, w / 2 - cw / 2 - w * 0.03, h / 2 - ch / 2 - h * 0.05, cw, ch)
    }
  }

  private hideHud() {
    this.hudVignette.visible = false
    this.hudCode.mesh.visible = false
    this.hudGhost.visible = false
  }

  private updateMotion(seg: SegmentId, u: number) {
    const st = this.st
    const a = st.who === 'c' ? this.arifC : st.who === 's' ? this.arifS : null
    this.motionInfo.step = a ? a.step + this.stepBase : 0
    this.motionInfo.walking = a ? a.walking : 0
    this.motionInfo.doors = st.rightDoor + st.leftDoor
    this.motionInfo.frame = st.set === 'square' ? st.era : st.record >= 0 ? 10 + st.record : 0
    void seg
    void u
  }

  motion(m: SceneInfo['motion']) {
    m.step = this.motionInfo.step
    m.walking = this.motionInfo.walking
    m.robots = this.motionInfo.robots
    m.doors = this.motionInfo.doors
    m.frame = this.motionInfo.frame
  }

  dispose() {
    this.room.dispose()
    this.rt.dispose()
    this.windowTex.dispose()
  }
}

/** The scene; the wrapper hands the director each pass's iteration (dates and numbers advance on every loop). */
export const createTekerrurScene = (options: SceneOptions): StoryScene => {
  const director = new TekerrurDirector()
  const inner = createSetScene(director, options)
  return {
    get info() {
      return inner.info
    },
    init: (stage) => inner.init(stage),
    render: (frame) => {
      director.iteration = frame.iteration || BASE_ITERATION
      inner.render(frame)
    },
    dispose: () => inner.dispose(),
  }
}
