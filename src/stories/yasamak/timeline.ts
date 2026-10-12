/**
 * YAŞAMAK — "En Uzun ve En Kısa Veda". The screenplay, measured in scroll.
 *
 * One internet cafe, one desk (MASA 4), one life. A cold open in the dark
 * (the breath on the neck), then the narrator at ten with an hour on the
 * clock and coins in his pocket; the same desk decades later, with no number
 * on the screen; the room full of the people of his life, who leave one by
 * one through the door behind him; what they leave; his mother; and a boy at
 * the next desk who opens his game anyway. Full contract: docs/stories/yasamak.md.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — NEFES (present, night: the dark cafe, the door behind him)
  ['open', 1.0],
  ['neck', 3.4],
  // 02 — ÇOCUK (twenty-odd years earlier, a spring afternoon)
  ['recess', 3.0],
  ['coins', 2.5],
  ['play', 3.4],
  ['zero', 2.4],
  ['pocket', 1.8],
  ['dusk', 3.1],
  // 03 — SÜRE (the same desk, now; autumn evening)
  ['years', 1.7],
  ['soul', 1.6],
  ['dash', 2.4],
  ['wallet', 1.7],
  ['counter', 2.6],
  // 04 — ÖLÜMCÜL HASTALIK (the room, full)
  ['look', 2.3],
  ['dashes', 1.7],
  ['bell', 1.7],
  ['disease', 2.3],
  // 05 — BİRER BİRER (the departures, across seasons)
  ['bulmaz', 2.4],
  ['grandpa', 2.5],
  ['friend', 2.7],
  ['lighter', 3.3],
  ['father', 1.9],
  ['witness', 2.9],
  // 06 — HİÇLİK (winter night, what stays)
  ['traces', 1.7],
  ['scores', 2.9],
  ['illusion', 2.5],
  // 07 — VEDA (his mother at the next desk)
  ['mother', 1.9],
  ['dims', 2.6],
  ['turn', 2.45],
  ['together', 2.3],
  ['days', 1.9],
  ['instant', 3.0],
  // 08 — İNADINA (spring afternoon, a boy at the next desk)
  ['spring', 1.9],
  ['newboy', 1.9],
  ['defiance', 3.3],
  ['final', 1.4],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'breath', index: 1, title: 'NEFES', first: 'open', last: 'neck' },
  { id: 'child', index: 2, title: 'ÇOCUK', first: 'recess', last: 'dusk' },
  { id: 'time', index: 3, title: 'SÜRE', first: 'years', last: 'counter' },
  { id: 'illness', index: 4, title: 'ÖLÜMCÜL HASTALIK', first: 'look', last: 'disease' },
  { id: 'oneByOne', index: 5, title: 'BİRER BİRER', first: 'bulmaz', last: 'witness' },
  { id: 'nothing', index: 6, title: 'HİÇLİK', first: 'traces', last: 'illusion' },
  { id: 'farewell', index: 7, title: 'VEDA', first: 'mother', last: 'instant' },
  { id: 'defiance', index: 8, title: 'İNADINA', first: 'spring', last: 'final' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** Scroll length of one screen, in viewport heights (percent). */
export const SCREEN_VH = 76

// ——— What the window shows ———

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type DayLight = 'day' | 'dusk' | 'night'

/**
 * The street outside the window, from a point on (segment, fraction) until
 * the next key. Two stretches are time-lapses the set plays on its own:
 * `years` (seasons cycle, faster then slower, landing on autumn dusk) and
 * `days` (days and nights flicker by, late winter into the first buds).
 */
const SKY: ReadonlyArray<readonly [SegmentId, number, Season, DayLight]> = [
  ['open', 0, 'autumn', 'night'],
  ['recess', 0, 'spring', 'day'],
  ['dusk', 0.25, 'spring', 'dusk'],
  ['years', 0, 'autumn', 'dusk'],
  ['look', 0.5, 'autumn', 'night'],
  ['grandpa', 0, 'winter', 'day'],
  ['friend', 0, 'summer', 'dusk'],
  ['father', 0, 'winter', 'night'],
  ['mother', 0, 'winter', 'day'],
  ['instant', 0, 'spring', 'day'],
  ['spring', 0, 'spring', 'day'],
]

export function skyAt(p: number): { season: Season; light: DayLight } {
  let out = { season: SKY[0][2], light: SKY[0][3] }
  for (const [seg, f, season, light] of SKY) if (p >= at(seg, f)) out = { season, light }
  return out
}

// ——— The timers on the screens ———

/** Linear keys [progress, seconds] → seconds at p (held before the first and after the last key). */
function keyed(keys: ReadonlyArray<readonly [number, number]>, p: number) {
  if (p <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const [p1, v1] = keys[i]
    if (p < p1) {
      const [p0, v0] = keys[i - 1]
      return Math.round(v0 + ((p - p0) / (p1 - p0)) * (v1 - v0))
    }
  }
  return keys[keys.length - 1][1]
}

/**
 * The boy's hour (chapter 2, desk 4 and Emre's desk 3 alike): 60:00 holds,
 * ticks slowly (59:59, 59:58…), then races as he plays; he glances at the
 * corner around `play` 0.86 (≈13:20) and shrugs; 00:00 and the lock screen
 * at `zero` 0.2.
 */
export function kidSeconds(p: number) {
  return keyed(
    [
      [at('play', 0.06), 3600],
      [at('play', 0.14), 3600],
      [at('play', 0.3), 3586],
      [at('play', 0.97), 252],
      [at('zero', 0.2), 0],
    ],
    p,
  )
}

/** The extra half hour (only when the reader chose "Yarım saat daha." at the coin): 30:00 → 00:00 as his mother appears. */
export function extraSeconds(p: number) {
  return keyed(
    [
      [at('dusk', 0.02), 1800],
      [at('dusk', 0.3), 0],
    ],
    p,
  )
}

/** The boy at the end (chapter 8, desk 3): a whole hour, barely touched by the time the title comes. */
export function boySeconds(p: number) {
  return keyed(
    [
      [at('newboy', 0.3), 3600],
      [at('newboy', 0.4), 3599],
      [1, 3462],
    ],
    p,
  )
}

/** Every adult screen shows this where the number should be. */
export const NO_TIME = '—'

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
