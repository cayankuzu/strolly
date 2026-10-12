/**
 * October light: a low sun through the three left windows (real shadows,
 * the window bars in them), sky light from the glass, a warm bounce off the
 * sunlit floor — and the beams themselves, integrated through the air of
 * the room, with chalk dust turning in the one in front of the board.
 *
 * Everything follows `sunDir`: in the time-lapse the sun lowers and warms,
 * and the beams slide across the desks until one reaches the bin corner.
 */
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { mulberry32 } from '@/lib/math'
import { ROOM, WIN, WINDOWS } from './layout'

const beamVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

const beamFrag = /* glsl */ `
  uniform vec3 uOrigin;
  uniform mat3 uInv;
  uniform vec2 uHalf;
  uniform float uLen;
  uniform vec3 uColor;
  uniform float uDensity;
  uniform float uTime;
  uniform vec4 uRoom; // x1, z0, z1, floor
  uniform vec3 uSun;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

  // Dust in the air: slow, uneven clouds of chalk dust (a few sines — cheap enough for every sample).
  float dustAt(vec3 w) {
    float n = sin(w.x * 2.3 + sin(w.z * 1.7 + uTime * 0.05) * 1.5) * sin(w.y * 2.9 + sin(w.x * 1.1 - uTime * 0.03) * 1.3) * sin(w.z * 2.1 + w.y * 0.7);
    return 0.5 + 0.5 * n;
  }

  // How much the window lets through at (a, b) — the mullion and the transom in it — softening with
  // distance from the glass; times the dust at that point.
  float mask(vec3 q, vec3 w) {
    float soft = 0.22 + 0.06 * q.z;
    float a = abs(q.x / uHalf.x);
    float b = abs(q.y / uHalf.y);
    float edge = (1.0 - smoothstep(1.0 - soft, 1.0 + soft * 0.3, a)) * (1.0 - smoothstep(1.0 - soft * 0.8, 1.0 + soft * 0.2, b));
    float sw = 0.03 + 0.012 * q.z;
    float mull = smoothstep(sw, sw * 2.2, abs(q.x));
    float tran = smoothstep(sw, sw * 2.0, abs(q.y - 0.47));
    float bars = smoothstep(sw * 0.4, sw * 1.2, abs(q.y + 0.24));
    float dust = 0.35 + 0.65 * dustAt(w);
    float fade = exp(-q.z / (uLen * 0.45)) * smoothstep(0.0, 0.25, q.z);
    return edge * mull * tran * mix(1.0, bars, 0.5) * dust * fade;
  }

  void main() {
    vec3 ro = cameraPosition;
    vec3 rd = normalize(vWorld - ro);
    vec3 c = uInv * (ro - uOrigin);
    vec3 r = uInv * rd;
    vec3 lo = vec3(-uHalf, 0.0);
    vec3 hi = vec3(uHalf, uLen);
    vec3 inv = 1.0 / r;
    vec3 t0 = (lo - c) * inv;
    vec3 t1 = (hi - c) * inv;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);
    float a = max(max(tmin.x, tmin.y), max(tmin.z, 0.0));
    float b = min(min(tmax.x, tmax.y), tmax.z);
    // The room stops the light: floor, door wall, front and back walls.
    if (rd.y < 0.0) b = min(b, (uRoom.w - ro.y) / rd.y);
    if (rd.x > 0.0) b = min(b, (uRoom.x - ro.x) / rd.x);
    if (rd.z < 0.0) b = min(b, (uRoom.y - ro.z) / rd.z);
    if (rd.z > 0.0) b = min(b, (uRoom.z - ro.z) / rd.z);
    if (b <= a) discard;
    float sum = 0.0;
    float j = hash(gl_FragCoord.xy + uTime);
    for (int i = 0; i < 8; i++) {
      float t = mix(a, b, (float(i) + j) / 8.0);
      sum += mask(c + r * t, ro + rd * t);
    }
    // Forward scattering (Henyey–Greenstein, g 0.35): bright looking into the sun, faint along it.
    float cs = dot(uSun, -rd);
    float phase = 0.8775 / pow(1.1225 - 0.7 * cs, 1.5);
    float d = sum / 8.0 * (b - a) * uDensity * phase;
    // Long paths through a beam saturate softly instead of turning into flat white planes.
    d = 1.0 - exp(-d * 1.4);
    gl_FragColor = vec4(uColor * d * 0.72, 1.0);
  }
`

export class Sunlight {
  readonly sun: THREE.DirectionalLight
  readonly hemi: THREE.HemisphereLight
  readonly sky: THREE.RectAreaLight
  readonly bounce: THREE.PointLight
  readonly corner: THREE.SpotLight
  readonly beams: THREE.Mesh[] = []
  readonly motes: THREE.Points
  private beamMats: THREE.ShaderMaterial[] = []
  private moteMat: THREE.ShaderMaterial
  private dir = new THREE.Vector3()
  private basis = new THREE.Matrix3()
  private inv = new THREE.Matrix3()
  private tmp = new THREE.Vector3()

