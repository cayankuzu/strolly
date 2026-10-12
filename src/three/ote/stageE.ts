/**
 * Staging for the voyage: the ship from outside (F), the beach and the lounge
 * (E) through the years — the unfinished song, the window, the reports, the
 * scarf — and the arrival at the black hole.
 */
import * as THREE from 'three'
import { clamp, lerp, mulberry32, smoothstep } from '@/lib/math'
import { at, missionDay } from '@/stories/ote/timeline'
import * as P from '../figure/poses'
import { makePath } from '../figure/paths'
import { blendPose, makePose } from '../figure/Figure'
import type { Actor } from '../kit/direct'
import { E } from './habitat'
import { HAIR, POSES, setEyes, type CastId } from './cast'
import { drawBeacon, drawLog } from './draw'
import { env, face, hemi, point, pulse, show, spot, sunAt, toWorld, type Rig, type St } from './rig'
import { num } from './lang'

const PI = Math.PI
const v = new THREE.Vector3()
const w2 = new THREE.Vector3()

/** Reclining in a deckchair. */
const DECK = makePose({
  hipY: 0.36,
  hipZ: -0.06,
  lThigh: [-1.15, 0, 0.1],
  rThigh: [-1.1, 0, -0.1],
  lShin: [1.0, 0, 0],
  rShin: [1.1, 0, 0],
  lFoot: [0.15, 0, 0],
  rFoot: [0.15, 0, 0],
  spine: [-0.5, 0, 0],
  chest: [-0.08, 0, 0],
  neck: [0.15, 0, 0],
  head: [0.32, 0, 0],
  lUpper: [-0.2, 0, 0.25],
  rUpper: [-0.2, 0, -0.25],
  lFore: [-0.6, 0, 0],
  rFore: [-0.6, 0, 0],
})
/** Seated in the low armchair, knitting. */
const ARMCHAIR_KNIT = makePose({ hipY: 0.5, spine: [-0.06, 0, 0] }, POSES.SIT_KNIT)
/** On the sofa, a cup in the right hand. */
const SOFA_CUP = makePose({ rUpper: [-0.3, 0, -0.18], rFore: [-1.45, 0, 0], rHand: [0.2, 0, 0] }, POSES.SOFA_UP)
/** On the sofa, hands in the lap, calm. */
const SOFA_CALM = makePose({ spine: [-0.12, 0, 0], head: [0.02, 0, 0], lFore: [-0.95, 0.35, 0], rFore: [-0.95, -0.35, 0] }, POSES.SOFA_UP)
const STAND_LOOK = makePose({ head: [-0.05, 0, 0] }, P.STAND)
/** Looking up and out of a big window. */
const STAND_UP = makePose({ neck: [-0.06, 0, 0], head: [-0.1, 0, 0] }, P.STAND)

// ——— Clocks of the story ———

/** The Earth's apparent diameter (degrees) through the aft window: the story's clock in chapters 5–6. */
function earthDeg(st: St) {
  const { seg, u } = st
  if (seg === 'years') return lerp(26, 21, u / 0.43)
  if (seg === 'windows') {
    if (u < 0.5) return lerp(12, 6, smoothstep(0, 0.5, u))
    if (u < 0.75) return lerp(6, 1.1, smoothstep(0.5, 0.75, u))
    return lerp(1.1, 0.7, (u - 0.75) / 0.25)
  }
  if (seg === 'lastLook') return lerp(0.6, 0.2, smoothstep(0, 0.3, u))
  return 0
}
const D_YEARS = new THREE.Vector3(-0.14, -0.02, 1).normalize()
const D_HOLE = new THREE.Vector3(0, -0.012, -1).normalize()
/** Where the Earth is, behind the aft window: far enough to sit still, near enough to stay in the glass. */
const EARTH_AFT = new THREE.Vector3(306.98, 1.58, 12)
/** The palm that covers it (windows): in the line from the camera to the Earth. */
const PALM_CAM = new THREE.Vector3(306.84, 1.7, 2.74)

/** Age 0 (launch) … 1 (twelve years on). */
const ageAt = (p: number) => smoothstep(at('yearsPass', 0.08), at('yearsPass', 0.92), p)

// ——— People in the lounge ———

