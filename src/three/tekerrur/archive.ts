/**
 * The archive behind the left door: a hall beyond human scale. Concrete floor,
 * brushed steel shelving 9 m tall in rows on both sides of a main aisle,
 * catwalks, cool white light bands lost in a haze at 14 m. The shelves hold
 * data carriers (slim dark cartridges, a pale label, a white status pixel).
 * One side corridor is built for real (carriers in close-up, and a run of
 * labels with nothing above them). At the end of the aisle, the core: twelve
 * black columns in a ring around a dark well, a soft white band travelling
 * down them.
 *
 * Layout (screenplay 2.3): rows centred at x = −8 − 2.6k (k 0…13), 1.4 m
 * thick, from z ±1.6 to ±15.6; the main aisle z ∈ [−1.6, 1.6]; the switch on
 * the door wall at (−5.7, 1.3, −1.25); the core at (−52, 0, 0).
 */
import * as THREE from 'three'
import { mulberry32 } from '@/lib/math'
import { box, cyl, mesh } from '../util'
import { rbox } from '../kit/props'
import { pbr } from '../kit/surfaces'
import { mono } from '../screens'

export const ROWS = 14
export const rowX = (k: number) => -8 - 2.6 * k
const LABELS = ['SAVAŞ', 'EKONOMİ', 'İNANÇ', 'GÖÇ', 'BİLİM', 'ÇÖKÜŞ', 'TOPARLANMA', 'KİTAPLAR', 'FİLMLER', 'BİYOGRAFİLER', 'OLAYLAR', 'HABERLER']
export const CORE = new THREE.Vector3(-52, 0, 0)
/** The real corridor: between rows 6 and 7 on the +z side. */
const CLOSE = { k: 6, z0: 1.6, z1: 9.6, y1: 3.95 }
const EMPTY = { z0: 5.5, z1: 7.5, y0: 1.2, y1: 3.2 }

/** Shelving as seen from a few metres: boards, uprights, carriers with labels and pixels. */
function shelfTextures() {
  const W = 1024
  const H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const e = document.createElement('canvas')
  e.width = W
  e.height = H
  const ge = e.getContext('2d')!
  ge.fillStyle = '#000'
  ge.fillRect(0, 0, W, H)
  const rand = mulberry32(31)
  // The tile is 2.4 m × 2.4 m: two bays of 1.2 m, seven levels of ~0.343 m.
  const px = W / 2.4
  g.fillStyle = '#1b1d20'
  g.fillRect(0, 0, W, H)
  const levels = 7
  const lh = H / levels
  for (let l = 0; l < levels; l++) {
    const y0 = l * lh
    // Back panel shadow.
    g.fillStyle = '#0c0d0f'
    g.fillRect(0, y0, W, lh)
    // Carriers.
    let x = 6
    while (x < W - 6) {
      const bay = Math.floor(x / (W / 2))
      const bayEnd = (bay + 1) * (W / 2) - 10
      if (x > bayEnd - 0.04 * px) {
        x = bayEnd + 20
        continue
      }
      const w = 0.04 * px
      const h = 0.22 * px * (0.97 + rand() * 0.03)
      const top = y0 + lh - 0.035 * px - h
      const shade = 22 + Math.floor(rand() * 16)
      g.fillStyle = `rgb(${shade},${shade + 2},${shade + 5})`
      g.fillRect(x, top, w - 2, h)
      // Highlight down one edge.
      g.fillStyle = 'rgba(160,170,180,0.18)'
      g.fillRect(x, top, 1.5, h)
      // Pale label strip.
      g.fillStyle = `rgba(214,210,198,${0.75 + rand() * 0.2})`
      g.fillRect(x + 2, top + h * 0.12, w - 6, h * 0.16)
      // Status pixel.
      ge.fillStyle = '#fff'
      ge.fillRect(x + w / 2 - 1.5, top + h * 0.82, 3, 3)
      g.fillStyle = '#e8eef2'
      g.fillRect(x + w / 2 - 1.5, top + h * 0.82, 3, 3)
      x += 0.05 * px + (rand() < 0.03 ? 0.05 * px : 0)
    }
    // The board: a bright front edge and its shadow.
    g.fillStyle = '#8d939a'
    g.fillRect(0, y0 + lh - 0.035 * px, W, 0.022 * px)
    g.fillStyle = '#4a4e53'
    g.fillRect(0, y0 + lh - 0.013 * px, W, 0.013 * px)
    // Tags on the board edge.
    for (let tx = 10; tx < W; tx += 0.05 * px) {
      g.fillStyle = 'rgba(232,230,222,0.85)'
      g.fillRect(tx, y0 + lh - 0.03 * px, 0.03 * px, 0.01 * px)
    }
  }
  // Uprights.
  for (const ux of [0, W / 2, W]) {
    g.fillStyle = '#9aa0a6'
    g.fillRect(ux - 8, 0, 16, H)
    g.fillStyle = '#5c6167'
    g.fillRect(ux + 2, 0, 6, H)
  }
  const map = new THREE.CanvasTexture(c)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 8
  const emissive = new THREE.CanvasTexture(e)
  emissive.colorSpace = THREE.SRGBColorSpace
  emissive.wrapS = emissive.wrapT = THREE.RepeatWrapping
  return { map, emissive }
}

