/**
 * The cast: the teacher, the three, Salim's desk-mate, the boy with glasses
 * beside the reader, fifteen more of 6-B. One rig for everyone (Figure);
 * this file dresses it for a school — V-neck sweaters over light-blue
 * shirts, a cardigan with a white shirt, ponytails, Salim's untidy hair,
 * rectangular glasses — and gives faces what the story needs from them: a
 * mouth that opens, ears that redden, eyelids and eyes that can be held.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { Figure, type FigureLook } from '../figure/Figure'
import type { FaceShape, HairStyle } from '../figure/figureBody'
import { Actor } from '../kit/direct'
import { mesh } from '../util'
import type { Pal } from './materials'
import type { Seat } from './furniture'

export type Face = {
  /** 0 closed … 1 wide open (a shout, a laugh). */
  open: number
  /** A smile's width (mocking, laughing). */
  smile: number
}

/** Everything the story needs to hold on a face. */
export class Person {
  readonly actor: Actor
  readonly figure: Figure
  private mouth: THREE.Group
  private lips: THREE.Mesh
  private teeth: THREE.Mesh
  private grin: THREE.Mesh
  private tip: THREE.Mesh
  readonly ears: THREE.Mesh[] = []
  readonly lids: THREE.Mesh[] = []
  readonly eyes: THREE.Object3D[] = []
  private earMat: THREE.MeshPhysicalMaterial | null = null
  private earBase = new THREE.Color()
  /** Extra things worn (for disposal). */
  readonly extras: THREE.Object3D[] = []
  /** A ponytail, hung by gravity every frame (see hang). */
  tail: THREE.Group | null = null

  constructor(
    readonly name: string,
    look: FigureLook,
    m: Pal,
    readonly kid: boolean,
  ) {
    this.figure = new Figure(look)
    this.actor = new Actor(this.figure)
    const f = this.figure
    const hm = f.headMeshes
    // headMeshes: [head, hair, then per side: ear, ball, iris, pupil, lid, lash, lower, brow].
    for (const base of [2, 10]) {
      this.ears.push(hm[base])
      this.lids.push(hm[base + 4])
      this.eyes.push(hm[base + 1].parent!)
    }
    // Small parts cast no shadow (the face would only speckle).
    for (const me of f.meshes) {
      const geo = me.geometry as THREE.BufferGeometry & { parameters?: { radius?: number } }
      if (geo.parameters?.radius !== undefined && geo.parameters.radius < 0.02) me.castShadow = false
    }
    // Children: a slightly larger head on a smaller body.
    if (kid) f.joints.head.scale.setScalar(1.1)
    // The mouth: a dark opening that can widen, teeth at its top, a thin smile line.
    this.mouth = new THREE.Group()
    this.mouth.position.set(0, 0.036, 0.1085)
    f.joints.head.add(this.mouth)
    this.lips = mesh(new THREE.CircleGeometry(0.5, 20), m.mouth, 0, 0, 0, this.mouth)
    this.teeth = mesh(new THREE.PlaneGeometry(1, 1), m.teeth, 0, 0, 0.0005, this.mouth)
    const arc = new THREE.TorusGeometry(0.012, 0.0013, 4, 16, Math.PI * 0.8)
    arc.rotateZ(Math.PI + Math.PI * 0.1)
    this.grin = mesh(arc, m.mouth, 0, 0.008, 0.001, this.mouth)
    // The tip of a tongue, for concentration (Salim folding).
    // (Tucked behind the lips: seen from the side it must not read as a drop on the chin.)
    this.tip = mesh(new THREE.SphereGeometry(0.0045, 10, 8), m.tongue, 0.004, 0.0, -0.003, this.mouth)
    this.tip.scale.set(1.3, 0.55, 0.7)
    this.tip.visible = false
    for (const o of [this.lips, this.teeth, this.grin]) {
      o.castShadow = false
      ;(o.material as THREE.Material).polygonOffset = true
      ;(o.material as THREE.Material).polygonOffsetFactor = -2
    }
    this.face({ open: 0, smile: 0 })
  }

