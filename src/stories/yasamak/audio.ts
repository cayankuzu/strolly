/**
 * YAŞAMAK's sound: an internet cafe across a life. One monitor's hum and the
 * wind in the dark; the child's afternoon (a ceiling fan, clacky keys, game
 * bleeps, two boys laughing, birds and traffic through the window); the wall
 * clock that from the time-lapse on never stops ticking behind him; a room's
 * murmur that thins as people leave. Every departure is the same soft alert,
 * a chair pushed back, steps, the two-tone bell, a cold gust. Then knitting
 * needles, two taps on a monitor, a laugh; and in the end two keyboards
 * together and a chord that resolves.
 *
 * Positional: keyboards at the desks, the clock on the wall behind everyone,
 * the bell over the door, the street at the window.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { SEG, at, type SegmentId } from './timeline'

type LayerId = 'hum' | 'wind' | 'street' | 'fan' | 'murmur' | 'music' | 'drone' | 'cicada'

const k = (p: number, v: number): Key<number> => [p, v, linear]
const s = (seg: SegmentId, u: number, v: number) => k(at(seg, u), v)

const MIX: Record<LayerId, Key<number>[]> = {
  // The monitor's hum: present in the dark, faint under everything after.
  hum: [
    s('open', 0, 0.5),
    s('neck', 1, 0.45),
    s('recess', 0, 0.12),
    s('years', 0.5, 0.12),
    s('years', 0.6, 0.2),
    s('witness', 0, 0.2),
    s('witness', 0.5, 0.32),
    s('illusion', 1, 0.3),
    s('mother', 0, 0.15),
    s('final', 1, 0.1),
  ],
  wind: [
    s('open', 0, 0.35),
    s('neck', 0.4, 0.3),
    s('neck', 0.5, 0.7),
    s('neck', 0.85, 0.3),
    s('neck', 1, 0.25),
    s('recess', 0, 0),
    s('soul', 0, 0),
    s('soul', 0.1, 0.15),
    s('look', 1, 0.15),
    s('bulmaz', 1, 0.15),
    s('grandpa', 0, 0.05),
    s('father', 0, 0.2),
    s('illusion', 1, 0.2),
    s('mother', 0, 0.06),
    s('instant', 1, 0.06),
    s('spring', 0, 0),
  ],
  street: [
    s('open', 0, 0.06),
    s('neck', 1, 0.08),
    s('recess', 0, 0.4),
    s('pocket', 1, 0.35),
    s('dusk', 0.2, 0.45),
    s('dusk', 1, 0.25),
    s('years', 0, 0.3),
    s('soul', 0, 0.2),
    s('look', 1, 0.15),
    s('grandpa', 0, 0.08),
    s('friend', 0, 0.25),
    s('friend', 0.74, 0.25),
    s('friend', 0.76, 0.02),
    s('lighter', 0.1, 0.05),
    s('father', 0, 0.04),
    s('illusion', 1, 0.03),
    s('mother', 0, 0.1),
    s('instant', 1, 0.12),
    s('spring', 0, 0.35),
    s('final', 1, 0.25),
  ],
  fan: [s('recess', 0, 0.3), s('dusk', 1, 0.25), s('years', 0.45, 0.2), s('years', 0.55, 0)],
  murmur: [
    s('open', 0, 0),
    s('recess', 0.1, 0),
    s('recess', 0.3, 0.12),
    s('dusk', 1, 0.1),
    s('years', 0.3, 0.15),
    s('years', 0.9, 0.08),
    s('counter', 1, 0.1),
    s('look', 0.1, 0.32),
    s('bell', 1, 0.32),
    s('disease', 0.45, 0.3),
    s('disease', 0.6, 0.03),
    s('disease', 1, 0.03),
    s('bulmaz', 0, 0.28),
    s('friend', 0.74, 0.2),
    s('friend', 0.76, 0),
    s('lighter', 0.1, 0.08),
    s('father', 1, 0.05),
    s('witness', 0, 0),
    s('illusion', 1, 0),
    s('mother', 0, 0.04),
    s('instant', 1, 0.03),
    s('spring', 0, 0.12),
    s('spring', 0.3, 0.32),
    s('final', 1, 0.3),
  ],
  music: [
    s('open', 0, 0.12),
    s('neck', 1, 0.15),
    s('recess', 0, 0),
    s('years', 0, 0.2),
    s('years', 1, 0.12),
    s('dash', 1, 0.06),
    s('disease', 0.4, 0.06),
    s('disease', 0.6, 0.25),
    s('bulmaz', 0.4, 0.06),
    s('witness', 0, 0.15),
    s('traces', 0, 0.22),
    s('illusion', 1, 0.28),
    s('mother', 0, 0.1),
    s('days', 0, 0.25),
    s('instant', 0.6, 0.3),
    s('instant', 1, 0.12),
    s('defiance', 0.4, 0.15),
    s('final', 0, 0.35),
    s('final', 1, 0.3),
  ],
  drone: [s('disease', 0.45, 0), s('disease', 0.55, 0.32), s('disease', 1, 0.25), s('bulmaz', 0.05, 0)],
  cicada: [s('years', 0, 0), s('friend', 0, 0.12), s('friend', 0.74, 0.12), s('friend', 0.78, 0), s('lighter', 1, 0)],
}

/** A sparse piano (the old story's voice, kept). */
const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]
const DESKS: Array<[number, number, number]> = [
  [-3.75, -0.15, 1],
  [-2.25, -0.15, 2],
  [-0.75, -0.15, 3],
  [0.75, -0.15, 4],
  [2.25, -0.15, 5],
  [3.75, -0.15, 6],
  [-4.5, -2.35, 7],
  [-3, -2.35, 8],
  [-1.5, -2.35, 9],
  [0, -2.35, 10],
  [1.5, -2.35, 11],
  [3, -2.35, 12],
  [4.5, -2.35, 13],
]

