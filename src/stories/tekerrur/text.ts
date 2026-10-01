/**
 * TEKERRÜR — "Her Şeyin Durumu". Every word the reader sees.
 *
 * DURUM is a model of the state of everything, built to compute what comes
 * next. Arif asks it small things, then a thing about himself. The story never
 * explains determinism, chaos or measurement; it lets them happen to a cup, a
 * pen, a colleague's tea glass, a phone that is not answered — and to the
 * reader, who is asked the last question.
 *
 * Voices: ARİF (tired, curious, human), DURUM (calm, literal, bureaucratically
 * exact; never a villain), SELİN (the night technician; practical, dry).
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>
type Line = readonly [speaker: string | null, text: string]

const NEW: When = { none: ['mem:asked'] }
const AGAIN: When = { all: ['mem:asked'] }

/**
 * A run of lines inside [from, to] of a segment, one after another on the
 * rail (speaker in the caption above). DURUM speaks in the machine's voice.
 */
function talk(id: string, seg: SegmentId, from0: number, to0: number, lines: Line[], when?: When): T[] {
  // Lines stay inside their segment, so neighbouring scenes never collide.
  const from = Math.max(0.01, from0)
  const to = Math.min(0.99, to0)
  const span = (to - from) / lines.length
  return lines.flatMap(([who, text], i): T[] => {
    const a = from + i * span
    const b = a + span - Math.min(0.03, span * 0.12)
    const line: T = { id: `${id}-${i}`, seg, from: a, to: b, slot: 'rail', kind: who === 'DURUM' ? 'machine' : who ? 'dialogue' : 'narration', purpose: who ? 'dialogue' : 'context', lines: [text], fade: 0.22, when }
    return who ? [{ id: `${id}-${i}-who`, seg, from: a, to: b, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [who], fade: 0.22, when }, line] : [line]
  })
}

