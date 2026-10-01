/**
 * The one audio context. Stories plug in a profile — a small graph of
 * continuous layers plus one-shots — on their own buses; switching stories
 * crossfades them and stops every source of the old profile, so no sound
 * outlives its story.
 *
 *   profile layers ─┬─ music   ─┐
 *                   ├─ ambient ─┼─ master ─ compressor ─ out
 *   one-shots ──────┴─ sfx     ─┤
 *   menus, prompts ─── ui ──────┘   (never paused with the story)
 *
 * Positional sources go through HRTF panners; the listener follows the
 * story camera *and* the reader's look, so a sound behind you is behind you.
 */
import { burst, impulseResponse, noiseBuffer, tone } from './synth'

export type Category = 'music' | 'ambient' | 'sfx'

export type Listener = { x: number; y: number; z: number; fx: number; fy: number; fz: number }

export type AudioFrame = {
  p: number
  dt: number
  /** What the picture is doing: footsteps, machines, doors, the current era… */
  motion: { step: number; walking: number; robots: number; doors: number; frame: number }
  set: string
  /** Where the reader is and where they look (world space of the story's set). */
  listener: Listener | null
}

export interface AudioProfile {
  update(frame: AudioFrame): void
}

export type AudioKit = {
  ctx: AudioContext
  /** The profile's ambient bus (crossfaded on story switches). */
  out: GainNode
  /** One-shots: to the sfx bus, with a reverb send. */
  fx: GainNode
  /** Reverb send. */
  verb: GainNode
  noise: { white: AudioBuffer; pink: AudioBuffer; brown: AudioBuffer }
  /** Looping noise source into `dest`. */
  loop(buffer: AudioBuffer, dest: AudioNode, rate?: number): AudioBufferSourceNode
  /** Oscillator through its own gain into `dest`. */
  osc(type: OscillatorType, freq: number, dest: AudioNode, gain?: number): { o: OscillatorNode; g: GainNode }
  /** Modulates an AudioParam: value ± depth at `rate` Hz. */
  lfo(param: AudioParam, rate: number, depth: number): OscillatorNode
  /** A gain node on one of the profile's buses (a layer), with an optional reverb send. */
  layer(send?: number, category?: Category): GainNode
  /**
   * A layer that sounds from a place in the set. Returns its gain (connect sources
   * into it) and the panner (move it with `place`).
   */
  spatial(x: number, y: number, z: number, opts?: { send?: number; category?: Category; ref?: number; rolloff?: number }): { gain: GainNode; place(x: number, y: number, z: number): void }
}

export type AudioProfileFactory = (kit: AudioKit) => AudioProfile

export type UiSound = 'hover' | 'click' | 'open' | 'close' | 'transition' | 'save' | 'discover' | 'warning' | 'complete' | 'tick'

export type Volumes = { master: number; music: number; ambient: number; sfx: number; ui: number; spatial: boolean }

type Spot = { panner: PannerNode; x: number; y: number; z: number }
type Mounted = { profile: AudioProfile; buses: Record<Category, GainNode>; sources: AudioScheduledSourceNode[]; spots: Spot[] }

export class AudioCore {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private cats!: Record<Category, GainNode>
  private uiBus!: GainNode
  private story!: GainNode
  private verb!: GainNode
  private noise!: AudioKit['noise']
  private current: Mounted | null = null
  private factory: AudioProfileFactory | null = null
  private enabled = false
  private paused = false
  private suspendTimer: ReturnType<typeof setTimeout> | null = null
  private volumes: Volumes = { master: 0.85, music: 0.8, ambient: 0.9, sfx: 0.9, ui: 0.5, spatial: true }
  private lastUi = 0

  get running() {
    return !!this.ctx && this.ctx.state === 'running' && this.enabled
  }