  constructor(scene: THREE.Scene, shadows: boolean) {
    RectAreaLightUniformsLib.init()
    this.sun = new THREE.DirectionalLight(0xffd9a0, 5.2)
    this.sun.castShadow = shadows
    this.sun.shadow.mapSize.set(2048, 2048)
    const cam = this.sun.shadow.camera
    cam.left = -7
    cam.right = 7
    cam.top = 6
    cam.bottom = -6
    cam.near = 1
    cam.far = 30
    this.sun.shadow.bias = -0.0004
    this.sun.shadow.normalBias = 0.02
    this.sun.shadow.radius = 3
    scene.add(this.sun, this.sun.target)
    this.hemi = new THREE.HemisphereLight(0xdfe6ec, 0x9a8a6c, 0.38)
    scene.add(this.hemi)
    // The sky through the glass: one soft panel the size of the window wall.
    this.sky = new THREE.RectAreaLight(0xe4ecf2, 1.8, 6.6, 1.9)
    this.sky.position.set(ROOM.x0 + 0.05, (WIN.y0 + WIN.y1) / 2, 0)
    this.sky.lookAt(0, 1.2, 0)
    scene.add(this.sky)
    // Warm bounce off the sunlit floor and desks.
    this.bounce = new THREE.PointLight(0xffd2a0, 1.4, 7, 1.6)
    this.bounce.position.set(-0.6, 0.35, -1.0)
    scene.add(this.bounce)
    // The corner, later: a soft key for the reveal and the end (off before).
    this.corner = new THREE.SpotLight(0xfff0dc, 0, 8, 0.6, 0.8, 1.4)
    this.corner.position.set(0.6, 2.9, -0.6)
    this.corner.target.position.set(2.3, 0.8, -3.0)
    scene.add(this.corner, this.corner.target)

    // Beams, one per window.
    for (const z of WINDOWS) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: beamVert,
        fragmentShader: beamFrag,
        uniforms: {
          uOrigin: { value: new THREE.Vector3(ROOM.x0, (WIN.y0 + WIN.y1) / 2, z) },
          uInv: { value: new THREE.Matrix3() },
          uHalf: { value: new THREE.Vector2(WIN.w / 2, (WIN.y1 - WIN.y0) / 2) },
          uLen: { value: 9 },
          uColor: { value: new THREE.Color(0xffd9a0) },
          uDensity: { value: 0.05 },
          uTime: { value: 0 },
          uRoom: { value: new THREE.Vector4(ROOM.x1 - 0.02, ROOM.z0 + 0.03, ROOM.z1 - 0.02, 0.0) },
          uSun: { value: new THREE.Vector3(1, 0, 0) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
      })
      const geo = new THREE.BoxGeometry(1, 1, 1)
      const beam = new THREE.Mesh(geo, mat)
      beam.userData.unit = Float32Array.from(geo.attributes.position.array as Float32Array)
      beam.frustumCulled = false
      beam.renderOrder = 5
      beam.castShadow = false
      beam.receiveShadow = false
      beam.userData.noAO = true
      scene.add(beam)
      this.beams.push(beam)
      this.beamMats.push(mat)
    }

