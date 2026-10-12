/**
 * ÖFKESEL DENEYİM SİMÜLASYONU — every word the reader sees.
 *
 * Arif asks his boss to accept his resignation and is sent back to his desk
 * with a laugh. After work he drives to ÖFKE NÖBETİ, a free public service:
 * his memory is scanned, the moment with his boss is rebuilt in a white room,
 * and he does there everything he could not do this morning. Only then does
 * the story say — in the flat voice of a brochure — who was really in the
 * room. Then it shows the room as it is, and from the other side: 333, a
 * convict, washed, read his crimes, drugged and laid on the floor of the same
 * white room as a door opens and a man comes in cursing.
 *
 * The violence is short and sharp in the words and never lands in the image.
 * Two choices: which second of the morning the copy replays (one line in the
 * room changes), and how many copies (one convict or two).
 *
 * Timings are fractions of a segment, set line by line against the segment
 * table in docs/stories/ofke.md: the sentence and the image are one moment.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, SEG, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

/** The reader's choices, as conditions. The source's own line is the default. */
const LAUGH: When = { all: ['moment:laugh'] }
const MONEY: When = { all: ['moment:money'] }
const SHH: When = { none: ['moment:laugh', 'moment:money'] }
const ONE: When = { none: ['copies:two'] }
const TWO: When = { all: ['copies:two'] }

/** A `to` (in units of `seg`) that ends at fraction `f` of a later segment. */
const until = (seg: SegmentId, end: SegmentId, f: number) => (at(end, f) - SEG[seg].start) / SEG[seg].len

/** Narration: one item whose lines arrive one after another (stagger = when line 2 arrives, as a share of the item). */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.44 : undefined,
  ...extra,
})

/** A spoken line: the speaker in the caption, the words on the rail. */
const say = (id: string, seg: SegmentId, from: number, to: number, who: string, line: string, when?: When): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [who], fade: 0.22, when },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.22, when },
]

/** The service's own voice: the explainer on the locker-room screen. */
const brochure = (id: string, seg: SegmentId, from: number, to: number, line: string, extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'machine',
  purpose: 'reveal',
  lines: [line],
  ...extra,
})

/** Words on an in-world screen or sign (the set draws them). */
const sys = (id: string, seg: SegmentId, from: number, to: number, line: string, extra: Partial<T> = {}): T => ({ id, seg, from, to, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: [line], ...extra })

/** The last line's second half arrives the moment the man turns toward the corner. */
const MAN_FROM = 0.06
const MAN_TO = until('enters', 'comes', 0.98)
const MAN_STAGGER = (at('comes') - at('enters', MAN_FROM)) / (at('enters', MAN_TO) - at('enters', MAN_FROM))

const A = 'ARİF'
const P = 'PATRON'
const G = 'GÖREVLİ'

