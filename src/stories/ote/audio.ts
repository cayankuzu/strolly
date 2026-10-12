/**
 * ÖTE's sound. The company's rooms are quiet and exact: a room heard through
 * glass, a lamp's hum, a pen, paper, a steel door, footsteps in unison, an
 * elevator that keeps rising, a chime and a lock. The shuttle: cabin air, a
 * murmur that stops, a calm voice, buckles, the countdown, the roar — and at
 * cut-off, hard silence. The voyage: a recorded sea that audibly loops, an
 * unfinished guitar phrase, needles, chess; data chirps with gaps; a send
 * tone. The black hole: a hum felt more than heard, a shimmer from behind,
 * the beacon's pings speeding into a hiss, then one low tone; the last
 * chord. On Earth: HVAC, packet beeps thinning to a flat line, a flat voice,
 * a folder, a stamp, cart wheels; silence in the keyhole; the pen again.
 *
 * Everything is synthesized. Layers follow progress; one-shots fire only on
 * forward crossings (never on jumps).
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { SEG, at, type SegmentId } from './timeline'

type LayerId = 'glass' | 'room' | 'lamp' | 'corridor' | 'lift' | 'whine' | 'cabin' | 'murmur' | 'roar' | 'rattle' | 'ship' | 'sea' | 'lounge' | 'deep' | 'shimmer' | 'hiss' | 'tone' | 'hvac' | 'flat' | 'cart'

const k = (p: number, v: number): Key<number> => [p, v, linear]
const s = (seg: SegmentId, u: number, v: number) => k(at(seg, u), v)
/** A layer that is on between two moments (with short ramps). */
const span = (a: [SegmentId, number], b: [SegmentId, number], v: number, ramp = 0.004): Key<number>[] => [k(at(...a) - ramp, 0), k(at(...a) + ramp, v), k(at(...b) - ramp, v), k(at(...b) + ramp, 0)]

