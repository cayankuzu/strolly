/**
 * The one renderer. Lives for the whole visit; stories mount and unmount
 * their scenes into it, so switching stories never creates a second WebGL
 * context, render loop or set of render targets.
 *
 * A story scene draws its frame into `rtMain` (and optionally `rtGhost`, a
 * remembered moment) with `draw()`, then calls `present()` for the shared
 * final pass: tone mapping, memory overlay, fade, vignette, grain.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import type { Quality } from '@/lib/env'
import { Composite } from './Composite'
import { resolveFonts } from './screens'
import { setSurfaceResolution } from './kit/surfaces'
import type { Look, LookFrame } from './look'

export type LabelFrame = { id: string; text: string; kind: string; x: number; y: number; opacity: number }
export type LabelSink = (labels: LabelFrame[]) => void

export type SceneInfo = {
  set: string
  sp: number
  /** Where the camera is and where it looks after the reader's look is applied. */
  camera: THREE.Vector3
  forward: THREE.Vector3
  /** The scene holds the frame (letterboxed screens, locked compositions), narrows the look, or asks to guide it. */
  look: LookFrame
  /** Motion that sound follows: footsteps, machines, doors… */
  motion: { step: number; walking: number; robots: number; doors: number; frame: number }
}

export type FrameInput = {
  p: number
  time: number
  dt: number
  iteration: number
  /** The reader's look offset. */
  look: Look
  /** Discoveries seen in this reading (scenes may react to what was, or was not, looked at). */
  seen: ReadonlySet<string>
  /** What the reader chose in this reading (and what the story remembers from earlier ones). */
  flags: ReadonlySet<string>
}

export interface StoryScene {
  readonly info: SceneInfo
  init(stage: Stage): Promise<void>
  render(frame: FrameInput): void
  dispose(): void
}

/** `reduced` and `handheld` are read every frame, so settings apply live. */
export type SceneOptions = { quality: Quality; readonly reduced: boolean; readonly handheld: boolean; labels: LabelSink }
export type SceneFactory = (options: SceneOptions) => StoryScene

export const createInfo = (): SceneInfo => ({
  set: 'none',
  sp: 0,
  camera: new THREE.Vector3(),
  forward: new THREE.Vector3(0, 0, -1),
  look: { locked: false, limits: null },
  motion: { step: 0, walking: 0, robots: 0, doors: 0, frame: 0 },
})

export class Stage {
  readonly renderer: THREE.WebGLRenderer
  readonly rtMain: THREE.WebGLRenderTarget
  readonly rtGhost: THREE.WebGLRenderTarget
  readonly environment: THREE.Texture
  readonly targetType: THREE.TextureDataType
  width = 1
  height = 1
  dpr = 1
  resScale = 1
  /** The player's ceiling on internal resolution (settings). */
  maxScale = 1
  private composite = new Composite()
  private frameTimes: number[] = []
  private pmrem: THREE.PMREMGenerator
  private envTarget: THREE.WebGLRenderTarget
  private scene: StoryScene | null = null
  private black = false
  /** Ambient occlusion (high tier): contact shadows in corners and under things, at half resolution. */
  private ao: GTAOPass | null = null
  private aoReady = false
  readonly aoEnabled: boolean

