/**
 * TEK AYAK — the screenplay, measured in scroll.
 *
 * One classroom, one Friday afternoon, the last period: a lesson on balanced
 * forces, a paper plane, a silence, a punishment, and the boy it cannot reach.
 * The twist is the whole story: Eren's wheelchair stays out of every frame
 * until `lift` (see docs/stories/tekayak.md, "Twist protection").
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — DERS
  ['open', 1.2],
  ['board', 2.4],
  ['light', 2.2],
  ['rows', 1.7],
  // 02 — UÇAK
  ['under', 2.7],
  ['fold', 1.85],
  ['pass', 1.9],
  ['aim', 1.2],
  ['whisper', 1.55],
  ['flight', 1.7],
  // 03 — SESSİZLİK
  ['anger', 1.7],
  ['turn', 1.8],
  ['hush', 2.85],
  ['smooth', 1.95],
  ['tip', 1.55],
  ['mock', 1.95],
  ['summon', 1.0],
  // 04 — CEZA
  ['rise', 1.8],
  ['order', 1.1],
  ['walk', 1.1],
  ['lineUp', 1.1],
  ['lift', 1.9],
  ['reveal', 1.4],
  // 05 — SAHNE
  ['burst', 2.1],
  ['laughs', 1.3],
  ['still', 2.25],
  ['flow', 2.0],
  ['end', 1.3],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'lesson', index: 1, title: 'DERS', first: 'open', last: 'rows' },
  { id: 'plane', index: 2, title: 'UÇAK', first: 'under', last: 'flight' },
  { id: 'silence', index: 3, title: 'SESSİZLİK', first: 'anger', last: 'summon' },
  { id: 'punishment', index: 4, title: 'CEZA', first: 'rise', last: 'reveal' },
  { id: 'scene', index: 5, title: 'SAHNE', first: 'burst', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** One screen of scroll, in viewport-height percent. */
export const SCREEN_VH = 80

const hms = (h: number, m: number, s = 0) => h * 3600 + m * 60 + s

/**
 * The wall clock above the bin corner, in seconds since midnight. Real
 * minutes inside the scenes (15.12 → 15.19); then, while Eren sits still in
 * `flow` and `end`, a time-lapse runs the hands to the bell at 15.40.
 */
const CLOCK: Array<readonly [number, number]> = [
  [0, hms(15, 12)],
  [at('under'), hms(15, 13, 30)],
  [at('flight', 1), hms(15, 15, 40)],
  [at('summon', 1), hms(15, 17, 30)],
  [at('reveal', 1), hms(15, 19)],
  [at('still', 1), hms(15, 19, 50)],
  [at('flow', 0.25), hms(15, 20)],
  [at('end', 0.6), hms(15, 40)],
  [1, hms(15, 40, 15)],
]

export function wallClock(p: number) {
  if (p <= CLOCK[0][0]) return CLOCK[0][1]
  for (let i = 1; i < CLOCK.length; i++) {
    const [p1, s1] = CLOCK[i]
    if (p <= p1) {
      const [p0, s0] = CLOCK[i - 1]
      return s0 + ((p - p0) / Math.max(1e-9, p1 - p0)) * (s1 - s0)
    }
  }
  return CLOCK[CLOCK.length - 1][1]
}

/** "15.12" for a wall-clock time in seconds. */
export function clockText(seconds: number) {
  const h = Math.floor(seconds / 3600) % 24
  const m = Math.floor((seconds % 3600) / 60)
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`
}

/**
 * How strongly the room runs in time-lapse (0 real time … 1 full lapse):
 * everything around Eren speeds up, he alone stays still; the bell at
 * `end` 0.6 snaps the room back to real time.
 */
export function lapse(p: number) {
  const a = at('flow', 0.25)
  const b = at('flow', 0.45)
  const c = at('end', 0.56)
  const d = at('end', 0.6)
  if (p <= a || p >= d) return 0
  if (p < b) return (p - a) / (b - a)
  if (p > c) return 1 - (p - c) / (d - c)
  return 1
}
