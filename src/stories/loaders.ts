/**
 * Client-only: each story's 3D scene and sound load when the story is chosen,
 * never before. Adding a story means adding one line to each map.
 */
import type { SceneFactory } from '@/three/Stage'
import type { AudioProfileFactory } from '@/lib/audio/core'
import type { StoryId } from './types'

export const loadScene: Record<StoryId, () => Promise<SceneFactory>> = {
  tekerrur: () => import('@/three/tekerrur/TekerrurScene').then((m) => m.createTekerrurScene),
  emanet: () => import('@/three/emanet/EmanetScene').then((m) => m.createEmanetScene),
  ofke: () => import('@/three/ofke/OfkeScene').then((m) => m.createOfkeScene),
  yasamak: () => import('@/three/yasamak/YasamakScene').then((m) => m.createYasamakScene),
  kalan: () => import('@/three/kalan/KalanScene').then((m) => m.createKalanScene),
  esik: () => import('@/three/esik/EsikScene').then((m) => m.createEsikScene),
}

export const loadAudio: Record<StoryId, () => Promise<AudioProfileFactory>> = {
  tekerrur: () => import('./tekerrur/audio').then((m) => m.createTekerrurAudio),
  emanet: () => import('./emanet/audio').then((m) => m.createEmanetAudio),
  ofke: () => import('./ofke/audio').then((m) => m.createOfkeAudio),
  yasamak: () => import('./yasamak/audio').then((m) => m.createYasamakAudio),
  kalan: () => import('./kalan/audio').then((m) => m.createKalanAudio),
  esik: () => import('./esik/audio').then((m) => m.createEsikAudio),
}