type Spot = readonly [number, number, number, boolean?]
/** The crowd at the aft window (facing +z), in the front rows; the named stand nearer the room. */
const AT_AFT: Spot[] = [
  [305.55, 3.55, 0.15],
  [306.05, 3.6, 0.1],
  [307.95, 3.58, -0.1],
  [308.45, 3.52, -0.15],
  [304.95, 3.45, 0.2],
  [308.95, 3.45, -0.2],
  [303.55, 3.55, 0.0],
  [304.05, 3.4, -0.15],
  [310.0, 3.55, 0.0],
  [310.5, 3.42, 0.2],
  [309.45, 3.2, -0.25],
  [304.4, 3.0, 0.25],
  [305.25, 2.95, 0.15],
  [308.75, 2.95, -0.15],
]
/** At the forward window (facing −z): the crowd in the front rows, nearest the glass. */
const AT_FWD: Spot[] = [
  [305.65, -5.3, PI + 0.12],
  [306.15, -5.4, PI + 0.05],
  [307.9, -5.38, PI - 0.08],
  [308.4, -5.28, PI - 0.15],
  [305.15, -5.05, PI + 0.2],
  [308.9, -5.05, PI - 0.2],
  [303.9, -5.2, PI + 0.3],
  [304.5, -5.0, PI + 0.25],
  [309.6, -5.15, PI - 0.3],
  [310.2, -4.95, PI - 0.35],
  [304.1, -4.4, PI + 0.3],
  [309.9, -4.4, PI - 0.3],
]
/** Around the lounge in the evening, kept to the far half of the room. */
const EVENING: Spot[] = [
  [310.65, -2.45, -2.4],
  [308.35, -3.35, 0.5],
  [302.95, -1.85, 1.3],
  [311.3, -0.55, -1.8],
  [305.6, -4.7, PI],
  [308.6, -4.85, PI + 0.3],
  [311.0, -3.55, -1.2],
  [303.45, -3.95, 0.6],
]
/** Settling in, the first days. */
const SETTLING: Spot[] = [
  [309.9, -2.6, -2.1],
  [308.1, -3.6, 0.8],
  [303.1, -2.0, 1.5],
  [311.2, -1.2, -1.5],
  [305.7, -4.5, 2.6],
  [310.6, 0.2, PI - 0.4],
]
/** Calm, around the lounge, at the end (far half of the room). */
const CALM: Spot[] = [
  [302.95, -2.3, 2.2],
  [310.65, -2.6, -2.2],
  [311.15, -0.2, -1.9],
  [308.1, -4.3, PI],
  [305.9, -4.55, PI],
  [306.95, -4.75, PI],
  [309.2, -4.0, PI - 0.3],
]

function seatSofa(a: Actor, x: number, pose = POSES.SOFA_UP) {
  a.place(x, 0.8, PI).hold(pose)
  return a
}

/** Y and his guitar on the stool; `play` 0…1 strums, `rest` lays it on his knee. */
function guitarist(r: Rig, st: St, play: number, rest: number, lastChord = 0) {
  const y = show(r, 'Y')
  const yaw = face(E.stool.x, E.stool.z, 304.8, 0.9)
  y.place(E.stool.x, E.stool.z - 0.05, yaw).hold(POSES.STOOL)
  const g = r.E.guitar
  g.visible = true
  toWorld(y, -0.04, 0.95 - rest * 0.05, 0.2, v)
  g.position.copy(v)
  g.rotation.set(0.12 * rest, yaw, 0.32 - rest * 0.18, 'YXZ')
  g.updateMatrixWorld()
  // Fretting hand on the neck; the strumming hand over the hole (still when he stops).
  const strum = play > 0 ? Math.sin(st.time * 18) * 0.035 * play : 0
  w2.set(0.48, 0.0, 0.05).applyMatrix4(g.matrixWorld)
  y.reach('l', 1, w2.x, w2.y, w2.z, 0.8)
  w2.set(0.06, 0.03 + strum + lastChord * -0.02, 0.09).applyMatrix4(g.matrixWorld)
  y.reach('r', 1, w2.x, w2.y, w2.z, 0.4)
  y.lookAt(304.8, 0.9, 0.4 * (1 - play) + 0.15)
  return y
}

/** W1 in her armchair, knitting; her lap for the knitting. */
function knitter(r: Rig, st: St, age: number) {
  const w = show(r, 'W1')
  const fx = Math.sin(E.armchair.yaw) * 0.05
  const fz = Math.cos(E.armchair.yaw) * 0.05
  w.place(E.armchair.x + fx, E.armchair.z + fz, E.armchair.yaw).hold(ARMCHAIR_KNIT)
  w.pose[2 + 1 * 3] += 0.06 * age
  const k = r.E.knit
  k.visible = true
  // Needles ticking.
  const tick = Math.sin(st.time * (st.seg === 'yearsPass' ? 30 : 7)) * 0.012
  toWorld(w, 0.0, 0.66 + tick, 0.33, v)
  k.position.copy(v)
  k.rotation.set(-0.9, w.yaw, 0, 'YXZ')
  toWorld(w, 0.09, 0.66 + tick, 0.33, v)
  w.reach('l', 1, v.x, v.y, v.z, 0.3)
  toWorld(w, -0.09, 0.66 - tick, 0.33, v)
  w.reach('r', 1, v.x, v.y, v.z, 0.3)
  const bag = r.E.bag
  bag.visible = true
  toWorld(w, 0.52, 0, 0.0, v)
  bag.position.copy(v)
  bag.rotation.y = w.yaw
  r.E.yarnBall.visible = true
  toWorld(w, 0.5, 0.36, 0.0, v)
  r.E.yarnBall.position.copy(v)
  return w
}

