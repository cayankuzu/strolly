/**
 * TEKERRÜR — every word the reader sees, anchored to the screenplay
 * (docs/stories/tekerrur.md). The first version, told in full.
 *
 * Arif sleeps at his desk in a square room whose walls are a forest. He wakes,
 * cleans, goes through the right door and comes back forty minutes later with
 * three robots; the third carries nothing, because its lens is always on him.
 * He opens the archive behind the left door, pulls a switch, and the machine
 * begins to read the whole of history: one square across the years, a
 * network, a spiral whose every turn sits on the same circle. Above today
 * there is one more record — tomorrow, 05:12, a man asleep at this desk. He
 * presses the button anyway. One word. Then the records of every night, none
 * of them the first, and a room that starts over — until something watching
 * it is noticed.
 *
 * Narration: past tense, the author's sentences wherever he wrote one; the
 * generic "siz" of the first version ("yaparsınız", "bakarsanız") is kept for
 * its aphorisms. The machine speaks English on its screens (ANOMALY, SUBJECT,
 * ITERATION, OBSERVER DETECTED…), as in the author's first brief.
 *
 * Tokens (resolved per pass, because the story loops):
 *   {IT0}…{IT4} → iteration numbers, {TODAY} → this pass's date,
 *   {NEXT} → the next pass's date. Tokens resolve only in TEXT (not in
 *   discoveries or the transcript), so those never name a date or number.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment } from '../types'
import { BASE_ITERATION, ERAS, SEG, at, type SegmentId } from './timeline'

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
  stagger: lines.length > 1 ? 0.42 : undefined,
  ...extra,
})

/** A spoken line: the speaker in the caption, the words on the rail. */
const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.22 },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.22 },
]

/** A big line alone in the middle of the frame. */
const center = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'center',
  kind: 'reveal',
  purpose: 'reveal',
  lines,
  ...extra,
})

/** The square's years, in the caption slot: five over `history`, four over `repeat`. */
const years: T[] = ERAS.map(({ year, word }, i) => {
  const first = i < 5
  const n = first ? 5 : 4
  const k = first ? i : i - 5
  return {
    id: `year-${year}`,
    seg: first ? 'history' : 'repeat',
    from: k / n + 0.02,
    to: (k + 1) / n - 0.01,
    slot: 'caption',
    kind: 'year',
    purpose: 'context',
    lines: [year],
    sub: word || undefined,
    fade: 0.2,
  }
})

/** The five records that open in GÖZLEMCİ, one per fifth of the segment. */
const iterations: T[] = [0, 1, 2, 3, 4].map((k) => ({
  id: `it${k}`,
  seg: 'records',
  from: k * 0.2 + (k === 0 ? 0.01 : 0),
  to: k * 0.2 + 0.19,
  slot: 'top',
  kind: 'iteration',
  purpose: 'system',
  lines: [`ITERATION {IT${k}}`],
  fade: 0.08,
}))

