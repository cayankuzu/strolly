/**
 * A — the valley swing cliff (x 1000): the opening look straight down, the
 * man on the path, and the whole of ŞU AN. A rock promontory with an old
 * tree leaning out over a 400 m drop; a plank swing on two ropes from its
 * branch; a forested valley with a river thread; a far ridge that keeps the
 * last sun.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { at, TOTAL_SCREENS } from '@/stories/paralel/timeline'
import { keyed, held, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { makePath } from '../../figure/paths'
import { mesh } from '../../util'
import { DEG, PI, fbm, ridged, rng, ss, win, instances, type Ctx, type Dir, type PSet } from '../common'
import { bunched, gridSurface, leafCluster, mergeAll, pineGeometry, taperTube, tuftGeometry } from '../geo'
import { distantMaterial, type Shared } from '../shaders'
import { carry } from '../rig'
import * as PP from '../poses'
import { sunDir, type SkyPreset } from '../env'
import { ghostMaterial } from '../ghost'
import { gripLine } from '../grip'
import type { Actor } from '../../kit/direct'

const UP = new THREE.Vector3(0, 1, 0)
const FWD = new THREE.Vector3(0, 0, -1)

export const VX = 1000
const PIVOT = new THREE.Vector3(1000, 4.55, -0.4)
const ROPE = 3.7
const W = (2 * PI) / 3.86
const TREE = { x: 1002.0, z: 2.4 }
/** Seconds of fall per screen of scroll for the men letting go (slow, as in a dream). */
const FALL_SPEED = 4.2

/** Cliff edge line: z of the rim at x. */
export function zEdge(x: number) {
  const dx = x - 1001
  const curve = 0.0018 * dx * dx * (dx < 0 ? 1.2 : 1)
  const jag = (0.6 * fbm(x * 0.21, 3.1, 3, 41) + 0.25 * fbm(x * 0.9, 1.3, 2, 43)) * ss(3, 10, Math.abs(dx))
  return curve + jag
}

/**
 * Plateau height: the swing's ledge is a flat spur on a long cliff. The rim
 * sinks slowly to either side (it stays a wall seen from the valley); behind
 * the spur the land falls to a saddle the man climbs from, then rises into
 * wooded hills.
 */
export function hPlateau(x: number, z: number) {
  const dx = x - 1003
  const side = -0.12 * Math.max(0, Math.abs(dx) - 6) + 0.00006 * Math.max(0, Math.abs(dx) - 120) ** 2
  const back = -0.5 * Math.max(0, z - 8) * (1 - ss(70, 160, z)) - 0.5 * 76 * ss(70, 160, z)
  const d = Math.hypot(dx, (z - 4) * 0.9)
  const hills = 90 * ridged(x * 0.0035, z * 0.0035, 4, 7) * ss(90, 320, z) + 25 * ridged(x * 0.006, 3.3, 3, 8) * ss(40, 160, Math.abs(dx)) * (1 - ss(-5, 30, -z))
  const lump = 2.2 * fbm(x * 0.04, z * 0.04, 4, 9) * ss(8, 30, d) + 0.35 * fbm(x * 0.3, z * 0.3, 2, 11) * ss(3, 9, d)
  return side + back + hills + lump
}

const RIVER = (x: number) => -118 + 26 * Math.sin(x * 0.012) + 9 * Math.sin(x * 0.031 + 1)
function hFloor(x: number, z: number) {
  let y = -400 + 7 * fbm(x * 0.008, z * 0.008, 4, 21) + 2 * fbm(x * 0.05, z * 0.05, 2, 23)
  const r = (z - RIVER(x)) / 13
  y -= 3.5 * Math.exp(-r * r)
  // The far ridge: rising from the valley to a crest at z ≈ −1600.
  const rise = ss(-900, -1580, z)
  const crest = 560 * rise - 260 * ss(-1620, -1900, z)
  y += crest + 70 * ridged(x * 0.004, z * 0.004, 4, 27) * rise
  return y
}

/** Dusk over the valley. */
const DUSK: SkyPreset = {
  zenith: 0x40386c,
  horizon: 0xe98a4e,
  below: 0x1e2a44,
  haze: 0xc98d72,
  hazeAmt: 0.42,
  sunColor: 0xffa860,
  disc: 4,
  glow: 1.2,
  cloud: 0.32,
  cloudLit: 0xf2a070,
  cloudShade: 0x443a62,
  power: 1.05,
}
const DUSK_LATE: SkyPreset = { ...DUSK, zenith: 0x2e2a58, horizon: 0xd2683f, haze: 0xa47870, sunColor: 0xff8a50, glow: 0.9, disc: 2, cloudLit: 0xdb7a5c, power: 0.9 }

export const SHOTS: Partial<Record<string, ShotKeys>> = {
  swing: [
    [0, [1000.4, 2.6, 2.9, 1000, 1.5, -0.5, 45]],
    [0.45, [1004.6, 2.3, 1.2, 1000, 1.5, -0.5, 50]],
    [1, [1009, 1.5, -7, 1000, 1.5, -0.5, 55]],
  ],
  arc: [
    [0, [1006.2, 1.7, -0.9, 1000, 2.0, -0.2, 50]],
    [1, [1006.0, 1.6, -0.6, 1000, 2.0, -0.4, 50]],
  ],
  // From far out and below the rim: the dark cliff, the old tree and the tiny swing on the dusk sky,
  // high in the right third (the title sits in the middle).
  end: [
    [0, [1090, -60, -190, 1012, -5, 0, 10]],
    [1, [1098, -62, -204, 1013, -5.5, 0, 11.5]],
  ],
}

