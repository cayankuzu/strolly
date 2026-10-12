/**
 * TEK AYAK's canvas-drawn surfaces: the linoleum, the chalkboard and its
 * writing, the quiz the plane is folded from, the marker on its wing, the
 * notebooks, the posters, the flag, the water stain.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'

type C2 = CanvasRenderingContext2D

export const HAND = '"Segoe Print", "Bradley Hand", "Chalkboard SE", "Comic Sans MS", "Ink Free", cursive'
export const MARKER = '"Ink Free", "Segoe Print", "Marker Felt", "Comic Sans MS", cursive'
export const PRINT = 'Georgia, "Times New Roman", serif'
export const SANS = 'Arial, Helvetica, sans-serif'

export function canvasTexture(w: number, h: number, draw: (g: C2, w: number, h: number) => void, srgb = true) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** A canvas that can be redrawn when its state changes (keyed, so equal states never re-upload). */
export class LiveCanvas {
  readonly canvas = document.createElement('canvas')
  readonly ctx: C2
  readonly texture: THREE.CanvasTexture
  private key = ''
  constructor(w: number, h: number) {
    this.canvas.width = w
    this.canvas.height = h
    this.ctx = this.canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 8
  }
  draw(key: string, fn: (g: C2, w: number, h: number) => void) {
    if (key === this.key) return
    this.key = key
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    fn(this.ctx, this.canvas.width, this.canvas.height)
    this.texture.needsUpdate = true
  }
}

// ——— Linoleum: 0.3 m tiles in a two-tone checker, dark seams, polish worn along the aisles ———

/** One texture tile covers 4 × 4 floor tiles (1.2 m). */
export function linoleum() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    const rand = mulberry32(31)
    const n = 4
    const s = w / n
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const light = (i + j) % 2 === 0
        const base = light ? [185, 179, 154] : [159, 164, 142]
        const k = 0.95 + rand() * 0.08
        g.fillStyle = `rgb(${base[0] * k},${base[1] * k},${base[2] * k})`
        g.fillRect(i * s, j * s, s, s)
        // Marbled flecks in the tile.
        for (let f = 0; f < 260; f++) {
          const x = i * s + rand() * s
          const y = j * s + rand() * s
          const a = 0.04 + rand() * 0.07
          g.fillStyle = rand() < 0.5 ? `rgba(255,255,240,${a})` : `rgba(60,60,45,${a})`
          g.beginPath()
          g.ellipse(x, y, 1 + rand() * 5, 0.6 + rand() * 1.6, rand() * Math.PI, 0, Math.PI * 2)
          g.fill()
        }
        // Scuffs.
        for (let f = 0; f < 6; f++) {
          g.strokeStyle = `rgba(40,40,35,${0.05 + rand() * 0.08})`
          g.lineWidth = 1 + rand() * 2
          g.beginPath()
          const x = i * s + rand() * s
          const y = j * s + rand() * s
          g.moveTo(x, y)
          g.lineTo(x + (rand() - 0.5) * 60, y + (rand() - 0.5) * 20)
          g.stroke()
        }
      }
    // Seams.
    g.fillStyle = 'rgba(110,114,98,0.95)'
    for (let i = 0; i <= n; i++) {
      g.fillRect(i * s - 1.5, 0, 3, h)
      g.fillRect(0, i * s - 1.5, w, 3)
    }
    g.fillStyle = 'rgba(40,42,34,0.35)'
    for (let i = 0; i <= n; i++) {
      g.fillRect(i * s - 0.5, 0, 1, h)
      g.fillRect(0, i * s - 0.5, w, 1)
    }
  })
}

// ——— The chalkboard ———

function chalkNoise(g: C2, w: number, h: number, seed: number, amount: number) {
  const rand = mulberry32(seed)
  g.save()
  g.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < amount; i++) {
    g.fillStyle = `rgba(0,0,0,${0.25 + rand() * 0.6})`
    g.fillRect(rand() * w, rand() * h, 1 + rand() * 2.2, 1 + rand() * 1.4)
  }
  g.restore()
}

