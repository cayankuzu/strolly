/**
 * ÖTE — the director. Seven sets far apart in one scene (the signing room,
 * the corridor and elevator, the shuttle cabin, the launch from outside, the
 * habitat, the ship in space, the mission room on Earth); one cast re-placed
 * from set to set; one pool of lights; the sky at infinity. Each frame:
 * which set the moment belongs to, its staging (stage*.ts), the camera
 * (shots.ts), the sky, the veils. Everything is a pure function of progress.
 *
 * Screenplay and layout: docs/stories/ote.md.
 */
import * as THREE from 'three'
import { clamp, smoothstep } from '@/lib/math'
import { local, segmentAt, type SegmentId } from '@/stories/ote/timeline'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { keyed, type ShotKeys } from '../kit/direct'
import type { HdriId } from '../kit/assets'
import { palette, type Pal } from './materials'
import { buildCast, CAST, disposeGrips, flushEyes, HAIR, setGrip, type CastId } from './cast'
import { Passengers } from './crowd'
import { SigningRoom } from './signing'
import { Corridor } from './corridor'
import { LaunchExterior, ShuttleCabin, fitHarness } from './shuttle'
import { Habitat } from './habitat'
import { Ship } from './ship'
import { MissionRoom } from './mission'
import { LaunchSky, Sky, cloudDeck, makeSkyState } from './sky'
import { lightsOff, type Rig, type SetId, type St } from './rig'
import { stageCorridor, stageSigning } from './stageA'
import { stageLaunch, stageShuttle } from './stageC'
import { stageHabitat, stageShip } from './stageE'
import { stageMission } from './stageG'
import { LAST_CLOSED, LAST_OPEN, REPORT, SHOTS } from './shots'

const PI = Math.PI

/** Which set a moment belongs to (a cut inside a segment is a jump between sets). */
function setOf(seg: SegmentId, u: number): SetId {
  switch (seg) {
    case 'open':
    case 'glass':
    case 'pen':
    case 'pages':
    case 'refund':
    case 'lastPage':
    case 'fortune':
    case 'sign':
    case 'nod':
    case 'door':
    case 'next':
      return 'A'
    case 'elevator':
    case 'rise':
      return 'B'
    case 'topFloor':
      return u < 0.17 ? 'B' : 'C'
    case 'cabin':
    case 'faces':
    case 'announce':
    case 'seat':
    case 'ignition':
    case 'space':
      return 'C'
    case 'gforce':
      return u >= 0.215 && u < 0.475 ? 'D' : 'C'
    case 'years':
      return u < 0.43 ? 'F' : 'E'
    case 'arrive':
      return u < 0.44 ? 'F' : 'E'
    case 'horizon':
      return 'F'
    case 'mission':
    case 'readout':
    case 'routine':
    case 'wall':
    case 'key':
      return 'G'
    default:
      return 'E'
  }
}

