/**
 * PARALEL-LEŞ — small effects shared by the sets: a particle burst (dust,
 * spray, smoke) written as a pure function of its own progress, and a
 * drifting cloud of motes around a point.
 */
import * as THREE from 'three'
import { rng } from './common'
import { particleMaterial } from './shaders'

export type BurstShape = {
  /** Horizontal spread at the end of the burst (m). */
  r: number
  /** How high it climbs (m). */
  h: number
  /** Extra drift (m) over the burst, e.g. wind. */
  drift?: [number, number, number]
  /** Gravity on the particles (m at t = 1); positive pulls down. */
  fall?: number
  /** Opacity at its peak. */
  opacity?: number
  /** Start radius. */
  r0?: number
}

/** A burst of `n` soft particles; `set(…, t)` draws it at progress t ∈ [0, 1] (hidden outside). */
export class Burst {
  readonly points: THREE.Points
  private seeds: Float32Array
  private mat: THREE.PointsMaterial

  constructor(n: number, color: THREE.ColorRepresentation, size: number, additive = false, seed = 7) {
    const rand = rng(seed)
    this.seeds = new Float32Array(n * 4)
    for (let i = 0; i < this.seeds.length; i++) this.seeds[i] = rand()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    this.mat = particleMaterial(color, size, 0.8, additive)
    this.points = new THREE.Points(geo, this.mat)
    this.points.frustumCulled = false
    this.points.visible = false
    this.points.renderOrder = 6
  }

  set(x: number, y: number, z: number, t: number, s: BurstShape) {
    if (t <= 0 || t >= 1) {
      this.points.visible = false
      return
    }
    this.points.visible = true
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute
    const k = this.seeds
    const out = 1 - Math.pow(1 - t, 2.2)
    const [dx, dy, dz] = s.drift ?? [0, 0, 0]
    for (let i = 0; i < pos.count; i++) {
      const a = k[i * 4] * Math.PI * 2
      const r = (s.r0 ?? 0.05) + Math.sqrt(k[i * 4 + 1]) * s.r * out
      const h = k[i * 4 + 2] * s.h * out - (s.fall ?? 0) * t * t * (0.5 + k[i * 4 + 3])
      pos.setXYZ(i, x + Math.cos(a) * r + dx * t * (0.6 + 0.8 * k[i * 4 + 3]), y + h + dy * t, z + Math.sin(a) * r + dz * t * (0.6 + 0.8 * k[i * 4 + 1]))
    }
    pos.needsUpdate = true
    this.mat.opacity = (s.opacity ?? 0.8) * Math.min(1, t * 8) * (1 - t)
  }

  hide() {
    this.points.visible = false
  }
}

/** Motes drifting in a box around a centre (dust in light, spray, snow of sand). */
export class Motes {
  readonly points: THREE.Points
  private seeds: Float32Array
  readonly material: THREE.PointsMaterial

  constructor(
    n: number,
    color: THREE.ColorRepresentation,
    size: number,
    private box: [number, number, number],
    opacity = 0.5,
    additive = true,
    seed = 11,
  ) {
    const rand = rng(seed)
    this.seeds = new Float32Array(n * 4)
    for (let i = 0; i < this.seeds.length; i++) this.seeds[i] = rand()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    this.material = particleMaterial(color, size, opacity, additive)
    this.points = new THREE.Points(geo, this.material)
    this.points.frustumCulled = false
  }

  /** Motes around (x, y, z), drifting with `wind` (m/s) over time t. */
  update(x: number, y: number, z: number, t: number, wind: [number, number, number] = [0.05, 0.02, 0]) {
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute
    const k = this.seeds
    const [bx, by, bz] = this.box
    const wrap = (v: number, span: number) => ((((v / span) % 1) + 1) % 1) * span - span / 2
    for (let i = 0; i < pos.count; i++) {
      const a = k[i * 4]
      const b = k[i * 4 + 1]
      const c = k[i * 4 + 2]
      const e = k[i * 4 + 3]
      const sp = 0.5 + e
      pos.setXYZ(
        i,
        x + wrap(a * bx + t * wind[0] * sp + Math.sin(t * 0.3 + e * 9) * 0.15, bx),
        y + wrap(b * by + t * wind[1] * sp + Math.sin(t * 0.21 + a * 7) * 0.1, by),
        z + wrap(c * bz + t * wind[2] * sp + Math.cos(t * 0.27 + b * 5) * 0.15, bz),
      )
    }
    pos.needsUpdate = true
  }
}
