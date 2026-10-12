'use client'

/**
 * From the pause menu: the reading's journal (what was asked and chosen, and
 * what came back) and its discoveries (what was noticed, what is still out
 * there). Nothing is scored; it is a notebook, not a checklist.
 */
import { useRef } from 'react'
import type { StoryContent } from '@/stories/types'
import type { JournalEntry } from './runtime'
import { useT } from '@/lib/i18n'
import { MenuButton, useMenuKeys, useUiSound } from './ui'

export type JournalTab = 'journal' | 'discoveries'

type Props = {
  open: boolean
  tab: JournalTab
  story: StoryContent
  entries: JournalEntry[]
  seen: ReadonlySet<string>
  onTab: (t: JournalTab) => void
  onClose: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function Journal({ open, tab, story, entries, seen, onTab, onClose }: Props) {
  const menu = useRef<HTMLDivElement>(null)
  const t = useT()
  const play = useUiSound()
  useMenuKeys(menu, open)
  if (!open) return null
  const found = story.discoveries.filter((d) => seen.has(d.id))
  const tabs: Array<[JournalTab, string]> = [
    ['journal', t('common.journal')],
    ['discoveries', `${t('common.discoveries')} ${pad(found.length)}/${pad(story.discoveries.length)}`],
  ]
  return (
    <div className="overlay journal" role="dialog" aria-modal="true" aria-labelledby="journal-title" data-lenis-prevent>
      <div className="journal-inner">
        <p className="pause-story">{story.meta.title}</p>
        {/* One row: the two tabs, and the way back to the pause menu. Arrow keys move along it. */}
        <div ref={menu} className="journal-bar">
          <div className="tabbar journal-tabs" role="tablist" aria-label={t('journal.sections')}>
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`journal-tab-${id}`}
                aria-selected={tab === id}
                aria-controls="journal-panel"
                data-menu-item=""
                data-autofocus={tab === id ? '' : undefined}
                onMouseEnter={() => play('hover')}
                onClick={() => {
                  if (tab === id) return
                  play('click')
                  onTab(id)
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <MenuButton tier="utility" sound="close" className="journal-close" onClick={onClose}>
            {t('journal.close')}
          </MenuButton>
        </div>
        <h2 id="journal-title" className="sr-only">
          {tab === 'journal' ? t('journal.title') : t('journal.discoveries')}
        </h2>
        <div id="journal-panel" className="journal-panel" role="tabpanel" aria-labelledby={`journal-tab-${tab}`}>
          {tab === 'journal' ? (
            entries.length ? (
              <ol className="journal-list">
                {entries.map((e) => (
                  <li key={e.gate.id}>
                    <span className="journal-kicker">{e.gate.title}</span>
                    {e.picked.map((o) => (
                      <div key={o.id} className="journal-qa">
                        <p className="journal-q">{o.label}</p>
                        {o.reply && (
                          <p className="journal-a">
                            {o.speaker && <span>{o.speaker}</span>}
                            {o.reply.join(' ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="journal-empty">{t('journal.empty')}</p>
            )
          ) : (
            <ul className="journal-list journal-found">
              {story.discoveries.map((d) =>
                seen.has(d.id) ? (
                  <li key={d.id}>
                    <span className="journal-name">{d.title}</span>
                    {d.examine && <p className="journal-a">{d.examine.lines.join(' ')}</p>}
                  </li>
                ) : (
                  <li key={d.id} className="journal-unknown">
                    <span className="journal-name" aria-hidden="true">
                      — — —
                    </span>
                    <span className="sr-only">{t('journal.unknown')}</span>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