/** The board's own surface: slate green, years of erased lessons, the fixed headings. */
export function boardBase() {
  return canvasTexture(2048, 683, (g, w, h) => {
    const rand = mulberry32(7)
    g.fillStyle = '#2f4a3a'
    g.fillRect(0, 0, w, h)
    // Uneven wear: cloudy patches of old chalk wiped with a felt eraser.
    for (let i = 0; i < 70; i++) {
      const x = rand() * w
      const y = rand() * h
      const r = 60 + rand() * 260
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, `rgba(210,220,205,${0.025 + rand() * 0.05})`)
      grad.addColorStop(1, 'rgba(210,220,205,0)')
      g.fillStyle = grad
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    // Eraser arcs.
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(220,228,215,${0.02 + rand() * 0.04})`
      g.lineWidth = 30 + rand() * 50
      g.beginPath()
      const x = rand() * w
      const y = rand() * h
      g.arc(x, y, 80 + rand() * 200, rand() * 6, rand() * 6 + 1.2)
      g.stroke()
    }
    // Ghosts of earlier lessons (unreadable).
    g.font = `italic 38px ${HAND}`
    g.fillStyle = 'rgba(225,230,215,0.05)'
    for (let i = 0; i < 9; i++) g.fillText(['F = m · a', 'v = x / t', '1 N', 'sürtünme', 'kütle', 'ağırlık', '9,8 N/kg', 'denge', 'hız'][i], 200 + rand() * 1600, 180 + rand() * 450)
    // Fixed headings: top-left the unit, top-right the date.
    g.save()
    g.fillStyle = 'rgba(236,234,222,0.9)'
    g.font = `600 44px ${HAND}`
    g.setTransform(1, -0.012, -0.12, 1, 0, 0)
    g.fillText('KUVVET VE HAREKET', 86, 82)
    g.font = `500 40px ${HAND}`
    g.fillText('9 Ekim, Cuma', w - 360, 78)
    g.restore()
    g.strokeStyle = 'rgba(236,234,222,0.75)'
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(84, 98)
    g.lineTo(560, 92)
    g.stroke()
    chalkNoise(g, w, h, 3, 9000)
    // Dust along the bottom edge, above the tray.
    const dust = g.createLinearGradient(0, h - 60, 0, h)
    dust.addColorStop(0, 'rgba(230,232,220,0)')
    dust.addColorStop(1, 'rgba(230,232,220,0.16)')
    g.fillStyle = dust
    g.fillRect(0, h - 60, w, 60)
  })
}

export type ChalkLine = { text: string; x: number; y: number; size: number; tilt: number }

/** Layout of a block of chalk writing: char-by-char positions for the hand to follow. */
export class ChalkBlock {
  readonly live: LiveCanvas
  readonly chars: Array<{ line: number; x0: number; x1: number; y: number }> = []
  private measure: C2
  constructor(
    readonly lines: ChalkLine[],
    readonly w: number,
    readonly h: number,
    readonly underline: boolean,
  ) {
    this.live = new LiveCanvas(w, h)
    this.measure = this.live.ctx
    lines.forEach((l, li) => {
      this.measure.font = `500 ${l.size}px ${HAND}`
      for (let i = 0; i < l.text.length; i++) {
        const a = this.measure.measureText(l.text.slice(0, i)).width
        const b = this.measure.measureText(l.text.slice(0, i + 1)).width
        this.chars.push({ line: li, x0: l.x + a, x1: l.x + b, y: l.y })
      }
    })
  }

  get count() {
    return this.chars.length
  }

  /** Where the chalk is (canvas px) after `n` characters (fractional). */
  tip(n: number, under = 0) {
    if (under > 0) {
      const l = this.lines[0]
      const last = this.chars.filter((c) => c.line === 0).at(-1)!
      return { x: l.x + (last.x1 - l.x) * under, y: l.y + l.size * 0.28 }
    }
    const i = Math.max(0, Math.min(this.chars.length - 1, Math.floor(n)))
    const c = this.chars[i]
    const t = Math.min(1, Math.max(0, n - i))
    const line = this.lines[c.line]
    // A little up-and-down as the letters are made.
    const bob = Math.sin(n * 2.7) * line.size * 0.22
    return { x: c.x0 + (c.x1 - c.x0) * t, y: c.y - line.size * 0.3 + bob, tilt: line.tilt }
  }

  /** Draws the first `n` characters (and `under` of the underline). */
  render(n: number, under = 0, seed = 1) {
    const k = Math.max(0, Math.min(this.chars.length, Math.floor(n)))
    const u = Math.round(under * 40) / 40
    this.live.draw(`${k}:${u}`, (g, w, h) => {
      let left = k
      g.fillStyle = 'rgba(236,234,222,0.94)'
      for (const l of this.lines) {
        if (left <= 0) break
        const part = l.text.slice(0, Math.min(l.text.length, left))
        left -= l.text.length
        g.save()
        g.translate(l.x, l.y)
        g.rotate(l.tilt)
        g.transform(1, 0, -0.16, 1, 0, 0)
        g.font = `500 ${l.size}px ${HAND}`
        g.fillText(part, 0, 0)
        g.restore()
      }
      if (u > 0 && this.underline) {
        const l = this.lines[0]
        const last = this.chars.filter((c) => c.line === 0).at(-1)!
        g.strokeStyle = 'rgba(236,234,222,0.9)'
        g.lineWidth = Math.max(3, l.size * 0.08)
        g.lineCap = 'round'
        g.beginPath()
        g.moveTo(l.x - 6, l.y + l.size * 0.26)
        g.lineTo(l.x - 6 + (last.x1 - l.x + 18) * u, l.y + l.size * 0.26 - 10 * u)
        g.stroke()
      }
      chalkNoise(g, w, h, seed, Math.round((w * h) / 90))
    })
  }
}

// ——— The quiz the plane is folded from (A4, 0.21 × 0.297 m) ———

/** Print side: the questions, Eren's neat blue answers, the red 100 and "Aferin", "Eren Y." in pencil. */
export function quizPrint() {
  return canvasTexture(1024, 1448, (g, w, h) => {
    const k = w / 0.21
    const rand = mulberry32(12)
    g.fillStyle = '#f4f1e8'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(120,110,90,${rand() * 0.03})`
      g.fillRect(rand() * w, rand() * h, 2, 2)
    }
    // Header (top of the sheet is the nose: canvas y = 0 is paper y = 0.297).
    g.fillStyle = '#2a2a2a'
    g.font = `700 ${0.0072 * k}px ${SANS}`
    g.fillText('6-B  FEN BİLİMLERİ — KISA SINAV', 0.016 * k, 0.03 * k)
    g.font = `${0.0058 * k}px ${SANS}`
    g.fillText('Ünite 3: Kuvvet ve Hareket', 0.016 * k, 0.041 * k)
    g.fillText('Adı Soyadı: ........................', 0.016 * k, 0.054 * k)
    g.strokeStyle = '#555'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(0.014 * k, 0.062 * k)
    g.lineTo(0.196 * k, 0.062 * k)
    g.stroke()
    // The name in pencil on the dotted line, and once more in the corner.
    g.fillStyle = 'rgba(70,70,74,0.85)'
    g.font = `${0.0068 * k}px ${HAND}`
    g.fillText('Eren Y.', 0.047 * k, 0.0525 * k)
    g.save()
    g.translate(0.166 * k, 0.0105 * k)
    g.rotate(0.05)
    g.font = `${0.0056 * k}px ${HAND}`
    g.fillText('Eren Y.', 0, 0)
    g.restore()
    // Questions and answers.
    const qs = [
      ['1) Kuvvetin birimi nedir?', 'Newton (N)'],
      ['2) Dengelenmiş kuvvetlerin etkisindeki duran', 'Durmaya devam eder.'],
      ['    bir cisme ne olur?', ''],
      ['3) Sürtünme kuvveti hareketi nasıl etkiler?', 'Yavaşlatır, ısı açığa çıkar.'],
      ['4) Bileşke kuvvet sıfırsa sabit hızla giden', 'Aynı süratle devam eder.'],
      ['    araba ne yapar?', ''],
      ['5) Bir örnek veriniz.', 'Kâğıt uçak süzülürken...'],
    ]
    let y = 0.085
    for (const [q, a] of qs) {
      g.fillStyle = '#2a2a2a'
      g.font = `${0.0062 * k}px ${PRINT}`
      g.fillText(q, 0.016 * k, y * k)
      if (a) {
        g.fillStyle = '#1f3c9a'
        g.font = `${0.0068 * k}px ${HAND}`
        g.fillText(a, 0.03 * k, (y + 0.011) * k)
        g.strokeStyle = 'rgba(200,40,30,0.85)'
        g.lineWidth = 3
        g.beginPath()
        g.moveTo(0.172 * k, (y + 0.008) * k)
        g.lineTo(0.177 * k, (y + 0.013) * k)
        g.lineTo(0.188 * k, (y - 0.001) * k)
        g.stroke()
      }
      y += a ? 0.03 : 0.014
    }
    // The grade, in the top-right corner (it ends up inside the nose fold).
    g.strokeStyle = 'rgba(192,57,43,0.95)'
    g.fillStyle = 'rgba(192,57,43,0.95)'
    g.lineWidth = 5
    g.beginPath()
    g.ellipse(0.171 * k, 0.027 * k, 0.017 * k, 0.012 * k, -0.15, 0, Math.PI * 2)
    g.stroke()
    g.save()
    g.translate(0.157 * k, 0.033 * k)
    g.rotate(-0.12)
    g.font = `700 ${0.0145 * k}px ${HAND}`
    g.fillText('100', 0, 0)
    g.restore()
    g.save()
    g.translate(0.161 * k, 0.051 * k)
    g.rotate(-0.1)
    g.transform(1, 0, -0.2, 1, 0, 0)
    g.font = `600 ${0.0085 * k}px ${HAND}`
    g.fillText('Aferin', 0, 0)
    g.restore()
    void h
  })
}

