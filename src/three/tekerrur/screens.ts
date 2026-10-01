/**
 * DURUM's interface, drawn on canvases: a research system's screens, not a
 * film's. Dense but legible, institutional, quiet: a header with the module
 * and the time, panels with thin rules, numbers in mono, one amber accent for
 * what needs attention and a red that is almost never used.
 */
import { mulberry32 } from '@/lib/math'
import { mono, sans } from '../screens'

export type Ctx = CanvasRenderingContext2D

const BG = '#0a0c0e'
const PANEL = '#11151a'
const RULE = '#22303a'
const INK = '#d9dde0'
const MUTED = '#7d8a93'
const FAINT = '#47535b'
const AMBER = '#e2b062'
const RED = '#e05a47'
const GREEN = '#78c49b'

function frame(c: Ctx, W: number, H: number, module: string, clock: string) {
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)
  const hh = Math.round(H * 0.085)
  c.fillStyle = '#0e1216'
  c.fillRect(0, 0, W, hh)
  c.fillStyle = RULE
  c.fillRect(0, hh, W, 1)
  c.fillStyle = INK
  sans(c, Math.round(hh * 0.42), 300)
  c.letterSpacing = `${Math.round(hh * 0.12)}px`
  c.fillText('DURUM', Math.round(W * 0.025), Math.round(hh * 0.66))
  c.letterSpacing = '0px'
  c.fillStyle = MUTED
  mono(c, Math.round(hh * 0.32), 400)
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
    mono(c, Math.max(10, Math.round(h * 0.09)), 500)
    c.fillText(label, x + 12, y + Math.max(18, Math.round(h * 0.16)))
  }
}

function wrap(c: Ctx, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (c.measureText(test).width > maxW && line) {
      c.fillText(line, x, yy)
      line = w
      yy += lh
    } else line = test
  }
  if (line) c.fillText(line, x, yy)
  return yy + lh
}

// ——— Main monitor ———

/** The model at rest: counters, coverage, a field of tracked points. */
export function drawState(c: Ctx, W: number, H: number, s: { clock: string; t: number; future?: boolean }) {
  const hh = frame(c, W, H, 'KÜRESEL DURUM MODELİ · v7.4', s.clock)
  const pad = Math.round(W * 0.025)
  const colW = Math.round(W * 0.3)
  const rows: Array<[string, string]> = [
    ['İZLENEN NESNE', `4,1182 × 10⁶⁸`],
    ['GÜNCELLEME', `${(0.78 + 0.04 * Math.sin(s.t * 1.7)).toFixed(2)} ms`],
    ['KAPSAM', '%99,9997'],
    ['TAHMİN UFKU', '72 sa · %95 güven'],
    ['SICAKLIK (SALON)', `${(19.6 + 0.2 * Math.sin(s.t * 0.3)).toFixed(1)} °C`],
  ]
  let y = hh + pad
  const rh = Math.round((H - hh - pad * 2) / rows.length)
  for (const [k, v] of rows) {
    panel(c, pad, y, colW, rh - 8)
    c.fillStyle = MUTED
    mono(c, Math.round(rh * 0.17), 500)
    c.fillText(k, pad + 14, y + Math.round(rh * 0.32))
    c.fillStyle = INK
    mono(c, Math.round(rh * 0.3), 400)
    c.fillText(v, pad + 14, y + Math.round(rh * 0.72))
    y += rh
  }
  // The field: every dot a tracked region, a few of them updating.
  const fx = pad * 2 + colW
  const fw = W - fx - pad
  const fy = hh + pad
  const fh = H - fy - pad
  panel(c, fx, fy, fw, fh, 'DURUM ALANI · CANLI')
  const rand = mulberry32(7)
  const cols = 64
  const rws = 30
  for (let j = 0; j < rws; j++)
    for (let i = 0; i < cols; i++) {
      const land = Math.sin(i * 0.21 + Math.cos(j * 0.37) * 2) + Math.cos(j * 0.31 - i * 0.07) > 0.35
      const r = rand()
      if (!land && r > 0.18) continue
      const x = fx + 20 + (i / cols) * (fw - 40)
      const yy = fy + 40 + (j / rws) * (fh - 56)
      const live = (Math.sin(s.t * 2 + i * 0.7 + j * 1.3) + 1) / 2
      c.fillStyle = live > 0.97 ? AMBER : land ? `rgba(217,221,224,${0.25 + 0.35 * live})` : 'rgba(125,138,147,0.25)'
      c.fillRect(x, yy, 3, 3)
    }
  if (s.future) {
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.026), 500)
    c.textAlign = 'right'
    c.fillText('FUTURE QUERY · 1', fx + fw - 14, fy + fh - 14)
    c.textAlign = 'left'
  }
}

