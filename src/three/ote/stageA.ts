/**
 * Staging for the company's floors: the signing room (open … door, next) and
 * the corridor and elevator (elevator, rise, the start of topFloor).
 */
import * as THREE from 'three'
import { clamp, lerp, smoothstep } from '@/lib/math'
import { at } from '@/stories/ote/timeline'
import { makePath } from '../figure/paths'
import type { Actor } from '../kit/direct'
import * as P from '../figure/poses'
import { blendPose, makePose } from '../figure/Figure'
import { A } from './signing'
import { B } from './corridor'
import { POSES, setEyes, setGrip } from './cast'
import { env, face, hemi, point, pulse, show, spot, sunAt, type Rig, type St } from './rig'
import { T } from './lang'

const PI = Math.PI
const v = new THREE.Vector3()
const axis = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const q = new THREE.Quaternion()

const P_DOOR = makePath([
  [0, 1.12],
  [0.8, 0.95],
  [1.25, 0.2],
  [1.15, -1.6],
  [0.55, -3.0],
  [0.2, -3.45],
])
const P_THROUGH = makePath([
  [0.2, -3.45],
  [0.05, -4.1],
  [0.0, -5.2],
])
const P_CORRIDOR = makePath([
  [40, -1.45],
  [40, -11.0],
])
/** Standing up from the chair. */
const RISE = makePose({ hipY: 0.8, hipZ: 0.05, spine: [0.45, 0, 0], chest: [0.15, 0, 0], head: [0.1, 0, 0], lThigh: [-0.9, 0, 0.06], rThigh: [-0.9, 0, -0.06], lShin: [0.9, 0, 0], rShin: [0.9, 0, 0], lUpper: [-0.3, 0, 0.1], rUpper: [-0.3, 0, -0.1], lFore: [-0.4, 0, 0], rFore: [-0.4, 0, 0] })
/** Sitting upright, looking down at the page in front of him. */
const READ_UP = makePose({ spine: [-0.02, 0, 0], chest: [0.0, 0, 0], neck: [0.25, 0, 0], head: [0.42, 0, 0] }, POSES.SIT_TABLE)
/** The official leaning in to slide a sheet. */
const G_LEAN = makePose({ spine: [0.3, 0, 0], chest: [0.12, 0, 0], head: [0.15, 0, 0] }, POSES.SIT_STILL_UP)

/** Places the pen: lying on the table (rest), or by its grip point and axis. */
function penAt(r: Rig, grip: THREE.Vector3, dir: THREE.Vector3, along = 0.0) {
  const pen = r.A.pen
  pen.visible = true
  axis.copy(dir).normalize()
  q.setFromUnitVectors(up, axis)
  pen.quaternion.copy(q)
  pen.position.copy(grip).addScaledVector(axis, along)
}
const hq = new THREE.Quaternion()
const Z = new THREE.Vector3(0, 0, 1)
/** The pen in the curled right hand, in the hand's own frame: its axis (tip → cap) and the pinch point. */
const PEN_AXIS = new THREE.Vector3(0.4, 0.8, 0.3).normalize()
const PEN_PINCH = new THREE.Vector3(0.022, -0.095, -0.022)
/**
 * The pen in someone's right hand, placed from the hand itself (after the pose is applied),
 * so it is always between the thumb and the fingers; `twirl` spins it in the palm's plane.
 */