const MIX: Record<LayerId, Key<number>[]> = {
  // The signing room heard through the glass, then the room itself.
  glass: [s('open', 0, 0.22), s('glass', 0.25, 0.2), s('glass', 0.32, 0), s('next', 0.04, 0), s('next', 0.1, 0.2), s('next', 1, 0.2)],
  room: [s('glass', 0.25, 0), s('glass', 0.32, 0.12), s('door', 0.9, 0.12), s('door', 1, 0)],
  // The lamp's hum: there in the room, rising while he is still (fortune 0–0.43).
  lamp: [s('open', 0, 0.02), s('glass', 0.3, 0.06), s('fortune', 0, 0.07), s('fortune', 0.3, 0.2), s('fortune', 0.45, 0.06), s('door', 1, 0.05), s('elevator', 0, 0), s('next', 0, 0), s('next', 0.1, 0.02)],
  corridor: [s('elevator', 0, 0.16), s('elevator', 0.4, 0.12), s('elevator', 0.5, 0.03), s('topFloor', 0.17, 0.02), s('topFloor', 0.2, 0)],
  lift: [s('elevator', 0.45, 0), s('elevator', 0.55, 0.1), s('rise', 0.1, 0.22), s('rise', 0.9, 0.3), s('topFloor', 0.05, 0.08), s('topFloor', 0.18, 0)],
  whine: [s('rise', 0.55, 0), s('rise', 0.62, 0.05), s('rise', 0.95, 0.07), s('topFloor', 0.08, 0)],
  cabin: [s('topFloor', 0.17, 0), s('topFloor', 0.2, 0.14), s('ignition', 0.32, 0.14), s('ignition', 0.4, 0.04), s('space', 0.44, 0.04), s('space', 0.46, 0), s('space', 0.6, 0.1), s('space', 1, 0.1), s('years', 0, 0)],
  murmur: [s('topFloor', 0.17, 0), s('topFloor', 0.4, 0.1), s('cabin', 0.1, 0.18), s('cabin', 0.43, 0.18), s('cabin', 0.47, 0), s('faces', 0.7, 0), s('announce', 0.55, 0.04), s('announce', 0.95, 0.03), s('seat', 0.3, 0)],
  roar: [s('ignition', 0.31, 0), s('ignition', 0.36, 0.55), s('gforce', 0.1, 0.75), s('gforce', 0.9, 0.6), s('space', 0.0, 0.5), s('space', 0.42, 0.18), s('space', 0.448, 0.18), s('space', 0.452, 0)],
  rattle: [s('ignition', 0.33, 0), s('ignition', 0.4, 0.2), s('gforce', 0.5, 0.3), s('space', 0.2, 0.1), s('space', 0.448, 0.04), s('space', 0.452, 0)],
  ship: [s('space', 0.5, 0), s('space', 0.8, 0.05), s('years', 0, 0.07), s('beach', 0, 0.02), s('beach', 1, 0.02), s('lounge', 0, 0.05), s('arrive', 0, 0.06), s('horizon', 0, 0.05), s('horizon', 0.3, 0), s('mission', 0, 0)],
  sea: [s('years', 0.95, 0), s('beach', 0.02, 0.32), s('beach', 0.98, 0.32), s('lounge', 0.02, 0)],
  lounge: [s('years', 0.43, 0), s('years', 0.48, 0.06), s('beach', 0, 0), s('lounge', 0, 0.08), s('lounge', 1, 0.08), s('windows', 0, 0.03), s('lastLook', 1, 0.03), s('dataLink', 0, 0.07), s('yearsPass', 1, 0.07), s('arrive', 0.44, 0.03), s('approach', 1, 0.03), s('horizon', 0, 0), s('drift', 0, 0.02), s('song', 0.8, 0.02), s('song', 0.9, 0)],
  // The black hole: felt more than heard; it is the one tone left at the end of the song.
  deep: [s('arrive', 0, 0.08), s('arrive', 1, 0.2), s('approach', 1, 0.22), s('horizon', 0.4, 0.34), s('horizon', 1, 0.3), s('drift', 0, 0.16), s('song', 0.4, 0.12), s('song', 0.85, 0.3), s('song', 1, 0.3), s('mission', 0, 0)],
  shimmer: [s('approach', 0, 0), s('approach', 0.3, 0.06), s('approach', 0.45, 0.05), s('approach', 1, 0.02), s('horizon', 0, 0), s('drift', 0.55, 0), s('drift', 0.7, 0.04), s('song', 0, 0)],
  hiss: [s('approach', 0.6, 0), s('approach', 0.72, 0.09), s('approach', 0.9, 0.04), s('horizon', 0, 0)],
  tone: [s('horizon', 0.05, 0), s('horizon', 0.4, 0.1), s('horizon', 1, 0.1), s('drift', 0.1, 0)],
  hvac: [s('mission', 0, 0.12), s('key', 0, 0.1), s('key', 0.3, 0)],
  flat: span(['mission', 0.74], ['readout', 0.04], 0.05, 0.002),
  cart: span(['routine', 0.18], ['routine', 0.38], 0.12, 0.01),
}

/** The elevator's pitch: the building's floors, then on past them. */
const LIFT_HZ: Key<number>[] = [s('elevator', 0.5, 55), s('rise', 0.0, 58), s('rise', 0.3, 72), s('rise', 0.9, 118), s('topFloor', 0.1, 90)]

