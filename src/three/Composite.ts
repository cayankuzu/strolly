/**
 * Final pass: tone mapping, the memory overlay (a second moment laid over the
 * first, like an afterimage), fade, vignette and a whisper of grain.
 */
import * as THREE from 'three'

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const fragment = /* glsl */ `
uniform sampler2D tMain;
uniform sampler2D tGhost;
uniform sampler2D tAO;
uniform float uAO;
uniform float uGhost;
uniform float uFade;
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform vec2 uRes;
varying vec2 vUv;

void main() {
  vec3 c = texture2D(tMain, vUv).rgb;
  if (uAO > 0.001) c *= mix(1.0, texture2D(tAO, vUv).r, uAO);
  if (uGhost > 0.001) {
    vec3 g = texture2D(tGhost, vUv).rgb;
    c = mix(c, max(c, g * 0.92), uGhost) + g * uGhost * 0.12;
  }
  gl_FragColor = vec4(c * uFade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  vec2 q = vUv - 0.5;
  q.x *= uRes.x / uRes.y;
  gl_FragColor.rgb *= mix(1.0, smoothstep(1.15, 0.2, length(q)), uVignette);
  float n = fract(sin(dot(floor(vUv * uRes) + fract(uTime * 7.13) * 91.7, vec2(12.9898, 78.233))) * 43758.5453);
  gl_FragColor.rgb += (n - 0.5) * uGrain * uFade;
}
`

export class Composite {
  readonly material: THREE.ShaderMaterial
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh

  constructor() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        tMain: { value: null },
        tGhost: { value: null },
        tAO: { value: null },
        uAO: { value: 0 },
        uGhost: { value: 0 },
        uFade: { value: 1 },
        uTime: { value: 0 },
        uGrain: { value: 0.028 },
        uVignette: { value: 0.55 },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material)
    this.quad.frustumCulled = false
    this.scene.add(this.quad)
  }

  render(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(null)
    renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.quad.geometry.dispose()
    this.material.dispose()
  }
}