function penInHand(r: Rig, a: Actor, time: number, twirl = 0) {
  setGrip(a.figure, true)
  a.apply(time, true)
  const hand = a.figure.joints.rHand
  hand.getWorldQuaternion(hq)
  const dbg = (globalThis as { __otePen?: number[] }).__otePen
  const ax = dbg && dbg.length >= 3 ? new THREE.Vector3(dbg[0], dbg[1], dbg[2]).normalize() : PEN_AXIS
  const pinch = dbg && dbg.length >= 6 ? new THREE.Vector3(dbg[3], dbg[4], dbg[5]) : PEN_PINCH
  hand.localToWorld(v.copy(pinch))
  axis.copy(ax).applyAxisAngle(Z, twirl).applyQuaternion(hq)
  penAt(r, v, axis, dbg && dbg.length >= 7 ? dbg[6] : 0.022)
}
function penRest(r: Rig, at: THREE.Vector3, yaw: number) {
  const pen = r.A.pen
  pen.visible = true
  pen.rotation.set(0, yaw, PI / 2, 'YXZ')
  pen.position.copy(at)
}

/** The man at the table, by segment. */
function stageM(r: Rig, st: St) {
  const { seg, u } = st
  const a = show(r, 'M')
  const seat = () => a.place(A.chairM.x, A.chairM.z, PI)
  const rh = (x: number, y: number, z: number, w = 1) => a.reach('r', w, x, y, z, 0.35)
  const lh = (x: number, y: number, z: number, w = 1) => a.reach('l', w, x, y, z, 0.35)
  switch (seg) {
    case 'open':
    case 'glass': {
      seat().hold(POSES.SIT_BOWED)
      const turn = seg === 'glass' ? smoothstep(0.2, 0.75, u) * PI * 2 : 0
      rh(0.13, 0.84, 0.43)
      lh(-0.14, 0.795, 0.33)
      penInHand(r, a, st.time, turn)
      break
    }
    case 'pen': {
      seat().hold(POSES.SIT_BOWED)
      // One slow turn per 0.4 u; the thumb stops it at 0.52.
      const t = Math.min(u, 0.52)
      const turn = (t / 0.4) * PI * 2
      rh(0.14, 0.84 + 0.008 * Math.sin(turn), 0.43)
      // Two fingers flat on the page at 0.7.
      const flat = smoothstep(0.62, 0.74, u)
      lh(lerp(-0.18, -0.06, flat), 0.795, lerp(0.36, 0.3, flat))
      penInHand(r, a, st.time, turn)
      break
    }
    case 'pages': {
      seat().hold(POSES.SIT_BOWED)
      a.look = 0
      rh(0.16, 0.81, 0.46)
      // Three turns: lift the corner, carry it across, let go.
      let hx = 0.0
      let hz = 0.36
      let hy = 0.8
      for (const t0 of [0.1, 0.22, 0.34]) {
        const k = clamp((u - t0 + 0.03) / 0.11)
        if (k > 0 && k < 1) {
          const sweep = smoothstep(0.15, 0.9, k)
          hx = lerp(0.0, -0.33, sweep)
          hy = 0.8 + Math.sin(sweep * PI) * 0.1
          hz = 0.38
        }
      }
      if (u > 0.45) {
        // His index finger along one clause.
        const s = smoothstep(0.5, 0.9, u)
        hx = lerp(-0.17, -0.03, s)
        hy = 0.792
        hz = 0.25
      }
      lh(hx, hy, hz)
      penInHand(r, a, st.time)
      break
    }
    case 'refund': {
      seat().blend(
        [
          [0.06, POSES.SIT_BOWED],
          [0.18, POSES.SIT_TABLE],
        ],
        u,
      )
      a.lookAt(0, -0.85, 0.3 * smoothstep(0.06, 0.18, u))
      rh(0.16, 0.81, 0.46)
      lh(-0.08, 0.792, 0.27)
      penInHand(r, a, st.time)
      break
    }
    case 'lastPage': {
      // Upright, reading down at the sheet (his head clear of the insert's lens).
      seat().blend(
        [
          [0, POSES.SIT_TABLE],
          [0.26, READ_UP],
        ],
        u,
      )
      const down = smoothstep(0.08, 0.18, u)
      rh(lerp(0.16, A.penRest1.x - 0.02, down), lerp(0.81, 0.8, down), lerp(0.46, A.penRest1.z + 0.03, down))
      lh(-0.24, 0.795, 0.5)
      if (u < 0.16) penInHand(r, a, st.time)
      else penRest(r, A.penRest1, 0.5)
      break
    }
    case 'fortune': {
      seat().blend(
        [
          [0.44, POSES.SIT_TABLE],
          [0.6, POSES.SIT_BOWED],
        ],
        u,
      )
      a.lookAt(0.65, 0.3, smoothstep(0.42, 0.5, u) * (1 - smoothstep(0.6, 0.7, u)))
      // His hand at the tray, then to the pen, then the signature.
      const atTray = smoothstep(0.43, 0.5, u) * (1 - smoothstep(0.58, 0.64, u))
      const sign = clamp((u - 0.7) / 0.25)
      const holding = u > 0.64
      const tip = v.set(lerp(-0.157, -0.031, sign), 0.786, 0.389 - 0.012 * Math.sin(sign * PI * 5.2) * (1 - sign * 0.5))
      if (holding) {
        const toLine = smoothstep(0.64, 0.7, u)
        const gx = lerp(A.penRest1.x, tip.x + 0.03, toLine)
        const gz = lerp(A.penRest1.z, tip.z + 0.045, toLine)
        const gy = lerp(0.81, 0.83, toLine)
        rh(gx + 0.01, gy, gz + 0.02)
        penAt(r, v.set(gx, gy - 0.005, gz), axis.set(0.35, 0.8, 0.45), -0.02)
      } else {
        const toPen = smoothstep(0.58, 0.64, u)
        rh(lerp(lerp(0.2, 0.52, atTray), A.penRest1.x, toPen), 0.81, lerp(lerp(0.5, 0.36, atTray), A.penRest1.z + 0.02, toPen))
        penRest(r, A.penRest1, 0.5)
      }
      lh(-0.22, 0.795, 0.5)
      r.A.setSigned(sign)
      break
    }
    case 'sign': {
      seat().blend(
        [
          [0.0, POSES.SIT_BOWED],
          [0.45, POSES.SIT_TABLE],
        ],
        u,
      )
      // Pen down (0.05), square the pages (0.15), slide them across (0.2–0.4).
      const slide = smoothstep(0.2, 0.4, u)
      const handsOn = smoothstep(0.1, 0.16, u) * (1 - smoothstep(0.4, 0.46, u))
      if (u < 0.05) {
        rh(-0.05, 0.83, 0.43)
        penAt(r, v.set(lerp(-0.03, A.penRest2.x, u / 0.05), 0.82, 0.42), axis.set(0.35, 0.8, 0.45))
      } else {
        penRest(r, A.penRest2, 0)
        const z = lerp(0.3, -0.02, slide)
        rh(lerp(0.15, 0.03, handsOn), 0.8, lerp(0.42, z + 0.1, handsOn), 1)
        lh(lerp(-0.25, -0.22, handsOn), 0.8, lerp(0.45, z + 0.1, handsOn), 1)
      }
      break
    }
    case 'nod': {
      const stand = smoothstep(0.78, 1, u)
      a.place(A.chairM.x, lerp(A.chairM.z, 1.12, stand), PI)
      const pose = a.pose
      blendPose(POSES.SIT_TABLE, RISE, smoothstep(0.78, 0.9, u), pose)
      if (u > 0.9) blendPose(RISE, P.STAND, smoothstep(0.9, 1, u), pose)
      penRest(r, A.penRest2, 0)
      if (u < 0.8) {
        rh(0.15, 0.8, 0.42)
        lh(-0.15, 0.8, 0.42)
      }
      break
    }
    case 'door': {
      penRest(r, A.penRest2, 0)
      if (u < 0.42) a.walk(P_DOOR, smoothstep(0, 0.42, u), P.STAND, PI, PI)
      else if (u < 0.76) a.place(0.2, -3.45, PI).hold(P.STAND_EASY)
      else {
        a.walk(P_THROUGH, smoothstep(0.76, 0.95, u), P.STAND, PI, PI)
        a.visible = u < 0.95
      }
      break
    }
  }
}

