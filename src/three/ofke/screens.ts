/**
 * Everything ÖFKE writes into its world: the resignation letter, the boss's
 * phone, the route on the dashboard, the billboard and the facade, the anger
 * map, the explainer on the locker-room screen, the status plate of ODA 3,
 * the manifest, the reading room's wall of screens. Drawn on canvases.
 */
import { mono, sans } from '../screens'

type C = CanvasRenderingContext2D
const PI = Math.PI

export const MINT = '#7fd1c1'
export const MINT_DARK = '#2f7d70'
export const INK = '#1d2b2a'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** The service's logo: a circle with a calm, closed-eyed smile. */
export function logo(c: C, x: number, y: number, r: number, color = MINT, line = '#ffffff') {
  c.save()
  c.fillStyle = color
  c.beginPath()
  c.arc(x, y, r, 0, PI * 2)
  c.fill()
  c.strokeStyle = line
  c.lineWidth = Math.max(1.5, r * 0.09)
  c.lineCap = 'round'
  for (const sx of [-1, 1]) {
    c.beginPath()
    c.arc(x + sx * r * 0.34, y - r * 0.12, r * 0.16, PI * 0.15, PI * 0.85)
    c.stroke()
  }
  c.beginPath()
  c.arc(x, y + r * 0.02, r * 0.42, PI * 0.2, PI * 0.8)
  c.stroke()
  c.restore()
}

