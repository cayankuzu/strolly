/**
 * TAKINTI — one old house, one night and the morning after.
 *
 * The set is built once (house.ts, sewing.ts, rooms.ts); cuts are camera
 * jumps inside it. Night is lit only by two street lamps: lamp A (low, across
 * the street) lays the hard band of light in the sewing room; lamp B (tall)
 * lays the blind's bars upstairs. A cheat light by the window throws the
 * mother's shadow, enormous, up the north wall. Dawn re-aims the same key as
 * a low sun; morning is flat and ordinary.
 *
 * Restraint (docs/stories/takinti.md §8): the body is a dark matte shape,
 * never lit frontally or framed close; the "pieces" are pale matte cloth; the
 * mother's face is never seen; blood is near-black streaks and pools.
 *
 * Everything is a pure function of progress `p` (and of the door choice),
 * apart from the machine's rhythm, which runs on the clock.
 */
import * as THREE from 'three'
import { SEG, at, local, segmentAt, type SegmentId } from '@/stories/takinti/timeline'
import { angleLerp, clamp, easeInOutSine, lerp, linear, smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { JOINTS, type JointName, type Pose } from '../figure/Figure'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed } from '../kit/direct'
import { disposeTree, mesh } from '../util'
import { castPalette, createCast, hangHair, plateTilt, bump, FLOOR_LIE, FLOOR_SIT, FREEZE_DOWN, HOLD_LOW, KNEEL_TURN, KNEEL_WIPE, LIE_BACK, PEER, PURPOSE, RUB_EYES, SEW, SEW_TENDER, SHOUT, SINK, SIT_EDGE, SIT_LONG, SIT_SAD, STAMP, AT_BOWL, type Cast } from './cast'
import { buildHouse, housePalette, STAIR, UP, type House } from './house'
import { boysRoom, kitchen, linenCupboard, MATTRESS, ragTexture, toilet, type BoysRoom, type Cupboard, type Kitchen, type Toilet } from './rooms'
import { clothPile, dressForm, lace, marks, pieces, runMachine, scissors, sewingTable, stool, type Machine, type Marks, type Pieces } from './sewing'
import { CALL_SHOTS, SHOTS } from './shots'
import { sky, type Sky } from './sky'
import { wallShadow, type WallShadow } from './wallShadow'

const PI = Math.PI
/** Lamp A's band through the sewing-room window (cd) and the wall patch's brightness (0–1). */
const BAND = 900
const WALL_I = 0.8
/** Segments in which the boy is on the upper floor. */
const UPSTAIRS = new Set<SegmentId>(['street', 'wake', 'hall', 'toilet', 'voice', 'landing', 'wakeup', 'brother', 'games'])
const STOOL = { x: 4.05, z: -2.4 }
/** Morning: the boy in the kitchen doorway (left of its centre) and the mother on her knees, back to him. */
const BOY_K = { x: -0.3, z: -7.3 }
/** In the hallway, looking through the half-open door (shadow); on the threshold's south side (CALL). */
const AT_GAP = { x: 0.1, z: -0.4 }
const AT_SILL = { x: 0.6, z: -0.78 }
/** IN: two steps inside the room, a little north of the door line (clear of the camera's view of her). */
const IN_SPOT = { x: 1.6, z: -1.72 }
const GAP_LOOK = { x: 1.6, z: -2.6 }
const MOM_K = { x: -0.5, z: -9.2 }
const NEEDLE = new THREE.Vector3(4.588, 0.81, -2.405)
/** Where the body first sits (back to the north wall) and where it ends, lying. */
const BODY_Z = -4.12
const BODY_YAW = -0.42

// ——— Paths ———

const P_WAKE = makePath([
  [3.2, -3.15],
  [2.3, -3.0],
  [1.45, -2.45],
  [0.95, -1.6],
])
const P_HALL = makePath([
  [0.95, -1.6],
  [0.35, -1.62],
  [-0.42, -1.98],
])
const P_HALL_ON = makePath([
  [-0.42, -1.98],
  [-0.48, -2.55],
  [-0.62, -2.9],
])
const P_TOILET = makePath([
  [-0.62, -2.9],
  [-1.15, -2.95],
  [-1.65, -3.6],
  [-1.72, -3.88],
])
const P_LANDING = makePath([
  [-1.05, -2.95],
  [-0.35, -2.55],
  [0.08, -1.4],
  [0.1, 3.0],
  [-0.15, 4.75],
  [-0.9, 5.08],
  [-1.25, 4.98],
])
const P_ANGER = makePath([
  [-1.15, 1.47],
  [-1.12, 1.0],
  [-0.75, 0.62],
  [-0.15, 0.4],
  [0.05, 0.05],
  [0.08, -0.25],
])
const P_IN = makePath([
  [0.5, -0.98],
  [1.0, -1.22],
  [IN_SPOT.x, IN_SPOT.z],
])
const P_CALL = makePath([
  [0.3, -0.45],
  [0.5, -0.65],
  [0.6, -0.78],
])
const P_OUT_IN = makePath([
  [IN_SPOT.x, IN_SPOT.z],
  [1.0, -1.22],
  [0.5, -1.0],
])
const P_UP = makePath([
  [0.5, -1.0],
  [0.15, -0.2],
  [-0.45, 0.55],
  [-1.05, 0.85],
  [-1.2, 1.6],
])
/** Where he stands at the TV cabinet in the morning. */
const PAD_SPOT = { x: 1.62, z: -3.05 }
const P_GAMES = makePath([
  [3.2, -3.2],
  [2.3, -3.1],
  [PAD_SPOT.x, PAD_SPOT.z],
])
const P_TODOOR = makePath([
  [PAD_SPOT.x, PAD_SPOT.z],
  [1.15, -1.95],
  [0.85, -1.6],
])
const P_RUSH = makePath([
  [-1.2, 4.62],
  [-1.2, 1.0],
  [-0.85, 0.45],
  [-0.35, 0.1],
])
const P_PASS = makePath([
  [-0.35, 0.1],
  [0.05, -0.6],
  [0.0, -4.0],
  [0.0, -7.25],
])

// ——— Small helpers ———

const idx = (j: JointName) => 2 + JOINTS.indexOf(j) * 3
/** Adds to a pose's joint rotation in place (after blending, before apply). */
function addRot(pose: Pose, j: JointName, x: number, y = 0, z = 0) {
  const i = idx(j)
  pose[i] += x
  pose[i + 1] += y
  pose[i + 2] += z
}

/** Smooth height of a body walking on the flight (hips descend smoothly). */
const flightY = (z: number) => clamp(((z - STAIR.z0) / STAIR.run + 0.5) * STAIR.rise, 0, UP)

/** The handrail's height over a point z of the flight. */
const railY = (z: number) => 0.92 + (z - STAIR.z0) * (UP / (STAIR.n * STAIR.run)) + 0.02

const yawTo = (fx: number, fz: number, tx: number, tz: number) => Math.atan2(tx - fx, tz - fz)

/** A quick press: 0 → 1 → 0 between a and b, sharp attack. */
const press = (u: number, at0: number, len = 0.06) => {
  const t = (u - at0) / len
  return t < 0 || t > 1 ? 0 : Math.sin(Math.pow(t, 0.5) * PI)
}

type Lights = {
  hemi: THREE.HemisphereLight
  keyA: THREE.SpotLight
  keyB: THREE.SpotLight
  pointA: THREE.PointLight
  pointB: THREE.PointLight
  glow: THREE.PointLight
}

class TakintiDirector implements SetDirector {
  private pal = housePalette()
  private cpal = castPalette()
  private house!: House
  private boys!: BoysRoom
  private cup!: Cupboard
  private toi!: Toilet
  private kit!: Kitchen
  private machine!: Machine
  private dress!: THREE.Group
  private heapNight!: THREE.Group
  private heapMorning!: THREE.Group
  private sc!: ReturnType<typeof scissors>
  private pcs!: Pieces
  private mk!: Marks
  private cast!: Cast
  private boy!: Actor
  private mom!: Actor
  private body!: Actor
  private L!: Lights
  private lampA: THREE.Object3D | null = null
  private lampAGlass: THREE.Mesh[] = []
  private lampBulb!: THREE.MeshBasicMaterial
  private underDoor!: THREE.Mesh
  private underGlow!: THREE.Mesh
  private flies!: THREE.InstancedMesh
  private moths!: THREE.InstancedMesh
  private wall!: WallShadow
  private envNight: THREE.Texture | null = null
  private envDay: THREE.Texture | null = null
  private fallbackEnv!: THREE.Texture
  private scene!: THREE.Scene
  private bg = new THREE.Color()
  private skyDome!: Sky
  private laceMesh!: THREE.Mesh
  private flag!: THREE.Mesh
  private cA = new THREE.Color()
  private cB = new THREE.Color()
  private cC = new THREE.Color()
  private stitch = 0
  private stitchCount = 0
  private machineRun = 0
  private padAt = new THREE.Vector3()
  private phaseNow = 0
  private slamNow = 0
  private surface = 0
  private extra: THREE.Material[] = []

