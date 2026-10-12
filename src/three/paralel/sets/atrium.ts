/**
 * D — the glass atrium roof (x 100): a grid of panes in steel T-rails over a
 * 24 m light well; galleries step down past lit rooms to a mosaic floor.
 * Somebody folds laundry, somebody sleeps before a flickering TV; nobody
 * looks up. One pane gives — under the other one.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import { makePath } from '../../figure/paths'
import { keyed, type Actor } from '../../kit/direct'
import { room, table, chair } from '../../kit/props'
import { pbr } from '../../kit/surfaces'
import { box, mesh } from '../../util'
import { PI, DEG, rng, ss, win, lin, canvasTexture, instances, setInstance, type Ctx, type Dir, type PSet } from '../common'
import { facadeMaterial, lightFacades, skyline } from '../city'
import { particleMaterial, shaftMaterial } from '../shaders'
import { carry, pivotFrame } from '../rig'
import * as PP from '../poses'
import * as P from '../../figure/poses'
import { sunDir, type SkyPreset } from '../env'
import { H9 } from '../cast'

const AFTERNOON: SkyPreset = { zenith: 0x5a82bd, horizon: 0xe2d2bc, below: 0x6e6a62, haze: 0xe8d4b4, hazeAmt: 0.5, sunColor: 0xffd2a0, disc: 8, glow: 1.2, cloud: 0.3, cloudLit: 0xfff0dc, cloudShade: 0x9aa4b8, power: 1.2 }
const GREY: SkyPreset = { zenith: 0x5c6470, horizon: 0x9aa0a6, below: 0x55585c, haze: 0x9aa0a6, hazeAmt: 0.6, sunColor: 0x9aa0a6, disc: 0, glow: 0.2, cloud: 0.5, cloudLit: 0xb0b4b8, cloudShade: 0x6a7078, power: 0.9 }

const XC = 100
const BREAK = { x: 99.25, z: -2.25 }
const COL = 100.75
const N_SHARDS = 70

export class AtriumSet implements PSet {
  readonly group = new THREE.Group()
  private walls: THREE.ShaderMaterial[] = []
  private breakPane!: THREE.Mesh
  private crack!: THREE.Mesh
  private shards!: THREE.InstancedMesh
  private shardSeed: number[] = []
  private shimmer!: THREE.Mesh
  private shafts: THREE.ShaderMaterial[] = []
  private dust!: THREE.Points
  private dustSeed: number[] = []
  private tv!: THREE.MeshBasicMaterial
  private cloth!: THREE.Mesh
  private frameM = new THREE.Matrix4()
  private ghostY = 0
  private ghostX = 0
  private ghostSpin = 0
  private sun = sunDir(-PI / 2 + 0.45, 25 * DEG)
  private rimPath = makePath([
    [105.6, 10.05],
    [102.6, 9.95],
    [101.2, 9.75],
    [COL, 9.25],
  ])

  build(c: Ctx) {
    const g = this.group
    const pal = c.pal
    const shared = c.env.shared
    const rand = rng(404)
    const conc = pbr('concrete', 0x9f9a92, { roughness: 1 })
    const outer = facadeMaterial(shared, { wall: 0xb0a594, wall2: 0xa39886, glass: 0x1d262e, sky: 0xc8d4e0, cell: [2.8, 3.4] })
    this.walls.push(outer)
    // Shell and roof deck around the glass (the rim).
    box(28, 25.6, 34, outer, XC, -26 + 25.6 / 2 - 0.4, 0, g)
    for (const [x, z, w, d] of [
      [XC, -13, 28, 8],
      [XC, 13, 28, 8],
      [90, 0, 8, 18],
      [110, 0, 8, 18],
    ] as const) {
      const deck = box(w, 0.4, d, conc, x, -0.2, z, g)
      deck.receiveShadow = true
    }
    const curb = pbr('concrete', 0xb4aea4, { roughness: 0.9 })
    for (const [x, z, w, d] of [
      [XC, -9.15, 12.6, 0.3],
      [XC, 9.15, 12.6, 0.3],
      [93.85, 0, 0.3, 18.6],
      [106.15, 0, 0.3, 18.6],
    ] as const)
      box(w, 0.1, d, curb, x, 0.05, z, g).receiveShadow = true
    // Parapet at the deck's edge.
    for (const [x, z, w, d] of [
      [XC, -16.8, 28, 0.4],
      [XC, 16.8, 28, 0.4],
      [86.2, 0, 0.4, 34],
      [113.8, 0, 0.4, 34],
    ] as const)
      box(w, 0.9, d, conc, x, 0.45, z, g).castShadow = true
    if (c.models.aircon)
      for (const [x, z, yaw] of [
        [89, -14.5, 0],
        [91.2, -14.5, 0],
        [111, 12, PI / 2],
      ] as const) {
        const a = c.models.aircon.clone(true)
        a.position.set(x, 0, z)
        a.rotation.y = yaw
        g.add(a)
      }
    if (c.models.duct) {
      const d = c.models.duct.clone(true)
      d.scale.setScalar(0.7)
      d.position.set(110.5, 0, -10)
      g.add(d)
    }
    // The street far below, the city around.
    const ground = mesh(new THREE.PlaneGeometry(900, 900), pbr('asphalt', 0x3a3b3e, { roughness: 1 }), XC, -26, 0, g)
    ground.rotation.x = -PI / 2
    g.add(skyline(outer, XC, 0, -26, { count: 150, rMin: 45, rMax: 420, hMin: 20, hMax: 120, seed: 21 }))

    // Glass panes in a T-rail grid; the breaking pane and the one under his feet apart.
    const glass = new THREE.MeshStandardMaterial({ color: 0x9cc9c2, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.22, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide })
    const paneGeo = new THREE.PlaneGeometry(1.42, 1.42)
    paneGeo.rotateX(-PI / 2)
    const panes = instances(paneGeo, glass, 96, (i) => {
      const cx = 94.75 + (i % 8) * 1.5
      const cz = -8.25 + Math.floor(i / 8) * 1.5
      if (Math.abs(cx - BREAK.x) < 0.1 && Math.abs(cz - BREAK.z) < 0.1) return null
      return [cx, 0, cz]
    })
    panes.renderOrder = 2
    g.add(panes)
    this.breakPane = mesh(paneGeo, glass, BREAK.x, 0, BREAK.z, g)
    this.breakPane.renderOrder = 2
    const rail = pbr('metal', 0x5b6268, { roughness: 0.5 })
    const railX = instances(new THREE.BoxGeometry(12.08, 0.12, 0.08).translate(0, -0.055, 0), rail, 13, (k) => [XC, 0, -9 + 1.5 * k], { shadow: true })
    const railZ = instances(new THREE.BoxGeometry(0.08, 0.12, 18).translate(0, -0.055, 0), rail, 9, (k) => [94 + 1.5 * k, 0, 0], { shadow: true })
    g.add(railX, railZ)
    // The pane under his feet shimmers; the star crack grows under the other one.
    this.shimmer = mesh(new THREE.PlaneGeometry(1.4, 1.4).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0xcff6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), COL, 0.004, -2.25, g)
    const crackTex = canvasTexture(512, 512, (cg, W, H) => {
      cg.clearRect(0, 0, W, H)
      cg.strokeStyle = 'rgba(255,255,255,0.95)'
      cg.lineCap = 'round'
      const r2 = rng(9)
      for (let k = 0; k < 13; k++) {
        let x = W / 2
        let y = H / 2
        let a = (k / 13) * PI * 2 + r2() * 0.3
        cg.lineWidth = 2.6
        cg.beginPath()
        cg.moveTo(x, y)
        for (let s = 0; s < 9; s++) {
          a += (r2() - 0.5) * 0.5
          x += Math.cos(a) * (18 + r2() * 14)
          y += Math.sin(a) * (18 + r2() * 14)
          cg.lineTo(x, y)
          cg.lineWidth = Math.max(0.8, 2.6 - s * 0.25)
        }
        cg.stroke()
      }
      for (const r of [38, 80, 130]) {
        cg.lineWidth = 1.2
        cg.beginPath()
        for (let k = 0; k <= 26; k++) {
          const a = (k / 26) * PI * 2
          const rr = r * (0.85 + r2() * 0.3)
          cg.lineTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr)
        }
        cg.stroke()
      }
    })
    this.crack = mesh(new THREE.PlaneGeometry(1.4, 1.4).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, opacity: 0.95 }), BREAK.x, 0.006, BREAK.z, g)
    this.crack.renderOrder = 3
    // Shards (thin triangles), glittering.
    const shardGeo = new THREE.BufferGeometry()
    shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.07, 0, -0.05, 0.08, 0, -0.03, 0.0, 0, 0.09], 3))
    shardGeo.computeVertexNormals()
    const shardMat = new THREE.MeshStandardMaterial({ color: 0xd6f3ee, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.75, side: THREE.DoubleSide, envMapIntensity: 3, emissive: 0x2a3a3a })
    this.shards = new THREE.InstancedMesh(shardGeo, shardMat, N_SHARDS)
    this.shards.frustumCulled = false
    for (let i = 0; i < N_SHARDS * 6; i++) this.shardSeed.push(rand())
    g.add(this.shards)

    // The sign at the rim, the dusty footprints on the first pane.
    const signTex = canvasTexture(512, 192, (sg, W, H) => {
      sg.fillStyle = '#e9e4d8'
      sg.fillRect(0, 0, W, H)
      sg.strokeStyle = '#b8261f'
      sg.lineWidth = 10
      sg.strokeRect(8, 8, W - 16, H - 16)
      sg.fillStyle = '#b8261f'
      sg.font = '800 52px sans-serif'
      sg.textAlign = 'center'
      sg.fillText('CAM ÇATI', W / 2, 82)
      sg.fillStyle = '#1d1d1d'
      sg.font = '700 34px sans-serif'
      sg.fillText('ÜZERİNE BASMAYINIZ', W / 2, 140)
    })
    const post = pbr('metal', 0x6a6e70, { roughness: 0.5 })
    box(0.05, 0.9, 0.05, post, XC - 0.42, 0.45, 10.45, g)
    box(0.05, 0.9, 0.05, post, XC + 0.42, 0.45, 10.45, g)
    const sign = mesh(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 }), XC, 0.72, 10.42, g)
    sign.rotation.y = PI
    const back = box(0.92, 0.36, 0.02, post, XC, 0.72, 10.44, g)
    back.castShadow = true
    const prints = canvasTexture(256, 256, (pg, W, H) => {
      pg.clearRect(0, 0, W, H)
      pg.fillStyle = 'rgba(120,100,80,0.55)'
      for (let k = 0; k < 4; k++) {
        const x = 90 + (k % 2) * 60
        const y = 40 + k * 52
        pg.beginPath()
        pg.ellipse(x, y, 16, 34, 0.1, 0, PI * 2)
        pg.fill()
      }
    })
    mesh(new THREE.PlaneGeometry(1.2, 1.2).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: prints, transparent: true, depthWrite: false }), COL, 0.005, 8.25, g).renderOrder = 3

    // ——— Inside the well ———
    const holesW: Array<[number, number, number, number]> = [[-2.5, -7.0, -0.5, -4.4]]
    const holesE: Array<[number, number, number, number]> = [[-5.5, -11.0, -3.5, -8.45]]
    const holesS: Array<[number, number, number, number]> = [[99.5, -15.0, 101.5, -12.45]]
    const holesN: Array<[number, number, number, number]> = [
      [-98.5, -19.0, -96.5, -16.45],
      [-104.5, -2.95, -102.5, -0.5],
    ]
    const inner = (holes: Array<[number, number, number, number]>) => facadeMaterial(shared, { wall: 0xd9cbb4, wall2: 0xcdbfa8, glass: 0x2a2620, sky: 0x8a8070, cell: [3.0, 4.0], holes })
    const mW = inner(holesW)
    const mE = inner(holesE)
    const mS = inner(holesS)
    const mN = inner(holesN)
    this.walls.push(mW, mE, mS, mN)
    const wall = (m: THREE.Material, x: number, z: number, w: number, yaw: number) => {
      const p = mesh(new THREE.PlaneGeometry(w, 23.6), m, x, -24 + 11.8, z, g)
      p.rotation.y = yaw
    }
    wall(mW, 94, 0, 18, PI / 2)
    wall(mE, 106, 0, 18, -PI / 2)
    wall(mS, XC, 9, 12, PI)
    wall(mN, XC, -9, 12, 0)
    // Galleries with railings at every level.
    const slab = pbr('concrete', 0xc9bfae, { roughness: 0.9 })
    const railMat = pbr('metal', 0x3a3d40, { roughness: 0.5 })
    const postGeo = new THREE.BoxGeometry(0.04, 1.0, 0.04).translate(0, 0.5, 0)
    const posts: Array<[number, number, number]> = []
    for (const y of [-20, -16, -12, -8, -4]) {
      for (const [x, z, w, d] of [
        [94.9, 0, 1.8, 18],
        [105.1, 0, 1.8, 18],
        [XC, -8.1, 8.4, 1.8],
        [XC, 8.1, 8.4, 1.8],
      ] as const) {
        const s = box(w, 0.3, d, slab, x, y - 0.15, z, g)
        s.receiveShadow = true
        s.castShadow = true
      }
      // Top rails along the inner edges.
      for (const [x, z, w, d] of [
        [95.8, 0, 0.05, 14.4],
        [104.2, 0, 0.05, 14.4],
        [XC, -7.2, 8.4, 0.05],
        [XC, 7.2, 8.4, 0.05],
      ] as const) {
        box(w, 0.05, d, railMat, x, y + 1.0, z, g)
        box(w, 0.03, d, railMat, x, y + 0.5, z, g)
      }
      for (let k = 0; k <= 14; k++) {
        posts.push([95.8, y, -7.2 + k * (14.4 / 14)], [104.2, y, -7.2 + k * (14.4 / 14)])
        if (k <= 8) posts.push([95.8 + k * (8.4 / 8), y, -7.2], [95.8 + k * (8.4 / 8), y, 7.2])
      }
    }
    g.add(instances(postGeo, railMat, posts.length, (i) => posts[i]))
    // The mosaic floor.
    const mosaic = canvasTexture(1024, 1536, (mg, W, H) => {
      mg.fillStyle = '#c8b89a'
      mg.fillRect(0, 0, W, H)
      const r2 = rng(5)
      for (let y = 0; y < H; y += 12)
        for (let x = 0; x < W; x += 12) {
          const dx = x - W / 2
          const dy = y - H / 2
          const d = Math.sqrt(dx * dx + dy * dy)
          const ring = Math.floor(d / 70)
          const ang = Math.atan2(dy, dx)
          const star = Math.cos(ang * 8) > 0.4 && d < 260
          const c = star ? '#8a3b2c' : ring % 2 ? '#d9cbb0' : ring % 3 === 0 ? '#3e5a6a' : '#b8a27c'
          mg.fillStyle = c
          mg.globalAlpha = 0.8 + r2() * 0.2
          mg.fillRect(x + 1, y + 1, 10, 10)
        }
      mg.globalAlpha = 1
    })
    const floor = mesh(new THREE.PlaneGeometry(12, 18), new THREE.MeshStandardMaterial({ map: mosaic, roughness: 0.55 }), XC, -24, 0, g)
    floor.rotation.x = -PI / 2
    floor.receiveShadow = true

    // Rooms behind the openings.
    const warmWall = pbr('plaster', 0xd8c4a4, { roughness: 1 })
    const plank = pbr('planks', 0x7a5a3e, { roughness: 0.8 })
    const ceil = pbr('plaster', 0xe0d6c4, { roughness: 1 })
    const roomAt = (cx: number, y: number, cz: number, w: number, d: number) => {
      const r = room({ w, d, h: 3.4, x: cx, z: cz, wall: warmWall, floor: plank, ceiling: ceil, trim: null })
      r.position.y = y
      g.add(r)
      return r
    }
    // Laundry, west, level −8.
    roomAt(92.3, -8, -1.5, 3.4, 3.0)
    const tbl = table(1.2, 0.7, 0.78, pbr('wood', 0x8a6a4a, { roughness: 0.7 }))
    tbl.position.set(93.1, -8, -1.3)
    tbl.rotation.y = PI / 2
    g.add(tbl)
    const towel = pbr('fabric', 0xe8e2d6, { roughness: 1 })
    for (let k = 0; k < 4; k++) box(0.34, 0.05, 0.28, k % 2 ? towel : pbr('fabric', 0x8fa8c0, { roughness: 1 }), 93.15, -8 + 0.81 + k * 0.05, -1.65, g)
    this.cloth = mesh(new THREE.PlaneGeometry(0.55, 0.42), pbr('fabric', 0xd9d0c0, { roughness: 1, side: THREE.DoubleSide }), 0, 0, 0, g)
    // Old man and TV, east, level −12.
    roomAt(107.7, -12, 4.5, 3.4, 3.4)
    const arm = new THREE.Group()
    const leather = pbr('leather', 0x5a3a2a, { roughness: 0.7 })
    box(0.8, 0.42, 0.8, leather, 0, 0.21, 0, arm)
    box(0.8, 0.7, 0.18, leather, 0, 0.6, -0.33, arm)
    box(0.16, 0.3, 0.8, leather, -0.36, 0.5, 0, arm)
    box(0.16, 0.3, 0.8, leather, 0.36, 0.5, 0, arm)
    arm.position.set(107.4, -12, 3.7)
    g.add(arm)
    const tvBody = box(0.7, 0.48, 0.12, pbr('plastic', 0x1a1a1c, { roughness: 0.5 }), 107.4, -12 + 0.9, 6.0, g)
    void tvBody
    this.tv = new THREE.MeshBasicMaterial({ color: 0x8fb0ff })
    const scr = mesh(new THREE.PlaneGeometry(0.6, 0.38), this.tv, 107.4, -12 + 0.9, 5.93, g)
    scr.rotation.y = PI
    box(0.8, 0.5, 0.4, pbr('wood', 0x5a4030, { roughness: 0.8 }), 107.4, -12 + 0.25, 6.05, g)
    // Child at a table, south, level −16; office, north, level −4; a couple, north, level −20.
    roomAt(100.5, -16, 10.6, 3.0, 3.2)
    const ktable = table(0.9, 0.6, 0.62, pbr('wood', 0x9a7a58, { roughness: 0.7 }))
    ktable.position.set(100.5, -16, 10.9)
    g.add(ktable)
    roomAt(103.5, -4, -10.6, 3.0, 3.2)
    const desk = table(1.2, 0.6, 0.74, pbr('wood', 0x6a5a48, { roughness: 0.7 }))
    desk.position.set(103.5, -4, -11.2)
    g.add(desk)
    box(0.04, 0.4, 0.04, pal.steel, 103.9, -4 + 0.94, -11.3, g)
    const shade = mesh(new THREE.ConeGeometry(0.12, 0.16, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, side: THREE.DoubleSide }), 103.9, -4 + 1.16, -11.25, g)
    void shade
    roomAt(97.5, -20, -10.6, 3.0, 3.2)
    const dtable = table(1.0, 0.8, 0.74, pbr('wood', 0x7a5a3e, { roughness: 0.7 }))
    dtable.position.set(97.5, -20, -11.0)
    g.add(dtable)
    for (const sx of [-0.6, 0.6]) {
      const ch = chair(pbr('wood', 0x6a4a32, { roughness: 0.8 }))
      ch.position.set(97.5 + sx, -20, -11.0)
      ch.rotation.y = sx < 0 ? PI / 2 : -PI / 2
      g.add(ch)
    }
    // Simple silhouettes for the child and the couple.
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.9 })
    const headMat = new THREE.MeshStandardMaterial({ color: 0xc89a7c, roughness: 0.7 })
    const seated = (x: number, y: number, z: number, s: number, cloth: number) => {
      const b = mesh(new THREE.CapsuleGeometry(0.17 * s, 0.4 * s, 4, 8), bodyMat.clone(), x, y + 0.75 * s, z, g)
      ;(b.material as THREE.MeshStandardMaterial).color.set(cloth)
      mesh(new THREE.SphereGeometry(0.1 * s, 12, 10), headMat, x, y + 1.18 * s, z, g)
    }
    seated(100.5, -16, 10.45, 0.75, 0x3a6a9a)
    seated(96.9, -20, -11.0, 1, 0x6a3a3a)
    seated(98.1, -20, -11.0, 1, 0x3a4a3a)

    // Light shafts slanting in through the glass.
    const shaftDir = this.sun.clone().negate()
    for (const [x, z, r] of [
      [97.2, -4, 0.9],
      [101.5, 1.5, 1.2],
      [103.3, -6, 0.7],
      [98.6, 5.5, 1.0],
    ] as const) {
      const len = 26
      const mat = shaftMaterial(0xffe2b0, 0.22)
      this.shafts.push(mat)
      const geo = new THREE.CylinderGeometry(r, r * 1.5, len, 16, 1, true)
      geo.translate(0, -len / 2, 0)
      const s = mesh(geo, mat, x, 0, z, g)
      s.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), shaftDir)
      s.renderOrder = 4
    }
    // Dust in the well.
    const n = 500
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    for (let i = 0; i < n * 3; i++) this.dustSeed.push(rand())
    this.dust = new THREE.Points(geo, particleMaterial(0xfff0d0, 0.03, 0.5))
    this.dust.frustumCulled = false
    g.add(this.dust)
  }

  private boyZ(seg: string, u: number) {
    if (seg === 'glass') return u < 0.48 ? 9.25 : u < 0.5 ? lerp(9.25, 8.25, ss(0.48, 0.5, u)) : lerp(8.25, 3.75, ss(0.5, 1, u))
    if (seg === 'rooms') return lerp(3.75, -0.75, ss(0, 1, u))
    if (u < 0.1) return lerp(-0.75, -2.25, ss(0, 0.1, u))
    if (u < 0.62) return -2.25
    return lerp(-2.25, -6.75, ss(0.62, 1, u))
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const grey = seg === 'glassBroke'
    // Late afternoon: shafts into the well, warm rooms below.
    if (grey) {
      env.sky.set(GREY, this.sun)
      env.setSun(new THREE.Vector3(XC, -10, 0), this.sun, 0xc8ccd0, 1.0, 16)
      env.setHemi(0x9aa4b0, 0x4a4a4a, 0.9)
      env.setFog(0x7d848c, 0.012)
      env.grade.value = 1
      lightFacades(this.walls, { sunDir: this.sun, sun: 0xc8ccd0, sunPower: 0.6, amb: 0x9aa4b0, ambPower: 0.7, ground: 0x4a4a4a, lit: 0.25, sky: 0x9aa0a6 })
    } else {
      env.sky.set(AFTERNOON, this.sun)
      env.setSun(new THREE.Vector3(XC, -6, 0), this.sun, 0xffd8a8, 3.2, 17)
      env.setHemi(0xa8bad8, 0x6a5a48, 0.8)
      env.setFog(0xd8cdb8, 0.0028)
      lightFacades(this.walls, { sunDir: this.sun, sun: 0xffd8a8, sunPower: 2.0, amb: 0x8a96b0, ambPower: 0.55, ground: 0x6a5a48, lit: 1.0, sky: 0xc8d4e0 })
      // Warm room lights below; the TV's flicker.
      const fl = 0.6 + 0.4 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1) + 0.2 * Math.sin(t * 31)
      env.point(0, 92.6, -5.6, -1.5, 0xffd9a0, 9, 6)
      env.point(1, 107.4, -10.6, 5.6, 0x9db8ff, 5 * Math.max(0.2, fl), 5)
      env.point(2, 103.6, -2.4, -11.0, 0xffcf90, 5, 5)
      this.tv.color.setRGB(0.55 + 0.3 * fl, 0.65 + 0.25 * fl, 1.0)
    }
    env.ibl('kloofendal_48d_partly_cloudy_puresky', grey ? 0.4 : 0.7, PI / 3)
    for (const s of this.shafts) s.uniforms.uStrength.value = grey ? 0.12 : seg === 'rooms' && u > 0.46 ? 0.3 : 0.18

    const broken = seg === 'glassBroke' || (seg === 'crack' && u >= 0.6) || seg === 'ironSlipped'
    this.breakPane.visible = !broken
    const crackGrow = seg === 'crack' ? ss(0.54, 0.6, u) : 0
    this.crack.visible = crackGrow > 0.01 && !broken
    this.crack.scale.setScalar(0.15 + 0.85 * crackGrow)
    this.dustDrift(t, seg === 'crack' ? win(0.22, 0.23, 0.26, 0.4, u) : 0)
    this.people(d)
    this.shardsAt(d)

    const boy = cast.solids.boy9
    if (seg === 'glassBroke') {
      shot.pos.set(XC, -23.6, 0)
      shot.tgt.set(XC - 0.2, 0, -0.6)
      shot.fov = 55
      shot.handheld = 0
      return
    }
    const bz = this.boyZ(seg, u)
    boy.begin()
    if (seg === 'glass' && u < 0.3) {
      boy.walk(this.rimPath, ss(0.0, 0.3, u), PP.STAND, undefined, PI)
    } else if (seg === 'glass' && u < 0.5) {
      boy.place(COL, bz, PI)
      boy.hold(P.STAND)
      // One foot off the rail onto the middle of the pane.
      const step = ss(0.4, 0.5, u)
      boy.pose[2 + 14 * 3] += -0.5 * Math.sin(step * PI)
      boy.pose[2 + 15 * 3] += 0.6 * Math.sin(step * PI)
      boy.pose[2 + 4 * 3] += 0.35
    } else {
      // Pane to pane, slowly.
      boy.place(COL, bz, PI)
      boy.hold(PP.ARMS_HALF)
      const walkAmt = seg === 'glass' ? 0.55 : seg === 'rooms' ? 0.45 : u < 0.1 ? 0.5 : u < 0.62 ? 0 : 0.5
      addWalkSafe(boy, bz * 4.2, walkAmt)
      boy.pose[2 + 4 * 3] += 0.3
    }
    if (seg === 'crack' && u > 0.1 && u < 0.62) {
      boy.hold(P.STAND)
      boy.pose[2 + 4 * 3] += 0.45
      // He feels it: a tremor at the slam.
      const tremor = win(0.22, 0.225, 0.26, 0.32, u)
      boy.pose[2 + 2 * 3 + 2] += Math.sin(t * 40) * 0.02 * tremor
    }
    boy.apply(t, true)
    d.step = boy.step
    d.walking = boy.walking
    if (seg === 'rooms' && u < 0.46) for (const m of boy.figure.headMeshes) m.visible = false

    // The pane under his feet trembles.
    const sh = this.shimmer.material as THREE.MeshBasicMaterial
    sh.opacity = seg === 'crack' && u < 0.55 ? (0.05 + 0.05 * Math.sin(t * 23) + 0.25 * win(0.22, 0.225, 0.25, 0.32, u)) * (u > 0.08 ? 1 : 0) : 0
    this.shimmer.position.set(COL, 0.004, -2.25)

    // The split: from 0.5 the other one steps onto the next pane; it breaks under him at 0.6.
    if (seg === 'crack' && u >= 0.5 && u < 0.8) {
      const g = cast.ghosts.glass
      cast.ghost(
        g,
        u,
        (a, uu) => {
          const side = ss(0.5, 0.55, uu)
          const fall = Math.max(0, uu - 0.6)
          a.place(0, 0, PI)
          a.hold(fall > 0 ? PP.FALL : P.STAND)
          if (fall <= 0) a.pose[2 + 4 * 3] += 0.45
          this.ghostX = lerp(COL, BREAK.x, side)
          this.ghostY = -260 * fall * fall
          this.ghostSpin = fall * 3
          return 0.34 * (1 - ss(-5.5, -8, this.ghostY))
        },
        t,
        {
          flash: u < 0.53 ? 1 - (u - 0.5) / 0.03 : 0,
          trail: 0.01,
          alpha: true,
          after: (a) => carry(a.figure, pivotFrame(0, 0.6, 0, this.ghostSpin * 0.4, 0, this.ghostSpin * 0.2, this.ghostX, this.ghostY, BREAK.z, this.frameM)),
        },
      )
    }

    // Camera.
    switch (seg) {
      case 'glass':
        if (cu < 0.45) {
          shot.pos.set(103.2, 1.7, 12.2)
          shot.tgt.set(lerp(boy.x, XC + 0.6, 0.3), 0.75, boy.z - 0.4)
          shot.fov = 40
        } else {
          shot.pos.set(101.65, 0.25, bz - 1.2)
          shot.tgt.set(COL - 0.15, 0.1, bz + 0.4)
          shot.fov = 40
        }
        break
      case 'rooms':
        if (cu < 0.46) {
          shot.pos.set(COL, 1.3, bz + 0.02)
          shot.tgt.set(COL + 0.4, -24, bz - 1)
          shot.fov = 55
          shot.handheld = 0.4
        } else {
          keyed(
            [
              [0, [100.2, -6.0, -6.6, 92.0, -7.0, -3.6, 48]],
              [0.25, [100.2, -6.0, -6.6, 106.0, -10.6, 3.4, 46]],
              [0.42, [100.3, -6.1, -6.6, 106.0, -10.6, 3.6, 46]],
              [0.6, [100.4, -6.2, -6.7, COL - 0.6, 0, bz + 0.6, 44]],
              [1, [100.4, -6.2, -6.7, COL - 0.6, 0, bz + 0.4, 42]],
            ],
            (cu - 0.46) / 0.54,
            shot,
          )
        }
        break
      case 'crack':
        if (cu < 0.5) {
          shot.pos.set(101.25, 0.2, -2.25 - 0.62)
          shot.tgt.set(COL - 0.05, 0.08, -2.15)
          shot.fov = 35
        } else if (cu < 0.75) {
          shot.pos.set(103.5, 2.6, -2.25)
          shot.tgt.set(100.0, 0.2, -2.25)
          shot.fov = 45
        } else {
          const k = ss(0.75, 1, cu)
          shot.pos.set(lerp(104, 106, k), lerp(4, 6, k), lerp(2, 6, k))
          shot.tgt.set(XC, lerp(-3, -6, k), -2)
          shot.fov = 45
        }
        shot.handheld = 0.4
        break
    }
  }

  private people(d: Dir) {
    const { cast, f, seg } = d
    if (seg === 'glassBroke') return
    const t = f.time
    const w = cast.solids.woman
    w.begin()
    w.place(92.45, -1.35, PI / 2)
    w.y = -8
    w.hold(P.HOLD)
    // Folding: the hands come together and apart.
    const fold = 0.5 + 0.5 * Math.sin(t * 1.4)
    w.reach('l', 1, 93.05, -8 + 0.95 + 0.1 * fold, -1.35 - 0.25 + 0.12 * fold, 0.4)
    w.reach('r', 1, 93.05, -8 + 0.95 + 0.1 * fold, -1.35 + 0.25 - 0.12 * fold, 0.4)
    w.pose[2 + 4 * 3] += 0.25
    w.apply(t, true)
    w.figure.lGrip.getWorldPosition(this.v1)
    w.figure.rGrip.getWorldPosition(this.v2)
    this.cloth.position.copy(this.v1).add(this.v2).multiplyScalar(0.5)
    this.cloth.position.y -= 0.12
    this.cloth.rotation.set(0, PI / 2, 0)
    this.cloth.scale.set(Math.max(0.4, this.v1.distanceTo(this.v2) / 0.55), 1, 1)
    const o = cast.solids.oldman
    o.begin()
    o.place(107.4, 3.75, 0)
    o.y = -12 + 0.02
    o.hold(P.SIT_SLUMP)
    o.pose[2 + 4 * 3] += 0.25
    o.pose[2 + 4 * 3 + 2] += 0.35
    o.apply(t, false)
  }
  private v1 = new THREE.Vector3()
  private v2 = new THREE.Vector3()

  private shardsAt(d: Dir) {
    const { seg, u, f } = d
    const im = this.shards
    const s = this.shardSeed
    if (seg === 'crack' && u >= 0.6) {
      const tt = u - 0.6
      for (let i = 0; i < N_SHARDS; i++) {
        const a = s[i * 6]
        const b = s[i * 6 + 1]
        const c = s[i * 6 + 2]
        const delay = s[i * 6 + 3] * 0.04
        const ft = Math.max(0, tt - delay)
        const x = BREAK.x + (a - 0.5) * 1.3 + (a - 0.5) * ft * 3
        const z = BREAK.z + (b - 0.5) * 1.3 + (b - 0.5) * ft * 3
        const y = -0.02 - (150 + c * 60) * ft * ft
        setInstance(im, i, x, y, z, ft * 14 * (c + 0.5), ft * 9 * a, ft * 11 * b, 0.6 + c * 0.9)
      }
      im.count = N_SHARDS
      im.visible = true
      im.instanceMatrix.needsUpdate = true
    } else if (seg === 'glassBroke') {
      // Hanging in the light, slowly turning.
      const t = f.time
      for (let i = 0; i < N_SHARDS; i++) {
        const a = s[i * 6]
        const b = s[i * 6 + 1]
        const c = s[i * 6 + 2]
        const y = -1.5 - Math.pow(c, 0.8) * 17
        const sx = this.sun.x / this.sun.y
        const sz = this.sun.z / this.sun.y
        setInstance(im, i, BREAK.x + (a - 0.5) * 1.6 - sx * (y + 1) * 0.25, y, BREAK.z + (b - 0.5) * 1.6 - sz * (y + 1) * 0.25, t * 0.3 + a * 6, t * 0.2 + b * 6, c * 6, 0.7 + c)
      }
      im.count = N_SHARDS
      im.visible = true
      im.instanceMatrix.needsUpdate = true
    } else im.visible = false
  }

  private dustDrift(t: number, jump: number) {
    const pos = this.dust.geometry.attributes.position as THREE.BufferAttribute
    const s = this.dustSeed
    for (let i = 0; i < pos.count; i++) {
      const a = s[i * 3]
      const b = s[i * 3 + 1]
      const c = s[i * 3 + 2]
      const y = -23 + ((b * 23 + t * 0.06 * (0.3 + c)) % 23)
      pos.setXYZ(i, 95 + a * 10 + Math.sin(t * 0.3 + c * 9) * 0.2, y + jump * 0.15 * Math.sin(i), -8 + c * 16 + Math.cos(t * 0.21 + a * 7) * 0.2)
    }
    pos.needsUpdate = true
    void lin
  }
}

function addWalkSafe(a: Actor, phase: number, amount: number) {
  if (amount <= 0) return
  const s = Math.sin(phase)
  const sw = 0.42 * amount
  a.pose[2 + 11 * 3] += -sw * s
  a.pose[2 + 14 * 3] += sw * s
  a.pose[2 + 12 * 3] += amount * (0.1 + 0.7 * Math.pow(Math.max(0, Math.cos(phase + 0.9)), 2))
  a.pose[2 + 15 * 3] += amount * (0.1 + 0.7 * Math.pow(Math.max(0, Math.cos(phase + 0.9 + PI)), 2))
  a.step = Math.floor(phase / PI)
  a.walking = amount
  void H9
}
