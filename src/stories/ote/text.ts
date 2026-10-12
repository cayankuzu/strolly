/**
 * ÖTE. Every word the reader sees.
 *
 * The narrator is "biz": the company's people — polite, exact, a little too
 * calm — who watch the signing through glass, receive the reports and close
 * the file. The man is never named; his folder says K3-33. The word
 * "ötenazi" appears once, in the last chapter: everything before it is true,
 * and reads differently after it. The passengers' reasons are never given;
 * a detail at most (a photo face down, a hospital bracelet, an empty column).
 *
 * Choices change what is said and seen, never the plot: the last look at
 * Earth (look:open / look:closed) and the one report he sends home
 * (report:ok / report:earth / report:fear), which the company reads aloud,
 * flatly, in the last chapter.
 */
import type { CaptionCue, ChoiceGate, Discovery, TextSegment, When } from '../types'
import { at, type SegmentId } from './timeline'

type T = TextSegment<SegmentId>

const LOOK: When = { all: ['look:open'] }
const CLOSED: When = { all: ['look:closed'] }
const R_OK: When = { all: ['report:ok'] }
const R_EARTH: When = { all: ['report:earth'] }
const R_FEAR: When = { all: ['report:fear'] }
/** Fallbacks for a reading that reaches these lines without the choice (a resumed save). */
const NO_LOOK: When = { none: ['look:open', 'look:closed'] }
const NO_REPORT: When = { none: ['report:ok', 'report:earth', 'report:fear'] }

/** Narration on the rail; two lines arrive one after the other. */
const tell = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'rail',
  kind: 'narration',
  purpose: 'context',
  lines,
  stagger: lines.length > 1 ? 0.46 : undefined,
  ...extra,
})

/** A spoken line: the speaker in the caption, the words on the rail. */
const say = (id: string, seg: SegmentId, from: number, to: number, speaker: string, line: string, when?: When): T[] => [
  { id: `${id}-who`, seg, from, to, slot: 'caption', kind: 'system', purpose: 'dialogue', lines: [speaker], fade: 0.24, ...(when ? { when } : {}) },
  { id, seg, from, to, slot: 'rail', kind: 'dialogue', purpose: 'dialogue', lines: [line], fade: 0.24, ...(when ? { when } : {}) },
]

/** A line alone in the middle of the frame. */
const center = (id: string, seg: SegmentId, from: number, to: number, lines: string[], extra: Partial<T> = {}): T => ({
  id,
  seg,
  from,
  to,
  slot: 'center',
  kind: 'reveal',
  purpose: 'reveal',
  lines,
  stagger: lines.length > 1 ? 0.4 : undefined,
  ...extra,
})

