/**
 * ÖTE — what every staging function shares: the built sets, the cast, the
 * crowd, the sky, one pool of lights that moves from set to set (so no
 * material ever recompiles for a light switched on or off), and small
 * helpers for placing things relative to a person.
 */
import * as THREE from 'three'
import type { SegmentId } from '@/stories/ote/timeline'
import type { Actor } from '../kit/direct'
import type { HdriId } from '../kit/assets'
import type { Pal } from './materials'
import type { Cast, CastId } from './cast'
import type { SigningRoom } from './signing'
import type { Corridor } from './corridor'
import type { LaunchExterior, ShuttleCabin } from './shuttle'
import type { Habitat } from './habitat'
import type { Ship } from './ship'
import type { MissionRoom } from './mission'
import type { Passengers } from './crowd'
import type { LaunchSky, Sky, SkyState } from './sky'

export type SetId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

/** Everything a staging function needs to know about the moment. */
export type St = { seg: SegmentId; u: number; p: number; flags: ReadonlySet<string>; time: number; reduced: boolean }

export type Lights = { key: THREE.SpotLight; sun: THREE.DirectionalLight; p: THREE.PointLight[]; hemi: THREE.HemisphereLight }

export type Rig = {
  scene: THREE.Scene
  m: Pal
  cast: Cast
  A: SigningRoom
  B: Corridor
  C: ShuttleCabin
  D: LaunchExterior
  deck: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial }
  E: Habitat
  F: Ship
  G: MissionRoom
  crowd: Passengers
  sky: Sky
  skyState: SkyState
  launchSky: LaunchSky
  /** Launch sky in use (follows the camera). */
  launch: { on: boolean; alt: number; race: number }
  lights: Lights
  envs: Partial<Record<HdriId, THREE.Texture>>
  fallbackEnv: THREE.Texture
  /** The full-screen veils: white (the ring's light) and the memory of the Earth. */
  veil: { white: number; memory: number }
  /** What the sound follows. */
  motion: { step: number; walking: number; doors: number; robots: number }
}

export const PI = Math.PI

/** Turns everything in the pool off (each set then turns on what it uses). */
export function lightsOff(L: Lights) {
  L.key.intensity = 0
  L.sun.intensity = 0
  for (const p of L.p) p.intensity = 0
  L.hemi.intensity = 0
}

export function spot(L: Lights, pos: THREE.Vector3Like, tgt: THREE.Vector3Like, color: THREE.ColorRepresentation, intensity: number, angle: number, penumbra = 0.5, distance = 0, decay = 1.6) {
  const k = L.key
  k.position.set(pos.x, pos.y, pos.z)
  k.target.position.set(tgt.x, tgt.y, tgt.z)
  k.target.updateMatrixWorld()
  k.color.set(color)
  k.intensity = intensity
  k.angle = angle
  k.penumbra = penumbra
  k.distance = distance
  k.decay = decay
}

/** The directional light, with its shadow box (half-size `box`) centred on the target. */
export function sunAt(L: Lights, pos: THREE.Vector3Like, tgt: THREE.Vector3Like, color: THREE.ColorRepresentation, intensity: number, box = 6) {
  const s = L.sun
  s.position.set(pos.x, pos.y, pos.z)
  s.target.position.set(tgt.x, tgt.y, tgt.z)
  s.target.updateMatrixWorld()
  s.color.set(color)
  s.intensity = intensity
  const c = s.shadow.camera
  if (c.right !== box) {
    c.left = -box
    c.right = box
    c.top = box
    c.bottom = -box
    c.updateProjectionMatrix()
  }
  const far = Math.hypot(pos.x - tgt.x, pos.y - tgt.y, pos.z - tgt.z) + box * 2
  if (Math.abs(c.far - far) > 0.5) {
    c.far = far
    c.updateProjectionMatrix()
  }
}

export function point(L: Lights, i: number, x: number, y: number, z: number, color: THREE.ColorRepresentation, intensity: number, distance = 6, decay = 1.6) {
  const p = L.p[i]
  p.position.set(x, y, z)
  p.color.set(color)
  p.intensity = intensity
  p.distance = distance
  p.decay = decay
}

export function hemi(L: Lights, sky: THREE.ColorRepresentation, ground: THREE.ColorRepresentation, intensity: number) {
  L.hemi.color.set(sky)
  L.hemi.groundColor.set(ground)
  L.hemi.intensity = intensity
}

export function env(r: Rig, id: HdriId | null, intensity: number) {
  r.scene.environment = (id && r.envs[id]) || r.fallbackEnv
  r.scene.environmentIntensity = intensity
}

const tmp = new THREE.Vector3()
/** A point in a person's own frame (x to their left, y up, z ahead), in the world. */
export function toWorld(a: Actor, lx: number, ly: number, lz: number, out = tmp) {
  const s = a.figure.root.scale.x
  const c = Math.cos(a.yaw)
  const sn = Math.sin(a.yaw)
  out.set(a.x + (lx * c + lz * sn) * s, a.y + ly * s, a.z + (-lx * sn + lz * c) * s)
  return out
}

/** Show a person this frame (actors start hidden every frame). */
export function show(r: Rig, id: CastId): Actor {
  const a = r.cast.actors[id]
  a.visible = true
  return a
}

/** Yaw that faces from (x, z) toward (tx, tz). */
export const face = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z)

/** A smooth pulse 0→1→0 between a and b (peak in the middle). */
export const pulse = (a: number, b: number, v: number) => (v <= a || v >= b ? 0 : Math.sin(((v - a) / (b - a)) * PI))
