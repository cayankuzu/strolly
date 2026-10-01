/**
 * The story runtime: one per visit. It owns the shared systems — scroll,
 * renderer, look, input, sound, the frame loop — and moves them between the
 * menus and a story:
 *
 *   idle (menus) → loading → active ⇄ paused → leaving → idle …
 *
 * Every transition takes a token; anything that resolves after a newer
 * transition began is discarded, so fast clicks and back/forward never leave
 * two stories alive. Scene mounts are serialized on one queue.
 *
 * Per reading of a story it keeps the reading's own state — what was seen,
 * what was chosen, which chapter was last saved, whether the ending was
 * reached — and drops it when the story closes, so nothing leaks into the
 * next story.
 *
 * Choices: when the reading reaches a choice gate, the scroll holds there
 * until the reader answers; answers become flags the text and the scene read.
 */
import { STORIES } from '@/stories/registry'
import { meets, type CaptionCue, type ChoiceGate, type ChoiceOption, type Discovery, type StoryContent, type StoryId } from '@/stories/types'
import { loadAudio, loadScene } from '@/stories/loaders'
import { createScroll, type ScrollHandle } from '@/lib/scroll'
import { detectWebGL2, qualityFor } from '@/lib/env'
import { LabelLayer } from '@/lib/labels'
import { AudioCore, type AudioFrame, type AudioProfileFactory, type Listener } from '@/lib/audio/core'
import { createSelectorAudio } from '@/lib/audio/selector'
import { LookController } from '@/lib/look'
import { InputManager, type CursorState } from '@/lib/input'
import { DiscoveryTracker } from '@/lib/discovery'
import { settings } from '@/lib/settings'
import { saves } from '@/lib/save'
import type { SceneFactory, SceneOptions, Stage } from '@/three/Stage'
import type { NarrativeHandle } from './NarrativeLayer'
import type { HudHandle } from './GameHUD'

export type Phase = 'idle' | 'loading' | 'active' | 'leaving'
export type Mode = 'pending' | 'webgl' | 'fallback'

type Elements = { canvas: HTMLCanvasElement; track: HTMLElement; labels: HTMLElement; veil: HTMLElement; backdrop: HTMLElement }
type Views = { narrative: () => NarrativeHandle | null; hud: () => HudHandle | null }

export type StoryEvents = {
  phase: (p: Phase) => void
  mode: (m: Mode) => void
  iteration: (n: number) => void
  failed: () => void
  /** A checkpoint was written. */
  saved: () => void
  chapterComplete: (index: number, title: string, total: number) => void
  caption: (text: string) => void
  /** The examinable thing in the center of the view changed. */
  prompt: (d: Discovery | null) => void
  examined: (d: Discovery) => void
  hint: (h: 'around' | 'behind' | null) => void
  /** The reader reached the end of the story. */
  completed: (seen: number, total: number) => void
  cursor: (c: CursorState) => void
  /** A choice gate opened (with what was already picked there) or closed (null). */
  choice: (gate: ChoiceGate | null, picked: string[]) => void
  /** The reading's flags changed. */
  flags: (flags: string[]) => void
}

export type JournalEntry = { gate: ChoiceGate; picked: ChoiceOption[] }

const IDLE_AFTER = 3.2
const LEAVE_MS = 560
const NO_MOTION: AudioFrame['motion'] = { step: 0, walking: 0, robots: 0, doors: 0, frame: 0 }

type Reading = {
  story: StoryContent
  tracker: DiscoveryTracker
  savedChapter: number
  lastP: number
  completed: boolean
  endDwell: number
  captions: CaptionCue[]
  captionAt: number[]
  /** What the reader chose in this reading: gate → options, and the flags that follow. */
  answers: Map<string, string[]>
  flags: Set<string>
  gates: Array<{ gate: ChoiceGate; p: number }>
}

