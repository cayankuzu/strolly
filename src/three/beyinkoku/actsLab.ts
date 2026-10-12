/**
 * The real lab: chapters 1 (LABORATUVAR), 2 (PROTOKOL), 12 (DENEY) and the
 * five "Üç saniye" flashes (lab1…lab5). Veyl at his desk with the interface
 * on; the atrium's rings; station 31 under the surgical lamp.
 */
import * as THREE from 'three'
import { TEXT } from '@/stories/beyinkoku/text'
import * as P from '../figure/poses'
import type { SetFrame, Shot } from '../kit/SetScene'
import type { Act, Director } from './BeyinKokuScene'
import { SIT_HOVER, SIT_LEAN_BACK, SIT_WRITE, TECH } from './cast'
import { AXIS } from './lab'
import { drawArmMonitor, drawBrainMap, drawControls, drawMain, drawNotebook, drawSignal, drawStation31, drawSuburbView, type MainState } from './screens'
import { bump, C, CHAIR_REAL, FACE_N, FACE_S, FACE_W, L, LAMP_ON, light, S, tick } from './staging'

const LINES = (id: string) => TEXT.find((t) => t.id === id)?.lines ?? []
const TERMS = LINES('notebook-page')
const CARD = LINES('file-card')
const PROTOCOL = LINES('protocol')
const RESULT = LINES('result')
const NEXT = LINES('next-subject')
const ENTRY = LINES('entry-page')

const hv = new THREE.Vector3()
const cableA = new THREE.Vector3()
const cableB = new THREE.Vector3()
const PEN_IN_HAND = new THREE.Euler(0.35, 0, 0)

/** Veyl's interface on, the stains, no scar; the cables from the band to the junction box (after apply). */
function veylReal(d: Director) {
  d.band.visible = true
  d.stains.visible = true
  if (d.veyl.scar) d.veyl.scar.visible = false
  d.veyl.figure.joints.head.getWorldPosition(hv)
  cableA.set(hv.x - 0.07, hv.y + 0.09, hv.z + 0.1)
  cableB.set(hv.x + 0.07, hv.y + 0.09, hv.z + 0.1)
  d.lab.layCables([cableA, cableB], true)
}

/** The monitors in their resting states. */
function desk(d: Director, f: SetFrame, main: MainState, key: string, right: 'controls' | 'brain' = 'controls', left: [number, number] = [1, 1]) {
  d.lab.main.redraw((c, W, H) => drawMain(c, W, H, main), key)
  if (right === 'brain') d.lab.right.redraw((c, W, H) => drawBrainMap(c, W, H, f.time, 0.48, 'GECİKME: 0,48 SN'), `brain:${tick(f.time, 8)}`)
  else d.lab.right.redraw((c, W, H) => drawControls(c, W, H, 1, false), 'controls:1')
  d.lab.left.redraw((c, W, H) => drawSuburbView(c, W, H, left[0], left[1], false, f.time), `left:${left.join(',')}:${tick(f.time, 2)}`)
}

/** The real body in the procedure chair (wrists in the rings), seen from the side only. */
function realBody(d: Director) {
  const a = d.use(d.real)
  a.place(0, -6.5, FACE_S)
  a.y = 0.1
  a.hold(CHAIR_REAL)
  a.reach('r', 1, -0.33, 1.27, -6.38, 0.3)
  a.reach('l', 1, 0.33, 1.27, -6.38, 0.3)
  d.apply(d.real, false)
}

/** The technician at the head of the chair, bent over the halo. */
function techAtHead(d: Director, mode: 'rod' | 'cables' | 'cartridge') {
  const a = d.use(d.tech)
  a.place(0.9, -7.3, FACE_W)
  a.hold(TECH)
  if (mode === 'rod') a.reach('r', 1, 0.3, 1.8, -7.05, 0.4)
  else if (mode === 'cables') {
    a.reach('r', 1, 0.16, 1.82, -6.95, 0.4)
    a.reach('l', 1, 0.26, 1.66, -7.18, 0.4)
  } else {
    a.reach('r', 1, 0.22, 1.63, -7.1, 0.4)
    a.reach('l', 1, 0.3, 1.5, -7.3, 0.4)
  }
  d.apply(d.tech)
}

