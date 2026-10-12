/**
 * Shared staging for the acts of BEYİN-KÖKÜ: the light presets of every set
 * (the one rig, re-aimed and re-coloured), a few local poses, the crowd's
 * clothes, the Centre's mirror, and small curve helpers.
 *
 * Light scale: the stage uses legacy-sized intensities (points 1–4, spots
 * 2–16, sun 1–3, hemisphere 0.2–1.1).
 */
import * as THREE from 'three'
import { clamp, lerp, smoothstep } from '@/lib/math'
import { makePose } from '../figure/Figure'
import * as P from '../figure/poses'
import type { Director } from './BeyinKokuScene'
import { BED_SIT, STAFF } from './cast'

export const PI = Math.PI
export const S = smoothstep
export const L = lerp
export const C = clamp
/** A smooth pulse: up from a, back down by b. */
export const bump = (a: number, b: number, v: number) => {
  const m = (a + b) / 2
  return S(a, m, v) * (1 - S(m, b, v))
}
/** 1 inside [a, b), else 0. */
export const within = (a: number, b: number, v: number) => (v >= a && v < b ? 1 : 0)
/** The screenplay's Centre x, mirrored (the hall was built with the desk on the east). */
export const mx = (x: number) => 600 - x
export const yawTo = (dx: number, dz: number) => Math.atan2(dx, dz)
/** Facing directions (yaw 0 faces +z). */
export const FACE_S = 0
export const FACE_N = PI
export const FACE_E = PI / 2
export const FACE_W = -PI / 2
/** A quantised key for canvas redraws driven by time (n redraws per second). */
export const tick = (time: number, n = 6) => Math.floor(time * n)

const v = new THREE.Vector3()
const w = new THREE.Vector3()

/** The surgical lamp's face while it is on. */
export const LAMP_ON = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.5, 4.8, 5.4) })

// ——— Light presets ———

