# STROLLY

Scroll-driven, cinematic short stories you can turn around inside. **Scroll is
time**: every image, line and sound is a function of how far you have read.
**Looking is yours**: drag to turn the camera a full 360°; some things are only
there behind you.

| # | Story | Question |
| --- | --- | --- |
| 01 | **TEKERRÜR** | Gelecek gerçekten bilinebilir mi? |
| 02 | **EMANET** | Bir insanın hafızası, kendisinden daha uzun yaşayabilir mi? |
| 03 | **ÖFKE NÖBETİ** | Acı çeken gerçek değilse, acı gerçek midir? |
| 04 | **YAŞAMAK** | Bir saatin olsaydı, onu nasıl geçirirdin? |
| 05 | **KALAN** | Yaşanmamış bir hayat, hiç yaşanmamış mıdır? |
| 06 | **EŞİK** | Bir şey, gözlendiği için mi gerçektir? |

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

- `/` — the title screen. `/?menu=hikayeler` — story select.
- `/?story=<id>` (`tekerrur`, `emanet`, `ofke`, `yasamak`, `kalan`, `esik`) —
  deep links straight into a story. An unknown id opens the title screen.
  Browser back/forward moves between screens.
- `?debug=1` (development only) — no on-screen panel; a test API on
  `window.__strolly` (`open('emanet')`, `jumpTo('photo', 0.5)`, `jump(0.72)`,
  `pause(p)`, `close()`, `info()`, plus `look` and `runtime`). Production builds
  never install it. `?reduced=1` and `?fallback=1` preview the reduced-motion and
  no-WebGL paths.

The stories themselves — premise, characters, chapters, choices and what must
not change — are in [`docs/STORY_BIBLE.md`](docs/STORY_BIBLE.md).

## Playing

| | Mouse / keyboard | Touch |
| --- | --- | --- |
| Read on (time) | wheel, ↓ / PageDown / Space | swipe up |
| Look around | press and drag, ← → , Shift + ↑ ↓ | drag sideways |
| Look back to the shot | `C`, or **BAKIŞI SIFIRLA** (appears once you turn away) | **BAKIŞI SIFIRLA** |
| Examine what is centered | click, `E` / Enter | tap |
| Pause | `Esc` | MENÜ |

- **Title**: Devam Et (last checkpoint), Hikâyeler, Yeni Oyun (asks first),
  Ayarlar, Arşiv (per-story progress, discoveries, credits), Çıkış.
- **Pause**: resume, restart chapter, chapter select (chapters you have not
  reached are locked), Günlük (the choices you made), Keşifler, settings, main
  menu. The tab going to the background pauses too.
- **Choices**: at some moments the reading holds and asks — a query typed into
  a system, or a decision. The answer is printed line by line; scrolling on (or
  Enter) continues. Answers become flags that later text, the set and the sound
  read (where the cup went in TEKERRÜR, the stars you gave in ÖFKE NÖBETİ, what
  you do at 14:17 in EMANET). A few answers are remembered across readings.
- **Settings**: display (quality, resolution scale, fullscreen, motion
  effects), sound (master, music, ambience, effects, interface, spatial),
  controls (360° look, sensitivity, invert Y, auto-center), accessibility
  (reduced motion, reduced camera, sound captions, text size, high contrast,
  immersion mode).
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
GameShell (screens, menus, save, settings)
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
  screen, the sound captions and the discoveries (`text.ts`), and its sound
  (`audio.ts`). `registry.ts` lists the stories and validates them in
  development; `loaders.ts` imports each 3D scene and soundscape only when it
  is opened.
- **Deterministic time, free look.** The story camera is a pure function of
  progress, so fast, reverse and jumping scrolls always land on a valid frame.
  The reader's look is an offset on top of it (yaw/pitch, damped, with a
  little inertia). A story may guide the view once (`LookRequest`), and that
  direction stays "home" until the next cut. Shots can limit or lock the look.
- **Perception as a mechanic.** Every set knows what was in view on the
  previous frame (`SetFrame.inView`), so things can change only while nobody
  is looking: a building in EŞİK, the kitchen in KALAN, a child in YAŞAMAK, a
  clock in TEKERRÜR that lies once when you look back at it.
- **Shared set kit.** Five stories are built on `three/kit`: `SetScene` (one
  scene, one director), keyed shots, an `Actor` over the shared figure rig
  (walk, hold, blend, reach, look), detailed procedural props (rounded edges,
  hardware, lathed and extruded shapes), canvas screens, an instanced crowd.
- **Surfaces and people.** `kit/surfaces.ts` generates tileable PBR maps
  (colour detail, normal, roughness and cavity) for wood, laminate, knit,
  denim, concrete, paint, tile, carpet, skin, hair and more, applied at
  real-world scale. Characters are one skinned body surface built from a signed
  distance field (`figure/skin.ts`) with a sculpted head, eyes with lids and
  lash lines, ears, brows, hands with fingers and shoes; they breathe, blink and
  look around. Ambient occlusion (GTAO) runs on the high quality tier.
- **Spatial sound.** Each profile places its sources in the set (HRTF panners
  that follow the camera and the look); buses for music, ambience, effects and
  interface follow the settings.
- **Everything is generated** — geometry, textures, screens, photographs and
  sound are made in code. See `CREDITS.md`.

## Structure

```
src/
  app/                 page (deep links, metadata), layout, OG images (/og/[id])
  components/strolly/  GameShell, runtime, TitleScreen, StorySelect, PauseMenu,
                       SettingsMenu, Screens (archive, complete, confirm, error),
                       ChoicePanel, Journal, GameHUD, NarrativeLayer,
                       StoryTranscript, Cursor, MenuBackdrop, StoryArt,
                       ErrorBoundary, debug (dev-only test API types)
  stories/             registry, loaders, shared timeline + types, and one
                       folder per story (timeline, text, audio)
  lib/                 scroll, look, input, discovery, save, settings, tracks,
                       math, env, labels, audio (core, synth, menu ambience)
  three/
    Stage.ts           the one renderer, shared render targets, final pass
    look.ts, lens.ts   applying the look; fitting the lens to the aspect
    figure/            figure rig, skinned body (skin.ts), sculpted head and
                       hands (figureBody.ts), poses, walking paths, two-bone reach
    kit/               SetScene, direction helpers, props, surfaces
    tekerrur/          TekerrurScene (the DURUM observatory), screens (DURUM UI)
    emanet/            EmanetScene, Apartment, cast, choreography, memory, MemoryPass
    ofke/ yasamak/ kalan/ esik/   one set director each
```

## Copyright

© 2026 Çayan Kuzu · Tüm hakları saklıdır. Powered by [MeMoDe](https://fikkis.vercel.app).
The source is public for viewing; see [`LICENSE`](LICENSE). Libraries and fonts keep
their own licenses (see [`CREDITS.md`](CREDITS.md)).

## Accessibility

- Every story is also in the page as semantic HTML (skip link: "Hikâyeleri metin olarak oku").
- Menus work with the keyboard (arrows, Enter, Esc) and return focus where you left it.
- Text size (S–XL), high contrast, sound captions, immersion mode (hides the HUD).
- Reduced motion: no smooth-scroll inertia, held camera shots, no blur transitions;
  reduced camera: slower look, no inertia, no drifting.
- Without WebGL a story continues as text over chapter backdrops.
- Sound starts only after a gesture and can be switched off at any time; the choice is remembered.
