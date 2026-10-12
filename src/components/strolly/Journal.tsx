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
import { MenuButton, useMenuKeys } from './ui'

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
  useMenuKeys(menu, open)
  if (!open) return null
  const found = story.discoveries.filter((d) => seen.has(d.id))
  return (
    <div className="overlay journal" role="dialog" aria-modal="true" aria-labelledby="journal-title" data-lenis-prevent>
      <div className="journal-inner">
        <p className="pause-story">{story.meta.title}</p>
        <div ref={menu} className="journal-tabs" role="tablist">
          <MenuButton tier="utility" role="tab" aria-selected={tab === 'journal'} className={tab === 'journal' ? 'is-on' : ''} onClick={() => onTab('journal')} data-autofocus={tab === 'journal' ? '' : undefined}>
            {t('common.journal')}
          </MenuButton>
          <MenuButton tier="utility" role="tab" aria-selected={tab === 'discoveries'} className={tab === 'discoveries' ? 'is-on' : ''} onClick={() => onTab('discoveries')} data-autofocus={tab === 'discoveries' ? '' : undefined}>
            {t('common.discoveries')} {pad(found.length)}/{pad(story.discoveries.length)}
          </MenuButton>
          <MenuButton tier="utility" sound="close" onClick={onClose}>
            {t('journal.close')}
          </MenuButton>
        </div>
        <h2 id="journal-title" className="sr-only">
          {tab === 'journal' ? t('journal.title') : t('journal.discoveries')}
        </h2>
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
                  <span className="journal-kicker">{d.title}</span>
                  {d.examine && <p className="journal-a">{d.examine.lines.join(' ')}</p>}
                </li>
              ) : (
                <li key={d.id} className="journal-unknown" aria-label={t('journal.unknown')}>
                  <span className="journal-kicker">— — —</span>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
