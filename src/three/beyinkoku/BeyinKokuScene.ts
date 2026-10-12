/**
 * BEYİN-KÖKÜ — the director.
 *
 * One world, many sets far apart (docs/stories/beyinkoku.md §2): Veyl's lab
 * at x ≈ 0, Levy's suburb at x ≈ 100 (the bus interior at x ≈ 170, z ≈ −60),
 * the archive and cantina at x ≈ 200, the Centre at x ≈ 300 (its stairwell
 * x 280…285), the second floor at x ≈ 400, the stretcher room at x ≈ 500 and
 * the small white room at x ≈ 600. Only the set in use is visible; cuts are
 * camera jumps. One fixed light rig is moved from set to set (rig.ts).
 *
 * Everything is a pure function of story progress and the reader's choices,
 * except time-driven life (blinking service lights, rocking chairs, bubbles).
 * The chapters are directed in acts*.ts.
 */
import * as THREE from 'three'
import { SEG, segmentAt, local, type SegmentId } from '@/stories/beyinkoku/timeline'
import { clamp } from '@/lib/math'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { held, keyed, type ShotKeys } from '../kit/direct'
import { JOINTS, type Pose } from '../figure/Figure'
import { disposeTree, mesh } from '../util'
import { canvasPlane, rbox } from '../kit/props'
import { palette, type Pal } from './materials'
import { drawEnvelope } from './screens'
import { device, dress, person, type Device, type Person, type Spec } from './cast'
import { Lab } from './lab'
import { Suburb } from './suburb'
import { Archive } from './archive'
import { Centre } from './centre'
import { Floor2 } from './floor2'
import { StretcherRoom } from './stretcher'
import { TvStudio } from './tv'
import { Overlay, Rig } from './rig'
import { actLab } from './actsLab'
import { actSuburb } from './actsSuburb'
import { actCentre } from './actsCentre'
import { actFloor } from './actsFloor'
import { actRoom } from './actsRoom'

export type Place = 'lab' | 'suburb' | 'bus' | 'office' | 'cantina' | 'centre' | 'stairs' | 'f2' | 'g' | 'h' | 'void'
export type Act = (d: Director, f: SetFrame, seg: SegmentId, u: number, shot: Shot) => boolean

const HEADER = 2
const J = (name: (typeof JOINTS)[number], axis: 0 | 1 | 2) => HEADER + JOINTS.indexOf(name) * 3 + axis

/** Costumes (top, bottom, cuff). */
export const LEVY_WEAR = {
  pajama: { top: 0xd5dde6, bottom: 0xb9c2cc, cuff: 0xd5dde6 },
  shirt: { top: 0xb9d3ef, bottom: 0x5d6168, cuff: 0xb9d3ef },
  cardigan: { top: 0x2a3550, bottom: 0x5d6168, cuff: 0xb9d3ef },
  jacket: { top: 0x6c7178, bottom: 0x4f535a, cuff: 0xb9d3ef },
}

