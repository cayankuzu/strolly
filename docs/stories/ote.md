# ÖTE — screenplay and scene contract

Code: `src/stories/ote/timeline.ts` (segments, chapters, `missionDay`) and
`src/stories/ote/text.ts` (every word, choices, discoveries, captions).
Total **86.0 screens**, 39 segments, 8 chapters, 2 choices, 10 discoveries.
`SCREEN_VH = 82`. Rail on the **left**: compose subjects centre-right.

Times below: `u` = local progress 0–1 inside the segment; `@` = absolute
screen where the segment starts.

---

## 1. Logline, tone, palette, light

**Logline.** A man signs away his fortune and his way back while "we", the
company's people, watch through glass. A heavy door, an elevator that rises
past the top of its building into a shuttle, thirty-two others like him. Years
of a quiet, almost-holiday voyage to the black hole at the centre of the
galaxy; the event horizon. Then the company closes his file, and we learn
what it sells: ötenazi, joined to discovery. At the same table, the next
client turns the same blue pen.

**Tone.** Cold, courteous, exact. The horror is the politeness and the
routine, never an image. Nobody dies on screen: the ship's story ends in the
ring's light, the company's in the black of a keyhole. No melodrama, no
explanations of anyone's reasons — a detail at most.

**Narrator.** "Biz" — the company's people. The camera is often *their*
camera: behind the glass (open, next), the booth lens (report), the mission
room screen (mission, readout). The same official (G) who never speaks in
chapter 1 reads the man's report aloud in chapter 8.

**Motif.** The company emblem is a thin-line **keyhole** (a circle over a
narrow trapezoid). It is on the folder, the second door, the shuttle panel,
the booth screen, the guards' patches and the mission room wall. In `key`
the camera enters it and its black fills the frame (it echoes the black hole).

**Palette.**
- Company: walnut #3A2618, lamp amber #F2B66B (2700 K), steel #8C9198, cold
  white #E8EEF2, black glass; **ink blue #2F4FD8** (the pen and the signature,
  the only saturated colour in chapter 1).
- Ship: off-white panels #E9E6DF, warm-grey seats #B9B3A8, module daylight
  #FFF3DC, lounge amber #E7A35A; **scarf blue #3B6FD1**.
- Space: black #05060A, Earth #5DA9F0, accretion gold-white #FFE2A8 → orange
  #FF9B4A at the outer edge, blueshift #7FA2FF.
- Mission room: blue-grey #1C2430; the frozen frame reddens to #B0402F and dims.

**Light per chapter.**
1. İMZA — evening, windowless. One pendant cone on the table; falloff to near
   black. The glass wall reflects the lamp. Behind the glass a blue-grey dark.
2. KAPI — cold white corridor (ceiling strips every 2 m); elevator: brushed
   steel, a ceiling panel that cools a little as it climbs.
3. YOLCULAR — shuttle cabin at dawn: cool cabin LEDs plus warm low sun through
   the right-hand windows (+x).
4. KALKIŞ — dim red launch light inside; the windows go dawn gold → bright
   blue → indigo → black. After cut-off, soft white cabin light.
5. YOLCULUK — "holiday": simulated morning sun on the beach; amber evening
   lamps in the lounge.
