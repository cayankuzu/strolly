/**
 * K — the plain and the archive (x 900). A dark endless floor with eight
 * plinths of different heights, a translucent child standing on each with
 * eyes closed; the man walks past them. Then the shelving rises: aisles of
 * glass cases to the horizon, a still diorama in each, a brass plate under
 * each — every "almost" kept. At the end of the aisle the boy he was, with
 * the winged can, and a bare bulb that turns his arms into wings. From
 * above, one slot is dark; then it lights: a cliff, a tree, an empty swing.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { makePath } from '../../figure/paths'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { box, cyl, mesh } from '../../util'
import { PI, DEG, rng, ss, win, canvasTexture, setInstance, type Ctx, type Dir, type PSet } from '../common'
import { glowMaterial, shaftMaterial } from '../shaders'
import { Motes } from '../fx'
import { taperTube } from '../geo'
import { closeLids, type Ghost } from '../ghost'
import { makeFigure, H9, H12, H15 } from '../cast'
import type { GhostKey } from '../cast'
import { canLabel } from './void'
import * as PP from '../poses'
import * as P from '../../figure/poses'
import type { Figure } from '../../figure/Figure'

const X = 900
const Z0 = -14
const Z1 = -110
const LEN = Z0 - Z1
const TIERS = [0.3, 1.18, 2.06, 2.94, 3.82]
const UNIT_H = 4.2
const BAY = 2.4
const CASE = { w: 0.35, h: 0.25, d: 0.25 }
/** Unit centre lines (x) of the detailed archive: the main aisle at 900, aisles every 3.6 m. */
const LINES = Array.from({ length: 12 }, (_, i) => X + (i < 6 ? -1 : 1) * (1.8 + 3.6 * (i % 6)))
const SLOT = new THREE.Vector3(901.2 + 0.125, TIERS[4] + CASE.h / 2, -48)
const HERO_Z = [-19.55, -20.0, -20.45]
const HERO_Y = TIERS[1] + CASE.h / 2
const LAMP = new THREE.Vector3(900, 0.3, -28.5)
const BOY_AT = { x: 900, z: -31 }

/** The plinths on the plain: angle, place and height of each (left → right). */
const PLINTHS: Array<{ key: GhostKey; h: number; x: number; z: number; height: number }> = (
  [
    ['roofs', 3.0, H9],
    ['glass', 1.6, H9],
    ['bridge', 1.0, H12],
    ['stones', 2.4, H12],
    ['sea', 0, H12],
    ['bike', 1.2, H15],
    ['slope', 0.8, H15],
    ['socket', 0, H9],
  ] as const
).map(([key, h, height], k) => {
  const th = (-60 + k * 17.14) * DEG
  return { key, h, height, x: X + 9 * Math.sin(th), z: -8 - 9 * Math.cos(th) }
})

const CASE_VERT = /* glsl */ `
attribute float aTile;
attribute float aLit;
varying vec3 vN;
varying vec2 vUv;
varying vec3 vW;
varying float vTile;
varying float vLit;
#include <common>
#include <fog_pars_vertex>
void main() {
  vN = normal;
  vUv = uv;
  vTile = aTile;
  vLit = aLit;
  vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`

