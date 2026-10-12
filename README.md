# STROLLY

Scroll-driven, cinematic short stories you can turn around inside. **Scroll is
time**: every image, line and sound is a function of how far you have read.
**Looking is yours**: drag to turn the camera a full 360°; some things are only
there behind you. Nine stories, written from the author's own texts, in Turkish
and English.

| # | Story | Question |
| --- | --- | --- |
| 01 | **YAŞAMAK** | Süreni uzatamayacağını bilsen, oyunu yine de açar mıydın? |
| 02 | **ÖTE** | Geri dönüşü olmayan bir yolculuğa kim imza atar? |
| 03 | **TEK AYAK** | Bunu kim attı? |
| 04 | **ÖFKESEL DENEYİM SİMÜLASYONU** | Devlet sana öfkeni boşaltacak bir oda verse, girer miydin? |
| 05 | **TAKINTI** | Gece yarısı annen neyi dikiyor? |
| 06 | **PARALEL-LEŞ** | Başka evrenlerde kaç kez öldün? |
| 07 | **TEKERRÜR** | Tarih tekerrür ediyorsa gelecek bilinebilir mi? |
| 08 | **BEYİN-KÖKÜ** | Kararı gerçekten sen mi veriyorsun? |
| 09 | **DURUM** | Her şeyi bilen bir makineye ne sorarsın? |

Each story has a screenplay in [`docs/stories/`](docs/stories) that ties every
line to the image on screen at that moment; DURUM's master prompt is
[`docs/MASTER_PROMPT_DURUM.md`](docs/MASTER_PROMPT_DURUM.md). The audit and art
direction of the 2.0 rebuild are in [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md).
(`docs/STORY_BIBLE.md` describes the 1.x stories and is kept for history; tag
`v1.2.0` is the last 1.x build.)

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

- `/` — the title screen. `/?menu=hikayeler` — story select.
- `/?story=<id>` (`yasamak`, `ote`, `tekayak`, `ofke`, `takinti`, `paralel`,
  `tekerrur`, `beyinkoku`, `durum`) — deep links straight into a story. An
  unknown id opens the title screen. Browser back/forward moves between screens.
- `?debug=1` (development only) — no on-screen panel; a test API on
  `window.__strolly` (`open('durum')`, `jumpTo('boxes', 0.5)`, `jump(0.72)`,
  `pause(p)`, `close()`, `info()` with draw calls, triangles, GPU memory and the
  asset log, plus `look` and `runtime`), and `globalThis.__strollyClips()`, which
  lists any mesh or person the story camera is inside of right now. Production
  builds never install them. `?reduced=1` and `?fallback=1` preview the
  reduced-motion and no-WebGL paths.

### Assets

Models, scanned surfaces, HDR environments and the forest panorama are CC0
(Poly Haven), listed with their creators in [`ASSET_MANIFEST.md`](ASSET_MANIFEST.md)
and shipped optimized in `public/assets` (49 MB: GLB + Meshopt, WebP, 1k HDR).
`python scripts/optimize-assets.py <raw dir>` rebuilds them from the downloads.
Every asset has a procedural stand-in, so a missing file never leaves a story
blank; the lowest quality tier uses the procedural surfaces only.

## Playing

| | Mouse / keyboard | Touch |
| --- | --- | --- |
| Read on (time) | wheel, ↓ / PageDown / Space | swipe up |
| Look around | press and drag, ← → , Shift + ↑ ↓ | drag sideways |
| Look back to the shot | `C`, or **BAKIŞI SIFIRLA / RESET VIEW** (appears once you turn away) | the same button |
| Examine what is centered | click, `E` / Enter | tap |
| Pause | `Esc` | MENÜ / MENU |

- **Language**: TR · EN on the title screen, or Settings → Dil / Language. The
  interface and the story (lines, choices, discoveries, captions, chapter
  titles) switch at once; the Turkish text drawn inside the 3D sets gets
  English subtitles. First visit: Turkish for Turkish browsers, English for
  everyone else.
- **Title**: Devam Et (last checkpoint), Hikâyeler, Yeni Oyun (asks first),
  Ayarlar, Arşiv (per-story progress, discoveries, credits), Çıkış. Stories
  with hard material (violence, body horror) say so before they start.
- **Pause**: resume, restart chapter, chapter select (chapters you have not
  reached are locked), Günlük (the choices you made), Keşifler, settings, main
  menu. The tab going to the background pauses too.
- **Choices**: at some moments the reading holds and asks — a question typed
  into a machine, a decision, where you look. The answer is printed line by
  line; scrolling on (or Enter) continues. Answers become flags that later
  text, the set and the sound read: the coin and the two boxes in DURUM, the
  red or blue line in BEYİN-KÖKÜ, whom you glance at in TEK AYAK, the last
  look at Earth in ÖTE. A few answers are remembered across readings.
- **Settings**: language, display (quality, resolution scale, fullscreen,
  motion effects), sound (master, music, ambience, effects, interface,
  spatial), controls (360° look, sensitivity, invert Y, auto-center),
  accessibility (reduced motion, reduced camera, sound captions, text size,
  high contrast, immersion mode).
- **Progress** is saved per story at each chapter: checkpoint, furthest
  chapter, completion and the discoveries seen. Settings and saves live only
  in this browser (`localStorage`: `strolly:settings`, `strolly:save`); there
  is no account, server or tracking.
- **Discoveries** are details placed off the main shot. They count as seen
  when they stay in view for a moment; some can be examined. If one is about
  to be missed, the HUD whispers *etrafına bak* / *arkana bak*. The completion
  screen shows how many you found — nothing more is scored.

