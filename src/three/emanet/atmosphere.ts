/**
 * Light, time of day, and how well each thing is remembered.
 *
 * Light follows the *shown* moment (so the day rewinds with the picture);
 * memory follows the *story* (the house comes apart at 14:18 no matter
 * which moment is on screen).
 */
import * as THREE from 'three'
import { SEG, at, local, sub } from '@/stories/emanet/timeline'
import { clamp, lerp, linear, smoothstep } from '@/lib/math'
import { evalVec, type Key } from '@/lib/track'

export const GROUPS = [
  'shell',
  'kitchen',
  'clock',
  'table',
  'chair',
  'cup',
  'doc',
  'photo',
  'living',
  'window',
  'balcony',
  'city',
  'entry',
  'keys',
  'device',
  'derin',
  'derinFace',
  'ege',
  'egeFace',
] as const
export type GroupName = (typeof GROUPS)[number]

export type Atmos = {
  sunIntensity: number
  sunColor: THREE.Color
  sunDir: THREE.Vector3
  hemi: number
  hemiSky: THREE.Color
  pendant: number
  fill: number
  sky: THREE.Color
  cityGlow: number
  device: number
  capsule: number
  clock: string
  clockGlow: number
  grade: { warm: number; desat: number; haze: number; veil: number }
  memory: Record<GroupName, { dissolve: number; blur: number }>
}

export function createAtmos(): Atmos {
  const memory = {} as Atmos['memory']
  for (const g of GROUPS) memory[g] = { dissolve: 0, blur: 0 }
  return {
    sunIntensity: 0,
    sunColor: new THREE.Color(),
    sunDir: new THREE.Vector3(1, 1, 0),
    hemi: 0,
    hemiSky: new THREE.Color(),
    pendant: 0,
    fill: 0,
    sky: new THREE.Color(),
    cityGlow: 0,
    device: 0,
    capsule: 0,
    clock: '',
    clockGlow: 0,
    grade: { warm: 0, desat: 0, haze: 0, veil: 0 },
    memory,
  }
}

// ——— Light presets: [sun, sunR, sunG, sunB, elevation, azimuth, hemi, skyR, skyG, skyB, pendant, fill, cityGlow, warm, desat, haze] ———
type L = readonly number[]
const DARK: L = [0, 1, 0.8, 0.6, 0.3, -0.3, 0.035, 0.12, 0.1, 0.09, 0, 0.0, 0.0, 0.3, 0.1, 0.0]
const MORNING: L = [3.4, 1.0, 0.86, 0.7, 0.3, -0.35, 0.3, 1.0, 0.96, 0.92, 0, 0.45, 0.0, 0.35, 0.06, 0.12]
const NOON: L = [4.0, 1.0, 0.97, 0.92, 0.95, 0.0, 0.45, 1.0, 1.0, 1.0, 0, 0.55, 0.0, 0.2, 0.04, 0.08]
const AFTERNOON: L = [3.6, 1.0, 0.74, 0.48, 0.3, 0.5, 0.26, 1.0, 0.84, 0.66, 0, 0.35, 0.15, 0.6, 0.08, 0.15]
const VOID: L = [0.25, 1.0, 0.7, 0.5, 0.3, 0.5, 0.06, 0.18, 0.15, 0.13, 0.3, 0.1, 0.0, 0.5, 0.2, 0.4]
const TRUTH: L = [0.0, 0.8, 0.85, 1.0, 0.4, 0.3, 0.34, 0.52, 0.6, 0.74, 0.9, 0.35, 0.5, 0.0, 0.42, 0.08]
const CLOSE: L = [0.0, 0.8, 0.85, 1.0, 0.4, 0.3, 0.28, 0.4, 0.46, 0.58, 1.4, 0.3, 0.6, 0.15, 0.3, 0.16]
/** The last minute, kept: the afternoon again, going to white. */
const KEPT: L = [2.6, 1.0, 0.8, 0.6, 0.3, 0.5, 0.36, 1.0, 0.9, 0.78, 0.2, 0.4, 0.1, 0.5, 0.06, 0.2]
const WHITE: L = [1.0, 1.0, 0.95, 0.9, 0.6, 0.5, 0.9, 1.0, 1.0, 1.0, 0.0, 0.8, 0.0, 0.25, 0.3, 0.9]

