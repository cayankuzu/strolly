/**
 * TEKERRÜR's sound: an office at night. The air handling and the mains hum,
 * the server hall behind the glass, the fridge, the coffee machine, the city
 * three floors down, the corridor's fluorescent tube. The wall clock is
 * stopped; now and then its second hand tries. Music is rare: a few notes
 * where something is understood, nothing where the model runs out of depth.
 *
 * Layer levels are functions of progress (scrolling back restores them);
 * one-shots fire only on forward, un-jumped crossings.
 *
 * The scene reports which way the cup went in `motion.frame`
 * (0 = left on the desk, 1 = to the kitchen, 2 = into the drawer).
 */
import { linear } from '@/lib/math'
import { evalNumber, type Key } from '@/lib/track'
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'
import { burst, filter, tone } from '@/lib/audio/synth'
import { at, SEG, storyHours } from './timeline'

type LayerId = 'room' | 'servers' | 'fridge' | 'city' | 'corridor' | 'music'

const k = (p: number, v: number): Key<number> => [p, v, linear]

const MIX: Record<LayerId, Key<number>[]> = {
  room: [
    k(at('open', 0.1), 0),
    k(at('open', 0.7), 0.4),
    k(at('future', 0.9), 0.4),
    // The model runs out of depth: the room goes quiet with it.
    k(at('depth', 0.05), 0.04),
    k(at('you', 0.55), 0.04),
    k(at('you', 0.7), 0.4),
    k(at('leaving', 1), 0.4),
    k(at('empty', 0.3), 0.22),
    k(at('end', 0.3), 0.22),
    k(at('end', 0.9), 0),
  ],
  servers: [
    k(at('open', 0.2), 0),
    k(at('open', 0.8), 0.3),
    k(at('cup'), 0.3),
    // Modelling a person takes cooling.
    k(at('cup', 0.5), 0.5),
    k(at('selin', 1), 0.5),
    k(at('selinQuery', 0.5), 0.3),
    k(at('hall', 0.2), 0.55),
    k(at('future', 0.5), 0.55),
    k(at('future', 0.95), 0.85),
    k(at('depth', 0.05), 0.02),
    k(at('you', 0.55), 0.02),
    k(at('you', 0.7), 0.5),
    k(at('t0312', 1), 0.5),
    k(at('phone', 0.3), 0.3),
    k(at('end', 0.3), 0.3),
    k(at('end', 0.9), 0),
  ],
  fridge: [k(at('open', 0.3), 0), k(at('office'), 0.3), k(at('depth', 0.05), 0.3), k(at('depth', 0.1), 0), k(at('you', 0.7), 0), k(at('you', 0.9), 0.3), k(at('end', 0.5), 0)],
  city: [k(at('open', 0.2), 0), k(at('office', 0.4), 0.22), k(at('depth', 0.05), 0.22), k(at('depth', 0.1), 0), k(at('you', 0.7), 0), k(at('you', 0.9), 0.2), k(at('empty'), 0.1), k(at('end', 0.6), 0)],
  corridor: [k(at('cupChoice', 0.5), 0), k(at('cupChoice', 0.7), 0.3), k(at('selinQuery', 1), 0.3), k(at('late'), 0), k(at('leaving', 0.5), 0), k(at('leaving', 0.8), 0.3), k(at('leaving', 1), 0)],
  music: [
    k(at('test', 0.4), 0),
    k(at('test', 0.6), 0.35),
    k(at('small', 1), 0.15),
    k(at('calc', 0.3), 0.15),
    k(at('calc', 0.6), 0.4),
    k(at('particle'), 0.3),
    k(at('knowing', 1), 0.35),
    k(at('asking'), 0.15),
    k(at('because', 0.5), 0.4),
    k(at('inside', 1), 0.35),
    k(at('depth'), 0),
    k(at('you', 0.6), 0),
    k(at('t0312'), 0.4),
    k(at('t0312', 1), 0.2),
    k(at('wantKnow', 1), 0.2),
    k(at('record'), 0.35),
    k(at('questions', 1), 0.4),
    k(at('empty'), 0),
    k(at('observer2', 0.2), 0),
    k(at('accepted'), 0.45),
    k(at('end', 1), 0),
  ],
}

