/**
 * PARALEL-LEŞ — the story's own poses (on top of the shared vocabulary).
 * X forward/back (negative swings an arm or a thigh forward), Y twist, Z side
 * (positive lifts the left arm out, negative the right).
 */
import { makePose } from '../figure/Figure'
import * as P from '../figure/poses'

export const STAND = P.STAND

/** On the line: arms out at shoulder height, looking at the thread ahead. */
export const ARMS_OUT = makePose({
  lUpper: [-0.08, 0, 1.28],
  rUpper: [-0.08, 0, -1.28],
  lFore: [-0.18, 0, 0],
  rFore: [-0.18, 0, 0],
  lHand: [0, 0, 0.15],
  rHand: [0, 0, -0.15],
  neck: [0.12, 0, 0],
  head: [0.22, 0, 0],
})

/** Hands pushed into the jacket pockets. */
export const POCKETS = makePose({
  lUpper: [0.16, 0.25, 0.2],
  rUpper: [0.16, -0.25, -0.2],
  lFore: [-0.62, 0, 0],
  rFore: [-0.62, 0, 0],
  lHand: [0.1, 0, 0.25],
  rHand: [0.1, 0, -0.25],
  neck: [0.08, 0, 0],
  head: [0.14, 0, 0],
})

/** Arms a little out from the body for balance while walking a narrow top. */
export const ARMS_HALF = makePose({
  lUpper: [0, 0, 0.62],
  rUpper: [0, 0, -0.62],
  lFore: [-0.3, 0, 0],
  rFore: [-0.3, 0, 0],
  head: [0.18, 0, 0],
})

/** Standing still with the arms at the sides (the dead on their plinths). */
export const STILL = makePose({
  lUpper: [0.02, 0, 0.06],
  rUpper: [0.02, 0, -0.06],
  lFore: [-0.06, 0, 0],
  rFore: [-0.06, 0, 0],
  lHand: [0, 0, 0.05],
  rHand: [0, 0, -0.05],
  neck: [0.06, 0, 0],
  head: [0.1, 0, 0],
})

/** Kneeling upright, leaning toward something low in front. */
export const KNEEL = makePose({
  hipY: 0.54,
  hipZ: -0.02,
  lThigh: [-0.25, 0, 0.06],
  rThigh: [-0.25, 0, -0.06],
  lShin: [1.82, 0, 0],
  rShin: [1.82, 0, 0],
  lFoot: [0.55, 0, 0],
  rFoot: [0.55, 0, 0],
  spine: [0.3, 0, 0],
  chest: [0.16, 0, 0],
  neck: [0.1, 0, 0],
  head: [0.3, 0, 0],
  lUpper: [-0.5, 0, 0.12],
  rUpper: [-0.6, 0, -0.12],
  lFore: [-0.9, 0, 0],
  rFore: [-0.9, 0, 0],
})

/** Sitting on the ground at an edge, legs hanging over it. */
export const SIT_EDGE = makePose({
  hipY: 0.12,
  lThigh: [-1.5, 0, 0.08],
  rThigh: [-1.5, 0, -0.08],
  lShin: [1.35, 0, 0],
  rShin: [1.5, 0, 0],
  lFoot: [0.35, 0, 0],
  rFoot: [0.3, 0, 0],
  spine: [0.12, 0, 0],
  chest: [0.06, 0, 0],
  neck: [0.08, 0, 0],
  head: [0.32, 0, 0],
  lUpper: [0.25, 0, 0.32],
  rUpper: [0.25, 0, -0.32],
  lFore: [-0.35, 0, 0],
  rFore: [-0.35, 0, 0],
  lHand: [-0.3, 0, 0],
  rHand: [-0.3, 0, 0],
})

/** Leaning out over the edge from sitting, hands on the rim. */
export const LEAN_OUT = makePose(
  {
    spine: [0.62, 0, 0],
    chest: [0.32, 0, 0],
    neck: [0.2, 0, 0],
    head: [0.45, 0, 0],
    lUpper: [-0.55, 0, 0.3],
    rUpper: [-0.55, 0, -0.3],
    lFore: [-0.2, 0, 0],
    rFore: [-0.2, 0, 0],
  },
  SIT_EDGE,
)

