/**
 * TEK AYAK's cameras: keyed shots per segment ([u, [px,py,pz, tx,ty,tz, vfov]];
 * a repeated u is a hard cut) and the look mode of each moment (docs §3).
 */
import type { ShotKeys } from '../kit/direct'
import type { SegmentId } from '@/stories/tekayak/timeline'

/** The reader's seat: middle column, row 2, right. */
const R = [0.3, 1.1, 0.35] as const

export const SHOTS: Partial<Record<SegmentId, ShotKeys>> = {
  open: [
    [0, [-1.3, 1.72, -2.72, -1.1, 1.76, -3.47, 30]],
    [1, [-0.3, 1.72, -2.72, -0.15, 1.74, -3.47, 30]],
  ],
  board: [
    [0, [-3.3, 2.2, 3.0, 0.3, 1.2, -3.2, 50]],
    [0.44, [-2.9, 2.0, 2.4, 0.3, 1.2, -3.2, 50]],
    [0.44, [-1.6, 1.6, -1.9, 0.9, 1.5, -3.3, 36]],
    [1, [-1.45, 1.6, -2.05, 0.95, 1.5, -3.3, 34]],
  ],
  light: [
    // The motes in the beam in front of the board; the drift finds his tired profile (0.5); then up to the clock.
    [0, [-1.1, 1.52, -2.3, 0.3, 1.6, -3.35, 34]],
    [0.45, [-0.85, 1.58, -2.55, 0.45, 1.62, -3.2, 32]],
    [0.76, [-0.8, 1.6, -2.62, 0.5, 1.63, -3.15, 31]],
    [1, [-0.2, 1.7, -1.45, 3.0, 2.4, -3.46, 32]],
  ],
  rows: [
    [0, [-1.4, 1.65, -3.1, 0.6, 0.95, 1.6, 44]],
    [0.5, [-1.4, 1.65, -3.1, 0.6, 0.95, 1.6, 44]],
    [1, [-1.25, 1.62, -3.0, 2.4, 1.0, 2.2, 34]],
  ],
  under: [
    // The underworld: a low pull-back down the runway, looking under the desks from behind, ending on Salim's lap.
    [0, [1.2, 0.3, -0.6, 1.05, 0.28, -2.8, 54]],
    [0.28, [1.28, 0.36, 0.85, 1.15, 0.34, -1.4, 50]],
    [0.45, [1.46, 0.57, 1.56, 2.05, 0.6, 1.44, 40]],
    // Cut: above the desks, the three faces.
    [0.45, [1.15, 1.08, 0.75, 2.15, 1.02, 2.45, 38]],
    [1, [1.2, 1.07, 0.85, 2.15, 1.02, 2.45, 36]],
  ],
  fold: [
    // From the aisle, over his desk's corner: his hands and the sheet in his lap, behind the desk's
    // edge — the folds one by one, his bent head above them.
    [0, [1.48, 1.06, 1.1, 1.99, 0.78, 1.65, 38]],
    [0.48, [1.52, 1.05, 1.13, 1.99, 0.78, 1.65, 36]],
    // Cut: a medium close-up from the front-left, over his desk — his face bent over his hands (the
    // tongue between his teeth), then the proud grin over the finished dart.
    [0.48, [1.4, 1.13, 0.96, 2.02, 0.9, 1.63, 40]],
    [1, [1.46, 1.11, 1.0, 2.02, 0.91, 1.63, 38]],
  ],
  pass: [
    // From the aisle behind Salim's left shoulder, at his head height (kept low: the desk hides all below
    // it): Eren's face and hands on the desktop, the plane, İbrahim's elbow at frame left.
    [0, [1.6, 1.0, 1.78, 2.72, 0.86, 2.44, 37]],
    [1, [1.63, 0.99, 1.8, 2.72, 0.86, 2.44, 35]],
  ],
  aim: [
    // Over İbrahim's right shoulder (Eren stays off-frame right): the plane in front of his eye,
    // lined up on the teacher's head at the end of the runway.
    [0, [2.25, 1.26, 3.12, 1.42, 1.0, -2.8, 34]],
    [1, [2.25, 1.26, 3.11, 1.42, 1.01, -2.8, 32]],
  ],
  whisper: [
    // Between him and the board, from his right: head and shoulders, the chalk hand at the board — the
    // chalk stops, the head tilts, the eyes slide.
    [0, [1.45, 1.8, -3.3, 0.46, 1.62, -2.98, 41]],
    [1, [1.42, 1.79, -3.3, 0.46, 1.63, -2.98, 38]],
  ],
  anger: [
    // From the board, to his right: his face (eyes shut, a breath) and his fist with the chalk (it snaps at 0.32).
    [0, [1.68, 1.6, -3.35, 0.66, 1.48, -2.84, 46]],
    [0.45, [1.6, 1.59, -3.35, 0.68, 1.48, -2.86, 42]],
    // Past his right shoulder to the back-right: the three heads.
    [0.46, [1.0, 1.55, -3.38, 1.99, 1.15, 2.22, 22]],
    [1, [1.0, 1.55, -3.38, 1.99, 1.15, 2.22, 20]],
  ],
  turn: [
    [0, [...R, 0.7, 1.55, -3.0, 40]],
    [0.48, [...R, 0.7, 1.55, -3.0, 40]],
    [0.56, [...R, 0.7, 1.6, -3.0, 34]],
    [1, [...R, 0.7, 1.6, -3.0, 33]],
  ],
  hush: [
    [0, [...R, 0.7, 1.55, -3.0, 40]],
    [0.15, [...R, 0.7, 1.55, -3.0, 40]],
    [0.15, [2.7, 2.3, -2.6, 3.0, 2.45, -3.46, 22]],
    [0.32, [2.76, 2.33, -2.7, 3.0, 2.45, -3.46, 20]],
    [0.32, [...R, 0.7, 1.55, -3.0, 40]],
    [1, [...R, 0.7, 1.55, -3.0, 40]],
  ],
  smooth: [
    // A medium shot from the runway: he bends for the plane, straightens, smooths its nose at his chest.
    [0, [1.5, 1.48, -1.55, 0.92, 1.12, -2.8, 46]],
    [0.09, [1.5, 1.44, -1.58, 0.92, 0.98, -2.75, 46]],
    [0.24, [1.42, 1.52, -1.66, 0.92, 1.36, -2.8, 39]],
    [0.5, [1.36, 1.51, -1.74, 0.92, 1.36, -2.8, 37]],
    // Insert, over his left shoulder: the wing, as he reads it.
    [0.5, [0.98, 1.7, -3.02, 0.66, 1.2, -2.48, 22]],
    [1, [0.96, 1.68, -3.0, 0.66, 1.2, -2.48, 20]],
  ],
  tip: [
    [0, [0.96, 1.66, -3.0, 0.66, 1.22, -2.5, 18]],
    [1, [0.94, 1.64, -2.98, 0.66, 1.22, -2.5, 17]],
  ],
  mock: [
    // A medium close-up from the front: his face over the plane in his hands, then the look over the glasses.
    [0, [0.4, 1.48, -1.5, 0.9, 1.42, -2.9, 36]],
    [1, [0.44, 1.5, -1.62, 0.9, 1.44, -2.9, 34]],
  ],
  summon: [
    [0, [...R, 0.7, 1.45, -3.0, 34]],
    [1, [...R, 0.7, 1.45, -3.0, 33]],
  ],
  rise: [
    // Close on his hands and lowered face; the class (and the sounds of three getting up) behind the camera.
    [0, [0.54, 1.4, -1.7, 0.72, 1.45, -2.8, 40]],
    [1, [0.56, 1.39, -1.75, 0.72, 1.44, -2.8, 39]],
  ],
  order: [
    // Behind him, over his right shoulder: the plane pointing at the empty corner.
    [0, [-0.45, 1.9, -2.12, 3.4, 1.05, -3.1, 38]],
    [1, [-0.4, 1.89, -2.15, 3.4, 1.05, -3.1, 37]],
  ],
  walk: [
    [0, [-3.1, 1.5, -2.9, -1.4, 1.0, 1.6, 42]],
    [1, [-3.0, 1.48, -2.8, -1.5, 1.0, 1.6, 41]],
  ],
  // Floor level, long lens from in front of the first row: the frame's left edge stays right of
  // the far end of Eren's right tire (the binding point) until lift 0.62 — see docs §3 4a.
  // (z −1.68: clear of the first-row desk's front panel behind the camera.)
  lineUp: [
    [0, [2.76, 0.13, -1.68, 2.9, 0.08, -2.8, 22]],
    [1, [2.75, 0.13, -1.68, 2.9, 0.08, -2.8, 22]],
  ],
  lift: [
    [0, [2.75, 0.13, -1.68, 2.9, 0.08, -2.8, 22]],
    [0.38, [2.75, 0.13, -1.68, 2.9, 0.08, -2.8, 22]],
    [0.62, [2.67, 0.13, -1.68, 2.81, 0.085, -2.79, 22]],
    [0.9, [1.95, 0.14, -1.68, 1.95, 0.1, -2.75, 22]],
    [1, [1.95, 0.14, -1.68, 1.95, 0.1, -2.75, 22]],
  ],
  reveal: [
    [0, [0.9, 1.55, 0.6, 2.55, 0.95, -3.0, 46]],
    [1, [0.95, 1.5, 0.4, 2.5, 0.95, -3.0, 44]],
  ],
  burst: [
    // The two heads together, whispering; Eren's shoulder and wheel at frame left.
    [0, [2.46, 1.24, -1.36, 2.8, 1.2, -2.8, 38]],
    [0.48, [2.5, 1.24, -1.46, 2.8, 1.2, -2.8, 36]],
    [0.5, [-0.6, 1.5, 1.2, 2.0, 1.0, -2.6, 52]],
    [1, [-0.5, 1.5, 1.0, 2.0, 1.0, -2.6, 50]],
  ],
  laughs: [
    [0, [...R, 2.4, 1.0, -3.0, 44]],
    [1, [...R, 2.3, 1.0, -3.0, 42]],
  ],
  still: [
    // Eren in his chair from the front-left: head to the tops of the wheels, hands on the rims; around
    // him the laugh goes on.
    [0, [1.62, 1.12, -1.5, 2.24, 0.78, -3.0, 40]],
    [0.5, [1.66, 1.1, -1.62, 2.22, 0.79, -3.0, 38]],
    // A cut closer and more frontal, then a slow push: his face over his still hands — nothing in it changes.
    [0.5, [1.8, 1.08, -1.72, 2.14, 0.82, -3.0, 34]],
    [1, [1.83, 1.06, -1.86, 2.14, 0.84, -3.0, 30]],
  ],
  flow: [
    // Behind him, over his right shoulder (his ear at frame left, out of the rail's way): the room as he
    // sees it, racing.
    [0, [1.8, 1.12, -3.36, 1.45, 0.95, 1.8, 44]],
    [1, [1.8, 1.12, -3.35, 1.3, 0.95, 1.8, 44]],
  ],
  end: [
    // High wide from the back-left; Eren low right of the title.
    [0, [-2.8, 2.75, 2.9, -0.5, 1.75, -1.5, 46]],
    [1, [-2.6, 2.7, 2.6, -0.5, 1.75, -1.5, 44]],
  ],
}

/** Locked (the reader cannot turn) — before the reveal, wherever a turn could find the chair (docs §3). */
export function lockedAt(seg: SegmentId, u: number): boolean {
  switch (seg) {
    case 'board':
      return u < 0.44
    case 'under':
    case 'fold':
    case 'pass':
    case 'aim':
    case 'anger':
    case 'rise':
    case 'order':
    case 'walk':
    case 'lineUp':
    case 'lift':
      return true
    case 'flight':
      return u < 0.44
    case 'hush':
      // The clock insert; then, after the glance, back on him (the look comes home).
      return (u >= 0.15 && u < 0.32) || u >= 0.56
    default:
      return false
  }
}

/** Segments before the reveal whose shots must keep a 16:9 width on wider screens. */
export const CLAMP_WIDE = new Set<SegmentId>(['board', 'under', 'fold', 'pass', 'aim', 'anger', 'rise', 'order', 'walk', 'lineUp', 'lift', 'flight'])
