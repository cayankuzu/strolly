# ÖFKESEL DENEYİM SİMÜLASYONU — screenplay (`ofke`)

The contract between the words (`src/stories/ofke/text.ts`, `timeline.ts`) and
the set (`src/three/ofke/`). Every text id below is shown at the fractions
given; the image must be about the same moment as the sentence.

- 64 segments · 9 chapters · **96.9 screens** · `SCREEN_VH = 80`
- Rail: **left** · loops: **no** · 2 choices · 10 discoveries
- In-world service name: **ÖFKE NÖBETİ** ("Ücretsiz kamu hizmeti")

---

## 1. Logline, tone, palette, light

**Logline.** Arif asks his boss to accept his resignation and is laughed back
to his desk. After work he drives to ÖFKE NÖBETİ, a free state service that
rebuilds the moment you were angry in a white room and lets you do what you
could not do. Then the story shows who was really in the room, and the same
white room from the floor.

**Tone.** Office realism → clean, smiling service → clinical horror told in
the flat voice of a brochure. No moralizing. The violence is short and sharp
in the words and **never lands in the image**: light, glitches, objects,
sound. The horror is in the procedure: forms, buttons, mops, conveyor belts.

**Palette.**
- Office: grey-blue carpet, beige walls, walnut, fluorescent white, morning sun.
- ÖFKE NÖBETİ: white, pale wood, **mint `#7fd1c1`**, rounded friendly signage.
- White room: `#f4f6f6`, shadowless.
- Convict line: raw concrete, sodium orange `#e8a040`, amber warning lights,
  near-black reading room lit by screens.
- Blood: only in ch. 7, as dark red-brown smears on the white floor, small, in
  shadow, never bright, never a wound.
- Suggested UI theme: `clinical` (mint white, a dried-blood red accent `#8c3b32`
  for the 333 chapter if a per-chapter accent exists).

**Light / time by chapter.**

| ch | title | time | light |
|---|---|---|---|
| 1 | İSTİFA | 09.13–09.16 | office fluorescents + low morning sun from the east windows; boss's office backlit by the north window |
| 2 | YOL | 18.00–18.32 | dusk: orange-grey windows, harsh green-grey stairwell, street at dusk (orange→violet sky, streetlights coming on) |
| 3 | HİZMET | 18.32–18.52 | warm welcoming exterior with a mint sign glow; inside bright clinical white with mint; prep room cool white + the helmet's blue band |
| 4 | ODA | ~18.57 | pure white, high ambient, no shadows → the morning office light (sun through the window) arrives patch by patch |
| 5 | NÖBET | — | the office light, cut through by white flashes and white glitch patches |
| 6 | HİZMETİN BEDELİ | ~19.10 | locker room cool white + the info screen's colourful glow; exterior night blue |
| 7 | TEMİZLİK | ~19.15 | the white room as it really is: flat clinical white, one ceiling panel over the north-east corner off (a dimmer corner) |
| 8 | 333 | 18.21–18.55 (**same evening, earlier**) | industrial: sodium orange bay, cold white + amber wash tunnel, dark reading room lit by screens, sterile injection station |
| 9 | KAPI | ~18.57 | the white room from the floor: overexposed, blurred, vignetted (a drugged POV) |

**The clock that makes the ending work** (show it through world text and set
dressing, never in narration): 09.14 boss · 18.00 work ends · 18.02 elevator ·
18.09 route set, arrival 18.32 · 18.21 the van (333) · 18.44 the anger map ·
~18.52 clothes · "about five minutes later" ~18.57 Arif enters ODA 3 · ~18.55
333's tray enters ODA 3 · ~18.57 the door opens. Chapter 8–9 happen **while**
chapters 3–4 happen: the man who walks in at the end is Arif.

---

## 2. World layout (meters)

Axes: x right, y up, z toward the default camera (people usually face −z).
Each set has its own area; cuts are camera jumps.

### A — OFFICE (x 0): 7th floor, open plan + the boss's office

- Open office floor x −7…7, z −4…8, ceiling 3.0. Grey-blue carpet, beige walls,
  rows of fluorescent panels. East wall (x 7): tall windows (morning sun in
  ch. 1, dusk in ch. 2).
- **North wall z −4: the boss's door** at x 0 — 0.95 × 2.1 m, wooden frame,
  frosted glass upper half, nameplate "GENEL MÜDÜR" at (0, 1.55, −3.97). Hinges
  on the left (x −0.475), opens **inward** (toward −z). Wall clock at
  (1.6, 2.4, −3.95): 09.13 → 09.14 in ch. 1, 18.00 in ch. 2.
- Central aisle along x 0 from z 7 to z −4.
- **Arif's desk** (1.4 × 0.7, top 0.74) at (0, 0, 5.6), at the end of the aisle,
  facing −z: he sits at (0, 0, 6.2) looking straight down the aisle at the
  boss's door 9.6 m away ("karşısındaki kapı"). Monitor at (0.3, 0.74, 5.35)
  facing +z; keyboard; a stapler; **the resignation letter** under the stapler
  at (−0.35, 0.77, 5.45) (discovery).
- **8 colleague desks** at x ±1.6, ±3.9 × z 0.6, 3.0; each colleague sits at
  desk z + 0.5 facing −z, monitor facing them. Heads down, typing. They never
  look up.
- West wall (x −7): two elevators at (−7, 0, 2.0) and (−7, 0, 4.4) (steel doors
  1.1 m); the stairwell door at (−7, 0, 6.8) with a green "ÇIKIŞ" sign.
- **Boss's office** behind the north wall: x −2.5…2.5, z −9…−4, ceiling 2.9.
  - Desk (1.8 × 0.85, top 0.75, dark walnut) centred (0, 0, −7.0).
  - Black high-back chair at (0, 0, −7.85), reclined ~20°.
  - Monitor (0.55 m wide) at (−0.6, 0.75, −7.2), turned ~30° toward the chair.
  - **Pen holder** (cylinder r 0.04, h 0.1, six pens) at (0.62, 0.75, −6.85).
  - Window on the north wall (z −9): 3.0 × 1.6 m, y 0.9–2.5, city in morning
    sun (light from the right/east).
  - Potted plant (2.1, 0, −8.6). Framed photo (the boss on a boat) on the west
    wall at (−2.48, 1.6, −6.5). A guest chair at (0.4, 0, −6.0), unused.
  - Arif stands at (0, 0, −5.6) when he speaks.

### B — STAIRWELL (x 40)

Square shaft 4.5 × 4.5 m centred (40, ·, 0); 8 levels of 3.2 m (y 0…25.6).
Switchback concrete stairs, green steel handrail, fluorescent tube per
landing, huge stencilled floor numbers on the landing walls (7, 6, 5, 4, 3, 2,
1, Z). Ground exit door in the south wall at (40, 0, 2.25), push bar, "ÇIKIŞ".

### C — STREET + CAR (x 80)

- The tower's side exit at (80, 0, 4.0) opens onto a sidewalk; the street runs
  along z (traffic toward −z).
- **Arif's car**: compact sedan, dark grey `#3b4652`, 4.3 × 1.8 × 1.45 m,
  centred (82.2, 0, 2.0), nose toward −z. Driver (front left) at
  (81.8, 0.55, 2.2) facing −z. **Dashboard touchscreen** 0.26 × 0.16 m at
  (82.15, 1.0, 1.55), facing the driver. Passenger seat at (82.6, 0.55, 2.2): a
  **visit card** lies on it (discovery).
- City at dusk for the drive: blocks on both sides (x 68…78 and 93.5…104; the
  right sidewalk is wide, x 88…93.5), streetlights every 15 m, parked cars
  along the left kerb, moving traffic all faster than Arif, traffic lights.
  The car moves along −z (z 2 → −90 over `dusk`) and pulls out of the parking
  lane into the road's right lane (x 84.1) as it leaves.
- **Billboard** at (90.3, 0, −82) (panel centre y 6, 6 × 3 m) on the right
  sidewalk, turned to the oncoming lane (yaw −0.3): "ÖFKENİZİ EVE GÖTÜRMEYİN" +
  the calm-face logo + "ÖFKE NÖBETİ". In `dusk` the in-car camera slews from
  his profile to it (u 0.44–0.74) while it is 20–25 m ahead.

### D — ÖFKE NÖBETİ (x 140)

- **Exterior**: two storeys, facade at z 0 spanning x 132…148, white stone and
  pale wood slats, rounded corners, planters, a bench, warm lights. Rounded
  sans sign "ÖFKE NÖBETİ" in mint at (140, 4.2, 0.05), under it "ÜCRETSİZ KAMU
  HİZMETİ" (140, 3.6, 0.05), left of it the **logo**: a circle with a calm
  smile. Glass sliding doors at (140, 0, 0), 2.4 m. Arif's car stops at the
  curb at (143.5, 0, 5).
