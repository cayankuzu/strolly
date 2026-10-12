/**
 * BEYİN-KÖKÜ / BRAINROOT — every word the reader sees.
 *
 * Professor Veyl keeps hundreds of bodies wired to personal worlds built from
 * their own memories. One of them, Levy A., has started to notice the half
 * second between what his body does and the reason his mind gives for it.
 * Veyl calls him in — slowly. The story never argues; it lets the reader's
 * own choices arrive late, exactly like Levy's.
 *
 * Voices: VEYL (tired, measured, never a villain in his own eyes), LEVY
 * (polite, careful, a man who explains himself to himself), BAYAN ELEN,
 * KADIN (a colleague in the cantina), GÖREVLİ / GÖREVLİLER (the Centre's
 * staff), HEMŞİRE (the same staff, seen for once), TEKNİSYEN, DENEKLER.
 *
 * Levy's thoughts — the reasons that arrive after the act — are quoted
 * narration, never captioned speech: “Zaten bunun için geldim.”
 * "Üç saniye." is the recurring cut: a centre flash, the real lab, then back.
 * Screen texts (file cards, the protocol, the notice, slogans, code, the log)
 * are `world` items: the set draws them; the DOM shows them only without WebGL.
 * Timings are fractions of a segment, set line by line against the shot list
 * in docs/stories/beyinkoku.md.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextKind, TextSegment } from '../types'
import { at, SEG, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>
/** A line of a scene: who says it (null = narration), the words, and anything special about it. */
type Line = readonly [who: string | null, text: string | readonly string[], extra?: Partial<T>]

const V = 'VEYL'
const L = 'LEVY'
const E = 'BAYAN ELEN'
const K = 'KADIN'
const G = 'GÖREVLİ'
const GS = 'GÖREVLİLER'
const H = 'HEMŞİRE'
const TK = 'TEKNİSYEN'
const D = 'DENEKLER'

const words = (t: string | readonly string[]) => (typeof t === 'string' ? t : t.join(' '))

/**
 * Fade and stagger for an item `screens` long with `count` lines: the fade
 * never eats more than a third of a short item, and a second line arrives
 * early enough to stay fully visible for a while before the item leaves.
 */
function timing(screens: number, count: number, base: number) {
  const fade = Math.min(base, screens / 3.2)
  if (count < 2) return { fade, stagger: undefined }
  const hold = Math.min(0.3, 0.4 * screens)
  const offset = Math.max(0.18 * screens, Math.min(0.42 * screens, (screens - 2 * fade - hold) / (count - 1)))
  return { fade, stagger: Math.round((offset / screens) * 100) / 100 }
}

/**
 * A run of lines inside [from, to] of one segment, one after another on the
 * rail. Time is shared by reading time (a floor for the shortest lines), so a
 * long sentence stays up longer than "— Hayır." without starving it; speakers
 * go to the caption above their line.
 */
function talk(id: string, seg: SegmentId, from: number, to: number, lines: Line[], extra: Partial<T> = {}): T[] {
  const weight = lines.map(([, t]) => Math.max(0.6, 0.18 + words(t).length / 112))
  const total = weight.reduce((s, w) => s + w, 0)
  const gap = Math.min(0.03, ((to - from) / lines.length) * 0.15)
  let a = from
  return lines.flatMap(([who, t, own], i): T[] => {
    const span = ((to - from) * weight[i]) / total
    const b = a + span - (i < lines.length - 1 ? gap : 0)
    const text = typeof t === 'string' ? [t] : [...t]
    const { fade, stagger } = timing((b - a) * SEG[seg].screens, text.length, who ? 0.18 : 0.24)
    const kind: TextKind = who ? 'dialogue' : 'narration'
    const line: T = {
      id: lines.length > 1 ? `${id}-${i + 1}` : id,
      seg,
      from: a,
      to: b,
      slot: 'rail',
      kind,
      purpose: who ? 'dialogue' : 'context',
      lines: text,
      fade,
      stagger,
      ...extra,
      ...own,
    }
    a += span
    if (!who) return [line]
    const caption: T = { id: `${line.id}-who`, seg, from: line.from, to: line.to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [who], fade, when: line.when }
    return [caption, line]
  })
}

/** Narration: one rail item, its lines arriving one after another. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => talk(id, seg, from, to, [[null, lines]], extra)[0]

/** One speaker, one line (or two). */
const say = (id: string, seg: SegmentId, from: number, to: number, who: string, text: string | string[], extra: Partial<T> = {}): T[] => talk(id, seg, from, to, [[who, text]], extra)

/** A line alone in the middle of the frame; its fade never eats more than a third of its time. */
const center = (id: string, seg: SegmentId, from: number, to: number, lines: string[], kind: TextKind = 'reveal', extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'center',
  kind,
  purpose: 'reveal',
  lines,
  fade: Math.min(0.3, ((to - Math.max(0, from)) * SEG[seg].screens) / 3.2),
  ...extra,
})

/** The cut to the real lab: the same short, hard flash every time. */
const flash = (id: string, seg: SegmentId, from: number, to: number): T => center(id, seg, from, to, ['Üç saniye.'], 'word', { purpose: 'turn', fade: 0.1 })

/** Words on an in-world screen or page: the set draws them (the DOM copy, without WebGL, fades like `center`). */
const screen = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'top',
  kind: 'system',
  purpose: 'system',
  lines,
  world: true,
  fade: Math.min(0.3, ((to - from) * SEG[seg].screens) / 3.2),
  ...extra,
})

const GREETING = '— Günaydın! Ve olur ya belki sizi göremem; iyi günler, iyi akşamlar ve iyi geceler!'

