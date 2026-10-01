/** EMANET — the screenplay, measured in scroll. */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — SABAH
  ['open', 1.4],
  ['logo', 1.6],
  ['insert', 1.8],
  ['form', 2.4],
  ['enter', 2.0],
  ['voice', 2.0],
  ['cup', 2.0],
  // 02 — AYRINTILAR
  ['slippers', 1.5],
  ['curtain', 1.8],
  ['doorCheck', 1.8],
  ['keys', 1.4],
  // 03 — FOTOĞRAF
  ['drawer', 1.8],
  ['photo', 2.8],
  // 04 — GÜN
  ['noon', 2.8],
  ['afternoon', 2.4],
  ['clock', 2.6],
  ['loop', 2.0],
  // 05 — PARÇALAR
  ['rewind', 2.4],
  ['fragments', 3.8],
  ['absent', 2.8],
  ['call', 3.2],
  // 06 — 14:18
  ['approach', 2.2],
  ['dissolve', 3.2],
  // 07 — GERÇEK
  ['hush', 1.6],
  ['system', 2.0],
  ['document', 2.8],
  ['closer', 2.6],
  // 08 — EMANET
  ['minute', 3.6],
  ['stay', 2.6],
  ['complete', 2.6],
  ['end', 2.2],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'morning', index: 1, title: 'SABAH', first: 'open', last: 'cup' },
  { id: 'details', index: 2, title: 'AYRINTILAR', first: 'slippers', last: 'keys' },
  { id: 'photo', index: 3, title: 'FOTOĞRAF', first: 'drawer', last: 'photo' },
  { id: 'day', index: 4, title: 'GÜN', first: 'noon', last: 'loop' },
  { id: 'fragments', index: 5, title: 'PARÇALAR', first: 'rewind', last: 'call' },
  { id: 'minute', index: 6, title: '14:18', first: 'approach', last: 'dissolve' },
  { id: 'truth', index: 7, title: 'GERÇEK', first: 'hush', last: 'closer' },
  { id: 'keep', index: 8, title: 'EMANET', first: 'minute', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

export const SCREEN_VH = 74
