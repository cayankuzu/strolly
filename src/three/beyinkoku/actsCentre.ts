/**
 * The Bilişsel Stabilizasyon Merkezi: chapter 6 (MERKEZ), 7 (KIRMIZI ÇİZGİ)
 * and the lobby of chapter 11. The hall is built mirrored (reception on the
 * east, stair door on the west), so every screenplay x is passed through mx().
 */
import * as THREE from 'three'
import { TEXT } from '@/stories/beyinkoku/text'
import { addWalk, makePose, type Pose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import type { SetFrame } from '../kit/SetScene'
import type { Act, Director } from './BeyinKokuScene'
import { archiveOffice, busInterior } from './actsSuburb'
import { BACK_TO_DOOR, HAND_CHEST, RUN, SIT_FORM } from './cast'
import { COFFEE, DESK, FORMS, MARK } from './centre'
import { drawBoard, drawReception, drawSign } from './screens'
import { extra, FACE_E, FACE_N, FACE_S, FACE_W, FUMBLE, L, light, LOOK_UP, PI, S, WAIT, yawTo } from './staging'

const LINES = (id: string) => TEXT.find((t) => t.id === id)?.lines ?? []
const BOARD = LINES('board-text')
const SIGN = LINES('sign')

/** Folding a form at the chest. */
const FOLD = makePose({ lUpper: [-0.5, 0, 0.2], rUpper: [-0.5, 0, -0.2], lFore: [-1.9, 0.3, 0], rFore: [-1.9, -0.3, 0], head: [0.3, 0, 0] }, P.STAND)
/** Holding a cup under the machine's spout. */
const CUP_OUT = makePose({ rUpper: [-0.55, 0, -0.15], rFore: [-1.2, 0, 0], rHand: [0.2, 0, 0], head: [0.2, 0, 0] }, P.STAND)
const CUP_HOLD = new THREE.Euler(0, 0, 0)
const ENVELOPE_HOLD = new THREE.Euler(-1.3, 0.2, 0)

type Home = { i: number; x: number; z: number; yaw: number; pose: Pose; seated: boolean }
/** The hall's people: coffee man, form woman, four in the armchairs, a talking pair; the görevli and the walker are handled apart. */
const HOMES: Home[] = [
  { i: 2, x: COFFEE.x, z: COFFEE.z + 0.85, yaw: FACE_N, pose: CUP_OUT, seated: false },
  { i: 7, x: FORMS.x, z: FORMS.z + 0.45, yaw: FACE_N, pose: FOLD, seated: false },
  { i: 3, x: 306.6, z: 10.3, yaw: FACE_N, pose: P.SIT_READ, seated: true },
  { i: 4, x: 309.2, z: 10.3, yaw: FACE_N, pose: P.SIT, seated: true },
  { i: 8, x: 307.9, z: 12.2, yaw: FACE_S, pose: P.SIT_READ, seated: true },
  { i: 9, x: 310.5, z: 12.2, yaw: FACE_S, pose: P.SIT, seated: true },
  { i: 11, x: 293.2, z: 6.2, yaw: yawTo(1, 0.7), pose: P.STAND_EASY, seated: false },
  { i: 0, x: 294.2, z: 6.9, yaw: yawTo(-1, -0.7), pose: P.LISTEN, seated: false },
]
const WALKER = makePath([
  [309.6, 1.6],
  [305.2, 5.6],
])
const CLOTHES: Record<number, [number, number]> = { 2: [0x6a4a3a, 0x3a3a3a], 7: [0x5f8f6a, 0x4a4a52] }

const INTO_HALL = makePath([
  [300, 15.3],
  [300.3, 12.5],
  [302.6, 10.8],
  [303.5, 10.3],
])
const GARDEN_WALK = makePath([
  [300.4, 44.5],
  [300.5, 36.5],
  [302.8, 34.2],
  [303.7, 31],
  [302.8, 27.8],
  [300.5, 25.6],
  [300.4, 23.6],
])
const TO_DOORS = makePath([
  [300.2, 20],
  [300.1, 15.6],
])
const STEP_WALK = makePath([
  [299.85, 10.0],
  [299.75, 5.5],
])
const EYES_WALK = makePath([
  [299.75, 5.5],
  [299.75, 3.0],
])
const RUN_WALK_SLOW = makePath([
  [299.75, 3.0],
  [299.7, 1.0],
])
const RUN_PATH = makePath([
  [299.7, 1.0],
  [299.3, 0.15],
  [298.2, 0.02],
  [286.3, 0.02],
])
const STAIR_PATH = makePath([
  [282.5, 1.6],
  [282.5, -3.2],
])
const LOBBY_PATH = makePath([
  [285.6, 0.1],
  [299.3, 0.6],
  [300.3, 9.5],
  [300.4, 15.4],
])

const v = new THREE.Vector3()

/** The height of the stair at z (the flight rises from z 1.0 to −4.5). */
const stairY = (z: number) => 4.5 * Math.min(1, Math.max(0, (1.0 - z) / 5.5))

type HallOpts = {
  /** Where Levy is (for the eyes and the advance). */
  lx: number
  lz: number
  /** Head turn to Levy per person (k 0 görevli, 1 coffee, 2 form, 3–6 armchairs, 7–8 the pair, 9 walker). */
  eyes?: (k: number) => number
  /** How far toward Levy each person has come (0 home … 1 at him). */
  advance?: (k: number) => number
  /** The walker's progress along his crossing (frozen when held). */
  walker?: number
  /** The coffee overflowing (0 none … 1 pooled). */
  overflow?: number
  /** The reception screen shows Levy's name. */
  name?: boolean
  /** Running instead of walking. */
  run?: boolean
}

/** Everyone in the hall, in their first places unless told otherwise. */
function hallPeople(d: Director, f: SetFrame, o: HallOpts) {
  const t = f.time
  const eyes = o.eyes ?? (() => 0)
  const adv = o.advance ?? (() => 0)
  const moveTo = (a: ReturnType<Director['use']>, p: { x: number; z: number; yaw: number }, k: number, base: Pose, seated: boolean) => {
    const m = adv(k)
    if (m <= 0.001) {
      a.place(p.x, p.z, p.yaw)
      a.hold(base)
      return
    }
    const dx = o.lx - p.x
    const dz = o.lz - p.z
    const dist = Math.hypot(dx, dz)
    const go = Math.min(m * dist, Math.max(0, dist - 1.1))
    const x = p.x + (dx / dist) * go
    const z = p.z + (dz / dist) * go
    const stand = seated ? S(0, 0.25, m) : 1
    a.place(x, z, L(p.yaw, yawTo(dx, dz), S(0, 0.2, m)))
    a.blend([[0, base], [1, o.run ? RUN : P.STAND]], stand)
    addWalk(a.pose, (go / (o.run ? 1.6 : 1.1)) * PI * 2, S(0, 0.3, m) * (o.run ? 1.25 : 0.9))
  }
  // The görevli behind her desk, typing, looking at her screen.
  const g = d.use(d.gorevli)
  moveTo(g, { x: DESK.x, z: DESK.z - 0.8, yaw: FACE_S }, 0, WAIT, false)
  if (adv(0) <= 0.001) {
    g.reach('l', 1, DESK.x + 0.1, 0.86, DESK.z - 0.2, 0.5)
    g.reach('r', 1, DESK.x + 0.4, 0.86, DESK.z - 0.2, 0.5)
    d.bend(d.gorevli, 'rFore', 0, Math.sin(t * 10) * 0.03)
  }
  const ge = eyes(0)
  g.lookAt(o.lx, o.lz, ge)
  d.bend(d.gorevli, 'head', 0, 0.3 * (1 - ge))
  d.apply(d.gorevli)
  d.cen.reception.redraw((c, W, H) => drawReception(c, W, H, !!o.name), `reception:${o.name ? 1 : 0}`)
  // The others.
  HOMES.forEach((h, j) => {
    const k = j + 1
    const [top, bottom] = CLOTHES[h.i] ?? [0, 0]
    const p = top ? d.pooled(h.i, top, bottom) : extra(d, h.i)
    const a = d.use(p)
    moveTo(a, h, k, h.pose, h.seated)
    const e = eyes(k)
    a.lookAt(o.lx, o.lz, e)
    d.twist(p, (h.yaw === FACE_N ? 0.3 : -0.3) * e * (h.x > o.lx ? 1 : -1))
    d.apply(p)
    if (k === 1) {
      d.cen.cup.visible = true
      d.hold(d.cen.cup, p, 'r', CUP_HOLD)
    }
  })
  // The walker, crossing the hall (frozen wherever `walker` holds him).
  const w = extra(d, 5)
  const wa = d.use(w)
  const wu = o.walker ?? (t * 0.05) % 1
  if ((o.advance?.(9) ?? 0) > 0.001) moveTo(wa, { x: 305.2, z: 5.6, yaw: FACE_W }, 9, P.STAND, false)
  else wa.walk(WALKER, wu, P.STAND)
  wa.lookAt(o.lx, o.lz, eyes(9))
  d.apply(w)
  // The coffee overflowing.
  const ov = o.overflow ?? 0
  if (ov > 0) {
    d.cen.cup.getWorldPosition(v)
    d.cen.stream.visible = true
    d.cen.stream.position.set(v.x + 0.03, v.y / 2 + 0.02, v.z + 0.02)
    d.cen.stream.scale.set(1, v.y / 0.9, 1)
    d.cen.spill.visible = true
    d.cen.spill.position.set(v.x + 0.05, 0.004, v.z + 0.05)
    d.cen.spill.scale.setScalar(0.1 + 0.9 * ov)
  }
}

/** The garden's calm visitors on the benches, each with a form. */
function gardenPeople(d: Director) {
  for (const [k, x, z] of [
    [0, 295, 26],
    [1, 305, 26],
    [3, 295, 36],
    [4, 305, 36],
  ] as const) {
    const p = extra(d, k)
    const a = d.use(p)
    a.place(x, z, x < 300 ? FACE_E : FACE_W)
    a.hold(SIT_FORM)
    d.apply(p)
  }
}

function boards(d: Director, glow: number) {
  d.cen.boardW.redraw((c, W, H) => drawBoard(c, W, H, BOARD[0] ?? '', BOARD[1] ?? '', 0), 'boardW')
  d.cen.boardE.redraw((c, W, H) => drawBoard(c, W, H, BOARD[2] ?? '', BOARD[3] ?? '', glow), `boardE:${Math.round(glow * 20)}`)
  d.cen.sign.redraw((c, W, H) => drawSign(c, W, H, SIGN[0] ?? '', SIGN[1] ?? ''), 'sign')
}

function doors(d: Director, open: number) {
  d.cen.doorL.position.x = 299.4 - 1.15 * open
  d.cen.doorR.position.x = 300.6 + 1.15 * open
}

export const actCentre: Act = (d, f, seg, u, shot) => {
  const t = f.time
  const cen = d.cen
  d.wear('jacket')
  switch (seg) {
    // ——— 06 MERKEZ ———
    case 'garden': {
      d.place('centre')
      light.centre(d, true)
      boards(d, 0)
      gardenPeople(d)
      cen.ripple.visible = true
      cen.ripple.scale.setScalar(1 + ((t * 0.5) % 1) * 4)
      ;(cen.ripple.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - ((t * 0.5) % 1))
      const a = d.use(d.levy)
      a.walk(GARDEN_WALK, S(0, 0.5, u), P.STAND, FACE_N, FACE_N)
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      d.cam([[0, [301.5, 1.7, 44.5, 300, 2.5, 25, 45]], [0.45, [301.4, 1.7, 36, 300, 2.2, 20, 45]], [0.47, [300, 2.0, 27, 300, 7, 15.05, 35]], [1, [300, 3.0, 24, 300, 7, 15.05, 35]]], u, shot)
      return true
    }
    case 'boards': {
      d.place('centre')
      light.centre(d, true)
      boards(d, S(0.68, 0.74, u))
      gardenPeople(d)
      const a = d.use(d.levy)
      a.place(300, 23.2, FACE_N)
      a.hold(P.STAND_EASY)
      const west = 1 - S(0.55, 0.62, u)
      a.lookAt(west > 0.5 ? 297.6 : 302.4, 21, 0.9)
      d.apply(d.levy)
      d.cam(
        [
          [0, [301.0, 1.8, 24.5, 300, 1.6, 21, 40]],
          [0.1, [301.0, 1.8, 24.5, 300, 1.6, 21, 40]],
          [0.1, [298.8, 1.6, 22.8, 297.6, 1.6, 21, 30]],
          [0.6, [298.8, 1.6, 22.8, 297.6, 1.6, 21, 30]],
          [0.6, [301.2, 1.6, 22.8, 302.4, 1.6, 21, 30]],
          [0.7, [301.2, 1.6, 22.8, 302.4, 1.6, 21, 30]],
          [1, [301.7, 1.6, 22.0, 302.4, 1.5, 21, 24]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'walking': {
      d.place('centre')
      light.centre(d, true)
      boards(d, 0)
      gardenPeople(d)
      doors(d, S(0.5, 0.9, u))
      const a = d.use(d.levy)
      a.walk(TO_DOORS, S(0, 1, u), P.STAND, FACE_N, FACE_N)
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      d.cam([[0, [300.6, 1.6, 23, 300, 1.4, 15, 40]], [1, [300.6, 1.6, 22, 300, 1.4, 15, 40]]], u, shot)
      return true
    }
    case 'hall': {
      d.place('centre')
      light.centre(d)
      cen.stairDoor.rotation.y = -0.26
      doors(d, 1 - S(0.15, 0.3, u))
      const a = d.use(d.levy)
      if (u < 0.3) a.walk(INTO_HALL, u / 0.3, P.STAND, FACE_N, FACE_N)
      else {
        a.place(303.5, 10.3, FACE_N)
        a.blend([[0.3, FUMBLE], [0.36, WAIT], [0.68, WAIT], [0.74, P.STAND]], u)
        if (u > 0.7) a.reach('r', S(0.7, 0.76, u), 303.5, 1.15, 9.4, 0.5)
      }
      if (u > 0.12 && u < 0.3) a.blend([[0.12, P.STAND], [0.18, FUMBLE]], u)
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      if (u > 0.7) {
        d.envelopeHand.mesh.visible = true
        d.hold(d.envelopeHand.mesh, d.levy, 'r', ENVELOPE_HOLD)
      }
      hallPeople(d, f, { lx: a.x, lz: a.z, name: u > 0.33, eyes: (k) => (k === 0 ? S(0.33, 0.38, u) : 0), walker: (0.1 + u * 0.4) % 1 })
      d.cam(
        [
          [0, [299.5, 2.2, 14, 303.5, 1.2, 8, 50]],
          [0.3, [299.8, 2.1, 13.6, 303.5, 1.2, 8, 50]],
          [0.3, [305.6, 1.55, 10.0, 303.4, 1.4, 8.6, 32]],
          [0.73, [305.5, 1.55, 10.0, 303.4, 1.4, 8.6, 32]],
          [0.73, [304.3, 1.4, 9.3, 303.5, 1.1, 9.2, 25]],
          [1, [304.3, 1.4, 9.3, 303.5, 1.1, 9.2, 25]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'floor': {
      d.place('centre')
      light.centre(d)
      cen.stairDoor.rotation.y = -0.26
      const a = d.use(d.levy)
      a.place(303.5, 10.3, FACE_N)
      a.hold(WAIT)
      const down = S(0.17, 0.22, u) * (1 - S(0.6, 0.64, u))
      d.bend(d.levy, 'neck', 0, 0.25 * down)
      d.bend(d.levy, 'head', 0, 0.45 * down)
      d.apply(d.levy)
      hallPeople(d, f, { lx: a.x, lz: a.z, name: true, eyes: (k) => (k === 0 ? 1 : 0), walker: (0.3 + u * 0.5) % 1 })
      d.cam(
        [
          [0, [301.8, 1.5, 9.6, 303.4, 1.45, 7.8, 30]],
          [0.17, [301.8, 1.5, 9.6, 303.4, 1.45, 7.8, 30]],
          [0.19, [299.4, 4.5, 12.5, 300, 0, 8, 50]],
          [0.3, [299.4, 4.5, 12.5, 300, 0, 8, 50]],
          [0.45, [308, 4.5, 14.0, 313, 0, 11, 50]],
          [0.46, [308, 4.5, 14.0, 313, 0, 11, 50]],
          [0.46, [300.5, 4.0, 6.0, 299.7, 0, 2, 45]],
          [0.6, [292, 2.5, 2.5, 285.1, 1.1, 0, 45]],
          [0.61, [292, 2.5, 2.5, 285.1, 1.1, 0, 45]],
          [0.61, [305.6, 1.55, 10.0, 303.4, 1.4, 8.6, 32]],
          [0.78, [305.5, 1.55, 10.0, 303.4, 1.4, 8.6, 32]],
          [0.8, [302.5, 1.5, 8.8, 303.5, 1.5, 7.75, 24]],
          [1, [302.5, 1.5, 8.8, 303.5, 1.5, 7.75, 24]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'choose': {
      d.place('centre')
      light.centre(d)
      cen.stairDoor.rotation.y = -0.26
      const a = d.use(d.levy)
      a.place(MARK.x, MARK.z, FACE_S)
      a.hold(P.STAND_EASY)
      d.apply(d.levy)
      hallPeople(d, f, { lx: a.x, lz: a.z, name: true, walker: (0.5 + u * 0.3) % 1 })
      d.cam([[0, [299.6, 1.7, 7.6, 300, 1.2, 15, 40]], [0.6, [299.6, 1.7, 7.6, 300, 1.2, 15, 40]], [0.76, [299.7, 1.8, 8.0, 299.9, 0, 10.4, 40]], [1, [299.7, 1.8, 8.0, 299.9, 0, 10.4, 40]]], u, shot)
      return true
    }
    // ——— 07 KIRMIZI ÇİZGİ ———
    case 'step': {
      d.place('centre')
      light.centre(d)
      cen.stairDoor.rotation.y = -0.26
      const blue = f.flags.has('line:blue')
      const a = d.use(d.levy)
      if (u < 0.1) {
        a.place(299.85, 10.0, FACE_S)
        a.hold(P.STAND_EASY)
      } else a.walk(STEP_WALK, (u - 0.1) / 0.9, P.STAND, FACE_S, FACE_N)
      if (blue) a.lookAt(300, 15.2, S(0.08, 0.14, u) * (1 - S(0.28, 0.36, u)))
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      hallPeople(d, f, { lx: a.x, lz: a.z, name: true, walker: (0.2 + u * 0.3) % 1 })
      if (u < 0.2) d.cam([[0, [299.2, 0.32, 9.2, 299.75, 0.05, 9.7, 30]], [0.2, [299.2, 0.32, 9.1, 299.75, 0.06, 9.6, 30]]], u, shot)
      else {
        shot.pos.set(297.4, 1.6, a.z + 1.6)
        shot.tgt.set(a.x, 1.35, a.z)
        shot.fov = 40
      }
      return true
    }
    case 'eyes': {
      d.place('centre')
      light.centre(d)
      cen.stairDoor.rotation.y = -0.26
      const a = d.use(d.levy)
      a.walk(EYES_WALK, Math.min(1, S(0.03, 0.54, u)), P.STAND, FACE_N, FACE_N)
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      const stop = S(0.52, 0.56, u)
      const ov = S(0.6, 0.98, u)
      const turnAt = [0.03, 0.12, 0.2, 0.28, 0.34, 0.4, 0.46, 0.44, 0.48, 0.5]
      hallPeople(d, f, {
        lx: a.x,
        lz: a.z,
        name: true,
        eyes: (k) => S(turnAt[k], turnAt[k] + 0.05, u),
        walker: Math.min(0.45 + u * 0.25, 0.45 + 0.54 * 0.25) * (1 - stop) + 0.585 * stop,
        overflow: ov,
      })
      d.cam(
        [
          [0, [301.5, 1.7, 7.0, 304, 1.4, 6, 50]],
          [0.5, [301.3, 1.7, 5.2, 304, 1.4, 5.5, 50]],
          [0.54, [301.3, 1.7, 5.2, 304, 1.4, 5.5, 50]],
          [0.54, [300.0, 2.0, -3.0, 300, 1.2, 5.0, 50]],
          [0.7, [300.0, 2.0, -3.0, 300, 1.2, 5.0, 50]],
          [0.7, [311.0, 1.3, 7.3, 311.5, 1.0, 6.4, 25]],
          [0.85, [311.0, 1.3, 7.3, 311.5, 1.0, 6.4, 25]],
          [0.85, [306.8, 0.5, 3.0, 305.4, 0.3, 5.3, 30]],
          [1, [306.8, 0.5, 3.0, 305.4, 0.3, 5.3, 30]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'run': {
      d.place('centre')
      light.centre(d)
      cen.stairDoor.rotation.y = -0.26 - 1.2 * S(0.9, 0.98, u)
      const a = d.use(d.levy)
      if (u < 0.51) a.walk(RUN_WALK_SLOW, S(0.03, 0.51, u), P.STAND, FACE_N, FACE_N)
      else a.walk(RUN_PATH, (u - 0.51) / 0.47, RUN, FACE_N, FACE_W, 1.3)
      d.apply(d.levy)
      d.steps(a.walking * (u > 0.51 ? 1.4 : 1), a.step)
      const run = u > 0.51
      hallPeople(d, f, {
        lx: a.x,
        lz: a.z,
        name: true,
        eyes: () => 1,
        advance: () => S(0.03, 0.5, u) * 0.35 + S(0.51, 0.98, u) * 0.55,
        run,
        walker: 0.585,
      })
      if (u < 0.5) d.cam([[0, [294, 5, 10, 300, 0.5, 2, 55]], [0.5, [294.5, 5, 9.5, 300, 0.5, 2, 55]]], u, shot)
      else {
        shot.pos.set(a.x + 2.6, 1.5, a.z + 1.0)
        shot.tgt.set(a.x - 1.5, 1.1, a.z - 0.1)
        shot.fov = 45
        shot.handheld = 1
      }
      return true
    }
    case 'silence': {
      d.place('stairs')
      light.stairs(d)
      cen.stairDoor.rotation.y = -1.4 * (1 - S(0, 0.04, u)) - 0.7 * S(0.82, 0.98, u)
      const a = d.use(d.levy)
      const turn = S(0.54, 0.6, u)
      a.place(284.45, 0.0, L(FACE_W, FACE_E, turn))
      a.blend([[0, BACK_TO_DOOR], [0.1, BACK_TO_DOOR], [0.25, HAND_CHEST], [0.52, HAND_CHEST], [0.6, P.STAND]], u)
      a.reach('r', S(0.56, 0.62, u), 285.0, 1.05, 0.4, 0.5)
      d.apply(d.levy)
      hallPeople(d, f, { lx: 303.5, lz: 10.3, name: true, walker: (0.1 + u * 0.3) % 1 })
      d.cam([[0, [281.4, 1.6, 1.4, 284.8, 1.3, 0, 40]], [0.59, [281.5, 1.6, 1.35, 284.8, 1.3, 0, 40]], [0.59, [283.9, 1.25, 0.9, 284.9, 1.05, 0.35, 25]], [1, [283.9, 1.25, 0.9, 284.9, 1.05, 0.35, 25]]], u, shot)
      return true
    }
    case 'normal': {
      d.place('stairs')
      light.stairs(d)
      cen.stairDoor.rotation.y = -0.7 * (1 - S(0.7, 0.9, u))
      const a = d.use(d.levy)
      a.place(284.6, 0.05, FACE_E)
      a.hold(P.STAND)
      a.reach('r', 1, 285.0, 1.05, 0.4, 0.5)
      d.apply(d.levy)
      hallPeople(d, f, { lx: a.x, lz: a.z, name: true, eyes: (k) => (k === 0 ? S(0.38, 0.44, u) : 0), walker: (0.3 + u * 0.3) % 1 })
      d.cam(
        [
          [0, [284.7, 1.6, 0.2, 300, 1.2, 6, 40]],
          [0.38, [284.7, 1.6, 0.2, 300, 1.2, 6, 40]],
          [0.38, [302.0, 1.5, 6.5, 303.4, 1.45, 7.8, 22]],
          [0.66, [302.0, 1.5, 6.5, 303.4, 1.45, 7.8, 22]],
          [0.66, [287, 1.5, 0.8, 285, 1.5, 0, 30]],
          [1, [287, 1.5, 0.8, 285, 1.5, 0, 30]],
        ],
        u,
        shot,
      )
      return true
    }
    case 'upstairs': {
      d.place('stairs')
      light.stairs(d)
      const a = d.use(d.levy)
      if (u < 0.3) {
        a.place(282.5, 1.6, FACE_N)
        a.hold(LOOK_UP)
      } else {
        a.walk(STAIR_PATH, S(0.3, 1, u), P.STAND, FACE_N, FACE_N, 0.9)
        a.y = stairY(a.z)
        a.lookAt(282.5, -6, 0.5)
        d.bend(d.levy, 'head', 0, -0.2)
      }
      d.apply(d.levy)
      d.steps(a.walking, a.step)
      d.cam(
        [
          [0, [283.7, 0.5, 1.8, 282.5, 4.5, -6, 45]],
          [0.4, [283.7, 0.5, 1.8, 282.5, 4.5, -6, 45]],
          [0.43, [282.9, 1.9, 1.7, 282.5, 2.6, -1.5, 40]],
          [1, [282.9, 3.7, -0.7, 282.5, 5.6, -5.5, 40]],
        ],
        u,
        shot,
      )
      return true
    }
    // ——— 11 GERİ SALIM: the lobby and the montage ———
    case 'lobby': {
      if (u < 0.5) {
        d.place('centre')
        light.centre(d)
        cen.stairDoor.rotation.y = -0.9 * S(0.02, 0.08, u) * (1 - S(0.15, 0.3, u))
        doors(d, S(0.42, 0.5, u))
        const a = d.use(d.levy)
        a.walk(LOBBY_PATH, S(0.05, 0.5, u), P.STAND, FACE_E, FACE_S)
        d.apply(d.levy)
        d.steps(a.walking, a.step)
        hallPeople(d, f, { lx: a.x, lz: a.z, name: false, walker: (0.2 + u * 0.6) % 1 })
        d.cam([[0, [304, 5.5, 13.5, 295, 0, 3, 55]], [0.5, [303, 5.5, 13.8, 298, 0, 6, 55]]], u, shot)
        return true
      }
      if (u < 0.67) {
        d.place('centre')
        light.centre(d, true)
        cen.ripple.visible = true
        cen.ripple.scale.setScalar(1 + ((t * 0.5) % 1) * 4)
        ;(cen.ripple.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - ((t * 0.5) % 1))
        gardenPeople(d)
        d.cam([[0.5, [302, 1.2, 33, 300, 0.3, 31, 35]], [0.67, [302.2, 1.2, 33, 300, 0.3, 31, 35]]], u, shot)
        return true
      }
      if (u < 0.84) {
        d.place('bus')
        light.bus(d)
        busInterior(d, f, 1, 0)
        d.cam([[0.67, [169.6, 1.3, -60.6, 170.5, 1.3, -61.3, 35]], [0.84, [169.7, 1.3, -60.6, 170.6, 1.3, -61.3, 35]]], u, shot)
        return true
      }
      d.place('office')
      light.office(d)
      archiveOffice(d, f, 'old')
      d.cam([[0.84, [200.5, 1.35, -2.4, 200, 1.15, -3.4, 28]], [1, [200.5, 1.35, -2.42, 200, 1.15, -3.4, 28]]], u, shot)
      return true
    }
    default:
      return false
  }
}
