/**
 * Staging for the shuttle: the man steps out of the elevator into a cabin of
 * thirty-two strangers; the heads turn; the faces; the seats; the countdown;
 * the climb (with the launch seen from outside); the silence after cut-off.
 */
import * as THREE from 'three'
import { clamp, lerp, mulberry32, smoothstep } from '@/lib/math'
import { makePath, type Path } from '../figure/paths'
import * as P from '../figure/poses'
import { blendPose } from '../figure/Figure'
import type { Actor } from '../kit/direct'
import { SC, seatPos } from './shuttle'
import { POSES, type CastId } from './cast'
import { env, face, hemi, point, pulse, show, spot, sunAt, toWorld, type Rig, type St } from './rig'

const PI = Math.PI
const v = new THREE.Vector3()

/** Where he stands at the back, once out of the elevator. */
const M_REAR = { x: 100.25, z: 0.15 }
const gap = (seat: number) => {
  const s = seatPos(seat)
  return { x: s.x + (s.x < 100 ? 0 : 0), z: s.z - 0.62 }
}

type Person = { id: CastId; seat: number; stand: { x: number; z: number }; sitAt: number }
/** The named and the six others in full figure: their seats, where they stand before, when they sit. */
const PEOPLE: Person[] = [
  { id: 'P1', seat: 2, stand: gap(2), sitAt: 0.62 },
  { id: 'P2', seat: 3, stand: gap(3), sitAt: 0.55 },
  { id: 'P3', seat: 9, stand: gap(9), sitAt: 0.7 },
  { id: 'P4', seat: 14, stand: gap(14), sitAt: 0.58 },
  { id: 'P5', seat: 17, stand: gap(17), sitAt: 0.66 },
  { id: 'P6', seat: 19, stand: gap(19), sitAt: 0.52 },
  { id: 'Y', seat: 29, stand: { x: 101.45, z: -2.82 }, sitAt: 0.5 },
  { id: 'C1', seat: 24, stand: { x: 98.62, z: -4.02 }, sitAt: 0.56 },
  { id: 'C2', seat: 25, stand: { x: 99.22, z: -3.98 }, sitAt: 0.56 },
  { id: 'H', seat: 23, stand: { x: 101.45, z: -5.22 }, sitAt: 0.6 },
  { id: 'S', seat: 30, stand: { x: 99.2, z: -6.42 }, sitAt: 0.53 },
]
const W1_STAND = { x: 99.2, z: -1.6 }
const AISLE = 100.35

/** The crowd: 20 seats; where each stands first (displaced to the front if a named person has their spot). */
const CROWD_SEATS = [0, 1, 4, 5, 6, 7, 8, 10, 11, 12, 13, 18, 20, 21, 22, 26, 27, 28, 31, 32]
const DISPLACED: Record<number, number> = { 1: 15, 5: 16, 6: 23, 7: 24, 11: 25, 13: 29 }
const rand = mulberry32(33)
const CROWD = CROWD_SEATS.map((seat, i) => {
  const stand = gap(DISPLACED[seat] ?? seat)
  return { seat, stand: { x: stand.x + (rand() - 0.5) * 0.12, z: stand.z + (rand() - 0.5) * 0.1 }, yaw0: PI + (rand() - 0.5) * 2.4, sitAt: 0.5 + rand() * 0.38, i }
})

function pathTo(from: { x: number; z: number }, seat: number): Path {
  const s = seatPos(seat)
  const g = s.z - 0.6
  const pts: Array<[number, number]> = [[from.x, from.z]]
  if (Math.abs(from.z - g) > 0.3) {
    pts.push([AISLE, from.z], [AISLE, g])
  }
  pts.push([s.x, g])
  return makePath(pts)
}
const paths = new Map<string, Path>()
const pathFor = (key: string, from: { x: number; z: number }, seat: number) => {
  let p = paths.get(key)
  if (!p) paths.set(key, (p = pathTo(from, seat)))
  return p
}

/** Before the turn: chatting, looking about; after: toward him. Ripple by distance. */
function turnAmount(st: St, x: number, z: number) {
  if (st.seg === 'cabin') {
    const d = Math.hypot(x - M_REAR.x, z - M_REAR.z)
    const t0 = 0.4 + d * 0.006
    return smoothstep(t0, t0 + 0.07, st.u)
  }
  return st.seg === 'topFloor' ? 0 : 1
}

