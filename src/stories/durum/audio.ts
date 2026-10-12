/**
 * DURUM's sound: an office in a basement at night. Room tone and the mains;
 * the server hall's fans through the glass (they breathe, cry, swell, go
 * shrill, spin down together, and stop); Ankara three floors down; the
 * coffee machine; a receipt printer; an old dot-matrix; a phone that buzzes
 * once on an empty desk. KELEBEK has its forest (wind, leaves, wing-beats, far
 * thunder) and the amber world's far rain. GÖZLEMCİ cuts everything to a soft
 * tick per scroll step. One piano note on the last card.
 *
 * Layer levels are functions of progress (scrolling back restores them);
 * one-shots fire only on forward, un-jumped crossings (docs/stories/durum.md §6;
 * every CAPTION in text.ts has its sound here).
 */
import { clamp, linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { TEXT } from './text'
import { at, SEG, TOTAL_SCREENS, type SegmentId } from './timeline'

type LayerId = 'room' | 'servers' | 'whine' | 'city' | 'corridor' | 'forest' | 'rain' | 'wash' | 'music'

const k = (p: number, v: number): Key<number> => [p, v, linear]
const Q0 = at('turn', 0.02)
const Q1 = at('freedom', 0.05)

/** Ambience per chapter. */
const MIX: Record<LayerId, Key<number>[]> = {
  room: [
    k(0, 0),
    k(at('open', 0.6), 0.32),
    k(at('forest'), 0.32),
    k(at('forest', 0.05), 0),
    k(at('forest', 0.95), 0),
    k(at('twoWorlds'), 0.32),
    k(at('computing', 0.06), 0.32),
    k(at('computing', 0.2), 0.12),
    k(at('meaning', 0.2), 0.3),
    k(Q0 - 0.0005, 0.3),
    k(Q0, 0),
    k(Q1, 0),
    k(at('freedom', 0.2), 0.3),
    k(at('gone', 0.5), 0.22),
    k(at('end'), 0.05),
    k(1, 0.03),
  ],
  servers: [
    k(0, 0),
    k(at('open', 0.3), 0.32),
    k(at('selin'), 0.32),
    k(at('selin', 0.03), 0.6),
    k(at('selin', 0.4), 0.36),
    k(at('forest'), 0.3),
    k(at('forest', 0.05), 0),
    k(at('forest', 0.95), 0),
    k(at('twoWorlds'), 0.3),
    k(at('hallWalk', 0.02), 0.32),
    k(at('hallWalk', 0.2), 0.75),
    k(at('heat', 0.04), 0.9),
    k(at('samePace', 1), 0.9),
    k(at('sealed'), 0.3),
    k(at('computing', 0.06), 0.3),
    k(at('computing', 0.16), 0.03),
    k(at('meaning', 0.1), 0.03),
    k(at('meaning', 0.3), 0.28),
    k(Q0 - 0.0005, 0.28),
    k(Q0, 0),
    k(Q1, 0),
    k(at('freedom', 0.25), 0.28),
    k(at('gone', 0.7), 0.28),
    k(at('gone', 0.75), 0.1),
    k(at('end'), 0.0),
  ],
  whine: [k(at('hallWalk', 0.1), 0), k(at('hallWalk', 0.5), 0.1), k(at('heat', 0.04), 0.25), k(at('heat', 1), 0.5), k(at('samePace', 1), 0.35), k(at('sealed'), 0)],
  city: [k(at('open', 0.2), 0), k(at('enter', 0.3), 0.18), k(at('lapse'), 0.18), k(at('lapse', 1), 0.1), k(at('forest'), 0.1), k(at('forest', 0.05), 0), k(at('forest', 0.95), 0), k(at('twoWorlds'), 0.1), k(Q0 - 0.0005, 0.1), k(Q0, 0), k(Q1, 0), k(at('freedom', 0.3), 0.08), k(at('end'), 0.25), k(1, 0.3)],
  corridor: [k(at('coat', 0.58), 0), k(at('coat', 0.66), 0.18), k(at('gone', 0.05), 0.18), k(at('gone', 0.12), 0)],
  forest: [k(at('forest'), 0), k(at('forest', 0.06), 0.55), k(at('forest', 0.94), 0.55), k(at('forest', 1), 0)],
  rain: [k(at('twoWorlds', 0.55), 0), k(at('twoWorlds', 0.7), 0.16), k(at('chain', 1), 0.16), k(at('knowable', 0.2), 0)],
  wash: [k(at('lapse'), 0), k(at('lapse', 0.06), 0.4), k(at('lapse', 0.5), 0.4), k(at('lapse', 0.53), 0.06), k(at('lapse', 0.6), 0.06), k(at('lapse', 0.64), 0.4), k(at('lapse', 0.92), 0.4), k(at('lapse', 1), 0)],
  music: [k(0, 0), k(at('end', 0.5), 0), k(at('end', 0.56), 0.7), k(1, 0.7)],
}

/** A minor colour, few notes. */
const NOTES = [196, 233.08, 261.63, 293.66, 349.23, 392, 466.16]

/** DURUM typing: per item, the windows where its lines type (a soft key tick per word). */
const TYPE_WINDOWS: Array<readonly [number, number, number]> = []
for (const t of TEXT) {
  if (t.kind !== 'machine' || t.slot !== 'rail') continue
  const seg = SEG[t.seg as SegmentId]
  const n = t.lines.length
  const stag = n > 1 ? (t.stagger ?? 0.8 / n) : 0
  const spanU = t.to - Math.max(0, t.from)
  const dur = Math.max(0.035, 0.16 * spanU)
  t.lines.forEach((l, i) => {
    const a = seg.start + seg.len * (Math.max(0, t.from) + i * stag * spanU)
    TYPE_WINDOWS.push([a, a + seg.len * dur, l.split(' ').length])
  })
}

/** Windows where someone is typing at a keyboard or a phone. */
const KEYS: ReadonlyArray<readonly [number, number]> = [
  [at('ritual', 0.0), at('ritual', 0.5)],
  [at('meaning', 0.86), at('meaning', 0.95)],
  [at('rebuild', 0.12), at('rebuild', 0.28)],
  [at('rebuild', 0.52), at('rebuild', 0.7)],
]
const THUMB: ReadonlyArray<readonly [number, number]> = [[at('coat', 0.03), at('coat', 0.2)]]

export function createDurumAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  // The office: air handling (brown noise, low) and the mains hum.
  const room = (layers.room = kit.layer(0.08))
  const rF = filter(ctx, 'lowpass', 320)
  kit.loop(noise.brown, rF, 0.7)
  rF.connect(room)
  kit.osc('sine', 50, room, 0.03)
  kit.osc('sine', 100, room, 0.01)

  // The hall: fans heard through the glass (bandpassed pink), a low drone, a whine on top.
  const hall = kit.spatial(-1, 1.6, -8.4, { ref: 3.5, send: 0.2 })
  layers.servers = hall.gain
  const fans = filter(ctx, 'bandpass', 650, 0.45)
  const fanSrc = kit.loop(noise.pink, fans, 1)
  fans.connect(hall.gain)
  kit.osc('sawtooth', 118, filter(ctx, 'lowpass', 380), 0.02).g.connect(hall.gain)
  // A thin high resonance (AYNA), near 3.2 kHz, rising with the heat.
  const whine = (layers.whine = kit.layer(0.1))
  const res = kit.osc('sine', 3200, whine, 0.025)
  kit.lfo(res.o.frequency, 0.11, 22)

  // Ankara, three floors down.
  const city = kit.spatial(9, -6, 0, { ref: 5, send: 0.25 })
  layers.city = city.gain
  const cF = filter(ctx, 'lowpass', 600)
  kit.loop(noise.pink, cF, 0.5)
  cF.connect(city.gain)

  // The corridor's tube, when the door is open.
  const corridor = kit.spatial(2.6, 2.6, 5.3, { ref: 1.5 })
  layers.corridor = corridor.gain
  kit.osc('square', 100, filter(ctx, 'bandpass', 1200, 3), 0.01).g.connect(corridor.gain)

  // Belgrad Ormanı: wind in the leaves, breathing.
  const forest = (layers.forest = kit.layer(0.3))
  const wF = filter(ctx, 'bandpass', 900, 0.4)
  kit.loop(noise.pink, wF, 0.8)
  const wG = ctx.createGain()
  wG.gain.value = 0.6
  wF.connect(wG).connect(forest)
  kit.lfo(wG.gain, 0.13, 0.35)
  const leaves = filter(ctx, 'highpass', 4200, 0.5)
  kit.loop(noise.white, leaves, 1)
  const lG = ctx.createGain()
  lG.gain.value = 0.08
  leaves.connect(lG).connect(forest)
  kit.lfo(lG.gain, 0.21, 0.06)

  // Far rain (it belongs to the amber world).
  const rain = (layers.rain = kit.layer(0.35))
  const rnF = filter(ctx, 'bandpass', 2600, 0.3)
  kit.loop(noise.white, rnF, 0.9)
  rnF.connect(rain)

  // The time-lapse: the room's fans compressed, faster, a soft whoosh.
  const wash = (layers.wash = kit.layer(0.2))
  const waF = filter(ctx, 'bandpass', 1400, 0.6)
  kit.loop(noise.pink, waF, 2.4)
  waF.connect(wash)
  kit.lfo(waF.frequency, 0.6, 500)

  // Places for one-shots.
  const at3 = (x: number, y: number, z: number, ref = 1.2) => {
    const sp = kit.spatial(x, y, z, { ref, category: 'sfx' })
    sp.gain.gain.value = 1
    return sp.gain
  }
  const desk = at3(0.3, 0.8, -0.4)
  const coffee = at3(-4.6, 1.0, 0.5)
  const door = at3(2.6, 1.2, 4.0, 1.5)
  const corridorFar = at3(2.0, 1.2, 6.0, 1.5)
  const printerOld = at3(-4.62, 0.9, 2.7)
  const kitchen = at3(-2.6, 1.1, 9.4, 1.5)
  const selinDesk = at3(3.2, 0.9, 1.4)
  const hallSpot = at3(-4.5, 1.2, -10.4, 2)
  const wd = at3(2.6, 1.55, -3.0, 2)
  const glassDoor = at3(-3.1, 1.1, -4.0, 1.5)

  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.62
  const fb = ctx.createGain()
  fb.gain.value = 0.36
  const dLp = filter(ctx, 'lowpass', 1400)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)

  let lastP = -1
  let lastStep = 0
  let gurgle = 0
  let rattle = 0
  let tap = 0
  let detector = 0
  let carClock = 6
  let typeClock = 0
  let thumbClock = 0
  let lastCount = 0
  let tickAcc = 0

  const click = (dest: AudioNode, freq: number, peak: number, delayS = 0) => tone(ctx, dest, { freq, type: 'square', env: { attack: 0.001, decay: 0.012, peak }, delay: delayS })
  const thud = (dest: AudioNode, freq: number, peak: number, decay = 0.16) => burst(ctx, noise.brown, dest, { freq, type: 'lowpass', env: { attack: 0.003, decay, peak } })
  const hiss = (dest: AudioNode, freq: number, peak: number, decay: number, q = 0.6) => burst(ctx, noise.pink, dest, { freq, q, env: { attack: 0.01, decay, peak } })
  const plop = (dest: AudioNode) => {
    tone(ctx, dest, { freq: 900, to: 420, glide: 0.06, env: { attack: 0.002, decay: 0.08, peak: 0.05 } })
    burst(ctx, noise.white, dest, { freq: 2600, q: 2, env: { attack: 0.001, decay: 0.03, peak: 0.03 } })
  }
  const shatter = (dest: AudioNode) => {
    burst(ctx, noise.white, dest, { freq: 4200, q: 0.8, type: 'highpass', env: { attack: 0.001, decay: 0.4, peak: 0.55 } })
    burst(ctx, noise.pink, dest, { freq: 900, q: 0.8, env: { attack: 0.001, decay: 0.14, peak: 0.4 } })
    for (let i = 0; i < 10; i++) tone(ctx, dest, { freq: 3000 + Math.random() * 4000, type: 'sine', env: { attack: 0.001, decay: 0.05 + Math.random() * 0.14, peak: 0.05 }, delay: 0.04 + Math.random() * 0.7 })
  }
  const buzz = (dest: AudioNode, reps: number, gap = 0.7) => {
    const f = filter(ctx, 'lowpass', 380)
    f.connect(dest)
    for (let i = 0; i < reps; i++) tone(ctx, f, { freq: 150, type: 'sawtooth', env: { attack: 0.01, decay: 0.38, peak: 0.08 }, delay: i * gap })
    thud(dest, 220, 0.06, 0.3)
  }
  const ring = (dest: AudioNode, times: number) => {
    // A phone ringing through a wall: two-tone, muffled.
    const f = filter(ctx, 'lowpass', 900)
    f.connect(dest)
    for (let i = 0; i < times; i++)
      for (let j = 0; j < 8; j++) tone(ctx, f, { freq: j % 2 ? 1300 : 1100, type: 'triangle', env: { attack: 0.004, decay: 0.05, peak: 0.03 }, delay: i * 2.2 + j * 0.06 })
  }
  const thunder = (peak: number) => {
    burst(ctx, noise.brown, fx, { freq: 120, type: 'lowpass', env: { attack: 0.3, decay: 3.5, peak } })
    burst(ctx, noise.brown, fx, { freq: 60, type: 'lowpass', env: { attack: 0.8, decay: 4.5, peak: peak * 0.8 } })
  }
  const cry = () => {
    // The cooling unit's "crying": a whine that falls in pitch, three sobs.
    const f = filter(ctx, 'lowpass', 1600)
    f.connect(hallSpot)
    for (let i = 0; i < 3; i++) tone(ctx, f, { freq: 880 - i * 40, to: 520 - i * 30, glide: 0.75, type: 'sawtooth', env: { attack: 0.08, decay: 0.75, peak: 0.05 }, delay: i * 0.85 })
  }
  const note = (n: number, peak = 0.03, decay = 4) => tone(ctx, keys, { freq: n, env: { attack: 0.01, decay, peak } })

  const crossings = (from: number, to: number, flags: ReadonlySet<string>) => {
    const crossed = (t: number) => from < t && to >= t
    const x = (seg: SegmentId, f: number) => crossed(at(seg, f))
    // 01 İBLİS
    if (x('enter', 0.03)) {
      click(door, 1500, 0.04)
      hiss(door, 400, 0.08, 0.5)
    }
    if (x('enter', 0.2)) {
      thud(door, 180, 0.3)
      click(door, 1400, 0.04, 0.05)
    }
    if (x('enter', 0.55)) hiss(at3(3.95, 1.7, 3.45), 1800, 0.05, 0.25, 2)
    if (x('enter', 0.72)) click(desk, 2600, 0.04)
    if (x('enter', 0.8)) thud(desk, 900, 0.06, 0.05)
    if (x('coffee', 0.04)) gurgle = 6
    if (x('coffee', 0.76)) plop(coffee)
    if (x('coffee', 0.86)) plop(coffee)
    if (x('coffee', 0.9)) for (let i = 0; i < 5; i++) tone(ctx, coffee, { freq: 2600 + Math.random() * 400, env: { attack: 0.001, decay: 0.06, peak: 0.02 }, delay: i * 0.18 })
    // 02 KÜÇÜK SORULAR
    if (x('ritual', 0.8)) hiss(selinDesk, 3000, 0.07, 0.4, 0.8)
    if (x('traffic', 0.5)) tone(ctx, desk, { freq: 2200, to: 900, glide: 0.25, type: 'square', env: { attack: 0.005, decay: 0.25, peak: 0.012 } })
    if (x('thumb', 0.55)) {
      const f = filter(ctx, 'bandpass', 2400, 2)
      f.connect(desk)
      tone(ctx, f, { freq: 220, type: 'sawtooth', env: { attack: 0.01, decay: 0.45, peak: 0.06 } })
    }
    if (x('thumb', 0.96)) for (let i = 0; i < 6; i++) tone(ctx, desk, { freq: 4200 + i * 37, env: { attack: 0.001, decay: 0.6, peak: 0.02 }, delay: i * 0.06 })
    if (x('palm', 0.02)) thud(desk, 600, 0.06, 0.05)
    if (x('palm', 0.14)) burst(ctx, noise.white, desk, { freq: 3800, q: 1.2, env: { attack: 0.002, decay: 0.1, peak: 0.08 } })
    if (x('palm', 0.7)) note(NOTES[0], 0.02, 5)
    // 03 KEHANET
    if (x('envelope', 0.06)) rattle = 2.6
    if (x('envelope', 0.35)) thud(printerOld, 400, 0.08)
    if (x('envelope', 0.42)) thud(printerOld, 250, 0.12, 0.1)
    if (x('envelope', 0.45)) {
      thud(printerOld, 700, 0.05, 0.06)
      hiss(printerOld, 2000, 0.04, 0.12)
    }
    if (x('contrary', 0.55)) thud(desk, 500, 0.07, 0.08)
    if (x('contrary', 0.72)) click(desk, 1900, 0.025)
    if (flags.has('glass:break') && x('glassChoice', 0.56)) shatter(desk)
    if (flags.has('glass:kitchen') && x('opened', 0.08)) burst(ctx, noise.white, kitchen, { freq: 1500, q: 0.5, env: { attack: 0.08, decay: 2.4, peak: 0.08 } })
    if (flags.has('glass:kitchen') && x('opened', 0.3)) thud(kitchen, 260, 0.18)
    if (x('opened', 0.44)) burst(ctx, noise.white, desk, { freq: 3200, q: 0.8, env: { attack: 0.02, decay: 0.35, peak: 0.1 } })
    if (x('opened', 0.86)) note(NOTES[2], 0.02, 5)
    if (x('selin', 0.03)) cry()
    // 04 İKİ KUTU
    if (x('boxes', 0.03)) click(door, 1500, 0.03)
    if (x('boxes', 0.3)) {
      thud(desk, 220, 0.18)
      thud(desk, 300, 0.12)
    }
    if (x('choose', 0.6)) burst(ctx, noise.white, desk, { freq: 3600, q: 1.2, env: { attack: 0.002, decay: 0.16, peak: 0.09 } })
    if (x('choose', 0.66)) tone(ctx, desk, { freq: 320, to: 260, glide: 0.3, type: 'sawtooth', env: { attack: 0.02, decay: 0.3, peak: 0.02 } })
    if (x('after', 0.74)) note(NOTES[1] / 2, 0.04, 6)
    // 05 BELİRSİZLİK
    if (x('lapse', 0.55)) buzz(desk, 1)
    if (x('cloud', 0.48)) click(wd, 3200, 0.03)
    if (x('odds', 0.1)) note(NOTES[3], 0.025, 6)
    // 06 KELEBEK
    if (x('forest', 0.62)) for (let i = 0; i < 9; i++) burst(ctx, noise.pink, fx, { freq: 300, q: 1, env: { attack: 0.005, decay: 0.05, peak: 0.08 }, pan: -0.2 - i * 0.04 })
    if (x('forest', 0.2)) thunder(0.12)
    if (flags.has('cf:air') && x('chain', 0.3)) thunder(0.22)
    if (flags.has('cf:bus') && x('chain', 0.1)) {
      hiss(fx, 1200, 0.12, 0.6, 0.8)
      tone(ctx, fx, { freq: 60, to: 90, glide: 2, type: 'sawtooth', env: { attack: 0.3, decay: 2.5, peak: 0.05 } })
    }
    if (x('chain', 0.75)) ring(corridorFar, 4)
    if (x('knowable', 0.65)) note(NOTES[0] / 2, 0.035, 6)
    // 07 AYNA
    if (x('hallWalk', 0.08)) {
      click(glassDoor, 1300, 0.03)
      hiss(glassDoor, 500, 0.1, 0.6)
    }
    if (x('heat', 0.62)) click(hallSpot, 2400, 0.03)
    if (x('samePace', 0.1)) note(NOTES[5], 0.025, 6)
    // 08 BÜYÜK SORU
    if (x('computing', 0.06)) tone(ctx, hall.gain, { freq: 140, to: 40, glide: 3, type: 'sawtooth', env: { attack: 0.05, decay: 3.2, peak: 0.08 } })
    if (x('computing', 0.53)) note(NOTES[4], 0.025, 5)
    if (x('rebuild', 0.72)) thud(desk, 1200, 0.05, 0.04)
    // 09 GÖZLEMCİ
    if (x('input', 0.5)) {
      tone(ctx, fx, { freq: 880, env: { attack: 0.01, decay: 0.5, peak: 0.03 } })
      tone(ctx, fx, { freq: 1320, env: { attack: 0.01, decay: 0.6, peak: 0.02 }, delay: 0.18 })
    }
    // 10 SON SORU
    if (x('message', 0.04)) {
      thud(desk, 900, 0.05, 0.05)
      tone(ctx, desk, { freq: 1760, env: { attack: 0.002, decay: 0.15, peak: 0.012 }, delay: 0.1 })
    }
    if (x('coat', 0.2)) hiss(desk, 2400, 0.04, 0.25, 1.5)
    if (x('coat', 0.45)) hiss(at3(3.95, 1.7, 3.45), 1500, 0.06, 0.4, 1.4)
    if (x('coat', 0.62)) click(door, 1500, 0.04)
    if (x('gone', 0.08)) {
      thud(door, 180, 0.3)
      click(door, 1400, 0.04, 0.05)
    }
    if (flags.has('end:yes') && x('gone', 0.12)) for (let i = 0; i < 4; i++) tone(ctx, corridorFar, { freq: 190 + i * 6, to: 160, glide: 0.18, type: 'triangle', env: { attack: 0.02, decay: 0.16, peak: 0.02 }, delay: i * 0.2 })
    for (const f0 of [0.45, 0.52, 0.58, 0.64, 0.8]) if (x('gone', f0)) click(f0 === 0.8 ? wd : desk, 900, 0.03)
    if (x('gone', 0.7)) tone(ctx, hall.gain, { freq: 120, to: 70, glide: 1.4, type: 'sawtooth', env: { attack: 0.05, decay: 1.6, peak: 0.04 } })
    if (x('end', 0.1)) burst(ctx, noise.pink, city.gain, { freq: 500, q: 0.6, env: { attack: 1.4, decay: 2.8, peak: 0.3 } })
    if (x('end', 0.55)) tone(ctx, keys, { freq: NOTES[0], env: { attack: 0.01, decay: 9, peak: 0.07 } })
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion, flags } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.2)
      const quiet = p >= Q0 && p < Q1
      // The fans' pitch: faster in the time-lapse, spinning down while it thinks, shrill with the heat.
      const spin = p >= at('computing', 0.06) && p < at('meaning', 0.2) ? 0.35 : p >= at('heat') && p < at('sealed') ? 1.3 : 1
      fanSrc.playbackRate.setTargetAtTime(spin, now, p >= at('computing', 0.06) && p < at('computing', 0.3) ? 1.2 : 0.3)
      // Corridor door (the scene reports how open it is).
      corridor.gain.gain.setTargetAtTime(Math.max(evalNumber(MIX.corridor, p), 0.18 * motion.doors), now, 0.1)

      if (!quiet) {
        if (gurgle > 0) {
          gurgle -= dt
          if (Math.random() < dt * 9) burst(ctx, noise.brown, coffee, { freq: 300 + Math.random() * 500, q: 3, env: { attack: 0.01, decay: 0.08 + Math.random() * 0.1, peak: 0.1 } })
        }
        if (rattle > 0) {
          rattle -= dt
          tap -= dt
          if (tap <= 0) {
            tap = 0.035 + Math.random() * 0.02
            burst(ctx, noise.white, printerOld, { freq: 2800, q: 2, env: { attack: 0.001, decay: 0.02, peak: 0.05 } })
          }
        }
        // DURUM typing: a soft key tick per word, while a line is being typed.
        const win = TYPE_WINDOWS.find(([a, b]) => p >= a && p < b)
        if (win && !jumped && p > lastP) {
          typeClock -= dt
          if (typeClock <= 0) {
            typeClock = 0.09 + Math.random() * 0.06
            click(wd, 2400 + Math.random() * 500, 0.006)
          }
        }
        if (KEYS.some(([a, b]) => p >= a && p < b)) {
          typeClock -= dt
          if (typeClock <= 0) {
            typeClock = 0.07 + Math.random() * 0.14 + (Math.random() < 0.12 ? 0.35 : 0)
            click(p < at('sealed') ? selinDesk : desk, 1700 + Math.random() * 900, 0.01)
          }
        }
        if (THUMB.some(([a, b]) => p >= a && p < b)) {
          thumbClock -= dt
          if (thumbClock <= 0) {
            thumbClock = 0.12 + Math.random() * 0.1
            click(desk, 3200, 0.004)
          }
        }
        // The tally counter: a click per car counted.
        if (p >= at('traffic') && p < at('traffic', 0.62)) {
          const u = (p - SEG.traffic.start) / SEG.traffic.len
          const n = u < 0.5 ? Math.round(212 * clamp((u - 0.05) / 0.45) * 0.86) : u < 0.52 ? 0 : Math.round(212 * clamp((u - 0.52) / 0.08))
          if (n > lastCount && !jumped) click(desk, 2100, 0.02)
          lastCount = n
        }
        // Detector clicks under the atom: sparse, irregular.
        if (p >= at('atom', 0.05) && p < at('atom', 1)) {
          detector -= dt
          if (detector <= 0) {
            detector = 0.08 + Math.random() * Math.random() * 1.6
            click(wd, 1800 + Math.random() * 1200, 0.02)
          }
        }
        if (evalNumber(MIX.city, p) > 0.05) {
          carClock -= dt
          if (carClock <= 0) {
            carClock = 8 + Math.random() * 12
            burst(ctx, noise.pink, city.gain, { freq: 500, q: 0.6, env: { attack: 1.2, decay: 2.4, peak: 0.22 } })
          }
        }
        // Footsteps: soft on carpet, harder on the hall's tile and the pavement.
        if (motion.step !== lastStep && motion.walking > 0.35 && !jumped) {
          const hard = (p >= at('hallWalk', 0.15) && p < at('sealed')) || p >= at('end')
          burst(ctx, noise.brown, fx, { freq: hard ? 900 : 260, type: hard ? 'bandpass' : 'lowpass', q: 1, env: { attack: 0.004, decay: hard ? 0.06 : 0.08, peak: hard ? 0.07 : 0.09 }, pan: motion.step % 2 ? 0.1 : -0.1 })
        }
      } else if (!jumped && p !== lastP) {
        // GÖZLEMCİ: nothing but a soft tick for each scroll step the reader makes.
        tickAcc += Math.abs(p - lastP) * TOTAL_SCREENS
        if (tickAcc > 0.07) {
          tickAcc = 0
          click(fx, 2600, 0.012)
        }
      }
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p, flags)
      lastP = p
    },
  }
}
