/** EMANET's palette: warm white, oak, muted amber, faded blue, skin. A home, not a lab. */
import * as THREE from 'three'
import { fabricBump } from '../textures'
import { pbr } from '../kit/surfaces'

export function createEmanetMaterials() {
  const knit = fabricBump(91, 12)
  const weave = fabricBump(97, 18)
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)

  return {
    plaster: pbr('plaster', 0xefe8dc),
    ceiling: pbr('plaster', 0xf3eee6),
    floor: pbr('planks', 0xb48c66, { roughness: 0.85 }),
    trim: pbr('painted', 0xf4f1ea),
    cabinet: pbr('painted', 0x7e8ea0, { roughness: 0.9 }),
    counter: pbr('concrete', 0xd8d2c6, { roughness: 0.38 }),
    enamel: pbr('painted', 0xe9e5dc, { roughness: 0.5 }),
    oak: pbr('wood', 0xa9845f, { roughness: 0.7 }),
    darkWood: pbr('wood', 0x4b3a2e, { roughness: 0.75 }),
    walnut: pbr('wood', 0x5d4433, { roughness: 0.6 }),
    brass: pbr('metal', 0xb48f58, { roughness: 0.6 }),
    metal: pbr('metal', 0x9b978f, { roughness: 0.7 }),
    sofa: pbr('fabric', 0x6f8196),
    cushion: pbr('fabric', 0xc9a37a),
    rug: pbr('carpet', 0xcbb79d),
    ceramic: pbr('ceramic', 0xf0eadf),
    mug: pbr('ceramic', 0x8aa0b3, { roughness: 1.4 }),
    coffee: std({ color: 0x2a170c, roughness: 0.08 }),
    paper: pbr('paper', 0xf2ede3),
    leaf: std({ color: 0x5c6b47, roughness: 0.85, side: THREE.DoubleSide }),
    pot: pbr('plaster', 0xa96f50),
    glass: std({ color: 0xdfe8ec, roughness: 0.04, metalness: 0.0, transparent: true, opacity: 0.1, depthWrite: false }),
    curtain: std({ color: 0xd8c7ae, roughness: 0.95, transparent: true, opacity: 0.9, side: THREE.DoubleSide, bumpMap: weave, bumpScale: 0.4 }),
    concrete: pbr('concrete', 0xbdb5aa),
    book: pbr('paper', 0x8c6f5a, { roughness: 0.85 }),
    bookB: pbr('paper', 0x5f7086, { roughness: 0.85 }),
    bookC: pbr('paper', 0xc2b29a, { roughness: 0.85 }),
    lampShade: std({ color: 0xf1e5d0, roughness: 0.8, emissive: new THREE.Color(0xffd6a0), emissiveIntensity: 0.4 }),
    capsule: std({ color: 0xffcf8a, roughness: 0.1, emissive: new THREE.Color(0xffa850), emissiveIntensity: 0, transparent: true, opacity: 0.9 }),
    deviceLight: new THREE.MeshBasicMaterial({ color: 0xffb060 }),
    // The cast
    skinDerin: std({ color: 0xc69c82, roughness: 0.55 }),
    skinDerinHead: std({ color: 0xc69c82, roughness: 0.52, vertexColors: true }),
    skinEge: std({ color: 0xb98f78, roughness: 0.56 }),
    skinEgeHead: std({ color: 0xb98f78, roughness: 0.54, vertexColors: true }),
    eye: std({ color: 0x120d0a, roughness: 0.12 }),
    hairDerin: std({ color: 0x3a2a21, roughness: 0.7, bumpMap: knit, bumpScale: 1.6 }),
    hairEge: std({ color: 0x2a2320, roughness: 0.75, bumpMap: knit, bumpScale: 1.4 }),
    knitCream: std({ color: 0xcdbca4, roughness: 0.96, bumpMap: knit, bumpScale: 0.3 }),
    denim: std({ color: 0x2e394b, roughness: 0.9, bumpMap: weave, bumpScale: 0.5 }),
    teeBlue: std({ color: 0x627790, roughness: 0.92, bumpMap: weave, bumpScale: 0.3 }),
    greyCotton: std({ color: 0x6d6c69, roughness: 0.95, bumpMap: knit, bumpScale: 0.5 }),
    felt: pbr('carpet', 0xcfc5b8),
    slipper: pbr('fabric', 0x5a4a3e),
    leather: pbr('leather', 0x3b2c23, { roughness: 0.9 }),
    sole: pbr('rubber', 0x1c1a18),
    phoneBody: pbr('plastic', 0x1b1d20, { roughness: 0.5 }),
    pillLid: std({ color: 0x9fbfd2, roughness: 0.25, transparent: true, opacity: 0.55 }),
    pill: std({ color: 0xf4efe2, roughness: 0.4 }),
    pillB: std({ color: 0xe8c56a, roughness: 0.4 }),
    teaGlass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transparent: true, opacity: 0.3, depthWrite: false }),
  }
}

export type EmanetMaterials = ReturnType<typeof createEmanetMaterials>
