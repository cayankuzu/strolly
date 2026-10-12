/**
 * PARALEL-LEŞ — the other self. A ghost is the same rig in the same clothes,
 * drawn in one unlit pale cyan-white with a brighter fresnel rim, never
 * casting a shadow. At the instant of division it is exactly coincident with
 * the real figure; then it goes its own way, leaves a faint trail of where it
 * was a moment ago, and fades out before it touches anything.
 */
import * as THREE from 'three'
import { Figure, type FigureLook } from '../figure/Figure'
import { Actor } from '../kit/direct'

const VERT = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
varying vec3 vN;
varying vec3 vV;
void main() {
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  vN = normalize(transformedNormal);
  vV = normalize(-mvPosition.xyz);
  #include <fog_vertex>
}`

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uRimColor;
uniform float uOpacity;
uniform float uFlash;
uniform float uAlpha;
#include <common>
#include <fog_pars_fragment>
varying vec3 vN;
varying vec3 vV;
void main() {
  float nv = abs(dot(normalize(vN), normalize(vV)));
  float rim = pow(1.0 - nv, 2.4);
  vec3 col = uColor * (0.32 + 0.68 * rim) + uRimColor * rim * (0.55 + 2.6 * uFlash);
  col += uRimColor * uFlash * 0.35;
  float fade = 1.0;
  #ifdef USE_FOG
    #ifdef FOG_EXP2
      float ff = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
      float ff = smoothstep(fogNear, fogFar, vFogDepth);
    #endif
    fade = 1.0 - ff;
  #endif
  if (uAlpha > 0.5) {
    gl_FragColor = vec4(col, clamp(uOpacity * (0.5 + 0.7 * rim + uFlash) * fade, 0.0, 1.0));
  } else {
    gl_FragColor = vec4(col * uOpacity * fade, 1.0);
  }
}`

export function ghostMaterial(color = 0xcfefff) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uColor: { value: new THREE.Color(color) },
        uRimColor: { value: new THREE.Color(0xffffff) },
        uOpacity: { value: 0.32 },
        uFlash: { value: 0 },
        uAlpha: { value: 0 },
      },
    ]),
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: true,
  })
}

/** Swaps every material of a figure to `mat`; no shadows. Returns the eyelid meshes. */
export function ghostify(fig: Figure, mat: THREE.Material) {
  const lids: THREE.Mesh[] = []
  fig.root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    m.material = mat
    m.castShadow = false
    m.receiveShadow = false
    m.renderOrder = 5
    if (m.userData.open !== undefined) lids.push(m)
  })
  return lids
}

/** Eyelids of a solid figure (closed eyes for the standing dead, a blink held). */
export function lidsOf(fig: Figure) {
  const lids: THREE.Mesh[] = []
  fig.root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o.userData.open !== undefined) lids.push(o as THREE.Mesh)
  })
  return lids
}

export function closeLids(lids: THREE.Mesh[], amount = 1) {
  for (const l of lids) l.rotation.x = l.userData.open + 0.78 * amount
}

export class Ghost {
  readonly figure: Figure
  readonly actor: Actor
  readonly material = ghostMaterial()
  readonly lids: THREE.Mesh[]
  /** Figure height factor (for trail copies). */
  readonly height: number

  constructor(look: FigureLook, dress?: (fig: Figure) => void) {
    this.figure = new Figure(look)
    dress?.(this.figure)
    this.actor = new Actor(this.figure)
    this.height = look.height ?? 1
    this.lids = ghostify(this.figure, this.material)
    this.figure.root.visible = false
  }

  /** Opacity (0 hides) and the division flash (0–1). */
  set(opacity: number, flash = 0) {
    const u = this.material.uniforms
    u.uOpacity.value = opacity
    u.uFlash.value = flash
    this.figure.root.visible = opacity > 0.002 || flash > 0.002
  }

  /** Normal (alpha) blending for bright backgrounds; additive in the dark. */
  mode(alpha: boolean) {
    this.material.uniforms.uAlpha.value = alpha ? 1 : 0
    const b = alpha ? THREE.NormalBlending : THREE.AdditiveBlending
    if (this.material.blending !== b) this.material.blending = b
  }

  hide() {
    this.figure.root.visible = false
  }
}

/** The flash at the instant of division: 1 at `at`, gone 0.03 later. */
export const flashAt = (u: number, at: number, len = 0.03) => (u >= at && u < at + len ? 1 - (u - at) / len : 0)
