/**
 * What the desk's screens, its touch glass and the records draw: thumbnails
 * sorting into columns, the two dates, the observer lines, a single line of
 * light, a faint grid; the window under his cheek; the records' timecode and
 * vignette. Everything is drawn into canvases keyed by state, so nothing is
 * redrawn while it does not change.
 */
import { mulberry32 } from '@/lib/math'
import { mono, sans } from '../screens'

export type Ctx = CanvasRenderingContext2D

const CATS = ['SAVAŞ', 'EKONOMİ', 'İNANÇ', 'GÖÇ', 'BİLİM', 'ÇÖKÜŞ', 'TOPARLANMA', 'HABERLER']

const thumbs = (() => {
  const rand = mulberry32(88)
  return Array.from({ length: 900 }, () => ({
    kind: rand() < 0.5 ? 'photo' : rand() < 0.6 ? 'doc' : 'paper',
    tone: 0.25 + rand() * 0.6,
    warm: rand(),
    cat: Math.floor(rand() * CATS.length),
    x: rand(),
    y: rand(),
    speed: 0.3 + rand() * 0.7,
    delay: rand(),
  }))
})()

function thumb(g: Ctx, kind: string, tone: number, warm: number, x: number, y: number, w: number, h: number, a: number) {
  g.globalAlpha = a
  if (kind === 'photo') {
    const r = Math.floor(255 * tone * (0.9 + warm * 0.15))
    const gg = Math.floor(255 * tone * 0.92)
    const b = Math.floor(255 * tone * (0.85 - warm * 0.1))
    g.fillStyle = `rgb(${r},${gg},${b})`
    g.fillRect(x, y, w, h)
    g.fillStyle = `rgba(0,0,0,${0.25 + warm * 0.3})`
    g.fillRect(x, y + h * 0.55, w, h * 0.45)
  } else if (kind === 'doc') {
    g.fillStyle = '#d9d6cf'
    g.fillRect(x, y, w, h)
    g.fillStyle = 'rgba(40,40,40,0.55)'
    for (let l = 0; l < 4; l++) g.fillRect(x + w * 0.12, y + h * (0.2 + l * 0.18), w * (0.5 + ((l * 37) % 30) / 100), Math.max(1, h * 0.05))
  } else {
    g.fillStyle = '#c9c4b8'
    g.fillRect(x, y, w, h)
    g.fillStyle = 'rgba(20,20,20,0.75)'
    g.fillRect(x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.14)
    g.fillStyle = 'rgba(40,40,40,0.4)'
    g.fillRect(x + w * 0.08, y + h * 0.3, w * 0.38, h * 0.6)
    g.fillRect(x + w * 0.54, y + h * 0.3, w * 0.38, h * 0.6)
  }
  g.globalAlpha = 1
}

/** Thousands of thumbnails streaming in and sorting into columns (t 0 → 1). */
export function drawSorting(g: Ctx, W: number, H: number, t: number, time: number, side: number) {
  g.fillStyle = '#050607'
  g.fillRect(0, 0, W, H)
  const cols = side === 0 ? 8 : 5
  const colW = W / cols
  const tw = side === 0 ? 22 : 26
  const th = tw * 0.72
  const header = 34
  mono(g, 13, 500)
  g.textBaseline = 'middle'
  for (let c = 0; c < cols; c++) {
    g.fillStyle = 'rgba(220,224,228,0.55)'
    g.fillText(CATS[(c + side * 3) % CATS.length], c * colW + 10, header / 2 + 4)
    g.fillStyle = 'rgba(220,224,228,0.12)'
    g.fillRect(c * colW + colW - 1, header, 1, H - header)
  }
  const perCol = Math.floor((colW - 12) / (tw + 3))
  const n = Math.floor(thumbs.length * (side === 0 ? 1 : 0.55))
  const filled = new Array(cols).fill(0)
  for (let i = 0; i < n; i++) {
    const th0 = thumbs[(i + side * 97) % thumbs.length]
    const c = th0.cat % cols
    const k = Math.min(1, Math.max(0, (t * 1.6 - th0.delay * 0.9) / 0.35))
    if (k <= 0) {
      // Still streaming: across the screen from the right.
      const sx = W * (1 - ((time * th0.speed * 0.22 + th0.x) % 1.2))
      if (t > 0.02) thumb(g, th0.kind, th0.tone, th0.warm, sx, header + th0.y * (H - header - th), tw * 0.8, th * 0.8, 0.5)
      continue
    }
    const slot = filled[c]++
    const tx = c * colW + 6 + (slot % perCol) * (tw + 3)
    const ty = header + 8 + Math.floor(slot / perCol) * (th + 3)
    if (ty > H - th) continue
    const fx = W * th0.x
    const fy = header + th0.y * (H - header)
    const e = k * k * (3 - 2 * k)
    thumb(g, th0.kind, th0.tone, th0.warm, fx + (tx - fx) * e, fy + (ty - fy) * e, tw, th, 0.6 + 0.4 * e)
  }
  // A thin progress line.
  g.fillStyle = 'rgba(230,232,235,0.6)'
  g.fillRect(0, H - 3, W * Math.min(1, t * 1.1), 3)
}

