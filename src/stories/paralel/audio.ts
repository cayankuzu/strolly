/**
 * PARALEL-LEŞ's sound: wind, height, water and the thin glass ring of every
 * split. High wind over the valley; a deep drone and a glass note per step
 * in the void; gusts, gravel and a city that cuts out when he looks down;
 * the hum of a glass roof over rooms with a TV, a washer, a radio; a river's
 * roar under a bridge; insects on a hilltop and a stopwatch; surf, a flag,
 * the muffled dark under a wave; a free wheel ticking in the air; crumbling
 * earth; a TV down the hall, a crack, the house going silent; children
 * laughing on a parapet; lamps and parquet in an archive; and the rope of a
 * swing creaking over the void, which goes on past the last frame.
 *
 * No positional sources: the sets are kilometres apart; one-shots pan a
 * little instead.
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { SEG, at, segmentAt, type SegmentId } from './timeline'

type LayerId = 'wind' | 'gust' | 'drone' | 'city' | 'rooms' | 'hum' | 'river' | 'meadow' | 'surf' | 'flag' | 'under' | 'dirt' | 'hall' | 'lamp' | 'space' | 'abyss'

const k = (p: number, v: number): Key<number> => [p, v, linear]
const s = (seg: SegmentId, u: number, v: number) => k(at(seg, u), v)

const MIX: Record<LayerId, Key<number>[]> = {
  // High wind over the valley; the rooftops; the hill; the swing (rising in `rope`).
  wind: [
    s('open', 0, 0.45),
    s('open', 1, 0.45),
    s('line', 0.02, 0),
    s('can', 1, 0),
    s('roofs', 0.04, 0.32),
    s('gap', 0.6, 0.22),
    s('down', 0.03, 0.2),
    s('down', 0.06, 0),
    s('down', 0.5, 0),
    s('jump', 0.04, 0.25),
    s('jump', 0.46, 0.25),
    s('jump', 0.48, 0),
    s('jump', 0.66, 0),
    s('jump', 0.72, 0.2),
    s('glass', 0, 0.16),
    s('crack', 1, 0.12),
    s('river', 0, 0.05),
    s('slip', 1, 0.05),
    s('cliff', 0, 0.2),
    s('rehearsal', 1, 0.2),
    s('flag', 0, 0.3),
    s('waves', 1, 0.3),
    s('under', 0, 0),
    s('up', 0.78, 0),
    s('up', 0.8, 0.3),
    s('bike', 0, 0.25),
    s('bargain', 1, 0.22),
    s('socket', 0, 0),
    s('normal', 1, 0),
    s('friends', 0, 0.2),
    s('chain', 1, 0.2),
    s('fell', 0.04, 0.06),
    s('today', 0, 0.22),
    s('today', 1, 0.24),
    s('glassBroke', 0, 0.04),
    s('powerKept', 1, 0.0),
    s('bodies', 0, 0),
    s('diorama', 0.1, 0),
    s('diorama', 1, 0.15),
    s('swing', 0, 0.3),
    s('arc', 1, 0.3),
    s('rope', 0.18, 0.32),
    s('rope', 0.3, 0.6),
    s('rope', 1, 0.5),
    s('choose', 1, 0.45),
    s('grows', 0.62, 0.35),
    s('grows', 1, 0.25),
    s('end', 1, 0.3),
  ],
  // Gusts layered over the wind where the screenplay asks for them.
  gust: [s('open', 0, 0.25), s('line', 0.02, 0), s('roofs', 0, 0.3), s('gap', 0.5, 0.25), s('gap', 1, 0.1), s('down', 0.04, 0), s('jump', 0.7, 0.15), s('glass', 0, 0.05), s('rope', 0.18, 0.05), s('rope', 0.3, 0.5), s('rope', 1, 0.4), s('choose', 1, 0.3), s('grows', 0.6, 0.2), s('end', 1, 0.15)],
  // The deep drone: the void; the plain; rising from the valley as the swing grows.
  drone: [
    s('open', 0, 0),
    s('line', 0.0, 0),
    s('line', 0.08, 0.35),
    s('can', 1, 0.35),
    s('roofs', 0, 0),
    s('bodies', 0, 0),
    s('bodies', 0.1, 0.3),
    s('room', 0.3, 0.12),
    s('devil', 1, 0.12),
    s('exception', 0.3, 0.2),
    s('diorama', 1, 0.05),
    s('swing', 0, 0),
    s('grows', 0.15, 0),
    s('grows', 0.6, 0.45),
    s('grows', 1, 0.5),
    s('still', 1, 0.35),
    s('end', 0.5, 0.15),
    s('end', 1, 0.0),
  ],
  // The avenue sixty metres down: gone the moment he looks.
  city: [s('roofs', 0, 0.22), s('gap', 1, 0.22), s('down', 0.03, 0.2), s('down', 0.05, 0), s('down', 1, 0), s('jump', 0.02, 0.15), s('jump', 0.46, 0.15), s('jump', 0.48, 0), s('jump', 0.7, 0), s('jump', 0.8, 0.16), s('glass', 0, 0.08), s('crack', 1, 0.08), s('river', 0, 0), s('friends', 0, 0.2), s('chain', 1, 0.2), s('fell', 0.04, 0), s('fell', 1, 0), s('today', 0, 0)],
  // Room tones rising from below the glass: a TV, a washer, a radio.
  rooms: [s('glass', 0, 0.02), s('rooms', 0.0, 0.05), s('rooms', 0.5, 0.3), s('rooms', 1, 0.25), s('crack', 0.2, 0.12), s('crack', 1, 0.08), s('river', 0, 0)],
  // The glass hum under his feet.
  hum: [s('glass', 0.4, 0), s('glass', 0.5, 0.12), s('rooms', 1, 0.1), s('crack', 0.06, 0.25), s('crack', 0.55, 0.3), s('crack', 0.6, 0.05), s('crack', 1, 0.05), s('river', 0, 0), s('glassBroke', 0, 0.06), s('glassBroke', 1, 0.06), s('ironSlipped', 0, 0)],
  // The river in flood.
  river: [s('crack', 1, 0), s('river', 0.0, 0.6), s('beams', 0, 0.55), s('beams', 1, 0.5), s('slip', 0.3, 0.55), s('slip', 0.5, 0.95), s('slip', 0.62, 0.55), s('slip', 1, 0.5), s('cliff', 0, 0), s('ironSlipped', 0, 0.2), s('ironSlipped', 1, 0.2), s('waveKept', 0, 0)],
  // Dry grass and insects on the hill; grass in the wind on the path now.
  meadow: [s('slip', 1, 0), s('cliff', 0, 0.35), s('stone', 0.2, 0.25), s('stone', 1, 0.22), s('rehearsal', 1, 0.3), s('flag', 0, 0), s('today', 0, 0.25), s('today', 1, 0.25), s('glassBroke', 0, 0)],
  // The surf pounding; nothing under the wave; a waveless hiss in the other universe.
  surf: [s('rehearsal', 1, 0), s('flag', 0, 0.5), s('waves', 0.5, 0.6), s('waves', 0.7, 0.9), s('waves', 1, 0.6), s('under', 0.02, 0), s('up', 0.77, 0), s('up', 0.8, 0.7), s('up', 1, 0.6), s('bike', 0, 0), s('waveKept', 0, 0.18), s('waveKept', 1, 0.18), s('earthFell', 0, 0)],
  flag: [s('flag', 0, 0.35), s('flag', 0.4, 0.5), s('flag', 1, 0.4), s('waves', 0.3, 0.1), s('waves', 0.6, 0)],
  // Under the wave: a muffled roar that sinks away.
  under: [s('waves', 0.95, 0), s('under', 0.02, 0.7), s('under', 0.5, 0.5), s('under', 1, 0.35), s('up', 0.5, 0.45), s('up', 0.77, 0.6), s('up', 0.79, 0)],
  // Chain and tyres on the run-in; only a free wheel in the air.
  dirt: [s('up', 1, 0), s('bike', 0.0, 0.25), s('bike', 0.6, 0.55), s('bike', 1, 0.6), s('air', 0.02, 0), s('air', 0.9, 0), s('air', 0.93, 0.2), s('air', 1, 0), s('slope', 0, 0)],
  // The TV down the hall (until the power goes).
  hall: [s('bargain', 1, 0), s('socket', 0, 0.18), s('spark', 0.2, 0.18), s('spark', 0.225, 0), s('normal', 1, 0)],
  // Lamp hum and the archive's room tone.
  lamp: [s('room', 0.05, 0), s('room', 0.3, 0.18), s('devil', 0, 0.2), s('devil', 1, 0.24), s('exception', 0.3, 0.12), s('diorama', 0.6, 0.04), s('swing', 0, 0)],
  // The space opening up.
  space: [s('exception', 0.2, 0), s('exception', 0.45, 0.35), s('exception', 1, 0.3), s('diorama', 0.5, 0.05), s('swing', 0.1, 0)],
  // The valley below: a low, wide breath.
  abyss: [s('open', 0, 0.2), s('line', 0.02, 0), s('swing', 0, 0.15), s('feet', 0.5, 0.3), s('rope', 0.6, 0.3), s('choose', 1, 0.2), s('grows', 0.2, 0.3), s('end', 1, 0.2)],
}

/** Where the footsteps fall, by stretch: the sound of the ground. */
function ground(seg: SegmentId): 'gravel' | 'glass' | 'sand' | 'dirt' | 'wood' | 'line' | null {
  switch (seg) {
    case 'line':
      return 'line'
    case 'roofs':
    case 'jump':
    case 'friends':
    case 'chain':
    case 'fell':
    case 'today':
    case 'cliff':
      return 'gravel'
    case 'glass':
    case 'rooms':
    case 'crack':
      return 'glass'
    case 'flag':
      return 'sand'
    case 'slope':
    case 'bargain':
      return 'dirt'
    case 'bodies':
    case 'room':
      return 'wood'
    default:
      return null
  }
}

