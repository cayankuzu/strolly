/**
 * TAKINTI's three people, all on the shared rig: the boy (thirteen, barefoot,
 * pajamas), the mother (tall, very thin, a yellowed nightgown, long grey hair
 * that hangs) and the body (one matte dark material, bald, faceless; only
 * ever sitting or lying). Plus the poses only this story needs.
 */
import * as THREE from 'three'
import { clamp, mulberry32 } from '@/lib/math'
import { Figure, makePose, type FigureLook } from '../figure/Figure'
import { SIT, STAND } from '../figure/poses'
import { std } from '../kit/props'
import { mapsFor, pbr } from '../kit/surfaces'

/**
 * The nightgown's cloth: yellowed cotton with a tiny faded sprig print, so it
 * never reads as bare skin, even in the cold light.
 */
function gownPrint() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')!
  g.fillStyle = '#d3cdb4'
  g.fillRect(0, 0, S, S)
  const rand = mulberry32(31)
  // Faint vertical weave streaks.
  for (let x = 0; x < S; x += 2) {
    g.fillStyle = `rgba(120,110,80,${0.02 + rand() * 0.04})`
    g.fillRect(x, 0, 1, S)
  }
  // Sprigs on a half-drop grid: a stem and three small petals, washed out.
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 6; col++) {
      const x = col * (S / 6) + (row % 2 ? S / 12 : 0) + (rand() - 0.5) * 6
      const y = row * (S / 6) + 12 + (rand() - 0.5) * 6
      g.save()
      g.translate(x, y)
      g.rotate((rand() - 0.5) * 1.2)
      g.strokeStyle = 'rgba(105,118,104,0.55)'
      g.lineWidth = 1.4
      g.beginPath()
      g.moveTo(0, 6)
      g.quadraticCurveTo(2, 1, 0, -5)
      g.stroke()
      g.fillStyle = 'rgba(112,122,150,0.5)'
      for (let k = 0; k < 3; k++) {
        g.beginPath()
        g.ellipse(Math.cos(k * 2.1) * 3, -5 + Math.sin(k * 2.1) * 3, 2.4, 1.6, k, 0, Math.PI * 2)
        g.fill()
      }
      g.restore()
    }
  // Yellowing: soft blotches.
  for (let i = 0; i < 18; i++) {
    g.fillStyle = `rgba(160,130,70,${0.03 + rand() * 0.05})`
    g.beginPath()
    g.arc(rand() * S, rand() * S, 10 + rand() * 40, 0, Math.PI * 2)
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

function gownMaterial(print: THREE.Texture, side: THREE.Side) {
  const { maps } = mapsFor('fabric')
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, map: print, normalMap: maps.normal, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: maps.orm, roughness: 1, side })
  // A real-scale print: one tile every 16 cm (also stops the rig from re-dressing it).
  m.userData.meters = 0.16
  return m
}

export function castPalette() {
  const print = gownPrint()
  return {
    eye: std(0x2a1d14, 0.25),
    boySkin: std(0xc99f84, 0.6),
    boySkinHead: std(0xc99f84, 0.58, { vertexColors: true }),
    boyHair: std(0x17120f, 0.85),
    boyTop: std(0x2b3550, 0.95),
    boyBottom: std(0x6a6d72, 0.95),
    momSkin: std(0xc7ad9c, 0.72),
    momSkinHead: std(0xc7ad9c, 0.7, { vertexColors: true }),
    // Cool grey, so the yellow dawn does not turn it blonde.
    momHair: std(0x8c8f94, 0.7),
    gown: gownMaterial(print, THREE.FrontSide),
    skirt: gownMaterial(print, THREE.DoubleSide),
    // Near-black, matte: against a lit wall it is a silhouette, never a lit surface.
    body: new THREE.MeshStandardMaterial({ color: 0x150605, roughness: 0.92, metalness: 0, envMapIntensity: 0.04 }),
    feetWet: new THREE.MeshStandardMaterial({ color: 0x4a1410, roughness: 0.38, metalness: 0, envMapIntensity: 0.3 }),
  }
}
export type CastPalette = ReturnType<typeof castPalette>

