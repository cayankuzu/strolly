/**
 * The paper plane, folded from Eren's quiz (A4, 0.21 × 0.297 m) with real
 * hinges: the two halves turn on the middle crease, a corner flap turns on
 * each nose diagonal, a wing turns on each wing line. The same sheet is the
 * flat paper Salim smooths, the dart İbrahim throws, the crushed nose the
 * teacher straightens.
 *
 * Local frame: the paper lies in x–z (x across, z from the tail at −0.1485 to
 * the nose at +0.1485), the printed side faces +y before folding. With the
 * halves folded down and the wings out, +y is "up" for the flying plane and
 * the nose points along +z.
 */
import * as THREE from 'three'
import { clamp } from '@/lib/math'
import { drawWing, LiveCanvas, quizPrint } from './canvas'

const W = 0.105
const L = 0.297
const HALF_L = L / 2
const KEEL = 0.026
const CORNER = 0.105

/** Paper coordinates (x across, y tail → nose) to local 3D. */
const P = (x: number, y: number) => new THREE.Vector3(x, 0, y - HALF_L)

function polygon(pts: Array<[number, number]>, lift: number) {
  const pos: number[] = []
  const uv: number[] = []
  for (let i = 1; i < pts.length - 1; i++) {
    for (const k of [0, i + 1, i]) {
      const [x, y] = pts[k]
      pos.push(x, lift, y - HALF_L)
      // Seen from +y with the nose up, paper +x is on the viewer's left: the print runs from −x.
      uv.push((W - x) / (2 * W), y / L)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

/** A hinge: a group that rotates about the line through `a` along `axis` (parent-local). */
class Hinge {
  readonly outer = new THREE.Group()
  readonly inner = new THREE.Group()
  readonly axis: THREE.Vector3
  constructor(a: THREE.Vector3, b: THREE.Vector3, parent: THREE.Object3D) {
    this.outer.position.copy(a)
    this.inner.position.copy(a).negate()
    this.axis = b.clone().sub(a).normalize()
    this.outer.add(this.inner)
    parent.add(this.outer)
  }
  set(angle: number) {
    this.outer.quaternion.setFromAxisAngle(this.axis, angle)
  }
}

export type PlaneFold = {
  /** Middle crease: 0 flat … 1 halves hanging straight down (the keel). */
  crease: number
  /** Corner flaps: 0 open … 1 folded onto the sheet. */
  corners: number
  /** Wings: 0 against the keel … 1 out flat. */
  wings: number
  /** Crushed nose after the hit: 0 crisp … 1 crumpled. */
  crush: number
  /** The teacher opens the right flap to look inside (0 … 1). */
  peek: number
}

export class PaperPlane {
  readonly root = new THREE.Group()
  /** Where the plane's grip point is for hands: the keel under the wings. */
  readonly body = new THREE.Group()
  private halves: Hinge[] = []
  private wingsH: Hinge[] = []
  private flaps: Hinge[] = []
  readonly front: THREE.MeshStandardMaterial
  readonly back: THREE.MeshStandardMaterial
  readonly wing = new LiveCanvas(512, 724)
  private printCanvas: HTMLCanvasElement | null = null
  private meshes: THREE.Mesh[] = []

  constructor() {
    const print = quizPrint()
    this.printCanvas = print.image as HTMLCanvasElement
    this.front = new THREE.MeshStandardMaterial({ map: print, roughness: 0.92, side: THREE.FrontSide })
    this.back = new THREE.MeshStandardMaterial({ map: this.wing.texture, roughness: 0.92, side: THREE.BackSide })
    this.setWriting(0)
    this.root.add(this.body)
    for (const s of [-1, 1]) {
      // The half turns on the middle crease (the z axis).
      const half = new Hinge(P(0, 0), P(0, L), this.body)
      this.halves.push(half)
      // Keel sliver between the crease and the wing line.
      this.add(half.inner, [
        [0, L],
        [0, 0],
        [s * KEEL, 0],
      ], s)
      // The wing turns on the line from the nose to the keel's tail edge.
      const wing = new Hinge(P(0, L), P(s * KEEL, 0), half.inner)
      this.wingsH.push(wing)
      this.add(wing.inner, [
        [0, L],
        [s * KEEL, 0],
        [s * W, 0],
        [s * W, L - CORNER],
      ], s)
      // The nose corner folds over the diagonal onto the printed side.
      const flap = new Hinge(P(0, L), P(s * W, L - CORNER), wing.inner)
      this.flaps.push(flap)
      // Lifted below its own plane: once turned over it lies just above the sheet.
      this.add(flap.inner, [
        [0, L],
        [s * W, L - CORNER],
        [s * W, L],
      ], s, -0.0008)
    }
    this.root.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
  }

  /** One paper panel: the printed face and the blank face. */
  private add(parent: THREE.Object3D, pts: Array<[number, number]>, s: number, lift = 0) {
    // Keep the winding facing +y on both sides.
    const ordered = s > 0 ? pts : [...pts].reverse()
    const geo = polygon(ordered, lift)
    const g = new THREE.Group()
    const a = new THREE.Mesh(geo, this.front)
    const b = new THREE.Mesh(geo, this.back)
    g.add(a, b)
    parent.add(g)
    this.meshes.push(a, b)
    return g
  }

  /** Eren's marker on the wing, 0 … 1 written. */
  setWriting(written: number) {
    const w = Math.round(clamp(written) * 24) / 24
    this.wing.draw(`w${w}`, (g, cw, ch) => drawWing(g, cw, ch, w, this.printCanvas))
  }

  fold(f: PlaneFold) {
    const crease = clamp(f.crease)
    const wings = clamp(f.wings)
    const corners = clamp(f.corners)
    const crush = clamp(f.crush)
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? -1 : 1
      // A crumpled plane: halves sprung apart, wings drooping, flaps lifting.
      const spring = crush * (i === 0 ? 0.18 : 0.26)
      this.halves[i].set(-s * (crease * (Math.PI / 2 - 0.035) - spring))
      this.wingsH[i].set(-s * (wings * (Math.PI / 2 - 0.08) - crush * (i === 0 ? 0.35 : 0.5)))
      // The grade sits in the −x nose corner (the left one, seen from the print side).
      const peek = i === 0 ? clamp(f.peek) : 0
      this.flaps[i].set(-s * (corners * (Math.PI - 0.012) - crush * 0.5 - peek * 1.9))
    }
  }

  /**
   * Turns the plane (as folded now) so that one of its written faces looks
   * straight at the camera, its text upright and centered on `at` — for the
   * inserts, where the reader must be able to read it. `roll` tilts it a little.
   */
  present(face: 'wing' | 'grade' | 'questions', cam: THREE.Vector3, at: THREE.Vector3, roll = 0) {
    const F = FACES[face]
    const node = face === 'wing' ? this.wingsH[1].inner : face === 'grade' ? this.flaps[0].inner : this.wingsH[0].inner
    const root = this.root
    root.position.set(0, 0, 0)
    root.quaternion.identity()
    root.updateMatrixWorld(true)
    // (The root's parent is the scene, so the node's world matrix is its matrix in root space.)
    const M = node.matrixWorld
    const c = _c.copy(F.c).applyMatrix4(M)
    const back = _b.copy(F.back).transformDirection(M)
    const up0 = _u.copy(F.up).transformDirection(M)
    const right = _r.crossVectors(up0, back).normalize()
    const up = _u.crossVectors(back, right).normalize()
    _L.makeBasis(right, up, back)
    const wb = _wb.copy(cam).sub(at).normalize()
    const wr = _wr.crossVectors(WORLD_UP, wb).normalize()
    const wu = _wu.crossVectors(wb, wr).normalize()
    if (roll) {
      wr.applyAxisAngle(wb, roll)
      wu.applyAxisAngle(wb, roll)
    }
    _W.makeBasis(wr, wu, wb)
    _W.multiply(_L.transpose())
    root.quaternion.setFromRotationMatrix(_W)
    root.position.copy(at).sub(c.applyQuaternion(root.quaternion))
    root.updateMatrixWorld(true)
  }

  dispose() {
    this.front.map?.dispose()
    this.wing.texture.dispose()
    this.front.dispose()
    this.back.dispose()
    for (const m of this.meshes) m.geometry.dispose()
  }
}

/**
 * The written faces, in paper coordinates (x across, z tail → nose, the print
 * facing +y): center, the text's up, and the side the reader must look from.
 * (Their right is up × toward.)
 */
const FACES = {
  // Eren's marker on the top of the +x wing (the blank side, seen from −y): letters run nose → tail.
  wing: { c: new THREE.Vector3(0.035, 0, 0.0085), up: new THREE.Vector3(1, 0, 0), back: new THREE.Vector3(0, -1, 0) },
  // The red 100 and "Aferin" inside the −x nose flap (the print side).
  grade: { c: new THREE.Vector3(-0.06, 0, 0.104), up: new THREE.Vector3(0, 0, 1), back: new THREE.Vector3(0, 1, 0) },
  // The printed questions and the blue answers, on the underside of the −x wing.
  questions: { c: new THREE.Vector3(-0.045, 0, -0.01), up: new THREE.Vector3(0, 0, 1), back: new THREE.Vector3(0, 1, 0) },
}
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const _c = new THREE.Vector3()
const _b = new THREE.Vector3()
const _u = new THREE.Vector3()
const _r = new THREE.Vector3()
const _wb = new THREE.Vector3()
const _wr = new THREE.Vector3()
const _wu = new THREE.Vector3()
const _L = new THREE.Matrix4()
const _W = new THREE.Matrix4()

/** The finished dart. */
export const DART: PlaneFold = { crease: 1, corners: 1, wings: 1, crush: 0, peek: 0 }
/** A flat sheet. */
export const SHEET: PlaneFold = { crease: 0, corners: 0, wings: 0, crush: 0, peek: 0 }
