/**
 * PARALEL-LEŞ — light, sky, fog and grade for every set. One light rig is
 * reused by all sets (the light count never changes, so no shader ever
 * recompiles on a cut); each segment writes its own values every frame.
 */
import * as THREE from 'three'
import { clamp } from '@/lib/math'
import type { HdriId } from '../kit/assets'
import type { BuildContext } from '../kit/SetScene'
import { PI } from './common'
import type { Shared } from './shaders'

// ——— Sky dome ———

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
  gl_Position.z = gl_Position.w * 0.99999;
}`

const SKY_FRAG = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uBelow;
uniform vec3 uHaze;
uniform float uHazeAmt;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunDisc;
uniform float uGlow;
uniform float uCloud;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform float uTime;
uniform float uStars;
uniform float uGrade;
varying vec3 vDir;

float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += vn(p) * a; p = p * 2.03 + 11.7; a *= 0.5; } return s; }

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col;
  if (h >= 0.0) col = mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.55));
  else col = mix(uHorizon, uBelow, smoothstep(0.0, 0.25, -h));
  // A haze band hugging the horizon.
  col = mix(col, uHaze, uHazeAmt * exp(-abs(h) * 14.0));
  float sd = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSunColor * (uGlow * (0.25 * pow(sd, 6.0) + 0.6 * pow(sd, 48.0)));
  col += uSunColor * uSunDisc * smoothstep(0.9993, 0.9997, sd);
  // Clouds: streaks on a plane overhead, drifting.
  if (uCloud > 0.0 && h > -0.02) {
    vec2 uv = d.xz / (h + 0.12);
    float n = fbm(uv * vec2(0.9, 2.2) + vec2(uTime * 0.004, 0.0));
    float c = smoothstep(0.55 - uCloud * 0.35, 0.95 - uCloud * 0.3, n) * smoothstep(-0.02, 0.12, h);
    float lit = pow(sd, 3.0);
    col = mix(col, mix(uCloudShade, uCloudLit, 0.35 + 0.65 * lit), c * 0.85);
  }
  if (uStars > 0.0 && h > 0.0) {
    vec2 sp = d.xz / (h + 0.3) * 160.0;
    float s = step(0.996, h21(floor(sp)));
    col += vec3(s) * uStars * smoothstep(0.05, 0.5, h);
  }
  float gl = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(gl) * vec3(0.86, 0.93, 1.08), uGrade * 0.7);
  gl_FragColor = vec4(col, 1.0);
}`

export type SkyPreset = {
  zenith: number
  horizon: number
  below: number
  haze: number
  hazeAmt: number
  sunColor: number
  /** Brightness of the disc (0 hides it). */
  disc: number
  glow: number
  cloud: number
  cloudLit: number
  cloudShade: number
  stars?: number
  /** Overall multiplier (HDR). */
  power?: number
}

export class SkyDome {
  readonly mesh: THREE.Mesh
  readonly material: THREE.ShaderMaterial
  private c = new THREE.Color()

