/**
 * The people of the cafe: the narrator at ten and at thirty-eight, Emre at
 * ten and thirty-four, Kemal Abi then and now, the mother young and old,
 * Dede, Baba, a young couple with a baby carriage, and the strangers (the
 * teenagers of the child's afternoons become the adults of every age later:
 * the same nine bodies, re-dressed per era). Plus what they carry on them: a
 * red schoolbag, moustaches, an apron, a bun, the scarf.
 */
import * as THREE from 'three'
import { Figure, type FigureLook } from '../figure/Figure'
import { Actor } from '../kit/direct'
import { rbox, std, tube } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mesh } from '../util'
import { knittedBand, needles } from './scarf'

const PI = Math.PI
export const SCARF_RED = 0xa4472c

function mats() {
  return {
    eye: std(0x2a1d14, 0.15),
    eyeBlue: std(0x34506a, 0.15),
    skinLight: std(0xd7a98a, 0.6),
    skinLightHead: std(0xd7a98a, 0.58, { vertexColors: true }),
    skinMid: std(0xc29174, 0.6),
    skinMidHead: std(0xc29174, 0.58, { vertexColors: true }),
    skinOld: std(0xd2ab93, 0.66),
    skinOldHead: std(0xd2ab93, 0.64, { vertexColors: true }),
    skinTan: std(0xb07f62, 0.6),
    skinTanHead: std(0xb07f62, 0.58, { vertexColors: true }),
    sole: std(0x111111, 0.85),
    soleWhite: std(0xd8d4cc, 0.8),
    shoeDark: std(0x1b1714, 0.6),
    shoeBrown: std(0x3a2618, 0.6),
    shoeWhite: std(0xe8e5de, 0.6),
    glassFrame: std(0x2a221c, 0.4),
    glassFrameGold: pbr('metal', 0xa88a50, { roughness: 0.35 }),
    lens: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  }
}

/** Height factor of each person (Figure.height). */
export const HEIGHT = {
  benKid: 0.78,
  emreKid: 0.8,
  benAdult: 1.0,
  emreAdult: 1.0,
  kemalYoung: 1.0,
  kemalOld: 0.98,
  anneYoung: 0.95,
  anneOld: 0.93,
  dede: 0.94,
  baba: 0.98,
  coupleM: 1.0,
  coupleF: 0.95,
}

export type Extra = {
  actor: Actor
  top: THREE.MeshStandardMaterial
  bottom: THREE.MeshStandardMaterial
  hair: THREE.MeshStandardMaterial
  build: 'm' | 'f'
  height: number
}

/** The strangers per era: [hair, top, bottom, height]. */
const EXTRA_LOOKS: Record<'kid' | 'adult' | 'spring', Array<[number, number, number, number]>> = {
  kid: [
    [0x2a1d15, 0x8a2f2f, 0x2d3646, 0.9],
    [0x3a2a1c, 0x2f6f8f, 0x34404e, 0.88],
    [0x1d1612, 0xd9c36a, 0x2a2f3a, 0.92],
    [0x4a3020, 0x3f5f3a, 0x3a3f48, 0.9],
    [0x1a1410, 0x5a4a7a, 0x2c3340, 0.91],
    [0x2a1d15, 0x777777, 0x2d3646, 0.9],
    [0x2a1d15, 0x777777, 0x2d3646, 0.9],
    [0x2a1d15, 0x777777, 0x2d3646, 0.9],
    [0x2a1d15, 0x777777, 0x2d3646, 0.9],
  ],
  adult: [
    [0x2a1f18, 0x3b4d63, 0x2b2e33, 1.0],
    [0x5a3a26, 0x7a4b3a, 0x2c2a2a, 0.95],
    [0x8a8580, 0x55606a, 0x3a3836, 0.97],
    [0x1d1612, 0x2f3a2f, 0x23262b, 1.02],
    [0x3a2a1c, 0x9a7a5a, 0x2f2b28, 0.94],
    [0x14110f, 0x6a2f3a, 0x262a30, 1.0],
    [0xb5b0a8, 0x4a4238, 0x3a3836, 0.96],
    [0x2a1d15, 0x2a3f5a, 0x2b2e33, 1.01],
    [0x4a3020, 0x5f6a4a, 0x2a2c30, 0.95],
  ],
  spring: [
    [0x2a1f18, 0x6f8fb0, 0x2b2e33, 1.0],
    [0x5a3a26, 0xc9a06a, 0x3a3634, 0.95],
    [0x8a8580, 0x8a9a7a, 0x3a3836, 0.97],
    [0x1d1612, 0xd9d2c4, 0x23262b, 1.02],
    [0x3a2a1c, 0xb5706a, 0x2f2b28, 0.94],
    [0x14110f, 0x3f6f6a, 0x262a30, 1.0],
    [0xb5b0a8, 0x9a8a6a, 0x3a3836, 0.96],
    [0x2a1d15, 0x4a6a9a, 0x2b2e33, 1.01],
    [0x4a3020, 0xa3a07a, 0x2a2c30, 0.95],
  ],
}

