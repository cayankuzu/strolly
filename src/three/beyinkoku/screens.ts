/**
 * Everything BEYİN-KÖKÜ draws on a surface: the lab's monitors (the file card,
 * the brain map, the protocol, the result), the notebook, the station screens'
 * little worlds, the suburb's weather screen, PSA panel, letter and phone, the
 * Centre's sign and boards, the second floor's posters and terminals, and the
 * stretcher room's screen wall (old recordings, the marks, the schema, the log).
 *
 * Every function is a pure drawing of a state, so a screen can be redrawn for
 * any moment of the story (scrolling back included).
 */
import { mulberry32 } from '@/lib/math'
import { mono, sans } from '../screens'

type C = CanvasRenderingContext2D

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

// ——— Small drawing helpers ———

function wrapText(ctx: C, text: string, maxW: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  if (line) lines.push(line)
  return lines
}

function rrect(ctx: C, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function grain(ctx: C, W: number, H: number, amount: number, seed: number) {
  const rand = mulberry32(seed)
  const n = Math.floor(W * H * 0.012 * amount)
  for (let i = 0; i < n; i++) {
    const v = rand() < 0.5 ? 0 : 255
    ctx.fillStyle = `rgba(${v},${v},${v},${0.08 + rand() * 0.18})`
    ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1 + rand() * 2)
  }
}

function scanlines(ctx: C, W: number, H: number, alpha = 0.12) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1)
}

function vignette(ctx: C, W: number, H: number, alpha = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(0,0,0,${alpha})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

function sky(ctx: C, W: number, H: number, top: string, bottom: string, h = H) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, top)
  g.addColorStop(1, bottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, h)
}

type Fig = { skin?: string; top?: string; hair?: string; smile?: number; eyes?: 'open' | 'closed' | 'black'; scar?: boolean; arms?: 'down' | 'up' | 'hug' | 'cup' | 'button' | 'flick'; bun?: boolean; long?: boolean; face?: boolean; turn?: number }

