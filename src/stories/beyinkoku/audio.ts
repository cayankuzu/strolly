/**
 * BEYİN-KÖKÜ's sound, against the twelve-chapter timeline.
 *
 * The real lab: a deep ventilation hum, the fluid pumps' slow pulse from the
 * atrium floor, relay clicks far above as the service lights blink, the
 * desk's electronics, keys, paper, a pen. The suburb: too-regular birdsong
 * (the same three phrases on a clock), sprinklers ticking on the lawns, a
 * distant mower, Bayan Elen's can, the bus (outside, then its cabin), the
 * archive's fluorescents and keyboards, the cantina's murmur and cutlery that
 * stop table by table (Tuesday) or all at once (chapter 11), a calm voice on
 * the television that steps down with the volume bar, crickets at dusk, a
 * doorbell twice, a kitchen clock. The Centre: a fountain, soft music, a chime
 * and an announcement, cool air, the murmur dimming as the eyes turn, coffee
 * spilling, footsteps multiplying on the glossy floor; then a steel door and
 * the stairwell's one bulb. The second floor: fluorescents that buzz with the
 * light and crackle when it stutters, a low dread under the creatures, voices
 * that tear, the hum room felt in the bones, a cuff, a speaker with Levy's own
 * voice, steps from both ends, a rattled handle, a scream cut short, a long
 * smear into silence. The stretcher room: tank bubbles, a vitals monitor, old
 * tape, five smells as five stings, a detuned drone under the black, screens
 * clicking off and the white swallowing every sound. The small room: a wall
 * clock, the veil re-woven as a fine sweep. Back in the lab: the strip turning
 * green, the pen, and at the very end one thin signal line and its blip.
 *
 * "Üç saniye." is a hard sonic cut: every bed switches in a few milliseconds,
 * a white crack opens the flash, the lab sounds only its lamp and its monitor,
 * and the way back is the same crack with the scene returning mid-phrase.
 *
 * All sounds are generated. Beds follow progress (pure functions of `p`);
 * one-shots fire only on forward crossings, never on jumps. Every CAPTION in
 * text.ts has its sound here.
 */
import { clamp, linear, smoothstep as S } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { TEXT } from './text'
import { at, local, SEG, segmentAt, type SegmentId } from './timeline'

type LayerId =
  // the real lab
  | 'vent'
  | 'pumps'
  | 'shaft'
  | 'desk'
  | 'lamp'
  | 'lamp32'
  | 'monitor'
  | 'signal'
  // the suburb, the archive, the cantina
  | 'air'
  | 'birds'
  | 'mower'
  | 'sprinkler'
  | 'can'
  | 'house'
  | 'kclock'
  | 'tv'
  | 'dusk'
  | 'busOut'
  | 'cabin'
  | 'office'
  | 'cantina'
  // the Centre
  | 'fountain'
  | 'garden'
  | 'music'
  | 'murmur'
  | 'hvac'
  | 'spill'
  | 'bulb'
  // the second floor
  | 'fluor'
  | 'dread'
  | 'hum35'
  | 'voices'
  | 'scream'
  // the stretcher room
  | 'groom'
  | 'tanks'
  | 'vitals'
  | 'tape'
  | 'drone'
  | 'whiteout'
  // the small room; Levy's breath
  | 'small'
  | 'wallclock'
  | 'weave'
  | 'breath'

type At = readonly [SegmentId, number]

const k = (p: number, v: number): Key<number> => [p, v, linear]
const s = (seg: SegmentId, u: number, v: number) => k(at(seg, u), v)
/** Keys sorted by progress (stable: keys at the same moment keep their order, so a pair makes a step). */
const track = (...items: Array<Key<number> | Key<number>[]>) => {
  const out: Key<number>[] = []
  for (const it of items) {
    if (typeof it[0] === 'number') out.push(it as Key<number>)
    else out.push(...(it as Key<number>[]))
  }
  return out.sort((a, b) => a[0] - b[0])
}
/** A step up at a moment (a cut into a place). */
const on = (seg: SegmentId, u: number, v: number) => [s(seg, u, 0), s(seg, u, v)]
/** A step down at a moment (a cut away). */
const off = (seg: SegmentId, u: number, v: number) => [s(seg, u, v), s(seg, u, 0)]
/** On between two moments, with hard edges. */
const hard = (a: At, b: At, v: number) => [...on(a[0], a[1], v), ...off(b[0], b[1], v)]

/** The real lab's flashes ("Üç saniye"), as [from, to]. */
const FLASHES: Array<[At, At]> = [
  [['lab1', 0], ['lab1', 1]],
  [['lab2', 0], ['lab2', 1]],
  [['lab3', 0], ['lab3', 1]],
  [['lab4', 0], ['lab4', 1]],
  [['hands', 0.35], ['hands', 0.65]],
  [['lab5', 0], ['lab5', 1]],
]
const flashes = (v: number) => FLASHES.flatMap(([a, b]) => hard(a, b, v))

/** The stretcher room is heard from `stretcher` to the white, except where the story cuts away. */
const G_GAPS: Array<[At, At]> = [
  [['lab3', 0], ['lab3', 1]],
  [['lab4', 0], ['lab4', 1]],
  [['cover', 0.5], ['cover', 0.7]],
  [['face', 0.32], ['face', 1]],
  [['hands', 0.35], ['hands', 0.65]],
  [['lab5', 0], ['lab5', 1]],
]
const inRoom = (v: number) => [
  ...on('stretcher', 0, v),
  ...G_GAPS.flatMap(([a, b]) => [...off(a[0], a[1], v), ...on(b[0], b[1], v)]),
  s('white', 0.56, v),
  s('white', 0.95, 0),
]