export class StoryRuntime {
  readonly audio = new AudioCore()
  readonly scroll: ScrollHandle
  readonly look = new LookController()
  private input: InputManager
  private labels: LabelLayer
  private stage: Stage | null = null
  private stageLoad: Promise<Stage | null> | null = null
  private rebuildStage = false
  private reading: Reading | null = null
  private phase: Phase = 'idle'
  private mode: Mode = 'pending'
  private token = 0
  private queue: Promise<unknown> = Promise.resolve()
  private iteration = 0
  private wrapping = false
  private disposed = false
  private chapterShown = -1
  private lastActivity = 0
  private now = 0
  private timers = new Set<ReturnType<typeof setTimeout>>()
  private unsubscribe: () => void
  private unsubscribeSettings: () => void
  private prompt: Discovery | null = null
  private hint: 'around' | 'behind' | null = null
  private cursorState: CursorState = 'default'
  private lastCamera = { x: 0, y: 0, z: 0, ok: false }
  private lookRequest = ''
  private listener: Listener = { x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: -1 }
  private options: SceneOptions
  private paused = false
  /** The choice the reading is waiting on, if any. */
  private gate: { gate: ChoiceGate; p: number } | null = null
  /** Development: hold the picture at a fixed progress. */
  held: number | null = null
  fps = 60