/** The official, still. */
function stageG(r: Rig, st: St) {
  const { seg, u } = st
  const g = show(r, 'G')
  g.place(A.chairG.x, A.chairG.z, 0).hold(POSES.SIT_STILL_UP)
  const folded = () => {
    g.reach('r', 1, -0.06, 0.8, -0.42, 0.3)
    g.reach('l', 1, 0.06, 0.8, -0.42, 0.3)
  }
  switch (seg) {
    case 'lastPage': {
      const s = smoothstep(0.02, 0.25, u)
      const lean = pulse(0.0, 0.3, u)
      blendPose(POSES.SIT_STILL_UP, G_LEAN, lean, g.pose)
      g.reach('r', 1, 0.0, 0.79, lerp(-0.3, -0.05, s) + 0.04, 0.3)
      g.reach('l', 1, 0.08, 0.8, -0.42, 0.3)
      break
    }
    case 'sign': {
      // Receives (0.4), glances (0.45), opens the folder, the pages in, closes it (0.55), squares it (0.62–0.75).
      const recv = smoothstep(0.34, 0.42, u)
      const open = smoothstep(0.4, 0.48, u) * (1 - smoothstep(0.52, 0.58, u))
      const palm = smoothstep(0.6, 0.66, u) * (1 - smoothstep(0.76, 0.84, u))
      blendPose(POSES.SIT_STILL_UP, G_LEAN, recv * (1 - smoothstep(0.5, 0.6, u)) * 0.6, g.pose)
      const glance = pulse(0.42, 0.5, u)
      g.pose[2 + 4 * 3] += glance * 0.35
      if (open > 0.01) g.reach('r', open, A.folder.x - 0.12, 0.81 + 0.08 * Math.sin(open * PI), A.folder.z, 0.3)
      else if (palm > 0.01) g.reach('r', palm, A.folder.x, 0.8, A.folder.z, 0.3)
      else g.reach('r', recv, -0.06, 0.8, -0.32, 0.3)
      g.reach('l', recv, 0.08, 0.8, -0.3, 0.3)
      if (recv < 0.01) folded()
      break
    }
    case 'nod': {
      // Raises his eyes (0.1); one slow nod (0.25); a slight tilt toward the space behind him.
      const raise = smoothstep(0.06, 0.14, u)
      g.pose[2 + 4 * 3] += 0.18 * (1 - raise)
      g.pose[2 + 4 * 3] += 0.28 * pulse(0.22, 0.4, u)
      g.pose[2 + 4 * 3 + 2] += 0.1 * smoothstep(0.4, 0.5, u)
      folded()
      break
    }
    default:
      folded()
  }
}

