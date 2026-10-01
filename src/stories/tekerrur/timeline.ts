/**
 * TEKERRÜR — "Her Şeyin Durumu". The screenplay, measured in scroll.
 *
 * One night at the DURUM observatory, from 20:58 to 03:12. Ten chapters:
 * the system, its predictions, a person predicted, the first deviation,
 * probability and chaos, the observer, the system modelling itself, a
 * choice, the archive of questions, and the question.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — DURUM
  ['open', 1.6],
  ['office', 2.6],
  ['coffee', 2.4],
  ['coffee2', 1.8],
  ['desk', 2.6],
  ['query1', 2.6],
  // 02 — TAHMİN
  ['log', 2.4],
  ['test', 2.6],
  ['small', 1.8],
  ['pen', 2.2],
  ['drop', 2.4],
  ['routine', 1.6],
  // 03 — İNSAN
  ['ask', 2.6],
  ['me', 2.0],
  ['cup', 2.6],
  ['cupChoice', 3.2],
  ['act', 2.6],
  ['wait13', 2.4],
  // 04 — SAPMA
  ['crash', 2.6],
  ['done', 2.6],
  ['selin', 2.8],
  ['selinQuery', 2.4],
  ['late', 2.8],
  ['wrong', 2.6],
  ['calc', 1.8],
  // 05 — OLASILIK
  ['particle', 2.8],
  ['cloud', 3.4],
  ['chaosQuery', 2.4],
  ['chain', 3.4],
  ['some', 2.4],
  ['knowing', 2.8],
  // 06 — GÖZLEMCİ
  ['asking', 2.8],
  ['before', 2.0],
  ['selfref', 3.0],
  ['because', 2.8],
  // 07 — KENDİSİ
  ['hall', 3.0],
  ['inside', 2.4],
  ['future', 2.4],
  ['depth', 2.8],
  ['you', 2.0],
  ['t0312', 3.8],
  // 08 — SEÇİM
  ['phone', 2.8],
  ['homeQuery', 2.8],
  ['wantKnow', 2.8],
  // 09 — TEKERRÜR
  ['archive', 2.6],
  ['record', 2.6],
  ['record2', 2.8],
  ['pending', 2.2],
  ['count', 2.8],
  ['questions', 2.4],
  // 10 — SORU
  ['leaving', 2.8],
  ['empty', 3.0],
  ['observer2', 2.4],
  ['finalQuery', 2.6],
  ['accepted', 2.2],
  ['end', 3.0],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'state', index: 1, title: 'DURUM', first: 'open', last: 'query1' },
  { id: 'prediction', index: 2, title: 'TAHMİN', first: 'log', last: 'routine' },
  { id: 'human', index: 3, title: 'İNSAN', first: 'ask', last: 'wait13' },
  { id: 'deviation', index: 4, title: 'SAPMA', first: 'crash', last: 'calc' },
  { id: 'probability', index: 5, title: 'OLASILIK', first: 'particle', last: 'knowing' },
  { id: 'observer', index: 6, title: 'GÖZLEMCİ', first: 'asking', last: 'because' },
  { id: 'itself', index: 7, title: 'KENDİSİ', first: 'hall', last: 't0312' },
  { id: 'choice', index: 8, title: 'SEÇİM', first: 'phone', last: 'wantKnow' },
  { id: 'recurrence', index: 9, title: 'TEKERRÜR', first: 'archive', last: 'questions' },
  { id: 'question', index: 10, title: 'SORU', first: 'leaving', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** Scroll length of one screen, in viewport heights (percent). */
export const SCREEN_VH = 92

/**
 * The night's clock, in hours since midnight (20.97 = 20:58), as a function of
 * progress. Time jumps between scenes; inside a scene it moves with the scroll.
 */
export function storyHours(p: number) {
  const keys: Array<[number, number]> = [
    [0, 20 + 58 / 60],
    [at('query1', 1), 21 + 0 / 60],
    [at('routine', 1), 21 + 3 / 60],
    [at('cup', 0.5), 21 + 4 / 60],
    [at('act', 1), 21 + 12.5 / 60],
    [at('wait13', 0.62), 21 + 13 / 60 + 4 / 3600],
    [at('crash', 0.5), 21 + 13 / 60 + 9 / 3600],
    [at('selinQuery', 1), 21 + 31 / 60],
    [at('late'), 22 + 40 / 60],
    [at('calc', 1), 22 + 47 / 60],
    [at('particle'), 23 + 30 / 60],
    [at('knowing', 1), 24 + 25 / 60],
    [at('hall'), 24 + 50 / 60],
    [at('t0312', 1), 25 + 10 / 60],
    [at('phone'), 25 + 20 / 60],
    [at('wantKnow', 1), 25 + 31 / 60],
    [at('archive'), 26 + 15 / 60],
    [at('questions', 1), 26 + 55 / 60],
    [at('leaving'), 27 + 5 / 60],
    [at('empty', 0.5), 27 + 12 / 60],
    [1, 27 + 14 / 60],
  ]
  for (let i = 1; i < keys.length; i++) {
    const [p1, h1] = keys[i]
    const [p0, h0] = keys[i - 1]
    if (p <= p1) return h0 + (h1 - h0) * Math.max(0, Math.min(1, (p - p0) / Math.max(1e-9, p1 - p0)))
  }
  return keys[keys.length - 1][1]
}

/** "21:13" (or "21:13:04" with seconds) for a time in hours. */
export function clockText(hours: number, seconds = false) {
  const h = Math.floor(hours) % 24
  const m = Math.floor((hours * 60) % 60)
  const s = Math.floor((hours * 3600) % 60)
  const two = (n: number) => String(n).padStart(2, '0')
  return seconds ? `${two(h)}:${two(m)}:${two(s)}` : `${two(h)}:${two(m)}`
}
