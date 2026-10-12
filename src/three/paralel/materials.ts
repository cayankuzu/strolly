/**
 * PARALEL-LEŞ — the shared set palette (calibrated PBR surfaces). Sets add
 * their own special materials (water, glass, glow) next to these.
 */
import * as THREE from 'three'
import { pbr } from '../kit/surfaces'

export function palette() {
  return {
    rockGrey: pbr('rock', 0x8d8a84, { roughness: 1 }),
    rockWarm: pbr('rock', 0x9c8f7c, { roughness: 1 }),
    rockDark: pbr('rock', 0x4a4a4c, { roughness: 1 }),
    limestone: pbr('rock', 0xd8cfbf, { roughness: 1 }),
    scree: pbr('gravel', 0x7d6e5e, { roughness: 1 }),
    dirt: pbr('gravel', 0xa98a5e, { roughness: 1, scale: 1.6 }),
    gravel: pbr('gravel', 0x8c857b, { roughness: 1 }),
    sand: pbr('sand', 0xcdb68e, { roughness: 1 }),
    wetSand: pbr('sand', 0x7a6a52, { roughness: 0.45 }),
    concrete: pbr('concrete', 0x9a948c, { roughness: 1 }),
    concreteDark: pbr('concrete', 0x5f5b56, { roughness: 1 }),
    plaster: pbr('plaster', 0xb9b1a6, { roughness: 1 }),
    steel: pbr('metal', 0x5b6268, { roughness: 0.55 }),
    steelWet: pbr('metal', 0x3e4a45, { roughness: 0.3 }),
    rust: pbr('metal', 0x6b4a36, { roughness: 0.8, metalness: 0.4 }),
    galv: pbr('metal', 0xa7abae, { roughness: 0.45 }),
    paint: pbr('painted', 0xd9d4ca, { roughness: 0.8 }),
    wood: pbr('wood', 0x7a5a3e, { roughness: 0.8 }),
    planks: pbr('planks', 0x6b5039, { roughness: 0.9 }),
    parquet: pbr('planks', 0x4a3424, { roughness: 0.55 }),
    bark: pbr('rock', 0x4e4136, { roughness: 1, scale: 0.35, bump: 1.6 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x6f7a3e, roughness: 0.95, side: THREE.DoubleSide }),
    dryGrass: new THREE.MeshStandardMaterial({ color: 0xc9b46a, roughness: 0.95, side: THREE.DoubleSide }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x55602f, roughness: 0.85, side: THREE.DoubleSide }),
    pine: new THREE.MeshStandardMaterial({ color: 0x2f3d2a, roughness: 0.95 }),
    black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    rope: pbr('fabric', 0xb39a72, { roughness: 1, scale: 0.4 }),
    seat: pbr('wood', 0x6e5038, { roughness: 0.85 }),
  }
}
export type Pal = ReturnType<typeof palette>
