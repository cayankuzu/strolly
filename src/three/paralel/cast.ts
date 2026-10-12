/**
 * PARALEL-LEŞ — the cast: the narrator at 9, 12 and 15, the man he is now,
 * Emre and Barış, the mother's silhouette; and the ghosts — the same rigs in
 * the ghost material — with a pool of trail copies for the ones that fall.
 */
import * as THREE from 'three'
import { Figure, type FigureLook } from '../figure/Figure'
import { MALE_FACE } from '../figure/figureBody'
import { Actor } from '../kit/direct'
import { std } from '../kit/props'
import { skinMaterial } from '../kit/surfaces'
import { mesh } from '../util'
import { Ghost } from './ghost'

export const H9 = 0.74
export const H12 = 0.84
export const H15 = 0.93

type M = THREE.Material

function palette() {
  return {
    skinBoy: std(0xd6ae92, 0.56),
    skinBoyHead: std(0xd6ae92, 0.52, { vertexColors: true }),
    skinMan: std(0xc99d80, 0.56),
    skinManHead: std(0xc99d80, 0.52, { vertexColors: true }),
    skinEmre: std(0xb88a6c, 0.56),
    skinEmreHead: std(0xb88a6c, 0.52, { vertexColors: true }),
    skinBaris: std(0xe0bba0, 0.56),
    skinBarisHead: std(0xe0bba0, 0.52, { vertexColors: true }),
    skinAnne: std(0xc9a08a, 0.56),
    skinAnneHead: std(0xc9a08a, 0.52, { vertexColors: true }),
    eye: std(0x2a1a10, 0.15),
    hairBoy: std(0x2a1c14, 0.7),
    hairMan: std(0x1e1612, 0.7),
    hairEmre: std(0x0e0b09, 0.75),
    hairBaris: std(0x6b4a2e, 0.7),
    hairAnne: std(0x1a1310, 0.7),
    windbreaker: std(0xc0392b, 0.55),
    jeans: std(0x3b4f72, 0.9),
    darkJeans: std(0x232a38, 0.9),
    sneaker: std(0xefefea, 0.6),
    sneakerWorn: std(0xd9d6cf, 0.7),
    sneakerMan: std(0xe9e8e2, 0.62),
    soleWhite: std(0xdedbd3, 0.8),
    stripe: std(0xc0262b, 0.55),
    pyjama: std(0x7d8ca3, 0.9),
    olive: std(0x6b7a3a, 0.9),
    shorts: std(0x77756f, 0.9),
    swim: std(0x1f2c4a, 0.7),
    hoodie: std(0x1c1c1f, 0.95),
    cargo: std(0x6b6a63, 0.92),
    fieldJacket: std(0x4b5a3a, 0.88),
    yellow: std(0xe1b12c, 0.88),
    shirtBlue: std(0x9fb6d6, 0.86),
    khaki: std(0xa08e6a, 0.9),
    cardigan: std(0x3a3330, 0.95),
    skirtDark: std(0x2a2523, 0.92),
    shoeDark: std(0x1a1716, 0.7),
    soleDark: std(0x0e0d0d, 0.85),
    frame: std(0x1a1a1a, 0.4),
    lens: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.15, depthWrite: false }),
    watch: std(0x111214, 0.45),
    blouse: std(0xb8605a, 0.85),
    hairGrey: std(0x9a958e, 0.75),
    oldCardigan: std(0x6b5a48, 0.95),
  }
}
type CastPal = ReturnType<typeof palette>

const BOY_FACE = { jaw: 0.12, nose: 0.12, lips: 0.04, stubble: 0 }

type Extras = { stripes?: M; shorts?: { mat: M; len: number }; hood?: M; watch?: boolean; head?: number }

