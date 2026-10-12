/**
 * ÖFKESEL DENEYİM SİMÜLASYONU's sound, against the ch. 1–9 timeline.
 *
 * An open-plan office (keyboards, HVAC, a phone), the boss's room through
 * glass and the big careless laugh; the evening: a lift bell, a stairwell
 * that rings, a car door, the engine, no radio. ÖFKE NÖBETİ: muzak that
 * never resolves, a chime, the helmet's rising hum, a lens hiss. The white
 * room: a thin room tone, one airtight door (the same hiss and thunk in
 * ch. 4, 7 and 9), a low hum and an ice-crackle as the office arrives, the
 * office ambience returning; the fit as muffled thuds married to white-noise
 * flashes, a monitor crunch, pens, then only breath. The brochure's jingle;
 * boots, a scrape, a mop; the line: diesel, chains, a clanking belt, a car
 * wash for a man, an enormous flat voice, sirens, a gavel, servos, a click.
 * From the floor everything is lowpassed: drugged breath, a heartbeat, the
 * door, short hard steps, muffled cursing in Arif's voice. Then nothing.
 *
 * All sounds are generated; every CAPTION in text.ts has its cue here.
 */
import { clamp, linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG, segmentAt, type SegmentId } from './timeline'

type LayerId =
  | 'office'
  | 'city'
  | 'stairwell'
  | 'street'
  | 'engine'
  | 'muzak'
  | 'clinic'
  | 'scan'
  | 'roomTone'
  | 'hum'
  | 'crackle'
  | 'jingle'
  | 'diesel'
  | 'belt'
  | 'wash'
  | 'voice'
  | 'courtroom'
  | 'station'
  | 'breath'
  | 'heart'

const k = (p: number, v: number): Key<number> => [p, v, linear]
const s = (seg: SegmentId, u: number, v: number) => k(at(seg, u), v)
/** Keys sorted by progress, so a track can be written in story order. */
const track = (...keys: Key<number>[]) => keys.slice().sort((a, b) => a[0] - b[0])

const MIX: Record<LayerId, Key<number>[]> = {
  office: track(
    s('open', 0, 0.55),
    s('knock', 0.5, 0.55),
    s('enter', 0.6, 0.16),
    s('leave', 0.6, 0.16),
    s('leave', 0.68, 0.5),
    s('pack', 0, 0.42),
    s('pack', 1, 0.32),
    s('elevator', 0.7, 0.28),
    s('elevator', 1, 0),
    s('same', 0.2, 0),
    s('same', 0.6, 0.32),
    s('subside', 0, 0.3),
    s('subside', 0.12, 0),
  ),
  city: track(s('enter', 0.5, 0), s('enter', 0.7, 0.3), s('leave', 0.6, 0.3), s('leave', 0.7, 0), s('same', 0.2, 0), s('same', 0.6, 0.24), s('monitor', 0.8, 0.22), s('subside', 0.1, 0)),
  stairwell: track(s('elevator', 0.95, 0), s('stairs', 0.06, 0.4), s('car', 0.1, 0.4), s('car', 0.26, 0)),
  street: track(
    s('car', 0.2, 0),
    s('car', 0.3, 0.5),
    s('car', 0.56, 0.5),
    s('car', 0.62, 0.2),
    s('dusk', 1, 0.28),
    s('arrive', 0, 0.28),
    s('arrive', 0.35, 0.5),
    s('arrive', 0.75, 0.5),
    s('arrive', 0.92, 0.08),
    s('welcome', 0.2, 0),
    s('away', 0.68, 0),
    s('away', 0.75, 0.5),
    s('away', 1, 0.4),
    s('staff', 0, 0),
  ),
  engine: track(s('route', 1, 0), s('dusk', 0.08, 0.42), s('dusk', 1, 0.42), s('arrive', 0.26, 0.38), s('arrive', 0.33, 0), s('away', 0.8, 0), s('away', 0.86, 0.4), s('away', 1, 0.3), s('staff', 0, 0)),
  muzak: track(
    s('arrive', 0.55, 0),
    s('arrive', 0.72, 0.2),
    s('welcome', 0, 0.35),
    s('welcome', 1, 0.35),
    s('helmet', 0.1, 0.1),
    s('clothes', 1, 0.08),
    s('white', 0.25, 0),
    s('away', 0.56, 0),
    s('away', 0.6, 0.3),
    s('away', 0.72, 0.3),
    s('away', 0.78, 0.04),
    s('away', 1, 0),
  ),
  clinic: track(s('welcome', 0.9, 0), s('helmet', 0, 0.3), s('clothes', 1, 0.3), s('white', 0.3, 0.14), s('white', 0.75, 0), s('done', 0.6, 0), s('how', 0, 0.3), s('away', 0.56, 0.3), s('away', 0.62, 0.08), s('away', 0.7, 0)),
  scan: track(s('helmet', 0.2, 0), s('helmet', 0.55, 0.3), s('helmet', 1, 0.42), s('map', 0.05, 0.42), s('map', 0.14, 0)),
  roomTone: track(
    s('close', 0.3, 0),
    s('close', 0.5, 0.3),
    s('color', 0.3, 0.25),
    s('towel', 1, 0.12),
    s('same', 0.3, 0),
    s('subside', 0.05, 0),
    s('subside', 0.15, 0.3),
    s('done', 0.6, 0.3),
    s('done', 0.72, 0),
    s('restart', 1, 0.15),
    s('staff', 0, 0.3),
    s('restart', 0.4, 0.3),
    s('restart', 0.5, 0.15),
    s('van', 0, 0),
    s('inject', 1, 0),
    s('floor', 0, 0.3),
    s('comes', 1, 0.3),
    s('black', 0, 0),
  ),
  hum: track(s('color', 0.1, 0), s('color', 0.6, 0.4), s('pixels', 1, 0.5), s('towel', 0.5, 0.4), s('same', 0, 0.25), s('same', 0.45, 0)),
  crackle: track(s('color', 0.6, 0), s('pixels', 0.1, 0.4), s('towel', 0.3, 0.3), s('towel', 1, 0.1), s('same', 0.2, 0)),
  jingle: track(s('how', 0, 0), s('how', 0.08, 0.4), s('executed', 0.45, 0.4), s('executed', 0.56, 0.14), s('executed', 1, 0.12), s('away', 0.5, 0.1), s('away', 0.58, 0)),
  diesel: track(s('restart', 1, 0), s('van', 0, 0.4), s('hood', 1, 0.4), s('platform', 0.5, 0.3), s('platform', 0.85, 0)),
  belt: track(
    s('platform', 0.45, 0),
    s('platform', 0.56, 0.35),
    s('wash', 1, 0.3),
    s('reading', 0.1, 0.15),
    s('reading', 0.5, 0.08),
    s('inject', 0.5, 0.08),
    s('inject', 0.56, 0.3),
    s('inject', 1, 0.3),
    s('floor', 0.1, 0.22),
    s('floor', 0.45, 0.22),
    s('floor', 0.5, 0),
  ),
  wash: track(s('wash', 0.4, 0), s('wash', 0.5, 0.5), s('wash', 0.95, 0.5), s('reading', 0.06, 0)),
  voice: track(s('reading', 0.5, 0), s('reading', 0.56, 0.5), s('reading', 1, 0.5), s('inject', 0.06, 0)),
  courtroom: track(s('reading', 0.68, 0), s('reading', 0.76, 0.3), s('reading', 1, 0.3), s('inject', 0.06, 0)),
  station: track(s('reading', 1, 0), s('inject', 0.05, 0.25), s('inject', 1, 0.25), s('floor', 0, 0)),
  breath: track(s('subside', 0.1, 0), s('subside', 0.2, 0.28), s('subside', 1, 0.28), s('done', 0.3, 0.1), s('done', 0.5, 0), s('floor', 0.15, 0), s('floor', 0.3, 0.35), s('comes', 0.9, 0.35), s('black', 0, 0)),
  heart: track(s('floor', 0.45, 0), s('floor', 0.55, 0.3), s('comes', 1, 0.35), s('black', 0, 0)),
}

