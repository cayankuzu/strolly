/**
 * The light rig and the full-frame overlay.
 *
 * One fixed set of lights (a hemisphere, a sun with shadows, a key spot with
 * shadows, a second spot, four points) is moved and re-coloured for every set,
 * so cutting between sets never changes the number of lights (and never makes
 * the renderer recompile a shader mid-story).
 *
 * The overlay is a clip-space quad drawn last into the scene: white flashes
 * (values above 1 so they stay white after tone mapping), black, colour
 * washes, a vignette, and the "re-woven veil" scanline of threads.
 */
import * as THREE from 'three'

export class Rig {
  readonly group = new THREE.Group()
  readonly hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0)
  readonly sun = new THREE.DirectionalLight(0xffffff, 0)
  readonly key = new THREE.SpotLight(0xffffff, 0, 30, 0.6, 0.5, 1.5)
  readonly spot = new THREE.SpotLight(0xffffff, 0, 20, 0.7, 0.6, 1.5)
  readonly pts: THREE.PointLight[] = []
  readonly white: THREE.DataTexture

  constructor() {
    const g = this.group
    g.add(this.hemi, this.sun, this.sun.target, this.key, this.key.target, this.spot, this.spot.target)
    for (let i = 0; i < 4; i++) {
      const p = new THREE.PointLight(0xffffff, 0, 10, 1.8)
      this.pts.push(p)
      g.add(p)
    }
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.bias = -0.0004
    this.sun.shadow.normalBias = 0.03
    this.key.castShadow = true
    this.key.shadow.mapSize.set(1024, 1024)
    this.key.shadow.bias = -0.0006
    this.key.shadow.normalBias = 0.02
    this.key.shadow.camera.near = 0.2
    // The second spot always carries a projected texture (so giving it the log's picture never recompiles anything).
    this.white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    this.white.needsUpdate = true
    this.spot.map = this.white
  }

  /** Everything off; defaults back. */
  reset() {
    this.hemi.intensity = 0
    this.sun.intensity = 0
    this.key.intensity = 0
    this.spot.intensity = 0
    this.spot.map = this.white
    for (const p of this.pts) p.intensity = 0
    this.key.angle = 0.6
    this.key.penumbra = 0.5
    this.key.distance = 30
    this.spot.angle = 0.7
    this.spot.penumbra = 0.6
    this.spot.distance = 20
  }

  hemiSet(sky: number, ground: number, i: number) {
    this.hemi.color.setHex(sky)
    this.hemi.groundColor.setHex(ground)
    this.hemi.intensity = i
  }

  /** The sun: a direction (from target toward the light), a colour, the shadow box around `target`. */
  sunSet(color: number, i: number, target: THREE.Vector3, dir: THREE.Vector3, box = 16, dist = 40) {
    this.sun.color.setHex(color)
    this.sun.intensity = i
    this.sun.target.position.copy(target)
    this.sun.position.copy(target).addScaledVector(dir.clone().normalize(), dist)
    const c = this.sun.shadow.camera
    if (c.right !== box || c.far !== dist * 2) {
      c.left = -box
      c.right = box
      c.top = box
      c.bottom = -box
      c.near = 1
      c.far = dist * 2
      c.updateProjectionMatrix()
    }
  }

  keySet(color: number, i: number, from: THREE.Vector3 | readonly number[], to: THREE.Vector3 | readonly number[], angle = 0.6, penumbra = 0.5, distance = 30) {
    this.key.color.setHex(color)
    this.key.intensity = i
    set(this.key.position, from)
    set(this.key.target.position, to)
    this.key.angle = angle
    this.key.penumbra = penumbra
    this.key.distance = distance
  }

  spotSet(color: number, i: number, from: THREE.Vector3 | readonly number[], to: THREE.Vector3 | readonly number[], angle = 0.7, penumbra = 0.6, distance = 20) {
    this.spot.color.setHex(color)
    this.spot.intensity = i
    set(this.spot.position, from)
    set(this.spot.target.position, to)
    this.spot.angle = angle
    this.spot.penumbra = penumbra
    this.spot.distance = distance
  }

  pt(i: number, color: number, intensity: number, at: THREE.Vector3 | readonly number[], distance = 10, decay = 1.8) {
    const p = this.pts[i]
    p.color.setHex(color)
    p.intensity = intensity
    p.distance = distance
    p.decay = decay
    set(p.position, at)
  }

  /** Shadow maps only re-render for lights that are on. */
  settle() {
    this.sun.shadow.autoUpdate = this.sun.intensity > 0
    this.key.shadow.autoUpdate = this.key.intensity > 0
    if (this.sun.intensity > 0) this.sun.target.updateMatrixWorld()
    if (this.key.intensity > 0) this.key.target.updateMatrixWorld()
    this.spot.target.updateMatrixWorld()
  }

  dispose() {
    this.white.dispose()
  }
}