/** The page stack, the turning sheet, the last page, the folder. */
function stageTable(r: Rig, st: St) {
  const { seg, u, p } = st
  const S = r.A
  const after = (s: 'pages' | 'lastPage' | 'fortune' | 'sign' | 'nod') => p >= at(s)
  // Clause on top: MADDE 7 before `pages`, then 9, 12, 14.
  let header = after('pages') ? 3 : 0
  let turning = -1
  let tt = 0
  let pile = 10
  if (seg === 'pages') {
    header = 0
    for (const [i, t0] of [0.1, 0.22, 0.34].entries()) {
      const k = clamp((u - t0) / 0.08)
      if (k >= 1) {
        header = i + 1
        pile = 11 + i
      } else if (k > 0) {
        turning = i
        tt = k
        header = i + 1
      }
    }
  } else if (after('pages')) pile = 13
  S.setHeader(header)
  S.setTurning(Math.max(0, turning), turning >= 0 ? tt : 0)
  S.setPile(pile)
  // The last page: under G's fingers, slid across, signed, handed over with the stack.
  const lp = S.lastPage
  const slideIn = seg === 'lastPage' ? smoothstep(0.02, 0.27, u) : after('fortune') ? 1 : 0
  const shownLast = after('lastPage')
  lp.visible = shownLast
  const handOver = seg === 'sign' ? smoothstep(0.2, 0.42, u) : after('nod') ? 1 : 0
  const intoFolder = seg === 'sign' ? smoothstep(0.48, 0.55, u) : after('nod') ? 1 : 0
  const fx = lerp(A.lastStart.x, A.stack.x, slideIn)
  const fz = lerp(A.lastStart.z, A.stack.z, slideIn)
  // Stack position (moves across in `sign`, then into the folder).
  const sx = lerp(lerp(A.stack.x, -0.06, handOver), A.folder.x, intoFolder)
  const sz = lerp(lerp(A.stack.z, -0.3, handOver), A.folder.z, intoFolder)
  const sy = lerp(A.stack.y, A.folder.y + 0.006, intoFolder)
  S.stack.position.set(sx, sy, sz)
  S.stack.rotation.y = 0
  if (handOver > 0 || seg === 'sign') lp.position.set(sx, sy + 0.0095, sz)
  else lp.position.set(fx, A.stack.y + (slideIn > 0.98 ? 0.0095 : 0.0012), fz)
  // A small drift as it slides, and it settles square.
  lp.rotation.y = (seg === 'lastPage' ? 0.08 * (1 - slideIn) : 0) - 0.01
  if (!after('fortune')) S.setSigned(0)
  else if (seg !== 'fortune') S.setSigned(1)
  // The folder: closed until `sign`; opened (0.4–0.48), closed on the pages (0.52–0.58).
  const open = seg === 'sign' ? smoothstep(0.4, 0.48, u) * (1 - smoothstep(0.52, 0.58, u)) : 0
  S.folderCover.rotation.z = open * PI * 0.98
  S.stack.visible = true
  if (intoFolder > 0.99 && open < 0.02) {
    S.stack.visible = false
    lp.visible = false
  }
}


