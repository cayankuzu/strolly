/**
 * A shared vocabulary of body poses for the cast of every story built on the
 * figure rig. Rotations are radians (X forward/back, Y twist, Z side); arms
 * hang along −Y, so negative X swings them forward. Hands that must touch
 * something exactly are bent by `reach` on top of these.
 */
import { makePose, type PoseSpec } from './Figure'

const legsSeated: PoseSpec = {
  lThigh: [-1.52, 0, 0.06],
  rThigh: [-1.52, 0, -0.06],
  lShin: [1.45, 0, 0],
  rShin: [1.45, 0, 0],
  lFoot: [0.08, 0, 0],
  rFoot: [0.08, 0, 0],
}

export const STAND = makePose({
  lUpper: [0.03, 0, 0.07],
  rUpper: [0.03, 0, -0.07],
  lFore: [-0.12, 0, 0],
  rFore: [-0.12, 0, 0],
  head: [0.05, 0, 0],
})

/** Weight on one leg, a hand at rest on the hip line. Waiting. */
export const STAND_EASY = makePose({
  hipZ: 0.01,
  hips: [0, 0.05, 0.03],
  spine: [0, -0.04, -0.03],
  lThigh: [0, 0, -0.02],
  rThigh: [0.08, 0, -0.06],
  rShin: [0.14, 0, 0],
  lUpper: [0.06, 0, 0.1],
  rUpper: [-0.1, 0, -0.12],
  lFore: [-0.2, 0, 0],
  rFore: [-0.6, 0, 0],
  head: [0.08, 0.1, 0],
})

/** Bending to set something down low. */
export const LEAN = makePose({
  hipY: 0.94,
  hipZ: -0.03,
  spine: [0.4, 0, 0],
  chest: [0.24, 0, 0],
  neck: [0.08, 0, 0],
  head: [0.24, 0, 0],
  lThigh: [-0.18, 0, 0.02],
  rThigh: [-0.18, 0, -0.02],
  lShin: [0.3, 0, 0],
  rShin: [0.3, 0, 0],
  lFoot: [-0.1, 0, 0],
  rFoot: [-0.1, 0, 0],
  lUpper: [-0.2, 0, 0.12],
  rUpper: [-0.3, 0, -0.1],
  lFore: [-0.3, 0, 0],
  rFore: [-0.4, 0, 0],
})

