/**
 * Set C — the shuttle cabin (x 97.8…102.2, z +1.5…−15): eleven rows of three
 * seats, round windows on both sides, a rounded ceiling, the elevator's steel
 * leaves in the rear bulkhead and the announcement panel in the front one.
 * Set D — the launch seen from outside: the white shuttle on its column of
 * fire, bursting up through the cloud deck at dawn.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { canvasPlane, rbox, rgeo, room, tube, turned } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { drawManifest, drawPanel, keyhole, type PanelMode } from './draw'
import { NOISE_GLSL } from '../shaders/noise'

const PI = Math.PI
export const SC = {
  x: 100,
  rows: Array.from({ length: 11 }, (_, k) => -1.0 - 1.2 * k),
  cols: [98.5, 99.2, 101.5],
  /** His seat: row 6 (k 5), left window. */
  his: { x: 98.5, z: -7.0 },
  w1: { x: 99.2, z: -7.0 },
}
/** Seat index from row k and column c (0 window-left, 1 aisle-left, 2 window-right). */
export const seatIndex = (k: number, c: number) => k * 3 + c
export const seatPos = (i: number) => ({ x: SC.cols[i % 3], z: SC.rows[Math.floor(i / 3)] })

function seatGeometries() {
  const shell: THREE.BufferGeometry[] = []
  const cushion: THREE.BufferGeometry[] = []
  const strap: THREE.BufferGeometry[] = []
  const buckle: THREE.BufferGeometry[] = []
  const base: THREE.BufferGeometry[] = []
  const put = (list: THREE.BufferGeometry[], g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0) => {
    if (rx) g.rotateX(rx)
    g.translate(x, y, z)
    list.push(g.index ? g.toNonIndexed() : g)
  }
  // The seat faces −z: the back is on the +z side.
  put(shell, rgeo(0.5, 0.06, 0.5, 0.02), 0, 0.4, 0)
  put(shell, rgeo(0.52, 0.86, 0.07, 0.03), 0, 0.84, 0.27, -0.14)
  put(shell, rgeo(0.32, 0.2, 0.09, 0.04), 0, 1.33, 0.32, -0.14)
  for (const sx of [-1, 1]) {
    put(shell, rgeo(0.06, 0.05, 0.42, 0.02), sx * 0.28, 0.64, -0.02)
    put(shell, rgeo(0.05, 0.22, 0.05, 0.015), sx * 0.28, 0.52, -0.18)
    put(shell, rgeo(0.04, 0.4, 0.34, 0.015), sx * 0.255, 0.95, 0.24, -0.14)
  }
  put(cushion, rgeo(0.44, 0.08, 0.45, 0.035), 0, 0.47, -0.01)
  put(cushion, rgeo(0.42, 0.66, 0.06, 0.028), 0, 0.86, 0.215, -0.14)
  put(cushion, rgeo(0.26, 0.16, 0.06, 0.028), 0, 1.33, 0.27, -0.14)
  // Harness straps hanging down the back cushion; a buckle resting on the seat.
  for (const sx of [-1, 1]) {
    put(strap, rgeo(0.045, 0.58, 0.008, 0.002), sx * 0.11, 0.9, 0.18, -0.14)
    put(strap, rgeo(0.045, 0.006, 0.2, 0.002), sx * 0.13, 0.515, -0.04)
  }
  put(buckle, new THREE.CylinderGeometry(0.03, 0.03, 0.012, 20), 0, 0.52, -0.16)
  put(base, rgeo(0.4, 0.38, 0.32, 0.02), 0, 0.19, 0.02)
  put(base, rgeo(0.52, 0.04, 0.42, 0.01), 0, 0.02, 0.02)
  const m = (l: THREE.BufferGeometry[]) => mergeGeometries(l)
  return { shell: m(shell), cushion: m(cushion), strap: m(strap), buckle: m(buckle), base: m(base) }
}

export class ShuttleCabin {
  readonly group = new THREE.Group()
  readonly leaves: THREE.Mesh[] = []
  readonly lock: THREE.Mesh
  private panel: ReturnType<typeof canvasPlane>
  private panelKey = ''
  /** The harness fastened over him (and over her). */
  readonly harnessM: THREE.Group
  readonly harnessW: THREE.Group
  readonly elevatorPanel: THREE.MeshBasicMaterial
  readonly ceilingStrip: THREE.MeshBasicMaterial
  /** The yarn's strand from her lap to the floating ball. */
  readonly strand: THREE.Mesh