const k = (p: number, v: L, ease = linear): Key<L> => [p, v, ease]

const LIGHT: Key<L>[] = [
  k(at('insert', 0.3), DARK),
  k(at('form', 0.15), DARK),
  k(at('form', 0.9), MORNING),
  k(at('photo', 1), MORNING),
  k(at('noon'), NOON),
  k(at('noon', 1), NOON),
  k(at('afternoon'), AFTERNOON),
  // The rest of the story is played on the afternoon's light, until the light goes.
  k(at('dissolve', 0.25), AFTERNOON),
  k(at('dissolve', 0.85), VOID),
  k(at('hush'), VOID),
  k(at('hush', 0.5), TRUTH),
  k(at('document', 1), TRUTH),
  k(at('closer', 0.8), CLOSE),
  k(at('minute', 0.05), CLOSE),
  k(at('minute', 0.35), KEPT),
  k(at('complete', 0.35), KEPT),
  k(at('complete', 1), WHITE),
]

/** Clock face per shown moment. 14:18 never appears — until it does. */
function clockAt(sp: number, p: number) {
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
  const hm = (minutes: number) => `${pad(minutes / 60)}:${pad(minutes % 60)}`
  if (p >= SEG.minute.start) return p >= at('stay', 0.1) ? '14:18' : '14:17'
  if (p >= SEG.dissolve.start) return '14:18'
  if (p >= SEG.approach.start) return local(p, 'approach') < 0.5 ? '14:17' : '14:18'
  if (sp < SEG.form.start) return ''
  if (sp < SEG.drawer.start) return hm(lerp(7 * 60 + 41, 7 * 60 + 58, (sp - SEG.form.start) / (SEG.drawer.start - SEG.form.start)))
  if (sp < SEG.noon.start) return hm(lerp(8 * 60 + 2, 8 * 60 + 9, (sp - SEG.drawer.start) / (SEG.noon.start - SEG.drawer.start)))
  if (sp < SEG.afternoon.start) return hm(lerp(12 * 60 + 34, 12 * 60 + 41, local(sp, 'noon')))
  if (sp < SEG.clock.start) return hm(lerp(13 * 60 + 22, 14 * 60 + 16, local(sp, 'afternoon')))
  // PARÇALAR: the same afternoon, looked at slowly.
  if (sp >= SEG.call.start) return '14:16'
  if (sp >= SEG.absent.start) return hm(lerp(14 * 60 + 12, 14 * 60 + 15, local(sp, 'absent')))
  if (sp >= SEG.fragments.start) return hm(lerp(14 * 60 + 5, 14 * 60 + 12, local(sp, 'fragments')))
  if (sp >= SEG.rewind.start) return hm(lerp(14 * 60, 14 * 60 + 5, local(sp, 'rewind')))
  const u = local(sp, 'clock')
  return u < 0.47 ? '14:17' : u < 0.53 ? '' : '14:19'
}

type Win = readonly [number, number]

/** When each part of the house assembles while the record is read (fractions of 'form'). */
const FORM: Partial<Record<GroupName, Win>> = {
  shell: [0.04, 0.42],
  kitchen: [0.18, 0.58],
  clock: [0.3, 0.6],
  table: [0.28, 0.62],
  chair: [0.3, 0.64],
  cup: [0.36, 0.7],
  doc: [0.4, 0.72],
  photo: [0.3, 0.6],
  keys: [0.2, 0.5],
  living: [0.38, 0.76],
  window: [0.44, 0.8],
  balcony: [0.5, 0.86],
  city: [0.56, 0.92],
  ege: [0.5, 0.86],
  egeFace: [0.5, 0.86],
}

