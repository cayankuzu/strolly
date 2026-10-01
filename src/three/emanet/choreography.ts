/**
 * Who is where, doing what, holding what — as a pure function of story
 * progress. Each segment writes the whole state, so any frame can be
 * reached directly (reverse scroll, deep jumps, the rewind of the day).
 */
import * as THREE from 'three'
import { SEG, local, segmentAt, type SegmentId } from '@/stories/emanet/timeline'
import { angleLerp, clamp, lerp, smoothstep } from '@/lib/math'
import { evalBlend, type Key } from '@/lib/track'
import { addWalk, blendPose, makePose, type Pose } from '../figure/Figure'
import { makePath, walk, type Path, type Sample } from '../figure/paths'
import { yawTo } from '../util'
import { APT } from './Apartment'
import * as P from './cast'

const PI = Math.PI

export type Reach = { w: number; x: number; y: number; z: number; out: number }
export type Body = {
  x: number
  z: number
  yaw: number
  visible: boolean
  pose: Pose
  walking: number
  step: number
  /** Extra head turn toward someone, radians. */
  look: number
  /** How far the right hand's reach is pulled to the right ear (a phone call). */
  ear: number
  l: Reach
  r: Reach
}

/** An object that is either in someone's hand or at rest; `place` blends from hand (0) to rest (1). */
export type Held = { by: 'derin' | 'ege' | null; side: 'l' | 'r'; place: number; rest: THREE.Vector3; visible: boolean }

export type Choreo = {
  derin: Body
  ege: Body
  cup: Held & { steam: number }
  capsule: Held
  keys: Held
  /** Ege's phone; `upright` while it is at his ear. Derin's phone, for one choice. */
  phone: Held & { upright: boolean; lit: number }
  derinPhone: Held
  photo: { pos: THREE.Vector3; quat: THREE.Quaternion; visible: boolean }
  drawer: number
  handle: number
  windowHandle: number
  curtains: number
}

const reachOf = (): Reach => ({ w: 0, x: 0, y: 0, z: 0, out: 0.5 })
const bodyOf = (): Body => ({ x: 0, z: 0, yaw: 0, visible: true, pose: makePose({}), walking: 0, step: 0, look: 0, ear: 0, l: reachOf(), r: reachOf() })
const heldOf = (): Held => ({ by: null, side: 'r', place: 1, rest: new THREE.Vector3(), visible: true })

export const createChoreo = (): Choreo => ({
  derin: bodyOf(),
  ege: bodyOf(),
  cup: { ...heldOf(), steam: 1 },
  capsule: heldOf(),
  keys: heldOf(),
  phone: { ...heldOf(), upright: false, lit: 0.35 },
  derinPhone: heldOf(),
  photo: { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), visible: true },
  drawer: 0,
  handle: 0,
  windowHandle: 0,
  curtains: 0,
})

// ——— Places ———
const CONSOLE = { x: -1.32, z: 2.6 }
const SPOT = { x: -1.35, z: 0.35 }
const COUNTER = { x: -2.45, z: -2.42 }
const SET_CUP = { x: -2.5, z: -0.4 }
const WINDOW = { x: 3.92, z: -0.4 }
const NOON = { x: 3.98, z: 0.12 }
const DOOR = { x: -2.75, z: 2.62 }
const BOWL = { x: -2.3, z: 2.6 }
const DRAWER = { x: -1.78, z: 2.33 }
const SOFA = { x: 2.0, z: 2.42 }
const NEAR_EGE = { x: -1.15, z: -0.25 }
const EGE_SEAT = { x: APT.egeSeat.x, z: APT.egeSeat.z + 0.02 }

