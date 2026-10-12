'use client'

/**
 * HİKÂYELER — a title selection screen. Moving over a title brings its place
 * into the background (and its sound into the room); selecting it plays it.
 * Each story shows only what a player should know before starting: a
 * question, a mood, a length — and how far they have come.
 */
import { useEffect, useRef, useState } from 'react'
import { STORY_ORDER } from '@/stories/registry'
import type { StoryId } from '@/stories/types'
import type { StorySave } from '@/lib/save'
import { useStories, useT, type Translate } from '@/lib/i18n'
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

function status(t: Translate, save: StorySave | null | undefined, chapters: number) {
  if (!save) return t('select.new')
  if (save.completed) return t('common.completed')
  return t('common.chapterOf', { n: pad(save.chapter), total: pad(chapters) })
}

export default function StorySelect({ active, saves, focus, onFocus, onPlay, onBack }: Props) {
  const listRef = useRef<HTMLOListElement>(null)
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const play = useUiSound()
  const t = useT()
  const stories = useStories()
  const id = focus ?? STORY_ORDER[0]
  const story = stories[id]
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
          <span aria-hidden="true">←</span> {t('common.mainMenu')}
        </button>
        <h1 id="stories-title" className="ss-title">
          {t('common.stories')}
        </h1>
      </header>

      <ol ref={listRef} className="ss-list">
        {STORY_ORDER.map((sid) => {
          const s = stories[sid]
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
                <span className="ss-name" data-long={s.meta.title.length > 14 || undefined}>
                  {s.meta.title}
                </span>
                {sv?.completed && <span className="ss-done" aria-label={t('select.doneLabel')} />}
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
          <span>{t('select.minutes', { n: story.meta.minutes })}</span>
          <span>{t(chapters.length === 1 ? 'select.chaptersOne' : 'select.chapters', { n: chapters.length })}</span>
        </p>
        <h2 className="ss-detail-title">{story.meta.title}</h2>
        <p className="ss-hook">{story.meta.hook}</p>
        <p className="ss-tags">{story.meta.tags}</p>
        {story.meta.warning && <p className="ss-warning">{story.meta.warning}</p>}
        <p className="ss-status" data-state={save?.completed ? 'done' : save ? 'progress' : 'new'}>
          {status(t, save, chapters.length)}
        </p>

        {!chaptersOpen ? (
          <div className="ss-actions">
            {save && !save.completed ? (
              <>
                <MenuButton tier="primary" sound="transition" onClick={() => onPlay(id, save.chapter)} sub={t('select.resumeSub', { n: pad(save.chapter), title: chapters[save.chapter - 1]?.title ?? '' })}>
                  {t('common.continue')}
                </MenuButton>
                <MenuButton sound="transition" onClick={() => onPlay(id)}>
                  {t('select.restart')}
                </MenuButton>
              </>
            ) : (
              <MenuButton tier="primary" sound="transition" onClick={() => onPlay(id)}>
                {save?.completed ? t('common.playAgain') : t('select.play')}
              </MenuButton>
            )}
            {save && (
              <MenuButton tier="utility" sound="open" onClick={() => setChaptersOpen(true)}>
                {t('select.chapterList')}
              </MenuButton>
            )}
          </div>
        ) : (
          <div className="ss-chapters" role="group" aria-label={t('select.chooseChapter')}>
            <ol>
              {chapters.map((c) => {
                const open = unlocked(c.index)
                return (
                  <li key={c.id}>
                    <button type="button" className="ss-chapter" disabled={!open} onClick={() => onPlay(id, c.index)} onMouseEnter={() => open && play('hover')}>
                      <span>{pad(c.index)}</span>
                      <span>{open ? c.title : t('select.locked')}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <MenuButton tier="utility" sound="close" onClick={() => setChaptersOpen(false)}>
              {t('common.back')}
            </MenuButton>
          </div>
        )}
      </div>
    </section>
  )
}