/** "We", behind the glass. */
function stageWatchers(r: Rig, st: St) {
  const [w1, w2, w3] = A.watchers
  show(r, 'B1').place(w1.x, w1.z, PI / 2).hold(P.STAND_EASY).lookAt(0, 0.6, 0.4)
  const b2 = show(r, 'B2').place(w2.x, w2.z, PI / 2).hold(POSES.TABLET)
  const b3 = show(r, 'B3').place(w3.x, w3.z, PI / 2 - 0.1).hold(P.ARMS_CROSSED)
  b3.lookAt(0, 0.8, 0.5)
  // B2's tablet, in her left hand, its glow on her chin.
  b2.apply(st.time, true)
  const tab = r.A.tablet
  tab.visible = true
  b2.figure.lGrip.getWorldPosition(v)
  tab.position.copy(v).add(new THREE.Vector3(0.06, 0.0, -0.02))
  tab.rotation.set(0.0, PI / 2, -0.9, 'YXZ')
}

/** The next client, in his chair, turning the same pen. */
function stageNext(r: Rig, st: St) {
  const n = show(r, 'N')
  n.place(A.chairM.x, A.chairM.z, PI).hold(POSES.SIT_BOWED)
  const t = Math.min(st.u, 0.55)
  const turn = (t / 0.4) * PI * 2
  n.reach('r', 1, 0.13, 0.84 + 0.008 * Math.sin(turn), 0.43, 0.35)
  n.reach('l', 1, -0.14, 0.795, 0.33, 0.35)
  penInHand(r, n, st.time, turn)
  const S = r.A
  S.setHeader(0)
  S.setTurning(0, 0)
  S.setPile(4)
  S.stack.position.copy(A.stack)
  S.stack.visible = true
  S.lastPage.visible = false
  S.folderCover.rotation.z = 0
}

