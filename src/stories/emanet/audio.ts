/**
 * EMANET's sound: a lived-in apartment — room tone, the fridge, a kettle,
 * the city through the window — and a few piano notes that never resolve.
 * At 14:18 the house goes quiet in layers, the way it comes apart; in the
 * truth there is almost nothing left but breath and one held tone.
 *
 * Layer levels are functions of progress; one-shots fire only on forward,
 * un-jumped crossings (scrolling back never replays a clink).
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG } from './timeline'

type LayerId = 'room' | 'fridge' | 'city' | 'kettle' | 'reader' | 'music' | 'hush'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  room: [k(at('insert', 0.5), 0), k(at('form', 0.6), 0.5), k(at('approach', 0.4), 0.5), k(at('dissolve', 0.5), 0.08), k(at('hush', 0.3), 0), k(at('hush', 0.6), 0.22), k(at('closer', 0.8), 0.16), k(at('minute', 0.25), 0.42), k(at('complete', 0.5), 0.3), k(at('end', 0.4), 0)],
  fridge: [k(at('form', 0.3), 0), k(at('form', 0.7), 0.4), k(at('approach', 0.5), 0.4), k(at('dissolve', 0.3), 0), k(at('hush', 0.6), 0), k(at('system'), 0.18), k(at('end', 0.3), 0)],
  city: [
    k(at('form', 0.6), 0),
    k(at('form', 0.95), 0.12),
    k(at('curtain', 0.3), 0.12),
    k(at('curtain', 0.8), 0.32),
    k(at('noon', 0.9), 0.36),
    k(at('noon', 0.98), 0.16),
    k(at('approach', 0.5), 0.16),
    k(at('approach', 1), 0),
    k(at('minute', 0.2), 0),
    k(at('minute', 0.45), 0.16),
    k(at('complete', 0.6), 0.1),
    k(at('end'), 0),
  ],
  kettle: [k(at('form', 0.9), 0), k(at('enter', 0.1), 0.35), k(at('enter', 0.4), 0.35), k(at('enter', 0.5), 0)],
  reader: [k(at('insert', 0.55), 0), k(at('insert', 0.62), 0.5), k(at('form', 0.6), 0.5), k(at('form', 1), 0), k(at('end'), 0), k(at('end', 0.5), 0.12), k(at('end', 1), 0)],
  music: [
    k(at('open', 0.1), 0),
    k(at('open', 0.6), 0.35),
    k(at('logo', 1), 0.3),
    k(at('insert', 0.6), 0.12),
    k(at('form', 0.8), 0.3),
    k(at('cup', 1), 0.3),
    k(at('slippers'), 0.18),
    k(at('photo'), 0.25),
    k(at('photo', 1), 0.45),
    k(at('noon', 0.1), 0.15),
    k(at('clock', 0.4), 0.18),
    k(at('clock', 0.5), 0),
    k(at('loop', 0.2), 0.28),
    k(at('approach', 0.4), 0.12),
    k(at('approach', 0.55), 0),
    k(at('hush', 0.9), 0),
    k(at('document', 0.6), 0.22),
    k(at('closer', 0.9), 0.5),
    k(at('minute', 0.3), 0.18),
    k(at('stay', 0.2), 0.45),
    k(at('end', 0.7), 0.35),
    k(at('end', 1), 0),
  ],
  hush: [k(at('approach', 0.5), 0), k(at('dissolve', 0.4), 0.35), k(at('dissolve', 1), 0.22), k(at('hush', 0.6), 0.12), k(at('system', 0.5), 0.18), k(at('end', 0.5), 0)],
}

/** D minor without ever arriving: add9s and suspensions. */
const NOTES = [293.66, 349.23, 440.0, 523.25, 587.33, 659.25, 392.0, 329.63]