function look(m: CastPal, who: string): { look: FigureLook; extras: Extras } {
  const base = { name: who, eye: m.eye, collar: 'crew' as const, hairStyle: 'short' as const }
  switch (who) {
    case 'boy9':
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinBoy, skinHead: m.skinBoyHead, hair: m.hairBoy, top: m.windbreaker, bottom: m.jeans, cuff: m.windbreaker, shoes: m.sneaker, sole: m.soleWhite, height: H9, topSurface: 'fabric', bottomSurface: 'denim' }, extras: { stripes: m.stripe, head: 1.13 } }
    case 'boy9pj': {
      const bare = skinMaterial(0xd6ae92, { roughness: 0.6 })
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinBoy, skinHead: m.skinBoyHead, hair: m.hairBoy, top: m.pyjama, bottom: m.pyjama, cuff: m.pyjama, shoes: bare, sole: bare, height: H9, topSurface: 'fabric' }, extras: { head: 1.13 } }
    }
    case 'boy12': {
      const legs = skinMaterial(0xd6ae92, { roughness: 0.62 })
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinBoy, skinHead: m.skinBoyHead, hair: m.hairBoy, top: m.olive, bottom: legs, cuff: m.olive, shoes: m.sneaker, sole: m.soleWhite, height: H12, topSurface: 'fabric' }, extras: { stripes: m.stripe, shorts: { mat: m.shorts, len: 0.3 }, watch: true, head: 1.08 } }
    }
    case 'boy12swim': {
      const bare = skinMaterial(0xd6ae92, { roughness: 0.5 })
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinBoy, skinHead: m.skinBoyHead, hair: m.hairBoy, top: bare, bottom: bare, cuff: bare, shoes: bare, sole: bare, height: H12 }, extras: { shorts: { mat: m.swim, len: 0.18 }, head: 1.08 } }
    }
    case 'boy15':
      return { look: { ...base, build: 'm', face: { jaw: 0.2, nose: 0.16, lips: 0.04, stubble: 0 }, skin: m.skinBoy, skinHead: m.skinBoyHead, hair: m.hairBoy, top: m.hoodie, bottom: m.cargo, cuff: m.hoodie, shoes: m.sneakerWorn, sole: m.soleWhite, height: H15, topSurface: 'knit', bottomSurface: 'fabric' }, extras: { stripes: m.stripe, hood: m.hoodie, head: 1.03 } }
    case 'man':
      return { look: { ...base, build: 'm', face: { ...MALE_FACE, stubble: 0.5 }, skin: m.skinMan, skinHead: m.skinManHead, hair: m.hairMan, top: m.fieldJacket, bottom: m.darkJeans, cuff: m.fieldJacket, shoes: m.sneakerMan, sole: m.soleWhite, height: 1, topSurface: 'fabric', bottomSurface: 'denim', belt: true }, extras: { stripes: m.stripe } }
    case 'emre':
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinEmre, skinHead: m.skinEmreHead, hair: m.hairEmre, top: m.yellow, bottom: m.jeans, cuff: m.yellow, shoes: m.shoeDark, sole: m.soleDark, height: 0.85, topSurface: 'fabric', bottomSurface: 'denim' }, extras: { head: 1.08 } }
    case 'baris': {
      const legs = skinMaterial(0xe0bba0, { roughness: 0.62 })
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinBaris, skinHead: m.skinBarisHead, hair: m.hairBaris, top: m.shirtBlue, bottom: legs, cuff: m.shirtBlue, shoes: m.shoeDark, sole: m.soleDark, height: 0.8, topSurface: 'fabric', glasses: { frame: m.frame, lens: m.lens } }, extras: { shorts: { mat: m.khaki, len: 0.26 }, head: 1.1 } }
    }
    case 'woman':
      return { look: { ...base, build: 'f', face: { jaw: 0.16, nose: 0.14, lips: 0.06, stubble: 0 }, hairStyle: 'long', skin: m.skinAnne, skinHead: m.skinAnneHead, hair: m.hairBaris, top: m.blouse, bottom: m.skirtDark, cuff: m.blouse, shoes: m.shoeDark, sole: m.soleDark, height: 0.97, topSurface: 'fabric' }, extras: {} }
    case 'oldman':
      return { look: { ...base, build: 'm', face: { ...MALE_FACE, stubble: 0.2, jaw: 0.4 }, skin: m.skinMan, skinHead: m.skinManHead, hair: m.hairGrey, top: m.oldCardigan, bottom: m.cargo, cuff: m.oldCardigan, shoes: m.shoeDark, sole: m.soleDark, height: 0.96, topSurface: 'knit', collar: 'mock' }, extras: {} }
    case 'anne':
      return { look: { ...base, build: 'f', face: { jaw: 0.14, nose: 0.13, lips: 0.07, stubble: 0 }, hairStyle: 'long', skin: m.skinAnne, skinHead: m.skinAnneHead, hair: m.hairAnne, top: m.cardigan, bottom: m.skirtDark, cuff: m.cardigan, shoes: m.shoeDark, sole: m.soleDark, height: 0.98, topSurface: 'knit', collar: 'mock' }, extras: {} }
    default:
      return { look: { ...base, build: 'm', face: BOY_FACE, skin: m.skinBoy, skinHead: m.skinBoyHead, hair: m.hairBoy, top: m.olive, bottom: m.jeans, cuff: m.olive, shoes: m.sneaker, sole: m.soleWhite, height: 1 }, extras: {} }
  }
}

