/**
 * The second floor: chapter 8 (İKİNCİ KAT) — the corridor and its posters,
 * the two staff, the tear (flicker, distortion, the four cuts), the chase, the
 * hum room, the code on the posters, the three kiosks, the swarm, the nurse's
 * real face, the fade. The flashes to the real lab in between live in actsLab.
 */
import * as THREE from 'three'
import { TEXT } from '@/stories/beyinkoku/text'
import { addWalk } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import type { SetFrame } from '../kit/SetScene'
import type { Act, Director } from './BeyinKokuScene'
import { HAND_CHEST, RUN, STAFF, STAFF_HAND, STAFF_REACH } from './cast'
import { drawKiosk, drawPoster } from './screens'
import { bump, C, extra, FACE_E, FACE_N, FACE_S, FACE_W, L, light, PI, S, STIFF, tick, yawTo } from './staging'

const LINES = (id: string) => TEXT.find((t) => t.id === id)?.lines ?? []
const SLOGANS = LINES('slogans')
const CODE = LINES('code-lines')
const T1 = LINES('terminal-1')
const T2 = LINES('terminal-2')
const T3 = LINES('terminal-3')
const FIFTH = 'Karar, gerekçeden önce gelir.'
const LABELS = ['PERSONEL ONAYI', 'PERDE UYUM ÖLÇÜMÜ', 'HAFIZA EŞLEME KAYDI']

const CUFF = new THREE.Euler(PI / 2, 0, 0)

const IN_WALK = makePath([
  [400, 5.5],
  [400.1, -2],
  [400.3, -9.75],
])
const TOWARD = makePath([
  [400.15, -9.75],
  [400.0, -13.0],
])
const BACK_SOUTH = makePath([
  [400, -16.6],
  [400.1, -2.3],
])
const OUT_OF_ROOM = makePath([
  [397.6, -2.0],
  [398.9, -1.9],
  [399.6, -2.3],
])
const TO_END = makePath([
  [400, -24],
  [399.8, -28.6],
])
const SWARM_S: Array<[number, number]> = [
  [399.3, -17],
  [400.7, -16.5],
  [399.8, -15.5],
  [400.4, -18],
]
const SWARM_S_END: Array<[number, number]> = [
  [399.4, -28.4],
  [400.8, -28.0],
  [399.9, -27.0],
  [400.5, -29.3],
]
const SWARM_E: Array<[number, number]> = [
  [402.0, -20.3],
  [402.0, -20.0],
  [401.9, -20.6],
]
const SWARM_E_END: Array<[number, number]> = [
  [400.9, -29.9],
  [400.2, -31.0],
  [401.2, -30.9],
]


function posters(d: Director, code: boolean, flick = 0) {
  d.f2.posters.forEach((p, i) => {
    if (i === 4) {
      p.redraw((c, W, H) => drawPoster(c, W, H, FIFTH, null, 0.55), 'poster:fifth')
      return
    }
    const useCode = code !== flick > 0.5
    p.redraw((c, W, H) => drawPoster(c, W, H, SLOGANS[i] ?? '', useCode ? (CODE[i] ?? null) : null, 0), `poster:${i}:${useCode ? 'code' : 'text'}`)
  })
}

function kiosks(d: Director, f: SetFrame, modes: Array<'off' | 'face' | 'lines' | 'wave'>, noise = 0) {
  d.f2.kiosks.forEach((k, i) => {
    const mode = modes[i]
    const lines = i === 0 ? T1.slice(1) : i === 1 ? T2.slice(1) : T3.slice(1)
    k.redraw((c, W, H) => drawKiosk(c, W, H, LABELS[i], mode, lines, f.time, i === 1 ? noise : 0), `kiosk:${i}:${mode}:${Math.round(noise * 20)}:${mode === 'off' ? 0 : tick(f.time, 6)}`)
  })
}