const MIX: Record<LayerId, Key<number>[]> = {
  // ——— The real lab ———
  vent: track(
    s('open', 0, 0.26),
    s('worlds', 1, 0.24),
    s('god', 0.1, 0.22),
    s('press', 0.75, 0.22),
    s('press', 1, 0),
    flashes(0.1),
    on('green', 0, 0.2),
    s('rings', 0.12, 0.22),
    s('rings', 0.4, 0.34),
    s('rings', 0.6, 0.34),
    s('rings', 0.61, 0.2),
    s('next', 1, 0.2),
    s('signal', 0.15, 0.05),
    s('signal', 1, 0.04),
  ),
  pumps: track(s('open', 0, 0.06), s('atrium', 0.55, 0.06), s('atrium', 0.7, 0.45), s('worlds', 1, 0.45), s('press', 0.75, 0.4), s('press', 1, 0), flashes(0.3), on('green', 0, 0.5), s('next', 1, 0.45), s('signal', 0.15, 0.3), s('signal', 1, 0.25)),
  shaft: track(s('open', 0, 0.6), s('worlds', 1, 0.6), s('god', 0.1, 0.35), s('press', 0.75, 0.3), s('press', 1, 0), on('green', 0, 0.3), s('rings', 0.12, 0.3), s('rings', 0.3, 0.75), s('rings', 0.6, 0.75), s('rings', 0.61, 0.3), s('next', 1, 0.3), s('signal', 0.15, 0)),
  desk: track(on('god', 0, 0.35), s('press', 0.75, 0.35), s('press', 1, 0), hard(['lab4', 0], ['lab4', 1], 0.3), hard(['lab5', 0], ['lab5', 1], 0.3), on('green', 0, 0.35), s('next', 1, 0.35), s('signal', 0.12, 0)),
  lamp: track(
    hard(['lab1', 0], ['lab1', 1], 0.45),
    hard(['lab2', 0], ['lab2', 1], 0.45),
    hard(['lab3', 0], ['lab3', 1], 0.45),
    hard(['lab4', 0], ['lab4', 1], 0.2),
    hard(['hands', 0.35], ['hands', 0.65], 0.45),
    hard(['lab5', 0], ['lab5', 1], 0.25),
  ),
  lamp32: track(on('next', 0.02, 0.3), s('signal', 0.15, 0)),
  monitor: track(on('god', 0, 0.35), s('press', 1, 0.35), s('wake', 0, 0), flashes(1), on('green', 0, 0.6), s('next', 1, 0.6), s('signal', 0.15, 0)),
  signal: track(s('signal', 0.04, 0), s('signal', 0.1, 0.16), s('signal', 0.42, 0.2), s('signal', 0.58, 0.07), s('signal', 1, 0.05)),

  // ——— The suburb ———
  air: track(
    s('wake', 0, 0.05),
    s('wake', 1, 0.06),
    s('filed', 0, 0.12),
    s('filed', 1, 0.12),
    s('mirror', 0, 0.04),
    s('mirror', 1, 0.04),
    s('elen', 0, 0.2),
    off('busstop', 1, 0.2),
    hard(['sameLight', 0], ['sameLight', 1], 0.04),
    hard(['again', 0], ['again', 1], 0.2),
    on('bell', 0, 0.02),
    s('bell', 0.42, 0.02),
    s('bell', 0.42, 0.14),
    s('bell', 1, 0.14),
    s('letter', 0, 0.03),
    s('shoes', 0.6, 0.03),
    s('shoes', 0.8, 0.16),
    s('empty', 0, 0.2),
    off('empty', 1, 0.2),
  ),
  birds: track(
    s('wake', 0.3, 0),
    s('wake', 0.4, 0.1),
    s('wake', 1, 0.1),
    s('filed', 0, 0.16),
    s('filed', 1, 0.16),
    s('mirror', 0, 0.05),
    s('mirror', 1, 0.05),
    s('elen', 0, 0.2),
    off('busstop', 1, 0.18),
    hard(['sameLight', 0], ['sameLight', 1], 0.05),
    hard(['again', 0], ['again', 1], 0.2),
    s('bell', 0.5, 0),
    s('bell', 0.62, 0.12),
    s('bell', 1, 0.12),
    s('letter', 0, 0.02),
    s('shoes', 0.6, 0.02),
    s('shoes', 0.8, 0.15),
    s('empty', 0, 0.18),
    off('empty', 1, 0.18),
  ),
  mower: track(on('elen', 0, 0.04), s('film', 1, 0.04), off('busstop', 1, 0.03), hard(['again', 0], ['again', 1], 0.04), hard(['empty', 0], ['empty', 1], 0.035)),
  sprinkler: track(hard(['filed', 0], ['filed', 1], 0.12), on('elen', 0, 0.5), off('busstop', 1, 0.5), hard(['again', 0], ['again', 1], 0.5), hard(['bell', 0.42], ['bell', 1], 0.4), s('shoes', 0.6, 0), s('shoes', 0.8, 0.3), s('empty', 0, 0.5), off('empty', 1, 0.5)),
  can: track(s('elen', 0.02, 0), s('elen', 0.06, 0.5), s('elen', 0.72, 0.5), s('elen', 0.75, 0), on('again', 0, 0.5), s('again', 0.21, 0.5), s('again', 0.24, 0)),
  house: track(
    s('wake', 0, 0.06),
    s('filed', 1, 0.06),
    s('mirror', 0, 0.09),
    off('mirror', 1, 0.09),
    hard(['sameLight', 0], ['sameLight', 1], 0.09),
    on('tv', 0, 0.05),
    off('thought', 1, 0.05),
    on('bell', 0, 0.08),
    s('bell', 0.42, 0.08),
    s('bell', 0.42, 0.05),
    s('bell', 1, 0.05),
    s('letter', 0, 0.09),
    s('heavy', 1, 0.09),
    s('shoes', 0, 0.07),
    s('shoes', 0.8, 0.04),
    off('shoes', 1, 0.04),
  ),
  kclock: track(on('letter', 0, 0.08), s('calendar', 1, 0.08), s('heavy', 0, 0.35), s('heavy', 0.15, 0.35), s('heavy', 0.4, 0.12), s('heavy', 1, 0.1), s('shoes', 0, 0.04), s('shoes', 0.6, 0)),
  tv: track(s('tv', 0.02, 0), s('tv', 0.06, 0.45), s('thought', 1, 0.45), s('bell', 0, 0)),
  dusk: track(on('tv', 0, 0.06), s('thought', 1, 0.08), s('bell', 0, 0)),
  busOut: track(s('busstop', 0.55, 0), s('busstop', 0.6, 0.35), s('busstop', 0.85, 0.35), off('busstop', 1, 0.3)),
  cabin: track(hard(['bus', 0], ['bus', 1], 0.35), hard(['lobby', 0.67], ['lobby', 0.84], 0.25)),
  office: track(hard(['archive', 0], ['archive', 1], 0.22), hard(['lobby', 0.84], ['lobby', 1], 0.2)),
  cantina: track(
    on('wave', 0, 0.32),
    s('wave', 0.05, 0.32),
    s('wave', 0.42, 0.03),
    s('wave', 0.58, 0.03),
    s('wave', 0.64, 0.32),
    off('why', 1, 0.32),
    on('cantina', 0, 0.32),
    off('cantina', 0.32, 0.32),
    on('cantina', 0.32, 0.04),
    off('cantina', 0.47, 0.04),
    on('cantina', 0.47, 0.32),
    off('window', 0.3, 0.32),
    s('window', 0.52, 0),
    s('window', 0.56, 0.32),
    off('window', 1, 0.32),
  ),

  // ——— The Centre ———
  fountain: track(on('garden', 0, 0.45), s('walking', 1, 0.45), s('hall', 0.15, 0.3), s('hall', 0.3, 0), hard(['choose', 0], ['choose', 1], 0.12), hard(['lobby', 0.5], ['lobby', 0.67], 0.5)),
  garden: track(on('garden', 0, 0.18), s('walking', 1, 0.18), s('hall', 0.15, 0.1), s('hall', 0.3, 0), s('lobby', 0.42, 0), s('lobby', 0.5, 0.12), off('lobby', 0.5, 0.12), hard(['lobby', 0.5], ['lobby', 0.67], 0.2)),
  music: track(
    s('walking', 0.5, 0),
    s('walking', 0.9, 0.06),
    s('hall', 0.3, 0.22),
    s('run', 1, 0.2),
    off('silence', 0.03, 0.2),
    on('normal', 0, 0.1),
    s('normal', 0.7, 0.1),
    s('normal', 0.9, 0),
    hard(['cover', 0.5], ['cover', 0.7], 0.12),
    on('lobby', 0, 0.2),
    off('lobby', 0.5, 0.2),
  ),
  murmur: track(
    s('hall', 0.15, 0),
    s('hall', 0.3, 0.2),
    s('eyes', 0.05, 0.2),
    s('eyes', 0.5, 0),
    on('normal', 0, 0.08),
    s('normal', 0.7, 0.08),
    s('normal', 0.9, 0),
    hard(['cover', 0.5], ['cover', 0.7], 0.08),
    on('lobby', 0, 0.15),
    off('lobby', 0.5, 0.15),
  ),
  hvac: track(s('hall', 0.15, 0), s('hall', 0.3, 0.14), s('run', 1, 0.14), off('silence', 0.03, 0.14), on('normal', 0, 0.05), s('normal', 0.9, 0), hard(['cover', 0.5], ['cover', 0.7], 0.06), on('lobby', 0, 0.12), off('lobby', 0.5, 0.12)),
  spill: track(s('eyes', 0.6, 0), s('eyes', 0.66, 0.45), off('eyes', 1, 0.45)),
  bulb: track(on('silence', 0.03, 0.22), off('upstairs', 1, 0.22)),

  // ——— The second floor ———
  fluor: track(
    on('slogans', 0, 0.2),
    off('cut', 1, 0.2),
    on('chase', 0, 0.2),
    s('chase', 1, 0.2),
    s('room', 0, 0.08),
    off('room', 1, 0.08),
    on('zoned', 0, 0.08),
    s('code', 0, 0.2),
    s('voice', 1, 0.2),
    s('swarm', 0, 0.2),
    s('swarm', 1, 0.2),
    s('nurse', 0, 0.14),
    s('fade', 0, 0.12),
    s('fade', 0.6, 0),
  ),
  dread: track(
    s('flicker', 0.4, 0),
    s('flicker', 0.46, 0.32),
    s('cut', 1, 0.38),
    s('lab1', 0, 0),
    s('swarm', 0.3, 0),
    s('swarm', 0.34, 0.32),
    s('swarm', 1, 0.32),
    s('nurse', 0, 0.25),
    s('nurse', 0.27, 0.25),
    s('nurse', 0.3, 0),
    s('nurse', 0.7, 0),
    s('nurse', 0.73, 0.42),
    s('nurse', 0.85, 0.42),
    s('nurse', 0.86, 0.15),
    s('fade', 0.6, 0.1),
    s('fade', 1, 0),
    s('face', 0.03, 0),
    s('face', 0.12, 0.3),
    off('face', 0.32, 0.3),
  ),
  hum35: track(s('room', 0.02, 0), s('room', 0.06, 0.42), off('room', 1, 0.42), on('zoned', 0, 0.32), s('zoned', 1, 0.25), s('code', 0.1, 0.1), s('code', 0.3, 0)),
  voices: track(
    s('staff', 0.5, 0),
    s('staff', 0.53, 0.16),
    s('staff', 0.98, 0.16),
    s('flicker', 0, 0),
    on('cut', 0, 0.12),
    s('cut', 0.5, 0.18),
    off('cut', 0.53, 0.18),
    on('chase', 0, 0.1),
    s('chase', 0.47, 0.1),
    s('chase', 0.5, 0.2),
    off('chase', 1, 0.2),
    s('swarm', 0.55, 0),
    s('swarm', 0.6, 0.26),
    s('swarm', 1, 0.26),
    s('nurse', 0, 0.15),
    s('nurse', 0.25, 0.12),
    s('nurse', 0.3, 0),
    s('nurse', 0.48, 0),
    s('nurse', 0.5, 0.14),
    s('nurse', 0.68, 0.14),
    s('nurse', 0.7, 0),
    on('fade', 0, 0.1),
    s('fade', 0.5, 0.06),
    s('fade', 0.8, 0),
  ),
  scream: track(hard(['nurse', 0.75], ['nurse', 0.85], 0.3)),

  // ——— The stretcher room ———
  groom: track(inRoom(0.13)),
  tanks: track(inRoom(0.35)),
  vitals: track(inRoom(0.3)),
  tape: track(
    s('libet', 0.02, 0),
    s('libet', 0.08, 0.3),
    s('libet', 1, 0.3),
    s('marks', 0, 0),
    s('fingers', 0.1, 0),
    s('fingers', 0.15, 0.25),
    s('narrator', 0.03, 0.25),
    s('narrator', 0.06, 0),
    hard(['bring', 0], ['bring', 1], 0.25),
    on('heavens', 0, 0.18),
    s('heavens', 0.44, 0.18),
    s('heavens', 0.47, 0.05),
    s('heavens', 0.64, 0.12),
    off('heavens', 1, 0.12),
    hard(['kitchen', 0], ['kitchen', 1], 0.2),
    on('log', 0.02, 0.15),
    s('log', 0.24, 0.15),
    s('log', 0.3, 0.04),
    off('log', 1, 0.04),
  ),
  drone: track(hard(['face', 0.32], ['face', 1], 0.42)),
  whiteout: track(s('white', 0.56, 0), s('white', 0.95, 0.22), s('white', 1, 0.18), s('smallroom', 0, 0.18), s('smallroom', 0.1, 0)),

  // ——— The small room; breath ———
  small: track(s('smallroom', 0, 0), s('smallroom', 0.08, 0.1), s('goodday', 0.4, 0.1), s('goodday', 0.45, 0.12), off('goodday', 1, 0.12)),
  wallclock: track(on('smallroom', 0.04, 0.3), off('goodday', 1, 0.3), hard(['cantina', 0.32], ['cantina', 0.47], 0.15)),
  weave: track(s('goodday', 0.03, 0), s('goodday', 0.08, 0.1), s('goodday', 0.35, 0.1), s('goodday', 0.42, 0)),
  breath: track(
    on('silence', 0.04, 0.3),
    s('silence', 0.55, 0.16),
    s('silence', 1, 0.1),
    s('normal', 0, 0.05),
    off('normal', 1, 0.04),
    on('zoned', 0, 0.34),
    s('zoned', 0.55, 0.18),
    off('zoned', 1, 0.14),
    on('nurse', 0.03, 0.22),
    s('nurse', 0.72, 0.26),
    s('nurse', 0.75, 0),
    on('fade', 0, 0.14),
    s('fade', 0.5, 0.08),
    s('fade', 0.9, 0),
    on('stretcher', 0, 0.16),
    s('stretcher', 0.5, 0.06),
    s('stretcher', 0.6, 0),
  ),
}

/** Moments where the picture cuts hard and every bed must switch at once. */
const CUTS: number[] = [
  ...FLASHES.flatMap(([a, b]) => [at(a[0], a[1]), at(b[0], b[1])]),
  at('face', 0.32),
  at('silence', 0.03),
  at('cover', 0.5),
  at('cover', 0.7),
  at('cantina', 0.32),
  at('cantina', 0.47),
  at('window', 0.3),
  at('nurse', 0.75),
  at('nurse', 0.85),
  ...[0, 1, 2, 3].map((i) => at('cut', 0.53 + i * 0.1125)),
]