/** The "Üç saniye" grammar: white, then the lab under the lamp (or the desk with the chair beyond the glass). */
function flashSet(d: Director, f: SetFrame, u: number, shot: Shot, o: { halo?: number; tech?: 'rod' | 'cables' | 'cartridge' | 'none'; desk?: boolean }) {
  d.place('lab')
  ;(d.scene.fog as THREE.FogExp2).density = 0.004
  light.flash(d, o.desk ? 1 : 0)
  d.lab.lamp31.material = LAMP_ON
  d.flashLook(u)
  shot.handheld = 0
  d.lab.openHalo(o.halo ?? 0)
  realBody(d)
  if (o.tech !== 'none') techAtHead(d, o.tech ?? 'rod')
  d.lab.arm.redraw((c, W, H) => drawArmMonitor(c, W, H, ['subject_resistance.high', 'justification_layer.delay: 0.8 sec'], o.halo ? true : false, f.time), `arm:${o.halo ? 1 : 0}:${tick(f.time, 4)}`)
  d.lab.st31Screen.redraw((c, W, H) => drawStation31(c, W, H, 'dark', 0.4, f.time), `st31:dark:${tick(f.time, 2)}`)
}

/** Veyl seated at the desk facing the monitors; `toNotebook` swivels him (and the chair) to the notebook on his left. */
function veylAtDesk(d: Director, toNotebook = 0) {
  const a = d.use(d.veyl)
  const yaw = FACE_N + 0.38 * toNotebook
  a.place(-0.1 * toNotebook, -2.3, yaw)
  d.lab.chair.position.set(-0.1 * toNotebook, 0, -2.3)
  d.lab.chair.rotation.y = yaw
  return a
}

