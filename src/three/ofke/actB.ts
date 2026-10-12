/**
 * Chapter 3 (HİZMET) and the locker-room part of chapter 6 (HİZMETİN
 * BEDELİ): set D, ÖFKE NÖBETİ. The arrival at 18.32, the welcome, the helmet,
 * the anger map, the copies, the lens, the pill, the clothes; later the
 * explainer on the locker-room screen, the mirror, his own clothes again, the
 * car pulling away into the night.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import type { SetFrame, Shot } from '../kit/SetScene'
import { held, keyed, type Actor, type ShotKeys } from '../kit/direct'
import { makePose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import * as C from './cast'
import { env, motion, picked, PI, ss, sub, two, win, type Seg } from './common'
import { inHand, jointPos, speech, type World } from './world'
import * as S from './screens'

// ——— Poses ———

/** Seated in the reclining prep chair, hands on the arm rests. */
const PREP_SIT = makePose({ hipY: 0.63, spine: [-0.26, 0, 0], chest: [-0.04, 0, 0], neck: [0.16, 0, 0], head: [0.12, 0, 0], lThigh: [-1.32, 0, 0.08], rThigh: [-1.32, 0, -0.08], lShin: [0.95, 0, 0], rShin: [0.95, 0, 0], lUpper: [-0.32, 0, 0.32], rUpper: [-0.32, 0, -0.32], lFore: [-0.75, 0, 0], rFore: [-0.75, 0, 0] })
/** Sitting on the bench, towel round the neck, both hands at the towel's ends. */
const BENCH_SIT = makePose({ hipY: 0.5, spine: [0.1, 0, 0], neck: [0.06, 0, 0], head: [0.08, 0, 0], lThigh: [-1.45, 0, 0.12], rThigh: [-1.45, 0, -0.12], lShin: [1.35, 0, 0], rShin: [1.35, 0, 0], lUpper: [-0.3, 0, 0.18], rUpper: [-0.3, 0, -0.18], lFore: [-1.2, 0.2, 0], rFore: [-1.2, -0.2, 0] })
const BENCH_ELBOWS = makePose({ spine: [0.48, 0, 0], chest: [0.22, 0, 0], neck: [0.1, 0, 0], head: [0.22, 0, 0], lUpper: [-0.65, 0, 0.22], rUpper: [-0.65, 0, -0.22], lFore: [-1.55, 0.35, 0], rFore: [-1.55, -0.35, 0] }, BENCH_SIT)
const WAVE = makePose({ rUpper: [-0.3, 0, -1.2], rFore: [-1.6, 0, 0], rHand: [0, 0, 0.2] }, C.HOST)
const LOOK_HAND = makePose({ neck: [0.25, 0, 0], head: [0.3, 0, 0], rUpper: [-0.55, 0, -0.1], rFore: [-1.7, -0.3, 0], rHand: [0.3, 0, 0] }, BENCH_SIT)
const NECK_ROLL = makePose({ neck: [0.1, 0, 0.32], head: [0.15, 0, 0.2] }, P.STAND)

// ——— Places ———

/** The prep chair; Arif's head when seated (approximately; the helmet follows the real joint). */
const CHAIR = { x: 138, z: -15.0 }
const CURB = { x: 143.5, z: 5.0 }

const KEYS: Partial<Record<Seg, ShotKeys>> = {
  arrive: [
    [0, [139.6, 2.0, 16.0, 141.2, 2.3, 0, 42]],
    [1, [140.0, 1.9, 13.6, 140.6, 2.15, 0, 42]],
  ],
  welcome: [
    [0, [140.95, 1.7, -1.05, 140.05, 1.45, -4.4, 36]],
    [1, [140.9, 1.68, -1.3, 140.05, 1.45, -4.4, 34]],
  ],
  helmet: [
    [0, [136.3, 1.55, -13.6, 138.0, 1.3, -15.2, 40]],
    [1, [136.6, 1.48, -13.85, 138.0, 1.32, -15.3, 38]],
  ],
  map: [
    [0, [138.45, 1.5, -14.45, 138.0, 1.25, -16.1, 34]],
    [0.4, [138.42, 1.48, -14.55, 138.0, 1.25, -16.1, 34]],
    [0.5, [138.3, 1.38, -15.2, 138.0, 1.25, -16.1, 30]],
    [1, [138.3, 1.38, -15.25, 138.0, 1.25, -16.1, 30]],
  ],
  copies: [
    [0, [136.7, 1.5, -13.9, 138.25, 1.32, -15.6, 40]],
    [1, [136.85, 1.48, -14.1, 138.25, 1.3, -15.65, 38]],
  ],
  pill: [
    [0, [138.98, 1.42, -15.62, 137.85, 1.25, -15.0, 36]],
    [1, [138.9, 1.4, -15.68, 137.85, 1.25, -15.0, 34]],
  ],
  how: [
    [0, [135.72, 1.42, -14.3, 136.05, 1.76, -18.95, 23]],
    [1, [135.76, 1.45, -14.6, 136.05, 1.78, -18.95, 22]],
  ],
  reveal: [
    [0, [135.76, 1.46, -14.65, 136.05, 1.78, -18.95, 24]],
    [1, [135.92, 1.62, -16.3, 136.02, 1.8, -18.95, 30]],
  ],
  again: [
    [0, [136.95, 1.58, -14.15, 135.55, 1.52, -17.6, 40]],
    [1, [136.85, 1.56, -14.3, 135.5, 1.5, -17.65, 40]],
  ],
  // Over his left shoulder, a step back: his head right of centre, his face in the mirror beside it.
  hallu: [
    [0, [135.1, 1.78, -14.72, 134.8, 1.56, -16.7, 31]],
    [1, [135.09, 1.77, -14.8, 134.8, 1.56, -16.7, 30]],
  ],
  nolimit: [
    [0, [136.05, 1.65, -16.4, 136.0, 1.78, -18.95, 36]],
    [1, [136.02, 1.75, -17.0, 136.0, 1.8, -18.95, 36]],
  ],
  executed: [
    [0, [141.0, 2.0, -12.3, 135.6, 1.1, -15.9, 46]],
    [1, [140.6, 1.9, -12.6, 135.5, 1.15, -16.0, 44]],
  ],
}

