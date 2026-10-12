/**
 * ÖTE — what is outside: the dawn sky over the launch pad that thins to black,
 * the stars, the Earth (procedural oceans, continents, clouds, an atmosphere
 * at the rim) and the black hole (shadow, photon ring, the tilted disc and
 * its lensed far side). Everything here is "at infinity": the group follows
 * the camera, so apparent sizes are set as angles, the story's clock.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { NOISE_GLSL } from '../shaders/noise'

const D_EARTH = 300
const D_HOLE = 330
const R_STARS = 420

// ——— A small 3D value noise for the Earth's maps (seamless on the sphere) ———
function noise3(seed: number) {
  const rand = mulberry32(seed)
  const N = 256
  const perm = new Uint8Array(N * 2)
  const p = Array.from({ length: N }, (_, i) => i)
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < N * 2; i++) perm[i] = p[i & 255]
  const val = new Float32Array(N).map(() => rand())
  const h = (x: number, y: number, z: number) => val[perm[perm[perm[x & 255] + (y & 255)] + (z & 255)]]
  const s = (t: number) => t * t * (3 - 2 * t)
  return (x: number, y: number, z: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const u = s(x - xi)
    const v = s(y - yi)
    const w = s(z - zi)
    const l = (a: number, b: number, t: number) => a + (b - a) * t
    return l(
      l(l(h(xi, yi, zi), h(xi + 1, yi, zi), u), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
      l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v),
      w,
    )
  }
}

/** Equirectangular day map (oceans, land, ice) and cloud map, drawn once. */
function earthMaps() {
  const W = 1024
  const H = 512
  const land = noise3(11)
  const cloud = noise3(29)
  const day = document.createElement('canvas')
  day.width = W
  day.height = H
  const clouds = document.createElement('canvas')
  clouds.width = W
  clouds.height = H
  const dctx = day.getContext('2d')!
  const cctx = clouds.getContext('2d')!
  const dimg = dctx.createImageData(W, H)
  const cimg = cctx.createImageData(W, H)
  const fbm = (n: (x: number, y: number, z: number) => number, x: number, y: number, z: number, oct: number, f0: number) => {
    let s = 0
    let a = 0.5
    let f = f0
    for (let o = 0; o < oct; o++) {
      s += a * n(x * f + o * 7.1, y * f + o * 3.3, z * f + o * 5.7)
      a *= 0.5
      f *= 2.03
    }
    return s
  }
  for (let j = 0; j < H; j++) {
    const lat = (0.5 - (j + 0.5) / H) * Math.PI
    const cl = Math.cos(lat)
    const y = Math.sin(lat)
    for (let i = 0; i < W; i++) {
      const lon = ((i + 0.5) / W) * Math.PI * 2
      const x = cl * Math.cos(lon)
      const z = cl * Math.sin(lon)
      const n = fbm(land, x, y, z, 6, 1.6)
      const k = (j * W + i) * 4
      const ice = Math.abs(lat) > 1.2 + (n - 0.5) * 0.3
      let r: number
      let g: number
      let b: number
      if (ice) {
        r = 232
        g = 238
        b = 242
      } else if (n > 0.535) {
        // Land: green in the wet bands, ochre in the dry belts, darker in the high ground.
        const dry = Math.max(0, 1 - Math.abs(Math.abs(lat) - 0.42) * 4.5) * (0.6 + fbm(cloud, x * 2, y * 2, z * 2, 2, 2) * 0.6)
        const high = Math.min(1, (n - 0.535) * 6)
        r = 70 + dry * 120 - high * 20
        g = 92 + dry * 70 - high * 30
        b = 52 + dry * 30 - high * 15
      } else {
        // Ocean: shallow shelves lighter near the coasts.
        const shelf = Math.max(0, (n - 0.47) / 0.065)
        r = 14 + shelf * 30
        g = 48 + shelf * 55
        b = 104 + shelf * 60
      }
      dimg.data[k] = r
      dimg.data[k + 1] = g
      dimg.data[k + 2] = b
      dimg.data[k + 3] = 255
      // Clouds: streaky bands, thicker over the tropics' edges and the storm belts.
      const band = 0.55 + 0.45 * Math.sin(lat * 6.2 + fbm(cloud, x, y, z, 2, 1.2) * 4)
      const c = fbm(cloud, x * 1.2, y * 2.6, z * 1.2, 5, 2.2) * band
      const a = Math.max(0, Math.min(1, (c - 0.3) * 3.2))
      cimg.data[k] = 255
      cimg.data[k + 1] = 255
      cimg.data[k + 2] = 255
      cimg.data[k + 3] = a * 255
    }
  }
  dctx.putImageData(dimg, 0, 0)
  cctx.putImageData(cimg, 0, 0)
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.wrapS = THREE.RepeatWrapping
    t.anisotropy = 8
    return t
  }
  return { day: tex(day, true), clouds: tex(clouds, false) }
}

