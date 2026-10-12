/**
 * Levy's days: chapter 3 (PAZARTESİ), 4 (SALI), 5 (ÇARŞAMBA) and the cantina
 * of chapter 11 — the house, the street, Bayan Elen's garden, the bus stop,
 * the bus, the archive office and the cantina.
 */
import * as THREE from 'three'
import { TEXT } from '@/stories/beyinkoku/text'
import { makePose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import type { SetFrame } from '../kit/SetScene'
import type { Act, Director } from './BeyinKokuScene'
import { TABLES } from './archive'
import { BED_SIT, COLLAR, CURLED, LAUGH, RIDE, SIT_FORK_UP, SIT_SPOON, SIT_STROKE, SLEEP, SOFA_WATCH, TEMPLES, TIE, TRACE, WATER } from './cast'
import { smallRoomPeople } from './actsRoom'
import { drawArchive, drawCalendar, drawDigitalClock, drawNotice, drawPSA, drawTvOverlay, drawWeather } from './screens'
import { BED_EDGE, bump, C, extra, FACE_E, FACE_N, FACE_S, FACE_W, L, light, PI, S, SIT_BUS, SIT_PHONE, SIT_TABLE, SIT_UNFOCUSED, tick } from './staging'
import { FLOOR } from './suburb'

const LINES = (id: string) => TEXT.find((t) => t.id === id)?.lines ?? []
const NOTICE = LINES('notice')
const CALENDAR = LINES('calendar-entry')
const PSA = LINES('psa')[0] ?? ''
const CRAWL = LINES('tv-crawl')[0] ?? ''
const GLITCH = LINES('glitch-box')[0] ?? ''

/** A coffee cup at the chest, in the LEFT hand (the right one waves). */
const CUP_L = makePose({ lUpper: [-0.25, 0, 0.18], lFore: [-1.7, 0, -0.15], lHand: [0.3, 0, 0], head: [0.04, 0, 0] }, P.STAND)
const WAVE_CUP = makePose({ rUpper: [-0.3, 0, -1.9], rFore: [-0.15, 0, -0.7], rHand: [0.1, 0.4, 0], head: [0, 0, 0], spine: [-0.02, 0, 0] }, CUP_L)
const WAVE_STALL_CUP = makePose({ rUpper: [-0.4, 0, -1.6], rFore: [-0.6, 0, -0.3], head: [0.06, 0, 0] }, WAVE_CUP)
const SIT_TALK = makePose({ head: [0, 0, 0] }, SIT_SPOON)

const CUP_HOLD = new THREE.Euler(0.2, 0, 0)
const CAN_HOLD = new THREE.Euler(0.35, PI / 2, 0)
const REMOTE_HOLD = new THREE.Euler(-1.2, 0, 0)
const PHONE_HOLD = new THREE.Euler(-1.0, 0.2, 0)
const SPOON_HOLD = new THREE.Euler(0.3, 0, 0)

const BED = new THREE.Vector3(103.6, 0.87, -4.85)
const EDGE = new THREE.Vector3(103.07, FLOOR + 0.07, -3.7)
const WALK_TO_DOOR = makePath([
  [102.85, -3.7],
  [101.9, -4.6],
  [101.0, -5.3],
  [100.4, -5.0],
  [100.0, -3.6],
  [100.0, -2.6],
  [100.0, 3.3],
])
const SIDEWALK = makePath([
  [103.5, 9.75],
  [138.6, 9.75],
])
const BOARD = makePath([
  [138.6, 9.75],
  [137.7, 11.6],
])
const DOG_PATH = makePath([
  [128, 17.3],
  [82, 17.3],
])
const OUT_LEFT = makePath([
  [101.8, 10.6],
  [95.8, 10.6],
])
const STAND_UP = makePath([
  [98.3, 0.08],
  [98.3, 0.55],
])
const TO_FRONT = makePath([
  [99.0, 3.2],
  [99.7, 3.45],
])

/** The cantina's twelve diners: [x, z, yaw], ordered from the far table toward Levy's. */
const DINERS: Array<[number, number, number]> = []
for (let k = 0; k < 6; k++) {
  const [x, z] = TABLES[k]
  DINERS.push([x, z + 0.62, FACE_N], [x, z - 0.62, FACE_S])
}
DINERS.sort((a, b) => Math.hypot(a[0] - 207, a[1] + 7) - Math.hypot(b[0] - 207, b[1] + 7))

const v = new THREE.Vector3()
const eye = new THREE.Vector3()
const bx = new THREE.Vector3()
const by = new THREE.Vector3()
const bz = new THREE.Vector3()
const basis = new THREE.Matrix4()

/** Turns a flat screen (normal +y, top toward −z) held at its place so that it faces `toward`, top up. */
function screenTo(obj: THREE.Object3D, toward: THREE.Vector3) {
  by.copy(toward).sub(obj.position).normalize()
  bz.set(0, -1, 0).addScaledVector(by, by.y).normalize()
  bx.crossVectors(by, bz)
  basis.makeBasis(bx, by, bz)
  obj.quaternion.setFromRotationMatrix(basis)
}

/** Levy in bed → sitting on its edge, as one blend (k 0 asleep … 1 seated). */
function levyBed(d: Director, k: number, eyesClosed: number) {
  const a = d.use(d.levy)
  a.place(L(BED.x, EDGE.x, k), L(BED.z, EDGE.z, k), L(0, FACE_W, k))
  a.y = L(BED.y, EDGE.y, k)
  a.blend([[0, SLEEP], [1, k < 0.5 ? BED_SIT : BED_EDGE]], k)
  d.apply(d.levy, k > 0.5)
  d.eyes(d.levy, eyesClosed)
}

/** The street's life: rocking chairs (already time-driven), kids on bikes, the man with the dog. */
function streetLife(d: Director, f: SetFrame, bikes = true, dog = true) {
  const t = f.time
  if (bikes) {
    for (const [i, kid] of [d.kid1, d.kid2].entries()) {
      const x = 80 + ((t * 2.6 + i * 31) % 84)
      const b = d.sub.bikes[i]
      b.visible = true
      b.position.set(x, 0, 13 + i * 0.9)
      b.rotation.y = PI / 2
      const a = d.use(kid)
      a.place(x, 13 + i * 0.9, FACE_E)
      a.y = 0.06
      a.hold(RIDE)
      d.apply(kid)
    }
  }
  if (dog) {
    const x = extra(d, 10)
    const a = d.use(x)
    const k = (t * 0.016 + 0.3) % 1
    a.walk(DOG_PATH, k, P.STAND)
    d.apply(x)
    const g = d.sub.dogParts.group
    g.visible = true
    g.position.set(a.x - 0.9, 0, 17.0)
    g.rotation.y = FACE_W
    const swing = Math.sin(t * 9) * 0.35
    d.sub.dogParts.legs.forEach((l, i) => (l.rotation.x = swing * (i % 2 ? 1 : -1)))
  }
}

/** Elen at her flowerbed with the can, the water falling. `laugh` 0…1 lifts the can and her head. */
function elenWatering(d: Director, f: SetFrame, laugh: number, glint = 0) {
  const a = d.use(d.elen)
  a.place(98.6, 21.5, FACE_N)
  a.blend([[0, WATER], [1, LAUGH]], laugh)
  d.apply(d.elen)
  d.sub.canHeld.visible = true
  d.hold(d.sub.canHeld, d.elen, 'r', CAN_HOLD)
  d.sub.canHeld.getWorldPosition(v)
  d.waterArc.visible = laugh < 0.6
  d.waterArc.position.set(v.x - 0.05, v.y + 0.18, v.z - 0.3)
  d.waterArc.rotation.y = PI
  if (d.elen.scar) {
    const m = d.elen.scar.material as THREE.MeshStandardMaterial
    m.emissive.setRGB(glint * 1.4, glint * 1.3, glint * 1.1)
  }
  void f
}

/** Levy on his veranda with the cup; `wave` 0 cup … 1 waving, `stall` 0…1 the hand stalled. */
function levyVeranda(d: Director, wave: number, stall = 0, walkIn = 1) {
  const a = d.use(d.levy)
  if (walkIn < 1) {
    a.place(100.5, L(3.7, 5.0, walkIn), FACE_S)
    a.hold(CUP_L)
  } else {
    a.place(100.5, 5.0, FACE_S)
    a.blend([[0, CUP_L], [1, stall > 0 ? WAVE_STALL_CUP : WAVE_CUP]], Math.max(wave, stall))
  }
  a.y = FLOOR
  a.lookAt(98.6, 21.5, 0.6)
  d.apply(d.levy)
  d.sub.cup.visible = true
  d.hold(d.sub.cup, d.levy, 'l', CUP_HOLD)
}

/** Levy and KADIN at their cantina table. `turn` turns both heads to the window (0…1); `fork` 0 spoon … 1 fork held up. */
function levyTable(d: Director, f: SetFrame, turnLevy: number, turnKadin: number, levyPose: 'spoon' | 'forkup' | 'table' | 'eat' = 'spoon', kadinUp = 0) {
  const t = f.time
  const a = d.use(d.levy)
  a.place(210.8, -2.68, FACE_N)
  const base = levyPose === 'forkup' ? SIT_FORK_UP : levyPose === 'table' ? SIT_TABLE : SIT_SPOON
  a.hold(base)
  if (levyPose === 'eat') a.reach('r', 1, 210.86, 1.35 + Math.sin(t * 2.5) * 0.06, -2.78, 0.5)
  a.lookAt(216.1, -3.2, turnLevy)
  d.twist(d.levy, 0.35 * turnLevy)
  d.apply(d.levy)
  if (levyPose !== 'table') {
    d.arc.spoonLevy.visible = true
    d.hold(d.arc.spoonLevy, d.levy, 'r', SPOON_HOLD)
  }
  const k = d.use(d.kadin)
  k.place(210.8, -3.92, FACE_S)
  k.blend([[0, SIT_SPOON], [1, SIT_TALK]], kadinUp)
  k.reach('r', 1 - kadinUp, 210.76 + Math.cos(t * 2.2) * 0.03, 0.9, -3.7 + Math.sin(t * 2.2) * 0.03, 0.5)
  k.lookAt(216.1, -3.2, turnKadin)
  d.twist(d.kadin, -0.35 * turnKadin)
  d.apply(d.kadin)
  d.arc.spoonKadin.visible = true
  d.hold(d.arc.spoonKadin, d.kadin, 'r', SPOON_HOLD)
}

/** The other diners, each turning to the window by `turn(k)` (k in the wave's order). */
function diners(d: Director, turn: (k: number) => number) {
  DINERS.forEach(([x, z, yaw], k) => {
    const p = extra(d, k)
    const a = d.use(p)
    a.place(x, z, yaw)
    a.hold(k % 3 === 1 ? P.SIT_READ : k % 3 === 2 ? SIT_SPOON : SIT_TABLE)
    const amt = turn(k)
    a.lookAt(216.1, -3.2, amt)
    d.twist(p, (yaw === FACE_N ? 0.3 : -0.3) * amt)
    d.apply(p)
  })
}

/** Levy at his archive desk with two colleagues; the monitor in `mode`. */
export function archiveOffice(d: Director, f: SetFrame, mode: 'list' | 'black' | 'box' | 'old', reveal = 1, typing = true, shrug = 0) {
  const t = f.time
  const a = d.use(d.levy)
  a.place(200, -2.38, FACE_N)
  a.hold(P.SIT_TYPE)
  if (typing) {
    d.bend(d.levy, 'rFore', 0, Math.sin(t * 11) * 0.04)
    d.bend(d.levy, 'lFore', 0, Math.sin(t * 9.3 + 1) * 0.04)
  }
  d.bend(d.levy, 'lUpper', 2, 0.25 * shrug)
  d.bend(d.levy, 'rUpper', 2, -0.25 * shrug)
  d.bend(d.levy, 'head', 0, -0.1 * shrug)
  d.apply(d.levy)
  for (const [i, x, z] of [
    [0, 198, -2.35],
    [1, 202.2, -5.85],
  ] as const) {
    const p = extra(d, i)
    const b = d.use(p)
    b.place(x, z, FACE_N)
    b.hold(i ? P.SIT_READ : P.SIT_TYPE)
    d.apply(p)
  }
  d.arc.monitor.redraw((c, W, H) => drawArchive(c, W, H, mode, GLITCH, reveal, t), `archive:${mode}:${Math.round(reveal * 30)}:${tick(t, 3)}`)
}

/** The bus interior: Levy opposite the mother and the sleeping boy. `look` turns Levy to the window. */
export function busInterior(d: Director, f: SetFrame, look: number, stroke: number) {
  const t = f.time
  d.sub.stripTex.offset.x = (t * 0.06) % 1
  const a = d.use(d.levy)
  a.place(170.1, -60.8, FACE_E)
  a.hold(SIT_BUS)
  a.lookAt(171, -62.5, look)
  d.apply(d.levy)
  const m = d.pooled(6, 0x8a6a5a, 0x4a4a4a)
  const b = d.use(m)
  b.place(171.5, -60.8, FACE_W)
  b.hold(SIT_STROKE)
  b.reach('r', stroke, 170.92, 0.66, -61.0, 0.5)
  d.apply(m)
  const k = d.use(d.kid2)
  k.place(171.12, -60.45, 0.35)
  k.y = 0.47
  k.hold(CURLED)
  d.apply(d.kid2, false)
  d.eyes(d.kid2, 1)
}

export const actSuburb: Act = (d, f, seg, u, shot) => {
  const t = f.time
  const sub = d.sub
  switch (seg) {
    // ——— 03 PAZARTESİ ———
    case 'wake': {
      d.place('suburb')
      light.dawn(d, 0.5 + 0.5 * S(0.05, 0.3, u))
      d.wear('pajama')
      sub.curtains(S(0.05, 0.3, u))
      sub.shirtOnChair.visible = true
      levyBed(d, S(0.35, 0.55, u), 1 - S(0.3, 0.36, u))
      sub.weather.redraw((c, W, H) => drawWeather(c, W, H, 'AÇIK. ILIK. DENGELİ.'), 'weather')
      d.cam([[0, [105.4, 1.9, -1.6, 103.6, 0.9, -4.9, 45]], [0.6, [105.4, 1.9, -1.6, 103.6, 0.9, -4.9, 45]], [0.9, [105.4, 1.9, -1.6, 101.3, 1.3, -2.5, 45]], [1, [105.4, 1.9, -1.6, 101.3, 1.3, -2.5, 45]]], u, shot)
      d.fx.white(1 - S(0, 0.05, u))
      return true
    }
    case 'filed': {
      d.place('suburb')
      light.dawn(d, 1)
      sub.shirtOnChair.visible = true
      sub.curtains(1)
      // The bird comes in from the side yard and settles exactly on a post.
      const k = S(0.3, 0.6, u)
      sub.bird.visible = true
      sub.bird.position.set(L(111.5, 109.2, k), L(2.2, 0.97, k) + Math.sin(k * PI) * 0.45 + (k >= 1 ? Math.abs(Math.sin(t * 6)) * 0.004 : 0), L(-7.2, -3.6, k))
      sub.bird.rotation.y = FACE_S + 0.4
      streetLife(d, f, false, false)
      d.cam([[0, [103.5, 1.6, -3.0, 106.2, 1.8, -3.6, 45]], [1, [104.3, 1.65, -3.4, 106.4, 1.75, -3.6, 42]]], u, shot)
      return true
    }
    case 'mirror': {
      d.place('suburb')
      light.house(d, 97.5, -4.5)
      d.wear('shirt')
      sub.mirror.visible = true
      const a = d.use(d.levy)
      a.place(97.5, -5.05, FACE_N)
      a.y = FLOOR
      a.blend([[0, P.STAND], [0.08, TEMPLES], [0.46, TEMPLES], [0.5, TRACE], [0.76, TRACE], [0.8, COLLAR]], u)
      const collar = S(0.77, 0.83, u)
      a.reach('l', collar, 97.4, 1.47, -5.2, 0.4)
      a.reach('r', collar, 97.6, 1.47, -5.2, 0.4)
      d.apply(d.levy)
      d.fx.wash(0.75, 0.85, 1.25, bump(0.595, 0.625, u) * 0.6)
      // The camera is the mirror: what it shows him (his face, the hands lifting the hair, the scar).
      d.cam([[0, [97.64, 1.97, -5.83, 97.5, 1.9, -5.05, 38]], [0.45, [97.66, 1.98, -5.82, 97.5, 1.95, -5.05, 33]], [0.6, [97.74, 2.0, -5.72, 97.47, 1.99, -5.1, 26]], [1, [97.74, 2.0, -5.72, 97.47, 1.99, -5.1, 26]]], u, shot)
      return true
    }
    case 'elen': {
      d.place('suburb')
      light.day(d, 100, 12, 20)
      d.wear('cardigan')
      levyVeranda(d, S(0.34, 0.4, u), 0, S(0, 0.15, u))
      elenWatering(d, f, S(0.72, 0.76, u), bump(0.27, 0.34, u))
      streetLife(d, f, true, true)
      d.cam(
        [
          [0, [100.05, 1.9, 4.2, 98.85, 1.05, 20.8, 38]],
          [0.36, [100.05, 1.9, 4.22, 98.85, 1.05, 20.8, 38]],
          [0.36, [99.6, 1.6, 15.5, 100.5, 1.55, 5.0, 28]],
          [0.72, [99.6, 1.6, 15.4, 100.5, 1.55, 5.0, 28]],
          [0.72, [98.0, 1.55, 18.6, 98.6, 1.4, 21.0, 32]],
          [1, [98.05, 1.55, 18.7, 98.6, 1.4, 21.0, 32]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'film': {
      d.place('suburb')
      light.day(d, 100, 8, 14)
      d.wear('cardigan')
      const a = d.use(d.levy)
      a.place(100.5, 5.0, FACE_S)
      a.y = FLOOR
      a.hold(CUP_L)
      d.bend(d.levy, 'head', 2, 0.08 * S(0.3, 0.6, u))
      a.lookAt(96, 14, 0.3 * S(0.5, 0.8, u))
      d.apply(d.levy)
      sub.cup.visible = true
      d.hold(sub.cup, d.levy, 'l', CUP_HOLD)
      elenWatering(d, f, 1)
      streetLife(d, f, false, true)
      d.cam([[0, [100.0, 1.85, 7.6, 100.5, 1.82, 5.0, 30]], [1, [100.15, 1.88, 6.9, 100.5, 1.86, 5.0, 28]]], u, shot)
      return true
    }
    case 'busstop': {
      d.place('suburb')
      light.day(d, 139, 11, 20)
      d.wear('cardigan')
      const a = d.use(d.levy)
      if (u < 0.38) a.walk(SIDEWALK, u / 0.38, P.STAND)
      else if (u < 0.9) {
        a.place(138.6, 9.75, FACE_E)
        a.hold(P.STAND_EASY)
        a.lookAt(141.6, 9.7, 0.9)
      } else a.walk(BOARD, (u - 0.9) / 0.1, P.STAND, FACE_E, 0.4)
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      streetLife(d, f, true, true)
      const blink = t % 4 < 0.16
      sub.psa.redraw((c, W, H) => drawPSA(c, W, H, PSA, blink), `psa:${blink ? 1 : 0}`)
      // The bus pulls in from the east; the doors slide.
      if (u > 0.55) {
        sub.bus.visible = true
        sub.bus.position.set(138.5 + 32 * (1 - S(0.6, 0.82, u)), 0, 13.45)
        const slide = S(0.85, 0.92, u)
        sub.busDoors[0].position.x = 3.9 + 1.05 * slide
        sub.busDoors[1].position.x = -1.0 - 1.05 * slide
      }
      if (u < 0.38) {
        shot.pos.set(a.x - 0.4, 1.6, 12.6)
        shot.tgt.set(a.x + 0.8, 1.3, 9.75)
        shot.fov = 40
      } else d.cam([[0.38, [137.3, 1.62, 12.4, 140.5, 1.42, 9.75, 38]], [1, [137.5, 1.62, 12.2, 140.6, 1.42, 9.75, 36]]], u, shot)
      return true
    }
    case 'archive': {
      d.place('office')
      const mode = u < 0.5 ? 'list' : u < 0.54 ? 'black' : u < 0.74 ? 'box' : 'list'
      light.office(d, mode === 'black' ? 0.1 : mode === 'box' ? 0.5 : 1)
      d.wear('cardigan')
      archiveOffice(d, f, mode, mode === 'box' ? C((u - 0.54) / 0.2) : 1, u < 0.5 || u > 0.84, bump(0.74, 0.86, u))
      d.cam(
        [
          [0, [197.4, 1.7, -0.6, 200, 1.0, -3.2, 40]],
          [0.5, [197.6, 1.7, -0.7, 200, 1.0, -3.2, 40]],
          [0.5, [200.5, 1.35, -2.4, 200, 1.15, -3.4, 28]],
          [0.74, [200.5, 1.35, -2.4, 200, 1.15, -3.4, 28]],
          [0.74, [199.35, 1.32, -3.15, 200, 1.24, -2.45, 32]],
          [1, [199.37, 1.32, -3.13, 200, 1.24, -2.45, 32]],
        ],
        u,
        shot,
      )
      return true
    }
    // ——— 04 SALI ———
    case 'sameLight': {
      d.place('suburb')
      light.house(d, 97.5, -4.5)
      d.wear('shirt')
      sub.mirror.visible = true
      d.levyScar.color.setHex(0xd2a89e)
      const a = d.use(d.levy)
      a.place(97.5, -5.05, FACE_N)
      a.y = FLOOR
      a.hold(TRACE)
      d.bend(d.levy, 'head', 2, 0.2 * S(0.3, 0.6, u))
      d.apply(d.levy)
      d.cam([[0, [97.66, 1.98, -5.82, 97.5, 1.95, -5.05, 33]], [1, [97.66, 1.98, -5.82, 97.5, 1.95, -5.05, 33]]], u, shot)
      return true
    }
    case 'again': {
      d.place('suburb')
      light.day(d, 100, 12, 20)
      d.wear('cardigan')
      const wave = S(0, 0.03, u) * (1 - S(0.58, 0.64, u))
      const stall = S(0.42, 0.46, u) * (1 - S(0.58, 0.64, u))
      levyVeranda(d, wave, stall)
      elenWatering(d, f, S(0.2, 0.24, u))
      streetLife(d, f, true, true)
      d.cam([[0, [99.6, 1.6, 15.5, 100.5, 1.55, 5.0, 28]], [0.42, [99.6, 1.6, 15.4, 100.5, 1.55, 5.0, 28]], [0.42, [100.1, 1.86, 7.1, 100.5, 1.84, 5.0, 28]], [1, [100.2, 1.9, 6.7, 100.5, 1.88, 5.0, 26]]], u, shot)
      return true
    }
    case 'bus': {
      d.place('bus')
      light.bus(d)
      d.wear('cardigan')
      busInterior(d, f, S(0.63, 0.7, u), S(0.3, 0.38, u))
      d.cam([[0, [169.05, 1.3, -59.5, 171.0, 0.92, -60.8, 35]], [0.65, [169.05, 1.3, -59.5, 171.0, 0.92, -60.8, 35]], [0.8, [169.05, 1.3, -59.5, 172, 1.3, -61.25, 35]], [1, [169.05, 1.3, -59.5, 172, 1.3, -61.25, 35]]], u, shot)
      return true
    }
    case 'wave': {
      d.place('cantina')
      light.cantina(d)
      d.wear('cardigan')
      const back = 1 - S(0.58, 0.61, u)
      diners(d, (k) => S(0.05 + k * 0.03, 0.09 + k * 0.03, u) * back)
      levyTable(d, f, S(0.4, 0.45, u) * back, S(0.46, 0.5, u) * back, u > 0.58 ? 'forkup' : 'spoon')
      d.cam(
        [
          [0, [215.4, 1.8, -2.8, 208, 1.2, -4.5, 45]],
          [0.42, [215.3, 1.8, -2.8, 208, 1.2, -4.5, 45]],
          [0.42, [210.2, 1.6, -2.0, 216, 1.5, -3.0, 40]],
          [0.58, [210.3, 1.6, -2.0, 216, 1.5, -3.0, 40]],
          [0.58, [215.4, 1.8, -2.8, 208, 1.2, -4.5, 45]],
          [1, [215.2, 1.8, -2.9, 208, 1.2, -4.5, 45]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'why': {
      d.place('cantina')
      light.cantina(d)
      d.wear('cardigan')
      diners(d, () => 0)
      levyTable(d, f, 0, 0, u > 0.69 ? 'table' : 'forkup', S(0.29, 0.34, u))
      d.cam(
        [
          [0, [211.6, 1.35, -4.4, 210.8, 1.25, -2.7, 32]],
          [0.3, [211.55, 1.35, -4.4, 210.8, 1.25, -2.7, 32]],
          [0.3, [210.2, 1.35, -2.1, 210.8, 1.2, -3.9, 32]],
          [0.68, [210.2, 1.35, -2.1, 210.8, 1.2, -3.9, 32]],
          [0.68, [213, 1.4, -3.3, 210.8, 1.1, -3.3, 38]],
          [1, [212.9, 1.4, -3.3, 210.8, 1.1, -3.3, 38]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'tv':
    case 'remote':
    case 'thought': {
      d.place('suburb')
      light.evening(d, 1)
      ;(d.pal.sky as THREE.MeshBasicMaterial).color.setHex(0x5a6a90)
      d.wear('cardigan')
      const channel = f.flags.has('tv:channel')
      const a = d.use(d.levy)
      a.place(103.5, 2.62, FACE_N)
      a.y = FLOOR
      a.hold(SOFA_WATCH)
      let volume: number | null = null
      let ch: string | null = null
      if (seg === 'remote') {
        a.reach('r', bump(0.22, 0.4, u), 103.75, 0.8, 1.65, 0.5)
        if (u > 0.3) {
          sub.remote.visible = true
          volume = 1 - Math.floor(S(0.4, 0.7, u) * 6) * 0.14
        }
        if (channel && u > 0.36 && !(u >= 0.5 && u < 0.515)) ch = '07'
      }
      if (seg === 'thought') {
        volume = 0.16
        if (channel) ch = '07'
      }
      d.apply(d.levy)
      if (sub.remote.visible) d.hold(sub.remote, d.levy, 'l', REMOTE_HOLD)
      d.tv.render(d.renderer, t, 1)
      ;(sub.tvScreen.material as THREE.MeshBasicMaterial).color.setScalar(1)
      sub.tvOverlay.mesh.visible = true
      sub.tvOverlay.redraw((c, W, H) => drawTvOverlay(c, W, H, volume, ch, CRAWL, 1 - ((t * 0.075) % 2.7)), `tv:${volume}:${ch}:${tick(t, 30)}`)
      if (seg === 'tv') d.cam([[0, [103.0, 1.5, 4.0, 103.5, 1.45, -0.9, 40]], [0.3, [103.0, 1.5, 4.0, 103.5, 1.45, -0.9, 40]], [0.62, [102.55, 1.5, 2.3, 103.5, 1.45, -0.9, 34]], [1, [103.3, 1.45, 0.8, 103.5, 1.45, -0.9, 30]]], u, shot)
      else if (seg === 'remote')
        d.cam(
          [
            [0, [104.8, 1.2, 1.2, 103.5, 0.95, 2.6, 35]],
            [0.36, [104.75, 1.2, 1.2, 103.5, 0.95, 2.6, 35]],
            [0.36, [102.82, 1.24, 1.78, 103.26, 1.12, 2.22, 26]],
            [0.7, [102.84, 1.24, 1.8, 103.26, 1.12, 2.22, 26]],
            [0.7, [103.5, 1.4, 1.5, 103.5, 1.45, -0.9, 30]],
            [1, [103.5, 1.4, 1.4, 103.5, 1.45, -0.9, 30]],
          ],
          u,
          shot,
        )
      else if (channel && u >= 0.82) d.cam([[0.82, [103.62, 1.62, 0.3, 103.93, 1.7, -0.9, 17]], [1, [103.66, 1.63, 0.15, 103.93, 1.7, -0.9, 15]]], u, shot)
      else d.cam([[0, [103.02, 1.48, 1.72, 103.5, 1.47, 2.62, 28]], [1, [103.1, 1.48, 1.84, 103.5, 1.47, 2.62, 26]]], u, shot)
      return true
    }
    // ——— 05 ÇARŞAMBA ———
    case 'bell': {
      d.place('suburb')
      light.grey(d, 103.6, -3.5, S(0.5, 0.62, u))
      if (u < 0.42) {
        // Curtains shut, no lamp: only grey light around the curtain edges.
        d.rig.hemi.intensity = 0.16
        d.rig.pts[0].intensity = 0.25
        d.scene.environmentIntensity = 0.12
        d.rig.pt(1, 0xbfd0e6, 0.9, [105.6, 1.8, -3.6], 3.5, 1.6)
      }
      sub.curtains(0)
      sub.envelope.mesh.visible = true
      if (u < 0.42) {
        d.wear('pajama')
        levyBed(d, S(0.1, 0.25, u), 1 - S(0.04, 0.08, u))
      } else {
        d.wear('jacket')
        const a = d.use(d.levy)
        if (u < 0.6) a.walk(WALK_TO_DOOR, (u - 0.42) / 0.18, P.STAND)
        else {
          a.place(100.0, 3.3, FACE_S)
          a.hold(P.STAND)
          d.bend(d.levy, 'neck', 0, 0.25 * S(0.63, 0.7, u))
          d.bend(d.levy, 'head', 0, 0.4 * S(0.63, 0.7, u))
        }
        a.y = FLOOR
        d.apply(d.levy)
        d.steps(a.walking, a.step)
      }
      sub.frontDoor.rotation.y = -1.5 * S(0.5, 0.62, u)
      d.cam(
        [
          [0, [105.0, 1.6, -1.6, 103.6, 0.9, -4.9, 45]],
          [0.42, [105, 1.6, -1.6, 103.6, 0.9, -4.9, 45]],
          [0.42, [100.0, 1.6, 6.2, 100.0, 1.4, 4.0, 40]],
          [0.65, [100.0, 1.6, 6.2, 100.0, 1.4, 4.0, 40]],
          [0.69, [100.3, 1.0, 5.4, 100.0, 0.32, 4.6, 28]],
          [1, [100.3, 1.0, 5.4, 100.0, 0.32, 4.6, 28]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'letter':
    case 'calendar':
    case 'heavy': {
      d.place('suburb')
      light.grey(d, 98.3, -0.6)
      sub.curtains(0)
      d.wear('jacket')
      const heavyLine = seg === 'heavy' ? S(0.41, 0.72, u) : 0
      sub.letter.mesh.visible = seg !== 'letter' || u > 0.14
      sub.letter.redraw((c, W, H) => drawNotice(c, W, H, NOTICE, heavyLine), `notice:${Math.round(heavyLine * 30)}`)
      sub.envelopeOnTable.mesh.visible = true
      sub.clock.redraw((c, W, H) => drawDigitalClock(c, W, H, '08.14'), 'clock')
      const a = d.use(d.levy)
      if (seg === 'heavy' && u > 0.74) {
        a.walk(STAND_UP, S(0.74, 0.84, u), P.STAND, FACE_N, FACE_N)
        a.blend([[0, SIT_TABLE], [1, P.STAND]], S(0.74, 0.8, u))
      } else {
        a.place(98.3, 0.08, FACE_N)
        if (seg === 'letter') {
          a.blend([[0, SIT_TABLE], [0.56, SIT_TABLE], [0.64, SIT_UNFOCUSED]], u)
          const tear = bump(0.02, 0.3, u)
          a.reach('l', tear, 98.1, 1.09, -0.75, 0.5)
          a.reach('r', tear, 98.3, 1.1, -0.62, 0.5)
        } else if (seg === 'calendar') {
          a.blend([[0, SIT_PHONE], [0.7, SIT_PHONE], [0.82, SIT_TABLE]], u)
          d.bend(d.levy, 'head', 0, -0.25 * S(0.42, 0.5, u) * (1 - S(0.7, 0.8, u)))
        } else a.hold(SIT_TABLE)
      }
      a.y = FLOOR
      d.apply(d.levy)
      if (seg === 'calendar') {
        sub.phone.visible = true
        sub.phoneScreen.redraw((c, W, H) => drawCalendar(c, W, H, CALENDAR), 'calendar')
        if (u < 0.76) {
          d.hold(sub.phone, d.levy, 'l', PHONE_HOLD)
          // The screen faces his eyes (and the camera over his shoulder).
          d.levy.figure.joints.head.getWorldPosition(eye)
          eye.y += 0.06
          eye.z -= 0.08
          screenTo(sub.phone, eye)
        } else {
          sub.phone.position.set(98.6, FLOOR + 0.74, -0.35)
          sub.phone.rotation.set(0, 0.3, 0)
        }
      }
      if (seg === 'heavy') {
        sub.phone.visible = true
        sub.phone.position.set(98.6, FLOOR + 0.74, -0.35)
        sub.phone.rotation.set(0, 0.3, 0)
      }
      if (seg === 'letter')
        d.cam(
          [
            [0, [99.4, 1.8, 0.4, 98.3, 1.1, -0.6, 35]],
            [0.2, [99.4, 1.8, 0.4, 98.3, 1.1, -0.6, 35]],
            [0.2, [98.3, 1.8, -0.35, 98.3, 1.06, -0.58, 26]],
            [0.6, [98.3, 1.8, -0.35, 98.3, 1.06, -0.58, 26]],
            [0.6, [97.4, 1.6, -1.2, 98.3, 1.5, -0.05, 30]],
            [1, [97.45, 1.6, -1.15, 98.3, 1.5, -0.05, 30]],
          ],
          u,
          shot,
        )
      else if (seg === 'calendar')
        d.cam(
          [
            [0, [98.0, 1.7, 0.16, 98.09, 1.42, -0.29, 25]],
            [0.42, [98.0, 1.7, 0.17, 98.09, 1.42, -0.29, 25]],
            [0.42, [97.6, 1.55, -1.3, 98.3, 1.48, -0.1, 32]],
            [1, [97.65, 1.55, -1.25, 98.3, 1.48, -0.1, 32]],
          ],
          u,
          shot,
        )
      else
        d.cam(
          [
            [0, [97.0, 2.0, -0.6, 96.11, 2.0, -0.8, 25]],
            [0.15, [97.0, 2.0, -0.6, 96.11, 2.0, -0.8, 25]],
            [0.15, [98.3, 1.8, -0.42, 98.3, 1.06, -0.56, 24]],
            [0.72, [98.3, 1.38, -0.47, 98.3, 1.055, -0.522, 16]],
            [0.74, [98.3, 1.38, -0.47, 98.3, 1.055, -0.522, 16]],
            [0.74, [100.4, 1.8, 1.2, 98.3, 1.3, -0.5, 40]],
            [1, [100.4, 1.8, 1.25, 98.3, 1.3, -0.5, 40]],
          ],
          u,
          shot,
        )
      return true
    }
    case 'shoes': {
      d.place('suburb')
      const door = S(0.6, 0.8, u)
      light.grey(d, 99.5, 2.5, door)
      sub.curtains(0)
      d.wear('jacket')
      sub.frontDoor.rotation.y = -1.5 * door
      const a = d.use(d.levy)
      if (u < 0.5) {
        a.place(99.0, 3.18, FACE_N)
        a.hold(TIE)
        d.bend(d.levy, 'spine', 0, -0.25 * S(0.3, 0.47, u))
        d.bend(d.levy, 'lUpper', 2, -0.1 * S(0.3, 0.47, u))
        d.bend(d.levy, 'rUpper', 2, 0.1 * S(0.3, 0.47, u))
      } else {
        a.walk(TO_FRONT, S(0.5, 0.62, u), P.STAND, FACE_N, FACE_S)
        a.blend([[0, TIE], [1, P.STAND]], S(0.5, 0.56, u))
        a.reach('r', bump(0.58, 0.8, u), 100.35, 1.05, 3.9, 0.5)
      }
      a.y = FLOOR
      d.apply(d.levy)
      // In front of him between the bench and the door: the shoes, then his face; at 0.5 outside, the door opening on him.
      d.cam(
        [
          [0, [100.05, 1.32, 1.72, 99.0, 0.5, 2.95, 44]],
          [0.45, [99.9, 1.36, 1.92, 99.0, 1.08, 3.0, 36]],
          [0.5, [99.9, 1.36, 1.92, 99.0, 1.08, 3.0, 36]],
          [0.5, [100.05, 1.62, 5.75, 99.75, 1.58, 3.5, 34]],
          [1, [100.0, 1.62, 5.45, 99.75, 1.58, 3.5, 32]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'empty': {
      d.place('suburb')
      light.day(d, 99, 16, 16)
      d.wear('jacket')
      sub.canOnSteps.visible = true
      sub.bedSoilWet.visible = true
      sub.bedSoil.visible = false
      sub.drop.visible = true
      sub.drop.position.y = 0.3 - ((t * 0.7) % 1) * 0.17
      if (u > 0.5) {
        const a = d.use(d.levy)
        a.walk(OUT_LEFT, (u - 0.5) / 0.5, P.STAND)
        d.apply(d.levy)
        d.steps(a.walking, a.step)
      }
      streetLife(d, f, false, true)
      d.cam([[0, [99.5, 1.6, 9.7, 98.8, 0.6, 21.4, 32]], [1, [99.5, 1.5, 10.3, 98.7, 0.35, 21.6, 28]]], u, shot)
      return true
    }
    // ——— 11 GERİ SALIM (the cantina) ———
    case 'cantina': {
      d.wear('jacket')
      if (u >= 0.32 && u < 0.47) {
        d.place('h')
        light.small(d, 1)
        smallRoomPeople(d, f, 0, 0)
        d.cam([[0.32, [600, 1.4, 1.6, 600, 0.9, -0.4, 36]], [0.47, [600, 1.38, 1.55, 600, 0.9, -0.4, 36]]], u, shot)
        d.fx.wash(1, 1, 1, 0.45)
        return true
      }
      d.place('cantina')
      light.cantina(d)
      diners(d, () => 0)
      levyTable(d, f, 0, 0, 'spoon', S(0, 0.05, u))
      d.cam([[0, [210.2, 1.35, -2.1, 210.8, 1.2, -3.9, 32]], [0.32, [210.2, 1.35, -2.1, 210.8, 1.2, -3.9, 32]], [0.47, [211.6, 1.35, -4.4, 210.8, 1.25, -2.7, 32]], [1, [211.55, 1.35, -4.4, 210.8, 1.25, -2.7, 32]]], u, shot)
      return true
    }
    case 'window': {
      d.place('cantina')
      light.cantina(d)
      d.wear('jacket')
      const turn = S(0.3, 0.34, u) * (1 - S(0.52, 0.56, u))
      diners(d, () => turn)
      levyTable(d, f, turn, turn, u < 0.15 || u > 0.56 ? 'eat' : 'spoon', 1)
      d.cam([[0, [215.4, 1.8, -2.8, 208, 1.2, -4.5, 45]], [0.75, [215.3, 1.8, -2.85, 208, 1.2, -4.5, 45]], [1, [213.6, 1.6, -2.9, 210.8, 1.2, -2.7, 34]]], u, shot)
      return true
    }
    default:
      return false
  }
}
