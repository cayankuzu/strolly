/**
 * The office arriving in the white room. Every surface of the hallucinated
 * office is painted with this patch on its own lit material: each point has
 * an arrival time T (from seeds at the window, the desk, the door, the walls,
 * bent by noise), and the global `uReveal` sweeps past it. Early arrivals are
 * quantized to 6 cm cells — the room converting "piksel piksel" — later ones
 * are soft capillary fronts with a darker wet edge, like water taking a dry
 * towel. What has not arrived is the flat, shadowless white of the room.
 *
 * The same patch runs backward in small capsules (`uPA/uPB`) for the white
 * glitches of the fit, mottles the room when it subsides, assembles the copies
 * out of cells (mode 1, unrevealed parts discarded) and bursts the monitor
 * into nothing (mode 2).
 */
import * as THREE from 'three'

export type RevealU = {
  uReveal: { value: number }
  uMottle: { value: number }
  uDelay: { value: number }
  uHide: { value: number }
  uEdge: { value: number }
  uMode: { value: number }
  uSeed: { value: THREE.Vector4 }
  uWhite: { value: THREE.Vector3 }
  uPA: { value: THREE.Vector4[] }
  uPB: { value: THREE.Vector4[] }
}

export const PATCHES = 6

/** Uniforms for one group of surfaces; pass `share` to tie the white and the patches to another group's. */
export function revealUniforms(share?: RevealU): RevealU {
  return {
    uReveal: { value: 0 },
    uMottle: share ? share.uMottle : { value: 0 },
    uDelay: { value: 0 },
    uHide: { value: 0 },
    uEdge: { value: -1 },
    uMode: { value: 0 },
    uSeed: { value: new THREE.Vector4(0, 0, 0, 1) },
    uWhite: share ? share.uWhite : { value: new THREE.Vector3(2.3, 2.34, 2.34) },
    uPA: share ? share.uPA : { value: Array.from({ length: PATCHES }, () => new THREE.Vector4()) },
    uPB: share ? share.uPB : { value: Array.from({ length: PATCHES }, () => new THREE.Vector4()) },
  }
}

const decl = /* glsl */ `
varying vec3 vRW;
varying vec3 vRWN;
`

const vert = /* glsl */ `
{
  vec4 rvW = vec4(transformed, 1.0);
  vec3 rvN = normal;
  #ifdef USE_INSTANCING
  rvW = instanceMatrix * rvW;
  rvN = mat3(instanceMatrix) * rvN;
  #endif
  rvW = modelMatrix * rvW;
  vRW = rvW.xyz;
  vRWN = normalize(mat3(modelMatrix) * rvN);
}
`

const fragDecl = /* glsl */ `
uniform float uReveal;
uniform float uMottle;
uniform float uDelay;
uniform float uHide;
uniform float uEdge;
uniform float uMode;
uniform vec4 uSeed;
uniform vec3 uWhite;
uniform vec4 uPA[${PATCHES}];
uniform vec4 uPB[${PATCHES}];
float rvHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float rvNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(rvHash(i), rvHash(i + vec3(1, 0, 0)), f.x), mix(rvHash(i + vec3(0, 1, 0)), rvHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(rvHash(i + vec3(0, 0, 1)), rvHash(i + vec3(1, 0, 1)), f.x), mix(rvHash(i + vec3(0, 1, 1)), rvHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float rvFbm(vec3 p) {
  return 0.5 * rvNoise(p) + 0.25 * rvNoise(p * 2.03 + 1.7) + 0.125 * rvNoise(p * 4.01 + 3.1) + 0.0625 * rvNoise(p * 8.07 + 5.3);
}
/** When the office reaches a point of ODA 3 (world coordinates). */
float rvRoom(vec3 p) {
  float t = 9.0;
  t = min(t, 0.00 + distance(p, vec3(160.0, 1.7, -2.5)) * 0.15);
  t = min(t, 0.03 + distance(p, vec3(160.1, 0.0, -0.3)) * 0.15);
  t = min(t, 0.13 + distance(p, vec3(160.0, 1.4, 2.5)) * 0.16);
  t = min(t, 0.22 + distance(p, vec3(157.5, 1.6, 0.0)) * 0.16);
  t = min(t, 0.28 + distance(p, vec3(162.5, 1.3, -1.4)) * 0.16);
  return t;
}
`

