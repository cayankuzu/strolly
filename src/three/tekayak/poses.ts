/** TEK AYAK's own poses (on top of the shared vocabulary in figure/poses.ts). */
import { makePose } from '../figure/Figure'
import { HOLD, LEAN, SIT, STAND } from '../figure/poses'

// ——— Seated at the desks ———

/** Bent over the notebook, writing. */
export const K_WRITE = makePose(
  {
    spine: [0.22, 0, 0],
    chest: [0.14, 0, 0],
    neck: [0.16, 0, 0],
    head: [0.36, 0, 0],
    lUpper: [-0.55, 0, 0.2],
    rUpper: [-0.6, 0, -0.18],
    lFore: [-1.2, 0, 0],
    rFore: [-1.1, 0, 0],
  },
  SIT,
)

/** The three: bent a few degrees further than anyone else. */
export const K_LOW = makePose(
  {
    spine: [0.36, 0, 0],
    chest: [0.24, 0, 0],
    neck: [0.22, 0, 0],
    head: [0.42, 0, 0],
    lUpper: [-0.3, 0, 0.15],
    rUpper: [-0.3, 0, -0.15],
    lFore: [-1.0, 0, 0],
    rFore: [-1.0, 0, 0],
  },
  SIT,
)

/** Sitting up, frozen: the shout. */
export const K_UP = makePose(
  {
    spine: [0.0, 0, 0],
    chest: [0.0, 0, 0],
    neck: [0.02, 0, 0],
    head: [0.06, 0, 0],
    lUpper: [-0.45, 0, 0.16],
    rUpper: [-0.45, 0, -0.16],
    lFore: [-1.1, 0, 0],
    rFore: [-1.1, 0, 0],
  },
  SIT,
)

/** Head bowed, still: nobody moves. */
export const K_STILL = makePose(
  {
    spine: [0.12, 0, 0],
    chest: [0.08, 0, 0],
    neck: [0.16, 0, 0],
    head: [0.3, 0, 0],
  },
  K_UP,
)

/** Head back, laughing. */
export const K_LAUGH = makePose(
  {
    spine: [-0.12, 0, 0],
    chest: [-0.1, 0, 0],
    neck: [-0.15, 0, 0],
    head: [-0.32, 0, 0],
    lUpper: [-0.35, 0, 0.2],
    rUpper: [-0.35, 0, -0.2],
    lFore: [-1.3, 0, 0],
    rFore: [-1.3, 0, 0],
  },
  SIT,
)

/** Doubled over the desk with laughter. */
export const K_DOUBLE = makePose(
  {
    spine: [0.42, 0, 0],
    chest: [0.26, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.2, 0, 0],
    lUpper: [-0.9, 0, 0.3],
    rUpper: [-0.9, 0, -0.3],
    lFore: [-1.4, 0, 0],
    rFore: [-1.4, 0, 0],
  },
  SIT,
)

/** Salim turned half round toward the back row. */
export const K_TURNED = makePose(
  {
    spine: [0.08, 0.35, 0],
    chest: [0.04, 0.45, 0],
    neck: [0.05, 0.3, 0],
    head: [0.15, 0.45, 0],
    lUpper: [-0.4, 0, 0.25],
    rUpper: [-0.2, 0, -0.35],
    lFore: [-1.2, 0, 0],
    rFore: [-1.4, 0, 0],
  },
  SIT,
)

/** Leaning in toward the next seat (the three, conspiring). */
export const K_LEAN_IN = makePose(
  {
    spine: [0.28, 0, 0],
    chest: [0.18, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.22, 0, 0],
    lUpper: [-0.7, 0, 0.25],
    rUpper: [-0.7, 0, -0.25],
    lFore: [-1.3, 0, 0],
    rFore: [-1.3, 0, 0],
  },
  SIT,
)

/** Salim, innocent: studying the ceiling. */
export const K_CEILING = makePose(
  {
    spine: [-0.05, 0, 0],
    chest: [-0.06, 0, 0],
    neck: [-0.28, 0, 0],
    head: [-0.42, 0, 0],
    lUpper: [-0.3, 0, 0.12],
    rUpper: [-0.3, 0, -0.12],
    lFore: [-1.0, 0, 0],
    rFore: [-1.0, 0, 0],
  },
  SIT,
)

