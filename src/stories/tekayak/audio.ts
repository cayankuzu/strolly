/**
 * TEK AYAK's sound: a quiet classroom on a Friday afternoon — room tone, the
 * wall clock's slightly sticky tick, pens, chalk on the board, the yard far
 * away through the glass. Then paper folding, a felt-tip cap, held-back
 * snorts, whispers; the plane's soft whoosh and the tap on his head; the
 * hush in which the clock is the loudest thing; the shout; the mutter; two
 * chairs, one ambiguous rubber squeak, steps; the hand on the wall; the
 * laugh, pushed away into a hum while the clock races; the bell.
 *
 * The wheels are never heard before the reveal (docs §3.5). Radiators are
 * cold: they never tick. Everything is synthesized here.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, lapse, SEG } from './timeline'

type LayerId = 'room' | 'yard' | 'pens' | 'laugh' | 'hum'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  room: [k(0, 0.22), k(at('flight', 0.44), 0.22), k(at('flight', 0.5), 0.1), k(at('summon', 1), 0.1), k(at('rise'), 0.16), k(at('lift', 0.6), 0.16), k(at('lift', 0.66), 0.06), k(at('reveal', 0.1), 0.12), k(at('end', 0.6), 0.2), k(1, 0.2)],
  yard: [k(0, 0.12), k(at('rows', 1), 0.1), k(at('flight', 0.44), 0.08), k(at('flight', 0.5), 0.02), k(at('summon', 1), 0.02), k(at('lift', 0.6), 0.02), k(at('lift', 0.66), 0), k(at('still'), 0), k(at('end', 0.6), 0.1), k(1, 0.1)],
  pens: [k(0, 0), k(at('board', 0.1), 0.16), k(at('rows', 1), 0.16), k(at('under', 0.3), 0.07), k(at('whisper', 1), 0.07), k(at('flight', 0.44), 0), k(at('flow', 0.4), 0), k(at('flow', 0.6), 0.1), k(at('end', 0.56), 0.1), k(at('end', 0.6), 0)],
  laugh: [k(at('burst', 0.46), 0), k(at('burst', 0.5), 0.35), k(at('burst', 0.75), 0.7), k(at('laughs', 1), 0.7), k(at('still', 0.6), 0.4), k(at('flow', 0.25), 0.25), k(at('flow', 0.5), 0), k(1, 0)],
  hum: [k(at('flow', 0.2), 0), k(at('flow', 0.45), 0.22), k(at('end', 0.56), 0.22), k(at('end', 0.6), 0), k(1, 0)],
}

/** Where the chalk is writing (the image's own ranges; the sound needs the reader to be scrolling too). */
const WRITING: Array<[number, number]> = [
  [at('open', 0.2), at('open', 0.95)],
  [at('board', 0.46), at('board', 0.98)],
  [at('light', 0), at('light', 0.3)],
  [at('light', 0.35), at('light', 0.78)],
  [at('under', 0.05), at('pass', 0.9)],
  [at('aim', 0.5), at('whisper', 0.4)],
]

