/**
 * TAKINTI — every word the reader sees.
 *
 * Close third person on the boy (about thirteen, never named). His mother sews
 * at night: everything nobody uses becomes a rag in this house. He hears her,
 * goes down, shouts through the half-open door and goes back to bed. The
 * camera stays behind without him. The body in the dark is never named and
 * never shown in full light; its feet are what the streetlight finds. The
 * brother is only an empty bed until the morning, and only a name until the
 * last line.
 *
 * Voices: ÇOCUK (sleepy, then angry, then tender), ANNE (a thin, moaning
 * murmur with giggles in it — "hıhıhı", "hehehe" — never shouted).
 *
 * One choice at the half-open door: go in (the source's version, and the
 * default), or call from the threshold. He shouts the same words either way;
 * what he sees, and how close he came to the corner, differs.
 *
 * Pacing: a one-line item stays at least ~0.9 screens, a two-line item at
 * least ~1.6; the second line of a pair arrives (stagger) on the cut or the
 * movement the screenplay names for it.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

/** He went into the room (the source's version; also the default when no choice was made). */
const IN: When = { none: ['door:call'] }
/** He stayed on the threshold and called from there. */
const CALL: When = { all: ['door:call'] }

/** Narration: one rail item; a second line arrives `stagger` of the span later. */
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

/** Spoken words: the rail item and its speaker in the caption above (same timing, so they pair). */
const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, lines: string[], extra: Partial<T> = {}): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.22, ...(extra.when ? { when: extra.when } : {}) },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines, fade: 0.22, stagger: lines.length > 1 ? 0.5 : undefined, ...extra },
]

const BOY = 'ÇOCUK'
const MOTHER = 'ANNE'