export const TEXT: T[] = [
  // 01 — UYANIŞ
  center('opening', 'black', -1, 0.92, ['Arif’in odasında gün, doğadan önce başlıyordu.'], { purpose: 'mood', sub: 'SCROLL', fade: 0.4 }),
  tell('paranoid', 'asleep', 0.03, 0.58, ['Paranoyak bir şekilde uyuyordu.', 'Başı dokunmatik çalışma masasının üstündeydi; kolları iki yandan sarkıyordu.'], { purpose: 'mood' }),
  tell('drool', 'asleep', 0.62, 1.0, ['Ağzından akan salya masanın yüzeyine değmişti.']),
  tell('screens', 'desk', 0.04, 0.6, ['Önündeki dev ekran kapalıydı; sağında ve solunda iki dev ekran daha duruyordu.', 'Masa kocaman bir bilgisayar odasını andırıyordu.']),
  tell('working', 'desk', 0.64, 1.03, ['Uyurken bile çalışıyordu.'], { purpose: 'foreshadow' }),
  tell('walls', 'walls', 0.04, 0.56, ['Odanın bütün duvarları ekranlarla kaplıydı.', 'Görüntüler sayesinde insan kendini içeride değil, ormanın içinde, bir akarsuyun kenarında sanıyordu.']),
  tell('real', 'walls', 0.6, 1.03, ['Akarsuyun sesi, üç yüz altmış derecelik görüntü…', 'Hepsi son derece gerçekçiydi.'], { purpose: 'mood' }),
  tell('not-real', 'stream', 0.06, 1.02, ['Dışarıdaki dünya gerçek değildi.', 'Ama yeterince uzun bakarsanız, gerçeğinden ayırmak da mümkün değildi.'], { purpose: 'foreshadow', stagger: 0.38 }),
  tell('square', 'doors', 0.04, 0.46, ['Oda kare biçimindeydi. İki yan duvarın tam ortasında, karşı karşıya iki kapı vardı.']),
  tell('brutal', 'doors', 0.5, 1.02, ['Kapılar da ekranla kaplıydı, ama ağır, brütalist çerçeveleri onları duvarlardan ayırıyordu.', 'Kapı oldukları belliydi.']),
  tell('sky', 'ceiling', 0.03, 0.42, ['Tavanı bulutlar ve hafif bir güneş ışığı süslüyordu.'], { purpose: 'mood' }),
  tell('season', 'ceiling', 0.46, 1.02, ['Gün akışı tavana yansıyor, saat ilerledikçe döngü tamamlanıyordu.', 'Yaz sonuyla ilkbahar başı arasında bir mevsim yaşatıyordu; burası adeta mevsimsel bir deneyim odasıydı.'], { purpose: 'mood' }),
  tell('glasses', 'wake', 0.03, 0.5, ['Burnunun üstünde yamuk duran gözlüğünü, masadan sarkan sağ koluyla düzeltti.']),
  tell('eyes', 'wake', 0.54, 1.02, ['Ağır ağır gözlerini açtı. Doğruldu; kendine gelmek için ellerini yüzüne götürüp ovuşturdu.']),
  tell('cheek', 'wipe', 0.03, 0.47, ['Uyurken yanağında biriken salyayı elinin tersiyle sildi.']),
  tell('cloth', 'wipe', 0.51, 1.02, ['Koltuğunun altından bir bez çıkardı ve masadaki salyayı temizledi.']),
  tell('throw', 'throw', 0.03, 0.5, ['Sonra bezi, bakmadan, odanın ön köşesindeki kutuya basket atar gibi fırlattı.']),
  tell('placed', 'throw', 0.55, 1.02, ['Bu odadaki hiçbir şey tesadüfen yerleştirilmemişti.'], { purpose: 'foreshadow' }),

  // 02 — DIŞARISI
  tell('stood', 'rise', 0.05, 0.98, ['Ayağa kalktı.', 'Çalışma masası odanın tam ortasındaydı.']),
  tell('heavy', 'walk', 0.03, 0.4, ['Sağındaki kapıya doğru ağır adımlarla ilerledi.']),
  tell('dusk', 'walk', 0.44, 1.02, ['Hava kararmaya yakındı ve serinlemişti. Belki gece yağmur da çiseleyebilirdi.', 'Arif’in sabahları hep akşamla birlikte başlardı.'], { purpose: 'mood' }),
  tell('treehouse', 'floor', 0.05, 1.0, ['Odanın zemini tahtadandı; sanki bir ağaç ev yapılmış da duvarları ve tavanı hiç bırakılmamış gibiydi.'], { purpose: 'mood' }),
  tell('handle', 'rightDoor', 0.03, 0.5, ['Yavaşça kapı koluna uzandı ve kapıyı açtı.', 'Kapının ardında orman sürüp gidiyordu; su, tahtaların altından akıyordu.'], { stagger: 0.45 }),
  tell('same-stream', 'rightDoor', 0.55, 1.1, ['Her sabah aynı akarsuyu dinliyordu.', 'İçeri girdi ve kapıyı kapattı.'], { purpose: 'foreshadow', stagger: 0.55 }),
  tell('nobody', 'forty', 0.1, 0.37, ['Oda, ormanı kimse için oynatmayı sürdürdü.'], { purpose: 'foreshadow' }),
  tell('drizzle', 'forty', 0.41, 0.69, ['Yağmur geceyi beklemeden çiselemeye başladı.'], { purpose: 'mood' }),
  tell('different', 'forty', 0.73, 1.02, ['Her sabah biraz farklı görünüyordu.'], { purpose: 'foreshadow', strong: true }),

  // 03 — RUTİN
  tell('forty-min', 'reopen', 0.03, 0.47, ['Yaklaşık kırk dakika sonra kapı yeniden açıldı.']),
  tell('changed', 'reopen', 0.51, 1.02, ['Kıyafetlerini değiştirmişti; saçları hâlâ ıslaktı.', 'Onu üç robot takip ediyordu.']),
  tell('trays', 'robots', 0.03, 0.5, ['Robotlardan birinde kahve takımı, ötekinde atıştırmalıklar vardı.']),
  tell('third', 'robots', 0.54, 1.02, ['Üçüncüsünde ise görünürde hiçbir şey yoktu.'], { purpose: 'foreshadow' }),
  tell('sat', 'sits', 0.05, 1.0, ['Arif yeniden masasına oturdu.', 'Üçüncü robot biraz uzakta durdu. Merceği ona dönüktü.'], { purpose: 'foreshadow' }),
  tell('hand', 'reach', 0.03, 0.5, ['Elini sağındaki boşluğa uzattı; robot hemen oraya ilerleyip kahveyi eline itti.']),
  tell('not-looking', 'reach', 0.55, 1.02, ['Robota bakmadı bile; gözleri kapalı ekrandaydı.']),
  tell('sip', 'sip', 0.03, 0.5, ['Bir yudum aldı, ardından bardağı aynı yere doğru uzatıp bıraktı.']),
  tell('caught', 'sip', 0.54, 1.02, ['Neyse ki robot yakalamıştı; zaten hiç kaçırdığı olmamıştı.']),
  tell('thousands', 'thousands', 0.04, 1.02, ['Bazı hareketleri düşünmeden yaparsınız.', 'Çünkü onları daha önce binlerce kez yapmışsınızdır.'], { purpose: 'foreshadow', strong: true, stagger: 0.5 }),

  // 04 — ARŞİV
  tell('button', 'hover', 0.03, 0.5, ['Önündeki dev monitörün altındaki büyük siyah düğmeye basacaktı.']),
  tell('stopped', 'hover', 0.54, 1.02, ['Durdu. Ayağa kalktı ve sol kapıya yöneldi.'], { purpose: 'turn' }),
  tell('fear', 'toLeft', 0.05, 1.02, ['Bilmediği şeylerden çok, hatırlamadığı şeylerden korkuyordu.'], { purpose: 'foreshadow' }),
  tell('slowly', 'leftDoor', 0.03, 0.49, ['Kapıyı yavaşça açtı.']),
  tell('forgets', 'leftDoor', 0.53, 1.03, ['İnsan unuturdu.']),
  tell('machine', 'deep', 0.04, 0.48, ['Makine unutmazdı.'], { strong: true }),
  tell('believed', 'deep', 0.53, 1.02, ['En azından Arif buna inanıyordu.'], { purpose: 'foreshadow' }),
  tell('vast', 'aisles', 0.03, 0.5, ['İçeride göz alabildiğine uzanan, derin ve geniş bir oda vardı.', 'Koridorlar kitap raflarını andırıyordu; ama raflarda kitaplar değil, dijital bilgi taşıyıcıları diziliydi.']),
  tell('categories', 'aisles', 0.54, 1.01, ['Tüm dünya tarihi; kitaplar, filmler, biyografiler, olaylar…', 'Hepsi kategorilere ayrılmış, ilgili koridorların belleklerinde saklanıyordu.']),
  tell('brain', 'core', 0.03, 0.5, ['Bilgisayarın beyni de buradaydı.', 'Arif’in aksine, hiç uyumuyordu.']),
  tell('all-history', 'core', 0.55, 1.02, ['Dünyanın tüm tarihi burada bulunabilirdi.'], { strong: true }),
  tell('switch', 'lever', 0.03, 0.44, ['Kapıdan içeri girdi, sağ taraftaki şalteri indirdi.']),
  tell('duty', 'lever', 0.48, 1.02, ['Unutmamak, onun için bir meziyet değildi.', 'Bir zorunluluktu.']),
  tell('whistle', 'whistle', 0.04, 1.02, ['Hafif bir ıslıkla ritim tutarak odasına döndü ve masasına oturdu.', 'Arşivin kapısını açık bıraktı.'], { purpose: 'mood', stagger: 0.5 }),

  // 05 — TARİH
  tell('red', 'red', 0.03, 0.48, ['Siyah düğme artık kırmızı yanıyordu.'], { purpose: 'turn' }),
  tell('sorting', 'red', 0.53, 1.04, ['Sistem, şu ana kadar olan bütün tarihi, olayları, haberleri kategorilere ayırarak inceliyordu.']),
  ...years,
  tell('by-heart', 'history', 0.02, 0.195, ['Arif bu meydanı ezbere biliyordu: saat kulesini, çeşmeyi, köşedeki fırını.']),
  tell('same-place', 'history', 0.215, 0.395, ['Makine meydana hep aynı yerden bakıyordu; değişen her şey görünsün diye.']),
  tell('fear-names', 'history', 0.415, 0.595, ['Aynı korku, farklı yıllarda başka isimlerle ortaya çıkıyordu.'], { purpose: 'turn' }),
  tell('clock', 'history', 0.615, 0.795, ['Kule yıkıldı; saati, yıkıldığı dakikada durdu.']),
  tell('first-time', 'history', 0.815, 1.02, ['Sonra herkes yeniden başladı; her seferinde ilk kez başladığını sanarak.'], { purpose: 'foreshadow' }),

  // 06 — ÖRÜNTÜ
  tell('buildings', 'repeat', 0.05, 0.3, ['Binalar değişiyordu.'], { purpose: 'turn' }),
  tell('people', 'repeat', 0.35, 0.6, ['İnsanlar değişiyordu.'], { purpose: 'turn' }),
  tell('story', 'repeat', 0.66, 1.02, ['Hikâye değişmiyordu.'], { purpose: 'turn', strong: true }),
  tell('network', 'network', 0.03, 0.5, ['Makine, olaylardan çok boyutlu bir ağ örüyordu.', 'Adeta bir insan beyni gibi, gelişmiş modellerle her şeyi birbirine bağlıyordu.']),
  tell('deleted', 'network', 0.54, 1.02, ['İnsandan farklı olarak, bu makinede unutmak diye bir şey yoktu;', 'yalnızca ilgili veri silinirse unutuluyordu.'], { purpose: 'foreshadow' }),
  tell('purpose', 'spiral', 0.03, 0.44, ['Amacı, geçmişe bakarak gelecekte olacakları önceden tahmin etmekti.']),
  tell('periods', 'spiral', 0.49, 1.02, ['Tarih belli aralıklarla kendini tekrar ediyordu.', 'Toplumlar, devletler hep aynı davranışlara dönüyordu: savaşlar, krizler…']),
  tell('loop', 'above', 0.03, 0.44, ['Dünya sanki kendi içinde bir döngüye girmiş gibiydi.'], { purpose: 'turn' }),
  tell('order', 'above', 0.48, 1.02, ['Karmaşanın içinde gizli bir düzen vardı.', 'Arif de o düzeni çözmek için bu makineyi kullanıyordu.'], { purpose: 'reveal', strong: true }),

  // 07 — ANOMALİ
  tell('today', 'beyond', 0.05, 0.98, ['Sarmal bugünde bitiyordu.', 'En üstteki düğüm bu akşamdı: bir uyanış, bir kahve, bir şalter.'], { purpose: 'turn' }),
  { id: 'anomaly', seg: 'anomaly', from: 0.1, to: 1.0, slot: 'top', kind: 'alert', purpose: 'system', lines: ['ANOMALY'] },
  tell('one-more', 'anomaly', 0.03, 0.48, ['Ama bir kayıt daha vardı: bugünden sonra.'], { purpose: 'turn' }),
  tell('error', 'anomaly', 0.53, 1.02, ['Arif önce bunu bir hata sandı.'], { purpose: 'turn' }),
  { id: 'dates', seg: 'checked', from: 0.08, to: 1.0, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['TODAY {TODAY}', 'RECORD {NEXT} · 05:12'] },
  tell('checked', 'checked', 0.03, 0.54, ['Sonra tarihi kontrol etti.', 'Kayıt yarın sabaha aitti. Saat 05.12.'], { purpose: 'turn' }),
  ...say('impossible', 'checked', 0.58, 1.02, 'ARİF', '— Bu imkânsız.'),
  tell('details', 'feed', 0.03, 0.46, ['Odanın bütün ayrıntılarını biliyordu: köşedeki kutuyu, masanın arkasında bekleyen robotları.'], { purpose: 'turn' }),
  tell('sleeper', 'feed', 0.51, 1.02, ['Masada bir adam uyuyordu.', 'Başı masanın üstünde, kolları iki yandan sarkıyordu.'], { purpose: 'reveal' }),
  { id: 'subject', seg: 'feed', from: 0.32, to: 1.42, slot: 'top', kind: 'system', purpose: 'system', world: true, lines: ['SUBJECT · {NEXT} · 05:12'] },
  tell('unlived', 'feedWide', 0.04, 0.5, ['Ama bu kayıt henüz yaşanmamıştı.'], { purpose: 'reveal', strong: true }),
  tell('lens', 'feedWide', 0.54, 1.02, ['Arif başını çevirdi. Üçüncü robot, kaydın çekildiği yerde duruyordu.', 'Merceği yine ona dönüktü.'], { purpose: 'foreshadow' }),

  // 08 — TEKERRÜR
  tell('still-red', 'back', 0.05, 0.98, ['Düğme hâlâ kırmızı yanıyordu.', 'Sabah 05.12’ye daha saatler vardı.'], { purpose: 'mood' }),
  tell('no-stop', 'press', 0.04, 0.75, ['Bu kez durmadı.', 'Düğmeye bastı.'], { purpose: 'turn', strong: true, stagger: 0.4 }),
  tell('one-word', 'dark', 0.25, 1.02, ['Bir süre sonra ekranlarda tek bir kelime belirdi.'], { purpose: 'turn', fade: 0.3 }),
  center('word', 'word', 0.08, 0.58, ['TEKERRÜR'], { kind: 'word', fade: 0.5 }),
  tell('booted', 'word', 0.62, 1.04, ['Sistem açılmıştı…'], { purpose: 'reveal' }),
  center('not-seeing', 'law', 0.04, 0.46, ['Makine geleceği görmüyordu.']),
  center('resemblance', 'law', 0.52, 1.02, ['Geleceğin, geçmişe ne kadar benzediğini hesaplıyordu.'], { strong: true }),

  // 09 — GÖZLEMCİ
  ...iterations,
  tell('opened', 'records', 0.02, 0.19, ['Kayıtlar birbiri ardına açıldı; hepsi aynı alçak açıdan çekilmişti.'], { purpose: 'turn' }),
  tell('wrong', 'records', 0.22, 0.39, ['Fakat bir şey yanlıştı.'], { purpose: 'turn' }),
  tell('not-first', 'records', 0.42, 0.59, ['Bu kayıtların hiçbiri ilk kayıt değildi.'], { purpose: 'reveal', strong: true }),
  tell('same-room', 'records', 0.62, 0.79, ['Aynı oda. Aynı robot.'], { purpose: 'turn' }),
  tell('same-motion', 'records', 0.82, 0.99, ['Aynı kapı. Aynı hareket.'], { purpose: 'turn' }),
  center('engine', 'engine', 0.03, 0.6, ['PAST', 'PATTERN', 'SIMULATION', 'OBSERVATION', 'CORRECTION', 'REPEAT'], { kind: 'engine', stagger: 0.12 }),
  tell('believed-again', 'engine', 0.64, 1.02, ['Arif, o düzeni çözmek için makineyi kullandığına inanıyordu.'], { purpose: 'turn' }),
  tell('asleep-again', 'again', 0.03, 0.47, ['Saat 05.12’de masada uyuyordu. Kayıttaki gibi.'], { purpose: 'reveal' }),
  tell('again', 'again', 0.51, 1.02, ['Gözlüğü yine yamuktu. Bez yine kutuya düştü.'], { purpose: 'turn' }),
  tell('walked', 'halt', 0.03, 0.5, ['Sağındaki kapıya doğru yürüdü; aynı ağır adımlarla.']),
  tell('not-recorded', 'halt', 0.54, 1.02, ['Yarı yolda durdu. Bu, hiçbir kayıtta yoktu.'], { purpose: 'turn', strong: true }),
  tell('turned', 'turn', 0.05, 1.02, ['Masaya döndü.', 'Üçüncü robotun merceği, ilk kez ondan başka bir yere çevrildi.'], { purpose: 'reveal' }),
  { id: 'detected', seg: 'observer', from: 0.08, to: 1.0, slot: 'top', kind: 'system', purpose: 'reveal', world: true, lines: ['OBSERVER DETECTED', 'SCROLL INPUT'], stagger: 0.45 },
  tell('looked', 'observer', 0.48, 1.02, ['Arif ekrana baktı. Sonra, ekranın baktığı yere.'], { purpose: 'reveal' }),
  center('future', 'maybe', 0.04, 0.47, ['Belki de gelecek, henüz yaşanmamış bir şey değildi.'], { purpose: 'question' }),
  center('remember', 'maybe', 0.53, 1.02, ['Belki yalnızca henüz hatırlamadığımız bir şeydi.'], { purpose: 'question', strong: true }),
  center('final', 'end', 0.3, 5, ['TEKERRÜR'], { kind: 'final', purpose: 'title', sub: 'SCROLL TO REPEAT', fade: 0.4 }),
]