export class ValleySet implements PSet {
  readonly group = new THREE.Group()
  private pivot = new THREE.Group()
  private seat = new THREE.Group()
  private swing = new THREE.Group()
  private gPivot = new THREE.Group()
  private gSeat = new THREE.Group()
  private ghostSwing = new THREE.Group()
  private ghostSwingMat = ghostMaterial()
  private leaves!: THREE.InstancedMesh
  private leafBase: THREE.Matrix4[] = []
  private grassMat!: THREE.MeshStandardMaterial
  private grassU = { uTime: { value: 0 }, uWind: { value: 0.3 }, uLean: { value: 0 } }
  private shared!: Shared
  private tmpM = new THREE.Matrix4()
  private tmpV = new THREE.Vector3()
  private tmpT = new THREE.Vector3()
  private tmpG = new THREE.Vector3()
  private rotOnly = new THREE.Matrix4()
  private seatM = new THREE.Matrix4()
  private releaseM: THREE.Matrix4[] = [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()]
  private path = makePath([
    [1030, 44],
    [1021, 39.5],
    [1025.5, 31],
    [1016, 25],
    [1012, 18],
  ])

  build(c: Ctx) {
    const g = this.group
    const pal = c.pal
    this.shared = c.env.shared
    const rand = rng(1001)

    // ——— Land: plateau, cliff face, valley floor and far ridge, sharing the x samples so they meet. ———
    const xs = bunched(240, 0.5, 1.8).map((t) => 500 + t * 1000)
    const nu = xs.length - 1
    const rockCol = new THREE.Color(0x8d877e)
    const grassCol = new THREE.Color(0x7c7a45)
    const dryCol = new THREE.Color(0x8f7f52)
    const plateau = gridSurface(
      nu,
      120,
      (i, j, out) => {
        const x = xs[i]
        const s = 640 * Math.pow(j / 120, 2)
        const z = zEdge(x) + s
        out.set(x, hPlateau(x, z), z)
      },
      1,
      (i, j, p, out) => {
        const s = 640 * Math.pow(j / 120, 2)
        const n = fbm(p.x * 0.08, p.z * 0.08, 3, 5)
        const bare = Math.max(1 - ss(0.6, 2.4, s), ss(0.15, 0.45, n))
        out.copy(grassCol).lerp(dryCol, ss(-0.3, 0.4, fbm(p.x * 0.02, p.z * 0.02, 3, 6)))
        out.lerp(rockCol, clamp(bare))
        out.multiplyScalar(0.85 + 0.25 * fbm(p.x * 0.5, p.z * 0.5, 2, 8))
      },
    )
    const ground = mesh(plateau, pbr('rock', 0xffffff, { vertexColors: true, roughness: 1 }), 0, 0, 0, g)
    ground.receiveShadow = true

    // The face: from the rim down to a talus at the valley floor. Rows bunched toward the top.
    const ny = 140
    const lichen = new THREE.Color(0x343c2c)
    const faceShade = new THREE.Color(0x1c2233)
    const talus = new THREE.Color(0x2a3028)
    const faceGeo = gridSurface(
      nu,
      ny,
      (i, j, out) => {
        const x = xs[i]
        const t = Math.pow(j / ny, 1.9)
        const ze = zEdge(x)
        const top = hPlateau(x, ze)
        let y: number
        let z: number
        if (t < 0.8) {
          y = top + (-340 - top) * (t / 0.8)
          const depth = top - y
          // The swing's promontory is a clean overhang for its first metres (nothing juts out under the seat).
          const clean = 1 - (1 - ss(4, 14, Math.abs(x - 1000.5))) * (1 - ss(8, 30, depth))
          const rough = (3.2 * fbm(x * 0.03, y * 0.03, 4, 31) + 1.2 * fbm(x * 0.15, y * 0.15, 3, 33) + 0.35 * fbm(x * 0.9, y * 0.9, 2, 35)) * ss(0, 3, depth) * clean
          const strata = 1.1 * Math.sin(y * 0.17 + 3 * fbm(x * 0.02, y * 0.01, 2, 37)) * ss(0, 6, depth)
          // Overhang under the rim for the first meters, then a gentle outward lean.
          z = ze + 0.6 * ss(0, 2, depth) * (1 - ss(6, 30, depth)) - 0.02 * depth + rough + strata
        } else {
          const k = (t - 0.8) / 0.2
          y = -340 - 60 * Math.pow(k, 0.7)
          z = ze - 6.8 - 54 * Math.pow(k, 1.4) + 4 * fbm(x * 0.03, k * 3, 2, 39)
        }
        out.set(x, y, z)
      },
      1,
      (i, j, p, out) => {
        const streak = fbm(p.x * 0.35, p.y * 0.012, 3, 51)
        const band = 0.5 + 0.5 * Math.sin(p.y * 0.21 + 3 * fbm(p.x * 0.01, p.y * 0.01, 2, 55))
        const v = 0.62 + 0.22 * fbm(p.x * 0.05, p.y * 0.05, 3, 53) - 0.2 * ss(0.1, 0.5, streak) - 0.12 * band
        out.setRGB(0.33 * v, 0.325 * v, 0.33 * v)
        // Lichen and scrub on the ledges; the lower face sinks into the valley's blue shadow.
        if (fbm(p.x * 0.08, p.y * 0.08, 2, 57) > 0.35) out.lerp(lichen, 0.45)
        out.lerp(faceShade, 0.55 * ss(-20, -260, p.y))
        if (p.y < -335) out.lerp(talus, 0.5)
      },
    )
    const cliff = mesh(faceGeo, pbr('rock', 0xffffff, { vertexColors: true, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0, g)
    cliff.receiveShadow = true

    const forestDark = new THREE.Color(0x26331f)
    const meadow = new THREE.Color(0x46502f)
    const ridgeRock = new THREE.Color(0x8a7d70)
    const floorGeo = gridSurface(
      nu,
      110,
      (i, j, out) => {
        const x = xs[i]
        const ze = zEdge(x) - 61
        const s = 1900 * Math.pow(j / 110, 1.7)
        const z = ze - s
        out.set(x, hFloor(x, z), z)
      },
      1,
      (i, j, p, out) => {
        const n = fbm(p.x * 0.01, p.z * 0.01, 4, 61)
        out.copy(forestDark).lerp(meadow, ss(0.15, 0.45, n))
        const r = Math.abs(p.z - RIVER(p.x))
        if (r < 22) out.lerp(new THREE.Color(0x6a6650), 0.5 * (1 - r / 22))
        out.lerp(ridgeRock, ss(-150, 120, p.y) * 0.6)
        out.multiplyScalar(0.8 + 0.3 * fbm(p.x * 0.06, p.z * 0.06, 2, 63))
      },
    )
    // The talus row must meet the face's last row exactly.
    const fp = floorGeo.attributes.position as THREE.BufferAttribute
    const cp = faceGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i <= nu; i++) {
      const k = ny * (nu + 1) + i
      fp.setXYZ(i, cp.getX(k), cp.getY(k), cp.getZ(k))
    }
    floorGeo.computeVertexNormals()
    const distant = distantMaterial(this.shared)
    mesh(floorGeo, distant, 0, 0, 0, g)

    // The river thread.
    const riverPts: THREE.Vector3[] = []
    for (let x = 520; x <= 1480; x += 10) riverPts.push(new THREE.Vector3(x, -402.5, RIVER(x)))
    const riverGeo = gridSurface(riverPts.length - 1, 1, (i, j, out) => {
      const pnt = riverPts[i]
      const w = 6 + 2 * Math.sin(i * 0.7)
      out.set(pnt.x, -401.2, pnt.z + (j === 0 ? -w : w))
    })
    mesh(riverGeo, new THREE.MeshBasicMaterial({ color: 0x4e5a6e }), 0, 0, 0, g)

    // Forest on the valley floor (instanced crowns), and pines on the plateau's far slopes.
    // Low-poly crowns (seen only from far above or far away): the whole floor is forest, with
    // meadow clearings, thinning out where the far ridge turns to rock.
    const crownGeo = mergeAll([new THREE.IcosahedronGeometry(0.6, 0).scale(1, 0.85, 1).translate(0, 1.15, 0)])
    const crowns = instances(crownGeo, distantMaterial(this.shared, { vertexColors: false }), 52000, (i) => {
      // Near half: the valley under the cliff; far half: the ridge's wooded flank, bigger and sparser.
      const far = i >= 36000
      const x = 505 + rand() * 990
      const z = far ? -880 - rand() * 820 : -30 - rand() * 870
      if (Math.abs(z - RIVER(x)) < 14) return null
      if (fbm(x * 0.01, z * 0.01, 4, 61) > 0.3 && rand() < 0.85) return null
      if (z > zEdge(x) - 64) return null
      const y = hFloor(x, z)
      if (y > -140 && rand() < 0.3 + 0.7 * ss(-140, 60, y)) return null
      const s = (3.5 + rand() * 4) * (far ? 1.7 : 1)
      return [x, y - 0.6, z, rand() * PI * 2, s, 0, 0, s * (0.7 + rand() * 0.5)]
    }, { color: (i, out) => out.setHSL(0.27 + rand() * 0.08, 0.32, 0.045 + rand() * 0.05) })
    crowns.name = 'valley-forest'
    g.add(crowns)
    const pines = instances(pineGeometry(), distantMaterial(this.shared, { vertexColors: false }), 900, () => {
      const x = 900 + rand() * 260
      const z = 10 + rand() * 320
      const d = Math.hypot(x - 1003, z - 4)
      if (d < 60) return null
      const s = 4 + rand() * 6
      return [x, hPlateau(x, z) - 0.3, z, rand() * PI * 2, s, 0, 0, s * (1 + rand() * 0.5)]
    }, { color: (i, out) => out.setHSL(0.25 + rand() * 0.05, 0.3, 0.13 + rand() * 0.08) })
    g.add(pines)

    // ——— The rock behind the swing, boulders ———
    const rockModel = c.models.rockFace
    if (rockModel) {
      const r = rockModel.clone(true)
      r.scale.set(1.0, 0.66, 0.8)
      r.position.set(1000.6, -0.25, 5.4)
      r.rotation.y = PI
      g.add(r)
      const r2 = rockModel.clone(true)
      r2.scale.set(0.9, 0.8, 0.9)
      r2.position.set(1012, hPlateau(1012, 9) - 0.6, 10)
      r2.rotation.y = 2.2
      g.add(r2)
    } else {
      const block = mesh(new THREE.DodecahedronGeometry(1, 1), pal.rockGrey, 1000.6, 1.3, 5.6, g)
      block.scale.set(4, 1.8, 2.6)
    }
    if (c.models.boulder) {
      const spots: Array<[number, number, number, number]> = [
        [994.5, 2.2, 0.8, 0.4],
        [1007.5, 1.6, 0.6, 1.9],
        [990, 6, 1.1, 2.6],
        [1018, 12, 1.4, 0.9],
        [1028, 30, 1.2, 1.4],
        [1034, 48, 1.6, 2.2],
        [1009, 24, 0.9, 0.3],
      ]
      for (const [x, z, s, yaw] of spots) {
        const b = c.models.boulder.clone(true)
        b.scale.setScalar(s)
        b.position.set(x, hPlateau(x, z) - 0.15 * s, z)
        b.rotation.y = yaw
        g.add(b)
      }
    }

    // ——— The old tree ———
    const bark = pal.bark
    const T = TREE
    const trunk = taperTube(
      [new THREE.Vector3(T.x, -0.4, T.z + 0.05), new THREE.Vector3(T.x, 1.2, T.z), new THREE.Vector3(T.x - 0.05, 2.4, T.z - 0.25), new THREE.Vector3(1001.75, 3.5, 0.9), new THREE.Vector3(1001.5, 4.3, 0.0), new THREE.Vector3(1001.4, 4.62, -0.4)],
      (t) => 0.42 * (1 - 0.45 * t) + 0.16 * Math.exp(-t * 18),
      { segments: 48, radial: 16, meters: 0.6, gnarl: 0.12, seed: 3 },
    )
    mesh(trunk, bark, 0, 0, 0, g).castShadow = true
    const branch = taperTube([new THREE.Vector3(1001.6, 4.6, -0.4), new THREE.Vector3(1000.6, 4.66, -0.42), new THREE.Vector3(999.6, 4.64, -0.42), new THREE.Vector3(998.8, 4.55, -0.46), new THREE.Vector3(998.2, 4.35, -0.5)], (t) => 0.19 * (1 - 0.6 * t), { segments: 32, radial: 12, meters: 0.6, gnarl: 0.08, seed: 5 })
    mesh(branch, bark, 0, 0, 0, g).castShadow = true
    const limbs: THREE.Vector3[][] = [
      [new THREE.Vector3(1001.45, 4.5, -0.2), new THREE.Vector3(1001.9, 5.6, 0.1), new THREE.Vector3(1002.7, 6.7, 0.6), new THREE.Vector3(1003.3, 7.3, 0.7)],
      [new THREE.Vector3(1001.7, 3.6, 0.8), new THREE.Vector3(1002.6, 4.6, 1.2), new THREE.Vector3(1003.7, 5.1, 1.0)],
      [new THREE.Vector3(1002.1, 5.9, 0.35), new THREE.Vector3(1002.3, 6.8, 1.3), new THREE.Vector3(1002.1, 7.5, 2.0)],
      [new THREE.Vector3(999.4, 4.62, -0.43), new THREE.Vector3(999.0, 5.2, -0.9), new THREE.Vector3(998.6, 5.6, -1.2)],
    ]
    const tips: THREE.Vector3[] = []
    limbs.forEach((pts, k) => {
      mesh(taperTube(pts, (t) => (k === 0 ? 0.16 : 0.09) * (1 - 0.7 * t), { segments: 18, radial: 8, meters: 0.6, gnarl: 0.1, seed: 7 + k }), bark, 0, 0, 0, g).castShadow = true
      tips.push(pts[pts.length - 1], pts[pts.length - 2])
    })
    tips.push(new THREE.Vector3(998.4, 4.45, -0.5), new THREE.Vector3(998.9, 4.7, -0.3))
    // Sparse leaves at the tips.
    const leafGeo = leafCluster(10, 0.1, 0.42, 9)
    const leafMat = pal.leaf
    leafMat.color.set(0x5b6532)
    const nLeaves = tips.length * 5
    this.leaves = new THREE.InstancedMesh(leafGeo, leafMat, nLeaves)
    this.leaves.castShadow = true
    for (let i = 0; i < nLeaves; i++) {
      const tip = tips[i % tips.length]
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(tip.x + (rand() - 0.5) * 0.9, tip.y + (rand() - 0.3) * 0.6, tip.z + (rand() - 0.5) * 0.9),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * PI, rand() * PI * 2, 0)),
        new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + rand() * 0.6),
      )
      this.leafBase.push(m)
      this.leaves.setMatrixAt(i, m)
    }
    this.leaves.frustumCulled = false
    g.add(this.leaves)
    // Knife notches on the trunk's back, facing the rock.
    const tally = document.createElement('canvas')
    tally.width = 128
    tally.height = 96
    const tg = tally.getContext('2d')!
    tg.strokeStyle = 'rgba(214,190,150,0.95)'
    tg.lineWidth = 4
    for (let k = 0; k < 23; k++) {
      const x = 10 + (k % 12) * 9 + (k % 5 === 4 ? 4 : 0)
      const y = k < 12 ? 10 : 52
      tg.beginPath()
      tg.moveTo(x, y + Math.sin(k) * 2)
      tg.lineTo(x + 2, y + 32)
      tg.stroke()
    }
    const tallyTex = new THREE.CanvasTexture(tally)
    tallyTex.colorSpace = THREE.SRGBColorSpace
    const tm = mesh(new THREE.PlaneGeometry(0.32, 0.24), new THREE.MeshStandardMaterial({ map: tallyTex, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), T.x, 1.4, T.z + 0.43, g)
    tm.rotation.y = 0

    // ——— The swing ———
    this.pivot.position.copy(PIVOT)
    this.seat.position.set(0, -ROPE, 0)
    this.pivot.add(this.seat)
    this.swing.add(this.pivot)
    const ropeGeo = new THREE.CylinderGeometry(0.013, 0.013, ROPE + 0.06, 10)
    ropeGeo.translate(0, -(ROPE + 0.06) / 2 + 0.03, 0)
    const seatGeo = new THREE.BoxGeometry(0.62, 0.04, 0.2)
    // Three tight turns of rope round the branch (a helix about the branch's axis), the end tucked under.
    const coilGeo = (x0: number) => {
      const turns = 3
      // The branch tapers 0.19 → 0.076 over its 3.45 m from the trunk; the turns sit snug on the bark.
      const tb = (1001.6 - (PIVOT.x + x0)) / 3.45
      const rc = 0.19 * (1 - 0.6 * tb) * 1.07 + 0.013
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 96; i++) {
        const t = i / 96
        const a = -PI / 2 + t * turns * 2 * PI
        pts.push(new THREE.Vector3(x0 - 0.04 + 0.08 * t, 4.645 + rc * Math.sin(a) - PIVOT.y, -0.42 + rc * Math.cos(a) - PIVOT.z))
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.014, 8, false)
    }
    const coils = [coilGeo(-0.3), coilGeo(0.3)]
    const twist = ropeTexture()
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb8a27e, map: twist, roughness: 1 })
    ropeMat.map!.repeat.set(1, (ROPE + 0.06) / 0.04)
    const coilMat = ropeMat.clone()
    coilMat.map = twist.clone()
    coilMat.map.repeat.set((3 * 2 * PI * 0.15) / 0.04, 1)
    const seatMat = pal.seat
    const addSwing = (pivot: THREE.Group, seat: THREE.Group, rope: THREE.Material, coil: THREE.Material, plank: THREE.Material, shadow: boolean) => {
      ;[-0.3, 0.3].forEach((sx, k) => {
        const r = mesh(ropeGeo, rope, sx, 0, 0, pivot)
        r.castShadow = shadow
        r.name = 'swing-rope'
        // The coil stays on the branch (it does not swing with the rope); the ghost swing shares it.
        if (shadow) {
          const c = mesh(coils[k], coil, 0, 0, 0, this.swing)
          c.position.copy(PIVOT)
          c.castShadow = true
          c.name = 'rope-coil'
        }
        mesh(new THREE.SphereGeometry(0.028, 10, 8), rope, sx, -0.04, 0, seat).castShadow = shadow
      })
      const s = mesh(seatGeo, plank, 0, 0, 0, seat)
      s.castShadow = shadow
      s.receiveShadow = shadow
      s.name = 'swing-seat'
    }
    addSwing(this.pivot, this.seat, ropeMat, coilMat, seatMat, true)
    g.add(this.swing)
    this.gPivot.position.copy(PIVOT)
    this.gSeat.position.set(0, -ROPE, 0)
    this.gPivot.add(this.gSeat)
    this.ghostSwing.add(this.gPivot)
    addSwing(this.gPivot, this.gSeat, this.ghostSwingMat, this.ghostSwingMat, this.ghostSwingMat, false)
    this.ghostSwing.visible = false
    g.add(this.ghostSwing)

    // ——— Grass: tufts around the ledge and along the path, swaying ———
    this.grassMat = new THREE.MeshStandardMaterial({ color: 0xa69a5c, roughness: 0.95, side: THREE.DoubleSide })
    const gu = this.grassU
    this.grassMat.onBeforeCompile = (s) => {
      s.uniforms.uTime = gu.uTime
      s.uniforms.uWind = gu.uWind
      s.uniforms.uLean = gu.uLean
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;\nuniform float uLean;').replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
float hgt = max(position.y, 0.0);
vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
float ph = uTime * 2.4 + ip.x * 0.8 + ip.z * 0.55;
float sway = (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25) * uWind + uLean;
transformed.x += sway * hgt * hgt * 2.6;
transformed.z += sway * 0.35 * hgt * hgt * 2.6;
transformed.y -= abs(uLean) * hgt * hgt * 1.2;`,
      )
    }
    this.grassMat.customProgramCacheKey = () => 'paralel-grass'
    const tuft = tuftGeometry(6, 0.42, 7)
    const grass = instances(tuft, this.grassMat, 7000, (i) => {
      let x: number
      let z: number
      if (i < 4200) {
        const a = rand() * PI * 2
        const r = 2 + Math.pow(rand(), 0.7) * 34
        x = 1003 + Math.cos(a) * r
        z = 6 + Math.sin(a) * r * 0.8
      } else {
        x = 1008 + rand() * 30
        z = 12 + rand() * 40
      }
      const ze = zEdge(x)
      if (z < ze + 0.5) return null
      if (Math.abs(x - 1000.6) < 4.2 && z > 3.0 && z < 8.5) return null
      if (Math.hypot(x - TREE.x, z - TREE.z) < 0.55) return null
      const near = Math.hypot(x - 1000.5, z - 0.6)
      if (near < 2.6 && rand() < 0.85) return null
      if (fbm(x * 0.15, z * 0.15, 2, 71) > 0.25 && rand() < 0.6) return null
      const s = 0.6 + rand() * 0.9
      return [x, hPlateau(x, z) - 0.02, z, rand() * PI * 2, s]
    }, { color: (i, out) => out.setHSL(0.13 + rand() * 0.05, 0.35, 0.36 + rand() * 0.2) })
    g.add(grass)

    // The path the man climbs (today): a worn strip on the slope.
    const pts = this.path.pts
    const dense: Array<[number, number]> = []
    for (let i = 0; i < pts.length - 1; i++)
      for (let k = 0; k < 12; k++) {
        const t = k / 12
        dense.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t])
      }
    dense.push(pts[pts.length - 1], [1009, 13], [1006, 7])
    const pathGeo = gridSurface(dense.length - 1, 2, (i, j, out) => {
      const a = dense[Math.max(0, i - 1)]
      const b = dense[Math.min(dense.length - 1, i + 1)]
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const l = Math.hypot(dx, dz) || 1
      const off = (j - 1) * 0.55
      const x = dense[i][0] - (dz / l) * off
      const z = dense[i][1] + (dx / l) * off
      out.set(x, hPlateau(x, z) + 0.035 - Math.abs(j - 1) * 0.02, z)
    })
    mesh(pathGeo, pbr('gravel', 0x9c8a6c, { roughness: 1, polygonOffset: true, polygonOffsetFactor: -1 }), 0, 0, 0, g).receiveShadow = true

  }

  /** Swing angle (radians, + forward over the void) for the real and the ghost swing. */
  private angles(d: Dir) {
    const { seg, u, f } = d
    const t = f.time
    const sGate = (f.p - at('choose', 0.3)) * TOTAL_SCREENS
    const s1 = (at('grows', 0.2) - at('choose', 0.3)) * TOTAL_SCREENS
    const s2 = (at('grows', 0.5) - at('choose', 0.3)) * TOTAL_SCREENS
    const s3 = (at('grows', 0.76) - at('choose', 0.3)) * TOTAL_SCREENS
    const phase = (s: number) => {
      if (s <= s1) return PI + (3 * PI * s) / s1
      if (s <= s2) return 4 * PI + (2 * PI * (s - s1)) / (s2 - s1)
      return 6 * PI + (2 * PI * (s - s2)) / (s3 - s2)
    }
    let real = 0
    let ghost: number | null = null
    switch (seg) {
      case 'swing':
        real = 25 * DEG * Math.sin(W * t)
        break
      case 'feet':
        // A gentle sway: the feet stay out over the void even at the back of the arc.
        real = 10 * DEG * Math.sin(W * t)
        break
      case 'arc':
        real = -40 * DEG * Math.cos((2 * PI * (u - 0.2)) / 0.6)
        break
      case 'rope':
        real = 40 * DEG * Math.sin(W * t + 1)
        break
      case 'choose':
      case 'grows': {
        if (seg === 'choose' && u < 0.3) {
          real = 40 * DEG * Math.cos((PI * u) / 0.3)
          break
        }
        const ph = phase(Math.max(0, sGate))
        const grow = (40 + 12 * ss(0, s1, sGate)) * DEG
        if (d.stop) {
          real = (40 - 25 * ss(0, s1 + 0.4, sGate)) * DEG * Math.cos(ph)
          ghost = grow * Math.cos(ph)
        } else real = grow * Math.cos(ph)
        break
      }
      case 'still':
        real = (d.stop ? 8 : 50) * DEG * Math.sin(W * t)
        break
      case 'end':
        real = (d.stop ? 5 : 50) * DEG * Math.sin(W * t)
        break
    }
    return { real, ghost, sGate, peaks: [s1, s2, s3] }
  }

  /** The seat frame's world matrix for swing angle θ. */
  private seatAt(theta: number, out: THREE.Matrix4) {
    // Rotation about the pivot's x axis; the seat hangs ROPE below the pivot.
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    out.makeRotationX(theta)
    out.setPosition(PIVOT.x, PIVOT.y - ROPE * c, PIVOT.z - ROPE * s)
    return out
  }

  /** The man seated on a swing at angle θ (velocity sign drives the pumping legs). */
  private seatMan(a: Actor, theta: number, amp: number, frame: THREE.Matrix4, time: number, breathe = true) {
    const k = amp > 0.01 ? clamp(0.5 + (0.5 * theta) / amp) : 0.5
    a.begin()
    a.place(0, 0.02, PI)
    a.y = -0.47
    a.blend(
      [
        [0, PP.SWING_BACK],
        [0.5, PP.SWING_SIT],
        [1, PP.SWING_FWD],
      ],
      k,
    )
    a.apply(time, breathe)
    // Fists closed round the ropes (canonical seat space: ropes vertical at x ±0.3), thumbs up.
    gripLine(a.figure, 'l', this.tmpG.set(-0.3, 0.7, 0), UP, FWD, 0.35)
    gripLine(a.figure, 'r', this.tmpG.set(0.3, 0.7, 0), UP, FWD, 0.35)
    carry(a.figure, frame)
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    // Light: dusk, the sun from −x just above the far hills; it sinks through the chapter.
    const fromBelow = (seg === 'rope' && u >= 0.49) || seg === 'end'
    const late = seg === 'grows' || seg === 'still' || seg === 'end' ? ss(0, 1, seg === 'grows' ? u * 0.5 : seg === 'still' ? 0.5 + u * 0.2 : 0.7 + u * 0.3) : 0
    const el = lerp(3.2, 0.6, late) * DEG
    const sd = sunDir(-PI / 2 - 0.3, el)
    env.sky.mix(DUSK, DUSK_LATE, late, sd)
    env.setSun(new THREE.Vector3(1001, 1, 1), sd, 0xffb46a, lerp(2.6, 1.4, late), 14)
    env.sun.color.lerp(this.lateSun, late)
    env.setHemi(0x76779a, 0x2a2633, fromBelow ? 0.28 : 0.6)
    // Sky fill from the open valley side; the void's point of view keeps the wall a dark silhouette.
    env.setFill(new THREE.Vector3(1000, 30, -200), new THREE.Vector3(1000, 0, 0), 0x6f7fb0, fromBelow ? 0.08 : 0.25)
    env.setFog(0x6c6886, 0.00085)
    env.ibl('belfast_sunset_puresky', fromBelow ? 0.07 : 0.45, PI)
    // The last sun climbs the far ridge and leaves it at the end.
    this.shared.uSunLine.value = seg === 'open' ? -60 : seg === 'today' ? -30 : seg === 'end' ? lerp(80, 260, ss(0, 0.55, u)) : seg === 'grows' ? lerp(0, 60, u) : seg === 'still' ? 70 : -20
    // Wind in grass and leaves.
    const gust = seg === 'rope' ? ss(0.16, 0.3, u) : 0
    const wind = seg === 'rope' ? 0.35 + 1.1 * gust : seg === 'grows' ? 0.7 : 0.35
    this.grassU.uTime.value = t
    this.grassU.uWind.value = wind * 0.25
    this.grassU.uLean.value = gust * 0.25
    this.leafWind(t, wind)

    const showSwing = seg !== 'open' && seg !== 'today'
    this.swing.visible = showSwing
    this.ghostSwing.visible = false
    const { real, ghost, sGate, peaks } = this.angles(d)
    this.pivot.rotation.x = real
    this.seatAt(real, this.seatM)
    const man = cast.solids.man

    switch (seg) {
      case 'open': {
        // Straight down from the swing's forward point; the look sways like a pendulum.
        const sway = f.reduced ? 0 : Math.sin((t * 2 * PI) / 5.5)
        const z = -1.6 + sway * 1.0
        shot.pos.set(1000, 1.3 + Math.abs(sway) * 0.08, z)
        shot.tgt.set(1000.4, -400, z + 0.35)
        shot.fov = 50
        shot.handheld = 0
        break
      }
      case 'today': {
        man.begin()
        const wu = u < 0.7 ? ss(0, 0.7, u) * 0.82 : 0.82 + 0.18 * ss(0.84, 1.0, u)
        // He stops for breath (feet together) and looks down the slope.
        const halt = u > 0.6 && u < 0.9 ? win(0.62, 0.7, 0.82, 0.88, u) : 0
        man.walk(this.path, wu, PP.POCKETS, undefined, undefined, 0.9 * (1 - halt))
        man.y = this.groundAt(man.x, man.z)
        if (halt > 0) {
          man.walking *= 1 - halt
          man.lookAt(1040, 70, win(0.7, 0.76, 0.84, 0.9, u))
        }
        man.apply(t, true)
        d.step = man.step
        d.walking = man.walking
        if (u > 0.68 && u < 0.86) man.figure.joints.chest.rotation.x += 0.05 * Math.sin(t * 4) * win(0.7, 0.74, 0.82, 0.86, u)
        const bx = man.x
        const bz = man.z
        const by = man.y
        if (cu < 0.45) {
          // Behind him and low: the man climbing alone in the lower frame, the old tree on the ridge above.
          shot.pos.set(bx + 2.4, by + 0.5, bz + 8)
          shot.tgt.set(bx + (1002 - bx) * 0.25, by + 1.0 + (6 - by - 1.0) * 0.25, bz + (2 - bz) * 0.25)
          shot.fov = 42
        } else {
          shot.pos.set(bx + 6, by + 1.5, bz - 0.5)
          shot.tgt.set(bx, by + 1.45, bz)
          shot.fov = 35
        }
        break
      }
      case 'swing':
      case 'feet':
      case 'arc':
      case 'rope':
      case 'choose':
      case 'grows':
      case 'still':
      case 'end': {
        const amp = seg === 'arc' || seg === 'rope' ? 40 * DEG : Math.max(Math.abs(real), 25 * DEG)
        this.seatMan(man, real, amp, this.seatM, t)
        if (d.stop && ghost !== null) this.ghostRide(d, ghost, sGate, peaks)
        else if (!d.stop && (seg === 'grows' || seg === 'still' || (seg === 'choose' && u > 0.3))) this.ghostLetGo(d, sGate, peaks)
        this.camera(d, real)
        break
      }
    }
  }

  /** [on]: at each forward peak a translucent man lets go and falls away. */
  private ghostLetGo(d: Dir, sGate: number, peaks: number[]) {
    const { cast, f } = d
    peaks.forEach((sk, k) => {
      const g = k % 2 === 0 ? cast.ghosts.man1 : cast.ghosts.man2
      const tau = sGate - sk
      if (tau < -0.002 || tau > 0.95) return
      const theta = (40 + 12) * DEG
      this.seatAt(theta, this.releaseM[k])
      cast.ghost(
        g,
        tau,
        (a, uu) => this.fallPose(a, uu, this.releaseM[k], f.time),
        f.time,
        { flash: tau < 0.05 ? 1 - tau / 0.05 : 0, trail: 0.03, after: (a) => this.fallCarry(a, tau, this.releaseM[k]) },
      )
    })
  }

  /** [stop]: a ghost swing keeps going at full height; its rider lets go at each forward peak. */
  private ghostRide(d: Dir, theta: number, sGate: number, peaks: number[]) {
    const { cast, f } = d
    this.ghostSwing.visible = true
    this.gPivot.rotation.x = theta
    const splitFlash = sGate >= 0 && sGate < 0.05 ? 1 - sGate / 0.05 : 0
    this.ghostSwingMat.uniforms.uOpacity.value = 0.32
    this.ghostSwingMat.uniforms.uFlash.value = splitFlash
    // Which peak was the last one passed: the rider who is not falling sits on the ghost swing.
    let last = -1
    peaks.forEach((sk, k) => {
      if (sGate >= sk) last = k
    })
    const riderKey = last < 0 ? 'man1' : last % 2 === 0 ? 'man2' : 'man1'
    const rider = cast.ghosts[riderKey]
    const sinceLast = last < 0 ? 9 : sGate - peaks[last]
    const fadeIn = last < 0 ? 1 : ss(0.15, 0.45, sinceLast)
    const m = this.seatAt(theta, new THREE.Matrix4())
    cast.ghost(
      rider,
      0,
      (a) => {
        this.seatMan(a, theta, 52 * DEG, m, f.time, false)
        return 0.32 * fadeIn
      },
      f.time,
      { flash: splitFlash },
    )
    // The one letting go.
    peaks.forEach((sk, k) => {
      const tau = sGate - sk
      if (tau < -0.002 || tau > 0.95) return
      const g = k % 2 === 0 ? cast.ghosts.man1 : cast.ghosts.man2
      if (g === rider) return
      this.seatAt(52 * DEG, this.releaseM[k])
      cast.ghost(g, tau, (a, uu) => this.fallPose(a, uu, this.releaseM[k], f.time), f.time, { flash: tau < 0.05 ? 1 - tau / 0.05 : 0, trail: 0.03, after: (a) => this.fallCarry(a, tau, this.releaseM[k]) })
    })
  }

  private fallState = new WeakMap<Actor, number>()
  private lateSun = new THREE.Color(0xff8a4a)

  /** Pose of a falling man, `uu` screens after letting go; returns opacity. */
  private fallPose(a: Actor, uu: number, release: THREE.Matrix4, time: number) {
    void release
    void time
    a.place(0, 0.02, PI)
    a.y = -0.47
    a.blend(
      [
        [0, PP.SWING_FWD],
        [0.06, PP.LET_GO],
        [0.3, PP.FALL],
      ],
      Math.max(0, uu),
    )
    if (uu < 0.04) {
      a.reach('l', 1 - uu / 0.04, -0.3, 0.78, 0, 0.3)
      a.reach('r', 1 - uu / 0.04, 0.3, 0.78, 0, 0.3)
    }
    this.fallState.set(a, uu)
    const sec = Math.max(0, uu) * FALL_SPEED
    const y = 2.27 + 1.5 * sec - 4.9 * sec * sec
    return 0.32 * (1 - ss(-120, -200, y))
  }

  private fallFrame = new THREE.Matrix4()
  /** Carries a falling man along his arc out over the valley, turning slowly. */
  private fallCarry(a: Actor, _tau: number, release: THREE.Matrix4) {
    const uu = this.fallState.get(a) ?? 0
    const sec = Math.max(0, uu) * FALL_SPEED
    const dz = -4.2 * sec
    const dy = 1.5 * sec - 4.9 * sec * sec
    const spin = -0.55 * sec
    const fr = this.fallFrame
    // Turn about the body's middle (≈ 0.4 m above the seat), then move along the arc.
    const t1 = new THREE.Matrix4().makeTranslation(0, -0.4, 0)
    const r = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(spin, 0, 0.18 * sec))
    const t2 = new THREE.Matrix4().makeTranslation(0, 0.4, 0)
    fr.copy(release).multiply(t2).multiply(r).multiply(t1)
    const shift = new THREE.Matrix4().makeTranslation(0, dy, dz)
    fr.premultiply(shift)
    carry(a.figure, fr)
  }

  private camera(d: Dir, theta: number) {
    const { seg, cu, u, shot, f } = d
    const v = this.tmpV
    const seatFrame = this.seatM
    switch (seg) {
      case 'swing':
      case 'arc':
      case 'end':
        keyed(SHOTS[seg]!, cu, shot)
        if (seg === 'end') shot.handheld = 0.3
        // The centred line sits in the middle of the frame: keep the man right of it.
        if (seg === 'swing') this.aimLeft(shot, 0.3 * shot.pos.distanceTo(shot.tgt))
        break
      case 'feet': {
        // Riding the seat, just behind it and at his left, under the plank: his sneakers at the top
        // of the frame, the valley 400 m below them, swinging with the seat.
        v.set(-0.3, -0.1, 0.35).applyMatrix4(seatFrame)
        shot.pos.copy(v)
        this.tmpT.set(0, -0.53, -0.848).applyMatrix4(this.rotOnly.extractRotation(seatFrame))
        shot.tgt.copy(v).addScaledVector(this.tmpT, 50)
        shot.fov = 55
        shot.handheld = 0
        break
      }
      case 'rope': {
        if (u < 0.49) {
          // The rope's turns round the branch, from below and to the side: the other rope beyond.
          const k = held(ss(0, 0.49, u), f.reduced)
          shot.pos.set(1000.95 - 0.1 * k, 4.18 + 0.04 * k, 0.48 - 0.08 * k)
          shot.tgt.set(1000.22, 4.6, -0.42)
          shot.fov = 30
          shot.handheld = 0.3
        } else {
          // The void's point of view: from the valley floor, up the dark wall to the swing on the sky.
          const k = held(ss(0.49, 1, u), f.reduced)
          // (far enough out that the swing stays above the rim even at the back of its arc)
          shot.pos.set(984 + 2 * k, -300, -430)
          shot.tgt.set(991.5, -1.5, -0.4)
          shot.fov = 6
          shot.handheld = 0
        }
        break
      }
      case 'choose': {
        // Side-on at seat height from the ledge (+x): the rock and tree to the left, the void to the right.
        shot.pos.set(1005.6, 1.45, 0.1)
        shot.tgt.set(1000, 1.65, -0.5)
        shot.fov = 45
        shot.handheld = 0.3
        break
      }
      case 'grows': {
        if (u < 0.6) {
          const k = ss(0, 0.6, held(u, f.reduced))
          shot.pos.set(1000, 7.0, 4.2 - 3.0 * k)
          shot.tgt.set(1000, -400, -300)
          shot.fov = lerp(38, 60, k)
        } else {
          const k = ss(0.6, 1, held(u, f.reduced))
          shot.pos.set(1012 - k * 0.6, 0 - k * 0.5, -14 + k * 0.6)
          shot.tgt.set(1000, 1 - k * 2, -1 - k * 2)
          shot.fov = 50
        }
        shot.handheld = 0.2
        break
      }
      case 'still': {
        v.set(0.7, 0.55, -1.1).applyMatrix4(seatFrame)
        shot.pos.copy(v)
        this.tmpT.set(0, 0.72, 0.02).applyMatrix4(seatFrame)
        shot.tgt.copy(this.tmpT)
        shot.fov = 35
        shot.handheld = 0
        // "Ve ben hâlâ buradayım." sits in the middle: his face goes to the right of it.
        this.aimLeft(shot, 0.36)
        break
      }
    }
    void theta
  }

  /** Turns the look `d` metres to the camera's left at the target (the subject moves right in frame). */
  private aimLeft(shot: { pos: THREE.Vector3; tgt: THREE.Vector3 }, d: number) {
    const fx = shot.tgt.x - shot.pos.x
    const fz = shot.tgt.z - shot.pos.z
    const l = Math.hypot(fx, fz) || 1
    shot.tgt.x += (fz / l) * d
    shot.tgt.z += (-fx / l) * d
  }

  private leafM = new THREE.Matrix4()
  private leafQ = new THREE.Quaternion()
  private leafE = new THREE.Euler()
  private leafWind(t: number, wind: number) {
    const im = this.leaves
    const p = new THREE.Vector3()
    const q = new THREE.Quaternion()
    const s = new THREE.Vector3()
    for (let i = 0; i < this.leafBase.length; i++) {
      this.leafBase[i].decompose(p, q, s)
      const ph = t * (2.2 + (i % 7) * 0.3) + i
      this.leafE.set(Math.sin(ph) * 0.25 * wind, Math.sin(ph * 1.7) * 0.4 * wind, Math.cos(ph * 1.3) * 0.25 * wind)
      this.leafQ.setFromEuler(this.leafE).premultiply(q)
      p.x += Math.sin(ph * 0.8) * 0.06 * wind
      this.leafM.compose(p, this.leafQ, s)
      im.setMatrixAt(i, this.leafM)
    }
    im.instanceMatrix.needsUpdate = true
  }

  /** Ground height at (x, z) on the plateau (for walkers). */
  groundAt(x: number, z: number) {
    return hPlateau(x, z)
  }
}

/** Laid rope: three strands twisting round the line (diagonal grooves that wrap as a helix). */
function ropeTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#c9b48e'
  g.fillRect(0, 0, 64, 64)
  for (let s = 0; s < 3; s++)
    for (const off of [-64, 0, 64]) {
      const y = (s * 64) / 3 + off
      const grad = g.createLinearGradient(0, y, 0, y + 21)
      grad.addColorStop(0, '#7d6a4e')
      grad.addColorStop(0.2, '#b29d78')
      grad.addColorStop(0.55, '#d2bf98')
      grad.addColorStop(0.88, '#a8926c')
      grad.addColorStop(1, '#7d6a4e')
      g.fillStyle = grad
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(64, y + 64)
      g.lineTo(64, y + 64 + 21.3)
      g.lineTo(0, y + 21.3)
      g.closePath()
      g.fill()
    }
  // Fibre speckle.
  const r = rng(77)
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '60,45,30' : '235,220,190'},0.25)`
    g.fillRect(r() * 64, r() * 64, 1 + r() * 2, 1)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}