/** Sitting: stand at the spot → walk to the seat's row → turn and sit. */
function seated(st: St) {
  const s = st.seg
  return s === 'seat' || s === 'ignition' || s === 'gforce' || s === 'space'
}

/** Hands on the armrests of a seat (facing −z: the right hand on the +x side). */
function armrests(a: Actor, seat: number, which: 'l' | 'r' | 'both', w = 1) {
  const s = seatPos(seat)
  if (which !== 'l') a.reach('r', w, s.x + 0.272, 0.69, s.z - 0.12, 0.6)
  if (which !== 'r') a.reach('l', w, s.x - 0.272, 0.69, s.z - 0.12, 0.6)
}

function sitPerson(a: Actor, seat: number, pose: Float32Array) {
  const s = seatPos(seat)
  a.place(s.x, s.z, PI).hold(pose)
}

function stagePerson(r: Rig, st: St, per: Person) {
  const a = show(r, per.id)
  const { seg, u } = st
  const base = per.id === 'S' || per.id === 'P3' ? P.STAND : P.STAND_EASY
  if (seated(st)) {
    sitPerson(a, per.seat, seg === 'gforce' ? POSES.SIT_G : POSES.SIT_ARMS)
    armrests(a, per.seat, per.id === 'C1' ? 'l' : per.id === 'C2' ? 'r' : 'both')
    return a
  }
  if (seg === 'announce' && u >= per.sitAt) {
    const path = pathFor(per.id, per.stand, per.seat)
    const walkLen = clamp(path.total / 18, 0.05, 0.28)
    const k = (u - per.sitAt) / walkLen
    if (k < 1) {
      a.walk(path, k, P.STAND, PI, PI)
    } else {
      const s = seatPos(per.seat)
      const sit = smoothstep(0, 0.06, u - per.sitAt - walkLen)
      a.place(s.x, lerp(s.z - 0.6, s.z, sit), PI)
      blendPose(P.STAND, POSES.SIT_ARMS, sit, a.pose)
    }
    return a
  }
  // Standing, facing about; then toward him.
  const t = turnAmount(st, per.stand.x, per.stand.z)
  const yaw0 = per.stand.x < 100 ? PI * 0.62 : -PI * 0.62
  const yaw1 = face(per.stand.x, per.stand.z, M_REAR.x, M_REAR.z)
  a.place(per.stand.x, per.stand.z, lerp(yaw0, yaw1, t)).hold(base)
  if (seg === 'faces') {
    // Pairs nod to each other without speaking, and look away.
    const nod = pulse(0.66, 0.78, u) + pulse(0.82, 0.92, u)
    a.pose[2 + 4 * 3] += 0.22 * nod * (per.id === 'P2' || per.id === 'H' || per.id === 'P5' ? 1 : 0.6)
    if (u > 0.7) a.lookAt(per.stand.x + (per.stand.x < 100 ? 1 : -1), per.stand.z - 1.5, smoothstep(0.7, 0.8, u))
  }
  return a
}