  face(e: Face) {
    const open = Math.max(0, Math.min(1, e.open))
    const smile = Math.max(0, Math.min(1, e.smile))
    this.lips.visible = open > 0.02
    this.lips.scale.set(0.022 + smile * 0.01, 0.003 + open * 0.016, 1)
    this.lips.position.y = -open * 0.004
    this.teeth.visible = open > 0.25
    this.teeth.scale.set(0.017 + smile * 0.008, 0.0035, 1)
    this.teeth.position.y = 0.006 * open - 0.001
    this.grin.visible = smile > 0.05 && open < 0.3
    this.grin.scale.set(0.7 + smile * 0.6, 0.5 + smile * 0.5, 1)
  }

  /**
   * After `apply`: the ponytail hangs down (a little behind the head), whatever the head does — it is
   * not stuck out like a horn when she bends over her notebook.
   */
  hang() {
    const t = this.tail
    if (!t) return
    const head = this.figure.joints.head
    head.getWorldQuaternion(hq)
    fwd.set(0, 0, 1).applyQuaternion(hq)
    fwd.y = 0
    if (fwd.lengthSq() > 1e-6) fwd.normalize()
    down.set(0, -1, 0).addScaledVector(fwd, -0.3).normalize()
    down.applyQuaternion(hq.invert())
    t.quaternion.setFromUnitVectors(NEG_Y, down)
  }

  /** The tip of the tongue between the teeth (0 … 1), after `face`. */
  tongue(amount: number) {
    this.tip.visible = amount > 0.05
    this.tip.position.z = -0.003 + 0.002 * amount
  }

  /** Holds the eyelids (0 open … 1 shut) and the eyes' direction (radians), after `apply`. */
  eyesTo(shut: number, yaw = 0, pitch = 0, which: 'both' | 'l' | 'r' = 'both') {
    this.lids.forEach((lid, i) => {
      if (which === 'l' && i !== 1) return
      if (which === 'r' && i !== 0) return
      lid.rotation.x = (lid.userData.open as number) + Math.max(0, Math.min(1, shut)) * 0.78
    })
    for (const e of this.eyes) e.rotation.set(-pitch, yaw, 0)
  }

  /** Ears that confess first (0 … 1 red). */
  blush(amount: number) {
    if (!this.earMat) {
      const base = this.ears[0].material as THREE.MeshPhysicalMaterial
      this.earMat = base.clone()
      this.earBase.copy(base.color)
      for (const e of this.ears) e.material = this.earMat
    }
    const a = Math.max(0, Math.min(1, amount))
    this.earMat.color.copy(this.earBase).lerp(new THREE.Color(0xd2403a), a * 0.85)
    this.earMat.sheenColor?.setRGB(1, 0.5 + 0.3 * (1 - a), 0.4)
  }

  dispose() {
    this.earMat?.dispose()
  }
}

const hq = new THREE.Quaternion()
const fwd = new THREE.Vector3()
const down = new THREE.Vector3()
const NEG_Y = new THREE.Vector3(0, -1, 0)

// ——— Dressing ———

function shirtFront(f: Figure, shirt: THREE.Material, deep: number, collar: boolean) {
  // A V of shirt at the sweater's neck, the collar's two points on it.
  const v = new THREE.Shape()
  v.moveTo(-0.052, 0.04)
  v.lineTo(0.052, 0.04)
  v.lineTo(0, -deep)
  v.closePath()
  const tri = mesh(new THREE.ShapeGeometry(v), shirt, 0, 0.255, 0.098, f.joints.chest)
  tri.rotation.x = -0.32
  tri.castShadow = false
  if (collar)
    for (const s of [-1, 1]) {
      const c = new THREE.Shape()
      c.moveTo(0, 0)
      c.lineTo(s * 0.04, 0.012)
      c.lineTo(s * 0.012, -0.045)
      c.closePath()
      const cm = mesh(new THREE.ShapeGeometry(c), shirt, s * 0.006, 0.292, 0.102, f.joints.chest)
      cm.rotation.set(-0.35, s * 0.25, 0)
      cm.castShadow = false
      ;(cm.material as THREE.Material).side = THREE.DoubleSide
    }
}