  async build(scene: THREE.Scene, ctx: BuildContext) {
    this.scene = scene
    // QA only: the director, for inspecting positions from the console.
    if (process.env.NODE_ENV !== 'production') (globalThis as { __tak?: unknown }).__tak = this
    this.fallbackEnv = ctx.environment
    scene.background = this.bg.set(0x05080f)
    const [envNight, envDay, models] = await Promise.all([
      ctx.hdri('abandoned_tiled_room'),
      ctx.hdri('hospital_room_2'),
      ctx.models({
        lamp: ['street_lamp_01', { height: 5.3 }],
        bed: ['old_bed_frame'],
        cabinet: ['painted_wooden_cabinet'],
        chair: ['painted_wooden_chair_01'],
        table: ['painted_wooden_table'],
        pot: ['pot_enamel_01'],
        kettle: ['vintage_electric_kettle'],
        basket: ['wicker_basket_01', { scale: 1.35 }],
        broom: ['plastic_broom'],
      }),
    ])
    this.envNight = envNight
    this.envDay = envDay
    scene.environment = envNight ?? ctx.environment
    scene.environmentIntensity = 0.03

    // ——— The house and the street ———
    const house = (this.house = buildHouse(scene, this.pal))
    this.skyDome = sky()
    scene.add(this.skyDome.mesh)
    this.lampBulb = house.lampBulbs[0].material as THREE.MeshBasicMaterial
    if (models.lamp) {
      const lamp = models.lamp
      lamp.position.set(12.6, 0.12, 3.3)
      lamp.rotation.y = 0.5
      lamp.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.castShadow = false
        const mats = ([] as THREE.Material[]).concat(m.material)
        if (mats.some((mm) => mm.name.includes('glass'))) this.lampAGlass.push(m)
      })
      house.street.add(lamp)
      this.lampA = lamp
    } else {
      // Stand-in: a plain post lamp.
      const g = new THREE.Group()
      g.position.set(12.6, 0.12, 3.3)
      mesh(new THREE.CylinderGeometry(0.06, 0.1, 4.6, 12), this.pal.lampPole, 0, 2.3, 0, g)
      const glass = mesh(new THREE.BoxGeometry(0.3, 0.45, 0.3), new THREE.MeshBasicMaterial({ color: 0xe9fff2 }), 0, 4.85, 0, g)
      this.lampAGlass.push(glass)
      house.street.add(g)
    }
    // Lamp A's glass glows at night (its own material, so the switch-off is ours).
    for (const m of this.lampAGlass) {
      const src = m.material as THREE.MeshStandardMaterial
      const glow = src.clone ? (src.clone() as THREE.MeshStandardMaterial) : new THREE.MeshStandardMaterial()
      if ('emissive' in glow) {
        glow.emissive = new THREE.Color(0xdff5e8)
        glow.emissiveIntensity = 3
      }
      m.material = glow
      this.extra.push(glow)
    }

    // ——— Rooms ———
    this.boys = boysRoom({ bed: models.bed, chair: models.chair })
    scene.add(this.boys.group)
    this.cup = linenCupboard()
    scene.add(this.cup.group)
    this.toi = toilet()
    scene.add(this.toi.group)
    const ragTex = ragTexture()
    this.kit = kitchen({ table: models.table, chair: models.chair, pot: models.pot, kettle: models.kettle, broom: models.broom, cabinet: models.cabinet }, ragTex)
    scene.add(this.kit.group)

    // ——— The sewing room ———
    this.machine = sewingTable()
    scene.add(this.machine.group)
    const st = stool()
    st.position.set(STOOL.x - 0.05, 0, STOOL.z)
    scene.add(st)
    this.dress = dressForm()
    this.dress.position.set(1.3, 0, -3.95)
    this.dress.rotation.y = 0.6
    scene.add(this.dress)
    // The heap of clothes beside the stool (night) and, in the morning, the long mound by the wall.
    const heapColors = [0x6d5a5f, 0x51606e, 0x7b6a4e, 0x4d4a44, 0x8a6f63, 0x5a6650, 0x3f3b44]
    this.heapNight = clothPile(5, 0.6, 0.4, 0.45, heapColors, ['fabric', 'knit', 'denim'])
    this.heapNight.position.set(3.75, 0, -1.3)
    scene.add(this.heapNight)
    this.heapMorning = clothPile(9, 1.0, 0.42, 0.55, heapColors, ['fabric', 'knit', 'denim'])
    this.heapMorning.position.set(2.45, 0, -3.95)
    scene.add(this.heapMorning)
    // The sideboard against the south wall, a folded stack on it; the basket of cut rags.
    if (models.cabinet) {
      const sb = models.cabinet.clone(true)
      sb.position.set(2.5, 0, -0.72)
      sb.rotation.y = PI
      scene.add(sb)
      const folded = clothPile(14, 0.25, 0.18, 0.2, [0x8c7d6a, 0x6c5a52, 0x9a958a], ['fabric', 'knit'])
      folded.position.set(2.3, 1.18, -0.72)
      scene.add(folded)
    }
    if (models.basket) {
      models.basket.position.set(4.55, 0, -0.78)
      models.basket.rotation.y = 0.3
      scene.add(models.basket)
      const rags = clothPile(21, 0.2, 0.15, 0.1, [0x8a6f63, 0x51606e, 0xb3a58b, 0x6d5a5f], ['fabric'])
      rags.position.set(4.55, 0.1, -0.78)
      scene.add(rags)
    }
    // Lace on the window's north half, a rod above it.
    const lc = (this.laceMesh = lace(0.62, 1.3))
    // A flag (as on a film set): invisible, it only casts shadow, keeping the
    // street lamp off the north-east corner where the body sits; only its feet
    // are reached by the light through the window's south half.
    const flagMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide })
    this.extra.push(flagMat)
    this.flag = mesh(new THREE.PlaneGeometry(0.86, 1.5), flagMat, 5.14, 1.52, -2.55, scene)
    this.flag.rotation.y = PI / 2
    this.flag.castShadow = true
    lc.rotation.y = -PI / 2
    // (Its hem hangs a hand's breadth above the sewing table.)
    lc.position.set(4.93, 1.6, -2.6)
    scene.add(lc)
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.4, 8), this.pal.brass, 4.94, 2.3, -2.3, scene).rotation.x = PI / 2
    this.sc = scissors()
    scene.add(this.sc.group)
    this.pcs = pieces()
    scene.add(this.pcs.group)
    this.mk = marks()
    // The streaks are drawn over the wall's light patch (an additive decal), never washed out by it.
    this.mk.wall.renderOrder = 2
    scene.add(this.mk.wall, ...this.mk.pools, ...this.mk.wiped)
    // A thin line of light under the closed door (hallway side).
    this.underDoor = mesh(new THREE.PlaneGeometry(0.035, 0.88), new THREE.MeshBasicMaterial({ color: 0x9fb5ac, transparent: true, opacity: 0 }), 0.775, 0.003, -1.15, scene)
    this.underDoor.rotation.x = -PI / 2
    this.underDoor.name = 'underDoor'
    // …and its faint fan on the hallway boards (additive, fading away from the door).
    const fan = document.createElement('canvas')
    fan.width = 64
    fan.height = 8
    const fg = fan.getContext('2d')!
    const grad = fg.createLinearGradient(0, 0, 64, 0)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    fg.fillStyle = grad
    fg.fillRect(0, 0, 64, 8)
    const fanTex = new THREE.CanvasTexture(fan)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x6f8580, map: fanTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    this.extra.push(glowMat)
    this.underGlow = mesh(new THREE.PlaneGeometry(0.42, 0.86), glowMat, 0.585, 0.004, -1.15, scene)
    this.underGlow.rotation.set(-PI / 2, 0, PI)
    this.underGlow.name = 'underGlow'
    // Flies turning in the morning sun.
    this.flies = new THREE.InstancedMesh(new THREE.SphereGeometry(0.006, 6, 4), new THREE.MeshBasicMaterial({ color: 0x0c0a08 }), 14)
    this.flies.frustumCulled = false
    scene.add(this.flies)
    // A few moths around lamp A's lantern at night.
    this.moths = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: 0xc9d6cc }), 7)
    this.moths.frustumCulled = false
    scene.add(this.moths)

    // ——— Cast ———
    this.cast = createCast(this.cpal)
    const c = this.cast
    scene.add(c.boy.root, c.mother.root, c.body.root, c.skirt.mesh, ...c.hairSides)
    this.boy = new Actor(c.boy)
    this.mom = new Actor(c.mother)
    this.body = new Actor(c.body)

    // ——— Light ———
    const hemi = new THREE.HemisphereLight(0x1d2738, 0x06080b, 0.3)
    const keyA = new THREE.SpotLight(0xcfe3d6, 0, 0, 0.16, 0.25, 2)
    keyA.castShadow = ctx.quality.shadows
    keyA.shadow.mapSize.set(2048, 2048)
    keyA.shadow.camera.near = 1.5
    keyA.shadow.camera.far = 30
    keyA.shadow.bias = -0.0003
    keyA.shadow.normalBias = 0.02
    const keyB = new THREE.SpotLight(0xcfe3d6, 0, 0, 0.3, 0.05, 2)
    keyB.castShadow = ctx.quality.shadows
    keyB.shadow.mapSize.set(1024, 1024)
    keyB.shadow.camera.near = 0.2
    keyB.shadow.camera.far = 20
    keyB.shadow.bias = -0.0004
    keyB.shadow.normalBias = 0.02
    const pointA = new THREE.PointLight(0xa9c3c4, 0, 7, 2)
    const pointB = new THREE.PointLight(0x8ea3c4, 0, 5, 2)
    const glow = new THREE.PointLight(0xcfe3d6, 0, 18, 1.6)
    glow.position.copy(house.lampA)
    scene.add(hemi, keyA, keyA.target, keyB, keyB.target, pointA, pointB, glow)
    this.L = { hemi, keyA, keyB, pointA, pointB, glow }
    // The mother's shadow on the north wall (cookie light, no shadow map).
    this.wall = wallShadow()
    scene.add(this.wall.decal)
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const p = f.p
    const call = f.flags.has('door:call')
    const night = p < at('sunrise', 0.09)
    const morning = p >= SEG.wakeup.start

    // ——— The machine's rhythm (clock-driven; progress decides whether it runs) ———
    const run = this.runState(seg, u)
    const rate = 2.6
    this.machineRun = run
    const before = Math.floor(this.stitch)
    this.stitch += f.dt * rate * run
    if (Math.floor(this.stitch) !== before) this.stitchCount++
    const phase = this.stitch % 1
    this.phaseNow = phase
    // Hard presses (drag, thrice, fall) slam the plate.
    const slam = this.slam(seg, u)
    this.slamNow = slam
    const tilt = run > 0 ? plateTilt(phase) * run : 0
    runMachine(this.machine, phase, tilt + slam * 0.36, -this.stitch * 0.06)

    this.directBoy(f, seg, u, call)
    this.directMother(f, seg, u, phase, run, slam)
    this.directBody(f, seg, u)
    this.dressSet(f, seg, u, call, morning, night)
    this.light(f, seg, u, call)
    this.camera(f, shot, seg, u, call, slam)
  }

  /** 0 stopped … 1 running. */
  private runState(seg: SegmentId, u: number) {
    const p = at(seg, u)
    if (p >= SEG.wakeup.start) return 0
    if (seg === 'thrice') return 0
    if (seg === 'fall') return u < 0.5 ? 0 : smoothstep(0.5, 0.56, u)
    if (seg === 'stitch' && u > 0.48 && u < 0.56) return 0
    return 1
  }

  /** The hard presses: drag u 0.1/0.45/0.8, thrice u 0.06/0.34/0.61, fall u 0.05. */
  private slam(seg: SegmentId, u: number) {
    if (seg === 'drag') return press(u, 0.1) + press(u, 0.45) + press(u, 0.8)
    if (seg === 'thrice') return press(u, 0.06, 0.05) + press(u, 0.34, 0.05) + press(u, 0.61, 0.05)
    if (seg === 'fall') return press(u, 0.03, 0.05) * 1.2
    return 0
  }

  // ——— The boy ———

  private directBoy(f: SetFrame, seg: SegmentId, u: number, call: boolean) {
    const a = this.boy
    a.begin()
    const y0 = UP
    let visible = true
    this.surface = 0
    switch (seg) {
      case 'street':
      case 'wake': {
        const w = seg === 'street' ? 0 : u
        if (w < 0.3) {
          // In bed: lying, then up on his elbows, sitting, turning to the edge.
          const lieX = 3.35
          const sitUp = smoothstep(0.06, 0.16, w)
          const swing = smoothstep(0.16, 0.3, w)
          a.place(lerp(lieX, 3.2, swing), lerp(-3.9, -3.52, swing), angleLerp(-PI / 2, 0, swing))
          a.y = lerp(y0 + MATTRESS - 0.06, y0, swing)
          a.blend(
            [
              [0.0, LIE_BACK],
              [0.06, LIE_BACK],
              [0.16, SIT_LONG],
              [0.3, SIT_EDGE],
            ],
            w,
          )
          if (sitUp < 1) a.look = 0
        } else if (w < 0.43) {
          a.place(3.2, lerp(-3.52, -3.15, smoothstep(0.3, 0.43, w)), 0).blend(
            [
              [0.3, SIT_EDGE],
              [0.43, P.STAND],
            ],
            w,
          )
        } else {
          a.walk(P_WAKE, smoothstep(0.43, 1.0, w), P.STAND, 0, -PI / 2)
          // Fingers brushing the bed as he passes.
          a.reach('l', 0.6 * bump(0.45, 0.6, w), 2.7, y0 + MATTRESS + 0.02, -3.4, 0.3)
        }
        break
      }
      case 'hall':
        if (u < 0.3) a.walk(P_HALL, smoothstep(0, 0.3, u), P.STAND, -PI / 2)
        else if (u < 0.75) {
          // Stopped: head toward the stairwell, a hand on the wall.
          a.place(-0.42, -1.98, yawTo(-0.35, -1.62, -0.2, -1.95))
          a.yaw = -2.6
          a.hold(u < 0.7 ? P.STAND : RUB_EYES)
          a.blend(
            [
              [0.3, P.STAND],
              [0.42, FREEZE_DOWN],
              [0.62, FREEZE_DOWN],
              [0.72, RUB_EYES],
            ],
            u,
          )
          a.lookAt(-1.3, 2.5, 0.9 * bump(0.3, 0.66, u))
          a.reach('l', smoothstep(0.32, 0.42, u) * (1 - smoothstep(0.62, 0.7, u)), -0.76, y0 + 1.12, -2.12, 0.25)
        } else {
          a.walk(P_HALL_ON, smoothstep(0.75, 1, u), RUB_EYES, -2.6, -PI / 2)
          a.blend(
            [
              [0.75, RUB_EYES],
              [0.88, P.STAND],
            ],
            u,
          )
          const w = a.walking
          a.walk(P_HALL_ON, smoothstep(0.75, 1, u), u < 0.86 ? RUB_EYES : P.STAND, -2.6, -PI / 2)
          a.walking = w
        }
        break
      case 'toilet':
        if (u < 0.22) {
          a.walk(P_TOILET, smoothstep(0, 0.22, u), P.STAND, -PI / 2, -PI / 2)
          // The hand passes the switch without pressing it.
          a.reach('r', bump(0.04, 0.14, u) * 0.8, this.toi.switchPlate.x - 0.03, this.toi.switchPlate.y, this.toi.switchPlate.z + 0.05, 0.4)
        } else {
          a.place(-1.72, -3.88, -PI / 2).blend(
            [
              [0.22, P.STAND],
              [0.3, AT_BOWL],
              [0.46, AT_BOWL],
              [0.56, FREEZE_DOWN],
            ],
            u,
          )
        }
        break
      case 'voice':
        // At the sink, hands on its edge, the body turned a little from the mirror (only the first part shows him).
        a.place(-1.22, -3.7, PI + 0.5).hold(SINK)
        a.reach('l', 1, -1.42, y0 + 0.84, -4.05, 0.4)
        a.reach('r', 1, -1.08, y0 + 0.84, -4.05, 0.4)
        // Recognition: the head turns from the mirror toward the floor at his side (the sound below).
        a.lookAt(-2.0, -3.2, 0.6 * smoothstep(0.06, 0.26, u))
        addRot(a.pose, 'head', 0.2 * smoothstep(0.12, 0.32, u))
        // …then a tired clench: the shoulders rise a little.
        addRot(a.pose, 'neck', 0.08 * smoothstep(0.28, 0.4, u))
        break
      case 'landing':
        if (u < 0.08) a.place(-1.05, -2.95, PI / 2).hold(P.STAND)
        else if (u < 0.86) {
          // A steady, decided pace (eased only at the ends), through the bars of light at the boys' door.
          const t = clamp((u - 0.08) / 0.78)
          const s = t < 0.08 ? (t * t) / 0.16 : t > 0.92 ? 1 - ((1 - t) * (1 - t)) / 0.16 : (t - 0.04) / 0.92
          a.walk(P_LANDING, clamp(s), P.STAND, PI / 2, PI)
          // A glance into the open cupboard as he passes it.
          a.lookAt(1.0, 4.05, bump(0.5, 0.72, u))
        } else {
          a.place(-1.25, 4.98, angleLerp(a.yaw, PI, 1)).hold(P.STAND)
          a.reach('l', smoothstep(0.88, 0.96, u), -0.84, y0 + 0.93, 4.55, 0.3)
        }
        break
      case 'descent': {
        // Down the flight step by step, one hand on the rail.
        const zz = lerp(4.68, 1.71, smoothstep(0.02, 0.98, u))
        a.place(-1.12, zz, PI).hold(P.STAND)
        a.y = flightY(zz)
        const stepPh = ((4.68 - zz) / STAIR.run) * PI
        addRot(a.pose, 'lThigh', -0.3 * Math.max(0, Math.sin(stepPh)))
        addRot(a.pose, 'lShin', 0.5 * Math.max(0, Math.sin(stepPh)))
        addRot(a.pose, 'rThigh', -0.3 * Math.max(0, -Math.sin(stepPh)))
        addRot(a.pose, 'rShin', 0.5 * Math.max(0, -Math.sin(stepPh)))
        a.step = Math.floor((4.68 - zz) / STAIR.run)
        a.walking = 0.6 * (u > 0.02 && u < 0.98 ? 1 : 0)
        this.surface = 1
        a.reach('l', 0.85, -0.84, railY(zz - 0.15) + 0.03, zz - 0.15, 0.25)
        a.lookAt(1.0, -1.3, 0.8 * smoothstep(0.5, 0.62, u))
        break
      }
      case 'words': {
        const zz = lerp(1.71, 1.47, smoothstep(0, 0.12, u))
        a.place(-1.12, zz, PI).hold(P.STAND)
        a.y = flightY(zz)
        a.blend(
          [
            [0.0, P.STAND],
            [0.3, FREEZE_DOWN],
            [0.64, FREEZE_DOWN],
            [0.75, P.FISTS],
          ],
          u,
        )
        a.lookAt(1.0, -1.3, 0.55)
        // The grip on the rail tightens; then the free hand closes.
        a.reach('l', 1, -0.84, railY(zz - 0.12) + 0.02 - 0.015 * smoothstep(0.31, 0.36, u), zz - 0.12, 0.25)
        if (u > 0.64) addRot(a.pose, 'rHand', 0.4 * smoothstep(0.64, 0.7, u))
        break
      }
      case 'anger': {
        const s = smoothstep(0, 1, u)
        a.walk(P_ANGER, s, P.STAND, PI, yawTo(0.08, -0.25, GAP_LOOK.x, GAP_LOOK.z), 1.25)
        a.y = a.z > STAIR.z0 - 0.05 ? flightY(a.z) * (a.x < -0.75 ? 1 : 0) : 0
        this.surface = a.z > 0.9 && a.x < -0.75 ? 1 : 0
        addRot(a.pose, 'spine', 0.12)
        break
      }
      case 'shadow':
        if (u < 0.3) a.walk(makePathCached('shadowIn'), smoothstep(0, 0.3, u), P.STAND, undefined, yawTo(AT_GAP.x, AT_GAP.z, GAP_LOOK.x, GAP_LOOK.z))
        else
          a.place(AT_GAP.x, AT_GAP.z, yawTo(AT_GAP.x, AT_GAP.z, GAP_LOOK.x, GAP_LOOK.z)).blend(
            [
              [0.3, P.STAND],
              [0.5, PEER],
            ],
            u,
          )
        break
      case 'enter':
        if (!call) {
          if (u < 0.3) {
            // Two steps up to the door, pushing it open with his left hand.
            const t = smoothstep(0.0, 0.14, u)
            a.place(lerp(AT_GAP.x, 0.5, t), lerp(AT_GAP.z, -0.98, t), yawTo(AT_GAP.x, AT_GAP.z, GAP_LOOK.x, GAP_LOOK.z)).blend(
              [
                [0, PEER],
                [0.12, P.STAND],
              ],
              u,
            )
            a.walking = 0.5 * bump(0, 0.14, u)
            const door = this.doorEdge(this.doorAngle('enter', u, false), 0.6)
            a.reach('l', smoothstep(0.06, 0.12, u) * (1 - smoothstep(0.27, 0.32, u)), door.x - 0.03, 1.0, door.z + 0.02, 0.5)
          } else a.walk(P_IN, smoothstep(0.3, 0.7, u), P.STAND, undefined, yawTo(IN_SPOT.x, IN_SPOT.z, STOOL.x, STOOL.z))
        } else {
          a.walk(P_CALL, smoothstep(0, 0.4, u), P.STAND, undefined, yawTo(AT_SILL.x, AT_SILL.z, GAP_LOOK.x, GAP_LOOK.z))
          const door = this.doorEdge(50, 0.22)
          a.reach('l', smoothstep(0.35, 0.5, u), door.x - 0.03, 1.02, door.z, 0.5)
        }
        break
      case 'shout': {
        const [x, z] = call ? [AT_SILL.x, AT_SILL.z] : [IN_SPOT.x, IN_SPOT.z]
        a.place(x, z, yawTo(x, z, STOOL.x, STOOL.z)).blend(
          [
            [0.0, P.STAND],
            [0.06, SHOUT],
            [0.48, SHOUT],
            [0.54, STAMP],
            [0.62, SHOUT],
          ],
          u,
        )
        if (call) {
          const door = this.doorEdge(50, 0.22)
          a.reach('l', 1 - bump(0.5, 0.62, u), door.x - 0.03, 1.02, door.z, 0.5)
        }
        break
      }
      case 'trance': {
        const [x, z] = call ? [AT_SILL.x, AT_SILL.z] : [IN_SPOT.x, IN_SPOT.z]
        a.place(x, z, call ? yawTo(x, z, GAP_LOOK.x, GAP_LOOK.z) : yawTo(x, z, STOOL.x, STOOL.z)).hold(P.STAND).lookAt(4.6, -2.6, call ? 0 : 0.4)
        if (call) {
          const door = this.doorEdge(50, 0.22)
          a.reach('l', 1, door.x - 0.03, 1.02, door.z, 0.5)
        }
        break
      }
      case 'close': {
        if (u < 0.2) {
          if (!call && u < 0.12) a.walk(P_OUT_IN, smoothstep(0, 0.12, u), P.STAND, undefined, PI / 2 + 0.2)
          else a.place(call ? AT_SILL.x : 0.5, call ? AT_SILL.z : -1.0, PI / 2 + 0.2).hold(P.STAND)
          const ang = this.doorAngle('close', u, call)
          const door = this.doorEdge(ang, 0.82)
          a.reach('r', smoothstep(0.05, 0.1, u) * (1 - smoothstep(0.18, 0.21, u)), door.x - 0.03, 1.0, door.z, 0.4)
        } else if (u < 0.47) {
          a.walk(P_UP, smoothstep(0.2, 0.47, u), P.STAND, PI / 2)
          a.y = a.z > STAIR.z0 ? flightY(a.z) : 0
        } else visible = false
        break
      }
      case 'wakeup': {
        const lieX = 3.35
        a.place(lieX, -3.9, -PI / 2)
        a.y = y0 + MATTRESS - 0.06
        a.blend(
          [
            [0.0, LIE_BACK],
            [0.1, LIE_BACK],
            [0.42, SIT_LONG],
          ],
          u,
        )
        // A stretch on the way up.
        const stretch = bump(0.12, 0.34, u)
        addRot(a.pose, 'lUpper', -2.4 * stretch, 0, 0.2 * stretch)
        addRot(a.pose, 'rUpper', -2.4 * stretch, 0, -0.2 * stretch)
        a.lookAt(3.3, -0.9, smoothstep(0.44, 0.6, u))
        break
      }
      case 'brother':
        a.place(3.15, -3.5, 0).blend(
          [
            [0.0, SIT_EDGE],
            [0.55, SIT_EDGE],
            [0.75, SIT_SAD],
          ],
          u,
        )
        a.y = y0
        a.lookAt(3.95, -0.95, 0.7 * (1 - smoothstep(0.3, 0.5, u)))
        break
      case 'games': {
        // To the cabinet, the dusty controller picked up; he turns to the window's light with it,
        // wipes the dust with his thumb, smiles; puts it back beside the other and makes for the door.
        if (u < 0.3) {
          if (u < 0.08) {
            a.place(3.15, lerp(-3.5, -3.2, smoothstep(0, 0.08, u)), 0).blend(
              [
                [0.0, SIT_SAD],
                [0.08, P.STAND],
              ],
              u,
            )
          } else a.walk(P_GAMES, smoothstep(0.08, 0.3, u), P.STAND, 0, -PI / 2)
        } else if (u < 0.92) {
          // Picks it up (L1), turns to the window's light with it: the thumb, the smile (L2), puts it back.
          const turn = smoothstep(0.42, 0.5, u) * (1 - smoothstep(0.78, 0.85, u))
          a.place(PAD_SPOT.x, PAD_SPOT.z, -PI / 2 + turn * PI).blend(
            [
              [0.3, P.STAND],
              [0.38, HOLD_LOW],
              [0.82, HOLD_LOW],
              [0.9, PURPOSE],
            ],
            u,
          )
          const pad = this.boys.padHome
          const pick = bump(0.3, 0.39, u) + bump(0.83, 0.91, u)
          if (pick > 0.01) {
            a.reach('r', pick, pad.x + 0.02, pad.y + 0.03, pad.z - 0.02, 0.3)
            a.reach('l', pick * 0.6, pad.x + 0.05, pad.y + 0.03, pad.z + 0.06, 0.3)
          }
          // Holding it in both hands in front of his belly, looking down at it.
          const held = smoothstep(0.37, 0.41, u) * (1 - smoothstep(0.8, 0.84, u))
          if (held > 0.01) {
            const hx = a.x + Math.sin(a.yaw) * 0.26
            const hz = a.z + Math.cos(a.yaw) * 0.26
            const sx = Math.cos(a.yaw) * 0.055
            const sz = -Math.sin(a.yaw) * 0.055
            this.padAt.set(hx, y0 + 0.93, hz)
            a.reach('r', held, hx - sx, y0 + 0.93, hz - sz, 0.2)
            a.reach('l', held, hx + sx, y0 + 0.93, hz + sz, 0.2)
            a.lookAt(hx, hz, 0)
          }
          // The thumb across the dust; then the small smile: chin up.
          if (u > 0.55 && u < 0.7) addRot(a.pose, 'rHand', 0.25 * Math.sin((u - 0.55) * 70))
          const smile = bump(0.62, 0.84, u)
          addRot(a.pose, 'head', -0.3 * smile)
          addRot(a.pose, 'neck', -0.15 * smile)
        } else a.walk(P_TODOOR, smoothstep(0.92, 1.0, u) * 0.45, PURPOSE, -PI / 2)
        a.y = y0
        break
      }
      case 'rush': {
        // Down the flight two steps at a time, fast.
        const s = smoothstep(0.15, 0.98, u)
        a.walk(P_RUSH, s, P.STAND, PI, undefined, 1.6)
        a.y = a.z > STAIR.z0 && a.x < -0.75 ? flightY(a.z) : 0
        addRot(a.pose, 'spine', 0.15)
        this.surface = a.z > 0.95 ? 1 : 0
        if (u < 0.15) visible = false
        break
      }
      case 'pass':
        a.walk(P_PASS, smoothstep(0, 0.97, u) * 0.999, P.STAND, undefined, PI, 1.5)
        addRot(a.pose, 'spine', 0.12)
        break
      case 'kitchen':
        a.place(BOY_K.x, BOY_K.z, PI).hold(P.STAND)
        a.lookAt(-2.2, -9.95, bump(0.5, 0.72, u))
        if (u > 0.68) a.lookAt(1.2, -8.55, bump(0.68, 0.92, u))
        break
      case 'ask':
        a.place(BOY_K.x, BOY_K.z, PI).hold(P.STAND)
        addRot(a.pose, 'spine', 0.05)
        addRot(a.pose, 'head', -0.05)
        break
      case 'answer':
      case 'end':
        a.place(BOY_K.x, BOY_K.z, PI).hold(seg === 'answer' && u < 0.5 ? P.STAND : P.SPENT)
        break
      default:
        visible = false
    }
    // Upstairs segments: `begin()` put him on the ground floor; lift him to the upper floor.
    if (UPSTAIRS.has(seg) && a.y < 1) a.y += y0
    a.visible = visible
    a.apply(f.time, !f.reduced)
  }

  /** The sewing-room door's free edge (world xz) at an opening angle in degrees, at a fraction of its width. */
  private doorEdge(deg: number, frac: number) {
    const r = (deg * PI) / 180
    return { x: 0.86 + Math.sin(r) * 0.89 * frac, z: -0.7 - Math.cos(r) * 0.89 * frac }
  }

  /** The door's opening angle (degrees) for a segment. */
  private doorAngle(seg: SegmentId, u: number, call: boolean) {
    const p = at(seg, u)
    if (p >= SEG.wakeup.start) return 100
    if (p < SEG.enter.start) return 50
    if (seg === 'enter') return call ? 50 : lerp(50, 95, smoothstep(0.05, 0.3, u))
    if (seg === 'shout' || seg === 'trance') return call ? 50 : 95
    if (seg === 'close') return lerp(call ? 50 : 95, 0, smoothstep(call ? 0.04 : 0.1, 0.2, u))
    return 0
  }

  // ——— The mother ———

  private directMother(f: SetFrame, seg: SegmentId, u: number, phase: number, run: number, slam: number) {
    const a = this.mom
    const p = f.p
    a.begin()
    if (p < SEG.wakeup.start) {
      // At the machine: back to the door, facing the window.
      const tender = seg === 'mutter'
      a.place(STOOL.x, STOOL.z, PI / 2).hold(tender ? SEW_TENDER : SEW)
      a.y = 0
      const s = Math.sin(phase * PI * 2)
      // The treadle: heels and toes rock the plate; the knees ride it.
      const tilt = run * plateTilt(phase) + slam * 0.36
      addRot(a.pose, 'lFoot', -tilt * 0.9)
      addRot(a.pose, 'rFoot', -tilt * 0.9)
      addRot(a.pose, 'lShin', tilt * 0.25)
      addRot(a.pose, 'rShin', tilt * 0.25)
      // Head bobbing with the stitch; on a slam the whole body jolts.
      addRot(a.pose, 'head', 0.05 * s * run)
      addRot(a.pose, 'spine', 0.06 * slam)
      if (tender) {
        const nod = Math.sin(f.time * 2.2) * 0.07
        addRot(a.pose, 'neck', nod)
        // Giggles: the shoulders shake.
        const giggle = bump(0.3, 0.45, u) + bump(0.85, 0.97, u)
        addRot(a.pose, 'chest', 0.03 * giggle * Math.sin(f.time * 30))
      }
      // In `shout` her head is bowed deep, the hair falls over her face.
      if (seg === 'shout' || seg === 'voice') addRot(a.pose, 'neck', 0.22)
      // Hands on the cloth, the right one feeding it in jerks.
      const jerk = run * (0.025 * Math.max(0, Math.sin(phase * PI * 2)) - 0.01)
      let rx = NEEDLE.x - 0.1 + jerk
      let ry = NEEDLE.y + 0.02
      let rz = NEEDLE.z + 0.13
      let lx = NEEDLE.x - 0.07
      let lz = NEEDLE.z - 0.1
      if (seg === 'pieces') {
        // The scissors (u 0.55–0.64), then a piece to the needle.
        const snip = bump(0.5, 0.66, u)
        rx = lerp(rx, 4.75, snip)
        rz = lerp(rz, -2.25, snip)
        ry = lerp(ry, 0.86, snip)
        const take = smoothstep(0.64, 0.8, u) * (1 - smoothstep(0.92, 1, u) * 0)
        lx = lerp(lx, 4.72, bump(0.64, 0.82, u))
        lz = lerp(lz, -2.75, bump(0.64, 0.82, u))
        void take
      }
      if (seg === 'stitch') {
        const align = bump(0.62, 0.95, u)
        lx = lerp(lx, 4.55, align)
        lz = lerp(lz, -2.6, align)
      }
      const still = seg === 'fall' && u > 0.08 && u < 0.5
      a.reach('r', 1, rx, ry, rz, 0.55)
      a.reach('l', 1, lx, NEEDLE.y + 0.02, lz, 0.55)
      if (still) a.look = 0
      this.cast.hairBack.visible = true
    } else {
      // Morning: on her knees in the kitchen, wiping in slow circles.
      a.place(MOM_K.x, MOM_K.z, PI)
      let wipe = 1
      if (seg === 'answer') {
        a.blend(
          [
            [0.0, KNEEL_WIPE],
            [0.12, KNEEL_WIPE],
            [0.4, KNEEL_TURN],
          ],
          u,
        )
        wipe = 1 - smoothstep(0.02, 0.12, u)
        if (u > 0.47) addRot(a.pose, 'head', 0.06 * Math.sin((u - 0.47) * 40) * (1 - smoothstep(0.9, 1, u)))
      } else if (seg === 'end') {
        a.blend(
          [
            [0.0, KNEEL_TURN],
            [0.06, KNEEL_WIPE],
          ],
          u,
        )
        wipe = smoothstep(0.32, 0.4, u)
      } else a.hold(KNEEL_WIPE)
      const ang = f.time * 1.1
      const cx = -0.48 + 0.11 * Math.cos(ang) * wipe
      const cz = MOM_K.z - 0.46 + 0.07 * Math.sin(ang) * wipe
      const ragOn = seg !== 'answer' || u < 0.12
      // End: dip the rag in the bucket, wring it, spread it again.
      const dip = seg === 'end' ? bump(0.04, 0.3, u) : 0
      const hx = lerp(cx, -1.08, dip)
      const hy = lerp(0.05, 0.32, dip)
      const hz = lerp(cz, -9.15, dip)
      if (seg !== 'answer' || u < 0.2) {
        a.reach('r', 1 - (seg === 'answer' ? smoothstep(0.12, 0.3, u) : 0), hx + 0.08, hy, hz + 0.03, 0.5)
        a.reach('l', 1 - (seg === 'answer' ? smoothstep(0.12, 0.3, u) : 0), hx - 0.1, hy, hz + 0.02, 0.5)
      }
      // The rag goes where her hands are.
      const rag = this.kit.rag
      rag.position.set(seg === 'end' ? lerp(cx, -1.08, dip) : ragOn ? cx : -0.48, seg === 'end' ? lerp(0.006, 0.28, dip) : 0.006, seg === 'end' ? lerp(cz, -9.12, dip) : ragOn ? cz : MOM_K.z - 0.46)
      rag.rotation.set(0, ang * 0.1, 0)
      rag.scale.set(1 - 0.6 * dip, 1, 1 - 0.7 * dip)
    }
    a.apply(f.time, !f.reduced)
    this.cast.skirt.update()
    // Morning, kneeling in the kitchen: her thighs would show through the skirt — dress them in the gown.
    const legs = this.cast.momLegs
    if (legs) legs.mesh.material = p >= SEG.wakeup.start ? this.cpal.gown : legs.bare
    // The hanks by her face hang; her yaw is the root's.
    for (const h of this.cast.hairSides) h.visible = true
    hangHair(this.cast, a.yaw)
  }

  // ——— The body ———

  /** Its x along the wall (it slides west on each hard press). */
  private bodyX(seg: SegmentId, u: number) {
    const p = at(seg, u)
    if (p < SEG.drag.start) return 3.4
    if (seg === 'drag') return 3.4 - 0.03 * (smoothstep(0.1, 0.16, u) + smoothstep(0.45, 0.51, u) + smoothstep(0.8, 0.86, u))
    if (seg === 'thrice') return 3.31 - 0.27 * (smoothstep(0.06, 0.16, u) + smoothstep(0.34, 0.44, u) + smoothstep(0.61, 0.71, u))
    return 2.5
  }

  private directBody(f: SetFrame, seg: SegmentId, u: number) {
    const a = this.body
    const p = f.p
    a.begin()
    const fallT = p < SEG.fall.start ? 0 : seg === 'fall' ? smoothstep(0.03, 0.12, u) : 1
    const x = this.bodyX(seg, u)
    a.place(x, BODY_Z, BODY_YAW).blend(
      [
        [0, FLOOR_SIT],
        [1, FLOOR_LIE],
      ],
      fallT,
    )
    // A jerk on each press.
    const slam = this.slam(seg, u)
    addRot(a.pose, 'spine', 0.08 * slam)
    addRot(a.pose, 'head', 0.1 * slam)
    a.visible = p < SEG.wakeup.start
    a.apply(f.time, false)
    const root = this.cast.body.root
    if (fallT > 0) {
      // Tipped over toward the light (west), lying along the wall's foot.
      root.rotation.set(0, lerp(BODY_YAW, -0.15, fallT), (PI / 2) * fallT, 'YXZ')
      root.position.set(lerp(x, 2.32, fallT), 0.16 * fallT, lerp(BODY_Z, -4.0, fallT))
      root.updateMatrixWorld(true)
    }
    // Wet feet only in the one shot that looks at them.
    const wet = seg === 'feet'
    for (const m of this.cast.bodyFeet) m.material = wet ? this.cpal.feetWet : this.cpal.body
  }

  // ——— Things that change ———

  private dressSet(f: SetFrame, seg: SegmentId, u: number, call: boolean, morning: boolean, night: boolean) {
    const p = f.p
    const h = this.house
    // Doors.
    h.sewDoor.rotation.y = PI - (this.doorAngle(seg, u, call) * PI) / 180
    const toiletOpen = p < SEG.toilet.start ? 70 : seg === 'toilet' ? lerp(70, 12, smoothstep(0.06, 0.2, u)) : seg === 'voice' ? 12 : seg === 'landing' ? lerp(12, 80, smoothstep(0.0, 0.12, u)) : 80
    h.toiletDoor.rotation.y = PI + (toiletOpen * PI) / 180
    // At night it stands folded back toward the TV cabinet (clear of the camera in the doorway corner).
    h.boysDoor.rotation.y = ((morning ? 80 : 140) * PI) / 180
    // Blind: tilted open at night (bars), half raised in the morning.
    h.blind.set(morning ? 1 : 0.62, morning ? 0.82 : 0)
    // The boy's duvet.
    const duvet = seg === 'wake' ? smoothstep(0.08, 0.2, u) : seg === 'street' ? 0 : seg === 'wakeup' ? smoothstep(0.2, 0.42, u) * 0.6 : morning ? 0.6 : p < SEG.wakeup.start && p > SEG.wake.end ? 1 : 0
    // How much of him is under it: lying (1), sitting with his legs in (0.5), out (0).
    const under =
      seg === 'street'
        ? 1
        : seg === 'wake'
          ? (1 - 0.5 * smoothstep(0.06, 0.16, u)) * (1 - smoothstep(0.18, 0.28, u))
          : seg === 'wakeup'
            ? 1 - 0.5 * smoothstep(0.1, 0.42, u)
            : 0
    this.boys.setDuvet(duvet, under)
    // The dusty controller: in his hands in `games`, the dust thinner after the thumb.
    const pad = this.boys.pad
    const inHand = seg === 'games' && u > 0.39 && u < 0.82
    if (inHand) {
      pad.position.copy(this.padAt)
      pad.rotation.set(0.5, this.boy.yaw, 0, 'YXZ')
    } else {
      pad.position.copy(this.boys.padHome)
      pad.rotation.set(0, -0.25, 0)
    }
    this.boys.dust.opacity = seg === 'games' ? lerp(0.88, 0.45, smoothstep(0.55, 0.7, u)) : p > SEG.games.end ? 0.45 : 0.88
    // The tap drips (a drop falls and resets on the clock).
    const drip = (f.time * 0.9) % 1
    this.toi.drip.position.y = UP + 0.86 - 0.2 * drip * drip
    this.toi.drip.visible = !morning && drip < 0.85
    // The heaps, the body's marks, the pieces.
    this.heapNight.visible = !morning
    this.heapMorning.visible = morning
    const x = this.bodyX(seg, u)
    const mk = this.mk
    const smearOn = p >= at('drag', 0.1)
    mk.cut.value = smearOn ? clamp((Math.min(3.62, x + 0.2) - 2.15) / 1.6 - (p >= at('fall', 0.06) ? 0.12 : 0), 0, 1) : 1
    mk.wall.visible = smearOn
    mk.wallMat.color.setRGB(morning ? 1.25 : 1, morning ? 1.0 : 1, morning ? 0.9 : 1)
    mk.wallMat.roughness = morning ? 0.95 : 0.35
    const left = [at('drag', 0.2), at('thrice', 0.12), at('thrice', 0.4), at('thrice', 0.67), at('fall', 0.4)]
    mk.pools.forEach((m, i) => {
      const on = p >= left[i] && !morning
      m.visible = on
      ;(m.material as THREE.MeshStandardMaterial).opacity = on ? smoothstep(left[i], left[i] + 0.004, p) * 0.9 : 0
    })
    for (const m of mk.wiped) m.visible = morning
    this.placePieces(seg, u, morning, night)
    // The line of light under the closed door.
    const shut = this.doorAngle(seg, u, call) < 2 && night
    ;(this.underDoor.material as THREE.MeshBasicMaterial).opacity = shut ? 0.85 : 0
    this.underDoor.visible = shut
    ;(this.underGlow.material as THREE.MeshBasicMaterial).opacity = shut ? 0.55 : 0
    this.underGlow.visible = shut
    // Flies in the sun of the open room.
    const mothsOn = night && (seg === 'street' || seg === 'flayed')
    this.moths.visible = mothsOn
    if (mothsOn) {
      const m4 = new THREE.Matrix4()
      for (let i = 0; i < this.moths.count; i++) {
        const a = f.time * (2.1 + (i % 3) * 0.9) + i * 1.7
        const r = 0.18 + (i % 4) * 0.08 + 0.05 * Math.sin(f.time * 5.3 + i)
        m4.makeTranslation(12.6 + Math.cos(a) * r, 4.95 + 0.25 * Math.sin(a * 1.6 + i) , 3.3 + Math.sin(a) * r)
        this.moths.setMatrixAt(i, m4)
      }
      this.moths.instanceMatrix.needsUpdate = true
    }
    const fliesOn = seg === 'pass' || seg === 'rush'
    this.flies.visible = fliesOn
    if (fliesOn) {
      const m4 = new THREE.Matrix4()
      for (let i = 0; i < this.flies.count; i++) {
        const a = f.time * (1.3 + (i % 5) * 0.37) + i * 2.1
        const r = 0.25 + (i % 4) * 0.12
        m4.makeTranslation(2.6 + Math.cos(a) * r + (i % 3) * 0.4, 0.6 + (i % 6) * 0.18 + Math.sin(a * 1.7) * 0.1, -2.9 + Math.sin(a) * r * 0.8)
        this.flies.setMatrixAt(i, m4)
      }
      this.flies.instanceMatrix.needsUpdate = true
    }
    // Scissors: on the table, in her hand for the snip.
    const sc = this.sc
    const snip = seg === 'pieces' ? bump(0.5, 0.68, u) : 0
    if (snip > 0.3) {
      this.cast.mother.rGrip.getWorldPosition(sc.group.position)
      sc.group.rotation.set(-PI / 2, 0, -0.6)
    } else {
      sc.group.position.set(4.78, 0.775, -1.92)
      sc.group.rotation.set(-PI / 2, 0, 0.4)
    }
    const open = seg === 'pieces' ? 0.25 * (1 - bump(0.58, 0.62, u)) : 0.05
    sc.blades[0].rotation.z = open
    sc.blades[1].rotation.z = -open
    // Street lamps: on at night, off from the click at dawn.
    const lampOn = night
    for (const m of this.lampAGlass) {
      const mat = m.material as THREE.MeshStandardMaterial
      if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = lampOn ? 3 : 0
    }
    this.lampBulb.color.setHex(lampOn ? 0xe9fff2 : 0x5a5f5c)
  }

  /** The pale pieces: a pooled pile at night, spread at dawn, a pattern while she joins them, scraps in the morning. */
  private placePieces(seg: SegmentId, u: number, morning: boolean, night: boolean) {
    const P0 = this.pcs
    const T = 0.782
    // The table is small and the machine takes its middle: the pieces work on
    // its north half (and beside the bed), at a scale that fits it.
    const K = 0.55
    P0.group.visible = true
    const put = (m: THREE.Object3D, x: number, z: number, yaw: number, y = T) => {
      m.position.set(x, y, z)
      m.rotation.set(0, yaw, 0)
      m.scale.setScalar(K)
      m.visible = true
    }
    if (morning) {
      // Only a scrap or two left on the table; the large piece became the rag.
      for (const m of [P0.torso, P0.head, ...P0.arms, ...P0.legs]) m.visible = false
      put(P0.loose, 4.7, -2.85, 0.6)
      return
    }
    const p = at(seg, u)
    if (night || p < SEG.sunrise.start) {
      // Pooled on the table's north half: overlapping, unreadable.
      put(P0.torso, 4.7, -2.8, 0.3, T + 0.006)
      put(P0.head, 4.62, -2.92, 1.2, T + 0.012)
      put(P0.arms[0], 4.74, -2.74, 1.4, T + 0.016)
      put(P0.arms[1], 4.62, -2.84, 2.0, T + 0.02)
      put(P0.legs[0], 4.78, -2.86, 0.9, T + 0.024)
      put(P0.legs[1], 4.66, -2.7, 1.7, T + 0.028)
      put(P0.loose, NEEDLE.x - 0.02, NEEDLE.z - 0.06, 1.5, T + 0.03)
      return
    }
    if (seg !== 'stitch') {
      // Spread out in the sun: some long, one large and roughly rectangular.
      put(P0.torso, 4.74, -2.83, 0.15, T + 0.004)
      put(P0.head, 4.9, -2.98, 0.5, T + 0.008)
      put(P0.arms[0], 4.47, -2.95, 1.45, T + 0.01)
      put(P0.arms[1], 4.9, -2.62, 0.2, T + 0.012)
      put(P0.legs[0], 4.46, -2.66, 0.05, T + 0.014)
      // One long piece goes under the needle while she works.
      const feed = seg === 'pieces' ? smoothstep(0.66, 0.95, u) : seg === 'mutter' ? 1 : 0
      put(P0.legs[1], lerp(4.82, NEEDLE.x - 0.01, feed), lerp(-2.62, NEEDLE.z - 0.08, feed), lerp(0.4, 0.02, feed), T + 0.03)
      put(P0.loose, 4.9, -2.0, 0.4, T + 0.004)
      return
    }
    // Stitch: laid out like a sewing pattern, head to the north; the legs run
    // either side of the machine's bed. A figure emerges only from the arrangement.
    const align = smoothstep(0.64, 0.98, u)
    put(P0.head, 4.66, -3.0, 0.1, T + 0.004)
    put(P0.torso, 4.66, -2.8, 0, T + 0.002)
    put(P0.arms[0], lerp(4.45, 4.5, align), lerp(-2.9, -2.8, align), lerp(0.95, 0.22, align), T + 0.008)
    put(P0.arms[1], 4.83, -2.8, -0.2, T + 0.008)
    put(P0.legs[0], 4.47, -2.53, 0.06, T + 0.006)
    put(P0.legs[1], 4.76, -2.53, -0.05, T + 0.008)
    put(P0.loose, 4.92, -1.95, 0.5, T + 0.004)
  }

  // ——— Light ———

  private light(f: SetFrame, seg: SegmentId, u: number, call: boolean) {
    const { hemi, keyA, keyB, pointA, pointB, glow } = this.L
    const p = f.p
    const h = this.house
    const scene = this.scene
    // Defaults: night.
    let hemiI = 0.22
    hemi.color.setHex(0x1d2738)
    hemi.groundColor.setHex(0x05070a)
    keyA.color.setHex(0xcfe3d6)
    keyA.position.set(12.6, 5.2, 3.3)
    keyA.target.position.set(3.4, 0.6, -3.2)
    keyA.angle = 0.17
    keyA.penumbra = 0.35
    let aI = 0
    keyB.color.setHex(0xcfe3d6)
    let bI = 0
    pointA.color.setHex(0xa9c3c4)
    pointA.distance = 7
    let pA = 0
    let pB = 0
    pointB.color.setHex(0x8ea3c4)
    pointB.distance = 5
    let glowI = 0
    let env = 0.03
    let envTex = this.envNight
    this.bg.setHex(0x05080f)
    const ch = (id: SegmentId) => p >= SEG[id].start
    // Night in the sewing room: the hard band (lamp A through the window) and the wall patch with her shadow.
    let wI = 0
    /** The lower hallway at night: moonlight from the landing window, down the stairwell (faint, cold). */
    const hallNight = (i: number) => {
      pB = i
      pointB.color.setHex(0x7d91b4)
      pointB.distance = 9
      pointB.position.set(-0.6, 2.45, 2.4)
    }
    const sewNight = (on: boolean, wall = true) => {
      if (!on) return
      aI = BAND
      if (wall) wI = WALL_I
      // Outside the band the room is dark but readable: a cold, faint moonlight
      // fill (the night sky through the window, the band's own bounce).
      hemiI = 0.1
      hemi.color.setHex(0x2b3a52)
      env = 0.022
    }
    switch (seg) {
      case 'street':
        // Outside, the two lamps pool light on the road and wash the façade
        // from the side (wide soft cones, not the narrow window keys).
        keyA.position.copy(h.lampA)
        // Lamp A pools on the far pavement and the road; lamp B washes the house's front around the two windows.
        keyA.target.position.set(11.2, 0, 1.8)
        keyA.angle = 0.8
        keyA.penumbra = 0.8
        aI = 150
        // Lamp B pours down on the road and the pavement; the house front catches only the soft
        // edge of its cone (no disc of light on the façade).
        keyB.position.copy(h.lampB)
        keyB.target.position.set(8.2, 0, -0.8)
        keyB.angle = 1.0
        keyB.penumbra = 1
        bI = 300
        glowI = 3
        // Cold night sky over everything, so the dark house still reads.
        hemiI = 0.16
        hemi.color.setHex(0x30425e)
        break
      case 'wake':
        this.barsUpstairs(keyB)
        bI = 420
        // A cold fill so the boy reads in the dark.
        pB = 0.6
        pointB.position.set(2.2, 5.2, -2.4)
        break
      case 'hall':
        this.barsUpstairs(keyB)
        bI = 420
        // The faint cold glow rising from the stairwell.
        pA = 2.2
        pointA.position.set(-1.25, 1.2, 1.4)
        pB = 0.25
        pointB.position.set(0.0, 5.0, -1.5)
        break
      case 'toilet':
        pB = 0.32
        pointB.color.setHex(0x6f8ab8)
        pointB.position.set(-2.3, 4.85, -3.05)
        hemiI = 0.12
        break
      case 'voice':
        if (u >= 0.75) pA = this.treadleFill(pointA)
        if (u < 0.44) {
          pB = 0.32
          pointB.color.setHex(0x6f8ab8)
          pointB.position.set(-2.3, 4.85, -3.05)
          hemiI = 0.12
        } else sewNight(true)
        break
      case 'landing':
        pA = 2.0
        pointA.position.set(-1.25, 1.2, 1.4)
        // The glow rising from the stairwell, catching the cupboard's shelves.
        pB = 1.1
        pointB.position.set(0.05, 3.75, 3.55)
        // The blind's bars spill out of the boys' open door across the hall: he walks through them.
        this.barsUpstairs(keyB)
        bI = 420
        break
      case 'descent':
      case 'words':
      case 'anger':
        // The spill from the door gap, growing as he comes down.
        pA = seg === 'descent' ? lerp(1.6, 3.2, u) : seg === 'words' ? 2.2 : 3.4
        pointA.position.set(1.05, 0.55, -1.25)
        sewNight(seg === 'anger')
        if (seg === 'words') {
          // A faint cheat on his face from the door's spill.
          pB = 0.35
          pointB.position.set(-0.4, 1.3, 0.2)
        } else hallNight(seg === 'anger' ? 1.4 : 0.9)
        break
      case 'shadow':
        sewNight(true)
        pA = 1.2
        pointA.position.set(1.05, 0.55, -1.25)
        hallNight(1.4)
        break
      case 'enter':
        sewNight(true)
        pA = 0.6
        pointA.position.set(1.05, 0.55, -1.25)
        hallNight(1.2)
        break
      case 'shout':
        sewNight(true)
        // A faint cheat from the band's bounce catches his face (the frontal half).
        if (!call && u < 0.52) {
          pB = 0.55
          pointB.color.setHex(0x9fb2b4)
          pointB.distance = 3
          pointB.position.set(2.9, 1.7, -1.95)
        }
        break
      case 'trance':
        sewNight(true)
        break
      case 'close':
        sewNight(true)
        pA = this.doorAngle('close', u, call) > 2 ? 1.2 : 0
        pointA.position.set(1.05, 0.55, -1.25)
        // The hallway's faint night.
        hallNight(1.6)
        break
      case 'corner':
        sewNight(true)
        break
      case 'feet':
      case 'drag':
      case 'thrice':
      case 'fall':
        sewNight(true)
        if (seg === 'drag' && u < 0.42) pA = this.treadleFill(pointA)
        break
      case 'flayed':
        sewNight(true)
        glowI = 6
        break
      default:
        break
    }
    // ——— Dawn and morning ———
    if (ch('sunrise')) {
      const su = seg === 'sunrise' ? u : 1
      const click = 1 - smoothstep(0.08, 0.1, su)
      const blue = smoothstep(0.1, 0.55, su)
      const sun = smoothstep(0.55, 1.0, su)
      aI = 0
      if (click > 0.001 && seg === 'sunrise') aI = 330 * click
      hemi.color.setRGB(0.2 + 0.3 * blue, 0.26 + 0.33 * blue, 0.4 + 0.35 * blue)
      hemi.groundColor.setHex(0x0b0d12)
      // The sun shaft dominates; the room stays dim around it.
      hemiI = lerp(0.12, 0.42, blue)
      this.bg.setRGB(lerp(0.02, 0.2, blue) + 0.35 * sun, lerp(0.03, 0.25, blue) + 0.3 * sun, lerp(0.06, 0.35, blue) + 0.15 * sun)
      env = lerp(0.03, 0.08, blue)
      if (sun > 0 || seg !== 'sunrise') {
        // The first sun, low through the same window.
        keyA.position.set(16, 2.6, -1.2)
        keyA.target.position.set(4.4, 0.75, -2.5)
        keyA.color.setHex(0xd9b75a)
        keyA.angle = 0.22
        keyA.penumbra = 0.3
        aI = 1500 * (seg === 'sunrise' ? sun : 1)
      }
    }
    if (ch('wakeup')) {
      // Flat, ordinary daylight.
      envTex = this.envDay
      hemi.color.setHex(0xdfe3e6)
      hemi.groundColor.setHex(0x8a8478)
      hemiI = 1.5
      env = 0.35
      this.bg.setHex(0xc9ccd0)
      // Harsh sun inside the sewing room (seen only through its open door).
      keyA.position.set(14, 4.0, -1.0)
      keyA.target.position.set(3.0, 0.4, -3.2)
      keyA.color.setHex(0xffc04d)
      keyA.angle = 0.24
      keyA.penumbra = 0.15
      aI = 20000
      if (seg === 'wakeup' || seg === 'brother' || seg === 'games') {
        // Soft light through the half-raised blind.
        keyB.position.set(9.5, 7.5, 0.5)
        keyB.target.position.set(2.8, 3.2, -2.6)
        keyB.angle = 0.3
        keyB.penumbra = 0.6
        keyB.color.setHex(0xfff3e0)
        bI = 900
      } else if (seg === 'rush') {
        // Morning through the landing window.
        keyB.position.set(-0.2, 5.0, 9.0)
        keyB.target.position.set(-1.2, 1.0, 1.5)
        keyB.angle = 0.4
        keyB.penumbra = 0.6
        keyB.color.setHex(0xfff1dc)
        bI = 380
      } else {
        // The kitchen's north window: cold, even.
        keyB.position.set(0.2, 3.6, -15.0)
        keyB.target.position.set(-0.2, 0.0, -9.2)
        keyB.angle = 0.42
        keyB.penumbra = 0.8
        keyB.color.setHex(0xe8f0f4)
        bI = 520
        pA = seg === 'pass' ? 0 : 4
        pointA.color.setHex(0xf0f2f2)
        pointA.position.set(0, 2.4, -8.6)
      }
      if (seg === 'pass' || seg === 'rush') {
        // The open sewing room: harsh yellow sun spilling out of its door onto the hall.
        pB = 30
        pointB.color.setHex(0xffc45a)
        pointB.position.set(2.6, 1.8, -2.3)
      }
    }
    // The sky: night blue-black → a pale warm dawn → flat morning.
    if (ch('wakeup')) this.skyDome.set(0x8ea3b8, 0xd7dadb, 0x8a8a86)
    else {
      const d = ch('sunrise') ? smoothstep(0.1, 1, seg === 'sunrise' ? u : 1) : 0
      this.cA.setHex(0x02040a).lerp(this.cB.setHex(0x2d3f5c), d)
      this.cB.setHex(0x172238).lerp(this.cC.setHex(0xb88f68), d)
      this.cC.setHex(0x040507)
      this.skyDome.set(this.cA, this.cB, this.cC)
    }
    this.flag.visible = p < at('sunrise', 0.1)
    // The lace glows faintly with the light behind it (night: the lamp; dawn: the sun).
    const laceM = this.laceMesh.material as THREE.MeshStandardMaterial
    const sunNow = ch('sunrise') ? (seg === 'sunrise' ? smoothstep(0.55, 1, u) : 1) : 0
    const lampNow = p < at('sunrise', 0.09) ? 1 : seg === 'sunrise' ? 1 - smoothstep(0.08, 0.1, u) : 0
    laceM.emissive.setRGB(0.17 * lampNow + 0.6 * sunNow, 0.2 * lampNow + 0.5 * sunNow, 0.19 * lampNow + 0.3 * sunNow)
    // Her shadow: off with the street lamp at dawn.
    if (ch('sunrise')) wI *= seg === 'sunrise' ? 1 - smoothstep(0.08, 0.1, u) : 0
    // After the fall, the cut to the marks: the patch dims so the streaks read.
    if (seg === 'fall' && u > 0.45) wI *= 0.55
    this.wall.setLevel(wI)
    if (wI > 0) this.wall.draw(this.phaseNow, this.machineRun, this.slamNow, f.time)
    hemi.intensity = hemiI
    keyA.intensity = aI
    keyB.intensity = bI
    pointA.intensity = pA
    pointB.intensity = pB
    glow.intensity = glowI
    // Inactive shadow maps are not redrawn.
    keyA.shadow.autoUpdate = aI > 0
    keyB.shadow.autoUpdate = bI > 0
    scene.environment = envTex ?? this.fallbackEnv
    scene.environmentIntensity = env
    void h
  }

  /** A faint cold fill under the sewing table, for the inserts on the treadle. */
  private treadleFill(l: THREE.PointLight) {
    l.color.setHex(0x9fb3b0)
    l.position.set(4.05, 0.32, -2.95)
    l.distance = 2.5
    return 0.35
  }

  /** Lamp B over the upstairs window: the blind lays its bars across the floor and the bed. */
  private barsUpstairs(l: THREE.SpotLight) {
    l.position.copy(this.house.lampB)
    l.target.position.set(4.6, 4.3, -2.3)
    l.angle = 0.12
    l.penumbra = 0.3
    l.color.setHex(0xcfe3d6)
  }

  // ——— Camera ———

  private camera(f: SetFrame, shot: Shot, seg: SegmentId, u: number, call: boolean, slam: number) {
    const keys = (call ? CALL_SHOTS[seg] : undefined) ?? SHOTS[seg] ?? SHOTS.street!
    keyed(keys, held(u, f.reduced), shot, seg === 'pass' || seg === 'descent' ? linear : easeInOutSine)
    shot.fade = 1
    if (seg === 'street') shot.fade = 0.4 + 0.6 * smoothstep(0, 0.25, u)
    if (seg === 'end') shot.fade = 1 - smoothstep(0.25, 0.85, u)
    // Locked-off for the presses; the floor shudders on each.
    if (seg === 'thrice' || seg === 'fall' || seg === 'feet' || seg === 'stitch') shot.handheld = 0
    if (slam > 0 && !f.reduced) {
      shot.pos.y += 0.006 * slam * Math.sin(f.time * 70)
      shot.pos.x += 0.004 * slam * Math.cos(f.time * 63)
    }
    if (seg === 'anger') shot.handheld = 1.6
    // QA only: a free camera from the console (`window.__takCam = [px,py,pz, tx,ty,tz, fov]`).
    const qa = typeof window !== 'undefined' ? (window as unknown as { __takCam?: number[]; __takYaw?: number }) : undefined
    const dbg = qa?.__takCam
    if (dbg && dbg.length === 7) {
      shot.pos.set(dbg[0], dbg[1], dbg[2])
      shot.tgt.set(dbg[3], dbg[4], dbg[5])
      shot.fov = dbg[6]
      shot.fade = 1
    }
    // QA only: turn the view around the camera (`window.__takYaw = radians`), for 360° checks.
    const yawDbg = qa?.__takYaw
    if (typeof yawDbg === 'number') {
      const dx = shot.tgt.x - shot.pos.x
      const dz = shot.tgt.z - shot.pos.z
      const c = Math.cos(yawDbg)
      const s = Math.sin(yawDbg)
      shot.tgt.x = shot.pos.x + dx * c + dz * s
      shot.tgt.z = shot.pos.z - dx * s + dz * c
      shot.tgt.y = shot.pos.y + (shot.tgt.y - shot.pos.y) * 0.3
      shot.fade = 1
    }
  }

  motion(m: SceneInfo['motion']) {
    m.walking = this.boy.visible ? this.boy.walking : 0
    m.step = this.boy.step
    m.robots = this.machineRun
    m.doors = this.surface
    m.frame = this.stitchCount
  }

  dispose() {
    for (const mat of Object.values(this.pal)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
    for (const mat of Object.values(this.cpal)) mat.dispose()
    for (const mat of this.extra) mat.dispose()
    this.wall.dispose()
    this.skyDome.dispose()
    this.cpal.gown.map?.dispose()
    disposeTree(this.flies)
    disposeTree(this.moths)
  }
}

const cachedPaths = new Map<string, ReturnType<typeof makePath>>()
/** Small paths made once on first use. */
function makePathCached(id: 'shadowIn') {
  let path = cachedPaths.get(id)
  if (!path) {
    path = makePath([
      [0.08, -0.25],
      [AT_GAP.x, AT_GAP.z],
    ])
    cachedPaths.set(id, path)
  }
  return path
}

export const createTakintiScene = (options: SceneOptions): StoryScene => createSetScene(new TakintiDirector(), options)
