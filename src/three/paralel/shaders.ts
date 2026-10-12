/**
 * PARALEL-LEŞ — the story's special materials: distant terrain lit only above
 * a sun line (dusk climbing a far ridge), moving water (river, sea, the
 * surface seen from below), additive glows and light shafts, and a thin
 * fresnel glass for the line in the void.
 */
import * as THREE from 'three'

export type Shared = { uSunLine: { value: number }; uTime: { value: number }; grade: { value: number } }

const GRADE = /* glsl */ `
{
  float gL = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gL) * vec3(0.84, 0.92, 1.1), uParalelGrade * 0.72);
}
`

/** Vertex-coloured Lambert terrain whose direct sun only lands above `uSunLine` (world y). */
export function distantMaterial(shared: Shared, opts: THREE.MeshLambertMaterialParameters = {}) {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, ...opts })
  m.onBeforeCompile = (s) => {
    s.uniforms.uSunLine = shared.uSunLine
    s.uniforms.uParalelGrade = shared.grade
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vWY;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
#ifdef USE_INSTANCING
  vWY = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).y;
#else
  vWY = (modelMatrix * vec4(transformed, 1.0)).y;
#endif`,
      )
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vWY;\nuniform float uSunLine;\nuniform float uParalelGrade;')
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nreflectedLight.directDiffuse *= smoothstep(uSunLine - 18.0, uSunLine + 18.0, vWY);')
      .replace('#include <fog_fragment>', GRADE + '\n#include <fog_fragment>')
  }
  m.customProgramCacheKey = () => 'paralel-distant'
  return m
}

const NOISE = /* glsl */ `
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm3(vec2 p) { return vn(p) * 0.5 + vn(p * 2.03 + 7.1) * 0.3 + vn(p * 4.1 + 3.3) * 0.2; }
`

const WATER_VERT = /* glsl */ `
uniform float uTime;
uniform vec2 uFlow;
uniform float uChop;
uniform float uSwell;
uniform vec2 uSwellDir;
uniform float uSwellLen;
uniform float uSwellSpeed;
uniform float uShore;
varying vec3 vW;
varying vec3 vN;
varying float vCrest;
#include <common>
#include <fog_pars_vertex>
${NOISE}
float wh(vec2 p) {
  vec2 q = p - uFlow * uTime;
  float h = 0.0;
  h += sin(q.x * 0.9 + q.y * 0.4 + uTime * 1.3) * 0.08;
  h += sin(-q.x * 0.5 + q.y * 1.3 - uTime * 1.7) * 0.06;
  h += (fbm3(q * 0.55) - 0.5) * 0.5;
  h *= uChop;
  float s = dot(p, uSwellDir) / uSwellLen - uTime * uSwellSpeed;
  float sw = 0.5 + 0.5 * sin(s * 6.2831);
  // Near a shore (uShore = its z, swells running toward +z) the swell dies into the shallows.
  float shore = uShore > -999.0 ? 1.0 - smoothstep(uShore - 14.0, uShore - 1.0, p.y) : 1.0;
  h += uSwell * (pow(sw, 3.0) - 0.3) * shore;
  return h * mix(1.0, 0.25, 1.0 - shore);
}
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  float h = wh(w.xz);
  float hx = wh(w.xz + vec2(0.4, 0.0));
  float hz = wh(w.xz + vec2(0.0, 0.4));
  w.y += h;
  vW = w.xyz;
  vN = normalize(vec3(h - hx, 0.4, h - hz));
  float s = dot(w.xz, uSwellDir) / uSwellLen - uTime * uSwellSpeed;
  vCrest = uSwell > 0.0 ? pow(0.5 + 0.5 * sin(s * 6.2831), 6.0) : 0.0;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`

