/**
 * EMANET's frame:
 *
 *   plan(p) → choreography(sp) → atmosphere(p, sp) → [ghost → rtGhost]
 *          → main → rtMain → memory mask → memory pass → present
 *
 * One apartment, two people, and a memory system deciding how clearly each
 * thing in it is remembered.
 */
import * as THREE from 'three'
import { applyMetricUVs } from '../kit/surfaces'
import { finiteOr, smoothstep } from '@/lib/math'
import { createInfo, type FrameInput, type SceneOptions, type Stage, type StoryScene } from '../Stage'
import { disposeMaterials, disposeTree } from '../util'
import { fitFov } from '../lens'
import { applyLook, type Look } from '../look'
import type { Figure } from '../figure/Figure'
import { reach } from '../figure/reach'
import { Apartment } from './Apartment'
import { atmosphere, createAtmos, GROUPS } from './atmosphere'
import { cameraFor, makeCam, planFor, type Plan } from './camera'
import { ClockFace, phoneTexture, photoTexture, recordTexture } from './canvas'
import { createDerin, createEge } from './cast'
import { choreograph, createChoreo, GRIP, type Body, type Held } from './choreography'
import { createEmanetMaterials, type EmanetMaterials } from './materials'
import { Memory } from './memory'
import { MemoryPass } from './MemoryPass'

const v = new THREE.Vector3()
const q = new THREE.Quaternion()
const earPoint = new THREE.Vector3()
/**
 * A phone held to the right ear, in the body's frame: screen to the cheek (+x),
 * long side running from the ear down toward the mouth.
 */
const qAtEar = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(new THREE.Vector3(0, -0.6, -0.8), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -0.8, 0.6)),
)