- **Reception**: x 134…146, z 0…−10, ceiling 3.5; pale floor, mint accents;
  curved counter (3 m) at (140, 0, −5.5); behind it a screen looping the logo.
- **Prep room** (also the locker room): x 134…142, z −11…−19; door from
  reception at (140, 0, −11).
  - **Prep chair** (white, padded, reclining) at (138, 0, −15), facing −z.
  - **Helmet**: a smooth white shell (r 0.16, height 0.38, open below, a soft
    blue light band) on a ceiling arm; parked at (138, 2.3, −15.1); lowered it
    covers the seated head **down to the neck** (centre y 1.38, rim y 1.15).
  - **Map screen** 0.9 × 0.55 m on an arm at (138, 1.25, −16.1), facing +z.
  - **Lens applicator**: a second arm with a twin-cup eyepiece, parked at
    (139.2, 1.6, −15.2). (The same model returns in ch. 8.)
  - Side table (139.0, 0, −14.6): a stainless tray with a pill in a paper cup
    and a paper cup of water.
  - Lockers along the west wall (x 134.3, z −12…−18), grey-white; **locker 17**
    at (134.3, 1.0, −16.5): a 30 × 54 cm mirror inside its door (centre
    y 1.5; the `hallu`/`away` camera looks over his head into it), a shelf at
    y 1.5 (his folded shirt, tie and **glasses** go there in `clothes` and
    come back out in `away`). Bench at (135.4, 0, −15).
  - **Info screen** 1.6 × 0.9 on the north wall at (136, 1.8, −18.95), facing
    +z (the "NASIL ÇALIŞIR?" explainer in ch. 6; fine print at its bottom edge).
  - Door to the white corridor in the east wall at (142, 0, −15).
- **Special clothes**: white-grey zip overalls (light grey `#cfd3d6` with white
  panels), soft white slip-on shoes.

### E — WHITE ROOM "ODA 3" (x 160)

- Interior 5 × 5 × 3 m: x 157.5…162.5, z −2.5…2.5, y 0…3. Every surface white,
  luminous ceiling, no shadows.
- **Door**: south wall centre (160, 0, 2.5), 1.0 × 2.1 m, flush, slides into
  the wall toward +x; closed it is **a hairline seam** in the white. Outside, a
  white corridor z 2.5…8 (the staff wait there), and above the door a plate
  "ODA 3" with a status light at (160, 2.45, 2.56): amber in ch. 4, green with
  "HAZIR" in ch. 7.
- **Hatch**: north wall, floor level, 1.8 × 0.5 m at x 160.4…162.2, flush white
  when shut. A **tray** (2.0 × 0.9 × 0.06 m, white, on rails; 1.8 m wide when
  there are two copies) slides in through it and stops centred (161.2, 0, −1.9),
  long axis x. **The corner** = the north-east corner (162.5, −2.5).
- **Reality**: 333 lies on the tray along the north wall, on his side, head at
  (162.0, 0.12, −1.9), feet toward x 160.3. Two copies: 333 lies on the tray's
  front half (z −1.1, nothing between his eyes and the door in ch. 9) and 334
  beside him along the wall (z −1.9); the blood lies in front of the wider tray.
- **The hallucinated office** = set A's boss's office translated by
  (+160, 0, +6.5): desk centre (160, 0, −0.5), chair (160, 0, −1.35), window
  on the north wall, monitor (159.4, 0.75, −0.7), pen holder
  (160.62, 0.75, −0.35), plant (162.1, 0, −2.1), photo on the west wall
  (157.52, 1.6, 0). The door is where the office door was. The boss's chair
  is one step from the tray: what Arif hauls out of the chair in `collar` is
  the man lying there.
- **Rule**: in ch. 4–6 the camera is inside Arif's perception: the convict is
  **invisible** (only a faint unexplained floor shadow in ch. 4, the
  `shadow` discovery). In ch. 7 and 9 the room is shown as it is.

### F — CONVICT LINE (x 220): one long industrial hall along −z

- **Loading bay** z 2…8: the prison van (white, windowless, thin blue stripe,
  "SEVK ARACI" on the side, 5.5 × 2.1 × 2.5 m) backed in at (220, 0, 6.5), rear
  doors at z 3.75. Guard 1 holds a clipboard (**manifest**, discovery) at
  (221.3, 1.25, 3.2).
- **Platform**: a 1.2 m steel conveyor at floor level from z 2 to z −38 along
  x 220. On it a vertical **restraint frame** (steel post, ankle clamps, a
  wrist bar) that the convict stands in and travels with; at the end of
  `inject` the frame tilts him flat onto the belt.
- **Wash tunnel** z −6…−13: three steel arches — foam bar (z −7, thick white
  foam), water bars (z −9.5, fans of spray), two vertical rotating brushes
  (r 0.35, blue-grey) at x 219.1 and 220.9 (z −11) and a horizontal top brush
  (y 2.1); amber rotating lights on top; drain grates.
- **Reading room** z −16…−27: a dark box 9 m wide, 6 m high. Two giant speaker
  cabinets (2 × 3.5 × 1 m, black, big round drivers) at (215.6, 0, −21) and
  (224.4, 0, −21). A **wall of 12 screens** (4 × 3, total 8 × 4.5 m) on the
  far wall z −26.9: scrolling case-file text, dates, a "333" header, a red stamp
  "İDAMI KESİNLEŞMİŞTİR", waveform bars synced to the reading voice. **Never
  images of the crimes.** The room's front wall (z −16) has a 1.3 m passage
  with a strip curtain; an overhead arm at z −19.6 lifts the hood off.
  (Set dressing: a wall clock reading 18.44 at (216.2, 3.2, −21).)
- **Injection station** z −30…−34, ceiling 2.4: three white robotic arms — pill
  arm (paper cup + water), **lens arm (same twin-cup model as the prep room)**,
  injector arm (slim white cylinder).
- **Line end** z −36…−38: a dark slot 1.8 × 0.6 m at floor level — the back of
  ODA 3's hatch.

### Cast

| figure | build | details |
|---|---|---|
| **ARİF** | m, ~38, height 1.0, average | short dark-brown hair, light stubble, **rectangular dark glasses**; white shirt, **navy tie**, charcoal trousers, black shoes; navy jacket at the end of the day. **Glasses off** from `lens` u 0.08 (held folded in his hand, then left in locker 17 in `clothes`). From `clothes` u 0.3 to `away` u 0.24: white-grey overalls, white slip-ons, **no glasses, no tie**. `away` u 0.28 on: his own clothes and glasses again. Walk: **short, hard steps**. |
| **PATRON** (and the copy) | m, ~55, height 1.04, heavy, round belly | bald crown, short grey sides, trimmed grey beard; pale blue shirt with an **open collar** (no tie), sleeves rolled, navy suit trousers, brown shoes (soles toward the door when his feet are on the desk), gold watch, phone in the right hand. |
| COLLEAGUES ×8 | 5 m, 3 f | muted shirts and sweaters (grey, beige, navy, olive); seated, heads down. |
| ELEVATOR CROWD ×10 | mixed | coats on, packed, all looking at Arif. |
| GÖREVLİ 1 | f, ~28 | hair in a low bun, mint tunic uniform, name badge, wide warm smile. |
| GÖREVLİ 2 | m, ~40 | mint scrubs, white gloves, calm and friendly. |
| TECHNICIAN | f, ~35 | mint scrubs, hair tied (escort, ch. 4 and 9). |
| ORDERLIES ×2 | m | grey coveralls, black gloves, surgical masks, rubber boots. |
| CLEANERS ×2 | m + f | pale yellow-grey overalls; trolley with mop, bucket, small floor scrubber; clipboard on the trolley (discovery). |
| **333** | m, ~45, height 0.98, thin, wiry | shaved head, pale; **grey boxer briefs only**; steel handcuffs; ankle shackles with a short chain; **black cloth hood** (until `reading`); a **white plastic neck band printed "333"** — his "yaka". Wet after the wash, limp after the injection. Frame him in respectful medium shots; never linger on the body. |
| 334 (two copies only) | m, ~30, height 1.02, heavier | same: shaved head, hood, briefs, band "334". Always one place behind 333. |
| GUARDS ×2 | m | navy uniforms, caps, gloves. |

---

## 3. Segment table

Global start in screens (`@`), length, set. Local timing `u` is 0–1 within the
segment. Text: `id` from–to (local) — *what the image shows then*.

