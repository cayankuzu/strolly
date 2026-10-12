/**
 * DURUM's paper and small objects, drawn on canvases: the two thermal slips
 * (one paper, one type, both addressed "siz"), the sealed page, the brass
 * plaque, the rule taped to the glass, Defne's sticky note, the verification
 * report, the box seal, the banded notes and the cheque, the coin's two faces,
 * the tally counter's window, the phone, the tablet, the old printer's LCD.
 */
import { mono, sans } from '../screens'

export type Ctx = CanvasRenderingContext2D

const THERMAL = '#f1efe8'
const PRINT = '#2a2a2a'
const HAND = `'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive`

/** Light paper grain and a soft edge shading (so paper reads as paper, not as a screen). */
function grain(c: Ctx, W: number, H: number, base: string, seed = 1, amount = 0.035) {
  c.fillStyle = base
  c.fillRect(0, 0, W, H)
  let s = seed * 9301 + 49297
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const n = Math.round((W * H) / 90)
  for (let i = 0; i < n; i++) {
    const v = rnd() < 0.5 ? 0 : 255
    c.fillStyle = `rgba(${v},${v},${v},${amount * rnd()})`
    c.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2)
  }
}

/** Thermal print: monospaced caps, a little faded and uneven, like the real thing. */
function thermalLine(c: Ctx, text: string, x: number, y: number, size: number, weight = 600) {
  mono(c, size, weight)
  c.fillStyle = PRINT
  c.globalAlpha = 0.92
  c.fillText(text, x, y)
  c.globalAlpha = 1
}

function wrapLines(c: Ctx, text: string, maxW: number) {
  const out: string[] = []
  let line = ''
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w
    if (c.measureText(t).width > maxW && line) {
      out.push(line)
      line = w
    } else line = t
  }
  if (line) out.push(line)
  return out
}

/**
 * A thermal slip (portrait canvas): a perforated top, the time it was printed,
 * the lines, a dotted rule and a small footer. `lines` are the predicted words.
 */
export function drawSlip(c: Ctx, W: number, H: number, s: { stamp: string; lines: string[]; footer?: string }) {
  grain(c, W, H, THERMAL, 3, 0.03)
  // Torn top edge.
  c.fillStyle = 'rgba(0,0,0,0.08)'
  for (let x = 0; x < W; x += 10) c.fillRect(x, 0, 5, 3)
  const pad = W * 0.1
  const size = Math.round(W * 0.085)
  mono(c, Math.round(size * 0.8), 500)
  c.fillStyle = PRINT
  c.globalAlpha = 0.75
  c.fillText('DURUM · K.D.M.', pad, H * 0.07)
  c.globalAlpha = 1
  c.fillStyle = 'rgba(42,42,42,0.5)'
  for (let x = pad; x < W - pad; x += 12) c.fillRect(x, H * 0.09, 6, 2)
  thermalLine(c, s.stamp, pad, H * 0.16, Math.round(size * 1.05), 700)
  let y = H * 0.27
  mono(c, size, 700)
  for (const l of s.lines) {
    for (const part of wrapLines(c, l, W - pad * 2)) {
      thermalLine(c, part, pad, y, size, 700)
      y += size * 1.35
    }
    y += size * 0.7
  }
  c.fillStyle = 'rgba(42,42,42,0.5)'
  for (let x = pad; x < W - pad; x += 12) c.fillRect(x, y, 6, 2)
  mono(c, Math.round(size * 0.65), 500)
  c.fillStyle = PRINT
  c.globalAlpha = 0.6
  c.fillText(s.footer ?? 'YAYIMLANMAZ', pad, y + size * 1.4)
  c.fillText('#000000412', pad, y + size * 2.3)
  c.globalAlpha = 1
}