/** İbrahim aiming: the plane at eye level in the right hand. */
export const K_AIM = makePose(
  {
    spine: [0.05, 0.12, 0],
    chest: [0.02, 0.1, 0],
    neck: [0.0, -0.12, 0],
    head: [0.05, -0.1, 0],
    lUpper: [-0.6, 0, 0.2],
    lFore: [-1.2, 0, 0],
    rUpper: [-1.6, 0.2, -0.25],
    rFore: [-1.4, 0, 0],
    rHand: [0.3, 0, 0],
  },
  SIT,
)

/** The throw: arm out along the runway. */
export const K_THROW = makePose(
  {
    spine: [0.18, -0.12, 0],
    chest: [0.12, -0.15, 0],
    neck: [0.0, 0.1, 0],
    head: [0.05, 0.1, 0],
    lUpper: [-0.6, 0, 0.2],
    lFore: [-1.2, 0, 0],
    rUpper: [-1.75, 0, -0.1],
    rFore: [-0.15, 0, 0],
    rHand: [-0.2, 0, 0],
  },
  SIT,
)

/** In the wheelchair: thighs level, shins down to the footplate. */
export const E_CHAIR = makePose({
  hipY: 0.565,
  lThigh: [-1.48, 0, 0.04],
  rThigh: [-1.48, 0, -0.04],
  lShin: [1.22, 0, 0],
  rShin: [1.22, 0, 0],
  lFoot: [0.22, 0, 0],
  rFoot: [0.22, 0, 0],
  spine: [0.0, 0, 0],
  chest: [0.0, 0, 0],
  neck: [0.02, 0, 0],
  head: [0.04, 0, 0],
  lUpper: [-0.12, 0, 0.18],
  rUpper: [-0.12, 0, -0.18],
  lFore: [-0.5, 0, 0],
  rFore: [-0.5, 0, 0],
})

// ——— Standing ———

/** Standing, head down (the punished, before the order). */
export const S_HEAD_DOWN = makePose(
  {
    neck: [0.2, 0, 0],
    head: [0.3, 0, 0],
    lUpper: [0.05, 0, 0.05],
    rUpper: [0.05, 0, -0.05],
  },
  STAND,
)

/** On one foot, the right one lifted behind, arms out for balance. */
export const ONE_FOOT_R = makePose(
  {
    hipY: 0.975,
    hips: [0, 0, 0.04],
    spine: [0.04, 0, -0.04],
    rThigh: [-0.35, 0, -0.08],
    rShin: [1.35, 0, 0],
    rFoot: [0.3, 0, 0],
    lThigh: [0.02, 0, 0.03],
    lUpper: [-0.1, 0, 0.75],
    rUpper: [-0.1, 0, -0.75],
    lFore: [-0.3, 0, 0],
    rFore: [-0.3, 0, 0],
    head: [0.06, 0, 0],
  },
  STAND,
)

/** On one foot, the left one lifted. */
export const ONE_FOOT_L = makePose(
  {
    hipY: 0.975,
    hips: [0, 0, -0.04],
    spine: [0.04, 0, 0.04],
    lThigh: [-0.4, 0, 0.08],
    lShin: [1.3, 0, 0],
    lFoot: [0.3, 0, 0],
    rThigh: [0.02, 0, -0.03],
    lUpper: [-0.1, 0, 0.7],
    rUpper: [-0.1, 0, -0.7],
    lFore: [-0.3, 0, 0],
    rFore: [-0.3, 0, 0],
    head: [0.06, 0, 0],
  },
  STAND,
)

// ——— The teacher ———

/** At the board, the right arm up to the writing (the hand is placed by reach). */
export const T_WRITE = makePose(
  {
    spine: [0.02, 0.12, 0],
    chest: [0.0, 0.1, 0],
    neck: [-0.06, -0.08, 0],
    head: [-0.06, -0.1, 0],
    lUpper: [0.02, 0, 0.08],
    lFore: [-0.35, 0, 0],
    rUpper: [-1.6, 0, -0.3],
    rFore: [-0.9, 0, 0],
  },
  STAND,
)

