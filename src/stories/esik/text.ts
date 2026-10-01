/**
 * EŞİK — every word the reader sees. A city where nobody looks at Mira,
 * until someone does. The story is about perception: what exists because
 * it is observed, and who observes the observer. Its last door opens onto
 * STROLLY itself.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.25 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.25 },
]

export const TEXT: T[] = [
  // 01 — ŞEHİR
  { id: 'nothing-missing', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Şehirde hiçbir şey eksik değildi.'], sub: 'SCROLL' },
  { id: 'walked', seg: 'walk', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Mira gece boyunca yürüdü.', 'Arabalar geçti. Işıklar yandı. Kapılar açıldı.'], stagger: 0.42 },
  { id: 'nobody', seg: 'phones', from: 0.2, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Ama kimse ona bakmadı.'] },

  // 02 — VİTRİN
  { id: 'passed', seg: 'shop', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Bir mağazanın önünden geçti.'] },
  { id: 'reflection', seg: 'reflect', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Camdaki yansımasına baktı.'] },

  // 03 — AYNI SOKAK
  { id: 'kept', seg: 'corner', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Yürümeye devam etti. Köşeyi döndü.'] },
  { id: 'same-street', seg: 'same', from: 0.2, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'turn', strong: true, lines: ['Aynı sokaktı.'] },

  // 04 — GÖZLEM
  { id: 'cafe', seg: 'enter', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Bir kafeye girdi.'] },
  { id: 'looked', seg: 'seen', from: 0.1, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Masadaki adam başını kaldırdı ve ona baktı.', "İlk defa biri Mira'yı görmüştü."], stagger: 0.45 },
  ...say('finally', 'talk', 0.05, 0.22, 'ADAM', '— Sonunda.'),
  ...say('know-me', 'talk', 0.26, 0.45, 'MİRA', '— Beni tanıyor musun?'),
  ...say('no', 'talk', 0.49, 0.62, 'ADAM', '— Hayır.'),
  ...say('you-see', 'talk', 0.72, 1.0, 'ADAM', '— Ama sen bizi görüyorsun.'),

  // 05 — CAM
  { id: 'to-glass', seg: 'glass', from: 0.1, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Adam onu büyük bir camın önüne götürdü.'] },
  {
    id: 'versions',
    seg: 'versions',
    from: 0.05,
    to: 1.05,
    slot: 'rail',
    kind: 'narration',
    purpose: 'reveal',
    lines: ['Camın arkasında aynı şehir vardı. Başka bir versiyonu.', 'Sonra başka bir cam. Başka bir şehir.'],
    stagger: 0.45,
  },

  // 06 — GÖZLEMCİ
  ...say('exists', 'observe', 0.08, 0.5, 'ADAM', '— Bir şeyi gözlemlediğinde onun var olduğunu düşünüyorsun.'),
  ...say('who-observes', 'observe', 0.6, 1.02, 'ADAM', '— Peki seni kim gözlemliyor?'),

  // 07 — KULLANICI
  { id: 'old-terminal', seg: 'terminal', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Tezgâhın arkasında eski bir terminal vardı.'] },
  { id: 'terminal-words', seg: 'words', from: 0.05, to: 1.0, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ['OBSERVER · SUBJECT · ENVIRONMENT · USER'] },
  ...say('user', 'user', 0.15, 0.95, 'MİRA', '— User?'),

  // 08 — GERÇEKLİK
  { id: 'out', seg: 'outside', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'context', lines: ['Mira dışarı çıktı.'] },
  { id: 'in-place', seg: 'shift', from: 0.15, to: 0.8, slot: 'rail', kind: 'narration', purpose: 'foreshadow', lines: ['Şehir yerindeydi.'] },

  // 09 — EŞİK
  { id: 'do-not', seg: 'door', from: 0.1, to: 1.0, slot: 'top', kind: 'alert', purpose: 'system', world: true, lines: ['DO NOT OPEN'] },
  { id: 'a-door', seg: 'door', from: 0.25, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Sokağın sonunda bir kapı vardı.'] },
  ...say('dont', 'voice', 0.04, 0.3, 'SES', '— Beni duyuyorsan kapıyı açma.'),
  ...say('why', 'voice', 0.35, 0.5, 'MİRA', '— Neden?'),
  ...say('not-you', 'voice', 0.56, 1.0, 'SES', '— Çünkü dışarı çıktığında artık sen olmayacaksın.'),

  // 10 — KAPI
  { id: 'nothing-there', seg: 'around', from: 0.15, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Kapının arkasında hiçbir şey görünmüyordu.'] },
  { id: 'opened', seg: 'opens', from: 0.3, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Mira kapıyı açtı.'], when: { all: ['esik:open'] } },
  { id: 'opened-anyway', seg: 'opens', from: 0.3, to: 1.0, slot: 'rail', kind: 'narration', purpose: 'turn', lines: ['Mira elini çekti.', 'Kapı yine de açıldı.'], stagger: 0.4, when: { all: ['esik:wait'] } },
  { id: 'the-list', seg: 'list', from: 0.25, to: 1.05, slot: 'rail', kind: 'narration', purpose: 'reveal', lines: ['Bir liste vardı. Mira hepsini tanıyordu.', 'Sonuncusu hariç.'], stagger: 0.45 },
  { id: 'who-watching', seg: 'watching', from: 0.15, to: 1.0, slot: 'center', kind: 'word', purpose: 'reveal', world: true, lines: ['WHO IS WATCHING?'], fade: 0.4 },
  { id: 'end', seg: 'end', from: 0.2, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['THE STORY DID NOT END.', 'YOU STOPPED LOOKING.'], sub: 'EŞİK', fade: 0.4, stagger: 0.2 },
]

export const TRANSCRIPT: Record<string, string> = {
  city: 'Mira gece boş bir şehirde yürür. Arabalar geçer, ışıklar yanar, kapılar açılır. Kimse ona bakmaz. Dikkatli bakan, herkesin aynı anda telefonuna baktığını fark eder.',
  window: 'Mira bir mağazanın önünden geçer ve camdaki yansımasına bakar. Yansıma bir an geç döner; bu yalnızca bir kez olur.',
  again: 'Mira köşeyi döner ve aynı sokağa çıkar. Bina numarası, park etmiş araba ve saat değişmiştir; hata mı gerçek mi, anlaşılmaz.',
  seen: 'Mira bir kafeye girer. Masadaki adam ona bakar; ilk kez biri Mira’yı görmüştür. “Sonunda.” “Beni tanıyor musun?” “Hayır. Ama sen bizi görüyorsun.”',
  glass: 'Adam Mira’yı büyük bir camın önüne götürür. Camın ardında aynı şehrin başka bir versiyonu vardır; başka bir camın ardında başka bir şehir.',
  observer: 'Adam: “Bir şeyi gözlemlediğinde onun var olduğunu düşünüyorsun. Peki seni kim gözlemliyor?” Arkaya bakıldığında hiçbir şey yoktur.',
  user: 'Tezgâhın arkasındaki eski bir terminalde sırayla şu kelimeler yazar: observer, subject, environment, user. Okur birini seçer; terminal kayıtlı olanı gösterir: kullanıcı için tek satır, şu an bakıyor. Mira: “User?”',
  reality: 'Mira dışarı çıkar. Şehir yerindedir; ama bakılmayan binalar değişir.',
  threshold: 'Sokağın sonunda üzerinde “do not open” yazan bir kapı vardır. Arkasından Mira’nın kendi sesi gelir: “Beni duyuyorsan kapıyı açma. Çünkü dışarı çıktığında artık sen olmayacaksın.”',
  door: 'Okur kapıyı açmayı ya da açmamayı seçer; açmazsa kapı yine de açılır. Kapının ardında STROLLY’nin hikâye listesi vardır; listenin sonuna yeni bir satır eklenir: user. Ekranda “who is watching?” yazar. Görüş yavaşça arkaya döner: Mira yoktur, yalnızca bir sandalye vardır. Sandalyenin üzerinde: thank you for observing. The story did not end. You stopped looking.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('walk', 0.1)],
  [at('watching'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'walk', at: 0.3, text: '[geçen bir araba]' },
  { seg: 'phones', at: 0.4, text: '[bütün telefonlarda aynı anda bir bildirim sesi]' },
  { seg: 'enter', at: 0.2, text: '[kafe kapısının zili]' },
  { seg: 'words', at: 0.05, text: '[terminal tuşları]' },
  { seg: 'voice', at: 0.04, text: "[kapının arkasından Mira'nın sesi]" },
  { seg: 'opens', at: 0.35, text: '[kapı açılır]' },
  { seg: 'turn', at: 0.1, text: '[sessizlik]' },
]

/** World positions match the set in src/three/esik/. */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'phones',
    title: 'Aynı anda telefonlar',
    seg: 'phones',
    from: 0,
    to: 1.2,
    pos: [-5.2, 1.5, -5],
    size: 1.2,
    kind: 'character',
    visibility: 'subtle',
  },
  {
    id: 'late-reflection',
    title: 'Geç dönen yansıma',
    seg: 'reflect',
    from: 0,
    to: 1,
    pos: [6.45, 1.5, -14],
    size: 1.2,
    kind: 'reflection',
    visibility: 'visible',
  },
  {
    id: 'number',
    title: 'Değişen kapı numarası',
    seg: 'same',
    from: 0,
    to: 1.3,
    pos: [6.45, 3.0, -6],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Kapı numarası: 32.'] },
  },
  {
    id: 'street-clock',
    title: 'Sokak saati',
    seg: 'same',
    from: 0,
    to: 1.3,
    pos: [4.5, 3.1, -11],
    size: 0.4,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['01:41'] },
  },
  {
    id: 'other-city',
    title: 'Camın ardındaki şehir',
    seg: 'versions',
    from: 0,
    to: 1.2,
    pos: [-14.4, 1.6, -33.5],
    size: 1.4,
    kind: 'environment',
    visibility: 'visible',
  },
  {
    id: 'empty-behind',
    title: 'Pencerenin ardındaki boşluk',
    seg: 'nothing',
    from: 0,
    to: 1.2,
    pos: [-6.6, 1.6, -31],
    size: 1.5,
    kind: 'environment',
    visibility: 'hidden',
  },
  {
    id: 'terminal',
    title: 'Eski terminal',
    seg: 'words',
    from: 0,
    to: 1.6,
    pos: [-8.5, 1.15, -35.3],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['OBSERVER', 'SUBJECT', 'ENVIRONMENT', 'USER'] },
  },
  {
    id: 'changed-building',
    title: 'Değişen bina',
    seg: 'shift',
    from: 0,
    to: 1,
    pos: [7.5, 4.0, -47],
    size: 3.0,
    kind: 'anomaly',
    visibility: 'visible',
  },
  {
    id: 'chair',
    title: 'Sandalyedeki not',
    seg: 'chair',
    from: 0,
    to: 1.15,
    pos: [0, 0.75, -61.2],
    size: 0.5,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['THANK YOU FOR OBSERVING.'] },
  },
]

