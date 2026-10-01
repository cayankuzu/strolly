'use client'

/**
 * HİKÂYELER — a title selection screen. Moving over a title brings its place
 * into the background (and its sound into the room); selecting it plays it.
 * Each story shows only what a player should know before starting: a
 * question, a mood, a length — and how far they have come.
 */
import { useEffect, useRef, useState } from 'react'
import { STORIES, STORY_ORDER } from '@/stories/registry'
import type { StoryId } from '@/stories/types'
import type { StorySave } from '@/lib/save'
import { STORY_ART } from './StoryArt'
import { MenuButton, useMenuKeys, useUiSound } from './ui'

type Props = {
  active: boolean
  saves: Partial<Record<StoryId, StorySave | null>>
  focus: StoryId | null
  onFocus: (id: StoryId) => void
  onPlay: (id: StoryId, chapter?: number) => void
  onBack: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

function status(save: StorySave | null | undefined, chapters: number) {
  if (!save) return 'YENİ'
  if (save.completed) return 'TAMAMLANDI'
  return `BÖLÜM ${pad(save.chapter)} / ${pad(chapters)}`
}

export default function StorySelect({ active, saves, focus, onFocus, onPlay, onBack }: Props) {
  const listRef = useRef<HTMLOListElement>(null)
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const play = useUiSound()
  const id = focus ?? STORY_ORDER[0]
  const story = STORIES[id]
  const save = saves[id] ?? null
  const chapters = story.timeline.CHAPTERS
  const Art = STORY_ART[id]
  useMenuKeys(listRef, active && !chaptersOpen, false)

  // Focus the remembered title when the screen opens.
  useEffect(() => {
    if (!active) return
    listRef.current?.querySelector<HTMLElement>(`[data-story="${id}"]`)?.focus({ preventScroll: true })
    // Only when the screen becomes active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const unlocked = (index: number) => !!save && (save.completed || index <= save.maxChapter)

  return (
    <section className="screen story-select" aria-hidden={!active} inert={!active} aria-labelledby="stories-title" data-lenis-prevent data-theme={story.meta.theme}>
      <div className="ss-preview" aria-hidden="true">
        {STORY_ORDER.map((sid) => {
          const A = STORY_ART[sid]
          return (
            <div key={sid} className="ss-art" data-on={sid === id}>
              <A />
            </div>
          )
        })}
      </div>

      <header className="ss-head">
        <button type="button" className="ss-back" onClick={onBack} onMouseEnter={() => play('hover')}>
          <span aria-hidden="true">←</span> ANA MENÜ
        </button>
        <h1 id="stories-title" className="ss-title">
          HİKÂYELER
        </h1>
      </header>

      <ol ref={listRef} className="ss-list">
        {STORY_ORDER.map((sid) => {
          const s = STORIES[sid]
          const sv = saves[sid]
          return (
            <li key={sid}>
              <button
                type="button"
                data-menu-item=""
                data-story={sid}
                className="ss-item"
                aria-current={sid === id}
                aria-describedby="ss-detail"
                onMouseEnter={() => {
                  if (sid !== id) {
                    play('hover')
                    setChaptersOpen(false)
                    onFocus(sid)
                  }
                }}
                onFocus={() => {
                  if (sid !== id) {
                    setChaptersOpen(false)
                    onFocus(sid)
                  }
                }}
                onClick={() => {
                  // On touch the first tap only brings the story forward; the next one plays it.
                  if (sid !== id) {
                    play('hover')
                    setChaptersOpen(false)
                    onFocus(sid)
                    return
                  }
                  play('transition')
                  onPlay(sid, sv && !sv.completed ? sv.chapter : undefined)
                }}
              >
                <span className="ss-index">{pad(s.meta.index)}</span>
                <span className="ss-name">{s.meta.title}</span>
                {sv?.completed && <span className="ss-done" aria-label="tamamlandı" />}
              </button>
            </li>
          )
        })}
      </ol>

      <div id="ss-detail" className="ss-detail" aria-live="polite">
        <div className="ss-detail-art" aria-hidden="true">
          <Art />
        </div>
        <p className="ss-meta">
          <span>{story.meta.mood}</span>
          <span>~{story.meta.minutes} DK</span>
          <span>{chapters.length} BÖLÜM</span>
        </p>
        <h2 className="ss-detail-title">{story.meta.title}</h2>
        <p className="ss-hook">{story.meta.hook}</p>
        <p className="ss-tags">{story.meta.tags}</p>
        <p className="ss-status" data-state={save?.completed ? 'done' : save ? 'progress' : 'new'}>
          {status(save, chapters.length)}
        </p>

        {!chaptersOpen ? (
          <div className="ss-actions">
            {save && !save.completed ? (
              <>
                <MenuButton tier="primary" sound="transition" onClick={() => onPlay(id, save.chapter)} sub={`BÖLÜM ${pad(save.chapter)} · ${chapters[save.chapter - 1]?.title ?? ''}`}>
                  DEVAM ET
                </MenuButton>
                <MenuButton sound="transition" onClick={() => onPlay(id)}>
                  BAŞTAN BAŞLA
                </MenuButton>
              </>
            ) : (
              <MenuButton tier="primary" sound="transition" onClick={() => onPlay(id)}>
                {save?.completed ? 'TEKRAR OYNA' : 'OYNA'}
              </MenuButton>
            )}
            {save && (
              <MenuButton tier="utility" sound="open" onClick={() => setChaptersOpen(true)}>
                BÖLÜMLER
              </MenuButton>
            )}
          </div>
        ) : (
          <div className="ss-chapters" role="group" aria-label="Bölüm seç">
            <ol>
              {chapters.map((c) => {
                const open = unlocked(c.index)
                return (
                  <li key={c.id}>
                    <button type="button" className="ss-chapter" disabled={!open} onClick={() => onPlay(id, c.index)} onMouseEnter={() => open && play('hover')}>
                      <span>{pad(c.index)}</span>
                      <span>{open ? c.title : 'KİLİTLİ'}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <MenuButton tier="utility" sound="close" onClick={() => setChaptersOpen(false)}>
              GERİ
            </MenuButton>
          </div>
        )}
      </div>
    </section>
  )
}
