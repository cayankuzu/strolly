/**
 * A. Professor Veyl's lab (x ≈ 0): the real place, the only one with hard
 * edges. A cylindrical atrium (axis at (0, *, −20), void radius 10) ringed by
 * grating balconies every 4.5 m; on every ring 24 stations at r 11.6, each a
 * half-upright padded frame with a body in a grey gown, the head inside a
 * steel halo, a cable bundle going up, a fluid channel coming down, a small
 * screen with someone's world. South of the void, behind a glass partition,
 * the control platform: Veyl's desk and its monitors. Between the glass and
 * the void, station 31 (Levy) and the empty station 32.
 *
 * All repeated pieces are instanced; the few stations the camera comes close
 * to can be taken over by real figures (`heroSlots`).
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '@/lib/math'
import { canvasPlane, keyboard, officeChair, rbox, tube } from '../kit/props'
import { box, cyl, mesh } from '../util'
import type { Pal } from './materials'
import { drawWorld, MOTIFS, type Motif } from './screens'

export const AXIS = new THREE.Vector3(0, 0, -20)
export const RING_R = 11.6
export const LEVELS = [0, 4.5, 9, 13.5, 18, 22.5, 27, 31.5]
/** Ground-ring station index → motif for the lateral track (bike, hug, veranda, rain, shirt, sea). */
const WORLD_TRACK: Record<number, number> = { 17: 0, 16: 4, 15: 1, 14: 5, 13: 3, 12: 2 }
/** Station board incline from vertical. */
const TILT = 0.7

export type Slot = { level: number; index: number; angle: number; matrix: THREE.Matrix4; pos: THREE.Vector3; yaw: number; motif: number }

/** Every station: level, angle, its transform. The ground ring skips the southern sector (the control platform). */
export function stations(): Slot[] {
  const out: Slot[] = []
  const rand = mulberry32(31)
  LEVELS.forEach((y, level) => {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      if (level === 0 && Math.cos(a) > 0.66) continue
      const pos = new THREE.Vector3(AXIS.x + RING_R * Math.sin(a), y, AXIS.z + RING_R * Math.cos(a))
      const yaw = a + Math.PI
      const matrix = new THREE.Matrix4().makeRotationY(yaw).setPosition(pos)
      let motif = Math.floor(rand() * 8)
      // The six worlds the camera passes in `worlds` (ground ring, west to north-west).
      if (level === 0 && WORLD_TRACK[i] !== undefined) motif = WORLD_TRACK[i]
      out.push({ level, index: i, angle: a, matrix, pos, yaw, motif })
    }
  })
  return out
}

/** Station-local transform of the body: along the reclined board, on its front face. */
export const BODY_FRAME = (() => {
  const m = new THREE.Matrix4()
  // Body space: y from the feet to the head, z out of the board. Feet at the footplate.
  const rot = new THREE.Matrix4().makeRotationX(-TILT)
  const n = new THREE.Vector3(0, 0, 1).applyMatrix4(rot)
  const foot = new THREE.Vector3(0, 0.5, 0.36).addScaledVector(n, 0.15)
  m.copy(rot).setPosition(foot)
  return m
})()

/** Where a figure stands in station space to lie on the board (root at the feet, tilted with the board). */
export const HERO_ROOT = new THREE.Vector3(0, 0.5, 0.36).addScaledVector(new THREE.Vector3(0, Math.sin(TILT), Math.cos(TILT)), 0.12)
export const HERO_TILT = TILT

/** Head centre in body space (for halos and cables). */
const HEAD_Y = 1.6

function bodyGeometry() {
  const gown: THREE.BufferGeometry[] = []
  const skin: THREE.BufferGeometry[] = []
  const add = (list: THREE.BufferGeometry[], g: THREE.BufferGeometry, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, rz = 0) => {
    g.scale(sx, sy, sz)
    if (rz) g.rotateZ(rz)
    g.translate(x, y, z)
    list.push(g.index ? g.toNonIndexed() : g)
  }
  // Gown: a torso to the knees.
  add(gown, new THREE.CapsuleGeometry(0.17, 0.42, 6, 14), 0, 1.22, 0, 1, 1, 0.62)
  add(gown, new THREE.CylinderGeometry(0.19, 0.21, 0.5, 16, 1), 0, 0.78, 0, 1, 1, 0.6)
  for (const sx of [-1, 1]) add(gown, new THREE.CapsuleGeometry(0.06, 0.22, 4, 10), sx * 0.22, 1.34, 0.01, 1, 1, 1, sx * 0.08)
  // Skin: head, neck, forearms and hands, shins and feet.
  add(skin, new THREE.SphereGeometry(0.1, 20, 16), 0, HEAD_Y, 0.02, 0.86, 1.08, 0.98)
  add(skin, new THREE.CylinderGeometry(0.048, 0.055, 0.14, 12), 0, 1.47, 0.0)
  for (const sx of [-1, 1]) {
    add(skin, new THREE.CapsuleGeometry(0.04, 0.42, 4, 10), sx * 0.25, 0.98, 0.02, 1, 1, 0.9, sx * 0.04)
    add(skin, new THREE.CapsuleGeometry(0.06, 0.4, 4, 10), sx * 0.09, 0.3, 0)
    add(skin, new THREE.BoxGeometry(0.08, 0.06, 0.2), sx * 0.09, 0.03, 0.06)
  }
  const g = mergeGeometries(gown)
  const s = mergeGeometries(skin)
  for (const x of [...gown, ...skin]) x.dispose()
  g.applyMatrix4(BODY_FRAME)
  s.applyMatrix4(BODY_FRAME)
  return { gown: g, skin: s }
}

