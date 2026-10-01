'use client'

/**
 * A choice inside the story: a query typed into a system (style "query") or
 * a decision (style "choice"). The reading holds while it is open; each pick
 * prints its answer line by line, and once enough has been picked the reader
 * goes on — with the button, Enter, or simply by scrolling down again.
 */
import { useEffect, useRef, useState } from 'react'
import { meets, type ChoiceGate, type ChoiceOption } from '@/stories/types'
import { MenuButton, useMenuKeys, useUiSound } from './ui'

type Props = {
  gate: ChoiceGate | null
  picked: string[]
  flags: ReadonlySet<string>
  reduced: boolean
  onPick: (id: string) => void
  onDone: () => void
}

function Reply({ option, reduced }: { option: ChoiceOption; reduced: boolean }) {
  const lines = option.reply ?? []
  const [n, setN] = useState(reduced ? lines.length : 0)
  const play = useUiSound()
  useEffect(() => {
    if (n >= lines.length) return
    const t = setTimeout(
      () => {
        play('tick')
        setN(n + 1)
      },
      n === 0 ? 420 : 950,
    )
    return () => clearTimeout(t)
  }, [n, lines.length, play])
  if (!lines.length) return null
  return (
    <p className="choice-a" aria-live="polite">
      {option.speaker && <span className="choice-who">{option.speaker}</span>}
      {lines.slice(0, n).map((l, i) => (
        <span key={i} className="choice-line">
          {l}
        </span>
      ))}
      {n < lines.length && <span className="choice-caret" aria-hidden="true" />}
    </p>
  )
}

export default function ChoicePanel({ gate, picked, flags, reduced, onPick, onDone }: Props) {
  const menu = useRef<HTMLDivElement>(null)
  const open = !!gate
  const done = !!gate && picked.length >= (gate.picks ?? 1)
  useMenuKeys(menu, open)

  // Once answered, scrolling on (or the keys that scroll) carries the reading forward.
  useEffect(() => {
    if (!done) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 12) onDone()
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) && !(e.target as HTMLElement).closest('button')) onDone()
    }
    let y0 = 0
    const onTouchStart = (e: TouchEvent) => (y0 = e.touches[0]?.clientY ?? 0)
    const onTouchMove = (e: TouchEvent) => {
      if (y0 - (e.touches[0]?.clientY ?? 0) > 60) onDone()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [done, onDone])

  if (!gate) return null
  const asked = picked.map((id) => gate.options.find((o) => o.id === id)).filter((o): o is ChoiceOption => !!o)
  const open_ = gate.options.filter((o) => !picked.includes(o.id) && meets(o.when, flags))
  const left = (gate.picks ?? 1) - picked.length
  return (
    <div className={`choice choice--${gate.style}`} role="dialog" aria-label={gate.title} data-done={done}>
      <div className="choice-head">
        <span className="choice-title">{gate.title}</span>
        {gate.style === 'query' && <span className="choice-status">{done ? 'YANIT ALINDI' : left > 1 ? `${left} SORGU` : 'SORGU BEKLENİYOR'}</span>}
      </div>
      {gate.prompt && !asked.length && <p className="choice-prompt">{gate.prompt}</p>}
      {asked.length > 0 && (
        <div className="choice-log">
          {asked.map((o, i) => (
            <div key={o.id} className="choice-entry">
              <p className="choice-q">
                {gate.style === 'query' && <span className="choice-gt">›</span>}
                {o.label}
              </p>
              {i === asked.length - 1 ? (
                <Reply key={o.id} option={o} reduced={reduced} />
              ) : (
                o.reply && (
                  <p className="choice-a">
                    {o.speaker && <span className="choice-who">{o.speaker}</span>}
                    {o.reply.map((l, k) => (
                      <span key={k} className="choice-line">
                        {l}
                      </span>
                    ))}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}
      <div ref={menu} className="choice-opts">
        {!done &&
          open_.map((o) => (
            <button key={o.id} type="button" data-menu-item="" className={o.tag ? 'choice-opt' : 'choice-opt choice-opt--plain'} onClick={() => onPick(o.id)}>
              {o.tag && <span className="choice-tag">{o.tag}</span>}
              <span className="choice-label">{o.label}</span>
            </button>
          ))}
        {done && (
          <MenuButton tier="utility" sound="transition" className="choice-go" onClick={onDone} data-autofocus="">
            DEVAM ↓
          </MenuButton>
        )}
      </div>
    </div>
  )
}