const D_ENTER = makePath([
  [CONSOLE.x, CONSOLE.z],
  [-1.05, 1.5],
  [SPOT.x, SPOT.z],
])
const D_WINDOW = makePath([
  [SPOT.x, SPOT.z],
  [0.6, 0.15],
  [3.0, -0.25],
  [WINDOW.x, WINDOW.z],
])
const D_DOOR = makePath([
  [WINDOW.x, WINDOW.z],
  [1.0, 1.4],
  [-1.6, 2.3],
  [DOOR.x, DOOR.z],
])
const D_BOWL = makePath([
  [DOOR.x, DOOR.z],
  [BOWL.x, BOWL.z],
])
const D_APPROACH = makePath([
  [SOFA.x, SOFA.z - 0.3],
  [0.6, 0.9],
  [-0.55, 0.05],
  [NEAR_EGE.x, NEAR_EGE.z],
])
const E_TABLE = makePath([
  [COUNTER.x, COUNTER.z],
  [-3.0, -1.7],
  [-2.95, -0.78],
  [SET_CUP.x, SET_CUP.z],
])

const TOWARD_EGE_SEAT = yawTo(EGE_SEAT.x - NEAR_EGE.x, EGE_SEAT.z - NEAR_EGE.z)
const TOWARD_COUNTER = yawTo(COUNTER.x - SPOT.x, COUNTER.z - SPOT.z)
const EGE_TO_DERIN = yawTo(SPOT.x - COUNTER.x, SPOT.z - COUNTER.z)
const TOWARD_SPOT = yawTo(APT.cupSpot.x - SET_CUP.x, APT.cupSpot.z - SET_CUP.z)

/** Where the grip sits relative to an object's origin when holding it. */
export const GRIP = { cup: 0.05, capsule: 0.02, keys: 0.012, phone: 0.0 }
const SLOT = new THREE.Vector3(APT.device.x, APT.device.y + 0.07, APT.device.z)
const KEYS_IN_BOWL = new THREE.Vector3(APT.bowl.x + 0.02, APT.bowl.y + 0.03, APT.bowl.z - 0.01)
const HANDLE = new THREE.Vector3(APT.handle.x - 0.04, APT.handle.y, APT.handle.z - 0.04)
const WINDOW_HANDLE = new THREE.Vector3(APT.x1 - 0.1, 1.0, 0.27)

const euler = new THREE.Euler(0, 0, 0, 'YXZ')
const qFlatDrawer = new THREE.Quaternion().setFromEuler(euler.set(-PI / 2, PI, 0))
const qHeld = new THREE.Quaternion().setFromEuler(euler.set(-0.47, PI, 0))
const qFlatTable = new THREE.Quaternion().setFromEuler(euler.set(-PI / 2, 0, 0.22))
const PHOTO_HELD = new THREE.Vector3(DRAWER.x - 0.02, 1.2, DRAWER.z + 0.36)
const PHOTO_TABLE = APT.photoTable.clone().setY(APT.photoTable.y + 0.007)

const walkS = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0, phase: 0, amount: 0 } as Sample & { phase: number; amount: number }

function place(b: Body, x: number, z: number, yaw: number) {
  b.x = x
  b.z = z
  b.yaw = yaw
  b.visible = true
  b.walking = 0
}

function pose(b: Body, keys: ReadonlyArray<Key<Pose>>, t: number) {
  const { a, b: next, t: k } = evalBlend(keys, t)
  blendPose(a, next, k, b.pose)
}

function hold(b: Body, p: Pose) {
  blendPose(p, p, 0, b.pose)
}

function walking(b: Body, path: Path, u: number, base: Pose, startYaw?: number, endYaw?: number) {
  walk(path, u, walkS, 0.18, 0.2, startYaw, endYaw)
  b.x = walkS.x
  b.z = walkS.z
  b.yaw = walkS.yaw
  b.visible = true
  hold(b, base)
  // Slippers: a shorter, softer stride.
  addWalk(b.pose, walkS.phase, walkS.amount * 0.82)
  b.step = Math.floor(walkS.phase / PI)
  b.walking = walkS.amount
}

function aim(r: Reach, w: number, x: number, y: number, z: number, out = 0.5) {
  r.w = w
  r.x = x
  r.y = y
  r.z = z
  r.out = out
}