/** A query typed in, and the answer it got. */
export function drawQuery(c: Ctx, W: number, H: number, s: { clock: string; title?: string; question: string | null; answer: string[]; t: number }) {
  const hh = frame(c, W, H, s.title ?? 'SORGU', s.clock)
  const pad = Math.round(W * 0.05)
  let y = hh + Math.round(H * 0.14)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.03), 500)
  c.fillText('SORGU', pad, y)
  y += Math.round(H * 0.07)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.045), 400)
  const caret = Math.floor(s.t * 1.6) % 2 === 0 ? '▍' : ' '
  y = wrap(c, `› ${s.question ?? ''}${s.question ? '' : caret}`, pad, y, W - pad * 2, Math.round(H * 0.065))
  if (!s.answer.length) return
  y += Math.round(H * 0.06)
  c.fillStyle = RULE
  c.fillRect(pad, y - Math.round(H * 0.04), W - pad * 2, 1)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.03), 500)
  c.fillText('YANIT', pad, y)
  y += Math.round(H * 0.07)
  for (const line of s.answer) {
    const human = line.startsWith('ARİF:')
    c.fillStyle = human ? MUTED : AMBER
    sans(c, Math.round(H * 0.05), human ? 300 : 400)
    y = wrap(c, line, pad, y, W - pad * 2, Math.round(H * 0.07))
  }
}

/** Yesterday's prediction and today's count, side by side. */
export function drawPrediction(c: Ctx, W: number, H: number, s: { clock: string; t: number; counted: number }) {
  const hh = frame(c, W, H, 'DOĞRULAMA · 14.17 · KIZILAY', s.clock)
  const pad = Math.round(W * 0.03)
  const w = (W - pad * 3) / 2
  const h = H - hh - pad * 2
  for (const [k, label, value, color] of [
    [0, 'TAHMİN · DÜN 21.02', '212', INK],
    [1, 'GÖZLEM · KAMERA 07', String(s.counted), s.counted === 212 ? GREEN : INK],
  ] as const) {
    const x = pad + k * (w + pad)
    panel(c, x, hh + pad, w, h, label)
    c.fillStyle = color
    mono(c, Math.round(h * 0.32), 300)
    c.fillText(value, x + 20, hh + pad + h * 0.62)
    c.fillStyle = MUTED
    mono(c, Math.round(h * 0.06), 400)
    c.fillText(k === 0 ? 'araç · ±0' : 'sayım sürüyor', x + 20, hh + pad + h * 0.8)
  }
}

/** Top-down: the desk edge, the floor, where the pen will land. */
export function drawPen(c: Ctx, W: number, H: number, s: { clock: string; landed: boolean }) {
  const hh = frame(c, W, H, 'FİZİK · DÜŞME · KALEM', s.clock)
  const pad = Math.round(W * 0.05)
  const x0 = pad
  const y0 = hh + pad
  const w = W - pad * 2
  const h = H - hh - pad * 2
  panel(c, x0, y0, w, h, 'ÜSTTEN GÖRÜNÜŞ · 1:10')
  c.strokeStyle = MUTED
  c.lineWidth = 2
  c.strokeRect(x0 + w * 0.1, y0 + h * 0.18, w * 0.8, h * 0.28)
  c.fillStyle = MUTED
  mono(c, Math.round(h * 0.05), 400)
  c.fillText('MASA', x0 + w * 0.12, y0 + h * 0.26)
  const px = x0 + w * 0.42
  const py = y0 + h * 0.66
  c.strokeStyle = AMBER
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(px - 14, py - 14)
  c.lineTo(px + 14, py + 14)
  c.moveTo(px + 14, py - 14)
  c.lineTo(px - 14, py + 14)
  c.stroke()
  c.setLineDash([6, 6])
  c.beginPath()
  c.moveTo(px, py)
  c.lineTo(px + w * 0.18, py + h * 0.12)
  c.stroke()
  c.setLineDash([])
  c.fillStyle = AMBER
  c.fillText('22 cm · uç → kapı', px + w * 0.19, py + h * 0.14)
  if (s.landed) {
    c.fillStyle = GREEN
    mono(c, Math.round(h * 0.06), 500)
    c.fillText('GÖZLENDİ · SAPMA 0,4 cm', x0 + 20, y0 + h - 24)
  }
}

