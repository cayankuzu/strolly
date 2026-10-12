/**
 * YAŞAMAK — "En Uzun ve En Kısa Veda". Every word the reader sees.
 *
 * The author's essay, told as one life at one internet-cafe desk. First
 * person ("ben"): the narrator at ten, with an hour on the screen and the
 * price of half an hour in his pocket; the same man decades later, with a
 * dash where the number should be; the people of his life at the other
 * desks, leaving one by one through the door behind him; his mother at the
 * next desk; and a boy who opens his game anyway.
 *
 * Voices: the narrator (essay voice in the present, memories in the past),
 * KEMAL ABİ (the cashier, then and now: few words), EMRE (his friend, at ten
 * and at thirty-four), DEDE, ANNE. No line explains what the image already
 * shows; the essay's sentences carry the thinking, the image carries the life.
 *
 * Choices: the child's last coin (kid:more / kid:home); the same words at the
 * same counter decades later, always refused (ask:half / ask:year / ask:all);
 * and whether he turns to his mother or watches her screen (mom:turn /
 * mom:watch). Gate prompts speak in the narrator's voice; the labels are what
 * the reader tells him to do or say.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

const KEMAL = 'KEMAL ABİ'
const EMRE = 'EMRE'
const BEN = 'BEN'
const DEDE = 'DEDE'
const ANNE = 'ANNE'

const MORE: When = { all: ['kid:more'] }
const HOME: When = { all: ['kid:home'] }
const TURN: When = { all: ['mom:turn'] }
const WATCH: When = { all: ['mom:watch'] }

/** Narration on the rail; several lines arrive one after another. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.45 : undefined,
  ...extra,
})

/** One spoken line: the speaker in the caption, the line on the rail. */
const say = (id: string, seg: SegmentId, from: number, to: number, who: string, line: string, when?: When): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [who], fade: 0.22, when },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.22, when },
]

/** Words on an in-world screen or paper: drawn by the set, mirrored in the DOM only without WebGL. */
const screen = (id: string, seg: SegmentId, from: number, to: number, line: string, extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'top',
  kind: 'system',
  purpose: 'system',
  world: true,
  lines: [line],
  ...extra,
})

