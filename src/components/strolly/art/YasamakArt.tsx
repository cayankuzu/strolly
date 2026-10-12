'use client'
import { useT } from '@/lib/i18n'

/** A sunlit internet cafe late in the afternoon: a boy in a blue hoodie laughing at a beige CRT, an amber countdown in its corner, dust in the light, a plane tree in fresh leaf through the window. */
export function YasamakArt() {
  const t = useT()
  const motes = Array.from({ length: 34 }, (_, i) => ({ x: 70 + ((i * 53) % 150), y: 40 + ((i * 37) % 150), r: 0.6 + ((i * 7) % 5) * 0.22, o: 0.25 + ((i * 11) % 6) * 0.08 }))
  const leaves = Array.from({ length: 26 }, (_, i) => ({ x: 18 + ((i * 29) % 120), y: 18 + ((i * 17) % 60), r: 7 + ((i * 13) % 9) }))
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--yasamak">
      <defs>
        <linearGradient id="ya-wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a4632" />
          <stop offset="1" stopColor="#2a2119" />
        </linearGradient>
        <linearGradient id="ya-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dca4" />
          <stop offset="1" stopColor="#e9b878" />
        </linearGradient>
        <linearGradient id="ya-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe3a8" stopOpacity="0.42" />
          <stop offset="1" stopColor="#ffe3a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ya-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6440" />
          <stop offset="1" stopColor="#3c2a1a" />
        </linearGradient>
        <radialGradient id="ya-screen" cx="0.45" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#8fe8d8" />
          <stop offset="0.6" stopColor="#2f8fa0" />
          <stop offset="1" stopColor="#173c56" />
        </radialGradient>
        <radialGradient id="ya-spill" cx="0.62" cy="0.5" r="0.4">
          <stop offset="0" stopColor="#7fe0d0" stopOpacity="0.32" />
          <stop offset="1" stopColor="#7fe0d0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ya-hood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1d3a63" />
          <stop offset="1" stopColor="#3f73b4" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#ya-wall)" />
      {/* The window: the street in late sun, the plane tree in new leaf */}
      <rect x="10" y="12" width="150" height="104" fill="url(#ya-sky)" />
      <g fill="#7aa64a" opacity="0.85">
        {leaves.map((l, i) => (
          <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={i % 3 ? '#88b456' : '#6a9640'} />
        ))}
      </g>
      <path d="M62 116 L66 60 L58 40 M66 70 L84 46" stroke="#5a5244" strokeWidth="4" fill="none" />
      <g fill="#2a2119">
        <rect x="8" y="10" width="154" height="4" />
        <rect x="8" y="114" width="154" height="5" />
        <rect x="83" y="10" width="4" height="106" />
        <rect x="8" y="10" width="4" height="106" />
        <rect x="158" y="10" width="4" height="106" />
      </g>
      {/* The light coming in, with dust */}
      <polygon points="12,14 160,14 330,250 60,250" fill="url(#ya-beam)" />
      <g fill="#fff1cc">
        {motes.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} opacity={m.o} />
        ))}
      </g>
      {/* The desk */}
      <rect x="0" y="196" width="400" height="54" fill="url(#ya-desk)" />
      <rect x="0" y="194" width="400" height="4" fill="#a37a50" opacity="0.7" />
      {/* The beige CRT */}
      <rect x="226" y="96" width="132" height="104" rx="9" fill="#d3c8a8" />
      <rect x="226" y="96" width="132" height="104" rx="9" fill="#000" opacity="0.08" />
      <rect x="238" y="106" width="108" height="80" rx="5" fill="url(#ya-screen)" />
      <g fill="#d9fff4" opacity="0.7">
        <rect x="258" y="122" width="10" height="7" />
        <rect x="290" y="116" width="10" height="7" />
        <rect x="314" y="132" width="10" height="7" />
        <polygon points="282,168 272,178 292,178" fill="#ffe07a" />
      </g>
      <rect x="306" y="168" width="36" height="15" fill="#0b1416" opacity="0.8" />
      <text x="324" y="174" textAnchor="middle" fontSize="3.6" fill="#b58a55" fontFamily="monospace" letterSpacing="0.4">
        {t('art.timeLeft')}
      </text>
      <text x="324" y="181.5" textAnchor="middle" fontSize="7" fill="#ffc77f" fontFamily="monospace" fontWeight="600">
        12:40
      </text>
      <rect x="276" y="200" width="34" height="6" fill="#bcb193" />
      <rect x="250" y="203" width="96" height="10" rx="2" fill="#cfc6aa" />
      <rect width="400" height="250" fill="url(#ya-spill)" />
      {/* The boy, leaning in, laughing; the screen on his face */}
      <path d="M118 250 C112 214 120 182 150 168 C168 160 196 166 206 182 C214 196 214 222 210 250 Z" fill="url(#ya-hood)" />
      <path d="M150 170 C142 150 150 128 170 124 C186 122 198 134 198 150" fill="#2c5590" />
      <circle cx="184" cy="140" r="20" fill="#d7a98a" />
      <path d="M166 128 C170 112 196 110 204 126 C198 122 186 120 176 126 Z" fill="#4a3020" />
      <path d="M197 128 C204 134 206 144 202 154 C198 152 196 146 198 140 Z" fill="#9fe6da" opacity="0.55" />
      <path d="M195 150 Q199 154 196 158" stroke="#5a2a20" strokeWidth="1.6" fill="none" />
      <circle cx="194" cy="137" r="1.4" fill="#2a1a12" />
      <path d="M200 206 C206 198 222 198 236 204" stroke="#d7a98a" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M118 186 C108 176 108 158 120 150 L132 150 C126 162 128 176 138 186 Z" fill="#a52f27" />
    </svg>
  )
}
