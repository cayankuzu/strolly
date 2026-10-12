/**
 * Chapter 8 — 333. The same evening, earlier: the van in the sodium bay, the
 * neck band, the restraint frame on the moving platform, the wash tunnel, the
 * reading room with its giant speakers and wall of screens, the injection
 * station (the prep room's lens arm again), and the belt to the dark slot.
 * Clinical and cold; the man in respectful medium shots.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import type { SetFrame, Shot } from '../kit/SetScene'
import { type Actor } from '../kit/direct'
import { makePose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import * as C from './cast'
import { BELT_Y, LINE_X } from './convict'
import { env, motion, PI, ss, sub, two, win, type Seg } from './common'
import { inHand, jointPos, type World } from './world'
import * as S from './screens'
import { silhouette } from './actD'

const X = LINE_X
/** Where a man's feet stand in the frame. */
const FOOT_Y = BELT_Y + 0.04
/** Van floor height (the rear doors at z 3.75). */
const VAN_FLOOR = 0.56

const SIT_BENCH = makePose({ spine: [0.2, 0, 0], neck: [0.25, 0, 0], head: [0.25, 0, 0] }, P.SIT)
const STAND_HOOD = makePose({ neck: [0.12, 0, 0], head: [0.12, 0, 0] }, C.CUFFED)
const GUARD_HOLD = makePose({ lUpper: [-0.4, 0, 0.1], lFore: [-1.5, 0.3, 0], rUpper: [-0.3, 0, -0.12], rFore: [-1.2, -0.2, 0] }, P.STAND)
const GUARD_ARM = makePose({ rUpper: [-0.85, 0, -0.15], rFore: [-0.5, 0, 0], spine: [0.08, 0, 0] }, P.STAND)
const CLAMP = makePose({ hipZ: -0.05, spine: [0.85, 0, 0], chest: [0.3, 0, 0], neck: [-0.2, 0, 0], lUpper: [-1.0, 0, 0.12], rUpper: [-1.0, 0, -0.12], lFore: [-0.3, 0, 0], rFore: [-0.3, 0, 0], lThigh: [-0.7, 0, 0.1], rThigh: [-0.7, 0, -0.1], lShin: [1.1, 0, 0], rShin: [1.1, 0, 0] })

const v = new THREE.Vector3()
const v2 = new THREE.Vector3()

/** The hood that the overhead gripper takes away (a copy hanging from it). */
const liftedHoods = new WeakMap<World, THREE.Object3D>()
function liftedHood(w: World) {
  let h = liftedHoods.get(w)
  if (!h) {
    const src = w.hoods.get(w.cast.c333)!
    h = src.clone(true)
    h.position.set(0, -0.32, 0)
    h.rotation.set(0, 0, 0)
    h.scale.copy(src.scale).multiplyScalar(0.98)
    w.line.gripper.add(h)
    liftedHoods.set(w, h)
  }
  return h
}

type Light = 'bay' | 'wash' | 'reading' | 'station'

