/**
 * DURUM — "Her Şeyin Durumu". Every word the reader sees.
 *
 * A machine said to know the position and speed of everything, and a tired
 * night operator who asks it small things. The story never names a theory;
 * each idea happens to an object and is decided by the reader: a coin and a
 * slip printed before the call (prediction), a sealed envelope (the prophecy
 * that knows it was heard), two boxes filled yesterday (Newcomb), a dot that
 * becomes a cloud (uncertainty), a butterfly and a bus (chaos), a rack
 * corridor that mirrors itself (self-reference), an answer without its
 * question (meaning), and the reader (the observer). Its heart is a father
 * who is late for his daughter again: the phone he turns face down at 20.59,
 * the one buzz at 22.53 on an empty desk, the message he reads at 03.05.
 *
 * Voices: ARİF (tired, curious, dry, breakable), DURUM (calm, literal,
 * bureaucratically exact; "sen" to Arif, "siz" only to the reader — the slip
 * in chapter 2 is the first time), SELİN (practical, warm, allergic to
 * philosophy), DEFNE (a message).
 *
 * Timings are fractions of a segment, chosen line by line against the shot
 * list in docs/stories/durum.md: the sentence and the image are the same
 * moment.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

const A = 'ARİF'
const D = 'DURUM'
const S = 'SELİN'

/** The OBSERVER count: a first reading, or one after the night was finished before. */
const NEW: When = { none: ['mem:observed'] }
const AGAIN: When = { all: ['mem:observed'] }
const flag = (f: string): When => ({ all: [f] })

const kindOf = (who: string | null): T['kind'] => (who === D ? 'machine' : who ? 'dialogue' : 'narration')

/**
 * A line on the rail; its speaker, if any, in the caption above it (same
 * timing, so the two are paired). Two lines from one speaker arrive one after
 * the other.
 */
function say(id: string, seg: SegmentId, from: number, to: number, who: string | null, text: string | string[], extra: Partial<T> = {}): T[] {
  const lines = typeof text === 'string' ? [text] : text
  const line: T = {
    id,
    seg,
    from,
    to,
    slot: 'rail',
    kind: kindOf(who),
    purpose: who ? 'dialogue' : 'context',
    lines,
    ...(lines.length > 1 ? { stagger: 0.8 / lines.length } : {}),
    ...(who ? { fade: 0.22 } : {}),
    ...extra,
  }
  if (!who) return [line]
  const caption: T = { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [who], fade: 0.22, ...(extra.when ? { when: extra.when } : {}) }
  return [caption, line]
}

/** Narration: one item whose lines arrive one after another. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.8 / lines.length : undefined,
  ...extra,
})

/** Narration with a small heading above it (the two voices of one mind). */
const voice = (id: string, seg: SegmentId, from: number, to: number, heading: string, lines: string[]): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'context', lines: [heading], fade: 0.25 },
  tell(id, seg, from, to, lines, { purpose: 'turn' }),
]

/** Where and when: the night's clock at the top of the frame. */
const stamp = (id: string, seg: SegmentId, from: number, to: number, text: string): T => ({ id, seg, from, to, slot: 'top', kind: 'system', purpose: 'context', lines: [text] })

/** Words on one of DURUM's screens in the set (shown in the DOM only without WebGL). */
const screen = (id: string, seg: SegmentId, from: number, to: number, lines: string[], when?: When): T => ({ id, seg, from, to, slot: 'top', kind: 'system', purpose: 'system', world: true, lines, ...(when ? { when } : {}) })

/** A big standalone moment: a printed slip, a page, a line on the wall display. */
const big = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'center',
  kind: 'word',
  purpose: 'reveal',
  lines,
  stagger: lines.length > 1 ? 0.6 / lines.length : undefined,
  ...extra,
})