const CASE_FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uAmber;
uniform float uAmb;
uniform float uLidGlow;
uniform vec4 uLamps[4];
uniform float uParalelGrade;
varying vec3 vN;
varying vec2 vUv;
varying vec3 vW;
varying float vTile;
varying float vLit;
#include <common>
#include <fog_pars_fragment>
void main() {
  float light = uAmb;
  for (int i = 0; i < 4; i++) {
    vec3 d = vW - uLamps[i].xyz;
    light += uLamps[i].w / (1.0 + dot(d, d) * 0.12);
  }
  vec3 col;
  if (vN.y > 0.5) {
    col = uAmber * (0.25 + 0.75 * uLidGlow) * vLit + uAmber * 0.15 * light;
  } else if (vN.z > 0.5) {
    vec2 uv = (vec2(mod(vTile, 4.0), floor(vTile / 4.0)) + vUv * vec2(1.0, 0.94) + vec2(0.0, 0.03)) / vec2(4.0, 2.0);
    vec3 scene = texture2D(uAtlas, uv).rgb;
    // The miniature is lit from inside; the glass catches a streak of the room's light.
    col = scene * (0.35 + 0.65 * vLit) * (0.55 + 0.9 * light);
    float streak = smoothstep(0.02, 0.0, abs(vUv.x - vUv.y * 0.6 - 0.22)) * 0.25;
    col += vec3(streak) * light;
    float frame = step(vUv.x, 0.03) + step(0.97, vUv.x) + step(vUv.y, 0.04) + step(0.96, vUv.y);
    col = mix(col, vec3(0.12, 0.08, 0.05) * (0.5 + light), clamp(frame, 0.0, 1.0));
  } else {
    col = vec3(0.05, 0.045, 0.04) * (0.6 + light) + uAmber * 0.04 * vLit;
  }
  gl_FragColor = vec4(col, 1.0);
  {
    float gL = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gL) * vec3(0.84, 0.92, 1.1), uParalelGrade * 0.72);
  }
  #include <fog_fragment>
}`

/** Eight little scenes painted for the case fronts (4 × 2 tiles). */
function atlas() {
  return canvasTexture(1024, 512, (g, W, H) => {
    const T = 256
    const tile = (k: number, draw: (ox: number, oy: number) => void) => {
      const ox = (k % 4) * T
      const oy = Math.floor(k / 4) * T
      const gr = g.createLinearGradient(ox, oy, ox, oy + T)
      gr.addColorStop(0, '#2a1d14')
      gr.addColorStop(1, '#5a4030')
      g.fillStyle = gr
      g.fillRect(ox, oy, T, T)
      const glow = g.createRadialGradient(ox + T / 2, oy + T * 0.35, 4, ox + T / 2, oy + T * 0.4, T * 0.7)
      glow.addColorStop(0, 'rgba(255,214,150,0.35)')
      glow.addColorStop(1, 'rgba(255,214,150,0)')
      g.fillStyle = glow
      g.fillRect(ox, oy, T, T)
      g.save()
      g.translate(ox, oy)
      draw(ox, oy)
      g.restore()
      g.fillStyle = '#3a2a1e'
      g.fillRect(ox, oy + T - 34, T, 34)
    }
    const kid = (x: number, y: number, s: number, c = '#c0392b', rot = 0) => {
      g.save()
      g.translate(x, y)
      g.rotate(rot)
      g.fillStyle = c
      g.fillRect(-6 * s, -34 * s, 12 * s, 20 * s)
      g.fillStyle = '#d8b090'
      g.beginPath()
      g.arc(0, -40 * s, 6 * s, 0, PI * 2)
      g.fill()
      g.fillStyle = '#3a4a6a'
      g.fillRect(-6 * s, -14 * s, 5 * s, 14 * s)
      g.fillRect(1 * s, -14 * s, 5 * s, 14 * s)
      g.restore()
    }
    // 0 glass roof: a pane grid, one black square.
    tile(0, () => {
      g.strokeStyle = '#6a7a78'
      g.lineWidth = 3
      for (let i = 0; i <= 6; i++) {
        g.beginPath()
        g.moveTo(30 + i * 33, 140)
        g.lineTo(i * 42, 222)
        g.stroke()
      }
      for (let j = 0; j < 4; j++) {
        g.beginPath()
        g.moveTo(10, 150 + j * 22)
        g.lineTo(246, 150 + j * 22)
        g.stroke()
      }
      g.fillStyle = '#050505'
      g.fillRect(118, 172, 34, 20)
      kid(170, 168, 1.6)
    })
    // 1 the wave: a green curl over a tiny swimmer.
    tile(1, () => {
      g.fillStyle = '#2e6a5a'
      g.beginPath()
      g.moveTo(10, 222)
      g.quadraticCurveTo(60, 60, 170, 70)
      g.quadraticCurveTo(230, 80, 210, 130)
      g.quadraticCurveTo(170, 100, 150, 160)
      g.quadraticCurveTo(140, 200, 246, 222)
      g.fill()
      g.fillStyle = '#e8f0ea'
      g.fillRect(150, 66, 60, 8)
      kid(120, 215, 1.2, '#1f2c4a', -1.2)
    })
    // 2 the socket: a wall, the socket, a kneeling child, a blue spark.
    tile(2, () => {
      g.fillStyle = '#7a8ca0'
      g.fillRect(0, 40, T, 182)
      g.fillStyle = '#efece4'
      g.fillRect(150, 170, 22, 22)
      g.fillStyle = '#dcebff'
      g.beginPath()
      g.arc(150, 180, 8, 0, PI * 2)
      g.fill()
      kid(118, 222, 1.7, '#7d8ca3')
    })
    // 3 the parapet: two roofs, a gap, a leaping child.
    tile(3, () => {
      g.fillStyle = '#8a8278'
      g.fillRect(0, 150, 110, 72)
      g.fillRect(150, 165, 106, 57)
      g.fillStyle = '#0a0806'
      g.fillRect(110, 150, 40, 72)
      kid(130, 120, 1.5, '#c0392b', 0.5)
    })
    // 4 the bike: a cleft, a bike nose-down.
    tile(4, () => {
      g.fillStyle = '#9a7a52'
      g.fillRect(0, 150, 100, 72)
      g.fillRect(156, 170, 100, 52)
      g.fillStyle = '#0a0806'
      g.fillRect(100, 150, 56, 72)
      g.strokeStyle = '#111'
      g.lineWidth = 4
      g.beginPath()
      g.arc(118, 170, 14, 0, PI * 2)
      g.arc(134, 200, 14, 0, PI * 2)
      g.stroke()
    })
    // 5 the beam: a girder, a hanging child, white water below.
    tile(5, () => {
      g.fillStyle = '#3e4a45'
      g.fillRect(0, 60, T, 16)
      g.fillStyle = '#e8ecea'
      g.fillRect(0, 200, T, 22)
      kid(128, 150, 1.6, '#6b7a3a', PI)
    })
    // 6 the cliff: an edge, a seated child, a falling stone.
    tile(6, () => {
      g.fillStyle = '#c8bca8'
      g.fillRect(0, 120, 120, 102)
      kid(110, 122, 1.4, '#6b7a3a')
      g.fillStyle = '#6e6458'
      g.beginPath()
      g.arc(150, 180, 5, 0, PI * 2)
      g.fill()
    })
    // 7 the slope: a hillside, a hole in the path.
    tile(7, () => {
      g.fillStyle = '#8a6e52'
      g.beginPath()
      g.moveTo(0, 222)
      g.lineTo(0, 120)
      g.lineTo(256, 70)
      g.lineTo(256, 222)
      g.fill()
      g.fillStyle = '#050403'
      g.beginPath()
      g.ellipse(140, 104, 22, 9, -0.2, 0, PI * 2)
      g.fill()
      kid(190, 92, 1.3, '#1c1c1f')
    })
    void W
    void H
  })
}

function plateTexture(text: string) {
  return canvasTexture(256, 64, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H)
    gr.addColorStop(0, '#d8b46a')
    gr.addColorStop(1, '#8a6a32')
    g.fillStyle = gr
    g.fillRect(0, 0, W, H)
    g.strokeStyle = 'rgba(60,40,10,0.7)'
    g.lineWidth = 3
    g.strokeRect(3, 3, W - 6, H - 6)
    g.fillStyle = '#2a1a08'
    g.font = '700 30px serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(text, W / 2, H / 2 + 1)
  })
}

export class ArchiveSet implements PSet {
  readonly group = new THREE.Group()
  private plain = new THREE.Group()
  private plinths: THREE.Mesh[] = []
  private glows: THREE.Mesh[] = []
  private archive = new THREE.Group()
  private parquet!: THREE.MeshStandardMaterial
  private caseMat!: THREE.ShaderMaterial
  private lamps: Array<{ pos: THREE.Vector3; shade: THREE.Mesh; pool: THREE.Mesh; cone: THREE.Mesh; order: number }> = []
  private bulb!: THREE.Mesh
  private bulbGlow!: THREE.Mesh
  private can = new THREE.Group()
  private slotDark!: THREE.Group
  private slotLit!: THREE.Group
  private swingPivot = new THREE.Group()
  private dust!: Motes
  private redGlow!: THREE.Mesh
  private minis: Figure[] = []
  private v = new THREE.Vector3()
  private q = new THREE.Quaternion()
  private arc = makePath(
    Array.from({ length: 13 }, (_, i) => {
      const th = (-72 + i * 12) * DEG
      return [X + 6.2 * Math.sin(th), -8 - 6.2 * Math.cos(th)] as [number, number]
    }),
  )

  build(c: Ctx) {
    const g = this.group
    const rand = rng(9009)
    const shared = c.env.shared

    // ——— The plain ———
    const floor = mesh(new THREE.PlaneGeometry(600, 600).rotateX(-PI / 2), new THREE.MeshStandardMaterial({ color: 0x0b0f1a, roughness: 0.32, metalness: 0.35 }), X, 0, -100, g)
    floor.receiveShadow = true
    floor.name = 'plain-floor'
    const stone = pbr('concrete', 0x6a6e78, { roughness: 0.9, emissive: 0x0c1220 })
    for (const p of PLINTHS) {
      const h = Math.max(p.h, 0.001)
      const m = box(0.6, h, 0.6, stone, p.x, h / 2, p.z, this.plain)
      m.castShadow = true
      m.receiveShadow = true
      m.name = `plinth-${p.key}`
      m.visible = p.h > 0
      this.plinths.push(m)
      const gl = mesh(new THREE.PlaneGeometry(1.6, 1.6).rotateX(-PI / 2), glowMaterial(0x9fd8ff, 0.35), p.x, p.h + 0.01, p.z, this.plain)
      this.glows.push(gl)
    }
    g.add(this.plain)

    // ——— The archive ———
    const a = this.archive
    g.add(a)
    this.parquet = pbr('planks', 0x5a3e28, { roughness: 0.6, transparent: true, opacity: 1 })
    const pq = mesh(new THREE.PlaneGeometry(90, 300).rotateX(-PI / 2), this.parquet, X, 0.004, Z0 - 150 + 1, g)
    pq.receiveShadow = true
    pq.name = 'parquet'
    const wood = pbr('wood', 0x3e2a1a, { roughness: 0.7 })
    const woodDark = pbr('wood', 0x2a1c12, { roughness: 0.8 })
    const nLines = LINES.length
    const board = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.04, LEN), wood, nLines * TIERS.length)
    const back = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, UNIT_H, LEN), woodDark, nLines)
    const kick = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.28, LEN), woodDark, nLines)
    const nBays = Math.floor(LEN / BAY)
    const side = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, UNIT_H, 0.05), wood, nLines * (nBays + 1))
    let bi = 0
    let si = 0
    LINES.forEach((x, li) => {
      for (const y of TIERS) setInstance(board, bi++, x, y - 0.02, Z0 - LEN / 2)
      setInstance(back, li, x, UNIT_H / 2, Z0 - LEN / 2)
      setInstance(kick, li, x, 0.14, Z0 - LEN / 2)
      for (let b = 0; b <= nBays; b++) setInstance(side, si++, x, UNIT_H / 2, Z0 - b * BAY)
    })
    for (const im of [board, back, kick, side]) {
      im.instanceMatrix.needsUpdate = true
      im.castShadow = true
      im.receiveShadow = true
      im.computeBoundingSphere()
      a.add(im)
    }
    board.name = 'shelf-board'
    side.name = 'shelf-side'
    back.name = 'shelf-back'
    kick.name = 'shelf-kick'

    // The cases: one instanced mesh, a painted miniature on each front, an amber lid.
    const caseGeo = new THREE.BoxGeometry(CASE.w, CASE.h, CASE.d)
    const tiles: number[] = []
    const lits: number[] = []
    const mats: THREE.Matrix4[] = []
    const plates: THREE.Matrix4[] = []
    const m4 = new THREE.Matrix4()
    const e = new THREE.Euler()
    const one = new THREE.Vector3(1, 1, 1)
    for (const x of LINES)
      for (const face of [-1, 1]) {
        const cx = x + face * (0.6 - CASE.d / 2)
        const yaw = face > 0 ? PI / 2 : -PI / 2
        for (const ty of TIERS)
          for (let b = 0; b < nBays; b++)
            for (let k = 0; k < 5; k++) {
              const cz = Z0 - b * BAY - 0.3 - k * 0.45
              const cy = ty + CASE.h / 2
              if (Math.abs(cx - SLOT.x) < 0.05 && Math.abs(cy - SLOT.y) < 0.05 && Math.abs(cz - SLOT.z) < 0.2) continue
              if (Math.abs(cx - (898.8 - CASE.d / 2)) < 0.05 && Math.abs(cy - HERO_Y) < 0.05 && HERO_Z.some((hz) => Math.abs(cz - hz) < 0.2)) continue
              if (rand() < 0.04) continue
              m4.compose(this.v.set(cx, cy, cz), this.q.setFromEuler(e.set(0, yaw, 0)), one)
              mats.push(m4.clone())
              tiles.push(Math.floor(rand() * 8))
              lits.push(0.6 + rand() * 0.4)
              plates.push(new THREE.Matrix4().compose(new THREE.Vector3(x + face * 0.605, ty - 0.03, cz), this.q, one))
            }
      }
    // Snap the case rows so the slot falls exactly between neighbours.
    this.caseMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uAtlas: { value: null },
          uAmber: { value: new THREE.Color(0xe8b46a) },
          uAmb: { value: 0.15 },
          uLidGlow: { value: 1 },
          uLamps: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
        },
      ]),
      vertexShader: CASE_VERT,
      fragmentShader: CASE_FRAG,
      fog: true,
    })
    this.caseMat.uniforms.uAtlas.value = atlas()
    this.caseMat.uniforms.uParalelGrade = shared.grade
    const cases = new THREE.InstancedMesh(caseGeo, this.caseMat, mats.length)
    mats.forEach((mm, i) => cases.setMatrixAt(i, mm))
    caseGeo.setAttribute('aTile', new THREE.InstancedBufferAttribute(new Float32Array(tiles), 1))
    caseGeo.setAttribute('aLit', new THREE.InstancedBufferAttribute(new Float32Array(lits), 1))
    cases.instanceMatrix.needsUpdate = true
    cases.computeBoundingSphere()
    cases.name = 'case'
    a.add(cases)
    const brass = new THREE.MeshStandardMaterial({ color: 0xb8904a, metalness: 0.85, roughness: 0.35 })
    const plateIm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.004, 0.022, 0.09), brass, plates.length)
    plates.forEach((mm, i) => plateIm.setMatrixAt(i, mm))
    plateIm.instanceMatrix.needsUpdate = true
    plateIm.computeBoundingSphere()
    plateIm.name = 'brass-plate'
    a.add(plateIm)

    // Simpler units beyond, to the horizon; and the aisles going on past the detailed stretch.
    const far = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, UNIT_H, 1), woodDark, 60)
    const farTop = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.02, 1), new THREE.MeshBasicMaterial({ color: 0x8a6a3a }), 60)
    let fi = 0
    for (let k = 6; k < 12; k++)
      for (const sx of [-1, 1]) {
        const x = X + sx * (1.8 + 3.6 * k)
        setInstance(far, fi, x, UNIT_H / 2, -150, 0, 0, 0, 1, 1, 280)
        setInstance(farTop, fi, x, UNIT_H + 0.01, -150, 0, 0, 0, 1, 1, 280)
        fi++
      }
    for (const x of LINES) {
      setInstance(far, fi, x, UNIT_H / 2, Z1 - 100, 0, 0, 0, 1, 1, 200)
      setInstance(farTop, fi, x, UNIT_H + 0.01, Z1 - 100, 0, 0, 0, 1, 1, 200)
      fi++
    }
    far.count = fi
    farTop.count = fi
    for (const im of [far, farTop]) {
      im.instanceMatrix.needsUpdate = true
      im.computeBoundingSphere()
      im.frustumCulled = false
      a.add(im)
    }
    far.name = 'far-shelves'

    // The cross-wall closing the main aisle at z −36: the back of a unit, plain wood (the shadow's screen).
    const cross = box(2.5, UNIT_H, 1.2, woodDark, X, UNIT_H / 2, -36.6, a)
    cross.receiveShadow = true
    cross.name = 'cross-wall'
    const panel = mesh(new THREE.PlaneGeometry(2.4, 4.0), pbr('wood', 0x5a4030, { roughness: 0.75 }), X, 2.05, -35.99, a)
    panel.receiveShadow = true
    panel.name = 'cross-wall-panel'

    // Floor lamps: a pole and a parchment shade, a pool on the floor, a cone of dusty light.
    const pole = pbr('metal', 0x2a2a2a, { roughness: 0.5 })
    const shadeMat = () => new THREE.MeshBasicMaterial({ color: 0xffd8a0, side: THREE.DoubleSide })
    const lampAt = (x: number, z: number, order: number) => {
      cyl(0.015, 0.02, 1.75, pole, x, 0.875, z, a, 8)
      cyl(0.16, 0.16, 0.02, pole, x, 0.01, z, a, 16)
      const shade = mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.24, 18, 1, true), shadeMat(), x, 1.8, z, a)
      const pool = mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-PI / 2), glowMaterial(0xe8b46a, 0.5), x, 0.012, z, a)
      const coneGeo = new THREE.CylinderGeometry(0.2, 1.3, 1.75, 20, 1, true)
      const cone = mesh(coneGeo, shaftMaterial(0xe8b46a, 0.12), x, 0.9, z, a)
      cone.renderOrder = 4
      this.lamps.push({ pos: new THREE.Vector3(x, 1.75, z), shade, pool, cone, order })
    }
    let order = 0
    lampAt(899.0, -16.5, order++)
    lampAt(896.4, -21, order++)
    lampAt(903.6, -21, order++)
    lampAt(896.4, -33, order++)
    lampAt(903.6, -33, order++)
    lampAt(900.9, -42, order++)
    lampAt(899.1, -54, order++)
    lampAt(896.4, -45, order++)
    lampAt(903.6, -45, order++)
    lampAt(892.8, -27, order++)
    lampAt(907.2, -27, order++)
    lampAt(896.4, -57, order++)
    lampAt(903.6, -57, order++)
    lampAt(900.9, -66, order++)

    // The bare bulb on a low stand, between the man and the boy.
    cyl(0.1, 0.12, 0.03, pole, LAMP.x, 0.015, LAMP.z, a, 16)
    cyl(0.008, 0.008, 0.22, pole, LAMP.x, 0.13, LAMP.z, a, 8)
    this.bulb = mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2d8 }), LAMP.x, LAMP.y, LAMP.z, a)
    this.bulb.name = 'bare-bulb'
    this.bulbGlow = mesh(new THREE.PlaneGeometry(0.7, 0.7), glowMaterial(0xffe2b0, 0.6), LAMP.x, LAMP.y, LAMP.z + 0.05, a)

    // The winged can in the boy's hand.
    const metal = new THREE.MeshStandardMaterial({ color: 0xc9d6ea, metalness: 0.85, roughness: 0.32, map: canLabel() })
    const body = new THREE.CylinderGeometry(0.033, 0.033, 0.13, 24, 1, true)
    body.rotateY(-PI / 2)
    mesh(body, metal, 0, 0, 0, this.can)
    mesh(new THREE.CylinderGeometry(0.03, 0.033, 0.015, 24), new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 0.95, roughness: 0.25 }), 0, 0.072, 0, this.can)
    mesh(new THREE.CylinderGeometry(0.033, 0.03, 0.015, 24), new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 0.95, roughness: 0.25 }), 0, -0.072, 0, this.can)
    this.can.traverse((o) => (o.castShadow = true))
    this.can.name = 'winged-can'
    g.add(this.can)

    // Three cases up close (the insert), with real miniatures; and the slot that lights.
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.12, metalness: 0, depthWrite: false })
    const baseMat = pbr('wood', 0x3a2618, { roughness: 0.6 })
    const caseShell = (parent: THREE.Object3D, label: string) => {
      box(CASE.d, 0.02, CASE.w, baseMat, 0, -CASE.h / 2 + 0.01, 0, parent)
      box(CASE.d, 0.012, CASE.w, new THREE.MeshBasicMaterial({ color: 0x8a6a3a }), 0, CASE.h / 2 - 0.006, 0, parent)
      const gl = box(CASE.d, CASE.h - 0.03, CASE.w, glass, 0, 0, 0, parent)
      gl.renderOrder = 6
      // The brass plate on the shelf edge in front (toward −x… the aisle side is local +x here).
      const plate = mesh(new THREE.PlaneGeometry(0.16, 0.04), new THREE.MeshStandardMaterial({ map: plateTexture(label), metalness: 0.6, roughness: 0.4 }), CASE.d / 2 + 0.006, -CASE.h / 2 - 0.035, 0, parent)
      plate.rotation.y = PI / 2
      plate.name = 'label-plate'
    }
    const hero = (z: number, label: string) => {
      const grp = new THREE.Group()
      grp.position.set(898.8 - CASE.d / 2, HERO_Y, z)
      caseShell(grp, label)
      a.add(grp)
      return grp
    }
    const mini = (who: Parameters<typeof makeFigure>[0], h: number, name: string) => {
      const f = makeFigure(who, name, h)
      this.minis.push(f)
      return f
    }
    // A boy on broken glass.
    const hA = hero(HERO_Z[0], '9 · CAM ÇATI')
    const gridTex = canvasTexture(128, 128, (gg, W, H) => {
      gg.fillStyle = '#9cc9c2'
      gg.fillRect(0, 0, W, H)
      gg.fillStyle = '#3a4248'
      for (let k = 0; k <= 4; k++) {
        gg.fillRect((k * W) / 4 - 2, 0, 4, H)
        gg.fillRect(0, (k * H) / 4 - 2, W, 4)
      }
      gg.fillStyle = '#050505'
      gg.fillRect(W / 4 + 2, H / 2 + 2, W / 4 - 4, H / 4 - 4)
    })
    const pane = mesh(new THREE.PlaneGeometry(0.22, 0.3).rotateX(-PI / 2), new THREE.MeshStandardMaterial({ map: gridTex, roughness: 0.2, metalness: 0.2 }), 0, -CASE.h / 2 + 0.022, 0, hA)
    pane.rotation.y = PI / 2
    const fA = mini('boy9', 0.08, 'mini-glass')
    fA.root.position.set(0.02, -CASE.h / 2 + 0.023, 0.05)
    fA.root.rotation.y = PI / 2
    hA.add(fA.root)
    // A boy under a resin wave.
    const hB = hero(HERO_Z[1], '12 · DENİZ')
    box(0.22, 0.012, 0.3, pbr('sand', 0xcdb68e, { roughness: 1 }), 0, -CASE.h / 2 + 0.026, 0, hB)
    const resin = new THREE.MeshPhysicalMaterial({ color: 0x2e7a64, roughness: 0.1, transparent: true, opacity: 0.6, depthWrite: false })
    // The wave: a resin sheet rising behind him and curling over (a thick arc across the case).
    const curl = mesh(new THREE.TorusGeometry(0.075, 0.022, 10, 28, PI * 1.1), resin, -0.03, -CASE.h / 2 + 0.03, 0, hB)
    curl.rotation.set(0, 0, 0.15)
    curl.scale.set(1, 1.15, 4.2)
    curl.renderOrder = 6
    const fB = mini('boy12swim', 0.07, 'mini-sea')
    fB.root.position.set(0.01, -CASE.h / 2 + 0.06, 0.03)
    fB.root.rotation.set(-1.2, PI / 2, 0)
    hB.add(fB.root)
    // A boy at a socket.
    const hC = hero(HERO_Z[2], '9 · PRİZ')
    box(0.01, 0.17, 0.3, pbr('plaster', 0xa9bdd0, { roughness: 1 }), -0.1, -0.03, 0, hC)
    box(0.004, 0.02, 0.02, new THREE.MeshStandardMaterial({ color: 0xf0eee8 }), -0.093, -0.085, 0, hC)
    const fC = mini('boy9pj', 0.08, 'mini-socket')
    fC.root.position.set(-0.03, -CASE.h / 2 + 0.02, 0)
    fC.root.rotation.y = -PI / 2
    hC.add(fC.root)

    // The dark slot, and the case that lights in it: a cliff, an old tree, an empty swing.
    this.slotDark = new THREE.Group()
    this.slotDark.position.copy(SLOT)
    box(CASE.d, CASE.h, CASE.w, new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.3, metalness: 0.2 }), 0, 0, 0, this.slotDark)
    this.slotDark.name = 'dark-slot'
    a.add(this.slotDark)
    this.slotLit = new THREE.Group()
    this.slotLit.position.copy(SLOT)
    caseShell(this.slotLit, 'ŞU AN · SALINCAK')
    this.slotLit.getObjectByName('label-plate')!.position.x = -CASE.d / 2 - 0.006
    this.slotLit.getObjectByName('label-plate')!.rotation.y = -PI / 2
    // The back of the case (+x, away from the aisle) is a painted dusk over a valley.
    const dusk = canvasTexture(256, 192, (dg, W, H) => {
      const gr = dg.createLinearGradient(0, 0, 0, H)
      gr.addColorStop(0, '#3e3466')
      gr.addColorStop(0.55, '#b0607a')
      gr.addColorStop(0.75, '#f08a4b')
      gr.addColorStop(1, '#1e2a44')
      dg.fillStyle = gr
      dg.fillRect(0, 0, W, H)
      dg.fillStyle = '#2a2a48'
      dg.beginPath()
      dg.moveTo(0, H * 0.78)
      for (let x = 0; x <= W; x += 16) dg.lineTo(x, H * 0.74 - 10 * Math.sin(x * 0.05))
      dg.lineTo(W, H)
      dg.lineTo(0, H)
      dg.fill()
    })
    const backdrop = mesh(new THREE.PlaneGeometry(CASE.w - 0.01, CASE.h - 0.03), new THREE.MeshBasicMaterial({ map: dusk }), CASE.d / 2 - 0.006, 0.0, 0, this.slotLit)
    backdrop.rotation.y = -PI / 2
    // Near half: the rock ledge (toward the aisle, −x); the edge runs across at local x ≈ 0.
    const rockMat = pbr('rock', 0x6a6058, { roughness: 1 })
    const ledge = box(0.12, 0.05, CASE.w - 0.02, rockMat, -0.065, -CASE.h / 2 + 0.045, 0, this.slotLit)
    ledge.castShadow = true
    for (let k = 0; k < 7; k++) mesh(new THREE.DodecahedronGeometry(0.005 + 0.004 * rand(), 0), rockMat, -0.1 + rand() * 0.05, -CASE.h / 2 + 0.072, -0.15 + k * 0.05, this.slotLit)
    // The old tree: rooted on the ledge to the right (+z), leaning out, one branch over the void.
    const bark = pbr('wood', 0x3a2a1e, { roughness: 1 })
    const ty0 = -CASE.h / 2 + 0.07
    mesh(taperTube([new THREE.Vector3(-0.06, ty0, 0.08), new THREE.Vector3(-0.055, ty0 + 0.05, 0.075), new THREE.Vector3(-0.03, ty0 + 0.1, 0.06), new THREE.Vector3(-0.005, ty0 + 0.12, 0.05)], (t) => 0.009 * (1 - 0.5 * t), { segments: 12, radial: 6 }), bark, 0, 0, 0, this.slotLit)
    mesh(taperTube([new THREE.Vector3(-0.005, ty0 + 0.12, 0.05), new THREE.Vector3(0.0, ty0 + 0.122, 0.0), new THREE.Vector3(0.0, ty0 + 0.118, -0.05)], (t) => 0.005 * (1 - 0.5 * t), { segments: 8, radial: 6 }), bark, 0, 0, 0, this.slotLit)
    for (let k = 0; k < 26; k++) mesh(new THREE.TetrahedronGeometry(0.0035), new THREE.MeshStandardMaterial({ color: 0x5b6532, roughness: 0.9 }), -0.02 + rand() * 0.04, ty0 + 0.12 + rand() * 0.025, -0.03 + rand() * 0.09, this.slotLit)
    // The swing: two threads from the branch and a seat, past the edge (local +x is the void).
    this.swingPivot.position.set(0.0, ty0 + 0.116, -0.012)
    const thread = new THREE.MeshStandardMaterial({ color: 0xb39a72, roughness: 1 })
    for (const sz of [-0.007, 0.007]) {
      const r = mesh(new THREE.CylinderGeometry(0.0007, 0.0007, 0.092, 4), thread, 0, -0.046, sz, this.swingPivot)
      r.castShadow = true
    }
    box(0.006, 0.0015, 0.018, pbr('wood', 0x6e5038, { roughness: 0.8 }), 0, -0.092, 0, this.swingPivot)
    this.slotLit.add(this.swingPivot)
    this.slotLit.name = 'swing-case'
    a.add(this.slotLit)

    // Dust in the light; a faint red at the far vanishing point.
    this.dust = new Motes(500, 0xffe2b0, 0.012, [3, 3.4, 10], 0.55, true, 91)
    g.add(this.dust.points)
    this.redGlow = mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ color: 0x5a1a14, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, map: glowMaterial(0xffffff).map }), X, 6, -220, a)
    this.redGlow.renderOrder = -5
    void lerp
    void clamp
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    const onPlain = seg === 'bodies' || (seg === 'room' && u < 0.32)
    // Shelving rises in `room` 0.08–0.3; plinths sink 0–0.18.
    const rise = seg === 'bodies' ? 0 : seg === 'room' ? ss(0.08, 0.3, u) : 1
    const sink = seg === 'bodies' ? 0 : seg === 'room' ? ss(0.0, 0.18, u) : 1
    this.archive.visible = rise > 0.001
    this.archive.position.y = -(UNIT_H + 0.4) * (1 - rise)
    this.plain.visible = sink < 0.999
    this.plinths.forEach((m, i) => {
      const h = PLINTHS[i].h
      m.position.y = h / 2 - h * sink
      this.glows[i].position.y = h * (1 - sink) + 0.01
      ;(this.glows[i].material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - sink)
    })
    this.parquet.opacity = ss(0.12, 0.3, rise)
    this.parquet.transparent = this.parquet.opacity < 0.999

    // Light: blue-black on the plain; amber pools in the archive.
    const amber = rise
    env.sky.set(
      {
        zenith: 0x05070d,
        horizon: amber > 0.5 ? 0x1a0e0a : 0x0b1020,
        below: 0x05070d,
        haze: 0x0b1020,
        hazeAmt: 0,
        sunColor: 0,
        disc: 0,
        glow: 0,
        cloud: 0,
        cloudLit: 0,
        cloudShade: 0,
      },
      new THREE.Vector3(0, 1, 0),
    )
    env.setSun(new THREE.Vector3(X, 0, -14), new THREE.Vector3(0.2, 1, 0.3), 0x8090c0, 0.0, 8)
    env.setHemi(amber > 0.5 ? 0x4a3020 : 0x2a3a66, 0x05060a, amber > 0.5 ? 0.35 : 0.55)
    const fogC = new THREE.Color(0x05070d).lerp(new THREE.Color(0x140e0a), amber)
    env.setFog(fogC, seg === 'exception' ? lerp(0.035, 0.012, ss(0, 0.6, u)) : seg === 'bodies' ? 0.045 : 0.034)
    env.ibl('brown_photostudio_02', amber > 0.5 ? 0.12 : 0.05)
    this.redGlow.visible = amber > 0.5

    // Lamps blink on one by one into the distance during `room`.
    const lampsOn = (k: number) => (seg === 'bodies' ? 0 : seg === 'room' ? ss(0.06 + k * 0.022, 0.08 + k * 0.022, u) : 1)
    const dim = seg === 'devil' ? 0.35 : 1
    const ul = this.caseMat.uniforms.uLamps.value as THREE.Vector4[]
    // The nearest three lamps are real lights; all four nearest feed the case shader.
    const cam = shot.pos
    const sorted = [...this.lamps].sort((p, q) => p.pos.distanceToSquared(cam) - q.pos.distanceToSquared(cam))
    for (const L of this.lamps) {
      const on = lampsOn(L.order) * dim
      ;(L.shade.material as THREE.MeshBasicMaterial).color.setRGB(0.25 + 0.75 * on, 0.18 + 0.67 * on, 0.1 + 0.53 * on)
      ;(L.pool.material as THREE.MeshBasicMaterial).opacity = 0.45 * on
      ;(L.cone.material as THREE.ShaderMaterial).uniforms.uStrength.value = 0.1 * on
    }
    for (let i = 0; i < 4; i++) {
      const L = sorted[i]
      const on = lampsOn(L.order) * dim
      ul[i].set(L.pos.x, L.pos.y + this.archive.position.y, L.pos.z, 1.1 * on)
      if (i < 3 && amber > 0.01) env.point(i, L.pos.x, L.pos.y - 0.1 + this.archive.position.y, L.pos.z, 0xe8b46a, 4.5 * on * amber, 9)
    }
    this.caseMat.uniforms.uAmb.value = seg === 'exception' ? 0.25 : 0.12
    this.caseMat.uniforms.uLidGlow.value = seg === 'exception' || seg === 'diorama' ? 1 : 0.4
    this.dust.points.visible = amber > 0.3
    this.dust.update(X, 1.8, seg === 'room' ? lerp(-16, -24, ss(0.3, 1, u)) : -26, t, [0.03, -0.02, 0.01])

    // The bare bulb and the slot.
    const bulbOn = seg === 'devil' || seg === 'exception' ? 1 : seg === 'room' ? ss(0.26, 0.3, u) : 0
    this.bulb.visible = this.archive.visible
    ;(this.bulb.material as THREE.MeshBasicMaterial).color.setRGB(0.2 + 0.8 * bulbOn, 0.18 + 0.77 * bulbOn, 0.15 + 0.7 * bulbOn)
    this.bulbGlow.visible = bulbOn > 0.01
    if (seg === 'devil') env.setSpot(env.spot, new THREE.Vector3(LAMP.x, LAMP.y + 0.02, LAMP.z - 0.06), new THREE.Vector3(X, 2.2, -36), 0xffe2b0, 30, 1.05, 0.25, 14)
    const lit = seg === 'diorama' ? ss(0.06, 0.15, u) : 0
    this.slotDark.visible = lit < 0.5
    this.slotLit.visible = lit >= 0.5
    if (lit > 0) {
      env.point(2, SLOT.x - 0.02, SLOT.y + 0.06, SLOT.z, 0xf0a070, 0.6 * lit, 0.6)
      this.swingPivot.rotation.x = 0
      this.swingPivot.rotation.z = (f.reduced ? 0.15 : 0.35) * Math.sin(t * 1.9)
    }

    // ——— People ———
    const man = cast.solids.man
    man.begin()
    man.visible = seg !== 'diorama'
    if (seg === 'bodies') {
      man.walk(this.arc, ss(0, 1, u), PP.POCKETS, undefined, undefined, 0.85)
      man.lookAt(X, -17, 0.5)
    } else if (seg === 'room') {
      const k = ss(0.3, 1, u)
      if (u < 0.3) {
        // From the end of the plinths' arc into the mouth of the main aisle as the shelves rise.
        const w = ss(0, 0.3, u)
        man.place(lerp(905.6, X, w), lerp(-10.2, Z0 + 0.5, w), Math.atan2(X - 905.6, Z0 + 0.5 + 10.2))
        man.hold(PP.POCKETS)
        addWalkTo(man, w * 9, 0.6)
      } else {
        man.place(X, lerp(Z0 + 0.5, -24, k), PI)
        man.hold(PP.POCKETS)
        addWalkTo(man, k * 16, 0.6 * (1 - ss(0.94, 1, u)))
        man.lookAt(898.8, -20, win(0.55, 0.62, 0.85, 0.92, u) * 0.9)
      }
    } else {
      man.place(X + 0.1, -24, PI)
      man.hold(PP.POCKETS)
    }
    man.apply(t, true)
    d.step = man.step
    d.walking = man.walking

    const boy = cast.solids.boy9
    boy.begin()
    const boyHere = seg === 'devil' || (seg === 'exception' && u < 0.5)
    boy.visible = boyHere
    this.can.visible = boyHere
    if (boyHere) {
      boy.place(BOY_AT.x, BOY_AT.z, 0)
      const wings = seg === 'devil' ? ss(0.54, 0.8, u) : 1
      boy.blend(
        [
          [0, P.STAND],
          [1, PP.WINGS],
        ],
        wings,
      )
      // The can low in his right hand, then out to the side with the arm.
      boy.pose[2 + 8 * 3] += -0.25 * (1 - wings)
      boy.pose[2 + 9 * 3] += -0.6 * (1 - wings)
      // Looking at the man calmly (head up a little: he is a child).
      boy.pose[2 + 4 * 3] += -0.12
      boy.apply(t, true)
      if (seg === 'exception') boy.visible = ss(0.3, 0.5, u) < 0.5
      boy.figure.rGrip.getWorldPosition(this.v)
      boy.figure.rGrip.getWorldQuaternion(this.q)
      this.can.position.copy(this.v)
      this.can.quaternion.copy(this.q)
      this.can.rotateX(-PI / 2 + 0.1)
    } else boy.apply(t, false)

    // The dead on their plinths: eyes closed, arms at their sides, glowing.
    if (onPlain) {
      PLINTHS.forEach((p, i) => {
        const gh: Ghost = cast.ghosts[p.key]
        const gm = gh.material.uniforms
        gm.uColor.value.set(0xcfefff)
        gm.uRimColor.value.set(0xffffff)
        cast.ghost(
          gh,
          u,
          (a) => {
            a.place(p.x, p.z, Math.atan2(X - p.x, 6 - p.z))
            a.hold(PP.STILL)
            a.y = p.h * (1 - sink)
            return 0.36 * (1 - sink)
          },
          t,
          { after: () => closeLids(cast.ghosts[p.key].lids, 1) },
        )
        void i
      })
    }

    if (seg === 'bodies') {
      const near = [...PLINTHS].sort((p, q) => Math.hypot(p.x - man.x, p.z - man.z) - Math.hypot(q.x - man.x, q.z - man.z))
      near.slice(0, 3).forEach((p, i) => env.point(i, p.x, p.h + 1.0, p.z + 0.6, 0x9fd8ff, 2.2, 7))
    }

    // ——— Camera ———
    this.camera(d)
    void cu
  }

  private camera(d: Dir) {
    const { seg, u, cu, shot, cast } = d
    const man = cast.solids.man
    switch (seg) {
      case 'bodies': {
        if (cu < 0.6)
          keyed(
            [
              [0, [897.2, 2.0, 2.6, 900.6, 1.4, -13, 50]],
              [1, [902.8, 1.9, 2.0, 899.8, 1.4, -13, 50]],
            ],
            cu / 0.6,
            shot,
          )
        else
          keyed(
            [
              [0, [900.4, 1.6, -3.6, 893.4, 1.9, -12.4, 46]],
              [1, [900.4, 1.6, -3.6, 907.4, 1.2, -12.4, 46]],
            ],
            (cu - 0.6) / 0.4,
            shot,
          )
        shot.handheld = 0.3
        break
      }
      case 'room': {
        if (cu < 0.4) {
          const k = ss(0, 0.4, cu)
          shot.pos.set(X - 0.3, lerp(0.4, 2.4, k), lerp(-8.5, -11.0, k))
          shot.tgt.set(X, lerp(1.0, 1.8, k), -40)
          shot.fov = 50
        } else if (cu > 0.6 && cu < 0.86) {
          // Insert: the three cases and their plates.
          const k = ss(0.6, 0.86, cu)
          shot.pos.set(lerp(899.95, 899.75, k), 1.4, lerp(-19.8, -19.92, k))
          shot.tgt.set(898.7, HERO_Y - 0.03, -20.0)
          shot.fov = 30
        } else {
          shot.pos.set(man.x - 1.0, 1.55, man.z + 1.8)
          shot.tgt.set(man.x + 0.1, 1.35, man.z - 4)
          shot.fov = 44
        }
        shot.handheld = 0.35
        break
      }
      case 'devil': {
        if (cu < 0.54) {
          shot.pos.set(900.62, 1.72, -22.6)
          shot.tgt.set(BOY_AT.x - 0.2, 1.1, BOY_AT.z)
          shot.fov = 40
        } else {
          const k = ss(0.54, 1, cu)
          shot.pos.set(lerp(900.62, 900.3, k), lerp(1.72, 1.5, k), lerp(-22.6, -25.6, k))
          shot.tgt.set(lerp(BOY_AT.x - 0.2, X, k), lerp(1.1, 2.3, k), lerp(BOY_AT.z, -36, k))
          shot.fov = lerp(40, 34, k)
        }
        shot.handheld = 0.25
        break
      }
      case 'exception': {
        const k = ss(0, 0.6, cu)
        shot.pos.set(lerp(900, 902.6, k), lerp(5, 13.5, k), lerp(-26, -43.5, k))
        shot.tgt.set(lerp(900, SLOT.x, k), lerp(1.2, SLOT.y, k), lerp(-31, SLOT.z, k))
        shot.fov = lerp(50, 40, k)
        shot.handheld = 0.15
        break
      }
      case 'diorama': {
        const k = ss(0.15, 1, cu)
        shot.pos.set(lerp(900.35, 901.06, k), lerp(4.3, SLOT.y + 0.01, k), SLOT.z + lerp(0.02, 0.012, k))
        shot.tgt.set(SLOT.x + 0.05, lerp(SLOT.y - 0.05, SLOT.y - 0.005, k), SLOT.z + 0.01)
        shot.fov = lerp(40, 30, k)
        shot.handheld = 0.1
        break
      }
    }
    void u
  }
}

/** Gait on a held pose by distance (no path). */
function addWalkTo(a: Actor, phase: number, amount: number) {
  if (amount <= 0) return
  const s = Math.sin(phase)
  a.pose[2 + 11 * 3] += -0.5 * amount * s
  a.pose[2 + 14 * 3] += 0.5 * amount * s
  a.pose[2 + 12 * 3] += amount * (0.1 + 0.8 * Math.pow(Math.max(0, Math.cos(phase + 0.9)), 2))
  a.pose[2 + 15 * 3] += amount * (0.1 + 0.8 * Math.pow(Math.max(0, Math.cos(phase + 0.9 + PI)), 2))
  a.pose[2 + 13 * 3] += amount * (0.25 * Math.max(0, s) - 0.12 * Math.max(0, -s))
  a.pose[2 + 16 * 3] += amount * (0.25 * Math.max(0, -s) - 0.12 * Math.max(0, s))
  a.pose[0] += amount * (0.016 * Math.cos(phase * 2) - 0.02)
  a.step = Math.floor(phase / PI)
  a.walking = amount
}
