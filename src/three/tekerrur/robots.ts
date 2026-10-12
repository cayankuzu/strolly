/**
 * The three robots: the same rounded body on a wheeled base (they glide,
 * never bump), a white status ring at the floor, a dark visor with two small
 * white "eyes" that tells the reader at a glance these are machines that
 * look. KAHVE carries a tray with a white coffee set; ATIŞTIRMALIK a bowl of
 * nuts and a plate of dried fruit; KAYIT carries nothing — a slim neck, a
 * yoke, a small camera head with one lens and a white light at its rim that
 * never goes out.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { cyl, mesh } from '../util'
import { rbox, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'

export type RobotKind = 'coffee' | 'snack' | 'recorder'

/** A soft round contact shadow (shared by the three). */
function contactTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 10, 64, 64, 63)
  grad.addColorStop(0, 'rgba(0,0,0,0.62)')
  grad.addColorStop(0.55, 'rgba(0,0,0,0.38)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const shellMats = () => ({
  shell: pbr('plastic', 0xb3ada2, { roughness: 0.42 }),
  shellDark: pbr('plastic', 0x8d877d, { roughness: 0.5 }),
  dark: pbr('plastic', 0x1d1e22, { roughness: 0.55 }),
  visor: new THREE.MeshPhysicalMaterial({ color: 0x07080a, roughness: 0.12, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.6 }),
  rubber: pbr('rubber', 0x151516),
  ceramic: pbr('ceramic', 0xf1eee8, { roughness: 0.25 }),
  coffee: new THREE.MeshStandardMaterial({ color: 0x2a160b, roughness: 0.08 }),
  nut: pbr('wood', 0x9a6a3e, { roughness: 0.7 }),
  fruit: new THREE.MeshStandardMaterial({ color: 0xa8582a, roughness: 0.6 }),
  fruit2: new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 0.6 }),
  lensGlass: new THREE.MeshPhysicalMaterial({ color: 0x050608, roughness: 0.04, metalness: 0.2, clearcoat: 1, envMapIntensity: 2 }),
  metal: pbr('metal', 0x7a7e84, { roughness: 0.3 }),
  contact: new THREE.MeshBasicMaterial({ map: contactTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }),
})
let shared: ReturnType<typeof shellMats> | null = null

