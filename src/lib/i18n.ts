/**
 * The interface in both languages. Turkish is the original; every key must
 * exist in both dictionaries (TypeScript enforces it). Story words live with
 * the stories (src/stories/<id>/en.ts, see localize.ts), not here.
 *
 *   t(lang, 'title.start')                    → 'BAŞLA' / 'START'
 *   t(lang, 'hud.chapter', { n: '03' })       → 'BÖLÜM 03' / 'CHAPTER 03'
 */
import { useCallback } from 'react'
import { storiesIn } from '@/stories/localize'
import type { StoryContent, StoryId } from '@/stories/types'
import { useSettings, type Lang } from './settings'

export type { Lang }

const tr = {
  // Shared words
  'common.stories': 'HİKÂYELER',
  'common.settings': 'AYARLAR',
  'common.mainMenu': 'ANA MENÜ',
  'common.continue': 'DEVAM ET',
  'common.playAgain': 'TEKRAR OYNA',
  'common.completed': 'TAMAMLANDI',
  'common.chapter': 'BÖLÜM {n}',
  'common.chapterOf': 'BÖLÜM {n} / {total}',
  'common.discoveries': 'KEŞİFLER',
  'common.journal': 'GÜNLÜK',
  'common.sound': 'SES',
  'common.soundOn': 'Sesi aç',
  'common.soundOff': 'Sesi kapat',
  'common.percent': '%{n}',
  'common.loading': 'yükleniyor',
  'common.rights': '© {year} {owner} · Tüm hakları saklıdır',

  // Page titles
  'page.stories': 'Hikâyeler — STROLLY',
  'page.story': '{title} — STROLLY',

  // Language
  'lang.label': 'Dil',
  'lang.switch': 'Dil / Language',
  'lang.tr': 'TÜRKÇE',
  'lang.en': 'ENGLISH',

  // Title screen
  'title.tagline': 'Kaydırdıkça zamanın aktığı, baktıkça anlamın değiştiği hikâyeler.',
  'title.menu': 'Ana menü',
  'title.start': 'BAŞLA',
  'title.count': '{count} hikâye, bir oyun.',
  'title.newGame': 'YENİ OYUN',
  'title.archive': 'ARŞİV',
  'title.exit': 'ÇIKIŞ',
  'title.resume': '{title} · BÖLÜM {n} {chapter} · {percent}',
  'title.footDrag': 'SÜRÜKLE · BAK',
  'title.footScroll': 'KAYDIR · İLERLE',
  'title.footPause': 'ESC · DURAKLAT',

  // New game
  'newGame.body': 'Bütün hikâyelerdeki ilerleme ve keşifler silinecek. Ayarların korunur.',
  'newGame.confirm': 'SİL VE BAŞLA',
  'confirm.cancel': 'VAZGEÇ',

  // Story select
  'select.new': 'YENİ',
  'select.doneLabel': 'tamamlandı',
  'select.minutes': '~{n} DK',
  'select.chapters': '{n} BÖLÜM',
  'select.chaptersOne': '{n} BÖLÜM',
  'select.resumeSub': 'BÖLÜM {n} · {title}',
  'select.restart': 'BAŞTAN BAŞLA',
  'select.play': 'OYNA',
  'select.chapterList': 'BÖLÜMLER',
  'select.chooseChapter': 'Bölüm seç',
  'select.locked': 'KİLİTLİ',
  'common.back': 'GERİ',

  // Story
  'story.scene': '{title}: sahne. Sürükleyerek etrafına bak.',
  'story.saved': 'İLERLEME KAYDEDİLDİ',
  'story.chapterDone': 'BÖLÜM TAMAMLANDI',

  // HUD
  'hud.menu': 'MENÜ',
  'hud.menuLabel': 'Duraklat ve menüyü aç',
  'hud.recenter': 'BAKIŞI SIFIRLA',
  'hud.recenterLabel': 'Bakışı sıfırla: sahneye geri dön',
  'hud.recenterTitle': 'Bakışı sıfırla (C)',
  'hud.tap': 'DOKUN',
  'hud.click': 'TIKLA',
  'hud.behind': 'BAZI ŞEYLER ARKANDA',
  'hud.around': 'ETRAFINA BAK',
  'hud.dragTouch': 'PARMAĞINI YANA SÜRÜKLE',
  'hud.drag': 'TUT VE SÜRÜKLE',
  'hud.look': 'ETRAFINA BAK',
  'hud.scrollTouch': 'YUKARI KAYDIR',
  'hud.scroll': 'KAYDIR',
  'hud.moves': 'HİKÂYE İLERLER',

  // Pause
  'pause.title': 'DURAKLATILDI',
  'pause.menu': 'Duraklatma menüsü',
  'pause.resume': 'DEVAM ET',
  'pause.restart': 'BÖLÜMÜ YENİDEN BAŞLAT',
  'pause.choose': 'HİKÂYE SEÇ',
  'pause.hint': 'ESC · DEVAM',

  // Journal
  'journal.close': 'KAPAT',
  'journal.sections': 'Günlük bölümleri',
  'journal.title': 'Günlük',
  'journal.discoveries': 'Keşifler',
  'journal.empty': 'Bu okumada henüz bir şey sorulmadı, bir şey seçilmedi.',
  'journal.unknown': 'Henüz fark edilmedi',

  // Choices
  'choice.received': 'YANIT ALINDI',
  'choice.queries': '{n} SORGU',
  'choice.waiting': 'SORGU BEKLENİYOR',
  'choice.go': 'DEVAM ↓',

  // End of a story
  'complete.kicker': 'HİKÂYE TAMAMLANDI',
  'complete.seen': 'Fark ettiğin ayrıntılar: {seen} / {total}',
  'complete.loop': 'ya da kaydırmaya devam et',

  // Archive and credits
  'archive.title': 'ARŞİV',
  'archive.unread': 'OKUNMADI',
  'archive.credits': 'EMEĞİ GEÇENLER',
  'credits.about': 'Kaydırdıkça zamanın aktığı, baktıkça anlamın değiştiği etkileşimli hikâyeler.',
  'credits.media': 'GÖRÜNTÜ VE SES',
  'credits.mediaBody': 'Modeller, taranmış dokular ve HDRI’lar: Poly Haven (CC0). İnsan figürleri, ekranlar ve bütün sesler kodla üretildi.',
  'credits.type': 'YAZI TİPİ',
  'credits.typeBody': 'Geist, Geist Mono — Vercel (SIL Open Font License 1.1)',
  'credits.libs': 'KÜTÜPHANELER',
  'credits.libsBody': 'Next.js, React, three.js (MIT) · GSAP, ScrollTrigger (GSAP Standard License) · Lenis (MIT)',

  // Words painted into the story art
  'art.timeLeft': 'KALAN SÜRE',

  // Leaving, failures
  'farewell.label': 'Çıkış',
  'farewell.line': 'Görüşmek üzere. Hikâyeler bekler.',
  'farewell.back': 'BAŞLIK EKRANINA DÖN',
  'error.title': 'BU SAHNE YÜKLENEMEDİ.',
  'error.body': 'Bağlantı kesilmiş olabilir. Son kayıt noktasından yeniden deneyebilirsin.',
  'error.retry': 'SON KAYIT NOKTASINA DÖN',
  'crash.line': 'Bu hikâye şu anda açılamadı.',
  'crash.read': 'Metin olarak oku',
  'skip.read': 'Hikâyeleri metin olarak oku',

  // Settings
  'settings.groups': 'Ayar grupları',
  'settings.tabDisplay': 'GÖRÜNTÜ',
  'settings.tabAudio': 'SES',
  'settings.tabControls': 'KONTROLLER',
  'settings.tabAccess': 'ERİŞİLEBİLİRLİK',
  'settings.on': 'AÇIK',
  'settings.off': 'KAPALI',
  'settings.quality': 'Kalite',
  'settings.qualityHint': 'Kenar yumuşatma ve gölgeler bir sonraki hikâyede uygulanır.',
  'settings.auto': 'OTOMATİK',
  'settings.high': 'YÜKSEK',
  'settings.mid': 'ORTA',
  'settings.low': 'DÜŞÜK',
  'settings.resolution': 'Çözünürlük ölçeği',
  'settings.resolutionHint': 'Düşük değer daha akıcı, daha yumuşak görüntü.',
  'settings.fullscreen': 'Tam ekran',
  'settings.motion': 'Hareket efektleri',
  'settings.motionHint': 'Elde tutulan kamera titreşimi, yumuşak metin geçişleri.',
  'settings.master': 'Ana ses',
  'settings.music': 'Müzik',
  'settings.ambient': 'Ortam',
  'settings.sfx': 'Efektler',
  'settings.ui': 'Arayüz',
  'settings.uiLabel': 'Arayüz sesleri',
  'settings.spatial': 'Uzamsal ses',
  'settings.spatialHint': 'Sesler sahnedeki yerlerinden gelir; arkandaki ses arkandan duyulur.',
  'settings.look': '360° bakış',
  'settings.lookLabel': '360 derece bakış',
  'settings.lookHint': 'Kapalıyken kamera yalnızca hikâyenin gösterdiğine bakar.',
  'settings.sensitivity': 'Kamera hassasiyeti',
  'settings.invertY': 'Y eksenini ters çevir',
  'settings.autoCenter': 'Kamerayı otomatik ortala',
  'settings.autoCenterHint': 'Bir süre bakmadığında görüş yavaşça hikâyeye döner.',
  'settings.keyLook': 'bak',
  'settings.keyUpDown': 'yukarı / aşağı',
  'settings.keyCenter': 'ortala',
  'settings.keyExamine': 'incele',
  'settings.keyPause': 'duraklat',
  'settings.reducedMotion': 'Azaltılmış hareket',
  'settings.reducedMotionHint': 'Yumuşak kaydırma ve kamera hareketleri durur.',
  'settings.reducedCamera': 'Azaltılmış kamera hareketi',
  'settings.reducedCameraHint': 'Bakış daha yavaş; kayma ve otomatik dönüş yok.',
  'settings.captions': 'Ses altyazıları',
  'settings.captionsHint': 'Önemli sesler ekranda yazıyla belirir.',
  'settings.textSize': 'Metin boyutu',
  'settings.textS': 'KÜÇÜK',
  'settings.textM': 'ORTA',
  'settings.textL': 'BÜYÜK',
  'settings.textXL': 'ÇOK BÜYÜK',
  'settings.contrast': 'Yüksek kontrast',
  'settings.immersion': 'Sürükleyici mod',
  'settings.immersionHint': 'Arayüz en aza iner; yalnızca hikâye kalır.',
  'settings.defaults': 'VARSAYILANLAR',
  'settings.done': 'TAMAM',
} as const