export const TEXT: T[] = [
  // 01 — GECE YARISI
  { id: 'nothing', seg: 'street', from: -1, to: 0.9, slot: 'center', kind: 'reveal', purpose: 'foreshadow', lines: ['Bu evde hiçbir şey çöpe gitmezdi.'], sub: 'SCROLL' },
  tell('getup', 'wake', 0.05, 0.95, ['Gece yarısı, tuvalete kalkmak için yavaş yavaş yatağından çıktı.', 'Sokak lambalarından yansıyan ışık huzmeleri sayesinde oda zifiri karanlıktan uzaktı; yönünü bulmakta zorlanmadı.'], { stagger: 0.42 }),
  tell('sounds', 'hall', 0.04, 0.94, ['Tuvalete doğru giderken aşağı kattan sesler geldiğini duydu.', 'Bunlar gerçek miydi, yoksa hâlâ uykulu olduğu için rüyanın etkisinde miydi, anlayamadı.'], { purpose: 'foreshadow' }),
  tell('whispers', 'toilet', 0.04, 0.94, ['Çok ciddiye almadan tuvalete girdi; ışığı yakmadı.', 'Fakat sesler devam ediyordu, sanki aralarına fısıltılar, iniltiler karışıyordu.'], { purpose: 'foreshadow', stagger: 0.48 }),
  tell('hers', 'voice', 0.04, 0.96, ['Annesinin sesiydi bu.', 'Yine gece gece dikiş makinesine oturmuş, sağdan soldan eline geçen eşyaları bez hâline getiriyordu.'], { purpose: 'turn', strong: true, stagger: 0.44 }),

  // 02 — MERDİVEN
  tell('decide', 'landing', 0.04, 0.96, ['Aşağı inmeye karar verdi. Annesine bu işi sabah yapması gerektiğini defalarca söylemişti; nafile.', 'Merdiven başındaki dolap katlanmış bezlerle doluydu. Hepsi bir zamanlar başka bir şeydi.'], { purpose: 'foreshadow', stagger: 0.5 }),
  tell('louder', 'descent', 0.04, 0.96, ['Merdivenlerden inerken, gecenin sessizliğiyle birlikte sesler gitgide artıyor, dayanılmaz bir hâl alıyordu.', 'Annesinin iniltileri yerini kelimelere bırakıyordu.'], { purpose: 'mood', stagger: 0.55 }),
  ...say('below', 'words', 0.02, 0.6, MOTHER, ['— Hıhıhı… eveeet… işte böyle.', 'Artık işe yarar biri olacaksın.']),
  ...say('worn', 'words', 0.64, 0.99, MOTHER, ['— Kimse seni kullanmıyordu, artık eskimiştin… hehehehe…']),
  tell('sure', 'anger', 0.04, 0.96, ['Bu sözleri duyunca yine bez yaptığından kesinlikle emin oldu ve sinirlendi.', 'Adımlarını hızlandırdı.'], { purpose: 'turn', stagger: 0.55 }),
  tell('saw', 'shadow', 0.04, 0.84, ['Yarı açık kapıdan duvara vuran gölgeyi gördü.', 'Dikiş makinesinin başındaki uzun, sıska, buruşuk vücudun gölgesi çok korkunç görünüyordu.'], { purpose: 'mood' }),

  // 03 — KAPI
  tell('enter-in', 'enter', 0.04, 0.96, ['İçeri girdi. Annesi, sırtı kapıya dönük, pencerenin önünde oturuyordu.', 'Yanı başında bir yığın kumaş vardı.'], { when: IN, stagger: 0.5 }),
  tell('enter-call', 'enter', 0.04, 0.96, ['Aralıktan yalnızca duvardaki gölge görünüyordu.', 'Gölgenin dirseği her dikişte kalkıp iniyordu.'], { when: CALL, stagger: 0.5 }),
  ...say('shout', 'shout', 0.04, 0.96, BOY, ['— Anne, yeter artık. Lütfen git uyu, yarın devam et.', 'Uyuyamıyorum, yeteeer!'], { stagger: 0.52 }),
  tell('trance-in', 'trance', 0.04, 0.96, ['Annesi transa geçmiş gibiydi; hiçbir tepki vermeden pedala basıyor, gıcırtıların arasında inliyordu.', 'Bu kadar yakından bile, odanın karanlığında ne diktiğini seçemiyordu.'], { when: IN, purpose: 'turn', stagger: 0.55 }),
  tell('trance-call', 'trance', 0.04, 0.96, ['Annesi transa geçmiş gibiydi; hiçbir tepki vermeden pedala basıyor, gıcırtıların arasında inliyordu.', 'Odanın karanlığında ne diktiğini tam olarak seçemiyordu.'], { when: CALL, purpose: 'turn', stagger: 0.55 }),
  tell('closed', 'close', 0.04, 0.49, ['Odanın kapısını kapattı ve yeniden uyumak için yukarı çıktı.']),
  tell('kept', 'close', 0.53, 1.02, ['Annesi dikişine devam etti.'], { purpose: 'turn', strong: true }),

  // 04 — PEDAL
  tell('body', 'corner', 0.04, 0.53, ['Dikiş makinesinin yanında, ışığın vurmadığı köşede, cansız bir beden vardı.'], { purpose: 'reveal', strong: true }),
  tell('corner-in', 'corner', 0.57, 1.02, ['Çocuk az önce ondan yalnızca birkaç adım ötede durmuştu.'], { when: IN, purpose: 'turn' }),
  tell('corner-call', 'corner', 0.57, 1.02, ['Kapı aralığından bakan çocuk, bu köşeyi karanlıktan ayıramamıştı.'], { when: CALL, purpose: 'turn' }),
  tell('sitting', 'feet', 0.04, 0.98, ['Karanlıklar içinde, oturur hâlde duvara yaslanmıştı; ayakları ise sokak lambasının ışığına uzanıyordu.', 'Ayaklarında hiç deri yoktu.'], { purpose: 'reveal', strong: true, stagger: 0.56 }),
  tell('hard', 'drag', 0.04, 0.96, ['Anne pedala o kadar sert basıyordu ki o bastıkça cansız beden yavaş yavaş kayıyordu.', 'Duvarda kan izleri bırakarak aydınlığa doğru sürükleniyordu.'], { stagger: 0.42 }),
  { id: 'count', seg: 'thrice', from: 0.06, to: 0.98, slot: 'center', kind: 'word', purpose: 'mood', lines: ['Bir kez,', 'iki kez,', 'üç kez…'], stagger: 0.3, fade: 0.25 },
  tell('fell', 'fall', 0.05, 0.96, ['Son bir basıştan sonra beden tamamen aydınlığa düştü.', 'Ondan geriye duvarda ve yerde kan izleri, kan birikintileri kaldı.'], { purpose: 'turn' }),

  // 05 — ŞAFAK
  tell('seen', 'flayed', 0.03, 0.38, ['Aydınlıkta daha kolay seçilebiliyordu: bütün derisi sökülüp alınmıştı.'], { purpose: 'reveal' }),
  tell('peeled', 'flayed', 0.42, 1.02, ['Sırtındaki kaslar açıktaydı; kan, üstlerinde birikip pıhtılaşmıştı.', 'Hiçbir yerinde deri kalmamıştı; kafa derisinden ayak parmaklarına kadar her yeri titizlikle sökülmüştü.']),
  tell('day', 'sunrise', 0.04, 0.96, ['Sokak lambası söndü. Yavaş yavaş gün doğuyor, oda aydınlanıyordu.', 'Güneşin ilk ışınları annenin dikiş masasına düştü.'], { purpose: 'mood', stagger: 0.55 }),
  tell('not-cloth', 'pieces', 0.03, 0.6, ['Masada parça parça duranlar kumaş değildi.', 'Titizlikle yüzülmüş cansız bedenin derisiydi.'], { purpose: 'reveal', strong: true }),
  tell('works', 'pieces', 0.64, 1.0, ['Anne derileri alıp dikiş makinesinde işliyor, kendi kendine sayıklıyordu.']),
  ...say('good-boy', 'mutter', 0.02, 0.6, MOTHER, ['— Eveeet… uslu bir çocuksun sen.', 'Artık bir işe yarayacaksın… hıhıhı…']),
  ...say('remake', 'mutter', 0.64, 0.99, MOTHER, ['— Seni baştan yaratıyorum… Bana teşekkür etmelisin…']),
  tell('joins', 'stitch', 0.03, 0.6, ['Deriyi tek parça hâlinde sökemediği için yavaş yavaş birleştiriyordu.', 'Kafa derisini tek parça çıkarmıştı; ama kollar, gövde ve bacaklar ayrı ayrıydı.'], { stagger: 0.48 }),
  tell('order', 'stitch', 0.64, 1.02, ['Önce başı gövdeye dikmişti. Şimdi kolları ve bacakları yerleştirmeye uğraşıyordu…']),

  // 06 — SABAH
  tell('woke', 'wakeup', 0.04, 0.96, ['Çocuk uyandı. Oda sıradan bir sabah ışığıyla doluydu.', 'Kardeşi yatağında yoktu; muhtemelen ondan önce kalkmış, aşağıda kahve yapıyordu.'], { purpose: 'turn', stagger: 0.44 }),
  tell('lately', 'brother', 0.04, 0.96, ['Aklına, kardeşinin son zamanlarda içine kapandığı geldi: kulaklıklarını takıp duvara dönüyordu.', 'Artık eskisi gibi yakın değillerdi. Bedenini bir hüzün kapladı.'], { purpose: 'mood', stagger: 0.55 }),
  tell('make-up', 'games', 0.04, 0.96, ['Hemen yanına gidip arasını düzeltmek, sorunlarında ona destek olmak istiyordu.', 'Tekrar eskisi gibi oyunlar oynayabileceklerdi.'], { stagger: 0.5 }),
  tell('ran', 'rush', 0.05, 0.96, ['Elini yüzünü yıkamadan apar topar merdivenlere koştu; basamakları ikişer ikişer indi.']),
  tell('passed', 'pass', 0.03, 0.42, ['Annesinin odasının önünden hızla geçti. Kapı açıktı.']),
  tell('could', 'pass', 0.47, 1.0, ['İçeri baksa vahşeti görebilirdi.'], { purpose: 'foreshadow', strong: true }),

  // 07 — MUTFAK
  tell('back', 'kitchen', 0.04, 0.96, ['Mutfağa vardığında annesi, sırtı dönük, yeri siliyordu.', 'Ocak soğuktu; kimse kahve yapmamıştı. Kardeşini göremeyince sordu:'], { stagger: 0.5 }),
  ...say('where', 'ask', 0.06, 0.94, BOY, ['— Anne, Osman’ı gördün mü?']),
  tell('how', 'answer', 0.03, 0.45, ['Annesi de soğuk, iniltili, cılız bir sesle, neşe ve hüzünle karşılık verdi:']),
  { id: 'rag', seg: 'answer', from: 0.49, to: 1.15, slot: 'center', kind: 'reveal', purpose: 'reveal', strong: true, lines: ['— Kullanmıyorsunuz diye bez yaptım ben onu oğlum.'], fade: 0.3 },
  { id: 'end', seg: 'end', from: 0.32, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['TAKINTI'], sub: 'Bu evde hiçbir şey çöpe gitmez.', fade: 0.4 },
]