function lookAt(b: Body, x: number, z: number, amount = 1) {
  let d = yawTo(x - b.x, z - b.z) - b.yaw
  d = Math.atan2(Math.sin(d), Math.cos(d))
  b.look = clamp(d, -1.1, 1.1) * amount
}

function setHeld(h: Held, by: Held['by'], side: Held['side'], placeAmt: number, rest: THREE.Vector3 | null, visible = true) {
  h.by = by
  h.side = side
  h.place = placeAmt
  if (rest) h.rest.copy(rest)
  h.visible = visible
}

const v = new THREE.Vector3()

const SHOES = { x: APT.shoes.x, z: APT.shoes.z }
const PILLS = { x: APT.pills.x, z: APT.pills.z }
const GLASSES = { x: APT.glasses.x, z: APT.glasses.z }
const DERIN_SEAT = APT.derinSeat
const DERIN_PHONE_REST = new THREE.Vector3(NEAR_EGE.x + 0.1, -1, NEAR_EGE.z)

/** Writes the full choreography for story progress `sp`; `flags` carry the reader's choices. */
export function choreograph(sp: number, c: Choreo, flags: ReadonlySet<string> = new Set()) {
  const seg = segmentAt(sp).id as SegmentId
  const u = local(sp, seg)
  const { derin: d, ege: e } = c
  d.look = e.look = 0
  d.ear = e.ear = 0
  d.l.w = d.r.w = e.l.w = e.r.w = 0
  d.step = e.step = 0
  d.walking = e.walking = 0

  // ——— Defaults that most segments keep ———
  setHeld(c.cup, null, 'r', 1, APT.cupSpot, true)
  c.cup.steam = 1 - smoothstep(SEG.curtain.start, SEG.drawer.start, sp)
  setHeld(c.capsule, null, 'r', 1, SLOT, true)
  setHeld(c.keys, null, 'r', 1, KEYS_IN_BOWL, sp >= SEG.doorCheck.start)
  setHeld(c.phone, null, 'r', 1, APT.phone, true)
  c.phone.upright = false
  c.phone.lit = 0.35
  setHeld(c.derinPhone, null, 'r', 1, DERIN_PHONE_REST, false)
  c.photo.visible = true
  c.photo.pos.copy(PHOTO_TABLE)
  c.photo.quat.copy(qFlatTable)
  c.drawer = 0
  c.handle = 0
  c.windowHandle = sp >= SEG.noon.end ? 1 : 0
  c.curtains = sp >= SEG.curtain.start ? 1 : 0.02
  if (sp < SEG.drawer.start) photoInDrawer(c, 0)

  // Ege, by default, at his place at the table.
  place(e, EGE_SEAT.x, EGE_SEAT.z, 0)
  hold(e, P.SIT_READ)

  switch (seg) {
    case 'open':
    case 'logo':
    case 'insert':
    case 'form': {
      place(d, CONSOLE.x, CONSOLE.z, 0)
      hold(d, P.STAND)
      setHeld(c.capsule, 'derin', 'r', 0, SLOT)
      setHeld(c.cup, null, 'r', 1, APT.counterCup)
      atCounter(e, 0)
      if (seg === 'insert') {
        pose(d, [
          [0.08, P.STAND],
          [0.4, P.LEAN_SOFT],
          [0.75, P.LEAN_SOFT],
          [0.95, P.STAND],
        ], u)
        // Hand to the slot, the capsule in, the hand away.
        const w = smoothstep(0.1, 0.4, u) * (1 - smoothstep(0.66, 0.9, u))
        const drop = smoothstep(0.42, 0.6, u)
        aim(d.r, w, SLOT.x, SLOT.y + GRIP.capsule + 0.06 * (1 - drop), SLOT.z, 0.3)
        c.capsule.place = smoothstep(0.56, 0.62, u)
      } else if (seg === 'form') {
        c.capsule.place = 1
        const turn = smoothstep(0.5, 0.85, u)
        d.yaw = angleLerp(0, PI, turn)
        d.z = CONSOLE.z - 0.08 * turn
      } else {
        // Before reading: the capsule waits in her hand.
        c.capsule.place = 0
      }
      break
    }

    case 'enter': {
      walking(d, D_ENTER, smoothstep(0, 0.62, u), P.STAND, PI, TOWARD_COUNTER)
      if (u > 0.62) {
        place(d, SPOT.x, SPOT.z, TOWARD_COUNTER)
        pose(d, [
          [0.62, P.STAND],
          [0.85, P.STAND_EASY],
        ], u)
      }
      setHeld(c.cup, 'ege', 'r', 1 - smoothstep(0.42, 0.47, u), APT.counterCup)
      if (u < 0.45) c.cup.by = null
      atCounter(e, u)
      break
    }

    case 'voice': {
      place(d, SPOT.x, SPOT.z, TOWARD_COUNTER)
      hold(d, P.STAND_EASY)
      if (u < 0.15) {
        place(e, COUNTER.x, COUNTER.z, EGE_TO_DERIN)
        hold(e, P.CARRY)
      } else walking(e, E_TABLE, (u - 0.15) / 0.8, P.CARRY, EGE_TO_DERIN, TOWARD_SPOT)
      lookAt(d, e.x, e.z)
      setHeld(c.cup, 'ege', 'r', 0, null)
      break
    }

    case 'cup': {
      place(d, SPOT.x, SPOT.z, TOWARD_COUNTER)
      hold(d, P.STAND_EASY)
      lookAt(d, APT.cupSpot.x, APT.cupSpot.z, 0.8)
      place(e, SET_CUP.x, SET_CUP.z, TOWARD_SPOT)
      pose(e, [
        [0.2, P.CARRY],
        [0.45, P.LEAN],
        [0.62, P.LEAN],
        [0.85, P.STAND_EASY],
      ], u)
      const w = smoothstep(0.22, 0.42, u) * (1 - smoothstep(0.58, 0.8, u))
      aim(e.r, w, APT.cupSpot.x, APT.cupSpot.y + GRIP.cup + 0.003, APT.cupSpot.z, 0.4)
      setHeld(c.cup, 'ege', 'r', smoothstep(0.46, 0.56, u), APT.cupSpot)
      if (u > 0.56) c.cup.by = null
      lookAt(e, APT.cupSpot.x, APT.cupSpot.z, 0.6)
      break
    }

    case 'slippers': {
      walking(d, D_WINDOW, u, P.STAND, TOWARD_COUNTER, PI / 2)
      break
    }

    case 'curtain': {
      place(d, WINDOW.x, WINDOW.z, PI / 2)
      hold(d, P.STAND)
      const open = smoothstep(0.22, 0.78, u)
      c.curtains = lerp(0.02, 1, open)
      // Each hand follows its curtain's inner edge as far as an arm goes.
      const w = smoothstep(0.08, 0.24, u) * (1 - smoothstep(0.78, 0.95, u))
      const spread = Math.min(0.3, 0.06 + open * 0.6)
      aim(d.l, w, APT.x1 - 0.24, 1.32, WINDOW.z - spread, 0.7)
      aim(d.r, w, APT.x1 - 0.24, 1.32, WINDOW.z + spread, 0.7)
      break
    }

    case 'doorCheck': {
      if (u < 0.4) walking(d, D_DOOR, u / 0.4, P.STAND, PI / 2, 0)
      else {
        place(d, DOOR.x, DOOR.z, 0)
        hold(d, P.STAND)
        const w = smoothstep(0.4, 0.5, u) * (1 - smoothstep(0.88, 0.98, u))
        // Down, up. Down, up. Twice — always twice.
        const press = bump(u, 0.52, 0.6, 0.66) + bump(u, 0.7, 0.78, 0.84)
        c.handle = press
        aim(d.r, w, HANDLE.x, HANDLE.y - 0.045 * press + GRIP.keys, HANDLE.z, 0.6)
      }
      setHeld(c.keys, 'derin', 'l', 0, null)
      break
    }

    case 'keys': {
      if (u < 0.3) walking(d, D_BOWL, u / 0.3, P.STAND, 0, 0)
      else {
        place(d, BOWL.x, BOWL.z, 0)
        hold(d, P.STAND)
      }
      const w = smoothstep(0.32, 0.5, u) * (1 - smoothstep(0.62, 0.85, u))
      aim(d.l, w, KEYS_IN_BOWL.x - 0.01, KEYS_IN_BOWL.y + 0.11, KEYS_IN_BOWL.z, 0.4)
      setHeld(c.keys, 'derin', 'l', smoothstep(0.54, 0.6, u), KEYS_IN_BOWL)
      if (u > 0.6) c.keys.by = null
      break
    }

    case 'drawer': {
      place(d, DRAWER.x, DRAWER.z, 0)
      pose(d, [
        [0.06, P.STAND],
        [0.22, P.LEAN],
        [0.72, P.LEAN],
        [0.95, P.HOLD],
      ], u)
      const open = smoothstep(0.2, 0.45, u)
      c.drawer = open
      const knobZ = APT.device.z - 0.17 - 0.24 * open
      const toPhoto = smoothstep(0.5, 0.62, u)
      const lift = smoothstep(0.66, 0.95, u)
      photoInDrawer(c, open)
      if (lift > 0) {
        c.photo.pos.lerp(PHOTO_HELD, lift)
        c.photo.quat.slerp(qHeld, lift)
      }
      const w = smoothstep(0.14, 0.24, u)
      const tx = lerp(-1.92, c.photo.pos.x - 0.01, toPhoto)
      const ty = lerp(0.71, c.photo.pos.y + 0.02, toPhoto)
      const tz = lerp(knobZ - 0.02, c.photo.pos.z - 0.05, toPhoto)
      aim(d.r, w, tx, ty + 0.02, tz, 0.5)
      if (lift > 0) holdPhoto(d, c, lift)
      break
    }

    case 'photo': {
      place(d, DRAWER.x, DRAWER.z, 0)
      hold(d, P.HOLD)
      photoInDrawer(c, 1)
      c.photo.pos.copy(PHOTO_HELD)
      c.photo.pos.y += 0.02 * smoothstep(0.1, 0.9, u)
      c.photo.quat.copy(qHeld)
      holdPhoto(d, c, 1)
      c.drawer = 1
      break
    }

    case 'noon': {
      place(d, NOON.x, NOON.z, PI / 2)
      hold(d, P.STAND)
      const w = smoothstep(0.03, 0.12, u) * (1 - smoothstep(0.985, 1, u))
      aim(d.r, w, WINDOW_HANDLE.x, WINDOW_HANDLE.y - 0.05 * smoothstep(0.9, 0.97, u), WINDOW_HANDLE.z, 0.6)
      c.windowHandle = smoothstep(0.9, 0.97, u)
      // She answers him over her shoulder, then closes it anyway.
      lookAt(d, EGE_SEAT.x, EGE_SEAT.z, smoothstep(0.34, 0.42, u) * (1 - smoothstep(0.62, 0.72, u)))
      const talk = bump(u, 0.06, 0.12, 0.34) + bump(u, 0.62, 0.68, 0.94)
      pose(e, [
        [0, P.SIT_READ],
        [1, P.SIT_LOOK],
      ], talk * 0.55)
      break
    }

    case 'afternoon':
    case 'clock': {
      place(d, SOFA.x, SOFA.z, PI)
      hold(d, P.SOFA)
      break
    }

    case 'loop': {
      // The rewind is drawn by remapping story progress (see plan.ts); this is never reached.
      place(d, SOFA.x, SOFA.z, PI)
      hold(d, P.SOFA)
      break
    }

    // ——— PARÇALAR: the afternoon looked at again, detail by detail ———
    case 'rewind':
    case 'fragments':
    case 'absent': {
      place(d, SOFA.x, SOFA.z, PI)
      hold(d, P.SOFA)
      // Her eyes go where the reading goes.
      const at = seg === 'rewind' ? EGE_SEAT : seg === 'absent' ? SHOES : u < 0.42 ? APT.phone : u < 0.64 ? SHOES : u < 0.84 ? PILLS : GLASSES
      lookAt(d, at.x, at.z, seg === 'rewind' ? 0.5 * smoothstep(0.2, 0.6, u) : 0.8)
      c.phone.lit = seg === 'fragments' && u < 0.45 ? 0.8 : 0.35
      break
    }

    case 'call': {
      place(d, SOFA.x, SOFA.z, PI)
      hold(d, P.SOFA)
      lookAt(d, EGE_SEAT.x, EGE_SEAT.z, 0.9)
      hold(e, P.SIT_STILL)
      phoneCall(e, c, u, 0.06, 0.86)
      break
    }

    case 'approach': {
      if (u < 0.16) {
        place(d, SOFA.x, lerp(SOFA.z, SOFA.z - 0.3, smoothstep(0.04, 0.16, u)), PI)
        pose(d, [
          [0.02, P.SOFA],
          [0.16, P.STAND],
        ], u)
      } else if (u < 0.86) walking(d, D_APPROACH, (u - 0.16) / 0.7, P.STAND, PI, TOWARD_EGE_SEAT)
      else {
        place(d, NEAR_EGE.x, NEAR_EGE.z, TOWARD_EGE_SEAT)
        hold(d, P.STAND)
      }
      pose(e, [
        [0.3, P.SIT_READ],
        [0.7, P.SIT_STILL],
      ], u)
      break
    }

    case 'dissolve': {
      place(d, NEAR_EGE.x, NEAR_EGE.z, TOWARD_EGE_SEAT)
      pose(d, [
        [0.1, P.STAND],
        [0.42, P.REACH_OUT],
      ], u)
      // Her hand stops short of his shoulder. He does not turn.
      hold(e, P.SIT_STILL)
      break
    }

    case 'hush':
    case 'system':
    case 'document': {
      place(d, NEAR_EGE.x, NEAR_EGE.z, TOWARD_EGE_SEAT)
      hold(d, P.STAND)
      hold(e, P.SIT_STILL)
      break
    }

    case 'closer': {
      place(d, NEAR_EGE.x, NEAR_EGE.z, TOWARD_EGE_SEAT)
      hold(d, P.STAND)
      pose(e, [
        [0.45, P.SIT_STILL],
        [0.95, P.SIT_LOOK],
      ], u)
      break
    }

    // ——— EMANET: 14:17 again, and this time she is there ———
    case 'minute':
    case 'stay':
    case 'complete':
    case 'end': {
      const t = seg === 'minute' ? u : 1
      const answer = flags.has('minute:answer')
      const sit = flags.has('minute:sit')
      const say = flags.has('minute:say')
      place(d, NEAR_EGE.x, NEAR_EGE.z, TOWARD_EGE_SEAT)
      hold(d, P.STAND)
      hold(e, P.SIT_STILL)
      // He calls her, as he did; the gate waits with the phone at his ear.
      const hangUp = answer ? 2 : 0.66
      phoneCall(e, c, t, 0.26, hangUp)
      if (answer) {
        // She answers beside him: her own phone, her hand at her ear.
        const w = smoothstep(0.6, 0.7, t)
        const yaw = TOWARD_EGE_SEAT
        aim(d.r, w, NEAR_EGE.x - Math.cos(yaw) * 0.075, 1.56, NEAR_EGE.z + Math.sin(yaw) * 0.075, 0.7)
        d.ear = w
        setHeld(c.derinPhone, 'derin', 'r', w > 0.5 ? 0 : 1, DERIN_PHONE_REST, w > 0.5)
        lookAt(e, NEAR_EGE.x, NEAR_EGE.z, smoothstep(0.7, 0.85, t))
      } else if (sit) {
        // To the chair across from him.
        const go = smoothstep(0.62, 0.74, t)
        place(d, lerp(NEAR_EGE.x, DERIN_SEAT.x, go), lerp(NEAR_EGE.z, DERIN_SEAT.z + 0.05, go), angleLerp(TOWARD_EGE_SEAT, PI, go))
        pose(d, [
          [0.72, P.STAND],
          [0.86, P.SIT_STILL],
        ], t)
        pose(e, [
          [0.7, P.SIT_STILL],
          [0.85, P.SIT_LOOK],
        ], t)
        lookAt(e, DERIN_SEAT.x, DERIN_SEAT.z, smoothstep(0.75, 0.9, t))
      } else if (say) {
        pose(e, [
          [0.66, P.SIT_STILL],
          [0.8, P.SIT_LOOK],
        ], t)
        lookAt(e, NEAR_EGE.x, NEAR_EGE.z, smoothstep(0.7, 0.82, t))
      }
      break
    }
  }
}