  constructor(m: Pal, scene: THREE.Scene, instrument: THREE.Group | null) {
    const g = this.group
    scene.add(g)
    const X = SC.x
    // ——— Floor, aisle lights ———
    const floor = mesh(new THREE.PlaneGeometry(4.3, 16.5), m.cabinGrey, X, 0, -6.75, g)
    floor.rotation.x = -PI / 2
    floor.receiveShadow = true
    const aisleMat = m.cabinGrey.clone()
    aisleMat.color.set(0x3b3d41)
    const aisle = mesh(new THREE.PlaneGeometry(1.25, 16.3), aisleMat, X + 0.35, 0.002, -6.75, g)
    aisle.rotation.x = -PI / 2
    for (const x of [99.72, 100.98]) {
      const strip = mesh(new THREE.PlaneGeometry(0.02, 16.0), m.aisleLight, x, 0.004, -6.75, g)
      strip.rotation.x = -PI / 2
    }
    // ——— Side walls with round windows ———
    for (const side of [-1, 1]) {
      const s = new THREE.Shape()
      const z0 = -15.0
      const z1 = 1.5
      const u = (z: number) => (side < 0 ? z : -z)
      s.moveTo(u(z0), 0)
      s.lineTo(u(z1), 0)
      s.lineTo(u(z1), 1.9)
      s.lineTo(u(z0), 1.9)
      s.lineTo(u(z0), 0)
      for (const z of SC.rows) {
        const h = new THREE.Path()
        h.absarc(u(z), 1.25, 0.225, 0, PI * 2, true)
        s.holes.push(h)
      }
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false, curveSegments: 28 })
      const wall = mesh(geo, m.shellWhiteSoft, side < 0 ? 97.85 : 102.15, 0, 0, g)
      wall.rotation.y = side < 0 ? -PI / 2 : PI / 2
      wall.receiveShadow = true
      wall.castShadow = true
    }
    // Window rims and glass (instanced), and a shade above each.
    const rimGeo = new THREE.TorusGeometry(0.235, 0.028, 10, 36)
    const glassGeo = new THREE.CircleGeometry(0.225, 32)
    const rims = new THREE.InstancedMesh(rimGeo, m.windowRim, 22)
    const panes = new THREE.InstancedMesh(glassGeo, m.windowGlass, 22)
    const d = new THREE.Object3D()
    let n = 0
    for (const z of SC.rows)
      for (const side of [-1, 1]) {
        d.position.set(side < 0 ? 97.86 : 102.14, 1.25, z)
        d.rotation.set(0, side < 0 ? PI / 2 : -PI / 2, 0)
        d.updateMatrix()
        rims.setMatrixAt(n, d.matrix)
        d.position.x += side < 0 ? -0.05 : 0.05
        d.updateMatrix()
        panes.setMatrixAt(n, d.matrix)
        n++
      }
    panes.renderOrder = 3
    g.add(rims, panes)
    // ——— The rounded ceiling ———
    const ceil = new THREE.CylinderGeometry(1, 1, 16.5, 48, 1, true, -PI / 2, PI)
    ceil.rotateX(-PI / 2)
    ceil.scale(2.15, 1.0, 1)
    const ceiling = mesh(ceil, m.shellWhite, X, 1.9, -6.75, g)
    ;(ceiling.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
    ceiling.receiveShadow = true
    this.ceilingStrip = new THREE.MeshBasicMaterial({ color: 0xe6eeff })
    const strip = mesh(new THREE.PlaneGeometry(0.16, 16.2), this.ceilingStrip, X, 2.895, -6.75, g)
    strip.rotation.x = PI / 2
    // Luggage bins along both sides, a handrail under them.
    for (const side of [-1, 1]) {
      const bx = side < 0 ? 98.2 : 101.8
      for (let z = 1.0; z > -14.6; z -= 1.55) {
        const bin = rbox(0.6, 0.34, 1.5, m.shellWhite, bx, 2.1, z - 0.75, g, 0.03)
        bin.castShadow = true
        rbox(0.02, 0.03, 1.2, m.windowRim, bx - side * 0.3, 1.95, z - 0.75, g, 0.008)
      }
    }
    // Reading lights (small discs) over each seat.
    const lightGeo = new THREE.CircleGeometry(0.025, 16)
    const lights = new THREE.InstancedMesh(lightGeo, m.aisleLight, 33)
    n = 0
    for (const z of SC.rows)
      for (const x of SC.cols) {
        d.position.set(x < 100 ? 98.2 + (x - 98.85) * 0.6 : 101.8, 1.925, z - 0.1)
        d.rotation.set(PI / 2, 0, 0)
        d.updateMatrix()
        lights.setMatrixAt(n++, d.matrix)
      }
    g.add(lights)
    // ——— Bulkheads ———
    const arch = (hole?: THREE.Path) => {
      const s = new THREE.Shape()
      s.moveTo(-2.15, 0)
      s.lineTo(2.15, 0)
      s.lineTo(2.15, 1.9)
      for (let i = 1; i <= 24; i++) {
        const a = (i / 24) * PI
        s.lineTo(Math.cos(a) * 2.15, 1.9 + Math.sin(a) * 1.0)
      }
      s.lineTo(-2.15, 0)
      if (hole) s.holes.push(hole)
      return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false })
    }
    const door = new THREE.Path()
    door.moveTo(-0.6, 0)
    door.lineTo(-0.6, 2.2)
    door.lineTo(0.6, 2.2)
    door.lineTo(0.6, 0)
    door.lineTo(-0.6, 0)
    const rear = mesh(arch(door), m.shellWhite, X, 0, 1.5, g)
    rear.receiveShadow = true
    const front = mesh(arch(), m.shellWhite, X, 0, -15.06, g)
    front.receiveShadow = true
    // The elevator's steel leaves in the rear bulkhead, a steel surround, the lock light.
    for (const sx of [-1, 1]) this.leaves.push(rbox(0.6, 2.2, 0.03, m.cabinSteel, X + sx * 0.3, 1.1, 1.53, g, 0.003))
    for (const sx of [-1, 1]) rbox(0.06, 2.26, 0.03, m.brushed, X + sx * 0.63, 1.13, 1.48, g, 0.004)
    rbox(1.32, 0.06, 0.03, m.brushed, X, 2.23, 1.48, g, 0.004)
    this.lock = mesh(new THREE.SphereGeometry(0.025, 16, 10), m.lockGreen, X, 2.36, 1.48, g)
    rbox(0.1, 0.07, 0.02, m.windowRim, X, 2.36, 1.49, g, 0.006)
    const emb = canvasPlane(0.22, 0.22, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      keyhole(ctx, w / 2, h * 0.32, w * 0.16, '#7d8187', 6)
    }, { transparent: true })
    emb.mesh.position.set(X + 1.2, 1.7, 1.495)
    emb.mesh.rotation.y = PI
    g.add(emb.mesh)
    // The elevator behind the leaves (seen only while they are open).
    const lift = room({ w: 2.2, d: 2.2, h: 2.6, x: X, z: 2.65, wall: m.cabinSteel, floor: m.cabinFloor, ceiling: m.cabinSteel, trim: null, skip: ['n'] })
    g.add(lift)
    this.elevatorPanel = new THREE.MeshBasicMaterial({ color: 0xf6f8fb })
    const lp = mesh(new THREE.PlaneGeometry(1.6, 1.6), this.elevatorPanel, X, 2.595, 2.65, g)
    lp.rotation.x = PI / 2
    // The announcement panel and the manifest in the front bulkhead.
    rbox(2.3, 0.9, 0.04, m.windowRim, X, 2.0, -14.98, g, 0.01)
    this.panel = canvasPlane(2.2, 0.8, 1024, drawPanel({ kind: 'off' }), { emissive: true })
    this.panel.mesh.position.set(X, 2.0, -14.955)
    g.add(this.panel.mesh)
    rbox(0.39, 0.54, 0.03, m.windowRim, 101.9, 1.5, -14.99, g, 0.008)
    const manifest = canvasPlane(0.35, 0.5, 512, drawManifest, { emissive: true })
    manifest.mesh.position.set(101.9, 1.5, -14.97)
    g.add(manifest.mesh)
    // A forward hatch, closed, and the old instrument on the bulkhead.
    rbox(0.8, 1.9, 0.04, m.shellWhiteSoft, 98.9, 0.95, -14.98, g, 0.02)
    rbox(0.04, 0.2, 0.05, m.brushed, 99.2, 1.0, -14.94, g, 0.01)
    if (instrument) {
      instrument.position.set(101.0, 1.12, -14.9)
      g.add(instrument)
    }

    // ——— Seats (instanced by material) ———
    const geos = seatGeometries()
    const seatMats = [m.shellWhite, m.cushion, m.strap, m.buckle, m.cabinGrey]
    const seatGeos = [geos.shell, geos.cushion, geos.strap, geos.buckle, geos.base]
    seatGeos.forEach((geo, k) => {
      const im = new THREE.InstancedMesh(geo, seatMats[k], 33)
      for (let i = 0; i < 33; i++) {
        const p = seatPos(i)
        d.position.set(p.x, 0, p.z)
        d.rotation.set(0, 0, 0)
        d.updateMatrix()
        im.setMatrixAt(i, d.matrix)
      }
      im.castShadow = k < 2
      im.receiveShadow = true
      g.add(im)
    })
    // ——— Harnesses, fastened ———
    this.harnessM = harness(m)
    this.harnessM.position.set(SC.his.x, 0, SC.his.z)
    this.harnessW = harness(m)
    this.harnessW.position.set(SC.w1.x, 0, SC.w1.z)
    g.add(this.harnessM, this.harnessW)
    this.strand = mesh(new THREE.BufferGeometry(), m.yarn, 0, 0, 0, g)
    this.strand.visible = false
  }

  setStrand(a: THREE.Vector3, b: THREE.Vector3) {
    const mid = a.clone().lerp(b, 0.5)
    mid.y -= 0.06
    mid.x += 0.03
    this.strand.geometry.dispose()
    this.strand.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]), 20, 0.0022, 5)
  }

  setPanel(mode: PanelMode) {
    const key = JSON.stringify(mode)
    if (key === this.panelKey) return
    this.panelKey = key
    this.panel.redraw(drawPanel(mode), key)
  }

  /** Rear leaves: 0 closed … 1 open. */
  setLeaves(open: number) {
    this.leaves.forEach((l, i) => (l.position.x = SC.x + (i ? 1 : -1) * (0.3 + open * 0.58)))
  }
}

