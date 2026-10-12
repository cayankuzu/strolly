/**
 * Chapters 7 and 9: ODA 3 as it is. The orderlies, the corner, the drag, the
 * cleaners, ODA 3 · HAZIR; then the tray coming in through the hatch, and the
 * room from the floor — the seam splitting, three silhouettes, a man in
 * white-grey overalls looking round at the walls, then coming at us.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import type { SetFrame, Shot } from '../kit/SetScene'
import { type Actor } from '../kit/direct'
import { makePose } from '../figure/Figure'
import { makePath, pointAt, type Path, type Sample } from '../figure/paths'
import * as P from '../figure/poses'
import * as C from './cast'
import { env, motion, PI, ss, sub, two, win, type Seg } from './common'
import { clearPatches } from './reveal'
import { jointPos, speech, type World } from './world'

/** Lying on the left side along the tray, knees a little drawn up (the root turns him). */
export const LIE_SIDE = makePose({ hipY: 0.25, hips: [0, 0, -PI / 2], spine: [0.12, 0, 0], chest: [0.08, 0, 0], neck: [0.12, 0, 0], head: [0.2, 0, 0], lThigh: [-0.5, 0, 0.05], rThigh: [-0.38, 0, -0.04], lShin: [0.75, 0, 0], rShin: [0.6, 0, 0], lUpper: [-0.65, 0.35, 0.1], rUpper: [-0.55, -0.35, -0.1], lFore: [-0.95, 0.25, 0], rFore: [-0.95, -0.25, 0], lHand: [0.1, 0, 0.2], rHand: [0.1, 0, -0.2] })
/** Pulled by the ankles: arms trailing over the head. */
const DRAGGED = makePose({ hipY: 0.22, hips: [0, 0, -PI / 2], spine: [0.05, 0, 0], neck: [0.05, 0, 0], head: [0.1, 0, 0], lThigh: [-0.12, 0, 0.04], rThigh: [-0.1, 0, -0.04], lShin: [0.1, 0, 0], rShin: [0.12, 0, 0], lUpper: [-2.6, 0, 0.15], rUpper: [-2.5, 0, -0.15], lFore: [-0.3, 0, 0], rFore: [-0.3, 0, 0] })
const STOOP = makePose({ hipZ: -0.04, spine: [0.75, 0, 0], chest: [0.25, 0, 0], neck: [-0.2, 0, 0], head: [-0.15, 0, 0], lUpper: [-0.9, 0, 0.12], rUpper: [-0.9, 0, -0.12], lFore: [-0.2, 0, 0], rFore: [-0.2, 0, 0], lThigh: [-0.45, 0, 0.08], rThigh: [-0.45, 0, -0.08], lShin: [0.6, 0, 0], rShin: [0.6, 0, 0] })
const PUSH = makePose({ spine: [0.22, 0, 0], lUpper: [-0.8, 0, 0.1], rUpper: [-0.8, 0, -0.1], lFore: [-0.6, 0, 0], rFore: [-0.6, 0, 0] }, P.STAND)
const LOOK_UP = makePose({ neck: [-0.3, 0, 0], head: [-0.35, 0, 0] }, P.STAND)
const REACH_DOWN = makePose({ spine: [0.55, 0, 0], chest: [0.2, 0, 0], neck: [0.25, 0, 0], head: [0.3, 0, 0], lUpper: [-1.2, 0, 0.2], rUpper: [-1.2, 0, -0.2], lFore: [-0.4, 0, 0], rFore: [-0.4, 0, 0], lThigh: [-0.35, 0, 0.06], rThigh: [-0.25, 0, -0.06], lShin: [0.45, 0, 0], rShin: [0.35, 0, 0] })

/** Chapter 7 (the room cleaned): the bodies are dark shapes. */
const seg7 = (f: SetFrame) => {
  void f
  return chapter7
}
let chapter7 = false

/** The tray's resting place in the north-east corner, and where 333's hips lie on it. */
const TRAY = { x: 161.25, z: -1.9 }
const BODY = [
  { x: 161.3, z: -1.9 },
  { x: 161.3, z: -1.1 },
]
const DOOR = { x: 160, z: 2.5 }
/**
 * Which tray place body `i` (0 = 333, 1 = 334) takes. Alone, 333 lies along the wall. With 334, 333 lies on the
 * front half — nothing between his eyes and the door in ch. 9 — and 334 beside him against the wall.
 */
