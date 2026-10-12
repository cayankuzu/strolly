/**
 * Set F — the ship from outside (centred at x 500): a 34 m white hull along
 * z, nose toward −z (where it is going), a habitat ring of 14 m turning
 * slowly at mid-body, radiators and solar wings, the engine at the back, the
 * keyhole on the hull. Its lit portholes are the people inside.
 */
import * as THREE from 'three'
import { canvasPlane, rbox, turned } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { keyhole } from './draw'

const PI = Math.PI

export class Ship {
  readonly group = new THREE.Group()
  readonly ring = new THREE.Group()
  readonly lights: THREE.Mesh[] = []
  readonly glow: THREE.MeshBasicMaterial

  constructor(m: Pal, scene: THREE.Scene) {
    const g = this.group
    g.position.set(500, 0, 0)
    scene.add(g)
    const axisZ = (o: THREE.Object3D) => {
      o.rotation.x = PI / 2
      return o
    }
    // Command module at the nose (−z): a blunt cone on a cylinder.
    const nose = turned(
      [
        [0, 0],
        [0.9, 0.1],
        [1.6, 0.8],
        [2.1, 2.2],
        [2.2, 3.4],
        [2.2, 6.0],
      ],
      m.hull,
      40,
      g,
    )
    nose.rotation.x = PI / 2
    nose.position.z = -17
    // A band of windows on the command module.
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * PI - PI / 2 + 0.15
      const w = mesh(new THREE.PlaneGeometry(0.4, 0.28), m.portholeLit, Math.sin(a) * 2.21, Math.cos(a) * 2.21, -13.6, g)
      w.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(Math.sin(a), Math.cos(a), 0))
      this.lights.push(w)
    }
    // The spine.
    axisZ(cyl(1.15, 1.15, 26, m.hullGrey, 0, 0, 0, g, 28))
    // Truss sections along the spine.
    for (let z = -9; z <= 10; z += 2.2) {
      const r = mesh(new THREE.TorusGeometry(1.25, 0.06, 6, 28), m.hullGrey, 0, 0, z, g)
      void r
    }
    // Habitat ring: hub, four spokes, the torus with its portholes.
    const R = this.ring
    R.position.set(0, 0, -2)
    g.add(R)
    axisZ(cyl(1.7, 1.7, 2.2, m.hull, 0, 0, 0, R, 32))
    const torus = mesh(new THREE.TorusGeometry(7, 1.05, 24, 96), m.hull, 0, 0, 0, R)
    void torus
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2
      const spoke = cyl(0.32, 0.32, 5.4, m.hullGrey, Math.cos(a) * 4.4, Math.sin(a) * 4.4, 0, R, 12)
      spoke.rotation.z = a - PI / 2
    }
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * PI * 2
      const p = mesh(new THREE.CircleGeometry(0.16, 12), m.portholeLit, Math.cos(a) * 7, Math.sin(a) * 7, 1.06, R)
      void p
      if (i % 2 === 0) {
        const q = mesh(new THREE.CircleGeometry(0.12, 10), m.portholeLit, Math.cos(a) * 7.9, Math.sin(a) * 7.9, 0, R)
        q.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(Math.cos(a), Math.sin(a), 0))
      }
    }
    // Radiator fins and two solar wings behind the ring.
    for (const sx of [-1, 1]) {
      const fin = rbox(0.06, 2.6, 6.5, m.hull, sx * 1.3, 0, 5.5, g, 0.02)
      fin.position.y = 0
      rbox(6.0, 0.05, 0.25, m.hullGrey, sx * 4.2, 0, 7.6, g, 0.02)
      const wing = rbox(5.4, 0.04, 3.0, m.solar, sx * 4.4, 0, 7.6, g, 0.01)
      void wing
      for (let k = 1; k < 6; k++) rbox(0.03, 0.05, 3.0, m.hullGrey, sx * (1.7 + k * 0.9), 0.02, 7.6, g, 0.005)
    }
    // Tanks and the engine at the back (+z).
    axisZ(cyl(2.0, 2.0, 5.5, m.gold, 0, 0, 12.5, g, 32))
    for (const z of [10.0, 15.0]) mesh(new THREE.TorusGeometry(2.02, 0.08, 8, 40), m.hullGrey, 0, 0, z, g)
    const bell = turned(
      [
        [0.6, 0],
        [0.9, 0.8],
        [1.6, 2.2],
        [1.55, 2.25],
        [0.85, 0.8],
        [0.55, 0],
      ],
      m.hullGrey,
      32,
      g,
    )
    bell.rotation.x = -PI / 2
    bell.position.z = 15.3
    this.glow = new THREE.MeshBasicMaterial({ color: 0x9fb8ff })
    const glowDisc = mesh(new THREE.CircleGeometry(1.45, 32), this.glow, 0, 0, 17.4, g)
    void glowDisc
    // The emblem on the hull, and the navigation lights.
    const emb = canvasPlane(1.8, 1.8, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      keyhole(ctx, w / 2, h * 0.32, w * 0.16, '#202227', 7)
    }, { transparent: true })
    emb.mesh.position.set(2.205, 0.2, -12.5)
    emb.mesh.rotation.y = PI / 2
    g.add(emb.mesh)
    const emb2 = emb.mesh.clone()
    emb2.position.x = -2.205
    emb2.rotation.y = -PI / 2
    g.add(emb2)
    for (const [x, y, z, mat] of [
      [2.3, 0, -11, m.navGreen],
      [-2.3, 0, -11, m.navRed],
      [0, 2.3, -11, m.navWhite],
      [0, 0, 17.6, m.navWhite],
    ] as const) {
      const l = mesh(new THREE.SphereGeometry(0.12, 10, 8), mat, x, y, z, g)
      this.lights.push(l)
    }
    g.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh && !(mm.material instanceof THREE.MeshBasicMaterial)) {
        mm.castShadow = true
        mm.receiveShadow = true
      }
    })
  }

  /** The ring turns; the lights fade to nothing when the ship meets the dark. */
  update(time: number, fade: number) {
    this.ring.rotation.z = time * 0.06
    for (const l of this.lights) l.visible = fade > 0.02
    this.glow.color.setRGB(0.62 * fade, 0.72 * fade, 1.0 * fade)
  }
}
