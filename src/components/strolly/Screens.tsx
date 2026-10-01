'use client'

/** The smaller screens of the game: the archive, the end of a story, a confirmation, leaving, a scene that failed. */
import { useRef } from 'react'
import { STORIES, STORY_ORDER } from '@/stories/registry'
import type { StoryId } from '@/stories/types'
import type { StorySave } from '@/lib/save'
import { MenuButton, useMenuKeys } from './ui'

/**
 * ARŞİV: what each story left behind — how far it was read, what was noticed
 * (by name; the rest stays unknown) — and who made what.
 */
export function ArchiveScreen({ active, saves, onBack }: { active: boolean; saves: Partial<Record<StoryId, StorySave | null>>; onBack: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  useMenuKeys(menu, active)
  return (
    <section className="screen credits archive" aria-hidden={!active} inert={!active} aria-labelledby="archive-title" data-lenis-prevent>
      <div className="credits-inner">
        <h1 id="archive-title" className="credits-title">
          ARŞİV
        </h1>
        <ol className="archive-list">
          {STORY_ORDER.map((id) => {
            const st = STORIES[id]
            const sv = saves[id]
            const found = st.discoveries.filter((d) => sv?.discoveries.includes(d.id))
            const state = sv?.completed ? 'TAMAMLANDI' : sv ? `BÖLÜM ${pad(sv.maxChapter)} / ${pad(st.timeline.CHAPTERS.length)}` : 'OKUNMADI'
            return (
              <li key={id} className="archive-story" data-read={!!sv}>
                <p className="archive-head">
                  <span className="archive-index">{pad(st.meta.index)}</span>
                  <span className="archive-name">{st.meta.title}</span>
                  <span className="archive-state">{state}</span>
                </p>
                <p className="archive-found">
                  KEŞİFLER {pad(found.length)}/{pad(st.discoveries.length)}
                  {found.length > 0 && <span> · {found.map((d) => d.title).join(' · ')}</span>}
                </p>
              </li>
            )
          })}
        </ol>
        <h2 className="credits-title archive-sub">EMEĞİ GEÇENLER</h2>
        <dl className="credits-list">
          <dt>STROLLY</dt>
          <dd>Kaydırdıkça zamanın aktığı, baktıkça anlamın değiştiği etkileşimli hikâyeler.</dd>
          <dt>GÖRÜNTÜ VE SES</dt>
          <dd>Bütün mekânlar, karakterler, dokular, ekranlar ve sesler kodla üretildi. Dışarıdan alınmış görsel ya da ses yok.</dd>
          <dt>YAZI TİPİ</dt>
          <dd>Geist, Geist Mono — Vercel (SIL Open Font License 1.1)</dd>
          <dt>KÜTÜPHANELER</dt>
          <dd>Next.js, React, three.js (MIT) · GSAP, ScrollTrigger (GSAP Standard License) · Lenis (MIT)</dd>
        </dl>
        <div ref={menu} className="credits-actions">
          <MenuButton tier="primary" sound="close" onClick={onBack}>
            ANA MENÜ
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
  useMenuKeys(menu, open, false)
  if (!open) return null
  return (
    <div className="complete" role="region" aria-labelledby="complete-title">
      <p className="complete-kicker">HİKÂYE TAMAMLANDI</p>
      <h2 id="complete-title" className="complete-title">
        {title}
      </h2>
      {total > 0 && (
        <p className="complete-seen">
          Fark ettiğin ayrıntılar: {pad(seen)} / {pad(total)}
        </p>
      )}
      <div ref={menu} className="complete-actions">
        <MenuButton tier="primary" sound="transition" onClick={onReplay}>
          TEKRAR OYNA
        </MenuButton>
        <MenuButton sound="transition" onClick={onStories}>
          HİKÂYELER
        </MenuButton>
        <MenuButton tier="utility" sound="transition" onClick={onMenu}>
          ANA MENÜ
        </MenuButton>
      </div>
      {loops && <p className="complete-loop">ya da kaydırmaya devam et</p>}
    </div>
  )
}

export function ConfirmDialog({ open, title, body, confirm, onConfirm, onCancel }: { open: boolean; title: string; body: string; confirm: string; onConfirm: () => void; onCancel: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  useMenuKeys(menu, open)
  if (!open) return null
  return (
    <div className="overlay confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body">
      <div className="confirm-inner">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-body">{body}</p>
        <div ref={menu} className="confirm-actions">
          <MenuButton tier="secondary" sound="close" onClick={onCancel} data-autofocus="">
            VAZGEÇ
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
  useMenuKeys(menu, active)
  return (
    <section className="screen farewell" aria-hidden={!active} inert={!active} aria-label="Çıkış">
      <p className="farewell-mark">STROLLY</p>
      <p className="farewell-line">Görüşmek üzere. Hikâyeler bekler.</p>
      <div ref={menu}>
        <MenuButton tier="utility" sound="open" onClick={onReturn}>
          BAŞLIK EKRANINA DÖN
        </MenuButton>
      </div>
    </section>
  )
}

export function SceneError({ open, onRetry, onStories }: { open: boolean; onRetry: () => void; onStories: () => void }) {
  const menu = useRef<HTMLDivElement>(null)
  useMenuKeys(menu, open)
  if (!open) return null
  return (
    <div className="overlay scene-error" role="alertdialog" aria-modal="true" aria-labelledby="scene-error-title">
      <div className="confirm-inner">
        <h2 id="scene-error-title">BU SAHNE YÜKLENEMEDİ.</h2>
        <p>Bağlantı kesilmiş olabilir. Son kayıt noktasından yeniden deneyebilirsin.</p>
        <div ref={menu} className="confirm-actions">
          <MenuButton tier="primary" sound="transition" onClick={onRetry} data-autofocus="">
            SON KAYIT NOKTASINA DÖN
          </MenuButton>
          <MenuButton sound="close" onClick={onStories}>
            HİKÂYELER
          </MenuButton>
        </div>
      </div>
    </div>
  )
}