/**
 * Ege calls: reaches for the phone on the table at `from`, holds it to his
 * right ear, puts it back at `until` (past 1: he keeps talking).
 */
function phoneCall(e: Body, c: Choreo, u: number, from: number, until: number) {
  const reachW = smoothstep(from, from + 0.06, u) * (1 - smoothstep(until + 0.06, until + 0.12, u))
  const lift = smoothstep(from + 0.07, from + 0.15, u) * (1 - smoothstep(until, until + 0.07, u))
  const held = u >= from + 0.07 && u < until + 0.07
  // Seated facing +z (leaning back a little): his right ear is toward −x.
  const ear = { x: e.x - 0.12, y: 1.2, z: e.z - 0.09 }
  aim(e.r, reachW, lerp(APT.phone.x, ear.x, lift), lerp(APT.phone.y + 0.03, ear.y, lift), lerp(APT.phone.z, ear.z, lift), lerp(0.25, 0.75, lift))
  setHeld(c.phone, held ? 'ege' : null, 'r', held ? 0 : 1, APT.phone)
  e.ear = lift
  c.phone.upright = held && lift > 0.5
  c.phone.lit = held ? 1 : 0.35
}

/** Ege at the counter, then turning with the cup. */
function atCounter(e: Body, u: number) {
  place(e, COUNTER.x, COUNTER.z, PI)
  pose(e, [
    [0.3, P.LEAN_SOFT],
    [0.5, P.LEAN_SOFT],
    [0.66, P.CARRY],
  ], u)
  const turn = smoothstep(0.48, 0.64, u)
  e.yaw = angleLerp(PI, EGE_TO_DERIN, turn)
  const w = smoothstep(0.34, 0.46, u) * (1 - smoothstep(0.5, 0.62, u))
  aim(e.r, w, APT.counterCup.x, APT.counterCup.y + GRIP.cup, APT.counterCup.z, 0.4)
}

function photoInDrawer(c: Choreo, open: number) {
  c.photo.pos.set(-1.92, 0.786, APT.device.z - 0.02 - 0.24 * open)
  c.photo.quat.copy(qFlatDrawer)
}

/** Both hands on the photo's sides. */
function holdPhoto(d: Body, c: Choreo, w: number) {
  v.set(0.1, -0.01, 0).applyQuaternion(c.photo.quat).add(c.photo.pos)
  aim(d.l, w, v.x, v.y, v.z, 0.3)
  v.set(-0.1, -0.01, 0).applyQuaternion(c.photo.quat).add(c.photo.pos)
  aim(d.r, Math.max(d.r.w, w), v.x, v.y, v.z, 0.3)
}

/** 0 → 1 → 0 over [a, b, c]. */
function bump(u: number, a: number, b: number, c: number) {
  return smoothstep(a, b, u) * (1 - smoothstep(b, c, u))
}
