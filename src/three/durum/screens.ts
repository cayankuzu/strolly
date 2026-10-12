/**
 * DURUM's interface, drawn on canvases: a research system's screens, not a
 * film's. Dense but legible, institutional, quiet: a header with the module
 * and the time, panels with thin rules, numbers in mono, one amber accent for
 * what needs attention, a green for what was verified, and a red that is used
 * once. DURUM has no voice: what it says is typed into a band at the bottom
 * of the wall display (and on the main monitor's prompt line).
 */
import { clamp, mulberry32, smoothstep } from '@/lib/math'
import { mono, sans } from '../screens'

export type Ctx = CanvasRenderingContext2D

export const BG = '#0a0c0e'
export const PANEL = '#11151a'
export const RULE = '#22303a'
export const INK = '#d9dde0'
export const MUTED = '#7d8a93'
export const FAINT = '#47535b'
export const AMBER = '#e2b062'
export const GREEN = '#78c49b'
export const RED = '#e05a47'

/** A line DURUM is typing: its paragraphs and how much of each is typed (0–1). */
export type Band = { lines: string[]; typed: number[] }

const caretOn = (t: number) => Math.floor(t * 1.8) % 2 === 0

/** The part of a line typed so far. */
export function typedText(text: string, f: number) {
  if (f >= 1) return text
  if (f <= 0) return ''
  return text.slice(0, Math.max(0, Math.round(text.length * f)))
}

export function wrap(c: Ctx, text: string, maxW: number) {
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

function fillBg(c: Ctx, W: number, H: number) {
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)
}

/** Header strip: DURUM, the module, the night's clock. Returns its height. */
export function header(c: Ctx, W: number, H: number, module: string, clock: string, scale = 1) {
  const hh = Math.round(H * 0.085 * scale)
  c.fillStyle = '#0e1216'
  c.fillRect(0, 0, W, hh)
  c.fillStyle = RULE
  c.fillRect(0, hh, W, 1)
  c.fillStyle = INK
  sans(c, Math.round(hh * 0.44), 300)
  c.letterSpacing = `${Math.round(hh * 0.14)}px`
  c.fillText('DURUM', Math.round(W * 0.025), Math.round(hh * 0.66))
  c.letterSpacing = '0px'
  c.fillStyle = MUTED
  mono(c, Math.round(hh * 0.34), 400)
  c.fillText(module, Math.round(W * 0.16), Math.round(hh * 0.64))
  c.textAlign = 'right'
  c.fillText(clock, W - Math.round(W * 0.025), Math.round(hh * 0.64))
  c.textAlign = 'left'
  return hh
}

function panel(c: Ctx, x: number, y: number, w: number, h: number, label?: string) {
  c.fillStyle = PANEL
  c.fillRect(x, y, w, h)
  c.strokeStyle = RULE
  c.lineWidth = 1
  c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  if (label) {
    c.fillStyle = MUTED
    mono(c, Math.max(10, Math.round(Math.min(h * 0.09, 18))), 500)
    c.fillText(label, x + 12, y + Math.max(18, Math.round(Math.min(h * 0.16, 28))))
  }
}

/**
 * The dialogue band: the bottom 22 % of a screen, INK on PANEL, the line being
 * typed with a block caret. Shrinks its type to fit long lines.
 */
export function band(c: Ctx, W: number, H: number, b: Band | null, t: number, frac = 0.22) {
  if (!b || !b.lines.length) return H
  const top = Math.round(H * (1 - frac))
  c.fillStyle = PANEL
  c.fillRect(0, top, W, H - top)
  c.fillStyle = RULE
  c.fillRect(0, top, W, 2)
  const pad = Math.round(W * 0.035)
  // The words sit in the right two-thirds: in a full-frame shot of the display the reader's rail
  // covers the left third, and the two must not lie on top of each other.
  const x0 = Math.round(W * 0.36)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.026), 500)
  c.fillText('DURUM  ›', pad, top + Math.round(pad * 0.45) + Math.round(H * 0.04))
  let size = Math.round(H * 0.05)
  let rows: Array<{ text: string; para: number; last: boolean }> = []
  for (let k = 0; k < 4; k++) {
    sans(c, size, 400)
    rows = []
    b.lines.forEach((l, i) => {
      const parts = wrap(c, l, W - x0 - pad)
      parts.forEach((p, j) => rows.push({ text: p, para: i, last: j === parts.length - 1 }))
    })
    if (rows.length * size * 1.28 <= H - top - pad * 0.6) break
    size = Math.round(size * 0.86)
  }
  // Type each paragraph by characters across its wrapped rows.
  let y = top + Math.round(pad * 0.45) + size
  let cursorX = -1
  let cursorY = 0
  b.lines.forEach((l, i) => {
    const want = Math.round(l.length * clamp(b.typed[i] ?? 0))
    let used = 0
    for (const r of rows.filter((row) => row.para === i)) {
      const n = Math.max(0, Math.min(r.text.length, want - used))
      used += r.text.length + 1
      if (n > 0) {
        c.fillStyle = INK
        sans(c, size, 400)
        c.fillText(r.text.slice(0, n), x0, y)
        if (n < r.text.length || (r.last && (b.typed[i] ?? 0) < 1) || i === b.lines.length - 1) {
          cursorX = x0 + c.measureText(r.text.slice(0, n)).width + 6
          cursorY = y
        }
      }
      y += Math.round(size * 1.28)
    }
  })
  if (cursorX > 0 && caretOn(t)) {
    c.fillStyle = INK
    c.fillRect(cursorX, cursorY - size * 0.78, size * 0.5, size * 0.9)
  }
  return top
}

// ——— The world model (the wall display at rest) ———

type Pt = { x: number; y: number; z: number; vx: number; vy: number; vz: number; amber: boolean; label: boolean }
let POINTS: Pt[] | null = null
function points() {
  if (POINTS) return POINTS
  const rand = mulberry32(71)
  const n = 760
  POINTS = []
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - y * y)
    const a = i * 2.39996
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    // A tangent velocity: mostly along latitude, with a bit of noise.
    const vx = -z + (rand() - 0.5) * 0.6
    const vz = x + (rand() - 0.5) * 0.6
    const vy = (rand() - 0.5) * 0.5
    POINTS.push({ x, y, z, vx, vy, vz, amber: rand() < 0.012, label: rand() < 0.01 })
  }
  return POINTS
}

/**
 * The model at rest: counters on the left, a slowly turning field of tracked
 * points with velocity ticks on the right. `fan` blooms faint forward
 * projections; `haze` turns every point into a soft probability; `flagged`
 * adds one point with no coordinates at the field's edge.
 */
export function drawModel(c: Ctx, W: number, H: number, s: { clock: string; t: number; fan?: number; haze?: number; flagged?: number; band?: Band | null; dim?: number }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KÜRESEL DURUM MODELİ · v7.4', s.clock)
  const bandTop = s.band ? Math.round(H * 0.78) : H
  const pad = Math.round(W * 0.022)
  const colW = Math.round(W * 0.25)
  const rows: Array<[string, string]> = [
    ['İZLENEN NESNE', '4,1182 × 10⁶⁸'],
    ['KAPSAM', '%99,9997'],
    ['DOĞRULUK', '%99,97'],
    ['GÜNCELLEME', `${(0.78 + 0.04 * Math.sin(s.t * 1.7)).toFixed(2)} ms`],
  ]
  const usable = bandTop - hh - pad * 2
  const rh = Math.round(usable / rows.length)
  let y = hh + pad
  for (const [k, v] of rows) {
    panel(c, pad, y, colW, rh - 6)
    c.fillStyle = MUTED
    mono(c, Math.round(Math.min(rh * 0.17, 17)), 500)
    c.fillText(k, pad + 12, y + Math.round(rh * 0.34))
    c.fillStyle = k === 'DOĞRULUK' ? GREEN : INK
    mono(c, Math.round(Math.min(rh * 0.3, 30)), 400)
    c.fillText(v, pad + 12, y + Math.round(rh * 0.74))
    y += rh
  }
  // The field.
  const fx = pad * 2 + colW
  const fy = hh + pad
  const fw = W - fx - pad
  const fh = bandTop - fy - pad
  panel(c, fx, fy, fw, fh, s.haze ? 'DURUM ALANI · OLASILIK' : 'DURUM ALANI · CANLI')
  const cx = fx + fw / 2
  const cy = fy + fh * 0.54
  const R = Math.min(fw, fh) * 0.43
  const rot = s.t * 0.06
  const ca = Math.cos(rot)
  const sa = Math.sin(rot)
  const tilt = 0.35
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const fan = s.fan ?? 0
  const haze = s.haze ?? 0
  const pts = points()
  c.save()
  c.beginPath()
  c.rect(fx + 1, fy + 1, fw - 2, fh - 2)
  c.clip()
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    // Rotate about y, then tilt about x.
    const x1 = p.x * ca + p.z * sa
    const z1 = -p.x * sa + p.z * ca
    const y1 = p.y * ct - z1 * st
    const z2 = p.y * st + z1 * ct
    const vx1 = p.vx * ca + p.vz * sa
    const vz1 = -p.vx * sa + p.vz * ca
    const vy1 = p.vy * ct - vz1 * st
    const px = cx + x1 * R
    const py = cy - y1 * R
    const front = z2 > 0
    const a = front ? 0.35 + 0.55 * z2 : 0.12
    if (haze > 0) {
      const r = 3 + haze * 11
      const g = c.createRadialGradient(px, py, 0, px, py, r)
      g.addColorStop(0, `rgba(217,221,224,${(a * (1 - haze * 0.55)).toFixed(3)})`)
      g.addColorStop(1, 'rgba(217,221,224,0)')
      c.fillStyle = g
      c.fillRect(px - r, py - r, r * 2, r * 2)
      if (haze >= 1) continue
    }
    const col = p.amber && front ? AMBER : `rgba(217,221,224,${a.toFixed(3)})`
    c.fillStyle = col
    c.fillRect(px - 1.2, py - 1.2, 2.6, 2.6)
    // Velocity tick.
    c.strokeStyle = col
    c.lineWidth = 1
    c.globalAlpha = 1 - haze
    c.beginPath()
    c.moveTo(px, py)
    c.lineTo(px + vx1 * 7, py - vy1 * 7)
    c.stroke()
    c.globalAlpha = 1
    // Forward projections: a faint fan from some of the front points.
    if (fan > 0 && front && i % 9 === 0) {
      c.strokeStyle = `rgba(226,176,98,${(0.22 * fan * z2).toFixed(3)})`
      for (let k = -2; k <= 2; k++) {
        const ang = Math.atan2(-vy1, vx1) + k * 0.16
        const len = 10 + fan * 46
        c.beginPath()
        c.moveTo(px, py)
        c.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len)
        c.stroke()
      }
    }
    if (p.label && front && haze < 0.5) {
      c.fillStyle = 'rgba(125,138,147,0.85)'
      mono(c, 11, 400)
      c.fillText(`x ${(p.x * 41.2).toFixed(1)} · v ${(Math.abs(p.vx) * 0.31).toFixed(2)}`, px + 6, py - 4)
    }
  }
  if (s.flagged) {
    // One point with no coordinates, blinking at the field's edge.
    const px = fx + fw - 26
    const py = fy + fh * 0.3
    if (caretOn(s.t * 1.4)) {
      c.fillStyle = AMBER
      c.beginPath()
      c.arc(px, py, 5, 0, Math.PI * 2)
      c.fill()
    }
    c.strokeStyle = AMBER
    c.lineWidth = 1.5
    c.strokeRect(px - 11, py - 11, 22, 22)
    c.fillStyle = AMBER
    mono(c, 22, 600)
    c.textAlign = 'right'
    c.fillText('?', px - 16, py + 8)
    c.textAlign = 'left'
  }
  c.restore()
  if (s.dim) {
    c.fillStyle = `rgba(0,0,0,${s.dim})`
    c.fillRect(0, 0, W, H)
  }
  band(c, W, H, s.band ?? null, s.t)
}

