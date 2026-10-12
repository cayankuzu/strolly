/**
 * Chapters 4–5 and `done`: ODA 3 as Arif sees it. The corridor, the door that
 * closes to a hairline, the white that takes colour cell by cell and then like
 * water into a towel, the morning office complete, the boss (or two) assembling
 * out of cells; then the fit, which never lands: cuts on the swing, white
 * flashes, white patches, the monitor bursting into pixels, the pen holder.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import type { SetFrame, Shot } from '../kit/SetScene'
import { held, keyed, type Actor, type ShotKeys } from '../kit/direct'
import { makePose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { canvasPlane } from '../kit/props'
import * as C from './cast'
import { env, motion, moment, PI, ss, sub, two, win, type Seg } from './common'
import { clearPatches, setPatch } from './reveal'
import { inHand, jointPos, speech, type World } from './world'

// ——— Poses ———

const STAND_PHONE = C.STAND_PHONE
/** The copy's "shh": the left index finger at the lips, eyes still down. */
const SHH = makePose({ lUpper: [-0.55, 0, 0.55], lFore: [-2.3, 0.4, 0], lHand: [0.2, 0, 0] }, C.FEET_UP)
/** Hauled up by the collar: half standing, leaning over the desk toward Arif. */
const HAULED_UP = makePose({ hipY: 0.92, hipZ: 0.06, spine: [0.52, 0, 0], chest: [0.16, 0, 0], neck: [-0.2, 0, 0], head: [-0.25, 0.1, 0], lUpper: [-0.4, 0, 0.35], rUpper: [-0.45, 0, -0.35], lFore: [-0.8, 0, 0], rFore: [-0.6, 0, 0], lThigh: [-0.3, 0, 0.05], rThigh: [-0.4, 0, -0.08], lShin: [0.35, 0, 0], rShin: [0.45, 0, 0] })
/** Arif leaning across the desk, both fists forward at the collar. */
const ACROSS = makePose({ hipZ: 0.06, spine: [0.62, 0, 0], chest: [0.2, 0, 0], neck: [-0.35, 0, 0], head: [-0.35, 0, 0], lUpper: [-1.35, 0, 0.12], rUpper: [-1.35, 0, -0.12], lFore: [-0.45, 0, 0], rFore: [-0.45, 0, 0], lThigh: [-0.15, 0, 0.06], rThigh: [0.2, 0, -0.06], rShin: [0.15, 0, 0] })
/** Screaming into the face: chin forward, shoulders up. */
const SCREAM = makePose({ spine: [0.55, 0, 0], chest: [0.24, 0, 0], neck: [-0.45, 0, 0], head: [-0.4, 0, 0] }, ACROSS)
/** Slumped on the floor against a wall, below the desk line. */
const SLUMP = makePose({ hipY: 0.16, spine: [-0.2, 0, 0], chest: [-0.05, 0, 0], neck: [0.3, 0, 0], head: [0.45, 0.3, 0.2], lThigh: [-1.3, 0, 0.25], rThigh: [-1.1, 0, -0.2], lShin: [1.2, 0, 0], rShin: [0.7, 0, 0], lUpper: [0.1, 0, 0.3], rUpper: [0.05, 0, -0.3], lFore: [-0.3, 0, 0], rFore: [-0.4, 0, 0] })
/** Pinned to a wall, standing, head turned away. */
const PINNED = makePose({ spine: [-0.1, 0, 0], neck: [0.1, 0, 0], head: [0.15, 0.6, 0.1], lUpper: [0.1, 0, 0.5], rUpper: [0.1, 0, -0.5], lFore: [-0.5, 0, 0], rFore: [-0.5, 0, 0], lShin: [0.15, 0, 0], rShin: [0.1, 0, 0] })
const WIPE = makePose({ rUpper: [-0.9, 0.3, -0.35], rFore: [-2.0, 0, 0], rHand: [0.2, 0, 0.3], head: [0.0, 0, 0] }, P.STAND)
const STRAIGHT = makePose({ spine: [-0.04, 0, 0], chest: [-0.08, 0, 0], head: [-0.06, 0, 0] }, P.STAND)
const TOWEL_TAKE = makePose({ rUpper: [-0.8, 0, -0.1], rFore: [-0.6, 0, 0], head: [-0.05, 0, 0] }, P.STAND)
const HOLD_TOWEL = makePose({ lUpper: [-0.3, 0, 0.12], lFore: [-1.35, 0.3, 0], rUpper: [-0.3, 0, -0.12], rFore: [-1.35, -0.3, 0] }, P.STAND)

// ——— Places ———

/** Where Arif stands when he speaks in the boss's office, translated: (160, 0.9). */
const ARIF_SPOT = { x: 160, z: 0.95 }
const CHAIR = { x: 160, z: -1.33 }
const WINDOW_COPY = { x: 161.45, z: -1.95 }