### 01 — İSTİFA (17.0 sc) · set A · morning

**`open`** @0.0 · 1.0
- Arif sits at his desk, perfectly still, staring down the aisle at the boss's
  door; hands flat on the desk; lips move faintly (rehearsing). Colleagues
  type, heads down. Clock 09.13.
- Camera: from just in front of the boss's door down the aisle,
  (0, 1.55, −3.3) → (0, 1.1, 6.0), vfov 38, slow push to (0, 1.5, −1.5).
- Sound: keyboards, HVAC, a distant phone.
- `rehearsed` (center, −1–0.92, SCROLL) — *the far, still face of a man
  rehearsing a sentence.*

**`rise`** @1.0 · 1.0
- u 0.1–0.45 Arif stands in one decisive motion; u 0.2 the chair rolls back.
- Camera: cut, medium from his front-left (−1.6, 1.4, 3.6) → (0, 1.3, 5.9),
  vfov 40.
- `stood` 0.06–1.0 — *he rises, the chair rolling away.*

**`look`** @2.0 · 1.4
- Arif turns his head slowly from left to right across the room (u 0.05–0.9).
- Camera: over his right shoulder (0.5, 1.75, 6.7), target pans from
  (−4, 1.0, 1.5) to (4, 1.0, 1.5); vfov 45.
- `look` 0.04–0.98 — line 1 *as his look begins*; line 2 (u ≈ 0.43) *as the pan
  crosses the bowed heads: nobody looks up.*

**`sigh`** @3.4 · 1.2
- u 0.05–0.35 a deep breath (chest rises, shoulders drop); u 0.45–0.65 pushes
  his glasses up with one finger; u 0.7–0.95 straightens and tightens the tie
  knot with both hands.
- Camera: close-up from the front (0, 1.65, 4.9) → (0, 1.65, 5.95), vfov 32.
- `sigh` 0.05–1.0 — line 1 *the breath*; line 2 (u ≈ 0.43) *glasses, tie.*

**`knock`** @4.6 · 1.7
- u 0–0.5 he walks the aisle (z 5.6 → −3.5) with **short, hard steps**,
  passing the bowed colleagues; u 0.52 knocks twice on the frosted glass;
  u 0.6 freezes, fist still raised.
- Camera: low tracking from behind, (0, 1.2, z+1.8 behind him); at u 0.5 holds
  at (0.6, 1.6, −1.5) on the door and his raised hand; vfov 42.
- Sound: two knuckle raps (0.52–0.55); a muffled voice behind the glass (0.6).
- `steps` 0.04–0.56 — *the walk; the knock lands as the line ends.*
  `come-in` (İÇERİDEN) 0.6–1.0 — *the frosted glass, his raised hand frozen.*

**`enter`** @6.3 · 1.4
- u 0.05–0.4 left hand wipes the bead-like sweat from his forehead (glint);
  u 0.3–0.5 right hand turns the handle and opens the door inward; u 0.5–0.75
  he steps in fast; u 0.75–0.9 closes the door behind him without fully
  turning.
- Camera: close at the door (−0.9, 1.6, −2.6) → (0, 1.6, −3.7); u 0.6 cut inside
  the boss's office looking back at the door (1.5, 1.6, −7.6) → (0, 1.4, −4.4).
- Sound: latch click (0.78).
- `sweat` 0.06–1.0 — line 1 *the wipe and the handle*; line 2 (u ≈ 0.51) *the
  quick step in and the door closing.*

**`boss`** @7.7 · 1.7
- The boss reclines, feet on the desk (soles toward us), thumb scrolling the
  phone; morning sun behind him (rim light). He does not look up. u 0.64 he
  speaks, eyes still on the phone.
- Camera: from just inside the door, Arif's eye line, (0.25, 1.62, −4.6) →
  (0, 1.1, −7.6), vfov 40.
- `feet` 0.04–0.6 — *the feet, the phone, the sun.* `what` (PATRON) 0.64–1.0 —
  *lips move, thumb keeps scrolling.*

**`ask`** @9.4 · 1.9
- Arif stands at (0, 0, −5.6), hands clasped, then one hand open in appeal;
  u 0.52 half a step forward, firmer. The boss scrolls; at u 0.9 he glances up.
- Camera: side two-shot (−2.2, 1.5, −5.7) → (0, 1.3, −6.0), vfov 40.
- `ask-1` (ARİF) 0.03–0.48 — *head a little bowed.* `ask-2` (ARİF) 0.52–1.0 —
  *the half step, the open hand.*

**`laugh`** @11.3 · 1.8
- u 0.0–0.3 the boss throws his head back laughing, feet still on the desk;
  u 0.3 drops his head ("Üzgünüm Arif"); u 0.48–1.0 points the phone at Arif,
  then waves it toward the door.
- Camera: medium on the boss from the desk front (0.6, 1.3, −6.1) →
  (0, 1.15, −7.7), vfov 38.
- `haha` (PATRON) 0.03–0.44 — *the laugh.* `earn` (PATRON) 0.48–1.0 — *the
  phone pointed at Arif, then at the door.*

**`shh`** @13.1 · 1.6
- u 0.03–0.34 Arif opens his mouth, a hand half raised. u 0.34 cut to the
  boss: index finger to his lips, eyes already back on the phone; u 0.7 two
  fingers flick toward the door.
- Camera: u 0–0.34 on Arif over the boss's shoulder (0.3, 1.6, −6.4) →
  (0, 1.65, −5.6); then the reverse on the boss (0.2, 1.55, −5.9) →
  (0, 1.2, −7.7), vfov 34.
- `but` (ARİF) 0.03–0.34 — *cut off before the sentence exists.* `shh`
  (PATRON) 0.38–1.0 — *the finger on the lips, the flick.*

**`leave`** @14.7 · 2.3
- u 0.03–0.25 Arif nods. u 0.25–0.42 turns, opens the door, walks out fast; at
  the threshold (u 0.42) he lets go of the handle — **the door stays open
  ~70°**. u 0.52 the boss glances up at the open door, annoyed. u 0.66 cut to
  the open office: Arif walks back up the aisle, jaw tight, lips moving; sits
  at u 0.98.
- Camera: u 0–0.66 inside the boss's office (−1.2, 1.5, −8.2) → the door, the
  boss in the foreground; u 0.66 tracking backward in front of Arif
  (0, 1.55, z −2 → 4), vfov 42.
- Sound: the door opening and **not** closing (0.3); muttered curses (0.7).
- `okay` (ARİF) 0.03–0.25 — *the nod.* `ajar` (strong) 0.29–0.64 — *the door
  left open, the boss looking up.* `curse` 0.68–1.1 — *the walk back,
  muttering; colleagues still bowed.*

### 02 — YOL (8.0 sc) · sets A → B → C · dusk

**`pack`** @17.0 · 1.2
- Same open office at dusk; clock 18.00; colleagues stand and put on coats. u 0.1
  Arif switches off his monitor; u 0.2–0.5 jacket and bag; u 0.5–1.0 walks
  briskly west toward the elevators. The boss's door in the background is
  **closed** now.