function boyLook(m: CastPalette): FigureLook {
  return {
    name: 'Çocuk',
    build: 'm',
    face: { jaw: 0.16, nose: 0.15, lips: 0.05, stubble: 0 },
    hairStyle: 'short',
    skin: m.boySkin,
    skinHead: m.boySkinHead,
    eye: m.eye,
    hair: m.boyHair,
    top: m.boyTop,
    bottom: m.boyBottom,
    // Barefoot: the rig's shoes get his skin once he is built.
    shoes: std(0x1a1a1a),
    sole: std(0x1a1a1a),
    cuff: m.boyTop,
    collar: 'crew',
    height: 0.85,
    topSurface: 'fabric',
    bottomSurface: 'fabric',
  }
}

function motherLook(m: CastPalette): FigureLook {
  return {
    name: 'Anne',
    build: 'f',
    face: { jaw: 0.4, nose: 0.25, lips: 0.03, stubble: 0 },
    hairStyle: 'long',
    skin: m.momSkin,
    skinHead: m.momSkinHead,
    eye: m.eye,
    hair: m.momHair,
    top: m.gown,
    bottom: m.gown,
    shoes: std(0x1a1a1a),
    sole: std(0x1a1a1a),
    cuff: m.gown,
    collar: 'crew',
    height: 1.06,
    topSurface: 'fabric',
    bottomSurface: 'fabric',
  }
}

/** The body's look: every surface is replaced by one material after the rig is built. */
function bodyLook(): FigureLook {
  const any = () => std(0x3a1612, 0.96)
  return {
    name: 'Beden',
    build: 'm',
    face: { jaw: 0.3, nose: 0.12, lips: 0.02, stubble: 0 },
    hairStyle: 'short',
    skin: any(),
    skinHead: any(),
    eye: any(),
    hair: any(),
    top: any(),
    bottom: any(),
    shoes: any(),
    sole: any(),
    cuff: any(),
    collar: 'crew',
    height: 0.95,
  }
}

/** The meshes that hang off the feet (the rig's shoes): bare feet here. */
function footMeshes(f: Figure) {
  const out: THREE.Mesh[] = []
  for (const j of [f.joints.lFoot, f.joints.rFoot]) j.traverse((o) => (o as THREE.Mesh).isMesh && out.push(o as THREE.Mesh))
  return out
}

/** The skin the figure actually wears (the rig upgrades the look's material). */
function wornSkin(f: Figure, name: string) {
  const body = f.root.children.find((o) => o.name === `${name}-skin`) as THREE.Mesh | undefined
  return body?.material as THREE.Material | undefined
}

export type Cast = {
  boy: Figure
  mother: Figure
  body: Figure
  /** The body's feet (their wet sheen is switched on in one shot only). */
  bodyFeet: THREE.Mesh[]
  /** Long hair down the mother's back (rides on her chest) and two hanks by her face (hang). */
  hairBack: THREE.Mesh
  hairSides: THREE.Mesh[]
  /** The nightgown's skirt, re-shaped every frame from her hips, knees and ankles. */
  skirt: Skirt
  /** Her legs' skinned mesh and its bare-skin material (the kitchen swaps in the gown: kneeling, the thighs show through the skirt). */
  momLegs: { mesh: THREE.Mesh; bare: THREE.Material } | null
}

// ——— The nightgown's skirt ———

const RING = 28
const ROWS = 6

export type Skirt = { mesh: THREE.Mesh; update(): void }

const vHipL = new THREE.Vector3()
const vHipR = new THREE.Vector3()
const vKneeL = new THREE.Vector3()
const vKneeR = new THREE.Vector3()
const vAnkL = new THREE.Vector3()
const vAnkR = new THREE.Vector3()
const vKnee = new THREE.Vector3()
const vAnk = new THREE.Vector3()
const vThigh = new THREE.Vector3()
const vSide = new THREE.Vector3()
const vB = new THREE.Vector3()
const vSideH = new THREE.Vector3()
const vFwdH = new THREE.Vector3()
const vTmp = new THREE.Vector3()
const vRow = new THREE.Vector3()
const vMid = new THREE.Vector3()

