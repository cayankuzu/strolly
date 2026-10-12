/**
 * TEK AYAK — the direction. Every frame is a pure function of progress `p`
 * (and of the reader's one choice): where the teacher stands and what his
 * hand writes, what the twenty do with their heads, where the plane is and
 * how far it is folded, where the wheelchair is (always really there), the
 * sun's angle, the clock, the camera and how far the reader may turn.
 *
 * Twist protection (docs §3): before `lift` 0.62 nothing below Eren's chest
 * may reach the frame. The desks and the framing do it; `lockedAt` and the
 * wide-screen clamp keep the reader's look out of the back-right corner; the
 * development sweep (`window.__tekSweep`) checks it by rendering the chair
 * in flat magenta over every look direction and three aspect ratios.
 */
import * as THREE from 'three'
import { angleLerp, clamp, easeInOutSine, lerp, mulberry32, smoothstep } from '@/lib/math'
import { at, lapse, local, segmentAt, sub, wallClock, type SegmentId } from '@/stories/tekayak/timeline'
import type { SetFrame, Shot } from '../kit/SetScene'
import { held, keyed } from '../kit/direct'
import { makePath, type Path } from '../figure/paths'
import { makePose, type Pose } from '../figure/Figure'
import { STAND } from '../figure/poses'
import type { Pal } from './materials'
import type { Shell } from './room'
import type { Furniture, Seat } from './furniture'
import type { Sunlight } from './light'
import type { Cast, Person } from './cast'
import { CHAIR, type Wheelchair } from './wheelchair'
import { DART, SHEET, type PaperPlane, type PlaneFold } from './plane'
import { AT_BOARD, BIN, BOARD, CORNER, DESK, EREN_SEAT, FLIGHT, IBRAHIM_SEAT, R_EYE, ROWS, SALIM_SEAT, SEAM_Z, STAIN, SUN_DIR_A, SUN_DIR_B } from './layout'
import { CLAMP_WIDE, lockedAt, SHOTS } from './shots'
import * as K from './poses'

export type Stage = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  shell: Shell
  furniture: Furniture
  light: Sunlight
  cast: Cast
  chair: Wheelchair
  plane: PaperPlane
  pal: Pal
}

const PI = Math.PI
/** Pose indices (Figure JOINTS order): the shins' x rotation. */
const SHIN_L = 2 + 12 * 3
const SHIN_R = 2 + 15 * 3
const W = (p: number, id: SegmentId, a: number, b: number) => sub(p, id, a, b)
const ss = (x: number) => smoothstep(0, 1, x)
const between = (p: number, a: number, b: number) => p >= a && p < b
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

const SUN_A = new THREE.Color(0xffd9a0)
const SUN_B = new THREE.Color(0xffc37a)

/** Seated root offsets: the hip joint over the chair seat. */
const SEAT_Y = 0.02
const SEAT_DZ = 0.04

type Gaze = { pitch: number; eyes: number; eyesPitch: number }

/** The three's way out, around the back and down the right lane to the corner (never shown). */
const P_SALIM_OUT = makePath([
  [SALIM_SEAT.x, SALIM_SEAT.z + 0.1],
  [1.45, 1.75],
  [1.4, 3.1],
  [3.45, 3.15],
  [3.5, 2.2],
])
const P_IBRAHIM_OUT = makePath([
  [IBRAHIM_SEAT.x, IBRAHIM_SEAT.z + 0.15],
  [1.45, 3.0],
  [1.6, 3.2],
  [3.45, 3.2],
  [3.5, 2.75],
])
const P_SALIM_DOWN = makePath([
  [3.5, 2.2],
  [3.5, -1.9],
  [3.3, -2.5],
  [CORNER.salim.x, CORNER.salim.z],
])
const P_IBRAHIM_DOWN = makePath([
  [3.5, 2.75],
  [3.5, -1.9],
  [3.0, -2.45],
  [CORNER.ibrahim.x, CORNER.ibrahim.z],
])
/** The wheelchair: back out from under the desk, into the lane, then down to the corner. */
const P_EREN_OUT = makePath([
  [EREN_SEAT.x, EREN_SEAT.z],
  [EREN_SEAT.x + 0.1, EREN_SEAT.z + 0.35],
  [3.45, 3.0],
  [3.45, 1.7],
])
const P_EREN_DOWN = makePath([
  [3.45, 1.7],
  [3.45, -1.6],
  [2.6, -2.2],
  [CORNER.eren.x, -2.35],
])

const tmpV = new THREE.Vector3()
const tmpV2 = new THREE.Vector3()
const tmpV3 = new THREE.Vector3()
const tmpV4 = new THREE.Vector3()
const tmpE = new THREE.Euler()
const Y_UP = new THREE.Vector3(0, 1, 0)
const tmpQ = new THREE.Quaternion()

/** The plane at his chest (smooth, mock, rise): in front of him, he faces the class at the board. */
const HELD = new THREE.Vector3(0.7, 1.17, -2.52)
/** İbrahim's plane at eye level, in front of his face. */
const AIM_AT = new THREE.Vector3(2.12, 1.15, 2.42)
/** What the plane points at: the three at the back (summon), the bin corner (order → reveal). */
const TRIO_AT = new THREE.Vector3(2.4, 1.15, 2.6)
const CORNER_AT = new THREE.Vector3(3.4, 0.95, -3.15)
const tmpM = new THREE.Matrix4()
const size = new THREE.Vector2()

export class Director {
  private s: Stage
  private seats: Seat[]
  private kidSeats = new Map<Person, Seat>()
  private gaze = new Map<Person, Gaze>()
  private chalk: THREE.Mesh
  private chalkBit: THREE.Mesh
  private diagram: THREE.Mesh
  private diagramCanvas: { draw: (k: string, fn: (g: CanvasRenderingContext2D, w: number, h: number) => void) => void; texture: THREE.Texture }
  private sunDir = new THREE.Vector3()
  private sunColor = new THREE.Color()
  private eye = new THREE.Vector3()
  private glassesInHand: THREE.Group
  private walkStep = 0
  private walking = 0
  private reqId = ''
  private seed = mulberry32(3)
  private kidRand = new Map<Person, number[]>()
  /** The plane leads his hands this frame (see planeLead), and where they take hold of it. */
  private led = false
  private hands = 0
  private handL = new THREE.Vector3()
  private handR = new THREE.Vector3()
  private lastGrip = new THREE.Vector3(0.7, 1.0, -2.6)

