/**
 * Set G — the mission room on Earth, at night (x −106…−94, z −7…3): a big
 * screen with the ship's last frame and a packet counter, two rows of desks
 * (the CC0 metal desks), the refund counter that has never moved, the
 * expedition wall of brass plaques and, beside the screen, the keyhole the
 * camera falls into.
 */
import * as THREE from 'three'
import { canvasPlane, door, keyboard, monitor, officeChair, rbox, room } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { drawFolder, drawForm, drawOpsMonitor, drawPackets, drawPlaque, drawRefunds, keyhole, plaqueList } from './draw'

const PI = Math.PI
/** The desks' top (the CC0 metal desk is scaled to it). */
export const DESK_TOP = 0.76
export const G = {
  screen: new THREE.Vector3(-100, 1.8, -6.95),
  emblem: new THREE.Vector3(-95.6, 1.8, -6.9),
  /** The keyhole's opening (where the camera goes), relative to the emblem centre. */
  keyCut: new THREE.Vector3(-95.6, 1.82, -6.9),
  desks: [
    [-102, -3.2],
    [-100, -3.2],
    [-98, -3.2],
    [-102, -0.8],
    [-100, -0.8],
    [-98, -0.8],
  ] as Array<[number, number]>,
  ops: { B1: [-102, -2.25], B2: [-98, -2.25], B3: [-102, 0.15], B4: [-100, 0.15] } as Record<string, [number, number]>,
  official: { x: -100, z: -1.75 },
  /** A standing steel side table at his left (he faces the room, +z, when he reads). */
  lectern: { x: -99.45, z: -1.72, top: 0.98 },
  folder: new THREE.Vector3(-99.6, 0.982, -1.76),
  stack: new THREE.Vector3(-99.27, 0.982, -1.66),
  stampRest: new THREE.Vector3(-99.2, 0.982, -1.88),
  cartPark: { x: -96.4, z: -1.6 },
  wallX: -105.95,
  plaqueZ: (col: number) => 1.7 - col * 0.61,
  plaqueY: (row: number) => 2.1 - row * 0.4,
}

export class MissionRoom {
  readonly group = new THREE.Group()
  /** The frame on the main screen: a received image that can redden and fade. */
  readonly feedMat: THREE.ShaderMaterial
  private packets: ReturnType<typeof canvasPlane>
  private packetsKey = ''
  readonly ops: Array<ReturnType<typeof canvasPlane>> = []
  private opsKey = ''
  readonly led: THREE.Mesh
  readonly ledMat: THREE.MeshBasicMaterial
  readonly folder = new THREE.Group()
  readonly folderCover = new THREE.Group()
  readonly cart = new THREE.Group()
  readonly formFolder = new THREE.Group()
  readonly formCover = new THREE.Group()
  readonly stamp = new THREE.Group()
  readonly coffeeCup = new THREE.Group()
  readonly stackDone = new THREE.Group()

