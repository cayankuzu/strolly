/**
 * Things with writing or a picture on them: the photograph, the kitchen
 * clock, the record on the table. Drawn once (the clock once per minute).
 */
import * as THREE from 'three'
import { mono, sans } from '../screens'

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, ctx: c.getContext('2d')! }
}

function texture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/**
 * The two of them on a balcony by the sea, years ago. Everything in the
 * picture is clear except one face — his — which is only light.
 */
export function photoTexture() {
  const W = 512
  const H = 362
  const { c, ctx } = canvas(W, H)
  ctx.fillStyle = '#f3ede2'
  ctx.fillRect(0, 0, W, H)
  const x0 = 22
  const y0 = 22
  const w = W - 44
  const h = H - 44
  ctx.save()
  ctx.beginPath()
  ctx.rect(x0, y0, w, h)
  ctx.clip()
  // Sky and sea
  const sky = ctx.createLinearGradient(0, y0, 0, y0 + h * 0.55)
  sky.addColorStop(0, '#a9bfd1')
  sky.addColorStop(1, '#efd9bb')
  ctx.fillStyle = sky
  ctx.fillRect(x0, y0, w, h)
  ctx.fillStyle = '#7d98ad'
  ctx.fillRect(x0, y0 + h * 0.5, w, h * 0.16)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  for (let i = 0; i < 26; i++) ctx.fillRect(x0 + ((i * 97) % w), y0 + h * 0.52 + ((i * 13) % 40), 20 + (i % 5) * 6, 1.5)
  // Railing
  ctx.fillStyle = '#e8e2d7'
  ctx.fillRect(x0, y0 + h * 0.66, w, h * 0.34)
  ctx.fillStyle = '#5d564f'
  ctx.fillRect(x0, y0 + h * 0.64, w, 4)
  for (let x = x0 + 8; x < x0 + w; x += 22) ctx.fillRect(x, y0 + h * 0.64, 2.5, h * 0.36)

  const person = (cx: number, top: number, scale: number, shirt: string, hair: string, long: boolean, face: 'clear' | 'light') => {
    // Shoulders
    ctx.fillStyle = shirt
    ctx.beginPath()
    ctx.ellipse(cx, top + 175 * scale, 74 * scale, 70 * scale, 0, Math.PI, 0)
    ctx.fill()
    ctx.fillRect(cx - 74 * scale, top + 175 * scale, 148 * scale, 120 * scale)
    // Neck
    ctx.fillStyle = '#c49a80'
    ctx.fillRect(cx - 13 * scale, top + 82 * scale, 26 * scale, 36 * scale)
    // Hair behind
    ctx.fillStyle = hair
    if (long) {
      ctx.beginPath()
      ctx.ellipse(cx, top + 78 * scale, 50 * scale, 78 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    // Face
    if (face === 'clear') {
      ctx.fillStyle = '#d2a88c'
      ctx.beginPath()
      ctx.ellipse(cx, top + 58 * scale, 36 * scale, 46 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = hair
      ctx.beginPath()
      ctx.ellipse(cx, top + 26 * scale, 40 * scale, 24 * scale, 0, Math.PI, 0)
      ctx.fill()
      ctx.fillStyle = '#3a2a22'
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.ellipse(cx + s * 13 * scale, top + 56 * scale, 4 * scale, 2.6 * scale, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = '#9b5f52'
      ctx.lineWidth = 2.4 * scale
      ctx.beginPath()
      ctx.arc(cx, top + 70 * scale, 10 * scale, 0.2 * Math.PI, 0.8 * Math.PI)
      ctx.stroke()
    } else {
      // Not blurred — washed out, the way an overexposed memory is.
      const g = ctx.createRadialGradient(cx, top + 56 * scale, 4 * scale, cx, top + 58 * scale, 64 * scale)
      g.addColorStop(0, 'rgba(255,246,232,1)')
      g.addColorStop(0.45, 'rgba(244,226,206,0.92)')
      g.addColorStop(1, 'rgba(244,226,206,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(cx, top + 58 * scale, 64 * scale, 76 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(58,46,40,0.25)'
      ctx.beginPath()
      ctx.ellipse(cx, top + 20 * scale, 38 * scale, 18 * scale, 0, Math.PI, 0)
      ctx.fill()
    }
  }
  person(x0 + w * 0.36, y0 + h * 0.2, 1, '#cdbfa9', '#3a2a21', true, 'clear')
  person(x0 + w * 0.62, y0 + h * 0.14, 1.06, '#5f7590', '#2a2320', false, 'light')
  // His arm over her shoulder
  ctx.strokeStyle = '#5f7590'
  ctx.lineWidth = 22
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0 + w * 0.56, y0 + h * 0.72)
  ctx.quadraticCurveTo(x0 + w * 0.47, y0 + h * 0.66, x0 + w * 0.42, y0 + h * 0.74)
  ctx.stroke()
  // Age: warm fade and a soft vignette.
  ctx.fillStyle = 'rgba(255,214,160,0.16)'
  ctx.fillRect(x0, y0, w, h)
  const vg = ctx.createRadialGradient(W / 2, H / 2, h * 0.3, W / 2, H / 2, w * 0.7)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(60,40,20,0.35)')
  ctx.fillStyle = vg
  ctx.fillRect(x0, y0, w, h)
  ctx.restore()
  return texture(c)
}

/** The kitchen clock: warm digits on a dark face. Redrawn only when the minute changes. */
export class ClockFace {
  readonly texture: THREE.CanvasTexture
  private ctx: CanvasRenderingContext2D
  private shown = '\u0000'

  constructor() {
    const { c, ctx } = canvas(256, 96)
    this.ctx = ctx
    this.texture = texture(c)
  }

  show(text: string) {
    if (text === this.shown) return
    this.shown = text
    const ctx = this.ctx
    ctx.fillStyle = '#16120f'
    ctx.fillRect(0, 0, 256, 96)
    ctx.fillStyle = 'rgba(255,170,90,0.07)'
    mono(ctx, 64, 600)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('88:88', 128, 52)
    if (text) {
      ctx.fillStyle = '#ffb46a'
      ctx.shadowColor = 'rgba(255,150,70,0.8)'
      ctx.shadowBlur = 10
      ctx.fillText(text, 128, 52)
      ctx.shadowBlur = 0
    }
    this.texture.needsUpdate = true
  }
}

/** The record lying on the table all along, unreadable until it is not. */
export function recordTexture() {
  const W = 512
  const H = 366
  const { c, ctx } = canvas(W, H)
  ctx.fillStyle = '#f2ede3'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(120,100,70,0.06)'
  for (let i = 0; i < 400; i++) ctx.fillRect((i * 131) % W, (i * 71) % H, 1, 1)
  ctx.fillStyle = '#2b2622'
  ctx.textBaseline = 'alphabetic'
  sans(ctx, 20, 600)
  ctx.fillText('EMANET', 36, 54)
  mono(ctx, 12, 500)
  ctx.fillStyle = '#7a7068'
  ctx.fillText('BELLEK KAYDI · 0117-E', 36, 76)
  ctx.fillRect(36, 92, W - 72, 1)
  const rows: Array<[string, string, string?]> = [
    ['SUBJECT', 'EGE'],
    ['STATUS', 'DECEASED', '#8a3a2a'],
    ['RECORD', 'ACTIVE MEMORY INSTANCE'],
    ['RECONSTRUCTED', 'DERİN'],
    ['LAST VALID MINUTE', '14:17'],
  ]
  rows.forEach(([k, v, color], i) => {
    const y = 130 + i * 42
    mono(ctx, 13, 500)
    ctx.fillStyle = '#857a70'
    ctx.fillText(k, 36, y)
    mono(ctx, 19, 600)
    ctx.fillStyle = color ?? '#2b2622'
    ctx.fillText(v, 220, y)
  })
  ctx.fillStyle = '#b9ab98'
  ctx.fillRect(36, H - 44, W - 72, 1)
  mono(ctx, 11, 500)
  ctx.fillStyle = '#9a8f84'
  ctx.fillText('BU KAYIT, SAHİBİNİN İSTEĞİYLE SAKLANMAKTADIR.', 36, H - 22)
  return texture(c)
}

/** Ege's phone, lying on the table: the call log, the last line his. */
export function phoneTexture() {
  const W = 256
  const H = 540
  const { c, ctx } = canvas(W, H)
  ctx.fillStyle = '#0d1013'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#e8ecef'
  sans(ctx, 54, 400)
  ctx.textAlign = 'center'
  ctx.fillText('14:16', W / 2, 92)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#7d8a93'
  mono(ctx, 16, 500)
  ctx.fillText('SON ARAMALAR', 22, 170)
  const rows: Array<[string, string, boolean]> = [
    ['Derin', '14:16', true],
    ['Derin', '09:12', false],
    ['Eczane', 'Dün', false],
    ['Derin', 'Dün', false],
  ]
  rows.forEach(([who, when, missed], i) => {
    const y = 214 + i * 64
    ctx.fillStyle = '#1a2026'
    ctx.fillRect(14, y - 34, W - 28, 52)
    ctx.fillStyle = missed ? '#e2a062' : '#d5dde2'
    sans(ctx, 24, 500)
    ctx.fillText(who, 28, y)
    ctx.fillStyle = '#7d8a93'
    mono(ctx, 15, 400)
    ctx.fillText(missed ? `${when} · CEVAPSIZ` : when, 28, y + 12)
  })
  return texture(c)
}
