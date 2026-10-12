/**
 * ÖTE — everything printed or lit in the sets: the contract's pages, the last
 * page and its two lines, the folder, the elevator digits, the shuttle's
 * panel, the booth, the day counters, the mission screen's counter, the
 * expedition plaques and the request form. All of it in the company's one
 * motif, the thin-line keyhole.
 */
import { mulberry32 } from '@/lib/math'
import { mono, sans, spaced as spacedRaw } from '../screens'
import { T, num } from './lang'

type Ctx = CanvasRenderingContext2D
const SERIF = 'Georgia, "Times New Roman", serif'

/** Shrinks the current font until `text` (with `spacing` px between letters) is no wider than `maxW`. */
function fitFont(ctx: Ctx, text: string, maxW: number, spacing = 0) {
  const m = /(\d+(?:\.\d+)?)px/.exec(ctx.font)
  if (!m) return
  const ls = ctx.letterSpacing
  ctx.letterSpacing = '0px'
  let size = parseFloat(m[1])
  const width = () => ctx.measureText(text).width + spacing * Math.max(0, text.length - 1)
  for (let i = 0; i < 16 && width() > maxW && size > 5; i++) {
    size *= 0.94
    ctx.font = ctx.font.replace(/\d+(?:\.\d+)?px/, `${size.toFixed(1)}px`)
  }
  ctx.letterSpacing = ls
}

/**
 * Letter-spaced text that never runs off its canvas: the room at `x` (per `textAlign`) is
 * measured and the font shrinks to fit it — the English strings are often longer than the Turkish.
 */
function spaced(ctx: Ctx, text: string, x: number, y: number, spacing: number) {
  const W = ctx.canvas.width
  const pad = W * 0.035
  const room = ctx.textAlign === 'center' ? 2 * Math.min(x, W - x) - 2 * pad : ctx.textAlign === 'right' ? x - pad : W - x - pad
  fitFont(ctx, text, room, spacing)
  spacedRaw(ctx, text, x, y, spacing)
}

/** The company's emblem: a thin circle over a narrow trapezoid. `r` is the circle's radius. */
export function keyhole(ctx: Ctx, cx: number, cy: number, r: number, color: string, lw: number, filled = false) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lw
  ctx.lineJoin = 'round'
  const top = cy + r * 0.55
  const bot = cy + r * 2.25
  const a = Math.asin(0.42)
  ctx.beginPath()
  ctx.arc(cx, cy, r, Math.PI / 2 + a, Math.PI / 2 - a + Math.PI * 2, false)
  ctx.lineTo(cx + r * 0.62, bot)
  ctx.lineTo(cx - r * 0.62, bot)
  ctx.closePath()
  if (filled) ctx.fill()
  else ctx.stroke()
  void top
  ctx.restore()
}

/** Dense small print: lines of grey "words". */
function smallPrint(ctx: Ctx, x: number, y0: number, w: number, y1: number, seed: number, size = 7, lead = 11) {
  const rand = mulberry32(seed)
  ctx.fillStyle = 'rgba(30,28,26,0.62)'
  for (let y = y0; y < y1; y += lead) {
    let cx = x
    const end = x + w - (rand() < 0.12 ? rand() * w * 0.5 : 0)
    while (cx < end) {
      const ww = (2 + rand() * 8) * size * 0.55
      if (cx + ww > end) break
      ctx.fillRect(cx, y, ww, size * 0.62)
      cx += ww + size * 0.55
    }
    if (rand() < 0.08) y += lead * 0.6
  }
}

/** A contract page: header, clause numbers, dense print. */
export function drawClausePage(header: string, seed: number) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#f2eee6'
    ctx.fillRect(0, 0, w, h)
    const m = w * 0.1
    keyhole(ctx, w - m - 6, m * 0.7, 6, '#3c3a38', 1.4)
    ctx.fillStyle = '#1e1c1a'
    sans(ctx, Math.round(w * 0.05), 700)
    spaced(ctx, header, m, m + w * 0.07, 2)
    ctx.fillRect(m, m + w * 0.1, w - 2 * m, 2)
    let y = m + w * 0.15
    const rand = mulberry32(seed)
    for (let k = 0; k < 6 && y < h - m; k++) {
      ctx.fillStyle = '#1e1c1a'
      mono(ctx, Math.round(w * 0.03), 600)
      ctx.fillText(`${k + 1}.`, m, y + w * 0.022)
      const lines = 4 + Math.floor(rand() * 5)
      smallPrint(ctx, m + w * 0.06, y + 2, w - 2 * m - w * 0.06, y + lines * 11, seed * 7 + k)
      y += lines * 11 + 14
    }
    ctx.fillStyle = 'rgba(30,28,26,0.5)'
    mono(ctx, Math.round(w * 0.024))
    ctx.fillText(`— ${seed} —`, w / 2 - 14, h - m * 0.6)
  }
}

