/**
 * What the cafe's screens show, drawn on canvases: the child's game with its
 * amber countdown in the corner, the lock screen everyone gets in the end,
 * the adults' screens with a dash where the number should be, a tavla board,
 * a solitaire, the scoreboard, the cashier's list of desks.
 *
 * Each desk with a story to tell owns a `Surface` (one canvas per era: 4:3 for
 * the old CRTs, 16:10 for the flat panels) redrawn only when its state key
 * changes; the crowd shares a few static pictures.
 */
import * as THREE from 'three'
import { mono, sans } from '../screens'
import { mmss } from '@/stories/yasamak/timeline'

export type Era = 'kid' | 'adult'
type Ctx = CanvasRenderingContext2D
export type Draw = (c: Ctx, W: number, H: number) => void

export const AMBER = '#ffc77f'
export const LOCK_BLUE = '#2e4a6b'

/** Where the corner readout sits on a screen, as fractions of its width/height from the top-left. */
export const CORNER_UV = { x: 0.835, y: 0.84 }

/** The readout: "KALAN SÜRE" over the value, lower right. `quiet` draws it small and dim (the dark open). */
export function corner(c: Ctx, W: number, H: number, value: string, opts: { quiet?: boolean; panel?: string } = {}) {
  const s = W / 1024
  const cx = W * CORNER_UV.x
  const cy = H * CORNER_UV.y
  const bw = 250 * s
  const bh = 112 * s
  c.fillStyle = opts.panel ?? 'rgba(8,10,14,0.82)'
  c.fillRect(cx - bw / 2, cy - bh / 2, bw, bh)
  c.strokeStyle = opts.quiet ? 'rgba(255,199,127,0.12)' : 'rgba(255,199,127,0.35)'
  c.lineWidth = 2 * s
  c.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh)
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'
  c.globalAlpha = opts.quiet ? 0.45 : 1
  c.fillStyle = '#b58a55'
  mono(c, Math.round(19 * s), 600)
  c.letterSpacing = `${3 * s}px`
  c.fillText('KALAN SÜRE', cx, cy - bh / 2 + 30 * s)
  c.letterSpacing = '0px'
  c.fillStyle = AMBER
  mono(c, Math.round((value.length > 2 ? 58 : 64) * s), 600)
  c.fillText(value, cx, cy + bh / 2 - 22 * s)
  c.globalAlpha = 1
  c.textAlign = 'left'
}

const rnd = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ——— Child era (CRT, 4:3) ———

/** A game menu: tiles, a title bar, the hour waiting in the corner. */
export function kidMenu(seconds: number): Draw {
  return (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#13305c')
    g.addColorStop(1, '#0a1730')
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#f2e6c9'
    sans(c, Math.round(W * 0.05), 700)
    c.fillText('OYUNLAR', W * 0.06, H * 0.12)
    const cols = ['#c9492f', '#3f8f4f', '#d9a33a', '#5a6fc4', '#9a4fb0', '#2f9aa0']
    for (let i = 0; i < 6; i++) {
      const x = W * 0.06 + (i % 3) * W * 0.21
      const y = H * 0.2 + Math.floor(i / 3) * H * 0.27
      c.fillStyle = cols[i]
      c.fillRect(x, y, W * 0.18, H * 0.22)
      c.fillStyle = 'rgba(255,255,255,0.25)'
      c.fillRect(x + 8, y + 8, W * 0.18 - 16, H * 0.06)
    }
    corner(c, W, H, mmss(seconds))
  }
}

