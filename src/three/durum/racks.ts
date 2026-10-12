/**
 * The server hall's racks as one instanced field: the real 3 × 6 in the hall,
 * and — for AYNA — the same rows repeated past the north wall to z −60,
 * identical, blinking in the same pattern, swallowed by fog. Every rack has a
 * smoked-glass door; behind it, in AYNA, a fainter rack, and a fainter one
 * (the reflection inside the reflection). The LEDs share one shader: a
 * private blink per light, a single wave down the rows (samePace), a global
 * dim (computing). Rack status strips on the aisle ends type words down the rows.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '@/lib/math'
import { hardware } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { drawStripWord } from './screens'

export const RACK_X = [-3.9, -3.25, -2.6, 0.6, 1.25, 1.9]
export const ROW_Z = [-6.0, -8.4, -10.8]
/** Mirror rows: the same three rows again and again, 2.4 m apart, down to z −60. */
export const MIRROR_Z = Array.from({ length: 21 }, (_, i) => -13.2 - i * 2.4)

const LED_PER = 64
const PI = Math.PI

function boxGeo(w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return g
}

/** The face of a rack's units: 30 × 1U plates, vents, drive bays, handles. */
function unitsTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 840
  const x = c.getContext('2d')!
  x.fillStyle = '#0b0d0f'
  x.fillRect(0, 0, 256, 840)
  const rand = mulberry32(9)
  for (let u = 0; u < 30; u++) {
    const y = 6 + u * 27.6
    const kind = rand()
    x.fillStyle = kind < 0.2 ? '#22262b' : '#16191c'
    x.fillRect(4, y, 248, 25)
    x.fillStyle = 'rgba(255,255,255,0.05)'
    x.fillRect(4, y, 248, 2)
    if (kind < 0.55) {
      // Drive bays.
      for (let k = 0; k < 8; k++) {
        x.fillStyle = '#0f1113'
        x.fillRect(46 + k * 24, y + 4, 20, 17)
        x.fillStyle = '#2b3036'
        x.fillRect(48 + k * 24, y + 6, 16, 3)
      }
    } else {
      // Vents.
      x.fillStyle = '#0a0b0c'
      for (let k = 0; k < 30; k++) x.fillRect(60 + k * 6, y + 6, 3, 13)
    }
    // Handles.
    x.fillStyle = '#4a4f55'
    x.fillRect(8, y + 5, 5, 15)
    x.fillRect(243, y + 5, 5, 15)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

const LED_VERT = /* glsl */ `
attribute float aSeed;
attribute float aLevel;
varying vec3 vCol;
varying float vSeed;
varying float vLevel;
varying float vZ;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  #ifdef USE_INSTANCING_COLOR
  vCol = instanceColor;
  #else
  vCol = vec3(1.0);
  #endif
  vSeed = aSeed;
  vLevel = aLevel;
  vZ = wp.z;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const LED_FRAG = /* glsl */ `
uniform float uTime;
uniform float uWave;
uniform float uDim;
uniform float uFreeze;
varying vec3 vCol;
varying float vSeed;
varying float vLevel;
varying float vZ;
#include <fog_pars_fragment>
float hash(float n) { return fract(sin(n) * 43758.5453123); }
void main() {
  float rate = 0.6 + hash(vSeed * 3.1) * 3.0;
  float slot = floor(mix(uTime, 0.0, uFreeze) * rate + vSeed * 17.0);
  float blink = step(0.16, hash(slot * 1.7 + vSeed * 7.3));
  // One wave down the rows, away from the office, at walking pace.
  float ph = fract((vZ + uTime * 1.2) / 4.8);
  float wave = smoothstep(0.0, 0.05, ph) * (1.0 - smoothstep(0.08, 0.2, ph));
  float b = mix(blink, 0.15 + 1.4 * wave, uWave);
  gl_FragColor = vec4(vCol * b * vLevel * uDim * 1.6, 1.0);
  #include <fog_fragment>
}
`

export class RackField {
  readonly group = new THREE.Group()
  readonly realCount: number
  readonly total: number
  private cabinets: THREE.InstancedMesh
  private frames: THREE.InstancedMesh
  private doors: THREE.InstancedMesh
  private units: THREE.InstancedMesh
  private leds: THREE.InstancedMesh
  private ledReal: number
  private unitsReal: number
  readonly ledMat: THREE.ShaderMaterial
  private strips: THREE.InstancedMesh
  private stripCtx: CanvasRenderingContext2D
  private stripTex: THREE.CanvasTexture
  private stripKey = ''
  /** World positions of the racks (x, z), real first. */
  readonly spots: Array<[number, number]> = []
  /** The aisle-end strips' rows, nearest first (for the words running down the rows). */
  readonly stripRows: number[] = []

  constructor() {
    const hw = hardware()
    const rows = [...ROW_Z, ...MIRROR_Z]
    for (const z of rows) for (const x of RACK_X) this.spots.push([x, z])
    this.realCount = ROW_Z.length * RACK_X.length
    this.total = this.spots.length
    const n = this.total
    // Cabinet: sides, top, plinth, back — open at the front behind the door.
    const cab = mergeGeometries([
      boxGeo(0.03, 2.0, 1.0, -0.295, 1.0, 0),
      boxGeo(0.03, 2.0, 1.0, 0.295, 1.0, 0),
      boxGeo(0.62, 0.04, 1.0, 0, 1.98, 0),
      boxGeo(0.62, 0.1, 1.0, 0, 0.05, 0),
      boxGeo(0.62, 2.0, 0.03, 0, 1.0, -0.485),
    ])!
    const body = pbr('painted', 0x1d2125, { roughness: 0.8 })
    this.cabinets = new THREE.InstancedMesh(cab, body, n)
    const fr = mergeGeometries([
      boxGeo(0.03, 1.96, 0.02, -0.29, 1.0, 0.5),
      boxGeo(0.03, 1.96, 0.02, 0.29, 1.0, 0.5),
      boxGeo(0.6, 0.04, 0.02, 0, 1.96, 0.5),
      boxGeo(0.6, 0.06, 0.02, 0, 0.08, 0.5),
      boxGeo(0.012, 0.3, 0.03, 0.25, 1.05, 0.52),
    ])!
    this.frames = new THREE.InstancedMesh(fr, hw.steel, n)
    const doorMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0f13, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.55, depthWrite: false, envMapIntensity: 1.4 })
    this.doors = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.56, 1.86).translate(0, 1.02, 0.505), doorMat, n)
    this.doors.renderOrder = 2
    // Units: the real face, then two fainter copies behind it (AYNA only).
    const unitsMat = new THREE.MeshStandardMaterial({ map: unitsTexture(), roughness: 0.55, metalness: 0.35 })
    const copies = [
      [1, 0.47, 1.0],
      [0.82, 0.27, 0.42],
      [0.66, 0.08, 0.18],
    ] as const
    this.units = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.54, 1.78).translate(0, 1.04, 0), unitsMat, n * 3)
    this.unitsReal = this.realCount
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const s = new THREE.Vector3()
    const col = new THREE.Color()
    this.spots.forEach(([x, z], i) => {
      m4.makeTranslation(x, 0, z)
      this.cabinets.setMatrixAt(i, m4)
      this.frames.setMatrixAt(i, m4)
      this.doors.setMatrixAt(i, m4)
    })
    // Order: all main faces (real first), then the copies.
    let k = 0
    for (const [scale, dz, level] of copies)
      this.spots.forEach(([x, z]) => {
        m4.compose(v.set(x, (1 - scale) * 1.04, z + dz), q, s.set(scale, scale, 1))
        this.units.setMatrixAt(k, m4)
        this.units.setColorAt(k, col.setScalar(level))
        k++
      })
    // LEDs: the same pattern for the same column and row-type (so the mirror rows repeat the hall).
    const dot = new THREE.CircleGeometry(0.0032, 6)
    const ledCount = n * LED_PER * 3
    this.ledMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uWave: { value: 0 }, uDim: { value: 1 }, uFreeze: { value: 0 } }]),
      vertexShader: LED_VERT,
      fragmentShader: LED_FRAG,
      fog: true,
    })
    this.leds = new THREE.InstancedMesh(dot, this.ledMat, ledCount)
    const seeds = new Float32Array(ledCount)
    const levels = new Float32Array(ledCount)
    const palette = [new THREE.Color(0x5dff9a), new THREE.Color(0xffb347), new THREE.Color(0x7fb4ff)]
    let li = 0
    for (const [scale, dz, level] of copies)
      this.spots.forEach(([x, z], ri) => {
        const colIdx = ri % RACK_X.length
        const rowType = Math.floor(ri / RACK_X.length) % 3
        const rand = mulberry32(100 + colIdx * 7 + rowType * 53)
        for (let j = 0; j < LED_PER; j++) {
          const unit = Math.floor(rand() * 30)
          const lx = -0.22 + Math.floor(rand() * 4) * 0.016 + (rand() < 0.3 ? 0.36 : 0)
          const ly = 0.18 + unit * 0.0586 + 0.012
          m4.compose(v.set(x + lx * scale, (1 - scale) * 1.04 + ly * scale, z + dz + 0.004), q, s.set(scale, scale, 1))
          this.leds.setMatrixAt(li, m4)
          const r = rand()
          this.leds.setColorAt(li, r < 0.72 ? palette[0] : r < 0.88 ? palette[1] : palette[2])
          seeds[li] = colIdx * 100 + rowType * 1000 + j + 0.5
          levels[li] = level
          li++
        }
      })
    this.leds.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    this.leds.geometry.setAttribute('aLevel', new THREE.InstancedBufferAttribute(levels, 1))
    this.ledReal = this.realCount * LED_PER
    // Status strips on the aisle ends of every row: west block's east end, east block's west end.
    const atlas = document.createElement('canvas')
    atlas.width = 512
    atlas.height = 2048
    this.stripCtx = atlas.getContext('2d')!
    this.stripTex = new THREE.CanvasTexture(atlas)
    this.stripTex.colorSpace = THREE.SRGBColorSpace
    const stripMat = new THREE.MeshBasicMaterial({ map: this.stripTex })
    stripMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aSlot;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vec2(vMapUv.x, (vMapUv.y + 63.0 - aSlot) / 64.0);\n#endif')
    }
    stripMat.customProgramCacheKey = () => 'durum-strip'
    const stripGeo = new THREE.PlaneGeometry(0.9, 0.06)
    const stripN = rows.length * 2
    this.strips = new THREE.InstancedMesh(stripGeo, stripMat, stripN)
    const slots = new Float32Array(stripN)
    rows.forEach((z, r) => {
      for (const [side, xx, yaw] of [
        [0, RACK_X[2] + 0.312, PI / 2],
        [1, RACK_X[3] - 0.312, -PI / 2],
      ] as const) {
        const i = r * 2 + side
        m4.compose(v.set(xx, 1.9, z), q.setFromEuler(new THREE.Euler(0, yaw, 0)), s.set(1, 1, 1))
        this.strips.setMatrixAt(i, m4)
        slots[i] = Math.min(63, r)
      }
      this.stripRows.push(z)
    })
    stripGeo.setAttribute('aSlot', new THREE.InstancedBufferAttribute(slots, 1))
    this.drawStrips([], 0)
    for (const im of [this.cabinets, this.frames, this.doors, this.units, this.leds, this.strips]) {
      im.frustumCulled = false
      im.instanceMatrix.needsUpdate = true
      this.group.add(im)
    }
    this.cabinets.castShadow = true
    this.cabinets.receiveShadow = true
    this.setMirror(false)
  }

  /** Mirror rows on/off (AYNA). */
  setMirror(on: boolean) {
    const n = on ? this.total : this.realCount
    this.cabinets.count = n
    this.frames.count = n
    this.doors.count = n
    this.units.count = on ? this.total * 3 : this.unitsReal
    // Real faces first (0…realCount), mirror faces next; copies follow all main faces.
    if (!on) this.units.count = this.realCount
    this.leds.count = on ? this.total * LED_PER * 3 : this.ledReal
    this.strips.count = on ? this.stripRows.length * 2 : ROW_Z.length * 2
  }

  /** LED state: time, wave (0–1, samePace), dim (0–1), freeze (0–1, computing). */
  setLeds(time: number, wave: number, dim: number, freeze = 0) {
    const u = this.ledMat.uniforms
    u.uTime.value = time
    u.uWave.value = wave
    u.uDim.value = dim
    u.uFreeze.value = freeze
  }

  /**
   * Words on the strips: word i of the line runs on the strips of the i-th row
   * ahead (both sides), lit as far as `typed` (0–1) has reached.
   */
  drawStrips(words: string[], typed: number, from = 3) {
    const shown = Math.round(words.length * typed)
    const key = `${words.join(' ')}|${shown}|${from}`
    if (key === this.stripKey) return
    this.stripKey = key
    const c = this.stripCtx
    const rows = this.stripRows.length
    for (let r = 0; r < 64; r++) {
      const wi = r - from
      const word = r < rows && wi >= 0 && wi < shown ? words[wi] : ''
      drawStripWord(c, 0, r * 32, 512, 32, word, word ? 1 : 0)
    }
    this.stripTex.needsUpdate = true
  }

  dispose() {
    this.stripTex.dispose()
  }
}

