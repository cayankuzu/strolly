/**
 * Client-only: each story's 3D scene and sound load when the story is chosen,
 * never before. Adding a story means adding one line to each map.
 */
import type { SceneFactory } from '@/three/Stage'
import type { AudioProfileFactory } from '@/lib/audio/core'
import type { StoryId } from './types'

export const loadScene: Record<StoryId, () => Promise<SceneFactory>> = {
  yasamak: () => import('@/three/yasamak/YasamakScene').then((m) => m.createYasamakScene),
  ote: () => import('@/three/ote/OteScene').then((m) => m.createOteScene),
  tekayak: () => import('@/three/tekayak/TekAyakScene').then((m) => m.createTekAyakScene),
  ofke: () => import('@/three/ofke/OfkeScene').then((m) => m.createOfkeScene),
  takinti: () => import('@/three/takinti/TakintiScene').then((m) => m.createTakintiScene),
  paralel: () => import('@/three/paralel/ParalelScene').then((m) => m.createParalelScene),
  tekerrur: () => import('@/three/tekerrur/TekerrurScene').then((m) => m.createTekerrurScene),
  beyinkoku: () => import('@/three/beyinkoku/BeyinKokuScene').then((m) => m.createBeyinKokuScene),
  durum: () => import('@/three/durum/DurumScene').then((m) => m.createDurumScene),
}

export const loadAudio: Record<StoryId, () => Promise<AudioProfileFactory>> = {
  yasamak: () => import('./yasamak/audio').then((m) => m.createYasamakAudio),
  ote: () => import('./ote/audio').then((m) => m.createOteAudio),
  tekayak: () => import('./tekayak/audio').then((m) => m.createTekAyakAudio),
  ofke: () => import('./ofke/audio').then((m) => m.createOfkeAudio),
  takinti: () => import('./takinti/audio').then((m) => m.createTakintiAudio),
  paralel: () => import('./paralel/audio').then((m) => m.createParalelAudio),
  tekerrur: () => import('./tekerrur/audio').then((m) => m.createTekerrurAudio),
  beyinkoku: () => import('./beyinkoku/audio').then((m) => m.createBeyinKokuAudio),
  durum: () => import('./durum/audio').then((m) => m.createDurumAudio),
}
