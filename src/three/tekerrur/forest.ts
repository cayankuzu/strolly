/**
 * The room's screens: one shader for the four walls, the ceiling, the door
 * leaves and the walkway beyond the right door. Each screen samples the
 * xanderklinge photograph (an equirectangular forest by a stream) by the
 * direction from the room's centre, so the twenty wall panels and the
 * ceiling read as one continuous 360° view from the desk. The overcast sky of
 * the photograph is keyed out and replaced by a sky that keeps the room's
 * clock: a sun, drifting clouds with one hooked cloud, dusk, stars, a moon,
 * a dawn line.
 *
 * Every fragment knows which panel it belongs to (from its rest position), so
 * the panels can switch on one by one, go black one by one, show their 1 cm
 * seams and LED pitch up close, slip one pixel at a seam, take a drizzle and
 * a scan line that redraws the forest slightly differently. In the dark
 * chapters the same panels show a faint grid, then the circle.
 *
 * Geometry carries a `rest` attribute (world position when the screen is in
 * its place — a door leaf keeps its picture while it swings) and a `face`
 * attribute (0 front z−5, 1 right x+5, 2 back z+5, 3 left x−5, 4 ceiling,
 * 5 walkway).
 */
import * as THREE from 'three'

export const ROOM = { half: 5, height: 4.6 }

/** The yaw offset that puts the photograph's waterfall a little right of centre on the front wall. */
const PANO_YAW = 0.241

const vertex = /* glsl */ `
attribute vec3 rest;
attribute float face;
varying vec3 vRest;
varying float vFace;
void main() {
  vRest = rest;
  vFace = face;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragment = /* glsl */ `
uniform sampler2D tPano;
uniform float uHasPano;
uniform vec3 uCenter;
uniform float uYaw;
uniform float uTime;
uniform vec3 uGrade;
uniform float uBright;
uniform float uSat;
uniform vec3 uSkyTop;
uniform vec3 uSkyHor;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform float uSunSize;
uniform float uCloud;
uniform vec3 uCloudCol;
uniform vec3 uCloudShade;
uniform vec2 uDrift;
uniform vec3 uHook;
uniform float uStars;
uniform vec3 uMoonDir;
uniform float uMoon;
uniform float uDawn;
uniform float uRain;
uniform float uScan;
uniform float uRedraw;
uniform float uOnT;
uniform float uPaint;
uniform float uOffT;
uniform float uWallDim;
uniform float uCeilDim;
uniform float uGrid;
uniform float uCircle;
uniform vec3 uFlat;
uniform float uHair;
uniform float uFlow;
uniform float uShaft;
uniform float uCut;
varying vec3 vRest;
varying float vFace;

#define PI 3.14159265

float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i), b = hash2(i + vec2(1.0, 0.0)), c = hash2(i + vec2(0.0, 1.0)), d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}

// Equirect uv of a direction, with a seam-safe gradient.
vec2 dirUv(vec3 d) {
  float phi = atan(d.x, -d.z);
  float u = 0.5 + phi / (2.0 * PI) + uYaw;
  float v = 0.5 + asin(clamp(d.y, -1.0, 1.0)) / PI;
  return vec2(u, v);
}

vec3 pano(vec2 uv) {
  vec2 a = vec2(fract(uv.x), uv.y);
  vec2 b = vec2(fract(uv.x + 0.5) - 0.5, uv.y);
  vec2 dxa = dFdx(a), dya = dFdy(a), dxb = dFdx(b), dyb = dFdy(b);
  bool useB = dot(dxb, dxb) + dot(dyb, dyb) < dot(dxa, dxa) + dot(dya, dya) - 1e-9;
  vec2 dx = useB ? dxb : dxa;
  vec2 dy = useB ? dyb : dya;
  if (uHasPano > 0.5) return textureGrad(tPano, a, dx, dy).rgb;
  // Procedural stand-in: trunks, canopy, a stream bed.
  float y = uv.y;
  float trunk = smoothstep(0.55, 0.62, noise(vec2(a.x * 90.0, 0.0))) * smoothstep(0.85, 0.5, y) * step(0.45, y);
  vec3 c = mix(vec3(0.22, 0.17, 0.12), vec3(0.18, 0.24, 0.12), smoothstep(0.35, 0.55, y));
  c = mix(c, vec3(0.9), smoothstep(0.62, 0.8, y) * (1.0 - smoothstep(0.4, 0.7, fbm(a * vec2(40.0, 12.0)))));
  return mix(c, vec3(0.08, 0.06, 0.05), trunk);
}

