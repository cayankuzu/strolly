/**
 * EŞİK's sound: a city at night that does not notice anyone — far traffic,
 * cars passing close, a hum from the shop window, every phone chiming at
 * once. Inside the cafe: a low room and a cup. Behind the door: almost
 * nothing, and when the view turns, nothing at all.
 *
 * Positional: the shop, the cafe's panes (each city has its own air), the
 * terminal, the door's other side.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG } from './timeline'

type LayerId = 'city' | 'shop' | 'cafe' | 'dayCity' | 'ruinCity' | 'room' | 'music'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  city: [k(at('open', 0.3), 0), k(at('walk', 0.2), 0.45), k(at('enter', 0.7), 0.4), k(at('enter', 1), 0.1), k(at('outside'), 0.1), k(at('outside', 0.4), 0.4), k(at('shift', 1), 0.3), k(at('voice'), 0.08), k(at('opens', 0.5), 0)],
  shop: [k(at('shop'), 0), k(at('shop', 0.6), 0.4), k(at('corner', 0.6), 0)],
  cafe: [k(at('enter', 0.6), 0), k(at('enter', 1), 0.35), k(at('user', 1), 0.35), k(at('outside', 0.4), 0)],
  dayCity: [k(at('glass'), 0), k(at('glass', 0.7), 0.4), k(at('versions', 0.5), 0.4), k(at('versions', 0.7), 0.1), k(at('nothing', 1), 0)],
  ruinCity: [k(at('versions', 0.4), 0), k(at('versions', 0.75), 0.4), k(at('observe', 1), 0.3), k(at('nothing', 1), 0)],
  room: [k(at('opens', 0.4), 0), k(at('list'), 0.25), k(at('watching', 1), 0.25), k(at('turn', 0.3), 0)],
  music: [k(at('open', 0.2), 0), k(at('open', 0.8), 0.2), k(at('phones', 1), 0.15), k(at('reflect'), 0.3), k(at('same', 1), 0.15), k(at('talk'), 0.1), k(at('versions'), 0.3), k(at('nothing'), 0.05), k(at('shift'), 0.3), k(at('voice'), 0.1), k(at('watching'), 0.3), k(at('turn', 0.2), 0), k(at('end', 0.2), 0), k(at('end', 0.6), 0.3), k(at('end', 1), 0)],
}

const NOTES = [164.81, 196, 246.94, 293.66, 329.63, 392]

export function createEsikAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  const city = (layers.city = kit.layer(0.25))
  const cF = filter(ctx, 'lowpass', 420)
  kit.loop(noise.brown, cF, 0.6)
  cF.connect(city)
  const far = filter(ctx, 'bandpass', 900, 0.3)
  kit.loop(noise.pink, far, 0.5)
  const farG = ctx.createGain()
  farG.gain.value = 0.25
  far.connect(farG).connect(city)

  const shop = kit.spatial(8.5, 2.2, -14, { ref: 2 })
  layers.shop = shop.gain
  kit.osc('sine', 120, shop.gain, 0.05)
  kit.osc('sine', 240.5, shop.gain, 0.02)

  const cafe = (layers.cafe = kit.layer(0.15))
  const kF = filter(ctx, 'bandpass', 600, 0.6)
  kit.loop(noise.pink, kF, 1)
  kF.connect(cafe)

  // Each pane breathes its own city's air.
  const day = kit.spatial(-16, 1.6, -29.5, { ref: 1.5, send: 0.2 })
  layers.dayCity = day.gain
  const dF = filter(ctx, 'bandpass', 2600, 0.8)
  kit.loop(noise.pink, dF, 1.2)
  dF.connect(day.gain)
  const ruin = kit.spatial(-16, 1.6, -33.5, { ref: 1.5, send: 0.4 })
  layers.ruinCity = ruin.gain
  const rF = filter(ctx, 'lowpass', 160)
  kit.loop(noise.brown, rF, 0.4)
  rF.connect(ruin.gain)
  kit.osc('sine', 55, ruin.gain, 0.05)

  const room = (layers.room = kit.layer(0.4))
  kit.osc('sine', 98, room, 0.03)
  kit.osc('sine', 98.6, room, 0.03)

  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.8
  const fb = ctx.createGain()
  fb.gain.value = 0.45
  const dLp = filter(ctx, 'lowpass', 1300)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)

  const terminal = kit.spatial(-8.5, 1.15, -35.3, { ref: 1, category: 'sfx' })
  terminal.gain.gain.value = 1
  const voiceSpot = kit.spatial(0, 1.5, -61, { ref: 1.5, category: 'sfx' })
  voiceSpot.gain.gain.value = 1

  let lastP = -1
  let lastStep = 0
  let carClock = 3
  let note = 0

  const crossings = (from: number, to: number) => {
    const crossed = (t: number) => from < t && to >= t
    // Every phone, at the same moment.
    if (crossed(at('phones', 0.4)))
      for (let i = 0; i < 9; i++) tone(ctx, fx, { freq: 1567.98, env: { attack: 0.002, decay: 0.18, peak: 0.012 }, pan: Math.random() * 1.8 - 0.9, delay: Math.random() * 0.03 })
    if (crossed(at('enter', 0.2))) {
      tone(ctx, fx, { freq: 2349, env: { attack: 0.002, decay: 0.7, peak: 0.02 } })
      tone(ctx, fx, { freq: 2793, env: { attack: 0.002, decay: 0.6, peak: 0.015 }, delay: 0.08 })
    }
    for (const f of [0.08, 0.33, 0.58, 0.83]) if (crossed(at('words', f))) for (let i = 0; i < 6; i++) burst(ctx, noise.white, terminal.gain, { freq: 3000, q: 3, env: { attack: 0.001, decay: 0.02, peak: 0.02 } }) // keys
    if (crossed(at('voice', 0.04))) burst(ctx, noise.pink, voiceSpot.gain, { freq: 700, q: 0.8, env: { attack: 0.3, decay: 1.2, peak: 0.04 } })
    if (crossed(at('opens', 0.35))) tone(ctx, fx, { freq: 260, to: 180, glide: 1.1, type: 'triangle', env: { attack: 0.05, decay: 1.1, peak: 0.025 } })
    if (crossed(at('list', 0.45))) tone(ctx, fx, { freq: 880, env: { attack: 0.005, decay: 1.4, peak: 0.02 } })
    if (crossed(at('end', 0.2))) tone(ctx, keys, { freq: 164.81, env: { attack: 0.01, decay: 5, peak: 0.05 } })
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)
      // Cars pass close now and then.
      const street = p < SEG.door.start && (p < SEG.enter.end || p >= SEG.outside.start)
      if (street) {
        carClock -= dt
        if (carClock <= 0) {
          carClock = 4 + Math.random() * 6
          burst(ctx, noise.pink, fx, { freq: 300, q: 0.5, env: { attack: 1.0, decay: 1.6, peak: 0.07 }, pan: Math.random() < 0.5 ? -0.7 : 0.7 })
        }
      }
      if (evalNumber(MIX.music, p) > 0.1 && Math.random() < dt / 4) {
        note = (note + 1 + Math.floor(Math.random() * 3)) % NOTES.length
        tone(ctx, keys, { freq: NOTES[note], env: { attack: 0.008, decay: 3, peak: 0.03 }, pan: Math.random() * 0.6 - 0.3 })
      }
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped) burst(ctx, noise.brown, fx, { freq: 260, type: 'lowpass', env: { attack: 0.004, decay: 0.08, peak: 0.1 }, pan: motion.step % 2 ? 0.1 : -0.1 })
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