/** Black, with one or more lines at the centre (typed). The WD when Arif is far from it, or holding its breath. */
export function drawLone(c: Ctx, W: number, H: number, s: { lines: string[]; typed: number[]; t: number; size?: number; color?: string; sub?: string | null }) {
  fillBg(c, W, H)
  const size = Math.round(H * (s.size ?? 0.075))
  sans(c, size, 300)
  const pad = W * 0.1
  const rows: Array<{ text: string; para: number }> = []
  s.lines.forEach((l, i) => wrap(c, l, W - pad * 2).forEach((p) => rows.push({ text: p, para: i })))
  const lh = size * 1.35
  let y = H / 2 - ((rows.length - 1) * lh) / 2 + size * 0.35
  let cursor: [number, number] | null = null
  c.textAlign = 'center'
  const used = s.lines.map(() => 0)
  for (const r of rows) {
    const want = Math.round(s.lines[r.para].length * clamp(s.typed[r.para] ?? 1))
    const n = Math.max(0, Math.min(r.text.length, want - used[r.para]))
    used[r.para] += r.text.length + 1
    c.fillStyle = s.color ?? INK
    const shown = r.text.slice(0, n)
    c.fillText(shown, W / 2, y)
    if (n > 0) cursor = [W / 2 + c.measureText(r.text).width / 2 - c.measureText(r.text.slice(n)).width + 6, y]
    y += lh
  }
  c.textAlign = 'left'
  if (cursor && caretOn(s.t)) {
    c.fillStyle = s.color ?? INK
    c.fillRect(cursor[0], cursor[1] - size * 0.78, size * 0.45, size * 0.9)
  }
  if (s.sub) {
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.032), 500)
    c.textAlign = 'center'
    c.fillText(s.sub, W / 2, H * 0.86)
    c.textAlign = 'left'
  }
}

export function drawOff(c: Ctx, W: number, H: number) {
  c.fillStyle = '#020303'
  c.fillRect(0, 0, W, H)
}

// ——— İKİ KUTU ———

function boxIcon(c: Ctx, x: number, y: number, w: number, h: number, clear: boolean, label: string) {
  c.strokeStyle = clear ? INK : MUTED
  c.lineWidth = 3
  c.strokeRect(x, y, w, h)
  c.beginPath()
  c.moveTo(x, y)
  c.lineTo(x + w * 0.18, y - h * 0.18)
  c.lineTo(x + w * 1.18, y - h * 0.18)
  c.lineTo(x + w, y)
  c.moveTo(x + w * 1.18, y - h * 0.18)
  c.lineTo(x + w * 1.18, y + h * 0.82)
  c.lineTo(x + w, y + h)
  c.stroke()
  if (clear) {
    c.fillStyle = 'rgba(201,182,200,0.7)'
    for (let i = 0; i < 5; i++) c.fillRect(x + w * 0.2 + i * 6, y + h * 0.45 - i * 3, w * 0.5, h * 0.18)
  } else {
    c.fillStyle = '#2a3036'
    c.fillRect(x + 2, y + 2, w - 4, h - 4)
    c.fillStyle = 'rgba(224,90,71,0.85)'
    c.fillRect(x + w * 0.42, y - h * 0.14, w * 0.16, h * 0.5)
  }
  c.fillStyle = INK
  sans(c, Math.round(h * 0.38), 600)
  c.fillText(label, x + w * 0.42, y + h + h * 0.5)
}

function lock(c: Ctx, x: number, y: number, s: number) {
  c.strokeStyle = AMBER
  c.lineWidth = 3
  c.beginPath()
  c.arc(x + s / 2, y, s * 0.32, Math.PI, 0)
  c.stroke()
  c.fillStyle = AMBER
  c.fillRect(x, y, s, s * 0.75)
}

/** The rules of the two boxes, as a plain diagram. */
export function drawRules(c: Ctx, W: number, H: number, s: { clock: string; t: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'İKİ KUTU · KURULUM', s.clock)
  const bh = Math.round(H * 0.16)
  boxIcon(c, W * 0.08, hh + H * 0.12, bh * 1.3, bh, true, 'A')
  boxIcon(c, W * 0.3, hh + H * 0.12, bh * 1.3, bh, false, 'B')
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.03), 500)
  c.fillText('A · 1.000 TL · GÖRÜNÜR', W * 0.08, hh + H * 0.42)
  c.fillText('B · KAPALI', W * 0.3, hh + H * 0.42)
  const x = W * 0.52
  c.fillStyle = INK
  mono(c, Math.round(H * 0.04), 500)
  c.fillText('TAHMİN: YALNIZCA B', x, hh + H * 0.14)
  c.fillStyle = GREEN
  c.fillText('→ B = 1.000.000 TL', x + W * 0.02, hh + H * 0.2)
  c.fillStyle = INK
  c.fillText('TAHMİN: İKİSİ', x, hh + H * 0.3)
  c.fillStyle = MUTED
  c.fillText('→ B = 0', x + W * 0.02, hh + H * 0.36)
  lock(c, x, hh + H * 0.46, H * 0.04)
  c.fillStyle = AMBER
  mono(c, Math.round(H * 0.034), 600)
  c.fillText('DOLDURULDU · ÇARŞAMBA 23.58', x + H * 0.06, hh + H * 0.49)
  band(c, W, H, s.band, s.t)
}

/** The register of those who took only B: 31 short green rows. */
export function drawRegister(c: Ctx, W: number, H: number, s: { clock: string; t: number; rows: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KAYIT · İKİ KUTU', s.clock)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.045), 600)
  c.fillText('YALNIZCA B · 31 KİŞİ · 31 ZENGİN', W * 0.04, hh + H * 0.08)
  const rand = mulberry32(31)
  const cols = 3
  const rh = H * 0.042
  const n = Math.round(clamp(s.rows) * 31)
  for (let i = 0; i < n; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = W * 0.04 + col * W * 0.32
    const y = hh + H * 0.15 + row * rh
    c.fillStyle = 'rgba(120,196,155,0.14)'
    c.fillRect(x, y - rh * 0.72, W * 0.3, rh * 0.86)
    c.fillStyle = GREEN
    mono(c, Math.round(rh * 0.55), 500)
    c.fillText(`K-${String(100 + Math.floor(rand() * 900))} · B · +1.000.000`, x + 8, y)
  }
  band(c, W, H, s.band, s.t)
}

// ——— BELİRSİZLİK ———

/**
 * One particle. `spread` 0 is a single bright dot, 1 a cloud of paths;
 * `measured` collapses it into one amber point; `trade` alternates a sharp
 * position (velocity smeared) and a sharp velocity (position smeared);
 * `contour` draws the amber edge of what is not known.
 */
export function drawParticle(c: Ctx, W: number, H: number, s: { clock: string; t: number; spread: number; measured: number; trade: number; contour: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'OLASILIK · TEK PARÇACIK', s.clock)
  const bandTop = s.band ? H * 0.78 : H
  const cx = W * 0.5
  const cy = hh + (bandTop - hh) * 0.5
  const span = (bandTop - hh) * 0.42
  // Faint grid.
  c.strokeStyle = 'rgba(34,48,58,0.6)'
  c.lineWidth = 1
  for (let x = W * 0.06; x < W; x += W * 0.06) {
    c.beginPath()
    c.moveTo(x, hh)
    c.lineTo(x, bandTop)
    c.stroke()
  }
  for (let y = hh + 30; y < bandTop; y += W * 0.06) {
    c.beginPath()
    c.moveTo(0, y)
    c.lineTo(W, y)
    c.stroke()
  }
  if (s.trade >= 0) {
    // Two states alternate: which one is sharp.
    const phase = Math.floor(s.trade * 4.2) % 2
    if (phase === 0) {
      // Position exact; velocity a fan.
      c.strokeStyle = 'rgba(217,221,224,0.28)'
      for (let k = 0; k < 26; k++) {
        const a = -0.9 + (k / 25) * 1.8
        c.beginPath()
        c.moveTo(cx, cy)
        c.lineTo(cx + Math.cos(a) * span * 1.3, cy + Math.sin(a) * span * 1.3)
        c.stroke()
      }
      c.fillStyle = INK
      c.beginPath()
      c.arc(cx, cy, 7, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = MUTED
      mono(c, Math.round(H * 0.03), 500)
      c.fillText('KONUM: KESİN   ·   HIZ: ?', W * 0.05, hh + 40)
    } else {
      // Velocity exact; position a streak.
      const g = c.createLinearGradient(cx - span * 1.4, 0, cx + span * 1.4, 0)
      g.addColorStop(0, 'rgba(217,221,224,0)')
      g.addColorStop(0.5, 'rgba(217,221,224,0.55)')
      g.addColorStop(1, 'rgba(217,221,224,0)')
      c.fillStyle = g
      c.fillRect(cx - span * 1.4, cy - 9, span * 2.8, 18)
      c.strokeStyle = INK
      c.lineWidth = 3
      c.beginPath()
      c.moveTo(cx - 40, cy - 46)
      c.lineTo(cx + 60, cy - 46)
      c.lineTo(cx + 48, cy - 56)
      c.moveTo(cx + 60, cy - 46)
      c.lineTo(cx + 48, cy - 36)
      c.stroke()
      c.fillStyle = MUTED
      mono(c, Math.round(H * 0.03), 500)
      c.fillText('KONUM: ?   ·   HIZ: KESİN', W * 0.05, hh + 40)
    }
    if (s.contour > 0) {
      // The exact edge of what is not known: an amber outline drawing itself.
      c.strokeStyle = AMBER
      c.lineWidth = 2.5
      c.beginPath()
      const n = 80
      const end = Math.round(n * clamp(s.contour))
      for (let i = 0; i <= end; i++) {
        const a = (i / n) * Math.PI * 2
        const rx = span * 1.42
        const ry = span * 0.42
        const x = cx + Math.cos(a) * rx
        const y = cy + Math.sin(a) * ry * (1 + 0.08 * Math.sin(3 * a))
        if (i === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.stroke()
      if (s.contour > 0.95) {
        c.beginPath()
        c.moveTo(cx + span * 1.42, cy - 18)
        c.lineTo(cx + span * 1.42, cy + 18)
        c.stroke()
        c.fillStyle = AMBER
        mono(c, Math.round(H * 0.03), 600)
        c.fillText('Δx · Δp ≥ ħ/2', cx + span * 1.42 + 12, cy - 22)
      }
    }
    band(c, W, H, s.band, s.t)
    return
  }
  const rand = mulberry32(17)
  const paths = Math.round(4 + s.spread * 220)
  const m = clamp(s.measured)
  for (let k = 0; k < paths; k++) {
    const a = rand() * Math.PI * 2
    const r = Math.pow(rand(), 0.6) * span * 1.25 * s.spread
    const bend = (rand() - 0.5) * 1.4
    const alpha = 0.16 * (1 - m)
    if (alpha < 0.01) break
    c.strokeStyle = `rgba(217,221,224,${alpha.toFixed(3)})`
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(cx, cy)
    for (let i = 1; i <= 12; i++) {
      const u = i / 12
      const aa = a + bend * u
      c.lineTo(cx + Math.cos(aa) * r * u, cy + Math.sin(aa) * r * u * 0.75)
    }
    c.stroke()
  }
  if (s.spread > 0.05 && m < 0.5) {
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, span * 1.2 * s.spread)
    g.addColorStop(0, `rgba(200,220,255,${(0.25 * (1 - m)).toFixed(3)})`)
    g.addColorStop(1, 'rgba(200,220,255,0)')
    c.fillStyle = g
    c.fillRect(0, hh, W, bandTop - hh)
  }
  if (m > 0) {
    // The measured point: amber, off-centre where the finger was.
    const px = cx + span * 0.35 * m
    const py = cy - span * 0.1 * m
    c.fillStyle = AMBER
    c.beginPath()
    c.arc(px, py, 7 + 3 * m, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = `rgba(226,176,98,${(0.6 * m).toFixed(2)})`
    c.lineWidth = 2
    c.beginPath()
    c.arc(px, py, 22, 0, Math.PI * 2)
    c.stroke()
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.034), 600)
    c.fillText('ÖLÇÜLDÜ · tek sonuç', W * 0.05, hh + 40)
  } else {
    c.fillStyle = INK
    c.beginPath()
    c.arc(cx, cy, s.spread < 0.05 ? 7 : 4, 0, Math.PI * 2)
    c.fill()
    if (s.spread < 0.05) {
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, 40)
      g.addColorStop(0, 'rgba(217,221,224,0.35)')
      g.addColorStop(1, 'rgba(217,221,224,0)')
      c.fillStyle = g
      c.fillRect(cx - 40, cy - 40, 80, 80)
    }
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.03), 500)
    c.fillText(s.spread > 0.05 ? `OLASI YOL · ${paths}` : 'ELEKTRON · 1', W * 0.05, hh + 40)
  }
  band(c, W, H, s.band, s.t)
}