export const TEXT: T[] = [
  // 01 — LABORATUVAR
  { id: 'opening', seg: 'open', from: -1, to: 0.95, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Profesör Veyl’in laboratuvarında gece hiçbir zaman tam olarak bitmezdi.'], sub: 'SCROLL' },
  ...talk('atrium', 'atrium', 0.04, 0.98, [
    [null, ['Ortadaki devasa boşluk, kat kat yükselen metal balkonlarla çevriliydi.', 'Her katta yarı dik açıyla yerleştirilmiş istasyonlar, her istasyonda bir beden.']],
    [null, ['Başlar çerçevelere sabitlenmiş, şakaklardaki eski izler açılmıştı.', 'Beyinler ne tam içerideydi ne tam dışarıda: bedenden koparılmadan sıvı kanallarına bağlanmıştı.']],
  ]),
  ...talk('worlds', 'worlds', 0.03, 0.98, [
    [null, ['Her bedenin yanındaki küçük ekranda başka bir dünya akıyordu.', 'Verandasında kahvesini içen yaşlı bir adam. Yağmurun altında gülümseyen bir başkası.']],
    [null, ['Aynı dünyada değillerdi. Her biri kendi anılarından kurulmuş bir evrendeydi.', 'Veyl bunlara “cennet” demiyordu. Ama cennet gibi kuruyordu.']],
  ]),
  ...talk('god', 'god', 0.03, 0.98, [
    [null, ['Veyl bu dünyaların tanrısıydı. Bunu yüksek sesle söylemezdi.', 'Ama gökyüzünün ne kadar mavi olacağını, komşunun ne zaman gülümseyeceğini o belirlerdi.']],
    [null, ['İsterse içeri girebilirdi. Çoğu zaman girmezdi.', 'Sahneyi kurar, ışığı ayarlar, sonra onların kendi kararlarını verdiklerini sanmalarını izlerdi.']],
  ]),
  tell('interface', 'file', 0.03, 0.62, ['Başındaki nöro-arayüz onu simülasyona sokmuyordu.', 'Yalnızca karar ile gerekçe arasındaki o küçücük boşluğu yakalamasına yardım ediyordu.']),
  screen('file-card', 'file', 0.45, 1.12, [
    'DENEK: LEVY A.',
    'KİŞİSEL EVREN: BANLİYÖ / ARŞİV YAŞAMI / DÜŞÜK ÇATIŞMA ORTAMI',
    'PERDE DİRENCİ: ARTIYOR',
    'HAFIZA EŞLEME: KISMİ UYUMSUZLUK',
    'GEREKÇE KATMANI: GECİKMELİ',
    'YARDIM PROTOKOLÜ: HENÜZ AKTİF DEĞİL',
  ]),
  screen('brain-map', 'brainmap', 0.2, 1.0, ['HAREKET NİYETİ', 'GEREKÇE', 'GECİKME: 0,48 SN']),
  tell('gap', 'brainmap', 0.04, 0.96, ['Hareket niyeti yükseliyor, ardından gerekçe geliyordu.', 'Levy’de aradaki boşluk açılmaya başlamıştı. Bazen açıklama yarım saniye geç kalıyordu.'], { purpose: 'foreshadow' }),

  // 02 — PROTOKOL
  screen('notebook-page', 'notebook', 0.05, 1.0, ['Bilinç perdesi', 'Beyin uykusu', 'Gerekçe katmanı', 'Özbenlik savunması', 'Yardım protokolü', 'Yumuşak kaldırma', 'Geri aktarım', 'İkna']),
  ...talk('notebook', 'notebook', 0.04, 0.97, [
    [null, ['Veyl defterini açtı. Aynı kavramlar sayfalar boyunca tekrar ediyordu.', 'Kalemi eline aldı. Bir şey yazmadı.']],
    [V, '— Başlamış.'],
  ]),
  tell('protocol-open', 'protocol', 0.03, 0.3, ['Sonra bilgisayarda bir protokol açtı.']),
  screen('protocol', 'protocol', 0.12, 1.0, [
    'BRAINROOT / UYUM ÇAĞRISI',
    'Aşama 1: Gecikmiş randevu bildirimi',
    'Aşama 2: Kırmızı güzergâh yönlendirmesi',
    'Aşama 3: Yardım protokolü kontrollü temas',
    'Aşama 4: Perde çatlağı',
    'Aşama 5: Gerekçe katmanı gözlemi',
    'Aşama 6: Hafıza temizleme ve geri salım',
  ]),
  ...talk('slower', 'slower', 0.03, 0.97, [
    [V, '— Daha yavaş.'],
    [null, 'Enter tuşuna basmadan önce gözlerini kapattı.'],
    [V, '— Bu kez daha yavaş.'],
  ]),
  tell('press', 'press', 0.08, 0.9, ['Tuşa bastı.'], { strong: true, purpose: 'turn' }),

  // 03 — PAZARTESİ
  ...talk('wake', 'wake', 0.03, 0.98, [
    [null, ['Levy pazartesi sabahı odasına yayılan yumuşak ışıkla uyandı.', 'Perdeler gün doğmadan birkaç dakika önce kendiliğinden aralanmıştı.']],
    [null, 'Su dolu bardak, ütülü gömlek, terlikler: her şey yerli yerindeydi.'],
  ]),
  screen('weather', 'wake', 0.5, 1.4, ['AÇIK. ILIK. DENGELİ.']),
  tell('filed', 'filed', 0.04, 0.96, ['Bu şehirde insanlar üzülür ama çökmeyecek kadar üzülürdü.', 'Dünya, insanın canını yakabilecek şeylerin kenarları törpülenmiş gibi duruyordu.'], { purpose: 'mood' }),
  ...talk('mirror', 'mirror', 0.03, 0.99, [
    [null, ['Aynada saçlarını kaldırınca başındaki ince halka izini gördü.', 'Şakaklarından geçip başını sarıyordu. Soluktu. Temizdi. Herkeste vardı.']],
    [null, 'Parmağını izin üzerinden geçirdi. Bir an soğuk bir çizgi hissetti. Sonra geçti.'],
    [L, '— Bugün işe geç kalmamalıyım.'],
  ]),
  ...talk('elen', 'elen', 0.02, 0.98, [
    [null, 'Kahvesini içip verandaya çıktı. Karşı bahçede Bayan Elen çiçeklerini suluyordu.'],
    [L, GREETING],
    [E, '— Her zamanki gibisin, Levy.'],
  ]),
  tell('film', 'film', 0.04, 0.96, ['Levy de güldü. Bu cümleyi neden sevdiğini bilmiyordu.', 'Sanki eski bir yerden geliyordu. Belki bir filmden. Belki çocukluğundan.'], { purpose: 'foreshadow' }),
  tell('suburb', 'busstop', 0.03, 0.97, ['Banliyö kusursuzdu. Hiçbir şey acele etmiyordu.', 'Duraktaki ekranda gülümseyen bir aile vardı. Hepsinin başında aynı halka izi.']),
  screen('psa', 'busstop', 0.35, 1.0, ['Düzenli perde kontrolleri, sağlıklı bir iç yaşamın temelidir.']),
  tell('archive', 'archive', 0.03, 0.56, ['İşi şehir arşivlerinin alt katındaydı. Pazartesi sıradan geçti.', 'Yalnızca öğleden sonra ekran bir anlığına karardı.']),
  screen('glitch-box', 'archive', 0.54, 0.74, ['BRAINROOT / AKTARIM / DENEK L—'], { kind: 'alert' }),
  ...say('archive-error', 'archive', 0.74, 0.98, L, '— Arşiv hatası.'),

  // 04 — SALI
  tell('same-light', 'sameLight', 0.04, 0.96, ['Salı sabahı yine aynı ışık. Aynadaki iz biraz daha koyu görünüyordu.', 'Işıktandır, diye düşündü.']),
  ...say('again-hello', 'again', 0.02, 0.2, L, '— Günaydın! Ve olur ya belki sizi göremem…'),
  ...talk('again', 'again', 0.22, 0.99, [
    [E, '— Her zamanki gibisin, Levy.'],
    [null, 'Bu defa cümle biraz daha önceden duyulmuş gibi geldi. Levy durdu, sonra gülümsedi.', { purpose: 'turn' }],
    [L, '— İnsan bazı şeyleri alışkanlık yapıyor.'],
  ]),
  tell('boy', 'bus', 0.04, 0.96, ['Otobüste karşısındaki çocuğun halka izi yeniydi; çevresi hâlâ pembeydi.', 'Levy bakışını camdan dışarı çevirdi.'], { purpose: 'foreshadow' }),
  ...talk('wave', 'wave', 0.03, 0.98, [
    [null, ['Öğle arasında kantinde herkes bir an pencereye döndü.', 'Önce uzak masadaki adam. Sonra yanındaki kadın. Sonra diğerleri.']],
    [null, ['Levy de baktı. Dışarıda hiçbir şey yoktu.', 'Herkes konuşmasına döndü. Levy’nin çatalı havada kaldı.']],
  ]),
  ...talk('why', 'why', 0.02, 0.98, [
    [L, '— Bir şey mi oldu? Dışarı baktınız.'],
    [K, ['— Bakmışımdır.', '— Bazen insan bir şeye bakar ama neden baktığını bilmez.']],
    [L, '— Evet. Olur.'],
  ]),
  tell('tv', 'tv', 0.03, 0.6, ['O akşam televizyonda Profesör Veyl vardı. Onu herkes tanırdı:', 'Bilişsel Stabilizasyon sisteminin kurucusu. Yüzü sakindi, sesi ölçülüydü.']),
  screen('tv-crawl', 'tv', 0.3, 1.5, ['PROF. DR. VEYL: “PERDE, BİLİNCİN DÜŞMANI DEĞİL; DENGESİDİR.”']),
  tell('remote', 'remote', 0.36, 0.97, ['Bir an sonra kumandanın elinde olduğunu fark etti.', 'Parmağı ses azaltma tuşuna basmıştı bile.'], { purpose: 'turn' }),
  center('want-lower', 'thought', 0.03, 0.42, ['“Sesi kısmak istedim.”']),
  tell('came-late', 'thought', 0.46, 0.97, ['Cümle içinden geçti.', 'Ama biraz geç geldi.'], { strong: true, purpose: 'reveal', when: { none: ['tv:channel'] } }),
  tell('came-late-channel', 'thought', 0.46, 0.97, ['Cümle içinden geçti. Ama biraz geç geldi.', 'Kanalı değiştirmek istediğini artık hatırlamıyordu.'], { strong: true, purpose: 'reveal', when: { all: ['tv:channel'] } }),

  // 05 — ÇARŞAMBA
  ...talk('bell', 'bell', 0.03, 0.98, [
    [null, 'Çarşamba sabahı kapı ziliyle uyandı. Perdeler henüz açılmamıştı.'],
    [null, ['Verandada kimse yoktu. Yerde küçük beyaz bir zarf duruyordu.', 'Üzerinde yalnızca adı yazılıydı: LEVY A.']],
  ]),
  tell('opened', 'letter', 0.02, 0.24, ['Zarfı mutfak masasında açtı.']),
  screen('notice', 'letter', 0.2, 1.03, [
    'BİLİŞSEL STABİLİZASYON MERKEZİ',
    'Perde Uyum Kontrolü — Kaçırılmış Randevu Bildirimi',
    'Ad: Levy A.',
    'Randevu tarihi: Geçen hafta çarşamba',
    'Durum: Katılım sağlanmadı',
    'Yeni çağrı: Bugün, 09.30',
    'Kat: 3',
    'Birim: Uyanış Sonrası Adaptasyon',
    'Not: Randevunuz bir hafta önce gerçekleşmeliydi. Gecikme, uyumsuzluk belirtisi sayılır. Lütfen bugün merkeze başvurunuz. Aksi durumda alışılmadık yöntemlere başvurulacaktır.',
  ]),
  tell('last-week', 'letter', 0.6, 0.98, ['Geçen hafta çarşamba ne yemişti? Eve kaçta dönmüştü?', 'Cevaplar vardı ama yerlerine oturmuyordu.']),
  screen('calendar-entry', 'calendar', 0.04, 0.6, ['GEÇEN ÇARŞAMBA · 09.30', 'PERDE UYUM KONTROLÜ · KAT 3', 'EKLEYEN: LEVY A.']),
  ...talk('calendar', 'calendar', 0.03, 0.98, [
    [null, 'Telefonundaki takvimde randevu gerçekten kayıtlıydı. Kendi hesabından eklenmişti.'],
    [L, '— Unutmuşum.'],
    [null, 'Rahatlamayı bekledi. Rahatlamadı.', { purpose: 'turn' }],
  ]),
  screen('kitchen-clock', 'heavy', 0.0, 0.5, ['08.14']),
  tell('heavier', 'heavy', 0.03, 0.38, ['Saat 08.14’tü. Arşivde dosyalar vardı. Ama zarf masadaydı.', 'Son satır, her şeyden daha ağır görünüyordu.']),
  center('last-line', 'heavy', 0.41, 0.72, ['Aksi durumda alışılmadık yöntemlere başvurulacaktır.']),
  tell('centre-first', 'heavy', 0.75, 0.98, ['Ayağa kalktı. “Önce merkeze giderim.”'], { purpose: 'turn' }),
  ...talk('shoes', 'shoes', 0.04, 0.96, [
    [null, 'Ayakkabılarını giydi. “Zaten gecikmişim.”'],
    [null, 'Bu cümle daha iyi çalıştı.', { strong: true, purpose: 'turn' }],
  ]),
  tell('absence', 'empty', 0.05, 0.96, ['Bayan Elen’in verandası boştu. Sulama kabı oradaydı; toprak ıslaktı.', 'Yokluğu, varlığından daha belirgin görünüyordu.'], { purpose: 'mood' }),

  // 06 — MERKEZ
  tell('cleanest', 'garden', 0.03, 0.62, ['Merkez şehrin en temiz bölgesindeydi; bir sağlık kurumundan çok bir huzur parkına benziyordu.', 'Kimse hasta görünmüyordu. Kimse korkmuş gibi değildi.']),
  screen('sign', 'garden', 0.45, 1.0, ['BİLİŞSEL STABİLİZASYON MERKEZİ', 'Kendinizi yeniden duymak için.']),
  tell('boards', 'boards', 0.03, 0.28, ['İçeri girmeden önce panolara baktı.']),
  screen('board-text', 'boards', 0.1, 1.0, [
    'Perde nedir?',
    'Perde, içsel düzeninizi koruyan doğal bilişsel uyum katmanıdır. Düzenli kontroller; karar berraklığı, hafıza bütünlüğü ve benlik huzuru için gereklidir.',
    'Uyum gecikmeleri nelerdir?',
    'Dalgınlık, gereksiz iç sorgulama, tanıdık anlarda yabancılık hissi, karar sonrası huzursuzluk, rüya kalıntıları, tekrar algısı.',
  ]),
  tell('stopped', 'boards', 0.7, 0.98, ['“Karar sonrası huzursuzluk” satırında durdu.']),
  tell('walking', 'walking', 0.04, 0.96, ['“Geç kalıyorum.”', 'Bunu fark ettiğinde binaya doğru yürümeye başlamıştı.'], { strong: true, purpose: 'turn' }),
  ...talk('hall', 'hall', 0.02, 0.98, [
    [null, 'İçerisi geniş ve sakindi. Herkesin başında aynı halka izi vardı.'],
    [G, '— Levy A. Geç kalmış perde uyum kontrolü. Üçüncü kat, Uyanış Sonrası Adaptasyon Birimi.'],
    [null, 'Levy zarfı uzattı. Kadın zarfa bakmadı.'],
  ]),
  ...talk('floor', 'floor', 0.02, 0.98, [
    [G, '— Lütfen kırmızı yolu takip edin.'],
    [null, ['Zeminde iki çizgi vardı. Mavi olanı çıkışa ve bekleme alanlarına gidiyordu.', 'Kırmızı olanı salonu geçip sağdaki aralık merdiven kapısında bitiyordu.']],
    [L, '— Mavi yol çıkış mı?'],
    [G, '— Kırmızı yolu takip edin, lütfen.'],
  ]),
  tell('glass', 'choose', 0.03, 0.6, ['Levy mavi çizgiye baktı. Cam kapının ardında bahçe görünüyordu.', 'Birkaç adımda dışarı çıkabilirdi.']),

  // 07 — KIRMIZI ÇİZGİ
  tell('on-red', 'step', 0.04, 0.38, ['Bir an sonra kırmızı çizgide yürüyordu.'], { purpose: 'turn' }),
  center('came-for', 'step', 0.42, 0.96, ['“Zaten bunun için geldim.”']),
  ...talk('eyes', 'eyes', 0.03, 0.98, [
    [null, ['Salondaki uğultu azaldı. Önce danışmadaki kadının gözleri Levy’ye döndü.', 'Sonra kahve makinesinin önündeki adamın. Sonra hepsinin.']],
    [null, ['Levy durdu. İnsanlar da durdu.', 'Bir ayak havada kaldı. Bir form yarım katlı bekledi. Bir bardaktan kahve taştı.']],
  ]),
  ...talk('run', 'run', 0.03, 0.98, [
    [null, 'Levy yeniden yürüdü. Onlar da yürüdü. Önce yavaş. Sonra daha hızlı.'],
    [null, ['“Merdivene gitmem gerekiyor.”', 'Bunu düşündüğünde koşmaya başlamıştı.'], { strong: true, purpose: 'turn' }],
  ]),
  ...talk('silence', 'silence', 0.04, 0.96, [
    [null, ['Merdiven kapısını itip içeri girdi, kapıyı arkasından kapattı.', 'Sessizlik. Ne ayak sesi vardı ne bağırış.']],
    [null, ['Kapının koluna uzandı. Açmaması gerektiğini düşündü.', 'Kapıyı açtı.']],
  ]),
  ...talk('normal', 'normal', 0.03, 0.97, [
    [null, 'Salon normaldi. İnsanlar eski yerlerindeydi. Kimse ona bakmıyordu.'],
    [G, '— Bir sorun mu oldu?'],
    [L, '— Hayır.'],
  ]),
  tell('upstairs', 'upstairs', 0.03, 0.4, ['Merdiven yalnızca ikinci kata çıkıyordu.', 'Kırmızı çizgi basamaklardan yukarı devam ediyordu.']),
  center('second-floor', 'upstairs', 0.43, 0.74, ['“Önce ikinci kat.”']),
  tell('after-step', 'upstairs', 0.77, 0.98, ['Bu düşünce adımından sonra geldi.'], { strong: true, purpose: 'turn' }),

  // 08 — İKİNCİ KAT
  tell('quieter', 'slogans', 0.03, 0.38, ['İkinci kat daha sessizdi. Duvarlarda sakinleştirici cümleler vardı.']),
  screen('slogans', 'slogans', 0.05, 1.0, ['Düşünce geçer. Düzen kalır.', 'Perde sizi korur.', 'İç sesiniz her zaman size ait olmak zorunda değildir.', 'Uyum, özgürlükten önce gelir.']),
  tell('own-voice', 'slogans', 0.5, 0.98, ['Levy sonuncunun önünde durdu, içinden okudu: “Uyum, özgürlükten önce gelir.”', 'Cümle, kendi sesiyle söylenmiş gibi gelmedi.']),
  ...talk('staff', 'staff', 0.03, 0.98, [
    [null, 'Koridorun sonunda iki görevli belirdi. Ellerinde kaleme benzeyen küçük cihazlar vardı.'],
    [G, ['— Levy A., lütfen durunuz.', '— Uyum kontrolünüz tamamlanmadı. Lütfen bizimle geliniz.']],
  ]),
  ...talk('flicker', 'flicker', 0.03, 0.98, [
    [null, ['Levy birkaç adım attı. Her şey normaldi.', 'Bir adım daha attı. Işık titredi.']],
    [null, ['Kadının yüzü uzadı, gözleri siyaha döndü; başındaki halka izi yarıldı.', 'Adamın elindeki cihaz ince, uzun, siyah bir iğneye dönüştü.'], { purpose: 'turn' }],
  ]),
  tell('smell', 'cut', 0.03, 0.5, ['Dezenfektan kokusu çürük et ve yanmış plastik kokusuna karıştı.', 'Sesleri parçalandı.']),
  center('dur', 'cut', 0.53, 0.98, ['Dur.', 'Aç.', 'Tut.', 'Kes.'], 'word', { stagger: 0.18, purpose: 'turn', fade: 0.08 }),
  flash('three-1', 'lab1', 0.02, 0.2),
  tell('elsewhere', 'lab1', 0.23, 0.67, ['Başka bir yer. Soğuk beyaz bir laboratuvar. Metal bir sandalye.', 'Bilekleri bağlı bir beden. Kafatasını çevreleyen metal bir halka.']),
  ...say('fix-fear', 'lab1', 0.7, 0.98, V, '— Görsel eşleşme bozuldu. Korkuyu düşürme, sadece sabitle.'),
  ...talk('chase', 'chase', 0.02, 0.98, [
    [null, 'Sonra yeniden koridor. Görevliler normaldi.'],
    [G, '— Size yardım etmek istiyoruz.'],
    [null, ['Levy koştu. Arkasında sesler birbirine karıştı:', '“Kesiyi genişlet.” “Size zarar vermeyeceğiz.” “Baş sabitlenecek.”'], { purpose: 'turn' }],
  ]),
  ...talk('room', 'room', 0.03, 0.98, [
    [null, ['Bir odaya girip kapıyı kapattı. Hoparlörlerden düşük bir uğultu geliyordu.', 'Uğultu kulağına değil, kemiklerine dokunuyordu.']],
    [null, ['Elini kapıya uzattı. Eli geç kaldı; sanki başka birinden izin bekliyordu.', 'Kapı koluna dokunduğu anda bileklerinde kelepçe soğuğu hissetti.']],
  ]),
  flash('three-2', 'lab2', 0.02, 0.23),
  tell('strapped', 'lab2', 0.26, 0.6, ['Gerçek laboratuvar. Levy sandalyeye bağlıydı; başındaki halka açıktı.']),
  screen('resistance', 'lab2', 0.3, 1.0, ['subject_resistance.high', 'justification_layer.delay: 0.8 sec'], { kind: 'alert' }),
  ...say('delay', 'lab2', 0.63, 0.98, V, '— Gerekçeyi geciktirme. Panikler.'),
  tell('zoned', 'zoned', 0.04, 0.96, ['Sonra yeniden oda. “Dalmışım.” Bu açıklama yetmedi.', '“Uğultu yüzünden.” Bu biraz daha iyi geldi.'], { purpose: 'turn' }),
  tell('code', 'code', 0.04, 0.7, ['Koridora çıktığında duvardaki afişler bir an kod satırlarına dönüştü.']),
  screen('code-lines', 'code', 0.2, 0.82, ['route_redline.active', 'fear_response.unstable', 'help_protocol_misread', 'memory_patch.loop_03'], { kind: 'alert' }),
  screen('code-calm', 'code', 0.82, 1.0, ['Perde sizi korur.']),
  ...talk('terminals', 'terminals', 0.02, 0.98, [
    [null, ['Koridorun sonunda bir merdiven kapısı ve üç terminal vardı.', 'İlk ekranda kendi yüzü belirdi. Adının altında: DENEK 31. Ekran karardı. “Hata.”'], { purpose: 'reveal' }],
    [null, ['İkinci terminal kendiliğinden açıldı. En alttaki satır:', '“Yardım protokolü tehdit olarak yorumlanıyor.” Levy okumayı bitiremeden ekran bozuldu.']],
  ]),
  screen('terminal-1', 'terminals', 0.22, 0.47, ['PERSONEL ONAYI', 'LEVY A.', 'DENEK 31']),
  screen('terminal-2', 'terminals', 0.5, 1.0, ['PERDE UYUM ÖLÇÜMÜ', 'Direnç yüksek.', 'Algı bütünlüğü parçalı.', 'Yardım protokolü tehdit olarak yorumlanıyor.']),
  screen('terminal-3', 'voice', 0.0, 1.0, ['HAFIZA EŞLEME KAYDI']),
  tell('voice', 'voice', 0.04, 0.96, ['Üçüncü terminalden kendi sesi geldi: “Kapıya gitme.”', 'Sonra yine kendi sesi, daha kısık: “Gittin zaten.”'], { purpose: 'reveal' }),
  ...talk('swarm', 'swarm', 0.03, 0.98, [
    [null, ['Görevliler dönmüştü; bu kez koridorun iki ucundan geliyorlardı.', 'Işık titredi. Yüzleri birbirine karıştı.']],
    [GS, ['— Levy A. Lütfen bizimle geliniz.', '— Tut. Sakinleştir. Bağla. Kes. Geri al.']],
  ]),
  ...talk('nurse', 'nurse', 0.03, 0.98, [
    [null, ['Merdiven kapısı açılmadı. Bir el omzuna değdi.', 'Önce yaratık yüzü. Sonra gerçek yüz: korkmuş, üzgün, yorgun bir hemşire.'], { purpose: 'reveal' }],
    [H, '— Lütfen.'],
    [null, 'Yüz yeniden bozuldu. Levy bağırdı. Boynuna bir iğne girdi.'],
  ]),
  ...talk('fade', 'fade', 0.04, 0.98, [
    [null, 'Koku değişti: alkol, steril pamuk, soğuk metal. Sesler uzadı. Koridor eğildi.'],
    [null, 'Son gördüğü şey, kırmızı çizginin kapının altından sızıp karanlıkta kaybolmasıydı.', { strong: true, purpose: 'mood' }],
  ]),

  // 09 — SEDYE
  tell('upright', 'stretcher', 0.04, 0.95, ['Levy gözlerini açtığında dikey bir sedyeye bağlıydı. Karşısında Profesör Veyl duruyordu.', 'Ama aynı anda başka bir şey daha görüyordu.']),
  flash('three-3', 'lab3', 0.02, 0.21),
  tell('real-room', 'lab3', 0.24, 0.52, ['Gerçek oda. Sandalye. Bileklerde metal halkalar. Açık kesiler.']),
  ...say('acceptable', 'lab3', 0.55, 0.98, V, '— Uyanış imgesi sedye olarak kurulmuş. Bırakın. Onun için daha kabul edilebilir.'),
  ...talk('veyl', 'veyl', 0.03, 0.98, [
    [null, 'Sonra yeniden sedye. Veyl, televizyondakinden çok daha yorgundu; önlüğü lekeliydi.'],
    [V, '— Levy. Şimdi dinlemen gerekiyor.'],
    [L, '— Ne… oluyor?'],
  ]),
  ...talk('libet', 'libet', 0.02, 0.98, [
    [V, '— Libet deneyini biliyor musun?'],
    [V, ['— Deneklerden, istedikleri bir anda bileklerini oynatmaları istendi. Bu sırada beyinleri ölçülüyordu.', '— Karar verdikleri anı da karşılarında dönen bir kadrana bakarak bildirdiler.']],
  ]),
  ...talk('marks', 'marks', 0.02, 0.98, [
    [V, '— Birinci işaret: hazırlık potansiyeli. Hareketten önce yükselmeye başlıyor.'],
    [V, ['— İkinci işaret: deneğin “şimdi karar verdim” dediği an.', '— Üçüncü işaret: hareket.']],
    [null, 'Çizgiler yakındı. Ama aynı değildi.', { purpose: 'turn' }],
  ]),
  ...talk('crack', 'crack', 0.02, 0.98, [
    [V, ['— Bu deney tek başına özgür iradeyi yok saymak için yeterli değil.', '— Ama küçük bir çatlak açar.']],
    [V, ['— Bilinç, kararın doğduğu yer olmayabilir. Beyin hazırlanır. Bilinç sonra gelir.', '— Sonra da başlamış olan şeyi sahiplenir.']],
  ]),
  flash('three-4', 'lab4', 0.02, 0.23),
  ...talk('motor', 'lab4', 0.26, 0.98, [
    [null, 'Gerçek laboratuvar. Veyl kontrol masasındaydı.'],
    [TK, '— Motor niyet yine önce geldi.'],
    [V, '— Gerekçe katmanını yumuşat. Kendi kararı sanması gerekiyor.'],
  ]),
  ...talk('fingers', 'fingers', 0.02, 0.98, [
    [null, ['Sonra yeniden sedye. İkinci kayıtta deneklerin parmakları dışarıdan verilen uyarılarla oynuyordu.', 'Denekler bunun farkında değildi. Onlara yalnızca parmaklarını neden oynattıkları soruldu.']],
    [D, ['— Kaşındı. — Ben oynattım. — Rahatsız oldum.', '— Öylesine. — Masaya dokunmak istedim.']],
  ]),
  ...say('not-lying', 'narrator', 0.03, 0.4, V, '— Bu insanlar yalan söylemiyor. Bunu anlaman gerekiyor.'),
  center('narrator', 'narrator', 0.44, 0.98, ['Bilinç bazen olayların başlangıcı değil, anlatıcısıdır.'], 'reveal', { strong: true }),
  ...talk('cover', 'cover', 0.02, 0.98, [
    [V, ['— Bir hareket sahipsiz kalmasın diye üzerine bir neden örter.', '— Nedenin doğru olması gerekmez. Kişiyi dağılmaktan koruyacak kadar tutarlı olması yeterlidir.']],
    [null, ['Levy kırmızı çizgiye bastığı anı hatırladı. Mavi çizgi çıkışa gidiyordu. Ama o kırmızıya basmıştı.', 'Sonra içinden o cümle geçmişti: “Zaten bunun için geldim.”'], { purpose: 'reveal' }],
  ]),

  // 10 — PERDE
  tell('third', 'third', 0.03, 0.58, ['Üçüncü kayıt: aynı oda, aynı ışık, dört farklı denek.', 'Biri gölgeden korkuyor, biri rahat oturuyor, biri tiksintiyle yüzünü buruşturuyor, biri sebepsizce gülümsüyordu.']),
  ...say('stimulus', 'third', 0.61, 0.98, V, '— Oda değişmedi. Değişen, beyne verdiğimiz uyarılardı.'),
  screen('notes', 'third', 0.62, 1.5, ['Ortam sabit.', 'Yorum değişken.', 'Dış neden üretimi: başarılı.']),
  ...talk('layer', 'layer', 0.02, 0.98, [
    [V, ['— İnsan dünyayı olduğu gibi yaşamaz.', '— Dünya ile bedeni arasındaki yorum katmanını yaşar.']],
    [null, ['Levy’nin burnuna kokular karıştı: alkol, yanık plastik, çürümüş et, sabun, kan.', 'Sonra hepsi kayboldu.']],
  ]),
  ...talk('schema', 'schema', 0.02, 0.98, [
    [V, ['— Bilinç kötü bir şey olarak doğmadı. Beyin, bedeni yönetmek için bir arayüz üretti.', '— Bilinç yardımcıydı. Bir yansıma.']],
    [V, ['— Sonra yansıma büyüdü. Beyin, kendi yansımasının arkasında kaldı.', '— Konak kendini efendi sandı. Beyin uyudu. Köreldi. Kendi ürettiği perdeyi dünya zannetti.'], { purpose: 'reveal' }],
  ]),
  ...talk('want', 'want', 0.02, 0.98, [
    [L, '— Sen… ne istiyorsun?'],
    [V, ['— Bilinci yok etmek istemiyorum. Bilinç kilit. Koruma. Perde.', '— Ama artık o kadar kalın ki arkasındaki beyin doğrudan uyanamıyor.']],
  ]),
  tell('distort', 'face', 0.03, 0.3, ['Bir an Veyl’in yüzü bozuldu. Gözleri karardı. Başındaki iz açıldı.']),
  flash('three-5', 'face', 0.32, 0.51),
  center('not-you', 'face', 0.54, 0.98, ['Sen karar vermiyorsun.'], 'reveal', { fade: 0.3, strong: true }),
  ...talk('panic', 'panic', 0.03, 0.97, [
    [null, 'Sonra yine yorgun, yaşlı bir adamdı.'],
    [V, ['— Perdeyi bir anda kaldırmaya çalıştığımda beyin panikliyor. Yeni hikâyeler örüyor.', '— Yardım edeni tehdit olarak görüyor. Doktoru cellat, sedasyonu zehir, kapıyı tuzak, kırmızı çizgiyi kader sanıyor.']],
  ]),
  ...say('bring', 'bring', 0.05, 0.95, V, '— Onlar seni öldürmeye çalışmadı. Seni buraya getirmeye çalıştı.', { purpose: 'reveal' }),
  ...talk('heavens', 'heavens', 0.02, 0.98, [
    [V, ['— Herkes kendi cennetinde yaşar. Acıyı azaltırım, düzeni kurarım. Sonra çatlakları açarım.', '— Belki bir cennet. Belki bir ameliyathane. Belki ikisi de.']],
    [V, '— Ben tanrı olmak istemedim.'],
    [V, '— Fakat bir dünyayı kurup herkesin neden gülümsediğini ayarlamaya başladığında, bu cümlenin anlamı değişiyor.'],
  ]),
  tell('hands', 'hands', 0.05, 0.95, ['Levy ellerine baktı. Eller bazen sedyeye bağlıydı. Bazen sandalyeye.', 'Bazen hiç yoktu.'], { purpose: 'mood' }),
  ...say('kitchen', 'kitchen', 0.03, 0.97, V, ['— Görme merkezine sinyal verildiğinde pencere görüyor. İşitsel alana desen gönderildiğinde kuş sesi duyuyor.', '— Ve ona sorarsan, kahvesini içmeyi kendisi seçti.']),
  tell('replay', 'log', 0.02, 0.24, ['Ekranda Levy’nin pazartesi sabahı açıldı.']),
  screen('log-screen', 'log', 0.15, 1.5, [
    'motor impulse: volume_down',
    'generated justification: “Sesi kısmak istedim.”',
    'motor impulse: red_line_step',
    'generated justification: “Zaten bunun için geldim.”',
    'motor impulse: open_stair_door',
    'generated justification: “Bir sorun yok.”',
    'fear response: high',
    'generated justification: “Bana yardım etmiyorlar.”',
    'avoidance impulse: blue_line_exit',
    'override: red_line_priority',
    'generated justification: “Geç kalmışım.”',
  ]),
  ...talk('log', 'log', 0.27, 0.98, [
    [null, ['motor impulse: red_line_step', 'generated justification: “Zaten bunun için geldim.”']],
    [null, ['avoidance impulse: blue_line_exit · override: red_line_priority', 'generated justification: “Geç kalmışım.”']],
  ], { kind: 'machine', purpose: 'system' }),
  tell('yours', 'yours', 0.03, 0.5, ['Bunlar onun cümleleriydi.', 'Kendini sakinleştirmek için kullandığı, kendi sesi sandığı cümleler.'], { purpose: 'reveal' }),
  tell('chose-blue', 'yours', 0.54, 0.97, ['Maviyi seçmiştin.', 'Ayağın kırmızıdaydı.'], { strong: true, purpose: 'reveal', when: { all: ['line:blue'] } }),
  tell('chose-red', 'yours', 0.54, 0.97, ['Kırmızıyı seçmiştin.', 'Ayağın oraya senden önce varmıştı.'], { strong: true, purpose: 'reveal', when: { all: ['line:red'] } }),
  ...say('not-fake', 'terrible', 0.03, 0.42, V, '— Dünya sahte olduğu için korkmuyorsun, Levy. Asıl korkunç olan o değil.'),
  center('terrible', 'terrible', 0.46, 0.98, ['Asıl korkunç olan, dünyaya verdiğin anlamın da sana ait olmayabileceği.'], 'reveal', { strong: true }),
  flash('three-6', 'lab5', 0.02, 0.23),
  ...talk('wipe', 'lab5', 0.26, 0.98, [
    [null, 'Gerçek laboratuvar. Veyl kontrol masasından konuşuyordu.'],
    [V, ['— Stabil. Şimdi hafıza temizleme aşamasına hazırlanıyoruz.', '— Korkma, Levy. İşlem bittiğinde gördüğün çatlakları hatırlamayacaksın.']],
  ]),
  ...talk('real', 'real', 0.02, 0.98, [
    [null, 'Sonra yeniden sedye. Veyl artık karşısındaydı.'],
    [V, '— İşlem neredeyse tamamlandı. Merkezden çıkacak, işine gidecek, gününe devam edeceksin.'],
    [L, '— Ya… gerçek?'],
    [null, 'Veyl uzun süre cevap vermedi.'],
  ]),
  center('sustain', 'white', 0.03, 0.52, ['“Gerçek, sürdürebildiğin şeydir.”'], 'reveal', { strong: true }),
  tell('white', 'white', 0.56, 0.97, ['Ekranlar tek tek kapandı. Oda beyazlaştı.', 'Sesler uzaklaştı.'], { purpose: 'mood' }),

  // 11 — GERİ SALIM
  tell('third-floor', 'smallroom', 0.03, 0.52, ['Levy gözlerini açtığında merkezin üçüncü katında, küçük bir odadaydı.', 'Çiçek kokusu vardı. Şakaklarındaki iz biraz sızlıyordu; tanıdık bir sızı.']),
  ...talk('done', 'smallroom', 0.55, 0.98, [
    [G, '— İşleminiz tamamlandı, Levy A.'],
    [L, '— Bitti mi?'],
  ]),
  ...talk('form', 'form', 0.02, 0.98, [
    [G, '— Evet. Küçük bir uyum gecikmeniz vardı. Gerekli ayarlamalar yapıldı.'],
    [null, 'Hiçbir şey yanlış görünmüyordu.'],
    [L, '— İşe gidebilir miyim?'],
    [G, '— Tabii.'],
  ]),
  center('rewoven', 'goodday', 0.03, 0.4, ['Bilinç perdesi yeniden örülüyor.'], 'reveal', { purpose: 'system' }),
  ...talk('good-day', 'goodday', 0.44, 0.97, [
    [G, '— Güzel bir gün olacak.'],
    [L, '— Öyle görünüyor.'],
  ]),
  tell('lobby', 'lobby', 0.04, 0.96, ['Holde mavi çizgi çıkışa, kırmızı çizgi merdivenlere gidiyordu. Kimse ona bakmadı.', 'Süs havuzu. Otobüs. Arşiv. Ekranda eski dosyalar. Her şey normaldi.']),
  ...talk('how', 'cantina', 0.02, 0.98, [
    [K, '— Merkez nasıldı?'],
    [null, 'Levy bir an düşündü. Merkez. Üçüncü kat. Beyaz oda. Form.'],
    [L, '— İyi. Küçük bir kontrolmüş.'],
  ]),
  ...talk('look', 'window', 0.03, 0.98, [
    [null, ['Levy çorbasından bir kaşık aldı. Kantindeki herkes aynı anda pencereye baktı.', 'Bu kez Levy de baktı.']],
    [null, ['Dışarıda hiçbir şey yoktu. Herkes yemeğine döndü. Levy de döndü.', 'Neden baktığını düşünmedi.'], { strong: true, purpose: 'reveal' }],
  ]),

  // 12 — DENEY
  tell('green', 'green', 0.04, 0.62, ['Gerçek laboratuvarda Levy’nin istasyonundaki kırmızı uyarılar sönmüştü.', 'Küçük ekranda denek çorbasını içiyordu.']),
  screen('result', 'green', 0.5, 1.5, [
    'DENEK: LEVY A.',
    'PERDE DİRENCİ: DÜŞÜRÜLDÜ',
    'GEREKÇE KATMANI: YENİDEN STABİL',
    'YARDIM PROTOKOLÜ: TRAVMATİK İZ TEMİZLENDİ',
    'HAFIZA SİLME: BAŞARILI',
    'GÜNLÜK YAŞAMA DÖNÜŞ: TAMAMLANDI',
  ]),
  ...talk('great', 'harika', 0.04, 0.98, [
    [V, '— Harika.'],
    [null, 'Sesi çok yorgundu ama içinde ilk kez küçük bir sevinç vardı.'],
    [V, '— Başardık. İstisnai bir sorunu daha düzelttik.'],
  ]),
  screen('entry-page', 'notes', 0.0, 1.0, [
    'Denek LEVY A., perde çatlağı sonrası yüksek direnç gösterdi.',
    'Yardım protokolü geçici olarak tehdit şeklinde yorumlandı.',
    'Kontrollü açıklama, gerekçe katmanı ifşası ve ardından hafıza temizleme başarılı oldu.',
    'Denek günlük yaşama döndü.',
    'Perde tam olarak kaldırılmadı; fakat gevşetildi ve yeniden örüldü.',
    'Beyin henüz uyanmadı. Ama artık daha az direniyor.',
  ]),
  tell('entry', 'notes', 0.03, 0.33, ['Defterine yazdı. Durdu. Sonra altına ekledi:']),
  center('awake', 'notes', 0.37, 0.98, ['Beyin henüz uyanmadı.', 'Ama artık daha az direniyor.'], 'reveal', { stagger: 0.28, fade: 0.22, strong: true }),
  ...talk('rings', 'rings', 0.03, 0.98, [
    [null, ['Yüzlerce beden karanlıkta bekliyordu; her biri kendi küçük dünyasında.', 'Kimi evindeydi, kimi çocukluğunda, kimi hiç yaşanmamış bir mutluluğun içinde.']],
    [null, 'Bir ekranda başka bir deneğin verandası. Başka bir sabah. Başka bir kapı zili.'],
  ]),
  screen('next-subject', 'next', 0.04, 1.0, ['SIRADAKİ DENEK HAZIRLANIYOR.'], { kind: 'alert' }),
  ...talk('again-slower', 'next', 0.03, 0.98, [
    [null, 'Sistem yeni dosyayı açtı. Veyl gözlerini kapattı.'],
    [V, '— Daha yavaş.'],
    [V, '— Bu kez de daha yavaş.'],
  ]),
  tell('signal', 'signal', 0.04, 0.45, ['Karanlığın içinde ince bir sinyal çizgisi belirdi.'], { purpose: 'mood' }),
  { id: 'end', seg: 'signal', from: 0.5, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['BEYİN-KÖKÜ'], sub: 'Deney devam edecek.', fade: 0.4 },
]

/**
 * Two moments ask the reader. Both answers arrive late: the body has already
 * done something, and the mind is handed a reason. The flags change later
 * lines (Tuesday's thought, the log in PERDE) and what the set shows.
 */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'remote',
    seg: 'remote',
    at: 0.2,
    style: 'choice',
    title: 'KUMANDA',
    prompt: 'Veyl konuşmaya devam ediyor. Ne yapacaksın?',
    options: [
      { id: 'volume', label: 'Sesi kıs.', reply: ['Elini kumandaya uzattın.', 'Kumanda masada değildi.'], sets: ['tv:volume'] },
      { id: 'channel', label: 'Kanalı değiştir.', reply: ['Elini kumandaya uzattın.', 'Kumanda masada değildi.'], sets: ['tv:channel'] },
    ],
  },
  {
    id: 'line',
    seg: 'choose',
    at: 0.76,
    style: 'choice',
    title: 'İKİ ÇİZGİ',
    prompt: 'Hangi çizgiyi takip edeceksin?',
    options: [
      { id: 'blue', label: 'Mavi çizgi — çıkış.', reply: ['Ayakkabının ucu kırmızı çizgiye değdi.', 'Kısa bir duraksama.', 'Sadece verilmiş kararı fark ediyorsun.'], sets: ['line:blue'] },
      { id: 'red', label: 'Kırmızı çizgi.', reply: ['Ayakkabının ucu kırmızı çizgiye çoktan değmişti.', 'Kısa bir duraksama.', 'Sadece verilmiş kararı fark ediyorsun.'], sets: ['line:red'] },
    ],
  },
]

