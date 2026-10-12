/**
 * The street through the window, as numbers: season, how much daylight, how
 * warm it is, snow, leaves, the street lamps — a pure function of progress.
 * Built on the story's `skyAt` keys, with the dusk of chapter 2 and the two
 * time-lapses (`years`, `days`) played out continuously.
 */
import { clamp, lerp, smoothstep } from '@/lib/math'
import { SEG, at, local, skyAt, type Season, type SegmentId } from '@/stories/yasamak/timeline'

export type Env = {
  season: Season
  /** Leaves on the plane tree: 0 bare … 1 full. */
  leaf: number
  /** Daylight: 0 night … 1 bright afternoon. */
  day: number
  /** Colour of the light: 0 cool/grey … 1 golden. */
  warm: number
  /** Falling snow, snow on the ground. */
  snow: number
  ground: number
  /** Leaves blowing past (autumn wind). */
  wind: number
  /** Street lamps on. */
  lamps: number
  /** Time-lapse flicker of the room (0 = none). */
  lapse: number
}

const BASE: Record<string, Omit<Env, 'season' | 'lapse'>> = {
  'autumn/night': {
    leaf: 0.55,
    day: 0,
    warm: 0.2,
    snow: 0,
    ground: 0,
    wind: 1,
    lamps: 1,
  },
  'autumn/dusk': {
    leaf: 0.6,
    day: 0.32,
    warm: 0.85,
    snow: 0,
    ground: 0,
    wind: 0.6,
    lamps: 1,
  },
  'spring/day': {
    leaf: 0.8,
    day: 1,
    warm: 0.35,
    snow: 0,
    ground: 0,
    wind: 0,
    lamps: 0,
  },
  'spring/dusk': {
    leaf: 0.8,
    day: 0.45,
    warm: 0.9,
    snow: 0,
    ground: 0,
    wind: 0,
    lamps: 1,
  },
  'winter/day': {
    leaf: 0,
    day: 0.7,
    warm: 0,
    snow: 0.8,
    ground: 1,
    wind: 0,
    lamps: 0,
  },
  'winter/night': {
    leaf: 0,
    day: 0,
    warm: 0.1,
    snow: 1,
    ground: 1,
    wind: 0,
    lamps: 1,
  },
  'summer/dusk': {
    leaf: 1,
    day: 0.62,
    warm: 1,
    snow: 0,
    ground: 0,
    wind: 0,
    lamps: 0,
  },
}

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
const env: Env = {
  season: 'spring',
  leaf: 1,
  day: 1,
  warm: 0.3,
  snow: 0,
  ground: 0,
  wind: 0,
  lamps: 0,
  lapse: 0,
}

function base(season: Season, light: string) {
  return BASE[`${season}/${light}`] ?? BASE['spring/day']
}