/** One atom, an hour, fifty per cent; then two half-frames, both true. */
export function drawAtom(c: Ctx, W: number, H: number, s: { clock: string; t: number; split: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'BOZUNMA · TEK ATOM', s.clock)
  const bandTop = s.band ? H * 0.78 : H
  const atom = (x: number, y: number, r: number, decayed: boolean, label: string | null) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r * 3)
    g.addColorStop(0, 'rgba(200,220,255,0.35)')
    g.addColorStop(1, 'rgba(200,220,255,0)')
    c.fillStyle = g
    c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6)
    c.fillStyle = decayed ? '#b7c0c6' : '#eef2f4'
    c.beginPath()
    c.arc(x, y, r * (decayed ? 0.8 : 1), 0, Math.PI * 2)
    c.fill()
    if (decayed) {
      // A small flash and a track.
      c.strokeStyle = AMBER
      c.lineWidth = 2.5
      c.beginPath()
      c.moveTo(x + r, y - r * 0.4)
      for (let i = 1; i <= 10; i++) c.lineTo(x + r + i * r * 0.55, y - r * 0.4 - i * r * 0.32 + Math.sin(i * 1.7) * 3)
      c.stroke()
      c.fillStyle = 'rgba(226,176,98,0.5)'
      c.beginPath()
      c.arc(x + r * 0.9, y - r * 0.4, r * 0.5, 0, Math.PI * 2)
      c.fill()
    }
    if (label) {
      c.fillStyle = MUTED
      mono(c, Math.round(H * 0.032), 600)
      c.textAlign = 'center'
      c.fillText(label, x, bandTop - 24)
      c.textAlign = 'left'
    }
  }
  const sp = smoothstep(0, 1, clamp(s.split))
  if (sp <= 0) {
    atom(W * 0.5, hh + (bandTop - hh) * 0.48, 26, false, null)
    // Clock overlay and readout.
    c.strokeStyle = MUTED
    c.lineWidth = 2
    const ox = W * 0.82
    const oy = hh + (bandTop - hh) * 0.3
    c.beginPath()
    c.arc(ox, oy, 34, 0, Math.PI * 2)
    c.stroke()
    c.beginPath()
    c.moveTo(ox, oy)
    c.lineTo(ox + Math.sin(s.t * 0.5) * 26, oy - Math.cos(s.t * 0.5) * 26)
    c.stroke()
    c.fillStyle = INK
    mono(c, Math.round(H * 0.034), 600)
    c.textAlign = 'center'
    c.fillText('1 SAAT', ox, oy + 62)
    c.textAlign = 'left'
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.06), 400)
    c.fillText('BOZUNMA · %50', W * 0.05, hh + H * 0.12)
  } else {
    const mid = W / 2
    c.fillStyle = RULE
    c.fillRect(mid - 1, hh, 2, bandTop - hh)
    c.globalAlpha = sp
    atom(W * 0.25, hh + (bandTop - hh) * 0.48, 24, false, '1 SAAT SONRA')
    atom(W * 0.75, hh + (bandTop - hh) * 0.48, 24, true, '1 SAAT SONRA')
    c.globalAlpha = 1
  }
  band(c, W, H, s.band, s.t)
}

// ——— KELEBEK ———

/** Where the pin sits on the Marmara map (canvas fractions), so the camera can push into it. */
export const PIN = { u: 0.47, v: 0.36 }

const MARMARA_LAND: Array<[number, number]> = [
  [0.0, 0.42],
  [0.12, 0.4],
  [0.24, 0.43],
  [0.34, 0.4],
  [0.42, 0.37],
  [0.46, 0.33],
  [0.49, 0.36],
  [0.5, 0.45],
  [0.53, 0.5],
  [0.55, 0.44],
  [0.6, 0.38],
  [0.72, 0.36],
  [0.84, 0.33],
  [1.0, 0.32],
  [1.0, 1.0],
  [0.0, 1.0],
]

