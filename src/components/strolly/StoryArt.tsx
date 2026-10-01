'use client'

/** Small cinematic paintings of each story: no spoilers, just a place and a light. */
import type { StoryId } from '@/stories/types'

function TekerrurArt() {
  // Rack LEDs behind the glass: fixed pseudo-random dots, a few amber.
  const leds = Array.from({ length: 90 }, (_, i) => {
    const rack = i % 9
    const row = Math.floor(i / 9)
    return { x: 18 + rack * 42 + ((i * 17) % 11), y: 48 + row * 9 + ((i * 7) % 4), amber: (i * 13) % 7 === 0 }
  })
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--tekerrur">
      <defs>
        <linearGradient id="tk-hall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d141c" />
          <stop offset="1" stopColor="#1b2632" />
        </linearGradient>
        <linearGradient id="tk-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1f24" />
          <stop offset="1" stopColor="#08090b" />
        </linearGradient>
        <radialGradient id="tk-lamp" cx="0.42" cy="0.62" r="0.32">
          <stop offset="0" stopColor="#ffd9a8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffd9a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tk-screens" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c8dcff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#c8dcff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="#06080b" />
      {/* The server hall behind the glass */}
      <rect x="0" y="22" width="400" height="148" fill="url(#tk-hall)" />
      <g fill="#0a0f15">
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={12 + i * 42} y="40" width="34" height="122" />
        ))}
      </g>
      <g className="art-leds">
        {leds.map((l, i) => (
          <rect key={i} x={l.x} y={l.y} width="2" height="1.4" fill={l.amber ? '#e2b062' : '#6fd08c'} opacity={0.55 + ((i * 11) % 5) * 0.08} />
        ))}
      </g>
      {/* Glass partition: mullions, a reflection */}
      <g fill="#030405">
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={i * 50 - 2} y="22" width="4" height="148" />
        ))}
        <rect x="0" y="20" width="400" height="4" />
        <rect x="0" y="168" width="400" height="3" />
      </g>
      <polygon points="40,22 120,22 60,170 0,170" fill="#ffffff" opacity="0.025" />
      {/* Floor */}
      <rect x="0" y="170" width="400" height="80" fill="url(#tk-floor)" />
      {/* The wall display on its stand, the world as numbers */}
      <rect x="282" y="78" width="96" height="56" fill="#0b0e11" stroke="#20262c" strokeWidth="1.5" />
      <g fill="#e2b062" opacity="0.6">
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={318 + ((i * 23) % 50)} y={92 + i * 6} width={10 + ((i * 7) % 14)} height="1.6" />
        ))}
      </g>
      <g fill="#d9dde0" opacity="0.5">
        <rect x="288" y="86" width="22" height="2" />
        <rect x="288" y="96" width="18" height="4" />
        <rect x="288" y="108" width="20" height="4" />
      </g>
      <rect x="300" y="134" width="3" height="50" fill="#14171a" />
      <rect x="356" y="134" width="3" height="50" fill="#14171a" />
      {/* The desk, three monitors, the lamp */}
      <rect width="400" height="250" fill="url(#tk-lamp)" />
      <ellipse cx="200" cy="150" rx="90" ry="40" fill="url(#tk-screens)" />
      <polygon points="118,178 282,178 296,188 104,188" fill="#b9b2a5" />
      <rect x="108" y="188" width="6" height="40" fill="#24282d" />
      <rect x="286" y="188" width="6" height="40" fill="#24282d" />
      <g>
        <polygon points="132,136 168,140 168,166 132,164" fill="#0c1016" stroke="#1d2228" />
        <rect x="174" y="132" width="52" height="32" fill="#0c1016" stroke="#1d2228" />
        <polygon points="232,140 268,136 268,164 232,166" fill="#0c1016" stroke="#1d2228" />
        <g fill="#cfe0f2" opacity="0.75">
          <rect x="179" y="138" width="20" height="1.6" />
          <rect x="179" y="143" width="34" height="1.6" />
          <rect x="179" y="148" width="28" height="1.6" />
        </g>
        <rect x="179" y="153" width="24" height="1.6" fill="#e2b062" opacity="0.85" />
        <rect x="211" y="134" width="7" height="7" fill="#e8dc8a" opacity="0.8" />
        <rect x="198" y="164" width="4" height="14" fill="#15181c" />
      </g>
      <path d="M96 178 L 100 150 L 116 140" stroke="#3a3f44" strokeWidth="2.4" fill="none" />
      <polygon points="110,136 124,140 120,147 106,143" fill="#2b2f33" />
      <rect x="248" y="171" width="7" height="8" rx="1" fill="#e8e2d6" />
      {/* Arif, from behind, in the chair */}
      <path d="M176 250 L 178 208 Q 200 196 222 208 L 224 250 Z" fill="#11151a" />
      <path d="M182 214 Q 200 186 218 214 L 220 236 L 180 236 Z" fill="#1f2a35" />
      <ellipse cx="200" cy="181" rx="10" ry="12" fill="#1a1612" />
      <path d="M190 178 Q 200 164 210 178 Q 205 172 200 172 Q 195 172 190 178 Z" fill="#0d0c0b" />
    </svg>
  )
}

