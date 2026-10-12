/**
 * Set B — the white corridor behind the second door (x 38.9…41.1, z 0…−12.2)
 * and the elevator at its end (cabin z −12.2…−14.4): brushed steel, a ceiling
 * panel, a floor indicator of amber digits that keeps on counting.
 */
import * as THREE from 'three'
import { canvasPlane, rbox, room } from '../kit/props'
import { mesh } from '../util'
import type { Pal } from './materials'
import { drawCorridorPlaque, drawIndicator, keyhole } from './draw'

const PI = Math.PI
export const B = {
  x: 40,
  doorZ: -12.2,
  cabin: { M: [40, -13.25], O1: [39.3, -13.25], O2: [40.7, -13.25], Q1: [40, -12.55], Q2: [39.55, -14.1], Q3: [40.45, -14.1] } as Record<string, [number, number]>,
}

export class Corridor {
  readonly group = new THREE.Group()
  readonly leaves: THREE.Mesh[] = []
  private inside: ReturnType<typeof canvasPlane>
  private outside: ReturnType<typeof canvasPlane>
  readonly panel: THREE.MeshBasicMaterial
  private key = ''

  constructor(m: Pal, scene: THREE.Scene) {
    const g = this.group
    scene.add(g)
    const c = room({
      w: 2.2,
      d: 12.2,
      h: 2.8,
      x: 40,
      z: -6.1,
      wall: m.whiteWall,
      floor: m.paleFloor,
      ceiling: m.whiteCeiling,
      trim: m.whiteWall,
      skip: ['n'],
      openings: [{ side: 's', at: 0, width: 1.3, height: 2.4 }],
    })
    g.add(c)
    // Light strips across the ceiling every 2 m.
    for (let z = -1; z > -12; z -= 2) {
      rbox(1.7, 0.03, 0.12, m.lightStrip, 40, 2.785, z, g, 0.01)
    }
    // The back of door 2, closed.
    rbox(1.3, 2.4, 0.06, m.brushed, 40, 1.2, -0.03, g, 0.004)
    // A rail along both walls, and a camera dome at the far end.
    for (const sx of [-1, 1]) rbox(0.03, 0.05, 12.0, m.brushed, 40 + sx * 1.085, 0.95, -6.1, g, 0.01)
    const dome = mesh(new THREE.SphereGeometry(0.07, 16, 10, 0, PI * 2, 0, PI / 2), m.indicatorGlass, 40.8, 2.8, -11.5, g)
    dome.rotation.x = PI
    // The brass plaque on the left wall.
    const plaque = canvasPlane(0.4, 0.25, 512, drawCorridorPlaque)
    plaque.mesh.position.set(38.912, 1.5, -5)
    plaque.mesh.rotation.y = PI / 2
    g.add(plaque.mesh)
    rbox(0.012, 0.26, 0.41, m.brass, 38.905, 1.5, -5, g, 0.003)

    // ——— Elevator: the end wall (white on this side), doors in a steel surround, the cabin behind ———
    rbox(0.5, 2.8, 0.04, m.whiteWall, 39.15, 1.4, -12.03, g, 0.004)
    rbox(0.5, 2.8, 0.04, m.whiteWall, 40.85, 1.4, -12.03, g, 0.004)
    rbox(1.2, 0.6, 0.04, m.whiteWall, 40, 2.5, -12.03, g, 0.004)
    for (const sx of [-1, 1]) rbox(0.06, 2.26, 0.03, m.brushed, 40 + sx * 0.63, 1.13, -12.0, g, 0.004)
    rbox(1.32, 0.06, 0.03, m.brushed, 40, 2.23, -12.0, g, 0.004)
    for (const sx of [-1, 1]) {
      const leaf = rbox(0.6, 2.2, 0.03, m.cabinSteel, 40 + sx * 0.3, 1.1, -12.12, g, 0.003)
      this.leaves.push(leaf)
    }
    // A call panel beside the doors.
    rbox(0.1, 0.24, 0.02, m.brushed, 40.9, 1.15, -12.0, g, 0.004)
    mesh(new THREE.CircleGeometry(0.018, 20), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), 40.9, 1.12, -11.988, g)
    // The cabin: steel walls, a light panel, a handrail.
    const cab = room({ w: 2.2, d: 2.2, h: 2.6, x: 40, z: -13.3, wall: m.cabinSteel, floor: m.cabinFloor, ceiling: m.cabinSteel, trim: null, openings: [{ side: 's', at: 0, width: 1.2, height: 2.2 }] })
    g.add(cab)
    this.panel = new THREE.MeshBasicMaterial({ color: 0xf1f4f8 })
    const panel = mesh(new THREE.PlaneGeometry(1.6, 1.6), this.panel, 40, 2.595, -13.3, g)
    panel.rotation.x = PI / 2
    for (const [x, z, ry] of [
      [38.92, -13.3, PI / 2],
      [41.08, -13.3, -PI / 2],
    ] as const) {
      const rail = rbox(1.8, 0.04, 0.04, m.brushed, x, 0.95, z, g, 0.015)
      rail.rotation.y = ry
    }
    rbox(2.0, 0.04, 0.04, m.brushed, 40, 0.95, -14.37, g, 0.015)
    // Panelling joints on the cabin walls.
    for (const x of [39.45, 40.55]) rbox(0.006, 2.5, 0.004, m.blackMetal, x, 1.3, -14.395, g, 0.001)
    // The floor indicators: inside over the doors (facing −z) and outside (facing +z).
    this.inside = canvasPlane(0.5, 0.12, 256, drawIndicator('1', 0), { emissive: true })
    this.inside.mesh.position.set(40, 2.42, -12.215)
    this.inside.mesh.rotation.y = PI
    g.add(this.inside.mesh)
    rbox(0.54, 0.15, 0.01, m.indicatorGlass, 40, 2.42, -12.207, g, 0.004)
    this.outside = canvasPlane(0.5, 0.12, 256, drawIndicator('1', 0), { emissive: true })
    this.outside.mesh.position.set(40, 2.5, -12.005)
    g.add(this.outside.mesh)
    const emb = canvasPlane(0.1, 0.1, 128, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      keyhole(ctx, w / 2, h * 0.32, w * 0.16, '#3a3c40', 5)
    }, { transparent: true })
    emb.mesh.position.set(40, 2.1, -14.39)
    g.add(emb.mesh)
  }

  /** Door leaves: 0 closed … 1 open (they slide apart). */
  setDoors(open: number) {
    this.leaves.forEach((l, i) => (l.position.x = 40 + (i ? 1 : -1) * (0.3 + open * 0.58)))
  }

  setIndicator(text: string, blur: number) {
    const key = `${text}|${blur.toFixed(1)}`
    if (key === this.key) return
    this.key = key
    this.inside.redraw(drawIndicator(text, blur), key)
    this.outside.redraw(drawIndicator(text, blur), key)
  }
}