/** A simple flat person, feet at (x, y), `s` = height in px. */
function person(ctx: C, x: number, y: number, s: number, f: Fig = {}) {
  const u = s / 10
  const top = f.top ?? '#6f87a6'
  const skin = f.skin ?? '#e4c3a8'
  ctx.save()
  ctx.translate(x, y)
  // Legs
  ctx.fillStyle = '#3b3f48'
  ctx.fillRect(-1.3 * u, -4.6 * u, 1.1 * u, 4.6 * u)
  ctx.fillRect(0.2 * u, -4.6 * u, 1.1 * u, 4.6 * u)
  // Body
  ctx.fillStyle = top
  rrect(ctx, -1.8 * u, -8 * u, 3.6 * u, 3.8 * u, 0.9 * u)
  ctx.fill()
  // Arms
  ctx.strokeStyle = top
  ctx.lineWidth = 0.9 * u
  ctx.lineCap = 'round'
  ctx.beginPath()
  const arms = f.arms ?? 'down'
  if (arms === 'down') {
    ctx.moveTo(-1.6 * u, -7.5 * u)
    ctx.lineTo(-2.1 * u, -4.6 * u)
    ctx.moveTo(1.6 * u, -7.5 * u)
    ctx.lineTo(2.1 * u, -4.6 * u)
  } else if (arms === 'up') {
    ctx.moveTo(-1.6 * u, -7.5 * u)
    ctx.lineTo(-2.4 * u, -10.4 * u)
    ctx.moveTo(1.6 * u, -7.5 * u)
    ctx.lineTo(2.1 * u, -4.6 * u)
  } else if (arms === 'hug') {
    ctx.moveTo(-1.6 * u, -7.4 * u)
    ctx.quadraticCurveTo(-0.5 * u, -5.4 * u, 1.9 * u, -6.4 * u)
    ctx.moveTo(1.6 * u, -7.4 * u)
    ctx.quadraticCurveTo(2.8 * u, -6 * u, 1.4 * u, -5.6 * u)
  } else if (arms === 'cup') {
    ctx.moveTo(-1.6 * u, -7.5 * u)
    ctx.lineTo(-2.1 * u, -4.6 * u)
    ctx.moveTo(1.6 * u, -7.5 * u)
    ctx.lineTo(2.1 * u, -6 * u)
    ctx.lineTo(0.8 * u, -7.4 * u)
  } else if (arms === 'button') {
    ctx.moveTo(-1.6 * u, -7.5 * u)
    ctx.lineTo(-0.4 * u, -7.1 * u)
    ctx.moveTo(1.6 * u, -7.5 * u)
    ctx.lineTo(0.4 * u, -7.0 * u)
  } else {
    ctx.moveTo(-1.6 * u, -7.5 * u)
    ctx.lineTo(-2.1 * u, -4.6 * u)
    ctx.moveTo(1.6 * u, -7.5 * u)
    ctx.lineTo(3.4 * u, -6.2 * u)
  }
  ctx.stroke()
  if (arms === 'cup') {
    ctx.fillStyle = '#f2efe8'
    ctx.fillRect(0.3 * u, -8.2 * u, 0.8 * u, 0.9 * u)
  }
  // Neck and head
  ctx.fillStyle = skin
  ctx.fillRect(-0.4 * u, -8.6 * u, 0.8 * u, 0.8 * u)
  ctx.beginPath()
  ctx.ellipse(0, -9.6 * u, 1.05 * u, 1.25 * u, 0, 0, Math.PI * 2)
  ctx.fill()
  // Hair
  ctx.fillStyle = f.hair ?? '#4a3426'
  ctx.beginPath()
  ctx.ellipse(0, -10.2 * u, 1.12 * u, 0.8 * u, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  if (f.long) {
    ctx.fillRect(-1.15 * u, -10.2 * u, 0.5 * u, 2.2 * u)
    ctx.fillRect(0.65 * u, -10.2 * u, 0.5 * u, 2.2 * u)
  }
  if (f.bun) {
    ctx.beginPath()
    ctx.arc(0, -11 * u, 0.5 * u, 0, Math.PI * 2)
    ctx.fill()
  }
  if (f.face !== false) {
    const e = f.eyes ?? 'open'
    ctx.fillStyle = e === 'black' ? '#000' : '#2a1d16'
    ctx.strokeStyle = '#2a1d16'
    ctx.lineWidth = Math.max(1, 0.14 * u)
    const t = f.turn ?? 0
    for (const sx of [-0.38, 0.38]) {
      if (e === 'closed') {
        ctx.beginPath()
        ctx.moveTo((sx + t - 0.18) * u, -9.75 * u)
        ctx.lineTo((sx + t + 0.18) * u, -9.75 * u)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc((sx + t) * u, -9.8 * u, (e === 'black' ? 0.24 : 0.12) * u, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const sm = f.smile ?? 0.6
    ctx.beginPath()
    ctx.arc(t * u, -9.25 * u - sm * 0.1 * u, 0.42 * u, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  }
  if (f.scar) {
    ctx.strokeStyle = 'rgba(255,236,220,0.9)'
    ctx.lineWidth = Math.max(1, 0.12 * u)
    ctx.beginPath()
    ctx.ellipse(0, -10.25 * u, 1.1 * u, 0.25 * u, 0, 0.05 * Math.PI, 0.95 * Math.PI)
    ctx.stroke()
  }
  ctx.restore()
}

function house(ctx: C, x: number, y: number, w: number, h: number, wall: string, roof = '#9c8f86') {
  ctx.fillStyle = wall
  ctx.fillRect(x, y - h, w, h)
  ctx.fillStyle = roof
  ctx.beginPath()
  ctx.moveTo(x - w * 0.06, y - h)
  ctx.lineTo(x + w / 2, y - h - h * 0.55)
  ctx.lineTo(x + w * 1.06, y - h)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#d7e6f2'
  ctx.fillRect(x + w * 0.14, y - h * 0.7, w * 0.22, h * 0.32)
  ctx.fillRect(x + w * 0.64, y - h * 0.7, w * 0.22, h * 0.32)
  ctx.fillStyle = '#c8b9a6'
  ctx.fillRect(x + w * 0.42, y - h * 0.62, w * 0.16, h * 0.62)
}

function fence(ctx: C, y: number, W: number, h: number, color = '#fbfaf6') {
  ctx.fillStyle = color
  ctx.fillRect(0, y - h * 0.65, W, h * 0.12)
  for (let x = 4; x < W; x += h * 0.45) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - h)
    ctx.lineTo(x + h * 0.12, y - h - h * 0.14)
    ctx.lineTo(x + h * 0.24, y - h)
    ctx.lineTo(x + h * 0.24, y)
    ctx.fill()
  }
}

function tree(ctx: C, x: number, y: number, r: number, leaf = '#6e9a52') {
  ctx.fillStyle = '#6a5444'
  ctx.fillRect(x - r * 0.1, y - r * 1.1, r * 0.2, r * 1.1)
  ctx.fillStyle = leaf
  ctx.beginPath()
  ctx.arc(x, y - r * 1.6, r, 0, Math.PI * 2)
  ctx.fill()
}

// ——— A. The lab ———

export type Motif = 'bike' | 'veranda' | 'sea' | 'shirt' | 'hug' | 'rain'
export const MOTIFS: Motif[] = ['bike', 'veranda', 'sea', 'shirt', 'hug', 'rain']

/** One subject's world, small, on a station screen. `tint` 0–2 shifts the time of day. */
export function drawWorld(ctx: C, W: number, H: number, motif: Motif, tint = 0, t = 0) {
  const dusk = tint === 1
  const night = tint === 2
  const g = H * 0.72
  if (motif === 'sea') {
    sky(ctx, W, H, dusk ? '#f3b28a' : night ? '#22304a' : '#a8d8f5', dusk ? '#f7d6b0' : night ? '#3b4a66' : '#e6f4fb', H * 0.55)
    ctx.fillStyle = dusk ? '#5d7f9c' : night ? '#1c2a40' : '#3f8fbf'
    ctx.fillRect(0, H * 0.55, W, H * 0.2)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    for (let i = 0; i < 6; i++) ctx.fillRect(((i * 47 + t * 20) % W), H * (0.6 + (i % 3) * 0.04), W * 0.12, 2)
    ctx.fillStyle = dusk ? '#e3c8a0' : '#efe0c0'
    ctx.fillRect(0, H * 0.75, W, H * 0.25)
    person(ctx, W * (0.35 + 0.05 * Math.sin(t * 0.3)), H * 0.92, H * 0.42, { top: '#e8857a', long: true, hair: '#6b4630', smile: 0.4 })
  } else if (motif === 'veranda') {
    sky(ctx, W, H, dusk ? '#f0a77c' : '#b9e0f7', dusk ? '#f9dcb6' : '#eef7fb', g)
    ctx.fillStyle = '#9cc985'
    ctx.fillRect(0, g, W, H - g)
    ctx.fillStyle = '#efe6d2'
    ctx.fillRect(0, H * 0.18, W * 0.62, g - H * 0.18)
    ctx.fillStyle = '#d9c8aa'
    ctx.fillRect(0, g - H * 0.05, W * 0.75, H * 0.08)
    for (let x = W * 0.05; x < W * 0.75; x += W * 0.07) ctx.fillRect(x, g - H * 0.2, W * 0.012, H * 0.17)
    ctx.fillStyle = '#7a5a40'
    ctx.fillRect(W * 0.18, g - H * 0.32, W * 0.2, H * 0.06)
    person(ctx, W * 0.3, g + H * 0.02, H * 0.5, { top: '#8b9aa8', hair: '#d8d8d8', arms: 'cup', smile: 0.8 })
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(W * 0.35 + Math.sin(t * 2 + i) * 3, g - H * (0.44 + i * 0.05), 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (motif === 'bike') {
    sky(ctx, W, H, '#a9dcf8', '#eaf6fc', g)
    for (let i = 0; i < 4; i++) house(ctx, i * W * 0.28 - W * 0.06, g, W * 0.22, H * 0.2, ['#f4e3c8', '#dfeaf0', '#f3d9d9', '#e2efd8'][i])
    fence(ctx, g + 2, W, H * 0.07)
    ctx.fillStyle = '#c9c4ba'
    ctx.fillRect(0, g + 2, W, H - g)
    const bx = ((t * 40) % (W * 1.3)) - W * 0.15
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    for (const dx of [-H * 0.08, H * 0.08]) {
      ctx.beginPath()
      ctx.arc(bx + dx, H * 0.9, H * 0.06, 0, Math.PI * 2)
      ctx.stroke()
    }
    person(ctx, bx, H * 0.86, H * 0.3, { top: '#e94f5b', long: true, hair: '#c58a4a', arms: 'flick', smile: 0.9 })
  } else if (motif === 'shirt') {
    ctx.fillStyle = dusk ? '#e9d2b8' : '#f1e9dc'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#d5c4ac'
    ctx.fillRect(W * 0.62, H * 0.08, W * 0.3, H * 0.6)
    ctx.fillStyle = '#b8d6ea'
    ctx.fillRect(W * 0.65, H * 0.11, W * 0.24, H * 0.54)
    ctx.fillStyle = '#c9b18f'
    ctx.fillRect(0, H * 0.85, W, H * 0.15)
    person(ctx, W * 0.36, H * 1.02, H * 0.86, { top: '#f6f6f2', hair: '#2f2620', arms: 'button', smile: 0.3 })
  } else if (motif === 'hug') {
    sky(ctx, W, H, '#ffe2b8', '#fff3de', H)
    ctx.fillStyle = '#e8d3b0'
    ctx.fillRect(0, H * 0.8, W, H * 0.2)
    ctx.fillStyle = '#c8a87a'
    ctx.fillRect(W * 0.7, H * 0.3, W * 0.2, H * 0.5)
    person(ctx, W * 0.45, H * 0.98, H * 0.78, { top: '#b7799a', long: true, hair: '#5b3a28', arms: 'hug', smile: 0.9, turn: 0.3 })
    person(ctx, W * 0.56, H * 0.98, H * 0.42, { top: '#f2c14e', hair: '#7a5230', arms: 'up', smile: 1 })
  } else {
    sky(ctx, W, H, '#6e7a86', '#a3adb6', g)
    ctx.fillStyle = '#58626d'
    for (let i = 0; i < 5; i++) ctx.fillRect(i * W * 0.22, H * 0.25, W * 0.18, g - H * 0.25)
    ctx.fillStyle = '#4b535c'
    ctx.fillRect(0, g, W, H - g)
    person(ctx, W * 0.42, H * 0.97, H * 0.62, { top: '#2f4a64', hair: '#2a2420', smile: 1, eyes: 'closed' })
    ctx.strokeStyle = 'rgba(220,230,240,0.45)'
    ctx.lineWidth = 1
    const rand = mulberry32(9 + Math.floor(t * 12))
    for (let i = 0; i < 70; i++) {
      const x = rand() * W
      const y = rand() * H
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 3, y + 12)
      ctx.stroke()
    }
  }
  if (night) {
    ctx.fillStyle = 'rgba(10,20,50,0.45)'
    ctx.fillRect(0, 0, W, H)
  }
  scanlines(ctx, W, H, 0.08)
  vignette(ctx, W, H, 0.35)
}

/** A subject's real body, from the screens' point of view: dark, a station, a halo. */
export function drawBody(ctx: C, W: number, H: number) {
  ctx.fillStyle = '#0a0d13'
  ctx.fillRect(0, 0, W, H)
  const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 4, W * 0.5, H * 0.35, H * 0.7)
  g.addColorStop(0, 'rgba(120,150,190,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.translate(W * 0.5, H * 0.92)
  ctx.rotate(-0.5)
  ctx.fillStyle = '#2a2f37'
  rrect(ctx, -W * 0.08, -H * 0.85, W * 0.16, H * 0.85, 6)
  ctx.fill()
  ctx.fillStyle = '#5a6068'
  rrect(ctx, -W * 0.055, -H * 0.62, W * 0.11, H * 0.5, 8)
  ctx.fill()
  ctx.fillStyle = '#8c7b70'
  ctx.beginPath()
  ctx.ellipse(0, -H * 0.7, W * 0.035, H * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#c9d2dc'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(0, -H * 0.72, W * 0.06, H * 0.03, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = '#5fe0c0'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W * 0.05, -H * 0.72)
  ctx.lineTo(W * 0.1, 0)
  ctx.stroke()
  ctx.strokeStyle = '#111'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(0, -H * 0.76)
  ctx.lineTo(-W * 0.02, -H * 1.1)
  ctx.stroke()
  ctx.restore()
  scanlines(ctx, W, H, 0.15)
}

const BG = '#070b12'
const UI = '#cfe0ff'
const DIM = 'rgba(207,224,255,0.45)'
const AMBER = '#ffb347'

function panel(ctx: C, x: number, y: number, w: number, h: number, title: string, scale: number) {
  ctx.fillStyle = 'rgba(30,44,66,0.55)'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(207,224,255,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  mono(ctx, 11 * scale, 500)
  ctx.fillStyle = DIM
  ctx.fillText(title, x + 6 * scale, y + 14 * scale)
}

/** Little windows of Levy's world around the file card. */
function thumb(ctx: C, x: number, y: number, w: number, h: number, kind: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.translate(x, y)
  const W = w
  const H = h
  switch (kind) {
    case 0:
      sky(ctx, W, H, '#bfe3ff', '#eef8ff', H * 0.7)
      ctx.fillStyle = '#9cc985'
      ctx.fillRect(0, H * 0.7, W, H)
      house(ctx, W * 0.2, H * 0.75, W * 0.6, H * 0.35, '#f4f1ea')
      fence(ctx, H * 0.9, W, H * 0.12)
      break
    case 1:
      ctx.fillStyle = '#f1e9dc'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(W / 2, H * 0.62, W * 0.2, H * 0.12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#6b4a30'
      ctx.beginPath()
      ctx.ellipse(W / 2, H * 0.6, W * 0.15, H * 0.07, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 2:
      sky(ctx, W, H, '#bfe3ff', '#eef8ff', H * 0.7)
      ctx.fillStyle = '#9cc985'
      ctx.fillRect(0, H * 0.7, W, H)
      person(ctx, W * 0.5, H * 0.98, H * 0.8, { top: '#b9a3d6', hair: '#f2f2f2', bun: true, scar: true, smile: 0.8 })
      break
    case 3:
      ctx.fillStyle = '#dedad0'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#8b9096'
      for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.08 + i * W * 0.22, H * 0.15, W * 0.14, H * 0.75)
      break
    case 4:
      sky(ctx, W, H, '#bfe3ff', '#eef8ff', H * 0.8)
      ctx.fillStyle = 'rgba(220,240,255,0.7)'
      ctx.fillRect(W * 0.15, H * 0.2, W * 0.7, H * 0.6)
      ctx.fillStyle = '#1b2a3a'
      ctx.fillRect(W * 0.62, H * 0.25, W * 0.18, H * 0.5)
      break
    case 5:
      ctx.fillStyle = '#f5f6f7'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#d9dde2'
      ctx.fillRect(0, H * 0.6, W, H)
      ctx.fillStyle = '#2f7bff'
      ctx.fillRect(W * 0.2, H * 0.6, W * 0.06, H)
      ctx.fillStyle = '#e8322f'
      ctx.fillRect(W * 0.32, H * 0.6, W * 0.06, H)
      break
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(207,224,255,0.5)'
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
}

export type MainState =
  | { kind: 'idle'; t: number }
  | { kind: 'card'; lines: string[]; t: number }
  | { kind: 'protocol'; lines: string[]; shown: number; amber: boolean; cursor: boolean }
  | { kind: 'brain'; t: number; label: string }
  | { kind: 'progress'; value: number; label: string }
  | { kind: 'result'; lines: string[]; t: number }
  | { kind: 'next'; lines: string[]; t: number }
  | { kind: 'off' }

/** The main monitor on Veyl's desk (1.3 × 0.75 m). */
export function drawMain(ctx: C, W: number, H: number, s: MainState) {
  const k = W / 1024
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)
  if (s.kind === 'off') return
  // A thin header bar.
  ctx.fillStyle = 'rgba(207,224,255,0.08)'
  ctx.fillRect(0, 0, W, 26 * k)
  mono(ctx, 13 * k, 500)
  ctx.fillStyle = DIM
  ctx.fillText('BRAINROOT · KONTROL · ATRİYUM A', 12 * k, 18 * k)
  ctx.textAlign = 'right'
  ctx.fillText('03:12:44', W - 12 * k, 18 * k)
  ctx.textAlign = 'left'
  if (s.kind === 'idle') {
    for (let i = 0; i < 6; i++) {
      const x = 24 * k + (i % 3) * 330 * k
      const y = 50 * k + Math.floor(i / 3) * 270 * k
      panel(ctx, x, y, 310 * k, 250 * k, `İSTASYON ${[12, 31, 47, 88, 103, 140][i]}`, k)
      ctx.strokeStyle = i === 1 ? AMBER : 'rgba(95,224,192,0.8)'
      ctx.lineWidth = 2 * k
      ctx.beginPath()
      for (let j = 0; j < 60; j++) {
        const xx = x + 10 * k + j * 4.8 * k
        const yy = y + 140 * k + Math.sin(j * 0.4 + s.t * 2 + i) * 30 * k * (i === 1 ? 1.4 : 0.8) + Math.sin(j * 1.7 + i) * 8 * k
        if (j === 0) ctx.moveTo(xx, yy)
        else ctx.lineTo(xx, yy)
      }
      ctx.stroke()
    }
    return
  }
  if (s.kind === 'card' || s.kind === 'result' || s.kind === 'next') {
    const green = s.kind === 'result'
    // The card in the left two thirds; the world's little windows around it.
    const cx = 24 * k
    const cy = 44 * k
    const cw = 640 * k
    const ch = H - 70 * k
    ctx.fillStyle = 'rgba(20,32,50,0.9)'
    ctx.fillRect(cx, cy, cw, ch)
    ctx.strokeStyle = green ? '#4cff9a' : s.kind === 'next' ? AMBER : UI
    ctx.lineWidth = 2 * k
    ctx.strokeRect(cx, cy, cw, ch)
    if (s.kind === 'next') {
      // A blurred photograph.
      const g = ctx.createRadialGradient(cx + 120 * k, cy + 150 * k, 10 * k, cx + 120 * k, cy + 150 * k, 110 * k)
      g.addColorStop(0, '#9a8576')
      g.addColorStop(0.6, '#5d5048')
      g.addColorStop(1, '#2b2a30')
      ctx.fillStyle = g
      ctx.fillRect(cx + 30 * k, cy + 40 * k, 180 * k, 220 * k)
    }
    const x0 = s.kind === 'next' ? cx + 240 * k : cx + 28 * k
    let y = cy + 56 * k
    s.lines.forEach((line, i) => {
      mono(ctx, (i === 0 ? 30 : 24) * k, i === 0 ? 700 : 500)
      const [a, b] = line.includes(':') ? [line.slice(0, line.indexOf(':') + 1), line.slice(line.indexOf(':') + 1)] : [line, '']
      ctx.fillStyle = UI
      const wrapped = wrapText(ctx, line, cw - (x0 - cx) - 30 * k)
      if (wrapped.length > 1 || !b) {
        ctx.fillStyle = s.kind === 'next' ? AMBER : UI
        for (const w of wrapped) {
          ctx.fillText(w, x0, y)
          y += 34 * k
        }
      } else {
        ctx.fillStyle = DIM
        ctx.fillText(a, x0, y)
        const wa = ctx.measureText(a).width
        const warn = /ARTIYOR|UYUMSUZ|GECİKMELİ|DEĞİL/.test(b)
        ctx.fillStyle = green ? '#4cff9a' : warn ? AMBER : UI
        ctx.fillText(b, x0 + wa, y)
        y += 34 * k
      }
      y += (i === 0 ? 16 : 10) * k
    })
    // Windows of the world.
    const tw = 160 * k
    const th = 100 * k
    for (let i = 0; i < 6; i++) {
      const x = 690 * k + (i % 2) * 168 * k
      const yy = 44 * k + Math.floor(i / 2) * 112 * k
      thumb(ctx, x, yy, tw, th, i)
    }
    mono(ctx, 12 * k, 500)
    ctx.fillStyle = DIM
    ctx.fillText(green ? 'GERİ AKTARIM: YEŞİL' : 'EV · ÇİT · KAHVE · E-07 · ARŞİV · MERKEZ', 690 * k, 44 * k + 3 * 112 * k + 6 * k)
    return
  }
  if (s.kind === 'protocol') {
    ctx.fillStyle = '#05080d'
    ctx.fillRect(40 * k, 50 * k, W - 80 * k, H - 90 * k)
    ctx.strokeStyle = 'rgba(207,224,255,0.4)'
    ctx.strokeRect(40 * k, 50 * k, W - 80 * k, H - 90 * k)
    mono(ctx, 30 * k, 600)
    let y = 104 * k
    s.lines.forEach((line, i) => {
      if (i >= s.shown) return
      const amber = s.amber && i === 1
      ctx.fillStyle = i === 0 ? UI : amber ? AMBER : 'rgba(207,224,255,0.85)'
      mono(ctx, (i === 0 ? 32 : 27) * k, i === 0 ? 700 : 500)
      ctx.fillText(line, 70 * k, y)
      if (amber) {
        ctx.fillStyle = 'rgba(255,179,71,0.18)'
        ctx.fillRect(60 * k, y - 28 * k, W - 120 * k, 38 * k)
      }
      y += (i === 0 ? 62 : 52) * k
    })
    if (s.cursor) {
      ctx.fillStyle = UI
      ctx.fillRect(70 * k, y - 24 * k, 14 * k, 28 * k)
    }
    return
  }
  if (s.kind === 'brain') {
    drawBrainMap(ctx, W, H, s.t, 0.48, s.label)
    return
  }
  if (s.kind === 'progress') {
    mono(ctx, 30 * k, 600)
    ctx.fillStyle = UI
    ctx.fillText(s.label, 70 * k, 200 * k)
    ctx.strokeStyle = UI
    ctx.lineWidth = 2 * k
    ctx.strokeRect(70 * k, 240 * k, W - 140 * k, 50 * k)
    ctx.fillStyle = AMBER
    ctx.fillRect(76 * k, 246 * k, (W - 152 * k) * clamp01(s.value), 38 * k)
    mono(ctx, 24 * k, 500)
    ctx.fillStyle = DIM
    ctx.fillText(`${Math.round(clamp01(s.value) * 100)} %`, 70 * k, 340 * k)
  }
}

/** The brain map: two traces, white (intent) first, amber (reason) later, and the gap between. */
export function drawBrainMap(ctx: C, W: number, H: number, t: number, gap: number, label: string) {
  const k = W / 768
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)
  // Brain outline, side view, on the left.
  ctx.save()
  ctx.translate(150 * k, 190 * k)
  ctx.strokeStyle = 'rgba(207,224,255,0.75)'
  ctx.lineWidth = 2.5 * k
  ctx.beginPath()
  ctx.moveTo(-110 * k, 20 * k)
  ctx.bezierCurveTo(-120 * k, -80 * k, -20 * k, -120 * k, 50 * k, -95 * k)
  ctx.bezierCurveTo(120 * k, -80 * k, 135 * k, 0, 105 * k, 45 * k)
  ctx.bezierCurveTo(80 * k, 70 * k, 40 * k, 60 * k, 20 * k, 70 * k)
  ctx.lineTo(10 * k, 115 * k)
  ctx.lineTo(-10 * k, 115 * k)
  ctx.lineTo(-5 * k, 70 * k)
  ctx.bezierCurveTo(-60 * k, 75 * k, -105 * k, 60 * k, -110 * k, 20 * k)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(207,224,255,0.3)'
  ctx.lineWidth = 1.5 * k
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(-90 * k + i * 30 * k, -60 * k + (i % 2) * 20 * k)
    ctx.quadraticCurveTo(-70 * k + i * 30 * k, -10 * k, -95 * k + i * 32 * k, 40 * k)
    ctx.stroke()
  }
  // The motor area glows, then the reason area.
  const pulse = 0.5 + 0.5 * Math.sin(t * 3)
  ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.3 * pulse})`
  ctx.beginPath()
  ctx.arc(10 * k, -70 * k, 16 * k, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255,179,71,${0.2 + 0.3 * (1 - pulse)})`
  ctx.beginPath()
  ctx.arc(-70 * k, -20 * k, 18 * k, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Traces.
  const x0 = 310 * k
  const x1 = W - 30 * k
  const base = 330 * k
  mono(ctx, 15 * k, 600)
  ctx.fillStyle = '#fff'
  ctx.fillText('HAREKET NİYETİ', x0, 60 * k)
  ctx.fillStyle = AMBER
  ctx.fillText('GEREKÇE', x0 + 200 * k, 60 * k)
  ctx.strokeStyle = 'rgba(207,224,255,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x0, base)
  ctx.lineTo(x1, base)
  ctx.stroke()
  const sweep = (t * 0.35) % 1
  const rise = (x: number, at: number) => 1 / (1 + Math.exp(-(x - at) * 18))
  const span = x1 - x0
  const g = gap * (0.85 + 0.25 * Math.sin(t * 1.3))
  for (const [col, at, amp] of [
    ['#ffffff', 0.32, 190],
    [AMBER, 0.32 + g * 0.55, 150],
  ] as const) {
    ctx.strokeStyle = col
    ctx.lineWidth = 3 * k
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const f = i / 200
      const y = base - rise(f, at) * amp * k + Math.sin(f * 50 + t * 4) * 3 * k
      const x = x0 + f * span
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  // The bracket.
  const a = x0 + span * 0.32
  const b = x0 + span * (0.32 + g * 0.55)
  ctx.strokeStyle = AMBER
  ctx.lineWidth = 2 * k
  ctx.beginPath()
  ctx.moveTo(a, base + 30 * k)
  ctx.lineTo(a, base + 42 * k)
  ctx.lineTo(b, base + 42 * k)
  ctx.lineTo(b, base + 30 * k)
  ctx.stroke()
  const blink = Math.sin(t * 5) > -0.3
  mono(ctx, 22 * k, 700)
  ctx.fillStyle = blink ? AMBER : 'rgba(255,179,71,0.4)'
  ctx.fillText(label, a - 20 * k, base + 78 * k)
  // Playhead.
  ctx.fillStyle = 'rgba(207,224,255,0.4)'
  ctx.fillRect(x0 + sweep * span, 80 * k, 1.5 * k, base - 80 * k)
}

/** The right monitor in `god`: the sky slider; then the brain map. */
export function drawControls(ctx: C, W: number, H: number, slider: number, tapped: boolean) {
  const k = W / 768
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)
  mono(ctx, 18 * k, 600)
  ctx.fillStyle = DIM
  ctx.fillText('L-31 · ORTAM', 30 * k, 44 * k)
  const rows = ['GÖKYÜZÜ DOYGUNLUĞU', 'GÜNEŞ AÇISI', 'KOMŞU · YÜZ İFADESİ', 'RÜZGÂR']
  rows.forEach((r, i) => {
    const y = 110 * k + i * 82 * k
    mono(ctx, 16 * k, 500)
    ctx.fillStyle = UI
    ctx.fillText(r, 30 * k, y)
    ctx.fillStyle = 'rgba(207,224,255,0.2)'
    ctx.fillRect(30 * k, y + 16 * k, 520 * k, 8 * k)
    const v = i === 0 ? slider : i === 1 ? 0.62 : i === 2 ? (tapped ? 0.9 : 0.4) : 0.1
    ctx.fillStyle = i === 0 || (i === 2 && tapped) ? AMBER : UI
    ctx.fillRect(30 * k, y + 16 * k, 520 * k * v, 8 * k)
    ctx.beginPath()
    ctx.arc(30 * k + 520 * k * v, y + 20 * k, 11 * k, 0, Math.PI * 2)
    ctx.fill()
    if (i === 2) {
      ctx.strokeStyle = tapped ? AMBER : DIM
      ctx.strokeRect(590 * k, y - 18 * k, 140 * k, 44 * k)
      ctx.fillStyle = tapped ? AMBER : DIM
      ctx.fillText('GÜLÜMSE', 606 * k, y + 10 * k)
    }
  })
}

/** The left monitor: Levy's suburb from above, its sky deepening; a neighbour who smiles. Or another subject's veranda. */
export function drawSuburbView(ctx: C, W: number, H: number, skyDepth: number, smile: number, other: boolean, t: number) {
  const g = H * 0.58
  const top = other ? '#f4c9a0' : `rgb(${Math.round(150 - 80 * skyDepth)},${Math.round(205 - 60 * skyDepth)},${Math.round(245 - 10 * skyDepth)})`
  sky(ctx, W, H, top, other ? '#fbe7cf' : '#e7f4fd', g)
  ctx.fillStyle = '#9cc985'
  ctx.fillRect(0, g, W, H - g)
  if (other) {
    // Another veranda, another morning: a mailbox, a closed door, an envelope on the mat.
    ctx.fillStyle = '#e6ecef'
    ctx.fillRect(W * 0.1, H * 0.12, W * 0.8, g - H * 0.12)
    ctx.fillStyle = '#d6c3a2'
    ctx.fillRect(0, g - H * 0.02, W, H * 0.1)
    ctx.fillStyle = '#8a6e52'
    rrect(ctx, W * 0.42, H * 0.2, W * 0.16, g - H * 0.2, 4)
    ctx.fill()
    ctx.fillStyle = '#c9b06a'
    ctx.beginPath()
    ctx.arc(W * 0.555, H * 0.42, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#6f8fb3'
    ctx.fillRect(W * 0.8, g - H * 0.18, W * 0.07, H * 0.08)
    ctx.fillRect(W * 0.833, g - H * 0.1, W * 0.006, H * 0.18)
    ctx.fillStyle = '#c9b49a'
    ctx.fillRect(W * 0.38, g + H * 0.02, W * 0.24, H * 0.05)
    ctx.save()
    ctx.translate(W * 0.5, g + H * 0.045)
    ctx.rotate(-0.08)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-W * 0.07, -H * 0.03, W * 0.14, H * 0.06)
    mono(ctx, Math.round(H * 0.035), 600)
    ctx.fillStyle = '#222'
    ctx.textAlign = 'center'
    ctx.fillText('MARA T.', 0, H * 0.012)
    ctx.textAlign = 'left'
    ctx.restore()
  } else {
    for (let i = 0; i < 3; i++) house(ctx, W * (0.05 + i * 0.33), g + H * 0.02, W * 0.24, H * 0.22, ['#f4f1ea', '#f6efd2', '#e6eef3'][i])
    fence(ctx, g + H * 0.1, W, H * 0.06)
    ctx.fillStyle = '#d8d3c8'
    ctx.fillRect(0, g + H * 0.12, W, H * 0.12)
    person(ctx, W * 0.72, H * 0.98, H * 0.42, { top: '#b9a3d6', hair: '#f2f2f2', bun: true, smile: smile, scar: true })
    if (smile > 0.7) {
      ctx.strokeStyle = 'rgba(255,179,71,0.9)'
      ctx.lineWidth = 2
      ctx.strokeRect(W * 0.63, H * 0.5, W * 0.18, H * 0.48)
    }
  }
  mono(ctx, Math.round(H * 0.04), 500)
  ctx.fillStyle = 'rgba(10,15,26,0.6)'
  ctx.fillRect(0, 0, W, H * 0.07)
  ctx.fillStyle = UI
  ctx.fillText(other ? 'DENEK 77 · M. T. · 06:58' : 'DENEK 31 · L. A. · 07:41', 10, H * 0.05)
  scanlines(ctx, W, H, 0.06)
  void t
}

/** The notebook: two pages, the same terms written again and again. */
export function drawNotebook(ctx: C, W: number, H: number, entry: { lines: string[]; shown: number; last: number } | null, terms: string[]) {
  ctx.fillStyle = '#ebe5d6'
  ctx.fillRect(0, 0, W, H)
  // Gutter shadow and faint rules.
  const g = ctx.createLinearGradient(W / 2 - 30, 0, W / 2 + 30, 0)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(0.5, 'rgba(0,0,0,0.25)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(W / 2 - 30, 0, 60, H)
  ctx.strokeStyle = 'rgba(80,110,160,0.18)'
  ctx.lineWidth = 1
  for (let y = 50; y < H; y += 34) {
    ctx.beginPath()
    ctx.moveTo(10, y)
    ctx.lineTo(W - 10, y)
    ctx.stroke()
  }
  const hand = (size: number) => (ctx.font = `italic 500 ${size}px Georgia, 'Times New Roman', serif`)
  ctx.fillStyle = '#1d2433'
  const rand = mulberry32(17)
  if (!entry) {
    // Left page: the terms, repeated, underlined, circled.
    hand(27)
    let y = 46
    for (let i = 0; i < 13; i++) {
      const t = terms[i % terms.length]
      const x = 40 + rand() * 30
      ctx.fillText(t, x, y)
      if (i % 3 === 1) {
        ctx.strokeStyle = '#1d2433'
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(x, y + 6)
        ctx.lineTo(x + ctx.measureText(t).width, y + 4)
        ctx.stroke()
      }
      if (i === 4 || i === 9) {
        ctx.strokeStyle = '#7a1f1f'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(x + ctx.measureText(t).width / 2, y - 8, ctx.measureText(t).width / 2 + 14, 20, -0.04, 0, Math.PI * 2)
        ctx.stroke()
      }
      y += 34
    }
    // Right page.
    y = 46
    for (let i = 0; i < 13; i++) {
      const t = terms[(i + 3) % terms.length]
      ctx.fillText(t, W / 2 + 40 + rand() * 40, y)
      y += 34
    }
  } else {
    hand(24)
    ctx.fillStyle = 'rgba(29,36,51,0.45)'
    let y = 46
    for (let i = 0; i < 6; i++) {
      ctx.fillText(terms[i % terms.length], 40, y)
      y += 34
    }
    ctx.fillStyle = '#1d2433'
    y = 46
    const maxW = W / 2 - 70
    entry.lines.forEach((line, i) => {
      if (i >= entry.shown) return
      const last = i >= entry.lines.length - 1
      hand(last ? 25 : 22)
      const reveal = i === entry.shown - 1 ? entry.last : 1
      const parts = wrapText(ctx, line, maxW)
      parts.forEach((p, j) => {
        const visible = Math.ceil(p.length * clamp01(reveal * parts.length - j))
        ctx.fillText(p.slice(0, visible), W / 2 + 34, y)
        y += 30
      })
      y += 6
    })
  }
  // The faint margin note.
  ctx.save()
  ctx.translate(W / 2 - 34, H - 30)
  ctx.rotate(-Math.PI / 2)
  hand(16)
  ctx.fillStyle = 'rgba(40,40,60,0.35)'
  ctx.fillText('Hızlı kaldırma: dokuz denek. Dokuzu da panik.', 0, 0)
  ctx.restore()
}

/** The arm monitor at station 31. */
export function drawArmMonitor(ctx: C, W: number, H: number, lines: string[], alarm: boolean, t: number) {
  ctx.fillStyle = '#05070b'
  ctx.fillRect(0, 0, W, H)
  mono(ctx, Math.round(H * 0.075), 500)
  ctx.fillStyle = DIM
  ctx.fillText('İST. 31 · YAŞAMSAL', 14, H * 0.1)
  ctx.strokeStyle = '#4cff9a'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i <= 100; i++) {
    const f = i / 100
    const ph = (f * 3 + t * 0.8) % 1
    const y = H * 0.3 - (ph > 0.42 && ph < 0.47 ? 30 : ph > 0.47 && ph < 0.5 ? -12 : 0)
    if (i === 0) ctx.moveTo(f * W, y)
    else ctx.lineTo(f * W, y)
  }
  ctx.stroke()
  mono(ctx, Math.round(H * 0.085), 700)
  lines.forEach((l, i) => {
    ctx.fillStyle = alarm && Math.sin(t * 6) > -0.2 ? '#ff3b3b' : 'rgba(255,90,90,0.75)'
    ctx.fillText(l, 14, H * (0.58 + i * 0.16))
  })
}

/** Plates and labels. */
export function drawPlate(ctx: C, W: number, H: number, lines: string[], dark = false) {
  ctx.fillStyle = dark ? '#1a1e25' : '#d9dde3'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = dark ? '#cfe0ff' : '#14171c'
  mono(ctx, Math.round(H / (lines.length + 0.9)), 700)
  lines.forEach((l, i) => ctx.fillText(l, W * 0.05, H * ((i + 0.85) / (lines.length + 0.25))))
}

/** Station 31's own small screen: the suburb at dawn, or Levy at his desk with soup. */
export function drawStation31(ctx: C, W: number, H: number, mode: 'dawn' | 'soup' | 'dark', light: number, t: number) {
  if (mode === 'dark') {
    ctx.fillStyle = '#04060a'
    ctx.fillRect(0, 0, W, H)
    return
  }
  if (mode === 'dawn') {
    sky(ctx, W, H, `rgb(${Math.round(60 + 180 * light)},${Math.round(70 + 150 * light)},${Math.round(110 + 120 * light)})`, `rgb(${Math.round(120 + 135 * light)},${Math.round(100 + 120 * light)},${Math.round(90 + 80 * light)})`, H * 0.65)
    ctx.fillStyle = `rgba(255,214,150,${light})`
    ctx.beginPath()
    ctx.arc(W * 0.7, H * 0.66, H * 0.12, Math.PI, 0)
    ctx.fill()
    ctx.fillStyle = '#7fa66a'
    ctx.fillRect(0, H * 0.65, W, H * 0.35)
    house(ctx, W * 0.15, H * 0.7, W * 0.35, H * 0.28, '#efe8da')
    fence(ctx, H * 0.86, W, H * 0.08)
  } else {
    ctx.fillStyle = '#dedad0'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#8b9096'
    ctx.fillRect(0, H * 0.1, W * 0.25, H * 0.7)
    ctx.fillStyle = '#d2c9b6'
    ctx.fillRect(W * 0.2, H * 0.68, W * 0.75, H * 0.08)
    ctx.fillStyle = '#d8d0bd'
    ctx.fillRect(W * 0.62, H * 0.38, W * 0.22, H * 0.3)
    ctx.fillStyle = '#2a3a4a'
    ctx.fillRect(W * 0.64, H * 0.4, W * 0.18, H * 0.22)
    const turn = 0.5 + 0.5 * Math.sin(t * 0.6)
    person(ctx, W * 0.45, H * 1.05, H * 0.75, { top: '#b9d3ef', hair: '#3a2a20', scar: true, smile: 0.4, turn: (turn - 0.5) * 0.6, arms: 'cup' })
  }
  scanlines(ctx, W, H, 0.08)
}

// ——— B. The suburb ———

export function drawWeather(ctx: C, W: number, H: number, text: string) {
  ctx.fillStyle = '#e9f4fb'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#ffcf6a'
  ctx.beginPath()
  ctx.arc(W * 0.17, H * 0.45, H * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffcf6a'
  ctx.lineWidth = 4
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(W * 0.17 + Math.cos(a) * H * 0.26, H * 0.45 + Math.sin(a) * H * 0.26)
    ctx.lineTo(W * 0.17 + Math.cos(a) * H * 0.33, H * 0.45 + Math.sin(a) * H * 0.33)
    ctx.stroke()
  }
  sans(ctx, Math.round(H * 0.32), 300)
  ctx.fillStyle = '#3b5468'
  ctx.fillText('22°', W * 0.33, H * 0.55)
  sans(ctx, Math.round(H * 0.11), 600)
  ctx.fillStyle = '#2d4152'
  ctx.fillText(text, W * 0.33, H * 0.8)
  sans(ctx, Math.round(H * 0.09), 400)
  ctx.fillStyle = '#6b8193'
  ctx.fillText('PAZARTESİ · 06:52', W * 0.33, H * 0.22)
}

/** The PSA panel at the bus stop: a smiling family, all scarred; the line under them. */
export function drawPSA(ctx: C, W: number, H: number, text: string, blink: boolean) {
  sky(ctx, W, H, '#cfe9fb', '#f7fbff', H)
  ctx.fillStyle = '#a7cf8f'
  ctx.fillRect(0, H * 0.62, W, H * 0.1)
  const fam: Array<[number, number, Fig]> = [
    [0.3, 0.42, { top: '#5b7fa6', hair: '#3b2a20' }],
    [0.62, 0.4, { top: '#d97a7a', hair: '#7a4a2a', long: true }],
    [0.17, 0.27, { top: '#f2c14e', hair: '#6a4a2a' }],
    [0.8, 0.25, { top: '#7bbf8a', hair: '#c58a4a', long: true }],
  ]
  for (const [x, s, f] of fam) person(ctx, W * x, H * 0.66, H * s, { ...f, scar: true, smile: 1, eyes: blink ? 'closed' : 'open' })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, H * 0.7, W, H * 0.3)
  sans(ctx, Math.round(W * 0.064), 600)
  ctx.fillStyle = '#23384a'
  wrapText(ctx, text, W * 0.86).forEach((l, i) => ctx.fillText(l, W * 0.07, H * 0.77 + i * W * 0.08))
  sans(ctx, Math.round(W * 0.04), 500)
  ctx.fillStyle = '#6a8296'
  ctx.fillText('BİLİŞSEL STABİLİZASYON MERKEZİ', W * 0.07, H * 0.96)
}

/** Levy's archive monitor: a file list, the black box, or old files. */
export function drawArchive(ctx: C, W: number, H: number, mode: 'list' | 'black' | 'box' | 'old', box: string, reveal: number, t: number) {
  if (mode === 'black') {
    ctx.fillStyle = '#020203'
    ctx.fillRect(0, 0, W, H)
    return
  }
  if (mode === 'box') {
    ctx.fillStyle = '#020203'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#000'
    ctx.fillRect(W * 0.08, H * 0.36, W * 0.84, H * 0.26)
    ctx.strokeStyle = '#d8d8d8'
    ctx.lineWidth = 2
    ctx.strokeRect(W * 0.08, H * 0.36, W * 0.84, H * 0.26)
    mono(ctx, Math.round(H * 0.068), 600)
    ctx.fillStyle = '#f2f2f2'
    const n = Math.floor(box.length * clamp01(reveal))
    ctx.fillText(box.slice(0, n), W * 0.12, H * 0.51)
    if (Math.sin(t * 9) > 0) ctx.fillRect(W * 0.12 + ctx.measureText(box.slice(0, n)).width + 3, H * 0.455, H * 0.035, H * 0.07)
    return
  }
  ctx.fillStyle = '#e9e4d6'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#2f4c6e'
  ctx.fillRect(0, 0, W, H * 0.09)
  mono(ctx, Math.round(H * 0.05), 600)
  ctx.fillStyle = '#e9e4d6'
  ctx.fillText(mode === 'old' ? 'ŞEHİR ARŞİVİ · 1987–1994' : 'ŞEHİR ARŞİVİ · KAYIT DÜZENLEME', 10, H * 0.065)
  mono(ctx, Math.round(H * 0.048), 500)
  const rand = mulberry32(mode === 'old' ? 31 : 7)
  for (let i = 0; i < 11; i++) {
    const y = H * (0.17 + i * 0.075)
    if (i === 3 && mode === 'list') {
      ctx.fillStyle = '#c7d6e6'
      ctx.fillRect(0, y - H * 0.05, W, H * 0.07)
    }
    ctx.fillStyle = '#26303a'
    const id = `${1980 + Math.floor(rand() * 15)}-${String(Math.floor(rand() * 9999)).padStart(4, '0')}`
    ctx.fillText(`${id}  ${['tapu_kaydi', 'nufus_ek', 'imar_plani', 'dilekce', 'evlilik_k', 'ruhsat'][Math.floor(rand() * 6)]}${mode === 'old' ? '.ESK' : '_v2.dat'}`, 12, y)
  }
}

/** The kitchen's digital clock. */
export function drawDigitalClock(ctx: C, W: number, H: number, text: string) {
  ctx.fillStyle = '#121518'
  ctx.fillRect(0, 0, W, H)
  mono(ctx, Math.round(H * 0.62), 600)
  ctx.fillStyle = '#9fe3ff'
  ctx.textAlign = 'center'
  ctx.fillText(text, W / 2, H * 0.74)
  ctx.textAlign = 'left'
}

/** The notice: one page. `heavy` 0–1 darkens the last line and pales the rest. */
export function drawNotice(ctx: C, W: number, H: number, lines: string[], heavy: number) {
  ctx.fillStyle = '#f7f5ef'
  ctx.fillRect(0, 0, W, H)
  const k = W / 768
  const pale = 1 - 0.6 * heavy
  ctx.fillStyle = `rgba(30,40,56,${pale})`
  sans(ctx, 30 * k, 700)
  ctx.textAlign = 'center'
  ctx.fillText(lines[0], W / 2, 80 * k)
  sans(ctx, 22 * k, 500)
  ctx.fillText(lines[1], W / 2, 118 * k)
  ctx.textAlign = 'left'
  ctx.strokeStyle = `rgba(30,40,56,${0.4 * pale})`
  ctx.beginPath()
  ctx.moveTo(60 * k, 140 * k)
  ctx.lineTo(W - 60 * k, 140 * k)
  ctx.stroke()
  sans(ctx, 23 * k, 500)
  let y = 190 * k
  for (let i = 2; i < lines.length - 1; i++) {
    ctx.fillText(lines[i], 70 * k, y)
    y += 40 * k
  }
  // The note: everything but its last sentence, then the last sentence.
  const note = lines[lines.length - 1]
  const cut = note.lastIndexOf('Aksi durumda')
  const head = cut > 0 ? note.slice(0, cut).trim() : note
  const tail = cut > 0 ? note.slice(cut) : ''
  y += 14 * k
  sans(ctx, 22 * k, 400)
  for (const l of wrapText(ctx, head, W - 140 * k)) {
    ctx.fillText(l, 70 * k, y)
    y += 34 * k
  }
  if (tail) {
    y += 8 * k
    sans(ctx, (22 + 6 * heavy) * k, 400 + Math.round(heavy * 3) * 100)
    ctx.fillStyle = `rgba(${Math.round(30 - 20 * heavy)},${Math.round(40 - 30 * heavy)},${Math.round(56 - 40 * heavy)},1)`
    for (const l of wrapText(ctx, tail, W - 140 * k)) {
      ctx.fillText(l, 70 * k, y)
      y += 36 * k
    }
  }
  // Stamp.
  ctx.strokeStyle = `rgba(47,123,255,${0.5 * pale})`
  ctx.lineWidth = 3 * k
  ctx.beginPath()
  ctx.arc(W - 140 * k, H - 120 * k, 60 * k, 0, Math.PI * 2)
  ctx.stroke()
  mono(ctx, 14 * k, 700)
  ctx.fillStyle = `rgba(47,123,255,${0.5 * pale})`
  ctx.textAlign = 'center'
  ctx.fillText('B.S.M.', W - 140 * k, H - 115 * k)
  ctx.textAlign = 'left'
}

export function drawEnvelope(ctx: C, W: number, H: number, torn = false) {
  ctx.fillStyle = '#fbfaf6'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(W / 2, H * 0.55)
  ctx.lineTo(W, 0)
  ctx.stroke()
  if (torn) {
    // The top edge torn open: a ragged strip of shadow.
    ctx.fillStyle = 'rgba(60,50,40,0.18)'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let i = 0; i <= 16; i++) ctx.lineTo((i / 16) * W, H * (0.04 + (i % 2) * 0.05))
    ctx.lineTo(W, 0)
    ctx.closePath()
    ctx.fill()
  }
  mono(ctx, Math.round(H * 0.16), 600)
  ctx.fillStyle = '#1e2633'
  ctx.textAlign = 'center'
  ctx.fillText('LEVY A.', W / 2, H * 0.78)
  ctx.textAlign = 'left'
}

/** The phone's calendar: last Wednesday's entry. */
export function drawCalendar(ctx: C, W: number, H: number, lines: string[]) {
  ctx.fillStyle = '#f4f6f8'
  ctx.fillRect(0, 0, W, H)
  sans(ctx, Math.round(W * 0.075), 600)
  ctx.fillStyle = '#1f2a36'
  ctx.fillText('Takvim', W * 0.08, H * 0.08)
  const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
  sans(ctx, Math.round(W * 0.05), 500)
  days.forEach((d, i) => {
    ctx.fillStyle = i === 2 ? '#e8322f' : '#7a8794'
    ctx.fillText(d, W * (0.08 + i * 0.125), H * 0.14)
  })
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 7; i++) {
      const n = 3 + r * 7 + i
      const sel = r === 0 && i === 2
      if (sel) {
        ctx.fillStyle = '#2f7bff'
        ctx.beginPath()
        ctx.arc(W * (0.105 + i * 0.125), H * (0.19 + r * 0.05) - W * 0.017, W * 0.045, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = sel ? '#fff' : '#33414f'
      ctx.fillText(String(n), W * (0.08 + i * 0.125), H * (0.19 + r * 0.05))
    }
  ctx.fillStyle = '#e3ecf8'
  rrect(ctx, W * 0.06, H * 0.32, W * 0.88, H * 0.3, 14)
  ctx.fill()
  ctx.fillStyle = '#2f7bff'
  ctx.fillRect(W * 0.06, H * 0.32, W * 0.03, H * 0.3)
  lines.forEach((l, i) => {
    sans(ctx, Math.round(W * (i === 0 ? 0.062 : 0.055)), i === 0 ? 700 : 500)
    ctx.fillStyle = i === 2 ? '#5a6878' : '#1f2a36'
    wrapText(ctx, l, W * 0.76).forEach((w, j) => ctx.fillText(w, W * 0.13, H * (0.38 + i * 0.08) + j * W * 0.07))
  })
}

/** What the bus windows show: the suburb going by (a horizontal strip, scrolled by the texture offset). */
export function drawStreetStrip(ctx: C, W: number, H: number) {
  sky(ctx, W, H, '#bfe3ff', '#eef8ff', H * 0.6)
  ctx.fillStyle = '#9cc985'
  ctx.fillRect(0, H * 0.6, W, H)
  const cols = ['#f4f1ea', '#f6efd2', '#e6eef3', '#f3e2e2', '#e5f0dc']
  for (let i = 0; i < 8; i++) {
    house(ctx, i * (W / 8) + W * 0.02, H * 0.66, W / 8 - W * 0.05, H * 0.28, cols[i % cols.length])
    tree(ctx, i * (W / 8) + W * 0.11, H * 0.7, H * 0.09)
  }
  fence(ctx, H * 0.76, W, H * 0.07)
  ctx.fillStyle = '#e6e1d6'
  ctx.fillRect(0, H * 0.78, W, H * 0.22)
}

/** The volume bar and channel number laid over the TV picture. */
export function drawTvOverlay(ctx: C, W: number, H: number, volume: number | null, channel: string | null, crawl: string, crawlX: number) {
  ctx.clearRect(0, 0, W, H)
  // The crawl along the bottom.
  ctx.fillStyle = 'rgba(16,30,52,0.88)'
  ctx.fillRect(0, H * 0.84, W, H * 0.12)
  ctx.fillStyle = '#2f7bff'
  ctx.fillRect(0, H * 0.84, W * 0.16, H * 0.12)
  sans(ctx, Math.round(H * 0.045), 700)
  ctx.fillStyle = '#fff'
  ctx.fillText('MERKEZ TV', W * 0.015, H * 0.915)
  ctx.save()
  ctx.beginPath()
  ctx.rect(W * 0.17, H * 0.84, W * 0.83, H * 0.12)
  ctx.clip()
  sans(ctx, Math.round(H * 0.052), 600)
  ctx.fillText(crawl, W * 0.17 + crawlX * W, H * 0.918)
  ctx.restore()
  if (channel) {
    mono(ctx, Math.round(H * 0.09), 700)
    ctx.fillStyle = '#7dff7d'
    ctx.fillText(channel, W * 0.86, H * 0.12)
  }
  if (volume !== null) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(W * 0.2, H * 0.64, W * 0.6, H * 0.1)
    mono(ctx, Math.round(H * 0.05), 700)
    ctx.fillStyle = '#7dff7d'
    ctx.fillText('SES', W * 0.22, H * 0.705)
    const n = Math.round(volume * 20)
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i < n ? '#7dff7d' : 'rgba(125,255,125,0.15)'
      ctx.fillRect(W * (0.3 + i * 0.024), H * 0.66, W * 0.018, H * 0.06)
    }
  }
}

// ——— E. The Centre ———

export function drawSign(ctx: C, W: number, H: number, a: string, b: string) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#5b6672'
  sans(ctx, Math.round(H * 0.42), 300)
  ctx.textAlign = 'center'
  ctx.letterSpacing = `${Math.round(H * 0.05)}px`
  ctx.fillText(a, W / 2, H * 0.5)
  ctx.letterSpacing = '0px'
  sans(ctx, Math.round(H * 0.19), 400)
  ctx.fillStyle = '#7d8893'
  ctx.fillText(b, W / 2, H * 0.86)
  ctx.textAlign = 'left'
}