function ponytail(f: Figure, hair: THREE.Material, tie: THREE.Material, len: number) {
  const g = new THREE.Group()
  g.position.set(0, 0.17, -0.1)
  g.rotation.x = 0.25
  f.joints.head.add(g)
  const geo = new THREE.CapsuleGeometry(0.028, len, 6, 12)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (len / 2 + 0.028 - y) / (len + 0.056)
    const k = 1 - 0.55 * t * t
    pos.setX(i, pos.getX(i) * k * 1.15)
    pos.setZ(i, pos.getZ(i) * k)
  }
  geo.computeVertexNormals()
  mesh(geo, hair, 0, -len / 2 - 0.01, -0.012, g).castShadow = true
  const t = mesh(new THREE.TorusGeometry(0.022, 0.007, 6, 14), tie, 0, 0.0, -0.005, g)
  t.rotation.x = Math.PI / 2
  return g
}

/**
 * Salim's untidy hair: short locks lying on the scalp in every direction, a
 * few standing up at the crown (never spikes: they lie mostly along the head).
 */
function tufts(f: Figure, hair: THREE.Material, seed: number) {
  const rand = mulberry32(seed)
  const R = 0.105
  const c = new THREE.Vector3(0, 0.108, 0.008)
  const n = new THREE.Vector3()
  const down = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    // From the crown down to the hairline (more at the back and the crown, few over the forehead).
    const phi = 0.08 + rand() * (Math.sin(a) > 0.3 ? 0.55 : 0.95)
    const ux = Math.sin(phi) * Math.cos(a)
    const uy = Math.cos(phi)
    const uz = Math.sin(phi) * Math.sin(a)
    n.set(ux / 0.8, uy / 1.1, uz).normalize()
    const p = new THREE.Vector3(ux * 0.8 * R * 1.07, uy * 1.1 * R * 1.07, uz * R * 1.07).add(c)
    // Down the slope of the head, a little outward, a little random.
    down.set(0, -1, 0).addScaledVector(n, n.y).normalize()
    if (down.lengthSq() < 0.5) down.set(Math.cos(a + 2), 0, Math.sin(a + 2))
    const stand = i < 5 ? 0.9 : 0.35
    dir.copy(down).multiplyScalar(1).addScaledVector(n, stand).add(new THREE.Vector3(rand() - 0.5, 0, rand() - 0.5).multiplyScalar(0.6)).normalize()
    const h = 0.03 + rand() * 0.025
    const geo = new THREE.ConeGeometry(0.013 + rand() * 0.008, h, 5)
    geo.scale(1, 1, 0.55)
    const lock = mesh(geo, hair, p.x + dir.x * h * 0.4, p.y + dir.y * h * 0.4, p.z + dir.z * h * 0.4, f.joints.head)
    lock.quaternion.setFromUnitVectors(up, dir)
    lock.castShadow = false
  }
}

/**
 * The three's shoes, for the floor-level shots: laces across the instep, a
 * dark collar opening, a rubber toe cap and midsole (Salim's canvas shoes,
 * one lace untied), a side stripe (İbrahim's sports sneakers), spotless soles
 * (Eren's). Foot-joint coordinates: the shoe runs along +z, its top near y 0.
 */
