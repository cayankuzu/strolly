/**
 * PARALEL-LEŞ — the director.
 *
 * A man on a cliff-edge swing at dusk remembers a childhood walked along the
 * nearly transparent line between him and death. Eleven places, each its own
 * far-apart set (only the active one is shown); in every vignette the frame
 * splits at the critical instant and a translucent other self goes on into
 * the fall. Set contract: docs/stories/paralel.md.
 *
 * Every state is a pure function of progress `p` (plus time for idle life:
 * wind, water, the swing at rest), so scrolling back replays it exactly.
 */
import * as THREE from 'three'
import { local, segmentAt, type SegmentId } from '@/stories/paralel/timeline'
import type { SceneOptions, StoryScene, SceneInfo } from '../Stage'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { held } from '../kit/direct'
import { Cast } from './cast'
import { Env } from './env'
import { palette } from './materials'
import type { Ctx, Dir, Models, PSet } from './common'
import { ValleySet } from './sets/valley'
import { VoidSet } from './sets/void'
import { RoofsSet } from './sets/roofs'
import { AtriumSet } from './sets/atrium'
import { BridgeSet } from './sets/bridge'
import { HillSet } from './sets/hill'
import { SeaSet } from './sets/sea'
import { BikeSet } from './sets/bike'
import { SlopeSet } from './sets/slope'
import { BedroomSet } from './sets/bedroom'
import { ArchiveSet } from './sets/archive'

const FAR = 4000

class ParalelDirector implements SetDirector {
  private env = new Env()
  private cast!: Cast
  private sets: PSet[] = []
  private setOf = new Map<SegmentId, PSet>()
  private dir!: Dir
  private frameId = 0
  private hookFrame = -1
  private baseQ = new THREE.Quaternion()
  private rollQ = new THREE.Quaternion()
  private zAxis = new THREE.Vector3(0, 0, 1)
  private roll = 0
  private step = 0
  private walking = 0
  private first = true

  async build(scene: THREE.Scene, build: BuildContext) {
    await build.surfaces(['rock', 'gravel', 'sand'])
    const [models] = await Promise.all([
      build.models({
        rockFace: ['rock_face_01'],
        boulder: ['boulder_01'],
        aircon: ['exterior_aircon_unit'],
        duct: ['modular_airduct_rectangular_01'],
        lifebuoy: ['lifebuoy'],
        trunk: ['dead_tree_trunk'],
      }),
      this.env.load(build, scene),
    ])
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      // Development: model footprints for set dressing checks.
      const sizes: Record<string, number[]> = {}
      for (const [k, m] of Object.entries(models)) {
        if (!m) continue
        const b = new THREE.Box3().setFromObject(m)
        sizes[k] = [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map((v) => +v.toFixed(2))
      }
      ;(window as unknown as { __paralel?: unknown }).__paralel = { sizes, scene, dir: () => this.dir }
    }
    this.cast = new Cast()
    scene.add(this.cast.group)
    const ctx: Ctx = { build, pal: palette(), env: this.env, cast: this.cast, models: models as Models, scene }

    const valley = new ValleySet()
    const plan: Array<[PSet, SegmentId[]]> = [
      [valley, ['open', 'today', 'swing', 'feet', 'arc', 'rope', 'choose', 'grows', 'still', 'end']],
      [new VoidSet(), ['line', 'can']],
      [new RoofsSet(), ['roofs', 'gap', 'down', 'jump', 'friends', 'chain', 'fell']],
      [new AtriumSet(), ['glass', 'rooms', 'crack', 'glassBroke']],
      [new BridgeSet(), ['river', 'beams', 'slip', 'ironSlipped']],
      [new HillSet(), ['cliff', 'stone', 'rehearsal']],
      [new SeaSet(), ['flag', 'waves', 'under', 'up', 'waveKept']],
      [new BikeSet(), ['bike', 'air']],
      [new SlopeSet(), ['slope', 'bargain', 'earthFell']],
      [new BedroomSet(), ['socket', 'spark', 'normal', 'powerKept']],
      [new ArchiveSet(), ['bodies', 'room', 'devil', 'exception', 'diorama']],
    ]
    for (const [set, segs] of plan) {
      await set.build(ctx)
      scene.add(set.group)
      this.sets.push(set)
      for (const s of segs) this.setOf.set(s, set)
    }
    this.env.patchMaterials(scene, new Set())

    // The valley is 400 m deep and the far ridge 1.6 km away: this story's camera sees farther
    // than the default, and it can roll (tumbling under a wave). Both are applied just before
    // each render, idempotently (the AO pass renders the scene a second time).
    scene.onBeforeRender = (_r, _s, camera) => {
      const cam = camera as THREE.PerspectiveCamera
      if (!cam.isPerspectiveCamera) return
      if (cam.far !== FAR) {
        cam.far = FAR
        cam.updateProjectionMatrix()
      }
      if (this.hookFrame !== this.frameId) {
        this.baseQ.copy(cam.quaternion)
        this.hookFrame = this.frameId
      }
      if (Math.abs(this.roll) > 1e-4) {
        cam.quaternion.copy(this.baseQ).multiply(this.rollQ.setFromAxisAngle(this.zAxis, this.roll))
        cam.updateMatrixWorld()
      }
    }
    this.dir = { f: null as unknown as SetFrame, shot: null as unknown as Shot, seg: 'open', u: 0, cu: 0, cast: this.cast, env: this.env, stop: false, roll: 0, level: 0, step: 0, walking: 0 }
  }

  frame(f: SetFrame, shot: Shot) {
    this.frameId++
    const seg = segmentAt(f.p).id as SegmentId
    const u = local(f.p, seg)
    const set = this.setOf.get(seg)
    this.env.begin()
    this.cast.begin()
    for (const s of this.sets) s.group.visible = s === set
    const d = this.dir
    d.f = f
    d.shot = shot
    d.seg = seg
    d.u = u
    d.cu = held(u, f.reduced)
    d.stop = f.flags.has('swing:stop')
    d.roll = 0
    d.level = 0
    d.step = 0
    d.walking = 0
    if (set) set.direct(d)
    else {
      // Not built yet: a quiet dark frame.
      this.env.setFog(0x070a14, 0.02)
      this.env.sky.set({ zenith: 0x070a14, horizon: 0x0b1020, below: 0x05070d, haze: 0x0b1020, hazeAmt: 0, sunColor: 0, disc: 0, glow: 0, cloud: 0, cloudLit: 0, cloudShade: 0 }, new THREE.Vector3(0, 1, 0))
      shot.pos.set(0, 1.6, 4)
      shot.tgt.set(0, 1.2, 0)
      shot.fov = 40
    }
    if (process.env.NODE_ENV !== 'production') {
      // Development: a camera override for framing checks (window.__paralelShot = [px,py,pz, tx,ty,tz, fov]).
      const o = (globalThis as { __paralelShot?: number[] }).__paralelShot
      if (o && o.length === 7) {
        shot.pos.set(o[0], o[1], o[2])
        shot.tgt.set(o[3], o[4], o[5])
        shot.fov = o[6]
        shot.handheld = 0
      }
    }
    this.env.follow(shot.pos, f.time)
    this.roll = (f.reduced ? 0 : d.roll) + d.level
    this.step = d.step
    this.walking = d.walking
    if (this.first) this.first = false
  }

  motion(m: SceneInfo['motion']) {
    m.step = this.step
    m.walking = this.walking
  }

  dispose() {
    for (const s of this.sets) s.dispose?.()
  }
}

export const createParalelScene = (options: SceneOptions): StoryScene => createSetScene(new ParalelDirector(), options)