export function createOteAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>
  const L = (id: LayerId, send = 0) => (layers[id] = kit.layer(send))

  // ——— Rooms ———
  const glass = L('glass')
  const gF = filter(ctx, 'lowpass', 180)
  kit.loop(noise.brown, gF, 0.6)
  gF.connect(glass)
  kit.osc('sine', 100, glass, 0.04)
  const room = L('room', 0.1)
  const rF = filter(ctx, 'lowpass', 520)
  kit.loop(noise.pink, rF, 0.5)
  rF.connect(room)
  const lampSpot = kit.spatial(0, 1.8, 0, { ref: 2, rolloff: 0.4 })
  layers.lamp = lampSpot.gain
  const lampF = filter(ctx, 'bandpass', 120, 3)
  kit.osc('sawtooth', 100, lampF, 0.06)
  kit.osc('sine', 50, lampSpot.gain, 0.08)
  lampF.connect(lampSpot.gain)
  const corridor = L('corridor', 0.25)
  const cF = filter(ctx, 'lowpass', 700)
  kit.loop(noise.pink, cF, 0.8)
  cF.connect(corridor)
  // The elevator: a motor whose pitch climbs, and the ear-pressure whine.
  const lift = L('lift', 0.1)
  const liftF = filter(ctx, 'lowpass', 400, 1.2)
  const motor = kit.osc('sawtooth', 55, liftF, 0.12)
  const motor2 = kit.osc('sine', 110, lift, 0.05)
  liftF.connect(lift)
  const whine = L('whine')
  const wO = kit.osc('sine', 4200, whine, 0.12)
  kit.lfo(wO.o.frequency, 0.3, 60)
  // ——— Shuttle ———
  const cabin = L('cabin', 0.1)
  const caF = filter(ctx, 'bandpass', 520, 0.6)
  kit.loop(noise.pink, caF, 1)
  caF.connect(cabin)
  const murmur = L('murmur', 0.15)
  const mF = filter(ctx, 'bandpass', 420, 1.4)
  kit.loop(noise.pink, mF, 1.3)
  const mG = ctx.createGain()
  mG.gain.value = 0.6
  mF.connect(mG).connect(murmur)
  kit.lfo(mG.gain, 2.7, 0.35)
  const roar = L('roar')
  const roF = filter(ctx, 'lowpass', 260, 0.8)
  kit.loop(noise.brown, roF, 0.8)
  roF.connect(roar)
  const roH = filter(ctx, 'bandpass', 900, 0.5)
  kit.loop(noise.white, roH, 1)
  const roHg = ctx.createGain()
  roHg.gain.value = 0.08
  roH.connect(roHg).connect(roar)
  kit.osc('sine', 38, roar, 0.5)
  const rattle = L('rattle')
  const raF = filter(ctx, 'bandpass', 2600, 3)
  kit.loop(noise.white, raF, 1)
  const raG = ctx.createGain()
  raG.gain.value = 0.5
  raF.connect(raG).connect(rattle)
  kit.lfo(raG.gain, 13, 0.45)
  // ——— Voyage ———
  const ship = L('ship', 0.1)
  kit.osc('sine', 61, ship, 0.15)
  const shF = filter(ctx, 'lowpass', 300)
  kit.loop(noise.brown, shF, 0.5)
  shF.connect(ship)
  // The recorded sea: one swell every 7 s, the same each time (it loops, audibly).
  const sea = L('sea', 0.2)
  const seaF = filter(ctx, 'lowpass', 1400, 0.5)
  kit.loop(noise.pink, seaF, 1)
  const seaG = ctx.createGain()
  seaG.gain.value = 0.55
  seaF.connect(seaG).connect(sea)
  kit.lfo(seaG.gain, 1 / 7, 0.45)
  const lounge = L('lounge', 0.15)
  const loF = filter(ctx, 'lowpass', 600)
  kit.loop(noise.pink, loF, 0.6)
  loF.connect(lounge)
  const deep = L('deep')
  kit.osc('sine', 31, deep, 0.5)
  const dO = kit.osc('sine', 46.5, deep, 0.25)
  kit.lfo(dO.g.gain, 0.11, 0.12)
  const shimmerSpot = kit.spatial(307, 1.55, 4.5, { ref: 3, rolloff: 0.4 })
  layers.shimmer = shimmerSpot.gain
  for (const f0 of [6200, 7400, 8800]) {
    const o = kit.osc('sine', f0, shimmerSpot.gain, 0.05)
    kit.lfo(o.g.gain, 0.4 + f0 / 20000, 0.04)
  }
  const hiss = L('hiss')
  const hF = filter(ctx, 'highpass', 3000)
  kit.loop(noise.white, hF, 1)
  hF.connect(hiss)
  const toneL = L('tone')
  kit.osc('sine', 55, toneL, 0.6)
  // ——— Earth ———
  const hvac = L('hvac', 0.05)
  const hvF = filter(ctx, 'lowpass', 380)
  kit.loop(noise.pink, hvF, 0.9)
  hvF.connect(hvac)
  kit.osc('sine', 60, hvac, 0.05)
  const flat = L('flat')
  kit.osc('sine', 1000, flat, 0.25)
  const cart = L('cart', 0.1)
  const ctF = filter(ctx, 'bandpass', 180, 1)
  kit.loop(noise.brown, ctF, 1.6)
  const ctG = ctx.createGain()
  ctG.gain.value = 0.7
  ctF.connect(ctG).connect(cart)
  kit.lfo(ctG.gain, 7, 0.3)

  // ——— One-shots ———
  const click = (peak = 0.12, f = 3800) => {
    burst(ctx, noise.white, fx, { freq: f, q: 4, env: { attack: 0.001, decay: 0.025, peak } })
    tone(ctx, fx, { freq: f * 0.42, type: 'triangle', env: { attack: 0.001, decay: 0.02, peak: peak * 0.15 } })
  }
  const page = (peak = 0.16) => {
    burst(ctx, noise.pink, fx, { freq: 2400, q: 0.6, env: { attack: 0.02, decay: 0.22, peak } })
    burst(ctx, noise.white, fx, { freq: 5200, q: 1.2, env: { attack: 0.005, decay: 0.08, peak: peak * 0.4 } })
  }
  const slide = (peak = 0.12, len = 0.7) => burst(ctx, noise.pink, fx, { freq: 1800, q: 0.5, env: { attack: 0.12, decay: len, peak } })
  const scratch = () => {
    for (let i = 0; i < 7; i++) setTimeout(() => burst(ctx, noise.white, fx, { freq: 4200 + Math.random() * 1600, q: 2.5, env: { attack: 0.01, decay: 0.05 + Math.random() * 0.06, peak: 0.07 } }), i * 85)
  }
  const thud = (peak: number, freq = 140, dest: AudioNode = fx) => {
    burst(ctx, noise.brown, dest, { freq, type: 'lowpass', env: { attack: 0.004, decay: 0.32, peak } })
    tone(ctx, dest, { freq: 58, to: 40, glide: 0.3, env: { attack: 0.004, decay: 0.36, peak: peak * 0.6 } })
  }
  const groan = (f0: number, peak: number, len: number) => {
    tone(ctx, fx, { freq: f0, to: f0 * 0.7, glide: len, type: 'sawtooth', env: { attack: 0.2, decay: len, peak: peak * 0.2 } })
    burst(ctx, noise.pink, fx, { freq: f0 * 3, q: 5, env: { attack: 0.2, decay: len, peak: peak * 0.5 } })
  }
  const hissShot = (peak: number, len: number) => burst(ctx, noise.white, fx, { freq: 3200, q: 0.4, env: { attack: 0.05, decay: len, peak } })
  const chime = (peak = 0.12) => {
    tone(ctx, fx, { freq: 880, env: { attack: 0.004, decay: 1.4, peak } })
    tone(ctx, fx, { freq: 1318.5, env: { attack: 0.004, decay: 1.2, peak: peak * 0.6 }, delay: 0.28 })
  }
  const step = (peak = 0.08, hard = true) => burst(ctx, noise.brown, fx, { freq: hard ? 520 : 260, type: 'lowpass', env: { attack: 0.004, decay: 0.09, peak } })
  const beep = (f: number, peak = 0.08, len = 0.12) => tone(ctx, fx, { freq: f, type: 'sine', env: { attack: 0.004, decay: len, peak } })
  /** A voice: a few formant-ish syllables (a calm woman's announcement; a flat man's reading). */
  const voice = (f0: number, n: number, peak: number, flat = false) => {
    for (let i = 0; i < n; i++) {
      const f = f0 * (flat ? 1 + (Math.random() - 0.5) * 0.03 : 0.92 + Math.random() * 0.2)
      const d = 0.12 + Math.random() * 0.14
      tone(ctx, fx, { freq: f, to: f * (flat ? 0.99 : 0.9), type: 'triangle', env: { attack: 0.03, decay: d, peak: peak * 0.4 }, delay: i * 0.22 })
      burst(ctx, noise.pink, fx, { freq: 700 + Math.random() * 900, q: 3, env: { attack: 0.03, decay: d, peak: peak * 0.4 } })
    }
  }
  /** A plucked guitar note (a short, bright decay). */
  const pluck = (f: number, peak = 0.09) => {
    tone(ctx, fx, { freq: f, type: 'triangle', env: { attack: 0.003, decay: 1.1, peak } })
    tone(ctx, fx, { freq: f * 2, type: 'sine', env: { attack: 0.003, decay: 0.5, peak: peak * 0.3 } })
    burst(ctx, noise.white, fx, { freq: 3000, q: 1, env: { attack: 0.001, decay: 0.02, peak: peak * 0.3 } })
  }
  const PHRASE = [196, 246.9, 293.7, 392, 329.6, 293.7, 246.9, 220, 246.9, 196, 293.7, 329.6]
  const chord = (peak = 0.08) => [196, 246.9, 293.7, 392, 493.9].forEach((f, i) => setTimeout(() => pluck(f, peak), i * 28))
  const gull = () => {
    const f0 = 1400 + Math.random() * 500
    for (let i = 0; i < 3; i++) tone(ctx, sea, { freq: f0, to: f0 * 0.7, glide: 0.18, type: 'triangle', env: { attack: 0.02, decay: 0.2, peak: 0.05 }, delay: i * 0.24 })
  }
  const needles = (peak = 0.03) => burst(ctx, noise.white, fx, { freq: 6000, q: 6, env: { attack: 0.001, decay: 0.015, peak } })
  const chirp = () => tone(ctx, fx, { freq: 2200 + Math.random() * 800, to: 3400, glide: 0.05, env: { attack: 0.002, decay: 0.06, peak: 0.04 } })

  const crossings = (from: number, to: number, frame: AudioFrame) => {
    const c = (seg: SegmentId, u: number) => from < at(seg, u) && to >= at(seg, u)
    // İMZA
    if (c('pen', 0.1) || c('pen', 0.52) || c('glass', 0.6)) click(0.07)
    for (const u of [0.1, 0.22, 0.34]) if (c('pages', u)) page()
    if (c('lastPage', 0.05)) slide(0.13, 0.9)
    if (c('fortune', 0.72)) scratch()
    if (c('sign', 0.06)) click(0.09, 2600)
    if (c('sign', 0.15)) page(0.1)
    if (c('sign', 0.22)) slide(0.1, 0.5)
    if (c('sign', 0.55)) burst(ctx, noise.pink, fx, { freq: 900, q: 0.8, env: { attack: 0.005, decay: 0.12, peak: 0.12 } })
    // KAPI
    if (c('nod', 0.8)) burst(ctx, noise.brown, fx, { freq: 400, type: 'lowpass', env: { attack: 0.05, decay: 0.4, peak: 0.08 } })
    if (c('door', 0.45)) {
      hissShot(0.1, 1.2)
      groan(70, 0.6, 2.2)
    }
    if (c('door', 0.76)) thud(0.3, 120)
    if (c('elevator', 0.48)) {
      burst(ctx, noise.pink, fx, { freq: 1200, q: 0.6, env: { attack: 0.1, decay: 0.5, peak: 0.08 } })
      thud(0.2, 220)
    }
    if (c('topFloor', 0.04)) chime(0.12)
    if (c('topFloor', 0.17)) hissShot(0.06, 0.9)
    if (c('topFloor', 0.5)) burst(ctx, noise.pink, fx, { freq: 1200, q: 0.6, env: { attack: 0.1, decay: 0.4, peak: 0.07 } })
    if (c('topFloor', 0.55)) {
      thud(0.35, 260)
      click(0.12, 2000)
    }
    // YOLCULAR
    if (c('announce', 0.02)) {
      chime(0.1)
      setTimeout(() => voice(230, 9, 0.18), 900)
    }
    if (c('seat', 0.75)) {
      click(0.18, 2400)
      click(0.08, 5200)
    }
    for (let i = 0; i < 10; i++) if (c('ignition', 0.04 + i * 0.028)) beep(i === 9 ? 1320 : 880, 0.08)
    if (c('ignition', 0.33)) thud(0.6, 90)
    if (c('gforce', 0.08)) groan(90, 0.5, 2.6)
    if (c('gforce', 0.6)) groan(120, 0.3, 1.8)
    if (c('space', 0.45)) thud(0.25, 300)
    if (c('space', 0.62)) click(0.04, 3000)
    if (c('space', 0.7)) beep(660, 0.04, 0.3)
    // YOLCULUK
    if (c('beach', 0.2) || c('beach', 0.55) || c('beach', 0.85)) gull()
    for (let i = 0; i < 9; i++) if (c('lounge', 0.04 + i * 0.04)) pluck(PHRASE[i])
    if (c('lounge', 0.6)) click(0.1, 1800)
    if (c('lounge', 0.64)) voice(260, 3, 0.05)
    // SOLUK MAVİ NOKTA
    if (c('report', 0.36)) {
      beep(1200, 0.07, 0.12)
      beep(1600, 0.06, 0.2)
    }
    if (c('report', 0.6)) beep(520, 0.03, 0.4)
    if (c('dataLink', 0.9)) voice(300, 4, 0.05)
    // VARIŞ
    if (c('song', 0.36)) chord(0.1)
    for (let i = 0; i < 12; i++) if (c('song', 0.02 + i * 0.028)) pluck(PHRASE[i % PHRASE.length], 0.08)
    // ANAHTAR
    if (c('readout', 0.06)) voice(118, 14, 0.2, true)
    if (c('readout', 0.75)) burst(ctx, noise.pink, fx, { freq: 900, q: 0.8, env: { attack: 0.004, decay: 0.12, peak: 0.12 } })
    if (c('readout', 0.86)) thud(0.25, 400)
    if (c('routine', 0.3)) click(0.05, 2500)
    if (c('routine', 0.47)) page(0.12)
    if (c('next', 0.12) || c('next', 0.55)) click(0.05)
    void frame
  }

  let lastP = -1
  let lastStep = 0
  let needleClock = 0
  let chirpClock = 0
  let pingClock = 0
  let beepClock = 0
  let gullClock = 3

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, jumped ? 0.02 : id === 'roar' || id === 'rattle' ? 0.03 : 0.15)
      const hz = evalNumber(LIFT_HZ, p)
      motor.o.frequency.setTargetAtTime(hz, now, 0.2)
      motor2.o.frequency.setTargetAtTime(hz * 2, now, 0.2)
      liftF.frequency.setTargetAtTime(hz * 6, now, 0.2)

      // Footsteps: in the corridor, his and the escort's, in unison (hard floor).
      if (motion.step !== lastStep && motion.walking > 0.3 && !jumped) {
        const inCorridor = p >= SEG.elevator.start && p < at('elevator', 0.4)
        step(inCorridor ? 0.12 : 0.06, true)
        if (inCorridor) setTimeout(() => step(0.06, true), 18)
      }
      lastStep = motion.step

      // Knitting needles in the lounge; racing in the time-lapse.
      const inLounge = p >= SEG.lounge.start && p < SEG.windows.start
      const lapse = p >= SEG.yearsPass.start && p < SEG.arrive.start
      if (inLounge || lapse || (p >= SEG.song.start && p < at('song', 0.5))) {
        needleClock -= dt
        if (needleClock <= 0) {
          const u = lapse ? (p - SEG.yearsPass.start) / SEG.yearsPass.len : 0
          needleClock = lapse ? 0.3 - 0.24 * u : 0.5 + Math.random() * 0.3
          needles(lapse ? 0.03 : 0.02)
        }
      }
      // Data chirps with gaps (dataLink): bursts, then silence.
      if (p >= SEG.dataLink.start && p < SEG.report.start) {
        chirpClock -= dt
        if (chirpClock <= 0) {
          chirpClock = Math.random() < 0.3 ? 1.6 : 0.12 + Math.random() * 0.1
          chirp()
        }
      }
      // The beacon: pings from Earth, faster and faster until they are a hiss.
      if (p >= at('approach', 0.44) && p < at('approach', 0.75)) {
        const u = (p - at('approach', 0.44)) / (at('approach', 0.75) - at('approach', 0.44))
        pingClock -= dt
        if (pingClock <= 0) {
          pingClock = Math.max(0.035, 0.6 * Math.pow(1 - u, 2.2))
          beep(1760, 0.035, 0.05)
        }
      }
      // Packet beeps thinning out on the mission screen, then none.
      if (p >= SEG.mission.start && p < at('mission', 0.7)) {
        const u = (p - SEG.mission.start) / (at('mission', 0.7) - SEG.mission.start)
        beepClock -= dt
        if (beepClock <= 0) {
          beepClock = 0.5 + u * u * 3.5
          beep(1500, 0.03, 0.06)
        }
      }
      // Gulls over the recorded sea.
      if (p >= SEG.beach.start && p < SEG.lounge.start) {
        gullClock -= dt
        if (gullClock <= 0) {
          gullClock = 4 + Math.random() * 4
          gull()
        }
      }
      if (!jumped && p > lastP) crossings(lastP, p, frame)
      lastP = p
    },
  }
}