const v = new THREE.Vector3()
const v2 = new THREE.Vector3()

type Light = 'exterior' | 'reception' | 'prep' | 'night'

function serviceLight(w: World, mode: Light) {
  const L = w.lights
  const sv = w.service
  sv.signMat.color.setScalar(mode === 'exterior' || mode === 'night' ? 1.25 : 1.0)
  if (mode === 'exterior') {
    env(w, 'dusk', 0.5, 0x2a2c44, [40, 180])
    L.setHemi(0x8f84b8, 0x4a3c30, 0.42)
    L.setSun(0xff9a60, 1.4, [100, 16, 30], [140, 0, 0], 22)
    L.setPoint(0, 0xffd6a0, 6, [140, 2.95, 1.2], 7)
    L.setPoint(1, 0x8fe8d6, 5, [139.4, 4.3, 1.4], 7)
    L.setPoint(2, 0xffc890, 14, [136, 4.6, 3.6], 14)
    L.setPoint(3, 0xffc890, 14, [152, 4.6, 3.6], 14)
    L.setPoint(4, 0xfff0e0, 3, [140, 2.2, -4], 9)
  } else if (mode === 'night') {
    env(w, 'outside', 0.3, 0x080b16, [30, 160])
    L.setHemi(0x40507a, 0x1a1a20, 0.3)
    L.setSun(0x8090c0, 0.25, [150, 30, 30], [140, 0, 0], 22)
    L.setPoint(0, 0xffd6a0, 7, [140, 2.95, 1.2], 7)
    L.setPoint(1, 0x8fe8d6, 6, [139.4, 4.3, 1.4], 8)
    L.setPoint(2, 0xffc890, 16, [136, 4.6, 3.6], 14)
    L.setPoint(3, 0xffc890, 16, [152, 4.6, 3.6], 14)
    L.setPoint(4, 0xfff0e0, 4, [140, 2.2, -4], 9)
  } else if (mode === 'reception') {
    env(w, 'clinic', 0.95, 0xeef3f1)
    L.setHemi(0xffffff, 0xd8dcd8, 0.75)
    L.setKey(0xfff6ea, 16, [140, 3.4, -1.5], [140, 0.8, -4.5], 0.9, 9)
    L.setPoint(0, 0xfff6ee, 4, [136.5, 3.3, -3.5], 8)
    L.setPoint(1, 0xfff6ee, 4, [143.5, 3.3, -3.5], 8)
    L.setPoint(2, 0xfff6ee, 4, [140, 3.3, -7.5], 8)
    L.setPoint(3, 0xbff0e4, 2, [140, 1.2, -9.5], 6)
  } else {
    env(w, 'clinic', 0.85, 0xeef3f1)
    L.setHemi(0xffffff, 0xd2d8d6, 0.6)
    L.setKey(0xf4f8ff, 14, [137.2, 2.95, -13.6], [138, 0.9, -15.3], 0.85, 8)
    L.setPoint(0, 0xf2f8ff, 4, [136.2, 2.8, -13.2], 7)
    L.setPoint(1, 0xf2f8ff, 4, [139.8, 2.8, -13.2], 7)
    L.setPoint(2, 0xf2f8ff, 4, [136.2, 2.8, -16.8], 7)
    L.setPoint(3, 0xf2f8ff, 4, [139.8, 2.8, -16.8], 7)
  }
}

/** The helmet band colour: a soft blue, brightening and pulsing top → bottom. */
function bands(w: World, level: number, pulse: number, t: number) {
  const n = w.service.helmetBands.length
  w.service.helmetBands.forEach((m, i) => {
    const wave = pulse > 0 ? 0.5 + 0.5 * Math.sin(t * 6 - (n - 1 - i) * 1.4) : 0
    const k = 0.35 + level * 0.65 + pulse * wave * 0.9
    m.color.setRGB(0.25 * k, 0.45 * k, 1.0 * k + 0.2)
  })
}

/** Arif in the prep chair. */
function seated(w: World, a: Actor) {
  a.place(CHAIR.x, CHAIR.z, PI).hold(PREP_SIT)
  a.reach('l', 1, CHAIR.x + 0.33, 0.71, CHAIR.z + 0.02, 0.6)
  a.reach('r', 1, CHAIR.x - 0.33, 0.71, CHAIR.z + 0.02, 0.6)
  return a
}