    // Chalk dust: motes that only show where the front beam passes.
    const count = 900
    const rand = mulberry32(77)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -2.6 + rand() * 3.4
      pos[i * 3 + 1] = 0.6 + rand() * 2.0
      pos[i * 3 + 2] = -3.42 + rand() * 1.5
      seed[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 1))
    this.moteMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOrigin: { value: new THREE.Vector3(ROOM.x0, (WIN.y0 + WIN.y1) / 2, WINDOWS[0]) },
        uInv: { value: new THREE.Matrix3() },
        uHalf: { value: new THREE.Vector2(WIN.w / 2, (WIN.y1 - WIN.y0) / 2) },
        uColor: { value: new THREE.Color(0xfff0d0) },
        uBurst: { value: 0 },
        uBurstAt: { value: new THREE.Vector3() },
        uSize: { value: 1 },
        uAmount: { value: 1 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uOrigin;
        uniform mat3 uInv;
        uniform vec2 uHalf;
        uniform float uBurst;
        uniform vec3 uBurstAt;
        uniform float uSize;
        attribute float seed;
        varying float vA;
        void main() {
          vec3 p = position;
          float s = seed * 6.2831;
          p += vec3(sin(uTime * 0.11 + s * 3.0), sin(uTime * 0.07 + s * 5.0) - 0.15 * fract(uTime * 0.004 + seed), cos(uTime * 0.09 + s * 2.0)) * 0.12;
          vec3 d = p - uBurstAt;
          float k = exp(-dot(d, d) / 0.05);
          p += normalize(d + vec3(0.0, 0.01, 0.0)) * uBurst * k * 0.35;
          vec3 q = uInv * (p - uOrigin);
          float inside = smoothstep(1.0, 0.8, abs(q.x / uHalf.x)) * smoothstep(1.0, 0.85, abs(q.y / uHalf.y)) * step(0.0, q.z);
          vA = inside * (0.4 + 0.6 * fract(seed * 13.7)) * (0.6 + 0.4 * sin(uTime * 0.8 + s * 7.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // Motes right at the lens would be white blobs: fade them out close to the camera, and keep them small.
          vA *= smoothstep(0.45, 1.1, -mv.z);
          gl_PointSize = min(uSize * 5.0, uSize * (1.2 + 2.6 * fract(seed * 7.1)) * (300.0 / -mv.z) * 0.012);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uAmount;
        varying float vA;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = 1.0 - smoothstep(0.1, 0.5, length(c));
          gl_FragColor = vec4(uColor * d * vA * uAmount, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.motes = new THREE.Points(g, this.moteMat)
    this.motes.frustumCulled = false
    this.motes.renderOrder = 6
    scene.add(this.motes)
  }

  /**
   * @param dir direction the light travels (normalized)
   * @param color sun color
   * @param strength 0 … 1 overall sun (for the beam density too)
   */
  update(dir: THREE.Vector3, color: THREE.Color, strength: number, time: number, dpr: number, eye: THREE.Vector3) {
    this.dir.copy(dir).normalize()
    this.sun.color.copy(color)
    this.sun.intensity = 6.2 * strength
    this.sun.target.position.set(0, 0.8, -0.5)
    this.sun.position.copy(this.sun.target.position).addScaledVector(this.dir, -14)
    this.sun.target.updateMatrixWorld()
    // Beam space: window axes (z along the wall, y up) and the sun direction.
    this.basis.set(0, 0, this.dir.x, 0, 1, this.dir.y, 1, 0, this.dir.z)
    this.inv.copy(this.basis).invert()
    for (let i = 0; i < this.beams.length; i++) {
      const mat = this.beamMats[i]
      const u = mat.uniforms
      u.uInv.value.copy(this.inv)
      u.uColor.value.copy(color)
      u.uTime.value = time
      u.uDensity.value = 0.022 * strength
      ;(u.uSun.value as THREE.Vector3).copy(this.dir)
      // The beam's own box: the window swept along the sun (its faces are where the light enters).
      const o = u.uOrigin.value as THREE.Vector3
      const L = u.uLen.value as number
      const beam = this.beams[i]
      const pos = beam.geometry.attributes.position as THREE.BufferAttribute
      const unit = beam.userData.unit as Float32Array
      const hz = WIN.w / 2
      const hy = (WIN.y1 - WIN.y0) / 2
      for (let k = 0; k < pos.count; k++) {
        // (a runs against the box's x so the swept box keeps its winding: front faces stay front)
        const a = -unit[k * 3] * 2 * hz
        const b = unit[k * 3 + 1] * 2 * hy
        const sd = (unit[k * 3 + 2] + 0.5) * L
        pos.setXYZ(k, o.x + this.dir.x * sd, o.y + b + this.dir.y * sd, o.z + a + this.dir.z * sd)
      }
      pos.needsUpdate = true
      // From inside the beam (or just outside it, where the near plane would cut its faces) only
      // its far faces can be drawn, and those can lie beyond the walls: draw them without the
      // depth test (the shader clips the light to the room itself).
      const q = this.tmp.copy(eye).sub(o).applyMatrix3(this.inv)
      const m = 0.35
      const inside = Math.abs(q.x) < hz + m && Math.abs(q.y) < hy + m && q.z > -m && q.z < L + m
      const side = inside ? THREE.BackSide : THREE.FrontSide
      if (mat.side !== side) {
        mat.side = side
        mat.depthTest = !inside
        mat.needsUpdate = true
      }
    }
    const mu = this.moteMat.uniforms
    mu.uInv.value.copy(this.inv)
    mu.uTime.value = time
    mu.uSize.value = dpr
  }

  burst(amount: number, at: THREE.Vector3) {
    this.moteMat.uniforms.uBurst.value = amount
    this.moteMat.uniforms.uBurstAt.value.copy(at)
  }

  /** Motes brightness (0 hides them). */
  dust(amount: number) {
    this.moteMat.uniforms.uAmount.value = amount
    this.motes.visible = amount > 0.001
  }

  dispose() {
    for (const m of this.beamMats) m.dispose()
    for (const b of this.beams) b.geometry.dispose()
    this.moteMat.dispose()
    this.motes.geometry.dispose()
  }
}