class EmanetScene implements StoryScene {
  readonly info = createInfo()
  private stage!: Stage
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.03, 400)
  private materials!: EmanetMaterials
  private memory = new Memory()
  private apartment!: Apartment
  private derin!: Figure
  private ege!: Figure
  private pass!: MemoryPass
  private clock = new ClockFace()
  private textures: THREE.Texture[] = []
  private choreo = createChoreo()
  private atmos = createAtmos()
  private plan: Plan = { sp: 0, seg: 'open', u: 0, fade: 0, ghost: 0, ghostSp: 0 }
  private cam = makeCam()
  private prev = { doors: 0 }
  private lampShades: THREE.MeshStandardMaterial[] = []
  private capsules: THREE.MeshStandardMaterial[] = []

  constructor(private options: SceneOptions) {}

  async init(stage: Stage) {
    this.stage = stage
    const m = (this.materials = createEmanetMaterials())
    this.scene.environment = stage.environment
    this.scene.environmentIntensity = 0.35
    this.scene.background = new THREE.Color(0x000000)

    this.apartment = new Apartment(m, this.memory, stage.quality.shadows)
    this.scene.add(this.apartment.group, this.apartment.lights)

    this.derin = createDerin(m)
    this.ege = createEge(m)
    this.memory.adopt('derinFace', this.derin.headMeshes)
    this.memory.adopt('derin', this.derin.root)
    this.memory.adopt('egeFace', this.ege.headMeshes)
    this.memory.adopt('ege', this.ege.root)
    this.scene.add(this.derin.root, this.ege.root)

    const photo = photoTexture()
    const record = recordTexture()
    const phone = phoneTexture()
    this.textures.push(photo, record, phone, this.clock.texture)
    this.apartment.phoneScreen.map = phone
    this.apartment.phoneScreen.needsUpdate = true
    this.apartment.photoMaterial.map = photo
    this.apartment.docMaterial.map = record
    this.apartment.clockMaterial.map = this.clock.texture
    this.clock.show('')
    for (const g of GROUPS) this.memory.group(g)
    this.lampShades = this.memory.surfaces(m.lampShade)
    this.capsules = this.memory.surfaces(m.capsule)
    this.pass = new MemoryPass(stage)

    // Compile everything once, off-screen, so nothing stalls when the house first appears.
    this.memory.groups.forEach((g) => g.set(0, 0))
    this.camera.position.set(0, 1.6, 2.8)
    this.camera.lookAt(-1.5, 1.0, -1)
    // Procedural surfaces keep their real-world scale on every object.
    applyMetricUVs(this.scene)
    await stage.renderer.compileAsync(this.scene, this.camera)
    this.memory.useMask(true)
    await stage.renderer.compileAsync(this.scene, this.camera)
    this.memory.useMask(false)
  }

  render({ p, time, dt, look, flags }: FrameInput) {
    const stage = this.stage
    const plan = planFor(finiteOr(p, 0), this.plan, this.options.reduced)
    this.options.labels([])
    if (plan.fade <= 0.001) {
      stage.clear()
      this.info.set = 'black'
      this.info.motion.walking = 0
      return
    }
    const aspect = stage.aspect

    // A remembered moment, laid over the present one (the day rewinding).
    if (plan.ghost > 0.002) {
      this.stageMoment(p, plan.ghostSp, time, flags)
      cameraFor(plan, this.choreo, this.cam, this.options.reduced)
      this.configure(aspect, time, look)
      stage.draw(stage.rtGhost, this.scene, this.camera)
    }

    this.stageMoment(p, plan.sp, time, flags)
    cameraFor(plan, this.choreo, this.cam, this.options.reduced)
    this.configure(aspect, time, look)
    stage.draw(stage.rtMain, this.scene, this.camera)
    this.pass.drawMask(this.scene, this.camera, this.memory, 1, 1)
    const g = this.atmos.grade
    Object.assign(this.pass.grade, g)
    const source = this.pass.resolve()
    stage.present({ fade: plan.fade, time, ghost: plan.ghost, source })

    this.info.set = 'apartment'
    this.info.sp = plan.sp
    this.info.camera.copy(this.camera.position)
    this.camera.getWorldDirection(this.info.forward)
    this.info.look.locked = false
    this.info.look.limits = null
    this.trackMotion(dt)
  }

  /** Puts everything where it is at the shown moment `sp` of story progress `p`. */
  private stageMoment(p: number, sp: number, time: number, flags: ReadonlySet<string>) {
    const c = this.choreo
    const a = this.atmos
    choreograph(sp, c, flags)
    atmosphere(p, sp, a)
    const apt = this.apartment

    // Memory
    for (const name of GROUPS) {
      const m = a.memory[name]
      this.memory.group(name).set(m.dissolve, m.blur)
    }

    // People
    this.pose(this.derin, c.derin, time, 0)
    this.pose(this.ege, c.ege, time, 1.7)

    // Things
    apt.drawer.position.z = 3.0 - 0.24 * c.drawer
    apt.handle.rotation.z = 0.5 * c.handle
    apt.windowHandle.rotation.x = -1.2 * c.windowHandle
    apt.setCurtains(c.curtains)
    this.carry(c.cup, apt.cup, GRIP.cup)
    this.carry(c.capsule, apt.capsule, GRIP.capsule)
    this.carry(c.keys, apt.keys, GRIP.keys)
    this.carry(c.phone, apt.phone, GRIP.phone)
    this.carry(c.derinPhone, apt.derinPhone, GRIP.phone)
    // A phone at an ear stands on its edge, screen to the cheek.
    if (c.phone.upright) apt.phone.quaternion.multiply(qAtEar)
    else if (!c.phone.by) apt.phone.rotation.y = 0.3
    if (c.derinPhone.by) apt.derinPhone.quaternion.multiply(qAtEar)
    apt.phoneScreen.color.setScalar(c.phone.lit)
    apt.photo.position.copy(c.photo.pos)
    apt.photo.quaternion.copy(c.photo.quat)
    apt.photo.visible = c.photo.visible
    apt.steamMaterial.opacity = c.cup.steam * 0.55 * (1 - a.memory.cup.dissolve)
    apt.steam.position.x = Math.sin(time * 0.9) * 0.006
    apt.steam.quaternion.copy(this.camera.quaternion)

    // Light
    apt.sun.intensity = a.sunIntensity
    apt.sun.color.copy(a.sunColor)
    apt.sun.position.copy(a.sunDir).multiplyScalar(18)
    apt.sun.visible = a.sunIntensity > 0.01
    apt.hemi.intensity = a.hemi
    apt.hemi.color.copy(a.hemiSky)
    apt.pendant.intensity = a.pendant
    apt.windowFill.intensity = a.fill
    for (const s of this.lampShades) s.emissiveIntensity = 0.15 + a.pendant * 0.6
    // The sky stays below white so the curtains and the city can be read against it.
    apt.skyMaterial.color.copy(a.sky).multiplyScalar(0.7)
    apt.outsideGlow.color.copy(a.sky).multiplyScalar(0.95)
    apt.cityWindows.emissiveIntensity = a.cityGlow
    apt.deviceLight.color.setRGB(1.6 * a.device, 0.9 * a.device, 0.35 * a.device)
    for (const s of this.capsules) s.emissiveIntensity = a.capsule * (0.7 + 0.3 * Math.sin(time * 2.4))
    this.clock.show(a.clock)
    apt.clockMaterial.color.setScalar(a.clockGlow * 1.6)
    this.scene.environmentIntensity = 0.12 + 0.12 * a.hemi
  }

  private pose(f: Figure, b: Body, time: number, phase: number) {
    f.root.visible = b.visible
    f.root.position.set(b.x, 0, b.z)
    f.root.rotation.y = b.yaw
    f.applyPose(b.pose)
    // Breathing, and the head turning toward someone.
    if (!this.options.reduced) f.joints.chest.rotation.x += Math.sin(time * 1.5 + phase) * 0.012
    f.life(time, !this.options.reduced)
    f.joints.neck.rotation.y += b.look * 0.35
    f.joints.head.rotation.y += b.look * 0.55
    f.root.updateMatrixWorld(true)
    if (b.l.w > 0) reach(f, 'l', v.set(b.l.x, b.l.y, b.l.z), b.l.w, b.l.out)
    if (b.r.w > 0) {
      v.set(b.r.x, b.r.y, b.r.z)
      // On a call the hand goes to the actual ear, wherever the pose put the head.
      if (b.ear > 0) v.lerp(f.joints.head.localToWorld(earPoint.set(-0.1, 0.085, 0.0)), b.ear)
      reach(f, 'r', v, b.r.w, b.r.out)
    }
    f.root.updateMatrixWorld(true)
  }

  /** Places a held object: in a hand (grip), at rest, or on the way between. */
  private carry(h: Held, obj: THREE.Object3D, grip: number) {
    obj.visible = h.visible
    if (!h.by || h.place >= 1) {
      obj.position.copy(h.rest)
      obj.quaternion.identity()
      return
    }
    const fig = h.by === 'derin' ? this.derin : this.ege
    const g = h.side === 'l' ? fig.lGrip : fig.rGrip
    g.getWorldPosition(v)
    v.y -= grip
    obj.position.copy(v).lerp(h.rest, h.place)
    // Held things stay upright, turned with the hand that holds them.
    fig.root.getWorldQuaternion(q)
    obj.quaternion.copy(q)
  }

  private configure(aspect: number, time: number, look: Look) {
    const cam = this.camera
    const c = this.cam
    cam.position.copy(c.pos)
    if (this.options.handheld) {
      cam.position.x += Math.sin(time * 0.53) * 0.005
      cam.position.y += Math.sin(time * 0.71 + 1.1) * 0.004
    }
    cam.lookAt(c.tgt)
    applyLook(cam, look)
    cam.fov = fitFov(c.fov, aspect)
    cam.aspect = aspect
    cam.updateProjectionMatrix()
  }

  private trackMotion(dt: number) {
    const m = this.info.motion
    const c = this.choreo
    m.walking = Math.max(c.derin.walking, c.ege.walking)
    // Footsteps: whichever of them is walking.
    m.step = c.derin.walking > 0 ? c.derin.step : c.ege.step + 1000
    const doors = c.drawer + c.handle + c.windowHandle + c.curtains
    m.doors = dt > 0 ? Math.min(1.5, Math.abs(doors - this.prev.doors) / dt) : 0
    this.prev.doors = doors
    m.robots = 0
    m.frame = smoothstep(0, 1, this.atmos.device)
  }

  dispose() {
    this.options.labels([])
    disposeTree(this.scene)
    this.memory.dispose()
    this.pass?.dispose()
    this.textures.forEach((t) => t.dispose())
    if (this.materials) disposeMaterials(this.materials)
    this.scene.clear()
  }
}

export const createEmanetScene = (options: SceneOptions): StoryScene => new EmanetScene(options)