  constructor(
    canvas: HTMLCanvasElement,
    readonly quality: Quality,
    readonly reduced: boolean,
  ) {
    resolveFonts()
    setSurfaceResolution(quality.tier === 'low' ? 256 : 512)
    this.aoEnabled = quality.tier === 'high' && !reduced
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false })
    const r = this.renderer
    r.outputColorSpace = THREE.SRGBColorSpace
    r.toneMapping = THREE.AgXToneMapping
    r.toneMappingExposure = 1.05
    r.shadowMap.enabled = quality.shadows
    r.shadowMap.type = THREE.PCFShadowMap
    r.autoClear = false
    r.setClearColor(0x000000, 1)

    this.targetType = r.extensions.has('EXT_color_buffer_float') || r.extensions.has('EXT_color_buffer_half_float') ? THREE.HalfFloatType : THREE.UnsignedByteType
    this.rtMain = this.createTarget(quality.msaa)
    this.rtGhost = this.createTarget(0)
    // Integrated and mobile GPUs start lighter; adapt() raises it if there is headroom.
    this.resScale = quality.tier === 'high' ? 1 : 0.85
    this.pmrem = new THREE.PMREMGenerator(r)
    this.envTarget = this.pmrem.fromScene(new RoomEnvironment(), 0.04)
    this.environment = this.envTarget.texture
    this.composite.material.uniforms.uGrain.value = reduced ? 0.012 : 0.026
  }

  createTarget(samples = 0, width = 1, height = 1) {
    return new THREE.WebGLRenderTarget(width, height, { type: this.targetType, samples, depthBuffer: true })
  }

  get aspect() {
    return this.width / this.height
  }

  /** Builds a story scene; resolves once it is ready to draw its first frame. */
  async mount(scene: StoryScene) {
    this.unmount()
    await scene.init(this)
    this.scene = scene
    this.frameTimes.length = 0
  }

  unmount() {
    if (!this.scene) return
    this.scene.dispose()
    this.scene = null
    this.renderer.renderLists.dispose()
    this.clear()
  }

  get mounted() {
    return this.scene
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.dpr = Math.min(window.devicePixelRatio || 1, this.quality.dpr)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(this.width, this.height, false)
    this.applyScale()
    this.black = false
  }

  setMaxScale(scale: number) {
    this.maxScale = Math.min(1, Math.max(0.5, scale))
    if (this.resScale > this.maxScale) {
      this.resScale = this.maxScale
      this.applyScale()
    }
  }

  private applyScale() {
    const w = Math.round(this.width * this.dpr * this.resScale)
    const h = Math.round(this.height * this.dpr * this.resScale)
    this.rtMain.setSize(w, h)
    this.rtGhost.setSize(w, h)
    this.ao?.setSize(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)))
    this.composite.material.uniforms.uRes.value.set(w, h)
  }

  /** Keeps frame time in budget by adjusting internal resolution. */
  private adapt(dt: number) {
    this.frameTimes.push(dt)
    if (this.frameTimes.length < 90) return
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    this.frameTimes.length = 0
    const next = avg > 0.024 ? Math.max(0.6, this.resScale - 0.1) : avg < 0.0145 ? Math.min(this.maxScale, this.resScale + 0.1) : Math.min(this.maxScale, this.resScale)
    if (next !== this.resScale) {
      this.resScale = next
      this.applyScale()
    }
  }

  frame(input: FrameInput) {
    if (!this.scene) return this.clear()
    this.scene.render(input)
    if (!this.black) this.adapt(input.dt)
  }

  /** Renders `scene` into `target`, letterboxed to the fraction fw × fh of the target (centered). */
  draw(target: THREE.WebGLRenderTarget, scene: THREE.Scene, camera: THREE.Camera, fw = 1, fh = 1) {
    const r = this.renderer
    target.viewport.set(0, 0, target.width, target.height)
    target.scissorTest = false
    r.setRenderTarget(target)
    r.clear()
    if (fw < 0.999 || fh < 0.999) {
      const w = Math.round(target.width * fw)
      const h = Math.round(target.height * fh)
      const x = Math.round((target.width - w) / 2)
      const y = Math.round((target.height - h) / 2)
      target.viewport.set(x, y, w, h)
      target.scissor.set(x, y, w, h)
      target.scissorTest = true
      r.setRenderTarget(target)
    }
    r.render(scene, camera)
    target.scissorTest = false
    target.viewport.set(0, 0, target.width, target.height)
    if (this.aoEnabled && target === this.rtMain && fw >= 0.999 && fh >= 0.999 && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) this.occlusion(scene, camera as THREE.PerspectiveCamera)
  }

  private occlusion(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    if (!this.ao) {
      const w = Math.max(1, Math.round(this.rtMain.width / 2))
      const h = Math.max(1, Math.round(this.rtMain.height / 2))
      this.ao = new GTAOPass(scene, camera, w, h)
      this.ao.output = GTAOPass.OUTPUT.Off
      this.ao.updateGtaoMaterial({ radius: 0.32, distanceExponent: 1.6, thickness: 1.2, scale: 1.15, samples: 10, distanceFallOff: 1, screenSpaceRadius: false })
      this.ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 8 })
    }
    this.ao.scene = scene
    this.ao.camera = camera
    // Output "off": the pass only fills its own targets; the final pass multiplies the result in.
    this.ao.render(this.renderer, this.rtMain, this.rtMain, 0, false)
    this.aoReady = true
  }

  /** The shared final pass. `source` defaults to rtMain. */
  present(o: { fade: number; time: number; ghost?: number; source?: THREE.Texture }) {
    const u = this.composite.material.uniforms
    u.tMain.value = o.source ?? this.rtMain.texture
    u.tGhost.value = this.rtGhost.texture
    const ao = this.aoReady && !o.source && this.ao
    u.tAO.value = ao ? this.ao!.gtaoMap : null
    u.uAO.value = ao ? 0.85 : 0
    this.aoReady = false
    u.uGhost.value = o.ghost ?? 0
    u.uFade.value = o.fade
    u.uTime.value = o.time
    this.composite.render(this.renderer)
    this.black = false
  }

  clear() {
    if (this.black) return
    this.renderer.setRenderTarget(null)
    this.renderer.clear()
    this.black = true
  }

  onContextLost(cb: () => void) {
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      cb()
    })
  }

  dispose() {
    this.unmount()
    this.composite.dispose()
    this.ao?.dispose()
    this.rtMain.dispose()
    this.rtGhost.dispose()
    this.envTarget.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