/** The boys' game: a top-down arena of two little ships and their shots. `seed` varies the moment. */
export function kidGame(seconds: number, seed: number, hue: 'blue' | 'red', burst = 0): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    const bg = c.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, hue === 'blue' ? '#0b1f3a' : '#2a0f12')
    bg.addColorStop(1, hue === 'blue' ? '#123d4a' : '#3d1d10')
    c.fillStyle = bg
    c.fillRect(0, 0, W, H)
    // Stars and a grid floor.
    c.fillStyle = 'rgba(255,255,255,0.6)'
    for (let i = 0; i < 70; i++) c.fillRect(r() * W, r() * H * 0.7, 2, 2)
    c.strokeStyle = hue === 'blue' ? 'rgba(80,220,255,0.25)' : 'rgba(255,140,60,0.25)'
    c.lineWidth = 2
    for (let i = 0; i <= 10; i++) {
      c.beginPath()
      c.moveTo(W / 2 + (i - 5) * W * 0.02, H * 0.55)
      c.lineTo(W / 2 + (i - 5) * W * 0.18, H)
      c.stroke()
    }
    for (let i = 0; i < 6; i++) {
      const y = H * 0.55 + Math.pow(i / 6, 1.8) * H * 0.45
      c.beginPath()
      c.moveTo(0, y)
      c.lineTo(W, y)
      c.stroke()
    }
    // Enemies, shots, the player.
    for (let i = 0; i < 7; i++) {
      c.fillStyle = ['#ff5a4a', '#ffd23a', '#7dff6a'][i % 3]
      const x = W * (0.12 + r() * 0.76)
      const y = H * (0.12 + r() * 0.35)
      c.fillRect(x - 14, y - 10, 28, 20)
      c.fillRect(x - 22, y - 2, 44, 6)
    }
    c.fillStyle = '#ffffff'
    for (let i = 0; i < 9; i++) c.fillRect(W * (0.3 + r() * 0.4), H * (0.25 + r() * 0.45), 4, 16)
    c.fillStyle = hue === 'blue' ? '#59d8ff' : '#ff9a3a'
    const px = W * (0.35 + r() * 0.3)
    c.beginPath()
    c.moveTo(px, H * 0.74)
    c.lineTo(px - 34, H * 0.84)
    c.lineTo(px + 34, H * 0.84)
    c.closePath()
    c.fill()
    // Score bar.
    c.fillStyle = 'rgba(0,0,0,0.5)'
    c.fillRect(0, 0, W, H * 0.08)
    c.fillStyle = '#f5f0e0'
    mono(c, Math.round(H * 0.05), 600)
    c.fillText(`SKOR ${String(1200 + Math.floor(r() * 30000)).padStart(6, '0')}`, W * 0.04, H * 0.06)
    if (burst > 0) {
      c.fillStyle = `rgba(255,240,200,${0.7 * burst})`
      c.fillRect(0, 0, W, H)
      c.fillStyle = `rgba(40,20,0,${burst})`
      sans(c, Math.round(H * 0.12), 800)
      c.textAlign = 'center'
      c.fillText('BAŞLA!', W / 2, H * 0.48)
      c.textAlign = 'left'
    }
    corner(c, W, H, mmss(seconds))
  }
}

/** Everyone's last screen: flat dusty blue, white type. */
export function lockScreen(desk: number): Draw {
  return (c, W, H) => {
    c.fillStyle = LOCK_BLUE
    c.fillRect(0, 0, W, H)
    c.fillStyle = 'rgba(255,255,255,0.1)'
    c.fillRect(0, H * 0.62, W, 2)
    c.fillStyle = '#ffffff'
    c.textAlign = 'center'
    sans(c, Math.round(W * 0.062), 700)
    c.letterSpacing = `${W * 0.004}px`
    c.fillText('SÜRENİZ DOLMUŞTUR', W / 2, H * 0.52)
    c.letterSpacing = '0px'
    c.fillStyle = 'rgba(255,255,255,0.6)'
    mono(c, Math.round(W * 0.022), 500)
    c.fillText(`MASA ${desk}`, W / 2, H * 0.7)
    c.textAlign = 'left'
  }
}

/** Static pictures for the teenagers in the child era (a game each, their own minutes). */
export function teenScreen(i: number): Draw {
  return kidGame(600 + i * 517, 40 + i, i % 2 ? 'red' : 'blue')
}

// ——— Adult era (flat panels, 16:10) ———

