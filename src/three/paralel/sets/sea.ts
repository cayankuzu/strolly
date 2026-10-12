/**
 * G — the storm beach and the sea under a wave (x 400): wet sand, a red
 * over yellow flag snapping on its pole, a rip-current sign, a lifebuoy on a
 * post; grey swells breaking. A twelve-year-old walks into it and dives into
 * the face of a wall of water; under it dark green, no up, no down; then two
 * boys choose two ways.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { makePath } from '../../figure/paths'
import { keyed, type Actor, type ShotKeys } from '../../kit/direct'
import { pbr } from '../../kit/surfaces'
import { box, cyl, mesh } from '../../util'
import { PI, DEG, fbm, rng, ss, win, canvasTexture, instances, type Ctx, type Dir, type PSet } from '../common'
import { gridSurface } from '../geo'
import { undersideMaterial, waterMaterial } from '../shaders'
import { carry, pivotFrame } from '../rig'
import { Burst, Motes } from '../fx'
import * as PP from '../poses'
import * as P from '../../figure/poses'
import { sunDir, type SkyPreset } from '../env'
import { H12 } from '../cast'

const X = 400
const STORM: SkyPreset = { zenith: 0x4c545e, horizon: 0x8a9298, below: 0x3a4444, haze: 0x9aa2a6, hazeAmt: 0.75, sunColor: 0xb8c0c4, disc: 0, glow: 0.15, cloud: 0.95, cloudLit: 0x9aa2a8, cloudShade: 0x4a525c, power: 1.0 }
const UNDER: SkyPreset = { zenith: 0x2e5a4c, horizon: 0x15382e, below: 0x061410, haze: 0x0b2a22, hazeAmt: 0.6, sunColor: 0x000000, disc: 0, glow: 0, cloud: 0, cloudLit: 0, cloudShade: 0, power: 1 }
const HANG = new THREE.Vector3(400, -4, -20)

/** The sand and the seabed: dry beach rising gently, the shelf under water dropping off. */
export function hSand(x: number, z: number) {
  const n = 0.06 * fbm(x * 0.3, z * 0.3, 2, 13)
  if (z >= 0) return 0.03 * z * (1 - 0.3 * ss(16, 30, z)) + n + 0.25 * ss(22, 34, z) * fbm(x * 0.1, z * 0.1, 2, 15)
  const a = -z
  return (a < 6 ? -0.12 * a : -0.72 - 0.5 * (a - 6)) + n * 2
}

const SHOTS: Record<string, ShotKeys> = {
  flag: [
    [0, [395.2, 2.6, 17.2, 405.6, 2.3, 3.4, 52]],
    [1, [396.0, 2.3, 15.6, 404.6, 1.9, -0.4, 52]],
  ],
  waves: [
    [0, [400.7, 0.55, 0.2, 400.1, 1.3, -10, 55]],
    [0.4, [400.7, 0.6, 0.5, 400.0, 1.7, -10, 55]],
    [0.62, [400.65, 0.62, 0.7, 400.0, 1.9, -10, 56]],
    [1, [400.6, 0.75, 0.9, 400.0, 1.4, -10, 58]],
  ],
  kept: [
    [0, [400.5, 0.5, -26, 402, 1.3, 6, 50]],
    [1, [400.6, 0.45, -24.5, 402, 1.2, 6, 50]],
  ],
}

export class SeaSet implements PSet {
  readonly group = new THREE.Group()
  private water!: THREE.ShaderMaterial
  private sheet!: THREE.Mesh
  private under!: THREE.ShaderMaterial
  private seabed!: THREE.Mesh
  private wave!: THREE.Mesh
  private waveGeo!: THREE.BufferGeometry
  private waveMat!: THREE.ShaderMaterial
  private flag!: THREE.Mesh
  private flagBase!: Float32Array
  private towel!: THREE.Mesh
  private sand!: Motes
  private bubbles!: Motes
  private silt!: Motes
  private breath = new Burst(40, 0xd8f0ea, 0.05, true, 21)
  private spray = new Burst(420, 0xf2f2ec, 0.09, false, 23)
  private gasp = new Burst(60, 0xe8f0f0, 0.05, false, 25)
  private frameM = new THREE.Matrix4()
  private gPos = new THREE.Vector3()
  private gRot = 0
  private walk = makePath([
    [401.1, 5.6],
    [400.9, 3.6],
    [400.7, 1.0],
    [400.6, -0.6],
  ])