/**
 * An ankle-length skirt as a tube of rings: waist and hips (in the hips'
 * frame), a ring around both knees (across the thighs' direction) and a hem
 * that hangs: under the knees when she sits, back over her shins when she kneels.
 */
function makeSkirt(f: Figure, mat: THREE.Material): Skirt {
  const n = (RING + 1) * ROWS
  const pos = new Float32Array(n * 3)
  const uv = new Float32Array(n * 2)
  const idx: number[] = []
  for (let r = 0; r < ROWS; r++)
    for (let i = 0; i <= RING; i++) {
      const k = r * (RING + 1) + i
      // ~1.1 m of cloth around, ~1 m down: the print's 16 cm tile.
      uv[k * 2] = (i / RING) * (1.1 / 0.16)
      uv[k * 2 + 1] = (r / (ROWS - 1)) * (1.0 / 0.16)
      if (r < ROWS - 1 && i < RING) {
        const a = k
        const b = k + 1
        const c = k + RING + 1
        const d = c + 1
        idx.push(a, c, b, b, c, d)
      }
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  geo.setIndex(idx)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.frustumCulled = false
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = 'skirt'
  const J = f.joints
  const ring = (row: number, at: (t: number, out: THREE.Vector3) => void) => {
    for (let i = 0; i <= RING; i++) {
      at(((i % RING) / RING) * Math.PI * 2, vRow)
      const k = (row * (RING + 1) + i) * 3
      pos[k] = vRow.x
      pos[k + 1] = vRow.y
      pos[k + 2] = vRow.z
    }
  }
  const hipsLocal = new THREE.Vector3()
  return {
    mesh,
    update() {
      mesh.visible = f.root.visible
      if (!mesh.visible) return
      const hips = J.hips.matrixWorld
      J.lThigh.getWorldPosition(vHipL)
      J.rThigh.getWorldPosition(vHipR)
      J.lShin.getWorldPosition(vKneeL)
      J.rShin.getWorldPosition(vKneeR)
      J.lFoot.getWorldPosition(vAnkL)
      J.rFoot.getWorldPosition(vAnkR)
      vKnee.addVectors(vKneeL, vKneeR).multiplyScalar(0.5)
      vAnk.addVectors(vAnkL, vAnkR).multiplyScalar(0.5)
      vThigh.addVectors(vHipL, vHipR).multiplyScalar(0.5)
      vThigh.subVectors(vKnee, vThigh).normalize()
      // Side axis across the knees (left knee side), square to the thighs.
      vSide.subVectors(vKneeL, vKneeR)
      const kneeGap = vSide.length()
      vSide.addScaledVector(vThigh, -vSide.dot(vThigh)).normalize()
      vB.crossVectors(vThigh, vSide).normalize()
      // Hanging hem: horizontal; its "front" is where the cloth falls from the knee top.
      vSideH.set(vSide.x, 0, vSide.z).normalize()
      vTmp.subVectors(vAnk, vKnee)
      vTmp.y = 0
      // Kneeling: the shins lie behind the knees, the hem spreads on the floor over them.
      const kneel = vTmp.length() > 0.22
      if (kneel) vFwdH.copy(vTmp).normalize()
      else vFwdH.set(vThigh.x, 0, vThigh.z).normalize()
      const sc = f.root.scale.y
      // Rows 0–1: waist and hips, in the hips' own frame.
      const waist = (y: number, rx: number, rz: number) => (t: number, out: THREE.Vector3) => out.copy(hipsLocal.set(Math.cos(t) * rx, y, Math.sin(t) * rz)).applyMatrix4(hips)
      ring(0, waist(0.11, 0.135, 0.11))
      ring(1, waist(-0.02, 0.175, 0.15))
      // Row 2: half-way down the thighs, a little fuller.
      const ra = (kneeGap / 2 + 0.1) * sc
      const rb = 0.115 * sc
      // Row 2: around both thighs, half-way to the knees.
      vMid.addVectors(vHipL, vHipR).add(vKneeL).add(vKneeR).multiplyScalar(0.25)
      ring(2, (t, out) => out.copy(vMid).addScaledVector(vSide, Math.cos(t) * ra * 1.12).addScaledVector(vB, Math.sin(t) * rb * 1.35))
      // Row 3: around both knees.
      ring(3, (t, out) => out.copy(vKnee).addScaledVector(vThigh, 0.045 * sc).addScaledVector(vSide, Math.cos(t) * ra).addScaledVector(vB, Math.sin(t) * rb))
      // Rows 4–5: falling to the hem, which lies on (or just above) the floor.
      // Seated, the hem rides up to mid-calf (the bare feet show on the treadle).
      const hemY = kneel ? 0.012 : Math.max(0.012, Math.min(vAnk.y + 0.13, vKnee.y - 0.16))
      const hx = Math.max(ra * 1.02, (vAnkL.distanceTo(vAnkR) / 2 + 0.1) * sc)
      const hz = (kneel ? 0.2 : 0.125) * sc
      // Soft folds in the falling cloth.
      const fold = (t: number) => 1 + 0.07 * Math.sin(t * 7 + 0.6) + 0.04 * Math.sin(t * 11 + 2.1)
      const hem = (t: number, out: THREE.Vector3) => {
        const k = fold(t)
        return out.set(vAnk.x, hemY, vAnk.z).addScaledVector(vSideH, Math.cos(t) * hx * k).addScaledVector(vFwdH, Math.sin(t) * hz * k)
      }
      ring(5, hem)
      ring(4, (t, out) => {
        hem(t, out)
        vTmp.copy(vKnee).addScaledVector(vThigh, 0.045 * sc).addScaledVector(vSide, Math.cos(t) * ra).addScaledVector(vB, Math.sin(t) * rb)
        out.lerp(vTmp, 0.45)
        out.y = Math.max(out.y, 0.012)
      })
      const attr = geo.attributes.position as THREE.BufferAttribute
      attr.needsUpdate = true
      geo.computeVertexNormals()
    },
  }
}

/** A curved sheet of hair: `w` wide at the top, `len` long, curling around a radius. */
function hairSheet(w: number, len: number, radius: number, taper: number) {
  const g = new THREE.PlaneGeometry(1, 1, 10, 14)
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) // −0.5 … 0.5 across
    const v = 0.5 - p.getY(i) // 0 top … 1 bottom
    const width = w * (1 - taper * v)
    const a = (u * width) / radius
    // Strands thin out and part toward the ends.
    const ragged = 0.012 * Math.sin(u * 37 + v * 5) * v
    p.setXYZ(i, Math.sin(a) * radius, -v * len + ragged, -(1 - Math.cos(a)) * radius - 0.01 * v)
  }
  g.computeVertexNormals()
  return g
}

