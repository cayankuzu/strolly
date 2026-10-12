/**
 * ÖFKE's own lens: the shots seen through somebody's eyes — the lens going
 * soft and snapping sharp, the overexposed white room behind a smiling man,
 * the drugged floor-level view of 333 — need a blur the shared final pass does
 * not have. This pass blurs the rendered frame (dual-filter down/up chain),
 * then mixes in the blur, an overexposure lift, a vignette and a tint at the
 * edges, and hands the result to the stage's final pass as its source.
 */
import * as THREE from 'three'

export type PostParams = {
  /** 0 sharp … 1 heavily blurred. */
  blur: number
  /** 0 … 1: lifts toward white (overexposure). */
  white: number
  /** 0 … 1 extra vignette. */
  vignette: number
  /** Edge tint (linear RGB) and its amount (a mint shimmer at the edges). */
  tint: THREE.Color
  tintAmount: number
  /** A slow double image (drugged eyes), in uv units. */
  ghost: number
}

export const makePost = (): PostParams => ({ blur: 0, white: 0, vignette: 0, tint: new THREE.Color(0x7fd1c1), tintAmount: 0, ghost: 0 })
export const postActive = (p: PostParams) => p.blur > 0.002 || p.white > 0.002 || p.vignette > 0.002 || p.tintAmount > 0.002 || p.ghost > 0.0005

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`
const down = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uHalf;
varying vec2 vUv;
void main() {
  vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
  s += texture2D(tSrc, vUv - uHalf).rgb;
  s += texture2D(tSrc, vUv + uHalf).rgb;
  s += texture2D(tSrc, vUv + vec2(uHalf.x, -uHalf.y)).rgb;
  s += texture2D(tSrc, vUv - vec2(uHalf.x, -uHalf.y)).rgb;
  gl_FragColor = vec4(s / 8.0, 1.0);
}
`
const up = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uHalf;
varying vec2 vUv;
void main() {
  vec3 s = texture2D(tSrc, vUv + vec2(-uHalf.x * 2.0, 0.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(-uHalf.x, uHalf.y)).rgb * 2.0;
  s += texture2D(tSrc, vUv + vec2(0.0, uHalf.y * 2.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(uHalf.x, uHalf.y)).rgb * 2.0;
  s += texture2D(tSrc, vUv + vec2(uHalf.x * 2.0, 0.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(uHalf.x, -uHalf.y)).rgb * 2.0;
  s += texture2D(tSrc, vUv + vec2(0.0, -uHalf.y * 2.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(-uHalf.x, -uHalf.y)).rgb * 2.0;
  gl_FragColor = vec4(s / 12.0, 1.0);
}
`
const mix = /* glsl */ `
uniform sampler2D tSharp;
uniform sampler2D tSoft;
uniform sampler2D tMid;
uniform float uBlur;
uniform float uWhite;
uniform float uVig;
uniform vec3 uTint;
uniform float uTintAmt;
uniform float uGhost;
uniform float uTime;
uniform vec2 uAspect;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tSharp, vUv).rgb;
  vec3 m = texture2D(tMid, vUv).rgb;
  vec3 s = texture2D(tSoft, vUv).rgb;
  // Two stages so a little blur is a soft focus and a lot is a smear.
  vec3 b = uBlur < 0.5 ? mix(c, m, uBlur * 2.0) : mix(m, s, uBlur * 2.0 - 1.0);
  if (uGhost > 0.0) {
    vec2 o = vec2(sin(uTime * 0.7), cos(uTime * 0.53)) * uGhost;
    b = mix(b, texture2D(tMid, vUv + o).rgb, 0.35);
  }
  vec2 q = (vUv - 0.5) * uAspect;
  float r = length(q);
  // Overexposure: the middle burns out first.
  float burn = uWhite * (1.0 - 0.35 * smoothstep(0.1, 0.9, r));
  b = b * (1.0 + burn * 2.2) + vec3(burn * 0.9);
  float edge = smoothstep(0.35, 0.95, r);
  b += uTint * edge * uTintAmt;
  b *= mix(1.0, smoothstep(1.05, 0.15, r), uVig);
  gl_FragColor = vec4(b, 1.0);
}
`

export class OfkePost {
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh
  private down: THREE.ShaderMaterial
  private up: THREE.ShaderMaterial
  private mixer: THREE.ShaderMaterial
  private levels: THREE.WebGLRenderTarget[] = []
  private ups: THREE.WebGLRenderTarget[] = []
  private out: THREE.WebGLRenderTarget
  private w = 0
  private h = 0

  constructor(type: THREE.TextureDataType) {
    const opts = { type, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
    for (let i = 0; i < 5; i++) this.levels.push(new THREE.WebGLRenderTarget(1, 1, opts))
    for (let i = 0; i < 4; i++) this.ups.push(new THREE.WebGLRenderTarget(1, 1, opts))
    this.out = new THREE.WebGLRenderTarget(1, 1, opts)
    this.down = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: down, uniforms: { tSrc: { value: null }, uHalf: { value: new THREE.Vector2() } }, depthTest: false, depthWrite: false })
    this.up = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: up, uniforms: { tSrc: { value: null }, uHalf: { value: new THREE.Vector2() } }, depthTest: false, depthWrite: false })
    this.mixer = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: mix,
      uniforms: {
        tSharp: { value: null },
        tSoft: { value: null },
        tMid: { value: null },
        uBlur: { value: 0 },
        uWhite: { value: 0 },
        uVig: { value: 0 },
        uTint: { value: new THREE.Color() },
        uTintAmt: { value: 0 },
        uGhost: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: new THREE.Vector2(1, 1) },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.down)
    this.quad.frustumCulled = false
    this.scene.add(this.quad)
  }

  private size(w: number, h: number) {
    if (w === this.w && h === this.h) return
    this.w = w
    this.h = h
    this.out.setSize(w, h)
    let lw = w
    let lh = h
    for (let i = 0; i < this.levels.length; i++) {
      lw = Math.max(1, Math.round(lw / 2))
      lh = Math.max(1, Math.round(lh / 2))
      this.levels[i].setSize(lw, lh)
      if (i < this.ups.length) this.ups[i].setSize(lw, lh)
    }
  }

  private pass(r: THREE.WebGLRenderer, mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) {
    this.quad.material = mat
    r.setRenderTarget(target)
    r.render(this.scene, this.camera)
  }

  /** Runs the pass over `src` (the rendered frame); returns the texture to present. */
  render(r: THREE.WebGLRenderer, src: THREE.WebGLRenderTarget, p: PostParams, time: number) {
    this.size(src.width, src.height)
    // Down: frame → 1/2 → 1/4 → 1/8 → 1/16 → 1/32.
    let prev: THREE.Texture = src.texture
    let pw = src.width
    let ph = src.height
    const depth = this.levels.length
    for (let i = 0; i < depth; i++) {
      this.down.uniforms.tSrc.value = prev
      this.down.uniforms.uHalf.value.set(0.5 / pw, 0.5 / ph)
      this.pass(r, this.down, this.levels[i])
      prev = this.levels[i].texture
      pw = this.levels[i].width
      ph = this.levels[i].height
    }
    // Up again to 1/2: the soft image. The first 1/2 level is the light one.
    for (let i = depth - 2; i >= 0; i--) {
      this.up.uniforms.tSrc.value = prev
      this.up.uniforms.uHalf.value.set(0.5 / pw, 0.5 / ph)
      this.pass(r, this.up, this.ups[i])
      prev = this.ups[i].texture
      pw = this.ups[i].width
      ph = this.ups[i].height
    }
    const mid = this.levels[0].texture
    const u = this.mixer.uniforms
    u.tSharp.value = src.texture
    u.tSoft.value = prev
    u.tMid.value = mid
    u.uBlur.value = p.blur
    u.uWhite.value = p.white
    u.uVig.value = p.vignette
    u.uTint.value.copy(p.tint)
    u.uTintAmt.value = p.tintAmount
    u.uGhost.value = p.ghost
    u.uTime.value = time
    u.uAspect.value.set(src.width / Math.max(1, src.height), 1)
    this.pass(r, this.mixer, this.out)
    r.setRenderTarget(null)
    return this.out.texture
  }

  dispose() {
    for (const t of [...this.levels, ...this.ups, this.out]) t.dispose()
    this.down.dispose()
    this.up.dispose()
    this.mixer.dispose()
    this.quad.geometry.dispose()
  }
}