/** The steel of a station (station space): pedestal, board frame, footplate, halo rods, screen arm. */
function steelGeometry() {
  const parts: THREE.BufferGeometry[] = []
  const push = (g: THREE.BufferGeometry, m: THREE.Matrix4) => {
    g.applyMatrix4(m)
    parts.push(g.index ? g.toNonIndexed() : g)
  }
  const at = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1))
  push(new THREE.BoxGeometry(0.34, 0.9, 0.34), at(0, 0.45, -0.18))
  push(new THREE.BoxGeometry(0.6, 0.04, 0.5), at(0, 0.02, -0.1))
  // Board frame rails along the board.
  const rot = new THREE.Matrix4().makeRotationX(-TILT)
  const c = new THREE.Vector3(0, 1.25, -0.3)
  for (const sx of [-0.37, 0.37]) {
    const m = rot.clone().setPosition(c.x + sx, c.y, c.z)
    push(new THREE.BoxGeometry(0.035, 2.05, 0.08), m)
  }
  // Footplate.
  const fm = rot.clone().setPosition(0, 0.5, 0.36)
  push(new THREE.BoxGeometry(0.6, 0.03, 0.26).translate(0, 0, 0.1), fm)
  // Halo rods from the board to the ring, and the ring's two side blocks.
  const head = new THREE.Vector3(0, HEAD_Y, 0.02).applyMatrix4(BODY_FRAME)
  for (const sx of [-1, 1]) {
    const r = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8)
    r.rotateX(Math.PI / 2)
    push(r, rot.clone().setPosition(head.x + sx * 0.18, head.y, head.z).multiply(new THREE.Matrix4().makeTranslation(0, 0, -0.1)))
  }
  // Screen arm.
  const arm = new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8)
  arm.rotateZ(Math.PI / 2)
  push(arm, at(0.42, 1.92, -0.6))
  push(new THREE.BoxGeometry(0.46, 0.34, 0.03), at(0.68, 1.95, -0.52, 0, 0, 0))
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}

function boardGeometry() {
  const g = new THREE.BoxGeometry(0.7, 2.0, 0.12)
  g.applyMatrix4(new THREE.Matrix4().makeRotationX(-TILT).setPosition(0, 1.25, -0.3))
  return g
}

function haloGeometry() {
  const g = new THREE.TorusGeometry(0.17, 0.013, 8, 40)
  g.rotateX(Math.PI / 2)
  g.translate(0, HEAD_Y + 0.04, 0.02)
  g.applyMatrix4(BODY_FRAME)
  return g
}

function cableGeometry() {
  const head = new THREE.Vector3(0, HEAD_Y + 0.12, 0.0).applyMatrix4(BODY_FRAME)
  const parts: THREE.BufferGeometry[] = []
  for (const dx of [-0.03, 0, 0.03]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(head.x + dx, head.y, head.z),
      new THREE.Vector3(dx * 1.5, head.y + 0.6, head.z - 0.35),
      new THREE.Vector3(dx * 2, head.y + 1.4, head.z - 0.55),
      new THREE.Vector3(dx * 2, 4.4, -0.75),
    ])
    parts.push(new THREE.TubeGeometry(curve, 20, 0.012, 5, false))
  }
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}

function channelGeometry() {
  const head = new THREE.Vector3(0.17, HEAD_Y, 0.02).applyMatrix4(BODY_FRAME)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(head.x, head.y, head.z),
    new THREE.Vector3(0.36, head.y - 0.3, head.z + 0.15),
    new THREE.Vector3(0.42, 0.9, 0.0),
    new THREE.Vector3(0.42, 0.2, 0.32),
    new THREE.Vector3(0.42, 0.015, 0.7),
    new THREE.Vector3(0.42, 0.015, 1.4),
  ])
  return new THREE.TubeGeometry(curve, 48, 0.011, 6, false)
}

/** A travelling pulse along every fluid channel (uv.x runs along the tube), each with its own phase. */
function pulseMaterial(base: THREE.MeshStandardMaterial, time: { value: number }) {
  const m = base.clone()
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vAlong;\nvarying float vPhase;').replace(
      '#include <uv_vertex>',
      '#include <uv_vertex>\nvAlong = uv.x;\n#ifdef USE_INSTANCING\nvPhase = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);\n#else\nvPhase = 0.0;\n#endif',
    )
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying float vAlong;\nvarying float vPhase;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat pulse = smoothstep(0.82, 1.0, fract(vAlong * 1.5 - uTime * 0.22 + vPhase));\ntotalEmissiveRadiance *= 0.35 + 1.6 * pulse;')
  }
  m.customProgramCacheKey = () => 'bk-pulse'
  return m
}

export type ScreenSet = ReturnType<typeof canvasPlane>

