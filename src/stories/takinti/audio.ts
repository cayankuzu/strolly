/**
 * TAKINTI's sound: an old house at night. Room tone, a street lamp's buzz
 * through the glass, and from below, through floor and walls, the treadle
 * machine — the needle's tak-tak and the treadle's two-beat creak — with a
 * woman's murmurs mixed inside its rhythm. On the stairs it grows; at the
 * door it is dry and close. In the room without him: slams, a wet drag, a
 * soft heavy fall, the machine stopped, then the machine again. Dawn: a lamp
 * clicks off, first birds, a scissors snip. Morning: a car, birds, running
 * bare feet, flies at an open door; in the kitchen a wet rag on tiles and a
 * fridge's hum, then the rag dipped and wrung.
 *
 * Positional: the machine and the mother's voice in the sewing room, the
 * lamp across the street, the tap, the flies, the fridge. Everything is
 * synthesized; one-shots fire only on forward crossings.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { SEG, at, type SegmentId } from './timeline'

type LayerId = 'room' | 'night' | 'lamp' | 'whirr' | 'birds' | 'day' | 'fridge' | 'flies' | 'wipe'

const k = (p: number, v: number): Key<number> => [p, v, linear]
const s = (seg: SegmentId, u: number, v: number) => k(at(seg, u), v)

const MIX: Record<LayerId, Key<number>[]> = {
  room: [s('street', 0, 0.02), s('street', 0.9, 0.03), s('wake', 0, 0.07), s('stitch', 1, 0.07), s('wakeup', 0, 0.05), s('end', 1, 0.05)],
  night: [s('street', 0, 0.22), s('street', 0.9, 0.2), s('wake', 0.05, 0.05), s('flayed', 1, 0.05), s('sunrise', 0.3, 0.02), s('sunrise', 0.6, 0)],
  lamp: [s('street', 0, 0.5), s('street', 0.95, 0.5), s('wake', 0.05, 0.05), s('flayed', 0.4, 0.04), s('flayed', 0.7, 0.12), s('sunrise', 0.07, 0.12), s('sunrise', 0.09, 0)],
  // The flywheel's whirr under the needle (it follows the machine's own on/off as well).
  whirr: [s('street', 0, 0.05), s('voice', 0.43, 0.08), s('voice', 0.45, 0.35), s('voice', 1, 0.3), s('landing', 0, 0.08), s('descent', 1, 0.16), s('words', 1, 0.2), s('shadow', 0, 0.28), s('shadow', 1, 0.32), s('enter', 0.2, 0.4), s('trance', 1, 0.4), s('close', 0.06, 0.4), s('close', 0.12, 0.12), s('close', 0.9, 0.18), s('corner', 0, 0.38), s('stitch', 1, 0.36), s('wakeup', 0, 0)],
  birds: [s('sunrise', 0.48, 0), s('sunrise', 0.6, 0.18), s('stitch', 1, 0.22), s('wakeup', 0, 0.3), s('games', 1, 0.3), s('rush', 0.5, 0.12), s('end', 1, 0.08)],
  day: [s('stitch', 0.8, 0), s('wakeup', 0, 0.18), s('games', 1, 0.18), s('rush', 0.5, 0.08), s('end', 1, 0.08)],
  fridge: [s('pass', 0.6, 0), s('kitchen', 0, 0.25), s('end', 1, 0.25)],
  flies: [s('pass', 0.2, 0), s('pass', 0.32, 0.5), s('pass', 0.6, 0.5), s('pass', 0.9, 0.1), s('kitchen', 0, 0)],
  wipe: [s('pass', 0.6, 0), s('kitchen', 0.02, 0.18), s('ask', 1, 0.18), s('answer', 0.04, 0), s('end', 0.36, 0), s('end', 0.42, 0.14), s('end', 1, 0.12)],
}

/** How muffled the machine is (lowpass cutoff in Hz) and how loud, as he comes closer. */
const MUFFLE: Key<number>[] = [
  s('street', 0, 260),
  s('wake', 0, 320),
  s('toilet', 1, 420),
  s('voice', 0.43, 420),
  s('voice', 0.45, 7000),
  s('voice', 1, 7000),
  s('landing', 0, 500),
  s('descent', 0, 650),
  s('descent', 1, 1500),
  s('words', 1, 2400),
  s('anger', 1, 3500),
  s('shadow', 0, 5000),
  s('close', 0.06, 7000),
  s('close', 0.12, 900),
  s('close', 0.85, 1200),
  s('close', 1, 7000),
  s('mutter', 0, 7000),
  s('mutter', 0.05, 1800),
  s('mutter', 1, 1800),
  s('stitch', 0, 5000),
]
const LOUD: Key<number>[] = [
  s('street', 0, 0.1),
  s('street', 0.5, 0.18),
  s('wake', 0, 0.22),
  s('toilet', 1, 0.3),
  s('voice', 0.43, 0.3),
  s('voice', 0.45, 0.9),
  s('voice', 1, 0.85),
  s('landing', 0, 0.3),
  s('descent', 1, 0.55),
  s('words', 1, 0.65),
  s('shadow', 0, 0.85),
  s('close', 0.06, 0.95),
  s('close', 0.12, 0.45),
  s('close', 1, 0.8),
  s('corner', 0, 0.85),
  s('stitch', 1, 0.8),
]
/** The mother's voice: how present it is (murmurs and moans while she sews). */
const VOICE: Key<number>[] = [
  s('toilet', 0.45, 0),
  s('toilet', 0.5, 0.25),
  s('voice', 0, 0.35),
  s('voice', 1, 0.45),
  s('landing', 1, 0.3),
  s('descent', 0.5, 0.45),
  s('descent', 1, 0.7),
  s('words', 0, 1),
  s('words', 1, 1),
  s('anger', 0.5, 0.5),
  s('shadow', 1, 0.6),
  s('trance', 0, 0.8),
  s('trance', 1, 0.8),
  s('close', 0.1, 0.2),
  s('close', 1, 0.3),
  s('corner', 1, 0.2),
  s('drag', 0, 0),
  s('flayed', 1, 0),
  s('pieces', 0.6, 0),
  s('pieces', 0.7, 0.6),
  s('mutter', 0, 0.9),
  s('mutter', 1, 0.9),
  s('stitch', 0.2, 0.3),
  s('stitch', 1, 0),
]

