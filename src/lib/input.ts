/**
 * One place for every input that touches the scene, so they never fight:
 *
 *   wheel / keyboard scroll / vertical swipe   → story time (the browser scrolls)
 *   press + drag (mouse), horizontal drag (touch) → look
 *   a short press without movement             → examine what is in view
 *   ← → (and ↑ ↓ with Shift)                   → look; C recenters; E / Enter examines
 *
 * On touch the scene element uses `touch-action: pan-y`: the browser keeps
 * vertical swipes as scrolling (and cancels our pointer when it does), while
 * horizontal drags arrive here as look.
 */
import type { LookController } from './look'

export type CursorState = 'default' | 'look' | 'drag' | 'interactive' | 'hidden'

type Handlers = {
  look: LookController
  /** A press without a drag on the scene. */
  click: () => void
  examine: () => void
  cursor: (state: CursorState) => void
  /** Whether scene input is accepted right now (not paused, not in a menu). */
  active: () => boolean
}

const CLICK_PX = 6
const CLICK_MS = 450
const TOUCH_DECIDE_PX = 8

export class InputManager {
  private pointer: { id: number; x: number; y: number; t: number; moved: number; touch: boolean; decided: boolean } | null = null

  constructor(
    private el: HTMLElement,
    private h: Handlers,
  ) {
    el.addEventListener('pointerdown', this.down)
    el.addEventListener('pointermove', this.move)
    el.addEventListener('pointerup', this.up)
    el.addEventListener('pointercancel', this.cancel)
    el.addEventListener('lostpointercapture', this.cancel)
    el.addEventListener('pointerenter', this.enter)
    el.addEventListener('pointerleave', this.leave)
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
    window.addEventListener('blur', this.blur)
  }

  /** Called by the shell when the frame under the pointer can be examined. */
  hover(interactive: boolean) {
    if (this.pointer || !this.h.active()) return
    this.h.cursor(interactive ? 'interactive' : 'look')
  }

  private down = (e: PointerEvent) => {
    if (!this.h.active()) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const touch = e.pointerType !== 'mouse'
    this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, touch, decided: !touch }
    if (!touch) {
      this.el.setPointerCapture(e.pointerId)
      this.h.look.dragging = true
      this.h.cursor('drag')
    }
  }

  private move = (e: PointerEvent) => {
    const p = this.pointer
    if (!p || p.id !== e.pointerId) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    p.moved += Math.hypot(dx, dy)
    if (!p.decided) {
      // Touch: a mostly horizontal start is a look; a vertical one belongs to the browser (scroll).
      if (Math.abs(dx) < TOUCH_DECIDE_PX && Math.abs(dy) < TOUCH_DECIDE_PX) return
      if (Math.abs(dx) <= Math.abs(dy)) {
        this.pointer = null
        return
      }
      p.decided = true
      this.h.look.dragging = true
      try {
        this.el.setPointerCapture(e.pointerId)
      } catch {
        /* the browser already took it */
      }
    }
    p.x = e.clientX
    p.y = e.clientY
    this.h.look.drag(dx, dy, window.innerWidth)
  }

  private up = (e: PointerEvent) => {
    const p = this.pointer
    if (!p || p.id !== e.pointerId) return
    const quick = performance.now() - p.t < CLICK_MS
    this.end()
    if (quick && p.moved < CLICK_PX) this.h.click()
  }

  private cancel = () => {
    if (this.pointer) this.end()
  }

  private end() {
    this.pointer = null
    this.h.look.dragging = false
    this.h.look.release()
    if (this.h.active()) this.h.cursor('look')
  }

  private enter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && this.h.active()) this.h.cursor('look')
  }

  private leave = () => {
    if (!this.pointer) this.h.cursor('default')
  }

  private keydown = (e: KeyboardEvent) => {
    if (!this.h.active() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    const target = e.target as HTMLElement | null
    if (target && (target.closest('input, select, textarea, [role="dialog"]') || target.isContentEditable)) return
    const look = this.h.look
    switch (e.key) {
      case 'ArrowLeft':
        look.key('left', true)
        e.preventDefault()
        break
      case 'ArrowRight':
        look.key('right', true)
        e.preventDefault()
        break
      case 'ArrowUp':
        if (e.shiftKey) {
          look.key('up', true)
          e.preventDefault()
        }
        break
      case 'ArrowDown':
        if (e.shiftKey) {
          look.key('down', true)
          e.preventDefault()
        }
        break
      case 'c':
      case 'C':
        look.recenter()
        break
      case 'e':
      case 'E':
        this.h.examine()
        break
      case 'Enter':
        // Enter on a focused control keeps its usual meaning.
        if (!target || target === document.body || target.closest('.stage')) this.h.examine()
        break
    }
  }

  private keyup = (e: KeyboardEvent) => {
    const look = this.h.look
    if (e.key === 'ArrowLeft') look.key('left', false)
    else if (e.key === 'ArrowRight') look.key('right', false)
    else if (e.key === 'ArrowUp' || e.key === 'Shift') look.key('up', false)
    if (e.key === 'ArrowDown' || e.key === 'Shift') look.key('down', false)
  }

  private blur = () => {
    const look = this.h.look
    look.key('left', false)
    look.key('right', false)
    look.key('up', false)
    look.key('down', false)
    this.cancel()
  }

  dispose() {
    const el = this.el
    el.removeEventListener('pointerdown', this.down)
    el.removeEventListener('pointermove', this.move)
    el.removeEventListener('pointerup', this.up)
    el.removeEventListener('pointercancel', this.cancel)
    el.removeEventListener('lostpointercapture', this.cancel)
    el.removeEventListener('pointerenter', this.enter)
    el.removeEventListener('pointerleave', this.leave)
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
    window.removeEventListener('blur', this.blur)
  }
}