/** The last page: the emblem, the two lines, the signature line — and the signature, as much as is drawn. */
export function drawLastPage(signed: number) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#f3efe7'
    ctx.fillRect(0, 0, w, h)
    keyhole(ctx, w / 2, h * 0.17, w * 0.035, '#2b2927', 2.4)
    ctx.fillStyle = '#1d1b19'
    ctx.textAlign = 'center'
    ctx.font = `italic ${Math.round(w * 0.052)}px ${SERIF}`
    ctx.fillText(T('“Bizi seçtiğiniz için', '“Thank you for'), w / 2, h * 0.37)
    ctx.fillText(T('teşekkür ederiz.', 'choosing us.'), w / 2, h * 0.37 + w * 0.07)
    ctx.fillText(T('Hayatınız, hayatımızdır…”', 'Your life is our business…”'), w / 2, h * 0.37 + w * 0.17)
    ctx.textAlign = 'left'
    // The signature line.
    const ly = h * 0.8
    ctx.font = `${Math.round(w * 0.05)}px ${SERIF}`
    ctx.fillText('X', w * 0.16, ly)
    ctx.fillRect(w * 0.23, ly + 2, w * 0.6, 2)
    sans(ctx, Math.round(w * 0.022))
    ctx.fillStyle = 'rgba(30,28,26,0.6)'
    ctx.fillText(T('K3-33 · TEK YÖN', 'K3-33 · ONE WAY'), w * 0.23, ly + w * 0.05)
    if (signed > 0) {
      // A short, plain signature in blue ink, drawn as far as the pen has gone.
      ctx.strokeStyle = '#2f4fd8'
      ctx.lineWidth = Math.max(2, w * 0.006)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      const n = 60
      const x0 = w * 0.27
      const x1 = w * 0.7
      for (let i = 0; i <= n * Math.min(1, signed); i++) {
        const t = i / n
        const x = x0 + (x1 - x0) * t
        const y = ly - 10 - Math.sin(t * Math.PI * 5.2) * w * 0.022 * (1 - t * 0.5) - (t < 0.15 ? (0.15 - t) * w * 0.15 : 0)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }
}