export type SkyState = {
  /** Camera position: the sky's centre. */
  cam: THREE.Vector3
  stars: number
  /** 0 … 1: stars pushed toward +z, bluer, the universe closing into a ring. */
  shift: number
  ring: number
  /** Earth: angular diameter in degrees (0 hides it), its direction, and the dot's size in pixels when it is smaller than that. */
  earth: number
  earthDir: THREE.Vector3
  /** A point the Earth is seen toward (far behind a window): when set, the scene aims `earthDir` from the camera at it. */
  earthAt: THREE.Vector3 | null
  dotPx: number
  dotAlpha: number
  /** Black hole: angular radius of the shadow (degrees, 0 hides it), its direction. */
  hole: number
  holeDir: THREE.Vector3
  holeGlow: number
  sun: number
  time: number
  /** The remembered Earth (look:closed): 0 off … its opacity, seen large in the direction `memoryDir`. */
  memory: number
  memoryDir: THREE.Vector3
}

export const makeSkyState = (): SkyState => ({
  cam: new THREE.Vector3(),
  stars: 0,
  shift: 0,
  ring: 0,
  earth: 0,
  earthDir: new THREE.Vector3(0, 0, 1),
  earthAt: null,
  dotPx: 3,
  dotAlpha: 0,
  hole: 0,
  holeDir: new THREE.Vector3(0, 0, -1),
  holeGlow: 1,
  sun: 0,
  time: 0,
  memory: 0,
  memoryDir: new THREE.Vector3(1, 0, 0),
})

export class Sky {
  readonly group = new THREE.Group()
  private stars: THREE.Points
  private starMat: THREE.ShaderMaterial
  private earth = new THREE.Group()
  private earthMat: THREE.ShaderMaterial
  private atmo: THREE.Mesh
  private dot: THREE.Points
  private dotMat: THREE.ShaderMaterial
  private hole: THREE.Mesh
  private holeMat: THREE.ShaderMaterial
  private ringMesh: THREE.Mesh
  private ringMat: THREE.ShaderMaterial
  private sunSprite: THREE.Mesh
  readonly sunDir = new THREE.Vector3(1, 0.35, -0.6).normalize()
  private memSun = new THREE.Vector3()
  private lift = new THREE.Vector3(0.35, 0.45, 0)

