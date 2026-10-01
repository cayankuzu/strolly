/**
 * Canvas-drawn surfaces for in-world screens, signs and paper. Content is
 * drawn once per distinct state and cached, so evaluating a scene at two
 * moments in the same frame never redraws or re-uploads a texture.
 */
import * as THREE from 'three'

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

const fonts = { sans: 'sans-serif', mono: 'monospace' }

/** Picks up the self-hosted page fonts so canvases match the DOM typography. */
export function resolveFonts() {
  const css = getComputedStyle(document.documentElement)
  fonts.sans = css.getPropertyValue('--font-geist-sans').trim() || fonts.sans
  fonts.mono = css.getPropertyValue('--font-geist-mono').trim() || fonts.mono
}

export const mono = (ctx: CanvasRenderingContext2D, size: number, weight = 400) => {
  ctx.font = `${weight} ${size}px ${fonts.mono}`
}
export const sans = (ctx: CanvasRenderingContext2D, size: number, weight = 400) => {
  ctx.font = `${weight} ${size}px ${fonts.sans}`
}
export function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  ctx.letterSpacing = `${spacing}px`
  ctx.fillText(text, x, y)
  ctx.letterSpacing = '0px'
}
export function fill(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
}

export class ScreenCache {
  private cache = new Map<string, THREE.CanvasTexture>()
  constructor(
    private width: number,
    private height: number,
    private limit = 24,
  ) {}

  get(key: string, draw: Draw) {
    let tex = this.cache.get(key)
    if (tex) {
      // Refresh recency.
      this.cache.delete(key)
      this.cache.set(key, tex)
      return tex
    }
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    draw(canvas.getContext('2d')!, this.width, this.height)
    tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    this.cache.set(key, tex)
    if (this.cache.size > this.limit) {
      const [oldKey, old] = this.cache.entries().next().value as [string, THREE.CanvasTexture]
      this.cache.delete(oldKey)
      old.dispose()
    }
    return tex
  }

  dispose() {
    this.cache.forEach((t) => t.dispose())
    this.cache.clear()
  }
}

/** A single canvas texture redrawn in place (used for values that change continuously). */
export class LiveScreen {
  readonly texture: THREE.CanvasTexture
  private ctx: CanvasRenderingContext2D
  private key = ''
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    this.ctx = canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
  }
  update(key: string, draw: Draw) {
    if (key === this.key) return
    this.key = key
    this.ctx.clearRect(0, 0, this.width, this.height)
    draw(this.ctx, this.width, this.height)
    this.texture.needsUpdate = true
  }
  dispose() {
    this.texture.dispose()
  }
}

/** Small printed labels (tags, notes). */
export function drawLabel(lines: string[], opts: { size?: number; color?: string; bg?: string } = {}): Draw {
  return (ctx, w, h) => {
    fill(ctx, w, h, opts.bg ?? '#d9d4ca')
    ctx.fillStyle = opts.color ?? '#1b1a19'
    mono(ctx, opts.size ?? 22, 500)
    lines.forEach((line, i) => spaced(ctx, line, 18, 34 + i * ((opts.size ?? 22) + 12), 2))
  }
}