/** A towel draped round the neck: an arc behind the neck, two ends down the chest (built once per figure). */
const neckTowels = new WeakMap<Actor, THREE.Group>()
function neckTowel(w: World, a: Actor) {
  let g = neckTowels.get(a)
  if (!g) {
    g = new THREE.Group()
    g.userData.neckTowel = true
    const mat = (w.towel.material as THREE.Material).clone()
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.032, 8, 24, PI * 1.25), mat)
    arc.rotation.set(PI / 2, 0, -PI * 0.125 + PI)
    arc.scale.set(1, 1.15, 0.8)
    arc.position.set(0, 0.0, -0.01)
    g.add(arc)
    for (const sx of [-1, 1]) {
      const end = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.025), mat)
      end.position.set(sx * 0.075, -0.15, 0.09)
      end.rotation.set(-0.12, 0, sx * 0.08)
      g.add(end)
    }
    g.traverse((o) => ((o as THREE.Mesh).castShadow = true))
    a.figure.joints.neck.add(g)
    g.position.set(0, 0.0, 0.0)
    neckTowels.set(a, g)
  }
  return g
}

/** Glasses on his face or not. */
function glassesOn(a: Actor, on: boolean) {
  a.figure.glasses.visible = on
}

/** The sliding doors of the entrance: 0 shut … 1 open. */
function slide(w: World, open: number) {
  w.service.doors.l.position.x = 139.4 - open * 1.15
  w.service.doors.r.position.x = 140.6 + open * 1.15
}

/** Locker 17's door: 0 shut … 1 open (≈110°). */
function locker(w: World, open: number) {
  w.service.locker17.rotation.y = open * 1.92
}

/** What lies on locker 17's shelf at this moment. */
function shelf(w: World, overalls: boolean, shirt: boolean, glasses: boolean) {
  w.service.shelfOveralls.visible = overalls
  w.service.shelfShirt.visible = shirt
  w.service.shelfGlasses.visible = glasses
}

/** The car at the curb (x along the street, nose toward −x). */
function carAt(w: World, x: number, door: number) {
  w.carHolder.visible = true
  w.carHolder.position.set(x, 0, CURB.z)
  w.carHolder.rotation.y = PI / 2
  w.car.door.rotation.y = -1.05 * door
  w.car.card.visible = true
  w.car.shell.visible = true
  w.car.inner.visible = false
}

/** The driver's seat in the car at the curb, in world terms. */
const driver = (x: number) => ({ x: x + 0.22, z: CURB.z + 0.4 })

/** Ground height on the sidewalk in front of the building. */
const ground = (z: number) => (z > 0.02 && z < 3.5 ? 0.14 : 0)

