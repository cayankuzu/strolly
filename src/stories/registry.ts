/**
 * The catalogue. Metadata and words only — safe for the server. Each story's
 * 3D scene and sound load on demand (see loaders.ts).
 */
import type { StoryContent, StoryId, TextSegment } from './types'
import * as tekerrurText from './tekerrur/text'
import { timeline as tekerrurTimeline, SCREEN_VH as TEKERRUR_VH } from './tekerrur/timeline'
import * as emanetText from './emanet/text'
import { timeline as emanetTimeline, SCREEN_VH as EMANET_VH } from './emanet/timeline'
import * as ofkeText from './ofke/text'
import { timeline as ofkeTimeline, SCREEN_VH as OFKE_VH } from './ofke/timeline'
import * as yasamakText from './yasamak/text'
import { timeline as yasamakTimeline, SCREEN_VH as YASAMAK_VH } from './yasamak/timeline'
import * as kalanText from './kalan/text'
import { timeline as kalanTimeline, SCREEN_VH as KALAN_VH } from './kalan/timeline'
import * as esikText from './esik/text'
import { timeline as esikTimeline, SCREEN_VH as ESIK_VH } from './esik/timeline'

const same = (text: string) => text

export const STORIES: Record<StoryId, StoryContent> = {
  tekerrur: {
    meta: {
      id: 'tekerrur',
      index: 1,
      title: 'TEKERRÜR',
      hook: 'Gelecek gerçekten bilinebilir mi?',
      tags: 'DETERMİNİZM · OLASILIK · GÖZLEM',
      description: 'Her şeyin durumunu bilen bir makine, ona soru soran bir insan ve bir gece.',
      mood: 'GECE · SORGU',
      minutes: 18,
      theme: 'archival',
      rail: 'left',
      screenVh: TEKERRUR_VH,
      loops: false,
    },
    timeline: tekerrurTimeline,
    text: tekerrurText.TEXT,
    transcript: tekerrurText.TRANSCRIPT,
    quiet: tekerrurText.QUIET,
    discoveries: tekerrurText.DISCOVERIES,
    captions: tekerrurText.CAPTIONS,
    choices: tekerrurText.CHOICES,
    resolve: same,
    baseIteration: 0,
  },
  emanet: {
    meta: {
      id: 'emanet',
      index: 2,
      title: 'EMANET',
      hook: 'Bir insanın hafızası, kendisinden daha uzun yaşayabilir mi?',
      tags: 'HAFIZA · KAYIP · KİMLİK',
      description: 'Hafıza, kayıp, kimlik ve ölüm üzerine duygusal bilimkurgu.',
      mood: 'SICAK · YAKIN',
      minutes: 17,
      theme: 'memory',
      rail: 'right',
      screenVh: EMANET_VH,
      loops: false,
    },
    timeline: emanetTimeline,
    text: emanetText.TEXT,
    transcript: emanetText.TRANSCRIPT,
    quiet: emanetText.QUIET,
    discoveries: emanetText.DISCOVERIES,
    captions: emanetText.CAPTIONS,
    choices: emanetText.CHOICES,
    resolve: same,
    baseIteration: 0,
  },
  ofke: {
    meta: {
      id: 'ofke',
      index: 3,
      title: 'ÖFKE NÖBETİ',
      hook: 'Acı çeken gerçek değilse, acı gerçek midir?',
      tags: 'ÖFKE · SİSTEM · PERSPEKTİF',
      description: 'Öfkenin bir kamu hizmetine dönüştüğü yakın gelecekte, camın iki tarafı.',
      mood: 'KLİNİK · GERGİN',
      minutes: 18,
      theme: 'clinical',
      rail: 'left',
      screenVh: OFKE_VH,
      loops: false,
    },
    timeline: ofkeTimeline,
    text: ofkeText.TEXT,
    transcript: ofkeText.TRANSCRIPT,
    quiet: ofkeText.QUIET,
    discoveries: ofkeText.DISCOVERIES,
    captions: ofkeText.CAPTIONS,
    choices: ofkeText.CHOICES,
    resolve: same,
    baseIteration: 0,
  },
  yasamak: {
    meta: {
      id: 'yasamak',
      index: 4,
      title: 'YAŞAMAK',
      hook: 'Bir saatin olsaydı, onu nasıl geçirirdin?',
      tags: 'ZAMAN · VEDA · ÖLÜM',
      description: 'Bir internet kafede altmış dakika: en uzun ve en kısa veda.',
      mood: 'ZAMANSAL · İNSANİ',
      minutes: 17,
      theme: 'temporal',
      rail: 'right',
      screenVh: YASAMAK_VH,
      loops: false,
    },
    timeline: yasamakTimeline,
    text: yasamakText.TEXT,
    transcript: yasamakText.TRANSCRIPT,
    quiet: yasamakText.QUIET,
    discoveries: yasamakText.DISCOVERIES,
    captions: yasamakText.CAPTIONS,
    choices: yasamakText.CHOICES,
    resolve: same,
    baseIteration: 0,
  },
  kalan: {
    meta: {
      id: 'kalan',
      index: 5,
      title: 'KALAN',
      hook: 'Yaşanmamış bir hayat, hiç yaşanmamış mıdır?',
      tags: 'SEÇİM · OLASILIK · BENLİK',
      description: 'Henüz söylenmemiş bir cümleyi kaydetmiş bir ses kayıt cihazı.',
      mood: 'BELİRSİZ · SESSİZ',
      minutes: 16,
      theme: 'uncertain',
      rail: 'left',
      screenVh: KALAN_VH,
      loops: false,
    },
    timeline: kalanTimeline,
    text: kalanText.TEXT,
    transcript: kalanText.TRANSCRIPT,
    quiet: kalanText.QUIET,
    discoveries: kalanText.DISCOVERIES,
    captions: kalanText.CAPTIONS,
    choices: kalanText.CHOICES,
    resolve: same,
    baseIteration: 0,
  },
  esik: {
    meta: {
      id: 'esik',
      index: 6,
      title: 'EŞİK',
      hook: 'Bir şey, gözlendiği için mi gerçektir?',
      tags: 'ALGI · GÖZLEM · GERÇEKLİK',
      description: 'Kimsenin Mira’ya bakmadığı bir şehir. Ta ki biri bakana kadar.',
      mood: 'GECE · ALGISAL',
      minutes: 14,
      theme: 'perception',
      rail: 'right',
      screenVh: ESIK_VH,
      loops: false,
    },
    timeline: esikTimeline,
    text: esikText.TEXT,
    transcript: esikText.TRANSCRIPT,
    quiet: esikText.QUIET,
    discoveries: esikText.DISCOVERIES,
    captions: esikText.CAPTIONS,
    choices: esikText.CHOICES,
    resolve: same,
    baseIteration: 0,
  },
}