function wallpaper(c: Ctx, W: number, H: number, a: string, b: string) {
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
}

function taskbar(c: Ctx, W: number, H: number) {
  c.fillStyle = 'rgba(10,12,16,0.85)'
  c.fillRect(0, H - H * 0.055, W, H * 0.055)
  c.fillStyle = 'rgba(255,255,255,0.35)'
  for (let i = 0; i < 6; i++) c.fillRect(W * 0.02 + i * W * 0.035, H - H * 0.042, W * 0.022, H * 0.03)
}

/** A quiet desktop in the dark: a few icons, the dash small in the corner. */
export function desktop(): Draw {
  return (c, W, H) => {
    wallpaper(c, W, H, '#16243a', '#0b1220')
    c.fillStyle = 'rgba(255,255,255,0.18)'
    for (let i = 0; i < 5; i++) c.fillRect(W * 0.03, H * 0.06 + i * H * 0.13, W * 0.045, H * 0.07)
    taskbar(c, W, H)
    corner(c, W, H, '—', { quiet: true })
  }
}

/** His last game: a road through hills at dusk, a car, a lap counter. */
export function roadGame(seed: number): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    const sky = c.createLinearGradient(0, 0, 0, H * 0.5)
    sky.addColorStop(0, '#2c3e66')
    sky.addColorStop(1, '#d98a5a')
    c.fillStyle = sky
    c.fillRect(0, 0, W, H * 0.5)
    c.fillStyle = '#3b4a3a'
    c.beginPath()
    c.moveTo(0, H * 0.5)
    for (let x = 0; x <= W; x += W / 12) c.lineTo(x, H * (0.38 + r() * 0.1))
    c.lineTo(W, H * 0.5)
    c.fill()
    c.fillStyle = '#2a3326'
    c.fillRect(0, H * 0.5, W, H * 0.5)
    c.fillStyle = '#4a4a50'
    c.beginPath()
    c.moveTo(W * 0.47, H * 0.5)
    c.lineTo(W * 0.53, H * 0.5)
    c.lineTo(W * 0.85, H)
    c.lineTo(W * 0.15, H)
    c.fill()
    c.fillStyle = '#e8e2c8'
    for (let i = 0; i < 6; i++) {
      const t = (i + r() * 0.5) / 6
      c.fillRect(W * 0.5 - 3 - t * 8, H * (0.5 + t * 0.5), 6 + t * 16, H * 0.03 * (0.3 + t))
    }
    c.fillStyle = '#b8352b'
    c.fillRect(W * 0.43, H * 0.74, W * 0.14, H * 0.1)
    c.fillStyle = '#1a1a1e'
    c.fillRect(W * 0.45, H * 0.7, W * 0.1, H * 0.05)
    c.fillStyle = 'rgba(0,0,0,0.45)'
    c.fillRect(W * 0.02, H * 0.04, W * 0.2, H * 0.1)
    c.fillStyle = '#f2ead0'
    mono(c, Math.round(H * 0.045), 600)
    c.fillText(`TUR 3/5   ${Math.floor(120 + r() * 80)} km/s`, W * 0.03, H * 0.105)
    corner(c, W, H, '—')
  }
}