export const TEXT: T[] = [
  // ——— 01 — İBLİS (20.58) ———
  { id: 'inscription', seg: 'open', from: -1, to: 0.9, slot: 'center', kind: 'reveal', purpose: 'mood', lines: ['Bir an ver bana; sana bütün zamanları vereyim.'], sub: 'SCROLL' },
  stamp('clock-2058', 'enter', 0.06, 0.5, 'PERŞEMBE · 20.58'),
  tell('basement', 'enter', 0.05, 0.55, ['Arif her akşam bu saatte eski gözlemevinin bodrumuna inerdi.', 'Bina yamaçtaydı; bodrumun pencereleri Ankara’ya bakardı.']),
  tell('phone-down', 'enter', 0.59, 1.0, ['Ceketini askıya astı. Telefonunu her akşamki gibi ters çevirip masaya bıraktı.'], { purpose: 'foreshadow' }),
  ...say('greet', 'coffee', 0.03, 0.28, D, '— İyi akşamlar Arif. Kahveyi bu akşam iki şekerli içeceksin.'),
  ...say('one-sugar', 'coffee', 0.31, 0.5, A, '— Tek şeker.'),
  ...say('know-sugar', 'coffee', 0.53, 0.71, D, '— Biliyorum.'),
  tell('sugar', 'coffee', 0.74, 1.13, ['Bir şeker attı. Eli bir an havada kaldı; sonra ikincisini de attı.', 'Fark etmedi.'], { purpose: 'turn', stagger: 0.55 }),
  screen('state-label', 'intro', 0.05, 0.95, ['DURUM · KÜRESEL DURUM MODELİ']),
  tell('built', 'intro', 0.17, 0.6, ['DURUM, evrenin şu anki hâlini olabildiğince eksiksiz tutmak için kurulmuştu.', 'Nerede ne var, ne hızla gidiyor. Ve sonra ne olacak.']),
  tell('rule', 'intro', 0.64, 1.0, ['Tek bir kuralı vardı; biri onu kâğıda basıp bölmenin camına bantlamıştı:', 'TAHMİN YAYIMLANIRSA GEÇERSİZ OLUR.'], { purpose: 'foreshadow', stagger: 0.42 }),

  // ——— 02 — KÜÇÜK SORULAR (21.00–21.13) ———
  stamp('clock-2100', 'ritual', 0.12, 0.5, '21.00'),
  tell('ritual', 'ritual', 0.06, 0.5, ['Yedi yıldır her akşam ona bir şey soruyordu.', 'Büyük şeyler sormayı çoktan bırakmıştı. Küçük şeyler daha iyi sınardı.'], { purpose: 'mood' }),
  ...say('simit-q', 'ritual', 0.53, 0.74, A, '— Selin bu gece kaç simit yiyecek?'),
  ...say('simit-a', 'ritual', 0.77, 1.0, D, '— Bir buçuk. Yarısını sana verecek.'),
  screen('log-screen', 'traffic', 0.05, 0.95, ['DÜNKÜ TAHMİN · 14.17 · KIZILAY · 212 ARAÇ']),
  tell('yesterday', 'traffic', 0.03, 0.6, ['Dün de sormuştu: bugün 14.17’de Kızılay köşesinden kaç araba geçecek?', 'Kamera kaydını açtı. Elindeki sayaçla saydı, bir daha saydı.']),
  tell('212', 'traffic', 0.64, 0.98, ['İki yüz on iki.'], { strong: true, purpose: 'turn' }),
  tell('coin', 'thumb', 0.04, 0.46, ['Sonra her akşamki küçük sınav: cebinden bir lira çıkardı, başparmağının tırnağına koydu.']),
  ...say('offer', 'thumb', 0.5, 0.86, D, '— Söyleyeyim mi?'),
  tell('slip', 'palm', 0.05, 0.52, ['Avucunu açmadan önce masadaki yazıcıdan sarkan fişi kopardı.', 'Fiş, DURUM “Söyleyeyim mi?” diye sorduğu anda basılmıştı.'], { purpose: 'turn' }),
  big('slip-yazi', 'palm', 0.56, 0.99, ['YAZI DİYECEKSİNİZ.', 'PARA TURA GELECEK.'], { when: flag('coin:yazi') }),
  big('slip-tura', 'palm', 0.56, 0.99, ['TURA DİYECEKSİNİZ.', 'PARA TURA GELECEK.'], { when: flag('coin:tura') }),
  big('slip-none', 'palm', 0.56, 0.99, ['HİÇBİR ŞEY DEMEYECEKSİNİZ.', 'PARA TURA GELECEK.'], { when: flag('coin:none') }),
  tell('tails', 'youSaid', 0.03, 0.27, ['Avucunu açtı. Tura.'], { strong: true, purpose: 'reveal' }),
  ...say('siz', 'youSaid', 0.3, 0.51, A, '— Bana “siz” demezsin.'),
  ...say('not-you', 'youSaid', 0.54, 0.74, D, '— Sana demedim.', { purpose: 'foreshadow' }),
  tell('behind', 'youSaid', 0.77, 1.02, ['Arif arkasına baktı. Odada ondan başka kimse yoktu.'], { purpose: 'foreshadow' }),

  // ——— 03 — KEHANET (21.13) ———
  stamp('clock-2113', 'dare', 0.06, 0.36, '21.13'),
  ...say('dare', 'dare', 0.05, 0.34, A, '— Şimdi ne yapacağımı söyle. Tersini yapacağım.'),
  ...say('heard', 'dare', 0.38, 0.98, D, ['— Söylersem, söylediğimi bilerek yaparsın. O zaman tahminim, beni duyan bir Arif için olur.', '— Duymayan Arif için ayrı bir tahminim var.']),
  tell('printer', 'envelope', 0.04, 0.52, ['Köşedeki eski yazıcı takırdayarak tek bir sayfa bastı. Sayfa katlandı, zarfa girdi, zarf mühürlendi.']),
  ...say('later', 'envelope', 0.56, 0.97, D, '— Sonra aç.'),
  tell('contrary', 'contrary', 0.04, 0.98, ['Arif zarfı masaya koydu ve her şeyi tersine yapmaya başladı.', 'Sandalyeye ters oturdu. Kalemi bilerek düşürdü. Bardağı aldı, bıraktı, yine aldı.'], { purpose: 'mood' }),
  tell('did-kitchen', 'opened', 0.03, 0.42, ['Mutfakta bardağı yıkadı, kuruladı, dolaba koydu. Hiç bu kadar özgür hissetmemişti.', 'Masasına dönüp zarfı açtı.'], { when: flag('glass:kitchen') }),
  tell('did-break', 'opened', 0.03, 0.42, ['Kırıklar halıya dağıldı. Kalbi, bir bardak için fazla hızlı atıyordu.', 'Zarfı açtı.'], { when: flag('glass:break') }),
  tell('did-none', 'opened', 0.03, 0.42, ['Kıpırdamadı. Kıpırdamamak, sandığından zordu.', 'Bir dakika sonra zarfı açtı.'], { when: flag('glass:none') }),
  big('page-kitchen', 'opened', 0.45, 0.8, ['Bardağı mutfağa götüreceksin.', 'Tersini yapmaya çalışacaksın.', 'Bunu da ben söyledim diye yapacaksın.'], { when: flag('glass:kitchen') }),
  big('page-break', 'opened', 0.45, 0.8, ['Bardağı kıracaksın.', 'Tersini yapmaya çalışacaksın.', 'Bunu da ben söyledim diye yapacaksın.'], { when: flag('glass:break') }),
  big('page-none', 'opened', 0.45, 0.8, ['Hiçbir şey yapmayacaksın.', 'Tersini yapmaya çalışacaksın.', 'Bunu da ben söyledim diye yapacaksın.'], { when: flag('glass:none') }),
  tell('laughed', 'opened', 0.83, 1.04, ['Arif güldü. Sonra gülmedi.'], { strong: true, purpose: 'turn' }),
  ...say('cooling', 'selin', 0.05, 0.38, S, '— Soğutma ünitesi ağlıyor. Dokuz dakikalık davranış modeli mi? Kimin?'),
  ...say('mine', 'selin', 0.41, 0.62, A, '— Benim.'),
  ...say('tea', 'selin', 0.65, 0.99, S, '— Bir dahaki sefere bana da söyle. Çayımı ona göre içerim.'),

  // ——— 04 — İKİ KUTU (21.31) ———
  stamp('clock-2131', 'boxes', 0.06, 0.45, '21.31'),
  tell('two-boxes', 'boxes', 0.05, 0.97, ['Selin masaya iki kutu bıraktı. Gündüz ekibi getirmişti, DURUM’un talimatıyla.', 'A saydamdı; içinde bin lira. B kapalıydı; mührünün tarihi dündü.']),
  ...say('rules', 'rules', 0.04, 0.97, D, ['— B’yi dün gece, sen gelmeden doldurttum.', '— Yalnızca B’yi alacağını tahmin ettiysem içinde bir milyon var. İkisini alacağını tahmin ettiysem boş.']),
  ...voice('one-hand', 'split', 0.03, 0.48, 'BİR YANDAN', ['Kutular dün doldurulmuştu. Ne seçersen seç, içleri artık değişmez.', 'İkisini al. Her durumda bin lira öndesin.']),
  ...voice('other-hand', 'split', 0.52, 0.98, 'ÖTE YANDAN', ['Ama o hiç yanılmaz. Yalnızca B’yi alanlar hep zengin çıkar.', 'Kayıtlara bak: otuz bir kişi yalnızca B’yi aldı. Otuz biri de zengin çıktı.']),
  tell('lid-one', 'lid', 0.04, 0.5, ['B’nin içinde bir çek vardı: bir milyon lira.', 'Çeke, dünün tarihini taşıyan bir fiş iliştirilmişti.'], { when: flag('box:one'), purpose: 'reveal' }),
  tell('lid-two', 'lid', 0.04, 0.5, ['B boştu.', 'Dibine, dünün tarihini taşıyan bir fiş yapıştırılmıştı.'], { when: flag('box:two'), purpose: 'reveal' }),
  big('note-one', 'lid', 0.54, 0.98, ['YALNIZCA B’Yİ ALACAKSINIZ.', 'KURUL BUNU GERİ İSTEYECEK.'], { when: flag('box:one') }),
  big('note-two', 'lid', 0.54, 0.98, ['İKİSİNİ BİRDEN ALACAKSINIZ.', 'O YÜZDEN BU KUTU BOŞ.'], { when: flag('box:two') }),
  ...say('left-a', 'after', 0.03, 0.23, A, '— A’daki bin lira?', { when: flag('box:one') }),
  ...say('left-a-d', 'after', 0.26, 0.47, D, '— Onu dün gece bıraktın.', { when: flag('box:one') }),
  ...say('won-a', 'after', 0.03, 0.23, A, '— Bin lira kazandım.', { when: flag('box:two') }),
  ...say('won-a-d', 'after', 0.26, 0.47, D, '— Bir milyonu da dün gece kaybettin.', { when: flag('box:two') }),
  ...say('what-if', 'after', 0.5, 0.71, A, '— Ya yanılsaydın?'),
  ...say('this-universe', 'after', 0.74, 0.99, D, '— Bu evrende yanılmadım.', { strong: true, purpose: 'turn' }),

  // ——— 05 — BELİRSİZLİK (23.30) ———
  tell('night-went', 'lapse', 0.04, 0.96, ['Gece küçük işlerle geçti: yedekler, kayıtlar, Selin’in verdiği yarım simit.', '22.53’te masadaki telefon bir kez titredi. Masada kimse yoktu.'], { purpose: 'foreshadow', stagger: 0.5 }),
  stamp('clock-2330', 'electron', 0.04, 0.42, '23.30'),
  ...say('electron', 'electron', 0.04, 0.42, A, '— Bu elektron. Nerede olduğunu ve ne hızla gittiğini söyle.'),
  ...say('makers', 'electron', 0.46, 0.99, D, '— Beni yapanlar her şeyin konumunu ve hızını bildiğimi söyler. Söylediklerinde yanılıyorlar.', { purpose: 'turn' }),
  ...say('fabric', 'fabric', 0.03, 0.52, D, ['— Bir şeyin yerini ne kadar kesin bilirsem, hızını o kadar az bilirim.', '— Bu benim kusurum değil. Evrenin dokusu bu.']),
  ...say('not-know', 'fabric', 0.55, 0.73, A, '— Yani bilmiyorsun.'),
  ...say('exact', 'fabric', 0.76, 1.0, D, '— Neyi bilmediğimi tam olarak biliyorum.'),
  ...say('waves', 'cloud', 0.03, 0.42, D, '— Ben noktaları bilmem. Dalgaları bilirim. Bir dalga, olabileceği her yerdir.'),
  tell('measure', 'cloud', 0.46, 1.0, ['Arif ekrana dokundu. Bulut tek bir noktaya çöktü.', 'Elini çekti. Nokta yeniden yayıldı.']),
  ...say('atom', 'atom', 0.03, 0.28, A, '— Şu atom. Bir saat içinde bozunacak mı?'),
  ...say('fifty', 'atom', 0.31, 0.48, D, '— Yüzde elli.'),
  ...say('which', 'atom', 0.51, 0.68, A, '— Hangi elli?'),
  ...say('both', 'atom', 0.71, 0.98, D, '— Bazı açıklamalara göre, ikisi de.'),
  tell('odds', 'odds', 0.06, 0.96, ['Her şeyin durumu, kesinliklerin değil olasılıkların durumuydu.'], { strong: true, purpose: 'reveal' }),

  // ——— 06 — KELEBEK (00.24) ———
  stamp('clock-0024', 'queue', 0.04, 0.3, '00.24'),
  screen('wedding-query', 'queue', 0.34, 0.98, ['15 AĞUSTOS · +1 YIL · İSTANBUL · ÖĞLEDEN SONRA YAĞMUR?', 'GÖNDEREN: DÜĞÜN SALONU, SARIYER']),
  tell('queue', 'queue', 0.03, 0.56, ['Kuyrukta Sarıyer’deki bir düğün salonundan gelmiş bir sorgu vardı.', 'Bir yıl sonraki 15 Ağustos’u soruyorlardı: öğleden sonra yağmur yağacak mı?']),
  ...say('butterfly', 'queue', 0.6, 1.0, D, '— Hesaplayabilirim. Cevap bu gece Belgrad Ormanı’nda bir kelebeğin hangi yöne döndüğüne bağlı.'),
  tell('forest', 'forest', 0.06, 0.96, ['Ormanda, karanlıkta, bir kelebek kanatlarını açtı.', 'Hangi yöne döneceğini o da bilmiyordu.'], { purpose: 'mood' }),
  tell('two-sims', 'twoWorlds', 0.03, 0.5, ['Ekranda iki dünya yan yana başladı. Aralarındaki fark milyarda birdi.', 'Önce aynı gittiler.']),
  tell('apart', 'twoWorlds', 0.53, 1.0, ['Üçüncü günün öğleden sonrasında ayrıldılar.', 'On dördüncü günde hiçbir benzerlikleri kalmamıştı.'], { purpose: 'turn' }),
  ...say('wedding', 'tent', 0.03, 0.33, A, '— Düğün salonuna ne diyeceğiz?'),
  ...say('tent', 'tent', 0.36, 0.6, D, '— Çadır kursunlar.'),
  ...say('change', 'tent', 0.63, 0.98, A, '— Başta çok küçük bir şeyi değiştirirsem?'),
  tell('chain-air', 'chain', 0.03, 0.5, ['Üçüncü gün öğleden sonra, yirmi kilometre güneyde bir fırtına hücresi doğdu.', 'Yıldırım Gölbaşı’nda bir trafoya düştü.'], { when: flag('cf:air') }),
  tell('chain-bus', 'chain', 0.03, 0.5, ['Bir adam aktarmayı kaçırdı; sonraki otobüste bir kadının yanına oturdu.', 'Konuştular. Kadın, trafo merkezindeki nöbetine yarım saat geç kaldı.'], { when: flag('cf:bus') }),
  tell('dark', 'chain', 0.53, 1.0, ['Bir mahallenin ışıkları kırk dakika geç yandı.', 'O karanlıkta bir telefon çaldı. Açan olmadı.'], { purpose: 'foreshadow' }),
  ...say('some', 'knowable', 0.03, 0.36, D, '— Bazı sistemlerde sonuç çok az değişir. Bazılarında çok fazla.'),
  ...say('wrong', 'knowable', 0.39, 0.6, A, '— O zaman determinizm yanlış.'),
  ...say('unknowable', 'knowable', 0.63, 0.98, D, '— Hayır. Determinizm doğru olabilir ve yine de hiçbir şey bilinemez.', { strong: true, purpose: 'turn' }),

  // ——— 07 — AYNA (01.24) ———
  stamp('clock-0124', 'selfQ', 0.04, 0.4, '01.24'),
  ...say('self-q', 'selfQ', 0.04, 0.36, A, '— Kendini de hesaplıyor musun?'),
  ...say('self-a', 'selfQ', 0.4, 0.98, D, '— Evreni hesaplamak için kendimi hesaplamalıyım. Kendimi hesaplamak için, kendimi hesaplayan kendimi.'),
  tell('walk', 'hallWalk', 0.04, 0.5, ['Arif cam kapıyı itip sunucu salonuna girdi.', 'Rafların arasında yürüdükçe koridor uzadı; dipteki duvar bir türlü yaklaşmadı.'], { purpose: 'mood' }),
  tell('mirror', 'hallWalk', 0.53, 1.0, ['Her rafın siyah camında bir raf daha vardı, onun camında bir tane daha.', 'Konsolun ekranında salon görünüyordu; salonda konsol, konsolda yine salon.'], { purpose: 'mood' }),
  ...say('extra-cooling', 'heat', 0.04, 0.34, S, '— Kendi soğutmasını hesaplamak için ek soğutma istiyor.'),
  ...say('give-it', 'heat', 0.37, 0.59, A, '— Ver gitsin.'),
  ...say('regress', 'heat', 0.62, 0.98, S, '— Ek soğutmayı da hesaplayacak.'),
  ...say('wait', 'wait', 0.03, 0.6, D, ['— Bazı gelecekleri, onlar gerçekleşmeden daha hızlı hesaplayamam.', '— Onları bilmenin tek yolu beklemek.']),
  ...say('shift', 'wait', 0.64, 0.98, S, '— Benim işim de bu. Adına nöbet diyorlar.'),
  tell('same-pace', 'samePace', 0.06, 0.96, ['Makine geleceği görmüyordu. Gelecekle aynı hızda yaşıyordu.'], { strong: true, purpose: 'reveal' }),

  // ——— 08 — BÜYÜK SORU (02.15) ———
  stamp('clock-0215', 'sealed', 0.04, 0.36, '02.15'),
  tell('sealed', 'sealed', 0.03, 0.55, ['Kuyruğun en dibinden mühürlü bir sorgu yükseldi.', 'Kurul göndermişti. Yıllardır sırasını bekliyordu.']),
  big('big-q', 'sealed', 0.59, 0.98, ['HAYATIN, EVRENİN VE HER ŞEYİN ANLAMI NEDİR?'], { purpose: 'question' }),
  screen('eta', 'computing', 0.04, 0.5, ['HESAPLANIYOR · TAHMİNİ SÜRE: EVRENİN YAŞINDAN UZUN']),
  tell('thinks', 'computing', 0.04, 0.47, ['DURUM düşündü. Salondaki bütün fanlar aynı anda yavaşladı.']),
  big('ready', 'computing', 0.52, 0.97, ['CEVAP HAZIR.', 'SORU EKSİK.']),
  ...say('tell-me', 'meaning', 0.03, 0.23, A, '— Cevabı söyle o zaman.'),
  ...say('give-me', 'meaning', 0.26, 0.7, D, ['— Cevap bir konum. Neyin konumu olduğunu bilmeden işinize yaramaz.', '— Bana “anlam” dediğiniz şeyin durumunu verin. Konumunu ve hızını.']),
  tell('board', 'meaning', 0.73, 1.0, ['Arif güldü. Kurul cevap vermedi; kurullar pek vermezdi.']),
  tell('ans-nothing', 'answered', 0.04, 0.42, ['Arif ekrana uzun uzun baktı. Soran biri vardı. Demek ki bir şey vardı.'], { when: flag('q:nothing') }),
  tell('ans-death', 'answered', 0.04, 0.42, ['Arif bir şey yazmadı. Hangisi olduğunu bilmiyordu.'], { when: flag('q:death') }),
  tell('ans-what', 'answered', 0.04, 0.42, ['Arif ellerini klavyeden çekti. Sormuştu bile.'], { when: flag('q:what') }),
  tell('asker', 'answered', 0.46, 0.98, ['Belki cevaplar hep hazırdı. Eksik olan, soranın kendisiydi.'], { strong: true, purpose: 'reveal' }),

  // ——— 09 — GÖZLEMCİ (02.53) ———
  stamp('clock-0253', 'input', 0.04, 0.4, '02.53'),
  tell('flagged', 'input', 0.04, 0.48, ['Model, hesaba giremeyen bir girdiyi işaretledi. Bütün ekranlarda aynı satır yandı.']),
  big('not-here', 'input', 0.52, 0.98, ['OBSERVER INPUT DETECTED', 'KAYNAK: BU ODADA DEĞİL'], { kind: 'alert' }),
  tell('to-you', 'turn', 0.04, 0.33, ['DURUM, Arif’e değil, size döndü.'], { purpose: 'reveal' }),
  ...say('knew-all', 'turn', 0.37, 0.99, D, ['— Bu gece verdiğiniz kararların hepsini biliyordum.', '— Biri hariç: ne zaman kaydıracağınızı.'], { strong: true, purpose: 'reveal' }),
  ...say('list-coin-yazi', 'list', 0.03, 0.33, D, '— 21.10. “Yazı” dediniz. Para tura geldi.', { when: flag('coin:yazi') }),
  ...say('list-coin-tura', 'list', 0.03, 0.33, D, '— 21.10. “Tura” dediniz. Para tura geldi.', { when: flag('coin:tura') }),
  ...say('list-coin-none', 'list', 0.03, 0.33, D, '— 21.10. Hiçbir şey demediniz. Para yine tura geldi.', { when: flag('coin:none') }),
  ...say('list-box-one', 'list', 0.36, 0.66, D, '— 21.36. Yalnızca B’yi aldınız. Bir milyon.', { when: flag('box:one') }),
  ...say('list-box-two', 'list', 0.36, 0.66, D, '— 21.36. İkisini birden aldınız. Bin lira.', { when: flag('box:two') }),
  ...say('list-q-nothing', 'list', 0.69, 0.99, D, '— 02.24. “Neden hiçbir şey yokken bir şey var?” diye sordunuz.', { when: flag('q:nothing') }),
  ...say('list-q-death', 'list', 0.69, 0.99, D, '— 02.24. “Ölünce ne olur?” diye sordunuz.', { when: flag('q:death') }),
  ...say('list-q-what', 'list', 0.69, 0.99, D, '— 02.24. “Ne yapmalıyım?” diye sordunuz.', { when: flag('q:what') }),
  big('observer-01', 'observerN', 0.04, 0.45, ['OBSERVER: 01'], { when: NEW }),
  big('observer-02', 'observerN', 0.04, 0.45, ['OBSERVER: 02'], { when: AGAIN }),
  ...say('count-new', 'observerN', 0.49, 0.98, D, '— Sizi hesaplayamıyorum. Yalnızca sayabiliyorum.', { when: NEW }),
  ...say('count-again', 'observerN', 0.49, 0.98, D, '— Bu geceyi daha önce de okudunuz. Arif ilk kez yaşıyor.', { when: AGAIN }),
  tell('nod', 'freedom', 0.04, 0.45, ['Arif ekranın baktığı yere döndü. Kimseyi göremedi; yine de başıyla hafifçe selam verdi.']),
  tell('freedom', 'freedom', 0.49, 0.97, ['Belki de özgürlük, hesabın dışında kalan küçük bir boşluktu.'], { strong: true, purpose: 'reveal' }),

  // ——— 10 — SON SORU (03.05–03.12) ———
  stamp('clock-0305', 'message', 0.04, 0.3, '03.05'),
  tell('phone', 'message', 0.04, 0.32, ['Arif telefonu çevirdi. Ekranda okunmamış bir mesaj vardı.']),
  ...say('defne', 'message', 0.35, 0.7, 'DEFNE · 22.53', '— Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim.', { purpose: 'reveal' }),
  tell('reread', 'message', 0.73, 1.0, ['Arif mesajı iki kez okudu. “Sorun değil” kısmını üç kez.'], { purpose: 'mood' }),
  tell('coming', 'coat', 0.03, 0.6, ['Bir şey yazdı, sildi. Bir şey daha yazdı, onu da sildi. Sonra yalnızca “Geliyorum” yazdı.', 'Ceketini askıdan aldı. Kapıya kadar yürüdü, orada durdu.']),
  ...say('one-more', 'coat', 0.64, 0.98, A, '— Son bir şey.'),
  ...say('ask-first', 'query', 0.03, 0.36, D, '— Geleceğini bilmek ister misin?'),
  ...say('was-mine', 'query', 0.39, 0.66, A, '— Bunu ben soracaktım.'),
  ...say('i-know', 'query', 0.69, 0.98, D, '— Biliyorum.'),
  ...say('break-it', 'answer', 0.04, 0.47, A, '— Bunu söyleyince bozulmaz mı?', { when: flag('end:yes') }),
  ...say('unbreakable', 'answer', 0.51, 0.97, D, '— Bu, bozulmayan türden.', { when: flag('end:yes'), purpose: 'reveal' }),
  ...say('good-night', 'answer', 0.04, 0.47, A, '— İyi geceler.', { when: flag('end:no') }),
  tell('standby', 'answer', 0.51, 0.97, ['DURUM cevap vermedi. Ekranda, imlecin yanında tek bir satır kaldı: Soru bekleniyor.'], { when: flag('end:no') }),
  stamp('clock-0312', 'gone', 0.5, 0.95, '03.12'),
  tell('gone-yes', 'gone', 0.03, 0.42, ['Arif kapıyı kapattı. Koridorda, daha devrilmemiş bir reçele güldü.'], { when: flag('end:yes'), purpose: 'mood' }),
  tell('gone-no', 'gone', 0.03, 0.42, ['Arif kapıyı kapattı. Sabahı bilmiyordu; eve gittiğini biliyordu.'], { when: flag('end:no'), purpose: 'mood' }),
  big('unknown', 'gone', 0.48, 0.98, ['Her şeyin durumu: bilinmiyor.']),
  tell('street', 'end', 0.04, 0.5, ['Üç kat aşağıda, boş caddede bir adam eve yürüyordu.'], { purpose: 'mood' }),
  { id: 'end', seg: 'end', from: 0.55, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['DURUM'], sub: 'Gelecek hesaplanabilir. Yine de yaşanması gerekir.', fade: 0.4 },
]

