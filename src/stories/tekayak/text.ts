/**
 * TEK AYAK — every word the reader sees.
 *
 * Third person, close to the class: first beside the teacher at the board,
 * then under the desks with the three, then back with the teacher, and at
 * the end with Eren. Light, observant, a little funny until the laugh; then
 * still. The reader is one of the class (the only choice: where your eyes
 * go when the teacher asks), and the text never names the wheelchair before
 * `still` — "kalktılar" is the author's own misdirection, kept on purpose.
 *
 * Voices: ÖĞRETMEN (a tired fifty-something science teacher; dry, then
 * sharp), SALİM İLE İBRAHİM (one whisper).
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

/** Narration on the rail; two lines arrive one after another. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.5 : undefined,
  ...extra,
})

/** A spoken line: the speaker in the caption, the words on the rail. */
const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string, extra: Partial<T> = {}): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.22, when: extra.when },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.22, ...extra },
]

const TEACHER = 'ÖĞRETMEN'

const LOOKED_DESK: When = { all: ['look:desk'] }
const LOOKED_SOMEONE: When = { none: ['look:desk'] }

export const TEXT: T[] = [
  // 01 — DERS
  { id: 'friday', seg: 'open', from: -1, to: 0.92, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Cuma, son ders.', 'Zile yirmi sekiz dakika var.'], sub: 'SCROLL' },
  tell('back', 'board', 0.03, 0.42, ['Öğretmen, sırtı sınıfa dönük hâlde tahtada dersini anlatıyordu.']),
  ...say('law', 'board', 0.46, 0.98, TEACHER, '— Dengelenmiş kuvvetlerin etkisindeki bir cisim, duruyorsa durmaya devam eder.'),
  tell('light', 'light', 0.03, 0.98, ['Ekim güneşi yüksek pencerelerden içeri uzanıyor, tebeşir tozu ışığın içinde ağır ağır dönüyordu.', 'Öğretmen bu cümleyi otuz yıldır, her güz, aynı yatık harflerle yazıyordu.'], { purpose: 'mood' }),
  tell('quiet', 'rows', 0.06, 0.98, ['Sınıf her zamanki gibi sessiz görünüyordu.', 'Bütün başlar defterlere eğilmişti; arka köşedeki üçü, biraz fazla.'], { purpose: 'foreshadow', strong: true }),

  // 02 — UÇAK
  tell('below', 'under', 0.03, 0.42, ['Sıraların üstünde fen dersi işleniyordu; altında ise havacılık.'], { purpose: 'turn' }),
  tell('trio', 'under', 0.45, 0.98, ['Arka sıralarda Salim, Eren ve İbrahim oturuyordu.', 'Üçü bir araya geldi mi, bir şey olurdu.']),
  tell('folding', 'fold', 0.04, 0.98, ['Uçağı Salim katlıyordu: önce ortadan, sonra köşeleri, en son kanatları.', 'Karnede bunun dersi yoktu; olsaydı, Salim okul birincisi olurdu.']),
  tell('write', 'pass', 0.04, 0.98, ['Uçak arkaya, Eren’e geçti. Eren keçeli kalemin kapağını dişleriyle açıp kanada bir şeyler yazdı.', 'Gülmemeye çalıştığı için harfler biraz kaydı.']),
  tell('aim', 'aim', 0.06, 0.98, ['Sonra İbrahim’e. İbrahim bir gözünü kapattı; pist, sıraların arasındaki koridordu.']),
  tell('until', 'whisper', 0.06, 0.98, ['Sınıf hâlâ sessiz görünüyordu;', 'ta ki öğretmenin kulağına fısıltılar ve bastırılmaya çalışılan gülüşmeler gelene kadar.'], { purpose: 'turn', stagger: 0.4 }),
  tell('hit', 'flight', 0.43, 1.02, ['Tam o anda, kafasına kâğıttan yapılmış bir uçak çarptı.'], { purpose: 'turn', strong: true }),

  // 03 — SESSİZLİK
  tell('anger', 'anger', 0.04, 0.98, ['İçinde bir öfke kabardı.', 'Bu işin Salim, Eren ve İbrahim’den başkası olamayacağını biliyordu.'], { stagger: 0.45 }),
  tell('turned', 'turn', 0.03, 0.46, ['Sert bir hareketle arkasını döndü.']),
  ...say('who', 'turn', 0.5, 0.98, TEACHER, '— Bunu kim attı?', { strong: true }),
  tell('hush', 'hush', 0.03, 0.45, ['Sınıfta derin bir sessizlik oldu; duvar saatinin tıkırtısı bile duyuluyordu.'], { purpose: 'mood' }),
  // — the glance (choice "glance" holds at hush 0.51) —
  tell('glance-salim', 'hush', 0.56, 0.99, ['Öğretmenin gözleri, senin baktığın yere, Salim’e kaydı. Salim tavanı incelemeyi sürdürdü.'], { when: { all: ['look:salim'] } }),
  tell('glance-ibrahim', 'hush', 0.56, 0.99, ['Öğretmenin gözleri, senin baktığın yere, İbrahim’e kaydı. Kulakları bir ton daha kızardı.'], { when: { all: ['look:ibrahim'] } }),
  tell('glance-eren', 'hush', 0.56, 0.99, ['Öğretmenin gözleri, senin baktığın yere, Eren’e kaydı. Bir an öylece bakıştılar.'], { when: { all: ['look:eren'] } }),
  tell('glance-desk', 'hush', 0.56, 0.99, ['Öğretmenin senin bakışına ihtiyacı yoktu; gözü zaten arka köşedeydi.'], { when: LOOKED_DESK }),
  tell('smoothed', 'smooth', 0.04, 0.47, ['Öğretmen, yere düşen kâğıdı aldı, dikkatlice düzeltti.']),
  tell('airline', 'smooth', 0.5, 0.98, ['Uçağın yan tarafında özensiz harflerle “S.E.I Havayolları” yazıyordu.']),
  tell('quiz', 'tip', 0.04, 0.97, ['Uçak, geçen haftaki sınavın kâğıtlarından biriydi.', 'Ucunda, kendi kırmızı kalemiyle yazdığı 100 ve “Aferin” duruyordu.'], { purpose: 'turn' }),
  tell('mock', 'mock', 0.04, 0.97, ['Ucuna bakarken ağzından öfke dolu sözler dökülüyordu.', '“Eren… sen de mi bunlara katıldın? Aferin oğlum,” dedi, alayla karışık bir tonla.'], { purpose: 'dialogue', stagger: 0.42 }),
  ...say('summon', 'summon', 0.06, 0.98, TEACHER, '— Üçünüz de tahtaya gelin.'),

  // 04 — CEZA
  tell('rose', 'rise', 0.04, 0.98, ['Salim, Eren ve İbrahim başlarını öne eğerek kalktılar.', 'Öğretmen onlara bakmadı bile; gözü hâlâ elindeki uçaktaydı.']),
  ...say('corner', 'order', 0.06, 0.98, TEACHER, '— Çöp köşesinde, ayakta duracaksınız. Hemen oraya.'),
  tell('walked', 'walk', 0.06, 0.98, ['Üçü de sırayla çöpün yanına geçip dizildi.']),
  ...say('oneFoot', 'lineUp', 0.06, 0.98, TEACHER, '— Bir ayağınızı kaldırın. Tek ayak, zil çalana kadar.'),
  tell('first', 'lift', 0.04, 0.62, ['Önce Salim ayağını yerden kaldırdı,', 'sonra İbrahim…']),
  tell('looked', 'reveal', 0.08, 0.98, ['Bir an sonra hepsi Eren’e baktı.', 'Sen de.'], { purpose: 'reveal', strong: true, stagger: 0.55, when: LOOKED_SOMEONE }),
  tell('looked-desk', 'reveal', 0.08, 0.98, ['Bir an sonra hepsi Eren’e baktı.', 'Bu kez sen de.'], { purpose: 'reveal', strong: true, stagger: 0.55, when: LOOKED_DESK }),

  // 05 — SAHNE
  ...say('escaped', 'burst', 0.04, 0.44, 'SALİM İLE İBRAHİM, FISILTIYLA', '— Cezadan yırttı piç!'),
  tell('laugh', 'burst', 0.47, 0.98, ['Ardından bastıramadıkları bir kahkaha patladı.', 'Önce ikisinden, sonra bütün sınıftan.'], { purpose: 'turn' }),
  tell('whom', 'laughs', 0.06, 0.98, ['Kime güldüklerini kimse tam bilmiyordu: öğretmene mi, cezaya mı, Eren’e mi?'], { purpose: 'mood' }),
  tell('still', 'still', 0.04, 0.5, ['Eren ise tekerlekli sandalyesinde sessizce duruyor, olan biteni izliyordu.'], { purpose: 'reveal', strong: true }),
  tell('face', 'still', 0.53, 0.98, ['Yüzünde ne bir şaşkınlık ne de bir üzüntü vardı.']),
  tell('nothing', 'flow', 0.04, 0.98, ['Hayatında hiçbir şey değişmemişti;', 'sınıfta olup bitenler, onun için sadece akıp giden bir sahneden ibaretti.'], { purpose: 'reveal', strong: true, stagger: 0.42 }),
  { id: 'end', seg: 'end', from: 0.64, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['TEK AYAK'], sub: 'Sadece akıp giden bir sahne.', fade: 0.4 },
]

/** One glance. It changes a line and the picture, never the outcome: he already knows. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'glance',
    seg: 'hush',
    at: 0.51,
    style: 'choice',
    title: 'BUNU KİM ATTI?',
    prompt: 'Sen de o sıralardan birindesin. Gözlerin nereye kaçıyor?',
    options: [
      { id: 'salim', label: 'Salim’e.', reply: ['Salim tavandaki su lekesine bakıyordu.', 'Onu hayatında ilk kez görüyormuş gibi.'], sets: ['look:salim'] },
      { id: 'ibrahim', label: 'İbrahim’e.', reply: ['İbrahim’in kulakları kıpkırmızıydı.', 'Kulakları her zaman ondan önce itiraf ederdi.'], sets: ['look:ibrahim'] },
      { id: 'eren', label: 'Eren’e.', reply: ['Eren başını kaldırmış, öğretmene bakıyordu.', 'Sınıfta gözünü kaçırmayan tek kişi oydu.'], sets: ['look:eren'] },
      { id: 'desk', label: 'Önüne.', reply: ['Sırana baktın: pergel ucuyla kazınmış eski bir kalp.', 'Kimseyi ele vermedin.'], sets: ['look:desk'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  lesson:
    'Cuma, son ders. Zile yirmi sekiz dakika vardı. Öğretmen, sırtı sınıfa dönük hâlde tahtada dersini anlatıyordu. Tahtanın sol üst köşesinde “Kuvvet ve Hareket” yazıyordu. “Dengelenmiş kuvvetlerin etkisindeki bir cisim, duruyorsa durmaya devam eder,” dedi ve cümleyi tahtanın sağ yarısına yazdı. Ekim güneşi yüksek pencerelerden içeri uzanıyor, tebeşir tozu ışığın içinde ağır ağır dönüyordu. Öğretmen bu cümleyi otuz yıldır, her güz, aynı yatık harflerle yazıyordu. Duvar saati 15.12’yi gösteriyordu. Sınıf her zamanki gibi sessiz görünüyordu. Bütün başlar defterlere eğilmişti; arka köşedeki üçü, biraz fazla.',
  plane:
    'Sıraların üstünde fen dersi işleniyordu; altında ise havacılık. Arka sıralarda Salim, Eren ve İbrahim oturuyordu; üçü bir araya geldi mi, bir şey olurdu. Uçağı Salim katlıyordu: sıranın altında, kenarında kırmızı mürekkep olan bir kâğıdı önce ortadan katladı, sonra köşelerini, en son kanatlarını. Karnede bunun dersi yoktu; olsaydı, Salim okul birincisi olurdu. Uçak arkaya, Eren’e geçti. Eren keçeli kalemin kapağını dişleriyle açıp kanada bir şeyler yazdı; gülmemeye çalıştığı için harfler biraz kaydı. Sonra uçak İbrahim’e geçti. İbrahim bir gözünü kapattı; pist, sıraların arasındaki koridordu. Sınıf hâlâ sessiz görünüyordu; ta ki öğretmenin kulağına fısıltılar ve bastırılmaya çalışılan gülüşmeler gelene kadar. Tebeşir, harfin ortasında durdu. Tam o anda, kafasına kâğıttan yapılmış bir uçak çarptı ve ayağının dibine düştü.',
  silence:
    'İçinde bir öfke kabardı; tebeşir parmaklarının arasında kırıldı. Bu işin Salim, Eren ve İbrahim’den başkası olamayacağını biliyordu. Sert bir hareketle arkasını döndü. “Bunu kim attı?” diye haykırdı. Sınıfta derin bir sessizlik oldu; duvar saatinin tıkırtısı bile duyuluyordu. Sen de o sıralardan birindeydin ve gözlerin bir yere kaçtı. Salim’e baktıysan: Salim tavandaki su lekesine, onu hayatında ilk kez görüyormuş gibi bakıyordu; öğretmenin gözleri, senin baktığın yere, Salim’e kaydı, Salim ise tavanı incelemeyi sürdürdü. İbrahim’e baktıysan: İbrahim’in kulakları kıpkırmızıydı, çünkü kulakları her zaman ondan önce itiraf ederdi; öğretmenin gözleri İbrahim’e kaydı ve kulaklar bir ton daha kızardı. Eren’e baktıysan: Eren başını kaldırmış, öğretmene bakıyordu, sınıfta gözünü kaçırmayan tek kişi oydu; öğretmenin gözleri Eren’e kaydı ve bir an öylece bakıştılar. Önüne baktıysan: sıranda pergel ucuyla kazınmış eski bir kalp vardı; kimseyi ele vermedin, ama öğretmenin senin bakışına ihtiyacı yoktu, gözü zaten arka köşedeydi. Öğretmen, yere düşen kâğıdı aldı, dikkatlice düzeltti. Uçağın yan tarafında özensiz harflerle “S.E.I Havayolları” yazıyordu. Uçak, geçen haftaki sınavın kâğıtlarından biriydi; ucunda, kendi kırmızı kalemiyle yazdığı 100 ve “Aferin” duruyordu. Ucuna bakarken ağzından öfke dolu sözler dökülüyordu. “Eren… sen de mi bunlara katıldın? Aferin oğlum,” dedi, alayla karışık bir tonla. Sonra uçağı avucuna vurdu ve sertçe ekledi: “Üçünüz de tahtaya gelin.”',
  punishment:
    'Salim, Eren ve İbrahim başlarını öne eğerek kalktılar. Öğretmen onlara bakmadı bile; gözü hâlâ elindeki uçaktaydı. Uçağı bir işaret çubuğu gibi kaldırıp tahtanın yanındaki köşeyi gösterdi: “Çöp köşesinde, ayakta duracaksınız. Hemen oraya.” Bütün başlar onları izlerken üçü de sırayla çöpün yanına geçip dizildi. “Bir ayağınızı kaldırın. Tek ayak, zil çalana kadar.” Önce Salim ayağını yerden kaldırdı, sonra İbrahim… Bir an sonra hepsi Eren’e baktı. Sen de; az önce önüne bakmış olsan bile, bu kez sen de.',
  scene:
    '“Cezadan yırttı piç!” dediler fısıltıyla Salim ile İbrahim; ardından bastıramadıkları bir kahkaha patladı, önce ikisinden, sonra bütün sınıftan. Kime güldüklerini kimse tam bilmiyordu: öğretmene mi, cezaya mı, Eren’e mi? Öğretmen gözlüğünü çıkarıp burnunun üstünü sıktı. Eren ise tekerlekli sandalyesinde sessizce duruyor, olan biteni izliyordu. Yüzünde ne bir şaşkınlık ne de bir üzüntü vardı. Hayatında hiçbir şey değişmemişti; sınıfta olup bitenler, onun için sadece akıp giden bir sahneden ibaretti. Etrafında dakikalar akıp gitti: kahkaha dindi, öğretmen tahtaya döndü, Salim ile İbrahim defalarca ayak değiştirdi, güneş sıraların üstünden kayıp sonunda köşeye, Eren’in üstüne düştü. Saat 15.40’ta zil çaldı ve herkes aynı anda kalktı. Eren, ışığın içinde, olduğu gibi kaldı.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('board', 0.03)],
  [at('flight'), at('flight', 0.44)],
  [at('lift', 0.62), at('reveal', 0.08)],
  [at('still'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.15, text: '[tebeşir tahtada gıcırdar]' },
  { seg: 'light', at: 0.6, text: '[duvar saatinin tıkırtısı]' },
  { seg: 'rows', at: 0.2, text: '[kalemler kâğıtta hışırdar]' },
  { seg: 'under', at: 0.5, text: '[kâğıt katlanır]' },
  { seg: 'pass', at: 0.12, text: '[kalem kapağı çıt diye açılır]' },
  { seg: 'aim', at: 0.3, text: '[bastırılmış kıkırtılar]' },
  { seg: 'whisper', at: 0.12, text: '[fısıltılar]' },
  { seg: 'whisper', at: 0.4, text: '[tebeşirin sesi kesilir]' },
  { seg: 'flight', at: 0.44, text: '[kâğıt uçak kafaya çarpar]' },
  { seg: 'flight', at: 0.62, text: '[uçak yere düşer]' },
  { seg: 'anger', at: 0.32, text: '[tebeşir kırılır]' },
  { seg: 'turn', at: 0.52, text: '[öğretmen bağırır]' },
  { seg: 'hush', at: 0.1, text: '[duvar saatinin tıkırtısı]' },
  { seg: 'smooth', at: 0.3, text: '[kâğıt hışırdar]' },
  { seg: 'mock', at: 0.08, text: '[öfkeli mırıltılar]' },
  { seg: 'summon', at: 0.1, text: '[uçak avuca vurulur]' },
  { seg: 'rise', at: 0.06, text: '[sandalyeler geri itilir]' },
  { seg: 'rise', at: 0.3, text: '[linolyumda lastik gıcırtısı]' },
  { seg: 'walk', at: 0.15, text: '[adım sesleri]' },
  { seg: 'lift', at: 0.38, text: '[bir el duvara çarpar]' },
  { seg: 'lift', at: 0.66, text: '[sessizlik]' },
  { seg: 'burst', at: 0.04, text: '[fısıltı]' },
  { seg: 'burst', at: 0.47, text: '[kahkaha patlar]' },
  { seg: 'laughs', at: 0.1, text: '[bir el sıraya vurur, kahkahalar]' },
  { seg: 'flow', at: 0.3, text: '[kahkaha uzaklaşır, uğultuya döner]' },
  { seg: 'flow', at: 0.5, text: '[saatin tıkırtısı hızlanır]' },
  { seg: 'end', at: 0.6, text: '[okul zili çalar]' },
]

/** World positions match the set in docs/stories/tekayak.md (classroom at the origin). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'teacher-desk',
    title: 'Öğretmenin masası',
    seg: 'board',
    from: 0,
    to: 2.625,
    pos: [-2.5, 0.8, -2.45],
    size: 0.7,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Bir termos çay, kırmızı bir tükenmez, ders defteri.', 'Defterin ilk sayfasında, kurşun kalemle: “31. yıl. Son yıl?”'] },
  },
  {
    id: 'ramp',
    title: 'Eşikteki rampa',
    seg: 'light',
    from: 0,
    to: 1.77,
    pos: [3.9, 0.03, -2.1],
    size: 0.6,
    kind: 'environment',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Kapı eşiğine vidalanmış alçak, alüminyum bir rampa.', 'Kenarları, her gün aynı yerden geçilmekten parlamıştı.'] },
  },
  {
    id: 'ceiling-stain',
    title: 'Tavandaki leke',
    seg: 'turn',
    from: 0,
    to: 3.66,
    pos: [2.0, 3.19, 0.6],
    size: 0.7,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Tavanda, Afrika’ya benzeyen bir su lekesi.', 'Zor bir soru sorulduğunda sınıfın yarısı ona bakardı.'] },
  },
  {
    id: 'carved-heart',
    title: 'Sıradaki kalp',
    seg: 'hush',
    from: 0,
    to: 1,
    pos: [0.42, 0.73, -0.05],
    size: 0.2,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Pergel ucuyla kazınmış bir kalp ve bir tarih: 2011.', 'Bu sırada senden önce on beş kişi oturmuştu. Hepsi gelip geçmiş, kalp kalmıştı.'] },
  },
  {
    id: 'no-dot',
    title: 'Noktasız İ',
    seg: 'smooth',
    from: 0.45,
    to: 1.79,
    pos: [0.72, 1.27, -2.83],
    size: 0.15,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['“S.E.I Havayolları.”', 'İbrahim’in İ’sinin noktası unutulmuştu. İbrahim bunu bütün hafta sonu dert edecekti.'] },
  },
  {
    id: 'fleet',
    title: 'Uçak No. 1',
    seg: 'reveal',
    from: 0,
    to: 7.39,
    pos: [2.14, 0.52, -3.09],
    size: 0.25,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Tekerlekli sandalyenin yan panelinde, keçeli kalemle çizilmiş iki kanat.', 'Altında, Eren’in düzgün harfleriyle: “S.E.I · Uçak No. 1”.'] },
  },
  {
    id: 'board-law',
    title: 'Tahtadaki cümle',
    seg: 'still',
    from: 0,
    to: 2.46,
    pos: [1.0, 1.45, -3.46],
    size: 1.2,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['“Dengelenmiş kuvvetlerin etkisindeki bir cisim, duruyorsa durmaya devam eder.”', 'Altında, daha küçük: “Hareket ediyorsa, aynı süratle hareketine devam eder.”'] },
  },
]