/** The envelope's page: dot-matrix lines, folded in three (the folds as faint creases). */
export function drawPage(c: Ctx, W: number, H: number, s: { lines: string[] }) {
  grain(c, W, H, '#f4f1e9', 5, 0.03)
  // Tractor-feed holes, both margins.
  c.fillStyle = 'rgba(0,0,0,0.12)'
  for (let y = 30; y < H; y += 46)
    for (const x of [18, W - 18]) {
      c.beginPath()
      c.arc(x, y, 7, 0, Math.PI * 2)
      c.fill()
    }
  // Creases where it was folded in three.
  for (const f of [1 / 3, 2 / 3]) {
    const g = c.createLinearGradient(0, H * f - 8, 0, H * f + 8)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.5, 'rgba(0,0,0,0.09)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, H * f - 8, W, 16)
  }
  const pad = W * 0.11
  mono(c, Math.round(W * 0.026), 500)
  c.fillStyle = 'rgba(30,30,30,0.6)'
  c.fillText('DURUM · KÜRESEL DURUM MODELİ · ÇIKTI 21:13:00', pad, H * 0.08)
  c.fillText('TAHMİN · DUYMAYAN ARİF İÇİN', pad, H * 0.11)
  // Dot-matrix: each glyph drawn twice, slightly offset, and a little uneven.
  const size = Math.round(W * 0.052)
  let y = H * 0.4
  for (const l of s.lines) {
    mono(c, size, 600)
    for (const part of wrapLines(c, l, W - pad * 2)) {
      c.fillStyle = 'rgba(20,20,22,0.85)'
      c.fillText(part, pad, y)
      c.fillStyle = 'rgba(20,20,22,0.35)'
      c.fillText(part, pad + 1.5, y + 1)
      y += size * 1.5
    }
    y += size * 0.55
  }
}

