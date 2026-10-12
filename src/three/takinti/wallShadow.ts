/**
 * The mother's shadow on the sewing room's north wall — the story's
 * terrifying image, and a cheat the screenplay allows. The streetlight's
 * patch is painted onto the wall as additive light (a decal a few mm in
 * front of it): the window stretched up the wall and, cut out of it, her
 * long, thin, hunched silhouette, redrawn in time with the treadle — the
 * head bobbing, the elbow jerking up on each pull, the hair swaying, the
 * hands pulling the cloth through.
 *
 * A decal and not a light: it lights nothing in front of the wall, so the
 * body sliding along the wall stays a black silhouette against the patch.
 * The canvas is drawn in wall meters.
 */
import * as THREE from 'three'

const WALL_Z = -4.4
/** The decal's square on the wall: centre and half size (meters). */
const CX = 2.5
const CY = 0.95
const HALF = 1.5

export type WallShadow = {
  decal: THREE.Mesh
  /** 0 … 1: how bright the patch is (0 hides it). */
  setLevel(level: number): void
  /** Redraws the cookie. `phase` 0…1 per stitch; `run` 0 stopped … 1 sewing; `slam` 0…1 a hard press. */
  draw(phase: number, run: number, slam: number, time: number): void
  dispose(): void
}

type P2 = readonly [number, number]