/** A person's next nine minutes, as a line with one mark on it. */
export function drawBehavior(c: Ctx, W: number, H: number, s: { clock: string; progress: number; done: boolean }) {
  const hh = frame(c, W, H, 'DAVRANIŞ MODELİ · ARİF D. · 9 dk', s.clock)
  const pad = Math.round(W * 0.05)
  const y = hh + (H - hh) * 0.48
  c.strokeStyle = RULE
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(pad, y)
  c.lineTo(W - pad, y)
  c.stroke()
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.032), 400)
  c.fillText('21.04', pad, y + 40)
  c.textAlign = 'right'
  c.fillText('21.13.04', W - pad, y + 40)
  c.textAlign = 'left'
  const nx = pad + (W - pad * 2) * Math.min(1, s.progress)
  c.fillStyle = INK
  c.fillRect(nx - 1, y - 16, 2, 32)
  c.fillStyle = s.done ? GREEN : AMBER
  c.beginPath()
  c.arc(W - pad, y, 9, 0, Math.PI * 2)
  c.fill()
  mono(c, Math.round(H * 0.036), 500)
  c.textAlign = 'right'
  c.fillText(s.done ? 'TAMAMLANDI' : 'BARDAK → ZEMİN', W - pad, y - 30)
  c.textAlign = 'left'
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.03), 400)
  c.fillText('güven %99,94 · yol sayısı 1.204', pad, H - pad)
}

/** The seconds before 21.13.04. */
export function drawCountdown(c: Ctx, W: number, H: number, s: { text: string; hit: boolean }) {
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)
  c.fillStyle = s.hit ? AMBER : INK
  mono(c, Math.round(H * 0.26), 300)
  c.textAlign = 'center'
  c.fillText(s.text, W / 2, H * 0.6)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.04), 400)
  c.fillText('TAHMİN EDİLEN OLAY · 21:13:04', W / 2, H * 0.8)
  c.textAlign = 'left'
}

/** A banner state: complete, deviation, error. */
export function drawBanner(c: Ctx, W: number, H: number, s: { clock: string; module: string; title: string; lines: string[]; tone: 'ok' | 'warn' | 'alert' | 'plain' }) {
  const hh = frame(c, W, H, s.module, s.clock)
  const color = s.tone === 'ok' ? GREEN : s.tone === 'warn' ? AMBER : s.tone === 'alert' ? RED : INK
  c.fillStyle = color
  mono(c, Math.round(H * 0.075), 400)
  const pad = Math.round(W * 0.06)
  let y = hh + (H - hh) * 0.36
  y = wrap(c, s.title, pad, y, W - pad * 2, Math.round(H * 0.09))
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.035), 400)
  y += Math.round(H * 0.03)
  for (const l of s.lines) y = wrap(c, l, pad, y, W - pad * 2, Math.round(H * 0.055))
}

/** CALCULATING: a bar that keeps going back to almost-done. */
export function drawCalculating(c: Ctx, W: number, H: number, s: { clock: string; t: number; depth: number }) {
  const hh = frame(c, W, H, 'SORGU · ARİF D. · GELECEK', s.clock)
  const pad = Math.round(W * 0.06)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.07), 300)
  c.fillText('CALCULATING', pad, hh + (H - hh) * 0.36)
  const p = 0.62 + 0.36 * Math.abs(Math.sin(s.t * 0.4))
  c.fillStyle = RULE
  c.fillRect(pad, hh + (H - hh) * 0.48, W - pad * 2, 6)
  c.fillStyle = AMBER
  c.fillRect(pad, hh + (H - hh) * 0.48, (W - pad * 2) * p, 6)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.034), 400)
  for (let i = 0; i < Math.min(6, s.depth); i++) c.fillText(`öz-model katmanı ${i + 1} · ${i + 1 < s.depth ? 'tamam' : 'hesaplanıyor'}`, pad, hh + (H - hh) * (0.6 + i * 0.065))
}

