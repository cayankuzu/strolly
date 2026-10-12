# STROLLY — audit and art direction (2.0)

## 1. What STROLLY is (audit)

STROLLY is a single-page interactive cinema: nine short stories you scroll
through. Scroll is time; dragging turns the camera 360°; some moments stop and
ask the reader to choose; things hidden in the set can be found by looking.
There is no product to sell: the "product" is the stories, and the first
screen's job is to make you want to enter one.

| Area | What is there | Verdict |
| --- | --- | --- |
| Stack | Next.js 16 App Router, React 19, three.js 0.186, GSAP + Lenis, Web Audio; `next build` | keep |
| Runtime | `src/components/strolly/runtime.ts`: phases idle→loading→active⇄paused→leaving; progress `p` drives every frame | keep |
| Scroll timeline | `src/stories/timeline.ts`: segments in "screens", chapters, deterministic `p → state` | keep (already reversible and resize-safe) |
| Words | `src/stories/<id>/text.ts`: rail/caption/center/top items, choices, discoveries, captions, transcripts | rewritten from the author's own texts (v2) |
| Sets | `src/three/**`: one `SetScene` per story, procedural kit, sculpted figure rig | rebuilt per story; real CC0 assets added |
| Surfaces | `src/three/kit/surfaces.ts`: procedural PBR | upgraded: real scans (Poly Haven) with procedural fallback |
| Light | stage `RoomEnvironment` | upgraded: per-story HDRIs (`ctx.hdri`) |
| UI | title, story select, HUD, pause, settings, journal, archive, transcript | keep; story list and count adapted to nine stories; content warnings |
| Accessibility | reduced motion, captions, text size, keyboard menus, WebGL-less transcript path | keep |
| Debug | `?debug=1` (development only) → `window.__strolly` | extended: draw calls, triangles, GPU memory, asset log; still no on-screen panel |

Problems found and fixed in 2.0:

- The narration did not tell the stories and drifted from the images → every
  story is rewritten from the author's text with a screenplay
  (`docs/stories/<id>.md`) that ties each line to an exact image; frames are
  verified line by line.
- Some lines never became fully readable (fade-in and fade-out overlapped) →
  `NarrativeLayer` fits each item's fades and line arrivals into its span.
- Everything was procedural → real CC0 models, scanned surfaces and HDRIs
  (`ASSET_MANIFEST.md`), loaded once, each with a procedural fallback.

## 2. Art direction

**One design system, nine films.** The interface stays editorial and quiet
(Geist / Geist Mono, wide tracking, a dark ground, one accent per story); the
3D image carries each story's identity. Text never sits on the subject: the
narrative column (rail) is on one side, the subject on the other.

| Story | Visual anchor (the object that stays identifiable) | Light | HDRI | Accent |
| --- | --- | --- | --- | --- |
| YAŞAMAK | the cafe desk and its timer screen; the cash register, the tea glass, the wall clock | tungsten interior, window daylight that turns with the seasons | brown_photostudio_02 | #ffb766 |
| ÖTE | the blue-ink pen and the last page → the window and the Earth → the ring of the black hole | cold office, white elevator, cabin blue, starlight | hospital_room_2 | #b9a4ff |
| TEK AYAK | the paper plane; the wheelchair (revealed last) | low afternoon sun through tall windows, chalk dust | brown_photostudio_02 | #e8d36a |
| ÖFKESEL DENEYİM SİMÜLASYONU | the white room | clinical white, the boss's office as warm memory | hospital_room_2 | #d44a35 |
| TAKINTI | the sewing machine and its shadow on the wall | one hard street-lamp beam; cold dawn; flat morning | abandoned_tiled_room, moonless_golf | #c0402f |
| PARALEL-LEŞ | the boy's silhouette against the drop | golden hour, storm, dusk | belfast_sunset_puresky, kloofendal_48d_partly_cloudy_puresky | #ff9b54 |
| TEKERRÜR | the room whose walls are a forest (a real 360° photograph) | late afternoon → night on the wall screens; warm desk lamp | xanderklinge | #b9d3c4 |
| BEYİN-KÖKÜ | the ring scar; the red line on the floor | soft suburban daylight vs. the lab's blue-green dark | hospital_room_2, kloofendal | #ff5a7a |
| DURUM | the machine: the wall display and the hall of racks | amber desk light, cold server glow | brown_photostudio_02 | #e2b062 |

**Camera language.** Every shot has one dominant subject. Movement is a
dolly, a controlled orbit or a target interpolation, with pauses; cuts are
hard (duplicate keys) and land on a new line. No random spins, no passing
through geometry. The first shot of each story is its hero image. The
reader's 360° look is always allowed but each set is complete in every
direction.

**Light and material.** Key/fill/rim with intent; image-based light from the
chapter's HDRI; contact shadows; no bloom or arbitrary glow (only real light
sources glow: screens, lamps, the accretion disk). Metal reads as metal,
fabric matte, glass transparent, wood varied; imported models keep their
photographic materials.

**Typography.** Unchanged brand fonts (Geist, Geist Mono). Hierarchy: title
(wide-tracked caps) → chapter label → rail narration → caption speaker → small
mono labels. Lines ≤ ~110 characters; dialogue with an em dash.

## 3. Budgets

| Budget | Target |
| --- | --- |
| Frame rate | 60 fps on an ordinary laptop (quality tiers lower resolution, shadows and effects automatically) |
| Draw calls | < 300 per frame (instancing for repeated objects; hide sets not in use) |
| Triangles | < 1.5 M per frame |
| Assets per story | ≈ 3–8 MB (models + scans + one or two HDRIs), loaded when the story starts, cached for the visit |
| All shipped assets | 49 MB (see `public/assets/sizes.json`) |
| Lowest tier | procedural surfaces only (no scans), smaller maps |

## 4. Responsive and accessible

Desktop gets the full film; tablets and phones the same story with the rail
as a bottom band, lighter effects and touch look. `prefers-reduced-motion`
(and the in-game setting) hold every keyed shot still and remove smooth
scrolling; captions cover every sound; without WebGL each story is told by
its transcript and the in-world texts are mirrored in the page.

## 5. QA protocol

For every story and every choice branch: one frame per text line
(`dump-text` → `lines` → contact sheets), judged for sync, framing, light and
glitches; free shots for walks, cuts and 360° looks; console clean;
`check-story` (overlaps, gates, readability, reading pace); `tsc`, `eslint`
and `next build` clean.