/** Dede's tavla: the board, checkers, two dice. */
export function tavla(seed: number): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    wallpaper(c, W, H, '#1d2a22', '#101712')
    const bx = W * 0.08
    const by = H * 0.08
    const bw = W * 0.64
    const bh = H * 0.84
    c.fillStyle = '#5a3a20'
    c.fillRect(bx - 12, by - 12, bw + 24, bh + 24)
    c.fillStyle = '#d9c39a'
    c.fillRect(bx, by, bw, bh)
    c.fillStyle = '#5a3a20'
    c.fillRect(bx + bw / 2 - 8, by, 16, bh)
    const pw = bw / 13
    for (let i = 0; i < 12; i++) {
      const x = bx + (i < 6 ? i : i + 1) * pw
      for (const top of [true, false]) {
        c.fillStyle = (i + (top ? 0 : 1)) % 2 ? '#8c2a1e' : '#2a3c4a'
        c.beginPath()
        c.moveTo(x + 2, top ? by : by + bh)
        c.lineTo(x + pw - 2, top ? by : by + bh)
        c.lineTo(x + pw / 2, top ? by + bh * 0.4 : by + bh * 0.6)
        c.fill()
        const n = Math.floor(r() * 4)
        for (let k = 0; k < n; k++) {
          c.fillStyle = r() < 0.5 ? '#f3efe4' : '#1b1612'
          c.beginPath()
          c.arc(x + pw / 2, top ? by + pw * 0.5 + k * pw * 0.9 : by + bh - pw * 0.5 - k * pw * 0.9, pw * 0.42, 0, Math.PI * 2)
          c.fill()
        }
      }
    }
    for (let d = 0; d < 2; d++) {
      const dx = bx + bw * 0.62 + d * 70
      c.fillStyle = '#fbf7ee'
      c.fillRect(dx, by + bh / 2 - 28, 56, 56)
      c.fillStyle = '#111'
      const pips = 1 + Math.floor(r() * 6)
      for (let k = 0; k < pips; k++) c.fillRect(dx + 10 + (k % 3) * 15, by + bh / 2 - 18 + Math.floor(k / 3) * 22, 8, 8)
    }
    c.fillStyle = '#e8dcc0'
    sans(c, Math.round(H * 0.045), 600)
    c.fillText('HASAN  5', W * 0.76, H * 0.16)
    c.fillText('RAKİP  3', W * 0.76, H * 0.25)
    corner(c, W, H, '—')
  }
}

/** Baba's reading: a news page, columns of text, a photo. */
export function news(scroll: number): Draw {
  return (c, W, H) => {
    c.fillStyle = '#eceae4'
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#7a1f1f'
    c.fillRect(0, 0, W, H * 0.09)
    c.fillStyle = '#ffffff'
    sans(c, Math.round(H * 0.05), 700)
    c.fillText('GÜNDEM', W * 0.03, H * 0.065)
    const off = (scroll % 1) * H * 0.4
    c.fillStyle = '#1a1a1a'
    sans(c, Math.round(H * 0.06), 700)
    c.fillText('Kış erken geldi', W * 0.05, H * 0.2 - off)
    c.fillStyle = '#8a9298'
    c.fillRect(W * 0.05, H * 0.25 - off, W * 0.42, H * 0.3)
    c.fillStyle = '#4a4a4a'
    for (let i = 0; i < 22; i++) c.fillRect(W * (i < 9 ? 0.5 : 0.05), H * (0.27 + (i < 9 ? i : i - 9 + 8) * 0.045) - off, W * (0.4 - (i % 4) * 0.03), H * 0.016)
    corner(c, W, H, '—')
  }
}

/** Emre's screen: a football match, green pitch, little players. */
export function football(seed: number): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    c.fillStyle = '#2f7a3a'
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#358542'
    for (let i = 0; i < 8; i += 2) c.fillRect((i * W) / 8, 0, W / 8, H)
    c.strokeStyle = 'rgba(255,255,255,0.7)'
    c.lineWidth = 4
    c.strokeRect(W * 0.04, H * 0.08, W * 0.92, H * 0.84)
    c.beginPath()
    c.moveTo(W / 2, H * 0.08)
    c.lineTo(W / 2, H * 0.92)
    c.stroke()
    c.beginPath()
    c.arc(W / 2, H / 2, H * 0.14, 0, Math.PI * 2)
    c.stroke()
    for (let i = 0; i < 18; i++) {
      c.fillStyle = i < 9 ? '#f2d23a' : '#1f3f9a'
      c.beginPath()
      c.arc(W * (0.1 + r() * 0.8), H * (0.15 + r() * 0.7), 10, 0, Math.PI * 2)
      c.fill()
    }
    c.fillStyle = '#fff'
    c.beginPath()
    c.arc(W * 0.56, H * 0.46, 7, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = 'rgba(0,0,0,0.55)'
    c.fillRect(W * 0.03, H * 0.02, W * 0.26, H * 0.07)
    c.fillStyle = '#fff'
    mono(c, Math.round(H * 0.045), 600)
    c.fillText('2 - 1   78:12', W * 0.045, H * 0.072)
    corner(c, W, H, '—')
  }
}