/** A five-point harness fastened over a seated person (seat origin, facing −z). */
function harness(m: Pal) {
  const g = new THREE.Group()
  for (const sx of [-1, 1]) {
    tube(
      [
        [sx * 0.11, 1.22, 0.16],
        [sx * 0.12, 1.25, 0.04],
        [sx * 0.1, 1.12, -0.1],
        [sx * 0.06, 0.88, -0.15],
        [sx * 0.015, 0.7, -0.16],
      ],
      0.011,
      m.strap,
      g,
      20,
    ).scale.set(1, 1, 1)
    tube(
      [
        [sx * 0.21, 0.56, 0.02],
        [sx * 0.17, 0.62, -0.12],
        [sx * 0.03, 0.67, -0.17],
      ],
      0.011,
      m.strap,
      g,
      12,
    )
  }
  const b = cyl(0.032, 0.032, 0.014, m.buckle, 0, 0.68, -0.175, g, 20)
  b.rotation.x = PI / 2
  g.traverse((o) => (o.castShadow = true))
  return g
}

/** Set D: the launch, from outside. */
export class LaunchExterior {
  readonly group = new THREE.Group()
  readonly ship = new THREE.Group()
  readonly flame: THREE.Mesh
  readonly plume: THREE.Mesh
  private flameMat: THREE.ShaderMaterial
  private plumeMat: THREE.ShaderMaterial

