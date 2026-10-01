/** EŞİK — the screenplay, measured in scroll. */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — ŞEHİR
  ['open', 1.4],
  ['walk', 2.6],
  ['phones', 2.2],
  // 02 — VİTRİN
  ['shop', 1.8],
  ['reflect', 2.4],
  // 03 — AYNI SOKAK
  ['corner', 2.2],
  ['same', 2.4],
  // 04 — GÖZLEM
  ['enter', 1.8],
  ['seen', 2.0],
  ['talk', 3.2],
  // 05 — CAM
  ['glass', 2.2],
  ['versions', 2.8],
  // 06 — GÖZLEMCİ
  ['observe', 2.6],
  ['nothing', 2.0],
  // 07 — KULLANICI
  ['terminal', 1.8],
  ['words', 2.8],
  ['user', 1.8],
  // 08 — GERÇEKLİK
  ['outside', 1.8],
  ['shift', 3.4],
  // 09 — EŞİK
  ['door', 2.0],
  ['voice', 3.0],
  // 10 — KAPI
  ['around', 2.0],
  ['opens', 2.2],
  ['list', 2.8],
  ['watching', 2.2],
  ['turn', 2.6],
  ['chair', 2.4],
  ['end', 2.4],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'city', index: 1, title: 'ŞEHİR', first: 'open', last: 'phones' },
  { id: 'window', index: 2, title: 'VİTRİN', first: 'shop', last: 'reflect' },
  { id: 'again', index: 3, title: 'AYNI SOKAK', first: 'corner', last: 'same' },
  { id: 'seen', index: 4, title: 'GÖZLEM', first: 'enter', last: 'talk' },
  { id: 'glass', index: 5, title: 'CAM', first: 'glass', last: 'versions' },
  { id: 'observer', index: 6, title: 'GÖZLEMCİ', first: 'observe', last: 'nothing' },
  { id: 'user', index: 7, title: 'KULLANICI', first: 'terminal', last: 'user' },
  { id: 'reality', index: 8, title: 'GERÇEKLİK', first: 'outside', last: 'shift' },
  { id: 'threshold', index: 9, title: 'EŞİK', first: 'door', last: 'voice' },
  { id: 'door', index: 10, title: 'KAPI', first: 'around', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

export const SCREEN_VH = 70
