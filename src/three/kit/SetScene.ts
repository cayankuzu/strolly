/**
 * The generic story scene: one THREE.Scene built by a story's director, one
 * camera aimed by it, the reader's look on top, the stage's shared final
 * pass. Stories differ in their sets and their direction, not in plumbing.
 *
 * The director also gets a small perception toolkit — `inView` — so a set can
 * change only what the reader is not looking at (EŞİK, KALAN, YAŞAMAK).
 */
import * as THREE from 'three'
import type { Quality } from '@/lib/env'
import type { LookLimits } from '@/lib/look'
import { finiteOr } from '@/lib/math'
import { createInfo, type FrameInput, type SceneInfo, type SceneOptions, type Stage, type StoryScene } from '../Stage'
import { applyLook, type Look, type LookRequest } from '../look'
import { fitFov } from '../lens'
import { disposeTree } from '../util'
import { applyMetricUVs } from './surfaces'

export type SetFrame = {
  p: number
  time: number
  dt: number
  look: Look
  seen: ReadonlySet<string>
  /** What the reader chose (see StoryContent.choices). */
  flags: ReadonlySet<string>
  reduced: boolean
  /** Whether a world point was inside the reader's view on the previous frame. */
  inView: (point: THREE.Vector3, margin?: number) => boolean
}

export type Shot = {
  pos: THREE.Vector3
  tgt: THREE.Vector3
  fov: number
  /** 0 black … 1 full picture. */
  fade: number
  /** The composition holds still (the look eases home). */
  locked: boolean
  /** Narrowed look, for sets built for one direction. */
  limits: LookLimits | null
  /** Ask the look to turn (once per id). */
  request: LookRequest | null
  /** Hand-held breathing for this shot (0–1). */
  handheld: number
}

export const makeShot = (): Shot => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3(0, 0, -1), fov: 40, fade: 1, locked: false, limits: null, request: null, handheld: 1 })

export type BuildContext = { quality: Quality; environment: THREE.Texture; renderer: THREE.WebGLRenderer }

export interface SetDirector {
  build(scene: THREE.Scene, ctx: BuildContext): void | Promise<void>
  /** Puts the set in its state for this frame and writes the shot. */
  frame(f: SetFrame, shot: Shot): void
  /** Optional: what the sound follows. */
  motion?(info: SceneInfo['motion']): void
  dispose(): void
}

const frustum = new THREE.Frustum()
const viewProj = new THREE.Matrix4()
const sphere = new THREE.Sphere()

class SetScene implements StoryScene {
  readonly info = createInfo()
  private stage!: Stage
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 600)
  private shot = makeShot()
  private hasFrustum = false
  private frame: SetFrame

  constructor(
    private director: SetDirector,
    private options: SceneOptions,
  ) {
    this.frame = {
      p: 0,
      time: 0,
      dt: 0,
      look: { yaw: 0, pitch: 0 },
      seen: new Set(),
      flags: new Set(),
      reduced: false,
      inView: (point, margin = 0.4) => {
        if (!this.hasFrustum) return true
        sphere.center.copy(point)
        sphere.radius = margin
        return frustum.intersectsSphere(sphere)
      },
    }
  }

  async init(stage: Stage) {
    this.stage = stage
    this.scene.background = new THREE.Color(0x000000)
    await this.director.build(this.scene, { quality: stage.quality, environment: stage.environment, renderer: stage.renderer })
    // Procedural surfaces keep their real-world scale on every object.
    applyMetricUVs(this.scene)
    // Compile and upload everything once, off-screen, so no set stalls on first sight.
    this.camera.position.set(0, 1.6, 4)
    this.camera.lookAt(0, 1.2, 0)
    await stage.renderer.compileAsync(this.scene, this.camera)
    const culled: THREE.Object3D[] = []
    this.scene.traverse((o) => {
      if (o.frustumCulled) {
        o.frustumCulled = false
        culled.push(o)
      }
    })
    const tiny = new THREE.WebGLRenderTarget(4, 4)
    stage.renderer.setRenderTarget(tiny)
    stage.renderer.render(this.scene, this.camera)
    stage.renderer.setRenderTarget(null)
    tiny.dispose()
    culled.forEach((o) => (o.frustumCulled = true))
  }

  render({ p, time, dt, look, seen, flags }: FrameInput) {
    const stage = this.stage
    const f = this.frame
    f.p = finiteOr(p, 0)
    f.time = time
    f.dt = dt
    f.look = look
    f.seen = seen
    f.flags = flags
    f.reduced = this.options.reduced
    const shot = this.shot
    shot.locked = false
    shot.limits = null
    shot.request = null
    shot.handheld = 1
    shot.fade = 1
    this.director.frame(f, shot)

    const cam = this.camera
    cam.position.copy(shot.pos)
    if (this.options.handheld && shot.handheld > 0) {
      cam.position.x += Math.sin(time * 0.57) * 0.005 * shot.handheld
      cam.position.y += Math.sin(time * 0.73 + 1.1) * 0.004 * shot.handheld
    }
    if (cam.position.distanceToSquared(shot.tgt) < 1e-6) shot.tgt.z -= 0.01
    cam.lookAt(shot.tgt)
    if (!shot.locked) applyLook(cam, look)
    cam.fov = fitFov(shot.fov, stage.aspect)
    cam.aspect = stage.aspect
    cam.updateProjectionMatrix()
    cam.updateMatrixWorld()
    viewProj.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
    frustum.setFromProjectionMatrix(viewProj)
    this.hasFrustum = true

    this.info.set = 'set'
    this.info.sp = f.p
    this.info.camera.copy(cam.position)
    cam.getWorldDirection(this.info.forward)
    this.info.look.locked = shot.locked
    this.info.look.limits = shot.limits
    this.info.look.request = shot.request
    this.director.motion?.(this.info.motion)

    if (shot.fade <= 0.001) {
      stage.clear()
      return
    }
    stage.draw(stage.rtMain, this.scene, cam)
    stage.present({ fade: shot.fade, time })
  }

  dispose() {
    this.options.labels([])
    this.director.dispose()
    disposeTree(this.scene)
    this.scene.clear()
  }
}

export const createSetScene = (director: SetDirector, options: SceneOptions): StoryScene => new SetScene(director, options)