function sneakers(f: Figure, kind: 'canvas' | 'sport' | 'clean', m: Pal) {
  const lace = kind === 'canvas' ? m.soleWhite : kind === 'sport' ? m.laceDark : m.laceNavy
  for (const side of ['l', 'r'] as const) {
    const foot = f.joints[side === 'l' ? 'lFoot' : 'rFoot']
    // The collar: a dark opening at the ankle.
    const collar = mesh(new THREE.TorusGeometry(0.034, 0.007, 6, 18), m.shoeInside, 0, -0.004, -0.03, foot)
    collar.rotation.x = Math.PI / 2 - 0.25
    collar.scale.set(1.15, 1.3, 1)
    collar.castShadow = false
    // Laces: four crossings down the instep, following its slope.
    for (let i = 0; i < 4; i++) {
      const z = 0.028 + i * 0.024
      const y = -0.001 - 0.0042 * i * i * 0.6 - 0.003 * i
      const bar = mesh(new THREE.BoxGeometry(0.036 - i * 0.002, 0.0028, 0.0055), lace, 0, y, z, foot)
      bar.rotation.x = 0.25 + i * 0.08
      bar.castShadow = false
    }
    // Toe cap and midsole band (canvas shoes) or a side stripe (sports).
    if (kind === 'canvas') {
      const cap = mesh(new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.soleWhite, 0, -0.05, 0.155, foot)
      cap.scale.set(0.047, 0.026, 0.045)
      cap.rotation.x = 0.35
      cap.castShadow = false
      const band = mesh(new THREE.CapsuleGeometry(0.047, 0.17, 4, 14), m.soleWhite, 0, -0.054, 0.058, foot)
      band.rotation.x = Math.PI / 2
      band.scale.set(1.04, 1, 0.24)
      band.castShadow = false
    } else if (kind === 'sport') {
      for (const s of [-1, 1]) {
        const stripe = mesh(new THREE.BoxGeometry(0.002, 0.007, 0.09), m.soleWhite, s * 0.047, -0.03, 0.06, foot)
        stripe.rotation.x = -0.32
        stripe.castShadow = false
      }
    }
  }
  // Salim's right lace, untied: two ends trailing to the floor.
  if (kind === 'canvas') {
    const foot = f.joints.rFoot
    for (const [dx, len, bend] of [
      [-0.012, 0.09, 0.5],
      [0.01, 0.12, -0.4],
    ] as const) {
      const pts = [new THREE.Vector3(dx, -0.006, 0.03), new THREE.Vector3(dx + bend * 0.04, -0.035, 0.03 + len * 0.3), new THREE.Vector3(dx + bend * 0.07, -0.066, 0.03 + len * 0.6), new THREE.Vector3(dx + bend * 0.09, -0.07, 0.03 + len)]
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.0018, 4, false), m.soleWhite)
      tube.castShadow = false
      foot.add(tube)
    }
  }
}

/** The teacher's hair, receding: the front of the hair shell is cut back to a high, M-shaped line. */
function recede(f: Figure) {
  const hair = f.headMeshes[1]
  const geo = (hair.geometry as THREE.BufferGeometry).clone()
  const pos = geo.attributes.position as THREE.BufferAttribute
  const index = geo.index!
  const keep: number[] = []
  const v = new THREE.Vector3()
  const d = new THREE.Vector3()
  for (let i = 0; i < index.count; i += 3) {
    d.set(0, 0, 0)
    for (let k = 0; k < 3; k++) d.add(v.fromBufferAttribute(pos, index.getX(i + k)))
    d.normalize()
    // Front only; the line climbs at the temples.
    const front = Math.max(0, Math.min(1, (d.z - 0.2) / 0.3))
    const line = 0.74 + 0.16 * Math.min(1, Math.abs(d.x) / 0.45)
    if (front > 0 && d.y < line * front + (1 - front) * -2) continue
    keep.push(index.getX(i), index.getX(i + 1), index.getX(i + 2))
  }
  geo.setIndex(keep)
  const old = hair.geometry
  hair.geometry = geo
  old.dispose()
}

function rectGlasses(f: Figure, frame: THREE.Material, lens: THREE.Material, w = 0.05, h = 0.03) {
  const g = f.glasses
  for (const s of [-1, 1]) {
    const cx = s * 0.036
    for (const [x, y, bw, bh] of [
      [0, h / 2, w, 0.004],
      [0, -h / 2, w, 0.003],
      [-w / 2, 0, 0.003, h],
      [w / 2, 0, 0.003, h],
    ] as const)
      mesh(new THREE.BoxGeometry(bw, bh, 0.003), frame, cx + x, y, 0, g).castShadow = false
    mesh(new THREE.PlaneGeometry(w, h), lens, cx, 0, 0, g).castShadow = false
    const temple = mesh(new THREE.BoxGeometry(0.003, 0.003, 0.12), frame, s * 0.072, 0.008, -0.058, g)
    temple.rotation.y = s * 0.1
    temple.castShadow = false
  }
  mesh(new THREE.BoxGeometry(0.022, 0.003, 0.003), frame, 0, 0.008, 0, g).castShadow = false
}