export function runActB(w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) {
  const sv = w.service
  const c = w.cast
  const t = f.time
  sv.group.visible = true
  sv.exterior.visible = seg === 'arrive' || seg === 'welcome' || (seg === 'away' && u > 0.56)
  sv.reception.visible = seg === 'arrive' || seg === 'welcome' || (seg === 'away' && u > 0.56)
  sv.prep.visible = !(seg === 'arrive' || (seg === 'away' && u > 0.7))
  slide(w, 0)
  locker(w, 0)
  shelf(w, true, false, false)
  sv.setHelmet(0, v.set(CHAIR.x, 1.4, CHAIR.z))
  bands(w, 0, 0, t)
  sv.mapScreen.redraw((cx, W, H) => S.prepScreen(cx, W, H, { kind: 'idle' }), 'idle')
  sv.lens.pose(v.set(138.95, 3.0, -15.95), v2.set(138.95, 1.95, -15.95), new THREE.Vector3(139.2, 1.62, -15.65), new THREE.Vector3(-0.35, 0, 1))
  sv.cupPill.visible = true
  sv.cupWater.visible = true
  sv.mapArm.visible = true
  sv.towel.visible = false
  neckTowel(w, c.arifO).visible = false
  sv.logoScreen.redraw((cx, W, H) => S.logoLoop(cx, W, H, (t * 0.25) % 1), `logo:${Math.floor(t * 4) % 8}`)
  sv.info.redraw((cx, W, H) => S.explainer(cx, W, H, 0, 0, two(f)), `ex:0:${two(f)}`)
  for (const g of [c.g1, c.g2]) w.use(g)
  c.g1.place(139.6, -7.2, 0).hold(C.HOST)
  c.g2.place(140.9, -12.4, 0).hold(C.HOST)
  c.g2.visible = false
  c.g1.visible = sv.reception.visible

  switch (seg) {
    case 'arrive': {
      serviceLight(w, 'exterior')
      const x = lerp(166, CURB.x, ss(0, 0.32, u))
      carAt(w, x, win(u, 0.33, 0.4, 0.5, 0.56))
      w.car.lights.color.setRGB(1.6, 1.5, 1.3)
      w.car.tail.color.setRGB(1.2 - ss(0.3, 0.4, u) * 0.6, 0.08, 0.06)
      slide(w, win(u, 0.58, 0.72, 0.92, 1.2))
      const a = w.use(c.arifJ)
      const d = driver(x)
      if (u < 0.36) {
        a.place(d.x, d.z, -PI / 2).hold(C.DRIVE)
        a.reach('l', 1, d.x - 0.54, 0.97, d.z - 0.17, 0.5)
        a.reach('r', 1, d.x - 0.54, 0.97, d.z + 0.17, 0.5)
      } else if (u < 0.45) {
        const k = sub(u, 0.36, 0.45)
        a.place(lerp(d.x, d.x - 0.05, k), lerp(d.z, d.z + 0.75, k), lerp(-PI / 2, 0.2, k)).blend(
          [
            [0.36, C.DRIVE],
            [0.45, P.STAND],
          ],
          u,
        )
      } else {
        const path = makePath([
          [d.x - 0.05, d.z + 0.75],
          [141.4, 6.35],
          [140.7, 5.2],
          [140.3, 2.6],
          [140.05, 0.4],
          [140.0, -1.6],
        ])
        a.walk(path, sub(u, 0.45, 0.95), P.STAND, -PI / 2, PI)
        a.y = ground(a.z)
        if (u > 0.94) a.visible = false
      }
      w.apply(t)
      motion.step = a.step
      motion.walking = a.walking
      motion.doors = win(u, 0.58, 0.62, 0.7, 0.74)
      keyed(KEYS.arrive!, held(u, f.reduced), shot)
      break
    }
    case 'welcome': {
      serviceLight(w, 'reception')
      const a = w.use(c.arifJ)
      const az = lerp(-1.2, -2.6, ss(0, 0.18, u))
      if (u < 0.18) a.walk(makePath([[140.1, -0.6], [140.2, -2.6]]), sub(u, 0, 0.18), P.STAND, PI, PI)
      else a.place(140.2, az, PI).hold(P.STAND)
      a.lookAt(140.35, -4.25, 0.5)
      const g1 = c.g1
      const g2 = w.use(c.g2)
      const step = ss(0, 0.2, u)
      g1.place(lerp(140.1, 140.35, step), lerp(-4.95, -4.25, step), -0.1).blend(
        [
          [0.02, C.HOST],
          [0.08, C.BOW],
          [0.2, C.HOST],
        ],
        u,
      )
      g2.place(lerp(141.45, 141.25, step), lerp(-5.1, -4.5, step), -0.35).blend(
        [
          [0.0, C.HOST],
          [0.7, C.HOST],
          [0.75, C.BOW],
          [0.82, C.HOST],
        ],
        u,
      )
      w.apply(t)
      w.mouth(g1, (win(u, 0.03, 0.06, 0.38, 0.42) + win(u, 0.46, 0.5, 0.96, 1)) * speech(t, 0.7))
      w.mouth(a, 0)
      motion.step = a.step
      motion.walking = a.walking
      keyed(KEYS.welcome!, held(u, f.reduced), shot)
      break
    }
    case 'helmet': {
      serviceLight(w, 'prep')
      const a = w.use(c.arifS)
      // Seated by Görevli 2 (u 0–0.2), then the helmet comes down to the neck.
      if (u < 0.2) {
        a.place(CHAIR.x, lerp(CHAIR.z + 0.35, CHAIR.z, ss(0, 0.16, u)), PI).blend(
          [
            [0.0, P.STAND],
            [0.18, PREP_SIT],
          ],
          u,
        )
      } else seated(w, a)
      const g2 = w.use(c.g2)
      g2.place(138.75, -14.45, -2.4).hold(C.ESCORT)
      if (u < 0.22) g2.reach('r', win(u, 0.0, 0.05, 0.16, 0.22), 138.18, 1.25, -14.88, 0.5)
      w.apply(t)
      jointPos(a.figure, 'head', v)
      const down = ss(0.25, 0.55, u)
      sv.setHelmet(down, v)
      bands(w, ss(0.3, 0.55, u), ss(0.55, 0.65, u), t)
      const prog = sub(u, 0.3, 0.98)
      if (u > 0.28) sv.mapScreen.redraw((cx, W, H) => S.prepScreen(cx, W, H, { kind: 'scan', t: Math.floor(t * 6) / 6, thumb: 1, p: prog }), `scan:${Math.floor(t * 6)}:${Math.round(prog * 50)}`)
      // The blue band lights the room a little.
      w.lights.setPoint(4, 0x5a86ff, 2.5 * down, [v.x, v.y + 0.1, v.z - 0.2], 2.5)
      motion.robots = win(u, 0.24, 0.28, 0.52, 0.56)
      keyed(KEYS.helmet!, held(u, f.reduced), shot)
      break
    }
    case 'map': {
      serviceLight(w, 'prep')
      const a = seated(w, w.use(c.arifS))
      // One nod as the chosen still enlarges.
      if (u > 0.62) a.blend([[0.66, PREP_SIT], [0.7, makePose({ head: [0.35, 0, 0] }, PREP_SIT)], [0.76, PREP_SIT]], u)
      w.apply(t)
      jointPos(a.figure, 'head', v)
      sv.setHelmet(1 - ss(0.08, 0.25, u), v)
      bands(w, 1 - ss(0.04, 0.2, u), 0, t)
      const pick = picked(f)
      // The splash, then the day drawn hour by hour under a "YÜKLEME TAMAMLANDI" header while the
      // `peaks` line arrives (0.06); the header becomes the map's own title as `map-label` comes in (0.22).
      const uploaded = u < 0.22
      const state: S.MapState =
        u < 0.13
          ? { kind: 'uploaded' }
          : { kind: 'map', draw: sub(u, 0.13, 0.46), push: sub(u, 0.4, 0.5), split: sub(u, 0.5, 0.6), picked: pick ? sub(u, 0.62, 0.8) : 0, pick, uploaded }
      const key = u < 0.13 ? 'up' : `m:${Math.round(sub(u, 0.13, 0.46) * 40)}:${Math.round(sub(u, 0.4, 0.5) * 10)}:${Math.round(sub(u, 0.5, 0.6) * 12)}:${Math.round(sub(u, 0.62, 0.8) * 12)}:${pick}:${uploaded}`
      sv.mapScreen.redraw((cx, W, H) => S.prepScreen(cx, W, H, state), key)
      w.lights.setPoint(4, 0xcff4ec, 1.5, [138, 1.3, -15.6], 2.5)
      motion.robots = win(u, 0.08, 0.1, 0.22, 0.25)
      keyed(KEYS.map!, held(u, f.reduced), shot)
      break
    }
    case 'copies': {
      serviceLight(w, 'prep')
      seated(w, w.use(c.arifS))
      const g2 = w.use(c.g2)
      g2.place(138.85, -15.75, -1.2).hold(C.TABLET)
      w.apply(t)
      inHand(w.tablet, g2.figure, 'l', [0.0, -0.02, 0.06], [-1.25, 0, 0])
      const n2 = two(f)
      const fill = sub(u, 0.6, 0.8)
      const state: S.MapState = { kind: 'copies', fill: u > 0.58 ? fill : 0, two: n2 ? sub(u, 0.6, 0.72) : 0 }
      sv.mapScreen.redraw((cx, W, H) => S.prepScreen(cx, W, H, state), `c:${Math.round(state.fill * 12)}:${Math.round(state.two * 12)}`)
      w.mouth(g2, win(u, 0.04, 0.08, 0.44, 0.48) * speech(t, 0.7))
      w.lights.setPoint(4, 0xcff4ec, 1.5, [138, 1.3, -15.6], 2.5)
      keyed(KEYS.copies!, held(u, f.reduced), shot)
      break
    }
    case 'lens': {
      serviceLight(w, 'prep')
      const a = seated(w, w.use(c.arifS))
      // He takes his glasses off himself and keeps them, folded, in his left hand.
      const off = ss(0.04, 0.16, u)
      a.reach('r', win(u, 0.03, 0.07, 0.13, 0.18), CHAIR.x - 0.04, 1.36, CHAIR.z - 0.18, 0.4)
      a.reach('l', win(u, 0.03, 0.07, 0.13, 0.18), CHAIR.x + 0.04, 1.36, CHAIR.z - 0.18, 0.4)
      const g2 = w.use(c.g2)
      g2.place(138.75, -15.95, -0.55).hold(C.HOST)
      w.apply(t)
      glassesOn(a, off < 0.5)
      if (off >= 0.5) inHand(w.heldGlasses, a.figure, 'l', [0, -0.01, 0.02], [0, 0, PI / 2])
      // The arm swings in from the front and the twin cups touch his eyes.
      jointPos(a.figure, 'head', v)
      const inK = win(u, 0.18, 0.36, 0.46, 0.58)
      const eyes = new THREE.Vector3(v.x, v.y + 0.11, v.z - 0.2)
      const park = new THREE.Vector3(139.2, 1.62, -15.65)
      const at = park.clone().lerp(eyes, inK)
      const toward = new THREE.Vector3(-0.35, 0, 1).lerp(new THREE.Vector3(0, -0.15, 1), inK)
      sv.lens.pose(v2.set(138.95, 3.0, -15.95), new THREE.Vector3(lerp(138.95, 138.3, inK), lerp(1.95, 1.9, inK), lerp(-15.95, -15.75, inK)), at, toward)
      w.mouth(g2, 0)
      motion.robots = win(u, 0.18, 0.22, 0.52, 0.58)
      if (u < 0.5) {
        shot.pos.set(139.25, 1.48, -15.35).lerp(v2.set(139.1, 1.46, -15.45), sub(u, 0, 0.5))
        shot.tgt.set(138.0, 1.38, -15.05)
        shot.fov = 32
      } else {
        // His eyes: Görevli 2's smiling face, soft, then sharp, a mint shimmer at the edges.
        a.visible = false
        a.figure.root.visible = false
        jointPos(g2.figure, 'head', v2)
        shot.pos.set(v.x, v.y + 0.02, v.z - 0.06)
        shot.tgt.copy(v2).add(v.set(0, -0.05, 0))
        shot.fov = 34
        const k = sub(u, 0.5, 1)
        w.post.blur = (1 - ss(0.25, 0.6, k)) * 0.85
        w.post.tintAmount = 0.35 * win(k, 0.3, 0.55, 0.8, 1)
        w.post.vignette = 0.25
        w.post.white = 0.08 * (1 - k)
        a.visible = false
      }
      break
    }
    case 'pill': {
      serviceLight(w, 'prep')
      sv.lens.pose(v.set(138.95, 3.0, -15.95), v2.set(138.95, 1.95, -15.95), new THREE.Vector3(139.2, 1.62, -15.65), new THREE.Vector3(-0.35, 0, 1))
      const a = seated(w, w.use(c.arifS))
      glassesOn(a, false)
      const g1 = w.use(c.g1)
      g1.place(137.42, -15.62, 0.85).hold(C.HOST)
      // She hands him the cup with the pill, then the water; he swallows.
      const give = win(u, 0.04, 0.16, 0.3, 0.38)
      const give2 = win(u, 0.4, 0.5, 0.62, 0.7)
      g1.reach('r', Math.max(give, give2), 137.86, 1.12, -15.38, 0.5)
      w.apply(t)
      jointPos(a.figure, 'head', v)
      const mouth = new THREE.Vector3(v.x, v.y - 0.06, v.z - 0.1)
      const drink1 = win(u, 0.2, 0.28, 0.36, 0.42)
      const drink2 = win(u, 0.55, 0.62, 0.78, 0.86)
      a.reach('r', Math.max(drink1, drink2), mouth.x - 0.02, mouth.y, mouth.z - 0.02, 0.4)
      a.reach('r', win(u, 0.12, 0.2, 0.4, 0.44) * (1 - drink1) + win(u, 0.5, 0.56, 0.86, 0.92) * (1 - drink2), 138.2, 1.05, -15.35, 0.4)
      a.apply(t, true)
      if (u < 0.17) inHand(w.cupPill, g1.figure, 'r', [0, -0.03, 0.03])
      else if (u < 0.44) inHand(w.cupPill, a.figure, 'r', [0, -0.03, 0.03], [drink1 * 1.4, 0, 0])
      if (u > 0.4 && u < 0.52) inHand(w.cupWater, g1.figure, 'r', [0, -0.03, 0.03])
      else if (u >= 0.52 && u < 0.92) inHand(w.cupWater, a.figure, 'r', [0, -0.03, 0.03], [drink2 * 1.6, 0, 0])
      sv.cupPill.visible = u < 0.04
      sv.cupWater.visible = u < 0.4
      // The throat: the head tips back as he swallows.
      if (drink1 > 0.5 || drink2 > 0.5) a.figure.joints.head.rotation.x -= 0.25
      inHand(w.heldGlasses, a.figure, 'l', [0, -0.01, 0.02], [0, 0, PI / 2])
      keyed(KEYS.pill!, held(u, f.reduced), shot)
      break
    }
    case 'clothes': {
      serviceLight(w, 'prep')
      locker(w, ss(0.03, 0.12, u))
      const dressed = u >= 0.3
      shelf(w, !dressed, dressed, u > 0.8)
      const a = w.use(dressed ? c.arifO : c.arifS)
      glassesOn(a, false)
      const ax = 135.0
      const az = -16.0
      const fx = Math.sin(-1.95)
      const fz = Math.cos(-1.95)
      const front = (d: number, y: number): [number, number, number] => [ax + fx * d, y, az + fz * d]
      a.place(ax, az, -1.95).hold(P.STAND)
      if (!dressed) {
        // Tie, buttons.
        const tieK = win(u, 0.08, 0.12, 0.2, 0.24)
        a.reach('l', tieK, ...front(0.14, 1.42), 0.5)
        a.reach('r', tieK, ...front(0.14, 1.4), 0.5)
        const btn = win(u, 0.2, 0.23, 0.28, 0.3)
        a.reach('r', btn, ...front(0.14, 1.3 - 0.12 * sub(u, 0.22, 0.3)), 0.5)
        for (const m of w.ties.get(c.arifS) ?? []) m.visible = u < 0.2
      } else {
        // The zip, then the glasses: the hesitation, then laid on the shirt (the insert from u 0.6 sees the hand come in).
        a.reach('r', win(u, 0.3, 0.33, 0.42, 0.46), ...front(0.15, 1.02 + 0.38 * sub(u, 0.32, 0.44)), 0.5)
        const look = win(u, 0.52, 0.56, 0.63, 0.67)
        a.reach('l', look, ...front(0.32, 1.32), 0.45)
        a.reach('l', win(u, 0.67, 0.73, 0.84, 0.9), 134.38, 1.6, -16.44, 0.5)
        if (look > 0.5) a.lookAt(...([front(0.32, 0)[0], front(0.32, 0)[2]] as [number, number]), 0.3)
      }
      const g1 = w.use(c.g1)
      g1.place(136.0, -16.75, -1.0).blend(
        [
          [0.0, C.HOST],
          [0.03, makePose({ rUpper: [-1.1, 0, -0.3], rFore: [-0.4, 0, 0] }, C.HOST)],
          [0.12, C.HOST],
          [0.55, C.HOST],
          [0.6, makePose({ neck: [0.15, 0, 0], head: [0.2, 0, 0] }, C.HOST)],
          [0.66, C.HOST],
        ],
        u,
      )
      w.apply(t)
      if (u < 0.8) inHand(w.heldGlasses, a.figure, 'l', [0, -0.01, 0.02], [0, 0, PI / 2])
      w.mouth(g1, win(u, 0.52, 0.56, 0.96, 1) * speech(t, 0.7))
      motion.doors = win(u, 0.03, 0.05, 0.1, 0.12)
      if (u < 0.6) {
        shot.pos.set(135.98, 1.52, -14.85).lerp(v.set(135.9, 1.5, -15.0), sub(u, 0, 0.6))
        shot.tgt.set(134.6, 1.32, -16.35)
        shot.fov = 42
      } else {
        // Insert into the open locker: the shelf, the folded shirt, his hand laying the glasses on it.
        shot.pos.set(134.94, 1.84, -16.5).lerp(v.set(134.9, 1.82, -16.52), sub(u, 0.6, 1))
        shot.tgt.set(134.3, 1.52, -16.5)
        shot.fov = 34
      }
      break
    }
    // ——— Chapter 6: the brochure ———
    case 'how':
    case 'reveal':
    case 'again':
    case 'hallu':
    case 'nolimit':
    case 'executed': {
      serviceLight(w, 'prep')
      sv.mapArm.visible = false
      explainerScreen(w, f, seg, u)
      locker(w, seg === 'again' ? ss(0.48, 0.56, u) : seg === 'hallu' || seg === 'nolimit' ? 1 : 0)
      shelf(w, false, true, true)
      const a = w.use(c.arifO)
      const towel = w.towel
      if (seg === 'how' || seg === 'reveal' || seg === 'executed' || (seg === 'again' && u < 0.2)) {
        // On the bench, facing the room's middle; the screen behind his left shoulder.
        const benchPose = seg === 'executed' ? BENCH_ELBOWS : seg === 'reveal' && u > 0.52 ? LOOK_HAND : BENCH_SIT
        a.place(135.48, -15.15, PI / 2 + 0.55).hold(benchPose)
        if (seg === 'executed') a.blend([[0, BENCH_SIT], [0.25, BENCH_ELBOWS]], u)
        if (seg === 'again') a.blend([[0, BENCH_SIT], [0.2, P.STAND]], u)
        if (seg === 'how') {
          // Drying his face with the towel's end.
          const dry = win(u, 0.25, 0.35, 0.7, 0.8)
          a.reach('r', dry, 135.78, 1.28 + 0.03 * Math.sin(t * 5), -15.05, 0.4)
        }
        if (seg === 'reveal' && u < 0.48) {
          const sip = win(u, 0.1, 0.18, 0.3, 0.38)
          a.reach('r', sip, 135.76, 1.22, -15.0, 0.4)
        }
        if (seg === 'reveal' && u > 0.52) a.figure.joints.rHand.rotation.x += 0.4 * Math.sin(t * 2.2) * 0.5
      } else if (seg === 'again') {
        // He stands, rolls his neck, opens locker 17.
        const k = ss(0.2, 0.46, u)
        a.place(lerp(135.6, 135.05, k), lerp(-15.3, -16.15, k), lerp(PI / 2, -PI / 2 + 0.25, ss(0.2, 0.36, u))).blend(
          [
            [0.2, P.STAND],
            [0.3, NECK_ROLL],
            [0.4, P.STAND],
          ],
          u,
        )
        if (u > 0.2 && u < 0.46) {
          a.walking = 0.7
          a.step = Math.floor(u * 40)
        }
        a.reach('l', win(u, 0.44, 0.48, 0.54, 0.58), 134.62, 1.0, -16.3, 0.5)
      } else {
        // At the mirror (on the inside of locker 17's open door).
        a.place(135.02, -16.02, -2.76).hold(P.STAND)
      }
      w.apply(t)
      if (seg === 'reveal' && u < 0.48) inHand(w.cupWater, a.figure, 'r', [0, -0.03, 0.03], [win(u, 0.1, 0.18, 0.3, 0.38) * 1.5, 0, 0])
      // The towel round his neck.
      neckTowel(w, a).visible = seg !== 'hallu' && seg !== 'nolimit'
      towel.visible = false
      keyed(KEYS[seg]!, held(u, f.reduced), shot)
      break
    }
    case 'away': {
      awayScene(w, f, shot, u)
      break
    }
  }
}

