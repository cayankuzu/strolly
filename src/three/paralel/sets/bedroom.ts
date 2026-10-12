/**
 * J — the bedroom at night (x 700): pale blue walls, a bed, a desk, a blue
 * nightlight, a door ajar onto a warm hallway and a television. A nine-year-
 * old in pyjamas kneels at the wall socket with a hairpin bent into a V.
 * A blue-white crack; the house goes dark; one of him is thrown back onto
 * the floor, the other stays kneeling, a faint blue outline going out.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { room, door, table, chair, deskLamp } from '../../kit/props'
import { pbr } from '../../kit/surfaces'
import { box, cyl, mesh } from '../../util'
import { PI, ss, win, canvasTexture, type Ctx, type Dir, type PSet } from '../common'
import { glowMaterial, shaftMaterial } from '../shaders'
import { Burst, Motes } from '../fx'
import * as PP from '../poses'
import * as P from '../../figure/poses'
import { H9 } from '../cast'

const X = 700
const SOCKET = new THREE.Vector3(700.4, 0.3, -1.99)
const NIGHT = new THREE.Vector3(701.8, 0.3, -1.99)
const KNEEL_AT = { x: 700.4, z: -1.5 }
const FLOOR_AT = { x: 700.5, z: -0.92 }

const SHOTS: Record<string, ShotKeys> = {
  socketA: [
    [0, [701.25, 0.95, -0.55, 700.35, 0.35, -1.85, 40]],
    [1, [701.15, 0.88, -0.7, 700.38, 0.33, -1.88, 38]],
  ],
  sparkB: [
    [0, [701.65, 0.55, 0.85, 700.35, 0.32, -1.5, 46]],
    [1, [701.55, 0.5, 0.65, 700.35, 0.3, -1.45, 44]],
  ],
  normalA: [
    [0, [699.75, 0.72, -1.88, 702.0, 1.25, 1.0, 42]],
    [1, [699.85, 0.7, -1.82, 701.8, 1.2, 0.9, 42]],
  ],
  powerKept: [
    [0, [700.62, 0.26, -0.35, 700.4, 0.3, -1.99, 38]],
    [1, [700.56, 0.28, -0.85, 700.4, 0.3, -1.99, 36]],
  ],
}

export class BedroomSet implements PSet {
  readonly group = new THREE.Group()
  private leaf!: THREE.Group
  private hallTv!: THREE.MeshBasicMaterial
  private pin = new THREE.Group()
  private pinA!: THREE.Mesh
  private pinB!: THREE.Mesh
  private floorPin = new THREE.Group()
  private scorch!: THREE.Mesh
  private flash!: THREE.Mesh
  private nightGlow!: THREE.Mesh
  private torch = new THREE.Group()
  private beam!: THREE.Mesh
  private beamMat = shaftMaterial(0xfff0d0, 0.28)
  private smoke = new Burst(60, 0x9a9aa2, 0.05, false, 71)
  private wisp!: Motes
  private sparks = new Burst(50, 0xdcebff, 0.025, true, 73)
  private v = new THREE.Vector3()
  private v2 = new THREE.Vector3()

  build(c: Ctx) {
    const g = this.group
    const wall = pbr('plaster', 0xa9bdd0, { roughness: 1 })
    const carpet = pbr('carpet', 0x6a7a8c, { roughness: 1 })
    const floor = pbr('planks', 0x8a6a4c, { roughness: 0.7 })
    const ceil = pbr('plaster', 0xdcdcd6, { roughness: 1 })
    const trim = pbr('painted', 0xe8e6e0, { roughness: 0.6 })
    const r = room({ w: 4, d: 4, h: 2.6, x: X, z: 0, wall, floor, ceiling: ceil, trim, openings: [{ side: 'e', at: 0.85, width: 0.9, height: 2.05 }, { side: 's', at: -0.9, width: 1.1, height: 1.1, bottom: 0.95 }] })
    r.name = 'bedroom'
    g.add(r)
    // A rug where he kneels and falls.
    const rug = mesh(new THREE.PlaneGeometry(1.8, 1.4).rotateX(-PI / 2), carpet, 700.55, 0.006, -1.0, g)
    rug.receiveShadow = true
    rug.name = 'rug'

    // The door, ajar 20° into the room, and the warm hallway beyond.
    const d = door({ w: 0.9, frame: trim, leaf: pbr('painted', 0xd8d4c8, { roughness: 0.5 }), handle: pbr('metal', 0xb8b0a0, { roughness: 0.3 }) })
    d.group.position.set(702, 0, 0.85)
    d.group.rotation.y = -PI / 2
    this.leaf = d.leaf
    g.add(d.group)
    const hall = room({ w: 2.0, d: 5, h: 2.6, x: 703.2, z: 1.0, wall: pbr('plaster', 0xc8b89c, { roughness: 1 }), floor, ceiling: ceil, trim, skip: ['w'] })
    hall.name = 'hallway'
    g.add(hall)
    // The television's glow at the end of the hall (a set seen edge-on, its light on the wall).
    this.hallTv = new THREE.MeshBasicMaterial({ color: 0x8fb0ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
    const tvGlow = mesh(new THREE.PlaneGeometry(1.4, 1.2), this.hallTv, 704.18, 1.0, 2.6, g)
    tvGlow.rotation.y = -PI / 2

    // The window with curtains drawn, a little moonlight at the gap.
    const curtain = pbr('fabric', 0x2a3550, { roughness: 1 })
    for (const sx of [-1, 1]) {
      const cgeo = new THREE.PlaneGeometry(0.62, 1.5, 12, 1)
      const p = cgeo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < p.count; i++) p.setZ(i, 0.03 * Math.sin(p.getX(i) * 30))
      cgeo.computeVertexNormals()
      const cu = mesh(cgeo, curtain, 699.1 + sx * 0.27, 1.45, 1.9, g)
      cu.rotation.y = PI
      cu.castShadow = true
    }
    cyl(0.012, 0.012, 1.5, pbr('metal', 0x8a8a8a, { roughness: 0.4 }), 699.1, 2.22, 1.92, g, 8).rotation.z = PI / 2

    // The bed along the left wall, head at the back.
    const bedWood = pbr('wood', 0x8a6a4a, { roughness: 0.7 })
    box(0.94, 0.3, 2.04, bedWood, 698.5, 0.2, -0.8, g).castShadow = true
    box(0.94, 0.7, 0.05, bedWood, 698.5, 0.45, -1.84, g).castShadow = true
    const sheet = pbr('fabric', 0xd8dce4, { roughness: 1 })
    box(0.88, 0.14, 1.96, sheet, 698.5, 0.42, -0.8, g).receiveShadow = true
    const duvet = mesh(new THREE.BoxGeometry(0.92, 0.1, 1.3, 6, 1, 8), pbr('fabric', 0x4f6c94, { roughness: 1 }), 698.52, 0.53, -0.4, g)
    const dp = duvet.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < dp.count; i++) dp.setY(i, dp.getY(i) + 0.02 * Math.sin(dp.getZ(i) * 9) * Math.cos(dp.getX(i) * 7))
    duvet.geometry.computeVertexNormals()
    duvet.castShadow = true
    // Thrown back as he got up.
    const fold = box(0.92, 0.08, 0.35, pbr('fabric', 0x4f6c94, { roughness: 1 }), 698.52, 0.58, -1.18, g)
    fold.rotation.x = 0.25
    const pillow = mesh(new THREE.SphereGeometry(0.3, 16, 10), sheet, 698.5, 0.56, -1.58, g)
    pillow.scale.set(1.2, 0.3, 0.6)
    pillow.castShadow = true

    // The child's drawing on the left wall above the bed.
    const drawing = canvasTexture(384, 300, (dg, W, H) => {
      dg.fillStyle = '#f4f1e8'
      dg.fillRect(0, 0, W, H)
      dg.strokeStyle = '#2a2a2a'
      dg.lineWidth = 4
      dg.fillStyle = '#7a8aa8'
      dg.fillRect(20, 120, 90, 180)
      dg.fillRect(270, 90, 100, 210)
      dg.strokeRect(20, 120, 90, 180)
      dg.strokeRect(270, 90, 100, 210)
      dg.fillStyle = '#f2d24a'
      for (let k = 0; k < 6; k++) dg.fillRect(34 + (k % 2) * 40, 140 + Math.floor(k / 2) * 45, 22, 22)
      // The boy in red with silver wings cut from a can.
      dg.fillStyle = '#c0392b'
      dg.beginPath()
      dg.ellipse(190, 110, 18, 30, 0.5, 0, PI * 2)
      dg.fill()
      dg.fillStyle = '#e0b090'
      dg.beginPath()
      dg.arc(206, 80, 13, 0, PI * 2)
      dg.fill()
      dg.fillStyle = '#b8c8dc'
      dg.strokeStyle = '#5a6a80'
      for (const sx of [-1, 1]) {
        dg.beginPath()
        dg.moveTo(185, 105)
        dg.quadraticCurveTo(185 + sx * 60, 50, 185 + sx * 70, 95)
        dg.quadraticCurveTo(185 + sx * 40, 100, 185, 115)
        dg.fill()
        dg.stroke()
      }
      dg.fillStyle = '#2a2a2a'
      dg.font = '700 22px sans-serif'
      dg.fillText('BEN', 168, 170)
      dg.fillStyle = '#3a7ad8'
      dg.beginPath()
      dg.arc(330, 40, 22, 0, PI * 2)
      dg.fill()
    })
    const dr = mesh(new THREE.PlaneGeometry(0.42, 0.33), new THREE.MeshStandardMaterial({ map: drawing, roughness: 0.9 }), 698.012, 1.3, -0.6, g)
    dr.rotation.y = PI / 2
    dr.rotation.z = 0.04
    dr.name = 'drawing'
    for (const [dy, dz] of [
      [0.155, -0.19],
      [0.155, 0.19],
    ])
      box(0.002, 0.03, 0.06, new THREE.MeshStandardMaterial({ color: 0xe8e0c0, roughness: 0.6, transparent: true, opacity: 0.8 }), 698.016, 1.3 + dy, -0.6 + dz, g)

    // The desk with its unlit lamp, a chair, books; a poster.
    const deskTop = pbr('wood', 0xb89a74, { roughness: 0.6 })
    const desk = table(1.0, 0.55, 0.72, deskTop)
    desk.position.set(701.35, 0, -1.68)
    g.add(desk)
    const lamp = deskLamp(pbr('metal', 0x3a6a9a, { roughness: 0.4 }), pbr('painted', 0x3a6a9a, { roughness: 0.4 }))
    lamp.group.position.set(701.7, 0.72, -1.72)
    lamp.group.rotation.y = -0.6
    g.add(lamp.group)
    const ch = chair(pbr('wood', 0x9a7a58, { roughness: 0.7 }))
    ch.position.set(701.78, 0, -1.08)
    ch.rotation.y = PI + 0.5
    g.add(ch)
    for (let k = 0; k < 5; k++) box(0.04, 0.24 - (k % 3) * 0.03, 0.17, pbr('paper', [0xc0392b, 0x2a6a9a, 0xe8c23a, 0x3a8a5a, 0x8a5a9a][k], { roughness: 0.8 }), 701.0 + k * 0.045, 0.72 + 0.12 - (k % 3) * 0.015, -1.8, g)
    const poster = canvasTexture(256, 360, (pg, W, H) => {
      const gr = pg.createLinearGradient(0, 0, 0, H)
      gr.addColorStop(0, '#1b2a4a')
      gr.addColorStop(1, '#3a5a8a')
      pg.fillStyle = gr
      pg.fillRect(0, 0, W, H)
      pg.fillStyle = '#f2f2f2'
      for (let k = 0; k < 40; k++) pg.fillRect((k * 53) % W, (k * 97) % (H * 0.6), 2, 2)
      pg.fillStyle = '#c8c8d0'
      pg.beginPath()
      pg.moveTo(W / 2, 60)
      pg.lineTo(W / 2 + 26, 230)
      pg.lineTo(W / 2 - 26, 230)
      pg.closePath()
      pg.fill()
      pg.fillStyle = '#e8763a'
      pg.beginPath()
      pg.moveTo(W / 2 - 14, 230)
      pg.lineTo(W / 2, 300)
      pg.lineTo(W / 2 + 14, 230)
      pg.fill()
    })
    const po = mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshStandardMaterial({ map: poster, roughness: 0.8 }), 701.35, 1.55, -1.985, g)
    po.name = 'poster'
    // A toy car and a ball on the floor.
    box(0.14, 0.05, 0.07, pbr('painted', 0xc0392b, { roughness: 0.4 }), 699.4, 0.04, 0.6, g).rotation.y = 0.6
    mesh(new THREE.SphereGeometry(0.09, 16, 12), pbr('rubber', 0x3a8ad8, { roughness: 0.6 }), 699.6, 0.09, 1.3, g).castShadow = true

    // The socket (two round holes) and, later, the scorch.
    const plate = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.35 })
    const sock = new THREE.Group()
    sock.name = 'socket'
    sock.position.copy(SOCKET)
    const pl = box(0.08, 0.08, 0.012, plate, 0, 0, 0.006, sock)
    pl.castShadow = true
    cyl(0.026, 0.026, 0.006, plate, 0, 0, 0.014, sock, 24).rotation.x = PI / 2
    for (const sx of [-1, 1]) cyl(0.0042, 0.0042, 0.008, new THREE.MeshBasicMaterial({ color: 0x050505 }), sx * 0.0095, 0, 0.0145, sock, 10).rotation.x = PI / 2
    g.add(sock)
    const scorchTex = canvasTexture(256, 256, (sg, W, H) => {
      sg.clearRect(0, 0, W, H)
      const gr = sg.createRadialGradient(W / 2, H * 0.55, 6, W / 2, H * 0.45, W / 2)
      gr.addColorStop(0, 'rgba(10,8,6,0.95)')
      gr.addColorStop(0.35, 'rgba(30,24,18,0.6)')
      gr.addColorStop(1, 'rgba(30,24,18,0)')
      sg.fillStyle = gr
      sg.fillRect(0, 0, W, H)
    })
    this.scorch = mesh(new THREE.PlaneGeometry(0.22, 0.26), new THREE.MeshStandardMaterial({ map: scorchTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4 }), SOCKET.x, SOCKET.y + 0.04, SOCKET.z + 0.021, g)
    this.scorch.renderOrder = 3
    // The nightlight: a small plug-in shell with a blue glow.
    const nl = new THREE.Group()
    nl.position.copy(NIGHT)
    box(0.06, 0.08, 0.03, plate, 0, 0, 0.015, nl)
    const lens = mesh(new THREE.SphereGeometry(0.03, 16, 10, 0, PI * 2, 0, PI / 2), new THREE.MeshBasicMaterial({ color: 0x5c8bff }), 0, 0, 0.03, nl)
    lens.rotation.x = PI / 2
    lens.name = 'nightlight-lens'
    g.add(nl)
    this.nightGlow = mesh(new THREE.PlaneGeometry(0.6, 0.6), glowMaterial(0x5c8bff, 0.5), NIGHT.x, NIGHT.y, NIGHT.z + 0.04, g)
    // The flash at contact: a white-blue bloom at the holes.
    this.flash = mesh(new THREE.PlaneGeometry(1, 1), glowMaterial(0xdcebff, 1), SOCKET.x, SOCKET.y, SOCKET.z + 0.05, g)
    this.flash.renderOrder = 8

    // The hairpin: black wire bent into a V; one in his hand, one on the floor afterward.
    const wire = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.7, roughness: 0.35 })
    const prong = new THREE.CylinderGeometry(0.0012, 0.0012, 0.06, 5).translate(0, 0.03, 0)
    this.pinA = mesh(prong, wire, 0, 0, 0, this.pin)
    this.pinB = mesh(prong, wire, 0, 0, 0, this.pin)
    mesh(new THREE.TorusGeometry(0.003, 0.0012, 5, 10, PI), wire, 0, 0, 0, this.pin).rotation.z = PI
    this.pin.name = 'hairpin'
    g.add(this.pin)
    for (const a of [-0.35, 0.35]) {
      const p = mesh(prong, wire, 0, 0, 0, this.floorPin)
      p.rotation.z = a
    }
    this.floorPin.rotation.set(-PI / 2, 0, 0.6)
    this.floorPin.position.set(700.5, 0.008, -1.25)
    g.add(this.floorPin)

    // The mother's flashlight, its beam.
    cyl(0.022, 0.018, 0.16, pbr('metal', 0x2a2a2c, { roughness: 0.5 }), 0, 0, 0.0, this.torch, 12).rotation.x = PI / 2
    mesh(new THREE.CircleGeometry(0.02, 12), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), 0, 0, 0.081, this.torch)
    g.add(this.torch)
    const bgeo = new THREE.CylinderGeometry(0.02, 0.55, 3.2, 20, 1, true)
    bgeo.translate(0, -1.6, 0)
    bgeo.rotateX(-PI / 2)
    this.beam = mesh(bgeo, this.beamMat, 0, 0, 0, g)
    this.beam.renderOrder = 4

    this.wisp = new Motes(80, 0x8a8a92, 0.03, [0.12, 0.7, 0.12], 0.35, false, 75)
    g.add(this.smoke.points, this.wisp.points, this.sparks.points)
    void c
    void clamp
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const grey = seg === 'powerKept'
    // Power: on until 0.22 of `spark`; off after.
    const power = seg === 'socket' || (seg === 'spark' && u < 0.22)
    const flash = seg === 'spark' ? win(0.175, 0.185, 0.2, 0.25, u) : 0

    env.sky.set({ zenith: 0x05070d, horizon: 0x0b1222, below: 0x05070d, haze: 0x0b1222, hazeAmt: 0, sunColor: 0, disc: 0, glow: 0, cloud: 0, cloudLit: 0, cloudShade: 0, stars: 0.4 }, new THREE.Vector3(0, 1, 0))
    env.setSun(new THREE.Vector3(700, 0, 0), new THREE.Vector3(-0.3, 0.5, 1), 0x6a7aa8, power ? 0.08 : 0.04, 4)
    env.setHemi(0x3a4a70, 0x101018, grey ? 0.32 : power ? 0.22 : 0.07)
    env.setFog(0x05070d, 0.02)
    env.ibl('abandoned_tiled_room', power ? 0.12 : 0.05)
    if (grey) env.grade.value = 1
    // Nightlight (blue), the hallway (warm) through the door, the TV flicker.
    const tv = 0.6 + 0.3 * Math.sin(t * 9) * Math.sin(t * 5.3 + 1) + 0.15 * Math.sin(t * 23)
    if (power) {
      env.point(0, NIGHT.x - 0.05, NIGHT.y + 0.05, NIGHT.z + 0.12, 0x5c8bff, 1.4, 3.2)
      env.point(1, 703.2, 2.1, 1.0, 0xffc27a, 5, 6)
      env.point(2, 704.0, 1.0, 2.4, 0x8fb0ff, 1.6 * tv, 4)
      env.setSpot(env.spot, new THREE.Vector3(703.6, 1.9, 1.15), new THREE.Vector3(700.8, 0, -0.6), 0xffc27a, 12, 0.32, 0.35, 8)
    }
    this.nightGlow.visible = power
    const lens = this.group.getObjectByName('nightlight-lens') as THREE.Mesh
    ;(lens.material as THREE.MeshBasicMaterial).color.set(power ? 0x5c8bff : 0x101a30)
    this.hallTv.opacity = power ? 0.3 * tv : 0
    // Ajar 20°; she pushes it wide when she comes (normal).
    this.leaf.rotation.y = seg === 'powerKept' ? 0 : (seg === 'normal' ? lerp(20, 72, ss(0.02, 0.07, u)) : 20) * (PI / 180)

    // The flash and the burnt marks.
    this.flash.visible = flash > 0.01
    this.flash.scale.setScalar(0.4 + 2.6 * flash)
    ;(this.flash.material as THREE.MeshBasicMaterial).opacity = flash
    if (flash > 0.01) env.point(2, SOCKET.x, SOCKET.y, SOCKET.z + 0.3, 0xdcebff, 60 * flash, 6)
    const burnt = (seg === 'spark' && u > 0.19) || seg === 'normal' || seg === 'powerKept'
    this.scorch.visible = burnt
    this.wisp.points.visible = burnt
    this.wisp.update(SOCKET.x, SOCKET.y + 0.38, SOCKET.z + 0.07, t, [0.02, 0.18, 0.01])
    this.wisp.material.opacity = seg === 'spark' ? 0.4 : seg === 'normal' ? 0.25 : 0.18
    this.smoke.set(SOCKET.x, SOCKET.y, SOCKET.z + 0.04, seg === 'spark' ? (u - 0.18) / 0.4 : -1, { r: 0.12, h: 0.7, drift: [0.05, 0.2, 0.15], opacity: 0.6 })
    this.sparks.set(SOCKET.x, SOCKET.y, SOCKET.z + 0.03, seg === 'spark' ? (u - 0.178) / 0.06 : -1, { r: 0.35, h: 0.2, fall: 0.4, opacity: 1 })
    this.floorPin.visible = seg === 'powerKept'
    this.beam.visible = false
    this.torch.visible = false

    const boy = cast.solids.boy9pj
    const anne = cast.solids.anne
    boy.begin()
    anne.begin()
    anne.visible = false
    switch (seg) {
      case 'socket':
        this.socketSeg(d, boy)
        break
      case 'spark':
        this.sparkSeg(d, boy)
        break
      case 'normal':
        this.normalSeg(d, boy, anne)
        break
      case 'powerKept':
        boy.visible = false
        boy.apply(t, false)
        anne.apply(t, false)
        this.pin.visible = false
        keyed(SHOTS.powerKept, cu, shot)
        shot.handheld = 0.1
        env.setFill(new THREE.Vector3(699.5, 1.6, 1.8), SOCKET, 0x8a9ac8, 0.25)
        break
    }
  }

  /** Writes the hairpin into his right hand; `open` 0 closed … 1 a V; `poke` reaches it into the holes. */
  private pinInHand(boy: Actor, open: number) {
    boy.figure.rGrip.getWorldPosition(this.v)
    this.pin.position.copy(this.v)
    // Prongs pointing at the wall (−z), opened in x.
    this.pin.rotation.set(-PI / 2, 0, 0)
    const a = 0.02 + 0.3 * open
    this.pinA.rotation.z = a
    this.pinB.rotation.z = -a
    this.pin.visible = true
  }

  private kneel(boy: Actor) {
    boy.place(KNEEL_AT.x, KNEEL_AT.z, PI)
    boy.hold(PP.KNEEL)
  }

  private socketSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    this.kneel(boy)
    // 0–0.4 the hairpin out of his pocket; 0.4–0.8 bent open between both hands.
    const out = ss(0.08, 0.3, u)
    const bend = ss(0.42, 0.8, u)
    const hx = lerp(700.52, 700.43, out)
    const hy = lerp(0.42, 0.44, out)
    const hz = lerp(-1.36, -1.7, out)
    boy.reach('r', 1, hx, hy, hz, 0.3)
    boy.reach('l', ss(0.35, 0.45, u), hx - 0.05 + 0.01 * Math.sin(bend * 8), hy + 0.005, hz + 0.01, 0.35)
    boy.lookAt(700.4, -2, 0.4)
    boy.pose[2 + 4 * 3] += 0.3
    boy.apply(f.time, true)
    this.pinInHand(boy, bend)
    if (cu < 0.5) keyed(SHOTS.socketA, cu / 0.5, shot)
    else {
      // Insert: his fingers bending the pin open, the socket beyond.
      boy.figure.rGrip.getWorldPosition(this.v)
      shot.pos.set(this.v.x + 0.28, this.v.y + 0.12, this.v.z - 0.13)
      shot.tgt.copy(this.v)
      shot.fov = 30
    }
    shot.handheld = 0.35
  }

  private sparkSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot, cast } = d
    const t = f.time
    // The prongs approach the holes; contact at 0.18.
    const thrown = ss(0.19, 0.26, u)
    if (thrown <= 0) {
      this.kneel(boy)
      const k = ss(0, 0.18, u)
      boy.reach('r', 1, lerp(700.43, SOCKET.x + 0.005, k), lerp(0.44, SOCKET.y + 0.012, k), lerp(-1.7, SOCKET.z + 0.105, k), 0.3)
      boy.reach('l', 0.6, 700.36, 0.42, -1.66, 0.35)
      boy.pose[2 + 4 * 3] += 0.35
      boy.apply(t, true)
      this.pinInHand(boy, 1)
    } else {
      // Thrown back onto his bottom, shaking his hand.
      boy.place(lerp(KNEEL_AT.x, FLOOR_AT.x, thrown), lerp(KNEEL_AT.z, FLOOR_AT.z, thrown), PI)
      boy.blend(
        [
          [0, PP.KNEEL],
          [1, PP.SIT_FLOOR],
        ],
        thrown,
      )
      const shake = win(0.3, 0.36, 0.6, 0.7, u)
      boy.reach('r', shake, FLOOR_AT.x + 0.12 + 0.03 * Math.sin(t * 22), 0.45, FLOOR_AT.z - 0.28, 0.35)
      boy.pose[2 + 4 * 3] += 0.1
      boy.apply(t, true)
      this.pin.visible = false
    }

    // The split at 0.18: the other one stays kneeling at the socket; its blue outline goes out.
    if (u >= 0.18 && u < 0.72) {
      cast.ghost(
        cast.ghosts.socket,
        u,
        (a) => {
          a.place(KNEEL_AT.x, KNEEL_AT.z, PI)
          a.hold(PP.KNEEL)
          a.reach('r', 1, SOCKET.x + 0.005, SOCKET.y + 0.012, SOCKET.z + 0.105, 0.3)
          a.reach('l', 0.6, 700.36, 0.42, -1.66, 0.35)
          a.pose[2 + 4 * 3] += 0.35
          return 0.42 * (1 - ss(0.26, 0.7, u)) + 0.25 * win(0.18, 0.19, 0.22, 0.3, u)
        },
        t,
        { flash: u < 0.21 ? 1 - (u - 0.18) / 0.03 : 0 },
      )
      const gm = cast.ghosts.socket.material.uniforms
      gm.uColor.value.set(0x9cc8ff)
      gm.uRimColor.value.set(0xcfe4ff)
      // Its faint blue is the light in the dark room.
      d.env.point(1, KNEEL_AT.x, 0.5, KNEEL_AT.z + 0.2, 0x7aa8ff, 1.2 * (1 - ss(0.26, 0.7, u)), 2.5)
    }

    if (cu < 0.24) {
      // Macro on the holes; the prongs come in from the right.
      shot.pos.set(700.24, 0.37, -1.8)
      shot.tgt.set(SOCKET.x + 0.02, SOCKET.y, SOCKET.z)
      shot.fov = 25
      shot.handheld = 0.2
    } else {
      keyed(SHOTS.sparkB, (cu - 0.24) / 0.76, shot)
      shot.handheld = 0.3
    }
  }

  private normalSeg(d: Dir, boy: Actor, anne: Actor) {
    const { u, cu, f, shot, env } = d
    const t = f.time
    // He sits on the floor where he was thrown.
    boy.place(FLOOR_AT.x, FLOOR_AT.z, PI)
    const shrug = win(0.44, 0.5, 0.56, 0.62, u)
    boy.blend(
      [
        [0, PP.SIT_FLOOR],
        [1, PP.SHRUG],
      ],
      shrug,
    )
    // 0.32: the blackened pin slides under his knee.
    const hide = win(0.3, 0.34, 0.4, 0.44, u)
    boy.reach('r', hide, FLOOR_AT.x - 0.1, 0.05, FLOOR_AT.z - 0.2, 0.35)
    // Looking into the beam (toward the door), squinting; then down at the scorch.
    boy.lookAt(702, 1, (1 - ss(0.64, 0.74, u)) * 0.9)
    boy.pose[2 + 4 * 3] += -0.15 * (1 - ss(0.64, 0.74, u)) + 0.25 * ss(0.66, 0.8, u)
    boy.apply(t, true)
    this.pin.visible = false

    // The mother: a silhouette in the doorway with a flashlight, from 0.05 to 0.64.
    const here = ss(0.03, 0.08, u) * (1 - ss(0.62, 0.68, u))
    anne.visible = here > 0.02
    anne.place(lerp(703.0, 702.02, here), 0.85, -PI / 2)
    anne.hold(PP.TORCH)
    anne.apply(t, true)
    // The beam: in through the door, across where the other one knelt, onto him; then away.
    const sweep = ss(0.05, 0.24, u)
    const leave = ss(0.6, 0.7, u)
    const aim = this.v2.set(lerp(lerp(701.2, KNEEL_AT.x, sweep), 701.6, leave), lerp(lerp(0.05, 0.3, sweep), 0.2, leave), lerp(lerp(0.4, KNEEL_AT.z, ss(0.05, 0.16, u)), 1.4, leave))
    if (u > 0.16) aim.set(lerp(lerp(KNEEL_AT.x, FLOOR_AT.x + 0.02, ss(0.16, 0.26, u)), 701.8, leave), lerp(lerp(0.3, 0.62, ss(0.16, 0.26, u)), 0.2, leave), lerp(lerp(KNEEL_AT.z, FLOOR_AT.z, ss(0.16, 0.26, u)), 1.4, leave))
    if (anne.visible) {
      anne.figure.rGrip.getWorldPosition(this.v)
    } else this.v.set(702.6, 1.15, 0.9)
    this.torch.visible = here > 0.02
    this.torch.position.copy(this.v)
    this.torch.lookAt(aim)
    const on = ss(0.04, 0.06, u) * (1 - leave)
    if (on > 0.01) {
      env.setSpot(env.spot, this.v, aim, 0xfff0d6, 26 * on, 0.3, 0.45, 9)
      this.beam.visible = true
      this.beam.position.copy(this.v)
      this.beam.lookAt(aim)
      this.beamMat.uniforms.uStrength.value = 0.22 * on
      // Spill on the walls lights her from the front a little.
      env.point(0, aim.x, aim.y + 0.3, aim.z, 0xfff0d6, 0.5 * on, 3)
    }
    // Faint moonlight so the dark is not black; a cold window light down the hall outlines her.
    env.setFill(new THREE.Vector3(699.0, 1.5, 2.2), new THREE.Vector3(700.5, 0.3, -0.9), 0x6a7ab0, 0.2)
    env.point(1, 703.7, 1.9, 3.0, 0x7a8cc8, 2.2 * here, 4.5)

    if (cu < 0.33) {
      // From behind him toward the door: her silhouette, the beam in our eyes.
      keyed(SHOTS.normalA, cu / 0.6, shot)
      shot.handheld = 0.4
    } else if (cu < 0.6) {
      // From the bed side, low: him on the floor in the beam, the pin going under his knee, the shrug.
      const k = ss(0.33, 0.6, cu)
      shot.pos.set(lerp(699.35, 699.45, k), lerp(0.62, 0.6, k), lerp(-0.25, -0.35, k))
      shot.tgt.set(700.62, 0.32, -0.98)
      shot.fov = lerp(42, 38, k)
      shot.handheld = 0.3
    } else {
      // Slow push to his face from in front and to his right (clear of the desk), lit by the
      // receding beam, then dark.
      boy.figure.joints.head.getWorldPosition(this.v)
      const k = ss(0.6, 1, cu)
      shot.pos.set(this.v.x + lerp(-0.5, -0.3, k), this.v.y + lerp(0.08, 0.03, k), this.v.z + lerp(-0.8, -0.5, k))
      shot.tgt.set(this.v.x + 0.05, this.v.y - 0.02, this.v.z)
      shot.fov = lerp(40, 34, k)
      shot.handheld = 0.3
    }
    void H9
    void P
  }
}
