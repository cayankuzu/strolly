/**
 * TEK AYAK — one classroom, one Friday afternoon (docs/stories/tekayak.md).
 *
 * World layout: the room is x −4…4 (windows on the left, the door on the
 * right), z −3.5…3.5 (the board at the front, z −3.5), 3.2 m high. Twelve
 * double desks in three columns; the reader sits in the middle column, second
 * row, right seat. The bin corner is front-right, under the clock.
 */
import * as THREE from 'three'
import type { SceneOptions, StoryScene } from '../Stage'
import { createSetScene, type BuildContext, type SetDirector, type SetFrame, type Shot } from '../kit/SetScene'
import { palette, type Pal } from './materials'
import { buildShell, type Shell } from './room'
import { buildFurniture, type Furniture } from './furniture'
import { Sunlight } from './light'
import { buildCast, type Cast } from './cast'
import { Wheelchair } from './wheelchair'
import { PaperPlane } from './plane'
import { Director } from './direction'

class TekAyakDirector implements SetDirector {
  private pal: Pal = palette()
  private shell!: Shell
  private furniture!: Furniture
  private light!: Sunlight
  private cast!: Cast
  private chair!: Wheelchair
  private plane!: PaperPlane
  private direction!: Director

  async build(scene: THREE.Scene, ctx: BuildContext) {
    const m = this.pal
    scene.environment = (await ctx.hdri('brown_photostudio_02')) ?? ctx.environment
    scene.environmentIntensity = 0.32
    scene.background = new THREE.Color(0xdfe6ea)
    this.shell = buildShell(scene, m)
    this.furniture = await buildFurniture(scene, m, ctx)
    this.light = new Sunlight(scene, ctx.quality.shadows)
    this.cast = buildCast(scene, m, this.furniture.seats)
    this.chair = new Wheelchair(m)
    this.chair.dressParka(m)
    scene.add(this.chair.root)
    this.plane = new PaperPlane()
    scene.add(this.plane.root)
    this.direction = new Director({ scene, renderer: ctx.renderer, shell: this.shell, furniture: this.furniture, light: this.light, cast: this.cast, chair: this.chair, plane: this.plane, pal: m })
  }

  frame(f: SetFrame, shot: Shot) {
    this.direction.frame(f, shot)
  }

  motion(info: { step: number; walking: number; robots: number; doors: number; frame: number }) {
    this.direction.motion(info)
  }

  dispose() {
    this.direction?.dispose()
    this.light?.dispose()
    this.plane?.dispose()
    for (const p of this.cast?.all ?? []) p.dispose()
    for (const t of [...(this.shell?.textures ?? []), ...(this.furniture?.textures ?? [])]) t.dispose()
    for (const mat of Object.values(this.pal)) mat.dispose()
  }
}

export const createTekAyakScene = (options: SceneOptions): StoryScene => createSetScene(new TekAyakDirector(), options)
