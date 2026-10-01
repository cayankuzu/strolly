/**
 * YAŞAMAK — EN UZUN VE EN KISA VEDA. Every word the reader sees. A sixty-
 * minute session in an internet cafe stands for a life; the people around
 * Arif live theirs at the same time. The euthanasia chapter asks, it does
 * not answer: it is about who a life belongs to, not about how to end one.
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
  stagger: lines.length > 1 ? 0.38 : undefined,
  ...extra,
})

const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.25 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.25 },
]

export const TEXT: T[] = [
  // 01 — İNTERNET KAFE
  { id: 'hour', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Herkesin bir saati vardı.'], sub: 'SCROLL' },
  { id: 'usual', seg: 'door', from: 0.2, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Arif kafeye her zamanki gibi girdi.'] },
  ...say('one-hour', 'pay', 0.15, 0.7, 'KASİYER', '— Bir saat. Uzatma yok.'),
  { id: 'nobody-looks', seg: 'seat', from: 0.2, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Kimse süresinin ne kadar kaldığına bakmıyordu.', 'Başlangıçta.'], stagger: 0.4 },
  ...say('tea-offer', 'tea', 0.16, 0.42, 'KASİYER', '— Çay? Tost da var, kaşarlı.'),
  ...say('just-tea', 'tea', 0.45, 0.58, 'ARİF', '— Sadece çay.'),
  tell('short-leg', 'tea', 0.62, 1.04, ['Sandalyenin bir ayağı kısaydı.', 'Yıllardır kısaydı. Kimse değiştirmemişti.'], { purpose: 'mood' }),

  // 02 — ZAMAN
  { id: 'session', seg: 'start', from: 0.05, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['OTURUM BAŞLADI · 60:00'] },
  { id: 'precious', seg: 'screen', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['Süre azaldıkça ekrandaki her şey daha değerli görünmeye başladı.'] },
  tell('spent', 'spend', 0.04, 0.2, ['Bir saat çok gibi görünüyordu.'], { purpose: 'foreshadow' }),
  tell('spent-game', 'spend', 0.62, 1.04, ['Bir maç bitti, bir maç daha başladı.'], { when: { all: ['hour:game'] } }),
  tell('spent-read', 'spend', 0.62, 1.04, ['Dünyada bir sürü şey oluyordu. Hepsi başkalarının başına.'], { when: { all: ['hour:read'] } }),
  tell('spent-window', 'spend', 0.62, 1.04, ['Sokakta biri otobüse yetişmeye çalışıyordu.', 'Yetişti.'], { when: { all: ['hour:window'] } }),
  { id: 'not-slower', seg: 'clock', from: 0.15, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Ama daha yavaş geçmedi.'] },

  // 03 — İNSANLAR
  { id: 'grew', seg: 'child', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Yan masadaki çocuk büyüdü.', 'Arif bunu fark etmedi; yalnızca başını kaldırdı ve büyümüştü.'], stagger: 0.3 },
  { id: 'left', seg: 'leave', from: 0.2, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Biri kalktı ve bir daha gelmedi.'] },
  { id: 'came-back', seg: 'returns', from: 0.15, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Biri geri geldi; başka biri olarak.'] },
  tell('laughed', 'life', 0.08, 0.52, ['Birileri güldü. Birileri tost yedi.', 'Kapı açıldı, kapandı.'], { purpose: 'mood' }),
  tell('went-on', 'life', 0.56, 1.06, ['Onun süresi azalırken de', 'hayat devam ediyordu.'], { purpose: 'turn', strong: true }),

  // 04 — VEDA
  { id: 'mom', seg: 'mother', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'mood', lines: ['Sağındaki masada annesi oturuyordu. Hep oradaydı.', 'O yüzden ona hiç bakmazdı.'], stagger: 0.42 },
  tell('picked-up', 'phone', 0.06, 0.36, ['Telefonunu aldı. Rehberde ilk isim: ANNE.'], { purpose: 'turn' }),
  tell('right-there', 'phone', 0.78, 1.04, ['Oysa annesi sağındaki masadaydı.'], { when: { all: ['mom:later'] } }),
  tell('turned', 'phone', 0.78, 1.04, ['Annesi gülümsedi. Ekranına geri döndü.', 'Arif de döndü.'], { when: { all: ['mom:talk'] } }),
  { id: 'think', seg: 'think', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Bazı vedalar yıllar sürer.', 'Bazıları bir saniye.'], stagger: 0.4 },
  { id: 'longest', seg: 'gone', from: 0.35, to: 1.1, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ['En uzun veda, henüz gelmemiş olandı.'] },

  tell('remembered', 'after', 0.1, 1.04, ['Ne konuştuklarını sonra hatırlamadı.', 'Konuştuklarını hatırladı.'], { when: { all: ['mom:talk'] }, purpose: 'reveal' }),
  tell('next-day', 'after', 0.1, 1.04, ['Ertesi gün aradı.', 'Telefon çaldı, çaldı.'], { when: { all: ['mom:later'] }, purpose: 'reveal', strong: true }),

  // 05 — SONSUZLUK
  { id: 'never-ends', seg: 'endless', from: 0.15, to: 0.6, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Ya süre hiç bitmeseydi?'] },
  { id: 'infinite', seg: 'endless', from: 0.66, to: 1.2, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Ekran hiç kapanmazdı. Kafe hiç boşalmazdı.'] },
  { id: 'no-hurry', seg: 'still', from: 0.25, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Hiçbir şeyin acelesi olmazdı.'] },
  { id: 'no-meaning', seg: 'meaning', from: 0.1, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ['Hiçbir şeyin anlamı da.'] },

  // 06 — ÖTENAZİ
  { id: 'corner', seg: 'corner', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Köşedeki yaşlı kadın aylardır aynı masadaydı.'] },
  { id: 'heavier', seg: 'pain', from: 0.1, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Ekranında yalnızca ağrı vardı.', 'Kalan süresi, yaşadığından ağır geliyordu.'], stagger: 0.4 },
  ...say('whose', 'owner', 0.1, 0.62, 'YAŞLI KADIN', '— Bu saat kimin, Arif? Benim mi, beni bekleyenlerin mi?'),
  { id: 'many', seg: 'owner', from: 0.68, to: 1.2, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Cevabı olmayan bir soru değildi. Birden fazla cevabı vardı.'] },
  { id: 'no-judge', seg: 'answer', from: 0.25, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Kadın ekranını kapatmadı. Ama artık saate bakmıyordu.', 'Arif onu yargılamadı. Anlamaya çalıştı.'], stagger: 0.42 },

  // 07 — KAPANIŞ
  ...say('half-hour', 'closing', 0.08, 0.38, 'KASİYER', '— Kapanışa yarım saat, arkadaşlar.'),
  tell('emptying', 'closing', 0.44, 1.04, ['Kafe yavaş yavaş boşaldı.', 'Kimse acele etmiyordu; yine de herkes gidiyordu.']),
  ...say('on-me', 'lastTea', 0.14, 0.42, 'KASİYER', '— Bu benden.'),
  tell('warm', 'lastTea', 0.48, 1.04, ['Çay sıcaktı.', 'Arif bunu ilk kez fark etti.'], { purpose: 'turn' }),

  // 08 — KARA DELİK
  { id: 'farthest', seg: 'depart', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Arif kalan süresini harcamanın bir yolunu buldu: en uzağa gitmek.'] },
  { id: 'target', seg: 'horizon', from: 0.05, to: 0.95, slot: 'top', kind: 'system', purpose: 'system', lines: ['HEDEF: OLAY UFKU'] },
  { id: 'outside-fast', seg: 'horizon', from: 0.35, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Kara deliğe yaklaştıkça dışarıdaki zaman hızlandı.'] },
  { id: 'everyone', seg: 'dilation', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Kafedeki herkes yaşlandı, gitti, unutuldu.', 'Arif için birkaç dakika geçmişti.'], stagger: 0.42 },
  { id: 'not-stop', seg: 'slow', from: 0.2, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'reveal', strong: true, lines: ['Zamanı yavaşlatmak mümkündü. Durdurmak değil.'] },

  // 09 — SON
  tell('kept-game', 'one', 0.1, 0.48, ['Maçların skorunu hatırlamıyordu.'], { when: { all: ['hour:game'] } }),
  tell('kept-read', 'one', 0.1, 0.48, ['Okuduklarından hiçbirini hatırlamıyordu.'], { when: { all: ['hour:read'] } }),
  tell('kept-window', 'one', 0.1, 0.48, ['Otobüse yetişen adamı hatırlıyordu. Nedenini bilmeden.'], { when: { all: ['hour:window'] } }),
  { id: 'one-left', seg: 'one', from: 0.5, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['00:01'] },
  { id: 'zero', seg: 'zero', from: 0.3, to: 0.95, slot: 'top', kind: 'alert', purpose: 'system', world: true, lines: ['00:00'] },
  { id: 'living', seg: 'behind', from: 0.35, to: 1.0, slot: 'center', kind: 'reveal', purpose: 'question', lines: ['Yaşamak, sürenin bitmesini beklemek değildi.'] },
  { id: 'staying', seg: 'last', from: 0.0, to: 0.4, slot: 'center', kind: 'reveal', purpose: 'question', strong: true, lines: ['Biteceğini bile bile kalmaktı.'] },
  { id: 'end', seg: 'last', from: 0.5, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['YAŞAMAK'], sub: 'En uzun ve en kısa veda.', fade: 0.4 },
]

export const TRANSCRIPT: Record<string, string> = {
  cafe: 'Gece bir internet kafe. Arif kapıdan girer, kasada bir saatlik oturum alır ve her zamanki masasına oturur. Kasiyer çay getirir; tost da vardır, kaşarlı. Arif yalnızca çay ister. Sandalyenin bir ayağı yıllardır kısadır.',
  time: 'Ekranda süre geri saymaya başlar: 60:00, 59:59, 59:58. Okur bu saati nasıl geçireceğini seçer: bir oyun, haberler ya da pencere. Arif’in arkasındaki duvar saati, ekrandaki süreden daha hızlı ilerlemektedir.',
  people: 'Yan masadaki çocuk Arif bir an başını kaldırdığında büyümüştür. Biri kalkar ve bir daha gelmez; biri geri gelir, başka biri olarak. Birileri güler, birileri tost yer; onun süresi azalırken de hayat devam eder.',
  farewell: 'Sağdaki masada Arif’in annesi oturmaktadır; hep oradadır. Arif telefonunu alır; rehberde ilk isim ANNE. Okur seçer: ona dönüp konuşmak ya da “yarın ararım” demek. Arif vedayı düşünür. Arkasına döndüğünde masa boştur. Konuştuysa ne konuştuklarını değil, konuştuklarını hatırlar; aramayı yarına bıraktıysa telefon çalar, çalar.',
  forever: 'Arif ölümsüzlüğü düşünür: hiç kapanmayan bir ekran, hiç boşalmayan bir kafe. Hiçbir şeyin acelesi yoktur; hiçbir şeyin anlamı da.',
  choice:
    'Köşedeki yaşlı kadın aylardır aynı masadadır; ekranında yalnızca ağrı vardır. Arif’e sorar: bu saat kimin, benim mi, beni bekleyenlerin mi? Arif yargılamaz, anlamaya çalışır. Kadın artık saate bakmaz.',
  closing: 'Kasiyer kapanışa yarım saat kaldığını söyler. Kafe yavaş yavaş boşalır; kimse acele etmez, yine de herkes gider. Kasiyer son çayı getirir: bu benden. Çay sıcaktır; Arif bunu ilk kez fark eder.',
  void: 'Arif kalan süresiyle en uzağa gitmeyi seçer: bir kara deliğin olay ufkuna. Yaklaştıkça dışarıdaki zaman hızlanır; kafedeki herkes yaşlanır ve kaybolur, Arif için yalnızca birkaç dakika geçer.',
  end: 'Ekranda 00:01 kalır; Arif o saatten yalnızca bir şeyi hatırlar. Sonra 00:00. Ekran kapanır. Arif arkasına döndüğünde kafe yoktur; yalnızca boşluk vardır. Yaşamak, sürenin bitmesini beklemek değil; biteceğini bile bile kalmaktır.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('door', 0.2)],
  [at('gone', 0.3), at('gone', 1)],
  [at('zero'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'door', at: 0.3, text: '[kapının zili]' },
  { seg: 'start', at: 0.05, text: '[oturum başladı sesi]' },
  { seg: 'clock', at: 0.2, text: '[duvar saatinin tıkırtısı, hızlı]' },
  { seg: 'leave', at: 0.4, text: '[geri itilen bir sandalye]' },
  { seg: 'gone', at: 0.2, text: '[sessizlik]' },
  { seg: 'horizon', at: 0.1, text: '[derinden gelen bir uğultu]' },
  { seg: 'zero', at: 0.32, text: '[ekran kapanır]' },
  { seg: 'tea', at: 0.55, text: '[çay bardağı tabağa konur]' },
  { seg: 'tea', at: 0.7, text: '[sandalye bir yana yatar]' },
  { seg: 'phone', at: 0.08, text: '[telefonun kilidi açılır]' },
  { seg: 'after', at: 0.3, text: '[uzun uzun çalan bir telefon]' },
  { seg: 'closing', at: 0.06, text: '[kasadan bir ses]' },
  { seg: 'lastTea', at: 0.4, text: '[kaşığın bardağa değdiği ses]' },
]

/** World positions match the set in src/three/yasamak/. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'receipt',
    title: 'Fiş',
    seg: 'seat',
    from: 0,
    to: 3.2,
    pos: [1.2, 0.77, -0.15],
    size: 0.25,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['1 SAAT · ÖDENDİ', 'Arkasında el yazısı: “Süreyi uzatamazsın. Nasıl harcayacağını seçebilirsin.”'] },
  },
  {
    id: 'fast-clock',
    title: 'Hızlı saat',
    seg: 'clock',
    from: 0,
    to: 1.5,
    pos: [0, 2.3, 4.9],
    size: 0.5,
    kind: 'anomaly',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Duvar saati, ekrandaki süreden hızlı ilerliyordu.'] },
  },
  {
    id: 'window-seasons',
    title: 'Penceredeki mevsimler',
    seg: 'returns',
    from: 0,
    to: 1.6,
    pos: [0, 1.6, -5.0],
    size: 2.0,
    kind: 'environment',
    visibility: 'subtle',
  },
  {
    id: 'empty-chair',
    title: 'Boş sandalye',
    seg: 'gone',
    from: 0,
    to: 1.2,
    pos: [2.25, 0.8, 0.6],
    size: 0.6,
    kind: 'character',
    visibility: 'visible',
  },
  {
    id: 'her-screen',
    title: 'Yaşlı kadının ekranı',
    seg: 'pain',
    from: 0,
    to: 2.6,
    pos: [-4.5, 1.05, -2.25],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Ekranda süre yoktu.', 'Bir pencere açıktı: torunlarının fotoğrafları.'] },
  },
  {
    id: 'void-behind',
    title: 'Arkadaki boşluk',
    seg: 'behind',
    from: 0,
    to: 1.4,
    pos: [0.75, 1.2, 5.5],
    size: 3.0,
    kind: 'environment',
    visibility: 'visible',
  },
]

/** What the hour is spent on, and whether he calls his mother now or tomorrow. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'hour',
    seg: 'spend',
    at: 0.24,
    style: 'choice',
    title: 'KALAN SÜRE',
    prompt: 'Bu saati ne yaparak geçireceksin?',
    options: [
      { id: 'game', label: 'Bir oyun aç.', reply: ['İlk maç kolaydı.'], sets: ['hour:game'] },
      { id: 'read', label: 'Haberleri oku.', reply: ['Sayfa sayfa aşağı indi.'], sets: ['hour:read'] },
      { id: 'window', label: 'Pencereden dışarı bak.', reply: ['Ekran kendi kendine karardı.'], sets: ['hour:window'] },
    ],
  },
  {
    id: 'mother',
    seg: 'phone',
    at: 0.42,
    style: 'choice',
    title: 'ANNE',
    prompt: 'Ne yapacaksın?',
    options: [
      { id: 'talk', label: 'Ona dön, konuş.', reply: ['— Anne.', 'Kadın başını kaldırdı. Ne diyeceklerini bilemediler; yine de konuştular.'], sets: ['mom:talk'] },
      { id: 'later', label: '“Yarın ararım.”', reply: ['Telefonu cebine koydu.'], sets: ['mom:later'] },
    ],
  },
]