  build(c: Ctx) {
    const g = this.group
    const rand = rng(4004)
    const shared = c.env.shared

    // Sand: dry, then darker and wet toward the water.
    const dry = new THREE.Color(0xb9a37c)
    const wet = new THREE.Color(0x6e604a)
    const sandGeo = gridSurface(
      160,
      110,
      (i, j, out) => {
        const x = X - 120 + (i / 160) * 240
        const z = -60 + 120 * Math.pow(j / 110, 1.15)
        out.set(x, hSand(x, z), z)
      },
      1,
      (i, j, p, out) => {
        out.copy(dry).lerp(wet, 1 - ss(0.5, 4.5, p.z))
        out.multiplyScalar(0.85 + 0.2 * fbm(p.x * 0.6, p.z * 0.6, 2, 17))
      },
    )
    this.seabed = mesh(sandGeo, pbr('sand', 0xffffff, { vertexColors: true, roughness: 0.9 }), 0, 0, 0, g)
    this.seabed.receiveShadow = true
    this.seabed.name = 'beach'

    // Dunes and scrub behind the beach; a low headland to the north.
    g.add(
      instances(
        new THREE.ConeGeometry(1, 1, 9).translate(0, 0.5, 0),
        new THREE.MeshStandardMaterial({ color: 0xa8956c, roughness: 1 }),
        60,
        () => {
          const x = X - 110 + rand() * 220
          const z = 34 + rand() * 30
          const s = 6 + rand() * 9
          return [x, hSand(x, z) - 1.2, z, rand() * PI, s, 0, 0, 1.6 + rand() * 2.2]
        },
      ),
    )
    const grass = new THREE.MeshStandardMaterial({ color: 0x7a7a4a, roughness: 1, side: THREE.DoubleSide })
    g.add(
      instances(
        new THREE.ConeGeometry(0.25, 0.6, 5).translate(0, 0.3, 0),
        grass,
        420,
        () => {
          const x = X - 60 + rand() * 120
          const z = 20 + rand() * 18
          return [x, hSand(x, z) - 0.05, z, rand() * PI, 0.6 + rand() * 0.8, (rand() - 0.5) * 0.4, 0, 1 + rand()]
        },
      ),
    )

    // The sea: grey-green, swells running in to break short of the beach.
    this.water = waterMaterial(shared, { deep: 0x22383a, shallow: 0x3e5e58, sky: 0x6e7782, skyTop: 0x8e979e, foam: 0.55, flow: [0.2, 0.7], chop: 1.25, swell: 1.1, swellDir: [0, 1], swellLen: 26, swellSpeed: 0.165, shore: -2 })
    this.sheet = mesh(new THREE.PlaneGeometry(240, 240, 300, 300).rotateX(-PI / 2), this.water, X, -0.05, -118, g)
    this.sheet.frustumCulled = false
    this.sheet.name = 'sea'
    this.under = undersideMaterial(shared)
    const under = mesh(new THREE.PlaneGeometry(240, 240, 1, 1).rotateX(-PI / 2), this.under, X, -0.08, -118, g)
    under.name = 'sea-underside'

    // The wave: a long curling wall, shaped per frame.
    this.waveGeo = new THREE.BufferGeometry()
    const NX = 80
    const NP = 48
    this.waveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NX + 1) * (NP + 1) * 3), 3))
    this.waveGeo.setAttribute('h', new THREE.BufferAttribute(new Float32Array((NX + 1) * (NP + 1)), 1))
    const idx: number[] = []
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NP; j++) {
        const a = i * (NP + 1) + j
        const b = a + NP + 1
        idx.push(a, b, a + 1, a + 1, b, b + 1)
      }
    this.waveGeo.setIndex(idx)
    this.waveMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uFoam: { value: 0 }, uSky: { value: new THREE.Color(0x7a838c) } }]),
      vertexShader: /* glsl */ `
        attribute float h;
        varying float vH;
        varying vec3 vW;
        varying vec3 vN;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vH = h;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uFoam;
        uniform vec3 uSky;
        uniform float uParalelGrade;
        varying float vH;
        varying vec3 vW;
        varying vec3 vN;
        #include <common>
        #include <fog_pars_fragment>
        float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          vec3 n = normalize(vN);
          vec3 v = normalize(cameraPosition - vW);
          float nv = abs(dot(n, v));
          // Thin water near the crest glows green with the light behind it.
          vec3 deep = vec3(0.05, 0.16, 0.14);
          vec3 lit = vec3(0.2, 0.5, 0.4);
          vec3 col = mix(deep, lit, smoothstep(0.25, 0.95, vH));
          col = mix(col, uSky * 0.8, pow(1.0 - nv, 4.0) * 0.6);
          float streak = vn(vec2(vW.x * 1.3, vW.y * 4.0 - uTime * 2.0)) * vn(vec2(vW.x * 0.4 + 3.0, vW.y * 1.5));
          float foam = smoothstep(0.82, 0.98, vH) + smoothstep(0.35, 0.8, streak) * smoothstep(0.55, 0.9, vH);
          foam = clamp(foam * (0.6 + uFoam) + uFoam * smoothstep(0.3, 0.7, streak + vH * 0.6), 0.0, 1.0);
          col = mix(col, vec3(0.92, 0.94, 0.92), foam);
          gl_FragColor = vec4(col, 1.0);
          {
            float gL = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gL) * vec3(0.84, 0.92, 1.1), uParalelGrade * 0.72);
          }
          #include <fog_fragment>
        }`,
      fog: true,
      side: THREE.DoubleSide,
    })
    this.waveMat.uniforms.uTime = shared.uTime
    this.waveMat.uniforms.uParalelGrade = shared.grade
    this.wave = mesh(this.waveGeo, this.waveMat, 0, 0, 0, g)
    this.wave.frustumCulled = false
    this.wave.name = 'wave'

    // The flagpole with its flag, the sign, the lifebuoy, the towel.
    const pole = pbr('metal', 0xb8bcbe, { roughness: 0.45 })
    cyl(0.045, 0.06, 5.2, pole, 408, 2.6, 10, g, 12).castShadow = true
    mesh(new THREE.SphereGeometry(0.07, 12, 8), pole, 408, 5.22, 10, g)
    const flagTex = canvasTexture(256, 160, (fg, W, H) => {
      fg.fillStyle = '#c8322b'
      fg.fillRect(0, 0, W, H / 2)
      fg.fillStyle = '#e8c23a'
      fg.fillRect(0, H / 2, W, H / 2)
    })
    const fgeo = new THREE.PlaneGeometry(1.5, 0.95, 24, 12)
    fgeo.translate(0.75, 0, 0)
    this.flagBase = new Float32Array((fgeo.attributes.position as THREE.BufferAttribute).array)
    this.flag = mesh(fgeo, new THREE.MeshStandardMaterial({ map: flagTex, roughness: 0.85, side: THREE.DoubleSide }), 408.05, 4.62, 10, g)
    this.flag.castShadow = true
    this.flag.name = 'flag'

    const wood = pbr('wood', 0x6a5440, { roughness: 0.9 })
    for (const dx of [-0.85, 0.85]) box(0.09, 2.6, 0.09, wood, 409.5 + dx, 1.3, 4.45, g).castShadow = true
    const signTex = canvasTexture(1024, 620, (sg, W, H) => {
      sg.fillStyle = '#f2efe6'
      sg.fillRect(0, 0, W, H)
      sg.fillStyle = '#c8322b'
      sg.fillRect(0, 0, W, 170)
      sg.fillStyle = '#ffffff'
      sg.font = '900 120px sans-serif'
      sg.textAlign = 'center'
      sg.fillText('DİKKAT', W / 2, 128)
      sg.fillStyle = '#1b1b1b'
      sg.font = '800 92px sans-serif'
      sg.fillText('RİP AKINTISI', W / 2, 290)
      sg.font = '800 74px sans-serif'
      sg.fillText('YÜZMEK YASAKTIR', W / 2, 400)
      // A pencilled note under the print.
      sg.fillStyle = 'rgba(60,60,70,0.85)'
      sg.font = 'italic 34px serif'
      sg.fillText('akıntıya kapılırsan kıyıya paralel yüz.', W / 2, 520)
      sg.strokeStyle = '#c8322b'
      sg.lineWidth = 14
      sg.strokeRect(7, 7, W - 14, H - 14)
    })
    const sign = mesh(new THREE.PlaneGeometry(1.9, 1.15), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.75 }), 409.5, 1.9, 4.52, g)
    sign.name = 'rip-sign'
    box(1.96, 1.21, 0.04, wood, 409.5, 1.9, 4.49, g).castShadow = true
    // The lifebuoy on its post.
    cyl(0.06, 0.06, 1.9, wood, 406.4, 0.95, 9.0, g, 10).castShadow = true
    box(0.5, 0.06, 0.06, wood, 406.4, 1.75, 9.03, g)
    if (c.models.lifebuoy) {
      const lb = c.models.lifebuoy.clone(true)
      lb.position.set(406.4, 0.88, 9.1)
      g.add(lb)
    } else {
      const ring = mesh(new THREE.TorusGeometry(0.32, 0.08, 12, 28), new THREE.MeshStandardMaterial({ color: 0xe8552a, roughness: 0.6 }), 406.4, 1.3, 9.12, g)
      ring.castShadow = true
    }
    // The towel he drops.
    const towelTex = canvasTexture(256, 128, (tg, W, H) => {
      for (let k = 0; k < 8; k++) {
        tg.fillStyle = k % 2 ? '#e9e2d0' : '#2e6f9a'
        tg.fillRect(0, (k * H) / 8, W, H / 8)
      }
    })
    const tgeo = new THREE.PlaneGeometry(1.5, 0.75, 12, 6).rotateX(-PI / 2)
    const tp = tgeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < tp.count; i++) tp.setY(i, 0.012 + 0.02 * Math.sin(tp.getX(i) * 7) * Math.cos(tp.getZ(i) * 9))
    tgeo.computeVertexNormals()
    this.towel = mesh(tgeo, new THREE.MeshStandardMaterial({ map: towelTex, roughness: 1 }), 401.0, hSand(401, 6), 6, g)
    this.towel.rotation.y = 0.35
    this.towel.receiveShadow = true
    this.towel.name = 'towel'

    // Blowing sand; bubbles and silt under water; spray of the break; the gasp.
    this.sand = new Motes(500, 0xcbb88e, 0.02, [24, 0.8, 18], 0.5, false, 31)
    this.bubbles = new Motes(260, 0xe0fff4, 0.035, [4, 5, 4], 0.75, true, 33)
    this.silt = new Motes(500, 0x9a8a62, 0.03, [10, 7, 10], 0.35, false, 35)
    for (const o of [this.sand.points, this.bubbles.points, this.silt.points, this.breath.points, this.spray.points, this.gasp.points]) g.add(o)
  }

  /** The wave for this frame: crest z, height, curl (0–1), foam. */
  private waveState(seg: string, u: number) {
    if (seg !== 'waves') return null
    const rise = ss(0, 0.6, u)
    const zc = lerp(-17, -6.2, rise) + lerp(0, 1.4, ss(0.6, 0.72, u))
    const h = lerp(0.8, 3.0, ss(0, 0.55, u)) * (1 - 0.75 * ss(0.7, 0.9, u))
    const curl = ss(0.45, 0.7, u) * (1 - ss(0.78, 0.95, u))
    const foam = ss(0.6, 0.8, u)
    return { zc, h, curl, foam }
  }

  private shapeWave(zc: number, h: number, curl: number) {
    const pos = this.waveGeo.attributes.position as THREE.BufferAttribute
    const hh = this.waveGeo.attributes.h as THREE.BufferAttribute
    const NX = 80
    const NP = 48
    const c = curl
    const pts = [
      new THREE.Vector2(-16, 0),
      new THREE.Vector2(-8, 0.3),
      new THREE.Vector2(-3, 0.78),
      new THREE.Vector2(-0.9, 0.97),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0.15 + 0.55 * c, 1 - 0.04 * c),
      new THREE.Vector2(0.22 + 1.0 * c, 1 - 0.28 * c),
      new THREE.Vector2(0.25 + 0.35 * c, 0.66),
      new THREE.Vector2(0.55, 0.34),
      new THREE.Vector2(1.6, 0.08),
      new THREE.Vector2(3.6, -0.02),
    ]
    const curve = new THREE.SplineCurve(pts)
    const prof = curve.getSpacedPoints(NP)
    for (let i = 0; i <= NX; i++) {
      const x = X - 30 + (i / NX) * 60
      const edge = 1 - Math.pow(clamp(Math.abs(x - X) / 30), 2.2)
      const hx = h * edge * (0.9 + 0.1 * Math.sin(x * 0.4))
      const zx = zc + 1.1 * Math.sin(x * 0.12 + 0.7) * (1 - edge * 0.5)
      for (let j = 0; j <= NP; j++) {
        const p = prof[j]
        const k = i * (NP + 1) + j
        // Lengths scale a little with height so a small swell is not a cliff.
        const sc = 0.6 + 0.4 * (hx / 3)
        pos.setXYZ(k, x, -0.05 + p.y * hx, zx + p.x * sc)
        hh.setX(k, p.y)
      }
    }
    pos.needsUpdate = true
    hh.needsUpdate = true
    this.waveGeo.computeVertexNormals()
    this.waveGeo.computeBoundingSphere()
  }

  direct(d: Dir) {
    const { seg, u, f, cast, env } = d
    const t = f.time
    const underwater = seg === 'under' || (seg === 'up' && u < 0.78)
    const grey = seg === 'waveKept'
    const sd = sunDir(-PI / 2 + 0.9, 30 * DEG)
    // Storm light above; dark green below.
    if (underwater) {
      const dark = seg === 'under' ? ss(0.4, 0.9, u) * 0.9 : 0.62 * (1 - ss(0.3, 0.72, u))
      env.sky.set(UNDER, sd)
      env.sky.material.uniforms.uZenith.value.multiplyScalar(1 - 0.75 * dark)
      env.sky.material.uniforms.uHorizon.value.multiplyScalar(1 - 0.75 * dark)
      env.setSun(HANG, new THREE.Vector3(0.2, 1, 0.1), 0x9fd8c0, 0.6 * (1 - dark), 8)
      env.setHemi(0x4f9a80, 0x0a1f18, lerp(1.4, 0.35, dark))
      env.setFill(new THREE.Vector3(401.5, 1, -19.5), HANG, 0xbfe8d8, seg === 'up' ? lerp(0.9, 1.6, ss(0.3, 0.7, u)) : 0.5 * (1 - dark))
      env.point(0, HANG.x + 1.2, HANG.y + 2.5, HANG.z + 1.5, 0x9fe0c8, seg === 'up' ? 6 : 4 * (1 - dark), 9)
      env.setFog(new THREE.Color(0x0e3329).lerp(new THREE.Color(0x020806), dark * 0.85), seg === 'up' ? lerp(0.2, 0.12, ss(0.4, 0.75, u)) : lerp(0.24, 0.3, dark))
      env.ibl('moonless_golf', 0.25 * (1 - dark) + 0.05)
      this.under.uniforms.uBright.value = 1 - 0.85 * dark
      this.under.uniforms.uPatchAmt.value = seg === 'up' ? lerp(0.3, 1.4, ss(0.2, 0.6, u)) : 0.2 * (1 - dark)
    } else {
      env.sky.set(STORM, sd)
      env.setSun(new THREE.Vector3(401, 0, 2), sd, 0xc8d0d4, grey ? 0.5 : 0.8, 16)
      env.setHemi(0xa8b0b8, 0x5a5448, grey ? 1.0 : 1.25)
      env.setFill(new THREE.Vector3(420, 6, 20), new THREE.Vector3(401, 1, 2), 0xb0b8c0, 0.35)
      env.setFog(grey ? 0x8a9096 : 0x8c949a, grey ? 0.012 : 0.0065)
      env.ibl('kloofendal_48d_partly_cloudy_puresky', 0.45)
      if (grey) env.grade.value = 1
    }
    this.water.uniforms.uFlat.value = grey ? 0.75 : 0
    this.water.uniforms.uSwell.value = grey ? 0.15 : seg === 'up' ? 0.25 : 1.1
    this.water.uniforms.uFoam.value = grey ? 0.25 : 0.55
    this.sheet.visible = !underwater
    this.seabed.visible = true

    // Flag snapping toward +x; sand blowing.
    this.flagWind(t, grey ? 0.25 : 1)
    this.sand.points.visible = !underwater
    this.sand.update(402, 0.25, 6, t, [2.4, 0.05, -0.3])
    this.bubbles.points.visible = false
    this.silt.points.visible = underwater
    this.breath.hide()
    this.spray.hide()
    this.gasp.hide()

    // The wave.
    const ws = this.waveState(seg, u)
    this.wave.visible = !!ws
    if (ws) {
      this.shapeWave(ws.zc, ws.h, ws.curl)
      this.waveMat.uniforms.uFoam.value = ws.foam
      this.spray.set(400, 0.4, -5.2, (u - 0.7) / 0.3, { r: 5, h: 3.2, drift: [0, 0.4, 2.0], fall: 1.6, opacity: 0.85 })
    }

    const boy = cast.solids.boy12swim
    boy.begin()
    this.towel.position.y = hSand(401, 6) + 0.0
    switch (seg) {
      case 'flag':
        this.flagSeg(d, boy)
        break
      case 'waves':
        this.wavesSeg(d, boy)
        break
      case 'under':
        this.underSeg(d, boy)
        break
      case 'up':
        this.upSeg(d, boy)
        break
      case 'waveKept':
        boy.visible = false
        boy.apply(t, false)
        keyed(SHOTS.kept, d.cu, d.shot)
        d.shot.handheld = 0.2
        break
    }
  }

  private flagWind(t: number, strength: number) {
    const pos = this.flag.geometry.attributes.position as THREE.BufferAttribute
    const b = this.flagBase
    for (let i = 0; i < pos.count; i++) {
      const x = b[i * 3]
      const y = b[i * 3 + 1]
      const k = x / 1.5
      const ph = t * 11 - x * 4.2
      const z = strength * k * (0.16 * Math.sin(ph) + 0.06 * Math.sin(ph * 2.3 + y * 3) + 0.03 * Math.sin(t * 23 + x * 9))
      pos.setXYZ(i, x * (1 - 0.04 * strength * k * Math.abs(Math.sin(ph))), y - 0.05 * k * strength * Math.sin(ph * 0.5), z)
    }
    pos.needsUpdate = true
    this.flag.geometry.computeVertexNormals()
  }

  private flagSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    // He drops the towel and walks into the wind to the waterline.
    const wu = ss(0.12, 1, u)
    boy.walk(this.walk, wu, P.STAND, undefined, PI, 0.95)
    boy.y = hSand(boy.x, boy.z)
    // Into the wind: head down a little, shoulders hunched.
    boy.pose[2 + 4 * 3] += 0.18
    boy.pose[2 + 2 * 3] += 0.08
    if (u < 0.12) {
      // Dropping the towel from his right hand.
      boy.place(401.1, 5.6, PI + 0.1)
      boy.hold(P.STAND)
      boy.pose[2 + 1 * 3] += 0.35 * win(0.0, 0.05, 0.08, 0.12, u)
      boy.reach('r', win(0.0, 0.03, 0.07, 0.11, u), 401.0, lerp(0.75, 0.1, ss(0.02, 0.09, u)), 5.85, 0.3)
    }
    boy.apply(f.time, true)
    d.step = boy.step
    d.walking = boy.walking
    keyed(SHOTS.flag, cu, shot)
    shot.handheld = 0.8
  }

  private wavesSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    // Waist-deep, facing the wave; at 0.6 he dives into its face.
    const dive = ss(0.54, 0.64, u)
    const z = lerp(-5, -6.0, dive)
    boy.place(400, z, PI)
    const bed = hSand(400, z)
    boy.y = bed - 0.03 - 1.3 * ss(0.58, 0.68, u)
    boy.blend(
      [
        [0, PP.TREAD],
        [0.5, P.STAND],
        [1, PP.DIVE],
      ],
      ss(0.3, 0.62, u) * 0.5 + dive * 0.5,
    )
    // Arms out on the water for balance before the dive.
    boy.pose[2 + 4 * 3] -= 0.2 * (1 - dive)
    boy.visible = u < 0.7
    boy.apply(f.time, true)
    // Lean into the dive: tip forward about the feet.
    if (dive > 0) carry(boy.figure, pivotFrame(400, bed, z, -1.1 * dive, 0, 0, 0, 0, -0.4 * dive, this.frameM))
    keyed(SHOTS.waves, cu, shot)
    shot.handheld = 0.9
  }

  /** The tumbling boy's frame under the wave (pure function of u). */
  private tumbleFrame(u: number, out: THREE.Matrix4) {
    const a = u * 1.5 * PI * 2
    return pivotFrame(HANG.x, HANG.y + 0.8, HANG.z, a * 0.8, a * 0.55, a * 0.35, 0, 0.3 * Math.sin(u * 5), 0, out)
  }

  private underSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot } = d
    const t = f.time
    boy.place(HANG.x, HANG.z, PI)
    boy.y = HANG.y
    boy.hold(PP.TUMBLE)
    // Limbs loose in the turmoil.
    boy.pose[2 + 5 * 3] += 0.3 * Math.sin(t * 1.7)
    boy.pose[2 + 8 * 3 + 2] += 0.3 * Math.sin(t * 1.3 + 1)
    boy.pose[2 + 11 * 3] += 0.2 * Math.sin(t * 1.1 + 2)
    boy.apply(t, false)
    carry(boy.figure, this.tumbleFrame(u, this.frameM))
    this.bubbles.points.visible = true
    this.bubbles.update(HANG.x, HANG.y + 0.8, HANG.z, t, [0.3 * Math.sin(t * 0.7), 0.7, 0.3 * Math.cos(t * 0.5)])
    this.silt.update(HANG.x, HANG.y, HANG.z, t, [0.4, 0.1, 0.2])
    this.breath.set(HANG.x, HANG.y + 1.2, HANG.z, (u % 0.25) / 0.25, { r: 0.3, h: 1.2, opacity: 0.8 })
    // Close, tumbling with him; at 0.5 the camera stops turning while he keeps going.
    const cam = Math.min(cu, 0.5)
    const a = cam * 2.4
    shot.pos.set(HANG.x + 0.8 * Math.cos(a) + 0.2, HANG.y + 0.9 + 0.5 * Math.sin(a * 1.3), HANG.z + 0.9 * Math.sin(a) + 0.6)
    shot.tgt.set(HANG.x, HANG.y + 0.75, HANG.z)
    shot.fov = 60
    shot.handheld = 0.6
    d.roll = 40 * DEG * Math.sin(cam * 7) * (1 - ss(0.4, 0.5, cu))
  }

  private upSeg(d: Dir, boy: Actor) {
    const { u, cu, f, shot, cast } = d
    const t = f.time
    // Hanging still, chest heaving; then up toward the paler patch, and out.
    const swim = ss(0.32, 0.78, u)
    const px = lerp(HANG.x, 401.5, swim)
    const pz = lerp(HANG.z, -19.5, swim)
    const surf = u >= 0.78
    const py = surf ? -1.3 + 0.05 * Math.sin(t * 2) : lerp(HANG.y, -1.6, Math.pow(swim, 1.3))
    boy.place(px, pz, PI + 0.4)
    boy.y = py
    boy.blend(
      [
        [0, PP.TREAD],
        [0.35, PP.TREAD],
        [0.45, PP.STROKE],
        [0.78, PP.STROKE],
        [0.85, PP.TREAD],
      ],
      u,
    )
    // Strokes: arms sweep.
    if (u > 0.35 && u < 0.78) {
      const s = Math.sin(u * 40)
      boy.pose[2 + 5 * 3] += 0.6 * s
      boy.pose[2 + 8 * 3] += 0.6 * s
      boy.pose[2 + 11 * 3] += 0.3 * Math.sin(u * 60)
      boy.pose[2 + 14 * 3] -= 0.3 * Math.sin(u * 60)
    }
    boy.pose[2 + 2 * 3] += 0.06 * Math.sin(t * 6) * (1 - ss(0.3, 0.4, u))
    boy.apply(t, true)
    // Swimming up: the body tilts toward the light.
    if (!surf) carry(boy.figure, pivotFrame(px, py + 0.9, pz, -0.7 * win(0.32, 0.45, 0.7, 0.78, u), 0, 0.3 * win(0.32, 0.45, 0.7, 0.78, u), 0, 0, 0, this.frameM))
    this.bubbles.points.visible = !surf
    this.bubbles.update(px, py + 1.2, pz, t, [0.1, 0.9, 0.1])
    this.silt.update(HANG.x, HANG.y, HANG.z, t, [0.3, 0.05, 0.2])
    this.breath.set(HANG.x, HANG.y + 1.25, HANG.z, (u - 0.04) / 0.26, { r: 0.2, h: 2.4, opacity: 0.9 })
    this.gasp.set(px, 0.15, pz, (u - 0.78) / 0.12, { r: 0.7, h: 0.6, fall: 0.6, opacity: 0.9 })

    // The split at 0.3: the other one kicks down and away into the dark and dissolves.
    if (u >= 0.3 && u < 0.6) {
      cast.ghost(
        cast.ghosts.sea,
        u,
        (a, uu) => {
          const tt = clamp((uu - 0.3) / 0.25)
          a.place(HANG.x, HANG.z, PI - 0.6)
          a.y = HANG.y
          a.blend(
            [
              [0, PP.TREAD],
              [0.3, PP.DIVE],
            ],
            tt,
          )
          this.gPos.set(lerp(HANG.x, 397.6, tt), lerp(HANG.y, -8.5, Math.pow(tt, 1.2)), lerp(HANG.z, -21.5, tt))
          this.gRot = tt
          return 0.4 * (1 - ss(0.55, 1, tt))
        },
        t,
        {
          flash: u < 0.33 ? 1 - (u - 0.3) / 0.03 : 0,
          trail: 0.02,
          after: (a) => carry(a.figure, pivotFrame(HANG.x, HANG.y + 0.9, HANG.z, 2.2 * this.gRot, 0, -0.6 * this.gRot, this.gPos.x - HANG.x, this.gPos.y - HANG.y, this.gPos.z - HANG.z, this.frameM)),
        },
      )
    }

    // Camera: wide underwater between the two; following him up; at the waterline.
    if (cu < 0.6) {
      const k = ss(0, 0.6, cu)
      shot.pos.set(lerp(402.4, 402.8, k), lerp(-5.2, -4.6, k), lerp(-16.6, -16.0, k))
      shot.tgt.set(lerp(HANG.x, 400.0, k), lerp(HANG.y + 0.7, -4.0, k), lerp(HANG.z, -20.2, k))
      shot.fov = 60
    } else if (cu < 0.78) {
      const k = ss(0.6, 0.78, cu)
      shot.pos.set(px + 1.6, py + 0.2 + 0.6 * k, pz + 2.4)
      shot.tgt.set(px, py + 1.2 + 0.8 * k, pz)
      shot.fov = 58
    } else {
      // Half in, half out: the lens at the surface, the beach far off behind him.
      shot.pos.set(px + 0.9, 0.08, pz - 2.1)
      shot.tgt.set(px - 0.2, 0.25, pz + 3)
      shot.fov = 55
    }
    shot.handheld = 0.6
    void H12
  }
}