/** The archive of everything ever asked. */
export function drawArchive(c: Ctx, W: number, H: number, s: { clock: string; highlight: 'none' | 'record' | 'same'; scroll: number; count: number }) {
  const hh = frame(c, W, H, 'ARŞİV · SORGULAR', s.clock)
  const pad = Math.round(W * 0.03)
  const rh = Math.round(H * 0.06)
  const rows: Array<[string, string, string]> = [
    ['14.03.2031', 'Geleceğimi biliyor musun?', 'BEKLEMEDE'],
    ['09.02.2029', 'Yarın Gölbaşı’nda don olacak mı?', 'DOĞRU'],
    ['11.05.2029', 'Geleceğimi biliyor musun?', '—'],
    ['02.11.2030', 'Hafta sonu hava?', 'YANLIŞ'],
    ['17.06.2030', 'Final maçı kaç kaç biter?', 'DOĞRU'],
    ['03.01.2031', 'Geleceğimi biliyor musun?', '—'],
    ['22.08.2031', 'Dolar cuma kaç olur?', 'DOĞRU'],
    ['04.10.2031', 'Geleceğimi biliyor musun?', '—'],
    ['29.12.2031', 'Annem iyileşecek mi?', '—'],
    ['15.02.2032', 'Geleceğimi biliyor musun?', '—'],
    ['06.07.2032', 'Trafik 14.17 Kızılay?', 'DOĞRU'],
    ['11.09.2032', 'Geleceğimi biliyor musun?', '—'],
    ['—', 'Geleceğimi biliyor musun?', '—'],
    ['—', 'Geleceğimi biliyor musun?', '—'],
  ]
  let y = hh + pad + rh * 0.7 - s.scroll * rh * 4
  mono(c, Math.round(rh * 0.42), 400)
  rows.forEach(([date, q, state], i) => {
    if (y < hh + 10 || y > H - pad) {
      y += rh
      return
    }
    const same = q.startsWith('Geleceğimi')
    const lit = (s.highlight === 'record' && i === 0) || (s.highlight === 'same' && same)
    if (lit) {
      c.fillStyle = 'rgba(226,176,98,0.12)'
      c.fillRect(pad, y - rh * 0.68, W - pad * 2, rh * 0.92)
    }
    c.fillStyle = lit ? AMBER : MUTED
    c.fillText(date, pad + 12, y)
    c.fillStyle = lit ? INK : 'rgba(217,221,224,0.75)'
    c.fillText(q, pad + W * 0.2, y)
    c.fillStyle = state === 'YANLIŞ' ? RED : state === 'DOĞRU' ? GREEN : state === 'BEKLEMEDE' ? AMBER : FAINT
    c.textAlign = 'right'
    c.fillText(state, W - pad - 12, y)
    c.textAlign = 'left'
    y += rh
  })
  if (s.highlight === 'same') {
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.04), 500)
    c.textAlign = 'right'
    c.fillText(`× ${s.count.toLocaleString('tr-TR')}`, W - pad - 12, H - pad)
    c.textAlign = 'left'
  }
}

/** The empty room's screen: who is watching, and an input that waits. */
export function drawObserver(c: Ctx, W: number, H: number, s: { observers: number; input: boolean; accepted: boolean; t: number }) {
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.035), 400)
  c.fillText(`OBSERVER: ${String(s.observers).padStart(2, '0')}`, Math.round(W * 0.06), Math.round(H * 0.12))
  if (!s.input) return
  const pad = Math.round(W * 0.06)
  c.fillStyle = INK
  mono(c, Math.round(H * 0.05), 400)
  c.fillText('QUERY INPUT', pad, H * 0.42)
  c.strokeStyle = RULE
  c.strokeRect(pad, H * 0.47, W - pad * 2, H * 0.12)
  if (s.accepted) {
    c.fillStyle = AMBER
    c.fillText('QUERY ACCEPTED', pad + 16, H * 0.55)
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.035), 400)
    c.fillText('Bu soru daha önce de soruldu.', pad, H * 0.7)
  } else if (Math.floor(s.t * 1.6) % 2 === 0) {
    c.fillStyle = INK
    c.fillRect(pad + 16, H * 0.495, H * 0.025, H * 0.07)
  }
}

// ——— Side monitors ———

