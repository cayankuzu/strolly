/**
 * Small shared pieces of the direction: which chapter a segment belongs to,
 * the reader's choices, environment and fog per set, sub-ranges of a
 * segment, and the sound-facing motion record.
 */
import * as THREE from 'three'
import { clamp, smoothstep } from '@/lib/math'
import type { SetFrame } from '../kit/SetScene'
import type { SegmentId } from '@/stories/ofke/timeline'
import type { World } from './world'

export type Seg = SegmentId
export const PI = Math.PI

/** u remapped to 0–1 over [a, b] (clamped). */
export const sub = (u: number, a: number, b: number) => clamp((u - a) / (b - a))
/** Smoothly 0→1 over [a, b]. */
export const ss = smoothstep
/** 0→1 over [a,b] then 1→0 over [c,d]. */
export const win = (u: number, a: number, b: number, c: number, d: number) => smoothstep(a, b, u) * (1 - smoothstep(c, d, u))

export const two = (f: SetFrame) => f.flags.has('copies:two')
export type Moment = 'laugh' | 'money' | 'shh'
export const moment = (f: SetFrame): Moment => (f.flags.has('moment:laugh') ? 'laugh' : f.flags.has('moment:money') ? 'money' : 'shh')
export const picked = (f: SetFrame): Moment | '' => (f.flags.has('moment:laugh') ? 'laugh' : f.flags.has('moment:money') ? 'money' : f.flags.has('moment:shh') ? 'shh' : '')

export type EnvId = 'office' | 'clinic' | 'night' | 'dusk' | 'outside'

/** Image-based light, background and fog for a set. */
export function env(w: World, id: EnvId, intensity: number, bg: THREE.ColorRepresentation, fog?: [number, number]) {
  const s = w.scene
  s.environment = w.hdri[id] ?? w.fallbackEnv
  s.environmentIntensity = intensity
  ;(s.background as THREE.Color).set(bg)
  const fg = s.fog as THREE.Fog
  fg.color.set(bg)
  fg.near = fog ? fog[0] : 1000
  fg.far = fog ? fog[1] : 2000
}

/** What the sound follows. */
export const motion = { step: 0, walking: 0, robots: 0, doors: 0, frame: 0 }
