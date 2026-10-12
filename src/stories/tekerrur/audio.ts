/**
 * TEKERRÜR's sound (screenplay §6). The room is a forest by a stream: water,
 * wind in leaves, a distant bird, a mains hum under it, his uneven breath.
 * Then steps on planks, a heavy handle, the stream loud through the open
 * door, drizzle on the screens, a scan line's buzz. Small wheels, porcelain,
 * the tray's soft click — twice. The archive: a cold, deep hum, the core's
 * slow breath, a lever, relays clicking away into the distance; a whistled
 * rhythm. A sparse piano under the eras of the square (heard as if through
 * glass), pulses in the void, music cut; one warning tone. The button's
 * click, the forest going out panel by panel, and then nothing at all. One
 * relay, a machine hum. Record ticks, the stream again, steps that stop, a
 * servo turning toward us. No music to the end.
 *
 * Positional: the stream (front wall), the walkway's stream, the archive door,
 * the core, the sleeper's breath, the recorder's head.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, eraAt, SEG } from './timeline'

type LayerId = 'stream' | 'near' | 'leaves' | 'hum' | 'breath' | 'rain' | 'scan' | 'archive' | 'core' | 'square' | 'music' | 'machine' | 'record'

const k = (p: number, v: number): Key<number> => [p, v, linear]

/** The forest's sound goes with its panels: on in `black`, out in `press`, back (as a record) and in `again`. */
const FOREST: Key<number>[] = [
  k(at('black', 0.7), 0),
  k(at('black', 0.95), 1),
  k(at('forty', 0.5), 0.85),
  k(at('reopen'), 0.75),
  k(at('whistle', 1), 0.7),
  k(at('red', 0.5), 0.45),
  k(at('red', 1), 0.3),
  k(at('dive', 0.6), 0),
  k(at('checked'), 0),
  k(at('checked', 0.1), 0.3),
  k(at('feed', 0.25), 0.3),
  k(at('feed', 0.3), 0.55),
  k(at('feedWide', 0.48), 0.55),
  k(at('feedWide', 0.52), 0.3),
  k(at('press', 0.4), 0.3),
  k(at('press', 0.74), 0),
  k(at('records'), 0),
  k(at('records', 0.03), 0.35),
  k(at('records', 0.99), 0.35),
  k(at('engine'), 0),
  k(at('again', 0.52), 0),
  k(at('again', 0.6), 1),
  k(at('observer'), 0.85),
  k(at('maybe', 0.2), 0.6),
  k(at('maybe', 0.7), 0),
]

