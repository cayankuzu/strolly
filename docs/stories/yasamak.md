# YAŞAMAK — En Uzun ve En Kısa Veda · Screenplay

Source: the author's essay *Yaşamak: En Uzun ve En Kısa Veda* (death anxiety → the internet cafe →
uncertainty → "Yaşamak adlı ölümcül bir hastalık" → you cannot become nothing → the ones you love
leaving → living with someone fatally ill). Every idea of the essay is kept in its order (the "beni
bulmaz" sentence and the line about witnessing are moved into BİRER BİRER, where the departures show
them); the cafe of the essay is made literal and the people at the desks are the people of the
narrator's life.

Files: `src/stories/yasamak/timeline.ts` (segments, `skyAt`, timers) and `src/stories/yasamak/text.ts`
(every word, choices, discoveries, captions). This document is the contract for the set
(`src/three/yasamak/`) and the sound (`src/stories/yasamak/audio.ts`).

**80.5 screens, 36 segments, 8 chapters, 3 gates, 10 discoveries.** `SCREEN_VH` = 76.

## 1. Logline, tone, palette, light

**Logline.** At ten, a boy knows exactly what another half hour at the internet-cafe desk costs:
fifty kuruş. Decades later, at the same desk, the corner of his screen shows only a dash — and one by
one the people of his life stand up from the desks around him and walk out through the door behind his
back.

**Tone.** Warm, humane, quiet; never morbid. The departures happen in shot and without drama: a short
soft tone, a chair pushed back, a coat, the bell, a cold draft. Humour lives in the everyday (Emre's
"Tam da yenecektim!", the mother hitting her monitor). The image never lingers on grief; it lingers on
objects that stay (a cap, a lighter, a scarf).

**Palette.** Wood browns and plaster of the cafe; screen light is the key colour of the story:
child era = warm beige CRTs with a blue-green game glow and an **amber timer** (`#ffc77f`); adult era =
slim flat panels with a cooler glow (`#6d8fb8`), the dash `—` drawn in the same amber as the old timer.
Accent: the mother's scarf, **rust red** (`#a4472c`). The lock screen "SÜRENİZ DOLMUŞTUR" is a flat
dusty blue (`#2e4a6b`) with white type — the same for everyone, child and adult.

**Light by chapter** (`skyAt(p)` in the timeline returns season and time of day for the window):

| Chapter | Window / time | Room light |
|---|---|---|
| 01 NEFES | autumn night, wind, leaves | dark; one monitor; the door opens a wedge of sodium orange |
| 02 ÇOCUK | spring afternoon → dusk (from `dusk` 0.25) | sun through the window, dust motes, ceiling fan; dusk amber→blue, streetlights come on |
| 03 SÜRE | time-lapse (`years`), then autumn dusk | tungsten pendant lamps, flat panels |
| 04 ÖLÜMCÜL HASTALIK | autumn dusk → night (`look` 0.5) | full room, every screen lit |
| 05 BİRER BİRER | autumn night (`bulmaz`), winter day (`grandpa`), summer dusk (`friend`, `lighter`), winter night (`father`, `witness`) | lamps; the room thins |
| 06 HİÇLİK | winter night, snow | warm pools of lamp light on empty desks, the rest dim |
| 07 VEDA | grey late-winter day; time-lapse (`days`); pale early-spring morning (`instant`) | soft daylight |
| 08 İNADINA | spring afternoon, plane tree in new leaf | bright, full room |

## 2. World layout (meters)

Axes: x right, y up, z toward the default camera; seated people face −z (toward the window).
The whole story happens in **one set**: the cafe (previous build: `git show v1.2.0:src/three/yasamak/YasamakScene.ts`,
same room, desks and counter). Drop the space/black-hole group, the elder woman's corner and the tea
service of the old story.

- **Room:** x −6…6, z −5…5, height 3. Window wall z = −5 (window x −5…5, y 0.8–2.6), entrance wall
  z = +5 with the **door at x 3.5** (1.0 × 2.1, hinged on its left, opening inward; a two-tone bell
  above it at (3.5, 2.2, 4.95)).
- **Counter:** centre (−3.5, 0, 4.0), 2.4 wide × 0.7 deep × 1.05 high (x −4.7…−2.3, z 3.65…4.35,
  top at y 1.05). The cashier stands behind it at (−3.5, 4.75) facing −z.
- **Admin monitor:** on the **left end of the counter at (−4.3, 1.3, 4.0), its screen turned to face
  +x** (toward the room): Kemal reads it from beside it, a customer at the counter and anyone looking
  back from the desks sees it at an angle. Child era a beige CRT, adult era a flat panel.
- **The note** (adult era only): a yellowed sheet taped flat on the counter top at (−3.0, 1.06, 3.7),
  `SÜRE UZATMA YOKTUR` in marker.
- **Price board** (child era only) on the wall above the counter at (−3.5, 2.25, 4.94), 0.9 × 0.5:
  `1 SAAT · 1 LİRA / YARIM SAAT · 50 KURUŞ / ÇAY · 25 KURUŞ`, a pencilled line under it. In the adult
  era a paler rectangle on the plaster where it hung.
- **Wall clock:** (0, 2.3, 4.93) on the entrance wall, facing the room (behind everyone). It always
  runs; in time-lapses its hands spin.
- **Desks:** two continuous desk rows, top at y 0.765, 0.75 deep, a modesty panel on the window side.
  Monitors 0.5 × 0.31, centre y 1.0 (top edge ≈ 1.17), on the window side of each place.
  - **Row 1** — chairs z = 0.6, desk x −4.65…4.65, top centred z −0.15 (z −0.525…0.225), monitors at
    z −0.22: MASA 1 x −3.75 · MASA 2 x −2.25 · **MASA 3 x −0.75 (Emre; the boy at the end)** ·
    **MASA 4 x 0.75 (the narrator, always)** · **MASA 5 x 2.25 (the mother)** · MASA 6 x 3.75 (the
    young couple).
  - **Row 2** — chairs z = −1.6, desk x −5.4…5.4, top centred z −2.35, monitors at z −2.42:
    MASA 7 x −4.5 · MASA 8 x −3 · **MASA 9 x −1.5 (Dede)** · MASA 10 x 0 · **MASA 11 x 1.5 (Baba)** ·
    MASA 12 x 3 · MASA 13 x 4.5. From MASA 4 the narrator sees the backs of row 2 and their screens
    beyond them.
  - **Ways out:** row 1 people step back and walk the open floor behind row 1 (z 1…4.6) to the door.
    Row 2 people walk the corridor between the rows (z ≈ −1.0) to a side aisle (x −5.0 or 5.0),
    then up past the end of row 1 to the door. Long walks are covered by cuts (noted per segment).