/** The explainer on the locker-room screen, step by step with the words. */
function explainerScreen(w: World, f: SetFrame, seg: Seg, u: number) {
  let step = 0
  let ph = 0
  const n2 = two(f)
  if (seg === 'how') {
    step = u < 0.1 ? 0 : 1
    ph = sub(u, 0.1, 0.9)
  } else if (seg === 'reveal') {
    step = u < 0.5 ? 2 : 3
    ph = u < 0.5 ? sub(u, 0.02, 0.45) : sub(u, 0.52, 0.85)
  } else if (seg === 'again') {
    step = u < 0.46 ? 4 : 5
    ph = u < 0.46 ? sub(u, 0.04, 0.4) : sub(u, 0.48, 1)
  } else if (seg === 'hallu') {
    step = 6
    ph = sub(u, 0.04, 0.9)
  } else if (seg === 'nolimit') {
    step = u < 0.54 ? 7 : 8
    ph = u < 0.54 ? sub(u, 0.03, 0.45) : sub(u, 0.56, 0.95)
  } else if (seg === 'executed') {
    step = u < 0.82 ? 9 : 0
    ph = sub(u, 0.05, 0.6)
  }
  const q = Math.round(ph * 24) / 24
  w.service.info.redraw((cx, W, H) => S.explainer(cx, W, H, step, q, n2), `ex:${step}:${q}:${n2}`)
  // The screen's glow on the room.
  w.lights.setPoint(4, 0xd8fff4, 2.2, [136, 1.8, -18.4], 4)
}