/** The story in plain prose, chapter by chapter (screen readers, the no-WebGL path). */
export const TRANSCRIPT: Record<string, string> = {
  awakening:
    'Önce karanlık vardı. Sonra duvar panelleri birer birer aydınlandı ve üzerlerine, sudan başlayarak, bir orman çizildi: Arif’in odasında gün, doğadan önce başlıyordu. Arif paranoyak bir şekilde uyuyordu. Başı dokunmatik çalışma masasının üstündeydi, kolları iki yandan sarkıyordu; ağzından akan salya masanın yüzeyine değmişti. Odanın sol yanında küçük bir robot kıpırdamadan duruyordu; tek merceği uyuyan adama dönüktü. Önündeki dev ekran kapalıydı; sağında ve solunda iki dev ekran daha duruyordu. Masa kocaman bir bilgisayar odasını andırıyordu. Yanağının altındaki cam her nefeste küçük bir pencere açıp kapatıyordu: uyurken bile çalışıyordu. Odanın bütün duvarları ekranlarla kaplıydı. Görüntüler sayesinde insan kendini içeride değil, ormanın içinde, bir akarsuyun kenarında sanıyordu. Akarsuyun sesi, üç yüz altmış derecelik görüntü… Hepsi son derece gerçekçiydi. Dışarıdaki dünya gerçek değildi. Ama yeterince uzun bakarsanız, gerçeğinden ayırmak da mümkün değildi; yalnızca iki panelin birleştiği yerde su, bir piksel kayarak akıyordu. Oda kare biçimindeydi. İki yan duvarın tam ortasında, karşı karşıya iki kapı vardı. Kapılar da ekranla kaplıydı, ama ağır, brütalist çerçeveleri onları duvarlardan ayırıyordu; kapı oldukları belliydi. Tavanı bulutlar ve hafif bir güneş ışığı süslüyordu. Gün akışı tavana yansıyor, saat ilerledikçe döngü tamamlanıyordu. Yaz sonuyla ilkbahar başı arasında bir mevsimdi bu; burası adeta mevsimsel bir deneyim odasıydı. Arif, burnunun üstünde yamuk duran gözlüğünü masadan sarkan sağ koluyla düzeltti. Ağır ağır gözlerini açtı, doğruldu, kendine gelmek için ellerini yüzüne götürüp ovuşturdu. Uyurken yanağında biriken salyayı elinin tersiyle sildi. Koltuğunun altından bir bez çıkarıp masadaki salyayı temizledi; sonra bezi, bakmadan, odanın ön köşesindeki kutuya basket atar gibi fırlattı. Bez kutuya düştü. Bu odadaki hiçbir şey tesadüfen yerleştirilmemişti.',
  outside:
    'Ayağa kalktı. Çalışma masası odanın tam ortasındaydı. Sağındaki kapıya doğru ağır adımlarla ilerledi; küçük robot birkaç adım geriden onu izledi. Hava kararmaya yakındı ve serinlemişti. Belki gece yağmur da çiseleyebilirdi. Arif’in sabahları hep akşamla birlikte başlardı. Odanın zemini tahtadandı; sanki bir ağaç ev yapılmış da duvarları ve tavanı hiç bırakılmamış gibiydi. Yavaşça kapı koluna uzandı ve kapıyı açtı. Kapının ardında orman sürüp gidiyordu: dar bir tahta geçit, el uzatsan dokunacağın eğrelti otları, tahtaların altından akan su; nişlerinde bekleyen iki robot ve boş bir niş. Arif eşikte bir an durup dinledi. Her sabah aynı akarsuyu dinliyordu. İçeri girdi; mercekli robot da peşinden süzüldü. Kapıyı kapattı. Oda, ormanı kimse için oynatmayı sürdürdü. Tavanda akşam geceye döndü. Yağmur geceyi beklemeden çiselemeye başladı. Sonra ince, parlak bir çizgi duvarların üstünden geçti ve ardında orman biraz farklı yeniden çizildi: bir dal yer değiştirmiş, bir taş kaymış, eğrelti otları sıklaşmıştı. Her sabah biraz farklı görünüyordu.',
  routine:
    'Yaklaşık kırk dakika sonra kapı yeniden açıldı. Arif kıyafetlerini değiştirmişti; saçları hâlâ ıslaktı. Onu üç robot takip ediyordu. Robotlardan birinde kahve takımı, ötekinde atıştırmalıklar vardı. Üçüncüsünde ise görünürde hiçbir şey yoktu; yalnızca küçük bir başı ve tek bir merceği vardı. Arif yeniden masasına oturdu. Robotlar, tahtanın daire biçiminde aşındığı yerlerde durdu; üçüncüsü biraz uzakta kaldı, merceği ona dönüktü. Arif elini sağındaki boşluğa uzattı; robot hemen oraya ilerleyip kahveyi eline itti. Robota bakmadı bile; gözleri kapalı ekrandaydı. Bir yudum aldı, ardından bardağı aynı yere doğru uzatıp bıraktı. Neyse ki robot yakalamıştı; zaten hiç kaçırdığı olmamıştı. Bir yudum daha aldı ve bardağı yine aynı yere bıraktı; robot yine yakaladı. Bazı hareketleri düşünmeden yaparsınız. Çünkü onları daha önce binlerce kez yapmışsınızdır.',
  archive:
    'Arif, önündeki dev monitörün altındaki büyük siyah düğmeye basacaktı. Parmağı düğmenin bir santim üstünde durdu. Ayağa kalktı ve sol kapıya yöneldi. Bilmediği şeylerden çok, hatırlamadığı şeylerden korkuyordu. Kapıyı yavaşça açtı; soğuk, beyaz bir ışık tahtaların üstüne döküldü. İnsan unuturdu. Makine unutmazdı. En azından Arif buna inanıyordu. İçeride göz alabildiğine uzanan, derin ve geniş bir oda vardı. Koridorlar kitap raflarını andırıyordu; ama raflarda kitaplar değil, dijital bilgi taşıyıcıları diziliydi. Tüm dünya tarihi; kitaplar, filmler, biyografiler, olaylar… Hepsi kategorilere ayrılmış, ilgili koridorların belleklerinde saklanıyordu: savaş, ekonomi, inanç, göç, bilim, çöküş, toparlanma. Ana koridorun sonunda, halka hâlinde dizilmiş kara sütunların ortasında bilgisayarın beyni duruyordu. Arif’in aksine, hiç uyumuyordu. Dünyanın tüm tarihi burada bulunabilirdi. Arif kapıdan içeri girdi, sağ taraftaki şalteri indirdi. Işıklar raf raf, ta beyne kadar yandı. Unutmamak, onun için bir meziyet değildi. Bir zorunluluktu. Hafif bir ıslıkla ritim tutarak odasına döndü ve masasına oturdu. Arşivin kapısını açık bıraktı.',
  history:
    'Siyah düğme artık kırmızı yanıyordu. Sistem, şu ana kadar olan bütün tarihi, olayları, haberleri kategorilere ayırarak inceliyordu; masadaki ekranlar binlerce küçük görüntüyle doldu. Görüntülerden biri büyüdü ve bir şehir meydanına dönüştü. Arif bu meydanı ezbere biliyordu: saat kulesini, çeşmeyi, köşedeki fırını. 1914’tü: güneşli bir sabah, raylarda bir tramvay, cephelerde bayraklar, kalabalık. Makine meydana hep aynı yerden bakıyordu; değişen her şey görünsün diye. 1917’de savaş geldi: duman, çeşmenin yanında askerî bir kamyon, bomboş bir meydan. 1931’de kriz: bankanın merdivenlerinde uzun bir kuyruk, kepenkleri inmiş dükkânlar. Aynı korku, farklı yıllarda başka isimlerle ortaya çıkıyordu. 1944’te enkaz: kule yıkıldı; saati, yıkıldığı dakikada durdu. 1962’de toparlanma: iskeleler, onarılmış bir saat, yeniden insanlar. Sonra herkes yeniden başladı; her seferinde ilk kez başladığını sanarak.',
  pattern:
    'Meydan dönmeye devam etti. 1991’de yeni bir çatışma: tramvay raylarının üstünde barikatlar, kırık camlar. Binalar değişiyordu. 2008’de yeni bir kriz: başka kıyafetler, başka şemsiyeler, ama aynı banka kapısında aynı biçimde bir kuyruk. İnsanlar değişiyordu. 2029’da cam cepheler. 2041’de kulenin arkasında, 1917’dekiyle aynı yerde bir duman. Hikâye değişmiyordu. Sonra meydan noktalara ayrıldı; her insan, her araç, her pencere bir düğüme dönüştü. Makine, olaylardan çok boyutlu bir ağ örüyordu. Adeta bir insan beyni gibi, gelişmiş modellerle her şeyi birbirine bağlıyordu. İnsandan farklı olarak, bu makinede unutmak diye bir şey yoktu; yalnızca ilgili veri silinirse unutuluyordu. Amacı, geçmişe bakarak gelecekte olacakları önceden tahmin etmekti. Düğümler 1914’ten bugüne yükselen bir sarmalda toplandı. Tarih belli aralıklarla kendini tekrar ediyordu. Toplumlar, devletler hep aynı davranışlara dönüyordu: savaşlar, krizler… Yukarıdan bakıldığında sarmalın bütün turları tek bir çembere oturuyordu. Dünya sanki kendi içinde bir döngüye girmiş gibiydi. Karmaşanın içinde gizli bir düzen vardı. Arif de o düzeni çözmek için bu makineyi kullanıyordu.',
  anomaly:
    'Sarmal bugünde bitiyordu. En üstteki düğüm bu akşamdı: bir uyanış, bir kahve, bir şalter. Ama bir kayıt daha vardı: bugünden sonra. Sarmalın ucunun hemen üstünde, hiçbir şeye bağlı olmayan soluk kırmızı bir düğüm belirdi; ekranda ANOMALY yazıyordu. Arif önce bunu bir hata sandı. Sonra tarihi kontrol etti. Sağdaki ekranda iki tarih vardı: bugünün ve yarının. Kayıt yarın sabaha aitti. Saat 05.12. “Bu imkânsız,” dedi. Kaydı açtı. Ekranda, şafaktan önceki mavi ışıkta, alçak bir açıdan çekilmiş bir oda belirdi. Odanın bütün ayrıntılarını biliyordu: köşedeki kutuyu, masanın arkasında bekleyen robotları. Masada bir adam uyuyordu. Başı masanın üstünde, kolları iki yandan sarkıyordu. Ama bu kayıt henüz yaşanmamıştı. Arif başını çevirdi. Üçüncü robot, kaydın çekildiği yerde duruyordu. Merceği yine ona dönüktü.',
  tekerrur:
    'Düğme hâlâ kırmızı yanıyordu. Sabah 05.12’ye daha saatler vardı. Arif’in parmağı yeniden düğmeye indi. Bu kez durmadı. Düğmeye bastı. Bütün ekranlar sırayla karardı: önce masadakiler, sonra duvarlardaki orman, en son tavandaki gökyüzü. Geriye düğmenin kırmızı halkası kaldı; sonra o da söndü. Ses de gitti: ne akarsu kaldı ne uğultu. Bir süre sonra ekranlarda tek bir kelime belirdi: TEKERRÜR. Sistem açılmıştı… Ekranlar loş bir ışıkla geri geldi; ormanın yerinde, dört duvarda da tek bir çember vardı. Makine geleceği görmüyordu. Geleceğin, geçmişe ne kadar benzediğini hesaplıyordu.',
  observer:
    'Kayıtlar birbiri ardına açıldı; hepsi aynı alçak açıdan, üçüncü robotun durduğu yerden çekilmişti. Her birinin köşesinde ITERATION yazıyor, yanındaki numara her kayıtta bir artıyordu. Birinde Arif gözlüğünü düzeltiyordu. Fakat bir şey yanlıştı. Bir sonrakinde bez, bakılmadan atılmış, kutuya düşüyordu. Bu kayıtların hiçbiri ilk kayıt değildi. Sonra parmak, siyah düğmenin bir santim üstünde duruyordu. Bardak boşluğa bırakılıyor, robot onu yakalıyordu. Aynı oda. Aynı robot. Arif sağdaki kapıya yürüyordu. Aynı kapı. Aynı hareket. Ekranda makinenin döngüsü belirdi: PAST, PATTERN, SIMULATION, OBSERVATION, CORRECTION, REPEAT. Oda tepeden görünüyordu: ortada masa, masada kıpırtısız bir adam, aşınmış dairelerin üstünde robotlar. Arif, o düzeni çözmek için makineyi kullandığına inanıyordu. Saat 05.12’de masada uyuyordu. Kayıttaki gibi. Tavanda gün doğdu, öğleni geçti, akşama döndü; oda yeniden başladı. Gözlüğü yine yamuktu. Bez yine kutuya düştü. Sağındaki kapıya doğru yürüdü; aynı ağır adımlarla. Yarı yolda durdu. Bu, hiçbir kayıtta yoktu. Masaya döndü. Üçüncü robotun merceği, ilk kez ondan başka bir yere çevrildi: kaydı izleyen tarafa. Ortadaki ekranda iki satır belirdi: OBSERVER DETECTED. SCROLL INPUT. Arif ekrana baktı. Sonra, ekranın baktığı yere. Oda yavaşça karardı; en son, merceğin kenarındaki küçük beyaz ışık kaldı. Belki de gelecek, henüz yaşanmamış bir şey değildi. Belki yalnızca henüz hatırlamadığımız bir şeydi.',
}