const slot = (i: number, n2: boolean) => BODY[n2 ? 1 - i : i]
/** With two, the blood lies in front of the wider tray (it would be under it). */
const BLOOD_DZ_TWO = 0.8

const v = new THREE.Vector3()
const v2 = new THREE.Vector3()
const sA: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }
const sB: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }

/** The room as it is: lit flat and clinical; the panel over the corner off in ch. 7. */
function realRoom(w: World, opts: { cornerDim: boolean; corridor?: number }) {
  const r = w.room
  r.group.visible = true
  r.hallu.visible = false
  r.real.visible = true
  r.corridor.visible = true
  for (const x of [r.tray, r.blood, r.smear, r.smear2, r.trolley, r.mop, r.scrubber]) x.visible = false
  if (r.wetSign) r.wetSign.visible = false
  r.trayWide.visible = false
  r.hatch.position.y = 0.25
  clearPatches(r.uShell)
  r.setDoor(0)
  r.setReady(false)
  r.ceilMat.color.setRGB(1.6, 1.62, 1.62)
  r.cornerShade.visible = opts.cornerDim
  r.ceilNEMat.color.setRGB(opts.cornerDim ? 0.32 : 1.6, opts.cornerDim ? 0.33 : 1.62, opts.cornerDim ? 0.34 : 1.62)
  r.bloodMats.forEach((m) => (m.opacity = 1))
  r.smearMat.opacity = 1
  const L = w.lights
  const dim = opts.cornerDim ? 0.6 : 1
  env(w, 'clinic', 0.95 * dim, 0xf2f5f5)
  L.setHemi(0xffffff, 0xe0e4e4, 0.85 * dim)
  L.setKey(0xf6faff, 16, [159.4, 2.95, 0.9], opts.cornerDim ? [159.6, 0, 0.6] : [160.2, 0, -0.2], opts.cornerDim ? 0.75 : 1.0, 7, 0.9)
  L.setPoint(0, 0xf4f8ff, 3.5, [158.75, 2.7, -1.25], 5)
  L.setPoint(1, 0xf4f8ff, 3.5, [158.75, 2.7, 1.25], 5)
  L.setPoint(2, 0xf4f8ff, 3.5, [161.25, 2.7, 1.25], 5)
  L.setPoint(3, 0xf4f8ff, opts.cornerDim ? 0.25 : 3.5, [161.25, 2.7, -1.25], 5)
  L.setPoint(4, 0xd8fff2, 4 * (opts.corridor ?? 0), [160, 2.8, 4.2], 6)
}

/** The tray (and the second tray width for two) at depth z. */
function tray(w: World, z: number, n2: boolean) {
  const r = w.room
  r.tray.visible = true
  r.tray.position.set(TRAY.x, 0, z)
  r.trayWide.visible = n2
}

/** 333 (and 334) lying on the tray at its depth z. */
function bodies(w: World, f: SetFrame, trayZ: number) {
  const c = w.cast
  const out: Actor[] = []
  const n2 = two(f)
  const list = n2 ? [c.c333, c.c334] : [c.c333]
  list.forEach((a, i) => {
    w.use(a)
    silhouette(a, seg7(f))
    a.figure.headMeshes.forEach((m) => (m.visible = true))
    const b = slot(i, n2)
    a.place(b.x, trayZ + (b.z - TRAY.z), 0).hold(LIE_SIDE)
    a.y = 0.09
    out.push(a)
  })
  return out
}

/** In ch. 7 the dead read as dark shapes: a matte near-black over every mesh of the figure (restored after). */
const originals = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>()
const dark = new THREE.MeshStandardMaterial({ color: 0x2a2423, roughness: 1 })
const darkSkinned = new THREE.MeshStandardMaterial({ color: 0x2a2423, roughness: 1 })
export function silhouette(a: Actor, on: boolean) {
  a.figure.root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    if (on) {
      if (!originals.has(m)) originals.set(m, m.material)
      m.material = (m as THREE.SkinnedMesh).isSkinnedMesh ? darkSkinned : dark
    } else if (originals.has(m)) m.material = originals.get(m)!
  })
}

