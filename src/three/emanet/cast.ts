/**
 * Derin and Ege: the same rig as Arif, dressed for a Sunday at home. Their
 * poses are quiet — standing, sitting, leaning to set something down. Hands
 * that must touch something exactly are bent by `reach` on top of these.
 */
import { Figure, type FigureLook } from '../figure/Figure'
import type { EmanetMaterials } from './materials'

export function createDerin(m: EmanetMaterials) {
  const look: FigureLook = {
    name: 'Derin',
    build: 'f',
    face: { jaw: 0.14, nose: 0.13, lips: 0.07, stubble: 0 },
    hairStyle: 'long',
    skin: m.skinDerin,
    skinHead: m.skinDerinHead,
    eye: m.eye,
    hair: m.hairDerin,
    top: m.knitCream,
    waist: m.denim,
    bottom: m.denim,
    shoes: m.felt,
    sole: m.slipper,
    cuff: m.knitCream,
    collar: 'crew',
    height: 0.93,
  }
  const f = new Figure(look)
  // A memory does not cast a shadow. Nobody notices until they do.
  f.root.traverse((o) => (o.castShadow = false))
  return f
}

export function createEge(m: EmanetMaterials) {
  return new Figure({
    name: 'Ege',
    build: 'm',
    face: { jaw: 0.3, nose: 0.2, lips: 0.045, stubble: 0.3 },
    hairStyle: 'short',
    skin: m.skinEge,
    skinHead: m.skinEgeHead,
    eye: m.eye,
    hair: m.hairEge,
    top: m.teeBlue,
    bottom: m.greyCotton,
    shoes: m.slipper,
    sole: m.felt,
    cuff: m.teeBlue,
    collar: 'crew',
  })
}

export * from '../figure/poses'
