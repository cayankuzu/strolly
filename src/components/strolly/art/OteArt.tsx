'use client'

/** A walnut table in one cone of lamplight, a navy pen across an empty signature line; in the black glass behind, three faint standing figures, and where the lamp should be reflected, a thin golden ring. */
export function OteArt() {
  const grain = Array.from({ length: 9 }, (_, i) => ({ y: 176 + i * 8.5 + ((i * 7) % 4), o: 0.08 + ((i * 5) % 4) * 0.03 }))
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--ote">
      <defs>
        <linearGradient id="ot-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b1016" />
          <stop offset="0.55" stopColor="#111821" />
          <stop offset="1" stopColor="#07090c" />
        </linearGradient>
        <linearGradient id="ot-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.34" />
          <stop offset="0.7" stopColor="#f2b66b" stopOpacity="0.1" />
          <stop offset="1" stopColor="#f2b66b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ot-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a10" />
          <stop offset="1" stopColor="#120b06" />
        </linearGradient>
        <radialGradient id="ot-pool" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#b9773d" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#6a4022" stopOpacity="0.7" />
          <stop offset="1" stopColor="#3a2618" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ot-ring" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#ffe2a8" stopOpacity="0" />
          <stop offset="0.72" stopColor="#ffe2a8" stopOpacity="0.5" />
          <stop offset="0.8" stopColor="#ff9b4a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff9b4a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ot-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4eee2" />
          <stop offset="1" stopColor="#d9cdb6" />
        </linearGradient>
        <linearGradient id="ot-pen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4c86" />
          <stop offset="0.5" stopColor="#1a2344" />
          <stop offset="1" stopColor="#0c1124" />
        </linearGradient>
      </defs>
      {/* The room: black, and the dark glass wall behind the table */}
      <rect width="400" height="250" fill="#050607" />
      <rect x="0" y="0" width="400" height="168" fill="url(#ot-glass)" />
      <g fill="#05070a">
        <rect x="96" y="0" width="5" height="168" />
        <rect x="214" y="0" width="5" height="168" />
        <rect x="332" y="0" width="5" height="168" />
      </g>
      {/* In the glass, faint: the three of us, standing */}
      <g fill="#1d2633" opacity="0.85">
        <circle cx="52" cy="62" r="9" />
        <path d="M34 168 L36 96 Q38 76 52 75 Q66 76 68 96 L70 168 Z" />
        <circle cx="134" cy="58" r="9.5" />
        <path d="M114 168 L116 92 Q118 71 134 70 Q150 71 152 92 L154 168 Z" />
        <circle cx="178" cy="66" r="8.5" />
        <path d="M161 168 L163 100 Q165 82 178 81 Q191 82 193 100 L195 168 Z" />
      </g>
      {/* A glint on her tablet */}
      <rect x="126" y="104" width="10" height="6" fill="#9fb8d8" opacity="0.35" transform="rotate(-12 131 107)" />
      {/* Where the lamp's reflection should be: a thin golden ring */}
      <circle cx="292" cy="58" r="30" fill="url(#ot-ring)" />
      <circle cx="292" cy="58" r="16" fill="none" stroke="#ffe2a8" strokeWidth="1.4" opacity="0.9" />
      <circle cx="292" cy="58" r="15" fill="#020203" opacity="0.6" />
      {/* The pendant lamp and its cone */}
      <polygon points="214,40 264,40 352,250 120,250" fill="url(#ot-cone)" />
      <line x1="239" y1="0" x2="239" y2="22" stroke="#141414" strokeWidth="1.5" />
      <path d="M222 40 L231 22 L247 22 L256 40 Z" fill="#101010" />
      <line x1="222" y1="40" x2="256" y2="40" stroke="#b08d57" strokeWidth="1.2" />
      <ellipse cx="239" cy="40.5" rx="16" ry="1.6" fill="#ffe8bf" />
      {/* The walnut table, its edge, the pool of light */}
      <polygon points="40,168 400,168 400,250 0,250" fill="url(#ot-table)" />
      <rect x="0" y="166" width="400" height="3" fill="#3a2618" />
      <ellipse cx="236" cy="208" rx="140" ry="38" fill="url(#ot-pool)" />
      <g stroke="#1a0f08" strokeWidth="0.8" fill="none">
        {grain.map((g, i) => (
          <path key={i} d={`M0 ${g.y} Q120 ${g.y - 3} 220 ${g.y + 1} T400 ${g.y - 2}`} opacity={g.o} />
        ))}
      </g>
      {/* The last page, and its empty signature line */}
      <polygon points="186,188 284,184 296,232 176,238" fill="url(#ot-paper)" />
      <polygon points="186,188 284,184 296,232 176,238" fill="#000" opacity="0.06" />
      <g stroke="#3a3632" strokeWidth="0.9" opacity="0.5">
        <line x1="198" y1="198" x2="268" y2="195.5" />
        <line x1="199" y1="203" x2="262" y2="200.8" />
      </g>
      <g stroke="#2a2826" strokeWidth="1.1">
        <line x1="203" y1="219" x2="208" y2="224" />
        <line x1="208" y1="219" x2="203" y2="224" />
        <line x1="212" y1="224" x2="276" y2="221.5" />
      </g>
      {/* The navy pen, lying across the line, a point of ink blue */}
      <g transform="rotate(-24 246 222)">
        <rect x="210" y="219" width="70" height="5.5" rx="2.6" fill="url(#ot-pen)" />
        <rect x="262" y="218.4" width="4" height="6.7" rx="1" fill="#cfd2d6" />
        <rect x="256" y="216.6" width="18" height="1.6" rx="0.8" fill="#d6d8db" />
        <path d="M210 219.2 L201 221.75 L210 224.3 Z" fill="#cfd2d6" />
        <circle cx="201.2" cy="221.75" r="0.9" fill="#2f4fd8" />
      </g>
      <ellipse cx="244" cy="232" rx="34" ry="3" fill="#000" opacity="0.28" />
    </svg>
  )
}
