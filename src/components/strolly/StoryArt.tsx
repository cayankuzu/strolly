'use client'

/** Small cinematic paintings of each story: no spoilers, just a place and a light. */
import type { StoryId } from '@/stories/types'
import { useT } from '@/lib/i18n'
import { DurumArt } from './art/DurumArt'
import { OteArt } from './art/OteArt'
import { TakintiArt } from './art/TakintiArt'
import { TekAyakArt } from './art/TekAyakArt'
import { TekerrurArt } from './art/TekerrurArt'
import { YasamakArt } from './art/YasamakArt'




function OfkeArt() {
  const t = useT()
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--ofke">
      <defs>
        <linearGradient id="of-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9ced1" />
          <stop offset="1" stopColor="#7d868b" />
        </linearGradient>
        <linearGradient id="of-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f979b" />
          <stop offset="1" stopColor="#2a2f32" />
        </linearGradient>
        <radialGradient id="of-light" cx="0.5" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#f4fbff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4fbff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="#101416" />
      {/* A white corridor in perspective */}
      <polygon points="0,0 400,0 300,70 100,70" fill="#e3e7e9" />
      <polygon points="0,0 100,70 100,180 0,250" fill="url(#of-wall)" />
      <polygon points="400,0 300,70 300,180 400,250" fill="url(#of-wall)" opacity="0.9" />
      <polygon points="100,180 300,180 400,250 0,250" fill="url(#of-floor)" />
      <rect x="100" y="70" width="200" height="110" fill="#b7bfc3" />
      {/* The glass booth */}
      <rect x="150" y="84" width="100" height="96" fill="#a9c4cc" opacity="0.35" stroke="#e8f2f5" strokeWidth="1.2" />
      <rect x="196" y="84" width="1.2" height="96" fill="#e8f2f5" opacity="0.7" />
      {/* Someone sits inside, under one cold light */}
      <rect x="183" y="140" width="34" height="4" fill="#4b5357" />
      <circle cx="200" cy="118" r="7" fill="#1d2326" />
      <path d="M191 127 q9 -5 18 0 l3 20 h-24 z" fill="#20272a" />
      <rect x="0" y="0" width="400" height="250" fill="url(#of-light)" />
      {/* Session light */}
      <circle cx="200" cy="78" r="2.4" fill="#d44a35" />
      <circle cx="200" cy="78" r="8" fill="#d44a35" opacity="0.16" />
      {/* The same doors, further down */}
      <g fill="#8e989c" opacity="0.6">
        <rect x="112" y="96" width="8" height="70" />
        <rect x="280" y="96" width="8" height="70" />
      </g>
      <text x="200" y="196" textAnchor="middle" fontSize="6" letterSpacing="2" fill="#dfe6e8" opacity="0.55" fontFamily="monospace">
        {t('art.session', { n: '0412' })}
      </text>
    </svg>
  )
}




function PendingArt() {
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art">
      <rect width="400" height="250" fill="#07080a" />
    </svg>
  )
}

export const STORY_ART: Record<StoryId, () => React.JSX.Element> = {
  yasamak: YasamakArt,
  ote: OteArt,
  tekayak: TekAyakArt,
  ofke: OfkeArt,
  takinti: TakintiArt,
  paralel: PendingArt,
  tekerrur: TekerrurArt,
  beyinkoku: PendingArt,
  durum: DurumArt,
}
