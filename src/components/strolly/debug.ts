/**
 * Development-only test hooks (`?debug=1` in `next dev`): an invisible API on
 * `window.__strolly` for jumping through a story and reading its state. There
 * is no on-screen panel; production builds never install it.
 */
import type { StoryId } from '@/stories/types'

export type DebugInfo = {
  story: string
  phase: string
  p: number
  segment: string
  chapter: string
  set: string
  sp: number
  camera: [number, number, number]
  fps: number
  scale: number
  audio: string
  paused: boolean
  segments: string[]
  chapters: Array<{ index: number; start: number }>
}

export type DebugApi = {
  info: () => DebugInfo
  jump: (p: number) => void
  /** Jump to a fraction of a named segment of the current story, e.g. jumpTo('wake', 0.5). */
  jumpTo: (segment: string, f?: number) => void
  pause: (p: number | null) => void
  open: (id: StoryId) => void
  close: () => void
}