export class Lab {
  readonly group = new THREE.Group()
  readonly slots = stations()
  readonly time = { value: 0 }
  private bodies!: THREE.InstancedMesh
  private skins!: THREE.InstancedMesh
  private halos!: THREE.InstancedMesh
  private hidden = new Set<number>()
  private service!: THREE.InstancedMesh
  private serviceData: Array<{ period: number; phase: number; duty: number }> = []
  private onColor = new THREE.Color()
  private offColor = new THREE.Color(0x120c06)
  readonly screenMeshes: THREE.InstancedMesh[] = []
  readonly worldTextures: THREE.CanvasTexture[] = []
  // Control platform
  main!: ScreenSet
  left!: ScreenSet
  right!: ScreenSet
  notebook!: ScreenSet
  arm!: ScreenSet
  st31Screen!: ScreenSet
  signal!: ScreenSet
  pen!: THREE.Mesh
  chair!: THREE.Group
  mic!: THREE.Group
  junction = new THREE.Vector3(0.6, 0.8, -3.4)
  cableSegs!: THREE.InstancedMesh
  // Station 31
  readonly st31 = new THREE.Group()
  readonly st32 = new THREE.Group()
  haloL!: THREE.Group
  haloR!: THREE.Group
  incision!: THREE.Mesh
  strip: THREE.Mesh[] = []
  lamp31!: THREE.Mesh
  lamp32!: THREE.Mesh
  cartridge!: THREE.Mesh
  /** Where the real body lies (world): hip pivot, and its tilt. */
  readonly bodyAt = new THREE.Vector3(0, 0, -6.55)
  readonly head31 = new THREE.Vector3(0, 1.6, -7.0)
  ghostChair!: THREE.Group
  private dummy = new THREE.Object3D()

  constructor(private pal: Pal) {}

  build(scene: THREE.Scene, models: { microscope: THREE.Group | null; camera: THREE.Group | null }) {
    const m = this.pal
    const g = this.group
    scene.add(g)
    this.buildAtrium()
    this.buildControl(models)
    this.buildStation31()
    this.buildStation32()
    // The signal: a cyan trace 6 m wide in the dark (chapter 12's last image).
    this.signal = canvasPlane(6, 1.2, 1024, () => {}, { emissive: true, transparent: true })
    this.signal.mesh.position.set(0, 2, -10)
    ;(this.signal.material as THREE.MeshBasicMaterial).depthWrite = false
    ;(this.signal.material as THREE.MeshBasicMaterial).blending = THREE.AdditiveBlending
    g.add(this.signal.mesh)
    void m
  }

  // ——— The atrium ———