/** The ship from outside. */
export function stageShip(r: Rig, st: St) {
  const { seg, u } = st
  const F = r.F
  F.group.visible = true
  let fade = 1
  F.group.position.set(500, 0, 0)
  F.group.scale.setScalar(1)
  if (seg === 'horizon') {
    // The ship falls toward the dark; its lights reach the edge and are gone at 0.4.
    const k = smoothstep(0, 0.42, u)
    F.group.position.set(500, -1.5 * k, -lerp(0, 230, Math.pow(k, 1.6)))
    fade = 1 - smoothstep(0.3, 0.42, u)
    F.group.visible = u < 0.43
  }
  F.update(st.time, fade)
  const s = r.skyState
  s.stars = 1
  s.sun = seg === 'years' ? 1 : 0
  s.earth = seg === 'years' ? earthDeg(st) : 0
  s.earthDir.copy(D_YEARS)
  s.dotAlpha = 0
  s.hole = seg === 'years' ? 0 : seg === 'arrive' ? lerp(3.0, 3.6, u / 0.44) : lerp(3.8, 30, Math.pow(smoothstep(0.0, 1.0, u), 2.2))
  s.holeDir.copy(D_HOLE)
  s.holeGlow = 1
  s.shift = seg === 'horizon' ? 0.5 * smoothstep(0.3, 1, u) : 0
  s.ring = 0
  const L = r.lights
  if (seg === 'years') {
    sunAt(L, { x: 540, y: 14, z: -24 }, { x: 500, y: 0, z: 0 }, 0xfff6ea, 3.0, 30)
    hemi(L, 0x203048, 0x000000, 0.12)
    point(L, 0, 500, 0, 30, 0x5da9f0, 40, 60, 1.2)
  } else {
    // The ring's light, gold-white, from ahead.
    sunAt(L, { x: 500, y: 20, z: -300 }, { x: 500, y: 0, z: 0 }, 0xffd9a0, 2.8, 30)
    hemi(L, 0x3a2c20, 0x000000, 0.15)
  }
  env(r, 'moonless_golf', 0.05)
}

