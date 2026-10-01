'use client'

/**
 * The narrative rail and the words around the image. One GSAP master
 * timeline with a sub-timeline per chapter, measured in story progress: the
 * frame loop seeks it, so every line scrubs forward and backward with the
 * scroll and is always in sync with the picture.
 *
 * Slots: the rail (left for TEKERRÜR, right for EMANET, bottom on phones)
 * holds at most a chapter label, one caption and one to three sentences.
 * Revelations take the centre; machine labels the top.
 */
import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { meets, type StoryContent, type TextSegment } from '@/stories/types'
import { textSpan } from '@/stories/registry'

export type NarrativeHandle = { seek: (p: number) => void }

type Props = { story: StoryContent; iteration: number; fallback: boolean; reduced: boolean; flags: string[] }

type Item =
  | { key: string; type: 'text'; seg: TextSegment; who?: string; a: number; b: number; fade: number }
  | { key: string; type: 'chapter'; index: number; title: string; total: number; a: number; b: number; fade: number }
  | { key: string; type: 'scene'; text: string; a: number; b: number; fade: number }

const DEFAULT_FADE = 0.35

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Lays out the story's words as timed items. Pure: same story and choices, same plan. */
function plan(story: StoryContent, fallback: boolean, flags: ReadonlySet<string>) {
  const { timeline, text, quiet } = story
  const screen = 1 / timeline.TOTAL_SCREENS
  const items: Item[] = []
  const paired = new Set<string>()
  const whoOf = new Map<string, string>()
  // A caption with exactly the same timing as a rail line is that line's speaker.
  // Lines that belong to choices the reader did not make are left out.
  const live = text.filter((t) => meets(t.when, flags))
  for (const c of live) {
    if (c.slot !== 'caption') continue
    const line = live.find((r) => r.slot === 'rail' && r.seg === c.seg && r.from === c.from && r.to === c.to)
    if (line) {
      paired.add(c.id)
      whoOf.set(line.id, c.lines[0])
    }
  }
  for (const seg of live) {
    if (paired.has(seg.id)) continue
    if (seg.world && !fallback) continue
    const [a, b] = textSpan(story, seg)
    items.push({ key: seg.id, type: 'text', seg, who: whoOf.get(seg.id), a, b, fade: (seg.fade ?? DEFAULT_FADE) * screen })
  }
  // Chapter labels arrive a moment into each chapter, never over a quiet passage.
  for (const c of timeline.CHAPTERS) {
    let a = c.start + 0.3 * screen
    for (const [q0, q1] of quiet) if (a >= q0 && a < q1) a = q1 + 0.15 * screen
    const b = Math.min(a + 1.6 * screen, c.end - 0.1 * screen)
    if (b - a > 0.5 * screen) items.push({ key: `chapter-${c.id}`, type: 'chapter', index: c.index, title: c.title, total: timeline.CHAPTERS.length, a, b, fade: 0.3 * screen })
  }
  if (fallback) {
    for (const c of timeline.CHAPTERS) {
      const t = story.transcript[c.id]
      if (t) items.push({ key: `scene-${c.id}`, type: 'scene', text: t, a: c.start + 0.05 * screen, b: c.end - 0.05 * screen, fade: 0.3 * screen })
    }
  }
  return items
}

const onRail = (i: Item) => i.type === 'chapter' || (i.type === 'text' && (i.seg.slot === 'rail' || i.seg.slot === 'caption'))

function Lines({ seg, who, resolve }: { seg: TextSegment; who?: string; resolve: (s: string) => string }) {
  if (seg.kind === 'engine') {
    return (
      <ol className="nl-engine">
        {seg.lines.map((line) => (
          <li key={line} className="nl-line">
            {line}
          </li>
        ))}
      </ol>
    )
  }
  return (
    <>
      {who && <span className="nl-who">{who}</span>}
      {seg.lines.map((line, i) => (
        <span key={i} className="nl-line">
          {resolve(line)}
        </span>
      ))}
      {seg.sub && <span className="nl-sub">{resolve(seg.sub)}</span>}
    </>
  )
}