const frag = /* glsl */ `
{
  vec3 P = vRW;
  float T;
  if (uMode < 0.5) {
    vec3 cell = floor(P / 0.06) * 0.06 + 0.03;
    float tc = rvRoom(cell) + (rvHash(cell * 1.7) - 0.5) * 0.05;
    float ts = rvRoom(P) + (rvFbm(P * 1.35) - 0.47) * 0.2 + smoothstep(0.6, 0.9, abs(vRWN.y)) * 0.09;
    T = tc < 0.34 ? tc : max(ts, 0.3);
    if (uDelay > 0.0) T = max(T, uDelay + (rvFbm(P * 2.6 + 9.0) - 0.45) * 0.16);
  } else {
    vec3 cell = floor(P / 0.045) * 0.045 + 0.0225;
    float d = distance(cell, uSeed.xyz);
    T = uMode < 1.5 ? d * uSeed.w : 1.0 - d * uSeed.w;
    T += (rvHash(cell * 1.3) - 0.5) * 0.06;
  }
  if (uMottle > 0.0) T = mix(T, 0.08 + 0.95 * rvFbm(P * 1.6 + 4.0), uMottle);
  vec3 q = floor(P / 0.07) * 0.07 + 0.035;
  for (int i = 0; i < ${PATCHES}; i++) {
    float s = uPB[i].w;
    if (s <= 0.0) continue;
    vec3 a = uPA[i].xyz;
    vec3 ab = uPB[i].xyz - a;
    float h = clamp(dot(q - a, ab) / max(dot(ab, ab), 1e-5), 0.0, 1.0);
    float d = length(q - a - ab * h);
    float r = uPA[i].w * (0.75 + 0.5 * rvHash(q * 3.1 + float(i)));
    T += s * (1.0 - smoothstep(r * 0.55, r, d)) * 1.6;
  }
  float e = (uReveal - T) / 0.045;
  if (e <= 0.0) {
    if (uHide > 0.5) discard;
    float shade = 0.95 + 0.04 * vRWN.y - 0.02 * abs(vRWN.x);
    vec3 dd = vec3(min(P.x - 157.5, 162.5 - P.x), min(P.y, 3.0 - P.y), min(P.z + 2.5, 2.5 - P.z));
    dd = max(dd, vec3(0.0));
    float mx = max(dd.x, max(dd.y, dd.z));
    float mn = min(dd.x, min(dd.y, dd.z));
    float second = dd.x + dd.y + dd.z - mx - mn;
    shade *= 0.88 + 0.12 * smoothstep(0.0, 1.1, second);
    outgoingLight = uWhite * shade;
  } else if (e < 1.0) {
    if (uEdge > 0.0) outgoingLight = mix(uWhite * 1.3, outgoingLight, e);
    else outgoingLight *= mix(0.45, 1.0, e * e);
  }
}
`

/** Patches a material (a clone) with the reveal; shares the uniform objects in `u`. */
export function revealMaterial<T extends THREE.Material>(source: T, u: RevealU): T {
  const m = source.clone() as T
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${decl}`).replace('#include <project_vertex>', `#include <project_vertex>\n${vert}`)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${decl}\n${fragDecl}`).replace('#include <opaque_fragment>', `${frag}\n#include <opaque_fragment>`)
  }
  m.customProgramCacheKey = () => 'ofke-reveal-1'
  m.userData.reveal = u
  return m
}

/** Replaces every material under `root` with a reveal clone tied to `u` (one clone per source material). */
export function revealify(root: THREE.Object3D, u: RevealU) {
  const cache = new Map<THREE.Material, THREE.Material>()
  const swap = (mat: THREE.Material) => {
    let c = cache.get(mat)
    if (!c) {
      c = revealMaterial(mat, u)
      cache.set(mat, c)
    }
    return c
  }
  root.traverse((o) => {
    const mm = o as THREE.Mesh
    if (!mm.isMesh || !mm.material) return
    mm.material = Array.isArray(mm.material) ? mm.material.map(swap) : swap(mm.material)
  })
  return [...cache.values()]
}

/** Writes a capsule patch (a white glitch) into slot i; strength 0 clears it. */
export function setPatch(u: RevealU, i: number, a: THREE.Vector3 | readonly number[], b: THREE.Vector3 | readonly number[], radius: number, strength: number) {
  const A = Array.isArray(a) ? a : [(a as THREE.Vector3).x, (a as THREE.Vector3).y, (a as THREE.Vector3).z]
  const B = Array.isArray(b) ? b : [(b as THREE.Vector3).x, (b as THREE.Vector3).y, (b as THREE.Vector3).z]
  u.uPA.value[i].set(A[0], A[1], A[2], radius)
  u.uPB.value[i].set(B[0], B[1], B[2], strength)
}

export function clearPatches(u: RevealU) {
  for (let i = 0; i < PATCHES; i++) u.uPB.value[i].w = 0
}