/** Where the HUD steps back: the opening, the circle, the record, the press and the word, the observer to the end. */
export const QUIET: Array<readonly [number, number]> = [
  [0, at('black', 0.95)],
  [at('above', 0.5), at('above', 1)],
  [at('feed', 0.3), at('feedWide', 0.5)],
  [at('back'), at('word', 0.62)],
  [at('observer'), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'black', at: 0.3, text: '[bir röle tıklar; duvar panelleri birer birer açılır]' },
  { seg: 'black', at: 0.75, text: '[akarsu sesi]' },
  { seg: 'asleep', at: 0.15, text: '[ağır, düzensiz bir nefes]' },
  { seg: 'desk', at: 0.66, text: '[dokunmatik masanın kısa uyarı sesleri]' },
  { seg: 'walls', at: 0.3, text: '[yapraklarda rüzgâr, uzakta bir kuş]' },
  { seg: 'wake', at: 0.62, text: '[derin bir nefes; koltuk gıcırdar]' },
  { seg: 'throw', at: 0.48, text: '[bez kutuya düşer]' },
  { seg: 'rise', at: 0.3, text: '[koltuk tahtada geri itilir]' },
  { seg: 'walk', at: 0.1, text: '[tahta zeminde ağır adımlar]' },
  { seg: 'rightDoor', at: 0.15, text: '[ağır kapı kolu döner]' },
  { seg: 'rightDoor', at: 0.4, text: '[akarsu birden yakından duyulur]' },
  { seg: 'rightDoor', at: 0.97, text: '[kapı kapanır]' },
  { seg: 'forty', at: 0.38, text: '[ince yağmur]' },
  { seg: 'forty', at: 0.6, text: '[duvarlardan alçak bir elektrik vızıltısı]' },
  { seg: 'reopen', at: 0.15, text: '[kapı açılır; küçük tekerlekler tahtada]' },
  { seg: 'reach', at: 0.4, text: '[porselen fincan tabağında tıkırdar]' },
  { seg: 'sip', at: 0.46, text: '[tepsiye yumuşak bir tık]' },
  { seg: 'thousands', at: 0.55, text: '[aynı yumuşak tık]' },
  { seg: 'leftDoor', at: 0.35, text: '[ağır bir kapı; ardından soğuk, derin bir uğultu]' },
  { seg: 'core', at: 0.15, text: '[derinden gelen makine sesi]' },
  { seg: 'lever', at: 0.4, text: '[şalter iner; röleler sırayla uzaklara doğru açılır]' },
  { seg: 'whistle', at: 0.05, text: '[ıslıkla tutulan bir ritim]' },
  { seg: 'red', at: 0.12, text: '[tek, alçak bir bip]' },
  { seg: 'red', at: 0.55, text: '[usul bir piyano motifi başlar]' },
  { seg: 'history', at: 0.03, text: '[tramvay zili, kalabalık; camın ardından boğuk]' },
  { seg: 'history', at: 0.23, text: '[uzakta bir siren]' },
  { seg: 'history', at: 0.63, text: '[enkazın üstünde rüzgâr]' },
  { seg: 'repeat', at: 0.03, text: '[aynı siren]' },
  { seg: 'repeat', at: 0.28, text: '[yağmur, şemsiyeler]' },
  { seg: 'network', at: 0.1, text: '[alçak, düzenli nabızlar]' },
  { seg: 'beyond', at: 0.1, text: '[müzik kesilir]' },
  { seg: 'anomaly', at: 0.1, text: '[alçak bir uyarı tonu]' },
  { seg: 'feed', at: 0.3, text: '[kayıttan gelen oda sesi: akarsu, uğultu, yavaş bir nefes]' },
  { seg: 'press', at: 0.32, text: '[düğmenin tıkı]' },
  { seg: 'press', at: 0.75, text: '[bütün sesler kesilir]' },
  { seg: 'word', at: 0.05, text: '[tek bir röle tıkı]' },
  { seg: 'word', at: 0.65, text: '[alçak bir makine uğultusu başlar]' },
  { seg: 'records', at: 0.02, text: '[kayıt başlangıç sesi, her kayıtta yeniden]' },
  { seg: 'again', at: 0.55, text: '[akarsu sesi geri gelir]' },
  { seg: 'again', at: 0.9, text: '[bez kutuya düşer]' },
  { seg: 'halt', at: 0.48, text: '[adımlar kesilir]' },
  { seg: 'turn', at: 0.47, text: '[robotun başı ince bir vızıltıyla döner]' },
  { seg: 'observer', at: 0.08, text: '[yalnızca makine uğultusu]' },
  { seg: 'end', at: 0.3, text: '[röle tıkı, makine uğultusu, uzakta su; sonra sessizlik]' },
]