export class Director implements SetDirector {
  readonly pal: Pal = palette()
  readonly world = new THREE.Group()
  readonly rig = new Rig()
  readonly fx = new Overlay()
  lab!: Lab
  sub!: Suburb
  arc!: Archive
  cen!: Centre
  f2!: Floor2
  gr!: StretcherRoom
  tv!: TvStudio
  scene!: THREE.Scene
  renderer!: THREE.WebGLRenderer
  envs: Record<'lab' | 'day' | 'clinic' | 'warm' | 'night', THREE.Texture | null> = { lab: null, day: null, clinic: null, warm: null, night: null }
  fallbackEnv!: THREE.Texture
  // Cast
  levy!: Person
  real!: Person
  veyl!: Person
  tvVeyl!: Person
  elen!: Person
  kadin!: Person
  gorevli!: Person
  nurse!: Person
  staff!: Person
  g3!: Person
  tech!: Person
  kid1!: Person
  kid2!: Person
  pool: Person[] = []
  devices = new Map<Person, Device>()
  everyone: Person[] = []
  // Props on people
  band = new THREE.Group()
  stains = new THREE.Group()
  techGear = new THREE.Group()
  rod = new THREE.Group()
  apron = new THREE.Group()
  lanyard = new THREE.Group()
  buns = new Map<Person, THREE.Mesh>()
  hands = new Map<Person, THREE.Mesh[]>()
  waterArc!: THREE.Mesh
  cuffGhost!: THREE.Mesh
  heroHolders: THREE.Group[] = []
  /** The envelope in Levy's hand (the Centre's reception). */
  envelopeHand!: ReturnType<typeof canvasPlane>
  /** Where the pen lies on the desk when nobody holds it. */
  penRest = { pos: new THREE.Vector3(), rot: new THREE.Euler() }
  /** Levy's own scar material (it darkens on Tuesday). */
  levyScar!: THREE.MeshStandardMaterial
  // Frame state
  f!: SetFrame
  seg: SegmentId = 'open'
  u = 0
  private used = new Set<Person>()
  private mo = { step: 0, walking: 0, robots: 0, doors: 0, frame: 0 }
  private v = new THREE.Vector3()
  private q = new THREE.Quaternion()
  private placeNow: Place = 'void'