/** An information board. `glow` lights the line about unease after a decision. */
export function drawBoard(ctx: C, W: number, H: number, title: string, body: string, glow: number) {
  ctx.fillStyle = '#fbfcfd'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#2f7bff'
  ctx.fillRect(0, 0, W, H * 0.02)
  const k = W / 768
  sans(ctx, 44 * k, 700)
  ctx.fillStyle = '#25313d'
  ctx.fillText(title, 46 * k, 96 * k)
  sans(ctx, 30 * k, 400)
  let y = 160 * k
  const phrase = 'karar sonrası huzursuzluk'
  for (const l of wrapText(ctx, body, W - 92 * k)) {
    const i = l.indexOf(phrase)
    if (i >= 0 && glow > 0) {
      const x = 46 * k + ctx.measureText(l.slice(0, i)).width
      const w = ctx.measureText(phrase).width
      ctx.fillStyle = `rgba(255,214,120,${0.55 * glow})`
      ctx.fillRect(x - 6 * k, y - 32 * k, w + 12 * k, 44 * k)
    }
    ctx.fillStyle = '#33414f'
    ctx.fillText(l, 46 * k, y)
    y += 44 * k
  }
  sans(ctx, 18 * k, 500)
  ctx.fillStyle = '#8795a3'
  ctx.fillText('BİLİŞSEL STABİLİZASYON MERKEZİ', 46 * k, H - 30 * k)
}