/** The woman and the man, standing at their spots facing Levy; `monster` 0…1, the man's needle grows with it. */
function pair(d: Director, o: { nx: number; nz: number; mx: number; mz: number; monster: number; needle?: number; hand?: number; reach?: number; overlap?: number; walkPhase?: number; walkAmt?: number; yaw?: number }) {
  const n = d.use(d.nurse)
  n.place(o.nx, o.nz, o.yaw ?? FACE_S)
  n.blend([[0, STAFF], [1, STAFF_HAND]], o.hand ?? 0)
  if (o.walkAmt) addWalk(n.pose, o.walkPhase ?? 0, o.walkAmt)
  d.apply(d.nurse)
  d.nurse.kit?.set(o.monster, o.overlap ?? 0)
  d.devices.get(d.nurse)?.set(o.monster > 0.5 ? 'needle' : 'pen', C(o.monster * 1.2))
  const m = d.use(d.staff)
  m.place(o.mx, o.mz, o.yaw ?? FACE_S)
  m.blend([[0, STAFF], [1, STAFF_REACH]], o.reach ?? 0)
  if (o.walkAmt) addWalk(m.pose, (o.walkPhase ?? 0) + 1.3, o.walkAmt)
  d.apply(d.staff)
  d.staff.kit?.set(o.monster, o.overlap ?? 0)
  d.devices.get(d.staff)?.set(o.needle !== undefined ? (o.needle > 0.02 ? 'needle' : 'pen') : o.monster > 0.5 ? 'needle' : 'pen', o.needle ?? C(o.monster * 1.2))
}

/** Three blinks of the fluorescents inside [a, b). */
const stutter = (u: number, a: number, b: number) => {
  if (u < a || u >= b) return 1
  const k = ((u - a) / (b - a)) * 6
  return Math.floor(k) % 2 === 0 ? 0.15 : 1
}

/** A nervous flicker driven by time (between flashes the hall is dark). */
const flickerT = (t: number) => (Math.sin(t * 23) * Math.sin(t * 7.1) > 0.15 ? 1 : 0.08)

/** The seven swarm figures, walking in from both ends; monsters after `monster`. */
function swarm(d: Director, k: number, monster: number, around?: { x: number; z: number; r: number }) {
  for (let i = 0; i < 7; i++) {
    const p = extra(d, i, 'white')
    const a = d.use(p)
    if (around) {
      const ang = -1.35 + (i / 6) * 2.7
      const x = around.x + Math.sin(ang) * around.r
      const z = around.z + Math.cos(ang) * around.r
      a.place(C(x, 398.75, 401.25), Math.max(z, -33.7), yawTo(around.x - x, around.z - z))
      a.hold(STAFF_REACH)
    } else {
      const from = i < 4 ? SWARM_S[i] : SWARM_E[i - 4]
      const to = i < 4 ? SWARM_S_END[i] : SWARM_E_END[i - 4]
      const kk = C(k * 1.15 - i * 0.03)
      const x = L(from[0], to[0], kk)
      const z = L(from[1], to[1], kk)
      a.place(x, z, yawTo(to[0] - from[0], to[1] - from[1]))
      a.hold(STAFF)
      const dist = Math.hypot(to[0] - from[0], to[1] - from[1]) * kk
      addWalk(a.pose, (dist / 1.1) * PI * 2, kk > 0.001 && kk < 0.999 ? 0.9 : 0)
    }
    d.apply(p)
    p.kit?.set(monster, monster)
    d.devices.get(p)?.set(monster > 0.5 ? (['needle', 'hook', 'pipe'] as const)[i % 3] : 'pen', 1)
  }
}