/** Short, messy, slept-on hair: tufts over the rig's cap so it never reads as a helmet. */
function messyHair(f: Figure) {
  const mat = f.headMeshes[1]?.material as THREE.Material | undefined
  if (!mat) return
  const rand = mulberry32(77)
  const geo = new THREE.SphereGeometry(0.03, 8, 6)
  const c = new THREE.Vector3(0, 0.108, 0.008)
  const d = new THREE.Vector3()
  for (let i = 0; i < 26; i++) {
    // Over the crown and the back, a few falling onto the forehead.
    const a = rand() * Math.PI * 2
    const up = 0.35 + rand() * 0.6
    d.set(Math.cos(a) * Math.sqrt(1 - up * up), up, Math.sin(a) * Math.sqrt(1 - up * up))
    if (d.z > 0.55 && d.y < 0.55) d.y += 0.2
    d.normalize()
    const t = new THREE.Mesh(geo, mat)
    t.position.copy(c).addScaledVector(d, 0.098 + rand() * 0.006)
    t.lookAt(t.position.clone().add(d))
    t.rotateZ(rand() * Math.PI)
    t.scale.set(0.7 + rand() * 0.5, 0.45 + rand() * 0.35, 0.22)
    t.castShadow = true
    f.joints.head.add(t)
  }
}

