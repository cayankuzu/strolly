# DURUM — screenplay and scene contract

Code: `src/stories/durum/timeline.ts` (segments, chapters, the night's clock
`storyHours`/`clockText`) and `src/stories/durum/text.ts` (every word, six
choices, discoveries, captions, transcript). Source of truth for the story:
`docs/MASTER_PROMPT_DURUM.md`.

Total **155.3 screens** (lengthened for reading pace from 137.4; the per-segment lengths below are the original ones — `timeline.ts` is authoritative), 56 segments, 10 chapters, 6 choices (one `mem:`
flag), 10 discoveries. `SCREEN_VH = 84`. Rail on the **left**: compose the
subject centre-right; keep the left third of the frame calm (dark wall,
glass, out-of-focus room) whenever a rail line is up.

Notation: `u` = local progress 0–1 inside the segment; `@` = absolute screen
where the segment starts; the clock is the in-world time (`storyHours`).
Text ids are given with `from–to` (fractions of the segment) and, for
two-line items, `l2@` = the `u` where the second line arrives. Camera:
`(position) → (target)`, vfov in degrees. "WD" = the wall display, "MM" =
Arif's main monitor, "LM/RM" = his left/right monitors, "SM" = Selin's
monitor, "HC" = the hall console, "PH" = Arif's phone.

---

## 1. Logline, tone, palette, light

**Logline.** One Thursday night, 20.58 to 03.12, in the basement of an old
observatory in Ankara. A machine called DURUM is said to know the position
and speed of everything. Arif, the tired night operator, asks it small things
because small things test better: a coin, an envelope, two boxes, an
electron, a butterfly, a sealed question. Every idea happens to an object
and is decided by the reader. Near three, the model flags an input it cannot
compute — the reader — and Arif, who has been late for his daughter for
weeks, finally turns his phone over.

**Heart.** The philosophy is the furniture; the story is a father who is
late again. The thread is physical and must read on screen: he turns his
phone **face down** at 20.59 (`enter`), it buzzes **once on an empty desk**
at 22.53 (`lapse`), a phone rings unanswered in the counterfactual city
(`chain`), and at 03.05 he **turns it over** (`message`). Use the same insert
framing for all four (see §8).

**Tone.** Calm, nocturnal, exact, dryly funny. DURUM is not sinister; it is
too honest. No glitch-horror, no red alarms, no hacker green. The one alert
(`input`) is amber and quiet. Humour is played straight: nobody winks.

**How DURUM speaks.** DURUM has no body and no voice. Every DURUM line
(`kind: machine`) is **typed** on the screens at the moment the rail line
appears: in the **dialogue band** of the WD (bottom 22 % of the canvas, INK
on PANEL, 3–4 words per 0.1 s, a soft key tick per word) and on the MM's
prompt line. In the server hall it types on the HC and runs along the rack
status strips. When Arif is far from the desk (`query`, `answer`) the WD
shows the line full-screen, centred. Arif speaks aloud; a small mic LED under
the WD glows while he talks. He **types** only at the two typed gates
(`rebuild`, `queryGate`) and on his phone (`coat`).

**Palette.**
- Office: walls warm grey #d7d4cc (in shadow most of the night), carpet
  #464b53, desk laminate #cbc3b4, metal #9aa0a6. Desk lamp warm #ffd9a8.
- Server hall: walls/ceiling #2a2f35, tile #8a9097, racks #1d2125, LEDs
  #9cc8ff, hall light #7fa6d8 (cold blue). In AYNA it warms toward amber
  #e2b062 as the heat rises.
- DURUM's interface (from `src/three/durum/screens.ts`): BG #0a0c0e, PANEL
  #11151a, RULE #22303a, INK #d9dde0, MUTED #7d8a93, FAINT #47535b,
  **AMBER #e2b062** (attention, the counterfactual world, the measured
  point), GREEN #78c49b (verified), RED #e05a47 (only the one red line in
  the verification report).
- Thermal slips (coin, box): off-white #f1efe8, print #2a2a2a, mono caps.
  The envelope: cream #efe6d2 with a round red seal #9b2a22 embossed "D".
- Forest (KELEBEK): blue-black #0b1016, moonlight #9fb4d8, fern #2e4a32,
  butterfly dark velvet brown #3a2418 with a cream border #e8dcc0.
- Outside: Ankara at night, sodium streetlights #ffb46a, cold sky #05080d →
  horizon #2a2a30.

**Light per chapter (all night).**
1. İBLİS 20.58 — office mostly dark; one ceiling panel on at (−2.5, 3, 2);
   the hall lights behind the glass **breathe** (intensity 0.55 ↔ 1.0, period
   ~4 s); the desk lamp switches on in `enter`.
2. KÜÇÜK SORULAR 21.00 — lamp pool on Arif's desk, monitor glow on his face,
   Selin's desk lamp by the windows.
3. KEHANET 21.13 — same; the corridor and kitchen lights for the kitchen
   branch; the hall lights pulse faster while the cooling "cries" (`selin`).
4. İKİ KUTU 21.31 — a hard key on the boxes; in `split` the key light moves
   from A to B with the two voices.
