/**
 * What the director works with: the six sets, the cast as actors, a fixed
 * pool of lights repositioned per set (the light count never changes, so no
 * shader recompiles mid-story), hand-held props, mouths, and the lens.
 */
import * as THREE from 'three'
import type { Quality } from '@/lib/env'
import { Figure } from '../figure/Figure'
import { Actor } from '../kit/direct'
import { phone as phoneProp, rbox, std } from '../kit/props'
import { canvasPlane } from '../kit/props'
import type { PostParams } from './post'
import * as C from './cast'
import { Office } from './office'
import { Stairs } from './stairs'
import { Street, type CarRig } from './street'
import { Service } from './service'
import { WhiteRoom } from './whiteRoom'
import { ConvictLine } from './convict'
import { revealify, revealUniforms, type RevealU } from './reveal'
import * as S from './screens'
import { paperCup } from './service'

const PI = Math.PI

// ——— Lights ———

export class LightRig {
  readonly hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0)
  readonly sun = new THREE.DirectionalLight(0xffffff, 0)
  readonly key = new THREE.SpotLight(0xffffff, 0, 12, 0.7, 0.5, 1.6)
  readonly points: THREE.PointLight[] = []
  private box = 0

  constructor(scene: THREE.Scene, quality: Quality) {
    scene.add(this.hemi, this.sun, this.sun.target, this.key, this.key.target)
    this.sun.castShadow = quality.shadows
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.bias = -0.0003
    this.sun.shadow.normalBias = 0.02
    this.key.castShadow = quality.shadows
    this.key.shadow.mapSize.set(1024, 1024)
    this.key.shadow.bias = -0.0004
    this.key.shadow.normalBias = 0.02
    for (let i = 0; i < 5; i++) {
      const p = new THREE.PointLight(0xffffff, 0, 10, 1.8)
      scene.add(p)
      this.points.push(p)
    }
  }

  off() {
    this.hemi.intensity = 0
    this.sun.intensity = 0
    this.key.intensity = 0
    for (const p of this.points) p.intensity = 0
  }

  setHemi(sky: THREE.ColorRepresentation, ground: THREE.ColorRepresentation, intensity: number) {
    this.hemi.color.set(sky)
    this.hemi.groundColor.set(ground)
    this.hemi.intensity = intensity
  }

  /** A sun from `from` toward `to`, its shadow box `half` m round the target. */
  setSun(color: THREE.ColorRepresentation, intensity: number, from: readonly number[], to: readonly number[], half = 8) {
    this.sun.color.set(color)
    this.sun.intensity = intensity
    this.sun.position.set(from[0], from[1], from[2])
    this.sun.target.position.set(to[0], to[1], to[2])
    this.sun.target.updateMatrixWorld()
    if (half !== this.box) {
      this.box = half
      const c = this.sun.shadow.camera
      c.left = c.bottom = -half
      c.right = c.top = half
      c.near = 0.5
      c.far = 80
      c.updateProjectionMatrix()
    }
  }

  setKey(color: THREE.ColorRepresentation, intensity: number, from: readonly number[], to: readonly number[], angle = 0.7, distance = 12, penumbra = 0.5) {
    this.key.color.set(color)
    this.key.intensity = intensity
    this.key.position.set(from[0], from[1], from[2])
    this.key.target.position.set(to[0], to[1], to[2])
    this.key.target.updateMatrixWorld()
    this.key.angle = angle
    this.key.distance = distance
    this.key.penumbra = penumbra
  }

  setPoint(i: number, color: THREE.ColorRepresentation, intensity: number, at: readonly number[], distance = 10) {
    const p = this.points[i]
    p.color.set(color)
    p.intensity = intensity
    p.position.set(at[0], at[1], at[2])
    p.distance = distance
  }
}

// ——— Mouths ———

/** A small dark mouth on the face that opens when the figure speaks. */
export function mouthOf(f: Figure) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.011, 18), new THREE.MeshBasicMaterial({ color: 0x2a1410 }))
  m.position.set(0, 0.036, 0.098)
  m.rotation.x = -0.15
  m.scale.set(1.5, 0.1, 1)
  f.joints.head.add(m)
  return m
}