export function drawDoorSign(ctx: C, W: number, H: number, text: string) {
  ctx.fillStyle = '#e9ebee'
  ctx.fillRect(0, 0, W, H)
  sans(ctx, Math.round(H * 0.7), 700)
  ctx.fillStyle = '#e8322f'
  ctx.textAlign = 'center'
  ctx.fillText(text, W / 2, H * 0.78)
  ctx.textAlign = 'left'
}

/** The reception screen. */
export function drawReception(ctx: C, W: number, H: number, name: boolean) {
  ctx.fillStyle = '#f2f6fa'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#2f7bff'
  ctx.fillRect(0, 0, W, H * 0.12)
  sans(ctx, Math.round(H * 0.08), 600)
  ctx.fillStyle = '#fff'
  ctx.fillText('RANDEVULAR', 10, H * 0.09)
  sans(ctx, Math.round(H * 0.07), 500)
  for (let i = 0; i < 6; i++) {
    const hl = name && i === 2
    ctx.fillStyle = hl ? '#ffe2df' : 'transparent'
    if (hl) ctx.fillRect(0, H * (0.2 + i * 0.12), W, H * 0.1)
    ctx.fillStyle = hl ? '#e8322f' : '#33414f'
    ctx.fillText(hl ? 'LEVY A. · KAT 3 · GECİKMİŞ' : `${['ANA K.', 'DERİN S.', '', 'ORHAN T.', 'NİL B.', 'SELİM Y.'][i]} · KAT ${1 + (i % 2)}`, 10, H * (0.27 + i * 0.12))
  }
}

