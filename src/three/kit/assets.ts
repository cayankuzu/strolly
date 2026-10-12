/**
 * Real assets: CC0 models, HDR environments and panoramas from Poly Haven,
 * optimized into `public/assets` (see ASSET_MANIFEST.md and
 * scripts/optimize-assets.py). Everything here is optional — a failed load
 * resolves to `null` and the set keeps its procedural stand-in, so a missing
 * file never leaves a story blank.
 *
 * Each file is fetched and decoded once per visit; models are handed out as
 * clones that share geometry and materials.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const BASE = '/assets'

/** Every model in public/assets/models (Poly Haven ids). */
export const MODELS = [
  'CashRegister_01',
  'CoffeeCart_01',
  'SchoolChair_01',
  'SchoolDesk_01',
  'WetFloorSign_01',
  'binder_notebook',
  'boulder_01',
  'cardboard_box_01',
  'classic_laptop',
  'clipboard',
  'dead_tree_trunk',
  'desk_lamp_arm_01',
  'exterior_aircon_unit',
  'fern_02',
  'fire_hydrant',
  'gamepad',
  'industrial_microscope',
  'lifebuoy',
  'magnifying_glass_01',
  'medical_box',
  'metal_office_desk',
  'metal_trash_can',
  'modern_arm_chair_01',
  'modular_airduct_rectangular_01',
  'modular_street_seating',
  'mounted_fluorescent_lights',
  'office_notepads',
  'old_bed_frame',
  'painted_wooden_cabinet',
  'painted_wooden_chair_01',
  'painted_wooden_table',
  'planter_box_01',
  'plastic_broom',
  'pot_enamel_01',
  'potted_plant_01',
  'rock_face_01',
  'round_spectacles',
  'security_camera_01',
  'security_camera_02',
  'sofa_02',
  'standing_chalkboard_01',
  'steel_frame_shelves_01',
  'street_lamp_01',
  'street_lamp_02',
  'tea_set_01',
  'television_02',
  'vintage_electric_kettle',
  'vintage_spacecraft_instrument',
  'vintage_stapler',
  'vintage_suitcase',
  'wall_clock',
  'watering_can_metal_01',
  'wheelchair_01',
  'wicker_basket_01',
] as const
export type ModelId = (typeof MODELS)[number]

/** HDR environments in public/assets/hdri (1k, for image-based light and reflections). */
export const HDRIS = ['brown_photostudio_02', 'hospital_room_2', 'abandoned_tiled_room', 'kloofendal_48d_partly_cloudy_puresky', 'belfast_sunset_puresky', 'moonless_golf', 'xanderklinge'] as const
export type HdriId = (typeof HDRIS)[number]

/** Equirectangular photographs in public/assets/panorama (shown, not lit by). */
export const PANORAMAS = { xanderklinge: 'xanderklinge_4k.jpg' } as const
export type PanoramaId = keyof typeof PANORAMAS

/** What loaded and what did not — read by the development debug API (`window.__strolly.info().assets`). */
export const assetLog: { loaded: string[]; failed: string[] } = { loaded: [], failed: [] }
if (process.env.NODE_ENV !== 'production') (globalThis as { __strollyAssets?: typeof assetLog }).__strollyAssets = assetLog

const fail = (what: string, e: unknown) => {
  assetLog.failed.push(what)
  if (process.env.NODE_ENV !== 'production') console.warn(`[assets] ${what} failed to load; using the procedural stand-in.`, e)
}

let gltf: GLTFLoader | null = null
const models = new Map<string, Promise<THREE.Group | null>>()

function loadGltf(id: ModelId) {
  let p = models.get(id)
  if (!p) {
    gltf ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    p = gltf
      .loadAsync(`${BASE}/models/${id}.glb`)
      .then((g) => {
        g.scene.traverse((o) => {
          const m = o as THREE.Mesh
          if (!m.isMesh) return
          m.castShadow = true
          m.receiveShadow = true
          // Imported surfaces must not be resized by the procedural metric-UV pass.
          for (const mat of ([] as THREE.Material[]).concat(m.material)) mat.userData.imported = true
        })
        assetLog.loaded.push(`model:${id}`)
        return g.scene
      })
      .catch((e) => {
        fail(`model:${id}`, e)
        return null
      })
    models.set(id, p)
  }
  return p
}