  private build() {
    const ctx = new AudioContext({ latencyHint: 'interactive' })
    this.ctx = ctx
    this.noise = { white: noiseBuffer(ctx, 3, 'white'), pink: noiseBuffer(ctx, 4, 'pink'), brown: noiseBuffer(ctx, 4, 'brown') }
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.ratio.value = 3
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp).connect(ctx.destination)
    // Story audio passes through one gain so a pause can hush it without touching the menus.
    this.story = ctx.createGain()
    this.story.connect(this.master)
    this.cats = { music: ctx.createGain(), ambient: ctx.createGain(), sfx: ctx.createGain() }
    for (const g of Object.values(this.cats)) g.connect(this.story)
    this.uiBus = ctx.createGain()
    this.uiBus.connect(this.master)
    const convolver = ctx.createConvolver()
    convolver.buffer = impulseResponse(ctx, 3.2, 2.6)
    this.verb = ctx.createGain()
    const wet = ctx.createGain()
    wet.gain.value = 0.32
    this.verb.connect(convolver).connect(wet).connect(this.story)
    const l = ctx.listener
    if (l.positionX) {
      l.positionX.value = 0
      l.positionY.value = 0
      l.positionZ.value = 0
    }
    this.applyVolumes()
  }

  setVolumes(v: Volumes) {
    const spatialChanged = v.spatial !== this.volumes.spatial
    this.volumes = v
    if (!this.ctx) return
    this.applyVolumes()
    if (spatialChanged && this.current) for (const s of this.current.spots) s.panner.panningModel = v.spatial ? 'HRTF' : 'equalpower'
  }

  private applyVolumes() {
    const ctx = this.ctx!
    const v = this.volumes
    const t = ctx.currentTime
    this.cats.music.gain.setTargetAtTime(v.music, t, 0.05)
    this.cats.ambient.gain.setTargetAtTime(v.ambient, t, 0.05)
    this.cats.sfx.gain.setTargetAtTime(v.sfx, t, 0.05)
    this.uiBus.gain.setTargetAtTime(v.ui * 0.6, t, 0.05)
    if (this.enabled) this.master.gain.setTargetAtTime(v.master, t, 0.1)
  }

  /** Must be called from a user gesture the first time. */
  async enable() {
    if (!this.ctx) this.build()
    const ctx = this.ctx!
    if (this.suspendTimer) clearTimeout(this.suspendTimer)
    this.enabled = true
    if (ctx.state !== 'running') await ctx.resume()
    if (!this.current && this.factory) this.mount(this.factory)
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(this.volumes.master, ctx.currentTime, 0.4)
  }

  disable() {
    this.enabled = false
    const ctx = this.ctx
    if (!ctx) return
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
    this.suspendTimer = setTimeout(() => ctx.state === 'running' && !this.enabled && ctx.suspend(), 700)
  }

  /** Pause processing while the tab is hidden. */
  setHidden(hidden: boolean) {
    const ctx = this.ctx
    if (!ctx || !this.enabled) return
    if (hidden) ctx.suspend()
    else ctx.resume()
  }

  /** The story holds its breath (pause menu); menus keep their sounds. */
  setPaused(paused: boolean) {
    this.paused = paused
    if (!this.ctx) return
    this.story.gain.setTargetAtTime(paused ? 0 : 1, this.ctx.currentTime, paused ? 0.12 : 0.3)
  }

  /** Swaps the story soundscape: the old one fades out and is released, the new one fades in. */
  use(factory: AudioProfileFactory | null) {
    this.factory = factory
    if (this.current) this.release(this.current)
    this.current = null
    if (factory && this.ctx) this.mount(factory)
  }

  private mount(factory: AudioProfileFactory) {
    const ctx = this.ctx!
    const sources: AudioScheduledSourceNode[] = []
    const spots: Spot[] = []
    const bus = (cat: Category) => {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(this.cats[cat])
      g.gain.setTargetAtTime(1, ctx.currentTime + 0.1, 0.6)
      return g
    }
    const buses = { music: bus('music'), ambient: bus('ambient'), sfx: bus('sfx') }
    const fx = ctx.createGain()
    fx.gain.value = 0.9
    fx.connect(buses.sfx)
    const fxSend = ctx.createGain()
    fxSend.gain.value = 0.35
    fx.connect(fxSend).connect(this.verb)
    const layer = (send = 0, category: Category = 'ambient') => {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(buses[category])
      if (send > 0) {
        const s = ctx.createGain()
        s.gain.value = send
        g.connect(s).connect(this.verb)
      }
      return g
    }
    const kit: AudioKit = {
      ctx,
      out: buses.ambient,
      fx,
      verb: this.verb,
      noise: this.noise,
      loop: (buffer, dest, rate = 1) => {
        const src = ctx.createBufferSource()
        src.buffer = buffer
        src.loop = true
        src.playbackRate.value = rate
        src.connect(dest)
        src.start(ctx.currentTime + Math.random() * 0.05, Math.random() * buffer.duration)
        sources.push(src)
        return src
      },
      osc: (type, freq, dest, gain = 1) => {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = freq
        const g = ctx.createGain()
        g.gain.value = gain
        o.connect(g).connect(dest)
        o.start()
        sources.push(o)
        return { o, g }
      },
      lfo: (param, rate, depth) => {
        const o = ctx.createOscillator()
        o.frequency.value = rate
        const g = ctx.createGain()
        g.gain.value = depth
        o.connect(g).connect(param)
        o.start(ctx.currentTime + Math.random())
        sources.push(o)
        return o
      },
      layer,
      spatial: (x, y, z, opts = {}) => {
        const gain = layer(opts.send ?? 0, opts.category ?? 'ambient')
        // Re-route the layer through a panner placed in the set.
        gain.disconnect()
        const panner = ctx.createPanner()
        panner.panningModel = this.volumes.spatial ? 'HRTF' : 'equalpower'
        panner.distanceModel = 'inverse'
        panner.refDistance = opts.ref ?? 2
        panner.rolloffFactor = opts.rolloff ?? 1
        panner.maxDistance = 200
        gain.connect(panner).connect(buses[opts.category ?? 'ambient'])
        if (opts.send) {
          const s = ctx.createGain()
          s.gain.value = opts.send
          gain.connect(s).connect(this.verb)
        }
        const spot: Spot = { panner, x, y, z }
        spots.push(spot)
        const place = (px: number, py: number, pz: number) => {
          spot.x = px
          spot.y = py
          spot.z = pz
        }
        return { gain, place }
      },
    }
    this.current = { profile: factory(kit), buses, sources, spots }
  }

  private release(m: Mounted) {
    const ctx = this.ctx!
    for (const b of Object.values(m.buses)) {
      b.gain.cancelScheduledValues(ctx.currentTime)
      b.gain.setTargetAtTime(0, ctx.currentTime, 0.2)
    }
    setTimeout(() => {
      m.sources.forEach((s) => {
        try {
          s.stop()
        } catch {
          /* already stopped */
        }
        s.disconnect()
      })
      for (const b of Object.values(m.buses)) b.disconnect()
      for (const s of m.spots) s.panner.disconnect()
    }, 1200)
  }

  update(frame: AudioFrame) {
    if (!this.running || !this.current || this.paused) return
    this.place(frame.listener)
    this.current.profile.update(frame)
  }

  /** Moves the listener with the camera and the reader's look; spatial off keeps sources centered. */
  private place(l: Listener | null) {
    const ctx = this.ctx!
    const t = ctx.currentTime
    const L = ctx.listener
    const spots = this.current!.spots
    if (!l) return
    const set = (param: AudioParam | undefined, v: number) => param?.setTargetAtTime(v, t, 0.05)
    if (L.positionX) {
      set(L.positionX, l.x)
      set(L.positionY, l.y)
      set(L.positionZ, l.z)
      set(L.forwardX, l.fx)
      set(L.forwardY, l.fy)
      set(L.forwardZ, l.fz)
      set(L.upX, 0)
      set(L.upY, 1)
      set(L.upZ, 0)
    } else {
      L.setPosition(l.x, l.y, l.z)
      L.setOrientation(l.fx, l.fy, l.fz, 0, 1, 0)
    }
    for (const s of spots) {
      const sx = this.volumes.spatial ? s.x : l.x
      const sy = this.volumes.spatial ? s.y : l.y
      const sz = this.volumes.spatial ? s.z : l.z
      if (s.panner.positionX) {
        set(s.panner.positionX, sx)
        set(s.panner.positionY, sy)
        set(s.panner.positionZ, sz)
      } else s.panner.setPosition(sx, sy, sz)
    }
  }

  /** Interface sounds: quiet, short, always below the story. */
  ui(kind: UiSound) {
    const ctx = this.ctx
    if (!ctx || !this.running) return
    const now = performance.now()
    if (kind === 'hover' && now - this.lastUi < 60) return
    this.lastUi = now
    const out = this.uiBus
    const n = this.noise
    switch (kind) {
      case 'hover':
        tone(ctx, out, { freq: 1760, env: { attack: 0.002, decay: 0.05, peak: 0.012 } })
        break
      case 'click':
        tone(ctx, out, { freq: 880, to: 660, glide: 0.08, env: { attack: 0.002, decay: 0.12, peak: 0.04 } })
        burst(ctx, n.white, out, { freq: 3200, q: 2, env: { attack: 0.001, decay: 0.02, peak: 0.02 } })
        break
      case 'open':
        burst(ctx, n.pink, out, { freq: 900, q: 0.6, env: { attack: 0.08, decay: 0.3, peak: 0.05 } })
        tone(ctx, out, { freq: 440, to: 660, glide: 0.25, env: { attack: 0.02, decay: 0.35, peak: 0.02 } })
        break
      case 'close':
        burst(ctx, n.pink, out, { freq: 700, q: 0.6, env: { attack: 0.03, decay: 0.25, peak: 0.04 } })
        tone(ctx, out, { freq: 660, to: 440, glide: 0.2, env: { attack: 0.01, decay: 0.3, peak: 0.02 } })
        break
      case 'transition':
        burst(ctx, n.pink, out, { freq: 400, q: 0.5, env: { attack: 0.5, decay: 1.2, peak: 0.06 } })
        tone(ctx, out, { freq: 110, to: 82.4, glide: 1.4, env: { attack: 0.2, decay: 1.4, peak: 0.05 } })
        break
      case 'save':
        tone(ctx, out, { freq: 1318.5, env: { attack: 0.005, decay: 0.3, peak: 0.015 } })
        break
      case 'tick':
        // A line arriving on a terminal: a short dry relay click.
        burst(ctx, n.white, out, { freq: 2400, q: 3, env: { attack: 0.001, decay: 0.018, peak: 0.018 } })
        break
      case 'discover':
        tone(ctx, out, { freq: 987.8, env: { attack: 0.01, decay: 0.8, peak: 0.02 } })
        tone(ctx, out, { freq: 1480, env: { attack: 0.01, decay: 1.1, peak: 0.012 }, delay: 0.12 })
        break
      case 'warning':
        tone(ctx, out, { freq: 330, env: { attack: 0.01, decay: 0.25, peak: 0.03 } })
        tone(ctx, out, { freq: 311, env: { attack: 0.01, decay: 0.25, peak: 0.03 }, delay: 0.18 })
        break
      case 'complete':
        for (const [f, d] of [
          [293.66, 0],
          [440, 0.15],
          [587.33, 0.3],
        ] as const)
          tone(ctx, out, { freq: f, env: { attack: 0.02, decay: 2.2, peak: 0.025 }, delay: d })
        break
    }
  }

  dispose() {
    if (this.suspendTimer) clearTimeout(this.suspendTimer)
    this.current = null
    this.ctx?.close()
    this.ctx = null
  }
}