const MIX: Record<Exclude<LayerId, 'stream' | 'leaves'>, Key<number>[]> = {
  near: [k(at('rightDoor', 0.35), 0), k(at('rightDoor', 0.45), 0.7), k(at('rightDoor', 0.94), 0.7), k(at('rightDoor', 0.99), 0), k(at('reopen', 0.15), 0), k(at('reopen', 0.3), 0.5), k(at('robots', 0.6), 0.5), k(at('robots', 0.8), 0)],
  hum: [k(at('black', 0.3), 0), k(at('black', 0.5), 0.35), k(at('press', 0.6), 0.35), k(at('press', 0.74), 0)],
  breath: [k(0, 0.6), k(at('wake', 0.55), 0.6), k(at('wake', 0.65), 0), k(at('feed', 0.28), 0), k(at('feed', 0.32), 0.35), k(at('feedWide', 0.48), 0.35), k(at('feedWide', 0.52), 0), k(at('again'), 0.35), k(at('again', 0.5), 0.35), k(at('again', 0.6), 0)],
  rain: [k(at('forty', 0.37), 0), k(at('forty', 0.5), 0.45), k(at('reopen'), 0.3), k(at('hover'), 0.22), k(at('dive', 0.5), 0), k(at('checked'), 0), k(at('checked', 0.1), 0.15), k(at('feed', 0.25), 0.15), k(at('feed', 0.27), 0), k(at('feedWide', 0.5), 0), k(at('feedWide', 0.52), 0.15), k(at('press', 0.6), 0)],
  scan: [k(at('forty', 0.58), 0), k(at('forty', 0.62), 0.5), k(at('forty', 0.72), 0.5), k(at('forty', 0.76), 0)],
  archive: [k(at('leftDoor', 0.33), 0), k(at('leftDoor', 0.5), 0.5), k(at('deep', 0.4), 0.7), k(at('lever', 1), 0.7), k(at('whistle', 0.6), 0.25), k(at('red', 1), 0.2), k(at('dive', 0.6), 0), k(at('checked'), 0), k(at('checked', 0.1), 0.15), k(at('press', 0.74), 0)],
  core: [k(at('aisles', 0.5), 0), k(at('core', 0.15), 0.6), k(at('core', 1), 0.6), k(at('lever', 0.3), 0.3), k(at('lever', 0.95), 0.8), k(at('whistle', 0.4), 0)],
  square: [k(at('dive', 0.85), 0), k(at('history'), 0.6), k(at('repeat', 1), 0.6), k(at('network', 0.12), 0)],
  music: [k(at('red', 0.55), 0), k(at('red', 0.7), 1), k(at('beyond', 0.05), 1), k(at('beyond', 0.12), 0), k(at('thousands'), 0)],
  machine: [k(at('word', 0.62), 0), k(at('word', 0.8), 0.5), k(at('law', 1), 0.5), k(at('records'), 0.25), k(at('engine'), 0.5), k(at('engine', 1), 0.5), k(at('again', 0.5), 0.2), k(at('observer'), 0.45), k(at('maybe', 0.9), 0.3), k(at('end', 0.4), 0.3), k(at('end', 0.9), 0)],
  record: [k(at('records'), 0), k(at('records', 0.02), 0.35), k(at('records', 0.99), 0.35), k(at('engine'), 0)],
}

/** A sparse piano in a minor key: the motif under the eras. */
const MOTIF = [220, 261.63, 329.63, 293.66, 246.94, 220, 196, 261.63]
/** The whistled rhythm: four notes. */
const WHISTLE = [880, 987.77, 783.99, 880]