export const actLab: Act = (d, f, seg, u, shot) => {
  const t = f.time
  switch (seg) {
    // ——— 01 LABORATUVAR ———
    case 'open': {
      d.place('lab')
      light.lab(d, 0.2, 0.9)
      shot.handheld = 0
      d.cam([[0, [0, 1.5, -20, 0, 60, -20.5, 55]], [1, [0, 1.5, -20, 0.9, 60, -20.3, 55]]], u, shot)
      d.fx.vignette(0, 0, 0, 0.4)
      return true
    }
    case 'atrium': {
      d.place('lab')
      light.lab(d, 0.3, 1)
      shot.handheld = 0
      d.cam([[0, [0, 2, -20, 0, 40, -21, 55]], [0.45, [0, 2, -20, -9, 3, -24, 55]], [1, [-7.3, 1.9, -22.2, -10.9, 1.5, -23.6, 38]]], u, shot)
      return true
    }
    case 'worlds': {
      d.place('lab')
      light.lab(d, 0.3, 1)
      shot.handheld = 0
      if (u < 0.5) {
        const k = u / 0.5
        const a = L(4.84, 3.25, k)
        const r = 7.8
        shot.pos.set(AXIS.x + r * Math.sin(a), 1.7, AXIS.z + r * Math.cos(a))
        const b = a - 0.3
        shot.tgt.set(AXIS.x + 11.6 * Math.sin(b), 1.9, AXIS.z + 11.6 * Math.cos(b))
        shot.fov = 35
      } else d.cam([[0.5, [0, 14, -16, 0, 12, -24, 50]], [1, [0, 17, -15, 0, 15, -24, 50]]], u, shot)
      return true
    }
    case 'god': {
      d.place('lab')
      light.lab(d, 1, 0.7)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.blend([[0, P.SIT_TYPE], [0.55, P.SIT_TYPE], [0.66, SIT_LEAN_BACK]], u)
      const slide = bump(0.14, 0.36, u)
      const tap = bump(0.38, 0.47, u)
      if (slide > tap) a.reach('r', slide, L(0.95, 1.2, S(0.2, 0.3, u)), 1.1, -3.33, 0.5)
      else a.reach('r', tap, 1.1, 1.22, -3.3, 0.5)
      a.lookAt(-2.9, -5.5, S(0.72, 0.8, u))
      d.apply(d.veyl)
      veylReal(d)
      const sky = S(0.2, 0.32, u)
      const smile = S(0.42, 0.46, u)
      d.lab.main.redraw((c, W, H) => drawMain(c, W, H, { kind: 'idle', t }), `idle:${tick(t, 6)}`)
      d.lab.right.redraw((c, W, H) => drawControls(c, W, H, S(0.2, 0.3, u), u > 0.42), `controls:${Math.round(S(0.2, 0.3, u) * 20)}:${u > 0.42 ? 1 : 0}`)
      d.lab.left.redraw((c, W, H) => drawSuburbView(c, W, H, sky, smile, false, t), `left:${Math.round(sky * 20)}:${Math.round(smile * 10)}:${tick(t, 2)}`)
      d.cam([[0, [2.8, 1.9, 0.5, 0, 1.3, -4, 40]], [1, [-2.2, 1.7, -0.8, 0, 1.3, -4.5, 40]]], u, shot)
      return true
    }
    case 'file': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.blend([[0, P.SIT_READ], [0.42, P.SIT_READ], [0.5, P.SIT_TYPE]], u)
      d.apply(d.veyl)
      veylReal(d)
      desk(d, f, u < 0.45 ? { kind: 'idle', t } : { kind: 'card', lines: CARD, t }, u < 0.45 ? `idle:${tick(t, 6)}` : 'card')
      d.cam([[0, [0.9, 1.45, -1.7, 0, 1.42, -2.3, 30]], [0.45, [0.85, 1.45, -1.72, 0, 1.42, -2.3, 30]], [0.45, [0.4, 1.4, -2.0, 0, 1.25, -3.55, 32]], [1, [0.35, 1.42, -2.05, 0, 1.25, -3.55, 32]]], u, shot)
      return true
    }
    case 'brainmap': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.hold(P.SIT_READ)
      a.lookAt(1.15, -3.45, 1)
      d.apply(d.veyl)
      veylReal(d)
      desk(d, f, { kind: 'card', lines: CARD, t }, 'card', 'brain')
      d.cam([[0, [0.2, 1.35, -2.1, 1.15, 1.2, -3.45, 30]], [1, [0.1, 1.38, -2.15, 1.15, 1.2, -3.45, 30]]], u, shot)
      return true
    }
    // ——— 02 PROTOKOL ———
    case 'notebook': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const turn = 1 - S(0.6, 0.66, u)
      const a = veylAtDesk(d, turn)
      a.blend([[0, P.SIT_READ], [0.1, SIT_WRITE], [0.6, SIT_WRITE], [0.66, P.SIT_READ]], u)
      const pen = S(0.25, 0.35, u)
      a.reach('r', Math.max(pen, S(0.04, 0.1, u) * 0.8) * turn, -0.6, 0.9 + 0.06 * pen, -2.95, 0.5)
      a.lookAt(1.15, -3.45, S(0.62, 0.7, u))
      d.apply(d.veyl)
      veylReal(d)
      if (pen > 0.5) d.hold(d.lab.pen, d.veyl, 'r', PEN_IN_HAND)
      d.lab.notebook.redraw((c, W, H) => drawNotebook(c, W, H, null, TERMS), 'terms')
      desk(d, f, { kind: 'card', lines: CARD, t }, 'card', 'brain')
      d.cam(
        [
          [0, [-0.42, 1.52, -2.36, -0.66, 0.84, -2.95, 36]],
          [0.62, [-0.44, 1.5, -2.38, -0.66, 0.84, -2.95, 36]],
          [0.62, [0.6, 1.3, -3.0, 0.02, 1.24, -2.4, 32]],
          [1, [0.58, 1.3, -2.98, 0.02, 1.24, -2.4, 32]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'protocol': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.hold(P.SIT_TYPE)
      d.bend(d.veyl, 'rFore', 0, Math.sin(t * 11) * 0.04)
      d.bend(d.veyl, 'lFore', 0, Math.sin(t * 9.3 + 1) * 0.04)
      d.apply(d.veyl)
      veylReal(d)
      const shown = C(Math.floor((u - 0.12) / 0.12) + 1, 0, PROTOCOL.length)
      const cursor = (t * 2) % 1 < 0.5
      desk(d, f, { kind: 'protocol', lines: PROTOCOL, shown, amber: false, cursor }, `protocol:${shown}:${cursor ? 1 : 0}`, 'brain')
      d.cam([[0, [0.3, 1.3, -2.5, 0, 1.25, -3.55, 30]], [1, [0.25, 1.3, -2.55, 0, 1.25, -3.55, 30]]], u, shot)
      return true
    }
    case 'slower': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.hold(SIT_HOVER)
      a.reach('r', 1, 0.17, 0.87, -3.0, 0.5)
      d.apply(d.veyl)
      d.eyes(d.veyl, S(0.33, 0.4, u))
      veylReal(d)
      desk(d, f, { kind: 'protocol', lines: PROTOCOL, shown: PROTOCOL.length, amber: false, cursor: (t * 2) % 1 < 0.5 }, `protocol:7:${(t * 2) % 1 < 0.5 ? 1 : 0}`, 'brain')
      d.cam([[0, [0.66, 0.96, -2.86, 0.15, 0.84, -3.0, 30]], [0.33, [0.64, 0.96, -2.87, 0.15, 0.84, -3.0, 30]], [0.34, [-0.8, 1.35, -2.6, 0, 1.3, -2.3, 28]], [1, [-0.78, 1.35, -2.62, 0, 1.3, -2.3, 28]]], u, shot)
      return true
    }
    case 'press': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.hold(SIT_HOVER)
      a.reach('r', 1, 0.17, 0.87 - 0.05 * bump(0.08, 0.2, u), -3.0, 0.5)
      d.apply(d.veyl)
      d.eyes(d.veyl, 1 - S(0.18, 0.26, u))
      veylReal(d)
      desk(d, f, { kind: 'protocol', lines: PROTOCOL, shown: PROTOCOL.length, amber: u > 0.1, cursor: false }, `protocol:7:amber:${u > 0.1 ? 1 : 0}`, 'brain')
      const lightUp = S(0.3, 0.85, u)
      d.lab.st31Screen.redraw((c, W, H) => drawStation31(c, W, H, 'dawn', lightUp, t), `st31:dawn:${Math.round(lightUp * 30)}:${tick(t, 3)}`)
      d.rig.pt(3, 0xffe2b8, 1.6 * lightUp, [0.5, 1.9, -6.6], 2.5, 1.6)
      d.cam([[0, [0.66, 0.96, -2.86, 0.15, 0.84, -3.0, 30]], [0.3, [0.66, 0.96, -2.86, 0.15, 0.84, -3.0, 30]], [0.3, [0.6, 1.9, -6.1, 0.52, 1.9, -6.8, 25]], [1, [0.56, 1.9, -6.25, 0.52, 1.9, -6.8, 25]]], u, shot)
      d.fx.wash(1.35, 1.25, 1.05, S(0.78, 0.98, u))
      return true
    }
    // ——— The five flashes ———
    case 'lab1': {
      flashSet(d, f, u, shot, { tech: 'rod' })
      d.cam([[0, [-2.0, 1.62, -6.45, 0, 1.4, -6.85, 36]], [0.67, [-1.75, 1.62, -7.0, 0, 1.4, -6.85, 36]], [0.68, [-0.75, 2.05, -7.75, 0.02, 1.74, -6.98, 30]], [1, [-0.72, 2.04, -7.72, 0.02, 1.74, -6.98, 30]]], u, shot)
      return true
    }
    case 'lab2': {
      flashSet(d, f, u, shot, { tech: 'cables', halo: 1 })
      d.cam([[0, [-1.35, 1.3, -6.45, 0, 1.5, -6.95, 32]], [0.6, [-1.3, 1.32, -6.55, 0, 1.5, -6.95, 32]], [0.61, [-0.5, 1.7, -5.9, -0.9, 1.7, -6.6, 28]], [1, [-0.52, 1.7, -5.95, -0.9, 1.7, -6.6, 28]]], u, shot)
      return true
    }
    case 'lab3': {
      flashSet(d, f, u, shot, { tech: 'rod' })
      if (u > 0.5) {
        const a = veylAtDesk(d)
        a.hold(P.SIT_TYPE)
        a.lookAt(0, -7, 0.6)
        d.bend(d.veyl, 'head', 1, Math.sin(t * 2.1) * 0.05)
        d.apply(d.veyl)
        veylReal(d)
        d.rig.pt(0, 0xcfe0ff, 3.2, [0, 1.4, -3.1], 4.5, 1.5)
      }
      d.cam([[0, [1.55, 1.5, -6.75, 0, 1.42, -6.9, 34]], [0.53, [1.5, 1.5, -6.85, 0, 1.42, -6.9, 34]], [0.53, [2.75, 1.56, -3.35, 0.1, 1.3, -2.5, 30]], [1, [2.68, 1.56, -3.3, 0.1, 1.3, -2.5, 28]]], u, shot)
      return true
    }
    case 'lab4': {
      d.place('lab')
      ;(d.scene.fog as THREE.FogExp2).density = 0.004
      light.flash(d, 1)
      d.lab.lamp31.material = LAMP_ON
      d.flashLook(u)
      shot.handheld = 0
      realBody(d)
      const a = veylAtDesk(d)
      a.hold(P.SIT_TYPE)
      d.bend(d.veyl, 'rFore', 0, Math.sin(t * 11) * 0.04 * S(0.7, 0.75, u))
      d.apply(d.veyl)
      veylReal(d)
      const k = d.use(d.tech)
      k.place(-1.15, -2.45, FACE_N)
      k.hold(P.STAND)
      k.lookAt(0, -3.5, 0.7)
      d.apply(d.tech)
      desk(d, f, { kind: 'brain', t, label: 'GECİKME: 0,48 SN' }, `brain:${tick(t, 8)}`, 'brain')
      d.cam([[0, [-1.8, 1.6, -0.6, 0, 1.25, -3.5, 40]], [1, [-1.7, 1.6, -0.7, 0, 1.25, -3.5, 40]]], u, shot)
      return true
    }
    case 'lab5': {
      flashSet(d, f, u, shot, { tech: 'cartridge', desk: true })
      d.lab.cartridge.visible = u > 0.6
      const a = veylAtDesk(d)
      a.hold(P.SIT_READ)
      d.twist(d.veyl, -0.3)
      a.reach('l', 0.6, 0.3, 0.95, -2.95, 0.4)
      a.lookAt(0.5, -3.0, 0.8)
      d.apply(d.veyl)
      veylReal(d)
      desk(d, f, { kind: 'progress', value: S(0.5, 0.98, u), label: 'HAFIZA TEMİZLEME · AŞAMA 6' }, `progress:${Math.round(S(0.5, 0.98, u) * 40)}`, 'brain')
      d.cam([[0, [1.6, 1.5, -1.0, 0, 1.3, -4.5, 40]], [1, [1.5, 1.5, -1.1, 0, 1.3, -4.6, 40]]], u, shot)
      return true
    }
    // ——— 12 DENEY ———
    case 'green': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.hold(P.SIT_READ)
      a.lookAt(0.5, -6.8, 0.5 * (1 - S(0.5, 0.55, u)))
      d.apply(d.veyl)
      veylReal(d)
      const green = S(0.02, 0.5, u)
      d.lab.setStrip(green)
      d.rig.pt(3, 0x4cff9a, 1.2 * green, [0.3, 1.0, -6.3], 2.5, 1.6)
      d.lab.st31Screen.redraw((c, W, H) => drawStation31(c, W, H, 'soup', 1, t), `st31:soup:${tick(t, 3)}`)
      desk(d, f, u < 0.5 ? { kind: 'idle', t } : { kind: 'result', lines: RESULT, t }, u < 0.5 ? `idle:${tick(t, 6)}` : 'result', 'brain')
      d.cam([[0, [1.2, 1.6, -4.4, 0.52, 1.9, -6.8, 30]], [0.5, [1.1, 1.6, -4.5, 0.52, 1.9, -6.8, 30]], [0.5, [0.4, 1.4, -2.0, 0, 1.25, -3.55, 32]], [1, [0.36, 1.4, -2.04, 0, 1.25, -3.55, 32]]], u, shot)
      return true
    }
    case 'harika': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      d.rig.pt(0, 0x9fffc8, 2.2, [0, 1.35, -3.0], 4.5, 1.6)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.blend([[0, P.SIT_READ], [0.08, P.SIT_READ], [0.2, SIT_LEAN_BACK]], u)
      d.bend(d.veyl, 'head', 0, 0.16 - 0.08 * S(0.3, 0.4, u))
      d.apply(d.veyl)
      d.eyes(d.veyl, 0.5 * S(0.1, 0.2, u))
      veylReal(d)
      d.lab.setStrip(1)
      desk(d, f, { kind: 'result', lines: RESULT, t }, 'result', 'brain')
      d.cam([[0, [-0.95, 1.48, -3.05, 0, 1.38, -2.3, 32]], [1, [-0.9, 1.48, -3.0, 0, 1.38, -2.3, 32]]], u, shot)
      return true
    }
    case 'notes': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d, 1)
      a.hold(SIT_WRITE)
      const n1 = C(Math.floor((u - 0.02) / 0.062) + 1, 0, ENTRY.length - 1)
      const last1 = C(((u - 0.02) % 0.062) / 0.062)
      const writingLast = u >= 0.37
      const shown = writingLast ? ENTRY.length : n1
      const last = writingLast ? S(0.37, 0.9, u) : last1
      const row = writingLast ? 5.4 : n1 - 1 + last1
      const moving = (u >= 0.02 && u < 0.33) || (writingLast && u < 0.9)
      a.reach('r', 1, -0.66 + 0.15 * (moving ? last : 0.5), 0.82, -3.07 + 0.03 * row, 0.5)
      d.apply(d.veyl)
      veylReal(d)
      d.hold(d.lab.pen, d.veyl, 'r', PEN_IN_HAND)
      d.lab.notebook.redraw((c, W, H) => drawNotebook(c, W, H, { lines: ENTRY, shown, last }, TERMS), `entry:${shown}:${Math.round(last * 40)}`)
      d.lab.setStrip(1)
      desk(d, f, { kind: 'result', lines: RESULT, t }, 'result', 'brain')
      d.cam([[0, [-0.42, 1.52, -2.36, -0.66, 0.82, -2.95, 33]], [1, [-0.44, 1.5, -2.37, -0.66, 0.82, -2.95, 33]]], u, shot)
      return true
    }
    case 'rings': {
      d.place('lab')
      light.lab(d, 1, 1)
      shot.handheld = 0
      const a = veylAtDesk(d, 1 - S(0.02, 0.1, u))
      a.blend([[0, SIT_WRITE], [0.04, SIT_WRITE], [0.1, SIT_LEAN_BACK]], u)
      d.bend(d.veyl, 'head', 0, -0.4 * S(0.05, 0.12, u))
      d.apply(d.veyl)
      veylReal(d)
      d.lab.setStrip(1)
      d.lab.notebook.redraw((c, W, H) => drawNotebook(c, W, H, { lines: ENTRY, shown: ENTRY.length, last: 1 }, TERMS), 'entry:done')
      d.lab.main.redraw((c, W, H) => drawMain(c, W, H, { kind: 'result', lines: RESULT, t }), 'result')
      d.lab.right.redraw((c, W, H) => drawBrainMap(c, W, H, t, 0.48, 'GECİKME: 0,48 SN'), `brain:${tick(t, 8)}`)
      d.lab.left.redraw((c, W, H) => drawSuburbView(c, W, H, 1, 0, true, t), `left:other:${tick(t, 2)}`)
      d.cam(
        [
          [0, [-1, 1.4, -2.9, 0, 1.35, -2.3, 32]],
          [0.12, [-0.98, 1.4, -2.9, 0, 1.4, -2.3, 32]],
          [0.12, [0, 3.5, -10, 0, 22, -22, 55]],
          [0.6, [0, 33, -14, 0, 44, -22, 55]],
          [0.61, [0, 33, -14, 0, 44, -22, 55]],
          [0.61, [-0.6, 1.3, -2.6, -1.15, 1.2, -3.45, 26]],
          [1, [-0.62, 1.3, -2.62, -1.15, 1.2, -3.45, 26]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'next': {
      d.place('lab')
      light.lab(d, 1, 0.5)
      shot.handheld = 0
      const a = veylAtDesk(d)
      a.blend([[0, P.SIT_READ], [0.3, P.SIT_READ], [0.36, SIT_HOVER]], u)
      a.reach('r', S(0.3, 0.36, u), 0.17, 0.87, -3.0, 0.5)
      d.apply(d.veyl)
      d.eyes(d.veyl, S(0.3, 0.36, u))
      veylReal(d)
      d.lab.setStrip(1)
      d.lab.lamp32.material = LAMP_ON
      d.rig.pt(3, 0xf4f8ff, 3.2, [-2.6, 2.6, -6.6], 4.5, 1.6)
      desk(d, f, { kind: 'next', lines: NEXT, t }, 'next', 'brain', [1, 0])
      d.cam([[0, [0.4, 1.4, -2.0, 0, 1.25, -3.55, 32]], [0.32, [0.38, 1.4, -2.02, 0, 1.25, -3.55, 32]], [0.35, [-0.8, 1.35, -2.6, 0, 1.3, -2.3, 28]], [1, [-0.78, 1.35, -2.62, 0, 1.3, -2.3, 28]]], u, shot)
      return true
    }
    case 'signal': {
      d.place('lab')
      light.lab(d, 0.15, 0.12)
      shot.handheld = 0
      shot.locked = true
      const a = veylAtDesk(d)
      a.hold(SIT_LEAN_BACK)
      d.apply(d.veyl)
      d.eyes(d.veyl, 1)
      veylReal(d)
      d.lab.main.redraw((c, W, H) => drawMain(c, W, H, { kind: 'off' }), 'off')
      d.lab.right.redraw((c, W, H) => drawMain(c, W, H, { kind: 'off' }), 'off')
      d.lab.left.redraw((c, W, H) => drawMain(c, W, H, { kind: 'off' }), 'off')
      d.lab.signal.mesh.visible = true
      const draw = S(0.04, 0.42, u)
      const pulse = bump(0.4, 0.58, u)
      d.lab.signal.redraw((c, W, H) => drawSignal(c, W, H, draw, pulse, t), `signal:${Math.round(draw * 60)}:${Math.round(pulse * 20)}:${tick(t, 12)}`)
      // The line sits below the middle of the frame, so the closing title never lies on it.
      d.cam([[0, [0, 2, -4, 0, 2.55, -10, 40]], [1, [0, 2, -4.3, 0, 2.55, -10, 40]]], u, shot)
      // The screens and the room dim to nothing; only the line is left.
      d.fx.black(S(0, 0.14, u))
      return true
    }
    default:
      return false
  }
}