/** Narration: one item whose lines arrive one after another. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from: Math.max(0.01, from),
  to: Math.min(0.99, to),
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.75 / lines.length : undefined,
  ...extra,
})

const A = 'ARİF'
const D = 'DURUM'
const S = 'SELİN'

export const TEXT: T[] = [
  // 01 — DURUM
  { id: 'night', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Perşembe. 20.58.'], sub: 'SCROLL', when: NEW },
  { id: 'night-again', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Perşembe. 20.59.'], sub: 'SCROLL', when: AGAIN },
  tell('lights', 'office', 0.18, 1.0, ['Gözlemevinde ışıkların çoğu sönmüştü.', 'Arif’in masasındaki lamba hariç.']),
  { id: 'state-label', seg: 'office', from: 0.1, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['DURUM · KÜRESEL DURUM MODELİ'] },
  ...talk('coffee', 'coffee', 0.08, 1.0, [
    [A, '— Bugün de mi çalışmadın?'],
    [D, '— Çalışıyorum.'],
    [A, '— Yok. Kahveyi diyorum.'],
  ]),
  ...talk('machine', 'coffee2', 0.12, 0.98, [
    [D, '— Kahve makinesi çalışıyor.'],
    [A, '— Tamam.'],
  ], NEW),
  ...talk('machine-again', 'coffee2', 0.12, 0.98, [
    [D, '— Kahveyi ben yaptım.'],
    [A, '— Ne zamandan beri?'],
    [D, '— Bu akşamdan beri.'],
  ], AGAIN),
  tell('built', 'desk', 0.06, 1.04, ['DURUM, evrenin şu anki hâlini olabildiğince eksiksiz tutmak için kurulmuştu.', 'Nerede ne var, ne hızla gidiyor, ne kadar sıcak.', 'Ve bütün bunlardan sonra ne olacak.']),
  tell('small-thing', 'query1', 0.04, 0.24, ['Arif bir şey sordu. Her akşam yaptığı gibi, önemsiz bir şey.']),
  tell('answers', 'query1', 0.42, 1.02, ['Cevaplar hep böyleydi: kısa, kesin, biraz fazla.']),

  // 02 — TAHMİN
  tell('yesterday', 'log', 0.08, 1.0, ['Dün de sormuştu.', 'Bugün saat 14.17’de Kızılay köşesinden kaç araba geçeceğini.']),
  { id: 'log-screen', seg: 'log', from: 0.2, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['TAHMİN · 14.17 · KIZILAY · 212'] },
  tell('counted', 'test', 0.06, 0.48, ['Kamera kaydını açtı. Saydı. Bir daha saydı.']),
  tell('212', 'test', 0.52, 1.02, ['İki yüz on iki.'], { strong: true, purpose: 'turn' }),
  tell('small', 'small', 0.1, 1.02, ['Büyük şeyler sormayı çoktan bırakmıştı.', 'Küçük şeyler daha iyi sınardı.']),
  tell('edge', 'pen', 0.04, 0.26, ['Arif kalemi masanın kenarından tuttu.']),
  tell('fell', 'drop', 0.12, 0.4, ['Kalem düştü.']),
  tell('there', 'drop', 0.44, 0.72, ['Tam orada durdu.'], { strong: true, purpose: 'turn' }),
  tell('left-it', 'drop', 0.76, 1.04, ['Arif bir süre kaleme baktı. Almadı.']),
  tell('evenings', 'routine', 0.2, 1.02, ['Böyle akşamlar böyle başlardı.'], { purpose: 'mood' }),

  // 03 — İNSAN
  ...talk('people', 'ask', 0.06, 1.02, [
    [A, '— İnsanları da biliyor musun?'],
    [D, '— Evet.'],
    [A, '— Beş dakika sonra ne yapacaklarını?'],
    [D, '— Evet.'],
  ]),
  ...talk('me', 'me', 0.12, 1.02, [
    [A, '— Benim?'],
    [D, '— Evet.'],
  ]),
  ...talk('cup', 'cup', 0.06, 0.62, [[D, '— Dokuz dakika sonra, 21.13.04’te, masanızdaki bardağı yere bırakacaksınız.']]),
  tell('the-cup', 'cup', 0.66, 1.04, ['Bardak oradaydı. Yarısı dolu, çoktan soğumuş.']),
  tell('nine', 'cupChoice', 0.04, 0.26, ['Dokuz dakika vardı.'], { purpose: 'turn' }),
  tell('act-kitchen', 'act', 0.06, 1.02, ['Bardağı alıp koridora çıktı. Mutfakta yıkadı, kuruladı, dolaba koydu.', 'Dolabın kapağını kapattığında saat 21.11’di.'], { when: { all: ['cup:kitchen'] } }),
  tell('act-drawer', 'act', 0.06, 1.02, ['Bardağı alt çekmeceye koydu. Anahtarı çevirip cebine attı.', 'Sonra ellerini dizlerine koydu.'], { when: { all: ['cup:drawer'] } }),
  tell('act-wait', 'act', 0.06, 1.02, ['Ellerini masadan çekti. Bardağa dokunmayacaktı.', 'Dokunmamak da bir şeydi.'], { when: { all: ['cup:wait'] } }),
  { id: 'clock-1313', seg: 'wait13', from: 0.1, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['21:13:00'] },
  tell('safe-kitchen', 'wait13', 0.64, 0.86, ['Bardak dolaptaydı.'], { when: { all: ['cup:kitchen'] } }),
  tell('safe-drawer', 'wait13', 0.64, 0.86, ['Çekmece kilitliydi.'], { when: { all: ['cup:drawer'] } }),
  tell('safe-wait', 'wait13', 0.64, 0.86, ['Bardak yerinde duruyordu.'], { when: { all: ['cup:wait'] } }),
  ...talk('did-it', 'wait13', 0.88, 1.06, [[A, '— Oldu işte.']]),

  // 04 — SAPMA
  tell('crash-kitchen', 'crash', 0.08, 1.02, ['Mutfaktan dönerken kapıda Selin’le karşılaştı. Biri sağa kaçtı, öbürü de sağa.', 'Selin’in elindeki çay bardağı yere düştü.'], { when: { all: ['cup:kitchen'] }, purpose: 'turn' }),
  tell('crash-drawer', 'crash', 0.08, 1.02, ['Selin içeri girmişti; sunucu yükünü sormaya gelmişti. Saat 21.13’ü gösterdiğinde Arif yerinden fırladı.', 'Dirseği Selin’in elindeki çay bardağına çarptı.'], { when: { all: ['cup:drawer'] }, purpose: 'turn' }),
  tell('crash-wait', 'crash', 0.08, 1.02, ['Selin içeri girmiş, çay bardağını Arif’in masasının kenarına bırakıp ekrana eğilmişti.', 'Masaya yaslandığı an bardak kaydı.'], { when: { all: ['cup:wait'] }, purpose: 'turn' }),
  ...talk('complete', 'done', 0.04, 1.04, [
    [D, '— Tahmin tamamlandı.'],
    [A, '— Ben onu kırmadım.'],
    [D, '— Sorunuz bardağın kırılıp kırılmayacağı değildi.'],
    [A, '— Ne?'],
    [D, '— Davranışınızın sonucuydu.'],
  ]),
  ...talk('selin', 'selin', 0.04, 1.04, [
    [S, '— Gecenin onunda dokuz dakikalık davranış modeli. Soğutma ünitesi ağlıyor.'],
    [S, '— Kimin davranışı?'],
    [A, '— Benim.'],
    [S, '— Bir dahaki sefere bana da söyle. Çayımı ona göre içerim.'],
  ]),
  tell('one-more', 'selinQuery', 0.04, 0.23, ['Selin süpürgeyi almaya gittiğinde Arif bir soru daha yazdı.']),
  ...talk('read-aloud', 'selinQuery', 0.46, 1.02, [
    [A, '— Yirmi iki kırkta çıkacakmışsın. Yüzde doksan dokuz virgül sekiz.'],
    [S, '— Öyle mi?'],
  ]),
  { id: 'clock-2240', seg: 'late', from: 0.05, to: 0.9, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['22:40'] },
  tell('still-here', 'late', 0.08, 0.7, ['Saat 22.40’ta Selin hâlâ oradaydı.', 'Yan masada simit yiyor, kızının fen ödevini anlatıyordu.']),
  ...talk('homework', 'late', 0.72, 1.06, [[S, '— Mıknatısla çivi. Yarın teslim. Ben de bilmiyorum nasıl yapılır.']]),
  ...talk('wrong', 'wrong', 0.04, 1.04, [
    [A, '— Yanıldın.'],
    [D, '— Evet.'],
    [A, '— Niye?'],
    [D, '— Modeldeki belirsizliği eksik hesapladım.'],
    [A, '— Sen hata da mı yapıyorsun?'],
    [D, '— Evet.'],
  ]),
  tell('relief', 'calc', 0.04, 0.46, ['Arif gülümsedi. İlk kez rahatlamıştı.']),
  ...talk('calc', 'calc', 0.5, 1.04, [[D, '— Bu da hesaplanmıştı.']]),

  // 05 — OLASILIK
  tell('one-particle', 'particle', 0.04, 0.3, ['Gece yarısına doğru Arif büyük ekrana tek bir parçacık çağırdı.']),
  ...talk('particle', 'particle', 0.32, 1.04, [
    [A, '— Her şeyi biliyorsan bunun bir saniye sonra nerede olacağını neden kesin söyleyemiyorsun?'],
    [D, '— Çünkü sorunuz yanlış kurulmuş olabilir.'],
    [A, '— Nasıl yani?'],
  ]),
  ...talk('cloud', 'cloud', 0.03, 1.06, [
    [D, '— Tek bir gelecek istemekle, olabilecek geleceklerin hepsini istemek aynı şey değil.'],
    [A, '— Hangisi gerçek?'],
    [D, '— Gözlemlediğiniz sonuç.'],
    [A, '— Diğerleri?'],
    [D, '— Gerçekleşmedi.'],
    [A, '— Ama mümkündü.'],
    [D, '— Evet.'],
  ]),
  ...talk('change', 'chaosQuery', 0.04, 0.27, [[A, '— Başta çok küçük bir şeyi değiştirirsem?']]),
  tell('chain', 'chain', 0.05, 1.06, ['Önce hiçbir şey değişmedi.', 'Üçüncü günün öğleden sonrasında bir trafo fazla ısındı.', 'Bir mahallede ışıklar kırk dakika geç yandı.', 'Bir kadın o akşam bir telefonu açmadı.']),
  ...talk('some', 'some', 0.06, 1.04, [
    [D, '— Bazı sistemlerde sonuç çok az değişir.'],
    [A, '— Bazılarında?'],
    [D, '— Çok fazla.'],
  ]),
  ...talk('knowing', 'knowing', 0.04, 1.06, [
    [A, '— O zaman determinizm yanlış.'],
    [D, '— Bunu söylemek için yeterli bilgi yok.'],
    [A, '— Az önce geleceği bildiğini söyledin.'],
    [D, '— “Bilmek” derken sizin kastettiğinizle benim kastettiğim aynı değil.'],
  ]),

  // 06 — GÖZLEMCİ
  ...talk('asking', 'asking', 0.04, 1.06, [
    [A, '— Benim sana bunu sormam da hesapta mı?'],
    [D, '— Evet.'],
    [A, '— Bir sonraki sorumu da biliyor musun?'],
    [D, '— Sormadan önceki hâlinizi mi, sorduktan sonraki hâlinizi mi?'],
  ]),
  tell('silent', 'before', 0.3, 0.95, ['Arif sustu.'], { purpose: 'mood' }),
  ...talk('selfref', 'selfref', 0.03, 1.07, [
    [A, '— Şimdi sana bir soru soracağım.'],
    [D, '— Biliyorum.'],
    [A, '— Söyle o zaman.'],
    [D, '— Hayır.'],
    [A, '— Niye?'],
    [D, '— Söylersem sorunun oluşacağı koşullar değişir.'],
    [A, '— Ama biliyorsun.'],
    [D, '— Bilmek ile söylemek aynı olay değil.'],
  ]),
  ...talk('because', 'because', 0.04, 0.42, [[D, '— Yanılmamın sebebi, beni gördükten sonra sizin de beni hesaba katmanız.']]),
  tell('heard', 'because', 0.46, 1.04, ['Selin 22.40’ta çıkmamıştı.', 'Tahmini duymuştu.'], { purpose: 'reveal' }),

  // 07 — KENDİSİ
  tell('inside', 'hall', 0.05, 1.04, ['DURUM’un kendisi de evrenin içindeydi.', 'Bu salondaki her fan, ısınan her kablo, her bit.', 'Evreni eksiksiz bilmesi için kendini de bilmesi gerekiyordu.']),
  tell('itself', 'inside', 0.06, 0.6, ['Kendini bilmek için de, kendini bileni.'], { purpose: 'reveal' }),
  ...talk('warm', 'inside', 0.64, 1.02, [[A, '— Sıcakmış burası.']]),
  ...talk('future', 'future', 0.1, 0.45, [[A, '— Peki benim geleceğim?']]),
  { id: 'calculating', seg: 'future', from: 0.5, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['CALCULATING'] },
  { id: 'depth-label', seg: 'depth', from: 0.0, to: 0.95, slot: 'top', kind: 'alert', purpose: 'system', world: true, lines: ['MODEL SELF-REFERENCE DEPTH EXCEEDED'] },
  ...talk('change-q', 'depth', 0.38, 1.06, [
    [D, '— Soruyu değiştirebiliriz.'],
    [A, '— Niye?'],
    [D, '— Çünkü cevap artık yalnızca sizin geleceğinize bağlı değil.'],
  ]),
  ...talk('on-what', 'you', 0.04, 0.3, [[A, '— Neye bağlı?']]),
  ...talk('on-you', 'you', 0.6, 1.06, [[D, '— Size.']]),
  ...talk('0312', 't0312', 0.03, 1.08, [
    [D, '— Yarın saat 03.12’de burada olmayacaksınız.'],
    [A, '— Nereye gideceğim?'],
    [A, '— Neden söylemiyorsun?'],
    [D, '— Bu bilgiyi vermek hesaplanan sonucu etkiliyor.'],
    [A, '— O zaman bilmek diye bir şey yok.'],
    [D, '— Hayır.'],
    [A, '— Ne var o zaman?'],
    [D, '— Koşullara bağlı sonuçlar.'],
  ]),

  // 08 — SEÇİM
  tell('missed', 'phone', 0.04, 0.74, ['Masasına döndüğünde telefonda bir cevapsız arama vardı. 22.51, Defne.', 'Bir de mesaj.']),
  { id: 'message', seg: 'phone', from: 0.4, to: 1.0, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ['Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim.'] },
  tell('turned', 'phone', 0.78, 1.04, ['Arif telefonu ters çevirdi. Sonra düz.']),
  tell('typed', 'homeQuery', 0.06, 0.26, ['Arif ekrana yazdı.']),
  ...talk('want', 'wantKnow', 0.04, 1.06, [
    [D, '— Geleceğinizi bilmek istiyor musunuz?'],
    [A, '— Bilmiyorum.'],
    [D, '— Bu cevap tahmin edilebilirdi.'],
    [A, '— Ne?'],
    [D, '— Bilmemeniz.'],
  ]),

  // 09 — TEKERRÜR
  tell('archive', 'archive', 0.05, 1.04, ['Saat ikiyi geçerken Arif sorgu arşivini açtı.', 'Yıllar boyunca DURUM’a sorulmuş her şey buradaydı.', 'Yağmurlar, trafikler, maç skorları, kurlar.']),
  tell('oldest', 'record', 0.04, 0.3, ['En eski kayıt en üstteydi. Oluşturulma tarihi: 14 Mart 2031.'], { purpose: 'reveal' }),
  ...talk('record', 'record', 0.32, 1.04, [
    [A, '— Bu ne?'],
    [D, '— Kayıt.'],
    [A, '— Bu tarih daha gelmedi.'],
    [D, '— Doğru.'],
  ]),
  ...talk('record2', 'record2', 0.04, 1.04, [
    [A, '— Kim oluşturdu bunu?'],
    [D, '— Siz.'],
    [A, '— Ne zaman?'],
    [D, '— Soruyu sorduktan sonra.'],
    [A, '— Hangi soruyu?'],
  ]),
  { id: 'pending', seg: 'pending', from: 0.1, to: 1.0, slot: 'center', kind: 'word', purpose: 'reveal', world: true, lines: ['QUERY PENDING', 'Bunu zaten biliyor muydun?'] },
  tell('scrolled', 'count', 0.04, 0.6, ['Arif listeyi aşağı kaydırdı.', 'Aynı soru tekrar tekrar geçiyordu. Başka yıllarda, başka masalardan.']),
  ...talk('count', 'count', 0.62, 1.06, [[D, '— Bu soru bu yıl 41.207 kez soruldu. Siz 41.208’incisiniz.']], NEW),
  ...talk('count-again', 'count', 0.62, 1.06, [[D, '— Bu soru bu yıl 41.208 kez soruldu. Siz 41.209’uncusunuz.']], AGAIN),
  ...talk('questions', 'questions', 0.04, 1.06, [
    [A, '— Sen tam olarak neyi tahmin ediyorsun?'],
    [D, '— Sorulacak soruları.'],
    [D, '— Elimdeki en kararlı veri onlar.'],
  ]),

  // 10 — SORU
  tell('coat-go', 'leaving', 0.04, 0.6, ['Saat üçe geliyordu. Arif ceketini aldı.', 'Eve gidecekti. Bunu kimseye sormamıştı; sormuştu ama cevabı okumamıştı.'], { when: { all: ['home:go'] } }),
  tell('coat-stay', 'leaving', 0.04, 0.6, ['Saat üçe geliyordu. Arif ceketini aldı.', 'Kalacağını yazmıştı. Yine de kapıya yürüdü.'], { when: { all: ['home:stay'] } }),
  tell('coat-silent', 'leaving', 0.04, 0.6, ['Saat üçe geliyordu.', 'Arif hiçbir şey sormadan ceketini aldı.'], { when: { all: ['home:silent'] } }),
  ...talk('door', 'leaving', 0.62, 1.06, [
    [S, '— Gidiyor musun?'],
    [A, '— Bilmiyorum. Sanırım.'],
  ]),
  tell('empty', 'empty', 0.55, 1.04, ['03.12. Oda boştu.', 'DURUM çalışmaya devam ediyordu.'], { purpose: 'mood' }),
  { id: 'observer-01', seg: 'empty', from: 0.2, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['OBSERVER: 01'] },
  { id: 'observer-02', seg: 'observer2', from: 0.05, to: 1.0, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ['OBSERVER: 02'] },
  { id: 'waiting', seg: 'observer2', from: 0.4, to: 1.0, slot: 'center', kind: 'word', purpose: 'reveal', lines: ['Soru bekleniyor.'] },
  { id: 'asked-before', seg: 'accepted', from: 0.15, to: 1.0, slot: 'center', kind: 'reveal', purpose: 'reveal', lines: ['Bu soru daha önce de soruldu.'] },
  { id: 'end', seg: 'end', from: 0.25, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['TEKERRÜR'], sub: 'PERŞEMBE · 20.58', fade: 0.4, when: NEW },
  { id: 'end-again', seg: 'end', from: 0.25, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['TEKERRÜR'], sub: 'PERŞEMBE · 20.59', fade: 0.4, when: AGAIN },
]

/** The questions and decisions. Answers become flags the text and the set read. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'query1',
    seg: 'query1',
    at: 0.3,
    style: 'query',
    title: 'DURUM · SORGU',
    prompt: 'Önemsiz bir şey sor.',
    options: [
      { id: 'rain', tag: 'DÜNYA', label: 'Yarın Ankara’ya yağmur yağacak mı?', speaker: D, reply: ['Yüzde doksan dokuz virgül üç.', 'ARİF: Bu kadar mı?', 'Sorunuz yağmurun yağıp yağmayacağıydı.'], sets: ['q:rain'] },
      { id: 'temp', tag: 'ODA', label: 'Bu odanın sıcaklığı kaç?', speaker: D, reply: ['21,4 derece. Masanızın yanında 22,1. Kahve makinesinin üstünde 31,8.', 'ARİF: Kahveyi sormadım.', 'Biliyorum.'], sets: ['q:temp'] },
      { id: 'traffic', tag: 'ŞEHİR', label: 'Yarın 14.17’de Kızılay köşesinden kaç araba geçecek?', speaker: D, reply: ['İki yüz on iki.', 'Altısı beyaz. Biri park etmeye çalışacak.'], sets: ['q:traffic'] },
    ],
  },
  {
    id: 'pen',
    seg: 'pen',
    at: 0.3,
    style: 'query',
    title: 'DURUM · SORGU',
    options: [
      { id: 'where', tag: 'FİZİK', label: 'Bırakırsam nereye düşer?', speaker: D, reply: ['Halıya. Sağ ayağınızın yirmi iki santim önüne.', 'Ucu kapıya bakacak.'], sets: ['pen:where'] },
      { id: 'bounce', tag: 'FİZİK', label: 'Kaç kere zıplar?', speaker: D, reply: ['İki kere.', 'İkincisini duymayacaksınız.'], sets: ['pen:bounce'] },
    ],
  },
  {
    id: 'cup',
    seg: 'cupChoice',
    at: 0.3,
    style: 'choice',
    title: '21.04 · BARDAK',
    prompt: 'Bardağı ne yapacaksın?',
    options: [
      { id: 'kitchen', label: 'Mutfağa götür, yıka, dolaba koy.', reply: ['Bardak elinde, kapıya yürüdün.'], sets: ['cup:kitchen'] },
      { id: 'drawer', label: 'Çekmeceye koy, çekmeceyi kilitle.', reply: ['Anahtar iki kez döndü.'], sets: ['cup:drawer'] },
      { id: 'wait', label: 'Hiç dokunma. Bekle.', reply: ['Ellerin dizlerinde, bekledin.'], sets: ['cup:wait'] },
    ],
  },
  {
    id: 'selin',
    seg: 'selinQuery',
    at: 0.25,
    style: 'query',
    title: 'DURUM · SORGU',
    options: [
      { id: 'when', tag: 'KİŞİLER', label: 'Selin bu gece kaçta çıkacak?', speaker: D, reply: ['22.40’ta.', 'Yüzde doksan dokuz virgül sekiz.'], sets: ['selin:asked'] },
      { id: 'thinks', tag: 'KİŞİLER', label: 'Selin şu an ne düşünüyor?', speaker: D, reply: ['Düşünceleri modellemiyorum. Davranışları modelliyorum.', 'Kapıdan 22.40’ta çıkacak. Yüzde doksan dokuz virgül sekiz.'], sets: ['selin:asked'] },
    ],
  },
  {
    id: 'chaos',
    seg: 'chaosQuery',
    at: 0.3,
    style: 'query',
    title: 'DURUM · KARŞI-OLGU',
    options: [
      { id: 'air', tag: 'KARŞI-OLGU', label: 'Kızılay’ın üstündeki bir hava parseli binde bir derece daha sıcak olsaydı?', speaker: D, reply: ['İki yol açıyorum.', 'Şimdiki yol. Karşı-olgu yol.'], sets: ['chaos:air'] },
      { id: 'bus', tag: 'KARŞI-OLGU', label: 'Bu sabah 413 numaralı otobüs kırk saniye geç kalsaydı?', speaker: D, reply: ['İki yol açıyorum.', 'Şimdiki yol. Karşı-olgu yol.'], sets: ['chaos:bus'] },
    ],
  },
  {
    id: 'home',
    seg: 'homeQuery',
    at: 0.3,
    style: 'query',
    title: '01.24 · SORGU',
    options: [
      { id: 'go', tag: 'BEN', label: 'Şimdi kalkıp eve gitsem ne olur?', speaker: D, reply: ['Bu sorunun iki cevabı var.', 'Birini söylersem öbürü gerçekleşir.'], sets: ['home:go'] },
      { id: 'stay', tag: 'BEN', label: 'Kalırsam ne olur?', speaker: D, reply: ['Kalırsanız sabah bu soruyu yeniden sorarsınız.'], sets: ['home:stay'] },
      { id: 'silent', tag: '—', label: 'Hiçbir şey sorma.', reply: ['İmleç yanıp söndü.'], sets: ['home:silent'] },
    ],
  },
  {
    id: 'final',
    seg: 'finalQuery',
    at: 0.3,
    style: 'query',
    title: 'QUERY INPUT',
    prompt: 'GELECEĞİ BİLMEK İSTER MİSİN?',
    options: [
      { id: 'yes', tag: 'YANIT', label: 'Evet.', speaker: D, reply: ['QUERY ACCEPTED', 'Bu soru daha önce de soruldu.'], sets: ['final:yes', 'mem:asked'] },
      { id: 'no', tag: 'YANIT', label: 'Hayır.', speaker: D, reply: ['QUERY ACCEPTED', 'Bu soru daha önce de soruldu.'], sets: ['final:no', 'mem:asked'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  state:
    'Perşembe gecesi, saat 20.58. DURUM gözlemevinde ışıkların çoğu sönmüş; Arif’in masasındaki lamba yanıyor. Arif makineye “Bugün de mi çalışmadın?” diye sorar, makine “Çalışıyorum” der; Arif kahveyi kastettiğini söyler. DURUM, evrenin şu anki hâlini olabildiğince eksiksiz tutmak ve bundan sonra ne olacağını hesaplamak için kurulmuş bir modeldir. Arif ona her akşam olduğu gibi önemsiz bir şey sorar.',
  prediction:
    'Arif bir gün önce, bugün 14.17’de Kızılay köşesinden kaç araba geçeceğini sormuştu: iki yüz on iki. Kamera kaydını açar, sayar: iki yüz on iki. Büyük sorular sormayı çoktan bırakmıştır; küçük şeyler daha iyi sınar. Kalemi masanın kenarından bırakmadan önce nereye düşeceğini sorar. Kalem tam söylenen yere düşer.',
  human:
    'Arif sorar: İnsanları da biliyor musun? Beş dakika sonra ne yapacaklarını? Benim? Hepsine cevap evettir. DURUM, dokuz dakika sonra, 21.13.04’te, Arif’in masasındaki bardağı yere bırakacağını söyler. Okur, Arif’in ne yapacağını seçer: bardağı mutfağa götürmek, çekmeceye kilitlemek ya da hiç dokunmamak. 21.13.04 gelir; Arif’in bardağına bir şey olmaz.',
  deviation:
    'Birkaç saniye sonra gece teknisyeni Selin’in çay bardağı yere düşüp kırılır; hangi seçim yapılmış olursa olsun, oraya başka bir yoldan varılır. Selin, dokuz dakikalık davranış modelinin soğutma ünitelerini zorladığını söylemeye gelmiştir. DURUM: “Tahmin tamamlandı. Sorunuz bardağın kırılıp kırılmayacağı değildi.” Arif, Selin’in 22.40’ta çıkacağını sorar ve tahmini yüksek sesle okur. 22.40’ta Selin hâlâ oradadır. DURUM yanıldığını kabul eder; Arif rahatlar. Sonra: “Bu da hesaplanmıştı.”',
  probability:
    'Gece yarısı Arif büyük ekrana tek bir parçacık çağırır ve bir saniye sonra nerede olacağını sorar. DURUM tek bir gelecekle olabilecek geleceklerin hepsinin aynı şey olmadığını söyler; ekranda olasılıklar belirir, ölçümle biri kalır. Arif başta çok küçük bir şeyi değiştirmeyi dener: binde bir derece, kırk saniye. İki yol yan yana açılır; üç gün sonra bir trafo, bir mahallenin ışıkları, açılmayan bir telefon. Bazı sistemlerde sonuç çok az değişir, bazılarında çok fazla. “Bilmek” derken ikisi aynı şeyi kastetmez.',
  observer:
    'Arif sorar: Benim bunu sormam da hesapta mı? Evet. Bir sonraki sorumu biliyor musun? Sormadan önceki hâlinizi mi, sonraki hâlinizi mi? Arif susar. DURUM bildiği soruyu söylemeyi reddeder: söylemek, sorunun oluşacağı koşulları değiştirir. Yanılmasının sebebi, onu gördükten sonra insanların da onu hesaba katmasıdır. Selin 22.40’ta çıkmamıştı; tahmini duymuştu.',
  itself:
    'Arif sunucu salonuna girer. DURUM’un kendisi de evrenin içindedir; evreni eksiksiz bilmesi için kendini de bilmesi gerekir. Arif kendi geleceğini sorar. Ekranda uzun süre CALCULATING yazar, sonra MODEL SELF-REFERENCE DEPTH EXCEEDED. DURUM soruyu değiştirmeyi önerir; cevap artık yalnızca Arif’in geleceğine değil, Arif’e bağlıdır. Arif’in yarın 03.12’de burada olmayacağını söyler ama nereye gideceğini söylemez: bu bilgiyi vermek sonucu etkiler. Bilmek diye bir şey yoktur; koşullara bağlı sonuçlar vardır.',
  choice:
    'Masasında Defne’den bir cevapsız arama ve bir mesaj vardır: Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim. Okur Arif’in ne soracağını seçer: eve gitsem, kalsam ya da hiçbir şey sormamak. DURUM sorar: Geleceğinizi bilmek istiyor musunuz? Arif bilmediğini söyler. Bu da tahmin edilebilirdi.',
  recurrence:
    'Arif sorgu arşivini açar. En eski kaydın oluşturulma tarihi 14 Mart 2031’dir; henüz gelmemiş bir tarih. Kaydı Arif oluşturmuştur, soruyu sorduktan sonra. Ekranda bekleyen bir sorgu belirir: Bunu zaten biliyor muydun? Listede aynı soru başka yıllarda, başka masalardan tekrar tekrar geçer. DURUM’un tahmin ettiği şey gelecek değil, sorulacak sorulardır.',
  question:
    'Saat üçe gelirken Arif ceketini alır; Selin gidip gitmediğini sorar. 03.12’de oda boştur, makine çalışmaya devam eder. Ekranda OBSERVER: 01, sonra OBSERVER: 02 belirir. Soru okura sorulur: Geleceği bilmek ister misin? Hangi cevap verilirse verilsin: Bu soru daha önce de soruldu.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('office', 0.2)],
  [at('wait13', 0.15), at('wait13', 0.62)],
  [at('before'), at('before', 0.3)],
  [at('depth'), at('depth', 0.38)],
  [at('you', 0.3), at('you', 0.6)],
  [at('empty'), at('observer2', 0.4)],
  [at('end'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'coffee', at: 0.02, text: '[kahve makinesi fokurduyor]' },
  { seg: 'drop', at: 0.14, text: '[kalem halıya düşer]' },
  { seg: 'wait13', at: 0.3, text: '[duvar saatinin tıkırtısı]' },
  { seg: 'wait13', at: 0.92, text: '[koridorda ayak sesleri]' },
  { seg: 'crash', at: 0.55, text: '[cam kırılır]' },
  { seg: 'hall', at: 0.05, text: '[sunucu fanları]' },
  { seg: 'phone', at: 0.04, text: '[telefon titreşir]' },
  { seg: 'leaving', at: 0.9, text: '[kapı kapanır]' },
]

/** World positions match the set in src/three/tekerrur/. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'stopped-clock',
    title: 'Duran saat',
    seg: 'office',
    from: 0,
    to: 6,
    pos: [0.6, 2.35, 3.96],
    size: 0.35,
    kind: 'anomaly',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Duvar saati 21.13’te durmuştu.', 'Ne zamandır durduğunu kimse hatırlamıyordu.'] },
  },
  {
    id: 'future-query',
    title: 'Bekleyen sorgu',
    seg: 'desk',
    from: 0,
    to: 3,
    pos: [-0.66, 1.1, -0.74],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Kuyrukta bekleyen bir sorgu: FUTURE QUERY · 1.', 'Gönderen yok. Tarih yok.'] },
  },
  {
    id: 'note',
    title: 'Monitördeki not',
    seg: 'coffee',
    from: 0,
    to: 4,
    pos: [0.27, 1.27, -0.84],
    size: 0.15,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Monitörün kenarında sarı bir not: “KAHVE!”', 'Altında daha küçük harflerle: “gerçekten.”'] },
  },
  {
    id: 'report',
    title: 'Doğrulama raporu',
    seg: 'desk',
    from: 0,
    to: 3,
    pos: [-0.34, 0.77, -0.42],
    size: 0.25,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['DURUM · Haftalık doğrulama. Başarı: %99,97.', 'Arif kalan %0,03’ü kurşun kalemle daire içine almış.'] },
  },
  {
    id: 'whiteboard',
    title: 'Tahtadaki soru',
    seg: 'log',
    from: 0,
    to: 6,
    pos: [-1.6, 1.55, 3.96],
    size: 0.8,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['Tahtada silinmeye çalışılmış eski bir yazı:', '“Sorulmamış soru = ölçülmemiş durum?” — S.K., 2029'] },
  },
  {
    id: 'failed',
    title: 'Yanlış çıkan tahmin',
    seg: 'test',
    from: 0,
    to: 2,
    pos: [0.66, 1.1, -0.74],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Kayıtlarda tek bir kırmızı satır: 2 Kasım 2030 · hava · YANLIŞ.', 'Not: “Tahmin yayımlandı.”'] },
  },
  {
    id: 'drawing',
    title: 'Bir çocuk resmi',
    seg: 'selin',
    from: 0,
    to: 6,
    pos: [3.7, 1.22, 0.98],
    size: 0.25,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Yan masanın bölmesine iğnelenmiş bir resim.', '“Annemin işi: bilgisayar uyumasın diye bekliyor.”'] },
  },
  {
    id: 'city',
    title: 'Gece şehir',
    seg: 'chain',
    from: 0,
    to: 2,
    pos: [5.0, 1.7, 0],
    size: 1.6,
    kind: 'environment',
    visibility: 'subtle',
  },
  {
    id: 'observer-input',
    title: 'Gözlemci girdisi',
    seg: 'because',
    from: 0,
    to: 1.2,
    pos: [3.5, 1.1, 1.4],
    size: 0.3,
    kind: 'anomaly',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['OBSERVER INPUT DETECTED', 'Kaynak: bu odada değil.'] },
  },
  {
    id: 'self-model',
    title: 'Öz-model rafı',
    seg: 'hall',
    from: 0,
    to: 3,
    pos: [0.6, 1.95, -7.88],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['ÖZ-MODEL · KATMAN 7', 'Uyarı: kendi soğutmasını hesaplamak için ek soğutma gerekiyor.'] },
  },
  {
    id: 'message',
    title: 'Defne’nin mesajı',
    seg: 'phone',
    from: 0,
    to: 2,
    pos: [0.28, 0.78, -0.32],
    size: 0.15,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['“Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim.”', '22.53’te gönderilmiş. Okundu.'] },
  },
  {
    id: 'same-question',
    title: 'Aynı soru',
    seg: 'count',
    from: 0,
    to: 2,
    pos: [0, 1.2, -0.84],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['“Geleceğimi biliyor musun?”', 'İlk kez 2029’da, bu masadan sorulmuş.'] },
  },
]