  private buildAtrium() {
    const m = this.pal
    const g = this.group
    const ax = AXIS
    // Floor: dark resin, a glossy circle and the antechamber/control floor.
    const floor = mesh(new THREE.CircleGeometry(13.2, 96), m.resin, ax.x, 0, ax.z, g)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    const ante = mesh(new THREE.PlaneGeometry(16, 13), m.resin, 0, -0.002, -3.5, g)
    ante.rotation.x = -Math.PI / 2
    ante.receiveShadow = true
    // Gutters: a cyan ring and a short run from each ground station's channel.
    const gutter = mesh(new THREE.RingGeometry(9.55, 9.62, 128), m.gutter, ax.x, 0.004, ax.z, g)
    gutter.rotation.x = -Math.PI / 2
    const gutter2 = mesh(new THREE.RingGeometry(10.3, 10.34, 128), m.gutter, ax.x, 0.004, ax.z, g)
    gutter2.rotation.x = -Math.PI / 2
    // Walls: the ground ring has its southern opening; above, the shaft closes all round and goes up into the dark.
    const low = mesh(new THREE.CylinderGeometry(13, 13, 4.5, 96, 1, true, 0.9, Math.PI * 2 - 1.8), m.labWall, ax.x, 2.25, ax.z, g)
    ;(low.material as THREE.Material).side = THREE.DoubleSide
    mesh(new THREE.CylinderGeometry(13, 13, 60, 96, 6, true), m.labWall, ax.x, 34.5, ax.z, g)
    m.labWall.side = THREE.DoubleSide
    const cap = mesh(new THREE.CircleGeometry(13, 48), m.labPanel, ax.x, 64, ax.z, g)
    cap.rotation.x = Math.PI / 2
    // Vertical pipes up the shaft wall.
    const pipeGeo = new THREE.CylinderGeometry(0.09, 0.09, 60, 8)
    const pipes = new THREE.InstancedMesh(pipeGeo, m.steelDark, 36)
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + 0.04
      this.dummy.position.set(ax.x + 12.85 * Math.sin(a), 34.5, ax.z + 12.85 * Math.cos(a))
      this.dummy.rotation.set(0, 0, 0)
      this.dummy.scale.set(1, 1, 1)
      if (Math.cos(a) > 0.66) this.dummy.position.y = 34.5 + 2.25
      this.dummy.updateMatrix()
      pipes.setMatrixAt(i, this.dummy.matrix)
    }
    g.add(pipes)
    // Balcony rings: grating, fascia, rails, posts.
    const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 6), m.steel, 7 * 60)
    let n = 0
    LEVELS.forEach((y, level) => {
      if (level === 0) return
      const grate = mesh(new THREE.RingGeometry(10, 12.95, 96, 1), m.grating, ax.x, y, ax.z, g)
      grate.rotation.x = -Math.PI / 2
      grate.receiveShadow = true
      const under = mesh(new THREE.CylinderGeometry(10, 10, 0.32, 96, 1, true), m.steelDark, ax.x, y - 0.16, ax.z, g)
      ;(under.material as THREE.Material).side = THREE.DoubleSide
      for (const ry of [1.05, 0.55]) {
        const rail = mesh(new THREE.TorusGeometry(10.04, ry > 1 ? 0.03 : 0.018, 6, 160), m.steel, ax.x, y + ry, ax.z, g)
        rail.rotation.x = Math.PI / 2
      }
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2
        this.dummy.position.set(ax.x + 10.04 * Math.sin(a), y + 0.525, ax.z + 10.04 * Math.cos(a))
        this.dummy.rotation.set(0, 0, 0)
        this.dummy.updateMatrix()
        posts.setMatrixAt(n++, this.dummy.matrix)
      }
    })
    posts.count = n
    g.add(posts)
    // Stations.
    const steelGeo = steelGeometry()
    const boardGeo = boardGeometry()
    const bodyGeo = bodyGeometry()
    const count = this.slots.length
    const steel = new THREE.InstancedMesh(steelGeo, m.steelDark, count)
    const boards = new THREE.InstancedMesh(boardGeo, m.pad, count)
    this.bodies = new THREE.InstancedMesh(bodyGeo.gown, m.gown, count)
    this.skins = new THREE.InstancedMesh(bodyGeo.skin, m.skinPale, count)
    this.halos = new THREE.InstancedMesh(haloGeometry(), m.chrome, count)
    const cables = new THREE.InstancedMesh(cableGeometry(), m.cable, count)
    const channels = new THREE.InstancedMesh(channelGeometry(), pulseMaterial(m.channel, this.time), count)
    this.slots.forEach((s, i) => {
      for (const im of [steel, boards, this.bodies, this.skins, this.halos, cables, channels]) im.setMatrixAt(i, s.matrix)
    })
    for (const im of [steel, boards, this.bodies, this.skins, this.halos, cables]) {
      im.castShadow = true
      im.receiveShadow = true
      g.add(im)
    }
    g.add(channels)
    // Screens: one instanced mesh per world (six motifs, two of them twice in other light).
    const variants: Array<[Motif, number]> = [...MOTIFS.map((mo) => [mo, 0] as [Motif, number]), ['bike', 1], ['sea', 1]]
    const scrGeo = new THREE.PlaneGeometry(0.42, 0.3)
    scrGeo.translate(0.68, 1.95, -0.5)
    variants.forEach(([motif, tint], vi) => {
      const c = document.createElement('canvas')
      c.width = 256
      c.height = 184
      drawWorld(c.getContext('2d')!, 256, 184, motif, tint, vi)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      this.worldTextures.push(tex)
      const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(1.6, 1.6, 1.6) })
      const list = this.slots.filter((s) => s.motif === vi)
      const im = new THREE.InstancedMesh(scrGeo, mat, Math.max(1, list.length))
      list.forEach((s, i) => im.setMatrixAt(i, s.matrix))
      im.count = list.length
      im.userData.motif = vi
      this.screenMeshes.push(im)
      g.add(im)
    })
    // Run-offs from the ground stations' channels to the gutter ring.
    const runs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.006, 1.0), m.gutter, count)
    let r = 0
    this.slots.forEach((s) => {
      if (s.level !== 0) return
      const a = s.angle
      this.dummy.position.set(AXIS.x + 10.0 * Math.sin(a) + 0.42 * Math.cos(a), 0.004, AXIS.z + 10.0 * Math.cos(a) - 0.42 * Math.sin(a))
      this.dummy.rotation.set(0, a, 0)
      this.dummy.updateMatrix()
      runs.setMatrixAt(r++, this.dummy.matrix)
    })
    runs.count = r
    g.add(runs)
    // Service lights: amber pinpoints under the rings and up the dark shaft.
    const rand = mulberry32(77)
    const N = 44
    this.service = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), N)
    for (let i = 0; i < N; i++) {
      const a = rand() * Math.PI * 2
      const high = i >= 28
      const y = high ? 36 + rand() * 24 : LEVELS[1 + Math.floor(rand() * 7)] - 0.36
      const rr = high ? 12.85 : 10.2 + rand() * 2.4
      this.dummy.position.set(AXIS.x + rr * Math.sin(a), y, AXIS.z + rr * Math.cos(a))
      this.dummy.rotation.set(0, 0, 0)
      this.dummy.scale.setScalar(high ? 1.6 : 1)
      this.dummy.updateMatrix()
      this.service.setMatrixAt(i, this.dummy.matrix)
      this.service.setColorAt(i, this.offColor)
      this.serviceData.push({ period: 4 + rand() * 5, phase: rand() * 9, duty: 0.25 + rand() * 0.35 })
    }
    g.add(this.service)
    this.onColor.setRGB(3.2, 1.9, 0.75)
  }

  /** Takes a station's body out of the instanced crowd (a real figure lies there instead). */
  setHeroes(indices: number[]) {
    const key = indices.join(',')
    if (this.bodies.userData.heroes === key) return
    this.bodies.userData.heroes = key
    for (const i of this.hidden) {
      this.bodies.setMatrixAt(i, this.slots[i].matrix)
      this.skins.setMatrixAt(i, this.slots[i].matrix)
    }
    this.hidden.clear()
    const zero = new THREE.Matrix4().makeScale(0, 0, 0)
    for (const i of indices) {
      this.bodies.setMatrixAt(i, zero)
      this.skins.setMatrixAt(i, zero)
      this.hidden.add(i)
    }
    this.bodies.instanceMatrix.needsUpdate = true
    this.skins.instanceMatrix.needsUpdate = true
  }

  /** Blinks the service lights; returns how many came on since `prev` (for the relay clicks). */
  tick(time: number, dim = 1) {
    this.time.value = time
    const c = new THREE.Color()
    this.serviceData.forEach((d, i) => {
      const on = ((time + d.phase) % d.period) / d.period < d.duty
      c.copy(on ? this.onColor : this.offColor).multiplyScalar(on ? dim : 1)
      this.service.setColorAt(i, c)
    })
    if (this.service.instanceColor) this.service.instanceColor.needsUpdate = true
  }

  /** The world of slot i's screen, as a motif index. */
  motifOf(i: number) {
    return this.slots[i].motif
  }

  // ——— The control platform ———

  private buildControl(models: { microscope: THREE.Group | null; camera: THREE.Group | null }) {
    const m = this.pal
    const g = this.group
    // The room: x −5.5…5.5, z −5.5…2.2, ceiling 3.2. Hard edges.
    box(11, 0.1, 7.7, m.labPanel, 0, 3.25, -1.65, g)
    box(0.2, 3.3, 7.9, m.labWall, -5.6, 1.6, -1.65, g)
    box(0.2, 3.3, 7.9, m.labWall, 5.6, 1.6, -1.65, g)
    box(11.4, 3.3, 0.2, m.labWall, 0, 1.6, 2.3, g)
    // Ceiling slats with dim strips.
    for (let i = -2; i <= 2; i++) box(0.06, 0.02, 7.4, new THREE.MeshBasicMaterial({ color: 0x1e2a3a }), i * 2, 3.19, -1.65, g)
    // Glass partition at z −5.5 with mullions and the glass door (x −3.4…−2.4).
    for (let i = 0; i <= 11; i++) box(0.05, 3.2, 0.08, m.steelDark, -5.5 + i, 1.6, -5.5, g)
    box(11, 0.06, 0.1, m.steelDark, 0, 0.03, -5.5, g)
    box(11, 0.06, 0.1, m.steelDark, 0, 3.17, -5.5, g)
    for (let i = 0; i < 11; i++) {
      const pane = mesh(new THREE.PlaneGeometry(0.95, 3.1), m.partition, -5 + i, 1.6, -5.5, g)
      if (i === 2) pane.position.z = -5.47
    }
    box(0.025, 0.5, 0.025, m.chrome, -2.52, 1.05, -5.44, g)
    // The antechamber beyond the glass: ceiling at 4.5, dark side walls to the shaft.
    const lid = new THREE.Shape()
    lid.moveTo(-5.5, -5.5)
    lid.lineTo(5.5, -5.5)
    for (let i = 0; i <= 24; i++) {
      const a = 0.9 - (i / 24) * 1.8
      lid.lineTo(AXIS.x + 12.95 * Math.sin(a), AXIS.z + 12.95 * Math.cos(a))
    }
    lid.closePath()
    const ceil = mesh(new THREE.ShapeGeometry(lid, 1), m.labPanel, 0, 4.5, 0, g)
    ceil.rotation.x = Math.PI / 2
    box(11, 1.3, 0.15, m.labWall, 0, 3.85, -5.5, g)
    for (const sx of [-1, 1]) {
      const w = box(0.2, 4.5, 7.94, m.labWall, sx * 7.84, 2.25, -8.71, g)
      w.rotation.y = sx * 2.512
    }
    // The desk: a hard black slab on steel legs.
    box(3.4, 0.05, 0.9, m.deskTop, 0, 0.755, -3.2, g)
    box(3.4, 0.2, 0.06, m.desk, 0, 0.66, -3.62, g)
    for (const sx of [-1.6, 1.6]) box(0.06, 0.73, 0.8, m.desk, sx, 0.365, -3.2, g)
    // Monitors: main, left and right (angled 20° inward).
    const screen = (w: number, h: number, px: number) => canvasPlane(w, h, px, () => {}, { emissive: true })
    const frame = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
      const holder = new THREE.Group()
      holder.position.set(x, y, z)
      holder.rotation.y = ry
      g.add(holder)
      box(w + 0.04, h + 0.04, 0.035, m.blackGlass, 0, 0, -0.02, holder)
      box(0.06, y - 0.78, 0.04, m.desk, 0, -(y - 0.78) / 2, -0.06, holder)
      box(0.3, 0.012, 0.2, m.desk, 0, -(y - 0.78) - 0.002, -0.06, holder)
      return holder
    }
    const hm = frame(1.3, 0.75, 0, 1.25, -3.55, 0)
    this.main = screen(1.3, 0.75, 1024)
    this.main.mesh.position.z = 0.0
    hm.add(this.main.mesh)
    const hl = frame(0.8, 0.5, -1.15, 1.2, -3.45, 0.35)
    this.left = screen(0.8, 0.5, 768)
    hl.add(this.left.mesh)
    const hr = frame(0.8, 0.5, 1.15, 1.2, -3.45, -0.35)
    this.right = screen(0.8, 0.5, 768)
    hr.add(this.right.mesh)
    const kb = keyboard(m.desk, m.steelDark)
    kb.position.set(0, 0.78, -3.0)
    g.add(kb)
    // The notebook: two pages on the desk, a pen beside it.
    this.notebook = canvasPlane(0.44, 0.3, 1024, () => {})
    this.notebook.mesh.rotation.x = -Math.PI / 2
    this.notebook.mesh.position.set(-0.75, 0.786, -2.95)
    g.add(this.notebook.mesh)
    box(0.46, 0.008, 0.31, m.ink, -0.75, 0.781, -2.95, g)
    this.pen = cyl(0.0045, 0.0045, 0.14, m.ink, -0.48, 0.786, -2.92, g, 10)
    this.pen.rotation.set(0, 0.3, Math.PI / 2)
    // Desk mic on a stem.
    this.mic = new THREE.Group()
    this.mic.position.set(0.5, 0.78, -3.0)
    g.add(this.mic)
    cyl(0.05, 0.055, 0.015, m.desk, 0, 0.008, 0, this.mic, 20)
    tube(
      [
        [0, 0.01, 0],
        [0, 0.15, -0.02],
        [-0.05, 0.27, 0.06],
        [-0.1, 0.3, 0.14],
      ],
      0.006,
      m.steelDark,
      this.mic,
      16,
    )
    cyl(0.014, 0.012, 0.06, m.blackGlass, -0.11, 0.3, 0.16, this.mic, 12).rotation.x = Math.PI / 2 - 0.3
    // Junction box for the interface cables.
    box(0.16, 0.07, 0.12, m.desk, this.junction.x, 0.815, this.junction.z, g)
    mesh(new THREE.CircleGeometry(0.004, 8), m.statusGreen, this.junction.x + 0.05, 0.84, this.junction.z + 0.061, g)
    this.cableSegs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), m.cable, 24)
    this.cableSegs.frustumCulled = false
    g.add(this.cableSegs)
    // Veyl's chair.
    this.chair = officeChair(m.pad, m.steelDark)
    this.chair.position.set(0, 0, -2.3)
    this.chair.rotation.y = Math.PI
    g.add(this.chair)
    // A side bench along the west wall with instruments.
    box(0.7, 0.05, 2.6, m.desk, -5.1, 0.9, -1.4, g)
    for (const z of [-2.6, -0.2]) box(0.05, 0.88, 0.6, m.desk, -5.1, 0.44, z, g)
    if (models.microscope) {
      models.microscope.position.set(-5.1, 0.925, -1.9)
      models.microscope.rotation.y = Math.PI / 2
      g.add(models.microscope)
    }
    for (let i = 0; i < 3; i++) box(0.3, 0.18, 0.25, m.blackGlass, -5.15, 1.02, -0.5 + i * 0.32, g)
    if (models.camera) {
      models.camera.position.set(5.3, 3.05, 1.9)
      models.camera.rotation.set(0, -2.4, 0)
      g.add(models.camera)
    }
    // Cable run on the floor from the desk to the wall.
    tube(
      [
        [0.6, 0.76, -3.6],
        [0.7, 0.3, -3.7],
        [0.9, 0.01, -3.8],
        [3.0, 0.01, -4.2],
        [5.5, 0.01, -4.4],
      ],
      0.012,
      m.cable,
      g,
      40,
    )
  }

  /** Lays the interface cables from a head point to the junction box (call each frame Veyl wears them). */
  layCables(from: THREE.Vector3[], visible: boolean) {
    this.cableSegs.visible = visible
    if (!visible) return
    const j = this.junction
    let n = 0
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    for (const f of from) {
      for (let i = 0; i < 12; i++) {
        const t0 = i / 12
        const t1 = (i + 1) / 12
        const p = (t: number, out: THREE.Vector3) => out.set(f.x + (j.x - f.x) * t, f.y + (j.y + 0.04 - f.y) * t - Math.sin(Math.PI * t) * 0.28, f.z + (j.z - f.z) * t)
        p(t0, a)
        p(t1, b)
        const len = a.distanceTo(b)
        this.dummy.position.copy(a).add(b).multiplyScalar(0.5)
        this.dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
        this.dummy.scale.set(1, len, 1)
        this.dummy.updateMatrix()
        this.cableSegs.setMatrixAt(n++, this.dummy.matrix)
      }
    }
    this.cableSegs.count = n
    this.cableSegs.instanceMatrix.needsUpdate = true
  }

  // ——— Station 31 and 32 ———

  private procedureChair(parent: THREE.Group) {
    const m = this.pal
    // Base column and a tilted back on a hinge; seat raised.
    cyl(0.32, 0.36, 0.06, m.steelDark, 0, 0.03, 0, parent, 32)
    cyl(0.07, 0.08, 0.84, m.steel, 0, 0.45, 0, parent, 16)
    box(0.62, 0.08, 0.6, m.steel, 0, 0.9, 0.05, parent)
    box(0.56, 0.08, 0.52, m.pad, 0, 0.98, 0.05, parent)
    const back = new THREE.Group()
    back.position.set(0, 0.98, -0.22)
    back.rotation.x = -0.78
    parent.add(back)
    box(0.6, 0.95, 0.07, m.steel, 0, 0.47, -0.07, back)
    box(0.52, 0.9, 0.07, m.pad, 0, 0.47, 0.0, back)
    // Head frame: two uprights and a top bar above the back.
    for (const sx of [-0.2, 0.2]) box(0.035, 0.62, 0.035, m.steel, sx, 1.12, -0.03, back)
    box(0.44, 0.04, 0.04, m.steel, 0, 1.42, -0.03, back)
    // Leg rest, raised.
    const legs = new THREE.Group()
    legs.position.set(0, 0.96, 0.33)
    legs.rotation.x = 0.62
    parent.add(legs)
    box(0.5, 0.06, 0.62, m.pad, 0, 0, 0.3, legs)
    box(0.54, 0.04, 0.12, m.steel, 0, -0.04, 0.62, legs)
    // Armrests with steel wrist rings.
    for (const sx of [-0.33, 0.33]) {
      box(0.1, 0.05, 0.5, m.pad, sx, 1.22, 0.02, parent)
      box(0.04, 0.26, 0.04, m.steel, sx, 1.08, -0.14, parent)
      const ring = mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 24), m.chrome, sx, 1.27, 0.17, parent)
      ring.rotation.y = Math.PI / 2
    }
    // Ankle rings.
    for (const sx of [-0.12, 0.12]) {
      const r = mesh(new THREE.TorusGeometry(0.05, 0.008, 8, 24), m.chrome, sx, 0.88, 0.86, parent)
      r.rotation.x = 0.4
    }
    return back
  }

  private buildStation31() {
    const m = this.pal
    const s = this.st31
    s.position.set(0, 0, -6.55)
    this.group.add(s)
    const back = this.procedureChair(s)
    // The halo mechanism: two hinged half-rings around the head (local to the head frame).
    const head = new THREE.Group()
    head.position.set(0, 0.68, 0.15)
    back.add(head)
    this.haloL = new THREE.Group()
    this.haloR = new THREE.Group()
    this.haloL.position.set(0, 0, -0.17)
    this.haloR.position.set(0, 0, -0.17)
    head.add(this.haloL, this.haloR)
    for (const [grp, sgn] of [
      [this.haloL, 1],
      [this.haloR, -1],
    ] as const) {
      const half = mesh(new THREE.TorusGeometry(0.17, 0.014, 8, 32, Math.PI), m.chrome, 0, 0, 0.17, grp)
      half.rotation.set(Math.PI / 2, 0, sgn > 0 ? 0 : Math.PI)
      box(0.04, 0.05, 0.03, m.steel, sgn * 0.17, 0, 0.17, grp)
      // Thin cables at the head.
      tube(
        [
          [sgn * 0.17, 0, 0.17],
          [sgn * 0.21, 0.12, 0.1],
          [sgn * 0.2, 0.4, -0.05],
        ],
        0.004,
        m.cable,
        grp,
        12,
      )
    }
    // The incision implied: a dark line under the halo's edge.
    this.incision = mesh(new THREE.TorusGeometry(0.095, 0.003, 6, 40), m.black, 0, -0.005, 0.0, head)
    this.incision.rotation.x = Math.PI / 2
    this.incision.scale.set(0.86, 1, 0.98)
    // Cable bundle up from the head frame and the fluid channel down.
    tube(
      [
        [0, 1.42, -0.05],
        [0, 1.9, -0.3],
        [0, 2.6, -0.5],
        [0, 3.5, -0.6],
        [0, 4.45, -0.6],
      ],
      0.02,
      m.cable,
      back,
      24,
    )
    const ch = tube(
      [
        [0.22, 1.0, 0.05],
        [0.36, 0.7, 0.1],
        [0.38, 0.2, 0.0],
        [0.4, -0.3, -0.25],
      ],
      0.012,
      pulseMaterial(m.channel, this.time),
      back,
      24,
    )
    ch.castShadow = false
    // Label plate on the head frame's top bar.
    const plate = canvasPlane(0.3, 0.06, 256, (c, W, H) => {
      c.fillStyle = '#d9dde3'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#14171c'
      c.font = `700 ${Math.round(H * 0.62)}px monospace`
      c.fillText('İSTASYON 31', W * 0.05, H * 0.75)
    })
    plate.mesh.position.set(0, 1.46, -0.005)
    back.add(plate.mesh)
    // Status strip: eight lights down the side of the frame.
    for (let i = 0; i < 8; i++) {
      const led = mesh(new THREE.BoxGeometry(0.02, 0.05, 0.012), m.statusRed, 0.31, 0.2 + i * 0.075, 0.03, back)
      this.strip.push(led)
    }
    // Surgical lamp on an arm from the ceiling, head at (0, 3.0, −6.4) aimed at the head.
    const lamp = new THREE.Group()
    lamp.position.set(0, 3.0, 0.15)
    s.add(lamp)
    tube(
      [
        [0, 0.1, 0],
        [0.3, 0.6, -0.2],
        [0.5, 1.2, -0.4],
        [0.5, 1.5, -0.5],
      ],
      0.035,
      m.steel,
      lamp,
      16,
    )
    const shade = mesh(
      new THREE.LatheGeometry(
        [
          [0.0, 0.12],
          [0.12, 0.12],
          [0.3, 0.03],
          [0.35, -0.02],
          [0.34, -0.04],
          [0.0, -0.04],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        48,
      ),
      m.steel,
      0,
      0,
      0,
      lamp,
    )
    shade.castShadow = false
    this.lamp31 = mesh(new THREE.CircleGeometry(0.32, 40), m.lampFace, 0, -0.045, 0, lamp)
    this.lamp31.rotation.x = Math.PI / 2
    lamp.rotation.x = 0.55
    // IV stand.
    const iv = new THREE.Group()
    iv.position.set(-0.8, 0, -1.05)
    s.add(iv)
    for (let i = 0; i < 5; i++) {
      const leg = box(0.32, 0.02, 0.03, m.steel, 0, 0.06, 0, iv)
      leg.rotation.y = (i / 5) * Math.PI * 2
      leg.position.set(Math.cos((i / 5) * Math.PI * 2) * 0.15, 0.06, -Math.sin((i / 5) * Math.PI * 2) * 0.15)
    }
    cyl(0.012, 0.012, 2.0, m.steel, 0, 1.06, 0, iv, 10)
    box(0.3, 0.012, 0.012, m.steel, 0, 2.02, 0, iv)
    const bag = rbox(0.14, 0.22, 0.04, m.partition, 0.12, 1.86, 0, iv, 0.02)
    bag.castShadow = false
    tube(
      [
        [0.12, 1.74, 0],
        [0.3, 1.3, 0.3],
        [0.6, 1.25, 0.9],
        [0.75, 1.22, 1.05],
      ],
      0.004,
      m.partition,
      iv,
      20,
    )
    // The arm monitor (facing +z, toward the desk) and station 31's own small screen.
    const armMon = new THREE.Group()
    armMon.position.set(-0.9, 1.7, -0.05)
    s.add(armMon)
    box(0.44, 0.3, 0.04, m.blackGlass, 0, 0, -0.025, armMon)
    tube(
      [
        [0, -0.1, -0.05],
        [0.1, -0.5, -0.2],
        [0.15, -1.68, -0.3],
      ],
      0.018,
      m.steel,
      armMon,
      12,
    )
    this.arm = canvasPlane(0.4, 0.26, 512, () => {}, { emissive: true })
    armMon.add(this.arm.mesh)
    const sm = new THREE.Group()
    sm.position.set(0.55, 1.9, -0.25)
    sm.rotation.y = -0.3
    s.add(sm)
    box(0.46, 0.34, 0.03, m.blackGlass, 0, 0, -0.02, sm)
    tube(
      [
        [-0.1, -0.1, -0.03],
        [-0.25, -0.4, -0.05],
        [-0.3, -0.75, 0.0],
      ],
      0.012,
      m.steel,
      sm,
      12,
    )
    this.st31Screen = canvasPlane(0.42, 0.3, 512, () => {}, { emissive: true })
    sm.add(this.st31Screen.mesh)
    // The cartridge seated in the halo's port (chapter 10, the last flash).
    this.cartridge = rbox(0.03, 0.05, 0.02, m.statusGreen, 0.19, 0.04, 0.0, head, 0.005)
    this.cartridge.visible = false
    // A ghost of the chair for the stretcher room's overlay.
    this.ghostChair = new THREE.Group()
    const gm = new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })
    s.traverse((o) => {
      const mm = o as THREE.Mesh
      if (!mm.isMesh || mm === this.st31Screen.mesh || mm === this.arm.mesh) return
      const c = new THREE.Mesh(mm.geometry, gm)
      mm.updateWorldMatrix(true, false)
      c.matrixAutoUpdate = false
      c.matrix.copy(s.matrixWorld.clone().invert().multiply(mm.matrixWorld))
      this.ghostChair.add(c)
    })
    this.ghostChair.visible = false
  }

  private buildStation32() {
    const m = this.pal
    const s = this.st32
    s.position.set(-2.6, 0, -6.55)
    this.group.add(s)
    const back = this.procedureChair(s)
    // Open straps hanging from the armrests.
    for (const sx of [-0.33, 0.33]) {
      const st = box(0.04, 0.24, 0.006, m.strap, sx + Math.sign(sx) * 0.06, 1.12, 0.17, s)
      st.rotation.z = Math.sign(sx) * 0.2
    }
    const plate = canvasPlane(0.42, 0.06, 256, (c, W, H) => {
      c.fillStyle = '#d9dde3'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#14171c'
      c.font = `700 ${Math.round(H * 0.55)}px monospace`
      c.fillText('İST. 32 · HAZIRLANIYOR', W * 0.03, H * 0.72)
    })
    plate.mesh.position.set(0, 1.46, -0.005)
    back.add(plate.mesh)
    const lamp = new THREE.Group()
    lamp.position.set(0, 3.0, 0.15)
    lamp.rotation.x = 0.55
    s.add(lamp)
    mesh(
      new THREE.LatheGeometry(
        [
          [0.0, 0.12],
          [0.12, 0.12],
          [0.3, 0.03],
          [0.35, -0.02],
          [0.34, -0.04],
          [0.0, -0.04],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        48,
      ),
      m.steel,
      0,
      0,
      0,
      lamp,
    )
    tube(
      [
        [0, 0.1, 0],
        [0.3, 0.6, -0.2],
        [0.5, 1.2, -0.4],
        [0.5, 1.5, -0.5],
      ],
      0.035,
      m.steel,
      lamp,
      16,
    )
    this.lamp32 = mesh(new THREE.CircleGeometry(0.32, 40), m.lampFace, 0, -0.045, 0, lamp)
    this.lamp32.rotation.x = Math.PI / 2
  }

  /** Status strip from red to green, light by light (0 all red … 1 all green). */
  setStrip(green: number) {
    const n = Math.round(green * this.strip.length)
    this.strip.forEach((s, i) => (s.material = i < n ? this.pal.statusGreen : this.pal.statusRed))
  }

  /** Opens the two half-rings of the halo (0 closed … 1 open). */
  openHalo(a: number) {
    this.haloL.rotation.y = a * 0.9
    this.haloR.rotation.y = -a * 0.9
  }

  dispose() {
    this.worldTextures.forEach((t) => t.dispose())
  }
}