- Camera: wide from the east (5.5, 2.2, 7) → (−3, 1.2, 3), vfov 45.
- `six-who` "18.00" (shown as the line's caption) + `pack` 0.24–0.98 — *jacket,
  bag, then the brisk walk to the elevators.*

**`elevator`** @18.2 · 1.0
- u 0.05 ding; the doors at (−7, 0, 2.0) open on a packed cab: ten people, all
  looking at him, nobody moves. u 0.7–0.95 the doors close in his face.
- Camera: behind his shoulder (−5.5, 1.65, 2.6) → (−7.5, 1.4, 2.0), vfov 40.
- `full` 0.06–1.08 — *the packed cab; the doors closing on him.*

**`stairs`** @19.2 · 1.4
- Set B. Arif bursts through the door and runs down, leaping three, five steps
  at a time, a hand sliding on the green rail; floors 7 → Z go by (u 0.1–0.95,
  continuous or with jump cuts).
- Camera: top-down the shaft (40, 26, 0.3) → (40, 0, 0), vfov 50; u 0.6 a side
  shot on landing "3" as he jumps five steps.
- `stairs` 0.12–1.0 — line 1 *into the stairwell*; line 2 (u ≈ 0.47) *the
  leaps.*

**`car`** @20.6 · 1.4
- u 0–0.22 set B: he hits the push bar of the ground exit (40, 0, 2.25) and the
  door swings out; u 0.22 cut to set C: he comes out of the side exit at
  (80, 0, 4) into the dusk, half runs to the car (u 0.25–0.45), jumps in
  (u 0.45–0.58), door shuts (0.58). u 0.62–1.0 his finger taps the dashboard
  screen.
- Camera: u 0–0.22 low at the stairwell exit (40.8, 1.0, −0.4) → (40, 1.1,
  2.25), vfov 40; u 0.22–0.5 wide street (84, 1.6, 9) → (81, 1, 2), vfov 42;
  u 0.5 interior from the passenger side (82.7, 1.25, 1.9) → (81.8, 1.1, 1.5).
- `out` 0.04–1.0 — line 1 *the exit door*; line 2 (u ≈ 0.42) *the jump into
  the car, then the screen.*

**`route`** @22.0 · 1.6
- Insert on the dashboard screen. He types; the destination field fills letter
  by letter "ÖFKE NÖBETİ" (u 0.1–0.4); u 0.4 the route lights through the map,
  a mint pin (calm-face logo), "23 DK · VARIŞ 18.32".
- Camera: (82.15, 1.05, 1.85) → (82.15, 1.0, 1.55), vfov 26.
- `route-screen` (world, drawn on the screen) 0.1–0.98. `clear` 0.06–0.94 —
  *typing.* `destination` (center, strong) 0.38–1.02 — *the name completes, the
  route lights.*

**`dusk`** @23.6 · 1.4
- The car drives through the city at dusk. Arif drives, hands tight on the
  wheel, **lips moving silently**; the radio's display is dark; city lights
  slide across his glasses. u 0.25–0.98 the billboard passes on the right
  (u 0.4–0.6 the camera tilts slightly toward it).
- Camera: in-car from the passenger side on his profile, vfov 40.
- Sound: engine, passing traffic; no music.
- `billboard` (world) 0.25–0.98. `radio` 0.08–1.0 — line 1 *the silent car,
  the dark radio*; line 2 (u ≈ 0.43) *his moving lips.*

### 03 — HİZMET (13.3 sc) · set D · evening

**`arrive`** @25.0 · 1.0
- u 0–0.3 the car pulls up at (143.5, 0, 5); u 0.35–0.5 Arif gets out; u 0.6–0.85
  the glass doors slide open; he goes in.
- Camera: wide from across the street (140, 2.0, 16) → (140, 2.4, 0), vfov 42;
  the sign glows mint.
- `sign` (world, the facade) 0.05–0.95. `in` 0.08–1.0.

**`welcome`** @26.0 · 1.9
- GÖREVLİ 1 and GÖREVLİ 2 come round the counter, smiling, hands clasped, like
  hotel staff. Arif stops before them with a tense half smile.
- Camera: over Arif's shoulder (140.4, 1.65, −2.0) → (140, 1.55, −4.6), vfov 38.
- Sound: soft muzak, a chime.
- `welcome-1` (GÖREVLİ) 0.03–0.42 — *a small bow.* `welcome-2` (GÖREVLİ)
  0.46–1.0 — *her smile widens on "berbat bir gündür"; GÖREVLİ 2 nods.*

**`helmet`** @27.9 · 1.8
- u 0–0.2 GÖREVLİ 2 seats him in the prep chair; u 0.25–0.55 the white helmet
  lowers over his head **down to his neck** (his face disappears; only the neck
  seam shows), the blue band brightens; u 0.55–1.0 the band pulses top→bottom;
  on the screen in front, faint flickering thumbnails of his day (traffic, the
  office, a door) — never the boss's face yet.
- Camera: side three-quarter (136.4, 1.5, −13.8) → (138, 1.3, −15.1), vfov 40.
- Sound: servo whir, rising scan hum.
- `scanning` (world, on the screen) 0.3–0.98. `device` 0.04–0.98 — line 1 *the
  seating and the helmet lowering*; line 2 (u ≈ 0.43) *the band pulsing down
  to the neck, the thumbnails flickering.*

**`map`** @29.7 · 2.6 · **GATE `moment` at 0.61**
- u 0–0.22 the screen: "YÜKLEME TAMAMLANDI"; the helmet lifts away (u 0.08–0.25).
- u 0.22–0.5 **the anger map** draws itself left to right: a day timeline
  07–19 h like a mountain range / heart monitor; labelled peaks 08.31 Trafik
  %31 · 09.14 Patronun odası %97 · 09.16 Açık bırakılan kapı %64 · 12.40
  Yemekhane sırası %19 · 18.02 Asansör %38. The 09.14 peak towers, red-orange;
  the rest mint. The camera pushes in on it (u 0.4–0.5).
- u 0.5–0.61 the 09.14 peak opens into **three sub-peaks**, each with a frozen
  still: 09.14.31 %91 (the boss laughing, head back), 09.14.38 %94 (the boss
  pointing his phone), 09.14.52 %97 (finger on his lips). The gate holds on
  this screen (no rail text on screen).
- After the pick (u 0.62–0.8): the chosen still enlarges, a mint check mark;
  the other two dim.
- Camera: over Arif's shoulder onto the screen (138.5, 1.45, −14.4) →
  (138, 1.25, −16.1), vfov 34.
- `uploaded` (world) 0.02–0.22. `map-label` (world) 0.25–0.98. `peaks`
  0.06–0.56 — line 1 *the day drawing itself*; line 2 (u ≈ 0.29) *the 09.14
  tower.* `picked` 0.66–1.0 — *the chosen still enlarging, Arif's head
  nodding once in the foreground.*

**`copies`** @32.3 · 1.8 · **GATE `copies` at 0.55**
- u 0–0.48 GÖREVLİ 2 leans in beside the screen with a tablet, friendly. The
  screen: a grey boss silhouette, "KOPYA: ?", a "+" button. The gate holds at
  0.55 on this screen.
- After the pick (u 0.6–0.8): one silhouette fills in mint — or a second
  identical one slides in beside it and fills in too.
- Camera: two-shot (136.8, 1.5, −14.0) → (138.2, 1.3, −15.6), vfov 40.
- `how-many` (GÖREVLİ) 0.04–0.48 — *the tablet, the smile.* `one-shape` /
  `two-shapes` 0.62–1.06 — *the silhouette(s) filling in.*

**`lens`** @34.1 · 1.4
- u 0.04–0.18 Arif takes off his glasses himself, folds them, keeps them in his
  left hand; u 0.18–0.5 the lens arm swings in, the twin cups touch his eyes, a
  soft hiss (0.45), he blinks; u 0.5–1.0 **his POV**: GÖREVLİ 2's smiling face
  goes soft, then snaps sharp, a faint mint shimmer at the edges.
- Camera: close profile (139.3, 1.4, −15.0) → (138, 1.38, −15.1), vfov 30; u 0.5
  POV (138, 1.4, −15.0) → (138.7, 1.6, −16.0).
- `lens` 0.1–1.0 — line 1 *the applicator*; line 2 (u ≈ 0.51) *blur → sharp.*

**`pill`** @35.5 · 1.0
- GÖREVLİ 1 hands him a paper cup with one white pill, then water; he swallows
  (throat).
- Camera: close (138.9, 1.35, −14.6) → (138, 1.35, −15.0), vfov 32.
- `pill` 0.06–1.0.

**`clothes`** @36.5 · 1.8
- u 0.05 GÖREVLİ 1 opens locker 17: folded white-grey overalls and slip-ons.
  u 0.1–0.3 he undoes the tie, unbuttons; cut on action; u 0.3–0.46 he zips up
  the overalls; his shirt and tie go folded onto the locker shelf. He still
  holds his glasses. u 0.52–1.0 GÖREVLİ 1 nods at them, smiling; Arif
  hesitates, looks at the glasses, then lays them on top of the folded shirt.
- Camera: from the bench (135.6, 1.4, −14.4) → (134.3, 1.3, −16.5), vfov 40;
  u 0.6 insert on the shelf: the glasses set down on the shirt (134.6, 1.55,
  −16.3) → (134.3, 1.5, −16.5), vfov 28.
- `clothes` 0.04–0.48 — *tie, buttons, the zip.* `glasses` (GÖREVLİ) 0.52–1.0 —
  *the hesitation; the glasses laid on the shirt.*

### 04 — ODA (10.4 sc) · set E · Arif's perception

**`white`** @38.3 · 1.2
- The white corridor: GÖREVLİ 2 and the technician walk Arif (overalls, no
  glasses) from (160, 0, 8) to the door; amber light, "ODA 3"; u 0.7 the door
  slides open on pure white.
- Camera: tracking behind them (160, 1.6, 9.5 → 160, 1.6, 5), vfov 42.
- `five` 0.08–1.0.

**`close`** @39.5 · 1.4
- u 0–0.25 Arif steps in to (160, 0, 1.6); the staff stay outside. u 0.25–0.45
  the door slides shut — **the seam closes to a hairline**. u 0.45–0.96 hold on
  the hairline in the white, Arif's shoulder at the frame edge. The room is
  **empty** to him.
- Camera: u 0–0.45 from inside (158.2, 1.6, −1.6) → (160, 1.3, 2.5), vfov 42;
  u 0.45 close on the seam (159.4, 1.5, 1.8) → (160, 1.1, 2.5), vfov 30.
- Sound: the door's airtight hiss + thunk (0.3) (**this exact sample returns in
  ch. 7 and 9**); then near silence.