/** The whole mix's lowpass: the stretched fade, the white, the grey memory inserts. */
function lowpass(p: number) {
  const ramp = (a: At, b: At, lo: number) => {
    const t = clamp((p - at(a[0], a[1])) / (at(b[0], b[1]) - at(a[0], a[1])))
    return 18000 * Math.pow(lo / 18000, t)
  }
  if (p >= at('fade', 0.1) && p < SEG.stretcher.start) return ramp(['fade', 0.1], ['fade', 0.95], 260)
  if (p >= at('white', 0.56) && p < SEG.smallroom.start) return ramp(['white', 0.56], ['white', 0.95], 650)
  if (p >= at('smallroom', 0) && p < at('smallroom', 0.1)) return 650 + 17350 * S(0, 0.1, local(p, 'smallroom'))
  if ((p >= at('cover', 0.5) && p < at('cover', 0.7)) || (p >= at('cantina', 0.32) && p < at('cantina', 0.47))) return 1500
  return 18000
}

/** The fluorescents' stutter on the second floor, when the scene does not tell us (no WebGL). */
const flickerT = (t: number) => (Math.sin(t * 23) * Math.sin(t * 7.1) > 0.15 ? 1 : 0.08)

/** The hall's polite music: four calm chords that resolve. */
const CHORDS = [
  [261.63, 329.63, 392.0],
  [220.0, 277.18, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 246.94, 293.66],
]
/** The suburb's birds: always the same three phrases, on the same clock. */
const PHRASES: Array<Array<[number, number, number, number]>> = [
  // [freq, to, decay, delay]
  [
    [2600, 3150, 0.07, 0],
    [3150, 2700, 0.07, 0.12],
    [2600, 3150, 0.07, 0.24],
  ],
  [
    [1900, 2450, 0.16, 0],
    [2450, 1800, 0.12, 0.22],
  ],
  [
    [3400, 3600, 0.035, 0],
    [3400, 3600, 0.035, 0.06],
    [3400, 3600, 0.035, 0.12],
    [3400, 3600, 0.035, 0.18],
    [3300, 2900, 0.08, 0.26],
  ],
]
const PHRASE_PAN = [-0.35, 0.3, 0.05]

const lines = (id: string) => TEXT.find((t) => t.id === id)?.lines ?? []
const LOG_LEN = lines('log-screen').length
const NOT_YOU = (lines('not-you')[0] ?? '').length
const PROTOCOL_LEN = lines('protocol').length

