/**
 * The network void at x 600: near-black space, small off-white nodes, thin
 * grey links. The square comes apart into points (every person, window,
 * vehicle a node), the points lift away and link across the years, gather
 * into a helix — 1914 at the bottom, this evening at the top, events of a
 * kind at the same angle — which from above is a single circle. Above its
 * end, at (606, 15.6, 0): one more node, pale red, linked to nothing.
 */
import * as THREE from 'three'
import { clamp, mulberry32, smoothstep } from '@/lib/math'

export const HELIX = { x: 600, z: 0, r: 6, rise: 1.25, turns: 12 }
export const TODAY = new THREE.Vector3(606, 15, 0)
export const ANOMALY = new THREE.Vector3(606, 15.6, 0)
/** Where the square's point picture sits (the square's camera maps onto the void's). */
export const SQUARE_TO_VOID = new THREE.Vector3(300, 4.3, 6)

const MAIN: Array<{ year: string; turn: number; deg: number; kind: 'war' | 'crisis' | 'rebuild' | 'today' | 'start' }> = [
  { year: '1914', turn: 0, deg: 90, kind: 'start' },
  { year: '1917', turn: 1, deg: 90, kind: 'war' },
  { year: '1931', turn: 2, deg: 180, kind: 'crisis' },
  { year: '1944', turn: 4, deg: 90, kind: 'war' },
  { year: '1962', turn: 5, deg: 270, kind: 'rebuild' },
  { year: '1991', turn: 7, deg: 90, kind: 'war' },
  { year: '2008', turn: 8, deg: 180, kind: 'crisis' },
  { year: '2029', turn: 10, deg: 270, kind: 'rebuild' },
  { year: '2041', turn: 11, deg: 90, kind: 'war' },
  { year: '2047', turn: 12, deg: 0, kind: 'today' },
]

const helixPoint = (turn: number, deg: number, out: THREE.Vector3) => {
  const a = (deg * Math.PI) / 180
  const y = (turn + deg / 360) * HELIX.rise
  return out.set(HELIX.x + Math.cos(a) * HELIX.r, Math.min(15, y), HELIX.z + Math.sin(a) * HELIX.r)
}

function labelSprite(text: string, color = '#d8dadc') {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 96
  const g = c.getContext('2d')!
  g.fillStyle = color
  g.font = '500 54px ui-monospace, Menlo, Consolas, monospace'
  g.textBaseline = 'middle'
  g.fillText(text, 12, 50)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0, fog: false })
  const s = new THREE.Sprite(m)
  s.scale.set(1.6, 0.6, 1)
  s.center.set(0, 0.5)
  return s
}

type Node = { square: THREE.Vector3; net: THREE.Vector3; helix: THREE.Vector3; size: number; year: number; main: number; gone: boolean }

export class NetworkSet {
  readonly group = new THREE.Group()
  private nodes: Node[] = []
  private mesh!: THREE.InstancedMesh
  private links!: THREE.LineSegments
  private linkMat!: THREE.LineBasicMaterial
  private newest!: THREE.Line
  private newestMat!: THREE.LineBasicMaterial
  private pairs: Array<[number, number]> = []
  private stackLines!: THREE.LineSegments
  private stackMat!: THREE.LineBasicMaterial
  private labels: THREE.Sprite[] = []
  private anomaly!: THREE.Mesh
  private anomalyMat!: THREE.MeshBasicMaterial
  private cursor!: THREE.Sprite
  private halo!: THREE.Mesh
  private haloMat!: THREE.MeshBasicMaterial
  private dummy = new THREE.Object3D()
  private col = new THREE.Color()
  private pos: THREE.Vector3[] = []
  private todayIndex = 0