function lineLight(w: World, mode: Light, t: number, amp = 0) {
  const L = w.lights
  w.line.sodium.color.setRGB(1.6, 0.95, 0.4)
  if (mode === 'bay') {
    env(w, 'night', 0.28, 0x0b0a08, [20, 70])
    L.setHemi(0xffb060, 0x2a2018, 0.4)
    L.setSun(0xffa050, 0.6, [X - 6, 10, 14], [X, 0, 3], 10)
    L.setKey(0xffa848, 30, [X + 1.6, 4.6, 1.2], [X, 0.9, 4.2], 0.85, 10, 0.7)
    L.setPoint(0, 0xff9a3c, 9, [X, 4.0, 5], 10)
    L.setPoint(1, 0xff9a3c, 9, [X, 4.0, 0], 10)
    L.setPoint(2, 0xff9a3c, 6, [X, 4.0, -5], 10)
    L.setPoint(3, 0xffe6b0, 1.5, [X, 2.3, 5.6], 3)
  } else if (mode === 'wash') {
    env(w, 'night', 0.3, 0x0b0a08, [20, 70])
    L.setHemi(0xd8e4f0, 0x1a1c1e, 0.35)
    L.setKey(0xeaf4ff, 26, [X, 4.4, -9.5], [X, 1.0, -9.5], 0.9, 8, 0.6)
    L.setPoint(0, 0xff9a3c, 6, [X, 4.0, -5], 10)
    // Rotating amber beacons.
    for (let i = 0; i < 3; i++) {
      const z = [-7, -9.5, -11][i]
      const a = t * 5 + i * 2
      L.setPoint(1 + i, 0xffa020, 3.5 + 2.5 * Math.max(0, Math.sin(a)), [X + 1.2 + Math.cos(a) * 0.3, 3.0, z + Math.sin(a) * 0.3], 5)
    }
  } else if (mode === 'reading') {
    env(w, 'night', 0.1, 0x020202, [30, 60])
    L.setHemi(0x406080, 0x050505, 0.12)
    L.setKey(0xbcd2ff, 10 + 30 * amp, [X, 4.6, -26.2], [X, 1.0, -21], 1.0, 16, 0.8)
    L.setPoint(0, 0xff3a2a, 4 * amp, [X - 2, 3.8, -26], 10)
    L.setPoint(1, 0x8fb0ff, 3, [X, 6.8, -18], 9)
  } else {
    env(w, 'clinic', 0.7, 0x0b0b0b, [20, 60])
    L.setHemi(0xf4f8ff, 0x9aa0a0, 0.6)
    L.setKey(0xffffff, 18, [X, 2.35, -31.5], [X, 0.8, -32.2], 1.0, 6, 0.8)
    L.setPoint(0, 0xf4f8ff, 4, [X - 1.2, 2.2, -32], 5)
    L.setPoint(1, 0xf4f8ff, 4, [X + 1.2, 2.2, -32], 5)
    L.setPoint(2, 0xff9a3c, 3, [X, 3.5, -36], 6)
  }
  // The beacon domes spin in the wash only.
  w.line.beaconMat.color.setRGB(1.4, 0.7, 0.15).multiplyScalar(mode === 'wash' ? 1 : 0.25)
  w.line.beacons.forEach((b, i) => (b.rotation.y = mode === 'wash' ? t * 5 + i * 2 : 0))
}

/** A man standing in his restraint frame at depth z (frames move with the belt). */
function inFrame(w: World, a: Actor, k: 0 | 1, z: number, pose = STAND_HOOD) {
  const fr = w.line.frames[k]
  fr.group.visible = true
  fr.group.position.set(X, BELT_Y, z)
  fr.tilt.rotation.x = 0
  a.place(X, z - 0.02, PI).hold(pose)
  a.y = FOOT_Y
  // Wrists to the bar in front.
  a.reach('l', 1, X + 0.06, BELT_Y + 0.97, z - 0.17, 0.5)
  a.reach('r', 1, X - 0.06, BELT_Y + 0.97, z - 0.17, 0.5)
  return a
}

/** The hood (dry or wet) on or off. */
function hoodOn(w: World, a: Actor, on: boolean, wet = 0) {
  const h = w.hoods.get(a)
  if (!h) return
  h.visible = on
  const mat = wet > 0.5 ? w.mats.hoodWet : w.mats.hood
  h.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) m.material = mat
  })
  h.scale.y = 1 - 0.06 * wet
}

/** Belt travel: the stripe texture slides as the frames move. */
function belt(w: World, z: number) {
  w.line.beltTex.offset.y = -z / 2.4
}

