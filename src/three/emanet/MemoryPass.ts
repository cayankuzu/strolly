/**
 * Memory resolution, the picture side: every object writes how well it is
 * remembered into a small mask; the frame is blurred at half resolution and
 * mixed back by that mask, then graded (warmth, fading colour, haze).
 *
 * Output is still linear HDR — the stage's composite does the tone mapping.
 */
import * as THREE from 'three'
import type { Stage } from '../Stage'
import type { Memory } from './memory'

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const blurFrag = /* glsl */ `
uniform sampler2D tInput;
uniform vec2 uDir;
varying vec2 vUv;
void main() {
  // 9-tap gaussian, wide steps: memory blur is soft, not optical.
  vec3 c = texture2D(tInput, vUv).rgb * 0.2270270270;
  c += texture2D(tInput, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tInput, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tInput, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
  c += texture2D(tInput, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}
`

const combineFrag = /* glsl */ `
uniform sampler2D tSharp;
uniform sampler2D tBlur;
uniform sampler2D tMask;
uniform float uWarm;
uniform float uDesat;
uniform float uHaze;
uniform float uVeil;
varying vec2 vUv;
void main() {
  vec3 sharp = texture2D(tSharp, vUv).rgb;
  vec3 soft = texture2D(tBlur, vUv).rgb;
  float m = clamp(texture2D(tMask, vUv).r + uVeil, 0.0, 1.0);
  vec3 c = mix(sharp, soft, smoothstep(0.0, 0.85, m));
  // Haze: light spills a little, the way it does in remembered rooms.
  c += soft * uHaze * 0.16;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c, vec3(l), uDesat);
  c *= mix(vec3(1.0), vec3(1.06, 0.99, 0.9), uWarm);
  gl_FragColor = vec4(c, 1.0);
}
`

export class MemoryPass {
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh
  private blur: THREE.ShaderMaterial
  private combine: THREE.ShaderMaterial
  private mask: THREE.WebGLRenderTarget
  private a: THREE.WebGLRenderTarget
  private b: THREE.WebGLRenderTarget
  readonly output: THREE.WebGLRenderTarget
  readonly grade = { warm: 0, desat: 0, haze: 0, veil: 0 }

  constructor(private stage: Stage) {
    const type = stage.targetType
    this.mask = new THREE.WebGLRenderTarget(1, 1, { type: THREE.UnsignedByteType, depthBuffer: true })
    this.a = new THREE.WebGLRenderTarget(1, 1, { type, depthBuffer: false })
    this.b = new THREE.WebGLRenderTarget(1, 1, { type, depthBuffer: false })
    this.output = new THREE.WebGLRenderTarget(1, 1, { type, depthBuffer: false })
    for (const t of [this.a, this.b, this.mask]) {
      t.texture.minFilter = THREE.LinearFilter
      t.texture.magFilter = THREE.LinearFilter
    }
    this.blur = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: blurFrag,
      uniforms: { tInput: { value: null }, uDir: { value: new THREE.Vector2() } },
      depthTest: false,
      depthWrite: false,
    })
    this.combine = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: combineFrag,
      uniforms: {
        tSharp: { value: null },
        tBlur: { value: null },
        tMask: { value: null },
        uWarm: { value: 0 },
        uDesat: { value: 0 },
        uHaze: { value: 0 },
        uVeil: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blur)
    this.quad.frustumCulled = false
    this.scene.add(this.quad)
  }

  private fit() {
    const W = this.stage.rtMain.width
    const H = this.stage.rtMain.height
    if (this.output.width === W && this.output.height === H) return
    this.output.setSize(W, H)
    const hw = Math.max(1, Math.round(W / 2))
    const hh = Math.max(1, Math.round(H / 2))
    this.a.setSize(hw, hh)
    this.b.setSize(hw, hh)
    this.mask.setSize(Math.max(1, Math.round(W / 4)), Math.max(1, Math.round(H / 4)))
  }

  /** Writes the remembered-ness of everything in view into the mask. */
  drawMask(scene: THREE.Scene, camera: THREE.Camera, memory: Memory, rectW: number, rectH: number) {
    this.fit()
    const r = this.stage.renderer
    const shadows = r.shadowMap.autoUpdate
    const background = scene.background
    r.shadowMap.autoUpdate = false
    scene.background = null
    memory.useMask(true)
    r.setClearColor(0x000000, 1)
    this.stage.draw(this.mask, scene, camera, rectW, rectH)
    memory.useMask(false)
    scene.background = background
    r.shadowMap.autoUpdate = shadows
  }

  private pass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) {
    const r = this.stage.renderer
    this.quad.material = material
    r.setRenderTarget(target)
    r.render(this.scene, this.camera)
  }

  /** Blurs and grades rtMain into `output`. */
  resolve() {
    this.fit()
    const src = this.stage.rtMain.texture
    const u = this.blur.uniforms
    const w = this.a.width
    const h = this.a.height
    // Two separable passes at two radii make a soft, wide blur cheaply.
    u.tInput.value = src
    u.uDir.value.set(1.6 / w, 0)
    this.pass(this.blur, this.a)
    u.tInput.value = this.a.texture
    u.uDir.value.set(0, 1.6 / h)
    this.pass(this.blur, this.b)
    u.tInput.value = this.b.texture
    u.uDir.value.set(3.2 / w, 0)
    this.pass(this.blur, this.a)
    u.tInput.value = this.a.texture
    u.uDir.value.set(0, 3.2 / h)
    this.pass(this.blur, this.b)

    const c = this.combine.uniforms
    c.tSharp.value = src
    c.tBlur.value = this.b.texture
    c.tMask.value = this.mask.texture
    c.uWarm.value = this.grade.warm
    c.uDesat.value = this.grade.desat
    c.uHaze.value = this.grade.haze
    c.uVeil.value = this.grade.veil
    this.pass(this.combine, this.output)
    return this.output.texture
  }

  dispose() {
    this.quad.geometry.dispose()
    this.blur.dispose()
    this.combine.dispose()
    this.mask.dispose()
    this.a.dispose()
    this.b.dispose()
    this.output.dispose()
  }
}