/** The untucked shirt tail under Salim's sweater. */
function shirtTail(f: Figure, shirt: THREE.Material) {
  const band = mesh(new THREE.CylinderGeometry(0.135, 0.145, 0.06, 24, 1, true), shirt, 0, 0.12, 0.004, f.joints.hips)
  band.scale.z = 0.78
  ;(band.material as THREE.Material).side = THREE.DoubleSide
  band.castShadow = false
}

// ——— The cast list ———

type KidSpec = {
  name: string
  build: 'm' | 'f'
  h: number
  skin: 0 | 1 | 2
  hair: 'black' | 'brown' | 'light' | 'dark'
  style: HairStyle
  face?: Partial<FaceShape>
  ponytail?: boolean
  glasses?: boolean
  girth?: number
  cardigan?: boolean
}

const BOY: FaceShape = { jaw: 0.14, nose: 0.13, lips: 0.05, stubble: 0 }
const GIRL: FaceShape = { jaw: 0.12, nose: 0.11, lips: 0.06, stubble: 0 }

function kidLook(s: KidSpec, m: Pal): FigureLook {
  const skins = [
    [m.skinA, m.skinAHead],
    [m.skinB, m.skinBHead],
    [m.skinC, m.skinCHead],
  ] as const
  const hair = { black: m.hairBlack, brown: m.hairBrown, light: m.hairLight, dark: m.hairDark }[s.hair]
  return {
    name: s.name,
    build: s.build,
    face: { ...(s.build === 'm' ? BOY : GIRL), ...s.face },
    hairStyle: s.style,
    skin: skins[s.skin][0],
    skinHead: skins[s.skin][1],
    eye: s.name === 'Eren' ? m.eyeHazel : m.eye,
    hair,
    top: s.cardigan ? m.sweaterB : m.sweater,
    bottom: m.trousers,
    shoes: s.name === 'Salim' ? m.shoeCanvas : s.name === 'Eren' ? m.shoeNavy : m.shoeBlack,
    sole: s.name === 'Salim' ? m.soleWhite : s.name === 'Eren' ? m.soleClean : m.sole,
    cuff: m.shirtBlue,
    collar: 'crew',
    topSurface: 'knit',
    height: s.h,
    belt: false,
  }
}

const OTHERS: KidSpec[] = [
  { name: 'k0', build: 'm', h: 0.82, skin: 0, hair: 'dark', style: 'short' },
  { name: 'k1', build: 'f', h: 0.8, skin: 2, hair: 'brown', style: 'long', ponytail: true },
  { name: 'k2', build: 'f', h: 0.81, skin: 1, hair: 'black', style: 'long' },
  { name: 'k3', build: 'm', h: 0.84, skin: 1, hair: 'black', style: 'short' },
  { name: 'k4', build: 'm', h: 0.8, skin: 2, hair: 'light', style: 'short', cardigan: true },
  { name: 'k5', build: 'f', h: 0.79, skin: 0, hair: 'dark', style: 'long', ponytail: true },
  { name: 'k6', build: 'm', h: 0.83, skin: 0, hair: 'brown', style: 'short' },
  { name: 'k7', build: 'f', h: 0.82, skin: 2, hair: 'light', style: 'long' },
  { name: 'k8', build: 'm', h: 0.85, skin: 1, hair: 'dark', style: 'short', girth: 1.06 },
  { name: 'k9', build: 'f', h: 0.8, skin: 1, hair: 'brown', style: 'long', ponytail: true, cardigan: true },
  { name: 'k10', build: 'm', h: 0.8, skin: 2, hair: 'black', style: 'short' },
  { name: 'k11', build: 'f', h: 0.83, skin: 0, hair: 'black', style: 'long' },
  { name: 'k12', build: 'm', h: 0.82, skin: 1, hair: 'light', style: 'short' },
  { name: 'k13', build: 'f', h: 0.78, skin: 2, hair: 'dark', style: 'long', ponytail: true },
  { name: 'k14', build: 'm', h: 0.84, skin: 0, hair: 'brown', style: 'short', cardigan: true },
]