/** The order in which it comes apart at 14:18 (fractions of 'dissolve'): the cup first, her last. */
const UNDO: Partial<Record<GroupName, Win>> = {
  cup: [0.0, 0.16],
  photo: [0.04, 0.2],
  keys: [0.06, 0.22],
  doc: [0.1, 0.26],
  balcony: [0.0, 0.25],
  city: [0.0, 0.2],
  window: [0.14, 0.4],
  living: [0.16, 0.44],
  kitchen: [0.2, 0.48],
  clock: [0.24, 0.42],
  table: [0.26, 0.52],
  entry: [0.28, 0.54],
  device: [0.3, 0.52],
  shell: [0.34, 0.66],
  derin: [0.56, 0.86],
  derinFace: [0.5, 0.82],
}

/** The house returning, quieter (fractions of 'hush'). */
const RETURN: Partial<Record<GroupName, Win>> = {
  shell: [0.0, 0.3],
  kitchen: [0.05, 0.35],
  table: [0.0, 0.25],
  chair: [0.0, 0.2],
  doc: [0.05, 0.3],
  cup: [0.1, 0.35],
  photo: [0.1, 0.35],
  living: [0.1, 0.4],
  window: [0.12, 0.42],
  balcony: [0.15, 0.45],
  city: [0.18, 0.5],
  entry: [0.1, 0.4],
  keys: [0.15, 0.4],
  device: [0.15, 0.4],
  clock: [0.1, 0.35],
  derin: [0.0, 0.28],
  derinFace: [0.0, 0.28],
}

/** How sharp things are when they are simply remembered. */
const REST: Record<GroupName, number> = {
  shell: 0.12,
  kitchen: 0.12,
  clock: 0.0,
  table: 0.08,
  chair: 0.1,
  cup: 0.0,
  doc: 1.0,
  photo: 0.0,
  living: 0.28,
  window: 0.2,
  balcony: 0.42,
  city: 0.7,
  entry: 0.15,
  keys: 0.0,
  device: 0.0,
  derin: 0.0,
  derinFace: 0.0,
  ege: 0.12,
  egeFace: 0.92,
}

/** Habits come into focus one by one (ayrıntılar birer birer netleşir). */
const SHARPEN: Partial<Record<GroupName, readonly [number, number, number]>> = {
  window: [0.5, SEG.curtain.start, at('curtain', 0.7)],
  entry: [0.45, SEG.doorCheck.start, at('doorCheck', 0.6)],
  keys: [0.55, SEG.keys.start, at('keys', 0.55)],
}

const vec: number[] = []

