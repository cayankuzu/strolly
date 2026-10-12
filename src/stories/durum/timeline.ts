/**
 * DURUM — "Her Şeyin Durumu". The screenplay, measured in scroll.
 *
 * One Thursday night under an old observatory in Ankara, 20.58 to 03.12.
 * A machine said to know the state of everything; a night operator who asks
 * it small things; six objects the ideas happen to (a coin, an envelope, two
 * boxes, an electron, a butterfly, a message) and a reader who turns out to
 * be the one input the model does not have. The full shot list is in
 * docs/stories/durum.md.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — İBLİS (20.58)
  ['open', 1.3],
  ['enter', 2.9],
  ['coffee', 3.9],
  ['intro', 4.2],
  // 02 — KÜÇÜK SORULAR (21.00–21.13)
  ['ritual', 3.8],
  ['traffic', 3.1],
  ['thumb', 3.0],
  ['palm', 3.3],
  ['youSaid', 3.8],
  // 03 — KEHANET (21.13)
  ['dare', 3.1],
  ['envelope', 2.9],
  ['contrary', 2.0],
  ['glassChoice', 1.0],
  ['opened', 3.7],
  ['selin', 3.1],
  // 04 — İKİ KUTU (21.31)
  ['boxes', 2.0],
  ['rules', 2.2],
  ['split', 4.4],
  ['choose', 1.0],
  ['lid', 3.2],
  ['after', 3.6],
  // 05 — BELİRSİZLİK (23.30)
  ['lapse', 2.0],
  ['electron', 2.6],
  ['fabric', 3.6],
  ['cloud', 2.7],
  ['atom', 3.3],
  ['odds', 1.3],
  // 06 — KELEBEK (00.24)
  ['queue', 3.4],
  ['forest', 1.5],
  ['twoWorlds', 2.8],
  ['tent', 2.6],
  ['cfGate', 1.0],
  ['chain', 3.7],
  ['knowable', 3.0],
  // 07 — AYNA (01.24)
  ['selfQ', 2.4],
  ['hallWalk', 4.2],
  ['heat', 3.0],
  ['wait', 2.8],
  ['samePace', 1.3],
  // 08 — BÜYÜK SORU (02.15)
  ['sealed', 2.6],
  ['computing', 2.4],
  ['meaning', 3.8],
  ['rebuild', 1.0],
  ['answered', 3.5],
  // 09 — GÖZLEMCİ (02.53)
  ['input', 2.7],
  ['turn', 2.8],
  ['list', 3.5],
  ['observerN', 2.2],
  ['freedom', 3.2],
  // 10 — SON SORU (03.05–03.12)
  ['message', 4.1],
  ['coat', 3.6],
  ['query', 2.6],
  ['queryGate', 1.0],
  ['answer', 2.7],
  ['gone', 2.6],
  ['end', 2.3],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'demon', index: 1, title: 'İBLİS', first: 'open', last: 'intro' },
  { id: 'small', index: 2, title: 'KÜÇÜK SORULAR', first: 'ritual', last: 'youSaid' },
  { id: 'prophecy', index: 3, title: 'KEHANET', first: 'dare', last: 'selin' },
  { id: 'boxes', index: 4, title: 'İKİ KUTU', first: 'boxes', last: 'after' },
  { id: 'uncertainty', index: 5, title: 'BELİRSİZLİK', first: 'lapse', last: 'odds' },
  { id: 'butterfly', index: 6, title: 'KELEBEK', first: 'queue', last: 'knowable' },
  { id: 'mirror', index: 7, title: 'AYNA', first: 'selfQ', last: 'samePace' },
  { id: 'question', index: 8, title: 'BÜYÜK SORU', first: 'sealed', last: 'answered' },
  { id: 'observer', index: 9, title: 'GÖZLEMCİ', first: 'input', last: 'freedom' },
  { id: 'last', index: 10, title: 'SON SORU', first: 'message', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** Scroll length of one screen, in viewport heights (percent). */
export const SCREEN_VH = 84

/**
 * The night's clock, in hours since midnight (20.9667 = 20:58), as a function
 * of progress. Inside a scene it creeps with the scroll; between scenes it
 * jumps; through the time-lapse (lapse) it runs from 21.40 to 23.30, passing
 * 22.53 — Defne's message — at lapse 0.55.
 */
const CLOCK: Array<readonly [number, number]> = [
  [0, 20 + 58 / 60],
  [at('coffee'), 20 + 59 / 60],
  [at('intro', 1), 21],
  [at('thumb', 0.5), 21 + 10 / 60],
  [at('palm', 0.1), 21 + 10 / 60 + 8 / 3600],
  [at('youSaid', 1), 21 + 12 / 60],
  [at('dare'), 21 + 13 / 60],
  [at('glassChoice', 0.5), 21 + 14 / 60],
  [at('opened', 0.5), 21 + 17 / 60],
  [at('selin', 1), 21 + 24 / 60],
  [at('boxes'), 21 + 31 / 60],
  [at('choose', 0.5), 21 + 36 / 60],
  [at('after', 1), 21 + 40 / 60],
  [at('lapse', 0.55), 22 + 53 / 60],
  [at('lapse', 1), 23 + 30 / 60],
  [at('odds', 1), 23 + 52 / 60],
  [at('queue'), 24 + 24 / 60],
  [at('cfGate', 0.5), 24 + 41 / 60],
  [at('knowable', 1), 24 + 58 / 60],
  [at('selfQ'), 25 + 24 / 60],
  [at('samePace', 1), 25 + 50 / 60],
  [at('sealed'), 26 + 15 / 60],
  [at('rebuild', 0.5), 26 + 24 / 60],
  [at('answered', 1), 26 + 30 / 60],
  [at('input'), 26 + 53 / 60],
  [at('freedom', 1), 27],
  [at('message'), 27 + 5 / 60],
  [at('queryGate', 0.5), 27 + 8 / 60],
  [at('gone'), 27 + 10 / 60],
  [at('gone', 0.6), 27 + 12 / 60],
  [1, 27 + 12 / 60],
]

export function storyHours(p: number) {
  if (p <= CLOCK[0][0]) return CLOCK[0][1]
  for (let i = 1; i < CLOCK.length; i++) {
    const [p1, h1] = CLOCK[i]
    if (p <= p1) {
      const [p0, h0] = CLOCK[i - 1]
      return h0 + (h1 - h0) * Math.max(0, Math.min(1, (p - p0) / Math.max(1e-9, p1 - p0)))
    }
  }
  return CLOCK[CLOCK.length - 1][1]
}

/** "21:13" (or "21:13:04" with seconds) for a time in hours. */
export function clockText(hours: number, seconds = false) {
  const h = Math.floor(hours) % 24
  const m = Math.floor((hours * 60) % 60)
  const s = Math.floor((hours * 3600) % 60)
  const two = (n: number) => String(n).padStart(2, '0')
  return seconds ? `${two(h)}:${two(m)}:${two(s)}` : `${two(h)}:${two(m)}`
}
