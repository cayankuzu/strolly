'use client'
/** A navy-black void crossed by a nearly invisible glass line; a boy in a red windbreaker walks it with his hands in his pockets, and under it, upside down and sole to sole, a pale translucent copy of him walks along. */

/** The boy, feet at the origin, facing +x, up is −y. */
function Boy({ ghost = false }: { ghost?: boolean }) {
  const jacket = ghost ? '#cfefff' : '#c0392b'
  const jacketDark = ghost ? '#cfefff' : '#9e2c22'
  const jeans = ghost ? '#cfefff' : '#3b4f72'
  const skin = ghost ? '#e6f7ff' : '#d6ae92'
  const hair = ghost ? '#cfefff' : '#2a1c14'
  const shoe = ghost ? '#ffffff' : '#efefea'
  return (
    <g>
      {/* Legs mid-stride */}
      <path d="M-1 -27 L -4 -14 L -9 -1" fill="none" stroke={jeans} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 -27 L 6 -14 L 10 -1" fill="none" stroke={jeans} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* White sneakers with a red stripe */}
      <ellipse cx="-9" cy="-1.4" rx="5.4" ry="2.5" fill={shoe} />
      <ellipse cx="11" cy="-1.4" rx="5.4" ry="2.5" fill={shoe} />
      {!ghost && (
        <g stroke="#c0262b" strokeWidth="1" strokeLinecap="round">
          <path d="M-12 -1.6 L -7 -1.9" />
          <path d="M8 -1.6 L 13 -1.9" />
        </g>
      )}
      {/* The windbreaker, a little puffed by the wind */}
      <path d="M-7 -26 C -8.5 -33 -8 -41 -6 -46 C -2 -48.5 3 -48.5 7 -46 C 8.5 -41 8.8 -33 7.5 -26 C 3 -24.6 -3 -24.6 -7 -26 Z" fill={jacket} />
      <path d="M-7 -26 C -3 -24.6 3 -24.6 7.5 -26 L 7.2 -27.6 C 3 -26.3 -3 -26.3 -6.8 -27.6 Z" fill={jacketDark} opacity="0.9" />
      {/* The near arm, straight down, the hand gone into the pocket */}
      <path d="M2.5 -44 C 4.5 -39 5 -34 4 -29.5" fill="none" stroke={jacketDark} strokeWidth="4.6" strokeLinecap="round" />
      {/* Neck, head, messy hair */}
      <rect x="-1.4" y="-50.5" width="3.6" height="4" fill={skin} />
      <circle cx="1.2" cy="-55.5" r="6.4" fill={skin} />
      <path d="M-5.4 -55 C -6.2 -60 -3 -63.6 1.6 -63.4 C 5.6 -63.2 8.2 -60.6 7.8 -57.2 C 6.6 -58.8 5.6 -59.2 4.6 -59 C 3.4 -60.6 1.4 -60.2 0.4 -59.4 C -1.2 -60 -2.6 -59 -2.8 -57.2 C -3.8 -57.6 -4.8 -56.6 -5.4 -55 Z" fill={hair} />
    </g>
  )
}

export function ParalelArt() {
  // The line: from (14, 182) rising to (392, 122); the boy stands on it at x 232.
  const angle = (Math.atan2(122 - 182, 392 - 14) * 180) / Math.PI
  const bx = 232
  const by = 182 + ((bx - 14) * (122 - 182)) / (392 - 14)
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--paralel">
      <defs>
        <radialGradient id="par-void" cx="0.58" cy="0.5" r="0.75">
          <stop offset="0" stopColor="#101c3c" />
          <stop offset="0.55" stopColor="#0a1124" />
          <stop offset="1" stopColor="#05070d" />
        </radialGradient>
        <linearGradient id="par-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1838" stopOpacity="0" />
          <stop offset="1" stopColor="#0c1838" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="par-feet" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#bfefff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#bfefff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#bfefff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="par-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfefff" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#bfefff" stopOpacity="0.55" />
          <stop offset="0.62" stopColor="#bfefff" stopOpacity="0.9" />
          <stop offset="0.75" stopColor="#bfefff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#bfefff" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="par-key" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d8e6ff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#d8e6ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="par-vig" cx="0.56" cy="0.52" r="0.72">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.8" />
        </radialGradient>
        <filter id="par-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
      <rect width="400" height="250" fill="url(#par-void)" />
      <rect y="150" width="400" height="100" fill="url(#par-deep)" />
      {/* Dust motes hanging in the dark */}
      <g fill="#9fb4d8">
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={(i * 97) % 400} cy={(i * 59 + 17) % 250} r={i % 5 === 0 ? 1.1 : 0.6} opacity={0.18 + ((i * 7) % 5) * 0.06} />
        ))}
      </g>
      {/* A soft key light from above, following him */}
      <ellipse cx={bx} cy={by - 40} rx="70" ry="80" fill="url(#par-key)" />
      {/* The line: a glass filament, nearly invisible, glowing only near his feet */}
      <line x1="14" y1="182" x2="392" y2="122" stroke="url(#par-line)" strokeWidth="1.1" />
      <ellipse cx={bx} cy={by} rx="38" ry="5" fill="url(#par-feet)" transform={`rotate(${angle} ${bx} ${by})`} />
      {/* The other one, upside down under the line, sole to sole */}
      <g transform={`translate(${bx} ${by}) rotate(${angle}) scale(1.3 -1.3)`} opacity="0.34" filter="url(#par-soft)">
        <Boy ghost />
      </g>
      <g transform={`translate(${bx} ${by}) rotate(${angle}) scale(1.3 -1.3)`} opacity="0.5" fill="none" stroke="#ffffff" strokeWidth="0.5">
        <path d="M-7 -26 C -8.5 -33 -8 -41 -6 -46 C -2 -48.5 3 -48.5 7 -46 C 8.5 -41 8.8 -33 7.5 -26" />
        <circle cx="1.2" cy="-55.5" r="6.4" />
      </g>
      {/* The boy, hands in his pockets */}
      <g transform={`translate(${bx} ${by}) rotate(${angle}) scale(1.3)`}>
        <Boy />
      </g>
      <rect width="400" height="250" fill="url(#par-vig)" />
    </svg>
  )
}