/** The one decision: how close he comes. The words he shouts are the same. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'door',
    seg: 'shadow',
    at: 0.92,
    style: 'choice',
    title: 'YARI AÇIK KAPI',
    prompt: 'Ne yapacaksın?',
    options: [
      { id: 'in', label: 'İçeri gir.', reply: ['Kapıyı itti. Menteşeler inledi.'], sets: ['door:in'] },
      { id: 'call', label: 'Kapıdan seslen.', reply: ['Eşikte durdu, elini kapının kenarına koydu.'], sets: ['door:call'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  midnight:
    'Bu evde hiçbir şey çöpe gitmezdi. Gece yarısı, tuvalete kalkmak için yavaş yavaş yatağından çıktı. Sokak lambalarından yansıyan ışık huzmeleri sayesinde oda zifiri karanlıktan uzaktı; yönünü bulmakta zorlanmadı. Tuvalete doğru giderken aşağı kattan sesler geldiğini duydu. Bunlar gerçek miydi, yoksa hâlâ uykulu olduğu için rüyanın etkisinde miydi, anlayamadı. Çok ciddiye almadan tuvalete girdi; ışığı yakmadı. Fakat sesler devam ediyordu, sanki aralarına fısıltılar, iniltiler karışıyordu. Annesinin sesiydi bu. Yine gece gece dikiş makinesine oturmuş, sağdan soldan eline geçen eşyaları bez hâline getiriyordu.',
  stairs:
    'Aşağı inmeye karar verdi. Annesine bu işi sabah yapması gerektiğini defalarca söylemişti; nafile. Merdiven başındaki dolap katlanmış bezlerle doluydu. Hepsi bir zamanlar başka bir şeydi. Merdivenlerden inerken, gecenin sessizliğiyle birlikte sesler gitgide artıyor, dayanılmaz bir hâl alıyordu. Annesinin iniltileri yerini kelimelere bırakıyordu: “Hıhıhı… eveeet… işte böyle. Artık işe yarar biri olacaksın. Kimse seni kullanmıyordu, artık eskimiştin… hehehehe…” Bu sözleri duyunca yine bez yaptığından kesinlikle emin oldu ve sinirlendi. Adımlarını hızlandırdı. Yarı açık kapıdan duvara vuran gölgeyi gördü. Dikiş makinesinin başındaki uzun, sıska, buruşuk vücudun gölgesi çok korkunç görünüyordu. Kapının önünde durdu: İçeri mi girecekti, yoksa kapıdan mı seslenecekti?',
  door:
    'İçeri girdiyse: Kapıyı itti, menteşeler inledi. İçeri girdi. Annesi, sırtı kapıya dönük, pencerenin önünde oturuyordu; yanı başında bir yığın kumaş vardı. Kapıdan seslendiyse: Eşikte durdu, elini kapının kenarına koydu. Aralıktan yalnızca duvardaki gölge görünüyordu; gölgenin dirseği her dikişte kalkıp iniyordu. İki durumda da aynı sözleri bağırdı: “Anne, yeter artık. Lütfen git uyu, yarın devam et. Uyuyamıyorum, yeteeer!” Annesi transa geçmiş gibiydi; hiçbir tepki vermeden pedala basıyor, gıcırtıların arasında inliyordu. İçerideyse, bu kadar yakından bile odanın karanlığında ne diktiğini seçemiyordu; eşikteyse, ne diktiğini tam olarak seçemiyordu. Odanın kapısını kapattı ve yeniden uyumak için yukarı çıktı. Annesi dikişine devam etti.',
  pedal:
    'Dikiş makinesinin yanında, ışığın vurmadığı köşede, cansız bir beden vardı. Çocuk içeri girdiyse, az önce ondan yalnızca birkaç adım ötede durmuştu; kapıdan seslendiyse, kapı aralığından bakarken bu köşeyi karanlıktan ayıramamıştı. Beden karanlıklar içinde, oturur hâlde duvara yaslanmıştı; ayakları ise sokak lambasının ışığına uzanıyordu. Ayaklarında hiç deri yoktu. Anne pedala o kadar sert basıyordu ki o bastıkça cansız beden yavaş yavaş kayıyor, duvarda kan izleri bırakarak aydınlığa doğru sürükleniyordu. Bir kez, iki kez, üç kez… Son bir basıştan sonra beden tamamen aydınlığa düştü. Ondan geriye duvarda ve yerde kan izleri, kan birikintileri kaldı.',
  dawn:
    'Aydınlıkta daha kolay seçilebiliyordu: bütün derisi sökülüp alınmıştı. Sırtındaki kaslar açıktaydı; kan, üstlerinde birikip pıhtılaşmıştı. Hiçbir yerinde deri kalmamıştı; kafa derisinden ayak parmaklarına kadar her yeri titizlikle sökülmüştü. Sokak lambası söndü. Yavaş yavaş gün doğuyor, oda aydınlanıyordu. Güneşin ilk ışınları annenin dikiş masasına düştü. Masada parça parça duranlar kumaş değildi; titizlikle yüzülmüş cansız bedenin derisiydi. Anne derileri alıp dikiş makinesinde işliyor, kendi kendine sayıklıyordu: “Eveeet… uslu bir çocuksun sen. Artık bir işe yarayacaksın… hıhıhı… Seni baştan yaratıyorum… Bana teşekkür etmelisin…” Deriyi tek parça hâlinde sökemediği için yavaş yavaş birleştiriyordu. Kafa derisini tek parça çıkarmıştı; ama kollar, gövde ve bacaklar ayrı ayrıydı. Önce başı gövdeye dikmişti. Şimdi kolları ve bacakları yerleştirmeye uğraşıyordu…',
  morning:
    'Çocuk uyandı. Oda sıradan bir sabah ışığıyla doluydu. Kardeşi yatağında yoktu; muhtemelen ondan önce kalkmış, aşağıda kahve yapıyordu. Aklına, kardeşinin son zamanlarda içine kapandığı geldi: kulaklıklarını takıp duvara dönüyordu. Artık eskisi gibi yakın değillerdi. Bedenini bir hüzün kapladı. Hemen yanına gidip arasını düzeltmek, sorunlarında ona destek olmak istiyordu. Tekrar eskisi gibi oyunlar oynayabileceklerdi. Elini yüzünü yıkamadan apar topar merdivenlere koştu; basamakları ikişer ikişer indi. Annesinin odasının önünden hızla geçti. Kapı açıktı. İçeri baksa vahşeti görebilirdi.',
  kitchen:
    'Mutfağa vardığında annesi, sırtı dönük, yeri siliyordu. Ocak soğuktu; kimse kahve yapmamıştı. Kardeşini göremeyince sordu: “Anne, Osman’ı gördün mü?” Annesi de soğuk, iniltili, cılız bir sesle, neşe ve hüzünle karşılık verdi: “Kullanmıyorsunuz diye bez yaptım ben onu oğlum.” Sonra bezi kovaya daldırdı, sıktı ve yeri silmeye devam etti. Bu evde hiçbir şey çöpe gitmez.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('wake', 0.05)],
  [at('thrice'), at('fall', 0.45)],
  [at('answer', 0.47), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'street', at: 0.08, text: '[sokak lambasının vızıltısı]' },
  { seg: 'street', at: 0.45, text: '[evin içinden, boğuk ve düzenli bir takırtı]' },
  { seg: 'wake', at: 0.08, text: '[yatak yayları gıcırdar]' },
  { seg: 'hall', at: 0.06, text: '[aşağıdan, dikiş makinesinin takırtısı]' },
  { seg: 'toilet', at: 0.08, text: '[kapı aralık kalır]' },
  { seg: 'toilet', at: 0.3, text: '[musluk damlar]' },
  { seg: 'toilet', at: 0.5, text: '[fısıltılar; bir inilti]' },
  { seg: 'voice', at: 0.08, text: '[annesinin sesi: kısık bir kıkırdama]' },
  { seg: 'voice', at: 0.45, text: '[pedal gıcırdar, iğne takırdar]' },
  { seg: 'landing', at: 0.05, text: '[tuvalet kapısı açılır]' },
  { seg: 'descent', at: 0.06, text: '[basamaklar tek tek gıcırdar]' },
  { seg: 'words', at: 0.02, text: '[annesinin sesi, aşağıdan]' },
  { seg: 'words', at: 0.9, text: '[kıkırdama]' },
  { seg: 'anger', at: 0.5, text: '[hızlanan çıplak ayak sesleri]' },
  { seg: 'shadow', at: 0.05, text: '[makinenin takırtısı, çok yakından]' },
  { seg: 'enter', at: 0.04, text: '[menteşeler inler]', when: IN },
  { seg: 'shout', at: 0.56, text: '[ayağını yere vurur; makine durmaz]' },
  { seg: 'trance', at: 0.1, text: '[pedal; inilti; pedal]' },
  { seg: 'close', at: 0.08, text: '[kapı kapanır; makinenin sesi boğuklaşır]' },
  { seg: 'close', at: 0.35, text: '[basamaklar gıcırdar, uzaklaşır]' },
  { seg: 'corner', at: 0.1, text: '[makine durmadan takırdar]' },
  { seg: 'drag', at: 0.1, text: '[pedal sertçe iner]' },
  { seg: 'drag', at: 0.45, text: '[ıslak bir sürtünme]' },
  { seg: 'thrice', at: 0.06, text: '[pedal çarpar; ıslak bir kayma]' },
  { seg: 'thrice', at: 0.34, text: '[pedal çarpar; ıslak bir kayma]' },
  { seg: 'thrice', at: 0.61, text: '[pedal çarpar; ıslak bir kayma]' },
  { seg: 'fall', at: 0.06, text: '[ağır, yumuşak bir düşüş]' },
  { seg: 'fall', at: 0.12, text: '[makine susar]' },
  { seg: 'fall', at: 0.5, text: '[makine yeniden takırdamaya başlar]' },
  { seg: 'sunrise', at: 0.08, text: '[sokak lambası tık diye söner]' },
  { seg: 'sunrise', at: 0.5, text: '[uzakta ilk kuşlar]' },
  { seg: 'pieces', at: 0.62, text: '[makas sesi]' },
  { seg: 'mutter', at: 0.02, text: '[iğnenin boğuk takırtısı]' },
  { seg: 'stitch', at: 0.5, text: '[makine durur, yeniden başlar]' },
  { seg: 'wakeup', at: 0.04, text: '[sabah: uzakta bir araba, kuşlar]' },
  { seg: 'rush', at: 0.1, text: '[basamaklarda koşan ayaklar]' },
  { seg: 'pass', at: 0.3, text: '[açık kapının ardında sinek vızıltısı]' },
  { seg: 'kitchen', at: 0.04, text: '[ıslak bezin karolara sürtünmesi]' },
  { seg: 'answer', at: 0.04, text: '[bez durur]' },
  { seg: 'end', at: 0.1, text: '[bez kovaya daldırılır, sıkılır]' },
]

/** World positions match the house in docs/stories/takinti.md (upper floor at y 3.0). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'empty-bed',
    title: 'Öbür yatak',
    seg: 'wake',
    from: 0,
    to: 1,
    pos: [3.3, 3.45, -0.9],
    size: 1.2,
    kind: 'character',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Öbür yatak boştu.', 'Yorgan ayakucuna itilmişti. Yastığın üstünde, kablosu dolanmış bir kulaklık duruyordu.'] },
  },
  {
    id: 'rag-towel',
    title: 'Havlu askısı',
    seg: 'toilet',
    from: 0,
    to: 1.5,
    pos: [-2.55, 4.1, -2.6],
    size: 0.4,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Askıda havlu yoktu.', 'Eski bir pijamadan kesilmiş, kenarları sık dikişlerle bastırılmış bir bez asılıydı.'] },
  },
  {
    id: 'labels',
    title: 'Bez dolabı',
    seg: 'landing',
    from: 0.4,
    to: 1,
    pos: [0.7, 4.1, 4.05],
    size: 0.6,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['Her bezin köşesine küçük bir kâğıt dikilmişti.', '“Salon perdesi.” “Okul önlüğü.” “Kırmızı kazak — kimse giymiyordu.”'] },
  },
  {
    id: 'dress-form',
    title: 'Köşedeki biri',
    seg: 'enter',
    from: 0,
    to: 3.2,
    pos: [1.3, 1.0, -3.95],
    size: 0.6,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Köşede biri duruyordu.', 'Hayır: annesinin terzi mankeniydi. Başı yoktu.'] },
  },
  {
    id: 'thread',
    title: 'Makara',
    seg: 'pieces',
    from: 0,
    to: 1.95,
    pos: [4.7, 1.05, -2.05],
    size: 0.2,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Makaradaki iplik ten rengiydi.', 'Evdeki hiçbir kumaş bu renkte değildi.'] },
  },
  {
    id: 'controllers',
    title: 'İki kol',
    seg: 'brother',
    from: 0.5,
    to: 1.86,
    pos: [1.1, 3.53, -3.1],
    size: 0.35,
    kind: 'object',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['İki oyun kolu yan yana duruyordu. Birinin üstü toz tutmuştu.', 'Hangisinin kimin olduğunu ikisi de bilirdi.'] },
  },
  {
    id: 'open-door',
    title: 'Açık kapı',
    seg: 'pass',
    from: 0.25,
    to: 0.8,
    pos: [2.8, 0.8, -3.0],
    size: 2.2,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Güneş dikiş masasına vuruyordu; havada sinekler dönüyordu.', 'Duvarda, yerden bir karış yukarıda, uzun ve koyu izler vardı. Kumaş yığını dün geceden büyüktü.'] },
  },
  {
    id: 'mop',
    title: 'Paspas',
    seg: 'kitchen',
    from: 0,
    to: 1.68,
    pos: [2.4, 0.8, -9.2],
    size: 0.5,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Paspas köşede, kupkuru duruyordu.', 'Annesi bu sabah onu kullanmamıştı.'] },
  },
  {
    id: 'bucket',
    title: 'Kova',
    seg: 'answer',
    from: 0.55,
    to: 1.69,
    pos: [-1.1, 0.2, -9.1],
    size: 0.4,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Kovadaki su hafifçe pembeydi.', 'Bezin kenarları özenle dikilmişti.'] },
  },
]