  constructor(m: Pal, scene: THREE.Scene) {
    const g = this.group
    g.position.set(200, 0, 0)
    scene.add(g)
    const s = this.ship
    g.add(s)
    // The body: a white cylinder, an ogive nose, a black belly, fins, engine bells, two boosters.
    cyl(2.0, 2.0, 18, m.hull, 0, 9, 0, s, 40).castShadow = true
    const nose = turned(
      [
        [2.0, 0],
        [1.95, 1.6],
        [1.75, 3.4],
        [1.35, 5.2],
        [0.8, 6.8],
        [0.25, 7.8],
        [0, 8.0],
      ],
      m.hull,
      40,
      s,
    )
    nose.position.y = 18
    const belly = new THREE.CylinderGeometry(2.03, 2.03, 17.6, 40, 1, true, PI * 0.75, PI * 0.5)
    mesh(belly, m.hullBlack, 0, 9, 0, s)
    for (let i = 0; i < 4; i++) {
      const fin = rbox(0.18, 3.2, 2.2, m.hullBlack, 0, 1.6, 0, undefined, 0.04)
      const holder = new THREE.Group()
      holder.rotation.y = (i / 4) * PI * 2 + PI / 4
      fin.position.set(0, 1.4, 2.6)
      fin.rotation.x = -0.2
      holder.add(fin)
      s.add(holder)
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * PI * 2
      const bell = turned(
        [
          [0.35, 0],
          [0.5, -0.4],
          [0.85, -1.4],
          [0.83, -1.42],
          [0.47, -0.4],
          [0.33, 0],
        ],
        m.hullGrey,
        24,
        s,
      )
      bell.position.set(Math.cos(a) * 0.95, 0.05, Math.sin(a) * 0.95)
    }
    for (const sx of [-1, 1]) {
      cyl(0.85, 0.85, 13, m.hull, sx * 2.9, 6.5, 0, s, 28)
      const bn = turned(
        [
          [0.85, 0],
          [0.7, 1.2],
          [0.35, 2.2],
          [0, 2.6],
        ],
        m.hull,
        28,
        s,
      )
      bn.position.set(sx * 2.9, 13, 0)
      rbox(0.5, 0.4, 0.4, m.hullGrey, sx * 2.45, 11, 0, s, 0.05)
      rbox(0.5, 0.4, 0.4, m.hullGrey, sx * 2.45, 2.5, 0, s, 0.05)
    }
    // A row of small windows and the emblem on the flank (facing +z, toward the camera).
    for (let k = 0; k < 9; k++) {
      const w = mesh(new THREE.CircleGeometry(0.14, 16), m.windowRim, 0, 12.5 - k * 0.8, 2.01, s)
      void w
    }
    const emblem = canvasPlane(1.4, 1.4, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      keyhole(ctx, w / 2, h * 0.32, w * 0.16, '#1a1c20', 8)
    }, { transparent: true })
    emblem.mesh.position.set(0.0, 15.6, 2.02)
    s.add(emblem.mesh)
    s.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh) {
        mm.castShadow = true
        mm.receiveShadow = true
      }
    })
    // The flame and the plume of exhaust beneath it.
    this.flameMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; varying vec2 vUv;
        ${NOISE_GLSL}
        void main(){
          float y = vUv.y;
          float n = fbm(vec2(vUv.x * 8.0, y * 6.0 + uTime * 9.0));
          float core = smoothstep(0.0, 0.9, y) * (0.6 + 0.6 * n);
          vec3 c = mix(vec3(1.0, 0.45, 0.12), vec3(1.0, 0.93, 0.75), smoothstep(0.55, 1.0, y));
          gl_FragColor = vec4(c * core * 3.2, 1.0);
        }`,
      side: THREE.DoubleSide,
    })
    this.flame = mesh(new THREE.CylinderGeometry(1.7, 0.6, 26, 32, 1, true), this.flameMat, 0, -13, 0, s)
    this.flame.renderOrder = 4
    this.plumeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; varying vec2 vUv; varying vec3 vN;
        ${NOISE_GLSL}
        void main(){
          float y = vUv.y;
          float n = fbm(vec2(vUv.x * 10.0, y * 5.0 + uTime * 0.6));
          float a = smoothstep(0.0, 0.5, y) * (0.45 + 0.55 * n) * smoothstep(1.0, 0.7, y);
          float lit = 0.55 + 0.45 * max(0.0, dot(vN, normalize(vec3(1.0, 0.2, 0.3))));
          vec3 c = mix(vec3(0.85, 0.8, 0.78), vec3(1.0, 0.75, 0.5), 0.4) * lit;
          c = mix(c, vec3(1.0, 0.6, 0.3) * 1.6, smoothstep(0.85, 1.0, y));
          gl_FragColor = vec4(c, a * 0.85);
        }`,
    })
    this.plume = mesh(new THREE.CylinderGeometry(3.5, 14, 90, 40, 1, true), this.plumeMat, 0, -71, 0, s)
  }

  update(time: number) {
    this.flameMat.uniforms.uTime.value = time
    this.plumeMat.uniforms.uTime.value = time
  }
}
