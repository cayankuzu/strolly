/**
 * The set scene of the shared kit (kit/SetScene.ts), with one addition this
 * story needs: a director may ask for its own lens pass (post.ts) after the
 * frame is drawn — blur, overexposure, vignette — for the shots seen through
 * someone's eyes. Everything else (look, fov, frustum for inView, sound
 * motion, fade) works exactly as in the shared scene.
 */
import * as THREE from 'three'
import { finiteOr } from '@/lib/math'
import { createInfo, type FrameInput, type SceneOptions, type Stage, type StoryScene } from '../Stage'
import { applyLook } from '../look'
import { fitFov } from '../lens'
import { disposeTree } from '../util'
import { applyMetricUVs, preloadSurfaces } from '../kit/surfaces'
import { loadEnvironment, loadModel, loadModels, loadPanorama } from '../kit/assets'
import { makeShot, type SetDirector, type SetFrame } from '../kit/SetScene'
import { OfkePost, makePost, postActive, type PostParams } from './post'

export interface LensDirector extends SetDirector {
  /** The lens for this frame (written during `frame`). */
  readonly post: PostParams
}

/**
 * Development check (as in kit/SetScene.ts): what the camera is inside of or
 * touching — small solid meshes and figures' joints. Read through
 * `globalThis.__strollyClips()` by the headless QA tools.
 */
function clipReport(scene: THREE.Scene, camera: THREE.Camera) {
  const c = camera.getWorldPosition(new THREE.Vector3())
  const box = new THREE.Box3()
  const size = new THREE.Vector3()
  const m4 = new THREE.Matrix4()
  const p = new THREE.Vector3()
  const hits: Array<{ what: string; d: number }> = []
  const named = (o: THREE.Object3D) => {
    let x: THREE.Object3D | null = o
    while (x && !x.name) x = x.parent
    return x?.name || o.type
  }
  const test = (what: string, b: THREE.Box3) => {
    b.getSize(size)
    const max = Math.max(size.x, size.y, size.z)
    if (max > 4 || max < 0.03) return
    const d = b.distanceToPoint(c)
    if (d < 0.08) hits.push({ what, d: +d.toFixed(3) })
  }
  scene.traverseVisible((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || (m as THREE.SkinnedMesh).isSkinnedMesh) return
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material & { opacity?: number }
    if (mat?.transparent && (mat.opacity ?? 1) < 0.35) return
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
    const inst = m as unknown as THREE.InstancedMesh
    if (inst.isInstancedMesh) {
      for (let i = 0; i < Math.min(inst.count, 400); i++) {
        inst.getMatrixAt(i, m4)
        box.copy(m.geometry.boundingBox!).applyMatrix4(m4.premultiply(m.matrixWorld))
        test(`${named(m)}#${i}`, box)
      }
    } else test(named(m), box.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld))
  })
  const R: Record<string, number> = { head: 0.13, neck: 0.1, chest: 0.2, spine: 0.18, hips: 0.18 }
  scene.traverseVisible((o) => {
    const b = o as THREE.Bone
    if (!b.isBone || !(b.name in R)) return
    const d = b.getWorldPosition(p).distanceTo(c)
    let root: THREE.Object3D | null = b
    while (root && ((root as THREE.Bone).isBone || !root.name)) root = root.parent
    if (d < R[b.name]) hits.push({ what: `figure:${root?.name ?? '?'}:${b.name}`, d: +d.toFixed(3) })
  })
  return hits
}

const frustum = new THREE.Frustum()
const viewProj = new THREE.Matrix4()
const sphere = new THREE.Sphere()

class LensSetScene implements StoryScene {
  readonly info = createInfo()
  private stage!: Stage
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 600)
  private shot = makeShot()
  private hasFrustum = false
  private frame: SetFrame
  private lens: OfkePost | null = null

  constructor(
    private director: LensDirector,
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
    if (process.env.NODE_ENV !== 'production') (globalThis as { __strollyClips?: () => unknown }).__strollyClips = () => clipReport(this.scene, this.camera)
    this.scene.background = new THREE.Color(0x000000)
    await preloadSurfaces()
    await this.director.build(this.scene, {
      quality: stage.quality,
      environment: stage.environment,
      renderer: stage.renderer,
      hdri: (id) => loadEnvironment(id, stage.renderer),
      model: loadModel,
      models: loadModels,
      panorama: loadPanorama,
      surfaces: preloadSurfaces,
    })
    applyMetricUVs(this.scene)
    this.lens = new OfkePost(stage.targetType)
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
    const post = this.director.post
    post.blur = 0
    post.white = 0
    post.vignette = 0
    post.tintAmount = 0
    post.ghost = 0
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
    if (this.lens && postActive(post)) {
      const source = this.lens.render(stage.renderer, stage.rtMain, post, time)
      stage.present({ fade: shot.fade, time, source })
    } else stage.present({ fade: shot.fade, time })
  }

  dispose() {
    this.options.labels([])
    this.director.dispose()
    this.lens?.dispose()
    disposeTree(this.scene)
    this.scene.clear()
  }
}

export const createLensScene = (director: LensDirector, options: SceneOptions): StoryScene => new LensSetScene(director, options)
export { makePost }