/** World positions match the layout in docs/stories/tekerrur.md (room at the origin, square at x 300). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'cheek-window',
    title: 'Yanağın altındaki pencere',
    seg: 'asleep',
    from: 0.3,
    to: 1.9,
    pos: [-0.15, 0.78, 0.3],
    size: 0.35,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['Dokunmatik yüzey, yanağının altında bir pencere açmıştı:', '“Son kayıttan devam edilsin mi?”'] },
  },
  {
    id: 'seam',
    title: 'Ek yeri',
    seg: 'stream',
    from: 0,
    to: 1.0,
    pos: [1.0, 0.5, -4.98],
    size: 0.6,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['İki panelin birleştiği yerde su, bir piksel kayarak akıyordu.'] },
  },
  {
    id: 'cloth-box',
    title: 'Bez kutusu',
    seg: 'throw',
    from: 0.45,
    to: 1.0,
    pos: [4.3, 0.45, -4.3],
    size: 0.5,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Kutu ağzına kadar bezle doluydu.', 'Hepsi aynı bez; hepsi aynı biçimde buruşmuş.'] },
  },
  {
    id: 'worn-floor',
    title: 'Aşınmış tahta',
    seg: 'robots',
    from: 0.4,
    to: 1.25,
    pos: [-0.95, 0.01, 1.6],
    size: 0.6,
    kind: 'environment',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Robotun duracağı yerde tahta aşınmıştı.', 'Kusursuz bir daire; tam bir tekerlek izi kalınlığında.'] },
  },
  {
    id: 'recorder-lens',
    title: 'Üçüncü robotun merceği',
    seg: 'sits',
    from: 0.5,
    to: 3.35,
    pos: [-3.2, 0.95, 0.35],
    size: 0.35,
    kind: 'character',
    visibility: 'visible',
    examine: { verb: 'BAK', lines: ['Merceğin kenarında küçük, beyaz bir ışık yanıyordu.', 'Hiç sönmüyordu.'] },
  },
  {
    id: 'room-row',
    title: 'ODA koridoru',
    seg: 'deep',
    from: 0.6,
    to: 1.43,
    pos: [-20.3, 3.0, 2.4],
    size: 0.9,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Bir koridorun başındaki levha: ODA.', 'Raftaki kayıtların hepsi aynı uzunluktaydı: bir gece.'] },
  },
  {
    id: 'erased',
    title: 'Boş raf',
    seg: 'aisles',
    from: 0.62,
    to: 1.0,
    pos: [-24.3, 2.2, 6.5],
    size: 1.0,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Bir rafın etiketleri yerindeydi; taşıyıcıları yoktu.', 'Unutulmamışlardı. Silinmişlerdi.'] },
  },
  {
    id: 'bakery',
    title: 'Köşedeki fırın',
    seg: 'history',
    from: 0,
    to: 1.69,
    pos: [303.0, 1.2, 10.3],
    size: 1.2,
    kind: 'environment',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Köşedeki fırın her dönemde oradaydı.', 'Tabelası değişiyordu; kapısı hiç değişmiyordu.'] },
  },
  {
    id: 'street-clock',
    title: 'Sokak saati',
    seg: 'history',
    from: 0.6,
    to: 0.8,
    pos: [302.2, 3.0, 11.4],
    size: 0.6,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Fırının önündeki sokak saati de durmuştu.', 'Beşi on iki geçe.'] },
  },
  {
    id: 'same-cloud',
    title: 'Aynı bulut',
    seg: 'again',
    from: 0.45,
    to: 2.6,
    pos: [0.5, 4.55, -1.5],
    size: 2.0,
    kind: 'visual',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Tavandaki kancalı bulut, ilk akşamki yerindeydi.', 'Biçimi bile aynıydı.'] },
  },
]

/** No choices: the reader's part is the scrolling itself — which the system notices at the end. */
export const CHOICES: ChoiceGate<SegmentId>[] = []