/** The Marmara coast with a pin in Belgrad Ormanı. */
export function drawMarmara(c: Ctx, W: number, H: number, s: { clock: string; t: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'BAĞIMLILIK · 15 AĞUSTOS · +1 YIL', s.clock)
  // Sea everywhere; land below the north coast and around the inner sea.
  c.fillStyle = '#0c1218'
  c.fillRect(0, hh, W, H - hh)
  c.fillStyle = '#151c22'
  c.beginPath()
  MARMARA_LAND.forEach(([u, v], i) => {
    const x = u * W
    const y = hh + v * (H - hh)
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  })
  c.closePath()
  c.fill()
  // The inner sea (Marmara) as a dark lake in the land.
  c.fillStyle = '#0c1218'
  c.beginPath()
  c.ellipse(W * 0.42, hh + (H - hh) * 0.78, W * 0.3, (H - hh) * 0.13, -0.05, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = 'rgba(125,138,147,0.6)'
  c.lineWidth = 1.5
  c.beginPath()
  MARMARA_LAND.slice(0, 14).forEach(([u, v], i) => {
    const x = u * W
    const y = hh + v * (H - hh)
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  })
  c.stroke()
  c.beginPath()
  c.ellipse(W * 0.42, hh + (H - hh) * 0.78, W * 0.3, (H - hh) * 0.13, -0.05, 0, Math.PI * 2)
  c.stroke()
  // The strait.
  c.strokeStyle = '#0c1218'
  c.lineWidth = 7
  c.beginPath()
  c.moveTo(W * 0.5, hh + (H - hh) * 0.45)
  c.bezierCurveTo(W * 0.51, hh + (H - hh) * 0.55, W * 0.49, hh + (H - hh) * 0.6, W * 0.5, hh + (H - hh) * 0.68)
  c.stroke()
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.026), 500)
  c.fillText('KARADENİZ', W * 0.62, hh + (H - hh) * 0.18)
  c.fillText('MARMARA', W * 0.34, hh + (H - hh) * 0.8)
  c.fillText('İSTANBUL', W * 0.53, hh + (H - hh) * 0.58)
  // Forest: a soft green patch, and the pin.
  const px = PIN.u * W
  const py = PIN.v * H
  const g = c.createRadialGradient(px, py, 0, px, py, W * 0.05)
  g.addColorStop(0, 'rgba(46,74,50,0.9)')
  g.addColorStop(1, 'rgba(46,74,50,0)')
  c.fillStyle = g
  c.beginPath()
  c.arc(px, py, W * 0.05, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = AMBER
  c.beginPath()
  c.arc(px, py, 6, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = AMBER
  c.lineWidth = 2
  c.beginPath()
  c.arc(px, py, 14 + 4 * Math.sin(s.t * 3), 0, Math.PI * 2)
  c.stroke()
  c.fillStyle = AMBER
  mono(c, Math.round(H * 0.028), 600)
  c.fillText('BELGRAD ORMANI · 00.24 · 1 KELEBEK', px + 22, py - 10)
  band(c, W, H, s.band, s.t)
}

/** Two simulations in one plot: they run as one, then part. `cursor` 0–1 is day 0 → 14. */
export function drawTwoSims(c: Ctx, W: number, H: number, s: { clock: string; t: number; cursor: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'İKİ DÜNYA · FARK 10⁻⁹', s.clock)
  const bandTop = s.band ? H * 0.78 : H
  const x0 = W * 0.07
  const x1 = W * 0.95
  const yMid = hh + (bandTop - hh) * 0.5
  const amp = (bandTop - hh) * 0.36
  c.strokeStyle = RULE
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(x0, bandTop - 34)
  c.lineTo(x1, bandTop - 34)
  c.stroke()
  mono(c, Math.round(H * 0.026), 500)
  for (let d = 0; d <= 14; d++) {
    const x = x0 + (d / 14) * (x1 - x0)
    c.fillStyle = FAINT
    c.fillRect(x, bandTop - 38, 1, 8)
    if (d === 0 || d === 3 || d === 7 || d === 14) {
      c.fillStyle = MUTED
      c.fillText(`GÜN ${d}`, x - 18, bandTop - 12)
    }
  }
  const cur = clamp(s.cursor)
  const xc = x0 + cur * (x1 - x0)
  const bundle = (seed: number, amber: boolean) => {
    for (let k = 0; k < 9; k++) {
      c.strokeStyle = amber ? `rgba(226,176,98,${0.35 + 0.05 * k})` : `rgba(217,221,224,${0.25 + 0.05 * k})`
      c.lineWidth = amber ? 1.6 : 1.4
      c.beginPath()
      for (let i = 0; i <= 200; i++) {
        const u = i / 200
        if (u > cur) break
        const day = u * 14
        const base = Math.sin(day * 0.9 + k * 0.08) * 0.35 + Math.sin(day * 2.3) * 0.15
        // The amber world departs after the third afternoon, exponentially.
        const dev = amber ? Math.min(1.4, 0.0008 * Math.exp(Math.max(0, day - 3.2) * 1.05)) * Math.sin(day * 3.7 + seed + k * 0.7) : 0
        const y = yMid - (base + dev + (amber ? 0 : 0)) * amp * 0.9
        const x = x0 + u * (x1 - x0)
        if (i === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.stroke()
    }
  }
  bundle(1.3, true)
  bundle(0, false)
  c.fillStyle = 'rgba(217,221,224,0.5)'
  c.fillRect(xc, hh + 12, 1.5, bandTop - hh - 48)
  mono(c, Math.round(H * 0.03), 600)
  c.fillStyle = INK
  c.fillText('— BU GECE', W * 0.07, hh + H * 0.07)
  c.fillStyle = AMBER
  c.fillText('— MİLYARDA BİR FARKLI', W * 0.3, hh + H * 0.07)
  band(c, W, H, s.band, s.t)
}

/** Ankara's streets, faint, for the counterfactual's starting conditions (drawn once). */
let ANKARA: HTMLCanvasElement | null = null
function ankaraStreets(W: number, H: number) {
  if (ANKARA && ANKARA.width === W && ANKARA.height === H) return ANKARA
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')!
  const rand = mulberry32(406)
  const cx = W * 0.5
  const cy = H * 0.55
  c.strokeStyle = 'rgba(217,221,224,0.16)'
  c.lineWidth = 1
  // Blocks: jittered grids in patches.
  for (let p = 0; p < 26; p++) {
    const px = cx + (rand() - 0.5) * W * 0.9
    const py = cy + (rand() - 0.5) * H * 0.8
    const ang = rand() * Math.PI
    const n = 4 + Math.floor(rand() * 5)
    const step = 10 + rand() * 10
    c.save()
    c.translate(px, py)
    c.rotate(ang)
    for (let i = -n; i <= n; i++) {
      c.beginPath()
      c.moveTo(i * step, -n * step)
      c.lineTo(i * step, n * step)
      c.moveTo(-n * step, i * step)
      c.lineTo(n * step, i * step)
      c.stroke()
    }
    c.restore()
  }
  // Avenues: radial lines and a ring road.
  c.strokeStyle = 'rgba(217,221,224,0.34)'
  c.lineWidth = 2.2
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.3
    c.beginPath()
    c.moveTo(cx, cy)
    for (let i = 1; i <= 8; i++) c.lineTo(cx + Math.cos(a + Math.sin(i) * 0.08) * i * W * 0.06, cy + Math.sin(a + Math.sin(i) * 0.08) * i * H * 0.08)
    c.stroke()
  }
  c.beginPath()
  c.ellipse(cx, cy, W * 0.36, H * 0.38, 0.2, 0, Math.PI * 2)
  c.stroke()
  ANKARA = cv
  return cv
}

/** Kızılay on the map (fractions), and the 413's route. */
const KIZILAY = { u: 0.5, v: 0.55 }

/** Day 0: the street map, the cursor, and the one thing changed. */
export function drawAnkara(c: Ctx, W: number, H: number, s: { clock: string; t: number; marker: 'air' | 'bus' | null; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KARŞI-OLGU · GÜN 0', s.clock)
  c.drawImage(ankaraStreets(W, H), 0, 0)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.04), 600)
  c.fillText('BAŞLANGIÇ KOŞULU · DEĞİŞTİR', W * 0.05, hh + H * 0.08)
  if (!s.marker && caretOn(s.t)) c.fillRect(W * 0.05 + c.measureText('BAŞLANGIÇ KOŞULU · DEĞİŞTİR').width + 8, hh + H * 0.08 - H * 0.035, H * 0.02, H * 0.04)
  const kx = KIZILAY.u * W
  const ky = KIZILAY.v * H
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.026), 500)
  c.fillText('KIZILAY', kx + 10, ky + 24)
  if (s.marker === 'air') {
    c.strokeStyle = AMBER
    c.lineWidth = 2.5
    c.beginPath()
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6
      const x = kx + Math.cos(a) * 16
      const y = ky - 30 + Math.sin(a) * 16
      if (i === 0) c.moveTo(x, y)
      else c.lineTo(x, y)
    }
    c.stroke()
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.034), 600)
    c.fillText('+0,001 °C', kx + 24, ky - 24)
  } else if (s.marker === 'bus') {
    c.strokeStyle = AMBER
    c.lineWidth = 3
    c.beginPath()
    c.moveTo(W * 0.18, H * 0.82)
    c.bezierCurveTo(W * 0.3, H * 0.7, W * 0.4, H * 0.62, kx, ky)
    c.bezierCurveTo(W * 0.62, H * 0.48, W * 0.72, H * 0.4, W * 0.86, H * 0.3)
    c.stroke()
    c.fillStyle = AMBER
    c.fillRect(W * 0.3 - 14, H * 0.69 - 8, 28, 16)
    mono(c, Math.round(H * 0.034), 600)
    c.fillText('413 · +40 sn', W * 0.3 + 22, H * 0.69 + 6)
  }
  band(c, W, H, s.band, s.t)
}

/** A small person as DURUM draws one: a dot with a tick. */
function person(c: Ctx, x: number, y: number, col: string, r = 6) {
  c.fillStyle = col
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fill()
  c.fillRect(x - 1, y + r, 2, r * 1.3)
}

function bus(c: Ctx, x: number, y: number, col: string, label: string) {
  c.strokeStyle = col
  c.lineWidth = 2.5
  c.strokeRect(x - 40, y - 14, 80, 28)
  c.fillStyle = col
  for (let i = 0; i < 4; i++) c.fillRect(x - 32 + i * 18, y - 8, 12, 9)
  mono(c, 14, 600)
  c.fillText(label, x - 30, y + 30)
}

function phoneOnTable(c: Ctx, cx: number, cy: number, s: number, ring: number, t: number) {
  // The same three-quarter view as the desk insert: a table edge, a phone lying on it.
  c.fillStyle = '#14181c'
  c.beginPath()
  c.moveTo(cx - s * 2.4, cy + s * 0.9)
  c.lineTo(cx + s * 2.6, cy + s * 0.5)
  c.lineTo(cx + s * 1.6, cy - s * 1.2)
  c.lineTo(cx - s * 2.0, cy - s * 0.9)
  c.closePath()
  c.fill()
  c.save()
  c.translate(cx, cy)
  c.rotate(-0.42)
  c.transform(1, 0, -0.35, 0.62, 0, 0)
  c.fillStyle = '#0b0c0d'
  c.fillRect(-s * 0.4, -s * 0.85, s * 0.8, s * 1.7)
  if (ring > 0) {
    c.fillStyle = `rgba(200,220,255,${(0.35 + 0.55 * ring).toFixed(2)})`
    c.fillRect(-s * 0.34, -s * 0.78, s * 0.68, s * 1.56)
  }
  c.restore()
  if (ring > 0) {
    c.strokeStyle = AMBER
    c.lineWidth = 2
    const k = (t * 1.6) % 1
    for (let i = 0; i < 3; i++) {
      const r = s * (0.9 + ((i / 3 + k) % 1) * 1.1)
      c.globalAlpha = 1 - ((i / 3 + k) % 1)
      c.beginPath()
      c.arc(cx, cy, r, -Math.PI * 0.85, -Math.PI * 0.15)
      c.stroke()
    }
    c.globalAlpha = 1
  }
}

/**
 * The counterfactual as a run of simple panels (DURUM's style: dark ground,
 * INK lines, AMBER for what changed). `u` is the segment's progress.
 */
