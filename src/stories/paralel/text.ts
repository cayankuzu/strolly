/**
 * PARALEL-LEŞ — every word the reader sees.
 *
 * The author's prose poem is the narration; it is kept nearly verbatim and
 * in its order. A man on a swing at the edge of a cliff remembers a
 * childhood spent on the line between him and death: roofs, glass, a
 * bridge, stones, the sea, a bicycle, a hollow slope, a socket. In every
 * vignette the image splits at the critical instant and a translucent other
 * self goes on into the fall — the universes where it happened. Then the
 * friends, the room where the "almost"s are kept, and the swing, now.
 *
 * Voice: first person, habitual past for the childhood ("-ırdım"), present
 * tense on the swing. Short declaratives; the image does the rest.
 * Set contract (positions, timing, the split): docs/stories/paralel.md.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

/** Narration on the rail; a second line arrives partway through the item's span. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.42 : undefined,
  ...extra,
})

/** A spoken line: the speaker in the caption, the words on the rail. */
const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.24 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.24 },
]

/** The small age tag above the first line of a vignette (9 → 12 → 15, and now). */
const age = (id: string, seg: SegmentId, from: number, to: number, label: string): T => ({ id, seg, from, to, slot: 'caption', kind: 'year', purpose: 'context', lines: [label] })

const SWING: When = { all: ['swing:on'] }
const STOP: When = { all: ['swing:stop'] }

