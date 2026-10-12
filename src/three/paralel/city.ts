/**
 * PARALEL-LEŞ — city pieces shared by the rooftops and the glass roof: a
 * facade shader that draws window grids from world position (so every block
 * and tower, instanced or not, gets windows at true scale), a skyline of
 * instanced towers, moving traffic and pedestrians far below.
 */
import * as THREE from 'three'
import { PI, rng } from './common'
import type { Shared } from './shaders'

const FACADE_VERT = /* glsl */ `
varying vec3 vW;
varying vec3 vN;
varying float vSeed;
#include <common>
#include <fog_pars_vertex>
void main() {
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
    m = modelMatrix * instanceMatrix;
    vSeed = instanceMatrix[3][0] * 0.137 + instanceMatrix[3][2] * 0.071;
  #else
    vSeed = modelMatrix[3][0] * 0.21 + modelMatrix[3][2] * 0.17;
  #endif
  vec4 w = m * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(m) * normal);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`

const FACADE_FRAG = /* glsl */ `
uniform vec3 uWall;
uniform vec3 uWall2;
uniform vec3 uGlass;
uniform vec3 uSky;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmb;
uniform vec3 uGround;
uniform vec3 uLitColor;
uniform float uLit;
uniform float uLitFrac;
uniform vec2 uCell;
uniform float uParalelGrade;
varying vec3 vW;
varying vec3 vN;
varying float vSeed;
#ifdef HOLES
uniform vec4 uHoles[HOLES];
#endif
#include <common>
#include <fog_pars_fragment>
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec3 n = normalize(vN);
  vec2 fc;
  float roof = 0.0;
  if (abs(n.y) > 0.7) { fc = vW.xz; roof = 1.0; }
  else if (abs(n.x) > abs(n.z)) fc = vec2(vW.z * sign(n.x), vW.y);
  else fc = vec2(-vW.x * sign(n.z), vW.y);
  #ifdef HOLES
  for (int i = 0; i < HOLES; i++) {
    vec4 h = uHoles[i];
    if (roof < 0.5 && fc.x > h.x && fc.x < h.z && fc.y > h.y && fc.y < h.w) discard;
  }
  #endif
  vec2 g = fc / uCell;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float win = (1.0 - roof) * step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.86);
  float frame = (1.0 - roof) * (step(0.17, f.x) * step(f.x, 0.83) * step(0.25, f.y) * step(f.y, 0.89)) * (1.0 - win);
  float hseed = h21(cell + vec2(vSeed * 13.1, vSeed * 7.7));
  float band = step(0.94, f.y) * (1.0 - roof);
  vec3 wall = mix(uWall, uWall2, h21(vec2(floor(vSeed * 97.0), 3.0)));
  wall *= 0.9 + 0.12 * h21(cell * 0.31) - 0.12 * band;
  vec3 v = normalize(cameraPosition - vW);
  float fres = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 3.0);
  vec3 glass = mix(uGlass, uSky, 0.25 + 0.6 * fres) * (0.8 + 0.4 * hseed);
  vec3 alb = mix(wall, glass, win);
  alb = mix(alb, wall * 0.55, frame);
  if (roof > 0.5) alb = uWall * 0.55;
  float dif = max(dot(n, normalize(uSunDir)), 0.0);
  float sky = 0.5 + 0.5 * n.y;
  vec3 col = alb * (uSunColor * dif + mix(uGround, uAmb, sky));
  float lit = step(1.0 - uLitFrac, hseed) * win * uLit;
  col += uLitColor * lit * (0.6 + 0.6 * h21(cell + 5.0));
  // Glass catches the low sun.
  col += uSunColor * win * pow(max(dot(reflect(-v, n), normalize(uSunDir)), 0.0), 40.0) * 0.8;
  gl_FragColor = vec4(col, 1.0);
  {
    float gL = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gL) * vec3(0.84, 0.92, 1.1), uParalelGrade * 0.72);
  }
  #include <fog_fragment>
}`

export type FacadeLook = { wall: number; wall2: number; glass: number; sky: number; cell?: [number, number]; holes?: Array<[number, number, number, number]>; side?: THREE.Side }

