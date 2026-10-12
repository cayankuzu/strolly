'use client'
/** Arif's desk at night from behind his left shoulder: the lamp pool, a coin balanced on his curled thumb catching the light, his phone face down at the edge of the light; beyond the glass the server hall glows blue and the wall display holds a soft, out-of-focus probability cloud. */
export function DurumArt() {
  // The cloud on the display: a few hundred faint points around a bright core (deterministic).
  const cloud = Array.from({ length: 150 }, (_, i) => {
    const a = i * 2.39996
    const r = 3 + Math.sqrt(i / 150) * 34 * (0.75 + 0.25 * Math.sin(i * 1.7))
    // Rounded: the server and the browser must print identical attributes (trig differs in the last digits).
    return { x: +(300 + Math.cos(a) * r * 1.25).toFixed(2), y: +(80 + Math.sin(a) * r * 0.62).toFixed(2), o: +(0.2 + 0.5 * (1 - i / 150)).toFixed(3) }
  })
  // Rack LEDs beyond the glass.
  const leds = Array.from({ length: 60 }, (_, i) => ({ x: 22 + (i % 12) * 17 + ((i * 7) % 5), y: 34 + Math.floor(i / 12) * 12 + ((i * 3) % 4), o: 0.35 + ((i * 13) % 7) * 0.09 }))
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="art art--durum">
      <defs>
        <linearGradient id="du-hall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1823" />
          <stop offset="0.55" stopColor="#1c3048" />
          <stop offset="1" stopColor="#0c131b" />
        </linearGradient>
        <radialGradient id="du-hallglow" cx="0.3" cy="0.15" r="0.6">
          <stop offset="0" stopColor="#7fa6d8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7fa6d8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="du-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a443b" />
          <stop offset="1" stopColor="#15130f" />
        </linearGradient>
        <radialGradient id="du-pool" cx="0.36" cy="0.25" r="0.62">
          <stop offset="0" stopColor="#ffd9a8" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#d9a874" stopOpacity="0.35" />
          <stop offset="1" stopColor="#d9a874" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="du-wd" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#1a2632" />
          <stop offset="1" stopColor="#0a0d11" />
        </radialGradient>
        <radialGradient id="du-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3dfae" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#e2b062" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e2b062" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="du-wdspill" cx="0.75" cy="0.32" r="0.5">
          <stop offset="0" stopColor="#c8dcff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#c8dcff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="du-coin" cx="0.38" cy="0.32" r="0.7">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.45" stopColor="#d8b46e" />
          <stop offset="1" stopColor="#7a6034" />
        </radialGradient>
        <linearGradient id="du-sweater" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a313a" />
          <stop offset="1" stopColor="#0f1216" />
        </linearGradient>
        <linearGradient id="du-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2b58e" />
          <stop offset="1" stopColor="#8a5e40" />
        </linearGradient>
        <filter id="du-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id="du-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Beyond the glass: the server hall in cold blue */}
      <rect width="400" height="250" fill="url(#du-hall)" />
      <rect width="400" height="170" fill="url(#du-hallglow)" />
      <g filter="url(#du-soft)">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={16 + i * 17} y={26} width={13} height={74} fill="#0b1015" opacity={0.85 - (i % 3) * 0.08} />
        ))}
        <g fill="#9cc8ff">
          {leds.map((l, i) => (
            <rect key={i} x={l.x} y={l.y} width="1.6" height="1.2" opacity={l.o} />
          ))}
        </g>
        <rect x="10" y="10" width="220" height="3" fill="#7fa6d8" opacity="0.5" />
      </g>
      {/* The glass partition: mullions, a faint reflection */}
      <g fill="#0b0d10">
        <rect x="0" y="0" width="400" height="8" />
        <rect x="92" y="0" width="4" height="150" />
        <rect x="196" y="0" width="4" height="150" />
        <rect x="0" y="118" width="400" height="5" opacity="0.6" />
      </g>
      <polygon points="120,0 150,0 70,150 40,150" fill="#ffffff" opacity="0.025" />

      {/* The wall display, out of focus: a soft probability cloud */}
      <polygon points="236,30 372,22 376,142 238,136" fill="#050608" />
      <polygon points="241,35 367,28 371,136 243,131" fill="url(#du-wd)" />
      <g filter="url(#du-blur)">
        <g fill="#d9dde0">
          {cloud.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r="1.1" opacity={c.o} />
          ))}
        </g>
        <ellipse cx="300" cy="80" rx="24" ry="15" fill="url(#du-core)" />
      </g>
      <rect x="296" y="142" width="10" height="30" fill="#0a0c0e" />
      <rect width="400" height="250" fill="url(#du-wdspill)" />

      {/* The desk and the lamp pool */}
      <polygon points="0,158 400,150 400,250 0,250" fill="url(#du-desk)" />
      <ellipse cx="170" cy="196" rx="190" ry="54" fill="url(#du-pool)" />
      <polygon points="0,158 400,150 400,152 0,160" fill="#c8b89c" opacity="0.35" />
      {/* The desk lamp, its shade glowing */}
      <path d="M78 182 L86 120 L120 96" stroke="#2a2c30" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="184" rx="16" ry="4" fill="#1c1d20" />
      <path d="M108 86 L140 100 L132 118 L102 104 Z" fill="#33363b" />
      <ellipse cx="117" cy="111" rx="17" ry="5" transform="rotate(25 117 111)" fill="#ffe7c2" opacity="0.9" />
      {/* Monitors, edge-on, their light on the desk */}
      <rect x="148" y="104" width="66" height="44" fill="#08090b" />
      <rect x="151" y="107" width="60" height="38" fill="#141c26" />
      <rect x="153" y="109" width="56" height="34" fill="#c8dcff" opacity="0.08" />
      <rect x="176" y="148" width="10" height="12" fill="#121316" />

      {/* The phone, face down at the edge of the light */}
      <g transform="rotate(-8 330 196)">
        <rect x="306" y="186" width="50" height="22" rx="4" fill="#0d0e10" />
        <rect x="306" y="186" width="50" height="2.4" rx="1.2" fill="#ffd9a8" opacity="0.35" />
        <circle cx="347" cy="197" r="2.6" fill="#1c1e22" />
      </g>

      {/* Arif, from behind his left shoulder: head, shoulder, the right hand with the coin */}
      <path d="M0 250 L0 150 C20 132 54 126 82 138 C104 148 118 176 122 210 L126 250 Z" fill="url(#du-sweater)" />
      <path d="M8 152 C18 140 42 134 62 138" stroke="#4f5a66" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M22 140 C10 122 12 92 32 80 C50 70 74 78 80 100 C84 116 78 132 66 140 Z" fill="#14161a" />
      <path d="M70 92 C76 98 78 110 76 122" stroke="#8a8f96" strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d="M78 104 C82 108 82 116 80 120" stroke="#e2b58e" strokeWidth="2" fill="none" opacity="0.45" />
      {/* The forearm reaching into the light, the curled fist, the thumb up */}
      <path d="M118 214 C150 204 186 194 214 188" stroke="#2c333c" strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M206 190 C208 180 220 174 232 176 C244 178 248 190 244 200 C238 208 222 210 212 204 Z" fill="url(#du-skin)" />
      <path d="M214 184 C222 182 230 184 236 188 M213 192 C222 190 231 192 238 196" stroke="#6a4630" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M232 178 C236 170 238 162 242 158 C245 156 248 158 247 162 C245 168 242 174 240 180 Z" fill="url(#du-skin)" />
      {/* The coin on the thumbnail, catching the lamp */}
      <ellipse cx="245" cy="155.5" rx="8" ry="2.6" fill="url(#du-coin)" />
      <ellipse cx="245" cy="155" rx="5" ry="1.4" fill="#fff7e0" opacity="0.55" />
      <circle cx="241" cy="154.6" r="1.4" fill="#ffffff" opacity="0.9" />
      <circle cx="241" cy="154.6" r="6" fill="#ffe9bf" opacity="0.18" />
    </svg>
  )
}