- **The crack:** a 1 cm gap along the near edge of MASA 4's top; an old 50-kuruş coin sits in it at
  (0.4, 0.765, 0.2) from `years` on, in **both** readings (kid:home: his; kid:more: someone else's).
- **Outside the window:** street, plane tree at (−2.5, 0, −9), a facade at z −23. Seasons: leaves
  (spring green / summer dark green / autumn orange / winter bare + snow).
- **Two eras of dressing** (switch during `years` 0.5): child era = beige CRT monitors, game posters,
  ceiling fan, price board; adult era = slim black flat panels, a split AC unit, no posters, the note.
  Desks, chairs, counter, clock, door: unchanged ("Masa aynı masaydı").

**Every screen** has a corner readout at its lower right: `KALAN SÜRE` (small) over the value.
Child era: a real countdown (`kidSeconds`, `extraSeconds`). Adult era: the value is always `—`
(`NO_TIME`) for everyone, including the mother. The boy at the end has a real countdown again
(`boySeconds`). When someone's time ends, the whole screen becomes the lock screen
**SÜRENİZ DOLMUŞTUR**. Screens of people who have left stay dark.

### Cast

| Figure | Build / height | Look | Where |
|---|---|---|---|
| **BEN** at 10 (the narrator; "ARİF" only on the scoreboard) | m, 0.78 | short brown hair, blue hoodie, jeans, red schoolbag, white sneakers | MASA 4 |
| **BEN**, adult (~38) | m, 1.0 | short dark hair, light stubble, charcoal wool coat over a dark sweater, jeans; from `instant` 0.3 a **rust-red hand-knitted scarf**, unfinished, two needles stuck in its end | MASA 4 |
| **EMRE** at 10 | m, 0.8 | buzz cut, green-and-white striped T-shirt, jeans | MASA 3 |
| **EMRE** at 34 | m, 1.0 | buzz cut, brown leather jacket, grey T-shirt; a metal flip lighter he opens and shuts (no flame) | MASA 3 |
| **KEMAL ABİ** (cashier) then | m, 1.0, ~32 | black hair, thick black moustache, checked shirt, dark apron | behind the counter |
| **KEMAL ABİ** now | m, 0.98, ~60 | grey hair and moustache, reading glasses on a cord, faded apron over a brown cardigan | behind the counter |
| **ANNE** young | f, 0.95, ~35 | long dark hair, beige trench coat | at/outside the door (`dusk`) |
| **ANNE** old | f, 0.93, ~68 | grey hair in a low bun, mauve cardigan, long dark skirt, reading glasses; knitting in her lap; a camel coat on her chair back | MASA 5 |
| **DEDE** (Hasan) | m, 0.94, ~80 | white hair, white moustache, grey flat cap (kasket, on the desk), brown wool vest over a white shirt, dark coat on the chair back | MASA 9 |
| **BABA** | m, 0.98, ~68 | balding, grey sides, reading glasses, navy V-neck over a checked shirt; coat on the chair back | MASA 11 |
| **GENÇ ÇİFT + BEBEK** | m+f, ~28 | casual coats; a navy baby carriage with a white bundle | enter in `bell`, MASA 6 |
| **ÇOCUK** (the boy, ch. 8) | m, 0.78 | **identical to BEN at 10** (blue hoodie, red schoolbag). Never explained. | MASA 3 |
| Crowd | mixed | child era: 4–5 teenagers in row 2; adult era: strangers of every age, filling 6–9 desks; thins in ch. 5–6, full again in ch. 8 | other desks |

Poses used: walk, run (child), stand, sit, sit-type, slump/flop back, lean in, reach (to counter,
to a shoulder, to a neck, to a monitor's side), hold up one finger, put on coat, turn in the chair,
knit (hands in lap).

### Props that matter

Coins (bimetal 50-kuruş disc, ~2.4 cm), the wallet (and, ask:all, a fan of banknotes and cards), the
yellowed note, the admin monitor, Dede's cap (−1.2, 0.8, −2.2), Emre's lighter (−0.5, 0.775, −0.05),
the high-score screen on MASA 3, the mother's knitting (lap (2.25, 0.62, 0.3), later the scarf on the
narrator), the baby carriage, the wall clock, the bell.

### Camera presets (pos → target, vfov)

Rule for every shot from the window side toward a face: the line of sight must cross the monitor plane
(z −0.22 for row 1) **above y 1.25 or between two monitors** (≥ 0.3 m off a monitor's x) — the
monitors are 0.5 × 0.31 and sit right in front of the faces.

| Name | Position | Target | vfov |
|---|---|---|---|
| BACK | (1.25, 1.45, 1.6) | (0.75, 1.0, −0.22) | 34 |
| NAPE | (0.95, 1.33, 1.15) | (0.75, 1.25, 0.55) | 28 |
| CORNER (MASA n, row 1) | (x+0.11, 1.04, 0.22) | (x+0.18, 0.92, −0.21) | 20 |
| CORNER (row 2) | (x+0.11, 1.04, −1.98) | (x+0.18, 0.92, −2.41) | 20 |
| FRONT4 | (1.05, 1.45, −1.05) | (0.75, 1.2, 0.6) | 38 |
| PAIR34 | (0.0, 1.15, −1.0) | (0.0, 1.0, 0.6) | 46 |
| PAIR45 | (1.5, 1.15, −1.0) | (1.5, 1.0, 0.6) | 44 |
| BELL (reverse, over him to the door) | (1.1, 1.4, −1.0) | (1.8, 1.4, 4.0) | 40 |
| COUNTER (child height) | (−1.7, 1.3, 2.4) | (−3.3, 1.3, 4.2) | 40 |
| COUNTER (adult) | (−1.5, 1.6, 2.2) | (−3.4, 1.25, 4.1) | 38 |
| DOOR | (1.4, 1.5, 1.8) | (3.5, 1.2, 5.0) | 46 |
| WINDOW_WIDE | (0.4, 2.0, −4.4) | (0.3, 0.95, 1.0) | 52 |
| CRANE | (−4.2, 2.7, 4.4) | (0.8, 0.8, −1.2) | 58 |
| DEDE_OTS | (−1.2, 1.55, −0.85) | (−1.5, 0.95, −2.42) | 34 |
| BABA_OTS | (1.8, 1.55, −0.85) | (1.5, 0.95, −2.42) | 34 |
| HIGH_FRONT | (0.75, 2.4, −3.6) | (0.75, 1.0, 0.6) | 44 |
| DAYS (behind-right) | (4.6, 1.6, 2.4) | (1.2, 1.0, −2.5) | 44 |

## 3. Segment table

Times: `u` = local 0–1 of the segment; screens in brackets are absolute scroll positions.
Text ids refer to `text.ts`; "image" says what the frame shows while that line is up. Two-line items
reveal their second line partway (the fraction is given as "2nd @ u").

### 01 — NEFES (4.1 screens) · present, autumn night

**`open`** — 1.0 [0.0–1.0]
- Dark cafe. Only MASA 4's flat panel is lit (dim desktop, corner `—` small, not emphasised). The
  adult sits at MASA 4, back to camera, forearms on the desk, still; **no scarf**. Everything else in
  shadow; the window shows a dark street, leaves blowing past a streetlight.
- Camera: (1.05, 1.36, 1.55) → (0.75, 1.15, −0.2), 32°, imperceptible push to (0.98, 1.33, 1.3).
- Light: monitor glow (cool blue) is the key; faint sodium through the window. Sound: monitor hum, wind.
- `dying` (center, before scroll → 0.92): *Ölmek üzereyim.* — image: a man's back, the nape of his
  neck lit blue by one screen in a dark room.

**`neck`** — 3.1 [1.0–4.1]
- u 0–0.42 slow push to NAPE (his collar, the back of his neck). He rubs his eyes once (u 0.15).
- u 0.44 behind him the door swings open by itself; bell; a wedge of orange street light falls across
  the floor toward his chair; a few dry leaves skitter in; his collar stirs; he hunches and lifts his
  right hand to the nape (reach to (0.75, 1.3, 0.72)). He does **not** turn around.
- u 0.46 cut: (−0.6, 1.5, −0.6) → (2.2, 1.2, 3.8), 46° — his shoulder and profile in the foreground,
  the open door and the light behind him. u 0.8 the door swings shut slowly; the wedge narrows to
  nothing; u 0.85 his hand comes down, shoulders sag.
- Sound: bell, door creak, a gust (filtered noise swell), then hum again.
- `anxiety` (0.03–0.44): *Ölüm anksiyetesi. Her geçen gün…* — image: the slow push onto his neck.
- `breath` (0.48–0.99, 2nd @ 0.76): *Ölümün nefesini her an ensemde hissetmek…* — image: the door open
  behind him, the cold reaching his neck, his hand there. / *En azından beni çok yordu.* — the door
  closing, his hand dropping, the shoulders.

### 02 — ÇOCUK (15.6 screens) · ~25 years earlier, spring afternoon → dusk

**`recess`** — 2.6 [4.1–6.7]
- HARD CUT at u 0 to bright daylight, child-era dressing (CRTs, posters, ceiling fan turning, price
  board). 4–5 teenagers in row 2.
- u 0.05 the door bursts open (bell): **BEN (10)** runs in, schoolbag bouncing, **EMRE (10)** one step
  behind. They race across the floor: (3.5, 4.6) → (0.8, 3.4) → (−2.1, 3.3) (counter front). The boy
  slaps the counter at u 0.64; Emre arrives at u 0.7, laughing, shoving him.
- Camera: (−0.8, 1.35, 1.6), panning to follow the boy: target (3.5, 1.0, 4.8) → (−2.3, 1.0, 3.8), 46°.
- `cafe` (0.04–0.57, 2nd @ 0.28): *Küçük bir çocukken internet kafeye oyun oynamaya giderdim.* — the
  door bursting open, sun behind them. / *Okul çıkışı, çantam sırtımda, koşa koşa.* — the schoolbag
  bouncing as he runs.
- `one-step` (0.61–0.97): *En yakın arkadaşım Emre hep bir adım arkamdaydı; tezgâha ilk ben varırdım.*
  — the boy's hand on the counter first (0.64), Emre's a beat later (0.7).

**`coins`** — 2.5 [6.7–9.2]
- COUNTER (child height): the counter, young **KEMAL ABİ** leaning on his hands, the price board along
  the top of the frame. u 0.04 the boy turns his pocket out; coins clatter onto the counter.
- u 0.4 the boy holds up one finger; Kemal counts the coins with one finger and sweeps them into the
  drawer (insert u 0.43–0.55: (−3.2, 1.25, 3.3) → (−3.3, 1.06, 3.8), 26°, the coins under his finger).
  u 0.55–0.72 insert on the admin monitor: (−3.2, 1.35, 3.4) → (−4.3, 1.3, 4.0), 30° — Kemal's hand on
  the keys, the CRT shows `MASA 4 · 1 SAAT` (`admin-hour`, world). u 0.72 back to COUNTER: the boy
  beaming, already turning toward the desks; Emre pushing his own coins forward.
- `how-long` (0.03–0.39) KEMAL ABİ: *— Kaç saat, delikanlı?* — image: Kemal looking down over the
  counter at the boy.
- `price` (0.43–0.98, 2nd @ 0.68): *Bir saat bir lira, yarım saat elli kuruştu.* — the coins under
  Kemal's finger; the admin screen. / *Bunu çarpım tablosundan önce öğrenmiştim.* — the boy's grin.

**`play`** — 3.2 [9.2–12.4]
- u 0–0.15 CORNER (MASA 4): `KALAN SÜRE · 60:00` (`sixty`, world) holds, then 59:59, 59:58…
  (`kidSeconds`). u 0.15 cut to PAIR34: the boy at MASA 4, Emre at MASA 3, faces lit, game opening
  (u 0.2: a burst of colour on both CRTs), leaning in, hammering keys.
- u 0.55–1.0 the timer races. At u 0.86 BACK on the boy: he glances at the corner (≈13:20), shrugs,
  back to the game.
- Sound: session-start chime (u 0.12), keyboards, game bleeps, two kids laughing.
- `knew` (0.04–0.5, 2nd @ 0.25): *Süremin elbet biteceğini bilirdim.* — 60:00 in the corner. /
  *Yine de oyunu büyük bir heyecanla açar…* — the two faces lighting up as the game opens.
- `no-panic` (0.54–0.98, 2nd @ 0.74): *…elim ayağıma dolaşmazdı.* — the racing timer, the boys
  absorbed. / *Köşedeki sayıya arada bir bakardım, o kadar.* — the glance and the shrug (0.86).

**`zero`** — 2.4 [12.4–14.8]
- u 0–0.2 CORNER: 00:03, 00:02, 00:01, 00:00. u 0.2 the screen becomes the lock screen
  `SÜRENİZ DOLMUŞTUR` (`expired`, world, alert). u 0.22 cut to PAIR34: the boy freezes, hands up;
  Emre's screen locks a beat later (0.25); Emre throws his head back, arms out.
- u 0.62 the boy laughs and flops back in his chair; Emre too.
- `almost` (0.22–0.6) EMRE: *— Tam da yenecektim!* — image: Emre's arms flung out at his locked screen.
- `best-part` (0.62–0.99): *Oyun hep en güzel yerinde biterdi.* — image: both boys flopped back,
  laughing at the two blue screens.

**`pocket`** — 1.8 [14.8–16.6]
- Close on the boy at seat height: (0.95, 1.0, 0.95) → (0.82, 0.78, 0.55), 26°. u 0.05 his hand digs
  into his jeans pocket; u 0.3 it comes out; u 0.4 the palm opens: one 50-kuruş coin catching the
  window light. The locked screen glows out of focus beyond.
- `last-coin` (0.05–0.56): *Cebimde son elli kuruş kalmıştı.* — image: the hand in the pocket, the coin.
- **GATE `coin` at 0.66** (hold on the open palm). u 0.68–1.0 his fist closes around the coin.

**`dusk`** — 3.1 [16.6–19.7]
- The window turns from gold to amber to blue; streetlights blink on at u 0.3.
- **kid:more:** u 0–0.07 insert at the counter: the coin clicks down, Kemal taps a key. u 0.07–0.3
  BACK: MASA 4 shows `KALAN SÜRE · 30:00` (`extra`, world; `extraSeconds` runs it to 00:00 by u 0.3);
  the boy plays, Emre (his own session over) cheering over his shoulder. u 0.3 the timer hits 00:00
  and locks as the door opens: the young **ANNE** in the doorway, one hand on the door.
- **kid:home:** u 0–0.12 close on MASA 4's near edge: the boy pushes the coin into the crack, pats it;
  grabs his bag. u 0.12–0.3 he walks to the door, Emre waving from MASA 3. u 0.3 he opens the door:
  the young **ANNE** just outside under the streetlight.
- Both: u 0.3 camera from MASA 4 toward the door: (0.4, 1.15, 0.1) → (3.5, 1.4, 4.9), 42°. u 0.36 DOOR
  closer (2.6, 1.3, 2.6) → (3.5, 1.45, 5.0), 34°: the mother smiling, holding out her hand. u 0.6
  he takes it; they go; the door swings shut (0.64); u 0.68 the camera turns back to MASA 4: the chair
  still swivelling, the locked screen — the first empty chair of the story.
- `more` / `home` (0.03–0.33): *Yarım saat daha oynadım. Sonra annem kapıda belirdi.* / *Dışarıda sokak
  lambaları yanmıştı. Annem kapıda bekliyordu.* — image: per branch, above.
- `dinner` (0.36–0.65) ANNE: *— Yemek soğuyor, hadi.* — image: the young mother at the door, hand out.
- `tomorrow` (0.68–0.98): *Süre biterdi; ertesi gün yine başlardı.* — image: the empty, swivelling
  chair at MASA 4, the bell's last shiver.

### 03 — SÜRE (9.6 screens) · now, autumn dusk

**`years`** — 1.7 [19.7–21.4]
- Locked-off: (0.75, 1.5, 2.6) → (0.75, 1.1, −5.0), 50°: MASA 4's empty chair in the foreground, the
  window beyond. Time-lapse u 0–0.85: the window cycles seasons ~6 times, fast then slowing; light
  sweeps day/night; the clock hands spin; crowd figures flicker in and out of seats; at u 0.5 the
  dressing dissolves to the adult era (flat panels, AC unit, posters gone). At u 0.55 the chair at
  MASA 4 is simply occupied: **BEN, adult**, playing. Lands at u 0.85 on autumn dusk.
- The coin sits in the desk crack in the foreground in both readings; **kid:home:** a small key light
  makes it glint through the whole time-lapse; **kid:more:** unlit, just there.
- `years-home` / `years-more` (0.05–0.95, 2nd @ 0.455): *Aradan yıllar geçti. Masa aynı masaydı.* —
  the seasons racing over the same desk. / *Yarına sakladığım elli kuruş hâlâ masanın çatlağındaydı.*
  (the glinting coin) or *Bütün yarım saatlerimi burada harcamıştım; hiçbirine acımadım.* (the boy's
  chair becoming the man's).

**`soul`** — 1.5 [21.4–22.9]
- BACK, slow push to over-the-shoulder (1.05, 1.4, 1.15), 34° → 30°. He plays, shoulders rounded,
  the same posture as the boy but heavier. The wall clock behind him ticks (hidden discovery).
- `soul` (0.05–0.95): *Şimdi ruhum, seksen doksan yıllık bir bilgisayar masasına oturmuş o son oyunu
  oynuyor gibi.* — image: the man at the boy's desk, playing.

**`dash`** — 2.1 [22.9–25.0]
- u 0–0.48 CORNER (MASA 4): `KALAN SÜRE · —` (`no-time`, world) in the same amber type as 60:00 was;
  the dash pulses very faintly. u 0.49 cut to FRONT4: his face lit by the screen, eyes on the corner,
  then away.
- `a-line` (0.03–0.46): *Köşede bir sayı olması gerekirdi. Bir çizgi vardı.* — image: the dash.
- `uncertainty` (0.5–0.97): *Hayat ile o oyunun ayrıştığı yer tam da burası: belirsizlik.* — image:
  his face looking at the corner.

**`wallet`** — 1.7 [25.0–26.7]
- u 0–0.2 he stands; u 0.15–0.3 takes a wallet from his inner coat pocket; u 0.25–0.95 walks the boy's
  path to the counter: (0.75, 0.9) → (0.2, 2.2) → (−2.2, 3.3). Camera follows from behind-right:
  (1.6, 1.6, 2.4) tracking his chest, 44°.
- `child-knows` (0.05–0.95, 2nd @ 0.455): *Bir çocuk, süreyi uzatmak için ne kadar paraya ihtiyacı
  olduğunu bilir.* — the man walking the boy's path, wallet in hand. / *Ben hâlâ bildiğimi sanıyordum.*
  — a small confident nod as he reaches the counter.

**`counter`** — 2.6 [26.7–29.3]
- COUNTER (adult). Old **KEMAL ABİ**, same lean on his hands as thirty years ago. The pale rectangle
  on the wall where the price board hung; the note on the counter top. u 0.02 the wallet lands on the
  counter.
- `how-much` (0.03–0.38) KEMAL ABİ: *— Kaç saat?* — image: Kemal looking at him over his glasses, the
  boy's question without the "delikanlı"; he does not touch the wallet.
- **GATE `extend` at 0.44** (hold on Kemal and the wallet). Play it exactly like the `coin` gate, so
  the reader expects it to work.
- u 0.48 Kemal taps twice with two fingertips on the yellowed note (`no-extension`, world:
  `SÜRE UZATMA YOKTUR`); insert (−2.7, 1.35, 3.2) → (−3.0, 1.06, 3.7), 28°, u 0.48–0.62. u 0.62 back to
  COUNTER. **ask:half / ask:year:** Kemal slides the closed wallet back with one finger; the narrator
  does not take it at once. **ask:all:** during the insert he has spread every banknote and card
  across the counter; Kemal squares them into one neat pile and slides the pile back.
- `no-chance` (0.53–0.97): *Bizim ise süreyi uzatma şansımız yok, bedeli ne olursa olsun.* — image:
  the note under Kemal's fingers; the wallet (or the pile) pushed back across the counter.

### 04 — ÖLÜMCÜL HASTALIK (8.0 screens) · autumn dusk → night

**`look`** — 2.3 [29.3–31.6]
- u 0–0.3 he walks back with the wallet, stops behind row 1 at (−0.2, 1.3) and looks up. Camera
  behind him: (−0.2, 1.7, 2.6) → (−0.2, 1.2, −1.0), 44°.
- The room is now **full**: row 2 — **DEDE** at MASA 9 playing tavla on screen, cap on the desk;
  **BABA** at MASA 11 reading, glasses on; row 1 — **EMRE (34)** at MASA 3 flicking his lighter;
  **ANNE (68)** at MASA 5 knitting; strangers of every age at the other desks.
- u 0.32 cut to WINDOW_WIDE with a slow lateral dolly x 0.4 → −0.6: all the faces lit by their
  screens, him standing behind them. From u 0.5 the dolly and focus pass over the four in the order
  of the line: Dede (0.55), Baba (0.65), Emre (0.75), Anne (0.85) — each gets a touch more light as
  named.
- `room` (0.04–0.96, 2nd @ 0.5): *Masama dönerken salona ilk kez gerçekten baktım. Masalarda hayatımın
  insanları oturuyordu.* — him looking up; the faces. / *Dedem, babam, Emre, annem; tanımadığım, sonra
  tanıyacağım yüzler.* — the four, named in order, then the strangers.

**`dashes`** — 1.7 [31.6–33.3]
- Four quick CORNER inserts, 0.18 each from u 0.05: Dede's (row 2, x −1.5), Emre's (x −0.75), Baba's
  (row 2, x 1.5), Anne's (x 2.25) — every one `—`. He sits down at MASA 4 off-screen meanwhile; u 0.77
  BACK over his own: `—`.
- `same-line` (0.05–0.95, 2nd @ 0.455): *Herkesin ekranının köşesinde aynı çizgi vardı.* — the dashes,
  one after another. / *Kimse kendi süresini göremiyordu; başkasınınkini de.* — Baba's, Anne's, his own.

**`bell`** — 1.7 [33.3–35.0]
- He is seated at MASA 4. BELL reverse: his face, and over his shoulder the door. u 0.08 the door opens
  (bell): the **young couple** push in a navy baby carriage; a gust — his collar lifts, he pulls his
  coat closer and touches his nape. u 0.4–0.9 the couple cross behind him to MASA 6 and park the
  carriage beside it; the door swings shut.
- `door-again` (0.05–0.95, 2nd @ 0.455): *Arkamdaki kapı her açıldığında ensemde aynı soğuk.* — the
  door, the cold, his hand at his neck. / *Gelen de açıyordu o kapıyı, giden de.* — the couple and the
  carriage passing behind him.

**`disease`** — 2.3 [35.0–37.3] · QUIET
- u 0–0.48 close on his face from above his monitor: (1.15, 1.42, −0.6) → (0.75, 1.25, 0.6), 30°.
  u 0.5–1.0 the camera rises and pulls back to CRANE, revealing the whole room: every head, every lit
  screen, the carriage last into frame, the counter and Kemal, the door, the autumn night in the
  window. The murmur thins to the clock and one low held note.
- `disease` (center, 0.04–0.47): *"Yaşamak" adlı ölümcül bir hastalığa yakalandım.* — image: his face,
  close, quiet.
- `all-of-us` (center, 0.52–0.98, 2nd @ 0.7): *Ölmek üzereyim.* / *Hepimiz öyleyiz.* — image: the
  crane widening over everyone; "Hepimiz" lands as the baby carriage enters the frame.

### 05 — BİRER BİRER (14.6 screens) · autumn night → winter → summer → winter

**`bulmaz`** — 2.2 [37.3–39.5] · evening
- Life at the desks: Emre flips his lighter, grins, turns his screen to show the narrator something;
  the narrator laughs; Dede rolls dice on screen and mutters; Baba scrolls. PAIR34 (u 0–0.47), then a
  slow push from behind MASA 4 toward Dede's back in row 2 (u 0.5–1.0): (0.75, 1.45, 1.4) →
  (−0.6, 1.4, −0.3), target (−1.5, 1.0, −2.4), 40°.
- `ignored` (0.03–0.45): *Eskiden görmezden gelirdim. "Beni bulmaz" derdim.* — image: the narrator
  laughing with Emre, careless.
- `understood` (0.49–0.97): *O son duygusunun gerçekliğini, yakınlarımı birer birer kaybetmeye
  başladığımda anladım.* — image: the slow move onto Dede's back.

**`grandpa`** — 2.3 [39.5–41.8] · window: winter day, snow
- DEDE_OTS. u 0.04 his tavla board disappears; `SÜRENİZ DOLMUŞTUR` (`grandpa-screen`, world). u 0.1 he
  reads it, nods slowly. u 0.25–0.4 stands (slow); u 0.4–0.5 takes his coat from the chair back and puts
  it on. **The cap stays on the desk** at (−1.2, 0.8, −2.2).
- u 0.5 CUT to a wider FRONT4 (0.75, 1.4, −1.2) → (0.75, 1.35, 0.6), 42°: Dede is already behind the
  narrator (he walked the corridor and the left aisle off-screen); at u 0.54 he rests his right hand on
  the narrator's right shoulder (reach to (0.95, 1.35, 0.6)): the narrator's face, the old hand, Dede's
  face above.
- u 0.78 DOOR: Dede crosses to the door; u 0.92 opens it (bell), snow blows in; he steps out; it shuts.
- `grandpa-first` (0.03–0.5): *İlk giden dedem oldu. Ekranındaki yazıyı okudu, başını salladı; şaşırmadı
  bile.* — image: the lock screen, the nod, standing, the coat.
- `take-care` (0.54–0.94) DEDE: *— Annene iyi bak.* — image: his hand on the narrator's shoulder; then
  Dede walking to the door.

**`friend`** — 2.7 [41.8–44.5] · window: summer dusk, long gold light
- PAIR34. Emre turns his chair toward the narrator, the lighter clicking open and shut.
- u 0.74 — mid-laugh — Emre's screen goes black, then `SÜRENİZ DOLMUŞTUR` (`friend-screen`, world,
  0.75). QUIET from u 0.74: the room sound drops to the clock. Emre looks at the screen (0.77), at the
  narrator (0.8), a small confused half-smile; sets the lighter down on the desk (0.85) at
  (−0.5, 0.775, −0.05); stands — no coat, it is summer — and walks off toward the door without looking
  back (0.88–1.0). From u 0.9 hold on the narrator's face (FRONT4) as Emre leaves frame; the bell is
  heard, not seen (0.97).
- `saturday` (0.02–0.36) EMRE: *— Cumartesi maç var. Geliyorsun, değil mi?* — image: Emre turned
  toward him, lighter clicking.
- `ill-come` (0.39–0.73) BEN: *— Gelirim. Bu sefer ben yenerim.* — image: the narrator grinning back.
- (0.74–1.0: no words.)

**`lighter`** — 2.7 [44.5–47.2]
- From beside the narrator, over his left shoulder: (0.45, 1.25, 1.0) → (−0.6, 0.75, 0.15), 34°, slowly
  closing to (−0.05, 1.05, 0.55) → (−0.5, 0.78, −0.05), 28°: MASA 3's desk with the lighter on it, the
  empty chair in front of it still turning slowly, the dark screen. u 0.48 the narrator's hand enters
  from the right and picks up the lighter; u 0.6 one click: a small flame (warm point light, 0.15 m);
  u 0.88 he closes the lid; the flame is gone.
- `thirty-four` (0.03–0.44, 2nd @ 0.19): *Emre otuz dört yaşındaydı.* — the lighter, the turning chair.
  / *Hep bir adım arkamdan gelirdi; bu sefer benden önce gitti.* — the chair slowing to a stop.
- `vanish` (0.48–0.98): *Dün karşımda kanlı canlı duran, sesiyle, nefesiyle var olan biri nasıl olur da
  bir anda "yok" olabilir?* — image: his hand, the one flame, the lid closing.

**`father`** — 1.9 [47.2–49.1] · window: winter night, snow
- BABA_OTS u 0–0.45: his screen dims and at u 0.04 becomes `SÜRENİZ DOLMUŞTUR` (`father-screen`,
  world). u 0.15–0.42 he takes off his reading glasses, folds them, slips them into his shirt pocket.
  u 0.45 he turns in his chair and looks back: cut to over the narrator's shoulder (1.0, 1.35, 1.0) →
  (1.5, 1.15, −1.6), 36°. A small nod at u 0.55. u 0.6–0.92 he stands, puts on his coat and walks out
  by the right aisle; the door at u 0.92 (bell, snow).
- `father` (0.05–0.95, 2nd @ 0.455): *Bir kış gecesi sıra babama geldi. Gözlüğünü katlayıp gömleğinin
  cebine koydu.* — the lock screen; the glasses folded. / *Dönüp bana baktı. Hiçbir şey söylemedi; hep
  öyleydi.* — the look back, the nod, the coat.

**`witness`** — 2.8 [49.1–51.9] · winter night
- The narrator alone at MASA 4; the three empty chairs (MASA 9, MASA 11, MASA 3), their screens dark.
  HIGH_FRONT, slow push from (0.75, 2.4, −3.6) to (0.75, 2.1, −2.6) over the tops of row 2: in the
  foreground Dede's and Baba's empty chairs and dark screens; beyond them, the narrator lit by his own
  screen, the empty MASA 3 beside him; far behind him, the closed door.
- `witness` (0.03–0.62, 2nd @ 0.3): *Aslında insanı asıl yıkan şey… değil;* — the push passing over the
  two empty chairs. / *sevdiklerinin ölümüne şahitlik etmek.* — him, alone in his screen's light.
- `heavier` (0.66–0.98): *Bu, ölümün kendisinden bile daha ağır bir yük.* — image: the push settles;
  his face, the empty chair beside him, the closed door far behind.

### 06 — HİÇLİK (6.8 screens) · deep winter night, snow

**`traces`** — 1.7 [51.9–53.6]
- Most desks empty. Warm pools of lamp light on the empty places. The narrator walks slowly from MASA 4
  to MASA 3 (u 0–0.8), his hand trailing over the back of Emre's chair. Camera wide from the window
  side: (−0.4, 1.7, −3.6) → (−0.6, 0.9, 0.0), 44° — the cap on Dede's desk in the right foreground,
  the lighter on MASA 3, the man. Inserts: u 0.5–0.7 the cap; u 0.7–0.9 his hand on the chair back.
- `traces` (0.04–0.95, 2nd @ 0.45): *Masalarda bıraktıkları duruyordu: dedemin kasketi, Emre'nin
  çakmağı.* — the cap, the lighter. / *Sandalyeleri hâlâ sıcaktı.* — his hand on the chair.

**`scores`** — 2.8 [53.6–56.4]
- He sits at MASA 3 and touches the mouse; the screen wakes: `EN YÜKSEK SKORLAR` —
  `1. EMRE · 48.200`, `2. ARİF · 47.950`; below, `KAYITLI OYUN · HASAN · TAVLA · 5–3`
  (`high-scores`, world). Camera over his shoulder: (−0.35, 1.4, 1.15) → (−0.75, 1.0, −0.22), 30°.
  u 0.41 slow move round to the front, above the monitor: (−0.4, 1.42, −1.0) → (−0.75, 1.2, 0.6), 40°:
  the screen light on his face.
- `top-score` (0.03–0.37): *Skor tablosunda Emre'nin adı hâlâ en üstteydi.* — image: the list.
- `cannot-vanish` (0.41–0.98, 2nd @ 0.67): *Var olduğum için asla tamamen "yok" olamayacağımı
  biliyorum;* / *çünkü eğer gerçekten yok olursam…* — image: his face in the scoreboard's light.

**`illusion`** — 2.3 [56.4–58.7]
- Wide, still, warm: (2.8, 2.1, 3.2) → (−0.5, 0.85, −1.0), 50°: the night room, snow falling past the
  window, the cap, the lighter, the three empty chairs each in a pool of lamp light, the narrator at
  MASA 3 with his hand on the screen's edge. From u 0.6 the lamps dim by half; his silhouette remains.
- `illusion` (center, 0.04–0.55): *Varlığın olduğu yerde yokluk, ancak bir algı yanılmasıdır.* —
  image: the room holding what they left.
- `most-nights` (0.59–0.98): *Olmuş bir şey, olmamış olamaz. Bu bana yetiyordu; çoğu gece.* — image:
  the lamps dimming; the snow.

### 07 — VEDA (13.7 screens) · late winter → early spring

**`mother`** — 1.9 [58.7–60.6] · grey day
- PAIR45: the narrator at MASA 4, **ANNE** at MASA 5 knitting the rust-red scarf (already ~60 cm),
  needles clicking, her screen showing a solitaire game. u 0.6 she holds the knitting up against his
  neck to measure; he smiles, lets her.
- `still-worry` (0.05–0.95, 2nd @ 0.455): *Yine de endişem kendi sonumdan ziyade, sevdiklerimin
  gidişiyle ilgili.* — the two side by side. / *Annem sağımdaki masadaydı. Kucağında yarım bir atkı
  vardı.* — the knitting; the measuring at his neck.

**`dims`** — 2.6 [60.6–63.2]
- Over her shoulder (2.6, 1.35, 1.1) → (2.25, 1.0, −0.22), 32°: u 0.05 her screen dims to near-black,
  u 0.3 comes back; u 0.45 dims again. u 0.6 cut to PAIR45 tighter: she leans over and taps twice on
  the side of the monitor; it comes back; her face, wry.
- `flicker` (0.04–0.58, 2nd @ 0.28): *Ekranı arada bir kararıyor, sonra geri geliyordu.* — the dimming
  screen. / *Doktorun söylediklerinden aklımda tek kelime kalmıştı: ölümcül.* — it comes back; dims again.
- `tap` (0.62–0.97) ANNE: *— Eski bunlar. Vurunca düzeliyor.* — image: her two taps, her face.

**`turn`** — 2.3 [63.2–65.5]
- Close two-shot from the front of MASA 4–5: (1.5, 1.2, −0.7) → (1.5, 1.1, 0.6), 36°. His eyes go from
  her face to her screen's corner (`—`) and back. Her screen dims again at u 0.6; she goes back to her
  knitting (0.62).
- `for-whom-half` / `-year` / `-all` (0.04–0.58, 2nd @ 0.28): *O gün Kemal Abi'den yarım saat daha
  istemiştim.* (or *bir yıl daha*, or *O gün Kemal Abi'ye her şeyimi vermeye razıydım.*) — his look on
  her. / *Kiminle geçirmek istediğimi şimdi biliyordum.* (all: *Kimin için olduğunu şimdi biliyordum.*)
  — her hands in the knitting, his eyes staying on her.
- **GATE `mother` at 0.66** (hold: her dimmed screen, her bent head, him between).

**`together`** — 2.2 [65.5–67.7]
- **mom:turn:** u 0–0.1 he swivels his chair 90° to face her; she puts the knitting down; they play a
  two-player game on her screen, he shows her the keys; u 0.4–0.6 she presses the wrong one and
  laughs, hand over her mouth; he laughs. Framing never includes her screen's corner (out of frame or
  out of focus).
- **mom:watch:** he stays facing forward; insert on her corner (`—`, flickering) u 0–0.45; at u 0.1 her
  laugh is heard beside him, shown only as a blur at the frame edge; u 0.5 he looks — her face is
  already settling, the laugh over; u 0.55 he swivels his chair to her anyway; she looks at him,
  puzzled, smiles.
- `which-key` (0.03–0.44, turn) ANNE: *— Hangisine basıyordum ben?* — image: her finger hovering over
  the keys.
- `laughed` (0.48–0.97, turn): *Güldü. Ekranının köşesine bir kez bile bakmadım.* — image: her laugh,
  his laugh, her screen's corner nowhere in frame.
- `missed` (0.03–0.48, watch): *Yanımda bir şeye güldü. Ben hâlâ o köşeye bakıyordum.* — image: the
  corner in focus, her laugh blurred at the edge.
- `turned-anyway` (0.52–0.97, watch): *Baktığımda gülüşü bitmişti. Yine de sandalyemi ona döndürdüm.* —
  image: him turning his chair to her; her puzzled smile.

**`days`** — 1.9 [67.7–69.6]
- Locked-off DAYS (from behind-right): the two in three-quarter back view at their desks, the window
  beyond them. The window cycles day/night ~8 times; bare branches → first buds; the scarf hanging from
  her lap grows longer each cycle; their poses shift (she dozes; he reads to her; they play; she
  knits). Her screen dims more often and for longer. mom:turn: he is turned toward her in most beats;
  mom:watch: his head turns to her corner in the early beats, less and less later.
- `longest` (0.05–0.95, 2nd @ 0.455): *Atkı her gün birkaç sıra uzuyordu.* — the scarf lengthening
  over the cycles. / *Veda da her sabah yeniden başlıyordu. En uzun veda buydu.* — the mornings
  flickering over the two of them.

**`instant`** — 2.8 [69.6–72.4] · pale early-spring morning · QUIET 0.04–0.62
- u 0.04 her screen: `SÜRENİZ DOLMUŞTUR` (`mother-screen`, world). She reads it (0.04–0.15), turns to
  him (0.18). u 0.22–0.42 she lifts the unfinished scarf — the needles still in its last row — and
  wraps it once round his neck, tucks the end. Camera on both from the front, (1.5, 1.2, −0.8) →
  (1.5, 1.1, 0.6), 34°, closing on her hands at his neck.
- u 0.5 she stands, takes her coat from the chair back, touches his hair once. u 0.55 cut to BELL: his
  face in the foreground; she walks behind him to the door. u 0.62 the door opens (bell); the cold
  comes in — his hand goes to the **scarf**, not the bare nape. She steps out; the door closes at u 0.7.
  u 0.75–1.0 back to the front two-shot framing: her empty chair, the needles' tips sticking out of the
  scarf at his neck.
- `dont-be-cold` (0.27–0.6) ANNE: *— Üşüme.* — image: her hands tucking the scarf at his neck.
- `shortest` (0.64–0.98): *Sonra bir anda bitti. En kısa veda da buydu.* — image: the door closing,
  then her empty chair, the scarf.

### 08 — İNADINA (8.1 screens) · spring afternoon

**`spring`** — 1.9 [72.4–74.3]
- Bright; the plane tree in new leaf; the room full again with strangers; old Kemal at the counter. The
  narrator at MASA 4, scarf on. Camera from in front of MASA 4 looking back, above his monitor:
  (0.9, 1.35, −0.9) → (0.0, 1.2, 4.0), 46°: his face in the foreground, the door and the counter
  behind. u 0.05 the door opens (bell): **the boy** bursts in — blue hoodie, red schoolbag, the narrator
  at ten exactly; the narrator feels the cold, touches the scarf, does not turn. u 0.1–0.4 the boy runs
  to the counter and spills his coins (0.4); Kemal smiles and types.
- `scarf-turn` / `scarf-watch` (0.05–0.95, 2nd @ 0.455): *Bir bahar öğleden sonrası kapı yine açıldı.
  Ensemde o soğuk.* — the door, the boy running in, his hand on the scarf. / *Boynumda annemin atkısı
  vardı; aklımda gülüşü.* (watch: *…aklımda gülüşünün yarısı.*) — his face; the boy at the counter
  behind him.

**`newboy`** — 1.9 [74.3–76.2]
- u 0–0.25 the boy runs from the counter and drops into MASA 3, next to him, **without taking off his
  schoolbag**. CORNER (MASA 3) u 0.3–0.45: `KALAN SÜRE · 60:00` (`boy-sixty`, world; `boySeconds`
  barely ticks). u 0.45 PAIR34: the boy rubs his hands, opens the game with a whoop (u 0.5), leans in,
  face lit; the man beside him watching.
- `joy` (0.05–0.95, 2nd @ 0.455): *Yan masaya bir çocuk oturdu, çantasını sırtından çıkarmadan.* — the
  boy dropping into the chair, the red bag still on. / *Süresinin elbet biteceğini biliyordu. Yine de
  oyununu büyük bir heyecanla açtı.* — the 60:00; the whoop.

**`defiance`** — 2.9 [76.2–79.1]
- u 0–0.3 CORNER (MASA 4): `KALAN SÜRE · —`. He glances at it (mom:watch: a beat longer), looks away,
  and clicks his game open (0.25). u 0.38 PAIR34: the boy leans over to look at his screen; the man
  turns his chair a little toward him; they play together, shoulders almost touching; the boy laughs;
  the man laughs. Slow push in; u 0.7 reverse from behind both (0.0, 1.45, 1.6) → (0.0, 1.0, −0.22),
  40°: both screens side by side — the boy's 59:xx, the man's `—`.
- `own-game` (0.03–0.36): *Benim köşemde hâlâ o çizgi vardı. Gözümü ondan çektim; oyunumu açtım.* —
  image: the dash, the glance, the click.
- `defiance` (0.4–0.99, 2nd @ 0.67): *Ölümcül bir hastalığa yakalanmış biriyle yaşamak, o veda anına
  hazırlanmak değil;* — the man and the boy playing side by side. / *her anı o sonun gölgesinde ama o
  sonun inadına yaşamaktır.* — the two corners, the number and the dash, side by side.

**`final`** — 1.4 [79.1–80.5] · QUIET
- Crane up and back from (0.0, 1.6, 2.2) to CRANE, target (0.5, 0.8, −1.5): the whole cafe in spring
  light, every desk taken, the boy and the man at MASA 3 and 4, Kemal at the counter, the clock
  running, the window green. Music resolves.
- `end` (center, 0.18 → end): **YAŞAMAK** — *En uzun ve en kısa veda.*

## 4. Choices

| Gate | Where | Options → flags | What changes |
|---|---|---|---|
| `coin` · ELLİ KURUŞ | `pocket` 0.66 · *Süre doldu. Avucumda son elli kuruş.* | *Yarım saat daha.* → `kid:more` · *Eve dön.* → `kid:home` | `dusk`: more = coin on the counter, 30:00 runs out at MASA 4, the mother appears in the doorway; home = coin pushed into MASA 4's crack, the boy walks out, the mother outside under the streetlight. `years`: a different second line; in home the coin glints in the crack through the time-lapse. |
| `extend` · KASA | `counter` 0.44 · *Cüzdanım tezgâhta. Kemal Abi bekliyor.* | *Yarım saat daha.* → `ask:half` · *Bir yıl daha.* → `ask:year` · *Ne istersen öderim.* → `ask:all` | **Every answer is refused** (KEMAL ABİ: "Süre uzatılmıyor."; ask:all adds "Mesele para değil, evlat."). The first option is the child's own words from gate 1. ask:all: banknotes and cards spread on the counter, squared and pushed back; half/year: the closed wallet pushed back. Echo in `turn`: what he asked for, and who it was for. |
| `mother` · ANNE | `turn` 0.66 · *Ekranı yine karardı. Annem örgüsüne döndü.* | *Ona dön.* → `mom:turn` · *Ekranını izle.* → `mom:watch` | `together`: turned and laughing with her / watching her corner and missing her laugh, then turning anyway. `days`: his posture across the montage. `spring`: the second line (her laugh / half of it). `defiance`: how long he looks at his own dash. |

The contrast between gate 1 (the reader's choice works: half an hour costs fifty kuruş) and gate 2
(the same words, and nothing works) is the heart of the story.

## 5. Discoveries

| id | What | Where (m) | When | Why |
|---|---|---|---|---|
| `prices` | the price board (visible) | (−3.5, 2.25, 4.94) | `coins` | the child's world has a price for everything; a pencilled rule underneath |
| `saved-coin` | an old 50 kuruş in MASA 4's crack (subtle) | (0.4, 0.765, 0.2) | `years` → `soul` | a tomorrow someone saved — his in kid:home, a stranger's in kid:more |
| `seasons` | the window's seasons (subtle) | (0, 1.7, −5.0), 3 m | `years` | the decades passing — "Kaç kez, saymadım." |
| `wall-clock` | the wall clock (hidden, behind) | (0, 2.3, 4.93) | `soul`, `dash` | it never stopped; nobody wound it |
| `note` | SÜRE UZATMA YOKTUR (visible) | (−3.0, 1.06, 3.7) | `counter` | taped to the counter; the price board is gone — no price anywhere |
| `admin-screen` | the cashier's monitor (hidden, behind) | (−4.3, 1.3, 4.0), faces +x | `look` → `dashes` | every desk listed; the time column empty — Kemal doesn't know either |
| `lighter` | Emre's lighter (visible) | (−0.5, 0.775, −0.05) | `lighter` | he quit smoking ten years ago, never the lighter |
| `cap` | Dede's cap (visible) | (−1.2, 0.8, −2.2) | `traces` | tailor's label "Sivas, 1971"; a tavla die under the lining |
| `high-scores` | the scoreboard (visible) | (−0.75, 1.0, −0.22) | `scores` | EMRE first, ARİF second; Dede's saved game, 5–3 up |
| `knitting` | the mother's knitting (visible) | (2.25, 0.62, 0.3) | `mother`, `dims` | "120 sıra", her count stops at 84 |

## 6. Sound

- **NEFES:** monitor hum, wind outside, leaves; the door's creak, the two-tone **bell**, a cold gust.
- **ÇOCUK:** ceiling fan, clacky keyboards, game bleeps, two kids laughing, birds and traffic through the
  window; a hand slapping the counter; coins on the counter; register keys; session-start chime
  (`play` 0.12); lock-screen buzz (`zero` 0.18); dusk: evening street, a scooter, the bell.
- **SÜRE:** the time-lapse as weather (rain, wind, snow hush, summer cicadas) in fast succession; from
  here on the **wall clock tick** is always faintly present behind the narrator; quieter modern keys;
  wallet on the counter; two fingertip taps on paper.
- **ÖLÜMCÜL HASTALIK:** full-room murmur; the bell, the gust, carriage wheels, a baby's coo; at `disease`
  the murmur thins to the clock and one held low piano note.
- **BİRER BİRER:** each departure has the same short, soft alert tone (never alarming), a chair pushed
  back, footsteps, the bell, a gust; snow hush in winter. Emre: the tone, then the room drops to the
  clock alone; the bell far off. The lighter: one click, a small flame. `witness`: the clock only.
- **HİÇLİK:** snow hush, the clock, a screen waking (soft chime), sparse piano.
- **VEDA:** knitting needles (the motif), a monitor's buzz when it dims, two taps, her laugh (two laughs
  in mom:turn), the day/night hush of the montage, the alert tone, the bell, the cold.
- **İNADINA:** birds, a bright murmur, the bell, coins, the boy's whoop, two keyboards together,
  laughter, the clock; the music resolves on the title.

Keep the old audio's piano and positional keyboards; drop the horizon drone. Key cues are in
`CAPTIONS` (text.ts) with their segment fractions.

## 7. Story-select card art

A sunlit internet cafe in the late afternoon: a ten-year-old boy in a blue hoodie leans toward a beige
CRT, mid-laugh, his face lit by the game; in the lower-right corner of the screen, small amber digits:
`KALAN SÜRE 12:40`. Dust in the light, a plane tree in fresh leaf through the window. Nothing else.