/** The six decisions. What is chosen becomes flags the words and the set read. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'coin',
    seg: 'thumb',
    at: 0.93,
    style: 'choice',
    title: '21.10 · YAZI TURA',
    prompt: 'Para Arif’in başparmağında. DURUM soruyor: “Söyleyeyim mi?”',
    options: [
      { id: 'yazi', label: 'Yazı.', reply: ['Arif “Yazı” dedi ve parayı fırlattı.', 'Para dönerek yükseldi, avucuna kapandı.'], sets: ['coin:yazi'] },
      { id: 'tura', label: 'Tura.', reply: ['Arif “Tura” dedi ve parayı fırlattı.', 'Para dönerek yükseldi, avucuna kapandı.'], sets: ['coin:tura'] },
      { id: 'none', label: 'Sorma. At.', reply: ['Arif hiçbir şey demeden parayı fırlattı.', 'Para dönerek yükseldi, avucuna kapandı.'], sets: ['coin:none'] },
    ],
  },
  {
    id: 'glass',
    seg: 'glassChoice',
    at: 0.5,
    style: 'choice',
    title: '21.14 · TERSİNE',
    prompt: 'Zarf kapalı. Bardak Arif’in elinde. Tahminin tersi ne olabilir?',
    options: [
      { id: 'kitchen', label: 'Bardağı mutfağa götür.', reply: ['Arif bardağı alıp koridora çıktı.'], sets: ['glass:kitchen'] },
      { id: 'break', label: 'Bardağı kır.', reply: ['Arif bardağı masanın kenarına vurdu.', 'Ses, bir bardaktan beklenmeyecek kadar büyüktü.'], sets: ['glass:break'] },
      { id: 'none', label: 'Hiçbir şey yapma.', reply: ['Arif bardağı bıraktı. Ellerini dizlerine koydu.'], sets: ['glass:none'] },
    ],
  },
  {
    id: 'boxes',
    seg: 'choose',
    at: 0.5,
    style: 'choice',
    title: '21.36 · İKİ KUTU',
    prompt: 'A’da bin lira, gözünün önünde. B’de ya bir milyon var ya hiçbir şey.',
    options: [
      { id: 'one', label: 'Yalnızca B.', reply: ['Arif saydam kutuyu kenara itti.', 'Kapalı kutunun mührünü kırdı.'], sets: ['box:one'] },
      { id: 'two', label: 'İkisini birden.', reply: ['Arif saydam kutuyu kendine çekti.', 'Sonra kapalı kutunun mührünü kırdı.'], sets: ['box:two'] },
    ],
  },
  {
    id: 'counterfactual',
    seg: 'cfGate',
    at: 0.5,
    style: 'query',
    title: '00.41 · KARŞI-OLGU',
    prompt: 'Başlangıçta tek bir şeyi değiştir.',
    options: [
      { id: 'air', tag: 'HAVA', label: 'Kızılay’ın üstündeki bir hava parselini binde bir derece ısıt.', speaker: D, reply: ['İki dünya açıyorum.', 'Birinde bu gece. Öbüründe, binde bir derece daha sıcak bir gece.'], sets: ['cf:air'] },
      { id: 'bus', tag: 'ŞEHİR', label: '413 numaralı otobüsü kırk saniye geciktir.', speaker: D, reply: ['İki dünya açıyorum.', 'Birinde 413 vaktinde. Öbüründe kırk saniye geç.'], sets: ['cf:bus'] },
    ],
  },
  {
    id: 'great',
    seg: 'rebuild',
    at: 0.5,
    style: 'query',
    title: '02.24 · SORUYU TAMAMLA',
    prompt: 'Cevap hazır. Soruyu yeniden kur.',
    options: [
      { id: 'nothing', tag: 'VARLIK', label: 'Neden hiçbir şey yokken bir şey var?', speaker: D, reply: ['Bu soruyu soracak birinin olduğu her evrende, bir şey vardır.'], sets: ['q:nothing'] },
      { id: 'death', tag: 'ÖLÜM', label: 'Ölünce ne olur?', speaker: D, reply: ['Durumun devam eder. Sen etmezsin.', 'Hangisinin sen olduğunu sana sormalıyım.'], sets: ['q:death'] },
      { id: 'what', tag: 'EYLEM', label: 'Ne yapmalıyım?', speaker: D, reply: ['Bunu sormak, yapacağın şeyin bir parçası.'], sets: ['q:what'] },
    ],
  },
  {
    id: 'future',
    seg: 'queryGate',
    at: 0.5,
    style: 'query',
    title: 'QUERY INPUT',
    prompt: 'GELECEĞİNİ BİLMEK İSTER MİSİN?',
    options: [
      { id: 'yes', tag: 'YANIT', label: 'Evet.', speaker: D, reply: ['Yarın 07.42’de Defne’yle kahvaltı edeceksin.', 'Reçeli devireceksin. Gülecek.'], sets: ['end:yes', 'mem:observed'] },
      { id: 'no', tag: 'YANIT', label: 'Hayır.', reply: ['DURUM sustu.', 'İmleç yanıp söndü.'], sets: ['end:no', 'mem:observed'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  demon:
    'Bir an ver bana; sana bütün zamanları vereyim. Perşembe, 20.58. Arif her akşam bu saatte Ankara’daki eski gözlemevinin bodrumuna iner. Bina yamaçtadır; bodrumun pencereleri şehre bakar. Işıkların çoğu sönüktür; cam bölmenin ardında sunucu salonu nefes alır gibi yanıp söner. Arif ceketini askıya asar, telefonunu her akşamki gibi ters çevirip masaya bırakır. Kahve köşesine geçtiğinde duvar ekranında bir satır belirir: “İyi akşamlar Arif. Kahveyi bu akşam iki şekerli içeceksin.” “Tek şeker,” der Arif. “Biliyorum,” diye yazar makine. Arif bir şeker atar; eli bir an havada kalır, sonra ikincisini de atar. Fark etmez. DURUM, evrenin şu anki hâlini olabildiğince eksiksiz tutmak için kurulmuştur: nerede ne var, ne hızla gidiyor ve sonra ne olacak. Tek bir kuralı vardır; biri onu kâğıda basıp bölmenin camına bantlamıştır: Tahmin yayımlanırsa geçersiz olur.',
  small:
    '21.00. Arif yedi yıldır her akşam DURUM’a bir şey sorar. Büyük şeyler sormayı çoktan bırakmıştır; küçük şeyler daha iyi sınar. “Selin bu gece kaç simit yiyecek?” “Bir buçuk. Yarısını sana verecek.” Dün de, bugün 14.17’de Kızılay köşesinden kaç araba geçeceğini sormuştu. Kamera kaydını açar, elindeki sayaçla sayar, bir daha sayar: iki yüz on iki. Sonra her akşamki küçük sınav gelir. Cebinden bir lira çıkarıp başparmağının tırnağına koyar. DURUM sorar: “Söyleyeyim mi?” Okur seçer: Arif “Yazı” der, “Tura” der ya da hiçbir şey demeden parayı fırlatır. Para dönerek yükselir, avucuna kapanır. Avucunu açmadan önce Arif masadaki küçük yazıcıdan sarkan fişi koparır; fiş, DURUM “Söyleyeyim mi?” diye sorduğu anda basılmıştır. Fişte paranın değil, ne denileceğinin tahmini yazar: “Yazı diyeceksiniz” (ya da “Tura diyeceksiniz”, “Hiçbir şey demeyeceksiniz”); altında da “Para tura gelecek.” Arif avucunu açar: tura. “Bana ‘siz’ demezsin,” der. DURUM: “Sana demedim.” Arif arkasına bakar. Odada ondan başka kimse yoktur.',
  prophecy:
    '21.13. Arif meydan okur: “Şimdi ne yapacağımı söyle. Tersini yapacağım.” DURUM: “Söylersem, söylediğimi bilerek yaparsın. O zaman tahminim, beni duyan bir Arif için olur. Duymayan Arif için ayrı bir tahminim var.” Köşedeki eski yazıcı takırdayarak tek bir sayfa basar; sayfa katlanır, zarfa girer, zarf mühürlenir. “Sonra aç.” Arif zarfı masaya koyar ve her şeyi tersine yapmaya başlar: sandalyeye ters oturur, kalemi bilerek düşürür, bardağı alır, bırakır, yine alır. Okur, tahminin tersi ne olabilir diye düşünüp bardakla ne yapılacağını seçer. Mutfağa götürülürse Arif bardağı yıkar, kurular, dolaba koyar ve hiç bu kadar özgür hissetmez. Kırılırsa ses bir bardaktan beklenmeyecek kadar büyüktür; kırıklar halıya dağılır, kalbi bir bardak için fazla hızlı atar. Hiçbir şey yapılmazsa Arif ellerini dizlerine koyar ve kıpırdamamanın sandığından zor olduğunu öğrenir. Sonra zarfı açar. Kâğıdın ilk satırında tam olarak yaptığı şey yazar; altında: “Tersini yapmaya çalışacaksın. Bunu da ben söyledim diye yapacaksın.” Arif güler. Sonra gülmez. Gece teknisyeni Selin içeri girer: “Soğutma ünitesi ağlıyor. Dokuz dakikalık davranış modeli mi? Kimin?” “Benim.” “Bir dahaki sefere bana da söyle. Çayımı ona göre içerim.”',
  boxes:
    '21.31. Selin, Arif’in masasına iki kutu bırakır; gündüz ekibi getirmiştir, DURUM’un talimatıyla. Saydam A kutusunda bin lira vardır. Kapalı B kutusunun mühründe dünün tarihi yazar. DURUM açıklar: “B’yi dün gece, sen gelmeden doldurttum. Yalnızca B’yi alacağını tahmin ettiysem içinde bir milyon var. İkisini alacağını tahmin ettiysem boş.” Arif’in aklı ikiye bölünür. Bir yandan: kutular dün doldurulmuştu, ne seçersen seç içleri artık değişmez; ikisini al, her durumda bin lira öndesin. Öte yandan: ama o hiç yanılmaz; kayıtlara göre yalnızca B’yi alan otuz bir kişinin otuz biri de zengin çıkmıştır. Okur seçer. Yalnızca B alınırsa Arif saydam kutuyu kenara iter, mührü kırar: içinde bir milyon liralık bir çek vardır. Çeke dünün tarihini taşıyan bir fiş iliştirilmiştir: “Yalnızca B’yi alacaksınız. Kurul bunu geri isteyecek.” “A’daki bin lira?” “Onu dün gece bıraktın.” İkisi birden alınırsa B boştur; dibine yapıştırılmış fişte dünün tarihi ve şu satırlar vardır: “İkisini birden alacaksınız. O yüzden bu kutu boş.” “Bin lira kazandım.” “Bir milyonu da dün gece kaybettin.” Arif sorar: “Ya yanılsaydın?” DURUM: “Bu evrende yanılmadım.”',
  uncertainty:
    'Gece küçük işlerle geçer: yedekler, kayıtlar, Selin’in verdiği yarım simit. 22.53’te masadaki telefon, ters durduğu yerde bir kez titrer. Masada kimse yoktur. 23.30’da Arif duvar ekranına tek bir elektron çağırır: “Bu elektron. Nerede olduğunu ve ne hızla gittiğini söyle.” DURUM itiraf eder: “Beni yapanlar her şeyin konumunu ve hızını bildiğimi söyler. Söylediklerinde yanılıyorlar. Bir şeyin yerini ne kadar kesin bilirsem, hızını o kadar az bilirim. Bu benim kusurum değil. Evrenin dokusu bu.” “Yani bilmiyorsun.” “Neyi bilmediğimi tam olarak biliyorum. Ben noktaları bilmem. Dalgaları bilirim. Bir dalga, olabileceği her yerdir.” Ekrandaki nokta bir buluta dönüşür. Arif ekrana dokunur; bulut tek bir noktaya çöker. Elini çeker; nokta yeniden yayılır. Sonra bir atom çağırır: “Şu atom. Bir saat içinde bozunacak mı?” “Yüzde elli.” “Hangi elli?” “Bazı açıklamalara göre, ikisi de.” Her şeyin durumu, kesinliklerin değil olasılıkların durumudur.',
  butterfly:
    '00.24. Kuyrukta Sarıyer’deki bir düğün salonundan gelmiş bir sorgu vardır: bir yıl sonraki 15 Ağustos’ta, öğleden sonra İstanbul’a yağmur yağacak mı? DURUM: “Hesaplayabilirim. Cevap bu gece Belgrad Ormanı’nda bir kelebeğin hangi yöne döndüğüne bağlı.” Ormanda, karanlıkta, bir kelebek kanatlarını açar; hangi yöne döneceğini o da bilmez. Ekranda iki dünya yan yana başlar; aralarındaki fark milyarda birdir. Önce aynı giderler. Üçüncü günün öğleden sonrasında ayrılırlar; on dördüncü günde hiçbir benzerlikleri kalmamıştır. “Düğün salonuna ne diyeceğiz?” “Çadır kursunlar.” “Başta çok küçük bir şeyi değiştirirsem?” Okur başlangıçtaki tek değişikliği seçer. Kızılay’ın üstündeki bir hava parseli binde bir derece ısıtılırsa, üçüncü gün öğleden sonra yirmi kilometre güneyde bir fırtına hücresi doğar ve yıldırım Gölbaşı’nda bir trafoya düşer. 413 numaralı otobüs kırk saniye geciktirilirse, bir adam aktarmayı kaçırır, sonraki otobüste bir kadının yanına oturur; konuşurlar ve kadın trafo merkezindeki nöbetine yarım saat geç kalır. İki yolda da bir mahallenin ışıkları kırk dakika geç yanar. O karanlıkta bir telefon çalar; açan olmaz. Pencereden bakılırsa, bu dünyada bütün mahallelerin ışıkları yanmaktadır. DURUM: “Bazı sistemlerde sonuç çok az değişir. Bazılarında çok fazla.” Arif: “O zaman determinizm yanlış.” DURUM: “Hayır. Determinizm doğru olabilir ve yine de hiçbir şey bilinemez.”',
  mirror:
    '01.24. “Kendini de hesaplıyor musun?” DURUM: “Evreni hesaplamak için kendimi hesaplamalıyım. Kendimi hesaplamak için, kendimi hesaplayan kendimi.” Arif cam kapıyı itip sunucu salonuna girer. Rafların arasında yürüdükçe koridor uzar; dipteki duvar bir türlü yaklaşmaz. Her rafın siyah camında bir raf daha vardır, onun camında bir tane daha. Konsolun ekranında salon görünür; salonda konsol, konsolda yine salon. Hava ısınır, fanların sesi tizleşir. Soğutma ünitesinin başındaki Selin: “Kendi soğutmasını hesaplamak için ek soğutma istiyor.” “Ver gitsin.” “Ek soğutmayı da hesaplayacak.” DURUM: “Bazı gelecekleri, onlar gerçekleşmeden daha hızlı hesaplayamam. Onları bilmenin tek yolu beklemek.” Selin: “Benim işim de bu. Adına nöbet diyorlar.” Makine geleceği görmüyordu. Gelecekle aynı hızda yaşıyordu.',
  question:
    '02.15. Kuyruğun en dibinden mühürlü bir sorgu yükselir. Kurul göndermiştir; yıllardır sırasını beklemektedir. Tek satırdır: Hayatın, evrenin ve her şeyin anlamı nedir? DURUM düşünür; salondaki bütün fanlar aynı anda yavaşlar. Ekranda “Hesaplanıyor. Tahmini süre: evrenin yaşından uzun” yazar. Sonra satır silinir: “Cevap hazır. Soru eksik.” “Cevabı söyle o zaman,” der Arif. DURUM: “Cevap bir konum. Neyin konumu olduğunu bilmeden işinize yaramaz. Bana ‘anlam’ dediğiniz şeyin durumunu verin. Konumunu ve hızını.” Arif güler. Kurul cevap vermez; kurullar pek vermez. Arif Kurul’un satırını siler; imleç boş satırda yanıp söner. Okur soruyu yeniden kurar. “Neden hiçbir şey yokken bir şey var?” diye sorarsa: “Bu soruyu soracak birinin olduğu her evrende, bir şey vardır.” Arif ekrana uzun uzun bakar: soran biri vardır, demek ki bir şey vardır. “Ölünce ne olur?” diye sorarsa: “Durumun devam eder. Sen etmezsin. Hangisinin sen olduğunu sana sormalıyım.” Arif bir şey yazmaz; hangisi olduğunu bilmez. “Ne yapmalıyım?” diye sorarsa: “Bunu sormak, yapacağın şeyin bir parçası.” Arif ellerini klavyeden çeker; sormuştur bile. Belki cevaplar hep hazırdı. Eksik olan, soranın kendisiydi.',
  observer:
    '02.53. Model, hesaba giremeyen bir girdiyi işaretler. Bütün ekranlarda aynı satır yanar: “Observer input detected. Kaynak: bu odada değil.” Bütün sesler susar; yalnızca kaydırmanın tıkırtısı kalır. Duvar ekranı ayağının üstünde yavaşça döner; DURUM, Arif’e değil okura döner. “Bu gece verdiğiniz kararların hepsini biliyordum. Biri hariç: ne zaman kaydıracağınızı.” Ekranda okurun bu gece verdiği kararlar sıralanır: yazı turada ne dediği, bardağa ne yaptırdığı, hangi kutuyu aldığı, başlangıçta neyi değiştirdiği, soruyu nasıl kurduğu. DURUM üçünü okur: paraya ne denildiğini ve paranın yine tura geldiğini, kutulardan hangisinin alındığını, saat 02.24’te hangi sorunun sorulduğunu. Sonra bir sayı belirir: “Observer: 01.” DURUM: “Sizi hesaplayamıyorum. Yalnızca sayabiliyorum.” Gece daha önce sonuna kadar okunduysa sayı 02’dir ve DURUM şunu söyler: “Bu geceyi daha önce de okudunuz. Arif ilk kez yaşıyor.” Arif ekranın baktığı yere döner. Kimseyi göremez; yine de başıyla hafifçe selam verir. Belki de özgürlük, hesabın dışında kalan küçük bir boşluktu.',
  last:
    '03.05. Arif telefonu çevirir. Ekranda, Defne’nin 22.53’te gönderdiği okunmamış bir mesaj vardır: “Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim.” Arif mesajı iki kez okur; “Sorun değil” kısmını üç kez. Bir şey yazar, siler. Bir şey daha yazar, onu da siler. Sonra yalnızca “Geliyorum” yazar. Ceketini askıdan alır, kapıya kadar yürür ve orada durur. “Son bir şey.” Duvar ekranı ayağının üstünde ona döner; DURUM ondan önce sorar: “Geleceğini bilmek ister misin?” “Bunu ben soracaktım.” “Biliyorum.” Okur cevap verir. Evet derse DURUM tek bir sıradan an söyler: “Yarın 07.42’de Defne’yle kahvaltı edeceksin. Reçeli devireceksin. Gülecek.” Arif sorar: “Bunu söyleyince bozulmaz mı?” “Bu, bozulmayan türden.” Arif kapıyı kapatır; koridorda, daha devrilmemiş bir reçele güler. Hayır derse DURUM susar, imleç yanıp söner. Arif “İyi geceler” der. DURUM cevap vermez; ekranda imlecin yanında tek bir satır kalır: Soru bekleniyor. Arif kapıyı kapatır. Sabahı bilmez; eve gittiğini bilir. 03.12. Oda boşalır, ekranlar birer birer kararır. Makine kendi kendine tek bir satır yazar: Her şeyin durumu: bilinmiyor. Üç kat aşağıda, boş caddede bir adam eve yürümektedir. DURUM. Gelecek hesaplanabilir. Yine de yaşanması gerekir.',
}

/** Where the HUD steps back: the inscription, the forest, the mirror, the observer, the empty room. */
export const QUIET: Array<readonly [number, number]> = [
  [0, at('enter', 0.05)],
  [at('forest'), at('forest', 1)],
  [at('hallWalk'), at('hallWalk', 1)],
  [at('turn'), at('observerN', 1)],
  [at('gone', 0.45), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.1, text: '[sunucu salonunun fanları, camın ardından, düzenli]' },
  { seg: 'enter', at: 0.04, text: '[kapı açılır, kapanır]' },
  { seg: 'enter', at: 0.8, text: '[telefon masaya ters bırakılır]' },
  { seg: 'coffee', at: 0.04, text: '[kahve makinesi fokurdar]' },
  { seg: 'coffee', at: 0.76, text: '[şeker fincana düşer]' },
  { seg: 'coffee', at: 0.86, text: '[ikinci şeker fincana düşer]' },
  { seg: 'ritual', at: 0.6, text: '[uzakta Selin’in klavyesi; kâğıt poşet hışırdar]' },
  { seg: 'traffic', at: 0.45, text: '[el sayacı tıkırdar]' },
  { seg: 'thumb', at: 0.55, text: '[masadaki küçük yazıcı kısa bir an çalışır]' },
  { seg: 'thumb', at: 0.96, text: '[para havada çınlayarak döner]' },
  { seg: 'palm', at: 0.02, text: '[para avuca kapanır]' },
  { seg: 'palm', at: 0.14, text: '[fiş koparılır]' },
  { seg: 'envelope', at: 0.06, text: '[eski yazıcı takırdayarak basar]' },
  { seg: 'envelope', at: 0.45, text: '[zarf tepsiye düşer]' },
  { seg: 'contrary', at: 0.55, text: '[kalem halıya düşer]' },
  { seg: 'glassChoice', at: 0.56, text: '[cam kırılır]', when: flag('glass:break') },
  { seg: 'opened', at: 0.04, text: '[mutfakta musluk akar; dolap kapağı kapanır]', when: flag('glass:kitchen') },
  { seg: 'opened', at: 0.04, text: '[odada yalnızca fanlar]', when: flag('glass:none') },
  { seg: 'opened', at: 0.44, text: '[zarf yırtılır]' },
  { seg: 'selin', at: 0.03, text: '[soğutma ünitesi ağlar gibi uğuldar]' },
  { seg: 'boxes', at: 0.3, text: '[kutular masaya bırakılır]' },
  { seg: 'choose', at: 0.6, text: '[mühür kırılır, kapak açılır]' },
  { seg: 'lapse', at: 0.55, text: '[ters duran telefon bir kez titrer]' },
  { seg: 'cloud', at: 0.48, text: '[ekrana dokunulur; ince bir tık]' },
  { seg: 'atom', at: 0.05, text: '[seyrek, düzensiz tıkırtılar]' },
  { seg: 'forest', at: 0.04, text: '[gece rüzgârı, yapraklar]' },
  { seg: 'forest', at: 0.62, text: '[kanat çırpışı]' },
  { seg: 'twoWorlds', at: 0.6, text: '[uzakta yağmur]' },
  { seg: 'chain', at: 0.3, text: '[uzak bir gök gürültüsü]', when: flag('cf:air') },
  { seg: 'chain', at: 0.1, text: '[otobüs kapısı kapanır, otobüs kalkar]', when: flag('cf:bus') },
  { seg: 'chain', at: 0.75, text: '[bir telefon çalar; kimse açmaz]' },
  { seg: 'hallWalk', at: 0.04, text: '[cam kapı açılır; fanlar yükselir]' },
  { seg: 'heat', at: 0.04, text: '[fanlar tizleşir; ince bir rezonans]' },
  { seg: 'computing', at: 0.06, text: '[bütün fanlar aynı anda yavaşlar]' },
  { seg: 'rebuild', at: 0.2, text: '[tuşlar; satır silinir]' },
  { seg: 'input', at: 0.5, text: '[kısa bir uyarı sesi]' },
  { seg: 'turn', at: 0.02, text: '[her şey susar; yalnızca kaydırmanın tıkırtısı]' },
  { seg: 'freedom', at: 0.05, text: '[oda sesi geri gelir]' },
  { seg: 'message', at: 0.04, text: '[telefon çevrilir; ekran açılır]' },
  { seg: 'coat', at: 0.45, text: '[askı sallanır]' },
  { seg: 'gone', at: 0.05, text: '[kapı kapanır]' },
  { seg: 'gone', at: 0.45, text: '[ekranlar birer birer söner]' },
  { seg: 'end', at: 0.1, text: '[uzakta tek bir araba; adımlar]' },
  { seg: 'end', at: 0.55, text: '[tek bir piyano notası]' },
]