export class Cast {
  private m = mats()
  readonly all: Actor[] = []
  benKid!: Actor
  emreKid!: Actor
  benAdult!: Actor
  emreAdult!: Actor
  kemalYoung!: Actor
  kemalOld!: Actor
  anneYoung!: Actor
  anneOld!: Actor
  dede!: Actor
  baba!: Actor
  coupleM!: Actor
  coupleF!: Actor
  extras: Extra[] = []
  /** Clothes that change: a coat put on over the top. */
  readonly coats = {
    dede: pbr('fabric', 0x2c2a28),
    baba: pbr('fabric', 0x34393f),
    anne: pbr('fabric', 0xa07a52),
  }
  readonly tops = {} as Record<'dede' | 'baba' | 'anneOld', THREE.Material>
  /** Props worn on the body. */
  bag!: THREE.Group
  scarf!: THREE.Group
  readonly materials: THREE.Material[] = []
  private extraEra = ''

  build(scene: THREE.Scene) {
    const m = this.m
    const own = <T extends THREE.Material>(mat: T) => {
      this.materials.push(mat)
      return mat
    }
    const make = (look: FigureLook) => {
      const f = new Figure(look)
      scene.add(f.root)
      const a = new Actor(f)
      this.all.push(a)
      return a
    }
    const base = (name: string, build: 'm' | 'f', skin: 'light' | 'mid' | 'old' | 'tan', hair: number, top: THREE.Material, bottom: THREE.Material, shoes: THREE.Material, extra: Partial<FigureLook> = {}): FigureLook => {
      const sk = skin === 'light' ? [m.skinLight, m.skinLightHead] : skin === 'mid' ? [m.skinMid, m.skinMidHead] : skin === 'old' ? [m.skinOld, m.skinOldHead] : [m.skinTan, m.skinTanHead]
      return {
        name,
        build,
        face: build === 'm' ? { jaw: 0.3, nose: 0.2, lips: 0.045, stubble: 0.25 } : { jaw: 0.15, nose: 0.15, lips: 0.06, stubble: 0 },
        hairStyle: build === 'm' ? 'short' : 'long',
        skin: sk[0],
        skinHead: sk[1],
        eye: m.eye,
        hair: own(std(hair, 0.7)),
        top,
        bottom,
        shoes,
        sole: m.sole,
        cuff: top,
        collar: 'crew',
        ...extra,
      }
    }
    const jeans = (c: number) => own(std(c, 0.9))
    // The narrator at ten: blue hoodie, jeans, white sneakers, a red schoolbag.
    const hoodie = own(std(0x2f5d9a, 0.92))
    this.benKid = make(
      base('Ben (10)', 'm', 'light', 0x5a3a24, hoodie, jeans(0x34425e), m.shoeWhite, {
        face: { jaw: 0.06, nose: 0.08, lips: 0.05, stubble: 0 },
        sole: m.soleWhite,
        height: HEIGHT.benKid,
        topSurface: 'knit',
        bottomSurface: 'denim',
      }),
    )
    this.hood(this.benKid.figure, hoodie)
    this.bag = this.schoolbag()
    this.benKid.figure.joints.chest.add(this.bag)
    // Emre at ten: buzz cut, green T-shirt.
    this.emreKid = make(
      base('Emre (10)', 'm', 'mid', 0x1a1410, own(std(0x3c7a4c, 0.9)), jeans(0x3a4658), m.shoeDark, {
        face: { jaw: 0.08, nose: 0.12, lips: 0.05, stubble: 0 },
        height: HEIGHT.emreKid,
        bottomSurface: 'denim',
      }),
    )
    // The narrator now: charcoal wool coat over a dark sweater, jeans.
    this.benAdult = make(
      base('Ben', 'm', 'light', 0x231a15, own(std(0x3b3c40, 0.92)), jeans(0x2d3647), m.shoeBrown, {
        face: { jaw: 0.32, nose: 0.2, lips: 0.045, stubble: 0.4 },
        bottomSurface: 'denim',
        topSurface: 'fabric',
      }),
    )
    this.scarf = this.scarfProp()
    this.benAdult.figure.joints.chest.add(this.scarf)
    // Emre now: brown leather jacket.
    this.emreAdult = make(
      base('Emre', 'm', 'mid', 0x1a1410, own(std(0x3a2a21, 0.55)), jeans(0x262b33), m.shoeDark, {
        face: { jaw: 0.36, nose: 0.22, lips: 0.045, stubble: 0.5 },
        topSurface: 'leather',
        bottomSurface: 'denim',
      }),
    )
    // Kemal Abi then: black hair, moustache, checked shirt, dark apron.
    this.kemalYoung = make(base('Kemal Abi', 'm', 'tan', 0x161210, own(std(0x7a3e34, 0.9)), own(std(0x2b2a2a, 0.9)), m.shoeDark, { face: { jaw: 0.4, nose: 0.26, lips: 0.04, stubble: 0.55 } }))
    this.moustache(this.kemalYoung.figure, own(std(0x120e0c, 0.8)))
    this.apron(this.kemalYoung.figure, own(pbr('fabric', 0x26282a)))
    // Kemal Abi now: grey, glasses on a cord, brown cardigan, faded apron.
    this.kemalOld = make(
      base('Kemal Abi (yaşlı)', 'm', 'tan', 0xa8a49e, own(std(0x4e4339, 0.95)), own(std(0x3a3836, 0.9)), m.shoeDark, {
        face: { jaw: 0.38, nose: 0.27, lips: 0.04, stubble: 0.3 },
        height: HEIGHT.kemalOld,
        topSurface: 'knit',
        glasses: { frame: m.glassFrame, lens: m.lens },
      }),
    )
    this.moustache(this.kemalOld.figure, own(std(0x9a958e, 0.85)))
    this.apron(this.kemalOld.figure, own(pbr('fabric', 0x5f6b70)))
    // The mother young: long dark hair, beige trench coat.
    this.anneYoung = make(base('Anne (genç)', 'f', 'light', 0x2a1d17, own(std(0xb9a27c, 0.85)), own(std(0x3a3530, 0.9)), m.shoeDark, { height: HEIGHT.anneYoung }))
    // The mother now: grey bun, mauve cardigan, dark skirt, reading glasses.
    const cardigan = own(std(0x6b4a60, 0.95))
    this.anneOld = make(
      base('Anne', 'f', 'old', 0xb5afa8, cardigan, own(std(0x2e2a30, 0.9)), m.shoeDark, {
        hairStyle: 'short',
        face: { jaw: 0.18, nose: 0.17, lips: 0.05, stubble: 0 },
        height: HEIGHT.anneOld,
        topSurface: 'knit',
        glasses: { frame: m.glassFrameGold, lens: m.lens },
      }),
    )
    this.bun(this.anneOld.figure)
    this.tops.anneOld = cardigan
    // Dede: white hair and moustache, brown wool vest.
    const vest = own(std(0x5d5850, 0.95))
    this.dede = make(
      base('Dede', 'm', 'old', 0xe0ddd6, vest, own(std(0x4a4845, 0.9)), m.shoeBrown, {
        face: { jaw: 0.3, nose: 0.27, lips: 0.035, stubble: 0.2 },
        height: HEIGHT.dede,
        topSurface: 'knit',
      }),
    )
    this.moustache(this.dede.figure, own(std(0xe8e4dc, 0.85)))
    this.tops.dede = vest
    // Baba: grey, reading glasses, navy V-neck.
    const vneck = own(std(0x26304a, 0.95))
    this.baba = make(
      base('Baba', 'm', 'mid', 0x8f8a84, vneck, own(std(0x3b3a38, 0.9)), m.shoeDark, {
        face: { jaw: 0.34, nose: 0.24, lips: 0.04, stubble: 0.3 },
        height: HEIGHT.baba,
        topSurface: 'knit',
        glasses: { frame: m.glassFrame, lens: m.lens },
      }),
    )
    this.tops.baba = vneck
    // The young couple.
    this.coupleM = make(base('Genç baba', 'm', 'light', 0x2a211b, own(std(0x4f5640, 0.9)), jeans(0x2d3647), m.shoeDark, { bottomSurface: 'denim' }))
    this.coupleF = make(base('Genç anne', 'f', 'mid', 0x5a3c2a, own(std(0xa47b55, 0.9)), own(std(0x1f1f22, 0.9)), m.shoeDark, { height: HEIGHT.coupleF }))
    // Strangers.
    const builds: Array<'m' | 'f'> = ['m', 'f', 'm', 'f', 'm', 'm', 'f', 'm', 'f']
    builds.forEach((b, i) => {
      const top = own(std(0x777777, 0.9))
      const bottom = own(std(0x2d3646, 0.9))
      const hair = own(std(0x2a1d15, 0.7))
      const skin = (['light', 'mid', 'tan', 'light', 'mid', 'tan', 'light', 'mid', 'light'] as const)[i]
      const look = base(`Yabancı ${i + 1}`, b, skin, 0x2a1d15, top, bottom, i % 3 ? m.shoeDark : m.shoeBrown)
      look.hair = hair
      const actor = make(look)
      this.extras.push({ actor, top, bottom, hair, build: b, height: 1 })
    })
    for (const a of this.all) a.figure.root.visible = false
  }