export const light = {
  /** The real lab at night: a cold rim from far above, cyan from the gutters, monitor light at the desk. */
  lab(d: Director, desk = 1, atrium = 1) {
    const r = d.rig
    r.hemiSet(0x18243a, 0x04060a, 0.3 * Math.max(desk * 0.8, atrium))
    r.keySet(0x9fb8e0, 2.8 * atrium, [1, 44, -20], [0, 0, -20], 0.42, 0.7, 80)
    r.pt(0, 0xcfe0ff, 1.8 * desk, [0, 1.35, -3.0], 4.5, 1.6)
    r.pt(1, 0x5fe0c0, 2.6 * atrium, [0, 0.4, -20], 26, 1.1)
    r.pt(2, 0xffb347, 0.9 * atrium, [4, 22, -22], 40, 1.0)
    r.spotSet(0x8fa6c8, 1.4 * desk, [0.4, 3.1, -2.6], [0, 0.8, -3.2], 0.75, 0.7, 6)
  },
  /** The flash set: the surgical lamp only, cold and overexposed; a little desk light when the desk is in the shot. */
  flash(d: Director, desk = 0) {
    const r = d.rig
    r.hemiSet(0x9fb0c8, 0x1a1e26, 0.12 + 0.3 * desk)
    r.keySet(0xf4f8ff, 16, [0, 3.0, -6.4], [0, 1.4, -7.0], 0.52, 0.35, 9)
    r.spotSet(0xdde8ff, 2.2, [0.6, 2.4, -4.2], [0, 1.4, -6.8], 0.6, 0.8, 8)
    r.pt(0, 0xcfe0ff, 2.4 * desk, [0, 1.35, -3.0], 4.5, 1.6)
    r.pt(1, 0xe8f0ff, 1.2, [-1.2, 2.2, -6.0], 5, 1.6)
  },
  /** The suburb's day: one soft sun that never moves (from the south-east), a bright sky. */
  day(d: Director, tx: number, tz: number, box = 16, i = 1) {
    const r = d.rig
    r.hemiSet(0xdff1ff, 0x9cc985, 0.78)
    r.sunSet(0xffe9c4, 2.0 * i, v.set(tx, 0.5, tz), w.set(0.55, 0.72, 0.42), box, 40)
  },
  /** Inside Levy's house by day: the same sun through the windows, a soft fixture. */
  house(d: Director, tx: number, tz: number, fx = 1) {
    const r = d.rig
    r.hemiSet(0xe6eef5, 0x8f8878, 0.62)
    r.sunSet(0xffe9c4, 1.5, v.set(tx, 0.8, tz), w.set(0.55, 0.72, 0.42), 7, 24)
    r.pt(0, 0xfff4e6, 1.6 * fx, [tx, 2.85, tz], 5, 1.6)
  },
  /** The bedroom at dawn: a low warm sun through the east window. */
  dawn(d: Director, i = 1) {
    const r = d.rig
    r.hemiSet(0xc9d8ea, 0x6b6258, 0.4)
    r.sunSet(0xffd2a0, 2.4 * i, v.set(104, 0.9, -4.2), w.set(1, 0.3, -0.2), 7, 24)
    r.pt(0, 0xffe6c8, 0.5 * i, [104.6, 1.5, -3.5], 4, 1.6)
  },
  /** Tuesday evening in the living room: the floor lamp and the television. */
  evening(d: Director, tvGlow = 1) {
    const r = d.rig
    r.hemiSet(0x3d4f78, 0x1b1a1f, 0.26)
    r.pt(0, 0xffd28a, 3.0, [105.4, 1.95, 3.4], 6, 1.6)
    r.pt(1, 0x9fc4ff, 2.2 * tvGlow, [103.5, 1.45, -0.5], 4.5, 1.6)
    r.keySet(0xffd9a8, 2.2, [105.4, 2.1, 3.4], [103.8, 0.6, 2.4], 0.9, 0.7, 6)
  },
  /** Wednesday morning with the curtains shut: grey-blue rooms; daylight waits outside. */
  grey(d: Director, tx: number, tz: number, door = 0) {
    const r = d.rig
    r.hemiSet(0x8da0b8, 0x50545a, 0.42)
    r.pt(0, 0xfff4e6, 1.8, [tx, 2.85, tz], 5, 1.6)
    r.sunSet(0xffe9c4, 1.8 * door, v.set(100, 1, 4.5), w.set(0.3, 0.7, 0.65), 6, 24)
  },
  /** The bus: daylight through the long windows. */
  bus(d: Director) {
    const r = d.rig
    r.hemiSet(0xdff1ff, 0x8f98a0, 0.85)
    r.sunSet(0xfff0d8, 1.3, v.set(170, 1, -60), w.set(0.2, 0.75, -0.6), 8, 24)
    r.pt(0, 0xf4f7ff, 1.2, [170, 2.1, -60], 6, 1.6)
  },
  /** The archive basement: fluorescent strips, high windows, the monitor. */
  office(d: Director, monitor = 1) {
    const r = d.rig
    r.hemiSet(0xd9d6cc, 0x6a6a66, 0.55)
    r.keySet(0xeef3ff, 3.0, [200, 2.55, -2.8], [200, 0.8, -3.0], 1.0, 0.8, 5)
    r.pt(0, 0xbfd3e0, 1.1 * monitor, [200, 1.2, -3.0], 2, 1.8)
    r.pt(1, 0xeef3ff, 1.5, [195, 2.5, -5], 8, 1.4)
  },
  /** The cantina at noon: sun through the big east window. */
  cantina(d: Director) {
    const r = d.rig
    r.hemiSet(0xfff4e0, 0x8a8678, 0.66)
    r.sunSet(0xfff0d0, 2.2, v.set(212, 1.0, -3.2), w.set(1, 0.75, -0.35), 9, 30)
    r.pt(0, 0xfff8ee, 1.2, [211, 2.9, -3], 8, 1.4)
  },
  /** The Centre: cool even daylight, through the glass front and from the panels. */
  centre(d: Director, garden = false) {
    const r = d.rig
    r.hemiSet(0xeef3ff, 0xcfd3d6, garden ? 0.9 : 1.0)
    r.sunSet(0xf4f7ff, garden ? 2.2 : 1.3, v.set(300, 0, garden ? 26 : 8), w.set(0.25, 0.85, 0.45), 22, 50)
    if (!garden) r.keySet(0xf8fbff, 2.0, [300, 6.8, 6], [300, 0, 6], 1.1, 0.9, 10)
  },
  /** The stairwell: one bare bulb. */
  stairs(d: Director) {
    const r = d.rig
    r.hemiSet(0x3a3a3a, 0x151515, 0.22)
    r.pt(0, 0xfff2d8, 3.5, [282, 6.3, -0.5], 14, 1.4)
    r.keySet(0xfff2d8, 5, [282, 6.35, -0.5], [282.5, 0, -1], 1.25, 0.8, 12)
  },
  /** The second floor's fluorescents around z; `on` dims them, `under` is the low green-white light of the tear. */
  floor2(d: Director, z: number, on = 1, under = 0) {
    const r = d.rig
    r.hemiSet(0xf4f7ff, 0xa0a4a8, 0.85 * on + 0.05)
    if (under > 0.01) r.keySet(0xc9ffd8, 7 * under, [400, 0.08, z + 1.2], [400, 1.9, z - 2.5], 1.0, 0.6, 9)
    else r.keySet(0xf6f8ff, 2.4 * on, [400, 2.95, z + 0.5], [400, 0, z], 1.0, 0.9, 6)
    r.spotSet(0xf0f3f8, 1.6 * on, [400, 2.95, z - 6], [400, 0, z - 6], 1.1, 0.9, 8)
    r.pt(0, 0xbfffcf, 2.5 * under, [400, 0.15, z - 1], 6, 1.6)
  },
  /** The stretcher room: the screens are the light; the vitals monitor from below; the tanks. */
  g(d: Director, screens = 1) {
    const r = d.rig
    r.hemiSet(0x202a36, 0x0a0c10, 0.22)
    r.pt(0, 0x9fc4ff, 3.5 * screens, [500, 2.4, -3.8], 11, 1.5)
    r.pt(1, 0xcfe0ff, 0.9, [500.45, 1.25, 2.25], 2.2, 1.6)
    r.pt(2, 0x9fe8c8, 2.5, [490.5, 1.0, -5.5], 9, 1.5)
    r.keySet(0xb8d0ff, 2.0 * screens, [500, 3.2, -4.6], [500, 1.3, 1.5], 0.7, 0.8, 12)
  },
  /** The small white room: soft and even. */
  small(d: Director, warm = 0) {
    const r = d.rig
    r.hemiSet(warm ? 0xfff6ea : 0xfdfdfb, 0xd9d2c8, 1.1)
    r.sunSet(warm ? 0xffefd8 : 0xfff6ea, 1.3, v.set(600, 0.8, 0), w.set(-0.7, 0.75, 0.25), 6, 20)
    r.pt(0, 0xfff8f0, 2.2, [600, 2.6, 0], 6, 1.6)
  },
}