export function stageShuttle(r: Rig, st: St) {
  const { seg, u, time } = st
  const C = r.C
  C.group.visible = true
  // ——— Him ———
  const m = show(r, 'M')
  if (seg === 'topFloor') {
    const step = smoothstep(0.2, 0.42, u)
    if (u < 0.42) m.walk(makeStep, step, P.STAND, PI, PI)
    else m.place(M_REAR.x, M_REAR.z, PI).hold(P.STAND)
  } else if (seg === 'cabin' || seg === 'faces') m.place(M_REAR.x, M_REAR.z, PI).hold(P.STAND)
  else if (seg === 'announce') {
    if (u < 0.7) m.place(M_REAR.x, M_REAR.z, PI).hold(P.STAND)
    else m.walk(mWalk, smoothstep(0.7, 1.0, u), P.STAND, PI, PI)
  } else if (seg === 'seat') {
    if (u < 0.1) {
      const k = smoothstep(0, 0.1, u)
      m.place(lerp(AISLE, SC.his.x, smoothstep(0, 0.6, k)), lerp(-7.62, SC.his.z, smoothstep(0.5, 1, k)), lerp(-PI / 2, PI, smoothstep(0.3, 0.8, k)))
      blendPose(P.STAND, POSES.SIT_ARMS, smoothstep(0.5, 1, k), m.pose)
    } else {
      sitPerson(m, 15, POSES.SIT_ARMS)
      armrests(m, 15, 'both', smoothstep(0.1, 0.2, u))
    }
    if (u > 0.1) m.lookAt(97.85, -7.0, 0.6 * smoothstep(0.1, 0.25, u) * (1 - smoothstep(0.45, 0.6, u)))
    if (u > 0.6) m.lookAt(SC.w1.x, SC.w1.z - 0.3, 0.4 * pulse(0.6, 0.95, u))
  } else {
    sitPerson(m, 15, seg === 'gforce' ? POSES.SIT_G : POSES.SIT_ARMS)
    armrests(m, 15, 'l')
    if (seg === 'space') {
      if (u < 0.42) m.lookAt(97.85, -7.0, 0.7)
      else m.lookAt(99.0, -7.3, 0.5 * smoothstep(0.48, 0.6, u))
      if (u > 0.5) m.pose[2 + 4 * 3] -= 0.15 * smoothstep(0.5, 0.8, u)
    }
  }
  // ——— Her ———
  const w = show(r, 'W1')
  let wSeated = false
  if (seg === 'topFloor' || seg === 'cabin' || seg === 'faces' || seg === 'announce') {
    const t = turnAmount(st, W1_STAND.x, W1_STAND.z)
    w.place(W1_STAND.x, W1_STAND.z, lerp(PI * 0.7, face(W1_STAND.x, W1_STAND.z, M_REAR.x, M_REAR.z), t)).hold(POSES.TABLET)
  } else if (seg === 'seat' && u < 0.45) {
    const k = smoothstep(0.22, 0.45, u)
    if (k < 0.85) w.walk(wWalk, k / 0.85, P.STAND, PI, PI)
    else {
      const s = smoothstep(0.85, 1, k)
      w.place(SC.w1.x, lerp(SC.w1.z - 0.6, SC.w1.z, s), PI)
      blendPose(P.STAND, POSES.SIT_KNIT, s, w.pose)
    }
  } else {
    wSeated = true
    sitPerson(w, 16, seg === 'gforce' ? POSES.SIT_G : POSES.SIT_KNIT)
  }
  if (wSeated && seg === 'seat') {
    // She lays her knitting in her lap (0.55), then leans over and fastens his harness (0.75).
    const lean = pulse(0.62, 0.9, u)
    w.pose[2 + 1 * 3] += 0.35 * lean
    w.pose[2 + 1 * 3 + 1] += -0.35 * lean
    w.reach('l', lean, SC.his.x + 0.02, 0.69, SC.his.z - 0.17, 0.4)
    w.lookAt(SC.his.x, SC.his.z, lean)
  }
  if (seg === 'gforce' && u > 0.475) {
    // Her hand finds his on the armrest and stays.
    const hold = smoothstep(0.48, 0.56, u)
    w.reach('l', hold, SC.his.x + 0.27, 0.7, SC.his.z - 0.12, 0.6)
    m.reach('r', 1, SC.his.x + 0.27, 0.68, SC.his.z - 0.1, 0.6)
  }
  if (seg === 'ignition' || seg === 'gforce' || seg === 'space') m.reach('r', 1, SC.his.x + 0.272, 0.69, SC.his.z - 0.12, 0.6)
  // The knitting in her lap; the ball that floats away after cut-off.
  const knit = r.E.knit
  const ball = r.E.yarnBall
  const bag = r.E.bag
  knit.visible = true
  ball.visible = true
  bag.visible = true
  w.apply(time, true)
  if (wSeated) {
    toWorld(w, 0, 0.62, 0.3, v)
    knit.position.copy(v)
    knit.rotation.set(-1.1, w.yaw, 0, 'YXZ')
    r.E.knitPiece.scale.set(1, 1, 1)
    bag.position.set(SC.w1.x + 0.18, 0, SC.w1.z - 0.38)
    bag.rotation.y = PI
    const float = seg === 'space' ? smoothstep(0.47, 0.64, u) : 0
    toWorld(w, -0.08, 0.6, 0.34, v)
    ball.position.set(v.x + 0.14 * float, v.y + 0.62 * float + 0.02 * Math.sin(time * 0.9) * float, v.z - 0.3 * float + 0.03 * Math.sin(time * 0.7) * float)
    ball.rotation.set(time * 0.2 * float, time * 0.3 * float, 0)
    r.C.strand.visible = float > 0.01
    if (float > 0.01) r.C.setStrand(knit.position, ball.position)
  } else {
    // Standing: the ball in her hands, the bag on her arm.
    w.figure.lGrip.getWorldPosition(v)
    ball.position.copy(v).add(new THREE.Vector3(0.0, 0.04, 0.0))
    knit.position.copy(v).add(new THREE.Vector3(0, -0.02, 0.04))
    knit.rotation.set(-0.3, w.yaw, 0.3, 'YXZ')
    w.figure.rGrip.getWorldPosition(v)
    bag.position.set(v.x, v.y - 0.32, v.z)
    bag.rotation.y = w.yaw
    r.C.strand.visible = false
  }
  // ——— The others ———
  for (const per of PEOPLE) {
    const a = stagePerson(r, st, per)
    if (per.id === 'C1' || per.id === 'C2') {
      // Always hand in hand.
      const sitting = seated(st) || (seg === 'announce' && a.pose[0] < 0.8)
      if (sitting && seated(st)) {
        const s = seatPos(24)
        if (per.id === 'C1') a.reach('r', 1, s.x + 0.35, 0.69, s.z - 0.08, 0.6)
        else a.reach('l', 1, s.x + 0.35, 0.69, s.z - 0.08, 0.6)
      } else if (!seated(st) && !(seg === 'announce' && u >= per.sitAt)) {
        if (per.id === 'C1') a.reach('l', 1, 98.92, 0.86, -4.05, 0.3)
        else a.reach('r', 1, 98.92, 0.86, -4.05, 0.3)
      }
    }
    if (per.id === 'H' && seg === 'faces') {
      // She pushes her hair back: the white bracelet shows.
      const k = pulse(0.36, 0.56, u)
      if (k > 0) {
        toWorld(a, 0.06, 1.62, 0.02, v)
        a.reach('l', k, v.x, v.y, v.z, 0.9)
      }
    }
    if (per.id === 'S' && (seg === 'faces' || seg === 'cabin')) {
      // He checks his watch.
      const k = seg === 'faces' ? pulse(0.46, 0.7, u) : pulse(0.1, 0.35, u)
      if (k > 0) {
        toWorld(a, 0.05, 1.2, 0.3, v)
        a.reach('l', k, v.x, v.y, v.z, 0.5)
        a.pose[2 + 4 * 3] += 0.35 * k
      }
    }
    if (per.id === 'Y') {
      const gc = r.E.guitarCase
      gc.visible = !seated(st)
      if (gc.visible) {
        a.apply(time, true)
        toWorld(a, 0, 0.62, -0.2, v)
        gc.position.copy(v)
        gc.rotation.set(0.08, a.yaw, 0.12, 'YXZ')
      }
    }
  }
  if (seated(st)) {
    const gc = r.E.guitarCase
    gc.visible = true
    gc.position.set(102.0, 0, SC.rows[9] - 0.55)
    gc.rotation.set(0, 0, -0.08)
  }
  // ——— The crowd ———
  const cr = r.crowd
  for (const c of CROWD) {
    const s = seatPos(c.seat)
    let sat = seated(st)
    if (seg === 'announce' && u >= c.sitAt + 0.1) sat = true
    if (sat) {
      const shake = seg === 'ignition' && u > 0.32 ? 0.006 : seg === 'gforce' ? 0.008 : seg === 'space' ? 0.006 * (1 - smoothstep(0.3, 0.45, u)) : 0
      cr.set(c.i, s.x + Math.sin(time * 41 + c.i) * shake, s.z, PI, { seated: true, lean: seg === 'gforce' ? 0.16 : 0, headDown: seg === 'seat' ? 0.2 : 0, headYaw: seg === 'space' && u > 0.5 ? 0.3 * Math.sin(c.i) : 0 })
    } else if (seg === 'announce' && u >= c.sitAt) {
      const path = pathFor(`c${c.i}`, c.stand, c.seat)
      const k = (u - c.sitAt) / 0.1
      const pp = pointOn(path, k)
      cr.set(c.i, pp.x, pp.z, pp.yaw, {})
    } else {
      const t = turnAmount(st, c.stand.x, c.stand.z)
      const toM = face(c.stand.x, c.stand.z, M_REAR.x, M_REAR.z)
      const body = lerp(c.yaw0, lerpAngle(c.yaw0, toM, 0.6), t)
      const head = lerpAngle(body, toM, t) - body
      const nod = seg === 'faces' ? pulse(0.66 + (c.i % 3) * 0.06, 0.76 + (c.i % 3) * 0.06, u) : 0
      cr.set(c.i, c.stand.x, c.stand.z, body, { headYaw: clamp(head, -1.2, 1.2), headDown: nod * 0.8 + (seg === 'faces' && u > 0.78 ? 0.3 : 0) })
    }
  }
  for (let i = CROWD.length; i < cr.count; i++) cr.set(i, 0, 0, 0, { visible: false })
  cr.group.visible = true
  // ——— Doors, lock, panel, harnesses ———
  const open = seg === 'topFloor' ? smoothstep(0.17, 0.2, u) * (1 - smoothstep(0.48, 0.55, u)) : 0
  C.setLeaves(open)
  const locked = seg !== 'topFloor' || u > 0.55
  C.lock.material = locked ? r.m.lockRed : r.m.lockGreen
  const lockGlow = seg === 'topFloor' ? smoothstep(0.55, 0.6, u) : seg === 'cabin' ? 1 - smoothstep(0.2, 0.5, u) : 0
  // The escort, still inside the elevator.
  if (seg === 'topFloor' && u < 0.6) {
    const spots: Array<[CastId, number, number]> = [
      ['Q1', 100, 2.1],
      ['O1', 99.35, 2.65],
      ['O2', 100.65, 2.65],
      ['Q2', 99.6, 3.35],
      ['Q3', 100.4, 3.35],
    ]
    for (const [id, x, z] of spots) show(r, id).place(x, z, PI).hold(id.startsWith('Q') ? POSES.CLASPED : P.STAND)
  }
  if (seg === 'announce') C.setPanel({ kind: u > 0.02 ? 'sit' : 'off' })
  else if (seg === 'ignition') C.setPanel(u < 0.32 ? { kind: 'count', n: Math.max(0, 10 - Math.floor(((u - 0.04) / 0.28) * 10)) } : { kind: 'go' })
  else if (seg === 'space') C.setPanel(u >= 0.7 ? { kind: 'route', t: smoothstep(0.7, 0.85, u) } : { kind: 'off' })
  else if (seg === 'seat') C.setPanel({ kind: 'sit' })
  else if (seg === 'gforce') C.setPanel({ kind: 'go' })
  else C.setPanel({ kind: 'off' })
  C.harnessM.visible = seg !== 'seat' ? seated(st) : u > 0.77
  C.harnessW.visible = seated(st) && (seg !== 'seat' || u > 0.5)
  // ——— The sky outside the windows ———
  let alt = 0
  let race = 0
  if (seg === 'gforce') {
    alt = u < 0.3 ? lerp(0.05, 0.3, u / 0.215) : lerp(0.3, 0.46, (u - 0.475) / 0.525)
    race = u < 0.3 ? smoothstep(0.0, 0.05, u) : 0.6 * (1 - smoothstep(0.6, 1, u))
  } else if (seg === 'space') {
    alt = lerp(0.46, 1, smoothstep(0, 0.42, u))
    race = 0.3 * (1 - smoothstep(0.0, 0.25, u))
  } else if (seg === 'ignition' && u > 0.32) alt = 0.01
  r.launch.on = true
  r.launch.alt = alt
  r.launch.race = race
  // ——— Light ———
  const L = r.lights
  const red = seg === 'ignition' ? smoothstep(0.3, 0.36, u) : seg === 'gforce' ? 1 : seg === 'space' ? 1 - smoothstep(0.44, 0.48, u) : 0
  const white = seg === 'space' ? smoothstep(0.44, 0.5, u) : 0
  const cabin = new THREE.Color(0xdfe8ff).lerp(new THREE.Color(0xff3b28), red)
  const ledLevel = lerp(1, 0.35, red) * (1 - white) + white * 0.85
  spot(L, { x: 100, y: 2.85, z: -6.5 }, { x: 100, y: 0, z: -6.5 }, cabin, 30 * ledLevel, 1.25, 0.9, 16, 1.2)
  if (lockGlow > 0.01) point(L, 0, 100, 2.3, 1.0, 0xff3020, 6 * lockGlow, 3.5, 1.6)
  else point(L, 0, 100, 2.6, -1.5, cabin, 4 * ledLevel, 6)
  point(L, 1, 100, 2.6, -12, cabin, 4 * ledLevel, 6)
  point(L, 2, 100, 2.6, -7.5, cabin, 3 * ledLevel, 5)
  r.C.ceilingStrip.color.copy(cabin).multiplyScalar(0.5 + ledLevel)
  hemi(L, cabin.clone().lerp(new THREE.Color(0xffffff), 0.3), 0x2a2522, 0.25 * ledLevel + 0.05)
  // The low sun through the right-hand windows (dawn); white and hard in space.
  const dawn = seg === 'gforce' || seg === 'space' ? 0 : 1
  const sunCol = new THREE.Color(0xffb46a).lerp(new THREE.Color(0xfff6ea), 1 - dawn)
  const sunI = dawn ? 2.4 : seg === 'gforce' ? 2.2 : 2.6 * (seg === 'space' ? 1 : 0)
  sunAt(L, { x: 112, y: dawn ? 2.4 : 5, z: -3 }, { x: 100, y: 0.6, z: -7 }, sunCol, sunI, 9)
  env(r, red > 0.5 ? 'abandoned_tiled_room' : 'belfast_sunset_puresky', 0.35 * ledLevel + 0.08)
  r.motion.walking = m.walking
  r.motion.step = m.step
}