/** The hood is off, the band on; no chains in the room. */
function bare(w: World, a: Actor) {
  const h = w.hoods.get(a)
  if (h) h.visible = false
}

/** The long streak from the corner toward the door, drawn to length `len` (m). */
function streak(m: THREE.Mesh, from: { x: number; z: number }, to: { x: number; z: number }, len: number, opacity: number) {
  const dx = to.x - from.x
  const dz = to.z - from.z
  const L = Math.hypot(dx, dz)
  const k = Math.min(1, len / L)
  m.visible = len > 0.02 && opacity > 0.01
  m.scale.set(Math.max(0.01, L * k), 1, 1)
  m.position.set(from.x + dx * k * 0.5, m.position.y, from.z + dz * k * 0.5)
  m.rotation.set(-PI / 2, 0, Math.atan2(-dz, dx))
  ;(m.material as THREE.MeshBasicMaterial).opacity = opacity
}

/** A body, head to feet, as the drag treats it (m). */
const BODY_LEN = 1.7

/** The line body `i` is pulled along: from its head on the tray, along the tray to its feet, then out the door. */
function dragPath(i: number, n2: boolean): Path {
  const b = slot(i, n2)
  return makePath([
    [b.x + 0.85, b.z],
    [b.x - 0.85, b.z],
    [160.4, 0.4],
    [DOOR.x, DOOR.z + 0.4],
    [DOOR.x, 5.6],
  ])
}

/** The tray's top under (x, z), easing to the floor just past its edge (bodies and feet slide off it). */
function trayTop(x: number, z: number, n2: boolean) {
  const out = Math.max(TRAY.x - 1.0 - x, x - TRAY.x - 1.0, TRAY.z - 0.45 - z, z - TRAY.z - 0.45 - (n2 ? 0.82 : 0))
  return 0.09 * (1 - ss(-0.06, 0.1, out))
}

const sC: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }
const sD: Sample = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }

/**
 * A body pulled `s` metres by the ankles: head and feet both ride the drag line BODY_LEN apart, so it first slides
 * along the tray, then swings round and follows its feet; the arms trail over the head.
 */
function dragBody(a: Actor, path: Path, s: number, n2: boolean) {
  const head = pointAt(path, s / path.total, sC)
  const feet = pointAt(path, (s + BODY_LEN) / path.total, sD)
  const dir = Math.atan2(feet.x - head.x, feet.z - head.z)
  const hx = (head.x + feet.x) / 2
  const hz = (head.z + feet.z) / 2
  a.place(hx, hz, dir + PI / 2).blend(
    [
      [0, LIE_SIDE],
      [1, DRAGGED],
    ],
    ss(0, 0.6, s),
  )
  a.y = trayTop(hx, hz, n2)
}

/** Body `i`'s smear, from where its feet lay toward the door, `len` metres long. */
function smearFor(r: World['room'], i: number, n2: boolean, len: number, opacity: number) {
  const b = slot(i, n2)
  streak(i === 0 ? r.smear : r.smear2, { x: b.x - 0.85, z: b.z }, { x: DOOR.x + (i === 0 ? 0 : 0.25), z: DOOR.z }, Math.max(0, len), opacity)
}

