# Credits

STROLLY ships **no third-party visual or audio assets**. Every model, texture,
shader, screen, photograph and sound is generated in code at runtime, so every
asset below is original to this repository: © 2026 Çayan Kuzu, powered by
MeMoDe, all rights reserved (see `LICENSE`).

## Visual assets

| Asset | Source | Author | License |
| --- | --- | --- | --- |
| Figure rig and poses (all characters) | `src/three/figure/` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Skinned body surface, sculpted heads, eyes, hands, shoes | `src/three/figure/skin.ts`, `figureBody.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Set kit: rooms, doors, furniture, office equipment, server racks, facades, street lamps, cars, crowd, canvas screens | `src/three/kit/props.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Procedural PBR surfaces (wood, laminate, knit, denim, concrete, paint, tile, carpet, skin, hair…) | `src/three/kit/surfaces.ts` (seeded fBm) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| TEKERRÜR observatory: office, server hall, corridor, kitchen, night city, coat, tea glass | `src/three/tekerrur/TekerrurScene.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| DURUM interface: queries, predictions, particle, causal chain, archive, observer | `src/three/tekerrur/screens.ts` (Canvas 2D) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| EMANET apartment, props, calendar, city view | `src/three/emanet/Apartment.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Memory dissolve and selective blur | `src/three/emanet/memory.ts`, `MemoryPass.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Photograph, clock face, record, Ege's phone | `src/three/emanet/canvas.ts` (Canvas 2D) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| ÖFKE NÖBETİ street, lobby, booths, meters, source file, phone, public screen, copy | `src/three/ofke/OfkeScene.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| YAŞAMAK internet cafe, seasons, accretion disk (GLSL) | `src/three/yasamak/YasamakScene.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| KALAN apartment, recorder, the other apartment | `src/three/kalan/KalanScene.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| EŞİK street, shop window, cafe, other cities, back room | `src/three/esik/EsikScene.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Concrete, wood, fabric textures | `src/three/textures.ts` (seeded value noise) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Screen and sign graphics | `src/three/screens.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Story art, menu backdrop, cursor | `src/components/strolly/StoryArt.tsx`, `MenuBackdrop.tsx`, `Cursor.tsx` (SVG/CSS) | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| Social images, favicon | `src/app/og/[id]/route.tsx`, `src/app/icon.svg` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |

## Audio

| Sound | Source | Author | License |
| --- | --- | --- | --- |
| TEKERRÜR: air handling, mains hum, server hall, fridge, coffee machine, city, corridor tube, stopped clock, keyboard, glass, phone, door, sparse music | `src/stories/tekerrur/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| EMANET: room tone, fridge, kettle, city, slippers, cups, keys, ringback, phone, piano | `src/stories/emanet/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| ÖFKE NÖBETİ: street, lobby music and chime, booth hum, meter, muffled impacts, knocks, phone, notch, ringing | `src/stories/ofke/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| YAŞAMAK: cafe, keyboards, wall clock, street, door bell, horizon, piano | `src/stories/yasamak/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| KALAN: room tone, fridge, tape, knocks, birds, the other room, piano | `src/stories/kalan/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
| EŞİK: night city, cars, shop hum, cafe, other cities, terminal, phones, keys | `src/stories/esik/audio.ts` | Çayan Kuzu · MeMoDe | All rights reserved (LICENSE) |
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