  constructor(grade: { value: number }) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uZenith: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uBelow: { value: new THREE.Color() },
        uHaze: { value: new THREE.Color() },
        uHazeAmt: { value: 0 },
        uSunDir: { value: new THREE.Vector3(0, 0.2, -1) },
        uSunColor: { value: new THREE.Color() },
        uSunDisc: { value: 0 },
        uGlow: { value: 0 },
        uCloud: { value: 0 },
        uCloudLit: { value: new THREE.Color() },
        uCloudShade: { value: new THREE.Color() },
        uTime: { value: 0 },
        uStars: { value: 0 },
        uGrade: grade,
      },
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    })
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(3500, 48, 24), this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -10
  }

  set(p: SkyPreset, sunDir: THREE.Vector3) {
    const u = this.material.uniforms
    const k = p.power ?? 1
    u.uZenith.value.set(p.zenith).multiplyScalar(k)
    u.uHorizon.value.set(p.horizon).multiplyScalar(k)
    u.uBelow.value.set(p.below).multiplyScalar(k)
    u.uHaze.value.set(p.haze).multiplyScalar(k)
    u.uHazeAmt.value = p.hazeAmt
    u.uSunColor.value.set(p.sunColor).multiplyScalar(k)
    u.uSunDisc.value = p.disc
    u.uGlow.value = p.glow
    u.uCloud.value = p.cloud
    u.uCloudLit.value.set(p.cloudLit).multiplyScalar(k)
    u.uCloudShade.value.set(p.cloudShade).multiplyScalar(k)
    u.uStars.value = p.stars ?? 0
    u.uSunDir.value.copy(sunDir).normalize()
  }

  /** Mixes two presets (t 0 → a, 1 → b). */
  mix(a: SkyPreset, b: SkyPreset, t: number, sunDir: THREE.Vector3) {
    const c2 = new THREE.Color()
    const lerpC = (x: number, y: number) => this.c.set(x).lerp(c2.set(y), t).getHex()
    const n = (x: number, y: number) => x + (y - x) * t
    this.set(
      {
        zenith: lerpC(a.zenith, b.zenith),
        horizon: lerpC(a.horizon, b.horizon),
        below: lerpC(a.below, b.below),
        haze: lerpC(a.haze, b.haze),
        hazeAmt: n(a.hazeAmt, b.hazeAmt),
        sunColor: lerpC(a.sunColor, b.sunColor),
        disc: n(a.disc, b.disc),
        glow: n(a.glow, b.glow),
        cloud: n(a.cloud, b.cloud),
        cloudLit: lerpC(a.cloudLit, b.cloudLit),
        cloudShade: lerpC(a.cloudShade, b.cloudShade),
        stars: n(a.stars ?? 0, b.stars ?? 0),
        power: n(a.power ?? 1, b.power ?? 1),
      },
      sunDir,
    )
  }
}

// ——— The rig ———

export type EnvMaps = Partial<Record<HdriId, THREE.Texture | null>>

const GRADE_CHUNK = /* glsl */ `
{
  float gL = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gL) * vec3(0.84, 0.92, 1.1), uParalelGrade * 0.72);
}
`

