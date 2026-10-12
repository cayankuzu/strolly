/**
 * YAŞAMAK — "En Uzun ve En Kısa Veda". One internet cafe, one desk (MASA 4),
 * one life: the man in the dark with the door at his back; the boy at ten
 * with an hour on the clock and fifty kuruş in his pocket; the same desk with
 * a dash where the number should be; the people of his life at the other
 * desks, leaving one by one through the door behind him; his mother at the
 * next desk; a boy who opens his game anyway.
 *
 * Everything is a pure function of progress `p` (and the reader's choices).
 * Contract: docs/stories/yasamak.md. Modules: set.ts (the cafe), cast.ts (the
 * people), props.ts (small things), screens.ts (what the screens show),
 * sky.ts (the street through the window), rig.ts (poses).
 */
import * as THREE from 'three'
import { clamp, lerp, smoothstep, window4 } from '@/lib/math'
import { SEG, at, boySeconds, extraSeconds, kidSeconds, local, segmentAt, type SegmentId } from '@/stories/yasamak/timeline'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { makePath, type Path } from '../figure/paths'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import type { Actor } from '../kit/direct'
import type { JointName, Pose } from '../figure/Figure'
import { reach as ikReach } from '../figure/reach'
import { disposeTree } from '../util'
import { Cafe, COIN_CRACK, DOOR, NOTE_POS, cornerOf, poseScreen, type Desk } from './set'
import { Cast, HEIGHT, seatY } from './cast'
import { carriage, coin, coinSpread, drapedCoat, flatCap, knitting, lighter, money, propMaterials, readingGlasses, wallet, type KnitShape } from './props'
import { boyGame, desktop, duo, football, kidGame, kidMenu, lockScreen, news, roadGame, scoreboard, solitaire, strangerScreen, tavla, adminScreen, type Draw, type Era } from './screens'
import { clockHours, envAt, type Env } from './sky'
import { ARMS_FLUNG, COAT_ON, COUNTER_LEAN, FLOP, HANDS_UP, KNIT, P, RUN, SIT_LEAN_IN, SIT_UP, STAND_OLD, bump } from './rig'

const PI = Math.PI
const ss = smoothstep
const win = window4
type V7 = readonly [number, number, number, number, number, number, number]
type Keys = ReadonlyArray<readonly [number, V7]>

/** A screen's content this frame: off, a crowd picture, or a drawn state (key + draw). */
type ScreenState = { off: true } | { crowd: number } | { key: string; draw: Draw; level?: number }
const OFF: ScreenState = { off: true }

/** Kemal's places behind the counter. */
const KEMAL = { x: -3.4, z: 4.5 }
const KID_AT_COUNTER = { x: -2.85, z: 3.18 }
const EMRE_AT_COUNTER = { x: -2.28, z: 3.26 }
const MAN_AT_COUNTER = { x: -2.72, z: 3.12 }
/** Standing up: how far the chair rolls back, and where (ahead of the seat) the feet end. */
const RISE_PUSH = 0.32
const RISE_STEP = 0.12
/** The chairs of those who left, where they left them (rolled back as they stood up). */
const EMRE_CHAIR = { x: -0.75 - Math.sin(PI - 1.05) * RISE_PUSH, z: 0.6 - Math.cos(PI - 1.05) * RISE_PUSH }
const DEDE_CHAIR = { x: -1.5, z: -1.6 + RISE_PUSH }
/** Dede's cap on his desk (MASA 9), left of the keyboard. */
const CAP_AT = { x: -1.9, z: -2.27 }
/** VEDA: where the two sit when she measures the scarf on him, and when they play on her screen. */
const MEASURE = { dx: 0.85, yaw: -0.85, herDz: 0.14, herYaw: 1.0 }
const PLAY = { dx: 0.85, dz: 0.02, yaw: -0.55, herYaw: 0.2 }
/** Behind his chair, where she wraps the scarf round his neck; behind her own chair, where her coat hangs. */
const WRAP_SPOT = { x: 0.86, z: 1.13, yaw: PI }
const COAT_SPOT = { x: 2.25, z: 1.52 }
/** From here on the scarf is round his neck. */
const WRAP_DONE = 0.33
/** Where he stands beside Emre's chair (hand on its back), and how he turns the seat to sit in it. */
const TRACE_SPOT = { x: -0.56, z: 1.24 }
const TRACE_SEAT_YAW = 0.81
const BABA_CHAIR = { x: 1.5 - Math.sin(PI - 2.6) * 0.05, z: -1.6 - Math.cos(PI - 2.6) * 0.05 }
const CRANE: V7 = [5.2, 2.75, 4.6, -1.2, 0.8, -1.2, 58]
/**
 * Two-shots at desks 3 and 4 from the front right: the narrator in the middle
 * of the frame, the one at desk 3 near on the right, the rail column on the
 * left free of faces; the line of sight passes beside the monitors, not through.
 */
/** The children at desks 3 and 4 (the bulky CRTs only leave the straight view between them). */
const PAIR34: V7 = [0.0, 1.2, -1.05, 0.0, 1.04, 0.6, 46]
const OBL34: V7 = [-1.55, 1.42, -0.85, 0.35, 1.17, 0.5, 42]
/** The same for desks 4 and 5 from the front left: the mother in the middle, the narrator near on the right. */
const OBL45: V7 = [0.15, 1.34, -0.85, 1.75, 1.1, 0.55, 42]
const BACK4: V7 = [1.25, 1.45, 1.6, 0.75, 1.0, -0.22, 34]
const FRONT4: V7 = [1.05, 1.45, -1.05, 0.75, 1.2, 0.6, 38]
const BELL: V7 = [1.1, 1.4, -1.0, 1.8, 1.4, 4.0, 40]

const P_RUN_IN = makePath([
  [3.5, 6.0],
  [3.45, 4.5],
  [1.2, 3.55],
  [-1.2, 3.25],
  [KID_AT_COUNTER.x, KID_AT_COUNTER.z],
])
const P_EMRE_IN = makePath([
  [3.55, 6.6],
  [3.5, 4.7],
  [1.0, 3.8],
  [-1.2, 3.5],
  [EMRE_AT_COUNTER.x, EMRE_AT_COUNTER.z],
])
// Walks away from desk 4 start where the feet are after standing up, and go round the chair.
const P_DESK_TO_DOOR = makePath([
  [0.75, 0.48],
  [1.3, 0.64],
  [1.75, 1.35],
  [2.9, 3.9],
  [3.35, 4.55],
])
const P_TO_COUNTER = makePath([
  [0.75, 0.48],
  [0.24, 0.64],
  [0.0, 1.5],
  [-1.6, 3.0],
  [MAN_AT_COUNTER.x, MAN_AT_COUNTER.z],
])
const P_BACK_FROM_COUNTER = makePath([
  [MAN_AT_COUNTER.x, MAN_AT_COUNTER.z],
  [-1.6, 2.6],
  [-0.2, 1.4],
])
const P_LOOK_TO_SEAT = makePath([
  [-0.2, 1.4],
  [0.12, 0.98],
  [0.3, 0.64],
  [0.75, 0.48],
])

class YasamakDirector implements SetDirector {
  private cafe = new Cafe()
  private cast = new Cast()
  private pm = propMaterials()
  private desks!: Desk[]
  private env!: Env
  private era: Era = 'adult'
  private screens = new Map<number, ScreenState>()
  private time = 0
  private v = new THREE.Vector3()
  private v2 = new THREE.Vector3()
  private q = new THREE.Quaternion()
  private envMap: THREE.Texture | null = null
  private scene!: THREE.Scene
  // Props
  private kidCoins!: ReturnType<typeof coinSpread>
  private emreCoins!: ReturnType<typeof coinSpread>
  private boyCoins!: ReturnType<typeof coinSpread>
  private handCoin!: THREE.Group
  private wallet!: THREE.Group
  private money!: ReturnType<typeof money>
  private lighter!: ReturnType<typeof lighter>
  private cap!: ReturnType<typeof flatCap>
  private carriage!: THREE.Group
  private knit!: ReturnType<typeof knitting>
  private glasses!: THREE.Group
  private coats!: { dede: THREE.Group; baba: THREE.Group; anne: THREE.Group }
  private chairBag!: THREE.Group
  private pads: THREE.Group[] = []
  private cup: THREE.Object3D | null = null
  private pathCache = new Map<string, Path>()
  // Audio hints
  private doorOpen = 0
  private walker: Actor | null = null
  private bellEnergy = 0
  private lastDoor = 0

  async build(scene: THREE.Scene, ctx: BuildContext) {
    this.scene = scene
    const [env] = await Promise.all([ctx.hdri('brown_photostudio_02'), this.cafe.build(scene, ctx)])
    this.envMap = env
    scene.environment = env ?? ctx.environment
    scene.environmentIntensity = 0.2
    scene.background = new THREE.Color(0x000000)
    this.desks = this.cafe.desks
    this.cast.build(scene)
    const pm = this.pm
    // Coins: the boy's on the counter, Emre's, the boy-at-the-end's; the one in his palm.
    this.kidCoins = coinSpread(pm, 6, 3)
    this.emreCoins = coinSpread(pm, 3, 4)
    this.boyCoins = coinSpread(pm, 5, 5)
    this.handCoin = coin(pm)
    this.wallet = wallet(pm)
    this.money = money(pm)
    this.lighter = lighter(pm)
    this.cap = flatCap()
    this.carriage = carriage(pm)
    this.knit = knitting(pm)
    this.glasses = readingGlasses(pm)
    scene.add(this.kidCoins.group, this.emreCoins.group, this.boyCoins.group, this.handCoin, this.wallet, this.money.group, this.lighter.group, this.cap.group, this.carriage, this.knit.group, this.glasses)
    // Left of his keyboard, clear of the mouse and its pad.
    this.cap.group.position.set(CAP_AT.x, 0.765, CAP_AT.z)
    this.cap.group.rotation.y = 0.55
    const desk = (n: number) => this.desks[n - 1]
    this.coats = {
      dede: drapedCoat(this.cast.coats.dede),
      baba: drapedCoat(this.cast.coats.baba),
      anne: drapedCoat(this.cast.coats.anne),
    }
    desk(9).chair.add(this.coats.dede)
    desk(11).chair.add(this.coats.baba)
    desk(5).chair.add(this.coats.anne)
    this.chairBag = this.cast.looseBag()
    this.chairBag.position.set(0, 0.42, -0.06)
    this.chairBag.rotation.set(-0.15, 0, 0)
    desk(4).chair.add(this.chairBag)
    const pad = await ctx.model('gamepad', { width: 0.15 })
    for (let i = 0; i < 2; i++) {
      const g = pad ? pad.clone(true) : this.padStandIn()
      scene.add(g)
      this.pads.push(g)
    }
    if (this.cafe.teaSource) {
      const c = new THREE.Group()
      const saucer = this.cafe.teaSource.getObjectByName('tea_set_01_saucer_circular_03')
      const cup = this.cafe.teaSource.getObjectByName('tea_set_01_cup_small_01')
      if (saucer && cup) {
        const s = saucer.clone()
        s.position.set(0, saucer.position.y, 0)
        const k = cup.clone()
        k.position.set(0, cup.position.y + 0.01, 0)
        k.rotation.y = -0.8
        c.add(s, k)
        c.position.set(2.62, 0.765, 0.02)
        scene.add(c)
        this.cup = c
      }
    }
  }