const KEYS: Partial<Record<Seg, ShotKeys>> = {
  color: [
    [0, [160.0, 1.62, 1.55, 159.4, 1.55, -2.5, 50]],
    [1, [160.0, 1.6, 1.5, 160.15, 1.42, -2.5, 50]],
  ],
  same: [
    [0, [160.0, 1.62, 1.8, 160.0, 1.25, -1.6, 44]],
    [0.45, [160.0, 1.6, 1.5, 160.0, 1.2, -1.6, 44]],
    [0.7, [160.0, 1.6, 1.35, 158.0, 1.45, -0.4, 42]],
    [1, [160.05, 1.58, 1.25, 160.62, 0.9, -0.35, 40]],
  ],
  appear: [
    [0, [160.25, 1.62, 1.9, 160.0, 1.0, -1.05, 40]],
    [1, [160.2, 1.6, 1.6, 160.0, 1.05, -1.1, 38]],
  ],
  trigger: [
    [0, [161.35, 1.8, 1.25, 160.0, 1.28, -1.35, 34]],
    [1, [161.2, 1.78, 1.05, 160.0, 1.28, -1.35, 32]],
  ],
  collar: [
    [0, [158.45, 1.55, -0.45, 160.0, 1.25, -0.6, 36]],
    [1, [158.6, 1.52, -0.55, 160.0, 1.35, -0.75, 34]],
  ],
  shout: [
    [0, [160.22, 1.66, -1.62, 160.0, 1.45, -0.25, 30]],
    [1, [160.2, 1.64, -1.5, 160.0, 1.45, -0.3, 28]],
  ],
  subside: [
    [0, [160.0, 1.2, 2.3, 160.4, 1.25, -1.2, 40]],
    [1, [160.05, 1.25, 1.9, 160.5, 1.3, -1.3, 40]],
  ],
}

const v = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()

/** The office's loose things, their rest transforms (local to the office holder). */
type Rest = { pos: THREE.Vector3; rot: THREE.Euler }
const rest = new WeakMap<THREE.Object3D, Rest>()
function keep(o: THREE.Object3D) {
  let r = rest.get(o)
  if (!r) {
    r = { pos: o.position.clone(), rot: o.rotation.clone() }
    rest.set(o, r)
  }
  o.position.copy(r.pos)
  o.rotation.copy(r.rot)
  return r
}

/** The "333" tag that glitches into the copy's collar (built once). */
const tags = new WeakMap<World, THREE.Mesh>()
function collarTag(w: World) {
  let m = tags.get(w)
  if (!m) {
    const p = canvasPlane(0.05, 0.022, 128, (c, W, H) => {
      c.fillStyle = '#f6f6f2'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#111'
      c.font = `700 ${Math.round(H * 0.8)}px sans-serif`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText('333', W / 2, H * 0.55)
    })
    m = p.mesh
    m.position.set(0.0, 0.06, 0.085)
    m.rotation.x = -0.25
    w.cast.copy1.figure.joints.neck.add(m)
    tags.set(w, m)
  }
  return m
}

/** The light of the morning office inside ODA 3: 0 the flat white room … 1 the full office. */
function roomLight(w: World, k: number, corridor = 0) {
  const L = w.lights
  env(w, 'office', 0.12 + 0.32 * k, 0xf4f6f6)
  L.setHemi(0xe8eef4, 0x8a7f70, 0.2 + 0.32 * k)
  L.setSun(0xfff0d8, 3.6 * k, [173, 15, -12], [160, 0, 0], 6)
  L.setKey(0xffe2b0, 22 * k, [161.0, 2.55, -2.35], [160, 1.0, -1.0], 0.9, 6)
  L.setPoint(0, 0xf4f6ff, 1.8 * k + 0.4, [160, 2.6, 0.9], 6)
  L.setPoint(1, 0xfff2e0, 1.2 * k, [158.5, 2.2, -1.5], 5)
  L.setPoint(2, 0xd8fff2, 5 * corridor, [160, 2.8, 4.2], 6)
  L.setPoint(3, 0xd8fff2, 5 * corridor, [160, 2.8, 7.0], 6)
  L.setPoint(4, 0xe8a040, 0.8 * corridor, [160.33, 2.4, 2.9], 2)
}

type Perceive = { shell: number; furn: number; mon?: number; hideFurn?: boolean; mottle?: number; corridor?: boolean; real?: boolean }

/** ODA 3 as Arif sees it: the office arriving over white. */
function perceive(w: World, o: Perceive) {
  const r = w.room
  r.group.visible = true
  r.hallu.visible = !o.real
  r.real.visible = !!o.real
  r.corridor.visible = !!o.corridor
  for (const x of [r.tray, r.blood, r.smear, r.smear2, r.trolley, r.mop, r.scrubber]) x.visible = false
  if (r.wetSign) r.wetSign.visible = false
  r.shadow.visible = false
  r.uShell.uReveal.value = o.shell
  r.uDoor.uReveal.value = o.shell
  r.uView.uReveal.value = ss(0.035, 0.07, o.shell) * 1.2
  r.uFurn.uReveal.value = o.furn
  r.uFurn.uHide.value = o.hideFurn ? 1 : 0
  r.uMon.uReveal.value = o.mon ?? o.furn
  r.uMon.uMode.value = 0
  r.uMon.uHide.value = o.hideFurn ? 1 : 0
  r.uShell.uMottle.value = o.mottle ?? 0
  clearPatches(r.uShell)
  r.shards.count = 0
  r.rayMat.opacity = 0.05 * ss(0.75, 1.0, o.shell)
  const off = r.office
  off.clock.set(9 + 14 / 60)
  keep(off.chair.group)
  keep(off.photo)
  keep(off.penHolder)
  off.pens.forEach(keep)
  off.monitor.visible = true
  off.photo.visible = true
  off.door.leaf.visible = true
  r.realDoor.visible = true
  r.setDoor(0)
  r.setReady(false)
}