6. SOLUK MAVİ NOKTA — lounge lamps dimmed for viewing; starlight and a faint
   blue on faces (Earth's light through the **aft** window); the booth's cool
   screen glow; time-lapse day/night cycles.
7. VARIŞ — the accretion ring's gold-white light floods in through the
   **forward** window, shadows slowly sweeping; from behind (the aft window), a
   growing blue-violet glow.
   `song` ends fading to the ring's white.
8. ANAHTAR — night on Earth: mission room blue-grey, the big screen's frozen
   frame reddening and dimming; the expedition wall under small spots; then
   the signing room lamp again.

---

## 2. World layout (metres; x right, y up, z toward the default camera)

Each set has its own area; a cut is a camera jump.

### A — İmza odası (signing room) · x 0
- Room x −3.0…+4.0, z −4.0…+3.0, ceiling 3.0. Walnut panelling to 1.1 m,
  charcoal fabric above; dark carpet #1E1A17.
- **Table** walnut 2.0 (x) × 1.1 (z), top y 0.76, centred (0, 0, 0).
- **Chair M** (client) at (0, 0, 0.85) facing −z. **Chair G** (official) at
  (0, 0, −0.85) facing +z. High-backed, dark leather.
- **Pendant lamp**: black/brass cone Ø 0.45, bottom at (0, 1.75, 0); warm spot
  (~70°) on the table; almost no fill.
- **Pages**: a stack of ~42 A4 sheets at (−0.1, 0.78, 0.3); top sheet a canvas
  of dense small print with a page header ("MADDE 9", "MADDE 12", "MADDE 14 ·
  İADE KOŞULLARI").
- **Last page**: starts under G's fingers at (0, 0.77, −0.3); slid to
  (−0.1, 0.785, 0.3). Printed in two serif lines: “Bizi seçtiğiniz için
  teşekkür ederiz. / Hayatınız, hayatımızdır…”, a small keyhole emblem above,
  and a signature line "X ________" below.
- **Blue pen**: 0.14 m, navy barrel, silver clip, ink blue. In M's right hand;
  rests at (0.25, 0.78, 0.35) after `sign`.
- **Folder**: grey card 0.24 × 0.32 at (−0.65, 0.775, 0.15): keyhole emblem,
  label "DOSYA K3-33".
- **Tray**: brushed steel 0.3 × 0.2 at (0.65, 0.775, 0.3): a keyring (3 keys),
  an open empty brown wallet, a 10 × 15 photo **face down** (white back).
- **Door 1** (the way he came in): wall z +3.0, x 0; walnut 0.9 × 2.1, closed;
  a thin line of warm daylight under it.
- **Door 2** (the second door): wall z −4.0, x 0, directly opposite Door 1 and
  directly behind G; brushed steel 1.3 × 2.4 × 0.12, flush, no handle on this
  side, keyhole emblem Ø 0.12 at (0, 1.5, −3.97). Hinged at x −0.65, swings
  away (−z) to 95° during `door` u 0.45→0.75, heavy ease-in-out. Beyond: cold
  white light that throws a long trapezoid onto the carpet.
- **Glass wall** x −3.0, z −3.5…+2.5, full height; dark tinted, slightly
  reflective (the lamp is mirrored in it).
- **Observation room** x −3.0…−6.5 (unlit but for spill): **B1, B2, B3**
  standing at (−3.6, 0, −0.8), (−3.7, 0, 0.0), (−3.6, 0, 0.8), facing +x.
  B2 holds a tablet whose faint glow lights her chin.

### B — Koridor ve asansör · x 40
- Corridor x 38.9…41.1, z 0…−12.2, height 2.8; white matte walls, pale grey
  floor, ceiling light strips every 2 m. At z 0 the back of Door 2 (same steel).
- **Plaque** (discovery): brass 0.4 × 0.25 at (38.92, 1.5, −5) facing +x.
- **Escort**: guards Q1–Q4 and officials O1–O2 waiting at z −2…−6.
- **Elevator**: two steel leaves (1.1 × 2.2) at z −12.2 facing +z. Cabin
  x 38.9…41.1, z −12.2…−14.4, height 2.6; brushed steel; ceiling light panel.
  **Floor indicator**: black glass strip 0.5 × 0.12 with amber digits above
  the doors inside, at (40, 2.42, −12.25) facing −z (twin outside at −12.15).
- **Positions in the cabin** (all facing +z): M (40, 0, −13.25); O1 left
  (39.35, 0, −13.25); O2 right (40.65, 0, −13.25); Q1 in front (40, 0, −12.6);
  Q2, Q3 behind (39.6, 0, −14.05), (40.4, 0, −14.05).

### C — Mekik kabini (shuttle cabin) · x 100
- Cabin x 97.8…102.2, z +1.5…−15.0, floor y 0, rounded ceiling, apex y 2.9;
  off-white panels, grey floor, a light strip along the aisle.
- **Rear bulkhead** z +1.5: the same pair of steel elevator leaves at
  (100, 0, 1.5) facing −z; a small lock light above (green → red). Behind the
  leaves, a copy of the elevator cabin (x 98.9…101.1, z 1.5…3.7) with the
  escort (Q1–Q3, O1, O2) standing inside, facing −z — seen only while the
  leaves are open in `topFloor`.
- **Sky outside the windows**: a backdrop dome around set C that the windows
  look onto — dawn gold low on the horizon (ch. 3), racing cloud streaks and
  bright blue (`gforce`), blue → indigo → black with stars and the curved
  cloud deck far below (`space`).
- **Seats**: 33 = 11 rows × 3. Rows at z = −1.0 − 1.2·k (k 0…10). Left pair
  x 98.5 (window) and 99.2 (aisle); right single x 101.5 (window). Aisle
  x 99.7…101.0. White shells, warm-grey cushions, 5-point harness (grey
  straps, silver buckle). All face −z.
- **Windows**: round Ø 0.45 at y 1.25, one per row each side (x 97.85 and
  102.15).
- **His seat**: row k 5 → (98.5, 0, −7.0), left window. **W1** at (99.2, 0, −7.0).
- **Announcement panel**: 2.2 × 0.8 screen at (100, 2.0, −14.95) facing +z
  (keyhole; "LÜTFEN OTURUN"; countdown "T−10"; route "ROTA · GALAKSİ MERKEZİ ·
  SGR A*" with a thin line toward a dot).
- **Manifest** (discovery): a 0.35 × 0.5 screen at (101.9, 1.5, −14.9).

### D — Kalkış dış çekimi (launch exterior) · x 200
- The shuttle exterior (white, 28 m, black belly, keyhole on the flank) on a
  column of fire, climbing from local y −20 to +40 through a cloud deck
  (plane at y 0); sky deep blue above, gold at the horizon. Used once
  (`gforce` u 0.22–0.48).

### E — Yaşam modülleri (habitat) · x 300 (spin gravity: people stand normally)
- **Beach module** x 292…300, z −4…+4, height 3.2. Walls and ceiling are one
  curved screen: sea, sky, morning sun (a faint pixel sheen up close). Real
  sand floor. Two wooden deckchairs at (295.5, 0, −1.0) and (296.6, 0, −1.0)
  facing −z. **Seam** at (292.2, 1.6, 2.5) where two screens meet: the wave
  visibly hitches there and restarts (discovery).
- **Lounge** x 302…312, z −6…+4, height 3.0; amber lamps. Sofas at
  (305, 0, 0.8) and (309, 0, 0.8) facing −z; chess table + 2 chairs at
  (309.5, 0, −1.5); Y's stool (303.8, 0, −1.2); W1's armchair (306.6, 0, −2.6).
- **Forward window**: round, Ø 2.6, centre (307, 1.55, −6.0), in the front
  wall, facing +z. It shows set F looking −z (ahead): empty stars in ch. 5–6,
  the black hole in ch. 7.
- **Aft window**: round, Ø 2.4, centre (307, 1.55, 4.0), in the back wall,
  facing −z; it shows set F looking +z (behind the ship). **Earth is seen
  only through this window** (ch. 5–6: `windows`, `lastLook`); in ch. 7 the
  same window shows the stars behind turning blue and closing into a ring
  (`approach`, `drift`). Behind the default camera (discovery in `arrive`).
  Same glass, same frame: the window where they watched Earth shrink is the
  window where the whole universe shrinks. Two small portholes (Ø 0.5, y 1.5)
  flank it in the same wall at (303.8, 1.5, 4.0) and (310.2, 1.5, 4.0), looking
  the same way.
- **Doorway** to the corridor at (311.5, 0, 4.0), 1.0 wide; the corridor runs
  +x to x 320 at z 4.5. The scarf goes out this way.
- **Pantry** door with a label (discovery) on the left wall at
  (302.05, 1.4, 2.0) facing +x; crates inside.
- **Comms booth**: open-front booth 1.0 × 1.0 × 2.2 centred (303, 0, −5.0);
  screen 0.5 × 0.35 at (303, 1.45, −5.45) facing +z; a small camera on an arm
  at (303, 1.75, −5.4); a side log screen (discovery) at (302.45, 1.5, −4.6)
  facing +x.
- **Day counter** screens "GÖREV GÜNÜ n" (n = `missionDay(p)` printed with
  `dayText`): above the lounge doorway at (311.5, 2.5, 3.95) facing −z, and on
  the lounge's right wall at (311.95, 1.9, −2) facing −x.

### F — Uzay (space) · x 500
- **Ship exterior**: 34 m white hull along z, nose toward −z, centred
  (500, 0, 0); a habitat ring Ø 14 m at mid-body, turning slowly (one turn per
  ~8 screens). Keyhole emblem on the hull.
- **Earth**: sphere r 6 behind the ship (+z). Its apparent size is the
  story's clock in chapters 5–6: seen through the lounge's aft window it is a
  disc of ~25° at `years` u 0, a hand's width (an outstretched palm covers it)
  at `windows` u 0.5, a fingertip at `windows` u 0.75, a dot (~3 px) at the
  `lastLook` hold, a single star-like pixel by `lastLook` u 0.65, lost among
  stars by u 0.85, gone from `dataLink` on.
- **Sun**: directional light from +x +z.
- **Black hole** (from `arrive`): at (500, 0, −600). Shadow: pure black disc
  r 40; photon ring r ≈ 52 (thin, bright); accretion disc inner 60 → outer
  260, tilted 14°, gold-white inside → orange outside, brighter on the left
  (approaching) side; lensing: the far side of the disc arches over and under
  the shadow (two thin arcs).
- **Starfield**: during `approach` and `drift` the stars behind (+z) shift to
  blue-violet and crowd toward the rear direction; by `drift` they are a small
  bright blue-white ring seen through the aft window.

### G — Görev odası (mission room) · x −100
- Room x −106…−94, z −7…+3, height 3.4; dark blue-grey.
- **Main screen** 6.0 × 2.4 at (−100, 1.8, −6.95) facing +z: left two-thirds
  the ship's last exterior frame (ship small against the ring); right third a
  packet counter "PAKET 88.412" and a signal trace.
- **Desks**: two rows (z −3.0, −0.8), x −103…−97, two monitors each. Four
  operators: B1–B3 (the glass watchers) plus B4.
- **G** stands at (−100, 0, −2.0) with a tablet. On the desk beside him
  (−100, 0.76, −1.4): the folder DOSYA K3-33.
- **Refund counter** (discovery): small LED counter "İADE TALEPLERİ · 0" on the
  right wall at (−94.05, 2.2, −3.0) facing −x.
- **Expedition wall**: left wall x −105.95, z +2…−6, brass plaques 0.6 × 0.3 in
  3 rows (y 1.3, 1.7, 2.1), facing +x, 13 columns ≈ 0.61 apart (39 plaques), oldest at z +2,
  newest at z −6. The named plaques, newest → oldest along −z → +z (the order
  the camera meets them and the order the text names them: planets, moons,
  asteroids, ocean depths): last column KARA DELİK I, KARA DELİK II,
  **KARA DELİK III** at (−105.95, 1.7, −5.6) — the newest, with a small status
  LED; then VENÜS · YÜZEY and MERKÜR · GECE YÜZÜ (planets, z ≈ −4.4); EUROPA ·
  BUZ ALTI and TİTAN · METAN DENİZİ (moons, z ≈ −2.6); 433 EROS (asteroid,
  z ≈ −0.8); MARİANA ÇUKURU · CHALLENGER DERİNLİĞİ, the oldest, alone in the
  first column at (−105.95, 1.7, +1.7). The rest of the grid: plaques whose
  text is too small to read. Each plaque: name, a date, the number 33.
- **Keyhole emblem**: brushed steel, Ø 1.0, on the front wall right of the
  screen at (−95.6, 1.8, −6.93), facing +z; the keyhole cut is a recessed
  black void 0.25 deep.
- `next` returns to **set A** (see there).

### Cast
| id | who | build · height | look |
|---|---|---|---|
| M | "o", the client, K3-33 | m · 1.00 | ~50, lean; short dark-brown hair greying at the temples, light stubble; navy wool coat open over a grey knit sweater, dark trousers, black shoes. From `yearsPass` on (12 years later): hair mostly grey, slightly stooped. |
| G | the official (GÖREVLİ) | m · 1.03 | ~45, near-bald (skin-tone very short hair), clean-shaven; black suit, white shirt, no tie. Minimal movement. Ch. 1–2 and 8. |
| B1–B3 (+B4) | "biz" | 2 m, 1 f (B2) · 1.0 | charcoal suits; B2 short hair, holds a tablet. Silhouettes behind the glass; operators in the mission room. |
| Q1–Q4 | guards | m · 1.05 | dark grey uniforms, keyhole patch on the shoulder, short hair. |
| O1, O2 | escort officials | m, f · 1.0 | black suits. |
| W1 | the old woman, knitting | f · 0.93 | ~78 → 90; white hair in a bun (long style, tied), round glasses; lilac cardigan, cream blouse, grey skirt; canvas bag, blue yarn, two needles. Her scarf (blue, 0.15 wide) grows: 0.2 m (`seat`) → 1 m (`lounge`) → ~14 m (`yearsPass` end) → finished (`song`). |
| Y | the young man with the guitar | m · 1.02 | ~26 → 38; long hair tied back, black denim jacket, white T-shirt, jeans; guitar case on his back, then an acoustic guitar. Beard grows in `yearsPass`. |
| C1, C2 | the old couple | m · 0.97, f · 0.92 | ~80 / ~78; white short hair / short silver hair; matching beige coats. Always hand in hand. |
| H | the woman with the hospital bracelet | f · 0.98 | ~40; short dark hair; dark green sweater, red scarf; a **white hospital bracelet** on the left wrist, clearly visible. |
| S | the man in the suit | m · 1.00 | ~60; grey side-parted hair; navy three-piece suit; a wristwatch he keeps checking. Stands at attention for reports. |
| P1–P26 | the other passengers | mixed · 0.95–1.05 | adults 30–85 in their own muted clothes; no children. 6–8 rigs with colour variations. |
| N | the next client (ch. 8) | f · 0.97 | ~35; long dark hair in a low ponytail; dark green coat. |

---

## 3. Segment table

Text timings are fractions of the segment (`from → to`). For a two-line item,
"L2 @u" is where the second line arrives (the runtime staggers it over the
item's span); the action is timed to land with it.

### 01 — İMZA (15.4 screens)

**`open`** · 1.4 · @0.0 · set A
- Action: M seated, head bowed over the pages, the pen still in his right
  hand. G seated opposite, hands folded. B1–B3 in the foreground, backs to us.
- Camera: in the observation room behind B2, (−5.4, 1.62, 1.2) → (0, 0.95,
  0.2), vfov 34; slow push 0.4 m toward the glass.
- Light: lamp cone only; the glass carries the lamp's reflection.
- Sound: muffled room tone through glass, lamp hum.
- Text `watching` (center, −1 → 0.95, sub SCROLL): the shot *is* the sentence —
  we, behind glass, watching him at the table.

**`glass`** · 1.7 · @1.4 · A
- Action: M turns the pen slowly once; G still.
- Camera: u 0–0.3 the push continues between B2 and B3 to the glass; u 0.3
  **through the glass** (a brief lamp flare as the plane passes); u 0.3–0.55
  on to his left shoulder, ending at (−1.6, 1.35, 1.6) → (0, 0.9, 0.2),
  vfov 32; then a slow settling drift.
- Text `serious` (rail, 0.08 → 0.98, L2 @u 0.49): line 1 while we cross the
  glass; "Belki de en ciddisi." as we arrive at his shoulder.

**`pen`** · 1.7 · @3.1 · A
- Action: close on M's right hand: the blue pen turning between his fingers
  (one slow turn per ~0.4 u); u 0.52 his thumb stops it; u 0.7 he lays two
  fingers flat on the page. Nobody in the room moves.
- Camera: (0.55, 0.98, 0.75) → (0.15, 0.8, 0.35), vfov 28.
- Sound: the pen's small click against his ring finger.
- Text `pen` (0.06 → 0.98, L2 @u 0.54): line 1 on the turning pen and the
  thought; "Bekledik. Bu odada kimse aceleye getirilmezdi." when the pen
  stops and the room holds still around him.

**`pages`** · 2.1 · @4.8 · A
- Action: M's left hand turns pages at u 0.1, 0.22, 0.34 — each densely
  printed; headers MADDE 9, MADDE 12; at u 0.45 he stops on **MADDE 14 · İADE
  KOŞULLARI**; u 0.5–0.9 his index finger slides along one clause.
- Camera: overhead (−0.1, 1.55, 0.55) → (−0.1, 0.78, 0.25), vfov 36; the folder
  at the left edge of frame.
- Text `clauses` (0.04 → 0.99, L2 @u 0.50): line 1 over the flipping pages;
  line 2 (the refund clause) as his finger finds MADDE 14. World
  `clause-label` (0.45 → 0.99): the header printed on the page — draw it.

**`refund`** · 1.7 · @6.9 · A
- Action: M lifts his eyes from the clause to G (u 0.1); G does not react.
  u 0.45 the camera turns away from them to **Door 1** behind M: closed, the
  line of daylight under it.
- Camera: over G's shoulder (0.35, 1.35, −1.5) → (0, 0.95, 0.85), vfov 34;
  u 0.45–0.85 pan/tilt to (0, 1.0, 3.0).
- Text `never` (0.06 → 0.98, strong, L2 @u 0.48): "Daha önce böyle bir şey
  olmamıştı;" on M looking up at the unmoving G; "…geri dönen kimse yoktu."
  on the closed door he came in by.

**`lastPage`** · 2.5 · @8.6 · A
- Action: u 0.02–0.25 G slides the last sheet across with two fingers (from
  (0, 0.77, −0.3) to on top of the stack). u 0.28 cut to the insert: the
  sheet, the keyhole emblem, the two printed lines, the empty signature line
  "X ________".
- Camera: side wide (2.6, 1.3, 0.2) → (0, 0.85, 0), vfov 38; from u 0.28 insert
  (−0.1, 1.15, 0.55) → (−0.1, 0.78, 0.3), vfov 26, slight drift; by u 0.48
  the two printed lines fill the frame.
- Sound: paper sliding on wood.
- Text `last-page` (0.03 → 0.44): the slide, then the empty line in the
  insert. `slogan` (center/word, 0.48 → 1.08, L2 @u 0.72): exactly the words
  printed on the sheet, line by line as the camera drifts down them.

**`fortune`** · 2.6 · @11.1 · A
- Action: u 0–0.43 M motionless, looking at nothing (the sentence ringing).
  u 0.45 tilt down to the **tray**: keys, the empty open wallet, the photo face
  down. u 0.6 his hand leaves the tray, takes the pen; u 0.7–0.95 he
  **signs** — a short blue line.
- Camera: (0.9, 1.2, −0.2) → (0, 1.15, 0.85), vfov 30 on his face; u 0.45 tilt
  to the tray (0.65, 0.78, 0.3); u 0.6 follow the hand to the signature line.
- Sound: lamp hum rises in the mix while he is still; then the pen's scratch.
- Text `stuck` (0.08 → 0.43) on his still face. `fortune` (0.47 → 1.02,
  L2 @u 0.72): line 1 on the tray (the empty wallet); line 2 lands **as he
  signs**.

**`sign`** · 1.7 · @13.7 · A
- Action: u 0.05 M lays the pen down parallel to the stack (it rests at
  (0.25, 0.78, 0.35)); u 0.15 squares the pages; u 0.2–0.4 slides them
  across; G receives them (u 0.4), glances once at the last page (u 0.45),
  closes the folder on them (u 0.55) and squares it with one palm.
- Camera: (−1.6, 1.35, 1.6) → (0, 0.85, 0), vfov 34.
- Text `signed` (0.06 → 0.98, L2 @u 0.48): line 1 with the pen laid down and
  the hand-over; "Her şey eksiksizdi. Her zaman olduğu gibi." as G glances
  and closes the folder.

### 02 — KAPI (9.6)

**`nod`** · 1.7 · @15.4 · A
- Action: u 0.1 G raises his eyes to M; u 0.25 one slow nod, then a slight
  tilt of the head toward the space behind him — he does **not** turn; u 0.45
  focus pulls past him to **Door 2**, the steel door directly behind his
  chair; u 0.8 M stands.
- Camera: over M's shoulder (0.3, 1.3, 1.4) → (0, 1.15, −0.85), vfov 30; rack
  to (0, 1.2, −4.0) at u 0.45.
- Text `nod` (0.08 → 0.96, L2 @u 0.48): line 1 on the nod; "Arkasındaki
  kapıya dönüp bakmadı bile." when the steel door sharpens behind the
  unmoving G.

**`door`** · 2.4 · @17.1 · A
- Action: u 0–0.4 M walks around the table toward Door 2: path (x, z)
  (0, 0.85) → (1.2, 0) → (0.2, −3.4). G stays seated, back to the door, not
  turning. u 0.45–0.75 Door 2 swings open, heavy; cold white light spills; M's
  shadow stretches back toward the table. u 0.78 he steps through, a
  silhouette, and is gone by u 0.9.
- Camera: side view showing **both doors** — (3.6, 1.6, −0.5) looking −x
  → (0, 1.2, −0.5), vfov 55: Door 1 (z +3) at the **left** of frame, Door 2
  (z −4) at the **right**, M crossing between them, the dark glass wall and
  the watchers' silhouettes in the background. From u 0.45 move behind M
  (0.6, 1.5, 1.6) → (0, 1.2, −4.0).
- Sound: deep hinge groan, a pressure hiss, the door's weight.
- Text `other-door` (0.03 → 0.41): the side view with both doors, M walking
  from one toward the other. `heavy` (0.45 → 0.99, L2 @u 0.78): "Kapı ağır
  ağır açıldı…" with the opening and the light; "İçeri girdi." as he crosses
  the threshold.

**`elevator`** · 1.9 · @19.5 · B
- Action: u 0–0.4 corridor: M walks −z; Q1–Q4 and O1–O2 fall into step around
  him (2 ahead, 2 behind, 1 each side); footsteps in unison. u 0.4 cut into
  the cabin: they stand in formation around him (positions in §2-B); the
  doors close at u 0.5. Nobody looks at him: every face is on the doors.
- Camera: corridor (40, 1.4, −0.6) → (40, 1.3, −12), vfov 40; cabin from the
  back corner, high: (40.75, 2.0, −14.25) → (40, 1.5, −12.3), vfov 50.
- Text `elevator` (0.05 → 0.97, L2 @u 0.56): line 1 over the escort closing
  around him; "Kimse konuşmuyordu. Kimse ona bakmıyordu da." in the closed
  cabin, all eyes on the doors.

**`rise`** · 1.6 · @21.4 · B
- Action: the indicator climbs: 1…24 by u 0.3 (the building's floors), then
  keeps going — 31, 60, 140, 400, 1200 — the digits blur; at u 0.9 it shows a
  single bar "—". M swallows (head dips, u 0.15); his hand closes. Guards
  impassive.
- Camera: slow push from the corner toward M's profile and the indicator
  above the doors.
- Light: the ceiling panel cools slightly, a faint flicker at u 0.6.
- Sound: rising elevator hum; at u 0.6 an ear-pressure whine.
- Text `pressure` (0.06 → 0.97, L2 @u 0.48): line 1 on his swallow; line 2 as
  the digits pass the building's height and keep climbing.

**`topFloor`** · 2.0 · @23.0 · B → C
- Action: u 0–0.15 inside the elevator: chime; the doors open on bright
  light. u 0.18 cut to set C: the same steel leaves open in the shuttle's rear
  bulkhead, the escort standing still inside; M steps out into the aisle
  (u 0.2–0.4). u 0.5 the leaves close behind him; u 0.55 the lock light turns
  red.
- Camera: u 0–0.18 from behind M in the elevator (40, 1.6, −14.2) → the doors
  (40, 1.3, −12.2), vfov 45; then in the shuttle cabin looking back at the rear
  bulkhead (100.6, 1.65, −3.5) → (100, 1.4, 1.5), vfov 45. (The 32 others are
  behind the camera.)
- Sound: chime; air-pressure equalising; the lock's heavy clack.
- Text `shuttle` (0.04 → 0.5) on the opening doors and his first steps into
  the cabin. `no-return` (center, 0.55 → 1.06, strong): the leaves shut, the
  light goes red.

### 03 — YOLCULAR (8.3)

**`cabin`** · 1.7 · @25.0 · C
- Action: reverse angle. 32 people standing in the aisle and between the
  seats, murmuring, most not yet looking. u 0.45 the murmur stops and every
  head turns toward him, a ripple from front to back. Nobody sits yet.
- Camera: from behind M at the rear (100.2, 1.7, 1.0) → (100, 1.3, −8), vfov 45.
- Sound: low crowd murmur, no words; it stops at u 0.45.
- Text `others` (0.08 → 0.96, L2 @u 0.48): line 1 on the crowd; "Bütün başlar
  ona döndü. Otuz üçüncü yolcu oydu." on the turned heads.

**`faces`** · 2.6 · @26.7 · C
- Action: a slow dolly down the aisle (z −1 → −12), the camera panning left and
  right across faces: W1 with her canvas bag and blue yarn (u 0.08); Y with
  the guitar case (u 0.2); C1 & C2 hand in hand (u 0.32); H, the white
  bracelet on her wrist as she pushes her hair back (u 0.45); S checking his
  watch (u 0.56). From u 0.64 pairs of people nod to each other without
  speaking, and look away.
- Camera: y 1.5, along the aisle, vfov 40.
- Text `fortunes` (0.04 → 0.6, L2 @u 0.30) over the faces. `no-names`
  (0.64 → 1.0) on the silent nods and the looks away.

**`announce`** · 2.2 · @29.3 · C
- Action: u 0.02 chime; the panel lights: keyhole, "LÜTFEN OTURUN"; a calm
  female voice. u 0.5–0.95 everyone sits, in no order: some take the first
  seat they reach, some hesitate, nobody argues over a window.
- Camera: from the front (100, 1.9, −14.2) → (100, 1.2, −3), vfov 50, the
  panel's glow on the faces; u 0.5 the camera rises slightly to see the seats
  fill.
- Text `announce` (ANONS, 0.04 → 0.5): the panel speaking. `random`
  (0.54 → 0.98): the seats filling.

**`seat`** · 1.8 · @31.5 · C
- Action: M sits in the left window seat of row 6 (u 0.1); dawn light through
  the round window on his face. W1 sits beside him (u 0.45), lays her
  knitting (a short blue start, 0.2 m, on two needles) in her lap (u 0.55),
  then leans over and clicks **his** harness shut (u 0.75); he lets her.
- Camera: two-shot from the aisle (99.9, 1.25, −7.9) → (98.85, 1.0, −7.0), vfov 36.
- Sound: buckle click.
- Text `seat` (0.06 → 0.97, L2 @u 0.48): line 1 on the window; line 2 on W1
  sitting, laying down the knitting and fastening his belt.

### 04 — KALKIŞ (6.5)

**`ignition`** · 1.6 · @33.3 · C
- Action: panel countdown T−10 → 0 (u 0.04–0.32); all seated, belted,
  gripping armrests; C1 and C2 hold hands across the armrest. u 0.32
  ignition: everything vibrates; the light drops to dim red.
- Camera: from the front (100, 1.6, −14) → (100, 1.0, −4), vfov 55; shake
  starts at u 0.32.
- Sound: countdown beeps; ignition roar building from sub-bass.
- Text world `countdown` (0.04 → 0.32): on the panel — draw it, counting.
  `engines` (center, 0.34 → 0.98, strong) with the roar.

**`gforce`** · 2.3 · @34.9 · C → D → C
- Action: u 0–0.22 tight on M and W1: bodies pressed into the seats, heads
  into the headrests; the window shows sky racing down, cloud streaks.
  u 0.22–0.48 exterior (set D): the white shuttle on its column of fire
  bursting up through the cloud deck. u 0.48–1 back inside: the window bright
  blue, still shaking; at u 0.5 W1's hand finds his on the armrest and holds
  it; it stays there to the end of the segment.
- Camera: inside (99.9, 1.15, −7.6) → (98.85, 1.0, −7.0), vfov 40, heavy shake
  (1.5 cm at 12 Hz + slow sway); exterior (200, 35, 60) → (200, 10, 0), vfov 45;
  from u 0.5 tilt down to the two hands on the armrest.
- Sound: roar, metal groaning, rattles.
- Text `gforce` (0.05 → 0.97, L2 @u 0.53): line 1 over the pressure and the
  climb through the clouds; "Yaşlı kadın sarsıntı boyunca onun elini
  bırakmadı." on the held hands.

**`space`** · 2.6 · @37.2 · C
- Action: u 0–0.42 the window: clouds fall away below, the blue thins to
  indigo, to black; shaking decays. u 0.45 **engine cut-off**: silence; the
  shaking stops dead; W1's yarn ball lifts off her lap and floats (u 0.5–0.95),
  trailing a blue strand; M watches it. u 0.7 the panel shows the route.
- Camera: window close-up (98.3, 1.3, −7.3) → (97.85, 1.25, −7.0), vfov 30;
  from u 0.45 pull back to the two of them and the floating yarn; u 0.7 a short
  look up the aisle to the panel.
- Light: red launch light → soft white at u 0.45.
- Sound: roar fading with altitude; at u 0.45 hard silence, then a soft cabin
  tick.
- Text `blue` (0.04 → 0.41) on the window. `route` (0.45 → 1.0, L2 @u 0.72):
  "Motorlar sustu…" on the floating yarn; "Rota, galaksinin merkeziydi." with
  the panel. World `route-panel` (0.7 → 1.0) on the panel — draw it.

### 05 — YOLCULUK (7.8)

**`years`** · 2.6 · @39.8 · F → E
- Action: u 0–0.42 exterior: the ship in black space, its ring turning; Earth
  behind it still a large blue disc; sun from the side. u 0.45 interior: the
  lounge and the corridor beyond; the GÖREV GÜNÜ counter; signs "SİMÜLASYON"
  and "EĞLENCE" over doorways; passengers walking, settling in. u 0.72 the
  pantry door opens on stacked crates.
- Camera: exterior (512, 6, 30) → (500, 0, 0), vfov 40, slow orbit; interior
  (311, 1.6, 3) → (303, 1.3, 1), vfov 50.
- Text `years` (0.03 → 0.42) on the exterior (the long road ahead).
  `equipped` (0.46 → 1.02, L2 @u 0.72): line 1 on the systems and screens,
  line 2 on the pantry crates and the module signs.

**`beach`** · 2.0 · @42.4 · E
- Action: the beach module: sea, sun, gulls on the screens; C1 and C2 in the
  deckchairs, hand in hand; two passengers barefoot at the water's "edge".
  The wave breaks at the **same point** each cycle (cycle ≈ 0.3 u, a white foam
  line at the same place every time).
- Camera: (296, 1.4, 2.5) → (296, 1.2, −3), vfov 45, slow lateral drift; by
  u 0.5 the couple's joined hands are centre-right.
- Sound: recorded waves and gulls (a loop you can hear loop).
- Text `beach` (0.05 → 0.97, L2 @u 0.51): line 1 on the repeating wave; line 2
  on the couple.

**`lounge`** · 3.2 · @44.4 · E
- Action: evening. u 0–0.45 Y on his stool plays; at u 0.4 he stops
  mid-phrase, smiles, lets the guitar rest on his knee. H on the sofa,
  watching his hand, waits for a last note that does not come. W1 knits in
  her armchair (scarf ~1 m). S and a passenger at chess. M on the sofa with a
  cup. u 0.6 a chess piece is set down; soft laughter.
- Camera: (306, 1.6, 3.2) → (305.5, 1.1, −2), vfov 45; at u 0.25 a short move
  to H's face, then back wide at u 0.55.
- Sound: guitar (the same phrase, cut off), needles, chess.
- Text `guitar` (0.04 → 0.52, L2 @u 0.28): line 1 on Y, line 2 on H waiting.
  `holiday` (0.56 → 1.02, strong, L2 @u 0.77) on the wide, warm room.

### 06 — SOLUK MAVİ NOKTA (11.5)

**`windows`** · 1.9 · @47.6 · E
- Action: everyone at the big round **aft** window (two or three at the
  portholes beside it), silhouettes; Earth a blue disc shrinking (hand's
  width → fingertip). At u 0.5 Y raises a hand at
  arm's length and covers Earth with his palm; at u 0.75 with one fingertip.
- Camera: behind the group, facing aft: (307, 1.55, −2.0) → (307, 1.6, 4.0),
  vfov 40.
- Light: lamps dimmed; starlight; a faint blue on faces.
- Text `pale-dot` (0.06 → 0.97, L2 @u 0.48): line 1 on the crowd at the window;
  line 2 (avuç → parmak ucu) **with the palm and the fingertip gesture**.

**`lastLook`** · 2.8 · @49.5 · E — **CHOICE at u 0.44**
- Action: u 0–0.4 the others drift away from the window; M stays, forehead
  nearly on the glass; Earth over his shoulder is a dot. Hold image at 0.44:
  his breath faintly fogging the glass.
- Camera: profile (305.6, 1.6, 2.7) → (306.8, 1.6, 4.0), vfov 32.
- Text `last-time` (0.03 → 0.37, strong) on M and the dot.
- After the choice:
  - **look:open** — M leans his forehead on the glass (pose lean, head to the
    glass), eyes on the dot. The camera moves past his head into his view:
    the dot shrinks to a single pixel (u 0.65), then is lost among stars
    (u 0.85: a star field where you cannot say which). Text `looked`
    (0.49 → 1.02, L2 @u 0.73): line 1 on the shrinking dot, line 2 on the
    field of stars.
  - **look:closed** — M leans his forehead on the glass and closes his eyes.
    The camera holds on his face; u 0.5–0.7 a soft memory insert at 35 %
    opacity: Earth large and near, as from the launch window. u 0.75 he opens
    his eyes: the window holds only stars. Text `closed` (0.49 → 1.02,
    L2 @u 0.73): line 1 during the memory, line 2 when he opens his eyes.

**`dataLink`** · 2.8 · @52.3 · E
- Action: weeks later. The comms booth: its screen shows a signal bar that
  pulses, drops out, returns ("BAĞLANTI · KESİNTİLİ"; plain text "NASA / ORTAK
  AĞ" in a corner — no logos). u 0.45 a queue of 3–4 passengers waiting their
  turn. u 0.72 S steps in, heels together, chin up, and reports to the lens;
  u 0.9 C1 gives a mock salute as S leaves; small laughter.
- Camera: (304.6, 1.5, −2.6) → (303, 1.4, −5.2), vfov 40.
- Sound: data chirps with gaps.
- Text `data` (0.04 → 0.46) on the booth and the flickering bar. `soldiers`
  (0.5 → 1.0, L2 @u 0.75): line 1 on the queue, line 2 on S at attention.

**`report`** · 2.1 · @55.1 · E — **CHOICE at u 0.3**
- Action: M steps into the booth (u 0–0.2). The screen: keyhole, "RAPOR
  VERİN." Hold at 0.3 on his face lit by the screen.
- Camera: the booth camera's point of view (303, 1.75, −5.4) → (303, 1.55,
  −4.3), vfov 34, slight lens curvature; it is *our* view of him.
- After the choice (u 0.32–0.6):
  - **report:ok** — he nods once to the lens, speaks briefly, steps half out.
  - **report:earth** — he takes the camera arm and turns it toward the aft
    window across the lounge: the feed shows only black and stars (Earth is no
    longer there).
  - **report:fear** — he leans in and looks straight into the lens, unblinking.
  From u 0.6 the screen: "PAKET GÖNDERİLDİ · YANIT BEKLENİYOR" and a spinner
  that never completes.
- Sound: send tone at u 0.36.
- Text world `report-screen` (0.04 → 0.42) on the booth screen — draw it.
  `sent` (0.42 → 0.98, L2 @u 0.68): "Raporları biz alıyorduk…" on his face
  through our lens; "Cevap yazmak sözleşmede yoktu." on the endless spinner.

**`yearsPass`** · 1.9 · @57.2 · E
- Action: time-lapse, camera locked. Simulated day/night cycles every ~0.1 u;
  people blur past; the day counter races (230 → 4.117). W1 knits in her
  armchair while **the scarf grows**: across the floor (u 0.15), to the
  doorway (u 0.3), out along the corridor (u 0.45), on out of sight. Y's
  beard grows; C1 and C2 whiten; M greys.
- Camera: locked, high in the front-left corner beside the booth, looking
  back across the room: (304.5, 2.4, −5.4) → (309.5, 0.5, 3.0), vfov 55. W1's
  armchair in the near middle, the doorway (311.5, 0, 4.0) and the day counter
  above it at the far right, so the scarf's whole path is in frame.
- Sound: needles ticking, accelerating, under a soft whoosh.
- Text `scarf` (0.06 → 0.97, L2 @u 0.48): line 1 over the racing days and the
  scarf crossing the room and leaving by the door; "Kime ördüğünü kimse
  sormadı." on W1 knitting on, people blurring past her.

### 07 — VARIŞ (11.1)

**`arrive`** · 2.4 · @59.1 · F → E
- Action: u 0–0.42 exterior: the ship small, and ahead the black hole — the
  perfect black disc, the thin photon ring, the tilted burning disc with its
  lensed arcs. u 0.46 inside: everyone (twelve years older) at the
  **forward** window; the ring fills it; its light on their faces.
- Camera: exterior behind/above the ship (500, 8, 40) → (500, 0, −600), vfov 40;
  interior behind the group (307, 1.55, 1.5) → (307, 1.6, −6), vfov 42.
- Sound: a deep hum, felt more than heard.
- Text `arrived` (center, 0.06 → 0.42, strong) on the exterior. `dark`
  (0.46 → 1.0, L2 @u 0.71): line 1 on the black at the window's centre,
  line 2 on the ring.

**`approach`** · 2.7 · @61.5 · E
- Action: u 0–0.4 the camera turns slowly from the forward window to the
  **aft** window: the stars behind them crowd together and turn blue-violet.
  u 0.46 the incoming-data screen by the booth: Earth's time beacon, a column
  of date stamps scrolling faster and faster, blurring into a white bar.
  u 0.72 the passengers' calm faces; the day counter on the wall does not
  move (4.380).
- Camera: (307, 1.6, 0) pan 180° to (307, 1.6, 4.0); then (304.5, 1.5, −3.4)
  → (302.45, 1.5, −4.6); from u 0.7 a slow lateral over faces, ending on the
  counter above the doorway.
- Sound: a high shimmer from behind; beacon pings accelerating to a hiss.
- Text `blueshift` (0.04 → 0.42) on the aft window. `faster` (0.46 → 1.0,
  L2 @u 0.71): line 1 on the racing dates; line 2 on the faces and the still
  counter.

**`horizon`** · 1.5 · @64.2 · F
- Action: exterior. The ship's lights reach the edge of the black disc and
  vanish into it at u 0.4; the ring wraps around the whole frame (lensing).
  Inside, the screenplay is explicit: **nothing changes at the moment of
  crossing** — that is the point; the exterior shows what the inside cannot.
- Camera: (520, 10, 60) → (500, 0, −600), vfov 35, slow push.
- Sound: everything drains to a single low tone.
- QUIET. Text `crossed` (center, 0.12 → 0.9, strong).

**`drift`** · 2.8 · @65.7 · E
- Action: the lounge, calm, lit by the ring through the forward window.
  People seated, some hand in hand (C1, C2), H with her eyes open, S's watch
  lying on the chess table. M stands by the aft window, his back to it.
  u 0.6:
  - **look:open** — M turns and looks out through the aft window: the whole
    universe behind them is a small bright blue-white ring.
  - **look:closed** — M turns to the same view and deliberately opens his
    eyes wide, keeping them open.
  - (no flag — a resumed reading) — as look:open.
- Camera: (305, 1.4, −2.5) → (306.2, 1.5, 2.6), vfov 40 (the forward window's
  light behind the camera); u 0.6 turn past M's shoulder to the aft window
  (307, 1.55, 4.0).
- Text `no-return-2` (0.05 → 0.56, strong, L2 @u 0.28) on the calm room.
  `looked-back` / `eyes-open` / `looked-out` (0.6 → 1.0) on M and the bright
  ring behind.

**`song`** · 1.7 · @68.5 · E
- Action: Y plays the song and, at the place he always stopped (u 0.15), goes
  on; the last chord at u 0.36, palm flat on the strings. H closes her eyes at
  the last note (u 0.38). W1 ties off the last stitch (u 0.5), bites the yarn,
  lays both hands on the finished scarf, its length coiled in loops around her
  armchair.
  u 0.75 the ring's light rises through the forward window and the frame
  fades to gold-white (u 0.85–1.0). No pain, no distortion of bodies.
- Camera: (305, 1.3, 1.8) → (305.5, 1.0, −2), vfov 45.
- Sound: the guitar's end; then only the low tone.
- Text `song` (0.06 → 0.98, L2 @u 0.52): line 1 with the finished song and H
  hearing the note; line 2 with the last stitch.

### 08 — ANAHTAR (15.8)

**`mission`** · 2.6 · @70.2 · G
- Action: Earth, night. The main screen: the ship's last frame near the ring,
  **frozen at the edge**, slowly reddening and dimming; the packet counter
  increments slower and slower (…88.412 … 88.413 …… 88.414) and stops at u 0.7;
  "K3 · SİNYAL YOK" appears at u 0.72. Operators B1–B4 watch; G stands with a
  tablet.
- Camera: (−100, 1.7, 2.5) → (−100, 1.8, −7), vfov 45, slow push.
- Sound: HVAC; packet beeps thinning out; then a flat continuous tone.
- Text `our-screens` (0.04 → 0.42) on the frozen frame. `froze` (0.46 → 1.0,
  L2 @u 0.71): line 1 on the reddening, line 2 on the counter stopping. World
  `signal` (0.72 → 1.0) on the main screen — draw it.

**`readout`** · 2.4 · @72.8 · G
- Action: G reads from his tablet, flat; for the first time we hear him. On
  the screen behind him, M's report frame (by choice): **ok** — M's single nod;
  **earth** — the black, starry frame from the turned camera; **fear** — M's
  face square in the lens; (no flag) — the booth's empty frame. u 0.75 G
  closes the folder DOSYA K3-33 and lays it on a stack; B4 stamps it (u 0.85).
- Camera: medium on G (−100.6, 1.5, −0.6) → (−100, 1.55, −2.0), vfov 32; u 0.6
  tilt to the folder.
- Sound: G's voice (flat), the folder closing, a stamp.
- Text `read-ok` / `read-earth` / `read-fear` / `read-none` (GÖREVLİ,
  0.05 → 0.48): his reading, with M's frame behind him. `filed` (0.52 → 0.98,
  L2 @u 0.73): line 1 on G's unmoved face, "Sonra dosyayı kapattık." on the
  folder closing.

**`routine`** · 2.5 · @75.2 · G
- Action: the room relaxes: an operator stretches, a coffee cup is refilled;
  u 0.25 a cart rolls in with a new stack of folders. u 0.44 insert: the top
  folder opens on its first page — header **"ÖTENAZİ TALEP FORMU"** with the
  keyhole emblem and blank fields (Ad, Yaş, Sebep: —).
- Camera: wide (−97, 1.7, 2.0) → (−100, 1.2, −2), vfov 45; insert from u 0.44
  (−99.2, 1.15, −0.9) → (−99.2, 0.78, −1.2), vfov 26.
- Sound: cart wheels.
- Text `routine` (0.04 → 0.4, strong) on the room going back to work.
  `euthanasia` (0.44 → 1.0, L2 @u 0.70) **on the form header** — the word on
  the paper and on the rail arrive together.

**`wall`** · 4.0 · @77.7 · G
- Action: the expedition wall. u 0–0.26 the newest column: KARA DELİK I, II,
  **III** — III's status LED goes from green to grey at u 0.12. u 0.28–0.62 a
  slow dolly along the wall toward the oldest plaques (z −5 → +1.7), meeting
  them in the order the text names them: VENÜS · YÜZEY and MERKÜR (planets,
  u 0.3), EUROPA and TİTAN (moons, u 0.36), 433 EROS (asteroid, u 0.4), and
  arriving at MARİANA ÇUKURU · CHALLENGER DERİNLİĞİ (the ocean depths, the
  oldest) at u 0.44, where it holds. u 0.65–1.0 the camera pulls back and
  away from the wall until the whole grid is in frame: 39 plaques, every one
  with the number 33.
- Camera: (−103, 1.6, −4.2) → (−105.95, 1.7, −5.6), vfov 36; dolly at
  x −103.6, y 1.6, looking −x, z −5 → +1.7; pull-back to (−99.5, 1.7, −2.0)
  looking at (−105.95, 1.7, −2.0), vfov 50.
- Text `third` (0.03 → 0.26, strong) on KARA DELİK III. `before` (0.28 → 0.62,
  L2 @u 0.44): line 1 over the planet, moon and asteroid plaques; line 2
  ("okyanusların en derin noktalarına…") on MARİANA. `places` (0.65 → 1.0,
  L2 @u 0.83) on the whole wall. World `wall-list` (0.03 → 1.0) = the plaque
  names — draw them.

**`key`** · 2.0 · @81.7 · G
- Action: the large keyhole emblem on the front wall. The camera pushes
  straight into it; by u 0.85 the black of the keyhole fills the frame (the
  same black as the shadow of the black hole).
- Camera: (−95.6, 1.8, −3.5) → (−95.6, 1.8, −6.85), vfov 40 → 30.
- Sound: silence.
- QUIET. Text `key` (center, 0.06 → 0.94, strong, L2 @u 0.41): line 1 on the
  approach, line 2 as the black closes in.

**`next`** · 2.3 · @83.7 · A
- Action: match-cut from the keyhole black (u 0–0.06) to set A, exactly the
  opening shot: B1–B3 in the foreground behind the glass; at the table under
  the lamp, **N** in M's chair, turning **the same blue pen**; G opposite,
  hands folded; a new stack of pages; a new folder "DOSYA K4-01". At u 0.55
  N's thumb stops the pen.
- Camera: as in `open`: (−5.4, 1.62, 1.2) → (0, 0.95, 0.2), vfov 34, the same
  slow push.
- Sound: muffled room tone; the pen's click.
- QUIET. Text `again` (center, 0.08 → 0.52): the opening sentence, now about
  her. `end` (center/final, 0.6 → end): **ÖTE** — sub "Hayatınız,
  hayatımızdır."; hold the last frame.

---

## 4. Choices

**`lastLook` — SON BAKIŞ** (`lastLook` u 0.44, style choice). Prompt: "Dünya
pencerede bir nokta kadar kaldı." Hold image: M alone at the aft window, Earth
a dot, his breath fogging the glass. Nothing on the rail.
- *Dünya’ya son kez bak.* → `look:open`. Reply: "Alnını soğuk cama dayadı.
  Gözünü noktadan ayırmadı." Image: forehead to the glass, the POV into the
  window, the dot → a pixel → lost among stars. Text `looked`. Later, in
  `drift`: `looked-back` ("Yine pencereden baktı…"), M turns to the aft window
  without hesitation.
- *Gözlerini kapat.* → `look:closed`. Reply: "Alnını cama dayadı ve gözlerini
  kapattı." Image: eyes closed, the faint memory of a big, near Earth, eyes
  opening on stars only. Text `closed`; caption of the ship's distant hum.
  Later, in `drift`: `eyes-open` ("Bu kez gözlerini kapatmadı…"), M visibly
  opens his eyes wide and keeps them open.

**`report` — VERİ PENCERESİ · K3-33** (`report` u 0.3, style query). Prompt:
"Rapor verin." The tags are the company's filing categories. Each reply ends
"PAKET GÖNDERİLDİ." (the booth screen adds "YANIT BEKLENİYOR" and a spinner
that never completes; no answer ever comes).
- DURUM · *Her şey yolunda.* → `report:ok`: a single nod into the lens.
- GÖZLEM · *Dünya’yı görmeliydiniz.* → `report:earth`: he turns the camera to
  the aft window; the feed shows only stars.
- KİŞİSEL · *Korkmuyorum.* → `report:fear`: he looks straight into the lens,
  unblinking.

In `readout` (ch. 8) G reads the chosen line aloud as the man's only report
("— Yolcu otuz üç. Tek raporu: …": `read-ok` / `read-earth` / `read-fear`)
while the matching report frame is on the big screen behind him. A reading
that arrives without the flag (a resumed save) gets `read-none` ("Rapor
yok.") and, in `drift`, `looked-out`. Neither choice changes the plot.

---

## 5. Discoveries

| id | segment, from–to | where (m) | what · why |
|---|---|---|---|
| `watchers` | glass 0.4–2.0 · hidden | (−3.6, 1.6, 0), 1.6 | the three behind the glass (behind the camera once it has passed through); one taking notes. "Biz." — the narrator has bodies. |
| `folder` | pages 0–1.8 · visible | (−0.65, 0.78, 0.15), 0.35 | DOSYA K3-33, "TEK YÖN". K3 = the third black-hole team, 33 = his place in it; pays off in ch. 8. |
| `tray` | fortune 0–1.3 · subtle | (0.65, 0.8, 0.3), 0.3 | keys, empty wallet, a photo face down — the only hint of his reasons; "we did not turn it over." |
| `plaque` | elevator 0–0.42 · subtle | (38.92, 1.5, −5), 0.4 | brass plaque on the corridor's left wall: "1.287 kişi geçti" (= 39 teams × 33, the 39 plaques of ch. 8): the routine, before we know it. |
| `manifest` | announce 0–1.8 · hidden | (101.9, 1.5, −14.9), 0.35 | the passenger list beside the panel, behind the `announce` camera; the "Sebep" column empty. |
| `pantry` | years 0.4–1.0 · subtle | (302.05, 1.4, 2.0), 0.4 | "ERZAK · 33 KİŞİ · TEK YÖN", no return compartment. |
| `beach-seam` | beach 0–1.0 · subtle | (292.2, 1.6, 2.5), 0.6 | where the screens meet, the wave hitches and restarts; the couple never looks there. |
| `other-reports` | dataLink 0–1.0 · subtle | (302.45, 1.5, −4.6), 0.35 | earlier reports: K3-07, K3-21, K3-12 ("—"). Small human voices. |
| `rear-window` | arrive 0.46–1.0 · hidden | (307, 1.55, 4.0), 1.4 | behind the group at the forward window: the aft window, where the stars have begun to turn blue; "Dünya… çoktan yaşlanmış olmalıydı." |
| `refunds` | mission 0–1.8 · subtle | (−94.05, 2.2, −3.0), 0.4 | "İADE TALEPLERİ · 0" — the refund clause from ch. 1, answered. |

---

## 6. Sound

- **İMZA**: muffled room tone through glass (open), then the room itself: lamp
  hum, pen clicks, paper, the scratch of the signature. No music.
- **KAPI**: the heavy hinge, a pressure hiss, corridor footsteps in unison,
  elevator hum rising in pitch, an ear-pressure whine, the arrival chime, the
  lock's clack.
- **YOLCULAR**: cabin air, a wordless crowd murmur that stops when the heads
  turn, the announcement chime and a calm voice, buckle clicks.
- **KALKIŞ**: countdown beeps, ignition from sub-bass to roar, metal groan and
  rattle; at cut-off **hard silence**, then a soft cabin tick.
- **YOLCULUK**: looped waves and gulls (audibly looped), the unfinished guitar
  phrase, knitting needles, chess pieces.
- **SOLUK MAVİ NOKTA**: near-silence at the window; data chirps with dropouts; a
  send tone; the time-lapse built on accelerating needles.
- **VARIŞ**: a deep hum growing; a high shimmer from behind (blueshift); the
  ground beacon's pings speeding into a hiss; at the horizon everything drains
  to one low tone; the guitar's last chord.
- **ANAHTAR**: mission-room HVAC; packet beeps thinning to a flat tone; G's flat
  voice; the folder, the stamp, cart wheels; silence in the keyhole; the pen's
  click at the end.

Key one-shots (all captioned in `CAPTIONS`): pen click, page turns, paper
slide, signature, steel door, elevator chime, lock, announcement chime,
buckle, ignition, cut-off, report sent, last chord, signal flatline, folder
close, stamp.

---

## 7. Story-select card art

A dark walnut table in a single cone of warm light; a navy pen lying across
an empty signature line; in the black glass behind the table, faint and
reflected, the silhouettes of three people standing — and, where the lamp's
reflection should be, a thin golden ring. No text but the title.

---

## 8. Notes for the scene builder

1. Composition: the rail is **left** — keep subjects centre-right in every
   shot; the glass wall (set A) sits naturally on the left.
2. Keep the chapter-1 palette almost monochrome; the **blue ink** is the only
   saturated colour until the Earth.
3. The **same official (G)** must be recognisable in `nod` and in `readout`
   (same rig, same suit). The **same blue pen** must be in `next`.
4. World text to draw in the set (shown in the DOM only without WebGL):
   `clause-label` (page header), `countdown` (panel), `route-panel` (panel),
   `report-screen` (booth), `signal` (main screen), `wall-list` (plaques). Also
   draw, without text items: the slogan on the last page, the elevator digits,
   "LÜTFEN OTURUN", "PAKET GÖNDERİLDİ · YANIT BEKLENİYOR", "ÖTENAZİ TALEP
   FORMU", "DOSYA K3-33" / "DOSYA K4-01", the day counter.
5. `missionDay(p)` and `dayText(n)` in `timeline.ts` drive the GÖREV GÜNÜ
   screens: 0 on the ground, 1 at cut-off, ~19 by the lounge, 212 after the
   report, a racing count to 4.117 in the time-lapse, 4.380 frozen at the
   black hole.
6. The lounge has **two** big round windows: forward (−z, the black hole in
   ch. 7) and aft (+z, Earth in ch. 5–6, the closing ring of the universe in
   ch. 7). Earth is only ever seen through the aft window (or from outside).
   Its apparent size is the clock of chapters 5–6 (see set F); it must be a
   true dot at the `lastLook` hold.
7. Ageing: M, W1, Y, C1/C2 visibly older from `yearsPass` on (grey hair, Y's
   beard); the scarf length is the clearest time marker.
8. Choices must show: `lastLook` (forehead on glass + POV vs. closed eyes +
   memory insert); `report` (nod vs. camera turned to stars vs. eyes in the
   lens), and the same frame again behind G in `readout`.
9. Restraint at the end of the voyage: no spaghettification, no bodies in
   distress; `song` fades to the ring's white, and the company's chapter
   carries the ending.
10. `next` is a deliberate repeat of `open` (same camera, same light, same
    watchers) with N in the chair and folder K4-01.
