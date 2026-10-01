/** YAŞAMAK — the screenplay, measured in scroll. Sixty minutes on a screen; a life around it. */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — İNTERNET KAFE
  ['open', 1.4],
  ['door', 1.6],
  ['pay', 1.8],
  ['seat', 2.0],
  ['tea', 2.6],
  // 02 — ZAMAN
  ['start', 1.8],
  ['screen', 2.0],
  ['spend', 3.2],
  ['clock', 1.8],
  // 03 — İNSANLAR
  ['child', 2.4],
  ['leave', 2.0],
  ['returns', 2.0],
  ['life', 2.6],
  // 04 — VEDA
  ['mother', 2.2],
  ['phone', 3.4],
  ['think', 2.0],
  ['gone', 2.4],
  ['after', 2.4],
  // 05 — SONSUZLUK
  ['endless', 2.2],
  ['still', 2.0],
  ['meaning', 1.8],
  // 06 — ÖTENAZİ
  ['corner', 2.0],
  ['pain', 2.2],
  ['owner', 2.4],
  ['answer', 2.0],
  // 07 — KAPANIŞ
  ['closing', 2.6],
  ['lastTea', 2.6],
  // 08 — KARA DELİK
  ['depart', 1.8],
  ['horizon', 2.4],
  ['dilation', 2.6],
  ['slow', 2.0],
  // 09 — SON
  ['one', 1.6],
  ['zero', 1.8],
  ['behind', 2.4],
  ['last', 2.4],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'cafe', index: 1, title: 'İNTERNET KAFE', first: 'open', last: 'tea' },
  { id: 'time', index: 2, title: 'ZAMAN', first: 'start', last: 'clock' },
  { id: 'people', index: 3, title: 'İNSANLAR', first: 'child', last: 'life' },
  { id: 'farewell', index: 4, title: 'VEDA', first: 'mother', last: 'after' },
  { id: 'forever', index: 5, title: 'SONSUZLUK', first: 'endless', last: 'meaning' },
  { id: 'choice', index: 6, title: 'ÖTENAZİ', first: 'corner', last: 'answer' },
  { id: 'closing', index: 7, title: 'KAPANIŞ', first: 'closing', last: 'lastTea' },
  { id: 'void', index: 8, title: 'KARA DELİK', first: 'depart', last: 'slow' },
  { id: 'end', index: 9, title: 'SON', first: 'one', last: 'last' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

export const SCREEN_VH = 70

/**
 * The session timer. Sixty minutes run down through the cafe; near the event
 * horizon Arif's minutes barely move while everything outside ages; on the
 * way back the last minutes go at once — and it holds on 00:01.
 */
const TIMER: Array<readonly [number, number]> = [
  [at('start'), 3600],
  [at('depart'), 360],
  [at('one'), 351],
  [at('one', 0.45), 1],
  [at('zero', 0.3), 1],
  [at('zero', 0.34), 0],
]

export function sessionSeconds(p: number) {
  if (p <= TIMER[0][0]) return 3600
  for (let i = 1; i < TIMER.length; i++) {
    const [p1, v1] = TIMER[i]
    if (p < p1) {
      const [p0, v0] = TIMER[i - 1]
      return Math.round(v0 + ((p - p0) / (p1 - p0)) * (v1 - v0))
    }
  }
  return 0
}

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