export function createEmanetAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const layers = {} as Record<LayerId, GainNode>

  // Room tone: a warm, low air
  const room = (layers.room = kit.layer(0.1))
  const roomLp = filter(ctx, 'lowpass', 380)
  kit.loop(noise.brown, roomLp, 0.8)
  roomLp.connect(room)
  // The fridge: a hum with a slow wobble
  // Sounds keep their places in the apartment: turn around and they are behind you.
  const fridge = (layers.fridge = kit.spatial(-4.1, 1.0, -2.86, { ref: 1.6 }).gain)
  const fLp = filter(ctx, 'lowpass', 300)
  fLp.connect(fridge)
  const hum = kit.osc('sawtooth', 50, fLp, 0.08)
  kit.lfo(hum.g.gain, 0.13, 0.02)
  kit.osc('sine', 100, fridge, 0.03)
  // The city through the window: distant traffic, now and then a passing car
  const city = (layers.city = kit.spatial(5.6, 1.5, -0.4, { send: 0.2, ref: 3 }).gain)
  const cityF = filter(ctx, 'bandpass', 420, 0.4)
  kit.loop(noise.pink, cityF, 0.7)
  const swell = ctx.createGain()
  swell.gain.value = 0.7
  kit.lfo(swell.gain, 0.05, 0.3)
  cityF.connect(swell).connect(city)
  // The kettle, just before it whistles
  const kettle = (layers.kettle = kit.spatial(-3.1, 1.0, -2.82, { send: 0.15, ref: 1.6 }).gain)
  const kF = filter(ctx, 'bandpass', 1900, 3)
  kit.loop(noise.white, kF, 0.9)
  const kG = ctx.createGain()
  kG.gain.value = 0.5
  kit.lfo(kG.gain, 3.1, 0.25)
  kF.connect(kG).connect(kettle)
  // The reader: a soft, almost-musical whir
  const reader = (layers.reader = kit.spatial(-1.42, 0.9, 3.0, { send: 0.4, ref: 1.2 }).gain)
  const rLp = filter(ctx, 'lowpass', 1200)
  rLp.connect(reader)
  kit.osc('sine', 587.33, rLp, 0.04)
  const shimmer = kit.osc('triangle', 880, rLp, 0.01)
  kit.lfo(shimmer.g.gain, 0.6, 0.008)
  // Music: piano-like notes through a long, soft echo
  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.62
  const feedback = ctx.createGain()
  feedback.gain.value = 0.38
  const dLp = filter(ctx, 'lowpass', 1800)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(feedback).connect(delay)
  dLp.connect(music)
  // A low pad under the piano
  const padLp = filter(ctx, 'lowpass', 500, 0.4)
  padLp.connect(music)
  for (const [f, g] of [
    [73.42, 0.07],
    [110.0, 0.05],
    [146.83, 0.03],
  ] as const) {
    const v = kit.osc('sine', f, padLp, g)
    kit.lfo(v.g.gain, 0.04 + f * 0.0003, g * 0.5)
  }
  // Hush: one held, close-beating tone and breath
  const hush = (layers.hush = kit.layer(0.5))
  const hLp = filter(ctx, 'lowpass', 600)
  hLp.connect(hush)
  kit.osc('sine', 220, hLp, 0.06)
  kit.osc('sine', 221.3, hLp, 0.06)
  const breath = ctx.createGain()
  breath.gain.value = 0
  const bF = filter(ctx, 'bandpass', 900, 0.7)
  kit.loop(noise.pink, bF, 0.6)
  bF.connect(breath).connect(hush)

  const fx = kit.fx
  let lastP = -1
  let lastStep = 0
  let pianoClock = 1.5
  let carClock = 6
  let breathT = 0

  const piano = (freq: number, peak = 0.05) => {
    tone(ctx, keys, { freq, env: { attack: 0.006, decay: 2.8, peak }, pan: Math.random() * 0.6 - 0.3 })
    tone(ctx, keys, { freq: freq * 2, type: 'triangle', env: { attack: 0.004, decay: 1.1, peak: peak * 0.18 } })
  }
  const clink = (peak = 0.03) => {
    tone(ctx, fx, { freq: 2480, env: { attack: 0.001, decay: 0.22, peak } })
    tone(ctx, fx, { freq: 3720, env: { attack: 0.001, decay: 0.15, peak: peak * 0.6 } })
    burst(ctx, noise.brown, fx, { freq: 300, type: 'lowpass', env: { attack: 0.002, decay: 0.05, peak: peak * 3 } })
  }
  const latch = (peak = 0.08) => {
    burst(ctx, noise.white, fx, { freq: 2600, q: 2.5, env: { attack: 0.001, decay: 0.03, peak } })
    burst(ctx, noise.brown, fx, { freq: 220, type: 'lowpass', env: { attack: 0.002, decay: 0.07, peak: peak * 2 } })
  }
  const fabric = (len = 1.2, peak = 0.05) => burst(ctx, noise.pink, fx, { freq: 2400, q: 0.5, env: { attack: len * 0.4, decay: len * 0.6, peak } })
  const jingle = () => {
    for (let i = 0; i < 5; i++) tone(ctx, fx, { freq: 3200 + Math.random() * 2400, env: { attack: 0.001, decay: 0.12, peak: 0.012 }, delay: i * 0.035 + Math.random() * 0.02 })
  }

  const crossings = (from: number, to: number) => {
    const crossed = (t: number) => from < t && to >= t
    // The capsule seats, the reader wakes.
    if (crossed(at('insert', 0.6))) {
      latch(0.1)
      tone(ctx, fx, { freq: 587.33, to: 880, glide: 1.2, env: { attack: 0.3, decay: 1.4, peak: 0.03 } })
    }
    if (crossed(at('form', 0.05))) burst(ctx, noise.pink, fx, { freq: 1400, q: 0.5, env: { attack: 1.2, decay: 1.6, peak: 0.05 } })
    if (crossed(at('enter', 0.45))) clink(0.02)
    if (crossed(at('enter', 0.55))) piano(440, 0.035)
    if (crossed(at('cup', 0.5))) clink(0.035)
    if (crossed(at('curtain', 0.25))) fabric(1.6, 0.06)
    if (crossed(at('curtain', 0.5))) fabric(1.3, 0.04)
    if (crossed(at('doorCheck', 0.55)) || crossed(at('doorCheck', 0.73))) latch(0.07)
    if (crossed(at('doorCheck', 0.62)) || crossed(at('doorCheck', 0.8))) latch(0.04)
    if (crossed(at('keys', 0.57))) {
      jingle()
      clink(0.012)
    }
    if (crossed(at('drawer', 0.22))) burst(ctx, noise.brown, fx, { freq: 600, type: 'lowpass', env: { attack: 0.08, decay: 0.3, peak: 0.08 } })
    if (crossed(at('drawer', 0.68))) fabric(0.4, 0.02)
    if (crossed(at('noon', 0.94))) latch(0.06)
    // 14:17 → 14:19: the clock's tick, then nothing where a tick should be.
    if (crossed(at('clock', 0.3))) tone(ctx, fx, { freq: 1800, env: { attack: 0.001, decay: 0.04, peak: 0.02 } })
    if (crossed(at('clock', 0.62))) tone(ctx, fx, { freq: 1800, env: { attack: 0.001, decay: 0.04, peak: 0.02 } })
    if (crossed(at('loop', 0.05))) burst(ctx, noise.pink, fx, { freq: 700, q: 0.5, env: { attack: 0.8, decay: 1.4, peak: 0.08 } })
    if (crossed(at('approach', 0.5))) tone(ctx, fx, { freq: 1800, env: { attack: 0.001, decay: 0.05, peak: 0.03 } })
    if (crossed(at('approach', 0.56))) tone(ctx, fx, { freq: 587.33, to: 554.37, glide: 3, env: { attack: 0.05, decay: 3.5, peak: 0.035 } })
    if (crossed(at('dissolve', 0.05))) tone(ctx, fx, { freq: 2480, to: 1200, glide: 1.5, env: { attack: 0.01, decay: 1.6, peak: 0.02 } })
    if (crossed(at('hush', 0.35))) piano(293.66, 0.03)
    if (crossed(at('system', 0.3))) piano(220, 0.03)
    if (crossed(at('closer', 0.85))) piano(349.23, 0.04)
    if (crossed(at('end', 0.36))) piano(293.66, 0.045)
    // PARÇALAR: the day reopened; Ege's call ringing out, unanswered.
    if (crossed(at('rewind', 0.05))) burst(ctx, noise.pink, fx, { freq: 700, q: 0.5, env: { attack: 0.8, decay: 1.4, peak: 0.07 } })
    for (const t of [0.16, 0.27, 0.38, 0.49]) if (crossed(at('call', t))) tone(ctx, fx, { freq: 425, env: { attack: 0.02, decay: 1.1, peak: 0.022 } })
    if (crossed(at('call', 0.62))) piano(220, 0.03)
    // EMANET: the phone in her pocket, the clock reaching 14:18.
    if (crossed(at('minute', 0.34))) for (let i = 0; i < 2; i++) tone(ctx, fx, { freq: 150, type: 'sawtooth', env: { attack: 0.01, decay: 0.3, peak: 0.035 }, delay: i * 0.45 })
    if (crossed(at('stay', 0.12))) tone(ctx, fx, { freq: 1800, env: { attack: 0.001, decay: 0.05, peak: 0.03 } })
    if (crossed(at('stay', 0.2))) piano(293.66, 0.04)
    if (crossed(at('complete', 0.3))) {
      piano(349.23, 0.035)
      piano(440, 0.03)
    }
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      const set = (param: AudioParam, v: number, tc = 0.15) => param.setTargetAtTime(v, now, tc)

      const lv = {} as Record<LayerId, number>
      for (const id of Object.keys(MIX) as LayerId[]) lv[id] = evalNumber(MIX[id], p)
      // The rewind: the house's sound is pulled thin.
      if (p >= SEG.loop.start && p < SEG.loop.end) {
        lv.room *= 0.4
        lv.fridge *= 0.3
      }
      for (const id of Object.keys(lv) as LayerId[]) set(layers[id].gain, lv[id])

      // Breathing — hers — in the quiet before and after.
      breathT += dt
      const breathing = p >= at('approach', 0.6) && p < SEG.system.end ? 1 : 0
      set(breath.gain, breathing * (0.03 + 0.03 * Math.max(0, Math.sin(breathT * 1.6))), 0.3)

      // Slippers on wooden floors: soft, short.
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped && frame.set === 'apartment') {
        burst(ctx, noise.brown, fx, { freq: 260 + Math.random() * 60, type: 'lowpass', env: { attack: 0.006, decay: 0.09, peak: 0.12 }, pan: motion.step % 2 ? 0.1 : -0.1 })
        burst(ctx, noise.pink, fx, { freq: 3600, q: 1.2, env: { attack: 0.004, decay: 0.05, peak: 0.008 } })
        if (Math.random() < 0.15) burst(ctx, noise.white, fx, { freq: 1100, q: 6, env: { attack: 0.002, decay: 0.05, peak: 0.01 } })
      }
      lastStep = motion.step

      pianoClock -= dt
      if (pianoClock <= 0) {
        pianoClock = 3.2 + Math.random() * 3.8
        if (lv.music > 0.15) piano(NOTES[Math.floor(Math.random() * NOTES.length)], 0.03 + lv.music * 0.04)
      }
      carClock -= dt
      if (carClock <= 0) {
        carClock = 7 + Math.random() * 9
        if (lv.city > 0.1) burst(ctx, noise.pink, fx, { freq: 380, q: 0.6, env: { attack: 1.4, decay: 2.2, peak: 0.05 * lv.city }, pan: Math.random() * 1.6 - 0.8 })
      }

      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
