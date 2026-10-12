/**
 * Eren's wheelchair: a child's active, rigid-frame manual chair (docs §2.4).
 * Graphite frame, black rear tires Ø 0.56 with brushed hand rims, small front
 * casters, a single footplate, a low backrest (top at 0.70), no push handles,
 * side guards over the wheels — the +x one drawn on in marker.
 *
 * Local frame: the chair faces +z; the origin is under the seat center on
 * the floor. Everything stays below 0.72 m (the desktop), on purpose.
 */
import * as THREE from 'three'
import { rbox, tube } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { fleetDecal } from './canvas'

export const CHAIR = {
  seatY: 0.48,
  seatW: 0.32,
  seatD: 0.36,
  axleZ: -0.16,
  wheelR: 0.28,
  wheelX: 0.25,
  rimX: 0.278,
  rimR: 0.25,
  casterZ: 0.3,
  casterX: 0.14,
  casterR: 0.05,
  footZ: 0.42,
  footY: 0.1,
  backTop: 0.7,
}

function wheel(m: Pal) {
  const g = new THREE.Group()
  const C = CHAIR
  // Tire and rim (the wheel turns about local x).
  const tire = mesh(new THREE.TorusGeometry(C.wheelR - 0.014, 0.0145, 12, 64), m.chairTire, 0, 0, 0, g)
  tire.rotation.y = Math.PI / 2
  const rim = mesh(new THREE.TorusGeometry(C.wheelR - 0.034, 0.008, 8, 64), m.chairRim, 0, 0, 0, g)
  rim.rotation.y = Math.PI / 2
  // Spokes: 24, crossing from the hub flanges to the rim.
  const n = 24
  const spoke = new THREE.CylinderGeometry(0.0012, 0.0012, C.wheelR - 0.045, 4)
  const spokes = new THREE.InstancedMesh(spoke, m.chairSpoke, n)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const p = new THREE.Vector3()
  const s = new THREE.Vector3(1, 1, 1)
  const rimR = C.wheelR - 0.04
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const side = i % 2 ? 1 : -1
    const hub = new THREE.Vector3(side * 0.03, Math.sin(a + 0.25 * side) * 0.025, Math.cos(a + 0.25 * side) * 0.025)
    const end = new THREE.Vector3(0, Math.sin(a) * rimR, Math.cos(a) * rimR)
    const dir = end.clone().sub(hub)
    const len = dir.length()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    p.copy(hub).addScaledVector(dir, len / 2)
    s.set(1, len / (C.wheelR - 0.045), 1)
    spokes.setMatrixAt(i, m4.compose(p, q, s))
  }
  g.add(spokes)
  // Hub.
  cyl(0.022, 0.022, 0.07, m.chairRim, 0, 0, 0, g, 20).rotation.z = Math.PI / 2
  cyl(0.03, 0.03, 0.012, m.chairFrame, 0.03, 0, 0, g, 20).rotation.z = Math.PI / 2
  cyl(0.03, 0.03, 0.012, m.chairFrame, -0.03, 0, 0, g, 20).rotation.z = Math.PI / 2
  return g
}

function handRim(m: Pal) {
  const g = new THREE.Group()
  const ring = mesh(new THREE.TorusGeometry(CHAIR.rimR, 0.0095, 10, 64), m.chairRim, 0, 0, 0, g)
  ring.rotation.y = Math.PI / 2
  // Stand-offs to the wheel.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const st = cyl(0.004, 0.004, 0.03, m.chairRim, 0, Math.sin(a) * CHAIR.rimR, Math.cos(a) * CHAIR.rimR, g, 6)
    st.rotation.z = Math.PI / 2
  }
  return g
}

function caster(m: Pal) {
  const g = new THREE.Group()
  const C = CHAIR
  const w = mesh(new THREE.TorusGeometry(C.casterR - 0.008, 0.012, 8, 24), m.chairTire, 0, C.casterR, 0, g)
  w.rotation.y = Math.PI / 2
  cyl(0.02, 0.02, 0.026, m.chairPlastic, 0, C.casterR, 0, g, 14).rotation.z = Math.PI / 2
  // Fork and stem up to the frame.
  for (const s of [-1, 1]) rbox(0.006, 0.075, 0.022, m.chairFrame, s * 0.02, C.casterR + 0.03, -0.012, g, 0.002)
  rbox(0.05, 0.012, 0.03, m.chairFrame, 0, C.casterR + 0.07, -0.012, g, 0.003)
  cyl(0.011, 0.011, 0.07, m.chairFrame, 0, C.casterR + 0.11, -0.012, g, 12)
  return g
}

