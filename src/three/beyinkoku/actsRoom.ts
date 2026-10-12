/**
 * The stretcher room (chapters 9 SEDYE and 10 PERDE) and the small white room
 * of the third floor (chapter 11). Levy strapped upright; Veyl at the screens;
 * the recordings, the marks, the schema and its mirror, the log; the white;
 * then a kind görevli, a form, a door.
 */
import * as THREE from 'three'
import { TEXT } from '@/stories/beyinkoku/text'
import { addWalk } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import type { SetFrame } from '../kit/SetScene'
import type { Act, Director } from './BeyinKokuScene'
import { actCentre } from './actsCentre'
import { LOOK_DOWN, POINT, RUB_EYES, SIT_FORM, STRAPPED, WHISPER } from './cast'
import { drawBody, drawCorridorCCTV, drawFaces, drawFingers, drawForm, drawFourRooms, drawHeaven, drawIdle, drawKitchenSplit, drawLibet, drawLog, drawMarks, drawSchema, drawTyped, drawVitals, type Heaven } from './screens'
import { type ScreenId } from './stretcher'
import { bump, C, CHAIR_REAL, FACE_E, FACE_N, FACE_S, L, LAMP_ON, light, LOOK_UP, S, tick, yawTo } from './staging'

const LINES = (id: string) => TEXT.find((t) => t.id === id)?.lines ?? []
const NOTES = LINES('notes')
const LOG = LINES('log-screen')
const NOT_YOU = LINES('not-you')[0] ?? ''

const PACE = makePath([
  [500, 0.9],
  [501.4, -1.8],
  [502.4, -3.2],
  [501.2, -1.6],
  [500.2, 0.2],
])
const TO_DOOR = makePath([
  [600.3, -1.0],
  [601.6, 0.6],
  [602.3, 1.3],
])
const FORM_ON_KNEE = new THREE.Euler(-Math.PI / 2 + 0.35, 0, 0)
const FORM_IN_HAND = new THREE.Euler(-1.1, 0, 0)
const IDLE_LABELS: Record<ScreenId, string> = { centre: 'L-31 · BEKLEMEDE', lu: 'KAYIT 1', ll: 'KAYIT 2', ru: 'KAYIT 3', rl: 'KAYIT 4' }

/** Levy strapped to the stretcher (mounted on the board), eyes `closed` 0…1; `hidden` for his own point of view. */
function levyStrapped(d: Director, closed = 0, hidden = false, hands = true) {
  const a = d.use(d.levy, d.gr.holder)
  a.place(0, 0, FACE_N)
  a.hold(STRAPPED)
  a.visible = !hidden
  d.apply(d.levy)
  d.eyes(d.levy, closed)
  if (!hands) for (const h of d.hands.get(d.levy) ?? []) h.visible = false
  return a
}

/** Veyl as Levy sees him here: no interface, the stained coat, a faint scar. */
function veylG(d: Director, x: number, z: number, yaw: number) {
  const a = d.use(d.veyl)
  a.place(x, z, yaw)
  d.stains.visible = true
  return a
}

/** Every screen idle (blue), except the ones the segment draws. */
function idle(d: Director, f: SetFrame, except: ScreenId[] = []) {
  for (const id of Object.keys(d.gr.screens) as ScreenId[]) {
    if (except.includes(id)) continue
    d.gr.screens[id].redraw((c, W, H) => drawIdle(c, W, H, IDLE_LABELS[id]), `idle:${id}`)
  }
  d.gr.vitals.redraw((c, W, H) => drawVitals(c, W, H, f.time), `vitals:${tick(f.time, 8)}`)
}