export function stageHabitat(r: Rig, st: St) {
  const { seg, u, p, time, flags } = st
  const H = r.E
  H.group.visible = true
  const beach = seg === 'beach'
  H.beach.visible = beach || seg === 'years'
  H.lounge.visible = !beach
  H.beachMat.uniforms.uTime.value = time
  const age = ageAt(p)
  // Ageing: hair greys, the couple whitens, his beard grows.
  const hair = r.cast.hair
  hair.M?.color.set(HAIR.M[0]).lerp(new THREE.Color(HAIR.M[1]), age)
  hair.W1?.color.set(HAIR.W1[0]).lerp(new THREE.Color(HAIR.W1[1]), age)
  hair.C1?.color.set(HAIR.C1[0]).lerp(new THREE.Color(HAIR.C1[1]), age)
  hair.C2?.color.set(HAIR.C2[0]).lerp(new THREE.Color(HAIR.C2[1]), age)
  const beard = r.cast.beard
  beard.visible = age > 0.15
  const bs = 0.105 * (0.97 + 0.07 * age)
  beard.scale.set(bs * 0.82, bs * 1.12, bs * 1.12)
  // The day counters.
  const day = missionDay(p)
  H.setDay(num(day), seg === 'yearsPass' ? smoothstep(0.05, 0.3, u) * (1 - smoothstep(0.85, 0.95, u)) : 0)
  // Things that only belong to some scenes.
  H.guitar.visible = false
  H.guitarCase.visible = false
  H.knit.visible = false
  H.yarnBall.visible = false
  H.bag.visible = false
  H.cup.visible = false
  H.watchProp.visible = false
  H.movingPiece.visible = false
  H.boothCamera.visible = true
  H.boothCamera.rotation.set(0, 0, 0)
  H.scarfOut.visible = false
  H.scarfCoil.visible = p >= at('arrive')
  H.pantryLeaf.rotation.y = seg === 'years' ? -1.6 * smoothstep(0.72, 0.82, u) : 0
  H.knitPiece.scale.set(1, 1, 1)
  H.fog.visible = false
  // The booth's screens.
  if (seg === 'dataLink') H.setBooth({ kind: 'link', t: time })
  else if (seg === 'report') H.setBooth(u < 0.6 ? { kind: 'report' } : { kind: 'sent', spin: time * 3 })
  else H.setBooth({ kind: 'idle' })
  if (seg === 'approach') {
    const sp = smoothstep(0.44, 0.68, u)
    H.setSide(`b${Math.floor(sp * 8)}|${Math.floor(time * (2 + sp * 20)) % 64}`, drawBeacon(sp * 1.4, time * (1.5 + sp * 40)))
  } else H.setSide('log', drawLog)
  const cr = r.crowd
  cr.group.visible = !beach
  const crowdAt = (spots: readonly Spot[], opts: { headDown?: number } = {}) => {
    for (let i = 0; i < cr.count; i++) {
      const s = spots[i]
      if (!s) cr.set(i, 0, 0, 0, { visible: false })
      else cr.set(i, s[0], s[1], s[2], { seated: !!s[3], headDown: opts.headDown ?? 0 })
    }
  }
  const sky = r.skyState
  sky.stars = 1
  sky.sun = 0
  sky.earth = 0
  sky.dotAlpha = 0
  sky.hole = 0
  sky.shift = 0
  sky.ring = 0
  sky.holeGlow = 1
  sky.holeDir.copy(D_HOLE)
  const L = r.lights
  const [la, lb, lc] = E.lamps
  // Evening amber lamps (scaled per scene).
  const lamps = (k: number, warm = 0xffc27a) => {
    point(L, 0, la[0], 1.55, la[1], warm, 6 * k, 6)
    point(L, 1, lb[0], 1.55, lb[1], warm, 6 * k, 6)
    point(L, 2, lc[0], 1.55, lc[1], warm, 5 * k, 5)
    H.lampShade.color.set(warm).multiplyScalar(0.35 + 1.1 * k)
  }
  const m = show(r, 'M')
  switch (seg) {
    case 'years': {
      // Settling in: the counter on the wall, the signs; the pantry door opens on its crates.
      seatSofa(m, 308.6).lookAt(302, 2.0, 0.6 * smoothstep(0.7, 0.8, u))
      knitter(r, st, 0)
      H.knitPiece.scale.set(1, 2.4, 1)
      const p1 = show(r, 'P1')
      const k = smoothstep(0.66, 0.74, u)
      p1.place(302.85, 2.55, -PI / 2 + 0.2).hold(P.STAND)
      p1.reach('r', k * (1 - smoothstep(0.84, 0.9, u)), 302.15, 1.0, 2.38, 0.4)
      show(r, 'S').place(311.0, -1.6, PI / 2).hold(STAND_LOOK).lookAt(312, -2, 0.8)
      show(r, 'C1').place(308.2, -1.0, -PI / 2 - 0.4).hold(P.STAND_EASY)
      show(r, 'C2').place(307.8, -1.35, -PI / 2 - 0.2).hold(P.STAND_EASY)
      seatSofa(show(r, 'H'), 305.45, SOFA_CALM)
      const y = show(r, 'Y').place(305.5, -1.75, 2.4).hold(P.STAND)
      H.guitarCase.visible = true
      y.apply(time, true)
      toWorld(y, 0, 0.62, -0.2, v)
      H.guitarCase.position.copy(v)
      H.guitarCase.rotation.set(0.08, y.yaw, 0.1, 'YXZ')
      seatSofa(show(r, 'P2'), 304.55, SOFA_CALM)
      crowdAt(SETTLING)
      lamps(0.85, 0xffe2b8)
      spot(L, { x: 307, y: 2.95, z: -0.5 }, { x: 307, y: 0, z: -0.5 }, 0xfff1dc, 14, 1.2, 0.9, 10)
      hemi(L, 0xfff3dc, 0x5a4a3a, 0.45)
      env(r, 'brown_photostudio_02', 0.35)
      break
    }
    case 'beach': {
      // The couple in the deckchairs, hand in hand; two at the water's edge.
      const c1 = show(r, 'C1').place(E.deckA.x, E.deckA.z + 0.08, PI).hold(DECK)
      const c2 = show(r, 'C2').place(E.deckB.x, E.deckB.z + 0.08, PI).hold(DECK)
      const hx = (E.deckA.x + E.deckB.x) / 2
      c1.reach('r', 1, hx - 0.02, 0.5, E.deckA.z - 0.08, 0.6)
      c2.reach('l', 1, hx + 0.02, 0.5, E.deckA.z - 0.08, 0.6)
      c1.lookAt(296, -6, 0.2)
      show(r, 'P2').place(294.4, -3.45, PI + 0.15).hold(P.STAND_EASY)
      show(r, 'P5').place(297.9, -3.3, PI - 0.2).hold(P.STAND)
      m.visible = false
      sunAt(L, { x: 301, y: 6, z: -12 }, { x: 296, y: 0, z: 0 }, 0xfff0d8, 3.4, 7)
      hemi(L, 0xbcd6f2, 0xd9c7a3, 0.9)
      env(r, 'kloofendal_48d_partly_cloudy_puresky', 0.7)
      break
    }
    case 'lounge': {
      // Evening: the song he never finishes; she waits for the last note.
      const stop = smoothstep(0.38, 0.42, u)
      guitarist(r, st, 1 - stop, smoothstep(0.42, 0.52, u))
      const h = seatSofa(show(r, 'H'), 304.55)
      h.lookAt(E.stool.x + 0.3, E.stool.z, 0.8)
      knitter(r, st, 0)
      H.knitPiece.scale.set(1, 5, 1)
      // Chess: S and P3; a piece set down at 0.6.
      const s = show(r, 'S').place(E.chess.x - 0.66, E.chess.z, PI / 2).hold(P.SIT_READ)
      show(r, 'P3').place(E.chess.x + 0.66, E.chess.z, -PI / 2).hold(P.SIT_BACK)
      const mv = smoothstep(0.5, 0.6, u)
      const px = lerp(E.chess.x - 0.08, E.chess.x + 0.03, mv)
      const pz = lerp(E.chess.z - 0.13, E.chess.z + 0.02, mv)
      H.movingPiece.visible = true
      H.movingPiece.position.set(px, 0.723 + 0.06 * Math.sin(mv * PI), pz)
      s.reach('r', pulse(0.42, 0.68, u), px, 0.76 + 0.06 * Math.sin(mv * PI), pz, 0.4)
      // He, on the other sofa, with a cup; the couple beside him.
      seatSofa(m, 308.6, SOFA_CUP)
      m.lookAt(E.stool.x, E.stool.z, 0.5)
      m.apply(time, true)
      m.figure.rGrip.getWorldPosition(v)
      H.cup.visible = true
      H.cup.position.set(v.x, v.y - 0.04, v.z)
      const c1 = seatSofa(show(r, 'C1'), 309.4, SOFA_CALM)
      c1.lookAt(E.stool.x, E.stool.z, 0.4)
      show(r, 'P6').place(310.4, -2.3, -2.6).hold(P.STAND_EASY).lookAt(E.chess.x, E.chess.z, 0.8)
      crowdAt(EVENING)
      lamps(1.15)
      spot(L, { x: 306.5, y: 2.95, z: 0.2 }, { x: 306, y: 0, z: -0.6 }, 0xffcf96, 11, 1.0, 0.9, 8)
      hemi(L, 0xffd9a8, 0x3a2a1c, 0.22)
      env(r, 'brown_photostudio_02', 0.26)
      break
    }
    case 'windows': {
      // Everyone at the aft window; Y raises a palm at arm's length (0.5), then a fingertip (0.75).
      const places: Array<[CastId, number, number, number]> = [
        ['M', 306.4, 3.32, 0.12],
        ['W1', 307.62, 3.38, -0.1],
        ['C1', 305.35, 3.05, 0.2],
        ['C2', 304.85, 3.1, 0.25],
        ['H', 308.4, 3.0, -0.2],
        ['S', 309.15, 2.75, -0.2],
        ['P1', 304.35, 2.55, 0.3],
        ['P3', 309.85, 2.9, -0.15],
        ['P5', 308.05, 2.45, -0.1],
        ['P6', 305.75, 2.5, 0.15],
      ]
      for (const [id, x, z, yaw] of places) (id === 'M' ? m : show(r, id)).place(x, z, yaw).hold(STAND_UP)
      const y = show(r, 'Y').place(307.12, 3.05, 0.02).hold(STAND_UP)
      const raise = smoothstep(0.42, 0.5, u) * (1 - smoothstep(0.92, 1, u))
      v.subVectors(EARTH_AFT, PALM_CAM).normalize()
      const reachD = u < 0.62 ? 0.74 : 0.8
      y.reach('r', raise, PALM_CAM.x + v.x * reachD, PALM_CAM.y + v.y * reachD - (u > 0.62 ? 0.04 : 0), PALM_CAM.z + v.z * reachD, 0.5)
      crowdAt(AT_AFT)
      lamps(0.22, 0xffb070)
      sky.earth = earthDeg(st)
      sky.earthAt = EARTH_AFT
      // A faint blue on the faces: the Earth's light through the aft window.
      sunAt(L, { x: 307.3, y: 2.0, z: 12 }, { x: 307, y: 1.3, z: 2.5 }, 0x86a8e8, 0.9, 6)
      spot(L, { x: 307, y: 2.9, z: -0.5 }, { x: 307, y: 0.6, z: 2.8 }, 0xffc890, 3.5, 1.0, 0.9, 9)
      hemi(L, 0x2a3550, 0x0a0806, 0.14)
      env(r, 'moonless_golf', 0.14)
      break
    }
    case 'lastLook': {
      const look = flags.has('look:open')
      const closed = flags.has('look:closed')
      // The others drift away; he stays, his forehead nearly on the glass.
      const close = smoothstep(0.0, 0.3, u)
      m.place(lerp(306.5, 306.86, close), lerp(3.3, 3.7, close), 0.0).hold(STAND_LOOK)
      blendPose(STAND_LOOK, POSES.GLASS_LEAN, smoothstep(0.1, 0.44, u) * 0.7 + smoothstep(0.46, 0.56, u) * 0.3, m.pose)
      m.reach('l', smoothstep(0.46, 0.56, u), 307.25, 1.52, 4.0, 0.6)
      const away: Array<[CastId, number, number, number, number, number]> = [
        ['W1', 307.62, 3.38, -0.1, 306.7, -1.9],
        ['Y', 307.12, 3.05, 0.02, 304.0, -1.0],
        ['C1', 305.35, 3.05, 0.2, 308.6, 0.2],
        ['C2', 304.85, 3.1, 0.25, 308.9, -0.2],
        ['H', 308.4, 3.0, -0.2, 305.0, 0.6],
      ]
      for (const [id, x, z, yaw, dx, dz] of away) {
        const k = smoothstep(0.02, 0.4, u)
        const a = show(r, id)
        a.place(lerp(x, dx, k), lerp(z, dz, k), lerp(yaw, face(x, z, dx, dz), smoothstep(0, 0.15, k)))
        if (k > 0.01 && k < 0.98) a.walk(makePath([[x, z], [dx, dz]]), k, P.STAND)
        else a.hold(P.STAND)
        a.visible = k < 0.98
      }
      const drift = smoothstep(0.0, 0.4, u)
      crowdAt(AT_AFT.map(([x, z, yaw]) => [lerp(x, x + (x - 307) * 0.4, drift), lerp(z, z - 5.5, drift), yaw + PI * smoothstep(0, 0.2, drift)] as const).slice(0, 10))
      // The dot: a point of light, then a pixel, then one star among the others.
      const deg = earthDeg(st)
      sky.earthAt = EARTH_AFT
      sky.earth = deg > 0.35 ? deg : 0
      sky.dotPx = u < 0.44 ? 9 : look ? lerp(9, 1.3, smoothstep(0.5, 0.65, u)) : 9
      sky.dotAlpha = deg > 0.35 ? 0 : look || !closed ? lerp(1, 0.4, smoothstep(0.66, 0.85, u)) : u < 0.5 ? 1 : 0
      if (closed) {
        setEyes(m.figure, smoothstep(0.45, 0.49, u) * (1 - smoothstep(0.73, 0.77, u)))
        r.veil.memory = smoothstep(0.5, 0.56, u) * (1 - smoothstep(0.66, 0.72, u)) * 0.3
      }
      lamps(0.1, 0xffb070)
      sunAt(L, { x: 307.3, y: 2.0, z: 12 }, { x: 307, y: 1.4, z: 3 }, 0x86a8e8, 0.7, 5)
      spot(L, { x: 305.4, y: 2.8, z: 2.0 }, { x: 306.85, y: 1.5, z: 3.85 }, 0xbfd0f0, 2.2, 0.55, 0.9, 5)
      hemi(L, 0x223050, 0x080605, 0.12)
      env(r, 'moonless_golf', 0.12)
      H.fog.visible = true
      H.fog.material.opacity = (0.06 + 0.08 * (0.5 + 0.5 * Math.sin(time * 1.2))) * smoothstep(0.3, 0.44, u) * (1 - smoothstep(0.7, 0.9, u))
      break
    }
    case 'dataLink': {
      // Weeks later. The booth, the flickering bar; a queue; the man in the suit at attention.
      const queue: Array<[CastId, number, number]> = [
        ['P1', 304.0, -4.25],
        ['P4', 304.6, -4.0],
        ['C1', 305.2, -3.75],
      ]
      const q = smoothstep(0.38, 0.48, u)
      const p2 = show(r, 'P2')
      // P2 reports first (0.45–0.62), then walks off.
      if (u < 0.44) p2.place(305.9, -2.6, -PI / 2).hold(P.STAND_EASY)
      else if (u < 0.63) p2.place(E.booth.x, E.booth.z + 0.22, PI).hold(P.STAND)
      else p2.place(lerp(E.booth.x, 304.8, smoothstep(0.63, 0.75, u)), lerp(E.booth.z + 0.22, -2.4, smoothstep(0.63, 0.75, u)), 0.6).hold(P.STAND)
      queue.forEach(([id, x, z]) => {
        const a = show(r, id)
        a.place(lerp(x + 1.2, x, q), lerp(z + 1.4, z, q), face(x, z, E.booth.x, E.booth.z)).hold(P.STAND_EASY)
        if (id === 'C1' && u > 0.86) {
          // A mock salute as S leaves.
          const k = pulse(0.86, 1.0, u)
          a.apply(time, true)
          toWorld(a, -0.07, 1.67, 0.1, v)
          a.reach('r', clamp(k * 1.4), v.x, v.y, v.z, 1)
        }
      })
      // S steps in, heels together, chin up.
      const s = show(r, 'S')
      const step = smoothstep(0.64, 0.72, u)
      const out = smoothstep(0.88, 0.98, u)
      if (u < 0.64) s.place(305.8, -3.5, -PI / 2 - 0.3).hold(P.STAND).lookAt(E.booth.x, E.booth.z, 0.4)
      else
        s.place(lerp(lerp(305.8, E.booth.x, step), 305.4, out), lerp(lerp(-3.5, E.booth.z + 0.22, step), -2.7, out), out > 0 ? lerp(PI, 1.0, out) : lerp(-PI / 2, -PI, step)).hold(u > 0.72 && out < 0.2 ? POSES.ATTENTION : P.STAND)
      seatSofa(m, 304.55, SOFA_CALM).lookAt(E.booth.x, E.booth.z, 0.4)
      seatSofa(show(r, 'C2'), 305.45, SOFA_CALM)
      crowdAt(CALM.slice(1))
      lamps(0.55, 0xffe0b8)
      point(L, 2, E.booth.x, 1.5, E.booth.z + 0.2, 0x9fc6ff, 1.4, 2.2)
      spot(L, { x: 305.2, y: 2.95, z: -2.6 }, { x: 303.6, y: 0.8, z: -4.4 }, 0xfff1dc, 12, 0.9, 0.9, 8)
      hemi(L, 0xfff3dc, 0x4a3a2a, 0.3)
      env(r, 'brown_photostudio_02', 0.3)
      break
    }
    case 'report': {
      const ans = flags.has('report:ok') ? 'ok' : flags.has('report:earth') ? 'earth' : flags.has('report:fear') ? 'fear' : 'none'
      stageReport(r, st, m, ans)
      crowdAt(CALM.slice(1))
      lamps(0.4, 0xffe0b8)
      point(L, 2, E.booth.x, 1.45, E.booth.z - 0.25, 0xbcd8ff, 2.4, 2.0)
      spot(L, { x: 303.9, y: 2.15, z: -3.9 }, { x: 303, y: 1.3, z: -5.0 }, 0xdfe8ff, 4, 0.8, 0.9, 3)
      hemi(L, 0xe8eef8, 0x3a3028, 0.25)
      env(r, 'brown_photostudio_02', 0.25)
      break
    }
    case 'yearsPass': {
      // Time-lapse: days and nights, people blurring past, the scarf growing out of the door.
      const cyc = Math.floor(u / 0.1)
      const day = 0.5 + 0.5 * Math.cos((u / 0.1) * PI * 2)
      knitter(r, st, age)
      H.knitPiece.scale.set(1, 1, 1)
      H.scarfOut.visible = true
      H.setScarf(lerp(1.2, 14, smoothstep(0.03, 0.97, u)))
      const rnd = mulberry32(100 + Math.floor(u * 40))
      for (let i = 0; i < cr.count; i++) {
        const show2 = rnd() < 0.5
        // Away from the scarf's path and the camera's corner.
        const x = 308.0 + rnd() * 3.5
        const z = -4.8 + rnd() * 2.4
        cr.set(i, x, z, rnd() * PI * 2, { visible: show2, seated: false })
      }
      // Who sits where changes with the days (never two on one seat).
      const seats = [304.55, 305.45, 308.6, 309.4]
      const seatOf = (k: number) => seats[(k + cyc) % 4]
      seatSofa(m, seatOf(0), SOFA_CALM)
      seatSofa(show(r, 'C1'), seatOf(1), SOFA_CALM)
      seatSofa(show(r, 'C2'), seatOf(2), SOFA_CALM)
      if (cyc % 2 === 0) guitarist(r, st, 0, 1)
      else show(r, 'Y').place(310.4, -2.4, -2.2).hold(P.STAND)
      lamps(0.3 + 0.75 * (1 - day), 0xffc27a)
      spot(L, { x: 307, y: 2.95, z: -0.5 }, { x: 307, y: 0, z: -0.5 }, 0xfff1dc, 18 * day + 2, 1.2, 0.9, 10)
      hemi(L, 0xfff3dc, 0x4a3a2a, 0.2 + 0.35 * day)
      env(r, 'brown_photostudio_02', 0.16 + 0.25 * day)
      break
    }
    case 'arrive':
    case 'approach':
    case 'drift':
    case 'song': {
      stageArrival(r, st, m)
      break
    }
  }
  r.motion.walking = m.walking
  r.motion.step = m.step
}

