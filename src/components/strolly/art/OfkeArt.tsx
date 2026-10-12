'use client'

/** The white room from its doorway: a man in white-grey overalls with his back to us, and on the far wall a boss's office — desk, a window full of morning sun — soaking into the white like water into a towel, its edge made of small cells; a mint sliver of corridor light on the floor. */
export function OfkeArt() {
  // Cells along the wet edge: [x, y, size, colour].
  const cells: Array<[number, number, number, string]> = [
    [170, 44, 6, '#d9cfbe'],
    [184, 30, 5, '#f3c98c'],
    [206, 18, 6, '#ffffff'],
    [236, 10, 5, '#d9cfbe'],
    [268, 6, 6, '#f3c98c'],
    [300, 8, 5, '#d9cfbe'],
    [330, 12, 6, '#ffffff'],
    [358, 20, 5, '#d9cfbe'],
    [386, 32, 6, '#f3c98c'],
    [394, 174, 5, '#5a6b80'],
    [378, 196, 6, '#ffffff'],
    [360, 208, 5, '#5a6b80'],
    [338, 218, 6, '#d9cfbe'],
    [312, 222, 5, '#5a6b80'],
    [288, 214, 6, '#ffffff'],
    [264, 206, 5, '#5a6b80'],
    [246, 200, 6, '#3a2a1a'],
    [230, 208, 5, '#5a6b80'],
    [214, 210, 6, '#ffffff'],
    [200, 198, 5, '#5a6b80'],
    [188, 184, 6, '#d9cfbe'],
    [176, 166, 5, '#ffffff'],
    [167, 140, 6, '#d9cfbe'],
    [161, 112, 5, '#f3c98c'],
    [158, 86, 6, '#d9cfbe'],
    [163, 64, 5, '#ffffff'],
    [196, 24, 4, '#d9cfbe'],
    [316, 4, 4, '#ffffff'],
    [350, 214, 4, '#5a6b80'],
    [182, 176, 4, '#5a6b80'],
    [224, 216, 4, '#ffffff'],
    [156, 100, 4, '#d9cfbe'],
  ]
  const patch = 'M170 50 C190 22 236 8 286 10 C332 12 372 24 404 44 L404 168 C398 186 382 200 362 206 C336 214 310 222 286 214 C262 206 246 198 232 206 C218 214 206 208 198 196 C188 182 178 170 172 150 C164 126 158 96 164 72 C166 62 168 56 170 50 Z'
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--ofke">
      <defs>
        <linearGradient id="of-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1f1" />
          <stop offset="0.64" stopColor="#f6f8f8" />
          <stop offset="0.66" stopColor="#e3e7e7" />
          <stop offset="1" stopColor="#f2f4f4" />
        </linearGradient>
        <linearGradient id="of-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset="0.6" stopColor="#f8cf92" />
          <stop offset="1" stopColor="#efb878" />
        </linearGradient>
        <linearGradient id="of-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3a22" />
          <stop offset="1" stopColor="#2c1a0e" />
        </linearGradient>
        <linearGradient id="of-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="of-mint" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7fd1c1" stopOpacity="0.7" />
          <stop offset="1" stopColor="#7fd1c1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="of-overalls" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9bec2" />
          <stop offset="0.5" stopColor="#d6dadc" />
          <stop offset="1" stopColor="#bcc1c4" />
        </linearGradient>
        <radialGradient id="of-wet" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#8a7b66" stopOpacity="0" />
          <stop offset="1" stopColor="#8a7b66" stopOpacity="0.45" />
        </radialGradient>
        <clipPath id="of-clip">
          <path d={patch} />
        </clipPath>
      </defs>
      {/* The white room, shadowless; the floor begins at the faint line */}
      <rect width="400" height="250" fill="url(#of-wall)" />
      {/* The office soaking in: wall, carpet, window, desk — only inside the wet patch */}
      <g clipPath="url(#of-clip)">
        <rect x="140" y="0" width="240" height="165" fill="#d9cfbe" />
        <rect x="140" y="165" width="240" height="90" fill="#5a6b80" />
        <rect x="140" y="163" width="240" height="4" fill="#8f8674" />
        <rect x="230" y="40" width="104" height="76" fill="url(#of-sky)" />
        <g fill="#8fa3b8" opacity="0.55">
          <rect x="238" y="78" width="16" height="38" />
          <rect x="260" y="64" width="12" height="52" />
          <rect x="300" y="72" width="20" height="44" />
        </g>
        <g fill="#2f2a24">
          <rect x="226" y="36" width="112" height="4" />
          <rect x="226" y="36" width="4" height="84" />
          <rect x="330" y="36" width="4" height="84" />
          <rect x="226" y="116" width="112" height="4" />
          <rect x="280" y="36" width="3" height="84" />
        </g>
        {/* Sun across the carpet */}
        <polygon points="232,118 332,118 372,250 196,250" fill="url(#of-beam)" />
        {/* The desk, empty */}
        <polygon points="212,158 318,158 334,176 198,176" fill="#7a5433" />
        <rect x="198" y="176" width="136" height="22" fill="url(#of-desk)" />
        <rect x="236" y="162" width="52" height="9" fill="#1d1a16" opacity="0.6" />
        <rect x="300" y="150" width="7" height="10" fill="#1b1b1b" />
        <circle cx="303.5" cy="149" r="4" fill="#2a2a2a" />
      </g>
      {/* The wet edge: a darker rim, and the small cells the water advances in */}
      <path d={patch} fill="url(#of-wet)" opacity="0.9" />
      <path d={patch} fill="none" stroke="#9a8d7a" strokeWidth="1.2" opacity="0.35" />
      <g>
        {cells.map(([x, y, s, c], i) => (
          <rect key={i} x={x} y={y} width={s} height={s} fill={c} opacity={0.9} />
        ))}
      </g>
      {/* Satellite drops the water has already reached */}
      <ellipse cx="300" cy="234" rx="16" ry="5" fill="#5a6b80" />
      <ellipse cx="300" cy="234" rx="16" ry="5" fill="none" stroke="#3f4c5c" strokeWidth="1" opacity="0.5" />
      <rect x="318" y="230" width="4" height="4" fill="#5a6b80" opacity="0.9" />
      <rect x="280" y="236" width="4" height="4" fill="#ffffff" opacity="0.9" />
      <ellipse cx="148" cy="128" rx="7" ry="9" fill="#d9cfbe" />
      <ellipse cx="148" cy="128" rx="7" ry="9" fill="none" stroke="#9a8d7a" strokeWidth="1" opacity="0.4" />
      <rect x="140" y="118" width="4" height="4" fill="#d9cfbe" opacity="0.9" />
      {/* A beam that reaches beyond the colour onto the white floor */}
      <polygon points="208,180 232,180 172,250 128,250" fill="url(#of-beam)" opacity="0.35" />
      {/* Mint corridor light from the door behind us */}
      <polygon points="150,250 262,250 222,196 190,196" fill="url(#of-mint)" />
      {/* The man, back to us, in the overalls: his faint shadow, legs, body, arms, head */}
      <ellipse cx="118" cy="236" rx="30" ry="6" fill="#aab3b2" opacity="0.4" />
      <g>
        <path d="M100 150 L96 232 L112 232 L116 162 L121 162 L126 232 L142 232 L137 150 Z" fill="url(#of-overalls)" />
        <path d="M94 108 Q96 96 108 92 L128 92 Q140 96 142 108 L139 154 L99 154 Z" fill="url(#of-overalls)" />
        <path d="M118 96 L118 152" stroke="#aeb4b8" strokeWidth="1.2" opacity="0.8" />
        <path d="M96 106 Q84 130 88 150 L96 152 L98 112 Z" fill="#c3c8cb" />
        <path d="M140 106 Q152 130 148 150 L140 152 L138 112 Z" fill="#c3c8cb" />
        <ellipse cx="88" cy="156" rx="5" ry="7" fill="#d9b58f" />
        <ellipse cx="148" cy="156" rx="5" ry="7" fill="#d9b58f" />
        <rect x="104" y="100" width="30" height="10" fill="#e8ebec" opacity="0.8" />
        <ellipse cx="104" cy="235" rx="9" ry="4" fill="#f1f1ef" />
        <ellipse cx="134" cy="235" rx="9" ry="4" fill="#f1f1ef" />
        <path d="M111 92 L111 84 L127 84 L127 92 Z" fill="#d9b58f" />
        <ellipse cx="119" cy="74" rx="12.5" ry="13.5" fill="#2a2017" />
        <ellipse cx="119" cy="80" rx="11" ry="9" fill="#2a2017" />
      </g>
    </svg>
  )
}