export function runActD(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  chapter7 = seg === 'staff' || seg === 'corner' || seg === 'drag' || seg === 'cleaners' || seg === 'restart'
  const c = w.cast
  const t = f.time
  const r = w.room
  const n2 = two(f)
  const post = w.post
  // With two the blood lies in front of the wider tray, and the scrubber works there.
  const bdz = n2 ? BLOOD_DZ_TWO : 0
  r.blood.position.z = bdz
  switch (seg) {
    // ——— 07 TEMİZLİK ———
    case 'staff':
    case 'corner': {
      realRoom(w, { cornerDim: true, corridor: seg === 'staff' ? 1 - ss(0.8, 1, u) : 0 })
      tray(w, TRAY.z, n2)
      bodies(w, f, TRAY.z).forEach((a) => bare(w, a))
      r.blood.visible = true
      const open = seg === 'staff' ? ss(0.06, 0.2, u) : 1
      r.setDoor(open)
      const [o1, o2] = c.orderlies.map((a) => w.use(a))
      if (seg === 'staff') {
        o1.walk(makePath([[159.75, 4.2], [159.7, 2.6], [159.55, 1.1]]), sub(u, 0.18, 0.8), P.STAND, PI, PI)
        o2.walk(makePath([[160.3, 4.8], [160.25, 2.6], [160.55, 0.85]]), sub(u, 0.24, 0.86), P.STAND, PI, PI)
      } else {
        o1.place(159.55, 1.1, PI - 0.25).hold(P.STAND)
        o2.place(160.55, 0.85, PI - 0.45).hold(P.STAND)
        o1.lookAt(TRAY.x, TRAY.z, 0.6)
        o2.lookAt(TRAY.x, TRAY.z, 0.6)
      }
      w.apply(t)
      motion.step = o1.step
      motion.walking = Math.max(o1.walking, o2.walking)
      motion.doors = seg === 'staff' ? win(u, 0.06, 0.08, 0.16, 0.2) : 0
      if (seg === 'staff') {
        // High in the west, on the door and the two coming in; the north-east corner stays out of frame.
        shot.pos.set(157.9, 2.55, -0.7).lerp(v.set(157.88, 2.58, -0.4), u)
        shot.tgt.set(160.2, 0.9, 2.45).lerp(v.set(160.1, 0.85, 1.6), ss(0.3, 0.95, u))
        shot.fov = 50
      } else {
        // The same eye drifts right, past the orderlies' backs, to the corner.
        shot.pos.set(157.88, 2.58, -0.4).lerp(v.set(157.9, 2.5, 0.0), ss(0, 0.6, u))
        shot.tgt.set(160.1, 0.85, 1.6).lerp(v.set(161.55, 0.32, -1.75), ss(0.1, 0.62, f.reduced ? 0.5 : u))
        shot.fov = 52
      }
      break
    }
    case 'drag': {
      realRoom(w, { cornerDim: true })
      r.setDoor(1)
      tray(w, TRAY.z, n2)
      r.blood.visible = true
      const list = bodies(w, f, TRAY.z)
      list.forEach((a) => bare(w, a))
      const [o1, o2] = c.orderlies.map((a) => w.use(a))
      // They walk in, take the ankles, pull; with two they come back for the second (the one by the wall), faster.
      const plan: Array<{ walk: [number, number]; pull: [number, number] }> = n2
        ? [
            { walk: [0.04, 0.32], pull: [0.36, 0.6] },
            { walk: [0.6, 0.665], pull: [0.68, 0.95] },
          ]
        : [{ walk: [0.04, 0.35], pull: [0.4, 0.95] }]
      const pull = (i: number) => (plan[i] ? sub(u, plan[i].pull[0], plan[i].pull[1]) : 0)
      const cur = plan.length > 1 && u >= plan[1].walk[0] ? 1 : 0
      const d = plan[cur]
      const k = pull(cur)
      const paths = list.map((_, i) => dragPath(i, n2))
      // The orderlies' places at the ankles when the pull starts, and the yaw that faces back along the line.
      const grip = (i: number, s: number, out: Sample) => pointAt(paths[i], Math.min(1, (s + BODY_LEN + 0.55) / paths[i].total), out)
      const g0 = grip(cur, 0, sA)
      const px = Math.cos(g0.yaw)
      const pz = -Math.sin(g0.yaw)
      const s1 = { x: g0.x - px * 0.22, z: g0.z - pz * 0.22, yaw: g0.yaw + PI - 0.3 }
      const s2 = { x: g0.x + px * 0.22, z: g0.z + pz * 0.22, yaw: g0.yaw + PI + 0.3 }
      if (u < d.walk[1]) {
        const s = sub(u, d.walk[0], d.walk[1])
        if (cur === 0) {
          o1.walk(makePath([[159.55, 1.1], [159.95, s1.z + 0.7], [s1.x, s1.z]]), s, P.STAND, PI - 0.25, s1.yaw)
          o2.walk(makePath([[160.55, 0.85], [160.75, s2.z + 0.7], [s2.x, s2.z]]), s, P.STAND, PI - 0.45, s2.yaw)
        } else {
          // Back in from the corridor, where the first pull left them.
          o1.walk(makePath([[DOOR.x - 0.22, 5.6], [159.85, 2.6], [160.0, 0.2], [s1.x, s1.z]]), s, P.STAND, PI, s1.yaw)
          o2.walk(makePath([[DOOR.x + 0.22, 5.6], [160.2, 2.6], [160.6, 0.2], [s2.x, s2.z]]), s, P.STAND, PI, s2.yaw)
        }
      } else if (k <= 0) {
        // At the ankles, bending down.
        const bend = ss(d.walk[1], d.pull[0], u)
        o1.place(s1.x, s1.z, s1.yaw).blend([[0, P.STAND], [1, STOOP]], bend)
        o2.place(s2.x, s2.z, s2.yaw).blend([[0, P.STAND], [1, STOOP]], bend)
      } else if (k < 1) {
        // Walking backward toward the door, bent, hands at the ankles.
        const s = k * (paths[cur].total - BODY_LEN)
        const g = grip(cur, s, sB)
        const qx = Math.cos(g.yaw)
        const qz = -Math.sin(g.yaw)
        o1.place(g.x - qx * 0.22, g.z - qz * 0.22, g.yaw + PI - 0.3).hold(STOOP)
        o2.place(g.x + qx * 0.22, g.z + qz * 0.22, g.yaw + PI + 0.3).hold(STOOP)
        o1.walking = o2.walking = 0.6
        o1.step = o2.step = Math.floor(s / 0.55)
      } else {
        o1.visible = false
        o2.visible = false
      }
      // Standing on the tray where it is under their feet.
      o1.y = trayTop(o1.x, o1.z, n2)
      o2.y = trayTop(o2.x, o2.z, n2)
      // The bodies: pulled by the ankles, they slide along the tray, swing round and follow their feet out the door.
      list.forEach((a, i) => {
        const pk = pull(i)
        if (pk <= 0) return
        if (pk >= 1) {
          a.visible = false
          return
        }
        dragBody(a, paths[i], pk * (paths[i].total - BODY_LEN), n2)
      })
      w.apply(t)
      // Hands on the ankles (while bending down, and through the pull).
      const reachW = k > 0 && k < 1 ? 1 : u >= d.walk[1] && k <= 0 ? ss(d.walk[1], d.pull[0], u) : 0
      if (reachW > 0 && o1.visible) {
        const a = list[cur]
        jointPos(a.figure, 'lFoot', v)
        jointPos(a.figure, 'rFoot', v2)
        o1.reach('r', reachW, v.x, v.y + 0.05, v.z, 0.4)
        o1.reach('l', reachW, v.x, v.y + 0.05, v.z, 0.4)
        o2.reach('r', reachW, v2.x, v2.y + 0.05, v2.z, 0.4)
        o2.reach('l', reachW, v2.x, v2.y + 0.05, v2.z, 0.4)
        o1.apply(t, true)
        o2.apply(t, true)
      }
      // The smear drawn behind each body as its hips come off the tray.
      list.forEach((_, i) => {
        const pk = pull(i)
        const s = pk * (paths[i].total - BODY_LEN)
        smearFor(r, i, n2, pk <= 0 ? 0 : s - 0.55, 1)
      })
      if (!n2) r.smear2.visible = false
      motion.step = o1.step
      motion.walking = Math.max(o1.walking, o2.walking)
      motion.robots = k > 0 && k < 1 ? 1 : 0
      shot.pos.set(158.7, 0.32, 2.2).lerp(v.set(158.75, 0.3, 2.1), u)
      shot.tgt.set(161.5, 0.22, -1.5).lerp(v.set(159.6, 0.0, -0.2), ss(0.42, 0.9, u))
      shot.fov = 40
      break
    }
    case 'cleaners': {
      realRoom(w, { cornerDim: true })
      r.setDoor(1)
      r.blood.visible = true
      const clean = ss(0.42, 0.95, u)
      r.bloodMats.forEach((m, i) => (m.opacity = 1 - ss(0.42 + i * 0.1, 0.62 + i * 0.1, u)))
      smearFor(r, 0, n2, 4.6, 1 - clean)
      if (n2) smearFor(r, 1, n2, 4.6, 1 - clean)
      else r.smear2.visible = false
      // The trolley pushed in and parked by the door.
      const tk = ss(0.06, 0.3, u)
      r.trolley.visible = true
      r.trolley.position.set(lerp(159.6, 159.0, tk), 0, lerp(4.6, 1.9, tk))
      r.trolley.rotation.y = lerp(PI / 2, 0.2, tk)
      if (r.wetSign) {
        r.wetSign.visible = u > 0.3
        r.wetSign.position.set(159.0, 0, 0.9)
        r.wetSign.rotation.y = 0.6
      }
      const [k1, k2] = c.cleaners.map((a) => w.use(a))
      // The first parks the trolley, takes the mop and walks to the corner (0.3–0.42), then mops back toward the door.
      const mopping = ss(0.42, 0.48, u)
      const sx = Math.sin(t * 2.4) * 0.35 * mopping
      if (u < 0.3) k1.walk(makePath([[159.6, 5.4], [159.3, 2.6]]), tk, PUSH, PI, PI)
      else if (u < 0.42) k1.walk(makePath([[159.3, 2.6], [159.75, 2.0], [160.2, 0.9], [160.7, -0.2]]), sub(u, 0.3, 0.42), C.MOP, PI, PI - 0.6)
      else k1.place(160.7 + sx * 0.4, lerp(-0.2, 0.9, sub(u, 0.42, 0.95)), PI - 0.6).hold(C.MOP)
      // The second pushes the floor scrubber in to the corner and works along the blood.
      const scrubZ = lerp(-1.1, -0.6, sub(u, 0.4, 0.95)) + bdz
      if (u < 0.36) k2.walk(makePath([[160.4, 5.8], [160.3, 3.0], [161.0, 0.9], [161.5, -1.1 + bdz]]), sub(u, 0.08, 0.36), PUSH, PI, PI + 0.4)
      else k2.place(161.5, scrubZ, PI + 0.4).hold(PUSH)
      w.apply(t)
      // The scrubber in front of the second, both hands on its handle.
      const fx = Math.sin(k2.yaw)
      const fz = Math.cos(k2.yaw)
      r.scrubber.visible = u > 0.08
      r.scrubber.position.set(k2.x + fx * 0.55, 0, k2.z + fz * 0.55)
      r.scrubber.rotation.y = k2.yaw - 0.4
      const hx = k2.x + fx * 0.2
      const hz = k2.z + fz * 0.2
      k2.reach('r', 1, hx - fz * 0.15, 1.0, hz + fx * 0.15, 0.4)
      k2.reach('l', 1, hx + fz * 0.15, 1.0, hz - fx * 0.15, 0.4)
      k2.apply(t, true)
      // The mop in the first cleaner's hands once the trolley is parked.
      if (u >= 0.3) {
        jointPos(k1.figure, 'chest', v)
        r.mop.visible = true
        r.mop.position.set(v.x - 0.35 + sx, 0, v.z - 0.65)
        r.mop.rotation.set(0.35, 0.4, 0)
        k1.reach('r', 1, r.mop.position.x + 0.2, 0.95, r.mop.position.z + 0.32, 0.4)
        k1.reach('l', 1, r.mop.position.x + 0.32, 1.25, r.mop.position.z + 0.45, 0.4)
        k1.apply(t, true)
      } else {
        k1.reach('r', 1, r.trolley.position.x - 0.1, 0.9, r.trolley.position.z + 0.3, 0.4)
        k1.reach('l', 1, r.trolley.position.x + 0.15, 0.9, r.trolley.position.z + 0.3, 0.4)
        k1.apply(t, true)
      }
      motion.step = k1.step
      motion.walking = Math.max(k1.walking, k2.walking)
      motion.robots = u > 0.35 ? 1 : 0
      shot.pos.set(158.4, 1.7, 2.0).lerp(v.set(158.5, 1.62, 1.75), u)
      shot.tgt.set(160.6, 0.45, -0.6).lerp(v.set(161.0, 0.25, -1.1), u)
      shot.fov = 44
      break
    }
    case 'restart': {
      realRoom(w, { cornerDim: false, corridor: u > 0.42 ? 1 : 0 })
      r.setDoor(1 - ss(0.32, 0.42, u))
      r.setReady(u > 0.5)
      const [k1, k2] = c.cleaners.map((a) => w.use(a))
      if (u < 0.36) {
        k1.walk(makePath([[159.3, 1.6], [159.7, 2.9], [159.8, 5.5]]), sub(u, 0.08, 0.32), PUSH, 0, 0)
        k2.walk(makePath([[160.8, 0.2], [160.2, 2.6], [160.3, 6.0]]), sub(u, 0.1, 0.35), P.STAND, 0, 0)
        r.trolley.visible = true
        r.trolley.position.set(lerp(159.0, 159.7, sub(u, 0.08, 0.32)), 0, lerp(1.9, 4.6, sub(u, 0.08, 0.32)))
        r.trolley.rotation.y = 0.2
      } else {
        k1.visible = k2.visible = false
      }
      w.apply(t)
      motion.step = k1.step
      motion.walking = Math.max(k1.walking, k2.walking)
      motion.doors = win(u, 0.32, 0.34, 0.4, 0.42)
      if (u < 0.45) {
        shot.pos.set(158.1, 2.5, 2.0).lerp(v.set(158.4, 2.3, 1.8), sub(u, 0, 0.45))
        shot.tgt.set(160.2, 0.8, 0.0).lerp(v.set(160.4, 0.6, -0.6), sub(u, 0, 0.45))
        shot.fov = 52
      } else {
        shot.pos.set(160.0, 1.8, 6.5).lerp(v.set(160.0, 2.0, 5.2), sub(u, 0.45, 1))
        shot.tgt.set(160.08, 2.38, 2.56)
        shot.fov = 34
      }
      break
    }
    // ——— 09 KAPI ———
    case 'floor':
    case 'doorOpens':
    case 'enters':
    case 'comes':
      fromTheFloor(w, f, shot, seg, u)
      break
    case 'black': {
      shot.fade = 0
      shot.pos.set(160, 1.6, 4)
      shot.tgt.set(160, 1.6, 0)
      break
    }
  }
  void post
}

