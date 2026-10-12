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
  ['atrium', 2.95],
  ['worlds', 2.7],
  ['god', 2.75],
  ['file', 2.35],
  ['brainmap', 1.6],
  // 02 — PROTOKOL
  ['notebook', 1.75],
  ['protocol', 1.95],
  ['slower', 1.55],
  ['press', 0.7],
  // 03 — PAZARTESİ
  ['wake', 2.1],
  ['filed', 1.2],
  ['mirror', 3.15],
  ['elen', 2.8],
  ['film', 1.25],
  ['busstop', 1.25],
  ['archive', 2.2],
  // 04 — SALI
  ['sameLight', 1.05],
  ['again', 3.25],
  ['bus', 1.05],
  ['wave', 2.3],
  ['why', 2.2],
  ['tv', 2],
  ['remote', 1.55],
  ['thought', 2.2],
  // 05 — ÇARŞAMBA
  ['bell', 1.8],
  ['letter', 2.6],
  ['calendar', 2.15],
  ['heavy', 3.75],
  ['shoes', 0.8],
  ['empty', 1.05],
  // 06 — MERKEZ
  ['garden', 2.15],
  ['boards', 2.1],
  ['walking', 1],
  ['hall', 2.6],
  ['floor', 3.1],
  ['choose', 1.6],
  // 07 — KIRMIZI ÇİZGİ
  ['step', 1.85],
  ['eyes', 2.6],
  ['run', 1.8],
  ['silence', 1.95],
  ['normal', 1.75],
  ['upstairs', 2.8],
  // 08 — İKİNCİ KAT
  ['slogans', 2.3],
  ['staff', 1.75],
  ['flicker', 2.65],
  ['cut', 2.2],
  ['lab1', 2.75],
  ['chase', 1.9],
  ['room', 2.4],
  ['lab2', 1.95],
  ['zoned', 1.05],
  ['code', 1.35],
  ['terminals', 2.9],
  ['voice', 1.15],
  ['swarm', 2.05],
  ['nurse', 2.65],
  ['fade', 1.85],
  // 09 — SEDYE
  ['stretcher', 1.35],
  ['lab3', 2.1],
  ['veyl', 1.95],
  ['libet', 1.9],
  ['marks', 2.45],
  ['crack', 2.75],
  ['lab4', 2.25],
  ['fingers', 2.8],
  ['narrator', 2.05],
  ['cover', 2.9],
  // 10 — PERDE
  ['third', 2.5],
  ['layer', 2.1],
  ['schema', 2.9],
  ['want', 1.8],
  ['face', 3.55],
  ['panic', 2.3],
  ['bring', 0.95],
  ['heavens', 3.1],
  ['hands', 0.95],
  ['kitchen', 1.4],
  ['log', 2.7],
  ['yours', 1.7],
  ['terrible', 2.7],
  ['lab5', 2.1],
  ['real', 2.45],
  ['white', 2],
  // 11 — GERİ SALIM
  ['smallroom', 2.45],
  ['form', 2.6],
  ['goodday', 2.25],
  ['lobby', 1.45],
  ['cantina', 2.3],
  ['window', 2.3],
  // 12 — DENEY
  ['green', 1.9],
  ['harika', 2.5],
  ['notes', 2.1],
  ['rings', 2.55],
  ['next', 1.9],
  ['signal', 1.8],
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
