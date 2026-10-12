/**
 * DURUM — one Thursday night, 20.58 to 03.12, in the basement of an old
 * observatory in Ankara. A machine said to know the position and speed of
 * everything; a tired night operator who asks it small things; the objects
 * the ideas happen to; the reader, who turns out to be the one input the
 * model does not have. Screenplay and world layout: docs/stories/durum.md.
 *
 * Everything is a pure function of progress and of the reader's choices
 * (frame.flags). The sets are built in sets.ts, the people directed in
 * actors.ts, the screens drawn in screens.ts / paper.ts, the shots in shots.ts.
 */
import * as THREE from 'three'
import { CHOICES, TEXT } from '@/stories/durum/text'
import { SEG, TOTAL_SCREENS, at, clockText, local, segmentAt, storyHours, type SegmentId } from '@/stories/durum/timeline'
import { clamp, lerp, mulberry32, smoothstep } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { Figure } from '../figure/Figure'
import { hairGeometry } from '../figure/figureBody'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { Actor, held, keyed, type ShotKeys } from '../kit/direct'
import { canvasPlane, hardware, mug, rbox, std } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mesh } from '../util'
import { directArif, directSelin, P_STREET } from './actors'
import { arifLook, castPalette, selinLook } from './cast'
import { ARIF_POS, type Ctx } from './context'
import * as P from './paper'
import * as S from './screens'
import { buildSets, COFFEE, DESK, FOREST, OBS, ON_DESK, palette, SEAT, WD_C, WD_YAW, type Sets } from './sets'
import { FACE, FACE2, PHONE_INSERT, SHOTS } from './shots'
import { attach, butterfly, coin, envelope, faceToward, fist, noteFan, page, phoneProp, Ribbon, shardsAndStain, simit, tablet, tallyCounter, teaGlass, twoBoxes, waterGlass, wornCoat } from './things'

const PI = Math.PI
const s = smoothstep
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

// ——— DURUM's lines on the screens (typed as the rail shows them) ———

type Item = (typeof TEXT)[number]
type When = { all?: string[]; none?: string[] }
const meets = (w: When | undefined, f: ReadonlySet<string>) => !w || ((w.all ?? []).every((x) => f.has(x)) && !(w.none ?? []).some((x) => f.has(x)))
const span = (t: Item) => [at(t.seg, Math.max(0, t.from)), at(t.seg, t.to)] as const
const MACHINE = TEXT.filter((t) => t.kind === 'machine' && t.slot === 'rail')
const ARIF_IDS = new Set(TEXT.filter((t) => t.slot === 'caption' && t.lines[0] === 'ARİF').map((t) => t.id.replace(/-who$/, '')))
const ARIF_LINES = TEXT.filter((t) => t.slot === 'rail' && ARIF_IDS.has(t.id))
const HOLD = 0.6 / TOTAL_SCREENS
const strip = (l: string) => l.replace(/^—\s*/, '')

/** The DURUM line on screen at p (typed so far), or null. */
function durumLine(p: number, flags: ReadonlySet<string>): S.Band | null {
  let best: Item | null = null
  let next = Infinity
  for (const t of MACHINE) {
    if (!meets(t.when as When | undefined, flags)) continue
    const [a] = span(t)
    if (a <= p && (!best || a > span(best)[0])) best = t
  }
  if (!best) return null
  for (const t of MACHINE) {
    if (!meets(t.when as When | undefined, flags)) continue
    const [a] = span(t)
    if (a > span(best)[0] && a < next) next = a
  }
  const b = span(best)[1]
  if (p > Math.min(next, b + HOLD)) return null
  return typedBand(best, p)
}

function typedBand(t: Item, p: number): S.Band {
  const seg = SEG[t.seg as SegmentId]
  const u = (p - seg.start) / seg.len
  const n = t.lines.length
  const stag = n > 1 ? (t.stagger ?? 0.8 / n) : 0
  const spanU = t.to - Math.max(0, t.from)
  const dur = Math.max(0.035, 0.16 * spanU)
  const typed = t.lines.map((_, i) => clamp((u - (Math.max(0, t.from) + i * stag * spanU)) / dur))
  return { lines: t.lines.map(strip), typed }
}

function lineById(id: string, p: number): S.Band {
  const t = TEXT.find((x) => x.id === id)!
  return typedBand(t, p)
}

const arifSpeaking = (p: number, flags: ReadonlySet<string>) => ARIF_LINES.some((t) => meets(t.when as When | undefined, flags) && p >= span(t)[0] && p <= span(t)[1])

function option(flags: ReadonlySet<string>, gate: string) {
  const g = CHOICES.find((c) => c.id === gate)!
  return g.options.find((o) => o.sets?.some((f) => flags.has(f) && !f.startsWith('mem:'))) ?? g.options[0]
}

class DurumDirector implements SetDirector {
  private m = palette()
  private cm = castPalette()
  private sets!: Sets
  private arif!: Actor
  private selin!: Actor
  private coatParts: THREE.Object3D[] = []
  private bagHand!: THREE.Group
  // Things
  private coin!: THREE.Group
  private fist!: THREE.Group
  private rHandMesh: THREE.Object3D | null = null
  /** Selin's hair tied up in the hall (AYNA): a short cap and a bun in place of the long hair. */
  private tiedHair = new THREE.Group()
  private slip!: Ribbon
  private slipKey = ''
  private boxSlipKey = ''
  private counter!: ReturnType<typeof tallyCounter>
  private envelope!: THREE.Group
  private page!: ReturnType<typeof page>
  private pageKey = ''
  private pagePrint!: THREE.Mesh
  private pen!: THREE.Mesh
  private glass!: THREE.Group
  private shards!: ReturnType<typeof shardsAndStain>
  private boxes!: ReturnType<typeof twoBoxes>
  private heldNotes!: THREE.Group
  private phone!: ReturnType<typeof phoneProp>
  private mug!: THREE.Group
  private mugLiquid!: THREE.Mesh
  private cube!: THREE.Mesh
  private spoon!: THREE.Mesh
  private tea!: THREE.Group
  private tablet!: ReturnType<typeof tablet>
  private torch = new THREE.Group()
  private halfSimit!: THREE.Group
  private trolley = new THREE.Group()
  private dustpan = new THREE.Group()
  private fly!: ReturnType<typeof butterfly>
  private frond = new THREE.Group()
  // Light
  private hemi!: THREE.HemisphereLight
  private panel!: THREE.PointLight
  private lamp!: THREE.SpotLight
  private glowMM!: THREE.PointLight
  private glowWD!: THREE.PointLight
  private selinLamp!: THREE.PointLight
  private hallLights: THREE.PointLight[] = []
  private auxSpot!: THREE.SpotLight
  private auxPoint!: THREE.PointLight
  /** The corridor light showing under the closed office door. */
  private doorGlow!: THREE.Mesh
  private envOffice: THREE.Texture | null = null
  private envNight: THREE.Texture | null = null
  private fallbackEnv!: THREE.Texture
  private fog = new THREE.FogExp2(0x070a0e, 0.008)
  private bg = new THREE.Color(0x05070a)
  // The console's live feed (AYNA)
  private renderer!: THREE.WebGLRenderer
  private feedRT: THREE.WebGLRenderTarget[] = []
  private feedCam = new THREE.PerspectiveCamera(62, 0.56 / 0.34, 0.1, 60)
  private feedMat!: THREE.ShaderMaterial
  private feedFlip = 0
  private scene!: THREE.Scene
  private v = new THREE.Vector3()
  private ctx!: Ctx
  private lastTicks = 0

