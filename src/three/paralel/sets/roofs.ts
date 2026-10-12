/**
 * C — rooftops (x 0): roof A with its gravel, parapet, water tank, mast,
 * stair hut and dishes; roof B a metre lower across a 2.4 m alley; sixty
 * metres down, the avenue with its matchbox traffic. Golden hour for the
 * nine-year-old's jump; blue hour for the three friends on the parapet.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import { addWalk, blendPose, makePose } from '../../figure/Figure'
import { makePath, pointAt } from '../../figure/paths'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { box, cyl, mesh } from '../../util'
import { PI, DEG, rng, ss, win, lin, canvasTexture, instances, type Ctx, type Dir, type PSet } from '../common'
import { facadeMaterial, lightFacades, skyline, Traffic, Walkers } from '../city'
import { particleMaterial } from '../shaders'
import { carry, pivotFrame } from '../rig'
import * as PP from '../poses'
import { sunDir, type SkyPreset } from '../env'
import { H12, H9 } from '../cast'

const GOLD: SkyPreset = { zenith: 0x4f6fa6, horizon: 0xe9b47c, below: 0x6d5f55, haze: 0xd9b48a, hazeAmt: 0.7, sunColor: 0xffb060, disc: 6, glow: 1.6, cloud: 0.22, cloudLit: 0xffc89a, cloudShade: 0x8a7f8f, power: 1.15 }
const BLUE: SkyPreset = { zenith: 0x1f2c55, horizon: 0x8b7fa0, below: 0x2a2833, haze: 0x6f6c92, hazeAmt: 0.6, sunColor: 0x8f7fb0, disc: 0, glow: 0.4, cloud: 0.18, cloudLit: 0x9a88b0, cloudShade: 0x2c3150, stars: 0.0, power: 0.9 }

const STREET = -60
const TANK = { x: -5, z: -4 }
const HUT = { x: -7, z: 7 }
const BOY_GAP = { x: 9.35, z: -3 }

const SHOTS: Record<string, ShotKeys> = {
  gapA: [
    [0, [7.5, 1.4, -1.5, 13.6, -1, -3, 42]],
    [1, [7.7, 1.38, -1.6, 13.6, -1.1, -3, 41]],
  ],
  gapB: [
    [0, [9.0, 1.05, -1.5, 9.9, 0.75, -3.1, 36]],
    [1, [9.4, 1.0, -1.75, 9.95, 0.7, -3.15, 34]],
  ],
  jumpA: [
    [0, [2.0, 1.2, -1.0, 11, 0, -3, 45]],
    [1, [2.3, 1.15, -1.1, 11, 0, -3, 45]],
  ],
  jumpB: [
    [0, [11.2, 4.0, 9.0, 11.2, -2.0, -3, 50]],
    [1, [11.4, 3.6, 8.2, 11.6, -1.8, -3, 48]],
  ],
  jumpC: [
    [0, [17.0, 0.6, 1.2, 13.2, -0.6, -3.2, 42]],
    [1, [15.9, 0.2, -0.3, 13.0, -0.5, -3.1, 38]],
  ],
  friends: [
    [0, [-7.4, 0.25, -12.4, 2.5, 1.1, -9.8, 45]],
    [1, [-5.8, 0.35, -12.6, 4.5, 1.15, -9.8, 44]],
  ],
  chainA: [
    [0, [8.1, 1.45, -8.3, 9.2, 1.1, -9.75, 38]],
    [1, [8.3, 1.42, -8.4, 9.4, 1.1, -9.7, 36]],
  ],
  chainHands: [
    [0, [11.3, 1.25, -10.6, 9.5, 1.05, -9.2, 32]],
    [1, [11.1, 1.2, -10.3, 9.5, 1.08, -9.0, 30]],
  ],
  chainB: [
    [0, [13.0, -0.5, -14.0, 10.0, 0.8, -10.0, 45]],
    [1, [13.6, -0.9, -14.6, 10.0, 0.8, -9.6, 45]],
  ],
  fell: [
    [0, [12.0, -1.0, -16.0, 9.0, 0.0, -10.0, 50]],
    [1, [12.4, -1.4, -16.6, 8.6, -0.6, -9.4, 50]],
  ],
}

export class RoofsSet implements PSet {
  readonly group = new THREE.Group()
  private facades: THREE.ShaderMaterial[] = []
  private traffic!: Traffic
  private walkers!: Walkers
  private door = new THREE.Group()
  private pigeon = new THREE.Group()
  private wings: THREE.Mesh[] = []
  private kicks!: THREE.Points
  private pose = makePose({})
  private tmp = new THREE.Vector3()
  private frameM = new THREE.Matrix4()

  private pathOut = makePath([
    [-6.4, 7.0],
    [-5.0, 6.6],
    [-4.0, 5.4],
    [2.2, 1.0],
    [8.6, -3.0],
  ])
  private pathBack = makePath([
    [9.3, -3.0],
    [4.5, -3.0],
  ])
  private pathRun = makePath([
    [4.5, -3.0],
    [9.95, -3.0],
  ])
  private pathFriends = makePath([
    [-6, -9.8],
    [9.8, -9.8],
    [9.8, 9.6],
  ])
  private pathHut = makePath([
    [8.6, -8.4],
    [2, -2],
    [-5.0, 6.4],
  ])

  build(c: Ctx) {
    const g = this.group
    const pal = c.pal
    const shared = c.env.shared
    const rand = rng(303)
    const fA = facadeMaterial(shared, { wall: 0x9a8f80, wall2: 0x8c8276, glass: 0x1b232c, sky: 0x8f8a8a })
    const fB = facadeMaterial(shared, { wall: 0x7d756c, wall2: 0x8e7f70, glass: 0x1a2028, sky: 0x8f8a8a, cell: [2.9, 3.1] })
    const fCity = facadeMaterial(shared, { wall: 0x8a8278, wall2: 0x6e6a66, glass: 0x182028, sky: 0x8f8a8a, cell: [2.4, 3.3] })
    this.facades.push(fA, fB, fCity)

    // Roof A: gravel field, parapet, building below.
    box(20, 59.7, 20, fA, 0, STREET + 59.7 / 2, 0, g)
    const gravel = pbr('gravel', 0x8c857b, { roughness: 1 })
    const roofA = mesh(new THREE.PlaneGeometry(19.2, 19.2), gravel, 0, 0.0, 0, g)
    roofA.rotation.x = -PI / 2
    roofA.receiveShadow = true
    const conc = pbr('concrete', 0x9a948c, { roughness: 1 })
    const cap = pbr('concrete', 0xa49e95, { roughness: 0.95 })
    const parapet = (x: number, z: number, w: number, d: number, h: number, y0: number) => {
      const p = box(w, h, d, conc, x, y0 + h / 2, z, g)
      p.castShadow = true
      p.receiveShadow = true
      const t = box(w + 0.04, 0.05, d + 0.04, cap, x, y0 + h + 0.025, z, g)
      t.receiveShadow = true
    }
    parapet(0, 9.8, 20, 0.4, 0.75, -0.3)
    parapet(0, -9.8, 20, 0.4, 0.75, -0.3)
    parapet(9.8, 0, 0.4, 19.2, 0.75, -0.3)
    parapet(-9.8, 0, 0.4, 19.2, 0.75, -0.3)
    // Tally scratches on the east parapet's top.
    const tallyTex = canvasTexture(256, 64, (gg, W, H) => {
      gg.clearRect(0, 0, W, H)
      gg.strokeStyle = 'rgba(70,64,58,0.9)'
      gg.lineWidth = 3
      for (let k = 0; k < 17; k++) {
        const x = 12 + k * 13 + (k % 5 === 4 ? 3 : 0)
        gg.beginPath()
        gg.moveTo(x, 10)
        gg.lineTo(x + 3, H - 10)
        gg.stroke()
      }
      for (let k = 0; k < 3; k++) {
        gg.beginPath()
        gg.moveTo(8 + k * 65, 36)
        gg.lineTo(70 + k * 65, 28)
        gg.stroke()
      }
    })
    const tally = mesh(new THREE.PlaneGeometry(0.34, 0.085), new THREE.MeshStandardMaterial({ map: tallyTex, transparent: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }), 9.8, 0.502, -3.7, g)
    tally.rotation.set(-PI / 2, 0, PI / 2)

    // Roof B, a metre lower; only a low curb on its west edge.
    box(19.6, 58.7, 20, fB, 22.2, STREET + 58.7 / 2, 0, g)
    const roofB = mesh(new THREE.PlaneGeometry(19.4, 19.2), gravel, 22.3, -1.0, 0, g)
    roofB.rotation.x = -PI / 2
    roofB.receiveShadow = true
    parapet(12.5, 0, 0.2, 20, 0.45, -1.3)
    parapet(22.2, 9.8, 19.6, 0.4, 0.75, -1.3)
    parapet(22.2, -9.8, 19.6, 0.4, 0.75, -1.3)
    parapet(31.8, 0, 0.4, 19.2, 0.75, -1.3)

    // The street wall along the avenue and across it; the alley floor.
    for (let x = -130; x < 160; ) {
      const w = 16 + rand() * 18
      if (x + w > -12 && x < 34) {
        x = 34
        continue
      }
      const h = 45 + rand() * 28
      box(w - 0.6, h, 22, fCity, x + w / 2, STREET + h / 2, 1, g)
      x += w
    }
    for (let x = -150; x < 170; ) {
      const w = 14 + rand() * 20
      const h = 25 + rand() * 60
      box(w - 0.5, h, 24, fCity, x + w / 2, STREET + h / 2, -46, g)
      x += w
    }
    const asphalt = pbr('asphalt', 0x2c2d30, { roughness: 0.95 })
    const street = mesh(new THREE.PlaneGeometry(420, 26), asphalt, 10, STREET, -21, g)
    street.rotation.x = -PI / 2
    const alley = mesh(new THREE.PlaneGeometry(2.4, 20), asphalt, 11.2, STREET + 0.01, 0, g)
    alley.rotation.x = -PI / 2
    const walk = pbr('paving', 0x77736c, { roughness: 1 })
    for (const z of [-11.25, -30.75]) {
      const s = box(420, 0.18, 2.5, walk, 10, STREET + 0.09, z, g)
      s.receiveShadow = true
    }
    // Lane markings.
    const dash = new THREE.MeshBasicMaterial({ color: 0xbdb7aa })
    const marks = instances(new THREE.PlaneGeometry(3, 0.15).rotateX(-PI / 2), dash, 400, (i) => {
      const lane = i % 5
      const k = Math.floor(i / 5)
      return [-190 + k * 5, STREET + 0.02, -28.5 + 3 * (lane + 1), 0, 1]
    })
    g.add(marks)
    // Dumpsters and a lamp in the alley; a/c units on the alley walls.
    const bin = pbr('painted', 0x3d5a46, { roughness: 0.6 })
    box(1.6, 1.3, 1.0, bin, 11.2, STREET + 0.65, 4, g)
    box(1.6, 1.3, 1.0, pbr('painted', 0x5a3d2e, { roughness: 0.6 }), 11.3, STREET + 0.65, 6.2, g)
    if (c.models.aircon) {
      const ac = c.models.aircon
      const spots: Array<[number, number, number, number]> = [
        [10.0, -12, 3, PI / 2],
        [10.0, -21, -2, PI / 2],
        [10.0, -33, 6, PI / 2],
        [12.4, -18, 1, -PI / 2],
        [12.4, -27, -5, -PI / 2],
        [12.4, -40, 4, -PI / 2],
        [10.0, -46, -6, PI / 2],
      ]
      for (const [x, y, z, yaw] of spots) {
        const a = ac.clone(true)
        a.scale.setScalar(0.6)
        a.rotation.y = yaw
        a.position.set(x + (yaw > 0 ? 0.12 : -0.12), y, z)
        g.add(a)
      }
      for (const [x, z, yaw] of [
        [-3, 8.9, 0],
        [-0.6, 8.9, 0],
        [24, 9.0, 0],
        [27, -8.6, PI],
      ] as const) {
        const a = ac.clone(true)
        a.rotation.y = yaw
        a.position.set(x, x > 12 ? -1.0 : 0.0, z)
        g.add(a)
      }
    }
    if (c.models.duct) {
      const d = c.models.duct.clone(true)
      d.scale.setScalar(0.8)
      d.position.set(24, -1.0, 3)
      d.rotation.y = PI / 2
      g.add(d)
    }

    // Water tank on legs, with a ladder.
    const steel = pal.steel
    const tankMat = pbr('metal', 0x8a8f92, { roughness: 0.6 })
    for (const [dx, dz] of [
      [-0.8, -0.8],
      [0.8, -0.8],
      [-0.8, 0.8],
      [0.8, 0.8],
    ])
      box(0.12, 1.5, 0.12, steel, TANK.x + dx, 0.75, TANK.z + dz, g).castShadow = true
    box(1.9, 0.08, 1.9, steel, TANK.x, 1.5, TANK.z, g)
    cyl(1.2, 1.2, 2.2, tankMat, TANK.x, 2.65, TANK.z, g, 32).castShadow = true
    mesh(new THREE.ConeGeometry(1.25, 0.45, 32), tankMat, TANK.x, 3.97, TANK.z, g).castShadow = true
    for (let k = 0; k < 9; k++) box(0.42, 0.03, 0.03, steel, TANK.x + 1.3, 0.3 + k * 0.38, TANK.z, g)
    for (const dz of [-0.2, 0.2]) box(0.04, 3.6, 0.04, steel, TANK.x + 1.3, 1.8, TANK.z + dz, g)

    // Antenna mast: a pole with cross arms and stays.
    cyl(0.05, 0.07, 7, steel, 5, 3.5, 6, g, 10).castShadow = true
    for (const y of [3.2, 4.6, 6.0]) box(1.4 - y * 0.08, 0.04, 0.04, steel, 5, y, 6, g)
    const stay = pbr('metal', 0x50555a, { roughness: 0.5 })
    for (const [dx, dz] of [
      [2.5, 2.5],
      [-2.5, 2.0],
      [1.0, -2.8],
    ]) {
      const a = new THREE.Vector3(5, 6.5, 6)
      const b = new THREE.Vector3(5 + dx, 0.05, 6 + dz)
      const len = a.distanceTo(b)
      const s = mesh(new THREE.CylinderGeometry(0.008, 0.008, len, 4), stay, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, g)
      s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
    }
    // Two dishes.
    const dishMat = pbr('painted', 0xd9d6cf, { roughness: 0.55, side: THREE.DoubleSide })
    for (const [dx, yaw] of [
      [-0.6, -0.5],
      [0.7, -0.9],
    ]) {
      const dish = new THREE.Group()
      dish.position.set(2 + dx, 0, 9)
      cyl(0.03, 0.04, 0.9, steel, 0, 0.45, 0, dish, 8)
      const bowl = mesh(new THREE.LatheGeometry(Array.from({ length: 8 }, (_, i) => new THREE.Vector2((i / 7) * 0.42, ((i / 7) * (i / 7)) * 0.12)), 24), dishMat, 0, 0.95, 0.05, dish)
      bowl.rotation.x = -PI / 2 + 0.7
      dish.rotation.y = yaw
      dish.traverse((o) => (o.castShadow = true))
      g.add(dish)
    }

    // Stair hut with its steel door (facing +x).
    const hutMat = pbr('plaster', 0xb3a99a, { roughness: 1 })
    const hutW = 2.6
    box(hutW, 0.15, hutW, cap, HUT.x, 2.62, HUT.z, g).castShadow = true
    box(hutW, 2.6, 0.15, hutMat, HUT.x, 1.3, HUT.z - hutW / 2 + 0.075, g).castShadow = true
    box(hutW, 2.6, 0.15, hutMat, HUT.x, 1.3, HUT.z + hutW / 2 - 0.075, g).castShadow = true
    box(0.15, 2.6, hutW, hutMat, HUT.x - hutW / 2 + 0.075, 1.3, HUT.z, g).castShadow = true
    // +x wall with the door opening (0.9 × 2.05).
    box(0.15, 2.6, 0.85, hutMat, HUT.x + hutW / 2 - 0.075, 1.3, HUT.z - 0.875, g).castShadow = true
    box(0.15, 2.6, 0.85, hutMat, HUT.x + hutW / 2 - 0.075, 1.3, HUT.z + 0.875, g).castShadow = true
    box(0.15, 0.55, 0.9, hutMat, HUT.x + hutW / 2 - 0.075, 2.325, HUT.z, g).castShadow = true
    const doorMat = pbr('metal', 0x4c5a5e, { roughness: 0.55 })
    this.door.position.set(HUT.x + hutW / 2 + 0.02, 0, HUT.z - 0.45)
    box(0.04, 2.04, 0.88, doorMat, 0, 1.02, 0.44, this.door).castShadow = true
    box(0.05, 0.03, 0.12, pbr('metal', 0xa8a8a0, { roughness: 0.35 }), 0.04, 1.0, 0.78, this.door)
    g.add(this.door)
    const dark = new THREE.MeshBasicMaterial({ color: 0x08080a })
    box(0.02, 2.0, 0.86, dark, HUT.x + hutW / 2 - 0.2, 1.0, HUT.z, g)

    // The skyline around, and the avenue's life.
    g.add(skyline(fCity, 10, -10, STREET, { count: 170, rMin: 90, rMax: 480, hMin: 40, hMax: 170, seed: 11, skip: (x, z) => Math.abs(x - 10) < 60 && z > -70 && z < 40 }))
    this.traffic = new Traffic([-27, -24, -21, -18, -15, -12.5], STREET, -190, 210, 80, 7)
    g.add(this.traffic.group)
    this.walkers = new Walkers(90, STREET + 0.18, -190, 210, [-11.25, -30.75], 5)
    g.add(this.walkers.mesh)

    // A pigeon for the look down.
    const pg = new THREE.MeshStandardMaterial({ color: 0x6b6f78, roughness: 0.8, side: THREE.DoubleSide })
    mesh(new THREE.SphereGeometry(0.09, 8, 6), pg, 0, 0, 0, this.pigeon).scale.set(1, 0.8, 1.8)
    for (const sx of [-1, 1]) {
      const wgeo = new THREE.PlaneGeometry(0.28, 0.12)
      wgeo.translate(0.14, 0, 0)
      const w = mesh(wgeo, pg, 0, 0.02, 0, this.pigeon)
      w.scale.x = sx
      w.rotation.x = -PI / 2
      this.wings.push(w)
    }
    g.add(this.pigeon)

    // Gravel kicked up by sneakers.
    const kickGeo = new THREE.BufferGeometry()
    kickGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 3), 3))
    this.kicks = new THREE.Points(kickGeo, particleMaterial(0x8a8478, 0.02, 0.9, false))
    this.kicks.frustumCulled = false
    g.add(this.kicks)
  }

  direct(d: Dir) {
    const { seg, u, cu, f, cast, env } = d
    const t = f.time
    const blue = seg === 'friends' || seg === 'chain' || seg === 'fell'
    // Light.
    if (blue) {
      const sd = sunDir(-PI / 2, -4 * DEG)
      env.sky.set(BLUE, sd)
      env.setSun(new THREE.Vector3(5, 0, -6), new THREE.Vector3(-0.6, 0.6, 0.3), 0x8090c0, 0.35, 16)
      env.setHemi(0x5a6aa0, 0x3a2e28, 1.3)
      env.setFill(new THREE.Vector3(10, -40, -40), new THREE.Vector3(8, 0.8, -9), 0xffc27a, 0.9)
      env.setFog(0x5f5f80, 0.0028)
      env.ibl('moonless_golf', 0.9)
      lightFacades(this.facades, { sunDir: new THREE.Vector3(-0.3, 0.8, 0.2), sun: 0x8090c0, sunPower: 0.25, amb: 0x5a6aa0, ambPower: 0.7, ground: 0x3a3030, lit: 1.6, sky: 0x4a5070 })
      env.point(0, 9.5, -1.5, -12.5, 0xffc88a, 3, 9)
    } else {
      const sd = sunDir(-PI / 2 + 0.12, 8 * DEG)
      env.sky.set(GOLD, sd)
      env.setSun(new THREE.Vector3(6, 0, -3), sd, 0xf2a65a, 3.4, 15)
      env.setHemi(0x9aa6c8, 0x5a4a3e, 0.85)
      env.setFill(new THREE.Vector3(30, 20, 20), new THREE.Vector3(5, 0, -3), 0x8fa2d0, 0.3)
      env.setFog(0xd2ad88, 0.0019)
      env.ibl('kloofendal_48d_partly_cloudy_puresky', 0.55, PI / 2)
      lightFacades(this.facades, { sunDir: sd, sun: 0xf2a65a, sunPower: 2.6, amb: 0x9aa6c8, ambPower: 0.55, ground: 0x6a5a4c, lit: 0.0, sky: 0xd9b48a })
    }
    this.traffic.update(t, blue ? 1 : 0.2)
    this.walkers.update(t)
    this.door.rotation.y = seg === 'roofs' ? -1.35 * ss(0.02, 0.15, u) * (1 - ss(0.5, 0.7, u)) : 0
    this.pigeon.visible = false
    this.kicks.visible = false

    const boy = cast.solids.boy9
    switch (seg) {
      case 'roofs':
        this.roofs(d, boy)
        break
      case 'gap':
        this.gap(d, boy)
        break
      case 'down':
        this.down(d, boy)
        break
      case 'jump':
        this.jump(d, boy)
        break
      case 'friends':
      case 'chain':
      case 'fell':
        this.friends(d)
        break
    }
    void cu
  }

  private roofs(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    boy.begin()
    const wu = ss(0.06, 1, u)
    boy.walk(this.pathOut, wu, PP.STAND, 0.6 + PI / 2, undefined)
    boy.apply(f.time, true)
    d.step = boy.step
    d.walking = boy.walking
    if (cu < 0.5) {
      const k = ss(0, 0.5, cu)
      shot.pos.set(lerp(-14, -12.4, k), lerp(6, 5.2, k), lerp(16, 14.2, k))
      shot.tgt.set(lerp(-1.5, 0.5, k), 0.5, lerp(1.5, 0, k))
      shot.fov = 45
    } else {
      shot.pos.set(boy.x + 0.55, 0.16, boy.z + 0.85)
      shot.tgt.set(boy.x + 0.25, 0.1, boy.z - 0.1)
      shot.fov = 40
      shot.handheld = 0.6
      this.kick(boy)
    }
  }

  /** Pebbles hop from the shoe that just pushed off. */
  private kick(boy: Actor) {
    const f = boy.figure
    const phase = (boy.step % 2 === 0 ? f.joints.lFoot : f.joints.rFoot).getWorldPosition(this.tmp)
    const pos = this.kicks.geometry.attributes.position as THREE.BufferAttribute
    const ph = (boy.figure.joints.hips.position.y * 997) % 1
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2 + boy.step
      const r = 0.05 + ((i * 37) % 7) * 0.012
      const h = Math.max(0, Math.sin(ph * PI)) * (0.04 + (i % 3) * 0.02)
      pos.setXYZ(i, phase.x + Math.cos(a) * r, 0.01 + h, phase.z + Math.sin(a) * r)
    }
    pos.needsUpdate = true
    this.kicks.visible = boy.walking > 0.3
  }

  private gap(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    boy.begin()
    boy.place(BOY_GAP.x, BOY_GAP.z, PI / 2)
    const lean = ss(0.5, 0.62, u)
    blendPose(PP.FOOT_UP, PP.LEAN_OVER, lean, this.pose)
    boy.hold(this.pose)
    // Four small nods while he counts the steps across.
    const nods = u > 0.1 && u < 0.4 ? Math.max(0, Math.sin(((u - 0.1) / 0.3) * 4 * PI)) * 0.16 : 0
    boy.pose[2 + 4 * 3] += nods
    // Looking across at roof B, then down.
    boy.lookAt(13.6, -3, 1 - lean)
    if (lean < 0.5) boy.reach('r', 0, 0, 0, 0)
    boy.reach('l', lean, 9.72, 0.47, -2.82, 0.3)
    boy.reach('r', lean, 9.72, 0.47, -3.2, 0.3)
    boy.apply(f.time, true)
    if (u < 0.56) keyed(SHOTS.gapA, cu / 0.56, shot)
    else keyed(SHOTS.gapB, (cu - 0.56) / 0.44, shot)
  }

  private down(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    boy.begin()
    boy.place(BOY_GAP.x + 0.05, BOY_GAP.z - 0.25, PI / 2)
    boy.hold(PP.LEAN_OVER)
    boy.pose[2 + 1 * 3] += 0.12
    // His hands come forward to the outer edge of the parapet and grip it.
    const grip = ss(0.36, 0.46, u)
    boy.reach('l', 1, lerp(9.7, 9.94, grip), 0.47, -3.05, 0.3)
    boy.reach('r', 1, lerp(9.7, 9.94, grip), 0.47, -3.5, 0.3)
    boy.apply(f.time, true)
    for (const m of boy.figure.headMeshes) m.visible = false
    // POV: straight down the alley to the avenue; a slow vertigo pull.
    const k = ss(0, 1, cu)
    shot.pos.set(10.05 - 0.2 * k, 1.0 + 0.2 * k, -3.3 + 0.08 * k)
    shot.tgt.set(11.2, STREET, -16)
    shot.fov = lerp(55, 47, k)
    shot.handheld = 0.5
    // A pigeon crosses below the lens.
    const pu = lin(0.42, 0.66, u)
    this.pigeon.visible = pu > 0 && pu < 1
    this.pigeon.position.set(lerp(8.6, 13.4, pu), -7 - 2 * pu, lerp(-6, -9.5, pu))
    this.pigeon.rotation.y = Math.atan2(4.8, -3.5)
    const flap = Math.sin(f.time * 26)
    this.wings[0].rotation.z = flap * 0.7
    this.wings[1].rotation.z = -flap * 0.7
  }

  /** Restore the head after the POV. */
  private head(boy: Actor) {
    for (const m of boy.figure.headMeshes) m.visible = true
  }

  /** The boy's root over the jump (shared by the real one and, up to the split, the ghost). */
  private jumpRoot(u: number) {
    if (u < 0.3) return null
    if (u < 0.48) {
      const s = ss(0.3, 0.48, u)
      return { x: lerp(4.5, 9.95, Math.pow(s, 1.15)), y: 0.45 * ss(0.43, 0.47, u), air: 0 }
    }
    const tt = Math.min(1, (u - 0.48) / 0.12)
    return { x: 9.95 + 3.85 * tt, y: 0.45 + 2.0 * tt - 3.45 * tt * tt, air: tt }
  }

  private jump(d: Dir, boy: Actor) {
    const { u, cu, f, shot, cast } = d
    this.head(boy)
    boy.begin()
    if (u < 0.3) {
      // Ten steps back, then turn to face the gap again.
      boy.walk(this.pathBack, ss(0.0, 0.28, u), PP.STAND, PI / 2 - 0.01, PI / 2)
    } else if (u < 0.6) {
      const r = this.jumpRoot(u)!
      boy.place(r.x, -3, PI / 2)
      boy.y = r.y
      if (u < 0.48) {
        boy.hold(PP.RUN)
        const phase = (r.x - 4.5) * 2.4
        addWalk(boy.pose, phase, 1.5)
        boy.step = Math.floor(phase / PI)
        boy.walking = 1
      } else {
        boy.blend(
          [
            [0, PP.LEAP],
            [0.8, PP.LEAP],
            [1, PP.LAND],
          ],
          r.air,
        )
      }
    } else {
      boy.place(13.8, -3, PI / 2)
      boy.y = -1.0
      const up = ss(0.62, 0.74, u)
      boy.blend(
        [
          [0, PP.LAND],
          [1, PP.STAND],
        ],
        up,
      )
      // Brushing his palms, then looking back at the gap.
      const brush = win(0.68, 0.72, 0.8, 0.84, u)
      if (brush > 0) {
        const wob = Math.sin(f.time * 14) * 0.03
        boy.reach('l', brush, 13.8 + 0.22, H9 * 1.0 + wob, -3 - 0.02, 0.3)
        boy.reach('r', brush, 13.8 + 0.22, H9 * 1.0 - wob, -3 + 0.05, 0.3)
      }
      boy.yaw = lerp(PI / 2, -PI / 2 - 0.3, ss(0.82, 0.96, u))
      boy.lookAt(11, -3, ss(0.78, 0.9, u))
    }
    boy.apply(f.time, true)
    d.step = boy.step
    d.walking = boy.walking

    // The split: from 0.52 the other one's arc falls short, into the alley.
    if (u >= 0.52 && u < 0.7) {
      const g = cast.ghosts.roofs
      cast.ghost(
        g,
        u,
        (a, uu) => {
          const r = this.jumpRoot(0.52)!
          const tt = Math.max(0, (uu - 0.52) / 0.12)
          a.place(0, 0, PI / 2)
          a.hold(PP.LEAP)
          a.blend(
            [
              [0, PP.LEAP],
              [0.6, PP.FALL],
            ],
            tt,
          )
          this.ghostY = r.y + 0.6 * tt - 10.5 * tt * tt
          this.ghostX = r.x + Math.min(0.7, 1.6 * tt)
          this.ghostSpin = tt * 1.4
          return 0.32 * (1 - ss(-9, -14, this.ghostY))
        },
        f.time,
        {
          flash: u < 0.55 ? 1 - (u - 0.52) / 0.03 : 0,
          trail: 0.012,
          alpha: true,
          after: (a) => {
            carry(a.figure, pivotFrame(0, 0.6, 0, 0, 0, -this.ghostSpin, this.ghostX, this.ghostY, -3, this.frameM))
          },
        },
      )
    }

    if (u < 0.46) keyed(SHOTS.jumpA, cu / 0.46, shot)
    else if (u < 0.66) keyed(SHOTS.jumpB, (cu - 0.46) / 0.2, shot)
    else keyed(SHOTS.jumpC, (cu - 0.66) / 0.34, shot)
  }
  private ghostX = 0
  private ghostY = 0
  private ghostSpin = 0

  /** Blue hour: the three on the parapet, hand in hand; the corner; the other three. */
  private friends(d: Dir) {
    const { seg, u, cu, f, shot, cast } = d
    const lead = cast.solids.boy12
    const emre = cast.solids.emre
    const baris = cast.solids.baris
    const walkers: Array<[Actor, number]> = [
      [lead, 0],
      [emre, 1.15],
      [baris, 2.3],
    ]
    // Distance of the leader along the parapet path (from x −6 on the south parapet, then north).
    let sLead: number
    let sEmre: number
    let sBaris: number
    const corner = 15.8
    if (seg === 'friends') {
      sLead = lerp(4, 10, u)
      sEmre = sLead - 1.15
      sBaris = sLead - 2.3
    } else if (seg === 'chain') {
      sLead = lerp(10, corner + 0.7, ss(0, 0.32, u)) + 1.3 * ss(0.4, 1, u)
      sEmre = lerp(8.85, corner - 0.85, ss(0.02, 0.16, u)) + 2.0 * ss(0.4, 1, u)
      sBaris = lerp(7.7, corner - 2.0, ss(0.02, 0.2, u)) + 1.9 * ss(0.45, 1, u)
    } else {
      sLead = corner + 2.0
      sEmre = corner + 1.15
      sBaris = corner - 0.1
    }
    const ss3 = [sLead, sEmre, sBaris]
    const hop = seg === 'fell' ? ss(0.24, 0.34, u) : 0
    const run = seg === 'fell' ? ss(0.34, 1, u) : 0
    const P = this.pathFriends
    walkers.forEach(([a, off], i) => {
      void off
      a.begin()
      const s = ss3[i]
      // Position by distance along the parapet; heading from the path a little ahead and behind.
      pointAt(P, s / P.total, this.sA)
      const x = this.sA.x
      const z = this.sA.z
      pointAt(P, (s + 0.35) / P.total, this.sA)
      const ax = this.sA.x
      const az = this.sA.z
      pointAt(P, (s - 0.35) / P.total, this.sA)
      a.place(x, z, Math.atan2(ax - this.sA.x, az - this.sA.z))
      a.hold(PP.ARMS_HALF)
      const moving = seg === 'friends' ? 1 : seg === 'chain' ? (i === 1 ? ss(0.38, 0.44, u) : 1) * (u < 0.36 && i !== 0 ? 0.3 : 1) : 0
      addWalk(a.pose, s * 4.3, 0.55 * moving)
      a.step = Math.floor((s * 4.3) / PI)
      a.walking = 0.55 * moving
      a.y = 0.47
      if (seg === 'fell' && hop > 0) {
        // Hop down inside onto the gravel, then run to the stair hut.
        const from = new THREE.Vector3(a.x, 0.47, a.z)
        if (run > 0) {
          a.walk(this.pathHut, ss(0, 1, run * (1 - i * 0.08)), PP.RUN, PI, undefined)
          a.x += -i * 0.6
          a.y = 0
        } else {
          a.place(lerp(from.x, from.x - 0.7, hop), lerp(from.z, from.z + 0.2, hop), a.yaw + (-PI / 2 - a.yaw) * hop)
          a.y = 0.47 * (1 - hop) + 0.25 * Math.sin(hop * PI)
        }
      }
    })
    // Hands: leader's right back to Emre's left; Emre's right back to Barış's left.
    const linked = seg !== 'fell' || hop < 0.5
    if (linked) {
      lead.apply(f.time, true)
      emre.apply(f.time, true)
      baris.apply(f.time, true)
      const meet = (a: Actor, b: Actor) => this.tmp.set((a.x + b.x) / 2, 0.47 + H12 * 0.93, (a.z + b.z) / 2)
      const m1 = meet(lead, emre).clone()
      const m2 = meet(emre, baris).clone()
      lead.reach('r', 1, m1.x, m1.y, m1.z, 0.4)
      emre.reach('l', 1, m1.x, m1.y, m1.z, 0.4)
      emre.reach('r', 1, m2.x, m2.y, m2.z, 0.4)
      baris.reach('l', 1, m2.x, m2.y, m2.z, 0.4)
    }
    // Emre hesitates at the corner and looks down.
    if (seg === 'chain') emre.lookAt(12, -14, win(0.08, 0.16, 0.3, 0.38, u))
    if (seg === 'fell') {
      lead.lookAt(-7, 7, 0.4)
    }
    lead.apply(f.time, true)
    emre.apply(f.time, true)
    baris.apply(f.time, true)
    d.step = lead.step
    d.walking = lead.walking

    // Barış's glasses catch the city light in the insert.
    if (seg === 'fell') {
      // The other three: hands still joined, tipping out over the alley together, falling away.
      const keys: Array<['boy12' | 'emre' | 'baris', Actor]> = [
        ['boy12', lead],
        ['emre', emre],
        ['baris', baris],
      ]
      const gk = { boy12: cast.ghosts.stones, emre: cast.ghosts.emre, baris: cast.ghosts.baris }
      keys.forEach(([k, real], i) => {
        const g = gk[k]
        const start = [sLead, sEmre, sBaris][i]
        void start
        cast.ghost(
          g,
          u,
          (a, uu) => {
            const tt = Math.max(0, uu - 0.1)
            a.place(real.x, real.z, real.yaw)
            a.hold(PP.ARMS_HALF)
            a.y = 0.47
            const fall = ss(0, 0.7, tt)
            this.trio[i] = tt
            return uu < 0.1 ? 0 : 0.34 * (1 - ss(0.45, 0.7, tt)) * (1 - fall * 0)
          },
          f.time,
          {
            flash: u >= 0.1 && u < 0.13 ? 1 - (u - 0.1) / 0.03 : 0,
            trail: 0.02,
            alpha: true,
            after: (a) => {
              const tt = this.trio[i]
              // Tip out over the edge (rotate about the feet line toward +x), then fall.
              const tip = Math.min(1.6, tt * 5)
              const drop = 26 * tt * tt * 1.4
              const out = Math.min(1.2, tt * 3)
              carry(a.figure, pivotFrame(a.figure.root.position.x, 0.47, a.figure.root.position.z, 0, 0, -tip, out, -drop, 0, this.frameM))
            },
          },
        )
      })
    }

    // Camera.
    if (seg === 'friends') keyed(SHOTS.friends, cu, shot)
    else if (seg === 'chain') {
      if (u < 0.4) keyed(SHOTS.chainA, cu / 0.4, shot)
      else if (u > 0.55 && u < 0.75) keyed(SHOTS.chainHands, (cu - 0.55) / 0.2, shot)
      else keyed(SHOTS.chainB, (cu - 0.4) / 0.6, shot)
    } else keyed(SHOTS.fell, cu, shot)
  }
  private trio = [0, 0, 0]
  private sA = { x: 0, z: 0, yaw: 0, dist: 0, speed: 0 }
}
