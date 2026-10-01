/**
 * ÖFKE NÖBETİ — every word the reader sees. A public service sells the
 * release of anger on copies that "feel nothing". The story never shows the
 * violence itself; it shows what the service turns it into — a product with
 * a price, a meter and a satisfaction score — and then turns the room around.
 *
 * Arif is not a bad man. His father's care application has been bounced
 * between screens for three months, and there is nobody to shout at. The
 * copy, 0412, is not a target dummy: it has a name in a file, habits, a
 * Tuesday, and it counts.
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
  stagger: lines.length > 1 ? 0.35 : undefined,
  ...extra,
})
const sys = (id: string, seg: SegmentId, from: number, to: number, line: string, extra: Partial<T> = {}): T => ({ id, seg, from, to, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: [line], ...extra })

const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.25 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.25 },
]

export const TEXT: T[] = [
  // 01 — GİRİŞ
  { id: 'nobody', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Şehirde artık kimse bağırmıyordu.'], sub: 'SCROLL' },
  { id: 'place', seg: 'street', from: 0.25, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Bağırmak için bir yer vardı.'] },
  { id: 'service', seg: 'lobby', from: 0.05, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['ÖFKE BOŞALTMA MERKEZİ · KAMU HİZMETİ'] },
  { id: 'appointment', seg: 'lobby', from: 0.4, to: 1.15, slot: 'rail', kind: 'narration', purpose: 'context', lines: ["Arif'in randevusu 18:40'taydı."] },
  tell('buzz', 'reason', 0.16, 0.44, ['Telefonu titredi. Aynı mesaj, dördüncü kez.'], { purpose: 'context' }),
  sys('rejected', 'reason', 0.18, 0.95, 'BAŞVURU SONUCU · YAŞLI BAKIM DESTEĞİ · UYGUN BULUNMAMIŞTIR'),
  tell('father', 'reason', 0.46, 1.04, ['Babasının bakım başvurusu üç aydır bir ekrandan ötekine gidiyordu.', 'Bağırabileceği bir insan yoktu.'], { purpose: 'foreshadow' }),
  {
    id: 'calm',
    seg: 'wait',
    from: 0.2,
    to: 1.1,
    slot: 'rail',
    kind: 'narration',
    purpose: 'foreshadow',
    lines: ['Bekleme salonundaki herkes sakindi.', 'İçeri girene kadar.'],
    stagger: 0.35,
  },
  { id: 'ad', seg: 'ads', from: 0.1, to: 0.9, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['ÖFKENİZİ EVE GÖTÜRMEYİN.'] },

  // 02 — KURALLAR
  ...say('name', 'call', 0.1, 0.9, 'SİSTEM', '— Arif. Oda 3 hazırlanıyor.'),
  ...say('first-time', 'rules', 0.03, 0.18, 'GÖREVLİ', '— İlk kez mi geliyorsunuz?'),
  ...say('yes', 'rules', 0.2, 0.3, 'ARİF', '— Evet.'),
  ...say('not-real', 'rules', 0.33, 0.58, 'GÖREVLİ', '— Hedefler gerçek insanlar değil. Mahkûmların davranış kayıtlarından üretiliyorlar.'),
  ...say('no-harm', 'rules', 0.61, 0.8, 'GÖREVLİ', '— Kimse zarar görmüyor. Siz de görmüyorsunuz.'),
  ...say('sign', 'rules', 0.83, 1.02, 'GÖREVLİ', '— Şurayı imzalayın. Oda 3.'),
  sys('rule-list', 'rules', 0.36, 1.0, 'KURALLAR · 1. HEDEF GERÇEK DEĞİLDİR · 2. OTURUM 12 DAKİKADIR · 3. ODADAN HİÇBİR ŞEY ÇIKARILMAZ', { world: false }),
  { id: 'select', seg: 'console', from: 0.05, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', lines: ['SELECT TARGET'] },
  { id: 'faces', seg: 'console', from: 0.3, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Ekranda yüzler vardı. Hepsi gerçek mahkûmlardan kopyalanmıştı.'] },
  ...say('feel', 'pick', 0.05, 0.45, 'SİSTEM', '— Kopyalar acı hissetmez. Yalnızca hissediyormuş gibi davranır.'),
  { id: 'why', seg: 'pick', from: 0.52, to: 1.1, slot: 'rail', kind: 'narration', purpose: 'foreshadow', strong: true, lines: ['Arif bir yüz seçti. Neden o yüzü seçtiğini bilmiyordu.'] },
  { id: 'ready', seg: 'prepare', from: 0.1, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['TARGET 0412 · SESSION PREPARING'] },

  // 03 — ÖFKE
  { id: 'first', seg: 'enter', from: 0.35, to: 1.1, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['İlk dakika hep zordu.'] },
  ...say('look', 'stare', 0.25, 0.9, 'ARİF', '— Bana öyle bakma.'),
  { id: 'meter', seg: 'rise', from: 0.05, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['ANGER LEVEL'] },
  { id: 'easier', seg: 'rise', from: 0.35, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Sonra kolaylaştı.'] },
  { id: 'cleanse', seg: 'throw', from: 0.25, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Merkez buna arınma diyordu.'] },
  { id: 'terminated', seg: 'terminate', from: 0.25, to: 0.95, slot: 'top', kind: 'alert', purpose: 'system', lines: ['TARGET TERMINATED'] },
  { id: 'nothing', seg: 'terminate', from: 0.45, to: 1.2, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Arif buna hiçbir şey demedi.'] },
  tell('cooler', 'relief', 0.06, 0.42, ['Dışarıda hava serinlemişti.'], { purpose: 'mood' }),
  sys('stats', 'relief', 0.2, 0.95, 'BU AY 1.204.311 OTURUM · ŞİDDET SUÇLARI %38 AZALDI'),
  tell('called', 'relief', 0.48, 1.04, ['O akşam babasını aradı.', 'Uzun zamandır ilk kez sesini yükseltmeden konuştu.'], { purpose: 'turn' }),

  // 04 — SAPMA
  { id: 'next-week', seg: 'week', from: 0.2, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Ertesi hafta aynı saatte geldi.'] },
  { id: 'same', seg: 'again', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Aynı oda. Aynı sandalye. Aynı yüz.'] },
  {
    id: 'clean',
    seg: 'corridor',
    from: 0.15,
    to: 1.0,
    slot: 'rail',
    kind: 'narration',
    purpose: 'foreshadow',
    lines: ['Kopya her seferinde yeniden üretiliyordu.', 'Temiz. Hatırasız.'],
    stagger: 0.4,
  },

  ...say('you-again', 'yet', 0.25, 0.95, '0412', '— Yine sen.'),
  ...say('cant', 'knows', 0.0, 0.35, 'ARİF', '— Beni tanıyamazsın.'),
  ...say('killed', 'knows', 0.42, 1.0, '0412', '— Beni daha önce öldürdün.'),
  ...say('means', 'mimic', 0.04, 0.26, 'ARİF', '— Bu ne demek?'),
  ...say('model', 'mimic', 0.3, 0.7, 'SİSTEM', '— Model yalnızca davranışı taklit eder. Hatırlıyormuş gibi yapmak da bir davranıştır.'),
  tell('twice', 'mimic', 0.74, 1.04, ['Arif cevabı iki kez okudu.']),

  // 05 — İZLER
  tell('source', 'file', 0.04, 0.36, ['Ekranın köşesinde küçük bir sekme vardı: KAYNAK.', 'Arif dokundu.']),
  sys('file-head', 'file', 0.3, 1.0, 'HEDEF 0412 · KAYNAK: K. AYDOĞAN · 46 · HÜKÜMLÜ'),
  tell('habits-list', 'file', 0.42, 1.04, ['Bir insanın alışkanlıkları madde madde yazıyordu.', 'Ne yaptığı yazmıyordu.'], { purpose: 'foreshadow' }),
  { id: 'remember', seg: 'doubt', from: 0.15, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Arif hatırlamıyordu.', 'Ya da hatırlamamak için para ödüyordu.'], stagger: 0.35 },

  // 06 — İNSAN
  tell('taps', 'plead', 0.03, 0.2, ['Kopya masaya üç kez vurdu. Sonra konuştu.'], { purpose: 'turn' }),
  ...say('tuesday', 'plead', 0.22, 0.32, '0412', '— Salı.'),
  ...say('always', 'plead', 0.34, 0.48, '0412', '— Hep salı geliyorsun. Akşam.'),
  ...say('today', 'plead', 0.5, 0.64, '0412', '— Bugün bir şey yapmayacak mısın?'),
  tell('sat', 'plead', 0.84, 1.04, ['Arif bir süre oturdu.']),
  tell('left', 'leave', 0.1, 0.62, ['Arif o gün hiçbir şey yapmadan çıktı.'], { strong: true, purpose: 'turn' }),
  sys('early', 'leave', 0.3, 0.95, 'OTURUM ERKEN SONLANDIRILDI · KREDİ İADE EDİLMEZ'),

  // 07 — KIRILMA
  { id: 'other-side', seg: 'swap', from: 0.15, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'reveal', lines: ['Şimdi camın öbür tarafındasın.'] },
  { id: 'smaller', seg: 'marks', from: 0.05, to: 0.45, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Buradan bakınca oda daha küçüktü.'] },
  { id: 'tally', seg: 'marks', from: 0.5, to: 1.15, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Duvarda çentikler vardı. Biri her oturumu saymıştı.'] },
  { id: 'door', seg: 'oneway', from: 0.25, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Kapı yalnızca bir yönden açılıyordu.'] },

  // 08 — KARŞI TARAF
  tell('table', 'replay', 0.05, 0.46, ['Masaya ilk vurduğunda masa titremişti.', 'Buradan bakınca titreyen masa değildi.'], { purpose: 'reveal' }),
  tell('count', 'replay', 0.54, 1.04, ['Sandalye duvara çarparken gözlerini kapatmıştı.', 'Saymak için.'], { purpose: 'reveal' }),
  { id: 'his-eyes', seg: 'watch', from: 0.2, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ["Arif'in yüzü bu taraftan hiç öfkeli görünmüyordu.", 'Yalnızca yorgun.'], stagger: 0.4 },

  // 09 — SORU
  { id: 'session-complete', seg: 'complete', from: 0.1, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['ANGER SESSION COMPLETE'] },
  { id: 'forget', seg: 'complete', from: 0.35, to: 1.1, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Merkez, kullanıcılarına unutmayı da satıyordu.'] },
  { id: 'retained', seg: 'retained', from: 0.1, to: 0.95, slot: 'top', kind: 'alert', purpose: 'reveal', world: true, lines: ['USER MEMORY RETAINED'] },
  { id: 'someone', seg: 'retained', from: 0.4, to: 1.1, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ['Ama birileri hatırlıyordu.'] },
  {
    id: 'real',
    seg: 'question',
    from: 0.12,
    to: 1.0,
    slot: 'center',
    kind: 'reveal',
    purpose: 'question',
    lines: ['Eğer acı çeken kişi gerçek değilse,', 'acının kendisi gerçek dışı mıdır?'],
    stagger: 0.3,
  },

  // 10 — SON
  sys('done-arif', 'exit', 0.3, 0.95, 'OTURUM BAŞARIYLA TAMAMLANDI.'),
  tell('evening', 'exit', 0.4, 1.04, ['Arif dışarı çıktı.', 'Akşam, her zamanki akşamdı.'], { purpose: 'mood' }),
  sys('done-copy', 'copyside', 0.06, 0.6, 'OTURUM BAŞARIYLA TAMAMLANDI.'),
  tell('light', 'copyside', 0.3, 0.68, ['Odanın ışığı sönmedi.'], { purpose: 'reveal' }),
  tell('not-over', 'copyside', 0.72, 1.06, ['Onun için oturum bitmemişti.'], { purpose: 'reveal', strong: true }),
  { id: 'end', seg: 'end', from: 0.3, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['ÖFKE NÖBETİ'], sub: 'Oturumunuz kaydedildi.', fade: 0.4 },
]

export const TRANSCRIPT: Record<string, string> = {
  service:
    'Yakın gelecekte bir şehir. Devletin açtığı öfke boşaltma merkezine akşamüstü giren Arif’in telefonuna aynı mesaj dördüncü kez gelir: babasının yaşlı bakım desteği başvurusu uygun bulunmamıştır. Üç aydır bir ekrandan ötekine giden bir başvuru; bağırabileceği bir insan yoktur. Bekleme salonundaki herkes sakindir. Duvardaki reklam: öfkenizi eve götürmeyin.',
  rules:
    'Sistem Arif’in adını okur. Danışmadaki görevli kuralları anlatır: hedefler gerçek insanlar değildir, mahkûmların davranış kayıtlarından üretilirler; kimse zarar görmez. Arif imzalar, bir terminalde gerçek mahkûmlardan kopyalanmış yüzler arasından 0412’yi seçer; neden o yüzü seçtiğini bilmez.',
  relief:
    'Beyaz bir odada kopya bir sandalyede oturmaktadır. Arif önce konuşur, sonra öfkesi büyür; öfke ölçeği yükselir, masaya vurur, sandalyeyi duvara fırlatır. Merkez buna arınma der. Oturum “hedef sonlandırıldı” mesajıyla biter ve Arif oturumu puanlar. Dışarıda hava serinlemiştir; o akşam babasını arar ve uzun zamandır ilk kez sesini yükseltmeden konuşur. Bir pano bu ay şiddet suçlarının azaldığını söyler.',
  deviation:
    'Bir hafta sonra Arif yine gelir. Aynı oda, aynı yüz; koridordaki diğer odalarda da aynı yüz vardır, kopya her seferinde temiz ve hatırasız üretilir. Bu kez kopya Arif’i tanır: “Yine sen. Beni daha önce öldürdün.” Sistem açıklar: model yalnızca davranışı taklit eder, hatırlıyormuş gibi yapmak da bir davranıştır.',
  traces:
    'Ekranın köşesindeki KAYNAK sekmesi kopyanın üretildiği mahkûmun dosyasını açar: K. Aydoğan, 46 yaşında, hükümlü. Konuşmadan önce masaya üç kez vurur, kapı sesinden korkar, salı günleri iştahsızdır. Ne yaptığı yazmaz. Arif hatırlamaz; belki de hatırlamamak için para ödemektedir.',
  human:
    'Kopya masaya üç kez vurur ve konuşur: Arif hep salı, akşam gelmektedir. Bugün bir şey yapıp yapmayacağını sorar. Arif bir süre oturur ve o gün hiçbir şey yapmadan çıkar. Sistem oturumu erken sonlandırır; kredi iade edilmez.',
  break:
    'Bakış açısı değişir: artık kopyanın gözündensin. Oda bu taraftan daha küçüktür; duvarda her oturumu sayan çentikler vardır. Kapı yalnızca dışarıdan açılır.',
  otherside:
    'Arif’in ilk oturumu bu kez karşı taraftan görülür: masaya vurduğunda titreyen masa değildir; sandalye duvara çarparken kopya saymak için gözlerini kapatmıştır. Arif’in yüzü bu taraftan öfkeli değil, yorgun görünür.',
  question:
    'Sistem oturumun tamamlandığını bildirir; merkez kullanıcılarına unutmayı da satar. Kopyanın yanındaki küçük ekranda ise başka bir satır vardır: kullanıcı hafızası saklandı. Birileri hatırlamaktadır. Eğer acı çeken kişi gerçek değilse, acının kendisi gerçek dışı mıdır?',
  end:
    'Arif dışarı çıkar; telefonunda “Oturum başarıyla tamamlandı.” yazar ve akşam her zamanki akşamdır. Aynı cümle kopyanın odasındaki küçük ekranda da belirir. Odanın ışığı sönmez; onun için oturum bitmemiştir. Duvara bir çentik daha eklenir.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('street', 0.2)],
  [at('terminate', 0.2), at('terminate', 0.9)],
  [at('swap'), at('swap', 1)],
  [at('question'), at('question', 1)],
  [at('copyside', 0.6), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'street', at: 0.7, text: '[otomatik kapı açılır]' },
  { seg: 'call', at: 0.08, text: '[anons sesi]' },
  { seg: 'enter', at: 0.15, text: '[kapı kilitlenir]' },
  { seg: 'rise', at: 0.6, text: '[masaya vurulan yumruk]' },
  { seg: 'throw', at: 0.62, text: '[duvara çarpan sandalye]' },
  { seg: 'terminate', at: 0.3, text: '[uzun bir sinyal sesi, sonra sessizlik]' },
  { seg: 'oneway', at: 0.3, text: '[kapı dışarıdan kilitlenir]' },
  { seg: 'retained', at: 0.1, text: '[küçük ekranda tek bir bip]' },
  { seg: 'reason', at: 0.06, text: '[telefon titrer]' },
  { seg: 'relief', at: 0.12, text: '[otomatik kapı açılır]' },
  { seg: 'plead', at: 0.05, text: '[masaya üç kez vurulur]' },
  { seg: 'leave', at: 0.35, text: '[kapı açılır]' },
  { seg: 'replay', at: 0.3, text: '[masaya vurulan yumruk]' },
  { seg: 'replay', at: 0.76, text: '[duvara çarpan sandalye]' },
  { seg: 'exit', at: 0.16, text: '[otomatik kapı açılır]' },
  { seg: 'copyside', at: 0.08, text: '[küçük ekranda bir bip]' },
  { seg: 'copyside', at: 0.8, text: '[duvarda bir çizik]' },
]

/** World positions match the set in src/three/ofke/. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'poster',
    title: 'Ayın hedefi',
    seg: 'lobby',
    from: 0,
    to: 1.9,
    pos: [3.4, 1.7, 5.9],
    size: 0.6,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['AYIN EN ÇOK SEÇİLEN HEDEFİ', '0412'] },
  },
  {
    id: 'knuckles',
    title: 'Arif’in elleri',
    seg: 'wait',
    from: 0,
    to: 1.6,
    pos: [4.4, 1.0, 1.6],
    size: 0.5,
    kind: 'character',
    visibility: 'subtle',
  },
  {
    id: 'price',
    title: 'Öfke kredisi',
    seg: 'ads',
    from: 0,
    to: 1.4,
    pos: [-5.9, 1.9, 2.5],
    size: 0.9,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Öfke kredisi her ay yenilenir.', 'Kullanılmayan öfke devredilmez.'] },
  },
  {
    id: 'watcher',
    title: 'Koridordaki gözlemci',
    seg: 'stare',
    from: 0,
    to: 2.2,
    pos: [0.2, 1.6, -11.5],
    size: 0.5,
    kind: 'reflection',
    visibility: 'hidden',
  },
  {
    id: 'same-faces',
    title: 'Aynı yüzler',
    seg: 'corridor',
    from: 0,
    to: 1,
    pos: [-3.6, 1.2, -15],
    size: 0.8,
    kind: 'anomaly',
    visibility: 'visible',
  },
  {
    id: 'marks',
    title: 'Duvardaki çentikler',
    seg: 'marks',
    from: 0,
    to: 1.6,
    pos: [3.6, 1.35, -12.95],
    size: 0.5,
    kind: 'environment',
    visibility: 'visible',
    examine: { verb: 'SAY', lines: ['Dört yüz on bir çentik.', 'Sonuncusu yeni.'] },
  },
  {
    id: 'crime',
    title: 'Dosyanın boş satırı',
    seg: 'file',
    from: 0,
    to: 1,
    pos: [4.47, 2.0, -11.5],
    size: 0.4,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['SUÇ: ERİŞİM YETKİNİZ YOK.', 'Satırın altında silinmiş bir tarih: bir salı.'] },
  },
  {
    id: 'retained-screen',
    title: 'Saklanan hafıza',
    seg: 'retained',
    from: 0,
    to: 1.2,
    pos: [3.7, 1.3, -10.05],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
  },
]

/** The two places the reader acts: the rating, and what to say to 0412. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'rate',
    seg: 'rate',
    at: 0.22,
    style: 'query',
    title: 'OTURUMU DEĞERLENDİRİN',
    prompt: 'Deneyiminizi puanlayın.',
    options: [
      { id: 'five', label: '★★★★★', speaker: 'SİSTEM', reply: ['Teşekkür ederiz.', 'Geri bildiriminiz hedef modelin geliştirilmesinde kullanılacaktır.'], sets: ['rate:5'] },
      { id: 'four', label: '★★★★☆', speaker: 'SİSTEM', reply: ['Teşekkür ederiz.', 'Geri bildiriminiz hedef modelin geliştirilmesinde kullanılacaktır.'], sets: ['rate:4'] },
      { id: 'three', label: '★★★☆☆', speaker: 'SİSTEM', reply: ['Teşekkür ederiz.', 'Bir sonraki oturumunuzda hedef daha gerçekçi olacaktır.'], sets: ['rate:3'] },
      { id: 'one', label: '★☆☆☆☆', speaker: 'SİSTEM', reply: ['Üzgünüz.', 'Bir sonraki oturumunuzda hedef daha gerçekçi olacaktır.'], sets: ['rate:1'] },
    ],
  },
  {
    id: 'plead',
    seg: 'plead',
    at: 0.68,
    style: 'choice',
    title: 'SALI · 18.52',
    prompt: 'Ona ne diyeceksin?',
    options: [
      { id: 'why', label: '“Neden salı?”', speaker: '0412', reply: ['Kızım salıları gelirdi.', 'Görüş günüydü.'], sets: ['plead:why'] },
      { id: 'sorry', label: '“Özür dilerim.”', speaker: '0412', reply: ['Bunu da söylemiştin.'], sets: ['plead:sorry'] },
      { id: 'silent', label: 'Hiçbir şey söyleme.', reply: ['Kopya bekledi. Sonra o da sustu.'], sets: ['plead:silent'] },
    ],
  },
]