export function createTakintiAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  const room = (layers.room = kit.layer())
  const rF = filter(ctx, 'lowpass', 160)
  kit.loop(noise.brown, rF, 0.5)
  rF.connect(room)

  const night = (layers.night = kit.layer(0.15))
  const nF = filter(ctx, 'lowpass', 420)
  kit.loop(noise.pink, nF, 0.4)
  nF.connect(night)

  // Lamp A's buzz across the street: mains hum and a ballast's rasp.
  const lampSpot = kit.spatial(12.6, 4.9, 3.3, { ref: 3, rolloff: 0.6 })
  const lamp = (layers.lamp = lampSpot.gain)
  const lF = filter(ctx, 'bandpass', 210, 2)
  kit.osc('sawtooth', 100, lF, 0.05)
  kit.osc('sawtooth', 150, lF, 0.02)
  lF.connect(lamp)
  const lN = filter(ctx, 'bandpass', 3200, 4)
  kit.loop(noise.white, lN, 1)
  const lNg = ctx.createGain()
  lNg.gain.value = 0.02
  lN.connect(lNg).connect(lamp)
  kit.lfo(lNg.gain, 7, 0.012)

  // The machine in the sewing room, through a filter that stands for floors and walls.
  const machineSpot = kit.spatial(4.6, 0.95, -2.4, { ref: 2.5, rolloff: 0.5, category: 'sfx' })
  machineSpot.gain.gain.value = 1
  const muffle = filter(ctx, 'lowpass', 400, 0.8)
  const machineBus = ctx.createGain()
  machineBus.gain.value = 0.2
  machineBus.connect(muffle).connect(machineSpot.gain)
  const whirr = (layers.whirr = kit.layer())
  const wF = filter(ctx, 'bandpass', 260, 1.2)
  kit.loop(noise.brown, wF, 1)
  wF.connect(whirr)
  // (The whirr also passes through the walls' filter.)
  whirr.disconnect()
  whirr.connect(muffle)

  // Her voice, from the stool.
  const voiceSpot = kit.spatial(4.15, 1.25, -2.4, { ref: 2, rolloff: 0.5, category: 'sfx' })
  const voiceBus = ctx.createGain()
  voiceBus.gain.value = 0
  const voiceMuffle = filter(ctx, 'lowpass', 900, 0.7)
  voiceBus.connect(voiceMuffle).connect(voiceSpot.gain)
  voiceSpot.gain.gain.value = 1

  // Dawn and day outside.
  const birdSpot = kit.spatial(11, 4, -3, { ref: 6, rolloff: 0.3 })
  layers.birds = birdSpot.gain
  const day = (layers.day = kit.layer(0.2))
  const dF = filter(ctx, 'lowpass', 900)
  kit.loop(noise.pink, dF, 0.7)
  dF.connect(day)

  // The fridge's hum, the flies at the open door, the wet rag.
  const fridgeSpot = kit.spatial(2.12, 1.0, -10.45, { ref: 1.5 })
  const fridge = (layers.fridge = fridgeSpot.gain)
  kit.osc('sine', 50, fridge, 0.08)
  kit.osc('sine', 100, fridge, 0.03)
  const fN = filter(ctx, 'bandpass', 420, 3)
  kit.loop(noise.white, fN, 1)
  fN.connect(fridge)
  const fliesSpot = kit.spatial(2.6, 1.0, -2.9, { ref: 1.2, rolloff: 1.2 })
  const flies = (layers.flies = fliesSpot.gain)
  const flyBand = filter(ctx, 'bandpass', 900, 1.5)
  flyBand.connect(flies)
  for (const [f0, v] of [
    [205, 0.05],
    [231, 0.04],
    [187, 0.03],
  ] as const) {
    const o = kit.osc('sawtooth', f0, flyBand, v)
    kit.lfo(o.o.frequency, 9 + f0 / 50, 18)
    kit.lfo(o.g.gain, 3.1 + f0 / 100, v * 0.8)
  }
  const wipe = (layers.wipe = kit.layer(0.1))
  const wiF = filter(ctx, 'bandpass', 1300, 0.8)
  kit.loop(noise.pink, wiF, 1)
  const wiG = ctx.createGain()
  wiG.gain.value = 0.5
  wiF.connect(wiG).connect(wipe)
  kit.lfo(wiG.gain, 0.35, 0.45)

  const tapSpot = kit.spatial(-1.25, 3.86, -4.27, { ref: 1, category: 'sfx' })
  tapSpot.gain.gain.value = 1
  const doorSpot = kit.spatial(0.86, 1.0, -1.15, { ref: 2, category: 'sfx' })
  doorSpot.gain.gain.value = 1

  // ——— Sources ———

  const tak = (peak: number) => {
    burst(ctx, noise.white, machineBus, { freq: 2600, q: 3, env: { attack: 0.001, decay: 0.03, peak } })
    tone(ctx, machineBus, { freq: 920, type: 'square', env: { attack: 0.001, decay: 0.018, peak: peak * 0.12 } })
  }
  const creak = (dest: AudioNode, f0: number, peak: number, len = 0.22) => {
    tone(ctx, dest, { freq: f0, to: f0 * 0.78, glide: len, type: 'sawtooth', env: { attack: 0.03, decay: len, peak: peak * 0.25 } })
    burst(ctx, noise.pink, dest, { freq: f0 * 3.2, q: 6, env: { attack: 0.02, decay: len, peak: peak * 0.6 } })
  }
  const thump = (dest: AudioNode, peak: number, freq = 160) => {
    burst(ctx, noise.brown, dest, { freq, type: 'lowpass', env: { attack: 0.004, decay: 0.3, peak } })
    tone(ctx, dest, { freq: 62, to: 40, glide: 0.3, env: { attack: 0.004, decay: 0.38, peak: peak * 0.5 } })
  }
  const wet = (dest: AudioNode, peak: number, len = 0.5) => {
    burst(ctx, noise.pink, dest, { freq: 800, q: 0.7, env: { attack: 0.08, decay: len, peak } })
    burst(ctx, noise.brown, dest, { freq: 300, type: 'lowpass', env: { attack: 0.05, decay: len * 0.8, peak: peak * 0.8 } })
  }
  const drip = () => {
    tone(ctx, tapSpot.gain, { freq: 1900, to: 1300, glide: 0.05, env: { attack: 0.001, decay: 0.09, peak: 0.05 } })
  }
  /** A murmur: a few breathy syllables under the machine. */
  const murmur = (peak: number, dest: AudioNode = voiceBus, n = 2 + Math.floor(Math.random() * 4)) => {
    for (let i = 0; i < n; i++) {
      const f0 = 190 + Math.random() * 70
      const d = 0.12 + Math.random() * 0.2
      tone(ctx, dest, { freq: f0, to: f0 * (0.85 + Math.random() * 0.25), type: 'triangle', env: { attack: 0.04, decay: d, peak: peak * 0.35 }, delay: i * 0.26 })
      burst(ctx, noise.pink, dest, { freq: 900 + Math.random() * 500, q: 3, env: { attack: 0.03, decay: d, peak: peak * 0.5 } })
    }
  }
  // Her voice in the kitchen, on her knees by the tiles: thin, close, unmuffled.
  const kitchenVoice = kit.spatial(-0.5, 0.9, -9.4, { ref: 1.5, rolloff: 0.6, category: 'sfx' })
  kitchenVoice.gain.gain.value = 1
  const moan = (peak: number) => {
    const f0 = 230 + Math.random() * 40
    tone(ctx, voiceBus, { freq: f0, to: f0 * 0.72, glide: 1.1, type: 'triangle', env: { attack: 0.25, decay: 1.0, peak: peak * 0.4 } })
    tone(ctx, voiceBus, { freq: f0 * 2.02, to: f0 * 1.45, glide: 1.1, env: { attack: 0.25, decay: 0.9, peak: peak * 0.08 } })
    burst(ctx, noise.pink, voiceBus, { freq: 700, q: 1.5, env: { attack: 0.3, decay: 1.0, peak: peak * 0.35 } })
  }
  const giggleAt = (peak: number, dest: AudioNode) => {
    for (let i = 0; i < 5; i++) {
      burst(ctx, noise.white, dest, { freq: 1700 + i * 60, q: 2, env: { attack: 0.005, decay: 0.06, peak: peak * (0.6 - i * 0.07) } })
      tone(ctx, dest, { freq: 330 - i * 12, type: 'triangle', env: { attack: 0.005, decay: 0.05, peak: peak * 0.15 }, delay: i * 0.12 })
    }
  }
  const giggle = (peak: number) => giggleAt(peak, voiceBus)
  const whisper = (peak: number) => {
    for (let i = 0; i < 4; i++) burst(ctx, noise.white, voiceBus, { freq: 3400 + Math.random() * 1600, q: 2.5, env: { attack: 0.05, decay: 0.18, peak } })
  }
  const bird = () => {
    const f0 = 2600 + Math.random() * 1800
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) tone(ctx, birdSpot.gain, { freq: f0, to: f0 * (1.2 + Math.random() * 0.3), glide: 0.07, env: { attack: 0.005, decay: 0.08, peak: 0.03 }, delay: i * 0.13 })
  }
  const car = () => {
    burst(ctx, noise.pink, fx, { freq: 300, q: 0.6, env: { attack: 1.4, decay: 2.2, peak: 0.07 } })
    tone(ctx, fx, { freq: 70, to: 55, glide: 3, env: { attack: 1.2, decay: 2.0, peak: 0.02 } })
  }
  const foot = (stairs: boolean, peak: number) => {
    burst(ctx, noise.brown, fx, { freq: 200, type: 'lowpass', env: { attack: 0.006, decay: 0.09, peak } })
    if (stairs) creak(fx, 260 + Math.random() * 180, peak * 0.9, 0.16 + Math.random() * 0.12)
  }

  const crossings = (from: number, to: number, frame: AudioFrame) => {
    const c = (seg: SegmentId, u: number) => from < at(seg, u) && to >= at(seg, u)
    const call = frame.flags.has('door:call')
    if (c('street', 0.08)) burst(ctx, noise.white, lampSpot.gain, { freq: 4200, q: 4, env: { attack: 0.002, decay: 0.08, peak: 0.05 } })
    if (c('wake', 0.08)) for (let i = 0; i < 3; i++) setTimeout(() => creak(fx, 420 - i * 30, 0.12, 0.12), i * 180)
    if (c('toilet', 0.08)) {
      creak(fx, 320, 0.14, 0.6)
      burst(ctx, noise.brown, fx, { freq: 400, type: 'lowpass', env: { attack: 0.003, decay: 0.08, peak: 0.08 } })
    }
    if (c('toilet', 0.5)) {
      whisper(0.03)
      setTimeout(() => moan(0.25), 600)
    }
    if (c('voice', 0.08)) giggle(0.25)
    if (c('voice', 0.45)) creak(machineBus, 210, 0.5, 0.3)
    if (c('landing', 0.05)) creak(fx, 300, 0.14, 0.55)
    if (c('words', 0.02)) murmur(0.9)
    if (c('words', 0.31)) murmur(0.9)
    if (c('words', 0.64)) murmur(1)
    if (c('words', 0.9)) giggle(0.6)
    if (c('enter', 0.04) && !call) creak(doorSpot.gain, 240, 0.45, 1.1)
    if (c('shout', 0.56)) thump(fx, 0.35, 220)
    if (c('trance', 0.1)) moan(0.6)
    if (c('trance', 0.55)) moan(0.5)
    if (c('close', 0.08) || (call && c('close', 0.06))) {
      thump(doorSpot.gain, 0.3, 300)
      burst(ctx, noise.white, doorSpot.gain, { freq: 3000, q: 3, env: { attack: 0.001, decay: 0.03, peak: 0.08 } })
    }
    if (c('close', 0.35)) for (let i = 0; i < 5; i++) setTimeout(() => creak(fx, 280 + i * 25, 0.12 * (1 - i * 0.17), 0.18), i * 420)
    for (const u of [0.1, 0.45, 0.8]) if (c('drag', u)) thump(machineSpot.gain, 0.6, 140)
    if (c('drag', 0.47)) wet(fx, 0.12, 0.6)
    for (const u of [0.06, 0.34, 0.61])
      if (c('thrice', u)) {
        thump(machineSpot.gain, 0.65, 140)
        setTimeout(() => wet(fx, 0.14, 0.55), 120)
      }
    if (c('fall', 0.04)) thump(machineSpot.gain, 0.75, 140)
    if (c('fall', 0.07)) {
      thump(fx, 0.5, 120)
      wet(fx, 0.1, 0.4)
    }
    if (c('fall', 0.12)) burst(ctx, noise.brown, machineBus, { freq: 500, type: 'lowpass', env: { attack: 0.003, decay: 0.2, peak: 0.3 } })
    if (c('fall', 0.5)) creak(machineBus, 190, 0.6, 0.4)
    if (c('sunrise', 0.08)) {
      burst(ctx, noise.white, lampSpot.gain, { freq: 3000, q: 2, env: { attack: 0.001, decay: 0.04, peak: 0.12 } })
      tone(ctx, lampSpot.gain, { freq: 100, to: 60, glide: 0.3, type: 'sawtooth', env: { attack: 0.001, decay: 0.3, peak: 0.03 } })
    }
    if (c('sunrise', 0.5)) bird()
    if (c('pieces', 0.6) || c('pieces', 0.62)) {
      burst(ctx, noise.white, voiceSpot.gain, { freq: 5200, q: 3, env: { attack: 0.001, decay: 0.05, peak: 0.12 } })
      tone(ctx, voiceSpot.gain, { freq: 2700, env: { attack: 0.001, decay: 0.04, peak: 0.02 } })
    }
    if (c('pieces', 0.66)) murmur(0.7)
    if (c('mutter', 0.04)) murmur(0.8)
    if (c('mutter', 0.31)) giggle(0.45)
    if (c('mutter', 0.66)) murmur(0.8)
    if (c('stitch', 0.5)) burst(ctx, noise.brown, machineBus, { freq: 500, type: 'lowpass', env: { attack: 0.003, decay: 0.2, peak: 0.25 } })
    if (c('wakeup', 0.04)) {
      car()
      bird()
    }
    if (c('answer', 0.04)) wet(fx, 0.06, 0.25)
    // Her answer: a thin, moaning murmur under the words, a breath of a giggle at the end.
    if (c('answer', 0.5)) {
      murmur(0.5, kitchenVoice.gain, 6)
      setTimeout(() => giggleAt(0.25, kitchenVoice.gain), 1900)
    }
    if (c('end', 0.1)) {
      burst(ctx, noise.pink, fx, { freq: 1600, type: 'lowpass', env: { attack: 0.01, decay: 0.6, peak: 0.14 } })
      setTimeout(() => wet(fx, 0.12, 0.9), 700)
      for (let i = 0; i < 6; i++) setTimeout(() => tone(ctx, fx, { freq: 1500 + Math.random() * 600, to: 1100, glide: 0.05, env: { attack: 0.001, decay: 0.07, peak: 0.03 } }), 1600 + i * 170)
    }
  }

  let lastP = -1
  let lastStep = 0
  let lastStitch = 0
  let dripClock = 0
  let voiceClock = 1.5
  let birdClock = 2

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) if (id !== 'whirr') layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)
      const run = motion.robots
      muffle.frequency.setTargetAtTime(evalNumber(MUFFLE, p), now, jumped ? 0.01 : 0.12)
      machineBus.gain.setTargetAtTime(evalNumber(LOUD, p) * (0.25 + 0.75 * run), now, 0.08)
      // The whirr dies when the machine stops.
      whirr.gain.setTargetAtTime(evalNumber(MIX.whirr, p) * run, now, 0.12)
      voiceMuffle.frequency.setTargetAtTime(Math.min(4000, evalNumber(MUFFLE, p) * 1.4), now, 0.1)
      const voice = evalNumber(VOICE, p)
      voiceBus.gain.setTargetAtTime(voice * 0.9, now, 0.2)

      // Needle and treadle on every stitch the picture shows.
      if (motion.frame !== lastStitch && run > 0.2 && !jumped) {
        tak(0.22)
        if (motion.frame % 2 === 0) creak(machineBus, motion.frame % 4 === 0 ? 210 : 175, 0.4, 0.2)
      }
      lastStitch = motion.frame

      // Murmurs and moans inside the rhythm.
      if (voice > 0.05) {
        voiceClock -= dt
        if (voiceClock <= 0) {
          voiceClock = 1.4 + Math.random() * 2.2
          const r = Math.random()
          if (r < 0.45) murmur(voice)
          else if (r < 0.8) moan(voice)
          else giggle(voice * 0.6)
        }
      }

      // The tap drips while we are in the toilet.
      const inToilet = (p >= SEG.toilet.start && p < at('voice', 0.44)) || (p >= SEG.landing.start && p < at('landing', 0.1))
      if (inToilet) {
        dripClock -= dt
        if (dripClock <= 0) {
          dripClock = 1.1 + Math.random() * 0.4
          drip()
        }
      }

      // Birds after first light.
      if (p > at('sunrise', 0.5)) {
        birdClock -= dt
        if (birdClock <= 0) {
          birdClock = 1.2 + Math.random() * 3
          bird()
        }
      }

      // Bare feet on boards (and the stairs, each tread its own creak).
      if (motion.step !== lastStep && motion.walking > 0.3 && !jumped) foot(motion.doors === 1, p >= SEG.wakeup.start ? 0.2 : 0.12)
      lastStep = motion.step

      if (!jumped && p > lastP) crossings(lastP, p, frame)
      lastP = p
    },
  }
}