export function wallShadow(): WallShadow {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const g = canvas.getContext('2d')!
  // QA only: the cookie canvas, to look at it directly.
  if (typeof window !== 'undefined') (window as unknown as { __takCookie?: HTMLCanvasElement }).__takCookie = canvas
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color: 0x000000,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
  })
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, 2 * HALF), mat)
  decal.position.set(CX, CY, WALL_Z + 0.004)
  decal.renderOrder = 1
  decal.name = 'wall-shadow'
  const px = S / (2 * HALF)
  /** Wall meters → canvas pixels (y up). */
  const X = (x: number) => (x - CX + HALF) * px
  const Y = (y: number) => (CY + HALF - y) * px

  const path = (pts: P2[]) => {
    g.beginPath()
    pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))))
    g.closePath()
  }
  const fill = (pts: P2[]) => {
    path(pts)
    g.fill()
  }
  /** A limb: a round-capped thick line through wall points, `w` meters wide. */
  const limb = (pts: P2[], w: number) => {
    g.lineWidth = w * px
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))))
    g.stroke()
  }

  let last = -1
  const draw = (phase: number, run: number, slam: number, time: number) => {
    // Quantize: redraw only when the picture would change.
    const key = Math.round(phase * 40) + Math.round(run * 8) * 100 + Math.round(slam * 10) * 1000 + Math.round(time * 5) * 20000
    if (key === last) return
    last = key
    const s = Math.sin(phase * Math.PI * 2) * run
    const pull = Math.max(0, s)
    const bob = 0.035 * s + 0.06 * slam
    const sway = 0.015 * Math.sin(time * 0.8)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.filter = 'none'
    g.fillStyle = '#000'
    g.fillRect(0, 0, S, S)
    // The patch: the window stretched up the wall by the low lamp, higher at
    // its east end (where the real band climbs it). Soft edges.
    g.filter = 'blur(3px)'
    g.fillStyle = '#fff'
    fill([
      [1.78, -0.05],
      [2.88, -0.05],
      [3.05, 1.92],
      [2.08, 1.92],
    ])
    // The transom's thin shadow, high above her.
    g.fillStyle = '#000'
    fill([
      [1.9, 1.66],
      [3.2, 1.66],
      [3.2, 1.71],
      [1.9, 1.71],
    ])
    // Her silhouette, facing east (the machine at the patch's east edge),
    // stretched tall by the low light: the stool, a great hunched back, a
    // small head hanging forward with the hair falling straight down past
    // the face, long thin arms, the near elbow jerking up on each pull.
    g.filter = 'blur(1.2px)'
    g.fillStyle = '#000'
    g.strokeStyle = '#000'
    const dip = bob // the whole upper body dips with each stitch
    // Stool legs and seat.
    limb(
      [
        [2.05, 0.0],
        [2.1, 0.42],
      ],
      0.022,
    )
    limb(
      [
        [2.26, 0.0],
        [2.2, 0.42],
      ],
      0.022,
    )
    // Hips, lap and the hunched back (one shape).
    fill([
      [1.98, 0.42],
      [1.94, 0.62],
      [1.93, 0.86],
      [1.96, 1.08],
      [2.03, 1.28],
      [2.15, 1.45 - dip * 0.4],
      [2.3, 1.56 - dip * 0.7],
      [2.45, 1.57 - dip],
      [2.56, 1.49 - dip],
      [2.54, 1.34 - dip * 0.8],
      [2.45, 1.12],
      [2.4, 0.88],
      [2.42, 0.66],
      [2.72, 0.66],
      [2.74, 0.53],
      [2.3, 0.5],
      [2.22, 0.42],
    ])
    // Shins down to the treadle; the feet on it.
    limb(
      [
        [2.69, 0.6],
        [2.74, 0.1],
        [2.88, 0.06 - 0.02 * slam],
      ],
      0.06,
    )
    // The neck, long and thin, forward and down; the head hanging.
    const hx = 2.73 + sway
    const hy = 1.33 - dip * 1.3
    limb(
      [
        [2.5, 1.48 - dip],
        [hx - 0.06, hy + 0.05],
      ],
      0.06,
    )
    g.save()
    g.translate(X(hx), Y(hy))
    g.rotate(0.75)
    g.beginPath()
    g.ellipse(0, 0, 0.078 * px, 0.105 * px, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
    // The hair: a curtain from the crown straight down past the face, ragged.
    const hair: P2[] = [
      [hx - 0.1, hy + 0.06],
      [hx + 0.02, hy + 0.11],
      [hx + 0.1, hy + 0.02],
    ]
    const tips = 9
    for (let i = 0; i <= tips; i++) {
      const t = i / tips
      hair.push([hx + 0.11 - t * 0.2 + sway, hy - 0.42 - 0.06 * Math.abs(Math.sin(i * 2.7)) - (i % 2) * 0.04 + dip * 0.5])
    }
    hair.push([hx - 0.11, hy - 0.05])
    fill(hair)
    // Arms: thin, long. The near elbow sticks out behind her and jerks up.
    const elbow: P2 = [2.27 - 0.05 * pull, 1.0 + 0.18 * pull + 0.05 * slam]
    const hand: P2 = [2.9 + 0.03 * pull, 0.86 + 0.03 * pull]
    limb([[2.42, 1.42 - dip], elbow, hand], 0.045)
    limb(
      [
        [2.5, 1.4 - dip],
        [2.62, 1.0],
        [2.97, 0.9],
      ],
      0.034,
    )
    for (let k = 0; k < 4; k++)
      limb(
        [
          hand,
          [hand[0] + 0.09, hand[1] - 0.03 + k * 0.018],
        ],
        0.011,
      )
    // The machine at the east edge: table top, bed, pillar, arm, needle bar.
    fill([
      [2.82, 0.73],
      [3.3, 0.73],
      [3.3, 0.78],
      [2.82, 0.78],
    ])
    fill([
      [2.86, 0.78],
      [3.3, 0.78],
      [3.3, 0.84],
      [2.86, 0.84],
    ])
    fill([
      [3.08, 0.84],
      [3.3, 0.84],
      [3.3, 1.1],
      [3.08, 1.1],
    ])
    fill([
      [2.92, 1.02],
      [3.3, 1.02],
      [3.3, 1.1],
      [2.95, 1.1],
    ])
    limb(
      [
        [2.95, 1.04],
        [2.95, 0.86 + 0.05 * Math.max(0, -s)],
      ],
      0.016,
    )
    // The cloth she feeds: from the needle sagging back to her lap.
    limb(
      [
        [2.95, 0.84],
        [2.8, 0.74 - 0.03 * pull],
        [2.6, 0.68],
      ],
      0.03,
    )
    g.filter = 'none'
    tex.needsUpdate = true
  }
  draw(0, 0, 0, 0)
  return {
    decal,
    setLevel(level) {
      decal.visible = level > 0.001
      // The streetlight's cold white-green on old plaster.
      mat.color.setRGB(0.62 * level, 0.7 * level, 0.66 * level)
    },
    draw,
    dispose() {
      tex.dispose()
      mat.dispose()
      decal.geometry.dispose()
    },
  }
}