  /** Re-dresses the strangers for an era (no geometry changes, only colours and heights). */
  dressExtras(era: 'kid' | 'adult' | 'spring') {
    if (this.extraEra === era) return
    this.extraEra = era
    this.extras.forEach((e, i) => {
      const [hair, top, bottom, h] = EXTRA_LOOKS[era][i]
      e.hair.color.setHex(hair)
      e.top.color.setHex(top)
      e.bottom.color.setHex(bottom)
      e.height = h
      e.actor.figure.root.scale.setScalar(h)
    })
  }

  /** Swaps a person's top between their own clothes and the coat over them. */
  wearCoat(who: 'dede' | 'baba' | 'anneOld', on: boolean) {
    const a = this[who]
    const coat = this.coats[who === 'anneOld' ? 'anne' : who]
    const own = this.tops[who]
    const [from, to] = on ? [own, coat] : [coat, own]
    if (from === to) return
    for (const mm of a.figure.meshes) if (mm.material === from) mm.material = to
  }

  private moustache(f: Figure, mat: THREE.Material) {
    const g = new THREE.CapsuleGeometry(0.0085, 0.04, 4, 10)
    g.rotateZ(PI / 2)
    const mm = mesh(g, mat, 0, 0.062, 0.104, f.joints.head)
    mm.scale.set(1, 0.85, 0.6)
    mm.rotation.x = -0.2
    mm.castShadow = true
  }