  constructor(pixelRatio = 1) {
    this.group.name = 'sky'
    // ——— Stars ———
    const n = 3400
    const rand = mulberry32(71)
    const pos = new Float32Array(n * 3)
    const mag = new Float32Array(n)
    const tint = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1
      const a = rand() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      // A faint band (the galaxy's plane) gets more stars.
      let y = u
      if (i < n * 0.35) y *= 0.18
      const l = Math.hypot(Math.cos(a) * s, y, Math.sin(a) * s)
      pos.set([(Math.cos(a) * s) / l, y / l, (Math.sin(a) * s) / l], i * 3)
      mag[i] = Math.pow(rand(), 3.2)
      tint[i] = rand()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aMag', new THREE.BufferAttribute(mag, 1))
    geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), R_STARS * 2)
    this.starMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uShift: { value: 0 }, uAlpha: { value: 1 }, uPx: { value: pixelRatio }, uR: { value: R_STARS } },
      vertexShader: /* glsl */ `
        attribute float aMag; attribute float aTint;
        uniform float uShift; uniform float uPx; uniform float uR;
        varying vec3 vCol; varying float vB;
        void main(){
          vec3 d = normalize(position);
          // Aberration toward +z (behind the ship): the universe crowds into a shrinking circle.
          float b = uShift;
          float c = d.z;
          float c2 = (c + b) / (1.0 + b * c);
          float s2 = sqrt(max(0.0, 1.0 - c2 * c2));
          vec2 xy = d.xy / max(1e-5, length(d.xy));
          vec3 d2 = vec3(xy * s2, c2);
          // Doppler: brighter and bluer toward the rear, dimmer and redder elsewhere.
          float D = sqrt(1.0 - b * b) / max(0.02, 1.0 - b * c2);
          vec3 base = mix(vec3(1.0, 0.86, 0.72), vec3(0.78, 0.86, 1.0), aTint);
          vec3 blue = vec3(0.55, 0.65, 1.0);
          vCol = mix(base, blue, clamp((D - 1.0) * 0.35 * b * 2.0, 0.0, 1.0));
          vCol = mix(vCol, vec3(1.0, 0.45, 0.3), clamp((1.0 - D) * b * 1.5, 0.0, 1.0));
          vB = (0.25 + aMag * 1.3) * clamp(pow(D, 1.5), 0.0, 3.0);
          vec4 mv = modelViewMatrix * vec4(d2 * uR, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.2 + aMag * 2.4) * uPx * clamp(0.8 + 0.25 * D, 0.6, 1.6);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;
        varying vec3 vCol; varying float vB;
        void main(){
          vec2 q = gl_PointCoord - 0.5;
          float r = length(q);
          float a = smoothstep(0.5, 0.0, r);
          gl_FragColor = vec4(vCol * vB * a * uAlpha, 1.0);
        }`,
    })
    this.stars = new THREE.Points(geo, this.starMat)
    this.stars.frustumCulled = false
    this.stars.renderOrder = -10
    this.group.add(this.stars)

    // ——— The universe as a ring, at the end ———
    this.ringMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uA: { value: 0 }, uTime: { value: 0 } },
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uA; uniform float uTime; varying vec2 vP;
        ${NOISE_GLSL}
        void main(){
          float r = length(vP);
          float a = atan(vP.y, vP.x);
          float ring = exp(-pow((r - 0.62) / 0.05, 2.0));
          float grain = 0.75 + 0.5 * vnoise(vec2(a * 40.0, 3.0));
          float inner = smoothstep(0.62, 0.0, r) * 0.18;
          vec3 c = vec3(0.78, 0.86, 1.0) * ring * grain * 2.2 + vec3(0.55, 0.62, 1.0) * inner;
          gl_FragColor = vec4(c * uA, 1.0);
        }`,
    })
    this.ringMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.ringMat)
    this.ringMesh.renderOrder = -9
    this.ringMesh.rotation.y = Math.PI
    this.ringMesh.frustumCulled = false
    this.group.add(this.ringMesh)

    // ——— The Earth ———
    const maps = earthMaps()
    this.earthMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uDay: { value: maps.day }, uClouds: { value: maps.clouds }, uSun: { value: this.sunDir }, uTime: { value: 0 }, uAlpha: { value: 1 } },
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec2 vUv; varying vec3 vW;
        void main(){
          vUv = uv;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uDay; uniform sampler2D uClouds; uniform vec3 uSun; uniform float uTime; uniform float uAlpha;
        varying vec3 vN; varying vec2 vUv; varying vec3 vW;
        void main(){
          vec3 n = normalize(vN);
          vec3 v = normalize(cameraPosition - vW);
          float d = dot(n, uSun);
          vec3 day = texture2D(uDay, vUv).rgb;
          float cl = texture2D(uClouds, vUv + vec2(uTime * 0.0015, 0.0)).a;
          float ocean = step(day.r + day.g * 0.3, 0.3);
          float light = smoothstep(-0.12, 0.35, d);
          vec3 col = mix(day, vec3(0.95), cl * 0.9) * light * 1.35;
          // Sun glint on the oceans.
          vec3 h = normalize(uSun + v);
          col += vec3(1.0, 0.95, 0.85) * pow(max(dot(n, h), 0.0), 60.0) * ocean * (1.0 - cl) * 0.8 * light;
          // The atmosphere: a blue haze thickening toward the rim, on the lit side.
          float rim = pow(1.0 - max(dot(n, v), 0.0), 2.4);
          col = mix(col, vec3(0.35, 0.6, 1.0) * (0.25 + light), rim * 0.75 * smoothstep(-0.35, 0.3, d));
          // The terminator glows a little warm.
          col += vec3(1.0, 0.5, 0.25) * exp(-pow(d / 0.06, 2.0)) * 0.08;
          gl_FragColor = vec4(col, uAlpha);
        }`,
    })
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), this.earthMat)
    ball.rotation.set(0.35, 2.4, 0.2)
    this.earth.add(ball)
    this.atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 96, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uSun: { value: this.sunDir }, uAlpha: { value: 1 } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vW;
          void main(){
            vN = normalize(mat3(modelMatrix) * normal);
            vec4 w = modelMatrix * vec4(position, 1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun; uniform float uAlpha; varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 n = normalize(vN);
            vec3 v = normalize(cameraPosition - vW);
            float f = pow(max(0.0, -dot(n, v) * 1.0 + 0.28), 2.0) * 6.0;
            float lit = smoothstep(-0.4, 0.4, dot(-n, -uSun) * -1.0);
            gl_FragColor = vec4(vec3(0.3, 0.55, 1.0) * f * (0.25 + 0.75 * lit) * uAlpha, 1.0);
          }`,
      }),
    )
    this.earth.add(this.atmo)
    this.earth.renderOrder = -8
    this.group.add(this.earth)
    // The Earth as a dot, when it is smaller than a pixel or two.
    this.dotMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uSize: { value: 3 }, uA: { value: 1 } },
      vertexShader: `uniform float uSize; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = uSize; }`,
      // A pale blue point with a soft halo while it is still "the dot"; a bare pixel once it is one star among the others.
      fragmentShader: `uniform float uA; uniform float uSize;
        void main(){
          float r = length(gl_PointCoord - 0.5) * 2.0;
          float core = smoothstep(0.55, 0.16, r);
          float halo = smoothstep(1.0, 0.2, r) * 0.6 * step(3.5, uSize);
          vec3 col = vec3(0.6, 0.78, 1.0) * (core * 1.7 + halo);
          gl_FragColor = vec4(col * uA, 1.0);
        }`,
    })
    const dg = new THREE.BufferGeometry()
    dg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3))
    this.dot = new THREE.Points(dg, this.dotMat)
    this.dot.frustumCulled = false
    this.dot.renderOrder = -7
    this.group.add(this.dot)

    // ——— The black hole: a camera-facing card shaded as a lensed hole ———
    this.holeMat = new THREE.ShaderMaterial({
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uSize: { value: 10 }, uGlow: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uSize; varying vec2 vP;
        void main(){
          vP = position.xy * 6.0;
          vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          c.xy += position.xy * uSize;
          gl_Position = projectionMatrix * c;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uGlow; varying vec2 vP;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        // Disc light at radius R (shadow radii) and azimuth phi; side > 0 is coming toward us (the left).
        vec3 disk(float R, float phi, float side){
          float edge = smoothstep(1.35, 1.6, R) * smoothstep(6.6, 3.6, R);
          if (edge <= 0.0) return vec3(0.0);
          float t = pow(1.5 / R, 1.25);
          float omega = 0.35 / pow(R, 1.5);
          float a = phi - uTime * omega;
          float lanes = 0.55 + 0.45 * noise(vec2(a * 6.0, R * 6.0));
          float fine = 0.78 + 0.22 * noise(vec2(a * 23.0, R * 21.0));
          float beam = 1.0 + 0.75 * side;
          vec3 col = mix(vec3(1.0, 0.61, 0.29), vec3(1.0, 0.89, 0.66), t);
          col = mix(col, col * vec3(0.86, 0.95, 1.15), clamp(side, 0.0, 1.0) * 0.6);
          return col * edge * t * lanes * fine * beam * 2.4;
        }
        void main(){
          vec2 p = vP;
          float r = length(p);
          float shadow = 1.0 - smoothstep(0.985, 1.0, r);
          // Primary image: the disc plane, tilted 14 degrees off edge-on.
          float ci = 0.24;
          vec2 q = vec2(p.x, (p.y - 0.06) / ci);
          float Rp = length(q);
          bool near = p.y < 0.06;
          vec3 prim = disk(Rp, atan(q.y, q.x), -q.x / max(Rp, 1e-3));
          // The far half: its inner part is bent up over the shadow (below), only its outer edge stays flat.
          if (!near) prim *= smoothstep(1.0, 1.03, r) * (0.25 + 0.75 * smoothstep(1.7, 2.6, r));
          // Secondary image: the far side of the disc lensed over and under the shadow, a thick
          // band hugging the top, a thinner one underneath.
          float phiS = atan(p.y, p.x);
          float Rs = 1.42 + max(r - 1.03, 0.0) * 4.2;
          float band = p.y > 0.0 ? 1.0 : 0.5;
          float arc = smoothstep(1.02, 1.06, r) * smoothstep(1.85, 1.35, r) * (0.3 + 0.7 * pow(abs(sin(phiS)), 1.2)) * band;
          vec3 sec = disk(Rs, phiS * 1.6 + 1.3, -cos(phiS)) * arc * 1.5;
          // The photon ring: thin and bright.
          float ring = exp(-pow((r - 1.025) / 0.012, 2.0)) * 1.6 * (0.75 + 0.5 * (0.5 - 0.5 * cos(phiS)));
          vec3 col = sec + vec3(1.0, 0.9, 0.76) * ring;
          col *= 1.0 - shadow;
          col += prim * (near ? 1.0 : 1.0 - shadow);
          // A faint glow around it all.
          col += vec3(1.0, 0.75, 0.45) * exp(-max(r - 1.0, 0.0) * 0.9) * 0.06 * (1.0 - shadow) * uGlow;
          col *= uGlow;
          float lum = max(max(col.r, col.g), col.b);
          gl_FragColor = vec4(col, clamp(max(shadow, lum), 0.0, 1.0));
        }`,
    })
    this.hole = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.holeMat)
    this.hole.frustumCulled = false
    this.hole.renderOrder = -6
    this.group.add(this.hole)

    // ——— The sun: a small white-hot disc with a soft halo ———
    this.sunSprite = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uA: { value: 1 } },
        vertexShader: `varying vec2 vP; void main(){ vP = position.xy * 2.0; vec4 c = modelViewMatrix * vec4(0.0,0.0,0.0,1.0); c.xy += position.xy * 40.0; gl_Position = projectionMatrix * c; }`,
        fragmentShader: `uniform float uA; varying vec2 vP; void main(){ float r = length(vP); float core = smoothstep(0.09, 0.07, r); float halo = exp(-r * 7.0) * 0.6; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * (core * 6.0 + halo) * uA, 1.0); }`,
      }),
    )
    this.sunSprite.frustumCulled = false
    this.sunSprite.renderOrder = -9
    this.group.add(this.sunSprite)
  }

  update(s: SkyState) {
    this.group.position.copy(s.cam)
    this.starMat.uniforms.uShift.value = s.shift
    this.starMat.uniforms.uAlpha.value = s.stars
    this.stars.visible = s.stars > 0.001
    // The ring of the whole universe, behind the ship.
    this.ringMat.uniforms.uA.value = s.ring
    this.ringMesh.visible = s.ring > 0.001
    this.ringMesh.position.set(0, 0, R_STARS * 0.9)
    const ringScale = R_STARS * 0.9 * Math.tan((5.5 * Math.PI) / 180) / 0.62
    this.ringMesh.scale.setScalar(ringScale)
    // Earth (or, with eyes closed, the memory of it: large, near, lit, over everything)
    const mem = s.memory > 0.001
    const deg = mem ? 26 : s.earth
    const rad = (deg * Math.PI) / 360
    this.earth.visible = mem || s.earth > 0.25
    if (this.earth.visible) {
      this.earth.position.copy(mem ? s.memoryDir : s.earthDir).normalize().multiplyScalar(D_EARTH)
      this.earth.scale.setScalar(D_EARTH * Math.tan(rad))
    }
    const a = mem ? s.memory : 1
    this.earthMat.uniforms.uAlpha.value = a
    ;(this.atmo.material as THREE.ShaderMaterial).uniforms.uAlpha.value = a
    this.earthMat.depthTest = !mem
    ;(this.atmo.material as THREE.Material).depthTest = !mem
    this.earth.traverse((o) => (o.renderOrder = mem ? 60 : -8))
    if (mem) this.memSun.copy(s.memoryDir).negate().add(this.lift).normalize()
    this.earthMat.uniforms.uSun.value = mem ? this.memSun : this.sunDir
    this.earthMat.uniforms.uTime.value = s.time
    this.dot.visible = s.dotAlpha > 0.001
    this.dot.position.copy(s.earthDir).normalize().multiplyScalar(D_EARTH)
    this.dotMat.uniforms.uSize.value = s.dotPx
    this.dotMat.uniforms.uA.value = s.dotAlpha
    // Black hole
    this.hole.visible = s.hole > 0.01
    if (this.hole.visible) {
      this.hole.position.copy(s.holeDir).normalize().multiplyScalar(D_HOLE)
      this.holeMat.uniforms.uSize.value = 6 * D_HOLE * Math.tan((s.hole * Math.PI) / 180)
      this.holeMat.uniforms.uTime.value = s.time
      this.holeMat.uniforms.uGlow.value = s.holeGlow
    }
    this.sunSprite.visible = s.sun > 0.001
    this.sunSprite.position.copy(this.sunDir).multiplyScalar(R_STARS * 0.95)
    ;(this.sunSprite.material as THREE.ShaderMaterial).uniforms.uA.value = s.sun
  }
}