export const actFloor: Act = (d, f, seg, u, shot) => {
  const t = f.time
  d.wear('jacket')
  shot.handheld = 1
  switch (seg) {
    case 'slogans': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      const a = d.use(d.levy)
      if (u < 0.5) a.walk(IN_WALK, u / 0.5, P.STAND, FACE_N, FACE_N)
      else {
        a.place(400.3, -9.75, yawTo(1.1, 0.75))
        a.hold(P.STAND_EASY)
        a.lookAt(401.4, -9, 1)
      }
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      light.floor2(d, a.z)
      if (u < 0.45) {
        shot.pos.set(400.2, 1.7, a.z + 2.6)
        shot.tgt.set(400, 1.5, a.z - 6)
        shot.fov = 45
      } else d.cam([[0.45, [400.1, 1.7, -6.0, 400, 1.5, -14, 45]], [0.5, [400.1, 1.7, -6.0, 400, 1.5, -14, 45]], [0.5, [399.0, 1.62, -7.35, 401.3, 1.55, -9.25, 34]], [1, [399.02, 1.62, -7.4, 401.3, 1.55, -9.25, 34]]], u, shot)
      return true
    }
    case 'staff': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      light.floor2(d, -14)
      const a = d.use(d.levy)
      a.place(400.15, -9.75, FACE_N)
      a.hold(P.STAND_EASY)
      d.apply(d.levy)
      d.f2.staffDoor.rotation.y = 1.3 * S(0, 0.06, u) * (1 - S(0.3, 0.45, u))
      const kn = S(0.02, 0.2, u)
      const km = S(0.08, 0.26, u)
      pair(d, {
        nx: L(401.9, 399.7, kn),
        nz: L(-20.3, -19.9, kn),
        mx: L(402.0, 400.5, km),
        mz: L(-20.6, -20.3, km),
        monster: 0,
        walkPhase: kn * 9,
        walkAmt: kn > 0.01 && kn < 0.99 ? 0.8 : 0,
        yaw: kn < 0.99 ? L(FACE_W, FACE_S, kn) : FACE_S,
      })
      d.cam([[0, [400.65, 1.72, -7.6, 400, 1.5, -20, 32]], [0.5, [400.65, 1.72, -7.7, 400, 1.5, -20, 32]], [0.5, [400, 1.6, -16.5, 400, 1.55, -20, 35]], [1, [400, 1.6, -16.6, 400, 1.55, -20, 35]]], u, shot)
      return true
    }
    case 'flicker': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      const a = d.use(d.levy)
      a.walk(TOWARD, S(0.03, 0.4, u), P.STAND, FACE_N, FACE_N)
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      const on = stutter(u, 0.25, 0.3)
      const monster = S(0.4, 0.46, u)
      light.floor2(d, -15, on * (1 - 0.7 * monster), monster)
      d.f2.light((i) => on > 0.5 || i % 2 === 0)
      pair(d, { nx: 399.7, nz: -19.9, mx: 400.5, mz: -20.3, monster, needle: S(0.42, 0.55, u) })
      d.cam(
        [
          [0, [399.3, 1.7, -7.9, 400, 1.55, -19, 38]],
          [0.37, [399.3, 1.7, -11.2, 400, 1.55, -19, 38]],
          [0.4, [399.3, 1.7, -11.2, 400, 1.55, -19, 38]],
          [0.4, [400.3, 1.6, -18.4, 399.7, 1.6, -19.9, 28]],
          [0.7, [400.3, 1.6, -18.4, 399.7, 1.6, -19.9, 28]],
          [0.7, [399.9, 1.2, -18.6, 400.25, 1.05, -19.9, 28]],
          [1, [399.9, 1.2, -18.6, 400.25, 1.05, -19.9, 28]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'cut': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      const a = d.use(d.levy)
      a.place(400, -13.2, FACE_N)
      a.hold(P.STAND)
      a.visible = u < 0.53
      d.apply(d.levy)
      const fog = d.scene.fog as THREE.FogExp2
      fog.color.setHex(0xc9d48a)
      fog.density = 0.03 * S(0, 0.4, u)
      d.fx.wash(0.78, 0.83, 0.5, 0.22 * S(0, 0.4, u))
      const strobe = u >= 0.53 ? flickerT(t) : 1
      light.floor2(d, -17, 0.35 * strobe, 1)
      d.f2.light((i) => (strobe > 0.5 ? i % 3 !== 1 : i % 3 === 1))
      const mouth = 0.6 + 0.4 * Math.sin(t * 9)
      pair(d, { nx: 399.7, nz: -19.9, mx: 400.5, mz: -20.3, monster: 1, needle: 1, reach: S(0.75, 0.8, u), overlap: 0.3 * mouth })
      const cuts: Array<readonly [number, number, number, number, number, number, number]> = [
        [399.1, 1.62, -18.6, 399.7, 1.6, -19.9, 24],
        [400.9, 1.12, -19.0, 400.25, 1.0, -19.9, 26],
        [399.9, 1.42, -18.2, 400.5, 1.3, -19.8, 30],
        [399.9, 1.78, -19.1, 399.7, 1.72, -19.9, 22],
      ]
      if (u < 0.53) d.cam([[0, [400, 1.65, -13.5, 400, 1.6, -19, 35]], [0.53, [400, 1.65, -13.7, 400, 1.6, -19, 35]]], u, shot)
      else {
        const i = Math.min(3, Math.floor((u - 0.53) / 0.1125))
        const k = cuts[i]
        shot.pos.set(k[0], k[1], k[2])
        shot.tgt.set(k[3], k[4], k[5])
        shot.fov = k[6]
        d.flashCut(u, 0.53 + i * 0.1125, 0.012)
      }
      return true
    }
    case 'chase': {
      d.place('f2')
      d.flashCut(u, 0, 0.02)
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      const a = d.use(d.levy)
      if (u < 0.5) {
        a.place(400, -16.6, FACE_N)
        a.hold(P.STAND)
      } else a.walk(BACK_SOUTH, (u - 0.5) / 0.48, RUN, FACE_N, FACE_S, 1.3)
      d.apply(d.levy)
      d.steps(a.walking * 1.4, a.step)
      const flick = Math.max(bump(0.6, 0.64, u), bump(0.72, 0.76, u), bump(0.85, 0.89, u))
      const monster = flick > 0.6 ? 1 : 0
      light.floor2(d, u < 0.5 ? -17 : a.z, 1 - 0.8 * monster, monster)
      d.f2.light((i) => !monster || i % 2 === 1)
      const run = S(0.5, 0.56, u)
      const back = u < 0.5 ? 0 : run
      pair(d, {
        nx: L(399.7, 399.7, back),
        nz: L(-19.9, a.z - 3.3, back),
        mx: L(400.5, 400.45, back),
        mz: L(-20.3, a.z - 3.9, back),
        monster,
        needle: monster,
        hand: S(0.24, 0.3, u) * (1 - run),
        yaw: FACE_S,
        walkPhase: (a.z + 16.6) * 4.5,
        walkAmt: back * 1.2,
      })
      if (u < 0.5) d.cam([[0, [400.72, 1.66, -15.25, 399.95, 1.55, -19.9, 35]], [0.5, [400.7, 1.66, -15.3, 399.95, 1.55, -19.9, 35]]], u, shot)
      else {
        shot.pos.set(400.35, 1.6, Math.min(1.4, a.z + 3.6))
        shot.tgt.set(a.x, 1.5, a.z)
        shot.fov = 45
      }
      return true
    }
    case 'room': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      light.floor2(d, -2, 0.8)
      d.rig.pt(1, 0xf4f7ff, 1.4, [396, 2.9, -2], 5, 1.6)
      d.f2.roomDoor.rotation.y = -1.3 * (1 - S(0, 0.03, u))
      const a = d.use(d.levy)
      const turn = S(0.46, 0.5, u)
      a.place(L(397.3, 397.5, turn), L(-2.6, -2.3, turn), L(FACE_W, FACE_E, turn))
      a.hold(P.STAND)
      d.bend(d.levy, 'head', 0, 0.15 * (1 - turn))
      d.bend(d.levy, 'rUpper', 0, -0.7 * S(0.52, 0.6, u) * (1 - S(0.62, 0.7, u)))
      a.reach('r', S(0.58, 0.74, u), 398.42, 1.02, -1.63, 0.5)
      d.apply(d.levy)
      const cuff = u >= 0.85 && u < 0.865
      d.cuffGhost.visible = cuff
      if (cuff) d.hold(d.cuffGhost, d.levy, 'r', CUFF)
      d.cam(
        [
          [0, [394.6, 2.1, -4.2, 398.4, 1.3, -2.0, 45]],
          [0.45, [394.7, 2.1, -4.1, 398.4, 1.3, -2.0, 45]],
          [0.48, [397.0, 1.4, -0.6, 398.3, 1.1, -2.0, 32]],
          [0.75, [397.0, 1.4, -0.6, 398.3, 1.1, -2.0, 32]],
          [0.75, [397.7, 1.2, -1.0, 398.42, 1.02, -1.63, 22]],
          [1, [397.7, 1.2, -1.0, 398.42, 1.02, -1.63, 22]],
        ],
        u,
        shot,
      )
      shot.pos.y += Math.sin(t * 220) * 0.002
      shot.pos.x += Math.sin(t * 170) * 0.0015
      return true
    }
    case 'zoned': {
      d.place('f2')
      d.flashCut(u, 0, 0.02)
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      light.floor2(d, -2, 0.8)
      d.rig.pt(1, 0xf4f7ff, 1.4, [396, 2.9, -2], 5, 1.6)
      const a = d.use(d.levy)
      a.place(398.1, -3.3, FACE_W)
      a.hold(HAND_CHEST)
      d.bend(d.levy, 'head', 1, Math.sin(u * 60) * 0.25 * bump(0.16, 0.3, u))
      d.bend(d.levy, 'head', 0, Math.sin(u * 50) * 0.2 * bump(0.5, 0.64, u))
      d.bend(d.levy, 'chest', 0, Math.sin(t * 5) * 0.03)
      d.apply(d.levy)
      d.cam([[0, [396.2, 1.5, -1.6, 398.1, 1.45, -3.3, 32]], [1, [396.3, 1.5, -1.6, 398.1, 1.45, -3.3, 32]]], u, shot)
      return true
    }
    case 'code': {
      d.place('f2')
      const code = u >= 0.2 && u < 0.82
      const flick = (u >= 0.18 && u < 0.22) || (u >= 0.8 && u < 0.84) ? (tick(t, 14) % 2 ? 1 : 0) : 0
      posters(d, code, flick)
      kiosks(d, f, ['off', 'off', 'off'])
      light.floor2(d, -2, 1 - 0.3 * flick)
      d.f2.roomDoor.rotation.y = -1.3 * S(0.02, 0.08, u) * (1 - S(0.28, 0.4, u))
      const a = d.use(d.levy)
      if (u < 0.22) a.walk(OUT_OF_ROOM, S(0.05, 0.22, u), P.STAND, FACE_E, yawTo(1.85, -0.7))
      else {
        a.place(399.6, -2.3, yawTo(1.85, -0.7))
        a.hold(P.STAND_EASY)
      }
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      d.cam([[0, [399.0, 1.6, -0.5, 401.45, 1.6, -3.0, 35]], [1, [398.95, 1.6, -0.45, 401.45, 1.6, -3.0, 35]]], u, shot)
      return true
    }
    case 'terminals': {
      d.place('f2')
      posters(d, false)
      const k1 = u >= 0.22 && u < 0.45 ? 'face' : 'off'
      const k2 = u >= 0.5 ? 'lines' : 'off'
      kiosks(d, f, [k1, k2, 'off'], S(0.9, 0.98, u))
      light.floor2(d, -30)
      d.rig.pt(1, 0xbfd3ff, k1 === 'face' ? 1.2 : 0, [399.3, 1.4, -29], 2, 1.6)
      d.rig.pt(2, 0xbfd3ff, k2 === 'lines' ? 1.2 : 0, [399.3, 1.4, -30.5], 2, 1.6)
      const a = d.use(d.levy)
      if (u < 0.2) a.walk(TO_END, u / 0.2, P.STAND, FACE_N, FACE_W)
      else {
        const shift = S(0.47, 0.52, u)
        a.place(L(399.8, 399.7, shift), L(-29.6, -30.0, shift), L(FACE_W, yawTo(-0.8, -0.5), shift))
        a.hold(P.STAND_EASY)
        a.reach('r', bump(0.2, 0.3, u), 399.05, 1.33, -29.0, 0.5)
        a.lookAt(398.9, u < 0.5 ? -29 : -30.5, 1)
      }
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      d.cam(
        [
          [0, [400.3, 1.7, -22.5, 399.4, 1.3, -31, 40]],
          [0.2, [400.3, 1.7, -24.5, 399.4, 1.3, -31, 40]],
          [0.22, [399.95, 1.55, -28.5, 398.9, 1.3, -29, 26]],
          [0.48, [399.95, 1.55, -28.5, 398.9, 1.3, -29, 26]],
          [0.5, [400.3, 1.6, -31.35, 399.0, 1.35, -30.2, 34]],
          [1, [400.28, 1.6, -31.33, 399.0, 1.35, -30.2, 34]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'voice': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'wave'])
      light.floor2(d, -31)
      d.rig.pt(1, 0xbfd3ff, 1.2, [399.3, 1.4, -32], 2, 1.6)
      const a = d.use(d.levy)
      const turn = S(0.48, 0.54, u)
      a.place(399.72, -31.3, L(yawTo(-0.8, -0.7), FACE_N, turn))
      a.hold(P.STAND_EASY)
      a.lookAt(398.9, -32, 1 - turn)
      d.apply(d.levy)
      d.cam([[0, [400.3, 1.62, -32.75, 399.1, 1.35, -31.65, 34]], [0.5, [400.28, 1.62, -32.72, 399.1, 1.35, -31.65, 34]], [0.5, [399.55, 1.62, -32.55, 399.72, 1.6, -31.3, 30]], [1, [399.56, 1.62, -32.5, 399.72, 1.6, -31.3, 30]]], u, shot)
      return true
    }
    case 'swarm': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      const monster = S(0.3, 0.34, u)
      const flick = u >= 0.3 ? flickerT(t) : 1
      light.floor2(d, -26, (1 - 0.7 * monster) * flick, monster)
      d.f2.light((i) => flick > 0.5 || i % 4 === 2)
      d.f2.staffDoor.rotation.y = 1.3 * S(0, 0.05, u) * (1 - S(0.25, 0.4, u))
      const a = d.use(d.levy)
      a.place(399.95, L(-31.8, -33.3, S(0, 0.4, u)), FACE_S)
      a.hold(P.STAND)
      a.visible = u < 0.55
      d.apply(d.levy)
      swarm(d, S(0, 0.55, u), monster)
      if (u < 0.55) d.cam([[0, [399.2, 2.7, -33.6, 400.2, 1.2, -20, 50]], [0.55, [399.2, 2.7, -33.6, 400.2, 1.2, -21, 50]]], u, shot)
      else d.cam([[0.55, [400, 1.65, -32.5, 400, 1.6, -26, 40]], [1, [400, 1.65, -32.6, 400, 1.6, -26, 40]]], u, shot)
      return true
    }
    case 'nurse': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      const plain = S(0.28, 0.32, u) * (1 - S(0.68, 0.72, u))
      const monster = u < 0.25 ? 0 : u < 0.72 ? 1 - plain : 1
      light.floor2(d, -31, 0.35, 0.6 * (1 - plain))
      d.rig.keySet(0xf2f0ea, 5 * plain + 0.001, [401.2, 2.4, -31.5], [400.3, 1.6, -32.3], 0.5, 0.5, 5)
      const turn = S(0.2, 0.25, u)
      const a = d.use(d.levy)
      a.place(400.0, -33.3, L(FACE_N, FACE_S, turn))
      a.blend([[0, P.STAND], [0.8, P.STAND], [0.88, STIFF]], u)
      if (u < 0.22) a.reach('r', 1, 400.42 + Math.sin(t * 40) * 0.01, 1.03 + Math.sin(t * 55) * 0.01, -33.93, 0.5)
      d.bend(d.levy, 'head', 0, -0.35 * bump(0.73, 0.84, u))
      d.apply(d.levy)
      const n = d.use(d.nurse)
      n.place(400.3, -32.3, FACE_N)
      n.hold(STAFF_REACH)
      if (u < 0.78) n.reach('r', S(0.16, 0.2, u), 400.1, 1.45, -33.0, 0.5)
      else n.reach('r', 1, 400.05, 1.52, -33.1, 0.5)
      d.apply(d.nurse)
      d.nurse.kit?.set(monster, 0)
      d.devices.get(d.nurse)?.set(u > 0.78 ? 'needle' : 'pen', 1)
      swarm(d, 1, 1, { x: 400.2, z: -31.0, r: 1.8 })
      d.cam(
        [
          [0, [400.7, 1.2, -33.0, 400.42, 1.03, -33.93, 25]],
          [0.2, [400.7, 1.2, -33.0, 400.42, 1.03, -33.93, 25]],
          [0.22, [400.55, 1.72, -33.6, 400.3, 1.62, -32.3, 30]],
          [0.72, [400.55, 1.72, -33.6, 400.3, 1.62, -32.3, 30]],
          [0.72, [401.3, 1.7, -31.0, 400.1, 1.4, -33.2, 40]],
          [1, [401.3, 1.7, -31.0, 400.1, 1.4, -33.2, 40]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'fade': {
      d.place('f2')
      posters(d, false)
      kiosks(d, f, ['off', 'off', 'off'])
      light.floor2(d, -32, 0.25, 0.5)
      const a = d.use(d.levy)
      a.place(400.0, -33.0, FACE_S)
      a.hold(P.STAND)
      a.visible = false
      d.apply(d.levy)
      const n = d.use(d.nurse)
      n.place(400.3, -32.0, FACE_N)
      n.hold(STAFF_REACH)
      d.apply(d.nurse)
      d.nurse.kit?.set(1, 0.5)
      swarm(d, 1, 1, u < 0.5 ? { x: 400.0, z: -32.6, r: L(1.9, 1.1, S(0, 0.47, u)) } : { x: 400.0, z: -30.6, r: 1.1 })
      d.fx.wash(0.9, 0.92, 0.94, 0.35 * S(0, 0.3, u) * (1 - S(0.45, 0.5, u)))
      if (u >= 0.5) d.rig.pt(2, 0xff3b3b, 1.4, [400, 0.12, -33.7], 2.6, 1.6)
      d.fx.vignette(0, 0, 0, 0.85 * S(0.1, 0.5, u))
      d.fx.black(S(0.62, 0.98, u))
      if (u < 0.5) d.cam([[0, [400, 1.6, -33, 400, 1.9, -31, 50]], [0.47, [400, 0.4, -33, 400, 2.6, -31.5, 50]], [0.5, [400, 0.4, -33, 400, 2.6, -31.5, 50]]], u, shot)
      else d.cam([[0.5, [400, 0.12, -31.5, 400, 0.0, -34, 35]], [1, [400, 0.1, -31.6, 400, 0.0, -34, 35]]], u, shot)
      return true
    }
    default:
      return false
  }
}