function EmanetArt() {
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--emanet">
      <defs>
        <linearGradient id="em-wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a3029" />
          <stop offset="1" stopColor="#6d5a49" />
        </linearGradient>
        <linearGradient id="em-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe6c6" />
          <stop offset="1" stopColor="#e9b984" />
        </linearGradient>
        <linearGradient id="em-beam" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9a3" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9a3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="em-haze" cx="0.75" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffe4bd" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffe4bd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#em-wall)" />
      {/* Floor */}
      <rect y="186" width="400" height="64" fill="#4a372a" />
      <rect y="186" width="400" height="2" fill="#2c211a" />
      {/* Window with sheer curtains */}
      <rect x="262" y="28" width="104" height="150" fill="url(#em-window)" />
      <g stroke="#cfa77a" strokeWidth="3">
        <line x1="314" y1="28" x2="314" y2="178" />
        <line x1="262" y1="104" x2="366" y2="104" />
      </g>
      <path className="art-curtain" d="M256 22 q8 40 0 80 t2 80 h18 q-6 -40 2 -80 t-2 -80 z" fill="#f6efe2" opacity="0.7" />
      <path className="art-curtain art-curtain--b" d="M372 22 q-8 40 0 80 t-2 80 h-18 q6 -40 -2 -80 t2 -80 z" fill="#f6efe2" opacity="0.7" />
      {/* Light falling across the room */}
      <polygon points="262,178 366,178 250,250 60,250" fill="url(#em-beam)" />
      {/* Table, two chairs, one cup */}
      <rect x="92" y="148" width="132" height="6" fill="#a9845f" />
      <rect x="100" y="154" width="4" height="34" fill="#7a5e44" />
      <rect x="212" y="154" width="4" height="34" fill="#7a5e44" />
      <path d="M74 120 v68 M74 158 h22 v30" stroke="#5a4433" strokeWidth="4" fill="none" />
      <path d="M244 120 v68 M244 158 h-22 v30" stroke="#5a4433" strokeWidth="4" fill="none" />
      <rect x="168" y="138" width="10" height="10" rx="1.5" fill="#8aa0b3" />
      <ellipse cx="173" cy="148.5" rx="9" ry="1.6" fill="#5a3e2a" opacity="0.5" />
      {/* A figure by the window, softer than everything else */}
      <g className="art-figure" opacity="0.55" filter="blur(1.4px)">
        <circle cx="300" cy="118" r="8" fill="#2b221c" />
        <path d="M290 130 q10 -6 20 0 l3 56 h-26 z" fill="#2b221c" />
      </g>
      {/* The capsule's amber point */}
      <circle cx="58" cy="146" r="2.2" fill="#ffb060" />
      <circle cx="58" cy="146" r="7" fill="#ffb060" opacity="0.18" />
      <rect width="400" height="250" fill="url(#em-haze)" />
    </svg>
  )
}


function OfkeArt() {
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
        OTURUM 0412
      </text>
    </svg>
  )
}

function YasamakArt() {
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--yasamak">
      <defs>
        <radialGradient id="ya-glow" cx="0.5" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#ffb766" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb766" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ya-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#25344a" />
          <stop offset="1" stopColor="#0d1521" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="#0b0d12" />
      {/* Window to the street */}
      <rect x="40" y="30" width="320" height="80" fill="url(#ya-window)" />
      <g fill="#ffd9a0" opacity="0.5">
        <circle cx="90" cy="70" r="2" />
        <circle cx="230" cy="64" r="2" />
        <circle cx="320" cy="72" r="2" />
      </g>
      <rect x="40" y="108" width="320" height="3" fill="#1a1d24" />
      {/* Rows of screens */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={46 + i * 52} y="132" width="36" height="24" rx="1.5" fill={i === 3 ? '#2b2013' : '#16202c'} stroke="#3a4a5c" strokeWidth="0.8" />
          <rect x={48 + i * 52} y="134" width="32" height="20" fill={i === 3 ? '#ffb25c' : '#5f86b3'} opacity={i === 3 ? 0.25 : 0.35} />
          {i !== 5 && <circle cx={64 + i * 52} cy="168" r="6" fill="#0f1116" />}
          {i !== 5 && <path d={`M${55 + i * 52} 176 q9 -5 18 0 l2 16 h-22 z`} fill="#121419" />}
        </g>
      ))}
      <rect x="20" y="186" width="360" height="6" fill="#1b1d22" />
      <rect width="400" height="250" fill="url(#ya-glow)" />
      <text x="220" y="148" textAnchor="middle" fontSize="9" fill="#ffc77f" fontFamily="monospace" letterSpacing="1">
        59:59
      </text>
    </svg>
  )
}