/** The copies: in the chair (and at the window), assembled 0 … 1. */
function copies(w: World, f: SetFrame, a1: number, a2: number) {
  const c = w.cast
  const u1 = w.copyU[0]
  const u2 = w.copyU[1]
  u1.uSeed.value.set(160, 0.82, -0.45, 1 / 1.75)
  u2.uSeed.value.set(WINDOW_COPY.x + 0.1, 1.15, WINDOW_COPY.z + 0.25, 1 / 1.7)
  u1.uReveal.value = a1 * 1.12
  u2.uReveal.value = a2 * 1.12
  const b1 = w.use(c.copy1)
  b1.visible = a1 > 0.001
  const b2 = w.use(c.copy2)
  b2.visible = two(f) && a2 > 0.001
  return { b1, b2 }
}

/** A copy's phone in its right hand, screen toward its face. */
function phoneIn(w: World, a: Actor, i: number) {
  const ph = w.copyPhones[i].group
  if (!a.visible) return
  a.figure.rGrip.getWorldPosition(v)
  jointPos(a.figure, 'head', v2)
  ph.position.copy(v)
  ph.lookAt(v2)
  ph.rotateX(PI / 2)
  ph.visible = true
}

/** A white flash at u = at (a few frames' worth of scroll). */
const flash = (u: number, at: number, len = 0.025) => win(u, at - 0.004, at, at + len * 0.4, at + len)