/** A scrolling system log; an amber badge for the waiting query; one red row in its history. */
export function drawLog(c: Ctx, W: number, H: number, s: { t: number; future: boolean; failed: boolean }) {
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)
  const rand = mulberry32(31)
  const lines = Array.from({ length: 40 }, (_, i) => {
    const a = ['kalibrasyon', 'senkron', 'akıntı modeli', 'nüfus akışı', 'şebeke yükü', 'hava parseli', 'yörünge', 'trafik grafı'][Math.floor(rand() * 8)]
    return `${String(i).padStart(4, '0')}  ${a.padEnd(14)} ${(rand() * 99).toFixed(2)}  ok`
  })
  mono(c, Math.round(H * 0.045), 400)
  const lh = Math.round(H * 0.062)
  const off = (s.t * 0.8) % lines.length
  for (let i = 0; i < 16; i++) {
    const line = lines[Math.floor(off + i) % lines.length]
    c.fillStyle = 'rgba(125,138,147,0.85)'
    c.fillText(line, 14, 24 + i * lh)
  }
  if (s.failed) {
    c.fillStyle = 'rgba(224,90,71,0.16)'
    c.fillRect(8, H * 0.55, W - 16, lh * 1.1)
    c.fillStyle = RED
    c.fillText('2030-11-02  hava  YANLIŞ  · tahmin yayımlandı', 14, H * 0.55 + lh * 0.8)
  }
  if (s.future) {
    c.fillStyle = 'rgba(226,176,98,0.14)'
    c.fillRect(W - W * 0.42, H - lh * 1.6, W * 0.4, lh * 1.2)
    c.fillStyle = AMBER
    c.textAlign = 'right'
    c.fillText('FUTURE QUERY · 1', W - 18, H - lh * 0.75)
    c.textAlign = 'left'
  }
}

/** A traffic camera at Kızılay, drawn as the system sees it: lanes and boxes. */
export function drawCam(c: Ctx, W: number, H: number, s: { t: number; count: number }) {
  c.fillStyle = '#0c0f12'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = 'rgba(217,221,224,0.25)'
  c.lineWidth = 2
  for (const k of [0.25, 0.5, 0.75]) {
    c.beginPath()
    c.moveTo(W * (0.5 - (0.5 - k) * 0.25), H * 0.15)
    c.lineTo(W * k * 1.0 + (k - 0.5) * W * 0.4, H)
    c.stroke()
  }
  const rand = mulberry32(5)
  for (let i = 0; i < 9; i++) {
    const lane = Math.floor(rand() * 4)
    const v = ((s.t * (0.1 + rand() * 0.06) + rand()) % 1) ** 1.4
    const y = H * (0.18 + v * 0.8)
    const sc = 0.3 + v
    const x = W * (0.5 + (lane - 1.5) * (0.07 + v * 0.18))
    c.strokeStyle = AMBER
    c.strokeRect(x - 18 * sc, y - 10 * sc, 36 * sc, 20 * sc)
  }
  c.fillStyle = INK
  mono(c, Math.round(H * 0.06), 400)
  c.fillText(`KAMERA 07 · KIZILAY · ${String(s.count).padStart(3, '0')}`, 14, H - 16)
}

/** System load; when the reader is noticed, it says so. */
export function drawLoad(c: Ctx, W: number, H: number, s: { t: number; spike: number; observer: boolean }) {
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)
  c.fillStyle = MUTED
  mono(c, Math.round(H * 0.07), 400)
  c.fillText('SOĞUTMA · YÜK', 12, H * 0.14)
  c.strokeStyle = s.spike > 0.5 ? AMBER : GREEN
  c.lineWidth = 2
  c.beginPath()
  for (let i = 0; i <= 60; i++) {
    const x = 12 + (i / 60) * (W - 24)
    const n = Math.sin(i * 0.5 + s.t * 2) * 0.05 + Math.sin(i * 0.17 + s.t) * 0.06
    const spike = s.spike * Math.exp(-((i - 48) ** 2) / 30)
    const y = H * (0.75 - 0.3 - n - spike * 0.4)
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.stroke()
  if (s.observer) {
    c.fillStyle = 'rgba(226,176,98,0.14)'
    c.fillRect(8, H * 0.8, W - 16, H * 0.14)
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.065), 500)
    c.fillText('OBSERVER INPUT DETECTED', 14, H * 0.9)
  }
}

// ——— The wall display ———