export function createCast(m: CastPalette): Cast {
  const boy = new Figure(boyLook(m))
  // Slim: a thirteen-year-old, the head a little large for the body.
  boy.root.scale.x *= 0.9
  boy.root.scale.z *= 0.9
  boy.joints.head.scale.setScalar(1.1)
  messyHair(boy)
  const boySkin = wornSkin(boy, 'Çocuk')
  if (boySkin) for (const f of footMeshes(boy)) f.material = boySkin

  const mother = new Figure(motherLook(m))
  // Very thin, long limbs.
  mother.root.scale.x *= 0.84
  mother.root.scale.z *= 0.86
  // Thin, long-fingered old hands.
  for (const h of [mother.joints.lHand, mother.joints.rHand]) h.scale.set(0.78, 1.08, 0.82)
  const momSkin = wornSkin(mother, 'Anne')
  if (momSkin) {
    for (const f of footMeshes(mother)) f.material = momSkin
    // Bare legs under the nightgown's skirt (the rig would dress them as trousers), no cuffs.
    const legs = mother.root.children.find((o) => o.name === 'Anne-bottom') as THREE.Mesh | undefined
    if (legs) legs.material = momSkin
    for (const j of [mother.joints.lShin, mother.joints.rShin]) for (const c of j.children) if ((c as THREE.Mesh).isMesh) c.visible = false
  }
  const hairMat = (mother.headMeshes[1]?.material as THREE.Material) ?? pbr('hair', 0x9d9a95)
  const hairBack = new THREE.Mesh(hairSheet(0.27, 0.5, 0.17, 0.25), hairMat)
  hairBack.castShadow = true
  ;(hairMat as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  // From the nape down the back, lying on it.
  hairBack.position.set(0, 0.36, -0.105)
  hairBack.rotation.y = Math.PI
  mother.joints.chest.add(hairBack)
  const hairSides: THREE.Mesh[] = []
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(hairSheet(0.08, 0.36, 0.2, 0.3), hairMat)
    h.castShadow = true
    h.userData.side = sx
    hairSides.push(h)
  }

  const body = new Figure(bodyLook())
  // No hair, no eyes, no face: one dark surface.
  body.headMeshes[1].visible = false
  body.root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh && mesh !== body.headMeshes[1]) mesh.material = m.body
  })
  const bodyFeet = footMeshes(body)
  const skirt = makeSkirt(mother, m.skirt)
  // Her long hair covers her ears (the rig's head meshes: head, hair, then 8 per side starting with the ear).
  for (const i of [2, 10]) if (mother.headMeshes[i]) mother.headMeshes[i].visible = false
  const legMesh = mother.root.children.find((o) => o.name === 'Anne-bottom') as THREE.Mesh | undefined
  const momLegs = legMesh ? { mesh: legMesh, bare: legMesh.material as THREE.Material } : null

  return { boy, mother, body, bodyFeet, hairBack, hairSides, skirt, momLegs }
}

const qHead = new THREE.Quaternion()
const qDown = new THREE.Quaternion()
const vAt = new THREE.Vector3()
const eHang = new THREE.Euler()

/**
 * The hanks by her face: fixed to the side of the head, but they hang — the
 * more she bends, the more they fall straight down past her face.
 */
