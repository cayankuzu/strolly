/**
 * The evening programme on Levy's TV: Professor Veyl in a warm studio,
 * rested and kind, rendered live into the television's picture. A small scene
 * of its own (its own light), drawn into a render target only while the TV is
 * on screen.
 */
import * as THREE from 'three'
import { rbox } from '../kit/props'
import * as P from '../figure/poses'
import { makePose } from '../figure/Figure'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import type { Person } from './cast'

const TALK = makePose({ rUpper: [-0.5, 0.2, -0.2], rFore: [-1.5, 0, 0], rHand: [0.2, 0.3, 0], head: [0.04, -0.15, 0] }, P.SIT_STRAIGHT)

export class TvStudio {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(26, 1.2 / 0.7, 0.1, 50)
  readonly rt: THREE.WebGLRenderTarget

  constructor(
    pal: Pal,
    private veyl: Person,
    env: THREE.Texture,
    type: THREE.TextureDataType,
  ) {
    this.rt = new THREE.WebGLRenderTarget(640, 374, { type, samples: 2 })
    this.rt.texture.colorSpace = THREE.LinearSRGBColorSpace
    const s = this.scene
    s.background = new THREE.Color(0x1d3150)
    s.environment = env
    s.environmentIntensity = 0.5
    // Backdrop: a soft blue gradient wall with a ring motif; a low desk.
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#2c4c7a')
    grad.addColorStop(1, '#13233d')
    g.fillStyle = grad
    g.fillRect(0, 0, 512, 256)
    g.strokeStyle = 'rgba(160,200,255,0.35)'
    g.lineWidth = 6
    g.beginPath()
    g.ellipse(360, 110, 90, 22, 0, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = 'rgba(200,220,255,0.6)'
    g.font = '700 26px sans-serif'
    g.fillText('BİLİŞSEL STABİLİZASYON', 250, 200)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    const wall = mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ map: tex }), 0, 1.6, -2.2, s)
    wall.name = 'backdrop'
    rbox(1.6, 0.06, 0.7, pal.white, 0.5, 0.74, 0.55, s, 0.02)
    cyl(0.25, 0.3, 0.72, pal.white, 0.5, 0.36, 0.55, s, 24)
    const chair = rbox(0.55, 0.5, 0.55, pal.armchair, 0, 0.25, 0, s, 0.06)
    chair.castShadow = false
    rbox(0.55, 0.6, 0.12, pal.armchair, 0, 0.75, -0.26, s, 0.05)
    s.add(new THREE.HemisphereLight(0xfff1e0, 0x2a3040, 1.1))
    const key = new THREE.SpotLight(0xffe2c0, 30, 12, 0.6, 0.6, 1.5)
    key.position.set(1.8, 2.8, 2.4)
    key.target.position.set(0, 1.2, 0)
    s.add(key, key.target)
    const rim = new THREE.PointLight(0x9fc4ff, 6, 6, 1.6)
    rim.position.set(-1.2, 2.2, -1.2)
    s.add(rim)
    s.add(veyl.figure.root)
    this.camera.position.set(0.55, 1.32, 2.6)
    this.camera.lookAt(0.12, 1.2, 0)
  }

  /** Draws the programme; `talk` 0–1 is how much he is speaking. */
  render(renderer: THREE.WebGLRenderer, time: number, talk: number) {
    const a = this.veyl.actor.begin()
    a.place(0, 0.05, 0).hold(TALK)
    a.lookAt(0.55, 2.6, 0.5)
    a.apply(time, true)
    const j = this.veyl.figure.joints
    j.head.rotation.y += Math.sin(time * 1.1) * 0.08 * talk
    j.head.rotation.x += Math.sin(time * 2.3) * 0.03 * talk
    j.rFore.rotation.x += Math.sin(time * 1.7) * 0.15 * talk
    this.veyl.figure.root.updateMatrixWorld(true)
    const prev = renderer.getRenderTarget()
    renderer.setRenderTarget(this.rt)
    renderer.clear()
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(prev)
  }

  dispose() {
    this.rt.dispose()
  }
}