/** The brass plaque above the glass door. */
export function drawPlaque(c: Ctx, W: number, H: number) {
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#8a6a32')
  g.addColorStop(0.35, '#c9a457')
  g.addColorStop(0.55, '#a8843f')
  g.addColorStop(1, '#6f5426')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  // Brushed lines.
  for (let y = 0; y < H; y += 2) {
    c.fillStyle = `rgba(255,240,200,${0.03 + 0.03 * Math.sin(y * 1.7)})`
    c.fillRect(0, y, W, 1)
  }
  c.strokeStyle = 'rgba(60,40,10,0.6)'
  c.lineWidth = 3
  c.strokeRect(8, 8, W - 16, H - 16)
  // Screws.
  for (const x of [22, W - 22]) {
    c.fillStyle = '#5c4520'
    c.beginPath()
    c.arc(x, H / 2, 7, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = 'rgba(255,230,180,0.5)'
    c.beginPath()
    c.moveTo(x - 5, H / 2)
    c.lineTo(x + 5, H / 2)
    c.stroke()
  }
  // Engraved: dark fill with a light lower edge.
  const line = (text: string, y: number, size: number, weight: number) => {
    c.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`
    c.textAlign = 'center'
    c.fillStyle = 'rgba(255,236,190,0.45)'
    c.fillText(text, W / 2, y + 1.5)
    c.fillStyle = '#3a2a10'
    c.fillText(text, W / 2, y)
    c.textAlign = 'left'
  }
  line('Bir an ver bana; sana bütün zamanları vereyim.', H * 0.5, Math.round(H * 0.24), 500)
  line('Laplace’a, 1814.', H * 0.82, Math.round(H * 0.15), 400)
}

/** The rule, printed on A4 and taped to the glass. */
export function drawRule(c: Ctx, W: number, H: number) {
  grain(c, W, H, '#f5f4f0', 7, 0.025)
  c.fillStyle = '#121212'
  sans(c, Math.round(W * 0.115), 800)
  c.textAlign = 'center'
  const lines = ['TAHMİN', 'YAYIMLANIRSA', 'GEÇERSİZ', 'OLUR.']
  lines.forEach((l, i) => c.fillText(l, W / 2, H * 0.36 + i * W * 0.14))
  c.fillStyle = 'rgba(0,0,0,0.45)'
  mono(c, Math.round(W * 0.03), 400)
  c.fillText('— DURUM İŞLETME KURALI 1 —', W / 2, H * 0.88)
  c.textAlign = 'left'
  // Tape strips at the top corners.
  c.fillStyle = 'rgba(235,228,200,0.55)'
  c.save()
  c.translate(W * 0.12, H * 0.03)
  c.rotate(-0.3)
  c.fillRect(-W * 0.09, -12, W * 0.18, 30)
  c.restore()
  c.save()
  c.translate(W * 0.88, H * 0.03)
  c.rotate(0.28)
  c.fillRect(-W * 0.09, -12, W * 0.18, 30)
  c.restore()
}

/** Defne's sticky note on the monitor bezel: "Cumartesi" crossed out and rewritten twice. */
export function drawNote(c: Ctx, W: number, H: number) {
  c.fillStyle = '#f2d76b'
  c.fillRect(0, 0, W, H)
  const g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(120,90,0,0.12)')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#23305a'
  c.font = `600 ${Math.round(H * 0.13)}px ${HAND}`
  c.fillText('Defne’ye', W * 0.08, H * 0.2)
  c.fillText('teleskobu göster.', W * 0.08, H * 0.36)
  c.font = `500 ${Math.round(H * 0.11)}px ${HAND}`
  // Two crossed-out Saturdays and a third.
  const sats: Array<[number, number]> = [
    [W * 0.08, H * 0.56],
    [W * 0.5, H * 0.56],
  ]
  for (const [x, y] of sats) {
    c.fillText('Cmt', x, y)
    c.strokeStyle = '#23305a'
    c.lineWidth = 3
    c.beginPath()
    c.moveTo(x - 2, y - H * 0.04)
    c.lineTo(x + W * 0.3, y - H * 0.03)
    c.stroke()
  }
  c.fillText('Cumartesi, 19.00', W * 0.08, H * 0.8)
}

/** The weekly verification report on the desk: one red line. */
export function drawReport(c: Ctx, W: number, H: number) {
  grain(c, W, H, '#f3f1ec', 11, 0.02)
  const pad = W * 0.1
  c.fillStyle = '#1b1b1b'
  sans(c, Math.round(W * 0.05), 700)
  c.fillText('HAFTALIK DOĞRULAMA RAPORU', pad, H * 0.08)
  mono(c, Math.round(W * 0.03), 400)
  c.fillStyle = '#555'
  c.fillText('DURUM · K.D.M. · 41. hafta', pad, H * 0.115)
  sans(c, Math.round(W * 0.12), 300)
  c.fillStyle = '#1b1b1b'
  c.fillText('%99,97', pad, H * 0.22)
  mono(c, Math.round(W * 0.028), 400)
  const rows = ['trafik · Kızılay', 'hava · Gölbaşı', 'şebeke yükü', 'nüfus akışı', 'hava · Ankara', 'trafik · Ulus', 'hava · İstanbul', 'su seviyesi · Eymir']
  let y = H * 0.3
  for (let i = 0; i < 18; i++) {
    const red = i === 11
    if (red) {
      c.fillStyle = 'rgba(224,90,71,0.16)'
      c.fillRect(pad - 6, y - W * 0.03, W - pad * 2 + 12, W * 0.042)
    }
    c.fillStyle = red ? '#c0392b' : '#333'
    c.fillText(red ? '02.11 · hava · YANLIŞ · tahmin yayımlandı' : `${String(i + 1).padStart(2, '0')}.11 · ${rows[i % rows.length]} · DOĞRU`, pad, y)
    y += W * 0.05
  }
}

/** Selin's child's drawing, pinned to her partition. */
export function drawDrawing(c: Ctx, W: number, H: number) {
  grain(c, W, H, '#f7f3ea', 13, 0.02)
  // A computer with a face, a mother beside it with a cup, stars at the window.
  c.strokeStyle = '#3a6bd4'
  c.lineWidth = 6
  c.strokeRect(W * 0.12, H * 0.32, W * 0.4, H * 0.3)
  c.fillStyle = '#3a6bd4'
  c.fillRect(W * 0.28, H * 0.62, W * 0.08, H * 0.08)
  c.fillRect(W * 0.2, H * 0.7, W * 0.24, H * 0.03)
  c.fillStyle = '#3a6bd4'
  c.beginPath()
  c.arc(W * 0.26, H * 0.44, 5, 0, Math.PI * 2)
  c.arc(W * 0.38, H * 0.44, 5, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.arc(W * 0.32, H * 0.5, 16, 0.2, Math.PI - 0.2)
  c.stroke()
  // Mother.
  c.strokeStyle = '#2f7d4f'
  c.fillStyle = '#e46b4f'
  c.beginPath()
  c.arc(W * 0.74, H * 0.36, H * 0.08, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.moveTo(W * 0.74, H * 0.44)
  c.lineTo(W * 0.66, H * 0.74)
  c.lineTo(W * 0.82, H * 0.74)
  c.closePath()
  c.fill()
  c.strokeStyle = '#e46b4f'
  c.lineWidth = 5
  c.beginPath()
  c.moveTo(W * 0.7, H * 0.52)
  c.lineTo(W * 0.6, H * 0.5)
  c.stroke()
  c.fillStyle = '#e8c94a'
  for (const [x, y] of [
    [0.7, 0.12],
    [0.84, 0.18],
    [0.92, 0.1],
  ])
    c.fillRect(W * x, H * y, 8, 8)
  c.fillStyle = '#333'
  c.font = `500 ${Math.round(H * 0.075)}px ${HAND}`
  c.fillText('Annemin işi:', W * 0.06, H * 0.15)
  c.font = `400 ${Math.round(H * 0.058)}px ${HAND}`
  c.fillText('bilgisayar uyumasın diye bekliyor', W * 0.06, H * 0.88)
}

/** The whiteboard on the south wall: ghosts of erased writing and two lines left. */
export function drawBoard(c: Ctx, W: number, H: number) {
  c.fillStyle = '#eceeea'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = 'rgba(80,90,100,0.1)'
  c.lineWidth = 10
  for (let i = 0; i < 9; i++) {
    c.beginPath()
    c.moveTo(W * 0.05, H * (0.1 + i * 0.09))
    c.bezierCurveTo(W * 0.3, H * (0.08 + i * 0.09), W * 0.6, H * (0.14 + i * 0.09), W * 0.9, H * (0.1 + i * 0.09))
    c.stroke()
  }
  c.fillStyle = '#25466e'
  c.font = `500 ${Math.round(H * 0.07)}px ${HAND}`
  c.fillText('S(t) → S(t + Δt)', W * 0.06, H * 0.2)
  c.fillText('Δx · Δp ≥ ħ/2   (!)', W * 0.06, H * 0.34)
  c.strokeStyle = '#25466e'
  c.lineWidth = 3
  c.strokeRect(W * 0.56, H * 0.42, W * 0.36, H * 0.3)
  c.fillText('NÖBET', W * 0.6, H * 0.52)
  c.font = `400 ${Math.round(H * 0.055)}px ${HAND}`
  c.fillText('Prş · Arif / Selin', W * 0.6, H * 0.63)
  c.fillStyle = 'rgba(160,40,40,0.6)'
  c.fillText('Soğutma filtresi — CUMA!', W * 0.06, H * 0.86)
}

/** B's paper seal: over lid and front, printed in red. */
export function drawSeal(c: Ctx, W: number, H: number) {
  grain(c, W, H, '#f6f4ee', 17, 0.03)
  c.fillStyle = '#a3241c'
  mono(c, Math.round(H * 0.42), 700)
  c.textAlign = 'center'
  c.fillText('DURUM · MÜHÜR · ÇARŞAMBA 23.58', W / 2, H * 0.66)
  c.textAlign = 'left'
  c.strokeStyle = 'rgba(163,36,28,0.6)'
  c.lineWidth = 2
  c.strokeRect(4, 4, W - 8, H - 8)
}

/** The torn seal: the same strip, broken in the middle. */
export function drawSealTorn(c: Ctx, W: number, H: number) {
  drawSeal(c, W, H)
  c.clearRect(W * 0.48, 0, W * 0.05, H)
}

/** The paper band round the fan of notes: "1.000 TL". */
export function drawBand(c: Ctx, W: number, H: number) {
  grain(c, W, H, '#efe9da', 19, 0.03)
  c.fillStyle = '#3a3a34'
  mono(c, Math.round(H * 0.5), 700)
  c.textAlign = 'center'
  c.fillText('1.000 TL', W / 2, H * 0.68)
  c.textAlign = 'left'
}

/** A 200-lira note, face: a pale lilac-brown note with a portrait window and numerals (no likeness). */
export function drawNoteFace(c: Ctx, W: number, H: number) {
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#c9b6c8')
  g.addColorStop(1, '#a99bb4')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  c.strokeStyle = 'rgba(70,50,80,0.35)'
  c.lineWidth = 1
  for (let i = 0; i < 40; i++) {
    c.beginPath()
    c.ellipse(W * 0.72, H * 0.5, 8 + i * 4, 4 + i * 2, 0, 0, Math.PI * 2)
    c.stroke()
  }
  c.fillStyle = 'rgba(255,255,255,0.35)'
  c.beginPath()
  c.ellipse(W * 0.22, H * 0.5, H * 0.26, H * 0.34, 0, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#4a3654'
  mono(c, Math.round(H * 0.3), 700)
  c.fillText('200', W * 0.6, H * 0.36)
  mono(c, Math.round(H * 0.12), 600)
  c.fillText('TÜRK LİRASI', W * 0.55, H * 0.82)
}

/** The cheque in B: pale green, one million in words. */
export function drawCheque(c: Ctx, W: number, H: number) {
  grain(c, W, H, '#d7ead7', 23, 0.03)
  c.strokeStyle = 'rgba(40,90,60,0.18)'
  for (let x = -H; x < W; x += 9) {
    c.beginPath()
    c.moveTo(x, 0)
    c.lineTo(x + H, H)
    c.stroke()
  }
  c.fillStyle = '#1f3f2c'
  mono(c, Math.round(H * 0.09), 600)
  c.fillText('ÇEK · NO 000412', W * 0.05, H * 0.15)
  c.textAlign = 'right'
  c.fillText('ÇARŞAMBA', W * 0.95, H * 0.15)
  c.textAlign = 'left'
  sans(c, Math.round(H * 0.15), 700)
  c.fillText('BİR MİLYON TÜRK LİRASI', W * 0.05, H * 0.48)
  mono(c, Math.round(H * 0.12), 600)
  c.fillText('#1.000.000,00#', W * 0.05, H * 0.68)
  c.strokeStyle = '#1f3f2c'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(W * 0.6, H * 0.84)
  c.lineTo(W * 0.95, H * 0.84)
  c.stroke()
  c.font = `500 ${Math.round(H * 0.12)}px ${HAND}`
  c.fillText('Kurul', W * 0.66, H * 0.8)
}

/** The rack label: the regress as a sticker. */
export function drawRackLabel(c: Ctx, W: number, H: number) {
  c.fillStyle = '#e8e2d2'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#1a1a1a'
  mono(c, Math.round(H * 0.42), 700)
  c.fillText('ÖZ-MODEL · KATMAN 7', 10, H * 0.5)
  mono(c, Math.round(H * 0.24), 500)
  c.fillStyle = '#444'
  c.fillText('bkz. KATMAN 8', 10, H * 0.84)
}

/**
 * One face of the 1 TL coin (bimetal: a brass ring round a silver disc).
 * TURA is the portrait side (a plain relief profile, no likeness); YAZI the numeral.
 */
export function drawCoin(c: Ctx, W: number, H: number, side: 'tura' | 'yazi') {
  const cx = W / 2
  const cy = H / 2
  const R = W * 0.49
  c.clearRect(0, 0, W, H)
  const ring = c.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R)
  ring.addColorStop(0, '#f1d58e')
  ring.addColorStop(0.6, '#c99f4a')
  ring.addColorStop(1, '#8c6a2a')
  c.fillStyle = ring
  c.beginPath()
  c.arc(cx, cy, R, 0, Math.PI * 2)
  c.fill()
  // Reeding hint on the rim.
  c.strokeStyle = 'rgba(90,60,20,0.35)'
  c.lineWidth = 1
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2
    c.beginPath()
    c.moveTo(cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94)
    c.lineTo(cx + Math.cos(a) * R * 0.99, cy + Math.sin(a) * R * 0.99)
    c.stroke()
  }
  const r = R * 0.66
  const disc = c.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r)
  disc.addColorStop(0, '#f2f2ee')
  disc.addColorStop(0.7, '#bdbdb8')
  disc.addColorStop(1, '#85857f')
  c.fillStyle = disc
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = 'rgba(60,50,30,0.5)'
  c.lineWidth = 2
  c.stroke()
  const relief = (draw: () => void) => {
    c.save()
    c.translate(1.5, 1.5)
    c.fillStyle = 'rgba(40,40,40,0.45)'
    draw()
    c.restore()
    c.save()
    c.fillStyle = 'rgba(255,255,255,0.55)'
    draw()
    c.restore()
  }
  if (side === 'tura') {
    // A plain profile in relief, facing right.
    relief(() => {
      c.beginPath()
      c.moveTo(cx - r * 0.35, cy + r * 0.62)
      c.bezierCurveTo(cx - r * 0.45, cy + r * 0.1, cx - r * 0.5, cy - r * 0.55, cx - r * 0.05, cy - r * 0.62)
      c.bezierCurveTo(cx + r * 0.3, cy - r * 0.62, cx + r * 0.38, cy - r * 0.3, cx + r * 0.36, cy - r * 0.12)
      c.lineTo(cx + r * 0.46, cy + r * 0.02)
      c.lineTo(cx + r * 0.34, cy + r * 0.08)
      c.bezierCurveTo(cx + r * 0.36, cy + r * 0.22, cx + r * 0.28, cy + r * 0.3, cx + r * 0.12, cy + r * 0.32)
      c.lineTo(cx + r * 0.1, cy + r * 0.62)
      c.closePath()
      c.fill()
    })
    c.fillStyle = 'rgba(70,50,20,0.7)'
    mono(c, Math.round(R * 0.12), 700)
    c.textAlign = 'center'
    c.fillText('TÜRKİYE CUMHURİYETİ', cx, cy - R * 0.76)
    c.fillText('2031', cx, cy + R * 0.86)
  } else {
    relief(() => {
      sans(c, Math.round(r * 1.25), 800)
      c.textAlign = 'center'
      c.fillText('1', cx - r * 0.18, cy + r * 0.42)
      sans(c, Math.round(r * 0.42), 700)
      c.fillText('TL', cx + r * 0.42, cy + r * 0.38)
    })
    c.fillStyle = 'rgba(70,50,20,0.7)'
    mono(c, Math.round(R * 0.12), 700)
    c.textAlign = 'center'
    c.fillText('BİR TÜRK LİRASI', cx, cy - R * 0.76)
  }
  c.textAlign = 'left'
}

/** The tally counter's window: four drum digits. */
export function drawCounter(c: Ctx, W: number, H: number, n: number) {
  c.fillStyle = '#0e0e0e'
  c.fillRect(0, 0, W, H)
  const digits = String(Math.max(0, Math.min(9999, n))).padStart(4, '0')
  const cw = W / 4
  for (let i = 0; i < 4; i++) {
    const g = c.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#9a9a96')
    g.addColorStop(0.5, '#f4f4f0')
    g.addColorStop(1, '#9a9a96')
    c.fillStyle = g
    c.fillRect(i * cw + 2, 2, cw - 4, H - 4)
    c.fillStyle = '#111'
    mono(c, Math.round(H * 0.8), 700)
    c.textAlign = 'center'
    c.fillText(digits[i], i * cw + cw / 2, H * 0.82)
  }
  c.textAlign = 'left'
}

/** The old printer's small amber LCD. */
export function drawLcd(c: Ctx, W: number, H: number, text: string, on: boolean) {
  c.fillStyle = on ? '#2a1d08' : '#0d0b08'
  c.fillRect(0, 0, W, H)
  if (!on) return
  c.fillStyle = '#ffb347'
  mono(c, Math.round(H * 0.55), 700)
  c.textAlign = 'center'
  c.fillText(text, W / 2, H * 0.72)
  c.textAlign = 'left'
}

// ——— The phone ———

export type PhoneState =
  | { mode: 'off' }
  | { mode: 'lock'; clock: string; notify: string | null }
  | { mode: 'thread'; clock: string; compose: string; sent: boolean; scroll: number }

const DEFNE_MSG = 'Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim.'

export function drawPhone(c: Ctx, W: number, H: number, s: PhoneState) {
  c.fillStyle = '#030405'
  c.fillRect(0, 0, W, H)
  if (s.mode === 'off') return
  const g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#1b2534')
  g.addColorStop(1, '#0b0f15')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  const pad = W * 0.07
  if (s.mode === 'lock') {
    c.fillStyle = '#eef1f4'
    sans(c, Math.round(W * 0.26), 200)
    c.textAlign = 'center'
    c.fillText(s.clock, W / 2, H * 0.22)
    sans(c, Math.round(W * 0.055), 400)
    c.fillStyle = 'rgba(238,241,244,0.7)'
    c.fillText('Perşembe', W / 2, H * 0.27)
    c.textAlign = 'left'
    if (s.notify) {
      const y = H * 0.36
      c.fillStyle = 'rgba(255,255,255,0.13)'
      roundRect(c, pad, y, W - pad * 2, H * 0.12, 18)
      c.fill()
      c.fillStyle = 'rgba(238,241,244,0.7)'
      sans(c, Math.round(W * 0.05), 600)
      c.fillText(s.notify, pad + 16, y + H * 0.04)
      c.fillStyle = '#eef1f4'
      sans(c, Math.round(W * 0.052), 400)
      c.fillText('Yemek fırında. Yine sabah mı?…', pad + 16, y + H * 0.085)
    }
    return
  }
  // The thread with Defne.
  c.fillStyle = 'rgba(255,255,255,0.06)'
  c.fillRect(0, 0, W, H * 0.1)
  c.fillStyle = '#eef1f4'
  sans(c, Math.round(W * 0.065), 600)
  c.textAlign = 'center'
  c.fillText('Defne', W / 2, H * 0.065)
  c.textAlign = 'left'
  const off = s.scroll * H * 0.04
  c.fillStyle = 'rgba(238,241,244,0.45)'
  sans(c, Math.round(W * 0.042), 400)
  c.textAlign = 'center'
  c.fillText('Bugün 22.53', W / 2, H * 0.16 + off)
  c.textAlign = 'left'
  // Her bubble.
  sans(c, Math.round(W * 0.068), 400)
  const lines = wrapLines(c, DEFNE_MSG, W * 0.66)
  const bh = lines.length * W * 0.09 + W * 0.06
  c.fillStyle = '#2a3442'
  roundRect(c, pad, H * 0.19 + off, W * 0.76, bh, 22)
  c.fill()
  c.fillStyle = '#eef1f4'
  lines.forEach((l, i) => c.fillText(l, pad + W * 0.05, H * 0.19 + off + W * 0.1 + i * W * 0.09))
  // His reply, once sent.
  if (s.sent) {
    const y = H * 0.19 + off + bh + H * 0.04
    sans(c, Math.round(W * 0.068), 500)
    const w = c.measureText('Geliyorum').width + W * 0.12
    c.fillStyle = '#3b6fd8'
    roundRect(c, W - pad - w, y, w, W * 0.15, 22)
    c.fill()
    c.fillStyle = '#ffffff'
    c.fillText('Geliyorum', W - pad - w + W * 0.06, y + W * 0.1)
    c.fillStyle = 'rgba(238,241,244,0.5)'
    sans(c, Math.round(W * 0.04), 400)
    c.textAlign = 'right'
    c.fillText('03.06 · İletildi', W - pad, y + W * 0.21)
    c.textAlign = 'left'
  }
  // Compose field.
  const fy = H * 0.86
  c.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(c, pad, fy, W - pad * 2, H * 0.075, 26)
  c.fill()
  sans(c, Math.round(W * 0.06), 400)
  if (s.compose) {
    c.fillStyle = '#eef1f4'
    c.fillText(s.compose + '|', pad + W * 0.05, fy + H * 0.05)
  } else {
    c.fillStyle = 'rgba(238,241,244,0.4)'
    c.fillText('Mesaj', pad + W * 0.05, fy + H * 0.05)
  }
}

function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

// ——— Selin's tablet in the hall ———

export function drawTablet(c: Ctx, W: number, H: number, s: { stage: 0 | 1 | 2; t: number }) {
  c.fillStyle = '#0c1014'
  c.fillRect(0, 0, W, H)
  const pad = W * 0.05
  c.fillStyle = '#7d8a93'
  mono(c, Math.round(H * 0.045), 500)
  c.fillText('SOĞUTMA · SALON B', pad, H * 0.08)
  const title = s.stage === 2 ? 'EK SOĞUTMA TALEBİ (2) · EK SOĞUTMA İÇİN' : 'EK SOĞUTMA TALEBİ · ÖZ-MODEL'
  c.fillStyle = s.stage === 2 ? '#e2b062' : '#d9dde0'
  sans(c, Math.round(H * 0.06), 600)
  c.fillText(title, pad, H * 0.19)
  // Temperature, climbing 27 → 31 °C.
  const gx = pad
  const gy = H * 0.27
  const gw = W - pad * 2
  const gh = H * 0.42
  c.strokeStyle = '#22303a'
  c.strokeRect(gx, gy, gw, gh)
  c.strokeStyle = '#e2b062'
  c.lineWidth = 3
  c.beginPath()
  for (let i = 0; i <= 60; i++) {
    const u = i / 60
    const v = 27 + 4 * Math.pow(u, 1.6) + 0.15 * Math.sin(i * 1.3 + s.t)
    const x = gx + u * gw
    const y = gy + gh - ((v - 26) / 6) * gh
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.stroke()
  c.fillStyle = '#7d8a93'
  mono(c, Math.round(H * 0.04), 400)
  c.fillText('27 °C', gx + 6, gy + gh - 8)
  c.fillStyle = '#e2b062'
  c.textAlign = 'right'
  c.fillText('31 °C', gx + gw - 6, gy + 26)
  c.textAlign = 'left'
  // The button.
  const by = H * 0.76
  const approved = s.stage >= 1
  c.fillStyle = approved && s.stage === 1 ? '#78c49b' : '#1d3a2c'
  roundRect(c, pad, by, W * 0.36, H * 0.15, 14)
  c.fill()
  c.fillStyle = approved && s.stage === 1 ? '#0c1014' : '#78c49b'
  sans(c, Math.round(H * 0.06), 700)
  c.fillText(approved && s.stage === 1 ? 'ONAYLANDI' : 'ONAYLA', pad + W * 0.04, by + H * 0.1)
  c.fillStyle = '#47535b'
  roundRect(c, pad + W * 0.42, by, W * 0.3, H * 0.15, 14)
  c.fill()
  c.fillStyle = '#d9dde0'
  c.fillText('REDDET', pad + W * 0.46, by + H * 0.1)
}
