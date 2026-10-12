'use client'

/** The smaller screens of the game: the archive, the end of a story, a confirmation, leaving, a scene that failed. */
import { useRef } from 'react'
import { STORY_ORDER } from '@/stories/registry'
import type { StoryId } from '@/stories/types'
import type { StorySave } from '@/lib/save'
import { useStories, useT } from '@/lib/i18n'
import { MenuButton, useMenuKeys, useUiSound } from './ui'

/**
 * ARŞİV: what each story left behind — how far it was read, what was noticed
 * (by name; the rest stays unknown) — and who made what.
 */
export function ArchiveScreen({ active, saves, onBack }: { active: boolean; saves: Partial<Record<StoryId, StorySave | null>>; onBack: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  const t = useT()
  const play = useUiSound()
  const stories = useStories()
  useMenuKeys(menu, active)
  return (
    <section className="screen credits archive" aria-hidden={!active} inert={!active} aria-labelledby="archive-title" data-lenis-prevent>
      <div ref={menu} className="credits-inner">
        {/* The way back is at the top too (and takes focus), as on the story select. */}
        <header className="ss-head archive-top">
          <button type="button" className="ss-back" data-menu-item="" data-autofocus="" onClick={onBack} onMouseEnter={() => play('hover')}>
            <span aria-hidden="true">←</span> {t('common.mainMenu')}
          </button>
          <h1 id="archive-title" className="ss-title">
            {t('archive.title')}
          </h1>
        </header>
        <ol className="archive-list">
          {STORY_ORDER.map((id) => {
            const st = stories[id]
            const sv = saves[id]
            const found = st.discoveries.filter((d) => sv?.discoveries.includes(d.id))
            const state = sv?.completed ? t('common.completed') : sv ? t('common.chapterOf', { n: pad(sv.maxChapter), total: pad(st.timeline.CHAPTERS.length) }) : t('archive.unread')
            return (
              <li key={id} className="archive-story" data-read={!!sv}>
                <p className="archive-head">
                  <span className="archive-index">{pad(st.meta.index)}</span>
                  <span className="archive-name">{st.meta.title}</span>
                  <span className="archive-state">{state}</span>
                </p>
                <p className="archive-found">
                  {t('common.discoveries')} {pad(found.length)}/{pad(st.discoveries.length)}
                  {found.length > 0 && <span> · {found.map((d) => d.title).join(' · ')}</span>}
                </p>
              </li>
            )
          })}
        </ol>
        <h2 className="credits-title archive-sub">{t('archive.credits')}</h2>
        <dl className="credits-list">
          <dt>STROLLY</dt>
          <dd>{t('credits.about')}</dd>
          <dt>{t('credits.media')}</dt>
          <dd>{t('credits.mediaBody')}</dd>
          <dt>{t('credits.type')}</dt>
          <dd>{t('credits.typeBody')}</dd>
          <dt>{t('credits.libs')}</dt>
          <dd>{t('credits.libsBody')}</dd>
        </dl>
        <div className="credits-actions">
          <MenuButton tier="primary" sound="close" onClick={onBack}>
            {t('common.mainMenu')}
          </MenuButton>
        </div>
      </div>
    </section>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

export function CompleteScreen({
  open,
  title,
  seen,
  total,
  loops,
  onReplay,
  onStories,
  onMenu,
}: {
  open: boolean
  title: string
  seen: number
  total: number
  loops: boolean
  onReplay: () => void
  onStories: () => void
  onMenu: () => void
}) {
  const menu = useRef<HTMLDivElement>(null)
  const t = useT()
  useMenuKeys(menu, open, false)
  if (!open) return null
  return (
    <div className="complete" role="region" aria-labelledby="complete-title">
      <p className="complete-kicker">{t('complete.kicker')}</p>
      <h2 id="complete-title" className="complete-title">
        {title}
      </h2>
      {total > 0 && (
        <p className="complete-seen">
          {t('complete.seen', { seen: pad(seen), total: pad(total) })}
        </p>
      )}
      <div ref={menu} className="complete-actions">
        <MenuButton tier="primary" sound="transition" onClick={onReplay}>
          {t('common.playAgain')}
        </MenuButton>
        <MenuButton sound="transition" onClick={onStories}>
          {t('common.stories')}
        </MenuButton>
        <MenuButton tier="utility" sound="transition" onClick={onMenu}>
          {t('common.mainMenu')}
        </MenuButton>
      </div>
      {loops && <p className="complete-loop">{t('complete.loop')}</p>}
    </div>
  )
}

export function ConfirmDialog({ open, title, body, confirm, onConfirm, onCancel }: { open: boolean; title: string; body: string; confirm: string; onConfirm: () => void; onCancel: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  const t = useT()
  useMenuKeys(menu, open)
  if (!open) return null
  return (
    <div className="overlay confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body">
      <div className="confirm-inner">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-body">{body}</p>
        <div ref={menu} className="confirm-actions">
          <MenuButton tier="secondary" sound="close" onClick={onCancel} data-autofocus="">
            {t('confirm.cancel')}
          </MenuButton>
          <MenuButton tier="primary" sound="warning" onClick={onConfirm}>
            {confirm}
          </MenuButton>
        </div>
      </div>
    </div>
  )
}

export function Farewell({ active, onReturn }: { active: boolean; onReturn: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  const t = useT()
  useMenuKeys(menu, active)
  return (
    <section className="screen farewell" aria-hidden={!active} inert={!active} aria-label={t('farewell.label')}>
      <p className="farewell-mark">STROLLY</p>
      <p className="farewell-line">{t('farewell.line')}</p>
      <div ref={menu}>
        <MenuButton tier="utility" sound="open" onClick={onReturn}>
          {t('farewell.back')}
        </MenuButton>
      </div>
    </section>
  )
}

export function SceneError({ open, onRetry, onStories }: { open: boolean; onRetry: () => void; onStories: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  const t = useT()
  useMenuKeys(menu, open)
  if (!open) return null
  return (
    <div className="overlay scene-error" role="alertdialog" aria-modal="true" aria-labelledby="scene-error-title">
      <div className="confirm-inner">
        <h2 id="scene-error-title">{t('error.title')}</h2>
        <p>{t('error.body')}</p>
        <div ref={menu} className="confirm-actions">
          <MenuButton tier="primary" sound="transition" onClick={onRetry} data-autofocus="">
            {t('error.retry')}
          </MenuButton>
          <MenuButton sound="close" onClick={onStories}>
            {t('common.stories')}
          </MenuButton>
        </div>
      </div>
    </div>
  )
}
