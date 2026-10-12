/**
 * ÖFKESEL DENEYİM SİMÜLASYONU — the screenplay, measured in scroll.
 *
 * A morning in the boss's office, an evening at ÖFKE NÖBETİ, a white room
 * seen from both sides. The screenplay with the image for every line is in
 * docs/stories/ofke.md.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — İSTİFA (morning, the open-plan office and the boss's office)
  ['open', 1.0],
  ['rise', 1.0],
  ['look', 1.4],
  ['sigh', 1.2],
  ['knock', 2.1],
  ['enter', 1.8],
  ['boss', 1.95],
  ['ask', 2.3],
  ['laugh', 1.8],
  ['shh', 1.6],
  ['leave', 2.3],
  // 02 — YOL (18.00: elevator, stairs, car, the city at dusk)
  ['pack', 1.2],
  ['elevator', 1.0],
  ['stairs', 1.4],
  ['car', 1.4],
  ['route', 1.6],
  ['dusk', 1.4],
  // 03 — HİZMET (the ÖFKE NÖBETİ building, reception, the preparation room)
  ['arrive', 1.0],
  ['welcome', 1.9],
  ['helmet', 2.0],
  ['map', 2.75],
  ['copies', 2.0],
  ['lens', 1.7],
  ['pill', 1.0],
  ['clothes', 1.8],
  // 04 — ODA (the white room becomes the boss's office)
  ['white', 1.2],
  ['close', 1.45],
  ['color', 1.0],
  ['pixels', 1.65],
  ['towel', 2.05],
  ['same', 1.6],
  ['appear', 1.85],
  // 05 — NÖBET (the fit; never shown landing)
  ['trigger', 1.2],
  ['collar', 1.4],
  ['shout', 1.8],
  ['blows', 1.65],
  ['could', 1.4],
  ['monitor', 1.6],
  ['subside', 1.2],
  // 06 — HİZMETİN BEDELİ (the brochure, the locker room, home)
  ['done', 2.0],
  ['how', 1.6],
  ['reveal', 3.05],
  ['again', 2.15],
  ['hallu', 1.4],
  ['nolimit', 2.0],
  ['executed', 1.25],
  ['away', 2.5],
  // 07 — TEMİZLİK (the white room as it is)
  ['staff', 1.0],
  ['corner', 1.6],
  ['drag', 1.4],
  ['cleaners', 1.0],
  ['restart', 1.4],
  // 08 — 333 (the convict line: van, wash, reading room, injection)
  ['van', 1.2],
  ['record', 1.6],
  ['hood', 1.45],
  ['platform', 1.4],
  ['wash', 1.4],
  ['reading', 3.05],
  ['inject', 2.75],
  // 09 — KAPI (the white room from the floor; the door opens)
  ['floor', 1.62],
  ['doorOpens', 1.2],
  ['enters', 1.4],
  ['comes', 1.2],
  ['black', 1.2],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'resign', index: 1, title: 'İSTİFA', first: 'open', last: 'leave' },
  { id: 'road', index: 2, title: 'YOL', first: 'pack', last: 'dusk' },
  { id: 'service', index: 3, title: 'HİZMET', first: 'arrive', last: 'clothes' },
  { id: 'room', index: 4, title: 'ODA', first: 'white', last: 'appear' },
  { id: 'fit', index: 5, title: 'NÖBET', first: 'trigger', last: 'subside' },
  { id: 'price', index: 6, title: 'HİZMETİN BEDELİ', first: 'done', last: 'away' },
  { id: 'clean', index: 7, title: 'TEMİZLİK', first: 'staff', last: 'restart' },
  { id: 'convict', index: 8, title: '333', first: 'van', last: 'inject' },
  { id: 'door', index: 9, title: 'KAPI', first: 'floor', last: 'black' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** One screen of scroll, in viewport-height percent. */
export const SCREEN_VH = 80