/** A plane whose uvs repeat the 2.4 m shelf tile. */
function shelfPlane(w: number, h: number) {
  const geo = new THREE.PlaneGeometry(w, h)
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 2.4, (uv.getY(i) * h) / 2.4 + 0.0)
  return geo
}

/** Lights rows on as the cascade front passes them (x decreasing from the door). */
function cascadeShader(mat: THREE.MeshStandardMaterial, uniforms: { uFront: { value: number }; uWarm: { value: THREE.Color }; uDim: { value: number } }) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFront = uniforms.uFront
    shader.uniforms.uWarm = uniforms.uWarm
    shader.uniforms.uDim = uniforms.uDim
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vWx;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n#ifdef USE_INSTANCING\nvWx = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).x;\n#else\nvWx = (modelMatrix * vec4(transformed, 1.0)).x;\n#endif')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vWx;\nuniform float uFront;\nuniform vec3 uWarm;\nuniform float uDim;')
      .replace('#include <opaque_fragment>', 'outgoingLight *= mix(vec3(uDim), uWarm, smoothstep(uFront - 1.2, uFront + 1.2, vWx));\n#include <opaque_fragment>')
  }
  mat.customProgramCacheKey = () => 'tek-archive-cascade'
}

export class ArchiveSet {
  readonly group = new THREE.Group()
  readonly uniforms = { uFront: { value: 0 }, uWarm: { value: new THREE.Color(1.25, 1.17, 1.05) }, uDim: { value: 1 } }
  lever = new THREE.Group()
  bands!: THREE.InstancedMesh
  bandRows: number[] = []
  coreMat!: THREE.ShaderMaterial
  plates: THREE.Mesh[] = []
  private bandCol = new THREE.Color()

