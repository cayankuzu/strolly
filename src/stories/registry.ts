/**
 * The catalogue. Metadata and words only — safe for the server. Each story's
 * 3D scene and sound load on demand (see loaders.ts).
 */
import type { Lang, StoryContent, StoryId, StoryMeta, StoryTranslation, TextSegment, TimelineView } from './types'
import { EN as yasamakEn } from './yasamak/en'
import { EN as oteEn } from './ote/en'
import { EN as tekayakEn } from './tekayak/en'
import { EN as ofkeEn } from './ofke/en'
import { EN as takintiEn } from './takinti/en'
import { EN as paralelEn } from './paralel/en'
import { EN as tekerrurEn } from './tekerrur/en'
import { EN as beyinkokuEn } from './beyinkoku/en'
import { EN as durumEn } from './durum/en'
import * as yasamakText from './yasamak/text'
import { timeline as yasamakTimeline, SCREEN_VH as YASAMAK_VH } from './yasamak/timeline'
import * as oteText from './ote/text'
import { timeline as oteTimeline, SCREEN_VH as OTE_VH } from './ote/timeline'
import * as tekayakText from './tekayak/text'
import { timeline as tekayakTimeline, SCREEN_VH as TEKAYAK_VH } from './tekayak/timeline'
import * as ofkeText from './ofke/text'
import { timeline as ofkeTimeline, SCREEN_VH as OFKE_VH } from './ofke/timeline'
import * as takintiText from './takinti/text'
import { timeline as takintiTimeline, SCREEN_VH as TAKINTI_VH } from './takinti/timeline'
import * as paralelText from './paralel/text'
import { timeline as paralelTimeline, SCREEN_VH as PARALEL_VH } from './paralel/timeline'
import * as tekerrurText from './tekerrur/text'
import { timeline as tekerrurTimeline, SCREEN_VH as TEKERRUR_VH, BASE_ITERATION as TEKERRUR_BASE } from './tekerrur/timeline'
import * as beyinkokuText from './beyinkoku/text'
import { timeline as beyinkokuTimeline, SCREEN_VH as BEYINKOKU_VH } from './beyinkoku/timeline'
import * as durumText from './durum/text'
import { timeline as durumTimeline, SCREEN_VH as DURUM_VH } from './durum/timeline'

const same = (text: string) => text

/** What every story's words module exports. */
type Words = {
  TEXT: TextSegment[]
  TRANSCRIPT: Record<string, string>
  QUIET: Array<readonly [number, number]>
  DISCOVERIES: StoryContent['discoveries']
  CAPTIONS: StoryContent['captions']
  CHOICES: StoryContent['choices']
  /** Tokens resolved per pass (dates, iteration numbers), for stories that loop. */
  resolveTokens?: (text: string, iteration: number) => string
}

function story(meta: StoryMeta, timeline: TimelineView, words: Words, baseIteration = 0): StoryContent {
  return {
    meta,
    timeline,
    text: words.TEXT,
    transcript: words.TRANSCRIPT,
    quiet: words.QUIET,
    discoveries: words.DISCOVERIES,
    captions: words.CAPTIONS,
    choices: words.CHOICES,
    resolve: words.resolveTokens ?? same,
    baseIteration,
  }
}