/** The state of the street at progress p (one shared object, overwritten each call). */
export function envAt(p: number): Env {
  const { season, light } = skyAt(p)
  Object.assign(env, base(season, light), { season, lapse: 0 })

  // Chapter 2: afternoon into dusk — gold, amber, blue; the street lamps blink on at 0.3.
  if (p >= SEG.dusk.start && p < SEG.dusk.end) {
    const u = local(p, 'dusk')
    env.season = 'spring'
    env.leaf = 0.8
    env.day = lerp(0.85, 0.12, smoothstep(0, 0.9, u))
    env.warm = u < 0.35 ? lerp(0.6, 1, u / 0.35) : lerp(1, 0.05, smoothstep(0.35, 0.95, u))
    env.lamps = u >= 0.3 ? 1 : 0
  }
  // The full room at dusk turning to night while he looks.
  if (p >= SEG.look.start && p < SEG.look.end) {
    const k = smoothstep(at('look', 0.3), at('look', 0.75), p)
    const a = BASE['autumn/dusk']
    const b = BASE['autumn/night']
    env.day = lerp(a.day, b.day, k)
    env.warm = lerp(a.warm, b.warm, k)
  }
  // Years: seasons racing, fast then slowing, landing on autumn dusk.
  if (p >= SEG.years.start && p < SEG.years.end) {
    const u = local(p, 'years')
    const t = clamp(u / 0.85)
    const s = 6.5 * (1 - Math.pow(1 - t, 2.2))
    const si = Math.floor(s * 4) % 4
    const season = SEASONS[si]
    const sweep = 0.5 + 0.5 * Math.cos(Math.PI * 2 * s * 2.5)
    const look = season === 'winter' ? BASE['winter/day'] : season === 'summer' ? BASE['summer/dusk'] : season === 'autumn' ? BASE['autumn/dusk'] : BASE['spring/day']
    Object.assign(env, look)
    env.season = season
    env.day = sweep * 0.95
    env.lamps = sweep < 0.4 ? 1 : 0
    env.lapse = 1 - smoothstep(0.72, 0.85, u)
    // Settle on autumn dusk.
    const settle = smoothstep(0.72, 0.85, u)
    if (settle > 0) {
      const d = BASE['autumn/dusk']
      env.day = lerp(env.day, d.day, settle)
      env.warm = lerp(env.warm, d.warm, settle)
      if (settle > 0.5) Object.assign(env, d, { season: 'autumn' as Season, lapse: env.lapse })
    }
  }
  // Days: late winter to the first buds, mornings and nights flickering by.
  if (p >= SEG.days.start && p < SEG.days.end) {
    const u = local(p, 'days')
    const cycles = 8
    const sweep = 0.5 - 0.5 * Math.cos(Math.PI * 2 * u * cycles)
    env.season = u < 0.6 ? 'winter' : 'spring'
    env.day = lerp(0.04, 0.72, sweep)
    env.warm = lerp(0.05, 0.25, u)
    env.leaf = smoothstep(0.45, 1, u) * 0.3
    env.snow = (1 - smoothstep(0.2, 0.5, u)) * 0.5
    env.ground = 1 - smoothstep(0.35, 0.8, u)
    env.lamps = sweep < 0.35 ? 1 : 0
    env.lapse = 1
  }
  // The pale morning she leaves: first buds, no snow.
  if (p >= SEG.instant.start && p < SEG.instant.end) {
    env.season = 'spring'
    env.leaf = 0.3
    env.day = 0.75
    env.warm = 0.15
    env.snow = 0
    env.ground = 0
    env.lamps = 0
  }
  return env
}

/** The wall clock: [segment, u, day, hour] keys — it never stops, days pass at the cuts, the time-lapses spin it. */
const CLOCK: ReadonlyArray<readonly [SegmentId, number, number, number]> = [
  ['open', 0, 0, 23.68],
  ['neck', 1, 0, 23.75],
  ['recess', 0, 1, 15.58],
  ['dusk', 1, 1, 18.75],
  ['years', 0, 1, 18.75],
  ['years', 0.85, 38, 17.8],
  ['counter', 1, 38, 18.4],
  ['disease', 1, 38, 19.7],
  ['bulmaz', 0, 40, 21.0],
  ['bulmaz', 1, 40, 21.2],
  ['grandpa', 0, 100, 11.3],
  ['grandpa', 1, 100, 11.5],
  ['friend', 0, 300, 20.1],
  ['lighter', 1, 300, 20.9],
  ['father', 0, 500, 22.4],
  ['witness', 1, 500, 23.1],
  ['traces', 0, 501, 1.1],
  ['illusion', 1, 501, 1.6],
  ['mother', 0, 800, 14.0],
  ['days', 0, 800, 15.0],
  ['days', 1, 808, 8.0],
  ['instant', 1, 808, 8.9],
  ['spring', 0, 900, 16.0],
  ['final', 1, 900, 16.5],
]

/** Hours shown on the wall clock at p (add real seconds for the second hand). */
export function clockHours(p: number): number {
  let prev = CLOCK[0]
  for (const k of CLOCK) {
    const pk = at(k[0], k[1])
    if (p < pk) {
      const pp = at(prev[0], prev[1])
      let t = pk > pp ? (p - pp) / (pk - pp) : 1
      // The years spin fast, then slow.
      if (prev[0] === 'years' && k[0] === 'years') t = 1 - Math.pow(1 - t, 2.2)
      return lerp(prev[2] * 24 + prev[3], k[2] * 24 + k[3], t)
    }
    prev = k
  }
  return prev[2] * 24 + prev[3]
}