const LEAVE_BOOTH = makePath([
  [E.booth.x + 0.08, E.booth.z + 0.2],
  [302.55, -3.6],
])

/** The report, through the booth's own lens. Before the answer, every branch is the same. */
function stageReport(r: Rig, st: St, m: Actor, ans: 'ok' | 'earth' | 'fear' | 'none') {
  const { u } = st
  const H = r.E
  const into = smoothstep(0.0, 0.2, u)
  const bz = E.booth.z + 0.2
  // A hand's width right of the booth's axis, so the screen stays readable past his head from the left.
  const bx = E.booth.x + 0.08
  m.place(lerp(304.2, bx, into), lerp(-3.2, bz, into), lerp(-PI * 0.75, PI, smoothstep(0, 0.14, u))).hold(P.STAND)
  // His face, lit by the screen, toward the lens above it.
  if (u > 0.2) {
    m.pose[2 + 4 * 3] -= 0.12
  }
  // From 0.6 he steps out of the booth (the screen is left with its spinner).
  const leave = smoothstep(0.6, 0.7, u)
  if (ans === 'ok') {
    m.pose[2 + 4 * 3] += 0.32 * pulse(0.36, 0.46, u)
  } else if (ans === 'earth') {
    const turn = smoothstep(0.36, 0.5, u) * (1 - smoothstep(0.56, 0.62, u))
    const grab = pulse(0.32, 0.62, u)
    // He steps left of the lens line while he swings the arm, so the feed holds only the window and its stars.
    m.place(bx - 0.34 * grab, bz + 0.02 * grab, PI - 0.5 * grab)
    m.reach('r', clamp(grab * 1.4), E.boothCam.x - 0.03, E.boothCam.y - 0.02, E.boothCam.z + 0.06, 0.6)
    H.boothCamera.rotation.y = turn * Math.atan2(307 - 303, 4 - -5.36)
    m.lookAt(307, 4, 0.5 * turn)
  } else if (ans === 'fear') {
    // He leans in from where he stands (no step): the eyes come to a hand's width of the lens.
    const lean = smoothstep(0.36, 0.5, u) * (1 - leave)
    blendPose(P.STAND, POSES.GLASS_LEAN, lean * 0.8, m.pose)
    m.place(bx, bz + 0.1 * lean, PI)
    setEyes(m.figure, -lean)
  }
  if (leave > 0) {
    m.place(lerp(bx, 302.55, leave), lerp(bz, -3.6, leave), lerp(PI, -PI * 0.25, leave))
    if (leave < 1) m.walk(LEAVE_BOOTH, leave, P.STAND).place(lerp(bx, 302.55, leave), lerp(bz, -3.6, leave), lerp(PI, -PI * 0.25, leave))
    m.visible = leave < 0.95
  }
}