export function stageSigning(r: Rig, st: St) {
  const { seg, u } = st
  const w2x = A.watchers[1].x
  const w2z = A.watchers[1].z
  r.A.group.visible = true
  r.A.pen.visible = true
  r.A.tablet.visible = false
  stageWatchers(r, st)
  if (seg === 'next') {
    stageNext(r, st)
    stageG(r, { ...st, seg: 'open' })
    r.A.setFolderLabel(T('DOSYA K4-01', 'FILE K4-01'))
  } else {
    r.A.setFolderLabel(T('DOSYA K3-33', 'FILE K3-33'))
    stageM(r, st)
    stageG(r, st)
    stageTable(r, st)
  }
  // Door 2: opens heavy (0.45–0.75 of `door`), cold white light beyond.
  const open = seg === 'door' ? smoothstep(0.45, 0.75, u) : 0
  r.A.door2.rotation.y = -open * PI * 0.53
  // The lamp's mirror image in the glass, seen only from the room side.
  // ——— Light ———
  const L = r.lights
  // The pendant's cone on the table; almost no fill.
  spot(L, { x: 0, y: 1.73, z: 0 }, { x: 0, y: 0.76, z: 0.02 }, 0xffc98e, 26, 0.7, 0.55, 9, 1.5)
  // Daylight under door 1, and a little on its lower leaf; more of the leaf when the camera turns to it (refund).
  const doorLit = seg === 'refund' ? smoothstep(0.45, 0.7, u) : 0
  point(L, 0, 0, 0.25 + 0.45 * doorLit, 2.62, 0xffe2bc, 2.4 + 2.8 * doorLit, 2.3 + 0.7 * doorLit, 1.6)
  const behindGlass = seg === 'open' || seg === 'glass' || seg === 'next'
  if (behindGlass) point(L, 1, w2x + 0.2, 1.2, w2z, 0x9fbadf, 0.5, 1.1)
  else point(L, 1, -0.7, 2.2, -3.0, 0xc6d6f2, 0.9 * (1 - open) + 0.4, 3.2, 1.6)
  // Warm bounce off the table onto the faces.
  point(L, 2, 0, 0.95, 0.1, 0xffc58a, 1.3, 3.2)
  hemi(L, 0x2a2c33, 0x0c0a08, 0.14)
  // The cold light beyond door 2: long shadows back toward the table.
  sunAt(L, { x: 0.15, y: 1.7, z: -8.5 }, { x: 0, y: 0.2, z: 1.5 }, 0xe8f0ff, 5.5 * open, 5)
  r.m.coldLight.color.setScalar(0.015 + 3.5 * open)
  env(r, 'brown_photostudio_02', 0.14)
  r.motion.doors = open
}

// ——— Corridor and elevator ———