/**
 * The blank side (it becomes the top of the wings): faint show-through of
 * the print, and on the right wing Eren's marker — revealed up to `written`.
 * Paper coordinates are mirrored here (this side is seen from the back).
 */
export function drawWing(g: C2, w: number, h: number, written: number, print: HTMLCanvasElement | null) {
  const k = w / 0.21
  g.fillStyle = '#f6f3ea'
  g.fillRect(0, 0, w, h)
  // This side is seen from behind the print: what is drawn plainly here shows mirrored (the
  // print showing through), and the marker is drawn mirrored so that it reads.
  if (print) {
    g.save()
    g.globalAlpha = 0.07
    g.drawImage(print, 0, 0, w, h)
    g.restore()
  }
  if (written <= 0) return
  g.save()
  g.translate(w, 0)
  g.scale(-1, 1)
  // The right wing (paper x 0.03…0.105, y 0…0.19) is on the left of this mirrored sheet,
  // running from the nose (canvas top) toward the tail.
  const text = 'S.E.I Havayolları'
  const n = Math.max(0, Math.min(text.length, Math.floor(written * (text.length + 3))))
  const rand = mulberry32(5)
  g.save()
  // Along the wing: rotate so the letters run nose → tail.
  const cx = (0.21 - 0.07) * k
  const cy = 0.14 * k
  g.translate(cx, cy)
  g.rotate(Math.PI / 2 + 0.06)
  g.fillStyle = '#111'
  let x = -0.075 * k
  for (let i = 0; i < Math.min(n, text.length); i++) {
    const ch = text[i]
    const size = (0.0145 + rand() * 0.003) * k
    g.save()
    g.translate(x, (rand() - 0.5) * 0.002 * k + i * 0.00035 * k)
    g.rotate((rand() - 0.5) * 0.22 + 0.04)
    g.font = `700 ${size}px ${MARKER}`
    g.fillText(ch, 0, 0)
    g.restore()
    g.font = `700 ${size}px ${MARKER}`
    x += g.measureText(ch).width * (ch === ' ' ? 1.4 : 0.98)
  }
  g.restore()
  // The airline's logo: a little doodled wing.
  if (written > 0.92) {
    g.save()
    g.translate((0.21 - 0.05) * k, 0.04 * k)
    g.strokeStyle = '#111'
    g.lineWidth = 4
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(-0.012 * k, 0.004 * k)
    g.quadraticCurveTo(0, -0.01 * k, 0.014 * k, -0.004 * k)
    g.moveTo(-0.006 * k, 0.001 * k)
    g.quadraticCurveTo(0.004 * k, -0.005 * k, 0.011 * k, 0.001 * k)
    g.moveTo(-0.002 * k, 0.005 * k)
    g.quadraticCurveTo(0.005 * k, 0.001 * k, 0.009 * k, 0.006 * k)
    g.stroke()
    g.restore()
  }
  g.restore()
}