export function atmosphere(p: number, sp: number, a: Atmos) {
  // ——— Light (follows the shown moment) ———
  evalVec(LIGHT as Key<readonly number[]>[], sp >= SEG.approach.start ? p : sp, vec)
  a.sunIntensity = vec[0]
  a.sunColor.setRGB(vec[1], vec[2], vec[3])
  const el = vec[4]
  const az = vec[5]
  a.sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
  a.hemi = vec[6]
  a.sky.setRGB(vec[7], vec[8], vec[9])
  a.hemiSky.setRGB(0.85 + 0.15 * vec[7], 0.88 + 0.12 * vec[8], 0.95 + 0.05 * vec[9])
  a.pendant = vec[10]
  a.fill = vec[11]
  a.cityGlow = vec[12]
  a.grade.warm = vec[13]
  a.grade.desat = vec[14]
  a.grade.haze = vec[15]

  // The reader wakes when the capsule seats; it pulses while it reads.
  const on = smoothstep(at('insert', 0.56), at('insert', 0.64), p)
  const reading = 1 - smoothstep(at('form', 0.7), at('form', 1), p)
  a.device = on * (0.55 + 0.45 * reading)
  a.capsule = on * (0.3 + 0.7 * reading)

  a.clock = clockAt(sp, p)
  a.clockGlow = p >= SEG.hush.start && p < SEG.minute.start ? 0.45 : 1

  // ——— Memory (follows the story) ———
  const veil = (p >= SEG.loop.start && p < SEG.loop.end ? Math.sin(Math.PI * local(p, 'loop')) : 0) + (p >= SEG.rewind.start && p < SEG.rewind.end ? 0.6 * Math.sin(Math.PI * local(p, 'rewind')) : 0)
  a.grade.veil = veil * 0.35 + smoothstep(at('approach', 0.5), at('dissolve', 0.3), p) * (1 - smoothstep(SEG.hush.start, at('hush', 0.4), p)) * 0.18

  for (const g of Object.keys(a.memory) as GroupName[]) {
    const m = a.memory[g]
    let dissolve = 0
    // Before the record is read only the reader, the console and Derin are there.
    if (p < SEG.form.start) {
      if (g === 'device' || g === 'derin' || g === 'derinFace') dissolve = 0
      else if (g === 'entry') dissolve = 1 - smoothstep(at('insert', 0.3), at('insert', 1), p)
      else dissolve = 1
    } else if (p < SEG.form.end) {
      const w = FORM[g]
      if (w) dissolve = 1 - smoothstep(w[0], w[1], local(p, 'form'))
    }
    // 14:18 — the edges go first, then everything, then her.
    if (p >= SEG.approach.start && p < SEG.hush.start) {
      if (g === 'city') dissolve = sub(p, 'approach', 0.6, 1)
      if (g === 'balcony') dissolve = sub(p, 'approach', 0.75, 1) * 0.6
      if (p >= SEG.dissolve.start) {
        const w = UNDO[g]
        if (w) dissolve = Math.max(dissolve, smoothstep(w[0], w[1], local(p, 'dissolve')))
      }
    }
    if (p >= SEG.hush.start && p < SEG.minute.start) {
      const w = RETURN[g]
      if (w) dissolve = 1 - smoothstep(w[0], w[1], local(p, 'hush'))
      // She leaves while the camera finds him.
      if (g === 'derin' || g === 'derinFace') dissolve = Math.max(dissolve, sub(p, 'closer', 0.08, 0.46))
    }
    // EMANET: she comes back for the minute; afterwards the house goes, the two of them last.
    if (p >= SEG.minute.start) {
      if (g === 'derin' || g === 'derinFace') dissolve = 1 - sub(p, 'minute', 0.06, 0.3)
      const w = UNDO[g]
      if (w && g !== 'derin' && g !== 'derinFace' && p >= SEG.complete.start) dissolve = smoothstep(0.35 + w[0] * 0.6, 0.35 + w[1] * 0.6, local(p, 'complete'))
    }

    let blur = REST[g]
    const sh = SHARPEN[g]
    if (sh) blur = lerp(sh[0], blur, smoothstep(sh[1], sh[2], p))
    // Everything is a little softer while the morning is still being reconstructed.
    blur = Math.min(1, blur + 0.2 * (1 - smoothstep(SEG.enter.start, SEG.cup.end, p)) * (g === 'cup' || g === 'clock' ? 0 : 1))
    // The far side of the house loses focus as 14:18 approaches.
    if (p >= SEG.approach.start && p < SEG.hush.start && (g === 'living' || g === 'window' || g === 'balcony' || g === 'shell'))
      blur = Math.min(1, blur + 0.4 * sub(p, 'approach', 0.4, 1))
    // GERÇEK: the reversal. Whose face is clear, whose record is readable.
    const flip = sub(p, 'system', 0.25, 0.85)
    if (g === 'egeFace') blur = lerp(blur, 0, flip)
    if (g === 'ege') blur = lerp(blur, 0, flip)
    if (g === 'doc') blur = lerp(blur, 0, flip)
    if (g === 'derinFace') blur = lerp(blur, lerp(0.85, 0.15, sub(p, 'stay', 0.2, 0.8)), flip)
    if (g === 'derin') blur = lerp(blur, 0.5, flip)
    if (p >= SEG.hush.start && p < SEG.minute.start && (g === 'living' || g === 'balcony' || g === 'window')) blur = Math.min(1, blur + 0.2)

    m.dissolve = clamp(dissolve)
    m.blur = clamp(blur)
  }
}