  constructor(
    private el: Elements,
    private views: Views,
    private cb: StoryEvents,
    private forceFallback: boolean,
  ) {
    const s = settings.get()
    this.scroll = createScroll(el.track, !s.reducedMotion)
    this.scroll.setActive(false)
    this.labels = new LabelLayer(el.labels)
    const labels = (frames: Parameters<SceneOptions['labels']>[0]) => this.labels.update(frames)
    // Read every frame by the scenes, so these settings apply without reloading anything.
    this.options = {
      quality: qualityFor('auto'),
      get reduced() {
        return settings.get().reducedMotion
      },
      get handheld() {
        const v = settings.get()
        return v.motion && !v.reducedMotion && !v.reducedCamera
      },
      labels,
    }
    this.input = new InputManager(el.canvas, {
      look: this.look,
      click: () => this.examine(),
      examine: () => this.examine(),
      cursor: (c) => this.setCursor(c),
      active: () => this.phase === 'active' && !this.paused && !!this.reading,
    })
    this.applySettings()
    this.unsubscribeSettings = settings.subscribe(() => this.applySettings())
    this.unsubscribe = this.scroll.subscribe((time, dt) => this.frame(time, dt))
    for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'] as const) window.addEventListener(type, this.onActivity, { passive: true })
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  private applySettings() {
    const s = settings.get()
    this.look.options = { sensitivity: s.sensitivity, invertY: s.invertY, autoCenter: s.autoCenter, reduced: s.reducedCamera || s.reducedMotion, enabled: s.look }
    this.audio.setVolumes({ master: s.master, music: s.music, ambient: s.ambient, sfx: s.sfx, ui: s.ui, spatial: s.spatial })
    this.scroll.setSmooth(!s.reducedMotion)
    this.stage?.setMaxScale(s.resolution)
    const q = qualityFor(s.quality)
    // Anti-aliasing and shadows are fixed when the renderer is made: they apply from the next story.
    if (this.stage && (q.msaa !== this.stage.quality.msaa || q.shadows !== this.stage.quality.shadows)) this.rebuildStage = true
    this.options.quality = q
  }

  get current() {
    return this.reading?.story.meta.id ?? null
  }

  get progress() {
    return this.held ?? this.scroll.state.progress
  }

  get stageInfo() {
    return this.stage?.mounted?.info ?? null
  }

  get resScale() {
    return this.stage?.resScale ?? 1
  }

  get currentPhase() {
    return this.phase
  }

  get isPaused() {
    return this.paused
  }

  get chapter() {
    const r = this.reading
    return r ? r.story.timeline.chapterAt(this.progress) : null
  }

  private setPhase(p: Phase) {
    this.phase = p
    this.look.held = p !== 'active'
    this.cb.phase(p)
  }

  private later(ms: number) {
    return new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        this.timers.delete(t)
        resolve()
      }, ms)
      this.timers.add(t)
    })
  }

  /** The menus' ambience (waits for the first gesture like any sound). */
  menuAmbience(factory: AudioProfileFactory = createSelectorAudio) {
    if (!this.reading) this.audio.use(factory)
  }

  /**
   * Opens a story — from the beginning, or from a chapter (a checkpoint or a
   * chapter chosen from the list).
   */
  async open(id: StoryId, opts: { chapter?: number } = {}) {
    // A second click on the story already opening (or open) does nothing.
    if (this.reading?.story.meta.id === id && (this.phase === 'loading' || this.phase === 'active') && !opts.chapter) return
    const token = ++this.token
    const story = STORIES[id]
    const start = opts.chapter && opts.chapter > 1 ? (story.timeline.CHAPTERS[opts.chapter - 1]?.start ?? 0) : 0
    // Choices: a reading from a chapter keeps the answers given before it; anything later is asked again.
    const gates = story.choices
      .map((gate) => ({ gate, p: story.timeline.SEG[gate.seg].start + story.timeline.SEG[gate.seg].len * gate.at }))
      .sort((a, b) => a.p - b.p)
    const keep = new Set(gates.filter((g) => g.p < start).map((g) => g.gate.id))
    saves.resetAnswers(id, keep)
    const saved = saves.story(id)
    const answers = new Map(Object.entries(saved?.answers ?? {}).filter(([g]) => keep.has(g)))
    const flags = new Set<string>(saved?.memory ?? [])
    for (const [gid, picked] of answers) {
      const gate = story.choices.find((g) => g.id === gid)
      for (const o of picked) gate?.options.find((x) => x.id === o)?.sets?.forEach((f) => flags.add(f))
    }
    this.setGate(null)
    this.reading = {
      story,
      tracker: new DiscoveryTracker(story, (d) => this.onSeen(d)),
      savedChapter: 0,
      lastP: start,
      completed: false,
      endDwell: 0,
      captions: story.captions,
      captionAt: story.captions.map((c) => {
        const s = story.timeline.SEG[c.seg]
        return s.start + s.len * c.at
      }),
      answers,
      flags,
      gates,
    }
    this.cb.flags([...flags])
    this.iteration = story.baseIteration
    this.cb.iteration(this.iteration)
    this.chapterShown = -1
    this.held = null
    this.setPaused(false)
    this.look.reset()
    this.lookRequest = ''
    this.setPrompt(null)
    this.setHint(null)
    this.setPhase('loading')
    this.labels.update([])
    this.enqueue(() => this.stage?.unmount())

    // The track takes the story's length.
    this.el.track.style.height = `calc(${(story.timeline.TOTAL_SCREENS * story.meta.screenVh).toFixed(1)}lvh + 100lvh)`
    this.scroll.setActive(true)
    this.scroll.refresh()
    this.scroll.scrollToProgress(start + (start > 0 ? 0.0005 : 0), true)
    this.scroll.onOverscroll(story.meta.loops ? () => this.wrap() : null)

    let createScene: SceneFactory
    let createAudio: AudioProfileFactory
    try {
      ;[createScene, createAudio] = await Promise.all([loadScene[id](), loadAudio[id]()])
    } catch (error) {
      console.error(`[strolly] "${id}" could not be loaded`, error)
      if (token === this.token) this.cb.failed()
      return
    }
    if (token !== this.token || this.disposed) return
    this.audio.use(createAudio)

    const stage = await this.ensureStage()
    if (token !== this.token || this.disposed) return
    if (stage) {
      await this.enqueue(async () => {
        if (token !== this.token || this.disposed) return
        const scene = createScene(this.options)
        try {
          await stage.mount(scene)
        } catch (error) {
          console.error(`[strolly] the "${id}" scene failed to start; continuing as text`, error)
          scene.dispose()
          this.toFallback()
          return
        }
        if (token !== this.token || this.disposed) stage.unmount()
      })
      if (token !== this.token || this.disposed) return
    }
    this.lastActivity = this.now
    this.setPhase('active')
  }

  /** Back to the menus: veil, release the story, menu ambience. */
  async close() {
    if (!this.reading && this.phase === 'idle') return
    const token = ++this.token
    this.setPhase('leaving')
    await this.later(LEAVE_MS)
    if (token !== this.token || this.disposed) return
    this.enqueue(() => this.stage?.unmount())
    this.labels.update([])
    this.setGate(null)
    this.reading = null
    this.held = null
    this.setPaused(false)
    this.setPrompt(null)
    this.setHint(null)
    this.scroll.onOverscroll(null)
    this.el.track.style.height = '0px'
    this.scroll.refresh()
    this.scroll.scrollToProgress(0, true)
    this.scroll.setActive(false)
    this.audio.use(createSelectorAudio)
    this.setCursor('default')
    this.setPhase('idle')
  }

  /** Pause: the story's time, sound, animation and look all stop; menus keep working. */
  setPaused(paused: boolean) {
    if (this.paused === paused) return
    this.paused = paused
    this.audio.setPaused(paused)
    if (this.reading) this.scroll.setActive(!paused && !this.gate)
    this.look.held = paused || this.phase !== 'active'
    if (paused) this.setCursor('default')
  }

  /** Back to the start of the current chapter (only this story is affected). */
  restartChapter() {
    const c = this.chapter
    if (!c) return
    this.look.reset()
    this.lookRequest = ''
    this.setGate(null)
    if (this.reading && !this.paused) this.scroll.setActive(true)
    this.scroll.scrollToProgress(c.start + (c.start > 0 ? 0.0005 : 0), true)
  }

  // ——— Choices ———

  private setGate(g: { gate: ChoiceGate; p: number } | null) {
    if (this.gate === g) return
    this.gate = g
    this.cb.choice(g?.gate ?? null, g ? (this.reading?.answers.get(g.gate.id) ?? []) : [])
  }

  /** Holds the reading at a gate until the reader answers. */
  private openGate(g: { gate: ChoiceGate; p: number }) {
    this.scroll.setActive(false)
    this.scroll.scrollToProgress(g.p, true)
    this.audio.ui('open')
    this.setGate(g)
  }

  /** The reader picks an option at the open gate. Returns whether the gate has all its answers. */
  choose(optionId: string) {
    const g = this.gate
    const r = this.reading
    if (!g || !r) return false
    const opt = g.gate.options.find((o) => o.id === optionId)
    const picked = r.answers.get(g.gate.id) ?? []
    if (!opt || picked.includes(optionId) || !meets(opt.when, r.flags)) return picked.length >= (g.gate.picks ?? 1)
    picked.push(optionId)
    r.answers.set(g.gate.id, picked)
    opt.sets?.forEach((f) => r.flags.add(f))
    saves.answer(r.story.meta.id, g.gate.id, optionId, (opt.sets ?? []).filter((f) => f.startsWith('mem:')))
    this.cb.flags([...r.flags])
    return picked.length >= (g.gate.picks ?? 1)
  }

  /** Lets the reading go on once the open gate has its answers. */
  release() {
    const g = this.gate
    const r = this.reading
    if (!g || !r || (r.answers.get(g.gate.id)?.length ?? 0) < (g.gate.picks ?? 1)) return
    this.setGate(null)
    if (!this.paused) this.scroll.setActive(true)
  }

  /** What this reading has chosen so far, in story order. */
  journal(): JournalEntry[] {
    const r = this.reading
    if (!r) return []
    return r.gates
      .filter((g) => r.answers.has(g.gate.id))
      .map((g) => ({ gate: g.gate, picked: (r.answers.get(g.gate.id) ?? []).map((o) => g.gate.options.find((x) => x.id === o)).filter((o): o is ChoiceOption => !!o) }))
  }

  /** Discoveries seen in this reading. */
  get seen(): ReadonlySet<string> {
    return this.reading?.tracker.seen ?? new Set()
  }

  private enqueue<T>(fn: () => T | Promise<T>) {
    const next = this.queue.then(fn, fn)
    this.queue = next.catch(() => undefined)
    return next
  }

  private ensureStage(): Promise<Stage | null> {
    if (this.mode === 'fallback') return Promise.resolve(null)
    if (this.stage && this.rebuildStage) {
      // A new quality tier: the next story gets a renderer made for it.
      const old = this.stage
      this.stage = null
      this.stageLoad = null
      this.rebuildStage = false
      this.enqueue(() => old.dispose())
    }
    if (this.stage) return Promise.resolve(this.stage)
    if (this.stageLoad) return this.stageLoad
    if (this.forceFallback || !detectWebGL2()) {
      this.toFallback()
      return Promise.resolve(null)
    }
    this.stageLoad = this.queue
      .then(() => import('@/three/Stage'))
      .then(async ({ Stage }) => {
        await document.fonts?.ready
        if (this.disposed) return null
        const canvas = this.el.canvas
        const s = settings.get()
        const stage = new Stage(canvas, qualityFor(s.quality), s.reducedMotion)
        stage.setMaxScale(s.resolution)
        stage.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight)
        stage.onContextLost(() => this.toFallback())
        this.stage = stage
        this.options.quality = stage.quality
        this.mode = 'webgl'
        this.cb.mode('webgl')
        return stage
      })
      .catch((error) => {
        console.error('[strolly] WebGL could not start; stories continue as text', error)
        this.toFallback()
        return null
      })
    return this.stageLoad
  }

  private toFallback() {
    this.stage?.dispose()
    this.stage = null
    this.labels.update([])
    this.mode = 'fallback'
    this.cb.mode('fallback')
  }

  /** TEKERRÜR keeps going: past the last frame, the next iteration begins. */
  private wrap() {
    if (this.wrapping || this.held !== null || this.phase !== 'active' || this.paused) return
    this.wrapping = true
    const token = this.token
    this.el.veil.dataset.on = 'true'
    this.later(950).then(() => {
      if (this.disposed || token !== this.token) return
      this.iteration += 1
      this.cb.iteration(this.iteration)
      if (this.reading) {
        this.reading.completed = false
        this.reading.endDwell = 0
      }
      this.look.reset()
      this.lookRequest = ''
      this.scroll.scrollToProgress(0, true)
      this.later(120).then(() => {
        this.el.veil.dataset.on = 'false'
        this.wrapping = false
      })
    })
  }

  private frame(time: number, dt: number) {
    this.now = time
    if (dt > 0) this.fps = this.fps * 0.95 + (1 / dt) * 0.05
    const r = this.reading
    if (!r) {
      this.stage?.clear()
      this.audio.update({ p: 0, dt, motion: NO_MOTION, set: 'menu', listener: null })
      return
    }
    // Paused: the last frame stays on screen; nothing advances.
    if (this.paused) return
    const story = r.story
    let p = this.progress
    // A choice ahead: crossing it forward holds the reading there.
    if (!this.gate && this.phase === 'active' && this.held === null)
      for (const g of r.gates) {
        if ((r.answers.get(g.gate.id)?.length ?? 0) >= (g.gate.picks ?? 1) || !meets(g.gate.when, r.flags)) continue
        if (r.lastP <= g.p + 1e-6 && p >= g.p) {
          this.openGate(g)
          break
        }
      }
    if (this.gate) p = this.gate.p
    this.views.narrative()?.seek(p)
    let quiet = false
    for (const [a, b] of story.quiet)
      if (p >= a && p < b) {
        quiet = true
        break
      }
    this.views.hud()?.update(p, quiet, time - this.lastActivity > IDLE_AFTER && !this.look.dragging, this.look.offHome)
    const chapter = story.timeline.chapterAt(p)
    if (chapter.index !== this.chapterShown) {
      this.chapterShown = chapter.index
      this.el.backdrop.dataset.chapter = String(chapter.index)
    }

    // The look: story locks and narrowed limits come from the scene's last frame.
    const info = this.stageInfo
    if (this.detectCut(info?.camera)) this.look.cut()
    if (info?.look.limits) this.look.limits = info.look.limits
    else this.look.limits = { yaw: null, pitchMin: -0.95, pitchMax: 0.8 }
    // The story may guide the view, once per request (the reader can always take it back).
    // A request that arrives while the view is held (a menu, a hidden tab) waits for it.
    const req = info?.look.request
    if (req && req.id !== this.lookRequest && this.look.guide(req.yaw, req.pitch, req.seconds)) this.lookRequest = req.id
    this.look.update(dt, !!info?.look.locked || this.mode !== 'webgl')

    const stage = this.stage
    if (stage) {
      if ((this.phase === 'active' || this.phase === 'leaving') && stage.mounted) {
        try {
          stage.frame({ p, time, dt, iteration: this.iteration, look: { yaw: this.look.yaw, pitch: this.look.pitch }, seen: r.tracker.seen, flags: r.flags })
        } catch (error) {
          console.error('[strolly] a frame failed; continuing as text', error)
          this.toFallback()
        }
      } else stage.clear()
    }

    if (this.phase === 'active') this.storyEvents(r, p, dt)
    const after = this.stageInfo
    let listener: Listener | null = null
    if (after) {
      const l = this.listener
      l.x = after.camera.x
      l.y = after.camera.y
      l.z = after.camera.z
      l.fx = after.forward.x
      l.fy = after.forward.y
      l.fz = after.forward.z
      listener = l
    }
    this.audio.update({ p, dt, motion: after?.motion ?? NO_MOTION, set: after?.set ?? 'none', listener })
    r.lastP = p
  }

  /** A jump of the story camera between frames: a cut. */
  private detectCut(cam: { x: number; y: number; z: number } | undefined) {
    if (!cam) return false
    const c = this.lastCamera
    const moved = c.ok ? Math.hypot(cam.x - c.x, cam.y - c.y, cam.z - c.z) : 0
    c.x = cam.x
    c.y = cam.y
    c.z = cam.z
    c.ok = true
    return moved > 0.9
  }

  private storyEvents(r: Reading, p: number, dt: number) {
    const story = r.story
    const chapters = story.timeline.CHAPTERS
    const chapter = story.timeline.chapterAt(p)
    const forward = p > r.lastP && p - r.lastP < 0.02

    // Checkpoints at chapter starts.
    if (chapter.index !== r.savedChapter) {
      const prev = r.savedChapter
      r.savedChapter = chapter.index
      if (saves.checkpoint(story.meta.id, chapter.index, chapter.start) && prev > 0) this.cb.saved()
      if (forward && prev > 0 && chapter.index === prev + 1) {
        const done = chapters[prev - 1]
        this.cb.chapterComplete(done.index, done.title, chapters.length)
      }
    }

    // Sound captions on forward crossings.
    if (forward && settings.get().captions)
      for (let i = 0; i < r.captions.length; i++) if (r.lastP < r.captionAt[i] && p >= r.captionAt[i]) this.cb.caption(r.captions[i].text)

    // What is in view.
    const info = this.stageInfo
    if (info && this.mode === 'webgl') {
      const f = r.tracker.update(p, dt, info.camera, info.forward)
      this.setPrompt(f.focus)
      this.setHint(this.look.options.enabled ? f.hint : null)
      this.input.hover(!!f.focus)
    }

    // The end: reached and stayed on for a moment.
    const last = story.timeline.SEGMENT_LIST[story.timeline.SEGMENT_LIST.length - 1]
    if (p >= last.start + last.len * 0.6) {
      r.endDwell += dt
      if (!r.completed && r.endDwell > 2.2) {
        r.completed = true
        saves.complete(story.meta.id, chapters.length)
        this.cb.completed(r.tracker.seen.size, r.tracker.total)
      }
    } else r.endDwell = 0
  }

  private onSeen(d: Discovery) {
    const r = this.reading
    if (!r) return
    saves.discover(r.story.meta.id, d.id)
    if (d.visibility !== 'visible') this.audio.ui('discover')
    this.views.hud()?.noticed()
  }

  private examine() {
    const r = this.reading
    const d = this.prompt
    if (!r || !d || !d.examine) return
    r.tracker.examine(d)
    this.audio.ui('click')
    this.cb.examined(d)
  }

  private setPrompt(d: Discovery | null) {
    if (d === this.prompt) return
    this.prompt = d
    this.cb.prompt(d)
  }

  private setHint(h: 'around' | 'behind' | null) {
    if (h === this.hint) return
    this.hint = h
    this.cb.hint(h)
  }

  private setCursor(c: CursorState) {
    if (c === this.cursorState) return
    this.cursorState = c
    this.cb.cursor(c)
  }

  /** Development: jump to a progress (and keep holding it if held). */
  jump(p: number) {
    if (this.held !== null) this.held = p
    this.scroll.scrollToProgress(p, true)
  }

  private onActivity = () => {
    this.lastActivity = this.now
  }

  private resizeFrame = 0
  private onResize = () => {
    cancelAnimationFrame(this.resizeFrame)
    this.resizeFrame = requestAnimationFrame(() => {
      const c = this.el.canvas
      this.stage?.resize(c.clientWidth, c.clientHeight)
    })
  }

  private onVisibility = () => this.audio.setHidden(document.hidden)

  dispose() {
    this.disposed = true
    this.token++
    this.unsubscribe()
    this.unsubscribeSettings()
    this.input.dispose()
    this.timers.forEach((t) => clearTimeout(t))
    this.timers.clear()
    cancelAnimationFrame(this.resizeFrame)
    for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'] as const) window.removeEventListener(type, this.onActivity)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.scroll.destroy()
    this.labels.dispose()
    this.audio.dispose()
    this.stage?.dispose()
    this.stage = null
  }
}