/** `away`: the mirror, his own clothes and glasses, reception, the night, the car. */
function awayScene(w: World, f: SetFrame, shot: Shot, u: number) {
  const sv = w.service
  const c = w.cast
  const t = f.time
  explainerScreen(w, f, 'executed', 0.9)
  if (u < 0.58) {
    serviceLight(w, 'prep')
    sv.mapArm.visible = false
    locker(w, 1)
    const own = u >= 0.17
    const jacket = u >= 0.46
    shelf(w, false, !own, !own || u < 0.28)
    const a = w.use(jacket ? c.arifJ : own ? c.arifS : c.arifO)
    a.place(135.02, -16.02, -2.76).hold(P.STAND)
    // Fingers through the hair; later the tie knot; the last look.
    const fx = Math.sin(-2.76)
    const fz = Math.cos(-2.76)
    a.reach('r', win(u, 0.03, 0.05, 0.09, 0.11), 135.02 + fx * 0.04, 1.8, -16.02 + fz * 0.04, 0.4)
    a.reach('l', win(u, 0.24, 0.27, 0.29, 0.31), 134.36, 1.58, -16.42, 0.5)
    const tieK = win(u, 0.31, 0.35, 0.42, 0.45)
    a.reach('l', tieK, 135.02 + fx * 0.14 + 0.02, 1.43, -16.02 + fz * 0.14, 0.5)
    a.reach('r', tieK, 135.02 + fx * 0.14 - 0.02, 1.43, -16.02 + fz * 0.14, 0.5)
    if (own && !jacket) for (const m of w.ties.get(c.arifS) ?? []) m.visible = u > 0.33
    w.apply(t)
    glassesOn(a, u >= 0.29)
    if (u >= 0.27 && u < 0.29) inHand(w.heldGlasses, a.figure, 'l', [0, -0.01, 0.02], [0, 0, PI / 2])
    motion.doors = win(u, 0.1, 0.12, 0.2, 0.22)
    keyed(KEYS.hallu!, held(sub(u, 0, 0.58), f.reduced), shot)
    return
  }
  const a = w.use(c.arifJ)
  if (u < 0.7) {
    // Through reception; Görevli 1 waves from the counter.
    serviceLight(w, 'reception')
    const path = makePath([
      [140.0, -10.8],
      [140.1, -8.6],
      [141.9, -6.2],
      [141.3, -2.4],
      [140.2, -0.3],
    ])
    a.walk(path, sub(u, 0.58, 0.72), P.STAND, PI * 0, PI * 0)
    const g1 = c.g1
    g1.visible = true
    g1.place(139.4, -6.0, 0.6).blend(
      [
        [0.6, C.HOST],
        [0.63, WAVE],
        [0.68, WAVE],
      ],
      u,
    )
    g1.figure.joints.rHand.rotation.z += 0.3 * Math.sin(t * 9)
    w.apply(t)
    w.mouth(g1, win(u, 0.62, 0.64, 0.68, 0.7) * speech(t, 0.6))
    motion.step = a.step
    motion.walking = a.walking
    shot.pos.set(138.2, 1.55, -1.6).lerp(v.set(138.4, 1.5, -1.8), sub(u, 0.58, 0.7))
    shot.tgt.set(140.6, 1.25, -6.0).lerp(v.set(140.9, 1.2, -4.2), sub(u, 0.58, 0.7))
    shot.fov = 42
    return
  }
  // Out into the night; the car; taillights.
  serviceLight(w, 'night')
  slide(w, win(u, 0.68, 0.71, 0.74, 0.78))
  const x = CURB.x - 60 * Math.pow(ss(0.86, 1.0, u), 2)
  carAt(w, x, win(u, 0.75, 0.77, 0.8, 0.82))
  w.car.lights.color.setRGB(1.6, 1.5, 1.3).multiplyScalar(ss(0.8, 0.84, u))
  w.car.tail.color.setRGB(0.3 + 1.0 * ss(0.8, 0.84, u), 0.05, 0.04)
  const d = driver(x)
  if (u < 0.79) {
    const path = makePath([
      [140.05, -0.5],
      [140.2, 1.6],
      [140.6, 4.3],
      [141.4, 6.35],
      [d.x - 0.05, d.z + 0.75],
    ])
    a.walk(path, sub(u, 0.7, 0.79), P.STAND, 0, PI / 2)
    a.y = ground(a.z)
  } else if (u < 0.82) {
    const k = sub(u, 0.79, 0.82)
    a.place(lerp(d.x - 0.05, d.x, k), lerp(d.z + 0.75, d.z, k), lerp(0.2, -PI / 2, k)).blend(
      [
        [0.79, P.STAND],
        [0.82, C.DRIVE],
      ],
      u,
    )
  } else {
    a.place(d.x, d.z, -PI / 2).hold(C.DRIVE)
    a.reach('l', 1, d.x - 0.54, 0.97, d.z - 0.17, 0.5)
    a.reach('r', 1, d.x - 0.54, 0.97, d.z + 0.17, 0.5)
  }
  w.apply(t)
  motion.step = a.step
  motion.walking = a.walking
  motion.doors = win(u, 0.7, 0.72, 0.8, 0.82)
  shot.pos.set(140.0, 2.0, 16).lerp(v.set(141.0, 1.6, 13.2), sub(u, 0.7, 1))
  shot.tgt.set(141.5, 1.6, 0.5).lerp(v.set(132.0, 1.0, 5.0), ss(0.85, 1.0, u))
  shot.fov = 42
}
