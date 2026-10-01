/** ÖFKE NÖBETİ — the screenplay, measured in scroll. */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — HİZMET
  ['open', 1.4],
  ['street', 1.8],
  ['lobby', 2.4],
  ['reason', 2.6],
  ['wait', 2.2],
  ['ads', 1.6],
  // 02 — KURALLAR
  ['call', 1.6],
  ['rules', 3.2],
  ['console', 2.2],
  ['pick', 2.0],
  ['prepare', 1.4],
  // 03 — RAHATLAMA
  ['enter', 1.8],
  ['stare', 1.8],
  ['rise', 2.2],
  ['throw', 1.6],
  ['terminate', 2.0],
  ['rate', 2.2],
  ['relief', 2.8],
  // 04 — SAPMA
  ['week', 1.6],
  ['again', 2.0],
  ['corridor', 2.6],
  ['yet', 1.8],
  ['knows', 2.2],
  ['mimic', 2.4],
  // 05 — İZLER
  ['file', 3.0],
  ['doubt', 1.8],
  // 06 — İNSAN
  ['plead', 3.8],
  ['leave', 2.2],
  // 07 — KIRILMA
  ['swap', 1.6],
  ['marks', 2.2],
  ['oneway', 1.8],
  // 08 — KARŞI TARAF
  ['replay', 3.2],
  ['watch', 2.0],
  // 09 — SORU
  ['complete', 1.8],
  ['retained', 2.2],
  ['question', 2.4],
  // 10 — SON
  ['exit', 2.8],
  ['copyside', 3.4],
  ['end', 2.0],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'service', index: 1, title: 'HİZMET', first: 'open', last: 'ads' },
  { id: 'rules', index: 2, title: 'KURALLAR', first: 'call', last: 'prepare' },
  { id: 'relief', index: 3, title: 'RAHATLAMA', first: 'enter', last: 'relief' },
  { id: 'deviation', index: 4, title: 'SAPMA', first: 'week', last: 'mimic' },
  { id: 'traces', index: 5, title: 'İZLER', first: 'file', last: 'doubt' },
  { id: 'human', index: 6, title: 'İNSAN', first: 'plead', last: 'leave' },
  { id: 'break', index: 7, title: 'KIRILMA', first: 'swap', last: 'oneway' },
  { id: 'otherside', index: 8, title: 'KARŞI TARAF', first: 'replay', last: 'watch' },
  { id: 'question', index: 9, title: 'SORU', first: 'complete', last: 'question' },
  { id: 'end', index: 10, title: 'SON', first: 'exit', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

export const SCREEN_VH = 70