const NAMED: Record<string, KidSpec> = {
  salim: { name: 'Salim', build: 'm', h: 0.88, skin: 1, hair: 'black', style: 'short', face: { jaw: 0.2, nose: 0.16 }, girth: 0.92 },
  ibrahim: { name: 'İbrahim', build: 'm', h: 0.8, skin: 1, hair: 'brown', style: 'short', face: { jaw: 0.02, nose: 0.12, lips: 0.055 }, girth: 1.12 },
  eren: { name: 'Eren', build: 'm', h: 0.8, skin: 2, hair: 'light', style: 'short', face: { jaw: 0.18, nose: 0.13 }, girth: 0.93 },
  girl: { name: 'Defne', build: 'f', h: 0.82, skin: 0, hair: 'dark', style: 'long', ponytail: true },
  glasses: { name: 'Kerem', build: 'm', h: 0.81, skin: 2, hair: 'brown', style: 'short', glasses: true },
}

export type Cast = {
  teacher: Person
  salim: Person
  ibrahim: Person
  eren: Person
  /** Every seated student by seat occupant name (includes the three, the girl and the glasses boy). */
  kids: Map<string, Person>
  all: Person[]
}

export function buildCast(scene: THREE.Scene, m: Pal, seats: Seat[]): Cast {
  const kids = new Map<string, Person>()
  const all: Person[] = []
  const make = (key: string, spec: KidSpec) => {
    const p = new Person(spec.name, kidLook(spec, m), m, true)
    const f = p.figure
    if (spec.girth) {
      f.root.scale.x *= spec.girth
      f.root.scale.z *= spec.girth
    }
    shirtFront(f, m.shirtBlue, key === 'eren' ? 0.07 : 0.085, true)
    if (spec.ponytail) p.tail = ponytail(f, kidLook(spec, m).hair, m.hairTie, 0.16)
    if (spec.glasses) rectGlasses(f, m.glassesFrame, m.lens, 0.042, 0.03)
    if (key === 'salim') {
      tufts(f, m.hairBlack, 5)
      shirtTail(f, m.shirtBlue)
      sneakers(f, 'canvas', m)
    }
    if (key === 'ibrahim') sneakers(f, 'sport', m)
    if (key === 'eren') sneakers(f, 'clean', m)
    scene.add(f.root)
    kids.set(key, p)
    all.push(p)
    return p
  }
  let k = 0
  for (const s of seats) {
    if (!s.who || s.who === 'R') continue
    const spec = NAMED[s.who] ?? OTHERS[k++ % OTHERS.length]
    make(s.who, spec)
  }
  const teacher = new Person(
    'Öğretmen',
    {
      name: 'Öğretmen',
      build: 'm',
      face: { jaw: 0.34, nose: 0.25, lips: 0.04, stubble: 0.34 },
      hairStyle: 'short',
      skin: m.skinT,
      skinHead: m.skinTHead,
      eye: m.eye,
      hair: m.hairGrey,
      top: m.cardigan,
      bottom: m.trousersGrey,
      shoes: m.shoeBlack,
      sole: m.sole,
      cuff: m.shirtWhite,
      collar: 'crew',
      topSurface: 'knit',
      belt: true,
      height: 1.0,
    },
    m,
    false,
  )
  {
    const f = teacher.figure
    recede(f)
    f.root.scale.x *= 1.06
    f.root.scale.z *= 1.08
    shirtFront(f, m.shirtWhite, 0.12, true)
    rectGlasses(f, m.glassesFrame, m.lens)
    // Cardigan buttons down the front, chalk dust on the right sleeve.
    for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 10), m.glassesFrame, 0, 0.14 - i * 0.075, 0.11 - i * 0.004, f.joints.chest).rotation.x = Math.PI / 2
    const dust = mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd8d6cc, roughness: 1, transparent: true, opacity: 0.5, depthWrite: false }), 0, -0.2, 0.03, f.joints.rFore)
    dust.scale.set(0.9, 1.5, 0.6)
    dust.castShadow = false
    scene.add(f.root)
    all.push(teacher)
  }
  return { teacher, salim: kids.get('salim')!, ibrahim: kids.get('ibrahim')!, eren: kids.get('eren')!, kids, all }
}