// ——— Local poses ———

/** A slack body along a station board (the root is tilted with the board). */
export const LIE_BOARD = makePose({ lUpper: [0.05, 0, 0.12], rUpper: [0.05, 0, -0.12], lFore: [-0.15, 0, 0], rFore: [-0.15, 0, 0], head: [0.08, 0, 0], neck: [0.04, 0, 0] }, P.STAND)
/** The real body in the procedure chair: hips high on the seat, the torso on the tilted back, knees on the leg rest. */
export const CHAIR_REAL = makePose({
  hipY: 1.03,
  hips: [-0.78, 0, 0],
  spine: [0.02, 0, 0],
  chest: [0.02, 0, 0],
  neck: [0.05, 0, 0],
  head: [0.08, 0, 0],
  lThigh: [-0.32, 0, 0.08],
  rThigh: [-0.32, 0, -0.08],
  lShin: [0.15, 0, 0],
  rShin: [0.15, 0, 0],
  lFoot: [0.3, 0, 0],
  rFoot: [0.3, 0, 0],
  lUpper: [-0.35, 0, 0.15],
  rUpper: [-0.35, 0, -0.15],
  lFore: [-0.1, 0, 0],
  rFore: [-0.1, 0, 0],
})
/** Sitting up on the edge of the bed (the mattress is 0.55 above the floor). */
export const BED_EDGE = makePose({ hipY: 0.58 }, BED_SIT)
/** Standing, looking up the stairs. */
export const LOOK_UP = makePose({ neck: [-0.22, 0, 0], head: [-0.32, 0, 0] }, P.STAND)
/** Rigid: the body has gone stiff. */
export const STIFF = makePose({ lUpper: [0, 0, 0.05], rUpper: [0, 0, -0.05], head: [-0.12, 0, 0], spine: [-0.06, 0, 0], lHand: [0, 0, 0.3], rHand: [0, 0, -0.3] }, P.STAND)
/** A hand searching inside the jacket for the envelope. */
export const FUMBLE = makePose({ rUpper: [-0.5, 0.35, -0.25], rFore: [-2.05, 0, 0], rHand: [0.3, 0, 0], head: [0.15, 0, 0] }, P.STAND)
/** Seated, both hands on the table in front. */
export const SIT_TABLE = makePose({ lUpper: [-0.6, 0, 0.15], rUpper: [-0.6, 0, -0.15], lFore: [-1.25, 0.25, 0], rFore: [-1.25, -0.25, 0], head: [0.32, 0, 0], neck: [0.08, 0, 0] }, P.SIT)
/** Seated, the phone held up in the left hand, eyes on it. */
export const SIT_PHONE = makePose({ lUpper: [-0.75, 0, 0.2], lFore: [-1.95, 0.4, 0], lHand: [0.3, 0, 0], head: [0.36, 0, 0], neck: [0.1, 0, 0] }, P.SIT)
/** Seated and leaning back, eyes unfocused. */
export const SIT_UNFOCUSED = makePose({ head: [-0.06, 0.1, 0] }, P.SIT_BACK)
/** Standing with the hands loose, chin a little down (waiting at a desk). */
export const WAIT = makePose({ head: [0.06, 0, 0] }, P.STAND_EASY)
/** Staff walking: the device hand stays forward. */
export const STAFF_WALK = STAFF
/** Sitting in a bus seat, hands in the lap, eyes down. */
export const SIT_BUS = makePose({ head: [0.12, 0, 0], lUpper: [-0.3, 0, 0.1], rUpper: [-0.3, 0, -0.1], lFore: [-1.3, 0.3, 0], rFore: [-1.3, -0.3, 0] }, P.SIT)
/** Levy flat on the stretcher: arms at the sides, chin down, eyes closed (the acts set the lids). */
export const STRAPPED_SLACK = makePose({ head: [0.18, 0, 0], neck: [0.08, 0, 0] }, P.STAND)