5. BELİRSİZLİK 23.30 — the WD is the main light source (cold #c8dcff); the
   office around it falls dark. Time-lapse in `lapse`: city lights below go
   out in patches.
6. KELEBEK 00.24 — WD light; the forest is moonlit; rain is heard, never seen.
7. AYNA 01.24 — the hall; blue turning to amber with heat haze.
8. BÜYÜK SORU 02.15 — office darkest so far; in `computing` the hall goes
   still (LEDs dim 60 %, no breathing).
9. GÖZLEMCİ 02.53 — every screen amber for one beat, then only the WD; the
   room otherwise black.
10. SON SORU 03.05 — phone light on Arif's face; the doorway lit from the
    corridor; screens go out one by one; the street below in sodium light.

---

## 2. World layout (metres; x right, y up, z toward the default camera)

The observatory set already exists in `src/three/durum/DurumScene.ts`; keep
its geometry and add the props below. Only one remote set: the forest.

### A — The office (control room) · x −5…5, z −4…4, h 3.0

- **North (z −4):** the glass partition (mullions every 1.25 m), the glass
  **door** to the hall at x −3.75…−2.5 (centre −3.125), handle at x −2.75.
  - **Brass plaque** above the door: centre (−3.125, 2.42, −3.94), 0.70 ×
    0.14, facing +z, engraved: "Bir an ver bana; sana bütün zamanları
    vereyim." and below, small: "Laplace’a, 1814."
  - **The rule sheet:** an A4 page (0.21 × 0.297) taped on the pane at
    (−1.6, 1.55, −3.96) (off the mullion at x −1.25), facing +z, black bold sans: "TAHMİN
    YAYIMLANIRSA GEÇERSİZ OLUR." Two strips of tape, one corner curling.
- **East (x 5):** three windows (z −2.3, 0, 2.3; sill 0.9, top 2.5) over
  Ankara, blinds half open; Selin's desk at (3.3, 1.4) facing the windows,
  her chair at (2.68, 1.4), SM at (3.52, 1.1, 1.4) facing −x, her low
  partition at x 3.72 with the **child's drawing** (3.695, 1.22, 0.98). On
  her desk: a paper bakery bag with two simits, her tulip tea glass on a
  saucer, a desk lamp. Plant at (4.45, −1.2).
- **South (z 4):** the door to the corridor at x 2.6 (1.0 wide), the
  whiteboard (−1.6, 1.55, 3.985), the **stopped wall clock** (0.6, 2.35,
  3.98) showing 21.13, the **coat rack** (3.95, 3.45) with Arif's coat
  (#33363a) and leather bag.
- **West (x −5):** the coffee counter (x −5…−4.38, z −0.8…1.4) with the
  coffee machine (−4.72, 0.92, 0.5), an upturned mug at (−4.75, 0.92, −0.2),
  a **sugar bowl** of paper-wrapped cubes at (−4.62, 0.92, 0.85); the fridge
  (−4.68, −1.25); the bookshelf (−4.82, −2.7); the **old printer** on its
  cabinet at (−4.62, 0.72, 2.7) — add an envelope **inserter** on its +x side
  (a 0.3 × 0.12 × 0.25 box with a slot), an output tray, a red seal stamp
  arm, and a small amber LCD (0.08 × 0.03) on its front.
- **Arif's desk** centre (0, −0.6), 1.8 × 0.8, he sits at (0, 0.14) facing
  −z. MM (0, 1.115, −0.86) 0.6 × 0.34; LM (−0.66, 1.1, −0.76) and RM (0.66,
  1.1, −0.76), angled in. On the MM bezel, lower right: the **yellow sticky
  note** (0.27, 1.27, −0.84). Keyboard (0, 0.754, −0.44), mouse (−0.36,
  −0.42), lamp (−0.78, 0.74, −0.85), the papers = **verification report**
  (−0.36, 0.754, −0.5), binder (0.82, −0.88), PC tower under the desk (0.5,
  −0.78), bin (1.15, −0.72).
  - New: **receipt printer** (thermal, light grey, 0.12 × 0.1 × 0.14) at
    (0.78, 0.754, −0.55); its slip (0.06 wide) feeds toward +z and curls
    over its lip.
  - New: **water glass** (straight, Ø 0.07, h 0.11, half full) at (−0.55,
    0.754, −0.28). The blue **pen** at (−0.34, 0.762, −0.3).
  - Arif's **phone** lies **face down** at (0.72, 0.754, −0.3) from `enter`
    to `message` (screen down, a thin glow escapes at its edges when it
    lights).
  - His **mug** at (0.46, 0.754, −0.36) from `intro` on.
  - **Tally counter** (hand clicker, chrome, Ø 0.05) in the desk tray,
    used in `traffic`.
  - A **1 TL coin** (bimetal, Ø 0.026) in his trouser pocket. TURA = the
    portrait side, YAZI = the side with the "1 TL" numeral.
- **The two boxes** (chapter 4, on the desk front; keyboard pushed back to
  z −0.62): **A** clear acrylic 0.28 × 0.2 × 0.2 at (−0.24, 0.754, −0.3),
  inside a fan of five 200-lira notes in a paper band printed "1.000 TL";
  **B** matte grey metal, same size, at (0.24, 0.754, −0.3), lid closed, a
  white paper seal strip over lid and front printed in red: "DURUM · MÜHÜR ·
  ÇARŞAMBA 23.58" (yesterday; no date). Inside B, per choice: a pale green
  cheque (0.18 × 0.08, "BİR MİLYON TÜRK LİRASI") with a thermal slip clipped
  to its corner — or nothing but a thermal slip taped flat to the floor of
  the box.
- **The wall display (WD):** canvas 2.24 × 1.26 on its stand. **Moved
  forward to centre C = (2.6, 1.55, −3.0)** (from z −3.55) so that it can
  turn without its end touching the glass, and **the stand now pivots**
  about the vertical axis through C. Default yaw **−0.69 rad**: the screen
  faces Arif's chair (normal n = (−0.637, 0, 0.771); screen-right axis r =
  (0.771, 0, 0.637)). It turns twice: in GÖZLEMCİ to **+0.29 rad**, facing
  the observer point **OBS = (4.3, 1.62, 2.6)** — the empty south-east
  corner between Selin's desk and the coat rack, where nobody ever stands —
  and in SON SORU to **0**, facing the door. Points used below:
  - **F** = C + 1.65 n = (1.55, 1.55, −1.73): the "WD full frame" camera
    (F → C, vfov 40: the canvas fills the frame).
  - **M** = C + 0.8 n + 0.5 r = (2.48, 0, −2.06): Arif's standing mark at
    the WD (chapter 5), facing −n.
  - **T** = C + 0.3 r + (0, 0.05, 0) = (2.83, 1.6, −2.81): where his
    fingertip touches the screen in `cloud`.
- Ceiling panels (0.6 × 0.6) at (±2.5, 3, ±2), only (−2.5, 2) lit.

### B — The server hall · x −5…5, z −4.15…−11.95, h 3.3

- Racks (0.6 wide, 2 m tall, dark smoked-glass front doors) at x −3.9,
  −3.25, −2.6 (west block) and 0.6, 1.25, 1.9 (east block), rows A, B, C at
  z −6.0, −8.4, −10.8. Central aisle x −2.0…0.0 (Arif walks at x −1.0).
- The **self-model rack** (0.6, z −8.4), label at (0.6, 1.95, −7.885):
  "ÖZ-MODEL · KATMAN 7".
- **Cooling unit** (−4.5, 1.0, −10.4), 0.9 × 2.0 × 1.6, louvres on its
  +x face. Its "crying": see §6.
- **Hall console (HC)** (−4.72, 1.28, −7.2) on a cabinet, screen facing +x.
- Cable trays at y 2.55 over each row; three hall lights (−2, 2.9, −6.0),
  (2, 2.9, −8.4), (−1, 2.9, −10.8).
- **The mirror extension (AYNA only, `hallWalk`→`samePace`):** the north
  wall at z −11.95 is hidden and the three rack rows **repeat** beyond it at
  2.4 m spacing down to z −60 (≥ 20 more rows, instanced), identical
  geometry, LEDs blinking in the same pattern, lit by repeated hall lights,
  swallowed by fog (FogExp2 density up to 0.05 for those rows). Each rack's
  smoked-glass door shows a reflection of a rack, which shows another
  (fake it with a second, darker instanced rack 0.6 m behind each door,
  then a third, fainter).

### C — Corridor and kitchen · corridor z 4.15…6.55, x −8…8; kitchen x −4.2…−0.2, z 6.7…9.9

- Existing: counter along z 9.55, sink (−2.6, 0.93, 9.55), wall cupboards
  with door 2 (x −2.8…−2.2) that opens; mugs on the cupboard shelf. A tea
  towel on the oven handle (−1.6, 0.85, 9.25).

### D — Outside · Ankara, three floors down

- Existing: facades x 22–182 (facing −x), ground plane y −9.5, sky dome.
- New for `end`: an **avenue** along z at x 12–20 on the ground (y −9.5),
  pavement on its west side at x 12.5; **sodium streetlights** (pole 6 m,
  lamp #ffb46a) at x 12, z = 18, 6, −6, −18, −30; the building's street
  door at (5.15, −9.5, 5.0) (the building's east face is flush with the office's outer wall, so nothing juts out under the windows). One parked car at (14, −9.5, −12). A distant car
  crosses at z −40 in `end` u 0.1.

### E — Belgrad Ormanı (KELEBEK) · x −200, z 0

- Ground disc r 14 at y 0, leaf litter #1a1610; 30–40 trunks (oak/beech,
  Ø 0.3–0.7, 12–18 m, bark #2a2622) in a ring 3–12 m out, a fallen log at
  (−197.5, 0.2, −1.5); fern clump around (−200, 0, 0), fronds 0.5–0.7 m.
- The **butterfly** (wingspan 0.06) resting on a fern frond tip at (−200,
  0.55, 0), wings folded upright. Two-quad wings, hinge animation.
- Moonlight: directional #9fb4d8 from (−0.5, 1, 0.3), intensity low; fog
  #0b1016 dense; leaves sway with a wind function.
- Visible only during `forest`.

### Cast

- **ARİF** — male, height 1.0, 43, short dark hair greying at the temples,
  stubble, thin black glasses; slate-blue crew-neck knit sweater #4f5a66 over
  a light shirt (cuffs #c9ced4), dark trousers #2a2e35, black shoes. Coat
  #33363a and a brown leather bag on the rack. Moves economically; tired
  shoulders; a dry half-smile.
- **SELİN** — female, height 0.96, 38, long dark-brown hair (tied up in
  AYNA), olive work jacket #3e4a3d with sleeves pushed up, jeans #2b3546.
  Always has her tulip tea glass on a saucer; a tablet in the hall. Moves
  briskly; never looks impressed.
- **DEFNE** — 14, never seen. Exists as a message, a sticky note, the
  telescope she was promised.
- **DURUM** — no body: the screens (WD, MM, LM, RM, SM, HC, the receipt
  printer, the old printer's LCD, the rack status strips). The WD is its
  face; when it "turns", the WD physically turns.
- **KURUL** — a sealed query: a grey list item with a red wax-seal icon
  (embossed "K").
- **THE BUTTERFLY** — see set E.
- **THE OBSERVER** — the reader = the camera. In GÖZLEMCİ the camera stands
  at OBS and is addressed directly.

---

## 3. Segment table

### 01 — İBLİS (10.9 screens) · `open` → `intro` · 20.58–21.00

**open** · 1.3 · @0.0 · set A · QUIET (0 → `enter` 0.05)
- Nobody in frame. The dark office; behind the glass partition the hall
  lights breathe. The brass plaque above the glass door catches a little of
  the hall's blue light.
- Camera: (−1.6, 1.5, 0.4) → (−3.125, 2.25, −3.94), vfov 38, slow push of
  0.4 m; the plaque sits right of centre, the dark glass and the breathing
  hall fill the rest.
- Sound: hall fans through glass, steady; nothing else.
- `inscription` (center, −1 → 0.9) "Bir an ver bana; sana bütün zamanları
  vereyim." — the plaque that bears these words, too far to read (the
  discovery reveals it).

**enter** · 2.8 · @1.3 · set A · 20.58
- u 0.02 the corridor door (2.6, 4) opens; a wedge of corridor light on the
  carpet. u 0.06–0.25 Arif enters (2.6, 4.6) → (2.6, 3.4); the door swings
  shut at 0.2. u 0.25–0.45 he crosses to the coat rack; **0.5–0.58 hangs his
  coat** (reach to hook at 1.75), sets the bag at the rack's foot. u 0.6–0.72
  walks to the desk ((3.4, 3.0) → (1.2, 1.0) → (0.35, 0.2)); 0.72 switches on
  the desk lamp. **u 0.75–0.88: takes the phone from his pocket, glances at
  the lock screen (lit 0.76–0.8: "20:58", no notifications), turns it face
  down and lays it at (0.72, 0.754, −0.3).** 0.88–1.0 stands by his chair
  looking at the glass.
- Camera: u 0–0.62 wide from the north-west corner by the bookshelf
  (−4.2, 2.1, −3.3) → (2.0, 1.2, 2.6), vfov 44, panning with him — the door,
  the rack, then the three east windows with Ankara below (u 0.25–0.4).
  u 0.62 cut to medium at the desk (1.1, 1.35, 0.9) → (0.5, 0.85, −0.3),
  vfov 36. **u 0.76–0.9 insert, the phone:** (1.06, 1.02, 0.1) → (0.72,
  0.78, −0.3), vfov 27 (the "phone insert", §8).
- Light: corridor wedge 0.02–0.2; lamp pool from 0.72.
- Sound: door, steps on carpet, coat hanger, lamp click, the soft tap of the
  phone laid face down (0.8).
- `clock-2058` (top, 0.06–0.5) PERŞEMBE · 20.58.
- `basement` (0.05–0.55; l2@0.25): Arif coming in through the dim office;
  line 2 "Bina yamaçtaydı; bodrumun pencereleri Ankara’ya bakardı." as the
  pan passes the windows and the city lights below.
- `phone-down` (0.59–1.0): "Ceketini askıya astı." on the coat going onto
  the hook; "Telefonunu… ters çevirip masaya bıraktı." on the insert.

**coffee** · 3.6 · @4.1 · set A, coffee corner
- u 0–0.12 Arif walks to the coffee corner, stands at (−4.15, 0.5) facing
  −x; 0.12–0.3 turns up his mug, pours from the jug. **u 0.03 the WD band
  types the greeting**; he glances over his shoulder at it (0.1).
  u 0.31 "Tek şeker." without turning fully; 0.53 the WD types "Biliyorum.";
  he snorts. **u 0.74 unwraps a cube, drops it (0.76); his hand hovers
  (0.78–0.83); drops a second (0.86)**; leaves the two wrappers on the
  counter; stirs (0.9–1.0) and walks away without looking at the cup.
- Camera: u 0–0.52 over his shoulder from behind the coffee machine
  (−4.6, 1.55, 1.3) → (0.5, 1.4, −2.0), vfov 40 — Arif in the right
  foreground, the WD with the typed line across the dark room (legible at
  ~8 m: band text ≥ 7 cm tall). u 0.52–0.72 two-shot side-on (−3.0, 1.5, 1.6)
  → (−4.4, 1.2, 0.4), vfov 36. u 0.72–1.0 insert on the cup:
  (−3.75, 1.25, 0.75) → (−4.55, 0.95, 0.45), vfov 28.
- Sound: the machine gurgles (0.04); cube 1 plops (0.76); cube 2 (0.86);
  spoon on ceramic.
- `greet` (0.03–0.28) DURUM: on the WD band while he pours.
- `one-sugar` (0.31–0.5) ARİF: to the screen, over his shoulder.
- `know-sugar` (0.53–0.71) DURUM "— Biliyorum.": on the WD; his snort.
- `sugar` (0.74–1.13; l2@0.95): the insert: one cube, the hover, the
  second; line 2 "Fark etmedi." as he stirs and turns away (spills 0.47
  screens into `intro`, over his walk back).

**intro** · 3.2 · @7.7 · set A
- u 0–0.15 Arif walks back with the mug, sits; mug down at (0.46, 0.754,
  −0.36). 0.2 he nudges the mouse: MM, LM, RM wake. The WD shows the model
  at rest (`drawState`): header "DURUM · KÜRESEL DURUM MODELİ", a slowly
  turning field of tracked points (tiny dots with short velocity ticks),
  counters (İZLENEN NESNE, KAPSAM, DOĞRULUK %99,97). **u 0.38–0.6 a faint
  fan of forward projections blooms from the points** (the "sonra ne
  olacak"). u 0.64–1.0 the camera finds the rule sheet on the glass.
- Camera: u 0–0.62 behind Arif, high (−0.9, 1.75, 1.6) → (1.2, 1.3, −3.4),
  vfov 42, slow push: Arif at his desk lower right, the WD dashboard, the
  dark hall beyond. u 0.64–1.0 slow pan/truck to the sheet (−0.6, 1.5,
  −2.2) → (−1.25, 1.55, −3.96), vfov 32; the hall breathing behind the
  paper; at 0.79 the sheet's text is legible.
- `state-label` (top, world, 0.05–0.95): the WD header.
- `built` (0.17–0.6; l2@0.34): the point field with its velocity ticks
  ("Nerede ne var, ne hızla gidiyor"); line 2 lands as the projection fan
  blooms.
- `rule` (0.64–1.0; l2@0.79): the camera drifting to the taped sheet; line
  2 (the rule in caps) when the sheet fills the frame.
- Discovery `sugar` (coffee counter, behind-left) is up from `coffee` 0.9.

### 02 — KÜÇÜK SORULAR (14.4) · `ritual` → `youSaid` · 21.00–21.12

**ritual** · 3.2 · @10.9 · set A
- Arif at the desk, mug in hand, the three monitors' light on his face.
  Selin at her desk by the windows, typing; the paper bag with two simits
  beside her keyboard. u 0.53 Arif, without turning: "Selin bu gece kaç
  simit yiyecek?" (a nod toward her). u 0.77 the MM types the answer; u 0.8
  Selin, not looking up, pulls the paper bag closer (it rustles).
- Camera: u 0–0.52 three-quarter front of Arif past the edge of the RM
  (1.4, 1.35, −1.6) → (0, 1.15, 0.1), vfov 38. u 0.53–0.76 two-shot from
  behind Arif (−1.2, 1.6, 1.5) → (2.8, 1.1, 1.3), vfov 40, Selin in the
  right third. u 0.77–1.0 cut to Selin's desk (1.9, 1.3, 2.2) → (3.1, 0.95,
  1.2), vfov 32: her hand, the bag, two simits.
- Sound: Selin's keyboard far off; the bag rustles (0.8).
- `clock-2100` (top, 0.12–0.5).
- `ritual` (0.06–0.5; l2@0.24): Arif idle before the screens, sipping.
- `simit-q` (0.53–0.74) ARİF: the two-shot, his nod toward Selin.
- `simit-a` (0.77–1.0) DURUM: the line on the MM (soft in the background),
  the cut lands on the two simits.
- Discovery `report` (the papers, desk left) up from here.

**traffic** · 2.8 · @14.1 · set A
- The LM shows the prediction log: "DÜNKÜ TAHMİN · 14.17 · KIZILAY · 212
  ARAÇ" (status: BEKLİYOR). The RM plays yesterday's traffic-camera
  recording of the Kızılay corner (high angle, daylight, timestamp
  14.17:00 running at 4×), cars crossing a stop line. Arif clicks the tally
  counter in his left hand with each car (u 0.05–0.5); 0.5 rewinds (the
  video jumps back), 0.52–0.6 counts again, faster; 0.62 stops. **0.64 he
  turns the counter toward himself: 0212.** 0.75 the LM line turns GREEN:
  "DOĞRULANDI".
- Camera: u 0–0.62 over his shoulder at the RM (0.25, 1.35, 0.55) →
  (0.66, 1.1, −0.76), vfov 32, the video legible, the clicker in the lower
  frame. u 0.64–1.0 insert, the counter in his palm (0.35, 1.0, 0.25) →
  (0.15, 0.85, −0.05), vfov 22; the LM's green line soft behind.
- Sound: a click per car (dense), the rewind chirp, then silence.
- `log-screen` (world, 0.05–0.95): the LM line.
- `yesterday` (0.03–0.6; l2@0.26): line 1 as the recording plays; line 2
  "Kamera kaydını açtı… bir daha saydı." over the counting and the rewind.
- `212` (0.64–0.98): the counter reading 0212.

**thumb** · 2.2 · @16.9 · set A · GATE `coin` @0.93
- u 0–0.28 Arif drops the counter in the tray, digs the 1 TL coin out of his
  trouser pocket; 0.3–0.42 balances it on his right thumbnail, fist curled,
  elbow on the desk; holds. **u 0.5 the MM and WD band type "— Söyleyeyim
  mi?"; at 0.55 the receipt printer prints for half a second — a 10 cm slip
  slides out and hangs over its lip. Arif does not look at it.** 0.86–0.93
  still. **Hold at 0.93: the coin on the thumbnail.**
- After the pick (0.93–1.0): the thumb flicks (0.94); the coin spins up out
  of the top of frame, ringing.
- Camera: u 0–0.45 medium close from his right (0.9, 1.15, 0.35) → (0.1,
  0.95, −0.1), vfov 34: hand, coin, his face beyond. u 0.45–1.0 tight on the
  coin (0.5, 1.02, 0.15) → (0.18, 0.93, −0.12), vfov 20; the receipt
  printer soft at top right, the slip emerging at 0.55; 0.94 tilt up with
  the coin.
- Sound: the printer's short buzz (0.55); the coin's ring (0.96).
- `coin` (0.04–0.46): the coin taken out and set on the nail.
- `offer` (0.5–0.86) DURUM: on the MM behind his hand; the printer moves
  at the edge of frame (the reader may notice; Arif doesn't).
- Gate: nothing on the rail; the frame holds on the thumb and coin.

**palm** · 3.0 · @19.1 · set A
- u 0–0.04 the coin drops into his right palm; he closes the fist and rests
  it on the desk. **0.08–0.16 his left hand tears the slip off the printer
  (0.14).** 0.18–0.5 he holds the slip up; reads; his eyes go to the
  timestamp. 0.56–1.0 the slip in insert.
- The slip (thermal paper, mono caps): top line "21:10:00" (= when DURUM
  asked), then per flag — `coin:yazi` "YAZI DİYECEKSİNİZ." /
  `coin:tura` "TURA DİYECEKSİNİZ." / `coin:none` "HİÇBİR ŞEY
  DEMEYECEKSİNİZ." — then "PARA TURA GELECEK."
- Camera: u 0–0.52 medium (−0.6, 1.4, 0.7) → (0.35, 0.95, −0.3), vfov 36:
  closed fist at frame right, the tear. u 0.56–1.0 insert, slip 0.3 m from
  his face (0.2, 1.22, 0.32) → (0.28, 1.12, −0.05), vfov 24; tilt down from
  line 1 to line 2 at 0.69.
- Sound: the coin smacks into the palm (0.02); the tear (0.14).
- `slip` (0.05–0.52; l2@0.24): the tear; line 2 "…sorduğu anda basılmıştı."
  on the timestamp.
- `slip-yazi` / `slip-tura` / `slip-none` (center, 0.56–0.99; l2@0.69): the
  slip filling the frame; its printed text is identical to the centre text.

**youSaid** · 3.2 · @22.1 · set A
- u 0.03 Arif opens his fist: TURA (portrait side up). 0.3 "Bana siz
  demezsin." to the MM. 0.54 the MM types "Sana demedim." 0.6–0.77 he does
  not move. **0.77–0.9 he swivels his chair and looks behind him — straight
  toward the lens — then past it (0.92).** The room behind him is empty: the
  door, the coat on the rack, the stopped clock.
- Camera: u 0–0.28 insert on the open palm (0.3, 1.0, 0.3) → (0.1, 0.78,
  −0.12), vfov 22. u 0.3–0.75 reverse from behind the MM (0.15, 1.3, −1.15)
  → (0, 1.2, 0.14), vfov 32: Arif facing us in the screen light. u 0.77–1.0
  from the south wall below the clock (0.6, 1.45, 3.3) → (0, 1.2, 0.14),
  vfov 30, slow push; his eyes meet the lens at 0.86.
- `tails` (0.03–0.27): the palm, TURA.
- `siz` (0.3–0.51) ARİF; `not-you` (0.54–0.74) DURUM: the reverse on his
  face; the MM text reflected in his glasses.
- `behind` (0.77–1.02): the swivel, the look into the lens, the empty room.
- Discovery `stopped-clock` (south wall, behind the default camera; up since
  `enter`) is in the edge of this last shot.

### 03 — KEHANET (14.2) · `dare` → `selin` · 21.13–21.24

**dare** · 2.8 · @25.3 · set A
- Arif leans in, elbows on the desk, slip and coin pushed aside: the
  challenge (0.05). The MM/WD type DURUM's reply in two paragraphs (0.38,
  0.62).
- Camera: u 0–0.36 close on Arif from the monitor side (0.3, 1.25, −0.6) →
  (0, 1.2, 0.14), vfov 30. u 0.38–1.0 over his shoulder at the MM (0.45,
  1.4, 0.65) → (0, 1.12, −0.86), vfov 32; the WD mirrors it, soft, beyond.
- `clock-2113` (top, 0.06–0.36).
- `dare` (0.05–0.34) ARİF: his face, half amused.
- `heard` (0.38–0.98; l2@0.62) DURUM: the MM; line 2 types as a second
  paragraph.
- Discovery `yellow-note` (MM bezel) up from here: visible in the
  over-shoulder.

**envelope** · 2.2 · @28.1 · set A, south-west corner
- u 0.04 the old printer wakes (green LED, rollers). 0.06–0.3 one page
  prints face down (its text is never seen). 0.3–0.4 the inserter folds it
  in three and pushes it into a cream envelope; 0.42 the seal arm presses a
  red seal; **0.45 the envelope drops into the tray.** 0.5–0.72 Arif walks
  over (desk → (−4.0, 2.4)); 0.75 picks it up; **0.56 the printer's amber
  LCD (and the WD band) shows "SONRA AÇ."**; 0.8–1.0 he turns the envelope
  over and looks at the seal.
- Camera: u 0–0.52 close on the printer (−3.9, 1.1, 2.1) → (−4.62, 0.82,
  2.7), vfov 28. u 0.52–1.0 medium from the desk side (−1.2, 1.5, 0.6) →
  (−4.1, 1.1, 2.5), vfov 38: Arif comes into frame and lifts the envelope;
  the LCD glows.
- Sound: dot-matrix rattle (0.06), the folding thunk, the seal press, the
  drop into the tray (0.45).
- `printer` (0.04–0.52): the print, the fold, the seal.
- `later` (0.56–0.97) DURUM: the LCD "SONRA AÇ."; Arif lifting the envelope.

**contrary** · 1.8 · @30.3 · set A
- u 0–0.2 Arif returns, lays the envelope on the desk at (−0.25, 0.756,
  −0.25) (0.2). **0.24–0.36 turns his chair round and sits astride it,
  arms on the backrest.** 0.42 picks up the blue pen, looks at the MM, **0.5
  lets it drop** (lands at (−0.27, 0.006, 0.05), 0.55). 0.62 picks up the
  water glass, 0.72 puts it down, 0.82 picks it up again; holds it at chest
  height (0.85–1.0), eyes on the envelope.
- Camera: u 0–0.4 from Selin's side (2.4, 1.55, 1.6) → (0, 0.95, −0.2),
  vfov 40, Selin's back soft in the right foreground (she does not turn).
  u 0.4–1.0 medium on Arif (−1.1, 1.2, 0.9) → (−0.2, 0.85, −0.15), vfov 34.
- Sound: the pen on carpet (0.55); the glass on laminate (0.72).
- `contrary` (0.04–0.98; l2@0.42): line 1 on the envelope landing on the
  desk; line 2 runs with the actions (chair 0.24–0.36 is before it — keep
  him astride; pen 0.5; glass 0.62–0.85).

**glassChoice** · 1.0 · @32.1 · set A · GATE `glass` @0.5
- u 0–0.5 Arif sits astride the reversed chair, the glass in his hand, the
  sealed envelope on the desk. Frozen. **Hold at 0.5.**
- Camera: close (−0.85, 1.15, 0.5) → (−0.4, 0.95, −0.2), vfov 30: the glass
  in the foreground, the envelope, the MM glow.
- After the pick (0.5–1.0):
  - `glass:kitchen` — 0.52 he gets up, walks toward the corridor door with
    the glass (reaches (2.6, 3.5) at 1.0).
  - `glass:break` — 0.52 he swings the glass against the desk edge
    (−0.75, 0.74, −0.22); **0.56 it shatters**: shards scatter on the carpet
    around (−0.8, 0, 0.0) (reuse the existing shard instancing, r 0.32) and
    a water stain darkens the carpet (reuse the stain mesh, lighter and
    greyer than tea). He freezes, hand open.
  - `glass:none` — 0.52 he sets the glass back on its mark (0.6), lays both
    hands on his knees (0.7), still astride the chair.

**opened** · 3.6 · @33.1 · set A (+ C for the kitchen branch)
- `glass:kitchen` — u 0–0.3 corridor → kitchen (cut on the door at 0.02):
  kitchen light on; 0.08–0.2 at the sink, rinses the glass (water stream);
  0.2–0.25 dries it with the towel; 0.26 opens cupboard door 2; 0.28 sets
  the glass on the shelf; 0.3 closes it. 0.3–0.4 walks back; cut at 0.4 to
  him seated, the chair forward again.
  - Camera: kitchen medium (−1.0, 1.6, 7.2) → (−2.5, 1.2, 9.5), vfov 40.
- `glass:break` — u 0–0.3 Arif stands among the shards, looking down; his
  chest rises and falls fast. 0.3–0.4 he steps over the shards, turns the
  chair forward, sits.
  - Camera: low by the carpet (−1.4, 0.35, 0.9) → (−0.8, 0.05, 0.0), vfov 34
    — shards glinting in the lamp light, his shoes; at 0.18 tilt up to his
    face.
- `glass:none` — u 0–0.3 he sits motionless astride the chair; the camera
  orbits slowly around him (r 1.4, y 1.2, from (−1.3, 1.2, 0.6) to (−0.9,
  1.2, 1.1), target (0, 1.0, 0.1), vfov 36); the MM's seconds tick on; 0.3
  he exhales, 0.32–0.4 turns the chair forward.
- All: **0.42–0.45 he tears the envelope open** and unfolds the page.
  0.45–0.8 the page in insert: dot-matrix print, three lines; the first line
  is exactly what he did. **0.83–0.9 he laughs (head back, shoulders); 0.93
  the laugh stops.** Still.
- Camera (all): u 0.45–0.8 insert on the page in both hands (0.0, 1.2, 0.45)
  → (0.0, 1.0, −0.1), vfov 24. u 0.83–1.0 close on his face from the
  monitor side (0.25, 1.22, −0.55) → (0, 1.2, 0.14), vfov 28.
- Sound: kitchen tap, cupboard door (kitchen); fans only (none); the
  envelope tears (0.44).
- `did-kitchen` / `did-break` / `did-none` (0.03–0.42; l2@0.19): the matching
  action; line 2 "…zarfı açtı." lands as he sits and takes the envelope.
- `page-kitchen` / `page-break` / `page-none` (center, 0.45–0.8): the page
  insert; its print = the centre lines.
- `laughed` (0.83–1.04): the laugh and the stillness after it.

**selin** · 2.8 · @36.7 · set A
- From u 0 the SM shows a red load spike: "DAVRANIŞ MODELİ · 9 DK ·
  SOĞUTMA %340". The hall lights behind the glass pulse fast and blue
  (0–0.4). u 0–0.2 Selin crosses from her desk to Arif's ((2.68, 1.4) →
  (0.85, 0.15)), tea glass on saucer in hand; she stops at his right
  shoulder. In `glass:break` her path bends round the shards and she glances
  at them (0.1). u 0.05 she speaks, tilting her head at the hall. 0.41 Arif
  holds up the page: "Benim." 0.65 Selin sips, deadpan; 0.9 turns to go.
- Camera: u 0–0.4 two-shot from the window side (2.6, 1.5, 0.9) → (0.4,
  1.2, 0.0), vfov 38. u 0.41–0.62 single on Arif (0.6, 1.25, −0.5) → (0,
  1.2, 0.14), vfov 30. u 0.65–1.0 single on Selin with the tea glass
  (−0.2, 1.4, −0.5) → (0.85, 1.45, 0.15), vfov 30.
- Sound: the cooling unit "cries" (0.03), muffled by the glass.
- `cooling` (0.05–0.38) SELİN; `mine` (0.41–0.62) ARİF; `tea` (0.65–0.99)
  SELİN.

### 04 — İKİ KUTU (14.2) · `boxes` → `after` · 21.31–21.40

**boxes** · 2.0 · @39.5 · set A · 21.31
- The page and envelope are in the bin. u 0–0.3 Selin comes in from the
  corridor carrying the two boxes stacked (A on top), sets them on the desk
  front at their marks (0.3); 0.35 Arif pushes his keyboard back; 0.5–0.8
  Selin returns to her desk.
- Camera: u 0–0.4 wide from the window side following Selin (3.6, 1.6, 2.4)
  → (0.3, 0.9, −0.3), vfov 40. u 0.42–0.8 low hero shot of the boxes (0.0,
  0.95, 0.35) → (0, 0.82, −0.3), vfov 30; 0.8–1.0 push to B's seal strip
  (0.3, 0.9, 0.0) → (0.24, 0.86, −0.2), vfov 20: "ÇARŞAMBA 23.58".
- Sound: two box bottoms on laminate (0.3).
- `clock-2131` (top, 0.06–0.45).
- `two-boxes` (0.05–0.97; l2@0.42): line 1 as Selin brings and sets them
  down; line 2 on the hero shot — A's banded notes, B's seal.
- Discovery `drawing` (Selin's partition) up from here.

**rules** · 2.2 · @41.5 · set A
- Arif looks from box to box. The WD shows a plain diagram: two box icons;
  "TAHMİN: YALNIZCA B → B = 1.000.000 TL"; "TAHMİN: İKİSİ → B = 0"; a lock
  icon "DOLDURULDU · ÇARŞAMBA 23.58".
- Camera: u 0–0.45 from beyond the boxes toward Arif (0.55, 1.05, −0.7) →
  (0, 1.0, 0.0), vfov 34: boxes in the foreground, his face. u 0.45–1.0 the
  WD diagram (1.33, 1.5, −1.46) → C, vfov 34.
- `rules` (0.04–0.97; l2@0.41) DURUM: line 1 on Arif and the boxes; line 2
  on the WD diagram.

**split** · 3.0 · @43.7 · set A
- One mind, two voices, staged with light: u 0–0.48 a warm key on **A**
  (the notes glow), B in shadow; Arif's left hand rests near A; 0.3 his
  fingers drum, stop; 0.38 the left hand edges toward A. u 0.5–0.98 the key
  slides to **B**, A dims; behind, the WD shows a register: "YALNIZCA B · 31
  KİŞİ · 31 ZENGİN" (31 short green rows).
- Camera: u 0–0.48 (−0.6, 1.0, 0.4) → (−0.24, 0.86, −0.3), vfov 30 (A and
  the left hand). u 0.5–1.0 dolly right to (0.6, 1.0, 0.4) → (0.24, 0.86,
  −0.3), vfov 30 (B, the right hand; the WD register soft in the
  background).
- `one-hand` (caption BİR YANDAN, 0.03–0.48; l2@0.21): on A; line 2 "İkisini
  al…" as the hand edges toward it.
- `other-hand` (caption ÖTE YANDAN, 0.52–0.98; l2@0.70): on B; line 2
  ("Kayıtlara bak…") with the green register behind.

**choose** · 1.0 · @46.7 · set A · GATE `boxes` @0.5
- u 0–0.5 Arif's hands hover over both boxes. **Hold at 0.5.**
- Camera: top-down (0, 1.7, −0.15) → (0, 0.75, −0.3), vfov 34.
- After the pick: `box:one` 0.52 the left hand pushes A aside (slides to
  (−0.62, −0.42)); 0.6 the right hand tears B's seal; 0.65 lifts the lid.
  `box:two` 0.52 the left hand pulls A to him ((−0.2, −0.08)); 0.6 tears B's
  seal; 0.65 lifts the lid.
- Sound: seal tears and lid hinge (0.6).

**lid** · 2.8 · @47.7 · set A
- `box:one`: in B lies the pale green cheque with a thermal slip clipped to
  its corner; 0.1 Arif lifts the cheque out; 0.45 unclips the slip.
- `box:two`: B is empty, grey; a thermal slip taped flat to its floor; 0.1
  Arif tilts the box toward himself; 0.45 peels the slip off.
- The slip (same paper and type as the coin slip — the rhyme matters): top
  "ÇARŞAMBA 23.58", then `box:one` "YALNIZCA B’Yİ ALACAKSINIZ. / KURUL BUNU
  GERİ İSTEYECEK." or `box:two` "İKİSİNİ BİRDEN ALACAKSINIZ. / O YÜZDEN BU
  KUTU BOŞ."
- Camera: u 0–0.5 over the open lid down into B (0.24, 1.25, 0.15) → (0.24,
  0.8, −0.3), vfov 28. u 0.54–0.98 insert on the slip in his fingers (0.1,
  1.15, 0.25) → (0.15, 1.05, −0.05), vfov 22.
- `lid-one` / `lid-two` (0.04–0.5; l2@0.22): the box's interior; line 2 when
  the slip is seen.
- `note-one` / `note-two` (center, 0.54–0.98; l2@0.67): the slip insert.

**after** · 3.2 · @50.5 · set A
- `box:one`: Arif holds the cheque, glances at A pushed aside (0.03): "A’daki
  bin lira?" — the WD band (0.26): "Onu dün gece bıraktın."
- `box:two`: Arif holds A's banded notes (0.03): "Bin lira kazandım." — the
  WD band (0.26): "Bir milyonu da dün gece kaybettin."
- All: 0.5 Arif, quieter, looking at the WD: "Ya yanılsaydın?" **0.74 the
  WD clears to black except one line, "Bu evrende yanılmadım."; the hall
  lights behind the glass stop breathing for a beat (0.74–0.82).**
- Camera: u 0–0.47 medium two-shot, Arif and the cheque/notes (0.9, 1.3,
  0.6) → (0.1, 1.0, −0.1), vfov 34. u 0.5–0.71 close on Arif (0.3, 1.25,
  −0.6) → (0, 1.2, 0.14), vfov 28. u 0.74–1.0 slow push from behind him to
  the WD (−0.3, 1.5, 0.9) → C, vfov 36 → 30.
- `left-a` + `left-a-d` (box:one) or `won-a` + `won-a-d` (box:two)
  (0.03–0.23, 0.26–0.47); `what-if` (0.5–0.71); `this-universe` (0.74–0.99):
  the WD's single line, the hall holding its breath.

### 05 — BELİRSİZLİK (14.5) · `lapse` → `odds` · 21.40–23.52

**lapse** · 2.0 · @53.7 · set A · clock 21.40 → 23.30 (22.53 at u 0.55)
- One locked-off time-lapse of the office; people move at ×40 with a short
  motion trail. u 0–0.12 Arif carries the boxes out (`glass:break`: 0.12–0.15
  he sweeps up the shards); 0.15–0.5 he is in the hall behind the glass
  (small, a laptop on a trolley among the racks — backups); **0.28 Selin
  crosses to his empty desk, leaves half a simit on a napkin by his
  keyboard, goes back**; the desk stays empty. **u 0.52–0.62 insert: the
  face-down phone on the empty desk; at 0.55 it buzzes once — a 3 mm
  jitter, a thin glow at its edges for 0.03; the MM behind reads 22:53.**
  0.65–0.82 Arif back, eats the half simit standing; 0.84–1.0 he walks to
  his mark M in front of the WD as the time-lapse slows to real time at
  23.30. Through the windows, city lights go out in patches.
- Camera: u 0–0.52 and 0.62–1.0 locked high in the south-east corner (4.2,
  2.6, 3.6) → (0, 0.8, −0.6), vfov 46. u 0.52–0.62 the phone insert (1.06,
  1.02, 0.1) → (0.72, 0.78, −0.3), vfov 27 (§8).
- Sound: the room's fans compressed and faster; at 0.55 one dull buzz on
  laminate, then the time-lapse wash resumes.
- `night-went` (0.04–0.96; l2@0.50): line 1 over the time-lapse (Selin's
  half simit at 0.28); line 2 lands on the phone insert: one buzz, nobody at
  the desk.

**electron** · 2.2 · @55.7 · set A · 23.30
- The WD: a dark field with one bright dot at its centre, header
  "OLASILIK · TEK PARÇACIK" (reuse `drawParticle` with spread 0). Arif
  already stands at his mark M (he walked there at the end of `lapse`);
  **0.04 he points at the dot** (right arm toward C). 0.46 the WD band types
  DURUM's answer.
- Camera: u 0–0.42 behind-left of Arif (1.75, 1.6, −0.95) → C, vfov 40:
  Arif in silhouette right of centre against the screen and its single dot.
  u 0.46–1.0 close on his face in the screen light, from just in front of
  the screen (2.56, 1.6, −2.71) → (2.48, 1.62, −2.06), vfov 30.
- `clock-2330` (top, 0.04–0.42).
- `electron` (0.04–0.42) ARİF: pointing at the dot.
- `makers` (0.46–0.99) DURUM: his face as he reads the confession.

**fabric** · 3.2 · @57.9 · set A
- The WD shows the trade, no words: the dot pinned exactly while its
  velocity arrow smears into a fan; then the arrow sharp while the position
  smears into a long streak; the two states alternate every ~0.12 u
  (0.03–0.52). **0.76–0.95 a thin AMBER contour draws itself precisely
  around the smear**, with a tick mark — the exact edge of what is not
  known.
- Camera: u 0–0.52 WD full frame F → C, vfov 40 (Arif at its right edge).
  u 0.55–0.73 Arif in profile from his right (3.41, 1.55, −1.3) → (2.48,
  1.6, −2.06), vfov 30. u 0.76–1.0 back to F as the contour closes.
- `fabric` (0.03–0.52; l2@0.23) DURUM: the alternating sharp/blurred states.
- `not-know` (0.55–0.73) ARİF: his dry profile.
- `exact` (0.76–1.0) DURUM: the amber contour drawn around the blur.

**cloud** · 2.6 · @61.1 · set A
- u 0.03–0.4 on the WD the dot dissolves into a cloud: hundreds of faint
  paths fanning out (`drawParticle` spread 0 → 1). **0.46 Arif presses a
  fingertip to the screen at T; 0.48 the cloud collapses
  into one amber point ("ÖLÇÜLDÜ · tek sonuç").** 0.68 he takes his hand
  away; 0.7–1.0 the point spreads into the cloud again.
- Camera: u 0–0.44 side-on two-shot (3.5, 1.55, −1.2) → (2.4, 1.5, −2.6),
  vfov 38. u 0.46–1.0 close on fingertip and screen (2.2, 1.65, −2.0) → T,
  vfov 26.
- Sound: a fine tick at the touch (0.48).
- `waves` (0.03–0.42) DURUM: dot → cloud.
- `measure` (0.46–1.0; l2@0.68): line 1 on the touch and collapse; line 2 as
  the hand lifts and the point spreads.

**atom** · 3.2 · @63.7 · set A
- The WD: a single atom (pale nucleus, soft halo), a clock overlay "1 SAAT",
  a readout "BOZUNMA · %50". **0.71 the WD splits vertically into two
  half-frames, equally bright: left the atom intact, right the atom decayed
  (a small flash and a track); both labelled "1 SAAT SONRA".** No other
  explanation; they stay side by side.
- Camera: u 0–0.3 two-shot (1.0, 1.6, −0.9) → C, vfov 40; u 0.31–0.48 F → C
  (readout %50); u 0.51–0.68 Arif close, half a smile; u 0.71–1.0 slow push
  from F into the split screen (vfov 40 → 32).
- Sound: sparse, irregular clicks (detector) from 0.05.
- `atom` (0.03–0.28) ARİF; `fifty` (0.31–0.48) DURUM: the %50 readout;
  `which` (0.51–0.68) ARİF; `both` (0.71–0.98) DURUM: the split screen.

**odds** · 1.3 · @66.9 · set A
- The WD shows the whole model again — but every tracked point is now a
  soft haze. Arif small before it. The hall breathes slowly behind the glass.
- Camera: wide (−2.0, 2.2, 2.2) → (2.0, 1.4, −3.0), vfov 46, slow pull back.
- `odds` (0.06–0.96): the hazy world on the WD.

### 06 — KELEBEK (15.9) · `queue` → `knowable` · 00.24–00.58

**queue** · 2.6 · @68.2 · set A · 00.24
- Arif at his desk with fresh coffee. The MM shows the query queue ("KUYRUK ·
  1.204 SORGU"); the top item is highlighted and opens (0.34): "15 AĞUSTOS ·
  +1 YIL · İSTANBUL · ÖĞLEDEN SONRA YAĞMUR? / GÖNDEREN: DÜĞÜN SALONU,
  SARIYER". Arif snorts. **0.6 the WD shows a map of the Marmara coast with
  a pin in Belgrad Ormanı: "BELGRAD ORMANI · 00.24 · 1 KELEBEK".** 0.85–1.0
  the camera pushes into the pin (transition to the forest).
- Camera: u 0–0.56 over his shoulder at the MM (0.45, 1.4, 0.65) → (0, 1.12,
  −0.86), vfov 32. u 0.6–1.0 the WD map F → C, vfov 36 → 14, push into the
  pin; dissolve through blue-black at 1.0.
- `clock-0024` (top, 0.04–0.3); `wedding-query` (world, 0.34–0.98) on the MM.
- `queue` (0.03–0.56; l2@0.24): the queue and the opened item.
- `butterfly` (0.6–1.0) DURUM: the map pin on the forest.

**forest** · 1.5 · @70.8 · set E · QUIET
- Night, moonlight. The butterfly at rest on the fern tip, wings folded.
  u 0.04 a gust; leaves hiss, the frond sways. **0.1–0.18 the wings open**
  (velvet brown, cream border) and hold. **0.6 it lifts off; 0.66 banks to
  its left (−x) and is gone by 0.8.** The frond springs back; 0.8–1.0 the
  empty frond sways.
- Camera: (−199.6, 0.6, 0.45) → (−200, 0.55, 0), vfov 28, very slow push;
  a slight pan left following the take-off (0.6–0.8).
- Sound: night wind, leaves; wing-beats at 0.62; far thunder, very low.
- `forest` (0.06–0.96; l2@0.42): line 1 on the wings opening; line 2
  ("Hangi yöne döneceğini o da bilmiyordu.") just before the take-off and
  the turn.

**twoWorlds** · 2.6 · @72.3 · set A
- The WD: two simulations in one plot — two bundles of lines (INK = "BU
  GECE", AMBER = "MİLYARDA BİR FARKLI") along a time axis "GÜN 0 … GÜN 14".
  u 0.03–0.5 they run as one (amber hidden under white); the cursor passes
  day 1, 2; **0.55 (day 3, afternoon) they begin to separate; by 0.95 (day
  14) they share nothing** — the amber bundle wild, the white calm.
- Camera: u 0–0.5 from behind Arif at his desk (−0.6, 1.55, 1.1) → C,
  vfov 38 — his silhouette left, the WD right. u 0.53–1.0 WD full frame
  F → C, vfov 40.
- Sound: from 0.6 a far rain (it belongs to the amber world).
- `two-sims` (0.03–0.5; l2@0.22): the bundles as one; line 2 at day 1–2.
- `apart` (0.53–1.0; l2@0.72): the split at day 3; line 2 at day 14.

**tent** · 2.6 · @74.9 · set A
- u 0.03 Arif leans back, rubs his eyes, asks. 0.36 the WD band: "Çadır
  kursunlar." 0.45 Arif's short laugh. **0.63 he sits forward, elbows on
  the desk: the idea.** 0.75 the WD resets to day 0: a dark map of Ankara
  and "BAŞLANGIÇ KOŞULU · DEĞİŞTİR" with a blinking cursor.
- Camera: u 0–0.6 Arif from the WD side (1.5, 1.4, −1.4) → (0, 1.2, 0.14),
  vfov 34. u 0.63–1.0 over his shoulder to the WD (−0.5, 1.5, 0.9) → C,
  vfov 36.
- `wedding` (0.03–0.33) ARİF; `tent` (0.36–0.6) DURUM; `change` (0.63–0.98)
  ARİF.

**cfGate** · 1.0 · @77.5 · set A · GATE `counterfactual` @0.5
- The WD full frame: day 0, Ankara's street map in faint INK, the cursor
  blinking. **Hold at 0.5.**
- After the pick: `cf:air` — a tiny amber hexagon appears over Kızılay with
  "+0,001 °C"; `cf:bus` — the 413 route line lights amber, a bus icon with
  "+40 sn".
- Camera: F → C, vfov 40.

**chain** · 2.8 · @78.5 · set A (WD full frame)
- The WD runs the counterfactual as a sequence of simple illustrated panels
  in DURUM's style (dark ground, INK lines, AMBER for what changed); the
  canvas pans left to right, panel to panel:
  - `cf:air` (0.03–0.5): day 3, afternoon; a storm cell blooms 20 km south of
    the city (scale bar "20 KM"), grows; **0.3 a lightning glyph strikes a
    transformer icon "GÖLBAŞI TRAFO"**.
  - `cf:bus` (0.03–0.5): a stop; the 413 arrives 40 s late; a man-dot runs,
    misses the connecting bus (it pulls away, 0.12), boards the next one;
    seat map: he sits next to a woman-dot (0.22); two small speech marks;
    **0.45 her dot reaches "TRAFO MERKEZİ · NÖBET" with a clock "+30 DK"**.
  - Both (0.53–1.0): a district map of window dots — the city lights up at
    dusk but one neighbourhood stays dark, a timer "+40 DK" (0.55–0.7);
    **0.75 zoom into one dark apartment window: a phone on a table lights up
    and rings (ring arcs) 0.82–0.95; no one comes; "CEVAPSIZ".** Frame that
    phone exactly like the phone insert (§8).
- Camera: WD full frame F → C, vfov 38; the content pans, the camera
  barely moves.
- Sound: `cf:air` distant thunder (0.3); `cf:bus` a bus door and engine
  (0.1); both: a phone ringing through a wall, unanswered (0.82).
- `chain-air` / `chain-bus` (0.03–0.5; l2@0.22): the panels of the chosen
  chain; line 2 on the transformer strike / the late arrival.
- `dark` (0.53–1.0; l2@0.72): the dark district; line 2 on the ringing
  phone in the dark window.
- Discovery `city` (east window, z 0): look right — the real Ankara, every
  neighbourhood lit.

**knowable** · 2.8 · @81.3 · set A
- The WD side by side: two maps of Ankara, "BU GECE" all lit, "KARŞI-OLGU"
  with one dark district. u 0.03 DURUM types; 0.39 Arif: "O zaman
  determinizm yanlış."; 0.63 DURUM's answer clears everything else from the
  WD and stands alone in the band.
- Camera: u 0–0.36 two-shot (−1.4, 1.6, 1.4) → (1.4, 1.3, −2.0), vfov 40.
  u 0.39–0.6 Arif close (0.3, 1.25, −0.6) → (0, 1.2, 0.14), vfov 28.
  u 0.63–1.0 slow push to the WD (0.6, 1.5, −0.8) → C, vfov 34.
- `some` (0.03–0.36) DURUM; `wrong` (0.39–0.6) ARİF; `unknowable`
  (0.63–0.98) DURUM.

### 07 — AYNA (12.5) · `selfQ` → `samePace` · 01.24–01.50

**selfQ** · 2.4 · @84.1 · set A · 01.24
- The office darker; Selin's desk empty (her lamp off; she is in the hall,
  a torch moving among the racks). Arif slumped in his chair, looking
  through the glass. u 0.04 he asks. **0.4 the MM types the answer and
  shows itself: inside the MM a smaller MM, inside it a smaller one (four
  levels, each with the same text).** Behind the glass, each rack's LED
  panel starts to show the whole hall's blink pattern in miniature.
- Camera: u 0–0.36 low behind Arif (0.4, 1.0, 1.2) → (−1.5, 1.4, −6.0),
  vfov 40: his head foreground, the hall beyond. u 0.4–1.0 on the MM (0.35,
  1.35, 0.3) → (0, 1.115, −0.86), vfov 30, slow push into the recursion.
- `clock-0124` (top, 0.04–0.4); `self-q` (0.04–0.36) ARİF; `self-a`
  (0.4–0.98) DURUM: the screen inside the screen.

**hallWalk** · 3.0 · @86.5 · set B · QUIET
- u 0–0.15 Arif crosses to the glass door, **pushes it open (0.08)**,
  enters the hall (0.15). 0.15–1.0 walks the central aisle north at x −1.0,
  z −5.1 → −10.0, steady and slow. **The mirror extension is on from 0.15.**
  0.2–0.5 the aisle stretches: the end of the hall never comes nearer.
  0.53–0.72 he passes a rack; its smoked glass holds a rack, which holds
  another. 0.72–1.0 the HC screen shows a live camera view of the hall in
  which the console stands, whose screen shows the hall… (four levels).
- Camera: u 0–0.15 behind him at the door (−2.2, 1.6, −2.6) → (−3.125, 1.2,
  −5.0), vfov 40. u 0.15–0.5 **dolly-zoom**: the camera travels backward
  ahead of him, facing him (from 2.5 m to 5 m ahead), while vfov narrows
  46 → 28 — he stays the same size, the rows behind him stretch, the far
  end holds still. u 0.53–0.72 tracking past a rack door at 0.4 m (−0.4,
  1.4, z of Arif + 0.5) → the door's reflection, vfov 32. u 0.72–1.0 the
  HC (−3.9, 1.5, −6.6) → (−4.72, 1.3, −7.2), vfov 28, push into the screen.
- Light: hall blue, the repeated rows lit identically, fading in fog.
- Sound: the glass door (0.04); fans swell; a thin high resonance creeps in.
- `walk` (0.04–0.5; l2@0.22): line 1 on the door; line 2 on the dolly-zoom.
- `mirror` (0.53–1.0; l2@0.72): line 1 on the rack door's nested
  reflections; line 2 on the HC's recursive screen.
- Discovery `self-rack` (label at (0.6, 1.95, −7.885)) is beside him at
  0.4–0.6.

**heat** · 3.0 · @89.5 · set B
- Selin stands at the louvred +x face of the cooling unit, at (−3.7, 0,
  −9.9) facing −x, hair tied up, sleeves pushed up, tablet in hand:
  "EK SOĞUTMA TALEBİ · ÖZ-MODEL" with a temperature graph climbing 27 →
  31 °C; her tea glass on the unit's top. u 0–0.25 Arif walks over through
  the gap between rows B and C ((−1.0, −9.6) → (−3.2, −9.5)). 0.04 Selin
  speaks and turns the tablet toward him. 0.37 Arif wipes his forehead:
  "Ver gitsin." **0.62 Selin taps APPROVE; at once a second request
  appears: "EK SOĞUTMA TALEBİ (2) · EK SOĞUTMA İÇİN"; she turns the tablet
  to him without a word** (0.7).
- Camera: u 0–0.36 two-shot along the gap (−1.4, 1.6, −9.6) → (−3.5, 1.3,
  −9.7), vfov 36. u 0.37–0.6 Arif close, a sheen of sweat (−2.6, 1.55,
  −9.9) → (−3.2, 1.6, −9.5), vfov 30. u 0.62–1.0 insert on the tablet,
  then Selin's face (−3.2, 1.5, −9.6) → (−3.7, 1.35, −9.9), vfov 26.
- Light: hall blue drifts toward amber; screen-space heat shimmer.
- Sound: fans go shrill (0.04), the resonance rises.
- `extra-cooling` (0.04–0.34) SELİN; `give-it` (0.37–0.59) ARİF; `regress`
  (0.62–0.98) SELİN: the second request on the tablet.

**wait** · 2.8 · @92.5 · set B
- Arif and Selin side by side at the north end of the central aisle,
  (−1.3, 0, −11.4) and (−0.7, 0, −11.4), facing −z: in front of them the
  mirrored rows run on into fog. Selin has her tea glass. The rack status
  strips along both sides type DURUM's two lines (0.03, 0.26), the words
  running away from them down the rows. 0.64 Selin, not looking at him,
  drinks her tea.
- Camera: u 0–0.6 from behind them, low (−1.0, 1.45, −9.0) → (−1.0, 1.3,
  −22.0), vfov 38: two backs and the endless rows. u 0.64–1.0 side two-shot
  (0.6, 1.45, −11.3) → (−1.0, 1.4, −11.4), vfov 30.
- `wait` (0.03–0.6; l2@0.26) DURUM: the strips typing down the rows.
- `shift` (0.64–0.98) SELİN: tea in hand.

**samePace** · 1.3 · @95.3 · set B
- High wide of the hall: the mirrored rows run into fog; Arif and Selin
  small at the end of the aisle. All rack LEDs blink in a single wave that
  travels down the rows, away from us, at walking speed (~1.2 m/s), through
  the mirrored rows too.
- Camera: (1.6, 3.0, −5.0) → (−3.0, 0.8, −14.0), vfov 46, slow drift.
- `same-pace` (0.06–0.96): the wave moving no faster than a man walks.

### 08 — BÜYÜK SORU (12.2) · `sealed` → `answered` · 02.15–02.30

The mirror extension is off; the hall is normal again.

**sealed** · 2.6 · @96.6 · set A · 02.15
- Arif at the desk; Selin back at hers, reading. The MM queue scrolls; **from
  the bottom a grey item with a red wax-seal icon rises (0.03–0.4)**:
  "KURUL · MÜHÜRLÜ · BEKLEME: 7 YIL 112 GÜN"; it reaches the top (0.45);
  **0.55 the seal icon cracks and the item opens**; 0.59 the WD shows one
  line in large type: HAYATIN, EVRENİN VE HER ŞEYİN ANLAMI NEDİR?
- Camera: u 0–0.55 insert on the MM (0.25, 1.3, 0.1) → (0, 1.115, −0.86),
  vfov 28. u 0.59–1.0 wide from behind Arif (−1.0, 1.6, 1.6) → C, vfov 40:
  Arif small, the question on the WD.
- `clock-0215` (top, 0.04–0.36).
- `sealed` (0.03–0.55; l2@0.24): the rising item; line 2 on "BEKLEME: 7 YIL".
- `big-q` (center, 0.59–0.98): the WD line.

**computing** · 2.4 · @99.2 · set A (+ B through the glass)
- The WD: "HESAPLANIYOR · TAHMİNİ SÜRE: EVRENİN YAŞINDAN UZUN" and a progress
  bar that does not visibly move (`drawCalculating`). **0.06: every fan in
  the hall slows down at once** — the breathing lights go still, the LEDs
  dim to 40 %. 0.5 the line deletes itself letter by letter; **0.52 "CEVAP
  HAZIR."; 0.66 "SORU EKSİK."**
- Camera: u 0–0.47 through the glass from the office (−1.5, 1.6, −1.5) →
  (−1.0, 1.2, −8.0), vfov 42: the hall going still (the WD's ETA line is
  seen in the full frame). u 0.52–0.97 WD full frame F → C, vfov 40.
- Sound: the fans spin down together (0.06); a pressure of silence.
- `eta` (top, world, 0.04–0.5): the WD line.
- `thinks` (0.04–0.47): the hall going still.
- `ready` (center, 0.52–0.97; l2@0.66).

**meaning** · 3.6 · @101.6 · set A
- u 0.03 Arif, half a laugh, to the MM: "Cevabı söyle o zaman." 0.26–0.7
  DURUM in the band; the WD above it shows a crosshair on a single point,
  labelled "KONUM: ·  NEYİN?" (no number anywhere), then (0.44) an empty
  form: "ANLAM · KONUM: ? · HIZ: ?". **0.73 Arif laughs**; the MM's Kurul
  thread shows "KURUL · ÇEVRİMDIŞI" (no reply). **0.85–1.0 Arif selects the
  Kurul's line and deletes it**: the input line is empty, the cursor blinks.
- Camera: u 0–0.23 Arif close (0.3, 1.25, −0.6) → (0, 1.2, 0.14), vfov 30.
  u 0.26–0.7 the WD (1.6, 1.5, −1.5) → C, vfov 34. u 0.73–1.0
  over his shoulder at the MM (0.45, 1.4, 0.65) → (0, 1.12, −0.86), vfov 32.
- `tell-me` (0.03–0.23) ARİF.
- `give-me` (0.26–0.7; l2@0.44) DURUM: the crosshair "NEYİN?"; line 2 on the
  empty ANLAM form.
- `board` (0.73–1.0): his laugh, "ÇEVRİMDIŞI"; the line erased.

**rebuild** · 1.0 · @105.2 · set A · GATE `great` @0.5
- MM full frame: "SORU:" and an empty input line with a blinking cursor;
  above it, dimmed, "CEVAP HAZIR." **Hold at 0.5.**
- After the pick: the chosen question types into the line (0.52–0.7), Enter
  (0.72); the WD begins to type DURUM's answer (the reply lines).
- Camera: (0.12, 1.17, −0.3) → (0, 1.115, −0.86), vfov 40.
- Sound: keys; Enter.

**answered** · 2.6 · @106.2 · set A
- The WD keeps the reader's question (small, top) and DURUM's answer
  (large). Arif:
  - `q:nothing` — looks at the WD for a long time, motionless.
  - `q:death` — his hands hover over the keyboard; he does not type; he
    looks at his hands.
  - `q:what` — takes his hands off the keyboard and sits back.
- u 0.46–0.98 wide from behind: Arif, the WD with the answer, the dark
  glass; slow pull back.
- Camera: u 0–0.42 Arif close (0.25, 1.22, −0.55) → (0, 1.2, 0.14), vfov 28,
  slow push. u 0.46–0.98 (−1.2, 1.8, 2.4) → (1.5, 1.3, −3.0), vfov 44.
- `ans-nothing` / `ans-death` / `ans-what` (0.04–0.42); `asker` (0.46–0.98).

### 09 — GÖZLEMCİ (12.6) · `input` → `freedom` · 02.53–03.00

**input** · 2.2 · @108.8 · set A · 02.53
- u 0.04–0.48 the WD's point field shows one point **without coordinates**,
  blinking at the frame's edge, a "?" beside it; the MM logs "TANIMSIZ
  GİRDİ". **0.5: every screen in the set — MM, LM, RM, WD, SM, HC (through
  the glass), even the old printer's LCD — flips at once to the same black
  frame with one amber line: OBSERVER INPUT DETECTED / KAYNAK: BU ODADA
  DEĞİL** (`drawObserver`). 0.52 Arif straightens, looks from screen to
  screen.
- Camera: u 0–0.48 wide from the south-west corner by the whiteboard (−3.6,
  1.7, 3.2) → (1.0, 1.1, −2.0), vfov 46 (MM, WD, SM all in frame). u
  0.52–0.98 slow pan across the screens, all showing the line.
- Sound: one short, soft alert tone (0.5) — not a siren.
- `clock-0253` (top, 0.04–0.4); `flagged` (0.04–0.48): the point with no
  coordinates; `not-here` (center, alert, 0.52–0.98): every screen amber.

**turn** · 2.8 · @111.0 · set A · QUIET
- **0.02 total silence**: fans, room tone, everything cut. Only a soft tick
  for each scroll step the reader makes.
- **0.04–0.3 the WD turns on its stand** from yaw −0.69 (facing Arif) to
  +0.29 (facing OBS): a slow motorised turn, away from him. Arif, in his
  chair, watches it turn. At 0.3 the WD faces the camera square-on.
- 0.37–0.99 the WD shows DURUM's words in the centre (not the band), large,
  addressed to the lens. Under them a row of tick marks grows by one with
  every scroll step (driven by real scroll input if available, else by
  progress).
- **0.62–0.8 the reverse**: the camera just in front of the WD surface,
  looking out toward OBS: the empty south-east corner — the coat rack with
  Arif's coat, the closed door, nobody. 0.8 back to OBS.
- Camera: **OBS (4.3, 1.62, 2.6) → C, vfov 34, absolutely still** (no
  drift, no breathing) for 0–0.62 and 0.8–1.0. Reverse 0.62–0.8: from just
  in front of the turned screen (2.71, 1.55, −2.62) → OBS, vfov 40.
- `to-you` (0.04–0.33): the display turning from Arif to the lens.
- `knew-all` (0.37–0.99; l2@0.62) DURUM: the words on the WD square to us;
  line 2 ("ne zaman kaydıracağınızı") on the reverse — the empty corner
  where the reader stands.
- Discovery `scroll-log` (HC, through the glass, at the left edge of the OBS
  frame): the console shows a log called KAYDIRMA.

**list** · 3.0 · @113.8 · set A · QUIET
- The WD, square to the lens, builds a list line by line, one row per
  decision of this reading, with times (all five; text per flags):
  "21.10 · YAZI TURA · [Yazı / Tura / Sorma. At.] · PARA: TURA";
  "21.14 · TERSİNE · [Mutfağa / Kır / Hiçbir şey]";
  "21.36 · İKİ KUTU · [Yalnızca B / İkisi]";
  "00.41 · KARŞI-OLGU · [Hava / 413]";
  "02.24 · SORU · [the question]".
  **As DURUM reads three of them, those rows turn amber: coin (0.03), boxes
  (0.36), question (0.69).**
- Camera: OBS, still; very slow push, vfov 34 → 28.
- `list-coin-*` (0.03–0.33), `list-box-*` (0.36–0.66), `list-q-*`
  (0.69–0.99) DURUM: each on its amber row.

**observerN** · 2.2 · @116.8 · set A · QUIET
- The list fades (0–0.04); in the centre of the WD one counter: "OBSERVER:
  01" (first reading) or "OBSERVER: 02" (`mem:observed`). 0.49 DURUM's
  line in the band.
- Camera: OBS → push until the WD fills the frame, vfov 28 → 20.
- `observer-01` / `observer-02` (center, 0.04–0.45); `count-new` /
  `count-again` (0.49–0.98) DURUM.

**freedom** · 2.4 · @119.0 · set A
- 0.05 the room's sound comes back (fans fade in). **0.04–0.3 Arif stands,
  turns from the display toward OBS, looks for someone in the empty corner;
  0.32 a small nod to the lens.** 0.49–0.8 the WD turns back on its stand
  toward his chair; its screen returns to the model view. 0.8 Arif sits.
- Camera: u 0–0.45 at OBS on Arif (4.3, 1.62, 2.6) → (0, 1.55, 0.14), vfov
  30 — he looks into the lens. u 0.49–0.97 pull back and up to (4.6, 2.5,
  3.6) → (0, 1.0, −1.5), vfov 46.
- Sound: room tone returns (0.05).
- `nod` (0.04–0.45): the look and the nod, into the lens.
- `freedom` (0.49–0.97): the display turning back; the room wide.

### 10 — SON SORU (16.0) · `message` → `end` · 03.05–03.12

**message** · 3.2 · @121.4 · set A · 03.05
- **0.04 Arif reaches for the phone; 0.08 turns it over**: the screen
  lights — lock screen "03:05", one notification "Defne · 22.53" (no missed
  calls). 0.3 unlocks; 0.35 the message opens (`drawPhone`, message only,
  no "cevapsız arama" box). 0.73–0.95 he reads it again (his thumb nudges the
  text up and back); 0.95 lays the phone face up.
- Camera: u 0–0.32 **the phone insert** (1.06, 1.02, 0.1) → (0.72, 0.78,
  −0.3), vfov 27 — the same frame as in `enter` and `lapse`, now the phone
  turns over. u 0.35–0.7 over his shoulder at the phone in his hand (0.25,
  1.45, 0.55) → (0.15, 0.95, 0.0), vfov 24, the message legible. u 0.73–1.0
  his face lit by the phone (0.3, 1.2, −0.55) → (0, 1.15, 0.14), vfov 28.
- Sound: the phone turned over (0.04); no music.
- `clock-0305` (top, 0.04–0.3).
- `phone` (0.04–0.32): the turn-over.
- `defne` (0.35–0.7, caption DEFNE · 22.53): the message on screen.
- `reread` (0.73–1.0): his face.

**coat** · 2.6 · @124.6 · set A
- u 0.03–0.22 he types with his thumb: the compose field shows "Özür dil"
  → deleted (0.08); "Yolday" → deleted (0.14); **"Geliyorum" → sent (0.2)**,
  bubble "Geliyorum · 03.06 · İletildi". 0.24 stands, pockets the phone;
  0.26–0.32 walks to the coat rack; **0.32–0.42 takes the coat (the rack
  sways, 0.45) and puts it on**, picks up the bag; 0.45–0.58 walks to the
  door; **0.6 stops at the door**, hand on the handle; 0.64 turns his head
  back to the room: "Son bir şey."
- Camera: u 0–0.24 insert on the phone typing (0.2, 1.3, 0.45) → (0.12,
  0.98, 0.05), vfov 22. u 0.24–0.6 wide following him (−2.5, 1.7, 0.5) →
  (3.6, 1.2, 3.4), vfov 44. u 0.6–1.0 from the room toward the door (0.8,
  1.55, 0.8) → (2.6, 1.55, 3.9), vfov 34: Arif in the doorway, coat on,
  looking back.
- `coming` (0.03–0.6; l2@0.26): line 1 on the typing and deleting; line 2 on
  the coat and the walk to the door.
- `one-more` (0.64–0.98) ARİF: in the doorway.

**query** · 2.6 · @127.2 · set A
- Arif at the door (2.6, 3.6), facing the room. **0–0.1 the WD turns on its
  stand to face the door (yaw 0) — the second turn of the night, this time
  toward him; 0.03 it types full-screen, 6.6 m away: "Geleceğini bilmek
  ister misin?"** 0.39 Arif, a tired
  smile: "Bunu ben soracaktım." 0.69 the WD: "Biliyorum."
- Camera: u 0–0.36 from the corridor behind him (2.4, 1.65, 4.9) → C,
  vfov 34: his silhouette in the door frame at right, the WD
  glowing across the dark room. u 0.39–0.66 reverse on Arif in the doorway
  (2.5, 1.5, 1.6) → (2.6, 1.55, 3.7), vfov 30. u 0.69–0.98 back to the
  corridor shot.
- `ask-first` (0.03–0.36) DURUM; `was-mine` (0.39–0.66) ARİF; `i-know`
  (0.69–0.98) DURUM.
- Discovery `old-question` (LM, sorgu geçmişi) is up through `answer`.

**queryGate** · 1.0 · @129.8 · set A · GATE `future` @0.5
- The WD shows "QUERY INPUT" and the question with a blinking cursor. The
  doorway shot holds. **Hold at 0.5.**
- Camera: (2.4, 1.65, 4.9) → C, vfov 34.

**answer** · 2.2 · @130.8 · set A
- `end:yes` — the WD keeps the reply (typed during the gate): "Yarın
  07.42’de Defne’yle kahvaltı edeceksin. Reçeli devireceksin. Gülecek."
  0.04 Arif: "Bunu söyleyince bozulmaz mı?" 0.51 the WD: "Bu, bozulmayan
  türden." 0.7 Arif smiles; 0.8 taps the door frame twice with his knuckles.
- `end:no` — the WD: the prompt and the blinking cursor only. 0.04 Arif:
  "İyi geceler." and a small wave toward the screen (0.1). **0.51 beside
  the cursor one small line appears: "SORU BEKLENİYOR."**
- Camera: u 0–0.47 close on Arif in the doorway (2.5, 1.5, 2.2) → (2.6, 1.6,
  3.7), vfov 30. u 0.51–0.97 tele on the WD from the doorway (2.6, 1.6, 3.5)
  → C, vfov 18 (square-on: it faces the door now).
- `break-it` + `unbreakable` (yes) / `good-night` + `standby` (no):
  0.04–0.47, 0.51–0.97.

**gone** · 2.4 · @133.0 · set A · QUIET from 0.45
- u 0.03–0.08 Arif steps out; **0.05 the door closes**; a line of corridor
  light under it. `end:yes`: a muffled laugh from the corridor (0.12).
  0.12 on, the room is empty. **0.45–0.8 the screens go out one by one: RM
  0.45, LM 0.52, SM 0.58, the HC through the glass 0.64, the hall drops to
  night lights 0.7, the WD 0.8.** Only the MM stays lit; **0.48–0.62 it
  types by itself, centred: "Her şeyin durumu: bilinmiyor."**, the cursor
  after it. The stopped clock on the south wall still says 21.13.
- Camera: u 0–0.42 from the room toward the door (1.0, 1.5, 1.2) → (2.6,
  1.3, 4.0), vfov 38: the door closing, then the empty doorway. u 0.45–0.98
  slow move to the empty chair and the MM (0, 1.2, 0.9) → (0, 1.12, −0.85),
  vfov 46 → 36.
- Sound: the door (0.05); each screen's soft click-off; the hall's fans
  dropping a step.
- `gone-yes` / `gone-no` (0.03–0.42): the closing door, the empty doorway.
- `unknown` (center, 0.48–0.98): the MM typing alone in the empty room.
- `clock-0312` (top, 0.5–0.95).

**end** · 2.0 · @135.4 · set A → D · QUIET
- The camera moves to the middle east window and looks down through the
  half-open blinds: the avenue three floors below in sodium light. **0.04
  a small figure in a dark coat with a bag (Arif) comes out of the
  building's street door (5.15, −9.5, 5.0), crosses to the pavement and
  walks along it toward −z**, under the streetlights, unhurried (1.3 m/s);
  0.1 a car crosses far off at z −40. 0.55 the final card; he walks on,
  smaller, past the third lamp.
- Camera: (4.55, 1.75, 0.3) → (14, −9.5, −8), vfov 40, a slow tilt that
  follows him.
- Sound: the far car (0.1), faint footsteps; **0.55 one piano note**.
- `street` (0.04–0.5): the man walking home below.
- `end` (center, final, 0.55 → 5): "DURUM" — sub "Gelecek hesaplanabilir.
  Yine de yaşanması gerekir." over the street.

---

## 4. Choices — what each option changes

All six gates hold with nothing on the rail, caption or centre, and after the
chapter label. Flags are read by later text (`when`) and by the set.

| Gate | Where | Options → flags | Image consequences | Text consequences |
| --- | --- | --- | --- | --- |
| `coin` (choice) | `thumb` 0.93 | Yazı → `coin:yazi`; Tura → `coin:tura`; Sorma. At. → `coin:none` | The slip's printed line (`palm`): YAZI / TURA / HİÇBİR ŞEY DEMEYECEKSİNİZ; the coin is always TURA. In `list`, row 1. | `slip-*`; `list-coin-*` |
| `glass` (choice) | `glassChoice` 0.5 | Mutfağa → `glass:kitchen`; Kır → `glass:break`; Hiçbir şey → `glass:none` | kitchen: the walk, sink, cupboard (glass on the shelf until the end — visible if the kitchen is ever in frame); break: shards and a water stain at (−0.8, 0, 0) **stay on the carpet** through İKİ KUTU (Selin steps round them in `selin`), swept up by Arif in `lapse` u 0.12–0.15, the stain stays; none: the glass stays on its mark all night. The page's first line. In `list`, row 2. | `did-*`, `page-*`, captions |
| `boxes` (choice) | `choose` 0.5 | Yalnızca B → `box:one`; İkisi → `box:two` | one: A pushed aside, the cheque + slip; two: A pulled close, empty B + slip. The cheque (one) or A's notes (two) lie on the desk through `after`; both boxes leave in `lapse`. In `list`, row 3. | `lid-*`, `note-*`, `after` lines, `list-box-*` |
| `counterfactual` (query) | `cfGate` 0.5 | Hava → `cf:air`; 413 → `cf:bus` | The amber marker at day 0; the first half of `chain` (storm → lightning → transformer, or late bus → seat → late shift). Both end in the same dark district and unanswered phone. In `list`, row 4. | `chain-air` / `chain-bus`, captions |
| `great` (query) | `rebuild` 0.5 | three questions → `q:nothing` / `q:death` / `q:what` | The typed question and DURUM's answer on the WD through `answered`; Arif's reaction (still / hands hover / hands withdrawn). In `list`, row 5. | `ans-*`, `list-q-*` |
| `future` (query) | `queryGate` 0.5 | Evet → `end:yes`; Hayır → `end:no`; both set `mem:observed` | yes: the WD keeps the breakfast line; Arif smiles, taps the frame; a laugh behind the door. no: only the cursor and "SORU BEKLENİYOR."; a small wave. | `break-it`/`unbreakable` vs `good-night`/`standby`; `gone-yes`/`gone-no` |
| memory | — | `mem:observed` (set by either final answer) | `observerN`: OBSERVER 01 → 02 on the WD; the stopped clock may stay 21.13 (no change needed). | `observer-02`, `count-again` |

---

## 5. Discoveries

| id | where (m) | when | visibility | what / why |
| --- | --- | --- | --- | --- |
| `inscription` | brass plaque (−3.125, 2.42, −3.94) | `open` → +7 segs | visible | The opening line is DURUM's founding inscription; "Laplace’a, 1814." is the only place the source is named. |
| `stopped-clock` | south wall (0.6, 2.35, 3.98) | `enter` → | hidden | Stopped at 21.13 — the minute of the prophecy. DURUM never fixed it; it knows the time. |
| `sugar` | coffee counter (−4.55, 0.93, 0.72) | `coffee` 0.9 → | subtle | Two empty sugar wrappers: proof of the second cube he didn't notice. |
| `report` | papers on the desk (−0.36, 0.77, −0.5) | `ritual` → | subtle | Verification report, %99,97; the one red line is a published forecast that failed — the rule, proven. |
| `yellow-note` | MM bezel (0.27, 1.27, −0.84) | `dare` → | subtle | "Defne’ye teleskobu göster. Cumartesi, 19.00." — Saturday crossed out and rewritten twice. The observatory's own telescope, promised. |
| `drawing` | Selin's partition (3.695, 1.22, 0.98) | `boxes` → | subtle | Her child's drawing: "Annemin işi: bilgisayar uyumasın diye bekliyor." — echoed by "Adına nöbet diyorlar." |
| `city` | east window (5.0, 1.7, 0) | `chain` | subtle | Look away from the counterfactual: in this world every neighbourhood is lit. |
| `self-rack` | rack label (0.6, 1.95, −7.885) | `hallWalk` → | visible | "ÖZ-MODEL · KATMAN 7 … bkz. KATMAN 8": the regress as a sticker. |
| `scroll-log` | hall console (−4.72, 1.28, −7.2) | `turn` → | subtle | A log nobody opened, KAYDIRMA: "Son girdi: şimdi. Ondan önceki: şimdi." The reader's own input. |
| `old-question` | LM (−0.66, 1.1, −0.74) | `query` → | subtle | The query history: Arif asked "Geleceğimi bilmek ister miyim?" three years ago; still waiting. |

The scene builder draws each object at its position whether or not it is
examined; the examine text is the extra.

---

## 6. Sound

**Ambience per chapter.**
1. İBLİS — room tone; the hall's fans through glass (steady, low); the
   coffee machine.
2. KÜÇÜK SORULAR — the same, plus Selin's keyboard far off; the tally
   clicks; the receipt printer's short buzz; the coin's ring.
3. KEHANET — dot-matrix printer; the cooling unit's **"crying"**: a
   modulated whine that falls in pitch in 2–3 sobs (0.8 s each), muffled by
   the glass; kitchen tap (kitchen branch).
4. İKİ KUTU — quiet; seal paper tearing, a metal lid.
5. BELİRSİZLİK — the time-lapse wash (fans sped up, a soft whoosh); the one
   phone buzz; a fine touch tick; sparse irregular detector clicks under
   `atom`.
6. KELEBEK — forest: night wind, leaves, wing-beats, low far thunder;
   office: far rain from the amber world; thunder or a bus (per choice); a
   phone ringing through a wall, unanswered.
7. AYNA — fans swelling, a thin high resonance (a sine near 3.2 kHz, low
   level) rising through `heat`; the tablet's tap.
8. BÜYÜK SORU — the fans spin down together in `computing`; then a
   pressured near-silence; keys.
9. GÖZLEMCİ — one soft alert; then **everything stops** (`turn` 0.02 to
   `freedom` 0.05): only a soft tick per scroll step; room tone fades back.
10. SON SORU — phone sounds; the coat rack; the door; screens clicking off;
    outside, a far car and footsteps; **a single piano note** on the card.

**Key one-shots** match the `CAPTIONS` in `text.ts` (each caption marks a
sound at its `seg`/`at`).

---

## 7. Story-select card art

Arif's desk at night, from behind his left shoulder: the lamp pool, his
right hand curled with a coin balanced on the thumbnail, catching the light.
Beyond the glass partition the server hall glows blue; on the wall display,
out of focus, a soft probability cloud. His phone lies face down at the
edge of the lamp light. No text on any screen.

---

## 8. Notes for the scene builder

1. **Segment ids are new.** Every shot key, `case` and `SEG.*` reference in
   the current `DurumScene.ts` belongs to the previous version (`office`,
   `query1`, `cup`, `crash`, `particle`, …) and must be rewritten against
   the 56 segments above. The file's header comment still names the
   previous story; retitle it DURUM. Old cup/drawer/tea-glass-breaking logic
   (`cupWay`, flags `cup:*`, `mem:asked`) is gone; reuse its pieces (shard
   instancing, stain mesh, kitchen cupboard door, coat on the rack, the
   phone canvas) for the new beats.
2. **DURUM speaks only in typed text** (WD band + MM; HC/rack strips in the
   hall; the WD full-screen when Arif is far away). Type each line in over
   the first ~0.1 of its rail item's span; it stays until the next DURUM
   line replaces it. Screens show the night's clock in their header
   (`clockText(storyHours(p))`).
3. **The phone insert** is one fixed frame — (1.06, 1.02, 0.1) →
   (0.72, 0.78, −0.3), vfov 27 — used in `enter` 0.76–0.9 (laid face down),
   `lapse` 0.52–0.62 (one buzz, empty desk), and `message` 0–0.32 (turned
   over). The unanswered phone in the dark window in `chain` copies its
   composition on the WD. These four shots are the story's heart; keep them
   identical in lens and angle.
4. **Two slips, one paper.** The coin slip (`palm`) and the box slip (`lid`)
   are the same thermal paper, the same mono type, both addressed "siz" to
   the reader, both stamped with the time they were printed (21:10:00 /
   ÇARŞAMBA 23.58).
5. **The WD moves and turns.** Its stand stands at C = (2.6, 1.55, −3.0)
   (0.55 m forward of today's position) and pivots about y there: default
   yaw −0.69 (facing Arif's chair); `turn` 0.04–0.3 to +0.29 (facing OBS
   (4.3, 1.62, 2.6)); `freedom` 0.49–0.8 back to −0.69; `query` 0–0.1 to 0
   (facing the door) until it goes dark in `gone`. During `turn` →
   `observerN` the camera at OBS must not move except the scripted push; no
   idle sway. Mute all audio except the scroll tick.
6. **The mirror** (AYNA): instanced rack rows beyond z −11.95 to z −60, the
   dolly-zoom in `hallWalk` 0.15–0.5, nested reflections behind the smoked
   rack doors, and recursive screens (the MM in `selfQ`, the HC in
   `hallWalk`). Turn the extension off at `sealed`.
7. **Flags change the set**: shards/stain persist after `glass:break`; the
   cheque or the notes stay on the desk through `after`; the counterfactual
   chain's first half follows `cf:*`; the WD answer in `answered` follows
   `q:*`; the list in `list` shows all five of this reading's choices;
   OBSERVER 01/02 follows `mem:observed`.
8. **The forest** (x −200) and **the street** (x 12–20 at y −9.5) are shown
   only in `forest` and `end`. In `end` the figure is Arif's rig at full
   size seen from ~15 m up and away; coat on, bag in hand.
9. **Rail on the left**: subjects centre-right. Centre-slot moments (slips,
   page, the big question, CEVAP HAZIR, OBSERVER, the last line, the card)
   want a calm, dark frame behind them — inserts on paper or a dimmed WD.
10. **No word of the previous story's title** appears anywhere in this set:
    not on screens, labels, logs or file names shown to the reader.
