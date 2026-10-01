/**
 * Every story as plain, semantic HTML — for screen readers, search engines,
 * the no-WebGL path and anyone who would rather read than scroll.
 * Server-rendered.
 */
import { STORIES, STORY_ORDER } from '@/stories/registry'
import { BRAND, COPYRIGHT } from '@/lib/brand'
import type { StoryContent, TextSegment } from '@/stories/types'

/** Lines worth keeping in prose: no machine labels, titles or the engine diagram. */
const prose = (t: TextSegment) => t.slot !== 'top' && t.kind !== 'engine' && t.kind !== 'iteration' && t.purpose !== 'title' && !(t.slot === 'caption' && t.kind === 'system')

function Story({ story }: { story: StoryContent }) {
  const { meta, timeline, text, transcript } = story
  return (
    <section aria-labelledby={`metin-${meta.id}`} className="transcript-story">
      <h2 id={`metin-${meta.id}`}>
        {String(meta.index).padStart(2, '0')} — {meta.title}
      </h2>
      <p className="transcript-hook">{meta.hook}</p>
      {timeline.CHAPTERS.map((c) => {
        const lines = text.filter((t) => {
          const s = timeline.SEG[t.seg]
          return s.start >= c.start && s.start < c.end && prose(t)
        })
        return (
          <section key={c.id} aria-labelledby={`metin-${meta.id}-${c.id}`}>
            <h3 id={`metin-${meta.id}-${c.id}`}>
              {String(c.index).padStart(2, '0')} — {c.title}
            </h3>
            <p>{transcript[c.id]}</p>
            {lines.map((t) => (
              <p key={t.id}>{story.resolve([...t.lines, t.sub].filter(Boolean).join(' '), story.baseIteration)}</p>
            ))}
          </section>
        )
      })}
    </section>
  )
}

export default function StoryTranscript() {
  return (
    <article id="metin" className="transcript" tabIndex={-1}>
      <a href="#" className="transcript-back">
        ← Deneyime dön
      </a>
      <h1>STROLLY — Hikâyeler</h1>
      <p>Kaydırma hareketiyle ilerleyen, sinematik interaktif kısa hikâyeler.</p>
      {STORY_ORDER.map((id) => (
        <Story key={id} story={STORIES[id]} />
      ))}
      <footer className="transcript-foot">
        <p>{COPYRIGHT}</p>
        <p>
          powered by <a href={BRAND.studioUrl}>{BRAND.studio}</a>
        </p>
      </footer>
    </article>
  )
}