export function runActE(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const L = w.line
  const c = w.cast
  const t = f.time
  const n2 = two(f)
  L.group.visible = true
  L.frames.forEach((fr) => (fr.group.visible = false))
  L.foam.count = 0
  L.spray.count = 0
  L.brushes.forEach((b, i) => (b.rotation.y = 0 * i))
  L.topBrush.rotation.x = 0
  L.manifest.visible = false
  L.gripper.position.y = 0
  for (const d of L.van.doors) d.rotation.y = 0
  const lh = liftedHood(w)
  lh.visible = false
  L.updateScreens(t, 0, 0)
  for (const a of [c.c333, c.c334]) {
    a.figure.headMeshes.forEach((m) => (m.visible = true))
    silhouette(a, false)
  }
  const a3 = w.use(c.c333)
  const a4 = w.use(c.c334)
  a4.visible = n2
  const [g1, g2] = c.guards.map((g) => w.use(g))
  switch (seg) {
    case 'van':
    case 'record':
    case 'hood': {
      lineLight(w, 'bay', t)
      const open = seg === 'van' ? ss(0.05, 0.2, u) : 1
      L.van.doors.forEach((d, i) => (d.rotation.y = (i === 0 ? 1 : -1) * open * 1.62))
      hoodOn(w, a3, true)
      hoodOn(w, a4, true)
      // 334 waits on the bench inside.
      a4.place(X - 0.72 + 0.24, 4.95, PI / 2).hold(SIT_BENCH)
      a4.y = 0.98 - 0.47
      if (seg === 'van' || (seg === 'record' && u < 0.08)) {
        a3.place(X - 0.72 + 0.24, 5.75, PI / 2).hold(SIT_BENCH)
        a3.y = 0.98 - 0.47
      } else if (seg === 'record' && u < 0.44) {
        // Pulled by the arm to the edge of the van.
        const k = ss(0.08, 0.44, u)
        a3.place(lerp(X - 0.48, X - 0.05, k), lerp(5.75, 3.88, k), lerp(PI / 2, PI, k)).blend(
          [
            [0.08, SIT_BENCH],
            [0.2, C.CUFFED],
          ],
          u,
        )
        a3.y = lerp(0.51, VAN_FLOOR, ss(0.08, 0.2, u))
        a3.walking = 0.5
        a3.step = Math.floor(u * 30)
      } else {
        a3.place(X - 0.05, 3.88, PI).hold(STAND_HOOD)
        a3.y = VAN_FLOOR
      }
      // The guards: one with the manifest, one who climbs in.
      g1.place(X + 1.55, 2.85, -PI / 2 - 0.5).hold(GUARD_HOLD)
      if (seg === 'record' && u > 0.08 && u < 0.44) {
        g2.place(X + 0.35, lerp(3.3, 4.4, ss(0.08, 0.2, u)), PI + 0.2).hold(GUARD_ARM)
        g2.y = ss(0.08, 0.18, u) * VAN_FLOOR
      } else if (seg === 'van' || (seg === 'record' && u <= 0.08)) g2.place(X - 1.6, 2.6, PI * 0.15).hold(P.STAND)
      else {
        g2.place(X + 0.45, 4.35, -PI / 2 - 0.6).hold(GUARD_ARM)
        g2.y = VAN_FLOOR
      }
      w.apply(t)
      if (seg === 'record' && u > 0.08 && u < 0.44) {
        jointPos(a3.figure, 'lUpper', v)
        g2.reach('r', 1, v.x, v.y - 0.12, v.z, 0.4)
        g2.apply(t, true)
      }
      w.chainsFor(a3, 0)
      if (n2) w.chainsFor(a4, 1)
      L.manifest.visible = true
      inHand(L.manifest, g1.figure, 'l', [0.0, 0.0, 0.08], [-1.1, 0, 0])
      motion.doors = seg === 'van' ? win(u, 0.04, 0.06, 0.16, 0.2) : 0
      motion.step = a3.step
      motion.walking = a3.walking
      if (seg === 'van') {
        shot.pos.set(222.2, 1.7, -0.9).lerp(v.set(221.8, 1.66, -0.5), u)
        shot.tgt.set(220.0, 1.35, 4.6)
        shot.fov = 44
      } else if (seg === 'record') {
        if (u < 0.48) {
          shot.pos.set(220.55, 1.7, 1.55).lerp(v.set(220.5, 1.68, 1.8), sub(u, 0, 0.48))
          shot.tgt.set(220.0, 1.45, 4.6)
          shot.fov = 40
        } else {
          // Insert: the hood's hem and the white band, 333.
          jointPos(a3.figure, 'neck', v)
          shot.pos.set(v.x + 0.32, v.y + 0.02, v.z - 0.42).lerp(v2.set(v.x + 0.26, v.y + 0.0, v.z - 0.36), sub(u, 0.48, 1))
          shot.tgt.set(v.x, v.y - 0.02, v.z)
          shot.fov = 24
        }
      } else {
        // From the rear quarter, between the open doors: the camera tilting up from the ankles; then the whole figure, small in the bay.
        const k = ss(0.05, 0.5, u)
        const back = ss(0.5, 1, u)
        shot.pos.set(lerp(220.85, 220.75, back), lerp(1.15, 1.45, k), lerp(1.75, 0.7, back))
        shot.tgt.set(X - 0.05, lerp(VAN_FLOOR + 0.25, VAN_FLOOR + 1.0, k), 3.85)
        shot.fov = lerp(36, 42, ss(0.45, 0.7, u))
      }
      break
    }
    case 'platform': {
      lineLight(w, 'bay', t)
      L.van.doors.forEach((d, i) => (d.rotation.y = (i === 0 ? 1 : -1) * 1.62))
      hoodOn(w, a3, true)
      hoodOn(w, a4, true)
      // Lifted down, walked to the conveyor, clamped; the belt starts at 0.5.
      const run = ss(0.5, 1.0, u) * 3.2
      const z0 = 2.4 - run
      if (u < 0.35) {
        const k = sub(u, 0.04, 0.35)
        const p = makePath([
          [X - 0.05, 3.88],
          [X - 0.05, 3.3],
          [X, 2.45],
        ])
        a3.walk(p, k, STAND_HOOD, PI, PI, 0.5)
        a3.y = (1 - ss(0.04, 0.12, u)) * VAN_FLOOR
        g1.place(a3.x + 0.42, a3.z + 0.12, PI - 0.3).hold(GUARD_ARM)
        g2.place(a3.x - 0.42, a3.z + 0.12, PI + 0.3).hold(GUARD_ARM)
      } else {
        inFrame(w, a3, 0, z0)
        a3.blend([[0.38, STAND_HOOD], [0.55, STAND_HOOD]], u)
        // The guards bend to the ankle clamps, then step back.
        const bend = win(u, 0.38, 0.42, 0.62, 0.7)
        g1.place(X + 0.62, lerp(2.45, 2.8, ss(0.6, 0.75, u)), -PI / 2).blend([[0, P.STAND], [1, CLAMP]], bend)
        g2.place(X - 0.62, lerp(2.45, 2.8, ss(0.6, 0.75, u)), PI / 2).blend([[0, P.STAND], [1, CLAMP]], bend)
      }
      if (n2) {
        // The second, brought down one place behind (u 0.48–0.95).
        const z1 = z0 + 2.4
        if (u < 0.48) {
          a4.place(X - 0.48, 5.75, PI / 2).hold(SIT_BENCH)
          a4.y = 0.98 - 0.47
        } else if (u < 0.78) {
          const p = makePath([
            [X - 0.05, 4.05],
            [X, z1 + 0.1],
          ])
          a4.walk(p, sub(u, 0.5, 0.78), STAND_HOOD, PI, PI, 0.5)
          a4.y = (1 - ss(0.5, 0.56, u)) * VAN_FLOOR
          g1.place(a4.x + 0.45, a4.z + 0.1, PI - 0.3).hold(GUARD_ARM)
        } else inFrame(w, a4, 1, z1)
        if (u >= 0.78) {
          const fr = L.frames[1]
          fr.group.visible = true
        }
      }
      belt(w, z0)
      w.apply(t)
      w.chainsFor(a3, 0)
      if (n2) w.chainsFor(a4, 1)
      motion.robots = u > 0.5 ? 1 : 0
      motion.step = a3.step
      motion.walking = a3.walking
      shot.pos.set(222.7, 1.75, 0.9).lerp(v.set(222.5, 1.7, 0.4), u)
      shot.tgt.set(220.0, 1.0, 2.6).lerp(v.set(220.0, 0.95, 1.2), ss(0.5, 1, u))
      shot.fov = 44
      break
    }
    case 'wash': {
      lineLight(w, 'wash', t)
      const z0 = u < 0.45 ? lerp(-0.8, -6.3, sub(u, 0, 0.45)) : lerp(-6.3, -12.4, sub(u, 0.45, 1))
      inFrame(w, a3, 0, z0)
      if (n2) inFrame(w, a4, 1, z0 + 2.4)
      const wet = ss(0.5, 0.66, u)
      hoodOn(w, a3, true, wet)
      hoodOn(w, a4, true, ss(0.5, 0.66, sub(u, 0.3, 1)))
      belt(w, z0)
      L.startLamp.redraw((cx, W, H) => S.startLamp(cx, W, H, u > 0.4), u > 0.4 ? 'on' : 'off')
      // Foam round him at the foam bar, spray at the water bars, brushes spinning.
      const foamK = win(u, 0.46, 0.5, 0.64, 0.7)
      const sprayK = win(u, 0.62, 0.65, 0.8, 0.84)
      const brushK = win(u, 0.78, 0.82, 0.96, 1)
      w.apply(t)
      jointPos(a3.figure, 'chest', v)
      placeFoam(w, v, foamK, t, wet)
      placeSpray(w, z0, sprayK, t)
      L.brushes.forEach((b, i) => (b.rotation.y = (i ? -1 : 1) * t * 9 * (0.3 + brushK)))
      L.topBrush.rotation.x = t * 9 * (0.3 + brushK)
      w.chainsFor(a3, 0)
      if (n2) w.chainsFor(a4, 1)
      motion.robots = 1
      motion.doors = foamK + sprayK
      shot.pos.set(220.28, 1.5, -13.6).lerp(v.set(220.25, 1.48, -13.3), u)
      shot.tgt.set(220.0, 1.25, -6.0).lerp(v.set(220.0, 1.2, -9.5), ss(0.3, 1, u))
      shot.fov = 44
      break
    }
    case 'reading': {
      const amp = u > 0.52 ? 0.45 + 0.55 * Math.abs(Math.sin(t * 3.1) * Math.sin(t * 1.7 + 0.6)) : 0
      lineLight(w, 'reading', t, u > 0.5 ? amp : 0)
      const z0 = u < 0.3 ? lerp(-12.4, -17.25, ss(0, 0.16, u)) : lerp(-17.25, -21.0, ss(0.36, 0.48, u))
      inFrame(w, a3, 0, z0, u > 0.52 && amp > 0.85 ? C.FLINCH : STAND_HOOD)
      if (n2) inFrame(w, a4, 1, z0 + 2.4)
      belt(w, z0)
      // The arm lifts the wet hood (u 0.3).
      const lift = ss(0.28, 0.38, u)
      hoodOn(w, a3, lift < 0.05, 1)
      hoodOn(w, a4, true, 1)
      L.gripper.position.y = -(7.2 - 2.05) * win(u, 0.22, 0.28, 0.32, 0.4) - (lift > 0.05 ? 0 : 0)
      lh.visible = lift >= 0.05
      if (lh.visible) L.gripper.position.y = lerp(-(7.2 - 2.05), -0.6, ss(0.3, 0.4, u))
      // The wall of screens lights up; the speakers boom.
      L.updateScreens(t, amp, 0.22 + 0.78 * ss(0.3, 0.45, u))
      L.speakers.forEach((s) => s.drivers.forEach((d) => (d.position.z = 0.5 + 0.02 * amp * Math.sin(t * 40))))
      w.apply(t)
      w.chainsFor(a3, 0)
      if (n2) w.chainsFor(a4, 1)
      motion.robots = win(u, 0.0, 0.03, 0.45, 0.48) + win(u, 0.22, 0.25, 0.38, 0.4)
      if (u < 0.6) {
        // From the room's far corner, back toward the passage: he comes in under the arm, the speakers either side.
        shot.pos.set(223.3, 2.7, -25.8).lerp(v.set(223.1, 2.6, -25.4), sub(u, 0, 0.6))
        shot.tgt.set(220.0, 1.9, -18.0).lerp(v.set(220.0, 1.6, -19.5), ss(0.3, 0.6, u))
        shot.fov = 50
      } else {
        // From the side and behind: the man small between the speakers, the wall of screens over him.
        shot.pos.set(216.3, 1.9, -17.3).lerp(v.set(216.5, 1.85, -17.6), sub(u, 0.6, 1))
        shot.tgt.set(220.6, 2.7, -24.5)
        shot.fov = 52
      }
      break
    }
    case 'inject': {
      lineLight(w, 'station', t)
      // At the station; the arms; then he sags, the clamps let go, the frame lays him flat.
      const tilt = ss(0.56, 0.72, u)
      const run = ss(0.72, 1.0, u) * 3.4
      const z0 = -32.0 - run
      const fr = L.frames[0]
      fr.group.visible = true
      fr.group.position.set(X, BELT_Y, z0)
      fr.tilt.rotation.x = (tilt * PI) / 2
      hoodOn(w, a3, false)
      const sag = ss(0.48, 0.58, u)
      if (tilt <= 0) {
        inFrame(w, a3, 0, z0, STAND_HOOD)
        a3.blend([[0, STAND_HOOD], [1, C.SAG]], sag)
      } else {
        // Laid back on the belt, face up, head toward where he came from.
        const phi = (tilt * PI) / 2
        a3.place(X, z0 + 0.9 * Math.sin(phi), PI).hold(makePose({ hipY: (FOOT_Y + 0.9 * Math.cos(phi) + 0.12 * Math.sin(phi)) / 0.98, hips: [-phi, 0, 0], neck: [0.1, 0, 0], head: [0.2, 0.3, 0], lUpper: [-0.2, 0.3, 0.1], rUpper: [-0.2, -0.3, -0.1], lFore: [-0.8, 0, 0], rFore: [-0.8, 0, 0] }))
        a3.y = 0
      }
      if (n2) {
        const f1 = L.frames[1]
        f1.group.visible = true
        inFrame(w, a4, 1, z0 + 2.4 + run * 0)
        hoodOn(w, a4, false)
      }
      belt(w, z0)
      w.apply(t)
      // The three arms: pill (u 0.05–0.2), lens (0.2–0.35), injector (0.35–0.48).
      jointPos(a3.figure, 'head', v)
      const mouth = v2.set(v.x, v.y - 0.06, v.z - 0.11)
      const pillK = win(u, 0.05, 0.1, 0.16, 0.21)
      const pillRest = new THREE.Vector3(X - 1.6, 1.55, -31.6)
      L.pillArm.position.copy(pillRest).lerp(mouth, pillK)
      L.pillArm.rotation.y = PI
      const lensK = win(u, 0.2, 0.26, 0.31, 0.36)
      const eyes = new THREE.Vector3(v.x, v.y + 0.03, v.z - 0.12)
      const park = new THREE.Vector3(X + 0.9, 1.9, -31.2)
      L.lens.pose(new THREE.Vector3(X + 0.9, 2.4, -31.2), new THREE.Vector3(lerp(X + 0.9, X + 0.5, lensK), lerp(2.0, 1.95, lensK), lerp(-31.2, v.z - 0.5, lensK)), park.clone().lerp(eyes, lensK), new THREE.Vector3(-0.5, 0, 0.5).lerp(new THREE.Vector3(0, -0.05, 1), lensK))
      const injK = win(u, 0.35, 0.4, 0.45, 0.5)
      jointPos(a3.figure, 'neck', v)
      const injRest = new THREE.Vector3(X + 1.7, 1.6, -32.4)
      const neck = new THREE.Vector3(v.x + 0.08, v.y, v.z + 0.02)
      L.injector.position.copy(injRest).lerp(neck, injK)
      L.injector.rotation.set(0, PI / 2, 0)
      w.chainsFor(a3, 0)
      if (n2) w.chainsFor(a4, 1)
      motion.robots = Math.max(pillK, lensK, injK, u > 0.72 ? 1 : 0)
      if (u < 0.55) {
        // From the front-right: the arms come to his face and neck.
        shot.pos.set(221.35, 1.62, -33.15).lerp(v.set(221.25, 1.6, -33.0), sub(u, 0, 0.55))
        shot.tgt.set(220.0, 1.5, -31.95)
        shot.fov = 38
      } else {
        shot.pos.set(222.0, 2.0, -30.2).lerp(v.set(221.9, 1.9, -30.6), sub(u, 0.55, 1))
        shot.tgt.set(220.0, 0.6, -33.5).lerp(v.set(220.0, 0.4, -35.5), ss(0.7, 1, u))
        shot.fov = 40
      }
      break
    }
  }
}