export class Env {
  readonly group = new THREE.Group()
  readonly sun = new THREE.DirectionalLight(0xffffff, 0)
  readonly fill = new THREE.DirectionalLight(0xffffff, 0)
  readonly hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0)
  readonly points: THREE.PointLight[] = []
  /** A shadow-casting spot (flashlight, bare bulb, the void's key). */
  readonly spot = new THREE.SpotLight(0xffffff, 0, 30, 0.6, 0.5, 2)
  readonly spot2 = new THREE.SpotLight(0xffffff, 0, 30, 0.6, 0.5, 2)
  readonly fog = new THREE.FogExp2(0x000000, 0)
  readonly grade = { value: 0 }
  /** Uniforms shared by the story's own materials (clock, sun line, grade). */
  readonly shared: Shared = { uSunLine: { value: 0 }, uTime: { value: 0 }, grade: this.grade }
  readonly sky: SkyDome
  maps: EnvMaps = {}
  private radius = 0
  private tmp = new THREE.Vector3()
  private scene!: THREE.Scene
  private fallback!: THREE.Texture

  constructor() {
    this.sky = new SkyDome(this.grade)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.bias = -0.0004
    this.sun.shadow.normalBias = 0.03
    this.sun.shadow.camera.near = 1
    this.sun.shadow.camera.far = 400
    this.spot.castShadow = true
    this.spot.shadow.mapSize.set(1024, 1024)
    this.spot.shadow.bias = -0.0006
    this.spot.shadow.normalBias = 0.02
    this.spot.shadow.camera.near = 0.1
    for (let i = 0; i < 3; i++) {
      const p = new THREE.PointLight(0xffffff, 0, 12, 2)
      this.points.push(p)
      this.group.add(p)
    }
    this.group.add(this.sun, this.sun.target, this.fill, this.fill.target, this.hemi, this.spot, this.spot.target, this.spot2, this.spot2.target, this.sky.mesh)
  }

  async load(build: BuildContext, scene: THREE.Scene) {
    this.scene = scene
    this.fallback = build.environment
    scene.add(this.group)
    scene.fog = this.fog
    const ids: HdriId[] = ['kloofendal_48d_partly_cloudy_puresky', 'belfast_sunset_puresky', 'moonless_golf', 'brown_photostudio_02', 'abandoned_tiled_room']
    const maps = await Promise.all(ids.map((id) => build.hdri(id)))
    ids.forEach((id, i) => (this.maps[id] = maps[i]))
  }

  /** Resets the per-frame extras (optional lights off). */
  begin() {
    this.fill.intensity = 0
    for (const p of this.points) p.intensity = 0
    this.spot.intensity = 0
    this.spot2.intensity = 0
    this.grade.value = 0
    this.sky.material.uniforms.uStars.value = 0
  }

  /** Image-based light for this set. */
  ibl(id: HdriId, intensity: number, rotation = 0) {
    this.scene.environment = this.maps[id] ?? this.fallback
    this.scene.environmentIntensity = intensity
    this.scene.environmentRotation.set(0, rotation, 0)
  }

  /** The sun: `dir` points from the subject toward the sun; shadows cover `radius` around `center`. */
  setSun(center: THREE.Vector3, dir: THREE.Vector3, color: THREE.ColorRepresentation, intensity: number, radius = 16) {
    const d = this.tmp.copy(dir).normalize()
    this.sun.color.set(color)
    this.sun.intensity = intensity
    this.sun.target.position.copy(center)
    this.sun.position.copy(center).addScaledVector(d, 150)
    if (Math.abs(radius - this.radius) > 1e-3) {
      const c = this.sun.shadow.camera
      c.left = -radius
      c.right = radius
      c.top = radius
      c.bottom = -radius
      c.far = 150 + radius * 2
      c.updateProjectionMatrix()
      this.radius = radius
    }
    this.sun.target.updateMatrixWorld()
  }

  setFill(from: THREE.Vector3, to: THREE.Vector3, color: THREE.ColorRepresentation, intensity: number) {
    this.fill.position.copy(from)
    this.fill.target.position.copy(to)
    this.fill.target.updateMatrixWorld()
    this.fill.color.set(color)
    this.fill.intensity = intensity
  }

  setHemi(sky: THREE.ColorRepresentation, ground: THREE.ColorRepresentation, intensity: number) {
    this.hemi.color.set(sky)
    this.hemi.groundColor.set(ground)
    this.hemi.intensity = intensity
  }

  setFog(color: THREE.ColorRepresentation, density: number) {
    this.fog.color.set(color)
    this.fog.density = density
  }

  point(i: number, x: number, y: number, z: number, color: THREE.ColorRepresentation, intensity: number, distance = 12, decay = 2) {
    const p = this.points[i]
    p.position.set(x, y, z)
    p.color.set(color)
    p.intensity = intensity
    p.distance = distance
    p.decay = decay
  }

  setSpot(s: THREE.SpotLight, from: THREE.Vector3, to: THREE.Vector3, color: THREE.ColorRepresentation, intensity: number, angle: number, penumbra = 0.5, distance = 30) {
    s.position.copy(from)
    s.target.position.copy(to)
    s.target.updateMatrixWorld()
    s.color.set(color)
    s.intensity = intensity
    s.angle = angle
    s.penumbra = penumbra
    s.distance = distance
    if (s.castShadow) s.shadow.camera.far = distance
  }

  /** The sky follows the camera so it never clips. */
  follow(camera: THREE.Vector3, time: number) {
    this.sky.mesh.position.copy(camera)
    this.sky.material.uniforms.uTime.value = time
    this.shared.uTime.value = time
  }

  /**
   * Gives every built-in material the absence grade (desaturate + cool) as a
   * shared uniform; called once after the sets are built.
   */
  patchMaterials(root: THREE.Object3D, skip: Set<THREE.Material>) {
    const grade = this.grade
    const patch = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uParalelGrade = grade
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', 'uniform float uParalelGrade;\nvoid main() {').replace('#include <fog_fragment>', GRADE_CHUNK + '\n#include <fog_fragment>')
    }
    const seen = new Set<THREE.Material>()
    root.traverse((o) => {
      const mats = (o as THREE.Mesh).material
      if (!mats) return
      for (const m of ([] as THREE.Material[]).concat(mats)) {
        if (seen.has(m) || skip.has(m) || (m as THREE.ShaderMaterial).isShaderMaterial || m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) continue
        seen.add(m)
        m.onBeforeCompile = patch
        m.needsUpdate = true
      }
    })
  }
}

/** Sun direction from azimuth (radians, 0 = toward −z, π/2 = toward +x) and elevation. */
export function sunDir(az: number, el: number, out = new THREE.Vector3()) {
  return out.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el))
}

export const k01 = (v: number) => clamp(v)
export { PI }
