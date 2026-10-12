/**
 * The square at x 300: a European-ish square seen from the mouth of a street,
 * always from the same place. A clock tower at the back, a fountain in the
 * middle, the bank on the left with its steps, tram rails across, low
 * facades all round; at the right edge the corner bakery and a street clock.
 * Nine eras change its light, its people, its damage and its signs; the
 * bakery's door and the street clock's post never change.
 *
 * Eras: 0 1914 · 1 1917 · 2 1931 · 3 1944 · 4 1962 · 5 1991 · 6 2008 · 7 2029 · 8 2041.
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { Crowd, car, facade, rbox, turned } from '../kit/props'
import { pbr } from '../kit/surfaces'

export const SQUARE_CAM = { pos: new THREE.Vector3(300, 1.7, 16), tgt: new THREE.Vector3(300, 6, -12), fov: 42 }
const TOWER = new THREE.Vector3(300, 0, -20)
const SODIUM = [
  [285, 9],
  [315, 9],
  [285, -12],
] as const
const FOUNTAIN = new THREE.Vector3(300, 0, -4)

type Era = {
  sunDir: [number, number, number]
  sun: number
  sunCol: number
  sky: number
  skyTop: number
  ground: number
  hemi: number
  fog: number
  fogNear: number
  fogFar: number
  env: number
  /** Clock hands (hours, minutes). */
  time: [number, number]
  wet: number
}

export const ERA_LOOKS: Era[] = [
  // 1914 clear morning sun
  { sunDir: [0.6, 0.55, 0.5], sun: 3.2, sunCol: 0xfff0d8, sky: 0xcfdcea, skyTop: 0x6f97c6, ground: 0x8a7d6a, hemi: 1.1, fog: 0xcad6e2, fogNear: 60, fogFar: 260, env: 0.5, time: [9, 40], wet: 0 },
  // 1917 overcast, smoke
  { sunDir: [0.2, 0.8, 0.3], sun: 0.5, sunCol: 0xd8d6d0, sky: 0x9a9a96, skyTop: 0x7c7d7c, ground: 0x4c4a46, hemi: 1.0, fog: 0x8e8d88, fogNear: 25, fogFar: 140, env: 0.35, time: [11, 10], wet: 0 },
  // 1931 grey winter
  { sunDir: [-0.3, 0.5, 0.4], sun: 0.6, sunCol: 0xdfe4ea, sky: 0xb4bcc4, skyTop: 0x8b96a2, ground: 0x575a5e, hemi: 1.1, fog: 0xb0b8c0, fogNear: 30, fogFar: 160, env: 0.35, time: [8, 25], wet: 0.2 },
  // 1944 dust haze, low sun
  { sunDir: [0.85, 0.22, -0.3], sun: 2.0, sunCol: 0xffc48a, sky: 0xc9a782, skyTop: 0x8e7b68, ground: 0x5a4a3c, hemi: 0.75, fog: 0xb89a7a, fogNear: 12, fogFar: 110, env: 0.3, time: [5, 12], wet: 0 },
  // 1962 bright noon
  { sunDir: [0.2, 0.95, 0.25], sun: 3.6, sunCol: 0xfff6e6, sky: 0xd6e4f0, skyTop: 0x5d8fc8, ground: 0x8c8274, hemi: 1.2, fog: 0xd2dfe8, fogNear: 80, fogFar: 300, env: 0.55, time: [12, 5], wet: 0 },
  // 1991 dusk, sodium lights
  { sunDir: [-0.8, 0.12, -0.4], sun: 0.7, sunCol: 0xff9a5a, sky: 0x6a5a6a, skyTop: 0x262c44, ground: 0x2a2420, hemi: 0.45, fog: 0x4a4048, fogNear: 25, fogFar: 160, env: 0.15, time: [19, 50], wet: 0 },
  // 2008 rainy grey
  { sunDir: [0.1, 0.9, 0.3], sun: 0.35, sunCol: 0xc8ccd2, sky: 0x8a9096, skyTop: 0x6c737a, ground: 0x3c4044, hemi: 0.95, fog: 0x7f868c, fogNear: 15, fogFar: 110, env: 0.3, time: [16, 30], wet: 1 },
  // 2029 cool daylight
  { sunDir: [-0.5, 0.7, 0.45], sun: 2.6, sunCol: 0xeef4ff, sky: 0xd0dde8, skyTop: 0x7aa2c8, ground: 0x7b8086, hemi: 1.15, fog: 0xc8d4de, fogNear: 60, fogFar: 260, env: 0.5, time: [14, 20], wet: 0 },
  // 2041 orange haze
  { sunDir: [0.5, 0.35, -0.6], sun: 1.6, sunCol: 0xffa060, sky: 0xc98a5a, skyTop: 0x8a5a3a, ground: 0x5a4030, hemi: 0.8, fog: 0xc0805a, fogNear: 14, fogFar: 120, env: 0.3, time: [17, 5], wet: 0 },
]

/** Era-specific groups switch on and off; the rest is shared. */
type EraSet = Set<number>
const E = (...eras: number[]): EraSet => new Set(eras)

