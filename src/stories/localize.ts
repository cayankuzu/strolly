/**
 * Editions of the catalogue per language. The Turkish original is the source
 * of truth (timelines, timing, flags, positions); a translation only replaces
 * strings, by id, and anything it lacks stays Turkish.
 */
import type { Chapter } from './timeline'
import type { Lang, StoryContent, StoryId, StoryTranslation, TimelineView } from './types'
import { STORIES, TRANSLATIONS } from './registry'

function translateTimeline(t: TimelineView, titles: Record<string, string>): TimelineView {
  const chapters: Chapter[] = t.CHAPTERS.map((c) => ({ ...c, title: titles[c.id] ?? c.title }))
  const byId = new Map(chapters.map((c) => [c.id, c]))
  return { ...t, CHAPTERS: chapters, chapterAt: (p: number) => byId.get(t.chapterAt(p).id) ?? t.chapterAt(p) }
}

/** The story in another language (a new object; the original is untouched). */
export function localize(story: StoryContent, tr: StoryTranslation): StoryContent {
  return {
    ...story,
    meta: { ...story.meta, ...Object.fromEntries(Object.entries(tr.meta).filter(([, v]) => v)) },
    timeline: translateTimeline(story.timeline, tr.chapters),
    text: story.text.map((t) => {
      const x = tr.text[t.id]
      return x ? { ...t, lines: x.lines.length ? x.lines : t.lines, sub: x.sub ?? t.sub } : t
    }),
    choices: story.choices.map((g) => {
      const x = tr.choices[g.id]
      if (!x) return g
      return {
        ...g,
        title: x.title ?? g.title,
        prompt: x.prompt ?? g.prompt,
        options: g.options.map((o) => {
          const y = x.options?.[o.id]
          return y ? { ...o, label: y.label ?? o.label, tag: y.tag ?? o.tag, speaker: y.speaker ?? o.speaker, reply: y.reply ?? o.reply } : o
        }),
      }
    }),
    discoveries: story.discoveries.map((d) => {
      const x = tr.discoveries[d.id]
      if (!x) return d
      return { ...d, title: x.title ?? d.title, examine: d.examine ? { verb: x.verb ?? d.examine.verb, lines: x.lines ?? d.examine.lines } : d.examine }
    }),
    captions: story.captions.map((c) => ({ ...c, text: tr.captions[c.text] ?? c.text })),
    transcript: { ...story.transcript, ...tr.transcript },
  }
}

const editions = new Map<Lang, Record<StoryId, StoryContent>>()

/** The whole catalogue in a language (built once per language). */
export function storiesIn(lang: Lang): Record<StoryId, StoryContent> {
  if (lang === 'tr') return STORIES
  let e = editions.get(lang)
  if (!e) {
    e = Object.fromEntries(Object.entries(STORIES).map(([id, s]) => [id, TRANSLATIONS[lang]?.[id as StoryId] ? localize(s, TRANSLATIONS[lang]![id as StoryId]!) : s])) as Record<StoryId, StoryContent>
    editions.set(lang, e)
  }
  return e
}