  private padStandIn() {
    const g = new THREE.Group()
    const mat = this.pm.tyre
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 4, 12), mat)
    b.rotation.z = PI / 2
    b.scale.set(1, 1, 0.45)
    g.add(b)
    return g
  }

  // ——— Frame ———

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    this.time = f.time
    this.env = envAt(f.p)
    this.era = this.eraAt(f.p, seg, u)
    this.cafe.era(this.era)
    this.cast.dressExtras(this.era === 'kid' ? 'kid' : f.p >= SEG.spring.start ? 'spring' : 'adult')
    for (const d of this.desks) poseScreen(d, this.era)
    for (const a of this.cast.all) {
      a.begin()
      a.visible = false
    }
    this.walker = null
    this.resetChairs()
    this.resetProps()
    this.screens.clear()
    this.doorOpen = 0

    const ch = (s: SegmentId) => f.p >= SEG[s].start
    if (!ch('recess')) this.nefes(seg, u)
    else if (!ch('years')) this.child(seg, u, f)
    else if (!ch('look')) this.time3(seg, u, f)
    else if (!ch('bulmaz')) this.illness(seg, u, f)
    else if (!ch('traces')) this.oneByOne(seg, u, f)
    else if (!ch('mother')) this.nothing(seg, u)
    else if (!ch('spring')) this.farewell(seg, u, f)
    else this.defiance(seg, u, f)

    for (const a of this.cast.all) a.apply(f.time, !f.reduced)
    this.touches()
    this.afterApply(seg, u, f)
    this.drawScreens(f.p, seg, u)
    this.door(seg, u, f)
    this.world(f)
    this.camera(seg, u, f, shot)
  }

  private eraAt(p: number, seg: SegmentId, u: number): Era {
    if (p < SEG.recess.start) return 'adult'
    if (seg !== 'years') return p < SEG.years.start ? 'kid' : 'adult'
    if (u < 0.44) return 'kid'
    if (u > 0.56) return 'adult'
    // The dissolve of the time-lapse: the two eras flicker into each other.
    const k = (u - 0.44) / 0.12
    return Math.floor(u * 160) % 3 < Math.round(k * 3) ? 'adult' : 'kid'
  }

  // ——— Helpers ———

  private desk(n: number) {
    return this.desks[n - 1]
  }

  private on(a: Actor) {
    a.visible = true
    return a
  }

  private h(a: Actor) {
    return a.figure.root.scale.x
  }

  /**
   * A hand that lands on a body (someone else's or one's own): the target is a
   * point in a joint's frame, resolved after everyone is posed, so a hand on a
   * nape, a shoulder or a scarf sits exactly there whatever the pose.
   */
  private touch(a: Actor, side: 'l' | 'r', w: number, on: Actor, joint: JointName, x: number, y: number, z: number, out = 0.5) {
    if (w > 0.001) this.touchList.push({ a, side, w, on, joint, x, y, z, out })
  }

  private touchList: Array<{ a: Actor; side: 'l' | 'r'; w: number; on: Actor; joint: JointName; x: number; y: number; z: number; out: number }> = []

  private touches() {
    for (const t of this.touchList) {
      if (!t.a.visible || !t.on.visible) continue
      t.on.figure.joints[t.joint].localToWorld(this.v.set(t.x, t.y, t.z))
      ikReach(t.a.figure, t.side, this.v, t.w, t.out)
      t.a.figure.root.updateMatrixWorld(true)
    }
    this.touchList.length = 0
  }

  /** Seats an actor at a desk (chair moves with them). */
  private sit(a: Actor, n: number, pose: Pose, o: { yaw?: number; dx?: number; dz?: number } = {}) {
    const d = this.desk(n)
    const yaw = PI + (o.yaw ?? 0)
    const cx = d.x + (o.dx ?? 0)
    const cz = d.chairZ + (o.dz ?? 0)
    this.on(a)
      .place(cx - Math.sin(yaw) * 0.05, cz - Math.cos(yaw) * 0.05, yaw)
      .hold(pose)
    a.y = seatY(this.h(a))
    this.chairAt(d, cx, cz, yaw)
    return a
  }

  private chairAt(d: Desk, x: number, z: number, yaw: number) {
    d.chair.position.set(x, 0, z)
    d.chair.rotation.y = yaw
  }

  /** Hands on the keyboard of desk n, keys moving. */
  private type(a: Actor, n: number, w = 1, speed = 1) {
    const d = this.desk(n)
    const t = this.time * 9 * speed + a.phase
    const s = this.h(a)
    const spread = 0.1 * Math.max(0.8, s)
    a.reach('l', w, d.kb.x - spread, d.kb.y + 0.028 + 0.007 * Math.max(0, Math.sin(t)), d.kb.z + 0.02, 0.3)
    a.reach('r', w, d.kb.x + spread, d.kb.y + 0.028 + 0.007 * Math.max(0, Math.sin(t * 1.3 + 2)), d.kb.z + 0.02, 0.3)
  }

  private mouseHand(a: Actor, n: number, w = 1) {
    const d = this.desk(n)
    a.reach('r', w, d.mouse.x - 0.005, d.mouse.y + 0.035, d.mouse.z + 0.02, 0.45)
  }

  /**
   * Standing up from desk n: 0 seated … 1 standing in front of the seat, the
   * chair rolled back behind (`push` m along the way he faces). Nobody ever
   * stands inside the seat; walks away start from `standAt`.
   */
  private rise(a: Actor, n: number, k: number, sitPose: Pose = P.SIT_TYPE, standPose: Pose = P.STAND, yaw = PI, push = RISE_PUSH, step = RISE_STEP) {
    const d = this.desk(n)
    const fx = Math.sin(yaw)
    const fz = Math.cos(yaw)
    const kk = ss(0.1, 0.9, k)
    this.on(a)
      .place(d.x + fx * lerp(-0.05, step, kk), d.chairZ + fz * lerp(-0.05, step, kk), yaw)
      .blend(
        [
          [0, sitPose],
          [0.55, P.SIT],
          [1, standPose],
        ],
        k,
      )
    a.y = seatY(this.h(a)) * (1 - ss(0.3, 0.9, k))
    const pk = ss(0.2, 0.8, k)
    this.chairAt(d, d.x - fx * push * pk, d.chairZ - fz * push * pk, yaw)
    return a
  }

  /** Where someone stands after rising from desk n facing `yaw`. */
  private standAt(n: number, yaw = PI, step = RISE_STEP): [number, number] {
    const d = this.desk(n)
    return [d.x + Math.sin(yaw) * step, d.chairZ + Math.cos(yaw) * step]
  }

  /** Desk n's chair left rolled back by someone who stood up from it. */
  private chairLeft(n: number, yaw = PI, push = RISE_PUSH) {
    const d = this.desk(n)
    this.chairAt(d, d.x - Math.sin(yaw) * push, d.chairZ - Math.cos(yaw) * push, yaw)
  }

  private walkOn(a: Actor, path: Path, u: number, base: Pose = P.STAND, startYaw?: number, endYaw?: number, stride = 1) {
    this.on(a).walk(path, clamp(u), base, startYaw, endYaw, stride)
    if (u > 0 && u < 1) this.walker = a
    return a
  }

  private path(key: string, pts: Array<[number, number]>) {
    let p = this.pathCache.get(key)
    if (!p) {
      p = makePath(pts)
      this.pathCache.set(key, p)
    }
    return p
  }

  private kemalYoung(pose: Pose = P.STAND_EASY, lookX = -1.5, lookZ = 2.0) {
    const k = this.on(this.cast.kemalYoung).place(KEMAL.x, KEMAL.z, PI).hold(pose)
    k.lookAt(lookX, lookZ, 0.6)
    return k
  }

  private kemalOld(pose: Pose = STAND_OLD, lookX = -1.5, lookZ = 2.0) {
    const k = this.on(this.cast.kemalOld).place(KEMAL.x, KEMAL.z, PI).hold(pose)
    k.lookAt(lookX, lookZ, 0.6)
    return k
  }

  /** Kemal leaning on both hands on the counter. */
  private lean(k: Actor, w = 1) {
    k.hold(COUNTER_LEAN)
    k.reach('l', w, k.x - 0.24, 1.075, 4.12, 0.6)
    k.reach('r', w, k.x + 0.24, 1.075, 4.12, 0.6)
  }

  /** The strangers: extras[i] at desks[i] (null = absent), typing or reading. */
  private crowd(desks: Array<number | null>, opts: { lapse?: number } = {}) {
    const ex = this.cast.extras
    desks.forEach((n, i) => {
      if (n === null || i >= ex.length) return
      if (opts.lapse !== undefined) {
        const hsh = Math.sin((i + 1) * 91.7 + Math.floor(opts.lapse) * 13.1) * 43758.5
        if (hsh - Math.floor(hsh) < 0.45) return
      }
      const a = ex[i].actor
      const kind = i % 4
      this.sit(a, n, kind === 1 ? P.SIT_READ : kind === 3 ? P.SIT_BACK : P.SIT_TYPE)
      if (kind === 0 || kind === 2) this.type(a, n, 1, 0.6 + i * 0.1)
      else if (kind === 1) this.mouseHand(a, n, 0.9)
      this.screens.set(n, { crowd: i })
    })
  }

  private resetChairs() {
    for (const d of this.desks) this.chairAt(d, d.x, d.chairZ, PI)
  }

  private resetProps() {
    for (const o of [this.kidCoins.group, this.emreCoins.group, this.boyCoins.group, this.handCoin, this.wallet, this.money.group, this.lighter.group, this.carriage, this.knit.group, this.glasses, ...this.pads])
      o.visible = false
    this.lighter.flame.visible = false
    this.cap.group.visible = false
    this.coats.dede.visible = false
    this.coats.baba.visible = false
    this.coats.anne.visible = false
    this.chairBag.visible = false
    this.cast.bag.visible = false
    this.cast.scarf.visible = false
    if (this.cup) this.cup.visible = false
    this.cafe.coin.visible = false
    this.cafe.coinGlint.material.opacity = 0
    this.cast.wearCoat('dede', false)
    this.cast.wearCoat('baba', false)
    this.cast.wearCoat('anneOld', false)
    for (const a of [this.cast.kemalOld, this.cast.anneOld, this.cast.baba]) a.figure.glasses.visible = true
    this.lightPlan = {
      pools: [],
      counter: false,
      glowA: null,
      glowB: null,
      bulbs: 'all',
      dim: 1,
      fill: 1,
    }
  }

  /** Who is lit how this frame (the director's light plan, applied in `world`). */
  private lightPlan: {
    pools: number[]
    counter: boolean
    glowA: { n: number; color: number; k: number; face?: THREE.Vector3 } | null
    glowB: { n?: number; at?: THREE.Vector3; color: number; k: number } | null
    bulbs: 'all' | 'pools' | 'none'
    dim: number
    /** Night fill of the room (sky light and reflections) so faces read: 1 full, 0 none. */
    fill: number
  } = {
    pools: [],
    counter: false,
    glowA: null,
    glowB: null,
    bulbs: 'all',
    dim: 1,
    fill: 1,
  }

  // ——— 01 NEFES ———

  private nefes(seg: SegmentId, u: number) {
    const ben = this.sit(this.cast.benAdult, 4, P.SIT_READ)
    // Forearms on the desk, still.
    ben.reach('l', 0.85, 0.6, 0.79, 0.12, 0.5)
    ben.reach('r', 0.85, 0.92, 0.79, 0.14, 0.5)
    if (seg === 'neck') {
      // He rubs his eyes once; later the cold reaches his neck and his hand goes there.
      const rub = win(0.1, 0.15, 0.22, 0.28, u)
      if (rub > 0) {
        // Fingertips at the inner corners of the eyes.
        this.touch(ben, 'r', rub, ben, 'head', -0.012 + 0.006 * Math.sin(this.time * 5), 0.1, 0.16, 0.25)
        bump(ben, 'head', 0.15 * rub)
      }
      const neck = win(0.46, 0.54, 0.8, 0.88, u)
      if (neck > 0) {
        // The palm flat on the back of his neck.
        this.touch(ben, 'r', neck, ben, 'neck', -0.01, 0.05, -0.078, 0.9)
        bump(ben, 'spine', 0.08 * neck)
        bump(ben, 'neck', 0.12 * neck)
      }
      const sag = ss(0.85, 0.98, u)
      bump(ben, 'chest', 0.08 * sag)
      bump(ben, 'head', 0.1 * sag)
    }
    this.screens.set(4, { key: 'desk-quiet', draw: desktop(), level: 0.8 })
    this.lightPlan.glowA = { n: 4, color: 0x6d8fb8, k: 1.1 }
    this.lightPlan.bulbs = 'none'
  }

  // ——— 02 ÇOCUK ———

  private child(seg: SegmentId, u: number, f: SetFrame) {
    const { benKid, emreKid } = this.cast
    this.crowd([null, null, null, null, null, null, null, null, null].map((_, i) => [7, 8, 10, 12, 13][i] ?? null))
    const more = f.flags.has('kid:more')
    const kidSecs = kidSeconds(f.p)
    const emreSecs = kidSeconds(f.p - (at('zero', 0.25) - at('zero', 0.2)))
    switch (seg) {
      case 'recess': {
        const k = this.kemalYoung(P.STAND_EASY, benKid.x, benKid.z)
        // The run: door bursts open, the boy first, Emre a step behind.
        const ub = (u - 0.05) / 0.57
        this.walkOn(benKid, P_RUN_IN, ub, RUN, PI, 0.1, 1.25)
        const ue = (u - 0.1) / 0.6
        this.walkOn(emreKid, P_EMRE_IN, ue, RUN, PI, -0.2, 1.25)
        this.cast.bag.visible = true
        if (u >= 0.62) {
          benKid.place(KID_AT_COUNTER.x, KID_AT_COUNTER.z, 0.1).hold(P.STAND)
          const slap = win(0.6, 0.64, 0.8, 0.9, u)
          benKid.reach('r', slap, KID_AT_COUNTER.x - 0.1, 1.075, 3.72, 0.5)
          benKid.lookAt(KEMAL.x, KEMAL.z, 0.8)
        }
        if (u >= 0.7) {
          emreKid.place(EMRE_AT_COUNTER.x, EMRE_AT_COUNTER.z, -0.25).hold(P.STAND)
          emreKid.reach('r', win(0.68, 0.71, 0.82, 0.92, u), EMRE_AT_COUNTER.x - 0.05, 1.075, 3.7, 0.5)
          // The shove: a hand on his friend's shoulder.
          emreKid.reach('l', win(0.72, 0.78, 0.86, 0.95, u), KID_AT_COUNTER.x + 0.12, 1.02, KID_AT_COUNTER.z + 0.02, 0.6)
          bump(emreKid, 'head', -0.12 * win(0.7, 0.75, 0.9, 1, u))
        }
        k.lookAt(benKid.x, benKid.z, 0.7)
        this.lightPlan.pools = []
        break
      }
      case 'coins': {
        this.cast.bag.visible = true
        const ben = this.on(benKid)
          .place(KID_AT_COUNTER.x, KID_AT_COUNTER.z, 0.1 + 1.6 * ss(0.74, 0.95, u))
          .hold(P.STAND)
        ben.lookAt(KEMAL.x, KEMAL.z, 0.9 * (1 - ss(0.74, 0.9, u)))
        bump(ben, 'head', -0.18 * (1 - ss(0.74, 0.9, u)))
        // Pocket out, coins over the counter.
        const pocket = win(0.0, 0.03, 0.05, 0.07, u)
        ben.reach('r', pocket, KID_AT_COUNTER.x - 0.09, 0.66, KID_AT_COUNTER.z + 0.06, 0.4)
        const over = win(0.05, 0.08, 0.1, 0.14, u)
        ben.reach('r', over, KID_AT_COUNTER.x - 0.12, 1.13, 3.7, 0.5)
        // One finger up: an hour.
        const finger = win(0.37, 0.41, 0.5, 0.56, u)
        ben.reach('r', finger, KID_AT_COUNTER.x - 0.12, 1.42, KID_AT_COUNTER.z + 0.22, 0.6)
        // Kemal: leaning on his hands; counting; the drawer; the keys.
        const kem = this.on(this.cast.kemalYoung)
        const step = ss(0.53, 0.58, u) * (1 - ss(0.72, 0.78, u))
        kem.place(lerp(KEMAL.x, -3.85, step), KEMAL.z, PI)
        if (u < 0.42 || u > 0.78) this.lean(kem)
        else kem.hold(P.LEAN_SOFT)
        kem.lookAt(benKid.x, benKid.z, 0.8 * (1 - step))
        bump(kem, 'head', 0.25 * (1 - step))
        const count = win(0.42, 0.45, 0.53, 0.56, u)
        if (count > 0) {
          const c = clamp((u - 0.44) / 0.1)
          const cx = lerp(-3.1, -2.82, c)
          kem.reach('r', count, cx, 1.085 + 0.008 * Math.abs(Math.sin(c * 18)), 3.88 + 0.12 * ss(0.6, 1, c), 0.5)
        }
        const keys = win(0.55, 0.59, 0.7, 0.74, u)
        if (keys > 0) {
          kem.reach('l', keys, -4.04, 1.1 + 0.006 * Math.max(0, Math.sin(this.time * 14)), 4.16, 0.4)
          kem.reach('r', keys, -3.93, 1.1 + 0.006 * Math.max(0, Math.sin(this.time * 14 + 2)), 4.08, 0.4)
          kem.lookAt(-4.3, 4.0, 0.9)
        }
        // Coins: falling from his hand at 0.07, counted and swept into the drawer.
        this.counterCoins(this.kidCoins, u, 0.07, 0.44, 0.55, -3.0, 3.86, 0.1)
        // Emre pushes his own coins forward.
        const em = this.on(emreKid).place(EMRE_AT_COUNTER.x, EMRE_AT_COUNTER.z, -0.25).hold(P.STAND)
        em.lookAt(benKid.x, benKid.z, 0.5)
        const push = win(0.74, 0.8, 0.9, 0.96, u)
        em.reach('r', push, EMRE_AT_COUNTER.x - 0.1, 1.08, 3.78, 0.5)
        if (u > 0.78) {
          this.emreCoins.group.visible = true
          this.emreCoins.group.position.set(EMRE_AT_COUNTER.x - 0.12, 1.067, 3.8)
          this.emreCoins.coins.forEach((c) => c.position.copy(c.userData.spread).multiplyScalar(0.6))
        }
        this.adminHighlight = u >= 0.58
        break
      }
      case 'play':
      case 'zero': {
        const ben = this.sit(benKid, 4, P.SIT_TYPE)
        const em = this.sit(emreKid, 3, P.SIT_TYPE)
        this.chairBag.visible = true
        if (seg === 'play') {
          this.type(ben, 4, ss(0.18, 0.24, u))
          this.type(em, 3, ss(0.18, 0.24, u))
          if (u < 0.2) {
            ben.hold(SIT_UP)
            em.hold(SIT_UP)
          }
          // Leaning in, hammering keys.
          bump(ben, 'spine', 0.08 * ss(0.2, 0.3, u))
          bump(em, 'spine', 0.1 * ss(0.2, 0.3, u))
          // The glance at the corner and the shrug.
          const glance = win(0.84, 0.87, 0.92, 0.95, u)
          ben.lookAt(1.2, -0.4, glance * 0.7)
          bump(ben, 'head', 0.12 * glance)
          const shrug = win(0.9, 0.92, 0.94, 0.97, u)
          bump(ben, 'lUpper', 0, 0, 0.18 * shrug)
          bump(ben, 'rUpper', 0, 0, -0.18 * shrug)
          bump(ben, 'head', 0, 0, 0.12 * shrug)
        } else {
          // 00:00 — hands up; Emre's goes a beat later and he throws his head back.
          const froze = ss(0.19, 0.24, u)
          if (u < 0.6) {
            ben.blend(
              [
                [0.18, P.SIT_TYPE],
                [0.24, HANDS_UP],
              ],
              u,
            )
            this.type(ben, 4, 1 - froze)
          } else
            ben.blend(
              [
                [0.6, HANDS_UP],
                [0.68, FLOP],
              ],
              u,
            )
          if (u < 0.64)
            em.blend(
              [
                [0.24, P.SIT_TYPE],
                [0.3, ARMS_FLUNG],
              ],
              u,
            )
          else
            em.blend(
              [
                [0.64, ARMS_FLUNG],
                [0.72, FLOP],
              ],
              u,
            )
          if (u < 0.25) this.type(em, 3, 1)
          // Both hands on his head, fingers in his hair.
          const onHead = ss(0.25, 0.31, u) * (1 - ss(0.62, 0.7, u))
          this.touch(em, 'l', onHead, em, 'head', 0.078, 0.18, -0.01, 0.95)
          this.touch(em, 'r', onHead, em, 'head', -0.078, 0.18, -0.01, 0.95)
          const laugh = ss(0.62, 0.7, u)
          bump(ben, 'head', -0.06 * laugh * (1 + Math.sin(this.time * 11)))
          bump(em, 'head', -0.06 * laugh * (1 + Math.sin(this.time * 10 + 1)))
          bump(em, 'head', 0, -0.15 * ss(0.3, 0.4, u) * (1 - laugh))
          em.lookAt(0.75, 0.6, 0.3 * laugh)
          ben.lookAt(-0.75, 0.6, 0.35 * laugh)
        }
        this.kemalYoung()
        const s4: ScreenState =
          seg === 'play'
            ? u < 0.2
              ? { key: `menu-${kidSecs}`, draw: kidMenu(kidSecs) }
              : {
                  key: `kg4-${kidSecs}-${Math.floor(this.time * 3)}`,
                  draw: kidGame(kidSecs, Math.floor(this.time * 3), 'blue', clamp(1 - (u - 0.2) / 0.06)),
                }
            : u < 0.2
              ? { key: `kg4-${kidSecs}`, draw: kidGame(kidSecs, 7, 'blue') }
              : { key: 'lock4', draw: lockScreen(4) }
        const s3: ScreenState =
          seg === 'play'
            ? u < 0.2
              ? { key: `menu3-${emreSecs}`, draw: kidMenu(emreSecs) }
              : {
                  key: `kg3-${emreSecs}-${Math.floor(this.time * 3)}`,
                  draw: kidGame(emreSecs, 50 + Math.floor(this.time * 3), 'red', clamp(1 - (u - 0.2) / 0.06)),
                }
            : u < 0.25
              ? { key: `kg3-${emreSecs}`, draw: kidGame(emreSecs, 51, 'red') }
              : { key: 'lock3', draw: lockScreen(3) }
        this.screens.set(4, s4)
        this.screens.set(3, s3)
        const locked = seg === 'zero' && u >= 0.2
        this.lightPlan.glowA = {
          n: 4,
          color: locked ? 0x5a7fae : u < 0.2 && seg === 'play' ? 0x6a86c8 : 0x7fc0e8,
          k: 0.8,
        }
        this.lightPlan.glowB = {
          n: 3,
          color: seg === 'zero' && u >= 0.25 ? 0x5a7fae : 0xe8906a,
          k: 0.7,
        }
        break
      }
      case 'pocket': {
        const ben = this.sit(benKid, 4, SIT_UP)
        this.chairBag.visible = true
        const em = this.sit(emreKid, 3, FLOP)
        em.lookAt(-0.75, -1.5, 0.2)
        const dig = win(0.03, 0.08, 0.26, 0.32, u)
        ben.reach('r', dig, 0.83, 0.56, 0.5, 0.55)
        const palm = ss(0.28, 0.4, u)
        ben.reach('r', palm, 0.84, 0.8, 0.36, 0.5)
        // The palm turned up, the coin on it.
        bump(ben, 'rHand', 0, -1.5 * palm, 0)
        ben.lookAt(0.84, 0.36, 0.5 * palm)
        bump(ben, 'head', 0.35 * palm)
        this.screens.set(4, { key: 'lock4', draw: lockScreen(4) })
        this.screens.set(3, { key: 'lock3', draw: lockScreen(3) })
        this.kemalYoung()
        this.lightPlan.glowA = { n: 4, color: 0x5a7fae, k: 0.7 }
        break
      }
      case 'dusk': {
        this.dusk(u, more, f)
        break
      }
    }
  }

  private adminHighlight = false

  /** Coins on the counter: dropped at `drop`, counted from `count`, swept into the drawer by `gone`. */
  private counterCoins(set: ReturnType<typeof coinSpread>, u: number, drop: number, count: number, gone: number, x: number, z: number, fall: number) {
    if (u < drop - 0.03 || u > gone) return
    set.group.visible = true
    set.group.position.set(x, 1.067, z)
    set.coins.forEach((c, i) => {
      const fallK = ss(drop - 0.03 + i * 0.006, drop + i * 0.006, u)
      const sweep = ss(count + i * 0.012, gone - 0.01, u)
      c.position.copy(c.userData.spread)
      c.position.y = (1 - fallK) * fall
      c.position.x = lerp(c.position.x, 0.2, sweep)
      c.position.z = lerp(c.position.z, 0.35, sweep)
      c.visible = fallK > 0.01
    })
    this.drawerOpen = win(count + 0.02, count + 0.05, gone, gone + 0.05, u)
  }

  private drawerOpen = 0

  private dusk(u: number, more: boolean, f: SetFrame) {
    const { benKid, emreKid } = this.cast
    const kem = this.kemalYoung()
    const extra = extraSeconds(f.p)
    const M = more ? { x: 3.32, z: 4.72 } : { x: 3.5, z: 5.85 }
    const B = { x: M.x - 0.34, z: M.z - 0.36 }
    const meetYaw = Math.atan2(M.x - B.x, M.z - B.z)
    if (more) {
      if (u < 0.07) {
        // The coin clicks down on the counter; Kemal taps a key.
        const ben = this.on(benKid).place(KID_AT_COUNTER.x, KID_AT_COUNTER.z, 0.1).hold(P.STAND)
        ben.reach('r', 1, KID_AT_COUNTER.x - 0.13, 1.08, 3.82, 0.5)
        this.handCoinAt = 'counter'
        this.lean(kem)
        kem.reach('l', ss(0.02, 0.05, u), -4.0, 1.1, 4.14, 0.4)
        this.screens.set(4, { key: 'lock4', draw: lockScreen(4) })
        this.chairBag.visible = true
        this.sit(emreKid, 3, FLOP)
      } else if (u < 0.33) {
        const ben = this.sit(benKid, 4, P.SIT_TYPE)
        this.type(ben, 4, 1 - ss(0.29, 0.31, u))
        bump(ben, 'spine', 0.08)
        if (u > 0.3)
          ben.blend(
            [
              [0.3, P.SIT_TYPE],
              [0.32, SIT_UP],
            ],
            u,
          )
        this.chairBag.visible = true
        // Emre, his own time over, cheering over his shoulder.
        const em = this.on(emreKid)
          .place(0.2, 1.05, PI - 0.4)
          .hold(P.FISTS)
        em.lookAt(0.75, -0.2, 0.7)
        bump(em, 'spine', 0.06 * (1 + Math.sin(this.time * 6)))
        this.screens.set(
          4,
          u < 0.3
            ? {
                key: `kg4x-${extra}-${Math.floor(this.time * 3)}`,
                draw: kidGame(extra, 90 + Math.floor(this.time * 3), 'blue'),
              }
            : { key: 'lock4', draw: lockScreen(4) },
        )
      } else {
        // He jumps off his chair and runs to her round the chairs, the bag grabbed on the way.
        const p = this.path('dusk-more', [
          [0.75, 0.48],
          [1.3, 0.64],
          [1.8, 1.4],
          [2.6, 3.6],
          [B.x, B.z],
        ])
        if (u < 0.36) {
          this.rise(benKid, 4, (u - 0.33) / 0.03, SIT_UP, P.STAND)
          this.chairBag.visible = u < 0.345
        } else if (u < 0.57) this.walkOn(benKid, p, (u - 0.36) / 0.21, RUN, PI, meetYaw, 1.2)
        const em = this.sit(emreKid, 3, P.SIT_BACK, { yaw: -0.9 })
        em.lookAt(3.5, 5, 0.6)
        em.reach('r', win(0.4, 0.45, 0.6, 0.66, u), -0.95, 1.18 + 0.04 * Math.sin(this.time * 9), 0.4, 0.8)
        this.screens.set(4, { key: 'lock4', draw: lockScreen(4) })
      }
    } else {
      // Home: the coin into the crack, the bag, the door; she is outside under the lamp.
      if (u < 0.13) {
        const ben = this.sit(benKid, 4, SIT_LEAN_IN)
        this.chairBag.visible = true
        const pat = 0.012 * Math.max(0, Math.sin(this.time * 12)) * win(0.07, 0.08, 0.11, 0.12, u)
        ben.reach('l', 1, COIN_CRACK.x + 0.005, COIN_CRACK.y + 0.02 + pat, COIN_CRACK.z - 0.005, 0.4)
        ben.lookAt(COIN_CRACK.x, COIN_CRACK.z, 0.6)
        bump(ben, 'head', 0.3)
        this.handCoinAt = u < 0.06 ? 'lhand' : 'crack'
      } else if (u < 0.31) {
        const k = (u - 0.13) / 0.04
        if (k < 1) {
          this.rise(benKid, 4, k, SIT_LEAN_IN, P.STAND)
          this.chairBag.visible = k < 0.5
        } else {
          this.walkOn(benKid, P_DESK_TO_DOOR, (u - 0.17) / 0.12, P.STAND, PI, 0)
          if (u > 0.28) benKid.reach('r', win(0.28, 0.3, 0.33, 0.36, u), DOOR.x + 0.05, 1.02, DOOR.z - 0.1, 0.5)
        }
        this.handCoinAt = 'crack'
      } else if (u < 0.58) {
        const p = this.path('dusk-home-out', [
          [3.35, 4.55],
          [3.3, 5.1],
          [B.x, B.z],
        ])
        if (u < 0.4) this.on(benKid).place(3.35, 4.55, 0).hold(P.STAND)
        else this.walkOn(benKid, p, (u - 0.4) / 0.16, P.STAND, 0, meetYaw)
        benKid.lookAt(M.x, M.z, 0.6)
        this.handCoinAt = 'crack'
      }
      // Emre waving from his chair.
      const em = this.sit(emreKid, 3, P.SIT_BACK, {
        yaw: -1.1 * ss(0.12, 0.2, u),
      })
      em.lookAt(benKid.x, benKid.z, 0.8)
      em.reach('r', win(0.16, 0.2, 0.32, 0.38, u), -0.95, 1.18 + 0.05 * Math.sin(this.time * 9), 0.45, 0.8)
      this.screens.set(4, { key: 'lock4', draw: lockScreen(4) })
    }
    if (u >= 0.13) this.cast.bag.visible = !this.chairBag.visible
    // The mother: in the doorway (more) or outside under the lamp (home); hands; out together.
    if (u >= 0.28) this.motherAndSon(u, M, B, meetYaw)
    this.screens.set(3, { key: 'lock3', draw: lockScreen(3) })
    // After he goes: the empty chair still swivelling.
    const t0 = more ? 0.36 : 0.17
    if (u > t0) {
      const d = this.desk(4)
      const swing = Math.exp(-(u - t0) * 9) * Math.sin((u - t0) * 40) * 0.6
      this.chairAt(d, d.x, d.chairZ + RISE_PUSH, PI + 0.3 * ss(t0, t0 + 0.04, u) + swing)
    }
    this.lightPlan.glowA = { n: 4, color: 0x5a7fae, k: 0.55 }
  }

  /** Where the coin is this frame (chapter 2 ending / the counter). */
  private handCoinAt: 'none' | 'palm' | 'lhand' | 'counter' | 'crack' = 'none'

  /** The young mother: waiting, a hand held out; the boy takes it at 0.6 and they go out together. */
  private motherAndSon(u: number, M: { x: number; z: number }, B: { x: number; z: number }, meetYaw: number) {
    const a = this.on(this.cast.anneYoung)
    const b = this.cast.benKid
    const leave = ss(0.58, 0.68, u)
    const out = 1.7 * leave
    a.place(lerp(M.x, M.x + 0.15, leave), M.z + out, lerp(PI - 0.1, 2 * PI, ss(0.58, 0.61, u))).hold(P.STAND)
    if (leave > 0 && leave < 1) {
      a.walking = 0
      this.walkOn(
        a,
        this.path(`mom-out-${M.z}`, [
          [M.x, M.z],
          [M.x + 0.15, M.z + 1.7],
        ]),
        leave,
        P.STAND,
        PI,
        0,
      )
    }
    const offer = win(0.36, 0.44, 0.56, 0.6, u)
    const hx = (M.x + B.x) / 2
    const hz = (M.z + B.z) / 2
    if (u < 0.58) a.reach('l', offer, hx, 0.82, hz, 0.4)
    a.lookAt(b.x, b.z, 0.7 * (1 - leave))
    bump(a, 'head', 0.16 * (1 - leave))
    if (u >= 0.57) {
      // Hand in hand: at the meeting point, then out through the door beside her.
      this.on(b)
        .place(lerp(B.x, B.x + 0.2, leave), B.z + out, lerp(meetYaw, 0, ss(0.58, 0.61, u)))
        .hold(P.STAND)
      if (leave > 0 && leave < 1)
        this.walkOn(
          b,
          this.path(`son-out-${M.z}`, [
            [B.x, B.z],
            [B.x + 0.2, B.z + 1.7],
          ]),
          leave,
          P.STAND,
          meetYaw,
          0,
        )
      b.lookAt(a.x, a.z, 0.6 * (1 - leave))
      const hold = ss(0.57, 0.6, u)
      if (u < 0.6) b.reach('r', hold, hx, 0.82, hz, 0.4)
      else {
        const mx = (a.x + b.x) / 2
        const mz = (a.z + b.z) / 2
        b.reach('l', 1, mx, 0.76, mz, 0.4)
        a.reach('r', 1, mx, 0.76, mz, 0.4)
      }
      if (u < 0.6) a.reach('l', 1, hx, 0.82, hz, 0.4)
    }
  }

  // ——— 03 SÜRE ———

  private time3(seg: SegmentId, u: number, f: SetFrame) {
    const ben = this.cast.benAdult
    const coinOn = true
    if (coinOn) this.handCoinAt = 'crack'
    switch (seg) {
      case 'years': {
        const t = clamp(u / 0.85)
        const s = 6.5 * (1 - Math.pow(1 - t, 2.2))
        if (u < 0.85) this.crowd(this.era === 'kid' ? [7, 8, 10, 12, 13, null, null, null, null] : [1, 2, 7, 8, 10, 12, 13, 5, 9], { lapse: s * 6 })
        else this.crowd([1, null, 7, null, null, 12, 13])
        if (u >= 0.55) {
          this.sit(ben, 4, P.SIT_TYPE)
          this.type(ben, 4)
          this.screens.set(4, { key: 'road', draw: roadGame(3) })
        }
        if (this.era === 'kid') this.kemalYoung()
        else this.kemalOld()
        if (f.flags.has('kid:home')) this.cafe.coinGlint.material.opacity = 0.55 + 0.45 * Math.sin(this.time * 2.2)
        this.lightPlan.glowA = u >= 0.55 ? { n: 4, color: 0x8a6a5a, k: 0.7 } : null
        break
      }
      case 'soul':
      case 'dash': {
        this.crowd([1, null, 7, null, null, 12, 13])
        this.sit(ben, 4, P.SIT_TYPE)
        this.type(ben, 4, 1, 0.7)
        bump(ben, 'spine', 0.1)
        bump(ben, 'chest', 0.06)
        if (seg === 'dash') {
          const look = win(0.5, 0.56, 0.72, 0.8, u)
          ben.lookAt(0.92, -0.22, look * 0.55)
          bump(ben, 'head', 0.1 * look - 0.12 * ss(0.78, 0.9, u))
          ben.lookAt(-2, -4, ss(0.8, 0.95, u) * 0.4)
          if (u > 0.5) this.type(ben, 4, 1 - ss(0.52, 0.6, u))
        }
        this.screens.set(4, {
          key: 'road',
          draw: roadGame(3),
          level: seg === 'dash' ? 0.94 + 0.06 * Math.sin(this.time * 2.4) : 1,
        })
        this.kemalOld()
        this.lightPlan.glowA = { n: 4, color: 0x9a7a6a, k: 0.9 }
        this.lightPlan.pools = [4, 12]
        this.lightPlan.counter = true
        break
      }
      case 'wallet': {
        this.crowd([1, null, 7, null, null, 12, 13])
        if (u < 0.22) {
          this.rise(ben, 4, u / 0.22, P.SIT_TYPE, P.STAND)
          const inner = win(0.12, 0.17, 0.2, 0.24, u)
          ben.reach('r', inner, 0.68, 1.3, ben.z + 0.08, 0.3)
        } else {
          this.walkOn(ben, P_TO_COUNTER, (u - 0.24) / 0.68, P.STAND, PI, -0.45)
          this.chairLeft(4)
          // The nod as he arrives.
          bump(ben, 'head', 0.12 * win(0.9, 0.93, 0.96, 0.99, u))
        }
        this.walletIn = u > 0.17 ? 'hand' : 'none'
        this.screens.set(4, { key: 'road', draw: roadGame(3) })
        this.kemalOld(STAND_OLD, ben.x, ben.z)
        this.lightPlan.pools = [4, 12]
        this.lightPlan.counter = true
        break
      }
      case 'counter': {
        this.counterScene(u, f)
        this.lightPlan.counter = true
        break
      }
    }
  }

  private walletIn: 'none' | 'hand' | 'counter' = 'none'

  private counterScene(u: number, f: SetFrame) {
    this.chairLeft(4)
    const ben = this.on(this.cast.benAdult).place(MAN_AT_COUNTER.x, MAN_AT_COUNTER.z, -0.45).hold(P.STAND)
    const kem = this.on(this.cast.kemalOld).place(KEMAL.x, KEMAL.z, PI)
    const all = f.flags.has('ask:all')
    // The wallet lands on the counter.
    const put = win(0.0, 0.02, 0.05, 0.09, u)
    ben.reach('r', put, -2.92, 1.09, 3.82, 0.5)
    this.walletIn = u < 0.02 ? 'hand' : 'counter'
    ben.lookAt(KEMAL.x, KEMAL.z, 0.9)
    bump(ben, 'head', -0.08)
    // Kemal's lean, his look over his glasses; the two taps on the note.
    this.lean(kem)
    kem.lookAt(ben.x, ben.z, 0.85)
    bump(kem, 'head', 0.16)
    const taps = win(0.47, 0.5, 0.6, 0.63, u)
    if (taps > 0) {
      const tap = Math.max(Math.sin(clamp((u - 0.5) / 0.03) * PI), Math.sin(clamp((u - 0.55) / 0.03) * PI))
      kem.hold(P.LEAN_SOFT)
      kem.reach('l', 1, kem.x - 0.24, 1.075, 4.12, 0.6)
      kem.reach('r', taps, NOTE_POS.x + 0.02, NOTE_POS.y + 0.012 + 0.02 * tap, NOTE_POS.z + 0.02, 0.6)
      kem.lookAt(NOTE_POS.x, NOTE_POS.z, 0.8)
      bump(kem, 'head', 0.3)
    }
    // The answer, pushed back.
    if (all) {
      // He spread everything during the taps; Kemal squares it into one pile and slides it back.
      const spread = ss(0.49, 0.6, u)
      const pile = ss(0.64, 0.76, u)
      const back = ss(0.78, 0.9, u)
      this.money.group.visible = u > 0.48
      this.money.pieces.forEach((pc, i) => {
        const sx = -2.95 + (i - 4) * 0.075
        const sz = 3.86 + ((i * 37) % 7) * 0.012
        const px = -2.93
        const pz = lerp(3.88, 3.72, back)
        pc.position.set(lerp(lerp(-2.9, sx, spread), px, pile), 1.068 + i * 0.0016 * pile + 0.0006 * i, lerp(lerp(3.82, sz, spread), pz, pile))
        pc.rotation.set(0, lerp((i - 4) * 0.25 * spread, 0, pile), 0)
      })
      this.walletOpen = true
      const sq = win(0.64, 0.67, 0.86, 0.9, u)
      kem.reach('r', sq, -2.95, 1.09, lerp(3.92, 3.76, back), 0.6)
      kem.reach('l', win(0.64, 0.67, 0.74, 0.78, u), -3.05, 1.09, 3.92, 0.6)
      ben.reach('r', win(0.48, 0.5, 0.56, 0.6, u), -2.8, 1.09, 3.86, 0.5)
    } else {
      const back = ss(0.66, 0.8, u)
      this.walletSlide = back
      kem.reach('r', win(0.63, 0.66, 0.8, 0.84, u), lerp(-2.95, -2.88, back), 1.085, lerp(3.86, 3.72, back), 0.6)
    }
    this.crowd([1, null, 7, null, null, 12, 13])
    // The people of his life take their seats while he is at the counter.
    this.lifeSeated()
  }

  private walletOpen = false
  private walletSlide = 0

  /** Dede, Baba, Emre and the mother at their desks (chapter 4 on), each at their own screen. */
  private lifeSeated(o: { dede?: boolean; baba?: boolean; emre?: boolean; anne?: boolean } = {}) {
    const { dede, baba, emreAdult, anneOld } = this.cast
    if (o.dede !== false) {
      this.sit(dede, 9, P.SIT_READ)
      this.mouseHand(dede, 9, 0.9)
      this.cap.group.visible = true
      this.coats.dede.visible = true
      this.screens.set(9, {
        key: `tavla-${Math.floor(this.time / 3)}`,
        draw: tavla(Math.floor(this.time / 3)),
      })
    }
    if (o.baba !== false) {
      this.sit(baba, 11, P.SIT_READ)
      this.mouseHand(baba, 11, 0.95)
      this.coats.baba.visible = true
      this.screens.set(11, {
        key: `news-${Math.floor(this.time * 2) % 20}`,
        draw: news((Math.floor(this.time * 2) % 20) / 20),
      })
    }
    if (o.emre !== false) {
      this.sit(emreAdult, 3, P.SIT_TYPE)
      this.type(emreAdult, 3, 1, 1.2)
      this.screens.set(3, {
        key: `foot-${Math.floor(this.time)}`,
        draw: football(Math.floor(this.time)),
      })
    }
    if (o.anne !== false) {
      this.sit(anneOld, 5, KNIT)
      this.knitHands(anneOld, 0.62)
      this.coats.anne.visible = true
      this.screens.set(5, { key: 'sol', draw: solitaire(4) })
      if (this.cup) this.cup.visible = true
    }
  }

  /** The mother's hands at the needles in her lap (knitting shown, growing to `len`). */
  private knitHands(a: Actor, len: number, w = 1) {
    const yaw = a.yaw
    const fx = Math.sin(yaw)
    const fz = Math.cos(yaw)
    const rx = -fz
    const rz = fx
    const cx = a.x + fx * 0.3
    const cz = a.z + fz * 0.3
    const t = this.time * 7
    a.reach('l', w, cx - rx * 0.085, 0.72 + 0.006 * Math.sin(t), cz - rz * 0.085, 0.35)
    a.reach('r', w, cx + rx * 0.085, 0.72 + 0.006 * Math.sin(t + 2), cz + rz * 0.085, 0.35)
    this.knitAt = { shape: 'lap', len, at: 'hands', who: a }
  }

  /** The knitting put down in her lap (hands elsewhere): it lies over her knees. */
  private knitInLap(a: Actor, len: number) {
    const fx = Math.sin(a.yaw)
    const fz = Math.cos(a.yaw)
    this.knitAt = { shape: 'lap', len, at: 'world', x: a.x + fx * 0.26, y: 0.7, z: a.z + fz * 0.26, yaw: a.yaw }
  }

  /**
   * Where the unfinished scarf is this frame: its shape (lap, hanging, against
   * a chest, flat), its length, and what carries it — her hands (between her
   * grips), someone's chest (the chest bone's frame), or a fixed place.
   */
  private knitAt: {
    shape: KnitShape
    len: number
    at: 'hands' | 'chest' | 'world'
    who?: Actor
    x?: number
    y?: number
    z?: number
    yaw?: number
  } | null = null

  // ——— 04 ÖLÜMCÜL HASTALIK ———

  private illness(seg: SegmentId, u: number, f: SetFrame) {
    const ben = this.cast.benAdult
    const full = [1, 2, 7, 8, 10, 12, 13]
    this.crowd(full)
    this.lifeSeated()
    this.kemalOld()
    this.handCoinAt = 'crack'
    this.screens.set(4, { key: 'road', draw: roadGame(3) })
    this.lightPlan.pools = [9, 11, 3, 5]
    switch (seg) {
      case 'look': {
        this.walletIn = 'hand'
        this.chairLeft(4)
        if (u < 0.3) this.walkOn(ben, P_BACK_FROM_COUNTER, u / 0.3, P.STAND, PI * 0.8, PI)
        else {
          this.on(ben).place(-0.2, 1.4, PI).hold(P.STAND)
          bump(ben, 'head', -0.14)
          ben.lookAt(0.3 * Math.sin(u * 4), -2, 0.4)
        }
        // Each one named gets a touch more light.
        const order: Array<[number, number]> = [
          [9, 0.55],
          [11, 0.65],
          [3, 0.75],
          [5, 0.85],
        ]
        let who = 0
        for (const [n, t] of order) if (u >= t - 0.04) who = n
        if (who) this.lightPlan.glowB = { n: who, color: 0xffd2a0, k: 1.3 }
        break
      }
      case 'dashes': {
        this.walletIn = 'none'
        this.chairLeft(4)
        if (u < 0.55) this.walkOn(ben, P_LOOK_TO_SEAT, u / 0.35, P.STAND, PI, PI)
        if (u >= 0.35) {
          const k = clamp((0.6 - u) / 0.25)
          this.rise(ben, 4, k, P.SIT_TYPE, P.STAND)
          if (k <= 0) this.type(ben, 4, ss(0.6, 0.7, u))
        }
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 0.8 }
        break
      }
      case 'bell': {
        this.sit(ben, 4, P.SIT_TYPE)
        this.type(ben, 4, 1 - win(0.1, 0.16, 0.36, 0.42, u))
        // The cold at his neck: coat drawn closer, a hand to the nape.
        const cold = win(0.12, 0.17, 0.34, 0.42, u)
        this.touch(ben, 'r', cold, ben, 'neck', -0.01, 0.05, -0.078, 0.9)
        // The other hand draws the coat closed at the collar.
        this.touch(ben, 'l', cold * 0.9, ben, 'chest', 0.03, 0.2, 0.15, 0.3)
        bump(ben, 'spine', 0.08 * cold)
        this.couple(u)
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 1.0 }
        break
      }
      case 'disease': {
        this.sit(ben, 4, P.SIT_STILL)
        this.coupleSeated()
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 1.0 }
        break
      }
    }
    if (seg !== 'bell' && seg !== 'disease' && f.p >= SEG.bell.start) this.coupleSeated()
  }

  /** The young couple with the baby carriage coming in (bell). */
  private couple(u: number) {
    const { coupleM, coupleF } = this.cast
    const pc = this.path('carriage', [
      [3.45, 6.4],
      [3.45, 4.6],
      [4.1, 3.0],
      [4.35, 1.75],
    ])
    const pm = this.path('coupleM', [
      [3.7, 6.7],
      [3.75, 4.7],
      [3.9, 3.0],
      [3.75, 1.2],
    ])
    const uf = (u - 0.08) / 0.62
    this.walkOn(coupleF, pc, uf, P.STAND, PI, PI)
    // She pushes: hands on the handle.
    const fx = Math.sin(coupleF.yaw)
    const fz = Math.cos(coupleF.yaw)
    const hx = coupleF.x + fx * 0.42
    const hz = coupleF.z + fz * 0.42
    coupleF.reach('l', 1, hx - fz * 0.15, 0.98, hz + fx * 0.15, 0.4)
    coupleF.reach('r', 1, hx + fz * 0.15, 0.98, hz - fx * 0.15, 0.4)
    this.carriageAt(hx + fx * 0.6, hz + fz * 0.6, coupleF.yaw)
    // He holds the door, then follows to their desk and sits.
    const um = (u - 0.25) / 0.6
    if (u < 0.25) {
      this.on(coupleM)
        .place(3.85, 4.75, PI - 0.6)
        .hold(P.STAND)
      coupleM.reach('r', 1, DOOR.x + 0.0, 1.0, DOOR.z - 0.75, 0.5)
    } else if (um < 1) this.walkOn(coupleM, pm, um, P.STAND, PI, PI)
    else this.sit(coupleM, 6, P.SIT_BACK)
    coupleM.lookAt(coupleF.x, coupleF.z, 0.4)
    if (u > 0.8) this.screens.set(6, { key: 'str6', draw: strangerScreen(5) })
  }

  private coupleSeated() {
    const { coupleM, coupleF } = this.cast
    this.sit(coupleM, 6, P.SIT_TYPE)
    this.type(coupleM, 6, 1, 0.5)
    this.on(coupleF).place(4.42, 1.98, PI).hold(P.STAND_EASY)
    coupleF.lookAt(4.42, 0.9, 0.7)
    bump(coupleF, 'head', 0.35)
    coupleF.reach('r', 1, 4.3, 1.0, 1.55, 0.4)
    coupleF.reach('l', 1, 4.55, 1.0, 1.55, 0.4)
    this.carriageAt(4.42, 0.95, PI)
    this.screens.set(6, { key: 'str6', draw: strangerScreen(5) })
  }

  private carriageAt(x: number, z: number, yaw: number) {
    this.carriage.visible = true
    this.carriage.position.set(x, 0, z)
    this.carriage.rotation.y = yaw
  }

  // ——— 05 BİRER BİRER ———

  private oneByOne(seg: SegmentId, u: number, f: SetFrame) {
    const { benAdult: ben, dede, baba, emreAdult: emre } = this.cast
    this.kemalOld()
    this.handCoinAt = 'crack'
    this.screens.set(4, { key: 'road', draw: roadGame(3) })
    switch (seg) {
      case 'bulmaz': {
        this.crowd([1, 2, 7, 8, 10, 12, 13])
        this.lifeSeated({ emre: false })
        this.coupleSeated()
        // Emre: lighter, a grin, turned toward him, pointing at his screen.
        const turn = win(0.12, 0.2, 0.42, 0.5, u)
        this.sit(emre, 3, P.SIT_BACK, { yaw: -0.75 * turn })
        this.lighterIn = 'emre'
        emre.reach('r', 1, -0.72 + 0.2 * turn, 0.98, 0.32, 0.4)
        emre.reach('l', win(0.18, 0.24, 0.36, 0.44, u), -0.6, 1.0, -0.15, 0.6)
        emre.lookAt(0.75, 0.6, 0.7 * turn)
        const s = this.sit(ben, 4, P.SIT_BACK, { yaw: 0.35 * turn })
        s.lookAt(-0.75, -0.2, 0.8 * turn)
        const laugh = win(0.24, 0.3, 0.42, 0.5, u)
        bump(s, 'head', -0.08 * laugh * (1 + Math.sin(this.time * 10)))
        bump(emre, 'head', -0.05 * laugh * (1 + Math.sin(this.time * 9)))
        if (u > 0.5) {
          this.sit(ben, 4, P.SIT_TYPE)
          this.type(ben, 4)
        }
        this.screens.set(3, {
          key: `foot-${Math.floor(this.time)}`,
          draw: football(Math.floor(this.time)),
        })
        this.lightPlan.pools = [9, 11, 3, 5]
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 0.9 }
        this.lightPlan.glowB = { n: 3, color: 0x9ad0a0, k: 0.8 }
        break
      }
      case 'grandpa': {
        this.crowd([1, 2, null, 8, 10, 12, 13])
        this.lifeSeated({ dede: false })
        this.cap.group.visible = true
        this.sit(ben, 4, P.SIT_TYPE)
        this.type(ben, 4, u < 0.5 ? 1 : 0)
        if (u < 0.25) {
          this.sit(dede, 9, P.SIT_READ)
          this.mouseHand(dede, 9, 1 - ss(0.04, 0.1, u))
          // He reads it and nods; not surprised.
          const nod = win(0.1, 0.13, 0.2, 0.24, u)
          bump(dede, 'head', 0.1 * nod * Math.sin((u - 0.1) * 120))
          this.coats.dede.visible = true
        } else if (u < 0.5) {
          const k = (u - 0.25) / 0.15
          this.rise(dede, 9, Math.min(1, k), P.SIT_READ, STAND_OLD)
          const coat = ss(0.4, 0.47, u)
          if (u > 0.4)
            dede.blend(
              [
                [0.4, STAND_OLD],
                [0.45, COAT_ON],
                [0.5, STAND_OLD],
              ],
              u,
            )
          this.coats.dede.visible = coat < 0.5
          this.cast.wearCoat('dede', coat >= 0.5)
        } else {
          this.cast.wearCoat('dede', true)
          if (u < 0.72) {
            // Behind him, his right hand resting on the narrator's right shoulder.
            this.on(dede).place(0.97, 1.08, PI + 0.12).hold(STAND_OLD)
            this.touch(dede, 'r', win(0.51, 0.56, 0.66, 0.71, u), ben, 'chest', -0.14, 0.215, -0.005, 0.45)
            dede.lookAt(0.75, 0.4, 0.6)
            bump(dede, 'head', 0.35)
          } else {
            const p = this.path('dede-out', [
              [0.97, 1.08],
              [2.3, 2.2],
              [3.1, 3.9],
              [3.45, 4.7],
              [3.5, 6.2],
            ])
            this.walkOn(dede, p, (u - 0.72) / 0.27, STAND_OLD, PI, 0, 0.8)
          }
          // His face turning up to the old man.
          const up = win(0.5, 0.55, 0.66, 0.74, u)
          bump(ben, 'head', -0.2 * up)
          ben.lookAt(1.2, 1.5, up * 0.5)
        }
        const lock = u >= 0.04 && u < 0.5
        this.screens.set(9, u < 0.04 ? { key: 'tavla-0', draw: tavla(1) } : lock ? { key: 'lock9', draw: lockScreen(9) } : OFF)
        this.lightPlan.pools = [9, 4, 3, 11]
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 0.8 }
        this.lightPlan.glowB = lock ? { n: 9, color: 0x5a7fae, k: 1.0 } : null
        void f
        break
      }
      case 'friend': {
        this.crowd([1, null, 7, null, 10, 12, null])
        this.lifeSeated({ dede: false, emre: false })
        this.cap.group.visible = true
        const turned = 1 - ss(0.86, 0.9, u)
        const s = this.sit(ben, 4, P.SIT_BACK, { yaw: 0.3 })
        s.lookAt(-0.75, 0.5, 0.85)
        const grin = win(0.4, 0.45, 0.7, 0.74, u)
        bump(s, 'head', -0.05 * grin * (1 + Math.sin(this.time * 9)))
        if (u >= 0.88) s.lookAt(2.5, 4.5, ss(0.9, 0.97, u) * 0.9)
        if (u < 0.86) {
          const e = this.sit(emre, 3, P.SIT_BACK, { yaw: -1.05 })
          this.lighterIn = u < 0.84 ? 'emre' : 'desk'
          e.reach('r', 1 - ss(0.82, 0.85, u), -0.62, 0.98, 0.32, 0.4)
          if (u > 0.8) e.reach('r', win(0.8, 0.83, 0.86, 0.88, u), -0.5, 0.79, -0.05, 0.5)
          e.lookAt(0.75, 0.6, 0.8 - 0.8 * win(0.75, 0.77, 0.79, 0.8, u))
          if (u > 0.75 && u < 0.8) e.lookAt(-0.75, -0.3, 1)
          const laugh = win(0.05, 0.1, 0.72, 0.74, u)
          bump(e, 'head', -0.05 * laugh * (1 + Math.sin(this.time * 8)))
        } else {
          this.lighterIn = 'desk'
          const k = (u - 0.86) / 0.03
          if (k < 1) this.rise(emre, 3, k, P.SIT_BACK, P.STAND, PI - 1.05)
          else {
            const [sx, sz] = this.standAt(3, PI - 1.05)
            const p = this.path('emre-out', [
              [sx, sz],
              [-0.2, 0.8],
              [0.15, 1.55],
              [2.8, 4.0],
              [3.45, 4.7],
              [3.5, 6.3],
            ])
            this.chairLeft(3, PI - 1.05)
            this.walkOn(emre, p, (u - 0.89) / 0.11, P.STAND, PI - 1.05, 0)
          }
        }
        this.screens.set(
          3,
          u < 0.74
            ? {
                key: `foot-${Math.floor(this.time)}`,
                draw: football(Math.floor(this.time)),
              }
            : u < 0.75
              ? OFF
              : { key: 'lock3', draw: lockScreen(3) },
        )
        this.lightPlan.pools = [3, 4, 11, 5]
        this.lightPlan.glowA = { n: 4, color: 0xffcf9a, k: 0.6 }
        this.lightPlan.glowB = {
          n: 3,
          color: u < 0.74 ? 0x9ad0a0 : 0x5a7fae,
          k: 0.9 * turned,
        }
        break
      }
      case 'lighter': {
        this.crowd([1, null, 7, null, 10, 12, null])
        this.lifeSeated({ dede: false, emre: false })
        this.cap.group.visible = true
        // Emre's empty chair, still turning, slowing to a stop.
        const d3 = this.desk(3)
        const spin = 1 - Math.pow(1 - clamp(u / 0.42), 2)
        this.chairAt(d3, EMRE_CHAIR.x, EMRE_CHAIR.z, PI - 1.05 + 0.9 * spin)
        if (u < 0.46) {
          const s = this.sit(ben, 4, P.SIT_STILL, { yaw: 0.25 })
          s.lookAt(-0.6, 0.0, 0.7)
          this.lighterIn = 'desk'
        } else {
          const roll = ss(0.46, 0.5, u)
          const s = this.sit(ben, 4, SIT_LEAN_IN, {
            yaw: 0.45 * roll,
            dx: -0.62 * roll,
            dz: -0.05 * roll,
          })
          const pick = win(0.48, 0.52, 0.56, 0.6, u)
          const lift = ss(0.54, 0.6, u)
          if (u < 0.55) s.reach('l', pick, -0.49, 0.8, -0.04, 0.4)
          else s.reach('l', 1, lerp(-0.49, -0.1, lift), lerp(0.8, 1.02, lift), lerp(-0.04, 0.3, lift), 0.4)
          s.lookAt(lerp(-0.5, -0.1, lift), lerp(-0.05, 0.3, lift), 0.8)
          bump(s, 'head', 0.25 * (1 - lift) + 0.05)
          this.lighterIn = u < 0.52 ? 'desk' : 'ben'
        }
        this.screens.set(3, OFF)
        this.lightPlan.pools = [3, 4, 11, 5]
        this.lightPlan.glowA = { n: 4, color: 0xffcf9a, k: 0.6 }
        const flame = u >= 0.6 && u < 0.88
        if (flame) this.lightPlan.glowB = { at: this.flamePos, color: 0xffa24a, k: 1.6 }
        break
      }
      case 'father': {
        this.crowd([1, null, 7, null, null, null, 13])
        this.lifeSeated({ dede: false, emre: false, baba: false })
        this.cap.group.visible = true
        this.lighterIn = 'desk'
        this.chairAt(this.desk(3), EMRE_CHAIR.x, EMRE_CHAIR.z, PI - 0.15)
        const s = this.sit(ben, 4, P.SIT_TYPE)
        this.type(ben, 4, 1 - ss(0.42, 0.48, u))
        if (u >= 0.45) {
          s.hold(P.SIT_STILL)
          s.lookAt(1.5, -1.6, 0.7 * win(0.45, 0.5, 0.8, 0.9, u))
        }
        // Baba: the lock, the glasses folded into his pocket, the look back, the coat, the door.
        if (u < 0.6) {
          const turn = ss(0.45, 0.53, u)
          const b = this.sit(baba, 11, u < 0.15 ? P.SIT_READ : SIT_UP, {
            yaw: -2.6 * turn,
          })
          if (u < 0.15) this.mouseHand(baba, 11, 1 - ss(0.04, 0.1, u))
          // The glasses: both hands to the temples, off, folded in front of his chest, into the shirt pocket.
          const temples = win(0.15, 0.19, 0.2, 0.24, u)
          const front = win(0.2, 0.245, 0.3, 0.335, u)
          const pocket = win(0.31, 0.345, 0.375, 0.42, u)
          for (const [side, sx] of [
            ['l', 1],
            ['r', -1],
          ] as const) {
            this.touch(b, side, temples, b, 'head', sx * 0.072, 0.125, 0.075, 0.6)
            this.touch(b, side, front * (side === 'r' ? 1 : 1 - ss(0.3, 0.33, u)), b, 'chest', sx * 0.035, 0.16, 0.25, 0.35)
          }
          this.touch(b, 'r', pocket, b, 'chest', 0.072, 0.125, 0.14, 0.35)
          if (u > 0.15 && u < 0.42) bump(b, 'head', 0.16)
          baba.figure.glasses.visible = u < 0.2
          this.glassesIn = u >= 0.2 && u < 0.375 ? 'hand' : 'none'
          b.lookAt(0.75, 0.6, turn * 0.8)
          bump(b, 'head', 0.12 * win(0.54, 0.56, 0.58, 0.61, u))
          this.coats.baba.visible = true
        } else {
          baba.figure.glasses.visible = false
          // He stands up out of the turned chair (it stays, its back to the desk), coat on, out by the right aisle.
          const k = (u - 0.6) / 0.06
          const [bx, bz] = this.standAt(11, PI - 2.6, 0.3)
          if (k < 1) this.rise(baba, 11, k, SIT_UP, P.STAND, PI - 2.6, 0.05, 0.3)
          else if (u < 0.74) {
            this.on(baba)
              .place(bx, bz, PI - 2.6)
              .blend(
                [
                  [0.66, P.STAND],
                  [0.7, COAT_ON],
                  [0.74, P.STAND],
                ],
                u,
              )
            this.chairAt(this.desk(11), BABA_CHAIR.x, BABA_CHAIR.z, PI - 2.6)
          } else {
            const p = this.path('baba-out', [
              [bx, bz],
              [3.0, -0.95],
              [4.95, -0.9],
              [5.05, 2.2],
              [3.7, 4.3],
              [3.5, 6.2],
            ])
            this.walkOn(baba, p, (u - 0.74) / 0.26, P.STAND, PI - 2.6, 0)
            this.chairAt(this.desk(11), BABA_CHAIR.x, BABA_CHAIR.z, PI - 2.6)
          }
          this.cast.wearCoat('baba', u >= 0.7)
          this.coats.baba.visible = u < 0.7
        }
        this.screens.set(11, u < 0.04 ? { key: 'news-0', draw: news(0.2) } : u < 0.62 ? { key: 'lock11', draw: lockScreen(11) } : OFF)
        this.lightPlan.pools = [11, 4, 9, 3]
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 0.8 }
        this.lightPlan.glowB = u >= 0.04 && u < 0.62 ? { n: 11, color: 0x5a7fae, k: 1.0 } : null
        break
      }
      case 'witness': {
        this.lifeSeated({ dede: false, emre: false, baba: false })
        this.cap.group.visible = true
        this.lighterIn = 'desk'
        this.chairAt(this.desk(3), EMRE_CHAIR.x, EMRE_CHAIR.z, PI - 0.15)
        this.chairAt(this.desk(11), BABA_CHAIR.x, BABA_CHAIR.z, PI - 2.6)
        this.chairAt(this.desk(9), DEDE_CHAIR.x, DEDE_CHAIR.z, PI + 0.3)
        // Only him, at his screen (she is not in this picture: her desk stands dark at the edge).
        this.cast.anneOld.visible = false
        this.coats.anne.visible = false
        if (this.cup) this.cup.visible = false
        this.screens.set(5, OFF)
        const s = this.sit(ben, 4, P.SIT_STILL)
        bump(s, 'head', -0.1 * ss(0.6, 0.9, u))
        // His lamp, and the two empty places in the foreground.
        this.lightPlan.pools = [4, 9, 11]
        this.lightPlan.bulbs = 'pools'
        this.lightPlan.fill = 0.3
        this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 1.2 }
        break
      }
    }
    if (seg !== 'witness') {
      // Departed: their chairs pushed back, their screens dark.
      if (f.p >= at('grandpa', 0.5)) this.chairAt(this.desk(9), DEDE_CHAIR.x, DEDE_CHAIR.z, PI + 0.3)
      if (f.p >= SEG.father.start) {
        this.screens.set(9, OFF)
        if (seg === 'father') this.screens.set(3, OFF)
      }
    }
  }

  private lighterIn: 'none' | 'emre' | 'desk' | 'ben' = 'none'
  private glassesIn: 'none' | 'hand' = 'none'
  private flamePos = new THREE.Vector3()

  // ——— 06 HİÇLİK ———

  private nothing(seg: SegmentId, u: number) {
    const ben = this.cast.benAdult
    this.kemalOld()
    this.handCoinAt = 'crack'
    this.cap.group.visible = true
    this.lighterIn = 'desk'
    this.chairAt(this.desk(11), BABA_CHAIR.x, BABA_CHAIR.z, PI - 2.6)
    this.chairAt(this.desk(9), DEDE_CHAIR.x, DEDE_CHAIR.z, PI + 0.3)
    this.screens.set(4, { key: 'road', draw: roadGame(3) })
    switch (seg) {
      case 'traces': {
        // He gets up, walks round to Emre's chair, rests his hand on its back; then turns it to him,
        // sits in it and swivels in to Emre's desk.
        this.chairAt(this.desk(3), EMRE_CHAIR.x, EMRE_CHAIR.z, PI - 0.15)
        const backTop = (yaw: number, out: THREE.Vector3) =>
          out.set(EMRE_CHAIR.x - Math.sin(yaw) * 0.27 - Math.cos(yaw) * 0.17, 1.075, EMRE_CHAIR.z - Math.cos(yaw) * 0.27 + Math.sin(yaw) * 0.17)
        if (u < 0.12) this.rise(ben, 4, u / 0.12, P.SIT_STILL, P.STAND)
        else this.chairLeft(4)
        if (u >= 0.12 && u < 0.46) {
          const [sx, sz] = this.standAt(4)
          const p = this.path('to3', [
            [sx, sz],
            [0.24, 0.64],
            [0.0, 1.12],
            [TRACE_SPOT.x, TRACE_SPOT.z],
          ])
          this.walkOn(ben, p, (u - 0.12) / 0.32, P.STAND, PI, -PI / 2 - 0.25)
          backTop(PI - 0.15, this.v2)
          ben.reach('r', win(0.4, 0.45, 0.5, 0.55, u), this.v2.x, this.v2.y, this.v2.z, 0.5)
        } else if (u >= 0.46 && u < 0.86) {
          this.on(ben).place(TRACE_SPOT.x, TRACE_SPOT.z, -PI / 2 - 0.25).hold(P.STAND)
          backTop(PI - 0.15, this.v2)
          ben.reach('r', 1 - ss(0.82, 0.86, u), this.v2.x, this.v2.y + 0.004 * Math.sin((u - 0.46) * 40), this.v2.z, 0.5)
          ben.lookAt(EMRE_CHAIR.x, EMRE_CHAIR.z, 0.7)
          bump(ben, 'head', 0.3)
        } else if (u >= 0.86) {
          // The seat turned toward him; he sits; the chair swivels in to the desk with him.
          const turnYaw = TRACE_SEAT_YAW
          const fx = Math.sin(turnYaw)
          const fz = Math.cos(turnYaw)
          const seat = { x: EMRE_CHAIR.x + fx * RISE_PUSH, z: EMRE_CHAIR.z + fz * RISE_PUSH }
          if (u < 0.95) {
            const swivel = ss(0.86, 0.89, u)
            this.chairAt(this.desk(3), EMRE_CHAIR.x, EMRE_CHAIR.z, lerp(PI - 0.15, turnYaw, swivel))
            const step = ss(0.86, 0.9, u)
            const stand = { x: seat.x + fx * RISE_STEP, z: seat.z + fz * RISE_STEP }
            if (u < 0.9) {
              this.on(ben)
                .place(lerp(TRACE_SPOT.x, stand.x, step), lerp(TRACE_SPOT.z, stand.z, step), lerp(-PI / 2 - 0.25, turnYaw, step))
                .hold(P.STAND)
            } else {
              // Sitting down: rise() backwards, about the turned seat.
              const k = 1 - ss(0.9, 0.95, u)
              const kk = ss(0.1, 0.9, k)
              this.on(ben)
                .place(seat.x + fx * lerp(-0.05, RISE_STEP, kk), seat.z + fz * lerp(-0.05, RISE_STEP, kk), turnYaw)
                .blend(
                  [
                    [0, P.SIT_STILL],
                    [0.55, P.SIT],
                    [1, P.STAND],
                  ],
                  k,
                )
              ben.y = seatY(1) * (1 - ss(0.3, 0.9, k))
              const pk = ss(0.2, 0.8, k)
              this.chairAt(this.desk(3), seat.x - fx * RISE_PUSH * pk, seat.z - fz * RISE_PUSH * pk, turnYaw)
            }
          } else {
            const t = ss(0.95, 1.0, u)
            const d3 = this.desk(3)
            this.sit(ben, 3, P.SIT_STILL, { dx: lerp(seat.x - d3.x, 0, t), dz: lerp(seat.z - d3.chairZ, 0, t), yaw: lerp(turnYaw - PI, 0, t) })
          }
        }
        this.screens.set(3, OFF)
        this.lightPlan.pools = [9, 11, 3, 4]
        this.lightPlan.bulbs = 'pools'
        this.lightPlan.fill = 0.6
        break
      }
      case 'scores':
      case 'illusion': {
        const s = this.sit(ben, 3, seg === 'scores' ? SIT_UP : P.SIT_STILL)
        if (seg === 'scores') {
          this.mouseHand(s, 3, win(0.0, 0.03, 0.12, 0.2, u))
          bump(s, 'head', 0.1)
        } else {
          // His hand still on Emre's mouse, his eyes on the list.
          this.mouseHand(s, 3, 1)
          bump(s, 'head', 0.06)
        }
        this.screens.set(3, seg === 'scores' && u < 0.05 ? OFF : { key: 'scores', draw: scoreboard() })
        this.screens.set(4, { key: 'road', draw: roadGame(3), level: 0.7 })
        this.lightPlan.pools = [9, 11, 3, 4]
        this.lightPlan.bulbs = 'pools'
        this.lightPlan.fill = seg === 'illusion' ? 0.5 : 0.6
        this.lightPlan.dim = seg === 'illusion' ? 1 - 0.5 * ss(0.6, 0.8, u) : 1
        this.lightPlan.glowB = {
          n: 3,
          color: 0xb0a0e0,
          k: seg === 'scores' && u < 0.05 ? 0 : 1.1,
        }
        break
      }
    }
  }

  // ——— 07 VEDA ———

  private farewell(seg: SegmentId, u: number, f: SetFrame) {
    const { benAdult: ben, anneOld: anne } = this.cast
    const turnFlag = f.flags.has('mom:turn')
    this.kemalOld()
    this.handCoinAt = 'crack'
    this.cap.group.visible = true
    this.lighterIn = 'desk'
    this.crowd([1, null, null, null, null, 12, null])
    this.chairAt(this.desk(3), EMRE_CHAIR.x, EMRE_CHAIR.z, PI - 0.15)
    this.chairAt(this.desk(11), BABA_CHAIR.x, BABA_CHAIR.z, PI - 2.6)
    this.chairAt(this.desk(9), DEDE_CHAIR.x, DEDE_CHAIR.z, PI + 0.3)
    this.coats.anne.visible = true
    if (this.cup) this.cup.visible = true
    this.lightPlan.pools = [4, 5, 9, 11]
    this.lightPlan.glowA = { n: 4, color: 0x9ab4d8, k: 0.7 }
    this.lightPlan.glowB = { n: 5, color: 0x8fb89a, k: 0.8 }
    this.screens.set(4, { key: 'desk', draw: desktop() })
    let level = 1
    switch (seg) {
      case 'mother': {
        // He rolls his chair over to her; she holds the knitting up against his chest to measure it.
        const come = win(0.38, 0.5, 0.84, 0.96, u)
        const s = this.sit(ben, 4, SIT_UP, { dx: MEASURE.dx * come, yaw: MEASURE.yaw * come })
        s.lookAt(2.25, 0.6, 0.35 + 0.45 * ss(0.4, 0.5, u))
        const hold = win(0.53, 0.59, 0.78, 0.84, u)
        const a = this.sit(anne, 5, KNIT, { dz: MEASURE.herDz * come, yaw: MEASURE.herYaw * come })
        a.lookAt(s.x, s.z, 0.6 * come)
        if (hold > 0) {
          a.blend(
            [
              [0, KNIT],
              [1, SIT_LEAN_IN],
            ],
            hold,
          )
          this.knitHands(a, 0.6, 1 - hold)
          // Her hands at his collarbones, the needles across his chest, the cloth down his front.
          this.touch(a, 'l', hold, ben, 'chest', -0.12, 0.262, 0.2, 0.45)
          this.touch(a, 'r', hold, ben, 'chest', 0.1, 0.262, 0.2, 0.45)
          this.knitAt = hold > 0.97 ? { shape: 'chest', len: 0.6, at: 'chest', who: ben } : { shape: 'hang', len: 0.6, at: 'hands', who: a }
          // He smiles, lets her.
          bump(s, 'head', 0.06 * hold - 0.05 * hold * (1 + Math.sin(this.time * 6)))
          s.lookAt(a.x, a.z, 0.5 * hold)
        } else this.knitHands(a, 0.6)
        break
      }
      case 'dims': {
        this.sit(ben, 4, SIT_UP)
        ben.lookAt(2.25, 0.4, 0.25)
        level = u < 0.05 ? 1 : u < 0.3 ? lerp(1, 0.06, ss(0.05, 0.1, u)) : u < 0.45 ? 1 : u < 0.69 ? lerp(1, 0.06, ss(0.45, 0.5, u)) : 1
        if (u < 0.6) {
          const a = this.sit(anne, 5, KNIT)
          this.knitHands(a, 0.62)
        } else {
          // She rolls in a little, leans over and taps twice on the side of the monitor.
          const t = win(0.6, 0.63, 0.72, 0.77, u)
          const a = this.sit(anne, 5, SIT_UP, { dz: -0.12 * t })
          const tap = Math.max(Math.sin(clamp((u - 0.63) / 0.03) * PI), Math.sin(clamp((u - 0.675) / 0.03) * PI))
          bump(a, 'spine', 0.2 * t)
          bump(a, 'chest', 0.06 * t)
          a.reach('r', t, 2.535 + 0.025 * tap, 1.0, -0.205, 0.55)
          a.reach('l', 1, a.x + 0.02, 0.66, a.z - 0.24, 0.3)
          this.knitInLap(a, 0.62)
          a.lookAt(2.4, -0.22, 0.6 * t)
          bump(a, 'head', 0, 0, 0.12 * ss(0.72, 0.8, u))
          a.lookAt(0.75, 0.6, 0.5 * ss(0.78, 0.86, u))
        }
        this.lightPlan.glowB = { n: 5, color: 0x8fb89a, k: 0.8 * level }
        break
      }
      case 'turn': {
        const s = this.sit(ben, 4, SIT_UP)
        const toScreen = win(0.25, 0.3, 0.42, 0.47, u)
        s.lookAt(lerp(2.25, 2.43, toScreen), lerp(0.5, -0.21, toScreen), 0.75)
        bump(s, 'head', 0.12 * toScreen)
        const a = this.sit(anne, 5, KNIT)
        this.knitHands(a, 0.64)
        a.lookAt(0.75, 0.6, 0.3 * (1 - ss(0.58, 0.64, u)))
        level = u < 0.6 ? 1 : lerp(1, 0.08, ss(0.6, 0.64, u))
        this.lightPlan.glowB = { n: 5, color: 0x8fb89a, k: 0.8 * level }
        break
      }
      case 'together': {
        if (turnFlag) {
          // He rolls over to her desk; a two-player game on her screen, a gamepad each.
          const sw = ss(0.0, 0.12, u)
          const s = this.sit(ben, 4, SIT_UP, { dx: PLAY.dx * sw, dz: PLAY.dz * sw, yaw: PLAY.yaw * sw })
          const a = this.sit(anne, 5, SIT_UP, { yaw: PLAY.herYaw * sw })
          this.knitAt = { shape: 'desk', len: 0.66, at: 'world', x: 2.62, y: 0.771, z: -0.13, yaw: PI / 2 }
          const pad = ss(0.06, 0.12, u)
          this.padsFor = pad > 0.5 ? [a, s] : []
          // He shows her the keys: his pad held out toward her.
          const show = win(0.14, 0.2, 0.36, 0.42, u)
          const laugh = win(0.42, 0.46, 0.6, 0.66, u)
          this.holdPad(a, pad, 0)
          this.holdPad(s, pad, show)
          if (laugh > 0) {
            this.mouth(a, laugh)
            bump(a, 'head', -0.14 * laugh)
            bump(a, 'chest', -0.04 * laugh * Math.sin(this.time * 12))
            bump(s, 'head', -0.07 * laugh * (1 + Math.sin(this.time * 9)))
          }
          a.lookAt(show > 0.3 ? s.x : 2.25, show > 0.3 ? s.z : -0.22, 0.6)
          s.lookAt(laugh > 0.3 ? a.x : 2.25, laugh > 0.3 ? a.z : -0.22, 0.6)
          bump(a, 'head', 0.2 * (1 - laugh))
          bump(s, 'head', 0.15)
          this.screens.set(5, { key: `duo-${Math.floor(this.time * 2)}`, draw: duo(Math.floor(this.time * 2)) })
        } else {
          // He keeps his eyes on her corner; she laughs beside him; he turns his chair to her anyway.
          const turned = ss(0.52, 0.62, u)
          const s = this.sit(ben, 4, SIT_UP, { yaw: -0.85 * turned, dx: 0.12 * turned })
          const a = this.sit(anne, 5, SIT_UP)
          s.lookAt(2.43, -0.21, (1 - ss(0.46, 0.52, u)) * 0.8)
          if (u > 0.46) s.lookAt(a.x, a.z, 0.8)
          const laugh = win(0.08, 0.12, 0.28, 0.4, u)
          this.mouth(a, laugh * 0.8)
          bump(a, 'head', -0.16 * laugh)
          bump(a, 'chest', -0.05 * laugh * Math.sin(this.time * 12))
          // Puzzled, then a smile.
          a.lookAt(s.x, s.z, 0.8 * ss(0.56, 0.66, u))
          bump(a, 'head', 0, 0, 0.1 * win(0.6, 0.66, 0.74, 0.8, u))
          if (u > 0.4) this.knitHands(a, 0.66, ss(0.42, 0.5, u))
          if (u <= 0.45) this.knitInLap(a, 0.66)
          level = 0.85 + 0.15 * Math.sin(this.time * 17) * Math.sin(this.time * 5)
        }
        break
      }
      case 'days': {
        // Days and nights over the two of them: she dozes, he talks to her, they play, she knits.
        const beat = Math.floor(u * 8)
        const kind = beat % 4
        const watch = !turnFlag
        const towardHer = watch ? (beat < 4 ? 0 : 0.6) : 1
        const len = 0.66 + u * 0.5
        const s = this.sit(ben, 4, kind === 1 ? SIT_LEAN_IN : SIT_UP, { yaw: -0.75 * towardHer, dx: 0.22 * towardHer })
        const a = this.sit(anne, 5, kind === 0 ? P.SIT_SLUMP : kind === 2 ? SIT_UP : KNIT)
        if (watch && beat < 5) s.lookAt(2.43, -0.21, beat < 3 ? 0.8 : 0.4)
        else s.lookAt(a.x, a.z, 0.7)
        if (kind === 2) {
          this.padsFor = [a, s]
          this.holdPad(a, 1, 0)
          this.holdPad(s, 1, 0)
          this.knitAt = { shape: 'desk', len, at: 'world', x: 2.62, y: 0.771, z: -0.13, yaw: PI / 2 }
        } else if (kind === 0) this.knitInLap(a, len)
        else this.knitHands(a, len)
        level = Math.sin(u * 50) > 0.2 + 0.5 * (1 - u) ? 0.08 : 1
        break
      }
      case 'instant': {
        this.instant(u)
        level = 1
        break
      }
    }
    if (seg !== 'instant') {
      if (seg !== 'together' || !turnFlag) this.screens.set(5, { key: 'sol', draw: solitaire(4), level })
    }
  }

  /** Who holds a gamepad this frame (in both hands; the pad sits between the grips). */
  private padsFor: Actor[] = []

  /** Both hands round a gamepad in front of the chest; `show` holds it out toward the person on his right. */
  private holdPad(a: Actor, w: number, show: number) {
    const sx = -0.18 * show
    this.touch(a, 'l', w, a, 'chest', sx + 0.07, -0.04 + 0.1 * show, 0.3 + 0.05 * show, 0.35)
    this.touch(a, 'r', w, a, 'chest', sx - 0.07, -0.04 + 0.1 * show, 0.3 + 0.05 * show, 0.35)
  }

  /** A hand to the mouth (a laugh). */
  private mouth(a: Actor, w: number) {
    this.touch(a, 'r', w, a, 'head', -0.01, 0.06, 0.13, 0.35)
  }

  /**
   * The shortest farewell: her screen locks; she reads it; she gets up, comes
   * to his side and wraps the unfinished scarf once round his neck, needles
   * and all, tucks the end; touches his hair; takes her coat from her chair
   * and goes out through the door behind him.
   */
  private instant(u: number) {
    const { benAdult: ben, anneOld: anne } = this.cast
    this.screens.set(5, u < 0.04 ? { key: 'sol', draw: solitaire(4) } : u < 0.62 ? { key: 'lock5', draw: lockScreen(5) } : OFF)
    this.lightPlan.glowB = u < 0.62 ? { n: 5, color: u < 0.04 ? 0x8fb89a : 0x5a7fae, k: 0.9 } : null
    // He stays at his desk; she comes to him.
    const s = this.sit(ben, 4, SIT_UP)
    s.lookAt(2.25, 0.6, 0.5 * win(0.12, 0.16, 0.22, 0.27, u))
    this.cast.scarf.visible = u >= WRAP_DONE
    const [rx, rz] = this.standAt(5)
    if (u < 0.15) {
      const a = this.sit(anne, 5, KNIT)
      this.knitHands(a, 0.95)
      a.lookAt(u < 0.13 ? 2.4 : 0.75, u < 0.13 ? -0.22 : 0.6, 0.8)
      bump(a, 'head', 0.1 * win(0.06, 0.08, 0.1, 0.12, u) * Math.sin((u - 0.06) * 140))
      this.coats.anne.visible = true
    } else if (u < 0.2) {
      // She gets up, the knitting gathered in her hands.
      const a = this.rise(anne, 5, (u - 0.15) / 0.05, KNIT, P.STAND)
      this.holdKnitting(a, 1)
      this.knitAt = { shape: 'hang', len: 0.95, at: 'hands', who: a }
      a.lookAt(0.75, 0.6, 0.7)
      this.coats.anne.visible = true
    } else if (u < 0.5) {
      // Round her chair to stand behind him; the scarf round his neck; the end tucked in; her hand in his hair.
      const p = this.path('anne-to-him', [
        [rx, rz],
        [1.8, 0.64],
        [1.45, 1.18],
        [WRAP_SPOT.x, WRAP_SPOT.z],
      ])
      const a = this.walkOn(anne, p, (u - 0.2) / 0.075, P.STAND, PI, WRAP_SPOT.yaw)
      this.chairLeft(5)
      // Behind him: she bends over his shoulders.
      const bend = ss(0.27, 0.3, u) * (1 - ss(0.46, 0.5, u))
      bump(a, 'spine', 0.2 * bend)
      bump(a, 'head', 0.3 * bend)
      const wrap = ss(0.27, WRAP_DONE, u)
      const at = win(0.265, 0.29, 0.43, 0.46, u)
      if (u < WRAP_DONE) {
        // Over his head and round: her hands at either side of his neck, coming round to the front.
        this.holdKnitting(a, 1 - at)
        this.touch(a, 'l', at, ben, 'chest', 0.1, 0.305 + 0.04 * Math.sin(wrap * PI), lerp(-0.03, 0.1, wrap), 0.5)
        this.touch(a, 'r', at, ben, 'chest', -0.1, 0.305 + 0.04 * Math.sin(wrap * PI), lerp(-0.03, 0.1, wrap), 0.5)
        this.knitAt = { shape: 'hang', len: 0.95, at: 'hands', who: a }
      } else {
        // Tucking the end at his collar; then her fingers in his hair.
        const hair = win(0.43, 0.45, 0.48, 0.5, u)
        this.touch(a, 'l', at * (1 - hair), ben, 'chest', 0.06, 0.28, 0.15, 0.4)
        this.touch(a, 'r', at, ben, 'chest', -0.02, 0.275, 0.16, 0.4)
        this.touch(a, 'l', hair, ben, 'head', 0.02, 0.2, -0.02, 0.6)
      }
      bump(s, 'head', 0.1 * at)
      this.coats.anne.visible = true
    } else {
      // To her chair for her coat, and out by the door behind him.
      this.chairLeft(5)
      const coat = ss(0.535, 0.56, u)
      this.cast.wearCoat('anneOld', coat > 0.5)
      this.coats.anne.visible = coat <= 0.5
      if (u < 0.53) {
        const p = this.path('anne-to-coat', [
          [WRAP_SPOT.x, WRAP_SPOT.z],
          [1.8, 1.35],
          [COAT_SPOT.x, COAT_SPOT.z],
        ])
        this.walkOn(anne, p, (u - 0.5) / 0.03, P.STAND, WRAP_SPOT.yaw, PI)
      } else if (u < 0.575) {
        const a = this.on(anne)
          .place(COAT_SPOT.x, COAT_SPOT.z, PI)
          .blend(
            [
              [0.53, P.STAND],
              [0.55, COAT_ON],
              [0.575, P.STAND],
            ],
            u,
          )
        // Her hand on the coat over the chair back, then into the sleeves.
        a.reach('r', win(0.525, 0.53, 0.535, 0.545, u), COAT_SPOT.x + 0.05, 1.05, COAT_SPOT.z - 0.3, 0.5)
      } else {
        const p = this.path('anne-out', [
          [COAT_SPOT.x, COAT_SPOT.z],
          [2.9, 2.6],
          [3.35, 4.0],
          [3.47, 4.75],
          [3.5, 6.0],
        ])
        this.walkOn(anne, p, (u - 0.575) / 0.105, P.STAND, PI, 0)
      }
      // His hand to the scarf when the cold comes in: it closes round the hanging end.
      const cold = win(0.62, 0.66, 0.85, 0.92, u)
      this.touch(s, 'r', cold, s, 'chest', 0.04, 0.17, 0.2, 0.3)
      s.lookAt(1.2, 1.5, 0.3 * (1 - ss(0.7, 0.8, u)))
    }
    if (u < 0.5) this.cast.wearCoat('anneOld', false)
    if (u >= 0.62) {
      this.screens.set(5, OFF)
      this.lightPlan.glowB = null
    }
  }

  /** Hands holding the gathered knitting in front of her (standing). */
  private holdKnitting(a: Actor, w: number) {
    this.touch(a, 'l', w, a, 'chest', 0.09, 0.02, 0.3, 0.35)
    this.touch(a, 'r', w, a, 'chest', -0.09, 0.02, 0.3, 0.35)
  }

  // ——— 08 İNADINA ———

  private defiance(seg: SegmentId, u: number, f: SetFrame) {
    const { benAdult: ben, benKid: boy } = this.cast
    const watch = f.flags.has('mom:watch')
    this.handCoinAt = 'crack'
    this.cast.scarf.visible = true
    this.cap.group.visible = false
    this.crowd([1, 2, 5, 7, 8, 9, 10, 11, 13])
    const { coupleM, coupleF } = this.cast
    this.sit(coupleM, 6, P.SIT_TYPE)
    this.type(coupleM, 6, 1, 0.5)
    this.sit(coupleF, 12, P.SIT_READ)
    this.mouseHand(coupleF, 12)
    this.carriageAt(4.42, 0.95, PI)
    this.screens.set(6, { key: 'str6', draw: strangerScreen(5) })
    this.screens.set(12, { crowd: 2 })
    for (const n of [5, 9, 11]) this.screens.set(n, { key: `str${n}`, draw: strangerScreen(n) })
    const kem = this.kemalOld(STAND_OLD, boy.x, boy.z)
    this.lightPlan.pools = [3, 4, 9, 11]
    this.lightPlan.counter = true
    this.lightPlan.glowA = { n: 4, color: 0xb0c4e0, k: 0.6 }
    const boySecs = boySeconds(f.p)
    switch (seg) {
      case 'spring': {
        const s = this.sit(ben, 4, P.SIT_TYPE)
        this.type(ben, 4, 1 - win(0.08, 0.12, 0.3, 0.36, u))
        // The cold at his neck: his hand goes to the scarf, not the bare nape.
        const cold = win(0.08, 0.13, 0.3, 0.36, u)
        this.touch(s, 'r', cold, s, 'chest', 0.04, 0.17, 0.2, 0.3)
        this.cast.bag.visible = true
        if (u < 0.38) this.walkOn(boy, P_RUN_IN, (u - 0.06) / 0.32, RUN, PI, 0.1, 1.25)
        else {
          const b = this.on(boy).place(KID_AT_COUNTER.x, KID_AT_COUNTER.z, 0.1).hold(P.STAND)
          b.reach('r', win(0.38, 0.4, 0.44, 0.48, u), KID_AT_COUNTER.x - 0.12, 1.13, 3.7, 0.5)
          b.lookAt(KEMAL.x, KEMAL.z, 0.8)
          bump(b, 'head', -0.18)
        }
        this.counterCoins(this.boyCoins, u, 0.41, 0.6, 0.75, -3.0, 3.86, 0.1)
        if (u > 0.55) {
          kem.place(-3.85, KEMAL.z, PI)
          const keys = win(0.6, 0.64, 0.8, 0.85, u)
          kem.reach('l', keys, -4.04, 1.1 + 0.006 * Math.max(0, Math.sin(this.time * 14)), 4.16, 0.4)
          kem.reach('r', keys, -3.93, 1.1 + 0.006 * Math.max(0, Math.sin(this.time * 14 + 2)), 4.08, 0.4)
        } else this.lean(kem, ss(0.4, 0.45, u))
        this.screens.set(4, { key: 'desk', draw: desktop() })
        this.screens.set(3, OFF)
        break
      }
      case 'newboy': {
        const s = this.sit(ben, 4, P.SIT_TYPE)
        this.type(ben, 4, 1 - ss(0.45, 0.5, u))
        this.cast.bag.visible = true
        if (u < 0.22) {
          const p = this.path('boy-to-3', [
            [KID_AT_COUNTER.x, KID_AT_COUNTER.z],
            [-1.6, 2.2],
            [-0.75, 1.15],
          ])
          this.walkOn(boy, p, u / 0.22, RUN, 0, PI, 1.2)
        } else {
          const drop = ss(0.22, 0.27, u)
          const b = this.sit(boy, 3, u < 0.45 ? SIT_UP : u < 0.52 ? HANDS_UP : P.SIT_TYPE, { dz: 0.35 * (1 - drop) })
          b.y = seatY(HEIGHT.benKid) * drop
          if (u < 0.27)
            b.blend(
              [
                [0.22, P.STAND],
                [0.27, SIT_UP],
              ],
              u,
            )
          // Rubbing his hands.
          const rub = win(0.44, 0.46, 0.49, 0.51, u)
          if (rub > 0) {
            b.reach('l', rub, -0.72 + 0.02 * Math.sin(this.time * 25), 0.95, 0.32, 0.3)
            b.reach('r', rub, -0.78 - 0.02 * Math.sin(this.time * 25), 0.95, 0.32, 0.3)
          }
          if (u >= 0.52) {
            this.type(b, 3)
            bump(b, 'spine', 0.08)
          }
        }
        s.lookAt(-0.75, 0.6, 0.6 * ss(0.4, 0.55, u))
        const sc: ScreenState =
          u < 0.25
            ? OFF
            : u < 0.5
              ? { key: `boym-${boySecs}`, draw: boyGame(boySecs, 3, 0.35) }
              : {
                  key: `boyg-${boySecs}-${Math.floor(this.time * 3)}`,
                  draw: boyGame(boySecs, 10 + Math.floor(this.time * 3), clamp(1 - (u - 0.5) / 0.06)),
                }
        this.screens.set(3, sc)
        this.screens.set(4, { key: 'desk', draw: desktop() })
        this.lightPlan.glowB = u >= 0.25 ? { n: 3, color: 0xa8e0ff, k: 0.9 } : null
        break
      }
      case 'defiance':
      case 'final': {
        const together = seg === 'final' ? 1 : ss(0.36, 0.46, u)
        const glance = seg === 'defiance' ? win(0.04, 0.08, watch ? 0.2 : 0.14, watch ? 0.24 : 0.18, u) : 0
        const s = this.sit(ben, 4, P.SIT_TYPE, {
          yaw: 0.35 * together,
          dx: -0.22 * together,
        })
        s.lookAt(0.92, -0.22, glance * 0.5)
        bump(s, 'head', 0.1 * glance)
        this.type(s, 4, 1 - glance)
        this.cast.bag.visible = true
        const b = this.sit(boy, 3, P.SIT_TYPE, {
          yaw: -0.5 * together,
          dx: 0.36 * together,
        })
        if (together > 0.5) {
          this.type(b, 3, 0.7)
          b.lookAt(0.6, -0.2, 0.5)
          s.lookAt(-0.4, 0.4, 0.3)
          const laugh = win(0.5, 0.56, 0.68, 0.74, u)
          bump(b, 'head', -0.06 * laugh * (1 + Math.sin(this.time * 11)))
          bump(s, 'head', -0.05 * laugh * (1 + Math.sin(this.time * 9)))
        } else this.type(b, 3)
        this.screens.set(3, {
          key: `boyg-${boySecs}-${Math.floor(this.time * 3)}`,
          draw: boyGame(boySecs, 10 + Math.floor(this.time * 3)),
        })
        const open = seg === 'final' || u >= 0.25
        this.screens.set(4, open ? { key: 'road', draw: roadGame(3) } : { key: 'desk', draw: desktop() })
        this.lightPlan.glowB = { n: 3, color: 0xa8e0ff, k: 0.8 }
        break
      }
    }
  }

  // ——— After the bodies are posed: things in hands ———

  private afterApply(seg: SegmentId, u: number, f: SetFrame) {
    const { benKid, benAdult, emreAdult, anneOld, baba } = this.cast
    // The coin.
    const c = this.handCoin
    if (seg === 'pocket' && u > 0.3 && u < 0.76) {
      c.visible = true
      benKid.figure.rGrip.getWorldPosition(this.v)
      c.position.set(this.v.x - 0.005, this.v.y + 0.012, this.v.z + 0.01)
      c.rotation.set(0.2, 0, 0)
    } else if (seg === 'dusk') {
      if (this.handCoinAt === 'counter') {
        c.visible = true
        c.position.set(-2.99, 1.067, 3.82)
        c.rotation.set(0, 0, 0)
      } else if (this.handCoinAt === 'lhand') {
        c.visible = true
        benKid.figure.lGrip.getWorldPosition(this.v)
        const k = ss(0.01, 0.06, u)
        c.position.lerpVectors(this.v, COIN_CRACK, k)
        c.rotation.set(-1.1 * k, 0.3, 0)
      }
    }
    if (this.handCoinAt === 'crack' && f.p >= at('dusk', 0.06)) {
      const crack = this.cafe.coin
      crack.visible = true
      crack.position.copy(COIN_CRACK)
      crack.position.y -= 0.004
      crack.rotation.set(-1.15, 0.3, 0)
    }
    // The wallet.
    const w = this.wallet
    if (this.walletIn === 'hand') {
      w.visible = true
      const a = seg === 'look' ? benAdult : benAdult
      a.figure.rGrip.getWorldPosition(this.v)
      w.position.copy(this.v)
      w.position.y -= 0.03
      w.rotation.set(PI / 2, a.yaw, 0)
    } else if (this.walletIn === 'counter') {
      w.visible = true
      w.position.set(lerp(-2.92, -2.86, this.walletSlide), 1.067, lerp(3.84, 3.71, this.walletSlide))
      w.rotation.set(0, 0.3, 0)
      w.scale.set(this.walletOpen ? 2 : 1, 1, 1)
    }
    this.walletIn = 'none'
    this.walletOpen = false
    this.walletSlide = 0
    // The lighter.
    const L = this.lighter
    if (this.lighterIn !== 'none') {
      L.group.visible = true
      if (this.lighterIn === 'desk') {
        L.group.position.set(-0.5, 0.765, -0.05)
        L.group.rotation.set(0, 0.4, 0)
        L.lid.rotation.z = 0
      } else {
        const a = this.lighterIn === 'emre' ? emreAdult : benAdult
        const grip = this.lighterIn === 'emre' ? a.figure.rGrip : a.figure.lGrip
        grip.getWorldPosition(this.v)
        L.group.position.set(this.v.x, this.v.y - 0.02, this.v.z)
        L.group.rotation.set(0, a.yaw + PI / 2, 0)
        const click = this.lighterIn === 'emre' ? Math.max(0, Math.sin(this.time * 2.2)) : seg === 'lighter' ? win(0.58, 0.6, 0.86, 0.88, u) : 0
        L.lid.rotation.z = -2.2 * (click > 0.5 ? 1 : click * 2)
        L.flame.visible = seg === 'lighter' && u >= 0.6 && u < 0.88
        L.flame.scale.set(1, 0.85 + 0.25 * Math.sin(this.time * 23) * Math.sin(this.time * 7), 1)
        L.flame.getWorldPosition(this.flamePos)
      }
    }
    this.lighterIn = 'none'
    // Baba's glasses in his hand.
    if (this.glassesIn === 'hand') {
      const g = this.glasses
      g.visible = true
      baba.figure.rGrip.getWorldPosition(this.v)
      g.position.copy(this.v)
      g.rotation.set(0, baba.yaw, 0)
      const fold = ss(at('father', 0.25), at('father', 0.32), f.p)
      g.scale.set(1 - 0.6 * fold, 1, 1 - 0.85 * fold)
    }
    this.glassesIn = 'none'
    // The knitting.
    const K = this.knitAt
    if (K) {
      const kn = this.knit
      const g = kn.group
      kn.group.visible = true
      kn.set(K.shape, K.shape === 'desk' ? Math.min(K.len, 0.5) : K.len)
      if (K.at === 'hands') {
        const a = K.who ?? anneOld
        a.figure.lGrip.getWorldPosition(this.v)
        a.figure.rGrip.getWorldPosition(this.v2)
        g.position.copy(this.v).add(this.v2).multiplyScalar(0.5)
        // The needles run across her hands; the cloth falls away from her.
        g.rotation.set(0, a.yaw, 0)
      } else if (K.at === 'chest' && K.who) {
        const chest = K.who.figure.joints.chest
        chest.localToWorld(g.position.set(0, 0.268, 0.175))
        chest.getWorldQuaternion(this.q)
        g.quaternion.copy(this.q)
      } else {
        g.position.set(K.x ?? 0, K.y ?? 0, K.z ?? 0)
        g.rotation.set(0, K.yaw ?? 0, 0)
      }
    }
    this.knitAt = null
    // Gamepads in their hands.
    this.padsFor.forEach((a, i) => {
      const pad = this.pads[i]
      if (!pad) return
      pad.visible = true
      a.figure.lGrip.getWorldPosition(this.v)
      a.figure.rGrip.getWorldPosition(this.v2)
      // Between the hands; in the left hand alone when the right is busy (a laugh).
      if (this.v.distanceTo(this.v2) < 0.24) pad.position.copy(this.v).add(this.v2).multiplyScalar(0.5)
      else pad.position.copy(this.v)
      pad.position.y -= 0.015
      pad.rotation.set(-0.5, a.yaw + PI, 0, 'YXZ')
    })
    this.padsFor = []
    // The register drawer.
    if (this.cafe.drawer) this.cafe.drawer.position.z = this.cafe.drawerZ + 0.32 * this.drawerOpen
    this.drawerOpen = 0
    this.handCoinAt = 'none'
  }

  // ——— Screens ———

  private drawScreens(p: number, seg: SegmentId, u: number) {
    const era = this.era
    for (const d of this.desks) {
      const st = this.screens.get(d.n) ?? OFF
      const s = d.screen
      if ('off' in st) {
        s.material = this.cafe.m.screenOff
        continue
      }
      if ('crowd' in st) {
        const list = this.cafe.crowdMats[era]
        s.material = list[st.crowd % list.length]
        continue
      }
      if (!d.surface) {
        s.material = this.cafe.crowdMats[era][d.n % this.cafe.crowdMats[era].length]
        continue
      }
      d.surface.show(era, st.key, st.draw)
      d.surface.material.color.setScalar(st.level ?? 1)
      s.material = d.surface.material
    }
    // The cashier's monitor.
    const kidHot = this.adminHighlight && seg === 'coins'
    this.cafe.admin.kid.redraw(adminScreen('kid', kidHot), kidHot ? 'hot' : 'cold')
    this.adminHighlight = false
    void p
    void u
  }

  // ——— The door and its bell ———

  private door(seg: SegmentId, u: number, f: SetFrame) {
    // Opening angle 0…1 (inward), as a function of the scene.
    let open = 0
    const swing = (a: number, b: number, c: number, d: number, peak = 1) => (open = Math.max(open, peak * win(a, b, c, d, u)))
    switch (seg) {
      case 'neck':
        swing(0.42, 0.47, 0.78, 0.92, 0.85)
        break
      case 'recess':
        swing(0.03, 0.07, 0.24, 0.36, 1)
        break
      case 'dusk':
        if (f.flags.has('kid:more')) swing(0.27, 0.32, 0.66, 0.74, 0.85)
        else swing(0.29, 0.34, 0.66, 0.74, 0.9)
        break
      case 'bell':
        swing(0.06, 0.12, 0.45, 0.75, 1)
        break
      case 'grandpa':
        swing(0.9, 0.93, 0.98, 1.0, 0.8)
        break
      case 'friend':
        swing(0.95, 0.97, 1.0, 1.01, 0.7)
        break
      case 'lighter':
        if (u < 0.08) open = 0.7 * (1 - ss(0, 0.08, u))
        break
      case 'father':
        swing(0.88, 0.92, 0.96, 1.0, 0.8)
        break
      case 'instant':
        swing(0.6, 0.63, 0.67, 0.72, 0.85)
        break
      case 'spring':
        swing(0.04, 0.07, 0.14, 0.22, 1)
        break
    }
    this.cafe.doorLeaf.rotation.y = -1.45 * open
    this.doorOpen = open
    // The bell rings with the door's motion (and settles with time).
    const dv = Math.abs(open - this.lastDoor)
    this.lastDoor = open
    this.bellEnergy = Math.min(1, this.bellEnergy * Math.exp(-f.dt * 2.2) + (dv < 0.3 ? dv * 6 : 0))
    const b = this.cafe.bell
    b.rotation.x = 0.35 * this.bellEnergy * Math.sin(f.time * 17)
    b.rotation.z = 0.2 * this.bellEnergy * Math.sin(f.time * 13 + 1)
  }

  // ——— Light, weather, the window, the clock ———

  private world(f: SetFrame) {
    const e = this.env
    const c = this.cafe
    const L = c.lights
    const nefes = f.p < SEG.recess.start
    // The sky.
    const top = new THREE.Color().setHSL(0.6 - 0.04 * e.warm, 0.45, 0.06 + 0.5 * e.day)
    const hor = new THREE.Color().setHSL(lerp(0.58, 0.07, e.warm), lerp(0.25, 0.7, e.warm * e.day), 0.05 + 0.55 * e.day)
    if (e.season === 'winter' && e.day > 0.3) {
      top.setHSL(0.58, 0.08, 0.55 * e.day)
      hor.setHSL(0.58, 0.05, 0.65 * e.day)
    }
    c.sky.material.uniforms.top.value.copy(top)
    c.sky.material.uniforms.horizon.value.copy(hor)
    c.sky.material.uniforms.bottom.value.copy(hor).multiplyScalar(0.3)
    // The window light: the sun by day (warm and low at dusk), the street lamp by night.
    const sunElev = lerp(0.62, 0.22, e.warm)
    const sunDir = new THREE.Vector3(Math.sin(-0.35), Math.tan(sunElev), -1).normalize()
    L.sun.position.copy(sunDir).multiplyScalar(18)
    L.sun.target.position.set(0, 0, 0)
    const grey = e.season === 'winter' ? 0.35 : 1
    const sunK = Math.max(0, e.day - 0.08) * grey
    L.sun.color.setHSL(lerp(0.12, 0.07, e.warm), lerp(0.25, 0.85, e.warm), 0.6 + 0.15 * (1 - e.warm))
    let sunI = sunK * lerp(2.6, 3.4, e.warm)
    if (e.day < 0.12 && e.lamps > 0) {
      // Night: sodium light from the lamp across the street through the window.
      L.sun.position.set(2.6 - 0.9, 5.2, -9.4 - 4)
      L.sun.color.setHex(0xff9a40)
      sunI = 0.35
    }
    L.sun.intensity = sunI
    L.sun.shadow.autoUpdate = sunI > 0.01
    // Sky fill and image-based light.
    L.hemi.color.copy(hor).lerp(new THREE.Color(0xffffff), 0.3)
    L.hemi.groundColor.setHex(0x2a2018)
    const interior = this.era === 'kid' ? 1 : 0
    const night = 1 - clamp(e.day)
    L.hemi.intensity = nefes ? 0.03 : 0.08 + 0.55 * e.day + (interior ? 0.05 : 0.04) + 0.16 * this.lightPlan.fill * night
    this.scene.environmentIntensity = nefes ? 0.03 : 0.06 + 0.32 * e.day + 0.08 * this.lightPlan.fill * night
    // Interior lamps: the child's fluorescent panels, the man's tungsten pendants.
    const plan = this.lightPlan
    const lampsOn = nefes ? 0 : this.era === 'kid' ? 0 : 1
    c.panelFace.color.setScalar(this.era === 'kid' ? lerp(1.6, 0.9, e.day) : 0)
    for (let i = 0; i < c.pendants.length; i++) {
      const pd = c.pendants[i]
      const lit = lampsOn && (plan.bulbs === 'all' || (plan.bulbs === 'pools' && plan.pools.includes(i + 1)))
      pd.bulb.material = lit ? c.m.bulb : c.m.screenOff
    }
    c.m.bulb.color.setRGB(1, 0.84, 0.6).multiplyScalar(2.2 * plan.dim)
    const pools = [...plan.pools]
    L.pools.forEach((s, i) => {
      let n = pools[i]
      if (this.era === 'kid' && !nefes) {
        // Child era: the panels light the room a little (two cool fills over the rows).
        const at2 = [
          [-1.5, 2.95, -0.6],
          [1.5, 2.95, -0.6],
          [0, 2.95, 2.6],
          [-3.5, 2.95, 3.6],
        ][i]
        s.position.set(at2[0], at2[1], at2[2])
        s.target.position.set(at2[0], 0, at2[2])
        s.color.setHex(0xe8f0ff)
        s.angle = 1.0
        s.penumbra = 1
        s.distance = 8
        s.intensity = lerp(6, 2.5, e.day)
        return
      }
      if (i === 3 && plan.counter) n = -1
      if (n === undefined || !lampsOn) {
        s.intensity = 0
        return
      }
      if (n === -1) {
        s.position.set(-3.5, 2.6, 4.1)
        s.target.position.set(-3.3, 1.0, 4.0)
      } else {
        const pd = c.pendants[n - 1]
        s.position.copy(pd.pos)
        s.target.position.set(pd.pos.x, 0.0, pd.pos.z + 0.3)
      }
      s.color.setHex(0xffc887)
      s.angle = 0.75
      s.penumbra = 0.75
      s.distance = 7
      s.intensity = 9 * plan.dim * (1 - 0.35 * e.day)
    })
    // Screen glow on faces.
    const glow = (light: THREE.PointLight, g: { n?: number; at?: THREE.Vector3; color: number; k: number } | null) => {
      if (!g || g.k <= 0) {
        light.intensity = 0
        return
      }
      if (g.at) light.position.copy(g.at)
      else if (g.n) {
        const d = this.desk(g.n)
        light.position.set(d.x, 1.05, (d.row === 1 ? -0.22 : -2.42) + 0.22)
      }
      light.color.setHex(g.color)
      light.intensity = g.k * (nefes ? 1.6 : 1) * (1 - 0.5 * e.day)
      light.distance = g.at ? 1.6 : 2.2
    }
    glow(L.glowA, plan.glowA)
    glow(L.glowB, plan.glowB)
    // Door: the street comes in (sodium at night, grey or gold by day).
    const doorOpen = this.doorOpen
    L.door.color.setHex(e.day < 0.3 ? 0xffa64d : e.season === 'winter' ? 0xdfe8f0 : 0xffe2b0)
    L.door.intensity = doorOpen * (e.day < 0.3 ? 14 : 6)
    const wedge = c.wedge
    const wm = wedge.material as THREE.MeshBasicMaterial
    wm.opacity = doorOpen * (e.day < 0.3 ? 0.55 : 0.18)
    wm.color.setHex(e.day < 0.3 ? 0xffb066 : 0xfff0d8)
    wedge.visible = doorOpen > 0.01
    wedge.position.set(DOOR.x - 0.35, 0.004, DOOR.z - 2.15)
    wedge.rotation.z = 0.35
    wedge.scale.set(0.6 + 0.6 * doorOpen, 1, 1)
    // Outside: lit windows across the street, street lamps, the tree, snow, leaves, dust in the sun.
    for (const m of c.litWindows) m.color.setScalar(lerp(1.0, 0.18, e.day))
    c.m.lampGlow.color.setRGB(1, 0.76, 0.48).multiplyScalar(e.lamps ? 2.2 : 0.25)
    for (const g of c.streetGlow) g.visible = e.lamps > 0.5 && e.day < 0.4
    const tree = c.tree
    tree.leaves.visible = e.leaf > 0.02
    tree.leaves.count = Math.round(tree.leaves.instanceMatrix.count * clamp(e.leaf))
    const leafCol = e.season === 'autumn' ? 0xc0662a : e.season === 'summer' ? 0x3f6a2c : e.season === 'spring' ? (e.leaf < 0.5 ? 0x9cc46a : 0x7fb04e) : 0x8a7a4a
    tree.leafMat.color.setHex(leafCol)
    for (const s of c.snowGround) {
      ;(s.material as THREE.MeshStandardMaterial).opacity = e.ground
      s.visible = e.ground > 0.02
    }
    c.snowFall.visible = e.snow > 0.02
    ;(c.snowFall.material as THREE.PointsMaterial).opacity = 0.85 * e.snow
    c.snowFall.position.y = -((f.time * 0.55) % 8)
    c.snowFall.position.x = Math.sin(f.time * 0.3) * 0.4
    c.doorSnow.visible = e.snow > 0.3 && this.doorOpen > 0.05
    c.doorSnow.position.set(-0.4 * this.doorOpen, -((f.time * 0.9) % 3), -((f.time * 1.6) % 3) * this.doorOpen)
    c.leavesFall.visible = e.wind > 0.05
    c.leavesFall.position.set(((f.time * 1.6) % 22) - 11, -((f.time * 0.35) % 6) + 1, 0)
    c.dust.visible = e.day > 0.6 && L.sun.intensity > 1
    c.dust.position.set(Math.sin(f.time * 0.05) * 0.3, Math.sin(f.time * 0.07) * 0.1, 0)
    // The clock (it never stops) and the fans.
    const hrs = clockHours(f.p) + (f.reduced ? 0 : (f.time % 3600) / 3600)
    const ch = c.clockHands
    if (ch) {
      const hourA = ((hrs % 12) / 12) * PI * 2
      const minA = (((hrs * 60) % 60) / 60) * PI * 2
      const secA = ((Math.floor(f.time) % 60) / 60) * PI * 2
      ch.hour.rotation.z = -(hourA - ch.a0[0])
      ch.minute.rotation.z = -(minA - ch.a0[1])
      ch.second.rotation.z = -(secA - ch.a0[2])
    }
    for (const r of c.fans) r.rotation.y = f.time * 4.5
  }

  // ——— Camera ———

  private corner(n: number): V7 {
    // From the right of the screen, never between a face and its monitor.
    const c = cornerOf(this.desk(n), this.era, this.v)
    return [c.x + 0.25, c.y + 0.16, c.z + 0.36, c.x - 0.01, c.y, c.z, 21]
  }

  private keys(seg: SegmentId, u: number, f: SetFrame): Keys {
    const more = f.flags.has('kid:more')
    const turn = f.flags.has('mom:turn')
    const ben = this.cast.benAdult
    switch (seg) {
      case 'open':
        // His back and the lit nape in the right of the frame; the words hold the centre.
        return [
          [0, [1.2, 1.42, 1.62, 0.42, 1.1, -0.4, 34]],
          [1, [1.13, 1.4, 1.42, 0.45, 1.1, -0.4, 33]],
        ]
      case 'neck':
        return [
          [0, [1.13, 1.4, 1.42, 0.45, 1.1, -0.4, 33]],
          [0.44, [0.95, 1.33, 1.15, 0.75, 1.25, 0.55, 28]],
          [0.46, [-0.6, 1.5, -0.6, 2.2, 1.2, 3.8, 46]],
          [1, [-0.45, 1.48, -0.5, 2.2, 1.15, 3.8, 44]],
        ]
      case 'recess':
        return [
          [0, [-0.8, 1.35, 1.6, 3.5, 1.0, 4.8, 46]],
          [1, [-0.8, 1.35, 1.6, -2.3, 1.0, 3.8, 46]],
        ]
      case 'coins':
        return [
          [0, [-1.7, 1.3, 2.4, -3.3, 1.25, 4.2, 40]],
          [0.42, [-1.75, 1.3, 2.35, -3.3, 1.25, 4.2, 39]],
          [0.42, [-3.35, 1.32, 3.3, -3.0, 1.07, 3.88, 26]],
          [0.55, [-3.3, 1.28, 3.35, -2.95, 1.07, 3.92, 26]],
          [0.55, [-3.2, 1.35, 3.4, -4.3, 1.3, 4.0, 30]],
          [0.72, [-3.25, 1.33, 3.45, -4.3, 1.3, 4.0, 28]],
          [0.72, [-1.7, 1.3, 2.4, -3.0, 1.15, 4.0, 40]],
          [1, [-1.6, 1.3, 2.3, -2.6, 1.05, 3.2, 42]],
        ]
      case 'play':
        return [
          [0, this.corner(4)],
          [0.15, this.corner(4)],
          [0.15, PAIR34],
          [0.85, [0, 1.19, -0.9, 0, 1.04, 0.6, 44]],
          [0.85, BACK4],
          [1, [1.15, 1.42, 1.4, 0.75, 1.0, -0.22, 32]],
        ]
      case 'zero':
        // The corner hits 00:00; both screens lock (from behind, over them); their faces; flopped back.
        return [
          [0, this.corner(4)],
          [0.22, this.corner(4)],
          [0.22, [1.55, 1.42, 1.85, -0.05, 0.94, -0.2, 42]],
          [0.42, [1.5, 1.4, 1.75, -0.05, 0.94, -0.2, 41]],
          [0.42, PAIR34],
          [0.62, [0, 1.19, -0.95, 0, 1.04, 0.6, 45]],
          [0.62, [-1.7, 1.35, 1.7, 0.0, 0.95, -0.15, 44]],
          [1, [-1.6, 1.33, 1.6, 0.0, 0.95, -0.15, 42]],
        ]
      case 'pocket':
        // Over his right shoulder: the hand in the pocket, the open palm, the locked screen beyond.
        return [
          [0, [1.17, 0.97, 0.8, 0.84, 0.66, 0.42, 32]],
          [0.4, [1.15, 0.97, 0.76, 0.85, 0.8, 0.36, 30]],
          [1, [1.14, 0.97, 0.74, 0.85, 0.8, 0.36, 29]],
        ]
      case 'dusk': {
        const toDoor: V7 = [0.4, 1.15, 0.1, 3.5, 1.4, 4.9, 42]
        const close: V7 = [2.6, 1.3, 2.6, 3.5, 1.45, 5.0, 34]
        const back: V7 = [2.4, 1.35, 2.5, 0.75, 0.75, 0.55, 40]
        const tail: Keys = [
          [0.3, toDoor],
          [0.36, [0.45, 1.16, 0.15, 3.5, 1.4, 4.9, 41]],
          [0.36, close],
          [0.68, [2.5, 1.3, 2.5, 3.5, 1.45, 5.0, 33]],
          [0.68, back],
          [1, [2.2, 1.33, 2.3, 0.75, 0.75, 0.55, 38]],
        ]
        if (more) return [[0, [-2.4, 1.28, 3.0, -3.0, 1.07, 3.86, 30]], [0.07, [-2.45, 1.27, 3.05, -3.0, 1.07, 3.86, 29]], [0.07, BACK4], [0.3, [1.15, 1.42, 1.4, 0.75, 1.0, -0.22, 32]], ...tail]
        return [[0, [0.55, 1.05, 0.66, 0.42, 0.77, 0.21, 28]], [0.12, [0.53, 1.03, 0.62, 0.42, 0.77, 0.21, 26]], [0.12, [-0.3, 1.4, 0.9, 0.9, 1.0, 1.4, 44]], [0.3, [-0.3, 1.4, 0.9, 3.2, 1.1, 4.3, 44]], ...tail]
      }
      case 'years':
        if (f.flags.has('kid:home'))
          return [
            [0, [0.75, 1.5, 2.6, 0.75, 1.1, -5.0, 50]],
            [0.68, [0.75, 1.48, 2.5, 0.75, 1.1, -5.0, 50]],
            // The coin in the crack beside his left forearm, from the left of his desk.
            [0.68, [0.02, 1.04, 0.56, 0.42, 0.775, 0.19, 30]],
            [1, [0.08, 1.0, 0.5, 0.42, 0.775, 0.19, 27]],
          ]
        return [
          [0, [0.75, 1.5, 2.6, 0.75, 1.1, -5.0, 50]],
          [1, [0.75, 1.47, 2.45, 0.75, 1.1, -5.0, 50]],
        ]
      case 'soul':
        return [
          [0, BACK4],
          [1, [1.05, 1.4, 1.15, 0.75, 1.0, -0.22, 30]],
        ]
      case 'dash':
        return [
          [0, this.corner(4)],
          [0.48, this.corner(4)],
          [0.48, FRONT4],
          [1, [1.0, 1.43, -0.95, 0.75, 1.22, 0.6, 36]],
        ]
      case 'wallet':
        return [
          [0, [1.75, 1.72, 2.75, ben.x, 1.42, ben.z, 46]],
          [1, [1.5, 1.72, 2.85, ben.x, 1.42, ben.z, 44]],
        ]
      case 'counter':
        return [
          [0, [-1.5, 1.6, 2.2, -3.4, 1.25, 4.1, 38]],
          [0.47, [-1.55, 1.6, 2.25, -3.4, 1.25, 4.1, 37]],
          [0.47, [-3.4, 1.4, 3.25, -3.0, 1.07, 3.79, 28]],
          [0.62, [-3.38, 1.36, 3.3, -3.0, 1.07, 3.79, 27]],
          // Along the counter top: the note, the wallet (or the pile) going back, Kemal's hands and face.
          [0.62, [-1.78, 1.66, 3.38, -3.05, 1.13, 3.97, 42]],
          [1, [-1.86, 1.64, 3.42, -3.05, 1.13, 3.97, 40]],
        ]
      case 'look':
        return [
          [0, [-0.2, 1.7, 2.6, -0.2, 1.2, -1.0, 44]],
          [0.31, [-0.2, 1.7, 2.6, -0.2, 1.2, -1.0, 44]],
          [0.31, [0.4, 2.0, -4.4, 0.3, 0.95, 1.0, 52]],
          [1, [-0.6, 2.0, -4.4, -0.3, 0.95, 1.0, 52]],
        ]
      case 'dashes': {
        const own = this.corner(4)
        return [
          [0, this.corner(9)],
          [0.2, this.corner(9)],
          [0.2, this.corner(3)],
          [0.38, this.corner(3)],
          [0.38, this.corner(11)],
          [0.56, this.corner(11)],
          [0.56, this.corner(5)],
          [0.76, this.corner(5)],
          [0.76, [1.2, 1.44, 1.45, own[3], own[4], own[5], 30]],
          [1, [1.12, 1.42, 1.3, own[3], own[4], own[5], 26]],
        ]
      }
      case 'bell':
        return [
          [0, BELL],
          [1, [1.08, 1.4, -0.95, 1.9, 1.35, 4.0, 40]],
        ]
      case 'disease':
        return [
          [0, [1.15, 1.42, -0.6, 0.75, 1.25, 0.6, 30]],
          [0.48, [1.08, 1.4, -0.45, 0.75, 1.25, 0.6, 28]],
          [0.62, [1.3, 2.4, -0.45, 0.75, 1.0, 0.8, 42]],
          [1, CRANE],
        ]
      case 'bulmaz':
        return [
          [0, OBL34],
          [0.48, [-1.45, 1.42, -0.8, 0.35, 1.17, 0.5, 40]],
          [0.48, [0.75, 1.45, 1.4, -1.5, 1.0, -2.4, 40]],
          [1, [-0.6, 1.4, -0.3, -1.5, 1.0, -2.4, 40]],
        ]
      case 'grandpa':
        return [
          [0, [-1.2, 1.55, -0.85, -1.5, 0.95, -2.42, 34]],
          [0.25, [-1.18, 1.56, -0.82, -1.5, 0.98, -2.42, 34]],
          [0.47, [-1.25, 1.62, -0.62, -1.5, 1.25, -1.8, 40]],
          [0.5, [-1.25, 1.62, -0.62, -1.5, 1.25, -1.8, 40]],
          [0.5, [0.75, 1.4, -1.2, 0.75, 1.35, 0.6, 42]],
          [0.8, [0.8, 1.42, -1.1, 0.8, 1.35, 0.6, 40]],
          // To the door: Dede crossing the floor (the camera well off his way).
          [0.8, [1.0, 1.5, 2.6, 3.5, 1.2, 5.0, 46]],
          [1, [1.1, 1.5, 2.7, 3.5, 1.2, 5.0, 44]],
        ]
      case 'friend':
        return [
          [0, OBL34],
          [0.74, [-1.42, 1.42, -0.78, 0.35, 1.17, 0.5, 39]],
          // His screen goes black, then locks; he looks at it, at me, puts the lighter down, stands.
          [0.74, [-1.32, 1.45, 1.12, -0.72, 1.0, -0.22, 34]],
          [0.88, [-1.28, 1.44, 1.06, -0.72, 1.0, -0.22, 33]],
          [0.88, FRONT4],
          [1, [1.02, 1.44, -1.0, 0.75, 1.22, 0.6, 37]],
        ]
      case 'lighter': {
        const lp = this.flamePos
        // Emre's desk: the lighter, the empty chair turning and slowing; then his hand, the one flame.
        return [
          [0, [0.55, 1.5, 1.75, -0.62, 0.72, 0.45, 38]],
          [0.45, [0.1, 1.2, 1.1, -0.55, 0.78, 0.0, 30]],
          [0.45, [-0.95, 1.18, 0.9, -0.45, 0.84, 0.0, 32]],
          [0.55, [-0.98, 1.2, 0.95, -0.4, 0.86, 0.02, 32]],
          [0.62, [-1.15, 1.28, 1.25, lp.x || -0.1, lp.y || 1.05, lp.z || 0.3, 36]],
          [1, [-1.1, 1.28, 1.2, lp.x || -0.1, lp.y || 1.05, lp.z || 0.3, 34]],
        ]
      }
      case 'father':
        return [
          [0, [1.8, 1.55, -0.85, 1.5, 0.95, -2.42, 34]],
          [0.45, [1.78, 1.56, -0.82, 1.5, 1.05, -2.3, 33]],
          [0.45, [1.0, 1.35, 1.0, 1.5, 1.15, -1.6, 36]],
          [1, [1.05, 1.36, 1.05, 2.2, 1.2, -1.2, 40]],
        ]
      case 'witness':
        return [
          [0, [0.75, 2.4, -3.6, 0.75, 1.0, 0.6, 44]],
          [1, [0.75, 2.1, -2.6, 0.75, 1.05, 0.6, 42]],
        ]
      case 'traces':
        return [
          [0, [-0.4, 1.7, -3.6, -0.6, 0.9, 0.0, 44]],
          [0.5, [-0.45, 1.66, -3.4, -0.6, 0.9, 0.2, 44]],
          [0.5, [-1.5, 1.08, -1.72, CAP_AT.x, 0.8, CAP_AT.z, 30]],
          [0.7, [-1.52, 1.06, -1.78, CAP_AT.x, 0.8, CAP_AT.z, 28]],
          // His hand on the back of Emre's chair, his face above it.
          [0.7, [-1.78, 1.46, 2.32, -0.75, 1.3, 1.15, 40]],
          [0.9, [-1.72, 1.45, 2.26, -0.75, 1.3, 1.15, 38]],
          [0.9, [-0.45, 1.66, -3.4, -0.6, 0.9, 0.4, 44]],
          [1, [-0.45, 1.66, -3.4, -0.6, 0.9, 0.4, 44]],
        ]
      case 'scores':
        return [
          [0, [-0.35, 1.4, 1.15, -0.75, 1.0, -0.22, 30]],
          [0.41, [-0.38, 1.4, 1.1, -0.75, 1.0, -0.22, 28]],
          [0.41, [-0.4, 1.42, -1.0, -0.75, 1.2, 0.6, 40]],
          [1, [-0.5, 1.42, -0.95, -0.75, 1.2, 0.6, 36]],
        ]
      case 'illusion':
        return [
          [0, [2.8, 2.1, 3.2, -0.5, 0.85, -1.0, 50]],
          [1, [2.6, 2.05, 3.0, -0.5, 0.85, -1.0, 49]],
        ]
      case 'mother':
        // The two at their desks; he rolls over and she measures the scarf on him.
        return [
          [0, OBL45],
          [0.38, [0.2, 1.34, -0.8, 1.75, 1.1, 0.55, 41]],
          [0.55, [0.45, 1.36, -0.8, 1.9, 1.1, 0.6, 38]],
          [1, [0.5, 1.36, -0.74, 1.85, 1.1, 0.6, 37]],
        ]
      case 'dims':
        // Over her shoulder on the dimming screen; then from her left: her two taps, her face.
        return [
          [0, [2.6, 1.35, 1.1, 2.25, 1.0, -0.22, 32]],
          [0.6, [2.58, 1.34, 1.05, 2.25, 1.0, -0.22, 31]],
          [0.6, [2.95, 1.3, -0.85, 2.3, 1.12, 0.5, 36]],
          [1, [2.92, 1.3, -0.8, 2.3, 1.12, 0.5, 34]],
        ]
      case 'turn':
        return [
          [0, [0.3, 1.33, -0.72, 1.7, 1.1, 0.55, 38]],
          [1, [0.36, 1.33, -0.64, 1.7, 1.1, 0.55, 36]],
        ]
      case 'together':
        if (turn)
          return [
            [0, [0.4, 1.35, -0.8, 1.85, 1.07, 0.55, 40]],
            [0.15, [0.6, 1.35, -0.8, 2.0, 1.05, 0.55, 40]],
            [1, [0.66, 1.35, -0.72, 2.0, 1.05, 0.55, 37]],
          ]
        // Over his shoulder on her corner (her laugh only at the edge); then the two, him turning to her.
        return [
          [0, [1.22, 1.42, 1.05, 2.42, 0.9, -0.22, 28]],
          [0.47, [1.2, 1.41, 1.0, 2.42, 0.9, -0.22, 27]],
          [0.47, [0.15, 1.34, -0.85, 1.6, 1.1, 0.55, 40]],
          [1, [0.2, 1.34, -0.78, 1.6, 1.1, 0.55, 38]],
        ]
      case 'days':
        // From the right, level with them: her profile, the scarf growing in her lap, him beyond; the window cycling.
        return [
          [0, [4.3, 1.5, 0.95, 1.4, 0.95, -0.5, 44]],
          [1, [4.25, 1.5, 0.9, 1.4, 0.95, -0.5, 44]],
        ]
      case 'instant':
        return [
          // Her screen locks: over her shoulder.
          [0, [2.62, 1.38, 1.12, 2.25, 1.0, -0.22, 32]],
          [0.2, [2.58, 1.37, 1.05, 2.25, 1.0, -0.22, 31]],
          // She comes behind him and wraps the scarf: from the front, closing on her hands at his neck.
          [0.2, [0.05, 1.42, -0.95, 0.95, 1.3, 0.75, 40]],
          [0.46, [0.25, 1.38, -0.65, 0.88, 1.28, 0.7, 32]],
          [0.55, [0.27, 1.38, -0.62, 0.9, 1.28, 0.7, 31]],
          // She goes out behind him.
          [0.55, BELL],
          [0.75, [1.08, 1.4, -0.95, 1.85, 1.38, 4.0, 40]],
          // Her empty chair; the scarf at his neck.
          [0.75, [0.15, 1.34, -0.85, 1.6, 1.1, 0.55, 40]],
          [1, [0.2, 1.34, -0.8, 1.55, 1.12, 0.55, 37]],
        ]
      case 'spring':
        // From beyond his monitor: his face and the scarf, the door opening behind him; then a slow
        // pan after the boy to the counter.
        return [
          [0, [0.95, 1.36, -0.9, 1.6, 1.25, 4.0, 48]],
          [0.36, [0.95, 1.36, -0.9, 1.25, 1.25, 4.0, 48]],
          [1, [0.95, 1.36, -0.85, -0.5, 1.2, 4.0, 48]],
        ]
      case 'newboy':
        return [
          [0, [1.2, 1.35, 1.5, -1.2, 0.9, 1.2, 44]],
          [0.3, [1.15, 1.35, 1.45, -1.0, 0.9, 1.0, 44]],
          [0.3, this.corner(3)],
          [0.45, this.corner(3)],
          [0.45, [-1.6, 1.36, -0.9, 0.3, 1.1, 0.5, 44]],
          [1, [-1.48, 1.36, -0.82, 0.3, 1.1, 0.5, 41]],
        ]
      case 'defiance':
        return [
          [0, this.corner(4)],
          [0.37, this.corner(4)],
          [0.37, [-1.6, 1.36, -0.9, 0.25, 1.1, 0.5, 44]],
          [0.7, [-1.42, 1.36, -0.78, 0.25, 1.1, 0.5, 40]],
          // From behind, over their heads: both corners, the number and the dash.
          [0.7, [1.0, 1.75, 2.0, 0.15, 0.95, -0.22, 36]],
          [1, [0.95, 1.72, 1.85, 0.15, 0.95, -0.22, 34]],
        ]
      case 'final':
        return [
          [0, [0.0, 1.6, 2.2, 0.5, 0.8, -1.5, 44]],
          [1, [CRANE[0], CRANE[1], CRANE[2], 0.5, 0.8, -1.5, 58]],
        ]
    }
    return [[0, BACK4]]
  }

  private camera(seg: SegmentId, u: number, f: SetFrame, shot: Shot) {
    const keys = this.keys(seg, u, f)
    // Interpolate within the current key pair; reduced motion holds each shot at its middle.
    let i = 1
    while (i < keys.length - 1 && keys[i][0] <= u) i++
    const a = keys[Math.max(0, i - 1)]
    const b = keys[Math.min(keys.length - 1, i)]
    let t = a === b || b[0] <= a[0] ? 0 : clamp((u - a[0]) / (b[0] - a[0]))
    if (f.reduced) t = 0.5
    const e = -(Math.cos(PI * t) - 1) / 2
    const k = (j: number) => lerp(a[1][j], b[1][j], e)
    shot.pos.set(k(0), k(1), k(2))
    shot.tgt.set(k(3), k(4), k(5))
    shot.fov = k(6)
    // Shots that follow someone.
    if (seg === 'recess') {
      const b2 = this.cast.benKid
      const follow = ss(0.04, 0.2, u)
      const tx = lerp(3.5, b2.x, follow)
      const tz = lerp(4.8, b2.z, follow)
      shot.tgt.set(lerp(tx, -2.4, ss(0.66, 0.95, u)), 1.0, lerp(tz, 3.6, ss(0.66, 0.95, u)))
    }
    if (seg === 'dusk' && !f.flags.has('kid:more') && u >= 0.12 && u < 0.3) {
      const b2 = this.cast.benKid
      shot.tgt.set(b2.x, 0.95, b2.z)
    }
    if (seg === 'wallet') {
      // Following him from behind, his head well inside the frame.
      const m = this.cast.benAdult
      shot.tgt.set(m.x, 1.42, m.z)
    }
    const insert = shot.fov <= 30
    shot.handheld = insert ? 0.25 : 0.8
    // Development only: a fixed camera for inspecting a moment from anywhere (QA tools).
    if (process.env.NODE_ENV !== 'production') {
      const o = (globalThis as { __yasamakCam?: number[] }).__yasamakCam
      if (o && o.length === 7) {
        shot.pos.set(o[0], o[1], o[2])
        shot.tgt.set(o[3], o[4], o[5])
        shot.fov = o[6]
        shot.handheld = 0
      }
    }
  }

  motion(m: SceneInfo['motion']) {
    m.walking = this.walker ? this.walker.walking : 0
    m.step = this.walker ? this.walker.step : 0
    m.doors = this.doorOpen
    m.frame = this.era === 'kid' ? 1 : 0
  }

  dispose() {
    this.cafe.dispose()
    this.cast.dispose()
    for (const v of Object.values(this.pm)) {
      if (Array.isArray(v)) v.forEach((mm) => mm.dispose())
      else v.dispose()
    }
    disposeTree(this.carriage)
    // The knitting's cut lengths not on screen at the end (the scene disposes what it holds).
    this.knit.dispose()
    this.envMap = null
  }
}

export const createYasamakScene = (options: SceneOptions): StoryScene => createSetScene(new YasamakDirector(), options)