export function createTekerrurAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  // The stream on the front wall: low water and a higher burble.
  const streamSpot = kit.spatial(0.8, 0.4, -4.8, { ref: 3.5, send: 0.15 })
  layers.stream = streamSpot.gain
  const sLow = filter(ctx, 'bandpass', 420, 0.6)
  kit.loop(noise.pink, sLow, 0.9)
  sLow.connect(streamSpot.gain)
  const sHigh = filter(ctx, 'bandpass', 1900, 1.4)
  const sHighG = ctx.createGain()
  sHighG.gain.value = 0.35
  kit.loop(noise.white, sHigh, 1)
  sHigh.connect(sHighG).connect(streamSpot.gain)
  kit.lfo(sHigh.frequency, 0.31, 420)
  kit.lfo(sHighG.gain, 0.7, 0.12)
  // The stream under the walkway, heard close through the open door.
  const nearSpot = kit.spatial(6.2, -0.2, 0, { ref: 1.6, send: 0.1 })
  layers.near = nearSpot.gain
  const nF = filter(ctx, 'bandpass', 900, 0.7)
  kit.loop(noise.pink, nF, 1.1)
  nF.connect(nearSpot.gain)
  const nH = filter(ctx, 'highpass', 2600)
  kit.loop(noise.white, nH, 1)
  const nHG = ctx.createGain()
  nHG.gain.value = 0.25
  nH.connect(nHG).connect(nearSpot.gain)
  // Wind in the leaves.
  const leaves = (layers.leaves = kit.layer(0.2))
  const lF = filter(ctx, 'bandpass', 3200, 0.5)
  kit.loop(noise.pink, lF, 0.8)
  const lG = ctx.createGain()
  lG.gain.value = 0.5
  lF.connect(lG).connect(leaves)
  kit.lfo(lG.gain, 0.09, 0.35)
  // Mains hum and room tone.
  const hum = (layers.hum = kit.layer())
  const hF = filter(ctx, 'lowpass', 220)
  kit.loop(noise.brown, hF, 0.6)
  hF.connect(hum)
  kit.osc('sine', 50, hum, 0.03)
  kit.osc('sine', 100, hum, 0.012)
  // His breath, at his head on the desk.
  const breathSpot = kit.spatial(-0.15, 0.9, 0.42, { ref: 0.8 })
  layers.breath = breathSpot.gain
  const bF = filter(ctx, 'bandpass', 700, 0.8)
  kit.loop(noise.pink, bF, 1)
  const bG = ctx.createGain()
  bG.gain.value = 0
  bF.connect(bG).connect(breathSpot.gain)
  // Drizzle on the screens.
  const rain = (layers.rain = kit.layer(0.1))
  const rF = filter(ctx, 'highpass', 3800)
  kit.loop(noise.white, rF, 1)
  const rG = ctx.createGain()
  rG.gain.value = 0.35
  rF.connect(rG).connect(rain)
  // The scan line's electrical buzz.
  const scan = (layers.scan = kit.layer())
  const scF = filter(ctx, 'bandpass', 240, 2)
  kit.osc('sawtooth', 120, scF, 0.25)
  scF.connect(scan)
  // The archive: a cold, deep hum from the door; the core's slow breath.
  const archSpot = kit.spatial(-8, 2, 0, { ref: 4, send: 0.4 })
  layers.archive = archSpot.gain
  const aF = filter(ctx, 'lowpass', 160)
  kit.loop(noise.brown, aF, 0.5)
  aF.connect(archSpot.gain)
  kit.osc('sine', 41, archSpot.gain, 0.12)
  kit.osc('sine', 82.5, archSpot.gain, 0.03)
  const coreSpot = kit.spatial(-52, 5, 0, { ref: 8, rolloff: 0.5, send: 0.5 })
  layers.core = coreSpot.gain
  const cF = filter(ctx, 'lowpass', 380)
  kit.loop(noise.pink, cF, 0.7)
  const cG = ctx.createGain()
  cG.gain.value = 0.5
  cF.connect(cG).connect(coreSpot.gain)
  kit.lfo(cG.gain, 1 / 6, 0.35)
  kit.osc('triangle', 55, coreSpot.gain, 0.05)
  // The square, as if through glass.
  const square = (layers.square = kit.layer(0.15))
  const glass = filter(ctx, 'lowpass', 900)
  glass.connect(square)
  const crowd = filter(ctx, 'bandpass', 520, 0.7)
  kit.loop(noise.pink, crowd, 1)
  const crowdG = ctx.createGain()
  crowdG.gain.value = 0
  crowd.connect(crowdG).connect(glass)
  const wind = filter(ctx, 'bandpass', 700, 0.4)
  kit.loop(noise.pink, wind, 0.6)
  const windG = ctx.createGain()
  windG.gain.value = 0
  wind.connect(windG).connect(glass)
  kit.lfo(wind.frequency, 0.13, 260)
  const sqRain = filter(ctx, 'highpass', 2000)
  kit.loop(noise.white, sqRain, 1)
  const sqRainG = ctx.createGain()
  sqRainG.gain.value = 0
  sqRain.connect(sqRainG).connect(square)
  // Music: a piano with a long echo.
  const music = (layers.music = kit.layer(0.5, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.62
  const fb = ctx.createGain()
  fb.gain.value = 0.38
  const dLp = filter(ctx, 'lowpass', 1600)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)
  // The one sustained note under `thousands`.
  const held = kit.layer(0.6, 'music')
  kit.osc('sine', 220, held, 0.06)
  kit.osc('sine', 330.4, held, 0.025)
  // The machine's hum after the word.
  const machine = (layers.machine = kit.layer(0.2))
  const mF = filter(ctx, 'lowpass', 300)
  kit.loop(noise.brown, mF, 0.5)
  mF.connect(machine)
  kit.osc('sine', 60, machine, 0.05)
  kit.osc('sine', 120.5, machine, 0.018)
  // The record's own soft hiss.
  const record = (layers.record = kit.layer())
  const recF = filter(ctx, 'bandpass', 5000, 0.6)
  kit.loop(noise.white, recF, 1)
  const recG = ctx.createGain()
  recG.gain.value = 0.06
  recF.connect(recG).connect(record)
  // The recorder's head (its servo).
  const servoSpot = kit.spatial(-0.3, 0.95, 1.9, { ref: 1.2, category: 'sfx' })
  servoSpot.gain.gain.value = 1

  let lastP = -1
  let lastStep = 0
  let birdClock = 4
  let noteClock = 0
  let note = 0
  let pulseClock = 0
  let breathClock = 0
  let wheelClock = 0

  const click = (peak = 0.08, freq = 2400) => burst(ctx, noise.white, fx, { freq, q: 3, env: { attack: 0.001, decay: 0.03, peak } })
  const relay = (peak = 0.09) => {
    click(peak, 3200)
    tone(ctx, fx, { freq: 140, env: { attack: 0.002, decay: 0.08, peak: peak * 0.5 } })
  }
  const thud = (peak: number, freq = 90) => {
    burst(ctx, noise.brown, fx, { freq: 200, type: 'lowpass', env: { attack: 0.004, decay: 0.3, peak } })
    tone(ctx, fx, { freq, to: freq * 0.6, glide: 0.3, env: { attack: 0.003, decay: 0.35, peak: peak * 0.6 } })
  }
  const creak = (peak = 0.05, from = 260) => tone(ctx, fx, { freq: from, to: from * 0.78, glide: 0.35, type: 'sawtooth', env: { attack: 0.03, decay: 0.4, peak: peak * 0.25 } })
  const clothLand = () => burst(ctx, noise.pink, fx, { freq: 600, q: 0.6, type: 'lowpass', env: { attack: 0.01, decay: 0.18, peak: 0.08 } })
  const trayClick = () => {
    tone(ctx, fx, { freq: 2100, env: { attack: 0.001, decay: 0.07, peak: 0.05 } })
    burst(ctx, noise.white, fx, { freq: 3600, q: 4, env: { attack: 0.001, decay: 0.02, peak: 0.04 } })
  }
  const porcelain = () => {
    tone(ctx, fx, { freq: 2800, env: { attack: 0.001, decay: 0.12, peak: 0.04 } })
    tone(ctx, fx, { freq: 3700, env: { attack: 0.001, decay: 0.08, peak: 0.025 }, delay: 0.09 })
  }
  const recTick = () => {
    tone(ctx, fx, { freq: 1600, env: { attack: 0.001, decay: 0.05, peak: 0.04 } })
    click(0.03, 5200)
  }

  const crossings = (from: number, to: number) => {
    const crossed = (t: number) => from < t && to >= t
    // 01
    if (crossed(at('black', 0.3))) relay(0.12)
    if (crossed(at('desk', 0.66))) for (let i = 0; i < 3; i++) tone(ctx, fx, { freq: 1900 + i * 240, env: { attack: 0.001, decay: 0.05, peak: 0.02 }, delay: i * 0.11 })
    if (crossed(at('wake', 0.62))) {
      burst(ctx, noise.pink, fx, { freq: 600, q: 0.8, env: { attack: 0.2, decay: 0.7, peak: 0.06 } })
      creak(0.08, 220)
    }
    if (crossed(at('throw', 0.48)) || crossed(at('again', 0.9))) clothLand()
    // 02
    if (crossed(at('rise', 0.3))) {
      burst(ctx, noise.brown, fx, { freq: 300, type: 'lowpass', env: { attack: 0.02, decay: 0.45, peak: 0.08 } })
      creak(0.05, 180)
    }
    if (crossed(at('rightDoor', 0.15))) {
      thud(0.05, 160)
      click(0.06, 1400)
    }
    if (crossed(at('rightDoor', 0.97)) || crossed(at('again', 0.55))) thud(0.12, 80)
    // 03
    if (crossed(at('reopen', 0.15)) || crossed(at('again', 0.41))) thud(0.06, 120)
    if (crossed(at('reach', 0.4))) porcelain()
    if (crossed(at('sip', 0.46)) || crossed(at('thousands', 0.55))) trayClick()
    // 04
    if (crossed(at('leftDoor', 0.35))) thud(0.14, 60)
    if (crossed(at('lever', 0.4))) {
      thud(0.16, 70)
      for (let i = 0; i < 14; i++) {
        const d = 0.25 + i * 0.16
        const peak = 0.07 * Math.pow(0.84, i)
        tone(ctx, fx, { freq: 140, env: { attack: 0.002, decay: 0.06, peak }, delay: d })
        tone(ctx, fx, { freq: 3100, env: { attack: 0.001, decay: 0.02, peak: peak * 0.6 }, delay: d })
      }
    }
    if (crossed(at('whistle', 0.05)))
      for (let bar = 0; bar < 3; bar++)
        WHISTLE.forEach((f, i) => tone(ctx, fx, { freq: f, to: f * 1.01, glide: 0.2, env: { attack: 0.03, decay: 0.26, peak: 0.035 }, delay: bar * 1.4 + i * 0.32 }))
    // 05–07
    if (crossed(at('red', 0.12))) tone(ctx, fx, { freq: 330, env: { attack: 0.01, decay: 0.5, peak: 0.06 } })
    if (crossed(at('anomaly', 0.1))) {
      tone(ctx, fx, { freq: 196, env: { attack: 0.05, decay: 1.6, peak: 0.07 } })
      tone(ctx, fx, { freq: 207.65, env: { attack: 0.05, decay: 1.6, peak: 0.05 } })
    }
    if (crossed(at('history', 0.03))) for (let i = 0; i < 2; i++) tone(ctx, glass, { freq: 1320, env: { attack: 0.002, decay: 0.6, peak: 0.05 }, delay: i * 0.35 })
    // The siren of 1917, and the same siren in 1991.
    if (crossed(at('history', 0.23)) || crossed(at('repeat', 0.03))) tone(ctx, glass, { freq: 520, to: 780, glide: 2.2, type: 'triangle', env: { attack: 0.6, decay: 2.6, peak: 0.06 } })
    // 08
    if (crossed(at('press', 0.32))) {
      click(0.12, 1800)
      thud(0.06, 120)
    }
    if (crossed(at('word', 0.05))) relay(0.1)
    // 09
    for (let r = 0; r < 5; r++) if (crossed(at('records', r * 0.2 + 0.02))) recTick()
    if (crossed(at('turn', 0.47))) tone(ctx, servoSpot.gain, { freq: 900, to: 1400, glide: 0.6, type: 'sawtooth', env: { attack: 0.05, decay: 0.6, peak: 0.012 } })
    if (crossed(at('end', 0.3))) {
      relay(0.08)
      tone(ctx, fx, { freq: 60, env: { attack: 0.3, decay: 2.2, peak: 0.05 } })
      burst(ctx, noise.pink, fx, { freq: 500, q: 0.5, env: { attack: 0.6, decay: 2.0, peak: 0.03 } })
    }
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      const forest = evalNumber(FOREST, p)
      // Total silence from the blackout through the dark.
      const silent = p >= at('press', 0.75) && p < at('word', 0.04)
      const gate = silent ? 0 : 1
      layers.stream.gain.setTargetAtTime(0.5 * forest * gate, now, 0.15)
      layers.leaves.gain.setTargetAtTime(0.18 * forest * gate * (p < SEG.reopen.start || p > SEG.again.start ? 1 : 0.5), now, 0.2)
      for (const id of Object.keys(MIX) as Array<keyof typeof MIX>) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p) * gate, now, 0.15)
      held.gain.setTargetAtTime(p >= SEG.thousands.start && p < SEG.thousands.end ? 1 : 0, now, 0.4)
      // The square's own sounds per era.
      if (p >= SEG.history.start && p < SEG.network.start) {
        const { era } = eraAt(p)
        crowdG.gain.setTargetAtTime(era === 0 || era === 4 || era === 7 ? 0.6 : era === 2 || era === 6 ? 0.25 : 0.05, now, 0.3)
        windG.gain.setTargetAtTime(era === 3 || era === 8 ? 0.7 : era === 1 ? 0.3 : 0.1, now, 0.3)
        sqRainG.gain.setTargetAtTime(era === 6 ? 0.5 : 0, now, 0.3)
      }
      // The sleeper's breath: slow and uneven.
      if (evalNumber(MIX.breath, p) > 0.05) {
        breathClock -= dt
        if (breathClock <= 0) {
          breathClock = 3.2 + Math.random() * 1.6
          bG.gain.cancelScheduledValues(now)
          bG.gain.setValueAtTime(0, now)
          bG.gain.linearRampToValueAtTime(0.22, now + 1.1)
          bG.gain.linearRampToValueAtTime(0.02, now + 1.6)
          bG.gain.linearRampToValueAtTime(0.16, now + 2.1)
          bG.gain.linearRampToValueAtTime(0, now + 2.9)
        }
      }
      // A distant bird now and then (the first chapter and the end).
      if ((p < SEG.rise.start || (p > at('again', 0.55) && p < SEG.maybe.start)) && forest > 0.5 && !silent) {
        birdClock -= dt
        if (birdClock <= 0) {
          birdClock = 9 + Math.random() * 14
          const base = 2600 + Math.random() * 900
          for (let i = 0; i < 3; i++) tone(ctx, streamSpot.gain, { freq: base, to: base * 1.25, glide: 0.07, env: { attack: 0.01, decay: 0.1, peak: 0.02 }, delay: i * 0.14 })
        }
      }
      // The piano motif.
      if (evalNumber(MIX.music, p) > 0.1) {
        noteClock -= dt
        if (noteClock <= 0) {
          noteClock = 1.6 + Math.random() * 1.2
          note = (note + 1) % MOTIF.length
          tone(ctx, keys, { freq: MOTIF[note], env: { attack: 0.006, decay: 2.6, peak: 0.035 }, pan: Math.random() * 0.4 - 0.2 })
          if (note % 4 === 0) tone(ctx, keys, { freq: MOTIF[note] / 2, env: { attack: 0.01, decay: 3, peak: 0.02 } })
        }
      }
      // The void: one low pulse per new link.
      if (p >= SEG.network.start && p < SEG.above.end) {
        pulseClock -= dt
        if (pulseClock <= 0) {
          pulseClock = p < SEG.spiral.start ? 0.42 : 0.9
          tone(ctx, fx, { freq: 70, env: { attack: 0.004, decay: 0.25, peak: 0.05 } })
        }
      }
      // Small wheels on wood.
      if (motion.robots > 0.2 && !jumped) {
        wheelClock -= dt
        if (wheelClock <= 0) {
          wheelClock = 0.12
          burst(ctx, noise.brown, fx, { freq: 380, q: 0.8, env: { attack: 0.02, decay: 0.12, peak: 0.02 * motion.robots } })
        }
      }
      // Steps on the planks (heavy), on concrete in the archive.
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped && !silent) {
        burst(ctx, noise.brown, fx, { freq: 230, type: 'lowpass', env: { attack: 0.005, decay: 0.11, peak: 0.13 }, pan: motion.step % 2 ? 0.1 : -0.1 })
        if (Math.random() < 0.3) creak(0.03, 300 + Math.random() * 80)
      }
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