export function drawChain(c: Ctx, W: number, H: number, s: { clock: string; t: number; way: 'air' | 'bus'; u: number }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, `KARŞI-OLGU · ${s.way === 'air' ? 'HAVA PARSELİ +0,001 °C' : '413 · +40 sn'}`, s.clock)
  const u = s.u
  type P = { a: number; b: number; draw: (k: number) => void }
  const area = { x: 0, y: hh, w: W, h: H - hh }
  const title = (t: string, col = INK) => {
    c.fillStyle = col
    mono(c, Math.round(H * 0.036), 600)
    c.fillText(t, W * 0.05, hh + H * 0.08)
  }
  const panels: P[] = []
  if (s.way === 'air') {
    panels.push({
      a: 0,
      b: 0.27,
      draw: (k) => {
        title('GÜN 3 · 15.40')
        c.drawImage(ankaraStreets(W, H), -W * 0.1, -H * 0.2, W * 0.8, H * 0.8)
        c.fillStyle = MUTED
        mono(c, Math.round(H * 0.026), 500)
        c.fillText('ANKARA', W * 0.28, H * 0.4)
        // Gölbaşı lake to the south and the storm cell blooming.
        c.strokeStyle = 'rgba(125,138,147,0.6)'
        c.beginPath()
        c.ellipse(W * 0.48, H * 0.78, W * 0.07, H * 0.04, 0.3, 0, Math.PI * 2)
        c.stroke()
        c.fillText('GÖLBAŞI', W * 0.56, H * 0.8)
        const r = 20 + 90 * k
        const g = c.createRadialGradient(W * 0.62, H * 0.66, 0, W * 0.62, H * 0.66, r)
        g.addColorStop(0, 'rgba(226,176,98,0.75)')
        g.addColorStop(0.6, 'rgba(226,176,98,0.25)')
        g.addColorStop(1, 'rgba(226,176,98,0)')
        c.fillStyle = g
        c.beginPath()
        c.arc(W * 0.62, H * 0.66, r, 0, Math.PI * 2)
        c.fill()
        c.strokeStyle = AMBER
        c.lineWidth = 1.5
        c.beginPath()
        for (let i = 0; i < 60; i++) {
          const a = i * 0.35 + s.t * 0.6
          const rr = (i / 60) * r
          c.lineTo(W * 0.62 + Math.cos(a) * rr, H * 0.66 + Math.sin(a) * rr * 0.7)
        }
        c.stroke()
        // Scale bar.
        c.fillStyle = INK
        c.fillRect(W * 0.78, H * 0.9, W * 0.12, 3)
        mono(c, Math.round(H * 0.026), 500)
        c.fillText('20 KM', W * 0.8, H * 0.88)
      },
    })
    panels.push({
      a: 0.27,
      b: 0.5,
      draw: (k) => {
        title('GÜN 3 · 16.05 · YILDIRIM')
        // The transformer.
        const tx = W * 0.6
        const ty = H * 0.72
        c.strokeStyle = INK
        c.lineWidth = 3
        c.strokeRect(tx - 50, ty - 40, 100, 80)
        for (let i = 0; i < 3; i++) {
          c.beginPath()
          c.moveTo(tx - 30 + i * 30, ty - 40)
          c.lineTo(tx - 30 + i * 30, ty - 70)
          c.stroke()
        }
        c.fillStyle = INK
        mono(c, Math.round(H * 0.03), 600)
        c.fillText('GÖLBAŞI TRAFO', tx - 70, ty + 70)
        const hit = k > 0.12
        if (hit) {
          c.strokeStyle = AMBER
          c.lineWidth = 4
          c.beginPath()
          c.moveTo(tx - 40, hh + 20)
          c.lineTo(tx + 10, H * 0.35)
          c.lineTo(tx - 20, H * 0.42)
          c.lineTo(tx + 6, ty - 72)
          c.stroke()
          if (k < 0.4) {
            c.fillStyle = `rgba(226,176,98,${(0.4 * (1 - k / 0.4)).toFixed(2)})`
            c.fillRect(0, hh, W, H - hh)
          }
        }
      },
    })
  } else {
    panels.push({
      a: 0,
      b: 0.2,
      draw: (k) => {
        title('GÜN 3 · 17.12 · DURAK')
        c.strokeStyle = RULE
        c.lineWidth = 2
        c.beginPath()
        c.moveTo(0, H * 0.62)
        c.lineTo(W, H * 0.62)
        c.stroke()
        bus(c, W * 0.25, H * 0.55, AMBER, '413 · +40 sn')
        // The connecting bus pulls away; the man runs.
        const away = smoothstep(0.35, 1, k)
        bus(c, W * (0.68 + away * 0.3), H * 0.55, MUTED, 'AKTARMA')
        person(c, W * (0.32 + 0.22 * smoothstep(0, 0.7, k)), H * 0.7, INK)
        if (k > 0.6) {
          c.fillStyle = MUTED
          mono(c, Math.round(H * 0.03), 600)
          c.fillText('KAÇIRDI', W * 0.5, H * 0.82)
        }
      },
    })
    panels.push({
      a: 0.2,
      b: 0.36,
      draw: (k) => {
        title('SONRAKİ OTOBÜS · KOLTUK 14')
        // Seat map.
        for (let r = 0; r < 4; r++)
          for (let col = 0; col < 8; col++) {
            const x = W * 0.2 + col * W * 0.075 + (r > 1 ? 0 : 0)
            const y = H * 0.36 + r * H * 0.12 + (r > 1 ? H * 0.06 : 0)
            c.strokeStyle = FAINT
            c.strokeRect(x, y, W * 0.05, H * 0.08)
          }
        const sx = W * 0.2 + 4 * W * 0.075
        const sy = H * 0.36 + 1 * H * 0.12
        person(c, sx + W * 0.025, sy + H * 0.03, INK, 7)
        person(c, sx + W * 0.1, sy + H * 0.03, AMBER, 7)
        if (k > 0.3) {
          c.fillStyle = INK
          mono(c, 26, 700)
          c.fillText('" "', sx + W * 0.03, sy - H * 0.02)
          c.fillStyle = AMBER
          c.fillText('" "', sx + W * 0.11, sy - H * 0.04)
        }
      },
    })
    panels.push({
      a: 0.36,
      b: 0.5,
      draw: (k) => {
        title('TRAFO MERKEZİ · NÖBET')
        c.strokeStyle = INK
        c.lineWidth = 3
        c.strokeRect(W * 0.58, H * 0.42, W * 0.24, H * 0.3)
        c.fillStyle = INK
        mono(c, Math.round(H * 0.03), 600)
        c.fillText('TRAFO MERKEZİ · NÖBET', W * 0.55, H * 0.8)
        person(c, W * (0.2 + 0.42 * smoothstep(0, 0.65, k)), H * 0.62, AMBER, 7)
        if (k > 0.6) {
          c.strokeStyle = AMBER
          c.beginPath()
          c.arc(W * 0.86, H * 0.32, 30, 0, Math.PI * 2)
          c.stroke()
          c.beginPath()
          c.moveTo(W * 0.86, H * 0.32)
          c.lineTo(W * 0.86, H * 0.32 - 22)
          c.moveTo(W * 0.86, H * 0.32)
          c.lineTo(W * 0.86 + 16, H * 0.32)
          c.stroke()
          c.fillStyle = AMBER
          c.fillText('+30 DK', W * 0.82, H * 0.32 + 58)
        }
      },
    })
  }
  panels.push({
    a: 0.5,
    b: 0.72,
    draw: (k) => {
      title('GÜN 3 · AKŞAM · ŞEBEKE')
      // A district of window dots: the city lights up, one neighbourhood stays dark.
      const rand = mulberry32(88)
      for (let i = 0; i < 900; i++) {
        const x = W * 0.05 + rand() * W * 0.9
        const y = hh + H * 0.13 + rand() * H * 0.7
        const inDark = (x - W * 0.62) ** 2 / (W * 0.16) ** 2 + (y - H * 0.58) ** 2 / (H * 0.2) ** 2 < 1
        const on = rand() < smoothstep(0, 0.6, k) * 0.9
        c.fillStyle = inDark ? 'rgba(71,83,91,0.35)' : on ? 'rgba(255,214,150,0.85)' : 'rgba(71,83,91,0.35)'
        c.fillRect(x, y, 3, 3)
      }
      c.strokeStyle = AMBER
      c.setLineDash([6, 6])
      c.beginPath()
      c.ellipse(W * 0.62, H * 0.58, W * 0.16, H * 0.2, 0, 0, Math.PI * 2)
      c.stroke()
      c.setLineDash([])
      if (k > 0.2) {
        c.fillStyle = AMBER
        mono(c, Math.round(H * 0.04), 600)
        c.fillText('+40 DK', W * 0.74, H * 0.34)
      }
    },
  })
  panels.push({
    a: 0.72,
    b: 1.01,
    draw: (k) => {
      title('KARANLIK BİR PENCERE')
      const ring = k > 0.08 && k < 0.82 ? 1 : 0
      phoneOnTable(c, W * 0.58, H * 0.6, H * 0.14, ring, s.t)
      if (k > 0.82) {
        c.fillStyle = AMBER
        mono(c, Math.round(H * 0.045), 700)
        c.fillText('CEVAPSIZ', W * 0.66, H * 0.36)
      }
    },
  })
  // The canvas pans from panel to panel: each one slides in from the right.
  const slide = 0.035
  c.save()
  c.beginPath()
  c.rect(area.x, area.y, area.w, area.h)
  c.clip()
  for (const pnl of panels) {
    if (u < pnl.a - slide || u > pnl.b) continue
    const enter = smoothstep(pnl.a - slide, pnl.a + slide, u)
    const leave = smoothstep(pnl.b - slide, pnl.b + slide, u)
    const off = (1 - enter) * W - leave * W
    if (Math.abs(off) >= W) continue
    c.save()
    c.translate(off, 0)
    c.fillStyle = BG
    c.fillRect(0, hh, W, H - hh)
    pnl.draw(clamp((u - pnl.a) / (pnl.b - pnl.a)))
    c.restore()
  }
  c.restore()
}

/** Two Ankaras side by side: tonight, every district lit; the other, one dark. */
export function drawTwoMaps(c: Ctx, W: number, H: number, s: { clock: string; t: number; band: Band | null; fade: number }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KARŞILAŞTIRMA', s.clock)
  const bandTop = s.band ? H * 0.78 : H
  c.globalAlpha = 1 - clamp(s.fade)
  for (const [k, label] of [
    [0, 'BU GECE'],
    [1, 'KARŞI-OLGU'],
  ] as const) {
    const x0 = W * (0.04 + k * 0.49)
    const w = W * 0.43
    panel(c, x0, hh + 14, w, bandTop - hh - 28, label)
    const rand = mulberry32(55)
    for (let i = 0; i < 520; i++) {
      const x = x0 + 12 + rand() * (w - 24)
      const y = hh + 50 + rand() * (bandTop - hh - 90)
      const dark = k === 1 && (x - (x0 + w * 0.62)) ** 2 / (w * 0.18) ** 2 + (y - (hh + (bandTop - hh) * 0.55)) ** 2 / ((bandTop - hh) * 0.2) ** 2 < 1
      c.fillStyle = dark ? 'rgba(71,83,91,0.4)' : 'rgba(255,214,150,0.8)'
      c.fillRect(x, y, 2.5, 2.5)
    }
  }
  c.globalAlpha = 1
  band(c, W, H, s.band, s.t, s.fade > 0.5 ? 0.3 : 0.22)
}

// ——— BÜYÜK SORU ———