const makeStep = makePath([
  [100, 2.1],
  [100.1, 1.0],
  [M_REAR.x, M_REAR.z],
])
const mWalk = makePath([
  [M_REAR.x, M_REAR.z],
  [AISLE, -1.0],
  [AISLE, -7.62],
])
const wWalk = makePath([
  [W1_STAND.x, W1_STAND.z],
  [AISLE - 0.1, -2.2],
  [AISLE - 0.1, -7.55],
  [SC.w1.x, -7.6],
])

const ps = { x: 0, z: 0, yaw: 0 }
function pointOn(path: Path, k: number) {
  const d = clamp(k) * path.total
  let i = 1
  while (i < path.cum.length - 1 && path.cum[i] < d) i++
  const a = path.pts[i - 1]
  const b = path.pts[i]
  const t = (d - path.cum[i - 1]) / (path.cum[i] - path.cum[i - 1] || 1)
  ps.x = lerp(a[0], b[0], t)
  ps.z = lerp(a[1], b[1], t)
  ps.yaw = Math.atan2(b[0] - a[0], b[1] - a[1])
  return ps
}
function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % (PI * 2)
  if (d > PI) d -= PI * 2
  if (d < -PI) d += PI * 2
  return a + d * t
}

/** Set D: the launch from outside. */
export function stageLaunch(r: Rig, st: St) {
  const k = clamp((st.u - 0.215) / 0.26)
  const D = r.D
  D.group.visible = true
  D.ship.position.set(0, lerp(-24, 42, k), 0)
  D.update(st.time)
  r.deck.mesh.visible = true
  r.deck.mat.uniforms.uTime.value = st.time
  r.deck.mat.uniforms.uHole.value.set(200, 0)
  r.deck.mat.uniforms.uFire.value = 1 - smoothstep(0.4, 1, k)
  r.launch.on = true
  r.launch.alt = 0.12
  r.launch.race = 0
  const L = r.lights
  // The low sun from the right, gold; the fire lights the clouds from below.
  sunAt(L, { x: 330, y: 22, z: 10 }, { x: 200, y: 12, z: 0 }, 0xffc890, 4.2, 40)
  point(L, 0, 200, D.ship.position.y - 8, 0, 0xff8a3a, 1400, 140, 1.6)
  hemi(L, 0x6f8fc8, 0x6a5a50, 0.35)
  spot(L, { x: 200, y: 80, z: 60 }, { x: 200, y: 0, z: 0 }, 0xffffff, 0, 0.5)
  env(r, 'belfast_sunset_puresky', 0.55)
}
