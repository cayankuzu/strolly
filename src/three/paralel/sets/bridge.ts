/**
 * E — the steel bridge over a river in flood (x 200): four riveted girders
 * under a road deck eleven metres above brown, fast water. A twelve-year-old
 * goes hand over hand along the bottom flange; a truck goes over; his
 * fingers slip, and the other one's do not hold.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { box, cyl, mesh } from '../../util'
import { PI, rng, ss, win, canvasTexture, instances, terrain, fbm, type Ctx, type Dir, type PSet } from '../common'
import { particleMaterial, waterMaterial } from '../shaders'
import { carry, pivotFrame } from '../rig'
import { pineGeometry, crownGeometry } from '../geo'
import * as PP from '../poses'
import * as P from '../../figure/poses'
import { sunDir, type SkyPreset } from '../env'
import { H12 } from '../cast'

const OVERCAST: SkyPreset = { zenith: 0x7d858c, horizon: 0xb6bbbe, below: 0x5a5f5a, haze: 0xaeb3b5, hazeAmt: 0.7, sunColor: 0xc8ccd0, disc: 0, glow: 0.25, cloud: 0.85, cloudLit: 0xc6cacc, cloudShade: 0x6d7378, power: 1.05 }
const FLANGE_Y = 9.8
const GZ = -1
const GRIP_DROP = 2.1 * H12 + 0.02

const SHOTS: Record<string, ShotKeys> = {
  river: [
    [0, [222, 4, 18, 197, 8, 0, 48]],
    [1, [221, 4.2, 16.5, 195, 8.4, 0, 46]],
  ],
  slipWide: [
    [0, [194.2, 0.9, 6.2, 192, 7.8, -1, 50]],
    [1, [194.6, 1.1, 6.6, 192, 7.4, -1, 50]],
  ],
  iron: [
    [0, [194, 9.2, 2, 192, 9.8, -1, 40]],
    [0.4, [194, 9.2, 2, 192, 8.6, -1, 40]],
    [1, [194, 9.0, 2.2, 192, 0.6, -2.2, 44]],
  ],
}

export class BridgeSet implements PSet {
  readonly group = new THREE.Group()
  private water!: THREE.ShaderMaterial
  private truck = new THREE.Group()
  private log: THREE.Group | null = null
  private drips!: THREE.Points
  private dripSeed: number[] = []
  private grit!: THREE.Points
  private puff!: THREE.Points
  private frameM = new THREE.Matrix4()
  private gy = 0
  private v = new THREE.Vector3()

  build(c: Ctx) {
    const g = this.group
    const pal = c.pal
    const rand = rng(505)
    // The river.
    this.water = waterMaterial(c.env.shared, { deep: 0x4a4830, shallow: 0x6f6a48, sky: 0x9aa0a2, skyTop: 0xb6bbbe, foam: 0.55, flow: [0, -3.0], chop: 1.4 })
    const river = mesh(new THREE.PlaneGeometry(30, 400, 90, 400).rotateX(-PI / 2), this.water, 200, 0, -40, g)
    river.frustumCulled = false
    // Embankment walls and the banks above them.
    const wallMat = pbr('concrete', 0x7d7a72, { roughness: 1 })
    box(2, 9, 400, wallMat, 184, 1.5, -40, g).receiveShadow = true
    box(2, 9, 400, wallMat, 216, 1.5, -40, g).receiveShadow = true
    const bankMat = pbr('rock', 0xffffff, { vertexColors: true, roughness: 1 })
    const green = new THREE.Color(0x56603e)
    const mud = new THREE.Color(0x6a604a)
    const bankH = (x: number, z: number) => {
      const d = x < 200 ? 185 - x : x - 215
      const road = Math.abs(z) < 5 ? 1 : 0
      const h = 6 + Math.min(5, d * 0.6) + 1.5 * fbm(x * 0.03, z * 0.03, 3, 7) * (1 - road)
      return road ? Math.max(h, d > 3 ? 11 : 6 + d * 1.7) : h
    }
    for (const [x0, x1] of [
      [-60, 185],
      [215, 460],
    ]) {
      const geo = terrain({ x0, x1, z0: -260, z1: 200, nx: 120, nz: 120, h: (x, z) => bankH(x, z), color: (x, z, y, out) => out.copy(green).lerp(mud, Math.max(0, 1 - (y - 6) / 2)).multiplyScalar(0.85 + 0.25 * fbm(x * 0.2, z * 0.2, 2, 3)) })
      mesh(geo, bankMat, 0, 0, 0, g).receiveShadow = true
    }
    // Abutments with the ledge at y 9 on the river side.
    const abut = pbr('concrete', 0x8e8a82, { roughness: 1 })
    box(3, 13, 9, abut, 181.5, 4.5, 0, g).receiveShadow = true
    box(3, 13, 9, abut, 218.5, 4.5, 0, g).receiveShadow = true
    box(0.9, 0.25, 9, abut, 183.4, 8.88, 0, g).receiveShadow = true
    // The flood line painted on the abutment's river face, above the girders.
    const flood = canvasTexture(512, 128, (fg, W, H) => {
      fg.clearRect(0, 0, W, H)
      fg.fillStyle = '#b3261e'
      fg.fillRect(0, 54, W, 12)
      fg.font = '700 40px sans-serif'
      fg.fillText('TAŞKIN SEVİYESİ', 20, 40)
      fg.font = '400 26px sans-serif'
      fg.fillText('▼ 1998', 20, 104)
    })
    const fm = mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshStandardMaterial({ map: flood, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }), 183.02, 10.6, 2.5, g)
    fm.rotation.y = PI / 2

    // Deck, road, railings.
    const deckMat = pbr('concrete', 0x77746e, { roughness: 1 })
    box(37, 0.3, 9, deckMat, 200, 10.85, 0, g).castShadow = true
    const road = pbr('asphalt', 0x3a3b3d, { roughness: 0.6 })
    const rd = mesh(new THREE.PlaneGeometry(500, 7.2), road, 200, 11.01, 0, g)
    rd.rotation.x = -PI / 2
    const railM = pbr('metal', 0x6a7068, { roughness: 0.5 })
    for (const z of [-4.3, 4.3]) {
      box(37, 0.06, 0.06, railM, 200, 12.05, z, g)
      box(37, 0.04, 0.04, railM, 200, 11.55, z, g)
    }
    g.add(instances(new THREE.BoxGeometry(0.06, 1.05, 0.06).translate(0, 0.52, 0), railM, 76, (i) => [182 + (i % 38) * 0.97, 11, i < 38 ? -4.3 : 4.3], { shadow: true }))
    // Girders: I-sections along x; cross-beams every 3 m; rivet rows.
    const steel = c.pal.steelWet
    for (const z of [-3, -1, 1, 3]) {
      box(36.4, 0.03, 0.3, steel, 200, FLANGE_Y + 0.015, z, g).castShadow = true
      box(36.4, 0.03, 0.3, steel, 200, 10.685, z, g)
      box(36.4, 0.86, 0.014, steel, 200, 10.25, z, g).castShadow = true
    }
    const cross = instances(new THREE.BoxGeometry(0.16, 0.5, 1.98), steel, 13 * 3, (i) => {
      const k = i % 13
      const j = Math.floor(i / 13)
      return [183 + k * 2.83, 10.35, -2 + j * 2]
    }, { shadow: true })
    g.add(cross)
    const rivetGeo = new THREE.SphereGeometry(0.012, 6, 4, 0, PI * 2, 0, PI / 2)
    rivetGeo.rotateX(PI)
    const rivets: number[][] = []
    for (const z of [-3, -1, 1, 3])
      for (let x = 182.2; x < 218; x += 0.18)
        for (const dz of [-0.1, 0.1]) rivets.push([x, FLANGE_Y - 0.0, z + dz])
    g.add(instances(rivetGeo, c.pal.rust, rivets.length, (i) => rivets[i]))
    // Rust streaks under the deck edge.
    void pal

    // Trees and a town on the banks.
    g.add(instances(pineGeometry(), new THREE.MeshLambertMaterial({ color: 0x34402c }), 260, () => {
      const left = rand() < 0.5
      const x = left ? 120 + rand() * 60 : 222 + rand() * 80
      const z = -200 + rand() * 380
      if (Math.abs(z) < 12) return null
      const s = 5 + rand() * 6
      return [x, bankH(x, z) - 0.2, z, rand() * PI, s, 0, 0, s * 1.3]
    }))
    g.add(instances(crownGeometry(), new THREE.MeshLambertMaterial({ color: 0x4a5a36 }), 160, () => {
      const left = rand() < 0.5
      const x = left ? 160 + rand() * 22 : 218 + rand() * 25
      const z = -150 + rand() * 300
      if (Math.abs(z) < 9) return null
      const s = 3 + rand() * 3
      return [x, bankH(x, z) - 0.2, z, rand() * PI, s]
    }))
    g.add(instances(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), pbr('plaster', 0xb8b0a4, { roughness: 1 }), 50, () => {
      const x = 240 + rand() * 160
      const z = -260 + rand() * 120
      return [x, bankH(x, z) - 0.5, z, rand() * PI, 6 + rand() * 6, 0, 0, 5 + rand() * 10]
    }))

    // The truck.
    const red = pbr('painted', 0x8a2a22, { roughness: 0.5 })
    const grey = pbr('painted', 0xbdbab2, { roughness: 0.7 })
    box(6.2, 2.6, 2.5, grey, -1, 1.75, 0, this.truck).castShadow = true
    box(1.9, 2.1, 2.4, red, 3.2, 1.5, 0, this.truck).castShadow = true
    const tire = pbr('rubber', 0x111111, { roughness: 0.9 })
    for (const x of [-3, -1.8, 2.9])
      for (const z of [-1.1, 1.1]) {
        const w = cyl(0.45, 0.45, 0.35, tire, x, 0.45, z, this.truck, 16)
        w.rotation.x = PI / 2
      }
    g.add(this.truck)
    // A log carried by the flood.
    if (c.models.trunk) {
      this.log = c.models.trunk.clone(true)
      this.log.scale.setScalar(1.4)
      g.add(this.log)
    }
    // Drips from the rivets; grit shaken down by the truck; the white puff where the other one went.
    const nd = 140
    const dg = new THREE.BufferGeometry()
    dg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nd * 3), 3))
    for (let i = 0; i < nd * 3; i++) this.dripSeed.push(rand())
    this.drips = new THREE.Points(dg, particleMaterial(0xd8e0e0, 0.025, 0.8))
    this.drips.frustumCulled = false
    g.add(this.drips)
    const gg = new THREE.BufferGeometry()
    gg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(200 * 3), 3))
    this.grit = new THREE.Points(gg, particleMaterial(0x9a958a, 0.02, 0.9, false))
    this.grit.frustumCulled = false
    g.add(this.grit)
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(160 * 3), 3))
    this.puff = new THREE.Points(pg, particleMaterial(0xf2f2ec, 0.35, 0.7, false))
    this.puff.frustumCulled = false
    g.add(this.puff)
  }

  /** Hand positions (x) of the two hands going hand over hand, and the body's x. */
  private hands(seg: string, u: number) {
    let s: number
    if (seg === 'river') s = 0
    else if (seg === 'beams') s = ss(0.02, 0.96, u)
    else s = 1
    const x0 = 183.6
    const x1 = 192
    const steps = 16
    const f = s * steps
    const k = Math.floor(f)
    const ph = f - k
    const pos = (n: number) => x0 + ((x1 - x0) * n) / steps
    // Leading and trailing hands swap each step; the moving hand travels during the step.
    const lead = pos(k + 1)
    const trail = pos(k)
    const moving = lerp(pos(k - 1 < 0 ? 0 : k - 1), pos(k + 1), ss(0.1, 0.9, ph))
    const a = k % 2 === 0 ? moving : trail
    const b = k % 2 === 0 ? trail : moving
    void lead
    return { l: a, r: b, body: (a + b) / 2 + 0.05, ph }
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const grey = seg === 'ironSlipped'
    const sd = sunDir(-PI / 2 + 0.6, 40 * (PI / 180))
    env.sky.set(OVERCAST, sd)
    env.setSun(new THREE.Vector3(192, 8, -1), sd, 0xd8dce0, grey ? 0.5 : 0.9, 14)
    env.setHemi(0xb8c0c8, 0x4a4a3e, grey ? 1.0 : 1.5)
    env.setFill(new THREE.Vector3(192, 0, 6), new THREE.Vector3(192, 9, -1), 0x8a9a8e, 0.4)
    env.setFog(grey ? 0x8a9096 : 0x9aa0a2, grey ? 0.016 : 0.006)
    env.ibl('kloofendal_48d_partly_cloudy_puresky', 0.5)
    if (grey) env.grade.value = 1
    // Truck over the deck.
    const tu = seg === 'slip' ? ss(0.04, 0.32, u) : -1
    this.truck.visible = tu > 0 && tu < 1
    this.truck.position.set(lerp(236, 164, tu), 11.02, 1.8)
    this.truck.rotation.y = PI
    const boom = seg === 'slip' ? win(0.06, 0.09, 0.26, 0.32, u) : 0
    if (this.log) {
      const z = 120 - ((t * 3.1) % 260)
      this.log.position.set(203 + Math.sin(t * 0.3) * 2, 0.15 + Math.sin(t * 1.3) * 0.08, z)
      this.log.rotation.set(Math.sin(t * 0.9) * 0.08, 0.4 + Math.sin(t * 0.2) * 0.2, 0)
    }
    this.dripsAt(t)
    this.gritAt(seg === 'slip' ? u : 0, boom)

    const boy = cast.solids.boy12
    const H = this.hands(seg, u)
    let bodyX = H.body
    let hangW = 1
    boy.begin()
    if (seg === 'river') {
      // Down from the road onto the ledge, then under the deck onto the flange.
      if (u < 0.5) {
        const k = ss(0.12, 0.48, u)
        boy.place(lerp(181.2, 183.3, k), lerp(0.4, -0.6, k), PI / 2)
        boy.y = lerp(11, 9.0, ss(0.25, 0.45, u))
        boy.hold(u < 0.3 ? PP.CLIMB : P.STAND)
        bodyX = 0
        hangW = 0
      } else {
        const k = ss(0.5, 0.9, u)
        boy.place(lerp(183.3, 183.8, k), lerp(-0.6, GZ, k), PI / 2)
        boy.y = lerp(9.0, FLANGE_Y - GRIP_DROP, k)
        boy.blend(
          [
            [0, PP.CLIMB],
            [1, PP.HANG],
          ],
          k,
        )
        hangW = k
        bodyX = 0
      }
    } else {
      const sway = Math.sin(H.ph * PI * 2) * 0.05
      boy.place(bodyX + sway, GZ, PI / 2)
      boy.y = FLANGE_Y - GRIP_DROP + (seg === 'slip' ? -0.03 * boom : 0)
      if (seg === 'slip' && u > 0.66) {
        // A knee over the cross-beam; hanging, breathing.
        const k = ss(0.68, 0.88, u)
        boy.blend(
          [
            [0, PP.HANG],
            [1, PP.HANG_KNEE],
          ],
          k,
        )
        boy.y += 0.15 * k
      } else boy.hold(PP.HANG)
      // Legs swing with each reach.
      boy.pose[2 + 11 * 3] += Math.sin(H.ph * PI * 2 + 1) * 0.12
      boy.pose[2 + 14 * 3] += Math.sin(H.ph * PI * 2 + 1.4) * 0.12
    }
    // Hands on the flange (the right one slips in `slip`).
    const slipX = seg === 'slip' ? win(0.3, 0.42, 0.52, 0.62, u) * 0.03 : 0
    const slipY = seg === 'slip' ? win(0.4, 0.5, 0.54, 0.64, u) * 0.06 : 0
    if (hangW > 0.01) {
      const lx = bodyX ? H.l : boy.x - 0.12
      const rx = bodyX ? H.r : boy.x + 0.12
      boy.reach('l', hangW, lx, FLANGE_Y - 0.01, GZ - 0.06, 0.2)
      boy.reach('r', hangW, rx + slipX, FLANGE_Y - 0.01 - slipY, GZ + 0.06, 0.2)
    }
    boy.lookAt(boy.x + 3, GZ, seg === 'slip' && u > 0.66 ? 0 : 0.2)
    boy.apply(t, true)
    // Hands wrap the flange edge from below.
    boy.figure.joints.lHand.rotation.x -= 0.6 * hangW
    boy.figure.joints.rHand.rotation.x -= 0.6 * hangW

    // The split: his hands open; he drops straight into the foam.
    this.puff.visible = false
    if (seg === 'slip' && u >= 0.52 && u < 0.72) {
      const g = cast.ghosts.bridge
      const x0 = boy.x
      cast.ghost(
        g,
        u,
        (a, uu) => {
          a.place(0, 0, PI / 2)
          a.blend(
            [
              [0, PP.HANG],
              [0.04, PP.FALL],
            ],
            Math.max(0, uu - 0.52),
          )
          const tt = Math.max(0, uu - 0.52)
          this.gy = FLANGE_Y - GRIP_DROP - 1400 * tt * tt
          return 0.34 * (1 - ss(0.6, 0.05, this.gy))
        },
        t,
        { flash: u < 0.55 ? 1 - (u - 0.52) / 0.03 : 0, trail: 0.008, alpha: true, after: (a) => carry(a.figure, pivotFrame(0, 1, 0, 0, 0, 0, x0, this.gy, GZ, this.frameM)) },
      )
      this.puffAt(x0, u)
    }
    if (seg === 'ironSlipped') boy.figure.root.visible = false

    // Camera.
    switch (seg) {
      case 'river':
        keyed(SHOTS.river, cu, shot)
        shot.handheld = 0.3
        break
      case 'beams':
        if (u > 0.5 && u < 0.65) {
          boy.figure.rGrip.getWorldPosition(this.v)
          shot.pos.set(this.v.x - 0.35, FLANGE_Y - 0.28, GZ + 0.45)
          shot.tgt.set(this.v.x + 0.05, FLANGE_Y - 0.02, GZ)
          shot.fov = 34
        } else {
          shot.pos.set(boy.x - 1.5, 9.4, 2.2)
          shot.tgt.set(boy.x + 0.2, 9.0, GZ)
          shot.fov = 42
        }
        shot.handheld = 0.5
        break
      case 'slip':
        if (cu < 0.5) {
          boy.figure.rGrip.getWorldPosition(this.v)
          shot.pos.set(this.v.x + 0.4, 10.0, -0.55)
          shot.tgt.set(this.v.x - 0.05, FLANGE_Y - 0.05, GZ)
          shot.fov = 30
        } else if (cu < 0.66) keyed(SHOTS.slipWide, (cu - 0.5) / 0.16, shot)
        else {
          boy.figure.joints.head.getWorldPosition(this.v)
          shot.pos.set(this.v.x + 0.85, this.v.y + 0.05, this.v.z + 0.55)
          shot.tgt.set(this.v.x, this.v.y + 0.08, this.v.z)
          shot.fov = 32
        }
        // The deck booms: a 2 cm shake.
        shot.pos.y += Math.sin(t * 47) * 0.02 * boom
        shot.pos.x += Math.sin(t * 39 + 1) * 0.015 * boom
        shot.handheld = 0.6
        break
      case 'ironSlipped':
        keyed(SHOTS.iron, cu, shot)
        shot.handheld = 0
        break
    }
  }

  private dripsAt(t: number) {
    const pos = this.drips.geometry.attributes.position as THREE.BufferAttribute
    const s = this.dripSeed
    for (let i = 0; i < pos.count; i++) {
      const x = 183 + s[i * 3] * 34
      const z = [-3, -1, 1, 3][Math.floor(s[i * 3 + 1] * 4)] + 0.12
      const per = 1.4 + s[i * 3 + 2] * 1.6
      const ph = (t / per + s[i * 3 + 2] * 7) % 1
      const y = FLANGE_Y - 0.02 - 0.5 * 9.8 * Math.pow(ph * per, 2)
      pos.setXYZ(i, x, Math.max(0.05, y), z)
    }
    pos.needsUpdate = true
  }

  private gritAt(u: number, boom: number) {
    const pos = this.grit.geometry.attributes.position as THREE.BufferAttribute
    this.grit.visible = boom > 0.01 || (u > 0.08 && u < 0.45)
    if (!this.grit.visible) return
    for (let i = 0; i < pos.count; i++) {
      const a = (i * 0.618) % 1
      const b = (i * 0.414) % 1
      const c = (i * 0.732) % 1
      const tt = Math.max(0, u - 0.08 - c * 0.15)
      pos.setXYZ(i, 188 + a * 8, 10.68 - 160 * tt * tt, -3 + b * 6)
    }
    pos.needsUpdate = true
  }

  private puffAt(x: number, u: number) {
    const tt = u - 0.57
    this.puff.visible = tt > 0 && tt < 0.2
    if (!this.puff.visible) return
    const pos = this.puff.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const a = ((i * 0.618) % 1) * PI * 2
      const r = ((i * 0.37) % 1) * (0.4 + tt * 9)
      const h = ((i * 0.53) % 1) * (1.6 * Math.sin(Math.min(1, tt * 8) * PI * 0.5)) * (1 - tt * 3)
      pos.setXYZ(i, x + Math.cos(a) * r, 0.1 + Math.max(0, h), GZ + Math.sin(a) * r - tt * 8)
    }
    pos.needsUpdate = true
    ;(this.puff.material as THREE.PointsMaterial).opacity = 0.75 * (1 - ss(0.05, 0.2, tt))
  }
}

export type { Actor }