// ——— F. The second floor ———

export function drawPoster(ctx: C, W: number, H: number, text: string, code: string | null, scraped: number) {
  if (code !== null) {
    ctx.fillStyle = '#05080c'
    ctx.fillRect(0, 0, W, H)
    mono(ctx, Math.round(W * 0.06), 600)
    ctx.fillStyle = '#4cff9a'
    const rand = mulberry32(code.length)
    let y = H * 0.12
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i === 6 ? '#ffb347' : `rgba(76,255,154,${0.35 + rand() * 0.5})`
      ctx.fillText(i === 6 ? code : `0x${Math.floor(rand() * 65535).toString(16).padStart(4, '0')} ${['ack', 'sync', 'tick', 'map', 'hold'][i % 5]}`, W * 0.07, y)
      y += H * 0.065
    }
    return
  }
  ctx.fillStyle = '#f4f6f6'
  ctx.fillRect(0, 0, W, H)
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.55)
  g.addColorStop(0, '#cfe5f2')
  g.addColorStop(1, '#eef6fa')
  ctx.fillStyle = g
  ctx.fillRect(W * 0.08, H * 0.06, W * 0.84, H * 0.5)
  // A calm silhouette, its ring.
  ctx.fillStyle = 'rgba(80,110,140,0.35)'
  ctx.beginPath()
  ctx.ellipse(W * 0.5, H * 0.28, W * 0.12, H * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(W * 0.32, H * 0.38, W * 0.36, H * 0.18)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(W * 0.5, H * 0.25, W * 0.125, H * 0.025, 0, 0, Math.PI * 2)
  ctx.stroke()
  sans(ctx, Math.round(W * 0.085), 600)
  ctx.fillStyle = '#25313d'
  const lines = wrapText(ctx, text, W * 0.8)
  lines.forEach((l, i) => ctx.fillText(l, W * 0.1, H * 0.66 + i * W * 0.1))
  sans(ctx, Math.round(W * 0.035), 500)
  ctx.fillStyle = '#8795a3'
  ctx.fillText('B.S.M. · KAT 2', W * 0.1, H * 0.95)
  if (scraped > 0) {
    // Scraped: torn strips showing the wall.
    const rand = mulberry32(5)
    ctx.fillStyle = '#d8dcd6'
    for (let i = 0; i < 9; i++) {
      ctx.beginPath()
      const x = rand() * W
      const y = rand() * H * 0.6
      ctx.moveTo(x, y)
      ctx.lineTo(x + W * (0.2 + rand() * 0.4), y + rand() * H * 0.05)
      ctx.lineTo(x + W * (0.1 + rand() * 0.3), y + H * (0.06 + rand() * 0.08))
      ctx.lineTo(x - W * 0.05, y + H * 0.04)
      ctx.fill()
    }
  }
}