/** The right screen in `checked`: two lines, white on black, mono. */
export function drawDates(g: Ctx, W: number, H: number, today: string, record: string, a: number, b: number) {
  g.fillStyle = '#030303'
  g.fillRect(0, 0, W, H)
  g.textBaseline = 'middle'
  // Faint data around them.
  mono(g, 14, 400)
  g.fillStyle = 'rgba(200,204,208,0.18)'
  const rand = mulberry32(7)
  for (let r = 0; r < 22; r++) {
    let line = ''
    for (let c = 0; c < 46; c++) line += rand() < 0.15 ? ' ' : '0123456789ABCDEF·:'[Math.floor(rand() * 18)]
    g.fillText(line, 40, 30 + r * 22)
  }
  g.fillStyle = 'rgba(3,3,3,0.85)'
  g.fillRect(40, H * 0.3, W - 80, H * 0.4)
  mono(g, 44, 500)
  g.fillStyle = `rgba(240,242,244,${a})`
  g.fillText(today, 70, H * 0.42)
  g.fillStyle = `rgba(240,242,244,${b})`
  g.fillText(record, 70, H * 0.58)
}

/** OBSERVER DETECTED / SCROLL INPUT, small and centred. */
export function drawObserver(g: Ctx, W: number, H: number, a: number, b: number) {
  g.fillStyle = '#020202'
  g.fillRect(0, 0, W, H)
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  mono(g, 40, 500)
  g.letterSpacing = '6px'
  g.fillStyle = `rgba(238,240,242,${a})`
  g.fillText('OBSERVER DETECTED', W / 2, H * 0.44)
  mono(g, 28, 400)
  g.fillStyle = `rgba(238,240,242,${b * 0.85})`
  g.fillText('SCROLL INPUT', W / 2, H * 0.58)
  g.letterSpacing = '0px'
  g.textAlign = 'left'
}

/** One thin horizontal line of light (the cursor before the word). */
export function drawLine(g: Ctx, W: number, H: number, a: number) {
  g.fillStyle = '#000'
  g.fillRect(0, 0, W, H)
  g.fillStyle = `rgba(235,238,240,${a})`
  g.fillRect(W * 0.3, H / 2 - 1.5, W * 0.4, 3)
}

/** Black with a faint grey grid (booting), optionally a circle (the law). */
export function drawGrid(g: Ctx, W: number, H: number, a: number, circle: number) {
  g.fillStyle = '#020202'
  g.fillRect(0, 0, W, H)
  g.strokeStyle = `rgba(150,155,160,${0.22 * a})`
  g.lineWidth = 1
  const step = W / 24
  for (let x = 0; x <= W; x += step) {
    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x, H)
    g.stroke()
  }
  for (let y = 0; y <= H; y += step) {
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(W, y)
    g.stroke()
  }
  if (circle > 0) {
    g.strokeStyle = `rgba(225,228,230,${0.8 * circle})`
    g.lineWidth = 3
    g.beginPath()
    g.arc(W / 2, H / 2, H * 0.32, 0, Math.PI * 2)
    g.stroke()
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2
      g.fillStyle = `rgba(235,238,240,${0.9 * circle})`
      g.beginPath()
      g.arc(W / 2 + Math.cos(ang) * H * 0.32, H / 2 + Math.sin(ang) * H * 0.32, 5, 0, Math.PI * 2)
      g.fill()
    }
  }
}

/** A screen that flashes white (the records opening). */
export function drawFlash(g: Ctx, W: number, H: number, a: number) {
  g.fillStyle = `rgb(${Math.round(240 * a)},${Math.round(242 * a)},${Math.round(244 * a)})`
  g.fillRect(0, 0, W, H)
}