/** The grey folder: emblem, the file's number, the service. */
export function drawFolder(label: string) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#8b8f94'
    ctx.fillRect(0, 0, w, h)
    const rand = mulberry32(9)
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${rand() < 0.5 ? '255,255,255' : '0,0,0'},0.035)`
      ctx.fillRect(rand() * w, rand() * h, 2, 2)
    }
    keyhole(ctx, w / 2, h * 0.24, w * 0.06, '#e9ecef', 2.2)
    ctx.fillStyle = '#eef0f2'
    ctx.textAlign = 'center'
    sans(ctx, Math.round(w * 0.075), 600)
    spaced(ctx, label, w / 2, h * 0.52, 3)
    sans(ctx, Math.round(w * 0.045), 500)
    spaced(ctx, T('TEK YÖN', 'ONE WAY'), w / 2, h * 0.62, 4)
    ctx.textAlign = 'left'
    ctx.strokeStyle = 'rgba(238,240,242,0.55)'
    ctx.lineWidth = 2
    ctx.strokeRect(w * 0.12, h * 0.44, w * 0.76, h * 0.23)
  }
}

/** The photo's white back, with a lab's faint print. */
export function drawPhotoBack(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#f4f2ee'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(80,80,80,0.12)'
  for (let x = 0; x < w; x += 46) {
    mono(ctx, 10)
    ctx.fillText('KODAK', x, h * 0.5 + ((x / 46) % 2) * 14)
  }
}

/** The brass plaque in the corridor. */
export function drawCorridorPlaque(ctx: Ctx, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#b8955c')
  g.addColorStop(0.5, '#d2b07a')
  g.addColorStop(1, '#9c7b48')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(60,40,15,0.6)'
  ctx.lineWidth = 3
  ctx.strokeRect(10, 10, w - 20, h - 20)
  keyhole(ctx, w / 2, h * 0.2, h * 0.06, '#3a2810', 2.5)
  ctx.fillStyle = '#3a2810'
  ctx.textAlign = 'center'
  sans(ctx, Math.round(h * 0.085), 600)
  spaced(ctx, T('BU KORİDORDAN BUGÜNE KADAR', 'TO DATE, THROUGH THIS CORRIDOR,'), w / 2, h * 0.52, 2)
  sans(ctx, Math.round(h * 0.15), 700)
  spaced(ctx, T('1.287 KİŞİ GEÇTİ', '1,287 PEOPLE HAVE PASSED'), w / 2, h * 0.7, 3)
  sans(ctx, Math.round(h * 0.07), 500)
  spaced(ctx, T('HEPSİNE TEŞEKKÜR EDERİZ.', 'WE THANK EVERY ONE OF THEM.'), w / 2, h * 0.85, 2)
  ctx.textAlign = 'left'
}

/** The elevator's floor indicator: amber digits on black glass. */
export function drawIndicator(text: string, blur: number) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffb347'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(255,170,60,0.8)'
    ctx.shadowBlur = 10 + blur * 18
    mono(ctx, Math.round(h * 0.68), 600)
    if (blur > 0) {
      ctx.globalAlpha = 0.4
      for (let k = -2; k <= 2; k++) ctx.fillText(text, w / 2, h * 0.76 + k * blur * h * 0.18)
      ctx.globalAlpha = 1
    }
    ctx.fillText(text, w / 2, h * 0.76)
    ctx.shadowBlur = 0
    ctx.textAlign = 'left'
  }
}

export type PanelMode = { kind: 'off' } | { kind: 'sit' } | { kind: 'count'; n: number } | { kind: 'go' } | { kind: 'route'; t: number }

/** The shuttle's announcement panel. */
export function drawPanel(mode: PanelMode) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#05070a'
    ctx.fillRect(0, 0, w, h)
    if (mode.kind === 'off') {
      keyhole(ctx, w / 2, h * 0.36, h * 0.12, 'rgba(160,180,200,0.18)', 3)
      return
    }
    const white = '#e8eef2'
    ctx.textAlign = 'center'
    if (mode.kind === 'sit') {
      keyhole(ctx, w / 2, h * 0.22, h * 0.08, white, 3)
      ctx.fillStyle = white
      sans(ctx, Math.round(h * 0.2), 600)
      spaced(ctx, T('LÜTFEN OTURUN', 'PLEASE BE SEATED'), w / 2, h * 0.72, 10)
      sans(ctx, Math.round(h * 0.07), 400)
      ctx.fillStyle = 'rgba(232,238,242,0.55)'
      spaced(ctx, T('KOLTUK NUMARALARININ ÖNEMİ YOKTUR', 'SEAT NUMBERS DO NOT MATTER'), w / 2, h * 0.88, 5)
    } else if (mode.kind === 'count') {
      ctx.fillStyle = 'rgba(232,238,242,0.6)'
      sans(ctx, Math.round(h * 0.1), 500)
      spaced(ctx, T('KALKIŞ', 'LAUNCH'), w / 2, h * 0.24, 12)
      ctx.fillStyle = mode.n <= 3 ? '#ff6a4a' : white
      mono(ctx, Math.round(h * 0.5), 600)
      ctx.fillText(`T−${mode.n}`, w / 2, h * 0.78)
    } else if (mode.kind === 'go') {
      ctx.fillStyle = '#ff6a4a'
      mono(ctx, Math.round(h * 0.42), 600)
      ctx.fillText('T−0', w / 2, h * 0.62)
      sans(ctx, Math.round(h * 0.08), 500)
      spaced(ctx, T('ATEŞLEME', 'IGNITION'), w / 2, h * 0.86, 12)
    } else {
      ctx.fillStyle = white
      sans(ctx, Math.round(h * 0.1), 600)
      spaced(ctx, T('ROTA · GALAKSİ MERKEZİ · SGR A*', 'COURSE · GALACTIC CENTER · SGR A*'), w / 2, h * 0.24, 6)
      // A thin line from the ship toward a dot.
      const x0 = w * 0.12
      const x1 = w * 0.86
      const y = h * 0.6
      ctx.strokeStyle = 'rgba(232,238,242,0.35)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 8])
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x1, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.strokeStyle = white
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x0 + (x1 - x0) * Math.min(1, mode.t), y)
      ctx.stroke()
      ctx.fillStyle = white
      ctx.beginPath()
      ctx.arc(x0, y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x1, y, 9, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()
      ctx.strokeStyle = '#ffd9a0'
      ctx.lineWidth = 2.5
      ctx.stroke()
      sans(ctx, Math.round(h * 0.065), 400)
      ctx.fillStyle = 'rgba(232,238,242,0.6)'
      ctx.textAlign = 'left'
      ctx.fillText(T('DÜNYA', 'EARTH'), x0 - 20, y + h * 0.16)
      ctx.textAlign = 'right'
      ctx.fillText(T('26.000 IŞIK YILI', '26,000 LIGHT YEARS'), x1 + 30, y + h * 0.16)
    }
    ctx.textAlign = 'left'
  }
}

/** The passenger list beside the panel; the "Sebep" column empty. */
export function drawManifest(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#06080b'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#e8eef2'
  sans(ctx, Math.round(w * 0.06), 600)
  spaced(ctx, T('YOLCU LİSTESİ · K3', 'PASSENGER MANIFEST · K3'), w * 0.08, h * 0.07, 2)
  mono(ctx, Math.round(w * 0.035), 500)
  ctx.fillStyle = 'rgba(232,238,242,0.55)'
  ctx.fillText('NO', w * 0.08, h * 0.13)
  ctx.fillText(T('KOLTUK', 'SEAT'), w * 0.24, h * 0.13)
  ctx.fillText(T('SEBEP', 'REASON'), w * 0.6, h * 0.13)
  ctx.fillRect(w * 0.08, h * 0.14, w * 0.84, 1.5)
  mono(ctx, Math.round(w * 0.032))
  for (let i = 0; i < 33; i++) {
    const y = h * 0.17 + i * h * 0.024
    ctx.fillStyle = i === 32 ? '#ffffff' : 'rgba(232,238,242,0.7)'
    ctx.fillText(`K3-${String(i + 1).padStart(2, '0')}`, w * 0.08, y)
    ctx.fillText('—', w * 0.28, y)
    ctx.fillText('', w * 0.6, y)
  }
}

/** GÖREV GÜNÜ n. */
export function drawDayCounter(day: string, blur = 0) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#07090c'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(232,238,242,0.6)'
    ctx.textAlign = 'center'
    sans(ctx, Math.round(h * 0.17), 500)
    spaced(ctx, T('GÖREV GÜNÜ', 'MISSION DAY'), w / 2, h * 0.3, 6)
    ctx.fillStyle = '#f2d9a8'
    ctx.shadowColor = 'rgba(242,200,140,0.6)'
    ctx.shadowBlur = 8 + blur * 20
    mono(ctx, Math.round(h * 0.48), 600)
    ctx.fillText(day, w / 2, h * 0.84)
    ctx.shadowBlur = 0
    ctx.textAlign = 'left'
  }
}

/** A sign over a doorway. */
export function drawSign(text: string) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#1b1d20'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f0e6d2'
    ctx.textAlign = 'center'
    sans(ctx, Math.round(h * 0.46), 600)
    spaced(ctx, text, w / 2, h * 0.68, 8)
    ctx.textAlign = 'left'
  }
}

/** The pantry's label. */
export function drawPantryLabel(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#e4ded2'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#2a2826'
  ctx.lineWidth = 3
  ctx.strokeRect(6, 6, w - 12, h - 12)
  ctx.fillStyle = '#1e1c1a'
  ctx.textAlign = 'center'
  sans(ctx, Math.round(h * 0.26), 700)
  spaced(ctx, T('ERZAK', 'PROVISIONS'), w / 2, h * 0.36, 6)
  sans(ctx, Math.round(h * 0.15), 600)
  spaced(ctx, T('33 KİŞİ · TEK YÖN', '33 PERSONS · ONE WAY'), w / 2, h * 0.62, 3)
  sans(ctx, Math.round(h * 0.1), 400)
  ctx.fillStyle = 'rgba(30,28,26,0.6)'
  spaced(ctx, T('DÖNÜŞ BÖLMESİ: YOK', 'RETURN COMPARTMENT: NONE'), w / 2, h * 0.84, 2)
  ctx.textAlign = 'left'
}

export type BoothMode = { kind: 'idle' } | { kind: 'link'; t: number } | { kind: 'report' } | { kind: 'sent'; spin: number }

/** The comms booth's screen. */
export function drawBooth(mode: BoothMode) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#05080c'
    ctx.fillRect(0, 0, w, h)
    const white = '#e8eef2'
    ctx.textAlign = 'center'
    if (mode.kind === 'idle') {
      keyhole(ctx, w / 2, h * 0.4, h * 0.1, 'rgba(200,215,230,0.3)', 3)
    } else if (mode.kind === 'link') {
      ctx.fillStyle = white
      sans(ctx, Math.round(h * 0.085), 600)
      spaced(ctx, T('BAĞLANTI · KESİNTİLİ', 'LINK · INTERMITTENT'), w / 2, h * 0.2, 4)
      // The signal bar: pulses, drops out, comes back.
      const t = mode.t
      const drop = Math.sin(t * 2.3) > 0.55 || Math.sin(t * 5.1 + 1) > 0.9
      const bars = 12
      for (let i = 0; i < bars; i++) {
        const lvl = drop ? 0.05 : 0.25 + 0.75 * Math.abs(Math.sin(t * 3 + i * 0.7))
        const bw = (w * 0.7) / bars
        ctx.fillStyle = drop ? 'rgba(255,90,70,0.6)' : 'rgba(150,210,255,0.85)'
        const bh = h * 0.36 * lvl
        ctx.fillRect(w * 0.15 + i * bw + 3, h * 0.66 - bh, bw - 6, bh)
      }
      ctx.fillStyle = 'rgba(232,238,242,0.5)'
      mono(ctx, Math.round(h * 0.06))
      ctx.fillText(drop ? T('SİNYAL ARANIYOR…', 'SEARCHING FOR SIGNAL…') : T('VERİ AKIŞI', 'DATA STREAM'), w / 2, h * 0.78)
      ctx.textAlign = 'right'
      mono(ctx, Math.round(h * 0.055))
      ctx.fillText(T('NASA / ORTAK AĞ', 'NASA / PARTNER NETWORK'), w * 0.95, h * 0.94)
    } else if (mode.kind === 'report') {
      keyhole(ctx, w / 2, h * 0.24, h * 0.09, white, 3)
      ctx.fillStyle = white
      sans(ctx, Math.round(h * 0.16), 600)
      spaced(ctx, T('RAPOR VERİN.', 'REPORT IN.'), w / 2, h * 0.68, 6)
      ctx.fillStyle = '#ff4a3a'
      ctx.beginPath()
      ctx.arc(w * 0.08, h * 0.1, h * 0.03, 0, Math.PI * 2)
      ctx.fill()
      ctx.textAlign = 'left'
      mono(ctx, Math.round(h * 0.05))
      ctx.fillText(T('KAYIT', 'REC'), w * 0.12, h * 0.12)
    } else {
      ctx.fillStyle = white
      sans(ctx, Math.round(h * 0.09), 600)
      spaced(ctx, T('PAKET GÖNDERİLDİ', 'PACKET SENT'), w / 2, h * 0.3, 4)
      ctx.fillStyle = 'rgba(232,238,242,0.6)'
      sans(ctx, Math.round(h * 0.07), 500)
      spaced(ctx, T('YANIT BEKLENİYOR', 'AWAITING REPLY'), w / 2, h * 0.44, 4)
      // A spinner that never completes.
      const cx = w / 2
      const cy = h * 0.7
      const r = h * 0.1
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + mode.spin
        ctx.strokeStyle = `rgba(232,238,242,${0.12 + 0.75 * (i / 12)})`
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55)
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
        ctx.stroke()
      }
    }
    ctx.textAlign = 'left'
  }
}

/** The booth's side log: earlier reports, small human voices. */
export function drawLog(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#06090d'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(232,238,242,0.55)'
  sans(ctx, Math.round(w * 0.06), 600)
  spaced(ctx, T('RAPOR KAYITLARI', 'REPORT LOG'), w * 0.07, h * 0.1, 2)
  mono(ctx, Math.round(w * 0.042))
  const rows: Array<[string, string]> = [
    ['K3-07', T('Bugün de aynı sahil.', 'The same beach again today.')],
    ['', T('Şikâyetim yok.', 'No complaints.')],
    ['K3-21', T('Orada saat kaç?', 'What time is it there?')],
    ['K3-12', '—'],
    ['K3-30', T('Satrançta yine kaybettim.', 'Lost at chess again.')],
    ['K3-02', T('Teşekkürler.', 'Thank you.')],
    ['K3-19', '—'],
  ]
  rows.forEach(([id, text], i) => {
    const y = h * 0.22 + i * h * 0.1
    ctx.fillStyle = 'rgba(160,200,240,0.8)'
    ctx.fillText(id, w * 0.07, y)
    ctx.fillStyle = 'rgba(232,238,242,0.75)'
    ctx.fillText(text, w * 0.3, y)
  })
}

/** Earth's time beacon: date stamps scrolling faster and faster, until they are a white bar. */
export function drawBeacon(speed: number, offset: number) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#04070b'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(232,238,242,0.6)'
    sans(ctx, Math.round(w * 0.05), 600)
    spaced(ctx, T('DÜNYA · ZAMAN İŞARETİ', 'EARTH · TIME SIGNAL'), w * 0.06, h * 0.08, 2)
    const lineH = h * 0.06
    const blur = Math.min(1, speed)
    mono(ctx, Math.round(lineH * 0.75))
    const start = Math.floor(offset)
    for (let i = 0; i < 16; i++) {
      const n = start + i
      const year = 2061 + Math.floor(n / 4)
      const m = (n % 12) + 1
      const y = h * 0.16 + (i - (offset % 1)) * lineH
      if (y < h * 0.12 || y > h * 0.98) continue
      ctx.globalAlpha = 0.85 * (1 - blur * 0.85)
      ctx.fillStyle = '#cfe2ff'
      ctx.fillText(`${year}.${String(m).padStart(2, '0')}.${String(((n * 7) % 28) + 1).padStart(2, '0')}  ${String((n * 13) % 24).padStart(2, '0')}:${String((n * 29) % 60).padStart(2, '0')}  ✓`, w * 0.06, y)
    }
    ctx.globalAlpha = 1
    if (blur > 0.2) {
      const g = ctx.createLinearGradient(0, h * 0.15, 0, h * 0.98)
      g.addColorStop(0, `rgba(230,240,255,${(blur - 0.2) * 0.5})`)
      g.addColorStop(0.5, `rgba(255,255,255,${(blur - 0.2) * 1.1})`)
      g.addColorStop(1, `rgba(230,240,255,${(blur - 0.2) * 0.5})`)
      ctx.fillStyle = g
      ctx.fillRect(w * 0.05, h * 0.14, w * 0.9, h * 0.84)
    }
  }
}

/** The mission screen's right third: the packet counter and the signal trace. */
export function drawPackets(count: number, signal: number, lost: boolean, t: number) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#06090e'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(232,238,242,0.55)'
    sans(ctx, Math.round(h * 0.06), 600)
    spaced(ctx, T('K3 · TELEMETRİ', 'K3 · TELEMETRY'), w * 0.08, h * 0.1, 3)
    ctx.fillStyle = '#e8eef2'
    sans(ctx, Math.round(h * 0.07), 500)
    spaced(ctx, T('PAKET', 'PACKETS'), w * 0.08, h * 0.25, 4)
    mono(ctx, Math.round(h * 0.16), 600)
    ctx.fillText(num(count), w * 0.08, h * 0.42)
    // The trace: a line that loses its pulses.
    ctx.strokeStyle = lost ? '#ff5a46' : 'rgba(150,210,255,0.9)'
    ctx.lineWidth = 3
    ctx.beginPath()
    const y0 = h * 0.62
    for (let x = 0; x <= w * 0.84; x += 3) {
      const k = x / (w * 0.84)
      const pulse = Math.pow(Math.max(0, Math.sin((k * 9 + t) * Math.PI)), 18)
      const y = y0 - pulse * h * 0.12 * signal * (1 - k * 0.4)
      if (x === 0) ctx.moveTo(w * 0.08 + x, y)
      else ctx.lineTo(w * 0.08 + x, y)
    }
    ctx.stroke()
    if (lost) {
      ctx.fillStyle = '#ff5a46'
      sans(ctx, Math.round(h * 0.085), 700)
      spaced(ctx, T('K3 · SİNYAL YOK', 'K3 · NO SIGNAL'), w * 0.08, h * 0.84, 3)
    } else {
      ctx.fillStyle = 'rgba(232,238,242,0.45)'
      mono(ctx, Math.round(h * 0.05))
      ctx.fillText(T('SON PAKET · GECİKME ARTIYOR', 'LAST PACKET · DELAY GROWING'), w * 0.08, h * 0.84)
    }
  }
}

/** The refund counter on the mission room wall. */
export function drawRefunds(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#050608'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(232,238,242,0.6)'
  sans(ctx, Math.round(h * 0.2), 600)
  spaced(ctx, T('İADE TALEPLERİ', 'REFUND REQUESTS'), w * 0.07, h * 0.42, 4)
  ctx.fillStyle = '#7dff9e'
  ctx.shadowColor = 'rgba(120,255,160,0.6)'
  ctx.shadowBlur = 10
  mono(ctx, Math.round(h * 0.5), 600)
  ctx.textAlign = 'right'
  ctx.fillText('0', w * 0.93, h * 0.72)
  ctx.textAlign = 'left'
  ctx.shadowBlur = 0
}

/** The request form's first page. */
export function drawForm(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#f2eee6'
  ctx.fillRect(0, 0, w, h)
  const m = w * 0.1
  keyhole(ctx, w / 2, h * 0.08, w * 0.03, '#2b2927', 2)
  ctx.fillStyle = '#1b1a19'
  ctx.textAlign = 'center'
  sans(ctx, Math.round(w * 0.062), 700)
  spaced(ctx, T('ÖTENAZİ TALEP FORMU', 'EUTHANASIA REQUEST FORM'), w / 2, h * 0.2, 3)
  sans(ctx, Math.round(w * 0.026), 400)
  ctx.fillStyle = 'rgba(27,26,25,0.6)'
  spaced(ctx, T('BİLİMSEL KEŞİF PROGRAMI · KATILIMCI BAŞVURUSU', 'SCIENTIFIC DISCOVERY PROGRAM · PARTICIPANT APPLICATION'), w / 2, h * 0.245, 2)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#1b1a19'
  ctx.fillRect(m, h * 0.27, w - 2 * m, 2)
  const fields = [T('Ad', 'Name'), T('Yaş', 'Age'), T('Sebep', 'Reason')]
  fields.forEach((f, i) => {
    const y = h * 0.36 + i * h * 0.09
    sans(ctx, Math.round(w * 0.038), 600)
    ctx.fillStyle = '#1b1a19'
    ctx.fillText(`${f}:`, m, y)
    ctx.fillRect(m + w * 0.16, y + 4, w - 2 * m - w * 0.16, 1.5)
    if (f === fields[2]) {
      ctx.fillStyle = 'rgba(27,26,25,0.5)'
      sans(ctx, Math.round(w * 0.024), 400)
      ctx.fillText(T('(doldurulması zorunlu değildir)', '(not required)'), m + w * 0.18, y + w * 0.05)
    }
  })
  smallPrint(ctx, m, h * 0.7, w - 2 * m, h * 0.9, 77, 6, 10)
}

const OTHER_PLACES: Array<[string, string]> = [
  ['KERMADEC ÇUKURU', 'KERMADEC TRENCH'],
  ['PUERTO RİKO ÇUKURU', 'PUERTO RICO TRENCH'],
  ['ARKTİK · BUZ ALTI', 'ARCTIC · UNDER THE ICE'],
  ['VOSTOK GÖLÜ', 'LAKE VOSTOK'],
  ['GÜNEY OKYANUSU · HADAL', 'SOUTHERN OCEAN · HADAL'],
  ['MAUNA LOA · KALDERA', 'MAUNA LOA · CALDERA'],
  ['ATACAMA · DERİN KUYU', 'ATACAMA · DEEP BOREHOLE'],
  ['AY · GÜNEY KUTBU', 'MOON · SOUTH POLE'],
  ['AY · ŞACKLETON KRATERİ', 'MOON · SHACKLETON CRATER'],
  ['MARS · HELLAS HAVZASI', 'MARS · HELLAS BASIN'],
  ['MARS · OLYMPUS MONS', 'MARS · OLYMPUS MONS'],
  ['FOBOS', 'PHOBOS'],
  ['4 VESTA', '4 VESTA'],
  ['16 PSYCHE', '16 PSYCHE'],
  ['BENNU', 'BENNU'],
  ['RYUGU', 'RYUGU'],
  ['CERES · OCCATOR', 'CERES · OCCATOR'],
  ['İO · VOLKANLAR', 'IO · VOLCANOES'],
  ['GANİMEDES', 'GANYMEDE'],
  ['KALLİSTO', 'CALLISTO'],
  ['ENCELADUS · GEYZERLER', 'ENCELADUS · GEYSERS'],
  ['JÜPİTER · BULUT ÜSTÜ', 'JUPITER · CLOUD TOPS'],
  ['VENÜS · BULUTLAR', 'VENUS · CLOUDS'],
  ['SATÜRN · HALKALAR', 'SATURN · RINGS'],
  ['TRİTON', 'TRITON'],
  ['MİRANDA', 'MIRANDA'],
  ['ARROKOTH', 'ARROKOTH'],
  ['GÜNEŞ · KORONA', 'SUN · CORONA'],
]

export type Plaque = { name: string; date: string; col: number; row: number; named: boolean }

/** The 39 plaques, oldest (column 0) to newest (column 12); rows top (0) to bottom (2). */
export function plaqueList(): Plaque[] {
  const named: Record<string, string> = {
    '0,1': T('MARİANA ÇUKURU · CHALLENGER DERİNLİĞİ', 'MARIANA TRENCH · CHALLENGER DEEP'),
    '4,1': '433 EROS',
    '7,0': T('EUROPA · BUZ ALTI', 'EUROPA · UNDER THE ICE'),
    '7,2': T('TİTAN · METAN DENİZİ', 'TITAN · METHANE SEA'),
    '10,0': T('VENÜS · YÜZEY', 'VENUS · SURFACE'),
    '10,2': T('MERKÜR · GECE YÜZÜ', 'MERCURY · NIGHT SIDE'),
    '12,0': T('KARA DELİK I', 'BLACK HOLE I'),
    '12,2': T('KARA DELİK II', 'BLACK HOLE II'),
    '12,1': T('KARA DELİK III', 'BLACK HOLE III'),
  }
  const out: Plaque[] = []
  let k = 0
  for (let col = 0; col < 13; col++)
    for (let row = 0; row < 3; row++) {
      const key = `${col},${row}`
      const n = col * 3 + row
      const year = 2031 + Math.floor(n * 0.82)
      const date = `${String(((n * 5) % 27) + 1).padStart(2, '0')}.${String(((n * 7) % 12) + 1).padStart(2, '0')}.${year}`
      if (named[key]) out.push({ name: named[key], date, col, row, named: true })
      else {
        const [tr, en] = OTHER_PLACES[k++ % OTHER_PLACES.length]
        out.push({ name: T(tr, en), date, col, row, named: false })
      }
    }
  return out
}

/** One plaque drawn into a cell of the atlas. */
export function drawPlaque(ctx: Ctx, x: number, y: number, w: number, h: number, p: Plaque) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#a98a54')
  g.addColorStop(0.5, '#c9a86f')
  g.addColorStop(1, '#8f7240')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(50,35,12,0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10)
  ctx.fillStyle = '#2e200b'
  // The name: one line when it fits left of the emblem; else split at " · " on two lines; else shrunk.
  const maxW = w * 0.76
  const parts = p.name.split(' · ')
  sans(ctx, Math.round(h * 0.17), 700)
  ctx.letterSpacing = '0px'
  const fits = ctx.measureText(p.name).width + p.name.length <= maxW
  ctx.letterSpacing = '1px'
  if (fits) ctx.fillText(p.name, x + w * 0.07, y + h * 0.36)
  else if (parts.length > 1) {
    const b = parts.slice(1).join(' · ')
    sans(ctx, Math.round(h * 0.13), 700)
    fitFont(ctx, parts[0], maxW, 1)
    ctx.fillText(parts[0], x + w * 0.07, y + h * 0.3)
    sans(ctx, Math.round(h * 0.11), 600)
    fitFont(ctx, b, maxW, 1)
    ctx.fillText(b, x + w * 0.07, y + h * 0.47)
  } else {
    fitFont(ctx, p.name, maxW, 1)
    ctx.fillText(p.name, x + w * 0.07, y + h * 0.36)
  }
  ctx.letterSpacing = '0px'
  mono(ctx, Math.round(h * 0.11))
  ctx.fillStyle = 'rgba(46,32,11,0.8)'
  ctx.fillText(p.date, x + w * 0.07, y + h * 0.78)
  // The number every plaque carries.
  sans(ctx, Math.round(h * 0.34), 700)
  ctx.fillStyle = '#2e200b'
  ctx.textAlign = 'right'
  ctx.fillText('33', x + w * 0.93, y + h * 0.82)
  ctx.textAlign = 'left'
  keyhole(ctx, x + w * 0.88, y + h * 0.2, h * 0.05, 'rgba(46,32,11,0.7)', 1.5)
}

/** A shoulder patch: the emblem on dark cloth. */
export function drawPatch(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#26282c'
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2)
  ctx.fill()
  keyhole(ctx, w / 2, h * 0.36, w * 0.13, '#c9ccd0', 3)
}

/** The case of the guitar, the scarf's knit, small things — a tag for the yarn ball. */
export function drawYarnTag(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#e8e2d4'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#3b6fd1'
  sans(ctx, Math.round(h * 0.4), 700)
  ctx.fillText('YÜN', w * 0.1, h * 0.65)
}

/** A monitor on an operator desk: a few traces and numbers. */
export function drawOpsMonitor(seed: number, red: number) {
  return (ctx: Ctx, w: number, h: number) => {
    ctx.fillStyle = '#05080c'
    ctx.fillRect(0, 0, w, h)
    const rand = mulberry32(seed)
    ctx.strokeStyle = red > 0.5 ? 'rgba(255,110,90,0.7)' : 'rgba(140,200,255,0.7)'
    ctx.lineWidth = 2
    for (let k = 0; k < 3; k++) {
      ctx.beginPath()
      const y0 = h * (0.25 + k * 0.22)
      for (let x = 0; x < w * 0.6; x += 4) {
        const y = y0 + Math.sin(x * 0.05 + rand() * 6) * h * 0.04 * (red > 0.5 ? 0.1 : 1)
        if (x === 0) ctx.moveTo(w * 0.05 + x, y)
        else ctx.lineTo(w * 0.05 + x, y)
      }
      ctx.stroke()
    }
    mono(ctx, Math.round(h * 0.07))
    for (let k = 0; k < 7; k++) {
      ctx.fillStyle = 'rgba(232,238,242,0.55)'
      ctx.fillText(`${(rand() * 9999).toFixed(0).padStart(4, '0')}  ${(rand() * 99).toFixed(2)}`, w * 0.68, h * (0.18 + k * 0.11))
    }
  }
}