/** Thrown back onto the floor, legs out, propped on the hands behind. */
export const SIT_FLOOR = makePose({
  hipY: 0.11,
  lThigh: [-1.25, 0, 0.12],
  rThigh: [-1.2, 0, -0.1],
  lShin: [0.55, 0, 0],
  rShin: [0.35, 0, 0],
  lFoot: [0.1, 0, 0],
  rFoot: [0.2, 0, 0],
  spine: [-0.18, 0, 0],
  chest: [-0.06, 0, 0],
  neck: [0.06, 0, 0],
  head: [0.12, 0, 0],
  lUpper: [0.75, 0, 0.22],
  rUpper: [0.75, 0, -0.22],
  lFore: [-0.15, 0, 0],
  rFore: [-0.15, 0, 0],
  lHand: [-0.6, 0, 0],
  rHand: [-0.6, 0, 0],
})

/** Hanging from both hands, arms straight up. */
export const HANG = makePose({
  lUpper: [-3.0, 0, 0.1],
  rUpper: [-3.0, 0, -0.1],
  lFore: [-0.12, 0, 0],
  rFore: [-0.12, 0, 0],
  lHand: [-0.2, 0, 0],
  rHand: [-0.2, 0, 0],
  spine: [0.04, 0, 0],
  neck: [-0.12, 0, 0],
  head: [-0.22, 0, 0],
  lThigh: [-0.22, 0, 0.04],
  rThigh: [-0.12, 0, -0.03],
  lShin: [0.38, 0, 0],
  rShin: [0.22, 0, 0],
  lFoot: [0.45, 0, 0],
  rFoot: [0.4, 0, 0],
})

/** Hanging with one knee hooked over a beam. */
export const HANG_KNEE = makePose(
  {
    spine: [0.2, 0, 0],
    chest: [0.12, 0, 0],
    neck: [-0.2, 0, 0],
    head: [-0.2, 0, 0],
    lThigh: [-2.3, 0, 0.08],
    rThigh: [-1.3, 0, -0.06],
    lShin: [2.2, 0, 0],
    rShin: [0.9, 0, 0],
  },
  HANG,
)

/** Tumbling under a wave: curled, arms loose. */
export const TUMBLE = makePose({
  hipY: 0.985,
  lThigh: [-1.4, 0, 0.2],
  rThigh: [-1.1, 0, -0.15],
  lShin: [1.7, 0, 0],
  rShin: [1.3, 0, 0],
  lFoot: [0.5, 0, 0],
  rFoot: [0.5, 0, 0],
  spine: [0.45, 0, 0],
  chest: [0.2, 0, 0],
  neck: [0.2, 0, 0],
  head: [0.3, 0, 0],
  lUpper: [-1.2, 0.3, 0.6],
  rUpper: [-0.6, -0.2, -0.9],
  lFore: [-1.2, 0, 0],
  rFore: [-0.7, 0, 0],
})

/** Treading water, arms out, chest up. */
export const TREAD = makePose({
  lUpper: [-0.5, 0, 1.0],
  rUpper: [-0.5, 0, -1.0],
  lFore: [-0.6, 0, 0],
  rFore: [-0.6, 0, 0],
  lThigh: [-0.5, 0, 0.12],
  rThigh: [-0.2, 0, -0.1],
  lShin: [0.9, 0, 0],
  rShin: [0.6, 0, 0],
  lFoot: [0.6, 0, 0],
  rFoot: [0.6, 0, 0],
  neck: [-0.2, 0, 0],
  head: [-0.3, 0, 0],
})

/** Swimming up: arms reaching over the head, legs kicking. */
export const STROKE = makePose({
  lUpper: [-2.9, 0, 0.25],
  rUpper: [-2.9, 0, -0.25],
  lFore: [-0.2, 0, 0],
  rFore: [-0.2, 0, 0],
  lThigh: [-0.25, 0, 0.05],
  rThigh: [0.15, 0, -0.05],
  lShin: [0.5, 0, 0],
  rShin: [0.3, 0, 0],
  lFoot: [0.9, 0, 0],
  rFoot: [0.9, 0, 0],
  neck: [-0.15, 0, 0],
  head: [-0.25, 0, 0],
})

/** Diving into a wave face: arms together over the head. */
export const DIVE = makePose({
  lUpper: [-3.05, 0, 0.12],
  rUpper: [-3.05, 0, -0.12],
  lFore: [-0.05, 0, 0],
  rFore: [-0.05, 0, 0],
  neck: [0.15, 0, 0],
  head: [0.25, 0, 0],
  lThigh: [0.05, 0, 0.02],
  rThigh: [0.25, 0, -0.02],
  lShin: [0.15, 0, 0],
  rShin: [0.5, 0, 0],
  lFoot: [0.8, 0, 0],
  rFoot: [0.8, 0, 0],
})