/** Everyone who sits in the shuttle in full figure (and gets a fitted harness). */
const BELTED: CastId[] = ['M', 'W1', 'Y', 'C1', 'C2', 'H', 'S', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6']

type Answer = 'ok' | 'earth' | 'fear' | 'none'
const answerOf = (flags: ReadonlySet<string>): Answer => (flags.has('report:ok') ? 'ok' : flags.has('report:earth') ? 'earth' : flags.has('report:fear') ? 'fear' : 'none')

/** Reduced motion: hold the middle of the sub-shot (between hard cuts) the moment is in. */
function heldCut(keys: ShotKeys, u: number, reduced: boolean) {
  if (!reduced) return u
  let a = 0
  let b = 1
  for (let i = 1; i < keys.length; i++) {
    if (keys[i][0] === keys[i - 1][0]) {
      const c = keys[i][0]
      if (c <= u) a = c
      else {
        b = c
        break
      }
    }
  }
  return a + (b - a) * 0.5 - 1e-4
}

/** The booth camera's frames, as the company received them. */
const REPORT_FEED: Record<Answer, { u: number; pos: [number, number, number]; tgt: [number, number, number]; fov: number }> = {
  ok: { u: 0.41, pos: [303, 1.74, -5.3], tgt: [303, 1.6, -4.3], fov: 34 },
  earth: { u: 0.58, pos: [303, 1.74, -5.3], tgt: [307, 1.55, 4.0], fov: 15 },
  fear: { u: 0.57, pos: [303, 1.74, -5.3], tgt: [303, 1.64, -4.3], fov: 26 },
  none: { u: 0.5, pos: [303, 1.74, -5.3], tgt: [303, 1.55, -4.2], fov: 34 },
}

class OteDirector implements SetDirector {
  private r!: Rig
  private m!: Pal
  private renderer!: THREE.WebGLRenderer
  private scene!: THREE.Scene
  private white!: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  private feedCam = new THREE.PerspectiveCamera(35, 4 / 2.4, 0.05, 900)
  private feeds = new Map<string, THREE.WebGLRenderTarget>()
  private tmp = new THREE.Vector3()
  private fwd = new THREE.Vector3()
  private young = { M: new THREE.Color(HAIR.M[0]), W1: new THREE.Color(HAIR.W1[0]), C1: new THREE.Color(HAIR.C1[0]), C2: new THREE.Color(HAIR.C2[0]) }

  async build(scene: THREE.Scene, ctx: BuildContext) {
    this.scene = scene
    this.renderer = ctx.renderer
    scene.background = new THREE.Color(0x000000)
    const m = (this.m = palette())
    await ctx.surfaces(['sand'])
    const hdris: HdriId[] = ['brown_photostudio_02', 'hospital_room_2', 'abandoned_tiled_room', 'kloofendal_48d_partly_cloudy_puresky', 'belfast_sunset_puresky', 'moonless_golf']
    const [models, ...envList] = await Promise.all([
      ctx.models({
        suitcase: ['vintage_suitcase', { width: 0.5 }],
        instrument: ['vintage_spacecraft_instrument', { width: 0.34 }],
        armchair: ['modern_arm_chair_01', { height: 0.8 }],
        desk: ['metal_office_desk', { height: 0.76 }],
        clipboard: ['clipboard', { width: 0.23 }],
        spectacles: ['round_spectacles', { width: 0.118 }],
      }),
      ...hdris.map((id) => ctx.hdri(id)),
    ])
    // W1's spectacles: clear lenses (the model's transmission glass reads as dark in these rooms).
    models.spectacles?.traverse((o) => {
      const me = o as THREE.Mesh
      if (!me.isMesh) return
      const mat = me.material as THREE.MeshStandardMaterial
      if (mat.name.includes('glass')) me.material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.12, depthWrite: false })
    })
    // The suitcase model holds two cases: keep one, re-grounded.
    if (models.suitcase) {
      const inner = models.suitcase.children[0]
      const drop: THREE.Object3D[] = []
      inner.traverse((o) => {
        if (o.name.includes('suitcase_02')) drop.push(o)
      })
      for (const o of drop) o.parent?.remove(o)
      const b = new THREE.Box3().setFromObject(models.suitcase)
      const c = b.getCenter(new THREE.Vector3())
      inner.position.x -= c.x
      inner.position.z -= c.z
      inner.position.y -= b.min.y
    }
    const envs: Rig['envs'] = {}
    hdris.forEach((id, i) => {
      const e = envList[i]
      if (e) envs[id] = e
    })
    const A = new SigningRoom(m, scene)
    const B = new Corridor(m, scene)
    const C = new ShuttleCabin(m, scene, models.instrument)
    const D = new LaunchExterior(m, scene)
    const deck = cloudDeck()
    deck.mesh.position.set(200, 0, 0)
    scene.add(deck.mesh)
    const E = new Habitat(m, scene, { armchair: models.armchair, instrument: models.instrument ? models.instrument.clone(true) : null, suitcase: models.suitcase })
    const F = new Ship(m, scene)
    const G = new MissionRoom(m, scene, { desk: models.desk, clipboard: models.clipboard })
    const cast = buildCast(m, scene, models.spectacles)
    for (const id of CAST) cast.actors[id].figure.root.name = id
    // Harnesses fitted to everyone who sits in the shuttle in full figure.
    for (const id of BELTED) this.harness[id] = fitHarness(m, cast.actors[id].figure.joints, cast.actors[id].figure.root.userData.female ?? ['W1', 'C2', 'H', 'P2', 'P4', 'P6'].includes(id))
    const crowd = new Passengers(22)
    crowd.group.name = 'passengers'
    scene.add(crowd.group)
    const sky = new Sky(ctx.renderer.getPixelRatio())
    scene.add(sky.group)
    const launchSky = new LaunchSky()
    scene.add(launchSky.mesh)
    // ——— The pool of lights ———
    const shadows = ctx.quality.shadows
    const key = new THREE.SpotLight(0xffffff, 0, 0, 0.6, 0.5, 1.6)
    key.castShadow = shadows
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.02
    key.shadow.camera.near = 0.1
    const sun = new THREE.DirectionalLight(0xffffff, 0)
    sun.castShadow = shadows
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.bias = -0.0005
    sun.shadow.normalBias = 0.03
    const pts = [0, 1, 2].map(() => new THREE.PointLight(0xffffff, 0, 6, 1.6))
    const hemiL = new THREE.HemisphereLight(0xffffff, 0x000000, 0)
    scene.add(key, key.target, sun, sun.target, ...pts, hemiL)
    // ——— The white of the ring's light (song): a shell around the camera ———
    this.white = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff6e8, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.BackSide }),
    )
    this.white.renderOrder = 1000
    this.white.frustumCulled = false
    this.white.visible = false
    scene.add(this.white)
    // The couple's suitcase, carried and then stowed.
    if (models.suitcase) {
      models.suitcase.name = 'suitcase'
      scene.add(models.suitcase)
    }
    this.suitcase = models.suitcase
    this.r = {
      scene,
      m,
      cast,
      A,
      B,
      C,
      D,
      deck,
      E,
      F,
      G,
      crowd,
      sky,
      skyState: makeSkyState(),
      launchSky,
      launch: { on: false, alt: 0, race: 0 },
      lights: { key, sun, p: pts, hemi: hemiL },
      envs,
      fallbackEnv: ctx.environment,
      veil: { white: 0, memory: 0 },
      motion: { step: 0, walking: 0, doors: 0, robots: 0 },
    }
    if (typeof window !== 'undefined' && window.location.search.includes('debug=1')) this.debugHooks()
  }

  private suitcase: THREE.Group | null = null
  private harness: Partial<Record<CastId, THREE.Object3D[]>> = {}

  /** Belts: fastened on the seated, in the shuttle only. */
  private belts(set: SetId, seg: SegmentId) {
    const r = this.r
    const sitting = seg === 'seat' || seg === 'ignition' || seg === 'gforce' || seg === 'space'
    for (const id of BELTED) {
      const a = r.cast.actors[id]
      const on = set === 'C' && a.visible && (id === 'M' ? r.C.harnessM.visible : id === 'W1' ? r.C.harnessW.visible : sitting)
      for (const p of this.harness[id] ?? []) p.visible = on
    }
  }

  /** Hides every set, every person and every carried thing; lights off; the sky reset. */
  private reset() {
    const r = this.r
    for (const s of [r.A, r.B, r.C, r.D, r.E, r.F, r.G]) s.group.visible = false
    r.deck.mesh.visible = false
    for (const id of CAST) {
      const a = r.cast.actors[id].begin()
      a.visible = false
    }
    r.cast.beard.visible = false
    setGrip(r.cast.actors.M.figure, false)
    setGrip(r.cast.actors.N.figure, false)
    const hair = r.cast.hair
    for (const k of ['M', 'W1', 'C1', 'C2'] as const) hair[k]?.color.copy(this.young[k])
    r.crowd.group.visible = false
    r.crowd.hideAll()
    r.A.pen.visible = false
    r.A.tablet.visible = false
    for (const o of [r.E.guitar, r.E.guitarCase, r.E.knit, r.E.yarnBall, r.E.bag, r.E.cup, r.E.watchProp]) o.visible = false
    r.C.strand.visible = false
    if (this.suitcase) this.suitcase.visible = false
    lightsOff(r.lights)
    const s = r.skyState
    s.stars = 0
    s.shift = 0
    s.ring = 0
    s.earth = 0
    s.dotAlpha = 0
    s.dotPx = 3
    s.hole = 0
    s.holeGlow = 1
    s.sun = 0
    s.memory = 0
    s.earthAt = null
    r.launch.on = false
    r.launch.alt = 0
    r.launch.race = 0
    r.veil.white = 0
    r.veil.memory = 0
    r.motion.step = 0
    r.motion.walking = 0
    r.motion.doors = 0
    r.motion.robots = 0
  }

  /** Puts the set in its state for the moment `st`. */
  private stage(set: SetId, st: St) {
    const r = this.r
    switch (set) {
      case 'A':
        stageSigning(r, st)
        break
      case 'B':
        stageCorridor(r, st)
        break
      case 'C':
        stageShuttle(r, st)
        this.stowSuitcase(st)
        break
      case 'D':
        stageLaunch(r, st)
        break
      case 'E':
        stageHabitat(r, st)
        break
      case 'F':
        stageShip(r, st)
        break
      case 'G':
        stageMission(r, st)
        break
    }
    for (const id of CAST) r.cast.actors[id].apply(st.time, true)
    flushEyes()
    this.belts(set, st.seg)
    r.crowd.commit()
  }

  /** The old couple's suitcase: at C1's side while they stand, under their seats once they sit. */
  private stowSuitcase(st: St) {
    const sc = this.suitcase
    if (!sc) return
    const c1 = this.r.cast.actors.C1
    if (!c1.visible) return
    sc.visible = true
    const seated = st.seg === 'seat' || st.seg === 'ignition' || st.seg === 'gforce' || st.seg === 'space' || (st.seg === 'announce' && c1.pose[0] < 0.8)
    if (seated) {
      sc.position.set(98.55, 0, -4.6 - 0.05)
      sc.rotation.set(0, PI / 2, 0)
      sc.scale.setScalar(1)
    } else {
      // Standing beside him, on the floor, on his right.
      const yaw = c1.yaw
      sc.position.set(c1.x - Math.cos(yaw) * 0.42, 0, c1.z + Math.sin(yaw) * 0.42)
      sc.rotation.set(0, yaw + PI / 2, 0)
    }
  }

  /** A frame rendered once from another set: the ship's last frame, the booth's report. */
  private feed(key: string, setup: () => void) {
    let rt = this.feeds.get(key)
    if (rt) return rt.texture
    rt = new THREE.WebGLRenderTarget(800, 480, { type: THREE.HalfFloatType })
    this.feeds.set(key, rt)
    this.reset()
    setup()
    const r = this.renderer
    const prev = r.getRenderTarget()
    this.feedCam.updateProjectionMatrix()
    this.feedCam.updateMatrixWorld()
    r.setRenderTarget(rt)
    r.clear()
    r.render(this.scene, this.feedCam)
    r.setRenderTarget(prev)
    this.reset()
    return rt.texture
  }

  private skyAt(pos: THREE.Vector3, time: number, set: SetId) {
    const r = this.r
    const s = r.skyState
    s.cam.copy(pos)
    s.time = time
    if (s.earthAt) s.earthDir.subVectors(s.earthAt, pos).normalize()
    r.sky.group.visible = set === 'E' || set === 'F'
    r.sky.update(s)
    const ls = r.launchSky
    ls.mesh.visible = r.launch.on
    ls.mesh.position.copy(pos)
    ls.mat.uniforms.uAlt.value = r.launch.alt
    ls.mat.uniforms.uRace.value = r.launch.race
    ls.mat.uniforms.uTime.value = time
  }

  private feedsFor(st: St) {
    const G = this.r.G
    const cam = this.feedCam
    if (st.seg === 'readout') {
      const ans = answerOf(st.flags)
      const fd = REPORT_FEED[ans]
      const flags = new Set(ans === 'none' ? [] : [`report:${ans}`])
      G.feedMat.uniforms.map.value = this.feed(`report-${ans}`, () => {
        cam.position.set(...fd.pos)
        cam.lookAt(...fd.tgt)
        cam.fov = fd.fov
        this.stage('E', { seg: 'report', u: fd.u, p: st.p, flags, time: 12, reduced: false })
        this.skyAt(cam.position, 12, 'E')
      })
      G.feedMat.uniforms.uGain.value = 1.1
    } else {
      G.feedMat.uniforms.map.value = this.feed('ship', () => {
        const shot = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), fov: 35 } as Shot
        keyed(SHOTS.horizon!, 0.34, shot)
        cam.position.copy(shot.pos)
        cam.lookAt(shot.tgt)
        cam.fov = shot.fov * 0.9
        this.stage('F', { seg: 'horizon', u: 0.34, p: st.p, flags: st.flags, time: 30, reduced: false })
        this.skyAt(cam.position, 30, 'F')
      })
      G.feedMat.uniforms.uGain.value = 1.0
    }
  }

  frame(f: SetFrame, shot: Shot) {
    const r = this.r
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const st: St = { seg, u, p: f.p, flags: f.flags, time: f.time, reduced: f.reduced }
    const set = setOf(seg, u)
    if (set === 'G') this.feedsFor(st)
    this.reset()
    this.stage(set, st)
    this.camera(st, set, shot)
    // The lamp's mirror image lives behind the glass: seen from the room side only.
    r.A.reflection.visible = set === 'A' && shot.pos.x > -2.95
    this.skyAt(shot.pos, f.time, set)
    // The ring's white (end of `song`) and the black of the keyhole (end of `key`).
    const w = r.veil.white
    this.white.visible = w > 0.001
    this.white.material.opacity = clamp(w)
    this.white.position.copy(shot.pos)
    if (set === 'E' && r.veil.memory > 0) {
      // The memory of the Earth, large and near, where he would be looking.
      const s = r.skyState
      this.fwd.subVectors(shot.tgt, shot.pos).normalize()
      s.memory = r.veil.memory
      s.memoryDir.copy(this.fwd).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.12)
      s.memoryDir.y += 0.02
      r.sky.update(s)
    }
  }

  private camera(st: St, set: SetId, shot: Shot) {
    const { seg, u, flags, reduced, time } = st
    let keys: ShotKeys | undefined = SHOTS[seg]
    if (seg === 'lastLook') keys = flags.has('look:closed') ? LAST_CLOSED : LAST_OPEN
    else if (seg === 'report') keys = REPORT[answerOf(flags)]
    if (keys) keyed(keys, heldCut(keys, u, reduced), shot)
    // ——— Shake: ignition, the climb, decaying to the silence of cut-off ———
    let shake = 0
    if (seg === 'ignition') shake = smoothstep(0.32, 0.4, u) * 0.012
    else if (seg === 'gforce') shake = set === 'D' ? 0.05 : 0.016
    else if (seg === 'space') shake = 0.012 * (1 - smoothstep(0.0, 0.45, u)) * (u < 0.45 ? 1 : 0)
    if (shake > 0 && !reduced) {
      const t = time
      const dx = (Math.sin(t * 75.4) * 0.6 + Math.sin(t * 131.9) * 0.4) * shake
      const dy = (Math.sin(t * 81.7 + 1.3) * 0.6 + Math.sin(t * 117.3) * 0.4) * shake
      const sway = Math.sin(t * 1.7) * shake * 0.8
      shot.pos.x += dx + sway
      shot.pos.y += dy
      shot.tgt.x += dx * 0.5 + sway
      shot.tgt.y += dy * 0.5
    }
    // ——— Fades: out of the keyhole's black into the signing room again ———
    if (seg === 'next') shot.fade = smoothstep(0.0, 0.07, u)
    if (seg === 'key') shot.fade = 1 - smoothstep(0.9, 1.0, u) * 0.999
    // ——— Held frames ———
    if (seg === 'yearsPass' || seg === 'key' || (seg === 'report' && u < 0.62) || seg === 'wall') shot.handheld = seg === 'wall' ? 0.3 : 0
    if (seg === 'key' || seg === 'yearsPass') shot.locked = true
    // QA only (?debug=1): a free camera set from the console.
    const dbg = typeof window !== 'undefined' ? (window as unknown as { __oteCam?: number[] }).__oteCam : undefined
    if (dbg && dbg.length === 7) {
      shot.pos.set(dbg[0], dbg[1], dbg[2])
      shot.tgt.set(dbg[3], dbg[4], dbg[5])
      shot.fov = dbg[6]
      shot.fade = 1
      shot.handheld = 0
      shot.locked = true
    }
  }

  motion(m: SceneInfo['motion']) {
    const mo = this.r?.motion
    if (!mo) return
    m.step = mo.step
    m.walking = mo.walking
    m.doors = mo.doors
    m.robots = mo.robots
  }

  /** QA only (?debug=1): a free camera (`__oteCam = [px,py,pz, tx,ty,tz, fov]`) and a few probes. */
  private debugHooks() {
    const w = window as unknown as Record<string, unknown>
    w.__oteWhere = () => {
      const out: Record<string, unknown> = {}
      for (const id of CAST) {
        const a = this.r.cast.actors[id]
        if (!a.visible) continue
        const v = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3()).toArray().map((x) => +x.toFixed(3))
        out[id] = { at: [+a.x.toFixed(2), +a.z.toFixed(2), +a.yaw.toFixed(2)], head: v(a.figure.joints.head), l: v(a.figure.lGrip), r: v(a.figure.rGrip) }
      }
      return out
    }
    w.__oteObj = (name: string) => {
      const o = this.scene.getObjectByName(name) as THREE.Mesh | undefined
      if (!o) return null
      const chain: string[] = []
      for (let x: THREE.Object3D | null = o; x; x = x.parent) chain.push(`${x.name || x.type}:${x.visible}`)
      return { chain, range: o.geometry?.drawRange, count: o.geometry?.attributes.position?.count, index: o.geometry?.index?.count, mat: (o.material as THREE.Material)?.type }
    }
    w.__oteBox = (name: string) => {
      const o = this.scene.getObjectByName(name)
      if (!o) return null
      const b = new THREE.Box3().setFromObject(o)
      return { min: b.min.toArray().map((x) => +x.toFixed(3)), max: b.max.toArray().map((x) => +x.toFixed(3)) }
    }
  }

  dispose() {
    for (const rt of this.feeds.values()) rt.dispose()
    this.feeds.clear()
    disposeGrips()
  }
}

export const createOteScene = (options: SceneOptions): StoryScene => createSetScene(new OteDirector(), options)
