/**
 * Arif's room (10 × 10 m, ceiling 4.6, origin at its centre) and the walkway
 * beyond the right door (x 5…9). Planks meet the screens directly; the two
 * doors are screens in raw concrete portals; the desk is a slab of dark
 * glass with three giant screens and one black button.
 *
 * Everything that moves or changes is exposed for the director: the door
 * leaves, the screens' canvases, the button's ring, the cloths, the lights.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { officeChair, rbox, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'
import type { BuildContext } from '../kit/SetScene'
import { forestMaterial, screenAttributes, screenQuad, wallTones, type ForestUniforms } from './forest'

export const DESK = { y: 0.77, w: 3.4, d: 1.5 }
export const CHAIR_IN = { x: 0, z: 1.05 }
export const CHAIR_OUT = { x: 0, z: 1.35 }
export const BUTTON = new THREE.Vector3(0, 0.79, -0.32)
export const BOX = new THREE.Vector3(4.3, 0, -4.3)
export const MARKS = { coffee: [0.95, 1.45], snack: [-0.95, 1.6], recorder: [-3.2, 0.35] } as const
export const NICHES = { coffee: [6.4, 1.15], snack: [7.2, 1.15], recorder: [8.0, 1.15] } as const
export const SWITCH = new THREE.Vector3(-5.7, 1.3, -1.25)
export const CENTER_SCREEN = { pos: new THREE.Vector3(0, 1.575, -0.6), w: 2.2, h: 1.25 }
export const SIDE_SCREEN = { w: 1.9, h: 1.1, y: 1.58, x: 2.15, z: -0.25, yaw: 0.436 }

export type ScreenSet = {
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
  key: string
}

function makeScreen(w: number, h: number, px: number, frame: THREE.Material, glassTint = 0x040506): ScreenSet & { group: THREE.Group } {
  const group = new THREE.Group()
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = Math.round((px * h) / w)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const material = new THREE.MeshStandardMaterial({ color: glassTint, roughness: 0.07, metalness: 0.0, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 0, envMapIntensity: 1.4 })
  // Body and a thin bezel; the glass sits a hair in front of the body.
  rbox(w + 0.03, h + 0.03, 0.045, frame, 0, 0, -0.025, group, 0.008)
  const m = mesh(new THREE.PlaneGeometry(w, h), material, 0, 0, 0.0005, group)
  return { group, mesh: m, material, canvas, ctx, texture, key: '' }
}

/** A balled-up cloth: a lumpy sphere. */
function clothGeometry(seed: number, r = 0.075) {
  const g = new THREE.IcosahedronGeometry(r, 2)
  const p = g.attributes.position as THREE.BufferAttribute
  const rand = mulberry32(seed)
  const bumps = Array.from({ length: 7 }, () => [new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), 0.12 + rand() * 0.25] as const)
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = v.clone().normalize()
    let k = 1
    for (const [b, a] of bumps) k += a * Math.pow(Math.max(0, n.dot(b)), 3) - 0.06
    v.multiplyScalar(k)
    v.y *= 0.72
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export class RoomSet {
  readonly group = new THREE.Group()
  readonly walkway = new THREE.Group()
  forest!: THREE.ShaderMaterial & { uniforms: ForestUniforms }
  walkForest!: THREE.ShaderMaterial & { uniforms: ForestUniforms }
  tones: THREE.Color[] = []
  rightLeaf = new THREE.Group()
  leftLeaf = new THREE.Group()
  endLeaf = new THREE.Group()
  center!: ScreenSet & { group: THREE.Group }
  left!: ScreenSet & { group: THREE.Group }
  right!: ScreenSet & { group: THREE.Group }
  ring!: THREE.MeshBasicMaterial
  buttonCap!: THREE.Mesh
  chair = new THREE.Group()
  /** The folded cloth under the seat, the one in his hand, the one in flight, the ones in the box. */
  clothFolded!: THREE.Mesh
  clothHand!: THREE.Mesh
  clothFly!: THREE.Mesh
  clothTop!: THREE.Mesh
  boxCloths!: THREE.InstancedMesh
  extraCloth!: THREE.Mesh
  touch!: THREE.Mesh
  touchCtx!: CanvasRenderingContext2D
  touchTex!: THREE.CanvasTexture
  touchKey = ''
  window!: THREE.Mesh
  windowMat!: THREE.MeshBasicMaterial
  strip!: THREE.MeshBasicMaterial
  lampBulb!: THREE.Mesh
  /** The bulb's place in the world (the lamp never moves). */
  lampAt = new THREE.Vector3(-1.34, 1.24, -0.23)
  lampModel: THREE.Group | null = null
  waterMat!: THREE.ShaderMaterial
  marks: THREE.Mesh[] = []
  scanMat!: THREE.MeshBasicMaterial
  bezelMat!: THREE.MeshStandardMaterial

  async build(scene: THREE.Scene, ctx: BuildContext) {
    const g = this.group
    scene.add(g)
    const [pano, models] = await Promise.all([
      ctx.panorama('xanderklinge'),
      ctx.models({
        lamp: ['desk_lamp_arm_01', { height: 0.62 }],
        fern: ['fern_02', { ground: false }],
      }),
    ])
    this.forest = forestMaterial(pano)
    this.forest.side = THREE.DoubleSide
    this.tones = wallTones(pano)
    const F = this.forest

    // ——— Materials ———
    const oak = pbr('planks', 0xb48a5e, { roughness: 0.82, scale: 0.75 })
    const concrete = pbr('concrete', 0x8e8b86, { roughness: 1, scale: 1.4 })
    const steel = pbr('metal', 0x7d8186, { roughness: 0.45 })
    const darkSteel = pbr('metal', 0x2c2e31, { roughness: 0.5 })
    const charcoal = pbr('painted', 0x1d1e20, { roughness: 0.75 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x07090a, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2 })
    const clothMat = pbr('fabric', 0x8a8c8e, { roughness: 1 })
    const boxWood = pbr('wood', 0xa27a52, { roughness: 0.8 })
    this.bezelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6 })

    // ——— Floor: oak planks along z, straight into the screens ———
    const floor = mesh(new THREE.PlaneGeometry(10, 10), oak, 0, 0, 0, g)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    // Worn circles where the robots always stop.
    const wornTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 256
      const x = c.getContext('2d')!
      const grad = x.createRadialGradient(128, 128, 60, 128, 128, 126)
      grad.addColorStop(0, 'rgba(255,240,215,0.0)')
      grad.addColorStop(0.55, 'rgba(255,236,205,0.22)')
      grad.addColorStop(0.8, 'rgba(255,236,205,0.34)')
      grad.addColorStop(1, 'rgba(255,236,205,0)')
      x.fillStyle = grad
      x.fillRect(0, 0, 256, 256)
      const rand = mulberry32(5)
      x.strokeStyle = 'rgba(255,240,220,0.18)'
      for (let i = 0; i < 90; i++) {
        const a = rand() * Math.PI * 2
        const r = 70 + rand() * 50
        x.beginPath()
        x.arc(128, 128, r, a, a + 0.2 + rand() * 0.5)
        x.stroke()
      }
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })()
    const wornMat = new THREE.MeshStandardMaterial({ map: wornTex, transparent: true, depthWrite: false, roughness: 0.5, color: 0xffffff, polygonOffset: true, polygonOffsetFactor: -2 })
    for (const [x, z] of Object.values(MARKS)) {
      const m = mesh(new THREE.CircleGeometry(0.26, 40), wornMat, x, 0.002, z, g)
      m.rotation.x = -Math.PI / 2
      m.receiveShadow = true
      this.marks.push(m)
    }

    // ——— The screens: four walls, the ceiling ———
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    const H = 4.6
    const wall = (corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3], face: number, su = 10, sv = 5) => mesh(screenQuad(corners, face, su, sv), F, 0, 0, 0, g)
    wall([V(-5, 0, -5), V(5, 0, -5), V(5, H, -5), V(-5, H, -5)], 0)
    wall([V(5, 0, 5), V(-5, 0, 5), V(-5, H, 5), V(5, H, 5)], 2)
    // Side walls with door openings (z ∈ [−0.7, 0.7], up to 2.8).
    for (const sx of [1, -1]) {
      const face = sx > 0 ? 1 : 3
      const x = sx * 5
      wall([V(x, 0, -5 * sx), V(x, 0, -0.7 * sx), V(x, H, -0.7 * sx), V(x, H, -5 * sx)], face, 5, 5)
      wall([V(x, 0, 0.7 * sx), V(x, 0, 5 * sx), V(x, H, 5 * sx), V(x, H, 0.7 * sx)], face, 5, 5)
      wall([V(x, 2.8, -0.7 * sx), V(x, 2.8, 0.7 * sx), V(x, H, 0.7 * sx), V(x, H, -0.7 * sx)], face, 2, 2)
    }
    const ceiling = mesh(screenQuad([V(-5, H, 5), V(5, H, 5), V(5, H, -5), V(-5, H, -5)], 4, 10, 10), F, 0, 0, 0, g)
    ceiling.name = 'ceiling'
    // Black bezels where screens meet.
    for (const [x, z, w, d] of [
      [0, -4.995, 10, 0.02],
      [0, 4.995, 10, 0.02],
      [-4.995, 0, 0.02, 10],
      [4.995, 0, 0.02, 10],
    ] as const)
      box(w, 0.025, d, this.bezelMat, x, H - 0.012, z, g)
    for (const [x, z] of [
      [-4.99, -4.99],
      [4.99, -4.99],
      [4.99, 4.99],
      [-4.99, 4.99],
    ])
      box(0.025, H, 0.025, this.bezelMat, x, H / 2, z, g)

    // ——— The doors: screen leaves in brutalist concrete portals ———
    const bolt = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6)
    bolt.rotateZ(Math.PI / 2)
    const portal = (sx: number) => {
      const x = sx * 5
      const p = new THREE.Group()
      g.add(p)
      // Jambs 0.25 wide, lintel, all 0.45 deep through the wall.
      const depth = 0.45
      const cx = x + sx * 0.08
      for (const sz of [-1, 1]) rbox(depth, 3.15, 0.25, concrete, cx, 1.575, sz * 0.825, p, 0.012).castShadow = true
      rbox(depth, 0.35, 1.9, concrete, cx, 2.975, 0, p, 0.012).castShadow = true
      // Exposed steel bolts on the room face.
      const face = x - sx * 0.145
      for (const sz of [-1, 1]) for (const y of [0.35, 1.2, 2.05, 2.75]) mesh(bolt, steel, face - sx * 0.008, y, sz * 0.825, p)
      for (const z of [-0.6, -0.2, 0.2, 0.6]) mesh(bolt, steel, face - sx * 0.008, 2.98, z, p)
      // Threshold plate.
      box(depth, 0.012, 1.4, darkSteel, cx, 0.006, 0, p)
      return p
    }
    portal(1)
    portal(-1)
    const leafBody = (pivot: THREE.Group, sx: number, hingeZ: number) => {
      // Leaf 1.4 × 2.8, 8 cm thick; the room side is a screen of the same forest.
      const dirZ = -Math.sign(hingeZ)
      pivot.position.set(sx * 5 + sx * 0.04, 0, hingeZ)
      g.add(pivot)
      const leaf = new THREE.Group()
      pivot.add(leaf)
      box(0.08, 2.79, 1.39, darkSteel, 0, 1.395, dirZ * 0.7, leaf)
      const geo = new THREE.PlaneGeometry(1.39, 2.79)
      geo.rotateY(sx > 0 ? -Math.PI / 2 : Math.PI / 2)
      geo.translate(-sx * 0.0405, 1.395, dirZ * 0.7)
      // Rest = the leaf's closed place in the room.
      const closed = new THREE.Matrix4().makeTranslation(sx * 5 + sx * 0.04, 0, hingeZ)
      screenAttributes(geo, closed, sx > 0 ? 1 : 3)
      mesh(geo, F, 0, 0, 0, leaf)
      // The heavy horizontal handle on the room side, near the free edge.
      const hz = dirZ * 1.15
      const hx = -sx * 0.1
      rbox(0.04, 0.05, 0.62, steel, hx, 1.05, hz, leaf, 0.012)
      for (const dz of [-0.26, 0.26]) rbox(0.07, 0.04, 0.04, steel, -sx * 0.06, 1.05, hz + dz, leaf, 0.008)
      // A pull plate on the far side.
      rbox(0.012, 0.3, 0.12, steel, sx * 0.046, 1.05, hz, leaf, 0.004)
      return leaf
    }
    leafBody(this.rightLeaf, 1, -0.7)
    leafBody(this.leftLeaf, -1, 0.7)
    // The wall between the room and the archive (seen from the archive side).
    const archWall = new THREE.Group()
    g.add(archWall)
    for (const sz of [-1, 1]) box(0.25, 14, 30, concrete, -5.42, 7, sz * (0.95 + 15), archWall).receiveShadow = true
    box(0.25, 11, 1.9, concrete, -5.42, 3.15 + 5.5, 0, archWall)

    // ——— The desk ———
    const deskG = new THREE.Group()
    g.add(deskG)
    const top = mesh(new THREE.BoxGeometry(DESK.w, 0.04, DESK.d), glass, 0, DESK.y - 0.02, 0, deskG)
    top.castShadow = true
    top.receiveShadow = true
    for (const sx of [-1, 1]) {
      const leg = rbox(0.07, DESK.y - 0.04, 1.25, charcoal, sx * 1.32, (DESK.y - 0.04) / 2, -0.02, deskG, 0.01)
      leg.castShadow = true
      leg.receiveShadow = true
    }
    // An apron under the glass and the warm LED strip under its front lip.
    rbox(2.6, 0.06, 0.04, charcoal, 0, DESK.y - 0.07, -0.66, deskG, 0.006)
    rbox(2.5, 0.05, 0.05, charcoal, 0, DESK.y - 0.065, 0.66, deskG, 0.006)
    this.strip = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.62, 0.3).multiplyScalar(2.2) })
    box(2.4, 0.008, 0.012, this.strip, 0, DESK.y - 0.092, 0.69, deskG)
    // The touch surface: faint glyphs under the glass.
    const tc = document.createElement('canvas')
    tc.width = 1024
    tc.height = 452
    this.touchCtx = tc.getContext('2d')!
    this.touchTex = new THREE.CanvasTexture(tc)
    this.touchTex.colorSpace = THREE.SRGBColorSpace
    this.touch = mesh(new THREE.PlaneGeometry(DESK.w - 0.1, DESK.d - 0.1), new THREE.MeshBasicMaterial({ map: this.touchTex, transparent: true, depthWrite: false, opacity: 1, blending: THREE.AdditiveBlending }), 0, DESK.y + 0.0012, 0, deskG)
    this.touch.rotation.x = -Math.PI / 2
    // The small pale window under his cheek.
    this.windowMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })
    this.window = mesh(new THREE.PlaneGeometry(0.34, 0.2), this.windowMat, -0.16, DESK.y + 0.0016, 0.3, deskG)
    this.window.rotation.x = -Math.PI / 2

    // The button: a matte black cap in a thin ring of light.
    const btn = new THREE.Group()
    btn.position.copy(BUTTON).setY(DESK.y)
    deskG.add(btn)
    cyl(0.085, 0.088, 0.006, darkSteel, 0, 0.003, 0, btn, 40)
    this.ring = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const ringMesh = mesh(new THREE.TorusGeometry(0.078, 0.0045, 8, 48), this.ring, 0, 0.007, 0, btn)
    ringMesh.rotation.x = Math.PI / 2
    this.buttonCap = cyl(0.07, 0.07, 0.036, new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.85 }), 0, 0.024, 0, btn, 40)

    // The three giant screens.
    this.center = makeScreen(CENTER_SCREEN.w, CENTER_SCREEN.h, 1024, charcoal)
    this.center.group.position.copy(CENTER_SCREEN.pos)
    deskG.add(this.center.group)
    // Its stand on the desk.
    rbox(0.08, 0.2, 0.06, charcoal, 0, DESK.y + 0.1, -0.64, deskG, 0.01)
    rbox(0.5, 0.015, 0.22, charcoal, 0, DESK.y + 0.008, -0.62, deskG, 0.006)
    for (const sx of [-1, 1]) {
      const s = makeScreen(SIDE_SCREEN.w, SIDE_SCREEN.h, 896, charcoal)
      s.group.position.set(sx * SIDE_SCREEN.x, SIDE_SCREEN.y, SIDE_SCREEN.z)
      s.group.rotation.y = -sx * SIDE_SCREEN.yaw
      g.add(s.group)
      // A floor pedestal behind it.
      const ped = new THREE.Group()
      ped.position.set(sx * SIDE_SCREEN.x, 0, SIDE_SCREEN.z - 0.08)
      ped.rotation.y = -sx * SIDE_SCREEN.yaw
      g.add(ped)
      rbox(0.12, SIDE_SCREEN.y - SIDE_SCREEN.h / 2, 0.08, charcoal, 0, (SIDE_SCREEN.y - SIDE_SCREEN.h / 2) / 2, -0.04, ped, 0.01).castShadow = true
      rbox(0.55, 0.03, 0.4, charcoal, 0, 0.015, -0.04, ped, 0.008)
      if (sx < 0) this.left = s
      else this.right = s
    }

    // The desk lamp at the far left corner of the desk, reaching over toward his place
    // (set back so the cameras on his left side and the recorder's line of sight stay clear of it).
    const lampG = new THREE.Group()
    lampG.name = 'desk-lamp'
    lampG.position.set(-1.45, DESK.y, -0.3)
    lampG.rotation.y = Math.atan2(-1.32, -0.87) // model front (−z) toward his face
    g.add(lampG)
    if (models.lamp) {
      lampG.add(models.lamp)
      this.lampModel = models.lamp
    } else {
      const s = pbr('metal', 0x2a2b2d, { roughness: 0.4 })
      cyl(0.08, 0.09, 0.02, s, 0, 0.01, 0, lampG, 24)
      rbox(0.015, 0.4, 0.015, s, 0, 0.2, -0.05, lampG, 0.006).rotation.x = -0.3
      rbox(0.015, 0.3, 0.015, s, 0, 0.45, -0.15, lampG, 0.006).rotation.x = 0.9
      const head = turned([[0.01, 0], [0.05, -0.04], [0.06, -0.1]], s, 24, lampG)
      head.position.set(0, 0.5, -0.25)
    }
    this.lampBulb = mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.75, 0.45).multiplyScalar(4) }), 0, 0.47, -0.135, lampG)
    g.updateMatrixWorld(true)
    this.lampBulb.getWorldPosition(this.lampAt)

    // ——— The chair, pushed in, a folded cloth on a shelf under the seat ———
    this.chair.add(officeChair(pbr('fabric', 0x2b2d30, { roughness: 1 }), darkSteel))
    this.chair.rotation.y = Math.PI
    g.add(this.chair)
    rbox(0.34, 0.012, 0.26, charcoal, 0, 0.27, 0.0, this.chair, 0.004)
    this.clothFolded = rbox(0.24, 0.035, 0.18, clothMat, 0.02, 0.295, 0.0, this.chair, 0.012)
    this.chair.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })

    // ——— The cloth box in the front-right corner, full to the brim ———
    const boxG = new THREE.Group()
    boxG.position.copy(BOX)
    boxG.rotation.y = 0.2
    g.add(boxG)
    for (const [w, d, x, z] of [
      [0.5, 0.02, 0, 0.215],
      [0.5, 0.02, 0, -0.215],
      [0.02, 0.45, 0.24, 0],
      [0.02, 0.45, -0.24, 0],
    ] as const)
      rbox(w, 0.5, d, boxWood, x, 0.25, z, boxG, 0.004).castShadow = true
    rbox(0.46, 0.02, 0.41, boxWood, 0, 0.012, 0, boxG, 0.003)
    const cg = [clothGeometry(1), clothGeometry(2), clothGeometry(3)]
    this.boxCloths = new THREE.InstancedMesh(cg[0], clothMat, 26)
    const rand = mulberry32(77)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < 26; i++) {
      const layer = Math.floor(i / 9)
      dummy.position.set((rand() - 0.5) * 0.32, 0.38 + layer * 0.05 + rand() * 0.03, (rand() - 0.5) * 0.28)
      dummy.rotation.set(rand() * 6, rand() * 6, rand() * 6)
      dummy.scale.setScalar(0.85 + rand() * 0.25)
      dummy.updateMatrix()
      this.boxCloths.setMatrixAt(i, dummy.matrix)
    }
    this.boxCloths.castShadow = true
    boxG.add(this.boxCloths)
    // Underneath, the box is full of the same (a dark mass of cloth reads as depth).
    rbox(0.44, 0.34, 0.39, clothMat, 0, 0.2, 0, boxG, 0.04)
    this.clothTop = mesh(cg[1], clothMat, 0.03, 0.5, -0.02, boxG)
    this.extraCloth = mesh(cg[2], clothMat, -0.1, 0.49, 0.08, boxG)
    this.clothHand = mesh(cg[1], clothMat, 0, 0, 0, g)
    this.clothFly = mesh(cg[1], clothMat, 0, 0, 0, g)
    for (const m of [this.clothTop, this.extraCloth, this.clothHand, this.clothFly]) m.castShadow = true


    // ——— The walkway beyond the right door (x 5…9) ———
    this.walkForest = forestMaterial(pano)
    this.walkForest.side = THREE.DoubleSide
    this.walkForest.uniforms.uCenter.value.set(0, 2.0, 0)
    const W = this.walkway
    g.add(W)
    const wfloor = mesh(new THREE.PlaneGeometry(4, 1.6), oak, 7.15, 0, 0, W)
    wfloor.rotation.x = -Math.PI / 2
    wfloor.receiveShadow = true
    // The gap over the stream at x 6.2, glazed.
    const water = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, tPano: { value: pano }, uDim: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float uTime; uniform sampler2D tPano; uniform float uDim; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9,78.2)))*43758.5); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){
          vec2 p = vec2(vUv.x * 3.0, vUv.y * 12.0 - uTime * 1.4);
          float r = n(p * 3.0) * 0.6 + n(p * 7.0 + 3.0) * 0.4;
          vec3 bed = texture2D(tPano, vec2(0.8 + vUv.x * 0.02, 0.12 + fract(vUv.y * 0.5 - uTime * 0.03) * 0.06)).rgb;
          vec3 c = mix(bed * 0.5, vec3(0.55, 0.62, 0.6), smoothstep(0.55, 0.85, r) * 0.5);
          gl_FragColor = vec4(c * uDim, 1.0);
        }`,
    })
    this.waterMat = water
    const wplane = mesh(new THREE.PlaneGeometry(1.6, 0.4), water, 6.2, -0.22, 0, W)
    wplane.rotation.set(-Math.PI / 2, 0, Math.PI / 2)
    // Planks on both sides of the gap; the gap's edges in dark steel; glass over it.
    box(0.4, 0.22, 0.02, darkSteel, 6.2, -0.11, 0.8, W)
    box(0.4, 0.22, 0.02, darkSteel, 6.2, -0.11, -0.8, W)
    for (const x of [6.0, 6.4]) box(0.02, 0.22, 1.6, darkSteel, x, -0.11, 0, W)
    const gl = mesh(new THREE.PlaneGeometry(0.4, 1.6), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.12, depthWrite: false }), 6.2, 0.004, 0, W)
    gl.rotation.x = -Math.PI / 2
    // Screens: the near wall (−z), the far wall with three niches (+z), the low ceiling.
    const WH = 3.0
    const ws = (corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3]) => mesh(screenQuad(corners, 5, 8, 4), this.walkForest, 0, 0, 0, W)
    ws([V(5.15, 0, -0.8), V(9, 0, -0.8), V(9, WH, -0.8), V(5.15, WH, -0.8)])
    ws([V(5.15, WH, -0.8), V(9, WH, -0.8), V(9, WH, 0.8), V(5.15, WH, 0.8)])
    // +z wall: around the niches (each 0.62 wide, 1.25 tall).
    const nx = [NICHES.coffee[0], NICHES.snack[0], NICHES.recorder[0]]
    ws([V(5.15, 1.25, 0.8), V(9, 1.25, 0.8), V(9, WH, 0.8), V(5.15, WH, 0.8)])
    let x0 = 5.15
    for (const x of nx) {
      ws([V(x0, 0, 0.8), V(x - 0.31, 0, 0.8), V(x - 0.31, 1.25, 0.8), V(x0, 1.25, 0.8)])
      x0 = x + 0.31
      // The niche: a shallow charcoal box, lit softly from inside.
      box(0.62, 1.25, 0.02, charcoal, x, 0.625, 1.36, W)
      box(0.02, 1.25, 0.56, charcoal, x - 0.31, 0.625, 1.08, W)
      box(0.02, 1.25, 0.56, charcoal, x + 0.31, 0.625, 1.08, W)
      box(0.62, 0.02, 0.56, charcoal, x, 1.25, 1.08, W)
      const nf = mesh(new THREE.PlaneGeometry(0.62, 0.56), oak, x, 0.001, 1.08, W)
      nf.rotation.x = -Math.PI / 2
    }
    ws([V(x0, 0, 0.8), V(9, 0, 0.8), V(9, 1.25, 0.8), V(x0, 1.25, 0.8)])
    // The plain warm-lit door at the end (the dressing room).
    box(0.1, WH, 1.6, charcoal, 9.05, WH / 2, 0, W)
    this.endLeaf.position.set(8.99, 0, -0.45)
    W.add(this.endLeaf)
    rbox(0.04, 2.1, 0.9, pbr('wood', 0x8a6a4c, { roughness: 0.7 }), 0, 1.05, 0.45, this.endLeaf, 0.006)
    rbox(0.05, 0.03, 0.14, steel, -0.04, 1.0, 0.8, this.endLeaf, 0.008)
    const glow = mesh(new THREE.PlaneGeometry(0.9, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.7, 0.4).multiplyScalar(2) }), 8.985, 0.012, 0, W)
    glow.rotation.y = -Math.PI / 2
    // Ferns at arm's length along both sides of the walkway (real ferns in planting troughs).
    const fernSrc = models.fern
    const trough = pbr('concrete', 0x3a3631, { roughness: 1 })
    for (const sz of [-1, 1]) {
      const z = sz * 0.68
      // On the niche side the trough stops short of the niches: the robots roll out across it.
      if (sz < 0) box(3.7, 0.12, 0.24, trough, 7.05, 0.06, z, W)
      else
        for (const [x0, x1] of [
          [5.2, 6.02],
          [8.38, 8.9],
        ])
          box(x1 - x0, 0.12, 0.24, trough, (x0 + x1) / 2, 0.06, z, W)
      if (!fernSrc) continue
      const parts: THREE.Object3D[] = []
      fernSrc.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) parts.push(o)
      })
      const rnd = mulberry32(sz > 0 ? 11 : 23)
      const xs = sz > 0 ? [5.5, 8.6] : [5.45, 5.95, 6.75, 7.3, 7.9, 8.55]
      for (const x of xs) {
        const src = parts[Math.floor(rnd() * parts.length)]
        const f = src.clone()
        f.position.set(0, 0, 0)
        const holder = new THREE.Group()
        holder.add(f)
        holder.position.set(x, 0.12, z)
        holder.rotation.y = rnd() * Math.PI * 2
        holder.scale.setScalar(1.25 + rnd() * 0.4)
        W.add(holder)
      }
    }
    // A thin bezel frames the walkway screens where they meet.
    box(3.85, 0.02, 0.02, this.bezelMat, 7.075, WH, -0.79, W)
    box(3.85, 0.02, 0.02, this.bezelMat, 7.075, WH, 0.79, W)

    // A scan-line glow material shared by the director (unused until needed).
    this.scanMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    return this
  }

  dispose() {
    this.center?.texture.dispose()
    this.left?.texture.dispose()
    this.right?.texture.dispose()
    this.touchTex?.dispose()
  }
}
