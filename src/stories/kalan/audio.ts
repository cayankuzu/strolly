/**
 * KALAN's sound: a quiet apartment at night — the fridge, a radiator's tick,
 * the city far off — and the tape: hiss, the click of the transport, a clock
 * ticking in a room that has no clock. Morning brings birds. At the end the
 * recorder speaks from the floor, wherever the reader is looking.
 *
 * Positional: the fridge, the recorder (it moves), the front door, the new door.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG } from './timeline'

type LayerId = 'room' | 'fridge' | 'tape' | 'birds' | 'other' | 'music'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  room: [k(at('night', 0.1), 0), k(at('night', 0.5), 0.35), k(at('facing', 0.2), 0.35), k(at('behind', 0.6), 0.12), k(at('end', 0.5), 0)],
  fridge: [k(at('night', 0.2), 0), k(at('night', 0.6), 0.3), k(at('died'), 0.3), k(at('died', 0.2), 0), k(at('ask'), 0.25), k(at('behind', 0.5), 0)],
  tape: [k(at('play'), 0), k(at('play', 0.08), 0.5), k(at('voice', 1), 0.5), k(at('knock', 0.1), 0.1), k(at('gone', 1), 0.1), k(at('sleep', 0.3), 0), k(at('tape'), 0), k(at('tape', 0.1), 0.5), k(at('other', 1), 0.5), k(at('rooms', 0.2), 0), k(at('ask'), 0.4), k(at('ask', 1), 0.4), k(at('remain', 0.2), 0), k(at('approach'), 0.35), k(at('approach', 1), 0.35), k(at('opens', 0.3), 0), k(at('recording'), 0), k(at('recording', 0.06), 0.55), k(at('end', 0.6), 0)],
  birds: [k(at('morning'), 0), k(at('morning', 0.2), 0.4), k(at('details', 1), 0.3), k(at('notice', 0.5), 0)],
  other: [k(at('opens', 0.3), 0), k(at('opens', 0.8), 0.35), k(at('facing', 1), 0.35), k(at('behind', 0.4), 0)],
  music: [k(at('open', 0.2), 0), k(at('open', 0.8), 0.25), k(at('night', 1), 0.1), k(at('photo'), 0.2), k(at('back', 1), 0.3), k(at('married'), 0.25), k(at('died', 1), 0.35), k(at('remain'), 0.4), k(at('sign', 1), 0.2), k(at('behind'), 0.05), k(at('end', 0.2), 0.3), k(at('end', 1), 0)],
}

/** A minor key that keeps changing which note is home. */
const NOTES = [220, 261.63, 293.66, 329.63, 349.23, 392, 440]

export function createKalanAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  const room = (layers.room = kit.layer(0.1))
  const rF = filter(ctx, 'lowpass', 300)
  kit.loop(noise.brown, rF, 0.6)
  rF.connect(room)

  const fridge = kit.spatial(-3.62, 1.0, -3.15, { ref: 1.5 })
  layers.fridge = fridge.gain
  const fF = filter(ctx, 'lowpass', 260)
  fF.connect(fridge.gain)
  kit.osc('sawtooth', 50, fF, 0.06)

  // The tape: hiss and transport hum, from wherever the recorder is.
  const tapeSpot = kit.spatial(-0.35, 0.8, -0.35, { ref: 1.2, send: 0.15 })
  layers.tape = tapeSpot.gain
  const hiss = filter(ctx, 'highpass', 3000)
  kit.loop(noise.white, hiss, 1)
  const hissG = ctx.createGain()
  hissG.gain.value = 0.08
  hiss.connect(hissG).connect(tapeSpot.gain)
  kit.osc('sine', 60, tapeSpot.gain, 0.03)

  const birds = (layers.birds = kit.spatial(-1.5, 2, 5, { ref: 3, send: 0.2 }).gain)
  const other = (layers.other = kit.spatial(0.2, 1.2, -6.6, { ref: 2, send: 0.3 }).gain)
  const oF = filter(ctx, 'bandpass', 500, 0.6)
  kit.loop(noise.pink, oF, 0.9)
  oF.connect(other)

  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.55
  const fb = ctx.createGain()
  fb.gain.value = 0.42
  const dLp = filter(ctx, 'lowpass', 1500)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)

  const door = kit.spatial(4, 1.2, 0.8, { ref: 1.5, category: 'sfx' })
  door.gain.gain.value = 1

  let lastP = -1
  let lastStep = 0
  let tick = 0
  let birdClock = 1
  let note = 0

  const crossings = (from: number, to: number) => {
    const crossed = (t: number) => from < t && to >= t
    const click = (peak = 0.06) => burst(ctx, noise.white, tapeSpot.gain, { freq: 2200, q: 2, env: { attack: 0.001, decay: 0.04, peak } })
    if (crossed(at('play', 0.05)) || crossed(at('tape', 0.08)) || crossed(at('recording', 0.04))) click(0.1)
    // Three knocks on the front door.
    if (crossed(at('knock', 0.15)))
      for (let i = 0; i < 3; i++) {
        tone(ctx, door.gain, { freq: 90, env: { attack: 0.002, decay: 0.12, peak: 0.08 }, delay: i * 0.32 })
        tone(ctx, door.gain, { freq: 180, env: { attack: 0.002, decay: 0.06, peak: 0.04 }, delay: i * 0.32 })
      }
    if (crossed(at('gone', 0.12)))
      for (let i = 0; i < 8; i++) tone(ctx, door.gain, { freq: 120 - i * 4, env: { attack: 0.003, decay: 0.08, peak: 0.05 - i * 0.005 }, delay: i * 0.42 })
    if (crossed(at('opens', 0.4))) tone(ctx, fx, { freq: 300, to: 220, glide: 0.9, type: 'triangle', env: { attack: 0.05, decay: 0.9, peak: 0.02 } })
    if (crossed(at('end', 0.15))) tone(ctx, keys, { freq: 220, env: { attack: 0.01, decay: 4, peak: 0.05 } })
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)
      // The tape follows the recorder: on the table, then on the floor.
      const onFloor = p >= SEG.recording.start
      tapeSpot.place(onFloor ? 0.4 : -0.35, onFloor ? 0.05 : 0.8, onFloor ? -1.2 : -0.35)
      // A clock that is not in the room ticks on the tape.
      if (evalNumber(MIX.tape, p) > 0.2) {
        tick -= dt
        if (tick <= 0) {
          tick = 1
          tone(ctx, tapeSpot.gain, { freq: 2600, env: { attack: 0.001, decay: 0.025, peak: 0.012 } })
        }
      }
      if (evalNumber(MIX.birds, p) > 0.05) {
        birdClock -= dt
        if (birdClock <= 0) {
          birdClock = 1.5 + Math.random() * 3
          const base = 2400 + Math.random() * 1200
          for (let i = 0; i < 3; i++) tone(ctx, birds, { freq: base, to: base * 1.3, glide: 0.06, env: { attack: 0.01, decay: 0.08, peak: 0.03 }, delay: i * 0.12 })
        }
      }
      if (evalNumber(MIX.music, p) > 0.12 && Math.random() < dt / 3.6) {
        note = (note + 2 + Math.floor(Math.random() * 3)) % NOTES.length
        tone(ctx, keys, { freq: NOTES[note], env: { attack: 0.006, decay: 2.8, peak: 0.032 }, pan: Math.random() * 0.6 - 0.3 })
      }
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped) burst(ctx, noise.brown, fx, { freq: 240, type: 'lowpass', env: { attack: 0.005, decay: 0.09, peak: 0.12 }, pan: motion.step % 2 ? 0.1 : -0.1 })
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
