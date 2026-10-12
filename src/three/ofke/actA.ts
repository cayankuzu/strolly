/**
 * Chapters 1–2: İSTİFA and YOL. The open office at 09.13, the boss's office
 * at 09.14, the walk back; 18.00, the elevator, the stairs, the car, the route,
 * the drive at dusk.
 */
import * as THREE from 'three'
import { lerp, smoothstep } from '@/lib/math'
import type { SetFrame, Shot } from '../kit/SetScene'
import { held, keyed, type Actor, type ShotKeys } from '../kit/direct'
import { addWalk, blendPose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import * as C from './cast'
import { env, motion, PI, ss, sub, win, type Seg } from './common'
import { runPoint } from './stairs'
import { CAR } from './street'
import { inHand, jointPos, speech, type World } from './world'
import * as S from './screens'

const KEYS: Partial<Record<Seg, ShotKeys>> = {
  open: [
    [0, [0, 1.52, -3.3, 0, 1.18, 6.2, 30]],
    [1, [0, 1.48, -1.4, 0, 1.18, 6.2, 27]],
  ],
  rise: [
    [0, [-1.6, 1.38, 3.55, 0, 1.15, 5.9, 40]],
    [0.5, [-1.55, 1.42, 3.6, 0, 1.5, 6.0, 40]],
    [1, [-1.45, 1.45, 3.75, 0, 1.52, 6.0, 38]],
  ],
  look: [
    [0, [0.55, 1.78, 6.85, -4, 1.05, 1.5, 45]],
    [0.05, [0.55, 1.78, 6.85, -4, 1.05, 1.5, 45]],
    [0.9, [0.55, 1.78, 6.85, 4, 1.05, 1.5, 45]],
    [1, [0.55, 1.78, 6.85, 4.2, 1.05, 1.6, 45]],
  ],
  sigh: [
    [0, [-0.2, 1.62, 4.85, 0, 1.6, 6.05, 30]],
    [1, [-0.12, 1.62, 5.08, 0, 1.6, 6.05, 28]],
  ],
  enter: [
    [0, [-0.95, 1.6, -2.55, -0.05, 1.5, -3.75, 38]],
    [0.6, [-0.85, 1.6, -2.7, 0.0, 1.45, -3.85, 38]],
    [0.6, [1.5, 1.6, -7.6, 0, 1.35, -4.4, 42]],
    [1, [1.4, 1.6, -7.5, 0, 1.35, -4.5, 40]],
  ],
  boss: [
    [0, [0.25, 1.64, -4.6, 0, 1.0, -7.6, 40]],
    [1, [0.2, 1.62, -4.95, 0, 1.0, -7.6, 36]],
  ],
  ask: [
    [0, [-2.2, 1.5, -5.4, 0.1, 1.25, -6.6, 42]],
    [1, [-2.05, 1.48, -5.55, 0.1, 1.25, -6.6, 40]],
  ],
  laugh: [
    [0, [0.75, 1.3, -6.05, -0.1, 1.1, -7.8, 38]],
    [1, [0.6, 1.28, -6.25, -0.1, 1.1, -7.8, 36]],
  ],
  shh: [
    [0, [0.45, 1.45, -8.45, 0, 1.6, -5.6, 34]],
    [0.34, [0.42, 1.46, -8.4, 0, 1.6, -5.6, 34]],
    [0.34, [0.3, 1.5, -5.9, -0.05, 1.12, -7.75, 34]],
    [1, [0.25, 1.48, -6.05, -0.05, 1.12, -7.75, 32]],
  ],
  pack: [
    [0, [5.6, 2.2, 7.3, -3, 1.2, 3, 45]],
    [1, [5.2, 2.1, 7.1, -4, 1.2, 2.8, 45]],
  ],
  elevator: [
    [0, [-5.3, 1.65, 2.75, -7.6, 1.42, 2.0, 40]],
    [1, [-5.55, 1.64, 2.62, -7.6, 1.4, 2.0, 38]],
  ],
  route: [
    [0, [82.32, 1.06, 1.86, 82.24, 0.99, 1.55, 26]],
    [1, [82.3, 1.03, 1.76, 82.24, 0.99, 1.55, 24]],
  ],
}

// Paths.
const P_KNOCK = makePath([
  [0, 6.08],
  [0.82, 6.15],
  [0.9, 5.1],
  [0.3, 4.1],
  [0, 3.0],
  [0, -3.35],
])
const P_BACK = makePath([
  [0, -3.3],
  [0, 3.4],
  [0.4, 4.3],
  [0.85, 5.1],
  [0.82, 6.15],
  [0.05, 6.22],
])
const P_TO_LIFT = makePath([
  [0.05, 6.1],
  [-0.9, 6.3],
  [-3.2, 5.7],
  [-5.2, 2.9],
  [-6.05, 2.25],
])

const DESKS: Array<[number, number]> = []
for (const z of [0.6, 3.0]) for (const x of [-3.9, -1.6, 1.6, 3.9]) DESKS.push([x, z])

const v = new THREE.Vector3()
const v2 = new THREE.Vector3()

/** The office's light: morning sun from the east, or 18.00 under the tubes. */
function officeLight(w: World, time: 'morning' | 'dusk', focus: 'open' | 'boss') {
  const L = w.lights
  if (time === 'morning') {
    env(w, 'office', 0.42, 0x9fb4c6)
    L.setHemi(0xe8eef4, 0x8a7f70, 0.5)
    L.setSun(0xfff0d8, 3.4, focus === 'boss' ? [14, 15, -17] : [22, 16, -8], focus === 'boss' ? [0, 0, -6.5] : [0, 0, 2], focus === 'boss' ? 6 : 12)
    if (focus === 'boss') {
      L.setKey(0xffe2b0, 28, [1.0, 2.55, -8.85], [0, 1.0, -7.5], 0.9, 6)
      L.setPoint(0, 0xf4f6ff, 2.4, [0, 2.6, -5.6], 6)
      L.setPoint(1, 0xfff2e0, 1.6, [-1.5, 2.2, -8.0], 5)
    } else {
      for (const [i, at] of [
        [0, [0, 2.7, -1.5]],
        [1, [0, 2.7, 4.2]],
        [2, [-3.5, 2.7, 2]],
        [3, [3.5, 2.7, 2]],
      ] as const)
        L.setPoint(i, 0xf2f6ff, 3.2, at, 9)
      L.setKey(0xffe2b0, 12, [0.8, 2.5, -8.8], [0, 1.0, -6.5], 0.9, 7)
    }
  } else {
    env(w, 'office', 0.22, 0x3a3550)
    L.setHemi(0x9a90b8, 0x4a4038, 0.3)
    L.setSun(0xc8a0ff, 0.5, [22, 8, 0], [0, 0, 2], 12)
    for (const [i, at] of [
      [0, [0, 2.7, -1.5]],
      [1, [0, 2.7, 4.2]],
      [2, [-3.5, 2.7, 2]],
      [3, [3.5, 2.7, 2]],
    ] as const)
      L.setPoint(i, 0xf2f6ff, 4.0, at, 9)
  }
}

/** The eight colleagues at their desks, heads down, typing. */
function colleaguesTyping(w: World, f: SetFrame) {
  const o = w.cast.office
  for (let i = 0; i < 8; i++) {
    const [x, z] = DESKS[i]
    const a = w.use(o[i])
    a.place(x, z + 0.62, PI).hold(P.SIT_TYPE)
    const t = f.time * 7 + i * 1.7
    a.reach('l', 1, x + 0.0, 0.775 + 0.012 * Math.max(0, Math.sin(t * 1.9)), z + 0.15, 0.4)
    a.reach('r', 1, x + 0.22, 0.775 + 0.012 * Math.max(0, Math.sin(t * 2.3 + 1)), z + 0.16, 0.4)
    w.coat(i, false)
    w.office.desks[i].chair.position.set(x, 0, z + 0.62)
  }
  for (const i of [8, 9]) o[i].visible = false
}

function bossAtDesk(w: World, f: SetFrame, pose: Parameters<Actor['hold']>[0]) {
  const b = w.use(w.cast.boss)
  b.place(0, -7.83, 0).hold(pose)
  return b
}

/** The boss's phone in his right hand, its screen toward his face. */
function bossPhone(w: World, a: Actor, phone = w.bossPhone.group) {
  const f = a.figure
  f.rGrip.getWorldPosition(v)
  jointPos(f, 'head', v2)
  phone.position.copy(v)
  phone.lookAt(v2)
  phone.rotateX(PI / 2)
  phone.visible = true
}

export function runActA(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const c = w.cast
  const o = w.office
  const t = f.time
  motion.walking = 0
  if (seg === 'stairs' || (seg === 'car' && u < 0.22)) return stairs(w, f, shot, seg, u)
  if (seg === 'car' || seg === 'route' || seg === 'dusk') return road(w, f, shot, seg, u)
  o.group.visible = true
  const ch2 = seg === 'pack' || seg === 'elevator'
  const inBoss = ['enter', 'boss', 'ask', 'laugh', 'shh'].includes(seg) || (seg === 'leave' && u < 0.66) || (seg === 'enter' && u >= 0.6)
  officeLight(w, ch2 ? 'dusk' : 'morning', inBoss && !(seg === 'enter' && u < 0.6) ? 'boss' : 'open')
  o.setTime(ch2 ? 'dusk' : 'morning')
  o.clock.set(ch2 ? 18 + Math.min(1, u * 0.2) / 60 : seg === 'open' || seg === 'rise' || seg === 'look' || seg === 'sigh' || seg === 'knock' ? 9 + 13 / 60 + (u * 20) / 3600 : 9 + 14 / 60)
  o.boss.clock.set(9 + 14 / 60 + (seg === 'leave' ? 2 : 0) / 60)
  o.letter.visible = true
  // The boss's door: shut, opened inward at the knock, shut again; left open at the end.
  let door = 0
  if (seg === 'enter') door = win(u, 0.33, 0.48, 0.74, 0.9) * 1.35
  else if (seg === 'leave') door = ss(0.27, 0.4, u) * 1.22
  o.boss.door.leaf.rotation.y = door
  o.arif.screen.mesh.visible = !(ch2 && (seg === 'elevator' || u > 0.12))
  o.desks.forEach((d) => (d.screen.mesh.visible = !ch2 || seg === 'pack'))
  o.arif.chair.position.set(0, 0, 6.22)
  for (const e of o.elevators) {
    e.l.position.z = -0.28
    e.r.position.z = 0.28
    e.panel.redraw((cx, W, H) => S.elevatorPanel(cx, W, H, '7'), '7')
  }
  o.boss.chair.back.rotation.x = -0.32

  const arif = c.arifS
  switch (seg) {
    case 'open': {
      colleaguesTyping(w, f)
      const a = w.use(arif)
      a.place(0, 6.24, PI).hold(C.SIT_FLAT)
      a.reach('l', 1, 0.2, 0.755, 5.82, 0.45)
      a.reach('r', 1, -0.2, 0.755, 5.82, 0.45)
      w.apply(t)
      w.mouth(a, speech(t, 0.25))
      bossAtDesk(w, f, C.FEET_UP)
      keyed(KEYS.open!, held(u, f.reduced), shot)
      break
    }
    case 'rise': {
      colleaguesTyping(w, f)
      const a = w.use(arif)
      const k = ss(0.1, 0.45, u)
      a.place(0, lerp(6.24, 6.08, k), PI).blend(
        [
          [0.1, C.SIT_FLAT],
          [0.3, P.SIT_STRAIGHT],
          [0.45, P.STAND],
        ],
        u,
      )
      a.reach('l', 1 - ss(0.1, 0.28, u), 0.2, 0.755, 5.82, 0.45)
      a.reach('r', 1 - ss(0.1, 0.28, u), -0.2, 0.755, 5.82, 0.45)
      o.arif.chair.position.z = 6.22 + 0.45 * ss(0.2, 0.5, u)
      o.arif.chair.rotation.y = PI + 0.25 * ss(0.2, 0.5, u)
      w.apply(t)
      keyed(KEYS.rise!, held(u, f.reduced), shot)
      break
    }
    case 'look': {
      colleaguesTyping(w, f)
      o.arif.chair.position.z = 6.67
      o.arif.chair.rotation.y = PI + 0.25
      const a = w.use(arif)
      a.place(0, 6.08, PI).hold(P.STAND).lookAt(lerp(-4, 4, ss(0.05, 0.9, u)), 1.5, 1)
      w.apply(t)
      keyed(KEYS.look!, held(u, f.reduced), shot)
      break
    }
    case 'sigh': {
      colleaguesTyping(w, f)
      o.arif.chair.position.z = 6.67
      o.arif.chair.rotation.y = PI + 0.25
      const a = w.use(arif)
      a.place(0, 6.08, PI).blend(
        [
          [0.05, P.STAND],
          [0.3, C.BREATHE_IN],
          [0.42, C.BREATHE_OUT],
          [0.6, P.STAND],
        ],
        u,
      )
      // Glasses pushed up with one finger, then the tie knot with both hands.
      const g = win(u, 0.45, 0.52, 0.6, 0.67)
      a.reach('r', g, 0.0, 1.66, 5.98, 0.3)
      const tieW = win(u, 0.7, 0.78, 0.92, 0.99)
      a.reach('l', tieW, 0.03, 1.43, 5.98, 0.5)
      a.reach('r', tieW, -0.03, 1.43, 5.98, 0.5)
      w.apply(t)
      keyed(KEYS.sigh!, held(u, f.reduced), shot)
      break
    }
    case 'knock': {
      colleaguesTyping(w, f)
      o.arif.chair.position.z = 6.67
      o.arif.chair.rotation.y = PI + 0.25
      const a = w.use(arif)
      if (u < 0.5) a.walk(P_KNOCK, sub(u, 0.0, 0.5), P.STAND, PI, PI)
      else a.place(0, -3.35, PI).hold(P.STAND)
      // Two raps on the frosted glass; the fist stays up.
      const raise = ss(0.48, 0.52, u)
      const tap = u > 0.52 && u < 0.58 ? Math.abs(Math.sin(((u - 0.52) / 0.03) * PI)) * 0.05 : 0
      a.reach('r', raise, 0.12, 1.58, -3.82 + tap, 0.35)
      w.apply(t)
      motion.step = a.step
      motion.walking = a.walking
      // Low behind him down the aisle, then held on the door and the raised hand.
      if (u < 0.5) {
        const z = a.z
        shot.pos.set(0.22, 1.25, z + 1.9)
        shot.tgt.set(0, 1.3, z - 4)
        shot.fov = 42
      }
      if (u >= 0.45) {
        const k = ss(0.45, 0.56, u)
        const hp = new THREE.Vector3(0.6, 1.6, -1.5)
        const ht = new THREE.Vector3(0, 1.5, -3.85)
        if (u < 0.5) {
          shot.pos.lerp(hp, k)
          shot.tgt.lerp(ht, k)
        } else {
          shot.pos.copy(hp).lerp(new THREE.Vector3(0.75, 1.62, -1.9), ss(0.56, 1, u))
          shot.tgt.copy(ht)
        }
        shot.fov = 42
      }
      break
    }
    case 'enter': {
      colleaguesTyping(w, f)
      o.arif.chair.position.z = 6.67
      o.arif.chair.rotation.y = PI + 0.25
      const a = w.use(arif)
      // Wipe, handle, the quick step in, the door shut behind him.
      const z = lerp(-3.35, -4.6, ss(0.48, 0.74, u))
      a.place(0.02, z, PI).hold(P.STAND)
      a.reach('l', win(u, 0.05, 0.14, 0.34, 0.42), 0.0, 1.71, z - 0.12, 0.6)
      a.reach('r', win(u, 0.28, 0.34, 0.47, 0.52), 0.36, 1.0, -3.83, 0.4)
      a.reach('r', win(u, 0.74, 0.8, 0.88, 0.94), 0.32, 1.0, -4.0, 0.7)
      w.apply(t)
      bossAtDesk(w, f, C.FEET_UP)
      keyed(KEYS.enter!, held(u, f.reduced), shot)
      break
    }
    case 'boss':
    case 'ask':
    case 'laugh':
    case 'shh': {
      const b = bossAtDesk(w, f, C.FEET_UP)
      const a = w.use(arif)
      let open = 0
      let bossOpen = 0
      if (seg === 'boss') {
        a.place(0.05, -4.7, PI).hold(P.STAND)
        a.visible = false
        bossOpen = win(u, 0.64, 0.66, 0.92, 0.96)
      } else if (seg === 'ask') {
        const z = lerp(-5.6, -5.82, ss(0.5, 0.58, u))
        a.place(0, z, PI).blend(
          [
            [0.0, C.CLASPED],
            [0.48, C.CLASPED],
            [0.56, C.APPEAL],
          ],
          u,
        )
        open = win(u, 0.03, 0.06, 0.45, 0.48) + win(u, 0.52, 0.55, 0.97, 1)
        b.lookAt(0, -5.8, ss(0.88, 0.95, u) * 0.7)
      } else if (seg === 'laugh') {
        a.place(0, -5.82, PI).hold(C.CLASPED)
        b.blend(
          [
            [0.0, C.FEET_UP],
            [0.06, C.FEET_UP_LAUGH],
            [0.26, C.FEET_UP_LAUGH],
            [0.34, C.FEET_UP],
            [0.48, C.FEET_UP],
            [0.58, C.FEET_UP_POINT],
          ],
          u,
        )
        // Pointing the phone at Arif, then waving it toward the door.
        if (u > 0.5) {
          const wave = ss(0.8, 0.9, u) * Math.sin((u - 0.8) * 60) * 0.12
          b.reach('r', ss(0.48, 0.58, u), 0.15 + wave, 1.12, -7.15, 0.4)
        }
        bossOpen = u < 0.3 ? 0.4 + 0.5 * Math.abs(Math.sin(t * 9)) : win(u, 0.34, 0.36, 0.43, 0.45) * speech(t, 1) + win(u, 0.5, 0.52, 0.97, 1) * speech(t, 1)
      } else {
        a.place(0, -5.82, PI).blend(
          [
            [0.0, C.CLASPED],
            [0.08, C.BUT],
          ],
          u,
        )
        open = win(u, 0.06, 0.12, 0.3, 0.34) * 0.5
        // Finger to the lips, eyes on the phone; two fingers flick toward the door.
        const lips = win(u, 0.36, 0.42, 0.66, 0.72)
        if (lips > 0) {
          w.apply(t)
          jointPos(b.figure, 'head', v)
          b.reach('l', lips, v.x + 0.01, v.y + 0.02, v.z + 0.12, 0.3)
        }
        const flick = win(u, 0.7, 0.74, 0.86, 0.92)
        b.reach('l', flick, 0.3 + 0.08 * Math.sin(u * 90), 1.15, -7.4, 0.5)
        bossOpen = win(u, 0.38, 0.4, 0.97, 1) * speech(t, 0.6)
      }
      w.apply(t)
      w.mouth(a, speech(t, open))
      w.mouth(b, bossOpen)
      bossPhone(w, b)
      keyed(KEYS[seg]!, held(u, f.reduced), shot)
      break
    }
    case 'leave': {
      const b = bossAtDesk(w, f, C.FEET_UP)
      b.lookAt(0, -3.9, win(u, 0.5, 0.56, 0.64, 0.7) * 0.9)
      const a = w.use(arif)
      if (u < 0.25) a.place(0, -5.82, PI).blend([[0.03, C.CLASPED], [0.12, C.NOD], [0.22, P.STAND]], u)
      else if (u < 0.56) {
        // Turns, pulls the door open, out fast; the hand lets go at the threshold.
        const k = sub(u, 0.25, 0.48)
        a.place(lerp(0.0, 0.05, k), lerp(-5.82, -3.1, ss(0.32, 0.48, u)), lerp(PI, 0, ss(0.25, 0.3, u))).hold(P.STAND)
        a.walking = u > 0.32 && u < 0.48 ? 0.8 : 0
        if (u > 0.32 && u < 0.48) {
          a.walk(makePath([[0.05, -5.2], [0.02, -3.0]]), sub(u, 0.32, 0.48), P.STAND, 0, 0)
        }
        a.reach('r', win(u, 0.26, 0.3, 0.38, 0.42), 0.36, 1.0, -4.05, 0.5)
        if (u > 0.5) a.visible = false
      } else {
        // The walk back up the aisle, muttering; he sits.
        if (u < 0.95) a.walk(P_BACK, sub(u, 0.56, 0.95), P.STAND, 0, PI)
        else a.place(0.05, 6.22, PI).blend([[0.95, P.STAND], [1.0, P.SIT_STRAIGHT]], u)
        if (u > 0.9) o.arif.chair.position.z = 6.22
      }
      colleaguesTyping(w, f)
      w.apply(t)
      w.mouth(a, win(u, 0.03, 0.06, 0.18, 0.22) * speech(t, 0.6) + (u > 0.66 ? speech(t, 0.35) : 0))
      w.mouth(b, 0)
      bossPhone(w, b)
      motion.step = a.step
      motion.walking = a.walking
      if (u < 0.66) {
        shot.pos.set(-1.25, 1.5, -8.2)
        shot.tgt.set(0.0, 1.25, -4.2)
        shot.fov = 42
        shot.pos.lerp(v.set(-1.1, 1.52, -8.05), ss(0, 0.66, u))
      } else {
        const z = a.z
        shot.pos.set(0.1, 1.58, Math.min(z + 2.4, 7.6))
        shot.tgt.set(0, 1.42, z)
        shot.fov = 42
      }
      break
    }
    case 'pack': {
      // 18.00: chairs back, coats on, the office emptying; Arif switches off and goes.
      const o8 = c.office
      for (let i = 0; i < 8; i++) {
        const [x, z] = DESKS[i]
        const a = w.use(o8[i])
        const up = ss(0.02 + i * 0.015, 0.2 + i * 0.015, u)
        w.coat(i, u > 0.24 + i * 0.01)
        if (u < 0.42 + i * 0.03) {
          a.place(x, lerp(z + 0.62, z + 0.95, up), PI).blend(
            [
              [0.02, P.SIT_TYPE],
              [0.2, P.STAND],
              [0.26 + i * 0.01, C.JACKET_ON],
              [0.38 + i * 0.01, P.STAND],
            ],
            u,
          )
        } else {
          const path = makePath([
            [x, z + 0.95],
            [x * 0.5 - 0.3, z + 1.25],
            [-5.0 - (i % 3) * 0.4, 1.6 + (i % 4) * 0.35],
          ])
          a.walk(path, sub(u, 0.42 + i * 0.03, 0.95), P.STAND, PI)
        }
        o.desks[i].chair.position.set(x, 0, z + 0.62 + up * 0.4)
      }
      const a = w.use(u < 0.3 ? arif : c.arifJ)
      if (u < 0.5) {
        a.place(0.05, 6.1, PI).blend(
          [
            [0.0, P.SIT_STRAIGHT],
            [0.08, P.STAND],
            [0.24, C.JACKET_ON],
            [0.36, P.STAND],
          ],
          u,
        )
        a.reach('r', win(u, 0.06, 0.1, 0.14, 0.18), 0.52, 0.94, 5.5, 0.4)
      } else a.walk(P_TO_LIFT, sub(u, 0.5, 1.0), P.STAND, PI)
      w.apply(t)
      if (u > 0.3) inHand(w.bag, a.figure, 'l', [0, 0, 0])
      motion.step = a.step
      motion.walking = a.walking
      keyed(KEYS.pack!, held(u, f.reduced), shot)
      break
    }
    case 'elevator': {
      const e = o.elevators[0]
      const open = win(u, 0.05, 0.16, 0.7, 0.95)
      e.l.position.z = -0.28 - open * 0.56
      e.r.position.z = 0.28 + open * 0.56
      e.cab.visible = true
      const a = w.use(c.arifJ)
      a.place(-6.05, 2.25, -PI / 2).hold(P.STAND)
      // Ten people packed in, all looking at him.
      const spots: Array<[number, number]> = [
        [-7.3, 1.55],
        [-7.32, 2.0],
        [-7.28, 2.45],
        [-7.75, 1.4],
        [-7.78, 1.8],
        [-7.76, 2.2],
        [-7.74, 2.6],
        [-8.22, 1.6],
        [-8.25, 2.05],
        [-8.2, 2.48],
      ]
      c.office.forEach((p, i) => {
        w.use(p).place(spots[i][0], spots[i][1], PI / 2).hold(P.STAND).lookAt(-6.05, 2.25, 0.9)
        if (i < 8) w.coat(i, true)
      })
      w.apply(t)
      inHand(w.bag, a.figure, 'l', [0, 0, 0])
      keyed(KEYS.elevator!, held(u, f.reduced), shot)
      break
    }
  }
}

/** The stairwell: seven floors down, three, five steps at a time; then the ground exit. */
function stairs(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const st = w.stairs
  st.group.visible = true
  const L = w.lights
  env(w, 'night', 0.25, 0x0d1010)
  L.setHemi(0x9aaba0, 0x2a2c2a, 0.35)
  const a = w.use(w.cast.arifJ)
  const r = { x: 0, y: 0, z: 0, yaw: 0, leap: 0, level: 7 }
  if (seg === 'stairs') {
    if (u < 0.1) {
      const k = sub(u, 0, 0.1)
      r.x = 40.0 + 0.2 * k
      r.y = 22.4
      r.z = lerp(2.6, 1.55, k)
      r.yaw = PI
    } else runPoint(sub(u, 0.1, 0.95), r)
    if (u > 0.95) runPoint(1, r)
    const s = sub(u, 0.1, 0.95)
    const phase = s * 7 * 9.6 * 1.4 * PI
    a.place(r.x, r.z, r.yaw).hold(C.RUN)
    blendPose(a.pose, C.LEAP, r.leap * 0.85, a.pose)
    addWalk(a.pose, phase, (1 - r.leap) * 0.9)
    a.y = r.y
    a.walking = 1
    a.step = Math.floor(phase / PI)
    a.reach('l', r.leap > 0 ? 0 : 0.3, r.x > 40 ? 40.82 : 39.18, r.y + 0.95, r.z, 0.6)
    w.apply(f.time)
    // Lights on the landings round him.
    const lv = Math.round(r.y / 3.2)
    for (let i = 0; i < 4; i++) {
      const y = (lv + 1 - i) * 3.2 - (i % 2) * 1.6 + 2.4
      L.setPoint(i, 0xe6fff0, 7, [40, y, i % 2 ? -1.8 : 1.8], 6)
    }
    if (u > 0.52 && u < 0.66) {
      // The side shot on landing 3 as he jumps five steps.
      shot.pos.set(41.6, 10.3, 1.9)
      shot.tgt.set(38.6, 10.2, -0.2)
      shot.fov = 44
    } else {
      shot.pos.set(40.05, r.y + 4.6, 0.25)
      shot.tgt.set(r.x * 0.6 + 40 * 0.4, r.y + 0.6, r.z * 0.6)
      shot.fov = 50
    }
  } else {
    // car u 0–0.22: through the ground exit.
    const k = sub(u, 0, 0.22)
    const path = makePath([
      [38.6, 1.0],
      [39.3, 1.6],
      [40.0, 2.0],
      [40.0, 3.4],
    ])
    a.walk(path, k, C.RUN, PI / 2)
    a.reach('r', win(k, 0.4, 0.55, 0.75, 0.85), 40.1, 1.0, 2.15, 0.4)
    st.setExit(ss(0.5, 0.75, k))
    w.apply(f.time)
    L.setPoint(0, 0xe6fff0, 6, [40, 2.6, 1.9], 6)
    L.setPoint(1, 0xffb070, 4 * ss(0.5, 0.8, k), [40, 1.5, 3.4], 5)
    shot.pos.set(40.8, 1.0, -0.4)
    shot.tgt.set(40, 1.1, 2.25)
    shot.fov = 40
  }
  motion.step = a.step
  motion.walking = a.walking
}

/** The street, the car, the route, the drive. */
function road(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const st = w.street
  st.group.visible = true
  const L = w.lights
  const car = w.car
  env(w, 'dusk', 0.55, 0x3a3450, [40, 260])
  L.setHemi(0x8f7ab0, 0x4a3a30, 0.45)
  L.setSun(0xffa070, 1.1, [CAR.x - 60, 14, 26], [CAR.x, 0, -10], 30)
  let dz = 0
  if (seg === 'dusk') dz = -92 * ss(0, 1, u) - 1.5 * u
  if (seg === 'car') dz = 0
  w.carHolder.visible = true
  w.carHolder.position.set(CAR.x, 0, CAR.z + dz)
  w.carHolder.rotation.y = 0
  car.lights.color.setRGB(1.6, 1.5, 1.3)
  car.tail.color.setRGB(0.9, 0.08, 0.06)
  // Street lamps coming on as the dusk deepens.
  const lampOn = seg === 'car' ? 0.55 : seg === 'route' ? 0.7 : 0.7 + 0.3 * u
  st.lampMat.color.setRGB(1.0 * lampOn * 1.4, 0.8 * lampOn * 1.4, 0.55 * lampOn * 1.4)
  // The four lamps nearest the car light the scene.
  const cz = CAR.z + dz
  const near = [...st.lampPositions].sort((p, q) => Math.abs(p.z - cz) - Math.abs(q.z - cz)).slice(0, 4)
  near.forEach((p, i) => L.setPoint(i, 0xffc890, 26 * lampOn, [p.x, p.y, p.z], 18))
  L.setPoint(4, 0x9fe8dc, seg === 'car' && u < 0.5 ? 0 : 0.5, [CAR.x - 0.05, 1.15, cz - 0.4], 1.5)
  // Traffic ahead.
  for (const tr of st.traffic) tr.g.position.set(tr.lane, 0, tr.z0 + dz * tr.speed - (seg === 'dusk' ? 0 : 0))
  const a = w.use(w.cast.arifJ)
  const card = car.card
  card.visible = true
  if (seg === 'car') {
    car.door.rotation.y = -1.05 * win(u, 0.4, 0.47, 0.54, 0.58)
    st.setDoor(win(u, 0.2, 0.25, 0.3, 0.36))
    if (u < 0.5) {
      const path = makePath([
        [78.75, 4.0],
        [80.1, 3.7],
        [81.0, 2.9],
        [81.15, 2.45],
      ])
      if (u < 0.45) a.walk(path, sub(u, 0.22, 0.45), C.RUN, PI / 2, PI)
      else a.place(lerp(81.15, 81.8, sub(u, 0.45, 0.5)), lerp(2.45, 2.22, sub(u, 0.45, 0.5)), PI).blend([[0.45, P.STAND], [0.5, C.DRIVE]], u)
    } else a.place(81.8, 2.22, PI).hold(C.DRIVE)
    if (u >= 0.45) {
      a.reach('l', ss(0.5, 0.56, u), 81.66, 1.03, 1.86, 0.5)
      a.reach('r', ss(0.5, 0.56, u) * (1 - ss(0.6, 0.66, u)), 81.94, 1.03, 1.86, 0.5)
      a.reach('r', ss(0.62, 0.7, u), 82.2, 1.0 + 0.01 * Math.sin(f.time * 9), 1.6, 0.3)
    }
    w.apply(f.time)
    car.screen.redraw((c, W, H) => S.route(c, W, H, 0, 0), 'kb0')
    motion.step = a.step
    motion.walking = a.walking
    if (u < 0.5) {
      shot.pos.set(84, 1.6, 9).lerp(v.set(84.4, 1.55, 8.6), sub(u, 0.22, 0.5))
      shot.tgt.set(81, 1.0, 2.2)
      shot.fov = 42
    } else {
      shot.pos.set(82.72, 1.24, 1.92).lerp(v.set(82.68, 1.22, 2.0), sub(u, 0.5, 1))
      shot.tgt.set(81.8, 1.1, 1.55)
      shot.fov = 44
    }
    return
  }
  car.door.rotation.y = 0
  st.setDoor(0)
  a.place(81.8, cz + 0.22, PI).hold(C.DRIVE)
  if (seg === 'route') {
    const typed = sub(u, 0.1, 0.4)
    const lit = sub(u, 0.4, 0.6)
    car.screen.redraw((c, W, H) => S.route(c, W, H, typed, lit), `r:${Math.floor(typed * 11)}:${Math.round(lit * 20)}`)
    a.reach('l', 1, 81.66, 1.03, cz - 0.14, 0.5)
    a.reach('r', win(u, 0.0, 0.08, 0.4, 0.48), 82.18 + 0.03 * Math.sin(f.time * 7), 0.99, cz - 0.42, 0.3)
    w.apply(f.time)
    keyed(KEYS.route!, held(u, f.reduced), shot)
  } else {
    car.screen.redraw((c, W, H) => S.route(c, W, H, 1, 1), 'r:done')
    a.reach('l', 1, 81.64, 1.04, cz - 0.15, 0.5)
    a.reach('r', 1, 81.96, 1.04, cz - 0.15, 0.5)
    w.apply(f.time)
    w.mouth(a, speech(f.time, 0.3))
    // His profile from the passenger seat; the view swings to the billboard as it passes.
    const look = win(u, 0.36, 0.46, 0.58, 0.66)
    shot.pos.set(82.66, 1.2, cz + 0.32)
    shot.tgt.set(81.8, 1.14, cz + 0.12).lerp(v.set(83.6, 2.4, cz - 6), look * 0.9)
    shot.fov = 40
  }
}