  private bun(f: Figure) {
    const b = mesh(new THREE.SphereGeometry(0.046, 16, 12), f.headMeshes[1].material as THREE.Material, 0, 0.09, -0.098, f.joints.head)
    b.scale.set(1, 0.85, 0.8)
    b.castShadow = true
  }

  private hood(f: Figure, mat: THREE.Material) {
    const h = mesh(new THREE.TorusGeometry(0.075, 0.03, 8, 18, PI), mat, 0, 0.27, -0.06, f.joints.chest)
    h.rotation.set(-PI / 2 - 0.5, 0, PI)
    h.scale.set(1, 1.1, 0.8)
    h.castShadow = true
  }

  private apron(f: Figure, mat: THREE.Material) {
    rbox(0.27, 0.26, 0.008, mat, 0, 0.04, 0.122, f.joints.chest, 0.003).castShadow = true
    const skirt = rbox(0.36, 0.5, 0.008, mat, 0, -0.18, 0.125, f.joints.hips, 0.003)
    skirt.castShadow = true
    for (const sx of [-1, 1])
      tube(
        [
          [sx * 0.12, 0.17, 0.118],
          [sx * 0.09, 0.27, 0.07],
          [sx * 0.05, 0.31, 0.0],
        ],
        0.004,
        mat,
        f.joints.chest,
        8,
      )
  }

  /** The red schoolbag on the child's back (hangs from the chest bone). */
  private schoolbag() {
    const red = pbr('fabric', 0xb3322a)
    const strap = std(0x2a2a2e, 0.8)
    this.materials.push(red, strap)
    const g = new THREE.Group()
    rbox(0.27, 0.32, 0.11, red, 0, 0.06, -0.19, g, 0.03)
    rbox(0.22, 0.14, 0.04, red, 0, -0.03, -0.26, g, 0.02)
    rbox(0.2, 0.012, 0.012, strap, 0, 0.215, -0.19, g, 0.004)
    for (const sx of [-1, 1]) {
      tube(
        [
          [sx * 0.07, 0.2, -0.15],
          [sx * 0.09, 0.27, -0.06],
          [sx * 0.1, 0.25, 0.05],
          [sx * 0.1, 0.12, 0.11],
          [sx * 0.09, -0.04, 0.1],
          [sx * 0.08, -0.1, -0.13],
        ],
        0.008,
        strap,
        g,
        20,
      )
    }
    g.traverse((c) => (c.castShadow = true))
    return g
  }