export function createTekAyakAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise, fx } = kit
  const layers = {} as Record<LayerId, GainNode>

  // Room tone: a low, still room.
  const room = (layers.room = kit.layer(0.15))
  const rF = filter(ctx, 'lowpass', 320)
  kit.loop(noise.brown, rF, 0.7)
  rF.connect(room)

  // The yard through the glass: far voices as a filtered murmur.
  const yardSpot = kit.spatial(-5.5, 1.8, 0, { ref: 3, send: 0.2 })
  const yard = (layers.yard = yardSpot.gain)
  const yF = filter(ctx, 'bandpass', 700, 0.6)
  kit.loop(noise.pink, yF, 0.9)
  const yLp = filter(ctx, 'lowpass', 1400)
  yF.connect(yLp).connect(yard)

  // Pens on paper: a soft, busy scratch that breathes.
  const pens = (layers.pens = kit.layer(0.1))
  const pF = filter(ctx, 'bandpass', 3800, 0.9)
  const pG = ctx.createGain()
  pG.gain.value = 0.5
  kit.loop(noise.white, pF, 1.0)
  pF.connect(pG).connect(pens)
  kit.lfo(pG.gain, 3.1, 0.35)

  // The laugh: many voices — vowel formants pulsing at laughing rates.
  const laughSpot = kit.spatial(0.5, 1.1, 0.8, { ref: 3, send: 0.35 })
  const laugh = (layers.laugh = laughSpot.gain)
  const laughLp = filter(ctx, 'lowpass', 4000)
  laughLp.connect(laugh)
  const voices: Array<{ g: GainNode; rate: number }> = []
  for (let i = 0; i < 7; i++) {
    const f0 = 180 + i * 37
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f0
    const form = filter(ctx, 'bandpass', 650 + (i % 3) * 300, 3)
    const g = ctx.createGain()
    g.gain.value = 0
    o.connect(form).connect(g).connect(laughLp)
    o.start()
    kit.lfo(o.frequency, 0.7 + i * 0.13, 12)
    voices.push({ g, rate: 4.6 + i * 0.45 })
  }
  const breath = filter(ctx, 'bandpass', 2600, 0.8)
  const breathG = ctx.createGain()
  breathG.gain.value = 0.25
  kit.loop(noise.white, breath)
  breath.connect(breathG).connect(laughLp)

  // The hum the laugh becomes: far away, low-passed.
  const hum = (layers.hum = kit.layer(0.4))
  const hF = filter(ctx, 'lowpass', 260)
  kit.loop(noise.pink, hF, 0.6)
  hF.connect(hum)
  kit.osc('sine', 110, hum, 0.03)

  // The clock above the bin corner.
  const clockSpot = kit.spatial(3.0, 2.45, -3.46, { ref: 1.6, category: 'sfx', send: 0.15 })
  clockSpot.gain.gain.value = 1
  // The board.
  const boardSpot = kit.spatial(0.6, 1.5, -3.4, { ref: 1.6, category: 'sfx', send: 0.2 })
  boardSpot.gain.gain.value = 1
  // Off-screen at the back (the three getting up), and the corner.
  const backSpot = kit.spatial(2.6, 0.5, 2.6, { ref: 2, category: 'sfx', send: 0.3 })
  backSpot.gain.gain.value = 1
  const cornerSpot = kit.spatial(2.6, 0.8, -3.0, { ref: 1.6, category: 'sfx', send: 0.25 })
  cornerSpot.gain.gain.value = 1

  let lastP = -1
  let lastStep = 0
  let tickClock = 0.4
  let tickSide = 0
  let chalkClock = 0
  let yardClock = 6
  let laughClock = 0

  const chalkScratch = (peak: number) => {
    burst(ctx, noise.white, boardSpot.gain, { freq: 4200 + Math.random() * 1800, q: 2.5, env: { attack: 0.004, decay: 0.05 + Math.random() * 0.06, peak } })
    if (Math.random() < 0.25) burst(ctx, noise.white, boardSpot.gain, { freq: 1600, q: 4, env: { attack: 0.001, decay: 0.02, peak: peak * 1.2 } })
  }
  const paper = (dest: AudioNode, peak: number, n = 5) => {
    for (let i = 0; i < n; i++) setTimeout(() => burst(ctx, noise.white, dest, { freq: 2200 + Math.random() * 2600, q: 0.8, env: { attack: 0.002, decay: 0.04 + Math.random() * 0.08, peak: peak * (0.5 + Math.random() * 0.5) } }), i * (25 + Math.random() * 60))
  }
  const snort = (dest: AudioNode, peak: number) => {
    burst(ctx, noise.pink, dest, { freq: 520, q: 1.2, env: { attack: 0.01, decay: 0.12, peak } })
    tone(ctx, dest, { freq: 160, to: 120, type: 'sawtooth', env: { attack: 0.01, decay: 0.09, peak: peak * 0.15 } })
  }
  const whisper = (dest: AudioNode, peak: number, n = 6) => {
    for (let i = 0; i < n; i++) setTimeout(() => burst(ctx, noise.white, dest, { freq: 5200 + Math.random() * 2500, q: 1.4, env: { attack: 0.02, decay: 0.08 + Math.random() * 0.1, peak: peak * (0.5 + Math.random() * 0.5) } }), i * (70 + Math.random() * 90))
  }
  const voice = (dest: AudioNode, f0: number, dur: number, peak: number, rate = 9) => {
    // A voice burst: a buzz through two formants, wobbling like syllables.
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f0, t)
    o.frequency.linearRampToValueAtTime(f0 * 0.8, t + dur)
    const f1 = filter(ctx, 'bandpass', 700, 4)
    const f2 = filter(ctx, 'bandpass', 1300, 5)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + 0.03)
    g.gain.setValueAtTime(peak, t + dur * 0.8)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    const am = ctx.createOscillator()
    am.frequency.value = rate
    const amG = ctx.createGain()
    amG.gain.value = peak * 0.6
    am.connect(amG).connect(g.gain)
    o.connect(f1).connect(g)
    o.connect(f2).connect(g)
    g.connect(dest)
    o.start(t)
    am.start(t)
    o.stop(t + dur + 0.05)
    am.stop(t + dur + 0.05)
    // Formants drift (syllables).
    for (let i = 0; i < dur * rate; i++) {
      const tt = t + i / rate
      f1.frequency.setValueAtTime(500 + Math.random() * 500, tt)
      f2.frequency.setValueAtTime(1100 + Math.random() * 900, tt)
    }
  }
  const scrape = (dest: AudioNode, peak: number, delay = 0) => {
    setTimeout(() => {
      const t = ctx.currentTime
      const src = ctx.createBufferSource()
      src.buffer = noise.white
      const f = filter(ctx, 'bandpass', 900, 6)
      f.frequency.setValueAtTime(700, t)
      f.frequency.linearRampToValueAtTime(1300, t + 0.35)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(peak, t + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
      src.connect(f).connect(g).connect(dest)
      src.start(t, Math.random())
      src.stop(t + 0.45)
    }, delay * 1000)
  }
  const step = (dest: AudioNode, peak: number, pan = 0) => {
    burst(ctx, noise.brown, dest, { freq: 220, type: 'lowpass', env: { attack: 0.004, decay: 0.09, peak }, pan })
    burst(ctx, noise.white, dest, { freq: 3000, q: 2, env: { attack: 0.002, decay: 0.025, peak: peak * 0.12 }, pan })
  }
  const bell = () => {
    const t = ctx.currentTime
    for (const f of [820, 1640, 2470]) {
      const o = ctx.createOscillator()
      o.type = 'square'
      o.frequency.value = f
      const g = ctx.createGain()
      const lp = filter(ctx, 'lowpass', 3500)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(f === 820 ? 0.06 : 0.02, t + 0.02)
      g.gain.setValueAtTime(f === 820 ? 0.06 : 0.02, t + 2.6)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.0)
      const am = ctx.createOscillator()
      am.frequency.value = 28
      const amG = ctx.createGain()
      amG.gain.value = f === 820 ? 0.04 : 0.012
      am.connect(amG).connect(g.gain)
      o.connect(lp).connect(g).connect(fx)
      o.start(t)
      am.start(t)
      o.stop(t + 3.05)
      am.stop(t + 3.05)
    }
  }

  const crossings = (from: number, to: number) => {
    const crossed = (t: number) => from < t && to >= t
    // 01 — chalk squeak, the clock, pens.
    if (crossed(at('open', 0.15))) tone(ctx, boardSpot.gain, { freq: 2600, to: 3400, glide: 0.18, env: { attack: 0.01, decay: 0.2, peak: 0.03 } })
    if (crossed(at('light', 0.6)) || crossed(at('hush', 0.1))) tone(ctx, clockSpot.gain, { freq: 2100, env: { attack: 0.001, decay: 0.03, peak: 0.12 } })
    if (crossed(at('rows', 0.2))) paper(fx, 0.03, 6)
    // 02 — paper, the cap, snorts, whispers, the plane.
    if (crossed(at('under', 0.5))) paper(fx, 0.06, 8)
    if (crossed(at('fold', 0.12)) || crossed(at('fold', 0.32)) || crossed(at('fold', 0.62))) paper(fx, 0.05, 4)
    if (crossed(at('pass', 0.12))) {
      tone(ctx, fx, { freq: 900, to: 300, glide: 0.04, env: { attack: 0.001, decay: 0.05, peak: 0.06 } })
      burst(ctx, noise.white, fx, { freq: 2500, q: 3, env: { attack: 0.001, decay: 0.02, peak: 0.08 } })
    }
    if (crossed(at('pass', 0.35))) tone(ctx, fx, { freq: 3800, to: 4400, glide: 0.25, env: { attack: 0.02, decay: 0.25, peak: 0.012 } })
    if (crossed(at('aim', 0.3))) {
      snort(fx, 0.07)
      setTimeout(() => snort(fx, 0.05), 380)
    }
    if (crossed(at('whisper', 0.12))) {
      whisper(fx, 0.04, 9)
      setTimeout(() => burst(ctx, noise.white, fx, { freq: 6500, q: 1, env: { attack: 0.05, decay: 0.4, peak: 0.03 } }), 600)
      setTimeout(() => snort(fx, 0.06), 900)
      setTimeout(() => snort(fx, 0.05), 1400)
    }
    if (crossed(at('whisper', 0.4))) burst(ctx, noise.white, boardSpot.gain, { freq: 1800, q: 3, env: { attack: 0.001, decay: 0.03, peak: 0.1 } })
    if (crossed(at('flight', 0.08))) {
      // The whoosh, slowed: pitched-down air.
      const t = ctx.currentTime
      const src = ctx.createBufferSource()
      src.buffer = noise.pink
      src.playbackRate.value = 0.5
      const f = filter(ctx, 'bandpass', 500, 0.8)
      f.frequency.setValueAtTime(400, t)
      f.frequency.linearRampToValueAtTime(900, t + 1.4)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.4)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
      src.connect(f).connect(g).connect(fx)
      src.start(t, Math.random())
      src.stop(t + 1.7)
    }
    if (crossed(at('flight', 0.44))) {
      burst(ctx, noise.white, boardSpot.gain, { freq: 2200, q: 1.5, env: { attack: 0.001, decay: 0.05, peak: 0.12 } })
      burst(ctx, noise.brown, boardSpot.gain, { freq: 400, type: 'lowpass', env: { attack: 0.002, decay: 0.06, peak: 0.08 } })
    }
    if (crossed(at('flight', 0.62))) for (let i = 0; i < 4; i++) setTimeout(() => burst(ctx, noise.white, boardSpot.gain, { freq: 3000 + i * 400, q: 2, env: { attack: 0.002, decay: 0.03, peak: 0.05 - i * 0.01 } }), i * 70)
    // 03 — the snap, the shout, paper, the mutter, the slap.
    if (crossed(at('anger', 0.32))) {
      burst(ctx, noise.white, boardSpot.gain, { freq: 3200, q: 2, env: { attack: 0.0005, decay: 0.03, peak: 0.16 } })
      setTimeout(() => burst(ctx, noise.white, boardSpot.gain, { freq: 4500, q: 3, env: { attack: 0.001, decay: 0.02, peak: 0.05 } }), 420)
    }
    if (crossed(at('turn', 0.52))) voice(boardSpot.gain, 190, 0.7, 0.2, 7)
    if (crossed(at('smooth', 0.3))) paper(boardSpot.gain, 0.05, 7)
    if (crossed(at('mock', 0.08))) voice(boardSpot.gain, 120, 2.6, 0.06, 11)
    if (crossed(at('mock', 0.45))) voice(boardSpot.gain, 140, 2.0, 0.07, 6)
    if (crossed(at('summon', 0.1))) {
      burst(ctx, noise.pink, boardSpot.gain, { freq: 1200, q: 0.9, env: { attack: 0.001, decay: 0.06, peak: 0.14 } })
      setTimeout(() => voice(boardSpot.gain, 170, 0.8, 0.12, 6), 250)
    }
    // 04 — two chairs, one rubber squeak (it is a sneaker), steps, the wall.
    if (crossed(at('rise', 0.06))) {
      scrape(backSpot.gain, 0.09)
      scrape(backSpot.gain, 0.07, 0.35)
    }
    if (crossed(at('rise', 0.3))) tone(ctx, backSpot.gain, { freq: 1300, to: 2300, glide: 0.08, env: { attack: 0.005, decay: 0.09, peak: 0.03 } })
    if (crossed(at('order', 0.08))) voice(boardSpot.gain, 175, 1.1, 0.1, 6)
    if (crossed(at('walk', 0.15))) for (let i = 0; i < 10; i++) setTimeout(() => step(backSpot.gain, 0.12, i % 2 ? 0.2 : -0.2), i * 330)
    if (crossed(at('lineUp', 0.08))) voice(boardSpot.gain, 165, 1.4, 0.09, 6)
    if (crossed(at('lift', 0.08))) tone(ctx, cornerSpot.gain, { freq: 1500, to: 1900, glide: 0.05, env: { attack: 0.004, decay: 0.05, peak: 0.015 } })
    if (crossed(at('lift', 0.38))) {
      burst(ctx, noise.brown, cornerSpot.gain, { freq: 300, type: 'lowpass', env: { attack: 0.002, decay: 0.12, peak: 0.25 } })
      burst(ctx, noise.white, cornerSpot.gain, { freq: 2000, q: 1, env: { attack: 0.001, decay: 0.04, peak: 0.06 } })
    }
    // 05 — the whisper, the laugh, the slap on a desk, the bell.
    if (crossed(at('burst', 0.04))) whisper(cornerSpot.gain, 0.05, 7)
    if (crossed(at('burst', 0.46))) snort(cornerSpot.gain, 0.1)
    if (crossed(at('burst', 0.47))) {
      voice(cornerSpot.gain, 260, 1.2, 0.12, 6)
      voice(cornerSpot.gain, 220, 1.4, 0.1, 5.4)
    }
    if (crossed(at('laughs', 0.1))) for (let i = 0; i < 3; i++) setTimeout(() => burst(ctx, noise.brown, fx, { freq: 500, type: 'lowpass', env: { attack: 0.002, decay: 0.1, peak: 0.2 } }), i * 260)
    if (crossed(at('end', 0.6))) {
      bell()
      setTimeout(() => {
        for (let i = 0; i < 6; i++) scrape(fx, 0.06, i * 0.12)
        for (let i = 0; i < 16; i++) setTimeout(() => step(fx, 0.08, Math.random() - 0.5), 300 + i * 140)
        voice(fx, 230, 2.4, 0.05, 8)
        voice(fx, 200, 2.0, 0.05, 7)
      }, 900)
    }
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)
      // The laugh, pulsing; in the flow it goes far away.
      laughClock += dt
      const away = Math.max(0, Math.min(1, (p - at('flow', 0.2)) / (at('flow', 0.45) - at('flow', 0.2))))
      laughLp.frequency.setTargetAtTime(4000 - 3600 * away, now, 0.3)
      for (const v of voices) {
        const pulse = Math.max(0, Math.sin(laughClock * v.rate * Math.PI * 2 + v.rate)) * (0.5 + 0.5 * Math.sin(laughClock * 0.7 + v.rate))
        v.g.gain.setTargetAtTime(pulse * 0.05, now, 0.02)
      }
      breathG.gain.setTargetAtTime(0.1 + 0.15 * Math.abs(Math.sin(laughClock * 5)), now, 0.03)
      // The clock: a slightly sticky tick, every second; racing with the time-lapse; loud in the hush.
      const L = lapse(p)
      tickClock -= dt * (1 + L * 14)
      if (tickClock <= 0) {
        tickSide = 1 - tickSide
        tickClock = tickSide ? 0.96 + Math.random() * 0.03 : 1.03 + Math.random() * 0.05
        const loud = p >= SEG.hush.start && p < SEG.smooth.start ? 2.4 : p >= at('lift', 0.62) && p < at('reveal', 0.1) ? 2 : p >= at('flight', 0.44) && p < SEG.summon.end ? 1.6 : 1
        tone(ctx, clockSpot.gain, { freq: tickSide ? 2100 : 1850, env: { attack: 0.001, decay: 0.025, peak: 0.035 * loud * (L > 0.5 ? 0.7 : 1) } })
        burst(ctx, noise.white, clockSpot.gain, { freq: 5000, q: 3, env: { attack: 0.001, decay: 0.012, peak: 0.02 * loud } })
      }
      // Chalk on the board while the hand writes (and the reader scrolls).
      const speed = Math.abs(p - lastP) / Math.max(1e-3, dt)
      const writing = WRITING.some(([a, b]) => p >= a && p < b)
      chalkClock -= dt
      if (writing && speed > 0.0004 && !jumped && chalkClock <= 0) {
        chalkClock = 0.06 + Math.random() * 0.1
        chalkScratch(0.03 + Math.random() * 0.03)
        if (Math.random() < 0.15) burst(ctx, noise.white, boardSpot.gain, { freq: 1400, q: 5, env: { attack: 0.001, decay: 0.015, peak: 0.08 } })
      }
      // The yard: now and then a whistle, a ball.
      yardClock -= dt
      if (yardClock <= 0) {
        yardClock = 5 + Math.random() * 9
        const y = evalNumber(MIX.yard, p)
        if (y > 0.05) {
          if (Math.random() < 0.4) tone(ctx, yardSpot.gain, { freq: 2900, to: 2700, glide: 0.3, env: { attack: 0.01, decay: 0.35, peak: 0.25 } })
          else for (let i = 0; i < 3; i++) setTimeout(() => burst(ctx, noise.brown, yardSpot.gain, { freq: 300, type: 'lowpass', env: { attack: 0.002, decay: 0.08, peak: 0.6 - i * 0.15 } }), i * (420 - i * 90))
        }
      }
      // His steps on the linoleum.
      if (motion.step !== lastStep && motion.walking > 0.3 && !jumped) step(boardSpot.gain, 0.14, motion.step % 2 ? 0.1 : -0.1)
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