// ——— Notebooks, notes, posters ———

/** A school notebook spread: ruled pages, a heading underlined, a few lines in pencil. */
export function notebookSpread(seed: number, heading: string | null, lines = 7) {
  return canvasTexture(512, 360, (g, w, h) => {
    const rand = mulberry32(seed)
    g.fillStyle = '#f3f0e6'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(120,150,190,0.45)'
    g.lineWidth = 1.2
    for (let y = 40; y < h; y += 18) {
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(w, y)
      g.stroke()
    }
    g.strokeStyle = 'rgba(200,90,90,0.5)'
    g.beginPath()
    g.moveTo(30, 0)
    g.lineTo(30, h)
    g.moveTo(w / 2 + 30, 0)
    g.lineTo(w / 2 + 30, h)
    g.stroke()
    // The spine shadow.
    const sp = g.createLinearGradient(w / 2 - 14, 0, w / 2 + 14, 0)
    sp.addColorStop(0, 'rgba(0,0,0,0)')
    sp.addColorStop(0.5, 'rgba(0,0,0,0.22)')
    sp.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = sp
    g.fillRect(w / 2 - 14, 0, 28, h)
    g.fillStyle = 'rgba(40,45,70,0.85)'
    if (heading) {
      g.font = `600 22px ${HAND}`
      g.fillText(heading, 40, 33)
      g.strokeStyle = 'rgba(40,45,70,0.85)'
      g.lineWidth = 2
      g.beginPath()
      g.moveTo(38, 39)
      g.lineTo(40 + g.measureText(heading).width, 38)
      g.stroke()
    }
    g.font = `15px ${HAND}`
    for (let i = 0; i < lines; i++) {
      const y = 56 + i * 18
      const len = 60 + rand() * 150
      g.fillStyle = `rgba(45,50,70,${0.55 + rand() * 0.3})`
      let x = 40
      while (x < 40 + len) {
        const word = 10 + rand() * 30
        g.fillRect(x, y - 6 + rand() * 2, word, 2 + rand())
        x += word + 6
      }
      if (i < lines - 2) {
        const x2 = w / 2 + 40
        let xx = x2
        const len2 = 40 + rand() * 160
        while (xx < x2 + len2) {
          const word = 10 + rand() * 30
          g.fillRect(xx, y - 6 + rand() * 2, word, 2 + rand())
          xx += word + 6
        }
      }
    }
  })
}