/**
 * The sky over the launch pad, as seen through the shuttle's windows (and
 * above the launch): dawn gold on the horizon → bright blue → indigo →
 * black, with racing cloud streaks during the climb and, at the end, the
 * curve of the cloud deck far below.
 */
export class LaunchSky {
  readonly mesh: THREE.Mesh
  readonly mat: THREE.ShaderMaterial
  constructor() {
    this.mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uAlt: { value: 0 }, uTime: { value: 0 }, uRace: { value: 0 }, uSun: { value: new THREE.Vector3(1, 0.06, -0.25).normalize() }, uShake: { value: 0 } },
      vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uAlt; uniform float uTime; uniform float uRace; uniform vec3 uSun;
        varying vec3 vD;
        ${NOISE_GLSL}
        void main(){
          vec3 d = normalize(vD);
          float alt = uAlt;
          // The horizon drops as the ship climbs; at altitude the Earth is a curve below.
          float hor = -0.02 - alt * 0.32;
          float y = d.y - hor;
          vec3 zenDawn = vec3(0.10, 0.2, 0.42);
          vec3 zenBlue = vec3(0.12, 0.38, 0.9);
          vec3 zenIndigo = vec3(0.04, 0.05, 0.22);
          vec3 zenBlack = vec3(0.004, 0.005, 0.012);
          vec3 zen = mix(zenDawn, zenBlue, smoothstep(0.0, 0.3, alt));
          zen = mix(zen, zenIndigo, smoothstep(0.35, 0.65, alt));
          zen = mix(zen, zenBlack, smoothstep(0.6, 0.95, alt));
          vec3 horCol = mix(vec3(1.0, 0.62, 0.3), vec3(0.7, 0.85, 1.0), smoothstep(0.05, 0.35, alt));
          horCol = mix(horCol, vec3(0.3, 0.55, 1.0), smoothstep(0.5, 0.9, alt));
          float t = pow(clamp(y, 0.0, 1.0), 0.45 + alt * 0.3);
          vec3 col = mix(horCol, zen, t);
          // The sun's side glows.
          float sd = max(dot(d, uSun), 0.0);
          col += vec3(1.0, 0.7, 0.4) * pow(sd, 6.0) * 0.8 * (1.0 - smoothstep(0.4, 0.9, alt));
          col += vec3(1.0, 0.95, 0.85) * pow(sd, 600.0) * 12.0;
          // Below the horizon: the ground at dawn, then the cloud deck, then the planet's blue edge.
          if (y < 0.0) {
            float far = clamp(-y * 4.0, 0.0, 1.0);
            vec3 ground = mix(vec3(0.25, 0.18, 0.14), vec3(0.06, 0.06, 0.07), far);
            vec2 cp = d.xz / max(0.05, -y) * 0.8;
            float cl = fbm(cp * 1.5 + 3.0);
            vec3 deck = mix(vec3(0.75, 0.8, 0.88), vec3(1.0, 0.98, 0.95), cl) * (0.55 + 0.45 * smoothstep(0.0, 0.3, alt));
            deck = mix(deck, vec3(1.0, 0.75, 0.5), (1.0 - smoothstep(0.1, 0.4, alt)) * 0.4);
            vec3 below = mix(ground, deck, smoothstep(0.08, 0.3, alt));
            col = mix(horCol * 0.9, below, smoothstep(0.0, 0.04 + alt * 0.1, -y));
          }
          // Racing cloud streaks through the climb.
          if (uRace > 0.0) {
            vec2 sp = vec2(atan(d.x, d.z) * 3.0, d.y * 6.0 + uTime * 9.0);
            float s = fbm(vec2(sp.x * 2.0, sp.y * 0.35));
            float streak = smoothstep(0.55, 0.8, s) * uRace;
            col = mix(col, vec3(0.95, 0.97, 1.0), streak * 0.85);
          }
          // Stars as the blue goes.
          float st = smoothstep(0.75, 1.0, alt) * step(0.0, y);
          vec2 sp2 = vec2(atan(d.x, d.z), asin(clamp(d.y, -1.0, 1.0))) * 160.0;
          float star = step(0.9965, h21(floor(sp2)));
          col += vec3(0.9, 0.93, 1.0) * star * st * 1.5;
          gl_FragColor = vec4(col, 1.0);
        }`,
    })
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 32), this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -10
  }
}

/** The cloud deck the shuttle bursts through (set D), lit gold from the low sun and orange from below by the fire. */
export function cloudDeck() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uHole: { value: new THREE.Vector2(0, 0) }, uFire: { value: 0 } },
    vertexShader: `varying vec2 vP; varying vec3 vW; void main(){ vP = position.xy; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec2 uHole; uniform float uFire;
      varying vec2 vP; varying vec3 vW;
      ${NOISE_GLSL}
      void main(){
        vec2 p = vP * 0.012;
        float n = fbm(p + vec2(uTime * 0.01, 0.0));
        float n2 = fbm(p * 3.1 + 7.0);
        float dens = smoothstep(0.32, 0.7, n * 0.75 + n2 * 0.35);
        float dist = length(vW.xz - uHole);
        float hole = smoothstep(7.0, 16.0, dist);
        float rim = exp(-pow((dist - 12.0) / 6.0, 2.0));
        float fade = 1.0 - smoothstep(500.0, 1400.0, length(vP));
        vec3 lit = mix(vec3(0.72, 0.74, 0.82), vec3(1.0, 0.86, 0.66), smoothstep(0.3, 0.9, n2));
        vec3 col = lit * (0.75 + 0.35 * n) + vec3(1.0, 0.55, 0.25) * rim * uFire * 1.5;
        gl_FragColor = vec4(col, (dens * 0.9 + rim * 0.5 * uFire) * hole * fade);
      }`,
  })
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 1, 1), mat)
  m.rotation.x = -Math.PI / 2
  m.frustumCulled = false
  return { mesh: m, mat }
}
