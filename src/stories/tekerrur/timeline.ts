/**
 * TEKERRÜR — the screenplay, measured in scroll. The first version, told in
 * full: one evening in Arif's room of screens, from the moment he wakes at
 * his desk to the moment the machine he built says a single word — and the
 * night after, which has already been recorded.
 *
 * Chapters 1–4 follow the author's text beat by beat (wake, the right door,
 * the robots and the coffee, the archive and the switch). Chapters 5–9 are
 * the first version's: history on one square, the pattern, the record that
 * has not happened yet, the word, and the observer.
 *
 * Chapter order follows the author's text: he goes through the right door
 * (DIŞARISI) before the robots bring the coffee (RUTİN).
 *
 * Sets (see docs/stories/tekerrur.md): the room at the origin, the right-door
 * walkway at x 5…9, the archive behind the left door at x −5…−60, the city
 * square at x 300, the network void at x 600.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — UYANIŞ (late afternoon → sunset)
  ['black', 1.3],
  ['asleep', 2.5],
  ['desk', 3.0],
  ['walls', 3.1],
  ['stream', 1.6],
  ['doors', 3.1],
  ['ceiling', 3.5],
  ['wake', 2.6],
  ['wipe', 2.0],
  ['throw', 2.5],
  // 02 — DIŞARISI (dusk → blue hour; the room empty for forty minutes)
  ['rise', 1.3],
  ['walk', 2.7],
  ['floor', 1.6],
  ['rightDoor', 3.3],
  ['forty', 3.3],
  // 03 — RUTİN (early night; three robots, one coffee)
  ['reopen', 2.2],
  ['robots', 2.2],
  ['sits', 1.6],
  ['reach', 2.5],
  ['sip', 2.4],
  ['thousands', 2.1],
  // 04 — ARŞİV (the left door, the archive, the switch)
  ['hover', 2.1],
  ['toLeft', 1.2],
  ['leftDoor', 1.9],
  ['deep', 2.0],
  ['aisles', 4.2],
  ['core', 2.1],
  ['lever', 2.2],
  ['whistle', 1.5],
  // 05 — TARİH (the red button; one square, five eras)
  ['red', 2.5],
  ['dive', 0.9],
  ['history', 6.5],
  // 06 — ÖRÜNTÜ (four more eras; the network; the spiral; from above)
  ['repeat', 3.6],
  ['network', 3.6],
  ['spiral', 2.6],
  ['above', 2.7],
  // 07 — ANOMALİ (a record after today)
  ['beyond', 1.6],
  ['anomaly', 2.0],
  ['checked', 2.2],
  ['feed', 2.6],
  ['feedWide', 2.8],
  // 08 — TEKERRÜR (the press, the dark, the word)
  ['back', 1.5],
  ['press', 1.7],
  ['dark', 1.2],
  ['word', 2.2],
  ['law', 2.1],
  // 09 — GÖZLEMCİ (the records, the engine, the room again, the observer)
  ['records', 6.0],
  ['engine', 2.5],
  ['again', 2.0],
  ['halt', 1.9],
  ['turn', 1.5],
  ['observer', 2.0],
  ['maybe', 2.2],
  ['end', 1.0],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'awakening', index: 1, title: 'UYANIŞ', first: 'black', last: 'throw' },
  { id: 'outside', index: 2, title: 'DIŞARISI', first: 'rise', last: 'forty' },
  { id: 'routine', index: 3, title: 'RUTİN', first: 'reopen', last: 'thousands' },
  { id: 'archive', index: 4, title: 'ARŞİV', first: 'hover', last: 'whistle' },
  { id: 'history', index: 5, title: 'TARİH', first: 'red', last: 'history' },
  { id: 'pattern', index: 6, title: 'ÖRÜNTÜ', first: 'repeat', last: 'above' },
  { id: 'anomaly', index: 7, title: 'ANOMALİ', first: 'beyond', last: 'feedWide' },
  { id: 'tekerrur', index: 8, title: 'TEKERRÜR', first: 'back', last: 'law' },
  { id: 'observer', index: 9, title: 'GÖZLEMCİ', first: 'records', last: 'end' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** One scroll "screen" in viewport-height percent. */
export const SCREEN_VH = 80

/** The iteration the first reading belongs to. Each pass of the loop adds one. */
export const BASE_ITERATION = 7184

/** The square's eras: TARİH plays the first five over `history`, ÖRÜNTÜ the last four over `repeat`. */
export const ERAS = [
  { year: '1914', word: '' },
  { year: '1917', word: 'SAVAŞ' },
  { year: '1931', word: 'KRİZ' },
  { year: '1944', word: 'ENKAZ' },
  { year: '1962', word: 'TOPARLANMA' },
  { year: '1991', word: 'YENİ ÇATIŞMA' },
  { year: '2008', word: 'YENİ KRİZ' },
  { year: '2029', word: '' },
  { year: '2041', word: '' },
] as const

/** Which era of the square shows at p, and how far into it (0–1). */
export function eraAt(p: number): { era: number; t: number } {
  if (p < SEG.repeat.start) {
    const u = local(p, 'history') * 5
    const era = Math.min(4, Math.floor(u))
    return { era, t: u - era }
  }
  const u = local(p, 'repeat') * 4
  const era = Math.min(3, Math.floor(u))
  return { era: 5 + era, t: u - era }
}

/**
 * The records in GÖZLEMCİ: five nights, one per fifth of `records`. Record k
 * is iteration + k (k 0 glasses, 1 the cloth, 2 the finger over the button,
 * 3 the catch, 4 the walk to the right door — see the screenplay).
 */
export function recordAt(p: number): { record: number; t: number } {
  const u = local(p, 'records') * 5
  const record = Math.min(4, Math.floor(u))
  return { record, t: u - record }
}