/** The reader's own spread: "Dengelenmiş kuvvetler" underlined, and the law copied out. */
export function readerNotebook() {
  return canvasTexture(768, 540, (g, w, h) => {
    g.fillStyle = '#f3f0e6'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(120,150,190,0.45)'
    g.lineWidth = 1.5
    for (let y = 62; y < h; y += 27) {
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(w, y)
      g.stroke()
    }
    g.strokeStyle = 'rgba(200,90,90,0.5)'
    g.beginPath()
    g.moveTo(44, 0)
    g.lineTo(44, h)
    g.moveTo(w / 2 + 44, 0)
    g.lineTo(w / 2 + 44, h)
    g.stroke()
    const sp = g.createLinearGradient(w / 2 - 20, 0, w / 2 + 20, 0)
    sp.addColorStop(0, 'rgba(0,0,0,0)')
    sp.addColorStop(0.5, 'rgba(0,0,0,0.22)')
    sp.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = sp
    g.fillRect(w / 2 - 20, 0, 40, h)
    g.fillStyle = 'rgba(35,40,64,0.9)'
    g.font = `600 30px ${HAND}`
    g.fillText('Dengelenmiş kuvvetler', 58, 52)
    g.strokeStyle = 'rgba(35,40,64,0.9)'
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(56, 60)
    g.lineTo(58 + g.measureText('Dengelenmiş kuvvetler').width, 58)
    g.stroke()
    g.font = `21px ${HAND}`
    const copy = ['Dengelenmiş kuvvetlerin etkisindeki', 'bir cisim, duruyorsa durmaya', 'devam eder.']
    copy.forEach((l, i) => g.fillText(l, 58, 112 + i * 27))
    g.font = `19px ${HAND}`
    g.fillText('9 Ekim', w / 2 + 60, 52)
    // A doodle in the margin: a little plane.
    g.strokeStyle = 'rgba(35,40,64,0.7)'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(w - 120, 300)
    g.lineTo(w - 60, 280)
    g.lineTo(w - 100, 318)
    g.closePath()
    g.moveTo(w - 100, 318)
    g.lineTo(w - 92, 298)
    g.stroke()
  })
}

