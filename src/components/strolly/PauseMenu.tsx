'use client'

/** PAUSED: the story holds still behind blurred glass until the reader returns. */
import { useRef } from 'react'
import { useT } from '@/lib/i18n'
import { MenuButton, useMenuKeys } from './ui'

type Props = {
  open: boolean
  title: string
  chapter: string
  onResume: () => void
  onRestartChapter: () => void
  onStories: () => void
  onSettings: () => void
  onJournal: (tab: 'journal' | 'discoveries') => void
  onMainMenu: () => void
}

export default function PauseMenu({ open, title, chapter, onResume, onRestartChapter, onStories, onSettings, onJournal, onMainMenu }: Props) {
  const menu = useRef<HTMLElement>(null)
  const t = useT()
  useMenuKeys(menu, open)
  if (!open) return null
  return (
    <div className="overlay pause" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="pause-inner">
        <p className="pause-story">
          {title} <i>·</i> {chapter}
        </p>
        <h2 id="pause-title" className="pause-title">
          {t('pause.title')}
        </h2>
        <nav ref={menu} className="pause-menu" aria-label={t('pause.menu')}>
          <MenuButton tier="primary" sound="close" onClick={onResume} data-autofocus="">
            {t('pause.resume')}
          </MenuButton>
          <MenuButton onClick={onRestartChapter}>{t('pause.restart')}</MenuButton>
          <MenuButton onClick={() => onJournal('journal')} sound="open">
            {t('common.journal')}
          </MenuButton>
          <MenuButton onClick={() => onJournal('discoveries')} sound="open">
            {t('common.discoveries')}
          </MenuButton>
          <MenuButton onClick={onStories} sound="transition">
            {t('pause.choose')}
          </MenuButton>
          <MenuButton tier="utility" onClick={onSettings} sound="open">
            {t('common.settings')}
          </MenuButton>
          <MenuButton tier="utility" onClick={onMainMenu} sound="transition">
            {t('common.mainMenu')}
          </MenuButton>
        </nav>
        <p className="pause-hint" aria-hidden="true">
          {t('pause.hint')}
        </p>
      </div>
    </div>
  )
}
