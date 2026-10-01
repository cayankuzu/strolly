/** KALAN — the screenplay, measured in scroll. */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — KAYIT
  ['open', 1.4],
  ['night', 1.8],
  ['find', 2.0],
  ['play', 2.4],
  ['voice', 2.2],
  // 02 — KAPI
  ['knock', 1.8],
  ['walk', 1.8],
  ['dont', 2.2],
  ['gone', 1.8],
  // 03 — BAŞKA HAYAT
  ['sleep', 1.6],
  ['morning', 2.2],
  ['mug', 2.0],
  ['details', 2.2],
  // 04 — FOTOĞRAF
  ['notice', 1.8],
  ['photo', 2.4],
  ['back', 2.0],
  // 05 — SES
  ['tape', 1.8],
  ['other', 2.8],
  // 06 — ODALAR
  ['rooms', 2.4],
  ['kitchen', 3.2],
  // 07 — SEÇİLMEMİŞ HAYATLAR
  ['married', 1.8],
  ['city', 1.8],
  ['never', 1.8],
  ['died', 2.2],
  // 08 — GERÇEK SORU
  ['ask', 3.6],
  // 09 — KALAN
  ['remain', 2.8],
  // 10 — SON SEÇİM
  ['sign', 2.0],
  ['approach', 2.2],
  ['opens', 2.4],
  ['facing', 2.6],
  ['behind', 2.6],
  ['recording', 2.8],
  ['end', 2.4],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'record', index: 1, title: 'KAYIT', first: 'open', last: 'voice' },
  { id: 'door', index: 2, title: 'KAPI', first: 'knock', last: 'gone' },
  { id: 'another', index: 3, title: 'BAŞKA HAYAT', first: 'sleep', last: 'details' },
  { id: 'photo', index: 4, title: 'FOTOĞRAF', first: 'notice', last: 'back' },
  { id: 'voice', index: 5, title: 'SES', first: 'tape', last: 'other' },
  { id: 'rooms', index: 6, title: 'ODALAR', first: 'rooms', last: 'kitchen' },
  { id: 'lives', index: 7, title: 'SEÇİLMEMİŞ HAYATLAR', first: 'married', last: 'died' },
  { id: 'question', index: 8, title: 'GERÇEK SORU', first: 'ask', last: 'ask' },
  { id: 'remain', index: 9, title: 'KALAN', first: 'remain', last: 'remain' },
  { id: 'choice', index: 10, title: 'SON SEÇİM', first: 'sign', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

export const SCREEN_VH = 70
