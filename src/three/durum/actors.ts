/**
 * Who stands where and does what, segment by segment (docs/stories/durum.md
 * §3). Everything is a pure function of the segment, its local progress u
 * and the reader's choices. Hands that must touch things use `reach`.
 */
import { smoothstep } from '@/lib/math'
import type { SegmentId } from '@/stories/durum/timeline'
import { makePath } from '../figure/paths'
import type { Actor } from '../kit/direct'
import { ARIF_POS, type Ctx } from './context'
import { CARRY_BOX, CROUCH, P, SIT_ALERT, SIT_ASTRIDE, SIT_ELBOWS, SIT_LAUGH, SIT_PHONE, SIT_RUB, SIT_SLOUCH, STAND_WORK, TABLET } from './cast'
import { COAT_RACK, DOOR, ON_DESK, SEAT, SELIN_CHAIR, WD_C } from './sets'

const PI = Math.PI
const s = smoothstep

// ——— Arif's paths ———
const P_ENTER = makePath([
  [DOOR.x, 4.75],
  [DOOR.x, 3.45],
  [3.2, 3.2],
  [ARIF_POS.rack.x, ARIF_POS.rack.z],
])
const P_TO_DESK = makePath([
  [ARIF_POS.rack.x, ARIF_POS.rack.z],
  [2.3, 2.25],
  [1.0, 0.85],
  [ARIF_POS.lamp.x, ARIF_POS.lamp.z],
])
const P_TO_COFFEE = makePath([
  [ARIF_POS.stand.x, ARIF_POS.stand.z],
  [-1.0, 0.8],
  [-3.3, 0.68],
  [ARIF_POS.coffee.x, ARIF_POS.coffee.z],
])
const P_FROM_COFFEE = makePath([
  [ARIF_POS.coffee.x, ARIF_POS.coffee.z],
  [-2.2, 0.95],
  [-0.7, 0.8],
  [0.05, 0.45],
])
const P_TO_PRINTER = makePath([
  [0.05, 0.45],
  [-1.5, 1.45],
  [-3.3, 2.5],
  [ARIF_POS.printer.x, ARIF_POS.printer.z],
])
const P_FROM_PRINTER = makePath([
  [ARIF_POS.printer.x, ARIF_POS.printer.z],
  [-2.0, 1.75],
  [-0.65, 0.75],
  [-0.12, 0.4],
])
const P_KITCHEN_OUT = makePath([
  [0.15, 0.42],
  [1.2, 1.35],
  [2.3, 2.9],
  [DOOR.x, 3.55],
])
const P_KITCHEN_IN = makePath([
  [-2.2, 6.6],
  [-2.35, 7.7],
  [ARIF_POS.sink.x, ARIF_POS.sink.z],
])
const P_KITCHEN_BACK = makePath([
  [ARIF_POS.sink.x, ARIF_POS.sink.z],
  [-2.35, 7.6],
  [-2.2, 6.3],
  [-1.4, 5.5],
])
const P_BOXES_OUT = makePath([
  [0.2, 0.45],
  [1.4, 1.55],
  [DOOR.x, 3.4],
  [DOOR.x, 4.8],
])
const P_TO_WD = makePath([
  [0.35, 0.35],
  [1.3, -0.5],
  [2.2, -1.5],
  [ARIF_POS.wd.x, ARIF_POS.wd.z],
])
const P_TO_GLASSDOOR = makePath([
  [0.05, 0.45],
  [-1.4, -0.5],
  [-2.85, -3.1],
  [-2.95, -4.3],
  [-1.7, -5.0],
  [-1.0, -5.1],
])
const P_AISLE = makePath([
  [-1.0, -5.1],
  [-1.0, -10.0],
])
const P_TO_SELIN = makePath([
  [-1.0, -10.0],
  [-1.6, -9.55],
  [ARIF_POS.heat.x, ARIF_POS.heat.z],
])
const P_TO_END = makePath([
  [ARIF_POS.heat.x, ARIF_POS.heat.z],
  [-1.6, -10.4],
  [-1.3, -11.4],
])
const P_TO_RACK = makePath([
  [0.3, 0.45],
  [1.6, 1.7],
  [2.8, 2.7],
  [ARIF_POS.rack.x, ARIF_POS.rack.z],
])
const P_TO_DOOR = makePath([
  [ARIF_POS.rack.x, ARIF_POS.rack.z],
  [3.0, 3.35],
  [DOOR.x, ARIF_POS.door.z],
])
const P_OUT = makePath([
  [DOOR.x, ARIF_POS.door.z],
  [DOOR.x, 4.7],
  [1.6, 5.3],
])
/** Down on the street: out of the door, across the forecourt, along the pavement. */
export const P_STREET = makePath([
  [5.45, 5.0],
  [8.9, 4.4],
  [11.4, 2.6],
  [11.45, -16],
])

// ——— Selin's paths ———
const P_S_TO_ARIF = makePath([
  [SELIN_CHAIR.x - 0.1, SELIN_CHAIR.z],
  [1.9, 0.9],
  [0.85, 0.18],
])
const P_S_OUT = makePath([
  [0.85, 0.18],
  [1.8, 1.9],
  [DOOR.x, 3.55],
  [DOOR.x, 4.8],
])
const P_S_IN = makePath([
  [DOOR.x, 4.75],
  [DOOR.x, 3.35],
  [1.5, 1.4],
  [0.72, 0.12],
])
const P_S_BACK = makePath([
  [0.72, 0.12],
  [1.6, 0.9],
  [SELIN_CHAIR.x - 0.35, SELIN_CHAIR.z],
])
const P_S_SIMIT = makePath([
  [SELIN_CHAIR.x - 0.1, SELIN_CHAIR.z],
  [1.6, 0.6],
  [0.7, 0.05],
])

