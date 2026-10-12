/**
 * Set E — the ship's habitat in spin gravity: the beach module (x 292…300),
 * whose walls and ceiling are one screen of sea and morning sun with a seam
 * where the wave hitches; and the lounge (x 302…312, z −6…4) with its two
 * round windows — forward onto what is ahead, aft onto what is left behind —
 * the comms booth, the pantry, the sofas, the chess table, W1's armchair and
 * the corridor the scarf will reach.
 */
import * as THREE from 'three'
import { canvasPlane, chair, door, rbox, room, sofa, stool, table, tube, turned } from '../kit/props'
import { cyl, mesh } from '../util'
import type { Pal } from './materials'
import { drawBooth, drawDayCounter, drawLog, drawPantryLabel, drawSign, type BoothMode } from './draw'
import { NOISE_GLSL } from '../shaders/noise'
import { T } from './lang'

const PI = Math.PI
export const E = {
  beachEye: new THREE.Vector3(296, 1.6, 0.5),
  deckA: { x: 295.5, z: -1.0 },
  deckB: { x: 296.6, z: -1.0 },
  sofaA: { x: 305, z: 0.8 },
  sofaB: { x: 309, z: 0.8 },
  chess: { x: 309.5, z: -1.5 },
  stool: { x: 303.8, z: -1.2 },
  armchair: { x: 306.6, z: -2.6, yaw: 0.45 },
  fwd: new THREE.Vector3(307, 1.55, -6.0),
  aft: new THREE.Vector3(307, 1.55, 4.0),
  booth: { x: 303, z: -5.0 },
  boothScreen: new THREE.Vector3(303, 1.45, -5.448),
  boothCam: new THREE.Vector3(303, 1.75, -5.36),
  side: new THREE.Vector3(302.54, 1.5, -4.75),
  doorway: { x: 311.5, z: 4.0 },
  pantry: { x: 302.0, z: 2.0 },
  /** The three floor lamps (out of the cameras' ways). */
  lamps: [
    [302.6, 3.45],
    [311.25, 1.3],
    [304.15, -5.7],
  ] as ReadonlyArray<readonly [number, number]>,
}

/** A flat ribbon along a polyline (for the scarf and the deckchair slings). Returns the geometry and the cumulative lengths. */
export function ribbon(pts: THREE.Vector3[], width: number, up = new THREE.Vector3(0, 1, 0)) {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const t = new THREE.Vector3()
  const side = new THREE.Vector3()
  const len: number[] = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]))
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    t.subVectors(b, a).normalize()
    side.crossVectors(t, up)
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
    side.normalize().multiplyScalar(width / 2)
    const p = pts[i]
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z)
    uv.push(0, len[i], width, len[i])
    if (i > 0) {
      const k = i * 2
      idx.push(k - 2, k - 1, k, k - 1, k + 1, k)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  g.userData.metric = 1
  return { geo: g, len }
}

/** Resamples a polyline (through CatmullRom) every `step` metres. */
export function resample(pts: THREE.Vector3[], step: number) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.3)
  const n = Math.max(2, Math.ceil(curve.getLength() / step))
  return curve.getSpacedPoints(n)
}

function beachMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEye: { value: E.beachEye }, uBright: { value: 1 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uEye; uniform float uBright;
      varying vec3 vW;
      ${NOISE_GLSL}
      const float PERIOD = 7.0;
      vec3 sky(vec3 d, vec3 sun){
        float h = max(d.y, 0.0);
        vec3 c = mix(vec3(0.86, 0.9, 0.93), vec3(0.32, 0.55, 0.88), pow(h, 0.55));
        float s = max(dot(d, sun), 0.0);
        c += vec3(1.0, 0.85, 0.6) * pow(s, 8.0) * 0.5 + vec3(1.0, 0.95, 0.85) * smoothstep(0.9993, 0.9996, s) * 6.0;
        float cl = fbm(d.xz / max(0.08, d.y) * 0.6 + vec2(uTime * 0.01, 0.0));
        c = mix(c, vec3(1.0, 0.97, 0.94), smoothstep(0.55, 0.85, cl) * 0.6 * smoothstep(0.0, 0.15, d.y));
        // Three gulls, gliding.
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          float az = 0.3 + fi * 0.5 + sin(uTime * 0.07 + fi * 2.0) * 0.25;
          float el = 0.16 + fi * 0.05 + sin(uTime * 0.13 + fi) * 0.02;
          vec3 g = normalize(vec3(sin(az) * 0.6, el, -cos(az)));
          vec3 rgt = normalize(cross(g, vec3(0.0, 1.0, 0.0)));
          vec3 upv = cross(rgt, g);
          vec2 q = vec2(dot(d - g, rgt), dot(d - g, upv)) * 260.0;
          float flap = sin(uTime * 6.0 + fi) * 0.4;
          float wing = abs(q.y - abs(q.x) * (0.45 + flap) ) < 0.55 && abs(q.x) < 3.2 ? 1.0 : 0.0;
          c = mix(c, vec3(0.25, 0.27, 0.3), wing * 0.8);
        }
        return c;
      }
      void main(){
        vec3 d = normalize(vW - uEye);
        vec3 sun = normalize(vec3(0.42, 0.24, -1.0));
        // Where two screens meet (the west wall, beyond z 2.5) the picture runs late, and a fine bezel shows.
        float seam = (vW.x < 292.3 && vW.z > 2.5) ? 1.0 : 0.0;
        float t = uTime + seam * 2.6;
        vec3 col;
        if (d.y >= 0.0) col = sky(d, sun);
        else {
          float tt = -1.6 / d.y;
          vec2 P = uEye.xz + d.xz * tt;
          float shore = -7.6 + 0.35 * sin(P.x * 0.3);
          float ph = fract(t / PERIOD);
          // The wave front comes in, breaks at the same line, washes up and draws back.
          float front = shore - 7.0 + 7.0 * smoothstep(0.0, 0.62, ph);
          float wash = shore + 1.4 * smoothstep(0.6, 0.78, ph) * (1.0 - smoothstep(0.78, 1.0, ph));
          if (P.y > shore + 0.0 && P.y > wash) {
            vec3 sand = vec3(0.86, 0.78, 0.62) * (0.92 + 0.12 * fbm(P * 3.0));
            float wet = smoothstep(shore + 1.6, shore, P.y);
            sand = mix(sand, vec3(0.62, 0.55, 0.43), wet * 0.7);
            // Far behind (+z): the dunes and a line of grass.
            float back = smoothstep(14.0, 40.0, P.y);
            sand = mix(sand, vec3(0.55, 0.6, 0.38), back * 0.5);
            col = sand;
          } else if (P.y > shore) {
            col = mix(vec3(0.95, 0.97, 0.98), vec3(0.62, 0.55, 0.43), smoothstep(wash - 0.25, wash, P.y) * 0.5);
          } else {
            float far = smoothstep(0.0, 60.0, -P.y + shore);
            vec3 sea = mix(vec3(0.24, 0.62, 0.66), vec3(0.08, 0.3, 0.5), far);
            float rip = fbm(P * vec2(0.6, 1.8) + vec2(0.0, t * 0.3));
            sea *= 0.88 + 0.22 * rip;
            // Glitter under the sun.
            float g = pow(max(dot(normalize(vec3(d.x, -d.y, d.z)), sun), 0.0), 120.0) * (0.5 + rip);
            sea += vec3(1.0, 0.95, 0.8) * g * 1.4;
            // The breaking line: white foam, then the swell behind it.
            float foam = exp(-pow((P.y - front) / 0.35, 2.0)) * smoothstep(0.0, 0.1, ph) * (0.7 + 0.3 * fbm(vec2(P.x * 2.0, ph * 9.0)));
            float swell = exp(-pow((P.y - front + 1.0) / 1.0, 2.0)) * 0.25;
            sea = mix(sea, vec3(0.95, 0.97, 0.98), clamp(foam, 0.0, 1.0));
            sea += vec3(0.1, 0.15, 0.15) * swell;
            float inner = smoothstep(front, shore, P.y) * (1.0 - smoothstep(0.62, 0.7, ph));
            sea = mix(sea, vec3(0.8, 0.88, 0.87), inner * 0.35);
            col = sea;
          }
        }
        // The seam line itself, and a faint pixel grid up close.
        float bez = (vW.x < 292.3) ? exp(-pow((vW.z - 2.5) / 0.006, 2.0)) : 0.0;
        col = mix(col, vec3(0.05), bez * 0.8);
        gl_FragColor = vec4(col * uBright, 1.0);
      }`,
  })
}

export class Habitat {
  readonly group = new THREE.Group()
  readonly beach = new THREE.Group()
  readonly lounge = new THREE.Group()
  readonly beachMat: THREE.ShaderMaterial
  readonly pantryLeaf: THREE.Object3D
  readonly booth: ReturnType<typeof canvasPlane>
  readonly side: ReturnType<typeof canvasPlane>
  readonly counters: Array<ReturnType<typeof canvasPlane>> = []
  readonly lampShade: THREE.MeshBasicMaterial
  readonly fwdGlass: THREE.Mesh
  readonly aftGlass: THREE.Mesh
  /** The scarf: the long one that leaves by the door; the coiled finished one; the short start. */
  readonly scarfOut: THREE.Mesh
  readonly scarfOutLen: number[]
  readonly scarfCoil: THREE.Mesh
  readonly guitar = new THREE.Group()
  readonly guitarCase = new THREE.Group()
  readonly knit = new THREE.Group()
  readonly knitPiece: THREE.Mesh
  readonly yarnBall: THREE.Mesh
  readonly bag = new THREE.Group()
  readonly cup = new THREE.Group()
  readonly watchProp = new THREE.Group()
  readonly chessPieces: THREE.InstancedMesh
  readonly movingPiece: THREE.Mesh
  readonly boothCamera = new THREE.Group()
  /** His breath on the aft glass (lastLook). */
  readonly fog: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
  private boothKey = ''
  private sideKey = ''
  private dayKey = ''

  constructor(m: Pal, scene: THREE.Scene, models: { armchair: THREE.Group | null; instrument: THREE.Group | null; suitcase: THREE.Group | null }) {
    const g = this.group
    scene.add(g)
    g.add(this.beach, this.lounge)

    // ——— The beach module: sand on the floor, the rest a screen ———
    this.beachMat = beachMaterial()
    const B = this.beach
    const sand = mesh(new THREE.PlaneGeometry(8, 8, 1, 1), m.sand, 296, 0, 0, B)
    sand.rotation.x = -PI / 2
    sand.receiveShadow = true
    const screen = (w: number, h: number, x: number, y: number, z: number, ry: number, rx = 0) => {
      const p = mesh(new THREE.PlaneGeometry(w, h), this.beachMat, x, y, z, B)
      p.rotation.set(rx, ry, 0, 'YXZ')
      return p
    }
    screen(8, 3.2, 296, 1.6, -4, 0)
    screen(8, 3.2, 292, 1.6, 0, PI / 2)
    screen(8, 3.2, 296, 1.6, 4, PI)
    screen(8, 8, 296, 3.2, 0, 0, PI / 2)
    // The east wall: a screen with the doorway back to the lounge.
    screen(3.4, 3.2, 300, 1.6, 2.3, -PI / 2)
    screen(3.6, 3.2, 300, 1.6, -2.2, -PI / 2)
    screen(1.0, 1.1, 300, 2.65, 0.1, -PI / 2)
    // Driftwood and a towel on the sand, footprints of nobody.
    const towel = mesh(new THREE.PlaneGeometry(0.7, 1.5), m.canvasStripe, 297.8, 0.004, -2.0, B)
    towel.rotation.set(-PI / 2, 0, 0.3)
    tube(
      [
        [293.2, 0.05, -3.2],
        [293.8, 0.07, -3.0],
        [294.4, 0.05, -3.1],
      ],
      0.05,
      m.deckWood,
      B,
    )
    for (const [x, z] of [
      [E.deckA.x, E.deckA.z],
      [E.deckB.x, E.deckB.z],
    ]) {
      const c = deckchair(m)
      c.position.set(x, 0, z)
      c.rotation.y = PI
      B.add(c)
    }
    // A short passage to the lounge.
    const pass = room({ w: 2.0, d: 1.0, h: 2.2, x: 301, z: 0.1, wall: m.loungeWall, floor: m.loungeFloor, ceiling: m.loungeCeiling, trim: null, skip: ['e', 'w'] })
    B.add(pass)

    // ——— The lounge ———
    const L = this.lounge
    const lr = room({
      w: 10,
      d: 10,
      h: 3.0,
      x: 307,
      z: -1,
      wall: m.loungeWall,
      floor: m.loungeFloor,
      ceiling: m.loungeCeiling,
      trim: m.tableWood,
      skip: ['n', 's'],
      openings: [
        { side: 'w', at: 1.1, width: 1.0, height: 2.1 },
        { side: 'w', at: 3.0, width: 0.9, height: 2.1 },
        { side: 'e', at: -3.6, width: 1.0, height: 2.1 },
      ],
    })
    L.add(lr)
    // Front wall with the forward window; back wall with the aft window, two portholes and the doorway.
    const north = new THREE.Shape()
    north.moveTo(302, 0)
    north.lineTo(312, 0)
    north.lineTo(312, 3)
    north.lineTo(302, 3)
    north.lineTo(302, 0)
    const fh = new THREE.Path()
    fh.absarc(307, 1.55, 1.3, 0, PI * 2, true)
    north.holes.push(fh)
    const nw = mesh(new THREE.ExtrudeGeometry(north, { depth: 0.2, bevelEnabled: false, curveSegments: 48 }), m.loungeWall, 0, 0, -6.2, L)
    nw.receiveShadow = true
    nw.castShadow = true
    const south = new THREE.Shape()
    south.moveTo(302, 0)
    south.lineTo(311, 0)
    south.lineTo(311, 2.1)
    south.lineTo(312, 2.1)
    south.lineTo(312, 3)
    south.lineTo(302, 3)
    south.lineTo(302, 0)
    for (const [cx, cy, r] of [
      [307, 1.55, 1.2],
      [303.8, 1.5, 0.25],
      [310.2, 1.5, 0.25],
    ] as const) {
      const h = new THREE.Path()
      h.absarc(cx, cy, r, 0, PI * 2, true)
      south.holes.push(h)
    }
    const sw = mesh(new THREE.ExtrudeGeometry(south, { depth: 0.2, bevelEnabled: false, curveSegments: 48 }), m.loungeWall, 0, 0, 4.0, L)
    sw.receiveShadow = true
    sw.castShadow = true
    // Window rims and glass.
    const rimFwd = mesh(new THREE.TorusGeometry(1.32, 0.07, 14, 80), m.screenBezel, 307, 1.55, -5.98, L)
    void rimFwd
    const rimAft = mesh(new THREE.TorusGeometry(1.22, 0.07, 14, 80), m.screenBezel, 307, 1.55, 3.98, L)
    void rimAft
    for (const x of [303.8, 310.2]) mesh(new THREE.TorusGeometry(0.26, 0.035, 10, 36), m.screenBezel, x, 1.5, 3.98, L)
    this.fwdGlass = mesh(new THREE.CircleGeometry(1.3, 64), m.windowGlass, 307, 1.55, -6.1, L)
    this.aftGlass = mesh(new THREE.CircleGeometry(1.2, 64), m.windowGlass, 307, 1.55, 4.1, L)
    this.aftGlass.rotation.y = PI
    for (const x of [303.8, 310.2]) {
      const pg = mesh(new THREE.CircleGeometry(0.25, 32), m.windowGlass, x, 1.5, 4.1, L)
      pg.rotation.y = PI
    }
    this.fwdGlass.renderOrder = 3
    this.aftGlass.renderOrder = 3
    // A soft breath mark on the aft glass, where his face comes close.
    const fogCanvas = document.createElement('canvas')
    fogCanvas.width = fogCanvas.height = 128
    const fctx = fogCanvas.getContext('2d')!
    const fg = fctx.createRadialGradient(64, 64, 4, 64, 64, 62)
    fg.addColorStop(0, 'rgba(255,255,255,1)')
    fg.addColorStop(0.5, 'rgba(255,255,255,0.55)')
    fg.addColorStop(1, 'rgba(255,255,255,0)')
    fctx.fillStyle = fg
    fctx.fillRect(0, 0, 128, 128)
    const fogTex = new THREE.CanvasTexture(fogCanvas)
    this.fog = new THREE.Mesh(
      new THREE.CircleGeometry(0.09, 32),
      new THREE.MeshBasicMaterial({ color: 0xc8d4e4, map: fogTex, transparent: true, opacity: 0, depthWrite: false }),
    )
    this.fog.name = 'breath'
    this.fog.position.set(306.86, 1.56, 4.085)
    this.fog.rotation.y = PI
    this.fog.scale.set(1, 0.7, 1)
    this.fog.renderOrder = 4
    this.fog.visible = false
    L.add(this.fog)
    // Ceiling: a cove of warm light around a lowered panel.
    rbox(7.6, 0.08, 7.6, m.loungeCeiling, 307, 2.86, -1, L, 0.02)
    this.lampShade = new THREE.MeshBasicMaterial({ color: 0xffd9a8 })
    for (const [x, z, w, d] of [
      [307, 2.8, 7.4, 0.04],
      [307, -4.8, 7.4, 0.04],
      [303.2, -1, 0.04, 7.6],
      [310.8, -1, 0.04, 7.6],
    ] as const)
      rbox(w, 0.02, d, this.lampShade, x, 2.82, z, L, 0.005)
    // Rug, sofas, a low table, the chess table, Y's stool, W1's armchair, lamps.
    const rug = mesh(new THREE.PlaneGeometry(6.4, 3.6), m.rug, 307, 0.004, 0.2, L)
    rug.rotation.x = -PI / 2
    rug.receiveShadow = true
    for (const s of [E.sofaA, E.sofaB]) {
      const so = sofa(2.0, m.sofaFabric, m.sofaCushion)
      so.position.set(s.x, 0, s.z)
      so.rotation.y = PI
      L.add(so)
    }
    const low = table(1.1, 0.6, 0.42, m.tableWood)
    low.position.set(307, 0, -0.35)
    L.add(low)
    const ct = table(0.7, 0.7, 0.72, m.tableWood)
    ct.position.set(E.chess.x, 0, E.chess.z)
    L.add(ct)
    for (const [dx, ry] of [
      [-0.62, PI / 2],
      [0.62, -PI / 2],
    ] as const) {
      const ch = chair(m.tableWood, m.sofaFabric)
      ch.position.set(E.chess.x + dx, 0, E.chess.z)
      ch.rotation.y = ry
      L.add(ch)
    }
    // The board and its pieces.
    const board = canvasPlane(0.42, 0.42, 256, (ctx, w, h) => {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        ctx.fillStyle = (i + j) % 2 ? '#3a2a1c' : '#d9c9a6'
        ctx.fillRect((i * w) / 8, (j * h) / 8, w / 8, h / 8)
      }
    })
    board.mesh.rotation.x = -PI / 2
    board.mesh.position.set(E.chess.x, 0.722, E.chess.z)
    L.add(board.mesh)
    rbox(0.46, 0.02, 0.46, m.guitarDark, E.chess.x, 0.71, E.chess.z, L, 0.004)
    const pieceGeo = new THREE.LatheGeometry(
      [
        [0.0, 0],
        [0.016, 0],
        [0.016, 0.006],
        [0.008, 0.012],
        [0.006, 0.03],
        [0.011, 0.034],
        [0.0, 0.048],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      16,
    )
    this.chessPieces = new THREE.InstancedMesh(pieceGeo, m.chessLight, 22)
    const dummy = new THREE.Object3D()
    const pr = (i: number) => (Math.sin(i * 12.9898) * 43758.5453) % 1
    for (let i = 0; i < 22; i++) {
      const c = Math.floor(Math.abs(pr(i)) * 8)
      const r = i < 11 ? Math.floor(Math.abs(pr(i + 40)) * 3) : 5 + Math.floor(Math.abs(pr(i + 70)) * 3)
      dummy.position.set(E.chess.x - 0.21 + (c + 0.5) * 0.0525, 0.723, E.chess.z - 0.21 + (r + 0.5) * 0.0525)
      dummy.scale.setScalar(i % 5 === 0 ? 1.25 : 1)
      dummy.updateMatrix()
      this.chessPieces.setMatrixAt(i, dummy.matrix)
      this.chessPieces.setColorAt(i, new THREE.Color(i < 11 ? 0xffffff : 0x2a211a))
    }
    this.chessPieces.castShadow = true
    L.add(this.chessPieces)
    this.movingPiece = mesh(pieceGeo, m.chessDark, 0, 0, 0, L)
    this.movingPiece.scale.setScalar(1.25)
    this.movingPiece.castShadow = true
    const st = stool(m.tableWood, m.blackMetal)
    st.position.set(E.stool.x, 0, E.stool.z)
    L.add(st)
    if (models.armchair) {
      models.armchair.position.set(E.armchair.x, 0, E.armchair.z)
      models.armchair.rotation.y = E.armchair.yaw
      L.add(models.armchair)
    } else {
      const ac = sofa(0.9, m.sofaFabric, m.sofaCushion)
      ac.position.set(E.armchair.x, 0, E.armchair.z)
      ac.rotation.y = E.armchair.yaw
      L.add(ac)
    }
    // Floor lamps (drum shades) and a side table with a lamp.
    for (const [x, z] of E.lamps) {
      cyl(0.16, 0.18, 0.03, m.blackMetal, x, 0.015, z, L, 24)
      cyl(0.012, 0.012, 1.45, m.brass, x, 0.75, z, L, 10)
      const shade = mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.3, 32, 1, true), this.lampShade, x, 1.55, z, L)
      ;(shade.material as THREE.Material).side = THREE.DoubleSide
    }
    // A bookshelf on the west wall, plants by the east wall.
    rbox(0.32, 1.8, 1.4, m.tableWood, 302.17, 0.9, -2.8, L, 0.01)
    for (let i = 0; i < 4; i++) rbox(0.28, 0.02, 1.32, m.guitarDark, 302.19, 0.3 + i * 0.45, -2.8, L, 0.004)
    for (let i = 0; i < 26; i++) {
      const row = i % 4
      const bz = -3.42 + Math.floor(i / 4) * 0.2 + (i % 3) * 0.03
      rbox(0.22, 0.22 + (i % 3) * 0.04, 0.035 + (i % 2) * 0.01, [m.canvasStripe, m.sofaCushion, m.redScarf][i % 3], 302.2, 0.43 + row * 0.45 + (i % 3) * 0.02, bz, L, 0.003)
    }
    // ——— The pantry door (west wall, z 2.0), crates behind it ———
    const pd = door({ w: 0.9, h: 2.1, frame: m.tableWood, leaf: m.shellWhiteSoft, handle: m.brushed })
    pd.group.position.set(302.0, 0, 2.0)
    pd.group.rotation.y = PI / 2
    L.add(pd.group)
    this.pantryLeaf = pd.leaf
    const label = canvasPlane(0.4, 0.22, 512, drawPantryLabel)
    label.mesh.position.set(0.45, 1.4, 0.025)
    pd.leaf.add(label.mesh)
    const pantry = room({ w: 1.4, d: 1.4, h: 2.4, x: 301.25, z: 2.0, wall: m.shellWhiteSoft, floor: m.cabinGrey, ceiling: m.shellWhiteSoft, trim: null, skip: ['e'] })
    L.add(pantry)
    for (let i = 0; i < 9; i++) {
      const cx = 300.85 + (i % 2) * 0.55
      const cy = 0.2 + Math.floor(i / 2) * 0.41
      if (cy > 2.0) continue
      rbox(0.5, 0.4, 0.6, m.crate, cx, cy, 2.0 + ((i * 7) % 3) * 0.05 - 0.05, L, 0.01)
    }
    // Signs and the day counters.
    const sim = canvasPlane(0.9, 0.18, 512, drawSign(T('SİMÜLASYON', 'SIMULATION')), { emissive: true })
    sim.mesh.position.set(302.02, 2.32, 0.1)
    sim.mesh.rotation.y = PI / 2
    L.add(sim.mesh)
    const fun = canvasPlane(0.9, 0.18, 512, drawSign(T('EĞLENCE', 'RECREATION')), { emissive: true })
    fun.mesh.position.set(311.98, 2.32, -4.6)
    fun.mesh.rotation.y = -PI / 2
    L.add(fun.mesh)
    for (const [x, y, z, ry] of [
      [311.5, 2.5, 3.98, PI],
      [311.98, 1.9, -2.0, -PI / 2],
    ] as const) {
      rbox(0.64, 0.3, 0.03, m.screenBezel, x - Math.sin(ry) * 0.022, y, z - Math.cos(ry) * 0.022, L, 0.01).rotation.y = ry
      const c = canvasPlane(0.6, 0.26, 512, drawDayCounter('0'), { emissive: true })
      c.mesh.position.set(x, y, z)
      c.mesh.rotation.y = ry
      L.add(c.mesh)
      this.counters.push(c)
    }
    // A games room beyond the east doorway (dim), a pool of light.
    const games = room({ w: 2.4, d: 2.2, h: 2.6, x: 313.4, z: -4.6, wall: m.loungeWall, floor: m.loungeFloor, ceiling: m.loungeCeiling, trim: null, skip: ['w'] })
    L.add(games)
    const gt = table(1.4, 0.8, 0.8, m.sofaCushion, m.tableWood)
    gt.position.set(313.6, 0, -4.6)
    L.add(gt)
    // ——— The corridor beyond the doorway (runs +x) ———
    const corr = room({ w: 9.4, d: 1.2, h: 2.4, x: 315.7, z: 4.8, wall: m.shellWhiteSoft, floor: m.loungeFloor, ceiling: m.shellWhiteSoft, trim: null, openings: [{ side: 'n', at: -4.2, width: 1.0, height: 2.1 }] })
    L.add(corr)
    rbox(1.0, 0.01, 0.25, m.brushed, 311.5, 0.005, 4.1, L, 0.003)
    for (let x = 312.6; x < 320; x += 1.8) rbox(0.6, 0.02, 0.6, this.lampShade, x, 2.39, 4.8, L, 0.005)
    // ——— The comms booth ———
    const bx = E.booth.x
    const bz = E.booth.z
    rbox(1.0, 2.2, 0.04, m.shellWhiteSoft, bx, 1.1, bz - 0.5, L, 0.01)
    rbox(0.04, 2.2, 1.0, m.shellWhiteSoft, bx - 0.5, 1.1, bz, L, 0.01)
    rbox(0.04, 2.2, 1.0, m.shellWhiteSoft, bx + 0.5, 1.1, bz, L, 0.01)
    rbox(1.08, 0.05, 1.04, m.shellWhiteSoft, bx, 2.22, bz, L, 0.01)
    rbox(0.54, 0.39, 0.03, m.screenBezel, bx, 1.45, bz - 0.465, L, 0.01)
    this.booth = canvasPlane(0.5, 0.35, 512, drawBooth({ kind: 'idle' }), { emissive: true })
    this.booth.mesh.position.copy(E.boothScreen)
    L.add(this.booth.mesh)
    rbox(0.024, 0.4, 0.62, m.screenBezel, E.side.x - 0.014, E.side.y, E.side.z, L, 0.008)
    this.side = canvasPlane(0.58, 0.36, 512, drawLog, { emissive: true })
    this.side.mesh.position.copy(E.side)
    this.side.mesh.rotation.y = PI / 2
    L.add(this.side.mesh)
    // The camera on its arm, looking out at whoever stands there.
    const bc = this.boothCamera
    bc.position.copy(E.boothCam)
    rbox(0.07, 0.05, 0.1, m.blackMetal, 0, 0, 0, bc, 0.008)
    const lens = cyl(0.018, 0.018, 0.02, m.indicatorGlass, 0, 0, 0.055, bc, 16)
    lens.rotation.x = PI / 2
    mesh(new THREE.CircleGeometry(0.004, 10), m.navRed, 0.025, 0.018, 0.051, bc)
    tube(
      [
        [bx, 1.75, bz - 0.48],
        [bx, 1.75, bz - 0.42],
      ],
      0.008,
      m.blackMetal,
      L,
    )
    L.add(bc)
    if (models.instrument) {
      models.instrument.position.set(bx + 0.5 + 0.22, 1.2, bz - 0.3)
      models.instrument.rotation.y = -0.4
      L.add(models.instrument)
      rbox(0.5, 0.04, 0.35, m.tableWood, bx + 0.72, 1.18, bz - 0.3, L, 0.006)
      cyl(0.02, 0.02, 1.16, m.blackMetal, bx + 0.72, 0.58, bz - 0.3, L, 10)
    }

    // ——— The scarf ———
    const lap = new THREE.Vector3(E.armchair.x + 0.12, 0.6, E.armchair.z + 0.28)
    const outPts = resample(
      [
        lap,
        new THREE.Vector3(E.armchair.x + 0.3, 0.42, E.armchair.z + 0.55),
        new THREE.Vector3(E.armchair.x + 0.5, 0.012, E.armchair.z + 0.9),
        new THREE.Vector3(307.85, 0.012, -1.0),
        new THREE.Vector3(307.75, 0.012, 0.1),
        new THREE.Vector3(307.05, 0.012, 1.4),
        new THREE.Vector3(307.5, 0.012, 2.4),
        new THREE.Vector3(309.4, 0.012, 3.15),
        new THREE.Vector3(311.0, 0.012, 3.7),
        new THREE.Vector3(311.5, 0.012, 4.45),
        new THREE.Vector3(312.6, 0.012, 4.85),
        new THREE.Vector3(314.6, 0.012, 4.7),
        new THREE.Vector3(317.2, 0.012, 4.9),
        new THREE.Vector3(319.6, 0.012, 4.75),
      ],
      0.04,
    )
    const out = ribbon(outPts, 0.15)
    this.scarfOut = mesh(out.geo, m.yarn, 0, 0, 0, L)
    this.scarfOut.name = 'scarfOut'
    this.scarfOutLen = out.len
    this.scarfOut.receiveShadow = true
    // Coiled around the armchair, finished.
    const coil: THREE.Vector3[] = [lap.clone(), new THREE.Vector3(E.armchair.x + 0.35, 0.3, E.armchair.z + 0.6)]
    for (let i = 0; i <= 120; i++) {
      const a = 0.9 + (i / 120) * PI * 2 * 3.2
      const r = 0.72 + (i / 120) * 0.42
      coil.push(new THREE.Vector3(E.armchair.x + Math.cos(a) * r, 0.012 + (i % 40 === 0 ? 0 : 0.004 * Math.sin(i)), E.armchair.z + Math.sin(a) * r))
    }
    this.scarfCoil = mesh(ribbon(resample(coil, 0.05), 0.15).geo, m.yarn, 0, 0, 0, L)
    this.scarfCoil.receiveShadow = true

    // ——— Things people carry (moved by the scene) ———
    buildGuitar(this.guitar, m)
    scene.add(this.guitar)
    rbox(0.4, 1.05, 0.13, m.caseBlack, 0, 0.52, 0, this.guitarCase, 0.06)
    rbox(0.3, 0.06, 0.02, m.brushed, 0, 0.6, 0.07, this.guitarCase, 0.01)
    tube(
      [
        [-0.12, 0.95, -0.07],
        [-0.12, 0.6, -0.12],
        [-0.12, 0.2, -0.08],
      ],
      0.012,
      m.blackMetal,
      this.guitarCase,
    )
    scene.add(this.guitarCase)
    // Knitting: two needles, a short blue piece, the ball.
    for (const sx of [-1, 1]) {
      const n = cyl(0.0025, 0.0025, 0.32, m.needle, sx * 0.07, 0.02, 0, this.knit, 8)
      n.rotation.z = sx * 1.25
    }
    this.knitPiece = mesh(new THREE.PlaneGeometry(0.15, 0.2, 1, 4), m.yarn, 0, -0.08, 0.01, this.knit)
    ;(m.yarn as THREE.MeshStandardMaterial).side = THREE.DoubleSide
    scene.add(this.knit)
    this.yarnBall = mesh(new THREE.SphereGeometry(0.05, 20, 14), m.yarn, 0, 0, 0, scene)
    this.yarnBall.castShadow = true
    // Her canvas bag.
    rbox(0.32, 0.28, 0.14, m.canvasBag, 0, 0.14, 0, this.bag, 0.03)
    tube(
      [
        [-0.08, 0.28, 0],
        [0, 0.4, 0],
        [0.08, 0.28, 0],
      ],
      0.008,
      m.canvasBag,
      this.bag,
    )
    scene.add(this.bag)
    // M's cup.
    turned(
      [
        [0, 0],
        [0.035, 0],
        [0.04, 0.08],
        [0.037, 0.082],
        [0.033, 0.006],
        [0, 0.006],
      ],
      m.cupWhite,
      24,
      this.cup,
    )
    mesh(new THREE.CircleGeometry(0.034, 20), m.coffee, 0, 0.065, 0, this.cup).rotation.x = -PI / 2
    scene.add(this.cup)
    // S's watch, lying on the chess table at the end.
    const wf = cyl(0.018, 0.018, 0.008, m.watch, 0, 0.004, 0, this.watchProp, 20)
    void wf
    rbox(0.022, 0.003, 0.16, m.shoe, 0, 0.0015, 0, this.watchProp, 0.001)
    scene.add(this.watchProp)
  }

  setBooth(mode: BoothMode) {
    const key = mode.kind === 'link' ? `link${Math.floor(mode.t * 6)}` : mode.kind === 'sent' ? `sent${Math.floor(mode.spin * 4) % 12}` : mode.kind
    if (key === this.boothKey) return
    this.boothKey = key
    this.booth.redraw(drawBooth(mode), key)
  }

  setSide(key: string, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
    if (key === this.sideKey) return
    this.sideKey = key
    this.side.redraw(draw, key)
  }

  setDay(text: string, blur: number) {
    const key = `${text}|${blur.toFixed(1)}`
    if (key === this.dayKey) return
    this.dayKey = key
    for (const c of this.counters) c.redraw(drawDayCounter(text, blur), key)
  }

  /** Shows the first `meters` of the long scarf. */
  setScarf(meters: number) {
    const len = this.scarfOutLen
    let i = 0
    while (i < len.length - 1 && len[i + 1] <= meters) i++
    this.scarfOut.visible = meters > 0.05
    this.scarfOut.geometry.setDrawRange(0, i * 6)
  }
}

/** A wooden deckchair facing +z (the scene turns it), with a striped canvas sling. */
function deckchair(m: Pal) {
  const g = new THREE.Group()
  for (const sx of [-1, 1]) {
    // The long side rail, from the back top to the front foot.
    const rail = rbox(0.035, 0.03, 1.25, m.deckWood, sx * 0.29, 0.5, -0.05, g, 0.006)
    rail.rotation.x = 0.62
    // Front leg and the back leg.
    rbox(0.035, 0.42, 0.035, m.deckWood, sx * 0.29, 0.21, 0.42, g, 0.006)
    const bl = rbox(0.035, 0.03, 0.75, m.deckWood, sx * 0.25, 0.24, -0.18, g, 0.006)
    bl.rotation.x = -0.75
    // Arm.
    rbox(0.06, 0.02, 0.45, m.deckWood, sx * 0.3, 0.42, 0.25, g, 0.006)
  }
  for (const z of [0.42, -0.42]) rbox(0.62, 0.03, 0.03, m.deckWood, 0, z > 0 ? 0.4 : 0.86, z > 0 ? 0.42 : -0.43, g, 0.006)
  const sling = ribbon(
    resample(
      [
        new THREE.Vector3(0, 0.86, -0.43),
        new THREE.Vector3(0, 0.55, -0.18),
        new THREE.Vector3(0, 0.3, 0.12),
        new THREE.Vector3(0, 0.4, 0.42),
      ],
      0.04,
    ),
    0.52,
    new THREE.Vector3(1, 0, 0),
  )
  const s = mesh(sling.geo, m.canvasStripe, 0, 0, 0, g)
  ;(s.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  g.traverse((o) => {
    const mm = o as THREE.Mesh
    if (mm.isMesh) {
      mm.castShadow = true
      mm.receiveShadow = true
    }
  })
  return g
}

/** An acoustic guitar: body in the x–y plane (top facing +z), neck toward +x. */
function buildGuitar(g: THREE.Group, m: Pal) {
  const s = new THREE.Shape()
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * PI * 2
    // A waisted outline: two lobes along x.
    const x = Math.cos(a)
    const lobe = x < 0 ? 0.2 : 0.16
    const waist = 1 - 0.18 * Math.exp(-Math.pow(x * 2.2, 2))
    pts.push([x * 0.24, Math.sin(a) * lobe * waist])
  }
  s.moveTo(pts[0][0], pts[0][1])
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y)
  const body = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 })
  body.translate(0, 0, -0.05)
  mesh(body, m.guitarWood, 0, 0, 0, g)
  mesh(new THREE.CircleGeometry(0.045, 32), m.guitarDark, 0.07, 0, 0.0565, g)
  rbox(0.5, 0.05, 0.025, m.guitarDark, 0.45, 0, 0.04, g, 0.005)
  rbox(0.16, 0.07, 0.02, m.guitarDark, 0.77, 0, 0.035, g, 0.005)
  rbox(0.02, 0.09, 0.012, m.guitarDark, -0.07, 0, 0.058, g, 0.003)
  for (let i = 0; i < 6; i++) {
    const str = mesh(new THREE.CylinderGeometry(0.0007, 0.0007, 0.78, 4), m.needle, 0.32, -0.02 + i * 0.008, 0.06, g)
    str.rotation.z = PI / 2
  }
  g.traverse((o) => (o.castShadow = true))
}