  async build(scene: THREE.Scene, ctx: BuildContext) {
    this.scene = scene
    this.renderer = ctx.renderer
    this.fallbackEnv = ctx.environment
    const [envOffice, envNight] = await Promise.all([ctx.hdri('brown_photostudio_02'), ctx.hdri('moonless_golf')])
    this.envOffice = envOffice
    this.envNight = envNight
    scene.environment = envOffice ?? ctx.environment
    scene.environmentIntensity = 0.08
    scene.background = this.bg
    scene.fog = this.fog
    const sets = (this.sets = await buildSets(scene, ctx, this.m))
    const m = this.m
    const hw = hardware()

    // ——— People ———
    const arif = new Figure(arifLook(this.cm))
    // Thin, narrow frames rather than the rig's round ones.
    arif.glasses.scale.set(0.98, 0.66, 1)
    const selin = new Figure(selinLook(this.cm))
    scene.add(arif.root, selin.root)
    mesh(hairGeometry(0.1, 'short'), this.cm.hairS, 0, 0.108, 0.008, this.tiedHair)
    mesh(new THREE.SphereGeometry(0.042, 16, 12), this.cm.hairS, 0, 0.16, -0.085, this.tiedHair).scale.set(1, 0.85, 0.9)
    this.tiedHair.visible = false
    selin.joints.head.add(this.tiedHair)
    // Hair stays hair under the display's cold point light: a broad, low sheen instead of a white cap.
    for (const f of [arif, selin]) {
      const hm = f.headMeshes[1].material as THREE.MeshStandardMaterial & { specularIntensity?: number; sheen?: number }
      hm.roughness = 0.88
      hm.envMapIntensity = 0.35
      if (hm.specularIntensity !== undefined) hm.specularIntensity = 0.35
      if (hm.sheen !== undefined) hm.sheen = 0
    }
    this.arif = new Actor(arif)
    this.selin = new Actor(selin)
    this.coatParts = wornCoat(arif, m.coat)
    this.bagHand = sets.bagRack.clone(true)
    scene.add(this.bagHand)

    // ——— Things ———
    this.coin = coin()
    scene.add(this.coin)
    this.fist = fist(this.cm.skinA)
    scene.add(this.fist)
    this.rHandMesh = arif.joints.rHand.children.find((o) => (o as THREE.Mesh).isMesh) ?? null
    this.slip = new Ribbon(0.06, 0.16, 256, () => {})
    scene.add(this.slip.mesh)
    this.counter = tallyCounter()
    scene.add(this.counter.group)
    this.envelope = envelope()
    scene.add(this.envelope)
    this.page = page(() => {})
    scene.add(this.page.mesh)
    // The page as it prints in the old printer (face down, plain back).
    this.pagePrint = mesh(new THREE.PlaneGeometry(0.21, 0.24), pbr('paper', 0xf3f0e8), 0, 0, 0, scene)
    this.pagePrint.rotation.x = -PI / 2
    this.pen = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 10), pbr('plastic', 0x1f3d8a, { roughness: 0.6 }), 0, 0, 0, scene)
    this.pen.castShadow = true
    this.glass = waterGlass()
    scene.add(this.glass)
    this.shards = shardsAndStain()
    scene.add(this.shards.shards, this.shards.base, this.shards.stain)
    this.boxes = twoBoxes()
    scene.add(this.boxes.a, this.boxes.b)
    this.heldNotes = noteFan()
    scene.add(this.heldNotes)
    this.phone = phoneProp()
    scene.add(this.phone.group, this.phone.glow)
    this.mug = mug(pbr('ceramic', 0xe8e2d6))
    this.mugLiquid = mesh(new THREE.CircleGeometry(0.0355, 28), std(0x1e120a, 0.08), 0, 0.02, 0, this.mug)
    this.mugLiquid.rotation.x = -PI / 2
    scene.add(this.mug)
    this.cube = rbox(0.016, 0.016, 0.016, pbr('paper', 0xf6f3ec), 0, 0, 0, scene, 0.002)
    this.spoon = rbox(0.005, 0.12, 0.002, hw.chrome, 0, 0, 0, scene, 0.001)
    this.tea = teaGlass()
    scene.add(this.tea)
    this.tablet = tablet()
    scene.add(this.tablet.group)
    // Selin's torch: a short barrel with a lit lens.
    mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.16, 12), hw.plasticDark, 0, 0, 0, this.torch).rotation.x = PI / 2
    mesh(new THREE.CircleGeometry(0.015, 12), new THREE.MeshBasicMaterial({ color: 0xfff4dc }), 0, 0, -0.0805, this.torch).rotation.y = PI
    scene.add(this.torch)
    this.halfSimit = new THREE.Group()
    this.halfSimit.add(simit(true))
    rbox(0.16, 0.002, 0.16, pbr('paper', 0xf2efe8), 0, 0.001, 0, this.halfSimit, 0.001)
    scene.add(this.halfSimit)
    // A trolley with a laptop for the backups (the time-lapse).
    rbox(0.6, 0.02, 0.4, m.metal, 0, 0.8, 0, this.trolley, 0.004)
    rbox(0.6, 0.02, 0.4, m.metal, 0, 0.25, 0, this.trolley, 0.004)
    for (const [x, z] of [
      [-0.28, -0.18],
      [0.28, -0.18],
      [-0.28, 0.18],
      [0.28, 0.18],
    ])
      rbox(0.02, 0.8, 0.02, m.metal, x, 0.4, z, this.trolley, 0.004)
    rbox(0.34, 0.018, 0.24, hw.plasticDark, 0, 0.82, 0.02, this.trolley, 0.004)
    const lid = rbox(0.34, 0.22, 0.01, hw.plasticDark, 0, 0.93, -0.1, this.trolley, 0.004)
    lid.rotation.x = -0.25
    const lscreen = mesh(new THREE.PlaneGeometry(0.3, 0.19), new THREE.MeshBasicMaterial({ color: 0x9cc8ff }), 0, 0.93, -0.093, this.trolley)
    lscreen.rotation.x = -0.25
    this.trolley.position.set(-0.6, 0, -7.05)
    scene.add(this.trolley)
    // Brush and dustpan (glass:break, swept up in the time-lapse).
    rbox(0.22, 0.01, 0.2, hw.plasticDark, 0, 0.005, 0, this.dustpan, 0.003)
    rbox(0.03, 0.03, 0.18, hw.plasticDark, 0, 0.03, 0.17, this.dustpan, 0.008)
    scene.add(this.dustpan)
    // The forest: the hero frond (the one with the butterfly) and the butterfly.
    this.buildFrond()
    this.fly = butterfly()
    scene.add(this.fly.group)

    // ——— Light ———
    this.hemi = new THREE.HemisphereLight(0x6f7e92, 0x0d0e10, 0.25)
    scene.add(this.hemi)
    this.panel = new THREE.PointLight(0xfff0dc, 2.6, 6.5, 1.6)
    this.panel.position.set(-2.5, 2.8, 2)
    this.lamp = new THREE.SpotLight(0xffd9a8, 0, 4.2, 0.78, 0.6, 1.4)
    this.lamp.position.copy(sets.lampBulb)
    this.lamp.target.position.set(-0.05, 0.75, -0.4)
    this.lamp.castShadow = ctx.quality.shadows
    this.lamp.shadow.mapSize.set(1024, 1024)
    this.lamp.shadow.bias = -0.0005
    this.lamp.shadow.radius = 4
    this.glowMM = new THREE.PointLight(0xb9d0ff, 0, 2.6, 1.6)
    this.glowMM.position.set(0, 1.12, -0.55)
    this.glowWD = new THREE.PointLight(0xc8dcff, 1.2, 6, 1.5)
    this.selinLamp = new THREE.PointLight(0xffd9a8, 0, 3.2, 1.6)
    this.selinLamp.position.copy(sets.selinBulb).add(v3(0, -0.08, 0))
    scene.add(this.panel, this.lamp, this.lamp.target, this.glowMM, this.glowWD, this.selinLamp)
    for (const [x, z] of [
      [-2, -6.0],
      [2, -8.4],
      [-1, -10.8],
    ] as const) {
      const l = new THREE.PointLight(0x7fa6d8, 6, 7.5, 1.6)
      l.position.set(x, 2.9, z)
      this.hallLights.push(l)
      scene.add(l)
    }
    this.auxSpot = new THREE.SpotLight(0xe8f0ff, 0, 9, 0.55, 0.7, 1.4)
    this.auxPoint = new THREE.PointLight(0xffe2bd, 0, 5, 1.6)
    scene.add(this.auxSpot, this.auxSpot.target, this.auxPoint)
    this.doorGlow = mesh(new THREE.PlaneGeometry(0.86, 0.012), new THREE.MeshBasicMaterial({ color: 0xffd9ae }), 2.6, 0.006, 4.035, scene)
    this.doorGlow.rotation.y = PI
    this.doorGlow.name = 'doorGlow'

    // ——— The console's live feed: render targets, a camera, a CCTV look ———
    for (let i = 0; i < 2; i++) this.feedRT.push(new THREE.WebGLRenderTarget(320, 196, { type: THREE.HalfFloatType }))
    this.feedMat = new THREE.ShaderMaterial({
      uniforms: { map: { value: this.feedRT[0].texture } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'uniform sampler2D map; varying vec2 vUv; void main(){ vec3 c = texture2D(map, vUv).rgb; float l = dot(c, vec3(0.3, 0.59, 0.11)) * 2.2 + 0.03; float scan = 0.88 + 0.12 * sin(vUv.y * 520.0); vec2 d = vUv - 0.5; float vig = 1.0 - dot(d, d) * 1.2; gl_FragColor = vec4(vec3(l * scan * vig) * vec3(0.82, 1.0, 0.9), 1.0); }',
    })
    sets.feed.material = this.feedMat
    this.feedCam.position.set(4.6, 2.65, -11.1)
    this.feedCam.lookAt(-4.0, 1.0, -6.8)
    scene.add(this.feedCam)

    // Readable names for the camera-collision report: the moving props by what they are, every
    // other unnamed piece of the sets by where it stands (e.g. "box@0.00,0.38,-0.60").
    const props: Array<[THREE.Object3D, string]> = [
      [this.coin, 'coin'], [this.fist, 'fist'], [this.slip.mesh, 'slip'], [this.counter.group, 'tally'], [this.envelope, 'envelope'],
      [this.page.mesh, 'page'], [this.pagePrint, 'pagePrint'], [this.pen, 'pen'], [this.glass, 'waterGlass'], [this.shards.shards, 'shards'],
      [this.boxes.a, 'boxA'], [this.boxes.b, 'boxB'], [this.heldNotes, 'notes'], [this.phone.group, 'phone'], [this.mug, 'mug'],
      [this.cube, 'sugar'], [this.spoon, 'spoon'], [this.tea, 'tea'], [this.tablet.group, 'tablet'], [this.torch, 'torch'],
      [this.halfSimit, 'simit'], [this.trolley, 'trolley'], [this.dustpan, 'dustpan'], [this.frond, 'frond'], [this.fly.group, 'butterfly'],
      [sets.coat, 'coat'], [this.bagHand, 'bag'], [sets.bagRack, 'bagRack'], [sets.chair, 'chair'], [sets.wdPivot, 'WD'], [sets.keyboard, 'keyboard'], [sets.mouse, 'mouse'],
    ]
    for (const [o, n] of props) if (!o.name) o.name = n
    scene.updateMatrixWorld(true)
    const bx = new THREE.Box3()
    const ctr = new THREE.Vector3()
    scene.traverse((o) => {
      const me = o as THREE.Mesh
      if (!me.isMesh || me.name) return
      for (let q: THREE.Object3D | null = me.parent; q && q !== scene; q = q.parent) if (q.name) return
      if (!me.geometry.boundingBox) me.geometry.computeBoundingBox()
      bx.copy(me.geometry.boundingBox!).applyMatrix4(me.matrixWorld).getCenter(ctr)
      const kind = me.geometry.type.replace(/Geometry$/, '').toLowerCase()
      me.name = `${kind}@${ctr.x.toFixed(2)},${ctr.y.toFixed(2)},${ctr.z.toFixed(2)}`
    })

    // QA only (?debug=1): which visible meshes have their bounds around a world point.
    if (typeof window !== 'undefined' && window.location.search.includes('debug=1')) {
      ;(window as unknown as { __durumPick?: unknown }).__durumPick = (x: number, y: number, z: number, r = 0.15) => {
        const out: string[] = []
        const box = new THREE.Box3()
        const pt = new THREE.Vector3(x, y, z)
        scene.updateMatrixWorld(true)
        scene.traverseVisible((o) => {
          const me = o as THREE.Mesh
          if (!me.isMesh || !me.geometry) return
          if (!me.geometry.boundingBox) me.geometry.computeBoundingBox()
          box.copy(me.geometry.boundingBox!).applyMatrix4(me.matrixWorld).expandByScalar(r)
          if (!box.containsPoint(pt)) return
          const chain: string[] = []
          for (let p: THREE.Object3D | null = me; p && chain.length < 5; p = p.parent) chain.push(p.name || p.type)
          const mat = me.material as THREE.MeshStandardMaterial
          box.expandByScalar(-r)
          const f2 = (v: THREE.Vector3) => `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`
          out.push(`${chain.join('<')} min ${f2(box.min)} max ${f2(box.max)} col ${mat?.color?.getHexString?.() ?? '?'}`)
        })
        return out
      }
      ;(window as unknown as { __durumWhere?: unknown }).__durumWhere = () => {
        const v = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3()).toArray().map((x) => +x.toFixed(3))
        const A = this.arif.figure
        const S_ = this.selin.figure
        return { arif: [this.arif.x, this.arif.z, this.arif.yaw], aR: v(A.rGrip), aL: v(A.lGrip), aHead: v(A.joints.head), selin: [this.selin.x, this.selin.z, this.selin.yaw], sR: v(S_.rGrip), sHead: v(S_.joints.head), coin: v(this.coin), coinVis: this.coin.visible }
      }
    }
  }

  /** A single procedural fern frond (0.6 m), its tip at (−200, 0.55, 0): the butterfly's perch. */
  private buildFrond() {
    const leaf = new THREE.MeshStandardMaterial({ color: 0x4a7a50, roughness: 0.65, side: THREE.DoubleSide })
    const stem = new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.9 })
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      pts.push(v3(0.02 * t, 0.55 * Math.sin(t * PI * 0.5) * (1 - 0.15 * t * t) + 0.08 * t, 0.12 * t * t))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    this.frond.add(mesh(new THREE.TubeGeometry(curve, 24, 0.0035, 5), stem))
    // A narrow pinna, broad at its root and tapering to a point.
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.008)
    shape.quadraticCurveTo(0.04, -0.012, 0.085, 0)
    shape.quadraticCurveTo(0.04, 0.012, 0, 0.008)
    shape.closePath()
    const pinna = new THREE.ShapeGeometry(shape, 6)
    const n = 36
    const im = new THREE.InstancedMesh(pinna, leaf, n)
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    for (let i = 0; i < n; i++) {
      const t = 0.15 + (i / n) * 0.82
      const p = curve.getPoint(t)
      const side = i % 2 ? 1 : -1
      const len = 0.3 + 0.55 * Math.sin(((t - 0.15) / 0.85) * PI) * (1 - t * 0.6)
      q.setFromEuler(new THREE.Euler(0.4, side > 0 ? 0 : PI, -0.35 + t * 0.2))
      m4.compose(p, q, v3(len, 1, 1))
      im.setMatrixAt(i, m4)
    }
    this.frond.add(im)
    const tip = curve.getPoint(1)
    this.frond.userData.tip = tip
    this.frond.position.set(FOREST.x - tip.x, 0, FOREST.z - tip.z)
    this.frond.traverse((o) => (o.castShadow = true))
    this.scene.add(this.frond)
  }

  frame(f: SetFrame, shot: Shot) {
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const fl = f.flags
    const c = this.context(f, seg, u)
    this.ctx = c
    directArif(this.arif, c)
    directSelin(this.selin, c)
    this.things(f, c)
    this.screens(f, c)
    this.light(f, c)
    this.camera(f, c, shot)
    this.world(f, c)
    void fl
  }

  // ——— The frame's context: choices and the scripted meeting points ———

  private context(f: SetFrame, seg: SegmentId, u: number): Ctx {
    const has = (x: string) => f.flags.has(x)
    const coinC: Ctx['coin'] = has('coin:tura') ? 'tura' : has('coin:none') ? 'none' : 'yazi'
    const glass: Ctx['glass'] = has('glass:break') ? 'break' : has('glass:none') ? 'none' : 'kitchen'
    const box: Ctx['box'] = has('box:two') ? 'two' : 'one'
    const cf: Ctx['cf'] = has('cf:bus') ? 'bus' : 'air'
    const q: Ctx['q'] = has('q:death') ? 'death' : has('q:what') ? 'what' : 'nothing'
    const end: Ctx['end'] = has('end:no') ? 'no' : 'yes'
    const p = f.p
    // The jug: home, then lifted over the mug while he pours.
    const home = this.sets.jugHome
    const pour = seg === 'coffee' ? s(0.17, 0.2, u) * (1 - s(0.28, 0.31, u)) : 0
    const jugAt = v3(lerp(home.x, -4.45, pour), lerp(home.y, 1.08, pour), lerp(home.z, 0.36, pour))
    // A slip held up to read (the coin slip in palm; the box slip in lid).
    const slipHeld = seg === 'palm' ? (u < 0.54 ? v3(-0.02, 1.12, -0.22) : v3(0.18, 1.1, -0.14)) : v3(0.12, 1.04, -0.14)
    // The water glass in his left hand.
    const glassHand = v3(-0.2, 1.06, -0.1)
    // The boxes.
    const after = (id: SegmentId, f0 = 0) => p >= at(id, f0)
    const boxA = ON_DESK.boxA.clone()
    const boxB = ON_DESK.boxB.clone()
    if (after('choose', 0.52)) {
      const t = seg === 'choose' ? s(0.52, 0.6, u) : 1
      if (box === 'one') boxA.set(lerp(ON_DESK.boxA.x, -0.62, t), boxA.y, lerp(ON_DESK.boxA.z, -0.5, t))
      else boxA.set(lerp(ON_DESK.boxA.x, -0.27, t), boxA.y, lerp(ON_DESK.boxA.z, -0.31, t))
    }
    const chequeAt = v3(0.1, 1.0, -0.2)
    return {
      seg,
      u,
      p,
      time: f.time,
      breathe: !f.reduced,
      atSeg: (id, f0 = 0) => at(id, f0),
      coin: coinC,
      glass,
      box,
      cf,
      q,
      end,
      observed: has('mem:observed'),
      jugAt,
      coinThumb: v3(0.18, 0.935, -0.12),
      slipHeld,
      glassHand,
      pageAt: v3(0.02, 1.1, -0.28),
      boxA,
      boxB,
      chequeAt,
      touch: v3(2.83, 1.6, -2.81),
      phoneAt: ON_DESK.phone.clone(),
      // A small drift while he reads (the thumb nudging the text) — never a jump.
      phoneHeld: v3(0.0, 0.99 + 0.006 * Math.sin(f.time * 0.9), -0.15),
    }
  }

  // ——— Things: where every prop is, this frame ———

  private things(f: SetFrame, c: Ctx) {
    const { seg, u, p } = c
    const A = this.arif.figure
    const sets = this.sets
    const past = (id: SegmentId, f0 = 0) => p >= at(id, f0)
    const before = (id: SegmentId, f0 = 0) => p < at(id, f0)
    const between = (a: SegmentId, fa: number, b: SegmentId, fb: number) => p >= at(a, fa) && p < at(b, fb)

    // The coat: worn on the way in and on the way out; on the rack in between.
    const wornIn = seg === 'open' || (seg === 'enter' && u < 0.52)
    const wornOut = (seg === 'coat' && u >= 0.41) || past('query')
    for (const part of this.coatParts) part.visible = wornIn || wornOut
    const coatInHand = (seg === 'enter' && u >= 0.52 && u < 0.57) || (seg === 'coat' && u >= 0.36 && u < 0.41)
    const coat = sets.coat
    coat.visible = !(wornIn || wornOut)
    if (coatInHand) {
      A.rGrip.getWorldPosition(this.v)
      coat.position.set(this.v.x, this.v.y + 0.04, this.v.z)
      coat.rotation.set(0, this.arif.yaw, 0.1)
    } else {
      // On the hook; it sways when he takes it (coat 0.45).
      const sway = seg === 'coat' && u > 0.4 && u < 0.6 ? 0.06 * Math.sin((u - 0.4) * 60) * (1 - s(0.4, 0.6, u)) : 0
      coat.position.set(3.95 + 0.12, 1.74, 3.45)
      coat.rotation.set(0, 0.3, sway)
    }
    // The bag: in his left hand when he walks in and out; at the rack's foot otherwise.
    const bagHeld = (seg === 'enter' && u < 0.54) || (seg === 'coat' && u >= 0.44) || past('query')
    const bag = this.bagHand
    sets.bagRack.visible = !bagHeld
    sets.bagRack.position.set(3.72, 0, 3.22)
    sets.bagRack.rotation.y = 0.5
    bag.visible = bagHeld && this.arif.figure.root.visible
    if (bagHeld) {
      A.lGrip.getWorldPosition(this.v)
      bag.position.set(this.v.x, this.v.y - 0.33, this.v.z)
      bag.rotation.set(0, this.arif.yaw + PI / 2, 0)
      if (seg === 'end') bag.visible = this.arif.figure.root.visible
    }

    // The coffee: the mug turned up and filled, two sugars, the spoon; then on his desk.
    const mugM = this.mug
    const counterMug = v3(-4.5, 0.92, 0.38)
    mugM.visible = true
    this.mugLiquid.visible = past('coffee', 0.2)
    this.mugLiquid.position.y = 0.02 + 0.06 * (seg === 'coffee' ? s(0.2, 0.29, u) : 1)
    if (before('coffee', 0.13)) {
      mugM.position.set(-4.62, 0.92 + 0.097, 0.15)
      mugM.rotation.set(PI, 0, 0)
    } else if (seg === 'coffee') {
      const t = s(0.13, 0.17, u)
      mugM.position.set(lerp(-4.62, counterMug.x, t), 0.92 + 0.097 * (1 - t), lerp(0.15, counterMug.z, t))
      mugM.rotation.set(PI * (1 - t), 0, 0)
    } else if (seg === 'intro' && u < 0.19) {
      // Carried in from the counter, set down on its mark (0.17–0.19).
      this.mugInHand(0)
      const k = s(0.17, 0.19, u)
      if (k > 0) {
        mugM.position.lerp(ON_DESK.mug, k)
        mugM.rotation.set(0, mugM.rotation.y * (1 - k), 0)
      }
    } else if ((seg === 'ritual' || seg === 'queue') && A.root.visible) {
      this.mugInHand(seg === 'ritual' && u > 0.2 && u < 0.36 ? 0.55 * Math.sin(PI * s(0.2, 0.36, u)) : 0)
    } else {
      mugM.position.copy(ON_DESK.mug)
      mugM.rotation.set(0, 0, 0)
    }
    const jug = sets.jug
    jug.position.copy(c.jugAt)
    jug.rotation.set(0, PI / 2, seg === 'coffee' ? -0.9 * s(0.2, 0.23, u) * (1 - s(0.27, 0.3, u)) : 0)
    // Sugar: a cube in his fingers, then dropped (0.76, 0.86).
    const cubeOn = seg === 'coffee' && ((u > 0.72 && u < 0.77) || (u > 0.84 && u < 0.87))
    this.cube.visible = cubeOn
    if (cubeOn) {
      const drop = u < 0.8 ? s(0.755, 0.77, u) : s(0.855, 0.87, u)
      A.rGrip.getWorldPosition(this.v)
      this.cube.position.set(lerp(this.v.x, counterMug.x, drop), lerp(this.v.y - 0.02, counterMug.y + 0.06, drop), lerp(this.v.z, counterMug.z, drop))
    }
    sets.wrappers.visible = past('coffee', 0.76)
    sets.wrappers.children[1].visible = past('coffee', 0.86)
    this.spoon.visible = seg === 'coffee' && u > 0.88
    if (this.spoon.visible) {
      const a = (u - 0.88) * 120
      this.spoon.position.set(counterMug.x + Math.cos(a) * 0.012, counterMug.y + 0.1, counterMug.z + Math.sin(a) * 0.012)
      this.spoon.rotation.set(0.15 * Math.cos(a), 0, 0.15 * Math.sin(a))
    }

    // The phone: in his hand (lit) as he comes in; face down from then on; the buzz; turned over.
    const ph = this.phone
    const deskPhone = ON_DESK.phone
    const glow = ph.glow.material as THREE.MeshBasicMaterial
    glow.opacity = 0
    ph.group.visible = !(before('enter', 0.75)) && !(seg === 'coat' && u > 0.25) && !past('query')
    if (seg === 'enter' && u < 0.82) {
      const flip = s(0.79, 0.81, u)
      A.rGrip.getWorldPosition(this.v)
      const down = s(0.8, 0.82, u)
      ph.group.position.set(lerp(this.v.x, deskPhone.x, down), lerp(this.v.y - 0.02, deskPhone.y, down), lerp(this.v.z, deskPhone.z, down))
      ph.group.rotation.set(0, 0.35, PI * flip)
      if (ph.group.rotation.z > 0.01) ph.group.position.y += 0.0084 * flip
    } else if (seg === 'message' && u >= 0.3 && u < 0.95) {
      this.holdPhone()
    } else if (seg === 'coat' && u < 0.25) {
      this.holdPhone()
    } else {
      const turned = past('message', 0.1)
      const flip = seg === 'message' ? s(0.06, 0.1, u) : turned ? 1 : 0
      const lift = seg === 'message' ? 0.05 * Math.sin(PI * s(0.06, 0.1, u)) : 0
      const buzz = seg === 'lapse' && u > 0.548 && u < 0.585 ? 0.003 * Math.sin(u * 4000) : 0
      ph.group.position.set(deskPhone.x + buzz, deskPhone.y + lift + 0.0084 * (1 - flip), deskPhone.z)
      ph.group.rotation.set(0, 0.35, PI * (1 - flip))
      if (seg === 'lapse') glow.opacity = u > 0.548 && u < 0.6 ? 0.55 * (1 - s(0.585, 0.6, u)) : 0
      ph.glow.position.set(deskPhone.x, deskPhone.y + 0.0012, deskPhone.z)
      ph.glow.rotation.set(-PI / 2, 0, 0.35)
    }

    // The tally counter: in the tray; in his right hand while he counts; back in the tray (thumb 0.1).
    const cnt = this.counter
    const counting = seg === 'traffic' || (seg === 'thumb' && u < 0.1)
    if (counting) {
      A.rGrip.getWorldPosition(this.v)
      cnt.group.position.set(this.v.x, this.v.y - 0.008, this.v.z - 0.01)
      cnt.group.rotation.set(seg === 'traffic' && u > 0.62 ? -1.1 : -0.3, 0.2, 0)
    } else {
      cnt.group.position.set(ON_DESK.tray.x + 0.03, ON_DESK.tray.y + 0.03, ON_DESK.tray.z)
      cnt.group.rotation.set(-PI / 2, 0, 0.4)
    }
    const n = seg === 'traffic' ? (u < 0.5 ? Math.round(212 * s(0.05, 0.5, u) * 0.86) : u < 0.52 ? 0 : Math.round(212 * clamp((u - 0.52) / 0.08))) : past('traffic', 0.6) ? 212 : 0
    cnt.set(n)

    // The fist (the rig's hands are open): from the moment he balances the coin until he opens his hand.
    const fistOn = A.root.visible && ((seg === 'thumb' && u >= 0.27) || seg === 'palm' || (seg === 'youSaid' && u < 0.03))
    this.fist.visible = fistOn
    if (this.rHandMesh) this.rHandMesh.visible = !fistOn
    if (fistOn) {
      A.joints.rHand.getWorldPosition(this.v)
      this.fist.position.copy(this.v)
      this.fist.rotation.set(seg === 'thumb' ? 0.12 : 0, this.arif.yaw - PI, seg === 'thumb' ? -0.1 : 0.25)
      this.fist.updateMatrixWorld(true)
    }
    const nail = this.fist.localToWorld((this.fist.userData.nail as THREE.Vector3).clone())
    // The coin: in the pocket; on his thumbnail; spinning up; in his palm; on the desk.
    const co = this.coin
    co.visible = past('thumb', 0.24) && before('rules')
    if (seg === 'thumb') {
      if (u < 0.3) {
        A.rGrip.getWorldPosition(this.v)
        co.position.copy(this.v)
        co.rotation.set(0.6, 0, 0)
      } else if (u < 0.94) {
        co.position.copy(nail).add(v3(0, 0.0011, 0))
        co.rotation.set(0.1, 0.4, -0.08)
      } else {
        const t = (u - 0.94) / 0.06
        co.position.set(nail.x, nail.y + 0.55 * t - 0.2 * t * t, nail.z)
        co.rotation.set(u * 300, 0.4, 0)
      }
    } else if (seg === 'palm' && u < 0.05) {
      const t = s(0, 0.04, u)
      co.position.set(0.18, lerp(1.25, 0.87, t), -0.12)
      co.rotation.set(u * 200, 0, 0)
    } else if (seg === 'palm' || (seg === 'youSaid' && u < 0.02)) {
      // In the closed fist (hidden in the hand).
      co.visible = false
    } else if (seg === 'youSaid') {
      // On the open palm (the hand turned palm up), TURA side up.
      if (u < 0.32) {
        A.joints.rHand.rotateY(PI)
        A.joints.rHand.updateMatrixWorld(true)
      }
      const palm = A.joints.rHand.localToWorld(new THREE.Vector3(0, -0.055, -0.024))
      co.position.copy(palm).add(v3(0, 0.003, 0))
      co.rotation.set(0, 0.3, 0)
    } else {
      co.position.set(0.32, 0.755 + 0.0009, -0.3)
      co.rotation.set(0, 0.3, 0)
    }

    // The coin slip: printed at thumb 0.55, torn off at palm 0.14, held, then laid on the desk.
    const coinLines = c.coin === 'yazi' ? ['YAZI DİYECEKSİNİZ.'] : c.coin === 'tura' ? ['TURA DİYECEKSİNİZ.'] : ['HİÇBİR ŞEY', 'DEMEYECEKSİNİZ.']
    const decided = f.flags.has('coin:yazi') || f.flags.has('coin:tura') || f.flags.has('coin:none')
    const slipKey = decided ? c.coin : 'blank'
    if (slipKey !== this.slipKey) {
      this.slipKey = slipKey
      this.slip.paper.redraw((cx, W, H) => P.drawSlip(cx, W, H, { stamp: '21:10:00', lines: decided ? [...coinLines, 'PARA TURA GELECEK.'] : ['· · ·'] }))
    }
    const sl = this.slip
    const printer = ON_DESK.printer
    const pr = sets.receipt
    pr.position.copy(printer)
    sl.mesh.visible = past('thumb', 0.55) && before('rules')
    if (seg === 'thumb' || (seg === 'palm' && u < 0.14)) {
      // Out of the slot toward Arif, over the lip, hanging.
      const out = seg === 'thumb' ? 0.1 * s(0.55, 0.58, u) : 0.1
      const yaw = pr.rotation.y
      const fwd = v3(Math.sin(yaw), 0, Math.cos(yaw))
      const side = v3(Math.cos(yaw), 0, -Math.sin(yaw))
      const lip = v3(printer.x, printer.y + 0.098, printer.z).addScaledVector(fwd, 0.05)
      sl.shape((d, o, sd) => {
        // d measured from the free end back toward the slot.
        const fromSlot = out - d
        if (fromSlot < 0.02) o.copy(lip).addScaledVector(fwd, fromSlot - 0.02)
        else {
          const a = Math.min(PI / 2, (fromSlot - 0.02) / 0.03)
          const r = 0.03
          if (fromSlot - 0.02 < r * (PI / 2)) o.copy(lip).addScaledVector(fwd, Math.sin(a) * r).add(v3(0, -(1 - Math.cos(a)) * r, 0))
          else o.copy(lip).addScaledVector(fwd, r).add(v3(0, -r - (fromSlot - 0.02 - r * (PI / 2)), 0))
        }
        sd.copy(side)
      }, Math.max(0.005, out))
    } else if (seg === 'palm' || (seg === 'youSaid' && u < 0.02)) {
      const hp = c.slipHeld
      sl.shape((d, o, sd) => {
        o.set(hp.x + 0.004 * Math.sin(d * 30), hp.y + 0.06 - d * 0.9, hp.z - 0.012 * (d / 0.12) ** 2)
        sd.set(1, 0, 0)
      }, 0.12)
      sl.mesh.position.set(0, 0, 0)
    } else {
      // Laid on the desk beside the keyboard.
      sl.shape((d, o, sd) => {
        o.set(-0.18 + 0.003 * Math.sin(d * 40), 0.756 + 0.004 * Math.sin(d * 30), -0.3 + d * 0.95)
        sd.set(0.98, 0, 0.2)
      }, 0.12)
    }

    // The envelope: printed, folded, sealed (envelope); carried; on the desk; torn open (opened 0.42).
    const env = this.envelope
    const tray = v3(-4.42, 0.735, 3.06)
    env.visible = past('envelope', 0.4) && before('opened', 0.44)
    const pg = this.pagePrint
    pg.visible = seg === 'envelope' && u > 0.06 && u < 0.4
    if (pg.visible) {
      const t = s(0.06, 0.3, u)
      const ins = s(0.3, 0.4, u)
      pg.position.set(-4.4 + 0.05 * t, 0.985 - 0.06 * ins, 2.7 + 0.12 * t + 0.25 * ins)
      pg.scale.set(1, 1 - 0.6 * ins, 1)
    }
    sets.sealArm.rotation.z = seg === 'envelope' ? -0.35 * Math.sin(PI * s(0.4, 0.45, u)) : 0
    if (seg === 'envelope' && u < 0.75) {
      const d = s(0.42, 0.47, u)
      env.position.set(lerp(-4.5, tray.x, d), lerp(0.79, tray.y + 0.012, d), lerp(3.06, tray.z, d))
      env.rotation.set(0, PI / 2, 0)
    } else if (seg === 'envelope') {
      // In his hands; turned over to look at the seal (0.8–1.0).
      A.rGrip.getWorldPosition(this.v)
      env.position.set(this.v.x - 0.02, this.v.y + 0.02, this.v.z)
      const turn = s(0.8, 0.95, u)
      env.rotation.set(-0.9 + PI * turn, this.arif.yaw, 0)
    } else if (seg === 'contrary' && u < 0.18) {
      A.lGrip.getWorldPosition(this.v)
      env.position.set(this.v.x, this.v.y, this.v.z)
      env.rotation.set(-0.6, this.arif.yaw, 0)
    } else if (seg === 'opened' && u > 0.4) {
      // Lifted and torn.
      const t = s(0.4, 0.43, u)
      env.position.set(lerp(ON_DESK.envelope.x, 0.0, t), lerp(ON_DESK.envelope.y, 1.0, t), lerp(ON_DESK.envelope.z, -0.18, t))
      env.rotation.set(lerp(0, 1.1, t), 0.2, 0)
    } else {
      env.position.copy(ON_DESK.envelope)
      env.rotation.set(0, 0.25, 0)
    }
    // The page: out of the envelope, unfolded, held; then in the bin.
    const pgKey = c.glass
    if (pgKey !== this.pageKey) {
      this.pageKey = pgKey
      const first = c.glass === 'kitchen' ? 'Bardağı mutfağa götüreceksin.' : c.glass === 'break' ? 'Bardağı kıracaksın.' : 'Hiçbir şey yapmayacaksın.'
      this.page.redraw((cx, W, H) => P.drawPage(cx, W, H, { lines: [first, 'Tersini yapmaya çalışacaksın.', 'Bunu da ben söyledim diye yapacaksın.'] }))
    }
    const pgM = this.page.mesh
    pgM.visible = (seg === 'opened' && u > 0.43) || (seg === 'selin' && u < 0.98)
    if (pgM.visible) {
      // Read in both hands (opened 0.43–0.82); laid on the desk while he laughs; held up for Selin
      // ("Benim.", selin 0.38–0.66), on the desk before and after.
      const onDesk = v3(-0.37, 0.761, -0.38)
      const held = seg === 'opened' ? 1 - s(0.81, 0.84, u) : Math.sin(PI * s(0.38, 0.66, u))
      if (seg === 'opened') {
        const unfold = s(0.43, 0.47, u)
        pgM.position.copy(c.pageAt)
        pgM.scale.set(1, lerp(0.34, 1, unfold), 1)
        faceToward(pgM, v3(0.3, 1.3, 0.02))
      } else {
        A.rGrip.getWorldPosition(this.v)
        pgM.position.set(this.v.x, this.v.y + 0.12, this.v.z)
        pgM.scale.set(1, 1, 1)
        faceToward(pgM, v3(0.5, 1.4, 0.8))
      }
      if (held < 1) {
        const q0 = pgM.quaternion.clone()
        const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-PI / 2, 0, 0.15))
        pgM.position.lerp(onDesk, 1 - held)
        pgM.quaternion.copy(q0).slerp(flat, 1 - held)
      }
    }
    sets.crumple.visible = past('boxes')

    // The pen: on the desk; picked up and dropped on purpose (contrary 0.5); on the carpet after.
    const pen = this.pen
    if (seg === 'contrary' && u > 0.44 && u < 0.5) {
      A.lGrip.getWorldPosition(this.v)
      pen.position.set(this.v.x, this.v.y - 0.04, this.v.z)
      pen.rotation.set(0.2, 0, 0.3)
    } else if (seg === 'contrary' && u >= 0.5 && u < 0.56) {
      const t = s(0.5, 0.55, u)
      const from = v3(-0.32, 1.0, -0.2)
      const bounce = Math.abs(Math.sin(t * PI * 2.5)) * (1 - t) * 0.04
      pen.position.set(lerp(from.x, ON_DESK.penFloor.x, t), lerp(from.y, ON_DESK.penFloor.y, Math.min(1, t * 1.4)) + bounce, lerp(from.z, ON_DESK.penFloor.z, t))
      pen.rotation.set(PI / 2 * t, 0.3, 0.3 + t * 0.8)
    } else if (past('contrary', 0.55)) {
      pen.position.copy(ON_DESK.penFloor)
      pen.rotation.set(PI / 2, 0.3, 1.1)
    } else {
      pen.position.copy(ON_DESK.pen)
      pen.rotation.set(PI / 2, 0, 1.2)
    }

    // The water glass: on its mark; in his hand; to the kitchen, broken, or back on its mark.
    const gl = this.glass
    const inHand = (seg === 'contrary' && ((u > 0.6 && u < 0.72) || u > 0.8)) || (seg === 'glassChoice' && (u < 0.5 || (c.glass === 'none' && u < 0.6) || (c.glass === 'break' && u < 0.56) || c.glass === 'kitchen'))
    const kitchenWay = c.glass === 'kitchen' && (past('glassChoice', 0.5) && before('opened', 0.28))
    const broken = c.glass === 'break' && past('glassChoice', 0.56)
    gl.visible = !broken && !(c.glass === 'kitchen' && past('opened', 0.28) && !(seg === 'opened' && u < 0.3))
    sets.kitchenGlass.visible = false
    if (kitchenWay || inHand) {
      const g = seg === 'opened' ? A.rGrip : seg === 'glassChoice' && c.glass === 'kitchen' && u > 0.5 ? A.rGrip : A.lGrip
      g.getWorldPosition(this.v)
      if (seg === 'opened' && u > 0.08 && u < 0.26) this.v.set(-2.58, 0.98, 9.42)
      gl.position.set(this.v.x, this.v.y - 0.05, this.v.z)
      if (seg === 'glassChoice' && c.glass === 'break' && u > 0.5) {
        const t = s(0.5, 0.56, u)
        gl.position.set(lerp(this.v.x, -0.45, t), lerp(this.v.y - 0.05, 0.72, t), lerp(this.v.z, -0.2, t))
      }
      gl.rotation.set(0, 0, 0)
      ;(gl.getObjectByName('water') as THREE.Mesh).visible = !(seg === 'opened' && u > 0.2)
    } else if (c.glass === 'kitchen' && past('opened', 0.28)) {
      gl.visible = true
      gl.position.set(-2.62, 1.908, 9.7)
      ;(gl.getObjectByName('water') as THREE.Mesh).visible = false
    } else {
      gl.position.copy(ON_DESK.glass)
      ;(gl.getObjectByName('water') as THREE.Mesh).visible = true
    }
    sets.cupDoor.rotation.y = c.glass === 'kitchen' && seg === 'opened' ? -1.5 * Math.sin(PI * s(0.25, 0.31, u)) : 0
    sets.stream.visible = c.glass === 'kitchen' && seg === 'opened' && u > 0.08 && u < 0.2
    // Shards and the stain: from the break until he sweeps them up (lapse 0.15); the stain stays.
    const shardAt = v3(-0.55, 0, -0.05)
    this.shards.shards.visible = broken && before('lapse', 0.15)
    this.shards.base.visible = this.shards.shards.visible
    this.shards.stain.visible = broken
    this.shards.shards.position.copy(shardAt)
    this.shards.base.position.set(shardAt.x + 0.06, 0.004, shardAt.z - 0.04)
    this.shards.stain.position.set(shardAt.x + 0.05, 0.004, shardAt.z + 0.02)
    const spread = seg === 'glassChoice' ? s(0.56, 0.75, u) : 1
    this.shards.stain.scale.set(0.3 + 0.7 * spread, 0.25 + 0.55 * spread, 1)
    this.dustpan.visible = c.glass === 'break' && seg === 'lapse' && u > 0.12 && u < 0.15
    this.dustpan.position.set(-0.45, 0, 0.12)

    // The two boxes: carried in by Selin; on the desk; opened; carried out in the time-lapse.
    const bx = this.boxes
    const shown = between('boxes', 0, 'lapse', 0.12)
    bx.a.visible = shown
    bx.b.visible = shown
    const S_ = this.selin.figure
    if (seg === 'boxes' && u < 0.3) {
      S_.rGrip.getWorldPosition(this.v)
      const l = S_.lGrip.getWorldPosition(new THREE.Vector3())
      this.v.add(l).multiplyScalar(0.5)
      bx.b.position.set(this.v.x, this.v.y - 0.02, this.v.z)
      bx.a.position.set(this.v.x, this.v.y + 0.19, this.v.z)
      bx.a.rotation.set(0, this.selin.yaw, 0)
      bx.b.rotation.set(0, this.selin.yaw, 0)
    } else if (seg === 'lapse') {
      A.rGrip.getWorldPosition(this.v)
      const l = A.lGrip.getWorldPosition(new THREE.Vector3())
      this.v.add(l).multiplyScalar(0.5)
      const t = s(0.02, 0.04, u)
      bx.b.position.set(lerp(c.boxB.x, this.v.x, t), lerp(c.boxB.y, this.v.y - 0.02, t), lerp(c.boxB.z, this.v.z, t))
      bx.a.position.set(lerp(c.boxA.x, this.v.x, t), lerp(c.boxA.y, this.v.y + 0.19, t), lerp(c.boxA.z, this.v.z, t))
      bx.a.rotation.set(0, lerp(0, this.arif.yaw, t), 0)
      bx.b.rotation.set(0, lerp(0, this.arif.yaw, t), 0)
    } else {
      bx.a.position.copy(c.boxA)
      bx.b.position.copy(c.boxB)
      bx.a.rotation.set(0, seg === 'choose' || past('choose', 0.6) ? (c.box === 'one' ? 0.35 : -0.2) * (seg === 'choose' ? s(0.52, 0.6, u) : 1) : 0, 0)
      const tilt = c.box === 'two' && seg === 'lid' ? -0.35 * s(0.08, 0.16, u) * (1 - s(0.5, 0.6, u)) : 0
      bx.b.rotation.set(tilt, 0, 0)
    }
    const opened = past('choose', 0.65)
    bx.lid.rotation.x = seg === 'choose' ? -1.95 * s(0.65, 0.75, u) : opened ? -1.95 : 0
    const torn = past('choose', 0.6)
    for (const pl of [bx.sealTop, bx.sealFront]) pl.redraw((cx, W, H) => (torn ? P.drawSealTorn(cx, W, H) : P.drawSeal(cx, W, H)), torn ? 'torn' : 'whole')
    // Inside B: the cheque with its slip (one) or the slip taped flat (two).
    const one = c.box === 'one'
    const boxSlip = one ? ['ÇARŞAMBA 23.58', 'YALNIZCA B’Yİ ALACAKSINIZ.', 'KURUL BUNU GERİ İSTEYECEK.'] : ['ÇARŞAMBA 23.58', 'İKİSİNİ BİRDEN ALACAKSINIZ.', 'O YÜZDEN BU KUTU BOŞ.']
    const boxDecided = f.flags.has('box:one') || f.flags.has('box:two')
    const bk = boxDecided ? c.box : 'none'
    if (bk !== this.boxSlipKey) {
      this.boxSlipKey = bk
      const draw = (cx: CanvasRenderingContext2D, W: number, H: number) => P.drawSlip(cx, W, H, { stamp: boxSlip[0], lines: boxSlip.slice(1) })
      bx.slipOne.redraw(draw)
      bx.slipTwo.redraw(draw)
    }
    bx.cheque.visible = one && boxDecided
    bx.slipTwo.mesh.visible = !one && boxDecided && !(seg === 'lid' && u > 0.45) && !past('after')
    bx.slipOne.mesh.visible = one && boxDecided && !(seg === 'lid' && u > 0.45) && !past('after')
    // Lifted out of B: the cheque in his right hand (lid 0.1 →), its slip into his left (0.45).
    const chequeHeld = one && ((seg === 'lid' && u > 0.26) || (seg === 'after' && u < 0.5))
    const chequeDesk = one && (past('after', 0.5) && before('lapse', 0.12))
    if (chequeHeld || chequeDesk) {
      bx.b.remove(bx.cheque)
      this.scene.add(bx.cheque)
      if (chequeHeld) {
        // Lifted off B's floor into his hand (lid 0.26–0.36), then held up.
        const k = seg === 'lid' ? s(0.26, 0.36, u) : 1
        bx.cheque.position.set(c.boxB.x, c.boxB.y + 0.006, c.boxB.z).lerp(c.chequeAt, k)
        bx.cheque.rotation.set(1.15 * k, 0.0, 0)
      } else {
        bx.cheque.position.set(0.02, 0.756, -0.27)
        bx.cheque.rotation.set(0, 0.25, 0)
      }
    } else if (bx.cheque.parent !== bx.b) {
      this.scene.remove(bx.cheque)
      bx.b.add(bx.cheque)
      bx.cheque.position.set(0, 0.006, 0)
      bx.cheque.rotation.set(0, 0, 0)
    }
    // A's notes in his hand (box:two, after), then on the desk.
    const notesHeld = !one && seg === 'after' && u < 0.5
    const notesDesk = !one && past('after', 0.5) && before('lapse', 0.12)
    this.heldNotes.visible = notesHeld || notesDesk
    bx.notes.visible = !(notesHeld || notesDesk)
    if (notesHeld) {
      this.heldNotes.position.copy(c.chequeAt)
      this.heldNotes.rotation.set(1.1, 0, 0)
    } else if (notesDesk) {
      this.heldNotes.position.set(-0.02, 0.756, -0.27)
      this.heldNotes.rotation.set(0, 0.3, 0)
    }
    // The box slip held up to read (lid 0.45 → after).
    const boxSlipHeld = seg === 'lid' && u > 0.45
    if (boxSlipHeld) {
      const sp = one ? bx.slipOne : bx.slipTwo
      sp.mesh.visible = false
      this.slip.mesh.visible = true
      if (this.slipKey !== `box-${bk}`) {
        this.slipKey = `box-${bk}`
        this.slip.paper.redraw((cx, W, H) => P.drawSlip(cx, W, H, { stamp: boxSlip[0], lines: boxSlip.slice(1) }))
      }
      const hp = c.slipHeld
      this.slip.shape((d, o, sd) => {
        o.set(hp.x + 0.003 * Math.sin(d * 30), hp.y + 0.06 - d * 0.88, hp.z - 0.014 * (d / 0.12) ** 2)
        sd.set(1, 0, 0)
      }, 0.13)
    }
    // Keyboard and mouse pushed back for the boxes (boxes 0.22 → lapse 0.12).
    const back = seg === 'boxes' ? s(0.18, 0.26, u) : between('boxes', 0.26, 'lapse', 0.12) ? 1 : 0
    sets.keyboard.position.z = ON_DESK.keyboard.z - 0.18 * back
    sets.mouse.position.z = ON_DESK.mouse.z - 0.2 * back
    sets.mouse.position.x = ON_DESK.mouse.x + 0.1 * back

    // Selin's tea glass: on her desk; in her hand when she comes over, in the hall, at the aisle's end.
    const tea = this.tea
    const teaHand = (seg === 'selin' && u < 1) || seg === 'wait' || seg === 'samePace'
    if (teaHand) {
      S_.rGrip.getWorldPosition(this.v)
      tea.position.set(this.v.x, this.v.y - 0.035, this.v.z)
    } else if (seg === 'heat' || seg === 'hallWalk' || seg === 'selfQ') tea.position.set(-4.4, 2.0, -9.9)
    else tea.position.set(3.22, 0.754, 1.82)
    tea.visible = !(p >= at('input') && !teaHand)
    // Her paper bag: pulled closer (ritual 0.8).
    const bagT = seg === 'ritual' ? s(0.78, 0.86, u) : past('ritual', 0.86) ? 1 : 0
    sets.selinBag.position.set(lerp(3.32, 3.18, bagT), 0.754, lerp(0.8, 1.02, bagT))
    // The half simit on a napkin by his keyboard (lapse 0.28), eaten (0.65–0.82).
    const hs = this.halfSimit
    hs.visible = between('lapse', 0.28, 'lapse', 0.82)
    if (seg === 'lapse' && u > 0.66 && u < 0.82) {
      A.rGrip.getWorldPosition(this.v)
      hs.position.set(this.v.x, this.v.y - 0.03, this.v.z)
      hs.children[1].visible = false
    } else {
      hs.position.set(0.3, 0.755, -0.3)
      hs.rotation.y = 0.5
      hs.children[1].visible = true
    }
    this.trolley.visible = between('lapse', 0.15, 'lapse', 0.5)
    // The tablet (heat) and the torch (selfQ).
    const tb = this.tablet
    tb.group.visible = seg === 'heat' || seg === 'hallWalk'
    if (tb.group.visible) {
      S_.rGrip.getWorldPosition(this.v)
      const l = S_.lGrip.getWorldPosition(new THREE.Vector3())
      this.v.add(l).multiplyScalar(0.5)
      tb.group.position.set(this.v.x, this.v.y + 0.07, this.v.z)
      tb.group.rotation.set(-0.5, this.selin.yaw, 0, 'YXZ')
    }
    this.torch.visible = seg === 'selfQ'
    if (this.torch.visible) {
      attach(this.torch, S_.joints.rHand, [0, -0.09, 0.02], [PI / 2, 0, 0])
    }

    // The forest: the frond sways; the butterfly opens, lifts off, banks left.
    const forest = seg === 'forest'
    this.frond.visible = forest
    this.fly.group.visible = forest && u < 0.82
    if (forest) {
      const gust = s(0.04, 0.1, u) * (1 - s(0.2, 0.4, u))
      const wind = 0.04 * Math.sin(c.time * 1.3) + 0.12 * gust * Math.sin(c.time * 7) + (u > 0.6 && u < 0.75 ? 0.08 * Math.sin((u - 0.6) * 60) * (1 - s(0.6, 0.75, u)) : 0)
      this.frond.rotation.set(wind * 0.6, 0, wind)
      this.frond.updateMatrixWorld(true)
      const tip = (this.frond.userData.tip as THREE.Vector3).clone().applyMatrix4(this.frond.matrixWorld)
      const fl2 = this.fly.group
      const lift = s(0.6, 0.8, u)
      fl2.position.set(tip.x - 0.35 * lift * lift - 0.05 * lift, tip.y + 0.004 + 0.32 * lift, tip.z + 0.06 * lift)
      fl2.rotation.set(0, 0.6 - 1.4 * lift, -0.5 * lift)
      const open = u < 0.6 ? s(0.1, 0.18, u) : 0.5 + 0.5 * Math.sin(u * 900)
      this.fly.set(open)
      for (const fern of sets.ferns) fern.rotation.z = 0.03 * Math.sin(c.time * 1.1 + fern.position.x) + 0.05 * gust * Math.sin(c.time * 6)
    }
  }

  /**
   * The mug in Arif's right hand: against the palm, 4.5 cm inward of the grip (never around the
   * grip point itself), the handle toward his fingers; `tilt` lifts the rim toward his face.
   */
  private mugInHand(tilt: number) {
    const A = this.arif.figure
    const yaw = this.arif.yaw
    A.rGrip.getWorldPosition(this.v)
    const lx = Math.cos(yaw)
    const lz = -Math.sin(yaw)
    this.mug.position.set(this.v.x + lx * 0.045, this.v.y - 0.05, this.v.z + lz * 0.045)
    const ry = Math.atan2(Math.sin(yaw + PI), Math.cos(yaw + PI))
    this.mug.rotation.set(tilt, ry, 0, 'YXZ')
  }

  private holdPhone() {
    const A = this.arif.figure
    const r = A.rGrip.getWorldPosition(new THREE.Vector3())
    const l = A.lGrip.getWorldPosition(new THREE.Vector3())
    const ph = this.phone.group
    // In both hands: on the scripted point once the hands have closed on it (message 0.34 →).
    const c = this.ctx
    const w = c && c.seg === 'message' ? s(0.3, 0.34, c.u) : 1
    ph.position.copy(r).add(l).multiplyScalar(0.5)
    ph.position.y += 0.01
    if (c) ph.position.lerp(c.phoneHeld, w)
    // Screen toward his eyes.
    A.joints.head.getWorldPosition(this.v)
    const look = new THREE.Matrix4().lookAt(ph.position, this.v, v3(0, 1, 0))
    ph.quaternion.setFromRotationMatrix(look)
    ph.rotateX(-PI / 2)
    ph.rotateY(PI)
  }

  // ——— Screens ———

  private screens(f: SetFrame, c: Ctx) {
    const { seg, u, p } = c
    const t = f.time
    const sets = this.sets
    const hours = storyHours(p)
    const clock = clockText(hours)
    const tick = (hz: number) => Math.floor(t * hz)
    const band = durumLine(p, f.flags)
    const bandKey = band ? `${band.lines.join('|')}:${band.typed.map((x) => Math.round(x * 40)).join(',')}` : 'none'
    const past = (id: SegmentId, f0 = 0) => p >= at(id, f0)
    const before = (id: SegmentId, f0 = 0) => p < at(id, f0)
    // Every screen at once (input 0.5 → turn 0.05); then only the wall display until freedom 0.5.
    const alertAll = (seg === 'input' && u >= 0.5) || (seg === 'turn' && u < 0.05)
    const darkAll = (seg === 'turn' && u >= 0.05) || seg === 'list' || seg === 'observerN' || (seg === 'freedom' && u < 0.5)
    const alert = (scr: ReturnType<typeof canvasPlane>) => scr.redraw((cx, W, H) => S.drawAlert(cx, W, H, { t }), `alert-${tick(2)}`)
    const off = (scr: ReturnType<typeof canvasPlane>) => scr.redraw((cx, W, H) => S.drawOff(cx, W, H), 'off')

    // ——— The wall display ———
    const wd = sets.wd
    const model = (o: { fan?: number; haze?: number; flagged?: number; dim?: number; b?: S.Band | null } = {}) =>
      wd.redraw((cx, W, H) => S.drawModel(cx, W, H, { clock, t, fan: o.fan, haze: o.haze, flagged: o.flagged, dim: o.dim, band: o.b === undefined ? band : o.b }), `model-${clock}-${tick(4)}-${Math.round((o.fan ?? 0) * 20)}-${o.haze ?? 0}-${o.flagged ?? 0}-${o.dim ?? 0}-${o.b === undefined ? bandKey : o.b ? o.b.lines.join() : 'x'}`)
    const lone = (lines: string[], typed: number[], key: string, size?: number) => wd.redraw((cx, W, H) => S.drawLone(cx, W, H, { lines, typed, t, size }), `lone-${key}-${typed.map((x) => Math.round(x * 50)).join(',')}-${tick(2)}`)
    switch (seg) {
      case 'open':
      case 'enter':
        model({ dim: 0.2 })
        break
      case 'intro':
        model({ fan: s(0.38, 0.6, u) * (1 - s(0.9, 1, u) * 0) })
        break
      case 'rules':
        wd.redraw((cx, W, H) => S.drawRules(cx, W, H, { clock, t, band }), `rules-${bandKey}-${tick(2)}`)
        break
      case 'split':
        if (u < 0.5) wd.redraw((cx, W, H) => S.drawRules(cx, W, H, { clock, t, band: null }), `rules-x-${tick(2)}`)
        else wd.redraw((cx, W, H) => S.drawRegister(cx, W, H, { clock, t, rows: s(0.5, 0.75, u), band: null }), `reg-${Math.round(s(0.5, 0.75, u) * 31)}`)
        break
      case 'after':
        if (u < 0.74) model()
        else lone(['Bu evrende yanılmadım.'], [s(0.74, 0.8, u)], 'universe')
        break
      case 'lapse':
        model({ b: null })
        break
      case 'electron':
        wd.redraw((cx, W, H) => S.drawParticle(cx, W, H, { clock, t, spread: 0, measured: 0, trade: -1, contour: 0, band }), `pa-0-${bandKey}-${tick(2)}`)
        break
      case 'fabric': {
        const trade = u < 0.53 ? s(0.03, 0.52, u) : 0.5
        const contour = s(0.76, 0.95, u)
        wd.redraw((cx, W, H) => S.drawParticle(cx, W, H, { clock, t, spread: 0, measured: 0, trade, contour, band }), `tr-${Math.floor(trade * 4.2)}-${Math.round(contour * 40)}-${bandKey}-${tick(2)}`)
        break
      }
      case 'cloud': {
        const spread = s(0.03, 0.4, u)
        const measured = s(0.46, 0.49, u) * (1 - s(0.7, 0.95, u))
        wd.redraw((cx, W, H) => S.drawParticle(cx, W, H, { clock, t, spread, measured, trade: -1, contour: 0, band }), `cl-${Math.round(spread * 30)}-${Math.round(measured * 30)}-${bandKey}`)
        break
      }
      case 'atom':
        wd.redraw((cx, W, H) => S.drawAtom(cx, W, H, { clock, t, split: s(0.71, 0.8, u), band }), `at-${Math.round(s(0.71, 0.8, u) * 20)}-${bandKey}-${tick(2)}`)
        break
      case 'odds':
        model({ haze: 1, b: null })
        break
      case 'queue':
        if (u < 0.6) model({ b: null })
        else wd.redraw((cx, W, H) => S.drawMarmara(cx, W, H, { clock, t, band: u < 0.86 ? band : null }), `mm-${bandKey}-${tick(3)}-${u < 0.86}`)
        break
      case 'forest':
        wd.redraw((cx, W, H) => S.drawMarmara(cx, W, H, { clock, t, band: null }), `mm-x-${tick(3)}`)
        break
      case 'twoWorlds': {
        const day = u < 0.5 ? lerp(0, 2.4, s(0.03, 0.5, u)) : u < 0.55 ? lerp(2.4, 3.2, (u - 0.5) / 0.05) : lerp(3.2, 14, s(0.55, 0.95, u))
        wd.redraw((cx, W, H) => S.drawTwoSims(cx, W, H, { clock, t, cursor: day / 14, band: null }), `ts-${Math.round(day * 20)}`)
        break
      }
      case 'tent':
        if (u < 0.75) wd.redraw((cx, W, H) => S.drawTwoSims(cx, W, H, { clock, t, cursor: 1, band }), `ts-1-${bandKey}`)
        else wd.redraw((cx, W, H) => S.drawAnkara(cx, W, H, { clock, t, marker: null, band: null }), `ank-x-${tick(2)}`)
        break
      case 'cfGate': {
        const marker = u > 0.5 && (f.flags.has('cf:air') || f.flags.has('cf:bus')) ? c.cf : null
        wd.redraw((cx, W, H) => S.drawAnkara(cx, W, H, { clock, t, marker, band: null }), `ank-${marker}-${tick(2)}`)
        break
      }
      case 'chain':
        wd.redraw((cx, W, H) => S.drawChain(cx, W, H, { clock, t, way: c.cf, u }), `ch-${c.cf}-${Math.round(u * 400)}-${tick(4)}`)
        break
      case 'knowable': {
        const fade = s(0.63, 0.7, u)
        wd.redraw((cx, W, H) => S.drawTwoMaps(cx, W, H, { clock, t, band, fade }), `km-${Math.round(fade * 10)}-${bandKey}-${tick(2)}`)
        break
      }
      case 'selfQ':
      case 'hallWalk':
      case 'heat':
      case 'wait':
      case 'samePace':
        model({ dim: 0.35, b: null })
        break
      case 'sealed':
        if (u < 0.59) model({ b: null })
        else lone(['HAYATIN, EVRENİN VE HER ŞEYİN ANLAMI NEDİR?'], [s(0.59, 0.66, u)], 'bigq', 0.07)
        break
      case 'computing':
        wd.redraw((cx, W, H) => S.drawCalc(cx, W, H, { clock, t, erase: s(0.46, 0.51, u), ready: s(0.52, 0.57, u), missing: s(0.66, 0.71, u) }), `calc-${Math.round(s(0.46, 0.51, u) * 50)}-${Math.round(s(0.52, 0.57, u) * 12)}-${Math.round(s(0.66, 0.71, u) * 12)}-${tick(2)}`)
        break
      case 'meaning':
        if (u < 0.26) wd.redraw((cx, W, H) => S.drawCalc(cx, W, H, { clock, t, erase: 1, ready: 1, missing: 1 }), 'calc-done')
        else wd.redraw((cx, W, H) => S.drawMeaning(cx, W, H, { clock, t, form: s(0.44, 0.48, u), band }), `mean-${Math.round(s(0.44, 0.48, u) * 10)}-${bandKey}`)
        break
      case 'rebuild':
      case 'answered': {
        const o = option(f.flags, 'great')
        const typed = seg === 'rebuild' ? s(0.72, 0.98, u) : 1
        if (seg === 'rebuild' && u < 0.72) wd.redraw((cx, W, H) => S.drawCalc(cx, W, H, { clock, t, erase: 1, ready: 1, missing: 1 }), 'calc-done')
        else wd.redraw((cx, W, H) => S.drawAnswer(cx, W, H, { t, question: o.label, answer: o.reply ?? [], typed }), `ans-${o.id}-${Math.round(typed * 60)}`)
        break
      }
      case 'input':
        if (u < 0.5) model({ flagged: s(0.04, 0.08, u) > 0 ? 1 : 0, b: null })
        else alert(wd)
        break
      case 'turn': {
        if (u < 0.3) alert(wd)
        else if (u < 0.37) wd.redraw((cx, W, H) => S.drawOff(cx, W, H), 'off')
        else {
          const b = lineById('knew-all', p)
          const ticks = Math.max(0, Math.floor((p - at('turn', 0.37)) * TOTAL_SCREENS * 14))
          wd.redraw((cx, W, H) => S.drawToYou(cx, W, H, { t, lines: b.lines, typed: b.typed, ticks }), `you-${b.typed.map((x) => Math.round(x * 40)).join(',')}-${ticks}-${tick(2)}`)
        }
        break
      }
      case 'list':
      case 'observerN': {
        const rows = this.listRows(f.flags)
        const amber = [s(0.03, 0.06, u), 0, s(0.36, 0.39, u), 0, s(0.69, 0.72, u)]
        if (seg === 'list') wd.redraw((cx, W, H) => S.drawList(cx, W, H, { t, rows, shown: 5 * s(0, 0.2, u) + 0.001, amber }), `list-${Math.round(s(0, 0.2, u) * 50)}-${amber.map((x) => Math.round(x * 10)).join('')}`)
        else {
          const n = c.observed ? 2 : 1
          const b = durumLine(p, f.flags)
          wd.redraw((cx, W, H) => S.drawCount(cx, W, H, { t, n, fade: s(0.02, 0.06, u), band: u > 0.48 ? b : null }), `count-${n}-${Math.round(s(0.02, 0.06, u) * 10)}-${b ? b.typed.join() : ''}-${u > 0.48}-${tick(2)}`)
        }
        break
      }
      case 'freedom':
        if (u < 0.5) {
          const n = c.observed ? 2 : 1
          wd.redraw((cx, W, H) => S.drawCount(cx, W, H, { t, n, fade: 1 - s(0.3, 0.48, u), band: null }), `count-f-${n}-${Math.round(s(0.3, 0.48, u) * 10)}`)
        } else model({ b: null, dim: 1 - s(0.5, 0.75, u) })
        break
      case 'message':
      case 'coat':
        model({ b: null })
        break
      case 'query': {
        if (u < 0.69) {
          const b = lineById('ask-first', p)
          lone(b.lines, b.typed, 'ask')
        } else {
          const b = lineById('i-know', p)
          lone(b.lines, b.typed, 'iknow')
        }
        break
      }
      case 'queryGate':
      case 'answer':
      case 'gone': {
        const yes = c.end === 'yes'
        const decided = f.flags.has('end:yes') || f.flags.has('end:no')
        if (seg === 'gone' && u > 0.8) off(wd)
        else if (seg === 'queryGate' && (u < 0.5 || !decided)) wd.redraw((cx, W, H) => S.drawQuery(cx, W, H, { t, question: 'GELECEĞİNİ BİLMEK İSTER MİSİN?', reply: [], typed: [], standby: 0 }), `q-${tick(2)}`)
        else if (yes) {
          const reply = option(f.flags, 'future').reply ?? []
          if (seg === 'answer' && u >= 0.51) {
            const b = lineById('unbreakable', p)
            lone(b.lines, b.typed, 'unbreak')
          } else if (seg === 'gone') {
            lone(['Bu, bozulmayan türden.'], [1], 'unbreak-f')
          } else {
            const typed = seg === 'queryGate' ? reply.map((_, i) => s(0.52 + i * 0.14, 0.64 + i * 0.14, u)) : reply.map(() => 1)
            lone(reply, typed, 'reply', 0.062)
          }
        } else {
          const standby = seg === 'answer' ? s(0.51, 0.56, u) : seg === 'gone' ? 1 : 0
          wd.redraw((cx, W, H) => S.drawQuery(cx, W, H, { t, question: 'GELECEĞİNİ BİLMEK İSTER MİSİN?', reply: [], typed: [], standby }), `q-sb-${Math.round(standby * 10)}-${tick(2)}`)
        }
        break
      }
      case 'end':
        off(wd)
        break
      default:
        model()
    }

    // ——— Main monitor ———
    const mm = sets.mm
    const prompt = band
    const console_ = (alertLine?: string | null) => mm.redraw((cx, W, H) => S.drawConsole(cx, W, H, { clock, t, prompt, alert: alertLine ?? null }), `con-${clock}-${tick(2)}-${bandKey}-${alertLine ?? ''}`)
    if (before('intro', 0.2)) off(mm)
    else if (alertAll) alert(mm)
    else if (darkAll) off(mm)
    else
      switch (seg) {
        case 'lapse': {
          const show = clockText(hours)
          mm.redraw((cx, W, H) => S.drawSaver(cx, W, H, { clock: show }), `saver-${show}`)
          break
        }
        case 'queue':
          mm.redraw((cx, W, H) => S.drawQueue(cx, W, H, { clock, t, open: s(0.3, 0.38, u), prompt: null }), `queue-${Math.round(s(0.3, 0.38, u) * 20)}-${tick(2)}`)
          break
        case 'selfQ':
          if (u < 0.4) console_()
          else mm.redraw((cx, W, H) => S.drawRecursion(cx, W, H, { clock, t, prompt: band, depth: 4 }), `rec-${bandKey}-${tick(2)}`)
          break
        case 'sealed':
          if (u < 0.59) mm.redraw((cx, W, H) => S.drawSealed(cx, W, H, { clock, t, rise: s(0.03, 0.45, u), crack: s(0.55, 0.6, u) }), `sealed-${Math.round(s(0.03, 0.45, u) * 80)}-${Math.round(s(0.55, 0.6, u) * 10)}`)
          else console_()
          break
        case 'meaning':
          if (u < 0.73) console_()
          else mm.redraw((cx, W, H) => S.drawKurul(cx, W, H, { clock, t, select: s(0.85, 0.9, u), erased: u > 0.93 }), `kurul-${Math.round(s(0.85, 0.9, u) * 10)}-${u > 0.93}-${tick(2)}`)
          break
        case 'rebuild':
        case 'answered': {
          const decided = f.flags.has('q:nothing') || f.flags.has('q:death') || f.flags.has('q:what')
          const o = option(f.flags, 'great')
          const typed = seg === 'rebuild' ? (decided ? s(0.52, 0.7, u) : 0) : 1
          const entered = seg === 'answered' || (decided && u > 0.72)
          mm.redraw((cx, W, H) => S.drawRebuild(cx, W, H, { clock, t, question: decided ? o.label : '', typed, entered }), `reb-${o.id}-${Math.round(typed * 40)}-${entered}-${tick(2)}`)
          break
        }
        case 'input':
          console_(s(0.04, 0.08, u) > 0 ? 'TANIMSIZ GİRDİ · KOORDİNAT YOK · KAYNAK ?' : null)
          break
        case 'gone':
          if (u < 0.48) console_()
          else mm.redraw((cx, W, H) => S.drawUnknown(cx, W, H, { t, typed: s(0.48, 0.62, u) }), `unk-${Math.round(s(0.48, 0.62, u) * 40)}-${tick(2)}`)
          break
        case 'end':
          mm.redraw((cx, W, H) => S.drawUnknown(cx, W, H, { t, typed: 1 }), `unk-end-${tick(2)}`)
          break
        default:
          console_()
      }

    // ——— Left: the prediction log; later the query history ———
    const lm = sets.lm
    if (before('intro', 0.2) || (seg === 'gone' && u > 0.52) || seg === 'end') off(lm)
    else if (alertAll) alert(lm)
    else if (darkAll) off(lm)
    else if (past('query')) lm.redraw((cx, W, H) => S.drawPredLog(cx, W, H, { clock, t, verified: 1, history: true }), `hist-${clock}`)
    else {
      const verified = seg === 'traffic' ? s(0.74, 0.77, u) : past('traffic', 0.77) ? 1 : 0
      lm.redraw((cx, W, H) => S.drawPredLog(cx, W, H, { clock, t, verified }), `pred-${verified > 0.5}-${clock}`)
    }

    // ——— Right: the traffic recording (traffic), else the cooling load ———
    const rm = sets.rm
    if (before('intro', 0.2) || (seg === 'gone' && u > 0.45) || seg === 'end') off(rm)
    else if (alertAll) alert(rm)
    else if (darkAll) off(rm)
    else if (seg === 'traffic' || (seg === 'ritual' && u > 0.9)) {
      const clip = seg === 'traffic' ? (u < 0.5 ? 60 * s(0.05, 0.5, u) : u < 0.52 ? 60 * (1 - (u - 0.5) / 0.02) : 60 * clamp((u - 0.52) / 0.08)) : 0
      const n = seg === 'traffic' ? (u < 0.5 ? Math.round(212 * s(0.05, 0.5, u) * 0.86) : u < 0.52 ? 0 : Math.round(212 * clamp((u - 0.52) / 0.08))) : 0
      rm.redraw((cx, W, H) => S.drawTraffic(cx, W, H, { t, clip, count: n, rewind: u > 0.5 && u < 0.52 }), `tr-${Math.round(clip * 4)}-${n}`)
    } else rm.redraw((cx, W, H) => S.drawLoad(cx, W, H, { t, spike: 0 }), `load-${tick(3)}`)

    // ——— Selin's monitor ———
    const sm = sets.sm
    if ((seg === 'gone' && u > 0.58) || seg === 'end') off(sm)
    else if (alertAll) alert(sm)
    else if (darkAll) off(sm)
    else {
      const spike = seg === 'selin' ? 1 : 0
      sm.redraw((cx, W, H) => S.drawLoad(cx, W, H, { t, spike }), `sl-${tick(3)}-${spike}`)
    }

    // ——— The hall console ———
    const hc = sets.hc
    const feedOn = seg === 'hallWalk' && u > 0.6
    sets.feed.visible = feedOn
    if ((seg === 'gone' && u > 0.64) || seg === 'end') off(hc)
    else if (alertAll) alert(hc)
    else if (p >= at('turn', 0.05) && before('message')) hc.redraw((cx, W, H) => S.drawHallLog(cx, W, H, { clock, t, scroll: true, prompt: null }), `scroll-${clock}`)
    else if (seg === 'wait') hc.redraw((cx, W, H) => S.drawHallLog(cx, W, H, { clock, t, scroll: false, prompt: band }), `hcw-${bandKey}`)
    else hc.redraw((cx, W, H) => S.drawHallLog(cx, W, H, { clock, t, scroll: false, prompt: null }), `hc-${clock}-${tick(1)}`)
    if (feedOn) this.renderFeed()

    // ——— Rack status strips (wait): the words run away down the rows ———
    if (seg === 'wait' && band) {
      const words = band.lines.join(' ').split(' ')
      const typed = band.lines.reduce((a, l, i) => a + l.length * (band.typed[i] ?? 0), 0) / Math.max(1, band.lines.join(' ').length)
      sets.racks.drawStrips(words, typed, 3)
    } else sets.racks.drawStrips([], 0)

    // ——— The old printer's LCD ———
    const lcdText = alertAll ? 'OBSERVER' : seg === 'envelope' && u > 0.56 ? 'SONRA AÇ.' : seg === 'envelope' && u > 0.04 ? 'BASIYOR…' : ''
    sets.lcd.redraw((cx, W, H) => P.drawLcd(cx, W, H, lcdText, !!lcdText), `lcd-${lcdText}`)
    ;(sets.printerLed.material as THREE.MeshBasicMaterial).color.set(seg === 'envelope' && u > 0.04 && u < 0.5 ? 0x5dff9a : 0x1b3324)

    // ——— The phone ———
    const ps = this.phone.screen
    let phoneState: P.PhoneState = { mode: 'off' }
    if (seg === 'enter' && u > 0.755 && u < 0.8) phoneState = { mode: 'lock', clock: '20:58', notify: null }
    else if (seg === 'message' && u > 0.08 && u < 0.33) phoneState = { mode: 'lock', clock: '03:05', notify: 'Defne · 22.53' }
    else if (seg === 'message' && u >= 0.33) phoneState = { mode: 'thread', clock: '03:05', compose: '', sent: false, scroll: u > 0.73 && u < 0.95 ? Math.sin(PI * s(0.73, 0.95, u)) : 0 }
    else if (seg === 'coat' && u < 0.25) {
      const compose = u < 0.04 ? '' : u < 0.075 ? 'Özür dil'.slice(0, Math.round(8 * s(0.04, 0.07, u))) : u < 0.09 ? '' : u < 0.13 ? 'Yolday'.slice(0, Math.round(6 * s(0.09, 0.12, u))) : u < 0.15 ? '' : u < 0.2 ? 'Geliyorum'.slice(0, Math.round(9 * s(0.15, 0.19, u))) : ''
      phoneState = { mode: 'thread', clock: '03:06', compose, sent: u >= 0.2, scroll: 0 }
    }
    const pkey = JSON.stringify(phoneState)
    ps.redraw((cx, W, H) => P.drawPhone(cx, W, H, phoneState), pkey)

    // ——— Selin's tablet ———
    if (seg === 'heat' || seg === 'hallWalk') {
      const stage: 0 | 1 | 2 = seg === 'heat' && u > 0.66 ? 2 : seg === 'heat' && u > 0.62 ? 1 : 0
      this.tablet.screen.redraw((cx, W, H) => P.drawTablet(cx, W, H, { stage, t }), `tab-${stage}-${tick(2)}`)
    }

    // The microphone LED under the wall display: lit while Arif speaks.
    sets.micLed.visible = arifSpeaking(p, f.flags)
  }

  private listRows(flags: ReadonlySet<string>): S.ListRow[] {
    const coin = option(flags, 'coin')
    const glass = option(flags, 'glass')
    const box = option(flags, 'boxes')
    const cf = option(flags, 'counterfactual')
    const q = option(flags, 'great')
    const trim = (x: string) => x.replace(/\.$/, '')
    return [
      { time: '21.10', title: 'YAZI TURA', choice: trim(coin.label), result: 'PARA: TURA' },
      { time: '21.14', title: 'TERSİNE', choice: glass.id === 'kitchen' ? 'Mutfağa' : glass.id === 'break' ? 'Kır' : 'Hiçbir şey' },
      { time: '21.36', title: 'İKİ KUTU', choice: box.id === 'one' ? 'Yalnızca B' : 'İkisi' },
      { time: '00.41', title: 'KARŞI-OLGU', choice: cf.id === 'air' ? 'Hava' : '413' },
      { time: '02.24', title: 'SORU', choice: q.label },
    ]
  }

  /** The console shows the hall it stands in: a camera, a render target, last frame on the screen (so it recurses). */
  private renderFeed() {
    const r = this.renderer
    const prev = r.getRenderTarget()
    const write = this.feedRT[this.feedFlip]
    const read = this.feedRT[1 - this.feedFlip]
    this.feedMat.uniforms.map.value = read.texture
    this.feedCam.updateMatrixWorld()
    r.setRenderTarget(write)
    r.clear()
    r.render(this.scene, this.feedCam)
    r.setRenderTarget(prev)
    this.feedMat.uniforms.map.value = write.texture
    this.feedFlip = 1 - this.feedFlip
  }

  // ——— Light ———

  private light(f: SetFrame, c: Ctx) {
    const { seg, u, p } = c
    const t = f.time
    const past = (id: SegmentId, f0 = 0) => p >= at(id, f0)
    const between = (a: SegmentId, fa: number, b: SegmentId, fb: number) => p >= at(a, fa) && p < at(b, fb)
    const ch = (a: SegmentId, b: SegmentId) => p >= at(a) && p < at(b, 1)
    const sets = this.sets
    const forest = seg === 'forest'
    const observer = between('turn', 0.0, 'freedom', 0.3)
    // Hemisphere fill.
    this.hemi.intensity = forest ? 0.12 : seg === 'end' ? 0.12 : observer ? 0.05 : ch('lapse', 'odds') ? 0.14 : 0.22
    this.hemi.color.set(forest ? 0x7f94b8 : 0x6f7e92)
    // The one ceiling panel.
    this.panel.intensity = observer || forest ? 0 : ch('sealed', 'answered') ? 1.2 : ch('lapse', 'odds') ? 1.0 : seg === 'selfQ' ? 1.2 : 2.6
    // Desk lamp from enter 0.72.
    const lampOn = past('enter', 0.72) && !observer && !forest
    this.lamp.intensity = lampOn ? 9 : 0
    ;(sets.lampGlow.material as THREE.MeshBasicMaterial).color.set(lampOn ? 0xffd9a8 : 0x2a2622)
    // Monitors on his face.
    const monitorsOn = past('intro', 0.2) && !observer && !(seg === 'gone' && u > 0.62) && seg !== 'end'
    this.glowMM.intensity = monitorsOn ? (seg === 'input' && u > 0.5 ? 1.6 : 1.0) : 0
    this.glowMM.color.set(seg === 'input' && u > 0.5 ? 0xe2b062 : 0xb9d0ff)
    // The wall display's light, wherever it faces.
    const yaw = sets.wdPivot.rotation.y
    this.glowWD.position.set(WD_C.x + Math.sin(yaw) * 0.7, WD_C.y, WD_C.z + Math.cos(yaw) * 0.7)
    const wdOn = !(seg === 'gone' && u > 0.8) && seg !== 'end' && !forest
    this.glowWD.intensity = !wdOn ? 0 : ch('electron', 'odds') ? 3.6 : observer ? 2.4 : seg === 'lapse' ? 1.6 : 1.2
    this.glowWD.color.set((seg === 'input' && u > 0.5) || (seg === 'turn' && u < 0.3) ? 0xe2b062 : 0xc8dcff)
    // Selin's lamp, when she is at her desk.
    const selinHere = (past('ritual') && p < at('selfQ')) || (past('sealed') && p < at('input'))
    this.selinLamp.intensity = selinHere ? 2.4 : 0
    ;(sets.selinGlow.material as THREE.MeshBasicMaterial).color.set(selinHere ? 0xffd9a8 : 0x2a2622)
    // The hall: breathing; a fast blue pulse while the cooling cries; holds its breath; still while it thinks; amber with heat.
    const breathe = (period: number) => 0.775 + 0.225 * Math.sin((t * 2 * PI) / period)
    let k = breathe(4)
    if (seg === 'selin' && u < 0.4) k = 0.6 + 0.4 * Math.abs(Math.sin(t * PI * 1.6))
    if (seg === 'after' && u > 0.74 && u < 0.82) k = 0.85
    if ((seg === 'computing' && u > 0.06) || f.reduced) k = seg === 'computing' ? 0.55 : 0.8
    if (seg === 'gone' && u > 0.7) k = 0.22
    if (seg === 'end') k = 0.2
    const heat = seg === 'heat' ? s(0.0, 1.0, u) : seg === 'wait' || seg === 'samePace' ? 1 : 0
    const hallCol = new THREE.Color(0x7fa6d8).lerp(new THREE.Color(0xe2b062), heat * 0.75)
    for (const l of this.hallLights) {
      l.intensity = forest ? 0 : 6 * k
      l.color.copy(hallCol)
    }
    ;(this.m.hallLamp as THREE.MeshBasicMaterial).color.copy(hallCol).multiplyScalar(0.6 + 0.6 * k)
    // The LEDs.
    const freeze = seg === 'computing' && u > 0.06 ? 1 : 0
    const dim = seg === 'computing' && u > 0.06 ? 0.4 : seg === 'gone' && u > 0.7 ? 0.5 : 1
    sets.racks.setLeds(f.reduced ? 0 : t, seg === 'samePace' ? 1 : 0, dim, freeze)
    // Aux spot: the corridor's wedge through the door; the key on the boxes; the moon.
    const as = this.auxSpot
    as.intensity = 0
    const doorOpen = this.doorOpen(c)
    sets.officeDoor.leaf.rotation.y = -1.25 * doorOpen
    if (forest) {
      as.color.set(0x9fb4d8)
      as.position.set(FOREST.x - 6, 14, FOREST.z + 5)
      as.target.position.set(FOREST.x, 0, FOREST.z)
      as.angle = 0.55
      as.distance = 40
      as.intensity = 90
    } else if (seg === 'split') {
      const kk = s(0.48, 0.56, u)
      as.color.set(0xffd2a0)
      as.position.set(lerp(-0.55, 0.55, kk), 1.9, -0.05)
      as.target.position.set(lerp(ON_DESK.boxA.x, ON_DESK.boxB.x, kk), 0.85, ON_DESK.boxA.z)
      as.angle = 0.3
      as.distance = 3
      as.intensity = 14
    } else if (seg === 'gone' && doorOpen < 0.5) {
      // The door shut behind him: the corridor's light spills a little under it onto the carpet.
      as.color.set(0xffdcb4)
      as.position.set(2.6, 0.12, 4.45)
      as.target.position.set(2.6, 0, 3.0)
      as.angle = 0.9
      as.distance = 2.4
      as.intensity = 7 * s(0.06, 0.14, u) * (1 - s(0.62, 0.8, u))
    } else if (doorOpen > 0.01) {
      // The corridor's wedge through the door; softer while we stand in the corridor behind him.
      const behind = seg === 'query' || seg === 'queryGate' || seg === 'answer'
      as.color.set(0xe8f0ff)
      as.position.set(2.6, 2.1, 5.2)
      as.target.position.set(2.3, 0, 2.4)
      as.angle = 0.42
      as.distance = 9
      as.intensity = (behind ? 1.5 : 26) * doorOpen
    }
    as.target.updateMatrixWorld()
    this.doorGlow.visible = doorOpen < 0.02 && !forest && seg !== 'end'
    // Aux point: the kitchen light; the phone on his face; the torch; the street.
    const ap = this.auxPoint
    ap.intensity = 0
    if (seg === 'opened' && c.glass === 'kitchen' && u < 0.42) {
      ap.color.set(0xffe2bd)
      ap.position.set(-2.2, 2.5, 8.3)
      ap.distance = 6
      ap.intensity = 6
    } else if ((seg === 'message' && u > 0.08) || (seg === 'coat' && u < 0.25)) {
      this.phone.group.getWorldPosition(this.v)
      ap.color.set(0xc8dcff)
      ap.position.copy(this.v).add(v3(0, 0.08, 0.05))
      ap.distance = 1.2
      ap.intensity = 0.5
    } else if ((seg === 'coat' && u >= 0.25) || seg === 'query' || seg === 'queryGate' || seg === 'answer') {
      // Late in the night he must still read: crossing to the rack, a faint warm spill from the
      // corridor's transom; in the doorway, the display's cold light on his face.
      const atDoor = seg !== 'coat' || u > 0.58
      ap.color.set(atDoor ? 0xc8dcff : 0xffe6c8)
      ap.position.set(atDoor ? 2.5 : 3.0, atDoor ? 1.75 : 2.6, atDoor ? 2.5 : 2.5)
      ap.distance = atDoor ? 2.6 : 4.5
      ap.intensity = atDoor ? 1.4 : 2.4
    } else if (seg === 'turn' && u > 0.6 && u < 0.82) {
      // What the display sees from its own face: the empty corner, faintly in its own cold light.
      ap.color.set(0xc8dcff)
      ap.position.set(3.7, 1.9, 1.5)
      ap.distance = 3.4
      ap.intensity = 1.1
    } else if (seg === 'selfQ') {
      this.torch.getWorldPosition(this.v)
      ap.color.set(0xfff4dc)
      ap.position.copy(this.v)
      ap.distance = 3
      ap.intensity = 2
    } else if (seg === 'end') {
      const az = this.arif.z
      const lz = [18, 6, -6, -18, -30].reduce((a, b) => (Math.abs(b - az) < Math.abs(a - az) ? b : a), 6)
      ap.color.set(0xffb46a)
      ap.position.set(13.1, -4.4, lz)
      ap.distance = 16
      ap.intensity = 90
    } else if (seg === 'open' || (seg === 'enter' && u < 0.1)) {
      // The plaque over the glass door catches a little of the hall's cold light.
      ap.color.set(0x9cb8e0)
      ap.position.set(-3.1, 2.75, -3.25)
      ap.distance = 2.2
      ap.intensity = 1.4
    } else if (forest) {
      // Moonlight caught on the butterfly's cream edges, from behind and above the frond.
      ap.color.set(0xb4c6e6)
      ap.position.set(FOREST.x - 0.2, 1.1, FOREST.z - 0.55)
      ap.distance = 2.4
      ap.intensity = 1.6
    } else if (seg === 'lapse' && u > 0.15 && u < 0.5) {
      ap.color.set(0x9cc8ff)
      ap.position.set(-0.6, 1.2, -7.0)
      ap.distance = 2
      ap.intensity = 1
    }
    // City windows go out in patches through the night (the time-lapse).
    const hours = storyHours(p)
    const night = clamp((hours - 21.6) / (27 - 21.6))
    for (const lp of sets.litPanes) lp.mesh.count = Math.round(lp.full * (1 - 0.7 * s(lp.at * 0.6, lp.at * 0.6 + 0.4, night)))
    // Environment and fog per place.
    const scene = this.scene
    scene.environment = forest || seg === 'end' ? (this.envNight ?? this.fallbackEnv) : (this.envOffice ?? this.fallbackEnv)
    scene.environmentIntensity = forest ? 0.04 : seg === 'end' ? 0.12 : observer ? 0.03 : 0.08
    void this.lastTicks
  }

  /** The corridor door: Arif in (enter), Selin in with the boxes, Arif out (coat → gone). */
  private doorOpen(c: Ctx) {
    const { seg, u } = c
    if (seg === 'enter') return s(0.02, 0.07, u) * (1 - s(0.16, 0.22, u))
    if (seg === 'boxes') return s(0.0, 0.04, u) * (1 - s(0.14, 0.2, u))
    if (seg === 'selin') return u > 0.95 ? s(0.95, 1, u) * 0.5 : 0
    if (seg === 'opened' && c.glass === 'kitchen') return u < 0.03 ? 1 : 0
    if (seg === 'glassChoice' && c.glass === 'kitchen') return s(0.85, 0.97, u)
    if (seg === 'lapse') return s(0.06, 0.1, u) * (1 - s(0.13, 0.16, u))
    if (seg === 'coat') return s(0.6, 0.66, u)
    if (seg === 'query' || seg === 'queryGate' || seg === 'answer') return 1
    if (seg === 'gone') return 1 - s(0.06, 0.12, u)
    return 0
  }

  // ——— Camera ———

  private camera(f: SetFrame, c: Ctx, shot: Shot) {
    const { seg, u } = c
    const hu = held(u, f.reduced)
    const key = (k: ShotKeys) => keyed(k, hu, shot)
    switch (seg) {
      case 'opened': {
        const g = c.glass
        if (u < 0.42) {
          if (g === 'kitchen') {
            if (u < 0.02) key([[0, [0.8, 1.6, 2.4, 2.6, 1.3, 4.3, 40]], [1, [0.8, 1.6, 2.4, 2.6, 1.3, 4.3, 40]]])
            else if (u < 0.4) key([[0.02, [-1.0, 1.6, 7.2, -2.5, 1.2, 9.5, 40]], [0.4, [-1.1, 1.6, 7.3, -2.4, 1.2, 9.4, 40]]])
            else key([[0.4, [-0.9, 1.3, 0.9, -0.1, 1.0, -0.2, 34]], [0.42, [-0.9, 1.3, 0.9, -0.1, 1.0, -0.2, 34]]])
          } else if (g === 'break') {
            if (u < 0.3)
              key([
                [0, [-1.6, 0.55, 1.25, -0.5, 0.22, -0.05, 46]],
                [0.15, [-1.55, 0.55, 1.2, -0.5, 0.22, -0.05, 45]],
                [0.3, [-1.35, 1.15, 1.25, -0.12, 1.45, 0.3, 40]],
              ])
            else key([[0.3, [-1.2, 1.3, 1.0, -0.1, 1.0, -0.1, 34]], [0.42, [-1.15, 1.3, 0.95, -0.1, 1.0, -0.1, 34]]])
          } else {
            // The slow orbit round him, still astride the chair.
            const a0 = Math.atan2(-1.3, 0.5)
            const a1 = Math.atan2(-0.9, 1.0)
            const a = lerp(a0, a1, s(0, 0.3, hu))
            shot.pos.set(Math.sin(a) * 1.4, 1.2, 0.1 + Math.cos(a) * 1.4)
            shot.tgt.set(0, 1.0, 0.1)
            shot.fov = 36
          }
        } else if (u < 0.45) key([[0.42, [-0.6, 1.35, 0.8, 0, 1.05, -0.15, 30]], [0.45, [-0.55, 1.35, 0.75, 0, 1.05, -0.15, 30]]])
        else if (u < 0.81) key([[0.45, [0.52, 1.3, -0.04, -0.03, 1.1, -0.17, 32]], [0.81, [0.49, 1.29, -0.07, -0.03, 1.1, -0.17, 31]]])
        else key([[0.81, FACE], [1, FACE2]])
        break
      }
      case 'hallWalk': {
        const A = this.arif
        if (u < 0.15) key([[0, [-2.0, 1.6, -2.4, -3.125, 1.2, -5.0, 40]], [0.15, [-2.2, 1.6, -2.7, -3.0, 1.2, -5.2, 40]]])
        else if (u < 0.52) {
          // Dolly in, zoom out: he stays the same size, the aisle beyond him stretches away.
          const k = s(0.15, 0.5, hu)
          const d = lerp(5.0, 2.4, k)
          const H = 2.4 * Math.tan((46 * PI) / 360)
          shot.pos.set(A.x + 0.35, 1.62, A.z + d)
          shot.tgt.set(-1.0, 1.35, A.z - 30)
          shot.fov = (2 * Math.atan(H / d) * 180) / PI
        } else if (u < 0.72) key([[0.52, [-0.35, 1.4, -6.5, 0.75, 1.25, -7.9, 32]], [0.72, [-0.08, 1.4, -7.1, 0.75, 1.25, -7.9, 30]]])
        else key([[0.72, [-3.9, 1.5, -6.6, -4.72, 1.3, -7.2, 28]], [1, [-4.3, 1.38, -6.95, -4.72, 1.29, -7.2, 26]]])
        break
      }
      case 'message': {
        if (u >= 0.33 && u < 0.715) {
          // Over his right shoulder (clear of his head) onto the phone in his hands: the message legible.
          const ph = this.phone.group.position
          shot.pos.set(ph.x + 0.36, ph.y + 0.48, ph.z + 0.52)
          shot.tgt.set(ph.x + 0.01, ph.y + 0.01, ph.z)
          shot.fov = 23 - 2 * s(0.33, 0.715, hu)
        } else key(SHOTS.message!)
        break
      }
      case 'thumb': {
        if (u < 0.45) key(SHOTS.thumb!)
        else if (u < 0.84) {
          // Across the desk from his right: the receipt printer in the foreground (the slip comes out at
          // 0.55 and he doesn't look), the coin on his thumbnail, his face beyond.
          key([
            [0.45, [1.16, 1.2, -0.62, 0.12, 1.03, -0.02, 30]],
            [0.84, [1.12, 1.19, -0.58, 0.12, 1.03, -0.02, 29]],
          ])
        } else {
          // Closer on the coin on his thumbnail, his face above it (the hold of the gate). At the
          // flick, tilt up with the coin.
          const up = s(0.94, 1, hu)
          key([
            [0.84, [0.82, 1.12, -0.52, 0.12, 1.07, -0.03, 32]],
            [1, [0.78, 1.11, -0.49, 0.12, 1.07, -0.03, 31]],
          ])
          shot.tgt.y += 0.3 * up
          shot.fov += 4 * up
        }
        break
      }
      case 'end': {
        // From just behind the glass of the middle east window, down through the clear lower half.
        // First the street door below (he comes out at 0.04), then him, leading a little along the avenue.
        // At the middle east window, just past the glass: down along the facade to the street
        // door, then him on the pavement under the sodium lights.
        const A = this.arif
        const k = s(0.1, 0.32, hu)
        shot.pos.set(5.4, 1.5, 0.3)
        shot.tgt.set(lerp(7.4, A.x + 0.6, k), lerp(-9.0, -9.6, k), lerp(4.2, A.z - 2 - 6 * s(0.3, 0.8, hu), k))
        shot.fov = lerp(46, 34, s(0.3, 1, hu))
        break
      }
      default: {
        const k = SHOTS[seg]
        if (k) key(k)
        else key([[0, PHONE_INSERT]])
      }
    }
    // Fades: the opening, the dissolve into the forest and out of it.
    shot.fade = seg === 'open' ? s(0.0, 0.35, u) : seg === 'queue' ? 1 - s(0.92, 1, u) : seg === 'forest' ? s(0, 0.14, u) * (1 - s(0.9, 1, u)) : seg === 'twoWorlds' ? s(0, 0.05, u) : 1
    // The observer's frame: absolutely still.
    if (seg === 'turn' || seg === 'list' || seg === 'observerN' || (seg === 'freedom' && u < 0.47)) shot.handheld = 0
    else if (seg === 'gone' || seg === 'end' || seg === 'forest') shot.handheld = 0.4
    // QA only (?debug=1): a free camera set from the console as window.__durumCam = [px,py,pz, tx,ty,tz, fov].
    const dbg = typeof window !== 'undefined' ? (window as unknown as { __durumCam?: number[] }).__durumCam : undefined
    if (dbg && dbg.length === 7) {
      shot.pos.set(dbg[0], dbg[1], dbg[2])
      shot.tgt.set(dbg[3], dbg[4], dbg[5])
      shot.fov = dbg[6]
      shot.fade = 1
      shot.handheld = 0
    }
  }

  // ——— Which places are on, the display's turn, the mirror ———

  private world(f: SetFrame, c: Ctx) {
    const { seg, u, p } = c
    const sets = this.sets
    const forest = seg === 'forest'
    sets.office.visible = !forest
    sets.hall.visible = !forest
    sets.kitchen.visible = !forest
    sets.outside.visible = !forest
    sets.forest.visible = forest
    this.arif.figure.root.visible &&= !forest
    this.selin.figure.root.visible &&= !forest
    // Selin ties her hair up for the hot hall (AYNA).
    const tied = seg === 'selfQ' || seg === 'hallWalk' || seg === 'heat' || seg === 'wait' || seg === 'samePace'
    this.tiedHair.visible = tied
    this.selin.figure.headMeshes[1].visible = !tied
    // The mirror: from the hall walk (0.15) to the end of AYNA.
    const mirror = (seg === 'hallWalk' && u > 0.13) || seg === 'heat' || seg === 'wait' || seg === 'samePace'
    sets.racks.setMirror(mirror)
    sets.mirrorShell.visible = mirror
    sets.northWall.visible = !mirror
    // Fog and background.
    if (forest) {
      this.fog.color.set(0x0b1016)
      this.fog.density = 0.16
      this.bg.set(0x0b1016)
    } else if (mirror) {
      this.fog.color.set(0x0c131b)
      this.fog.density = 0.045
      this.bg.set(0x0c131b)
    } else if (seg === 'end') {
      this.fog.color.set(0x0e1014)
      this.fog.density = 0.003
      this.bg.set(0x05070a)
    } else {
      this.fog.color.set(0x070a0e)
      this.fog.density = 0.008
      this.bg.set(0x05070a)
    }
    // The wall display turns: to the observer (turn 0.04–0.3), back (freedom 0.49–0.8), to the door (query 0–0.1).
    let yaw = WD_YAW.arif
    if (seg === 'turn') yaw = lerp(WD_YAW.arif, WD_YAW.observer, s(0.04, 0.3, u))
    else if (seg === 'list' || seg === 'observerN') yaw = WD_YAW.observer
    else if (seg === 'freedom') yaw = lerp(WD_YAW.observer, WD_YAW.arif, s(0.49, 0.8, u))
    else if (seg === 'query') yaw = lerp(WD_YAW.arif, WD_YAW.door, s(0.0, 0.1, u))
    else if (p >= at('queryGate')) yaw = WD_YAW.door
    sets.wdPivot.rotation.y = yaw
    // The glass door to the hall (hallWalk 0.06–0.12, closes behind him).
    sets.glassDoor.rotation.y = seg === 'hallWalk' ? 1.15 * s(0.06, 0.11, u) * (1 - s(0.17, 0.3, u)) : 0
    // The chair: reversed for the contrary minutes; swivels in youSaid; pushed back when he stands.
    const ch = sets.chair
    ch.position.set(SEAT.x, 0, SEAT.z + 0.05)
    let cy = PI
    if (seg === 'youSaid' && u > 0.75) cy = PI - 2.55 * s(0.77, 0.9, u)
    if (seg === 'contrary') cy = u < 0.24 ? PI : u < 0.3 ? PI - PI * s(0.24, 0.3, u) : 0
    if (seg === 'glassChoice') cy = 0
    if (seg === 'opened') {
      const back = c.glass === 'kitchen' ? s(0.38, 0.4, u) : c.glass === 'break' ? s(0.32, 0.38, u) : s(0.32, 0.38, u)
      cy = u < 0.42 ? PI * back : PI
    }
    ch.rotation.y = cy
    if (seg === 'contrary' || seg === 'glassChoice' || (seg === 'opened' && u < 0.4)) ch.position.z = SEAT.z + 0.1
    // The clock that stopped at 21.13 (its second hand tries now and then).
    sets.clock.set(21 + 13 / 60 + (Math.sin(f.time * 9) > 0.97 ? 1 / 3600 : 0))
    // A car far off at z −40 (end 0.1).
    const car = sets.movingCar
    car.visible = seg === 'end'
    car.position.set(lerp(60, -20, s(0.06, 0.4, u)), -9.5, -40)
    // The coffee machine's warmer light is on from the pour until midnight.
    sets.coffeeLed.visible = p >= at('coffee', 0.18) && p < at('queue')
    void DESK
    void COFFEE
    void OBS
    void mulberry32
    void ARIF_POS
    void P_STREET
  }

  motion(m: SceneInfo['motion']) {
    const a = this.arif
    const sl = this.selin
    m.walking = Math.max(a.walking, sl.walking)
    m.step = a.walking >= sl.walking ? a.step : sl.step
    m.frame = this.ctx ? (this.ctx.glass === 'kitchen' ? 1 : this.ctx.glass === 'break' ? 2 : 0) : 0
    m.doors = this.ctx ? this.doorOpen(this.ctx) : 0
  }

  dispose() {
    for (const rt of this.feedRT) rt.dispose()
    this.sets?.racks.dispose()
    for (const mat of Object.values(this.m)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose()
      mat.dispose()
    }
    for (const mat of Object.values(this.cm)) mat.dispose()
  }
}

export const createDurumScene = (options: SceneOptions): StoryScene => createSetScene(new DurumDirector(), options)