/** Who is typing, by stretch of the story (desk numbers). */
function typists(p: number): number[] {
  if (p < SEG.recess.start) return []
  if (p < at('play', 0.18)) return [7, 8, 10, 12, 13]
  if (p < at('zero', 0.2)) return [3, 4, 7, 8, 10, 12, 13]
  if (p < SEG.years.start) return [7, 8, 10, 12, 13]
  if (p < at('years', 0.55)) return []
  if (p < SEG.look.start) return [4, 1, 7, 12, 13]
  if (p < SEG.disease.start) return [1, 2, 3, 4, 6, 7, 8, 10, 12, 13]
  if (p < SEG.disease.end) return []
  if (p < at('friend', 0.74)) return [1, 2, 4, 7, 8, 10, 12, 13]
  if (p < SEG.witness.start) return [1, 7, 4]
  if (p < SEG.spring.start) return []
  if (p < at('defiance', 0.3)) return [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13]
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]
}

export function createYasamakAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  // Monitor hum: a 50 Hz family and a high whine.
  const hum = (layers.hum = kit.layer(0.05))
  const hF = filter(ctx, 'lowpass', 400)
  hF.connect(hum)
  kit.osc('sine', 100, hF, 0.05)
  kit.osc('sine', 150, hF, 0.02)
  kit.osc('sine', 15600, hum, 0.0015)

  // Wind outside (autumn and winter), breathing.
  const wind = kit.spatial(0, 2, -6.5, { send: 0.2, ref: 4 })
  layers.wind = wind.gain
  const wF = filter(ctx, 'bandpass', 520, 0.6)
  kit.loop(noise.pink, wF, 0.8)
  const wG = ctx.createGain()
  wG.gain.value = 0.7
  kit.lfo(wG.gain, 0.17, 0.35)
  wF.connect(wG).connect(wind.gain)

  // The street through the window.
  const street = kit.spatial(0, 1.5, -7, { send: 0.12, ref: 3 })
  layers.street = street.gain
  const sF = filter(ctx, 'bandpass', 330, 0.5)
  kit.loop(noise.brown, sF, 0.9)
  sF.connect(street.gain)

  // The ceiling fans (child era).
  const fan = (layers.fan = kit.layer(0.05))
  const fF = filter(ctx, 'lowpass', 300)
  kit.loop(noise.brown, fF, 0.6)
  const fG = ctx.createGain()
  fG.gain.value = 0.6
  kit.lfo(fG.gain, 4.5, 0.25)
  fF.connect(fG).connect(fan)

  // A room's murmur.
  const murmur = (layers.murmur = kit.layer(0.25))
  const mF = filter(ctx, 'bandpass', 480, 0.9)
  kit.loop(noise.pink, mF, 1.1)
  const mG = ctx.createGain()
  mG.gain.value = 0.7
  kit.lfo(mG.gain, 0.37, 0.25)
  mF.connect(mG).connect(murmur)

  // Summer cicadas through the window.
  const cicada = kit.spatial(-2.5, 3, -9, { send: 0.1, ref: 4 })
  layers.cicada = cicada.gain
  const cF = filter(ctx, 'bandpass', 5200, 4)
  kit.loop(noise.white, cF, 1)
  const cG = ctx.createGain()
  cG.gain.value = 0.5
  kit.lfo(cG.gain, 18, 0.45)
  cF.connect(cG).connect(cicada.gain)

  // The music: a piano through a soft delay, and one held low note.
  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.62
  const fb = ctx.createGain()
  fb.gain.value = 0.32
  const dLp = filter(ctx, 'lowpass', 1500)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)
  const drone = (layers.drone = kit.layer(0.5, 'music'))
  const dF = filter(ctx, 'lowpass', 500)
  dF.connect(drone)
  kit.osc('sine', 65.41, dF, 0.35)
  kit.osc('triangle', 130.81, dF, 0.06)

  // Places in the room.
  const clock = kit.spatial(0, 2.3, 4.93, { ref: 1.4, category: 'sfx' })
  clock.gain.gain.value = 1
  const bell = kit.spatial(3.3, 2.2, 4.86, { ref: 2, category: 'sfx' })
  bell.gain.gain.value = 1
  const door = kit.spatial(3.5, 1.2, 5, { ref: 2, category: 'sfx' })
  door.gain.gain.value = 1
  const counter = kit.spatial(-3.2, 1.1, 4.0, { ref: 1.5, category: 'sfx' })
  counter.gain.gain.value = 1
  const desks = DESKS.map(([x, z]) => {
    const sp = kit.spatial(x, 0.8, z, { ref: 1.1, category: 'sfx' })
    sp.gain.gain.value = 1
    return sp.gain
  })
  const deskOut = (n: number) => desks[n - 1]
  const window = kit.spatial(0, 2, -5.5, { ref: 3, category: 'sfx' })
  window.gain.gain.value = 1

  const ringBell = (far = 1) => {
    tone(ctx, bell.gain, {
      freq: 2093,
      env: { attack: 0.002, decay: 1.1, peak: 0.035 * far },
    })
    tone(ctx, bell.gain, {
      freq: 2637,
      env: { attack: 0.002, decay: 0.9, peak: 0.025 * far },
      delay: 0.11,
    })
    tone(ctx, bell.gain, {
      freq: 2093,
      env: { attack: 0.002, decay: 0.6, peak: 0.012 * far },
      delay: 0.32,
    })
  }
  const creak = () =>
    tone(ctx, door.gain, {
      freq: 180,
      to: 260,
      glide: 0.7,
      type: 'sawtooth',
      env: { attack: 0.08, decay: 0.7, peak: 0.006 },
    })
  const gust = (amt = 1) =>
    burst(ctx, noise.pink, door.gain, {
      freq: 700,
      q: 0.4,
      env: { attack: 0.25, decay: 1.4, peak: 0.12 * amt },
    })
  const alert = (out: AudioNode) => {
    tone(ctx, out, {
      freq: 784,
      env: { attack: 0.01, decay: 0.5, peak: 0.022 },
    })
    tone(ctx, out, {
      freq: 587.33,
      env: { attack: 0.01, decay: 0.8, peak: 0.02 },
      delay: 0.22,
    })
  }
  const chair = (out: AudioNode) =>
    burst(ctx, noise.brown, out, {
      freq: 260,
      type: 'lowpass',
      env: { attack: 0.02, decay: 0.35, peak: 0.18 },
    })
  const laugh = (out: AudioNode, pitch: number, n = 5) => {
    for (let i = 0; i < n; i++) {
      const t = i * 0.13 + Math.random() * 0.02
      const f = pitch * (1 - i * 0.04)
      setTimeout(() => {
        burst(ctx, noise.white, out, {
          freq: f * 2.4,
          q: 6,
          env: { attack: 0.01, decay: 0.08, peak: 0.03 },
        })
        tone(ctx, out, {
          freq: f,
          type: 'triangle',
          env: { attack: 0.01, decay: 0.09, peak: 0.012 },
        })
      }, t * 1000)
    }
  }
  const coins = (out: AudioNode, n = 6) => {
    for (let i = 0; i < n; i++)
      tone(ctx, out, {
        freq: 3200 + Math.random() * 2400,
        env: { attack: 0.001, decay: 0.12 + Math.random() * 0.1, peak: 0.012 },
        delay: i * 0.05 + Math.random() * 0.04,
      })
  }
  const keyClack = (out: AudioNode, n = 4) => {
    for (let i = 0; i < n; i++)
      setTimeout(
        () =>
          burst(ctx, noise.white, out, {
            freq: 1800 + Math.random() * 800,
            q: 2,
            env: { attack: 0.001, decay: 0.03, peak: 0.05 },
          }),
        i * 110,
      )
  }
  const chime = (out: AudioNode) => {
    tone(ctx, out, {
      freq: 659.25,
      env: { attack: 0.005, decay: 0.3, peak: 0.02 },
    })
    tone(ctx, out, {
      freq: 987.77,
      env: { attack: 0.005, decay: 0.45, peak: 0.018 },
      delay: 0.12,
    })
  }
  const lighterClick = (out: AudioNode) =>
    burst(ctx, noise.white, out, {
      freq: 4200,
      q: 3,
      env: { attack: 0.001, decay: 0.025, peak: 0.06 },
    })

  let lastP = -1
  let lastStep = 0
  let tick = 0
  let typing = 0.3
  let bleep = 1
  let bird = 2
  let needle = 0.5
  let note = 3
  let lidT = 1

  const crossings = (from: number, to: number, flags: ReadonlySet<string>) => {
    const crossed = (seg: SegmentId, u: number) => from < at(seg, u) && to >= at(seg, u)
    const more = flags.has('kid:more')
    // The door and its bell.
    if (crossed('neck', 0.44)) {
      creak()
      ringBell()
    }
    if (crossed('neck', 0.5)) gust(1.2)
    if (crossed('recess', 0.05)) ringBell()
    if (crossed('dusk', 0.3)) ringBell()
    if (crossed('dusk', 0.64)) ringBell(0.5)
    if (crossed('bell', 0.08)) {
      ringBell()
      gust(0.8)
    }
    if (crossed('grandpa', 0.93)) {
      ringBell()
      gust(1)
    }
    if (crossed('friend', 0.97)) ringBell(0.35)
    if (crossed('father', 0.92)) {
      ringBell()
      gust(0.9)
    }
    if (crossed('instant', 0.62)) {
      ringBell()
      gust(1)
    }
    if (crossed('spring', 0.05)) {
      ringBell()
      gust(0.5)
    }
    // The child's afternoon.
    if (crossed('recess', 0.62)) {
      burst(ctx, noise.brown, counter.gain, {
        freq: 900,
        type: 'lowpass',
        env: { attack: 0.001, decay: 0.12, peak: 0.25 },
      })
      laugh(counter.gain, 330, 6)
      laugh(counter.gain, 380, 5)
    }
    if (crossed('coins', 0.07) || crossed('spring', 0.4)) coins(counter.gain, 7)
    if (crossed('coins', 0.56) || crossed('spring', 0.62)) keyClack(counter.gain, 5)
    if (crossed('play', 0.12) || crossed('newboy', 0.3)) chime(deskOut(crossed('newboy', 0.3) ? 3 : 4))
    if (crossed('zero', 0.18)) {
      tone(ctx, deskOut(4), {
        freq: 220,
        type: 'square',
        env: { attack: 0.005, decay: 0.25, peak: 0.012 },
      })
      tone(ctx, deskOut(3), {
        freq: 207,
        type: 'square',
        env: { attack: 0.005, decay: 0.25, peak: 0.012 },
        delay: 0.18,
      })
    }
    if (crossed('zero', 0.62)) {
      laugh(deskOut(4), 340, 6)
      laugh(deskOut(3), 300, 5)
    }
    if (more && crossed('dusk', 0.02)) {
      coins(counter.gain, 1)
      keyClack(counter.gain, 1)
    }
    if (more && crossed('dusk', 0.3))
      tone(ctx, deskOut(4), {
        freq: 220,
        type: 'square',
        env: { attack: 0.005, decay: 0.25, peak: 0.01 },
      })
    if (crossed('dusk', 0.1))
      tone(ctx, window.gain, {
        freq: 110,
        to: 160,
        glide: 2.5,
        type: 'sawtooth',
        env: { attack: 0.6, decay: 2.2, peak: 0.004 },
      })
    // The counter, now.
    if (crossed('counter', 0.02))
      burst(ctx, noise.brown, counter.gain, {
        freq: 500,
        type: 'lowpass',
        env: { attack: 0.002, decay: 0.08, peak: 0.12 },
      })
    for (const u of [0.5, 0.55])
      if (crossed('counter', u))
        burst(ctx, noise.pink, counter.gain, {
          freq: 1500,
          q: 1,
          env: { attack: 0.001, decay: 0.04, peak: 0.08 },
        })
    // The couple and the baby.
    if (crossed('bell', 0.3))
      tone(ctx, deskOut(6), {
        freq: 820,
        to: 1100,
        glide: 0.4,
        env: { attack: 0.05, decay: 0.5, peak: 0.012 },
      })
    // Departures: the same soft alert, a chair, the bell.
    if (crossed('grandpa', 0.05)) alert(deskOut(9))
    if (crossed('grandpa', 0.3)) chair(deskOut(9))
    if (crossed('friend', 0.75)) alert(deskOut(3))
    if (crossed('friend', 0.87)) chair(deskOut(3))
    if (crossed('father', 0.05)) alert(deskOut(11))
    if (crossed('father', 0.62)) chair(deskOut(11))
    if (crossed('instant', 0.04)) alert(deskOut(5))
    if (crossed('instant', 0.5)) chair(deskOut(5))
    // The lighter: one click, a small flame.
    if (crossed('lighter', 0.58)) lighterClick(deskOut(3))
    if (crossed('lighter', 0.6)) {
      lighterClick(deskOut(3))
      burst(ctx, noise.pink, deskOut(3), {
        freq: 900,
        q: 0.7,
        env: { attack: 0.02, decay: 0.4, peak: 0.04 },
      })
    }
    if (crossed('lighter', 0.88)) lighterClick(deskOut(3))
    // A screen wakes; a monitor buzzes; two taps.
    if (crossed('scores', 0.05)) chime(deskOut(3))
    for (const [seg, u] of [
      ['dims', 0.05],
      ['dims', 0.45],
      ['turn', 0.6],
    ] as const)
      if (crossed(seg, u))
        tone(ctx, deskOut(5), {
          freq: 96,
          type: 'sawtooth',
          env: { attack: 0.01, decay: 0.35, peak: 0.01 },
        })
    for (const u of [0.62, 0.67])
      if (crossed('dims', u))
        burst(ctx, noise.brown, deskOut(5), {
          freq: 700,
          type: 'lowpass',
          env: { attack: 0.001, decay: 0.07, peak: 0.2 },
        })
    // Laughs.
    if (flags.has('mom:turn') && crossed('together', 0.42)) {
      laugh(deskOut(5), 420, 6)
      laugh(deskOut(4), 240, 5)
    }
    if (flags.has('mom:watch') && crossed('together', 0.1)) laugh(deskOut(5), 420, 6)
    if (crossed('bulmaz', 0.26)) {
      laugh(deskOut(3), 230, 5)
      laugh(deskOut(4), 250, 4)
    }
    if (crossed('defiance', 0.52)) {
      laugh(deskOut(3), 360, 5)
      laugh(deskOut(4), 240, 4)
    }
    // The whoop.
    if (crossed('newboy', 0.5))
      tone(ctx, deskOut(3), {
        freq: 420,
        to: 880,
        glide: 0.35,
        type: 'triangle',
        env: { attack: 0.03, decay: 0.45, peak: 0.03 },
      })
    // The held note, and the resolve.
    if (crossed('disease', 0.5))
      tone(ctx, keys, {
        freq: 98,
        env: { attack: 0.02, decay: 6, peak: 0.06 },
      })
    if (crossed('final', 0.2))
      for (const [f, d] of [
        [261.63, 0],
        [329.63, 0.12],
        [392, 0.24],
        [523.25, 0.4],
      ] as const)
        tone(ctx, keys, {
          freq: f,
          env: { attack: 0.01, decay: 4, peak: 0.035 },
          delay: d,
        })
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)

      // The wall clock: from the time-lapse on it never stops, louder when the room is quiet.
      if (p >= SEG.years.start) {
        tick -= dt
        if (tick <= 0) {
          tick = 1
          const quiet = (p >= SEG.disease.start + SEG.disease.len * 0.5 && p < SEG.disease.end) || (p >= at('friend', 0.74) && p < at('lighter', 0.1)) || (p >= SEG.witness.start && p < SEG.witness.end)
          tone(ctx, clock.gain, {
            freq: 3000,
            env: { attack: 0.001, decay: 0.025, peak: quiet ? 0.03 : 0.012 },
          })
        }
      }
      // Keys from the desks that are typing.
      const list = typists(p)
      if (list.length) {
        typing -= dt
        if (typing <= 0) {
          const kidEra = p >= SEG.recess.start && p < SEG.years.start
          typing = (kidEra ? 0.05 : 0.08) + Math.random() * (0.3 / Math.max(1, list.length / 3))
          const n = list[Math.floor(Math.random() * list.length)]
          burst(ctx, noise.white, deskOut(n), {
            freq: kidEra ? 2200 + Math.random() * 900 : 3000 + Math.random() * 1500,
            q: 3,
            env: {
              attack: 0.001,
              decay: kidEra ? 0.035 : 0.02,
              peak: kidEra ? 0.022 : 0.013,
            },
          })
        }
      }
      // Game bleeps while the boys play.
      if (p >= at('play', 0.2) && p < at('zero', 0.2)) {
        bleep -= dt
        if (bleep <= 0) {
          bleep = 0.15 + Math.random() * 0.5
          tone(ctx, deskOut(Math.random() < 0.5 ? 3 : 4), {
            freq: 440 * Math.pow(2, Math.floor(Math.random() * 12) / 12),
            type: 'square',
            env: { attack: 0.002, decay: 0.07, peak: 0.006 },
          })
        }
      }
      // Birds through the window on spring days.
      const spring = (p >= SEG.recess.start && p < at('dusk', 0.5)) || p >= SEG.instant.start
      if (spring) {
        bird -= dt
        if (bird <= 0) {
          bird = 1.5 + Math.random() * 4
          const f0 = 2600 + Math.random() * 1600
          for (let i = 0; i < 3; i++)
            tone(ctx, window.gain, {
              freq: f0,
              to: f0 * 1.25,
              glide: 0.06,
              env: { attack: 0.004, decay: 0.06, peak: 0.006 },
              delay: i * 0.11,
            })
        }
      }
      // Knitting needles (the motif).
      const knitting = (p >= SEG.counter.start && p < SEG.disease.end) || (p >= SEG.mother.start && p < at('instant', 0.2))
      if (knitting) {
        needle -= dt
        if (needle <= 0) {
          needle = 0.35 + Math.random() * 0.25
          tone(ctx, deskOut(5), {
            freq: 4800,
            env: { attack: 0.001, decay: 0.02, peak: 0.008 },
          })
          tone(ctx, deskOut(5), {
            freq: 5200,
            env: { attack: 0.001, decay: 0.02, peak: 0.006 },
            delay: 0.09,
          })
        }
      }
      // Emre's lighter lid, opening and shutting.
      if ((p >= SEG.bulmaz.start && p < SEG.bulmaz.end) || (p >= SEG.friend.start && p < at('friend', 0.74))) {
        lidT -= dt
        if (lidT <= 0) {
          lidT = 1.4 + Math.random() * 0.6
          lighterClick(deskOut(3))
        }
      }
      // A slow, sparse piano.
      if (evalNumber(MIX.music, p) > 0.1 && Math.random() < dt / 3.4) {
        note = (note + (Math.random() < 0.5 ? 1 : NOTES.length - 1)) % NOTES.length
        tone(ctx, keys, {
          freq: NOTES[note],
          env: { attack: 0.006, decay: 2.6, peak: 0.03 },
          pan: Math.random() * 0.6 - 0.3,
        })
      }
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped)
        burst(ctx, noise.brown, fx, {
          freq: 240,
          type: 'lowpass',
          env: { attack: 0.004, decay: 0.1, peak: 0.1 },
          pan: motion.step % 2 ? 0.1 : -0.1,
        })
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p, frame.flags)
      lastP = p
    },
  }
}