const BASE_DATE = Date.UTC(2047, 2, 11)

/** The calendar day an iteration wakes up to. Iteration 7184 is 11.03.2047. */
export function iterationDate(iteration: number) {
  const d = new Date(BASE_DATE + (iteration - BASE_ITERATION) * 86_400_000)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getUTCFullYear()}`
}

/** {IT0}…{IT4}, {TODAY} and {NEXT} for the current pass of the loop. */
export function resolveTokens(text: string, iteration: number) {
  return text
    .replace(/\{IT(\d)\}/g, (_, k: string) => String(iteration + Number(k)))
    .replace(/\{TODAY\}/g, iterationDate(iteration))
    .replace(/\{NEXT\}/g, iterationDate(iteration + 1))
}

/**
 * Where every record is shot from: the third robot's lens at its stop. The
 * position never changes; the lens may pan and zoom (see the screenplay), and
 * `target` is its rest aim (Arif in the chair).
 */
export const RECORDER_LENS = { pos: [-3.2, 0.95, 0.35] as const, target: [0.1, 0.95, 0.9] as const }

/** Progress of shared cues (scene and sound). */
export const CUES = {
  panelsOn: at('black', 0.3),
  drizzle: at('forty', 0.38),
  scanLine: at('forty', 0.6),
  pressClick: at('press', 0.32),
  blackout: at('press', 0.75),
  observer: SEG.observer.start,
} as const
