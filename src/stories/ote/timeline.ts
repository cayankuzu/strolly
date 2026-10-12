/**
 * ÖTE — the screenplay, measured in scroll.
 *
 * A man signs away his fortune and his way back while "we", the company's
 * people, watch through glass. A heavy door, an elevator that rises past the
 * top of its building into a shuttle, thirty-two others. Launch; years of a
 * quiet, almost-holiday voyage; the pale blue dot; the event horizon of the
 * black hole at the centre of the galaxy. Then the company closes the file —
 * and turns to the next client. Eight chapters. Full screenplay:
 * docs/stories/ote.md.
 */
import { createTimeline } from '../timeline'

const SEGMENTS = [
  // 01 — İMZA (the signing room, seen from behind the glass)
  ['open', 1.4],
  ['glass', 1.7],
  ['pen', 1.8],
  ['pages', 2.1],
  ['refund', 1.7],
  ['lastPage', 3.1],
  ['fortune', 3.1],
  ['sign', 1.7],
  // 02 — KAPI (the opposite door, the corridor, the elevator)
  ['nod', 1.7],
  ['door', 2.9],
  ['elevator', 1.9],
  ['rise', 1.6],
  ['topFloor', 2.5],
  // 03 — YOLCULAR (the shuttle cabin, thirty-three seats)
  ['cabin', 1.7],
  ['faces', 2.8],
  ['announce', 2.3],
  ['seat', 1.8],
  // 04 — KALKIŞ (launch, blue to black)
  ['ignition', 1.6],
  ['gforce', 2.3],
  ['space', 2.7],
  // 05 — YOLCULUK (the voyage: systems, the beach, the lounge)
  ['years', 2.6],
  ['beach', 2.1],
  ['lounge', 3.8],
  // 06 — SOLUK MAVİ NOKTA (the window, the reports, the years)
  ['windows', 1.9],
  ['lastLook', 3.0],
  ['dataLink', 3.45],
  ['report', 2.1],
  ['yearsPass', 1.9],
  // 07 — VARIŞ (the black hole, the horizon)
  ['arrive', 2.4],
  ['approach', 2.8],
  ['horizon', 1.5],
  ['drift', 3.0],
  ['song', 2.0],
  // 08 — ANAHTAR (the mission room on Earth; the next client)
  ['mission', 2.6],
  ['readout', 2.4],
  ['routine', 2.5],
  ['wall', 4.0],
  ['key', 2.0],
  ['next', 2.3],
] as const

export type SegmentId = (typeof SEGMENTS)[number][0]

export const timeline = createTimeline(SEGMENTS, [
  { id: 'imza', index: 1, title: 'İMZA', first: 'open', last: 'sign' },
  { id: 'kapi', index: 2, title: 'KAPI', first: 'nod', last: 'topFloor' },
  { id: 'yolcular', index: 3, title: 'YOLCULAR', first: 'cabin', last: 'seat' },
  { id: 'kalkis', index: 4, title: 'KALKIŞ', first: 'ignition', last: 'space' },
  { id: 'yolculuk', index: 5, title: 'YOLCULUK', first: 'years', last: 'lounge' },
  { id: 'nokta', index: 6, title: 'SOLUK MAVİ NOKTA', first: 'windows', last: 'yearsPass' },
  { id: 'varis', index: 7, title: 'VARIŞ', first: 'arrive', last: 'song' },
  { id: 'anahtar', index: 8, title: 'ANAHTAR', first: 'mission', last: 'next' },
])

export const { SEG, SEGMENT_LIST, TOTAL_SCREENS, CHAPTERS, at, local, sub, segmentAt, chapterAt } = timeline

/** Scroll length of one screen, in viewport heights (percent). */
export const SCREEN_VH = 82

/**
 * The ship's own day counter (GÖREV GÜNÜ), for the corridor and lounge
 * screens. Nothing on the ground; day 1 when the engines cut; the first weeks
 * of the voyage; the years of the time-lapse; and at the black hole the
 * ship's clock barely moves — it is the outside that speeds up.
 */
const DAYS: Array<readonly [number, number]> = [
  [at('space', 0.45), 0],
  [at('space', 0.5), 1],
  [at('years'), 3],
  [at('lounge', 1), 19],
  [at('windows'), 24],
  [at('lastLook', 1), 41],
  [at('dataLink', 0.01), 63],
  [at('report', 1), 212],
  [at('yearsPass', 0.05), 230],
  [at('yearsPass', 0.95), 4117],
  [at('arrive'), 4380],
  [at('song', 1), 4381],
]

/** Whole days since the engines cut (0 before), as a function of progress. */
export function missionDay(p: number) {
  if (p <= DAYS[0][0]) return 0
  for (let i = 1; i < DAYS.length; i++) {
    const [p1, d1] = DAYS[i]
    if (p < p1) {
      const [p0, d0] = DAYS[i - 1]
      return Math.floor(d0 + ((p - p0) / (p1 - p0)) * (d1 - d0))
    }
  }
  return DAYS[DAYS.length - 1][1]
}

/** "4.117" — the counter as the screens print it (Turkish thousands dot). */
export const dayText = (d: number) => String(d).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