function set(v: THREE.Vector3, a: THREE.Vector3 | readonly number[]) {
  if (a instanceof THREE.Vector3) v.copy(a)
  else v.set(a[0], a[1], a[2])
}

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
}
`

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
uniform vec3 uVigColor;
uniform float uVig;
uniform float uWeave;
uniform float uWeaveAmt;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

void main() {
  vec3 P = vec3(0.0);
  float A = 0.0;
  // Wash (or flash, or black).
  P = P * (1.0 - uAlpha) + uColor * uAlpha;
  A = A * (1.0 - uAlpha) + uAlpha;
  // Vignette closing in.
  vec2 q = vUv - 0.5;
  q.x *= uRes.x / uRes.y;
  float v = smoothstep(0.25, 0.95, length(q)) * uVig;
  P = P * (1.0 - v) + uVigColor * v;
  A = A * (1.0 - v) + v;
  // The veil re-woven: a band of fine threads passing down the frame.
  if (uWeaveAmt > 0.001) {
    float band = exp(-pow((vUv.y - uWeave) / 0.09, 2.0));
    vec2 px = vUv * uRes;
    float warp = 0.5 + 0.5 * sin(px.x * 1.9 + sin(px.y * 0.21) * 2.0);
    float weft = 0.5 + 0.5 * sin(px.y * 1.7 + sin(px.x * 0.19) * 2.0);
    float threads = max(warp * step(0.5, fract(px.y / 6.0)), weft * step(0.5, fract(px.x / 6.0)));
    float a = band * uWeaveAmt * (0.25 + 0.55 * threads);
    vec3 c = mix(vec3(1.2, 1.12, 0.98), vec3(2.2, 2.1, 1.9), threads);
    P = P * (1.0 - a) + c * a;
    A = A * (1.0 - a) + a;
  }
  gl_FragColor = vec4(A > 0.0001 ? P / A : vec3(0.0), A);
}
`

export class Overlay {
  readonly mesh: THREE.Mesh
  readonly u = {
    uColor: { value: new THREE.Color(0, 0, 0) },
    uAlpha: { value: 0 },
    uVigColor: { value: new THREE.Color(0, 0, 0) },
    uVig: { value: 0 },
    uWeave: { value: 0 },
    uWeaveAmt: { value: 0 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1280, 720) },
  }

  constructor() {
    const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: this.u, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false })
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 10000
    // Far away for any pass that projects it normally (ambient occlusion's normal pass).
    this.mesh.position.set(0, -2000, 0)
    this.mesh.userData.noAO = true
  }

  reset(time: number) {
    this.u.uAlpha.value = 0
    this.u.uVig.value = 0
    this.u.uWeaveAmt.value = 0
    this.u.uTime.value = time
  }

  /** A wash of colour (rgb may exceed 1 for a white that survives tone mapping). */
  wash(r: number, g: number, b: number, a: number) {
    if (a <= this.u.uAlpha.value) return
    this.u.uColor.value.setRGB(r, g, b)
    this.u.uAlpha.value = Math.min(1, a)
  }

  white(a: number) {
    this.wash(9, 9.4, 10, a)
  }

  black(a: number) {
    this.wash(0, 0, 0, a)
  }

  vignette(r: number, g: number, b: number, a: number) {
    this.u.uVigColor.value.setRGB(r, g, b)
    this.u.uVig.value = Math.min(1, a)
  }

  weave(at: number, amount: number) {
    this.u.uWeave.value = at
    this.u.uWeaveAmt.value = amount
  }

  settle() {
    this.mesh.visible = this.u.uAlpha.value > 0.001 || this.u.uVig.value > 0.001 || this.u.uWeaveAmt.value > 0.001
  }
}