/** HESAPLANIYOR, a bar that never visibly moves; the line deletes itself; the answer is ready, the question missing. */
export function drawCalc(c: Ctx, W: number, H: number, s: { clock: string; t: number; erase: number; ready: number; missing: number }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KURUL · MÜHÜRLÜ SORGU', s.clock)
  const pad = W * 0.07
  if (s.ready <= 0) {
    const line = 'HESAPLANIYOR · TAHMİNİ SÜRE: EVRENİN YAŞINDAN UZUN'
    const shown = line.slice(0, Math.round(line.length * (1 - clamp(s.erase))))
    c.fillStyle = INK
    mono(c, Math.round(H * 0.042), 500)
    c.fillText(shown, pad, hh + (H - hh) * 0.42)
    if (caretOn(s.t)) c.fillRect(pad + c.measureText(shown).width + 6, hh + (H - hh) * 0.42 - H * 0.035, H * 0.022, H * 0.042)
    c.fillStyle = RULE
    c.fillRect(pad, hh + (H - hh) * 0.55, W - pad * 2, 8)
    c.fillStyle = AMBER
    c.fillRect(pad, hh + (H - hh) * 0.55, (W - pad * 2) * 0.0000012 + 3, 8)
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.028), 400)
    c.fillText('%0,000000', pad, hh + (H - hh) * 0.64)
    return
  }
  // Two log lines high on the screen, so the reader's centred words never sit on top of them.
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.03), 400)
  c.fillText('HESAPLAMA · TAMAMLANDI', pad, hh + (H - hh) * 0.1)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.062), 500)
  c.fillText('> ' + typedText('CEVAP HAZIR.', s.ready), pad, hh + (H - hh) * 0.22)
  if (s.missing > 0) {
    c.fillStyle = AMBER
    c.fillText('> ' + typedText('SORU EKSİK.', s.missing), pad, hh + (H - hh) * 0.34)
  }
}

/** "The answer is a position": a crosshair on a point, and the empty form for meaning. */
export function drawMeaning(c: Ctx, W: number, H: number, s: { clock: string; t: number; form: number; band: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'CEVAP', s.clock)
  const bandTop = s.band ? H * 0.78 : H
  if (s.form <= 0) {
    const x = W * 0.55
    const y = hh + (bandTop - hh) * 0.5
    c.strokeStyle = AMBER
    c.lineWidth = 2
    c.beginPath()
    c.arc(x, y, 34, 0, Math.PI * 2)
    c.moveTo(x - 60, y)
    c.lineTo(x - 12, y)
    c.moveTo(x + 12, y)
    c.lineTo(x + 60, y)
    c.moveTo(x, y - 60)
    c.lineTo(x, y - 12)
    c.moveTo(x, y + 12)
    c.lineTo(x, y + 60)
    c.stroke()
    c.fillStyle = INK
    c.beginPath()
    c.arc(x, y, 4, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.04), 600)
    c.fillText('KONUM: ·   NEYİN?', x + 76, y - 12)
  } else {
    const x = W * 0.12
    let y = hh + (bandTop - hh) * 0.28
    c.globalAlpha = clamp(s.form * 2)
    c.fillStyle = INK
    mono(c, Math.round(H * 0.05), 600)
    c.fillText('ANLAM', x, y)
    y += H * 0.1
    for (const label of ['KONUM:', 'HIZ:']) {
      c.fillStyle = MUTED
      mono(c, Math.round(H * 0.04), 500)
      c.fillText(label, x, y)
      c.strokeStyle = RULE
      c.strokeRect(x + W * 0.14, y - H * 0.045, W * 0.5, H * 0.06)
      c.fillStyle = FAINT
      c.fillText('?', x + W * 0.15, y)
      y += H * 0.09
    }
    c.globalAlpha = 1
  }
  band(c, W, H, s.band, s.t)
}

/** The reader's question (small, top) and DURUM's answer (large). */
export function drawAnswer(c: Ctx, W: number, H: number, s: { t: number; question: string; answer: string[]; typed: number }) {
  fillBg(c, W, H)
  const pad = W * 0.08
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.034), 500)
  c.fillText('SORU', pad, H * 0.12)
  c.fillStyle = INK
  sans(c, Math.round(H * 0.04), 400)
  c.fillText(s.question, pad, H * 0.19)
  c.fillStyle = RULE
  c.fillRect(pad, H * 0.25, W - pad * 2, 1)
  const size = Math.round(H * 0.068)
  sans(c, size, 300)
  let y = H * 0.42
  const text = s.answer.join(' ')
  const shown = typedText(text, s.typed)
  c.fillStyle = INK
  for (const l of wrap(c, shown, W - pad * 2)) {
    c.fillText(l, pad, y)
    y += size * 1.35
  }
}

// ——— GÖZLEMCİ ———

/** Every screen at once: black, one amber line. */
export function drawAlert(c: Ctx, W: number, H: number, s: { t: number }) {
  c.fillStyle = '#050505'
  c.fillRect(0, 0, W, H)
  c.fillStyle = AMBER
  c.textAlign = 'center'
  mono(c, Math.round(H * 0.075), 600)
  c.fillText('OBSERVER INPUT DETECTED', W / 2, H * 0.47)
  mono(c, Math.round(H * 0.048), 500)
  c.fillText('KAYNAK: BU ODADA DEĞİL', W / 2, H * 0.62)
  c.textAlign = 'left'
  if (caretOn(s.t)) {
    c.fillStyle = 'rgba(226,176,98,0.6)'
    c.fillRect(W * 0.08, H * 0.08, 14, 14)
  }
}

/** DURUM's words to the lens, centred and large; a row of ticks grows by one per scroll step. */
export function drawToYou(c: Ctx, W: number, H: number, s: { t: number; lines: string[]; typed: number[]; ticks: number }) {
  drawLone(c, W, H, { lines: s.lines, typed: s.typed, t: s.t, size: 0.064 })
  const n = Math.min(120, s.ticks)
  c.fillStyle = MUTED
  const w = W * 0.8
  for (let i = 0; i < n; i++) c.fillRect(W * 0.1 + (i / 120) * w, H * 0.86, 2, i % 10 === 0 ? 16 : 9)
  mono(c, Math.round(H * 0.026), 500)
  c.fillText('KAYDIRMA', W * 0.1, H * 0.83)
}

export type ListRow = { time: string; title: string; choice: string; result?: string }

/** This reading's decisions, one row each; the ones DURUM reads turn amber. */
export function drawList(c: Ctx, W: number, H: number, s: { t: number; rows: ListRow[]; shown: number; amber: number[] }) {
  fillBg(c, W, H)
  const pad = W * 0.07
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.032), 500)
  c.fillText('GÖZLEMCİ · BU OKUMA · KARARLAR', pad, H * 0.11)
  const rh = H * 0.14
  s.rows.forEach((r, i) => {
    const a = clamp(s.shown - i)
    if (a <= 0) return
    const y = H * 0.25 + i * rh
    const hot = s.amber[i] ?? 0
    c.globalAlpha = a
    if (hot > 0) {
      c.fillStyle = `rgba(226,176,98,${(0.14 * hot).toFixed(3)})`
      c.fillRect(pad - 12, y - rh * 0.55, W - pad * 2 + 24, rh * 0.82)
    }
    c.fillStyle = hot > 0.5 ? AMBER : MUTED
    mono(c, Math.round(H * 0.04), 600)
    c.fillText(r.time, pad, y)
    c.fillStyle = hot > 0.5 ? AMBER : INK
    c.fillText(r.title, pad + W * 0.12, y)
    sans(c, Math.round(H * 0.042), 400)
    c.fillStyle = hot > 0.5 ? '#f1d9a8' : INK
    c.fillText(r.choice, pad + W * 0.42, y)
    if (r.result) {
      c.fillStyle = MUTED
      mono(c, Math.round(H * 0.03), 500)
      c.textAlign = 'right'
      c.fillText(r.result, W - pad, y)
      c.textAlign = 'left'
    }
    c.globalAlpha = 1
  })
}

/** OBSERVER: 01 (or 02), alone, and DURUM's line in the band. */
export function drawCount(c: Ctx, W: number, H: number, s: { t: number; n: number; fade: number; band: Band | null }) {
  fillBg(c, W, H)
  c.globalAlpha = clamp(s.fade)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.12), 300)
  c.textAlign = 'center'
  c.fillText(`OBSERVER: ${String(s.n).padStart(2, '0')}`, W / 2, H * 0.3)
  c.textAlign = 'left'
  c.globalAlpha = 1
  band(c, W, H, s.band, s.t, 0.24)
}

/** QUERY INPUT: the question and a cursor; a typed reply; the line that waits. */
export function drawQuery(c: Ctx, W: number, H: number, s: { t: number; question: string; reply: string[]; typed: number[]; standby: number }) {
  fillBg(c, W, H)
  const pad = W * 0.08
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.04), 600)
  c.fillText('QUERY INPUT', pad, H * 0.16)
  c.fillStyle = INK
  sans(c, Math.round(H * 0.066), 400)
  c.fillText(s.question, pad, H * 0.31)
  c.strokeStyle = RULE
  c.strokeRect(pad, H * 0.38, W - pad * 2, H * 0.12)
  const any = s.reply.length && s.typed.some((x) => x > 0)
  if (!any && caretOn(s.t)) {
    c.fillStyle = INK
    c.fillRect(pad + 18, H * 0.405, H * 0.026, H * 0.07)
  }
  if (s.standby > 0) {
    c.globalAlpha = clamp(s.standby)
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.04), 600)
    c.fillText('SORU BEKLENİYOR.', pad + H * 0.06, H * 0.46)
    c.globalAlpha = 1
  }
  if (any) {
    const size = Math.round(H * 0.06)
    sans(c, size, 300)
    let y = H * 0.62
    s.reply.forEach((l, i) => {
      const shown = typedText(l, s.typed[i] ?? 0)
      c.fillStyle = INK
      for (const part of wrap(c, shown, W - pad * 2)) {
        c.fillText(part, pad, y)
        y += size * 1.3
      }
    })
  }
}

// ——— Main monitor ———