/** The teacher's lesson notebook, open on its first page. */
export function lessonNotebook() {
  return canvasTexture(512, 360, (g, w, h) => {
    g.fillStyle = '#efe9d8'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(120,130,160,0.35)'
    for (let y = 44; y < h; y += 18) {
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(w, y)
      g.stroke()
    }
    const sp = g.createLinearGradient(w / 2 - 14, 0, w / 2 + 14, 0)
    sp.addColorStop(0, 'rgba(0,0,0,0)')
    sp.addColorStop(0.5, 'rgba(0,0,0,0.25)')
    sp.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = sp
    g.fillRect(w / 2 - 14, 0, 28, h)
    g.fillStyle = 'rgba(70,70,74,0.8)'
    g.font = `italic 600 26px ${HAND}`
    g.fillText('31. yıl.', 34, 70)
    g.fillText('Son yıl?', 50, 104)
    g.fillStyle = 'rgba(30,40,80,0.8)'
    g.font = `16px ${HAND}`
    const rows = ['6-B  Kuvvet ve hareket', '6-C  Sürtünme', '7-A  Basınç', '6-B  Deney raporları', '7-B  Yazılı okuma']
    rows.forEach((r, i) => g.fillText(r, w / 2 + 30, 60 + i * 36))
    g.strokeStyle = 'rgba(192,57,43,0.8)'
    g.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      g.beginPath()
      g.moveTo(w - 60, 52 + i * 36)
      g.lineTo(w - 52, 58 + i * 36)
      g.lineTo(w - 38, 44 + i * 36)
      g.stroke()
    }
  })
}

