/**
 * ÖFKE NÖBETİ's sound: the street, a lobby with polite music and an
 * announcement chime, the booth's low hum and a meter that beeps higher as
 * the anger rises. Impacts are muffled, never sharp. After "termination",
 * silence; from the copy's chair, only the room and a faint ringing.
 *
 * Positional: the lobby speaker, the booth hum, the meter, the small screen.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG } from './timeline'

type LayerId = 'street' | 'hvac' | 'muzak' | 'booth' | 'ring'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  street: [
    k(at('open', 0.3), 0),
    k(at('street', 0.2), 0.5),
    k(at('street', 0.9), 0.5),
    k(at('lobby', 0.4), 0.06),
    k(at('rate', 1), 0.06),
    k(at('relief', 0.15), 0.5),
    k(at('relief', 1), 0.45),
    k(at('week'), 0.06),
    k(at('week', 0.2), 0.3),
    k(at('week', 0.7), 0.05),
    k(at('again'), 0),
    k(at('question', 1), 0),
    k(at('exit', 0.2), 0.5),
    k(at('exit', 1), 0.45),
    k(at('copyside'), 0),
  ],
  hvac: [k(at('street', 0.7), 0), k(at('lobby', 0.2), 0.4), k(at('prepare', 1), 0.4), k(at('enter', 0.3), 0.15), k(at('terminate', 0.3), 0.15), k(at('terminate', 0.5), 0), k(at('rate', 0.5), 0.12), k(at('swap'), 0.12), k(at('complete', 0.8), 0.04), k(at('end'), 0)],
  muzak: [k(at('lobby', 0.1), 0), k(at('lobby', 0.4), 0.35), k(at('prepare', 0.6), 0.35), k(at('enter', 0.4), 0.05), k(at('week'), 0.05), k(at('week', 0.4), 0.3), k(at('again', 0.3), 0.05), k(at('corridor', 0.8), 0.05), k(at('yet'), 0)],
  booth: [
    k(at('prepare', 0.6), 0),
    k(at('enter', 0.4), 0.45),
    k(at('terminate', 0.3), 0.6),
    k(at('terminate', 0.42), 0),
    k(at('again'), 0),
    k(at('again', 0.4), 0.4),
    k(at('complete', 0.6), 0.4),
    k(at('complete', 1), 0.15),
    k(at('question', 0.6), 0),
    k(at('copyside'), 0),
    k(at('copyside', 0.2), 0.32),
    k(at('copyside', 0.95), 0.32),
    k(at('end', 0.4), 0),
  ],
  ring: [k(at('terminate', 0.45), 0), k(at('terminate', 0.6), 0.04), k(at('rate', 1), 0.01), k(at('swap'), 0), k(at('swap', 0.5), 0.03), k(at('question', 0.6), 0.02), k(at('end', 0.5), 0)],
}

const MUZAK = [523.25, 659.25, 783.99, 698.46, 587.33, 659.25]

export function createOfkeAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const layers = {} as Record<LayerId, GainNode>
  const fx = kit.fx

  const street = (layers.street = kit.layer(0.2))
  const sF = filter(ctx, 'lowpass', 500)
  kit.loop(noise.pink, sF, 0.6)
  sF.connect(street)

  const hvac = (layers.hvac = kit.layer())
  const hF = filter(ctx, 'lowpass', 260)
  kit.loop(noise.brown, hF, 0.8)
  hF.connect(hvac)
  kit.osc('sine', 60, hvac, 0.02)

  // Polite music from a ceiling speaker in the lobby.
  const speaker = kit.spatial(0, 3.0, 2.0, { send: 0.25, ref: 4, category: 'music' })
  const muzak = (layers.muzak = speaker.gain)
  const mF = filter(ctx, 'lowpass', 2200)
  mF.connect(muzak)
  const voices = [0, 1, 2].map((i) => kit.osc('triangle', MUZAK[i], mF, 0.04))

  // The booth's hum; it lives in the booth.
  const boothSpot = kit.spatial(3, 2.8, -11.5, { ref: 2.2 })
  const booth = (layers.booth = boothSpot.gain)
  const bF = filter(ctx, 'lowpass', 180)
  bF.connect(booth)
  kit.osc('sawtooth', 49, bF, 0.07)
  kit.osc('sine', 98.5, booth, 0.02)

  const ring = (layers.ring = kit.layer())
  kit.osc('sine', 6200, ring, 0.6)

  const meterSpot = kit.spatial(4.47, 2.2, -11.5, { ref: 1.5, category: 'sfx' })
  meterSpot.gain.gain.value = 1
  const screenSpot = kit.spatial(3.7, 1.3, -10.08, { ref: 1, category: 'sfx' })
  screenSpot.gain.gain.value = 1

  let lastP = -1
  let lastStep = 0
  let chord = 0
  let chordClock = 2
  let meterClock = 0

  const thud = (peak: number) => {
    burst(ctx, noise.brown, fx, { freq: 160, type: 'lowpass', env: { attack: 0.004, decay: 0.35, peak } })
    tone(ctx, fx, { freq: 70, to: 42, glide: 0.3, env: { attack: 0.003, decay: 0.4, peak: peak * 0.5 } })
  }

  const crossings = (from: number, to: number) => {
    const crossed = (t: number) => from < t && to >= t
    if (crossed(at('street', 0.62)) || crossed(at('week', 0.05))) burst(ctx, noise.pink, fx, { freq: 1400, q: 0.5, env: { attack: 0.15, decay: 0.5, peak: 0.05 } })
    if (crossed(at('call', 0.06))) {
      tone(ctx, fx, { freq: 784, env: { attack: 0.01, decay: 0.7, peak: 0.04 } })
      tone(ctx, fx, { freq: 587.33, env: { attack: 0.01, decay: 0.9, peak: 0.04 }, delay: 0.32 })
    }
    if (crossed(at('pick', 0.43))) tone(ctx, fx, { freq: 1200, to: 1600, glide: 0.08, env: { attack: 0.002, decay: 0.15, peak: 0.03 } })
    if (crossed(at('enter', 0.42)) || crossed(at('oneway', 0.3))) {
      burst(ctx, noise.white, fx, { freq: 2400, q: 2, env: { attack: 0.001, decay: 0.05, peak: 0.07 } })
      thud(0.08)
    }
    if (crossed(at('rise', 0.6))) thud(0.32)
    if (crossed(at('throw', 0.64))) {
      thud(0.4)
      burst(ctx, noise.white, fx, { freq: 1800, q: 0.8, env: { attack: 0.002, decay: 0.25, peak: 0.08 } })
    }
    if (crossed(at('terminate', 0.28))) tone(ctx, meterSpot.gain, { freq: 880, env: { attack: 0.02, decay: 2.4, peak: 0.05 } })
    if (crossed(at('rate', 0.2))) tone(ctx, meterSpot.gain, { freq: 1318.5, env: { attack: 0.005, decay: 0.4, peak: 0.03 } })
    if (crossed(at('complete', 0.12))) {
      tone(ctx, meterSpot.gain, { freq: 659.25, env: { attack: 0.01, decay: 0.6, peak: 0.03 } })
      tone(ctx, meterSpot.gain, { freq: 987.77, env: { attack: 0.01, decay: 0.8, peak: 0.03 }, delay: 0.25 })
    }
    if (crossed(at('retained', 0.1))) tone(ctx, screenSpot.gain, { freq: 1567.98, env: { attack: 0.002, decay: 0.5, peak: 0.05 } })
    if (crossed(at('swap', 0.22))) burst(ctx, noise.pink, fx, { freq: 300, q: 0.5, env: { attack: 0.4, decay: 1.4, peak: 0.08 } })
    // The phone in the lobby: two short buzzes.
    if (crossed(at('reason', 0.05))) for (let i = 0; i < 2; i++) tone(ctx, fx, { freq: 150, type: 'sawtooth', env: { attack: 0.01, decay: 0.3, peak: 0.05 }, delay: i * 0.5 })
    // Out through the sliding doors.
    if (crossed(at('relief', 0.08)) || crossed(at('exit', 0.14))) burst(ctx, noise.pink, fx, { freq: 1400, q: 0.5, env: { attack: 0.15, decay: 0.5, peak: 0.05 } })
    // Three knocks before he speaks.
    for (const t of [0.06, 0.11, 0.16]) if (crossed(at('plead', t))) burst(ctx, noise.brown, boothSpot.gain, { freq: 380, type: 'lowpass', env: { attack: 0.002, decay: 0.12, peak: 0.25 } })
    if (crossed(at('leave', 0.3))) {
      burst(ctx, noise.white, fx, { freq: 2400, q: 2, env: { attack: 0.001, decay: 0.05, peak: 0.06 } })
      tone(ctx, meterSpot.gain, { freq: 523.25, to: 392, glide: 0.4, env: { attack: 0.01, decay: 0.7, peak: 0.03 } })
    }
    // The first session, heard from the chair it happened to.
    if (crossed(at('replay', 0.3))) thud(0.38)
    if (crossed(at('replay', 0.81))) {
      thud(0.45)
      burst(ctx, noise.white, fx, { freq: 1800, q: 0.8, env: { attack: 0.002, decay: 0.25, peak: 0.09 } })
    }
    if (crossed(at('exit', 0.66))) tone(ctx, fx, { freq: 1318.5, env: { attack: 0.005, decay: 0.35, peak: 0.025 } })
    if (crossed(at('copyside', 0.06))) tone(ctx, screenSpot.gain, { freq: 1318.5, env: { attack: 0.005, decay: 0.35, peak: 0.04 } })
    // A new notch: a short scrape on the wall.
    if (crossed(at('copyside', 0.78))) burst(ctx, noise.white, fx, { freq: 5200, q: 3, env: { attack: 0.03, decay: 0.22, peak: 0.04 }, pan: -0.4 })
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)

      // The muzak never quite resolves.
      chordClock -= dt
      if (chordClock <= 0) {
        chordClock = 4.5
        chord = (chord + 1) % MUZAK.length
        voices.forEach((v, i) => v.o.frequency.setTargetAtTime(MUZAK[(chord + i * 2) % MUZAK.length] / (i === 2 ? 2 : 1), now, 0.4))
      }
      // The meter beeps faster and higher with the anger.
      const replay = p >= SEG.replay.start && p < at('replay', 0.8)
      const rising = (p >= SEG.stare.start && p < at('terminate', 0.25)) || replay
      if (rising) {
        const level = replay ? Math.min(1, (p - SEG.replay.start) / (at('replay', 0.8) - SEG.replay.start)) : Math.min(1, (p - SEG.stare.start) / (at('terminate', 0.25) - SEG.stare.start))
        meterClock -= dt
        if (meterClock <= 0) {
          meterClock = 1.2 - level * 0.95
          tone(ctx, meterSpot.gain, { freq: 600 + level * 900, env: { attack: 0.002, decay: 0.07, peak: 0.012 + level * 0.02 } })
        }
      }
      // Steps on a hard floor.
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped) {
        burst(ctx, noise.brown, fx, { freq: 240, type: 'lowpass', env: { attack: 0.004, decay: 0.1, peak: 0.16 }, pan: motion.step % 2 ? 0.1 : -0.1 })
        burst(ctx, noise.white, fx, { freq: 3200, q: 2, env: { attack: 0.002, decay: 0.03, peak: 0.018 } })
      }
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