/** The player's frame around a record: a thin border, a play mark, the subject line. */
export function drawPlayer(g: Ctx, W: number, H: number, label: string, a: number) {
  g.clearRect(0, 0, W, H)
  g.strokeStyle = `rgba(230,232,235,${0.5 * a})`
  g.lineWidth = 2
  g.strokeRect(6, 6, W - 12, H - 12)
  mono(g, 18, 500)
  g.textBaseline = 'top'
  g.textAlign = 'right'
  g.fillStyle = `rgba(240,242,244,${a})`
  g.fillText(label, W - 24, 22)
  g.textAlign = 'left'
  g.fillStyle = `rgba(240,242,244,${0.8 * a})`
  g.beginPath()
  g.moveTo(24, 22)
  g.lineTo(24, 42)
  g.lineTo(40, 32)
  g.closePath()
  g.fill()
}

/** The touch glass: faint glyphs under it (static), drawn once. */
export function drawTouch(g: Ctx, W: number, H: number, level: number) {
  g.clearRect(0, 0, W, H)
  if (level <= 0) return
  const rand = mulberry32(3)
  g.strokeStyle = `rgba(150,170,180,${0.1 * level})`
  g.lineWidth = 1
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 118
    g.strokeRect(x, H - 120, 90, 60)
  }
  g.fillStyle = `rgba(170,190,200,${0.12 * level})`
  mono(g, 11, 400)
  for (let i = 0; i < 40; i++) g.fillText(['SYS', 'ARC', 'NET', 'REC', 'LOG', 'T+', '0x', '::'][Math.floor(rand() * 8)] + Math.floor(rand() * 999), 30 + rand() * (W - 100), 30 + rand() * (H - 170))
  g.strokeStyle = `rgba(150,170,180,${0.07 * level})`
  g.beginPath()
  g.arc(W / 2, H * 0.62, 36, 0, Math.PI * 2)
  g.stroke()
}

/** The small pale window under his cheek: "continue from the last record?" and glyphs scrolling. */
export function drawWindow(g: Ctx, W: number, H: number, scroll: number) {
  g.clearRect(0, 0, W, H)
  g.fillStyle = 'rgba(205,220,226,0.28)'
  g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(230,240,245,0.7)'
  g.lineWidth = 3
  g.strokeRect(2, 2, W - 4, H - 4)
  g.fillStyle = 'rgba(238,244,246,0.95)'
  sans(g, 24, 500)
  g.textBaseline = 'top'
  g.fillText('Son kayıttan devam edilsin mi?', 18, 16)
  mono(g, 15, 400)
  g.fillStyle = 'rgba(220,232,238,0.7)'
  const rand = mulberry32(Math.floor(scroll))
  for (let r = 0; r < 4; r++) {
    let line = ''
    for (let c = 0; c < 34; c++) line += '01·:ABCDEF '[Math.floor(rand() * 11)]
    g.fillText(line, 18, 62 + r * 20)
  }
  g.strokeStyle = 'rgba(238,244,246,0.8)'
  g.lineWidth = 2
  g.strokeRect(W - 150, H - 46, 60, 30)
  g.strokeRect(W - 80, H - 46, 60, 30)
}

/** The records' timecode (top-right of the frame): date and time. */
export function drawTimecode(g: Ctx, W: number, H: number, line1: string, line2: string) {
  g.clearRect(0, 0, W, H)
  g.textAlign = 'right'
  g.textBaseline = 'top'
  mono(g, 30, 500)
  g.fillStyle = 'rgba(0,0,0,0.35)'
  g.fillText(line1, W - 10, 12)
  g.fillStyle = 'rgba(244,244,242,0.92)'
  g.fillText(line1, W - 12, 10)
  if (line2) {
    mono(g, 26, 400)
    g.fillStyle = 'rgba(244,244,242,0.8)'
    g.fillText(line2, W - 12, 52)
  }
  // A small red-less record dot: white.
  g.fillStyle = 'rgba(244,244,242,0.85)'
  g.beginPath()
  g.arc(W - 12 - g.measureText(line1).width - 26, 28, 7, 0, Math.PI * 2)
  g.fill()
  g.textAlign = 'left'
}

/** A soft vignette (alpha), for the record frame. */
export function drawVignette(g: Ctx, W: number, H: number) {
  g.clearRect(0, 0, W, H)
  const grad = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.6)')
  g.fillStyle = grad
  g.fillRect(0, 0, W, H)
}
