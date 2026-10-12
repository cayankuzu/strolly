/**
 * BEYİN-KÖKÜ / BRAINROOT — the screenplay, measured in scroll.
 *
 * Professor Veyl's lab, where the night never quite ends; Levy A.'s suburb,
 * built from his own memories; three days in it (the veil loosening); the
 * Centre and its two floor lines; the second floor where the veil tears; the
 * stretcher where Veyl explains; release; and the lab again.
 * Twelve chapters, six "Üç saniye." cuts (five to the real lab, one on
 * Veyl's face). Shot list: docs/stories/beyinkoku.md.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — LABORATUVAR
  ['open', 1],
  ['atrium', 3.05],
  ['worlds', 2.95],
  ['god', 2.95],
  ['file', 2.15],
  ['brainmap', 1.4],
  // 02 — PROTOKOL
  ['notebook', 1.85],
  ['protocol', 1.85],
  ['slower', 1.85],
  ['press', 0.7],
  // 03 — PAZARTESİ
  ['wake', 2.2],
  ['filed', 1.4],
  ['mirror', 3.15],
  ['elen', 2.8],
  ['film', 1.35],
  ['busstop', 1.25],
  ['archive', 2.2],
  // 04 — SALI
  ['sameLight', 1.05],
  ['again', 3],
  ['bus', 1.2],
  ['wave', 2.4],
  ['why', 2.2],
  ['tv', 2],
  ['remote', 1.6],
  ['thought', 1.95],
  // 05 — ÇARŞAMBA
  ['bell', 1.95],
  ['letter', 2.6],
  ['calendar', 2],
  ['heavy', 2.95],
  ['shoes', 1.1],
  ['empty', 1.2],
  // 06 — MERKEZ
  ['garden', 2.15],
  ['boards', 2],
  ['walking', 0.85],
  ['hall', 2.5],
  ['floor', 3.3],
  ['choose', 1.7],
  // 07 — KIRMIZI ÇİZGİ
  ['step', 1.6],
  ['eyes', 2.7],
  ['run', 1.8],
  ['silence', 1.95],
  ['normal', 1.95],
  ['upstairs', 2.4],
  // 08 — İKİNCİ KAT
  ['slogans', 2.3],
  ['staff', 1.9],
  ['flicker', 2.5],
  ['cut', 1.75],
  ['lab1', 2.75],
  ['chase', 2.3],
  ['room', 2.65],
  ['lab2', 1.95],
  ['zoned', 1.15],
  ['code', 1.1],
  ['terminals', 2.8],
  ['voice', 1.15],
  ['swarm', 2.15],
  ['nurse', 2.75],
  ['fade', 1.9],
  // 09 — SEDYE
  ['stretcher', 1.45],
  ['lab3', 2.25],
  ['veyl', 2.1],
  ['libet', 2.1],
  ['marks', 2.55],
  ['crack', 2.7],
  ['lab4', 2.15],
  ['fingers', 2.85],
  ['narrator', 1.7],
  ['cover', 3.05],
  // 10 — PERDE
  ['third', 2.5],
  ['layer', 2.15],
  ['schema', 3.05],
  ['want', 2.05],
  ['face', 2.5],
  ['panic', 2.3],
  ['bring', 0.8],
  ['heavens', 3.2],
  ['hands', 0.95],
  ['kitchen', 1.6],
  ['log', 2.7],
  ['yours', 2],
  ['terrible', 2.15],
  ['lab5', 2.1],
  ['real', 2.65],
  ['white', 1.7],
  // 11 — GERİ SALIM
  ['smallroom', 2.65],
  ['form', 2.75],
  ['goodday', 1.9],
  ['lobby', 1.6],
  ['cantina', 2.35],
  ['window', 2.3],
  // 12 — DENEY
  ['green', 1.75],
  ['harika', 2.25],
  ['notes', 1.75],
  ['rings', 2.4],
  ['next', 1.9],
  ['signal', 1.4],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'lab', index: 1, title: 'LABORATUVAR', first: 'open', last: 'brainmap' },
  { id: 'protocol', index: 2, title: 'PROTOKOL', first: 'notebook', last: 'press' },
  { id: 'monday', index: 3, title: 'PAZARTESİ', first: 'wake', last: 'archive' },
  { id: 'tuesday', index: 4, title: 'SALI', first: 'sameLight', last: 'thought' },
  { id: 'wednesday', index: 5, title: 'ÇARŞAMBA', first: 'bell', last: 'empty' },
  { id: 'centre', index: 6, title: 'MERKEZ', first: 'garden', last: 'choose' },
  { id: 'redline', index: 7, title: 'KIRMIZI ÇİZGİ', first: 'step', last: 'upstairs' },
  { id: 'floor2', index: 8, title: 'İKİNCİ KAT', first: 'slogans', last: 'fade' },
  { id: 'stretcher', index: 9, title: 'SEDYE', first: 'stretcher', last: 'cover' },
  { id: 'veil', index: 10, title: 'PERDE', first: 'third', last: 'white' },
  { id: 'release', index: 11, title: 'GERİ SALIM', first: 'smallroom', last: 'window' },
  { id: 'experiment', index: 12, title: 'DENEY', first: 'green', last: 'signal' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** One screen of scroll, in viewport-height percent. A long, dense story: give each screen room. */
export const SCREEN_VH = 95