/** Watch face: a tiny canvas the story writes digits on. */
export class WatchFace {
  readonly canvas = document.createElement('canvas')
  readonly texture: THREE.CanvasTexture
  readonly material: THREE.MeshBasicMaterial
  private text = ''
  constructor() {
    this.canvas.width = 128
    this.canvas.height = 64
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.material = new THREE.MeshBasicMaterial({ map: this.texture })
    this.show('00:00.0')
  }
  show(text: string) {
    if (text === this.text) return
    this.text = text
    const g = this.canvas.getContext('2d')!
    g.fillStyle = '#7f8c76'
    g.fillRect(0, 0, 128, 64)
    g.fillStyle = 'rgba(0,0,0,0.12)'
    g.font = '700 34px monospace'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('88:88.8', 64, 34)
    g.fillStyle = '#141812'
    g.fillText(text, 64, 34)
    this.texture.needsUpdate = true
  }
}

/** Adds the small things that make a costume: shoe stripes, shorts over bare legs, a hood, a watch. */
function dress(fig: Figure, x: Extras, watch: WatchFace | null) {
  const J = fig.joints
  if (x.head) J.head.scale.setScalar(x.head)
  if (x.stripes) {
    const g = new THREE.BoxGeometry(0.004, 0.014, 0.13)
    for (const foot of [J.lFoot, J.rFoot])
      for (const sx of [-1, 1]) {
        const s = mesh(g, x.stripes, sx * 0.051, -0.072, 0.05, foot)
        s.rotation.x = 0.16
        s.rotation.y = sx * 0.06
      }
  }
  if (x.shorts) {
    const { mat, len } = x.shorts
    const band = mesh(new THREE.CylinderGeometry(1, 1.04, 0.2, 24, 1, true), mat, 0, -0.03, -0.004, J.hips)
    band.scale.set(0.162, 1, 0.122)
    const seat = mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat, 0, -0.12, -0.004, J.hips)
    seat.scale.set(0.16, 0.07, 0.12)
    for (const thigh of [J.lThigh, J.rThigh]) {
      const sl = mesh(new THREE.CylinderGeometry(0.086, 0.064 + 0.02 * (1 - len / 0.44), len, 18, 1, true), mat, 0, -len / 2 + 0.02, 0, thigh)
      sl.scale.z = 1.04
    }
  }
  if (x.hood) {
    const h = mesh(new THREE.TorusGeometry(0.075, 0.035, 10, 20, Math.PI * 1.25), x.hood, 0, 0.27, -0.035, J.chest)
    h.rotation.set(Math.PI / 2 + 0.25, 0, Math.PI * 1.125)
    h.scale.set(1.15, 1, 0.8)
  }
  if (x.watch && watch) {
    const w = new THREE.Group()
    w.position.set(0, -0.225, 0)
    J.lFore.add(w)
    mesh(new THREE.CylinderGeometry(0.031, 0.03, 0.022, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0x0d0d0e, roughness: 0.6, side: THREE.DoubleSide }), 0, 0, 0, w)
    const body = mesh(new THREE.BoxGeometry(0.036, 0.03, 0.012), new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.4 }), 0, 0, 0.034, w)
    body.castShadow = true
    const face = mesh(new THREE.PlaneGeometry(0.028, 0.016), watch.material, 0, 0.0, 0.0405, w)
    face.name = 'watch-face'
  }
  fig.root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !(o as THREE.SkinnedMesh).isSkinnedMesh) o.castShadow = true
  })
}