export function runActC(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const c = w.cast
  const t = f.time
  const r = w.room
  const arif = c.arifO
  const post = w.post
  switch (seg) {
    // ——— 04 ODA ———
    case 'white': {
      // The corridor; the door slides open on pure white (the room's own white: nothing has arrived yet).
      perceive(w, { shell: 0, furn: 0, hideFurn: true, corridor: true, real: true })
      roomLight(w, 0, 1)
      w.lights.setPoint(0, 0xf4f8ff, 3, [160, 2.7, 0], 6)
      w.lights.setPoint(1, 0xf4f8ff, 3, [160, 2.7, -1.5], 6)
      const open = ss(0.68, 0.84, u)
      r.setDoor(open)
      r.shadow.visible = u > 0.7
      const a = w.use(arif)
      const path = makePath([
        [160.0, 8.6],
        [160.0, 3.3],
      ])
      a.walk(path, sub(u, 0.0, 0.66), P.STAND, PI, PI)
      const g2 = w.use(c.g2)
      g2.walk(makePath([[160.62, 8.7], [160.62, 3.55]]), sub(u, 0.0, 0.66), C.ESCORT, PI, PI)
      const tech = w.use(c.tech)
      tech.walk(makePath([[159.38, 8.8], [159.38, 3.65]]), sub(u, 0.02, 0.68), P.STAND, PI, PI)
      if (u > 0.66) {
        a.lookAt(160, 0, 1)
        g2.lookAt(160, 3.3, 0.6)
        tech.lookAt(160, 3.3, 0.6)
      }
      w.apply(t)
      motion.step = a.step
      motion.walking = a.walking
      motion.doors = win(u, 0.68, 0.7, 0.8, 0.84)
      shot.pos.set(160.05, 1.62, lerp(10.4, 5.2, ss(0, 0.8, u)))
      shot.tgt.set(160.0, 1.45, lerp(6.0, 1.0, ss(0, 0.8, u)))
      shot.fov = 42
      break
    }
    case 'close': {
      perceive(w, { shell: 0, furn: 0, hideFurn: true, corridor: true })
      roomLight(w, 0, 1 - ss(0.3, 0.45, u))
      const shut = ss(0.25, 0.45, u)
      r.setDoor(1 - shut)
      // The leaf slides out of the wall only as it shuts.
      r.office.door.leaf.visible = shut > 0.02
      const a = w.use(arif)
      if (u < 0.25) a.walk(makePath([[160.0, 3.3], [160.0, 1.6]]), sub(u, 0, 0.25), P.STAND, PI, PI)
      else a.place(160.0, 1.6, PI).hold(P.STAND)
      // The staff stay outside.
      w.use(c.g2).place(160.62, 3.55, PI).hold(C.ESCORT)
      w.use(c.tech).place(159.38, 3.65, PI).hold(P.STAND)
      // He turns his head toward the door as it shuts.
      a.lookAt(160, 3, ss(0.28, 0.4, u) * 0.6)
      w.apply(t)
      motion.step = a.step
      motion.walking = a.walking
      motion.doors = win(u, 0.25, 0.28, 0.4, 0.45)
      if (u < 0.45) {
        shot.pos.set(158.4, 1.6, -1.5).lerp(v.set(158.7, 1.58, -1.2), sub(u, 0, 0.45))
        shot.tgt.set(160.0, 1.3, 2.5)
        shot.fov = 42
      } else {
        // Close on the seam, his shoulder at the frame's edge.
        shot.pos.set(159.35, 1.52, 1.75).lerp(v.set(159.45, 1.5, 1.95), sub(u, 0.45, 1))
        shot.tgt.set(160.0, 1.15, 2.5)
        shot.fov = 30
      }
      break
    }
    case 'color': {
      const k = sub(u, 0.15, 1)
      perceive(w, { shell: 0.13 * k, furn: 0, hideFurn: true })
      roomLight(w, 1)
      r.shadow.visible = true
      ;(r.shadow.material as THREE.MeshBasicMaterial).opacity = 1 - ss(0.4, 1, u)
      keyed(KEYS.color!, held(u, f.reduced), shot)
      break
    }
    case 'pixels': {
      // Cell by cell from the window, then the west wall: a sharp border of cells.
      perceive(w, { shell: lerp(0.13, 0.335, ss(0, 1, u)), furn: 0, hideFurn: true })
      roomLight(w, 1)
      // A slow pan from Arif's eyes: from the window (north) round to the west wall.
      const a = lerp(0.12, -1.35, ss(0.15, 0.95, held(u, f.reduced)))
      shot.pos.set(160.0, 1.62, 1.45)
      shot.tgt.set(160 + Math.sin(a) * 3, 1.55 - 0.08 * Math.sin(u * PI), 1.45 - Math.cos(a) * 3)
      shot.fov = 50
      break
    }
    case 'towel': {
      // The colour wicks across the rest like water into a dry towel; the desk and its things last
      // (their fronts lie at 0.62–0.78: they cross the desk under the macro, complete by the wide).
      const shell = lerp(0.335, 0.95, ss(0.0, 0.9, u))
      const furn = lerp(0.6, 1.0, ss(0.0, 0.8, u))
      perceive(w, { shell, furn, mon: lerp(0.55, 1.0, ss(0.25, 0.9, u)), hideFurn: true })
      roomLight(w, 1)
      if (u < 0.5) {
        shot.pos.set(160.42, 1.08, 0.5).lerp(v.set(160.3, 1.0, 0.2), sub(u, 0, 0.5))
        shot.tgt.set(160.0, 0.76, -0.4)
        shot.fov = 36
      } else {
        shot.pos.set(160.0, 1.7, 2.25).lerp(v.set(160.0, 1.66, 2.0), sub(u, 0.5, 1))
        shot.tgt.set(160.0, 1.15, -1.0)
        shot.fov = 50
      }
      break
    }
    case 'same': {
      perceive(w, { shell: 1.2, furn: 1.2, hideFurn: true })
      roomLight(w, 1)
      keyed(KEYS.same!, held(u, f.reduced), shot)
      break
    }
    case 'appear': {
      perceive(w, { shell: 1.2, furn: 1.2, hideFurn: true })
      roomLight(w, 1)
      const { b1, b2 } = copies(w, f, ss(0.08, 0.46, u), ss(0.15, 0.48, u))
      b1.place(CHAIR.x, CHAIR.z, 0).hold(C.FEET_UP)
      b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
      w.apply(t)
      phoneIn(w, b1, 0)
      phoneIn(w, b2, 1)
      keyed(KEYS.appear!, held(u, f.reduced), shot)
      break
    }
    // ——— 05 NÖBET ———
    case 'trigger': {
      perceive(w, { shell: 1.2, furn: 1.2 })
      roomLight(w, 1)
      const { b1, b2 } = copies(w, f, 1, 1)
      b1.place(CHAIR.x, CHAIR.z, 0)
      b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
      const m = moment(f)
      let open = 0
      if (m === 'laugh') {
        b1.blend(
          [
            [0.08, C.FEET_UP],
            [0.16, C.FEET_UP_LAUGH],
            [0.5, C.FEET_UP_LAUGH],
            [0.6, C.FEET_UP],
          ],
          u,
        )
        open = u < 0.55 ? win(u, 0.08, 0.12, 0.5, 0.55) * (0.45 + 0.5 * Math.abs(Math.sin(t * 9))) : win(u, 0.6, 0.62, 0.9, 0.92) * speech(t, 1)
      } else if (m === 'money') {
        b1.blend(
          [
            [0.08, C.FEET_UP],
            [0.25, C.FEET_UP_POINT],
          ],
          u,
        )
        open = win(u, 0.1, 0.13, 0.88, 0.92) * speech(t, 1)
      } else {
        b1.blend(
          [
            [0.08, C.FEET_UP],
            [0.18, SHH],
            [0.55, SHH],
            [0.62, C.FEET_UP],
          ],
          u,
        )
        open = win(u, 0.1, 0.13, 0.88, 0.92) * speech(t, 0.6)
        // Two fingers flick toward the door.
        const flick = win(u, 0.66, 0.7, 0.82, 0.88)
        b1.reach('l', flick, 160.3 + 0.08 * Math.sin(u * 90), 1.15, -0.85, 0.5)
      }
      w.apply(t)
      w.mouth(b1, open)
      w.mouth(b2, open)
      phoneIn(w, b1, 0)
      phoneIn(w, b2, 1)
      keyed(KEYS.trigger!, held(u, f.reduced), shot)
      break
    }
    case 'collar':
    case 'shout': {
      perceive(w, { shell: 1.2, furn: 1.2 })
      roomLight(w, 1)
      const { b1, b2 } = copies(w, f, 1, 1)
      b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
      const a = w.use(arif)
      const isCollar = seg === 'collar'
      // The lunge across the desk; the haul; the chair toppling (u 0.3).
      const lunge = isCollar ? ss(0.05, 0.25, u) : 1
      const haul = isCollar ? ss(0.25, 0.5, u) : 1
      a.place(160.0, lerp(ARIF_SPOT.z, 0.17, lunge), PI).blend(
        [
          [0, P.STAND],
          [1, ACROSS],
        ],
        lunge,
      )
      if (!isCollar || u > 0.5) a.blend([[0.0, ACROSS], [0.1, SCREAM]], isCollar ? sub(u, 0.5, 0.6) : 1)
      b1.place(CHAIR.x, lerp(CHAIR.z, -1.02, haul), 0).blend(
        [
          [0, C.FEET_UP],
          [1, HAULED_UP],
        ],
        haul,
      )
      const ch = r.office.chair.group
      const top = isCollar ? ss(0.28, 0.4, u) : 1
      ch.rotation.z = -1.35 * top
      ch.position.x = 0.42 * top
      ch.position.y = 0.26 * top
      ch.position.z = -7.85 - 0.25 * top
      w.apply(t)
      // Fists at the collar.
      const grab = isCollar ? ss(0.2, 0.3, u) : 1
      jointPos(b1.figure, 'neck', v)
      a.reach('l', grab, v.x + 0.06, v.y - 0.04, v.z + 0.08, 0.4)
      a.reach('r', grab, v.x - 0.06, v.y - 0.04, v.z + 0.08, 0.4)
      a.apply(t, true)
      // The scream.
      const scream = isCollar ? win(u, 0.5, 0.54, 0.96, 1) : win(u, 0.03, 0.06, 0.4, 0.42) * 0.85 + win(u, 0.46, 0.49, 0.97, 1)
      w.mouth(a, scream * (0.75 + 0.25 * Math.abs(Math.sin(t * 7))))
      w.mouth(b1, 0)
      phoneIn(w, b2, 1)
      // The "333" in the collar, two or three frames at a time.
      const tag = collarTag(w)
      const tick = Math.floor(t * 30)
      tag.visible = (isCollar ? u > 0.2 : true) && tick % 17 < 2
      // One wall patch flashes white as he grabs; more with each shout.
      if (isCollar) setPatch(r.uShell, 0, [157.6, 1.4, -1.5], [157.6, 2.2, -0.4], 0.5, win(u, 0.2, 0.23, 0.27, 0.32))
      else {
        setPatch(r.uShell, 0, [162.4, 1.5, 0.2], [162.4, 2.1, 1.0], 0.55, win(u, 0.04, 0.08, 0.2, 0.3))
        setPatch(r.uShell, 1, [158.4, 1.2, 2.45], [159.0, 2.0, 2.45], 0.5, win(u, 0.47, 0.5, 0.62, 0.72))
        setPatch(r.uShell, 2, [161.4, 2.95, 0.6], [162.2, 2.95, -0.6], 0.6, win(u, 0.5, 0.54, 0.7, 0.8))
      }
      motion.doors = isCollar ? win(u, 0.28, 0.3, 0.34, 0.38) : 0
      if (isCollar) keyed(KEYS[seg]!, held(u, f.reduced), shot)
      else {
        // Close on Arif's face over the boss's shoulder: the boss's head soft at the frame's edge.
        jointPos(a.figure, 'head', v3)
        shot.pos.set(v3.x + 0.5, v3.y + 0.3, v3.z - 1.25)
        shot.tgt.set(v3.x, v3.y - 0.05, v3.z)
        shot.fov = 30
      }
      break
    }
    case 'blows': {
      blows(w, f, shot, u)
      break
    }
    case 'could': {
      perceive(w, { shell: 1.2, furn: 1.2 })
      roomLight(w, 1)
      const { b1, b2 } = copies(w, f, 1, 1)
      b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
      // At the east wall: the fist rising to the top of its arc, slowly.
      b1.place(162.12, -0.95, -PI / 2).hold(PINNED)
      const a = w.use(arif)
      a.place(161.42, -0.85, PI / 2 + 0.1).blend(
        [
          [0, C.HEAVE],
          [0.45, C.COCK],
          [1, C.COCK],
        ],
        ss(0, 1, u),
      )
      w.apply(t)
      w.mouth(a, 0.35 + 0.15 * Math.sin(t * 2))
      phoneIn(w, b2, 1)
      // The face in the flashes.
      const fl = 0.45 * (flash(u, 0.2, 0.06) + flash(u, 0.55, 0.06) + flash(u, 0.86, 0.06))
      post.white = fl
      w.lights.setPoint(1, 0xffffff, 8 * fl / 0.45, [162.2, 1.6, -0.6], 3)
      jointPos(a.figure, 'head', v)
      shot.pos.set(162.18, 1.58, 0.05).lerp(v2.set(162.12, 1.6, -0.18), sub(u, 0, 1))
      shot.tgt.copy(v).add(v3.set(0.0, -0.02, 0))
      shot.fov = 32
      break
    }
    case 'monitor': {
      monitorScene(w, f, shot, u)
      break
    }
    case 'subside': {
      const n2 = two(f)
      perceive(w, { shell: 1.2, furn: 1.2, mottle: 0.62 })
      roomLight(w, 0.8)
      const { b2 } = copies(w, f, 0, n2 && u < 0.48 ? 1 : 0)
      b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
      // The chair down, the monitor gone, the pens on the floor.
      const ch = r.office.chair.group
      ch.rotation.z = -1.35
      ch.position.set(0.42, 0.26, -8.1)
      r.office.monitor.visible = false
      r.office.penHolder.rotation.z = 1.5
      r.office.photo.visible = false
      const a = w.use(arif)
      if (n2 && u < 0.5) {
        // He turns to the one still scrolling and walks over.
        const k = ss(0.3, 0.46, u)
        a.place(lerp(160.75, 161.05, k), lerp(-1.25, -1.55, k), lerp(PI, PI - 0.6, ss(0.2, 0.3, u))).hold(C.HEAVE)
        if (u > 0.3 && u < 0.46) {
          a.walking = 0.7
          a.step = Math.floor(u * 50)
        }
      } else a.place(160.75, -1.25, PI + 0.25).hold(C.HEAVE)
      w.apply(t)
      phoneIn(w, b2, 1)
      if (n2) post.white = 0.9 * flash(u, 0.48, 0.06)
      motion.step = a.step
      motion.walking = a.walking
      keyed(KEYS.subside!, held(u, f.reduced), shot)
      break
    }
    case 'done': {
      doneScene(w, f, shot, u)
      break
    }
  }
}

