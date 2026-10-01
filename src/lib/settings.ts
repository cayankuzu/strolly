/**
 * Player settings: one small store, persisted in the browser, readable from
 * React (useSettings) and from the frame loop (settings.get()) alike.
 */
import { useSyncExternalStore } from 'react'

export type QualityChoice = 'auto' | 'high' | 'mid' | 'low'
export type TextSize = 'S' | 'M' | 'L' | 'XL'

export type Settings = {
  // Display
  quality: QualityChoice
  /** Upper bound on internal resolution (0.6–1). */
  resolution: number
  /** Hand-held camera breathing, text blur transitions. */
  motion: boolean
  // Audio (0–1)
  master: number
  music: number
  ambient: number
  sfx: number
  ui: number
  spatial: boolean
  // Controls
  look: boolean
  sensitivity: number
  invertY: boolean
  autoCenter: boolean
  // Accessibility
  reducedMotion: boolean
  reducedCamera: boolean
  captions: boolean
  textSize: TextSize
  contrast: boolean
  immersion: boolean
}

export const DEFAULTS: Settings = {
  quality: 'auto',
  resolution: 1,
  motion: true,
  master: 0.85,
  music: 0.8,
  ambient: 0.9,
  sfx: 0.9,
  ui: 0.5,
  spatial: true,
  look: true,
  sensitivity: 1,
  invertY: false,
  autoCenter: true,
  reducedMotion: false,
  reducedCamera: false,
  captions: false,
  textSize: 'M',
  contrast: false,
  immersion: false,
}

const KEY = 'strolly:settings'
type Listener = () => void

function read(): Settings {
  let stored: Partial<Settings> = {}
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>
  } catch {
    /* unavailable or corrupt: defaults */
  }
  const system = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return { ...DEFAULTS, reducedMotion: !!system, ...stored }
}

class SettingsStore {
  private value: Settings = DEFAULTS
  private loaded = false
  private listeners = new Set<Listener>()

  get(): Settings {
    if (!this.loaded && typeof window !== 'undefined') {
      this.loaded = true
      this.value = read()
      this.reflect()
    }
    return this.value
  }

  set(patch: Partial<Settings>) {
    this.value = { ...this.get(), ...patch }
    try {
      localStorage.setItem(KEY, JSON.stringify(this.value))
    } catch {
      /* the choice lasts for this visit only */
    }
    this.reflect()
    this.listeners.forEach((l) => l())
  }

  reset() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* nothing stored */
    }
    this.value = read()
    this.reflect()
    this.listeners.forEach((l) => l())
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  /** Settings that are pure presentation live on <html> as data attributes. */
  private reflect() {
    if (typeof document === 'undefined') return
    const d = document.documentElement.dataset
    const v = this.value
    d.textSize = v.textSize
    d.contrast = v.contrast ? 'high' : 'normal'
    d.immersion = String(v.immersion)
    d.motion = v.reducedMotion || !v.motion ? 'reduced' : 'full'
  }
}

export const settings = new SettingsStore()

const serverSnapshot = () => DEFAULTS

export function useSettings(): Settings {
  return useSyncExternalStore(settings.subscribe, () => settings.get(), serverSnapshot)
}