export const TEXT: T[] = [
  // 01 — ÇİZGİ · the void, a nearly transparent line, a can with wings
  { id: 'carcasses', seg: 'open', from: -1, to: 0.86, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Paralel evrenlerde çok leşim vardır.'], sub: 'SCROLL' },
  tell('transparent', 'line', 0.04, 0.54, ['Çocukken ölümle aramda ince değil, neredeyse şeffaf bir çizgi vardı.', 'O çizginin üzerinde yürümeyi seviyordum.'], { purpose: 'mood' }),
  tell('courage', 'line', 0.57, 1.04, ['Dengemi değil, cesaretimi test ediyordum sanki.', 'Kollarımı açmazdım; ellerim cebimde yürürdüm.']),
  tell('sponsor', 'can', 0.06, 0.64, ['Tanrı hayatıma sponsor olmuş bir enerji içeceği markası gibiydi;', 'etiketinde “kanatlandırır” yazıyordu, ben de gerçekten uçabileceğime inanıyordum.'], { stagger: 0.38 }),
  { id: 'label', seg: 'can', from: 0.08, to: 0.64, slot: 'top', kind: 'word', purpose: 'context', world: true, lines: ['KANATLANDIRIR'] },
  tell('only-the-can', 'can', 0.68, 1.1, ['Kutuyu bitirir, boşluğa bırakırdım.', 'Düşen sadece kutuydu.'], { purpose: 'foreshadow', stagger: 0.48 }),

  // 02 — ÇATILAR · nine years old, gravel, a gap of four steps, the street far below
  age('age-roofs', 'roofs', 0.2, 1.02, '9 YAŞ'),
  tell('giants', 'roofs', 0.2, 1.02, ['Devasa binaların çatılarında dolaşırdım.', 'Ayakkabımın tabanı çakıllara sürtünür, rüzgâr kulaklarımı doldururdu.']),
  tell('steps', 'gap', 0.03, 0.55, ['İki çatının arası dört adımdı; saymıştım.', 'Karşı çatı bir metre aşağıdaydı. Dizlerim bunu bilirdi.']),
  // The second line arrives with the cut to the street (down ≈ 0.04).
  tell('look-down', 'gap', 0.58, 1.404, ['Bir çatıdan diğerine atlamadan önce aşağı bakardım:', 'arabalar kibrit kutusu kadar küçük, insanlar nokta, hayat ise sessizdi.'], { stagger: 0.55 }),
  tell('short-sound', 'down', 0.55, 1.04, ['O an, düşersem sadece kısa bir ses olacağımı bilirdim.'], { strong: true, purpose: 'foreshadow' }),
  tell('then', 'jump', 0.04, 0.48, ['Sonra on adım geri çekilir, koşar ve atlardım.']),
  tell('this-universe', 'jump', 0.62, 1.06, ['Karşı çatıya inerdim. Bu evrende, her seferinde.'], { purpose: 'turn' }),

  // 03 — CAM · panes, floors, rooms; the glass hums; one pane gives
  tell('glass-walk', 'glass', 0.1, 1.02, ['Cam çatılarda yürürdüm.', 'Çelik çerçevelere basmam gerekirdi; ben camın tam ortasına basardım.']),
  tell('below', 'rooms', 0.04, 0.44, ['Altımda boşluk, altımda katlar, altımda bilmediğim odalar.'], { purpose: 'mood' }),
  tell('nobody-up', 'rooms', 0.48, 1.04, ['Biri çamaşır katlar, biri televizyonun karşısında uyuklardı.', 'Kimse yukarı bakmazdı.']),
  tell('tremble', 'crack', 0.04, 0.5, ['Camın hafif titreşimini hissederdim.', 'Aşağıda bir kapı kapansa, ayaklarımın altında duyardım.']),
  tell('chosen', 'crack', 0.54, 1.04, ['Bir çatlak çıksa, ağırlığım biraz artsa,', 'yerçekimi beni seçerdi.'], { strong: true, purpose: 'turn' }),

  // 04 — KÖPRÜ · twelve; wet iron over a river in flood
  age('age-bridge', 'river', 0.12, 1.04, '12 YAŞ'),
  tell('under-bridge', 'river', 0.12, 1.04, ['Altından yüksek debili bir nehir geçen köprünün altına tırmanırdım.']),
  tell('cold', 'beams', 0.06, 1.0, ['Demir kirişler ıslak ve soğuktu.', 'Perçinler avucuma batar, pas tırnaklarımın arasına dolardı.']),
  tell('roar', 'slip', 0.06, 0.6, ['Üstümden bir kamyon geçse bütün köprü titrerdi.', 'Parmaklarım kayarken suyun uğultusu kulaklarımı doldururdu.']),
  tell('never-back', 'slip', 0.64, 1.06, ['Ellerim gevşese, su beni bir daha geri getirmezdi.'], { strong: true, purpose: 'turn' }),

  // 05 — TAŞLAR · a hilltop, a ravine, a stopwatch
  tell('hills', 'cliff', 0.1, 1.04, ['Yüksek tepelere tırmanır,', 'uçurumların kenarında taşları aşağı atardım.']),
  // The stone leaves the hand at 0.22 (line 2 lands on the beep); it touches bottom at 0.76 (line 2 of 'seconds').
  tell('measured', 'stone', 0.04, 0.56, ['Taşların düşüşünü izlerdim. Ne kadar sürdüğünü ölçerdim.', 'Taşı bırakır bırakmaz kolumdaki saatin düğmesine basardım.']),
  { id: 'stopwatch', seg: 'stone', from: 0.76, to: 1.0, slot: 'top', kind: 'machine', purpose: 'context', world: true, lines: ['00:04.6'] },
  tell('seconds', 'stone', 0.6, 1.04, ['Dört saniye, bazen beş.', 'Sonra çok aşağıdan küçücük bir tık.']),
  tell('rehearsal', 'rehearsal', 0.12, 1.05, ['Kendi düşüşümün provasını yapar gibi.'], { strong: true, purpose: 'turn' }),

  // 06 — DALGA · a storm beach, a wall of water, dark green, which way is up
  tell('bad-weather', 'flag', 0.1, 1.02, ['Kötü havalarda denize girerdim.', 'Rip akıntısı uyarıları vardı. Bayrak rüzgârda yırtılacak gibi çırpınırdı.']),
  { id: 'rip-sign', seg: 'flag', from: 0.1, to: 1.0, slot: 'top', kind: 'alert', purpose: 'context', world: true, lines: ['DİKKAT · RİP AKINTISI · YÜZMEK YASAKTIR'] },
  tell('swallow', 'waves', 0.06, 1.0, ['Dalgalar gövdemi yutacak kadar büyüktü.', 'Kaçmazdım; dalganın tam altına dalardım.']),
  tell('nothingness', 'under', 0.1, 0.9, ['Bir dalga altında yönümü kaybettiğim o birkaç saniye,', 'gerçekten hiçliğe en yakın olduğum anlardı.'], { purpose: 'mood' }),
  tell('guess-up', 'up', 0.06, 1.02, ['Göğsüm yanar, ciğerim su ister,', 'yukarıyı tahmin ederek yüzeye çıkardım.'], { purpose: 'turn', stagger: 0.55 }),

  // 07 — TOPRAK · fifteen; a bicycle over a cleft, a slope that is hollow underneath
  age('age-bike', 'bike', 0.1, 1.04, '15 YAŞ'),
  tell('bike', 'bike', 0.1, 1.04, ['Bisikletle uçurumlardan atlardım.', 'Rampaya yaklaşırken frene hiç dokunmazdım.']),
  tell('hang', 'air', 0.06, 0.48, ['Havada asılı kaldığım o kısa an…'], { purpose: 'mood' }),
  tell('widen', 'air', 0.52, 1.06, ['Zaman genişlerdi.', 'Toprak yaklaşırdı.'], { purpose: 'turn' }),
  tell('hollow', 'slope', 0.1, 1.04, ['Çökmek üzere olan, dağın yamacında altı boş zeminlerde yürürdüm.']),
  tell('loosen', 'bargain', 0.03, 0.46, ['Ayağımın altındaki toprağın gevşediğini hissederdim.', 'Kenarlardan çakıllar karanlığa dökülürdü.']),
  // The split is at 0.5 (on the hollow patch); the ground gives under the other me at 0.62.
  tell('bargain', 'bargain', 0.5, 1.06, ['Sanki yer benimle pazarlık yapıyordu.', 'Bir adım daha, diyordu. Sonra bir adım daha.'], { strong: true, purpose: 'turn' }),

  // 08 — KIVILCIM · nine again; a bedroom at night, a hairpin, the fuse
  age('age-spark', 'socket', 0.12, 1.04, '9 YAŞ'),
  tell('hairpins', 'socket', 0.12, 1.04, ['Prizlere tel toka sokardım.', 'Tokaları annemin tarağının yanından alırdım.']),
  tell('the-sound', 'spark', 0.28, 1.04, ['Kıvılcımın çıkardığı sesi severdim.', 'Elektriğin görünmezliğini görünür kılmak hoşuma giderdi.'], { purpose: 'mood' }),
  ...say('fuse', 'normal', 0.05, 0.31, 'ANNE', '— Yine mi sigorta attı?'),
  tell('dunno', 'normal', 0.34, 0.63, ['Bilmem, derdim. Kararmış toka dizimin altında olurdu.']),
  tell('not-normal', 'normal', 0.66, 1.06, ['Ve tüm bunlar, o yaş için normal değildi.', 'Sadece ben öyleymiş gibi davrandım.'], { strong: true, purpose: 'turn' }),

  // 09 — BAZI EVRENLERDE · the friends on the parapet; a man on a path; five absences
  age('age-friends', 'friends', 0.14, 1.02, '12 YAŞ'),
  tell('dragged', 'friends', 0.14, 1.02, ['Yanımda sürüklediğim arkadaşlarım da vardı.', 'Emre arkamdan gelirdi, Barış onun arkasından.']),
  ...say('emre', 'chain', 0.03, 0.39, 'EMRE', '— Sen geçersen ben de geçerim.'),
  tell('took-them', 'chain', 0.42, 1.04, ['Onları da o ince çizgiye götürdüm.', 'Birimiz düşse, hepimiz düşerdik.']),
  tell('we-fell', 'fell', 0.26, 1.08, ['Belki bazı evrenlerde düştük.'], { strong: true, purpose: 'reveal' }),
  age('age-today', 'today', 0.06, 0.45, 'ŞİMDİ'),
  tell('grew-up', 'today', 0.06, 0.45, ['Bu evrende büyüdük.', 'Emre’yle Barış o çizgiden çoktan indiler.'], { stagger: 0.38 }),
  tell('hundreds', 'today', 0.49, 1.02, ['Şimdi düşünüyorum da,', 'şu ana kadar yüzlerce kez ölmüş olmam gerekirdi.'], { purpose: 'turn' }),
  tell('u-glass', 'glassBroke', 0.06, 0.98, ['Bir evrende cam kırıldı.'], { purpose: 'reveal' }),
  tell('u-iron', 'ironSlipped', 0.04, 0.98, ['Bir evrende parmaklarım demirden sıyrıldı.'], { purpose: 'reveal' }),
  tell('u-wave', 'waveKept', 0.04, 0.98, ['Bir evrende dalga beni geri vermedi.'], { purpose: 'reveal' }),
  tell('u-earth', 'earthFell', 0.04, 0.98, ['Bir evrende toprak çöktü.'], { purpose: 'reveal' }),
  tell('u-power', 'powerKept', 0.04, 1.0, ['Bir evrende elektrik affetmedi.'], { purpose: 'reveal', strong: true }),

  // 10 — ODA · the bodies, the shelves, the child with wings of shadow, the empty slot
  tell('corpses', 'bodies', 0.06, 0.6, ['O evrenlerde cesetlerim vardır.', 'Farklı yaşlarda, farklı yüksekliklerde.'], { purpose: 'reveal' }),
  tell('ages', 'bodies', 0.64, 1.04, ['Bazısı 9 yaşında, bazısı 12, bazısı 15.']),
  tell('hell', 'room', 0.04, 0.52, ['Belki cehennemde bana ayrılmış bir oda vardır.', 'Ateş yok. Sadece raflar, etiketler ve toz.'], { purpose: 'mood' }),
  tell('shelves', 'room', 0.56, 1.02, ['Raflara dizilmiş ihtimallerim.', 'Her biri “az kalsın”ın gerçekleşmiş hâli.'], { strong: true }),
  tell('not-bad', 'devil', 0.06, 0.5, ['Kötü bir çocuk değildim.', 'Kimseye bilinçli zarar vermedim.']),
  tell('own-devil', 'devil', 0.54, 1.02, ['Ama kendime karşı merhametli değildim.', 'Kendi şeytanımdım.'], { strong: true, purpose: 'reveal' }),
  tell('exception', 'exception', 0.04, 0.45, ['Belki ben bir istisnayım.'], { purpose: 'turn' }),
  tell('deviation', 'exception', 0.49, 1.03, ['İstatistiğin görmezden geldiği bir hata.', 'Evrenin hesaplayamadığı bir sapma.']),
  { id: 'tag', seg: 'diorama', from: 0.1, to: 1.0, slot: 'top', kind: 'word', purpose: 'foreshadow', world: true, lines: ['ŞU AN · SALINCAK'] },
  tell('even-now', 'diorama', 0.08, 1.02, ['Belki şu an bile başka bir evrende ölmüşümdür.'], { strong: true, purpose: 'foreshadow' }),

  // 11 — ŞU AN · the swing at the edge of the cliff, dusk
  { id: 'really', seg: 'swing', from: 0.12, to: 0.98, slot: 'center', kind: 'reveal', purpose: 'reveal', lines: ['Çünkü gerçekten şu an,', 'uçurumun kenarına kurulmuş bir salıncaktayım.'], stagger: 0.36 },
  tell('over-void', 'feet', 0.06, 1.02, ['Ayaklarım boşluğun üzerinde.', 'Altımda yüzlerce metre derinlik var.']),
  tell('arc', 'arc', 0.04, 1.0, ['Salıncak her geri gidişinde sırtım kayaya yaklaşıyor,', 'her ileri savruluşunda ayaklarım göğe değil, uçuruma uzanıyor.'], { stagger: 0.46 }),
  tell('creak', 'rope', 0.03, 0.5, ['İp gıcırdıyor.', 'Rüzgâr hızlanıyor.']),
  tell('watches', 'rope', 0.54, 1.04, ['Boşluk beni aşağıdan izliyor.'], { strong: true, purpose: 'mood' }),
  tell('higher', 'choose', 0.44, 1.06, ['Her ileri gidişte biraz daha yükseğe çıkıyorum.'], { when: SWING }),
  tell('slower', 'choose', 0.44, 1.06, ['Salıncak yavaşlıyor. Ama durmuyor.'], { when: STOP }),
  tell('grows', 'grows', 0.08, 0.6, ['Sallandıkça boşluk büyüyor.', 'Sallandıkça yerçekimi sabırsızlanıyor.']),
  tell('another-me', 'grows', 0.64, 1.04, ['Sallandıkça başka bir evrende bir ben daha düşüyor.'], { strong: true, purpose: 'reveal' }),
  { id: 'still-here', seg: 'still', from: 0.14, to: 0.96, slot: 'center', kind: 'reveal', purpose: 'reveal', strong: true, lines: ['Ve ben hâlâ buradayım.'] },
  { id: 'end', seg: 'end', from: 0.2, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['PARALEL-LEŞ'], sub: 'Şimdilik…', fade: 0.4 },
]

/** One gate, on the swing: whichever is chosen, the last lines are the same; the image is not. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'swing',
    seg: 'choose',
    at: 0.3,
    style: 'choice',
    title: 'SALINCAK',
    prompt: 'Salıncak en geride, bir an asılı kalıyor.',
    options: [
      { id: 'on', label: 'Sallan.', reply: ['Ayaklarımı ileri atıyorum.', 'Salıncak boşluğa doğru açılıyor.'], sets: ['swing:on'] },
      { id: 'stop', label: 'Dur.', reply: ['Durmak için ayaklarımı yere sürtmem gerekir.', 'Altımda yer yok.'], sets: ['swing:stop'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  line:
    'Alacakaranlıkta, yüzlerce metre aşağıdaki bir vadiye bakıyorum; bakışım bir sarkaç gibi ağır ağır gidip geliyor. Paralel evrenlerde çok leşim vardır. Çocukken ölümle aramda ince değil, neredeyse şeffaf bir çizgi vardı. Karanlıkta camdan bir tel gibi uzanan o çizginin üstünde dokuz yaşında bir çocuk yürüyor; çizginin altında, baş aşağı, saydam bir çocuk onunla aynı adımları atıyor. O çizginin üzerinde yürümeyi seviyordum. Dengemi değil, cesaretimi test ediyordum sanki. Çocuk, dengesini tutan kollarını indirip ellerini cebine sokuyor. Kollarımı açmazdım; ellerim cebimde yürürdüm. Cebinden iki beyaz kanatlı bir içecek kutusu çıkarıyor, açıp içiyor. Tanrı hayatıma sponsor olmuş bir enerji içeceği markası gibiydi; etiketinde “kanatlandırır” yazıyordu, ben de gerçekten uçabileceğime inanıyordum. Kutuyu bitirir, boşluğa bırakırdım. Kutu karanlıkta küçülüp kayboluyor, çarptığı duyulmuyor; çocuk çizginin üstünde kalıyor. Düşen sadece kutuydu.',
  roofs:
    'Dokuz yaşındayım. Devasa binaların çatılarında dolaşırdım. Ayakkabımın tabanı çakıllara sürtünür, rüzgâr kulaklarımı doldururdu. İki çatının arası dört adımdı; saymıştım. Karşı çatı bir metre aşağıdaydı. Dizlerim bunu bilirdi. Bir çatıdan diğerine atlamadan önce aşağı bakardım: arabalar kibrit kutusu kadar küçük, insanlar nokta, hayat ise sessizdi. O an, düşersem sadece kısa bir ses olacağımı bilirdim. Sonra on adım geri çekilir, koşar ve atlardım. Havadayken bir an ikiye ayrılıyorum: saydam bir ben karşı çatıya yetişemiyor, iki binanın arasına düşüyor ve aşağıda solup gidiyor; çok aşağıdan kısa bir ses geliyor. Karşı çatıya inerdim. Bu evrende, her seferinde.',
  glass:
    'Cam çatılarda yürürdüm. Çelik çerçevelere basmam gerekirdi; ben camın tam ortasına basardım. Altımda boşluk, altımda katlar, altımda bilmediğim odalar. Biri çamaşır katlar, biri televizyonun karşısında uyuklardı. Kimse yukarı bakmazdı. Camın hafif titreşimini hissederdim. Aşağıda bir kapı kapansa, ayaklarımın altında duyardım. Bir çatlak çıksa, ağırlığım biraz artsa, yerçekimi beni seçerdi. Yanımdaki camın üstünde öbür ben duruyor: ayağının altında yıldız gibi bir çatlak açılıyor, cam kırılıyor ve o, kırıklarla birlikte katların arasına düşüp soluyor. Ben bir sonraki çelik çerçeveye basıp yürümeye devam ediyorum; arkama bakmıyorum.',
  bridge:
    'On iki yaşındayım. Altından yüksek debili bir nehir geçen köprünün altına tırmanırdım. Kirişin alt kenarına asılı, el üstüne el ilerliyorum; dokuz metre aşağıda çamurlu, köpüklü su akıyor. Demir kirişler ıslak ve soğuktu. Perçinler avucuma batar, pas tırnaklarımın arasına dolardı. Üstümden bir kamyon geçse bütün köprü titrerdi. Parmaklarım kayarken suyun uğultusu kulaklarımı doldururdu. Öbür ben kirişi bırakıyor ve köpüğün içinde kayboluyor; benim elim demiri yeniden kavrıyor. Ellerim gevşese, su beni bir daha geri getirmezdi.',
  stones:
    'Yüksek tepelere tırmanır, uçurumların kenarında taşları aşağı atardım. Taşların düşüşünü izlerdim. Ne kadar sürdüğünü ölçerdim. Taşı bırakır bırakmaz kolumdaki saatin düğmesine basardım. Taş yamaca iki kez çarpıp küçülerek iniyor. Dört saniye, bazen beş. Sonra çok aşağıdan küçücük bir tık. Saat 00:04.6’da duruyor. Taşın düştüğü yeri görmek için kenardan eğiliyorum; öbür ben biraz daha eğiliyor ve sessizce taşın ardından gidiyor. Kendi düşüşümün provasını yapar gibi. Ben geri çekilip yeni bir taş alıyorum.',
  sea:
    'Kötü havalarda denize girerdim. Rip akıntısı uyarıları vardı. Bayrak rüzgârda yırtılacak gibi çırpınırdı. Dalgalar gövdemi yutacak kadar büyüktü. Kaçmazdım; dalganın tam altına dalardım. Bir dalga altında yönümü kaybettiğim o birkaç saniye, gerçekten hiçliğe en yakın olduğum anlardı: koyu yeşil, köpük ve kum; ne yukarı var ne aşağı. Göğsüm yanar, ciğerim su ister, yukarıyı tahmin ederek yüzeye çıkardım. Suyun altında iki ben iki ayrı yön seçiyor: ben soluk bir aydınlığa doğru, öbür ben karanlığa doğru. Ben yüzeye çıkıp derin bir nefes alıyorum; öbürü dönmüyor.',
  earth:
    'On beş yaşındayım. Bisikletle uçurumlardan atlardım. Rampaya yaklaşırken frene hiç dokunmazdım. Havada asılı kaldığım o kısa an… Zaman genişlerdi. Toprak yaklaşırdı. Havada bir ben daha ayrılıyor: bisikletinin ön tekerleği düşüyor ve o, yarığın karanlığına dalıp kayboluyor; ben karşı tarafa, tozun içine iniyorum. Çökmek üzere olan, dağın yamacında altı boş zeminlerde yürürdüm. Ayağımın altındaki toprağın gevşediğini hissederdim. Kenarlardan çakıllar karanlığa dökülürdü. Oyuğun üstündeki ince kabukta öbür ben duruyor; ben yürümeye devam ediyorum. Sanki yer benimle pazarlık yapıyordu. Öbür ben, ayağının altındaki toprakla birlikte boğuk bir sesle çöküyor; ben çoktan kayaya basmışım. Bir adım daha, diyordu. Sonra bir adım daha.',
  spark:
    'Dokuz yaşındayım; gece, odamdayım. Prizlere tel toka sokardım. Tokaları annemin tarağının yanından alırdım. Tokanın iki ucu prizin deliklerine giriyor: mavi-beyaz bir parlama, bir çatırtı; ev kararıyor. Ben geriye savrulup yere oturuyorum; öbür ben prizin önünde diz çökmüş, kıpırdamadan kalıyor ve soluk mavi bir ışık gibi yavaşça sönüyor. Kıvılcımın çıkardığı sesi severdim. Elektriğin görünmezliğini görünür kılmak hoşuma giderdi. Koridordan ayak sesleri geliyor; annem el feneriyle kapıda: “Yine mi sigorta attı?” Bilmem, derdim. Kararmış toka dizimin altında olurdu. Ve tüm bunlar, o yaş için normal değildi. Sadece ben öyleymiş gibi davrandım.',
  universes:
    'On iki yaşındayım. Yanımda sürüklediğim arkadaşlarım da vardı. Emre arkamdan gelirdi, Barış onun arkasından; çatı korkuluğunun üstünde el ele, tek sıra yürürdük. Köşede Emre duraksıyor: “Sen geçersen ben de geçerim.” Onları da o ince çizgiye götürdüm. Birimiz düşse, hepimiz düşerdik. Bizden saydam üç çocuk ayrılıyor; elleri hâlâ birbirine kenetli, korkuluktan sessizce boşluğa devriliyorlar. Belki bazı evrenlerde düştük. Bu evrende büyüdük. Emre’yle Barış o çizgiden çoktan indiler. Akşamüstü, yetişkin bir adam olarak bir dağ yolunu tek başıma tırmanıyorum. Şimdi düşünüyorum da, şu ana kadar yüzlerce kez ölmüş olmam gerekirdi. Bir evrende cam kırıldı: cam çatıda kapkara bir delik, ışıkta asılı kalmış kırıklar. Bir evrende parmaklarım demirden sıyrıldı: boş, ıslak bir kiriş. Bir evrende dalga beni geri vermedi: dümdüz, gri bir deniz. Bir evrende toprak çöktü: patikada yeni bir çukur, yavaşça çöken toz. Bir evrende elektrik affetmedi: karanlık bir oda, kararmış bir priz.',
  room:
    'O evrenlerde cesetlerim vardır. Karanlık, uçsuz bucaksız bir düzlükte saydam çocuklar kaidelerin üstünde, gözleri kapalı duruyor; aralarından geçiyorum. Farklı yaşlarda, farklı yüksekliklerde. Bazısı 9 yaşında, bazısı 12, bazısı 15. Belki cehennemde bana ayrılmış bir oda vardır. Ateş yok. Sadece raflar, etiketler ve toz. Lambalar birer birer yanıyor; rafların arasında yürüyorum. Raflara dizilmiş ihtimallerim: her camlı kutuda küçük, kıpırtısız bir an (kırık camın üstünde bir çocuk, bir dalganın altında bir çocuk, prizin önünde bir çocuk) ve pirinç bir etiket: bir yaş, bir yer. Her biri “az kalsın”ın gerçekleşmiş hâli. Koridorun sonunda, elinde kanatlı kutuyla dokuz yaşındaki ben duruyor ve bana sakin sakin bakıyor. Kötü bir çocuk değildim. Kimseye bilinçli zarar vermedim. Çocuk kollarını yavaşça iki yana açıyor; önündeki lamba, gölgesini arkasındaki raflara kocaman kanatlar gibi düşürüyor. Ama kendime karşı merhametli değildim. Kendi şeytanımdım. Yukarıdan bakınca arşiv ufka kadar uzanan bir ızgara; her gözünde bir ihtimal, yalnızca bir göz karanlık. Belki ben bir istisnayım. İstatistiğin görmezden geldiği bir hata. Evrenin hesaplayamadığı bir sapma. Karanlık gözde yeni bir kutu yanıyor: içinde minicik bir uçurum, bir ağaç ve boş bir salıncak; etiketinde “ŞU AN · SALINCAK” yazıyor, ip hâlâ sallanıyor. Belki şu an bile başka bir evrende ölmüşümdür.',
  now:
    'Çünkü gerçekten şu an, uçurumun kenarına kurulmuş bir salıncaktayım. Yaşlı bir ağacın dalından sarkan iki ip, tahta bir oturak; altımda alacakaranlıkta bir vadi. Ayaklarım boşluğun üzerinde. Altımda yüzlerce metre derinlik var. Salıncak her geri gidişinde sırtım kayaya yaklaşıyor, her ileri savruluşunda ayaklarım göğe değil, uçuruma uzanıyor. İp gıcırdıyor. Rüzgâr hızlanıyor. Boşluk beni aşağıdan izliyor. Salıncak en geride, bir an asılı kalıyor. Sallan ya da dur. Sallanırsam: ayaklarımı ileri atıyorum, salıncak boşluğa doğru açılıyor; her ileri gidişte biraz daha yükseğe çıkıyorum ve her yükselişte saydam bir adam ipi bırakıp vadiye doğru küçülerek kayboluyor. Durursam: durmak için ayaklarımı yere sürtmem gerekir; altımda yer yok. Salıncak yavaşlıyor. Ama durmuyor. Yanımda saydam bir salıncak benim yerime yükseğe savrulmaya devam ediyor; üstündeki adam her yükselişte ipi bırakıyor. Sallandıkça boşluk büyüyor. Sallandıkça yerçekimi sabırsızlanıyor. Sallandıkça başka bir evrende bir ben daha düşüyor. Ve ben hâlâ buradayım. Şimdilik…',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('line', 0.04)],
  [at('down', 0.04), at('down', 0.5)],
  [at('jump', 0.46), at('jump', 0.66)],
  [at('under', 0.02), at('under', 1)],
  [at('spark', 0.16), at('spark', 0.3)],
  [at('fell', 0.04), at('fell', 1)],
  [at('diorama', 0.6), at('swing', 0.12)],
  [at('grows', 0.62), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.1, text: '[çok yüksekte rüzgâr]' },
  { seg: 'open', at: 0.6, text: '[uzakta bir ipin gıcırtısı]' },
  { seg: 'line', at: 0.08, text: '[her adımda ince bir cam çınlaması]' },
  { seg: 'can', at: 0.12, text: '[kutu açılır]' },
  { seg: 'can', at: 0.78, text: '[kutu düşer; çarpma sesi gelmez]' },
  { seg: 'roofs', at: 0.05, text: '[demir kapı açılır; rüzgâr]' },
  { seg: 'roofs', at: 0.3, text: '[ayakkabının altında çakıl]' },
  { seg: 'down', at: 0.06, text: '[şehrin sesi kesilir; yalnızca nefes]' },
  { seg: 'jump', at: 0.3, text: '[çakılda koşan adımlar]' },
  { seg: 'jump', at: 0.52, text: '[ince bir cam çınlaması]' },
  { seg: 'jump', at: 0.58, text: '[çakıla iniş]' },
  { seg: 'jump', at: 0.72, text: '[çok aşağıdan, kısa bir ses]' },
  { seg: 'glass', at: 0.5, text: '[camda boğuk adımlar; ince bir uğultu]' },
  { seg: 'rooms', at: 0.5, text: '[aşağıdan televizyon, çamaşır makinesi, radyo]' },
  { seg: 'crack', at: 0.06, text: '[camın ince uğultusu]' },
  { seg: 'crack', at: 0.22, text: '[aşağıda bir kapı çarpar]' },
  { seg: 'crack', at: 0.56, text: '[cam çatlar]' },
  { seg: 'crack', at: 0.6, text: '[cam kırılır; kırıklar katlar boyunca aşağı şıngırdar]' },
  { seg: 'river', at: 0.05, text: '[taşkın bir nehrin gürültüsü]' },
  { seg: 'beams', at: 0.2, text: '[perçinlerden damlayan su]' },
  { seg: 'slip', at: 0.08, text: '[üstten bir kamyon geçer; köprü titrer]' },
  { seg: 'slip', at: 0.4, text: '[suyun uğultusu yükselir]' },
  { seg: 'slip', at: 0.52, text: '[ince bir cam çınlaması]' },
  { seg: 'cliff', at: 0.1, text: '[kuru otlarda rüzgâr; böcekler]' },
  { seg: 'stone', at: 0.22, text: '[kronometre öter]' },
  { seg: 'stone', at: 0.34, text: '[taş kayalara çarpa çarpa düşer]' },
  { seg: 'stone', at: 0.76, text: '[çok aşağıdan, küçücük bir tık]' },
  { seg: 'rehearsal', at: 0.3, text: '[ince bir cam çınlaması]' },
  { seg: 'flag', at: 0.05, text: '[bayrak rüzgârda çırpınır; dalgaların gümbürtüsü]' },
  { seg: 'waves', at: 0.7, text: '[dalga kırılır]' },
  { seg: 'under', at: 0.04, text: '[boğuk su altı uğultusu; kalp atışı]' },
  { seg: 'up', at: 0.3, text: '[ince bir cam çınlaması]' },
  { seg: 'up', at: 0.78, text: '[yüzeye çıkış; derin bir nefes]' },
  { seg: 'bike', at: 0.1, text: '[pedal ve zincir; lastikler toprakta]' },
  { seg: 'air', at: 0.08, text: '[boşta dönen bir tekerlek]' },
  { seg: 'air', at: 0.5, text: '[ince bir cam çınlaması]' },
  { seg: 'air', at: 0.92, text: '[iniş; toz]' },
  { seg: 'slope', at: 0.2, text: '[ufalanan toprak]' },
  { seg: 'bargain', at: 0.08, text: '[düşen çakıllar]' },
  { seg: 'bargain', at: 0.5, text: '[ince bir cam çınlaması]' },
  { seg: 'bargain', at: 0.62, text: '[toprak çöker; boğuk bir gümleme]' },
  { seg: 'socket', at: 0.05, text: '[koridorda televizyonun sesi]' },
  { seg: 'spark', at: 0.18, text: '[kıvılcımın çatırtısı]' },
  { seg: 'spark', at: 0.22, text: '[elektrik kesilir; ev susar]' },
  { seg: 'normal', at: 0.02, text: '[koridorda ayak sesleri]' },
  { seg: 'normal', at: 0.05, text: '[el fenerinin düğmesi]' },
  { seg: 'friends', at: 0.08, text: '[çocuk kahkahaları; rüzgâr]' },
  { seg: 'fell', at: 0.08, text: '[ince bir cam çınlaması, sonra sessizlik]' },
  { seg: 'today', at: 0.08, text: '[rüzgârda otlar]' },
  { seg: 'glassBroke', at: 0.08, text: '[havada asılı kırıkların çınlaması]' },
  { seg: 'ironSlipped', at: 0.08, text: '[kirişten suya düşen bir damla]' },
  { seg: 'waveKept', at: 0.08, text: '[dalgasız bir denizin hışırtısı]' },
  { seg: 'earthFell', at: 0.08, text: '[çöken tozun hışırtısı]' },
  { seg: 'powerKept', at: 0.08, text: '[bir cızırtı, sonra sessizlik]' },
  { seg: 'bodies', at: 0.04, text: '[sessizlik; derinden tek bir ton]' },
  { seg: 'room', at: 0.1, text: '[lambalar birer birer yanar]' },
  { seg: 'room', at: 0.4, text: '[eski parke gıcırdar]' },
  { seg: 'devil', at: 0.08, text: '[çıplak bir ampulün vızıltısı]' },
  { seg: 'exception', at: 0.3, text: '[ses açılır; uçsuz bucaksız bir boşluk]' },
  { seg: 'diorama', at: 0.1, text: '[küçücük bir gıcırtı; içeri sızan rüzgâr]' },
  { seg: 'swing', at: 0.04, text: '[ip gıcırdar; rüzgâr]' },
  { seg: 'rope', at: 0.04, text: '[ip gıcırdar, daha yüksek]' },
  { seg: 'rope', at: 0.2, text: '[rüzgâr hızlanır]' },
  { seg: 'grows', at: 0.2, text: '[aşağıdan derin bir uğultu]' },
  { seg: 'end', at: 0.3, text: '[ipin gıcırtısı sürer]' },
]

/** World positions match the set layout in docs/stories/paralel.md (and src/three/paralel/). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'banner',
    title: 'Boşluktaki afiş',
    seg: 'can',
    from: 0,
    to: 1.0,
    pos: [-282, 6, -60],
    size: 6,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Boşlukta asılı dev bir afiş: iki beyaz kanat.', 'Altında küçücük harflerle: “Kullanmadan önce uyarıları okuyunuz.”'] },
  },
  {
    id: 'tally',
    title: 'Korkuluktaki çentikler',
    seg: 'gap',
    from: 0,
    to: 2.65,
    pos: [10, 0.47, -3.7],
    size: 0.5,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Korkuluğun betonuna bir çakıl taşıyla kazınmış çentikler.', 'Her atlayış için bir tane. On yedide saymayı bırakmışım.'] },
  },
  {
    id: 'glass-sign',
    title: 'Cam çatı tabelası',
    seg: 'glass',
    from: 0,
    to: 1.6,
    pos: [100, 0.6, 10.4],
    size: 0.9,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['“CAM ÇATI · ÜZERİNE BASMAYINIZ”', 'Tabelanın hemen önündeki camda küçük, tozlu ayak izleri.'] },
  },
  {
    id: 'flood-mark',
    title: 'Taşkın çizgisi',
    seg: 'beams',
    from: 0,
    to: 2.2,
    pos: [183.05, 10.6, 2.5],
    size: 1.6,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Köprü ayağının betonunda boyalı bir çizgi: TAŞKIN SEVİYESİ.', 'Çizgi, tutunduğum kirişten yukarıdaydı.'] },
  },
  {
    id: 'stopwatch-laps',
    title: 'Kronometre',
    seg: 'stone',
    from: 0.6,
    to: 1.6,
    pos: [299.75, 0.45, -1.45],
    size: 0.25,
    kind: 'object',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Kronometrenin hafızasında kayıtlı süreler:', '04.6 · 04.4 · 05.1 · 04.6 · 04.7. Hepsi aynı uçurumdan.'] },
  },
  {
    id: 'rip-note',
    title: 'Uyarı tabelası',
    seg: 'flag',
    from: 0,
    to: 1.8,
    pos: [409.5, 1.7, 4.5],
    size: 1.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['DİKKAT · RİP AKINTISI · YÜZMEK YASAKTIR', 'Altına biri kalemle eklemiş: “Akıntıya kapılırsan kıyıya paralel yüz.”'] },
  },
  {
    id: 'tracks',
    title: 'Lastik izleri',
    seg: 'air',
    from: 0,
    to: 1.0,
    pos: [500, 0.05, 0.6],
    size: 1.2,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Rampanın ucunda iki lastik izi, yan yana başlıyor.', 'Biri karşı tarafa iniyor. Öbürü kenarda bitiyor.'] },
  },
  {
    id: 'drawing',
    title: 'Duvardaki resim',
    seg: 'socket',
    from: 0,
    to: 2.6,
    pos: [698.02, 1.3, -0.6],
    size: 0.5,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Duvara bantlanmış bir çocuk resmi: iki binanın arasında uçan bir çocuk.', 'Kanatları bir içecek kutusundan kesilip yapıştırılmış.'] },
  },
  {
    id: 'labels',
    title: 'Raf etiketleri',
    seg: 'room',
    from: 0.2,
    to: 1.6,
    pos: [898.8, 1.5, -20],
    size: 1.2,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['9 · ÇATI ARASI — 9 · CAM ÇATI — 9 · PRİZ', '12 · KÖPRÜ ALTI — 12 · TEPE — 12 · DENİZ — 15 · BİSİKLET — 15 · YAMAÇ'] },
  },
  {
    id: 'trunk-tally',
    title: 'Ağaçtaki çentikler',
    seg: 'rope',
    from: 0,
    to: 3.6,
    pos: [1001.5, 1.4, 1.75],
    size: 0.5,
    kind: 'object',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Ağacın gövdesine çakıyla kazınmış çentikler.', 'Korkuluktakilerle aynı el. Saymayı bıraktığımı sanıyordum.'] },
  },
]