/** A graded quiz on the teacher's pile (seen from above). */
export function gradedSheet(seed: number) {
  return canvasTexture(256, 362, (g, w, h) => {
    const rand = mulberry32(seed)
    g.fillStyle = '#f4f1e8'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#333'
    for (let y = 30; y < h - 10; y += 14) g.fillRect(14, y, 60 + rand() * 150, 2)
    g.strokeStyle = 'rgba(192,57,43,0.9)'
    g.lineWidth = 3
    g.beginPath()
    g.ellipse(w - 40, 34, 22, 16, 0, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = 'rgba(192,57,43,0.9)'
    g.font = `700 18px ${HAND}`
    g.fillText(String(50 + Math.round(rand() * 9) * 5), w - 56, 41)
  })
}

/** Kids' drawings for the cork board. */
export function drawing(seed: number) {
  return canvasTexture(256, 200, (g, w, h) => {
    const rand = mulberry32(seed)
    g.fillStyle = '#f7f4ec'
    g.fillRect(0, 0, w, h)
    const hue = Math.floor(rand() * 360)
    g.fillStyle = `hsl(${hue},55%,62%)`
    g.fillRect(0, h * 0.72, w, h * 0.28)
    g.fillStyle = `hsl(${(hue + 180) % 360},60%,70%)`
    g.beginPath()
    g.arc(w * (0.2 + rand() * 0.6), h * 0.25, 18 + rand() * 12, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#333'
    g.lineWidth = 3
    for (let i = 0; i < 3; i++) {
      const x = 30 + rand() * (w - 60)
      g.beginPath()
      g.moveTo(x, h * 0.72)
      g.lineTo(x, h * 0.48)
      g.arc(x, h * 0.42, 10, Math.PI / 2, Math.PI * 2.5)
      g.stroke()
    }
    g.fillStyle = '#c0392b'
    g.font = `16px ${HAND}`
    g.fillText(['Ayşe', 'Mert', 'Zeynep', 'Can', 'Elif', 'Deniz'][seed % 6], 10, 18)
  })
}

/** The unit poster: forces as arrows on a box. */
export function forcePoster() {
  return canvasTexture(512, 360, (g, w, h) => {
    g.fillStyle = '#f1e7c9'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#1f3a5f'
    g.font = `700 34px ${SANS}`
    g.fillText('KUVVET VE HAREKET', 30, 50)
    g.fillStyle = '#c96a2b'
    g.fillRect(w / 2 - 50, h / 2 - 20, 100, 80)
    g.strokeStyle = '#1f3a5f'
    g.fillStyle = '#1f3a5f'
    g.lineWidth = 6
    const arrow = (x0: number, y0: number, x1: number, y1: number) => {
      g.beginPath()
      g.moveTo(x0, y0)
      g.lineTo(x1, y1)
      g.stroke()
      const a = Math.atan2(y1 - y0, x1 - x0)
      g.beginPath()
      g.moveTo(x1, y1)
      g.lineTo(x1 - 16 * Math.cos(a - 0.4), y1 - 16 * Math.sin(a - 0.4))
      g.lineTo(x1 - 16 * Math.cos(a + 0.4), y1 - 16 * Math.sin(a + 0.4))
      g.fill()
    }
    arrow(w / 2 - 50, h / 2 + 20, w / 2 - 160, h / 2 + 20)
    arrow(w / 2 + 50, h / 2 + 20, w / 2 + 160, h / 2 + 20)
    g.font = `600 22px ${SANS}`
    g.fillText('F₁ = 10 N', 40, h / 2 + 60)
    g.fillText('F₂ = 10 N', w - 150, h / 2 + 60)
    g.font = `20px ${SANS}`
    g.fillText('Dengelenmiş kuvvetler: bileşke = 0', 70, h - 40)
  })
}

/** The flag over the board. */
export function flag() {
  return canvasTexture(512, 342, (g, w, h) => {
    g.fillStyle = '#d32a2a'
    g.fillRect(0, 0, w, h)
    const cx = w * 0.36
    const cy = h / 2
    g.fillStyle = '#fafafa'
    g.beginPath()
    g.arc(cx, cy, h * 0.25, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#d32a2a'
    g.beginPath()
    g.arc(cx + h * 0.0625, cy, h * 0.2, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#fafafa'
    const sx = cx + h * 0.333 - h * 0.125 * 0.2
    g.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? h * 0.125 : h * 0.05
      const a = -Math.PI / 2 + (i * Math.PI) / 5 + Math.PI / 2
      g.lineTo(sx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
    g.closePath()
    g.fill()
    // Folds in the cloth.
    for (let i = 0; i < 6; i++) {
      const x = (i + 0.5) * (w / 6)
      const grad = g.createLinearGradient(x - 40, 0, x + 40, 0)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(0.5, i % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = grad
      g.fillRect(x - 40, 0, 80, h)
    }
  })
}

/** A sepia portrait, deliberately out of focus: a figure, no face. */
export function portrait() {
  return canvasTexture(256, 320, (g, w, h) => {
    const bg = g.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h / 2, w * 0.8)
    bg.addColorStop(0, '#cdb48a')
    bg.addColorStop(1, '#6f5a3c')
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    g.filter = 'blur(10px)'
    g.fillStyle = '#3a2c1e'
    g.beginPath()
    g.ellipse(w / 2, h * 0.36, w * 0.17, h * 0.17, 0, 0, Math.PI * 2)
    g.fill()
    g.beginPath()
    g.ellipse(w / 2, h * 0.95, w * 0.42, h * 0.38, 0, 0, Math.PI * 2)
    g.fill()
    g.filter = 'none'
  })
}

/** A framed text panel: a title band and lines too small to read. */
export function textPanel() {
  return canvasTexture(320, 400, (g, w, h) => {
    g.fillStyle = '#efe8d4'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#7a1f1f'
    g.fillRect(24, 24, w - 48, 34)
    g.fillStyle = 'rgba(40,30,25,0.6)'
    for (let y = 84; y < h - 30; y += 15) g.fillRect(28, y, w - 56 - ((y * 7) % 40), 3)
  })
}

/** The water stain on the ceiling, shaped (if you squint) like Africa. */
export function stain() {
  return canvasTexture(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    const pts: Array<[number, number]> = [
      [0.42, 0.08], [0.55, 0.1], [0.68, 0.18], [0.82, 0.3], [0.9, 0.36], [0.78, 0.48], [0.7, 0.62], [0.6, 0.78], [0.52, 0.92], [0.46, 0.86], [0.42, 0.68], [0.36, 0.55], [0.22, 0.5], [0.12, 0.4], [0.16, 0.28], [0.28, 0.14],
    ]
    const path = () => {
      g.beginPath()
      pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)))
      g.closePath()
    }
    g.filter = 'blur(6px)'
    path()
    g.fillStyle = 'rgba(160,125,70,0.22)'
    g.fill()
    g.lineWidth = 9
    g.strokeStyle = 'rgba(120,85,40,0.45)'
    g.stroke()
    g.filter = 'blur(2px)'
    g.lineWidth = 3
    g.strokeStyle = 'rgba(100,70,35,0.5)'
    g.stroke()
    g.filter = 'none'
  })
}

/** The carved heart and the year on the reader's desk (alpha decal). */
export function carvedHeart() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.strokeStyle = 'rgba(60,35,18,0.85)'
    g.lineWidth = 4
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(128, 196)
    g.bezierCurveTo(30, 130, 50, 50, 118, 82)
    g.moveTo(128, 196)
    g.bezierCurveTo(226, 130, 206, 50, 138, 82)
    g.stroke()
    g.lineWidth = 2
    g.strokeStyle = 'rgba(235,210,170,0.5)'
    g.beginPath()
    g.moveTo(130, 192)
    g.bezierCurveTo(32, 128, 52, 52, 118, 84)
    g.stroke()
    g.fillStyle = 'rgba(60,35,18,0.85)'
    g.font = `600 34px ${HAND}`
    g.fillText('2011', 94, 140)
  })
}