/** One particle; the paths it could take; the one that was seen. */
export function drawParticle(c: Ctx, W: number, H: number, s: { t: number; spread: number; measured: number; clock: string }) {
  const hh = frame(c, W, H, 'OLASILIK · TEK PARÇACIK', s.clock)
  const ox = W * 0.12
  const oy = hh + (H - hh) * 0.5
  const rand = mulberry32(17)
  const paths = Math.round(2 + s.spread * 160)
  for (let k = 0; k < paths; k++) {
    const a = (rand() - 0.5) * 1.8 * s.spread
    const b = (rand() - 0.5) * 1.2 * s.spread
    const chosen = k === 0
    const alpha = chosen ? 0.9 : 0.12 * (1 - s.measured)
    if (alpha < 0.01) continue
    c.strokeStyle = chosen ? AMBER : `rgba(217,221,224,${alpha})`
    c.lineWidth = chosen ? 2.5 : 1
    c.beginPath()
    c.moveTo(ox, oy)
    for (let i = 1; i <= 24; i++) {
      const u = i / 24
      const x = ox + u * W * 0.76
      const y = oy + (H - hh) * 0.36 * (a * u + b * Math.sin(u * 3 + k)) * (chosen ? 0.4 : 1)
      c.lineTo(x, y)
    }
    c.stroke()
  }
  c.fillStyle = INK
  c.beginPath()
  c.arc(ox, oy, 7, 0, Math.PI * 2)
  c.fill()
  if (s.measured > 0.5) {
    c.fillStyle = AMBER
    mono(c, Math.round(H * 0.032), 500)
    c.fillText('ÖLÇÜLDÜ · tek sonuç', W * 0.66, hh + 36)
  } else if (s.spread > 0.1) {
    c.fillStyle = MUTED
    mono(c, Math.round(H * 0.032), 400)
    c.fillText(`olası yol · ${paths}`, W * 0.66, hh + 36)
  }
}

/** A small change at the start, carried along two paths: now, and what-if. */
export function drawChain(c: Ctx, W: number, H: number, s: { progress: number; clock: string; label: string }) {
  const hh = frame(c, W, H, `KARŞI-OLGU · ${s.label}`, s.clock)
  const steps = ['BAŞLANGIÇ', 'HAVA', 'TRAFİK', 'ŞEBEKE', 'DAVRANIŞ', 'ŞEHİR']
  const x0 = W * 0.08
  const x1 = W * 0.92
  const yA = hh + (H - hh) * 0.36
  const yB = hh + (H - hh) * 0.7
  const n = steps.length
  const reach = s.progress * (n - 1)
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1)
    const on = i <= reach
    const div = Math.max(0, i - 1) / (n - 2)
    const yb = yA + (yB - yA) * Math.min(1, div * div * 1.2)
    c.fillStyle = on ? INK : FAINT
    c.beginPath()
    c.arc(x, yA, 6, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = on ? AMBER : FAINT
    c.beginPath()
    c.arc(x, yb, 6, 0, Math.PI * 2)
    c.fill()
    mono(c, Math.round(H * 0.028), 400)
    c.fillStyle = on ? MUTED : FAINT
    c.textAlign = 'center'
    c.fillText(steps[i], x, yA - 22)
    c.textAlign = 'left'
    if (i > 0) {
      const xp = x0 + ((x1 - x0) * (i - 1)) / (n - 1)
      const ypb = yA + (yB - yA) * Math.min(1, ((Math.max(0, i - 2) / (n - 2)) ** 2) * 1.2)
      c.strokeStyle = i <= reach ? 'rgba(217,221,224,0.6)' : FAINT
      c.beginPath()
      c.moveTo(xp, yA)
      c.lineTo(x, yA)
      c.stroke()
      c.strokeStyle = i <= reach ? AMBER : FAINT
      c.beginPath()
      c.moveTo(xp, ypb)
      c.lineTo(x, yb)
      c.stroke()
    }
  }
  mono(c, Math.round(H * 0.03), 500)
  c.fillStyle = MUTED
  c.fillText('ŞİMDİKİ YOL', x0, yA + 34)
  c.fillStyle = AMBER
  c.fillText('KARŞI-OLGU YOL', x0, yB + 34)
}

// ——— Paper, phone, board ———

