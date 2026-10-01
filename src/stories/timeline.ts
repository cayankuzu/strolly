/**
 * A screenplay measured in scroll. Each story lists its segments with a
 * length in "screens"; progress (0–1) is derived from the cumulative sum, so
 * pacing is tuned by changing lengths and nothing else drifts out of sync.
 */
import { clamp } from '@/lib/math'

export type Segment<Id extends string = string> = { id: Id; start: number; end: number; len: number; index: number; screens: number }

export type ChapterDef<Id extends string = string> = { id: string; index: number; title: string; first: Id; last: Id }
export type Chapter<Id extends string = string> = ChapterDef<Id> & { start: number; end: number }

export function createTimeline<const S extends ReadonlyArray<readonly [string, number]>>(segments: S, chapterDefs: ChapterDef<S[number][0]>[]) {
  type Id = S[number][0]
  const total = segments.reduce((sum, [, len]) => sum + len, 0)
  const SEG = {} as Record<Id, Segment<Id>>
  const list: Segment<Id>[] = []
  let acc = 0
  segments.forEach(([id, screens], index) => {
    const start = acc / total
    acc += screens
    const s = { id: id as Id, start, end: acc / total, len: screens / total, index, screens }
    SEG[id as Id] = s
    list.push(s)
  })

  const chapters: Chapter<Id>[] = chapterDefs.map((c) => ({ ...c, start: SEG[c.first].start, end: SEG[c.last].end }))
  if (process.env.NODE_ENV !== 'production') validate(list, chapters)

  const at = (id: Id, f = 0) => SEG[id].start + SEG[id].len * f
  return {
    SEG,
    SEGMENT_LIST: list,
    TOTAL_SCREENS: total,
    CHAPTERS: chapters,
    at,
    /** Local 0–1 progress of p inside a segment (clamped). */
    local: (p: number, id: Id) => clamp((p - SEG[id].start) / SEG[id].len),
    /** Local 0–1 progress over a sub-range [f0, f1] of a segment. */
    sub: (p: number, id: Id, f0: number, f1: number) => clamp((p - at(id, f0)) / (at(id, f1) - at(id, f0))),
    segmentAt(p: number): Segment<Id> {
      for (const s of list) if (p < s.end) return s
      return list[list.length - 1]
    },
    chapterAt(p: number): Chapter<Id> {
      for (const c of chapters) if (p < c.end) return c
      return chapters[chapters.length - 1]
    },
  }
}

function validate(list: Segment[], chapters: Chapter[]) {
  const ids = new Set<string>()
  for (const s of list) {
    if (ids.has(s.id)) throw new Error(`[timeline] duplicate segment "${s.id}"`)
    ids.add(s.id)
    if (!(s.screens > 0)) throw new Error(`[timeline] segment "${s.id}" must have a positive length`)
  }
  chapters.forEach((c, i) => {
    if (c.start >= c.end) throw new Error(`[timeline] chapter "${c.id}" is empty or reversed`)
    const prev = chapters[i - 1]
    if (prev && Math.abs(prev.end - c.start) > 1e-9) throw new Error(`[timeline] chapter "${c.id}" does not continue "${prev.id}"`)
  })
  if (chapters[0].start !== 0 || Math.abs(chapters[chapters.length - 1].end - 1) > 1e-9) throw new Error('[timeline] chapters must cover 0–1')
}

export type Timeline = ReturnType<typeof createTimeline>