  build() {
    const G = this.group
    const rand = mulberry32(2047)
    const N = 560
    const v = new THREE.Vector3()
    // The square as points (in square space; shifted into the void).
    const squarePts: THREE.Vector3[] = []
    const push = (x: number, y: number, z: number) => squarePts.push(new THREE.Vector3(x, y, z).add(SQUARE_TO_VOID))
    // Tower outline and clock.
    for (let i = 0; i < 70; i++) {
      const y = rand() * 22
      const half = y > 18 ? 2.4 * (1 - (y - 18) / 5) : y > 13 ? 2.2 : 2.5
      const side = rand() < 0.5 ? -1 : 1
      push(300 + side * half * (rand() < 0.7 ? 1 : rand()), y, -17.5)
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      push(300 + Math.cos(a) * 1.1, 15 + Math.sin(a) * 1.1, -17.4)
    }
    // Fountain rim and pedestal.
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2
      push(300 + Math.cos(a) * 2.5, 0.5, -4 + Math.sin(a) * 2.5)
    }
    for (let i = 0; i < 8; i++) push(300, 0.4 + i * 0.28, -4)
    // Windows on the facades round the square.
    for (let i = 0; i < 150; i++) {
      const r = rand()
      if (r < 0.3) push(282.1, 4.5 + Math.floor(rand() * 3) * 3.4, -19 + rand() * 29)
      else if (r < 0.6) push(317.9, 4.5 + Math.floor(rand() * 3) * 3.4, -19 + rand() * 29)
      else if (r < 0.85) push(282 + rand() * 36 * (rand() < 0.5 ? 0.42 : 1) + (rand() < 0.5 ? 0 : 0), 4.5 + Math.floor(rand() * 3) * 3.4, -21)
      else push(303 + rand() * 0.1, 1 + rand() * 11, 10.4 + rand() * 6)
    }
    // People and vehicles on the ground.
    for (let i = 0; i < 70; i++) push(285 + rand() * 30, 1 + rand() * 0.7, -14 + rand() * 22)
    for (let i = 0; i < 20; i++) push(296 + rand() * 9, 1 + rand() * 1.6, 1 + rand() * 2)