  build() {
    const G = this.group
    const steel = pbr('metal', 0x8e959c, { roughness: 0.38 })
    const steelDark = pbr('metal', 0x4a4f55, { roughness: 0.5 })
    const concrete = pbr('concrete', 0x7b7a77, { roughness: 0.92, scale: 2 })
    const { map, emissive } = shelfTextures()
    const shelfMat = new THREE.MeshStandardMaterial({ map, emissiveMap: emissive, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.55, metalness: 0.25 })
    for (const m of [shelfMat, steel, steelDark, concrete]) cascadeShader(m as THREE.MeshStandardMaterial, this.uniforms)

    // Floor and the haze-lost ceiling.
    const floor = mesh(new THREE.PlaneGeometry(60, 34), concrete, -35.4, 0, 0, G)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    // A painted line down the aisle.
    for (const sz of [-1, 1]) {
      const line = mesh(new THREE.PlaneGeometry(38, 0.08), new THREE.MeshStandardMaterial({ color: 0xbfc3c4, roughness: 0.7 }), -24, 0.003, sz * 1.45, G)
      line.rotation.x = -Math.PI / 2
    }
    const ceil = mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ color: 0x1a1c1e }), -35.4, 14, 0, G)
    ceil.rotation.x = Math.PI / 2
    // Side walls far out.
    for (const sz of [-1, 1]) box(60, 14, 0.3, concrete, -35.4, 7, sz * 16.6, G)
    // The door wall's inside face gets a steel frame around the opening.
    rbox(0.08, 3.25, 0.12, steelDark, -5.58, 1.62, 0.95, G, 0.01)
    rbox(0.08, 3.25, 0.12, steelDark, -5.58, 1.62, -0.95, G, 0.01)
    rbox(0.08, 0.12, 2.02, steelDark, -5.58, 3.2, 0, G, 0.01)

    // ——— Shelf rows: textured faces, instanced ———
    const faces = new THREE.InstancedMesh(shelfPlane(14, 9), shelfMat, ROWS * 2 * 2)
    const ends = new THREE.InstancedMesh(shelfPlane(1.4, 9), shelfMat, ROWS * 2)
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const s1 = new THREE.Vector3(1, 1, 1)
    const p = new THREE.Vector3()
    let fi = 0
    let ei = 0
    const special: Array<[number, number]> = []
    for (let k = 0; k < ROWS; k++) {
      const x = rowX(k)
      for (const sz of [-1, 1]) {
        const zc = sz * 8.6
        for (const sx of [-1, 1]) {
          // The two faces built for real in the close corridor are split.
          if (sz > 0 && ((k === CLOSE.k && sx < 0) || (k === CLOSE.k + 1 && sx > 0))) {
            special.push([k, sx])
            continue
          }
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (sx * Math.PI) / 2)
          p.set(x + sx * 0.7, 4.5, zc)
          m4.compose(p, q, s1)
          faces.setMatrixAt(fi++, m4)
        }
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), sz < 0 ? Math.PI : 0)
        p.set(x, 4.5, sz * 1.6)
        m4.compose(p, q, s1)
        ends.setMatrixAt(ei++, m4)
        // Inner mass and the top.
        box(1.36, 0.06, 14, steelDark, x, 9.0, zc, G)
      }
    }
    faces.count = fi
    faces.receiveShadow = true
    G.add(faces, ends)
    // The split faces: textured above and beyond the real corridor.
    for (const [k, sx] of special) {
      const x = rowX(k) + sx * 0.7
      const a = mesh(shelfPlane(15.6 - CLOSE.z1, 9), shelfMat, x, 4.5, (CLOSE.z1 + 15.6) / 2, G)
      a.rotation.y = (sx * Math.PI) / 2
      const b = mesh(shelfPlane(CLOSE.z1 - CLOSE.z0, 9 - CLOSE.y1), shelfMat, x, (9 + CLOSE.y1) / 2, (CLOSE.z0 + CLOSE.z1) / 2, G)
      b.rotation.y = (sx * Math.PI) / 2
      // Behind the real carriers: a dark back panel.
      const back = mesh(new THREE.PlaneGeometry(CLOSE.z1 - CLOSE.z0, CLOSE.y1), new THREE.MeshStandardMaterial({ color: 0x0b0c0d, roughness: 0.9 }), x - sx * 0.26, CLOSE.y1 / 2, (CLOSE.z0 + CLOSE.z1) / 2, G)
      back.rotation.y = (sx * Math.PI) / 2
    }
    // Uprights along the faces for relief.
    const upr = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 9, 0.05), steel, ROWS * 2 * 2 * 13)
    let ui = 0
    for (let k = 0; k < ROWS; k++)
      for (const sz of [-1, 1])
        for (const sx of [-1, 1])
          for (let j = 0; j <= 12; j++) {
            m4.makeTranslation(rowX(k) + sx * 0.715, 4.5, sz * (1.6 + j * 1.2 - 0.0))
            upr.setMatrixAt(ui++, m4)
          }
    upr.count = ui
    G.add(upr)
    // Catwalks at 4 m and 8 m in each side corridor, with rails.
    const grate = new THREE.MeshStandardMaterial({ color: 0x5c6167, roughness: 0.6, metalness: 0.6 })
    cascadeShader(grate, this.uniforms)
    const walks = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 0.05, 14), grate, (ROWS - 1) * 2 * 2)
    const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.03, 14), steel, (ROWS - 1) * 2 * 2 * 2)
    let wi = 0
    let ri = 0
    for (let k = 0; k < ROWS - 1; k++) {
      const cx = (rowX(k) + rowX(k + 1)) / 2
      for (const sz of [-1, 1])
        for (const y of [4, 8]) {
          m4.makeTranslation(cx, y, sz * 8.6)
          walks.setMatrixAt(wi++, m4)
          for (const sx of [-1, 1]) {
            m4.makeTranslation(cx + sx * 0.5, y + 1.0, sz * 8.6)
            rails.setMatrixAt(ri++, m4)
          }
        }
    }
    G.add(walks, rails)

    // ——— The real corridor (rows 6|7, +z side): boards, carriers, tags; one run emptied ———
    const boardGeo = new THREE.BoxGeometry(0.5, 0.025, CLOSE.z1 - CLOSE.z0)
    const boards = new THREE.InstancedMesh(boardGeo, steel, 2 * 11)
    const carrierGeo = new THREE.BoxGeometry(0.3, 0.22, 0.038)
    // A front face with a label and a pixel: material per face group (+x, −x, +y, −y, +z, −z).
    const labelC = document.createElement('canvas')
    labelC.width = 64
    labelC.height = 128
    const lg = labelC.getContext('2d')!
    lg.fillStyle = '#1a1c1f'
    lg.fillRect(0, 0, 64, 128)
    lg.fillStyle = '#d8d4c8'
    lg.fillRect(8, 14, 48, 22)
    lg.fillStyle = '#3a3a3a'
    mono(lg, 10, 500)
    lg.fillText('0417', 14, 30)
    lg.fillStyle = '#ffffff'
    lg.fillRect(28, 102, 8, 8)
    const labelTex = new THREE.CanvasTexture(labelC)
    labelTex.colorSpace = THREE.SRGBColorSpace
    const pixC = document.createElement('canvas')
    pixC.width = 64
    pixC.height = 128
    const pg = pixC.getContext('2d')!
    pg.fillStyle = '#000'
    pg.fillRect(0, 0, 64, 128)
    pg.fillStyle = '#fff'
    pg.fillRect(28, 102, 8, 8)
    const pixTex = new THREE.CanvasTexture(pixC)
    pixTex.colorSpace = THREE.SRGBColorSpace
    const front = new THREE.MeshStandardMaterial({ map: labelTex, emissiveMap: pixTex, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: 0.45, metalness: 0.2 })
    const bodyM = new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.4, metalness: 0.3 })
    cascadeShader(front, this.uniforms)
    cascadeShader(bodyM, this.uniforms)
    const rand = mulberry32(12)
    const tagGeo = new THREE.BoxGeometry(0.004, 0.012, 0.032)
    const tagMat = new THREE.MeshStandardMaterial({ color: 0xe6e3da, roughness: 0.6 })
    cascadeShader(tagMat, this.uniforms)
    const perLevel = Math.floor((CLOSE.z1 - CLOSE.z0 - 0.1) / 0.05)
    const levels = 11
    for (const [k, sx] of special) {
      const faceX = rowX(k) + sx * 0.7
      // sx is the direction the face looks: carriers' fronts face it.
      const mats = sx > 0 ? [front, bodyM, bodyM, bodyM, bodyM, bodyM] : [bodyM, front, bodyM, bodyM, bodyM, bodyM]
      const carriers = new THREE.InstancedMesh(carrierGeo, mats, perLevel * levels)
      const tags = new THREE.InstancedMesh(tagGeo, tagMat, perLevel * levels)
      let ci = 0
      let ti = 0
      for (let l = 0; l < levels; l++) {
        const by = 0.12 + l * 0.35
        m4.makeTranslation(faceX - sx * 0.25, by, (CLOSE.z0 + CLOSE.z1) / 2)
        boards.setMatrixAt(sx > 0 ? l : levels + l, m4)
        for (let i = 0; i < perLevel; i++) {
          const z = CLOSE.z0 + 0.08 + i * 0.05
          m4.makeTranslation(faceX + sx * 0.003, by + 0.012, z)
          tags.setMatrixAt(ti++, m4)
          const emptied = sx < 0 && z > EMPTY.z0 && z < EMPTY.z1 && by > EMPTY.y0 - 0.1 && by < EMPTY.y1
          if (emptied || rand() < 0.015) continue
          m4.makeTranslation(faceX - sx * 0.16, by + 0.0125 + 0.11, z)
          carriers.setMatrixAt(ci++, m4)
        }
      }
      carriers.count = ci
      tags.count = ti
      carriers.castShadow = true
      carriers.receiveShadow = true
      G.add(carriers, tags)
    }
    G.add(boards)

    // ——— Category plates at each row's aisle end, facing +x ———
    const plateCache = new Map<string, THREE.MeshStandardMaterial>()
    const plateMat = (text: string) => {
      let m = plateCache.get(text)
      if (m) return m
      const c = document.createElement('canvas')
      c.width = 768
      c.height = 256
      const x = c.getContext('2d')!
      x.fillStyle = '#ece8df'
      x.fillRect(0, 0, 768, 256)
      x.strokeStyle = '#1a1a1a'
      x.lineWidth = 6
      x.strokeRect(14, 14, 740, 228)
      x.fillStyle = '#121212'
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.font = `600 ${text.length > 10 ? 92 : 118}px "Arial Narrow", Arial, sans-serif`
      x.letterSpacing = '6px'
      x.fillText(text, 384, 136)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.05, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.08 })
      cascadeShader(m, this.uniforms)
      plateCache.set(text, m)
      return m
    }
    const plateGeo = new THREE.PlaneGeometry(1.2, 0.4)
    let li = 0
    for (let k = 0; k < ROWS; k++)
      for (const sz of [1, -1]) {
        const text = k === 5 && sz > 0 ? 'ODA' : LABELS[li++ % LABELS.length]
        const pl = new THREE.Group()
        pl.position.set(rowX(k) + 0.74, 3.0, sz * 2.4)
        pl.rotation.y = Math.PI / 2
        G.add(pl)
        const face = mesh(plateGeo, plateMat(text), 0, 0, 0.012, pl)
        this.plates.push(face)
        rbox(1.24, 0.44, 0.02, steelDark, 0, 0, 0, pl, 0.004)
        for (const dx of [-0.5, 0.5]) cyl(0.006, 0.006, 0.6, steel, dx, 0.5, 0, pl, 6)
      }

    // ——— Light bands up in the haze (one per corridor and the aisle) ———
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true })
    this.bands = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.08, 13.5), bandMat, (ROWS - 1) * 2 + ROWS)
    let bi = 0
    for (let k = 0; k < ROWS - 1; k++)
      for (const sz of [-1, 1]) {
        m4.makeTranslation((rowX(k) + rowX(k + 1)) / 2, 12.5, sz * 8.6)
        this.bands.setMatrixAt(bi, m4)
        this.bandRows[bi++] = (rowX(k) + rowX(k + 1)) / 2
      }
    for (let k = 0; k < ROWS; k++) {
      m4.makeRotationY(Math.PI / 2).setPosition(rowX(k), 12.8, 0)
      this.bands.setMatrixAt(bi, m4)
      this.bandRows[bi++] = rowX(k)
    }
    this.bands.count = bi
    this.bands.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(bi * 3), 3)
    G.add(this.bands)

    // ——— The switch: a steel plate, a heavy lever (up = off) ———
    const sw = new THREE.Group()
    sw.position.set(-5.56, 1.3, -1.25)
    G.add(sw)
    rbox(0.03, 0.5, 0.3, steel, 0, 0, 0, sw, 0.01)
    for (const dy of [-0.2, 0.2]) for (const dz of [-0.11, 0.11]) cyl(0.012, 0.012, 0.012, steelDark, -0.02, dy, dz, sw, 8).rotation.z = Math.PI / 2
    rbox(0.08, 0.14, 0.12, steelDark, -0.05, 0, 0, sw, 0.01)
    this.lever.position.set(-0.09, 0, 0)
    sw.add(this.lever)
    rbox(0.03, 0.42, 0.03, steel, 0, 0.21, 0, this.lever, 0.01)
    cyl(0.025, 0.025, 0.14, new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 }), 0, 0.43, 0, this.lever, 16).rotation.x = Math.PI / 2

    // ——— The core ———
    const coreG = new THREE.Group()
    coreG.position.copy(CORE)
    G.add(coreG)
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.6, 14, 64, 1, true), concrete)
    ring.position.y = 7
    ;(ring.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
    // Open the ring toward the aisle with a gap: use a partial cylinder instead.
    ring.geometry.dispose()
    ring.geometry = new THREE.CylinderGeometry(8.6, 8.6, 14, 64, 1, true, Math.PI * 0.62, Math.PI * 1.76)
    coreG.add(ring)
    this.coreMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uBoost: { value: 0 }, uFade: { value: 1 } },
      vertexShader: 'varying vec3 vP; varying vec3 vN; void main(){ vP = position; vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float uTime; uniform float uBoost; uniform float uFade; varying vec3 vP; varying vec3 vN;
        void main(){
          float y = vP.y + 5.5;
          float band = fract(-uTime / 6.0) * 13.0 - 1.0;
          float b = exp(-pow((y - band) / 0.35, 2.0));
          float slit = step(0.82, fract(vP.x * 9.0 + vP.z * 9.0)) * 0.05;
          vec3 base = vec3(0.012, 0.013, 0.015) + slit + vec3(0.02) * max(vN.y, 0.0);
          vec3 c = base + vec3(0.85, 0.88, 0.9) * b * (0.9 + uBoost * 1.6);
          gl_FragColor = vec4(c * uFade, 1.0);
        }`,
    })
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const col = mesh(new THREE.BoxGeometry(0.9, 11, 0.6), this.coreMat, Math.cos(a) * 4.4, 5.5, Math.sin(a) * 4.4, coreG)
      col.rotation.y = -a
    }
    // The well: a dark round mouth with a steel lip.
    const lip = mesh(new THREE.TorusGeometry(2.0, 0.06, 8, 64), steel, 0, 0.04, 0, coreG)
    lip.rotation.x = Math.PI / 2
    const well = mesh(new THREE.CircleGeometry(2.0, 64), new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0.01, 0, coreG)
    well.rotation.x = -Math.PI / 2
    // A ring of floor light around the columns (very soft).
    const halo = mesh(new THREE.RingGeometry(5.3, 5.38, 96), new THREE.MeshBasicMaterial({ color: 0x8f969c }), 0, 0.006, 0, coreG)
    halo.rotation.x = -Math.PI / 2

    G.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh && !(mm.material instanceof THREE.MeshBasicMaterial)) mm.receiveShadow = true
    })
  }

  /**
   * cascade: 0 before the switch … 1 when every row is lit up to the core.
   * lever: 0 up (off) … 1 down (on).
   */
  update(time: number, cascade: number, lever: number, coreBoost: number) {
    const front = cascade <= 0 ? 10 : -5.4 - cascade * 50
    this.uniforms.uFront.value = front
    this.uniforms.uDim.value = 1
    this.lever.rotation.z = 0.55 - lever * 2.2
    this.coreMat.uniforms.uTime.value = time
    this.coreMat.uniforms.uBoost.value = coreBoost
    for (let i = 0; i < this.bands.count; i++) {
      const lit = cascade > 0 && this.bandRows[i] > front ? 1 : 0
      this.bandCol.setRGB(1.6 + lit * 0.9, 1.65 + lit * 0.75, 1.75 + lit * 0.45)
      this.bands.setColorAt(i, this.bandCol)
    }
    if (this.bands.instanceColor) this.bands.instanceColor.needsUpdate = true
  }
}