/** Opens a mouth: 0 shut … 1 a shout. */
export function setMouth(m: THREE.Mesh, open: number) {
  m.visible = open > 0.02
  m.scale.set(1.5 + open * 0.6, 0.15 + open * 1.6, 1)
}

/** Lip movement for speech, a pure function of time. */
export const speech = (time: number, amount: number) => amount * (0.25 + 0.75 * Math.abs(Math.sin(time * 11.3) * Math.sin(time * 4.1 + 1.3)))

// ——— Held props ———

const gm = new THREE.Matrix4()
const om = new THREE.Matrix4()
const ov = new THREE.Vector3()
const oq = new THREE.Quaternion()
const os = new THREE.Vector3()
const oe = new THREE.Euler()

/** Puts `prop` (a child of the scene) in a figure's hand with a local offset. */
export function inHand(prop: THREE.Object3D, f: Figure, side: 'l' | 'r', pos: readonly number[] = [0, 0, 0], rot: readonly number[] = [0, 0, 0]) {
  const grip = side === 'l' ? f.lGrip : f.rGrip
  grip.updateWorldMatrix(true, false)
  oe.set(rot[0], rot[1], rot[2])
  om.compose(ov.set(pos[0], pos[1], pos[2]), oq.setFromEuler(oe), os.set(1, 1, 1))
  gm.multiplyMatrices(grip.matrixWorld, om)
  gm.decompose(prop.position, prop.quaternion, prop.scale)
  prop.visible = true
}

/** World position of a joint (head, chest…). */
export function jointPos(f: Figure, j: keyof Figure['joints'], out = new THREE.Vector3()) {
  return f.joints[j].getWorldPosition(out)
}

// ——— The world ———

export type Cast = {
  arifS: Actor
  arifJ: Actor
  arifO: Actor
  boss: Actor
  copy1: Actor
  copy2: Actor
  office: Actor[]
  g1: Actor
  g2: Actor
  tech: Actor
  orderlies: Actor[]
  cleaners: Actor[]
  guards: Actor[]
  c333: Actor
  c334: Actor
}

export class World {
  readonly office = new Office()
  readonly stairs = new Stairs()
  readonly street = new Street()
  readonly service = new Service()
  readonly room = new WhiteRoom()
  readonly line = new ConvictLine()
  readonly mats = C.castMaterials()
  lights!: LightRig
  cast!: Cast
  all: Actor[] = []
  mouths = new Map<Actor, THREE.Mesh>()
  ties = new Map<Actor, THREE.Object3D[]>()
  car!: CarRig
  carHolder = new THREE.Group()
  /** Hand-held things, children of the scene. */
  bossPhone!: { group: THREE.Group; screen: THREE.Mesh }
  copyPhones: Array<{ group: THREE.Group; screen: THREE.Mesh }> = []
  tablet!: THREE.Group
  towel!: THREE.Mesh
  heldGlasses!: THREE.Group
  bag!: THREE.Group
  /** Paper cups that travel from the tray to a hand (pill, water). */
  cupPill!: THREE.Group
  cupWater!: THREE.Group
  hoods = new Map<Actor, THREE.Group>()
  chains: C.Chain[] = []
  bands = new Map<Actor, THREE.Mesh>()
  copyU: RevealU[] = []
  copyMats: THREE.Material[][] = []
  /** Coats for 18.00: [actor, its top meshes, shirt material, coat material]. */
  coats: Array<[Actor, THREE.Mesh[], THREE.Material, THREE.Material]> = []
  hdri: Record<string, THREE.Texture | null> = {}
  fallbackEnv!: THREE.Texture
  scene!: THREE.Scene
  post!: PostParams