/** A word typed into the old terminal, and the door marked DO NOT OPEN. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'word',
    seg: 'words',
    at: 0.45,
    style: 'query',
    title: 'TERMİNAL',
    prompt: 'Bir kelime seç.',
    options: [
      { id: 'observer', tag: '01', label: 'OBSERVER', reply: ['KAYITLI GÖZLEMCİ: 1', 'DURUM: BAKIYOR'], sets: ['word:observer'] },
      { id: 'subject', tag: '02', label: 'SUBJECT', reply: ['KAYITLI ÖZNE: MİRA', 'DURUM: GÖRÜLÜYOR'], sets: ['word:subject'] },
      { id: 'user', tag: '04', label: 'USER', reply: ['KAYITLI KULLANICI: —', 'DURUM: ŞU AN BAKIYOR'], sets: ['word:user'] },
    ],
  },
  {
    id: 'open',
    seg: 'around',
    at: 0.7,
    style: 'choice',
    title: 'DO NOT OPEN',
    prompt: 'Kapıyı açacak mısın?',
    options: [
      { id: 'open', label: 'Aç.', reply: ['Kol soğuktu.'], sets: ['esik:open'] },
      { id: 'wait', label: 'Açma.', reply: ['Bekledi.'], sets: ['esik:wait'] },
    ],
  },
]