/** The whole story in prose, chapter by chapter, for screen readers and readers without WebGL. */
export const TRANSCRIPT: Record<string, string> = {
  lab: 'Profesör Veyl’in laboratuvarında gece hiçbir zaman tam olarak bitmezdi. Tavanın çok yukarısında, karanlığa gömülmüş servis ışıkları ağır ağır yanıp sönerdi. Ortadaki devasa boşluk, kat kat yükselen metal balkonlarla çevriliydi; her katta yarı dik açıyla yerleştirilmiş istasyonlar, her istasyonda bir beden vardı. Başlar çerçevelere sabitlenmiş, şakaklardaki eski cerrahi izler açılmıştı. Beyinler ne tam içerideydi ne tam dışarıda: bedenden koparılmadan, damar ve omurilik bağlantıları korunarak metal desteklere ve sıvı kanallarına bağlanmıştı. Her bedenin yanındaki küçük ekranda başka bir dünya akıyordu: banliyö sokaklarında bisiklete binen küçük bir kız, verandasında sabah kahvesini içen yaşlı bir adam, deniz kenarında yürüyen bir kadın, gömleğinin düğmelerini ilikleyen genç bir adam, annesine sarılan bir çocuk, yağmurun altında gülümseyen bir adam. Aynı dünyada değillerdi. Her biri kendi anılarından, korkularından ve özlemlerinden kurulmuş bir evrende yaşıyordu. Veyl bunlara “cennet” demiyordu. Ama cennet gibi kuruyordu; çünkü beyin yabancı dünyalara zor inanır, tanıdık masaya, tanıdık kokuya, tanıdık yüzlere tutunurdu. Veyl bu dünyaların tanrısıydı. Bunu yüksek sesle söylemezdi. Ama gökyüzünün ne kadar mavi olacağını, komşunun ne zaman gülümseyeceğini, hangi mektubun hangi sabah kapıya bırakılacağını o belirlerdi. İsterse içeri girebilirdi. Çoğu zaman girmezdi. Sahneyi kurar, ışığı ayarlar, sonra onların kendi kararlarını verdiklerini sanmalarını izlerdi. Başındaki nöro-arayüz onu simülasyona sokmuyordu; yalnızca karar ile gerekçe arasındaki o küçücük boşluğu yakalamasına yardım ediyordu. Ana ekranda bir dosya açıktı. DENEK: LEVY A. KİŞİSEL EVREN: BANLİYÖ / ARŞİV YAŞAMI / DÜŞÜK ÇATIŞMA ORTAMI. PERDE DİRENCİ: ARTIYOR. HAFIZA EŞLEME: KISMİ UYUMSUZLUK. GEREKÇE KATMANI: GECİKMELİ. YARDIM PROTOKOLÜ: HENÜZ AKTİF DEĞİL. Levy’nin beyin haritasında hareket niyeti yükseliyor, ardından gerekçe geliyordu. Normalde bu boşluk öyle iyi kapatılırdı ki denek hiçbir şey fark etmezdi. Levy’de ise açılmaya başlamıştı. Bazen açıklama yarım saniye geç kalıyordu.',
  protocol:
    'Veyl defterini açtı. Aynı kavramlar sayfalar boyunca tekrar ediyordu: Bilinç perdesi. Beyin uykusu. Gerekçe katmanı. Özbenlik savunması. Yardım protokolü. Yumuşak kaldırma. Geri aktarım. İkna. Kalemi eline aldı. Bir şey yazmadı. “Başlamış,” dedi. Sonra bilgisayarda bir protokol açtı: BRAINROOT / UYUM ÇAĞRISI. Aşama 1: Gecikmiş randevu bildirimi. Aşama 2: Kırmızı güzergâh yönlendirmesi. Aşama 3: Yardım protokolü kontrollü temas. Aşama 4: Perde çatlağı. Aşama 5: Gerekçe katmanı gözlemi. Aşama 6: Hafıza temizleme ve geri salım. Veyl bir süre durdu. “Daha yavaş,” dedi. Enter tuşuna basmadan önce gözlerini kapattı. “Bu kez daha yavaş.” Tuşa bastı.',
  monday:
    'Levy pazartesi sabahı odasına yayılan yumuşak ışıkla uyandı. Perdeler gün doğmadan birkaç dakika önce kendiliğinden aralanmıştı. Su dolu bardak, ütülü gömlek, ayaklarının ineceği yere bırakılmış terlikler: her şey yerli yerindeydi. Duvardaki küçük ekran günün havasını gösteriyordu: Açık. Ilık. Dengeli. Bu şehirde hava çoğu zaman böyleydi. İnsanlar üzülür ama çökmeyecek kadar üzülürdü. Dünya, insanın canını yakabilecek şeylerin kenarları törpülenmiş gibi duruyordu. Banyoda, aynanın karşısında saçlarını kaldırınca başındaki ince halka izini gördü. Şakaklarından geçip başını sarıyordu. Soluktu. Temizdi. Herkeste vardı. Parmağını izin üzerinden geçirdi; bir an soğuk bir çizgi hissetti. Sonra geçti. “Bugün işe geç kalmamalıyım,” dedi. Kahvesini içip verandaya çıktı. Karşı evin bahçesinde Bayan Elen çiçeklerini suluyordu; beyaz saçlarının arasındaki halka izi sabah ışığında belli belirsiz parlıyordu. Levy elini kaldırdı: “Günaydın! Ve olur ya belki sizi göremem; iyi günler, iyi akşamlar ve iyi geceler!” Bayan Elen güldü: “Her zamanki gibisin, Levy.” Levy de güldü. Bu cümleyi neden sevdiğini bilmiyordu. Sanki eski bir yerden geliyordu. Belki bir filmden. Belki çocukluğundan. Banliyö kusursuzdu: beyaz çitler, biçili çimler, bisiklete binen çocuklar. Hiçbir şey acele etmiyordu. Otobüs durağındaki ekranda gülümseyen bir aile vardı: anne, baba, iki çocuk. Hepsinin başında aynı halka izi. Altında bir kamu duyurusu: Düzenli perde kontrolleri, sağlıklı bir iç yaşamın temelidir. Levy’nin işi şehir arşivlerinin alt katındaydı; eski kayıtları düzenliyor, bozuk dosya adlarını düzeltiyordu. Pazartesi sıradan geçti. Yalnızca öğleden sonra ekran bir anlığına karardı ve siyah bir kutuda yarım bir satır belirdi: BRAINROOT / AKTARIM / DENEK L—. Yazı tamamlanmadan kayboldu. “Arşiv hatası,” dedi Levy ve çalışmaya devam etti.',
  tuesday:
    'Salı sabahı yine aynı ışıkla uyandı. Aynadaki halka izi biraz daha koyu görünüyordu. Işıktandır, diye düşündü. Verandada Bayan Elen yine çiçeklerini suluyordu. Levy elini kaldırdı: “Günaydın! Ve olur ya belki sizi göremem…” Bayan Elen yine güldü: “Her zamanki gibisin, Levy.” Bu defa cümle biraz daha önceden duyulmuş gibi geldi. Levy durdu, sonra gülümsedi: “İnsan bazı şeyleri alışkanlık yapıyor.” Otobüste karşısında, annesinin dizine yaslanmış uyuyan bir çocuk vardı. Başındaki halka izi yeniydi; çevresi hâlâ pembeydi. Levy bakışını camdan dışarı çevirdi. Öğle arasında kantinde herkes bir an pencereye döndü: önce uzak masadaki adam, sonra yanındaki kadın, sonra diğerleri, bir dalga gibi. Levy de baktı. Dışarıda hiçbir şey yoktu. Herkes konuşmasına döndü; Levy’nin çatalı havada kaldı. “Bir şey mi oldu? Dışarı baktınız,” dedi karşısındaki kadına. “Bakmışımdır,” dedi kadın. Sonra ekledi: “Bazen insan bir şeye bakar ama neden baktığını bilmez.” “Evet,” dedi Levy. “Olur.” O akşam televizyonda Profesör Veyl vardı. Onu herkes tanırdı: Bilişsel Stabilizasyon sisteminin kurucusu, perde uyum protokollerinin mimarı. Yüzü sakindi, sesi ölçülüydü. Ekranın altından bir yazı geçiyordu: PROF. DR. VEYL: “PERDE, BİLİNCİN DÜŞMANI DEĞİL; DENGESİDİR.” Burada okur, Levy’nin ne yapacağını seçer: sesi kısmak ya da kanalı değiştirmek. Hangisi seçilirse seçilsin, Levy elini kumandaya uzattığında kumanda masada değildi. Bir an sonra kumandanın elinde olduğunu fark etti; parmağı ses azaltma tuşuna basmıştı bile. Sonra düşündü: “Sesi kısmak istedim.” Cümle içinden geçti. Ama biraz geç geldi. Kanalı değiştirmeyi seçen okur için bir satır daha vardır: Levy kanalı değiştirmek istediğini artık hatırlamıyordu.',
  wednesday:
    'Çarşamba sabahı kapı ziliyle uyandı. Perdeler henüz açılmamıştı. Zil ikinci kez çaldığında kapıyı açtı: verandada kimse yoktu. Yerde küçük beyaz bir zarf duruyordu; üzerinde yalnızca adı yazılıydı: LEVY A. Zarfı mutfak masasında açtı. İçinde tek sayfalık bir çağrı vardı. BİLİŞSEL STABİLİZASYON MERKEZİ. Perde Uyum Kontrolü — Kaçırılmış Randevu Bildirimi. Ad: Levy A. Randevu tarihi: Geçen hafta çarşamba. Durum: Katılım sağlanmadı. Yeni çağrı: Bugün, 09.30. Kat: 3. Birim: Uyanış Sonrası Adaptasyon. Not: Randevunuz bir hafta önce gerçekleşmeliydi. Gecikme, uyumsuzluk belirtisi sayılır. Lütfen bugün merkeze başvurunuz. Aksi durumda alışılmadık yöntemlere başvurulacaktır. Geçen hafta çarşamba ne yemişti? Eve kaçta dönmüştü? Cevaplar vardı ama yerlerine oturmuyordu. Telefonundaki takvimde randevu gerçekten kayıtlıydı; kendi hesabından eklenmişti. “Unutmuşum,” dedi. Rahatlamayı bekledi. Rahatlamadı. Saat 08.14’tü. Arşivde dosyalar vardı. Ama zarf masadaydı ve son satır her şeyden daha ağır görünüyordu: Aksi durumda alışılmadık yöntemlere başvurulacaktır. Ayağa kalktı. “Önce merkeze giderim.” Ayakkabılarını giydi. “Zaten gecikmişim.” Bu cümle daha iyi çalıştı. Evden çıktı. Bayan Elen’in verandası boştu. Sulama kabı oradaydı; toprak ıslaktı. Yokluğu, varlığından daha belirgin görünüyordu.',
  centre:
    'Merkez şehrin en temiz bölgesindeydi. Simetrik ağaçları, küçük süs havuzu ve beyaz taş yollarıyla bir sağlık kurumundan çok bir huzur parkına benziyordu. İnsanlar banklarda oturmuş, formlarına bakıyordu. Kimse hasta görünmüyordu. Kimse korkmuş gibi değildi. Binanın üzerinde sade bir tabela vardı: BİLİŞSEL STABİLİZASYON MERKEZİ. Altında: Kendinizi yeniden duymak için. Levy içeri girmeden önce bahçedeki panolara baktı. Perde nedir? Perde, içsel düzeninizi koruyan doğal bilişsel uyum katmanıdır. Düzenli kontroller; karar berraklığı, hafıza bütünlüğü ve benlik huzuru için gereklidir. Uyum gecikmeleri nelerdir? Dalgınlık, gereksiz iç sorgulama, tanıdık anlarda yabancılık hissi, karar sonrası huzursuzluk, rüya kalıntıları, tekrar algısı. Levy “karar sonrası huzursuzluk” satırında durdu. “Geç kalıyorum.” Bunu fark ettiğinde binaya doğru yürümeye başlamıştı. İçerisi geniş ve sakindi: beyaz zemin, cam duvarlar, yumuşak müzik. Herkesin başında aynı halka izi vardı. Danışmadaki görevli başını kaldırdı: “Levy A. Geç kalmış perde uyum kontrolü. Üçüncü kat, Uyanış Sonrası Adaptasyon Birimi.” Levy zarfı uzattı. Kadın zarfa bakmadı. “Lütfen kırmızı yolu takip edin.” Zeminde iki çizgi vardı. Mavi olanı çıkışa ve bekleme alanlarına gidiyordu; kırmızı olanı salonu geçip sağdaki aralık merdiven kapısında bitiyordu. “Mavi yol çıkış mı?” diye sordu Levy. Görevli gülümsedi: “Kırmızı yolu takip edin, lütfen.” Levy mavi çizgiye baktı. Cam kapının ardında bahçe görünüyordu. Birkaç adımda dışarı çıkabilirdi. Burada okur seçer: mavi çizgi, çıkış; ya da kırmızı çizgi. Hangisi seçilirse seçilsin, Levy’nin ayakkabısının ucu kırmızı çizgiye değmişti. Kısa bir duraksama. Sadece verilmiş kararı fark ediyorsun.',
  redline:
    'Bir an sonra kırmızı çizgide yürüyordu. İçinden bir cümle geçti: “Zaten bunun için geldim.” Salondaki uğultu azaldı. Önce danışmadaki kadının gözleri Levy’ye döndü. Sonra kahve makinesinin önündeki adamın. Sonra form dolduran genç kadının. Sonra hepsinin. Levy yürüdükçe bakışlar çoğaldı. Levy durdu. İnsanlar da durdu. Bir adamın ayağı havada kaldı. Bir kadın formunu yarım katlamış hâlde bekledi. Kahve makinesinin önündeki adamın bardağından kahve taştı; adam fark etmedi. Levy yeniden yürüdü. Onlar da yürüdü. Önce yavaş. Sonra daha hızlı. “Merdivene gitmem gerekiyor.” Bunu düşündüğünde koşmaya başlamıştı. Salon aynı anda hareketlendi; ayak sesleri beyaz zeminde çoğaldı. Levy merdiven kapısını itti, içeri girdi, kapıyı arkasından kapattı. Sessizlik. Ne ayak sesi vardı ne bağırış. Bir süre bekledi. Kapının koluna uzandı. Açmaması gerektiğini düşündü. Kapıyı açtı. Salon normaldi. İnsanlar eski yerlerindeydi; danışmadaki kadın bilgisayarına bakıyor, kahve makinesinin önündeki adam kahvesini alıyordu. Kimse Levy’ye bakmıyordu. Kadın başını kaldırdı: “Bir sorun mu oldu?” Levy kapıyı kapattı. “Hayır.” Merdiven yalnızca ikinci kata çıkıyordu. Kırmızı çizgi basamaklardan yukarı devam ediyor, ikinci kat kapısının altından içeri giriyordu. Levy yukarı baktı. “Önce ikinci kat.” Bu düşünce adımından sonra geldi.',
  floor2:
    'İkinci kat daha sessizdi. Duvarlarda sakinleştirici cümleler vardı: Düşünce geçer. Düzen kalır. Perde sizi korur. İç sesiniz her zaman size ait olmak zorunda değildir. Uyum, özgürlükten önce gelir. Levy sonuncunun önünde durdu, içinden okudu: “Uyum, özgürlükten önce gelir.” Cümle, kendi sesiyle söylenmiş gibi gelmedi. Koridorun sonunda iki görevli belirdi. Beyaz üniformalıydılar; ellerinde kaleme benzeyen küçük cihazlar vardı. “Levy A., lütfen durunuz.” Levy durdu. Görevliler yaklaşmadı. “Uyum kontrolünüz tamamlanmadı,” dedi kadın olan. “Lütfen bizimle geliniz.” Levy onlara doğru birkaç adım attı. Her şey normaldi: kadının yüzünde endişeli bir nezaket, adamın yüzünde yorgunluk vardı. Bir adım daha attı. Işık titredi. Kadının yüzü uzadı, gözleri siyaha döndü, başındaki halka izi yarıldı. Adamın elindeki cihaz ince, uzun, siyah bir iğneye dönüştü. Dezenfektan kokusu çürük et ve yanmış plastik kokusuna karıştı. Sesleri parçalandı: “Dur.” “Aç.” “Tut.” “Kes.” Üç saniye. Başka bir yer: soğuk beyaz bir laboratuvar, metal bir sandalye, bilekleri bağlı bir beden, kafatasını çevreleyen metal bir halka, bir teknisyenin elinde ayar çubuğu. Veyl’in sesi, yakından ama görünmeden: “Görsel eşleşme bozuldu. Korkuyu düşürme, sadece sabitle.” Sonra yeniden koridor. Görevliler normaldi. Kadın elini hafifçe kaldırdı: “Size yardım etmek istiyoruz.” Levy koştu. Görevliler peşinden geldi. Artık onları normal göremiyordu; sesleri bazen insan sesi, bazen boğazı yırtılmış bir yaratığın hırıltısı gibiydi: “Levy A., lütfen durunuz.” “Kesiyi genişlet.” “Size zarar vermeyeceğiz.” “Baş sabitlenecek.” Levy bir odaya girip kapıyı kapattı. Hoparlörlerden düşük bir uğultu geliyordu; uğultu kulağına değil, kemiklerine dokunuyordu. Elini kapıya uzattı. Eli geç kaldı; parmakları sanki başka birinden izin bekliyordu. Kapı koluna dokunduğu anda bileklerinde kelepçe soğuğu hissetti. Üç saniye. Gerçek laboratuvar. Levy sandalyeye bağlıydı; başındaki halka mekanizması açıktı. Bir teknisyen ince kabloları ayarlıyordu. Monitörde: subject_resistance.high; justification_layer.delay: 0.8 sec. Veyl’in sesi: “Gerekçeyi geciktirme. Panikler.” Sonra yeniden oda. Levy nefes nefeseydi. “Dalmışım.” Bu açıklama yetmedi. “Uğultu yüzünden.” Bu biraz daha iyi geldi. Kapının ardından görevlinin sesi geldi, bir an normal, sonra bozuk: “Baş sabitlenecek.” Levy kulaklarını kapattı; ses parmaklarının arasından içeri girdi. Görevliler uzaklaşınca koridora çıktı. Duvardaki afişler bir an kod satırlarına dönüştü: route_redline.active; fear_response.unstable; help_protocol_misread; memory_patch.loop_03. Sonra yeniden: Perde sizi korur. Koridorun sonunda bir merdiven kapısı ve üç terminal vardı. İlk terminalde kendi yüzü belirdi; adının altında başka bir ifade vardı: DENEK 31. Ekran karardı. “Hata,” dedi Levy. İkinci terminal kendiliğinden açıldı: Direnç yüksek. Algı bütünlüğü parçalı. Yardım protokolü tehdit olarak yorumlanıyor. Levy son satırı tam okuyamadan ekran bozuldu. Üçüncü terminalden kendi sesi geldi: “Kapıya gitme.” Sonra yine kendi sesi, daha kısık: “Gittin zaten.” Görevliler dönmüştü; bu kez koridorun iki ucundan geliyorlardı. Işık titredi. Yüzleri birbirine karıştı, şakaklarındaki kesikler yarıldı, ellerindeki cihazlar iğneye, kancaya, metal boruya dönüştü. Sesleri üst üste bindi: “Levy A. Lütfen bizimle geliniz.” “Tut.” “Sakinleştir.” “Bağla.” “Kes.” “Geri al.” Merdiven kapısı açılmadı. Bir el omzuna değdi. Önce yaratık yüzünü gördü. Sonra gerçek yüzü: korkmuş, üzgün, yorgun bir hemşire. “Lütfen,” dedi kadın. Yüz yeniden bozuldu. Levy bağırdı. Boynuna bir iğne girdi. Koku değişti: alkol, steril pamuk, soğuk metal. Sesler uzadı. Koridor eğildi. Son gördüğü şey, kırmızı çizginin kapının altından sızıp karanlıkta kaybolmasıydı.',
  stretcher:
    'Levy gözlerini açtığında dikey bir sedyeye bağlıydı. Kolları, bacakları ve göğsü sabitlenmişti; boynunun iki yanında metal destekler vardı. Önünde büyük bir oda, ekranlar, kablolar, sıvı tankları vardı. Karşısında Profesör Veyl duruyordu. Ama aynı anda başka bir şey daha görüyordu. Üç saniye. Gerçek oda. Sandalye. Bileklerde metal halkalar. Baş çevresinde halka mekanizması. Açık kesiler. Veyl’in gerçek sesi: “Uyanış imgesi sedye olarak kurulmuş. Bırakın. Onun için daha kabul edilebilir.” Sonra yeniden sedye. Veyl, televizyondaki sakin bilim insanından çok daha yorgundu. Göz altları koyuydu, önlüğü lekeliydi; ama sesi hâlâ ölçülüydü. “Levy. Şimdi dinlemen gerekiyor.” “Ne… oluyor?” Veyl eski bir deney kaydı açtı: sandalyede oturan, başına elektrotlar bağlanmış bir denek; karşısında eski bir saat kadranına benzeyen, dönen bir gösterge. “Libet deneyini biliyor musun?” Levy cevap veremedi. “Benjamin Libet ve ekibi, bilinçli karar anıyla beynin hazırlığı arasındaki ilişkiyi ölçmeye çalıştı. Deneklerden, istedikleri bir anda bileklerini oynatmaları istendi. Bu sırada beyinleri ölçülüyordu. Karar verdikleri anı da karşılarında dönen bir kadrana bakarak bildirdiler.” Ekranda üç işaret belirdi. “Birinci işaret: hazırlık potansiyeli. Hareketten önce yükselmeye başlıyor. İkinci işaret: deneğin ‘şimdi karar verdim’ dediği an. Üçüncü işaret: hareket.” Çizgiler yakındı. Ama aynı değildi. “Bu deney tek başına özgür iradeyi yok saymak için yeterli değil,” dedi Veyl. “Basit cevapları sevmem. Ama küçük bir çatlak açar. Bilinç, kararın doğduğu yer olmayabilir. Beyin hazırlanır. Bilinç sonra gelir. Sonra da başlamış olan şeyi sahiplenir.” Üç saniye. Gerçek laboratuvar. Veyl kontrol masasındaydı, başında kablolu arayüz; monitörde Levy’nin beyin haritası açıktı. Bir teknisyen: “Motor niyet yine önce geldi.” Veyl: “Gerekçe katmanını yumuşat. Kendi kararı sanması gerekiyor.” Sonra yeniden sedye ve ekran. İkinci kayıtta deneklerin parmakları dışarıdan verilen küçük uyarılarla oynuyordu. Denekler bunun farkında değildi. Onlara yalnızca parmaklarını neden oynattıkları soruldu. Cevaplar sırayla geldi: “Kaşındı.” “Ben oynattım.” “Rahatsız oldum.” “Öylesine.” “Masaya dokunmak istedim.” Veyl kaydı durdurdu. “Bu insanlar yalan söylemiyor. Bunu anlaman gerekiyor. Bilinç bazen olayların başlangıcı değil, anlatıcısıdır. Bir hareket sahipsiz kalmasın diye üzerine bir neden örter. Nedenin doğru olması gerekmez. Kişiyi dağılmaktan koruyacak kadar tutarlı olması yeterlidir.” Levy kırmızı çizgiye bastığı anı hatırladı. Mavi çizgi çıkışa gidiyordu. Ama o kırmızıya basmıştı. Sonra içinden o cümle geçmişti: “Zaten bunun için geldim.”',
  veil: 'Veyl üçüncü kaydı açtı. Aynı oda, aynı masa, aynı ışık, aynı duvar; dört farklı denek. Biri korkuyla gölgeye bakıyordu, ikincisi rahat oturuyordu, üçüncüsü midesi bulanmış gibi yüzünü buruşturuyordu, dördüncüsü sebepsizce gülümsüyordu. “Oda değişmedi,” dedi Veyl. “Değişen, beyne verdiğimiz uyarılardı. Korku devresini artırdığımızda denek gölgeyi tehdit olarak yorumladı. Ödül devresi uyarıldığında tanımadığı bir yüzü güvenilir buldu.” Ekranda notlar belirdi: Ortam sabit. Yorum değişken. Dış neden üretimi: başarılı. “İnsan dünyayı olduğu gibi yaşamaz. Dünya ile bedeni arasındaki yorum katmanını yaşar.” Levy’nin burnuna kokular karıştı: alkol, yanık plastik, çürümüş et, sabun, kan. Sonra hepsi kayboldu. Büyük ekranda bir beyin şeması açıldı. “Bilinç kötü bir şey olarak doğmadı,” dedi Veyl. “Beyin, bedeni yönetmek için bir arayüz üretti. Bilinç yardımcıydı. Bir yansıma.” Şemanın önünde ayna gibi bir yüzey belirdi. “Sonra yansıma büyüdü.” Ayna genişledi; beyin arkasında görünmez oldu. “Beyin, kendi yansımasının arkasında kaldı. Konak kendini efendi sandı. Beyin uyudu. Köreldi. Kendi ürettiği perdeyi dünya zannetti.” Levy zor konuştu: “Sen… ne istiyorsun?” Veyl ona yaklaştı. “Bilinci yok etmek istemiyorum. Bilinç kilit. Koruma. Perde. Ama artık o kadar kalın ki arkasındaki beyin doğrudan uyanamıyor.” Bir an Veyl’in yüzü bozuldu: gözleri karardı, ağzı uzadı, başındaki iz açıldı. Üç saniye. Yavaşça bir satır belirdi: Sen karar vermiyorsun. Sonra yine yorgun, yaşlı bir adamdı. “Perdeyi bir anda kaldırmaya çalıştığımda beyin panikliyor,” dedi. “Yeni hikâyeler örüyor. Yardım edeni tehdit olarak görüyor. Doktoru cellat, sedasyonu zehir, kapıyı tuzak, kırmızı çizgiyi kader sanıyor.” Levy ikinci kattaki yüzleri hatırladı: iğneleri, kancaları, sonra o bir anlık hemşire yüzünü. “Onlar seni öldürmeye çalışmadı. Seni buraya getirmeye çalıştı.” Veyl başka ekranlar açtı: bir kadının sahil kasabası, bir adamın dağ evi, bir çocuğun hiç bitmeyen yaz tatili, bir yaşlının, kaybettiği eşinin hâlâ yaşadığı küçük mutfağı. “Herkes kendi cennetinde yaşar. Acıyı azaltırım, düzeni kurarım. Sonra çatlakları açarım. Belki bir cennet. Belki bir ameliyathane. Belki ikisi de.” Kendi sözünden rahatsız olmuş gibi kısa bir an sustu. “Ben tanrı olmak istemedim. Fakat bir dünyayı kurup herkesin neden gülümsediğini ayarlamaya başladığında, bu cümlenin anlamı değişiyor.” Levy ellerine baktı. Eller bazen sedyeye bağlıydı. Bazen sandalyeye. Bazen hiç yoktu. Yan ekranda başka bir denek göründü: gerçek dünyada kafatası açılmış, beyni sisteme bağlı bir beden; kendi evreninde ise küçük bir mutfakta kahvaltı eden bir adam. “Görme merkezine sinyal verildiğinde pencere görüyor. İşitsel alana desen gönderildiğinde kuş sesi duyuyor. Ve ona sorarsan, kahvesini içmeyi kendisi seçti.” Sonra ekranda Levy’nin pazartesi sabahı açıldı: yatak, perde, ayna, Bayan Elen, otobüs, arşiv, mektup, merkez, kırmızı çizgi. Görüntünün altında satırlar akıyordu: motor impulse: volume_down; generated justification: “Sesi kısmak istedim.” motor impulse: red_line_step; generated justification: “Zaten bunun için geldim.” motor impulse: open_stair_door; generated justification: “Bir sorun yok.” fear response: high; generated justification: “Bana yardım etmiyorlar.” avoidance impulse: blue_line_exit; override: red_line_priority; generated justification: “Geç kalmışım.” Levy’nin gözleri satırlara kilitlendi. Bunlar onun cümleleriydi: kendini sakinleştirmek için kullandığı, kendi sesi sandığı cümleler. Maviyi seçen okura: Maviyi seçmiştin. Ayağın kırmızıdaydı. Kırmızıyı seçen okura: Kırmızıyı seçmiştin. Ayağın oraya senden önce varmıştı. Veyl fısıldadı: “Dünya sahte olduğu için korkmuyorsun, Levy. Asıl korkunç olan o değil. Asıl korkunç olan, dünyaya verdiğin anlamın da sana ait olmayabileceği.” Ekran bozuldu. Üç saniye. Gerçek laboratuvar. Veyl kontrol masasından konuşuyordu: “Stabil. Şimdi hafıza temizleme aşamasına hazırlanıyoruz. Korkma, Levy. İşlem bittiğinde gördüğün çatlakları hatırlamayacaksın.” Sonra yeniden sedye; Veyl artık karşısındaydı. “İşlem neredeyse tamamlandı. Merkezden çıkacak, işine gidecek, gününe devam edeceksin.” Levy konuşmaya çalıştı: “Ya… gerçek?” Veyl uzun süre cevap vermedi. Sonra yalnızca şunu söyledi: “Gerçek, sürdürebildiğin şeydir.” Ekranlar tek tek kapandı. Oda beyazlaştı. Sesler uzaklaştı.',
  release:
    'Levy gözlerini açtığında Bilişsel Stabilizasyon Merkezi’nin üçüncü katında, küçük bir odadaydı. Bir sandalyede oturuyordu; karşısında nazik yüzlü bir görevli vardı. Odada çiçek kokusu vardı. Şakaklarındaki halka izi biraz sızlıyordu; ama bu tanıdık bir sızıydı. Görevli gülümsedi: “İşleminiz tamamlandı, Levy A.” “Bitti mi?” “Evet. Küçük bir uyum gecikmeniz vardı. Gerekli ayarlamalar yapıldı.” Beyaz oda. Küçük masa. Su bardağı. Duvar saati. Hiçbir şey yanlış görünmüyordu. Görevli bir form uzattı. “İşe gidebilir miyim?” “Tabii.” Sonra bir yazı belirdi: Bilinç perdesi yeniden örülüyor. Görevli kapıyı açtı. “Güzel bir gün olacak.” Levy gülümsedi: “Öyle görünüyor.” Merdivenlerden indi. Giriş holü sakindi. Mavi çizgi çıkışa, kırmızı çizgi merdivenlere gidiyordu. Kimse ona bakmadı. Dışarı çıktı. Süs havuzunun suyu hafifçe dalgalanıyordu. Otobüse bindi, arşive gitti, masasına oturdu. Ekranda eski dosyalar vardı. Her şey normaldi. Öğle arasında kantindeki kadın sordu: “Merkez nasıldı?” Levy bir an düşündü. Merkez. Üçüncü kat. Beyaz oda. Form. “İyi,” dedi. “Küçük bir kontrolmüş.” Kadın gülümsedi. Levy çorbasından bir kaşık aldı. Kantindeki herkes aynı anda pencereye baktı. Bu kez Levy de baktı. Dışarıda hiçbir şey yoktu. Bir süre sonra herkes yemeğine döndü. Levy de döndü. Neden baktığını düşünmedi.',
  experiment:
    'Gerçek laboratuvarda Veyl kontrol masasının başında oturuyordu. Levy’nin istasyonundaki kırmızı uyarılar sönmüştü; sinyal çizgileri dengelenmiş, geri aktarım verileri yeşile dönmüştü. Küçük ekranda denek çorbasını içiyor, sonra bilgisayarına dönüyordu. Ana ekranda sonuç belirdi: DENEK: LEVY A. PERDE DİRENCİ: DÜŞÜRÜLDÜ. GEREKÇE KATMANI: YENİDEN STABİL. YARDIM PROTOKOLÜ: TRAVMATİK İZ TEMİZLENDİ. HAFIZA SİLME: BAŞARILI. GÜNLÜK YAŞAMA DÖNÜŞ: TAMAMLANDI. Veyl uzun süre ekrana baktı, sonra başını geriye yasladı. “Harika,” dedi. Sesi çok yorgundu ama içinde ilk kez küçük bir sevinç vardı. “Başardık. İstisnai bir sorunu daha düzelttik.” Defterini açtı ve yazdı: Denek LEVY A., perde çatlağı sonrası yüksek direnç gösterdi. Yardım protokolü geçici olarak tehdit şeklinde yorumlandı. Kontrollü açıklama, gerekçe katmanı ifşası ve ardından hafıza temizleme başarılı oldu. Denek günlük yaşama döndü. Perde tam olarak kaldırılmadı; fakat gevşetildi ve yeniden örüldü. Durdu. Sonra altına ekledi: Beyin henüz uyanmadı. Ama artık daha az direniyor. Kalemi bıraktı ve laboratuvarın üst halkalarına baktı. Yüzlerce beden karanlıkta bekliyordu. Her biri kendi küçük dünyasındaydı: kimi evinde, kimi işinde, kimi çocukluğunda, kimi hiç yaşanmamış bir mutluluğun içinde. Bir ekranda başka bir deneğin verandası göründü. Başka bir sabah. Başka bir posta kutusu. Başka bir kapı zili. Sistem yeni dosyayı açtı: SIRADAKİ DENEK HAZIRLANIYOR. Veyl gözlerini kapattı. “Daha yavaş,” dedi. “Bu kez de daha yavaş.” Karanlığın içinde ince bir sinyal çizgisi belirdi. Deney devam edecek.',
}

