/**
 * The menus' ambience: a low room tone and a slow, distant chord. Each story
 * has its own key and color, so moving over a title changes the room.
 */
import type { StoryTheme } from '@/stories/types'
import type { AudioKit, AudioProfile, AudioProfileFactory } from './core'
import { filter } from './synth'

const CHORDS: Record<StoryTheme | 'menu', { notes: number[]; air: number; cutoff: number }> = {
  menu: { notes: [110, 164.81, 220], air: 300, cutoff: 600 },
  archival: { notes: [98, 146.83, 196, 233.08], air: 260, cutoff: 700 },
  clinical: { notes: [123.47, 174.61, 246.94], air: 900, cutoff: 1400 },
  temporal: { notes: [87.31, 130.81, 174.61, 220], air: 340, cutoff: 650 },
  cosmic: { notes: [73.42, 110, 164.81, 246.94], air: 600, cutoff: 1000 },
  chalk: { notes: [130.81, 164.81, 196, 261.63], air: 500, cutoff: 1300 },
  dread: { notes: [77.78, 82.41, 116.54], air: 200, cutoff: 450 },
  vertigo: { notes: [98, 146.83, 220, 329.63], air: 700, cutoff: 1200 },
  neural: { notes: [92.5, 138.59, 207.65, 311.13], air: 800, cutoff: 1500 },
  state: { notes: [98, 146.83, 196, 293.66], air: 300, cutoff: 800 },
}

export function selectorAudio(theme: StoryTheme | 'menu' | 'silence' = 'menu'): AudioProfileFactory {
  return (kit: AudioKit): AudioProfile => {
    if (theme === 'silence') return { update() {} }
    const c = CHORDS[theme]
    const { ctx, noise } = kit
    const air = kit.layer(0.2)
    const lp = filter(ctx, 'lowpass', c.air)
    kit.loop(noise.brown, lp, 0.7)
    lp.connect(air)
    const pad = kit.layer(0.6, 'music')
    const padLp = filter(ctx, 'lowpass', c.cutoff, 0.4)
    padLp.connect(pad)
    c.notes.forEach((f, i) => {
      const g = 0.06 / (1 + i * 0.4)
      const v = kit.osc(i % 2 ? 'triangle' : 'sine', f, padLp, g)
      kit.lfo(v.g.gain, 0.05 + f * 0.0002, g * 0.6)
    })
    air.gain.setTargetAtTime(0.18, ctx.currentTime, 1.2)
    pad.gain.setTargetAtTime(0.5, ctx.currentTime, 2)
    return { update() {} }
  }
}

/** The default menu ambience. */
export const createSelectorAudio = selectorAudio('menu')