export function hangHair(cast: Cast, yaw: number) {
  const head = cast.mother.joints.head
  head.updateWorldMatrix(true, false)
  head.getWorldQuaternion(qHead)
  eHang.set(0, yaw, 0)
  qDown.setFromEuler(eHang)
  for (const h of cast.hairSides) {
    const sx = h.userData.side as number
    vAt.set(sx * 0.085, 0.16, 0.02).applyMatrix4(head.matrixWorld)
    h.position.copy(vAt)
    h.quaternion.copy(qHead).slerp(qDown, 0.65)
    h.rotateY(sx * 1.2)
    h.scale.setScalar(cast.mother.root.scale.y)
  }
  // The long hair down her back: it lies on the back while she sits upright; when
  // she bends far forward (kneeling over the tiles) it droops from the nape toward
  // the floor instead of sticking out like a board.
  const hb = cast.hairBack
  const chest = cast.mother.joints.chest
  chest.updateWorldMatrix(true, false)
  chest.getWorldQuaternion(qChest)
  vUp.set(0, 1, 0).applyQuaternion(qChest)
  const bend = Math.acos(Math.min(1, Math.max(-1, vUp.y)))
  // (Only part-way: seen from behind, it must still lie down her back.)
  const k = 0.35 * Math.min(1, Math.max(0, (bend - 0.55) / 0.45))
  hb.quaternion.copy(qHairRest)
  if (k > 0) {
    eHang.set(0, yaw + Math.PI, 0)
    qHang.setFromEuler(eHang)
    // World target → chest-local, blended from the resting orientation.
    qLocal.copy(qChest).invert().multiply(qHang)
    hb.quaternion.slerp(qLocal, k)
  }
}
const qChest = new THREE.Quaternion()
const qHang = new THREE.Quaternion()
const qLocal = new THREE.Quaternion()
const qHairRest = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0))
const vUp = new THREE.Vector3()

// ——— Poses ———

/** Lying on his back in bed, face up (the root stays upright; the hips lay him down). */
export const LIE_BACK = makePose({
  hipY: 0.12,
  hips: [-1.52, 0, 0],
  spine: [-0.04, 0, 0],
  chest: [0, 0, 0],
  neck: [0.2, 0, 0],
  head: [0.18, 0.35, 0],
  lThigh: [0.02, 0, 0.05],
  rThigh: [0.06, 0, -0.04],
  lShin: [0.08, 0, 0],
  rShin: [0.14, 0, 0],
  lFoot: [-0.5, 0, 0],
  rFoot: [-0.5, 0, 0],
  lUpper: [0.05, 0, 0.18],
  rUpper: [-0.3, 0, -0.12],
  lFore: [-0.2, 0, 0],
  rFore: [-1.4, 0, 0],
})