const NarrativeLayer = forwardRef<NarrativeHandle, Props>(function NarrativeLayer({ story, iteration, fallback, reduced, flags }, ref) {
  const root = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const master = useRef<gsap.core.Timeline | null>(null)
  const last = useRef(0)
  const flagKey = flags.join('|')
  const items = useMemo(() => plan(story, fallback, new Set(flagKey ? flagKey.split('|') : [])), [story, fallback, flagKey])
  const railSpans = useMemo(() => items.filter(onRail).map((i) => [i.a - i.fade, i.b] as const), [items])
  const shadeOn = useRef<boolean | null>(null)
  const resolve = (s: string) => story.resolve(s, iteration)

  useImperativeHandle(ref, () => ({
    seek(p: number) {
      last.current = p
      master.current?.time(p, true)
      let on = false
      for (const [a, b] of railSpans)
        if (p >= a && p <= b) {
          on = true
          break
        }
      if (on !== shadeOn.current && shade.current) {
        shadeOn.current = on
        shade.current.dataset.on = String(on)
      }
    },
  }))

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const { timeline } = story
    const tl = gsap.timeline({ paused: true })
    const chapters = new Map<string, gsap.core.Timeline>()
    const chapterOf = (p: number) => timeline.chapterAt(p)
    const enter = reduced ? { autoAlpha: 1 } : { autoAlpha: 1, y: 0, filter: 'blur(0px)' }
    const from = reduced ? { autoAlpha: 0 } : { autoAlpha: 0, y: 10, filter: 'blur(6px)' }
    const leave = reduced ? { autoAlpha: 0 } : { autoAlpha: 0, y: -6, filter: 'blur(4px)' }

    for (const item of items) {
      const node = el.querySelector<HTMLElement>(`[data-item="${item.key}"]`)
      if (!node) continue
      const chapter = chapterOf(Math.max(0, item.a))
      let ctl = chapters.get(chapter.id)
      if (!ctl) {
        ctl = gsap.timeline()
        chapters.set(chapter.id, ctl)
        tl.add(ctl, chapter.start)
      }
      const c0 = chapter.start
      const fade = item.fade
      const lines = node.querySelectorAll<HTMLElement>('.nl-line')
      const stagger = item.type === 'text' ? item.seg.stagger : undefined
      if (item.a <= 0) {
        gsap.set(node, { autoAlpha: 1 })
      } else if (stagger && lines.length > 1) {
        gsap.set(node, { autoAlpha: 0 })
        gsap.set(lines, { autoAlpha: 0 })
        ctl.set(node, { autoAlpha: 1 }, item.a - c0)
        // A card held past the last frame staggers over what can actually be read.
        const span = Math.min(item.b, 1) - item.a
        lines.forEach((line, i) => {
          const s = item.a + i * stagger * span
          ctl!.fromTo(line, from, { ...enter, duration: fade, ease: 'power2.out', immediateRender: false }, s - c0)
        })
      } else {
        gsap.set(node, { autoAlpha: 0 })
        ctl.fromTo(node, from, { ...enter, duration: fade, ease: 'power2.out', immediateRender: false }, item.a - c0)
      }
      // Lines that run past the end stay on the last frame.
      if (item.b < 1.02) ctl.to(node, { ...leave, duration: fade, ease: 'power1.in' }, item.b - fade - c0)
    }
    master.current = tl
    tl.time(last.current, true)
    return () => {
      tl.kill()
      master.current = null
    }
  }, [items, story, reduced, iteration])

  const node = (item: Item) => {
    if (item.type === 'chapter')
      return (
        <div key={item.key} data-item={item.key} className="nl-item nl-chapter">
          <span className="nl-chapter-num">
            {pad(item.index)} <i>/ {pad(item.total)}</i>
          </span>
          <span className="nl-chapter-title">{item.title}</span>
        </div>
      )
    if (item.type === 'scene')
      return (
        <p key={item.key} data-item={item.key} className="nl-item nl-scene">
          {item.text}
        </p>
      )
    const s = item.seg
    return (
      <div key={item.key} data-item={item.key} className={`nl-item nl--${s.kind}${s.strong ? ' nl--strong' : ''}${s.world ? ' nl--world' : ''}`}>
        <Lines seg={s} who={item.who} resolve={resolve} />
      </div>
    )
  }

  const bySlot = (slot: string) => items.filter((i) => i.type === 'text' && i.seg.slot === slot).map(node)

  return (
    <div ref={root} className="narrative" data-rail={story.meta.rail} aria-hidden="true">
      <div ref={shade} className="nl-shade" data-on="false" />
      <div className="nl-rail">
        <div className="nl-lane nl-lane--chapter">{items.filter((i) => i.type === 'chapter').map(node)}</div>
        <div className="nl-lane nl-lane--caption">{bySlot('caption')}</div>
        <div className="nl-lane nl-lane--text">{bySlot('rail')}</div>
      </div>
      <div className="nl-center">{bySlot('center')}</div>
      <div className="nl-top">{bySlot('top')}</div>
      {fallback && <div className="nl-scenes">{items.filter((i) => i.type === 'scene').map(node)}</div>}
    </div>
  )
})

export default NarrativeLayer
