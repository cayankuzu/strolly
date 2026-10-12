'use client'

/** The title screen: the first thing STROLLY says is that it is a game. */
import { useRef } from 'react'
import { STORY_ORDER } from '@/stories/registry'
import { settings } from '@/lib/settings'
import { countWord, useLang, useT, type Lang } from '@/lib/i18n'
import { MenuButton, useMenuKeys, useUiSound } from './ui'

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
const LANGS: Array<[Lang, string, string]> = [
  ['tr', 'TR', 'Türkçe'],
  ['en', 'EN', 'English'],
]

/** TR · EN: small, in the corner; the whole interface follows at once. */
function LangSwitch() {
  const lang = useLang()
  const t = useT()
  const play = useUiSound()
  return (
    <div className="lang-switch" role="group" aria-label={t('lang.switch')}>
      {LANGS.map(([l, short, name], i) => (
        <span key={l} className="lang-switch-item">
          {i > 0 && <i aria-hidden="true">·</i>}
          <button
            type="button"
            lang={l}
            aria-label={name}
            aria-pressed={lang === l}
            onClick={() => {
              if (lang === l) return
              play('click')
              settings.set({ lang: l })
            }}
          >
            {short}
          </button>
        </span>
      ))}
    </div>
  )
}

export default function TitleScreen({ active, resume, onContinue, onStories, onNewGame, onSettings, onArchive, onExit }: Props) {
  const menu = useRef<HTMLElement>(null)
  const lang = useLang()
  const t = useT()
  useMenuKeys(menu, active)
  return (
    <section className="screen title-screen" aria-hidden={!active} inert={!active} aria-labelledby="title-mark">
      <LangSwitch />
      <div className="title-inner">
        <h1 id="title-mark" className="title-mark">
          STROLLY
        </h1>
        <p className="title-tag">{t('title.tagline')}</p>
        <nav ref={menu} className="title-menu" aria-label={t('title.menu')}>
          {resume ? (
            <MenuButton
              tier="primary"
              data-autofocus=""
              onClick={onContinue}
              sub={t('title.resume', { title: resume.title, n: pad(resume.chapter), chapter: resume.chapterTitle, percent: t('common.percent', { n: resume.percent }) })}
            >
              {t('common.continue')}
            </MenuButton>
          ) : (
            <MenuButton tier="primary" data-autofocus="" onClick={onStories} sub={t('title.count', { count: countWord(lang, STORY_ORDER.length) })}>
              {t('title.start')}
            </MenuButton>
          )}
          <MenuButton onClick={onStories} sound="open">
            {t('common.stories')}
          </MenuButton>
          <MenuButton onClick={onNewGame} sound="open">
            {t('title.newGame')}
          </MenuButton>
          <span className="title-menu-gap" aria-hidden="true" />
          <MenuButton tier="utility" onClick={onSettings} sound="open">
            {t('common.settings')}
          </MenuButton>
          <MenuButton tier="utility" onClick={onArchive} sound="open">
            {t('title.archive')}
          </MenuButton>
          <MenuButton tier="utility" onClick={onExit} sound="close">
            {t('title.exit')}
          </MenuButton>
        </nav>
      </div>
      <p className="title-foot" aria-hidden="true">
        <span>{t('title.footDrag')}</span>
        <span>{t('title.footScroll')}</span>
        <span>{t('title.footPause')}</span>
      </p>
    </section>
  )
}