  async build(scene: THREE.Scene, ctx: BuildContext) {
    this.scene = scene
    this.renderer = ctx.renderer
    this.fallbackEnv = ctx.environment
    scene.add(this.world)
    this.world.add(this.rig.group)
    scene.add(this.fx.mesh)
    scene.fog = new THREE.FogExp2(0x000000, 0)
    const [lab, day, clinic, warm, night] = await Promise.all([ctx.hdri('abandoned_tiled_room'), ctx.hdri('kloofendal_48d_partly_cloudy_puresky'), ctx.hdri('hospital_room_2'), ctx.hdri('brown_photostudio_02'), ctx.hdri('moonless_golf')])
    this.envs = { lab, day, clinic, warm, night }
    const M = await ctx.models({
      microscope: ['industrial_microscope', {}],
      cam: ['security_camera_02', {}],
      cam2: ['security_camera_02', {}],
      cam3: ['security_camera_02', {}],
      lamp: ['street_lamp_02', { height: 3.6 }],
      lamp2: ['street_lamp_02', { height: 3.4 }],
      hydrant: ['fire_hydrant', {}],
      can: ['watering_can_metal_01', {}],
      sofa: ['sofa_02', {}],
      planter: ['planter_box_01', {}],
      planter2: ['planter_box_01', {}],
      seating: ['modular_street_seating', {}],
      tv: ['television_02', {}],
    })
    // The hydrant model holds two hydrants side by side: keep the clean one, centred.
    if (M.hydrant) {
      M.hydrant.traverse((o) => {
        if (/aged/.test(o.name)) o.visible = false
      })
      const inner = M.hydrant.children[0]
      inner.position.x += 0.3 * inner.scale.x
    }
    const p = this.pal
    this.lab = new Lab(p)
    this.lab.build(this.world as unknown as THREE.Scene, { microscope: M.microscope, camera: M.cam })
    this.sub = new Suburb(p)
    this.sub.build(this.world as unknown as THREE.Scene, { lamp: M.lamp, hydrant: M.hydrant, can: M.can, sofa: M.sofa, planter: M.planter })
    this.arc = new Archive(p)
    this.arc.build(this.world as unknown as THREE.Scene, M.lamp2, M.tv)
    this.cen = new Centre(p)
    this.cen.build(this.world as unknown as THREE.Scene, { seating: M.seating, planter: M.planter2, camera: M.cam2 })
    this.f2 = new Floor2(p)
    this.f2.build(this.world as unknown as THREE.Scene, M.cam3)
    this.gr = new StretcherRoom(p)
    this.gr.build(this.world as unknown as THREE.Scene)
    this.buildCast()
    this.tv = new TvStudio(p, this.tvVeyl, warm ?? ctx.environment, THREE.HalfFloatType)
    // The water from Elen's can: a thin arc.
    const arc = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.05, 0.22), new THREE.Vector3(0, -0.42, 0.42))
    this.waterArc = mesh(new THREE.TubeGeometry(arc, 16, 0.006, 6, false), new THREE.MeshPhysicalMaterial({ color: 0xdff2ff, roughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false }), 0, 0, 0, this.world)
    // The translucent steel cuff that flashes round his wrist.
    this.cuffGhost = mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.7, 1.9), transparent: true, opacity: 0.55, depthWrite: false }), 0, 0, 0, this.world)
    this.cuffGhost.visible = false
    // Levy's scar is his own (Tuesday darkens it); the real body's head is shaved.
    if (this.levy.scar) {
      this.levyScar = (p.scar as THREE.MeshStandardMaterial).clone()
      this.levy.scar.material = this.levyScar
    }
    this.real.figure.headMeshes[1].visible = false
    // The television shows the studio's picture.
    const tvMat = this.sub.tvScreen.material as THREE.MeshBasicMaterial
    tvMat.map = this.tv.rt.texture
    tvMat.color.setScalar(1)
    // The ghost of the procedure chair, over the stretcher.
    this.lab.ghostChair.position.set(500, 0, 2.95)
    this.lab.ghostChair.rotation.y = Math.PI
    this.world.add(this.lab.ghostChair)
    // The envelope Levy carries into the Centre.
    this.envelopeHand = canvasPlane(0.22, 0.11, 256, (c, W, H) => drawEnvelope(c, W, H))
    this.world.add(this.envelopeHand.mesh)
    this.penRest.pos.copy(this.lab.pen.position)
    this.penRest.rot.copy(this.lab.pen.rotation)
    this.sub.mirror.visible = false
    this.gr.mirror.visible = false
    // Compile the studio once, off-screen.
    this.tv.render(ctx.renderer, 0, 0)
    for (const g of this.groups()) g.visible = true
  }

  /** Every prop back to its resting state; the acts switch on what their moment needs. */
  private resetProps() {
    const { lab, sub, arc, cen, f2, gr, pal } = this
    sub.bus.visible = false
    sub.mirror.visible = false
    sub.bedSoilWet.visible = false
    sub.bedSoil.visible = true
    sub.envelope.mesh.visible = false
    sub.envelopeOnTable.mesh.visible = false
    sub.letter.mesh.visible = false
    sub.phone.visible = false
    sub.remote.visible = false
    sub.cup.visible = false
    sub.canHeld.visible = false
    sub.canOnSteps.visible = false
    sub.bird.visible = false
    sub.drop.visible = false
    sub.dogParts.group.visible = false
    for (const b of sub.bikes) b.visible = false
    sub.tvOverlay.mesh.visible = false
    sub.shirtOnChair.visible = false
    ;(sub.tvScreen.material as THREE.MeshBasicMaterial).color.setScalar(0)
    sub.frontDoor.rotation.y = 0
    sub.curtains(1)
    ;(pal.sky as THREE.MeshBasicMaterial).color.setScalar(1)
    arc.spoonLevy.visible = false
    arc.spoonKadin.visible = false
    cen.stairDoor.rotation.y = 0
    cen.doorL.position.x = 299.4
    cen.doorR.position.x = 300.6
    cen.cup.visible = false
    cen.stream.visible = false
    cen.spill.visible = false
    cen.smallDoor.rotation.y = 0
    cen.formOnKnee.mesh.visible = false
    cen.formHanded.mesh.visible = false
    cen.ripple.visible = false
    f2.roomDoor.rotation.y = 0
    f2.light(() => true)
    gr.mirror.visible = false
    for (const m of Object.values(gr.screenMats)) m.color.setScalar(1)
    lab.ghostChair.visible = false
    lab.cartridge.visible = false
    lab.lamp31.material = pal.lampFace
    lab.lamp32.material = pal.lampFace
    lab.layCables([], false)
    lab.openHalo(0)
    lab.setStrip(0)
    lab.signal.mesh.visible = false
    lab.pen.position.copy(this.penRest.pos)
    lab.pen.rotation.copy(this.penRest.rot)
    this.envelopeHand.mesh.visible = false
    this.levyScar?.color.setHex(0xead2c4)
  }

  // ——— The cast ———

  private buildCast() {
    const p = this.pal
    const mk = (s: Spec, opts: Parameters<typeof person>[2] = {}) => {
      const x = person(s, p, opts)
      this.world.add(x.figure.root)
      this.everyone.push(x)
      this.hands.set(
        x,
        [x.figure.joints.lHand, x.figure.joints.rHand].flatMap((h) => h.children.filter((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh[]),
      )
      return x
    }
    this.levy = mk({ name: 'Levy', build: 'm', hair: 'short', skin: 0xd9b39a, hairColor: 0x3b2a1e, eye: 0x4a3626, top: 0x2a3550, cuff: 0xb9d3ef, bottom: 0x5d6168, topSurface: 'knit', belt: true, face: { jaw: 0.28, nose: 0.2, lips: 0.045, stubble: 0.05 } }, { scar: 'old' })
    this.real = mk({ name: 'Real', build: 'm', hair: 'short', skin: 0xbfa290, hairColor: 0x8a7468, top: 0x7d838a, bottom: 0x7d838a, shoes: 0xbfa290, height: 0.95, face: { jaw: 0.4, nose: 0.22, lips: 0.035, stubble: 0.35 } })
    this.veyl = mk({ name: 'Veyl', build: 'm', hair: 'short', skin: 0xd2ae98, hairColor: 0x9c9c9a, eye: 0x3a4a52, top: 0xe8e6e0, cuff: 0x3a3d42, bottom: 0x3a3d42, face: { jaw: 0.42, nose: 0.24, lips: 0.035, stubble: 0.18 } }, { scar: 'old', monster: true })
    this.tvVeyl = person({ name: 'VeylTV', build: 'm', hair: 'short', skin: 0xdcb8a2, hairColor: 0xa8a8a4, eye: 0x3a4a52, top: 0xf3f2ee, cuff: 0x2a3550, bottom: 0x3a3d42, face: { jaw: 0.42, nose: 0.24, lips: 0.035, stubble: 0.04 } }, p, { scar: 'old' })
    this.elen = mk({ name: 'Elen', build: 'f', hair: 'short', skin: 0xe3c2ac, hairColor: 0xeeeeea, top: 0xb9a3d6, bottom: 0x6d7b8c, collar: 'crew', topSurface: 'knit', height: 0.95, eye: 0x4a5a6a }, { scar: 'old' })
    this.kadin = mk({ name: 'Kadin', build: 'f', hair: 'long', skin: 0xe0b9a0, hairColor: 0x8a3f22, top: 0xd4a03a, bottom: 0x3a3f4a, topSurface: 'knit', collar: 'mock' }, { scar: 'old' })
    this.gorevli = mk({ name: 'Gorevli', build: 'f', hair: 'short', skin: 0xe6c5ae, hairColor: 0x2e2018, top: 0xf4f4f1, bottom: 0x2a2e36 }, { scar: 'old' })
    this.nurse = mk({ name: 'Nurse', build: 'f', hair: 'short', skin: 0xdcb49c, hairColor: 0x4a3426, top: 0xf2f2f0, bottom: 0xe9e9e6, shoes: 0xe9e9e6 }, { scar: 'old', monster: true })
    this.staff = mk({ name: 'Staff', build: 'm', hair: 'short', skin: 0xcfa58c, hairColor: 0x2a2420, top: 0xf2f2f0, bottom: 0xe9e9e6, shoes: 0xe9e9e6, height: 1.05, face: { jaw: 0.4, nose: 0.22, lips: 0.04, stubble: 0.55 } }, { scar: 'old', monster: true })
    this.g3 = mk({ name: 'G3', build: 'f', hair: 'short', skin: 0xdcb8a0, hairColor: 0x8a7a6a, top: 0xe9dcc2, bottom: 0xf2f2f0, glasses: true }, { scar: 'old' })
    this.tech = mk({ name: 'Tech', build: 'm', hair: 'short', skin: 0xc99f86, hairColor: 0x2a2420, top: 0x9ec7b0, bottom: 0x9ec7b0, shoes: 0xd8dde2 })
    this.kid1 = mk({ name: 'Kid1', build: 'f', hair: 'long', skin: 0xe9c6ae, hairColor: 0xc58a4a, top: 0xe94f5b, bottom: 0x3f5f8a, height: 0.72 }, { scar: 'old' })
    this.kid2 = mk({ name: 'Kid2', build: 'm', hair: 'short', skin: 0xe1bea6, hairColor: 0x6a4a2a, top: 0xf2c14e, bottom: 0x3f5f8a, height: 0.72 }, { scar: 'new' })
    const hairsM = [0x2a2420, 0x4a3426, 0x7a6a5a, 0x1a1410, 0x8a6a40, 0x3a3028]
    const hairsF = [0x6b4630, 0x1a1410, 0xc58a4a, 0x4a3426, 0x2a2420, 0x8a7a6a]
    const skins = [0xd9b39a, 0xc99f86, 0xe3c2ac, 0xb58e74, 0xdcb8a0, 0xe6c5ae]
    for (let i = 0; i < 12; i++) {
      const f = i >= 6
      const k = i % 6
      this.pool.push(
        mk(
          {
            name: `Pool${i}`,
            build: f ? 'f' : 'm',
            hair: f && k % 2 === 0 ? 'long' : 'short',
            skin: skins[(k + (f ? 3 : 0)) % 6],
            hairColor: f ? hairsF[k] : hairsM[k],
            top: 0x777777,
            bottom: 0x444444,
            height: f ? 0.96 + (k % 3) * 0.02 : 0.98 + (k % 3) * 0.025,
            face: f ? undefined : { jaw: 0.25 + k * 0.04, nose: 0.18 + (k % 3) * 0.03, lips: 0.04, stubble: 0.1 + (k % 4) * 0.1 },
          },
          { scar: 'old', monster: true },
        ),
      )
    }
    // Hair buns.
    for (const x of [this.elen, this.gorevli, this.nurse, this.g3, ...this.pool.filter((q, i) => i >= 6 && i % 2 === 1)]) {
      const b = mesh(new THREE.SphereGeometry(0.045, 14, 10), x.wear.hair, 0, 0.13, -0.1, x.figure.joints.head)
      b.scale.set(1.1, 0.9, 0.9)
      b.castShadow = true
      this.buns.set(x, b)
    }
    // Elen's own scar material (it glints).
    if (this.elen.scar) this.elen.scar.material = (this.pal.scar as THREE.MeshStandardMaterial).clone()
    // Devices for the staff and the pool (the swarm).
    for (const x of [this.nurse, this.staff, ...this.pool]) {
      const d = device(p, x.figure.rGrip)
      d.set('none')
      this.devices.set(x, d)
    }
    // Veyl's neuro-interface: a thin black band over the crown, six pads.
    const J2 = this.veyl.figure.joints
    J2.head.add(this.band)
    const arc = mesh(new THREE.TorusGeometry(0.112, 0.006, 6, 40, Math.PI), p.band, 0, 0.13, -0.005, this.band)
    arc.rotation.y = Math.PI / 2
    arc.scale.set(1, 1.15, 0.92)
    for (let i = 0; i < 6; i++) {
      const a = 0.35 + (i / 5) * (Math.PI - 0.7)
      const pad = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 12), p.pads, Math.cos(a) * 0.104, 0.13 + Math.sin(a) * 0.12, -0.005, this.band)
      pad.rotation.z = a - Math.PI / 2
    }
    // Stains on his coat (chest and cuffs).
    J2.chest.add(this.stains)
    const stainMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.9, transparent: true, opacity: 0.55, polygonOffset: true, polygonOffsetFactor: -2 })
    for (const [x, y, z, s] of [
      [0.07, 0.14, 0.118, 0.03],
      [0.05, 0.1, 0.122, 0.018],
      [-0.06, 0.06, 0.12, 0.022],
    ]) {
      const st = mesh(new THREE.CircleGeometry(s, 10), stainMat, x, y, z, this.stains)
      st.scale.set(1, 1.4, 1)
    }
    // The technician's cap and mask; his rod.
    const T = this.tech.figure.joints
    T.head.add(this.techGear)
    const cap = mesh(new THREE.SphereGeometry(0.118, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), p.scrubs, 0, 0.13, -0.004, this.techGear)
    cap.scale.set(0.92, 0.95, 1.02)
    const mask = mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.09, 20, 1, true, -1.1, 2.2), new THREE.MeshStandardMaterial({ color: 0xbfd8e8, roughness: 0.9, side: THREE.DoubleSide }), 0, 0.05, 0.006, this.techGear)
    mask.scale.set(0.82, 1, 0.98)
    this.tech.figure.rGrip.add(this.rod)
    mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.4, 8), p.chrome, 0, -0.15, 0, this.rod)
    // Elen's floral apron; the görevli's lanyard.
    const ap = document.createElement('canvas')
    ap.width = 128
    ap.height = 256
    const ag = ap.getContext('2d')!
    ag.fillStyle = '#f6efe2'
    ag.fillRect(0, 0, 128, 256)
    for (let i = 0; i < 60; i++) {
      ag.fillStyle = ['#e58fa3', '#9cc985', '#f2c94c', '#9fb4e8'][i % 4]
      ag.beginPath()
      ag.arc((i * 37) % 128, (i * 53) % 256, 5, 0, Math.PI * 2)
      ag.fill()
    }
    const apTex = new THREE.CanvasTexture(ap)
    apTex.colorSpace = THREE.SRGBColorSpace
    const apMat = new THREE.MeshStandardMaterial({ map: apTex, roughness: 0.9, side: THREE.DoubleSide })
    const E = this.elen.figure.joints
    const bib = mesh(new THREE.PlaneGeometry(0.2, 0.2), apMat, 0, 0.14, 0.118, E.chest)
    bib.castShadow = true
    const skirt = mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.42, 16, 1, true, -0.9, 1.8), apMat, 0, -0.12, 0.0, E.hips)
    skirt.scale.z = 0.85
    this.apron.add(bib, skirt)
    const G2 = this.gorevli.figure.joints
    G2.chest.add(this.lanyard)
    const strap = mesh(new THREE.TorusGeometry(0.11, 0.006, 4, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x9fc4e8, roughness: 0.6 }), 0, 0.2, 0.06, this.lanyard)
    strap.rotation.set(Math.PI / 2 + 0.3, 0, Math.PI)
    rbox(0.055, 0.08, 0.004, p.label, 0, 0.1, 0.125, this.lanyard, 0.004)
    // Hero mounts for bodies in atrium stations.
    for (let i = 0; i < 6; i++) {
      const h = new THREE.Group()
      this.world.add(h)
      this.heroHolders.push(h)
    }
  }

  groups() {
    return [this.lab.group, this.sub.group, this.sub.busInside, this.arc.office, this.arc.cantina, this.cen.garden, this.cen.hall, this.cen.stairs, this.cen.small, this.f2.group, this.gr.group]
  }

  // ——— Per frame ———

  frame(f: SetFrame, shot: Shot) {
    this.f = f
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    this.seg = seg
    this.u = u
    this.used.clear()
    this.rig.reset()
    this.fx.reset(f.time)
    this.mo.walking = 0
    this.world.position.set(0, 0, 0)
    this.world.quaternion.identity()
    this.waterArc.visible = false
    this.cuffGhost.visible = false
    for (const x of this.everyone) {
      x.kit?.set(0)
      x.figure.joints.head.scale.set(1, 1, 1)
      if (x.scar) x.scar.visible = true
      this.mount(x, this.world)
    }
    for (const d of this.devices.values()) d.set('none')
    for (const hs of this.hands.values()) for (const h of hs) h.visible = true
    this.band.visible = false
    this.stains.visible = false
    this.apron.visible = true
    for (const h of this.heroHolders) h.visible = true
    this.resetProps()
    this.lab.tick(f.time)
    this.sub.rock(f.time)
    this.gr.tick(f.time)
    shot.handheld = 0.3

    let done = false
    for (const act of [actLab, actSuburb, actCentre, actFloor, actRoom] as Act[]) {
      if (act(this, f, seg, u, shot)) {
        done = true
        break
      }
    }
    if (!done) {
      this.place('void')
      this.cam([[0, [0, 2, 4, 0, 2, 0, 40]]], u, shot)
    }
    // Everyone not directed this frame leaves the stage.
    for (const x of this.everyone) if (!this.used.has(x)) x.figure.root.visible = false
    this.rig.settle()
    this.fx.settle()
  }

  motion(m: SceneInfo['motion']) {
    Object.assign(m, this.mo)
  }

  /** What the sound follows: footsteps of the person walking in frame, and a cue number for the acts. */
  steps(walking: number, step: number) {
    this.mo.walking = Math.max(this.mo.walking, walking)
    if (walking > 0.1) this.mo.step = step
  }

  // ——— Helpers for the acts ———

  /** Which set is on: visibility, image-based light, background, fog, base light. */
  place(p: Place) {
    this.placeNow = p
    const vis: Record<string, boolean> = {
      lab: p === 'lab' || p === 'void',
      sub: p === 'suburb',
      bus: p === 'bus',
      office: p === 'office',
      cantina: p === 'cantina',
      garden: p === 'centre',
      hall: p === 'centre' || p === 'stairs',
      stairs: p === 'stairs' || p === 'centre',
      small: p === 'h',
      f2: p === 'f2',
      g: p === 'g',
    }
    this.lab.group.visible = vis.lab
    this.sub.group.visible = vis.sub
    this.sub.busInside.visible = vis.bus
    this.arc.office.visible = vis.office
    this.arc.cantina.visible = vis.cantina
    this.cen.garden.visible = vis.garden
    this.cen.hall.visible = vis.hall
    this.cen.stairs.visible = vis.stairs
    this.cen.small.visible = vis.small
    this.f2.group.visible = vis.f2
    this.gr.group.visible = vis.g
    const s = this.scene
    const fog = s.fog as THREE.FogExp2
    const env = (e: THREE.Texture | null, i: number) => {
      s.environment = e ?? this.fallbackEnv
      s.environmentIntensity = i
    }
    const bg = (c: number) => (s.background as THREE.Color).setHex(c)
    fog.density = 0
    switch (p) {
      case 'lab':
      case 'void':
        env(this.envs.lab, 0.08)
        bg(0x020306)
        fog.color.setHex(0x05080e)
        fog.density = 0.018
        break
      case 'suburb':
        env(this.envs.day, 0.55)
        bg(0xcfeaff)
        fog.color.setHex(0xe4f2fb)
        fog.density = 0.004
        break
      case 'bus':
        env(this.envs.day, 0.5)
        bg(0xcfeaff)
        break
      case 'office':
        env(this.envs.clinic, 0.35)
        bg(0x1a1d22)
        break
      case 'cantina':
        env(this.envs.day, 0.45)
        bg(0xc8e4f8)
        break
      case 'centre':
      case 'stairs':
        env(this.envs.clinic, 0.6)
        bg(0xdfeef9)
        fog.color.setHex(0xeef4f8)
        fog.density = 0.003
        break
      case 'f2':
        env(this.envs.clinic, 0.4)
        bg(0x0a0b0c)
        fog.color.setHex(0xdfe3e4)
        fog.density = 0.006
        break
      case 'g':
        env(this.envs.night, 0.12)
        bg(0x050608)
        fog.color.setHex(0x06080b)
        fog.density = 0.02
        break
      case 'h':
        env(this.envs.clinic, 0.7)
        bg(0xf4f4f2)
        break
    }
  }

  get where() {
    return this.placeNow
  }

  /** A person on stage this frame: begin their actor and mount them (world, or a holder). */
  use(x: Person, parent: THREE.Object3D = this.world) {
    this.used.add(x)
    this.mount(x, parent)
    const a = x.actor.begin()
    return a
  }

  mount(x: Person, parent: THREE.Object3D) {
    if (x.figure.root.parent !== parent) parent.add(x.figure.root)
  }

  /** After placing: write the pose to the figure (breathing on unless still). */
  apply(x: Person, breathe = true) {
    x.actor.apply(this.f.time, breathe && !this.f.reduced)
  }

  /** Eyes: 0 open … 1 closed (after apply). */
  eyes(x: Person, closed: number) {
    for (const m of x.figure.headMeshes) if (m.userData.open !== undefined) m.rotation.x = m.userData.open + closed * 0.78
  }

  /** Turns the upper body (before apply). */
  twist(x: Person, yaw: number) {
    const p = x.actor.pose as Pose
    p[J('spine', 1)] += yaw * 0.35
    p[J('chest', 1)] += yaw * 0.45
  }

  /** Adds to one joint of the pose (before apply). */
  bend(x: Person, joint: (typeof JOINTS)[number], axis: 0 | 1 | 2, v: number) {
    ;(x.actor.pose as Pose)[J(joint, axis)] += v
  }

  grip(x: Person, side: 'l' | 'r', out = this.v) {
    return (side === 'l' ? x.figure.lGrip : x.figure.rGrip).getWorldPosition(out)
  }

  /** Puts an object at a hand, following the hand's orientation (after apply). */
  hold(obj: THREE.Object3D, x: Person, side: 'l' | 'r', offset?: THREE.Euler) {
    const g = side === 'l' ? x.figure.lGrip : x.figure.rGrip
    g.getWorldPosition(obj.position)
    g.getWorldQuaternion(obj.quaternion)
    if (offset) obj.quaternion.multiply(this.q.setFromEuler(offset))
    if (obj.parent && obj.parent !== this.scene) {
      obj.parent.updateWorldMatrix(true, false)
      obj.position.applyMatrix4(new THREE.Matrix4().copy(obj.parent.matrixWorld).invert())
    }
  }

  /** Dress a person (colours). */
  dress = dress

  /** Keyed camera inside the segment (holds at mid-segment with reduced motion). */
  cam(keys: ShotKeys, u: number, shot: Shot) {
    keyed(keys, held(u, this.f.reduced), shot)
  }

  /** Two frames of white at a cut (the "Üç saniye" grammar), as a short span of the segment. */
  flashCut(u: number, at = 0, len = 0.02) {
    if (u >= at && u < at + len) this.fx.white(1)
  }

  /** The over-exposed look of the real lab: a cold wash fading from white. */
  flashLook(u: number) {
    if (u < 0.02) this.fx.white(1)
    else this.fx.wash(5.5, 6, 6.6, 0.55 * Math.exp(-(u - 0.02) * 9) + 0.1)
  }

  /** Levy's costume of the day. */
  wear(kind: keyof typeof LEVY_WEAR) {
    dress(this.levy.wear, LEVY_WEAR[kind])
  }

  /** Dresses a pool figure. */
  pooled(i: number, top: number, bottom: number) {
    const x = this.pool[i]
    dress(x.wear, { top, bottom, cuff: top })
    return x
  }

  /** Seconds of story time since the start of this segment, scaled by its length (for slow life). */
  segTime() {
    return this.u * SEG[this.seg].screens * 4
  }

  clamp = clamp

  dispose() {
    this.lab.dispose()
    this.sub.dispose()
    this.f2.dispose()
    this.tv.dispose()
    this.rig.dispose()
    disposeTree(this.tv.scene)
    this.scene.environment = null
  }
}

export const createBeyinKokuScene = (options: SceneOptions): StoryScene => createSetScene(new Director(), options)