export type ModelOptions = {
  /** Scale the model so its bounding box is this tall (m). Otherwise the source's real-world scale is kept. */
  height?: number
  /** Or this wide along x (m). */
  width?: number
  /** Uniform scale on top of the source scale (ignored with height/width). */
  scale?: number
  /** Put the model's lowest point at y = 0 and center it on x/z. */
  ground?: boolean
  /** Override every material's color and/or roughness (e.g. to match a story's palette). */
  tint?: THREE.ColorRepresentation
  envIntensity?: number
}

/**
 * A ready-to-place copy of a model, wrapped in a group whose origin sits at
 * the model's footprint (with `ground`, the default), or `null` if it failed.
 */
export async function loadModel(id: ModelId, opts: ModelOptions = {}): Promise<THREE.Group | null> {
  const src = await loadGltf(id)
  if (!src) return null
  const copy = src.clone(true)
  if (opts.tint !== undefined || opts.envIntensity !== undefined) {
    copy.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.material = ([] as THREE.Material[]).concat(m.material).map((mat) => {
        const c = (mat as THREE.MeshStandardMaterial).clone()
        if (opts.tint !== undefined) c.color.set(opts.tint)
        if (opts.envIntensity !== undefined) c.envMapIntensity = opts.envIntensity
        return c
      }) as THREE.Material | THREE.Material[]
      if (Array.isArray(m.material) && m.material.length === 1) m.material = m.material[0]
    })
  }
  const box = new THREE.Box3().setFromObject(copy)
  const size = box.getSize(new THREE.Vector3())
  let s = opts.scale ?? 1
  if (opts.height) s = opts.height / Math.max(1e-6, size.y)
  else if (opts.width) s = opts.width / Math.max(1e-6, size.x)
  copy.scale.multiplyScalar(s)
  if (opts.ground !== false) {
    const c = box.getCenter(new THREE.Vector3())
    copy.position.set(-c.x * s, -box.min.y * s, -c.z * s)
  }
  const holder = new THREE.Group()
  holder.name = id
  holder.add(copy)
  return holder
}

/** Loads several models at once (in parallel); missing ones are `null`. */
export async function loadModels<K extends string>(specs: Record<K, [ModelId, ModelOptions?]>): Promise<Record<K, THREE.Group | null>> {
  const keys = Object.keys(specs) as K[]
  const groups = await Promise.all(keys.map((k) => loadModel(specs[k][0], specs[k][1])))
  return Object.fromEntries(keys.map((k, i) => [k, groups[i]])) as Record<K, THREE.Group | null>
}

const envs = new Map<string, Promise<THREE.Texture | null>>()

/** A prefiltered environment map from an HDRI, for `scene.environment`. */
export function loadEnvironment(id: HdriId, renderer: THREE.WebGLRenderer): Promise<THREE.Texture | null> {
  let p = envs.get(id)
  if (!p) {
    p = new HDRLoader()
      .loadAsync(`${BASE}/hdri/${id}.hdr`)
      .then((tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping
        const pmrem = new THREE.PMREMGenerator(renderer)
        const env = pmrem.fromEquirectangular(tex).texture
        pmrem.dispose()
        tex.dispose()
        assetLog.loaded.push(`hdri:${id}`)
        return env
      })
      .catch((e) => {
        fail(`hdri:${id}`, e)
        return null
      })
    envs.set(id, p)
  }
  return p
}

const panos = new Map<string, Promise<THREE.Texture | null>>()

/** An equirectangular photograph as an sRGB texture (to show on a sphere or on screen walls). */
export function loadPanorama(id: PanoramaId): Promise<THREE.Texture | null> {
  let p = panos.get(id)
  if (!p) {
    p = new THREE.TextureLoader()
      .loadAsync(`${BASE}/panorama/${PANORAMAS[id]}`)
      .then((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        assetLog.loaded.push(`panorama:${id}`)
        return tex
      })
      .catch((e) => {
        fail(`panorama:${id}`, e)
        return null
      })
    panos.set(id, p)
  }
  return p
}