- `closed` 0.06–0.96 — line 1 *the door shutting*; line 2 (u ≈ 0.46) *the
  hairline.*

**`color`** @40.9 · 1.0
- Arif's POV turns slowly; u 0.2 the first warm patch appears on the north wall
  at the window position and on the floor by the desk position, spreading.
- Camera: POV (160, 1.62, 1.6) → (160, 1.4, −2.5), vfov 50.
- Sound: a low hum rising.
- `color` 0.1–1.0. QUIET from here to `same`.

**`pixels`** @41.9 · 1.6
- The office develops **pixel by pixel**: a mask of blocky cells (~6 cm) grows
  over the walls from several seeds (window, desk, door frame), revealing the
  office textures beneath.
- Camera: slow 270° pan from Arif's POV (west → north → east), vfov 50.
- Sound: granular crackle, like ice settling.
- `pixels` 0.04–1.0 — line 1 *first cells*; line 2 (u ≈ 0.4) *a wall half
  converted, a sharp border of cells.*

**`towel`** @43.5 · 2.0
- The simile as image: the colour **wicks** across the remaining white like
  water into a dry towel — soft capillary fronts with a darker "wet" edge
  (noise-driven threshold) across the floor and ceiling; the desk, monitor, pen
  holder and plant materialize last.
- Camera: u 0–0.5 macro on a wet front crossing the desk surface
  (160.3, 0.95, 0.2) → (160.0, 0.75, −0.4), vfov 36; u 0.5–1.0 pull back to a
  wide from the door (160, 1.7, 2.3) → (160, 1.1, −1.0), vfov 50.
- `towel` 0.04–1.0 — line 1 *the wet front*; line 2 *the wide reveal.*

**`same`** @45.5 · 1.6
- The office is complete: the morning's office exactly — sun beams through the
  window (it is night outside), the empty chair, the photo, the plant, the pen
  holder, the monitor.
- Camera: POV dolly (160, 1.62, 1.8 → 1.2) → (160, 1.2, −1.4), vfov 44.
- Sound: the ch. 1 boss's-office ambience fades in (city through glass,
  keyboards beyond the door).
- `same` 0.04–1.0 — line 1 *the full reveal*; line 2 (u ≈ 0.46) *the camera
  finding small details: the photo, the pen holder, the clock at 09.14.*

**`appear`** @47.1 · 1.6
- u 0.08–0.46 in the chair a man assembles out of the same pixel cells: the
  shoe soles on the desk first, then legs, body, the phone — **the boss**, the
  exact ch. 1 pose, scrolling. Two copies: from u 0.15 a second boss assembles
  **standing at the window** (161.5, 0, −2.0), also scrolling; both complete by
  u 0.48.
- Camera: the ch. 1 `boss` framing, translated: (160.25, 1.62, 1.9) →
  (160, 1.1, −1.1), vfov 40.
- `appear` / `appear-two` 0.06–1.0 — line 1 *assembling*; line 2 (u ≈ 0.48)
  *complete: the thumb starts scrolling.*

### 05 — NÖBET (10.2 sc) · set E · the violence never lands

**`trigger`** @48.7 · 1.2
- The copy says the chosen line (see Choices for the three poses). Two copies:
  both say it in unison, one voice.
- Camera: the ch. 1 `laugh` framing, translated: (160.6, 1.3, 0.4) →
  (160, 1.15, −1.4), vfov 38.
- `copy-laugh` / `copy-money` / `copy-shh` (PATRON) 0.1–0.92.

**`collar`** @49.9 · 1.4
- u 0.05–0.25 Arif lunges across the desk; u 0.25–0.5 grabs the shirt collar with
  both fists and hauls the boss up out of the chair (standing at
  (160, 0, −1.0)); u 0.3 the chair topples; u 0.5–1.0 he screams into his face.
  u 0.2–0.3 one wall patch flashes white.
- **Hidden** (u 0.2–1.0): inside the collar between Arif's fists, a small white
  tag "333" flickers in for 2–3 frames at a time (discovery `collar-tag`).
- Camera: tight side two-shot (158.4, 1.55, −0.6) → (160, 1.45, −0.9), vfov 34.
- `lost` 0.04–1.0 — line 1 *the lunge, the grab*; line 2 (u ≈ 0.48) *the
  scream into the face.*

**`shout`** @51.3 · 1.8
- Close-up on Arif's face over the boss's shoulder (the boss's head soft in the
  foreground). Behind Arif, white patches bloom and fade on the walls with each
  shout.
- Camera: (160.15, 1.6, −1.4) → (160, 1.62, −0.55), vfov 30.
- `shout-1` (ARİF) 0.03–0.42 — *the first shout; a patch blooms white.*
  `shout-2` (ARİF) 0.46–1.0 — *the second, louder; two patches.*