/** Holding something at chest height, looking down at it. */
export const T_HOLD = makePose({ head: [0.4, 0, 0], neck: [0.16, 0, 0] }, HOLD)

/** Pointing with the right arm out (the plane in the hand). */
export const T_POINT = makePose(
  {
    spine: [0.0, -0.1, 0],
    chest: [0.0, -0.08, 0],
    head: [0.0, 0.1, 0],
    rUpper: [-1.45, 0.2, -0.12],
    rFore: [-0.12, 0, 0],
    rHand: [0.1, 0, 0],
    lUpper: [0.05, 0, 0.08],
    lFore: [-0.2, 0, 0],
  },
  STAND,
)

/** Bending to pick something up from the floor. */
export const T_BEND = makePose(
  {
    hipY: 0.82,
    hipZ: -0.08,
    spine: [0.55, 0, 0],
    chest: [0.32, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.3, 0, 0],
    lThigh: [-0.55, 0, 0.06],
    rThigh: [-0.75, 0, -0.06],
    lShin: [0.85, 0, 0],
    rShin: [1.05, 0, 0],
    lFoot: [-0.3, 0, 0],
    rFoot: [-0.3, 0, 0],
    lUpper: [-0.4, 0, 0.12],
    rUpper: [-0.8, 0, -0.1],
    lFore: [-0.5, 0, 0],
    rFore: [-0.3, 0, 0],
  },
  LEAN,
)

/** Standing, arms at rest, a little heavy. */
export const T_STAND = makePose({ spine: [0.04, 0, 0], head: [0.06, 0, 0], lFore: [-0.25, 0, 0], rFore: [-0.3, 0, 0] }, STAND)

// ——— The three, close up ———

/** Leaning in over the desk toward the next row, the face up (İbrahim and Eren, conspiring). */
export const K_CONSPIRE = makePose(
  {
    spine: [0.3, 0, 0],
    chest: [0.12, 0, 0],
    neck: [-0.1, 0, 0],
    head: [-0.2, 0, 0],
    lUpper: [-0.75, 0, 0.3],
    rUpper: [-0.75, 0, -0.3],
    lFore: [-1.35, 0, 0],
    rFore: [-1.35, 0, 0],
  },
  SIT,
)

/** Writing on something on the desk, head bowed only so far (the face stays readable). */
export const K_PEN = makePose(
  {
    spine: [0.16, 0, 0],
    chest: [0.08, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.14, 0, 0],
    lUpper: [-0.55, 0, 0.22],
    rUpper: [-0.6, 0, -0.2],
    lFore: [-1.25, 0, 0],
    rFore: [-1.15, 0, 0],
  },
  SIT,
)

/** Folding in the lap under the desk: hunched, eyes on the hands. */
export const K_FOLD = makePose(
  {
    spine: [0.26, 0, 0],
    chest: [0.14, 0, 0],
    neck: [0.12, 0, 0],
    head: [0.22, 0, 0],
    lUpper: [-0.3, 0, 0.15],
    rUpper: [-0.3, 0, -0.15],
    lFore: [-1.0, 0, 0],
    rFore: [-1.0, 0, 0],
  },
  SIT,
)

// ——— On one foot in the corner, each with his own arms ———
// (Salim's outer arm is free toward the wall; İbrahim stands between Salim and Eren and keeps his close.)

const armsOut = (base: ReturnType<typeof makePose>, l: number, r: number) =>
  makePose({ lUpper: [-0.12, 0, l], rUpper: [-0.12, 0, -r], lFore: [-0.4, 0, 0], rFore: [-0.4, 0, 0] }, base)

export const SALIM_ONE_R = armsOut(ONE_FOOT_R, 0.8, 0.14)
export const SALIM_ONE_L = armsOut(ONE_FOOT_L, 0.8, 0.14)
export const IBRAHIM_ONE_L = armsOut(ONE_FOOT_L, 0.2, 0.14)
export const IBRAHIM_ONE_R = armsOut(ONE_FOOT_R, 0.2, 0.14)