/** The left hand against the near side of the mug on the coffee counter (not inside it). */
const MUG_SIDE = { x: -4.448, y: 0.975, z: 0.395 }
/** The grip that puts the mug's rim on his lips while he sits back (ritual). */
export const SIP = { x: 0.045, y: 1.2, z: 0.03 }
const seat = (a: Actor) => a.place(SEAT.x, SEAT.z, PI)
/** Both hands on the phone's long edges (the phone itself is placed at `c.phoneHeld`). */
const holdPhone = (a: Actor, c: Ctx, w: number) => {
  const h = c.phoneHeld
  a.reach('l', w, h.x - 0.042, h.y - 0.025, h.z + 0.012, 0.25)
  a.reach('r', w, h.x + 0.042, h.y - 0.025, h.z + 0.012, 0.25)
}
/** Seated, facing the desk. */
const sit = (a: Actor, pose = P.SIT_TYPE) => seat(a).hold(pose)
const toward = (fx: number, fz: number, tx: number, tz: number) => Math.atan2(tx - fx, tz - fz)

export function directArif(a: Actor, c: Ctx) {
  const { seg, u } = c
  a.begin()
  const wdYaw = toward(ARIF_POS.wd.x, ARIF_POS.wd.z, WD_C.x, WD_C.z)
  switch (seg as SegmentId) {
    case 'open':
      a.place(DOOR.x, 5.4, PI).hold(P.STAND)
      a.visible = false
      break
    case 'enter': {
      if (u < 0.06) {
        a.place(DOOR.x, 4.75, PI).hold(P.STAND)
        a.visible = u > 0.03
      } else if (u < 0.45) a.walk(P_ENTER, s(0.06, 0.44, u), P.STAND, PI, toward(ARIF_POS.rack.x, ARIF_POS.rack.z, COAT_RACK.x, COAT_RACK.z))
      else if (u < 0.6) {
        a.place(ARIF_POS.rack.x, ARIF_POS.rack.z, toward(ARIF_POS.rack.x, ARIF_POS.rack.z, COAT_RACK.x, COAT_RACK.z)).hold(P.STAND)
        // Hangs the coat on the hook (0.5–0.58); puts the bag down at the rack's foot.
        a.reach('r', Math.sin(PI * s(0.48, 0.6, u)), COAT_RACK.x - 0.05, 1.72, COAT_RACK.z - 0.08, 0.3)
      } else if (u < 0.72) a.walk(P_TO_DESK, s(0.6, 0.72, u), P.STAND, undefined, PI)
      else if (u < 0.75) {
        a.place(ARIF_POS.lamp.x, ARIF_POS.lamp.z, PI).hold(P.LEAN_SOFT)
        a.reach('l', Math.sin(PI * s(0.715, 0.75, u)), -0.62, 1.12, -0.62, 0.4)
      } else {
        // Steps to his chair and takes the phone out (0.75–0.88), lays it face down.
        const t = s(0.75, 0.77, u)
        const PS = { x: 0.6, z: 0.1 }
        a.place(ARIF_POS.lamp.x + (PS.x - ARIF_POS.lamp.x) * t, ARIF_POS.lamp.z + (PS.z - ARIF_POS.lamp.z) * t, PI - 0.25 * t)
        a.hold(u < 0.88 ? STAND_WORK : P.STAND)
        if (u < 0.86) a.reach('r', s(0.75, 0.77, u) * (1 - s(0.82, 0.85, u)), ON_DESK.phone.x - 0.01, u < 0.79 ? 0.92 : ON_DESK.phone.y + 0.05, ON_DESK.phone.z + 0.04, 0.4)
        if (u > 0.88) a.lookAt(-1.2, -4, s(0.88, 0.95, u))
      }
      break
    }
    case 'coffee': {
      if (u < 0.12) {
        a.walk(P_TO_COFFEE, s(0, 0.12, u), P.STAND, PI - 0.25, -PI / 2)
        break
      }
      a.place(ARIF_POS.coffee.x, ARIF_POS.coffee.z, -PI / 2).hold(STAND_WORK)
      // Turns up the mug, pours, sugar ×2 (with a hover), stirs.
      if (u < 0.3) {
        a.reach('l', s(0.12, 0.17, u), MUG_SIDE.x, MUG_SIDE.y, MUG_SIDE.z, 0.3)
        a.reach('r', s(0.17, 0.2, u), c.jugAt.x, c.jugAt.y + 0.09, c.jugAt.z, 0.4)
      } else if (u < 0.68) {
        a.reach('l', 1, MUG_SIDE.x, MUG_SIDE.y, MUG_SIDE.z, 0.3)
      } else {
        const bowl = { x: -4.62, y: 1.0, z: 0.85 }
        const over = { x: -4.52, y: 1.08, z: 0.42 }
        let w = 1
        let tx = over.x
        let tz = over.z
        let ty = over.y
        if (u < 0.74) {
          tx = bowl.x
          ty = bowl.y
          tz = bowl.z
          w = s(0.68, 0.72, u)
        } else if (u > 0.78 && u < 0.83) {
          // The hover: halfway back toward the bowl, still.
          tx = (bowl.x + over.x) / 2
          ty = 1.1
          tz = (bowl.z + over.z) / 2
        } else if (u >= 0.83 && u < 0.85) {
          tx = bowl.x
          ty = bowl.y
          tz = bowl.z
        } else if (u >= 0.9) {
          ty = 1.02
        }
        a.reach('r', w, tx, ty, tz, 0.3)
        a.reach('l', 1, MUG_SIDE.x, MUG_SIDE.y, MUG_SIDE.z, 0.3)
      }
      // A glance over the shoulder at the greeting (0.1); half-turned for "Tek şeker."; a snort.
      a.lookAt(2.6, -3.0, 0.8 * (s(0.06, 0.12, u) - s(0.2, 0.26, u)) + 0.5 * (s(0.3, 0.34, u) - s(0.48, 0.52, u)))
      break
    }
    case 'intro':
      if (u < 0.15) a.walk(P_FROM_COFFEE, s(0, 0.15, u), P.CARRY, -PI / 2, PI)
      else if (u < 0.22) {
        seat(a).blend(
          [
            [0.15, P.STAND],
            [0.21, P.SIT_TYPE],
          ],
          u,
        )
        // Sets the mug down on its mark (0.17–0.19), then a touch of the mouse (0.2–0.25).
        a.reach('r', s(0.14, 0.17, u) * (1 - s(0.19, 0.21, u)), ON_DESK.mug.x + 0.045, ON_DESK.mug.y + 0.05, ON_DESK.mug.z, 0.3)
        a.reach('r', s(0.2, 0.215, u) * (1 - s(0.23, 0.25, u)), ON_DESK.mouse.x, 0.79, ON_DESK.mouse.z, 0.3)
      } else sit(a, P.SIT_LOOK).lookAt(WD_C.x, WD_C.z, 0.5 * s(0.22, 0.35, u) * (1 - s(0.62, 0.7, u)))
      break
    case 'ritual':
      sit(a, P.SIT_BACK)
      // The mug in hand; a sip; the nod toward Selin.
      a.reach('r', 1, 0.16, 1.0, -0.12, 0.3)
      // The sip: the mug's rim to his lips (the mug sits 4.5 cm inward of the grip, tilted; see mugInHand).
      if (u > 0.2 && u < 0.36) a.reach('r', Math.sin(PI * s(0.2, 0.36, u)), SIP.x, SIP.y, SIP.z, 0.3)
      a.lookAt(SELIN_CHAIR.x, SELIN_CHAIR.z, 0.7 * (s(0.5, 0.56, u) - s(0.7, 0.78, u)))
      break
    case 'traffic':
      sit(a, P.SIT_LOOK).lookAt(0.66, -0.76, 0.35)
      // The counter in the right hand; turned to him at 0.64.
      a.reach('r', 1, 0.16, u < 0.62 ? 0.86 : 0.9, u < 0.62 ? -0.1 : -0.06, 0.3)
      if (u > 0.62) a.lookAt(0.16, -0.06, 0.6)
      break
    case 'thumb': {
      sit(a, P.SIT_TYPE)
      if (u < 0.12) a.reach('r', 1 - s(0.08, 0.13, u) * 0.5, ON_DESK.tray.x, 0.79, ON_DESK.tray.z, 0.3)
      else if (u < 0.27) a.reach('r', 1, 0.2, 0.62, 0.12, 0.7)
      else a.reach('r', 1, c.coinThumb.x - 0.012, c.coinThumb.y - 0.05, c.coinThumb.z + 0.02, 0.35)
      a.lookAt(c.coinThumb.x, c.coinThumb.z, 0.4)
      break
    }
    case 'palm': {
      sit(a, P.SIT_TYPE)
      // The fist rests on the desk; the left hand tears the slip and holds it up.
      a.reach('r', 1, u < 0.04 ? 0.18 : 0.22, u < 0.04 ? 0.87 : 0.79, u < 0.04 ? -0.12 : -0.3, 0.4)
      if (u < 0.18) a.reach('l', s(0.06, 0.12, u), ON_DESK.printer.x - 0.05, 0.86, ON_DESK.printer.z + 0.1, 0.5)
      else a.reach('l', 1, c.slipHeld.x, c.slipHeld.y - 0.04, c.slipHeld.z + 0.03, 0.4)
      a.lookAt(c.slipHeld.x, c.slipHeld.z, 0.3)
      break
    }
    case 'youSaid': {
      if (u < 0.75) {
        sit(a, u < 0.3 ? P.SIT_TYPE : P.SIT_LOOK)
        a.reach('r', 1, 0.15, 0.8, -0.3, 0.5)
      } else {
        // He swivels and looks behind him, into the lens; then past it.
        const t = s(0.77, 0.9, u)
        seat(a)
        a.yaw = PI - 2.55 * t
        a.hold(P.SIT_LOOK)
        a.lookAt(u < 0.92 ? 0.6 : 2.6, u < 0.92 ? 3.3 : 4.0, 0.9)
      }
      break
    }
    case 'dare':
      sit(a, SIT_ELBOWS)
      a.reach('l', 1, -0.035, 1.07, -0.16, 0.7).reach('r', 1, 0.035, 1.07, -0.16, 0.7)
      break
    case 'envelope':
      if (u < 0.48) sit(a, P.SIT_LOOK).lookAt(-4.0, 2.7, 0.7 * s(0.04, 0.12, u))
      else if (u < 0.52)
        seat(a).blend(
          [
            [0.48, P.SIT_LOOK],
            [0.52, P.STAND],
          ],
          u,
        )
      else if (u < 0.72) a.walk(P_TO_PRINTER, s(0.52, 0.72, u), P.STAND, PI, -PI / 2)
      else {
        a.place(ARIF_POS.printer.x, ARIF_POS.printer.z, -PI / 2 + 0.25).hold(P.HOLD)
        if (u < 0.8) a.reach('r', s(0.72, 0.76, u), -4.42, 0.76, 3.06, 0.3)
        a.lookAt(-4.42, 3.06, 0.4)
      }
      break
    case 'contrary': {
      if (u < 0.2) {
        a.walk(P_FROM_PRINTER, s(0, 0.18, u), P.HOLD, -PI / 2, PI)
        if (u > 0.16) a.reach('l', Math.sin(PI * s(0.16, 0.22, u)), ON_DESK.envelope.x, 0.78, ON_DESK.envelope.z, 0.3)
      } else if (u < 0.3) {
        a.place(-0.12, 0.42, PI - 0.5 * s(0.2, 0.26, u)).hold(STAND_WORK)
        a.reach('r', s(0.22, 0.26, u), 0.0, 0.85, 0.42, 0.5)
      } else {
        a.place(SEAT.x, SEAT.z + 0.06, PI)
        a.blend(
          [
            [0.3, P.STAND],
            [0.36, SIT_ASTRIDE],
          ],
          u,
        )
        // Forearms on the backrest; the pen (0.42–0.5), the glass (0.62, 0.72, 0.82).
        a.reach('r', s(0.3, 0.36, u), 0.13, 0.98, 0.03, 0.8)
        if (u < 0.4 || (u > 0.56 && u < 0.58)) a.reach('l', s(0.3, 0.36, u), -0.13, 0.98, 0.03, 0.8)
        if (u > 0.4 && u < 0.56) a.reach('l', Math.sin(PI * s(0.4, 0.56, u)), ON_DESK.pen.x, 0.8, ON_DESK.pen.z, 0.4)
        if (u > 0.58) a.reach('l', 1, c.glassHand.x, c.glassHand.y - 0.05, c.glassHand.z + 0.02, 0.4)
        a.lookAt(ON_DESK.envelope.x, ON_DESK.envelope.z, 0.3)
      }
      break
    }
    case 'glassChoice': {
      const g = c.glass
      if (u < 0.5 || g === 'none') {
        a.place(SEAT.x, SEAT.z + 0.06, PI).hold(SIT_ASTRIDE)
        a.reach('r', 1 - (g === 'none' ? s(0.62, 0.72, u) : 0), 0.13, 0.98, 0.03, 0.8)
        if (g === 'none' && u > 0.5) {
          a.reach('l', 1 - s(0.6, 0.66, u), c.glassHand.x, c.glassHand.y - 0.05, c.glassHand.z + 0.02, 0.4)
          if (u > 0.62) {
            a.blend(
              [
                [0.62, SIT_ASTRIDE],
                [0.72, P.SIT_STRAIGHT],
              ],
              u,
            )
          }
        } else a.reach('l', 1, c.glassHand.x, c.glassHand.y - 0.05, c.glassHand.z + 0.02, 0.4)
        a.lookAt(ON_DESK.envelope.x, ON_DESK.envelope.z, 0.35)
      } else if (g === 'kitchen') {
        if (u < 0.56)
          a.place(SEAT.x, SEAT.z + 0.06, PI).blend(
            [
              [0.5, SIT_ASTRIDE],
              [0.56, P.STAND],
            ],
            u,
          )
        else a.walk(P_KITCHEN_OUT, s(0.56, 1, u), P.CARRY, PI, 0)
      } else {
        // Break: the swing (0.52–0.56), frozen, then he rises (0.62–0.9).
        if (u < 0.62) {
          a.place(SEAT.x, SEAT.z + 0.06, PI).hold(SIT_ASTRIDE)
          a.reach('l', 1, c.glassHand.x, c.glassHand.y - 0.05, c.glassHand.z + 0.02, 0.35)
        } else {
          a.place(SEAT.x - 0.1, SEAT.z + 0.22, PI + 0.3).blend(
            [
              [0.62, SIT_ASTRIDE],
              [0.9, P.STAND],
            ],
            u,
          )
          a.lookAt(-0.55, -0.1, 0.9)
        }
      }
      break
    }
    case 'opened': {
      const g = c.glass
      if (g === 'kitchen' && u < 0.4) {
        if (u < 0.02) a.walk(P_OUT, s(-0.05, 0.03, u), P.CARRY, 0, 0)
        else if (u < 0.08) a.walk(P_KITCHEN_IN, s(0.02, 0.08, u), P.CARRY, 0, 0)
        else if (u < 0.3) {
          a.place(ARIF_POS.sink.x, ARIF_POS.sink.z, 0).hold(STAND_WORK)
          if (u < 0.26) {
            a.reach('r', 1, -2.6, 1.02, 9.42, 0.4)
            a.reach('l', u < 0.2 ? 1 : 0.6, -2.55, 1.0, 9.4, 0.4)
          } else a.reach('r', 1, -2.45, 1.86, 9.6, 0.3)
        } else a.walk(P_KITCHEN_BACK, s(0.3, 0.4, u), P.STAND, 0, PI)
        break
      }
      if (g === 'break' && u < 0.4) {
        if (u < 0.3) {
          a.place(SEAT.x - 0.1, SEAT.z + 0.22, PI + 0.3).hold(P.STAND).lookAt(-0.55, -0.1, 0.9)
        } else {
          a.place(SEAT.x - 0.1 * (1 - s(0.3, 0.36, u)), SEAT.z + 0.22 - 0.22 * s(0.3, 0.38, u), PI + 0.3 * (1 - s(0.3, 0.36, u))).blend(
            [
              [0.34, P.STAND],
              [0.4, P.SIT_STILL],
            ],
            u,
          )
        }
        break
      }
      if (g === 'none' && u < 0.4) {
        if (u < 0.32) a.place(SEAT.x, SEAT.z + 0.06, PI).hold(P.SIT_STRAIGHT)
        else
          a.place(SEAT.x, SEAT.z + 0.06 * (1 - s(0.32, 0.4, u)), PI).blend(
            [
              [0.32, P.SIT_STRAIGHT],
              [0.35, P.STAND],
              [0.4, P.SIT_STILL],
            ],
            u,
          )
        break
      }
      // The envelope torn (0.42), the page (0.45–0.8), the laugh (0.83–0.93).
      if (u < 0.82) {
        sit(a, P.HOLD)
        a.reach('l', 1, c.pageAt.x - 0.08, c.pageAt.y - 0.05, c.pageAt.z + 0.02, 0.4)
        a.reach('r', 1, c.pageAt.x + 0.08, c.pageAt.y - 0.05, c.pageAt.z + 0.02, 0.4)
      } else {
        seat(a).blend(
          [
            [0.82, P.SIT_STILL],
            [0.86, SIT_LAUGH],
            [0.9, SIT_LAUGH],
            [0.94, P.SIT_STILL],
          ],
          u,
        )
      }
      break
    }
    case 'selin':
      sit(a, P.SIT_BACK).lookAt(0.85, 0.15, 0.5)
      // "Benim." — he holds up the page.
      if (u > 0.38 && u < 0.66) a.reach('r', Math.sin(PI * s(0.38, 0.66, u)), 0.2, 1.25, -0.12, 0.4)
      break
    case 'boxes':
      sit(a, P.SIT_BACK)
      // Pushes the keyboard back before the boxes land.
      if (u > 0.16 && u < 0.3) a.reach('r', Math.sin(PI * s(0.16, 0.3, u)), 0.05, 0.79, ON_DESK.keyboard.z - 0.05, 0.3)
      a.lookAt(0.0, -0.4, 0.4 * s(0.3, 0.4, u))
      break
    case 'rules':
      sit(a, P.SIT_STILL).lookAt(Math.sin(u * 9) > 0 ? -0.24 : 0.24, -0.4, 0.45)
      break
    case 'split': {
      sit(a, P.SIT_STILL)
      // Left hand near A: drums (0.3), edges toward it (0.38). Right hand near B in the second half.
      const drum = u > 0.28 && u < 0.34 ? 0.012 * Math.sin(u * 900) : 0
      if (u < 0.5) a.reach('l', 1, -0.1 - 0.06 * s(0.36, 0.46, u), 0.775 + drum, -0.22 - 0.04 * s(0.36, 0.46, u), 0.4).lookAt(-0.24, -0.4, 0.35)
      else a.reach('r', 1, 0.11, 0.775, -0.24, 0.4).reach('l', 0.6, -0.12, 0.775, -0.2, 0.4).lookAt(0.24, -0.4, 0.35)
      break
    }
    case 'choose': {
      sit(a, P.SIT_STILL)
      const A = c.boxA
      const after = u > 0.5
      if (!after) {
        a.reach('l', 1, A.x, 0.99, A.z, 0.4)
        a.reach('r', 1, c.boxB.x, 0.99, c.boxB.z, 0.4)
      } else {
        a.reach('l', 1 - s(0.58, 0.64, u), A.x + (c.box === 'one' ? 0.1 : 0.1), 0.86, A.z + (c.box === 'one' ? 0.05 : 0.08), 0.4)
        a.reach('r', 1, c.boxB.x, u < 0.62 ? 0.97 : 0.97 + 0.12 * s(0.65, 0.75, u), c.boxB.z + 0.08 - 0.12 * s(0.65, 0.75, u), 0.4)
      }
      break
    }
    case 'lid': {
      sit(a, P.SIT_STILL)
      if (c.box === 'one') {
        // On the open box's rim; into B (0.12–0.22); the cheque lifted out (0.26–0.36) and held.
        const B = c.boxB
        const dive = s(0.12, 0.22, u)
        const lift = s(0.26, 0.36, u)
        const mix = (r: number, i: number, h: number) => r + (i - r) * dive + (h - (r + (i - r) * dive)) * lift
        a.reach('r', 1, mix(B.x + 0.1, B.x + 0.04, c.chequeAt.x + 0.06), mix(0.97, 0.8, c.chequeAt.y), mix(B.z + 0.12, B.z + 0.02, c.chequeAt.z), 0.4)
        if (u > 0.4) a.reach('l', 1, c.slipHeld.x - 0.01, c.slipHeld.y - 0.04, c.slipHeld.z + 0.03, 0.4)
      } else {
        a.reach('r', 1, c.boxB.x + 0.1, 0.96, c.boxB.z + 0.12, 0.4)
        if (u > 0.4) a.reach('l', 1, c.slipHeld.x - 0.01, c.slipHeld.y - 0.04, c.slipHeld.z + 0.03, 0.4)
      }
      break
    }
    case 'after': {
      sit(a, u < 0.48 ? P.SIT_STILL : P.SIT_LOOK)
      if (u < 0.5) a.reach('r', 1, c.chequeAt.x + 0.06, c.chequeAt.y, c.chequeAt.z, 0.4)
      if (u < 0.12 && c.box === 'one') a.lookAt(-0.62, -0.45, 0.6)
      if (u > 0.48) a.lookAt(WD_C.x, WD_C.z, 0.55)
      break
    }
    case 'lapse': {
      if (u < 0.02) sit(a, P.SIT_LOOK)
      else if (u < 0.12) a.walk(P_BOXES_OUT, s(0.02, 0.12, u), CARRY_BOX, PI, 0)
      else if (u < 0.15 && c.glass === 'break') a.place(-0.35, 0.35, PI + 0.5).hold(CROUCH)
      else if (u < 0.5) {
        // In the hall: backups at a trolley, from rack to rack.
        const spot = u < 0.3 ? [-1.25, -6.9, PI] : u < 0.4 ? [-1.6, -9.55, -PI / 2] : [-0.7, -7.0, PI]
        a.place(spot[0], spot[1], spot[2]).hold(P.LEAN_SOFT)
      } else if (u < 0.65) {
        a.visible = false
        a.place(-1.0, -7.0, PI).hold(P.STAND)
      } else if (u < 0.84) {
        a.place(ARIF_POS.stand.x, ARIF_POS.stand.z, PI - 0.3).hold(P.STAND)
        a.reach('r', u < 0.82 ? 1 : 0, 0.32, 1.42 - 0.18 * (Math.sin(u * 160) > 0 ? 1 : 0), 0.08, 0.3)
      } else a.walk(P_TO_WD, s(0.84, 1, u), P.STAND, PI, wdYaw)
      break
    }
    case 'electron':
      a.place(ARIF_POS.wd.x, ARIF_POS.wd.z, wdYaw).hold(P.STAND_EASY)
      a.reach('r', s(0.03, 0.09, u) * (1 - s(0.4, 0.46, u)), WD_C.x - 0.15, 1.55, WD_C.z + 0.6, 0.3)
      break
    case 'fabric':
      a.place(ARIF_POS.wd.x, ARIF_POS.wd.z, wdYaw).hold(u > 0.5 ? P.ARMS_CROSSED : P.STAND_EASY)
      break
    case 'cloud': {
      const t = s(0.36, 0.44, u) * (1 - s(0.72, 0.82, u))
      const x = ARIF_POS.wd.x + (ARIF_POS.touch.x - ARIF_POS.wd.x) * t
      const z = ARIF_POS.wd.z + (ARIF_POS.touch.z - ARIF_POS.wd.z) * t
      a.place(x, z, wdYaw).hold(P.STAND)
      a.reach('r', s(0.42, 0.46, u) * (1 - s(0.66, 0.7, u)), c.touch.x, c.touch.y, c.touch.z, 0.35)
      break
    }
    case 'atom':
      a.place(ARIF_POS.wd.x, ARIF_POS.wd.z, wdYaw).hold(P.STAND_EASY)
      break
    case 'odds':
      a.place(ARIF_POS.wd.x, ARIF_POS.wd.z, wdYaw).hold(P.STAND)
      break
    case 'queue':
      sit(a, P.SIT_LOOK)
      a.reach('r', 1, 0.16, 1.0, -0.12, 0.3)
      break
    case 'forest':
      sit(a, P.SIT_LOOK)
      break
    case 'twoWorlds':
      sit(a, P.SIT_LOOK).lookAt(WD_C.x, WD_C.z, 0.5)
      break
    case 'tent':
      if (u < 0.6)
        seat(a).blend(
          [
            [0.0, P.SIT_LOOK],
            [0.05, SIT_RUB],
            [0.3, SIT_RUB],
            [0.38, P.SIT_BACK],
            [0.45, SIT_LAUGH],
            [0.52, P.SIT_BACK],
          ],
          u,
        )
      else
        seat(a).blend(
          [
            [0.6, P.SIT_BACK],
            [0.66, SIT_ELBOWS],
          ],
          u,
        )
      if (u < 0.3) {
        // Heels of the hands on his closed eyes (not praying in front of his face).
        const w = s(0.04, 0.1, u) * (1 - s(0.26, 0.31, u))
        a.reach('l', w, -0.05, 1.29, 0.135, 0.7)
        a.reach('r', w, 0.05, 1.29, 0.135, 0.7)
      }
      a.lookAt(WD_C.x, WD_C.z, 0.35)
      break
    case 'cfGate':
    case 'chain':
      sit(a, SIT_ELBOWS).lookAt(WD_C.x, WD_C.z, 0.4)
      break
    case 'knowable':
      sit(a, u < 0.36 ? SIT_ELBOWS : P.SIT_LOOK).lookAt(WD_C.x, WD_C.z, 0.4)
      break
    case 'selfQ':
      sit(a, SIT_SLOUCH).lookAt(-1.5, -6, 0.3)
      break
    case 'hallWalk':
      if (u < 0.03)
        seat(a).blend(
          [
            [0, SIT_SLOUCH],
            [0.03, P.STAND],
          ],
          u,
        )
      else if (u < 0.15) {
        a.walk(P_TO_GLASSDOOR, s(0.03, 0.15, u), P.STAND, PI, PI)
        if (u > 0.07 && u < 0.11) a.reach('r', Math.sin(PI * s(0.07, 0.11, u)), -2.75, 1.05, -3.93, 0.4)
      } else a.walk(P_AISLE, (u - 0.15) / 0.85, P.STAND, PI, PI)
      break
    case 'heat':
      if (u < 0.25) a.walk(P_TO_SELIN, s(0, 0.25, u), P.STAND, PI, toward(ARIF_POS.heat.x, ARIF_POS.heat.z, -3.65, -9.95))
      else {
        a.place(ARIF_POS.heat.x, ARIF_POS.heat.z, toward(ARIF_POS.heat.x, ARIF_POS.heat.z, -3.65, -9.95)).hold(P.STAND_EASY)
        a.reach('r', Math.sin(PI * s(0.36, 0.48, u)), ARIF_POS.heat.x - 0.15, 1.72, ARIF_POS.heat.z - 0.12, 0.6)
      }
      break
    case 'wait':
      if (u < 0.0) a.walk(P_TO_END, 0, P.STAND)
      a.place(-1.3, -11.4, PI).hold(P.STAND_EASY)
      if (u > 0.62) a.lookAt(-0.7, -11.4, 0.3)
      break
    case 'samePace':
      a.place(-1.3, -11.4, PI).hold(P.STAND_EASY)
      break
    case 'sealed':
    case 'computing':
      sit(a, P.SIT_LOOK).lookAt(WD_C.x, WD_C.z, seg === 'computing' ? 0.4 : 0.1)
      break
    case 'meaning':
      if (u < 0.7) sit(a, P.SIT_LOOK)
      else if (u < 0.84)
        seat(a).blend(
          [
            [0.7, P.SIT_LOOK],
            [0.75, SIT_LAUGH],
            [0.84, P.SIT_TYPE],
          ],
          u,
        )
      else sit(a, P.SIT_TYPE)
      break
    case 'rebuild':
      sit(a, P.SIT_TYPE)
      break
    case 'answered':
      if (c.q === 'death') sit(a, P.SIT_TYPE).lookAt(0, -0.45, 0.2)
      else if (c.q === 'what')
        seat(a).blend(
          [
            [0.0, P.SIT_TYPE],
            [0.2, P.SIT_BACK],
          ],
          u,
        )
      else sit(a, P.SIT_LOOK).lookAt(WD_C.x, WD_C.z, 0.6)
      if (c.q === 'death') {
        a.reach('l', 1, -0.08, 0.84, ON_DESK.keyboard.z + 0.02, 0.4)
        a.reach('r', 1, 0.08, 0.84, ON_DESK.keyboard.z + 0.02, 0.4)
      }
      break
    case 'input':
      if (u < 0.5) sit(a, P.SIT_LOOK)
      else {
        sit(a, SIT_ALERT)
        // Screen to screen.
        const k = s(0.52, 0.98, u)
        const tx = k < 0.33 ? 0 : k < 0.66 ? WD_C.x : 3.52
        const tz = k < 0.33 ? -0.86 : k < 0.66 ? WD_C.z : 1.4
        a.lookAt(tx, tz, 0.9)
      }
      break
    case 'turn':
    case 'list':
    case 'observerN':
      sit(a, P.SIT_STILL).lookAt(WD_C.x, WD_C.z, 0.7)
      break
    case 'freedom': {
      const obsYaw = toward(ARIF_POS.stand.x, ARIF_POS.stand.z, 4.3, 2.6)
      if (u < 0.04) sit(a, P.SIT_STILL)
      else if (u < 0.3) {
        const t = s(0.04, 0.2, u)
        a.place(SEAT.x + (ARIF_POS.stand.x - SEAT.x) * t, SEAT.z + (ARIF_POS.stand.z - SEAT.z) * t, PI + (obsYaw - PI) * s(0.12, 0.3, u))
        a.blend(
          [
            [0.04, P.SIT_STILL],
            [0.16, P.STAND],
          ],
          u,
        )
      } else if (u < 0.8) {
        a.place(ARIF_POS.stand.x, ARIF_POS.stand.z, obsYaw).hold(P.STAND)
        // The small nod.
        a.figure.joints.head.rotation.x = 0
        a.lookAt(4.3, 2.6, 0.2)
      } else {
        const t = s(0.8, 0.95, u)
        a.place(ARIF_POS.stand.x + (SEAT.x - ARIF_POS.stand.x) * t, ARIF_POS.stand.z + (SEAT.z - ARIF_POS.stand.z) * t, obsYaw + (PI - obsYaw) * t)
        a.blend(
          [
            [0.8, P.STAND],
            [0.95, P.SIT_STILL],
          ],
          u,
        )
      }
      break
    }
    case 'message':
      if (u < 0.3) {
        sit(a, P.SIT_STILL)
        a.reach('r', s(0.02, 0.06, u), c.phoneAt.x, c.phoneAt.y + 0.04, c.phoneAt.z, 0.4)
      } else if (u < 0.95) {
        sit(a, SIT_PHONE)
        holdPhone(a, c, s(0.3, 0.34, u))
      } else {
        sit(a, P.SIT_STILL)
        a.reach('r', 1 - s(0.97, 1, u), ON_DESK.phone.x, 0.8, ON_DESK.phone.z, 0.4)
      }
      break
    case 'coat': {
      if (u < 0.24) {
        sit(a, SIT_PHONE)
        holdPhone(a, c, 1)
      }
      else if (u < 0.26)
        seat(a).blend(
          [
            [0.24, SIT_PHONE],
            [0.26, P.STAND],
          ],
          u,
        )
      else if (u < 0.32) a.walk(P_TO_RACK, s(0.26, 0.32, u), P.STAND, PI, toward(ARIF_POS.rack.x, ARIF_POS.rack.z, COAT_RACK.x, COAT_RACK.z))
      else if (u < 0.45) {
        a.place(ARIF_POS.rack.x, ARIF_POS.rack.z, toward(ARIF_POS.rack.x, ARIF_POS.rack.z, COAT_RACK.x, COAT_RACK.z)).hold(P.STAND)
        if (u < 0.37) a.reach('r', Math.sin(PI * s(0.32, 0.4, u)), COAT_RACK.x - 0.05, 1.72, COAT_RACK.z - 0.08, 0.3)
        if (u > 0.4) a.reach('l', Math.sin(PI * s(0.4, 0.46, u)), 3.75, 0.36, 3.3, 0.5)
      } else if (u < 0.6) a.walk(P_TO_DOOR, s(0.45, 0.6, u), P.STAND, undefined, 0)
      else {
        // At the door; opens it (0.6–0.64); turns back to the room (0.62–0.7).
        a.place(DOOR.x, ARIF_POS.door.z, s(0.62, 0.7, u) * -PI * 0.98).hold(P.STAND)
        if (u < 0.66) a.reach('r', Math.sin(PI * s(0.58, 0.68, u)), 2.24, 1.0, 3.93, 0.3)
      }
      break
    }
    case 'query':
    case 'queryGate':
      a.place(DOOR.x, ARIF_POS.door.z, -PI * 0.98).hold(P.STAND_EASY)
      break
    case 'answer':
      a.place(DOOR.x, ARIF_POS.door.z, -PI * 0.98).hold(P.STAND_EASY)
      if (c.end === 'yes') {
        if (u > 0.78 && u < 0.92) a.reach('r', 1, 2.12, 1.32 + 0.03 * Math.max(0, Math.sin(u * 140)), 3.98, 0.4)
      } else if (u > 0.06 && u < 0.24) a.reach('r', Math.sin(PI * s(0.06, 0.24, u)), 2.4, 1.62, 3.2, 0.6)
      break
    case 'gone':
      if (u < 0.1) a.walk(P_OUT, s(0.0, 0.1, u), P.STAND, -PI * 0.98, -PI / 2)
      else {
        a.visible = false
        a.place(1.6, 5.3, -PI / 2).hold(P.STAND)
      }
      break
    case 'end': {
      a.walk(P_STREET, s(0.04, 1, u) * 0.999 + 0.0005, P.CARRY, PI / 2, PI)
      a.y = -9.5
      if (u < 0.04) a.visible = false
      break
    }
    default:
      sit(a, P.SIT_LOOK)
  }
  a.apply(c.time, c.breathe)
}

