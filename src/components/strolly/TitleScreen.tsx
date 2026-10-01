'use client'

/** The title screen: the first thing STROLLY says is that it is a game. */
import { useRef } from 'react'
import { MenuButton, useMenuKeys } from './ui'

export type ContinueInfo = { title: string; chapter: number; chapterTitle: string; percent: number }

type Props = {
  active: boolean
  resume: ContinueInfo | null
  onContinue: () => void
  onStories: () => void
  onNewGame: () => void
  onSettings: () => void
  onArchive: () => void
  onExit: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function TitleScreen({ active, resume, onContinue, onStories, onNewGame, onSettings, onArchive, onExit }: Props) {
  const menu = useRef<HTMLElement>(null)
  useMenuKeys(menu, active)
  return (
    <section className="screen title-screen" aria-hidden={!active} inert={!active} aria-labelledby="title-mark">
      <div className="title-inner">
        <h1 id="title-mark" className="title-mark">
          STROLLY
        </h1>
        <p className="title-tag">Kaydırdıkça zamanın aktığı, baktıkça anlamın değiştiği hikâyeler.</p>
        <nav ref={menu} className="title-menu" aria-label="Ana menü">
          {resume ? (
            <MenuButton tier="primary" data-autofocus="" onClick={onContinue} sub={`${resume.title} · BÖLÜM ${pad(resume.chapter)} ${resume.chapterTitle} · %${resume.percent}`}>
              DEVAM ET
            </MenuButton>
          ) : (
            <MenuButton tier="primary" data-autofocus="" onClick={onStories} sub="Altı hikâye, bir oyun.">
              BAŞLA
            </MenuButton>
          )}
          <MenuButton onClick={onStories} sound="open">
            HİKÂYELER
          </MenuButton>
          <MenuButton onClick={onNewGame} sound="open">
            YENİ OYUN
          </MenuButton>
          <span className="title-menu-gap" aria-hidden="true" />
          <MenuButton tier="utility" onClick={onSettings} sound="open">
            AYARLAR
          </MenuButton>
          <MenuButton tier="utility" onClick={onArchive} sound="open">
            ARŞİV
          </MenuButton>
          <MenuButton tier="utility" onClick={onExit} sound="close">
            ÇIKIŞ
          </MenuButton>
        </nav>
      </div>
      <p className="title-foot" aria-hidden="true">
        <span>SÜRÜKLE · BAK</span>
        <span>KAYDIR · İLERLE</span>
        <span>ESC · DURAKLAT</span>
      </p>
    </section>
  )
}