/** A slight forward lean for things at counter height. */
export const LEAN_SOFT = makePose({
  spine: [0.16, 0, 0],
  chest: [0.1, 0, 0],
  head: [0.22, 0, 0],
  lUpper: [-0.1, 0, 0.1],
  rUpper: [-0.2, 0, -0.1],
  lFore: [-0.3, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** Carrying a cup at the waist. */
export const CARRY = makePose({
  lUpper: [0.03, 0, 0.07],
  rUpper: [-0.12, 0, -0.12],
  lFore: [-0.12, 0, 0],
  rFore: [-1.35, 0, 0.1],
  rHand: [0.25, 0, 0],
  head: [0.08, 0, 0],
})

/** Holding something at chest height in both hands, looking down at it. */
export const HOLD = makePose({
  spine: [0.06, 0, 0],
  chest: [0.04, 0, 0],
  neck: [0.12, 0, 0],
  head: [0.34, 0, 0],
  lUpper: [-0.4, 0, 0.18],
  rUpper: [-0.4, 0, -0.18],
  lFore: [-1.3, 0, 0],
  rFore: [-1.3, 0, 0],
})

export const SIT = makePose({
  hipY: 0.565,
  ...legsSeated,
  spine: [0.04, 0, 0],
  chest: [0.02, 0, 0],
  head: [0.08, 0, 0],
  lUpper: [-0.5, 0, 0.12],
  rUpper: [-0.5, 0, -0.12],
  lFore: [-1.0, 0, 0],
  rFore: [-1.0, 0, 0],
  lHand: [0.12, 0, 0],
  rHand: [0.12, 0, 0],
})

/** Reading at the table: forearms on the tabletop, head down. */
export const SIT_READ = makePose({
  spine: [0.18, 0, 0],
  chest: [0.12, 0, 0],
  neck: [0.12, 0, 0],
  head: [0.32, 0, 0],
  lUpper: [-0.62, 0, 0.2],
  rUpper: [-0.66, 0, -0.18],
  lFore: [-1.15, 0, 0.05],
  rFore: [-1.05, 0, -0.05],
}, SIT)

/** Not reading anymore. Not looking up either. */
export const SIT_STILL = makePose({
  spine: [0.1, 0, 0],
  chest: [0.08, 0, 0],
  neck: [0.16, 0, 0],
  head: [0.42, 0, 0],
  lUpper: [-0.56, 0, 0.16],
  rUpper: [-0.56, 0, -0.16],
  lFore: [-1.05, 0, 0],
  rFore: [-1.05, 0, 0],
}, SIT)

/** Ege, finally lifting his head. */
export const SIT_LOOK = makePose({
  spine: [0.06, 0, 0],
  chest: [0.02, 0, 0],
  neck: [0.02, 0, 0],
  head: [0.02, 0.08, 0],
}, SIT_STILL)

/** On the sofa, turned toward the window. */
export const SOFA = makePose({
  hipY: 0.5,
  lThigh: [-1.35, 0, 0.12],
  rThigh: [-1.3, 0, -0.04],
  lShin: [1.25, 0, 0],
  rShin: [1.45, 0, 0],
  lFoot: [0.1, 0, 0],
  rFoot: [0.1, 0, 0],
  spine: [-0.14, 0, 0],
  chest: [-0.06, 0.1, 0],
  neck: [0.02, 0.25, 0],
  head: [0.04, 0.45, 0],
  lUpper: [-0.3, 0, 0.28],
  rUpper: [-0.45, 0, -0.1],
  lFore: [-0.8, 0, 0],
  rFore: [-1.2, 0, 0],
})

/** Reaching out toward someone who is not turning around. */
export const REACH_OUT = makePose({
  spine: [0.05, 0, 0],
  chest: [0.04, 0, 0],
  head: [0.1, 0, 0],
  rUpper: [-0.9, 0, -0.06],
  rFore: [-0.3, 0, 0],
  rHand: [0.1, 0, 0],
}, STAND)

/** Seated at a desk, hands on the keyboard. */
export const SIT_TYPE = makePose(
  {
    spine: [0.14, 0, 0],
    chest: [0.06, 0, 0],
    neck: [0.06, 0, 0],
    head: [0.1, 0, 0],
    lUpper: [-0.5, 0, 0.16],
    rUpper: [-0.5, 0, -0.16],
    lFore: [-1.25, 0.2, 0],
    rFore: [-1.25, -0.2, 0],
    lHand: [0.3, 0, 0],
    rHand: [0.3, 0, 0],
  },
  SIT,
)

/** Seated, leaning back, hands in the lap. */
export const SIT_BACK = makePose(
  {
    spine: [-0.12, 0, 0],
    chest: [-0.04, 0, 0],
    head: [0.12, 0, 0],
    lUpper: [-0.3, 0, 0.1],
    rUpper: [-0.3, 0, -0.1],
    lFore: [-0.9, 0.3, 0],
    rFore: [-0.9, -0.3, 0],
  },
  SIT,
)

/** Seated, collapsed forward: tired, or worse. */
export const SIT_SLUMP = makePose(
  {
    spine: [0.32, 0, 0],
    chest: [0.22, 0, 0],
    neck: [0.2, 0, 0],
    head: [0.36, 0, 0],
    lUpper: [-0.2, 0, 0.12],
    rUpper: [-0.2, 0, -0.12],
    lFore: [-0.7, 0, 0],
    rFore: [-0.7, 0, 0],
  },
  SIT,
)

/** Looking down at a phone held in both hands. */
export const PHONE = makePose({
  neck: [0.22, 0, 0],
  head: [0.42, 0, 0],
  lUpper: [-0.32, 0, 0.22],
  rUpper: [-0.32, 0, -0.22],
  lFore: [-1.45, 0.25, 0],
  rFore: [-1.45, -0.25, 0],
  lHand: [0.3, 0, 0],
  rHand: [0.3, 0, 0],
})

/** Arms crossed, weight back: waiting, closed. */
export const ARMS_CROSSED = makePose({
  spine: [-0.04, 0, 0],
  head: [0.02, 0, 0],
  // The upper arms turn inward so each elbow's hinge folds the forearm across
  // the chest; the left lies over the right.
  lUpper: [-0.35, -1.1, 0.05],
  rUpper: [-0.25, 1.15, -0.05],
  lFore: [-1.7, 0, 0],
  rFore: [-1.65, 0, 0],
})

/** Fists, shoulders raised, leaning in. */
export const FISTS = makePose({
  hipZ: 0.02,
  spine: [0.12, 0, 0],
  chest: [0.08, 0, 0],
  neck: [-0.05, 0, 0],
  head: [-0.02, 0, 0],
  lUpper: [-0.15, 0, 0.22],
  rUpper: [-0.15, 0, -0.22],
  lFore: [-1.1, 0, 0],
  rFore: [-1.1, 0, 0],
  lHand: [0.4, 0, 0],
  rHand: [0.4, 0, 0],
})

/** A fist coming down on a table. */
export const SLAM = makePose({
  spine: [0.42, 0, 0],
  chest: [0.2, -0.15, 0],
  head: [0.1, 0, 0],
  rUpper: [-0.95, 0, -0.1],
  rFore: [-0.2, 0, 0],
  rHand: [0.2, 0, 0],
  lUpper: [-0.2, 0, 0.2],
  lFore: [-0.8, 0, 0],
})

/** Both arms raised, about to throw something heavy. */
export const WINDUP = makePose({
  spine: [-0.12, 0, 0],
  chest: [-0.12, 0, 0],
  head: [-0.1, 0, 0],
  lUpper: [-2.6, 0, 0.25],
  rUpper: [-2.6, 0, -0.25],
  lFore: [-0.4, 0, 0],
  rFore: [-0.4, 0, 0],
})

/** The throw, arms forward and down. */
export const THROW = makePose({
  spine: [0.35, 0, 0],
  chest: [0.2, 0, 0],
  head: [0.1, 0, 0],
  lUpper: [-1.35, 0, 0.12],
  rUpper: [-1.35, 0, -0.12],
  lFore: [-0.15, 0, 0],
  rFore: [-0.15, 0, 0],
})

/** Shoulders down, head down: after. */
export const SPENT = makePose({
  spine: [0.18, 0, 0],
  chest: [0.12, 0, 0],
  neck: [0.15, 0, 0],
  head: [0.3, 0, 0],
  lUpper: [0.05, 0, 0.06],
  rUpper: [0.05, 0, -0.06],
  lFore: [-0.1, 0, 0],
  rFore: [-0.1, 0, 0],
})

/** Seated, cowering: arms up in front of the face. */
export const COWER = makePose(
  {
    spine: [0.3, 0, 0],
    chest: [0.18, 0, 0],
    neck: [0.1, 0, 0],
    head: [0.3, 0, 0],
    lUpper: [-1.2, 0.3, 0.35],
    rUpper: [-1.2, -0.3, -0.35],
    lFore: [-1.9, 0, 0],
    rFore: [-1.9, 0, 0],
  },
  SIT,
)

/** Seated upright, looking straight ahead, hands on the knees. */
export const SIT_STRAIGHT = makePose(
  {
    spine: [0, 0, 0],
    chest: [0, 0, 0],
    head: [0, 0, 0],
    lUpper: [-0.35, 0, 0.12],
    rUpper: [-0.35, 0, -0.12],
    lFore: [-1.05, 0, 0],
    rFore: [-1.05, 0, 0],
  },
  SIT,
)

/** Listening to something held at the ear. */
export const LISTEN = makePose({
  neck: [0.08, 0, 0.12],
  head: [0.14, 0.1, 0.12],
  rUpper: [-0.4, 0, -0.65],
  rFore: [-2.3, 0, 0],
  rHand: [0.2, 0, 0],
  lUpper: [0.04, 0, 0.08],
  lFore: [-0.15, 0, 0],
})

/** Lying on a sofa (a body on its back; the scene turns the root). Arms rest along the body. */
export const LIE = makePose({
  hipY: 0.42,
  lThigh: [-0.06, 0, 0.04],
  rThigh: [-0.12, 0, -0.03],
  lShin: [0.12, 0, 0],
  rShin: [0.22, 0, 0],
  lUpper: [0.05, 0, 0.12],
  rUpper: [-0.25, 0, -0.1],
  lFore: [-0.2, 0, 0],
  rFore: [-1.2, 0, 0],
  head: [-0.15, 0.35, 0],
})