/** Her solitaire: green felt, cards in columns. */
export function solitaire(seed: number): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    c.fillStyle = '#1f5a36'
    c.fillRect(0, 0, W, H)
    const cw = W * 0.09
    const ch = cw * 1.4
    for (let i = 0; i < 7; i++) {
      const x = W * 0.05 + i * W * 0.125
      const n = 1 + Math.floor(r() * 6)
      for (let k = 0; k < n; k++) {
        const y = H * 0.3 + k * H * 0.06
        const up = k === n - 1
        c.fillStyle = up ? '#f8f6ef' : '#2c4a8a'
        c.fillRect(x, y, cw, ch)
        c.strokeStyle = '#0d2a18'
        c.strokeRect(x, y, cw, ch)
        if (up) {
          c.fillStyle = r() < 0.5 ? '#b3261e' : '#111'
          sans(c, Math.round(cw * 0.4), 700)
          c.fillText(['A', '7', 'K', '4', 'Q', '9', '2'][Math.floor(r() * 7)], x + 8, y + cw * 0.42)
        }
      }
    }
    for (let i = 0; i < 4; i++) {
      c.strokeStyle = 'rgba(255,255,255,0.35)'
      c.strokeRect(W * 0.43 + i * W * 0.125, H * 0.05, cw, ch)
    }
    corner(c, W, H, '—')
  }
}

/** A two-player game for mother and son: two karts, a split screen, bright colors. Never shows the corner. */
export function duo(seed: number): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    for (const half of [0, 1]) {
      const x0 = half * W * 0.5
      const g = c.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, half ? '#7fc8ff' : '#ffd27f')
      g.addColorStop(0.45, half ? '#bfe6ff' : '#ffe9b8')
      g.addColorStop(0.46, '#4caf50')
      g.addColorStop(1, '#2e7d32')
      c.fillStyle = g
      c.fillRect(x0, 0, W * 0.5, H)
      c.fillStyle = '#8d8d8d'
      c.beginPath()
      c.moveTo(x0 + W * 0.24, H * 0.46)
      c.lineTo(x0 + W * 0.26, H * 0.46)
      c.lineTo(x0 + W * 0.45, H)
      c.lineTo(x0 + W * 0.05, H)
      c.fill()
      c.fillStyle = half ? '#e53935' : '#1e88e5'
      c.fillRect(x0 + W * (0.2 + r() * 0.06), H * 0.74, W * 0.08, H * 0.1)
    }
    c.fillStyle = '#111'
    c.fillRect(W / 2 - 3, 0, 6, H)
    corner(c, W, H, '—')
  }
}

/** Emre's desk, woken: the scoreboard (and Dede's saved game, 5–3 up). */
export function scoreboard(): Draw {
  return (c, W, H) => {
    wallpaper(c, W, H, '#10141e', '#1b1430')
    c.fillStyle = '#ffd36a'
    c.textAlign = 'center'
    sans(c, Math.round(H * 0.075), 800)
    c.letterSpacing = `${W * 0.004}px`
    c.fillText('EN YÜKSEK SKORLAR', W / 2, H * 0.15)
    c.letterSpacing = '0px'
    const rows: Array<[string, string, string]> = [
      ['1.', 'EMRE', '48.200'],
      ['2.', 'ARİF', '47.950'],
      ['3.', 'BURAK', '31.400'],
      ['4.', 'SELİN', '28.050'],
      ['5.', 'MERT', '19.700'],
    ]
    rows.forEach(([n, name, score], i) => {
      const y = H * (0.3 + i * 0.09)
      c.fillStyle = i === 0 ? '#ffffff' : i === 1 ? '#e8e0cc' : 'rgba(232,224,204,0.55)'
      mono(c, Math.round(H * (i < 2 ? 0.062 : 0.05)), i < 2 ? 700 : 500)
      c.textAlign = 'left'
      c.fillText(n, W * 0.2, y)
      c.fillText(name, W * 0.28, y)
      c.textAlign = 'right'
      c.fillText(score, W * 0.78, y)
    })
    c.textAlign = 'left'
    c.fillStyle = 'rgba(255,255,255,0.12)'
    c.fillRect(W * 0.18, H * 0.76, W * 0.64, 2)
    c.fillStyle = '#9fc2a8'
    mono(c, Math.round(H * 0.042), 500)
    c.fillText('KAYITLI OYUN · HASAN · TAVLA · 5–3', W * 0.2, H * 0.84)
  }
}