/** `blows`: cut on every swing; a white frame, a white patch; the walls, the photo falling. */
function blows(w: World, f: SetFrame, shot: Shot, u: number) {
  const c = w.cast
  const t = f.time
  const r = w.room
  perceive(w, { shell: 1.2, furn: 1.2 })
  roomLight(w, 1)
  const { b1, b2 } = copies(w, f, 1, 1)
  b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
  const ch = r.office.chair.group
  ch.rotation.z = -1.35
  ch.position.set(0.42, 0.26, -8.1)
  const a = w.use(c.arifO)
  // The beats: behind the desk (the man below the desk line), the west wall, the east wall.
  const beats = [0.08, 0.2, 0.32, 0.44]
  const swing = beats.reduce((s, b) => Math.max(s, win(u, b - 0.05, b - 0.01, b + 0.01, b + 0.04)), 0)
  if (u < 0.5) {
    // Behind Arif's back from the door corner: the man is never seen.
    b1.place(158.62, -1.52, 0.75).hold(SLUMP)
    a.place(159.0, -1.1, -2.39).blend([[0, C.COCK], [1, C.SWING]], swing)
  } else if (u < 0.7) {
    // Crashed into the west wall: the photo above falls.
    b1.place(157.78, -0.2, PI / 2).hold(PINNED)
    a.place(158.42, -0.22, -PI / 2).blend([[0, C.GRIP], [1, C.SWING]], win(u, 0.52, 0.55, 0.6, 0.66))
  } else {
    // The east wall, by the plant.
    b1.place(162.12, -1.1, -PI / 2).hold(PINNED)
    a.place(161.42, -0.95, PI / 2).blend([[0, C.COCK], [1, C.SWING]], win(u, 0.74, 0.78, 0.82, 0.88))
  }
  w.apply(t)
  w.mouth(a, 0.5 + 0.3 * Math.abs(Math.sin(t * 6)))
  phoneIn(w, b2, 1)
  // The photo falls off the west wall at u 0.55.
  const fall = ss(0.55, 0.64, u)
  const ph = r.office.photo
  ph.position.y = 1.6 - 1.42 * fall * fall
  ph.rotation.z = 0.5 * fall
  ph.position.x = -2.48 + 0.1 * fall
  // A white frame on every swing, and a patch on the wall.
  const beatFlash = beats.reduce((s, b) => Math.max(s, flash(u, b, 0.03)), 0) + flash(u, 0.55, 0.04) + flash(u, 0.78, 0.04) + flash(u, 0.5, 0.03) + flash(u, 0.7, 0.03)
  w.post.white = Math.min(1, beatFlash) * 0.95
  const spots: Array<[readonly number[], readonly number[]]> = [
    [
      [158.6, 1.2, -2.48],
      [159.4, 2.0, -2.48],
    ],
    [
      [157.52, 1.5, -1.6],
      [157.52, 2.3, -0.8],
    ],
    [
      [160.4, 2.2, -2.48],
      [161.2, 2.6, -2.48],
    ],
    [
      [157.52, 0.8, -1.0],
      [157.52, 1.4, -1.8],
    ],
  ]
  beats.forEach((b, i) => setPatch(r.uShell, i, spots[i][0], spots[i][1], 0.45, win(u, b, b + 0.01, b + 0.08, b + 0.16)))
  setPatch(r.uShell, 4, [157.52, 1.0, 0.6], [157.52, 2.0, -0.4], 0.55, win(u, 0.55, 0.57, 0.66, 0.74))
  setPatch(r.uShell, 5, [162.48, 1.0, -0.4], [162.48, 2.0, -1.4], 0.55, win(u, 0.78, 0.8, 0.9, 0.98))
  motion.doors = flash(u, 0.55, 0.04) + flash(u, 0.78, 0.04)
  if (u < 0.5) {
    shot.pos.set(162.1, 1.9, 2.2).lerp(v.set(161.8, 1.8, 1.9), sub(u, 0, 0.5))
    shot.tgt.set(159.3, 1.2, -0.9)
    shot.fov = 46
  } else if (u < 0.7) {
    shot.pos.set(160.6, 1.65, 1.3).lerp(v.set(160.4, 1.6, 1.1), sub(u, 0.5, 0.7))
    shot.tgt.set(158.0, 1.35, -0.2)
    shot.fov = 44
  } else {
    shot.pos.set(158.8, 1.6, 0.9).lerp(v.set(159.0, 1.58, 0.7), sub(u, 0.7, 1))
    shot.tgt.set(162.0, 1.3, -1.05)
    shot.fov = 44
  }
}