/** Standing on the pedals, knees bent, leaning over the bars. */
export const BIKE_STAND = makePose({
  hipY: 0.86,
  lThigh: [-0.62, 0, 0.1],
  rThigh: [-0.3, 0, -0.1],
  lShin: [0.95, 0, 0],
  rShin: [0.55, 0, 0],
  lFoot: [-0.2, 0, 0],
  rFoot: [-0.15, 0, 0],
  spine: [0.55, 0, 0],
  chest: [0.2, 0, 0],
  neck: [-0.25, 0, 0],
  head: [-0.3, 0, 0],
  lUpper: [-1.0, 0, 0.3],
  rUpper: [-1.0, 0, -0.3],
  lFore: [-0.5, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** In the air over the cleft: crouched on the bike. */
export const BIKE_AIR = makePose(
  {
    hipY: 0.76,
    lThigh: [-0.95, 0, 0.12],
    rThigh: [-0.85, 0, -0.12],
    lShin: [1.3, 0, 0],
    rShin: [1.2, 0, 0],
    spine: [0.62, 0, 0],
    chest: [0.18, 0, 0],
  },
  BIKE_STAND,
)

/** A deep landing: knees bent, one hand to the ground. */
export const LAND = makePose({
  hipY: 0.5,
  hipZ: -0.08,
  lThigh: [-1.45, 0, 0.18],
  rThigh: [-0.9, 0, -0.12],
  lShin: [2.1, 0, 0],
  rShin: [1.9, 0, 0],
  lFoot: [-0.4, 0, 0],
  rFoot: [0.3, 0, 0],
  spine: [0.62, 0, 0],
  chest: [0.2, 0, 0],
  neck: [-0.1, 0, 0],
  head: [-0.05, 0, 0],
  lUpper: [-0.3, 0, 0.35],
  rUpper: [-0.9, 0, -0.25],
  lFore: [-0.3, 0, 0],
  rFore: [-0.2, 0, 0],
})

/** Mid-leap: one leg reaching forward, arms up and forward. */
export const LEAP = makePose({
  hipY: 0.95,
  lThigh: [-1.1, 0, 0.08],
  rThigh: [0.45, 0, -0.06],
  lShin: [0.5, 0, 0],
  rShin: [1.2, 0, 0],
  lFoot: [0.2, 0, 0],
  rFoot: [0.6, 0, 0],
  spine: [0.25, 0, 0],
  chest: [0.05, 0, 0],
  neck: [-0.15, 0, 0],
  head: [-0.1, 0, 0],
  lUpper: [-1.9, 0, 0.45],
  rUpper: [-1.5, 0, -0.5],
  lFore: [-0.4, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** Running: leaning into it. (Walk with a long stride on top.) */
export const RUN = makePose({
  spine: [0.22, 0, 0],
  chest: [0.08, 0, 0],
  head: [-0.04, 0, 0],
  lUpper: [0, 0, 0.12],
  rUpper: [0, 0, -0.12],
  lFore: [-1.2, 0, 0],
  rFore: [-1.2, 0, 0],
})

/** At the parapet: hands on its top, leaning over to look down. */
export const LEAN_OVER = makePose({
  hipZ: -0.04,
  spine: [0.45, 0, 0],
  chest: [0.32, 0, 0],
  neck: [0.25, 0, 0],
  head: [0.55, 0, 0],
  lThigh: [-0.08, 0, 0.03],
  rThigh: [-0.08, 0, -0.03],
  lShin: [0.12, 0, 0],
  rShin: [0.12, 0, 0],
  lUpper: [-0.75, 0, 0.18],
  rUpper: [-0.75, 0, -0.18],
  lFore: [-0.35, 0, 0],
  rFore: [-0.35, 0, 0],
})

/** One foot up on a low wall, looking across. */
export const FOOT_UP = makePose({
  rThigh: [-1.05, 0, -0.06],
  rShin: [1.0, 0, 0],
  rFoot: [-0.05, 0, 0],
  lThigh: [0.05, 0, 0.03],
  spine: [0.14, 0, 0],
  neck: [0.04, 0, 0],
  head: [0.06, 0, 0],
  lUpper: [0.05, 0, 0.1],
  rUpper: [-0.45, 0, -0.18],
  lFore: [-0.2, 0, 0],
  rFore: [-0.9, 0, 0],
})

/** A flashlight held out in front, at chest height. */
export const TORCH = makePose({
  rUpper: [-1.15, 0.1, -0.12],
  rFore: [-0.35, 0, 0],
  rHand: [0.15, 0, 0],
  lUpper: [0.04, 0, 0.12],
  lFore: [-0.2, 0, 0],
  head: [0.12, 0, 0],
})

/** Arms opening out to the sides, slowly: the wings. */
export const WINGS = makePose({
  lUpper: [-0.05, 0, 1.42],
  rUpper: [-0.05, 0, -1.42],
  lFore: [-0.05, 0, 0.05],
  rFore: [-0.05, 0, -0.05],
  lHand: [0, 0, 0.1],
  rHand: [0, 0, -0.1],
  head: [0.02, 0, 0],
})

/** Seated on a swing plank, hands up on the ropes (reach does the hands). */
export const SWING_SIT = makePose({
  hipY: 0.565,
  lThigh: [-1.45, 0, 0.08],
  rThigh: [-1.45, 0, -0.08],
  lShin: [1.35, 0, 0],
  rShin: [1.4, 0, 0],
  lFoot: [0.35, 0, 0],
  rFoot: [0.35, 0, 0],
  spine: [0.02, 0, 0],
  chest: [0.0, 0, 0],
  head: [0.1, 0, 0],
  lUpper: [-0.9, 0, 0.3],
  rUpper: [-0.9, 0, -0.3],
  lFore: [-1.4, 0, 0],
  rFore: [-1.4, 0, 0],
})

/** At the front of the arc: knees bent so the shins hang toward the abyss, toes pointed down, leaning back. */
export const SWING_FWD = makePose(
  {
    lThigh: [-1.3, 0, 0.1],
    rThigh: [-1.3, 0, -0.1],
    lShin: [1.75, 0, 0],
    rShin: [1.85, 0, 0],
    lFoot: [0.95, 0, 0],
    rFoot: [0.95, 0, 0],
    spine: [-0.22, 0, 0],
    chest: [-0.08, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.28, 0, 0],
  },
  SWING_SIT,
)

/** Going back: legs tucked under the plank, leaning forward. */
export const SWING_BACK = makePose(
  {
    lThigh: [-1.55, 0, 0.08],
    rThigh: [-1.55, 0, -0.08],
    lShin: [2.05, 0, 0],
    rShin: [2.0, 0, 0],
    lFoot: [0.4, 0, 0],
    rFoot: [0.4, 0, 0],
    spine: [0.16, 0, 0],
    chest: [0.06, 0, 0],
    head: [0.05, 0, 0],
  },
  SWING_SIT,
)

/** Letting go: arms flung up and out, falling back. */
export const LET_GO = makePose({
  lUpper: [-2.4, 0, 0.9],
  rUpper: [-2.4, 0, -0.9],
  lFore: [-0.3, 0, 0],
  rFore: [-0.3, 0, 0],
  lThigh: [-0.9, 0, 0.15],
  rThigh: [-0.6, 0, -0.15],
  lShin: [0.9, 0, 0],
  rShin: [0.6, 0, 0],
  spine: [-0.2, 0, 0],
  head: [-0.3, 0, 0],
})

/** Falling, turning slowly: limbs loose. */
export const FALL = makePose({
  lUpper: [-1.6, 0, 1.0],
  rUpper: [-1.2, 0, -1.2],
  lFore: [-0.5, 0, 0],
  rFore: [-0.3, 0, 0],
  lThigh: [-0.6, 0, 0.2],
  rThigh: [-0.2, 0, -0.2],
  lShin: [0.8, 0, 0],
  rShin: [0.4, 0, 0],
  spine: [-0.15, 0, 0],
  head: [-0.2, 0, 0],
})

/** Holding something up in one hand at head height (the can, a toast). */
export const TOAST = makePose({
  rUpper: [-1.35, 0.15, -0.25],
  rFore: [-0.55, 0, 0],
  rHand: [0.1, 0, 0],
  lUpper: [0.14, 0.2, 0.18],
  lFore: [-0.6, 0, 0],
  head: [0.0, 0, 0],
})

/** A shrug from the floor. */
export const SHRUG = makePose(
  {
    lUpper: [0.55, 0, 0.42],
    rUpper: [0.2, 0, -0.5],
    rFore: [-1.4, 0, 0],
    rHand: [0.4, 0, 0],
    neck: [0.0, 0, 0.1],
    head: [0.0, 0, 0.12],
  },
  SIT_FLOOR,
)

/** Climbing: reaching up the rock. */
export const CLIMB = makePose({
  spine: [0.35, 0, 0],
  chest: [0.12, 0, 0],
  head: [-0.1, 0, 0],
  lThigh: [-0.9, 0, 0.1],
  lShin: [1.2, 0, 0],
  rThigh: [0.1, 0, -0.05],
  rShin: [0.3, 0, 0],
  lUpper: [-2.2, 0, 0.3],
  rUpper: [-1.2, 0, -0.3],
  lFore: [-0.4, 0, 0],
  rFore: [-0.6, 0, 0],
})