export const TEXT: T[] = [
  // 01 — NEFES
  { id: 'dying', seg: 'open', from: -1, to: 0.92, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Ölmek üzereyim.'], sub: 'SCROLL' },
  tell('anxiety', 'neck', 0.03, 0.44, ['Ölüm anksiyetesi. Her geçen gün ölüyor olduğum gerçeği, artık görmezden gelebileceğim bir düşünce değil.']),
  tell('breath', 'neck', 0.48, 0.99, ['Ölümün nefesini her an ensemde hissetmek, bu duyguyla yaşamaya alışmaya çalışmak insanı yıpratıyor.', 'En azından beni çok yordu.'], { purpose: 'mood', stagger: 0.55 }),

  // 02 — ÇOCUK
  tell('cafe', 'recess', 0.04, 0.5, ['Küçük bir çocukken internet kafeye oyun oynamaya giderdim.', 'Okul çıkışı, çantam sırtımda, koşa koşa.']),
  tell('one-step', 'recess', 0.54, 0.98, ['En yakın arkadaşım Emre hep bir adım arkamdaydı; tezgâha ilk ben varırdım.'], { purpose: 'foreshadow' }),
  ...say('how-long', 'coins', 0.03, 0.39, KEMAL, '— Kaç saat, delikanlı?'),
  tell('price', 'coins', 0.43, 0.98, ['Bir saat bir lira, yarım saat elli kuruştu.', 'Bunu çarpım tablosundan önce öğrenmiştim.'], { purpose: 'foreshadow' }),
  screen('admin-hour', 'coins', 0.55, 1.0, 'MASA 4 · 1 SAAT'),
  screen('sixty', 'play', 0.0, 0.3, 'KALAN SÜRE · 60:00'),
  tell('knew', 'play', 0.04, 0.5, ['Süremin elbet biteceğini bilirdim.', 'Yine de oyunu büyük bir heyecanla açar, o anın tadını çıkarırdım.']),
  tell('no-panic', 'play', 0.54, 0.98, ['Süre bitecek diye anksiyete krizleri geçirmez, elim ayağıma dolaşmazdı.', 'Köşedeki sayıya arada bir bakardım, o kadar.']),
  screen('expired', 'zero', 0.2, 1.0, 'SÜRENİZ DOLMUŞTUR', { kind: 'alert' }),
  ...say('almost', 'zero', 0.22, 0.6, EMRE, '— Tam da yenecektim!'),
  tell('best-part', 'zero', 0.62, 0.99, ['Oyun hep en güzel yerinde biterdi.'], { purpose: 'mood' }),
  tell('last-coin', 'pocket', 0.05, 0.56, ['Cebimde son elli kuruş kalmıştı.'], { purpose: 'turn' }),
  screen('extra', 'dusk', 0.0, 0.3, 'KALAN SÜRE · 30:00', { when: MORE }),
  tell('more', 'dusk', 0.03, 0.33, ['Yarım saat daha oynadım. Sonra annem kapıda belirdi.'], { when: MORE }),
  tell('home', 'dusk', 0.03, 0.33, ['Dışarıda sokak lambaları yanmıştı. Annem kapıda bekliyordu.'], { when: HOME }),
  ...say('dinner', 'dusk', 0.36, 0.65, ANNE, '— Yemek soğuyor, hadi.'),
  tell('tomorrow', 'dusk', 0.68, 0.98, ['Süre biterdi; ertesi gün yine başlardı.'], { purpose: 'turn' }),

  // 03 — SÜRE
  tell('years-home', 'years', 0.05, 0.95, ['Aradan yıllar geçti. Masa aynı masaydı.', 'Yarına sakladığım elli kuruş hâlâ masanın çatlağındaydı.'], { when: HOME }),
  tell('years-more', 'years', 0.05, 0.95, ['Aradan yıllar geçti. Masa aynı masaydı.', 'Bütün yarım saatlerimi burada harcamıştım; hiçbirine acımadım.'], { when: MORE }),
  tell('soul', 'soul', 0.05, 0.95, ['Şimdi ruhum, seksen doksan yıllık bir bilgisayar masasına oturmuş o son oyunu oynuyor gibi.'], { purpose: 'reveal', strong: true }),
  screen('no-time', 'dash', 0.02, 1.0, 'KALAN SÜRE · —'),
  tell('a-line', 'dash', 0.03, 0.46, ['Köşede bir sayı olması gerekirdi. Bir çizgi vardı.']),
  tell('uncertainty', 'dash', 0.5, 0.97, ['Hayat ile o oyunun ayrıştığı yer tam da burası: belirsizlik.'], { purpose: 'turn', strong: true }),
  tell('child-knows', 'wallet', 0.05, 0.95, ['Bir çocuk, süreyi uzatmak için ne kadar paraya ihtiyacı olduğunu bilir.', 'Ben hâlâ bildiğimi sanıyordum.']),
  ...say('how-much', 'counter', 0.03, 0.38, KEMAL, '— Kaç saat?'),
  screen('no-extension', 'counter', 0.48, 1.0, 'SÜRE UZATMA YOKTUR'),
  tell('no-chance', 'counter', 0.53, 0.97, ['Bizim ise süreyi uzatma şansımız yok, bedeli ne olursa olsun.'], { purpose: 'reveal', strong: true }),

  // 04 — ÖLÜMCÜL HASTALIK
  tell('room', 'look', 0.04, 0.96, ['Masama dönerken salona ilk kez gerçekten baktım. Masalarda hayatımın insanları oturuyordu.', 'Dedem, babam, Emre, annem; tanımadığım, sonra tanıyacağım yüzler.'], { purpose: 'turn', stagger: 0.5 }),
  tell('same-line', 'dashes', 0.05, 0.95, ['Herkesin ekranının köşesinde aynı çizgi vardı.', 'Kimse kendi süresini göremiyordu; başkasınınkini de.']),
  tell('door-again', 'bell', 0.05, 0.95, ['Arkamdaki kapı her açıldığında ensemde aynı soğuk.', 'Gelen de açıyordu o kapıyı, giden de.'], { purpose: 'mood' }),
  { id: 'disease', seg: 'disease', from: 0.04, to: 0.47, slot: 'center', kind: 'reveal', purpose: 'reveal', strong: true, lines: ['“Yaşamak” adlı ölümcül bir hastalığa yakalandım.'] },
  { id: 'all-of-us', seg: 'disease', from: 0.52, to: 0.98, slot: 'center', kind: 'reveal', purpose: 'reveal', strong: true, lines: ['Ölmek üzereyim.', 'Hepimiz öyleyiz.'], stagger: 0.4 },

  // 05 — BİRER BİRER
  tell('ignored', 'bulmaz', 0.03, 0.45, ['Eskiden görmezden gelirdim. “Beni bulmaz” derdim.']),
  tell('understood', 'bulmaz', 0.49, 0.97, ['O son duygusunun gerçekliğini, yakınlarımı birer birer kaybetmeye başladığımda anladım.'], { purpose: 'turn' }),
  screen('grandpa-screen', 'grandpa', 0.04, 0.5, 'SÜRENİZ DOLMUŞTUR', { kind: 'alert' }),
  tell('grandpa-first', 'grandpa', 0.03, 0.5, ['İlk giden dedem oldu. Ekranındaki yazıyı okudu, başını salladı; şaşırmadı bile.']),
  ...say('take-care', 'grandpa', 0.54, 0.94, DEDE, '— Annene iyi bak.'),
  ...say('saturday', 'friend', 0.02, 0.36, EMRE, '— Cumartesi maç var. Geliyorsun, değil mi?'),
  ...say('ill-come', 'friend', 0.39, 0.73, BEN, '— Gelirim. Bu sefer ben yenerim.'),
  screen('friend-screen', 'friend', 0.75, 1.0, 'SÜRENİZ DOLMUŞTUR', { kind: 'alert' }),
  tell('thirty-four', 'lighter', 0.03, 0.44, ['Emre otuz dört yaşındaydı.', 'Hep bir adım arkamdan gelirdi; bu sefer benden önce gitti.'], { purpose: 'mood', stagger: 0.4 }),
  tell('vanish', 'lighter', 0.48, 0.98, ['Dün karşımda kanlı canlı duran, sesiyle, nefesiyle var olan biri nasıl olur da bir anda “yok” olabilir?'], { purpose: 'question', strong: true }),
  screen('father-screen', 'father', 0.04, 0.4, 'SÜRENİZ DOLMUŞTUR', { kind: 'alert' }),
  tell('father', 'father', 0.05, 0.95, ['Bir kış gecesi sıra babama geldi. Gözlüğünü katlayıp gömleğinin cebine koydu.', 'Dönüp bana baktı. Hiçbir şey söylemedi; hep öyleydi.']),
  tell('witness', 'witness', 0.03, 0.62, ['Aslında insanı asıl yıkan şey, kendi eylemlerinin veya kararlarının sonuçlarıyla yüzleşmek değil;', 'sevdiklerinin ölümüne şahitlik etmek.'], { purpose: 'turn' }),
  tell('heavier', 'witness', 0.66, 0.98, ['Bu, ölümün kendisinden bile daha ağır bir yük.'], { purpose: 'reveal', strong: true }),

  // 06 — HİÇLİK
  tell('traces', 'traces', 0.04, 0.95, ['Masalarda bıraktıkları duruyordu: dedemin kasketi, Emre’nin çakmağı.', 'Sandalyeleri hâlâ sıcaktı.'], { purpose: 'mood' }),
  screen('high-scores', 'scores', 0.02, 1.0, 'EN YÜKSEK SKORLAR · 1. EMRE · 48.200'),
  tell('top-score', 'scores', 0.03, 0.37, ['Skor tablosunda Emre’nin adı hâlâ en üstteydi.']),
  tell('cannot-vanish', 'scores', 0.41, 0.98, ['Var olduğum için asla tamamen “yok” olamayacağımı biliyorum;', 'çünkü eğer gerçekten yok olursam, aslında hiç var olmamışım demektir.'], { purpose: 'turn' }),
  { id: 'illusion', seg: 'illusion', from: 0.04, to: 0.5, slot: 'center', kind: 'reveal', purpose: 'reveal', strong: true, lines: ['Varlığın olduğu yerde yokluk, ancak bir algı yanılmasıdır.'] },
  tell('most-nights', 'illusion', 0.54, 0.98, ['Olmuş bir şey, olmamış olamaz. Bu bana yetiyordu; çoğu gece.'], { purpose: 'foreshadow' }),

  // 07 — VEDA
  tell('still-worry', 'mother', 0.05, 0.95, ['Yine de endişem kendi sonumdan ziyade, sevdiklerimin gidişiyle ilgili.', 'Annem sağımdaki masadaydı. Kucağında yarım bir atkı vardı.'], { purpose: 'turn' }),
  tell('flicker', 'dims', 0.04, 0.58, ['Ekranı arada bir kararıyor, sonra geri geliyordu.', 'Doktorun söylediklerinden aklımda tek kelime kalmıştı: ölümcül.'], { purpose: 'foreshadow' }),
  ...say('tap', 'dims', 0.62, 0.97, ANNE, '— Eski bunlar. Vurunca düzeliyor.'),
  tell('for-whom-half', 'turn', 0.04, 0.58, ['O gün Kemal Abi’den yarım saat daha istemiştim.', 'Kiminle geçirmek istediğimi şimdi biliyordum.'], { when: { all: ['ask:half'] }, purpose: 'reveal' }),
  tell('for-whom-year', 'turn', 0.04, 0.58, ['O gün Kemal Abi’den bir yıl daha istemiştim.', 'Kiminle geçirmek istediğimi şimdi biliyordum.'], { when: { all: ['ask:year'] }, purpose: 'reveal' }),
  tell('for-whom-all', 'turn', 0.04, 0.58, ['O gün Kemal Abi’ye her şeyimi vermeye razıydım.', 'Kimin için olduğunu şimdi biliyordum.'], { when: { all: ['ask:all'] }, purpose: 'reveal' }),
  ...say('which-key', 'together', 0.03, 0.44, ANNE, '— Hangisine basıyordum ben?', TURN),
  tell('laughed', 'together', 0.48, 0.97, ['Güldü. Ekranının köşesine bir kez bile bakmadım.'], { when: TURN, purpose: 'mood' }),
  tell('missed', 'together', 0.03, 0.48, ['Yanımda bir şeye güldü. Ben hâlâ o köşeye bakıyordum.'], { when: WATCH, purpose: 'turn' }),
  tell('turned-anyway', 'together', 0.52, 0.97, ['Baktığımda gülüşü bitmişti. Yine de sandalyemi ona döndürdüm.'], { when: WATCH, purpose: 'mood' }),
  tell('longest', 'days', 0.05, 0.95, ['Atkı her gün birkaç sıra uzuyordu.', 'Veda da her sabah yeniden başlıyordu. En uzun veda buydu.'], { purpose: 'reveal', strong: true }),
  screen('mother-screen', 'instant', 0.04, 0.62, 'SÜRENİZ DOLMUŞTUR', { kind: 'alert' }),
  ...say('dont-be-cold', 'instant', 0.27, 0.6, ANNE, '— Üşüme.'),
  tell('shortest', 'instant', 0.64, 0.98, ['Sonra bir anda bitti. En kısa veda da buydu.'], { purpose: 'reveal', strong: true }),

  // 08 — İNADINA
  tell('scarf-turn', 'spring', 0.05, 0.95, ['Bir bahar öğleden sonrası kapı yine açıldı. Ensemde o soğuk.', 'Boynumda annemin atkısı vardı; aklımda gülüşü.'], { when: TURN, purpose: 'mood' }),
  tell('scarf-watch', 'spring', 0.05, 0.95, ['Bir bahar öğleden sonrası kapı yine açıldı. Ensemde o soğuk.', 'Boynumda annemin atkısı vardı; aklımda gülüşünün yarısı.'], { when: WATCH, purpose: 'mood' }),
  screen('boy-sixty', 'newboy', 0.3, 1.0, 'KALAN SÜRE · 60:00'),
  tell('joy', 'newboy', 0.05, 0.95, ['Yan masaya bir çocuk oturdu, çantasını sırtından çıkarmadan.', 'Süresinin elbet biteceğini biliyordu. Yine de oyununu büyük bir heyecanla açtı.']),
  tell('own-game', 'defiance', 0.03, 0.38, ['Benim köşemde hâlâ o çizgi vardı. Gözümü ondan çektim; oyunumu açtım.'], { purpose: 'turn' }),
  tell('defiance', 'defiance', 0.42, 0.99, ['Ölümcül bir hastalığa yakalanmış biriyle yaşamak, o veda anına hazırlanmak değil;', 'her anı o sonun gölgesinde ama o sonun inadına yaşamaktır.'], { purpose: 'reveal', strong: true }),
  { id: 'end', seg: 'final', from: 0.18, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['YAŞAMAK'], sub: 'En uzun ve en kısa veda.', fade: 0.4 },
]

/** The last coin; the same words at the same counter, never accepted; and his mother. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'coin',
    seg: 'pocket',
    at: 0.66,
    style: 'choice',
    title: 'ELLİ KURUŞ',
    prompt: 'Süre doldu. Avucumda son elli kuruş.',
    options: [
      { id: 'more', label: 'Yarım saat daha.', reply: ['Elli kuruşu tezgâha bıraktım.', 'Kemal Abi bir tuşa bastı: 30:00.'], sets: ['kid:more'] },
      { id: 'home', label: 'Eve dön.', reply: ['Elli kuruşu masanın çatlağına sıkıştırdım.', 'Yarına.'], sets: ['kid:home'] },
    ],
  },
  {
    // Every answer is the same answer. The first option is the child's own words; the contrast with the coin is the story.
    id: 'extend',
    seg: 'counter',
    at: 0.44,
    style: 'choice',
    title: 'KASA',
    prompt: 'Cüzdanım tezgâhta. Kemal Abi bekliyor.',
    options: [
      { id: 'half', label: 'Yarım saat daha.', speaker: KEMAL, reply: ['Süre uzatılmıyor.'], sets: ['ask:half'] },
      { id: 'year', label: 'Bir yıl daha.', speaker: KEMAL, reply: ['Süre uzatılmıyor.'], sets: ['ask:year'] },
      { id: 'all', label: 'Ne istersen öderim.', speaker: KEMAL, reply: ['Mesele para değil, evlat.', 'Süre uzatılmıyor.'], sets: ['ask:all'] },
    ],
  },
  {
    id: 'mother',
    seg: 'turn',
    at: 0.66,
    style: 'choice',
    title: 'ANNE',
    prompt: 'Ekranı yine karardı. Annem örgüsüne döndü.',
    options: [
      { id: 'turn', label: 'Ona dön.', reply: ['Sandalyemi ona çevirdim.'], sets: ['mom:turn'] },
      { id: 'watch', label: 'Ekranını izle.', reply: ['Gözüm ekranının köşesinde kaldı.'], sets: ['mom:watch'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  breath:
    'Gece. Karanlık bir internet kafede tek bir ekran yanıyor; önünde ben oturuyorum. Ölmek üzereyim. Ölüm anksiyetesi: her geçen gün ölüyor olduğum gerçeği, artık görmezden gelebileceğim bir düşünce değil. Arkamdaki kapı kendiliğinden açılıyor, zil çalıyor, içeri soğuk doluyor; elim enseme gidiyor ama dönüp bakmıyorum. Ölümün nefesini her an ensemde hissetmek, bu duyguyla yaşamaya alışmaya çalışmak insanı yıpratıyor. En azından beni çok yordu.',
  child:
    'Küçük bir çocukken internet kafeye oyun oynamaya giderdim. Okul çıkışı, çantam sırtımda, koşa koşa. En yakın arkadaşım Emre hep bir adım arkamdaydı; tezgâha ilk ben varırdım. Bozuklukları tezgâha dökerdim, Kemal Abi sorardı: “Kaç saat, delikanlı?” Bir saat bir lira, yarım saat elli kuruştu; bunu çarpım tablosundan önce öğrenmiştim. Dördüncü masadaki ekranın köşesinde süre başlardı: 60:00, 59:59… Süremin elbet biteceğini bilirdim; yine de oyunu büyük bir heyecanla açar, o anın tadını çıkarırdım. Süre bitecek diye anksiyete krizleri geçirmez, elim ayağıma dolaşmazdı. Köşedeki sayıya arada bir bakardım, o kadar. Sayı sıfıra inince ekran kilitlenirdi: SÜRENİZ DOLMUŞTUR. Emre kollarını iki yana açardı: “Tam da yenecektim!” Oyun hep en güzel yerinde biterdi. O gün cebimde son elli kuruş kalmıştı. Burada okur seçer. “Yarım saat daha” derse: elli kuruşu tezgâha bıraktım, Kemal Abi bir tuşa bastı, yarım saat daha oynadım; süre bittiğinde annem kapıda belirdi. “Eve dön” derse: elli kuruşu yarına diye masanın çatlağına sıkıştırdım; dışarı çıktığımda sokak lambaları yanmıştı, annem kapıda bekliyordu. Elini uzattı: “Yemek soğuyor, hadi.” Süre biterdi; ertesi gün yine başlardı.',
  time:
    'Aradan yıllar geçti; camın ardında mevsimler döndü durdu. Masa aynı masaydı. Elli kuruşu sakladıysam hâlâ masanın çatlağındaydı; harcadıysam, bütün yarım saatlerimi burada harcamıştım ve hiçbirine acımadım. Şimdi ruhum, seksen doksan yıllık bir bilgisayar masasına oturmuş o son oyunu oynuyor gibi. Ekranın köşesinde bir sayı olması gerekirdi; bir çizgi vardı: KALAN SÜRE —. Hayat ile o oyunun ayrıştığı yer tam da burası: belirsizlik. Bir çocuk, süreyi uzatmak için ne kadar paraya ihtiyacı olduğunu bilir. Ben hâlâ bildiğimi sanıyordum. Cüzdanımı alıp tezgâha gittim. Saçları ağarmış Kemal Abi gözlüğünün üstünden bakıp yıllar önceki soruyu sordu: “Kaç saat?” Burada okur bir bedel söyler: yarım saat daha, bir yıl daha ya da ne isterse. Cevap hep aynıdır: “Süre uzatılmıyor.” Bütün paramı tezgâha döktüysem Kemal Abi onları toplayıp geri itti: “Mesele para değil, evlat.” Sonra iki parmağıyla tezgâha bantlı, sararmış bir kâğıda vurdu: SÜRE UZATMA YOKTUR. Bizim ise süreyi uzatma şansımız yok, bedeli ne olursa olsun.',
  illness:
    'Masama dönerken salona ilk kez gerçekten baktım. Masalarda hayatımın insanları oturuyordu: dedem, babam, Emre, annem; tanımadığım, sonra tanıyacağım yüzler. Herkesin ekranının köşesinde aynı çizgi vardı. Kimse kendi süresini göremiyordu; başkasınınkini de. Arkamdaki kapı açıldı, zil çaldı; genç bir çift, bebek arabasıyla içeri girdi. Kapı her açıldığında ensemde aynı soğuk. Gelen de açıyordu o kapıyı, giden de. “Yaşamak” adlı ölümcül bir hastalığa yakalandım. Ölmek üzereyim. Hepimiz öyleyiz.',
  oneByOne:
    'Eskiden görmezden gelirdim; “Beni bulmaz” derdim. O son duygusunun gerçekliğini, yakınlarımı birer birer kaybetmeye başladığımda anladım. İlk giden dedem oldu. Bir kış günü ekranında SÜRENİZ DOLMUŞTUR yazısı belirdi; okudu, başını salladı, şaşırmadı bile. Paltosunu giydi, giderken elini omzuma koydu: “Annene iyi bak.” Kasketi masada kaldı. Bir yaz akşamı Emre, çakmağının kapağını açıp kapatarak sordu: “Cumartesi maç var. Geliyorsun, değil mi?” “Gelirim. Bu sefer ben yenerim.” Gülerken ekranı karardı. Bana baktı, çakmağı masaya bıraktı, kalktı, arkasına bakmadan gitti. Emre otuz dört yaşındaydı. Hep bir adım arkamdan gelirdi; bu sefer benden önce gitti. Çakmağını bir kez çaktım. Dün karşımda kanlı canlı duran, sesiyle, nefesiyle var olan biri nasıl olur da bir anda “yok” olabilir? Bir kış gecesi sıra babama geldi. Gözlüğünü katlayıp gömleğinin cebine koydu. Dönüp bana baktı. Hiçbir şey söylemedi; hep öyleydi. Aslında insanı asıl yıkan şey, kendi eylemlerinin veya kararlarının sonuçlarıyla yüzleşmek değil; sevdiklerinin ölümüne şahitlik etmek. Bu, ölümün kendisinden bile daha ağır bir yük.',
  nothing:
    'Dışarıda kar yağıyordu. Masalarda bıraktıkları duruyordu: dedemin kasketi, Emre’nin çakmağı. Sandalyeleri hâlâ sıcaktı. Emre’nin masasına oturup ekranını uyandırdım; skor tablosunda adı hâlâ en üstteydi. Var olduğum için asla tamamen “yok” olamayacağımı biliyorum; çünkü eğer gerçekten yok olursam, aslında hiç var olmamışım demektir. Varlığın olduğu yerde yokluk, ancak bir algı yanılmasıdır. Olmuş bir şey, olmamış olamaz. Bu bana yetiyordu; çoğu gece.',
  farewell:
    'Yine de endişem kendi sonumdan ziyade, sevdiklerimin gidişiyle ilgili. Annem sağımdaki masadaydı; kucağında yarım bir atkı vardı. Ekranı arada bir kararıyor, sonra geri geliyordu. Doktorun söylediklerinden aklımda tek kelime kalmıştı: ölümcül. Annem monitörün kenarına iki kez vurdu: “Eski bunlar. Vurunca düzeliyor.” O gün Kemal Abi’den ne istediysem, kiminle geçirmek istediğimi şimdi biliyordum. Ekranı yine karardı; annem örgüsüne döndü. Burada okur seçer. “Ona dön” derse: sandalyemi ona çevirdim, birlikte oynadık; tuşları karıştırıp “Hangisine basıyordum ben?” diye sordu ve güldü. Ekranının köşesine bir kez bile bakmadım. “Ekranını izle” derse: gözüm ekranının köşesinde kaldı; yanımda bir şeye güldü, ben hâlâ o köşeye bakıyordum. Baktığımda gülüşü bitmişti. Yine de sandalyemi ona döndürdüm. Atkı her gün birkaç sıra uzuyordu. Veda da her sabah yeniden başlıyordu; en uzun veda buydu. Bir sabah ekranında o yazı belirdi. Bana döndü, yarım atkıyı şişleriyle birlikte boynuma doladı: “Üşüme.” Kalktı, saçıma bir kez dokundu, kapıdan çıktı. Sonra bir anda bitti. En kısa veda da buydu.',
  defiance:
    'Bir bahar öğleden sonrası kapı yine açıldı; ensemde o soğuk. Boynumda annemin atkısı vardı; aklımda gülüşü, ya da gülüşünün yarısı. Kapıdan bir çocuk koşarak girdi, bozukluklarını tezgâha döktü ve çantasını sırtından çıkarmadan yan masaya oturdu. Ekranının köşesinde 60:00 vardı. Süresinin elbet biteceğini biliyordu. Yine de oyununu büyük bir heyecanla açtı. Benim köşemde hâlâ o çizgi vardı. Gözümü ondan çektim; oyunumu açtım. Çocuk ekranıma doğru eğildi, sandalyemi ona çevirdim; yan yana oynadık, güldük. Ölümcül bir hastalığa yakalanmış biriyle yaşamak, o veda anına hazırlanmak değil; her anı o sonun gölgesinde ama o sonun inadına yaşamaktır. YAŞAMAK. En uzun ve en kısa veda.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('neck', 0.04)],
  [at('disease'), at('disease', 1)],
  [at('friend', 0.74), at('lighter', 0.03)],
  [at('instant', 0.04), at('instant', 0.62)],
  [at('final'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.1, text: '[gece; tek bir monitörün vızıltısı, dışarıda rüzgâr]' },
  { seg: 'neck', at: 0.44, text: '[arkada kapı açılır, zil çalar]' },
  { seg: 'neck', at: 0.5, text: '[içeri soğuk bir rüzgâr dolar]' },
  { seg: 'recess', at: 0.05, text: '[kapı zili; koşan ayak sesleri]' },
  { seg: 'recess', at: 0.62, text: '[bir el tezgâha vurur; iki çocuk güler]' },
  { seg: 'coins', at: 0.06, text: '[bozuk paralar tezgâha dökülür]' },
  { seg: 'coins', at: 0.58, text: '[kasada tuşlara basılır]' },
  { seg: 'play', at: 0.12, text: '[oturum açılış sesi]' },
  { seg: 'play', at: 0.45, text: '[klavyeler, oyun sesleri, iki çocuğun kahkahası]' },
  { seg: 'zero', at: 0.18, text: '[kısa bir uyarı sesi; ekran kilitlenir]' },
  { seg: 'dusk', at: 0.02, text: '[bozukluk tezgâha bırakılır]', when: MORE },
  { seg: 'dusk', at: 0.3, text: '[uyarı sesi; kapı zili]', when: MORE },
  { seg: 'dusk', at: 0.05, text: '[akşam; sokak sesleri]', when: HOME },
  { seg: 'dusk', at: 0.3, text: '[kapı zili]', when: HOME },
  { seg: 'dusk', at: 0.64, text: '[kapı kapanır; zil titrer]' },
  { seg: 'years', at: 0.08, text: '[yağmur, rüzgâr, kar, ağustos böcekleri; art arda, hızla]' },
  { seg: 'soul', at: 0.1, text: '[duvar saatinin tıkırtısı]' },
  { seg: 'counter', at: 0.02, text: '[cüzdan tezgâha bırakılır]' },
  { seg: 'counter', at: 0.48, text: '[parmak uçları kâğıda iki kez vurur]' },
  { seg: 'look', at: 0.1, text: '[salonun uğultusu; klavyeler]' },
  { seg: 'bell', at: 0.08, text: '[kapı zili; bebek arabasının tekerlekleri]' },
  { seg: 'bell', at: 0.3, text: '[bir bebek mırıldanır]' },
  { seg: 'disease', at: 0.5, text: '[uğultu çekilir; saat ve tek, uzun bir piyano notası]' },
  { seg: 'bulmaz', at: 0.08, text: '[çakmağın kapağı; gülüşmeler]' },
  { seg: 'grandpa', at: 0.06, text: '[kısa bir uyarı sesi]' },
  { seg: 'grandpa', at: 0.3, text: '[geri itilen sandalye]' },
  { seg: 'grandpa', at: 0.95, text: '[kapı zili; içeri kar savrulur]' },
  { seg: 'friend', at: 0.05, text: '[çakmağın kapağı açılıp kapanır]' },
  { seg: 'friend', at: 0.75, text: '[kısa bir uyarı sesi; salon susar]' },
  { seg: 'friend', at: 0.97, text: '[uzakta kapı zili]' },
  { seg: 'lighter', at: 0.6, text: '[çakmak bir kez çakar]' },
  { seg: 'father', at: 0.06, text: '[kısa bir uyarı sesi]' },
  { seg: 'father', at: 0.92, text: '[kapı kapanır; dışarıda kar]' },
  { seg: 'witness', at: 0.1, text: '[yalnızca duvar saati]' },
  { seg: 'scores', at: 0.05, text: '[ekran uyanır]' },
  { seg: 'illusion', at: 0.1, text: '[kar sessizliği; seyrek bir piyano]' },
  { seg: 'mother', at: 0.08, text: '[örgü şişlerinin tıkırtısı]' },
  { seg: 'dims', at: 0.1, text: '[monitör cızırdar]' },
  { seg: 'dims', at: 0.6, text: '[monitörün kenarına iki hafif vuruş]' },
  { seg: 'together', at: 0.4, text: '[ikisinin kahkahası]', when: TURN },
  { seg: 'together', at: 0.1, text: '[yanında bir kahkaha]', when: WATCH },
  { seg: 'days', at: 0.1, text: '[şişlerin tıkırtısı, günler boyu]' },
  { seg: 'instant', at: 0.04, text: '[kısa bir uyarı sesi]' },
  { seg: 'instant', at: 0.62, text: '[kapı zili; içeri soğuk dolar]' },
  { seg: 'spring', at: 0.05, text: '[kapı zili; dışarıda kuş sesleri]' },
  { seg: 'spring', at: 0.4, text: '[bozuk paralar tezgâha dökülür]' },
  { seg: 'newboy', at: 0.3, text: '[oturum açılış sesi]' },
  { seg: 'newboy', at: 0.5, text: '[çocuğun sevinç çığlığı]' },
  { seg: 'defiance', at: 0.45, text: '[iki klavye; gülüşmeler]' },
  { seg: 'final', at: 0.3, text: '[kafenin uğultusu; duvar saati]' },
]

/** World positions match the cafe set (docs/stories/yasamak.md, "World layout"). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'prices',
    title: 'Fiyat listesi',
    seg: 'coins',
    from: 0,
    to: 1,
    pos: [-3.5, 2.25, 4.94],
    size: 0.9,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['1 SAAT · 1 LİRA — YARIM SAAT · 50 KURUŞ — ÇAY · 25 KURUŞ', 'Altına kurşun kalemle eklenmiş: “Okul saatinde çocuk alınmaz.”'] },
  },
  {
    id: 'saved-coin',
    title: 'Masadaki elli kuruş',
    seg: 'years',
    from: 0,
    to: 1.9,
    pos: [0.4, 0.765, 0.2],
    size: 0.15,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Masanın çatlağına sıkışmış eski bir elli kuruş.', 'Yarına saklanmış bir yarım saat.'] },
  },
  {
    id: 'seasons',
    title: 'Penceredeki mevsimler',
    seg: 'years',
    from: 0,
    to: 1,
    pos: [0, 1.7, -5.0],
    size: 3.0,
    kind: 'environment',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Camın ardında çınar yaprak döktü, kar tuttu, yeniden yeşerdi.', 'Kaç kez, saymadım.'] },
  },
  {
    id: 'wall-clock',
    title: 'Duvar saati',
    seg: 'soul',
    from: 0,
    to: 2.4,
    pos: [0, 2.3, 4.93],
    size: 0.6,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Duvar saati hiç durmadı.', 'Kimse onu kurmadı da.'] },
  },
  {
    id: 'note',
    title: 'Tezgâhtaki not',
    seg: 'counter',
    from: 0,
    to: 1,
    pos: [-3.0, 1.06, 3.7],
    size: 0.3,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['Sararmış bir kâğıt, dört köşesinden tezgâha bantlı: SÜRE UZATMA YOKTUR.', 'Eskiden duvarda fiyat listesi asılıydı. Artık hiçbir yerde fiyat yazmıyor.'] },
  },
  {
    id: 'admin-screen',
    title: 'Kasadaki ekran',
    seg: 'look',
    from: 0,
    to: 1.74,
    pos: [-4.3, 1.3, 4.0],
    size: 0.4,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['Kasanın ekranında bütün masalar alt alta: MASA 1’den MASA 13’e.', 'Kalan süre sütunu bomboş. Kemal Abi de bilmiyor.'] },
  },
  {
    id: 'lighter',
    title: 'Emre’nin çakmağı',
    seg: 'lighter',
    from: 0,
    to: 1,
    pos: [-0.5, 0.775, -0.05],
    size: 0.15,
    kind: 'object',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Sigarayı on yıl önce bırakmıştı; çakmağı bırakamamıştı.', 'Bir kez çaktım. Yandı.'] },
  },
  {
    id: 'cap',
    title: 'Dedemin kasketi',
    seg: 'traces',
    from: 0,
    to: 1,
    pos: [-1.2, 0.8, -2.2],
    size: 0.3,
    kind: 'object',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['İçinde soluk bir terzi etiketi: “Sivas, 1971.”', 'Astarın altına bir tavla zarı sıkışmış. Hep cebinde taşırdı.'] },
  },
  {
    id: 'high-scores',
    title: 'Skor tablosu',
    seg: 'scores',
    from: 0,
    to: 1,
    pos: [-0.75, 1.0, -0.22],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['EN YÜKSEK SKORLAR — 1. EMRE · 48.200 — 2. ARİF · 47.950', 'Altında, sunucuda kayıtlı bir oyun: HASAN · TAVLA · 5–3. Dedem öndeymiş.'] },
  },
  {
    id: 'knitting',
    title: 'Annemin örgüsü',
    seg: 'mother',
    from: 0,
    to: 2.3,
    pos: [2.25, 0.62, 0.3],
    size: 0.3,
    kind: 'object',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Kiremit rengi yarım bir atkı; şişler hâlâ ilmeklerde.', 'Ucuna iğnelenmiş kâğıtta annemin el yazısı: “120 sıra.” Altına saydıklarını yazmış; sonuncusu 84.'] },
  },
]