export function directSelin(sl: Actor, c: Ctx) {
  const { seg, u, p } = c
  sl.begin()
  const atDesk = (pose = P.SIT_TYPE) => sl.place(SELIN_CHAIR.x, SELIN_CHAIR.z, PI / 2).hold(pose)
  const hall = () => {
    sl.place(-3.25 + Math.sin(c.time * 0.05) * 0.1, -7.25, PI).hold(P.STAND_EASY)
    sl.reach('r', 0.6, -3.25, 1.3, -7.9, 0.4)
  }
  switch (seg as SegmentId) {
    case 'open':
      sl.visible = false
      hall()
      break
    case 'enter':
    case 'coffee':
    case 'intro':
      hall()
      break
    case 'ritual':
      atDesk(P.SIT_TYPE)
      if (u > 0.76 && u < 0.9) sl.reach('r', Math.sin(PI * s(0.76, 0.9, u)), 3.18, 0.8, 1.02, 0.4)
      break
    case 'selin': {
      if (u < 0.2) sl.walk(P_S_TO_ARIF, s(0, 0.2, u), P.CARRY, PI / 2, -PI / 2 - 0.4)
      else if (u < 0.9) {
        sl.place(0.85, 0.18, -PI / 2 - 0.4).hold(P.CARRY)
        if (u > 0.6 && u < 0.82) sl.reach('r', Math.sin(PI * s(0.6, 0.82, u)), 0.75, 1.42, 0.06, 0.4)
        if (u < 0.3) sl.lookAt(-1.0, -5.0, s(0.03, 0.08, u))
        if (c.glass === 'break' && u > 0.06 && u < 0.18) sl.lookAt(-0.55, -0.1, 0.9)
      } else sl.walk(P_S_OUT, s(0.9, 1.0, u) * 0.4, P.CARRY, -PI / 2 - 0.4)
      break
    }
    case 'boxes': {
      if (u < 0.28) sl.walk(P_S_IN, s(0.0, 0.28, u), CARRY_BOX, PI, -PI / 2 - 0.6)
      else if (u < 0.5) {
        sl.place(0.72, 0.12, -PI / 2 - 0.6).blend(
          [
            [0.28, CARRY_BOX],
            [0.32, P.LEAN],
            [0.42, P.LEAN],
            [0.5, P.STAND],
          ],
          u,
        )
      } else if (u < 0.8) sl.walk(P_S_BACK, s(0.5, 0.8, u), P.STAND, -PI / 2, PI / 2)
      else
        sl.place(SELIN_CHAIR.x, SELIN_CHAIR.z, PI / 2).blend(
          [
            [0.8, P.STAND],
            [0.88, P.SIT_TYPE],
          ],
          u,
        )
      break
    }
    case 'lapse':
      if (u > 0.25 && u < 0.32) {
        const k = (u - 0.25) / 0.07
        if (k < 0.45) sl.walk(P_S_SIMIT, s(0, 0.45, k), P.STAND, PI / 2, PI)
        else if (k < 0.55) sl.place(0.7, 0.05, PI).hold(P.LEAN_SOFT)
        else sl.walk(P_S_SIMIT, 1 - s(0.55, 1, k), P.STAND, PI, PI / 2)
      } else atDesk(u < 0.5 ? P.SIT_READ : P.SIT_BACK)
      break
    case 'selfQ':
    case 'hallWalk': {
      // In the hall with a torch, among the racks.
      const t = seg === 'selfQ' ? u : 1
      sl.place(-3.25 + 0.6 * Math.sin(t * 3), -9.55, -PI / 2 + 0.4 * Math.sin(t * 2)).hold(P.STAND_EASY)
      sl.reach('r', 1, -3.0, 1.1, -9.9, 0.4)
      if (seg === 'hallWalk') sl.place(-3.65, -9.95, -PI / 2).hold(TABLET)
      break
    }
    case 'heat': {
      const turned = s(0.04, 0.14, u) * (1 - s(0.5, 0.58, u)) + s(0.66, 0.74, u)
      sl.place(-3.65, -9.95, -PI / 2 + turned * 2.0).hold(TABLET)
      if (u > 0.6 && u < 0.66) sl.reach('r', Math.sin(PI * s(0.6, 0.66, u)), -3.82, 1.2, -9.95, 0.4)
      break
    }
    case 'wait':
      sl.place(-0.7, -11.4, PI).hold(P.CARRY)
      if (u > 0.62 && u < 0.86) sl.reach('r', Math.sin(PI * s(0.62, 0.86, u)), -0.72, 1.4, -11.5, 0.4)
      break
    case 'samePace':
      sl.place(-0.7, -11.4, PI).hold(P.CARRY)
      break
    default: {
      // At her desk: typing, reading; gone from GÖZLEMCİ on.
      if (p >= c.atSeg('input')) {
        sl.visible = false
        atDesk(P.SIT_READ)
      } else atDesk(seg === 'sealed' || seg === 'computing' || seg === 'meaning' || seg === 'rebuild' || seg === 'answered' ? P.SIT_READ : P.SIT_TYPE)
    }
  }
  sl.apply(c.time, c.breathe)
}