  constructor(stage: Stage) {
    this.s = stage
    this.seats = stage.furniture.seats
    for (const seat of this.seats) {
      if (!seat.who || seat.who === 'R') continue
      const p = stage.cast.kids.get(seat.who)
      if (p) {
        this.kidSeats.set(p, seat)
        this.kidRand.set(p, [this.seed(), this.seed(), this.seed(), this.seed(), this.seed()])
      }
    }
    for (const p of stage.cast.all) this.gaze.set(p, { pitch: 0, eyes: 0, eyesPitch: 0 })
    // The chalk in his hand, and the piece that breaks off.
    const m = stage.pal
    this.chalk = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.05, 8), m.chalkStick)
    this.chalk.castShadow = false
    stage.cast.teacher.figure.rGrip.add(this.chalk)
    this.chalk.position.set(0, -0.012, 0.012)
    this.chalk.rotation.x = 0.5
    this.chalkBit = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.022, 8), m.chalkStick)
    stage.scene.add(this.chalkBit)
    // The balanced-forces diagram he draws in the middle of the board during chapter 2.
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 384
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    const g2 = c.getContext('2d')!
    let key = ''
    this.diagramCanvas = {
      texture: tex,
      draw: (k, fn) => {
        if (k === key) return
        key = k
        g2.clearRect(0, 0, c.width, c.height)
        fn(g2, c.width, c.height)
        tex.needsUpdate = true
      },
    }
    this.diagram = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.48), new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1 }))
    this.diagram.position.set(-0.42, 1.27, BOARD.z + 0.005)
    stage.scene.add(this.diagram)
    // His glasses, when he takes them off (laughs).
    this.glassesInHand = stage.cast.teacher.figure.glasses.clone(true)
    this.glassesInHand.visible = false
    stage.cast.teacher.figure.lGrip.add(this.glassesInHand)
    this.glassesInHand.position.set(0, -0.01, 0.02)
    this.glassesInHand.rotation.set(0.4, 0, PI / 2)
    if (process.env.NODE_ENV !== 'production') this.installSweep()
  }

  // ——————————————————————————————————————————————— frame

  frame(f: SetFrame, shot: Shot) {
    const p = f.p
    const seg = segmentAt(p)
    const id = seg.id as SegmentId
    const u = local(p, id)
    this.walking = 0
    this.lightAndClock(p, f)
    this.boardWriting(p)
    this.camera(id, u, p, f, shot)
    this.led = this.planeLead(p, f, shot)
    this.teacher(p, f)
    this.kids(p, f)
    this.trio(p, f)
    this.planeState(p, f)
    this.wheelchair(p)
    this.s.light.update(this.sunDir, this.sunColor, 1, f.time, this.s.renderer.getPixelRatio(), shot.pos)
  }

  motion(info: { step: number; walking: number }) {
    info.step = this.walkStep
    info.walking = this.walking
  }

  // ——————————————————————————————————————————————— light, clock

  private lightAndClock(p: number, f: SetFrame) {
    // The sun lowers and warms through the time-lapse, landing on the corner at end 0.5.
    const k = ss(clamp((p - at('flow', 0.25)) / (at('end', 0.5) - at('flow', 0.25))))
    this.sunDir.copy(SUN_DIR_A).lerp(SUN_DIR_B, k).normalize()
    this.sunColor.copy(SUN_A).lerp(SUN_B, k)
    const L = this.s.light
    // The corner: soft, cooler indirect light; after the reveal a gentle key holds Eren's face.
    L.corner.intensity = lerp(0, 2.2, ss(clamp((p - at('reveal')) / (at('reveal', 0.5) - at('reveal')))))
    // Dust in the air: the motes in front of the board; they burst when the plane passes (flight 0.33–0.4).
    const burst = clamp((p - at('flight', 0.33)) / (at('flight', 0.46) - at('flight', 0.33)))
    L.burst(burst > 0 && p < at('flight', 1) ? easeInOutSine(burst) : 0, tmpV.set(0.9, 1.55, -2.35))
    // (Through the time-lapse the motes thin out: in the wide end shot they would read as snow.)
    L.dust(p < at('flow', 0.3) ? 1 : lerp(1, 0.25, ss(W(p, 'flow', 0.3, 0.6))))
    const sec = wallClock(p)
    this.s.shell.clock.set(sec / 3600)
    void f
  }

  // ——————————————————————————————————————————————— the board

  /** How much of the law is written (characters). */
  private lawChars(p: number) {
    const law = this.s.shell.law
    const l = law.lines.map((x) => x.text.length)
    const c12 = l[0] + l[1]
    const c3 = c12 + l[2]
    const c5 = c3 + l[3] + l[4]
    if (p < at('board', 0.46)) return 0
    if (p < at('board', 0.98)) return W(p, 'board', 0.46, 0.98) * c12
    if (p < at('light')) return c12
    if (p < at('light', 0.3)) return c12 + W(p, 'light', 0, 0.3) * (c3 - c12)
    if (p < at('light', 0.35)) return c3
    if (p < at('light', 0.78)) return c3 + W(p, 'light', 0.35, 0.78) * (c5 - c3)
    if (p < at('aim', 0.5)) return c5
    // Line 6, stopped mid-letter at whisper 0.4 ("Örnek: masanın üstün|").
    if (p < at('whisper', 0.4)) return c5 + clamp((p - at('aim', 0.5)) / (at('whisper', 0.4) - at('aim', 0.5))) * 20.45
    return c5 + 20.45
  }

  private boardWriting(p: number) {
    const sh = this.s.shell
    // Title: open 0.2–0.85, underline 0.85–0.95.
    const tn = W(p, 'open', 0.2, 0.85) * sh.title.count
    const under = W(p, 'open', 0.85, 0.95)
    sh.title.render(tn, under, 2)
    sh.law.render(this.lawChars(p), 0, 9)
    // The diagram: a box, two equal arrows, "F₁ = F₂" (under → pass).
    const d = clamp((p - at('under', 0.05)) / (at('pass', 0.9) - at('under', 0.05)))
    const dk = Math.round(d * 30)
    this.diagramCanvas.draw(`d${dk}`, (g, w, h) => {
      const q = dk / 30
      g.strokeStyle = 'rgba(236,234,222,0.92)'
      g.fillStyle = 'rgba(236,234,222,0.92)'
      g.lineWidth = 6
      g.lineCap = 'round'
      const seg = (t0: number, t1: number) => clamp((q - t0) / (t1 - t0))
      // Box.
      const b = seg(0, 0.35)
      const pts: Array<[number, number]> = [
        [196, 150],
        [316, 150],
        [316, 250],
        [196, 250],
        [196, 150],
      ]
      g.beginPath()
      g.moveTo(...pts[0])
      for (let i = 1; i < pts.length; i++) {
        const t = clamp(b * 4 - (i - 1))
        if (t <= 0) break
        const [x0, y0] = pts[i - 1]
        const [x1, y1] = pts[i]
        g.lineTo(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)
      }
      g.stroke()
      const arrow = (x0: number, x1: number, t: number) => {
        if (t <= 0) return
        const x = x0 + (x1 - x0) * t
        g.beginPath()
        g.moveTo(x0, 200)
        g.lineTo(x, 200)
        g.stroke()
        if (t >= 1) {
          const s = Math.sign(x1 - x0)
          g.beginPath()
          g.moveTo(x1, 200)
          g.lineTo(x1 - s * 22, 186)
          g.moveTo(x1, 200)
          g.lineTo(x1 - s * 22, 214)
          g.stroke()
        }
      }
      arrow(196, 60, seg(0.4, 0.6))
      arrow(316, 452, seg(0.6, 0.8))
      if (q > 0.85) {
        g.font = `500 40px "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive`
        g.fillText('F₁', 70, 170)
        if (q > 0.92) g.fillText('F₂', 400, 170)
        if (q > 0.97) g.fillText('F₁ = F₂', 170, 320)
      }
      void w
      void h
    })
  }

  /** Where the chalk is on the board right now (world), and whether he is writing. */
  private chalkTip(p: number, out: THREE.Vector3): boolean {
    const sh = this.s.shell
    if (p < at('board')) {
      if (p < at('open', 0.2)) {
        const t = sh.title.tip(0)
        sh.titleAt(t.x, t.y, out)
        out.x -= 0.25 * (1 - W(p, 'open', 0, 0.2))
        return p > at('open', 0.12)
      }
      const under = W(p, 'open', 0.85, 0.95)
      const t = sh.title.tip(W(p, 'open', 0.2, 0.85) * sh.title.count, under > 0 && under < 1 ? under : 0)
      sh.titleAt(t.x, t.y, out)
      return p < at('open', 0.95)
    }
    if (between(p, at('under', 0.05), at('pass', 0.9))) {
      // Drawing the diagram: follow the strokes roughly.
      const d = clamp((p - at('under', 0.05)) / (at('pass', 0.9) - at('under', 0.05)))
      const x = d < 0.35 ? -0.48 + Math.sin(d * 40) * 0.06 : d < 0.6 ? -0.48 - (d - 0.4) * 1.0 : d < 0.8 ? -0.35 + (d - 0.6) * 1.0 : -0.5 + Math.sin(d * 60) * 0.15
      out.set(x, 1.28 + Math.cos(d * 37) * 0.05, BOARD.z + 0.006)
      return true
    }
    const n = this.lawChars(p)
    const t = sh.law.tip(Math.max(0, n))
    sh.lawAt(t.x, t.y, out)
    const writing = (between(p, at('board', 0.46), at('board', 0.98)) || between(p, at('light'), at('light', 0.3)) || between(p, at('light', 0.35), at('light', 0.78)) || between(p, at('aim', 0.5), at('whisper', 0.4)))
    return writing
  }

  // ——————————————————————————————————————————————— the teacher

  private teacher(p: number, f: SetFrame) {
    const T = this.s.cast.teacher
    const a = T.actor.begin()
    const time = f.time
    let face = { open: 0, smile: 0 }
    let shut = 0
    let eyesYaw = 0
    let eyesPitch = 0
    let pitch = 0
    let roll = 0
    let glassesOff = false
    this.chalk.visible = p < at('anger', 0.33)
    this.chalkBit.visible = false
    const tip = tmpV2
    const writing = this.chalkTip(p, tip)

    if (p < at('anger')) {
      // At the board, facing it. Walk between the places he writes.
      const standX = this.boardStand(p, tip)
      if (standX.walk) {
        a.walk(standX.walk, standX.u, K.T_STAND, PI, PI, 0.8)
        this.walkStep = a.step
        this.walking = a.walking
      } else {
        a.place(standX.x, standX.z, PI)
        a.hold(K.T_WRITE)
      }
      // The writing hand on the chalk tip; lowered when he only talks.
      const reach = writing ? 1 : p < at('flight') ? 0.55 : 1
      if (!standX.walk) a.reach('r', reach, tip.x, tip.y - 0.015, tip.z + 0.035, 0.4)
      // Light: at 0.45–0.62 he turns his head to dictate to the class (his face in profile).
      const talk = W(p, 'light', 0.4, 0.5) - W(p, 'light', 0.76, 0.84)
      a.look = lerp(-0.25, 0.8, talk > 0 ? ss(talk) : 0)
      if (p < at('open', 0.12)) a.reach('r', 0, 0, 0, 0)
      // Whisper: the chalk stops (0.4); the head tilts toward the sound (0.5); the eyes slide (0.75).
      if (p >= at('whisper')) {
        const tilt = ss(W(p, 'whisper', 0.45, 0.6))
        roll = -0.12 * tilt
        a.look = lerp(0, -0.35, tilt)
        eyesYaw = -0.32 * ss(W(p, 'whisper', 0.72, 0.8))
      }
      // The hit: a small jolt at flight 0.44, then nothing moves.
      if (p >= at('flight', 0.44)) pitch = 0.08 * Math.max(0, 1 - (p - at('flight', 0.44)) / (at('flight', 0.6) - at('flight', 0.44)))
    } else if (p < at('turn')) {
      // Anger: still facing the board. The hand comes down into a fist; eyes shut, a breath; the chalk snaps.
      const st = AT_BOARD.turned
      a.place(st.x, st.z, PI).hold(K.T_STAND)
      const down = ss(W(p, 'anger', 0.05, 0.28))
      a.reach('r', 1, st.x + 0.12, lerp(1.62, 1.18, down), lerp(-3.43, -3.05, down), 0.5)
      shut = ss(W(p, 'anger', 0.04, 0.12)) * (1 - ss(W(p, 'anger', 0.4, 0.5)))
      pitch = -0.06 * Math.sin(clamp(W(p, 'anger', 0.12, 0.3)) * PI)
      if (p >= at('anger', 0.32)) {
        this.chalkBit.visible = true
        const t = clamp((p - at('anger', 0.32)) / (at('anger', 0.45) - at('anger', 0.32)))
        T.figure.rGrip.getWorldPosition(this.chalkBit.position)
        this.chalkBit.position.y = Math.max(0.006, this.chalkBit.position.y + 0.03 - 1.4 * t * t)
        this.chalkBit.position.x += 0.06 * t
        this.chalkBit.rotation.set(t * 5, 0, t * 3)
      }
    } else if (p < at('smooth')) {
      // Turn (whip round) → hush (scan, then the glance).
      const st = AT_BOARD.turned
      const spin = ss(W(p, 'turn', 0.08, 0.2))
      a.place(st.x, st.z + 0.05 * spin, angleLerp(PI, 0.0001, spin))
      a.blend(
        [
          [0, K.T_STAND],
          [0.5, makeTwist(0.25)],
          [1, K.T_STAND],
        ],
        spin,
      )
      if (p < at('turn', 0.3)) a.reach('r', 1 - spin, st.x + 0.12, 1.18, -3.05, 0.5)
      // The shout.
      const shout = W(p, 'turn', 0.5, 0.56) * (1 - W(p, 'turn', 0.8, 0.95))
      face = { open: shout * 0.9, smile: 0 }
      pitch = -0.05 * shout
      if (p >= at('hush')) {
        // Eyes scan the rows from the window side to the door side (0.32–0.5).
        const scan = ss(W(p, 'hush', 0.32, 0.5))
        const target = this.glanceTarget(f.flags)
        const look = ss(W(p, 'hush', 0.6, 0.72))
        const sx = lerp(-2.4, 2.4, scan)
        const desk = f.flags.has('look:desk')
        const gx = desk ? lerp(sx, 2.4, ss(W(p, 'hush', 0.5, 0.56))) : lerp(sx, target.x, look)
        const gz = desk ? 2.4 : lerp(1.6, target.z, look)
        a.lookAt(gx, gz, 1)
        pitch = 0.08
        eyesYaw = 0
        if (f.flags.has('look:salim') && look > 0) eyesPitch = 0
      }
    } else if (p < at('summon')) {
      // Smooth, tip, mock: he bends for the plane, straightens, holds it at his chest (the plane leads, the hands follow).
      const st = AT_BOARD.turned
      a.place(st.x, st.z, 0)
      if (p < at('smooth', 0.1))
        a.blend(
          [
            [0, K.T_STAND],
            [1, K.T_BEND],
          ],
          ss(W(p, 'smooth', 0.02, 0.09)),
        )
      else
        a.blend(
          [
            [0, K.T_BEND],
            [0.5, K.T_STAND],
            [1, K.T_HOLD],
          ],
          ss(W(p, 'smooth', 0.1, 0.24)),
        )
      pitch = p < at('mock') ? 0.12 : 0
      if (between(p, at('mock'), at('mock', 0.42))) {
        // Muttering at the nose: lips moving fast.
        face = { open: 0.12 + 0.18 * Math.abs(Math.sin(time * 17)) * Math.abs(Math.sin(time * 5.3)), smile: 0 }
        pitch = 0.14
      }
      if (p >= at('mock', 0.42)) {
        // Eyes over the glasses toward the back-right; a thin, mocking smile.
        const lift = ss(W(p, 'mock', 0.42, 0.5))
        a.lookAt(2.7, 2.8, 0.55 * lift)
        pitch = lerp(0.14, 0.12, lift)
        eyesPitch = 0.22 * lift
        face = { open: 0.05 + 0.1 * Math.abs(Math.sin(time * 9)) * W(p, 'mock', 0.55, 0.62) * (1 - W(p, 'mock', 0.85, 0.95)), smile: 0.8 * lift }
      }
    } else if (p < at('order')) {
      // Summon: the plane slapped into his palm, then pointed at the back of the room like a finger.
      // Rise: he looks only at the plane.
      const st = AT_BOARD.turned
      if (p < at('rise')) {
        const point = ss(W(p, 'summon', 0.16, 0.36))
        const yaw = 0.22 * point
        a.place(st.x, st.z, yaw)
        a.blend(
          [
            [0, K.T_HOLD],
            [1, K.T_STAND],
          ],
          point,
        )
        if (p >= at('summon', 0.12)) this.pointAt(a, st.x, st.z, yaw, TRIO_AT, Math.max(point, ss(W(p, 'summon', 0.1, 0.16))))
        a.lookAt(2.4, 2.8, 0.45 * point)
        face = { open: 0.35 * W(p, 'summon', 0.3, 0.38) * (1 - W(p, 'summon', 0.7, 0.8)), smile: 0 }
      } else {
        a.place(st.x, st.z, 0)
        a.hold(K.T_HOLD)
        pitch = 0.22
      }
    } else if (p < at('burst', 0.55)) {
      // Order → reveal → the start of the burst: turned to the corner, the plane raised like a pointer.
      const st = AT_BOARD.turned
      const turn = ss(W(p, 'order', 0, 0.3))
      const x = lerp(st.x, 0.55, turn)
      const z = lerp(st.z, -2.75, turn)
      const yaw = angleLerp(0.0001, PI / 2 - 0.15, turn)
      a.place(x, z, yaw)
      const raise = ss(W(p, 'order', 0.12, 0.45))
      a.blend(
        [
          [0, K.T_HOLD],
          [1, K.T_STAND],
        ],
        raise,
      )
      // (He keeps hold of it with the right hand while he turns.)
      this.pointAt(a, x, z, yaw, CORNER_AT, Math.max(raise, 0.35))
      face = { open: 0.4 * (W(p, 'order', 0.1, 0.18) - W(p, 'order', 0.7, 0.85)), smile: 0 }
      if (p >= at('reveal')) a.lookAt(CORNER.eren.x, CORNER.eren.z, 0.6 * ss(W(p, 'reveal', 0.2, 0.5)))
    } else if (p < at('flow', 0.25)) {
      // The laugh: he lowers the plane, opens his mouth, closes it; takes his glasses off, pinches his nose.
      const lower = ss(W(p, 'burst', 0.55, 0.7))
      const yaw = PI / 2 - 0.15 - 0.6 * lower
      a.place(0.55, -2.75, yaw)
      a.hold(K.T_STAND)
      if (lower < 1) this.pointAt(a, 0.55, -2.75, yaw, CORNER_AT, 1 - lower)
      face = { open: 0.5 * (W(p, 'burst', 0.6, 0.66) - W(p, 'burst', 0.72, 0.8)), smile: 0 }
      if (p >= at('laughs', 0.3)) {
        const off = ss(W(p, 'laughs', 0.3, 0.45))
        const back = 1 - ss(W(p, 'still', 0.8, 0.95))
        glassesOff = off > 0.5 && p < at('still', 0.85)
        // Right thumb and finger on the bridge of the nose; the glasses in the left hand at his chest.
        const fx = Math.sin(yaw)
        const fz = Math.cos(yaw)
        T.figure.joints.head.getWorldPosition(tmpV)
        a.reach('r', ss(W(p, 'laughs', 0.4, 0.55)) * back, tmpV.x + fx * 0.11, tmpV.y + 0.07, tmpV.z + fz * 0.11, 0.6)
        a.reach('l', off * back, tmpV.x + fx * 0.24 + fz * 0.1, tmpV.y - 0.36, tmpV.z + fz * 0.24 - fx * 0.1, 0.5)
        pitch = 0.25 * off
        shut = off
      }
    } else {
      this.teacherLapse(p, a, time)
    }

    if (this.led && this.hands > 0) {
      a.reach('l', this.hands, this.handL.x, this.handL.y, this.handL.z, 0.4)
      a.reach('r', this.hands, this.handR.x, this.handR.y, this.handR.z, 0.4)
    }
    a.apply(time, !(p >= at('flight', 0.44) && p < at('anger')))
    const j = T.figure.joints
    j.head.rotation.x += pitch
    j.head.rotation.z += roll
    T.eyesTo(shut, eyesYaw, eyesPitch)
    T.face(face)
    T.figure.glasses.visible = !glassesOff
    this.glassesInHand.visible = glassesOff
  }

  /** Where he stands at the board for the current writing (or a walk between places). */
  private boardStand(p: number, tip: THREE.Vector3): { x: number; z: number; walk?: Path; u: number } {
    const z = AT_BOARD.law.z
    // Title → law: a few steps along the board while the wide shot runs (board 0.08–0.4).
    if (between(p, at('board', 0.08), at('board', 0.4))) return { x: 0, z, walk: makePath([[-0.55, z], [0.1, z]]), u: W(p, 'board', 0.08, 0.4) }
    // Law → diagram (rows 0.3–0.8), diagram → line 6 (aim 0.1–0.45).
    if (between(p, at('rows', 0.3), at('rows', 0.8))) return { x: 0, z, walk: makePath([[0.85, z], [-0.15, z]]), u: W(p, 'rows', 0.3, 0.8) }
    // Diagram → line 6: to the place where the plane will find him (he writes "Örnek: …" from there).
    if (between(p, at('aim', 0.1), at('aim', 0.45))) return { x: 0, z, walk: makePath([[-0.15, z], [AT_BOARD.turned.x, AT_BOARD.turned.z]]), u: W(p, 'aim', 0.1, 0.45) }
    if (p >= at('aim', 0.45)) return { x: AT_BOARD.turned.x, z: AT_BOARD.turned.z, u: 0 }
    let x = tip.x - 0.36
    if (p < at('board')) x = Math.max(-1.55, tip.x - 0.4)
    else if (p < at('board', 0.4)) x = -0.55
    else if (between(p, at('rows', 0.8), at('aim', 0.45))) x = -0.15 + Math.sin(p * 900) * 0.02
    x = clamp(x, -1.55, 1.25)
    return { x, z, u: 0 }
  }

  private teacherLapse(p: number, a: Person['actor'], time: number) {
    // Time-lapse: back to the board, writes, turns, writes; at the bell, the plane goes into his pocket.
    const sec = wallClock(p)
    const L = lapse(p)
    const bell = p >= at('end', 0.6)
    if (bell) {
      const t = W(p, 'end', 0.6, 0.85)
      a.place(lerp(-0.2, -1.6, ss(t)), -2.85, angleLerp(0.3, -PI / 2, ss(W(p, 'end', 0.6, 0.7))))
      a.blend(
        [
          [0, K.T_STAND],
          [0.5, makeTwist(-0.2)],
          [1, K.T_STAND],
        ],
        ss(W(p, 'end', 0.62, 0.8)),
      )
      this.s.cast.teacher.face({ open: 0, smile: 0 })
      return
    }
    const cyc = (sec - (15 * 3600 + 20 * 60)) / 140
    const k = cyc - Math.floor(cyc)
    const n = Math.floor(cyc)
    const xs = [-0.9, 0.2, -0.3, 0.6, -1.2, 0.0, -0.6, 0.4, -1.0, 0.1]
    const x = xs[((n % xs.length) + xs.length) % xs.length]
    const before = p < at('flow', 0.3)
    if (before || L < 0.05) {
      // Settling: he goes back toward the board.
      const t = ss(clamp((p - at('flow')) / (at('flow', 0.3) - at('flow'))))
      a.place(lerp(0.55, -0.2, t), lerp(-2.75, -2.9, t), lerp(PI / 2 - 0.75, PI, t))
      a.hold(K.T_STAND)
      return
    }
    const facing = k < 0.62 ? PI : 0.15
    a.place(x, -2.95, facing)
    if (k < 0.62) {
      a.hold(K.T_WRITE)
      a.reach('r', 1, x + 0.35 + 0.2 * Math.sin(k * 9), 1.45 + 0.1 * Math.cos(k * 13), BOARD.z + 0.04, 0.4)
    } else a.hold(K.T_STAND)
    void time
  }

  /** The right arm out at a point, from where he stands (the plane in the hand is his finger). */
  private pointAt(a: Person['actor'], x: number, z: number, yaw: number, to: THREE.Vector3, w: number) {
    // The right shoulder (facing yaw, the right hand is on the side (−cos yaw, sin yaw)).
    const sx = x - Math.cos(yaw) * 0.19
    const sz = z + Math.sin(yaw) * 0.19
    tmpV.set(to.x - sx, to.y - 1.42, to.z - sz).normalize()
    a.reach('r', w, sx + tmpV.x * 0.6, 1.42 + tmpV.y * 0.6, sz + tmpV.z * 0.6, 0.3)
  }

  private glanceTarget(flags: ReadonlySet<string>) {
    if (flags.has('look:salim')) return { x: SALIM_SEAT.x, z: SALIM_SEAT.z, y: 1.08 }
    if (flags.has('look:ibrahim')) return { x: IBRAHIM_SEAT.x, z: IBRAHIM_SEAT.z, y: 1.0 }
    if (flags.has('look:eren')) return { x: EREN_SEAT.x, z: EREN_SEAT.z, y: 1.02 }
    return { x: 2.4, z: 2.6, y: 1.0 }
  }

  // ——————————————————————————————————————————————— the class

  private kids(p: number, f: SetFrame) {
    const cast = this.s.cast
    const time = f.time
    const L = lapse(p)
    const sec = wallClock(p)
    const T = cast.teacher.actor
    for (const [person, seat] of this.kidSeats) {
      if (person === cast.salim || person === cast.ibrahim || person === cast.eren) continue
      const r = this.kidRand.get(person)!
      const a = person.actor.begin()
      const g = this.gaze.get(person)!
      g.pitch = 0
      g.eyes = 0
      g.eyesPitch = 0
      const deskZ = ROWS[seat.row]
      let base: Pose = K.K_WRITE
      let write = 1
      let laugh = 0
      let lookX = T.x
      let lookZ = T.z
      let lookAmt = 0
      let stand = 0
      // What the room does, moment by moment.
      if (p < at('flight', 0.44)) {
        base = r[0] < 0.18 ? K.K_STILL : K.K_WRITE
        write = 1
      } else if (p < at('turn', 0.1)) {
        // Frozen by the hit: pens stop, a few heads come up.
        base = K.K_STILL
        write = 0
        lookAmt = r[1] < 0.5 ? 0.4 : 0
      } else if (p < at('rise')) {
        // The shout: everyone sits up and looks at him; then still.
        const up = ss(W(p, 'turn', 0.1, 0.25))
        base = up > 0.5 ? K.K_UP : K.K_STILL
        write = 0
        lookAmt = 0.9 * up
        g.pitch = p >= at('turn', 0.6) ? 0.1 + r[2] * 0.12 : 0
        // In hush, one pen rolls across a desk and stops (see planeState → pen).
      } else if (p < at('reveal')) {
        // They watch the three go (never shown): heads follow the procession.
        base = K.K_UP
        write = 0
        const tgt = this.processionPoint(p)
        lookX = tgt.x
        lookZ = tgt.z
        lookAmt = 1
        // Two kids lean into the aisle to see.
        if (p >= at('walk') && p < at('lift') && (seat.who === 'k3' || seat.who === 'k7')) base = K.K_LEAN_IN
      } else if (p < at('burst', 0.46)) {
        // The reveal: heads turn to Eren in a cascade, front rows first.
        base = K.K_UP
        write = 0
        const t = ss(W(p, 'reveal', 0.02 + seat.row * 0.07, 0.18 + seat.row * 0.07))
        lookX = lerp(2.9, CORNER.eren.x, t)
        lookZ = lerp(-2.78, CORNER.eren.z, t)
        lookAmt = 1
        g.pitch = 0.04
      } else if (p < at('flow', 0.3)) {
        // The laugh spreads front to back.
        const start = at('burst', 0.5) + (at('burst', 0.72) - at('burst', 0.5)) * (seat.row / 3) + r[3] * 0.002
        laugh = clamp((p - start) / 0.004) * (1 - 0.6 * ss(W(p, 'still', 0.3, 1))) * (1 - ss(W(p, 'flow', 0, 0.3)))
        base = K.K_UP
        write = 0
        lookX = CORNER.salim.x - 0.3
        lookZ = CORNER.salim.z
        lookAmt = 0.8
      } else {
        // Time-lapse: back to the notebooks; heads up now and then; the bell.
        base = K.K_WRITE
        write = 1
        const ph = Math.sin(sec * (0.05 + r[0] * 0.04) + r[1] * 9)
        if (ph > 0.7) {
          base = K.K_STILL
          write = 0
          lookAmt = 0.8
        }
        if (p >= at('end', 0.6)) stand = ss(W(p, 'end', 0.6 + r[2] * 0.04, 0.7 + r[2] * 0.06))
      }
      // Seated (or standing up at the bell, out beside the desk).
      const sx = seat.x
      const sz = seat.z + SEAT_DZ
      if (stand > 0) {
        a.place(sx + seat.side * 0.0, sz + 0.25 * stand, PI)
        a.blend(
          [
            [0, base],
            [1, STAND],
          ],
          stand,
        )
        a.y = SEAT_Y * (1 - stand)
        lookAmt = 0.6
        lookX = 0
        lookZ = 3.5
      } else {
        a.place(sx, sz, PI)
        if (laugh > 0) {
          const style = r[4]
          const lp = style < 0.4 ? K.K_LAUGH : style < 0.75 ? K.K_DOUBLE : K.K_UP
          a.blend(
            [
              [0, base],
              [1, lp],
            ],
            laugh,
          )
        } else a.hold(base)
        a.y = SEAT_Y
        // Under the desks, some feet swing (the class's underworld).
        if (r[1] < 0.45 && write > 0) {
          const k = time * (2.2 + r[2] * 1.6) + r[0] * 9
          a.pose[SHIN_L] += Math.sin(k) * 0.22
          a.pose[SHIN_R] += Math.sin(k + 1.3) * 0.18
        }
      }
      if (lookAmt > 0) a.lookAt(lookX, lookZ, lookAmt)
      // Hands: on the notebook (one writing), or in the lap when frozen.
      if (stand < 0.5) {
        const wx = sx + 0.07 + Math.sin(time * (5 + L * 30) + r[0] * 10) * 0.025 * write
        const wz = deskZ + 0.1 + Math.cos(time * (3.3 + L * 25) + r[1] * 7) * 0.012 * write
        const handY = DESK.top + 0.03
        if (laugh > 0.3 && r[4] > 0.75) {
          // Hiding her face in her sleeve.
          person.figure.joints.head.getWorldPosition(tmpV)
          a.reach('l', laugh, tmpV.x + 0.02, tmpV.y - 0.05, tmpV.z - 0.12, 0.6)
          a.reach('r', laugh, tmpV.x - 0.06, tmpV.y - 0.08, tmpV.z - 0.14, 0.6)
        } else if (laugh > 0.3 && r[3] > 0.6) {
          // A hand slapping the desk.
          a.reach('r', 1, sx + 0.12, handY + 0.04 + 0.08 * Math.abs(Math.sin(time * 7 + r[0] * 4)), deskZ + 0.05, 0.5)
          a.reach('l', 0.8, sx - 0.15, handY, deskZ + 0.12, 0.5)
        } else {
          a.reach('r', 1 - laugh * 0.7, wx, handY, wz, 0.45)
          a.reach('l', 1 - laugh * 0.7, sx - 0.15, handY, deskZ + 0.12, 0.5)
        }
      }
      a.apply(time, true)
      const j = person.figure.joints
      j.head.rotation.x += g.pitch
      if (laugh > 0) {
        // Shoulders and head shaking.
        const sh = Math.sin(time * 14 + r[0] * 6) * 0.05 * laugh
        j.chest.rotation.x += sh
        j.head.rotation.x += sh * 0.8
      }
      person.face({ open: laugh * (0.5 + 0.4 * Math.abs(Math.sin(time * 9 + r[2] * 3))), smile: laugh })
      person.eyesTo(laugh > 0.5 ? 0.45 : 0, g.eyes, g.eyesPitch)
      person.hang()
    }
  }

  /** Where the eyes of the class go while the three walk (the nearest of them). */
  private processionPoint(p: number) {
    const c = this.s.cast
    if (p < at('walk')) return { x: 3.4, z: 2.6 }
    if (p < at('lineUp')) {
      const t = W(p, 'walk', 0, 1)
      // A wave: from the back-right to the front-right.
      return { x: 3.4, z: lerp(2.0, -2.6, ss(t)) }
    }
    void c
    return { x: 2.9, z: -2.75 }
  }

  // ——————————————————————————————————————————————— Salim, İbrahim, Eren

  private trio(p: number, f: SetFrame) {
    const c = this.s.cast
    const time = f.time
    this.salim(p, c.salim, time)
    this.ibrahim(p, c.ibrahim, time, f.flags)
    this.eren(p, c.eren, time)
  }

  private seated(person: Person, seat: { x: number; z: number }, pose: Pose) {
    const a = person.actor
    a.place(seat.x, seat.z + SEAT_DZ, PI).hold(pose)
    a.y = SEAT_Y
    return a
  }

  private salim(p: number, S: Person, time: number) {
    const a = S.actor.begin()
    let face = { open: 0, smile: 0 }
    let pitch = 0
    let eyesPitch = 0
    const shut = 0
    const lap = tmpV.set(SALIM_SEAT.x - 0.02, 0.62, SALIM_SEAT.z - 0.2)
    if (p < at('rise', 0.06)) {
      if (p < at('under', 0.45)) {
        this.seated(S, SALIM_SEAT, K.K_LOW)
        // Smoothing the sheet in his lap, under the desk.
        const sw = Math.sin(time * 2.2) * 0.04
        a.reach('l', 1, lap.x - 0.07 + sw, lap.y + 0.01, lap.z, 0.4)
        a.reach('r', 1, lap.x + 0.07 + sw, lap.y + 0.01, lap.z + 0.02, 0.4)
        pitch = 0.12
      } else if (p < at('fold')) {
        // Turned half round to the back row: conspiring.
        this.seated(S, SALIM_SEAT, K.K_TURNED)
        a.reach('l', 0.7, lap.x - 0.05, lap.y + 0.02, lap.z + 0.05, 0.4)
        face = { open: 0.1, smile: 0.6 }
      } else if (p < at('pass')) {
        // Folding: hands on the paper (the plane state follows the same clock).
        this.seated(S, SALIM_SEAT, K.K_FOLD)
        const pl = this.s.plane.root
        pl.getWorldPosition(tmpV2)
        const fold = W(p, 'fold', 0, 1)
        const work = Math.sin(time * 4) * 0.01
        a.reach('l', 1, tmpV2.x - 0.09, tmpV2.y + 0.01, tmpV2.z + 0.04 + work, 0.4)
        a.reach('r', 1, tmpV2.x + 0.09, tmpV2.y + 0.01, tmpV2.z + 0.03 - work, 0.4)
        pitch = 0.08
        if (fold >= 0.5 && fold < 0.76) face = { open: 0.22, smile: 0.1 }
        if (fold >= 0.76) {
          // The finished dart: his head comes up a little, the proud grin.
          face = { open: 0.15, smile: 1 }
          pitch = -0.2 * ss(clamp((fold - 0.76) / 0.1))
        }
      } else if (p < at('pass', 0.2)) {
        // Passing it back over his shoulder.
        this.seated(S, SALIM_SEAT, K.K_TURNED)
        const t = ss(W(p, 'pass', 0.0, 0.1))
        a.reach('r', 1 - W(p, 'pass', 0.12, 0.2), lerp(SALIM_SEAT.x + 0.1, EREN_SEAT.x - 0.1, t), lerp(0.85, 0.95, t), lerp(SALIM_SEAT.z - 0.1, SALIM_SEAT.z + 0.45, t), 0.6)
      } else if (p < at('anger', 0.46)) {
        // Watching, grinning; snickering in the whisper.
        this.seated(S, SALIM_SEAT, p < at('whisper') ? K.K_TURNED : K.K_LOW)
        const gig = between(p, at('aim', 0.2), at('flight')) ? 1 : 0
        face = { open: 0.1 * gig, smile: 0.7 }
        if (gig) S.figure.joints.chest.rotation.x += 0
        a.reach('l', 0.6, lap.x - 0.05, lap.y + 0.06, lap.z + 0.05, 0.4)
        a.reach('r', 0.6, lap.x + 0.06, lap.y + 0.06, lap.z + 0.05, 0.4)
      } else {
        // Innocent: studying the ceiling stain.
        this.seated(S, SALIM_SEAT, K.K_CEILING)
        a.lookAt(STAIN.x, STAIN.z, 0.4)
        eyesPitch = 0.25
        a.reach('l', 0.6, lap.x - 0.05, lap.y + 0.06, lap.z + 0.05, 0.4)
        a.reach('r', 0.6, lap.x + 0.06, lap.y + 0.06, lap.z + 0.05, 0.4)
      }
      this.chairs(p)
    } else if (p < at('walk')) {
      // Up and out, around the back, into the right lane (off-screen).
      const t = W(p, 'rise', 0.1, 0.8)
      if (t <= 0) {
        this.seated(S, SALIM_SEAT, K.K_UP)
        a.blend(
          [
            [0, K.K_UP],
            [1, K.S_HEAD_DOWN],
          ],
          ss(W(p, 'rise', 0.06, 0.1)),
        )
        a.y = SEAT_Y * (1 - ss(W(p, 'rise', 0.06, 0.1)))
      } else {
        a.walk(P_SALIM_OUT, t, K.S_HEAD_DOWN, PI, PI)
      }
    } else if (p < at('lineUp')) {
      a.walk(P_SALIM_DOWN, W(p, 'walk', 0.28, 0.92), K.S_HEAD_DOWN, PI, 0)
    } else {
      this.cornerPose(p, S, 'salim', time)
      face = this.cornerFace(p, S, 'salim', time)
      pitch = 0
    }
    a.apply(time, true)
    S.figure.joints.head.rotation.x += pitch
    // The whisper: heads together, eyes sliding toward Eren.
    const lean = this.whisperLean(p)
    S.figure.joints.head.rotation.z += 0.2 * lean
    S.eyesTo(shut, -0.45 * lean, eyesPitch)
    S.face(face)
    S.tongue(between(p, at('fold', 0.48), at('fold', 0.76)) ? 1 : 0)
  }

  private ibrahim(p: number, I: Person, time: number, flags: ReadonlySet<string>) {
    const a = I.actor.begin()
    let face = { open: 0, smile: 0 }
    let pitch = 0
    let shutL = 0
    // His ears: red from the turn on; deeper in the İbrahim branch of the glance.
    const red = ss(W(p, 'turn', 0.1, 0.4)) * 0.55 + (flags.has('look:ibrahim') ? ss(W(p, 'hush', 0.52, 0.75)) * 0.45 : 0)
    I.blush(p >= at('rise') ? red * (1 - ss(W(p, 'burst', 0.5, 1))) : red)
    if (p < at('rise', 0.06)) {
      const seatPose = p < at('under', 0.45) ? K.K_LOW : p < at('aim') ? K.K_CONSPIRE : p < at('flight', 0.1) ? K.K_AIM : p < at('anger', 0.46) ? K.K_UP : K.K_STILL
      this.seated(I, IBRAHIM_SEAT, seatPose)
      if (between(p, at('flight'), at('flight', 0.1))) {
        a.blend(
          [
            [0, K.K_AIM],
            [1, K.K_THROW],
          ],
          ss(W(p, 'flight', 0.0, 0.06)),
        )
      }
      if (p < at('under', 0.45)) {
        // Shoulders twitching with held-back laughter.
        a.reach('l', 0.8, IBRAHIM_SEAT.x - 0.12, DESK.top + 0.03, ROWS[3] + 0.1, 0.5)
        a.reach('r', 0.8, IBRAHIM_SEAT.x + 0.08, DESK.top + 0.03, ROWS[3] + 0.12, 0.5)
      } else if (p < at('aim')) {
        // Leaning in: at Salim while he folds, at Eren's pen while he writes.
        if (p < at('pass')) a.lookAt(SALIM_SEAT.x, SALIM_SEAT.z, 0.5)
        else a.lookAt(EREN_SEAT.x, EREN_SEAT.z - 0.4, 0.6)
        a.reach('l', 0.9, IBRAHIM_SEAT.x - 0.1, DESK.top + 0.03, ROWS[3] + 0.08, 0.5)
        a.reach('r', 0.9, IBRAHIM_SEAT.x + 0.14, DESK.top + 0.03, ROWS[3] + 0.06, 0.5)
        face = { open: 0.05, smile: 0.6 }
      } else if (p < at('flight', 0.1)) {
        // Aiming: the plane at eye level in the right hand, one eye closed (the cheek bunches).
        shutL = p < at('flight') ? ss(W(p, 'aim', 0.35, 0.5)) : 0
        face = { open: 0, smile: 0.3 }
        a.lookAt(FLIGHT.to.x, FLIGHT.to.z, 0.5)
        if (p < at('flight')) a.reach('r', ss(W(p, 'aim', 0.02, 0.14)), AIM_AT.x + 0.01, AIM_AT.y - 0.02, AIM_AT.z + 0.07, 0.4)
      } else if (p < at('anger', 0.46)) {
        face = { open: 0, smile: 0.2 }
      } else {
        pitch = 0.18
      }
      if (p >= at('anger', 0.46) && p < at('rise')) {
        a.reach('l', 0.8, IBRAHIM_SEAT.x - 0.1, DESK.top + 0.03, ROWS[3] + 0.12, 0.5)
        a.reach('r', 0.8, IBRAHIM_SEAT.x + 0.08, DESK.top + 0.03, ROWS[3] + 0.12, 0.5)
      }
      if (p < at('under', 0.45)) pitch = 0.1 + 0.03 * Math.max(0, Math.sin(time * 9)) * Math.max(0, Math.sin(time * 1.3))
    } else if (p < at('walk')) {
      const t = W(p, 'rise', 0.14, 0.85)
      if (t <= 0) {
        this.seated(I, IBRAHIM_SEAT, K.S_HEAD_DOWN)
        a.blend(
          [
            [0, K.K_STILL],
            [1, K.S_HEAD_DOWN],
          ],
          ss(W(p, 'rise', 0.06, 0.12)),
        )
        a.y = SEAT_Y * (1 - ss(W(p, 'rise', 0.06, 0.12)))
      } else a.walk(P_IBRAHIM_OUT, t, K.S_HEAD_DOWN, PI, PI)
    } else if (p < at('lineUp', 0.12)) {
      a.walk(P_IBRAHIM_DOWN, clamp((p - at('walk', 0.18)) / (at('lineUp', 0.12) - at('walk', 0.18))), K.S_HEAD_DOWN, PI, 0)
    } else {
      this.cornerPose(p, I, 'ibrahim', time)
      face = this.cornerFace(p, I, 'ibrahim', time)
    }
    a.apply(time, true)
    I.figure.joints.head.rotation.x += pitch
    const lean = this.whisperLean(p)
    I.figure.joints.head.rotation.z -= 0.2 * lean
    I.eyesTo(0, -0.45 * lean, 0)
    if (shutL > 0) I.eyesTo(shutL, 0, 0, 'l')
    I.face(face)
  }

  private eren(p: number, E: Person, time: number) {
    const a = E.actor.begin()
    let pitch = 0
    let shut = 0
    let face = { open: 0, smile: 0 }
    const ch = this.chairPose(p)
    // He sits in the chair wherever the chair is.
    a.place(ch.x, ch.z + Math.cos(ch.yaw) * 0.0, ch.yaw)
    a.y = 0.02
    const desk = ch.atDesk
    if (desk && p < at('rise', 0.1)) {
      let pose: Pose = K.E_CHAIR
      // Upper body at the desk: as the others, but his own.
      pose = p < at('under', 0.45) ? mix(K.E_CHAIR, K.K_LOW) : p < at('pass') ? mix(K.E_CHAIR, K.K_CONSPIRE) : p < at('aim') ? mix(K.E_CHAIR, K.K_PEN) : p < at('anger', 0.46) ? mix(K.E_CHAIR, K.K_UP) : mix(K.E_CHAIR, K.K_STILL)
      a.hold(pose)
      const dz = ROWS[3]
      if (between(p, at('pass'), at('pass', 0.95))) {
        // Writing on the wing: the cap in his teeth (0.15), the pen along the wing (0.3–0.7); shoulders shaking.
        const pl = this.s.plane.root
        pl.getWorldPosition(tmpV2)
        const wr = W(p, 'pass', 0.3, 0.7)
        const cap = W(p, 'pass', 0.12, 0.2) - W(p, 'pass', 0.22, 0.3)
        if (cap > 0) {
          E.figure.joints.head.getWorldPosition(tmpV)
          a.reach('r', ss(cap), tmpV.x - 0.02, tmpV.y + 0.0, tmpV.z - 0.12, 0.5)
        } else a.reach('r', 1, tmpV2.x + 0.04 - wr * 0.08, tmpV2.y + 0.02, tmpV2.z - 0.06 + wr * 0.14, 0.45)
        a.reach('l', 1, tmpV2.x - 0.1, tmpV2.y + 0.01, tmpV2.z + 0.05, 0.45)
        // Biting his lip, shoulders shaking with the laugh he holds in.
        pitch = 0.06 + 0.03 * Math.sin(time * 13) * W(p, 'pass', 0.35, 0.45) * (1 - W(p, 'pass', 0.8, 0.9))
        face = { open: cap > 0 ? 0.35 : 0, smile: 0.5 }
        if (between(p, at('pass', 0.3), at('pass', 0.75))) E.figure.joints.chest.rotation.x += 0
      } else {
        a.reach('r', 0.9, ch.x + 0.06, DESK.top + 0.03, dz + 0.1, 0.45)
        a.reach('l', 0.9, ch.x - 0.13, DESK.top + 0.03, dz + 0.12, 0.45)
      }
      if (p < at('under', 0.45)) pitch = 0.08
      // Conspiring: leaning in toward Salim.
      if (between(p, at('under', 0.45), at('pass'))) a.lookAt(SALIM_SEAT.x, SALIM_SEAT.z, 0.5)
      // Anger: looking down. From the shout on: head up, level, at the teacher.
      if (p >= at('turn', 0.5) && p < at('rise')) {
        const t = ss(W(p, 'turn', 0.5, 0.7))
        a.lookAt(AT_BOARD.turned.x, AT_BOARD.turned.z, 0.4 * t)
        pitch = lerp(0.12, -0.12, t)
      }
    } else {
      // In the chair, away from the desk: hands on the rims; in the corner, looking out at the room.
      a.hold(K.E_CHAIR)
      this.handsOnRims(a, ch, 1)
      if (!desk) {
        // From the corner: his eyes move slowly across the room (still), he blinks once (0.75).
        const sweep = p >= at('still') && p < at('flow') ? Math.sin((p - at('still')) * 160) * 0.35 : 0
        a.lookAt(0, 0.5, 0)
        E.figure.joints.head.rotation.y += 0
        pitch = -0.04
        shut = p >= at('still', 0.74) && p < at('still', 0.77) ? 1 : 0
        this.erenEyes = sweep
      }
    }
    // Eren never breathes visibly from the reveal on: everything else moves, he does not.
    const still = p >= at('reveal')
    a.apply(time, !still)
    E.figure.joints.head.rotation.x += pitch
    E.eyesTo(shut, still ? this.erenEyes : 0, 0)
    E.face(face)
  }
  private erenEyes = 0

  private handsOnRims(a: Person['actor'], ch: { x: number; z: number; yaw: number }, w: number) {
    // The hand rims, a little in front of the top (45°): the arms rest down and forward, relaxed,
    // instead of spreading out sideways.
    for (const side of [-1, 1] as const) {
      const lx = side * (CHAIR.rimX + 0.01)
      const lz = CHAIR.axleZ + CHAIR.rimR * 0.66
      const ly = CHAIR.wheelR + CHAIR.rimR * 0.75
      const c = Math.cos(ch.yaw)
      const s = Math.sin(ch.yaw)
      const wx = ch.x + lx * c + lz * s
      const wz = ch.z - lx * s + lz * c
      // Facing +z, the figure's right hand is on −x.
      a.reach(side < 0 ? 'r' : 'l', w, wx, ly, wz, 0.3)
    }
  }

  /** Salim and İbrahim at the bin corner: on two feet, then one, wobbling; whispering; the laugh; the lapse; the bell. */
  private cornerPose(p: number, P: Person, who: 'salim' | 'ibrahim', time: number) {
    const a = P.actor
    const home = CORNER[who]
    const L = lapse(p)
    const sec = wallClock(p)
    a.place(home.x, home.z, 0)
    const liftAt = who === 'salim' ? at('lift', 0.06) : at('lift', 0.33)
    const one = who === 'salim' ? K.SALIM_ONE_R : K.IBRAHIM_ONE_L
    const lifted = ss(clamp((p - liftAt) / (at('lift', who === 'salim' ? 0.14 : 0.4) - liftAt)))
    let pose: Pose = K.S_HEAD_DOWN
    if (lifted > 0) {
      a.blend(
        [
          [0, K.S_HEAD_DOWN],
          [1, one],
        ],
        lifted,
      )
      pose = one
    } else a.hold(K.S_HEAD_DOWN)
    // Wobble.
    const wob = Math.sin(time * (who === 'salim' ? 3.1 : 2.4)) * 0.05 + Math.sin(time * 7.3) * 0.015
    a.x += wob * 0.2 * lifted
    if (lifted > 0) a.pose[2 + 0 * 3 + 2] += wob * lifted
    // İbrahim's hand slaps the wall for balance (lift 0.35–0.4).
    if (who === 'ibrahim' && between(p, at('lift', 0.34), at('lift', 0.5))) a.reach('r', ss(W(p, 'lift', 0.34, 0.38)) * (1 - ss(W(p, 'lift', 0.42, 0.5))), home.x + 0.25, 1.1, -3.47, 0.6)
    // Burst: heads together, then losing balance; Salim grabs İbrahim, İbrahim the bin.
    if (p >= at('burst')) {
      const lean = ss(W(p, 'burst', 0.04, 0.12)) * (1 - ss(W(p, 'burst', 0.44, 0.5)))
      const s = who === 'salim' ? 1 : -1
      a.look = s * -0.7 * lean
      if (lean > 0) {
        P.figure.joints.spine.rotation.z += 0
      }
      const lost = ss(W(p, 'burst', 0.46, 0.55))
      if (lost > 0 && p < at('flow', 0.25)) {
        const other = who === 'salim' ? this.s.cast.ibrahim : this.s.cast.salim
        other.figure.joints.chest.getWorldPosition(tmpV)
        if (who === 'salim') {
          // Salim: a hand on İbrahim's shoulder, the other on the bin's rim (it rocks, it does not fall).
          a.reach('r', lost, tmpV.x + 0.12, tmpV.y + 0.08, tmpV.z + 0.02, 0.5)
          a.reach('l', lost, BIN.x - 0.13, 0.44, BIN.z + 0.06, 0.4)
        } else {
          // İbrahim: clutching Salim's side, the other hand on his stomach, laughing.
          a.reach('l', lost, tmpV.x - 0.12, tmpV.y - 0.12, tmpV.z + 0.04, 0.5)
          a.reach('r', lost, home.x - 0.03, 0.84, home.z + 0.15, 0.5)
        }
      }
    }
    // Time-lapse: switching feet again and again.
    if (L > 0.02 && p < at('end', 0.6)) {
      const flip = Math.floor(sec / 37 + (who === 'salim' ? 0 : 0.5)) % 2 === 0
      a.hold(who === 'salim' ? (flip ? K.SALIM_ONE_L : K.SALIM_ONE_R) : flip ? K.IBRAHIM_ONE_R : K.IBRAHIM_ONE_L)
    }
    // The bell: feet down, and off to their bags.
    if (p >= at('end', 0.6)) {
      const t = W(p, 'end', 0.62, 0.95)
      const path = who === 'salim' ? makePath([[home.x, home.z], [3.4, -1.5], [3.45, 1.2]]) : makePath([[home.x, home.z], [3.35, -1.8], [3.4, 2.0]])
      if (t > 0) a.walk(path, t, STAND, 0, PI / 2)
      else a.hold(STAND)
    }
    void pose
  }

  /** Burst 0.04–0.44: Salim's and İbrahim's heads together, whispering. */
  private whisperLean(p: number) {
    return ss(W(p, 'burst', 0.04, 0.12)) * (1 - ss(W(p, 'burst', 0.44, 0.5)))
  }

  private cornerFace(p: number, P: Person, who: 'salim' | 'ibrahim', time: number) {
    if (p < at('burst')) return { open: 0, smile: who === 'salim' ? 0.2 : 0 }
    if (p < at('burst', 0.45)) return { open: 0.1 + 0.08 * Math.abs(Math.sin(time * 11)), smile: 0.6 }
    if (p < at('flow', 0.3)) {
      const l = 1 - ss(W(p, 'still', 0.3, 1)) * 0.6
      return { open: (0.5 + 0.4 * Math.abs(Math.sin(time * 9 + (who === 'salim' ? 0 : 1)))) * l, smile: l }
    }
    void P
    return { open: 0, smile: 0.2 }
  }

  /** Salim's and İbrahim's chairs scrape back when they stand (the only two that do). */
  private chairs(p: number) {
    const ch = this.s.furniture.chairs
    const back = ss(W(p, 'rise', 0.04, 0.09))
    const s = ch.get('salim')
    if (s) s.position.z = SALIM_SEAT.z + 0.1 * back
    const i = ch.get('ibrahim')
    if (i) i.position.z = IBRAHIM_SEAT.z + 0.1 * back
  }

  // ——————————————————————————————————————————————— the wheelchair

  /** The chair's place: under Eren's desk, then (off-screen) down the lane to the corner. */
  private chairPose(p: number): { x: number; z: number; yaw: number; atDesk: boolean; dist: number } {
    if (p < at('rise', 0.1)) return { x: EREN_SEAT.x, z: EREN_SEAT.z, yaw: PI, atDesk: true, dist: 0 }
    const S = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0, phase: 0, amount: 0 }
    if (p < at('walk')) {
      const t = ss(W(p, 'rise', 0.1, 0.7))
      const s = pointOn(P_EREN_OUT, t, S)
      // Backing out first, then turning into the lane.
      const yaw = t < 0.25 ? PI : angleLerp(PI, -PI / 2 - 0.0001, ss((t - 0.25) / 0.4))
      return { x: s.x, z: s.z, yaw: t < 0.25 ? PI : yaw + PI, atDesk: false, dist: s.dist }
    }
    if (p < at('walk', 0.75)) {
      const t = ss(W(p, 'walk', 0.0, 0.7))
      const s = pointOn(P_EREN_DOWN, t, S)
      return { x: s.x, z: s.z, yaw: PI, atDesk: false, dist: s.dist + 4 }
    }
    // The last turn, then backing into the corner, facing the class.
    const t = ss(W(p, 'walk', 0.75, 1))
    return { x: CORNER.eren.x, z: lerp(-2.35, CORNER.eren.z, t), yaw: angleLerp(PI, 0.0001, t), atDesk: false, dist: 9 + t }
  }

  /** The bin rocks when Salim grabs it (burst 0.48), and settles. */
  private binRock(p: number) {
    const t = p - at('burst', 0.48)
    const span = at('burst', 0.75) - at('burst', 0.48)
    const k = t > 0 && t < span ? Math.sin((t / span) * PI * 5) * 0.09 * (1 - t / span) : 0
    this.s.furniture.bin.rotation.z = k
  }

  private wheelchair(p: number) {
    this.binRock(p)
    const C = this.s.chair
    const ch = this.chairPose(p)
    C.root.position.set(ch.x, 0, ch.z)
    C.root.rotation.y = ch.yaw
    C.roll(ch.dist)
    // No shadow of it reaches a frame before the reveal.
    C.setShadows(p >= at('lift', 0.6))
  }

  // ——————————————————————————————————————————————— the plane (and the rolling pen)

  private planeState(p: number, f: SetFrame) {
    const P = this.s.plane
    const root = P.root
    const c = this.s.cast
    // The pen that rolls in hush (0.02–0.14), then stops at the edge of the notebook.
    const pen = this.s.furniture.pen
    if (pen.userData.home === undefined) pen.userData.home = pen.position.clone()
    const roll = ss(W(p, 'hush', 0.02, 0.14))
    const home = pen.userData.home as THREE.Vector3
    pen.position.set(home.x + 0.08 * roll, home.y, home.z)
    pen.rotation.y = roll * 4.5
    c.teacher.figure.rGrip.getWorldPosition(this.lastGrip)
    // In his hands, the plane leads (placed before the teacher moved): see planeLead.
    if (this.led) return
    root.visible = true
    let fold: PlaneFold = SHEET
    let written = 0

    if (p < at('fold')) {
      // A sheet in Salim's lap, under the desk (print side up, red ink on it).
      // (Across his lap — long side along the desk — so it stays clear of his belly and of the desk's edge.)
      root.position.set(SALIM_SEAT.x - 0.02, 0.62, SALIM_SEAT.z - 0.2)
      root.rotation.set(0.1, PI / 2 + 0.12 + Math.sin(f.time * 2.2) * 0.02, 0)
      fold = SHEET
    } else if (p < at('pass')) {
      const u = W(p, 'fold', 0, 1)
      // Middle crease 0.05–0.2 (folded and opened), corners 0.25–0.42, in half + wings 0.55–0.72.
      const crease = Math.sin(clamp((u - 0.05) / 0.15) * PI) * 0.92 + ss(clamp((u - 0.55) / 0.08))
      fold = {
        crease: clamp(crease),
        corners: ss(clamp((u - 0.25) / 0.17)),
        wings: ss(clamp((u - 0.63) / 0.09)),
        crush: 0,
        peek: 0,
      }
      const done = ss(clamp((u - 0.76) / 0.1))
      // Held up at the desk's back edge (just below the desktop, behind it), where the folds can be seen.
      root.position.set(SALIM_SEAT.x - 0.02, lerp(0.655, 0.715, done), lerp(SALIM_SEAT.z - 0.2, SALIM_SEAT.z - 0.24, done))
      // Flat sheet: across his lap; the dart: turned in his hands, nose forward and up over the desk's
      // back edge (his proud grin above it).
      root.rotation.set(lerp(0.06, 0.28, done), lerp(PI / 2 + 0.12, PI, done), 0)
    } else if (p < at('aim')) {
      fold = DART
      const u = W(p, 'pass', 0, 1)
      written = W(p, 'pass', 0.3, 0.72)
      if (u < 0.12) {
        // Over Salim's shoulder to Eren's desk.
        const t = ss(u / 0.12)
        root.position.set(lerp(SALIM_SEAT.x + 0.1, EREN_SEAT.x - 0.12, t), lerp(0.85, 0.82, t) + Math.sin(t * PI) * 0.12, lerp(SALIM_SEAT.z - 0.05, ROWS[3] + 0.12, t))
        root.rotation.set(0, PI, 0)
      } else {
        // On Eren's desk, the wing angled away from the camera: the letters cannot be read.
        root.position.set(EREN_SEAT.x - 0.1, DESK.top + 0.045, ROWS[3] + 0.1)
        root.rotation.set(0, PI * 0.85, -0.5)
      }
    } else if (p < at('flight', 0.06)) {
      // İbrahim holds it at eye level, lined up on the teacher's head.
      fold = DART
      written = 1
      if (p < at('aim', 0.12)) {
        const t = ss(W(p, 'aim', 0, 0.12))
        root.position.set(lerp(EREN_SEAT.x - 0.1, AIM_AT.x, t), lerp(DESK.top + 0.045, AIM_AT.y, t) + Math.sin(t * PI) * 0.06, lerp(ROWS[3] + 0.1, AIM_AT.z, t))
      } else root.position.copy(AIM_AT)
      aimAt(root, FLIGHT.to)
    } else if (p < at('flight', 0.44)) {
      // The flight down the runway (slow motion): a slight rise, a last dip.
      fold = DART
      written = 1
      const t = clamp((p - at('flight', 0.06)) / (at('flight', 0.44) - at('flight', 0.06)))
      flightPoint(t, root.position)
      flightPoint(Math.min(1, t + 0.02), tmpV)
      aimAt(root, tmpV)
      root.rotateZ(Math.sin(t * 7) * 0.08)
    } else if (p < at('smooth', 0.08)) {
      // Nose crushed on his head; it drops, spinning, to his heel.
      fold = { ...DART, crush: 1 }
      written = 1
      const t = clamp((p - at('flight', 0.44)) / (at('flight', 0.7) - at('flight', 0.44)))
      const e = t * t
      root.position.set(lerp(FLIGHT.to.x, FLIGHT.floor.x, t), lerp(FLIGHT.to.y, FLIGHT.floor.y + 0.03, e), lerp(FLIGHT.to.z, FLIGHT.floor.z, t))
      root.rotation.set(-0.3 + t * 0.3, 0.6 + t * 5.5, t < 1 ? Math.sin(t * 9) * 0.6 : 0.22)
    } else if (p < at('end', 0.62)) {
      // In his right hand: picked up (smooth 0.12), then (after the inserts) pointed like a finger,
      // raised at the corner, lowered when the laugh comes.
      written = 1
      fold = { ...DART, crush: p < at('smooth', 0.3) ? 1 : 0.25, peek: 0 }
      const g = c.teacher.figure.rGrip
      g.getWorldPosition(root.position)
      if (p < at('smooth', 0.3)) {
        // (picked up at smooth 0.08, in the bend, below the frame)
        root.rotation.set(0.2, 0.6, 0.3)
      } else if (p < at('burst', 0.55)) {
        // Nose along the arm, at what he points at.
        aimAt(root, p < at('order') ? TRIO_AT : CORNER_AT)
        root.translateZ(0.06)
      } else {
        g.getWorldQuaternion(tmpQ)
        root.quaternion.copy(tmpQ)
        root.rotateX(-PI / 2)
        root.translateZ(0.08)
      }
    } else {
      // Into the cardigan pocket at the bell.
      const t = W(p, 'end', 0.62, 0.72)
      root.visible = t < 1
      fold = { ...DART, crush: 0.25, peek: 0 }
      written = 1
      c.teacher.figure.joints.hips.getWorldPosition(tmpV)
      root.position.copy(tmpV).add(tmpV2.set(0.15, 0.05 - t * 0.1, 0.05))
    }
    P.fold(fold)
    P.setWriting(written)
  }

  /**
   * The plane in both his hands (smooth 0.22 → summon 0.12, and rise): placed first, so that his
   * hands can take hold of it — at his chest while he smooths it, turned to the camera for the
   * inserts (the wing, the questions, the grade), slapped into his palm, turned over in `rise`.
   * Returns whether it placed the plane.
   */
  private planeLead(p: number, f: SetFrame, shot: Shot) {
    this.hands = 0
    const inHands = (p >= at('smooth', 0.14) && p < at('summon', 0.12)) || (p >= at('rise') && p < at('order'))
    if (!inHands) return false
    const P = this.s.plane
    const root = P.root
    root.visible = true
    const smoothK = ss(W(p, 'smooth', 0.22, 0.45))
    const peek = ss(W(p, 'tip', 0.4, 0.6)) * (1 - ss(W(p, 'mock', 0, 0.2)))
    P.fold({ ...DART, crush: lerp(1, 0.25, smoothK), peek })
    P.setWriting(1)
    const id = segmentAt(p).id as SegmentId
    const insert = (id === 'smooth' && p >= at('smooth', 0.5)) || id === 'tip'
    if (insert) {
      // The text a little left of the frame's center (the rail is on the right).
      const spot = this.textSpot(shot, tmpV3)
      if (id === 'smooth') P.present('wing', shot.pos, spot, 0.05)
      else {
        const k = ss(W(p, 'tip', 0.42, 0.62))
        P.present('questions', shot.pos, spot, -0.1)
        if (k > 0) {
          tmpQ.copy(root.quaternion)
          tmpV4.copy(root.position)
          P.present('grade', shot.pos, spot, 0.06)
          root.quaternion.slerpQuaternions(tmpQ, root.quaternion.clone(), k)
          root.position.lerpVectors(tmpV4, root.position.clone(), k)
        }
      }
      root.updateMatrixWorld(true)
      root.localToWorld(this.handL.set(0.06, -0.025, -0.125))
      root.localToWorld(this.handR.set(-0.06, -0.025, -0.125))
      this.hands = 1
      return true
    }
    // At his chest, nose to his right: he smooths the crushed nose between thumb and forefinger.
    tmpV3.copy(HELD)
    if (p < at('smooth', 0.26)) tmpV3.lerpVectors(this.lastGrip, HELD, ss(W(p, 'smooth', 0.14, 0.26)))
    if (between(p, at('summon'), at('summon', 0.12))) {
      // Slapped into the left palm.
      const s = ss(W(p, 'summon', 0.05, 0.1))
      tmpV3.x += 0.1 * s
      tmpV3.y -= 0.04 * s
    }
    root.position.copy(tmpV3)
    aimAt(root, tmpV4.copy(tmpV3).add(tmpV.set(-0.75, 0.3, 0.6)))
    if (p < at('smooth', 0.26)) {
      tmpQ.setFromEuler(tmpE.set(0.2, 0.6, 0.3))
      root.quaternion.slerp(tmpQ, 1 - ss(W(p, 'smooth', 0.14, 0.26)))
    }
    if (p >= at('rise')) {
      // He turns it over, flicks a speck of chalk off the wing (0.6); his eyes stay on it.
      root.rotateZ(PI * ss(W(p, 'rise', 0.12, 0.45)))
      root.rotateX(-0.25)
    }
    root.updateMatrixWorld(true)
    const rub = p < at('smooth', 0.47) ? Math.sin(f.time * 6) * 0.014 * smoothK * (1 - ss(W(p, 'smooth', 0.42, 0.47))) : 0
    root.localToWorld(this.handR.set(0.0, 0.01, 0.1 + rub))
    root.localToWorld(this.handL.set(0.0, -0.015, -0.11))
    if (p >= at('rise')) {
      const flick = W(p, 'rise', 0.56, 0.6) - W(p, 'rise', 0.62, 0.7)
      root.localToWorld(this.handR.set(-0.05 - 0.05 * flick, 0.02 + 0.06 * flick, 0.02))
    }
    this.hands = p < at('smooth', 0.26) ? ss(W(p, 'smooth', 0.14, 0.2)) : 1
    return true
  }

  /** A point on the line of sight, a little left of the frame's center. */
  private textSpot(shot: Shot, out: THREE.Vector3) {
    const d = tmpV.copy(shot.tgt).sub(shot.pos)
    const dist = d.length()
    d.normalize()
    const right = tmpV2.crossVectors(d, Y_UP).normalize()
    const half = dist * Math.tan((shot.fov * PI) / 360) * (16 / 9)
    return out.copy(shot.tgt).addScaledVector(right, -0.2 * half)
  }

  // ——————————————————————————————————————————————— the camera

  private camera(id: SegmentId, u: number, p: number, f: SetFrame, shot: Shot) {
    const keys = SHOTS[id]
    if (keys) keyed(keys, held(u, f.reduced), shot)
    // The chase down the runway (flight 0.06–0.44), then the settle.
    if (id === 'flight') {
      if (u >= 0.06 && u < 0.44) {
        const t = clamp((u - 0.06) / 0.38)
        flightPoint(t, tmpV)
        flightPoint(Math.min(1, t + 0.04), tmpV2)
        const dir = tmpV2.clone().sub(tmpV).normalize()
        shot.pos.copy(tmpV).addScaledVector(dir, -0.5)
        shot.pos.y += 0.07
        shot.tgt.copy(tmpV).addScaledVector(dir, 2)
        shot.fov = 40
      } else if (u < 0.06) {
        // The launch, from the aim angle.
        shot.pos.set(2.25, 1.26, 3.11)
        shot.tgt.set(1.42, 1.01, -2.8)
        shot.fov = 32
      } else {
        // The hit; then the settle: his frozen back, the plane by his heel.
        const t = ss(clamp((u - 0.44) / 0.14))
        flightPoint(1, tmpV)
        tmpV3.set(tmpV.x + 0.15, tmpV.y + 0.05, tmpV.z + 0.55)
        shot.pos.lerpVectors(tmpV3, tmpV2.set(1.75, 1.3, -0.75), t)
        tmpV3.copy(tmpV).add(tmpV4.set(0, 0, -1))
        shot.tgt.lerpVectors(tmpV3, tmpV2.set(0.86, 0.78, -2.75), t)
        shot.fov = lerp(40, 44, t)
      }
    }
    if (id === 'open') shot.fade = ss(clamp(u / 0.3))
    shot.locked = lockedAt(id, u)
    shot.handheld = id === 'flight' && u < 0.44 ? 0.4 : 1
    // Wide screens: keep the 16:9 width before the reveal (narrow the vertical fov instead).
    if (CLAMP_WIDE.has(id) && !(id === 'lift' && u >= 0.62)) {
      this.s.renderer.getSize(size)
      const aspect = size.x / Math.max(1, size.y)
      if (aspect > 16 / 9) shot.fov = (2 * Math.atan((Math.tan((shot.fov * PI) / 360) * (16 / 9)) / aspect) * 180) / PI
    }
    // The choice: after the answer, the view turns to where the reader looked; then a cut back to him.
    if (id === 'hush' && u >= 0.51 && u < 0.56) {
      const who = f.flags.has('look:salim') ? 'salim' : f.flags.has('look:ibrahim') ? 'ibrahim' : f.flags.has('look:eren') ? 'eren' : f.flags.has('look:desk') ? 'desk' : null
      if (who) {
        const t = who === 'salim' ? new THREE.Vector3(SALIM_SEAT.x, 1.14, SALIM_SEAT.z) : who === 'ibrahim' ? new THREE.Vector3(IBRAHIM_SEAT.x, 1.02, IBRAHIM_SEAT.z) : who === 'eren' ? new THREE.Vector3(EREN_SEAT.x, 1.02, EREN_SEAT.z) : new THREE.Vector3(0.42, 0.73, -0.02)
        const req = lookOffset(shot.pos, shot.tgt, t)
        // Salim: up to the stain he is studying.
        if (who === 'salim') req.pitch += 0.12
        this.reqId = `glance-${who}`
        shot.request = { id: this.reqId, yaw: req.yaw, pitch: req.pitch, seconds: 0.8 }
      }
    }
    // Development: a free camera for checking details and the set around a moment (window.__tekCam = {pos, tgt, fov}).
    if (process.env.NODE_ENV !== 'production') {
      const o = (globalThis as { __tekCam?: { pos: number[]; tgt: number[]; fov: number } }).__tekCam
      if (o) {
        shot.pos.fromArray(o.pos)
        shot.tgt.fromArray(o.tgt)
        shot.fov = o.fov
        shot.locked = false
        shot.request = null
      }
    }
    this.eye.copy(shot.pos)
    this.last.pos.copy(shot.pos)
    this.last.tgt.copy(shot.tgt)
    this.last.fov = shot.fov
    this.last.locked = shot.locked
    void p
  }

  // ——————————————————————————————————————————————— twist check (development only)

  private installSweep() {
    if (typeof window === 'undefined') return
    const w = window as unknown as Record<string, unknown>
    w.__tekSweep = (opts: { aspects?: number[]; yawStep?: number; pos?: number[]; tgt?: number[]; fov?: number; locked?: boolean } = {}) =>
      this.sweep({ pos: this.last.pos.toArray(), tgt: this.last.tgt.toArray(), fov: this.last.fov, locked: this.last.locked, ...opts })
    // Development: the set itself, for toggling parts while checking a frame.
    const parts = this.s.chair.parts
    const saved = parts.map((m) => m.material)
    const magenta = new THREE.MeshBasicMaterial({ color: 0xff00ff })
    const show = (on: boolean) => parts.forEach((m, i) => (m.material = on ? magenta : saved[i]))
    // Which chair parts show (for the current shot, look offset yaw/pitch, aspect): [index, center, px].
    const which = (yaw = 0, pitch = 0, aspect = 16 / 9) => {
      const out: Array<[number, number[], number]> = []
      parts.forEach((m, i) => {
        parts.forEach((q, k) => (q.visible = k === i))
        const r = this.sweep({ pos: this.last.pos.toArray(), tgt: this.last.tgt.toArray(), fov: this.last.fov, locked: false, aspects: [aspect], yawStep: 100, only: [yaw, pitch] })
        const px = r.reduce((a, b) => a + b.px, 0)
        if (px > 0) {
          m.geometry.computeBoundingBox()
          const c = m.geometry.boundingBox!.getCenter(new THREE.Vector3()).applyMatrix4(m.matrixWorld)
          out.push([i, c.toArray().map((v) => +v.toFixed(2)), px])
        }
      })
      parts.forEach((q) => (q.visible = true))
      return out
    }
    w.__tek = { scene: this.s.scene, light: this.s.light, cast: this.s.cast, chair: this.s.chair, plane: this.s.plane, last: this.last, magenta: show, which }
  }
  /** The last frame's shot (for the sweep). */
  private last = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), fov: 40, locked: false }

  /**
   * Renders the wheelchair in flat magenta (everything else as it is, as occluders) for the current
   * shot over look directions and aspect ratios; returns the magenta pixel count per case.
   */
  sweep(opts: { aspects?: number[]; yawStep?: number; free?: boolean; p?: number; pos?: number[]; tgt?: number[]; fov?: number; locked?: boolean; only?: [number, number] }) {
    const r = this.s.renderer
    const scene = this.s.scene
    const parts = this.s.chair.parts
    const magenta = new THREE.MeshBasicMaterial({ color: 0xff00ff })
    const saved = parts.map((m) => m.material)
    parts.forEach((m) => (m.material = magenta))
    const rt = new THREE.WebGLRenderTarget(192, 108)
    const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 100)
    const pos = new THREE.Vector3().fromArray(opts.pos ?? [0, 0, 0])
    const tgt = new THREE.Vector3().fromArray(opts.tgt ?? [0, 0, -1])
    const out: Array<{ aspect: number; yaw: number; pitch: number; px: number }> = []
    const aspects = opts.aspects ?? [0.46, 16 / 9, 2.37]
    const yaws: number[] = []
    const pitches: number[] = []
    if (opts.only) {
      yaws.push(opts.only[0])
      pitches.push(opts.only[1])
    } else if (opts.locked) {
      yaws.push(0)
      pitches.push(0)
    } else {
      for (let y = -PI; y < PI; y += opts.yawStep ?? 0.35) yaws.push(y)
      pitches.push(-0.95, -0.6, -0.3, 0, 0.3, 0.6)
    }
    const buf = new Uint8Array(192 * 108 * 4)
    const prevTone = r.toneMapping
    for (const aspect of aspects) {
      const h = 108
      const wpx = Math.max(16, Math.round(h * aspect))
      rt.setSize(wpx, h)
      const pix = new Uint8Array(wpx * h * 4)
      for (const yaw of yaws)
        for (const pitch of pitches) {
          cam.position.copy(pos)
          cam.lookAt(tgt)
          const fwd = new THREE.Vector3()
          cam.getWorldDirection(fwd)
          const by = Math.atan2(-fwd.x, -fwd.z)
          const bp = Math.asin(clamp(fwd.y, -1, 1))
          cam.quaternion.setFromEuler(new THREE.Euler(clamp(bp + pitch, -1.45, 1.45), by + yaw, 0, 'YXZ'))
          let fov = opts.fov ?? 40
          if (aspect > 16 / 9 && opts.locked) fov = (2 * Math.atan((Math.tan((fov * PI) / 360) * (16 / 9)) / aspect) * 180) / PI
          const t = Math.tan((fov * PI) / 360)
          const needW = t * Math.min(16 / 9, Math.max(aspect, 1.05))
          cam.fov = (Math.atan(Math.max(t, needW / aspect)) * 360) / PI
          cam.aspect = aspect
          cam.updateProjectionMatrix()
          r.setRenderTarget(rt)
          r.clear()
          r.render(scene, cam)
          r.readRenderTargetPixels(rt, 0, 0, wpx, h, pix)
          let n = 0
          for (let i = 0; i < wpx * h; i++) if (pix[i * 4] > 200 && pix[i * 4 + 1] < 80 && pix[i * 4 + 2] > 200) n++
          if (n > 0) out.push({ aspect: +aspect.toFixed(2), yaw: +yaw.toFixed(2), pitch, px: n })
        }
    }
    void buf
    r.toneMapping = prevTone
    r.setRenderTarget(null)
    rt.dispose()
    parts.forEach((m, i) => (m.material = saved[i]))
    magenta.dispose()
    return out
  }

  dispose() {
    this.chalk.geometry.dispose()
    this.chalkBit.geometry.dispose()
    this.diagram.geometry.dispose()
    ;(this.diagram.material as THREE.Material).dispose()
    this.diagramCanvas.texture.dispose()
  }
}