const m4 = new THREE.Matrix4()
const q = new THREE.Quaternion()
const sc = new THREE.Vector3()
const pp = new THREE.Vector3()

/** Thick white foam over him at the foam bar. */
function placeFoam(w: World, chest: THREE.Vector3, k: number, t: number, wet: number) {
  const L = w.line
  if (k <= 0.01 && wet <= 0.01) return
  const n = Math.round(220 * Math.max(k, wet * 0.35))
  L.foam.count = n
  for (let i = 0; i < n; i++) {
    const s = L.foamSeeds[i]
    const a = s[0] * PI * 2
    const h = s[1]
    const r = 0.16 + 0.06 * s[2]
    pp.set(chest.x + Math.cos(a) * r, 0.25 + h * 1.55 - (1 - k) * 0.4 * s[3], chest.z + Math.sin(a) * r * 0.8)
    // Falling flakes when the bar is on.
    if (k > 0.2 && s[3] > 0.6) pp.y = 2.6 - ((t * 0.8 + s[2]) % 1) * 2.3
    sc.setScalar(0.35 + s[3] * 0.6)
    q.identity()
    m4.compose(pp, q, sc)
    L.foam.setMatrixAt(i, m4)
  }
  L.foam.instanceMatrix.needsUpdate = true
}

/** Fans of spray from the water bars. */
function placeSpray(w: World, z: number, k: number, t: number) {
  const L = w.line
  if (k <= 0.01) return
  const n = Math.round(160 * k)
  L.spray.count = n
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1
    const y = 0.4 + ((i * 0.37) % 1) * 2.0
    const phase = (t * 3 + i * 0.13) % 1
    pp.set(X + side * (1.1 - phase * 0.8), y - phase * 0.3, -9.3 + (((i * 0.71) % 1) - 0.5) * 0.3)
    q.setFromAxisAngle(sc.set(0, 1, 0), side * (PI / 2 - 0.3))
    sc.set(1, 1, 0.6 + phase)
    m4.compose(pp, q, sc)
    L.spray.setMatrixAt(i, m4)
  }
  L.spray.instanceMatrix.needsUpdate = true
  void z
}