/** The three kiosks. */
export function drawKiosk(ctx: C, W: number, H: number, label: string, mode: 'off' | 'face' | 'lines' | 'wave', lines: string[], t: number, noise: number) {
  ctx.fillStyle = '#04070b'
  ctx.fillRect(0, 0, W, H)
  if (mode === 'off') {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, 'rgba(255,255,255,0.06)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    return
  }
  mono(ctx, Math.round(H * 0.07), 700)
  ctx.fillStyle = '#9fc4ff'
  ctx.fillText(label, W * 0.06, H * 0.12)
  if (mode === 'face') {
    // His own photo.
    ctx.fillStyle = '#c9d2dc'
    ctx.fillRect(W * 0.06, H * 0.2, W * 0.32, H * 0.55)
    person(ctx, W * 0.22, H * 0.95, H * 0.95, { top: '#b9d3ef', hair: '#3a2a20', scar: true, smile: 0.2 })
    ctx.fillStyle = '#04070b'
    ctx.fillRect(0, H * 0.76, W * 0.45, H * 0.3)
    mono(ctx, Math.round(H * 0.1), 700)
    ctx.fillStyle = '#e8eef6'
    ctx.fillText(lines[1] ?? '', W * 0.45, H * 0.38)
    ctx.fillStyle = '#ff5a52'
    ctx.fillText(lines[2] ?? '', W * 0.45, H * 0.56)
  } else if (mode === 'lines') {
    mono(ctx, Math.round(H * 0.068), 500)
    lines.slice(1).forEach((l, i) => {
      const last = i === lines.length - 2
      ctx.fillStyle = last ? '#ffb347' : '#dfe8f2'
      wrapText(ctx, l, W * 0.88).forEach((w, j) => ctx.fillText(w, W * 0.06, H * (0.3 + i * 0.15) + j * H * 0.08))
    })
  } else {
    ctx.strokeStyle = '#9fc4ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const f = i / 200
      const env = Math.max(0, Math.sin(f * Math.PI * 2 + t * 0.7)) * (f < 0.5 ? 1 : 0.45)
      const y = H * 0.55 + Math.sin(f * 140 + t * 20) * H * 0.18 * env
      if (i === 0) ctx.moveTo(f * W, y)
      else ctx.lineTo(f * W, y)
    }
    ctx.stroke()
  }
  if (noise > 0) {
    const rand = mulberry32(Math.floor(t * 30))
    for (let i = 0; i < 40 * noise; i++) {
      const y = rand() * H
      ctx.fillStyle = `rgba(${rand() < 0.5 ? 255 : 120},${Math.floor(rand() * 255)},255,${0.3 + rand() * 0.5})`
      ctx.fillRect(0, y, W, 2 + rand() * H * 0.04)
    }
    grain(ctx, W, H, 4 * noise, Math.floor(t * 30))
  }
}

// ——— G. The stretcher room ———

const OLD = (ctx: C, W: number, H: number, seed: number, tint = 'rgba(70,90,110,0.25)') => {
  ctx.fillStyle = tint
  ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, 1.2, seed)
  scanlines(ctx, W, H, 0.14)
  vignette(ctx, W, H, 0.7)
}

