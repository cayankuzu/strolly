/**
 * G. The stretcher room (x ≈ 500): a dark grey hall lit by its screens. An
 * upright stretcher at (500, 0, 2.5), tilted back 8°, facing −z; five screens
 * in an arc at z ≈ −5 (a big centre screen and two pairs); four fluid tanks
 * along the west wall, lit from below; cable trays on the floor. The mirror
 * that grows over the brain schema is a real reflection.
 */
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { mulberry32 } from '@/lib/math'
import { canvasPlane, rbox, tube } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { wall } from './parts'

const PI = Math.PI

export const STRETCHER = new THREE.Vector3(500, 0, 2.5)
export const STRETCHER_TILT = 0.14
export const SCREENS = {
  centre: { pos: new THREE.Vector3(500, 2.6, -5.2), w: 4.0, h: 2.4 },
  lu: { pos: new THREE.Vector3(496.2, 2.8, -4.6), w: 2.0, h: 1.3 },
  ll: { pos: new THREE.Vector3(496.2, 1.3, -4.6), w: 2.0, h: 1.3 },
  ru: { pos: new THREE.Vector3(503.8, 2.8, -4.6), w: 2.0, h: 1.3 },
  rl: { pos: new THREE.Vector3(503.8, 1.3, -4.6), w: 2.0, h: 1.3 },
}
export type ScreenId = keyof typeof SCREENS

export class StretcherRoom {
  readonly group = new THREE.Group()
  /** Levy's figure is mounted here while strapped (the tilt of the board). */
  readonly holder = new THREE.Group()
  screens = {} as Record<ScreenId, ReturnType<typeof canvasPlane>>
  screenMats = {} as Record<ScreenId, THREE.MeshBasicMaterial>
  vitals!: ReturnType<typeof canvasPlane>
  mirror!: Reflector
  straps = new THREE.Group()
  bubbles!: THREE.InstancedMesh
  private bubbleSeeds: Array<[number, number, number, number]> = []
  private dummy = new THREE.Object3D()
  liquid: THREE.Mesh[] = []

  constructor(private pal: Pal) {}