/** The class sign on the door. */
export function classSign() {
  return canvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = '#f2efe6'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#2b4a7a'
    g.lineWidth = 8
    g.strokeRect(6, 6, w - 12, h - 12)
    g.fillStyle = '#2b4a7a'
    g.font = `700 70px ${SANS}`
    g.textAlign = 'center'
    g.fillText('6-B', w / 2, h / 2 + 25)
  })
}

/** The fleet: marker wings on the wheelchair's side guard, "S.E.I · Uçak No. 1" in Eren's neat hand. */
export function fleetDecal() {
  // The +x side guard (0.32 × 0.075 m): two marker wings and Eren's neat "S.E.I · Uçak No. 1".
  return canvasTexture(512, 120, (g, w, h) => {
    g.fillStyle = '#26282c'
    g.fillRect(0, 0, w, h)
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, 'rgba(255,255,255,0.07)')
    grad.addColorStop(1, 'rgba(0,0,0,0.18)')
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(235,235,230,0.88)'
    g.lineWidth = 4
    g.lineCap = 'round'
    const cx = 92
    for (const s of [-1, 1]) {
      g.beginPath()
      for (let i = 0; i < 4; i++) {
        const y = 52 + i * 11
        g.moveTo(cx + s * 10, y)
        g.quadraticCurveTo(cx + s * (44 - i * 4), y - 26 + i * 4, cx + s * (80 - i * 14), y - 18 + i * 6)
      }
      g.stroke()
    }
    g.beginPath()
    g.arc(cx, 60, 7, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = 'rgba(235,235,230,0.92)'
    g.font = `600 36px ${HAND}`
    g.textAlign = 'left'
    g.textBaseline = 'middle'
    g.fillText('S.E.I · Uçak No. 1', 186, 62)
  })
}

/** The wall clock's dial: a plain school clock — minute marks and the twelve numerals. */
export function clockFace() {
  return canvasTexture(512, 512, (g, w) => {
    const c = w / 2
    g.fillStyle = '#f6f4ee'
    g.fillRect(0, 0, w, w)
    // A faint yellowing toward the rim.
    const rad = g.createRadialGradient(c, c, c * 0.2, c, c, c)
    rad.addColorStop(0, 'rgba(0,0,0,0)')
    rad.addColorStop(1, 'rgba(120,105,70,0.12)')
    g.fillStyle = rad
    g.fillRect(0, 0, w, w)
    g.fillStyle = '#151515'
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue
      const a = (i / 60) * Math.PI * 2
      g.save()
      g.translate(c + Math.sin(a) * c * 0.9, c - Math.cos(a) * c * 0.9)
      g.rotate(a)
      g.fillRect(-1.5, -6, 3, 12)
      g.restore()
    }
    g.font = `600 ${w * 0.1}px ${SANS}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2
      g.fillText(String(i), c + Math.sin(a) * c * 0.68, c - Math.cos(a) * c * 0.68 + 2)
    }
  })
}