export const STORY_ORDER: StoryId[] = ['tekerrur', 'emanet', 'ofke', 'yasamak', 'kalan', 'esik']

export const isStoryId = (v: unknown): v is StoryId => typeof v === 'string' && v in STORIES

/** Absolute progress span of a text segment. */
export function textSpan(story: StoryContent, t: TextSegment) {
  const s = story.timeline.SEG[t.seg]
  return [s.start + s.len * Math.max(0, t.from), s.start + s.len * t.to] as const
}

/** Development guard: every line must belong to a segment and never collide with another in the same place. */
function validate(story: StoryContent) {
  const seen = new Set<string>()
  const bySlot = new Map<string, Array<{ id: string; a: number; b: number; when?: TextSegment['when'] }>>()
  for (const t of story.text) {
    if (seen.has(t.id)) throw new Error(`[${story.meta.id}] duplicate text id "${t.id}"`)
    seen.add(t.id)
    if (!story.timeline.SEG[t.seg]) throw new Error(`[${story.meta.id}] text "${t.id}" points to unknown segment "${t.seg}"`)
    if (!(t.from < t.to)) throw new Error(`[${story.meta.id}] text "${t.id}" must start before it ends`)
    if (t.world) continue
    const [a, b] = textSpan(story, t)
    const list = bySlot.get(t.slot) ?? []
    // Alternatives for different choices may share a place and a time.
    for (const o of list) if (a < o.b - 1e-4 && o.a < b - 1e-4 && !(t.when && o.when && JSON.stringify(t.when) !== JSON.stringify(o.when))) throw new Error(`[${story.meta.id}] "${t.id}" overlaps "${o.id}" in ${t.slot}`)
    list.push({ id: t.id, a, b, when: t.when })
    bySlot.set(t.slot, list)
  }
  for (const d of story.discoveries) {
    if (!story.timeline.SEG[d.seg]) throw new Error(`[${story.meta.id}] discovery "${d.id}" points to unknown segment "${d.seg}"`)
    if (seen.has(`discovery:${d.id}`)) throw new Error(`[${story.meta.id}] duplicate discovery "${d.id}"`)
    seen.add(`discovery:${d.id}`)
  }
  for (const c of story.captions) if (!story.timeline.SEG[c.seg]) throw new Error(`[${story.meta.id}] caption "${c.text}" points to unknown segment "${c.seg}"`)
  for (const g of story.choices) {
    if (!story.timeline.SEG[g.seg]) throw new Error(`[${story.meta.id}] choice "${g.id}" points to unknown segment "${g.seg}"`)
    if (seen.has(`choice:${g.id}`)) throw new Error(`[${story.meta.id}] duplicate choice "${g.id}"`)
    seen.add(`choice:${g.id}`)
    if (g.options.length < (g.picks ?? 1)) throw new Error(`[${story.meta.id}] choice "${g.id}" asks for more picks than it offers`)
  }
}

if (process.env.NODE_ENV !== 'production') Object.values(STORIES).forEach(validate)