  build(scene: THREE.Scene) {
    const m = this.pal
    const g = this.group
    scene.add(g)
    const H = 6
    const fl = mesh(new THREE.PlaneGeometry(24, 20), m.darkFloor, 500, 0, -4, g)
    fl.rotation.x = -PI / 2
    fl.receiveShadow = true
    const ce = mesh(new THREE.PlaneGeometry(24, 20), m.darkGrey, 500, H, -4, g)
    ce.rotation.x = PI / 2
    const w = { a: m.darkGrey, b: m.darkGrey }
    wall(g, 488, -14, 512, -14, 0, H, w)
    wall(g, 512, -14, 512, 6, 0, H, w)
    wall(g, 512, 6, 488, 6, 0, H, w)
    wall(g, 488, 6, 488, -14, 0, H, w)
    // Ribs on the walls and a gantry overhead.
    for (let i = 0; i < 9; i++) {
      rbox(0.2, H, 0.25, m.steelDark, 488.12, H / 2, -13 + i * 2.4, g, 0.01)
      rbox(0.2, H, 0.25, m.steelDark, 511.88, H / 2, -13 + i * 2.4, g, 0.01)
    }
    for (const z of [-8, -2, 3]) rbox(24, 0.3, 0.25, m.steelDark, 500, H - 0.4, z, g, 0.01)
    // Cable trays on the floor, running to the screens and the stretcher.
    for (const x of [497.5, 502.5]) rbox(0.4, 0.08, 16, m.steelDark, x, 0.04, -4.5, g, 0.01)
    const rand = mulberry32(14)
    for (let i = 0; i < 10; i++) {
      const x = 497.4 + (i % 5) * 0.05 + (i >= 5 ? 5 : 0)
      tube(
        [
          [x, 0.09, 3.5],
          [x + (rand() - 0.5) * 0.1, 0.09, -2],
          [x, 0.09, -12.4],
        ],
        0.018,
        m.cable,
        g,
        20,
      )
    }
    for (const [x0, z0, x1, z1] of [
      [497.5, 1.8, 499.6, 2.3],
      [502.5, 1.8, 500.4, 2.3],
      [497.5, -4.6, 496.2, -4.5],
      [502.5, -4.6, 503.8, -4.5],
    ])
      tube(
        [
          [x0, 0.09, z0],
          [(x0 + x1) / 2, 0.05, (z0 + z1) / 2],
          [x1, 0.4, z1],
        ],
        0.025,
        m.cable,
        g,
        12,
      )
    // Fluid tanks along the west wall at x 490, z −10, −7, −4, −1.
    for (const z of [-10, -7, -4, -1]) {
      cyl(0.5, 0.55, 0.3, m.steelDark, 490, 0.15, z, g, 32)
      cyl(0.5, 0.5, 0.2, m.steelDark, 490, 2.95, z, g, 32)
      const glass = mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.6, 32, 1, true), m.tankGlass, 490, 1.6, z, g)
      glass.renderOrder = 3
      const liq = mesh(new THREE.CylinderGeometry(0.38, 0.38, 2.4, 32), m.tankLiquid, 490, 1.52, z, g)
      liq.renderOrder = 2
      this.liquid.push(liq)
      mesh(new THREE.CircleGeometry(0.36, 24), m.gutter, 490, 0.31, z, g).rotation.x = -PI / 2
      tube(
        [
          [490, 3.05, z],
          [490.3, 4.0, z],
          [490.5, H - 0.4, z + 0.5],
        ],
        0.05,
        m.cable,
        g,
        12,
      )
    }
    this.bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 8, 6), m.bubble, 48)
    for (let i = 0; i < 48; i++) this.bubbleSeeds.push([[-10, -7, -4, -1][i % 4], (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5, rand()])
    this.bubbles.frustumCulled = false
    g.add(this.bubbles)
    // The screen wall: an arc of five screens facing the stretcher.
    const target = new THREE.Vector3(500, 2.0, 2.5)
    for (const [id, s] of Object.entries(SCREENS) as Array<[ScreenId, (typeof SCREENS)[ScreenId]]>) {
      const holder = new THREE.Group()
      holder.position.copy(s.pos)
      holder.lookAt(target.x, s.pos.y, target.z)
      g.add(holder)
      rbox(s.w + 0.1, s.h + 0.1, 0.08, m.blackGlass, 0, 0, -0.05, holder, 0.01)
      const c = canvasPlane(s.w, s.h, id === 'centre' ? 1024 : 768, () => {}, { emissive: true })
      holder.add(c.mesh)
      this.screens[id] = c
      this.screenMats[id] = c.material as THREE.MeshBasicMaterial
      // Stand legs down to the floor.
      if (s.pos.y < 2) for (const sx of [-0.8, 0.8]) rbox(0.06, s.pos.y - s.h / 2, 0.06, m.steelDark, sx, -(s.pos.y - s.h / 2) / 2 - s.h / 2, -0.08, holder, 0.01)
    }
    rbox(0.12, 6, 0.12, m.steelDark, 500 - 2.1, 3, -5.3, g, 0.01)
    rbox(0.12, 6, 0.12, m.steelDark, 500 + 2.1, 3, -5.3, g, 0.01)
    // The mirror over the schema: a real reflection (scaled by the director).
    this.mirror = new Reflector(new THREE.PlaneGeometry(4.0, 2.4), { textureWidth: 1024, textureHeight: 614, color: 0xb8bcc0, clipBias: 0.003 })
    this.mirror.position.set(500, 2.6, -5.12)
    this.mirror.visible = false
    g.add(this.mirror)
    // The stretcher: a steel frame, a padded board tilted back 8°, a footplate, neck supports.
    const st = new THREE.Group()
    st.position.copy(STRETCHER)
    g.add(st)
    for (const sx of [-0.4, 0.4]) {
      rbox(0.06, 0.06, 1.0, m.steel, sx, 0.08, 0.1, st, 0.01)
      cyl(0.04, 0.04, 0.05, m.cable, sx, 0.03, -0.35, st, 12).rotation.z = PI / 2
      cyl(0.04, 0.04, 0.05, m.cable, sx, 0.03, 0.55, st, 12).rotation.z = PI / 2
    }
    const board = new THREE.Group()
    board.position.set(0, 0.2, 0.18)
    board.rotation.x = STRETCHER_TILT
    st.add(board)
    for (const sx of [-0.33, 0.33]) rbox(0.05, 2.15, 0.06, m.steel, sx, 1.07, 0.16, board, 0.01)
    rbox(0.62, 2.0, 0.08, m.stretcherPad, 0, 1.08, 0.18, board, 0.03)
    rbox(0.6, 0.04, 0.32, m.steel, 0, 0.05, 0.0, board, 0.01)
    for (const sx of [-0.12, 0.12]) rbox(0.05, 0.12, 0.08, m.chrome, sx, 1.62, 0.08, board, 0.02)
    rbox(0.32, 0.06, 0.06, m.steel, 0, 1.58, 0.16, board, 0.01)
    // The vitals monitor on the frame at chest height.
    const vm = new THREE.Group()
    vm.position.set(0.42, 1.22, -0.05)
    vm.rotation.y = -PI + 0.6
    board.add(vm)
    rbox(0.24, 0.16, 0.04, m.blackGlass, 0, 0, -0.022, vm, 0.01)
    this.vitals = canvasPlane(0.22, 0.14, 256, () => {}, { emissive: true })
    vm.add(this.vitals.mesh)
    // Straps (chest, upper arms, wrists, thighs, ankles) over the body (board frame).
    const strap = (y: number, w2: number, z: number, h = 0.07) => rbox(w2, h, 0.03, m.strap, 0, y, z, this.straps, 0.012)
    strap(1.3, 0.56, -0.02)
    strap(1.12, 0.6, -0.02)
    strap(0.82, 0.62, 0.0)
    strap(0.62, 0.4, 0.02)
    strap(0.2, 0.3, 0.05)
    for (const sx of [-0.27, 0.27]) rbox(0.05, 0.03, 0.04, m.chrome, sx, 0.82, -0.03, this.straps, 0.01)
    board.add(this.straps)
    // Levy's mount: feet on the footplate, the board's tilt.
    this.holder.position.set(0, 0.07, 0.0)
    board.add(this.holder)
    void H
  }

  /** Rising bubbles (a function of time). */
  tick(time: number) {
    this.bubbleSeeds.forEach(([z, dx, dz, ph], i) => {
      const t = (time * 0.18 + ph) % 1
      this.dummy.position.set(490 + dx * 0.6 + Math.sin(time * 3 + i) * 0.02, 0.4 + t * 2.3, z + dz * 0.6)
      this.dummy.scale.setScalar(0.6 + t)
      this.dummy.updateMatrix()
      this.bubbles.setMatrixAt(i, this.dummy.matrix)
    })
    this.bubbles.instanceMatrix.needsUpdate = true
  }
}