/** The muzak's loop (never resolves) and the explainer's bright tune. */
const MUZAK = [523.25, 659.25, 783.99, 698.46, 587.33, 659.25]
const JINGLE = [659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25, 0, 783.99, 880.0, 987.77, 880.0, 783.99, 659.25, 587.33, 0]
const CHORD_END = [523.25, 659.25, 783.99, 1046.5]

export function createOfkeAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const layers = {} as Record<LayerId, GainNode>

  // Everything the story makes passes two lowpasses (one for beds, one for one-shots): open
  // until 333's eyes on the floor, then shut to the muffled underwater of ch. 9.
  const bed = ctx.createGain()
  const bedLP = filter(ctx, 'lowpass', 18000, 0.5)
  bed.connect(bedLP).connect(kit.out)
  const fx = ctx.createGain()
  const fxLP = filter(ctx, 'lowpass', 18000, 0.5)
  fx.connect(fxLP).connect(kit.fx)
  // A longer, bigger reverb send for the stairwell and the reading room.
  const bigVerb = ctx.createGain()
  bigVerb.gain.value = 0.8
  bigVerb.connect(kit.verb)
  const hall = ctx.createGain()
  hall.connect(fx)
  hall.connect(bigVerb)
  const layer = (id: LayerId, send = 0) => {
    const g = ctx.createGain()
    g.gain.value = 0
    g.connect(bed)
    if (send > 0) {
      const sg = ctx.createGain()
      sg.gain.value = send
      g.connect(sg).connect(kit.verb)
    }
    layers[id] = g
    return g
  }

  // ——— Beds ———
  // The office: HVAC and a 100 Hz lamp hum (keyboards come from a clock below).
  const office = layer('office', 0.05)
  const oF = filter(ctx, 'lowpass', 240)
  kit.loop(noise.brown, oF, 0.7)
  oF.connect(office)
  kit.osc('sine', 100, office, 0.012)
  // The city through the boss's glass.
  const city = layer('city', 0.1)
  const cF = filter(ctx, 'lowpass', 380)
  kit.loop(noise.pink, cF, 0.8)
  const cG = ctx.createGain()
  cG.gain.value = 0.7
  kit.lfo(cG.gain, 0.11, 0.3)
  cF.connect(cG).connect(city)
  // The stairwell: a tube's buzz in a concrete shaft.
  const stairwell = layer('stairwell', 0.6)
  const swF = filter(ctx, 'lowpass', 500)
  kit.osc('sawtooth', 100, swF, 0.012)
  kit.loop(noise.pink, swF, 0.5)
  swF.connect(stairwell)
  // The street: traffic and wind.
  const street = layer('street', 0.15)
  const stF = filter(ctx, 'bandpass', 320, 0.5)
  kit.loop(noise.pink, stF, 0.75)
  const stG = ctx.createGain()
  stG.gain.value = 0.8
  kit.lfo(stG.gain, 0.21, 0.3)
  stF.connect(stG).connect(street)
  // The engine.
  const engine = layer('engine')
  const eF = filter(ctx, 'lowpass', 320)
  const eng = kit.osc('sawtooth', 52, eF, 0.08)
  kit.osc('sine', 104, eF, 0.04)
  const eN = filter(ctx, 'lowpass', 180)
  kit.loop(noise.brown, eN, 0.9)
  eN.connect(eF)
  eF.connect(engine)
  // Polite music from the reception ceiling.
  const speaker = kit.spatial(140, 3.2, -5.5, { send: 0.25, ref: 5, category: 'music' })
  layers.muzak = speaker.gain
  const mF = filter(ctx, 'lowpass', 2200)
  mF.connect(speaker.gain)
  const voices = [0, 1, 2].map((i) => kit.osc('triangle', MUZAK[i], mF, 0.035))
  // The prep room: cool air, a fluorescent whine.
  const clinic = layer('clinic', 0.08)
  const clF = filter(ctx, 'lowpass', 300)
  kit.loop(noise.brown, clF, 0.8)
  clF.connect(clinic)
  kit.osc('sine', 12000, clinic, 0.0012)
  // The helmet's scan hum: rises with the band.
  const scan = layer('scan', 0.1)
  const scF = filter(ctx, 'lowpass', 900)
  const scO = kit.osc('sawtooth', 160, scF, 0.06)
  const scO2 = kit.osc('sine', 320, scF, 0.03)
  scF.connect(scan)
  // The white room's thin tone.
  const roomTone = layer('roomTone')
  kit.osc('sine', 7600, roomTone, 0.004)
  const rtF = filter(ctx, 'highpass', 5000)
  kit.loop(noise.white, rtF, 1)
  const rtG = ctx.createGain()
  rtG.gain.value = 0.02
  rtF.connect(rtG).connect(roomTone)
  // The low hum of the transformation.
  const hum = layer('hum', 0.2)
  const hF = filter(ctx, 'lowpass', 160)
  const hO = kit.osc('sine', 48, hF, 0.5)
  const hO2 = kit.osc('sawtooth', 96, hF, 0.08)
  hF.connect(hum)
  // Granular crackle: a bed under the clicks.
  const crackle = layer('crackle', 0.2)
  const crF = filter(ctx, 'bandpass', 3200, 1.2)
  kit.loop(noise.white, crF, 1)
  const crG = ctx.createGain()
  crG.gain.value = 0.06
  kit.lfo(crG.gain, 13, 0.05)
  crF.connect(crG).connect(crackle)
  // The explainer's jingle, from the locker-room screen.
  const screenSpot = kit.spatial(136, 1.8, -18.9, { send: 0.15, ref: 3, category: 'music' })
  layers.jingle = screenSpot.gain
  const jF = filter(ctx, 'lowpass', 4000)
  jF.connect(screenSpot.gain)
  // The van's idle.
  const diesel = layer('diesel', 0.1)
  const dF = filter(ctx, 'lowpass', 160)
  kit.osc('sawtooth', 29, dF, 0.14)
  kit.osc('sine', 58, dF, 0.08)
  const dG = ctx.createGain()
  dG.gain.value = 0.7
  kit.lfo(dG.gain, 11.5, 0.3)
  dF.connect(dG).connect(diesel)
  // The conveyor: a low rumble; the clank comes from a clock.
  const belt = layer('belt', 0.3)
  const bF = filter(ctx, 'lowpass', 150)
  kit.loop(noise.brown, bF, 0.8)
  kit.osc('sine', 44, bF, 0.3)
  bF.connect(belt)
  // The wash: spray and the brushes' whirr.
  const wash = layer('wash', 0.3)
  const wF = filter(ctx, 'bandpass', 2600, 0.7)
  kit.loop(noise.white, wF, 1)
  wF.connect(wash)
  const brF = filter(ctx, 'lowpass', 420)
  kit.osc('sawtooth', 66, brF, 0.07)
  const brG = ctx.createGain()
  brG.gain.value = 0.7
  kit.lfo(brG.gain, 6.5, 0.4)
  brF.connect(brG).connect(wash)
  // The reading voice: a flat official sawtooth through two formants, syllables from a clock, a hall around it.
  const voice = layer('voice', 0.0)
  const vIn = ctx.createGain()
  vIn.gain.value = 1
  const vO = kit.osc('sawtooth', 104, vIn, 0.5)
  const vF1 = filter(ctx, 'bandpass', 540, 7)
  const vF2 = filter(ctx, 'bandpass', 1180, 9)
  const vG = ctx.createGain()
  vG.gain.value = 0.15
  vIn.connect(vF1).connect(vG)
  vIn.connect(vF2).connect(vG)
  vG.connect(voice)
  const vSend = ctx.createGain()
  vSend.gain.value = 1.2
  vG.connect(vSend).connect(kit.verb)
  // Sirens and a courtroom murmur behind the voice.
  const courtroom = layer('courtroom', 0.5)
  const siren = kit.osc('sine', 700, courtroom, 0.02)
  kit.lfo(siren.o.frequency, 0.28, 150)
  const siren2 = kit.osc('triangle', 520, courtroom, 0.012)
  kit.lfo(siren2.o.frequency, 0.41, 110)
  const muF = filter(ctx, 'bandpass', 420, 0.8)
  kit.loop(noise.pink, muF, 1.05)
  const muG = ctx.createGain()
  muG.gain.value = 0.5
  kit.lfo(muG.gain, 0.6, 0.25)
  muF.connect(muG).connect(courtroom)
  // The injection station's sterile hum.
  const station = layer('station', 0.1)
  const saF = filter(ctx, 'lowpass', 400)
  kit.loop(noise.brown, saF, 0.8)
  kit.osc('sine', 50, saF, 0.06)
  saF.connect(station)
  kit.osc('sine', 9800, station, 0.002)
  // Breath (shaped by hand in update) and the heart (a clock).
  const breath = layer('breath')
  const brthF = filter(ctx, 'bandpass', 480, 0.5)
  kit.loop(noise.pink, brthF, 0.7)
  const brthG = ctx.createGain()
  brthG.gain.value = 0
  brthF.connect(brthG).connect(breath)
  const heart = layer('heart')

  // ——— One-shot makers ———
  const thud = (peak: number, out: AudioNode = fx) => {
    burst(ctx, noise.brown, out, { freq: 150, type: 'lowpass', env: { attack: 0.004, decay: 0.32, peak } })
    tone(ctx, out, { freq: 72, to: 40, glide: 0.3, env: { attack: 0.003, decay: 0.38, peak: peak * 0.5 } })
  }
  const click = (freq: number, peak: number, decay = 0.04, out: AudioNode = fx, pan = 0) =>
    burst(ctx, noise.white, out, { freq, q: 2.5, env: { attack: 0.001, decay, peak }, pan })
  /** The airtight door: a slide of air, then the seal's thunk. The one sample of ch. 4, 7 and 9. */
  const doorHiss = (opening: boolean) => {
    burst(ctx, noise.white, fx, { freq: 1800, q: 0.6, env: { attack: opening ? 0.05 : 0.3, decay: opening ? 0.9 : 0.35, peak: 0.06 } })
    tone(ctx, fx, { freq: 110, to: 60, glide: 0.5, env: { attack: 0.01, decay: 0.5, peak: 0.03 }, delay: opening ? 0.05 : 0.55 })
    burst(ctx, noise.brown, fx, { freq: 200, type: 'lowpass', env: { attack: 0.003, decay: 0.3, peak: 0.16 }, rate: 0.8 })
    setTimeout(() => thud(0.12), opening ? 60 : 560)
  }
  const chime = (out: AudioNode, a = 659.25, b = 987.77, peak = 0.02) => {
    tone(ctx, out, { freq: a, env: { attack: 0.005, decay: 0.5, peak } })
    tone(ctx, out, { freq: b, env: { attack: 0.005, decay: 0.7, peak: peak * 0.9 }, delay: 0.14 })
  }
  const servo = (peak = 0.03, from = 320, to = 480, len = 0.5) => {
    tone(ctx, fx, { freq: from, to, glide: len, type: 'sawtooth', env: { attack: 0.03, decay: len, peak } })
    burst(ctx, noise.pink, fx, { freq: 2400, q: 1, env: { attack: 0.03, decay: len, peak: peak * 0.6 } })
  }
  const hiss = (peak = 0.05, len = 0.25) => burst(ctx, noise.white, fx, { freq: 5200, q: 0.8, env: { attack: 0.01, decay: len, peak } })
  const chains = (n = 6, peak = 0.03) => {
    for (let i = 0; i < n; i++) tone(ctx, fx, { freq: 2600 + Math.random() * 1800, type: 'triangle', env: { attack: 0.001, decay: 0.07 + Math.random() * 0.08, peak }, delay: i * 0.045 + Math.random() * 0.04 })
    burst(ctx, noise.white, fx, { freq: 3800, q: 1.5, env: { attack: 0.002, decay: 0.2, peak: peak * 1.5 } })
  }
  /** The boss's laugh: big, warm, careless (ch. 1 and, identical, the copy's). */
  const laugh = (out: AudioNode, n = 7, pitch = 150) => {
    for (let i = 0; i < n; i++) {
      const t = i * 0.16 + Math.random() * 0.02
      const f = pitch * (1 - i * 0.03)
      setTimeout(() => {
        burst(ctx, noise.pink, out, { freq: 900, q: 1.2, env: { attack: 0.02, decay: 0.12, peak: 0.07 } })
        tone(ctx, out, { freq: f, type: 'sawtooth', env: { attack: 0.02, decay: 0.13, peak: 0.02 } })
        tone(ctx, out, { freq: f * 2.02, type: 'triangle', env: { attack: 0.02, decay: 0.1, peak: 0.012 } })
      }, t * 1000)
    }
  }
  /** A voice without words: formant blips at a pitch (the boss low, Arif higher). */
  const mumble = (pitch: number, n: number, peak: number, out: AudioNode = fx) => {
    for (let i = 0; i < n; i++) {
      const f = pitch * (0.92 + Math.random() * 0.18)
      const d = i * 0.13 + Math.random() * 0.05
      tone(ctx, out, { freq: f, type: 'sawtooth', env: { attack: 0.02, decay: 0.1, peak: peak * 0.3 }, delay: d })
      setTimeout(() => burst(ctx, noise.pink, out, { freq: 700 + Math.random() * 600, q: 3, env: { attack: 0.02, decay: 0.1, peak } }), d * 1000)
    }
  }
  /** Arif's shout: a harsh sustained formant with a hard edge. */
  const shout = (len: number, peak = 0.12, pitch = 190) => {
    tone(ctx, fx, { freq: pitch, to: pitch * 1.15, glide: len * 0.4, type: 'sawtooth', env: { attack: 0.03, decay: len, peak: peak * 0.35 } })
    burst(ctx, noise.pink, fx, { freq: 1100, q: 2, env: { attack: 0.03, decay: len, peak } })
    burst(ctx, noise.pink, fx, { freq: 2300, q: 3, env: { attack: 0.02, decay: len * 0.7, peak: peak * 0.5 } })
  }
  /** A blow that never lands on screen: a muffled thud married to a white flash of noise. */
  const blow = (peak: number) => {
    thud(peak)
    burst(ctx, noise.white, fx, { freq: 3000, q: 0.5, env: { attack: 0.002, decay: 0.16, peak: peak * 0.45 } })
  }
  const step = (kind: 'carpet' | 'hard' | 'stair' | 'soft' | 'boot', pan: number) => {
    if (kind === 'carpet') burst(ctx, noise.brown, fx, { freq: 220, type: 'lowpass', env: { attack: 0.004, decay: 0.09, peak: 0.1 }, pan })
    else if (kind === 'soft') burst(ctx, noise.brown, fx, { freq: 300, type: 'lowpass', env: { attack: 0.006, decay: 0.08, peak: 0.07 }, pan })
    else if (kind === 'boot') {
      burst(ctx, noise.brown, fx, { freq: 200, type: 'lowpass', env: { attack: 0.003, decay: 0.14, peak: 0.18 }, pan })
      click(2600, 0.012, 0.03, fx, pan)
    } else {
      const out = kind === 'stair' ? hall : fx
      burst(ctx, noise.brown, out, { freq: 260, type: 'lowpass', env: { attack: 0.003, decay: 0.1, peak: kind === 'stair' ? 0.2 : 0.14 }, pan })
      click(3200, 0.022, 0.03, out, pan)
    }
  }

  // ——— Clocks ———
  let lastP = -1
  let lastStep = 0
  let chord = 0
  let chordClock = 2
  let keyClock = 0.2
  let phoneClock = 3
  let crackClock = 0
  let clankClock = 0
  let jingleStep = 0
  let jingleClock = 0
  let syllable = 0
  let gavelClock = 2.5
  let heartClock = 0
  let curseClock = 0
  let breathPhase = 0

  const crossings = (from: number, to: number, flags: ReadonlySet<string>) => {
    const crossed = (seg: SegmentId, u: number) => from < at(seg, u) && to >= at(seg, u)
    const two = flags.has('copies:two')
    // 01 — İSTİFA
    if (crossed('knock', 0.52)) click(900, 0.2, 0.08)
    if (crossed('knock', 0.55)) click(900, 0.22, 0.08)
    if (crossed('knock', 0.6)) mumble(120, 1, 0.025)
    if (crossed('enter', 0.34)) click(2200, 0.05, 0.05)
    if (crossed('enter', 0.78)) {
      click(1800, 0.06, 0.04)
      thud(0.07)
    }
    if (crossed('laugh', 0.03)) laugh(fx)
    if (crossed('laugh', 0.3)) mumble(120, 3, 0.02)
    if (crossed('shh', 0.36)) hiss(0.035, 0.4)
    if (crossed('leave', 0.28)) {
      click(2200, 0.05, 0.05)
      tone(ctx, fx, { freq: 170, to: 240, glide: 0.5, type: 'sawtooth', env: { attack: 0.06, decay: 0.5, peak: 0.005 } })
    }
    if (crossed('leave', 0.7)) mumble(140, 5, 0.02)
    if (crossed('leave', 0.82)) mumble(140, 3, 0.015)
    // 02 — YOL
    if (crossed('pack', 0.08)) {
      for (let i = 0; i < 3; i++) setTimeout(() => burst(ctx, noise.brown, fx, { freq: 260, type: 'lowpass', env: { attack: 0.02, decay: 0.3, peak: 0.12 }, pan: Math.random() - 0.5 }), i * 420)
      for (let i = 0; i < 2; i++) setTimeout(() => burst(ctx, noise.white, fx, { freq: 2800, q: 0.9, env: { attack: 0.05, decay: 0.35, peak: 0.03 }, pan: Math.random() - 0.5 }), 300 + i * 700)
    }
    if (crossed('pack', 0.1)) click(2600, 0.03, 0.03)
    if (crossed('elevator', 0.05)) chime(fx, 1318.5, 1046.5, 0.03)
    if (crossed('elevator', 0.72)) {
      burst(ctx, noise.pink, fx, { freq: 600, q: 0.5, env: { attack: 0.2, decay: 0.7, peak: 0.07 } })
      setTimeout(() => thud(0.1), 750)
    }
    if (crossed('stairs', 0.03)) {
      thud(0.2, hall)
      click(1200, 0.08, 0.1, hall)
    }
    if (crossed('car', 0.06)) {
      click(1000, 0.14, 0.1, hall)
      thud(0.14, hall)
    }
    if (crossed('car', 0.22)) burst(ctx, noise.pink, fx, { freq: 400, q: 0.4, env: { attack: 0.2, decay: 1.2, peak: 0.1 } })
    if (crossed('car', 0.5)) burst(ctx, noise.brown, fx, { freq: 320, type: 'lowpass', env: { attack: 0.02, decay: 0.2, peak: 0.1 } })
    if (crossed('car', 0.58)) {
      thud(0.2)
      click(1400, 0.05, 0.05)
    }
    if (crossed('route', 0.4)) {
      tone(ctx, fx, { freq: 1046.5, env: { attack: 0.003, decay: 0.12, peak: 0.03 } })
      tone(ctx, fx, { freq: 1396.9, env: { attack: 0.003, decay: 0.2, peak: 0.03 }, delay: 0.12 })
    }
    for (const u of [0.12, 0.17, 0.22, 0.27, 0.32, 0.37]) if (crossed('route', u)) click(3400, 0.012, 0.02)
    if (crossed('dusk', 0.03)) {
      for (let i = 0; i < 4; i++) setTimeout(() => burst(ctx, noise.brown, fx, { freq: 120, type: 'lowpass', env: { attack: 0.01, decay: 0.09, peak: 0.12 } }), i * 120)
      tone(ctx, fx, { freq: 40, to: 60, glide: 0.8, type: 'sawtooth', env: { attack: 0.3, decay: 0.8, peak: 0.04 } })
    }
    // 03 — HİZMET
    if (crossed('arrive', 0.3)) thud(0.1)
    if (crossed('arrive', 0.4)) {
      click(1400, 0.05, 0.05)
      thud(0.16)
    }
    if (crossed('arrive', 0.6)) burst(ctx, noise.pink, fx, { freq: 1500, q: 0.5, env: { attack: 0.2, decay: 0.7, peak: 0.05 } })
    if (crossed('welcome', 0.04)) chime(fx, 783.99, 1174.7, 0.025)
    if (crossed('helmet', 0.25)) servo(0.035, 420, 300, 0.9)
    if (crossed('helmet', 0.55)) tone(ctx, fx, { freq: 880, env: { attack: 0.02, decay: 0.35, peak: 0.015 } })
    if (crossed('map', 0.03)) for (const [i, f] of [783.99, 987.77, 1318.5].entries()) tone(ctx, fx, { freq: f, env: { attack: 0.005, decay: 0.45, peak: 0.03 }, delay: i * 0.14 })
    if (crossed('map', 0.1)) servo(0.03, 300, 440, 0.8)
    if (crossed('map', 0.5)) for (let i = 0; i < 3; i++) tone(ctx, fx, { freq: 1568 + i * 200, env: { attack: 0.002, decay: 0.12, peak: 0.015 }, delay: i * 0.1 })
    if (crossed('map', 0.63)) chime(fx, 1046.5, 1318.5, 0.02)
    if (crossed('copies', 0.57)) chime(fx, 1046.5, 1318.5, 0.02)
    if (two && crossed('copies', 0.68)) tone(ctx, fx, { freq: 1046.5, to: 1318.5, glide: 0.15, env: { attack: 0.005, decay: 0.25, peak: 0.02 } })
    if (crossed('lens', 0.2)) servo(0.025, 360, 300, 0.7)
    if (crossed('lens', 0.45)) hiss(0.06, 0.3)
    if (crossed('pill', 0.25)) click(2200, 0.02, 0.05)
    if (crossed('pill', 0.4)) tone(ctx, fx, { freq: 160, to: 90, glide: 0.18, type: 'triangle', env: { attack: 0.03, decay: 0.2, peak: 0.03 } })
    if (crossed('clothes', 0.05)) {
      click(1700, 0.1, 0.08)
      tone(ctx, fx, { freq: 2400, type: 'triangle', env: { attack: 0.002, decay: 0.3, peak: 0.02 } })
    }
    if (crossed('clothes', 0.32)) burst(ctx, noise.white, fx, { freq: 2600, q: 0.9, env: { attack: 0.05, decay: 0.5, peak: 0.035 } })
    if (crossed('clothes', 0.9)) click(3600, 0.015, 0.05)
    // 04 — ODA
    if (crossed('white', 0.7)) doorHiss(true)
    if (crossed('close', 0.3)) doorHiss(false)
    if (crossed('pixels', 0.04)) tone(ctx, fx, { freq: 2800, to: 1900, glide: 0.4, type: 'triangle', env: { attack: 0.002, decay: 0.45, peak: 0.02 } })
    // 05 — NÖBET
    if (crossed('trigger', 0.08)) {
      if (flags.has('moment:laugh')) {
        laugh(fx)
        if (two) laugh(fx, 7, 152)
      } else if (flags.has('moment:money')) {
        mumble(120, 6, 0.028)
        if (two) mumble(122, 6, 0.028)
      } else {
        hiss(0.04, 0.45)
        setTimeout(() => mumble(120, 5, 0.025), 500)
        if (two) hiss(0.04, 0.45)
      }
    }
    if (crossed('collar', 0.1)) burst(ctx, noise.brown, fx, { freq: 400, type: 'lowpass', env: { attack: 0.02, decay: 0.25, peak: 0.12 } })
    if (crossed('collar', 0.3)) {
      thud(0.3)
      for (let i = 0; i < 4; i++) setTimeout(() => click(1400 + Math.random() * 800, 0.06, 0.08), 120 + i * 90)
    }
    if (crossed('collar', 0.52)) shout(0.9, 0.11)
    if (crossed('shout', 0.05)) shout(1.0, 0.13)
    if (crossed('shout', 0.47)) shout(1.3, 0.16, 200)
    for (const u of [0.08, 0.2, 0.32, 0.44]) if (crossed('blows', u)) blow(0.32 + (u - 0.08) * 0.4)
    if (crossed('blows', 0.55)) {
      thud(0.42)
      burst(ctx, noise.white, fx, { freq: 2800, q: 0.5, env: { attack: 0.002, decay: 0.22, peak: 0.12 } })
    }
    if (crossed('blows', 0.6)) for (let i = 0; i < 5; i++) tone(ctx, fx, { freq: 3800 + Math.random() * 2600, env: { attack: 0.001, decay: 0.1 + Math.random() * 0.1, peak: 0.02 }, delay: i * 0.05 + Math.random() * 0.05 })
    if (crossed('blows', 0.78)) {
      thud(0.4)
      burst(ctx, noise.white, fx, { freq: 2800, q: 0.5, env: { attack: 0.002, decay: 0.22, peak: 0.1 } })
    }
    if (crossed('monitor', 0.12)) {
      // The monitor as a digital crunch: a pitched noise falling into cells, not glass.
      burst(ctx, noise.white, fx, { freq: 4200, q: 0.3, env: { attack: 0.002, decay: 0.28, peak: 0.18 } })
      tone(ctx, fx, { freq: 1400, to: 90, glide: 0.3, type: 'square', env: { attack: 0.002, decay: 0.3, peak: 0.03 } })
      for (let i = 0; i < 10; i++) setTimeout(() => click(2000 + Math.random() * 4000, 0.03, 0.02, fx, Math.random() - 0.5), 60 + i * 35)
    }
    if (crossed('monitor', 0.4)) burst(ctx, noise.white, fx, { freq: 5000, q: 0.4, env: { attack: 0.002, decay: 0.18, peak: 0.08 } })
    if (crossed('monitor', 0.58)) {
      click(1100, 0.07, 0.1)
      for (let i = 0; i < 8; i++) setTimeout(() => click(2400 + Math.random() * 2000, 0.03, 0.05, fx, Math.random() * 0.8 - 0.4), 250 + i * 120 + Math.random() * 60)
    }
    if (crossed('monitor', 0.82)) burst(ctx, noise.white, fx, { freq: 3400, q: 0.3, env: { attack: 0.03, decay: 0.8, peak: 0.1 } })
    if (two && crossed('subside', 0.48)) burst(ctx, noise.white, fx, { freq: 3400, q: 0.3, env: { attack: 0.01, decay: 0.5, peak: 0.1 } })
    // 06 — HİZMETİN BEDELİ
    if (crossed('done', 0.45)) chime(fx, 783.99, 1174.7, 0.025)
    if (crossed('done', 0.6)) doorHiss(true)
    if (crossed('executed', 0.5)) for (const [i, f] of CHORD_END.entries()) tone(ctx, jF, { freq: f, type: 'triangle', env: { attack: 0.01, decay: 1.6, peak: 0.05 }, delay: i * 0.07 })
    if (crossed('away', 0.12)) burst(ctx, noise.white, fx, { freq: 2600, q: 0.9, env: { attack: 0.05, decay: 0.5, peak: 0.035 } })
    if (crossed('away', 0.2)) burst(ctx, noise.white, fx, { freq: 2600, q: 0.9, env: { attack: 0.05, decay: 0.4, peak: 0.03 } })
    if (crossed('away', 0.5)) {
      click(1700, 0.1, 0.08)
      tone(ctx, fx, { freq: 2400, type: 'triangle', env: { attack: 0.002, decay: 0.3, peak: 0.02 } })
    }
    if (crossed('away', 0.7)) burst(ctx, noise.pink, fx, { freq: 1500, q: 0.5, env: { attack: 0.2, decay: 0.7, peak: 0.05 } })
    if (crossed('away', 0.8)) {
      thud(0.16)
      click(1400, 0.05, 0.05)
    }
    if (crossed('away', 0.82)) {
      for (let i = 0; i < 4; i++) setTimeout(() => burst(ctx, noise.brown, fx, { freq: 120, type: 'lowpass', env: { attack: 0.01, decay: 0.09, peak: 0.1 } }), i * 120)
      tone(ctx, fx, { freq: 40, to: 60, glide: 0.8, type: 'sawtooth', env: { attack: 0.3, decay: 0.8, peak: 0.035 } })
    }
    // 07 — TEMİZLİK
    if (crossed('staff', 0.08)) doorHiss(true)
    // The pulls (actD): one 0.4–0.95; two 0.36–0.6, then back for the second 0.68–0.95.
    if (crossed('drag', two ? 0.36 : 0.4)) burst(ctx, noise.pink, fx, { freq: 700, q: 0.6, env: { attack: 0.5, decay: 2.2, peak: 0.07 } })
    if (two && crossed('drag', 0.68)) burst(ctx, noise.pink, fx, { freq: 700, q: 0.6, env: { attack: 0.3, decay: 1.4, peak: 0.06 } })
    if (crossed('cleaners', 0.08)) for (let i = 0; i < 3; i++) setTimeout(() => click(600 + Math.random() * 500, 0.05, 0.12), i * 300)
    if (crossed('cleaners', 0.2)) {
      burst(ctx, noise.pink, fx, { freq: 900, q: 0.6, env: { attack: 0.02, decay: 0.5, peak: 0.08 } })
      tone(ctx, fx, { freq: 90, to: 110, glide: 0.4, type: 'triangle', env: { attack: 0.05, decay: 0.45, peak: 0.03 } })
    }
    // Mop strokes once he is at the corner (0.42).
    for (const u of [0.45, 0.55, 0.65, 0.75, 0.85]) if (crossed('cleaners', u)) burst(ctx, noise.pink, fx, { freq: 1200, q: 0.5, env: { attack: 0.12, decay: 0.35, peak: 0.035 }, pan: (u - 0.65) * 2 })
    if (crossed('cleaners', 0.5)) tone(ctx, fx, { freq: 300, to: 640, glide: 0.6, type: 'sawtooth', env: { attack: 0.4, decay: 2.4, peak: 0.012 } })
    if (crossed('restart', 0.35)) doorHiss(false)
    if (crossed('restart', 0.55)) {
      tone(ctx, fx, { freq: 1760, env: { attack: 0.003, decay: 0.25, peak: 0.03 } })
      setTimeout(() => {
        burst(ctx, noise.brown, fx, { freq: 140, type: 'lowpass', env: { attack: 0.05, decay: 0.6, peak: 0.16 } })
        servo(0.02, 200, 260, 1.4)
      }, 500)
    }
    // 08 — 333
    if (crossed('van', 0.05)) {
      for (let i = 0; i < 2; i++) setTimeout(() => {
        click(1500, 0.12, 0.08)
        tone(ctx, fx, { freq: 180, to: 140, glide: 0.4, type: 'sawtooth', env: { attack: 0.05, decay: 0.45, peak: 0.012 } })
      }, i * 650)
    }
    if (crossed('record', 0.1)) chains(5, 0.025)
    if (crossed('record', 0.4)) chains(4, 0.02)
    if (crossed('hood', 0.3)) chains(8, 0.035)
    if (crossed('platform', 0.2)) chains(5, 0.025)
    for (const u of [0.42, 0.52, 0.62]) if (crossed('platform', u)) click(900, 0.12, 0.12)
    if (crossed('platform', 0.5)) tone(ctx, fx, { freq: 60, to: 95, glide: 1.2, type: 'sawtooth', env: { attack: 0.2, decay: 1.5, peak: 0.04 } })
    if (crossed('wash', 0.3)) tone(ctx, fx, { freq: 880, env: { attack: 0.01, decay: 0.3, peak: 0.02 } })
    if (crossed('wash', 0.48)) burst(ctx, noise.white, fx, { freq: 1600, q: 0.5, env: { attack: 0.05, decay: 0.9, peak: 0.1 } })
    if (crossed('wash', 0.64)) burst(ctx, noise.white, fx, { freq: 3400, q: 0.5, env: { attack: 0.08, decay: 1.0, peak: 0.1 } })
    if (crossed('wash', 0.8)) tone(ctx, fx, { freq: 55, to: 80, glide: 1.0, type: 'sawtooth', env: { attack: 0.2, decay: 1.4, peak: 0.05 } })
    if (crossed('reading', 0.3)) servo(0.03, 260, 340, 1.0)
    if (crossed('reading', 0.52)) {
      thud(0.3, hall)
      burst(ctx, noise.brown, hall, { freq: 90, type: 'lowpass', env: { attack: 0.01, decay: 1.2, peak: 0.3 } })
    }
    if (crossed('reading', 0.7)) {
      click(500, 0.16, 0.14, hall)
      setTimeout(() => click(500, 0.16, 0.14, hall), 260)
    }
    if (crossed('inject', 0.05)) servo(0.025, 300, 380, 0.6)
    if (crossed('inject', 0.2)) tone(ctx, fx, { freq: 160, to: 90, glide: 0.18, type: 'triangle', env: { attack: 0.03, decay: 0.2, peak: 0.025 } })
    if (crossed('inject', 0.23)) servo(0.025, 360, 300, 0.6)
    if (crossed('inject', 0.3)) hiss(0.06, 0.3)
    if (crossed('inject', 0.38)) servo(0.02, 400, 460, 0.4)
    if (crossed('inject', 0.42)) click(1300, 0.09, 0.06)
    if (crossed('inject', 0.52)) for (let i = 0; i < 2; i++) setTimeout(() => click(900, 0.1, 0.12), i * 200)
    if (crossed('inject', 0.58)) {
      servo(0.03, 240, 180, 1.2)
      setTimeout(() => thud(0.14), 1100)
    }
    // 09 — KAPI (through the lowpass)
    if (crossed('floor', 0.05)) {
      burst(ctx, noise.brown, fx, { freq: 140, type: 'lowpass', env: { attack: 0.05, decay: 0.6, peak: 0.16 } })
      servo(0.02, 200, 260, 1.4)
    }
    if (crossed('floor', 0.5)) thud(0.1)
    if (crossed('doorOpens', 0.12)) doorHiss(true)
    if (crossed('enters', 0.6)) doorHiss(false)
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion, flags } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.15)
      const seg = segmentAt(p).id
      const lv = (id: LayerId) => evalNumber(MIX[id], p)

      // 333's eyes: everything under water from the floor; nothing at all after the cut to black.
      const underwater = p >= at('floor', 0.47) && p < SEG.black.start
      const black = p >= SEG.black.start
      bedLP.frequency.setTargetAtTime(underwater ? 480 : 18000, now, 0.25)
      fxLP.frequency.setTargetAtTime(underwater ? 520 : 18000, now, 0.25)
      bed.gain.setTargetAtTime(black ? 0 : 1, now, black ? 0.01 : 0.2)
      fx.gain.setTargetAtTime(black ? 0 : 1, now, black ? 0.01 : 0.2)

      // Keyboards in the open office, somebody's phone now and then.
      const off = lv('office')
      if (off > 0.05) {
        keyClock -= dt
        if (keyClock <= 0) {
          keyClock = 0.07 + Math.random() * 0.2
          burst(ctx, noise.white, fx, { freq: 1600 + Math.random() * 1200, q: 2.5, env: { attack: 0.001, decay: 0.03, peak: 0.03 * off }, pan: Math.random() * 1.4 - 0.7 })
        }
        phoneClock -= dt
        if (phoneClock <= 0) {
          phoneClock = 9 + Math.random() * 8
          for (let i = 0; i < 2; i++) tone(ctx, fx, { freq: 1200, type: 'square', env: { attack: 0.01, decay: 0.35, peak: 0.004 * off }, delay: i * 0.5, pan: 0.6 })
        }
      }
      // The muzak never quite resolves.
      chordClock -= dt
      if (chordClock <= 0) {
        chordClock = 4.5
        chord = (chord + 1) % MUZAK.length
        voices.forEach((v, i) => v.o.frequency.setTargetAtTime(MUZAK[(chord + i * 2) % MUZAK.length] / (i === 2 ? 2 : 1), now, 0.4))
      }
      // The scan's pitch climbs with its band.
      const sc = lv('scan')
      scO.o.frequency.setTargetAtTime(150 + 260 * sc, now, 0.3)
      scO2.o.frequency.setTargetAtTime(300 + 520 * sc, now, 0.3)
      // The engine's note with the drive.
      const drive = seg === 'dusk' ? clamp(p - SEG.dusk.start) / SEG.dusk.len : seg === 'away' ? 0.6 : 0.2
      eng.o.frequency.setTargetAtTime(48 + 30 * Math.min(1, drive * 1.5), now, 0.5)
      // The hum rises as the colour spreads.
      const hm = lv('hum')
      hO.o.frequency.setTargetAtTime(44 + 30 * hm, now, 0.4)
      hO2.o.frequency.setTargetAtTime(88 + 60 * hm, now, 0.4)
      // Ice settling: tiny clicks while the cells arrive.
      const cr = lv('crackle')
      if (cr > 0.02) {
        crackClock -= dt
        if (crackClock <= 0) {
          crackClock = 0.02 + Math.random() * 0.1
          click(2400 + Math.random() * 5000, 0.02 * cr, 0.012 + Math.random() * 0.02, fx, Math.random() * 1.6 - 0.8)
        }
      }
      // The explainer's tune: a xylophone and a plucked string, bright and in time.
      const jg = lv('jingle')
      if (jg > 0.02 && p < at('executed', 0.5)) {
        jingleClock -= dt
        if (jingleClock <= 0) {
          jingleClock = 0.2
          const f = JINGLE[jingleStep % JINGLE.length]
          if (f > 0) {
            tone(ctx, jF, { freq: f, type: 'triangle', env: { attack: 0.003, decay: 0.28, peak: 0.07 } })
            tone(ctx, jF, { freq: f * 3, type: 'sine', env: { attack: 0.003, decay: 0.1, peak: 0.015 } })
            if (jingleStep % 4 === 0) tone(ctx, jF, { freq: f / 4, type: 'sawtooth', env: { attack: 0.004, decay: 0.16, peak: 0.03 } })
          }
          jingleStep++
        }
      }
      // The conveyor's clank.
      const bl = lv('belt')
      if (bl > 0.03) {
        clankClock -= dt
        if (clankClock <= 0) {
          clankClock = 0.46
          burst(ctx, noise.white, hall, { freq: 1100, q: 4, env: { attack: 0.002, decay: 0.12, peak: 0.1 * bl } })
          burst(ctx, noise.brown, fx, { freq: 180, type: 'lowpass', env: { attack: 0.003, decay: 0.12, peak: 0.25 * bl } })
        }
      }
      // The reading voice's syllables, and the gavel behind it.
      const vc = lv('voice')
      if (vc > 0.03) {
        syllable -= dt
        if (syllable <= 0) {
          syllable = 0.11 + Math.random() * 0.2
          vO.o.frequency.setTargetAtTime(96 + Math.random() * 22, now, 0.03)
          vG.gain.cancelScheduledValues(now)
          vG.gain.setValueAtTime(0.9, now)
          vG.gain.exponentialRampToValueAtTime(0.12, now + 0.1 + Math.random() * 0.08)
        }
      }
      if (lv('courtroom') > 0.03) {
        gavelClock -= dt
        if (gavelClock <= 0) {
          gavelClock = 2.8 + Math.random() * 3
          click(500, 0.14, 0.14, hall)
          setTimeout(() => click(500, 0.12, 0.14, hall), 240)
        }
      }
      // Breath: heaving after the fit, slow and drugged on the floor.
      const br = lv('breath')
      const rate = p < SEG.done.end ? 0.55 : 0.2
      breathPhase += dt * rate
      const cycle = Math.sin(breathPhase * Math.PI * 2)
      brthG.gain.setTargetAtTime(br > 0.01 ? 0.55 + 0.45 * cycle : 0, now, 0.05)
      brthF.frequency.setTargetAtTime(cycle > 0 ? 620 : 380, now, 0.2)
      // A slow heart.
      const ht = lv('heart')
      if (ht > 0.03) {
        heartClock -= dt
        if (heartClock <= 0) {
          heartClock = 1.15
          burst(ctx, noise.brown, heart, { freq: 70, type: 'lowpass', env: { attack: 0.01, decay: 0.16, peak: 0.6 } })
          setTimeout(() => burst(ctx, noise.brown, heart, { freq: 60, type: 'lowpass', env: { attack: 0.01, decay: 0.18, peak: 0.45 } }), 190)
        }
      }
      // Muffled cursing in Arif's voice as he comes.
      if (seg === 'comes' && p >= at('comes', 0.2) && !jumped) {
        curseClock -= dt
        if (curseClock <= 0) {
          curseClock = 0.5 + Math.random() * 0.5
          mumble(200, 3 + Math.floor(Math.random() * 3), 0.06)
          shout(0.25, 0.05, 210)
        }
      }
      // Footsteps on this chapter's floor.
      if (motion.step !== lastStep && motion.walking > 0.3 && !jumped) {
        const pan = motion.step % 2 ? 0.12 : -0.12
        const chapter = p < SEG.stairs.start ? 'carpet' : p < SEG.car.start ? 'stair' : p < at('car', 0.22) ? 'stair' : p < SEG.arrive.start ? 'hard' : p < SEG.white.start ? 'hard' : p < SEG.staff.start ? 'soft' : p < SEG.van.start ? 'boot' : p < SEG.floor.start ? 'hard' : 'soft'
        step(chapter, pan)
      }
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p, flags)
      lastP = p
    },
  }
}
