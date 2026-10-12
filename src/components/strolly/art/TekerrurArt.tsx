'use client'
/** The square room at dusk from a high corner: forest and a stream on the screen walls, a violet sky above, oak planks, a dark desk in the exact centre with a man asleep on it, and a small robot standing apart with its one lens on him. */
export function TekerrurArt() {
  // Trunks on the two walls (x, top, bottom, width), fixed pseudo-random.
  const trunksL = Array.from({ length: 16 }, (_, i) => ({ x: 8 + i * 12.5 + ((i * 7) % 5), w: 1.2 + ((i * 13) % 4) * 0.6, o: 0.45 + ((i * 5) % 4) * 0.12 }))
  const trunksR = Array.from({ length: 15 }, (_, i) => ({ x: 214 + i * 12.6 + ((i * 11) % 6), w: 1.2 + ((i * 7) % 4) * 0.6, o: 0.45 + ((i * 3) % 4) * 0.12 }))
  const leaves = Array.from({ length: 46 }, (_, i) => ({ x: ((i * 37) % 400) + ((i * 13) % 9), y: 26 + ((i * 23) % 46), r: 6 + ((i * 17) % 10), o: 0.35 + ((i * 7) % 5) * 0.1 }))
  const planks = Array.from({ length: 22 }, (_, i) => i)
  // Wall line at x: top and bottom edges of the two walls meeting in the far corner (205).
  const topL = (x: number) => -20 + (x / 205) * 40
  const botL = (x: number) => 215 - (x / 205) * 65
  const topR = (x: number) => 20 - ((x - 205) / 195) * 30
  const botR = (x: number) => 150 + ((x - 205) / 195) * 50
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--tekerrur">
      <defs>
        <linearGradient id="tkr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a7aa8" />
          <stop offset="0.28" stopColor="#5d6a72" />
          <stop offset="0.6" stopColor="#3a4a38" />
          <stop offset="1" stopColor="#2a2a20" />
        </linearGradient>
        <linearGradient id="tkr-ceil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e3462" />
          <stop offset="1" stopColor="#7a5f8e" />
        </linearGradient>
        <linearGradient id="tkr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4c33" />
          <stop offset="1" stopColor="#2c1f15" />
        </linearGradient>
        <linearGradient id="tkr-stream" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d8c96" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#b8c4cc" stopOpacity="0.7" />
          <stop offset="1" stopColor="#7d8c96" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="tkr-glow" cx="0.5" cy="0.72" r="0.5">
          <stop offset="0" stopColor="#f0b47a" stopOpacity="0.32" />
          <stop offset="1" stopColor="#f0b47a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tkr-lamp" cx="0.47" cy="0.7" r="0.12">
          <stop offset="0" stopColor="#ffd39a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd39a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="tkr-left">
          <polygon points={`0,${topL(0)} 205,${topL(205)} 205,${botL(205)} 0,${botL(0)}`} />
        </clipPath>
        <clipPath id="tkr-right">
          <polygon points={`205,${topR(205)} 400,${topR(400)} 400,${botR(400)} 205,${botR(205)}`} />
        </clipPath>
      </defs>
      <rect width="400" height="250" fill="#0a0b0e" />
      {/* The ceiling: a violet sky with a long cloud */}
      <polygon points={`0,0 400,0 400,${topR(400)} 205,20 0,${topL(0)}`} fill="url(#tkr-ceil)" />
      <path d="M150 6 Q 190 2 236 7 Q 250 10 236 12 Q 196 14 160 11 Q 140 10 150 6 Z" fill="#b39ac0" opacity="0.5" />
      {/* The two walls: forest by a stream */}
      <g clipPath="url(#tkr-left)">
        <rect x="0" y="-20" width="205" height="240" fill="url(#tkr-wall)" />
        {trunksL.map((t, i) => (
          <rect key={i} x={t.x} y={topL(t.x)} width={t.w} height={botL(t.x) - topL(t.x)} fill="#1d1a14" opacity={t.o} />
        ))}
        {leaves
          .filter((l) => l.x < 205)
          .map((l, i) => (
            <circle key={i} cx={l.x} cy={topL(l.x) + l.y * 0.8} r={l.r} fill={i % 3 ? '#3c4a32' : '#4a5a3a'} opacity={l.o} />
          ))}
        {/* The waterfall and the stream along the floor */}
        <rect x="128" y="74" width="9" height="56" fill="#cfd6da" opacity="0.55" />
        <polygon points={`0,${botL(0) - 22} 205,${botL(205) - 14} 205,${botL(205)} 0,${botL(0)}`} fill="url(#tkr-stream)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={i * 41} y1={topL(i * 41)} x2={i * 41} y2={botL(i * 41)} stroke="#0b0c0d" strokeWidth="0.7" opacity="0.7" />
        ))}
      </g>
      <g clipPath="url(#tkr-right)">
        <rect x="205" y="-20" width="195" height="240" fill="url(#tkr-wall)" />
        {trunksR.map((t, i) => (
          <rect key={i} x={t.x} y={topR(t.x)} width={t.w} height={botR(t.x) - topR(t.x)} fill="#1d1a14" opacity={t.o} />
        ))}
        {leaves
          .filter((l) => l.x >= 205)
          .map((l, i) => (
            <circle key={i} cx={l.x} cy={topR(l.x) + l.y * 0.8} r={l.r} fill={i % 3 ? '#3a4a30' : '#4c5c3c'} opacity={l.o} />
          ))}
        <polygon points={`205,${botR(205) - 14} 400,${botR(400) - 22} 400,${botR(400)} 205,${botR(205)}`} fill="url(#tkr-stream)" opacity="0.6" />
        {[1, 2, 3, 4].map((i) => (
          <line key={i} x1={205 + i * 39} y1={topR(205 + i * 39)} x2={205 + i * 39} y2={botR(205 + i * 39)} stroke="#0b0c0d" strokeWidth="0.7" opacity="0.7" />
        ))}
        {/* The right door's concrete portal, in the middle of the wall */}
        <polygon points={`${292},${topR(292) + 52} ${314},${topR(314) + 54} ${314},${botR(314)} ${292},${botR(292)}`} fill="none" stroke="#8c8a86" strokeWidth="4" />
      </g>
      <line x1="205" y1="20" x2="205" y2="150" stroke="#0b0c0d" strokeWidth="1" />
      {/* Oak planks */}
      <polygon points={`0,${botL(0)} 205,150 400,${botR(400)} 400,250 0,250`} fill="url(#tkr-floor)" />
      <g stroke="#2a1d13" strokeWidth="0.6" opacity="0.6">
        {planks.map((i) => (
          <line key={i} x1={205 + (i - 11) * 6} y1="150" x2={205 + (i - 11) * 44} y2="250" />
        ))}
      </g>
      <rect width="400" height="250" fill="url(#tkr-glow)" />
      {/* The desk in the exact centre: dark glass, three dark screens, the button */}
      <ellipse cx="200" cy="200" rx="62" ry="12" fill="#000" opacity="0.35" />
      <polygon points="150,184 236,176 262,190 172,200" fill="#0d1013" stroke="#2a2f33" strokeWidth="0.8" />
      <polygon points="172,200 262,190 262,193 172,203" fill="#060708" />
      <rect x="174" y="202" width="3" height="14" fill="#15181b" />
      <rect x="255" y="193" width="3" height="14" fill="#15181b" />
      <polygon points="168,164 186,162 186,178 168,180" fill="#090b0d" stroke="#22272b" strokeWidth="0.6" />
      <polygon points="190,158 226,154 226,174 190,177" fill="#090b0d" stroke="#22272b" strokeWidth="0.6" />
      <polygon points="230,154 248,154 248,172 230,173" fill="#090b0d" stroke="#22272b" strokeWidth="0.6" />
      <circle cx="210" cy="181" r="1.6" fill="#030303" stroke="#3a3d40" strokeWidth="0.5" />
      <rect width="400" height="250" fill="url(#tkr-lamp)" />
      {/* The man asleep on it, arms hanging */}
      <path d="M208 206 Q 206 192 196 188 Q 190 186 186 190 Q 194 196 198 210 Z" fill="#3b3a28" />
      <ellipse cx="189" cy="186" rx="6" ry="4.4" fill="#2a221c" />
      <path d="M196 196 L 193 214" stroke="#3b3a28" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M206 198 L 208 215" stroke="#3b3a28" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M200 208 L 214 206 L 216 222 L 202 224 Z" fill="#17191b" />
      {/* The third robot, apart, its lens on him */}
      <ellipse cx="120" cy="205" rx="9" ry="2.6" fill="#000" opacity="0.4" />
      <path d="M113 205 L 114 186 Q 120 182 126 186 L 127 205 Z" fill="#8a857c" />
      <rect x="119" y="176" width="2" height="9" fill="#5a5d60" />
      <rect x="115" y="170" width="11" height="7" rx="2.5" fill="#8f8a80" />
      <circle cx="125.5" cy="173.5" r="1.7" fill="#08090a" />
      <circle cx="126.6" cy="172.2" r="0.7" fill="#ffffff" />
      <ellipse cx="120" cy="204" rx="7" ry="1.4" fill="none" stroke="#e8ecee" strokeWidth="0.6" opacity="0.7" />
    </svg>
  )
}