## How it works

```
GameShell (screens, menus, save, settings, language)
  └─ StoryRuntime  idle → loading → active ⇄ paused → leaving
       Lenis → ScrollTrigger → progress p ─┬─ NarrativeLayer (text by segment and slot)
                                           ├─ GameHUD (chapter, prompts, hints, captions)
       InputManager → LookController ──────┼─ Stage → StoryScene (one renderer, one RAF)
                                           ├─ DiscoveryTracker (what was seen)
                                           └─ AudioCore → story profile (Web Audio, HRTF)
```

- **One runtime, many stories.** `StoryRuntime` owns the canvas, renderer,
  scroll, look and sound for the whole visit. Every transition takes a token,
  scene mounts are serialized, and leaving a story disposes its geometry,
  textures, render targets, shadow maps, timelines and audio sources.
- **A story is data plus two loaders.** `src/stories/<id>/` holds the
  screenplay (`timeline.ts`, segments measured in screens), every word on
  screen, the choices, the sound captions and the discoveries (`text.ts`), its
  English edition (`en.ts`, strings only, merged by `localize.ts`) and its
  sound (`audio.ts`). `registry.ts` lists the stories and validates them in
  development; `loaders.ts` imports each 3D scene and soundscape only when it
  is opened.
- **Deterministic time, free look.** The story camera is a pure function of
  progress, so fast, reverse and jumping scrolls always land on a valid frame.
  The reader's look is an offset on top of it (yaw/pitch, damped, with a
  little inertia). A story may guide the view once (`LookRequest`), and that
  direction stays "home" until the next cut. Shots can limit or lock the look.
- **Readable by construction.** The narrative layer fits each line's fades and
  the arrival of its later lines into the scroll it has, so every line reaches
  full opacity and holds before it leaves.
- **Perception as a mechanic.** Every set knows what was in view on the
  previous frame (`SetFrame.inView`), so things can change only while nobody
  is looking: the people who leave the cafe in YAŞAMAK, the mother who sits
  down unwatched, the ghosts that fall in PARALEL-LEŞ.
- **Shared set kit.** Every story is built on `three/kit`: `SetScene` (one
  scene, one director, real assets through `ctx.model` / `ctx.hdri` /
  `ctx.panorama`), keyed shots, an `Actor` over the shared figure rig (walk,
  hold, blend, reach, look), procedural props, canvas screens, an instanced
  crowd.
- **Surfaces and people.** `kit/surfaces.ts` serves scanned PBR sets (albedo
  turned into a near-white detail map so each story's colour still decides the
  hue) with seeded-noise fallbacks, applied at real-world scale. Characters are
  one skinned body surface built from a signed distance field
  (`figure/skin.ts`) with a sculpted head, eyes with lids and lash lines, ears,
  brows, hands with fingers and shoes; they breathe, blink and look around.
  Ambient occlusion (GTAO) runs on the high quality tier.
- **Spatial sound.** Each profile places its sources in the set (HRTF panners
  that follow the camera and the look); buses for music, ambience, effects and
  interface follow the settings. All sound is synthesized.

## Structure

```
src/
  app/                 page (deep links, metadata), layout, OG images (/og/[id])
  components/strolly/  GameShell, runtime, TitleScreen, StorySelect, PauseMenu,
                       SettingsMenu, Screens (archive, complete, confirm, error),
                       ChoicePanel, Journal, GameHUD, NarrativeLayer,
                       StoryTranscript, Cursor, MenuBackdrop, StoryArt + art/,
                       ErrorBoundary, debug (dev-only test API types)
  stories/             registry, loaders, localize, shared timeline + types, and
                       one folder per story (timeline, text, en, audio)
  lib/                 i18n, scroll, look, input, discovery, save, settings,
                       tracks, math, env, labels, audio (core, synth, ambience)
  three/
    Stage.ts           the one renderer, shared render targets, final pass
    look.ts, lens.ts   applying the look; fitting the lens to the aspect
    figure/            figure rig, skinned body (skin.ts), sculpted head and
                       hands (figureBody.ts), poses, walking paths, two-bone reach
    kit/               SetScene, assets (CC0 models, HDRIs, panorama), direction
                       helpers, props, surfaces (scans + procedural)
    yasamak/ ote/ tekayak/ ofke/ takinti/ paralel/ tekerrur/ beyinkoku/ durum/
                       one set director each, split into sets, cast, shots, screens
public/assets/         optimized CC0 assets (see ASSET_MANIFEST.md)
scripts/               optimize-assets.py
docs/                  stories/<id>.md screenplays, ART_DIRECTION, MASTER_PROMPT_DURUM
```

## Copyright

© 2026 Çayan Kuzu · Tüm hakları saklıdır. Powered by [MeMoDe](https://fikkis.vercel.app).
The source is public for viewing; see [`LICENSE`](LICENSE). Libraries, fonts and
the CC0 assets keep their own licenses (see [`CREDITS.md`](CREDITS.md) and
[`ASSET_MANIFEST.md`](ASSET_MANIFEST.md)).

## Accessibility

- Every story is also in the page as semantic HTML (skip link: "Hikâyeleri metin olarak oku").
- Menus work with the keyboard (arrows, Enter, Esc) and return focus where you left it.
- Text size (S–XL), high contrast, sound captions, immersion mode (hides the HUD).
- Reduced motion: no smooth-scroll inertia, held camera shots, no blur transitions;
  reduced camera: slower look, no inertia, no drifting.
- Without WebGL a story continues as text over chapter backdrops.
- Sound starts only after a gesture and can be switched off at any time; the choice is remembered.