function KalanArt() {
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--kalan">
      <defs>
        <radialGradient id="ka-lamp" cx="0.36" cy="0.55" r="0.45">
          <stop offset="0" stopColor="#ffcf96" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffcf96" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ka-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1d6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff1d6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="#17130f" />
      <rect y="178" width="400" height="72" fill="#211a14" />
      {/* The door, and its other version slightly out of place */}
      <rect x="276" y="52" width="72" height="126" fill="#2b221b" stroke="#3a2f25" strokeWidth="2" />
      <rect x="283" y="47" width="72" height="126" fill="none" stroke="#c9b28f" strokeWidth="0.8" opacity="0.25" />
      <circle cx="338" cy="118" r="2.4" fill="#b48f58" />
      <rect x="276" y="176" width="72" height="16" fill="url(#ka-under)" />
      {/* A photograph, tilted */}
      <g transform="rotate(-4 120 70)">
        <rect x="96" y="48" width="48" height="36" fill="#3a2f26" />
        <rect x="100" y="52" width="40" height="28" fill="#8c7a63" opacity="0.7" />
        <circle cx="113" cy="62" r="4" fill="#3a2f26" />
        <circle cx="128" cy="62" r="4" fill="#3a2f26" opacity="0.35" />
      </g>
      {/* Table, lamp, the recorder */}
      <rect x="92" y="150" width="120" height="6" fill="#4a3a2c" />
      <rect x="100" y="156" width="4" height="30" fill="#3a2d22" />
      <rect x="200" y="156" width="4" height="30" fill="#3a2d22" />
      <path d="M120 112 l14 -22 h16 l14 22 z" fill="#d9b88a" opacity="0.85" />
      <rect x="140" y="112" width="2" height="38" fill="#2c231b" />
      <rect x="160" y="136" width="34" height="14" rx="2" fill="#2a2522" stroke="#5a4c3e" strokeWidth="0.8" />
      <circle cx="170" cy="143" r="3.2" fill="#14110f" stroke="#7a6a58" strokeWidth="0.6" />
      <circle cx="184" cy="143" r="3.2" fill="#14110f" stroke="#7a6a58" strokeWidth="0.6" />
      <circle cx="190" cy="138.5" r="0.9" fill="#ff5a3c" />
      <rect width="400" height="250" fill="url(#ka-lamp)" />
    </svg>
  )
}

function EsikArt() {
  const people: Array<[number, number]> = [
    [96, 198],
    [126, 192],
    [306, 200],
    [330, 206],
  ]
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--esik">
      <defs>
        <linearGradient id="es-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05070c" />
          <stop offset="1" stopColor="#141b2a" />
        </linearGradient>
        <radialGradient id="es-lamp" cx="0.69" cy="0.28" r="0.32">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#es-sky)" />
      {/* Buildings receding along a street */}
      <polygon points="0,20 150,90 150,190 0,250" fill="#10141c" />
      <polygon points="400,10 250,90 250,190 400,250" fill="#0d1118" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} fill="#ffcf8a" opacity={0.25 + (i % 3) * 0.15}>
          <rect x={18 + i * 20} y={60 + i * 8} width="6" height="8" />
          <rect x={372 - i * 20} y={52 + i * 9} width="6" height="8" />
        </g>
      ))}
      <polygon points="150,190 250,190 400,250 0,250" fill="#0a0d12" />
      {/* The door at the end of the street */}
      <rect x="190" y="118" width="20" height="40" fill="#f2e6cf" opacity="0.85" />
      <rect x="190" y="112" width="20" height="4" fill="#20242c" />
      {/* Streetlight */}
      <rect x="276" y="70" width="2" height="130" fill="#20242c" />
      <rect x="262" y="68" width="18" height="3" fill="#20242c" />
      <rect width="400" height="250" fill="url(#es-lamp)" />
      {/* People, every face lit by a phone */}
      {people.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y - 18} r="4" fill="#0c0f15" />
          <path d={`M${x - 6} ${y - 12} q6 -4 12 0 l2 22 h-16 z`} fill="#0c0f15" />
          <rect x={x - 2} y={y - 16} width="4" height="2.4" fill="#8fb8ff" opacity="0.8" />
        </g>
      ))}
      {/* Mira, walking toward the door */}
      <g opacity="0.95">
        <circle cx="206" cy="176" r="3.6" fill="#d9cdb8" />
        <path d="M201 181 q5 -3 10 0 l1 16 h-12 z" fill="#d9cdb8" />
      </g>
    </svg>
  )
}

export const STORY_ART: Record<StoryId, () => React.JSX.Element> = {
  tekerrur: TekerrurArt,
  emanet: EmanetArt,
  ofke: OfkeArt,
  yasamak: YasamakArt,
  kalan: KalanArt,
  esik: EsikArt,
}
