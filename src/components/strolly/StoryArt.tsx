'use client'

/** Small cinematic paintings of each story: no spoilers, just a place and a light. */
import type { StoryId } from '@/stories/types'
import { BeyinKokuArt } from './art/BeyinKokuArt'
import { DurumArt } from './art/DurumArt'
import { OfkeArt } from './art/OfkeArt'
import { OteArt } from './art/OteArt'
import { ParalelArt } from './art/ParalelArt'
import { TakintiArt } from './art/TakintiArt'
import { TekAyakArt } from './art/TekAyakArt'
import { TekerrurArt } from './art/TekerrurArt'
import { YasamakArt } from './art/YasamakArt'

export const STORY_ART: Record<StoryId, () => React.JSX.Element> = {
  yasamak: YasamakArt,
  ote: OteArt,
  tekayak: TekAyakArt,
  ofke: OfkeArt,
  takinti: TakintiArt,
  paralel: ParalelArt,
  tekerrur: TekerrurArt,
  beyinkoku: BeyinKokuArt,
  durum: DurumArt,
}