/** The small room: Levy in his chair, the kind görevli opposite with the form (0 on her knee … 1 handed to him). */
export function smallRoomPeople(d: Director, f: SetFrame, handed: number, temple = 0, smile = 0, levyUp = 0) {
  const a = d.use(d.levy)
  a.place(600, 0.8, FACE_N)
  a.hold(P.SIT)
  a.reach('r', temple, 600.09, 1.42, 0.72, 0.5)
  if (handed > 0.5) {
    a.reach('l', 1, 599.9, 1.02, 0.3, 0.5)
    a.reach('r', 1, 600.1, 1.02, 0.3, 0.5)
  }
  d.bend(d.levy, 'head', 0, -0.15 * levyUp)
  d.apply(d.levy)
  const g = d.use(d.g3)
  g.place(600, -1.2, FACE_S)
  g.hold(SIT_FORM)
  d.bend(d.g3, 'head', 2, 0.12 * smile)
  d.bend(d.g3, 'head', 0, -0.2 * smile)
  if (handed > 0.05 && handed < 0.95) g.reach('r', 1, 600.1 - 0.1 * handed, 0.8 + 0.25 * handed, -0.75 + 0.9 * handed, 0.5)
  d.apply(d.g3)
  d.cen.formOnKnee.redraw((c, W, H) => drawForm(c, W, H), 'form')
  d.cen.formHanded.redraw((c, W, H) => drawForm(c, W, H), 'form')
  if (handed < 0.05) {
    d.cen.formOnKnee.mesh.visible = true
    d.cen.formOnKnee.mesh.position.set(600.1, 0.57, -0.92)
    d.cen.formOnKnee.mesh.rotation.copy(FORM_ON_KNEE)
  } else {
    d.cen.formHanded.mesh.visible = true
    d.hold(d.cen.formHanded.mesh, handed < 0.95 ? d.g3 : d.levy, 'r', FORM_IN_HAND)
    void f
  }
}

