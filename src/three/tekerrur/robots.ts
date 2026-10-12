/**
 * The three robots: the same rounded body on a hidden base (they glide, never
 * bump), a white status ring at the floor. KAHVE carries a tray with a white
 * coffee set; ATIŞTIRMALIK a bowl of nuts and a plate of dried fruit; KAYIT
 * carries nothing — a slim neck, a small head, one lens with a white light at
 * its rim that never goes out.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { cyl, mesh } from '../util'
import { rbox, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'

export type RobotKind = 'coffee' | 'snack' | 'recorder'

const shellMats = () => ({
  shell: pbr('plastic', 0x9c968c, { roughness: 0.55 }),
  dark: pbr('plastic', 0x24252a, { roughness: 0.6 }),
  rubber: pbr('rubber', 0x151516),
  ceramic: pbr('ceramic', 0xf1eee8, { roughness: 0.25 }),
  coffee: new THREE.MeshStandardMaterial({ color: 0x2a160b, roughness: 0.08 }),
  nut: pbr('wood', 0x9a6a3e, { roughness: 0.7 }),
  fruit: new THREE.MeshStandardMaterial({ color: 0xa8582a, roughness: 0.6 }),
  fruit2: new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 0.6 }),
  lensGlass: new THREE.MeshPhysicalMaterial({ color: 0x050608, roughness: 0.04, metalness: 0.2, clearcoat: 1, envMapIntensity: 2 }),
  metal: pbr('metal', 0x606469, { roughness: 0.35 }),
})
let shared: ReturnType<typeof shellMats> | null = null

export class Robot {
  readonly group = new THREE.Group()
  readonly trayG = new THREE.Group()
  readonly head = new THREE.Group()
  readonly tilt = new THREE.Group()
  readonly ringMat: THREE.MeshBasicMaterial
  readonly rim = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(3) })
  /** World anchors for the cup on the tray, and the lens. */
  readonly cupSpot = new THREE.Object3D()
  readonly lens = new THREE.Object3D()
  cup: THREE.Group | null = null
  x = 0
  z = 0
  yaw = 0
  rise = 0
  trayTilt = 0

  constructor(readonly kind: RobotKind) {
    shared ??= shellMats()
    const m = shared
    const g = this.group
    const h = kind === 'snack' ? 0.9 : 0.95
    // Skirt and the status ring at the floor.
    cyl(0.2, 0.205, 0.07, m.rubber, 0, 0.045, 0, g, 40)
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const ring = mesh(new THREE.TorusGeometry(0.2, 0.006, 6, 56), this.ringMat, 0, 0.085, 0, g)
    ring.rotation.x = Math.PI / 2
    // The body: a soft tapered drum.
    const top = kind === 'recorder' ? 0.74 : h - 0.12
    const body = turned(
      [
        [0.0, 0.09],
        [0.19, 0.09],
        [0.192, 0.14],
        [0.186, top * 0.55],
        [0.168, top - 0.03],
        [0.15, top],
        [0.0, top],
      ],
      m.shell,
      48,
      g,
    )
    body.castShadow = true
    body.receiveShadow = true
    // A seam line and a small panel on the front.
    const seam = mesh(new THREE.TorusGeometry(0.187, 0.002, 4, 48), m.dark, 0, top * 0.5, 0, g)
    seam.rotation.x = Math.PI / 2
    rbox(0.08, 0.02, 0.006, m.dark, 0, top * 0.72, 0.172, g, 0.003)
    if (kind !== 'recorder') {
      // Telescoping column and the round tray.
      cyl(0.05, 0.06, 0.08, m.dark, 0, top + 0.03, 0, g, 24)
      g.add(this.trayG)
      this.trayG.position.y = top + 0.06
      this.trayG.add(this.tilt)
      cyl(0.035, 0.035, 0.3, m.metal, 0, -0.15, 0, this.tilt, 16)
      const tray = turned(
        [
          [0.0, 0.0],
          [0.21, 0.0],
          [0.212, 0.03],
          [0.2, 0.03],
          [0.198, 0.012],
          [0.0, 0.012],
        ],
        m.shell,
        48,
        this.tilt,
      )
      tray.castShadow = true
      tray.receiveShadow = true
      if (kind === 'coffee') {
        // Pot, sugar bowl, and the cup on its saucer.
        const pot = turned(
          [
            [0.0, 0.0],
            [0.05, 0.0],
            [0.062, 0.05],
            [0.055, 0.12],
            [0.03, 0.15],
            [0.034, 0.165],
            [0.0, 0.17],
          ],
          m.ceramic,
          32,
          this.tilt,
        )
        pot.position.set(-0.08, 0.012, -0.06)
        const spout = cyl(0.008, 0.013, 0.08, m.ceramic, -0.02, 0.1, -0.06, this.tilt, 10)
        spout.rotation.z = -0.9
        const handle = mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 14, Math.PI), m.ceramic, -0.14, 0.08, -0.06, this.tilt)
        handle.rotation.z = Math.PI / 2
        const sugar = turned(
          [
            [0, 0],
            [0.03, 0],
            [0.035, 0.04],
            [0, 0.045],
          ],
          m.ceramic,
          24,
          this.tilt,
        )
        sugar.position.set(-0.06, 0.012, 0.09)
        this.cupSpot.position.set(0.08, 0.012, 0.04)
        this.tilt.add(this.cupSpot)
        const saucer = turned(
          [
            [0, 0],
            [0.06, 0.002],
            [0.07, 0.012],
            [0.066, 0.014],
            [0, 0.008],
          ],
          m.ceramic,
          28,
          this.tilt,
        )
        saucer.position.copy(this.cupSpot.position)
        this.cup = cupGroup(m.ceramic, m.coffee)
      } else {
        const bowl = turned(
          [
            [0, 0],
            [0.04, 0],
            [0.075, 0.035],
            [0.08, 0.05],
            [0.076, 0.05],
            [0.071, 0.038],
            [0, 0.012],
          ],
          m.ceramic,
          32,
          this.tilt,
        )
        bowl.position.set(-0.07, 0.012, 0)
        const rand = mulberry32(9)
        const nutGeo = new THREE.SphereGeometry(0.011, 8, 6)
        nutGeo.scale(1, 0.7, 1.4)
        const nuts = new THREE.InstancedMesh(nutGeo, m.nut, 22)
        const d = new THREE.Object3D()
        for (let i = 0; i < 22; i++) {
          const a = rand() * Math.PI * 2
          const r = Math.sqrt(rand()) * 0.055
          d.position.set(-0.07 + Math.cos(a) * r, 0.04 + rand() * 0.012, Math.sin(a) * r)
          d.rotation.set(rand() * 3, rand() * 3, rand() * 3)
          d.updateMatrix()
          nuts.setMatrixAt(i, d.matrix)
        }
        this.tilt.add(nuts)
        const plate = cyl(0.075, 0.07, 0.01, m.ceramic, 0.09, 0.018, 0.02, this.tilt, 32)
        plate.receiveShadow = true
        const fruitGeo = new THREE.SphereGeometry(0.018, 10, 8)
        fruitGeo.scale(1.2, 0.45, 1)
        for (let i = 0; i < 9; i++) {
          const a = rand() * Math.PI * 2
          const r = Math.sqrt(rand()) * 0.05
          const f = mesh(fruitGeo, i % 3 ? m.fruit : m.fruit2, 0.09 + Math.cos(a) * r, 0.03 + rand() * 0.006, 0.02 + Math.sin(a) * r, this.tilt)
          f.rotation.set(rand() * 0.4, rand() * 6, rand() * 0.4)
        }
      }
    } else {
      // Neck, head, the single lens.
      cyl(0.022, 0.03, 0.17, m.metal, 0, top + 0.08, 0, g, 16)
      this.head.position.y = 0.95
      g.add(this.head)
      this.head.add(this.tilt)
      const shellHead = rbox(0.14, 0.1, 0.13, m.shell, 0, 0, -0.01, this.tilt, 0.035)
      shellHead.castShadow = true
      rbox(0.12, 0.012, 0.11, m.dark, 0, 0.052, -0.012, this.tilt, 0.005)
      const barrel = cyl(0.036, 0.04, 0.03, m.dark, 0, 0, 0.065, this.tilt, 32)
      barrel.rotation.x = Math.PI / 2
      const glass = mesh(new THREE.CircleGeometry(0.03, 32), m.lensGlass, 0, 0, 0.0805, this.tilt)
      glass.name = 'lens'
      const bezel = mesh(new THREE.TorusGeometry(0.031, 0.004, 8, 32), m.metal, 0, 0, 0.0805, this.tilt)
      bezel.name = 'lens-bezel'
      mesh(new THREE.SphereGeometry(0.0045, 10, 8), this.rim, 0.027, 0.026, 0.078, this.tilt)
      this.lens.position.set(0, 0, 0.09)
      this.tilt.add(this.lens)
    }
    g.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh && mm.material !== this.ringMat && mm.material !== this.rim) mm.castShadow = true
    })
  }

  place(x: number, z: number, yaw: number) {
    this.x = x
    this.z = z
    this.yaw = yaw
    this.group.position.set(x, 0, z)
    this.group.rotation.y = yaw
    return this
  }

  setTray(rise: number, tilt = 0) {
    this.rise = rise
    this.trayTilt = tilt
    if (this.kind === 'recorder') return
    this.trayG.position.y = (this.kind === 'snack' ? 0.78 : 0.83) + 0.06 + rise
    this.tilt.rotation.z = tilt
  }

  /** Ring brightness 0–1. */
  setRing(level: number) {
    this.ringMat.color.setScalar(0.05 + 2.2 * level)
  }

  /** Turns the recorder's head to look at a world point (yaw within the body, pitch). */
  aim(target: THREE.Vector3, weight = 1, extraYaw = 0) {
    if (this.kind !== 'recorder') return
    this.group.updateMatrixWorld(true)
    const local = this.group.worldToLocal(target.clone())
    const dy = local.y - 0.95
    const yaw = Math.atan2(local.x, local.z)
    const pitch = -Math.atan2(dy, Math.hypot(local.x, local.z))
    this.head.rotation.y = yaw * weight + extraYaw
    this.tilt.rotation.x = pitch * weight
  }
}

/** A white cup (handle toward +x) with coffee, origin at its foot. */
export function cupGroup(ceramic: THREE.Material, coffee: THREE.Material) {
  const g = new THREE.Group()
  turned(
    [
      [0.0, 0.0],
      [0.025, 0.0],
      [0.03, 0.006],
      [0.036, 0.04],
      [0.038, 0.062],
      [0.035, 0.062],
      [0.033, 0.04],
      [0.0, 0.01],
    ],
    ceramic,
    28,
    g,
  ).castShadow = true
  const surf = mesh(new THREE.CircleGeometry(0.033, 24), coffee, 0, 0.052, 0, g)
  surf.rotation.x = -Math.PI / 2
  const handle = mesh(new THREE.TorusGeometry(0.016, 0.004, 6, 14, Math.PI * 1.2), ceramic, 0.04, 0.034, 0, g)
  handle.rotation.z = -Math.PI * 0.6
  return g
}
