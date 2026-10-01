/**
 * The single scroll manager: Lenis smooths the document scroll, ScrollTrigger
 * turns it into the canonical story progress, and GSAP's ticker is the only
 * animation loop in the app (Lenis → ScrollTrigger → frame subscribers).
 *
 * It lives for the whole visit. A story sets the track's length and calls
 * `refresh()`; the selector turns scrolling off with `setActive(false)`.
 */
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export type FrameCallback = (time: number, dt: number) => void

export type ScrollHandle = {
  readonly state: { progress: number }
  subscribe(cb: FrameCallback): () => void
  scrollToProgress(p: number, immediate?: boolean): void
  /** Fires when the reader keeps scrolling after the last frame (null to stop listening). */
  onOverscroll(cb: (() => void) | null): void
  /** Re-measures the track after its length changes. */
  refresh(): void
  /** Lets the document scroll (a story) or holds it still (menus, pause). */
  setActive(active: boolean): void
  /** Smooth (inertial) wheel scrolling on or off — off for reduced motion. */
  setSmooth(smooth: boolean): void
  destroy(): void
}

const OVERSCROLL_WHEEL = 260
const OVERSCROLL_TOUCH = 90
const END = 0.9995

export function createScroll(track: HTMLElement, smooth: boolean): ScrollHandle {
  gsap.registerPlugin(ScrollTrigger)
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  const state = { progress: 0 }
  const lenis: Lenis | null = new Lenis({ lerp: 0.085, wheelMultiplier: 0.85, touchMultiplier: 1.1, autoRaf: false, smoothWheel: smooth })
  lenis?.on('scroll', ScrollTrigger.update)

  const trigger = ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      state.progress = self.progress
    },
  })
  state.progress = trigger.progress

  const subscribers = new Set<FrameCallback>()
  const tick = (time: number, deltaTime: number) => {
    lenis?.raf(time * 1000)
    const dt = Math.min(deltaTime / 1000, 0.1)
    subscribers.forEach((cb) => cb(time, dt))
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  let overscroll: (() => void) | null = null
  let wheelIntent = 0
  let touchStart = 0
  const atEnd = () => state.progress >= END
  const fire = () => {
    wheelIntent = 0
    overscroll?.()
  }
  const onWheel = (e: WheelEvent) => {
    if (!atEnd() || e.deltaY <= 0) {
      wheelIntent = 0
      return
    }
    wheelIntent += e.deltaY
    if (wheelIntent > OVERSCROLL_WHEEL) fire()
  }
  const onTouchStart = (e: TouchEvent) => {
    touchStart = e.touches[0]?.clientY ?? 0
  }
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY ?? 0
    if (atEnd() && touchStart - y > OVERSCROLL_TOUCH) {
      touchStart = y
      fire()
    }
  }
  const onKey = (e: KeyboardEvent) => {
    if (atEnd() && ['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) fire()
  }
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('keydown', onKey)

  return {
    state,
    subscribe(cb) {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
    scrollToProgress(p, immediate = true) {
      const y = trigger.start + Math.min(Math.max(p, 0), 1) * (trigger.end - trigger.start)
      if (lenis) lenis.scrollTo(y, { immediate, force: true })
      else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' })
      if (immediate) {
        ScrollTrigger.update()
        state.progress = trigger.progress
      }
    },
    onOverscroll(cb) {
      overscroll = cb
      wheelIntent = 0
    },
    refresh() {
      // Lenis measures on its own schedule; a jump right after the track changes
      // length (resuming at a chapter) would be clamped to the old limit.
      lenis?.resize()
      ScrollTrigger.refresh()
      state.progress = trigger.progress
    },
    setSmooth(on) {
      if (!lenis) return
      lenis.options.smoothWheel = on
      lenis.options.lerp = on ? 0.085 : 1
    },
    setActive(active) {
      if (active) lenis?.start()
      else lenis?.stop()
      document.documentElement.dataset.scroll = active ? 'on' : 'off'
    },
    destroy() {
      gsap.ticker.remove(tick)
      subscribers.clear()
      trigger.kill()
      lenis?.destroy()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    },
  }
}