/** The boy's game at the end: bright, new, his hour in the corner. */
export function boyGame(seconds: number, seed: number, burst = 0): Draw {
  return (c, W, H) => {
    const r = rnd(seed)
    const g = c.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#5ec8ff')
    g.addColorStop(0.6, '#c6f0ff')
    g.addColorStop(0.61, '#7cc86a')
    g.addColorStop(1, '#3f8f3a')
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#ffffff'
    for (let i = 0; i < 5; i++) {
      c.beginPath()
      c.ellipse(W * r(), H * (0.1 + r() * 0.3), 60, 20, 0, 0, Math.PI * 2)
      c.fill()
    }
    for (let i = 0; i < 8; i++) {
      c.fillStyle = ['#e8553a', '#f2c230', '#8a5cd8'][i % 3]
      c.fillRect(W * (0.05 + i * 0.12), H * (0.45 + r() * 0.12), W * 0.07, H * 0.16)
    }
    c.fillStyle = '#ff7a2a'
    c.beginPath()
    c.arc(W * 0.3, H * 0.66, 26, 0, Math.PI * 2)
    c.fill()
    if (burst > 0) {
      c.fillStyle = `rgba(255,255,255,${0.75 * burst})`
      c.fillRect(0, 0, W, H)
    }
    corner(c, W, H, mmss(seconds))
  }
}

/** A stranger's screen: a page, a video, a sheet — and the dash. */
export function strangerScreen(i: number): Draw {
  return (c, W, H) => {
    const r = rnd(200 + i)
    const kinds = ['page', 'video', 'sheet', 'chat'] as const
    const k = kinds[i % kinds.length]
    if (k === 'video') {
      c.fillStyle = '#0c0c0e'
      c.fillRect(0, 0, W, H)
      const g = c.createLinearGradient(0, 0, W, H)
      g.addColorStop(0, '#6b4a3a')
      g.addColorStop(1, '#2a3a52')
      c.fillStyle = g
      c.fillRect(W * 0.04, H * 0.06, W * 0.92, H * 0.7)
      c.fillStyle = 'rgba(255,255,255,0.7)'
      c.fillRect(W * 0.04, H * 0.8, W * 0.92 * r(), 6)
    } else if (k === 'sheet') {
      c.fillStyle = '#f4f5f2'
      c.fillRect(0, 0, W, H)
      c.strokeStyle = '#c9cec7'
      for (let x = 0; x < W; x += W / 10) {
        c.beginPath()
        c.moveTo(x, 0)
        c.lineTo(x, H)
        c.stroke()
      }
      for (let y = 0; y < H; y += H / 20) {
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(W, y)
        c.stroke()
      }
      c.fillStyle = '#2f6f4a'
      c.fillRect(0, 0, W, H * 0.06)
    } else if (k === 'chat') {
      wallpaper(c, W, H, '#e9e4dc', '#d8d2c8')
      for (let j = 0; j < 7; j++) {
        c.fillStyle = j % 2 ? '#cfe8c6' : '#ffffff'
        const w = W * (0.25 + r() * 0.3)
        c.fillRect(j % 2 ? W - w - W * 0.05 : W * 0.05, H * (0.06 + j * 0.11), w, H * 0.08)
      }
    } else {
      c.fillStyle = '#fafafa'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#2b4c7e'
      c.fillRect(0, 0, W, H * 0.08)
      c.fillStyle = '#9aa3ad'
      c.fillRect(W * 0.06, H * 0.14, W * 0.5, H * 0.32)
      c.fillStyle = '#555'
      for (let j = 0; j < 10; j++) c.fillRect(W * 0.06, H * (0.52 + j * 0.035), W * (0.5 + r() * 0.3), H * 0.014)
    }
    taskbar(c, W, H)
    corner(c, W, H, '—')
  }
}

