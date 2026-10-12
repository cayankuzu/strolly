# Credits

Models, scanned surfaces, HDR environments and the forest panorama are CC0
assets from Poly Haven; every one of them, with its creator, source and
licence, is listed in [`ASSET_MANIFEST.md`](ASSET_MANIFEST.md). Everything
else — the figures, the sets' procedural props and stand-ins, every screen,
sign and photograph, the card art and all sound — is made in code and original
to this repository: © 2026 Çayan Kuzu, powered by MeMoDe, all rights reserved
(see `LICENSE`).

## Visual work in code

| Asset | Source | Author | License |
| --- | --- | --- | --- |
| Figure rig and poses (all characters) | `src/three/figure/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Skinned body surface, sculpted heads, eyes, hands, shoes | `src/three/figure/skin.ts`, `figureBody.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Set kit: rooms, doors, furniture, office equipment, server racks, facades, street lamps, cars, crowd, canvas screens | `src/three/kit/props.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Procedural PBR surfaces (fallbacks for every scanned kind; skin, hair, paper, ceramic, plastic, rubber) | `src/three/kit/surfaces.ts` (seeded fBm) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Asset pipeline (GLB + Meshopt, WebP, HDR loading with procedural fallback) | `src/three/kit/assets.ts`, `scripts/optimize-assets.py` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| YAŞAMAK: internet cafe, seasons, timers, scarf | `src/three/yasamak/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| ÖTE: signing room, elevator, shuttle, habitat, Earth, black hole (GLSL), mission room | `src/three/ote/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| TEK AYAK: classroom, paper plane, chalkboards, wheelchair | `src/three/tekayak/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| ÖFKESEL DENEYİM SİMÜLASYONU: office, car, service centre, white room, convict line | `src/three/ofke/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| TAKINTI: the house, sewing room, wall shadow | `src/three/takinti/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| PARALEL-LEŞ: roofs, atrium, bridge, cliff, sea, slope, socket, the shelf room, the swing | `src/three/paralel/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| TEKERRÜR: the forest room (screen walls over the panorama), robots, archive, the square across eras, the network | `src/three/tekerrur/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| BEYİN-KÖKÜ: the lab, suburb, Centre, second floor, stretcher room, screens | `src/three/beyinkoku/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| DURUM: observatory, server hall and mirror, papers, boxes, the machine's screens | `src/three/durum/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Screen and sign graphics, procedural textures | `src/three/screens.ts`, `src/three/textures.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Story cards, title reel, menu backdrop, cursor | `src/components/strolly/StoryArt.tsx`, `art/`, `MenuBackdrop.tsx`, `Cursor.tsx` (SVG/CSS) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Social images, favicon | `src/app/og/[id]/route.tsx`, `src/app/icon.svg` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |

## Audio (all synthesized)

| Sound | Source | Author | License |
| --- | --- | --- | --- |
| Each story's ambience, one-shots and music | `src/stories/<id>/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Menu ambience, interface sounds | `src/lib/audio/selector.ts`, `src/lib/audio/core.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Noise, bursts, tones, reverb impulse | `src/lib/audio/synth.ts` (generated) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |

## Fonts

| Font | Source | Author | License |
| --- | --- | --- | --- |
| Geist, Geist Mono | Google Fonts via `next/font` (self-hosted at build) | Vercel | SIL Open Font License 1.1 |

## Libraries

| Library | License |
| --- | --- |
| Next.js, React | MIT |
| three.js | MIT |
| GSAP (incl. ScrollTrigger) | GSAP Standard "No Charge" License |
| Lenis | MIT |
| @gltf-transform/cli (asset pipeline only, not shipped) | MIT |
