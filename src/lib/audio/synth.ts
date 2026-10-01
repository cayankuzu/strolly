/** Procedural sound sources. Nothing is sampled; every sound is generated here. */

export function noiseBuffer(ctx: BaseAudioContext, seconds: number, color: 'white' | 'pink' | 'brown') {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0,
      last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      if (color === 'white') data[i] = white
      else if (color === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.969 * b2 + white * 0.153852
        b3 = 0.8665 * b3 + white * 0.3104856
        b4 = 0.55 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.016898
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      } else {
        last = (last + 0.02 * white) / 1.02
        data[i] = last * 3.5
      }
    }
    // Crossfade the loop point to avoid a click.
    const fade = Math.min(2048, length / 4)
    for (let i = 0; i < fade; i++) {
      const t = i / fade
      data[i] = data[i] * t + data[length - fade + i] * (1 - t)
    }
  }
  return buffer
}

export function impulseResponse(ctx: BaseAudioContext, seconds: number, decay: number) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
  }
  return buffer
}

export function filter(ctx: AudioContext, type: BiquadFilterType, freq: number, q = 0.7) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  return f
}

type Env = { attack: number; decay: number; peak: number }

function envelope(ctx: AudioContext, g: GainNode, t: number, e: Env) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, e.peak), t + e.attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + e.attack + e.decay)
}

/** Short filtered noise burst (clicks, thuds, steps, relays). */
export function burst(ctx: AudioContext, noise: AudioBuffer, dest: AudioNode, opts: { freq: number; q?: number; type?: BiquadFilterType; env: Env; pan?: number; rate?: number }) {
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noise
  src.playbackRate.value = opts.rate ?? 1
  const f = filter(ctx, opts.type ?? 'bandpass', opts.freq, opts.q ?? 1)
  const g = ctx.createGain()
  const p = ctx.createStereoPanner()
  p.pan.value = opts.pan ?? 0
  src.connect(f).connect(g).connect(p).connect(dest)
  envelope(ctx, g, t, opts.env)
  src.start(t, Math.random() * (noise.duration - 1))
  src.stop(t + opts.env.attack + opts.env.decay + 0.05)
}

/** A tone with an optional glide (boot tones, clinks, chirps, plucks). */
export function tone(ctx: AudioContext, dest: AudioNode, opts: { freq: number; to?: number; glide?: number; type?: OscillatorType; env: Env; pan?: number; delay?: number }) {
  const t = ctx.currentTime + (opts.delay ?? 0)
  const o = ctx.createOscillator()
  o.type = opts.type ?? 'sine'
  o.frequency.setValueAtTime(opts.freq, t)
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.glide ?? opts.env.attack + opts.env.decay))
  const g = ctx.createGain()
  const p = ctx.createStereoPanner()
  p.pan.value = opts.pan ?? 0
  o.connect(g).connect(p).connect(dest)
  envelope(ctx, g, t, opts.env)
  o.start(t)
  o.stop(t + opts.env.attack + opts.env.decay + 0.05)
}