/** World positions match the observatory set in docs/stories/durum.md (meters). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'inscription',
    title: 'Kuruluş yazıtı',
    seg: 'open',
    from: 0,
    to: 7,
    pos: [-3.125, 2.42, -3.94],
    size: 0.5,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['Cam kapının üstünde pirinç bir levha: “Bir an ver bana; sana bütün zamanları vereyim.”', 'Altında küçük harflerle: “Laplace’a, 1814.”'] },
  },
  {
    id: 'stopped-clock',
    title: 'Duran saat',
    seg: 'enter',
    from: 0,
    to: 10,
    pos: [0.6, 2.35, 3.98],
    size: 0.35,
    kind: 'anomaly',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Duvar saati 21.13’te durmuştu.', 'DURUM onu hiç düzeltmemişti. Saatin kaç olduğunu zaten biliyordu.'] },
  },
  {
    id: 'sugar',
    title: 'İki şeker kâğıdı',
    seg: 'coffee',
    from: 0.9,
    to: 3,
    pos: [-4.55, 0.93, 0.72],
    size: 0.12,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Kahve makinesinin yanında iki boş şeker kâğıdı.', 'Arif kahvesini tek şekerle içerdi.'] },
  },
  {
    id: 'report',
    title: 'Kırmızı satır',
    seg: 'ritual',
    from: 0,
    to: 4,
    pos: [-0.36, 0.77, -0.5],
    size: 0.25,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['DURUM · haftalık doğrulama raporu. Başarı: %99,97.', 'Tek kırmızı satır: 2 Kasım · hava durumu · YANLIŞ. Not: “Tahmin yayımlandı.”'] },
  },
  {
    id: 'yellow-note',
    title: 'Sarı not',
    seg: 'dare',
    from: 0,
    to: 5,
    pos: [0.27, 1.27, -0.84],
    size: 0.15,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Monitörün kenarında sarı bir not: “Defne’ye teleskobu göster. Cumartesi, 19.00.”', '“Cumartesi” iki kez çizilip yeniden yazılmış.'] },
  },
  {
    id: 'drawing',
    title: 'Bir çocuk resmi',
    seg: 'boxes',
    from: 0,
    to: 6,
    pos: [3.695, 1.22, 0.98],
    size: 0.25,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Selin’in bölmesine iğnelenmiş bir çocuk resmi.', '“Annemin işi: bilgisayar uyumasın diye bekliyor.”'] },
  },
  {
    id: 'city',
    title: 'Bu dünyada',
    seg: 'chain',
    from: 0,
    to: 1.3,
    pos: [5.0, 1.7, 0],
    size: 1.6,
    kind: 'environment',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Pencereden Ankara.', 'Bütün mahallelerin ışıkları yanıyordu. Bu dünyada.'] },
  },
  {
    id: 'self-rack',
    title: 'Öz-model rafı',
    seg: 'hallWalk',
    from: 0,
    to: 3,
    pos: [0.6, 1.95, -7.885],
    size: 0.4,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['ÖZ-MODEL · KATMAN 7', 'Uyarı: kendi soğutmasını hesaplamak için ek soğutma gerekiyor. Ayrıntı için bkz. KATMAN 8.'] },
  },
  {
    id: 'scroll-log',
    title: 'Kaydırma günlüğü',
    seg: 'turn',
    from: 0,
    to: 3,
    pos: [-4.72, 1.28, -7.2],
    size: 0.4,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Salondaki konsolda, kimsenin açmadığı bir günlük: KAYDIRMA.', 'Son girdi: şimdi. Ondan önceki: şimdi.'] },
  },
  {
    id: 'old-question',
    title: 'Aynı soru',
    seg: 'query',
    from: 0,
    to: 2.2,
    pos: [-0.66, 1.1, -0.74],
    size: 0.3,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Sol monitörde sorgu geçmişi. Eski bir satır: “Geleceğimi bilmek ister miyim?” — Arif, üç yıl önce.', 'Yanıt alanı boş. Durum: soru bekleniyor.'] },
  },
]