export function facadeMaterial(shared: Shared, look: FacadeLook) {
  const holes = look.holes ?? []
  const m = new THREE.ShaderMaterial({
    defines: holes.length ? { HOLES: holes.length } : {},
    side: look.side ?? THREE.FrontSide,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uWall: { value: new THREE.Color(look.wall) },
        uWall2: { value: new THREE.Color(look.wall2) },
        uGlass: { value: new THREE.Color(look.glass) },
        uSky: { value: new THREE.Color(look.sky) },
        uSunDir: { value: new THREE.Vector3(-1, 0.15, 0).normalize() },
        uSunColor: { value: new THREE.Color(0xf2a65a) },
        uAmb: { value: new THREE.Color(0x6a6f88) },
        uGround: { value: new THREE.Color(0x3a3530) },
        uLitColor: { value: new THREE.Color(0xffd08a) },
        uLit: { value: 0 },
        uLitFrac: { value: 0.45 },
        uCell: { value: new THREE.Vector2(...(look.cell ?? [2.6, 3.2])) },
      },
    ]),
    vertexShader: FACADE_VERT,
    fragmentShader: FACADE_FRAG,
    fog: true,
  })
  m.uniforms.uParalelGrade = shared.grade
  if (holes.length) m.uniforms.uHoles = { value: holes.map(([a, b, c, d]) => new THREE.Vector4(a, b, c, d)) }
  return m
}

/** Sets the light on facade materials (sun, ambient, lit windows). */
export function lightFacades(mats: THREE.ShaderMaterial[], o: { sunDir: THREE.Vector3; sun: THREE.ColorRepresentation; sunPower: number; amb: THREE.ColorRepresentation; ambPower: number; ground: THREE.ColorRepresentation; lit: number; sky?: THREE.ColorRepresentation }) {
  for (const m of mats) {
    const u = m.uniforms
    u.uSunDir.value.copy(o.sunDir)
    u.uSunColor.value.set(o.sun).multiplyScalar(o.sunPower)
    u.uAmb.value.set(o.amb).multiplyScalar(o.ambPower)
    u.uGround.value.set(o.ground).multiplyScalar(o.ambPower)
    u.uLit.value = o.lit
    if (o.sky !== undefined) u.uSky.value.set(o.sky)
  }
}

/** A ring of towers around a centre (x, z), bases at `base`. */
export function skyline(mat: THREE.Material, cx: number, cz: number, base: number, opts: { count?: number; rMin?: number; rMax?: number; hMin?: number; hMax?: number; seed?: number; skip?: (x: number, z: number) => boolean } = {}) {
  const rand = rng(opts.seed ?? 5)
  const n = opts.count ?? 160
  const geo = new THREE.BoxGeometry(1, 1, 1)
  geo.translate(0, 0.5, 0)
  const im = new THREE.InstancedMesh(geo, mat, n)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  let k = 0
  for (let i = 0; i < n * 3 && k < n; i++) {
    const a = rand() * PI * 2
    const r = (opts.rMin ?? 80) + Math.pow(rand(), 0.8) * ((opts.rMax ?? 420) - (opts.rMin ?? 80))
    const x = cx + Math.cos(a) * r
    const z = cz + Math.sin(a) * r
    if (opts.skip?.(x, z)) continue
    const w = 14 + rand() * 26
    const d = 14 + rand() * 26
    const h = (opts.hMin ?? 40) + Math.pow(rand(), 1.6) * ((opts.hMax ?? 160) - (opts.hMin ?? 40))
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.round(rand() * 3) * (PI / 2) + (rand() < 0.2 ? 0.3 : 0))
    m4.compose(new THREE.Vector3(x, base, z), q, new THREE.Vector3(w, h, d))
    im.setMatrixAt(k++, m4)
  }
  im.count = k
  im.instanceMatrix.needsUpdate = true
  im.computeBoundingSphere()
  im.frustumCulled = false
  return im
}

/** Cars along an avenue (x axis), lanes at the given z's; `update(time)` drives them. */
export class Traffic {
  readonly group = new THREE.Group()
  private bodies: THREE.InstancedMesh
  private cabins: THREE.InstancedMesh
  private lamps: THREE.InstancedMesh
  private cars: Array<{ lane: number; speed: number; offset: number; len: number; bus: boolean }> = []
  private m4 = new THREE.Matrix4()
  private q = new THREE.Quaternion()
  private s = new THREE.Vector3()
  private p = new THREE.Vector3()