export function createParalelAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise, fx } = kit
  const layers = {} as Record<LayerId, GainNode>

  // High wind: pink noise in a moving band.
  const wind = (layers.wind = kit.layer(0.25))
  const wF = filter(ctx, 'bandpass', 760, 0.5)
  kit.loop(noise.pink, wF, 0.9)
  kit.lfo(wF.frequency, 0.11, 260)
  const wG = ctx.createGain()
  wG.gain.value = 0.7
  kit.lfo(wG.gain, 0.19, 0.3)
  wF.connect(wG).connect(wind)
  const gust = (layers.gust = kit.layer(0.2))
  const gF = filter(ctx, 'bandpass', 1300, 0.7)
  kit.loop(noise.white, gF, 1)
  const gG = ctx.createGain()
  gG.gain.value = 0.3
  kit.lfo(gG.gain, 0.31, 0.3)
  gF.connect(gG).connect(gust)

  // The drone: two low sines a fifth apart, slowly beating.
  const drone = (layers.drone = kit.layer(0.5, 'music'))
  const dF = filter(ctx, 'lowpass', 420)
  dF.connect(drone)
  kit.osc('sine', 55, dF, 0.4)
  const d2 = kit.osc('sine', 82.6, dF, 0.18)
  kit.lfo(d2.o.frequency, 0.07, 0.6)
  kit.osc('triangle', 110.3, dF, 0.05)

  // The city far below.
  const city = (layers.city = kit.layer(0.15))
  const cF = filter(ctx, 'bandpass', 280, 0.5)
  kit.loop(noise.brown, cF, 0.9)
  cF.connect(city)

  // Rooms below the glass: a TV murmur (formant noise), a washer's drum, a radio's tune.
  const rooms = (layers.rooms = kit.layer(0.3))
  const rF = filter(ctx, 'bandpass', 900, 3)
  kit.loop(noise.pink, rF, 1.2)
  const rG = ctx.createGain()
  rG.gain.value = 0.5
  kit.lfo(rG.gain, 3.3, 0.35)
  rF.connect(rG).connect(rooms)
  const washF = filter(ctx, 'lowpass', 160)
  kit.loop(noise.brown, washF, 0.7)
  const washG = ctx.createGain()
  washG.gain.value = 0.4
  kit.lfo(washG.gain, 0.9, 0.3)
  washF.connect(washG).connect(rooms)

  // The glass hum: two close tones beating.
  const hum = (layers.hum = kit.layer(0.2))
  kit.osc('sine', 412, hum, 0.03)
  kit.osc('sine', 415.5, hum, 0.03)
  kit.osc('sine', 824, hum, 0.008)

  // The river's roar.
  const river = (layers.river = kit.layer(0.15))
  const rvF = filter(ctx, 'lowpass', 700)
  kit.loop(noise.brown, rvF, 1)
  const rvF2 = filter(ctx, 'bandpass', 1800, 0.6)
  kit.loop(noise.pink, rvF2, 1)
  const rvG = ctx.createGain()
  rvG.gain.value = 0.25
  rvF2.connect(rvG).connect(river)
  rvF.connect(river)

  // A meadow at noon: insects (a fast-modulated narrow band) and grass.
  const meadow = (layers.meadow = kit.layer(0.1))
  const mF = filter(ctx, 'bandpass', 4600, 5)
  kit.loop(noise.white, mF, 1)
  const mG = ctx.createGain()
  mG.gain.value = 0.35
  kit.lfo(mG.gain, 22, 0.3)
  mF.connect(mG).connect(meadow)
  const grassF = filter(ctx, 'highpass', 2200)
  kit.loop(noise.pink, grassF, 1)
  const grassG = ctx.createGain()
  grassG.gain.value = 0.25
  kit.lfo(grassG.gain, 0.23, 0.2)
  grassF.connect(grassG).connect(meadow)

  // Surf: brown noise swelling every six seconds.
  const surf = (layers.surf = kit.layer(0.3))
  const sF = filter(ctx, 'lowpass', 900)
  kit.loop(noise.brown, sF, 1)
  const sG = ctx.createGain()
  sG.gain.value = 0.55
  kit.lfo(sG.gain, 1 / 6, 0.45)
  sF.connect(sG).connect(surf)
  const flag = (layers.flag = kit.layer(0.05))
  const fF = filter(ctx, 'bandpass', 1500, 1.2)
  kit.loop(noise.white, fF, 1)
  const fG = ctx.createGain()
  fG.gain.value = 0.35
  kit.lfo(fG.gain, 11, 0.33)
  fF.connect(fG).connect(flag)

  // Under water: a muffled roar.
  const under = (layers.under = kit.layer(0.4))
  const uF = filter(ctx, 'lowpass', 240)
  kit.loop(noise.brown, uF, 0.6)
  const uG = ctx.createGain()
  uG.gain.value = 0.8
  kit.lfo(uG.gain, 0.13, 0.25)
  uF.connect(uG).connect(under)

  // Chain and tyres on dirt.
  const dirt = (layers.dirt = kit.layer(0.05))
  const tF = filter(ctx, 'bandpass', 520, 0.8)
  kit.loop(noise.brown, tF, 1.3)
  tF.connect(dirt)
  const chF = filter(ctx, 'bandpass', 3600, 4)
  kit.loop(noise.white, chF, 1)
  const chG = ctx.createGain()
  chG.gain.value = 0.15
  kit.lfo(chG.gain, 14, 0.12)
  chF.connect(chG).connect(dirt)

  // The TV down the hall.
  const hall = (layers.hall = kit.layer(0.2))
  const hF = filter(ctx, 'bandpass', 700, 2.5)
  kit.loop(noise.pink, hF, 1.1)
  const hG = ctx.createGain()
  hG.gain.value = 0.4
  kit.lfo(hG.gain, 2.7, 0.3)
  hF.connect(hG).connect(hall)

  // Lamp hum and the archive's tone.
  const lamp = (layers.lamp = kit.layer(0.3))
  kit.osc('sine', 100, lamp, 0.03)
  kit.osc('sine', 200, lamp, 0.01)
  const lF = filter(ctx, 'lowpass', 300)
  kit.loop(noise.brown, lF, 0.5)
  lF.connect(lamp)

  // A huge space opening: a high, airy chord.
  const space = (layers.space = kit.layer(0.8, 'music'))
  const spF = filter(ctx, 'lowpass', 2400)
  spF.connect(space)
  for (const [f, g] of [
    [220, 0.03],
    [329.6, 0.02],
    [440, 0.012],
    [659.3, 0.006],
  ] as const) {
    const o = kit.osc('sine', f, spF, g)
    kit.lfo(o.o.frequency, 0.05 + f / 10000, 0.4)
  }

  // The valley's breath far below.
  const abyss = (layers.abyss = kit.layer(0.4))
  const aF = filter(ctx, 'lowpass', 180)
  kit.loop(noise.brown, aF, 0.4)
  const aG = ctx.createGain()
  aG.gain.value = 0.7
  kit.lfo(aG.gain, 0.06, 0.3)
  aF.connect(aG).connect(abyss)

  // ——— One-shots ———
  const ring = (peak = 1) => {
    // The split: a thin glass ring.
    tone(ctx, fx, { freq: 2637, env: { attack: 0.002, decay: 2.2, peak: 0.03 * peak } })
    tone(ctx, fx, { freq: 3951, env: { attack: 0.002, decay: 1.4, peak: 0.012 * peak }, delay: 0.01 })
    tone(ctx, fx, { freq: 2649, env: { attack: 0.002, decay: 2.0, peak: 0.012 * peak } })
  }
  const glassStep = () => {
    tone(ctx, fx, { freq: 1760 + Math.random() * 120, env: { attack: 0.002, decay: 0.9, peak: 0.012 }, pan: Math.random() * 0.4 - 0.2 })
    tone(ctx, fx, { freq: 2640, env: { attack: 0.002, decay: 0.5, peak: 0.004 } })
  }
  const crunch = (peak = 0.12, freq = 2400) =>
    burst(ctx, noise.white, fx, { freq: freq + Math.random() * 600, q: 0.9, env: { attack: 0.003, decay: 0.09, peak }, pan: Math.random() * 0.3 - 0.15 })
  const thock = () => burst(ctx, noise.brown, fx, { freq: 380, type: 'lowpass', env: { attack: 0.002, decay: 0.07, peak: 0.14 } })
  const thud = (peak = 0.3, freq = 160) => burst(ctx, noise.brown, fx, { freq, type: 'lowpass', env: { attack: 0.004, decay: 0.35, peak } })
  const creak = (peak = 1) =>
    tone(ctx, fx, { freq: 210 + Math.random() * 40, to: 160, glide: 0.5, type: 'sawtooth', env: { attack: 0.06, decay: 0.45, peak: 0.006 * peak }, pan: Math.random() * 0.4 - 0.2 })
  const hiss = () => burst(ctx, noise.white, fx, { freq: 5200, q: 0.6, type: 'highpass', env: { attack: 0.005, decay: 0.45, peak: 0.08 } })
  const beep = () => {
    tone(ctx, fx, { freq: 4000, type: 'square', env: { attack: 0.001, decay: 0.06, peak: 0.012 } })
  }
  const knock = (peak: number) => {
    burst(ctx, noise.white, fx, { freq: 2600, q: 2, env: { attack: 0.001, decay: 0.05, peak } })
    burst(ctx, noise.brown, fx, { freq: 600, type: 'lowpass', env: { attack: 0.001, decay: 0.12, peak: peak * 0.8 } })
  }
  const heartbeat = () => {
    tone(ctx, fx, { freq: 52, to: 40, glide: 0.12, env: { attack: 0.01, decay: 0.16, peak: 0.12 } })
    tone(ctx, fx, { freq: 48, to: 38, glide: 0.12, env: { attack: 0.01, decay: 0.14, peak: 0.08 }, delay: 0.22 })
  }
  const breath = (peak = 0.06) => burst(ctx, noise.pink, fx, { freq: 900, q: 0.8, env: { attack: 0.25, decay: 0.7, peak } })
  const shatter = () => {
    burst(ctx, noise.white, fx, { freq: 4200, q: 0.5, env: { attack: 0.002, decay: 0.6, peak: 0.25 } })
    for (let i = 0; i < 14; i++) tone(ctx, fx, { freq: 2800 + Math.random() * 3200, env: { attack: 0.001, decay: 0.2 + Math.random() * 0.4, peak: 0.01 }, delay: Math.random() * 0.4, pan: Math.random() - 0.5 })
    // The tinkle going down floor by floor.
    for (let f = 0; f < 6; f++)
      for (let i = 0; i < 4; i++) tone(ctx, fx, { freq: 3400 - f * 300 + Math.random() * 600, env: { attack: 0.001, decay: 0.15, peak: 0.008 * (1 - f * 0.13) }, delay: 0.7 + f * 0.45 + Math.random() * 0.2 })
  }
  const crackle = () => {
    for (let i = 0; i < 6; i++) burst(ctx, noise.white, fx, { freq: 3000 + Math.random() * 2000, q: 3, env: { attack: 0.001, decay: 0.02, peak: 0.05 } })
  }
  const laugh = (pitch: number, n: number, pan: number) => {
    for (let i = 0; i < n; i++) {
      const f = pitch * (1 - i * 0.05)
      tone(ctx, fx, { freq: f, type: 'triangle', env: { attack: 0.01, decay: 0.09, peak: 0.01 }, delay: i * 0.14 + Math.random() * 0.02, pan })
      burst(ctx, noise.white, fx, { freq: f * 2.4, q: 6, env: { attack: 0.01, decay: 0.07, peak: 0.02 }, pan })
    }
  }
  const zap = () => {
    burst(ctx, noise.white, fx, { freq: 3000, q: 0.4, env: { attack: 0.001, decay: 0.25, peak: 0.35 } })
    tone(ctx, fx, { freq: 120, type: 'sawtooth', env: { attack: 0.001, decay: 0.3, peak: 0.05 } })
  }
  const powerDown = () => tone(ctx, fx, { freq: 120, to: 30, glide: 0.8, type: 'sawtooth', env: { attack: 0.01, decay: 0.9, peak: 0.02 } })
  const click = () => burst(ctx, noise.white, fx, { freq: 4500, q: 3, env: { attack: 0.001, decay: 0.02, peak: 0.07 } })
  const doorSlam = () => {
    thud(0.35, 120)
    burst(ctx, noise.pink, kit.verb, { freq: 400, type: 'lowpass', env: { attack: 0.01, decay: 1.2, peak: 0.1 } })
  }
  const truck = () => {
    thud(0.45, 90)
    burst(ctx, noise.brown, fx, { freq: 140, type: 'lowpass', env: { attack: 0.3, decay: 1.8, peak: 0.25 } })
  }
  const splash = (peak = 0.35) => burst(ctx, noise.white, fx, { freq: 1600, q: 0.4, env: { attack: 0.01, decay: 1.1, peak } })
  const drip = () => tone(ctx, fx, { freq: 1100 + Math.random() * 500, to: 1900, glide: 0.04, env: { attack: 0.001, decay: 0.08, peak: 0.01 }, pan: Math.random() - 0.5 })
  const trickle = () => {
    for (let i = 0; i < 4; i++) burst(ctx, noise.white, fx, { freq: 2800 + Math.random() * 1500, q: 2, env: { attack: 0.001, decay: 0.03, peak: 0.025 }, pan: Math.random() * 0.4 - 0.2 })
  }

  let lastP = -1
  let lastStep = 0
  let creakT = 0
  let beatT = 0
  let dripT = 0
  let tickT = 0
  let trickleT = 0
  let breathT = 0

  const crossings = (from: number, to: number) => {
    const crossed = (seg: SegmentId, u: number) => from < at(seg, u) && to >= at(seg, u)
    // ÇİZGİ.
    if (crossed('can', 0.12)) hiss()
    // ÇATILAR.
    if (crossed('roofs', 0.05)) {
      creak(3)
      thud(0.12, 300)
    }
    if (crossed('jump', 0.47)) breath(0.05)
    if (crossed('jump', 0.52)) ring()
    if (crossed('jump', 0.58)) {
      thud(0.35, 200)
      crunch(0.2)
    }
    if (crossed('jump', 0.72)) thud(0.04, 260)
    // CAM.
    if (crossed('crack', 0.22)) doorSlam()
    if (crossed('crack', 0.5)) ring(0.8)
    if (crossed('crack', 0.56)) crackle()
    if (crossed('crack', 0.6)) shatter()
    // KÖPRÜ.
    if (crossed('slip', 0.08)) truck()
    if (crossed('slip', 0.52)) ring()
    if (crossed('slip', 0.57)) splash(0.15)
    // TAŞLAR.
    if (crossed('stone', 0.22)) beep()
    if (crossed('stone', 0.34)) knock(0.06)
    if (crossed('stone', 0.5)) knock(0.03)
    if (crossed('stone', 0.76)) knock(0.008)
    if (crossed('stone', 0.77)) beep()
    if (crossed('rehearsal', 0.3)) ring()
    // DALGA.
    if (crossed('waves', 0.6)) splash(0.2)
    if (crossed('waves', 0.7)) {
      splash(0.5)
      thud(0.4, 110)
    }
    if (crossed('up', 0.3)) ring(0.7)
    if (crossed('up', 0.78)) {
      splash(0.3)
      breath(0.14)
    }
    // TOPRAK.
    if (crossed('air', 0.5)) ring()
    if (crossed('air', 0.92)) {
      thud(0.4, 180)
      crunch(0.25, 1800)
    }
    if (crossed('bargain', 0.5)) ring()
    if (crossed('bargain', 0.62)) {
      thud(0.35, 90)
      burst(ctx, noise.pink, fx, { freq: 2000, q: 0.5, env: { attack: 0.1, decay: 1.6, peak: 0.08 } })
    }
    // KIVILCIM.
    if (crossed('spark', 0.18)) zap()
    if (crossed('spark', 0.22)) powerDown()
    for (const u of [0.02, 0.025, 0.03]) if (crossed('normal', u)) thud(0.06, 220)
    if (crossed('normal', 0.05)) click()
    // BAZI EVRENLERDE.
    if (crossed('friends', 0.08)) {
      laugh(360, 5, -0.2)
      laugh(300, 4, 0.1)
    }
    if (crossed('friends', 0.6)) laugh(420, 4, 0.2)
    if (crossed('chain', 0.5)) laugh(330, 3, 0)
    if (crossed('fell', 0.08)) ring(0.8)
    if (crossed('glassBroke', 0.08)) for (let i = 0; i < 5; i++) tone(ctx, fx, { freq: 2400 + Math.random() * 2400, env: { attack: 0.002, decay: 1.2, peak: 0.006 }, delay: i * 0.3 })
    if (crossed('ironSlipped', 0.08)) drip()
    if (crossed('earthFell', 0.08)) burst(ctx, noise.pink, fx, { freq: 2200, q: 0.5, env: { attack: 0.2, decay: 1.5, peak: 0.05 } })
    if (crossed('powerKept', 0.08)) crackle()
    // ODA.
    if (crossed('bodies', 0.04)) tone(ctx, fx, { freq: 73.4, env: { attack: 0.5, decay: 5, peak: 0.06 } })
    for (let i = 0; i < 6; i++) if (crossed('room', 0.06 + i * 0.03)) click()
    if (crossed('devil', 0.08)) tone(ctx, fx, { freq: 120, type: 'sawtooth', env: { attack: 0.2, decay: 2.5, peak: 0.004 } })
    if (crossed('devil', 0.6)) tone(ctx, fx, { freq: 98, env: { attack: 1.2, decay: 4, peak: 0.05 } })
    if (crossed('exception', 0.3)) burst(ctx, noise.pink, kit.verb, { freq: 900, q: 0.4, env: { attack: 1.0, decay: 3, peak: 0.08 } })
    if (crossed('diorama', 0.1)) {
      click()
      creak(0.4)
    }
    // ŞU AN.
    if (crossed('rope', 0.2)) burst(ctx, noise.pink, fx, { freq: 900, q: 0.5, env: { attack: 0.6, decay: 2.4, peak: 0.12 } })
    if (crossed('grows', 0.2)) tone(ctx, fx, { freq: 41, to: 55, glide: 6, env: { attack: 2, decay: 6, peak: 0.14 } })
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)
      const seg = segmentAt(p).id as SegmentId

      // The rope creaks at each end of the sway: faint in `open`, every half swing on the swing.
      const swinging = p >= SEG.swing.start || (seg === 'open' && p >= at('open', 0.6))
      if (swinging) {
        creakT -= dt
        if (creakT <= 0) {
          creakT = 1.93
          const loud = seg === 'rope' || seg === 'grows' ? 1.8 : seg === 'open' ? 0.4 : seg === 'still' || seg === 'end' ? (frame.flags.has('swing:stop') ? 0.6 : 1.4) : 1
          creak(loud)
        }
      }
      // A heartbeat under water and in the air over the cleft.
      if (seg === 'under' || (seg === 'up' && p < at('up', 0.78)) || seg === 'air') {
        beatT -= dt
        if (beatT <= 0) {
          beatT = seg === 'under' ? 0.75 - 0.25 * ((p - SEG.under.start) / SEG.under.len) : 0.85
          heartbeat()
        }
      }
      // Drips from the rivets.
      if (seg === 'beams' || seg === 'slip') {
        dripT -= dt
        if (dripT <= 0) {
          dripT = 0.3 + Math.random() * 0.9
          drip()
        }
      }
      // The free wheel ticking in slow motion; the watch digits running.
      if (seg === 'air' && p < at('air', 0.92)) {
        tickT -= dt
        if (tickT <= 0) {
          tickT = 0.16
          burst(ctx, noise.white, fx, { freq: 5200, q: 4, env: { attack: 0.001, decay: 0.012, peak: 0.03 } })
        }
      }
      // Earth crumbling and pebbles falling into the dark.
      if (seg === 'slope' || (seg === 'bargain' && p < at('bargain', 0.5))) {
        trickleT -= dt
        if (trickleT <= 0) {
          trickleT = 0.5 + Math.random() * 1.2
          trickle()
        }
      }
      // His breathing when the city cuts out.
      if (seg === 'down' && p < at('down', 0.95)) {
        breathT -= dt
        if (breathT <= 0) {
          breathT = 2.6
          breath(0.05)
        }
      }
      // Footsteps on whatever ground this is.
      if (motion.step !== lastStep && motion.walking > 0.3 && !jumped) {
        const g = ground(seg)
        if (g === 'line') glassStep()
        else if (g === 'gravel') crunch(0.07)
        else if (g === 'glass') thock()
        else if (g === 'sand') burst(ctx, noise.pink, fx, { freq: 900, q: 0.6, env: { attack: 0.01, decay: 0.12, peak: 0.05 } })
        else if (g === 'dirt') crunch(0.05, 1300)
        else if (g === 'wood') {
          burst(ctx, noise.brown, fx, { freq: 260, type: 'lowpass', env: { attack: 0.004, decay: 0.12, peak: 0.08 } })
          if (Math.random() < 0.3) creak(0.8)
        }
      }
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p)
      lastP = p
    },
  }
}
