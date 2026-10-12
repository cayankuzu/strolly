/**
 * YAŞAMAK's own body language on top of the shared rig: the run of a ten-year-
 * old, flopping back in a chair, a head thrown back, hands up, knitting, a nod.
 * Plus small helpers to nudge one joint of an actor's pose after a blend.
 */
import { JOINTS, makePose, type JointName, type Pose } from '../figure/Figure'
import * as P from '../figure/poses'
import type { Actor } from '../kit/direct'

const HEADER = 2
const at = (j: JointName, axis: 0 | 1 | 2) => HEADER + JOINTS.indexOf(j) * 3 + axis

/** Adds a rotation to one joint of the actor's current pose (call after hold/blend/walk, before apply). */
export function bump(a: Actor, j: JointName, x: number, y = 0, z = 0) {
  const p = a.pose
  p[at(j, 0)] += x
  p[at(j, 1)] += y
  p[at(j, 2)] += z
}

/** Lowers or raises the hips of the current pose. */
export function hipDrop(a: Actor, dy: number) {
  a.pose[0] += dy
}

/** Copy of a pose with a few joints overridden. */
export const varied = (base: Pose, spec: Parameters<typeof makePose>[0]) => makePose(spec, base)

/** A child running: leaning in, elbows bent. Used as the base of a fast walk. */
export const RUN = makePose({
  spine: [0.2, 0, 0],
  chest: [0.06, 0, 0],
  head: [-0.05, 0, 0],
  lUpper: [0, 0, 0.12],
  rUpper: [0, 0, -0.12],
  lFore: [-1.25, 0, 0],
  rFore: [-1.25, 0, 0],
})

/** Seated, flopped back, arms hanging off the sides: the game is over and it was great. */
export const FLOP = makePose(
  {
    hipZ: 0.05,
    spine: [-0.34, 0, 0],
    chest: [-0.14, 0, 0],
    neck: [-0.05, 0, 0],
    head: [-0.18, 0, 0],
    lUpper: [0.1, 0, 0.42],
    rUpper: [0.1, 0, -0.42],
    lFore: [-0.35, 0, 0],
    rFore: [-0.35, 0, 0],
  },
  P.SIT,
)

/**
 * Seated, thrown back against the chair with both hands on his head:
 * "Tam da yenecektim!" The arms are raised and bent; the director lands the
 * hands on the head exactly (touch), this is where they come from.
 */
export const ARMS_FLUNG = makePose(
  {
    spine: [-0.2, 0, 0],
    chest: [-0.08, 0, 0],
    neck: [-0.06, 0, 0],
    head: [-0.22, 0, 0],
    lUpper: [-1.5, 0, 0.75],
    rUpper: [-1.5, 0, -0.75],
    lFore: [-1.9, 0, 0],
    rFore: [-1.9, 0, 0],
  },
  P.SIT,
)

/** Seated, frozen, both hands lifted off the keys. */
export const HANDS_UP = makePose(
  {
    spine: [0.04, 0, 0],
    chest: [-0.04, 0, 0],
    head: [0.02, 0, 0],
    lUpper: [-0.85, 0, 0.32],
    rUpper: [-0.85, 0, -0.32],
    lFore: [-1.55, 0, 0],
    rFore: [-1.55, 0, 0],
  },
  P.SIT,
)

/** Seated, hands together in the lap, head bent over the knitting. */
export const KNIT = makePose(
  {
    spine: [0.16, 0, 0],
    chest: [0.08, 0, 0],
    neck: [0.18, 0, 0],
    head: [0.36, 0, 0],
    lUpper: [-0.3, 0, 0.12],
    rUpper: [-0.3, 0, -0.12],
    lFore: [-1.3, 0.35, 0],
    rFore: [-1.3, -0.35, 0],
  },
  P.SIT,
)

/** Seated upright, hands loose on the thighs, looking ahead (at a screen, at someone). */
export const SIT_UP = makePose(
  {
    spine: [0.02, 0, 0],
    chest: [0, 0, 0],
    head: [0.06, 0, 0],
    lUpper: [-0.32, 0, 0.1],
    rUpper: [-0.32, 0, -0.1],
    lFore: [-0.95, 0.2, 0],
    rFore: [-0.95, -0.2, 0],
  },
  P.SIT,
)

/** Leaning on both hands over a counter (hands placed exactly by reach). */
export const COUNTER_LEAN = makePose({
  hipZ: -0.04,
  spine: [0.3, 0, 0],
  chest: [0.12, 0, 0],
  neck: [-0.05, 0, 0],
  head: [-0.1, 0, 0],
  lUpper: [-0.6, 0, 0.12],
  rUpper: [-0.6, 0, -0.12],
  lFore: [-0.5, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** Standing, arms going back into a coat. */
export const COAT_ON = makePose({
  spine: [0.06, 0, 0],
  chest: [-0.04, 0, 0],
  head: [0.1, 0, 0],
  lUpper: [0.55, 0, 0.45],
  rUpper: [0.55, 0, -0.45],
  lFore: [-0.5, 0, 0],
  rFore: [-0.5, 0, 0],
})

/** Standing, the coat drawn closed at the chest with both hands. */
export const COAT_CLOSE = makePose({
  spine: [0.04, 0, 0],
  head: [0.12, 0, 0],
  lUpper: [-0.3, 0, 0.05],
  rUpper: [-0.3, 0, -0.05],
  lFore: [-1.7, 0.4, 0],
  rFore: [-1.7, -0.4, 0],
})

/** Standing at ease, a little stooped (the old). */
export const STAND_OLD = makePose({
  spine: [0.14, 0, 0],
  chest: [0.08, 0, 0],
  neck: [0.06, 0, 0],
  head: [0.02, 0, 0],
  lThigh: [-0.04, 0, 0.02],
  rThigh: [-0.04, 0, -0.02],
  lShin: [0.08, 0, 0],
  rShin: [0.08, 0, 0],
  lUpper: [0.02, 0, 0.08],
  rUpper: [0.02, 0, -0.08],
  lFore: [-0.2, 0, 0],
  rFore: [-0.2, 0, 0],
})

/** Seated, leaning toward someone on one side, elbow on the desk. */
export const SIT_LEAN_IN = makePose(
  {
    spine: [0.22, 0, 0.08],
    chest: [0.1, 0, 0.04],
    head: [0.1, 0, 0],
    lUpper: [-0.6, 0, 0.18],
    rUpper: [-0.5, 0, -0.16],
    lFore: [-1.3, 0.2, 0],
    rFore: [-1.2, -0.2, 0],
  },
  P.SIT,
)

export { P }
