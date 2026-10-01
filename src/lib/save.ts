/**
 * Progress, saved in the browser. Each story keeps its own record — a
 * checkpoint (chapter), how far it has ever been read, whether it was
 * finished and what was noticed along the way — so no story's progress can
 * leak into another's.
 */
import type { StoryId } from '@/stories/types'

export type StorySave = {
  /** Checkpoint: the chapter to continue from (1-based). */
  chapter: number
  /** Progress at the checkpoint, 0–1. */
  progress: number
  /** Furthest chapter ever reached; chapters up to it can be chosen. */
  maxChapter: number
  completed: boolean
  discoveries: string[]
  /** This reading's answers at each choice (gate id → option ids). */
  answers?: Record<string, string[]>
  /** Flags kept across readings (a story may remember that it was read). */
  memory?: string[]
  updatedAt: number
}

type SaveFile = { version: 1; last: StoryId | null; stories: Partial<Record<StoryId, StorySave>> }

const KEY = 'strolly:save'
const EMPTY: SaveFile = { version: 1, last: null, stories: {} }
type Listener = (reason: 'saved' | 'cleared') => void

class SaveStore {
  private file: SaveFile | null = null
  private listeners = new Set<Listener>()

  private load(): SaveFile {
    if (this.file) return this.file
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as SaveFile | null
      this.file = parsed && parsed.version === 1 ? parsed : { ...EMPTY, stories: {} }
    } catch {
      this.file = { ...EMPTY, stories: {} }
    }
    return this.file
  }

  private write(reason: 'saved' | 'cleared') {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.file))
    } catch {
      /* storage unavailable: progress lasts for this visit */
    }
    this.listeners.forEach((l) => l(reason))
  }

  get last() {
    return this.load().last
  }

  story(id: StoryId): StorySave | null {
    return this.load().stories[id] ?? null
  }

  /** Records a checkpoint. Returns true when something actually changed. */
  checkpoint(id: StoryId, chapter: number, progress: number) {
    const f = this.load()
    const prev = f.stories[id]
    const next: StorySave = {
      ...prev,
      chapter,
      progress,
      maxChapter: Math.max(prev?.maxChapter ?? 1, chapter),
      completed: prev?.completed ?? false,
      discoveries: prev?.discoveries ?? [],
      updatedAt: Date.now(),
    }
    const changed = !prev || prev.chapter !== chapter || f.last !== id
    f.stories[id] = next
    f.last = id
    if (changed) this.write('saved')
    return changed
  }

  discover(id: StoryId, discovery: string) {
    const f = this.load()
    const s = f.stories[id]
    if (!s || s.discoveries.includes(discovery)) return
    s.discoveries = [...s.discoveries, discovery]
    s.updatedAt = Date.now()
    this.write('saved')
  }

  /** Records an answer at a choice, and any flags it keeps across readings. */
  answer(id: StoryId, gate: string, option: string, keep: string[] = []) {
    const f = this.load()
    const s = f.stories[id] ?? { chapter: 1, progress: 0, maxChapter: 1, completed: false, discoveries: [], updatedAt: 0 }
    const answers = { ...(s.answers ?? {}) }
    answers[gate] = [...(answers[gate] ?? []).filter((o) => o !== option), option]
    const memory = Array.from(new Set([...(s.memory ?? []), ...keep]))
    f.stories[id] = { ...s, answers, memory, updatedAt: Date.now() }
    this.write('saved')
  }

  /** A new reading forgets the last one's answers, except those before `keep` (gate ids). */
  resetAnswers(id: StoryId, keep: ReadonlySet<string> = new Set()) {
    const f = this.load()
    const s = f.stories[id]
    if (!s?.answers) return
    s.answers = Object.fromEntries(Object.entries(s.answers).filter(([g]) => keep.has(g)))
    this.write('saved')
  }

  complete(id: StoryId, chapters: number) {
    const f = this.load()
    const s = f.stories[id] ?? { chapter: 1, progress: 0, maxChapter: 1, completed: false, discoveries: [], updatedAt: 0 }
    f.stories[id] = { ...s, completed: true, maxChapter: chapters, chapter: 1, progress: 0, updatedAt: Date.now() }
    f.last = id
    this.write('saved')
  }

  clearAll() {
    this.file = { ...EMPTY, stories: {} }
    this.write('cleared')
  }

  subscribe(l: Listener) {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }
}

export const saves = new SaveStore()