/** The cashier's list of desks. Child era: the hours bought; now: an empty column. */
export function adminScreen(era: Era, highlight: boolean): Draw {
  return (c, W, H) => {
    c.fillStyle = era === 'kid' ? '#0a2a4a' : '#151a20'
    c.fillRect(0, 0, W, H)
    c.fillStyle = era === 'kid' ? '#1d4f80' : '#222b35'
    c.fillRect(0, 0, W, H * 0.11)
    c.fillStyle = '#e8eef4'
    mono(c, Math.round(H * 0.055), 700)
    c.fillText('MASALAR', W * 0.05, H * 0.08)
    c.fillText('KALAN', W * 0.62, H * 0.08)
    const times = ['—', '—', '42:10', '1 SAAT', '—', '—', '18:30', '—', '55:02', '—', '07:45', '—', '30:00']
    const rows = era === 'kid' ? 13 : 13
    for (let i = 0; i < rows; i++) {
      const y = H * (0.18 + i * 0.062)
      const hot = era === 'kid' && highlight && i === 3
      if (hot) {
        c.fillStyle = '#ffd36a'
        c.fillRect(W * 0.03, y - H * 0.045, W * 0.94, H * 0.058)
      }
      c.fillStyle = hot ? '#1a1206' : 'rgba(232,238,244,0.8)'
      mono(c, Math.round(H * (hot ? 0.05 : 0.04)), hot ? 800 : 500)
      c.fillText(hot ? 'MASA 4 · 1 SAAT' : `MASA ${i + 1}`, W * 0.05, y)
      if (!hot) c.fillText(era === 'kid' ? times[i] : '', W * 0.62, y)
    }
  }
}

/** A screen surface with one canvas per era (CRT 4:3, flat 16:10), redrawn only when its key changes. */
export class Surface {
  readonly material: THREE.MeshBasicMaterial
  private sides: Record<
    Era,
    {
      canvas: HTMLCanvasElement
      ctx: Ctx
      tex: THREE.CanvasTexture
      key: string
    }
  >
  private era: Era = 'adult'

  constructor(crtPx = 768, flatPx = 1024) {
    const make = (w: number, h: number) => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      return { canvas, ctx: canvas.getContext('2d')!, tex, key: '' }
    }
    this.sides = {
      kid: make(crtPx, Math.round(crtPx * 0.75)),
      adult: make(flatPx, Math.round(flatPx * 0.62)),
    }
    this.material = new THREE.MeshBasicMaterial({
      map: this.sides.adult.tex,
      toneMapped: true,
    })
  }

  /** Draws `draw` for `era` unless the same key is already shown. */
  show(era: Era, key: string, draw: Draw) {
    const s = this.sides[era]
    if (this.era !== era) {
      this.era = era
      this.material.map = s.tex
      this.material.needsUpdate = true
    }
    if (s.key === key) return
    s.key = key
    s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height)
    draw(s.ctx, s.canvas.width, s.canvas.height)
    s.tex.needsUpdate = true
  }

  dispose() {
    this.sides.kid.tex.dispose()
    this.sides.adult.tex.dispose()
    this.material.dispose()
  }
}

/** A static picture as a texture (for the crowd's screens). */
export function staticTexture(w: number, h: number, draw: Draw) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