/** `monitor`: the monitor bursting into white cells, a crack across the wall, the pen holder. */
function monitorScene(w: World, f: SetFrame, shot: Shot, u: number) {
  const c = w.cast
  const t = f.time
  const r = w.room
  const off = r.office
  perceive(w, { shell: 1.2, furn: 1.2 })
  roomLight(w, 1)
  const { b1, b2 } = copies(w, f, 1, 1)
  b1.visible = false
  b2.place(WINDOW_COPY.x, WINDOW_COPY.z, -0.35).hold(STAND_PHONE)
  const ch = off.chair.group
  ch.rotation.z = -1.35
  ch.position.set(0.42, 0.26, -8.1)
  off.photo.visible = false
  // The monitor: mode 2, the centre goes first, outward, into white cubes.
  const burst = ss(0.12, 0.3, u)
  r.uMon.uMode.value = 2
  r.uMon.uHide.value = 1
  off.monitor.getWorldPosition(v)
  r.uMon.uSeed.value.set(v.x, v.y, v.z, 1 / 0.42)
  r.uMon.uReveal.value = 1.05 - burst * 1.1
  if (burst > 0 && burst < 1) {
    const n = 140
    r.shards.count = n
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const sc = new THREE.Vector3()
    for (let i = 0; i < n; i++) {
      const s = r.shardSeeds[i]
      const k = burst * s[3]
      const p = v2.set(v.x + s[0] * 0.3 * (0.4 + k * 2.2), v.y + s[1] * 0.25 + k * 0.5 - k * k * 0.9, v.z + s[2] * 0.3 * (0.4 + k * 2.2))
      e.set(k * 6 * s[0], k * 5 * s[2], 0)
      q.setFromEuler(e)
      sc.setScalar(Math.max(0.01, 1 - burst * 0.9))
      m.compose(p, q, sc)
      r.shards.setMatrixAt(i, m)
    }
    r.shards.instanceMatrix.needsUpdate = true
  } else if (burst >= 1) off.monitor.visible = false
  // A white crack across the west wall at head height.
  const crack = ss(0.32, 0.44, u) * (1 - ss(0.8, 0.95, u))
  setPatch(r.uShell, 0, [157.52, 1.68, 1.6], [157.52, 1.62, lerp(1.6, -1.8, ss(0.32, 0.46, u))], 0.07, crack)
  setPatch(r.uShell, 1, [157.52, 1.62, -0.2], [157.52, 1.95, -0.9], 0.05, crack * ss(0.4, 0.46, u))
  // The pen holder tipping, slowly; pens rolling off the edge.
  const tip = ss(0.58, 0.72, u)
  const ph = off.penHolder
  ph.rotation.z = 1.5 * tip
  ph.position.x = 0.62 + 0.05 * tip
  ph.position.y = 0.75 + 0.04 * Math.sin(tip * PI)
  off.pens.forEach((pen, i) => {
    const roll = ss(0.68 + i * 0.015, 0.86 + i * 0.01, u)
    const r0 = rest.get(pen)!
    pen.position.set(r0.pos.x + roll * (0.12 + i * 0.04), r0.pos.y - roll * roll * (0.0 + (i % 3 === 0 ? 0.84 : 0)), r0.pos.z + roll * (i - 2.5) * 0.03)
    pen.rotation.set(r0.rot.x, r0.rot.y + roll * i, r0.rot.z + PI / 2 * ss(0.62, 0.7, u))
  })
  const a = w.use(c.arifO)
  if (u < 0.5) a.visible = false
  else {
    // His hand reaching into frame toward the pen holder.
    a.place(161.25, 0.25, PI + 0.6).hold(P.STAND)
    a.reach('r', ss(0.52, 0.66, u), 160.68, 0.86, -0.32, 0.4)
  }
  w.apply(t)
  phoneIn(w, b2, 1)
  w.post.white = Math.min(1, flash(u, 0.12, 0.05) * 0.7 + ss(0.8, 0.88, u) * (1 - ss(0.97, 1.0, u) * 0.3))
  motion.doors = flash(u, 0.12, 0.05)
  if (u < 0.32) {
    shot.pos.set(158.6, 1.25, 0.25).lerp(v3.set(158.75, 1.2, 0.05), sub(u, 0, 0.32))
    shot.tgt.set(159.45, 1.1, -0.75)
    shot.fov = 36
  } else if (u < 0.5) {
    shot.pos.set(159.6, 1.6, 0.9).lerp(v3.set(159.4, 1.6, 0.8), sub(u, 0.32, 0.5))
    shot.tgt.set(157.6, 1.65, 0.0)
    shot.fov = 40
  } else {
    shot.pos.set(161.15, 0.95, 0.2).lerp(v3.set(161.0, 0.92, 0.05), sub(u, 0.5, 1))
    shot.tgt.set(160.6, 0.8, -0.35)
    shot.fov = 36
  }
}