/** The HUD steps back for the opening, the cuts to the real lab, the needle, the slow line, the white, and the end. */
export const QUIET: Array<readonly [number, number]> = [
  [0, at('atrium', 0.04)],
  [at('cut', 0.5), at('lab1', 1)],
  [at('lab2'), at('lab2', 0.63)],
  [at('nurse', 0.7), at('fade', 1)],
  [at('lab3'), at('lab3', 0.55)],
  [at('lab4'), at('lab4', 0.26)],
  [at('face'), at('face', 1)],
  [at('terrible', 0.44), at('terrible', 1)],
  [at('lab5'), at('lab5', 0.26)],
  [at('white'), at('white', 1)],
  [at('signal'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.05, text: '[havalandırmanın derin uğultusu]' },
  { seg: 'atrium', at: 0.2, text: '[çok yukarıda bir servis lambası tıkırdayarak yanar]' },
  { seg: 'atrium', at: 0.6, text: '[sıvı pompalarının yavaş nabzı]' },
  { seg: 'file', at: 0.45, text: '[monitör kısa bir bip sesi çıkarır]' },
  { seg: 'notebook', at: 0.06, text: '[defter sayfaları çevrilir]' },
  { seg: 'press', at: 0.08, text: '[tek bir tuş sesi]' },
  { seg: 'wake', at: 0.04, text: '[perde motorunun yumuşak vızıltısı]' },
  { seg: 'wake', at: 0.3, text: '[kuş sesleri, fazla düzenli]' },
  { seg: 'elen', at: 0.04, text: '[sulama kabından akan su]' },
  { seg: 'busstop', at: 0.85, text: '[otobüs kapıları açılır]' },
  { seg: 'archive', at: 0.54, text: '[ekranda kısa bir parazit]' },
  { seg: 'bus', at: 0.05, text: '[otobüs motorunun alçak homurtusu]' },
  { seg: 'wave', at: 0.05, text: '[kantinin uğultusu masa masa kesilir]' },
  { seg: 'wave', at: 0.62, text: '[konuşmalar kaldığı yerden sürer]' },
  { seg: 'tv', at: 0.05, text: '[televizyonda sakin bir erkek sesi]' },
  { seg: 'remote', at: 0.36, text: '[ses azaltma tuşu: bip, bip, bip]' },
  { seg: 'bell', at: 0.03, text: '[kapı zili]' },
  { seg: 'bell', at: 0.4, text: '[kapı zili, ikinci kez]' },
  { seg: 'letter', at: 0.12, text: '[zarf yırtılır]' },
  { seg: 'heavy', at: 0.05, text: '[mutfak saatinin tıkırtısı]' },
  { seg: 'garden', at: 0.1, text: '[süs havuzunda fıskiye, uzak kuşlar]' },
  { seg: 'hall', at: 0.05, text: '[yumuşak müzik, sakin bir anons]' },
  { seg: 'eyes', at: 0.05, text: '[salonun uğultusu azalır]' },
  { seg: 'eyes', at: 0.75, text: '[taşan kahvenin şırıltısı]' },
  { seg: 'run', at: 0.6, text: '[beyaz zeminde çoğalan ayak sesleri]' },
  { seg: 'silence', at: 0.12, text: '[kapı kapanır, sonra sessizlik]' },
  { seg: 'slogans', at: 0.05, text: '[floresan lambaların vızıltısı]' },
  { seg: 'flicker', at: 0.45, text: '[elektrik cızırtısı]' },
  { seg: 'cut', at: 0.5, text: '[sesler parçalanır, boğuklaşır]' },
  { seg: 'lab1', at: 0.04, text: '[cerrahi lambanın vızıltısı, monitörün düzenli bip sesi]' },
  { seg: 'chase', at: 0.5, text: '[koşan adımlar, üst üste binen sesler]' },
  { seg: 'room', at: 0.06, text: '[kemiklere işleyen düşük bir uğultu]' },
  { seg: 'room', at: 0.85, text: '[metal kelepçe tıkırtısı]' },
  { seg: 'lab2', at: 0.04, text: '[monitörde uyarı sesi]' },
  { seg: 'code', at: 0.2, text: '[dijital bir hışırtı]' },
  { seg: 'voice', at: 0.1, text: '[hoparlörden kendi sesi]' },
  { seg: 'swarm', at: 0.04, text: '[koridorun iki ucundan ayak sesleri]' },
  { seg: 'nurse', at: 0.1, text: '[kilitli kapı kolu takırdar]' },
  { seg: 'nurse', at: 0.75, text: '[Levy bağırır]' },
  { seg: 'fade', at: 0.1, text: '[sesler uzar, boğulur]' },
  { seg: 'stretcher', at: 0.05, text: '[monitör bip sesi, tanklarda kabarcıklar]' },
  { seg: 'lab3', at: 0.04, text: '[cerrahi monitör, düzenli ritim]' },
  { seg: 'libet', at: 0.3, text: '[eski kayıtta dönen kadranın tıkırtısı]' },
  { seg: 'lab4', at: 0.04, text: '[klavye tıkırtısı, monitör sesi]' },
  { seg: 'face', at: 0.38, text: '[derin, bozuk bir uğultu]' },
  { seg: 'log', at: 0.27, text: '[satırlar ekrana düşerken kısa tıkırtılar]' },
  { seg: 'lab5', at: 0.04, text: '[cerrahi monitör, düzenli ritim]' },
  { seg: 'white', at: 0.54, text: '[ekranlar tek tek kapanır]' },
  { seg: 'smallroom', at: 0.05, text: '[duvar saatinin tıkırtısı]' },
  { seg: 'cantina', at: 0.04, text: '[kantin uğultusu]' },
  { seg: 'window', at: 0.06, text: '[kaşık tabağa değer]' },
  { seg: 'window', at: 0.3, text: '[kantin aynı anda susar]' },
  { seg: 'green', at: 0.08, text: '[yumuşak bir onay sesi]' },
  { seg: 'notes', at: 0.05, text: '[kalem kâğıtta]' },
  { seg: 'next', at: 0.04, text: '[yeni dosya açılır]' },
  { seg: 'signal', at: 0.06, text: '[ince, yükselen bir sinyal sesi]' },
]

/** World positions match the screenplay (docs/stories/beyinkoku.md, section 2). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'station-31',
    title: 'İstasyon 31',
    seg: 'god',
    from: 0.4,
    to: 2.2,
    pos: [0, 2.05, -7.05],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['İSTASYON 31 · DENEK: LEVY A.', 'Bağlantı süresi: 3 yıl, 41 gün.'] },
  },
  {
    id: 'station-32',
    title: 'Boş istasyon',
    seg: 'file',
    from: 0,
    to: 1.6,
    pos: [-2.6, 1.0, -7.2],
    size: 0.8,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Kayışları açık, boş bir istasyon.', 'Etiketi: İSTASYON 32 · HAZIRLANIYOR.'] },
  },
  {
    id: 'margin-note',
    title: 'Defterin kenarı',
    seg: 'notebook',
    from: 0,
    to: 1.0,
    pos: [-0.75, 0.79, -2.95],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Sayfanın kenarında silik bir not:', '“Hızlı kaldırma: dokuz denek. Dokuzu da panik.”'] },
  },
  {
    id: 'round-corners',
    title: 'Yuvarlak köşeler',
    seg: 'wake',
    from: 0.3,
    to: 1.0,
    pos: [101.0, 1.05, -1.35],
    size: 0.4,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Masanın köşesi yuvarlatılmıştı.', 'Evdeki bütün köşeler gibi.'] },
  },
  {
    id: 'blinking-family',
    title: 'Ekrandaki aile',
    seg: 'busstop',
    from: 0.35,
    to: 1.0,
    pos: [141.6, 1.5, 9.7],
    size: 0.9,
    kind: 'anomaly',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Ekrandaki ailenin dördü de aynı anda göz kırpıyordu.'] },
  },
  {
    id: 'calibration',
    title: 'Camdaki yazı',
    seg: 'wave',
    from: 0,
    to: 1.0,
    pos: [215.95, 2.5, -0.8],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Pencerenin köşesinde, içeriden ters okunan küçük bir yazı:', 'DİKKAT KALİBRASYONU · 12.40'] },
  },
  {
    id: 'watering-can',
    title: 'Sulama kabı',
    seg: 'empty',
    from: 0,
    to: 1.0,
    pos: [98.6, 0.18, 21.6],
    size: 0.35,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Yeşil sulama kabının üzerinde küçük, beyaz bir etiket: E-07.'] },
  },
  {
    id: 'no-handle',
    title: 'Cam kapı',
    seg: 'choose',
    from: 0,
    to: 1.0,
    pos: [300, 1.05, 14.95],
    size: 0.6,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Cam kapının kolu yoktu.', 'İçeriden açan bir düğme de yoktu.'] },
  },
  {
    id: 'fifth-slogan',
    title: 'Beşinci afiş',
    seg: 'slogans',
    from: 0,
    to: 1.0,
    pos: [401.45, 1.6, 4.5],
    size: 0.6,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['Yarısı kazınmış beşinci bir afiş:', '“Karar, gerekçeden önce gelir.”'] },
  },
  {
    id: 'next-envelope',
    title: 'Başka bir zarf',
    seg: 'rings',
    from: 0.6,
    to: 1.0,
    pos: [-1.15, 1.2, -3.45],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Yan ekrandaki verandada küçük beyaz bir zarf.', 'Üzerinde bir ad: MARA T.'] },
  },
]
