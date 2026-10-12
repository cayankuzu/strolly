'use client'

/** The Centre's white hall from behind a man in a pale blue shirt: a blue line runs straight on to the glass doors, a red one starts under his right foot and turns away to a door marked 2; above him, thin cyan-green threads rise from his head into the ceiling light. */
export function BeyinKokuArt() {
  // Threads from the crown of his head, fanning up into the ceiling: [path, width, opacity].
  const threads: Array<[string, number, number]> = [
    ['M206 150 C204 120 188 96 170 62 S150 20 140 0', 0.9, 0.42],
    ['M207 150 C208 118 214 90 222 58 S236 18 246 0', 0.9, 0.42],
    ['M206 151 C200 126 176 110 150 86 S104 40 86 0', 0.6, 0.26],
    ['M208 151 C214 124 240 106 266 82 S312 36 330 0', 0.6, 0.26],
    ['M207 150 C207 112 205 70 206 0', 0.7, 0.34],
    ['M206 150 C196 130 160 122 120 100 S48 52 20 30', 0.45, 0.18],
    ['M208 150 C220 132 260 124 300 102 S356 56 384 34', 0.45, 0.18],
  ]
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--beyinkoku">
      <defs>
        <linearGradient id="bk-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe3e7" />
          <stop offset="1" stopColor="#fafbfc" />
        </linearGradient>
        <linearGradient id="bk-wall-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c7cdd3" />
          <stop offset="1" stopColor="#e4e8eb" />
        </linearGradient>
        <linearGradient id="bk-wall-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#c3c9cf" />
          <stop offset="1" stopColor="#e1e5e8" />
        </linearGradient>
        <linearGradient id="bk-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6f0f8" />
        </linearGradient>
        <radialGradient id="bk-glow" cx="0.5" cy="0.38" r="0.62">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bk-vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#0a0f1a" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0f1a" stopOpacity="0.42" />
        </radialGradient>
        <linearGradient id="bk-shirt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a4c0de" />
          <stop offset="0.55" stopColor="#c4daf1" />
          <stop offset="1" stopColor="#93b0cf" />
        </linearGradient>
      </defs>
      {/* The hall: ceiling, walls, back wall, glossy floor */}
      <rect width="400" height="250" fill="#eef1f3" />
      <polygon points="0,0 400,0 290,60 110,60" fill="#f4f6f7" />
      <polygon points="0,0 110,60 110,150 0,250" fill="url(#bk-wall-l)" />
      <polygon points="400,0 290,60 290,150 400,250" fill="url(#bk-wall-r)" />
      <rect x="110" y="60" width="180" height="90" fill="#eceff2" />
      <polygon points="110,150 290,150 400,250 0,250" fill="url(#bk-floor)" />
      {/* Ceiling light panels in perspective */}
      <g fill="#ffffff" opacity="0.9">
        <polygon points="168,16 232,16 226,26 174,26" />
        <polygon points="178,36 222,36 219,42 181,42" />
        <polygon points="185,50 215,50 213.5,54 186.5,54" />
      </g>
      {/* The glass doors at the end, and their reflection in the floor */}
      <rect x="172" y="82" width="56" height="68" fill="url(#bk-door)" stroke="#c4ced7" strokeWidth="1" />
      <rect x="199.4" y="82" width="1.2" height="68" fill="#c4ced7" />
      <rect x="172" y="151" width="56" height="30" fill="#ffffff" opacity="0.32" />
      {/* The door marked 2 on the right wall */}
      <polygon points="318,96 340,86 340,180 318,168" fill="#d3d8dd" stroke="#b5bdc5" strokeWidth="0.8" />
      <circle cx="322.5" cy="134" r="1.4" fill="#8d969f" />
      <text x="329" y="108" fontSize="9" fontFamily="monospace" fill="#7d8790" textAnchor="middle" transform="skewY(-24) translate(0 146)">
        2
      </text>
      {/* The blue line: straight on, to the doors */}
      <polygon points="170,250 186,250 198.6,151 196.6,151" fill="#2f7bff" opacity="0.92" />
      {/* The red line: from under his right foot, then away to the door */}
      <polygon points="214,250 230,250 223,200 236,200 325,177 325,173 238,192 216,192" fill="#e8322f" opacity="0.92" />
      <polygon points="214,250 230,250 223,200 236,200 325,177 325,173 238,192 216,192" fill="#ff6a5a" opacity="0.18" transform="translate(0 2)" />
      {/* Him, from behind: trousers, shirt, neck, head */}
      <ellipse cx="207" cy="231" rx="20" ry="3" fill="#9aa4ad" opacity="0.35" />
      <path d="M196 196 L194 229 L202 229 L206 202 L208 202 L212 229 L220 229 L218 196 Z" fill="#3a4250" />
      <rect x="193.5" y="227.5" width="9" height="3.5" rx="1.5" fill="#1d2228" />
      <rect x="211.5" y="227.5" width="9" height="3.5" rx="1.5" fill="#1d2228" />
      <path d="M193 165 Q207 158 221 165 L223 199 L191 199 Z" fill="url(#bk-shirt)" />
      <path d="M193 166 L188 196 L192 197 L196 172 Z" fill="#a9c4e0" />
      <path d="M221 166 L226 196 L222 197 L218 172 Z" fill="#9db9d7" />
      <rect x="203.5" y="155" width="7" height="6" fill="#d8b49a" />
      <ellipse cx="207" cy="149" rx="7.5" ry="8.5" fill="#5b4535" />
      <ellipse cx="200" cy="151" rx="1.2" ry="2.2" fill="#d2ab90" />
      <ellipse cx="214" cy="151" rx="1.2" ry="2.2" fill="#d2ab90" />
      {/* The threads */}
      <g fill="none" stroke="#5fe0c0" strokeLinecap="round">
        {threads.map(([d, w, o], i) => (
          <path key={i} d={d} strokeWidth={w} opacity={o} />
        ))}
      </g>
      <circle cx="207" cy="142" r="2.2" fill="#5fe0c0" opacity="0.5" />
      <rect width="400" height="250" fill="url(#bk-glow)" />
      <rect width="400" height="250" fill="url(#bk-vignette)" />
    </svg>
  )
}