/** Sitting up in bed, legs still under the duvet. */
export const SIT_LONG = makePose({
  hipY: 0.12,
  hips: [0, 0, 0],
  spine: [0.18, 0, 0],
  chest: [0.12, 0, 0],
  neck: [0.08, 0, 0],
  head: [0.12, 0, 0],
  lThigh: [-1.5, 0, 0.05],
  rThigh: [-1.5, 0, -0.05],
  lShin: [0.06, 0, 0],
  rShin: [0.1, 0, 0],
  lFoot: [-0.4, 0, 0],
  rFoot: [-0.4, 0, 0],
  lUpper: [-0.25, 0, 0.2],
  rUpper: [-0.25, 0, -0.2],
  lFore: [-0.5, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** On the edge of the bed, feet on the floor, hands on the mattress. */
export const SIT_EDGE = makePose(
  {
    spine: [0.16, 0, 0],
    chest: [0.08, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.16, 0, 0],
    lUpper: [0.05, 0, 0.28],
    rUpper: [0.05, 0, -0.28],
    lFore: [-0.35, 0, 0],
    rFore: [-0.35, 0, 0],
  },
  SIT,
)

/** On the edge of the bed, shoulders sunk. */
export const SIT_SAD = makePose(
  {
    spine: [0.36, 0, 0],
    chest: [0.2, 0, 0],
    neck: [0.24, 0, 0],
    head: [0.3, 0, 0],
    lUpper: [-0.45, 0, 0.1],
    rUpper: [-0.45, 0, -0.1],
    lFore: [-0.95, 0.25, 0],
    rFore: [-0.95, -0.25, 0],
  },
  SIT,
)

/** Rubbing his eyes with the back of a hand. */
export const RUB_EYES = makePose(
  {
    neck: [0.1, 0, 0],
    head: [0.18, 0, 0],
    rUpper: [-1.0, 0.2, -0.35],
    rFore: [-2.2, 0, 0],
    rHand: [0.3, 0, 0],
  },
  STAND,
)

/** Hands on the sink's edge, leaning in, head a little down: listening. */
export const SINK = makePose({
  spine: [0.22, 0, 0],
  chest: [0.1, 0, 0],
  neck: [0.02, 0, 0],
  head: [0.06, 0, 0],
  lUpper: [-0.5, 0, 0.18],
  rUpper: [-0.5, 0, -0.18],
  lFore: [-0.5, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** Frozen, head bent toward the floor. */
export const FREEZE_DOWN = makePose(
  {
    neck: [0.32, 0, 0],
    head: [0.38, 0.2, 0.08],
  },
  STAND,
)

/** Standing at the bowl, seen from behind: hands in front. */
export const AT_BOWL = makePose(
  {
    head: [0.3, 0, 0],
    lUpper: [-0.32, 0, 0.12],
    rUpper: [-0.32, 0, -0.12],
    lFore: [-0.9, 0.3, 0],
    rFore: [-0.9, -0.3, 0],
  },
  STAND,
)

/** Leaning to look through a gap, one hand half raised. */
export const PEER = makePose({
  hipZ: 0.02,
  spine: [0.14, 0.1, 0.06],
  chest: [0.08, 0.12, 0.04],
  neck: [0.04, 0.14, 0],
  head: [0.06, 0.2, 0],
  lUpper: [-0.85, 0, 0.3],
  lFore: [-1.4, 0, 0],
  rUpper: [0.05, 0, -0.08],
  rFore: [-0.2, 0, 0],
})

/** Shouting: leaning forward, fists at his sides. */
export const SHOUT = makePose({
  hipZ: 0.02,
  spine: [0.2, 0, 0],
  chest: [0.12, 0, 0],
  neck: [-0.12, 0, 0],
  head: [-0.14, 0, 0],
  lUpper: [0.12, 0, 0.16],
  rUpper: [0.12, 0, -0.16],
  lFore: [-0.35, 0, 0],
  rFore: [-0.35, 0, 0],
  lHand: [0.5, 0, 0],
  rHand: [0.5, 0, 0],
})

/** "yeteeer": both arms thrown down, a stamp. */
export const STAMP = makePose({
  hipY: 0.95,
  spine: [0.32, 0, 0],
  chest: [0.16, 0, 0],
  neck: [-0.18, 0, 0],
  head: [-0.12, 0, 0],
  lUpper: [0.32, 0, 0.32],
  rUpper: [0.32, 0, -0.32],
  lFore: [-0.05, 0, 0],
  rFore: [-0.05, 0, 0],
  lHand: [0.4, 0, 0],
  rHand: [0.4, 0, 0],
  rThigh: [-0.55, 0, -0.04],
  rShin: [0.7, 0, 0],
})

/** On the stool at the machine: bent toward the needle, feet on the treadle. */
export const SEW = makePose(
  {
    // A tall woman on a low stool: the knees ride up, the shins stand on the treadle.
    hipY: 0.53,
    spine: [0.3, 0, 0],
    chest: [0.18, 0, 0],
    neck: [0.18, 0, 0],
    head: [0.22, 0, 0],
    lUpper: [-0.9, 0, 0.12],
    rUpper: [-0.9, 0, -0.12],
    lFore: [-0.8, 0.3, 0],
    rFore: [-0.8, -0.3, 0],
    lThigh: [-1.7, 0, 0.1],
    rThigh: [-1.7, 0, -0.1],
    lShin: [1.6, 0, 0],
    rShin: [1.6, 0, 0],
    lFoot: [0.08, 0, 0],
    rFoot: [0.08, 0, 0],
  },
  SIT,
)

/** Head inclined to the cloth, tenderly. */
export const SEW_TENDER = makePose(
  {
    neck: [0.3, 0, 0.12],
    head: [0.3, 0.1, 0.22],
  },
  SEW,
)

/** On her knees, bent to the tiles, both hands on the rag. */
export const KNEEL_WIPE = makePose({
  hipY: 0.44,
  hipZ: -0.06,
  hips: [0.1, 0, 0],
  spine: [0.62, 0, 0],
  chest: [0.4, 0, 0],
  neck: [0.2, 0, 0],
  head: [0.28, 0, 0],
  lThigh: [-0.62, 0, 0.12],
  rThigh: [-0.62, 0, -0.12],
  lShin: [2.2, 0, 0],
  rShin: [2.2, 0, 0],
  lFoot: [0.9, 0, 0],
  rFoot: [0.9, 0, 0],
  lUpper: [-1.05, 0, 0.12],
  rUpper: [-1.05, 0, -0.12],
  lFore: [-0.3, 0, 0],
  rFore: [-0.3, 0, 0],
})

/** Straightened on her knees, the head turned over her right shoulder. */
export const KNEEL_TURN = makePose({
  hipY: 0.5,
  hipZ: -0.03,
  hips: [0.05, 0, 0],
  spine: [0.2, -0.2, 0],
  chest: [0.08, -0.25, 0],
  neck: [0.05, -0.45, 0],
  head: [0.12, -0.6, 0.05],
  lThigh: [-0.3, 0, 0.12],
  rThigh: [-0.3, 0, -0.12],
  lShin: [1.85, 0, 0],
  rShin: [1.85, 0, 0],
  lFoot: [0.9, 0, 0],
  rFoot: [0.9, 0, 0],
  lUpper: [-0.45, 0, 0.08],
  rUpper: [-0.45, 0, -0.08],
  lFore: [-0.6, 0, 0],
  rFore: [-0.6, 0, 0],
})

/** Sitting on the floor against a wall, legs out, head dropped to the chest. */
export const FLOOR_SIT = makePose({
  hipY: 0.13,
  hips: [-0.08, 0, 0],
  spine: [-0.02, 0, 0],
  chest: [0.12, 0, 0.04],
  neck: [0.55, 0, 0.05],
  head: [0.5, 0.15, 0.12],
  lThigh: [-1.45, 0.1, 0.12],
  rThigh: [-1.45, -0.1, -0.1],
  lShin: [0.06, 0, 0],
  rShin: [0.12, 0, 0],
  lFoot: [-0.25, 0, 0.3],
  rFoot: [-0.25, 0, -0.3],
  lUpper: [0.18, 0, 0.18],
  rUpper: [0.18, 0, -0.18],
  lFore: [-0.15, 0, 0],
  rFore: [-0.2, 0, 0],
  lHand: [0.2, 0, 0],
  rHand: [0.2, 0, 0],
})

/** Tipped over: the same body, the torso folded toward the floor. */
export const FLOOR_LIE = makePose({
  hipY: 0.13,
  hips: [-0.1, 0, 0],
  spine: [0.05, 0, -0.1],
  chest: [0.08, 0, -0.08],
  neck: [0.3, 0, -0.1],
  head: [0.35, 0.1, -0.1],
  lThigh: [-1.3, 0.1, 0.06],
  rThigh: [-1.25, -0.1, -0.06],
  lShin: [0.35, 0, 0],
  rShin: [0.2, 0, 0],
  lFoot: [-0.3, 0, 0.3],
  rFoot: [-0.3, 0, -0.3],
  lUpper: [-0.4, 0, 0.1],
  rUpper: [-1.2, 0, -0.1],
  lFore: [-0.4, 0, 0],
  rFore: [-0.3, 0, 0],
})

/** Holding something small at the waist in both hands, looking at it. */
export const HOLD_LOW = makePose(
  {
    neck: [0.24, 0, 0],
    head: [0.36, 0, 0],
    lUpper: [-0.4, 0, 0.12],
    rUpper: [-0.4, 0, -0.12],
    lFore: [-1.05, 0.35, 0],
    rFore: [-1.05, -0.35, 0],
  },
  STAND,
)

/** A small smile, chin up: purpose. */
export const PURPOSE = makePose(
  {
    spine: [0.04, 0, 0],
    head: [-0.04, 0, 0],
  },
  STAND,
)

/** Treadle rhythm for a stitch phase (0…1 per press): the plate's tilt in radians. */
export const plateTilt = (phase: number) => 0.21 * Math.sin(phase * Math.PI * 2)

/** Smooth 0→1→0 bump between a and b. */
export const bump = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return Math.sin(t * Math.PI)
}
