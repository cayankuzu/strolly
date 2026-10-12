'use client'
/** A paper plane frozen mid-air in a slanted beam of October light, chalk dust around it; behind, soft, a green chalkboard and the back of a teacher in a grey-brown cardigan. */
export function TekAyakArt() {
  const motes = Array.from({ length: 44 }, (_, i) => ({ x: 40 + ((i * 47) % 230), y: 30 + ((i * 31) % 170), r: 0.5 + ((i * 7) % 5) * 0.25, o: 0.2 + ((i * 13) % 6) * 0.09 }))
  const writing = Array.from({ length: 5 }, (_, i) => ({ y: 74 + i * 15, w: 120 - ((i * 37) % 50) }))
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--tekayak">
      <defs>
        <linearGradient id="ta-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9cfb6" />
          <stop offset="1" stopColor="#b3a688" />
        </linearGradient>
        <linearGradient id="ta-board" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#36543f" />
          <stop offset="1" stopColor="#253b2d" />
        </linearGradient>
        <linearGradient id="ta-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe2ad" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#ffd59a" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffd59a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ta-cardigan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5f584e" />
          <stop offset="0.6" stopColor="#7c7468" />
          <stop offset="1" stopColor="#8f8678" />
        </linearGradient>
        <linearGradient id="ta-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf8f0" />
          <stop offset="1" stopColor="#d8d2c4" />
        </linearGradient>
        <linearGradient id="ta-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f907c" />
          <stop offset="1" stopColor="#5b5d50" />
        </linearGradient>
        <filter id="ta-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id="ta-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="400" height="250" fill="url(#ta-wall)" />
      <rect x="0" y="190" width="400" height="60" fill="url(#ta-floor)" />
      {/* Out of focus: the board, its chalk lines, the teacher's back at it */}
      <g filter="url(#ta-soft)">
        <rect x="150" y="40" width="250" height="122" fill="url(#ta-board)" />
        <rect x="150" y="160" width="250" height="5" fill="#8d8a80" />
        <g stroke="#e8e6da" strokeWidth="2.2" strokeLinecap="round" opacity="0.55">
          {writing.map((l, i) => (
            <path key={i} d={`M${262} ${l.y} q 8 -5 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`} strokeDasharray={`${l.w} 400`} fill="none" />
          ))}
        </g>
        {/* The teacher: grey hair, cardigan, the right arm up at the board */}
        <ellipse cx="236" cy="96" rx="15" ry="17" fill="#8f8b86" />
        <path d="M206 250 L208 150 Q210 118 236 114 Q262 118 266 150 L268 250 Z" fill="url(#ta-cardigan)" />
        <path d="M258 128 Q276 110 282 86 L290 88 Q286 116 266 140 Z" fill="#7c7468" />
        <circle cx="286" cy="84" r="5" fill="#c89a7e" />
      </g>
      {/* The October beam from the left windows */}
      <polygon points="0,0 120,0 330,250 120,250" fill="url(#ta-beam)" />
      <g fill="#fff4d8" filter="url(#ta-glow)">
        {motes.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} opacity={m.o} />
        ))}
      </g>
      {/* The plane, frozen mid-air in the light, a scribble of marker on its wing */}
      <g transform="translate(118 112) rotate(-14)">
        <polygon points="0,0 96,22 34,30" fill="url(#ta-wing)" />
        <polygon points="0,0 96,22 40,40" fill="#cfc8b8" />
        <polygon points="34,30 96,22 40,40" fill="#b9b2a2" />
        <path d="M30 18 q 4 -4 7 0 t 7 0 m 4 -1 q 3 -5 6 0 m 4 1 q 4 -4 8 0 t 8 0" stroke="#1a1a1a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <line x1="0" y1="0" x2="96" y2="22" stroke="#fff" strokeWidth="0.8" opacity="0.8" />
      </g>
      {/* A thin vignette */}
      <rect width="400" height="250" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="24" />
    </svg>
  )
}
