export type Tier = 'high' | 'mid' | 'low'

export type Quality = {
  tier: Tier
  /** Device pixel ratio cap. */
  dpr: number
  msaa: number
  shadows: boolean
  feedWidth: number
  /** Scales instance counts for the archive and the city. */
  density: number
}

let gpuName: string | null = null

function probe() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    gpuName = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

export function detectWebGL2() {
  return probe()
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function detectQuality(): Quality {
  if (gpuName === null) probe()
  const gpu = (gpuName ?? '').toLowerCase()
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  const dpr = window.devicePixelRatio || 1
  const integrated = /intel|uhd|iris|swiftshader|llvmpipe|mali|adreno|powervr/.test(gpu) && !/arc/.test(gpu)
  if (coarse || small) return { tier: 'low', dpr: Math.min(dpr, 1.4), msaa: 0, shadows: false, feedWidth: 960, density: 0.5 }
  if (integrated) return { tier: 'mid', dpr: Math.min(dpr, 1.25), msaa: 0, shadows: true, feedWidth: 1280, density: 0.7 }
  return { tier: 'high', dpr: Math.min(dpr, 1.75), msaa: 4, shadows: true, feedWidth: 1600, density: 1 }
}

/** The player's quality choice; 'auto' asks the hardware. */
export function qualityFor(choice: 'auto' | 'high' | 'mid' | 'low'): Quality {
  if (choice === 'auto') return detectQuality()
  const dpr = window.devicePixelRatio || 1
  if (choice === 'high') return { tier: 'high', dpr: Math.min(dpr, 1.75), msaa: 4, shadows: true, feedWidth: 1600, density: 1 }
  if (choice === 'mid') return { tier: 'mid', dpr: Math.min(dpr, 1.25), msaa: 0, shadows: true, feedWidth: 1280, density: 0.7 }
  return { tier: 'low', dpr: Math.min(dpr, 1.1), msaa: 0, shadows: false, feedWidth: 960, density: 0.5 }
}

export const isDev = process.env.NODE_ENV !== 'production'