/** Few notes, a minor colour that never resolves. */
const NOTES = [196, 233.08, 261.63, 293.66, 349.23, 392, 466.16]

/** Windows where someone is typing at a keyboard. */
const TYPING: ReadonlyArray<readonly [number, number]> = [
  [at('query1', 0.04), at('query1', 0.3)],
  [at('selinQuery', 0.24), at('selinQuery', 0.44)],
  [at('selfref', 0.02), at('selfref', 0.16)],
  [at('homeQuery', 0.06), at('homeQuery', 0.3)],
]

export function createTekerrurAudio(kit: AudioKit): AudioProfile {
  const { ctx, noise } = kit
  const fx = kit.fx
  const layers = {} as Record<LayerId, GainNode>

  // The office: air handling (brown noise, low) and the mains hum.
  const room = (layers.room = kit.layer(0.08))
  const rF = filter(ctx, 'lowpass', 320)
  kit.loop(noise.brown, rF, 0.7)
  rF.connect(room)
  kit.osc('sine', 50, room, 0.035)
  kit.osc('sine', 100, room, 0.012)

  // The hall: fans, a whine above them. Heard through the glass from the office.
  const hall = kit.spatial(0, 1.6, -8.4, { ref: 3, send: 0.2 })
  layers.servers = hall.gain
  const fans = filter(ctx, 'bandpass', 700, 0.5)
  kit.loop(noise.pink, fans, 1)
  fans.connect(hall.gain)
  const whine = kit.osc('sine', 2950, hall.gain, 0.006)
  kit.lfo(whine.o.frequency, 0.07, 18)
  kit.osc('sawtooth', 120, filter(ctx, 'lowpass', 400), 0.02).g.connect(hall.gain)

  const fridge = kit.spatial(-4.68, 0.5, -1.25, { ref: 1.2 })
  layers.fridge = fridge.gain
  const fF = filter(ctx, 'lowpass', 220)
  fF.connect(fridge.gain)
  kit.osc('sawtooth', 50, fF, 0.05)

  // Ankara, three floors down: traffic as a wash, a car now and then.
  const city = kit.spatial(8, 0, 0, { ref: 4, send: 0.25 })
  layers.city = city.gain
  const cF = filter(ctx, 'lowpass', 600)
  kit.loop(noise.pink, cF, 0.5)
  cF.connect(city.gain)

  // The corridor's tube buzzes.
  const corridor = kit.spatial(1.5, 2.6, 5.3, { ref: 1.5 })
  layers.corridor = corridor.gain
  kit.osc('square', 100, filter(ctx, 'bandpass', 1200, 3), 0.01).g.connect(corridor.gain)

  const coffee = kit.spatial(-4.72, 1.0, 0.5, { ref: 1.2, category: 'sfx' })
  coffee.gain.gain.value = 1
  const clock = kit.spatial(0.6, 2.35, 3.98, { ref: 1.5, category: 'sfx' })
  clock.gain.gain.value = 1
  const desk = kit.spatial(0, 0.8, -0.6, { ref: 1, category: 'sfx' })
  desk.gain.gain.value = 1
  const door = kit.spatial(2.6, 1.2, 4.0, { ref: 1.5, category: 'sfx' })
  door.gain.gain.value = 1
  const kitchen = kit.spatial(-2.2, 1.2, 9.4, { ref: 1.5, category: 'sfx' })
  kitchen.gain.gain.value = 1

  const music = (layers.music = kit.layer(0.6, 'music'))
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.62
  const fb = ctx.createGain()
  fb.gain.value = 0.38
  const dLp = filter(ctx, 'lowpass', 1400)
  const keys = ctx.createGain()
  keys.connect(music)
  keys.connect(delay)
  delay.connect(dLp).connect(fb).connect(delay)
  dLp.connect(music)

  let lastP = -1
  let lastStep = 0
  let lastSecond = -1
  let carClock = 6
  let clockTry = 5
  let typeClock = 0
  let gurgle = 0
  let note = 0

  const click = (dest: AudioNode, freq: number, peak: number, delayS = 0) => tone(ctx, dest, { freq, type: 'square', env: { attack: 0.001, decay: 0.012, peak }, delay: delayS })
  const thud = (dest: AudioNode, freq: number, peak: number) => burst(ctx, noise.brown, dest, { freq, type: 'lowpass', env: { attack: 0.003, decay: 0.16, peak } })

  const shatter = (dest: AudioNode) => {
    burst(ctx, noise.white, dest, { freq: 4200, q: 0.8, type: 'highpass', env: { attack: 0.001, decay: 0.35, peak: 0.5 } })
    burst(ctx, noise.pink, dest, { freq: 900, q: 0.8, env: { attack: 0.001, decay: 0.12, peak: 0.35 } })
    for (let i = 0; i < 9; i++) tone(ctx, dest, { freq: 3200 + Math.random() * 3600, type: 'sine', env: { attack: 0.001, decay: 0.05 + Math.random() * 0.12, peak: 0.05 }, delay: 0.04 + Math.random() * 0.6 })
  }

  const chord = (freqs: number[], peak: number, decay = 4) => freqs.forEach((f, i) => tone(ctx, keys, { freq: f, env: { attack: 0.02, decay, peak }, delay: i * 0.07, pan: (i - 1) * 0.25 }))

  const crossings = (from: number, to: number, way: number) => {
    const crossed = (t: number) => from < t && to >= t
    // The coffee machine: a start, then it gurgles for a while.
    if (crossed(at('coffee', 0.02))) gurgle = 5
    if (crossed(at('coffee2', 0.1))) gurgle = 2.5
    // The pen: carpet takes most of it.
    if (crossed(at('drop', 0.14))) {
      thud(desk.gain, 700, 0.14)
      click(desk.gain, 1800, 0.02, 0.14)
    }
    // 212.
    if (crossed(at('test', 0.52))) chord([NOTES[0], NOTES[2], NOTES[4]], 0.03)
    // The cup's way.
    if (way === 2 && crossed(at('cupChoice', 0.55))) {
      burst(ctx, noise.pink, desk.gain, { freq: 500, env: { attack: 0.05, decay: 0.3, peak: 0.08 } })
      thud(desk.gain, 300, 0.12)
    }
    if (way === 2 && crossed(at('cupChoice', 0.7))) for (let i = 0; i < 2; i++) click(desk.gain, 2400, 0.03, i * 0.09)
    if (way === 1 && crossed(at('act', 0.62))) burst(ctx, noise.white, kitchen.gain, { freq: 1500, q: 0.5, env: { attack: 0.08, decay: 1.4, peak: 0.08 } })
    if (way === 1 && crossed(at('act', 0.86))) thud(kitchen.gain, 260, 0.18)
    // The tea glass.
    if (crossed(at('crash', way === 1 ? 0.5 : 0.55))) shatter(way === 1 ? door.gain : desk.gain)
    if (crossed(at('calc', 0.5))) chord([NOTES[1], NOTES[3], NOTES[5]], 0.025, 5)
    if (crossed(at('cloud', 0.45))) tone(ctx, keys, { freq: NOTES[6], env: { attack: 0.004, decay: 3, peak: 0.03 } })
    // CALCULATING runs out; "Size."
    if (crossed(at('depth', 0.03))) tone(ctx, fx, { freq: 80, to: 40, glide: 1.5, env: { attack: 0.01, decay: 1.6, peak: 0.08 } })
    if (crossed(at('you', 0.6))) tone(ctx, keys, { freq: NOTES[0] / 2, env: { attack: 0.01, decay: 6, peak: 0.05 } })
    if (crossed(at('t0312', 0.1))) chord([NOTES[0], NOTES[3], NOTES[6]], 0.022, 6)
    // The phone vibrates on the desk, twice.
    if (crossed(at('phone', 0.04))) {
      const buzz = filter(ctx, 'lowpass', 400)
      buzz.connect(desk.gain)
      for (let i = 0; i < 2; i++) tone(ctx, buzz, { freq: 160, type: 'sawtooth', env: { attack: 0.01, decay: 0.42, peak: 0.08 }, delay: i * 0.75 })
    }
    if (crossed(at('pending', 0.12))) tone(ctx, keys, { freq: NOTES[4], to: NOTES[3], glide: 1.2, env: { attack: 0.02, decay: 3.5, peak: 0.03 } })
    // The door, closing behind him.
    if (crossed(at('leaving', 0.9))) {
      thud(door.gain, 180, 0.3)
      click(door.gain, 1400, 0.04, 0.05)
    }
    if (crossed(at('observer2', 0.05))) tone(ctx, desk.gain, { freq: 1046.5, type: 'sine', env: { attack: 0.002, decay: 0.4, peak: 0.03 } })
    if (crossed(at('accepted', 0.15))) chord([NOTES[0], NOTES[2], NOTES[5]], 0.03, 6)
  }

  return {
    update(frame: AudioFrame) {
      const now = ctx.currentTime
      const { p, dt, motion } = frame
      const jumped = lastP < 0 || Math.abs(p - lastP) > 0.012
      for (const id of Object.keys(MIX) as LayerId[]) layers[id].gain.setTargetAtTime(evalNumber(MIX[id], p), now, 0.2)

      // The countdown: one click per second the screen shows, 21.13.00 → 21.13.04.
      if (p >= SEG.wait13.start && p < SEG.wait13.end) {
        const sec = Math.floor(storyHours(p) * 3600)
        if (lastSecond >= 0 && sec > lastSecond && !jumped) click(desk.gain, 1200, 0.02)
        lastSecond = sec
      } else lastSecond = -1

      // The stopped clock tries now and then; a twitch of the second hand.
      if (evalNumber(MIX.room, p) > 0.1) {
        clockTry -= dt
        if (clockTry <= 0) {
          clockTry = 4 + Math.random() * 7
          click(clock.gain, 3000, 0.012)
        }
      }
      if (gurgle > 0) {
        gurgle -= dt
        if (Math.random() < dt * 9) burst(ctx, noise.brown, coffee.gain, { freq: 300 + Math.random() * 500, q: 3, env: { attack: 0.01, decay: 0.08 + Math.random() * 0.1, peak: 0.12 } })
      }
      if (TYPING.some(([a, b]) => p >= a && p < b)) {
        typeClock -= dt
        if (typeClock <= 0) {
          typeClock = 0.07 + Math.random() * 0.14 + (Math.random() < 0.12 ? 0.35 : 0)
          click(desk.gain, 1700 + Math.random() * 900, 0.012)
        }
      }
      if (evalNumber(MIX.city, p) > 0.05) {
        carClock -= dt
        if (carClock <= 0) {
          carClock = 7 + Math.random() * 12
          burst(ctx, noise.pink, city.gain, { freq: 500, q: 0.6, env: { attack: 1.2, decay: 2.4, peak: 0.25 } })
        }
      }
      if (evalNumber(MIX.music, p) > 0.12 && Math.random() < dt / 4.5) {
        note = (note + 2 + Math.floor(Math.random() * 3)) % NOTES.length
        tone(ctx, keys, { freq: NOTES[note], env: { attack: 0.008, decay: 3, peak: 0.026 }, pan: Math.random() * 0.6 - 0.3 })
      }
      if (motion.step !== lastStep && motion.walking > 0.35 && !jumped) burst(ctx, noise.brown, fx, { freq: 260, type: 'lowpass', env: { attack: 0.005, decay: 0.08, peak: 0.1 }, pan: motion.step % 2 ? 0.1 : -0.1 })
      lastStep = motion.step
      if (!jumped && p > lastP) crossings(lastP, p, Math.round(motion.frame))
      lastP = p
    },
  }
}