  constructor(
    private lanes: number[],
    private y: number,
    private x0: number,
    private x1: number,
    count = 70,
    seed = 9,
  ) {
    const rand = rng(seed)
    const body = new THREE.BoxGeometry(1, 1, 1)
    body.translate(0, 0.5, 0)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.5 })
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1a1f26, roughness: 0.15, metalness: 0.6 })
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6 })
    this.bodies = new THREE.InstancedMesh(body, bodyMat, count)
    this.cabins = new THREE.InstancedMesh(body, cabMat, count)
    this.lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lampMat, count)
    const col = new THREE.Color()
    const palette = [0xd8d8d4, 0x222428, 0x8a1f1f, 0x2b4a7a, 0x9a9da2, 0x4a4d52, 0xe0c060, 0x1e3b2c, 0xf2f0ea]
    for (let i = 0; i < count; i++) {
      const bus = i % 17 === 0
      this.cars.push({ lane: i % lanes.length, speed: (bus ? 7 : 9 + rand() * 5) * (i % lanes.length < lanes.length / 2 ? 1 : -1), offset: rand() * (x1 - x0), len: bus ? 11 : 4.2 + rand() * 0.6, bus })
      col.set(bus ? 0xd9b23a : palette[Math.floor(rand() * palette.length)])
      this.bodies.setColorAt(i, col)
    }
    for (const im of [this.bodies, this.cabins, this.lamps]) {
      im.frustumCulled = false
      this.group.add(im)
    }
  }

  update(time: number, lamps: number) {
    const span = this.x1 - this.x0
    this.cars.forEach((c, i) => {
      const dir = Math.sign(c.speed)
      let x = (c.offset + time * Math.abs(c.speed)) % span
      x = dir > 0 ? this.x0 + x : this.x1 - x
      const z = this.lanes[c.lane]
      const h = c.bus ? 3.0 : 1.0
      const w = c.bus ? 2.5 : 1.8
      this.p.set(x, this.y, z)
      this.s.set(c.len, h, w)
      this.m4.compose(this.p, this.q, this.s)
      this.bodies.setMatrixAt(i, this.m4)
      this.p.set(x - dir * (c.bus ? 0 : 0.3), this.y + h, z)
      this.s.set(c.bus ? c.len * 0.96 : c.len * 0.5, c.bus ? 0.02 : 0.55, w * 0.9)
      this.m4.compose(this.p, this.q, this.s)
      this.cabins.setMatrixAt(i, this.m4)
      this.p.set(x + (dir * c.len) / 2, this.y + 0.55, z)
      this.s.set(0.05, 0.18 * lamps, w * 0.8)
      this.m4.compose(this.p, this.q, this.s)
      this.lamps.setMatrixAt(i, this.m4)
    })
    this.bodies.instanceMatrix.needsUpdate = true
    this.cabins.instanceMatrix.needsUpdate = true
    this.lamps.instanceMatrix.needsUpdate = true
  }
}

/** People as small dark capsules walking the pavements. */
export class Walkers {
  readonly mesh: THREE.InstancedMesh
  private seeds: number[] = []
  private m4 = new THREE.Matrix4()
  constructor(
    private n: number,
    private y: number,
    private x0: number,
    private x1: number,
    private zs: number[],
    seed = 4,
  ) {
    const rand = rng(seed)
    const geo = new THREE.CapsuleGeometry(0.22, 1.1, 3, 6)
    geo.translate(0, 0.8, 0)
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), n)
    const col = new THREE.Color()
    for (let i = 0; i < n; i++) {
      this.seeds.push(rand(), rand(), rand())
      col.setHSL(rand(), 0.2, 0.15 + rand() * 0.3)
      this.mesh.setColorAt(i, col)
    }
    this.mesh.frustumCulled = false
  }
  update(time: number) {
    const span = this.x1 - this.x0
    for (let i = 0; i < this.n; i++) {
      const a = this.seeds[i * 3]
      const b = this.seeds[i * 3 + 1]
      const c = this.seeds[i * 3 + 2]
      const dir = b < 0.5 ? 1 : -1
      const x = this.x0 + ((a * span + time * (1 + c) * dir + span * 10) % span)
      const z = this.zs[Math.floor(c * this.zs.length)] + (b - 0.5) * 1.6
      this.m4.makeTranslation(x, this.y, z)
      this.mesh.setMatrixAt(i, this.m4)
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }
}
