/**
 * ÖFKESEL DENEYİM SİMÜLASYONU — the director.
 *
 * Six sets far apart on one plane (see docs/stories/ofke.md §2): the office
 * (x 0), the stairwell (40), the street (80), ÖFKE NÖBETİ (140), the white
 * room ODA 3 (160) and the convict line (220). Only the set in use is
 * visible; a fixed pool of lights is moved to it. Every state is a pure
 * function of progress and of the reader's two choices.
 *
 * Acts: A (ch. 1–2, office and road), B (ch. 3 and 6, the service), C (ch. 4–5
 * and `done`, the room as Arif sees it), D (ch. 7 and 9, the room as it is),
 * E (ch. 8, the line).
 */
import * as THREE from 'three'
import { chapterAt, local, segmentAt } from '@/stories/ofke/timeline'
import type { SceneInfo, SceneOptions, StoryScene } from '../Stage'
import type { BuildContext, SetFrame, Shot } from '../kit/SetScene'
import { createLensScene, makePost, type LensDirector } from './stage'
import { World, LightRig } from './world'
import { foldedGlasses } from './cast'
import { motion, type Seg } from './common'
import { runActA } from './actA'
import { runActB } from './actB'
import { runActC } from './actC'
import { runActD } from './actD'
import { runActE } from './actE'

type Act = (w: World, f: SetFrame, shot: Shot, seg: Seg, u: number) => void

/** Takes one fixture out of a model that lays several variants side by side; centred, its top at y = 0. */
function pickNode(src: THREE.Group | null, name: string, glow?: THREE.ColorRepresentation) {
  if (!src) return null
  src.updateMatrixWorld(true)
  const node = src.getObjectByName(name)
  if (!node) return null
  const g = new THREE.Group()
  const copy = node.clone(true)
  node.matrixWorld.decompose(copy.position, copy.quaternion, copy.scale)
  g.add(copy)
  const box = new THREE.Box3().setFromObject(g)
  const c = box.getCenter(new THREE.Vector3())
  copy.position.x -= c.x
  copy.position.z -= c.z
  copy.position.y -= box.max.y
  if (glow !== undefined)
    copy.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mats = ([] as THREE.Material[]).concat(m.material).map((mm) => {
        if (!/glass/i.test(mm.name)) return mm
        const k = (mm as THREE.MeshStandardMaterial).clone()
        k.emissive = new THREE.Color(glow)
        k.emissiveIntensity = 2.2
        return k
      })
      m.material = mats.length === 1 ? mats[0] : mats
      m.castShadow = false
    })
  return g
}

class OfkeDirector implements LensDirector {
  readonly post = makePost()
  private w = new World()
  private acts: Record<string, Act> = {}

  async build(scene: THREE.Scene, ctx: BuildContext) {
    const w = this.w
    w.scene = scene
    w.post = this.post
    w.fallbackEnv = ctx.environment
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(0x000000, 1000, 2000)
    const [models, office, clinic, night, dusk, outside] = await Promise.all([
      ctx.models({
        laptop: ['classic_laptop', { width: 0.34 }],
        notepads: ['office_notepads'],
        wetSign: ['WetFloorSign_01'],
        camera: ['security_camera_01'],
        tubes: ['mounted_fluorescent_lights', { ground: false }],
        medical: ['medical_box'],
        cart: ['CoffeeCart_01'],
      }),
      ctx.hdri('brown_photostudio_02'),
      ctx.hdri('hospital_room_2'),
      ctx.hdri('abandoned_tiled_room'),
      ctx.hdri('belfast_sunset_puresky'),
      ctx.hdri('moonless_golf'),
    ])
    w.hdri = { office, clinic, night, dusk, outside }
    const tube = pickNode(models.tubes, 'mounted_fluorescent_lights_a', 0xf2fff6)
    w.office.build({ laptop: models.laptop, notepads: models.notepads })
    w.stairs.build({ tube })
    w.street.build()
    w.room.build(w.office.m, { camera: models.camera, wetSign: models.wetSign }, w.office.skyMorning)
    w.line.build({ tube, camera: models.camera, medical: models.medical, wetSign: models.wetSign })
    w.lights = new LightRig(scene, ctx.quality)
    w.buildCast(scene)
    const m = w.mats
    w.service.build({ cart: models.cart, medical: models.medical, camera: models.camera, tube }, foldedGlasses(m.glassFrame, m.glassLens), m.shirt, m.tie, m.overalls, m.slipOn)
    for (const g of [w.office.group, w.stairs.group, w.street.group, w.service.group, w.room.group, w.line.group]) {
      g.visible = false
      scene.add(g)
    }
    // The car lives outside the sets: it drives in two of them.
    w.car = w.street.car
    w.carHolder = w.street.carHolder
    scene.add(w.carHolder)
    this.acts = { resign: runActA, road: runActA, service: runActB, room: runActC, fit: runActC, clean: runActD, convict: runActE, door: runActD }
  }

  frame(f: SetFrame, shot: Shot) {
    const w = this.w
    const seg = segmentAt(f.p).id as Seg
    const u = local(f.p, seg)
    const ch = chapterAt(f.p).id
    w.reset()
    for (const g of [w.office.group, w.stairs.group, w.street.group, w.service.group, w.room.group, w.line.group]) g.visible = false
    w.carHolder.visible = false
    w.lights.off()
    motion.step = 0
    motion.walking = 0
    motion.doors = 0
    motion.robots = 0
    const act = ch === 'price' ? (seg === 'done' ? runActC : runActB) : this.acts[ch]
    if (act) act(w, f, shot, seg, u)
    else {
      shot.pos.set(0, 1.6, 4)
      shot.tgt.set(0, 1.6, 0)
      shot.fade = 0
    }
  }

  motion(m: SceneInfo['motion']) {
    m.step = motion.step
    m.walking = motion.walking
    m.doors = motion.doors
    m.robots = motion.robots
    m.frame++
  }

  dispose() {}
}

export const createOfkeScene = (options: SceneOptions): StoryScene => createLensScene(new OfkeDirector(), options)
