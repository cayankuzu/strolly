/**
 * TAKINTI — the screenplay, measured in scroll.
 *
 * One night and the morning after in an old two-storey house. The boy gets up
 * at midnight, hears his mother's sewing machine, goes down, shouts at her
 * through the half-open door and goes back to bed. The camera stays in the
 * sewing room without him: the pedal, the body in the dark, the feet in the
 * streetlight, dawn on the sewing table. In the morning he runs down to make
 * up with his brother and asks his mother where he is.
 *
 * Segment lengths are set by the words: a one-line item gets at least ~0.9
 * screens, a two-line item at least ~1.6 (see docs/stories/takinti.md).
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — GECE YARISI
  ['street', 1.3],
  ['wake', 2.2],
  ['hall', 2.0],
  ['toilet', 1.9],
  ['voice', 2.2],
  // 02 — MERDİVEN
  ['landing', 2.35],
  ['descent', 2.1],
  ['words', 2.8],
  ['anger', 1.8],
  ['shadow', 2.4],
  // 03 — KAPI
  ['enter', 1.8],
  ['shout', 1.9],
  ['trance', 2.1],
  ['close', 2.3],
  // 04 — PEDAL
  ['corner', 2.3],
  ['feet', 2.1],
  ['drag', 2.05],
  ['thrice', 1.5],
  ['fall', 1.9],
  // 05 — ŞAFAK
  ['flayed', 3.1],
  ['sunrise', 2.1],
  ['pieces', 2.8],
  ['mutter', 2.8],
  ['stitch', 3.3],
  // 06 — SABAH
  ['wakeup', 1.9],
  ['brother', 2.2],
  ['games', 1.9],
  ['rush', 1.3],
  ['pass', 2.3],
  // 07 — MUTFAK
  ['kitchen', 1.9],
  ['ask', 1.3],
  ['answer', 2.9],
  ['end', 2.0],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'midnight', index: 1, title: 'GECE YARISI', first: 'street', last: 'voice' },
  { id: 'stairs', index: 2, title: 'MERDİVEN', first: 'landing', last: 'shadow' },
  { id: 'door', index: 3, title: 'KAPI', first: 'enter', last: 'close' },
  { id: 'pedal', index: 4, title: 'PEDAL', first: 'corner', last: 'fall' },
  { id: 'dawn', index: 5, title: 'ŞAFAK', first: 'flayed', last: 'stitch' },
  { id: 'morning', index: 6, title: 'SABAH', first: 'wakeup', last: 'pass' },
  { id: 'kitchen', index: 7, title: 'MUTFAK', first: 'kitchen', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** Scroll length of one screen, in viewport heights (percent). Slow: horror is read, not skimmed. */
export const SCREEN_VH = 88