**`blows`** @53.1 · 1.6
- Each blow (u 0.08, 0.2, 0.32, 0.44) is **cut on the swing**: Arif's shoulder
  and arm, a white flash frame, a white patch bursting on the wall. The boss is
  never seen being hit (blocked by Arif's body or below the desk line); the
  words carry the face, the image never does. u 0.55 they crash into the
  **west** wall — the framed photo falls (157.52, 1.6, 0); u 0.78 the east
  wall, by the plant.
- Camera: wide from the door corner (162.1, 1.9, 2.2) → (159.5, 1.2, −0.6),
  vfov 46.
- `blows` 0.04–1.0 — line 1 *the swings, flash after flash*; line 2 (u ≈ 0.5)
  *the walls, the photo falling.*

**`could`** @54.7 · 1.4
- Slow motion: Arif's face mid-swing, lit by flashes — exhilaration, release.
  The office holds behind him for a moment.
- Camera: (159.2, 1.55, 0.0) → (159.9, 1.6, −0.6), vfov 32, slow push.
- `could` 0.05–1.0 (strong) — line 1 *the face in the flashes*; line 2
  (u ≈ 0.43) *at the peak of the slow motion: the fist at the top of its arc.*

**`monitor`** @56.1 · 1.6 · QUIET
- Fast cuts, one object each: u 0.1–0.32 **the monitor** bursts — seen from its
  back/side — into a cloud of white pixel shards (not glass, not blood); u
  0.32–0.5 a white glitch crack across the wall at head height; u 0.52–0.8
  Arif's hand reaches into frame toward **the pen holder**, which tips over in
  slow motion, pens rolling off the edge — the hand closes on nothing we see
  (desk-level camera (160.9, 0.82, −0.1) → (160.62, 0.78, −0.35)); u 0.8–1.0 a
  long white flash. Two copies: the second boss stands at the window in the
  background of the monitor shot, **still scrolling** (in focus u 0.04–0.3).
- Camera (monitor and wall cuts): (158.9, 1.2, −1.3) → (159.4, 1.0, −0.7),
  vfov 36.
- `monitor` 0.04–1.0 — line 1 *the monitor bursting, then the wall*; line 2
  (u ≈ 0.52) *the reaching hand, the pen holder tipping.*

**`subside`** @57.7 · 1.2 · QUIET
- Silence. The room is mottled — half office, half white, like a towel half
  dry. Arif stands with his back to us, shoulders heaving, arms hanging, hands
  in shadow. The copy is not visible (below the desk, out of frame). Two copies:
  u 0.04–0.3 the second boss at the window, still scrolling, never looking up;
  Arif turns to him (0.2–0.3) and walks over (0.3–0.46); a white flash (u 0.48);
  then the same silent image (u 0.52–1.0).
- Camera: low from the door (160, 1.2, 2.3) → (160, 1.3, −0.6), vfov 40.
- `subside` 0.1–1.0 (strong) — *the heaving back in the mottled room.*
  `subside-two` 0.04–1.0 (strong) — line 1 *the second copy scrolling, Arif
  turning*; line 2 (u ≈ 0.52) *after the flash: the heaving back.*

### 06 — HİZMETİN BEDELİ (14.4 sc) · sets E → D · the brochure

**`done`** @58.9 · 2.0
- u 0.05–0.4 inside, from the hallway side: Arif straightens up in the
  mottled room, wipes his mouth with the back of his hand, breathes out. u 0.45
  a soft chime; u 0.6 the door slides open on mint corridor light; GÖREVLİ 2
  waits with a folded white towel. u 0.68–1.0 Arif walks out without looking
  back, takes the towel — **he smiles**, the first smile of the story.
- Camera: from the corridor, the door still shut (a hairline) until u 0.6, then
  through the opening door (160, 1.6, 4.5) → (160, 1.6, 1.4), vfov 36. For
  u 0.05–0.4 a soft cut inside on Arif's face and shoulders (159.2, 1.6, 0.4)
  → (160, 1.6, 1.4), the room behind him overexposed to near-white and out of
  focus; **the north-east corner is never in frame**.
- `done` 0.05–0.42 — *the breath, the hand across the mouth.* `free` 0.46–1.0 —
  *the door opening; the towel; the smile.*

**`how`** @60.9 · 1.6
- Locker room. Arif on the bench, towel round his neck, his back
  three-quarters to the info screen. The screen plays a cheerful animated
  explainer in flat mint/white pictograms: title "ÖFKE NÖBETİ · NASIL ÇALIŞIR?"
  (u 0–0.1); step 1: a face outline assembling from pixels + an office icon.
  Arif dries his face.
- Camera: low behind Arif (135.0, 1.2, −13.0) → the screen (136, 1.8, −18.95),
  vfov 40; Arif soft in the foreground.
- Sound: the explainer's bright jingle (xylophone/ukulele).
- `how-cap` (caption, the whole brochure, 0.02 → `executed` 0.98). `how-1`
  0.05–1.0 — *step 1.*

**`reveal`** @62.5 · 2.0
- Step 2 (u 0–0.48): an eye + a lens + a pill → a person outline whose face
  becomes a generic "angry boss" pictogram (tie, frown). Arif drinks water.
- Step 3 (u 0.52–1.0): the boss face **peels off like a sticker**, revealing a
  plain grey silhouette with a white neck band "###" and a red stamp "İDAMI
  KESİNLEŞMİŞ". Arif is not watching: he looks at his right hand, flexes it
  (knuckles in shadow).
- Camera: slow push past Arif toward the screen (135.5, 1.4, −14.0) →
  (136, 1.7, −18.9), vfov 38.
- `how-2` 0.03–0.48 — *step 2.* `how-3` 0.52–1.0 (strong) — *the sticker
  peeling.*

**`again`** @64.5 · 1.8
- Step 4 (u 0.04–0.44): icons "×1" and "×2" (one and two silhouettes) — the one
  matching the reader's choice is ticked. Step 5 (u 0.48–1.0): a circular arrow
  around a clock face reading 09.14, "AN TEKRAR". Arif stands, rolls his neck,
  opens locker 17 (u 0.5): his folded shirt, the glasses on top.
- Camera: medium side (137.2, 1.5, −15.6), framing Arif and the screen, vfov 44.
- `how-4` 0.04–0.44 — *×1 / ×2.* `how-5` 0.48–1.0 — *the circular arrow.*

**`hallu`** @66.3 · 1.4
- Step 6: a head silhouette with swirling lines. Arif looks at himself in the
  locker mirror: his face without glasses, a little unfocused, calm; the info
  screen reflected small in the mirror's corner. He does not look round at it.
- Camera: over his shoulder into the mirror (134.9, 1.65, −15.9) →
  (134.35, 1.6, −16.6), vfov 30.
- `hallu` 0.04–1.0.

**`nolimit`** @67.7 · 2.0
- Step 7 (u 0.03–0.52): a mouth icon and a fist icon, both ticked: "SÖYLE ·
  YAP". Step 8 (u 0.56–1.0): the frame around the pictograms breaks open and
  dissolves — "SINIR YOK". Arif's reflection on the screen's glass pulls the
  overalls' zip down to his chest (u 0.6).
- Camera: the screen nearly full frame (136, 1.6, −16.5) → (136, 1.8, −18.95),
  vfov 36; Arif's reflection faint on its glass.
- `say-do` 0.03–0.52. `no-limit` 0.56–1.0 (strong).

**`executed`** @69.7 · 1.2
- Step 9: a check mark in a circle and a stress meter falling red → green,
  "STRES: %0"; the jingle resolves (0.5); the screen loops back to the title.
  Arif sits back down on the bench, elbows on his knees, eyes closed,
  breathing slowly — the calmest he has been all day.
- Camera: wide of the locker room (141, 2.0, −12.2) → (135.5, 1.2, −16), vfov 46.
- `executed` 0.05–0.98.

**`away`** @70.9 · 2.4
- u 0.04–0.1 at the mirror: combs his hair with his fingers, straightens
  himself. u 0.1–0.24 he steps out of the overalls and drops them on the bench,
  shirt and trousers on (cut on action). **u 0.28 takes the glasses from the
  shelf and puts them on.** u 0.3–0.56 ties the tie, jacket on, one last look
  in the mirror. u 0.6–1.0 walks out through reception (GÖREVLİ 1 waves), out
  through the sliding doors into the night, gets into his car (u 0.78); the
  car pulls away (u 0.86–1.0), taillights.
- Camera: u 0–0.58 the mirror as in `hallu`; u 0.58 reception, then wide
  exterior night (140, 2.0, 16) → (143.5, 1.0, 5), vfov 42.
- Sound: zip, locker, sliding doors, engine (0.82).
- `dress` 0.04–0.56 — line 1 *hair, the overalls dropped, his own clothes*;
  line 2 (u ≈ 0.28) *the glasses going on.* `gone` 0.6–1.0 — *reception, the
  doors, the car, taillights.*

### 07 — TEMİZLİK (6.2 sc) · set E · the room as it is

**`staff`** @73.3 · 1.0
- u 0.08 the door slides open (the same hiss); two ORDERLIES step in (u 0.2–0.8).
  No office, no colour but their grey.
- Camera: high in the south-west corner (157.8, 2.75, 2.3) → (160.2, 0.8, 0.5),
  vfov 52; the north-east corner at the far right of frame, in the dimmer zone.
- `staff-in` 0.08–1.0.

**`corner`** @74.3 · 1.4 · QUIET
- Hold the wide; the camera drifts right (target → (161.6, 0.3, −1.8)) to show
  that everything is white except the corner: a low dark shape on the tray along
  the north wall, partly hidden behind the orderlies' legs, and **dark
  red-brown smears** on the floor around it — abstract, in shadow, no wound, no
  face, no detail. Two copies: two shapes.
- `corner` / `corner-two` 0.04–1.0 — line 1 *the white room, the orderlies'
  backs*; line 2 (u ≈ 0.46) *the drift reaches the corner.*

**`drag`** @75.7 · 1.4 · QUIET
- u 0.04–0.35 the orderlies walk in with sure steps; u 0.4 take the ankles and
  pull. The frame top cuts at shin height: we see boots and **a dark smear being
  drawn across the white floor** toward the camera (u 0.5–0.95); they exit past
  the camera through the door. Two copies: they return for the second, faster
  (u 0.7–0.95).
- Camera: floor level near the door (159.6, 0.3, 2.3) → (161.5, 0.3, −1.5),
  vfov 40.
- Sound: a long soft scrape (0.4).
- `drag` / `drag-two` 0.04–1.0 — line 1 *the sure steps*; line 2 (u ≈ 0.44)
  *the hands on the ankles, the smear drawn toward us.*

**`cleaners`** @77.1 · 1.0
- Two CLEANERS push in a trolley (u 0.06–0.3) and park it by the door
  (159, 0, 1.9) — a clipboard on top (`cleaning-log`); mop strokes erase the
  smear (u 0.3–0.95); a small floor scrubber hums.
- Camera: medium (158.4, 1.7, 2.0) → (161.0, 0.2, −1.2), vfov 44.
- `cleaners` 0.06–1.0.

**`restart`** @78.1 · 1.4
- The room is pristine and seamless. The cleaners leave (u 0.1–0.35), the door
  closes (u 0.35). u 0.45 cut to the corridor: the status light above the door
  turns green, "ODA 3 · HAZIR" (u 0.5). u 0.55 a beep; behind the north wall
  the hatch mechanism clunks and whirs (sound only).
- Camera: u 0–0.45 wide of the empty room (157.8, 2.75, 2.3) → (160.4, 0.6, −0.6);
  u 0.45 corridor (160, 1.8, 6.5) → (160, 2.45, 2.56), vfov 34.
- `ready` (world, the status light) 0.5–0.98. `restart` 0.08–1.0 (strong).

### 08 — 333 (11.0 sc) · set F · the same evening, earlier

**`van`** @79.5 · 1.2
- Loading bay, sodium orange. u 0.05 the van's rear doors swing open: inside, a
  hooded figure on a bench. Guard 1 checks his clipboard (`manifest`).
- Camera: wide from the bay floor (223.5, 1.6, −1.0) → (220, 1.3, 3.8), vfov 44.
- `evening-who` "AYNI AKŞAM · 18.21" + `transfer` 0.08–1.0.

**`record`** @80.7 · 1.6
- u 0.08–0.44 Guard 2 climbs in and pulls 333 by the arm to the van's edge.
  u 0.48 insert: the hood's hem and **the white neck band "333"** in the orange
  light, held to the end.
- Camera: u 0–0.48 medium (221.6, 1.7, 2.0) → (220.2, 1.4, 4.0); u 0.48 insert
  (220.35, 1.55, 3.2) → (220, 1.5, 3.7), vfov 22.
- `crime` 0.04–1.0 — line 1 *the hooded man pulled to the edge*; line 2
  (u ≈ 0.48) *the band.*

**`hood`** @82.3 · 1.4
- 333 stands at the van's edge: cuffed hands, shackled ankles, black hood, grey
  briefs only — a respectful medium-wide from the side, flat orange light. u 0.3
  the chain rattles.
- Camera: (223.0, 1.4, 3.6) → (220, 1.2, 3.7), vfov 40.
- `bound` 0.04–1.0 — line 1 *cuffs, chain, hood (the camera tilts from the
  ankles up)*; line 2 (u ≈ 0.5) *the whole figure, small in the bay.*

**`platform`** @83.7 · 1.4
- u 0.04–0.35 the guards lift him down and walk him to the conveyor; u 0.4–0.7
  they lock his ankles into the restraint frame and his cuffed wrists to the
  bar; u 0.5 the belt starts and he moves away along −z. Two copies: u 0.48–0.95
  a second hooded man (band "334") is brought down and clamped in one place
  behind.
- Camera: (221.8, 1.6, 4.5) → (220, 1.0, 1.0), vfov 44.
- `platform` / `platform-two` 0.04–1.0 — *lifted down, clamped, the belt
  starting*; `platform-two` line 2 (u ≈ 0.48) *the second man brought down.*

**`wash`** @85.1 · 1.4
- The wash tunnel: u 0.04–0.45 the belt carries him into the tunnel mouth,
  amber lights rotating, a green "BAŞLA" lamp; foam arch (u 0.48–0.64)
  drenches him, white foam over the black hood; water bars (u 0.64–0.8); the
  brushes spin past (u 0.8–0.98); the hood sags wet. A car wash, for a man.
- Camera: in front of the line looking back at him coming through
  (220, 1.6, −14.5) → (220, 1.2, −8.5), vfov 42.
- `wash` 0.04–1.0 — line 1 *the tunnel mouth*; line 2 (u ≈ 0.52) *"köpük, su,
  fırça…" as each passes.*

**`reading`** @86.5 · 2.0
- u 0.03–0.48 the platform carries him into the dark room; u 0.3 the overhead arm
  lifts the wet hood: shaved head, squinting — keep the face a silhouette
  against the screens. The screen wall lights up. u 0.52–1.0 the giant speakers
  boom: a flat official voice reads (no intelligible words needed); the screens
  scroll case-file text, dates, "333", the red stamp; behind the voice: sirens,
  a courtroom murmur, a gavel. He flinches at each boom.
- Camera: wide from behind him, just inside the passage (220.6, 2.5, −16.5) →
  (220, 2.3, −25), vfov 58 (the wall of screens lit from the start);
  u 0.6 side view (216.5, 1.6, −20) → (220, 1.6, −21), the speakers dwarfing him.
- `reading` 0.03–0.48. `crimes` 0.52–1.0.

**`inject`** @88.5 · 2.0
- u 0.05–0.2 the pill arm presses a pill to his lips, then water; u 0.2–0.35 the
  **lens arm (the prep-room model)** — soft hiss; u 0.35–0.48 the injector arm
  to his neck — click. u 0.5–1.0 he sags; the clamps release and the frame
  tilts him flat onto the belt; the belt carries him toward the dark slot at
  z −36.
- Camera: close (221.2, 1.6, −31.0) → (220, 1.5, −32), vfov 36; u 0.55 wider
  (222.5, 2.0, −30) → (220, 0.4, −35.5).
- `inject` 0.03–0.48. `resist` 0.52–1.0 — *limp on the belt.*

### 09 — KAPI (6.4 sc) · set E · from the floor

**`floor`** @90.5 · 1.4
- u 0.05 the north hatch slides open; u 0.1–0.45 the tray glides in with 333
  lying on it and stops in the north-east corner; u 0.5 the hatch closes. Two
  copies: 334 lies beside him; the wide holds to u 0.62, pushing in on the two
  side by side, and the POV starts there.
- Camera: u 0–0.47 **the ch. 4 `towel` wide from the door**, same position
  (160, 1.7, 2.3), panning to the corner (161.2, 0.3, −1.9): the room that
  looked empty to Arif, with a man on the floor where the shadow was. u 0.47
  cut to **333's POV**: floor level at his
  head (161.85, 0.22, −1.85) looking diagonally across the floor at the door
  (160, 1.0, 2.5), vfov 55 — heavy blur, vignette, overexposure, slow breathing
  sway, his own cuffed hand blurred in the near foreground.
- Sound: from here everything is lowpassed (muffled, underwater); heavy drugged
  breathing, heartbeat.
- `arrived` / `arrived-two` 0.06–1.0 — line 1 *the tray coming in*; line 2
  (u ≈ 0.47) *the POV.*

**`doorOpens`** @91.9 · 1.2 · QUIET to the end
- POV holds. u 0.12 **the hairline seam** (the one from ch. 4) splits; the door
  slides open with the same hiss; mint-white corridor light floods in; in the
  doorway three silhouettes: two staff in mint and, between them, a man in
  white-grey overalls.
- `door-opens` 0.1–1.0 — *the seam splitting, the light, the three
  silhouettes.*

**`enters`** @93.1 · 1.4
- u 0–0.3 the man steps in; the staff step back; u 0.6 the door closes (same
  hiss). u 0.6–1.0 he stands in the middle of the room (160, 0, 1.6) and slowly
  turns his head, looking around at the white walls — up, left, right — as if
  watching something spread across them (**Arif's `pixels`/`towel` moment,
  seen from outside**). No glasses. His face is never in focus; the overalls and
  white slip-ons are clear.
- `man` line 1 "İçeri bir adam girdi;" from u 0.06 (the item runs to `comes`
  0.98).

**`comes`** @94.5 · 1.2
- u 0.0 his head turns down toward the corner — toward us; a beat (u 0–0.2), a
  faint flicker of warm light across his face (in his eyes, the boss has just
  appeared). u 0.2 he comes at the camera with **short, hard steps**, cursing:
  muffled, words unintelligible — **the same voice as Arif's shouts in ch. 5**,
  lowpassed. He fills the frame; u 0.9 his hands reach down toward the lens.
- `man` line 2 "küfürler savurarak üzerine geliyordu…" arrives at u 0.0.

**`black`** @95.7 · 1.2
- **Hard cut to black at u 0.0.** Absolute silence.
- `end` (center, final) 0.3 → 5: "ÖFKESEL DENEYİM SİMÜLASYONU" / sub "ÖFKE
  NÖBETİ · ÜCRETSİZ KAMU HİZMETİ".

---

## 4. Choices

### `moment` — ÖFKE HARİTASI · 09.14 (segment `map`, holds at 0.61)

Query style; the screen shows the three sub-peaks of 09.14. Flags:
`moment:laugh`, `moment:money`, `moment:shh` (the default when no flag is set
is `shh`, the source's last line). **It changes one line the copy says in
`trigger`, and the copy's pose — nothing else.**

| option | tag | the copy in `trigger` |
|---|---|---|
| “Hahaha… Üzgünüm Arif, seni bırakamam.” | 09.14.31 · %91 | head thrown back laughing, then drops it: "Üzgünüm Arif" |
| “Bize çok para kazandırıyorsun.” | 09.14.38 · %94 | points the phone at Arif, almost friendly |
| “Şş… Hadi dışarı, çıkarken kapıyı kapat.” | 09.14.52 · %97 | finger to his lips, eyes on the phone, two fingers flick toward the door |

Also on the map screen after the pick: the chosen still enlarges with a check
mark (u 0.62–0.8), and `picked` (0.66–1.0) says Arif chose the boss's moment.
Replies (GÖREVLİ): "Kahkaha. İyi bir seçim efendim." / "Bu cümle bu ay çok
seçiliyor." / "En yüksek tepe. Çoğu kişi onu seçer."

### `copies` — KOPYA SAYISI (segment `copies`, holds at 0.55)

Flags `copies:one` / `copies:two` (default: one). This darkens the reveal: two
copies are two condemned men.

| | one (`Bir tane yeter.`) | two (`İki olsun.`) |
|---|---|---|
| `copies` | one silhouette fills in | a second identical silhouette slides in |
| `appear` | one boss in the chair | plus a second boss standing at the window, scrolling |
| `trigger` | one voice | both say the line in unison, one voice |
| `monitor` | — | the second boss in the background, still scrolling |
| `subside` | silence; "Sonra dindi." | the second still scrolling; Arif turns to him, a white flash, then silence; "Öteki hâlâ telefonuna bakıyordu. Arif ona döndü. / Sonra dindi." |
| `again` (explainer) | "×1" ticked | "×2" ticked |
| `corner`, `drag` | one shape, one drag | two shapes, they come back for the second |
| `platform`, `floor` | 333 alone | 334 one place behind on the belt; beside him on the tray |

---

## 5. Discoveries

| id | what | where (m) | when | why |
|---|---|---|---|---|
| `letter` (subtle, OKU) | the resignation letter under Arif's stapler; date crossed out four times, the last one today | (−0.35, 0.77, 5.45) | `open` → `rise` | "Dört aydır": he has walked to that door before. |
| `boss-phone` (subtle, BAK) | the boss's phone (right hand): a holiday listing, seven nights, all inclusive, "Sepete eklendi." | (−0.2, 1.0, −7.45) | `boss` → `ask` | what he scrolls while Arif begs. |
| `visit-card` (subtle, OKU) — "Üye kartı" | a mint membership card on the passenger seat: "ÖFKE NÖBETİ · Arif K. · 17. ziyaret" | (82.6, 0.62, 2.2) | `car` 0.5 (he is in the car) → `route` | he is a regular (17 visits in four months; locker 17); the process repeats for him too. |
| `anger-map` (visible, OKU) | the full list of today's peaks | (138, 1.25, −16.1) | `map` 0.22 → 1 (once the map is drawn) | the whole day's anger, itemized. |
| `shadow` (subtle, BAK) | a soft floor shadow in the north-east corner cast by nothing | (161.7, 0.02, −1.9) | `white` 0.7 (the door opens) → `color` | 333 is already lying there; Arif cannot see him. Render: a faint dark ellipse on the white floor. |
| `morning-window` (subtle, BAK) | morning sun through the rebuilt window | (160, 1.6, −2.48) | `same` → `appear` | it is night outside. |
| `collar-tag` (hidden, BAK) | a white tag "333" glitching inside the boss's collar | (160, 1.5, −0.9) | `collar` 0.2 → `shout` | "yaka": the collar Arif grabs is the convict's neck band. |
| `fine-print` (subtle, OKU) | under the explainer: "Hükümlüler infaz sırasına göre atanır. Hükümlünün kimliği kullanıcıyla paylaşılmaz." | (136, 1.4, −18.95) | `how` → `executed` | the brochure's small print. |
| `cleaning-log` (subtle, OKU) | the cleaners' clipboard: ODA 3, today's seventh use, average twelve minutes | (159.0, 1.0, 1.9) | `cleaners` 0.3 (trolley parked) → `restart` | the room is a line, not an event. |
| `manifest` (subtle, OKU) | the guard's list: 331 ✓ · 332 ✓ · 333 · 334; next to 333, by hand: ODA 3 | (221.3, 1.25, 3.2) | `van` → `record` | ties 333 to Arif's room. |

---

## 6. Sound

**Ambience by chapter.**
1. Open-plan office: keyboards, HVAC, a distant phone, muted chatter. Boss's
   office: quieter, the city through glass, the tap of a thumb on glass; his
   laugh — big, warm, careless.
2. The office emptying; elevator ding; stairwell with long reverb and fast
   footsteps; a heavy steel door; dusk street (traffic, wind); car door; screen
   beeps; engine and passing cars. **No music** (the radio stays off).
3. Warm exterior; inside, gentle muzak that never quite resolves, a reception
   chime; prep room: servo whir, rising scan hum, a cheerful three-note
   "upload complete", lens hiss, paper cups, a locker door.
4. White room: near silence, a thin high room tone; the **door hiss + airtight
   thunk** (one sample, reused in ch. 7 and 9); the transformation: a low rising
   hum with granular crackle; then the boss's-office ambience of ch. 1 fades in.
5. The copy speaks with **the boss's voice from ch. 1** (identical); Arif
   shouting; blows as muffled thuds married to white-noise bursts on each flash;
   a body against a wall (deep thump, the photo falling); the monitor as a
   digital crunch/pixel shatter (not glass); pens as tiny plastic clatters;
   then silence and breathing.
6. Corridor chime; the explainer's bright jingle (resolves on `executed`);
   zip, locker; night outside; engine starts, drives off.
7. Room tone; the door hiss; boots; a long soft scrape; mop, bucket, a
   scrubber's whine; a beep; the hatch mechanism behind the wall.
8. Diesel idle, van doors, chains; the conveyor's rhythmic clank; the wash
   (spray hiss, brush whirr, dripping); in the reading room an enormous flat
   voice through giant speakers with a long reverb, sirens, a courtroom murmur,
   a gavel; servo whir, hiss, click.
9. Everything lowpassed (underwater): drugged breathing, heartbeat; the door
   hiss (same sample); soft slip-on footsteps in a quick, hard rhythm; muffled
   cursing in Arif's voice; on the cut to black, total silence.

**Key one-shots** are listed in `CAPTIONS` in `text.ts` with their exact
segment fractions (knock, laugh, door left open, elevator, stairs, car door,
route beep, automatic door, helmet, upload, lens hiss, door hiss, hum, chair
toppling, blows, body on the wall, monitor, pens, door, jingle, engine, scrape,
mop, beep + mechanism, van doors, chains, belt, wash, reading voice, sirens,
injection, breathing, door hiss, cursing, silence).

---

## 7. Story-select card art

The white room, seen from the doorway: a man in white-grey overalls stands
with his back to us, looking at the far wall, where a boss's office — a desk,
a window full of morning sun — is spreading across the white **like water
into a towel**, its edge made of small pixel cells. No figure at the desk, no
corner, no blood. Mint sliver of corridor light on the floor.

---

## 8. Notes for the scene builder

1. **Arif's perception vs. reality.** Ch. 4–6 show only what Arif sees (the
   room is empty, then an office, then a boss). The convict is drawn only in
   ch. 7 (as a dark shape, in shadow) and ch. 8–9. The single exception is the
   `shadow` discovery (a faint floor shadow in ch. 4).
2. **Two sides of one room.** Keep ODA 3 geometry identical across ch. 4, 5, 7
   and 9; the hallucinated office is the ch. 1 office translated by
   (+160, 0, +6.5). In `floor` u 0–0.47 reuse the ch. 4 `towel` camera
   position at the door (160, 1.7, 2.3), panned to the corner.
3. **The pixel/towel mask** drives `pixels`, `towel`, `appear` (the boss
   assembling), the glitches in ch. 5 (white patches = the mask running
   backward locally) and the mottled room in `subside`.
4. **Violence never lands.** Cut on the swing, white flash, white patch on the
   wall, objects (monitor bursting into white pixels, pen holder, photo). Never
   show the boss's face being hit, never blood in ch. 5–6.
5. **Recognition cues for the ending**: the door's hairline seam (ch. 4
   `close`), the identical door hiss, the white-grey overalls and slip-ons, no
   glasses, the slow look around the white walls in `enters`, the short hard
   steps, Arif's voice lowpassed. The man's face is never in focus.
6. **The lens applicator** is the same model in the prep room (ch. 3) and the
   injection station (ch. 8); so are the paper cups.
7. **333's neck band** ("yaka") must be legible in `record`, and the same band
   glitches inside the boss's collar in `collar` (hidden discovery).
8. **World text** to draw in the set: route screen, billboard, facade sign,
   "HAFIZA TARANIYOR", "YÜKLEME TAMAMLANDI", the anger map (with sub-peaks),
   "ÖFKE HARİTASI · BUGÜN · 18.44", the copy silhouettes, the explainer steps,
   "ODA 3 · HAZIR", the reading-room screens.
9. **Both choices are visual**: the copy's pose in `trigger`; one or two copies
   through `appear` → `floor` (see §4).
10. `src/stories/ofke/audio.ts` still keys its mix on the old segment ids and
    must be rewritten against this timeline.