  /** The schoolbag again, alone (on the chair back). */
  looseBag() {
    const b = this.bag.clone(true)
    b.children.slice(3).forEach((c) => (c.visible = false))
    return b
  }

  /**
   * The mother's unfinished scarf, wrapped once round his neck: a soft knitted
   * roll resting on his shoulders and collarbones, the long end hanging down
   * his chest with the two needles still through its last row, the short end
   * tucked under the roll. Built in the chest bone's frame (adult build).
   */
  private scarfProp() {
    const knit = pbr('knit', SCARF_RED, { scale: 0.5 })
    const needle = pbr('metal', 0xc0c4c8, { roughness: 0.3 })
    this.materials.push(knit, needle)
    const meters = (knit.userData.meters as number | undefined) ?? 0.135
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    const g = new THREE.Group()
    g.name = 'scarf'
    // The wrap: a soft roll, higher at the back of the neck, sunk onto the collarbones in
    // front, its band folding over on itself as it goes round (the twist of a real scarf).
    const R = 1.04
    const loop = new THREE.CatmullRomCurve3(
      [V(0, 0.328, -0.1), V(0.078, 0.322, -0.076), V(0.11, 0.31, -0.004), V(0.09, 0.288, 0.076), V(0.018, 0.272, 0.112), V(-0.072, 0.281, 0.09), V(-0.11, 0.307, 0.004), V(-0.08, 0.322, -0.074)].map((v) =>
        v.set(v.x * R, v.y, (v.z + 0.005) * R - 0.005),
      ),
      true,
      'centripetal',
    )
    const radial = new THREE.Vector3()
    const roll = new THREE.Mesh(
      knittedBand(loop, {
        width: (s) => 0.066 + 0.012 * Math.max(0, Math.cos((s - 0.55) * Math.PI * 2)),
        thick: (s) => 0.039 + 0.007 * Math.sin(s * Math.PI * 6 + 1.1),
        side: (s, out, at) => {
          radial.set(at.x, 0, at.z + 0.005).normalize()
          const t = 0.22 + 0.42 * Math.sin(s * Math.PI * 6 + 0.7)
          return out.set(0, Math.cos(t), 0).addScaledVector(radial, Math.sin(t))
        },
        meters,
        lenSeg: 140,
        ringSeg: 18,
        round: 2.6,
        ridgeDepth: 0.0022,
      }),
      knit,
    )
    roll.name = 'scarf-roll'
    // The long end: out from under the roll on his left, down his chest, a little twisted.
    const endA = new THREE.CatmullRomCurve3([V(0.048, 0.285, 0.1), V(0.058, 0.245, 0.13), V(0.066, 0.18, 0.142), V(0.07, 0.1, 0.146), V(0.068, 0.025, 0.142)], false, 'centripetal')
    const twist = (k: number) => (s: number, out: THREE.Vector3) => out.set(Math.cos(k * Math.sin(s * 5)), 0, -Math.sin(k * Math.sin(s * 5)))
    const long = new THREE.Mesh(knittedBand(endA, { width: (s) => 0.118 + 0.008 * s, thick: 0.016, side: twist(0.22), meters, lenSeg: 56, ringSeg: 12, round: 3.5 }), knit)
    long.name = 'scarf-end'
    // The short end, tucked: a hand's length showing over the long one.
    const endB = new THREE.CatmullRomCurve3([V(-0.032, 0.282, 0.112), V(-0.024, 0.245, 0.152), V(-0.01, 0.19, 0.165), V(0.002, 0.148, 0.166)], false, 'centripetal')
    const short = new THREE.Mesh(knittedBand(endB, { width: 0.11, thick: 0.016, side: twist(-0.3), meters, lenSeg: 30, ringSeg: 12, round: 3.5 }), knit)
    short.name = 'scarf-end'
    g.add(roll, long, short)
    // The needles through the last row of the long end, tips out on both sides.
    const nd = needles(needle)
    nd.position.set(0.068, 0.034, 0.146)
    nd.rotation.set(-0.05, 0, 0.04)
    g.add(nd)
    g.traverse((c) => {
      c.castShadow = true
      c.receiveShadow = true
    })
    g.visible = false
    return g
  }

  dispose() {
    for (const mm of this.materials) mm.dispose()
    for (const mm of Object.values(this.coats)) mm.dispose()
    for (const mm of Object.values(this.m)) mm.dispose()
  }
}

/** Seat height correction for a figure of height factor s (children sit higher on the same chair). */
export const seatY = (s: number) => 0.485 * (1 - s)