// ——— Crowd clothes ———

export const WHITE = { top: 0xf2f2f0, bottom: 0xe9e9e6 }
/** Everyday clothes for the pool (top, bottom), twelve of them. */
export const CIVIL: Array<[number, number]> = [
  [0x5d6b8a, 0x3a3f4a],
  [0x8a6a5a, 0x4a4a4a],
  [0xa7b8c8, 0x5d6168],
  [0x6f8f6a, 0x3a3f4a],
  [0xc9a37a, 0x4f535a],
  [0x7a7f8a, 0x2e2e32],
  [0xb9a3d6, 0x6d7b8c],
  [0x9ec7b0, 0x5d6168],
  [0xd9b46a, 0x3a3f4a],
  [0x4a5a7a, 0x3a3a3a],
  [0xe3c2ac, 0x5d6168],
  [0x8a4a3a, 0x2e2e32],
]

/** A pool figure in everyday clothes (index k) or in a white uniform. */
export function extra(d: Director, i: number, kind: 'civil' | 'white' = 'civil') {
  if (kind === 'white') return d.pooled(i, WHITE.top, WHITE.bottom)
  const [t, b] = CIVIL[i % CIVIL.length]
  return d.pooled(i, t, b)
}

/** Reads a canvas-screen key for a segment moment (quantised u). */
export const uKey = (u: number, n = 40) => Math.round(u * n)
