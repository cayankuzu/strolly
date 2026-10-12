'use client'

/** PAUSED: the story holds still behind blurred glass until the reader returns. */
import { useRef, useState, type KeyboardEvent } from 'react'
import { useT } from '@/lib/i18n'
import { MenuButton, useMenuKeys } from './ui'

export type PauseChapter = { index: number; title: string; unlocked: boolean }

type Props = {
  open: boolean
  title: string
  chapter: string
  /** The story's chapters (those not reached yet are locked) and the one the reading is in. */
  chapters: PauseChapter[]
  current: number | null
  onResume: () => void
  onRestartChapter: () => void
  onChapter: (index: number) => void
  onStories: () => void
  onSettings: () => void
  onJournal: (tab: 'journal' | 'discoveries') => void
  onMainMenu: () => void
}

type Item = 'resume' | 'chapters' | 'journal' | 'discoveries' | 'settings'

const pad = (n: number) => String(n).padStart(2, '0')

export default function PauseMenu({ open, title, chapter, chapters, current, onResume, onRestartChapter, onChapter, onStories, onSettings, onJournal, onMainMenu }: Props) {
  const menu = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const t = useT()
  // Coming back from the journal, the settings or the chapter list, focus returns to the item that opened them.
  // (GameShell keys this menu per pause, so a new pause starts at RESUME.)
  const [back, setBack] = useState<Item>('resume')
  const [view, setView] = useState<'menu' | 'chapters'>('menu')
  const focus = (item: Item) => (back === item ? '' : undefined)
  useMenuKeys(menu, open && view === 'menu')
  useMenuKeys(list, open && view === 'chapters')
  if (!open) return null

  const closeList = () => {
    setBack('chapters')
    setView('menu')
  }
  // Escape leaves the list for the menu (not the pause itself).
  const onListKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    e.stopPropagation()
    closeList()
  }

  return (
    <div className="overlay pause" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="pause-inner">
        <p className="pause-story">
          {title} <i>·</i> {chapter}
        </p>
        <h2 id="pause-title" className="pause-title">
          {t('pause.title')}
        </h2>
        {view === 'menu' ? (
          <nav ref={menu} className="pause-menu" aria-label={t('pause.menu')}>
            <MenuButton tier="primary" sound="close" onClick={onResume} data-autofocus={focus('resume')}>
              {t('pause.resume')}
            </MenuButton>
            <MenuButton onClick={onRestartChapter}>{t('pause.restart')}</MenuButton>
            <MenuButton
              onClick={() => {
                setBack('chapters')
                setView('chapters')
              }}
              sound="open"
              data-autofocus={focus('chapters')}
            >
              {t('select.chapterList')}
            </MenuButton>
            <MenuButton
              onClick={() => {
                setBack('journal')
                onJournal('journal')
              }}
              sound="open"
              data-autofocus={focus('journal')}
            >
              {t('common.journal')}
            </MenuButton>
            <MenuButton
              onClick={() => {
                setBack('discoveries')
                onJournal('discoveries')
              }}
              sound="open"
              data-autofocus={focus('discoveries')}
            >
              {t('common.discoveries')}
            </MenuButton>
            <MenuButton onClick={onStories} sound="transition">
              {t('pause.choose')}
            </MenuButton>
            <MenuButton
              tier="utility"
              onClick={() => {
                setBack('settings')
                onSettings()
              }}
              sound="open"
              data-autofocus={focus('settings')}
            >
              {t('common.settings')}
            </MenuButton>
            <MenuButton tier="utility" onClick={onMainMenu} sound="transition">
              {t('common.mainMenu')}
            </MenuButton>
          </nav>
        ) : (
          <div ref={list} className="pause-chapters ss-chapters" role="group" aria-label={t('select.chooseChapter')} onKeyDown={onListKey}>
            <ol>
              {chapters.map((c) => (
                <li key={c.index}>
                  <button
                    type="button"
                    className="ss-chapter"
                    data-menu-item=""
                    data-autofocus={c.index === current ? '' : undefined}
                    aria-current={c.index === current ? 'step' : undefined}
                    disabled={!c.unlocked}
                    onClick={() => onChapter(c.index)}
                  >
                    <span>{pad(c.index)}</span>
                    <span>{c.unlocked ? c.title : t('select.locked')}</span>
                  </button>
                </li>
              ))}
            </ol>
            <MenuButton tier="utility" sound="close" onClick={closeList}>
              {t('common.back')}
            </MenuButton>
          </div>
        )}
        <p className="pause-hint" aria-hidden="true">
          {t('pause.hint')}
        </p>
      </div>
    </div>
  )
}