/** The operator's console: status, a log, and the prompt line DURUM types into. */
export function drawConsole(c: Ctx, W: number, H: number, s: { clock: string; t: number; prompt: Band | null; alert?: string | null; dim?: number }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'OPERATÖR · ARİF D.', s.clock, 1.2)
  const pad = W * 0.03
  const rand = mulberry32(31)
  const names = ['kalibrasyon', 'senkron', 'akıntı modeli', 'nüfus akışı', 'şebeke yükü', 'hava parseli', 'yörünge', 'trafik grafı']
  mono(c, Math.round(H * 0.036), 400)
  const lh = Math.round(H * 0.052)
  const off = Math.floor(s.t * 0.7)
  for (let i = 0; i < 8; i++) {
    const k = (i + off) * 7
    const name = names[(k + Math.floor(rand() * 8)) % 8]
    c.fillStyle = 'rgba(125,138,147,0.8)'
    c.fillText(`${String((off + i) % 10000).padStart(4, '0')}  ${name.padEnd(14)} ${((k * 13.37) % 99).toFixed(2)}  ok`, pad, hh + lh * (i + 1.3))
  }
  if (s.alert) {
    c.fillStyle = 'rgba(226,176,98,0.14)'
    c.fillRect(pad - 6, hh + lh * 8.6, W - pad * 2 + 12, lh * 1.1)
    c.fillStyle = AMBER
    c.fillText(s.alert, pad, hh + lh * 9.3)
  }
  // The prompt line.
  const top = H * 0.74
  c.fillStyle = PANEL
  c.fillRect(0, top, W, H - top)
  c.fillStyle = RULE
  c.fillRect(0, top, W, 2)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.04), 600)
  c.fillText('DURUM ›', pad, top + H * 0.085)
  if (s.prompt) {
    const x = pad + W * 0.14
    let size = Math.round(H * 0.056)
    sans(c, size, 400)
    const text = s.prompt.lines.map((l, i) => typedText(l, s.prompt!.typed[i] ?? 0)).filter(Boolean).join(' ')
    let rows = wrap(c, text, W - x - pad)
    if (rows.length > 3) {
      size = Math.round(size * 0.8)
      sans(c, size, 400)
      rows = wrap(c, text, W - x - pad)
    }
    c.fillStyle = INK
    rows.slice(-3).forEach((r, i) => c.fillText(r, x, top + H * 0.085 + i * size * 1.22))
  } else if (caretOn(s.t)) {
    c.fillStyle = INK
    c.fillRect(pad + W * 0.14, top + H * 0.045, H * 0.025, H * 0.05)
  }
  if (s.dim) {
    c.fillStyle = `rgba(0,0,0,${s.dim})`
    c.fillRect(0, 0, W, H)
  }
}

/** The query queue; the top item opens (the wedding hall's question). */
export function drawQueue(c: Ctx, W: number, H: number, s: { clock: string; t: number; open: number; prompt: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KUYRUK · 1.204 SORGU', s.clock, 1.2)
  const pad = W * 0.03
  const rh = H * 0.075
  const items = ['15 AĞUSTOS · +1 YIL · İSTANBUL · ÖĞLEDEN SONRA YAĞMUR?', 'ŞEBEKE · CUMA 18.00 · YÜK TAHMİNİ', 'GÖLBAŞI · DON · 3 GÜN', 'ESKİŞEHİR YOLU · TRAFİK · 08.00', 'BARAJ · DOLULUK · 30 GÜN', 'ULUS · HAL · FİYAT · SALI']
  const open = clamp(s.open)
  let y = hh + rh * 0.9
  items.forEach((it, i) => {
    const hot = i === 0
    if (hot) {
      c.fillStyle = `rgba(226,176,98,${(0.1 + 0.08 * open).toFixed(2)})`
      c.fillRect(pad - 6, y - rh * 0.7, W - pad * 2 + 12, rh * (0.95 + open * 1.6))
    }
    c.fillStyle = hot ? AMBER : MUTED
    mono(c, Math.round(H * 0.034), hot ? 600 : 400)
    c.fillText(`${String(i + 1).padStart(4, '0')}  ${it}`, pad, y)
    if (hot && open > 0) {
      c.globalAlpha = open
      c.fillStyle = INK
      sans(c, Math.round(H * 0.045), 400)
      c.fillText('GÖNDEREN: DÜĞÜN SALONU, SARIYER', pad + W * 0.07, y + rh * 0.85)
      c.fillStyle = MUTED
      mono(c, Math.round(H * 0.03), 400)
      c.fillText('öncelik: düşük · ücret ödendi · yanıt bekleniyor', pad + W * 0.07, y + rh * 1.6)
      c.globalAlpha = 1
      y += rh * 1.6 * open
    }
    y += rh
  })
  if (s.prompt) {
    band(c, W, H, s.prompt, s.t, 0.2)
  }
}

/** The screen inside the screen inside the screen: the same text at every level. */
export function drawRecursion(c: Ctx, W: number, H: number, s: { clock: string; t: number; prompt: Band | null; depth: number }) {
  const level = (k: number, x: number, y: number, w: number, h: number) => {
    c.save()
    c.translate(x, y)
    c.scale(w / W, h / H)
    drawConsole(c, W, H, { clock: s.clock, t: s.t, prompt: s.prompt })
    c.restore()
    if (k < s.depth) {
      // The next screen sits where the log was, a bezel round it.
      const nx = x + w * 0.42
      const ny = y + h * 0.12
      const nw = w * 0.52
      const nh = h * 0.52
      c.fillStyle = '#15171a'
      c.fillRect(nx - w * 0.012, ny - h * 0.02, nw + w * 0.024, nh + h * 0.04)
      level(k + 1, nx, ny, nw, nh)
    }
  }
  level(0, 0, 0, W, H)
}

/** The queue scrolls; a grey item with a red wax seal rises from the bottom, cracks, opens. */
export function drawSealed(c: Ctx, W: number, H: number, s: { clock: string; t: number; rise: number; crack: number }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KUYRUK · 1.204 SORGU', s.clock, 1.2)
  const pad = W * 0.03
  const rh = H * 0.075
  const rise = clamp(s.rise)
  const scroll = rise * rh * 3
  c.save()
  c.beginPath()
  c.rect(0, hh + 2, W, H - hh - 2)
  c.clip()
  const rand = mulberry32(12)
  for (let i = 0; i < 14; i++) {
    const y = hh + rh * (i + 1) - scroll
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.032), 400)
    c.fillText(`${String(i + 1).padStart(4, '0')}  SORGU · ${['HAVA', 'TRAFİK', 'ŞEBEKE', 'NÜFUS', 'BARAJ', 'YÖRÜNGE'][Math.floor(rand() * 6)]} · ${Math.floor(rand() * 90)} GÜN`, pad, y)
  }
  // The sealed item travels from below the bottom to the top slot.
  const iy = hh + rh * 1.0 + (1 - rise) * (H - hh)
  c.fillStyle = 'rgba(160,166,172,0.22)'
  c.fillRect(pad - 6, iy - rh * 0.75, W - pad * 2 + 12, rh * 1.1)
  c.strokeStyle = 'rgba(160,166,172,0.6)'
  c.strokeRect(pad - 6, iy - rh * 0.75, W - pad * 2 + 12, rh * 1.1)
  // The wax seal: a red disc, embossed K; it cracks.
  const sx = pad + 26
  const sy = iy - rh * 0.2
  c.fillStyle = '#9b2a22'
  c.beginPath()
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI * 2
    const r = 20 + (i % 2 ? 2 : 0)
    if (i === 0) c.moveTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r)
    else c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r)
  }
  c.fill()
  c.fillStyle = '#d6827a'
  sans(c, 22, 800)
  c.textAlign = 'center'
  c.fillText('K', sx, sy + 8)
  c.textAlign = 'left'
  if (s.crack > 0) {
    c.strokeStyle = '#0a0c0e'
    c.lineWidth = 3
    c.beginPath()
    c.moveTo(sx - 4, sy - 22)
    c.lineTo(sx + 3, sy - 6)
    c.lineTo(sx - 5, sy + 6)
    c.lineTo(sx + 2, sy + 22)
    c.stroke()
  }
  c.fillStyle = INK
  mono(c, Math.round(H * 0.036), 600)
  c.fillText('KURUL · MÜHÜRLÜ · BEKLEME: 7 YIL 112 GÜN', sx + 34, iy)
  if (s.crack > 0.5) {
    c.globalAlpha = clamp((s.crack - 0.5) * 2)
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.034), 500)
    c.fillText('AÇILDI · TEK SATIR', sx + 34, iy + rh * 0.9)
    c.globalAlpha = 1
  }
  c.restore()
}

/** The Kurul's thread: offline. Arif selects its line and deletes it; the cursor waits. */
export function drawKurul(c: Ctx, W: number, H: number, s: { clock: string; t: number; select: number; erased: boolean }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'KURUL · YAZIŞMA', s.clock, 1.2)
  const pad = W * 0.04
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.036), 500)
  c.fillText('KURUL · ÇEVRİMDIŞI', pad, hh + H * 0.1)
  c.fillStyle = RED
  c.beginPath()
  c.arc(pad + W * 0.33, hh + H * 0.088, 6, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = INK
  sans(c, Math.round(H * 0.045), 400)
  c.fillText('DURUM › Bana “anlam” dediğiniz şeyin durumunu verin.', pad, hh + H * 0.22)
  c.fillStyle = FAINT
  mono(c, Math.round(H * 0.03), 400)
  c.fillText('yanıt yok · 02:21 · 02:22 · 02:24', pad, hh + H * 0.3)
  const y = H * 0.66
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.04), 600)
  c.fillText('SORU:', pad, y)
  c.strokeStyle = RULE
  c.strokeRect(pad + W * 0.12, y - H * 0.06, W * 0.8, H * 0.09)
  if (!s.erased) {
    const line = 'HAYATIN, EVRENİN VE HER ŞEYİN ANLAMI NEDİR?'
    sans(c, Math.round(H * 0.038), 400)
    if (s.select > 0) {
      c.fillStyle = 'rgba(59,111,216,0.55)'
      c.fillRect(pad + W * 0.13, y - H * 0.045, c.measureText(line).width * clamp(s.select) + 4, H * 0.06)
    }
    c.fillStyle = INK
    c.fillText(line, pad + W * 0.135, y - H * 0.002)
  } else if (caretOn(s.t)) {
    c.fillStyle = INK
    c.fillRect(pad + W * 0.135, y - H * 0.045, H * 0.022, H * 0.06)
  }
}

/** SORU: the empty line (CEVAP HAZIR. dimmed above); after the pick, the question types itself. */
export function drawRebuild(c: Ctx, W: number, H: number, s: { clock: string; t: number; question: string; typed: number; entered: boolean }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, 'SORUYU TAMAMLA', s.clock, 1.2)
  const pad = W * 0.06
  c.fillStyle = FAINT
  sans(c, Math.round(H * 0.07), 300)
  c.fillText('CEVAP HAZIR.', pad, hh + H * 0.2)
  const y = H * 0.56
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.05), 600)
  c.fillText('SORU:', pad, y)
  c.strokeStyle = s.entered ? GREEN : RULE
  c.lineWidth = 2
  c.strokeRect(pad, y + H * 0.04, W - pad * 2, H * 0.12)
  const shown = typedText(s.question, s.typed)
  c.fillStyle = INK
  sans(c, Math.round(H * 0.05), 400)
  c.fillText(shown, pad + 16, y + H * 0.12)
  if (!s.entered && caretOn(s.t)) c.fillRect(pad + 20 + c.measureText(shown).width, y + H * 0.065, H * 0.024, H * 0.065)
  if (s.entered) {
    c.fillStyle = GREEN
    mono(c, Math.round(H * 0.036), 600)
    c.fillText('↵ GÖNDERİLDİ', pad, y + H * 0.26)
  }
}