function clockFace(hours: number, minutes: number, cracked: boolean, size = 512) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const r = size / 2
  g.fillStyle = '#e9e3d4'
  g.beginPath()
  g.arc(r, r, r - 2, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#1d1a16'
  g.lineWidth = size * 0.02
  g.beginPath()
  g.arc(r, r, r * 0.94, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = '#1d1a16'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `600 ${size * 0.1}px Georgia, serif`
  const roman = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    g.fillText(roman[i], r + Math.cos(a) * r * 0.76, r + Math.sin(a) * r * 0.76)
  }
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const l = i % 5 === 0 ? 0.06 : 0.03
    g.lineWidth = i % 5 === 0 ? size * 0.008 : size * 0.004
    g.beginPath()
    g.moveTo(r + Math.cos(a) * r * 0.9, r + Math.sin(a) * r * 0.9)
    g.lineTo(r + Math.cos(a) * r * (0.9 - l), r + Math.sin(a) * r * (0.9 - l))
    g.stroke()
  }
  const hand = (angle: number, len: number, w: number) => {
    g.lineWidth = w
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(r - Math.cos(angle) * len * 0.15, r - Math.sin(angle) * len * 0.15)
    g.lineTo(r + Math.cos(angle) * len, r + Math.sin(angle) * len)
    g.stroke()
  }
  const ma = (minutes / 60) * Math.PI * 2 - Math.PI / 2
  const ha = (((hours % 12) + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2
  hand(ha, r * 0.5, size * 0.035)
  hand(ma, r * 0.78, size * 0.022)
  g.beginPath()
  g.arc(r, r, size * 0.025, 0, Math.PI * 2)
  g.fill()
  if (cracked) {
    const rand = mulberry32(5)
    g.strokeStyle = 'rgba(30,25,20,0.85)'
    g.lineWidth = size * 0.006
    for (let k = 0; k < 5; k++) {
      g.beginPath()
      let x = r + (rand() - 0.5) * r * 0.4
      let y = r + (rand() - 0.5) * r * 0.4
      g.moveTo(x, y)
      for (let s = 0; s < 6; s++) {
        x += (rand() - 0.5) * r * 0.5
        y += (rand() - 0.5) * r * 0.5
        g.lineTo(x, y)
      }
      g.stroke()
    }
    g.fillStyle = 'rgba(60,50,40,0.25)'
    g.fillRect(0, 0, size, size)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function signTexture(text: string, bg: string, fg: string, w = 1024, h = 192, font = 'Georgia, serif') {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  g.strokeStyle = fg
  g.lineWidth = 6
  g.strokeRect(10, 10, w - 20, h - 20)
  g.fillStyle = fg
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `600 ${h * 0.5}px ${font}`
  g.fillText(text, w / 2, h / 2 + 4)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export class SquareSet {
  readonly group = new THREE.Group()
  private eraGroups: Array<{ g: THREE.Object3D; eras: EraSet }> = []
  skyMat!: THREE.ShaderMaterial
  crowd!: Crowd
  queue!: Crowd
  runners!: Crowd
  private crowdCols: THREE.Color[] = []
  rain!: THREE.LineSegments
  rainMat!: THREE.ShaderMaterial
  smoke!: THREE.InstancedMesh
  smokeMat!: THREE.MeshBasicMaterial
  pavingMat!: THREE.MeshStandardMaterial
  /** The tower clock and the street clock per era (textures). */
  private clocks: THREE.Texture[] = []
  towerClock!: THREE.MeshStandardMaterial
  streetClock!: THREE.MeshStandardMaterial
  streetClockPivot = new THREE.Group()
  era = -1
  private dummy = new THREE.Object3D()

  private add(obj: THREE.Object3D, eras: EraSet) {
    this.group.add(obj)
    this.eraGroups.push({ g: obj, eras })
    return obj
  }

  build() {
    const G = this.group
    const rand = mulberry32(1914)
    const stone = pbr('concrete', 0xb9ad98, { roughness: 0.95, scale: 1.6 })
    const stoneDark = pbr('concrete', 0x8e8473, { roughness: 0.95, scale: 1.6 })
    const plaster = (c: number) => pbr('plaster', c, { roughness: 1 })
    const iron = pbr('metal', 0x1f2224, { roughness: 0.55 })
    const steel = pbr('metal', 0x8a8f94, { roughness: 0.4 })
    const wood = pbr('wood', 0x5a4130, { roughness: 0.8 })
    this.pavingMat = pbr('paving', 0x9a9284, { roughness: 0.9, scale: 0.6 })
    const asphalt = pbr('asphalt', 0x3a3a3c, { roughness: 0.9 })

    // ——— Sky dome ———
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunCol: { value: new THREE.Color() }, uCloud: { value: 0.5 } },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSun; uniform vec3 uSunCol; uniform float uCloud; varying vec3 vD;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9,78.2)))*43758.5); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.03; a*=0.5; } return v; }
        void main(){
          float e = max(vD.y, 0.0);
          vec3 c = mix(uHor, uTop, smoothstep(0.0, 0.6, e));
          float s = max(dot(vD, normalize(uSun)), 0.0);
          c += uSunCol * (pow(s, 300.0) * 3.0 + pow(s, 12.0) * 0.25);
          vec2 p = vD.xz / max(vD.y, 0.06) * 0.8;
          float cl = smoothstep(0.5, 0.8, fbm(p)) * uCloud * smoothstep(0.02, 0.2, e);
          c = mix(c, mix(uHor, vec3(1.0), 0.45), cl);
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
    const sky = mesh(new THREE.SphereGeometry(220, 32, 16), this.skyMat, 300, 0, 0, G)
    sky.renderOrder = -1

    // ——— Ground: the square's paving, the street, sidewalks, tram rails ———
    const ground = mesh(new THREE.PlaneGeometry(90, 70), this.pavingMat, 300, 0, -5, G)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    const road = mesh(new THREE.PlaneGeometry(3.6, 30), asphalt, 300, 0.005, 25.3, G)
    road.rotation.x = -Math.PI / 2
    road.receiveShadow = true
    for (const sx of [-1, 1]) {
      const kerb = box(1.2, 0.12, 30, stoneDark, 300 + sx * 2.4, 0.06, 25.3, G)
      kerb.receiveShadow = true
    }
    for (const z of [1.5, 2.5]) {
      const rail = box(70, 0.02, 0.07, steel, 300, 0.01, z, G)
      rail.receiveShadow = true
    }

    // ——— The clock tower ———
    const towerFull = new THREE.Group()
    const towerBase = new THREE.Group()
    G.add(towerBase)
    towerBase.position.copy(TOWER)
    rbox(5.6, 1.0, 5.6, stoneDark, 0, 0.5, 0, towerBase, 0.03)
    rbox(5.0, 12.0, 5.0, stone, 0, 7.0, 0, towerBase, 0.02).castShadow = true
    rbox(5.4, 0.4, 5.4, stoneDark, 0, 13.2, 0, towerBase, 0.03)
    // Tall blind arches on the shaft.
    for (const sx of [-1, 1]) rbox(0.9, 6, 0.1, stoneDark, sx * 1.2, 7.5, 2.52, towerBase, 0.02)
    rbox(1.2, 2.4, 0.12, new THREE.MeshStandardMaterial({ color: 0x2a221c, roughness: 0.8 }), 0, 1.2, 2.52, towerBase, 0.02)
    // Upper shaft with the clock (the part that survives up to 16.5 m in 1944).
    rbox(4.4, 3.1, 4.4, stone, 0, 14.95, 0, towerBase, 0.02).castShadow = true
    this.towerClock = new THREE.MeshStandardMaterial({ roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.05 })
    const dial = mesh(new THREE.CircleGeometry(1.1, 48), this.towerClock, 0, 15, 2.215, towerBase)
    dial.name = 'tower-dial'
    const dialRing = mesh(new THREE.TorusGeometry(1.12, 0.06, 8, 48), stoneDark, 0, 15, 2.22, towerBase)
    dialRing.castShadow = true
    // The top third (gone in 1944): upper shaft, belfry, roof.
    towerFull.position.copy(TOWER)
    rbox(4.4, 1.6, 4.4, stone, 0, 17.3, 0, towerFull, 0.02)
    rbox(4.8, 0.3, 4.8, stoneDark, 0, 18.25, 0, towerFull, 0.02)
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      rbox(0.9, 2.2, 0.9, stone, sx * 1.75, 19.5, sz * 1.75, towerFull, 0.02)
    rbox(2.6, 2.2, 2.6, new THREE.MeshStandardMaterial({ color: 0x1b1814, roughness: 1 }), 0, 19.5, 0, towerFull, 0.01)
    rbox(4.8, 0.35, 4.8, stoneDark, 0, 20.75, 0, towerFull, 0.02)
    const roof = mesh(new THREE.ConeGeometry(3.3, 1.6, 4, 1), pbr('metal', 0x4c5a55, { roughness: 0.6 }), 0, 21.7, 0, towerFull)
    roof.rotation.y = Math.PI / 4
    cyl(0.04, 0.04, 1.2, iron, 0, 23.0, 0, towerFull, 6)
    towerFull.traverse((o) => ((o as THREE.Mesh).castShadow = true))
    this.add(towerFull, E(0, 1, 2, 4, 5, 6, 7, 8))
    // 1944: the broken top.
    const broken = new THREE.Group()
    broken.position.copy(TOWER)
    for (let i = 0; i < 9; i++) {
      const w = 0.6 + rand() * 1.2
      const h = 0.4 + rand() * 1.3
      const b = rbox(w, h, 0.5 + rand() * 0.8, stone, (rand() - 0.5) * 3.6, 16.5 + h / 2 - 0.2, (rand() - 0.5) * 3.6, broken, 0.05)
      b.rotation.set(rand() * 0.3, rand() * 3, rand() * 0.3)
    }
    // Rubble mounds at the tower's foot and across the square.
    const rubbleGeo = new THREE.DodecahedronGeometry(0.5, 0)
    const rubble = new THREE.InstancedMesh(rubbleGeo, stone, 160)
    for (let i = 0; i < 160; i++) {
      const cluster = i < 90 ? 0 : i < 125 ? 1 : 2
      const c = [
        [300, -15.5, 4],
        [292, -9, 2.5],
        [310, 2, 2.2],
      ][cluster]
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * c[2]
      this.dummy.position.set(c[0] + Math.cos(a) * r, rand() * 0.6 * (1 - r / c[2]) + 0.1, c[1] + Math.sin(a) * r)
      this.dummy.rotation.set(rand() * 3, rand() * 3, rand() * 3)
      this.dummy.scale.set(0.4 + rand() * 1.2, 0.3 + rand() * 0.7, 0.4 + rand() * 1.0)
      this.dummy.updateMatrix()
      rubble.setMatrixAt(i, this.dummy.matrix)
    }
    rubble.castShadow = true
    rubble.receiveShadow = true
    broken.add(rubble)
    broken.traverse((o) => ((o as THREE.Mesh).castShadow = true))
    // The rubble cluster positions are absolute: undo the tower offset for it.
    rubble.position.set(-TOWER.x, 0, -TOWER.z)
    this.add(broken, E(3))
    // 1962: scaffolding around the rebuilt top.
    const scaff = new THREE.Group()
    scaff.position.copy(TOWER)
    const pole = new THREE.CylinderGeometry(0.035, 0.035, 1, 6)
    const poleMat = pbr('metal', 0x8d8a82, { roughness: 0.5 })
    const poles = new THREE.InstancedMesh(pole, poleMat, 200)
    let pi = 0
    const put = (x: number, y: number, z: number, len: number, axis: 'x' | 'y' | 'z') => {
      this.dummy.position.set(x, y, z)
      this.dummy.rotation.set(axis === 'z' ? Math.PI / 2 : 0, 0, axis === 'x' ? Math.PI / 2 : 0)
      this.dummy.scale.set(1, len, 1)
      this.dummy.updateMatrix()
      poles.setMatrixAt(pi++, this.dummy.matrix)
    }
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) for (const k of [-1, 0, 1]) put(sx * 2.9, 17, k * 2.9 * 0.66 + sz * 0.01, 11, 'y')
    for (let y = 12; y <= 22; y += 1.6)
      for (const s of [-1, 1]) {
        put(s * 2.9, y, 0, 5.8, 'z')
        put(0, y, s * 2.9, 5.8, 'x')
      }
    poles.count = pi
    poles.castShadow = true
    scaff.add(poles)
    for (let y = 13.6; y <= 22; y += 3.2)
      for (const s of [-1, 1]) {
        rbox(5.8, 0.05, 0.5, wood, 0, y, s * 2.7, scaff, 0.01)
        rbox(0.5, 0.05, 5.8, wood, s * 2.7, y, 0, scaff, 0.01)
      }
    this.add(scaff, E(4))

    // Clock textures per era (tower and the street clock show the same time).
    for (const era of ERA_LOOKS.keys()) this.clocks.push(clockFace(ERA_LOOKS[era].time[0], ERA_LOOKS[era].time[1], era === 3))

    // ——— The fountain ———
    const fountain = new THREE.Group()
    fountain.position.copy(FOUNTAIN)
    G.add(fountain)
    const basin = turned(
      [
        [2.2, 0],
        [2.5, 0],
        [2.5, 0.5],
        [2.35, 0.55],
        [2.2, 0.5],
        [2.2, 0.12],
      ],
      stone,
      64,
      fountain,
    )
    basin.castShadow = true
    basin.receiveShadow = true
    const ped = turned(
      [
        [0, 0],
        [0.5, 0],
        [0.4, 0.3],
        [0.25, 0.5],
        [0.22, 1.4],
        [0.3, 1.5],
        [1.0, 1.6],
        [1.05, 1.72],
        [0.9, 1.75],
        [0.2, 1.8],
        [0.12, 2.3],
        [0.2, 2.5],
        [0.0, 2.55],
      ],
      stone,
      40,
      fountain,
    )
    ped.castShadow = true
    const water = new THREE.MeshStandardMaterial({ color: 0x1a2a30, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.88 })
    const pool = mesh(new THREE.CircleGeometry(2.21, 48), water, 0, 0.4, 0, fountain)
    pool.rotation.x = -Math.PI / 2
    this.add(pool, E(0, 1, 2, 4, 5, 6, 7, 8))
    // Falling water sheets from the bowl.
    const sheetMat = new THREE.MeshBasicMaterial({ color: 0xc8d4d8, transparent: true, opacity: 0.35, depthWrite: false })
    const sheet = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.1, 1.2, 40, 1, true), sheetMat)
    sheet.position.set(FOUNTAIN.x, 1.0, FOUNTAIN.z)
    this.add(sheet, E(0, 4, 7))
    // 1944 crack: a dark wedge and a broken piece.
    const crack = rbox(0.12, 0.55, 0.6, new THREE.MeshStandardMaterial({ color: 0x0e0d0c }), FOUNTAIN.x + 2.36, 0.27, FOUNTAIN.z + 0.4, undefined, 0.01)
    crack.rotation.y = 0.15
    this.add(crack, E(3))
    const shard = rbox(0.9, 0.4, 0.3, stone, FOUNTAIN.x + 2.9, 0.2, FOUNTAIN.z + 0.9, undefined, 0.04)
    shard.rotation.set(0.2, 0.7, 0.4)
    this.add(shard, E(3))

    // ——— The bank (left): steps, columns, pediment, a door ———
    const bank = new THREE.Group()
    G.add(bank)
    rbox(8, 15, 12.4, plaster(0xd8cfbf), 278, 7.5, -8, bank, 0.02).castShadow = true
    for (let s = 0; s < 5; s++) rbox(2.5 - s * 0.45, 0.18, 7.0 - s * 0.2, stone, 283.25 - s * 0.225 + 0.2, 0.09 + s * 0.18, -8, bank, 0.01).receiveShadow = true
    rbox(1.2, 0.9, 12.4, stone, 282.6, 0.45, -8, bank, 0.02)
    for (let i = 0; i < 6; i++) {
      const z = -12.2 + i * 1.68
      if (Math.abs(z + 8) < 0.6) continue
      const col = cyl(0.32, 0.36, 8.2, stone, 282.9, 0.9 + 4.1, z, bank, 24)
      col.castShadow = true
      cyl(0.45, 0.45, 0.3, stoneDark, 282.9, 9.15, z, bank, 4).rotation.y = Math.PI / 4
    }
    rbox(1.4, 1.2, 12.8, stone, 282.9, 9.9, -8, bank, 0.03)
    const ped2 = new THREE.Shape()
    ped2.moveTo(-6.4, 0)
    ped2.lineTo(6.4, 0)
    ped2.lineTo(0, 2.2)
    ped2.closePath()
    const pedGeo = new THREE.ExtrudeGeometry(ped2, { depth: 1.2, bevelEnabled: false })
    pedGeo.rotateY(Math.PI / 2)
    mesh(pedGeo, stone, 282.3, 10.5, -8, bank).castShadow = true
    const bankDoor = rbox(0.12, 3.4, 2.0, new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.6 }), 282.06, 2.6, -8, bank, 0.02)
    bankDoor.name = 'bank-door'
    for (const dz of [-3.6, 3.6]) rbox(0.1, 2.2, 1.0, new THREE.MeshStandardMaterial({ color: 0x0d1114, roughness: 0.1, metalness: 0.5 }), 282.06, 4.2, -8 + dz, bank, 0.01)
    const bankSign = mesh(new THREE.PlaneGeometry(4.6, 0.55), new THREE.MeshStandardMaterial({ map: signTexture('BANKA', '#d4cab8', '#2a241c', 1024, 128), roughness: 0.8 }), 282.25, 8.95, -8, bank)
    bankSign.rotation.y = Math.PI / 2

    // ——— Facades round the square ———
    const walls = [0xcbbba0, 0xb9a58a, 0xd2c6b0, 0xa89a86, 0xc4b49c, 0xb6aa98]
    const rows: Array<{ x: number; z: number; w: number; h: number; d: number; facing: 1 | -1; rotY: number }> = [
      // Left side (x 282 facing +x), beside the bank.
      { x: 279, z: -16.5, w: 5, h: 16, d: 6, facing: 1, rotY: 0 },
      { x: 279, z: 4.15, w: 12.3, h: 13, d: 6, facing: 1, rotY: 0 },
      // Right side (x 318 facing −x).
      { x: 321, z: -14, w: 10, h: 15, d: 6, facing: -1, rotY: 0 },
      { x: 321, z: -3, w: 12, h: 13, d: 6, facing: -1, rotY: 0 },
      { x: 321, z: 6.2, w: 8.2, h: 14, d: 6, facing: -1, rotY: 0 },
      // Back (z −22 facing +z), left and right of the tower.
      { x: 289.5, z: -24, w: 15, h: 14, d: 6, facing: 1, rotY: -Math.PI / 2 },
      { x: 310.5, z: -24, w: 15, h: 15, d: 6, facing: 1, rotY: -Math.PI / 2 },
      // Front, left of the street (z 10.3 facing −z).
      { x: 289.5, z: 13.3, w: 15, h: 13, d: 6, facing: 1, rotY: Math.PI / 2 },
      // Street sides behind the camera.
      { x: 294, z: 21, w: 9.4, h: 12, d: 6, facing: 1, rotY: 0 },
      { x: 294, z: 33, w: 14, h: 14, d: 6, facing: 1, rotY: 0 },
      { x: 306, z: 31.4, w: 15, h: 13, d: 6, facing: -1, rotY: 0 },
    ]
    rows.forEach((r, i) => {
      const f = facade({ w: r.w, h: r.h, d: r.d, wall: plaster(walls[i % walls.length]), facing: r.facing, seed: 40 + i, lit: 0, floorH: 3.4 })
      f.position.set(r.x, 0, r.z)
      f.rotation.y = r.rotY
      f.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.isMesh) {
          m.castShadow = true
          m.receiveShadow = true
        }
      })
      G.add(f)
    })
    // 2029: glass curtain walls on two buildings, screens on two others.
    const glassWall = new THREE.MeshStandardMaterial({ color: 0x5f7584, roughness: 0.06, metalness: 0.9, envMapIntensity: 1.6 })
    const glassA = rbox(0.3, 15.2, 10.2, glassWall, 317.85, 7.6, -14, undefined, 0.01)
    const glassB = rbox(15.2, 14.2, 0.3, glassWall, 310.5, 7.1, -20.85, undefined, 0.01)
    for (const gw of [glassA, glassB]) this.add(gw, E(7, 8))
    // Mullions on the glass.
    const mull = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 1, 0.06), iron, 60)
    let mi = 0
    for (let k = 0; k < 9; k++) {
      this.dummy.position.set(317.68, 7.6, -18.5 + k * 1.15)
      this.dummy.rotation.set(0, 0, 0)
      this.dummy.scale.set(1, 15.2, 1)
      this.dummy.updateMatrix()
      mull.setMatrixAt(mi++, this.dummy.matrix)
    }
    for (let k = 0; k < 13; k++) {
      this.dummy.position.set(303.6 + k * 1.15, 7.1, -20.68)
      this.dummy.scale.set(1, 14.2, 1)
      this.dummy.updateMatrix()
      mull.setMatrixAt(mi++, this.dummy.matrix)
    }
    mull.count = mi
    this.add(mull, E(7, 8))
    const screenMat = new THREE.MeshBasicMaterial({ map: signTexture('— 2029 —', '#0d1a24', '#9fc8e0', 512, 288, 'Arial, sans-serif'), toneMapped: true })
    const scrA = mesh(new THREE.PlaneGeometry(4.2, 2.4), screenMat, 282.32, 9.2, 5.5)
    scrA.rotation.y = Math.PI / 2
    const scrB = mesh(new THREE.PlaneGeometry(3.6, 2.0), new THREE.MeshBasicMaterial({ color: 0x2c4a5a }), 317.68, 9.6, 6.0)
    scrB.rotation.y = -Math.PI / 2
    this.add(scrA, E(7))
    this.add(scrB, E(7))
    // Flags (1914) on the right facades.
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xb8332c, roughness: 0.9, side: THREE.DoubleSide })
    const flags = new THREE.Group()
    for (const [x, y, z] of [
      [317.6, 8.5, -10],
      [317.6, 8.5, -1],
      [282.4, 7.5, 1.5],
    ]) {
      const s = x > 300 ? -1 : 1
      const staff = cyl(0.025, 0.025, 2.2, iron, x + s * 0.7, y + 0.5, z, flags, 6)
      staff.rotation.z = s * 0.9
      const fl = mesh(new THREE.PlaneGeometry(1.2, 0.8), flagMat, x + s * 1.3, y + 0.3, z + 0.6, flags)
      fl.rotation.y = Math.PI / 2
    }
    this.add(flags, E(0))

    // ——— The corner bakery (right of the street, x ≥ 303, z ≥ 10.3) ———
    const bakery = new THREE.Group()
    G.add(bakery)
    // Upper floors over a custom ground floor.
    const upper = facade({ w: 13.7, h: 9, d: 7, wall: plaster(0xd8c6a6), facing: -1, seed: 9, lit: 0, ground: false, floorH: 3.2 })
    upper.position.set(306.5, 4, 17.15)
    bakery.add(upper)
    const upperFront = facade({ w: 15, h: 9, d: 2, wall: plaster(0xd8c6a6), facing: 1, seed: 19, lit: 0, ground: false, floorH: 3.2 })
    upperFront.position.set(310.5, 4, 11.3)
    upperFront.rotation.y = Math.PI / 2
    bakery.add(upperFront)
    const gf = plaster(0xc9b896)
    rbox(7, 4, 13.7, gf, 306.5, 2, 17.15, bakery, 0.02)
    rbox(15, 4, 2, gf, 310.5, 2, 11.3, bakery, 0.02)
    // The door (never changes) on the street side near the corner, a shop window, the sign board.
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3c2a1c, roughness: 0.65 })
    rbox(0.12, 2.5, 1.15, doorMat, 302.96, 1.25, 11.25, bakery, 0.02)
    rbox(0.1, 0.12, 1.4, stoneDark, 302.94, 2.56, 11.25, bakery, 0.02)
    mesh(new THREE.PlaneGeometry(0.75, 0.9), new THREE.MeshStandardMaterial({ color: 0x1e2428, roughness: 0.08, metalness: 0.5 }), 302.89, 1.85, 11.25, bakery).rotation.y = -Math.PI / 2
    const knob = cyl(0.03, 0.03, 0.06, pbr('metal', 0xb08a4a, { roughness: 0.35 }), 302.87, 1.1, 11.65, bakery, 10)
    knob.rotation.z = Math.PI / 2
    const shopWin = mesh(new THREE.PlaneGeometry(2.0, 1.9), new THREE.MeshStandardMaterial({ color: 0x2a3034, roughness: 0.06, metalness: 0.4, emissive: 0x5a4024, emissiveIntensity: 0.25 }), 302.95, 1.7, 12.85, bakery)
    shopWin.rotation.y = -Math.PI / 2
    rbox(0.14, 0.1, 2.2, stoneDark, 302.95, 0.7, 12.85, bakery, 0.02)
    // Boarded window in 1944 (and shutters in 1917, 1931, 2008).
    const boards = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const b = rbox(0.04, 0.22, 2.2, wood, 302.9, 0.9 + i * 0.3, 12.85, boards, 0.01)
      b.rotation.x = (rand() - 0.5) * 0.12
    }
    this.add(boards, E(3))
    const shutter = rbox(0.05, 1.95, 2.05, pbr('metal', 0x6d6f70, { roughness: 0.6 }), 302.9, 1.72, 12.85, undefined, 0.005)
    this.add(shutter, E(1, 2, 6))
    // Sign boards per era, on the street side above the door and window.
    const signs: Array<[string, string, string, EraSet]> = [
      ['FIRIN', '#3a2a1c', '#e8d8b0', E(0, 1, 2, 3)],
      ['YENİ FIRIN', '#efe6d2', '#7a2a1c', E(4, 5, 6)],
      ['FIRIN · KAFE', '#1d2a2e', '#d8efe8', E(7, 8)],
    ]
    for (const [text, bg, fg, eras] of signs) {
      const s = mesh(new THREE.PlaneGeometry(2.9, 0.55), new THREE.MeshStandardMaterial({ map: signTexture(text, bg, fg), roughness: 0.75 }), 302.88, 3.2, 12.15)
      s.rotation.y = -Math.PI / 2
      this.add(s, eras)
    }
    // The awning (1914).
    const awning = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.0), new THREE.MeshStandardMaterial({ map: signTexture('', '#8b2b24', '#e9dccb', 64, 64), color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9 }))
    awning.position.set(302.45, 2.75, 12.15)
    awning.rotation.set(0, -Math.PI / 2, 0)
    awning.rotateX(-0.5)
    this.add(awning, E(0))
    bakery.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })

    // ——— The street clock (post never changes; leans and stops in 1944) ———
    const post = new THREE.Group()
    post.position.set(302.2, 0, 11.4)
    G.add(post)
    post.add(this.streetClockPivot)
    const P = this.streetClockPivot
    cyl(0.12, 0.16, 0.5, iron, 0, 0.25, 0, P, 16)
    cyl(0.05, 0.07, 2.6, iron, 0, 1.6, 0, P, 12)
    rbox(0.72, 0.72, 0.18, iron, 0, 3.0, 0, P, 0.08)
    this.streetClock = new THREE.MeshStandardMaterial({ roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.05 })
    for (const s of [1, -1]) {
      const f = mesh(new THREE.CircleGeometry(0.29, 40), this.streetClock, 0, 3.0, s * 0.092, P)
      if (s < 0) f.rotation.y = Math.PI
    }
    cyl(0.04, 0.02, 0.25, iron, 0, 3.47, 0, P, 8)

    // ——— Trees (bare in 1931, gone in 1944) ———
    const trunkMat = pbr('wood', 0x3c3026, { roughness: 1 })
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4d6a3a, roughness: 0.9 })
    const treesLeaf = new THREE.Group()
    const treesBare = new THREE.Group()
    for (const [x, z] of [
      [287, -1],
      [313, -1],
      [287, 7],
      [313, 7],
    ]) {
      for (const [grp, leaf] of [
        [treesLeaf, true],
        [treesBare, false],
      ] as const) {
        const t = new THREE.Group()
        t.position.set(x, 0, z)
        grp.add(t)
        cyl(0.14, 0.2, 3.4, trunkMat, 0, 1.7, 0, t, 10).castShadow = true
        for (let b = 0; b < 5; b++) {
          const br = cyl(0.04, 0.07, 1.6, trunkMat, 0, 3.6, 0, t, 6)
          br.rotation.set(0.6, (b / 5) * Math.PI * 2, 0)
          br.position.set(Math.cos(b) * 0.3, 3.6, Math.sin(b) * 0.3)
        }
        if (leaf) {
          const crown = mesh(new THREE.IcosahedronGeometry(1.9, 1), leafMat, 0, 4.6, 0, t)
          crown.scale.set(1, 0.85, 1)
          crown.castShadow = true
        }
      }
    }
    this.add(treesLeaf, E(0, 4, 6, 7))
    this.add(treesBare, E(1, 2, 5, 8))

    // ——— Vehicles ———
    const glassM = new THREE.MeshStandardMaterial({ color: 0x1a2228, roughness: 0.05, metalness: 0.3 })
    const tire = pbr('rubber', 0x111111)
    const lightM = new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0x332a1c })
    // 1914 tram on the rails.
    const tram = new THREE.Group()
    tram.position.set(308, 0, 2)
    rbox(9, 2.6, 2.3, plaster(0x8a3328), 0, 1.75, 0, tram, 0.15)
    rbox(9.2, 0.25, 2.4, pbr('painted', 0xd8cfb8, { roughness: 0.7 }), 0, 3.15, 0, tram, 0.1)
    for (let i = 0; i < 6; i++) mesh(new THREE.PlaneGeometry(1.0, 0.9), glassM, -3.6 + i * 1.45, 2.3, 1.16, tram)
    rbox(8.6, 0.4, 2.0, iron, 0, 0.35, 0, tram, 0.05)
    pantograph(tram, iron)
    tram.traverse((o) => ((o as THREE.Mesh).castShadow = true))
    this.add(tram, E(0))
    // 1917 military truck by the fountain.
    const truck = new THREE.Group()
    truck.position.set(305.5, 0, -2)
    truck.rotation.y = -0.4
    const olive = pbr('painted', 0x4a4c36, { roughness: 0.85 })
    rbox(2.1, 1.0, 5.4, olive, 0, 1.0, 0, truck, 0.04)
    rbox(2.0, 1.2, 1.6, olive, 0, 1.9, 1.7, truck, 0.05)
    rbox(2.2, 1.7, 3.4, pbr('fabric', 0x5a5a44, { roughness: 1 }), 0, 2.2, -0.9, truck, 0.2)
    for (const sx of [-1, 1]) for (const z of [-1.7, 1.6]) cyl(0.45, 0.45, 0.3, tire, sx * 1.05, 0.45, z, truck, 18).rotation.z = Math.PI / 2
    truck.traverse((o) => ((o as THREE.Mesh).castShadow = true))
    this.add(truck, E(1))
    // 1962 car.
    const car62 = car(pbr('painted', 0x7c9aa6, { roughness: 0.35 }), glassM, tire, lightM)
    car62.position.set(293, 0, 6.5)
    car62.rotation.y = Math.PI / 2 + 0.1
    this.add(car62, E(4))
    // 2029 car.
    const car29 = car(pbr('painted', 0xd9dcdf, { roughness: 0.3 }), glassM, tire, lightM)
    car29.position.set(309, 0, 7.5)
    car29.rotation.y = -Math.PI / 2
    this.add(car29, E(7))
    // 1991 burnt car and barricades across the rails.
    const burnt = car(new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 1 }), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 }), tire, new THREE.MeshStandardMaterial({ color: 0x111111 }))
    burnt.position.set(306, 0, 4.8)
    burnt.rotation.set(0, 0.6, 0.06)
    this.add(burnt, E(5))
    const barricade = new THREE.Group()
    for (let i = 0; i < 7; i++) {
      const b = rbox(2.2 + rand(), 0.9 + rand() * 0.4, 0.6, i % 2 ? wood : pbr('metal', 0x5a5650, { roughness: 0.7 }), 291 + i * 2.6, 0.5, 2 + (rand() - 0.5) * 0.8, barricade, 0.04)
      b.rotation.set((rand() - 0.5) * 0.2, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.3)
    }
    barricade.traverse((o) => ((o as THREE.Mesh).castShadow = true))
    this.add(barricade, E(5))
    // 2041 a fence across the square.
    const fence = new THREE.Group()
    for (let i = 0; i < 16; i++) {
      cyl(0.03, 0.03, 2.2, iron, 286 + i * 1.8, 1.1, -8.5, fence, 6)
      if (i < 15) mesh(new THREE.PlaneGeometry(1.8, 2.0), new THREE.MeshStandardMaterial({ color: 0x9aa0a4, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6 }), 286.9 + i * 1.8, 1.1, -8.5, fence)
    }
    this.add(fence, E(8))
    // Sodium street lamps (lit in 1991).
    const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.6, 0.25).multiplyScalar(2.5) })
    const lampOff = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.4 })
    for (const [x, z] of [...SODIUM, [315, -12] as const]) {
      const lp = new THREE.Group()
      lp.position.set(x, 0, z)
      G.add(lp)
      cyl(0.08, 0.12, 4.6, iron, 0, 2.3, 0, lp, 10)
      const headOff = mesh(new THREE.SphereGeometry(0.22, 16, 12), lampOff, 0, 4.8, 0, lp)
      const headOn = mesh(new THREE.SphereGeometry(0.22, 16, 12), lampMat, 0, 4.8, 0)
      lp.add(headOn)
      this.eraGroups.push({ g: headOn, eras: E(5) }, { g: headOff, eras: E(0, 1, 2, 3, 4, 6, 7, 8) })
    }

    // ——— People ———
    const body = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    const head = new THREE.MeshStandardMaterial({ color: 0xb08a72, roughness: 0.7 })
    const glow = new THREE.MeshBasicMaterial({ color: 0x9fc6e0 })
    this.crowd = new Crowd(40, body, head, glow)
    G.add(this.crowd.group)
    this.queue = new Crowd(14, body, head, glow)
    G.add(this.queue.group)
    this.runners = new Crowd(6, body, head, glow)
    G.add(this.runners.group)
    for (let i = 0; i < 40; i++) this.crowdCols.push(new THREE.Color())
    // Umbrellas for the 2008 queue.
    const umb = new THREE.Group()
    const umbMat = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.5, side: THREE.DoubleSide })
    for (let i = 0; i < 12; i++) {
      const q = queueSpot(i)
      const u = mesh(new THREE.ConeGeometry(0.55, 0.25, 8, 1, true), umbMat, q[0] + 0.1, 2.0, q[1], umb)
      u.castShadow = true
    }
    this.add(umb, E(6))

    // ——— Smoke (1917 and 2041, behind the tower), dust ———
    const smokeTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const x = c.getContext('2d')!
      const g = x.createRadialGradient(64, 64, 4, 64, 64, 62)
      g.addColorStop(0, 'rgba(255,255,255,0.9)')
      g.addColorStop(0.5, 'rgba(255,255,255,0.4)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.fillRect(0, 0, 128, 128)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })()
    this.smokeMat = new THREE.MeshBasicMaterial({ map: smokeTex, color: 0x3a3632, transparent: true, depthWrite: false, opacity: 0.85, fog: true })
    this.smoke = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), this.smokeMat, 36)
    this.smoke.frustumCulled = false
    this.add(this.smoke, E(1, 8))

    // ——— Rain (2008): streaks that fall and wrap ———
    const drops = 900
    const rainPos = new Float32Array(drops * 6)
    const rainEnd = new Float32Array(drops * 2)
    for (let i = 0; i < drops; i++) {
      const x = 290 + rand() * 20
      const y = rand() * 14
      const z = -8 + rand() * 24
      rainPos.set([x, y, z, x - 0.02, y, z], i * 6)
      rainEnd.set([0, 1], i * 2)
    }
    const rg = new THREE.BufferGeometry()
    rg.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
    rg.setAttribute('tail', new THREE.BufferAttribute(rainEnd, 1))
    this.rainMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: 'attribute float tail; uniform float uTime; void main(){ vec3 p = position; p.y = mod(p.y - uTime * 9.0, 14.0) - tail * 0.55; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
      fragmentShader: 'void main(){ gl_FragColor = vec4(0.8, 0.84, 0.88, 0.3); }',
    })
    this.rain = new THREE.LineSegments(rg, this.rainMat)
    this.rain.frustumCulled = false
    this.add(this.rain, E(6))

  }

  /** Puts the square in an era; `t` is time inside it (people drift a little). */
  setEra(era: number, t: number, time: number, scene: THREE.Scene, rig: { key: THREE.DirectionalLight; hemi: THREE.HemisphereLight; points: THREE.PointLight[] }) {
    const look = ERA_LOOKS[era]
    if (era !== this.era) {
      this.era = era
      for (const { g, eras } of this.eraGroups) g.visible = eras.has(era)
      this.towerClock.map = this.clocks[era]
      this.towerClock.emissiveMap = this.clocks[era]
      this.towerClock.needsUpdate = true
      this.streetClock.map = this.clocks[era]
      this.streetClock.emissiveMap = this.clocks[era]
      this.streetClock.needsUpdate = true
      this.streetClockPivot.rotation.z = era === 3 ? -0.14 : 0
      this.pavingMat.roughness = look.wet > 0.5 ? 0.35 : 0.9
      this.pavingMat.color.set(look.wet > 0.5 ? 0x6e6c68 : 0x9a9284)
      this.placePeople(era)
    }
    rig.key.position.set(300 + look.sunDir[0] * 60, look.sunDir[1] * 60, -4 + look.sunDir[2] * 60)
    rig.key.target.position.set(300, 0, -4)
    rig.key.color.set(look.sunCol)
    rig.key.intensity = look.sun
    rig.hemi.color.set(look.sky)
    rig.hemi.groundColor.set(look.ground)
    rig.hemi.intensity = look.hemi
    this.skyMat.uniforms.uTop.value.set(look.skyTop)
    this.skyMat.uniforms.uHor.value.set(look.sky)
    this.skyMat.uniforms.uSun.value.set(look.sunDir[0], look.sunDir[1], look.sunDir[2])
    this.skyMat.uniforms.uSunCol.value.set(look.sunCol).multiplyScalar(look.sun > 1.5 ? 1 : 0.2)
    this.skyMat.uniforms.uCloud.value = era === 1 || era === 2 || era === 6 ? 0.9 : era === 3 || era === 8 ? 0.2 : 0.5
    const fog = scene.fog as THREE.Fog
    fog.color.set(look.fog)
    fog.near = look.fogNear
    fog.far = look.fogFar
    // Sodium lamps (1991): three of the four lamps throw light.
    SODIUM.forEach(([x, z], i) => {
      const l = rig.points[i]
      if (!l) return
      l.position.set(x, 4.6, z)
      l.color.set(0xff9a40)
      l.distance = 18
      l.decay = 1.6
      l.intensity = era === 5 ? 30 : 0
    })
    // Smoke columns: rising puffs behind the tower.
    if (era === 1 || era === 8) {
      for (let i = 0; i < 36; i++) {
        const k = (i / 36 + time * 0.012) % 1
        const y = 8 + k * 26
        const spread = 1.5 + k * 7
        const s = 4 + k * 10
        this.dummy.position.set(297 + Math.sin(i * 2.3) * spread * 0.5 + k * 4, y, -34 + Math.cos(i * 1.7) * spread * 0.3)
        this.dummy.rotation.set(0, 0, i)
        this.dummy.scale.set(s, s, s)
        this.dummy.updateMatrix()
        this.smoke.setMatrixAt(i, this.dummy.matrix)
      }
      this.smoke.instanceMatrix.needsUpdate = true
      this.smokeMat.color.set(era === 8 ? 0x5a3a2a : 0x34312e)
    }
    this.rainMat.uniforms.uTime.value = time
    // People drift.
    if (era === 0 || era === 4 || era === 7) this.driftCrowd(era, t, time)
    if (era === 5) {
      for (let i = 0; i < 6; i++) {
        const k = (t * 0.6 + i * 0.17) % 1
        this.runners.set(i, 288 + k * 26, -15 + (i % 3) * 1.4, Math.PI / 2, { color: new THREE.Color(0x2a2a2e) })
      }
      this.runners.commit()
    }
  }

  private placePeople(era: number) {
    const rand = mulberry32(100 + era)
    const n = era === 0 ? 30 : era === 4 ? 24 : era === 7 ? 12 : 0
    for (let i = 0; i < 40; i++) {
      if (i >= n) {
        this.crowd.set(i, 0, 0, 0, { visible: false })
        continue
      }
      const palettes = [
        [0x2a2622, 0x4a3a2c, 0x6a5a48, 0x1e2024, 0x8a7a64],
        [],
        [],
        [],
        [0x3a4a5a, 0x8a5a3a, 0xc8b89a, 0x5a6a4a, 0x2a2a30],
        [],
        [],
        [0x2c3038, 0x8a9098, 0xd8d8d8, 0x4a5a6a, 0x1a1c20],
      ][era]
      this.crowdCols[i].set(palettes[Math.floor(rand() * palettes.length)] ?? 0x333333)
    }
    this.crowd.commit()
    // The queue at the bank door (1931 and 2008 share its shape).
    const q = era === 2 || era === 6 ? 12 : 0
    for (let i = 0; i < 14; i++) {
      if (i >= q) {
        this.queue.set(i, 0, 0, 0, { visible: false })
        continue
      }
      const [x, z, yaw] = queueSpot(i)
      this.queue.set(i, x, z, yaw, { color: new THREE.Color(era === 2 ? [0x2e2a26, 0x3a3630, 0x24221f][i % 3] : [0x1d2a3a, 0x3a3a3e, 0x5a2a2a][i % 3]), headDown: 0.4 })
    }
    this.queue.commit()
    for (let i = 0; i < 6; i++) this.runners.set(i, 0, 0, 0, { visible: era === 5 })
    this.runners.commit()
  }

  private driftCrowd(era: number, t: number, time: number) {
    const n = era === 0 ? 30 : era === 4 ? 24 : 12
    const rand = mulberry32(200 + era)
    for (let i = 0; i < n; i++) {
      const x0 = 285 + rand() * 30
      const z0 = -14 + rand() * 22
      const dir = rand() * Math.PI * 2
      const speed = 0.4 + rand() * 0.8
      const d = (t * 6 + time * 0.05) * speed
      let x = x0 + Math.sin(dir) * d
      let z = z0 + Math.cos(dir) * d
      // Keep them out of the fountain basin.
      const fx = x - FOUNTAIN.x
      const fz = z - FOUNTAIN.z
      const r = Math.hypot(fx, fz)
      if (r < 3.0) {
        x = FOUNTAIN.x + (fx / (r || 1)) * 3.0
        z = FOUNTAIN.z + (fz / (r || 1)) * 3.0
      }
      this.crowd.set(i, x, z, dir, { color: this.crowdCols[i], scale: 0.95 + rand() * 0.1 })
    }
    this.crowd.commit()
  }
}

/** Twelve places in a line down the bank's steps and out into the square. */
function queueSpot(i: number): [number, number, number] {
  if (i < 3) return [283.4 + i * 0.6, -8 + i * 0.15, -Math.PI / 2]
  const k = i - 3
  return [285.2 + k * 0.55, -7.4 + k * 0.62, -Math.PI / 2 - 0.6]
}

function pantograph(tram: THREE.Group, iron: THREE.Material) {
  // The pantograph on the roof.
  const a = rbox(0.05, 1.4, 0.05, iron, 0, 3.9, 0, tram, 0.01)
  a.rotation.z = 0.5
  rbox(1.2, 0.04, 0.06, iron, -0.3, 4.5, 0, tram, 0.01)
}

