'use client'

/**
 * The cinematic cursor: a small ring that follows the pointer (fine pointers
 * only; touch devices keep none). States:
 *   default      a dot in a ring
 *   look         over the scene: the ring opens, inviting a drag
 *   drag         while looking: the ring tightens
 *   interactive  over something to press or examine: the ring widens
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CursorState } from '@/lib/input'

export type CursorHandle = { set: (state: CursorState) => void }

const Cursor = forwardRef<CursorHandle>(function Cursor(_props, ref) {
  const el = useRef<HTMLDivElement>(null)
  const scene = useRef<CursorState>('default')

  useImperativeHandle(ref, () => ({
    set(state) {
      scene.current = state
      if (el.current) el.current.dataset.state = state
    },
  }))

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return
    const node = el.current!
    document.documentElement.dataset.cursor = 'custom'
    let x = -100
    let y = -100
    let frame = 0
    const draw = () => {
      frame = 0
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      node.dataset.visible = 'true'
      // Over the interface, the interface decides; over the scene, the story does.
      const t = e.target as Element | null
      const control = t?.closest?.('button, a, input, select, [role="option"], [role="tab"], label')
      if (control) node.dataset.state = 'interactive'
      else if (t?.closest?.('.stage')) node.dataset.state = scene.current
      else node.dataset.state = 'default'
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const down = () => node.classList.add('is-down')
    const up = () => node.classList.remove('is-down')
    const leave = () => (node.dataset.visible = 'false')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      delete document.documentElement.dataset.cursor
    }
  }, [])

  return (
    <div ref={el} className="cursor" data-state="default" data-visible="false" aria-hidden="true">
      <i />
    </div>
  )
})

export default Cursor