vec3 sky(vec3 d) {
  float e = max(d.y, 0.0);
  vec3 c = mix(uSkyHor, uSkyTop, smoothstep(0.0, 0.75, e));
  // Clouds on a flat layer above.
  vec2 p = d.xz / max(d.y, 0.08) * 0.55 + uDrift;
  float n = fbm(p * 1.3);
  float cloud = smoothstep(0.52, 0.78, n) * uCloud * smoothstep(0.05, 0.3, e);
  // The hooked cloud: a long body with a curl at its −x end.
  vec2 hp = uHook.xz / max(uHook.y, 0.08) * 0.55;
  vec2 q = (d.xz / max(d.y, 0.08) * 0.55 - hp) * vec2(1.0, 1.0);
  float body = 1.0 - smoothstep(0.0, 0.1, length(q / vec2(0.62, 0.11)) - 1.0);
  vec2 cq = q - vec2(-0.6, 0.13);
  float ring = abs(length(cq) - 0.13);
  float curl = (1.0 - smoothstep(0.03, 0.065, ring)) * step(cq.x, 0.04) * step(-0.2, cq.y + 0.1);
  float hook = max(body, curl) * smoothstep(0.3, 0.62, fbm(q * 9.0 + 3.0) + 0.25) * uCloud;
  cloud = max(cloud, hook * 0.95);
  float lit = clamp(dot(normalize(vec3(d.x, 0.0, d.z) + 1e-4), normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + 1e-4)) * 0.5 + 0.5, 0.0, 1.0);
  vec3 cc = mix(uCloudShade, uCloudCol, lit * 0.8 + 0.2 * n);
  // Sun disc and glow.
  float cs = dot(d, normalize(uSunDir));
  float disc = smoothstep(cos(uSunSize), cos(uSunSize * 0.7), cs);
  float glow = pow(max(cs, 0.0), 40.0) * 0.6 + pow(max(cs, 0.0), 6.0) * 0.18;
  c += uSunCol * glow;
  c = mix(c, cc, cloud);
  c += uSunCol * disc * 3.0 * (1.0 - cloud * 0.85);
  // Night: stars and a moon.
  if (uStars > 0.001) {
    vec2 sp = vec2(atan(d.x, -d.z) * 120.0, asin(d.y) * 120.0);
    vec2 cell = floor(sp);
    float h = hash2(cell);
    float star = step(0.985, h) * smoothstep(0.5, 0.0, length(fract(sp) - 0.5)) * (0.6 + 0.4 * sin(uTime * (1.0 + h * 3.0) + h * 30.0));
    c += vec3(0.8, 0.85, 1.0) * star * uStars * (1.0 - cloud) * 1.4;
  }
  if (uMoon > 0.001) {
    float cm = dot(d, normalize(uMoonDir));
    c += vec3(0.75, 0.8, 0.9) * (smoothstep(cos(0.03), cos(0.024), cm) * 2.0 + pow(max(cm, 0.0), 80.0) * 0.25) * uMoon;
  }
  // A thin dawn line low in the east.
  float az = atan(d.x, -d.z);
  c += vec3(0.55, 0.5, 0.62) * uDawn * exp(-abs(e - 0.42) * 30.0) * smoothstep(1.2, 0.0, abs(az - 1.57));
  return c;
}

