/**
 * KALAN — every word the reader sees. A tape recorder holds Deniz's voice
 * saying things Deniz has not said yet. The story never says which life is
 * the real one, or the better one; it lets the rooms change while no one is
 * looking, and leaves the question with whoever is left.
 */
import type { CaptionCue, Discovery, TextSegment } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.25 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.25 },
]

export const TEXT: T[] = [
  // 01 — KAYIT
  { id: 'recorded', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Bazı sesler, söylenmeden önce kaydedilir.'], sub: 'SCROLL' },
  { id: 'midnight', seg: 'night', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Gece yarısını biraz geçiyordu.'] },
  { id: 'box', seg: 'find', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Deniz eski bir kutunun dibinde bir ses kayıt cihazı buldu.', 'Kasetin üzerinde kendi el yazısı vardı.'], stagger: 0.42 },
  { id: 'tape-1', seg: 'play', from: 0.05, to: 0.9, slot: 'top', kind: 'system', purpose: 'system', lines: ['▶ KAYIT 01'] },
  { id: 'own', seg: 'play', from: 0.2, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Kendi sesiydi. Kendi nefesi. Bu odanın sesleri.'] },
  ...say('dont-open', 'voice', 0.05, 0.5, 'KAYIT', '— Bu sefer kapıyı açma.'),
  { id: 'never-said', seg: 'voice', from: 0.56, to: 1.15, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Bu cümleyi hiç söylememişti.'] },

  // 02 — KAPI
  { id: 'knocked', seg: 'knock', from: 0.2, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Kapı çaldı.'] },
  { id: 'walks', seg: 'walk', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Deniz kapıya yürüdü.'] },
  ...say('open-not', 'dont', 0.05, 0.45, 'KAYIT', '— Açma.'),
  { id: 'didnt', seg: 'dont', from: 0.52, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Açmadı.'] },
  { id: 'steps', seg: 'gone', from: 0.1, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Ayak sesleri merdivenlerden indi.', 'Kim olduğunu hiç öğrenemedi.'], stagger: 0.4 },

  // 03 — BAŞKA HAYAT
  { id: 'slept', seg: 'sleep', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['O gece kanepede uyudu.'] },
  { id: 'same', seg: 'morning', from: 0.2, to: 0.95, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['Sabah olduğunda ev aynıydı.'] },
  { id: 'almost', seg: 'mug', from: 0.1, to: 0.9, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Neredeyse.'] },
  {
    id: 'remember-not',
    seg: 'details',
    from: 0.05,
    to: 1.05,
    slot: 'rail',
    kind: 'narration',
    purpose: 'turn',
    lines: ['Masada başka bir kupa vardı. Kitaplıkta tanımadığı bir kitap.', 'Deniz bunları hatırlamıyordu.'],
    stagger: 0.45,
  },

  // 04 — FOTOĞRAF
  { id: 'saw-photo', seg: 'notice', from: 0.2, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Duvardaki fotoğrafı o zaman fark etti.'] },
  { id: 'stranger', seg: 'photo', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Fotoğrafta kendisi vardı.', 'Yanında hiç tanımadığı bir kadın.'], stagger: 0.42 },
  { id: 'year', seg: 'back', from: 0.05, to: 0.9, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ['2018'] },
  { id: 'never-married', seg: 'back', from: 0.25, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ['Deniz o yıl hiç evlenmemişti.'] },

  // 05 — SES
  { id: 'tape-2', seg: 'tape', from: 0.1, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['▶ KAYIT 02'] },
  { id: 'new-record', seg: 'tape', from: 0.25, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Cihazda yeni bir kayıt vardı.'] },
  ...say('not-killing', 'other', 0.05, 0.45, 'KAYIT', '— Bu hayatı seçtiğinde diğerlerini öldürmüş olmuyorsun.'),
  ...say('giving-up', 'other', 0.58, 1.0, 'KAYIT', '— Sadece onları yaşamaktan vazgeçiyorsun.'),

  // 06 — ODALAR
  { id: 'wandered', seg: 'rooms', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Deniz evin içinde dolaştı. Mutfağa baktı. Sonra salona.'] },
  { id: 'as-always', seg: 'kitchen', from: 0.2, to: 0.9, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Her şey her zamanki gibiydi.', 'Bakarken.'], stagger: 0.5 },

  // 07 — SEÇİLMEMİŞ HAYATLAR
  { id: 'l-married', seg: 'married', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Birinde evliydi.'] },
  { id: 'l-city', seg: 'city', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Birinde başka bir şehirde yaşıyordu.'] },
  { id: 'l-never', seg: 'never', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Birinde bu eve hiç taşınmamıştı.'] },
  { id: 'l-died', seg: 'died', from: 0.1, to: 0.55, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Birinde yıllar önce ölmüştü.'] },
  { id: 'no-better', seg: 'died', from: 0.62, to: 1.15, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Hangisinin daha iyi olduğunu kimse söylemedi.'] },

  // 08 — GERÇEK SORU
  ...say('which', 'ask', 0.1, 0.27, 'DENİZ', '— Hangisi benim?'),
  ...say('all', 'ask', 0.31, 0.46, 'KAYIT', '— Hepsi.'),
  ...say('only-this', 'ask', 0.5, 0.72, 'DENİZ', '— Ama ben sadece bunu yaşadım.'),
  ...say('remember', 'ask', 0.76, 1.05, 'KAYIT', '— Sen yaşadığını hatırlıyorsun.'),

  // 09 — KALAN
  { id: 'in-the-middle', seg: 'remain', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['Deniz bütün hayatların ortasında kaldı.'] },

  // 10 — SON SEÇİM
  { id: 'sign', seg: 'sign', from: 0.1, to: 1.0, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ["THE LIFE YOU DIDN'T CHOOSE"] },
  { id: 'a-door', seg: 'sign', from: 0.3, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Duvarda daha önce olmayan bir kapı vardı.'] },
  ...say('cant-ask', 'approach', 0.08, 0.95, 'KAYIT', '— Bu kapıyı açarsan artık hangisinin gerçek olduğunu soramazsın.'),
  { id: 'opened', seg: 'opens', from: 0.35, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Deniz kapıyı açtı.'] },
  { id: 'another-home', seg: 'facing', from: 0.0, to: 0.45, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Kapının ardında başka bir ev vardı. Orada başka bir Deniz.'] },
  ...say('which-of-us', 'facing', 0.55, 1.0, 'DİĞER DENİZ', '— Sen hangimizsin?'),
  { id: 'tape-3', seg: 'recording', from: 0.05, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['▶ KAYIT 03'] },
  ...say('think-finished', 'recording', 0.12, 0.5, 'KAYIT', '— Hikâyeyi bitirdiğini sanıyorsun.'),
  ...say('never-saw', 'recording', 0.6, 1.02, 'KAYIT', '— Ama burada kalanı hiç görmedin.'),
  { id: 'end', seg: 'end', from: 0.15, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['SOME LIVES ARE NEVER LIVED.', 'THEY ARE ONLY LEFT BEHIND.'], sub: 'KALAN', fade: 0.4, stagger: 0.18 },
]

export const TRANSCRIPT: Record<string, string> = {
  record:
    'Gece yarısından sonra Deniz eski bir kutuda bir ses kayıt cihazı bulur. Kasette kendi sesi, kendi nefesi, bu odanın sesleri vardır. Kayıtta Deniz şöyle der: “Bu sefer kapıyı açma.” Deniz bu cümleyi hiç söylememiştir. Kayıtta bir saatin tıkırtısı da vardır; odada saat yoktur.',
  door: 'Kapı çalar. Deniz kapıya yürür. Kayıt: “Açma.” Deniz açmaz. Ayak sesleri merdivenlerden iner; kim olduğu hiç öğrenilmez.',
  another: 'Deniz o gece kanepede uyur. Sabah ev aynıdır, neredeyse: masada başka bir kupa, kitaplıkta tanımadığı bir kitap vardır.',
  photo: 'Duvardaki fotoğrafta Deniz ve hiç tanımadığı bir kadın vardır. Arkasında 2018 yazar. Deniz o yıl hiç evlenmemiştir.',
  voice: 'Cihazda yeni bir kayıt vardır. Deniz’in başka bir versiyonu: “Bu hayatı seçtiğinde diğerlerini öldürmüş olmuyorsun. Sadece onları yaşamaktan vazgeçiyorsun.”',
  rooms: 'Deniz evde dolaşır. Odalar bakılırken aynıdır; bakılmadığında mutfakta başka hayatların izleri belirir.',
  lives: 'Seçilmemiş hayatlar görünür: birinde evlidir, birinde başka bir şehirdedir, birinde bu eve hiç taşınmamıştır, birinde yıllar önce ölmüştür. Hangisinin daha iyi olduğu söylenmez.',
  question: 'Deniz sorar: “Hangisi benim?” Kayıt: “Hepsi.” Deniz: “Ama ben sadece bunu yaşadım.” Kayıt: “Sen yaşadığını hatırlıyorsun.”',
  remain: 'Deniz bütün hayatların ortasında kalır; farklı Denizler, farklı evler bir an görünüp kaybolur.',
  choice:
    'Duvarda daha önce olmayan bir kapı belirir: The life you didn’t choose. Kayıt: “Bu kapıyı açarsan artık hangisinin gerçek olduğunu soramazsın.” Deniz kapıyı açar; arkasında başka bir ev ve başka bir Deniz vardır: “Sen hangimizsin?” Arkana döndüğünde kapı yoktur. Yerde yalnızca kayıt cihazı kalır. Son kayıt: “Hikâyeyi bitirdiğini sanıyorsun. Ama burada kalanı hiç görmedin.” Some lives are never lived. They are only left behind.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('night', 0.15)],
  [at('ask'), at('ask', 1)],
  [at('facing'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'play', at: 0.08, text: '[kaset döner; hışırtı]' },
  { seg: 'play', at: 0.5, text: '[kayıtta bir saatin tıkırtısı]' },
  { seg: 'knock', at: 0.15, text: '[kapı çalar, üç kez]' },
  { seg: 'gone', at: 0.12, text: '[merdivenlerden inen ayak sesleri]' },
  { seg: 'morning', at: 0.1, text: '[sabah kuşları]' },
  { seg: 'tape', at: 0.1, text: '[kayıt cihazı kendiliğinden çalışır]' },
  { seg: 'opens', at: 0.4, text: '[kapı menteşesi]' },
  { seg: 'recording', at: 0.05, text: '[yerdeki cihazda yeni bir kayıt başlar]' },
]

/** World positions match the set in src/three/kalan/. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'nail',
    title: 'Boş çivi',
    seg: 'play',
    from: 0,
    to: 2.4,
    pos: [-3.96, 2.0, -0.8],
    size: 0.3,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Duvarda boş bir çivi.', 'Burada bir saat asılı olmalıydı.'] },
  },
  {
    id: 'stairs',
    title: 'Merdivendeki ses',
    seg: 'gone',
    from: 0,
    to: 1,
    pos: [3.98, 1.1, 0.8],
    size: 0.6,
    kind: 'audio',
    visibility: 'subtle',
  },
  {
    id: 'other-mug',
    title: 'İkinci kupa',
    seg: 'mug',
    from: 0,
    to: 2.2,
    pos: [-0.8, 0.82, -0.4],
    size: 0.25,
    kind: 'object',
    visibility: 'visible',
  },
  {
    id: 'book',
    title: 'Yazılmamış kitap',
    seg: 'details',
    from: 0,
    to: 2.2,
    pos: [-3.9, 1.32, 1.2],
    size: 0.35,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Kapağında yazarın adı: Deniz.', 'Hiç yazmadığı bir kitap.'] },
  },
  {
    id: 'photo-back',
    title: 'Fotoğrafın arkası',
    seg: 'back',
    from: 0,
    to: 1.4,
    pos: [1.6, 1.55, -3.45],
    size: 0.35,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'ÇEVİR', lines: ['2018.', 'Altında bir el yazısı: “Bizim ilk yılımız.”'] },
  },
  {
    id: 'kitchen',
    title: 'Değişen mutfak',
    seg: 'kitchen',
    from: 0,
    to: 1,
    pos: [-2.6, 1.1, -3.0],
    size: 1.2,
    kind: 'anomaly',
    visibility: 'visible',
  },
  {
    id: 'another-deniz',
    title: 'Öteki Deniz',
    seg: 'remain',
    from: 0,
    to: 1,
    pos: [1.8, 1.1, 2.4],
    size: 0.6,
    kind: 'character',
    visibility: 'hidden',
  },
  {
    id: 'no-door',
    title: 'Olmayan kapı',
    seg: 'behind',
    from: 0.2,
    to: 1.4,
    pos: [0.2, 1.1, -3.45],
    size: 0.9,
    kind: 'anomaly',
    visibility: 'visible',
  },
  {
    id: 'recorder',
    title: 'Kasetin sonu',
    seg: 'recording',
    from: 0,
    to: 1.2,
    pos: [0.4, 0.06, -1.2],
    size: 0.3,
    kind: 'object',
    visibility: 'visible',
    examine: { verb: 'DİNLE', lines: ['Kasetin sonunda uzun bir sessizlik.', 'Sonra birinin nefesi. Seninkine benziyor.'] },
  },
]