/** Chapter 9: the tray, then 333's eyes on the floor. */
function fromTheFloor(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const c = w.cast
  const t = f.time
  const r = w.room
  const n2 = two(f)
  const post = w.post
  realRoom(w, { cornerDim: false, corridor: 1 })
  const trayIn = seg === 'floor' ? ss(0.1, 0.45, u) : 1
  const trayZ = lerp(-4.15, TRAY.z, trayIn)
  r.hatch.position.y = 0.25 + 0.52 * (seg === 'floor' ? win(u, 0.04, 0.1, 0.46, 0.52) : 0)
  tray(w, trayZ, n2)
  const list = bodies(w, f, trayZ)
  list.forEach((a) => bare(w, a))
  // With two, the wide holds a little longer, pushing in on the two lying side by side ("334'ün yanında").
  const pov = seg !== 'floor' || u >= (n2 ? 0.62 : 0.47)
  // The door: the seam splits (doorOpens 0.12), shut again (enters 0.6).
  let open = 0
  if (seg === 'doorOpens') open = ss(0.12, 0.3, u)
  else if (seg === 'enters') open = 1 - ss(0.55, 0.68, u)
  r.setDoor(open)
  const arif = w.use(c.arifO)
  const g2 = w.use(c.g2)
  const tech = w.use(c.tech)
  arif.visible = g2.visible = tech.visible = seg !== 'floor'
  // The three in the doorway, staggered in depth so all of them show through the door from the corner.
  if (seg === 'doorOpens') {
    arif.place(159.75, 3.2, PI).hold(P.STAND)
    g2.place(160.3, 2.95, PI).hold(C.ESCORT)
    tech.place(159.2, 3.6, PI).hold(P.STAND)
  } else if (seg === 'enters') {
    if (u < 0.3) arif.walk(makePath([[159.75, 3.2], [160.0, 1.6]]), sub(u, 0, 0.3), P.STAND, PI, PI)
    else arif.place(160.0, 1.6, PI).blend([[0.6, P.STAND], [0.72, LOOK_UP], [0.82, P.STAND]], u)
    // He looks round the white walls, as if watching something spread across them.
    const look = u > 0.6 ? Math.sin(sub(u, 0.6, 1) * PI * 2) * 0.9 : 0
    arif.look = look
    g2.place(160.3, lerp(2.95, 3.5, ss(0.2, 0.45, u)), PI).hold(C.ESCORT)
    tech.place(159.2, lerp(3.6, 3.9, ss(0.2, 0.45, u)), PI).hold(P.STAND)
    g2.visible = tech.visible = u < 0.66
  } else if (seg === 'comes') {
    g2.visible = tech.visible = false
    // Toward the corner — toward us — with short, hard steps; hands reaching down.
    // He stops at the tray's front edge, over 333 (with two, 333 lies on the front half).
    const me0 = slot(0, n2)
    const start = { x: 160.0, z: 1.6 }
    const end = { x: 161.05, z: me0.z + 0.95 }
    if (u < 0.2) arif.place(start.x, start.z, PI).hold(P.STAND).lookAt(161.85, me0.z + 0.05, ss(0, 0.15, u))
    else if (u < 0.86) arif.walk(makePath([[start.x, start.z], [end.x, end.z]]), sub(u, 0.2, 0.86), P.STAND, PI, PI - 0.5, 0.75)
    else arif.place(end.x, end.z, PI - 0.5).blend([[0.86, P.STAND], [1.0, REACH_DOWN]], u)
  }
  w.apply(t)
  w.mouth(arif, seg === 'comes' && u > 0.2 ? speech(t, 0.9) : 0)
  motion.step = arif.step
  motion.walking = arif.walking
  motion.doors = seg === 'doorOpens' ? win(u, 0.12, 0.14, 0.26, 0.3) : seg === 'enters' ? win(u, 0.55, 0.57, 0.64, 0.68) : seg === 'floor' ? win(u, 0.04, 0.06, 0.48, 0.52) : 0
  if (!pov) {
    // The ch. 4 wide from the door, panning to the corner.
    shot.pos.set(160.0, 1.7, 2.25).lerp(v.set(160.3, 1.42, 1.15), n2 ? ss(0.42, 0.62, u) : 0)
    shot.tgt.set(160.0, 1.15, -1.0).lerp(v.set(161.2, 0.35, -1.9), ss(0.08, 0.42, u))
    shot.fov = 50
    return
  }
  // 333's eyes: on the floor at his head, across the floor at the door.
  const me = list[0]
  jointPos(me.figure, 'head', v)
  me.visible = false
  me.figure.root.visible = false
  const breathe = Math.sin(t * 1.3) * 0.012
  const toward = v2.set(160.0, 1.0, 2.5).sub(v).normalize()
  shot.pos.copy(v).addScaledVector(toward, 0.16)
  shot.pos.y += 0.02 + breathe
  let tx = 160.0
  let ty = 1.0
  let tz = 2.5
  if (seg === 'comes') {
    // He fills the frame.
    jointPos(arif.figure, 'chest', v2)
    const k = ss(0.2, 0.8, u)
    tx = lerp(160.0, v2.x, k)
    ty = lerp(1.0, v2.y - 0.1, k)
    tz = lerp(2.5, v2.z, k)
  } else if (seg === 'enters' && u > 0.3) {
    jointPos(arif.figure, 'chest', v2)
    const k = ss(0.3, 0.6, u)
    tx = lerp(160.0, v2.x, k)
    ty = lerp(1.0, v2.y, k)
    tz = lerp(2.5, v2.z, k)
  }
  shot.tgt.set(tx, ty + breathe * 2, tz)
  shot.fov = 55
  post.blur = 0.55 + 0.1 * Math.sin(t * 0.7)
  post.white = 0.32
  post.vignette = 0.7
  if (seg === 'comes') post.blur = lerp(0.55, 0.75, ss(0.6, 1, u))
  // The warm flicker across his face as, in his eyes, the boss appears.
  if (seg === 'comes') w.lights.setPoint(4, 0xffc070, 3 * win(u, 0.02, 0.06, 0.14, 0.2) * (0.6 + 0.4 * Math.sin(t * 40)), [160.2, 1.7, 1.2], 2)
}
