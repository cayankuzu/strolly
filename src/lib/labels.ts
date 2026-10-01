import type { LabelFrame } from '@/three/Stage'

/** DOM labels pinned to points in the 3D scene (text stays crisp and selectable). */
export class LabelLayer {
  private nodes = new Map<string, HTMLDivElement>()
  private live = new Set<string>()

  constructor(private root: HTMLElement) {}

  update(frames: LabelFrame[]) {
    this.live.clear()
    const w = this.root.clientWidth
    const h = this.root.clientHeight
    for (const f of frames) {
      let el = this.nodes.get(f.id)
      if (!el) {
        el = document.createElement('div')
        el.className = `label label--${f.kind}`
        this.root.appendChild(el)
        this.nodes.set(f.id, el)
      }
      if (el.textContent !== f.text) el.textContent = f.text
      el.style.transform = `translate3d(${(f.x * w).toFixed(1)}px, ${(f.y * h).toFixed(1)}px, 0)`
      el.style.opacity = f.opacity.toFixed(3)
      el.style.visibility = 'visible'
      this.live.add(f.id)
    }
    this.nodes.forEach((el, id) => {
      if (!this.live.has(id) && el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
    })
  }

  dispose() {
    this.nodes.forEach((el) => el.remove())
    this.nodes.clear()
  }
}
