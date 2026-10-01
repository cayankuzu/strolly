import * as THREE from 'three'

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent?: THREE.Object3D) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  parent?.add(m)
  return m
}

export function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent?: THREE.Object3D) {
  return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent)
}

export function cyl(rt: number, rb: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent?: THREE.Object3D, seg = 32) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, parent)
}

/** A plane whose uv attribute is in meters: u ∈ [u0, u1], v ∈ [v0, v1]. */
export function metricPlane(u0: number, u1: number, v0: number, v1: number) {
  const geo = new THREE.PlaneGeometry(u1 - u0, v1 - v0)
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0))
  }
  return geo
}

export function disposeTree(root: THREE.Object3D) {
  const seen = new Set<unknown>()
  root.traverse((o) => {
    // Shadow-casting lights own a render target of their own.
    const light = o as THREE.DirectionalLight
    if (light.isLight && light.shadow) light.shadow.dispose()
    // A skinned body's skeleton keeps its bone matrices in a texture.
    const skinned = o as THREE.SkinnedMesh
    if (skinned.isSkinnedMesh && !seen.has(skinned.skeleton)) {
      seen.add(skinned.skeleton)
      skinned.skeleton.dispose()
    }
    const m = o as THREE.Mesh
    if (m.geometry && !seen.has(m.geometry)) {
      seen.add(m.geometry)
      m.geometry.dispose()
    }
    const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : []
    for (const mat of mats) {
      if (seen.has(mat)) continue
      seen.add(mat)
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture && !seen.has(value)) {
          seen.add(value)
          value.dispose()
        }
      }
      if (mat instanceof THREE.ShaderMaterial) {
        for (const u of Object.values(mat.uniforms)) {
          if (u.value instanceof THREE.Texture && !seen.has(u.value)) {
            seen.add(u.value)
            u.value.dispose()
          }
        }
      }
      mat.dispose()
    }
  })
}

/** Disposes a palette of materials and their textures, including ones no mesh ended up using. */
export function disposeMaterials(materials: Record<string, THREE.Material>) {
  for (const mat of Object.values(materials)) {
    for (const value of Object.values(mat)) if (value instanceof THREE.Texture) value.dispose()
    mat.dispose()
  }
}

/** Yaw that turns local +Z toward a planar direction. */
export const yawTo = (dx: number, dz: number) => Math.atan2(dx, dz)