    // Main nodes first.
    MAIN.forEach((m, i) => {
      const helix = helixPoint(m.turn, m.deg, new THREE.Vector3())
      if (m.kind === 'today') this.todayIndex = i
      this.nodes.push({ square: squarePts[i * 7 % squarePts.length].clone(), net: new THREE.Vector3(), helix, size: m.kind === 'today' ? 0.085 : 0.075, year: 1914 + i * 14, main: i, gone: false })
    })
    while (this.nodes.length < N) {
      const i = this.nodes.length
      // Along the helix, gathered at the angles where events of a kind sit.
      const turn = rand() * HELIX.turns
      const pick = rand()
      const deg = pick < 0.5 ? [90, 180, 270][Math.floor(rand() * 3)] + (rand() - 0.5) * 22 : rand() * 360
      const t = Math.floor(turn)
      const helix = helixPoint(t, deg, new THREE.Vector3())
      helix.x += (rand() - 0.5) * 0.25
      helix.z += (rand() - 0.5) * 0.25
      helix.y = clamp(helix.y + (rand() - 0.5) * 0.15, 0, 14.95)
      this.nodes.push({ square: (squarePts[i % squarePts.length] ?? v).clone(), net: new THREE.Vector3(), helix, size: 0.04 + rand() * 0.03, year: 1914 + Math.floor(rand() * 133), main: -1, gone: false })
    }
    // The free network: a loose cloud around (600, 7, 0).
    for (const n of this.nodes) {
      const a = rand() * Math.PI * 2
      const r = Math.pow(rand(), 0.6) * 8
      n.net.set(600 + Math.cos(a) * r, 7 + (rand() - 0.5) * 9, Math.sin(a) * r * 0.8)
      this.pos.push(n.net.clone())
    }
    // Nodes that will be deleted (a gap on one side of the web).
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i]
      if (n.main < 0 && n.net.x > 603 && n.net.y > 8 && n.net.y < 11.5 && rand() < 0.8) n.gone = true
    }

    const geo = new THREE.SphereGeometry(1, 12, 8)
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), this.nodes.length)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.nodes.length * 3), 3)
    this.mesh.frustumCulled = false
    G.add(this.mesh)

    // Links across years.
    while (this.pairs.length < 820) {
      const a = Math.floor(rand() * this.nodes.length)
      const b = Math.floor(rand() * this.nodes.length)
      if (a === b || Math.abs(this.nodes[a].year - this.nodes[b].year) < 8) continue
      if (this.nodes[a].net.distanceTo(this.nodes[b].net) > 7) continue
      this.pairs.push([a, b])
    }
    const lp = new Float32Array(this.pairs.length * 6)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.BufferAttribute(lp, 3))
    this.linkMat = new THREE.LineBasicMaterial({ color: 0x8a8d90, transparent: true, opacity: 0.25, depthWrite: false, fog: false })
    this.links = new THREE.LineSegments(lg, this.linkMat)
    this.links.frustumCulled = false
    G.add(this.links)
    const ng = new THREE.BufferGeometry()
    ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    this.newestMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, fog: false })
    this.newest = new THREE.Line(ng, this.newestMat)
    this.newest.frustumCulled = false
    G.add(this.newest)
    // Faint verticals through the stacked events (wars at 90°, crises at 180°, rebuilding at 270°).
    const sp: number[] = []
    for (const deg of [90, 180, 270, 0]) {
      const a = (deg * Math.PI) / 180
      sp.push(HELIX.x + Math.cos(a) * HELIX.r, 0, Math.sin(a) * HELIX.r, HELIX.x + Math.cos(a) * HELIX.r, 15, Math.sin(a) * HELIX.r)
    }
    // And the helix itself, as a thin line.
    const helixLine: number[] = []
    const prev = new THREE.Vector3()
    const cur = new THREE.Vector3()
    for (let s = 0; s <= 12 * 96; s++) {
      const deg = (s / 96) * 360
      helixPoint(Math.floor(deg / 360), deg % 360, cur)
      if (s > 0) helixLine.push(prev.x, prev.y, prev.z, cur.x, cur.y, cur.z)
      prev.copy(cur)
    }
    const sg = new THREE.BufferGeometry()
    sg.setAttribute('position', new THREE.Float32BufferAttribute([...sp, ...helixLine], 3))
    this.stackMat = new THREE.LineBasicMaterial({ color: 0x9a9da0, transparent: true, opacity: 0, depthWrite: false, fog: false })
    this.stackLines = new THREE.LineSegments(sg, this.stackMat)
    this.stackLines.frustumCulled = false
    G.add(this.stackLines)
    // Year labels beside the main nodes.
    for (const m of MAIN) {
      const s = labelSprite(m.year === '2047' ? '2047 · BUGÜN' : m.year)
      if (m.year === '2047') s.scale.set(2.6, 0.6, 1)
      const p = helixPoint(m.turn, m.deg, new THREE.Vector3())
      s.position.set(p.x + 0.25, p.y + 0.18, p.z)
      G.add(s)
      this.labels.push(s)
    }
    // The anomaly: pale red, linked to nothing; a cursor blinking beside it.
    this.anomalyMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.32, 0.28).multiplyScalar(1.6), transparent: true, opacity: 0, fog: false })
    this.anomaly = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), this.anomalyMat)
    this.anomaly.position.copy(ANOMALY)
    G.add(this.anomaly)
    const cc = document.createElement('canvas')
    cc.width = 64
    cc.height = 128
    const cg = cc.getContext('2d')!
    cg.fillStyle = '#ffd8d0'
    cg.fillRect(20, 16, 22, 96)
    const ct = new THREE.CanvasTexture(cc)
    ct.colorSpace = THREE.SRGBColorSpace
    this.cursor = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, transparent: true, depthWrite: false, opacity: 0, fog: false }))
    this.cursor.scale.set(0.09, 0.18, 1)
    this.cursor.position.set(ANOMALY.x + 0.28, ANOMALY.y, ANOMALY.z)
    G.add(this.cursor)
    this.haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false })
    this.halo = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 40), this.haloMat)
    this.halo.position.copy(TODAY)
    G.add(this.halo)
  }

  /**
   * dissolve 0 → 1: square points lift into the free network.
   * grow 0 → 1: links appear. gather 0 → 1: the network folds into the helix.
   * deleted 0 → 1: the gap. labels, pulse (today), anomaly (0 none … 1 shown), camera for billboards.
   */
  update(o: { dissolve: number; grow: number; gather: number; deleted: number; labels: number; pulse: number; anomaly: number; time: number; camera: THREE.Vector3; flat: number }) {
    const ed = o.dissolve * o.dissolve * (3 - 2 * o.dissolve)
    const eg = o.gather * o.gather * (3 - 2 * o.gather)
    const n = this.nodes.length
    for (let i = 0; i < n; i++) {
      const nd = this.nodes[i]
      const p = this.pos[i]
      p.lerpVectors(nd.square, nd.net, ed)
      // A slow drift while free.
      const drift = (1 - eg) * ed
      p.x += Math.sin(o.time * 0.3 + i) * 0.06 * drift
      p.y += Math.cos(o.time * 0.25 + i * 1.3) * 0.06 * drift
      p.lerp(nd.helix, eg)
      let s = nd.size * (0.8 + 0.4 * ed)
      let bright = nd.main >= 0 ? 1 : 0.72 + 0.28 * Math.sin(i * 12.9)
      if (nd.gone && o.deleted > 0) {
        const flick = o.deleted < 0.6 ? (Math.sin(o.time * 30 + i) > 0 ? 1 : 0.2) : 0
        s *= o.deleted < 0.6 ? 1 : 0
        bright *= flick
      }
      if (nd.gone && o.gather > 0) s = 0
      if (i === this.todayIndex) {
        s *= 1 + o.pulse * 0.9
        bright = 1 + o.pulse * 0.6
      }
      // Main nodes stand out more as the helix forms.
      if (nd.main >= 0) s *= 1 + eg * 0.4
      this.dummy.position.copy(p)
      this.dummy.scale.setScalar(Math.max(0.0001, s))
      this.dummy.updateMatrix()
      this.mesh.setMatrixAt(i, this.dummy.matrix)
      this.col.setRGB(0.92 * bright, 0.92 * bright, 0.9 * bright)
      this.mesh.setColorAt(i, this.col)
    }
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
    // Links: more of them as the web grows; gone with deleted nodes; fading as the helix gathers.
    const shown = Math.floor(this.pairs.length * clamp(o.grow))
    const arr = (this.links.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
    let k = 0
    for (let j = 0; j < shown; j++) {
      const [a, b] = this.pairs[j]
      if ((this.nodes[a].gone || this.nodes[b].gone) && o.deleted > 0.6) continue
      const pa = this.pos[a]
      const pb = this.pos[b]
      arr[k++] = pa.x
      arr[k++] = pa.y
      arr[k++] = pa.z
      arr[k++] = pb.x
      arr[k++] = pb.y
      arr[k++] = pb.z
    }
    this.links.geometry.setDrawRange(0, k / 3)
    this.links.geometry.attributes.position.needsUpdate = true
    this.linkMat.opacity = 0.25 * (1 - smoothstep(0.1, 0.7, o.gather))
    // The newest link, a moment brighter.
    const nw = (this.newest.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
    if (shown > 0 && o.grow < 1 && o.gather < 0.1) {
      const [a, b] = this.pairs[shown - 1]
      nw.set([this.pos[a].x, this.pos[a].y, this.pos[a].z, this.pos[b].x, this.pos[b].y, this.pos[b].z])
      this.newestMat.opacity = 0.9
    } else this.newestMat.opacity = 0
    this.newest.geometry.attributes.position.needsUpdate = true
    this.stackMat.opacity = 0.22 * smoothstep(0.5, 1, o.gather)
    for (const s of this.labels) (s.material as THREE.SpriteMaterial).opacity = o.labels
    // Today's pulse ring.
    this.halo.lookAt(o.camera)
    this.haloMat.opacity = o.pulse * 0.8
    this.halo.scale.setScalar(1 + (1 - o.pulse) * 1.5)
    // The anomaly.
    this.anomalyMat.opacity = o.anomaly
    this.anomaly.scale.setScalar(0.6 + 0.4 * o.anomaly)
    ;(this.cursor.material as THREE.SpriteMaterial).opacity = o.anomaly > 0.5 && Math.sin(o.time * 6.5) > 0 ? 0.95 : 0
    void o.flat
  }
}
