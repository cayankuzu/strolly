/**
 * TEK AYAK — where everything is (docs/stories/tekayak.md §2). Meters; x right
 * (door), y up, z toward the back of the room; the class faces −z (the board).
 */
import * as THREE from 'three'

export const ROOM = { x0: -4, x1: 4, z0: -3.5, z1: 3.5, h: 3.2 }

/** Desk columns (window, middle, door) and rows (front → back). */
export const COLS = [-2.4, 0, 2.4] as const
export const ROWS = [-1.3, -0.1, 1.1, 2.3] as const
export const CHAIR_Z = [-0.85, 0.35, 1.55, 2.75] as const
export const DESK = { w: 1.2, d: 0.5, top: 0.72, panelBottom: 0.035 }
export const SEAT_DX = 0.3

/** The reader's seat (middle column, row 2, right): no figure, only the eye. */
export const R_EYE = new THREE.Vector3(0.3, 1.1, 0.35)

export const BOARD = { x: 0, y: 1.5, z: -3.47, w: 3.6, h: 1.2, tray: 0.88 }
/** The chalk law (right half of the board) and the title (center-left). */
export const LAW = { x0: 0.25, x1: 1.72, y0: 1.12, y1: 1.78 }
export const TITLE = { x0: -1.2, x1: -0.08, y: 1.82 }

export const CLOCK_POS = new THREE.Vector3(3.0, 2.45, -3.46)
export const TEACHER_DESK = { x: -2.5, z: -2.45, top: 0.76 }
export const BIN = { x: 3.55, z: -3.15 }
export const SEAM_Z = -2.62
export const DOOR = { x: 3.98, z: -2.1, w: 1.0, h: 2.1 }
export const STAIN = new THREE.Vector3(2.0, 3.19, 0.6)
export const HEART = new THREE.Vector3(0.42, 0.73, -0.05)
/** Windows on the left wall: centers along z. */
export const WINDOWS = [-2.2, 0, 2.2] as const
export const WIN = { w: 1.5, y0: 1.0, y1: 2.9 }

/** The trio at their desks. */
export const SALIM_SEAT = { x: 2.1, z: 1.55 }
export const IBRAHIM_SEAT = { x: 2.06, z: 2.75 }
/** Eren's wheelchair seat, pulled in close under his desk (the footplate and his knees under it). */
export const EREN_SEAT = { x: 2.7, z: 2.68 }
export const GIRL_SEAT = { x: 2.7, z: 1.55 }

/** The bin corner, from `walk` on (all face the class, +z). */
export const CORNER = {
  salim: { x: 3.15, z: -2.78 },
  ibrahim: { x: 2.65, z: -2.78 },
  /** Wheelchair seat center; rear axle at z −3.2. */
  eren: { x: 1.95, z: -3.05 },
}

/** The teacher at the board: where he stands to write the title and the law. */
export const AT_BOARD = { title: { x: -1.05, z: -2.98 }, law: { x: 0.42, z: -2.98 }, turned: { x: 0.72, z: -2.92 } }

/** The plane's way down the runway (flight), and where it lands. */
export const FLIGHT = {
  from: new THREE.Vector3(2.12, 1.15, 2.42),
  to: new THREE.Vector3(0.74, 1.66, -2.8),
  floor: new THREE.Vector3(0.92, 0.006, -2.58),
}

/** The sun at 15.12 (low, from the left windows, slightly from behind) and at the bell. */
// (More from the side than docs §1's (0.80, −0.38, −0.46), so the front window's beam crosses the air
// in front of the board's left half at head height — the dust beam — instead of meeting the front wall.)
export const SUN_DIR_A = new THREE.Vector3(0.88, -0.33, -0.34).normalize()
export const SUN_DIR_B = new THREE.Vector3(0.982, -0.148, -0.118).normalize()