export function createBeyinKokuAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const layers = {} as Record<LayerId, GainNode>

  // Beds and one-shots pass one lowpass each (the fade, the white, the memory inserts).
  const bed = ctx.createGain()
  const bedLP = filter(ctx, 'lowpass', 18000, 0.5)
  bed.connect(bedLP).connect(kit.out)
  const fx = ctx.createGain()
  const fxLP = filter(ctx, 'lowpass', 18000, 0.5)
  fx.connect(fxLP).connect(kit.fx)
  // A long wet send for the atrium, the stairwell and the second floor.
  const big = ctx.createGain()
  big.gain.value = 0.9
  big.connect(kit.verb)
  const hall = ctx.createGain()
  hall.connect(fx)
  hall.connect(big)
  const layer = (id: LayerId, send = 0) => {
    const g = ctx.createGain()
    g.gain.value = 0
    g.connect(bed)
    if (send > 0) {
      const sg = ctx.createGain()
      sg.gain.value = send
      g.connect(sg).connect(kit.verb)
    }
    layers[id] = g
    return g
  }
  const spot = (id: LayerId, x: number, y: number, z: number, opts: Parameters<AudioKit['spatial']>[3] = {}) => {
    const sp = kit.spatial(x, y, z, opts)
    layers[id] = sp.gain
    return sp
  }
  const noiseInto = (buffer: AudioBuffer, f: BiquadFilterNode, dest: AudioNode, gain = 1, rate = 1) => {
    kit.loop(buffer, f, rate)
    const g = ctx.createGain()
    g.gain.value = gain
    f.connect(g).connect(dest)
    return g
  }

  // ——— The real lab ———
  const vent = layer('vent', 0.15)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 120), vent, 1, 0.6)
  kit.osc('sine', 41, vent, 0.15)
  const ventHi = kit.osc('sine', 82, vent, 0.05)
  kit.lfo(ventHi.g.gain, 0.07, 0.03)
  // The pumps: one slow pulse shared by a low tone and a wash of fluid noise.
  const pumps = spot('pumps', 0, 0.6, -20, { ref: 6, rolloff: 1, send: 0.3 })
  const pulse = ctx.createGain()
  pulse.gain.value = 0.55
  pulse.connect(pumps.gain)
  kit.lfo(pulse.gain, 0.42, 0.45)
  kit.osc('sine', 52, pulse, 0.5)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 420, 0.8), pulse, 0.6, 0.7)
  // The shaft: relay clicks far above (a clock fires them into this place).
  const shaft = spot('shaft', 0, 32, -20, { ref: 10, rolloff: 0.6, send: 0.6 })
  noiseInto(noise.pink, filter(ctx, 'lowpass', 300), shaft.gain, 0.06, 0.4)
  // The desk: electronics, fans, a high whine.
  const desk = spot('desk', 0, 1.25, -3.55, { ref: 1.5, rolloff: 1 })
  kit.osc('sine', 120, desk.gain, 0.04)
  kit.osc('sine', 15600, desk.gain, 0.004)
  noiseInto(noise.white, filter(ctx, 'bandpass', 3200, 0.7), desk.gain, 0.05)
  // The surgical lamp: a hard mains buzz.
  const lamp = spot('lamp', 0, 3.0, -6.4, { ref: 2.5, rolloff: 0.8 })
  const lampF = filter(ctx, 'bandpass', 2400, 3)
  kit.osc('sawtooth', 100, lampF, 0.4)
  lampF.connect(lamp.gain)
  kit.osc('sine', 100, lamp.gain, 0.12)
  const lamp32 = spot('lamp32', -2.6, 3.0, -6.6, { ref: 2.5, rolloff: 0.8 })
  const lamp32F = filter(ctx, 'bandpass', 2100, 3)
  kit.osc('sawtooth', 100, lamp32F, 0.3)
  lamp32F.connect(lamp32.gain)
  // Station 31's monitor (its beeps come from a clock).
  const monitor = spot('monitor', -0.9, 1.7, -6.6, { ref: 2, rolloff: 0.7 })
  // The last thing: one thin line.
  const signalL = layer('signal', 0.2)
  const sig = kit.osc('sine', 220, signalL, 0.5)
  const sig2 = kit.osc('sine', 440, signalL, 0.08)

  // ——— The suburb ———
  const air = layer('air', 0.05)
  const airG = noiseInto(noise.pink, filter(ctx, 'bandpass', 900, 0.4), air, 0.8, 0.8)
  kit.lfo(airG.gain, 0.09, 0.25)
  const birds = layer('birds', 0.25)
  const mower = layer('mower', 0.1)
  const mowerF = filter(ctx, 'bandpass', 520, 1.2)
  kit.osc('sawtooth', 94, mowerF, 0.3)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 600), mowerF, 0.4)
  const mowerG = ctx.createGain()
  mowerG.gain.value = 0.7
  mowerF.connect(mowerG).connect(mower)
  kit.lfo(mowerG.gain, 0.17, 0.3)
  const sprinkler = spot('sprinkler', 95.5, 0.2, 7.4, { ref: 3, rolloff: 1, send: 0.1 })
  const can = spot('can', 98.6, 0.5, 21.3, { ref: 3, rolloff: 1 })
  const canG = noiseInto(noise.white, filter(ctx, 'bandpass', 3400, 0.9), can.gain, 0.6)
  kit.lfo(canG.gain, 7, 0.2)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 900, 1), can.gain, 0.25)
  // Elen herself (her laugh), always on: the beds decide nothing here.
  const elen = kit.spatial(98.6, 1.5, 21.5, { ref: 3, rolloff: 1 })
  elen.gain.gain.value = 1
  const house = layer('house')
  kit.osc('sine', 50, house, 0.12)
  noiseInto(noise.pink, filter(ctx, 'lowpass', 500), house, 0.4, 0.7)
  const kclock = spot('kclock', 96.05, 2.0, -0.8, { ref: 1.2, rolloff: 1 })
  // The television: a calm voice (syllables from a clock) through the set's small speaker.
  const tvSpot = spot('tv', 103.5, 1.45, -0.9, { ref: 2, rolloff: 1, send: 0.05 })
  const tvVol = ctx.createGain()
  tvVol.gain.value = 1
  tvVol.connect(tvSpot.gain)
  const tvIn = ctx.createGain()
  const tvO = kit.osc('sawtooth', 108, tvIn, 0.5)
  const tvF1 = filter(ctx, 'bandpass', 600, 6)
  const tvF2 = filter(ctx, 'bandpass', 1300, 8)
  const tvSyl = ctx.createGain()
  tvSyl.gain.value = 0
  tvIn.connect(tvF1).connect(tvSyl)
  tvIn.connect(tvF2).connect(tvSyl)
  const tvBand = filter(ctx, 'highpass', 220)
  tvSyl.connect(tvBand).connect(tvVol)
  // Dusk: crickets beyond the window.
  const dusk = layer('dusk', 0.1)
  const crickets = noiseInto(noise.white, filter(ctx, 'bandpass', 4700, 14), dusk, 1.4)
  kit.lfo(crickets.gain, 23, 1.2)
  noiseInto(noise.pink, filter(ctx, 'lowpass', 400), dusk, 0.2)
  // The bus: outside (it moves), and its cabin.
  const busOut = spot('busOut', 170, 0.6, 13.45, { ref: 4, rolloff: 1, send: 0.05 })
  const busF = filter(ctx, 'lowpass', 220)
  kit.osc('sawtooth', 36, busF, 0.3)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 300), busF, 0.6)
  busF.connect(busOut.gain)
  const cabin = layer('cabin')
  const cabF = filter(ctx, 'lowpass', 160)
  kit.osc('sawtooth', 42, cabF, 0.25)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 200), cabF, 0.8)
  cabF.connect(cabin)
  const rattle = noiseInto(noise.white, filter(ctx, 'bandpass', 2100, 2), cabin, 0.06)
  kit.lfo(rattle.gain, 9, 0.05)
  // The archive basement: fluorescent hum, air.
  const office = layer('office', 0.05)
  kit.osc('sine', 120, office, 0.05)
  kit.osc('sine', 9000, office, 0.0025)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 300), office, 0.5, 0.7)
  // The cantina's murmur (cutlery comes from a clock into the same place).
  const cantina = layer('cantina', 0.15)
  const muG = noiseInto(noise.pink, filter(ctx, 'bandpass', 460, 1.3), cantina, 1.1, 1.05)
  kit.lfo(muG.gain, 2.3, 0.35)
  const mu2 = noiseInto(noise.pink, filter(ctx, 'bandpass', 950, 1.8), cantina, 0.5, 0.95)
  kit.lfo(mu2.gain, 1.7, 0.25)

  // ——— The Centre ———
  const fountain = spot('fountain', 300, 0.5, 31, { ref: 3, rolloff: 1, send: 0.1 })
  const fG = noiseInto(noise.white, filter(ctx, 'bandpass', 2400, 0.6), fountain.gain, 0.5)
  kit.lfo(fG.gain, 0.6, 0.12)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 700, 0.8), fountain.gain, 0.4)
  const garden = layer('garden', 0.1)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 1100, 0.5), garden, 0.5, 0.9)
  const musicSpot = spot('music', 300, 6.6, 6, { ref: 6, rolloff: 0.6, send: 0.35, category: 'music' })
  const musicF = filter(ctx, 'lowpass', 1500)
  musicF.connect(musicSpot.gain)
  const mVoices = CHORDS[0].map((f, i) => kit.osc(i === 1 ? 'triangle' : 'sine', f, musicF, 0.07))
  const murmur = layer('murmur', 0.3)
  const hmG = noiseInto(noise.pink, filter(ctx, 'bandpass', 500, 1.1), murmur, 1, 1.02)
  kit.lfo(hmG.gain, 1.9, 0.3)
  const hvac = layer('hvac', 0.1)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 1500, 0.5), hvac, 0.35, 0.9)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 220), hvac, 0.5, 0.8)
  const spill = spot('spill', 311.5, 0.6, 6.6, { ref: 1.5, rolloff: 1 })
  const spG = noiseInto(noise.white, filter(ctx, 'bandpass', 1800, 1.2), spill.gain, 0.5)
  kit.lfo(spG.gain, 11, 0.25)
  const bulb = spot('bulb', 282, 6.35, -0.5, { ref: 2, rolloff: 0.6, send: 0.3 })
  const bulbF = filter(ctx, 'bandpass', 1100, 2)
  kit.osc('sawtooth', 100, bulbF, 0.25)
  bulbF.connect(bulb.gain)
  kit.osc('sine', 50, bulb.gain, 0.06)

  // ——— The second floor ———
  const fluor = layer('fluor', 0.2)
  const fluorF = filter(ctx, 'bandpass', 1300, 1.5)
  kit.osc('sawtooth', 100, fluorF, 0.35)
  kit.osc('sawtooth', 120, fluorF, 0.12)
  const fluorG = ctx.createGain()
  fluorG.gain.value = 1
  fluorF.connect(fluorG).connect(fluor)
  kit.osc('sine', 8200, fluorG, 0.006)
  const dread = layer('dread', 0.4)
  const dreadF = filter(ctx, 'lowpass', 140)
  kit.osc('sawtooth', 38, dreadF, 0.26)
  kit.osc('sawtooth', 38.7, dreadF, 0.26)
  kit.osc('sine', 31, dread, 0.28)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 90), dreadF, 0.8, 0.6)
  dreadF.connect(dread)
  const hum35 = layer('hum35')
  const humG = ctx.createGain()
  humG.gain.value = 0.8
  humG.connect(hum35)
  kit.osc('sine', 35, humG, 0.45)
  kit.osc('sine', 70, humG, 0.12)
  kit.lfo(humG.gain, 5.5, 0.18)
  // Voices: a sawtooth through two formants, cut into syllables; `torn` adds a clipped, pitched-down copy.
  const voices = layer('voices', 0.25)
  const vIn = ctx.createGain()
  const vO = kit.osc('sawtooth', 200, vIn, 0.5)
  const vSub = kit.osc('square', 100, ctx.createGain(), 0.3)
  const shaper = ctx.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = Math.tanh(x * 6) * 0.8
  }
  shaper.curve = curve
  const dry = ctx.createGain()
  const torn = ctx.createGain()
  torn.gain.value = 0
  vSub.g.disconnect()
  vSub.g.connect(torn)
  vIn.connect(dry)
  vIn.connect(shaper).connect(torn)
  const vF1 = filter(ctx, 'bandpass', 560, 6)
  const vF2 = filter(ctx, 'bandpass', 1450, 8)
  const vSyl = ctx.createGain()
  vSyl.gain.value = 0
  for (const src of [dry, torn]) {
    src.connect(vF1)
    src.connect(vF2)
  }
  vF1.connect(vSyl)
  vF2.connect(vSyl)
  vSyl.connect(voices)
  const scream = layer('scream', 0.4)
  const scIn = ctx.createGain()
  kit.osc('sawtooth', 340, scIn, 0.4)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 1600, 2), scIn, 0.5)
  const scF = filter(ctx, 'bandpass', 1100, 3)
  scIn.connect(scF).connect(scream)
  // The kiosk's speaker (Levy's own voice), and the steps of the swarm from both ends.
  const kiosk = kit.spatial(398.9, 1.3, -32, { ref: 1.5, rolloff: 1, send: 0.1 })
  kiosk.gain.gain.value = 1
  const swarmS = kit.spatial(400, 0.1, -17, { ref: 3, rolloff: 1, send: 0.3 })
  swarmS.gain.gain.value = 1
  const swarmE = kit.spatial(402, 0.1, -20.3, { ref: 3, rolloff: 1, send: 0.3 })
  swarmE.gain.gain.value = 1

  // ——— The stretcher room ———
  const groom = layer('groom', 0.2)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 160), groom, 0.8, 0.6)
  kit.osc('sine', 55, groom, 0.08)
  kit.osc('sine', 15500, groom, 0.004)
  const tanks = spot('tanks', 490.5, 1.0, -5.5, { ref: 3, rolloff: 0.8, send: 0.2 })
  kit.osc('sine', 48, tanks.gain, 0.1)
  noiseInto(noise.pink, filter(ctx, 'bandpass', 300, 1), tanks.gain, 0.15, 0.6)
  const vitals = spot('vitals', 500.45, 1.25, 2.25, { ref: 1.5, rolloff: 1 })
  const tapeSpot = spot('tape', 496.2, 2.8, -4.6, { ref: 3, rolloff: 0.8, send: 0.15 })
  noiseInto(noise.white, filter(ctx, 'highpass', 3500), tapeSpot.gain, 0.15)
  const flutter = noiseInto(noise.pink, filter(ctx, 'bandpass', 900, 1.5), tapeSpot.gain, 0.12, 0.8)
  kit.lfo(flutter.gain, 4.3, 0.08)
  const drone = layer('drone', 0.4)
  const droneF = filter(ctx, 'lowpass', 240)
  kit.osc('sawtooth', 41, droneF, 0.3)
  kit.osc('sawtooth', 41.9, droneF, 0.3)
  kit.osc('sawtooth', 62.3, droneF, 0.15)
  noiseInto(noise.brown, filter(ctx, 'lowpass', 120), droneF, 0.6, 0.5)
  droneF.connect(drone)
  const whiteout = layer('whiteout', 0.3)
  noiseInto(noise.white, filter(ctx, 'bandpass', 5200, 0.4), whiteout, 0.5)
  kit.osc('sine', 3950, whiteout, 0.02)

  // ——— The small room; breath ———
  const small = layer('small', 0.05)
  noiseInto(noise.pink, filter(ctx, 'lowpass', 700), small, 0.6, 0.8)
  const wallclock = spot('wallclock', 600, 2.05, -2.95, { ref: 1.5, rolloff: 1 })
  const weave = layer('weave', 0.3)
  const weaveF = filter(ctx, 'bandpass', 8000, 9)
  noiseInto(noise.white, weaveF, weave, 1.6)
  const breath = layer('breath')
  const brF = filter(ctx, 'bandpass', 520, 0.6)
  kit.loop(noise.pink, brF, 0.7)
  const brG = ctx.createGain()
  brG.gain.value = 0
  brF.connect(brG).connect(breath)

  // ——— One-shot makers ———
  const click = (freq: number, peak: number, decay = 0.03, out: AudioNode = fx, pan = 0) => burst(ctx, noise.white, out, { freq, q: 2.5, env: { attack: 0.001, decay, peak }, pan })
  const thud = (peak: number, out: AudioNode = fx, freq = 150) => {
    burst(ctx, noise.brown, out, { freq, type: 'lowpass', env: { attack: 0.004, decay: 0.3, peak } })
    tone(ctx, out, { freq: 70, to: 42, glide: 0.3, env: { attack: 0.003, decay: 0.35, peak: peak * 0.45 } })
  }
  const beep = (f: number, peak: number, len = 0.1, out: AudioNode = fx, type: OscillatorType = 'sine') => tone(ctx, out, { freq: f, type, env: { attack: 0.003, decay: len, peak } })
  const key = (peak = 0.05, out: AudioNode = fx) => {
    burst(ctx, noise.white, out, { freq: 2400 + Math.random() * 1600, q: 2, env: { attack: 0.001, decay: 0.025, peak }, pan: Math.random() * 0.4 - 0.2 })
    burst(ctx, noise.brown, out, { freq: 400, type: 'lowpass', env: { attack: 0.001, decay: 0.03, peak: peak * 0.6 } })
  }
  const page = (peak = 0.08) => {
    burst(ctx, noise.pink, fx, { freq: 2600, q: 0.6, env: { attack: 0.03, decay: 0.25, peak } })
    burst(ctx, noise.white, fx, { freq: 5200, q: 1, env: { attack: 0.01, decay: 0.08, peak: peak * 0.4 } })
  }
  const scratch = (peak = 0.03) => burst(ctx, noise.white, fx, { freq: 3800 + Math.random() * 1800, q: 3, env: { attack: 0.01, decay: 0.05 + Math.random() * 0.06, peak } })
  const swish = (peak: number, len: number, freq = 1400) => burst(ctx, noise.pink, fx, { freq, q: 0.6, env: { attack: len * 0.4, decay: len, peak } })
  const hiss = (peak: number, len: number, freq = 4200) => burst(ctx, noise.white, fx, { freq, q: 0.5, env: { attack: 0.01, decay: len, peak } })
  const metal = (peak: number, f0 = 2300, out: AudioNode = fx) => {
    for (const [m, d] of [
      [1, 0.5],
      [2.76, 0.3],
      [5.4, 0.18],
    ] as const)
      tone(ctx, out, { freq: f0 * m, type: 'triangle', env: { attack: 0.001, decay: d, peak: peak / m } })
    click(5200, peak * 0.5, 0.02, out)
  }
  const chime = (a: number, b: number, peak: number, out: AudioNode = fx) => {
    tone(ctx, out, { freq: a, env: { attack: 0.005, decay: 0.9, peak } })
    tone(ctx, out, { freq: b, env: { attack: 0.005, decay: 1.1, peak: peak * 0.8 }, delay: 0.22 })
  }
  const latch = (peak = 0.1) => {
    click(1500, peak, 0.05)
    burst(ctx, noise.brown, fx, { freq: 300, type: 'lowpass', env: { attack: 0.003, decay: 0.12, peak: peak * 0.8 } })
  }
  const creak = (peak = 0.03, len = 0.8) => tone(ctx, fx, { freq: 210, to: 320, glide: len, type: 'sawtooth', env: { attack: 0.1, decay: len, peak } })
  /** A voice without words: formant blips (the announcement, Elen, Levy from the speaker). */
  const mumble = (pitch: number, n: number, peak: number, out: AudioNode = fx, spacing = 0.14, seed = 0) => {
    for (let i = 0; i < n; i++) {
      const r = seed ? ((Math.sin((i + 1) * seed) + 1) / 2) : Math.random()
      const f = pitch * (0.92 + r * 0.18)
      const d = i * spacing + r * 0.04
      tone(ctx, out, { freq: f, type: 'sawtooth', env: { attack: 0.02, decay: 0.09, peak: peak * 0.25 }, delay: d })
      tone(ctx, out, { freq: f * 4.1, type: 'sine', env: { attack: 0.02, decay: 0.07, peak: peak * 0.2 }, delay: d })
    }
  }
  /** Elen's laugh: the same take both days (no randomness). */
  const laugh = () => {
    for (let i = 0; i < 6; i++) {
      const f = 330 * (1 - i * 0.035)
      tone(ctx, elen.gain, { freq: f, type: 'triangle', env: { attack: 0.015, decay: 0.12, peak: 0.05 }, delay: i * 0.17 })
      tone(ctx, elen.gain, { freq: f * 3, type: 'sine', env: { attack: 0.015, decay: 0.08, peak: 0.015 }, delay: i * 0.17 })
    }
  }
  const bird = (out: AudioNode, phrase: number, pan: number, pitch = 1, peak = 0.05) => {
    for (const [f, to, d, delay] of PHRASES[phrase]) tone(ctx, out, { freq: f * pitch, to: to * pitch, glide: d, type: 'sine', env: { attack: 0.006, decay: d, peak }, delay, pan })
  }
  const step = (kind: 'wood' | 'pave' | 'stone' | 'gloss' | 'stair' | 'vinyl' | 'run', pan: number) => {
    if (kind === 'wood') burst(ctx, noise.brown, fx, { freq: 260, type: 'lowpass', env: { attack: 0.004, decay: 0.08, peak: 0.09 }, pan })
    else if (kind === 'pave') {
      burst(ctx, noise.brown, fx, { freq: 380, type: 'lowpass', env: { attack: 0.003, decay: 0.07, peak: 0.08 }, pan })
      click(2400, 0.01, 0.02, fx, pan)
    } else if (kind === 'stone') burst(ctx, noise.white, fx, { freq: 1800, q: 0.8, env: { attack: 0.01, decay: 0.09, peak: 0.025 }, pan })
    else if (kind === 'gloss') {
      burst(ctx, noise.brown, hall, { freq: 420, type: 'lowpass', env: { attack: 0.002, decay: 0.07, peak: 0.09 }, pan })
      click(3400, 0.028, 0.025, hall, pan)
    } else if (kind === 'stair') {
      burst(ctx, noise.brown, hall, { freq: 300, type: 'lowpass', env: { attack: 0.003, decay: 0.1, peak: 0.16 }, pan })
      click(2600, 0.02, 0.03, hall, pan)
    } else if (kind === 'vinyl') {
      burst(ctx, noise.brown, hall, { freq: 340, type: 'lowpass', env: { attack: 0.003, decay: 0.08, peak: 0.1 }, pan })
      click(3000, 0.015, 0.02, hall, pan)
    } else {
      burst(ctx, noise.brown, hall, { freq: 220, type: 'lowpass', env: { attack: 0.002, decay: 0.12, peak: 0.2 }, pan })
      click(2800, 0.03, 0.03, hall, pan)
    }
  }
  /** "Üç saniye.": the white crack into the real lab. */
  const flashHit = () => {
    burst(ctx, noise.white, fx, { freq: 6000, q: 0.3, env: { attack: 0.001, decay: 0.35, peak: 0.22 } })
    tone(ctx, fx, { freq: 2637, env: { attack: 0.002, decay: 1.6, peak: 0.03 } })
    tone(ctx, fx, { freq: 3951, env: { attack: 0.002, decay: 1.1, peak: 0.012 } })
    thud(0.12, fx, 90)
  }
  /** The cut back: the same crack, shorter. */
  const flashBack = () => {
    burst(ctx, noise.white, fx, { freq: 5000, q: 0.3, env: { attack: 0.001, decay: 0.18, peak: 0.16 } })
    tone(ctx, fx, { freq: 2637, env: { attack: 0.002, decay: 0.5, peak: 0.015 } })
  }
  /** The light stuttering: a short electrical crackle. */
  const crackle = (peak = 0.06) => {
    for (let i = 0; i < 4; i++) click(1800 + Math.random() * 5000, peak * (0.4 + Math.random() * 0.6), 0.01 + Math.random() * 0.02, fx, Math.random() * 0.6 - 0.3)
    tone(ctx, fx, { freq: 100, type: 'sawtooth', env: { attack: 0.001, decay: 0.06, peak: peak * 0.3 } })
  }
  /** One torn word on the second floor (DUR / AÇ / TUT / KES): human on the attack, then dropped and clipped. */
  const tornWord = (i: number) => {
    const f = [210, 120, 200, 115][i]
    click(1800, 0.08, 0.02)
    tone(ctx, fx, { freq: f, to: f * 0.55, glide: 0.4, type: 'sawtooth', env: { attack: 0.01, decay: 0.45, peak: 0.07 } })
    tone(ctx, fx, { freq: f / 2, to: f * 0.25, glide: 0.4, type: 'square', env: { attack: 0.02, decay: 0.4, peak: 0.04 } })
    burst(ctx, noise.pink, fx, { freq: 900 + i * 150, q: 3, env: { attack: 0.01, decay: 0.35, peak: 0.12 } })
  }

  // ——— Clocks and state ———
  let lastP = -1
  let lastStep = 0
  let lastSeg: SegmentId = 'open'
  let lastGlowOn = true
  let lastVol = 0
  let lastCount = -1
  let time = 0
  let breathPhase = 0
  const clocks = { relay: 0.6, beep: 0.5, bird: 1.2, gbird: 2, sprinkler: 0, sprinkleN: 0, kclock: 0, wclock: 0, bubble: 0.2, vit: 0.4, cutlery: 0.3, keys: 0.1, tv: 0, voice: 0, chord: 4, crowd: 0, swS: 0, swE: 0.15, whisper: 0, tape: 0, scratch: 0, plop: 1, printer: 4, drop: 0, alarm: 0, rattle: 0, pace: 0 }
  let chord = 0
  let phrase = 0
  let tick = false

  const crossings = (from: number, to: number, flags: ReadonlySet<string>) => {
    const c = (seg: SegmentId, u: number) => from < at(seg, u) && to >= at(seg, u)
    // 01–02 the lab
    if (c('atrium', 0.2)) {
      click(3200, 0.12, 0.04, shaft.gain)
      click(900, 0.08, 0.06, shaft.gain)
    }
    if (c('god', 0.25)) tone(ctx, fx, { freq: 660, to: 990, glide: 0.4, env: { attack: 0.05, decay: 0.4, peak: 0.012 } })
    if (c('god', 0.42)) click(2600, 0.04, 0.03)
    if (c('god', 0.62)) creak(0.012, 0.6)
    if (c('file', 0.45)) beep(1568, 0.04, 0.12)
    if (c('notebook', 0.06)) page(0.08)
    if (c('notebook', 0.12)) page(0.06)
    if (c('notebook', 0.3)) click(3000, 0.02, 0.02)
    if (c('press', 0.1)) {
      key(0.12)
      thud(0.05, fx, 300)
    }
    if (c('press', 0.12)) beep(523, 0.025, 0.4, fx, 'triangle')
    if (c('press', 0.32)) tone(ctx, fx, { freq: 220, to: 330, glide: 2.4, type: 'sine', env: { attack: 1.2, decay: 1.6, peak: 0.03 } })
    // 03 Monday
    if (c('wake', 0.04)) {
      tone(ctx, fx, { freq: 180, to: 160, glide: 2.4, type: 'sawtooth', env: { attack: 0.3, decay: 2.2, peak: 0.006 } })
      swish(0.03, 2.2, 1200)
    }
    if (c('wake', 0.6)) burst(ctx, noise.brown, fx, { freq: 250, type: 'lowpass', env: { attack: 0.01, decay: 0.1, peak: 0.05 } })
    if (c('filed', 0.45)) for (let i = 0; i < 5; i++) burst(ctx, noise.pink, birds, { freq: 1500, q: 0.8, env: { attack: 0.005, decay: 0.04, peak: 0.08 }, rate: 1 + i * 0.05 })
    if (c('filed', 0.62)) bird(birds, 0, 0.4, 1.1, 0.06)
    if (c('mirror', 0.6)) {
      metal(0.03, 2700)
      hiss(0.015, 0.4, 7000)
    }
    if (c('mirror', 0.8)) swish(0.025, 0.3, 2200)
    if (c('elen', 0.74)) laugh()
    if (c('busstop', 0.12)) {
      metal(0.02, 3200, fx)
      setTimeout(() => metal(0.015, 3200, fx), 180)
    }
    if (c('busstop', 0.8)) hiss(0.05, 0.9, 2600)
    if (c('busstop', 0.85)) {
      hiss(0.07, 0.5, 3200)
      setTimeout(() => thud(0.08), 420)
    }
    if (c('archive', 0.5)) tone(ctx, fx, { freq: 9000, to: 400, glide: 0.3, env: { attack: 0.001, decay: 0.3, peak: 0.01 } })
    if (c('archive', 0.54)) {
      burst(ctx, noise.white, fx, { freq: 3000, q: 0.4, env: { attack: 0.002, decay: 0.25, peak: 0.08 } })
      tone(ctx, fx, { freq: 1400, to: 300, glide: 0.25, type: 'square', env: { attack: 0.002, decay: 0.25, peak: 0.012 } })
    }
    if (c('archive', 0.74)) click(5000, 0.03, 0.02)
    // 04 Tuesday
    if (c('again', 0.22)) laugh()
    if (c('why', 0.69)) metal(0.03, 3300)
    if (c('remote', 0.3)) burst(ctx, noise.brown, fx, { freq: 600, type: 'lowpass', env: { attack: 0.003, decay: 0.06, peak: 0.05 } })
    if (flags.has('tv:channel') && c('remote', 0.5)) click(3800, 0.025, 0.02, tvSpot.gain)
    // 05 Wednesday
    const bell = () => {
      chime(659.25, 523.25, 0.05)
    }
    if (c('bell', 0.03)) bell()
    if (c('bell', 0.4)) bell()
    if (c('bell', 0.5)) latch(0.08)
    if (c('bell', 0.52)) creak(0.02, 0.9)
    if (c('letter', 0.12)) {
      for (let i = 0; i < 6; i++) setTimeout(() => burst(ctx, noise.white, fx, { freq: 2600 + i * 300, q: 1.5, env: { attack: 0.004, decay: 0.05, peak: 0.07 } }), i * 45)
    }
    if (c('letter', 0.18)) page(0.07)
    if (c('calendar', 0.05) || c('calendar', 0.12)) click(4200, 0.02, 0.015)
    if (c('calendar', 0.76)) burst(ctx, noise.brown, fx, { freq: 500, type: 'lowpass', env: { attack: 0.002, decay: 0.05, peak: 0.06 } })
    if (c('heavy', 0.75)) {
      tone(ctx, fx, { freq: 140, to: 90, glide: 0.35, type: 'sawtooth', env: { attack: 0.02, decay: 0.35, peak: 0.03 } })
      swish(0.04, 0.3, 700)
    }
    if (c('shoes', 0.15) || c('shoes', 0.28) || c('shoes', 0.38)) swish(0.015, 0.2, 2800)
    if (c('shoes', 0.62)) latch(0.08)
    if (c('shoes', 0.64)) creak(0.015, 0.8)
    // 06–07 the Centre
    if (c('walking', 0.5) || c('hall', 0.15) || c('lobby', 0.42)) swish(0.05, 0.8, 900)
    if (c('hall', 0.05)) {
      chime(784, 1046.5, 0.025, musicSpot.gain)
      setTimeout(() => mumble(230, 10, 0.1, musicSpot.gain, 0.16), 900)
    }
    if (c('hall', 0.73)) page(0.04)
    if (c('boards', 0.69)) tone(ctx, fx, { freq: 880, to: 1320, glide: 0.6, env: { attack: 0.2, decay: 0.8, peak: 0.01 } })
    if (c('run', 0.9)) {
      latch(0.12)
      thud(0.15, hall)
    }
    if (c('silence', 0.03)) {
      thud(0.32, hall, 180)
      metal(0.03, 1200, hall)
    }
    if (c('silence', 0.59)) click(2000, 0.04, 0.03)
    if (c('silence', 0.82)) {
      latch(0.1)
      creak(0.02, 0.7)
    }
    if (c('normal', 0.88)) thud(0.2, hall, 180)
    if (c('lobby', 0.03)) latch(0.08)
    if (c('lobby', 0.5)) burst(ctx, noise.pink, fountain.gain, { freq: 900, q: 1, env: { attack: 0.005, decay: 0.2, peak: 0.12 } })
    // 08 the second floor
    if (c('staff', 0.02)) latch(0.06)
    if (c('staff', 0.51)) mumble(210, 4, 0.08, voices, 0.15)
    if (c('flicker', 0.4)) {
      thud(0.22, fx, 70)
      crackle(0.08)
    }
    if (c('flicker', 0.45)) crackle(0.07)
    if (c('flicker', 0.43)) tone(ctx, fx, { freq: 700, to: 2800, glide: 0.8, type: 'sine', env: { attack: 0.05, decay: 0.8, peak: 0.012 } })
    for (let i = 0; i < 4; i++) if (c('cut', 0.53 + i * 0.1125)) tornWord(i)
    for (const [a] of FLASHES) if (c(a[0], a[1])) flashHit()
    if (c('chase', 0) || c('zoned', 0) || c('veyl', 0) || c('fingers', 0) || c('real', 0) || c('hands', 0.65)) flashBack()
    if (c('chase', 0.5)) mumble(150, 6, 0.08, voices, 0.1)
    if (c('room', 0.03)) thud(0.2, hall, 180)
    if (c('room', 0.75)) click(2200, 0.03, 0.03)
    if (c('room', 0.85)) {
      metal(0.06, 1900)
      click(3000, 0.06, 0.03)
    }
    if (c('code', 0.05)) latch(0.06)
    if (c('code', 0.2) || c('code', 0.8)) {
      for (let i = 0; i < 12; i++) setTimeout(() => click(1500 + Math.random() * 6000, 0.03, 0.012, fx, Math.random() - 0.5), i * 28)
      hiss(0.03, 0.3, 6000)
    }
    if (c('terminals', 0.22)) beep(1760, 0.03, 0.08)
    if (c('terminals', 0.24)) chime(1046.5, 1568, 0.012)
    if (c('terminals', 0.45)) tone(ctx, fx, { freq: 900, to: 120, glide: 0.25, type: 'triangle', env: { attack: 0.002, decay: 0.3, peak: 0.02 } })
    if (c('terminals', 0.5)) tone(ctx, fx, { freq: 200, to: 1400, glide: 0.25, type: 'triangle', env: { attack: 0.002, decay: 0.3, peak: 0.015 } })
    if (c('terminals', 0.92)) {
      for (let i = 0; i < 16; i++) setTimeout(() => click(1200 + Math.random() * 5000, 0.035, 0.015), i * 30)
      hiss(0.04, 0.6, 3000)
    }
    if (c('voice', 0.1)) mumble(125, 7, 0.12, kiosk.gain, 0.14)
    if (c('voice', 0.55)) mumble(122, 5, 0.06, kiosk.gain, 0.16)
    if (c('swarm', 0.02)) latch(0.05)
    if (c('swarm', 0.3)) {
      thud(0.2, fx, 70)
      crackle(0.08)
    }
    if (c('nurse', 0.2)) burst(ctx, noise.pink, fx, { freq: 700, q: 0.8, env: { attack: 0.01, decay: 0.15, peak: 0.08 } })
    if (c('nurse', 0.28)) tone(ctx, fx, { freq: 120, to: 60, glide: 0.4, env: { attack: 0.01, decay: 0.4, peak: 0.04 } })
    if (c('nurse', 0.49)) mumble(240, 3, 0.07, fx, 0.2)
    if (c('nurse', 0.72)) {
      thud(0.25, fx, 70)
      crackle(0.09)
    }
    if (c('nurse', 0.84)) hiss(0.06, 0.18, 5200)
    if (c('fade', 0.05)) tone(ctx, fx, { freq: 220, to: 55, glide: 6, type: 'sawtooth', env: { attack: 0.8, decay: 6, peak: 0.03 } })
    // 09–10 the stretcher room
    if (c('stretcher', 0.7)) {
      flashBack()
      tone(ctx, fx, { freq: 100, type: 'sawtooth', env: { attack: 0.005, decay: 0.25, peak: 0.02 } })
    }
    if (c('veyl', 0.02) || c('veyl', 0.06) || c('want', 0.28) || c('want', 0.31)) step('pave', 0)
    if (c('libet', 0.31)) click(2000, 0.03, 0.02, tapeSpot.gain)
    if (c('marks', 0.06)) beep(440, 0.03, 0.6)
    if (c('marks', 0.41)) beep(554.4, 0.03, 0.6)
    if (c('marks', 0.56)) beep(659.3, 0.03, 0.6)
    if (c('crack', 0.4)) {
      for (let i = 0; i < 10; i++) setTimeout(() => click(5000 + Math.random() * 3000, 0.025, 0.01, fx, (i / 10) * 0.6 - 0.3), i * 70)
      tone(ctx, fx, { freq: 6000, to: 9000, glide: 0.7, env: { attack: 0.01, decay: 0.7, peak: 0.006 } })
    }
    if (c('narrator', 0.03)) {
      tone(ctx, fx, { freq: 600, to: 120, glide: 0.5, type: 'sawtooth', env: { attack: 0.01, decay: 0.5, peak: 0.02 } })
      click(1200, 0.05, 0.04)
    }
    if (c('third', 0.62)) beep(1320, 0.015, 0.1)
    // The five smells: alcohol, burnt plastic, rot, soap, blood.
    if (c('layer', 0.5)) for (const f of [2637, 3136, 3951]) tone(ctx, fx, { freq: f, env: { attack: 0.005, decay: 0.5, peak: 0.012 } })
    if (c('layer', 0.58)) {
      for (let i = 0; i < 8; i++) setTimeout(() => click(800 + Math.random() * 2400, 0.04, 0.015), i * 40)
      tone(ctx, fx, { freq: 90, type: 'sawtooth', env: { attack: 0.02, decay: 0.4, peak: 0.025 } })
    }
    if (c('layer', 0.66)) {
      tone(ctx, fx, { freq: 70, to: 62, glide: 0.6, type: 'sawtooth', env: { attack: 0.05, decay: 0.6, peak: 0.03 } })
      tone(ctx, fx, { freq: 73, to: 66, glide: 0.6, type: 'sawtooth', env: { attack: 0.05, decay: 0.6, peak: 0.03 } })
    }
    if (c('layer', 0.74)) for (const f of [1046.5, 1318.5, 1568]) tone(ctx, fx, { freq: f, env: { attack: 0.08, decay: 0.7, peak: 0.01 } })
    if (c('layer', 0.82)) {
      thud(0.2, fx, 80)
      tone(ctx, fx, { freq: 55, to: 38, glide: 0.8, env: { attack: 0.02, decay: 0.9, peak: 0.06 } })
    }
    if (c('schema', 0.3)) tone(ctx, fx, { freq: 1400, to: 4200, glide: 2.2, env: { attack: 0.4, decay: 2.2, peak: 0.008 } })
    if (c('schema', 0.5)) chime(1046.5, 1046.5 * 1.5, 0.01)
    if (c('face', 0.32)) {
      thud(0.3, fx, 60)
      tone(ctx, fx, { freq: 48, to: 30, glide: 1.2, env: { attack: 0.005, decay: 1.4, peak: 0.08 } })
    }
    if (c('panic', 0)) flashBack()
    if (c('heavens', 0.2)) {
      burst(ctx, noise.brown, fx, { freq: 120, type: 'lowpass', env: { attack: 0.002, decay: 0.2, peak: 0.12 } })
      tone(ctx, fx, { freq: 100, type: 'sawtooth', env: { attack: 0.002, decay: 0.15, peak: 0.02 } })
    }
    if (c('kitchen', 0.6)) bird(tapeSpot.gain, 1, 0.3, 1, 0.05)
    if (c('kitchen', 0.32)) hiss(0.012, 1.5, 6000)
    if (c('lab5', 0.6)) {
      metal(0.03, 1600)
      click(1500, 0.06, 0.04)
    }
    for (const u of [0.56, 0.62, 0.68, 0.74, 0.8]) if (c('white', u)) {
      click(1100, 0.06, 0.05)
      tone(ctx, fx, { freq: 15000, to: 2000, glide: 0.2, env: { attack: 0.001, decay: 0.2, peak: 0.004 } })
    }
    // 11 release
    if (c('form', 0.5)) page(0.05)
    if (c('goodday', 0.5)) latch(0.07)
    if (c('goodday', 0.52)) creak(0.012, 0.9)
    if (c('window', 0.06)) metal(0.035, 3000)
    // 12 the experiment
    if (c('green', 0.08)) chime(784, 1174.7, 0.025)
    if (c('green', 0.5)) beep(1318.5, 0.02, 0.2)
    if (c('rings', 0.04)) click(2600, 0.04, 0.03)
    if (c('rings', 0.61)) beep(1046.5, 0.012, 0.1)
    if (c('next', 0.03)) {
      thud(0.08, fx, 300)
      click(1800, 0.05, 0.04)
    }
    if (c('next', 0.04)) chime(1046.5, 784, 0.015)
    if (c('signal', 0.49)) beep(1760, 0.05, 0.5)
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion, flags } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      const cut = !jumped && CUTS.some((c) => (lastP < c) !== (p < c))
      const tc = cut ? 0.004 : jumped ? 0.02 : 0.15
      const seg = segmentAt(p).id as SegmentId
      const u = local(p, seg)
      const lv = (id: LayerId) => evalNumber(MIX[id], p)
      // The scene's clock when it gives one (flickers are time-driven); our own otherwise.
      time = motion.frame > 0 ? motion.frame : time + dt
      const inF2 = p >= SEG.slogans.start && p < SEG.stretcher.start && !seg.startsWith('lab')
      const glow = motion.frame > 0 ? motion.doors : seg === 'cut' || seg === 'swarm' ? flickerT(time) : 1
      for (const id of Object.keys(MIX) as LayerId[]) {
        let v = lv(id)
        if (id === 'fluor' && inF2) v *= 0.15 + 0.85 * clamp(glow)
        if (id === 'dread' && seg === 'chase') v = Math.max(v, 0.35 * motion.robots)
        layers[id].gain.setTargetAtTime(v, now, tc)
      }
      const lp = lowpass(p)
      bedLP.frequency.setTargetAtTime(lp, now, cut ? 0.004 : 0.15)
      fxLP.frequency.setTargetAtTime(lp, now, cut ? 0.004 : 0.15)

      // The television's volume steps down with the bar (and stays down).
      let vol = 1
      if (seg === 'remote' && u > 0.3) vol = 1 - Math.floor(S(0.4, 0.7, u) * 6) * 0.14
      else if (seg === 'thought') vol = 0.16
      tvVol.gain.setTargetAtTime(Math.pow(vol, 1.6), now, 0.05)
      const volSteps = seg === 'remote' && u > 0.3 ? Math.floor(S(0.4, 0.7, u) * 6) : seg === 'thought' ? 6 : 0
      if (!jumped && p > lastP && seg === 'remote' && volSteps > lastVol) beep(1480, 0.035, 0.06)
      lastVol = volSteps
      // The TV's calm voice.
      if (lv('tv') > 0.02) {
        clocks.tv -= dt
        if (clocks.tv <= 0) {
          clocks.tv = Math.random() < 0.12 ? 0.5 + Math.random() * 0.4 : 0.13 + Math.random() * 0.12
          tvO.o.frequency.setTargetAtTime(100 + Math.random() * 18, now, 0.03)
          tvSyl.gain.cancelScheduledValues(now)
          tvSyl.gain.setValueAtTime(0.9, now)
          tvSyl.gain.exponentialRampToValueAtTime(0.05, now + 0.1 + Math.random() * 0.06)
        }
      }
      // The second floor's voices (human, then torn).
      const tornAmt =
        seg === 'flicker' ? S(0.4, 0.46, u) : seg === 'cut' ? 1 : seg === 'chase' ? (motion.robots > 0.5 ? 1 : u > 0.5 ? 0.35 : 0) : seg === 'swarm' ? S(0.3, 0.34, u) : seg === 'nurse' ? (u < 0.3 || u > 0.7 ? 1 : 0) : seg === 'fade' ? 1 : 0
      torn.gain.setTargetAtTime(tornAmt * 0.9, now, 0.05)
      dry.gain.setTargetAtTime(1 - tornAmt * 0.6, now, 0.05)
      if (lv('voices') > 0.02) {
        clocks.voice -= dt
        if (clocks.voice <= 0) {
          clocks.voice = 0.1 + Math.random() * 0.16
          const female = Math.random() < 0.5
          const f = (female ? 215 : 122) * (1 - 0.45 * tornAmt) * (0.92 + Math.random() * 0.16)
          vO.o.frequency.setTargetAtTime(f, now, 0.02)
          vSub.o.frequency.setTargetAtTime(f / 2, now, 0.02)
          vSyl.gain.cancelScheduledValues(now)
          vSyl.gain.setValueAtTime(0.9, now)
          vSyl.gain.exponentialRampToValueAtTime(0.06, now + 0.09 + Math.random() * 0.08 + 0.12 * tornAmt)
        }
      }
      // The fluorescents' stutter: a crackle whenever the light drops or comes back.
      const glowOn = glow > 0.5
      if (inF2 && !jumped && glowOn !== lastGlowOn && lastSeg === seg) crackle(seg === 'cut' || seg === 'swarm' ? 0.035 : 0.06)
      lastGlowOn = glowOn

      // The signal line rises with its drawing, then holds.
      if (seg === 'signal') {
        const f = 220 + 660 * S(0.04, 0.42, u)
        sig.o.frequency.setTargetAtTime(f, now, 0.05)
        sig2.o.frequency.setTargetAtTime(f * 2, now, 0.05)
      }
      // The weave's band passes down the frame: its pitch follows.
      if (seg === 'goodday') weaveF.frequency.setTargetAtTime(9000 - 7200 * S(0.03, 0.4, u), now, 0.05)
      // The swarm's two groups walk in from both ends.
      if (seg === 'swarm') {
        const kk = S(0, 0.55, u)
        swarmS.place(400, 0.1, -17 - 11.4 * kk)
        swarmE.place(402 - 1.4 * kk, 0.1, -20.3 - 9.9 * kk)
      }
      // The bus comes in from the east.
      if (seg === 'busstop') busOut.place(138.5 + 32 * (1 - S(0.6, 0.82, u)), 0.6, 13.45)
      // Which recording the tape hiss comes from.
      if (seg === 'libet') tapeSpot.place(496.2, 2.8, -4.6)
      else if (seg === 'fingers' || seg === 'narrator' || seg === 'kitchen') tapeSpot.place(503.8, 2.4, -4.6)
      else if (seg === 'bring') tapeSpot.place(496.2, 2.0, -4.6)
      else if (seg === 'heavens' || seg === 'log') tapeSpot.place(500, 2.6, -5.2)

      // ——— Clocks ———
      // Relay clicks far above.
      if (lv('shaft') > 0.05) {
        clocks.relay -= dt
        if (clocks.relay <= 0) {
          clocks.relay = 0.35 + Math.random() * 1.3
          click(2600 + Math.random() * 1800, 0.08, 0.03, shaft.gain, Math.random() - 0.5)
          if (Math.random() < 0.4) click(700, 0.05, 0.05, shaft.gain)
        }
      }
      // Station 31's monitor: hurried in the flashes, calm once it is green; the warning in lab2.
      if (lv('monitor') > 0.05) {
        clocks.beep -= dt
        if (clocks.beep <= 0) {
          const flash = seg.startsWith('lab') || seg === 'hands'
          clocks.beep = flash ? 0.85 : 1.25
          beep(flash ? 1046.5 : 880, flash ? 0.05 : 0.025, 0.09, monitor.gain)
        }
        if (seg === 'lab2') {
          clocks.alarm -= dt
          if (clocks.alarm <= 0) {
            clocks.alarm = 1.1
            beep(880, 0.03, 0.14, monitor.gain, 'triangle')
            tone(ctx, monitor.gain, { freq: 660, type: 'triangle', env: { attack: 0.003, decay: 0.14, peak: 0.03 }, delay: 0.18 })
          }
        }
      }
      // Typing: Veyl's protocol, his answer in lab4; Levy at the archive.
      const typing = (seg === 'protocol' && u < 0.95) || (seg === 'lab4' && u > 0.71) || (seg === 'archive' && (u < 0.5 || u > 0.84)) || (seg === 'lobby' && u > 0.84)
      if (typing && !jumped) {
        clocks.keys -= dt
        if (clocks.keys <= 0) {
          clocks.keys = 0.07 + Math.random() * 0.17 + (Math.random() < 0.08 ? 0.5 : 0)
          key(seg === 'archive' || seg === 'lobby' ? 0.035 : 0.045)
        }
      }
      // Counted things: protocol lines, log lines, typed letters, green lights, progress, the faces, the pen.
      const count =
        seg === 'protocol'
          ? clamp(Math.floor((u - 0.12) / 0.12) + 1, 0, PROTOCOL_LEN)
          : seg === 'log'
            ? clamp(Math.floor((u - 0.15) / 0.075) + 1, 0, LOG_LEN)
            : seg === 'face'
              ? Math.floor(S(0.54, 0.9, u) * NOT_YOU)
              : seg === 'green'
                ? Math.floor(S(0.02, 0.5, u) * 8)
                : seg === 'lab5'
                  ? Math.floor(S(0.5, 0.98, u) * 20)
                  : seg === 'fingers'
                    ? (u >= 0.66 ? clamp(Math.floor((u - 0.66) / 0.064), 0, 4) + 1 : 0)
                    : -1
      if (!jumped && p > lastP && seg === lastSeg && count > lastCount && lastCount >= 0) {
        if (seg === 'protocol') beep(1760, 0.012, 0.05)
        else if (seg === 'log') {
          click(2400, 0.03, 0.02)
          if (flags.has('line:blue') && count >= LOG_LEN - 1) {
            beep(620, 0.025, 0.12, fx, 'triangle')
            tone(ctx, fx, { freq: 620, type: 'triangle', env: { attack: 0.003, decay: 0.12, peak: 0.025 }, delay: 0.25 })
          }
        } else if (seg === 'face') key(0.05)
        else if (seg === 'green') beep(1318.5, 0.01, 0.08)
        else if (seg === 'lab5') click(3000, 0.008, 0.01)
        else if (seg === 'fingers') click(1800, 0.025, 0.03, tapeSpot.gain)
      }
      lastCount = count
      // The pen on paper.
      const writing = seg === 'notes' && ((u >= 0.02 && u < 0.33) || (u >= 0.37 && u < 0.9))
      if (writing && !jumped) {
        clocks.scratch -= dt
        if (clocks.scratch <= 0) {
          clocks.scratch = 0.06 + Math.random() * 0.1
          scratch(0.025)
        }
      }
      // The suburb's birds: the same three phrases, exactly every 2.4 s.
      if (lv('birds') > 0.01) {
        clocks.bird -= dt
        if (clocks.bird <= 0) {
          clocks.bird += 2.4
          if (clocks.bird < 0) clocks.bird = 2.4
          phrase = (phrase + 1) % 3
          bird(birds, phrase, PHRASE_PAN[phrase])
        }
      }
      // The garden's birds are ordinary: random, far.
      if (lv('garden') > 0.02) {
        clocks.gbird -= dt
        if (clocks.gbird <= 0) {
          clocks.gbird = 1.5 + Math.random() * 4
          bird(garden, Math.floor(Math.random() * 3), Math.random() * 1.6 - 0.8, 0.85 + Math.random() * 0.3, 0.04)
        }
      }
      // The impact sprinklers: ten ticks out, a fast ratchet back.
      if (lv('sprinkler') > 0.02) {
        clocks.sprinkler -= dt
        if (clocks.sprinkler <= 0) {
          const n = clocks.sprinkleN++ % 26
          clocks.sprinkler = n < 10 ? 0.19 : n < 25 ? 0.045 : 1.6
          burst(ctx, noise.white, sprinkler.gain, { freq: n < 10 ? 3200 : 4200, q: 2, env: { attack: 0.002, decay: n < 10 ? 0.05 : 0.02, peak: n < 10 ? 0.1 : 0.05 } })
        }
      }
      // The kitchen clock and the small room's clock: tick, tock.
      const tickTock = (gain: GainNode, which: 'kclock' | 'wclock') => {
        clocks[which] -= dt
        if (clocks[which] <= 0) {
          clocks[which] = 1
          tick = !tick
          burst(ctx, noise.white, gain, { freq: tick ? 2600 : 2100, q: 4, env: { attack: 0.001, decay: 0.025, peak: 0.12 } })
        }
      }
      if (lv('kclock') > 0.02) tickTock(kclock.gain, 'kclock')
      if (lv('wallclock') > 0.02) tickTock(wallclock.gain, 'wclock')
      // A drop falls from a leaf in Elen's empty garden.
      if (seg === 'empty') {
        clocks.drop -= dt
        if (clocks.drop <= 0) {
          clocks.drop = 1 / 0.7
          tone(ctx, can.gain, { freq: 1800, to: 900, glide: 0.06, env: { attack: 0.001, decay: 0.07, peak: 0.08 } })
        }
      }
      // Cutlery in the cantina (it stops with the murmur).
      if (lv('cantina') > 0.08) {
        clocks.cutlery -= dt
        if (clocks.cutlery <= 0) {
          clocks.cutlery = 0.2 + Math.random() * 0.7
          tone(ctx, cantina, { freq: 2600 + Math.random() * 2400, type: 'triangle', env: { attack: 0.001, decay: 0.08 + Math.random() * 0.1, peak: 0.05 }, pan: Math.random() * 1.6 - 0.8 })
        }
      }
      // A printer far off in the archive.
      if (lv('office') > 0.05) {
        clocks.printer -= dt
        if (clocks.printer <= 0) {
          clocks.printer = 7 + Math.random() * 6
          for (let i = 0; i < 6; i++) setTimeout(() => burst(ctx, noise.pink, office, { freq: 1100, q: 2, env: { attack: 0.02, decay: 0.12, peak: 0.12 }, pan: 0.6 }), i * 160)
        }
      }
      // The fountain's drops.
      if (lv('fountain') > 0.05) {
        clocks.plop -= dt
        if (clocks.plop <= 0) {
          clocks.plop = 0.15 + Math.random() * 0.4
          tone(ctx, fountain.gain, { freq: 900 + Math.random() * 1500, to: 600, glide: 0.05, env: { attack: 0.001, decay: 0.05, peak: 0.04 } })
        }
      }
      // The hall's music changes chord, calmly.
      clocks.chord -= dt
      if (clocks.chord <= 0) {
        clocks.chord = 5
        chord = (chord + 1) % CHORDS.length
        mVoices.forEach((v, i) => v.o.frequency.setTargetAtTime(CHORDS[chord][i], now, 0.6))
      }
      // Footsteps multiplying on the white floor; the pursuers; the swarm from both ends.
      if (seg === 'run' && !jumped) {
        clocks.crowd -= dt
        if (clocks.crowd <= 0) {
          clocks.crowd = u < 0.51 ? 0.42 - 0.24 * S(0.03, 0.5, u) : 0.07 + Math.random() * 0.05
          step(u < 0.51 ? 'gloss' : 'run', Math.random() * 1.6 - 0.8)
        }
      }
      if (seg === 'chase' && u > 0.5 && !jumped) {
        clocks.crowd -= dt
        if (clocks.crowd <= 0) {
          clocks.crowd = 0.24 + Math.random() * 0.06
          step('run', Math.random() * 0.4 - 0.2)
        }
      }
      if (seg === 'swarm' && u < 0.6 && !jumped) {
        clocks.swS -= dt
        clocks.swE -= dt
        if (clocks.swS <= 0) {
          clocks.swS = 0.14 + Math.random() * 0.12
          burst(ctx, noise.brown, swarmS.gain, { freq: 360, type: 'lowpass', env: { attack: 0.003, decay: 0.08, peak: 0.14 } })
        }
        if (clocks.swE <= 0) {
          clocks.swE = 0.18 + Math.random() * 0.12
          burst(ctx, noise.brown, swarmE.gain, { freq: 360, type: 'lowpass', env: { attack: 0.003, decay: 0.08, peak: 0.14 } })
        }
      }
      // The locked handle, rattled.
      if (seg === 'nurse' && u > 0.03 && u < 0.2 && !jumped) {
        clocks.rattle -= dt
        if (clocks.rattle <= 0) {
          clocks.rattle = 0.09 + Math.random() * 0.08
          metal(0.025, 1500 + Math.random() * 400)
          burst(ctx, noise.brown, fx, { freq: 400, type: 'lowpass', env: { attack: 0.002, decay: 0.05, peak: 0.08 } })
        }
      }
      // Veyl whispering in Levy's ear.
      if (seg === 'terrible' && u > 0.03 && u < 0.42 && !jumped) {
        clocks.whisper -= dt
        if (clocks.whisper <= 0) {
          clocks.whisper = 0.12 + Math.random() * 0.14
          burst(ctx, noise.white, fx, { freq: 2600 + Math.random() * 2400, q: 2.5, env: { attack: 0.02, decay: 0.08 + Math.random() * 0.06, peak: 0.03 }, pan: -0.5 })
        }
      }
      // Veyl pacing in front of the screens.
      if (seg === 'panic' && u > 0.25 && u < 0.97 && !jumped) {
        clocks.pace -= dt
        if (clocks.pace <= 0) {
          clocks.pace = 0.62
          step('pave', 0)
          burst(ctx, noise.brown, hall, { freq: 300, type: 'lowpass', env: { attack: 0.003, decay: 0.07, peak: 0.05 } })
        }
      }
      // The tanks' bubbles; the vitals monitor; the old recordings' dial.
      if (lv('tanks') > 0.03) {
        clocks.bubble -= dt
        if (clocks.bubble <= 0) {
          clocks.bubble = 0.06 + Math.random() * 0.35
          const f = 450 + Math.random() * 900
          tone(ctx, tanks.gain, { freq: f, to: f * 1.6, glide: 0.04, env: { attack: 0.002, decay: 0.05, peak: 0.06 } })
        }
      }
      if (lv('vitals') > 0.03) {
        clocks.vit -= dt
        if (clocks.vit <= 0) {
          clocks.vit = 1.05
          beep(980, 0.05, 0.08, vitals.gain)
        }
      }
      if (seg === 'libet' && u > 0.26) {
        clocks.tape -= dt
        if (clocks.tape <= 0) {
          clocks.tape = 0.25
          click(3600, 0.02, 0.008, tapeSpot.gain)
        }
      }
      // Breath: quick and shallow after the run and the cuffs, slow and drugged in the fade.
      const quick = seg === 'silence' || seg === 'zoned' || seg === 'nurse' || seg === 'normal'
      breathPhase += dt * (quick ? 0.8 : 0.28)
      const cyc = Math.sin(breathPhase * Math.PI * 2)
      brG.gain.setTargetAtTime(lv('breath') > 0.01 ? 0.5 + 0.5 * cyc : 0, now, 0.06)
      brF.frequency.setTargetAtTime(cyc > 0 ? 640 : 400, now, 0.2)

      // Footsteps from the picture, on this place's floor.
      if (motion.step !== lastStep && motion.walking > 0.3 && !jumped) {
        const pan = motion.step % 2 ? 0.12 : -0.12
        const kind =
          seg === 'garden' || seg === 'walking'
            ? 'stone'
            : seg === 'busstop' || seg === 'empty'
              ? 'pave'
              : seg === 'bell' || seg === 'shoes'
                ? 'wood'
                : seg === 'upstairs'
                  ? 'stair'
                  : inF2
                    ? seg === 'chase' && u > 0.5
                      ? 'run'
                      : 'vinyl'
                    : seg === 'run' && u > 0.51
                      ? 'run'
                      : 'gloss'
        step(kind, pan)
      }
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p, flags)
      lastSeg = seg
      lastP = p
    },
  }
}
