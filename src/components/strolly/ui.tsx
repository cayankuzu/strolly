'use client'

/**
 * Shared pieces of the game interface: menu buttons that answer with sound,
 * and keyboard navigation (↑ ↓ ← → move between items, Enter/Space press).
 */
import { createContext, useContext, useEffect, type ButtonHTMLAttributes, type ReactNode, type RefObject } from 'react'
import type { UiSound } from '@/lib/audio/core'

export const UiSoundContext = createContext<(kind: UiSound) => void>(() => {})

export const useUiSound = () => useContext(UiSoundContext)

type MenuButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tier?: 'primary' | 'secondary' | 'utility'
  sub?: ReactNode
  sound?: UiSound
}

export function MenuButton({ tier = 'secondary', sub, sound = 'click', className, onClick, onMouseEnter, onFocus, children, ...rest }: MenuButtonProps) {
  const play = useUiSound()
  return (
    <button
      type="button"
      data-menu-item=""
      className={`menu-btn menu-btn--${tier}${className ? ` ${className}` : ''}`}
      onMouseEnter={(e) => {
        play('hover')
        onMouseEnter?.(e)
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(':focus-visible')) play('hover')
        onFocus?.(e)
      }}
      onClick={(e) => {
        play(sound)
        onClick?.(e)
      }}
      {...rest}
    >
      <span className="menu-btn-label">{children}</span>
      {sub && <span className="menu-btn-sub">{sub}</span>}
    </button>
  )
}

/** Arrow keys move focus between the items of a menu; the first item takes focus when the menu opens. */
export function useMenuKeys(ref: RefObject<HTMLElement | null>, active: boolean, autofocus = true) {
  useEffect(() => {
    const root = ref.current
    if (!root || !active) return
    const items = () => Array.from(root.querySelectorAll<HTMLElement>('[data-menu-item]:not([disabled])'))
    if (autofocus) {
      const first = root.querySelector<HTMLElement>('[data-autofocus]') ?? items()[0]
      first?.focus({ preventScroll: true })
    }
    const onKey = (e: KeyboardEvent) => {
      const list = items()
      const i = list.indexOf(document.activeElement as HTMLElement)
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if ((e.target as HTMLElement).matches('input[type="range"]')) return
        e.preventDefault()
        list[(i + 1 + list.length) % list.length]?.focus()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if ((e.target as HTMLElement).matches('input[type="range"]')) return
        e.preventDefault()
        list[(i - 1 + list.length) % list.length]?.focus()
      }
    }
    root.addEventListener('keydown', onKey)
    return () => root.removeEventListener('keydown', onKey)
  }, [ref, active, autofocus])
}