// ——————————————————————————————————————————————— helpers

function mix(a: Pose, b: Pose): Pose {
  // Upper body from b, legs and hips from a (Eren: the chair's legs, the class's shoulders).
  const out = new Float32Array(a)
  const upper = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  for (const j of upper) for (let k = 0; k < 3; k++) out[2 + j * 3 + k] = b[2 + j * 3 + k]
  return out
}

const twists = new Map<number, Pose>()
function makeTwist(amount: number) {
  let p = twists.get(amount)
  if (!p) {
    p = makePose({ spine: [0.02, amount, 0], chest: [0, amount * 0.8, 0], lUpper: [0.1, 0, 0.25], rUpper: [-0.1, 0, -0.3], lFore: [-0.3, 0, 0], rFore: [-0.5, 0, 0] }, K.T_STAND)
    twists.set(amount, p)
  }
  return p
}

function pointOn(path: Path, s: number, out: { x: number; z: number; yaw: number; dist: number; speed: number }) {
  const d = clamp(s) * path.total
  let i = 1
  while (i < path.cum.length - 1 && path.cum[i] < d) i++
  const a = path.pts[i - 1]
  const b = path.pts[i]
  const seg = path.cum[i] - path.cum[i - 1] || 1
  const t = (d - path.cum[i - 1]) / seg
  out.x = a[0] + (b[0] - a[0]) * t
  out.z = a[1] + (b[1] - a[1]) * t
  out.yaw = Math.atan2(b[0] - a[0], b[1] - a[1])
  out.dist = d
  return out
}