/** The empty room's last line: the main monitor typing alone. */
export function drawUnknown(c: Ctx, W: number, H: number, s: { t: number; typed: number }) {
  drawLone(c, W, H, { lines: ['Her şeyin durumu: bilinmiyor.'], typed: [s.typed], t: s.t, size: 0.075 })
}

/** A sleeping monitor: the clock, large and dim (the time-lapse's MM). */
export function drawSaver(c: Ctx, W: number, H: number, s: { clock: string }) {
  c.fillStyle = '#050607'
  c.fillRect(0, 0, W, H)
  c.fillStyle = 'rgba(217,221,224,0.55)'
  mono(c, Math.round(H * 0.24), 200)
  c.textAlign = 'center'
  c.fillText(s.clock, W / 2, H * 0.6)
  c.textAlign = 'left'
}

// ——— Side monitors ———

/** The left monitor: the prediction log. Yesterday's forecast waits, then turns green. */
export function drawPredLog(c: Ctx, W: number, H: number, s: { clock: string; t: number; verified: number; history?: boolean }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, s.history ? 'SORGU GEÇMİŞİ' : 'TAHMİN GÜNLÜĞÜ', s.clock, 1.3)
  const pad = W * 0.04
  const rh = H * 0.1
  mono(c, Math.round(H * 0.043), 500)
  if (s.history) {
    const rows = [
      ['11.10 · 20.31', 'Selin bu gece kaç simit?', 'DOĞRU'],
      ['10.10 · 21.02', 'Kızılay 14.17 araç sayısı?', 'DOĞRU'],
      ['09.10 · 20.58', 'Para?', 'DOĞRU'],
      ['3 YIL ÖNCE', 'Geleceğimi bilmek ister miyim?', 'BEKLİYOR'],
    ]
    rows.forEach(([d, q, st], i) => {
      const y = hh + rh * (i + 1.2)
      const old = st === 'BEKLİYOR'
      if (old) {
        c.fillStyle = 'rgba(226,176,98,0.1)'
        c.fillRect(pad - 6, y - rh * 0.7, W - pad * 2 + 12, rh * 0.95)
      }
      c.fillStyle = MUTED
      c.fillText(d, pad, y)
      c.fillStyle = old ? AMBER : INK
      c.fillText(q, pad + W * 0.24, y)
      c.fillStyle = old ? AMBER : GREEN
      c.textAlign = 'right'
      c.fillText(st, W - pad, y)
      c.textAlign = 'left'
    })
    return
  }
  const rows = [
    ['DÜN 21.02', 'DÜNKÜ TAHMİN · 14.17 · KIZILAY · 212 ARAÇ'],
    ['DÜN 20.40', 'SELİN · SİMİT · 1,5'],
    ['DÜN 20.36', 'ŞEBEKE · 21.00 · 1.214 MW'],
    ['DÜN 20.31', 'PARA · TURA'],
  ]
  rows.forEach(([d, q], i) => {
    const y = hh + rh * (i + 1.2)
    const first = i === 0
    const ok = first ? s.verified : 1
    if (first) {
      c.fillStyle = ok > 0.5 ? 'rgba(120,196,155,0.14)' : 'rgba(226,176,98,0.1)'
      c.fillRect(pad - 6, y - rh * 0.7, W - pad * 2 + 12, rh * 1.6)
    }
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.036), 500)
    c.fillText(d, pad, y)
    c.fillStyle = first ? INK : 'rgba(217,221,224,0.65)'
    mono(c, Math.round(H * (first ? 0.045 : 0.038)), first ? 600 : 400)
    c.fillText(q, pad + W * 0.2, y)
    if (first) {
      c.fillStyle = ok > 0.5 ? GREEN : AMBER
      mono(c, Math.round(H * 0.05), 700)
      c.fillText(ok > 0.5 ? 'DOĞRULANDI' : 'BEKLİYOR', pad + W * 0.2, y + rh * 0.75)
    } else {
      c.fillStyle = GREEN
      mono(c, Math.round(H * 0.034), 500)
      c.textAlign = 'right'
      c.fillText('DOĞRU', W - pad, y)
      c.textAlign = 'left'
    }
  })
}

/** The right monitor: yesterday's traffic-camera recording of the Kızılay corner (high angle, daylight). */
export function drawTraffic(c: Ctx, W: number, H: number, s: { t: number; clip: number; count: number; rewind: boolean }) {
  // Daylight asphalt from above; lanes, a stop line, a zebra crossing.
  c.fillStyle = '#5d6166'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#7c7a73'
  c.fillRect(0, 0, W * 0.16, H)
  c.fillRect(W * 0.84, 0, W * 0.16, H)
  c.fillStyle = '#e9e6dc'
  for (let i = 0; i < 9; i++) c.fillRect(W * 0.2 + i * W * 0.068, H * 0.62, W * 0.04, H * 0.07)
  c.fillRect(W * 0.18, H * 0.58, W * 0.64, 4)
  for (const x of [0.34, 0.5, 0.66]) for (let y = 0; y < H * 0.56; y += 40) c.fillRect(W * x - 2, y, 4, 22)
  // Cars crossing the stop line, deterministic in clip time.
  const rand = mulberry32(5)
  for (let i = 0; i < 26; i++) {
    const lane = Math.floor(rand() * 4)
    const t0 = rand() * 70
    const speed = 0.06 + rand() * 0.03
    const v = (s.clip - t0) * speed
    if (v < -0.2 || v > 1.3) continue
    const x = W * (0.26 + lane * 0.16)
    const y = H * (-0.15 + v * 1.1)
    const col = ['#d8d8d4', '#2a2d33', '#8f2b26', '#3a5a86', '#c9c3b2', '#4a4d52'][Math.floor(rand() * 6)]
    c.fillStyle = 'rgba(0,0,0,0.25)'
    c.fillRect(x - 22 + 4, y - 44 + 6, 46, 90)
    c.fillStyle = col
    c.fillRect(x - 22, y - 44, 44, 88)
    c.fillStyle = 'rgba(20,24,30,0.75)'
    c.fillRect(x - 18, y - 20, 36, 22)
    c.fillRect(x - 18, y + 22, 36, 14)
  }
  // The recording's own overlay.
  c.fillStyle = 'rgba(0,0,0,0.55)'
  c.fillRect(0, 0, W, H * 0.11)
  c.fillStyle = '#f2f2f2'
  mono(c, Math.round(H * 0.05), 600)
  const sec = Math.max(0, Math.floor(s.clip))
  c.fillText(`KAMERA 07 · KIZILAY · DÜN 14.17:${String(sec % 60).padStart(2, '0')}`, 12, H * 0.075)
  c.textAlign = 'right'
  c.fillStyle = s.rewind ? AMBER : '#f2f2f2'
  c.fillText(s.rewind ? '◀◀' : '▶ 4×', W - 12, H * 0.075)
  c.textAlign = 'left'
  c.fillStyle = 'rgba(0,0,0,0.55)'
  c.fillRect(0, H * 0.88, W * 0.36, H * 0.12)
  c.fillStyle = '#f2f2f2'
  c.fillText(`SAYIM ${String(s.count).padStart(4, '0')}`, 12, H * 0.96)
}

/** Cooling load, a trace; red when a person is being modelled. */
export function drawLoad(c: Ctx, W: number, H: number, s: { t: number; spike: number; label?: string }) {
  fillBg(c, W, H)
  const hot = s.spike > 0.5
  c.fillStyle = hot ? RED : MUTED
  mono(c, Math.round(H * 0.07), hot ? 700 : 500)
  c.fillText(s.label ?? (hot ? 'DAVRANIŞ MODELİ · 9 DK · SOĞUTMA %340' : 'SOĞUTMA · YÜK %38'), 12, H * 0.13)
  c.strokeStyle = RULE
  for (let i = 1; i < 5; i++) {
    c.beginPath()
    c.moveTo(0, H * (0.2 + i * 0.15))
    c.lineTo(W, H * (0.2 + i * 0.15))
    c.stroke()
  }
  c.strokeStyle = hot ? RED : GREEN
  c.lineWidth = 2.5
  c.beginPath()
  for (let i = 0; i <= 80; i++) {
    const x = 12 + (i / 80) * (W - 24)
    const n = Math.sin(i * 0.5 + s.t * 2) * 0.03 + Math.sin(i * 0.17 + s.t) * 0.04
    const spike = s.spike * Math.min(1, Math.max(0, (i - 50) / 6)) * (0.9 + 0.1 * Math.sin(i + s.t * 5))
    const y = H * (0.82 - 0.2 - n - spike * 0.5)
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.stroke()
}

/** The hall console's log. In GÖZLEMCİ it holds a log nobody opened: KAYDIRMA. */
export function drawHallLog(c: Ctx, W: number, H: number, s: { clock: string; t: number; scroll: boolean; prompt: Band | null }) {
  fillBg(c, W, H)
  const hh = header(c, W, H, s.scroll ? 'GÜNLÜK · KAYDIRMA' : 'SALON B · KONSOL', s.clock, 1.3)
  const pad = W * 0.04
  mono(c, Math.round(H * 0.045), 500)
  const lh = H * 0.075
  if (s.scroll) {
    const rows = ['Son girdi: şimdi.', 'Ondan önceki: şimdi.', 'Ondan önceki: şimdi.', 'Ondan önceki: şimdi.']
    rows.forEach((r, i) => {
      c.fillStyle = i === 0 ? AMBER : MUTED
      c.fillText(r, pad, hh + lh * (i + 1.4))
    })
    return
  }
  for (let i = 0; i < 6; i++) {
    c.fillStyle = 'rgba(125,138,147,0.85)'
    c.fillText(`RAF ${['A', 'B', 'C'][i % 3]}${(i % 6) + 1} · ${(19.4 + ((i * 7) % 5) * 0.3).toFixed(1)} °C · ok`, pad, hh + lh * (i + 1.3))
  }
  if (s.prompt) band(c, W, H, s.prompt, s.t, 0.3)
}

/** One word of a rack status strip (drawn into an atlas slot). */
export function drawStripWord(c: Ctx, x: number, y: number, w: number, h: number, word: string, lit: number) {
  c.fillStyle = '#05080b'
  c.fillRect(x, y, w, h)
  if (lit <= 0 || !word) return
  c.fillStyle = `rgba(156,200,255,${(0.35 + 0.65 * lit).toFixed(2)})`
  mono(c, Math.round(h * 0.7), 600)
  c.fillText(word, x + 8, y + h * 0.76)
}