export type GhostKey = 'roofs' | 'glass' | 'bridge' | 'stones' | 'sea' | 'bike' | 'slope' | 'socket' | 'emre' | 'baris' | 'man1' | 'man2'

const GHOST_OF: Record<GhostKey, string> = {
  roofs: 'boy9',
  glass: 'boy9',
  bridge: 'boy12',
  stones: 'boy12',
  sea: 'boy12swim',
  bike: 'boy15',
  slope: 'boy15',
  socket: 'boy9pj',
  emre: 'emre',
  baris: 'baris',
  man1: 'man',
  man2: 'man',
}

type Solid = 'boy9' | 'boy9pj' | 'boy12' | 'boy12swim' | 'boy15' | 'man' | 'emre' | 'baris' | 'anne' | 'woman' | 'oldman'

export class Cast {
  readonly group = new THREE.Group()
  readonly solids = {} as Record<Solid, Actor>
  readonly ghosts = {} as Record<GhostKey, Ghost>
  readonly trails: Ghost[] = []
  readonly watch = new WatchFace()
  private trailUse = 0
  private figures: Figure[] = []
  private pal = palette()

  constructor() {
    const m = this.pal
    for (const who of ['boy9', 'boy9pj', 'boy12', 'boy12swim', 'boy15', 'man', 'emre', 'baris', 'anne', 'woman', 'oldman'] as Solid[]) {
      const { look: l, extras } = look(m, who)
      const fig = new Figure(l)
      dress(fig, extras, this.watch)
      this.solids[who] = new Actor(fig)
      this.add(fig)
    }
    for (const key of Object.keys(GHOST_OF) as GhostKey[]) {
      const { look: l, extras } = look(m, GHOST_OF[key])
      // Build the ghost's costume first so the shapes match, then swap it all to the ghost material.
      const g = new Ghost({ ...l, name: `ghost-${key}` }, (fig) => dress(fig, { ...extras, watch: false }, null))
      this.ghosts[key] = g
      this.add(g.figure)
    }
    for (let i = 0; i < 6; i++) {
      const { look: l } = look(m, 'trail')
      const g = new Ghost({ ...l, name: `trail-${i}` })
      this.trails.push(g)
      this.add(g.figure)
    }
  }

  private add(fig: Figure) {
    this.figures.push(fig)
    this.group.add(fig.root)
  }

  /** Hide everyone; each shot shows who it needs. */
  begin() {
    for (const f of this.figures) {
      f.root.visible = false
      for (const m of f.headMeshes) m.visible = true
    }
    this.trailUse = 0
  }

  /** Writes a solid actor (call after setting its state). */
  show(a: Actor, time: number, breathe = true) {
    a.apply(time, breathe)
  }

  /**
   * Draws a ghost: `pose(actor, uu)` writes its state at progress uu and
   * returns its opacity. With `trail`, two copies follow at uu − dt and
   * uu − 2·dt (half and a quarter as bright) while it moves.
   */
  ghost(g: Ghost, u: number, pose: (a: Actor, uu: number) => number, time: number, opts: { flash?: number; trail?: number; alpha?: boolean; after?: (a: Actor) => void } = {}) {
    g.figure.root.scale.setScalar(g.height)
    g.actor.begin()
    const op = pose(g.actor, u)
    g.actor.apply(time, false)
    opts.after?.(g.actor)
    g.mode(!!opts.alpha)
    g.set(op, opts.flash ?? 0)
    const dt = opts.trail ?? 0
    if (dt <= 0 || op <= 0.01) return
    const p0 = g.figure.root.position
    for (let k = 1; k <= 2; k++) {
      const t = this.trails[this.trailUse]
      if (!t) return
      this.trailUse++
      t.figure.root.scale.setScalar(g.height)
      t.actor.begin()
      const o = pose(t.actor, u - dt * k)
      t.actor.apply(time, false)
      opts.after?.(t.actor)
      const moved = t.figure.root.position.distanceTo(p0)
      t.mode(!!opts.alpha)
      t.set(Math.min(o, op) * (k === 1 ? 0.5 : 0.25) * Math.min(1, moved / 0.25))
    }
  }
}