export const TEXT: T[] = [
  // 01 — İSTİFA
  { id: 'rehearsed', seg: 'open', from: -1, to: 0.92, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Dört aydır aynı cümleyi prova ediyordu.'], sub: 'SCROLL' },
  tell('stood', 'rise', 0.06, 1.0, ['Kendinden emin bir şekilde masasından kalktı.']),
  tell('look', 'look', 0.04, 0.98, ['Etrafına, başındakilere uzunca bir bakış attı.', 'Herkes masasının başına gömülmüştü.'], { purpose: 'mood', stagger: 0.42 }),
  tell('sigh', 'sigh', 0.05, 1.0, ['Derin bir iç çekti.', 'Gözlüğünü ve kravatını düzeltti.'], { stagger: 0.4 }),
  tell('steps', 'knock', 0.04, 0.56, ['Kısa ama sert adımlarla karşısındaki kapıya doğru ilerledi. Kapıyı çaldı.']),
  ...say('come-in', 'knock', 0.6, 1.0, 'İÇERİDEN', '— Gel.'),
  tell('sweat', 'enter', 0.06, 1.0, ['Bir eliyle alnındaki boncuk gibi terleri silerken diğer eliyle kapıyı açtı.', 'Hızlıca içeri girdi ve kapıyı arkasından kapattı.'], { stagger: 0.48 }),
  tell('feet', 'boss', 0.04, 0.6, ['Karşısındaki adam ayaklarını masaya uzatmış, elindeki telefonda bir şeyler kaydırıyordu.']),
  ...say('what', 'boss', 0.64, 1.0, P, '— Ne oldu?'),
  ...say('ask-1', 'ask', 0.03, 0.48, A, '— Efendim, rica etsem istifamı kabul eder misiniz? Dayanamıyorum artık.'),
  ...say('ask-2', 'ask', 0.52, 1.0, A, '— Dört aydır beni erteliyorsunuz. Lütfen tazminatımı verin ve istifamı kabul edin…'),
  ...say('haha', 'laugh', 0.03, 0.44, P, '— Hahaha… Üzgünüm Arif, seni bırakamam.'),
  ...say('earn', 'laugh', 0.48, 1.0, P, '— Bize çok para kazandırıyorsun. Şimdi direkt işinin başına.'),
  ...say('but', 'shh', 0.03, 0.34, A, '— Ama efendim…'),
  ...say('shh', 'shh', 0.38, 1.0, P, '— Şş… Hadi dışarı, çıkarken kapıyı kapat.'),
  ...say('okay', 'leave', 0.03, 0.25, A, '— Peki efendim.'),
  tell('ajar', 'leave', 0.29, 0.64, ['Seri adımlarla çıktı. Kapıyı bilerek açık bıraktı.'], { strong: true, purpose: 'turn' }),
  tell('curse', 'leave', 0.68, 1.1, ['Yerine dönerken ağzında küfürler geveliyordu.'], { purpose: 'mood' }),

  // 02 — YOL
  { id: 'six-who', seg: 'pack', from: 0.24, to: 0.98, slot: 'caption', kind: 'year', purpose: 'context', lines: ['18.00'] },
  tell('pack', 'pack', 0.24, 0.98, ['İş bitiminde hızlıca toparlanıp asansöre doğru ilerledi.']),
  tell('full', 'elevator', 0.06, 1.08, ['Fakat asansör dolmuştu. Kapılar yüzüne kapandı.']),
  tell('stairs', 'stairs', 0.12, 1.0, ['Hemen merdivenlere yöneldi.', 'Basamakları üçer beşer inerek aşağı doğru ilerliyordu.'], { stagger: 0.4 }),
  tell('out', 'car', 0.04, 1.0, ['Sonunda dış kapıya ulaştı.', 'Hemen arabasına atladı ve dijital ekrandan rotayı oluşturdu.'], { stagger: 0.4 }),
  sys('route-screen', 'route', 0.1, 0.98, 'ROTA · ÖFKE NÖBETİ · 23 DK · VARIŞ 18.32'),
  tell('clear', 'route', 0.06, 0.94, ['Gideceği yer belliydi:'], { purpose: 'foreshadow' }),
  { id: 'destination', seg: 'route', from: 0.38, to: 1.02, slot: 'center', kind: 'reveal', purpose: 'reveal', strong: true, lines: ['ÖFKE NÖBETİ'] },
  tell('radio', 'dusk', 0.08, 1.0, ['Yol boyunca radyoyu açmadı.', 'Dudakları kıpırdıyordu; dört aydır söyleyemediklerini sıraya diziyordu.'], { purpose: 'mood', stagger: 0.38 }),
  sys('billboard', 'dusk', 0.25, 0.98, 'ÖFKENİZİ EVE GÖTÜRMEYİN · ÖFKE NÖBETİ'),

  // 03 — HİZMET
  sys('sign', 'arrive', 0.05, 0.95, 'ÖFKE NÖBETİ · ÜCRETSİZ KAMU HİZMETİ'),
  tell('in', 'arrive', 0.08, 1.0, ['Araçtan indi, hemen binaya girdi.']),
  ...say('welcome-1', 'welcome', 0.03, 0.42, G, '— Öfke Nöbeti hizmetine hoş geldiniz efendim.'),
  ...say('welcome-2', 'welcome', 0.46, 1.0, G, '— Umarım sinirleriniz tepenizdedir ve sizin için berbat bir gündür…'),
  tell('device', 'helmet', 0.04, 0.98, ['Onu hemen bir sandalyeye oturttular, kafasına bir aygıt geçirdiler.', 'Boynuna kadar inen bu aygıt hafızasını tarıyor, öfkeli olduğu anların haritasını çıkarıyordu.'], { stagger: 0.42 }),
  sys('scanning', 'helmet', 0.3, 0.98, 'HAFIZA TARANIYOR'),
  sys('uploaded', 'map', 0.02, 0.22, 'YÜKLEME TAMAMLANDI'),
  tell('peaks', 'map', 0.06, 0.56, ['Önüne gelen ekranda günün bütün öfkesi vardı, saat saat.', 'Tepelerden biri ötekilerden çok yüksekti.'], { stagger: 0.46 }),
  sys('map-label', 'map', 0.25, 0.98, 'ÖFKE HARİTASI · BUGÜN · 18.44'),
  tell('picked', 'map', 0.66, 1.0, ['Arif, patronunun olduğu anı seçti.'], { purpose: 'turn' }),
  ...say('how-many', 'copies', 0.04, 0.48, G, '— Kopya sayısı? İsteğe göre bir veya daha fazla.'),
  tell('one-shape', 'copies', 0.62, 1.06, ['Ekranda tek bir siluet belirdi.'], { when: ONE }),
  tell('two-shapes', 'copies', 0.62, 1.06, ['Ekranda yan yana iki siluet belirdi.'], { when: TWO }),
  tell('lens', 'lens', 0.1, 1.0, ['Daha sonra görevliler bir cihazla gözlerine lens yerleştirdi.', 'Her şey bir an bulanıklaştı, sonra yeniden netleşti.'], { stagger: 0.46 }),
  tell('pill', 'pill', 0.06, 1.0, ['Ardından bir hap yutturdular.']),
  tell('clothes', 'clothes', 0.04, 0.48, ['Kıyafetlerini değiştirmesini istediler; ona özel kıyafetler verdiler.']),
  ...say('glasses', 'clothes', 0.52, 1.0, G, '— Gözlüğünüzü de bırakın. İçeride ihtiyacınız olmayacak.'),

  // 04 — ODA
  tell('five', 'white', 0.08, 1.0, ['Yaklaşık beş dakika sonra onu bembeyaz bir odaya götürdüler.']),
  tell('closed', 'close', 0.06, 0.96, ['Odaya bıraktılar ve kapıyı kapattılar.', 'Kapının yeri, duvarda ince bir çizgi olarak kaldı.']),
  tell('color', 'color', 0.1, 1.0, ['Her yer bir anda renklenmeye başladı.'], { purpose: 'turn' }),
  tell('pixels', 'pixels', 0.04, 1.0, ['Beyazlık yerini bir ofise bırakmaya başladı.', 'Etrafına baktığında beyaz duvarların ofise dönüşmesini piksel piksel, adım adım görebiliyordu.'], { stagger: 0.4 }),
  tell('towel', 'towel', 0.04, 1.0, ['Tıpkı bir su birikintisine düşen havlunun kuru yerlerini suyun yavaş yavaş ele geçirmesi gibi,', 'ofis pigmentleri de beyazlığı yavaş yavaş ele geçiriyordu…'], { purpose: 'mood', stagger: 0.5 }),
  tell('same', 'same', 0.04, 1.0, ['Oda, tıpkı bu sabahki gibi, patronunun odası olmuştu.', 'Hatırlayabildiği her ayrıntısına kadar o anın tıpatıp aynısıydı.']),
  tell('appear', 'appear', 0.06, 1.0, ['Masasına ayaklarını uzatan bir adam belirdi.', 'Tıpkı patronuna benziyordu; aynısıydı.'], { purpose: 'turn', when: ONE }),
  tell('appear-two', 'appear', 0.06, 1.0, ['Masasına ayaklarını uzatan bir adam belirdi. Pencerenin önünde bir tane daha.', 'İkisi de tıpkı patronuna benziyordu; ikisi de aynısıydı.'], { purpose: 'turn', when: TWO, stagger: 0.48 }),

  // 05 — NÖBET
  ...say('copy-laugh', 'trigger', 0.1, 0.92, P, '— Hahaha… Üzgünüm Arif, seni bırakamam.', LAUGH),
  ...say('copy-money', 'trigger', 0.1, 0.92, P, '— Bize çok para kazandırıyorsun.', MONEY),
  ...say('copy-shh', 'trigger', 0.1, 0.92, P, '— Şş… Hadi dışarı, çıkarken kapıyı kapat.', SHH),
  tell('lost', 'collar', 0.04, 1.0, ['Kendinden geçerek bağırmaya başladı, patronunun yakasına yapıştı.', 'Ağzına gelen bütün küfürleri söylüyordu.'], { purpose: 'turn', stagger: 0.46 }),
  ...say('shout-1', 'shout', 0.03, 0.42, A, '— Yeter artık! Senden çektiğim…'),
  ...say('shout-2', 'shout', 0.46, 1.0, A, '— Beni bir köle olarak burada tutamazsınız! Lanet olası!'),
  tell('blows', 'blows', 0.04, 1.0, ['Art arda yumruklar savurdu; patronun ağzı, burnu, yüzü, gözü dağılıyordu.', 'Onu duvardan duvara vurdu. Bütün öfkesini kusuyordu.'], { stagger: 0.48 }),
  tell('could', 'could', 0.05, 1.0, ['Patakladığı adam tıpkı patronuydu.', 'O an yapamadığı şeyleri şu an yapabiliyordu.'], { strong: true, purpose: 'turn', stagger: 0.4 }),
  tell('monitor', 'monitor', 0.04, 1.0, ['Öfkesi dinmemişti. Adamın kafasını monitöre, sonra duvara vurdu.', 'Ardından kalemlikteki kalemlere uzandı…'], { stagger: 0.5 }),
  tell('subside', 'subside', 0.1, 1.0, ['Sonra dindi.'], { strong: true, purpose: 'turn', when: ONE }),
  tell('subside-two', 'subside', 0.04, 1.0, ['Öteki hâlâ telefonuna bakıyordu. Arif ona döndü.', 'Sonra dindi.'], { strong: true, purpose: 'turn', when: TWO, stagger: 0.5 }),

  // 06 — HİZMETİN BEDELİ
  tell('done', 'done', 0.05, 0.42, ['Arif işini bitirmişti.']),
  tell('free', 'done', 0.46, 1.0, ['Devletin ücretsiz verdiği bu hizmetten yararlandığı için kendini mutlu hissediyordu.'], { purpose: 'mood' }),
  { id: 'how-cap', seg: 'how', from: 0.02, to: until('how', 'executed', 0.98), slot: 'caption', kind: 'system', purpose: 'context', lines: ['ÖFKE NÖBETİ · NASIL ÇALIŞIR?'] },
  brochure('how-1', 'how', 0.05, 1.0, 'Burada, sinir olduğunuz kişinin fiziksel özellikleri, yani görünüşü ve o ana ait her şey kurgulanıyor.'),
  brochure('how-2', 'reveal', 0.03, 0.48, 'Size takılan lens ve verilen hap sayesinde, odadaki kişiyi sinirinizi çıkaran kişiymiş gibi görüyorsunuz.'),
  brochure('how-3', 'reveal', 0.52, 1.0, 'Odadaki kişi, idamı kesinleşmiş bir ağır hükümlüdür: tecavüzcü, katil vb.', { strong: true }),
  brochure('how-4', 'again', 0.04, 0.44, 'İsteğe göre bir veya daha fazla kopya.'),
  brochure('how-5', 'again', 0.48, 1.0, 'Daha sonra sinirlendiğiniz an size tekrar yaşatılıyor.'),
  brochure('hallu', 'hallu', 0.04, 1.0, 'Aslında siz öyle yaşadığınızı sanıyorsunuz. Bir nevi şizofrenik halüsinasyon görüyorsunuz.'),
  brochure('say-do', 'nolimit', 0.03, 0.52, 'Öfkeniz tepedeyken, o an söyleyemediklerinizi söylüyor, yapamadıklarınızı yapıyorsunuz.'),
  brochure('no-limit', 'nolimit', 0.56, 1.0, 'Hiçbir sınır yok ve her şey serbest.', { strong: true }),
  brochure('executed', 'executed', 0.05, 0.98, 'Bu sayede mahkûm idam ediliyor ve siz de stresinizi atmış oluyorsunuz.'),
  tell('dress', 'away', 0.04, 0.56, ['Arif üstünü başını düzeltti. Verilen kıyafetleri çıkardı ve kendi kıyafetlerini giydi.', 'Gözlüğünü taktı.'], { stagger: 0.46 }),
  tell('gone', 'away', 0.6, 1.0, ['Geldiği gibi oradan çıktı, arabasına bindi ve gitti.']),

  // 07 — TEMİZLİK
  tell('staff-in', 'staff', 0.08, 1.0, ['Görevliler odaya girdi.']),
  tell('corner', 'corner', 0.04, 1.0, ['Odanın bir köşesi dışında her yer bembeyazdı.', 'O köşede, yerde bir ceset vardı; etrafta kan izleri.'], { purpose: 'reveal', when: ONE }),
  tell('corner-two', 'corner', 0.04, 1.0, ['Odanın bir köşesi dışında her yer bembeyazdı.', 'O köşede, yerde iki ceset vardı; etrafta kan izleri.'], { purpose: 'reveal', when: TWO }),
  tell('drag', 'drag', 0.04, 1.0, ['Görevliler emin adımlarla ilerledi.', 'Cesedi sürükleyerek odadan çıkardılar.'], { when: ONE, stagger: 0.42 }),
  tell('drag-two', 'drag', 0.04, 1.0, ['Görevliler emin adımlarla ilerledi.', 'Cesetleri sürükleyerek odadan çıkardılar.'], { when: TWO, stagger: 0.42 }),
  tell('cleaners', 'cleaners', 0.06, 1.0, ['Daha sonra odaya temizlik görevlileri girdi.']),
  tell('restart', 'restart', 0.08, 1.0, ['Her şey temizlendi ve süreç tekrar başladı.'], { strong: true, purpose: 'turn' }),
  sys('ready', 'restart', 0.5, 0.98, 'ODA 3 · HAZIR'),

  // 08 — 333
  { id: 'evening-who', seg: 'van', from: 0.08, to: 1.0, slot: 'caption', kind: 'year', purpose: 'context', lines: ['AYNI AKŞAM · 18.21'] },
  tell('transfer', 'van', 0.08, 1.0, ['Hapishaneden bu merkeze sevk edilmişti.']),
  tell('crime', 'record', 0.04, 1.0, ['Suçu tecavüz ve cinayetti.', 'Yaka numarası 333’tü.'], { purpose: 'reveal', stagger: 0.46 }),
  tell('bound', 'hood', 0.04, 1.0, ['Elleri kelepçeli, ayakları prangalı, kafasında siyah bir torba vardı.', 'Kıyafet olarak sadece donu vardı.'], { stagger: 0.48 }),
  tell('platform', 'platform', 0.04, 1.0, ['Arabadan indirildi. Yürüyen bir platforma konuldu.'], { when: ONE }),
  tell('platform-two', 'platform', 0.04, 1.0, ['Arabadan indirildi. Yürüyen bir platforma konuldu.', 'Arkasından bir başkası indirildi. Yaka numarası 334’tü.'], { when: TWO, stagger: 0.46 }),
  tell('wash', 'wash', 0.04, 1.0, ['Burada, tıpkı araba yıkama sistemleri gibi bir sisteme girdi:', 'köpük, su, fırça…'], { stagger: 0.5 }),
  tell('reading', 'reading', 0.03, 0.48, ['Daha sonra platform ilerledi; bu sefer dev hoparlörleri ve ekranları olan bir odaya geldi.']),
  tell('crimes', 'reading', 0.52, 1.0, ['Burada yaptığı suçlar en ince ayrıntısına kadar okunuyor, arka plandan uygun sesler veriliyordu.']),
  tell('inject', 'inject', 0.03, 0.48, ['Platform bir daha ilerledi. Hap verildi, gözlerine lens yerleştirildi ve iğne yapıldı.']),
  tell('resist', 'inject', 0.52, 1.0, ['Tüm bu süreçler, suçlunun direnmesini ve karşılık vermesini engellemek içindi.']),

  // 09 — KAPI
  tell('arrived', 'floor', 0.06, 1.0, ['Daha sonra platform ilerledi ve bembeyaz bir odaya geldi.', 'Burada yarı baygın hâlde yatıyordu.'], { when: ONE }),
  tell('arrived-two', 'floor', 0.06, 1.0, ['Daha sonra platform ilerledi ve bembeyaz bir odaya geldi.', 'Burada, 334’ün yanında, yarı baygın hâlde yatıyordu.'], { when: TWO }),
  tell('door-opens', 'doorOpens', 0.1, 1.0, ['Karşıdan bir kapı açıldı.'], { purpose: 'reveal' }),
  tell('man', 'enters', MAN_FROM, MAN_TO, ['İçeri bir adam girdi;', 'küfürler savurarak üzerine geliyordu…'], { purpose: 'reveal', strong: true, stagger: MAN_STAGGER }),
  { id: 'end', seg: 'black', from: 0.3, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['ÖFKESEL DENEYİM SİMÜLASYONU'], sub: 'ÖFKE NÖBETİ · ÜCRETSİZ KAMU HİZMETİ', fade: 0.4 },
]

export const TRANSCRIPT: Record<string, string> = {
  resign:
    'Sabahtı; açık ofiste klavyeler tıkırdıyordu. Arif dört aydır aynı cümleyi prova ediyordu. Kendinden emin bir şekilde masasından kalktı. Etrafına, başındakilere uzunca bir bakış attı; herkes masasının başına gömülmüştü. Derin bir iç çekti, gözlüğünü ve kravatını düzeltti. Kısa ama sert adımlarla karşısındaki kapıya doğru ilerledi ve kapıyı çaldı. İçeriden “Gel” sesi geldi. Bir eliyle alnındaki boncuk gibi terleri silerken diğer eliyle kapıyı açtı; hızlıca içeri girdi ve kapıyı arkasından kapattı. Karşısındaki adam ayaklarını masaya uzatmış, elindeki telefonda bir şeyler kaydırıyordu. Başını kaldırmadan sordu: “Ne oldu?” “Efendim, rica etsem istifamı kabul eder misiniz? Dayanamıyorum artık. Dört aydır beni erteliyorsunuz. Lütfen tazminatımı verin ve istifamı kabul edin…” Patron güldü: “Hahaha… Üzgünüm Arif, seni bırakamam. Bize çok para kazandırıyorsun. Şimdi direkt işinin başına.” Arif “Ama efendim…” demeye kalmadan patron parmağını dudaklarına götürdü: “Şş… Hadi dışarı, çıkarken kapıyı kapat.” “Peki efendim.” dedi Arif. Seri adımlarla çıktı. Kapıyı bilerek açık bıraktı. Yerine dönerken ağzında küfürler geveliyordu.',
  road:
    'Saat 18.00’de mesai bitti. Arif hızlıca toparlanıp asansöre doğru ilerledi. Fakat asansör dolmuştu; içeridekiler ona baktı, kimse kıpırdamadı ve kapılar yüzüne kapandı. Hemen merdivenlere yöneldi; basamakları üçer beşer inerek aşağı doğru ilerliyordu. Sonunda dış kapıya ulaştı. Hemen arabasına atladı ve dijital ekrandan rotayı oluşturdu. Gideceği yer belliydi: ÖFKE NÖBETİ. Ekranda yirmi üç dakika yazıyordu, varış 18.32. Yol boyunca radyoyu açmadı. Dudakları kıpırdıyordu; dört aydır söyleyemediklerini sıraya diziyordu. Şehrin ışıkları yanarken yol kenarından bir reklam panosu geçti: “Öfkenizi eve götürmeyin. Öfke Nöbeti.”',
  service:
    'Araçtan indi, hemen binaya girdi. Cephede yeşil harflerle ÖFKE NÖBETİ, altında “Ücretsiz kamu hizmeti” yazıyordu. Görevliler onu güler yüzle karşıladı: “Öfke Nöbeti hizmetine hoş geldiniz efendim. Umarım sinirleriniz tepenizdedir ve sizin için berbat bir gündür…” Onu hemen bir sandalyeye oturttular, kafasına bir aygıt geçirdiler. Boynuna kadar inen bu aygıt hafızasını tarıyor, öfkeli olduğu anların haritasını çıkarıyordu. Yükleme tamamlandı. Önüne gelen ekranda günün bütün öfkesi vardı, saat saat: sabah trafiği, yemekhane sırası, akşamki asansör… Tepelerden biri ötekilerden çok yüksekti: 09.14, patronun odası, yüzde doksan yedi. Ekran o anı saniye saniye açtı: kahkaha, “Bize çok para kazandırıyorsun” ve “Şş… Hadi dışarı.” (Hangisinin yeniden yaşanacağını okur seçer.) Arif, patronunun olduğu anı seçti. Görevli kopya sayısını sordu: isteğe göre bir veya daha fazla. (Okur bir ya da iki kopya seçer.) Ekranda tek bir siluet belirdi; iki kopya istendiyse yan yana iki siluet. Ek ücret yoktu; devlet karşılıyordu. Arif gözlüğünü çıkarıp avucuna aldı. Daha sonra görevliler bir cihazla gözlerine lens yerleştirdi; her şey bir an bulanıklaştı, sonra yeniden netleşti. Ardından bir hap yutturdular. Kıyafetlerini değiştirmesini istediler; ona açık gri, özel kıyafetler verdiler. “Gözlüğünüzü de bırakın. İçeride ihtiyacınız olmayacak.” dedi görevli. Arif gözlüğünü dolaba, katlanmış gömleğinin üstüne bıraktı.',
  room:
    'Yaklaşık beş dakika sonra onu bembeyaz bir odaya götürdüler. Odaya bıraktılar ve kapıyı kapattılar. Kapının yeri, duvarda ince bir çizgi olarak kaldı. Oda boştu; yalnızca bir köşede, hiçbir şeyin düşürmediği belli belirsiz bir gölge vardı. Her yer bir anda renklenmeye başladı. Beyazlık yerini bir ofise bırakmaya başladı. Etrafına baktığında beyaz duvarların ofise dönüşmesini piksel piksel, adım adım görebiliyordu. Tıpkı bir su birikintisine düşen havlunun kuru yerlerini suyun yavaş yavaş ele geçirmesi gibi, ofis pigmentleri de beyazlığı yavaş yavaş ele geçiriyordu… Oda, tıpkı bu sabahki gibi, patronunun odası olmuştu. Hatırlayabildiği her ayrıntısına kadar o anın tıpatıp aynısıydı; pencereden sabah güneşi giriyordu, oysa dışarıda akşam olalı bir saat olmuştu. Masasına ayaklarını uzatan bir adam belirdi. Tıpkı patronuna benziyordu; aynısıydı. İki kopya istendiyse pencerenin önünde bir tane daha belirdi; o da telefonuna bakıyordu.',
  fit:
    'Masadaki adam, seçilen anın cümlesini söyledi: “Hahaha… Üzgünüm Arif, seni bırakamam” ya da “Bize çok para kazandırıyorsun” ya da “Şş… Hadi dışarı, çıkarken kapıyı kapat.” Arif kendinden geçerek bağırmaya başladı, patronunun yakasına yapıştı. Ağzına gelen bütün küfürleri söylüyordu: “Yeter artık! Senden çektiğim… Beni bir köle olarak burada tutamazsınız! Lanet olası!” Art arda yumruklar savurdu; patronun ağzı, burnu, yüzü, gözü dağılıyordu. Onu duvardan duvara vurdu. Bütün öfkesini kusuyordu. Patakladığı adam tıpkı patronuydu. O an yapamadığı şeyleri şu an yapabiliyordu. Her darbede ışık çakıyor, duvarlar yer yer beyaza dönüp yeniden ofis oluyordu. Öfkesi dinmemişti. Adamın kafasını monitöre, sonra duvara vurdu. Ardından kalemlikteki kalemlere uzandı… İki kopya varsa öteki bütün bu süre boyunca telefonuna bakıyordu; Arif sonra ona döndü. Sonra dindi.',
  price:
    'Arif işini bitirmişti. Kapı açıldığında gülümsüyordu. Devletin ücretsiz verdiği bu hizmetten yararlandığı için kendini mutlu hissediyordu. Soyunma odasındaki ekranda hizmetin neşeli tanıtım filmi dönüyordu: Öfke Nöbeti nasıl çalışır? Burada, sinir olduğunuz kişinin fiziksel özellikleri, yani görünüşü ve o ana ait her şey kurgulanıyor. Size takılan lens ve verilen hap sayesinde, odadaki kişiyi sinirinizi çıkaran kişiymiş gibi görüyorsunuz. Odadaki kişi, idamı kesinleşmiş bir ağır hükümlüdür: tecavüzcü, katil vb. İsteğe göre bir veya daha fazla kopya. Daha sonra sinirlendiğiniz an size tekrar yaşatılıyor. Aslında siz öyle yaşadığınızı sanıyorsunuz. Bir nevi şizofrenik halüsinasyon görüyorsunuz. Öfkeniz tepedeyken, o an söyleyemediklerinizi söylüyor, yapamadıklarınızı yapıyorsunuz. Hiçbir sınır yok ve her şey serbest. Bu sayede mahkûm idam ediliyor ve siz de stresinizi atmış oluyorsunuz. Arif ekrana bakmıyordu. Üstünü başını düzeltti. Verilen kıyafetleri çıkardı ve kendi kıyafetlerini giydi. Gözlüğünü taktı. Geldiği gibi oradan çıktı, arabasına bindi ve gitti.',
  clean:
    'Görevliler odaya girdi. Odanın bir köşesi dışında her yer bembeyazdı. O köşede, yerde bir ceset vardı; iki kopya istendiyse iki ceset. Etrafta kan izleri vardı. Görevliler emin adımlarla ilerledi. Cesedi sürükleyerek odadan çıkardılar. Daha sonra odaya temizlik görevlileri girdi. Her şey temizlendi ve süreç tekrar başladı. Kapının üstündeki ışık yeşile döndü: ODA 3 · HAZIR.',
  convict:
    'Aynı akşam, saat 18.21. Hapishaneden bu merkeze sevk edilmişti. Suçu tecavüz ve cinayetti. Yaka numarası 333’tü. Elleri kelepçeli, ayakları prangalı, kafasında siyah bir torba vardı. Kıyafet olarak sadece donu vardı. Arabadan indirildi. Yürüyen bir platforma konuldu. İki kopya istendiyse arkasından bir başkası indirildi; onun yaka numarası 334’tü. Burada, tıpkı araba yıkama sistemleri gibi bir sisteme girdi: köpük, su, fırça… Daha sonra platform ilerledi; bu sefer dev hoparlörleri ve ekranları olan bir odaya geldi. Burada yaptığı suçlar en ince ayrıntısına kadar okunuyor, arka plandan uygun sesler veriliyordu. Platform bir daha ilerledi. Hap verildi, gözlerine lens yerleştirildi ve iğne yapıldı. Tüm bu süreçler, suçlunun direnmesini ve karşılık vermesini engellemek içindi.',
  door:
    'Daha sonra platform ilerledi ve bembeyaz bir odaya geldi. Burada yarı baygın hâlde yatıyordu; iki kopya istendiyse 334’ün yanında. Karşı duvarda, kapının yerini belli eden ince bir çizgi vardı. Karşıdan bir kapı açıldı. İçeri bir adam girdi. Açık gri, özel kıyafetler giymişti; gözlüğü yoktu. Kapı arkasından kapandı. Adam bir an durup beyaz duvarlara baktı, sanki duvarlarda bir şeyin yayılmasını izliyordu. Sonra köşeye döndü. Küfürler savurarak, kısa ama sert adımlarla üzerine geliyordu… Her şey karardı.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('rise', 0.06)],
  [at('color'), at('same')],
  [at('monitor'), at('subside', 1)],
  [at('corner'), at('drag', 1)],
  [at('doorOpens'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.1, text: '[klavye tıkırtıları, uzakta çalan bir telefon]' },
  { seg: 'knock', at: 0.55, text: '[kapıya iki kez vurulur]' },
  { seg: 'enter', at: 0.78, text: '[kapı kapanır]' },
  { seg: 'laugh', at: 0.04, text: '[patron kahkaha atar]' },
  { seg: 'leave', at: 0.3, text: '[kapı açılır ve açık kalır]' },
  { seg: 'leave', at: 0.7, text: '[mırıltıyla küfürler]' },
  { seg: 'pack', at: 0.1, text: '[mesai biter: sandalyeler, fermuarlar]' },
  { seg: 'elevator', at: 0.05, text: '[asansör zili]' },
  { seg: 'elevator', at: 0.75, text: '[asansör kapıları kapanır]' },
  { seg: 'stairs', at: 0.1, text: '[merdivende hızlı adımlar]' },
  { seg: 'car', at: 0.08, text: '[ağır bir kapı açılır, sokak gürültüsü]' },
  { seg: 'car', at: 0.58, text: '[araba kapısı kapanır]' },
  { seg: 'route', at: 0.4, text: '[ekranda bir onay sesi]' },
  { seg: 'dusk', at: 0.05, text: '[motor, akşam trafiği]' },
  { seg: 'arrive', at: 0.6, text: '[otomatik kapı açılır; yumuşak bir müzik]' },
  { seg: 'helmet', at: 0.25, text: '[aygıt iner; alçak bir vızıltı]' },
  { seg: 'map', at: 0.03, text: '[yükleme tamamlandı sesi]' },
  { seg: 'lens', at: 0.45, text: '[kısa bir tıslama]' },
  { seg: 'pill', at: 0.4, text: '[bir yudum su]' },
  { seg: 'clothes', at: 0.05, text: '[dolap kapağı açılır]' },
  { seg: 'white', at: 0.1, text: '[koridorda adımlar]' },
  { seg: 'close', at: 0.3, text: '[kapı tıslayarak kapanır]' },
  { seg: 'close', at: 0.7, text: '[sessizlik]' },
  { seg: 'color', at: 0.15, text: '[alçak bir uğultu yükselir]' },
  { seg: 'pixels', at: 0.1, text: '[buz çatırtısına benzer ince bir çıtırtı]' },
  { seg: 'same', at: 0.25, text: '[ofis sesleri belirir: klavye, uzakta bir telefon]' },
  { seg: 'trigger', at: 0.08, text: '[aynı kahkaha]', when: LAUGH },
  { seg: 'trigger', at: 0.08, text: '[aynı ses, iki ağızdan]', when: TWO },
  { seg: 'collar', at: 0.3, text: '[sandalye devrilir]' },
  { seg: 'shout', at: 0.05, text: '[bağırış]' },
  { seg: 'blows', at: 0.1, text: '[boğuk darbeler]' },
  { seg: 'blows', at: 0.6, text: '[duvara çarpan bir gövde; bir çerçeve düşer]' },
  { seg: 'monitor', at: 0.12, text: '[monitör patlar]' },
  { seg: 'monitor', at: 0.58, text: '[kalemlik devrilir, kalemler yere saçılır]' },
  { seg: 'subside', at: 0.15, text: '[sessizlik; yalnızca soluk]' },
  { seg: 'done', at: 0.45, text: '[yumuşak bir zil]' },
  { seg: 'done', at: 0.6, text: '[kapı tıslayarak açılır]' },
  { seg: 'how', at: 0.05, text: '[tanıtım filminin neşeli müziği]' },
  { seg: 'executed', at: 0.5, text: '[müzik neşeli bir notayla biter]' },
  { seg: 'away', at: 0.82, text: '[motor çalışır]' },
  { seg: 'staff', at: 0.08, text: '[kapı tıslayarak açılır]' },
  { seg: 'drag', at: 0.4, text: '[zeminde sürüklenen bir yük]' },
  { seg: 'cleaners', at: 0.2, text: '[kova, paspas, zemin makinesi]' },
  { seg: 'restart', at: 0.55, text: '[bir bip; duvarın ardında bir mekanizma çalışır]' },
  { seg: 'van', at: 0.05, text: '[minibüsün arka kapıları açılır]' },
  { seg: 'hood', at: 0.3, text: '[zincir şıkırtısı]' },
  { seg: 'platform', at: 0.5, text: '[yürüyen bant çalışır]' },
  { seg: 'wash', at: 0.48, text: '[köpük püskürür; su; dönen fırçalar]' },
  { seg: 'reading', at: 0.52, text: '[dev hoparlörlerden bir ses suçları tek tek okur]' },
  { seg: 'reading', at: 0.7, text: '[arkada siren, mahkeme salonu uğultusu, tokmak]' },
  { seg: 'inject', at: 0.3, text: '[robot kol; kısa bir tıslama]' },
  { seg: 'inject', at: 0.42, text: '[iğnenin klik sesi]' },
  { seg: 'floor', at: 0.2, text: '[ağır, ilaçlı bir soluk]' },
  { seg: 'doorOpens', at: 0.12, text: '[kapı tıslayarak açılır]' },
  { seg: 'enters', at: 0.6, text: '[kapı tıslayarak kapanır]' },
  { seg: 'comes', at: 0.2, text: '[boğuk küfürler; yaklaşan kısa, sert adımlar]' },
  { seg: 'black', at: 0.02, text: '[sessizlik]' },
]

/** World positions match the layout in docs/stories/ofke.md. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'letter',
    title: 'İstifa dilekçesi',
    seg: 'open',
    from: 0,
    to: until('open', 'rise', 1),
    pos: [-0.35, 0.77, 5.45],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['İstifa dilekçesi. Tarihi dört kez çizilip yeniden yazılmış.', 'En sondaki tarih: bugün.'] },
  },
  {
    id: 'boss-phone',
    title: 'Patronun telefonu',
    seg: 'boss',
    from: 0,
    to: until('boss', 'laugh', 1),
    pos: [-0.2, 1.0, -7.45],
    size: 0.2,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Patronun telefonunda bir tatil ilanı açıktı.', 'Yedi gece, her şey dâhil. “Sepete eklendi.”'] },
  },
  {
    id: 'visit-card',
    title: 'Üye kartı',
    seg: 'car',
    from: 0.5,
    to: until('car', 'route', 1),
    pos: [82.6, 0.62, 2.2],
    size: 0.2,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Yolcu koltuğunda bir üye kartı duruyordu.', 'ÖFKE NÖBETİ · Arif K. · 17. ziyaret.'] },
  },
  {
    id: 'anger-map',
    title: 'Öfke haritası',
    seg: 'map',
    from: 0.22,
    to: 1,
    pos: [138, 1.25, -16.1],
    size: 0.9,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['08.31 · Trafik · %31', '09.14 · Patronun odası · %97', '09.16 · Açık bırakılan kapı · %64', '12.40 · Yemekhane sırası · %19', '18.02 · Asansör · %38'] },
  },
  {
    id: 'shadow',
    title: 'Köşedeki gölge',
    seg: 'white',
    from: 0.7,
    to: until('white', 'color', 1),
    pos: [161.7, 0.02, -1.9],
    size: 0.9,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Köşede, hiçbir şeyin düşürmediği bir gölge vardı.'] },
  },
  {
    id: 'morning-window',
    title: 'Sabah penceresi',
    seg: 'same',
    from: 0,
    to: until('same', 'trigger', 1),
    pos: [160, 1.6, -2.48],
    size: 1.6,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Pencereden sabah güneşi giriyordu.', 'Dışarıda akşam olalı bir saat olmuştu.'] },
  },
  {
    id: 'collar-tag',
    title: 'Yakadaki etiket',
    seg: 'collar',
    from: 0.2,
    to: until('collar', 'shout', 1),
    pos: [160, 1.5, -0.9],
    size: 0.15,
    kind: 'anomaly',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Gömleğin yakasında, bir anlığına, beyaz bir etiket belirdi: 333.', 'Sonra yine yakaydı.'] },
  },
  {
    id: 'fine-print',
    title: 'Küçük harfler',
    seg: 'how',
    from: 0,
    to: until('how', 'executed', 1),
    pos: [136, 1.4, -18.95],
    size: 0.5,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Ekranın altında, küçük harflerle:', '“Hükümlüler infaz sırasına göre atanır. Hükümlünün kimliği kullanıcıyla paylaşılmaz.”'] },
  },
  {
    id: 'cleaning-log',
    title: 'Temizlik çizelgesi',
    seg: 'cleaners',
    from: 0.3,
    to: until('cleaners', 'restart', 1),
    pos: [159.0, 1.0, 1.9],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Temizlik çizelgesi · ODA 3', 'Bugünkü yedinci kullanım. Ortalama süre: on iki dakika.'] },
  },
  {
    id: 'manifest',
    title: 'Sevk listesi',
    seg: 'van',
    from: 0,
    to: until('van', 'record', 1),
    pos: [221.3, 1.25, 3.2],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Sevk listesi: 331 ✓ · 332 ✓ · 333 · 334', '333’ün karşısına el yazısıyla: ODA 3.'] },
  },
]

/** Which second of the morning the copy replays, and how many copies. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'moment',
    seg: 'map',
    at: 0.61,
    style: 'query',
    title: 'ÖFKE HARİTASI · 09.14 · PATRONUN ODASI',
    prompt: 'Yeniden yaşamak istediğiniz anı seçin.',
    options: [
      { id: 'laugh', tag: '09.14.31 · %91', label: '“Hahaha… Üzgünüm Arif, seni bırakamam.”', speaker: G, reply: ['Kahkaha. İyi bir seçim efendim.'], sets: ['moment:laugh'] },
      { id: 'money', tag: '09.14.38 · %94', label: '“Bize çok para kazandırıyorsun.”', speaker: G, reply: ['Bu cümle bu ay çok seçiliyor.'], sets: ['moment:money'] },
      { id: 'shh', tag: '09.14.52 · %97', label: '“Şş… Hadi dışarı, çıkarken kapıyı kapat.”', speaker: G, reply: ['En yüksek tepe. Çoğu kişi onu seçer.'], sets: ['moment:shh'] },
    ],
  },
  {
    id: 'copies',
    seg: 'copies',
    at: 0.55,
    style: 'choice',
    title: 'KOPYA SAYISI',
    prompt: 'Kaç kopya?',
    options: [
      { id: 'one', label: 'Bir tane yeter.', speaker: G, reply: ['Tek kopya. Klasik bir tercih.'], sets: ['copies:one'] },
      { id: 'two', label: 'İki olsun.', speaker: G, reply: ['İki kopya. Ek ücret yok efendim.', 'Devlet karşılıyor.'], sets: ['copies:two'] },
    ],
  },
]
