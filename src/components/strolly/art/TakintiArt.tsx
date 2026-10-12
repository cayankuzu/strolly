'use client'
/** A dark hallway, a half-open door, a slant of cold street light inside and, on the wall, a woman's long thin shadow bent over a sewing machine. */
export function TakintiArt() {
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--takinti">
      <defs>
        <linearGradient id="tak-wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b111c" />
          <stop offset="1" stopColor="#121b2a" />
        </linearGradient>
        <linearGradient id="tak-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9eee2" />
          <stop offset="1" stopColor="#9fb9ad" />
        </linearGradient>
        <linearGradient id="tak-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe3d6" stopOpacity="0.32" />
          <stop offset="1" stopColor="#cfe3d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="tak-vig" cx="0.6" cy="0.55" r="0.7">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <clipPath id="tak-gap">
          <polygon points="206,66 284,76 284,206 206,214" />
        </clipPath>
      </defs>
      <rect width="400" height="250" fill="#06090f" />
      {/* The hallway: the left wall in perspective, the wall with the door, the floor */}
      <polygon points="0,0 150,34 150,214 0,250" fill="#0c121d" />
      <rect x="150" y="34" width="250" height="180" fill="url(#tak-wall)" />
      <g fill="#ffffff" opacity="0.025">
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={158 + i * 22} y="34" width="2" height="180" />
        ))}
      </g>
      <polygon points="0,250 150,214 400,214 400,250" fill="#080b12" />
      {/* Inside the room: dark, and the lit patch on its far wall */}
      <polygon points="206,66 322,66 322,214 206,214" fill="#04070b" />
      <g clipPath="url(#tak-gap)">
        <polygon points="212,104 262,88 284,206 214,214" fill="url(#tak-light)" />
        <polygon points="214,206 284,200 300,214 206,214" fill="#cfe3d6" opacity="0.5" />
        {/* The shadow: a long, thin, hunched woman at a machine, hair hanging */}
        <g fill="#0a0f17">
          {/* Back bowed over the machine, a long thin neck, the head hanging forward */}
          <path d="M214 214 C 216 182 220 150 230 126 C 236 112 246 104 256 106 C 262 108 266 114 268 120 L 262 128 C 256 122 250 122 246 130 C 240 146 236 176 238 214 Z" />
          <ellipse cx="265" cy="128" rx="6.5" ry="8.5" transform="rotate(-28 265 128)" />
          {/* The hair hangs straight down past the face, ragged */}
          <path d="M258 118 L 272 122 L 273 150 L 270 146 L 268 156 L 265 149 L 262 158 L 260 148 L 257 154 L 256 132 Z" />
          {/* The near arm: the elbow pulled back and up, the bony hand at the needle */}
          <path d="M248 128 L 236 156 L 268 170" fill="none" stroke="#0a0f17" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M267 170 L 274 166 M 267 171 L 275 170" stroke="#0a0f17" strokeWidth="1.6" strokeLinecap="round" />
          {/* The machine: bed, pillar, arm, needle bar; the table under it */}
          <rect x="258" y="171" width="30" height="5" rx="1" />
          <rect x="280" y="150" width="7" height="22" rx="2" />
          <path d="M262 150 Q 262 146 268 146 L 287 146 L 287 153 L 266 153 Z" />
          <rect x="263" y="153" width="2.5" height="15" />
          <rect x="246" y="176" width="44" height="4" />
          <rect x="250" y="180" width="3" height="34" />
        </g>
        {/* The window's cross falling across the patch */}
        <polygon points="236,96 240,95 262,206 258,207" fill="#04070b" opacity="0.7" />
      </g>
      {/* The door leaf, half open into the room */}
      <polygon points="322,66 284,76 284,206 322,214" fill="#151d2b" />
      <polygon points="284,76 288,75 288,207 284,206" fill="#cfe3d6" opacity="0.35" />
      <circle cx="292" cy="146" r="2.2" fill="#6f7b78" />
      {/* Frame and casing */}
      <rect x="198" y="58" width="8" height="156" fill="#1a2232" />
      <rect x="322" y="58" width="8" height="156" fill="#1a2232" />
      <rect x="198" y="58" width="132" height="8" fill="#1a2232" />
      {/* The spill out across the hallway floor */}
      <polygon points="206,214 284,214 250,250 120,250" fill="url(#tak-spill)" />
      <rect width="400" height="250" fill="url(#tak-vig)" />
    </svg>
  )
}