  /** Builds the cast (sets are built by the director). */
  buildCast(scene: THREE.Scene) {
    const m = this.mats
    const add = (f: Figure) => {
      scene.add(f.root)
      const a = new Actor(f)
      this.all.push(a)
      return a
    }
    const arif = (outfit: 'shirt' | 'jacket' | 'overalls') => {
      const f = new Figure(C.arifLook(m, outfit))
      if (outfit !== 'overalls') f.glasses.add(C.rectGlasses(m.glassFrame, m.glassLens))
      if (outfit === 'shirt') {
        C.shirtCollar(f, m.shirt, false)
        const t = C.tie(f, m.tie)
        const a = add(f)
        this.ties.set(a, [t.knot, t.blade])
        this.mouths.set(a, mouthOf(f))
        return a
      }
      if (outfit === 'jacket') C.jacketFront(f, m.shirt, m.tie)
      else C.overallsDetail(f, m)
      const a = add(f)
      this.mouths.set(a, mouthOf(f))
      return a
    }
    const arifS = arif('shirt')
    const arifJ = arif('jacket')
    const arifO = arif('overalls')
    const boss = (name: string) => {
      const f = new Figure(C.bossLook(m, name))
      C.shirtCollar(f, m.shirtBoss, true)
      C.bossHead(f, m)
      const a = add(f)
      this.mouths.set(a, mouthOf(f))
      return a
    }
    const realBoss = boss('Patron')
    const copy1 = boss('Kopya-1')
    const copy2 = boss('Kopya-2')
    // The copies assemble out of cells: their own reveal (mode 1, unrevealed discarded, a white edge).
    for (const c of [copy1, copy2]) {
      const u = revealUniforms(this.room.uShell)
      u.uMode.value = 1
      u.uHide.value = 1
      u.uEdge.value = 1
      u.uReveal.value = 1
      this.copyU.push(u)
      this.copyMats.push(revealify(c.figure.root, u))
    }
    const office: Actor[] = []
    for (let i = 0; i < 10; i++) {
      const f = new Figure(C.colleagueLook(m, i % 8 === i ? i : (i * 3) % 8))
      C.noShadows(f)
      const a = add(f)
      office.push(a)
      if (i < 8) this.coats.push([a, C.wearers(f, m.shirts[i]), m.shirts[i], m.coats[i]])
    }
    const g1f = new Figure(C.staffLook(m, 'g1'))
    C.bun(g1f, m.hairs[0])
    C.badge(g1f, m.badge)
    const g2f = new Figure(C.staffLook(m, 'g2'))
    C.gloves(g2f, m.whiteGlove)
    C.badge(g2f, m.badge)
    const techf = new Figure(C.staffLook(m, 'tech'))
    C.bun(techf, m.hairs[1])
    const g1 = add(g1f)
    const g2 = add(g2f)
    const tech = add(techf)
    this.mouths.set(g1, mouthOf(g1f))
    this.mouths.set(g2, mouthOf(g2f))
    const orderlies = [0, 1].map((i) => {
      const f = new Figure(C.workerLook(m, 'orderly', i))
      C.gloves(f, m.glove)
      C.faceMask(f, m.mask)
      return add(f)
    })
    const cleaners = [0, 1].map((i) => {
      const f = new Figure(C.workerLook(m, 'cleaner', i))
      C.gloves(f, std(0xe8c440, 0.6))
      return add(f)
    })
    const guards = [0, 1].map((i) => {
      const f = new Figure(C.workerLook(m, 'guard', i))
      C.cap(f, m.cap)
      C.gloves(f, m.glove)
      return add(f)
    })
    const convict = (n: 333 | 334) => {
      const f = new Figure(C.convictLook(m, n))
      C.briefs(f, m.briefs)
      C.cuffs(f, m.steel)
      const a = add(f)
      this.bands.set(a, C.neckBand(f, n, m.bandWhite))
      this.hoods.set(a, C.hood(f, m.hood))
      const wrist = new C.Chain(7, m.steel)
      const ankle = new C.Chain(12, m.steel)
      scene.add(wrist.mesh, ankle.mesh)
      this.chains.push(wrist, ankle)
      return a
    }
    const c333 = convict(333)
    const c334 = convict(334)
    this.cast = { arifS, arifJ, arifO, boss: realBoss, copy1, copy2, office, g1, g2, tech, orderlies, cleaners, guards, c333, c334 }

    // Held props.
    const phoneBody = std(0x1a1c1f, 0.3)
    const holidayScreen = () => canvasPlane(0.066, 0.145, 256, S.holiday, { emissive: true }).mesh
    const mkPhone = () => {
      const p = phoneProp(phoneBody, new THREE.MeshBasicMaterial({ color: 0x000000 }))
      p.screen.visible = false
      const s = holidayScreen()
      s.rotation.x = -PI / 2
      s.position.y = 0.0086
      p.group.add(s)
      scene.add(p.group)
      return { group: p.group, screen: s }
    }
    this.bossPhone = mkPhone()
    for (let i = 0; i < 2; i++) {
      const p = mkPhone()
      // The copies' phones arrive with them.
      revealify(p.group, this.copyU[i])
      this.copyPhones.push(p)
    }
    this.tablet = new THREE.Group()
    rbox(0.24, 0.17, 0.012, std(0x1a1c1f, 0.3), 0, 0, 0, this.tablet, 0.01)
    const ts = canvasPlane(0.22, 0.15, 256, (c, W, H) => S.prepScreen(c, W, H, { kind: 'copies', fill: 0, two: 0 }), { emissive: true })
    ts.mesh.position.z = 0.007
    this.tablet.add(ts.mesh)
    scene.add(this.tablet)
    this.towel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.22), std(0xf7f7f5, 1))
    this.towel.castShadow = true
    scene.add(this.towel)
    this.heldGlasses = C.foldedGlasses(m.glassFrame, m.glassLens)
    scene.add(this.heldGlasses)
    this.bag = new THREE.Group()
    rbox(0.38, 0.28, 0.1, std(0x2a2522, 0.6), 0, -0.14, 0, this.bag, 0.02)
    rbox(0.02, 0.12, 0.02, std(0x1a1614, 0.6), 0, 0.03, 0, this.bag, 0.008)
    scene.add(this.bag)
    const paper = std(0xf6f4ee, 0.85)
    this.cupPill = paperCup(paper, undefined, std(0xffffff, 0.3))
    this.cupWater = paperCup(paper, new THREE.MeshPhysicalMaterial({ color: 0xcfe8f0, roughness: 0.05, transparent: true, opacity: 0.6 }))
    scene.add(this.cupPill, this.cupWater)
  }

  /** Every actor reset and hidden; held props hidden. Called first in every frame. */
  reset() {
    for (const a of this.all) {
      a.begin()
      a.visible = false
    }
    for (const mth of this.mouths.values()) mth.visible = false
    for (const p of [this.bossPhone.group, ...this.copyPhones.map((c) => c.group), this.tablet, this.towel, this.heldGlasses, this.bag, this.cupPill, this.cupWater]) p.visible = false
    for (const ch of this.chains) ch.mesh.visible = false
  }

  /** Shows an actor (begin() already ran in reset). */
  use(a: Actor) {
    a.visible = true
    return a
  }

  /** Writes every visible actor to its figure. */
  apply(time: number, breathe = true) {
    for (const a of this.all) a.apply(time, breathe)
  }

  mouth(a: Actor, open: number) {
    const m = this.mouths.get(a)
    if (m) setMouth(m, a.visible ? open : 0)
  }

  /** Wears the coat (1) or the shirt (0) for an office colleague. */
  coat(i: number, on: boolean) {
    const c = this.coats[i]
    if (!c) return
    for (const mm of c[1]) mm.material = on ? c[3] : c[2]
  }

  /** Cuffs and shackles drawn between the hands and feet of a convict. */
  chainsFor(a: Actor, k: 0 | 1) {
    const f = a.figure
    const w = this.chains[k * 2]
    const an = this.chains[k * 2 + 1]
    if (!a.visible) return
    const l = new THREE.Vector3()
    const r = new THREE.Vector3()
    f.joints.lHand.getWorldPosition(l)
    f.joints.rHand.getWorldPosition(r)
    w.mesh.visible = true
    w.set(l, r, 0.02)
    f.joints.lFoot.getWorldPosition(l)
    f.joints.rFoot.getWorldPosition(r)
    l.y += 0.06
    r.y += 0.06
    an.mesh.visible = true
    an.set(l, r, 0.06)
  }
}

export { rbox }
