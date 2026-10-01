'use client'

/**
 * The story HUD. One component for every story (story data and theme tint
 * it). As little as possible, and less when the story peaks:
 *
 *   top left      story title, chapter
 *   top right     progress %, sound, menu (pause)
 *   bottom        the chapter line  01 ── 02 ── ● ── 04
 *   center        interaction prompt, what an examined thing reveals,
 *                 captions, a whisper when something is about to be missed
 *
 * Per-frame values (progress, quiet, idle) are written to the DOM directly;
 * React re-renders only when a chapter or a message changes.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Discovery, StoryContent } from '@/stories/types'

export type HudHandle = {
  /** `off`: how far (radians) the reader's look is from the shot's framing. */
  update: (p: number, quiet: boolean, idle: boolean, off: number) => void
  /** Something was noticed: a small glint, nothing more. */
  noticed: () => void
}

export type HudMessage = { id: number; kind: 'saved' | 'chapter' | 'caption' | 'examine'; lines: string[]; sub?: string }

type Props = {
  story: StoryContent
  soundOn: boolean
  onToggleSound: () => void
  onMenu: () => void
  /** Bring the look back to the shot (shown only once the reader has turned away). */
  onRecenter: () => void
  prompt: Discovery | null
  hint: 'around' | 'behind' | null
  messages: HudMessage[]
  onboarding: boolean
  touch: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

const GameHUD = forwardRef<HudHandle, Props>(function GameHUD({ story, soundOn, onToggleSound, onMenu, onRecenter, prompt, hint, messages, onboarding, touch }, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const glintRef = useRef<HTMLSpanElement>(null)
  const [chapter, setChapter] = useState(1)
  const state = useRef({ chapter: 1, quiet: null as boolean | null, idle: null as boolean | null, pct: -1, p: -1, turned: false })
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (wakeTimer.current && clearTimeout(wakeTimer.current)), [])

  useImperativeHandle(ref, () => ({
    update(p, quiet, idle, off) {
      const s = state.current
      const root = rootRef.current
      if (!root) return
      const c = story.timeline.chapterAt(p).index
      if (c !== s.chapter) {
        s.chapter = c
        setChapter(c)
        // A new chapter brings the HUD back for a moment.
        root.dataset.awake = 'true'
        if (wakeTimer.current) clearTimeout(wakeTimer.current)
        wakeTimer.current = setTimeout(() => {
          if (rootRef.current) rootRef.current.dataset.awake = 'false'
        }, 3600)
      }
      if (quiet !== s.quiet) {
        s.quiet = quiet
        root.dataset.quiet = String(quiet)
      }
      if (idle !== s.idle) {
        s.idle = idle
        root.dataset.idle = String(idle)
      }
      // The reset appears once the view has turned away, and goes when it is back (with a margin).
      const turned = s.turned ? off > 0.07 : off > 0.2
      if (turned !== s.turned) {
        s.turned = turned
        root.dataset.turned = String(turned)
      }
      const pct = Math.round(p * 100)
      if (pct !== s.pct && pctRef.current) {
        s.pct = pct
        pctRef.current.textContent = `${pct}%`
      }
      if (Math.abs(p - s.p) > 0.0005 && fillRef.current) {
        s.p = p
        fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`
      }
    },
    noticed() {
      const g = glintRef.current
      if (!g) return
      g.classList.remove('is-on')
      void g.offsetWidth
      g.classList.add('is-on')
    },
  }))

  const chapters = story.timeline.CHAPTERS
  const current = chapters[chapter - 1]

  return (
    <div ref={rootRef} className="hud" data-quiet="false" data-idle="false" data-awake="false" data-turned="false">
      <div className="hud-tl">
        <span className="hud-story">{story.meta.title}</span>
        <span className="hud-chapter">
          BÖLÜM {pad(chapter)} <i>·</i> {current?.title}
        </span>
      </div>

      <div className="hud-tr">
        <span ref={pctRef} className="hud-pct" aria-hidden="true">
          0%
        </span>
        <button type="button" className="hud-btn hud-sound" aria-pressed={soundOn} aria-label={soundOn ? 'Sesi kapat' : 'Sesi aç'} onClick={onToggleSound}>
          <span className="hud-sound-icon" data-on={soundOn} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="hud-btn-label">SES</span>
        </button>
        <button type="button" className="hud-btn hud-menu" aria-label="Duraklat ve menüyü aç" onClick={onMenu}>
          <span className="hud-menu-icon" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="hud-btn-label">MENÜ</span>
        </button>
      </div>

      <div className="hud-line" aria-hidden="true">
        <span className="hud-line-track">
          <span ref={fillRef} className="hud-line-fill" />
          {chapters.map((c) => (
            <i key={c.id} className="hud-line-mark" data-state={c.index < chapter ? 'past' : c.index === chapter ? 'now' : 'next'} style={{ left: `${(c.start * 100).toFixed(2)}%` }}>
              <b>{pad(c.index)}</b>
            </i>
          ))}
        </span>
      </div>

      <span ref={glintRef} className="hud-glint" aria-hidden="true" />

      <button type="button" className="hud-btn hud-recenter" aria-label="Bakışı sıfırla: sahneye geri dön" title="Bakışı sıfırla (C)" onClick={onRecenter}>
        <svg className="hud-recenter-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M13.2 8a5.2 5.2 0 1 1-1.6-3.75" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M12.2 1.6v3.1H9.1" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.3" fill="currentColor" />
        </svg>
        <span className="hud-btn-label">BAKIŞI SIFIRLA</span>
        {!touch && <kbd>C</kbd>}
      </button>

      <div className="hud-center" aria-live="polite">
        {prompt?.examine && (
          <p className="hud-prompt" key={prompt.id}>
            <kbd>{touch ? 'DOKUN' : 'TIKLA'}</kbd> {prompt.examine.verb}
          </p>
        )}
        {!prompt && hint && <p className="hud-hint">{hint === 'behind' ? 'BAZI ŞEYLER ARKANDA' : 'ETRAFINA BAK'}</p>}
      </div>

      <div className="hud-messages" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`hud-msg hud-msg--${m.kind}`}>
            {m.lines.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
            {m.sub && <small>{m.sub}</small>}
          </div>
        ))}
      </div>

      {onboarding && (
        <div className="hud-onboarding" role="note">
          <p>
            <b>{touch ? 'PARMAĞINI YANA SÜRÜKLE' : 'TUT VE SÜRÜKLE'}</b> ETRAFINA BAK
          </p>
          <p>
            <b>{touch ? 'YUKARI KAYDIR' : 'KAYDIR'}</b> HİKÂYE İLERLER
          </p>
        </div>
      )}
    </div>
  )
})

export default GameHUD

/** Messages that come and go on their own (toasts, captions, examine responses). */
export function useHudMessages() {
  const [messages, setMessages] = useState<HudMessage[]>([])
  const seq = useRef(0)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  useEffect(() => {
    const all = timers.current
    return () => all.forEach((t) => clearTimeout(t))
  }, [])
  const push = useCallback((m: Omit<HudMessage, 'id'>, ms: number) => {
    const id = ++seq.current
    setMessages((list) => [...list.filter((x) => x.kind !== m.kind), { ...m, id }])
    const t = setTimeout(() => {
      timers.current.delete(t)
      setMessages((list) => list.filter((x) => x.id !== id))
    }, ms)
    timers.current.add(t)
  }, [])
  const clear = useCallback(() => setMessages([]), [])
  return { messages, push, clear }
}
