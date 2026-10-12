/**
 * The sky over the street: a large dome with a vertical gradient (horizon →
 * zenith), its colours set per frame so night, dawn and morning share it.
 * A faint glow band near the horizon stands for the city's light.
 */
import * as THREE from 'three'

export type Sky = {
  mesh: THREE.Mesh
  set(zenith: THREE.ColorRepresentation, horizon: THREE.ColorRepresentation, ground: THREE.ColorRepresentation): void
  dispose(): void
}

export function sky(radius = 320): Sky {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uZenith: { value: new THREE.Color(0x03050b) },
      uHorizon: { value: new THREE.Color(0x1a2438) },
      uGround: { value: new THREE.Color(0x05070a) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * p;
        gl_Position.z = gl_Position.w; // always at the far plane
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uGround;
      varying vec3 vDir;
      void main() {
        float h = vDir.y;
        vec3 c = h > 0.0 ? mix(uHorizon, uZenith, pow(clamp(h * 1.6, 0.0, 1.0), 0.55)) : mix(uHorizon, uGround, clamp(-h * 6.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), mat)
  mesh.frustumCulled = false
  mesh.renderOrder = -10
  mesh.name = 'sky'
  const u = mat.uniforms
  return {
    mesh,
    set(zenith, horizon, ground) {
      ;(u.uZenith.value as THREE.Color).set(zenith)
      ;(u.uHorizon.value as THREE.Color).set(horizon)
      ;(u.uGround.value as THREE.Color).set(ground)
    },
    dispose() {
      mesh.geometry.dispose()
      mat.dispose()
    },
  }
}