const WATER_FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uFlow;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uSky;
uniform vec3 uSkyTop;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uFoamColor;
uniform float uFoam;
uniform float uParalelGrade;
uniform float uFlat;
varying vec3 vW;
varying vec3 vN;
varying float vCrest;
#include <common>
#include <fog_pars_fragment>
${NOISE}
void main() {
  vec3 n = normalize(mix(vN, vec3(0.0, 1.0, 0.0), uFlat));
  vec2 q = vW.xz - uFlow * uTime;
  // Small ripples on top of the mesh's waves.
  float r1 = vn(q * 3.1 + uTime * 0.6);
  float r2 = vn(q * 5.3 - uTime * 0.9);
  n = normalize(n + vec3(r1 - 0.5, 0.0, r2 - 0.5) * 0.35 * (1.0 - uFlat));
  vec3 v = normalize(cameraPosition - vW);
  float nv = clamp(dot(n, v), 0.0, 1.0);
  float fres = 0.02 + 0.98 * pow(1.0 - nv, 5.0);
  vec3 r = reflect(-v, n);
  vec3 sky = mix(uSky, uSkyTop, clamp(r.y, 0.0, 1.0));
  vec3 body = mix(uDeep, uShallow, clamp(0.35 + vW.y * 0.4 + (fbm3(q * 0.3) - 0.5) * 0.4, 0.0, 1.0));
  vec3 col = mix(body, sky, fres * 0.85);
  float spec = pow(max(dot(r, normalize(uSunDir)), 0.0), 160.0);
  col += uSunColor * spec * 1.6;
  // Foam: streaks carried by the flow, thicker on crests.
  float fa = fbm3(q * vec2(0.7, 0.25) * 1.6);
  float fb = vn(q * 2.4 + 13.0);
  float foam = smoothstep(0.62 - uFoam * 0.35, 0.82 - uFoam * 0.3, fa * 0.7 + fb * 0.3);
  foam = max(foam, smoothstep(0.35, 0.9, vCrest) * (0.6 + 0.4 * fb));
  col = mix(col, uFoamColor, clamp(foam * uFoam, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  ${GRADE}
  #include <fog_fragment>
}`

export type WaterOpts = {
  deep: number
  shallow: number
  sky: number
  skyTop: number
  sunColor?: number
  foamColor?: number
  foam?: number
  flow?: [number, number]
  chop?: number
  swell?: number
  swellDir?: [number, number]
  swellLen?: number
  swellSpeed?: number
  /** z of a shoreline the swells run up to (they fade in the last metres). */
  shore?: number
}

export function waterMaterial(shared: Shared, o: WaterOpts) {
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uFlow: { value: new THREE.Vector2(...(o.flow ?? [0, 0])) },
        uChop: { value: o.chop ?? 1 },
        uSwell: { value: o.swell ?? 0 },
        uSwellDir: { value: new THREE.Vector2(...(o.swellDir ?? [0, 1])).normalize() },
        uSwellLen: { value: o.swellLen ?? 30 },
        uSwellSpeed: { value: o.swellSpeed ?? 0.16 },
        uShore: { value: o.shore ?? -1000 },
        uDeep: { value: new THREE.Color(o.deep) },
        uShallow: { value: new THREE.Color(o.shallow) },
        uSky: { value: new THREE.Color(o.sky) },
        uSkyTop: { value: new THREE.Color(o.skyTop) },
        uSunDir: { value: new THREE.Vector3(-0.5, 0.4, -0.6).normalize() },
        uSunColor: { value: new THREE.Color(o.sunColor ?? 0x000000) },
        uFoamColor: { value: new THREE.Color(o.foamColor ?? 0xf2f2ec) },
        uFoam: { value: o.foam ?? 0.5 },
        uFlat: { value: 0 },
      },
    ]),
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    fog: true,
  })
  // Shared clock and grade (merge() clones, so attach the shared objects after).
  m.uniforms.uTime = shared.uTime
  m.uniforms.uParalelGrade = shared.grade
  return m
}

/** An additive glow (bulb halos, light pools, sparks): a soft radial sprite on a plane. */
export function glowMaterial(color: THREE.ColorRepresentation, opacity = 1) {
  const tex = radialTexture()
  return new THREE.MeshBasicMaterial({ color, map: tex, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide })
}

let radial: THREE.Texture | null = null
export function radialTexture() {
  if (radial) return radial
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.2, 'rgba(255,255,255,0.55)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0.14)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  radial = new THREE.CanvasTexture(c)
  return radial
}

/** A shaft of light: an open cone, additive, brightest on the axis and fading toward the end. */
export function shaftMaterial(color: THREE.ColorRepresentation, strength = 0.35) {
  return new THREE.ShaderMaterial({
    // (opacity is not read by the shader; it marks the cone as see-through for the camera-clip check)
    opacity: 0.2,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vY = uv.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uStrength;
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.0);
        float a = f * smoothstep(0.0, 0.6, vY) * uStrength;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

/** The line: a nearly invisible glass filament that glows near the boy's feet. */
export function lineMaterial() {
  return new THREE.ShaderMaterial({
    opacity: 0.2,
    uniforms: { uFeet: { value: new THREE.Vector3() }, uGlow: { value: 1 }, uColor: { value: new THREE.Color(0xbfefff) }, uRadius: { value: 3 } },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFeet; uniform float uGlow; uniform vec3 uColor; uniform float uRadius;
      varying vec3 vW; varying vec3 vN; varying vec3 vV;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5);
        float d = abs(vW.z - uFeet.z);
        float near = exp(-d * d / (uRadius * uRadius * 0.35));
        float base = 0.05 + 0.12 * rim;
        vec3 c = uColor * (base + near * uGlow * (0.9 + 1.4 * rim));
        gl_FragColor = vec4(c, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/** Soft particles (dust, bubbles, sand, motes). Size in world units. */
export function particleMaterial(color: THREE.ColorRepresentation, size: number, opacity = 0.6, additive = true) {
  return new THREE.PointsMaterial({ color, size, map: radialTexture(), transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true })
}

/** The sea's surface seen from below: a moving silver sheet with a paler patch where the light is. */
export function undersideMaterial(shared: Shared) {
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uColor: { value: new THREE.Color(0x6f9c8c) },
        uPatch: { value: new THREE.Vector3(401.5, 0, -19.5) },
        uPatchColor: { value: new THREE.Color(0xd8f0e0) },
        uPatchAmt: { value: 1 },
        uBright: { value: 1 },
      },
    ]),
    vertexShader: /* glsl */ `
      varying vec3 vW;
      #include <common>
      #include <fog_pars_vertex>
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uPatch;
      uniform vec3 uPatchColor;
      uniform float uPatchAmt;
      uniform float uBright;
      uniform float uParalelGrade;
      varying vec3 vW;
      #include <common>
      #include <fog_pars_fragment>
      ${NOISE}
      void main() {
        vec2 q = vW.xz;
        float a = vn(q * 0.9 + vec2(uTime * 0.35, uTime * 0.2));
        float b = vn(q * 2.3 - vec2(uTime * 0.5, -uTime * 0.3));
        float caust = pow(abs(sin((a + b) * 6.0)), 6.0);
        vec3 col = uColor * (0.55 + 0.6 * a) + vec3(0.8, 0.95, 0.9) * caust * 0.45;
        float d = length(vW.xz - uPatch.xz);
        col += uPatchColor * uPatchAmt * exp(-d * d / 18.0) * (0.8 + 0.4 * b);
        gl_FragColor = vec4(col * uBright, 1.0);
        ${GRADE}
        #include <fog_fragment>
      }`,
    side: THREE.BackSide,
    fog: true,
  })
  m.uniforms.uTime = shared.uTime
  m.uniforms.uParalelGrade = shared.grade
  return m
}
