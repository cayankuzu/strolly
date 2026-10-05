/**
 * YAŞAMAK's sound: an internet cafe at night — keys clicking from every
 * desk, a low murmur, the street through the window, and a wall clock behind
 * Arif that ticks faster than his minutes go. Near the event horizon the room
 * thins into one deep tone. At 00:00 the screen's hum stops, and then nothing.
 *
 * Positional: keyboards at the desks, the clock on the wall behind, the
 * street at the window, the horizon ahead.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG } from './timeline'

type LayerId = 'room' | 'street' | 'murmur' | 'horizon' | 'music'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  room: [k(at('door', 0.2), 0), k(at('door', 0.6), 0.4), k(at('dilation', 0.2), 0.4), k(at('slow', 1), 0.1), k(at('zero', 0.34), 0.08), k(at('zero', 0.36), 0)],
  street: [k(at('open', 0.5), 0), k(at('door', 0.4), 0.3), k(at('seat', 0.5), 0.18), k(at('depart', 0.4), 0.18), k(at('horizon', 0.3), 0)],
  murmur: [
    k(at('door', 0.4), 0),
    k(at('seat'), 0.22),
    k(at('leave'), 0.28),
    k(at('life', 0.2), 0.36),
    k(at('life', 1), 0.28),
    k(at('gone', 0.3), 0.06),
    k(at('after', 1), 0.06),
    k(at('endless'), 0.24),
    k(at('closing', 0.4), 0.24),
    k(at('lastTea', 0.6), 0.1),
    k(at('dilation', 0.5), 0.05),
    k(at('dilation', 1), 0),
  ],
  horizon: [k(at('depart', 0.3), 0), k(at('horizon', 0.4), 0.5), k(at('slow', 1), 0.4), k(at('zero', 0.34), 0.15), k(at('behind', 0.4), 0), k(at('last'), 0)],
  music: [k(at('open', 0.2), 0), k(at('open', 0.8), 0.25), k(at('seat', 1), 0.15), k(at('mother'), 0.2), k(at('gone', 0.5), 0.4), k(at('meaning', 1), 0.15), k(at('owner'), 0.25), k(at('answer', 1), 0.35), k(at('slow', 1), 0.15), k(at('zero', 0.34), 0), k(at('last', 0.1), 0), k(at('last', 0.5), 0.35), k(at('last', 1), 0)],
}

const NOTES = [261.63, 329.63, 392.0, 440.0, 523.25, 587.33]
const DESKS: Array<[number, number]> = [
  [-3.75, -0.3],
  [-2.25, -0.3],
  [2.25, -0.3],
  [-3, -2.5],
  [0, -2.5],
  [3, -2.5],
]

export function createYasamakAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  const room = (layers.room = kit.layer(0.1))
  const rF = filter(ctx, 'lowpass', 220)
  kit.loop(noise.brown, rF, 0.7)
  rF.connect(room)
  kit.osc('sine', 120, room, 0.012)

  const street = kit.spatial(0, 1.5, -6.5, { send: 0.15, ref: 3 })
  layers.street = street.gain
  const sF = filter(ctx, 'bandpass', 380, 0.5)
  kit.loop(noise.pink, sF, 0.6)
  sF.connect(street.gain)

  const murmur = (layers.murmur = kit.layer(0.2))
  const mF = filter(ctx, 'bandpass', 520, 0.8)
  kit.loop(noise.pink, mF, 1.1)
  const mG = ctx.createGain()
  mG.gain.value = 0.7
  kit.lfo(mG.gain, 0.4, 0.25)
  mF.connect(mG).connect(murmur)

  const horizon = kit.spatial(0, 6, -80, { ref: 60, send: 0.5 })
  layers.horizon = horizon.gain
  const hF = filter(ctx, 'lowpass', 120)
  hF.connect(horizon.gain)
  kit.osc('sine', 36.7, hF, 0.4)
  kit.osc('sine', 37.4, hF, 0.4)
  kit.loop(noise.brown, hF, 0.5)

  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.7
  const fb = ctx.createGain()
  fb.gain.value = 0.35
  const dLp = filter(ctx, 'lowpass', 1600)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)

  // The wall clock and the keyboards, each where it is.
  const clock = kit.spatial(0, 2.3, 4.93, { ref: 1.5, category: 'sfx' })
  clock.gain.gain.value = 1
  const desks = DESKS.map(([x, z]) => {
    const s = kit.spatial(x, 0.8, z, { ref: 1.2, category: 'sfx' })
    s.gain.gain.value = 1
    return s.gain
  })
  const bell = kit.spatial(3.5, 2.2, 5, { ref: 2, category: 'sfx' })
  bell.gain.gain.value = 1

  let lastP = -1
  let lastStep = 0
  let tick = 0
  let typing = 1
  let note = 3

  const crossings = (from: number, to: number, flags: ReadonlySet<string>) => {
    const crossed = (t: number) => from < t && to >= t
    if (crossed(at('door', 0.3)) || crossed(at('returns', 0.4))) {
      tone(ctx, bell.gain, { freq: 2093, env: { attack: 0.002, decay: 0.9, peak: 0.03 } })
      tone(ctx, bell.gain, { freq: 2637, env: { attack: 0.002, decay: 0.8, peak: 0.02 }, delay: 0.09 })
    }
    if (crossed(at('start', 0.05))) tone(ctx, fx, { freq: 880, to: 1320, glide: 0.2, env: { attack: 0.005, decay: 0.3, peak: 0.03 } })
    if (crossed(at('leave', 0.4))) burst(ctx, noise.brown, fx, { freq: 300, type: 'lowpass', env: { attack: 0.01, decay: 0.3, peak: 0.12 } })
    if (crossed(at('one', 0.45))) tone(ctx, fx, { freq: 660, env: { attack: 0.002, decay: 0.3, peak: 0.025 } })
    // Tea set down on its saucer; a spoon against the glass.
    for (const [seg, t] of [
      ['tea', 0.55],
      ['lastTea', 0.55],
    ] as const)
      if (crossed(at(seg, t))) {
        tone(ctx, fx, { freq: 2900, env: { attack: 0.001, decay: 0.18, peak: 0.025 } })
        tone(ctx, fx, { freq: 4100, env: { attack: 0.001, decay: 0.1, peak: 0.012 }, delay: 0.32 })
      }
    // The short chair leg.
    if (crossed(at('tea', 0.7))) burst(ctx, noise.brown, fx, { freq: 380, type: 'lowpass', env: { attack: 0.002, decay: 0.08, peak: 0.1 } })
    if (crossed(at('phone', 0.08))) tone(ctx, fx, { freq: 1500, env: { attack: 0.001, decay: 0.05, peak: 0.02 } })
    // The call left for tomorrow: ringing, ringing.
    if (flags.has('mom:later')) for (const t of [0.3, 0.48, 0.66, 0.84]) if (crossed(at('after', t))) tone(ctx, fx, { freq: 425, env: { attack: 0.02, decay: 0.9, peak: 0.016 } })
    if (crossed(at('closing', 0.06))) tone(ctx, fx, { freq: 523.25, to: 392, glide: 0.25, env: { attack: 0.01, decay: 0.6, peak: 0.02 } })
    if (crossed(at('zero', 0.32))) {
      tone(ctx, fx, { freq: 440, to: 110, glide: 0.6, env: { attack: 0.005, decay: 0.7, peak: 0.04 } })
      burst(ctx, noise.white, fx, { freq: 6000, q: 0.7, env: { attack: 0.001, decay: 0.15, peak: 0.03 } })
    }
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)

      // The wall clock: faster than the screen, and it does not stop for the horizon.
      const live = p >= SEG.start.start && p < at('zero', 0.34)
      if (live) {
        tick -= dt
        if (tick <= 0) {
          tick = 0.42
          tone(ctx, clock.gain, { freq: 3200, env: { attack: 0.001, decay: 0.02, peak: 0.01 } })
        }
      }
      // Keys from the desks around (thinning as people go).
      const busy = p >= SEG.seat.start && p < SEG.dilation.start + SEG.dilation.len * 0.6
      if (busy) {
        typing -= dt
        if (typing <= 0) {
          typing = 0.06 + Math.random() * 0.22
          const d = desks[Math.floor(Math.random() * desks.length)]
          burst(ctx, noise.white, d, { freq: 2600 + Math.random() * 1600, q: 3, env: { attack: 0.001, decay: 0.02, peak: 0.014 } })
        }
      }
      // A slow, sparse piano.
      if (evalNumber(MIX.music, p) > 0.1 && Math.random() < dt / 3.2) {
        note = (note + (Math.random() < 0.5 ? 1 : NOTES.length - 1)) % NOTES.length
        tone(ctx, keys, { freq: NOTES[note], env: { attack: 0.006, decay: 2.6, peak: 0.035 }, pan: Math.random() * 0.6 - 0.3 })
      }
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped) burst(ctx, noise.brown, fx, { freq: 220, type: 'lowpass', env: { attack: 0.004, decay: 0.1, peak: 0.12 }, pan: motion.step % 2 ? 0.1 : -0.1 })
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p, frame.flags)
      lastP = p
    },
  }
}