/** At the black hole: everyone at the forward window; the calm; the song. */
function stageArrival(r: Rig, st: St, m: Actor) {
  const { seg, u, flags } = st
  const H = r.E
  const L = r.lights
  const sky = r.skyState
  const cr = r.crowd
  const crowdAt = (spots: readonly Spot[]) => {
    for (let i = 0; i < cr.count; i++) {
      const s = spots[i]
      if (!s) cr.set(i, 0, 0, 0, { visible: false })
      else cr.set(i, s[0], s[1], s[2], { seated: !!s[3] })
    }
  }
  sky.hole = seg === 'arrive' ? 3.4 : seg === 'approach' ? 3.8 : seg === 'drift' ? 4.4 : 5.2
  sky.shift = seg === 'arrive' ? 0.18 * u : seg === 'approach' ? lerp(0.2, 0.75, smoothstep(0, 0.42, u)) + 0.12 * smoothstep(0.42, 1, u) : 0.965
  sky.ring = seg === 'drift' ? smoothstep(0.35, 0.65, u) : seg === 'song' ? 1 : 0
  const atWindow = seg === 'arrive' || (seg === 'approach' && u < 0.44)
  if (atWindow) {
    const places: Array<[CastId, number, number, number]> = [
      ['M', 306.65, -4.55, PI + 0.05],
      ['W1', 307.4, -4.6, PI - 0.05],
      ['Y', 308.0, -4.25, PI - 0.12],
      ['C1', 305.85, -4.2, PI + 0.15],
      ['C2', 306.3, -4.05, PI + 0.1],
      ['H', 307.75, -3.75, PI - 0.05],
      ['S', 305.4, -3.6, PI + 0.2],
      ['P1', 308.6, -3.55, PI - 0.25],
      ['P4', 304.9, -3.95, PI + 0.25],
      ['P2', 307.05, -3.5, PI],
      ['P5', 309.2, -4.1, PI - 0.3],
      ['P6', 304.6, -4.6, PI + 0.3],
    ]
    for (const [id, x, z, yaw] of places) (id === 'M' ? m : show(r, id)).place(x, z, yaw).hold(STAND_UP)
    crowdAt(AT_FWD)
  } else if (seg === 'approach') {
    // Calm faces, seated, lit by the ring; the counter that does not move.
    seatSofa(m, 304.55, SOFA_CALM)
    seatSofa(show(r, 'H'), 305.45, SOFA_CALM)
    seatSofa(show(r, 'C1'), 308.6, SOFA_CALM)
    seatSofa(show(r, 'C2'), 309.4, SOFA_CALM)
    knitter(r, st, 1)
    show(r, 'S').place(E.chess.x - 0.66, E.chess.z, PI / 2).hold(P.SIT_STRAIGHT)
    guitarist(r, st, 0, 1)
    crowdAt(CALM)
  } else {
    // drift and song
    show(r, 'S').place(E.chess.x - 0.66, E.chess.z, PI / 2).hold(P.SIT_BACK)
    H.watchProp.visible = true
    H.watchProp.position.set(E.chess.x + 0.12, 0.722, E.chess.z + 0.16)
    H.watchProp.rotation.y = 0.7
    const h = seatSofa(show(r, 'H'), 305.45, SOFA_CALM)
    const c1 = seatSofa(show(r, 'C1'), 308.6, SOFA_CALM)
    const c2 = seatSofa(show(r, 'C2'), 309.4, SOFA_CALM)
    c1.reach('l', 1, 309.0, 0.64, 0.58, 0.6)
    c2.reach('r', 1, 309.0, 0.64, 0.58, 0.6)
    const w = knitter(r, st, 1)
    if (seg === 'song') {
      const play = 1 - smoothstep(0.34, 0.38, u)
      guitarist(r, st, play, 0, smoothstep(0.34, 0.38, u))
      h.lookAt(E.stool.x, E.stool.z, 0.7)
      if (u > 0.38) setEyes(h.figure, smoothstep(0.38, 0.42, u))
      // The last stitch (0.5); she bites the yarn; both hands on the finished scarf.
      const bite = pulse(0.48, 0.58, u)
      w.pose[2 + 4 * 3] += 0.35 * bite
      w.pose[2 + 3 * 3] += 0.15 * bite
      if (u > 0.58) {
        r.E.knit.visible = false
        w.blend(
          [
            [0.58, POSES.SIT_KNIT],
            [0.68, P.SIT_STILL],
          ],
          u,
        )
      }
      seatSofa(m, 304.55, SOFA_CALM)
    } else {
      guitarist(r, st, 0, 1)
      seatSofa(show(r, 'P2'), 304.55, SOFA_CALM)
      // He stands by the aft window, his back to it; at 0.6 he turns and looks out.
      const turn = smoothstep(0.56, 0.66, u)
      m.place(306.85, 3.45 + 0.2 * turn, lerp(PI, 0.05, turn)).hold(STAND_LOOK)
      // Eyes wide, and kept open (look:closed).
      if (flags.has('look:closed') && u > 0.62) setEyes(m.figure, -smoothstep(0.62, 0.7, u))
    }
    crowdAt(CALM)
  }
  // ——— Light: the ring's gold-white through the forward window; the lounge lamps low ———
  const rise = seg === 'song' ? smoothstep(0.7, 1, u) : 0
  const sweep = Math.sin(st.p * 300) * 0.8
  sunAt(L, { x: 307 + sweep, y: 2.3, z: -14 }, { x: 307, y: 1.0, z: 1 }, 0xffdcaa, 4.5 + 8 * rise, 8)
  point(L, 0, 307, 1.6, -5.0, 0xffd49a, 9 + 40 * rise, 8)
  point(L, 1, E.lamps[0][0], 1.55, E.lamps[0][1], 0xffb46a, 1.8 * (1 - rise), 5)
  point(L, 2, E.lamps[1][0], 1.55, E.lamps[1][1], 0xffb46a, 1.8 * (1 - rise), 5)
  H.lampShade.color.set(0xffb46a).multiplyScalar(0.5)
  // The aft window's blue-white from behind them (approach, drift).
  const blue = seg === 'approach' ? smoothstep(0.1, 0.42, u) : seg === 'drift' ? 1 : 0
  spot(L, { x: 307, y: 1.8, z: 4.6 }, { x: 306.5, y: 1.0, z: 0.5 }, 0x9fb4ff, 3 * blue, 0.9, 0.9, 9)
  hemi(L, 0xffe2b8, 0x1a1410, 0.2 + 0.6 * rise)
  env(r, 'brown_photostudio_02', 0.22 + 0.5 * rise)
  r.veil.white = seg === 'song' ? smoothstep(0.84, 1.0, u) : 0
}