/** Words printed on something in the set (a page, a panel, a screen); drawn by the scene. */
const printed = (id: string, seg: SegmentId, from: number, to: number, line: string, extra: Partial<T> = {}): T => ({
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
  // 01 — İMZA
  center('watching', 'open', -1, 0.95, ['Onu, masanın üzerine konmuş evrakları imzalarken izliyorduk.'], { purpose: 'mood', sub: 'SCROLL' }),
  tell('serious', 'glass', 0.08, 0.98, ['Bu, hayatı hakkında vereceği en ciddi kararlardan biriydi.', 'Belki de en ciddisi.'], { purpose: 'mood' }),
  tell('pen', 'pen', 0.06, 0.98, ['Mavi mürekkepli kalemi parmaklarının arasında çeviriyor, gerçekten bunu isteyip istemediğini düşünüyordu.', 'Bekledik. Bu odada kimse aceleye getirilmezdi.'], { stagger: 0.52 }),
  tell('clauses', 'pages', 0.04, 0.99, ['Önündeki sayfaların tamamı, bu hizmeti sunan şirketi koruyan maddelerle doluydu.', 'Para iadesi yalnızca şirketle bir şekilde yeniden iletişime geçebilen kişilere yapılıyordu.'], { stagger: 0.48 }),
  printed('clause-label', 'pages', 0.45, 0.99, 'MADDE 14 · İADE KOŞULLARI'),
  tell('never', 'refund', 0.06, 0.98, ['Daha önce böyle bir şey olmamıştı;', 'çünkü bu noktadan sonra geri dönen kimse yoktu.'], { purpose: 'foreshadow', strong: true }),
  tell('last-page', 'lastPage', 0.03, 0.46, ['Son kâğıt da önüne sürüldü. Altında, imzası için bırakılmış boş bir çizgi vardı.']),
  center('slogan', 'lastPage', 0.5, 1.08, ['“Bizi seçtiğiniz için teşekkür ederiz.', 'Hayatınız, hayatımızdır…”'], { kind: 'word', purpose: 'turn' }),
  tell('stuck', 'fortune', 0.08, 0.42, ['Cümle, kulağına yapışıp kaldı.'], { purpose: 'mood' }),
  tell('fortune', 'fortune', 0.45, 1.02, ['Neredeyse tüm varlığını bu hizmete yatırmıştı.', 'Cebinde beş kuruşu bile kalmamıştı ve artık geri dönüş ihtimali de yoktu.'], { purpose: 'turn' }),
  tell('signed', 'sign', 0.06, 0.98, ['Kalemi bıraktı, evrakları masanın öteki tarafındaki adama uzattı.', 'Her şey eksiksizdi. Her zaman olduğu gibi.']),

  // 02 — KAPI
  tell('nod', 'nod', 0.08, 0.96, ['Görevli, hiçbir şey söylemeden başıyla işaret etti.', 'Arkasındaki kapıya dönüp bakmadı bile.']),
  tell('other-door', 'door', 0.03, 0.41, ['Geldiği kapının tam karşısında duran başka bir kapıdan geçmesi istendi.']),
  tell('heavy', 'door', 0.45, 0.99, ['Kapı ağır ağır açıldı. Aralıktan soğuk, beyaz bir ışık taştı.', 'İçeri girdi.'], { stagger: 0.62 }),
  tell('elevator', 'elevator', 0.05, 0.97, ['Asansöre bindirildi. Yanında, önünde ve arkasında korumalar ve görevliler vardı.', 'Kimse konuşmuyordu. Kimse ona bakmıyordu da.'], { stagger: 0.55 }),
  tell('pressure', 'rise', 0.06, 0.97, ['Asansör yükseldikçe içindeki basınç artıyor gibiydi.', 'Kat göstergesi, binanın kat sayısını çoktan geçmişti.'], { purpose: 'foreshadow' }),
  tell('shuttle', 'topFloor', 0.04, 0.5, ['Son kata ulaştıklarında, artık bir binada değil, bir uzay mekiğinin içindeydi.'], { purpose: 'turn' }),
  center('no-return', 'topFloor', 0.55, 1.06, ['Geri dönüş yoktu.'], { strong: true, purpose: 'turn' }),

  // 03 — YOLCULAR
  tell('others', 'cabin', 0.08, 0.96, ['Onun gibi otuz iki kişi daha vardı.', 'Bütün başlar ona döndü. Otuz üçüncü yolcu oydu.']),
  tell('fortunes', 'faces', 0.04, 0.6, ['Hepsi servetlerini bu şirkete devretmiş,', 'aynı sona doğru yolculuğa çıkmayı kabul etmişti.'], { purpose: 'foreshadow' }),
  tell('no-names', 'faces', 0.64, 1.0, ['Kimse kimseye adını sormadı. Sormak, bir sonraki soruyu getirirdi.'], { purpose: 'foreshadow' }),
  ...say('announce', 'announce', 0.04, 0.5, 'ANONS', '— Lütfen herhangi bir koltuğa oturun. Numaraların bir önemi yok.'),
  tell('random', 'announce', 0.54, 0.98, ['Herkes rastgele bir koltuğa oturdu. Kimse pencere için tartışmadı.']),
  tell('seat', 'seat', 0.06, 0.97, ['Ona pencere kenarı düştü.', 'Yanına yaşlı bir kadın oturdu; örgüsünü kucağına bırakıp önce onun kemerini bağladı.']),

  // 04 — KALKIŞ
  printed('countdown', 'ignition', 0.04, 0.32, 'KALKIŞ · T−10', { kind: 'alert' }),
  center('engines', 'ignition', 0.34, 0.98, ['İtici motorlar çalıştı.'], { strong: true, purpose: 'turn' }),
  tell('gforce', 'gforce', 0.05, 0.97, ['Şiddetli bir G kuvveti altında, kemerleri sıkıca bağlı yolcular Dünya atmosferini terk etti.', 'Yaşlı kadın sarsıntı boyunca onun elini bırakmadı.'], { stagger: 0.52 }),
  tell('blue', 'space', 0.04, 0.41, ['Bulutlar aşağıda kaldı; pencerede mavi önce inceldi, sonra bitti.'], { purpose: 'mood' }),
  tell('route', 'space', 0.45, 1.0, ['Motorlar sustu. Yaşlı kadının yumağı kucağından kalkıp havada asılı kaldı.', 'Rota, galaksinin merkeziydi.'], { stagger: 0.5 }),
  printed('route-panel', 'space', 0.7, 1.0, 'ROTA · GALAKSİ MERKEZİ · SGR A*'),

  // 05 — YOLCULUK
  tell('years', 'years', 0.03, 0.42, ['Yolculuk yıllar sürecekti. Bu, sözleşmenin ikinci sayfasında yazıyordu.'], { purpose: 'foreshadow' }),
  tell('equipped', 'years', 0.46, 1.02, ['Gemi, son teknoloji sistemlerle donatılmıştı;', 'yeterli erzak, simülasyon alanları, eğlence modülleri vardı.']),
  tell('beach', 'beach', 0.05, 0.97, ['Simülasyon alanında her sabah aynı sahil açılıyor, dalgalar her sabah aynı yerde kırılıyordu.', 'Yaşlı çift, şezlonglarında el ele, hiçbir sabahı kaçırmadı.'], { purpose: 'mood', stagger: 0.5 }),
  tell('guitar', 'lounge', 0.04, 0.54, ['Gitarını yanında getiren genç her akşam aynı şarkıyı çalıyor, hiç bitirmiyordu.', 'Bileğinde hastane bilekliği olan kadın her seferinde son notayı bekliyordu.'], { purpose: 'foreshadow', stagger: 0.5 }),
  tell('holiday', 'lounge', 0.58, 1.02, ['Kimse sıkılmıyordu.', 'Neredeyse bir tatil gibiydi.'], { strong: true, purpose: 'turn' }),

  // 06 — SOLUK MAVİ NOKTA
  tell('pale-dot', 'windows', 0.06, 0.97, ['Herkes pencerelerden “soluk mavi nokta”ya bakıyordu.', 'Dünya hızla küçülüyordu; önce bir avuç kadardı, sonra bir parmak ucu kadar.'], { purpose: 'mood' }),
  tell('last-time', 'lastLook', 0.03, 0.37, ['Bu, onu son görüşleriydi.'], { strong: true, purpose: 'turn' }),
  // — the choice holds at lastLook 0.44 —
  tell('looked', 'lastLook', 0.49, 1.02, ['Nokta küçüldü, bir ışık zerresine dönüştü.', 'Sonra yıldızlardan biri oldu; hangisi olduğunu bir daha bulamadı.'], { when: LOOK, purpose: 'mood' }),
  tell('closed', 'lastLook', 0.49, 1.02, ['Dünya’yı bir nokta olarak hatırlamayacaktı; büyük, mavi ve yakın hatırlayacaktı.', 'Gözlerini açtığında pencerede yalnızca yıldızlar vardı.'], { when: CLOSED, purpose: 'mood' }),
  tell('data', 'dataLink', 0.04, 0.48, ['Gemi ile NASA ve diğer yatırımcı-destekçi ortaklar arasında kesintili de olsa veri ve bilgi akışı sağlanıyordu.']),
  tell('soldiers', 'dataLink', 0.52, 1.0, ['Yolcular, adeta bir göreve gönderilmiş askerler gibi raporlar veriyordu.', 'Takım elbiseli adam her seferinde hazır ol vaziyetinde duruyordu.'], { stagger: 0.5 }),
  printed('report-screen', 'report', 0.04, 0.42, 'RAPOR VERİN.'),
  // — the choice holds at report 0.3 —
  tell('sent', 'report', 0.42, 0.98, ['Raporları biz alıyorduk; hepsini okuyor, hepsini dosyalıyorduk.', 'Cevap yazmak sözleşmede yoktu.'], { purpose: 'foreshadow' }),
  tell('scarf', 'yearsPass', 0.06, 0.97, ['Yıllar geçti. Yaşlı kadının atkısı salonu boydan boya aştı, kapıdan çıkıp koridora uzandı.', 'Kime ördüğünü kimse sormadı.'], { purpose: 'mood' }),

  // 07 — VARIŞ
  center('arrived', 'arrive', 0.06, 0.42, ['Sonunda vardılar.'], { strong: true, purpose: 'turn' }),
  tell('dark', 'arrive', 0.46, 1.0, ['Önlerinde, ışığın bile geri dönemediği bir karanlık vardı.', 'Çevresinde bir halka yanıyordu.'], { purpose: 'mood' }),
  tell('blueshift', 'approach', 0.04, 0.42, ['Yaklaştıkça arkalarında kalan yıldızların ışığı maviye döndü.'], { purpose: 'mood' }),
  tell('faster', 'approach', 0.46, 1.0, ['Dünya’dan gelen sinyaller sıklaştı; tarih damgaları okunamayacak kadar hızlı akıyordu.', 'Orada yıllar geçiyordu; gemide birkaç dakika.']),
  center('crossed', 'horizon', 0.12, 0.9, ['Gemi olay ufkunu geçti.'], { strong: true, purpose: 'turn' }),
  tell('no-return-2', 'drift', 0.05, 0.54, ['Artık kesin olarak geri dönüş yoktu.', 'Kara deliğin içine doğru sürükleniyorlardı.'], { strong: true, purpose: 'turn' }),
  tell('looked-back', 'drift', 0.58, 1.0, ['Yine pencereden baktı. Geride kalan bütün evren, parlak bir halkaya sığmıştı.'], { when: LOOK, purpose: 'mood' }),
  tell('eyes-open', 'drift', 0.58, 1.0, ['Bu kez gözlerini kapatmadı. Geride kalan bütün evren, parlak bir halkaya sığmıştı.'], { when: CLOSED, purpose: 'mood' }),
  tell('looked-out', 'drift', 0.58, 1.0, ['Pencereden baktı. Geride kalan bütün evren, parlak bir halkaya sığmıştı.'], { when: NO_LOOK, purpose: 'mood' }),
  tell('song', 'song', 0.06, 0.98, ['Gitarlı genç şarkıyı ilk kez sonuna kadar çaldı. Bilekliği olan kadın beklediği notayı duydu.', 'Yaşlı kadın atkının son ilmeğini bağladı.'], { purpose: 'mood' }),

  // 08 — ANAHTAR
  tell('our-screens', 'mission', 0.04, 0.42, ['Bizim ekranlarımızda gemi olay ufkunu hiç geçmedi.'], { purpose: 'turn' }),
  tell('froze', 'mission', 0.46, 1.0, ['Son görüntüsü ufkun kıyısında donup kaldı; kızardı, soldu.', 'Paketler seyrekleşti. Sonra hiç gelmedi.']),
  printed('signal', 'mission', 0.72, 1.0, 'K3 · SİNYAL YOK', { kind: 'alert' }),
  ...say('read-ok', 'readout', 0.05, 0.48, 'GÖREVLİ', '— Yolcu otuz üç. Tek raporu: “Her şey yolunda.”', R_OK),
  ...say('read-earth', 'readout', 0.05, 0.48, 'GÖREVLİ', '— Yolcu otuz üç. Tek raporu: “Dünya’yı görmeliydiniz.”', R_EARTH),
  ...say('read-fear', 'readout', 0.05, 0.48, 'GÖREVLİ', '— Yolcu otuz üç. Tek raporu: “Korkmuyorum.”', R_FEAR),
  ...say('read-none', 'readout', 0.05, 0.48, 'GÖREVLİ', '— Yolcu otuz üç. Rapor yok.', NO_REPORT),
  tell('filed', 'readout', 0.52, 0.98, ['Sesini yükseltmeden, alçaltmadan okudu.', 'Sonra dosyayı kapattık.']),
  tell('routine', 'routine', 0.04, 0.4, ['Bu, şirketin rutin olarak yaptığı bir şeydi.'], { strong: true, purpose: 'reveal' }),
  tell('euthanasia', 'routine', 0.44, 1.0, ['Ötenazi taleplerini bilimsel keşiflerle birleştiriyor,', 'böylece insanlık adına büyük veriler elde ediliyordu.'], { purpose: 'reveal' }),
  tell('third', 'wall', 0.03, 0.26, ['Kara deliğe gönderilen üçüncü ekip onlardı.'], { strong: true, purpose: 'reveal' }),
  tell('before', 'wall', 0.28, 0.62, ['Şirket daha önce gezegenlere, uydulara, asteroitlere,', 'okyanusların en derin noktalarına ekipler yollamıştı.'], { purpose: 'reveal' }),
  tell('places', 'wall', 0.65, 1.0, ['İnsan yaşamı için mümkün olmayan, daha önce gidilmemiş', 've hakkında yeterli bilgi bulunmayan yerlere…'], { purpose: 'reveal' }),
  printed('wall-list', 'wall', 0.03, 1.0, 'KARA DELİK III · II · I · VENÜS · MERKÜR · EUROPA · TİTAN · 433 EROS · MARİANA ÇUKURU', { kind: 'machine' }),
  center('key', 'key', 0.06, 0.94, ['Ölmek isteyen insanları,', 'bilinmeyene açılan kapıların anahtarı olarak kullanıyordu.'], { strong: true }),
  center('again', 'next', 0.08, 0.52, ['Onu, masanın üzerine konmuş evrakları imzalarken izliyorduk.'], { purpose: 'mood' }),
  { id: 'end', seg: 'next', from: 0.6, to: 5, slot: 'center', kind: 'final', purpose: 'title', lines: ['ÖTE'], sub: 'Hayatınız, hayatımızdır.', fade: 0.4 },
]

/** The last look at Earth, and the one report he sends home. */
export const CHOICES: ChoiceGate<SegmentId>[] = [
  {
    id: 'lastLook',
    seg: 'lastLook',
    at: 0.44,
    style: 'choice',
    title: 'SON BAKIŞ',
    prompt: 'Dünya pencerede bir nokta kadar kaldı.',
    options: [
      { id: 'look', label: 'Dünya’ya son kez bak.', reply: ['Alnını soğuk cama dayadı. Gözünü noktadan ayırmadı.'], sets: ['look:open'] },
      { id: 'close', label: 'Gözlerini kapat.', reply: ['Alnını cama dayadı ve gözlerini kapattı.'], sets: ['look:closed'] },
    ],
  },
  {
    id: 'report',
    seg: 'report',
    at: 0.3,
    style: 'query',
    title: 'VERİ PENCERESİ · K3-33',
    prompt: 'Rapor verin.',
    options: [
      { id: 'ok', tag: 'DURUM', label: 'Her şey yolunda.', reply: ['Kameraya başıyla kısa bir selam verdi.', 'PAKET GÖNDERİLDİ.'], sets: ['report:ok'] },
      { id: 'earth', tag: 'GÖZLEM', label: 'Dünya’yı görmeliydiniz.', reply: ['Kamerayı pencereye çevirdi. Görüntüde yalnızca yıldızlar vardı.', 'PAKET GÖNDERİLDİ.'], sets: ['report:earth'] },
      { id: 'fear', tag: 'KİŞİSEL', label: 'Korkmuyorum.', reply: ['Kameranın tam ortasına baktı. Gözünü kırpmadı.', 'PAKET GÖNDERİLDİ.'], sets: ['report:fear'] },
    ],
  },
]

export const TRANSCRIPT: Record<string, string> = {
  imza:
    'Onu, masanın üzerine konmuş evrakları imzalarken izliyorduk. Biz camın bu tarafındaydık, karanlıkta; o, tek bir lambanın aydınlattığı koyu renk ahşap bir masada oturuyordu. Bu, hayatı hakkında vereceği en ciddi kararlardan biriydi. Belki de en ciddisi. Mavi mürekkepli kalemi parmaklarının arasında çeviriyor, gerçekten bunu isteyip istemediğini düşünüyordu. Bekledik. Bu odada kimse aceleye getirilmezdi. Önündeki sayfaların tamamı, bu hizmeti sunan şirketi koruyan maddelerle doluydu. On dördüncü maddede durdu: para iadesi yalnızca şirketle bir şekilde yeniden iletişime geçebilen kişilere yapılıyordu. Başını kaldırıp karşısındaki görevliye baktı; görevli kıpırdamadı. Arkasında, geldiği kapı kapalıydı. Daha önce böyle bir şey olmamıştı; çünkü bu noktadan sonra geri dönen kimse yoktu. Son kâğıt da önüne sürüldü. Altında, imzası için bırakılmış boş bir çizgi vardı; üstünde iki satır: “Bizi seçtiğiniz için teşekkür ederiz. Hayatınız, hayatımızdır…” Cümle, kulağına yapışıp kaldı. Masanın kenarındaki tepside bir anahtarlık, boş bir cüzdan ve yüzü masaya dönük bir fotoğraf duruyordu. Neredeyse tüm varlığını bu hizmete yatırmıştı. Cebinde beş kuruşu bile kalmamıştı ve artık geri dönüş ihtimali de yoktu. İmzasını attı. Kalemi bıraktı, evrakları masanın öteki tarafındaki adama uzattı. Her şey eksiksizdi. Her zaman olduğu gibi.',
  kapi:
    'Görevli, hiçbir şey söylemeden başıyla işaret etti. Arkasındaki kapıya dönüp bakmadı bile. Geldiği kapının tam karşısında duran başka bir kapıdan geçmesi istendi. Masanın çevresinden dolaşıp o kapıya yürüdü. Kapı ağır ağır açıldı; aralıktan soğuk, beyaz bir ışık taştı. İçeri girdi. Beyaz bir koridorda korumalar ve görevliler çevresini sardı; adımları aynı tempoda yankılandı. Asansöre bindirildi. Yanında, önünde ve arkasında korumalar ve görevliler vardı. Kimse konuşmuyordu. Kimse ona bakmıyordu da. Asansör yükseldikçe içindeki basınç artıyor gibiydi. Kat göstergesi, binanın kat sayısını çoktan geçmişti; rakamlar okunamayacak kadar hızlı akıyordu. Son kata ulaştıklarında, artık bir binada değil, bir uzay mekiğinin içindeydi. Asansörün kapıları arkasından kapandı, üstlerindeki ışık kırmızıya döndü. Geri dönüş yoktu.',
  yolcular:
    'Onun gibi otuz iki kişi daha vardı. Bütün başlar ona döndü. Otuz üçüncü yolcu oydu. Hepsi servetlerini bu şirkete devretmiş, aynı sona doğru yolculuğa çıkmayı kabul etmişti. Aralarında elinde mavi bir yumakla yaşlı bir kadın, sırtında gitar kılıfı taşıyan bir genç, el ele tutuşmuş yaşlı bir çift, bileğinde beyaz bir hastane bilekliği olan bir kadın, saatine bakıp duran takım elbiseli bir adam vardı. Başlarıyla selamlaştılar, sonra bakışlarını kaçırdılar. Kimse kimseye adını sormadı. Sormak, bir sonraki soruyu getirirdi. Bir anons yapıldı: “Lütfen herhangi bir koltuğa oturun. Numaraların bir önemi yok.” Herkes rastgele bir koltuğa oturdu. Kimse pencere için tartışmadı. Ona pencere kenarı düştü. Yanına yaşlı bir kadın oturdu; örgüsünü kucağına bırakıp önce onun kemerini bağladı.',
  kalkis:
    'Panelde geri sayım başladı. Herkes kemerini bağlamıştı; yaşlı çift kolçağın üstünden el ele tutuşuyordu. İtici motorlar çalıştı. Şiddetli bir G kuvveti altında, kemerleri sıkıca bağlı yolcular Dünya atmosferini terk etti. Mekik, bir ateş sütununun ucunda bulutları delip geçti. Yaşlı kadın sarsıntı boyunca onun elini bırakmadı. Bulutlar aşağıda kaldı; pencerede mavi önce inceldi, sonra bitti. Motorlar sustu. Yaşlı kadının yumağı kucağından kalkıp havada asılı kaldı. Panelde rota belirdi. Rota, galaksinin merkeziydi.',
  yolculuk:
    'Yolculuk yıllar sürecekti. Bu, sözleşmenin ikinci sayfasında yazıyordu. Gemi, son teknoloji sistemlerle donatılmıştı; yeterli erzak, simülasyon alanları, eğlence modülleri vardı. Simülasyon alanında her sabah aynı sahil açılıyor, dalgalar her sabah aynı yerde kırılıyordu. Yaşlı çift, şezlonglarında el ele, hiçbir sabahı kaçırmadı. Akşamları dinlenme salonunda satranç oynanıyor, yaşlı kadın koltuğunda örgüsünü örüyordu. Gitarını yanında getiren genç her akşam aynı şarkıyı çalıyor, hiç bitirmiyordu. Bileğinde hastane bilekliği olan kadın her seferinde son notayı bekliyordu. Kimse sıkılmıyordu. Neredeyse bir tatil gibiydi.',
  nokta:
    'Herkes pencerelerden “soluk mavi nokta”ya bakıyordu. Dünya hızla küçülüyordu; önce bir avuç kadardı, sonra bir parmak ucu kadar. Bu, onu son görüşleriydi. Burada okur seçer. Son kez baktıysa, alnını soğuk cama dayadı ve gözünü noktadan ayırmadı: nokta küçüldü, bir ışık zerresine dönüştü; sonra yıldızlardan biri oldu ve hangisi olduğunu bir daha bulamadı. Gözlerini kapattıysa, alnını cama dayadı ve gözlerini yumdu: Dünya’yı bir nokta olarak hatırlamayacaktı; büyük, mavi ve yakın hatırlayacaktı. Gözlerini açtığında pencerede yalnızca yıldızlar vardı. Gemi ile NASA ve diğer yatırımcı-destekçi ortaklar arasında kesintili de olsa veri ve bilgi akışı sağlanıyordu. Yolcular, adeta bir göreve gönderilmiş askerler gibi raporlar veriyordu. Takım elbiseli adam her seferinde hazır ol vaziyetinde duruyordu. Sıra ona geldiğinde, kabinin ekranında tek bir satır vardı: “Rapor verin.” Burada da okur seçer. “Her şey yolunda.” dediyse, kameraya başıyla kısa bir selam verdi. “Dünya’yı görmeliydiniz.” dediyse, kamerayı pencereye çevirdi; görüntüde yalnızca yıldızlar vardı. “Korkmuyorum.” dediyse, gözünü kırpmadan kameranın tam ortasına baktı. Paket gönderildi; ekranda “Yanıt bekleniyor” yazısı hiç kaybolmadı. Raporları biz alıyorduk; hepsini okuyor, hepsini dosyalıyorduk. Cevap yazmak sözleşmede yoktu. Yıllar geçti. Yaşlı kadının atkısı salonu boydan boya aştı, kapıdan çıkıp koridora uzandı. Kime ördüğünü kimse sormadı.',
  varis:
    'Sonunda vardılar. Önlerinde, ışığın bile geri dönemediği bir karanlık vardı. Çevresinde bir halka yanıyordu. Yaklaştıkça arkalarında kalan yıldızların ışığı maviye döndü. Dünya’dan gelen sinyaller sıklaştı; tarih damgaları okunamayacak kadar hızlı akıyordu. Orada yıllar geçiyordu; gemide birkaç dakika. Gemi olay ufkunu geçti. İçeride hiçbir şey değişmedi. Artık kesin olarak geri dönüş yoktu. Kara deliğin içine doğru sürükleniyorlardı. Arkalarındaki pencereye döndü. Dünya’ya son kez baktıysa, yine baktı; gözlerini kapattıysa, bu kez kapatmadı. Geride kalan bütün evren, parlak bir halkaya sığmıştı. Gitarlı genç şarkıyı ilk kez sonuna kadar çaldı. Bilekliği olan kadın beklediği notayı duydu. Yaşlı kadın atkının son ilmeğini bağladı. Sonra halkanın ışığı pencereden taştı ve her şeyi beyaza boğdu.',
  anahtar:
    'Bizim ekranlarımızda gemi olay ufkunu hiç geçmedi. Son görüntüsü ufkun kıyısında donup kaldı; kızardı, soldu. Paketler seyrekleşti. Sonra hiç gelmedi. Ekranda tek bir satır kaldı: K3 · SİNYAL YOK. İmza masasındaki görevli onun tek raporunu yüksek sesle okudu: “Yolcu otuz üç. Tek raporu: …” Ardından okurun seçtiği cümle gelir: “Her şey yolunda.”, “Dünya’yı görmeliydiniz.” ya da “Korkmuyorum.” Sesini yükseltmeden, alçaltmadan okudu. Sonra dosyayı kapattık. Bu, şirketin rutin olarak yaptığı bir şeydi. Odaya yeni bir dosya yığını getirildi; en üstteki formun başlığında “Ötenazi Talep Formu” yazıyordu. Ötenazi taleplerini bilimsel keşiflerle birleştiriyor, böylece insanlık adına büyük veriler elde ediliyordu. Kara deliğe gönderilen üçüncü ekip onlardı. Duvardaki levhalarda önceki ekiplerin gittiği yerler yazıyordu: Venüs, Merkür, Europa, Titan, 433 Eros, Mariana Çukuru… Her levhanın altında aynı sayı vardı: otuz üç. Şirket daha önce gezegenlere, uydulara, asteroitlere, okyanusların en derin noktalarına ekipler yollamıştı. İnsan yaşamı için mümkün olmayan, daha önce gidilmemiş ve hakkında yeterli bilgi bulunmayan yerlere… Ölmek isteyen insanları, bilinmeyene açılan kapıların anahtarı olarak kullanıyordu. İmza odasında, aynı lambanın altında, yeni bir müşteri aynı mavi kalemi parmaklarının arasında çeviriyordu. Onu, masanın üzerine konmuş evrakları imzalarken izliyorduk. ÖTE. Hayatınız, hayatımızdır.',
}

export const QUIET: Array<readonly [number, number]> = [
  [0, at('glass', 0.05)],
  [at('ignition', 0.3), at('gforce', 0.9)],
  [at('horizon'), at('horizon', 1)],
  [at('key'), at('key', 1)],
  [at('next', 0.05), 1],
]

export const CAPTIONS: CaptionCue<SegmentId>[] = [
  { seg: 'open', at: 0.1, text: '[camın ardından boğuk bir oda sesi]' },
  { seg: 'pen', at: 0.1, text: '[kalem parmakların arasında tıkırdar]' },
  { seg: 'pages', at: 0.1, text: '[sayfalar çevrilir]' },
  { seg: 'lastPage', at: 0.05, text: '[kâğıt masada kayar]' },
  { seg: 'fortune', at: 0.12, text: '[lambanın ince vızıltısı]' },
  { seg: 'fortune', at: 0.72, text: '[kalemin kâğıttaki cızırtısı]' },
  { seg: 'sign', at: 0.08, text: '[kalem masaya bırakılır]' },
  { seg: 'door', at: 0.45, text: '[ağır menteşeler gıcırdar, basınçlı bir tıslama]' },
  { seg: 'elevator', at: 0.05, text: '[koridorda aynı tempoda adım sesleri]' },
  { seg: 'elevator', at: 0.48, text: '[asansör kapıları kapanır]' },
  { seg: 'rise', at: 0.1, text: '[asansörün yükselen uğultusu]' },
  { seg: 'rise', at: 0.6, text: '[kulaklarda basınç çınlaması]' },
  { seg: 'topFloor', at: 0.04, text: '[asansör zili]' },
  { seg: 'topFloor', at: 0.55, text: '[kapı arkasından kilitlenir]' },
  { seg: 'cabin', at: 0.1, text: '[kalabalığın alçak mırıltısı]' },
  { seg: 'cabin', at: 0.45, text: '[mırıltı kesilir]' },
  { seg: 'announce', at: 0.02, text: '[anons zili]' },
  { seg: 'seat', at: 0.75, text: '[kemer tokası tık diye kapanır]' },
  { seg: 'ignition', at: 0.05, text: '[geri sayım bipleri]' },
  { seg: 'ignition', at: 0.34, text: '[motorların gürlemesi]' },
  { seg: 'gforce', at: 0.08, text: '[gövde titrer, metal inler]' },
  { seg: 'space', at: 0.45, text: '[motorlar susar]' },
  { seg: 'beach', at: 0.05, text: '[kayıttan dalga ve martı sesleri]' },
  { seg: 'lounge', at: 0.04, text: '[gitar; şarkı hep aynı yerde kesilir]' },
  { seg: 'lounge', at: 0.6, text: '[satranç taşı tahtaya konur]' },
  { seg: 'lastLook', at: 0.6, text: '[uzaktan gemi sistemlerinin uğultusu]', when: CLOSED },
  { seg: 'dataLink', at: 0.08, text: '[kesik kesik veri sinyalleri]' },
  { seg: 'report', at: 0.36, text: '[gönderim sinyali]' },
  { seg: 'yearsPass', at: 0.1, text: '[örgü şişlerinin hızlanan tıkırtısı]' },
  { seg: 'arrive', at: 0.1, text: '[derinden gelen bir uğultu]' },
  { seg: 'approach', at: 0.46, text: '[gelen sinyallerin bipleri hızlanır, bir uğultuya dönüşür]' },
  { seg: 'horizon', at: 0.1, text: '[bütün sesler çekilir]' },
  { seg: 'song', at: 0.06, text: '[gitar; şarkı bu kez kesilmez]' },
  { seg: 'song', at: 0.36, text: '[son akor]' },
  { seg: 'song', at: 0.85, text: '[alçak, tek bir ton]' },
  { seg: 'mission', at: 0.5, text: '[sinyal sesleri seyrekleşir]' },
  { seg: 'mission', at: 0.74, text: '[düz, kesintisiz bir sinyal tonu]' },
  { seg: 'readout', at: 0.05, text: '[görevlinin tekdüze sesi]' },
  { seg: 'readout', at: 0.75, text: '[dosya kapanır]' },
  { seg: 'readout', at: 0.85, text: '[damga]' },
  { seg: 'routine', at: 0.25, text: '[evrak arabasının tekerlekleri]' },
  { seg: 'key', at: 0.05, text: '[sessizlik]' },
  { seg: 'next', at: 0.12, text: '[kalem parmakların arasında tıkırdar]' },
]

/** World positions match the layout in docs/stories/ote.md (built in src/three/ote/). */
export const DISCOVERIES: Discovery<SegmentId>[] = [
  {
    id: 'watchers',
    title: 'Camın ardındakiler',
    seg: 'glass',
    from: 0.4,
    to: 2.0,
    pos: [-3.6, 1.6, 0],
    size: 1.6,
    kind: 'character',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Camın ardında üç kişi duruyordu. Biri not alıyordu.', 'Biz.'] },
  },
  {
    id: 'folder',
    title: 'Dosya',
    seg: 'pages',
    from: 0,
    to: 1.8,
    pos: [-0.65, 0.78, 0.15],
    size: 0.35,
    kind: 'text',
    visibility: 'visible',
    examine: { verb: 'OKU', lines: ['DOSYA K3-33', 'Hizmet türü: TEK YÖN. Eksik belge: yok.'] },
  },
  {
    id: 'tray',
    title: 'Kişisel eşyalar',
    seg: 'fortune',
    from: 0,
    to: 1.3,
    pos: [0.65, 0.8, 0.3],
    size: 0.3,
    kind: 'object',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Bir anahtarlık, boş bir cüzdan, yüzü masaya dönük bir fotoğraf.', 'Fotoğrafı çevirmedik. Çevirmek hizmete dâhil değildi.'] },
  },
  {
    id: 'plaque',
    title: 'Koridordaki levha',
    seg: 'elevator',
    from: 0,
    to: 0.42,
    pos: [38.92, 1.5, -5],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Duvarda pirinç bir levha:', '“Bu koridordan bugüne kadar 1.287 kişi geçti. Hepsine teşekkür ederiz.”'] },
  },
  {
    id: 'manifest',
    title: 'Yolcu listesi',
    seg: 'announce',
    from: 0,
    to: 1.8,
    pos: [101.9, 1.5, -14.9],
    size: 0.35,
    kind: 'text',
    visibility: 'hidden',
    examine: { verb: 'OKU', lines: ['YOLCU LİSTESİ · K3 · 33 KİŞİ', '“Sebep” sütunu baştan sona boştu. Doldurmak zorunlu değildi.'] },
  },
  {
    id: 'pantry',
    title: 'Erzak deposu',
    seg: 'years',
    from: 0.4,
    to: 1.0,
    pos: [302.05, 1.4, 2.0],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['ERZAK · 33 KİŞİ · TEK YÖN', 'Dönüş için ayrılmış bölme: yok.'] },
  },
  {
    id: 'beach-seam',
    title: 'Sahilin kenarı',
    seg: 'beach',
    from: 0,
    to: 1.0,
    pos: [292.2, 1.6, 2.5],
    size: 0.6,
    kind: 'anomaly',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['Ekranların birleştiği yerde dalga bir an duraksıyor, başa sarıyordu.', 'Yaşlı çift o tarafa hiç bakmadı.'] },
  },
  {
    id: 'other-reports',
    title: 'Rapor kayıtları',
    seg: 'dataLink',
    from: 0,
    to: 1.0,
    pos: [302.45, 1.5, -4.6],
    size: 0.35,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'OKU', lines: ['Önceki raporlar:', '“K3-07: Bugün de aynı sahil. Şikâyetim yok.”', '“K3-21: Orada saat kaç?”', '“K3-12: —”'] },
  },
  {
    id: 'rear-window',
    title: 'Arka pencere',
    seg: 'arrive',
    from: 0.46,
    to: 1.0,
    pos: [307, 1.55, 4.0],
    size: 1.4,
    kind: 'environment',
    visibility: 'hidden',
    examine: { verb: 'BAK', lines: ['Arka pencerede yıldızlar maviye çalmaya başlamıştı.', 'Dünya orada bir yerdeydi. Çoktan yaşlanmış olmalıydı.'] },
  },
  {
    id: 'refunds',
    title: 'İade sayacı',
    seg: 'mission',
    from: 0,
    to: 1.8,
    pos: [-94.05, 2.2, -3.0],
    size: 0.4,
    kind: 'text',
    visibility: 'subtle',
    examine: { verb: 'BAK', lines: ['İADE TALEPLERİ · 0', 'Sayaç kurulduğundan beri hiç değişmemişti.'] },
  },
]
