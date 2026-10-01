/**
 * Memory resolution. Every object in EMANET belongs to a memory group with
 * two values driven by the story:
 *
 *   dissolve — the object comes apart in an organic, noise-shaped way (0 whole, 1 gone)
 *   blur     — how well it is remembered (0 sharp, 1 lost); drawn into a mask
 *              that the memory pass uses to blur the image selectively
 *
 * No RGB split, no glitch: forgetting here is quiet and physical.
 */
import * as THREE from 'three'

const NOISE3 = /* glsl */ `
float memHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float memVnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = memHash(i), n100 = memHash(i + vec3(1, 0, 0)), n010 = memHash(i + vec3(0, 1, 0)), n110 = memHash(i + vec3(1, 1, 0));
  float n001 = memHash(i + vec3(0, 0, 1)), n101 = memHash(i + vec3(1, 0, 1)), n011 = memHash(i + vec3(0, 1, 1)), n111 = memHash(i + vec3(1, 1, 1));
  return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}
float memNoise(vec3 p) { return memVnoise(p * 5.0) * 0.6 + memVnoise(p * 19.0) * 0.4; }
`

export type MemoryUniforms = { uDissolve: { value: number } }

/** Patches a built-in material to dissolve along a 3D noise field. */
export function patchMemory(material: THREE.Material, uniforms: MemoryUniforms, edge = true) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDissolve = uniforms.uDissolve
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMemPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvMemPos = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uDissolve;\nvarying vec3 vMemPos;\n${NOISE3}`)
      .replace('void main() {', 'void main() {\n  float memN = memNoise(vMemPos);\n  if (uDissolve > 0.0 && memN < uDissolve * 1.04 - 0.02) discard;')
    if (edge)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\n  float memEdge = (1.0 - smoothstep(uDissolve * 1.04 - 0.02, uDissolve * 1.04 + 0.03, memN)) * step(0.001, uDissolve);\n  gl_FragColor.rgb += vec3(1.0, 0.82, 0.6) * memEdge * 0.6;',
      )
  }
  material.customProgramCacheKey = () => `memory-${edge ? 'edge' : 'plain'}`
  material.needsUpdate = true
}

export class MemoryGroup {
  readonly uniforms: MemoryUniforms = { uDissolve: { value: 0 } }
  blur = 0
  readonly maskMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
  readonly meshes: THREE.Mesh[] = []
  private clones = new Map<THREE.Material, THREE.Material>()

  constructor(readonly name: string) {
    patchMemory(this.maskMaterial, this.uniforms, false)
  }

  /** Takes over every mesh under `root` (or in the list), giving it this group's own dissolving copy of its material. */
  adopt(root: THREE.Object3D | THREE.Mesh[]) {
    const visit = (o: THREE.Object3D) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || m.userData.memory) return
      const base = m.material as THREE.Material
      let clone = this.clones.get(base)
      if (!clone) {
        // A material that belongs to this group alone (a screen, a photo) is patched in place, so
        // whoever drives it keeps its handle; shared ones get this group's own copy.
        clone = base.userData.own ? base : base.clone()
        patchMemory(clone, this.uniforms)
        this.clones.set(base, clone)
      }
      m.material = clone
      m.userData.memory = this
      m.userData.surface = clone
      this.meshes.push(m)
    }
    if (Array.isArray(root)) root.forEach(visit)
    else root.traverse(visit)
    return root
  }

  /** This group's copy of `base`, if any of its meshes use it. */
  surfaceOf(base: THREE.Material) {
    return this.clones.get(base)
  }

  set(dissolve: number, blur: number) {
    this.uniforms.uDissolve.value = dissolve
    this.blur = blur
    this.maskMaterial.color.setRGB(blur, 0, 0)
    const gone = dissolve >= 0.999
    // Depth for shadows ignores the dissolve, so a coming-apart object stops casting early.
    const casts = dissolve < 0.3
    for (const m of this.meshes) {
      m.visible = !gone
      if (m.userData.cast === undefined) m.userData.cast = m.castShadow
      m.castShadow = casts && (m.userData.cast as boolean)
    }
  }

  dispose() {
    this.clones.forEach((c) => c.dispose())
    this.maskMaterial.dispose()
  }
}

export class Memory {
  readonly groups = new Map<string, MemoryGroup>()

  group(name: string) {
    let g = this.groups.get(name)
    if (!g) {
      g = new MemoryGroup(name)
      this.groups.set(name, g)
    }
    return g
  }

  adopt(name: string, root: THREE.Object3D | THREE.Mesh[]) {
    return this.group(name).adopt(root)
  }

  /** Every group's copy of `base` — for driving a shared material (a lamp, the capsule's glow). */
  surfaces<M extends THREE.Material>(base: M): M[] {
    const out: M[] = []
    this.groups.forEach((g) => {
      const s = g.surfaceOf(base)
      if (s) out.push(s as M)
    })
    return out
  }

  /**
   * Swaps every adopted mesh to its mask material (for the blur mask pass) or
   * back. Glass and haze (`userData.noMask`) step out of the mask entirely.
   */
  useMask(on: boolean) {
    this.groups.forEach((g) => {
      for (const m of g.meshes) {
        m.material = on ? g.maskMaterial : (m.userData.surface as THREE.Material)
        if (m.userData.noMask) {
          if (on) {
            m.userData.shown = m.visible
            m.visible = false
          } else m.visible = m.userData.shown as boolean
        }
      }
    })
  }

  dispose() {
    this.groups.forEach((g) => g.dispose())
  }
}