export function drawPhone(c: Ctx, W: number, H: number, s: { clock: string; lit: boolean; message: boolean }) {
  c.fillStyle = '#050607'
  c.fillRect(0, 0, W, H)
  if (!s.lit) return
  const g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#1b2430')
  g.addColorStop(1, '#0c1016')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#eef1f4'
  sans(c, Math.round(W * 0.22), 200)
  c.textAlign = 'center'
  c.fillText(s.clock, W / 2, H * 0.22)
  c.textAlign = 'left'
  if (!s.message) return
  const pad = W * 0.06
  for (const [y, h, title, body] of [
    [H * 0.34, H * 0.11, 'Telefon · 22.51', 'Cevapsız arama: Defne'],
    [H * 0.47, H * 0.2, 'Defne · 22.53', 'Yemek fırında. Yine sabah mı? Sorun değil, sadece bil istedim.'],
  ] as const) {
    c.fillStyle = 'rgba(255,255,255,0.12)'
    c.fillRect(pad, y, W - pad * 2, h)
    c.fillStyle = 'rgba(238,241,244,0.65)'
    sans(c, Math.round(W * 0.045), 500)
    c.fillText(title, pad + 10, y + W * 0.07)
    c.fillStyle = '#eef1f4'
    sans(c, Math.round(W * 0.05), 400)
    wrap(c, body, pad + 10, y + W * 0.14, W - pad * 2 - 20, W * 0.065)
  }
}

export function drawNote(c: Ctx, W: number, H: number) {
  c.fillStyle = '#f2d76b'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#2a2414'
  c.font = `600 ${Math.round(H * 0.3)}px 'Segoe Print', 'Bradley Hand', cursive`
  c.textAlign = 'center'
  c.fillText('KAHVE!', W / 2, H * 0.46)
  c.font = `400 ${Math.round(H * 0.16)}px 'Segoe Print', 'Bradley Hand', cursive`
  c.fillText('gerçekten.', W / 2, H * 0.78)
  c.textAlign = 'left'
}

export function drawBoard(c: Ctx, W: number, H: number) {
  c.fillStyle = '#eceeea'
  c.fillRect(0, 0, W, H)
  // Ghosts of erased writing.
  c.strokeStyle = 'rgba(80,90,100,0.12)'
  c.lineWidth = 10
  for (let i = 0; i < 9; i++) {
    c.beginPath()
    c.moveTo(W * 0.05, H * (0.1 + i * 0.09))
    c.bezierCurveTo(W * 0.3, H * (0.08 + i * 0.09), W * 0.6, H * (0.14 + i * 0.09), W * 0.9, H * (0.1 + i * 0.09))
    c.stroke()
  }
  c.fillStyle = '#25466e'
  c.font = `500 ${Math.round(H * 0.07)}px 'Segoe Print', 'Bradley Hand', cursive`
  c.fillText('t → t+Δt :  S(t) ⟶ S(t+Δt)', W * 0.06, H * 0.2)
  c.fillText('Δ başlangıç  ≈ 10⁻⁶  →  ?', W * 0.06, H * 0.34)
  c.strokeStyle = '#25466e'
  c.lineWidth = 3
  c.strokeRect(W * 0.56, H * 0.42, W * 0.36, H * 0.3)
  c.fillText('SORGU → model', W * 0.58, H * 0.54)
  c.fillText('model → SORGU ?', W * 0.58, H * 0.66)
  c.fillStyle = 'rgba(160,40,40,0.55)'
  c.font = `400 ${Math.round(H * 0.06)}px 'Segoe Print', 'Bradley Hand', cursive`
  c.fillText('Sorulmamış soru = ölçülmemiş durum?   — S.K. 2029', W * 0.06, H * 0.88)
}

export function drawDrawing(c: Ctx, W: number, H: number) {
  c.fillStyle = '#f7f3ea'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = '#3a6bd4'
  c.lineWidth = 6
  c.strokeRect(W * 0.2, H * 0.3, W * 0.45, H * 0.32)
  c.fillStyle = '#e46b4f'
  c.beginPath()
  c.arc(W * 0.78, H * 0.38, H * 0.09, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#e46b4f'
  c.beginPath()
  c.moveTo(W * 0.78, H * 0.47)
  c.lineTo(W * 0.78, H * 0.7)
  c.moveTo(W * 0.7, H * 0.56)
  c.lineTo(W * 0.86, H * 0.56)
  c.stroke()
  c.fillStyle = '#333'
  c.font = `500 ${Math.round(H * 0.07)}px 'Segoe Print', 'Comic Sans MS', cursive`
  c.fillText('Annemin işi:', W * 0.08, H * 0.14)
  c.font = `400 ${Math.round(H * 0.055)}px 'Segoe Print', 'Comic Sans MS', cursive`
  c.fillText('bilgisayar uyumasın diye bekliyor', W * 0.08, H * 0.86)
}