/** `done`: he straightens, wipes his mouth; a chime; the door; the towel; the smile. */
function doneScene(w: World, f: SetFrame, shot: Shot, u: number) {
  const c = w.cast
  const t = f.time
  const r = w.room
  perceive(w, { shell: 1.2, furn: 1.2, mottle: 0.62, corridor: true })
  roomLight(w, 0.8, 1)
  const ch = r.office.chair.group
  ch.rotation.z = -1.35
  ch.position.set(0.42, 0.26, -8.1)
  r.office.monitor.visible = false
  r.office.photo.visible = false
  r.office.penHolder.rotation.z = 1.5
  const open = ss(0.58, 0.7, u)
  r.setDoor(open)
  const a = w.use(c.arifO)
  const g2 = w.use(c.g2)
  g2.place(160.72, 3.25, -2.6).hold(HOLD_TOWEL)
  if (u < 0.66) {
    a.place(159.85, 1.15, -2.43).blend(
      [
        [0.04, C.HEAVE],
        [0.14, STRAIGHT],
        [0.18, WIPE],
        [0.3, WIPE],
        [0.36, STRAIGHT],
        [0.42, P.STAND],
      ],
      u,
    )
    if (u > 0.42) a.place(159.95, 1.25, lerp(-2.43, 0.0, ss(0.44, 0.6, u)))
  } else {
    a.walk(makePath([[159.95, 1.25], [160.0, 2.4], [160.15, 3.0]]), sub(u, 0.66, 0.88), P.STAND, 0, 0.3)
    if (u > 0.88) a.blend([[0.88, P.STAND], [0.95, TOWEL_TAKE], [1.0, P.STAND]], u)
    a.lookAt(160.72, 3.25, ss(0.8, 0.9, u))
  }
  w.apply(t)
  // The towel: in her hands, then his.
  const tw = w.towel
  tw.visible = true
  tw.scale.set(1, 1, 1)
  if (u < 0.94) inHand(tw, g2.figure, 'r', [0.0, -0.02, 0.1])
  else inHand(tw, a.figure, 'r', [0.0, -0.02, 0.06])
  w.mouth(a, 0)
  motion.step = a.step
  motion.walking = a.walking
  motion.doors = win(u, 0.58, 0.6, 0.66, 0.7)
  if (u >= 0.05 && u < 0.42) {
    // Inside, on his face; the room behind overexposed and soft.
    w.post.white = 0.32
    w.post.blur = 0.18
    w.post.vignette = 0.2
    shot.pos.set(159.2, 1.6, 0.4).lerp(v.set(159.32, 1.6, 0.5), sub(u, 0.05, 0.42))
    jointPos(a.figure, 'head', v2)
    shot.tgt.copy(v2)
    shot.fov = 36
  } else {
    // The corridor: the door a hairline until 0.6, then open; he comes out.
    shot.pos.set(160.0, 1.6, 4.6).lerp(v.set(160.0, 1.6, 4.1), sub(u, 0.42, 1))
    shot.tgt.set(160.0, 1.45, 0.0)
    shot.fov = 36
    w.post.white = 0.22 * open * (1 - ss(0.8, 1, u))
  }
}