  constructor(m: Pal, scene: THREE.Scene, models: { desk: THREE.Group | null; clipboard: THREE.Group | null }) {
    const g = this.group
    scene.add(g)
    const r = room({ w: 12, d: 10, h: 3.4, x: -100, z: -2, wall: m.missionWall, floor: m.missionFloor, ceiling: m.missionCeiling, trim: m.blackMetal, openings: [{ side: 'e', at: 2.5, width: 1.0, height: 2.1 }] })
    g.add(r)
    const dr = door({ w: 1.0, h: 2.1, frame: m.blackMetal, leaf: m.missionWall, handle: m.brushed })
    dr.group.position.set(-94, 0, 0.5)
    dr.group.rotation.y = -PI / 2
    dr.leaf.rotation.y = -1.2
    g.add(dr.group)
    // Ceiling track lights.
    for (const z of [-5, -2, 1]) {
      rbox(10, 0.04, 0.06, m.blackMetal, -100, 3.37, z, g, 0.01)
      for (let x = -104.5; x < -95; x += 2.5) {
        const can = cyl(0.04, 0.05, 0.12, m.blackMetal, x, 3.29, z, g, 12)
        can.rotation.x = 0.4
      }
    }
    // ——— The main screen: the frame (left two thirds), the packets (right third) ———
    rbox(6.16, 2.56, 0.08, m.blackMetal, -100, 1.8, -6.97, g, 0.02)
    const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
    black.needsUpdate = true
    this.feedMat = new THREE.ShaderMaterial({
      uniforms: { map: { value: black }, uRed: { value: 0 }, uDim: { value: 1 }, uTime: { value: 0 }, uGain: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform sampler2D map; uniform float uRed; uniform float uDim; uniform float uTime; uniform float uGain;
        varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
          vec2 uv = vUv;
          // Blocky, a little late: a frame that came a long way.
          vec2 blk = floor(uv * vec2(160.0, 96.0)) / vec2(160.0, 96.0);
          vec3 c = texture2D(map, mix(uv, blk, 0.35)).rgb * uGain;
          float l = dot(c, vec3(0.3, 0.59, 0.11));
          vec3 red = vec3(l * 1.25 + 0.02, l * 0.42, l * 0.32) * vec3(1.0, 0.55, 0.45) * 1.6;
          c = mix(c, red, uRed);
          c += (h(floor(uv * vec2(320.0, 192.0)) + floor(uTime * 12.0)) - 0.5) * 0.035;
          float scan = 0.9 + 0.1 * sin(uv.y * 600.0);
          vec2 d = uv - 0.5;
          float vig = 1.0 - dot(d, d) * 0.9;
          gl_FragColor = vec4(max(c, 0.0) * scan * vig * uDim, 1.0);
        }`,
    })
    const feed = mesh(new THREE.PlaneGeometry(4.0, 2.4), this.feedMat, -101, 1.8, -6.925, g)
    feed.name = 'feed'
    this.packets = canvasPlane(2.0, 2.4, 768, drawPackets(88412, 1, false, 0), { emissive: true })
    this.packets.mesh.position.set(-98, 1.8, -6.925)
    g.add(this.packets.mesh)
    rbox(0.02, 2.4, 0.01, m.blackMetal, -99.0, 1.8, -6.92, g, 0.002)
    // ——— The refund counter ———
    rbox(0.03, 0.22, 0.58, m.blackMetal, -94.02, 2.2, -3.0, g, 0.006)
    const ref = canvasPlane(0.54, 0.18, 512, drawRefunds, { emissive: true })
    ref.mesh.position.set(-94.035, 2.2, -3.0)
    ref.mesh.rotation.y = -PI / 2
    g.add(ref.mesh)
    // ——— Desks, monitors, chairs ———
    G.desks.forEach(([x, z], i) => {
      if (models.desk) {
        const d = i === 0 ? models.desk : models.desk.clone(true)
        d.position.set(x, 0, z)
        d.rotation.y = PI
        g.add(d)
      } else {
        rbox(2.0, 0.03, 0.95, m.cart, x, 0.775, z, g, 0.004)
        for (const sx of [-1, 1]) rbox(0.04, 0.76, 0.9, m.cart, x + sx * 0.97, 0.38, z, g, 0.004)
      }
      for (const dx of [-0.42, 0.42]) {
        const mon = monitor(m.blackMetal, new THREE.MeshBasicMaterial({ color: 0x000000 }), 0.56, 0.34)
        mon.group.position.set(x + dx, 0.787 + 0.205 + 0.17, z - 0.25)
        mon.group.rotation.y = dx < 0 ? 0.12 : -0.12
        g.add(mon.group)
        const sc = canvasPlane(0.56, 0.34, 384, drawOpsMonitor(i * 2 + (dx < 0 ? 0 : 1), 0), { emissive: true })
        sc.mesh.position.z = 0.002
        mon.group.add(sc.mesh)
        this.ops.push(sc)
      }
      if (i !== 1 && i !== 5) {
        const kb = keyboard()
        kb.position.set(x, DESK_TOP, z + 0.2)
        g.add(kb)
        const ch = officeChair(m.charcoal, m.blackMetal)
        ch.position.set(x, 0, z + 0.95)
        ch.rotation.y = PI
        g.add(ch)
      }
    })
    if (models.clipboard) {
      models.clipboard.position.set(-102.5, 0.79, -0.7)
      models.clipboard.rotation.y = 0.4
      g.add(models.clipboard)
      const c2 = models.clipboard.clone(true)
      c2.position.set(-97.6, 0.79, -3.0)
      c2.rotation.y = -0.3
      g.add(c2)
    }
    // A coffee cup on B1's desk, refilled in `routine`.
    cyl(0.04, 0.035, 0.1, m.cupWhite, 0, 0.05, 0, this.coffeeCup, 20)
    this.coffeeCup.position.set(-101.6, 0.787, -2.95)
    g.add(this.coffeeCup)
    // ——— The folder K3-33 and the stack of closed files ———
    rbox(0.24, 0.003, 0.32, m.folderCard, 0, 0.0015, 0, this.folder, 0.001)
    this.folderCover.position.set(-0.12, 0.004, 0)
    rbox(0.24, 0.003, 0.32, m.folderCard, 0.12, 0, 0, this.folderCover, 0.001)
    const lbl = canvasPlane(0.24, 0.32, 512, drawFolder('DOSYA K3-33'))
    lbl.mesh.rotation.x = -PI / 2
    lbl.mesh.position.set(0.12, 0.0017, 0)
    this.folderCover.add(lbl.mesh)
    rbox(0.21, 0.008, 0.297, m.paper, 0.0, 0.006, 0, this.folder, 0.001)
    this.folder.add(this.folderCover)
    this.folder.position.copy(G.folder)
    g.add(this.folder)
    for (let i = 0; i < 6; i++) rbox(0.24, 0.012, 0.32, m.folderCard, 0.01 * Math.sin(i * 3), 0.006 + i * 0.013, 0.008 * Math.cos(i * 5), this.stackDone, 0.002)
    this.stackDone.position.copy(G.stack)
    // The side table they stand at: a steel top on a pedestal.
    const lt = G.lectern
    rbox(0.72, 0.03, 0.46, m.cart, lt.x, lt.top - 0.015, lt.z, g, 0.006).name = 'lectern'
    cyl(0.03, 0.03, lt.top - 0.03, m.blackMetal, lt.x, (lt.top - 0.03) / 2, lt.z, g, 12)
    cyl(0.2, 0.22, 0.02, m.blackMetal, lt.x, 0.01, lt.z, g, 24)
    g.add(this.stackDone)
    // B4's stamp.
    cyl(0.025, 0.028, 0.02, m.stamp, 0, 0.01, 0, this.stamp, 16)
    cyl(0.01, 0.012, 0.07, m.tableWood, 0, 0.055, 0, this.stamp, 12)
    const knob = mesh(new THREE.SphereGeometry(0.02, 12, 8), m.tableWood, 0, 0.1, 0, this.stamp)
    void knob
    this.stamp.position.copy(G.stampRest)
    g.add(this.stamp)
    // ——— The cart with the new folders, and the top one's form ———
    const c = this.cart
    for (const y of [0.2, 0.82]) rbox(0.9, 0.025, 0.55, m.cart, 0, y, 0, c, 0.006)
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        cyl(0.012, 0.012, 0.85, m.cart, sx * 0.43, 0.43, sz * 0.26, c, 8)
        cyl(0.035, 0.035, 0.025, m.blackMetal, sx * 0.4, 0.035, sz * 0.24, c, 12).rotation.z = PI / 2
      }
    for (let i = 0; i < 5; i++) rbox(0.24, 0.012, 0.32, m.folderCard, -0.2, 0.84 + i * 0.013, 0, c, 0.002)
    for (let i = 0; i < 7; i++) rbox(0.24, 0.012, 0.32, m.folderCard, 0.15, 0.22 + i * 0.013, 0, c, 0.002)
    // The top folder (opens for the insert).
    rbox(0.24, 0.003, 0.32, m.folderCard, 0, 0.0015, 0, this.formFolder, 0.001)
    const form = canvasPlane(0.21, 0.297, 768, drawForm)
    form.mesh.rotation.x = -PI / 2
    form.mesh.position.y = 0.004
    this.formFolder.add(form.mesh)
    this.formCover.position.set(-0.12, 0.006, 0)
    rbox(0.24, 0.003, 0.32, m.folderCard, 0.12, 0, 0, this.formCover, 0.001)
    const lbl2 = canvasPlane(0.24, 0.32, 256, drawFolder('DOSYA K4-01'))
    lbl2.mesh.rotation.x = -PI / 2
    lbl2.mesh.position.set(0.12, 0.0017, 0)
    this.formCover.add(lbl2.mesh)
    this.formFolder.add(this.formCover)
    this.formFolder.position.set(0.15, 0.84 + 0.013 * 7, 0)
    c.add(this.formFolder)
    c.traverse((o) => (o.castShadow = true))
    g.add(c)
    // ——— The expedition wall ———
    const list = plaqueList()
    const atlas = document.createElement('canvas')
    atlas.width = 2048
    atlas.height = 1024
    const actx = atlas.getContext('2d')!
    const CW = 256
    const CH = 128
    list.forEach((p, i) => drawPlaque(actx, (i % 8) * CW, Math.floor(i / 8) * CH, CW, CH, p))
    const tex = new THREE.CanvasTexture(atlas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    const plaqueMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.9 })
    const backing = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.32, 0.62), m.blackMetal, list.length)
    const d = new THREE.Object3D()
    list.forEach((p, i) => {
      const geo = new THREE.PlaneGeometry(0.6, 0.3)
      const uv = geo.attributes.uv as THREE.BufferAttribute
      const u0 = (i % 8) / 8
      const v0 = 1 - (Math.floor(i / 8) + 1) / 8
      for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / 8, v0 + uv.getY(k) / 8)
      const pm = mesh(geo, plaqueMat, G.wallX + 0.022, G.plaqueY(p.row), G.plaqueZ(p.col), g)
      pm.rotation.y = PI / 2
      d.position.set(G.wallX + 0.01, G.plaqueY(p.row), G.plaqueZ(p.col))
      d.updateMatrix()
      backing.setMatrixAt(i, d.matrix)
    })
    g.add(backing)
    // KARA DELİK III's status LED.
    this.ledMat = new THREE.MeshBasicMaterial({ color: 0x4dff88 })
    this.led = mesh(new THREE.SphereGeometry(0.012, 10, 8), this.ledMat, G.wallX + 0.03, G.plaqueY(1) + 0.11, G.plaqueZ(12) - 0.26, g)
    // A title over the wall.
    const title = canvasPlane(2.4, 0.16, 1024, (ctx, w, h) => {
      ctx.fillStyle = '#1f2733'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#c9b48a'
      ctx.font = `600 ${Math.round(h * 0.55)}px sans-serif`
      ctx.letterSpacing = '12px'
      ctx.fillText('KEŞİF EKİPLERİ', w * 0.04, h * 0.72)
    })
    title.mesh.position.set(G.wallX + 0.02, 2.62, -2.0)
    title.mesh.rotation.y = PI / 2
    g.add(title.mesh)
    // ——— The keyhole emblem on the front wall ———
    const disc = new THREE.Shape()
    disc.absarc(0, 0, 0.5, 0, PI * 2, false)
    const hole = new THREE.Path()
    const cy = 0.12
    const rc = 0.13
    const hw = 0.06
    const yi = cy - Math.sqrt(rc * rc - hw * hw)
    const a0 = Math.atan2(yi - cy, -hw)
    const a1 = Math.atan2(yi - cy, hw)
    hole.moveTo(-hw, yi)
    hole.absarc(0, cy, rc, a0, a1 + PI * 2, true)
    hole.lineTo(0.1, -0.32)
    hole.lineTo(-0.1, -0.32)
    hole.lineTo(-hw, yi)
    disc.holes.push(hole)
    const eg = new THREE.ExtrudeGeometry(disc, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 64 })
    const em = mesh(eg, m.emblemSteel, G.emblem.x, G.emblem.y, -6.99, g)
    em.castShadow = true
    em.receiveShadow = true
    const voidM = mesh(new THREE.PlaneGeometry(0.5, 0.8), m.voidBlack, G.emblem.x, G.emblem.y - 0.05, -6.985, g)
    void voidM
    // The ring of the emblem: a fine engraved circle.
    const engr = canvasPlane(1.0, 1.0, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(40,44,50,0.55)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, w * 0.46, 0, PI * 2)
      ctx.stroke()
      keyhole(ctx, w / 2, h * 0.38, w * 0.15, 'rgba(0,0,0,0)', 1)
    }, { transparent: true })
    engr.mesh.position.set(G.emblem.x, G.emblem.y, -6.919)
    g.add(engr.mesh)
  }

  setPackets(count: number, signal: number, lost: boolean, t: number) {
    const key = `${count}|${lost}|${Math.floor(t * 8)}|${signal.toFixed(1)}`
    if (key === this.packetsKey) return
    this.packetsKey = key
    this.packets.redraw(drawPackets(count, signal, lost, t), key)
  }

  setOps(red: number) {
    const key = red > 0.5 ? 'r' : 'n'
    if (key === this.opsKey) return
    this.opsKey = key
    this.ops.forEach((o, i) => o.redraw(drawOpsMonitor(i, red), key + i))
  }
}