export class Wheelchair {
  readonly root = new THREE.Group()
  readonly wheels: THREE.Group[] = []
  readonly rims: THREE.Group[] = []
  private meshes: THREE.Mesh[] = []
  readonly decal: THREE.Texture

  constructor(m: Pal) {
    const C = CHAIR
    const g = this.root
    this.decal = fleetDecal()
    // Rear wheels with a little camber, hand rims outside them.
    for (const s of [-1, 1]) {
      const holder = new THREE.Group()
      holder.position.set(s * C.wheelX, C.wheelR, C.axleZ)
      holder.rotation.z = s * 0.05
      g.add(holder)
      const w = wheel(m)
      holder.add(w)
      this.wheels.push(w)
      const r = handRim(m)
      r.position.x = s * (C.rimX - C.wheelX)
      w.add(r)
      this.rims.push(r)
      // Axle receiver plate on the frame.
      rbox(0.012, 0.09, 0.07, m.chairFrame, s * (C.seatW / 2 + 0.035), C.wheelR + 0.02, C.axleZ, g, 0.004)
    }
    // Rigid frame: one bent tube each side — from the backrest down along the seat rail to the footplate.
    for (const s of [-1, 1]) {
      const x = s * (C.seatW / 2 + 0.012)
      tube(
        [
          [x, C.backTop - 0.01, C.axleZ - 0.06],
          [x, C.seatY - 0.02, C.axleZ - 0.02],
          [x, C.seatY - 0.06, C.axleZ + 0.06],
          [x, C.seatY - 0.07, 0.14],
          [x * 0.85, C.seatY - 0.14, C.casterZ + 0.02],
          [x * 0.6, C.footY + 0.06, C.footZ - 0.06],
          [x * 0.55, C.footY, C.footZ - 0.02],
        ],
        0.0135,
        m.chairFrame,
        g,
        40,
      )
      // Caster housing on the frame, the caster under it.
      const c = caster(m)
      c.position.set(s * C.casterX, 0, C.casterZ)
      g.add(c)
      cyl(0.016, 0.016, 0.03, m.chairFrame, s * C.casterX, C.casterR + 0.155, C.casterZ - 0.012, g, 12)
      tube(
        [
          [s * C.casterX, C.casterR + 0.17, C.casterZ - 0.012],
          [x * 0.92, C.seatY - 0.12, C.casterZ - 0.01],
        ],
        0.009,
        m.chairFrame,
        g,
        6,
      )
      // Side guard: a curved panel over the top-front of the wheel.
      const guard = new THREE.Group()
      guard.position.set(s * (C.seatW / 2 + 0.028), C.seatY + 0.005, C.axleZ + 0.04)
      g.add(guard)
      // Low (7.5 cm over the seat) and short (the axle to the seat front): it stays under the desk's
      // sight line. The panel's x runs to the chair's rear on the +x side and to its front on the −x side.
      const [x0, x1] = s > 0 ? [-0.24, 0.08] : [-0.08, 0.24]
      const shape = new THREE.Shape()
      shape.moveTo(x0, 0)
      shape.lineTo(x1, 0)
      shape.quadraticCurveTo(x1 + 0.005, 0.06, x1 - 0.04, 0.075)
      shape.lineTo(x0 + 0.04, 0.075)
      shape.quadraticCurveTo(x0 - 0.005, 0.06, x0, 0)
      const panel = new THREE.ShapeGeometry(shape, 12)
      const uv = panel.attributes.uv as THREE.BufferAttribute
      const pos = panel.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - x0) / (x1 - x0), pos.getY(i) / 0.075)
      const mat = s > 0 ? new THREE.MeshStandardMaterial({ map: this.decal, roughness: 0.5, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ color: 0x26282c, roughness: 0.5, side: THREE.DoubleSide })
      const pm = mesh(panel, mat, 0, 0, 0, guard)
      pm.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2
      this.meshes.push(pm)
    }
    // Cross tube under the seat, seat sling and cushion.
    tube(
      [
        [-(C.seatW / 2 + 0.012), C.seatY - 0.07, 0.1],
        [C.seatW / 2 + 0.012, C.seatY - 0.07, 0.1],
      ],
      0.011,
      m.chairFrame,
      g,
      4,
    )
    rbox(C.seatW, 0.05, C.seatD, m.chairSeat, 0, C.seatY - 0.03, -0.01, g, 0.018).rotation.x = 0.05
    // Low backrest: tension-adjustable upholstery between the back posts.
    const back = rbox(C.seatW + 0.02, C.backTop - C.seatY - 0.02, 0.035, m.chairSeat, 0, (C.backTop + C.seatY) / 2, C.axleZ - 0.07, g, 0.012)
    back.rotation.x = -0.1
    // The single footplate.
    rbox(0.24, 0.012, 0.12, m.chairPlastic, 0, C.footY - 0.004, C.footZ - 0.04, g, 0.004)
    for (const s of [-1, 1]) {
      // Anti-tip bar behind the axle, low.
      tube(
        [
          [s * (C.seatW / 2 + 0.012), C.wheelR - 0.02, C.axleZ - 0.04],
          [s * (C.seatW / 2 - 0.01), 0.08, C.axleZ - 0.25],
        ],
        0.008,
        m.chairFrame,
        g,
        4,
      )
      cyl(0.022, 0.022, 0.02, m.chairTire, s * (C.seatW / 2 - 0.01), 0.06, C.axleZ - 0.26, g, 12).rotation.z = Math.PI / 2
    }
    g.traverse((o) => {
      const me = o as THREE.Mesh
      if (me.isMesh) {
        me.castShadow = true
        me.receiveShadow = true
        this.meshes.push(me)
      }
    })
  }

  /**
   * Eren's olive parka, draped over the low backrest (it is not the chair: it hides the backrest
   * from the room until the reveal, as a coat on a chair would). Chair-local, under `root`.
   */
  readonly parka = new THREE.Group()

  dressParka(m: Pal) {
    const C = CHAIR
    const g = this.parka
    const z = C.axleZ - 0.085
    const top = C.backTop + 0.02
    // The fold over the top of the backrest.
    const fold = new THREE.CapsuleGeometry(0.045, 0.34, 6, 16)
    fold.rotateZ(Math.PI / 2)
    fold.scale(1, 0.85, 1.25)
    mesh(fold, m.parkaOlive, 0, top - 0.012, z - 0.005, g)
    // The back of the coat hanging behind the backrest, a little wider at the hem.
    const back = new THREE.BoxGeometry(0.44, 0.5, 0.06, 6, 8, 2)
    const pos = back.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (0.25 - y) / 0.5
      pos.setX(i, pos.getX(i) * (0.92 + 0.16 * t) + Math.sin(y * 19 + pos.getX(i) * 7) * 0.006)
      pos.setZ(i, pos.getZ(i) - 0.035 * t * t + Math.sin(pos.getX(i) * 23) * 0.006 * t)
    }
    back.computeVertexNormals()
    mesh(back, m.parkaOlive, 0, top - 0.26, z - 0.05, g).rotation.x = 0.08
    // Its front halves hang between the backrest and his back, down to the seat.
    const front = new THREE.BoxGeometry(0.42, 0.22, 0.03, 4, 4, 1)
    const fp = front.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < fp.count; i++) fp.setZ(i, fp.getZ(i) + Math.sin(fp.getX(i) * 18) * 0.004 + (fp.getY(i) < 0 ? 0.008 : 0))
    front.computeVertexNormals()
    mesh(front, m.parkaOlive, 0, top - 0.115, z + 0.035, g)
    // The hood, bunched at the top.
    const hood = mesh(new THREE.SphereGeometry(0.1, 16, 10), m.parkaOlive, 0.02, top - 0.03, z - 0.09, g)
    hood.scale.set(1.25, 0.65, 0.8)
    // Sleeves hanging down at the sides of the backrest.
    for (const s of [-1, 1]) {
      const sl = mesh(new THREE.CapsuleGeometry(0.045, 0.3, 4, 10), m.parkaOlive, s * 0.215, top - 0.2, z - 0.035, g)
      sl.rotation.set(0.12, 0, s * 0.08)
    }
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    this.root.add(g)
  }

  /** Rolls the wheels (radians of rotation for a distance traveled). */
  roll(dist: number) {
    const a = dist / CHAIR.wheelR
    for (const w of this.wheels) w.rotation.x = a
  }

  /** The chair's shadow (off before the reveal: nothing of it may reach the frame). */
  setShadows(on: boolean) {
    for (const m of this.meshes) m.castShadow = on
  }

  /** Every mesh, for the twist check (rendered flat magenta in the sweep). */
  get parts() {
    return this.meshes
  }
}