export type Key = keyof typeof tr

const en: Record<Key, string> = {
  'common.stories': 'STORIES',
  'common.settings': 'SETTINGS',
  'common.mainMenu': 'MAIN MENU',
  'common.continue': 'CONTINUE',
  'common.playAgain': 'PLAY AGAIN',
  'common.completed': 'COMPLETED',
  'common.chapter': 'CHAPTER {n}',
  'common.chapterOf': 'CHAPTER {n} / {total}',
  'common.discoveries': 'DISCOVERIES',
  'common.journal': 'JOURNAL',
  'common.sound': 'SOUND',
  'common.soundOn': 'Turn sound on',
  'common.soundOff': 'Turn sound off',
  'common.percent': '{n}%',
  'common.loading': 'loading',
  'common.rights': '© {year} {owner} · All rights reserved',

  'page.stories': 'Stories — STROLLY',
  'page.story': '{title} — STROLLY',

  'lang.label': 'Language',
  'lang.switch': 'Language / Dil',
  'lang.tr': 'TÜRKÇE',
  'lang.en': 'ENGLISH',

  'title.tagline': 'Stories where time flows as you scroll and meaning shifts as you look.',
  'title.menu': 'Main menu',
  'title.start': 'START',
  'title.count': '{count} stories, one game.',
  'title.newGame': 'NEW GAME',
  'title.archive': 'ARCHIVE',
  'title.exit': 'EXIT',
  'title.resume': '{title} · CHAPTER {n} {chapter} · {percent}',
  'title.footDrag': 'DRAG · LOOK',
  'title.footScroll': 'SCROLL · ADVANCE',
  'title.footPause': 'ESC · PAUSE',

  'newGame.body': 'All progress and discoveries in every story will be erased. Your settings are kept.',
  'newGame.confirm': 'ERASE AND START',
  'confirm.cancel': 'CANCEL',

  'select.new': 'NEW',
  'select.doneLabel': 'completed',
  'select.minutes': '~{n} MIN',
  'select.chapters': '{n} CHAPTERS',
  'select.chaptersOne': '{n} CHAPTER',
  'select.resumeSub': 'CHAPTER {n} · {title}',
  'select.restart': 'START OVER',
  'select.play': 'PLAY',
  'select.chapterList': 'CHAPTERS',
  'select.chooseChapter': 'Choose a chapter',
  'select.locked': 'LOCKED',
  'common.back': 'BACK',

  'story.scene': '{title}: the scene. Drag to look around.',
  'story.saved': 'PROGRESS SAVED',
  'story.chapterDone': 'CHAPTER COMPLETE',

  'hud.menu': 'MENU',
  'hud.menuLabel': 'Pause and open the menu',
  'hud.recenter': 'RESET VIEW',
  'hud.recenterLabel': 'Reset view: back to the scene',
  'hud.recenterTitle': 'Reset view (C)',
  'hud.tap': 'TAP',
  'hud.click': 'CLICK',
  'hud.behind': 'SOMETHING IS BEHIND YOU',
  'hud.around': 'LOOK AROUND',
  'hud.dragTouch': 'DRAG SIDEWAYS',
  'hud.drag': 'HOLD AND DRAG',
  'hud.look': 'LOOK AROUND',
  'hud.scrollTouch': 'SWIPE UP',
  'hud.scroll': 'SCROLL',
  'hud.moves': 'THE STORY MOVES',

  'pause.title': 'PAUSED',
  'pause.menu': 'Pause menu',
  'pause.resume': 'RESUME',
  'pause.restart': 'RESTART CHAPTER',
  'pause.choose': 'CHOOSE A STORY',
  'pause.hint': 'ESC · RESUME',

  'journal.close': 'CLOSE',
  'journal.sections': 'Journal sections',
  'journal.title': 'Journal',
  'journal.discoveries': 'Discoveries',
  'journal.empty': 'Nothing has been asked or chosen in this reading yet.',
  'journal.unknown': 'Not noticed yet',

  'choice.received': 'RESPONSE RECEIVED',
  'choice.queries': '{n} QUERIES',
  'choice.waiting': 'AWAITING QUERY',
  'choice.go': 'CONTINUE ↓',

  'complete.kicker': 'STORY COMPLETE',
  'complete.seen': 'Details you noticed: {seen} / {total}',
  'complete.loop': 'or keep scrolling',

  'archive.title': 'ARCHIVE',
  'archive.unread': 'UNREAD',
  'archive.credits': 'CREDITS',
  'credits.about': 'Interactive stories where time flows as you scroll and meaning shifts as you look.',
  'credits.media': 'PICTURE AND SOUND',
  'credits.mediaBody': 'Models, scanned textures and HDRIs: Poly Haven (CC0). Human figures, screens and all sound are made in code.',
  'credits.type': 'TYPEFACE',
  'credits.typeBody': 'Geist, Geist Mono — Vercel (SIL Open Font License 1.1)',
  'credits.libs': 'LIBRARIES',
  'credits.libsBody': 'Next.js, React, three.js (MIT) · GSAP, ScrollTrigger (GSAP Standard License) · Lenis (MIT)',

  'art.timeLeft': 'TIME LEFT',

  'farewell.label': 'Exit',
  'farewell.line': 'See you soon. The stories will wait.',
  'farewell.back': 'BACK TO THE TITLE SCREEN',
  'error.title': 'THIS SCENE COULD NOT LOAD.',
  'error.body': 'The connection may have dropped. You can try again from the last checkpoint.',
  'error.retry': 'BACK TO THE LAST CHECKPOINT',
  'crash.line': 'This story could not be opened right now.',
  'crash.read': 'Read as text (in Turkish)',
  'skip.read': 'Read the stories as text (in Turkish)',

  'settings.groups': 'Setting groups',
  'settings.tabDisplay': 'DISPLAY',
  'settings.tabAudio': 'AUDIO',
  'settings.tabControls': 'CONTROLS',
  'settings.tabAccess': 'ACCESSIBILITY',
  'settings.on': 'ON',
  'settings.off': 'OFF',
  'settings.quality': 'Quality',
  'settings.qualityHint': 'Anti-aliasing and shadows apply from the next story.',
  'settings.auto': 'AUTO',
  'settings.high': 'HIGH',
  'settings.mid': 'MEDIUM',
  'settings.low': 'LOW',
  'settings.resolution': 'Resolution scale',
  'settings.resolutionHint': 'Lower is smoother, with a softer picture.',
  'settings.fullscreen': 'Fullscreen',
  'settings.motion': 'Motion effects',
  'settings.motionHint': 'Hand-held camera sway, soft text transitions.',
  'settings.master': 'Master volume',
  'settings.music': 'Music',
  'settings.ambient': 'Ambience',
  'settings.sfx': 'Effects',
  'settings.ui': 'Interface',
  'settings.uiLabel': 'Interface sounds',
  'settings.spatial': 'Spatial audio',
  'settings.spatialHint': 'Sounds come from where they are in the scene; a sound behind you is heard behind you.',
  'settings.look': '360° look',
  'settings.lookLabel': '360-degree look',
  'settings.lookHint': 'When off, the camera only looks where the story points it.',
  'settings.sensitivity': 'Camera sensitivity',
  'settings.invertY': 'Invert Y axis',
  'settings.autoCenter': 'Auto-center camera',
  'settings.autoCenterHint': 'After a while without looking around, the view drifts back to the story.',
  'settings.keyLook': 'look',
  'settings.keyUpDown': 'up / down',
  'settings.keyCenter': 'center',
  'settings.keyExamine': 'examine',
  'settings.keyPause': 'pause',
  'settings.reducedMotion': 'Reduced motion',
  'settings.reducedMotionHint': 'Smooth scrolling and camera movement stop.',
  'settings.reducedCamera': 'Reduced camera motion',
  'settings.reducedCameraHint': 'Slower look; no drift or automatic turning.',
  'settings.captions': 'Sound captions',
  'settings.captionsHint': 'Important sounds appear as text on screen.',
  'settings.textSize': 'Text size',
  'settings.textS': 'SMALL',
  'settings.textM': 'MEDIUM',
  'settings.textL': 'LARGE',
  'settings.textXL': 'EXTRA LARGE',
  'settings.contrast': 'High contrast',
  'settings.immersion': 'Immersive mode',
  'settings.immersionHint': 'The interface steps back; only the story remains.',
  'settings.defaults': 'DEFAULTS',
  'settings.done': 'DONE',
}

const DICTIONARY: Record<Lang, Record<Key, string>> = { tr, en }

/** Number words for counts on the title screen ("Dokuz hikâye" / "Nine stories"). */
const NUMBERS: Record<Lang, string[]> = {
  tr: ['Hiç', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz', 'On', 'On bir', 'On iki'],
  en: ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'],
}

export type Vars = Record<string, string | number>

/** An interface string in a language, with `{name}` placeholders filled from `vars`. */
export function t(lang: Lang, key: Key, vars?: Vars): string {
  const s = DICTIONARY[lang]?.[key] ?? tr[key]
  return vars ? s.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m)) : s
}

/** A count as a capitalized word ("Dokuz", "Nine"); digits past twelve. */
export const countWord = (lang: Lang, n: number) => NUMBERS[lang][n] ?? String(n)

export const useLang = (): Lang => useSettings().lang

export type Translate = (key: Key, vars?: Vars) => string

/** `t` bound to the player's language; re-renders when the language changes. */
export function useT(): Translate {
  const lang = useLang()
  return useCallback((key: Key, vars?: Vars) => t(lang, key, vars), [lang])
}

/** The catalogue in the player's language. */
export const useStories = (): Record<StoryId, StoryContent> => storiesIn(useLang())