void main() {
  float face = floor(vFace + 0.5);
  vec3 dir = normalize(vRest - uCenter);
  // Panel coordinates in meters along the screen (s) and up it (t).
  float s, t;
  if (face < 0.5) { s = vRest.x + 5.0; t = vRest.y; }
  else if (face < 1.5) { s = vRest.z + 5.0; t = vRest.y; }
  else if (face < 2.5) { s = 5.0 - vRest.x; t = vRest.y; }
  else if (face < 3.5) { s = 5.0 - vRest.z; t = vRest.y; }
  else if (face < 4.5) { s = vRest.x + 5.0; t = vRest.z + 5.0; }
  else { s = vRest.x; t = vRest.y + vRest.z * 3.0; }
  bool isCeil = face > 3.5 && face < 4.5;
  float col = floor(s / 2.0);
  float row = isCeil ? floor(t / 2.0) : 0.0;
  float panel = face * 37.0 + col * 5.0 + row;
  float order = isCeil ? 0.8 + 0.2 * hash1(panel + 3.0) : 0.8 * hash1(panel + 11.0);

  // Each panel is calibrated a pixel apart from its neighbour.
  vec2 uv = dirUv(dir);
  uv.x += mod(col + row, 2.0) * (1.6 / 4096.0);
  // The forest's small life: leaves sway in the canopy, the waterfall falls.
  float canopy = smoothstep(0.62, 0.8, uv.y);
  uv.x += sin(uTime * 0.7 + uv.y * 60.0 + uv.x * 40.0) * 0.00035 * canopy;
  float fall = smoothstep(0.752, 0.765, fract(uv.x)) * (1.0 - smoothstep(0.80, 0.812, fract(uv.x))) * smoothstep(0.42, 0.47, uv.y) * (1.0 - smoothstep(0.66, 0.7, uv.y));
  uv.y += (noise(vec2(fract(uv.x) * 900.0, uv.y * 140.0 + uTime * 3.2 * uFlow)) - 0.5) * 0.0022 * fall;
  // The redrawn forest: the same photograph, nudged locally (a branch, a rock, the ferns).
  float redraw = uRedraw;
  if (uScan > -0.5 && !isCeil) redraw = max(redraw, step(t, uScan));
  if (redraw > 0.001) {
    vec2 w = vec2(fbm(uv * vec2(18.0, 9.0)) - 0.5, fbm(uv * vec2(11.0, 14.0) + 7.0) - 0.5);
    uv += w * vec2(0.012, 0.008) * redraw;
  }
  // Rain on the glass bends the picture a little.
  float rainCol = floor(s * 70.0);
  float drop = fract(t * 0.6 + uTime * (0.9 + hash1(rainCol) * 0.8) + hash1(rainCol * 1.7) * 8.0);
  float streak = step(0.82, hash1(rainCol * 3.1)) * smoothstep(0.88, 1.0, drop) * uRain;
  uv.y += streak * 0.002;

  vec3 photo = pano(uv);
  float lum = dot(photo, vec3(0.299, 0.587, 0.114));
  float sat = max(photo.r, max(photo.g, photo.b)) - min(photo.r, min(photo.g, photo.b));
  float above = smoothstep(0.47, 0.6, uv.y);
  float notFall = 1.0 - fall;
  float skyKey = smoothstep(0.66, 0.86, lum) * (1.0 - smoothstep(0.06, 0.16, sat)) * above * notFall;
  // High overhead the photograph is all sky: let the made sky take over.
  skyKey = max(skyKey, smoothstep(0.82, 0.92, uv.y));
  vec3 forest = mix(vec3(lum), photo, uSat) * uGrade;
  if (redraw > 0.001) forest *= mix(vec3(1.0), vec3(0.92, 1.06, 0.9), redraw * smoothstep(0.5, 0.4, uv.y));
  // Wet stones catch the sky.
  float wet = smoothstep(0.55, 0.75, lum) * (1.0 - above) * smoothstep(0.16, 0.06, sat);
  forest += wet * uSkyTop * 0.25 * (0.6 + 0.4 * sin(uTime * 2.0 + uv.x * 400.0 + uv.y * 300.0));
  // Sun shafts through the canopy (late afternoon).
  float shaft = uShaft * smoothstep(0.3, 0.9, noise(vec2((uv.x + uv.y * 0.35) * 70.0 + uTime * 0.05, 0.5))) * smoothstep(0.3, 0.55, uv.y) * (1.0 - above * 0.5);
  forest += uSunCol * shaft * 0.12;
  vec3 c = mix(forest, sky(dir), skyKey) * uBright;
  c += vec3(0.7, 0.75, 0.8) * streak * 0.08 * uBright;
  c *= 1.0 - uRain * 0.12;

  // Switching on: flat warm grey, then the picture paints in from the floor up (the stream first).
  float on = step(order, uOnT);
  float paint = isCeil ? smoothstep(0.75, 1.0, uPaint) : smoothstep(t / 4.6 - 0.08, t / 4.6, uPaint * 1.15 - 0.05);
  c = mix(uFlat, c, paint);
  c *= on;
  // The hairline along the floor edge.
  if (!isCeil && face < 4.5) {
    float run = (face * 10.0 + s) / 40.0;
    c += vec3(1.0, 0.9, 0.75) * uHair * (1.0 - smoothstep(0.004, 0.02, t)) * step(run, uHair * 1.2);
  }
  // The scan line.
  if (uScan > -0.5 && !isCeil) c += vec3(0.85, 0.9, 1.0) * exp(-abs(t - uScan) * 60.0) * 1.6;
  // Dark chapters: a faint grid, then the circle.
  if (uGrid > 0.001 || uCircle > 0.001) {
    vec2 g = vec2(s, t) / 0.5;
    vec2 gf = abs(fract(g) - 0.5);
    vec2 gw = fwidth(g);
    float grid = max(1.0 - smoothstep(0.0, gw.x * 1.2, 0.5 - gf.x), 1.0 - smoothstep(0.0, gw.y * 1.2, 0.5 - gf.y));
    vec3 dark = vec3(0.012) + vec3(0.11, 0.115, 0.12) * grid * uGrid;
    vec2 cq = isCeil ? vec2(s - 5.0, t - 5.0) : vec2(s - 5.0, t - 2.35);
    float r = length(cq);
    float rw = fwidth(r);
    float ring = 1.0 - smoothstep(0.006, 0.006 + rw * 1.5, abs(r - 1.55));
    float ang = atan(cq.y, cq.x);
    float nodes = 1.0 - smoothstep(0.02, 0.03 + rw, length(cq - 1.55 * vec2(cos(floor(ang / (PI / 6.0) + 0.5) * PI / 6.0), sin(floor(ang / (PI / 6.0) + 0.5) * PI / 6.0))));
    float faint = 1.0 - smoothstep(0.0, 0.012 + rw, abs(r - 1.55 - 0.05 * sin(ang * 3.0 + 1.0)));
    dark += vec3(0.85, 0.86, 0.88) * (ring * 0.9 + nodes * 0.8 + faint * 0.15) * uCircle;
    c = mix(c, dark, max(uGrid, uCircle));
  }
  // Going dark: panel by panel; the ceiling last.
  c *= 1.0 - step(order, uOffT);
  c *= isCeil ? 1.0 - uCeilDim : 1.0 - uWallDim;

  // The LED pitch and the 1 cm seams, visible only up close.
  vec2 led = vec2(s, t) / 0.008;
  vec2 lf = abs(fract(led) - 0.5);
  vec2 lw = fwidth(led);
  float near = 1.0 - smoothstep(0.25, 0.6, max(lw.x, lw.y));
  c *= mix(1.0, 0.78 + 0.22 * smoothstep(0.5, 0.3, max(lf.x, lf.y)), near * 0.8);
  float ds = abs(s - floor(s / 2.0 + 0.5) * 2.0);
  float dt = isCeil ? abs(t - floor(t / 2.0 + 0.5) * 2.0) : 10.0;
  float d = min(ds, dt);
  float fw = fwidth(s) + 1e-5;
  float seam = 1.0 - smoothstep(0.005 - fw, 0.005 + fw, d);
  seam *= mix(0.35, 1.0, 1.0 - smoothstep(0.004, 0.03, fw));
  if (face > 4.5) seam = 0.0;
  c *= 1.0 - seam * 0.92;
  c *= uCut;
  gl_FragColor = vec4(c, 1.0);
}
`

export type ForestUniforms = {
  tPano: { value: THREE.Texture | null }
  uHasPano: { value: number }
  uCenter: { value: THREE.Vector3 }
  uYaw: { value: number }
  uTime: { value: number }
  uGrade: { value: THREE.Color }
  uBright: { value: number }
  uSat: { value: number }
  uSkyTop: { value: THREE.Color }
  uSkyHor: { value: THREE.Color }
  uSunDir: { value: THREE.Vector3 }
  uSunCol: { value: THREE.Color }
  uSunSize: { value: number }
  uCloud: { value: number }
  uCloudCol: { value: THREE.Color }
  uCloudShade: { value: THREE.Color }
  uDrift: { value: THREE.Vector2 }
  uHook: { value: THREE.Vector3 }
  uStars: { value: number }
  uMoonDir: { value: THREE.Vector3 }
  uMoon: { value: number }
  uDawn: { value: number }
  uRain: { value: number }
  uScan: { value: number }
  uRedraw: { value: number }
  uOnT: { value: number }
  uPaint: { value: number }
  uOffT: { value: number }
  uWallDim: { value: number }
  uCeilDim: { value: number }
  uGrid: { value: number }
  uCircle: { value: number }
  uFlat: { value: THREE.Color }
  uHair: { value: number }
  uFlow: { value: number }
  uShaft: { value: number }
  uCut: { value: number }
}

export function forestMaterial(pano: THREE.Texture | null): THREE.ShaderMaterial & { uniforms: ForestUniforms } {
  if (pano) {
    pano.wrapS = THREE.RepeatWrapping
    pano.wrapT = THREE.ClampToEdgeWrapping
    pano.minFilter = THREE.LinearMipmapLinearFilter
    pano.generateMipmaps = true
    pano.needsUpdate = true
  }
  const uniforms: ForestUniforms = {
    tPano: { value: pano },
    uHasPano: { value: pano ? 1 : 0 },
    uCenter: { value: new THREE.Vector3(0, 2.0, 0) },
    uYaw: { value: PANO_YAW },
    uTime: { value: 0 },
    uGrade: { value: new THREE.Color(1, 1, 1) },
    uBright: { value: 1 },
    uSat: { value: 1 },
    uSkyTop: { value: new THREE.Color(0.35, 0.5, 0.8) },
    uSkyHor: { value: new THREE.Color(0.9, 0.75, 0.6) },
    uSunDir: { value: new THREE.Vector3(-0.4, 0.6, -0.6).normalize() },
    uSunCol: { value: new THREE.Color(1, 0.8, 0.5) },
    uSunSize: { value: 0.035 },
    uCloud: { value: 0.6 },
    uCloudCol: { value: new THREE.Color(1, 0.9, 0.8) },
    uCloudShade: { value: new THREE.Color(0.5, 0.45, 0.5) },
    uDrift: { value: new THREE.Vector2() },
    uHook: { value: new THREE.Vector3(0.5, 2.55, -1.5).normalize() },
    uStars: { value: 0 },
    uMoonDir: { value: new THREE.Vector3(0.5, 0.75, 0.4).normalize() },
    uMoon: { value: 0 },
    uDawn: { value: 0 },
    uRain: { value: 0 },
    uScan: { value: -1 },
    uRedraw: { value: 0 },
    uOnT: { value: 1 },
    uPaint: { value: 1 },
    uOffT: { value: -1 },
    uWallDim: { value: 0 },
    uCeilDim: { value: 0 },
    uGrid: { value: 0 },
    uCircle: { value: 0 },
    uFlat: { value: new THREE.Color(0.32, 0.29, 0.25) },
    uHair: { value: 0 },
    uFlow: { value: 1 },
    uShaft: { value: 0 },
    uCut: { value: 1 },
  }
  const m = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms })
  return m as THREE.ShaderMaterial & { uniforms: ForestUniforms }
}

/** A rectangle of screen with rest positions = its own world positions (walls, ceiling, walkway). */
export function screenQuad(corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3], face: number, segsU = 8, segsV = 4) {
  // corners: bottom-left, bottom-right, top-right, top-left (as seen from the room).
  const [a, b, c, d] = corners
  const pos: number[] = []
  const rest: number[] = []
  const faces: number[] = []
  const idx: number[] = []
  const p = new THREE.Vector3()
  for (let j = 0; j <= segsV; j++) {
    for (let i = 0; i <= segsU; i++) {
      const u = i / segsU
      const v = j / segsV
      const bottom = new THREE.Vector3().lerpVectors(a, b, u)
      const top = new THREE.Vector3().lerpVectors(d, c, u)
      p.lerpVectors(bottom, top, v)
      pos.push(p.x, p.y, p.z)
      rest.push(p.x, p.y, p.z)
      faces.push(face)
    }
  }
  for (let j = 0; j < segsV; j++)
    for (let i = 0; i < segsU; i++) {
      const k = j * (segsU + 1) + i
      idx.push(k, k + 1, k + segsU + 2, k, k + segsU + 2, k + segsU + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('rest', new THREE.Float32BufferAttribute(rest, 3))
  g.setAttribute('face', new THREE.Float32BufferAttribute(faces, 1))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Gives a box (a door leaf) the screen attributes: rest = world position at its closed place. */
export function screenAttributes(geo: THREE.BufferGeometry, closed: THREE.Matrix4, face: number) {
  const p = geo.attributes.position as THREE.BufferAttribute
  const rest = new Float32Array(p.count * 3)
  const faces = new Float32Array(p.count)
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(closed)
    rest.set([v.x, v.y, v.z], i * 3)
    faces[i] = face
  }
  geo.setAttribute('rest', new THREE.BufferAttribute(rest, 3))
  geo.setAttribute('face', new THREE.BufferAttribute(faces, 1))
  return geo
}

/**
 * The average colour each wall throws into the room (front, right, back,
 * left, ceiling), measured once from the photograph so the room's light
 * matches its screens.
 */
export function wallTones(pano: THREE.Texture | null): THREE.Color[] {
  const fallback = [0x6b6650, 0x5e6048, 0x6a6a58, 0x6d5a4c, 0xb8bcc0].map((c) => new THREE.Color(c))
  const img = pano?.image as (CanvasImageSource & { width: number; height: number }) | undefined
  if (!img || !img.width) return fallback
  try {
    const W = 256
    const H = 128
    const cv = document.createElement('canvas')
    cv.width = W
    cv.height = H
    const g = cv.getContext('2d', { willReadFrequently: true })!
    g.drawImage(img, 0, 0, W, H)
    const data = g.getImageData(0, 0, W, H).data
    const out: THREE.Color[] = []
    // Each wall is a quarter of the azimuth; walls span elevation −25°…+25°, the ceiling above that.
    for (let wall = 0; wall < 5; wall++) {
      let r = 0
      let gr = 0
      let b = 0
      let n = 0
      for (let y = 0; y < H; y++) {
        const elev = 90 - (y / H) * 180
        if (wall < 4 ? Math.abs(elev) > 25 : elev < 30) continue
        for (let x = 0; x < W; x++) {
          const u = x / W
          const phi = ((u - 0.5 - PANO_YAW) * 360 + 720) % 360
          const az = phi > 180 ? phi - 360 : phi
          const target = [0, 90, 180, -90][wall]
          let dAz = Math.abs(az - (target ?? 0))
          if (dAz > 180) dAz = 360 - dAz
          if (wall < 4 && dAz > 45) continue
          const i = (y * W + x) * 4
          r += data[i]
          gr += data[i + 1]
          b += data[i + 2]
          n++
        }
      }
      out.push(new THREE.Color().setRGB(r / n / 255, gr / n / 255, b / n / 255, THREE.SRGBColorSpace))
    }
    return out
  } catch {
    return fallback
  }
}