/** A grainy old recording of the Libet experiment: a subject, electrodes, a button, a dial. */
export function drawLibet(ctx: C, W: number, H: number, t: number, flick: number, glance: number) {
  ctx.fillStyle = '#9a9a94'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#7f7f79'
  ctx.fillRect(0, H * 0.72, W, H * 0.28)
  // Chair and subject in profile, facing right.
  ctx.fillStyle = '#4c4c48'
  ctx.fillRect(W * 0.22, H * 0.42, W * 0.04, H * 0.42)
  ctx.fillRect(W * 0.22, H * 0.6, W * 0.2, H * 0.04)
  ctx.fillStyle = '#3e3e3a'
  rrect(ctx, W * 0.26, H * 0.36, W * 0.12, H * 0.26, 10)
  ctx.fill()
  ctx.fillStyle = '#b8a898'
  const hx = W * 0.33 + glance * W * 0.01
  ctx.beginPath()
  ctx.ellipse(hx, H * 0.29, W * 0.035, H * 0.075, 0, 0, Math.PI * 2)
  ctx.fill()
  // Electrodes and wires.
  ctx.fillStyle = '#222'
  for (let i = 0; i < 5; i++) {
    const a = -2.6 + i * 0.4
    ctx.beginPath()
    ctx.arc(hx + Math.cos(a) * W * 0.034, H * 0.29 + Math.sin(a) * H * 0.07, W * 0.006, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(hx - W * 0.02, H * 0.23)
  ctx.bezierCurveTo(W * 0.2, H * 0.1, W * 0.1, H * 0.3, W * 0.06, H * 0.7)
  ctx.stroke()
  // Arm to the button, the wrist flicking.
  ctx.strokeStyle = '#3e3e3a'
  ctx.lineWidth = W * 0.022
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(W * 0.34, H * 0.45)
  ctx.lineTo(W * 0.46, H * 0.56)
  ctx.lineTo(W * 0.54, H * (0.56 - 0.05 * flick))
  ctx.stroke()
  ctx.fillStyle = '#2a2a28'
  ctx.fillRect(W * 0.52, H * 0.58, W * 0.06, H * 0.03)
  ctx.fillStyle = '#a33'
  ctx.beginPath()
  ctx.arc(W * 0.55, H * 0.575, W * 0.01, 0, Math.PI * 2)
  ctx.fill()
  // The dial.
  const dx = W * 0.78
  const dy = H * 0.34
  const r = H * 0.2
  ctx.fillStyle = '#d8d6cc'
  ctx.beginPath()
  ctx.arc(dx, dy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2a2a28'
  ctx.lineWidth = 3
  ctx.stroke()
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const l = i % 5 === 0 ? 0.16 : 0.07
    ctx.beginPath()
    ctx.moveTo(dx + Math.sin(a) * r * (1 - l), dy - Math.cos(a) * r * (1 - l))
    ctx.lineTo(dx + Math.sin(a) * r * 0.97, dy - Math.cos(a) * r * 0.97)
    ctx.stroke()
  }
  const a = (t / 2.56) * Math.PI * 2
  ctx.fillStyle = '#c42'
  ctx.beginPath()
  ctx.arc(dx + Math.sin(a) * r * 0.78, dy - Math.cos(a) * r * 0.78, r * 0.07, 0, Math.PI * 2)
  ctx.fill()
  // Sight line when he glances at the dial.
  if (glance > 0.05) {
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * glance})`
    ctx.setLineDash([6, 6])
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hx + W * 0.03, H * 0.28)
    ctx.lineTo(dx - r, dy)
    ctx.stroke()
    ctx.setLineDash([])
  }
  mono(ctx, Math.round(H * 0.045), 600)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText('KAYIT 1 · 1983 · W-ZAMANI', W * 0.04, H * 0.08)
  OLD(ctx, W, H, Math.floor(t * 12), 'rgba(110,100,80,0.18)')
}

/** The time axis with three marks, the readiness curve, and later the crack between 1 and 2. */
export function drawMarks(ctx: C, W: number, H: number, m1: number, m2: number, m3: number, crack: number, push: number, t: number) {
  const k = W / 1024
  ctx.fillStyle = '#060a10'
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  // Push into the gap between 1 and 2.
  const cx = W * 0.42
  ctx.translate(cx, H * 0.55)
  ctx.scale(1 + push * 0.9, 1 + push * 0.9)
  ctx.translate(-cx, -H * 0.55)
  const y0 = H * 0.72
  ctx.strokeStyle = 'rgba(207,224,255,0.6)'
  ctx.lineWidth = 2 * k
  ctx.beginPath()
  ctx.moveTo(60 * k, y0)
  ctx.lineTo(W - 60 * k, y0)
  ctx.stroke()
  mono(ctx, 18 * k, 500)
  ctx.fillStyle = DIM
  for (let i = -3; i <= 1; i++) {
    const x = W * 0.66 + i * 150 * k
    ctx.fillRect(x, y0 - 6 * k, 1.5 * k, 12 * k)
    ctx.fillText(`${i * 500} ms`, x - 30 * k, y0 + 34 * k)
  }
  const X1 = W * 0.26
  const X2 = W * 0.58
  const X3 = W * 0.66
  // The readiness potential: a slow curve rising before mark 1.
  if (m1 > 0) {
    ctx.strokeStyle = `rgba(47,123,255,${m1})`
    ctx.lineWidth = 4 * k
    ctx.beginPath()
    for (let i = 0; i <= 120; i++) {
      const f = i / 120
      const x = 60 * k + f * (X3 - 60 * k)
      const rise = Math.max(0, (x - X1 * 0.6) / (X3 - X1 * 0.6))
      const y = y0 - 30 * k - Math.pow(rise, 1.6) * 260 * k * m1 + Math.sin(f * 40 + t * 3) * 3 * k
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  const mark = (x: number, a: number, col: string, n: string, label: string) => {
    if (a <= 0) return
    ctx.globalAlpha = a
    ctx.fillStyle = col
    ctx.fillRect(x - 3 * k, y0 - 380 * k, 6 * k, 380 * k)
    sans(ctx, 54 * k, 700)
    ctx.fillText(n, x - 14 * k, y0 - 400 * k)
    sans(ctx, 17 * k, 600)
    ctx.fillText(label, x + 10 * k, y0 - 350 * k)
    ctx.globalAlpha = 1
  }
  mark(X1, m1, '#2f7bff', '1', 'HAZIRLIK')
  mark(X2, m2, AMBER, '2', '“ŞİMDİ”')
  mark(X3, m3, '#ffffff', '3', 'HAREKET')
  if (crack > 0) {
    // A thin white crack drawing itself between 1 and 2.
    const rand = mulberry32(4)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5 * k
    ctx.shadowColor = '#fff'
    ctx.shadowBlur = 12 * k
    ctx.beginPath()
    let x = X1 + 20 * k
    let y = y0 - 200 * k
    ctx.moveTo(x, y)
    const steps = Math.floor(30 * crack)
    for (let i = 0; i < steps; i++) {
      x += ((X2 - X1 - 40 * k) / 30) * (0.6 + rand() * 0.8)
      y += (rand() - 0.5) * 60 * k
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  ctx.restore()
}

/** Subjects' hands on a table, electrode pads on the forearms; one finger twitches at a time. */
export function drawFingers(ctx: C, W: number, H: number, t: number) {
  ctx.fillStyle = '#8f8b80'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#6d6a62'
  ctx.fillRect(0, H * 0.45, W, H * 0.55)
  for (let i = 0; i < 4; i++) {
    const x = W * (0.13 + i * 0.25)
    ctx.fillStyle = '#4a4a46'
    ctx.fillRect(x - W * 0.05, H * 0.1, W * 0.1, H * 0.35)
    ctx.fillStyle = '#b8a898'
    ctx.fillRect(x - W * 0.035, H * 0.45, W * 0.07, H * 0.25)
    ctx.fillStyle = '#e6e6e0'
    ctx.fillRect(x - W * 0.025, H * 0.5, W * 0.05, H * 0.04)
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, H * 0.5)
    ctx.lineTo(x + W * 0.04, H * 0.3)
    ctx.stroke()
    ctx.fillStyle = '#b8a898'
    for (let f = 0; f < 4; f++) {
      const tw = (Math.floor(t * 2.3) % 4 === f && (Math.floor(t * 0.9) + i) % 3 === 0) ? -H * 0.05 : 0
      ctx.fillRect(x - W * 0.03 + f * W * 0.017, H * 0.7 + tw, W * 0.012, H * 0.12)
    }
  }
  mono(ctx, Math.round(H * 0.05), 600)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText('KAYIT 2 · DIŞ UYARIM', W * 0.04, H * 0.08)
  OLD(ctx, W, H, Math.floor(t * 12) + 3, 'rgba(60,80,100,0.2)')
}

/** Five faces, one after another, each answering. */
export function drawFaces(ctx: C, W: number, H: number, index: number, t: number, frozen: boolean) {
  ctx.fillStyle = '#8a8880'
  ctx.fillRect(0, 0, W, H)
  const looks: Fig[] = [
    { top: '#5a5a55', hair: '#2a2420' },
    { top: '#6a5a50', hair: '#8a6a40', long: true },
    { top: '#4a5560', hair: '#cfcfcf' },
    { top: '#5a4a50', hair: '#1a1410', long: true },
    { top: '#555a4a', hair: '#5a4030' },
  ]
  const i = Math.max(0, Math.min(4, index))
  person(ctx, W * 0.5, H * 2.1, H * 2.4, { ...looks[i], smile: frozen ? 1 : 0.4 + 0.3 * Math.sin(t * 6), eyes: 'open' })
  mono(ctx, Math.round(H * 0.05), 600)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText(`DENEK ${i + 1}/5 · “NEDEN?”`, W * 0.04, H * 0.08)
  if (frozen) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillRect(W * 0.04, H * 0.86, W * 0.03, H * 0.08)
    ctx.fillRect(W * 0.09, H * 0.86, W * 0.03, H * 0.08)
  }
  OLD(ctx, W, H, Math.floor(t * 12) + 7 + i, 'rgba(90,80,60,0.2)')
}

/** Four identical rooms, four subjects reacting differently; notes underneath. */
export function drawFourRooms(ctx: C, W: number, H: number, notes: string[], notesOn: number, t: number) {
  ctx.fillStyle = '#05080c'
  ctx.fillRect(0, 0, W, H)
  const pw = W * 0.23
  const ph = H * 0.56
  const moods: Array<{ smile: number; eyes: 'open' | 'closed'; lean: number }> = [
    { smile: -0.6, eyes: 'open', lean: -0.2 },
    { smile: 0.3, eyes: 'closed', lean: 0 },
    { smile: -1, eyes: 'closed', lean: 0.1 },
    { smile: 1, eyes: 'open', lean: 0 },
  ]
  for (let i = 0; i < 4; i++) {
    const x = W * 0.02 + i * (pw + W * 0.015)
    const y = H * 0.06
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, pw, ph)
    ctx.clip()
    ctx.fillStyle = '#a9a69c'
    ctx.fillRect(x, y, pw, ph)
    ctx.fillStyle = '#8c897f'
    ctx.fillRect(x, y + ph * 0.7, pw, ph * 0.3)
    ctx.fillStyle = '#6b665c'
    ctx.fillRect(x + pw * 0.55, y + ph * 0.62, pw * 0.35, ph * 0.05)
    ctx.fillRect(x + pw * 0.6, y + ph * 0.67, pw * 0.03, ph * 0.2)
    ctx.fillRect(x + pw * 0.83, y + ph * 0.67, pw * 0.03, ph * 0.2)
    // The same shadow on every wall.
    ctx.fillStyle = 'rgba(40,40,40,0.35)'
    ctx.beginPath()
    ctx.ellipse(x + pw * 0.82, y + ph * 0.3, pw * 0.08, ph * 0.18, 0.2, 0, Math.PI * 2)
    ctx.fill()
    const m = moods[i]
    ctx.translate(x + pw * 0.35, y + ph * 0.95)
    ctx.rotate(m.lean)
    person(ctx, 0, 0, ph * 0.75, { top: '#5a5a55', hair: '#3a3028', smile: m.smile, eyes: m.eyes, turn: i === 0 ? 0.5 : 0 })
    ctx.restore()
    ctx.strokeStyle = 'rgba(207,224,255,0.4)'
    ctx.strokeRect(x, y, pw, ph)
  }
  OLD(ctx, W, H * 0.64, Math.floor(t * 12) + 11, 'rgba(70,90,110,0.12)')
  if (notesOn > 0) {
    ctx.globalAlpha = clamp01(notesOn)
    let size = Math.round(H * 0.065)
    mono(ctx, size, 700)
    const gap = '   '
    const full = ctx.measureText(notes.join(gap)).width
    if (full > W * 0.92) {
      size = Math.floor((size * W * 0.92) / full)
      mono(ctx, size, 700)
    }
    let x = (W - ctx.measureText(notes.join(gap)).width) / 2
    notes.forEach((n, i) => {
      ctx.fillStyle = i === 2 ? '#4cff9a' : '#e6eef8'
      ctx.fillText(n, x, H * 0.84)
      x += ctx.measureText(n + gap).width
    })
    ctx.globalAlpha = 1
  }
}

/** The brain schema: labelled glowing regions. */
export function drawSchema(ctx: C, W: number, H: number, t: number) {
  const k = W / 1024
  ctx.fillStyle = '#04070c'
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.translate(W * 0.5, H * 0.52)
  ctx.strokeStyle = 'rgba(207,224,255,0.65)'
  ctx.lineWidth = 3 * k
  ctx.beginPath()
  ctx.ellipse(0, 0, 330 * k, 210 * k, 0, 0, Math.PI * 2)
  ctx.stroke()
  const regions: Array<[number, number, number, string, string]> = [
    [-200, -60, 60, '#2f7bff', 'DUYULAR'],
    [-60, -140, 55, '#ffffff', 'MOTOR ALAN'],
    [110, -100, 60, '#ffb347', 'KARAR AĞLARI'],
    [210, 40, 55, '#e8322f', 'DUYGU'],
    [0, 60, 70, '#5fe0c0', 'BELLEK'],
    [-170, 110, 50, '#c8a6e8', 'BEDEN HARİTASI'],
  ]
  regions.forEach(([x, y, r, col, label], i) => {
    const p = 0.5 + 0.5 * Math.sin(t * 1.4 + i)
    const g = ctx.createRadialGradient(x * k, y * k, 2, x * k, y * k, r * k)
    g.addColorStop(0, col)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalAlpha = 0.45 + 0.35 * p
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x * k, y * k, r * k, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    sans(ctx, 20 * k, 700)
    ctx.fillStyle = '#e6eef8'
    ctx.fillText(label, x * k - ctx.measureText(label).width / 2, y * k + 6 * k)
  })
  ctx.restore()
}

/** The face that breaks the pattern: a dark screen, one line typing itself slowly. */
export function drawTyped(ctx: C, W: number, H: number, text: string, reveal: number, t: number) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  mono(ctx, Math.round(H * 0.075), 500)
  ctx.fillStyle = '#f2f2f2'
  const n = Math.floor(text.length * clamp01(reveal))
  const w = ctx.measureText(text).width
  const x = (W - w) / 2
  ctx.fillText(text.slice(0, n), x, H * 0.8)
  if (reveal > 0 && Math.sin(t * 6) > 0) ctx.fillRect(x + ctx.measureText(text.slice(0, n)).width + 4, H * 0.74, H * 0.035, H * 0.075)
}

export type Heaven = 'sea' | 'mountain' | 'summer' | 'tea'
/** Other subjects' heavens. */
export function drawHeaven(ctx: C, W: number, H: number, kind: Heaven, t: number) {
  if (kind === 'sea') {
    drawWorld(ctx, W, H, 'sea', 0, t)
    return
  }
  if (kind === 'mountain') {
    sky(ctx, W, H, '#9fc9ec', '#e6f2fb', H * 0.7)
    ctx.fillStyle = '#7d8fa3'
    ctx.beginPath()
    ctx.moveTo(0, H * 0.6)
    ctx.lineTo(W * 0.3, H * 0.2)
    ctx.lineTo(W * 0.55, H * 0.55)
    ctx.lineTo(W * 0.75, H * 0.3)
    ctx.lineTo(W, H * 0.6)
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(W * 0.24, H * 0.28)
    ctx.lineTo(W * 0.3, H * 0.2)
    ctx.lineTo(W * 0.36, H * 0.28)
    ctx.fill()
    ctx.fillStyle = '#6b8f55'
    ctx.fillRect(0, H * 0.72, W, H * 0.28)
    ctx.fillStyle = '#8a5a3a'
    ctx.fillRect(W * 0.55, H * 0.5, W * 0.25, H * 0.24)
    ctx.fillStyle = '#5a3a28'
    ctx.beginPath()
    ctx.moveTo(W * 0.53, H * 0.5)
    ctx.lineTo(W * 0.675, H * 0.38)
    ctx.lineTo(W * 0.82, H * 0.5)
    ctx.fill()
    ctx.fillStyle = 'rgba(220,220,220,0.6)'
    ctx.beginPath()
    ctx.arc(W * 0.75 + Math.sin(t) * 4, H * 0.33 - (t * 6) % 20, 6, 0, Math.PI * 2)
    ctx.fill()
    person(ctx, W * 0.42, H * 0.92, H * 0.4, { top: '#7a4a3a', hair: '#555', smile: 0.8 })
  } else if (kind === 'summer') {
    sky(ctx, W, H, '#7fc8ff', '#fff4c8', H * 0.65)
    ctx.fillStyle = '#ffd34d'
    ctx.beginPath()
    ctx.arc(W * 0.8, H * 0.18, H * 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8fd16a'
    ctx.fillRect(0, H * 0.65, W, H * 0.35)
    ctx.fillStyle = '#5ab0e8'
    ctx.fillRect(W * 0.1, H * 0.75, W * 0.35, H * 0.12)
    person(ctx, W * 0.6 + Math.sin(t * 2) * W * 0.05, H * 0.95, H * 0.36, { top: '#ff6b4a', hair: '#c58a4a', arms: 'up', smile: 1 })
  } else {
    ctx.fillStyle = '#f0e2c6'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#bfe0f2'
    ctx.fillRect(W * 0.6, H * 0.12, W * 0.3, H * 0.36)
    ctx.fillStyle = '#c9a77a'
    ctx.fillRect(0, H * 0.64, W, H * 0.08)
    person(ctx, W * 0.3, H * 1.02, H * 0.72, { top: '#6b7a5a', hair: '#ddd', smile: 0.9 })
    person(ctx, W * 0.62, H * 1.02, H * 0.7, { top: '#b07a8a', hair: '#e8e8e8', bun: true, smile: 0.9, arms: 'cup' })
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(W * (0.5 + i * 0.02), H * 0.6)
      ctx.quadraticCurveTo(W * (0.48 + i * 0.02) + Math.sin(t * 2 + i) * 6, H * 0.5, W * (0.5 + i * 0.02), H * 0.42)
      ctx.stroke()
    }
  }
  scanlines(ctx, W, H, 0.06)
}

/** The second-floor corridor from the outside, as a security camera saw it: plain staff, a frightened man. */
export function drawCorridorCCTV(ctx: C, W: number, H: number, t: number, close: number) {
  ctx.fillStyle = '#c9cdc9'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#b5b9b4'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(W * 0.38, H * 0.35)
  ctx.lineTo(W * 0.38, H * 0.7)
  ctx.lineTo(0, H)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(W, 0)
  ctx.lineTo(W * 0.62, H * 0.35)
  ctx.lineTo(W * 0.62, H * 0.7)
  ctx.lineTo(W, H)
  ctx.fill()
  ctx.fillStyle = '#e0e2df'
  ctx.beginPath()
  ctx.moveTo(0, H)
  ctx.lineTo(W * 0.38, H * 0.7)
  ctx.lineTo(W * 0.62, H * 0.7)
  ctx.lineTo(W, H)
  ctx.fill()
  ctx.strokeStyle = '#c8322f'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(W * 0.5, H)
  ctx.lineTo(W * 0.5, H * 0.7)
  ctx.stroke()
  const s = 1 + close * 1.6
  ctx.save()
  ctx.translate(W * 0.5, H * 0.95)
  ctx.scale(s, s)
  ctx.translate(-W * 0.5, -H * 0.95)
  person(ctx, W * 0.4, H * 0.93, H * 0.5, { top: '#b9c4cc', hair: '#3a2a20', smile: -0.6, eyes: 'open' })
  person(ctx, W * 0.56, H * 0.95, H * 0.52, { top: '#f2f2f0', hair: '#4a3426', bun: true, smile: -0.2, arms: 'flick' })
  person(ctx, W * 0.68, H * 0.96, H * 0.56, { top: '#f2f2f0', hair: '#2a2420', smile: 0 })
  ctx.restore()
  mono(ctx, Math.round(H * 0.06), 600)
  ctx.fillStyle = '#fff'
  ctx.fillText(`KAT 2 · KAMERA 04 · 09:4${Math.floor(t) % 10}`, W * 0.04, H * 0.1)
  OLD(ctx, W, H, Math.floor(t * 12) + 21, 'rgba(60,70,60,0.12)')
}

/** Kitchen split: the real body on the left, the same person's sunny kitchen on the right. */
export function drawKitchenSplit(ctx: C, W: number, H: number, sight: number, hearing: number, t: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W / 2, H)
  ctx.clip()
  drawBody(ctx, W / 2, H)
  mono(ctx, Math.round(H * 0.07), 700)
  ctx.fillStyle = `rgba(95,224,192,${0.4 + 0.6 * sight})`
  ctx.fillText('GÖRME', W * 0.04, H * 0.15)
  ctx.fillStyle = `rgba(255,179,71,${0.4 + 0.6 * hearing})`
  ctx.fillText('İŞİTME', W * 0.04, H * 0.27)
  ctx.restore()
  ctx.save()
  ctx.translate(W / 2, 0)
  ctx.beginPath()
  ctx.rect(0, 0, W / 2, H)
  ctx.clip()
  const w = W / 2
  ctx.fillStyle = '#f6e9cf'
  ctx.fillRect(0, 0, w, H)
  if (sight > 0) {
    ctx.globalAlpha = clamp01(sight)
    sky(ctx, w, H, '#bfe3ff', '#eef8ff', H * 0.5)
    ctx.fillStyle = '#f6e9cf'
    ctx.fillRect(0, 0, w * 0.25, H)
    ctx.fillRect(w * 0.85, 0, w * 0.15, H)
    ctx.fillRect(0, H * 0.5, w, H * 0.5)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 6
    ctx.strokeRect(w * 0.25, H * 0.05, w * 0.6, H * 0.45)
    ctx.globalAlpha = 1
  }
  if (hearing > 0) {
    ctx.fillStyle = '#4a3a30'
    ctx.beginPath()
    ctx.ellipse(w * 0.55, H * 0.47, 9, 6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(w * 0.6, H * 0.44, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#c9a77a'
  ctx.fillRect(0, H * 0.7, w, H * 0.06)
  person(ctx, w * 0.35, H * 1.05, H * 0.75, { top: '#9a8a70', hair: '#555', smile: 0.6, arms: 'cup' })
  ctx.fillStyle = '#f2efe8'
  ctx.fillRect(w * 0.62, H * 0.62, w * 0.08, H * 0.08)
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(w * (0.64 + i * 0.015), H * 0.6)
    ctx.quadraticCurveTo(w * (0.62 + i * 0.015) + Math.sin(t * 2 + i) * 5, H * 0.52, w * (0.64 + i * 0.015), H * 0.44)
    ctx.stroke()
  }
  ctx.restore()
  ctx.fillStyle = '#000'
  ctx.fillRect(W / 2 - 2, 0, 4, H)
}

export type LogState = { lines: string[]; shown: number; amber: boolean; blink: boolean; strip: number; t: number }

/** The log: a montage strip of Levy's week across the top, the log lines scrolling up below. */
export function drawLog(ctx: C, W: number, H: number, s: LogState) {
  const k = W / 1024
  ctx.fillStyle = '#03060a'
  ctx.fillRect(0, 0, W, H)
  // Montage strip.
  const frames = ['bed', 'curtains', 'mirror', 'elen', 'bus', 'archive', 'letter', 'centre', 'redline']
  const fi = Math.min(frames.length - 1, Math.floor(s.strip * frames.length))
  const sw = W * 0.6
  const sh = H * 0.36
  const sx = (W - sw) / 2
  ctx.save()
  ctx.beginPath()
  ctx.rect(sx, 20 * k, sw, sh)
  ctx.clip()
  ctx.translate(sx, 20 * k)
  const f = frames[fi]
  if (f === 'redline') {
    ctx.fillStyle = '#f2f3f4'
    ctx.fillRect(0, 0, sw, sh)
    ctx.fillStyle = '#2f7bff'
    ctx.beginPath()
    ctx.moveTo(sw * 0.5, sh)
    ctx.quadraticCurveTo(sw * 0.45, sh * 0.4, sw * 0.1, sh * 0.25)
    ctx.lineTo(sw * 0.1, sh * 0.3)
    ctx.quadraticCurveTo(sw * 0.42, sh * 0.45, sw * 0.46, sh)
    ctx.fill()
    ctx.fillStyle = '#e8322f'
    ctx.fillRect(sw * 0.53, 0, sw * 0.05, sh)
    ctx.fillStyle = '#1c1a18'
    rrect(ctx, sw * 0.45, sh * 0.45, sw * 0.16, sh * 0.2, 20 * k)
    ctx.fill()
  } else if (f === 'elen') thumb(ctx, 0, 0, sw, sh, 2)
  else if (f === 'archive') thumb(ctx, 0, 0, sw, sh, 3)
  else if (f === 'bus') thumb(ctx, 0, 0, sw, sh, 4)
  else if (f === 'centre') thumb(ctx, 0, 0, sw, sh, 5)
  else if (f === 'letter') {
    ctx.fillStyle = '#c9b49a'
    ctx.fillRect(0, 0, sw, sh)
    ctx.fillStyle = '#f7f5ef'
    ctx.fillRect(sw * 0.3, sh * 0.1, sw * 0.4, sh * 0.85)
  } else if (f === 'mirror') {
    ctx.fillStyle = '#dfe9ee'
    ctx.fillRect(0, 0, sw, sh)
    person(ctx, sw * 0.5, sh * 1.5, sh * 1.6, { top: '#b9d3ef', hair: '#3a2a20', scar: true, smile: 0.2 })
  } else if (f === 'bed') {
    // Monday dawn: the bedroom, the window warming, Levy asleep.
    ctx.fillStyle = '#e9e2d4'
    ctx.fillRect(0, 0, sw, sh)
    const sky = ctx.createLinearGradient(0, sh * 0.12, 0, sh * 0.55)
    sky.addColorStop(0, '#bfdcf2')
    sky.addColorStop(1, '#ffd9a8')
    ctx.fillStyle = sky
    ctx.fillRect(sw * 0.66, sh * 0.12, sw * 0.24, sh * 0.43)
    ctx.fillStyle = '#9fb69a'
    ctx.fillRect(sw * 0.62, sh * 0.08, sw * 0.05, sh * 0.52)
    ctx.fillRect(sw * 0.89, sh * 0.08, sw * 0.05, sh * 0.52)
    ctx.fillStyle = '#b89a78'
    ctx.fillRect(sw * 0.06, sh * 0.42, sw * 0.05, sh * 0.42)
    ctx.fillStyle = '#cfe0ee'
    ctx.fillRect(sw * 0.1, sh * 0.62, sw * 0.46, sh * 0.2)
    ctx.fillStyle = '#f7f3ea'
    ctx.fillRect(sw * 0.11, sh * 0.56, sw * 0.1, sh * 0.08)
    ctx.fillStyle = '#d9b39a'
    ctx.beginPath()
    ctx.arc(sw * 0.16, sh * 0.55, sh * 0.06, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3b2a1e'
    ctx.beginPath()
    ctx.arc(sw * 0.16, sh * 0.53, sh * 0.06, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#b9cfe2'
    ctx.fillRect(sw * 0.22, sh * 0.55, sw * 0.34, sh * 0.12)
  } else {
    // The curtains part by themselves; the same sun.
    const sky = ctx.createLinearGradient(0, 0, 0, sh)
    sky.addColorStop(0, '#bfe3ff')
    sky.addColorStop(1, '#ffe9c4')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, sw, sh)
    ctx.fillStyle = '#9cc985'
    ctx.fillRect(0, sh * 0.72, sw, sh * 0.28)
    ctx.fillStyle = '#fff3c9'
    ctx.beginPath()
    ctx.arc(sw * 0.62, sh * 0.42, sh * 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#7f9a7c'
    ctx.fillRect(0, 0, sw * 0.24, sh)
    ctx.fillRect(sw * 0.76, 0, sw * 0.24, sh)
    ctx.fillStyle = '#f3ead8'
    ctx.fillRect(0, 0, sw, sh * 0.06)
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(207,224,255,0.5)'
  ctx.strokeRect(sx, 20 * k, sw, sh)
  mono(ctx, 15 * k, 600)
  ctx.fillStyle = DIM
  ctx.fillText(`L-31 · REPLAY · ${String(fi + 1).padStart(2, '0')}/09`, sx, 20 * k + sh + 22 * k)
  // The log, newest at the bottom, scrolling up.
  const lineH = 34 * k
  const top = H * 0.48
  const visible = Math.floor((H - top - 10 * k) / lineH)
  const start = Math.max(0, s.shown - visible)
  mono(ctx, 24 * k, 500)
  for (let i = start; i < s.shown; i++) {
    const line = s.lines[i]
    const y = top + (i - start + 0.8) * lineH
    const hot = /blue_line_exit|red_line_priority/.test(line)
    const step = /red_line_step/.test(line)
    if (hot && s.amber) {
      ctx.fillStyle = s.blink ? 'rgba(255,179,71,0.25)' : 'rgba(255,179,71,0.08)'
      ctx.fillRect(40 * k, y - 25 * k, W - 80 * k, lineH)
    }
    ctx.fillStyle = hot && s.amber ? AMBER : step ? '#ff8a84' : line.startsWith('generated') ? 'rgba(207,224,255,0.75)' : '#e6eef8'
    ctx.fillText(line, 60 * k, y)
  }
  void s.t
}

/** The oscilloscope's last line: a pulse, then flat with a small regular blip. */
export function drawSignal(ctx: C, W: number, H: number, draw: number, pulse: number, t: number) {
  ctx.clearRect(0, 0, W, H)
  ctx.strokeStyle = '#5fe0c0'
  ctx.lineWidth = 3
  ctx.shadowColor = '#5fe0c0'
  ctx.shadowBlur = 10
  ctx.beginPath()
  const n = Math.floor(300 * clamp01(draw))
  for (let i = 0; i <= n; i++) {
    const f = i / 300
    const ph = (f * 6 - t * 0.5) % 1
    const blip = ph > 0.48 && ph < 0.52 ? Math.sin(((ph - 0.48) / 0.04) * Math.PI) * 0.12 : 0
    const big = Math.exp(-Math.pow((f - 0.5) / 0.03, 2)) * 0.6 * pulse * Math.sin(f * 120)
    const y = H / 2 - (blip + big) * H
    if (i === 0) ctx.moveTo(f * W, y)
    else ctx.lineTo(f * W, y)
  }
  ctx.stroke()
  ctx.shadowBlur = 0
}

/** Idle screen-wall glow. */
export function drawIdle(ctx: C, W: number, H: number, label: string) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#0b1a2e')
  g.addColorStop(1, '#06101c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(120,170,255,0.12)'
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  mono(ctx, Math.round(H * 0.05), 500)
  ctx.fillStyle = 'rgba(160,190,240,0.5)'
  ctx.fillText(label, W * 0.04, H * 0.1)
}

/** The vitals monitor on the stretcher. */
export function drawVitals(ctx: C, W: number, H: number, t: number) {
  ctx.fillStyle = '#03060a'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#4cff9a'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i <= 80; i++) {
    const f = i / 80
    const ph = (f * 2 + t * 0.9) % 1
    const y = H * 0.4 - (ph > 0.45 && ph < 0.49 ? H * 0.25 : 0)
    if (i === 0) ctx.moveTo(f * W, y)
    else ctx.lineTo(f * W, y)
  }
  ctx.stroke()
  mono(ctx, Math.round(H * 0.22), 700)
  ctx.fillStyle = '#4cff9a'
  ctx.fillText('72', W * 0.06, H * 0.88)
  ctx.fillStyle = '#9fc4ff'
  ctx.fillText('98%', W * 0.5, H * 0.88)
}

/** A form on paper. */
export function drawForm(ctx: C, W: number, H: number) {
  ctx.fillStyle = '#fbfaf6'
  ctx.fillRect(0, 0, W, H)
  sans(ctx, Math.round(H * 0.05), 700)
  ctx.fillStyle = '#25313d'
  ctx.fillText('UYUM ONAYI · KAT 3', W * 0.08, H * 0.09)
  ctx.strokeStyle = 'rgba(37,49,61,0.35)'
  for (let i = 0; i < 9; i++) {
    const y = H * (0.18 + i * 0.08)
    ctx.beginPath()
    ctx.moveTo(W * 0.08, y)
    ctx.lineTo(W * 0.92, y)
    ctx.stroke()
    ctx.strokeRect(W * 0.08, y - H * 0.045, H * 0.035, H * 0.035)
  }
  ctx.fillStyle = '#2f7bff'
  ctx.fillRect(W * 0.08, H * 0.88, W * 0.4, 2)
}