export const STORIES: Record<StoryId, StoryContent> = {
  yasamak: story(
    {
      id: 'yasamak',
      index: 1,
      title: 'YAŞAMAK',
      hook: 'Süreni uzatamayacağını bilsen, oyunu yine de açar mıydın?',
      tags: 'ÖLÜM · ZAMAN · VEDA',
      description: 'Çocukken yarım saati elli kuruşa uzatabilen biri, aynı internet kafe masasında süresi görünmeyen bir hayatı ve sevdiklerinin birer birer gidişini yaşar.',
      mood: 'SICAK · HÜZÜNLÜ',
      minutes: 13,
      theme: 'temporal',
      rail: 'left',
      screenVh: YASAMAK_VH,
      loops: false,
      warning: 'Yakınların ölümü ve ölümcül bir hastalık işlenir.',
    },
    yasamakTimeline,
    yasamakText,
  ),
  ote: story(
    {
      id: 'ote',
      index: 2,
      title: 'ÖTE',
      hook: 'Geri dönüşü olmayan bir yolculuğa kim imza atar?',
      tags: 'SÖZLEŞME · YOLCULUK · BİLİNMEYEN',
      description: 'Bir imza, bir asansör ve galaksinin merkezine tek yönlü bir bilet; anlatan ise onları camın ardından izleyen şirket.',
      mood: 'SOĞUK · KOZMİK',
      minutes: 12,
      theme: 'cosmic',
      rail: 'left',
      screenVh: OTE_VH,
      loops: false,
      warning: 'Ölüm temasını işler.',
      localSet: true,
    },
    oteTimeline,
    oteText,
  ),
  tekayak: story(
    {
      id: 'tekayak',
      index: 3,
      title: 'TEK AYAK',
      hook: 'Bunu kim attı?',
      tags: 'SINIF · CEZA · BAKIŞ',
      description: 'Cuma son dersinde öğretmenin başına bir kâğıt uçak çarpar; üç arkadaşın cezası, çöp köşesinde tek ayak üstünde durmaktır.',
      mood: 'GÜNDÜZ · ACI-TATLI',
      minutes: 7,
      theme: 'chalk',
      rail: 'right',
      screenVh: TEKAYAK_VH,
      loops: false,
    },
    tekayakTimeline,
    tekayakText,
  ),
  ofke: story(
    {
      id: 'ofke',
      index: 4,
      title: 'ÖFKESEL DENEYİM SİMÜLASYONU',
      hook: 'Devlet sana öfkeni boşaltacak bir oda verse, girer miydin?',
      tags: 'ÖFKE · DEVLET · HALÜSİNASYON',
      description: 'Patronu istifasını kabul etmeyince Arif, devletin ücretsiz hizmetine gider: Öfke Nöbeti. Sonra aynı oda, öbür tarafından.',
      mood: 'KLİNİK · GERGİN',
      minutes: 14,
      theme: 'clinical',
      rail: 'left',
      screenVh: OFKE_VH,
      loops: false,
      warning: 'Şiddet ve idam içerir; cinsel suç anılır.',
    },
    ofkeTimeline,
    ofkeText,
  ),
  takinti: story(
    {
      id: 'takinti',
      index: 5,
      title: 'TAKINTI',
      hook: 'Gece yarısı annen neyi dikiyor?',
      tags: 'GECE · AİLE · KORKU',
      description: 'Gece yarısı dikiş makinesinin başına oturan bir anne, onu yatağına geri gönderemeyen bir çocuk ve o evde artık kullanılmayan her şey.',
      mood: 'KARANLIK · RAHATSIZ',
      minutes: 10,
      theme: 'dread',
      rail: 'right',
      screenVh: TAKINTI_VH,
      loops: false,
      warning: 'Ağır şiddet ve beden korkusu içerir.',
    },
    takintiTimeline,
    takintiText,
  ),
  paralel: story(
    {
      id: 'paralel',
      index: 6,
      title: 'PARALEL-LEŞ',
      hook: 'Başka evrenlerde kaç kez öldün?',
      tags: 'ÇOCUKLUK · RİSK · ÇOKLU EVREN',
      description: 'Ölümle arasında şeffaf bir çizgi olan bir çocuk ve öbür evrenlerde kalan cesetleri.',
      mood: 'RÜZGÂRLI · BAŞ DÖNDÜRÜCÜ',
      minutes: 11,
      theme: 'vertigo',
      rail: 'left',
      screenVh: PARALEL_VH,
      loops: false,
    },
    paralelTimeline,
    paralelText,
  ),
  tekerrur: story(
    {
      id: 'tekerrur',
      index: 7,
      title: 'TEKERRÜR',
      hook: 'Tarih tekerrür ediyorsa gelecek bilinebilir mi?',
      tags: 'TARİH · ÖRÜNTÜ · DÖNGÜ',
      description: 'Duvarları ormana açılan bir oda, unutmayan bir makine ve ekranlarda beliren tek bir kelime.',
      mood: 'GECE · ARŞİV',
      minutes: 13,
      theme: 'archival',
      rail: 'left',
      screenVh: TEKERRUR_VH,
      loops: true,
    },
    tekerrurTimeline,
    tekerrurText,
    TEKERRUR_BASE,
  ),
  beyinkoku: story(
    {
      id: 'beyinkoku',
      index: 8,
      title: 'BEYİN-KÖKÜ',
      hook: 'Kararı gerçekten sen mi veriyorsun?',
      tags: 'BİLİNÇ · İRADE · SİMÜLASYON',
      description: 'Profesör Veyl’in laboratuvarında, kendi cennetinde yaşayan bir denek: Levy A.',
      mood: 'STERİL · TEDİRGİN',
      minutes: 26,
      theme: 'neural',
      rail: 'right',
      screenVh: BEYINKOKU_VH,
      loops: false,
      warning: 'Cerrahi görüntüler ve korku içerir.',
    },
    beyinkokuTimeline,
    beyinkokuText,
  ),
  durum: story(
    {
      id: 'durum',
      index: 9,
      title: 'DURUM',
      hook: 'Her şeyi bilen bir makineye ne sorarsın?',
      tags: 'DETERMİNİZM · BELİRSİZLİK · GÖZLEM',
      description: 'Evrendeki her atomun konumunu ve hızını bilen bir makine ve ona soru soran bir insan.',
      mood: 'GECE · SORGU',
      minutes: 20,
      theme: 'state',
      rail: 'left',
      screenVh: DURUM_VH,
      loops: false,
    },
    durumTimeline,
    durumText,
  ),
}

export const STORY_ORDER: StoryId[] = ['yasamak', 'ote', 'tekayak', 'ofke', 'takinti', 'paralel', 'tekerrur', 'beyinkoku', 'durum']

/** Translated editions (strings only); see localize.ts. */
export const TRANSLATIONS: Partial<Record<Lang, Partial<Record<StoryId, StoryTranslation>>>> = {
  en: { yasamak: yasamakEn, ote: oteEn, tekayak: tekayakEn, ofke: ofkeEn, takinti: takintiEn, paralel: paralelEn, tekerrur: tekerrurEn, beyinkoku: beyinkokuEn, durum: durumEn },
}

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