function round(c: C, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

// ——— Office ———

export function letter(c: C, W: number, H: number) {
  c.fillStyle = '#f4f1e8'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#2a2a2a'
  sans(c, W * 0.05, 600)
  c.textAlign = 'center'
  c.fillText('İSTİFA DİLEKÇESİ', W / 2, H * 0.1)
  c.textAlign = 'left'
  sans(c, W * 0.03, 400)
  c.fillStyle = '#444'
  const lines = ['Sayın Genel Müdürüm,', '', 'Şirketinizde yürüttüğüm görevimden', 'kendi isteğimle ayrılmak istiyorum.', 'Yasal haklarımın ve tazminatımın', 'ödenmesini arz ederim.', '', 'Saygılarımla,', 'Arif K.']
  lines.forEach((l, i) => c.fillText(l, W * 0.1, H * 0.2 + i * H * 0.045))
  // Four dates crossed out, the last one today.
  const dates = ['12.06', '03.07', '28.07', '19.08']
  dates.forEach((d, i) => {
    const x = W * 0.58
    const y = H * 0.66 + i * H * 0.05
    c.fillStyle = '#555'
    c.fillText(`${d}.2026`, x, y)
    c.strokeStyle = '#2b3a8a'
    c.lineWidth = W * 0.006
    c.beginPath()
    c.moveTo(x - 6, y - H * 0.012)
    c.lineTo(x + W * 0.24, y - H * 0.01)
    c.stroke()
  })
  c.fillStyle = '#2b3a8a'
  sans(c, W * 0.036, 600)
  c.fillText('11.10.2026', W * 0.58, H * 0.88)
  c.strokeStyle = '#2b3a8a'
  c.lineWidth = W * 0.004
  c.beginPath()
  c.moveTo(W * 0.12, H * 0.66)
  c.bezierCurveTo(W * 0.2, H * 0.6, W * 0.22, H * 0.72, W * 0.32, H * 0.64)
  c.stroke()
}

export function spreadsheet(c: C, W: number, H: number, seed = 1) {
  c.fillStyle = '#eef1f3'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#2f5d8a'
  c.fillRect(0, 0, W, H * 0.07)
  c.strokeStyle = '#c9d0d6'
  c.lineWidth = 1
  for (let y = H * 0.12; y < H; y += H * 0.055) {
    c.beginPath()
    c.moveTo(0, y)
    c.lineTo(W, y)
    c.stroke()
  }
  for (let x = W * 0.08; x < W; x += W * 0.13) {
    c.beginPath()
    c.moveTo(x, H * 0.07)
    c.lineTo(x, H)
    c.stroke()
  }
  c.fillStyle = '#56606a'
  mono(c, H * 0.032, 400)
  let s = seed * 9301
  for (let r = 0; r < 15; r++)
    for (let k = 0; k < 6; k++) {
      s = (s * 9301 + 49297) % 233280
      if (s / 233280 < 0.25) continue
      c.fillText(String(Math.floor((s / 233280) * 90000)), W * 0.1 + k * W * 0.13, H * 0.155 + r * H * 0.055)
    }
}

export function bossMonitor(c: C, W: number, H: number) {
  c.fillStyle = '#10161c'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = '#3fbf7f'
  c.lineWidth = 3
  c.beginPath()
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * W
    const y = H * (0.7 - 0.4 * (i / 40) + 0.08 * Math.sin(i * 1.7) + 0.05 * Math.sin(i * 0.6))
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.stroke()
  c.fillStyle = '#9fb3bc'
  mono(c, H * 0.06, 500)
  c.fillText('Q3 KÂR  +%18', W * 0.06, H * 0.13)
}

export function nameplate(c: C, W: number, H: number) {
  const g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#c8a24f')
  g.addColorStop(1, '#8a6a2a')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#2a1f0e'
  sans(c, H * 0.52, 600)
  c.textAlign = 'center'
  c.fillText('GENEL MÜDÜR', W / 2, H * 0.7)
}

export function holiday(c: C, W: number, H: number) {
  c.fillStyle = '#ffffff'
  c.fillRect(0, 0, W, H)
  const g = c.createLinearGradient(0, 0, 0, H * 0.42)
  g.addColorStop(0, '#5fb4e6')
  g.addColorStop(0.6, '#a9dcf0')
  g.addColorStop(1, '#1f8fb8')
  c.fillStyle = g
  c.fillRect(0, H * 0.08, W, H * 0.34)
  c.fillStyle = '#f2e3b8'
  c.fillRect(0, H * 0.36, W, H * 0.06)
  c.fillStyle = '#1b1b1b'
  sans(c, W * 0.085, 700)
  c.fillText('Bodrum · 7 gece', W * 0.07, H * 0.5)
  sans(c, W * 0.065, 400)
  c.fillStyle = '#555'
  c.fillText('Her şey dâhil · 5★', W * 0.07, H * 0.56)
  c.fillStyle = '#e8573a'
  sans(c, W * 0.09, 700)
  c.fillText('₺ 186.400', W * 0.07, H * 0.65)
  c.fillStyle = '#2aa36b'
  round(c, W * 0.07, H * 0.72, W * 0.86, H * 0.08, 10)
  c.fill()
  c.fillStyle = '#fff'
  sans(c, W * 0.07, 700)
  c.textAlign = 'center'
  c.fillText('✓ Sepete eklendi.', W / 2, H * 0.775)
  c.textAlign = 'left'
}

export function photo(c: C, W: number, H: number) {
  const sky = c.createLinearGradient(0, 0, 0, H * 0.6)
  sky.addColorStop(0, '#7fb6dc')
  sky.addColorStop(1, '#cfe6f0')
  c.fillStyle = sky
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#1f5f8a'
  c.fillRect(0, H * 0.58, W, H * 0.42)
  // The boat.
  c.fillStyle = '#f4f4f0'
  c.beginPath()
  c.moveTo(W * 0.1, H * 0.62)
  c.lineTo(W * 0.92, H * 0.6)
  c.lineTo(W * 0.8, H * 0.75)
  c.lineTo(W * 0.18, H * 0.75)
  c.closePath()
  c.fill()
  // The boss on it, a drink raised.
  c.fillStyle = '#a9c1dc'
  c.fillRect(W * 0.46, H * 0.4, W * 0.12, H * 0.21)
  c.fillStyle = '#d2a184'
  c.beginPath()
  c.arc(W * 0.52, H * 0.34, W * 0.055, 0, PI * 2)
  c.fill()
  c.fillRect(W * 0.58, H * 0.3, W * 0.025, H * 0.12)
  c.fillStyle = '#e8a040'
  c.fillRect(W * 0.575, H * 0.26, W * 0.035, H * 0.05)
  c.fillStyle = '#20262c'
  c.fillRect(W * 0.465, H * 0.31, W * 0.11, H * 0.02)
}

export function exitSign(c: C, W: number, H: number) {
  c.fillStyle = '#1f8a4c'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#ffffff'
  sans(c, H * 0.55, 700)
  c.textAlign = 'center'
  c.fillText('ÇIKIŞ', W * 0.6, H * 0.72)
  // A running figure.
  c.beginPath()
  c.arc(W * 0.16, H * 0.25, H * 0.09, 0, PI * 2)
  c.fill()
  c.fillRect(W * 0.13, H * 0.35, W * 0.05, H * 0.3)
  c.textAlign = 'left'
}

export function floorNumber(c: C, W: number, H: number, label: string) {
  c.clearRect(0, 0, W, H)
  c.fillStyle = 'rgba(0,0,0,0)'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#e9e4d6'
  sans(c, H * 0.82, 800)
  c.textAlign = 'center'
  c.fillText(label, W / 2, H * 0.84)
  // Stencil bridges.
  c.fillStyle = 'rgba(0,0,0,0)'
  c.textAlign = 'left'
}

export function elevatorPanel(c: C, W: number, H: number, floor: string) {
  c.fillStyle = '#0d0f12'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#ff6a3a'
  mono(c, H * 0.7, 700)
  c.textAlign = 'center'
  c.fillText(floor, W / 2, H * 0.78)
  c.textAlign = 'left'
}

// ——— The road ———

/** The dashboard: typing the destination, then the route. */
export function route(c: C, W: number, H: number, typed: number, lit: number) {
  c.fillStyle = '#0c1216'
  c.fillRect(0, 0, W, H)
  const name = 'ÖFKE NÖBETİ'
  if (lit < 0.01) {
    // The keyboard and the field.
    c.fillStyle = '#1b252b'
    round(c, W * 0.05, H * 0.08, W * 0.9, H * 0.18, 10)
    c.fill()
    c.fillStyle = '#e8f0f2'
    sans(c, H * 0.1, 600)
    const n = Math.floor(typed * name.length)
    c.fillText(name.slice(0, n) + (Math.floor(typed * 30) % 2 ? '|' : ''), W * 0.08, H * 0.2)
    c.fillStyle = '#7d8a90'
    sans(c, H * 0.055, 400)
    c.fillText('Nereye?', W * 0.08, H * 0.32)
    const keys = 'QWERTYUIOPĞÜASDFGHJKLŞİZXCVBNMÖÇ'
    sans(c, H * 0.06, 500)
    for (let i = 0; i < keys.length; i++) {
      const row = i < 12 ? 0 : i < 23 ? 1 : 2
      const k = row === 0 ? i : row === 1 ? i - 12 : i - 23
      const x = W * (0.06 + k * 0.075 + row * 0.03)
      const y = H * (0.45 + row * 0.17)
      c.fillStyle = '#26323a'
      round(c, x, y, W * 0.065, H * 0.13, 6)
      c.fill()
      c.fillStyle = '#c9d6dc'
      c.fillText(keys[i], x + W * 0.018, y + H * 0.09)
    }
    return
  }
  // The map.
  c.fillStyle = '#16212a'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = '#26343e'
  c.lineWidth = 6
  for (let i = 0; i < 9; i++) {
    c.beginPath()
    c.moveTo(0, H * (0.1 + i * 0.11))
    c.lineTo(W, H * (0.05 + i * 0.12))
    c.stroke()
    c.beginPath()
    c.moveTo(W * (0.08 + i * 0.12), 0)
    c.lineTo(W * (0.02 + i * 0.12), H)
    c.stroke()
  }
  const pts: Array<[number, number]> = [
    [0.12, 0.84],
    [0.3, 0.78],
    [0.36, 0.55],
    [0.58, 0.5],
    [0.64, 0.3],
    [0.82, 0.22],
  ]
  c.strokeStyle = MINT
  c.lineWidth = 9
  c.lineCap = 'round'
  c.beginPath()
  const segs = pts.length - 1
  const upto = lit * segs
  pts.forEach(([x, y], i) => {
    if (i > Math.ceil(upto)) return
    let px = x
    let py = y
    if (i > upto) {
      const t = upto - (i - 1)
      px = pts[i - 1][0] + (x - pts[i - 1][0]) * t
      py = pts[i - 1][1] + (y - pts[i - 1][1]) * t
    }
    if (i === 0) c.moveTo(px * W, py * H)
    else c.lineTo(px * W, py * H)
  })
  c.stroke()
  c.fillStyle = '#e8f0f2'
  c.beginPath()
  c.arc(pts[0][0] * W, pts[0][1] * H, 9, 0, PI * 2)
  c.fill()
  if (lit > 0.85) {
    logo(c, 0.82 * W, 0.22 * H - 26, 22)
  }
  c.fillStyle = 'rgba(12,18,22,0.85)'
  c.fillRect(0, H * 0.86, W, H * 0.14)
  c.fillStyle = MINT
  sans(c, H * 0.085, 700)
  c.fillText('ÖFKE NÖBETİ', W * 0.04, H * 0.955)
  c.fillStyle = '#e8f0f2'
  c.textAlign = 'right'
  c.fillText('23 DK · VARIŞ 18.32', W * 0.96, H * 0.955)
  c.textAlign = 'left'
}

export function memberCard(c: C, W: number, H: number) {
  c.fillStyle = MINT
  round(c, 0, 0, W, H, H * 0.08)
  c.fill()
  logo(c, W * 0.16, H * 0.3, H * 0.16, '#ffffff', MINT)
  c.fillStyle = '#ffffff'
  sans(c, H * 0.13, 700)
  c.fillText('ÖFKE NÖBETİ', W * 0.3, H * 0.34)
  c.fillStyle = INK
  sans(c, H * 0.11, 600)
  c.fillText('Arif K.', W * 0.08, H * 0.7)
  sans(c, H * 0.09, 500)
  c.fillText('17. ziyaret', W * 0.08, H * 0.86)
  c.fillStyle = 'rgba(255,255,255,0.6)'
  c.fillText('ÜYE KARTI', W * 0.64, H * 0.86)
}

export function billboard(c: C, W: number, H: number) {
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#f4fbf9')
  g.addColorStop(1, '#d4efe9')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  logo(c, W * 0.15, H * 0.5, H * 0.3)
  c.fillStyle = INK
  sans(c, H * 0.17, 800)
  c.fillText('ÖFKENİZİ', W * 0.31, H * 0.42)
  c.fillText('EVE GÖTÜRMEYİN', W * 0.31, H * 0.62)
  c.fillStyle = MINT_DARK
  sans(c, H * 0.09, 700)
  c.fillText('ÖFKE NÖBETİ · ÜCRETSİZ KAMU HİZMETİ', W * 0.31, H * 0.82)
}

// ——— ÖFKE NÖBETİ ———

export function facadeSign(c: C, W: number, H: number) {
  c.clearRect(0, 0, W, H)
  logo(c, H * 0.42, H * 0.42, H * 0.36, MINT, '#ffffff')
  c.fillStyle = MINT
  sans(c, H * 0.42, 700)
  c.fillText('ÖFKE NÖBETİ', H * 0.95, H * 0.58)
  c.fillStyle = '#4f6763'
  sans(c, H * 0.17, 600)
  c.fillText('ÜCRETSİZ KAMU HİZMETİ', H * 0.98, H * 0.9)
}

export function logoLoop(c: C, W: number, H: number, t: number) {
  c.fillStyle = '#f4fbf9'
  c.fillRect(0, 0, W, H)
  const s = 1 + 0.06 * Math.sin(t * PI * 2)
  logo(c, W / 2, H * 0.42, H * 0.22 * s)
  c.fillStyle = INK
  sans(c, H * 0.09, 700)
  c.textAlign = 'center'
  c.fillText('ÖFKE NÖBETİ', W / 2, H * 0.8)
  c.fillStyle = MINT_DARK
  sans(c, H * 0.05, 500)
  c.fillText('Hoş geldiniz. Bugün nasılsınız?', W / 2, H * 0.9)
  c.textAlign = 'left'
}

/** The prep-room screen, state by state. */
export type MapState =
  | { kind: 'idle' }
  | { kind: 'scan'; t: number; thumb: number; p?: number }
  | { kind: 'uploaded' }
  | { kind: 'map'; draw: number; push: number; split: number; picked: number; pick: 'laugh' | 'money' | 'shh' | ''; uploaded?: boolean }
  | { kind: 'copies'; fill: number; two: number }

const PEAKS: Array<[number, string, string, number]> = [
  [8.52, '08.31', 'Trafik', 31],
  [9.23, '09.14', 'Patronun odası', 97],
  [9.27, '09.16', 'Açık bırakılan kapı', 64],
  [12.67, '12.40', 'Yemekhane sırası', 19],
  [18.03, '18.02', 'Asansör', 38],
]

function thumbOffice(c: C, x: number, y: number, w: number, h: number, k: number) {
  c.fillStyle = ['#3d4a55', '#5b4a3a', '#2f3b46'][k % 3]
  c.fillRect(x, y, w, h)
  c.fillStyle = 'rgba(255,255,255,0.25)'
  if (k % 3 === 0) {
    // traffic: rows of red tail lights
    for (let i = 0; i < 8; i++) c.fillRect(x + w * (0.1 + (i % 4) * 0.22), y + h * (0.55 + Math.floor(i / 4) * 0.2), w * 0.06, h * 0.05)
  } else if (k % 3 === 1) {
    // the office: desks
    for (let i = 0; i < 4; i++) c.fillRect(x + w * (0.1 + i * 0.22), y + h * 0.6, w * 0.16, h * 0.08)
  } else {
    // a door
    c.fillRect(x + w * 0.38, y + h * 0.15, w * 0.26, h * 0.8)
    c.fillStyle = 'rgba(220,235,240,0.35)'
    c.fillRect(x + w * 0.42, y + h * 0.2, w * 0.18, h * 0.3)
  }
}

/** The three frozen seconds: laughing, pointing the phone, the finger on the lips. */
function still(c: C, x: number, y: number, w: number, h: number, which: 'laugh' | 'money' | 'shh') {
  const g = c.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#d9c8a8')
  g.addColorStop(1, '#8a7a62')
  c.fillStyle = g
  c.fillRect(x, y, w, h)
  // window glow behind
  c.fillStyle = 'rgba(255,240,200,0.6)'
  c.fillRect(x + w * 0.1, y + h * 0.05, w * 0.8, h * 0.35)
  const cx = x + w * 0.5
  const head = which === 'laugh' ? [cx + w * 0.04, y + h * 0.36] : [cx, y + h * 0.4]
  c.fillStyle = '#a9c1dc'
  c.beginPath()
  c.ellipse(cx, y + h * 0.78, w * 0.26, h * 0.3, 0, PI, 0)
  c.fill()
  c.fillStyle = '#d2a184'
  c.beginPath()
  c.ellipse(head[0], head[1], w * 0.12, h * 0.15, which === 'laugh' ? -0.5 : 0, 0, PI * 2)
  c.fill()
  c.fillStyle = '#3a2a22'
  if (which === 'laugh') {
    c.beginPath()
    c.ellipse(head[0] + w * 0.02, head[1] + h * 0.06, w * 0.05, h * 0.035, -0.5, 0, PI * 2)
    c.fill()
  } else {
    c.fillRect(head[0] - w * 0.04, head[1] + h * 0.06, w * 0.08, h * 0.012)
  }
  c.fillStyle = '#d2a184'
  if (which === 'money') {
    c.save()
    c.translate(cx + w * 0.14, y + h * 0.62)
    c.rotate(-0.5)
    c.fillRect(0, -h * 0.03, w * 0.28, h * 0.06)
    c.fillStyle = '#16181b'
    c.fillRect(w * 0.24, -h * 0.07, w * 0.06, h * 0.14)
    c.restore()
  } else if (which === 'shh') {
    c.fillRect(head[0] - w * 0.01, head[1] + h * 0.02, w * 0.025, h * 0.14)
    c.beginPath()
    c.ellipse(head[0], head[1] + h * 0.2, w * 0.06, h * 0.06, 0, 0, PI * 2)
    c.fill()
  }
}

export function prepScreen(c: C, W: number, H: number, s: MapState) {
  c.fillStyle = '#f4fbf9'
  c.fillRect(0, 0, W, H)
  const header = (t: string, col = INK) => {
    logo(c, W * 0.045, H * 0.07, H * 0.035)
    c.fillStyle = col
    sans(c, H * 0.045, 700)
    c.fillText(t, W * 0.075, H * 0.085)
  }
  if (s.kind === 'idle') {
    logo(c, W / 2, H * 0.45, H * 0.16)
    return
  }
  if (s.kind === 'scan') {
    logo(c, W * 0.5 - H * 0.34, H * 0.12, H * 0.045)
    c.fillStyle = INK
    sans(c, H * 0.085, 800)
    c.textAlign = 'center'
    c.fillText('HAFIZA TARANIYOR', W * 0.5 + H * 0.04, H * 0.15)
    c.textAlign = 'left'
    // Thumbnails of his day flickering in and out.
    for (let i = 0; i < 6; i++) {
      const on = Math.sin(s.t * 23 + i * 2.3) > -0.2
      const x = W * (0.08 + (i % 3) * 0.3)
      const y = H * (0.25 + Math.floor(i / 3) * 0.3)
      c.globalAlpha = on ? 0.5 + 0.5 * Math.abs(Math.sin(s.t * 7 + i)) : 0.12
      thumbOffice(c, x, y, W * 0.25, H * 0.26, i + s.thumb)
      c.globalAlpha = 1
    }
    const prog = clamp01(s.p ?? s.t)
    c.fillStyle = '#dbe9e6'
    c.fillRect(W * 0.08, H * 0.88, W * 0.84, H * 0.035)
    c.fillStyle = MINT
    c.fillRect(W * 0.08, H * 0.88, W * 0.84 * prog, H * 0.035)
    c.fillStyle = MINT_DARK
    sans(c, H * 0.05, 700)
    c.textAlign = 'right'
    c.fillText(`%${Math.round(prog * 100)}`, W * 0.92, H * 0.85)
    c.textAlign = 'left'
    return
  }
  if (s.kind === 'uploaded') {
    logo(c, W / 2, H * 0.36, H * 0.14)
    c.fillStyle = MINT_DARK
    sans(c, H * 0.08, 700)
    c.textAlign = 'center'
    c.fillText('YÜKLEME TAMAMLANDI', W / 2, H * 0.68)
    c.fillStyle = '#6a807b'
    sans(c, H * 0.045, 500)
    c.fillText('Bugün · 07.00 – 18.44 · 11 sa 44 dk', W / 2, H * 0.78)
    c.textAlign = 'left'
    return
  }
  if (s.kind === 'copies') {
    header('KOPYA SAYISI')
    const sil = (x: number, fill: number) => {
      c.save()
      c.fillStyle = fill > 0.01 ? `rgba(127,209,193,${0.25 + 0.75 * fill})` : '#c6ccce'
      c.beginPath()
      c.arc(x, H * 0.36, H * 0.09, 0, PI * 2)
      c.fill()
      c.beginPath()
      c.ellipse(x, H * 0.78, H * 0.17, H * 0.28, 0, PI, 0)
      c.fill()
      c.restore()
    }
    const two = clamp01(s.two)
    sil(W * (0.5 - 0.13 * two), s.fill)
    if (two > 0.01) {
      c.globalAlpha = two
      sil(W * (0.5 + 0.13 * two) + (1 - two) * W * 0.2, s.fill)
      c.globalAlpha = 1
    }
    c.fillStyle = INK
    sans(c, H * 0.07, 700)
    const n = two > 0.5 ? '2' : s.fill > 0.5 ? '1' : '?'
    c.fillText(`KOPYA: ${n}`, W * 0.06, H * 0.93)
    if (s.fill < 0.5) {
      c.strokeStyle = MINT_DARK
      c.lineWidth = 5
      c.beginPath()
      c.arc(W * 0.86, H * 0.5, H * 0.08, 0, PI * 2)
      c.stroke()
      c.fillStyle = MINT_DARK
      c.fillRect(W * 0.86 - H * 0.045, H * 0.49, H * 0.09, H * 0.02)
      c.fillRect(W * 0.86 - H * 0.01, H * 0.455, H * 0.02, H * 0.09)
    }
    return
  }
  // The anger map (under the upload notice while the first hours are drawn).
  if (s.uploaded) header('YÜKLEME TAMAMLANDI', MINT_DARK)
  else header('ÖFKE HARİTASI · BUGÜN · 18.44')
  const x0 = W * 0.06
  const x1 = W * 0.96
  const yBase = H * 0.86
  const yTop = H * 0.2
  const hx = (h: number) => x0 + ((h - 7) / 12) * (x1 - x0)
  c.strokeStyle = '#cfdcd9'
  c.lineWidth = 1
  c.fillStyle = '#8aa19c'
  sans(c, H * 0.032, 500)
  for (let h = 7; h <= 19; h++) {
    const x = hx(h)
    c.beginPath()
    c.moveTo(x, yTop - H * 0.02)
    c.lineTo(x, yBase)
    c.stroke()
    c.fillText(String(h).padStart(2, '0'), x - H * 0.02, yBase + H * 0.05)
  }
  const level = (h: number) => {
    let v = 6 + 4 * Math.sin(h * 3.1) + 3 * Math.sin(h * 7.3)
    for (const [ph, , , pct] of PEAKS) v = Math.max(v, pct * Math.exp(-((h - ph) ** 2) / (pct > 90 ? 0.004 : 0.012)))
    return v
  }
  const drawTo = 7 + 12 * clamp01(s.draw)
  c.save()
  c.beginPath()
  c.moveTo(x0, yBase)
  for (let h = 7; h <= drawTo; h += 0.01) c.lineTo(hx(h), yBase - (level(h) / 100) * (yBase - yTop))
  c.lineTo(hx(drawTo), yBase)
  c.closePath()
  const fill = c.createLinearGradient(0, yTop, 0, yBase)
  fill.addColorStop(0, 'rgba(232,96,58,0.85)')
  fill.addColorStop(0.45, 'rgba(127,209,193,0.75)')
  fill.addColorStop(1, 'rgba(127,209,193,0.25)')
  c.fillStyle = fill
  c.fill()
  c.strokeStyle = MINT_DARK
  c.lineWidth = 2.5
  c.stroke()
  c.restore()
  // Labels of the peaks drawn so far.
  for (const [ph, t, label, pct] of PEAKS) {
    if (ph > drawTo) continue
    const x = hx(ph)
    const y = yBase - (pct / 100) * (yBase - yTop)
    const big = pct > 90
    c.fillStyle = big ? '#c2452b' : MINT_DARK
    sans(c, H * (big ? 0.042 : 0.03), big ? 800 : 600)
    const lx = big ? x + H * 0.03 : x - H * 0.04
    c.fillText(`${t} ${label} %${pct}`, Math.min(lx, x1 - H * 0.42), Math.max(yTop + H * 0.03, y - H * 0.02))
  }
  // The 09.14 tower opening into three seconds.
  const split = clamp01(s.split)
  if (split > 0.01) {
    c.fillStyle = `rgba(244,251,249,${0.92 * split})`
    c.fillRect(0, H * 0.13, W, H * 0.87)
    const opts = ['laugh', 'money', 'shh'] as const
    const tags = ['09.14.31 · %91', '09.14.38 · %94', '09.14.52 · %97']
    opts.forEach((o, i) => {
      const chosen = s.pick === o
      const grow = chosen ? clamp01(s.picked) : 0
      const dim = s.pick && !chosen ? clamp01(s.picked) : 0
      const w = W * (0.28 + 0.2 * grow)
      const h = w * 0.7
      const cx = W * (0.19 + i * 0.31) + (W * 0.5 - W * (0.19 + i * 0.31)) * grow
      const top = H * (0.24 - 0.06 * grow)
      c.globalAlpha = split * (1 - 0.75 * dim)
      if (!chosen || grow < 0.02 || i >= 0) {
        still(c, cx - w / 2, top, w, h, o)
        c.strokeStyle = chosen ? MINT : '#c2452b'
        c.lineWidth = chosen ? 6 : 2
        c.strokeRect(cx - w / 2, top, w, h)
        c.fillStyle = '#c2452b'
        sans(c, H * 0.04, 700)
        c.textAlign = 'center'
        c.fillText(tags[i], cx, top + h + H * 0.06)
        c.textAlign = 'left'
      }
      if (chosen && grow > 0.3) {
        c.fillStyle = MINT
        c.beginPath()
        c.arc(cx + w / 2 - H * 0.05, top + H * 0.05, H * 0.04, 0, PI * 2)
        c.fill()
        c.strokeStyle = '#fff'
        c.lineWidth = 4
        c.beginPath()
        c.moveTo(cx + w / 2 - H * 0.07, top + H * 0.05)
        c.lineTo(cx + w / 2 - H * 0.055, top + H * 0.065)
        c.lineTo(cx + w / 2 - H * 0.03, top + H * 0.035)
        c.stroke()
      }
      c.globalAlpha = 1
    })
    // Draw the chosen one last so it sits on top.
    if (s.pick) {
      const i = opts.indexOf(s.pick)
      const grow = clamp01(s.picked)
      if (grow > 0.02) {
        const w = W * (0.28 + 0.2 * grow)
        const h = w * 0.7
        const cx = W * (0.19 + i * 0.31) + (W * 0.5 - W * (0.19 + i * 0.31)) * grow
        const top = H * (0.24 - 0.06 * grow)
        still(c, cx - w / 2, top, w, h, s.pick)
        c.strokeStyle = MINT
        c.lineWidth = 6
        c.strokeRect(cx - w / 2, top, w, h)
      }
    }
  }
}

/** The explainer on the locker-room screen: NASIL ÇALIŞIR? in nine steps. */
export function explainer(c: C, W: number, H: number, step: number, t: number, two: boolean) {
  c.fillStyle = '#f4fbf9'
  c.fillRect(0, 0, W, H)
  const ink = INK
  const pict = (fn: () => void) => {
    c.save()
    c.strokeStyle = ink
    c.fillStyle = MINT
    c.lineWidth = H * 0.012
    c.lineCap = 'round'
    c.lineJoin = 'round'
    fn()
    c.restore()
  }
  const caption = (n: number, line: string) => {
    c.fillStyle = MINT_DARK
    sans(c, H * 0.045, 700)
    c.fillText(`${n} / 9`, W * 0.06, H * 0.12)
    c.fillStyle = ink
    sans(c, H * 0.06, 700)
    c.fillText(line, W * 0.06, H * 0.21)
  }
  const person = (x: number, y: number, s: number, fill = MINT) => {
    c.fillStyle = fill
    c.beginPath()
    c.arc(x, y - s * 0.55, s * 0.22, 0, PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(x, y + s * 0.15, s * 0.36, s * 0.5, 0, PI, 0)
    c.fill()
  }
  const cx = W * 0.5
  const cy = H * 0.62
  const ph = clamp01(t)
  if (step <= 0) {
    logo(c, cx, H * 0.42, H * 0.17)
    c.fillStyle = ink
    sans(c, H * 0.085, 800)
    c.textAlign = 'center'
    c.fillText('ÖFKE NÖBETİ · NASIL ÇALIŞIR?', cx, H * 0.75)
    c.textAlign = 'left'
  } else if (step === 1) {
    caption(1, 'Anınız kurgulanır.')
    pict(() => {
      // A face outline assembling from pixels + an office.
      const cells = Math.floor(ph * 60)
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * PI * 2
        const x = cx - W * 0.12 + Math.cos(a) * H * 0.17
        const y = cy + Math.sin(a) * H * 0.2
        if (i < cells) c.fillRect(x - 5, y - 5, 10, 10)
      }
      c.strokeRect(cx + W * 0.08, cy - H * 0.15, W * 0.2, H * 0.3)
      c.strokeRect(cx + W * 0.11, cy - H * 0.1, W * 0.06, H * 0.08)
      c.beginPath()
      c.moveTo(cx + W * 0.1, cy + H * 0.08)
      c.lineTo(cx + W * 0.26, cy + H * 0.08)
      c.stroke()
    })
  } else if (step === 2) {
    caption(2, 'Lens + hap = o kişiyi görürsünüz.')
    pict(() => {
      c.beginPath()
      c.ellipse(W * 0.16, cy, W * 0.05, H * 0.06, 0, 0, PI * 2)
      c.stroke()
      c.beginPath()
      c.arc(W * 0.16, cy, H * 0.025, 0, PI * 2)
      c.fill()
      c.beginPath()
      c.arc(W * 0.3, cy, H * 0.06, 0, PI * 2)
      c.stroke()
      c.beginPath()
      c.ellipse(W * 0.43, cy, W * 0.03, H * 0.022, 0.5, 0, PI * 2)
      c.fill()
      c.stroke()
      c.beginPath()
      c.moveTo(W * 0.5, cy)
      c.lineTo(W * 0.58, cy)
      c.stroke()
      person(W * 0.75, cy + H * 0.12, H * 0.35, '#c6ccce')
      // The generic angry boss face on it.
      c.fillStyle = '#e9b48f'
      c.beginPath()
      c.arc(W * 0.75, cy + H * 0.12 - H * 0.35 * 0.55, H * 0.35 * 0.22, 0, PI * 2)
      c.fill()
      c.strokeStyle = ink
      c.beginPath()
      c.moveTo(W * 0.73, cy - H * 0.1)
      c.lineTo(W * 0.745, cy - H * 0.09)
      c.moveTo(W * 0.77, cy - H * 0.1)
      c.lineTo(W * 0.755, cy - H * 0.09)
      c.moveTo(W * 0.735, cy - H * 0.04)
      c.quadraticCurveTo(W * 0.75, cy - H * 0.06, W * 0.765, cy - H * 0.04)
      c.stroke()
      c.fillStyle = '#c2452b'
      c.fillRect(W * 0.746, cy - H * 0.02, W * 0.008, H * 0.12)
    })
  } else if (step === 3) {
    caption(3, 'Odadaki kişi: idamı kesinleşmiş hükümlü.')
    pict(() => {
      const peel = ph
      person(cx, cy + H * 0.2, H * 0.5, '#9aa3a6')
      // The neck band.
      c.fillStyle = '#ffffff'
      c.fillRect(cx - H * 0.06, cy - H * 0.1, H * 0.12, H * 0.03)
      c.fillStyle = ink
      sans(c, H * 0.022, 700)
      c.fillText('###', cx - H * 0.025, cy - H * 0.078)
      // The sticker face peeling off.
      c.save()
      c.translate(cx + H * 0.11, cy - H * 0.27)
      c.rotate(-peel * 1.4)
      c.translate(-H * 0.11 + peel * H * 0.2, peel * H * 0.12)
      c.globalAlpha = 1 - 0.3 * peel
      c.fillStyle = '#e9b48f'
      c.beginPath()
      c.arc(0, 0, H * 0.11, 0, PI * 2)
      c.fill()
      c.strokeStyle = ink
      c.beginPath()
      c.moveTo(-H * 0.05, -H * 0.02)
      c.lineTo(-H * 0.02, -H * 0.01)
      c.moveTo(H * 0.05, -H * 0.02)
      c.lineTo(H * 0.02, -H * 0.01)
      c.moveTo(-H * 0.04, H * 0.05)
      c.quadraticCurveTo(0, H * 0.02, H * 0.04, H * 0.05)
      c.stroke()
      c.restore()
      if (ph > 0.55) {
        c.save()
        c.translate(cx + W * 0.2, cy + H * 0.05)
        c.rotate(-0.15)
        c.strokeStyle = '#c2452b'
        c.lineWidth = 6
        c.strokeRect(-W * 0.14, -H * 0.06, W * 0.28, H * 0.12)
        c.fillStyle = '#c2452b'
        sans(c, H * 0.045, 800)
        c.textAlign = 'center'
        c.fillText('İDAMI KESİNLEŞMİŞ', 0, H * 0.016)
        c.restore()
      }
    })
  } else if (step === 4) {
    caption(4, 'İsteğe göre kopya.')
    pict(() => {
      for (const [k, n] of [
        [0, 1],
        [1, 2],
      ] as const) {
        const bx = W * (0.3 + k * 0.38)
        for (let i = 0; i < n; i++) person(bx + (i - (n - 1) / 2) * H * 0.2, cy + H * 0.12, H * 0.32)
        c.fillStyle = ink
        sans(c, H * 0.07, 800)
        c.fillText(`×${n}`, bx - H * 0.04, cy + H * 0.3)
        const ticked = (n === 2) === two
        c.strokeStyle = ticked ? MINT_DARK : '#c6ccce'
        c.lineWidth = 6
        c.strokeRect(bx - H * 0.22, cy - H * 0.3, H * 0.44, H * 0.66)
        if (ticked && ph > 0.3) {
          c.beginPath()
          c.moveTo(bx + H * 0.12, cy - H * 0.22)
          c.lineTo(bx + H * 0.16, cy - H * 0.17)
          c.lineTo(bx + H * 0.24, cy - H * 0.28)
          c.stroke()
        }
      }
    })
  } else if (step === 5) {
    caption(5, 'AN TEKRAR')
    pict(() => {
      c.beginPath()
      c.arc(cx, cy, H * 0.17, 0, PI * 2)
      c.stroke()
      // 09.14 on the face.
      c.beginPath()
      c.moveTo(cx, cy)
      c.lineTo(cx + Math.cos(-PI / 2 + (9.23 / 12) * PI * 2) * H * 0.09, cy + Math.sin(-PI / 2 + (9.23 / 12) * PI * 2) * H * 0.09)
      c.moveTo(cx, cy)
      c.lineTo(cx + Math.cos(-PI / 2 + (14 / 60) * PI * 2) * H * 0.14, cy + Math.sin(-PI / 2 + (14 / 60) * PI * 2) * H * 0.14)
      c.stroke()
      c.strokeStyle = MINT_DARK
      c.lineWidth = H * 0.018
      const a0 = -PI / 2 + ph * PI * 4
      c.beginPath()
      c.arc(cx, cy, H * 0.25, a0, a0 + PI * 1.6)
      c.stroke()
      const ax = cx + Math.cos(a0 + PI * 1.6) * H * 0.25
      const ay = cy + Math.sin(a0 + PI * 1.6) * H * 0.25
      c.beginPath()
      c.arc(ax, ay, H * 0.025, 0, PI * 2)
      c.fillStyle = MINT_DARK
      c.fill()
      c.fillStyle = ink
      sans(c, H * 0.06, 800)
      c.fillText('09.14', cx + H * 0.32, cy + H * 0.02)
    })
  } else if (step === 6) {
    caption(6, 'Siz öyle yaşadığınızı sanarsınız.')
    pict(() => {
      c.fillStyle = '#c6ccce'
      c.beginPath()
      c.arc(cx, cy - H * 0.02, H * 0.16, 0, PI * 2)
      c.fill()
      c.fillRect(cx - H * 0.08, cy + H * 0.1, H * 0.16, H * 0.14)
      c.strokeStyle = MINT_DARK
      for (let k = 0; k < 3; k++) {
        c.beginPath()
        const r = H * (0.05 + k * 0.035)
        c.arc(cx, cy - H * 0.04, r, ph * PI * 4 + k, ph * PI * 4 + k + PI * 1.3)
        c.stroke()
      }
    })
  } else if (step === 7) {
    caption(7, 'SÖYLE · YAP')
    pict(() => {
      // a mouth, a fist, both ticked
      c.beginPath()
      c.ellipse(W * 0.32, cy, W * 0.08, H * 0.06, 0, 0, PI * 2)
      c.stroke()
      c.beginPath()
      c.moveTo(W * 0.25, cy)
      c.lineTo(W * 0.39, cy)
      c.stroke()
      c.fillStyle = MINT
      round(c, W * 0.58, cy - H * 0.1, W * 0.12, H * 0.2, H * 0.04)
      c.fill()
      c.stroke()
      for (let i = 0; i < 4; i++) {
        c.beginPath()
        c.moveTo(W * (0.6 + i * 0.027), cy - H * 0.1)
        c.lineTo(W * (0.6 + i * 0.027), cy - H * 0.02)
        c.stroke()
      }
      c.strokeStyle = MINT_DARK
      c.lineWidth = 8
      for (const x of [0.44, 0.75]) {
        c.beginPath()
        c.moveTo(W * x, cy - H * 0.02)
        c.lineTo(W * x + H * 0.04, cy + H * 0.03)
        c.lineTo(W * x + H * 0.12, cy - H * 0.08)
        c.stroke()
      }
      c.fillStyle = ink
      sans(c, H * 0.06, 800)
      c.fillText('SÖYLE', W * 0.27, cy + H * 0.2)
      c.fillText('YAP', W * 0.6, cy + H * 0.2)
    })
  } else if (step === 8) {
    caption(8, 'SINIR YOK')
    pict(() => {
      // The frame around the pictograms breaking open and dissolving.
      const k = ph
      c.strokeStyle = ink
      const parts = 16
      for (let i = 0; i < parts; i++) {
        const a = (i / parts) * PI * 2
        const r = H * 0.22 + k * H * 0.25 * ((i * 7) % 5) * 0.25
        const x = cx + Math.cos(a) * r * 1.6
        const y = cy + Math.sin(a) * r
        c.globalAlpha = 1 - k * 0.85
        c.save()
        c.translate(x, y)
        c.rotate(a + PI / 2 + k * (i % 3 - 1))
        c.beginPath()
        c.moveTo(-H * 0.05, 0)
        c.lineTo(H * 0.05, 0)
        c.stroke()
        c.restore()
      }
      c.globalAlpha = 1
      c.fillStyle = ink
      sans(c, H * 0.12, 900)
      c.textAlign = 'center'
      c.fillText('SINIR YOK', cx, cy + H * 0.04)
      c.textAlign = 'left'
    })
  } else {
    caption(9, 'STRES: %0')
    pict(() => {
      c.strokeStyle = MINT_DARK
      c.lineWidth = 10
      c.beginPath()
      c.arc(W * 0.3, cy, H * 0.15, 0, PI * 2)
      c.stroke()
      c.beginPath()
      c.moveTo(W * 0.3 - H * 0.07, cy)
      c.lineTo(W * 0.3 - H * 0.01, cy + H * 0.06)
      c.lineTo(W * 0.3 + H * 0.08, cy - H * 0.06)
      c.stroke()
      // The stress meter falling red → green.
      const v = 1 - ph
      const mx = W * 0.55
      const mw = W * 0.36
      c.fillStyle = '#dfe6e4'
      c.fillRect(mx, cy - H * 0.04, mw, H * 0.08)
      c.fillStyle = v > 0.5 ? '#c2452b' : v > 0.15 ? '#e8a040' : '#3fa66b'
      c.fillRect(mx, cy - H * 0.04, mw * Math.max(0.01, v), H * 0.08)
      c.fillStyle = ink
      sans(c, H * 0.06, 800)
      c.fillText(`STRES: %${Math.round(v * 100)}`, mx, cy + H * 0.16)
    })
  }
  // The fine print, always there at the bottom edge.
  c.fillStyle = '#8a9a97'
  sans(c, H * 0.026, 400)
  c.fillText('Hükümlüler infaz sırasına göre atanır. Hükümlünün kimliği kullanıcıyla paylaşılmaz.', W * 0.06, H * 0.965)
  // Progress dots.
  for (let i = 1; i <= 9; i++) {
    c.fillStyle = i <= step ? MINT_DARK : '#cfdcd9'
    c.beginPath()
    c.arc(W * (0.7 + i * 0.028), H * 0.1, H * 0.012, 0, PI * 2)
    c.fill()
  }
}

export function lockerLabel(c: C, W: number, H: number, n: number) {
  c.fillStyle = '#e9edee'
  c.fillRect(0, 0, W, H)
  c.fillStyle = INK
  sans(c, H * 0.6, 700)
  c.textAlign = 'center'
  c.fillText(String(n), W / 2, H * 0.74)
  c.textAlign = 'left'
}

/** The plate over ODA 3's door: amber while in use, green and HAZIR when ready. */
export function roomPlate(c: C, W: number, H: number, ready: number) {
  c.fillStyle = '#f2f5f4'
  c.fillRect(0, 0, W, H)
  c.fillStyle = INK
  sans(c, H * 0.42, 800)
  c.fillText('ODA 3', W * 0.06, H * 0.62)
  const on = ready > 0.5
  c.fillStyle = on ? '#2fbf71' : '#e8a040'
  c.beginPath()
  c.arc(W * 0.62, H * 0.47, H * 0.2, 0, PI * 2)
  c.fill()
  c.fillStyle = on ? '#1f8a4c' : '#9a6a20'
  sans(c, H * 0.3, 800)
  c.fillText(on ? 'HAZIR' : 'DOLU', W * 0.7, H * 0.58)
}

export function plateText(c: C, W: number, H: number, text: string) {
  c.fillStyle = '#f2f5f4'
  c.fillRect(0, 0, W, H)
  c.fillStyle = INK
  sans(c, H * 0.5, 800)
  c.textAlign = 'center'
  c.fillText(text, W / 2, H * 0.68)
  c.textAlign = 'left'
}

export function cleaningLog(c: C, W: number, H: number) {
  c.fillStyle = '#f4f2ea'
  c.fillRect(0, 0, W, H)
  c.fillStyle = INK
  sans(c, H * 0.05, 800)
  c.fillText('TEMİZLİK ÇİZELGESİ · ODA 3', W * 0.06, H * 0.08)
  mono(c, H * 0.036, 500)
  const rows = ['09.40  ✓  11 dk', '11.05  ✓  13 dk', '12.30  ✓  12 dk', '14.10  ✓  10 dk', '15.45  ✓  14 dk', '17.20  ✓  12 dk', '19.15  ·  7. kullanım']
  rows.forEach((r, i) => {
    c.fillStyle = i === rows.length - 1 ? '#2b3a8a' : '#444'
    c.fillText(r, W * 0.08, H * (0.18 + i * 0.09))
  })
  c.fillStyle = '#666'
  sans(c, H * 0.035, 500)
  c.fillText('Ortalama süre: 12 dk', W * 0.08, H * 0.86)
}

// ——— The line ———

export function vanSide(c: C, W: number, H: number) {
  c.clearRect(0, 0, W, H)
  c.fillStyle = '#2a4f9a'
  c.fillRect(0, H * 0.45, W, H * 0.12)
  c.fillStyle = '#1d2a44'
  sans(c, H * 0.22, 800)
  c.fillText('SEVK ARACI', W * 0.06, H * 0.36)
  sans(c, H * 0.1, 600)
  c.fillText('T.C. ADALET BAKANLIĞI · 06 TR 3330', W * 0.06, H * 0.82)
}

export function manifest(c: C, W: number, H: number) {
  c.fillStyle = '#f2efe6'
  c.fillRect(0, 0, W, H)
  c.fillStyle = INK
  sans(c, H * 0.055, 800)
  c.fillText('SEVK LİSTESİ · 18.21', W * 0.06, H * 0.09)
  mono(c, H * 0.05, 600)
  const rows: Array<[string, boolean]> = [
    ['331', true],
    ['332', true],
    ['333', false],
    ['334', false],
  ]
  rows.forEach(([n, ok], i) => {
    const y = H * (0.22 + i * 0.13)
    c.fillStyle = '#333'
    c.fillText(n, W * 0.1, y)
    c.fillText(ok ? '✓' : '·', W * 0.34, y)
  })
  // Handwritten next to 333.
  c.strokeStyle = '#2b3a8a'
  c.fillStyle = '#2b3a8a'
  c.lineWidth = 3
  sans(c, H * 0.06, 500)
  c.save()
  c.translate(W * 0.48, H * 0.48)
  c.rotate(-0.06)
  c.fillText('ODA 3', 0, 0)
  c.restore()
  c.beginPath()
  c.moveTo(W * 0.46, H * 0.5)
  c.lineTo(W * 0.78, H * 0.49)
  c.stroke()
}

export function startLamp(c: C, W: number, H: number, on: boolean) {
  c.fillStyle = '#121416'
  c.fillRect(0, 0, W, H)
  c.fillStyle = on ? '#3fe07f' : '#1c3a26'
  c.beginPath()
  c.arc(W * 0.22, H / 2, H * 0.32, 0, PI * 2)
  c.fill()
  c.fillStyle = on ? '#c8f5d8' : '#4a5a50'
  sans(c, H * 0.45, 800)
  c.fillText('BAŞLA', W * 0.42, H * 0.66)
}

const CASE = [
  'DOSYA NO 2019/4417 · HÜKÜMLÜ 333',
  'SUÇ: NİTELİKLİ CİNSEL SALDIRI · KASTEN ÖLDÜRME',
  'OLAY TARİHİ: 14.03.2019 · SAAT 23.40',
  'TANIK İFADESİ 1 · TANIK İFADESİ 2 · ADLİ TIP RAPORU',
  'YARGITAY KARARI: ONANMASINA',
  'İDAM CEZASININ İNFAZINA',
  'İTİRAZ: REDDEDİLDİ · 02.09.2026',
  'İNFAZ YERİ: ÖFKE NÖBETİ · ODA 3',
]

/** One of the twelve screens of the reading room. */
export function readingScreen(c: C, W: number, H: number, i: number, t: number, amp: number) {
  c.fillStyle = '#0b141b'
  c.fillRect(0, 0, W, H)
  const kind = i % 4
  if (i === 5 || i === 6) {
    // The centre: the number and the stamp.
    c.fillStyle = '#d9dee2'
    sans(c, H * 0.42, 800)
    c.textAlign = 'center'
    c.fillText('333', W / 2, H * 0.5)
    c.save()
    c.translate(W / 2, H * 0.76)
    c.rotate(-0.08)
    c.strokeStyle = '#b8322a'
    c.lineWidth = H * 0.025
    c.strokeRect(-W * 0.42, -H * 0.1, W * 0.84, H * 0.2)
    c.fillStyle = '#c23a2e'
    sans(c, H * 0.1, 900)
    c.fillText('İDAMI KESİNLEŞMİŞTİR', 0, H * 0.035)
    c.restore()
    c.textAlign = 'left'
    return
  }
  if (kind === 3 || i === 9 || i === 10) {
    // Waveform bars of the reading voice.
    const n = 28
    for (let k = 0; k < n; k++) {
      const v = amp * (0.25 + 0.75 * Math.abs(Math.sin(t * 9 + k * 0.7 + i) * Math.sin(t * 3.1 + k * 0.23)))
      c.fillStyle = '#9fb3bc'
      const h = H * 0.7 * v + H * 0.02
      c.fillRect(W * (0.06 + (k / n) * 0.88), H / 2 - h / 2, W * 0.018, h)
    }
    return
  }
  // Scrolling case-file text.
  c.fillStyle = '#d4dde2'
  mono(c, H * 0.1, 700)
  const off = (t * 0.35 + i * 0.37) % 1
  for (let r = -1; r < 9; r++) {
    const line = CASE[(r + i * 3 + Math.floor(t * 0.35 + i * 0.37) + 64) % CASE.length]
    c.fillText(line, W * 0.04, H * (0.14 + (r - off) * 0.125))
  }
  c.fillStyle = 'rgba(5,7,10,0.85)'
  c.fillRect(0, 0, W, H * 0.06)
  c.fillStyle = '#e8a040'
  mono(c, H * 0.05, 700)
  c.fillText(`333 · ${String(i + 1).padStart(2, '0')}`, W * 0.04, H * 0.045)
}
