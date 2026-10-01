/**
 * EMANET — every word the reader sees. The story is told from inside a
 * memory; the lines never say whose memory it is until the record does.
 *
 * 14:18 is not a glitch. It is the minute Ege died, alone, two minutes after
 * he called his sister and she did not pick up. Nobody remembers that minute:
 * he did not live past it and she was not there. The Derin who searches the
 * day for it is the Derin that Ege remembered — and in the end, she can be
 * there.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.3 : undefined,
  ...extra,
})
const sys = (id: string, seg: SegmentId, from: number, to: number, line: string, extra: Partial<T> = {}): T => ({ id, seg, from, to, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: [line], ...extra })

const say = (id: string, seg: SegmentId, from: number, to: number, speaker: 'EGE' | 'DERİN', line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.25 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.25 },
]

export const TEXT: T[] = [
  // 01 — SABAH
  // On screen from the first frame: the story never opens on an empty black screen.
  { id: 'farewell', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Bazı vedalar bir kez yaşanmaz.'], sub: 'SCROLL' },
  { id: 'logo', seg: 'logo', from: 0.08, to: 1.0, slot: 'center', kind: 'final', purpose: 'title', lines: ['EMANET'], sub: 'SON KAYDINIZI YÜKLEYİN.', fade: 0.45 },
  { id: 'reading', seg: 'insert', from: 0.45, to: 1.3, slot: 'top', kind: 'system', purpose: 'system', lines: ['BELLEK KAPSÜLÜ · OKUNUYOR'] },
  { id: 'in-place', seg: 'form', from: 0.5, to: 1.25, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['Her şey yerli yerindeydi.'] },
  ...say('coffee', 'enter', 0.55, 1.25, 'EGE', '— Kahveyi yine unutmuşsun.'),
  { id: 'three-years', seg: 'voice', from: 0.32, to: 1.18, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Onun sesini üç yıldır duymamıştı.'] },
  { id: 'the-cup', seg: 'cup', from: 0.32, to: 1.2, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Ama bardağı nereye koyduğunu hâlâ biliyordu.'] },

  // 02 — AYRINTILAR
  {
    id: 'habits',
    seg: 'curtain',
    from: 0.3,
    to: 1.8,
    slot: 'rail',
    kind: 'narration',
    purpose: 'context',
    lines: ['İnsanları büyük anılarıyla değil,', 'küçük alışkanlıklarıyla hatırlarsınız.'],
    stagger: 0.2,
  },

  // 03 — FOTOĞRAF
  { id: 'easy', seg: 'drawer', from: 0.5, to: 1.3, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Bazı şeyleri hatırlamak kolaydı.'] },
  { id: 'years', seg: 'photo', from: 0.42, to: 1.08, slot: 'rail', kind: 'narration', purpose: 'foreshadow', strong: true, lines: ['Bazı şeyleri hatırlamamak için yıllarca uğraşırsınız.'] },

  // 04 — GÜN
  ...say('window', 'noon', 0.08, 0.32, 'EGE', '— Pencereyi kapatma, sıcak oluyor.'),
  ...say('every-day', 'noon', 0.36, 0.6, 'DERİN', '— Her gün aynı şeyi söylüyorsun.'),
  ...say('because', 'noon', 0.64, 0.92, 'EGE', '— Çünkü her gün kapatıyorsun.'),
  { id: 'as-always', seg: 'afternoon', from: 0.2, to: 0.92, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['Gün ilerliyordu. Her zamanki gibi.'] },
  { id: 'clock', seg: 'clock', from: 0.1, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['14:17 · 14:19'] },
  { id: 'minute', seg: 'clock', from: 0.58, to: 1.1, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['O bir dakikayı üç yıldır arıyordu.'] },
  {
    id: 'incomplete',
    seg: 'loop',
    from: 0.26,
    to: 1.05,
    slot: 'rail',
    kind: 'narration',
    purpose: 'turn',
    lines: ['Gün hiçbir zaman tamamlanmıyordu.', 'Bir şey eksikti.'],
    stagger: 0.32,
  },

  // 05 — PARÇALAR
  sys('resolve', 'rewind', 0.1, 0.95, 'BELLEK ÇÖZÜMLEME · 14.00 – 14.18', { world: false }),
  tell('again', 'rewind', 0.14, 0.58, ['Derin günü bir kez daha açtı.', 'Bu kez saate değil, ayrıntılara baktı.']),
  tell('around', 'rewind', 0.62, 1.04, ['Eksik dakikanın etrafında bir şeyler olmalıydı.'], { purpose: 'foreshadow' }),
  tell('same-thing', 'fragments', 0.88, 1.06, ['Ayrıntılar aynı şeyi söylüyordu.'], { purpose: 'turn' }),
  tell('not-home', 'absent', 0.08, 0.5, ['O gün 14.18’de Derin evde değildi.'], { purpose: 'reveal', strong: true }),
  tell('meeting', 'absent', 0.54, 1.04, ['İşteydi. Toplantıdaydı.', 'Telefonu çantasında, sessizde.'], { purpose: 'reveal' }),
  tell('called', 'call', 0.06, 0.4, ['Ege onu aradı.']),
  sys('ringing', 'call', 0.14, 0.58, '14:16 · ARANIYOR · DERİN'),
  sys('no-answer', 'call', 0.62, 0.95, 'CEVAP YOK'),
  tell('knew', 'call', 0.46, 1.04, ['Derin bunu üç yıldır biliyordu.', 'Bilmek hiçbir şeyi değiştirmemişti.']),

  // 06 — 14:18
  { id: 'corrupted', seg: 'approach', from: 0.55, to: 1.85, slot: 'top', kind: 'alert', purpose: 'system', lines: ['MEMORY CORRUPTED'] },

  // 07 — GERÇEK
  ...say('ege', 'hush', 0.32, 0.92, 'DERİN', '— Ege?'),
  { id: 'record', seg: 'document', from: 0.1, to: 0.95, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ['SUBJECT: EGE · STATUS: DECEASED · ACTIVE MEMORY INSTANCE'] },
  { id: 'thought', seg: 'document', from: 0.55, to: 1.18, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Onu hatırladığını sanıyordu.'] },
  { id: 'someone-else', seg: 'closer', from: 0.24, to: 0.76, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ['Oysa onu hatırlayan kişi başkasıydı.'] },
  { id: 'outlive', seg: 'closer', from: 0.82, to: 1.25, slot: 'center', kind: 'reveal', purpose: 'reveal', lines: ['Hatıralar bazen sahibinden daha uzun yaşar.'] },

  // 08 — EMANET
  tell('rebuilt', 'minute', 0.04, 0.3, ['Ev bir kez daha kuruldu. Saat 14.17’ydi.']),
  tell('pocket', 'minute', 0.32, 0.52, ['Ege telefonu kulağına götürdü.', 'Derin’in cebinde bir şey titredi.'], { purpose: 'turn' }),
  sys('first-time', 'stay', 0.1, 0.95, '14:18'),
  tell('shown', 'stay', 0.14, 0.62, ['Saat 14.18’i gösterdi. İlk kez.'], { purpose: 'reveal', strong: true }),
  tell('talking', 'stay', 0.66, 1.04, ['Ege konuşmaya devam etti. Önemsiz şeyler.'], { when: { all: ['minute:answer'] } }),
  tell('sitting', 'stay', 0.66, 1.04, ['Bir süre ikisi de bir şey söylemedi.'], { when: { all: ['minute:sit'] } }),
  tell('laugh', 'stay', 0.66, 1.04, ['Gülüşü kayıttaydı. Hep oradaymış.'], { when: { all: ['minute:say'] } }),
  sys('matched', 'complete', 0.1, 0.9, 'BELLEK TAMAMLANDI · EŞLEŞME: DERİN (YENİDEN KURULMUŞ)', { kind: 'alert', purpose: 'reveal' }),
  tell('wasnt', 'complete', 0.16, 0.56, ['Derin o dakikada orada değildi.'], { purpose: 'reveal' }),
  tell('was', 'complete', 0.6, 1.04, ['Bu Derin oradaydı.'], { purpose: 'reveal', strong: true }),
  { id: 'end', seg: 'end', from: 0.35, to: 5, slot: 'center', kind: 'final', purpose: 'question', lines: ['EMANET'], sub: 'Peki hatırlanan kişi kimdir?', fade: 0.4 },
]

export const TRANSCRIPT: Record<string, string> = {
  morning:
    'Siyah bir ekranda bir cümle: bazı vedalar bir kez yaşanmaz. Derin, küçük bir bellek kapsülünü okuyucuya yerleştirir ve bir apartman dairesi sabah ışığında yeniden kurulmaya başlar. Mutfakta Ege vardır; kahvesini yine unuttuğunu söyler ve bardağı masada hep durduğu yere bırakır. Ege’nin yüzü, odadaki her şeyden daha belirsizdir.',
  details: 'Terliklerinin sesi, perdeyi açışı, çıkmadan önce kapıyı iki kez kontrol edişi, anahtarı kâseye bırakışı. Ayrıntılar birer birer netleşir.',
  photo: 'Derin bir çekmeceden ikisinin fotoğrafını çıkarır. Fotoğraftaki her şey nettir; Ege’nin yüzü dışında.',
  day: 'Öğle olur, ikindi olur. Masada kısa, sıradan konuşmalar. Mutfaktaki saat 14:17’den 14:19’a atlar; 14:18 hiç gelmez. Gün geri sarılır ve yeniden başlar.',
  fragments:
    'Derin günü bir kez daha açar; bu kez saate değil ayrıntılara bakar. Masada Ege’nin telefonu: son arama 14.16, Derin, cevapsız. Kapının önünde yalnızca Ege’nin ayakkabıları. Perşembe gözü dolu bir ilaç kutusu. Çaydanlığın yanında, biri ters çevrilmiş iki bardak. Ayrıntılar aynı şeyi söyler: o gün 14.18’de Derin evde değildi. İşteydi, telefonu sessizdeydi. Ege onu aramıştı.',
  minute: 'Derin 14:18’e doğru ilerler. Ekranda MEMORY CORRUPTED yazar ve ev sessizce çözülmeye başlar: önce bardak, sonra eşyalar, sonra Derin’in kendisi.',
  truth:
    'Ev susar. Ege, Derin’e bakmaz. Kamera ilk kez başka bir yerden bakar. Masadaki kayıtta şunlar yazar: kayıt sahibi Ege, ölmüş; etkin bellek örneği; yeniden kurulan: Derin. Hatıralar bazen sahibinden daha uzun yaşar.',
  keep:
    'Ev bir kez daha kurulur; saat 14.17’dir. Ege telefonu kulağına götürür ve Derin’in cebinde bir şey titrer. Bu kez oradadır: telefonu açabilir, yanına oturabilir ya da ona bir şey söyleyebilir. Saat ilk kez 14.18’i gösterir. Kayıt tamamlanır: eşleşme, yeniden kurulmuş Derin. Derin o dakikada orada değildi; bu Derin oradaydı. Son satır: Peki hatırlanan kişi kimdir?',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('form', 0.3)],
  [at('dissolve', 0.3), at('closer', 1)],
  [at('complete', 0.5), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'insert', at: 0.6, text: '[kapsül yerine oturur; okuyucu uyanır]' },
  { seg: 'enter', at: 0.1, text: '[çaydanlık kaynamak üzere]' },
  { seg: 'cup', at: 0.5, text: '[fincan masaya bırakılır]' },
  { seg: 'curtain', at: 0.25, text: '[perde açılır]' },
  { seg: 'doorCheck', at: 0.55, text: '[kapı kolu, iki kez]' },
  { seg: 'keys', at: 0.57, text: '[anahtarlar kâseye düşer]' },
  { seg: 'clock', at: 0.62, text: '[saatin tıkırtısı… bir tıkırtı eksik]' },
  { seg: 'approach', at: 0.55, text: '[ev susmaya başlar]' },
  { seg: 'hush', at: 0.35, text: '[nefes]' },
  { seg: 'rewind', at: 0.05, text: '[kayıt geri sarılır]' },
  { seg: 'call', at: 0.16, text: '[arama sesi, uzun uzun]' },
  { seg: 'minute', at: 0.34, text: '[bir cepte telefon titrer]' },
  { seg: 'stay', at: 0.12, text: '[saat tıklar]' },
]

/** World positions match the apartment in src/three/emanet/. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'record-early',
    title: 'Masadaki kayıt',
    seg: 'enter',
    from: 0,
    to: 12,
    pos: [-1.55, 0.76, -0.86],
    size: 0.25,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['Yazılar seçilemiyor.', 'Sanki bakmaman gereken bir şey.'] },
  },
  {
    id: 'calendar',
    title: 'Durmuş takvim',
    seg: 'enter',
    from: 0,
    to: 6,
    pos: [-4.46, 1.55, -2.22],
    size: 0.35,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['Takvim üç yıl önceki bir pazarda kalmış.', 'Kimse yaprağını koparmamış.'] },
  },
  {
    id: 'ege-coat',
    title: 'Ege’nin ceketi',
    seg: 'doorCheck',
    from: 0,
    to: 3,
    pos: [-4.15, 1.3, 3.05],
    size: 0.4,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Ege’nin ceketi askıda.', 'Cebinde iki bilet: aynı gün, 14:30.'] },
  },
  {
    id: 'no-shadow',
    title: 'Gölgesiz zemin',
    seg: 'noon',
    from: 0,
    to: 1,
    pos: [3.6, 0.05, 0.1],
    size: 0.7,
    kind: 'anomaly',
    visibility: 'hidden',
  },
  {
    id: 'bedroom',
    title: 'Sessiz yatak odası',
    seg: 'afternoon',
    from: 0,
    to: 2.2,
    pos: [-4.45, 1.0, 1.0],
    size: 0.6,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'DİNLE', lines: ['Kapının ardından hiçbir ses gelmiyor.', 'Bu anıda yalnızca bu oda var.'] },
  },
  {
    id: 'minute',
    title: 'Kayıp dakika',
    seg: 'approach',
    from: 0.45,
    to: 1.6,
    pos: [-2.1, 2.42, -3.13],
    size: 0.4,
    kind: 'anomaly',
    visibility: 'visible',
  },
]

/** Resolving the minute: two details, then — once — being there. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'fragments',
    seg: 'fragments',
    at: 0.08,
    style: 'query',
    title: 'ÇÖZÜMLEME · 14.12',
    prompt: 'İki ayrıntıya yakından bak.',
    picks: 2,
    options: [
      { id: 'phone', tag: 'MASA', label: 'Masadaki telefon', reply: ['Ege’nin telefonu. Son arama: 14.16 — DERİN.', 'Cevapsız.'], sets: ['frag:phone'] },
      { id: 'shoes', tag: 'KAPI', label: 'Kapının önündeki ayakkabılar', reply: ['Bir çift ayakkabı. Ege’nin.', 'Seninkiler yoktu.'], sets: ['frag:shoes'] },
      { id: 'pills', tag: 'TEZGÂH', label: 'İlaç kutusu', reply: ['Haftalık ilaç kutusu. Perşembe gözü dolu.', 'O gün almamıştı.'], sets: ['frag:pills'] },
      { id: 'glasses', tag: 'OCAK', label: 'Çaydanlığın yanındaki bardaklar', reply: ['İki çay bardağı. Biri ters çevrilmiş.', 'Biri birini bekliyordu.'], sets: ['frag:glasses'] },
    ],
  },
  {
    id: 'minute',
    seg: 'minute',
    at: 0.56,
    style: 'choice',
    title: '14.17',
    prompt: 'Bu kez oradasın.',
    options: [
      { id: 'answer', label: 'Telefonu aç.', reply: ['— Efendim abi?', 'EGE: Bir şey yok. Sesini duymak istedim.'], sets: ['minute:answer'] },
      { id: 'sit', label: 'Yanına otur.', reply: ['Ege telefonu masaya bıraktı. Sana yer açtı.'], sets: ['minute:sit'] },
      { id: 'say', label: 'Ona bir şey söyle.', reply: ['— Kahveni yine unuttun.', 'Ege güldü.'], sets: ['minute:say'] },
    ],
  },
]