/** The plane's way: from İbrahim's hand down the runway to the back of the teacher's head. */
function flightPoint(t: number, out: THREE.Vector3) {
  const a = FLIGHT.from
  const b = FLIGHT.to
  const e = t
  out.set(lerp(a.x, b.x, e), lerp(a.y, b.y, e) + Math.sin(t * PI) * 0.22 - Math.max(0, t - 0.82) * 0.25, lerp(a.z, b.z, e))
  return out
}

/** Points the plane's nose (+z) at a world point, wings level. */
function aimAt(root: THREE.Object3D, target: THREE.Vector3) {
  root.updateMatrixWorld()
  root.getWorldPosition(tmpV)
  tmpM.lookAt(target, tmpV, new THREE.Vector3(0, 1, 0))
  root.quaternion.setFromRotationMatrix(tmpM)
}

/** The look offset (yaw, pitch) that turns a shot's view toward a point. */
function lookOffset(pos: THREE.Vector3, tgt: THREE.Vector3, point: THREE.Vector3) {
  const f = tgt.clone().sub(pos).normalize()
  const d = point.clone().sub(pos).normalize()
  const by = Math.atan2(-f.x, -f.z)
  const bp = Math.asin(clamp(f.y, -1, 1))
  const ty = Math.atan2(-d.x, -d.z)
  const tp = Math.asin(clamp(d.y, -1, 1))
  return { yaw: wrap(ty - by), pitch: tp - bp }
}

export { R_EYE, SEAM_Z }
