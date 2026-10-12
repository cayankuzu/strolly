/**
 * What every part of the direction needs to know about one frame: where we
 * are in the story, what the reader chose, and the scripted points where
 * hands and things meet (so a prop and the hand that holds it agree).
 */
import * as THREE from 'three'
import type { SegmentId } from '@/stories/durum/timeline'

export type Ctx = {
  seg: SegmentId
  u: number
  p: number
  time: number
  breathe: boolean
  atSeg: (id: SegmentId, f?: number) => number
  coin: 'yazi' | 'tura' | 'none'
  glass: 'kitchen' | 'break' | 'none'
  box: 'one' | 'two'
  cf: 'air' | 'bus'
  q: 'nothing' | 'death' | 'what'
  end: 'yes' | 'no'
  observed: boolean
  /** Where the coffee jug is (lifted while he pours). */
  jugAt: THREE.Vector3
  /** The coin balanced on his thumbnail. */
  coinThumb: THREE.Vector3
  /** A slip held up to read. */
  slipHeld: THREE.Vector3
  /** The water glass in his hand. */
  glassHand: THREE.Vector3
  /** The page held in both hands. */
  pageAt: THREE.Vector3
  boxA: THREE.Vector3
  boxB: THREE.Vector3
  /** The cheque (box:one) or the banded notes (box:two) in his hand. */
  chequeAt: THREE.Vector3
  /** The fingertip on the wall display. */
  touch: THREE.Vector3
  phoneAt: THREE.Vector3
}

/** Arif's marks in the set (x, z). */
export const ARIF_POS = {
  rack: { x: 3.52, z: 3.12 },
  lamp: { x: -0.35, z: 0.12 },
  stand: { x: 0.42, z: 0.32 },
  coffee: { x: -4.12, z: 0.48 },
  printer: { x: -3.92, z: 2.95 },
  sink: { x: -2.6, z: 8.95 },
  /** M: his mark at the wall display, facing it. */
  wd: { x: 2.48, z: -2.06 },
  /** A step closer, for the touch. */
  touch: { x: 2.58, z: -2.42 },
  heat: { x: -2.95, z: -9.45 },
  door: { z: 3.6 },
}