export const actRoom: Act = (d, f, seg, u, shot) => {
  const t = f.time
  const gr = d.gr
  const blue = f.flags.has('line:blue')
  switch (seg) {
    // ——— 09 SEDYE ———
    case 'stretcher': {
      d.place('g')
      light.g(d)
      idle(d, f)
      levyStrapped(d, 1 - S(0.02, 0.12, u), u < 0.5)
      const v = veylG(d, 500, -0.5, FACE_S)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      d.lab.ghostChair.visible = u >= 0.7 && u < 0.745
      if (u < 0.5) {
        d.cam([[0, [500, 1.95, 2.3, 500, 1.6, -1.0, 45]], [0.5, [500, 1.95, 2.3, 500, 1.6, -1.0, 45]]], u, shot)
        d.fx.black(1 - S(0.0, 0.1, u))
      } else d.cam([[0.5, [502.5, 2.2, -2.0, 500, 1.3, 2.5, 45]], [1, [502.4, 2.2, -2.0, 500, 1.3, 2.5, 45]]], u, shot)
      return true
    }
    case 'veyl': {
      d.place('g')
      light.g(d)
      idle(d, f)
      d.flashCut(u, 0, 0.02)
      levyStrapped(d, 0)
      const k = S(0, 0.1, u)
      const v = veylG(d, 500, L(-0.5, 0.2, k), FACE_S)
      v.hold(P.STAND_EASY)
      addWalk(v.pose, k * 5, k > 0.01 && k < 0.99 ? 0.8 : 0)
      d.bend(d.veyl, 'head', 0, 0.06 * Math.sin(t * 2.3) * S(0.44, 0.5, u))
      d.apply(d.veyl)
      d.cam(
        [
          [0, [500.6, 1.8, 2.0, 500, 1.65, 0.2, 32]],
          [0.42, [500.6, 1.8, 2.0, 500, 1.65, 0.2, 32]],
          [0.44, [500.4, 1.7, 1.4, 500, 1.65, 0.2, 26]],
          [0.7, [500.4, 1.7, 1.4, 500, 1.65, 0.2, 26]],
          [0.71, [499.5, 1.9, 0.6, 500, 1.85, 2.5, 28]],
          [1, [499.5, 1.9, 0.6, 500, 1.85, 2.5, 28]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'libet': {
      d.place('g')
      light.g(d)
      idle(d, f, ['lu'])
      const flick = bump(0.29, 0.36, u)
      const glance = S(0.55, 0.6, u) * (1 - S(0.7, 0.75, u))
      gr.screens.lu.redraw((c, W, H) => drawLibet(c, W, H, t, flick, glance), `libet:${Math.round(flick * 10)}:${Math.round(glance * 10)}:${tick(t, 10)}`)
      levyStrapped(d, 0)
      const v = veylG(d, 500.4, -1.0, yawTo(-4.2, -3.6))
      v.hold(POINT)
      d.apply(d.veyl)
      d.cam([[0, [502.6, 1.9, 1.5, 499, 2.0, -4.6, 40]], [0.23, [502.6, 1.9, 1.5, 499, 2.0, -4.6, 40]], [0.26, [497.6, 2.6, -2.2, 496.2, 2.8, -4.6, 30]], [1, [497.6, 2.55, -2.3, 496.2, 2.8, -4.6, 30]]], u, shot)
      return true
    }
    case 'marks':
    case 'crack': {
      d.place('g')
      light.g(d)
      idle(d, f, ['centre'])
      const m1 = seg === 'crack' ? 1 : S(0.02, 0.1, u)
      const m2 = seg === 'crack' ? 1 : S(0.37, 0.45, u)
      const m3 = seg === 'crack' ? 1 : S(0.52, 0.6, u)
      const crack = seg === 'crack' ? S(0.4, 0.5, u) : 0
      const push = seg === 'crack' ? 1 : S(0.74, 0.98, u)
      gr.screens.centre.redraw((c, W, H) => drawMarks(c, W, H, m1, m2, m3, crack, push, t), `marks:${Math.round(m1 * 10)}:${Math.round(m2 * 10)}:${Math.round(m3 * 10)}:${Math.round(crack * 20)}:${Math.round(push * 20)}:${tick(t, 4)}`)
      levyStrapped(d, 0)
      if (seg === 'marks') {
        const v = veylG(d, 499.2, -1.4, FACE_N)
        v.hold(POINT)
        d.apply(d.veyl)
        d.cam([[0, [500.6, 2.2, 0.5, 500, 2.6, -5.2, 35]], [1, [500.5, 2.2, 0.4, 500, 2.6, -5.2, 35]]], u, shot)
      } else {
        const v = veylG(d, 500, -0.3, FACE_S)
        v.hold(P.STAND_EASY)
        d.apply(d.veyl)
        d.cam([[0, [501.0, 1.75, 1.6, 500, 1.65, -0.3, 30]], [0.45, [501.0, 1.75, 1.6, 500, 1.65, -0.3, 30]], [1, [499.0, 1.9, 1.2, 500, 1.65, -0.3, 34]]], u, shot)
      }
      return true
    }
    case 'fingers':
    case 'narrator': {
      d.place('g')
      light.g(d)
      idle(d, f, ['ru', 'rl'])
      if (seg === 'fingers') d.flashCut(u, 0, 0.02)
      const frozen = seg === 'narrator'
      const faceIdx = seg === 'narrator' ? 4 : C(Math.floor((u - 0.66) / 0.064), 0, 4)
      const showFaces = seg === 'narrator' || u >= 0.66
      gr.screens.ru.redraw((c, W, H) => drawFingers(c, W, H, frozen ? 3.2 : t), `fingers:${frozen ? 'f' : tick(t, 10)}`)
      if (showFaces) gr.screens.rl.redraw((c, W, H) => drawFaces(c, W, H, faceIdx, frozen ? 1.1 : t, frozen), `faces:${faceIdx}:${frozen ? 'f' : tick(t, 8)}`)
      else gr.screens.rl.redraw((c, W, H) => drawIdle(c, W, H, IDLE_LABELS.rl), 'idle:rl')
      levyStrapped(d, 0, seg === 'fingers' && u < 0.1)
      if (seg === 'fingers') {
        const v = veylG(d, 501.5, -1.5, yawTo(2.3, -3.1))
        v.hold(POINT)
        d.apply(d.veyl)
        if (u < 0.1) d.cam([[0, [500, 1.95, 2.3, 502, 2.0, -4.6, 45]], [0.1, [500, 1.95, 2.3, 502, 2.0, -4.6, 45]]], u, shot)
        else d.cam([[0.1, [502.0, 2.2, 0.0, 503.8, 2.05, -4.6, 32]], [1, [502.1, 2.2, 0.0, 503.8, 2.05, -4.6, 32]]], u, shot)
      } else {
        const turn = S(0.02, 0.1, u)
        const v = veylG(d, L(501.2, 500, turn), L(-1.3, -0.3, turn), L(yawTo(2.3, -3.1), FACE_S, turn))
        v.hold(P.STAND_EASY)
        d.apply(d.veyl)
        d.cam([[0, [501.0, 1.75, 1.6, 500, 1.65, -0.3, 30]], [0.4, [501, 1.75, 1.6, 500, 1.65, -0.3, 30]], [0.44, [504, 2.8, 4.5, 500, 1.8, -2.0, 45]], [1, [504.2, 2.8, 4.6, 500, 1.8, -2.0, 45]]], u, shot)
      }
      return true
    }
    case 'cover': {
      if (u >= 0.5 && u < 0.7) {
        actCentre(d, f, 'step', 0.02, shot)
        d.fx.wash(0.75, 0.75, 0.75, 0.55)
        d.fx.vignette(0.3, 0.3, 0.3, 0.5)
        return true
      }
      d.place('g')
      light.g(d)
      idle(d, f, ['rl'])
      gr.screens.rl.redraw((c, W, H) => drawFaces(c, W, H, 4, 1.1, true), 'faces:4:f')
      levyStrapped(d, 0)
      const v = veylG(d, 500, 0.0, FACE_S)
      v.hold(P.STAND_EASY)
      d.bend(d.veyl, 'head', 0, 0.05 * Math.sin(t * 2.1))
      d.apply(d.veyl)
      if (u < 0.5) d.cam([[0, [500.4, 1.7, 1.4, 500, 1.65, 0.0, 28]], [0.5, [500.4, 1.7, 1.4, 500, 1.65, 0.0, 28]]], u, shot)
      else d.cam([[0.7, [499.6, 1.9, 0.8, 500, 1.85, 2.5, 26]], [1, [499.6, 1.9, 0.8, 500, 1.85, 2.5, 26]]], u, shot)
      return true
    }
    // ——— 10 PERDE ———
    case 'third': {
      d.place('g')
      light.g(d)
      idle(d, f, ['centre'])
      const on = S(0.62, 0.7, u)
      gr.screens.centre.redraw((c, W, H) => drawFourRooms(c, W, H, NOTES, on, t), `rooms:${Math.round(on * 10)}:${tick(t, 6)}`)
      levyStrapped(d, 0)
      const v = veylG(d, 499.3, -1.2, FACE_N)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      d.cam([[0, [500.4, 2.3, 0.0, 500, 2.6, -5.2, 34]], [1, [500.4, 2.3, -0.3, 500, 2.6, -5.2, 33]]], u, shot)
      return true
    }
    case 'layer': {
      d.place('g')
      light.g(d)
      idle(d, f)
      levyStrapped(d, 0)
      const v = veylG(d, 500, 0.0, FACE_S)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      const smells: Array<[number, number, number, boolean]> = [
        [0.5, 0.7, 1.4, false],
        [0.45, 0.3, 0.15, false],
        [0.3, 0.6, 0.3, false],
        [1.5, 1.5, 1.5, false],
        [0.35, 0.02, 0.02, true],
      ]
      smells.forEach(([r, g, b, vig], i) => {
        const s = 0.47 + i * 0.08
        const a = bump(s, s + 0.08, u)
        if (a <= 0.001) return
        if (vig) d.fx.vignette(r, g, b, a * 0.9)
        else d.fx.wash(r, g, b, a * 0.45)
      })
      d.cam([[0, [500.8, 1.7, 1.5, 500, 1.65, 0, 30]], [0.44, [500.8, 1.7, 1.5, 500, 1.65, 0, 30]], [0.47, [499.6, 1.9, 0.9, 500, 1.85, 2.5, 24]], [1, [499.6, 1.9, 0.9, 500, 1.85, 2.5, 24]]], u, shot)
      return true
    }
    case 'schema': {
      d.place('g')
      light.g(d)
      idle(d, f, ['centre'])
      gr.screens.centre.redraw((c, W, H) => drawSchema(c, W, H, t), `schema:${tick(t, 6)}`)
      const k = S(0.3, 0.5, u)
      gr.mirror.visible = u >= 0.3
      gr.mirror.scale.set(0.12 + 0.88 * k, 0.12 + 0.88 * k, 1)
      levyStrapped(d, 0)
      const v = veylG(d, 500.6, -1.5, FACE_N)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      shot.locked = true
      d.cam([[0, [500.0, 2.4, 1.0, 500, 2.6, -5.2, 36]], [1, [500.0, 2.4, 1.0, 500, 2.6, -5.2, 36]]], u, shot)
      return true
    }
    case 'want': {
      d.place('g')
      light.g(d)
      idle(d, f)
      levyStrapped(d, 0)
      const k = S(0.27, 0.33, u)
      const v = veylG(d, 500, L(0.0, 0.9, k), FACE_S)
      v.hold(P.STAND_EASY)
      addWalk(v.pose, k * 6, k > 0.01 && k < 0.99 ? 0.7 : 0)
      d.apply(d.veyl)
      d.cam([[0, [499.6, 1.9, 1.0, 500, 1.85, 2.5, 26]], [0.29, [499.6, 1.9, 1.0, 500, 1.85, 2.5, 26]], [0.32, [500.35, 1.78, 1.85, 500, 1.68, 0.9, 28]], [1, [500.35, 1.78, 1.85, 500, 1.68, 0.9, 28]]], u, shot)
      return true
    }
    case 'face': {
      d.place('g')
      const dark = u >= 0.32
      light.g(d, dark ? 0 : 1)
      if (dark) d.rig.hemiSet(0x000000, 0x000000, 0)
      idle(d, f, ['centre'])
      const reveal = S(0.54, 0.9, u)
      if (dark) gr.screens.centre.redraw((c, W, H) => drawTyped(c, W, H, NOT_YOU, reveal, t), `typed:${Math.round(reveal * 40)}:${tick(t, 3)}`)
      for (const id of ['lu', 'll', 'ru', 'rl'] as ScreenId[]) gr.screenMats[id].color.setScalar(dark ? 0 : 1)
      levyStrapped(d, 0)
      const v = veylG(d, 500, 0.9, FACE_S)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      d.veyl.kit?.set(S(0.03, 0.12, u) * (1 - S(0.3, 0.32, u)), 0)
      d.fx.black(S(0.3, 0.32, u) * (1 - S(0.54, 0.62, u)))
      if (!dark) d.cam([[0, [500.2, 1.75, 1.5, 500, 1.7, 0.8, 26]], [0.32, [500.2, 1.75, 1.5, 500, 1.7, 0.8, 26]]], u, shot)
      else d.cam([[0.32, [500, 2.6, -1.5, 500, 2.6, -5.2, 30]], [1, [500, 2.6, -1.6, 500, 2.6, -5.2, 30]]], u, shot)
      return true
    }
    case 'panic': {
      d.place('g')
      light.g(d)
      idle(d, f)
      levyStrapped(d, 0)
      const v = d.use(d.veyl)
      d.stains.visible = true
      if (u < 0.25) {
        v.place(500, 0.9, FACE_S)
        v.blend([[0, P.STAND_EASY], [0.04, RUB_EYES], [0.2, RUB_EYES], [0.25, P.STAND_EASY]], u)
      } else v.walk(PACE, S(0.25, 0.97, u), P.STAND_EASY, FACE_S, FACE_S, 0.8)
      d.apply(d.veyl)
      d.cam([[0, [500.2, 1.75, 1.5, 500, 1.7, 0.8, 26]], [0.22, [500.2, 1.75, 1.5, 500, 1.7, 0.8, 26]], [0.25, [502.2, 1.9, 2.0, 500.5, 1.6, -0.5, 36]], [1, [502.3, 1.9, 2.1, 500.5, 1.6, -0.6, 36]]], u, shot)
      return true
    }
    case 'bring': {
      d.place('g')
      light.g(d)
      idle(d, f, ['lu', 'll'])
      const close = S(0.6, 0.95, u)
      gr.screens.lu.redraw((c, W, H) => drawCorridorCCTV(c, W, H, t, close), `cctv:${Math.round(close * 20)}:${tick(t, 8)}`)
      gr.screens.ll.redraw((c, W, H) => drawCorridorCCTV(c, W, H, t + 2.1, close), `cctv2:${Math.round(close * 20)}:${tick(t, 8)}`)
      levyStrapped(d, 0)
      const v = veylG(d, 498.6, -1.0, yawTo(-2.4, -3.6))
      v.hold(POINT)
      d.apply(d.veyl)
      d.cam([[0, [498.2, 2.2, 0.6, 496.2, 2.05, -4.6, 30]], [1, [498.1, 2.2, 0.5, 496.2, 2.05, -4.6, 30]]], u, shot)
      return true
    }
    case 'heavens': {
      d.place('g')
      light.g(d)
      idle(d, f, ['centre', 'lu', 'll', 'ru', 'rl'])
      const bodies = u >= 0.2 && u < 0.215
      const kinds: Record<ScreenId, Heaven> = { centre: 'sea', lu: 'mountain', ll: 'summer', ru: 'tea', rl: 'mountain' }
      for (const id of Object.keys(kinds) as ScreenId[]) {
        if (bodies) gr.screens[id].redraw((c, W, H) => drawBody(c, W, H), `body:${id}`)
        else gr.screens[id].redraw((c, W, H) => drawHeaven(c, W, H, kinds[id], t + (id.length as number)), `heaven:${id}:${tick(t, 5)}`)
      }
      d.gr.vitals.redraw((c, W, H) => drawVitals(c, W, H, t), `vitals:${tick(t, 8)}`)
      levyStrapped(d, 0)
      const down = S(0.45, 0.5, u) * (1 - S(0.62, 0.66, u))
      const v = veylG(d, 500.5, -0.8, L(FACE_N, FACE_E, down))
      v.blend([[0, P.STAND_EASY], [1, LOOK_DOWN]], down)
      if (u > 0.62) v.blend([[0, P.STAND_EASY], [1, LOOK_UP]], 0.4 * S(0.62, 0.68, u))
      d.apply(d.veyl)
      d.cam(
        [
          [0, [500.0, 2.3, 4.5, 500, 2.4, -5, 50]],
          [0.44, [500.0, 2.3, 4.5, 500, 2.4, -5, 50]],
          [0.47, [501.0, 1.6, 0.6, 500.5, 1.6, -0.8, 28]],
          [0.62, [501.0, 1.6, 0.6, 500.5, 1.6, -0.8, 28]],
          [0.64, [500.8, 1.8, 0.0, 500, 2.4, -5.2, 36]],
          [1, [500.8, 1.8, 0.0, 500, 2.4, -5.2, 36]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'hands': {
      if (u >= 0.35 && u < 0.65) {
        d.place('lab')
        ;(d.scene.fog as THREE.FogExp2).density = 0.004
        light.flash(d)
        d.lab.lamp31.material = LAMP_ON
        d.flashCut(u, 0.35, 0.012)
        d.fx.wash(5.5, 6, 6.6, 0.3)
        const a = d.use(d.real)
        a.place(0, -6.5, FACE_S)
        a.y = 0.1
        a.hold(CHAIR_REAL)
        a.reach('r', 1, -0.33, 1.27, -6.38, 0.3)
        a.reach('l', 1, 0.33, 1.27, -6.38, 0.3)
        d.apply(d.real, false)
        shot.handheld = 0
        d.cam([[0.35, [0, 1.85, -6.75, -0.33, 1.27, -6.38, 35]], [0.65, [0, 1.85, -6.76, -0.33, 1.27, -6.38, 35]]], u, shot)
        return true
      }
      d.place('g')
      light.g(d)
      idle(d, f)
      if (u >= 0.65) d.flashCut(u, 0.65, 0.012)
      levyStrapped(d, 0, false, u < 0.65)
      const v = veylG(d, 500, 0.3, FACE_S)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      d.cam([[0, [500, 1.88, 2.25, 500.35, 1.0, 2.6, 35]], [1, [500, 1.88, 2.25, 500.35, 1.0, 2.6, 35]]], u, shot)
      return true
    }
    case 'kitchen': {
      d.place('g')
      light.g(d)
      idle(d, f, ['ru'])
      const sight = S(0.3, 0.4, u)
      const hearing = S(0.55, 0.65, u)
      gr.screens.ru.redraw((c, W, H) => drawKitchenSplit(c, W, H, sight, hearing, t), `kitchen:${Math.round(sight * 10)}:${Math.round(hearing * 10)}:${tick(t, 6)}`)
      levyStrapped(d, 0)
      const v = veylG(d, 501.6, -1.3, yawTo(2.2, -3.3))
      v.hold(POINT)
      d.apply(d.veyl)
      d.cam([[0, [502.5, 2.0, 0.0, 503.8, 2.8, -4.6, 28]], [1, [502.6, 2.0, -0.1, 503.8, 2.8, -4.6, 28]]], u, shot)
      return true
    }
    case 'log':
    case 'yours': {
      d.place('g')
      light.g(d)
      idle(d, f, ['centre'])
      const shown = seg === 'yours' ? LOG.length : C(Math.floor((u - 0.15) / 0.075) + 1, 0, LOG.length)
      const blink = blue && shown >= LOG.length - 2 && tick(t, 3) % 2 === 0 && (seg === 'yours' || u < 0.95)
      const strip = seg === 'yours' ? 1 : S(0.02, 0.98, u)
      gr.screens.centre.redraw((c, W, H) => drawLog(c, W, H, { lines: LOG, shown, amber: blue, blink, strip, t }), `log:${shown}:${blue ? 1 : 0}:${blink ? 1 : 0}:${Math.round(strip * 9)}`)
      levyStrapped(d, 0)
      const v = veylG(d, 499.2, -1.2, FACE_N)
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      if (seg === 'log') d.cam([[0, [500.0, 2.4, 0.5, 500, 2.4, -5.2, 32]], [1, [500, 2.4, 0.3, 500, 2.4, -5.2, 32]]], u, shot)
      else {
        const amber = blue && u > 0.54 && tick(t, 3) % 2 === 0
        d.rig.pt(1, amber ? 0xffb347 : 0xcfe0ff, 1.3 + 0.4 * Math.sin(t * 7), [500.3, 1.95, 1.9], 2.6, 1.6)
        d.cam([[0, [499.7, 1.9, 1.3, 500, 1.88, 2.5, 22]], [1, [499.72, 1.9, 1.35, 500, 1.88, 2.5, 22]]], u, shot)
      }
      return true
    }
    case 'terrible': {
      d.place('g')
      const dark = S(0.44, 0.56, u)
      light.g(d, 1 - 0.85 * dark)
      d.rig.hemiSet(0x202a36, 0x0a0c10, 0.22 * (1 - dark))
      d.rig.pt(3, 0xe8f0ff, 1.1 * dark, [500.3, 2.05, 2.0], 1.7, 1.6)
      idle(d, f, ['centre'])
      gr.screens.centre.redraw((c, W, H) => drawLog(c, W, H, { lines: LOG, shown: LOG.length, amber: blue, blink: false, strip: 1, t }), `log:done:${blue ? 1 : 0}`)
      levyStrapped(d, 0)
      const v = veylG(d, 499.4, 2.05, FACE_E)
      v.hold(WHISPER)
      d.apply(d.veyl)
      d.cam([[0, [501.5, 1.85, 1.6, 500, 1.8, 2.3, 30]], [0.44, [501.5, 1.85, 1.6, 500, 1.8, 2.3, 30]], [1, [500.75, 1.88, 2.05, 500.05, 1.86, 2.55, 18]]], u, shot)
      d.fx.vignette(0, 0, 0, 0.6 * dark)
      return true
    }
    case 'real': {
      d.place('g')
      light.g(d)
      idle(d, f)
      d.flashCut(u, 0, 0.02)
      levyStrapped(d, 0)
      const turn = S(0.78, 0.84, u) * (1 - S(0.92, 0.98, u))
      const v = veylG(d, 500, 0.6, L(FACE_S, FACE_N, turn))
      v.hold(P.STAND_EASY)
      d.apply(d.veyl)
      d.cam(
        [
          [0, [500.4, 1.7, 1.4, 500, 1.65, 0.6, 28]],
          [0.53, [500.4, 1.7, 1.4, 500, 1.65, 0.6, 28]],
          [0.56, [499.6, 1.9, 0.9, 500, 1.85, 2.5, 24]],
          [0.74, [499.6, 1.9, 0.9, 500, 1.85, 2.5, 24]],
          [0.77, [501.5, 1.8, 2.0, 500, 1.6, 0.3, 34]],
          [1, [501.5, 1.8, 2.0, 500, 1.6, 0.3, 34]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'white': {
      d.place('g')
      const offAt: Record<ScreenId, number> = { lu: 0.56, ll: 0.62, centre: 0.68, ru: 0.74, rl: 0.8 }
      let on = 0
      for (const id of Object.keys(offAt) as ScreenId[]) {
        const is = u < offAt[id]
        gr.screenMats[id].color.setScalar(is ? 1 : 0)
        if (is) on++
      }
      light.g(d, on / 5)
      idle(d, f)
      levyStrapped(d, 0, true)
      const v = veylG(d, 500, 0.6, FACE_S)
      v.hold(P.STAND_EASY)
      d.bend(d.veyl, 'head', 0, 0.05 * Math.sin(t * 2.3) * (1 - S(0.5, 0.56, u)))
      d.apply(d.veyl)
      shot.locked = true
      d.cam([[0, [500, 1.95, 2.3, 500, 1.7, -2.0, 45]], [1, [500, 1.95, 2.3, 500, 1.7, -2.0, 45]]], u, shot)
      d.fx.white(S(0.6, 0.95, u))
      return true
    }
    // ——— 11 GERİ SALIM ———
    case 'smallroom': {
      d.place('h')
      light.small(d)
      smallRoomPeople(d, f, 0, bump(0.08, 0.42, u), S(0.53, 0.58, u), S(0.76, 0.8, u))
      d.fx.white(1 - S(0, 0.08, u))
      d.cam(
        [
          [0, [602.2, 1.7, 2.4, 600, 1.0, -0.4, 40]],
          [0.52, [602.2, 1.7, 2.4, 600, 1.0, -0.4, 40]],
          [0.55, [600.3, 1.25, 0.4, 600, 1.2, -1.2, 30]],
          [0.76, [600.3, 1.25, 0.4, 600, 1.2, -1.2, 30]],
          [0.77, [599.7, 1.25, -0.6, 600, 1.2, 0.8, 30]],
          [1, [599.7, 1.25, -0.6, 600, 1.2, 0.8, 30]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'form': {
      d.place('h')
      light.small(d)
      smallRoomPeople(d, f, S(0.46, 0.54, u), 0, S(0.74, 0.78, u) * 0.6, 0)
      d.cam(
        [
          [0, [600.3, 1.25, 0.4, 600, 1.2, -1.2, 30]],
          [0.28, [600.3, 1.25, 0.4, 600, 1.2, -1.2, 30]],
          [0.31, [601.6, 1.6, 1.4, 598, 1.4, -2.0, 38]],
          [0.52, [601.6, 1.6, 1.4, 601.5, 1.6, -2.95, 38]],
          [0.54, [602.4, 1.3, -0.2, 600, 1.1, -0.2, 38]],
          [1, [602.4, 1.3, -0.2, 600, 1.1, -0.2, 38]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'goodday': {
      d.place('h')
      light.small(d, S(0.2, 0.4, u))
      const weave = bump(0.03, 0.4, u)
      d.fx.weave(1 - S(0.03, 0.4, u), weave)
      const a = d.use(d.levy)
      a.place(600, 0.8, FACE_N)
      a.hold(P.SIT)
      a.reach('l', 1, 599.9, 1.02, 0.3, 0.5)
      a.reach('r', 1, 600.1, 1.02, 0.3, 0.5)
      d.bend(d.levy, 'head', 0, -0.18 * S(0.69, 0.74, u))
      d.bend(d.levy, 'head', 2, 0.1 * S(0.69, 0.74, u))
      a.lookAt(602.3, 1.3, S(0.44, 0.5, u))
      d.apply(d.levy)
      d.cen.formHanded.redraw((c, W, H) => drawForm(c, W, H), 'form')
      d.cen.formHanded.mesh.visible = true
      d.hold(d.cen.formHanded.mesh, d.levy, 'r', FORM_IN_HAND)
      const g = d.use(d.g3)
      if (u < 0.4) {
        g.place(600, -1.2, FACE_S)
        g.hold(SIT_FORM)
      } else {
        g.walk(TO_DOOR, S(0.4, 0.5, u), P.STAND, FACE_S, FACE_E)
        g.blend([[0, SIT_FORM], [1, P.STAND]], S(0.4, 0.44, u))
        g.reach('r', S(0.47, 0.52, u) * (1 - S(0.6, 0.66, u)), 602.9, 1.0, 1.1, 0.5)
      }
      d.apply(d.g3)
      d.cen.smallDoor.rotation.y = -1.2 * S(0.5, 0.6, u)
      d.cam([[0, [602.4, 1.5, 2.6, 600, 1.2, 0, 42]], [0.44, [602.4, 1.5, 2.6, 600, 1.2, 0, 42]], [0.46, [601.0, 1.5, 0.4, 603, 1.2, 1.6, 36]], [1, [601.0, 1.5, 0.4, 602.9, 1.25, 1.6, 36]]], u, shot)
      return true
    }
    default:
      return false
  }
}
