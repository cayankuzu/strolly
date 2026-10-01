'use client'

/** PAUSED: the story holds still behind blurred glass until the reader returns. */
import { useRef } from 'react'
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
  useMenuKeys(menu, open)
  if (!open) return null
  return (
    <div className="overlay pause" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="pause-inner">
        <p className="pause-story">
          {title} <i>·</i> {chapter}
        </p>
        <h2 id="pause-title" className="pause-title">
          DURAKLATILDI
        </h2>
        <nav ref={menu} className="pause-menu" aria-label="Duraklatma menüsü">
          <MenuButton tier="primary" sound="close" onClick={onResume} data-autofocus="">
            DEVAM ET
          </MenuButton>
          <MenuButton onClick={onRestartChapter}>BÖLÜMÜ YENİDEN BAŞLAT</MenuButton>
          <MenuButton onClick={() => onJournal('journal')} sound="open">
            GÜNLÜK
          </MenuButton>
          <MenuButton onClick={() => onJournal('discoveries')} sound="open">
            KEŞİFLER
          </MenuButton>
          <MenuButton onClick={onStories} sound="transition">
            HİKÂYE SEÇ
          </MenuButton>
          <MenuButton tier="utility" onClick={onSettings} sound="open">
            AYARLAR
          </MenuButton>
          <MenuButton tier="utility" onClick={onMainMenu} sound="transition">
            ANA MENÜ
          </MenuButton>
        </nav>
        <p className="pause-hint" aria-hidden="true">
          ESC · DEVAM
        </p>
      </div>
    </div>
  )
}