export class Robot {
  readonly group = new THREE.Group()
  readonly trayG = new THREE.Group()
  readonly head = new THREE.Group()
  readonly tilt = new THREE.Group()
  readonly ringMat: THREE.MeshBasicMaterial
  readonly rim = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(3) })
  /** The two small eyes on the visor (and the recorder's status bar): dim with the rings. */
  readonly eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(2) })
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
    g.name = `robot-${kind}`
    const h = kind === 'snack' ? 0.9 : 0.95
    // Contact shadow, skirt, three casters peeking out, and the status ring at the floor.
    const shadow = mesh(new THREE.CircleGeometry(0.3, 32), m.contact, 0, 0.003, 0, g)
    shadow.rotation.x = -Math.PI / 2
    cyl(0.2, 0.205, 0.07, m.rubber, 0, 0.045, 0, g, 40)
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6
      const wheel = cyl(0.032, 0.032, 0.026, m.dark, Math.sin(a) * 0.165, 0.032, Math.cos(a) * 0.165, g, 16)
      wheel.rotation.set(0, a, Math.PI / 2)
      cyl(0.012, 0.012, 0.03, m.metal, Math.sin(a) * 0.165, 0.032, Math.cos(a) * 0.165, g, 8).rotation.set(0, a, Math.PI / 2)
    }
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const ring = mesh(new THREE.TorusGeometry(0.2, 0.006, 6, 56), this.ringMat, 0, 0.085, 0, g)
    ring.rotation.x = Math.PI / 2
    // The body: a soft tapered drum with a rubber bumper low down.
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
    const bumper = mesh(new THREE.TorusGeometry(0.193, 0.012, 8, 56), m.rubber, 0, 0.165, 0, g)
    bumper.rotation.x = Math.PI / 2
    // A seam line, a darker lower shell band, side vents and a service panel.
    const seam = mesh(new THREE.TorusGeometry(0.187, 0.002, 4, 48), m.dark, 0, top * 0.5, 0, g)
    seam.rotation.x = Math.PI / 2
    for (const sx of [-1, 1])
      for (let k = 0; k < 4; k++) {
        const vent = rbox(0.006, 0.012, 0.07, m.dark, sx * 0.19, top * 0.36 + k * 0.026, 0, g, 0.003)
        vent.rotation.z = sx * 0.04
      }
    rbox(0.09, 0.05, 0.006, m.shellDark, 0, top * 0.34, 0.19, g, 0.004)
    // The visor: a band of dark glass wrapped round the front, two small white eyes on it.
    const vy = top * 0.79
    const visor = mesh(new THREE.CylinderGeometry(0.177, 0.181, 0.085, 40, 1, true, -0.78, 1.56), m.visor, 0, vy, 0, g)
    visor.name = `robot-${kind}-visor`
    const eye = new THREE.CapsuleGeometry(0.0075, kind === 'recorder' ? 0.07 : 0.012, 4, 8)
    eye.rotateZ(Math.PI / 2)
    if (kind === 'recorder') {
      // A single status bar under the camera head.
      const bar = mesh(eye, this.eyeMat, 0, vy, 0.182, g)
      bar.scale.set(1, 1, 0.5)
    } else
      for (const sx of [-1, 1]) {
        const e = mesh(eye, this.eyeMat, sx * 0.045, vy + 0.004, 0.18, g)
        e.rotation.y = sx * 0.25
        e.scale.set(1, 1, 0.5)
      }
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
      const lip = mesh(new THREE.TorusGeometry(0.207, 0.004, 6, 48), m.dark, 0, 0.03, 0, this.tilt)
      lip.rotation.x = Math.PI / 2
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
        this.cup.name = 'coffee-cup'
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
      // Neck collar, neck, a yoke holding the camera head.
      cyl(0.06, 0.07, 0.03, m.dark, 0, top + 0.012, 0, g, 24)
      cyl(0.022, 0.03, 0.15, m.metal, 0, top + 0.09, 0, g, 16)
      this.head.position.y = 0.95
      g.add(this.head)
      // The yoke turns with the head (yaw); the head tilts inside it.
      rbox(0.2, 0.016, 0.05, m.dark, 0, -0.07, -0.01, this.head, 0.006)
      for (const sx of [-1, 1]) {
        rbox(0.014, 0.08, 0.05, m.dark, sx * 0.093, -0.035, -0.01, this.head, 0.005)
        cyl(0.018, 0.018, 0.012, m.metal, sx * 0.088, 0, -0.01, this.head, 16).rotation.z = Math.PI / 2
      }
      this.head.add(this.tilt)
      const shellHead = rbox(0.15, 0.105, 0.14, m.shell, 0, 0, -0.012, this.tilt, 0.036)
      shellHead.castShadow = true
      shellHead.name = 'recorder-head'
      rbox(0.13, 0.012, 0.12, m.dark, 0, 0.055, -0.014, this.tilt, 0.005)
      // The lens: a barrel, its hood, the glass, a bezel, the white rim light.
      const barrel = cyl(0.038, 0.042, 0.035, m.dark, 0, 0, 0.07, this.tilt, 32)
      barrel.rotation.x = Math.PI / 2
      const hood = cyl(0.045, 0.04, 0.012, m.dark, 0, 0, 0.092, this.tilt, 32)
      hood.rotation.x = Math.PI / 2
      const glass = mesh(new THREE.CircleGeometry(0.031, 32), m.lensGlass, 0, 0, 0.0895, this.tilt)
      glass.name = 'lens'
      const bezel = mesh(new THREE.TorusGeometry(0.032, 0.004, 8, 32), m.metal, 0, 0, 0.0895, this.tilt)
      bezel.name = 'lens-bezel'
      mesh(new THREE.SphereGeometry(0.005, 10, 8), this.rim, 0.03, 0.03, 0.086, this.tilt)
      // A short antenna with a small ball tip.
      cyl(0.003, 0.003, 0.09, m.metal, -0.05, 0.1, -0.04, this.tilt, 6)
      mesh(new THREE.SphereGeometry(0.008, 10, 8), m.dark, -0.05, 0.147, -0.04, this.tilt)
      this.lens.position.set(0, 0, 0.1)
      this.tilt.add(this.lens)
    }
    g.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh && mm.material !== this.ringMat && mm.material !== this.rim && mm.material !== this.eyeMat && mm.material !== m.contact) mm.castShadow = true
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

  /** Ring brightness 0–1 (the eyes follow it, a little brighter). */
  setRing(level: number) {
    this.ringMat.color.setScalar(0.05 + 2.2 * level)
    this.eyeMat.color.setScalar(0.35 + 1.8 * level)
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