export function stageCorridor(r: Rig, st: St) {
  const { seg, u } = st
  const C = r.B
  C.group.visible = true
  const m = show(r, 'M')
  const ids = ['Q1', 'Q2', 'Q3', 'Q4', 'O1', 'O2'] as const
  const inCabin = seg !== 'elevator' || u >= 0.39
  if (!inCabin) {
    // Walking the corridor in formation: two ahead, two behind, one each side.
    m.walk(P_CORRIDOR, smoothstep(0.0, 0.39, u) * 0.92, P.STAND, PI, PI)
    const z = m.z
    const offs: Record<(typeof ids)[number], [number, number]> = { Q1: [-0.33, -1.0], Q2: [0.33, -1.0], Q3: [-0.33, 0.9], Q4: [0.33, 0.9], O1: [-0.66, 0.05], O2: [0.66, 0.05] }
    for (const id of ids) {
      const a = show(r, id)
      const [dx, dz] = offs[id]
      // Everyone in step: the same phase as his.
      a.walk(P_CORRIDOR, smoothstep(0.0, 0.39, u) * 0.92, id.startsWith('Q') ? POSES.CLASPED : P.STAND, PI, PI)
      a.place(40 + dx, z + dz, PI)
    }
  } else {
    const [mx, mz] = B.cabin.M
    m.place(mx, mz, 0).hold(P.STAND)
    if (seg === 'rise') {
      // He swallows; his hand closes.
      m.pose[2 + 4 * 3] += 0.14 * pulse(0.1, 0.24, u)
      m.pose[2 + 3 * 3] += 0.05 * pulse(0.1, 0.24, u)
      m.pose[2 + 10 * 3] += 0.45 * smoothstep(0.3, 0.4, u)
    }
    for (const id of ['Q1', 'Q2', 'Q3', 'O1', 'O2'] as const) {
      const [x, z] = B.cabin[id]
      show(r, id).place(x, z, 0).hold(id.startsWith('Q') ? POSES.CLASPED : P.STAND)
    }
    if (seg === 'elevator') {
      // Q4 stays in the corridor; the doors close on him.
      show(r, 'Q4').place(40.3, -11.6, PI).hold(POSES.CLASPED)
    }
  }
  // Doors: open while they walk in, closed at 0.5; open again at the top.
  const doors = seg === 'elevator' ? 1 - smoothstep(0.42, 0.52, u) : seg === 'rise' ? 0 : smoothstep(0.05, 0.15, u)
  C.setDoors(doors)
  // The indicator: the building's floors, then past them.
  let text = '1'
  let blur = 0
  if (seg === 'rise') {
    if (u < 0.3) text = String(1 + Math.floor((u / 0.3) * 23))
    else if (u < 0.9) {
      const seq = [24, 31, 60, 140, 400, 1200, 4800]
      const k = Math.min(seq.length - 1, Math.floor(((u - 0.3) / 0.6) * seq.length))
      text = String(seq[k])
      blur = smoothstep(0.4, 0.85, u)
    } else text = '—'
  } else if (seg === 'topFloor') text = '—'
  C.setIndicator(text, blur)
  // ——— Light ———
  const L = r.lights
  const cool = seg === 'rise' ? smoothstep(0.1, 0.9, u) : seg === 'topFloor' ? 1 : 0
  const flicker = seg === 'rise' && u > 0.58 && u < 0.66 && Math.sin(st.time * 47) > 0.2 ? 0.55 : 1
  const panel = new THREE.Color(0xfff4e6).lerp(new THREE.Color(0xdde8ff), cool)
  C.panel.color.copy(panel).multiplyScalar(1.3 * flicker)
  if (inCabin) {
    spot(L, { x: 40, y: 2.55, z: -13.3 }, { x: 40, y: 0, z: -13.3 }, panel, 16 * flicker, 1.0, 0.8, 6, 1.4)
    point(L, 0, 40, 2.2, -13.3, panel, 3.5 * flicker, 4)
    // Bright light beyond the opening doors at the top.
    point(L, 1, 40, 1.3, -11.6, 0xf4f8ff, seg === 'topFloor' ? 12 * doors : 2, 5)
    hemi(L, 0xdde4ee, 0x50545a, 0.35)
  } else {
    spot(L, { x: 40, y: 2.7, z: -4 }, { x: 40, y: 0, z: -6 }, 0xf2f6ff, 10, 1.1, 0.9, 12, 1.2)
    point(L, 0, 40, 2.5, -2, 0xf2f6ff, 3, 6)
    point(L, 1, 40, 2.5, -7, 0xf2f6ff, 3, 6)
    point(L, 2, 40, 2.5, -11, 0xf2f6ff, 3, 6)
    hemi(L, 0xf0f4fa, 0x7a7e84, 0.7)
  }
  env(r, 'hospital_room_2', inCabin ? 0.45 : 0.6)
  r.motion.walking = m.walking
  r.motion.step = m.step
  setEyes(m.figure, 0)
  void face
}
