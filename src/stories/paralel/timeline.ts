/**
 * PARALEL-LEŞ — the screenplay, measured in scroll.
 *
 * A prose poem told by a man on a cliff-edge swing. Eight childhood near-
 * misses (ages 9 → 12 → 15), each with the instant where the frame splits
 * and a translucent other self goes on into the fall; then the friends, the
 * universes where it happened, the archive of "almost", and the swing, now.
 * Screenplay and set contract: docs/stories/paralel.md.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — ÇİZGİ
  ['open', 1.0],
  ['line', 2.9],
  ['can', 2.8],
  // 02 — ÇATILAR
  ['roofs', 1.8],
  ['gap', 2.6],
  ['down', 2.1],
  ['jump', 2.2],
  // 03 — CAM
  ['glass', 1.7],
  ['rooms', 2.2],
  ['crack', 2.6],
  // 04 — KÖPRÜ
  ['river', 1.4],
  ['beams', 1.8],
  ['slip', 2.4],
  // 05 — TAŞLAR
  ['cliff', 1.5],
  ['stone', 2.6],
  ['rehearsal', 1.5],
  // 06 — DALGA
  ['flag', 1.6],
  ['waves', 1.4],
  ['under', 1.8],
  ['up', 1.6],
  // 07 — TOPRAK
  ['bike', 1.4],
  ['air', 1.9],
  ['slope', 1.5],
  ['bargain', 2.6],
  // 08 — KIVILCIM
  ['socket', 1.7],
  ['spark', 1.9],
  ['normal', 3.3],
  // 09 — BAZI EVRENLERDE
  ['friends', 1.8],
  ['chain', 2.4],
  ['fell', 1.2],
  ['today', 2.6],
  ['glassBroke', 1.0],
  ['ironSlipped', 1.0],
  ['waveKept', 1.0],
  ['earthFell', 1.0],
  ['powerKept', 1.1],
  // 10 — ODA
  ['bodies', 2.2],
  ['room', 2.9],
  ['devil', 2.4],
  ['exception', 2.2],
  ['diorama', 1.3],
  // 11 — ŞU AN
  ['swing', 1.8],
  ['feet', 1.5],
  ['arc', 2.0],
  ['rope', 1.8],
  ['choose', 1.3],
  ['grows', 2.4],
  ['still', 1.2],
  ['end', 1.3],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'line', index: 1, title: 'ÇİZGİ', first: 'open', last: 'can' },
  { id: 'roofs', index: 2, title: 'ÇATILAR', first: 'roofs', last: 'jump' },
  { id: 'glass', index: 3, title: 'CAM', first: 'glass', last: 'crack' },
  { id: 'bridge', index: 4, title: 'KÖPRÜ', first: 'river', last: 'slip' },
  { id: 'stones', index: 5, title: 'TAŞLAR', first: 'cliff', last: 'rehearsal' },
  { id: 'sea', index: 6, title: 'DALGA', first: 'flag', last: 'up' },
  { id: 'earth', index: 7, title: 'TOPRAK', first: 'bike', last: 'bargain' },
  { id: 'spark', index: 8, title: 'KIVILCIM', first: 'socket', last: 'normal' },
  { id: 'universes', index: 9, title: 'BAZI EVRENLERDE', first: 'friends', last: 'powerKept' },
  { id: 'room', index: 10, title: 'ODA', first: 'bodies', last: 'diorama' },
  { id: 'now', index: 11, title: 'ŞU AN', first: 'swing', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** Scroll length of one screen, in viewport heights (percent). */
export const SCREEN_VH = 80
