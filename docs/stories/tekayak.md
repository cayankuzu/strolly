# TEK AYAK — screenplay (scene contract)

Story id `tekayak` · 45.9 screens · `SCREEN_VH` 80 · 28 segments · 5 chapters ·
1 choice · 7 discoveries · rail **right** · does not loop.

Words and timing live in `src/stories/tekayak/text.ts` and
`src/stories/tekayak/timeline.ts`. This file tells the scene builder what the
image shows at every line. Fractions `u` are local segment progress (0–1).
Coordinates are meters: x right, y up, z toward the default camera; the
students face **−z** (the board).

---

## 1. Logline, tone, palette, light

**Logline.** Friday, the last period. A tired science teacher writes the law
of balanced forces on the board; under the desks three friends build a paper
plane — "S.E.I Havayolları". It hits him on the back of the head. He knows
who did it; he punishes all three to stand on one foot in the bin corner —
and only then does the class (and the reader) look at Eren, who has watched
the whole thing from his wheelchair.

**The twist is the whole story.** Until `lift` u 0.62 the reader must not see
or be told that Eren uses a wheelchair. Section 3 is binding.

**Tone.** Light, observant, a little funny — a school afternoon told by
someone who sits among the twenty. The laugh at the end is affectionate and
cruel at once; the last image is Eren's stillness while everything else
moves. No sentimentality in the image: no slow tears, no swelling music.

**Palette.**

| role | color |
|---|---|
| chalkboard | `#2F4A3A` (chalk strokes `#E8E6DA`) |
| walls (cream oil paint, lower half darker) | `#E9E1CC` / `#C9BFA3` |
| linoleum tiles 0.3 m | `#B9B39A` and `#9FA48E` checker, seams `#6E7262` |
| uniforms: navy sweaters / light-blue shirts | `#1F2A44` / `#B9CFE6` |
| teacher's cardigan | `#7C7468` grey-brown |
| sun | `#FFD9A0` (warming to `#FFC37A` at 15.40) |
| bin (plastic) | `#2E6FB0` |
| red ink | `#C0392B` |
| Eren's parka | `#4F6B3A` olive green |
| wheelchair frame | `#3A3D42` graphite, black tires, brushed hand rims |

**Light.**

- Ch. 1–4 (15.12 → 15.19): October afternoon, low sun (altitude ≈ 22°) from
  the three left windows, slightly from behind (direction ≈ (0.80, −0.38,
  −0.46)). Warm beams lie across the window and middle columns; one beam
  crosses the air in front of the board's left/center (the "dust beam",
  visible chalk motes). The door column and the bin corner stay in soft,
  cooler indirect light. Fluorescent tubes are OFF.
- Ch. 5 `flow`–`end` (time-lapse to 15.40): the sun lowers and warms; the
  beams lengthen and slide right across the desks until, at `end` u ≈ 0.5,
  one finally lands on the bin corner and on Eren. (Artistic license; do it
  smoothly.)

---

## 2. World layout (one set, at the origin)

### 2.1 The room

- Room: x −4…+4, z −3.5…+3.5, height 3.2. Front wall (board) at z −3.5,
  back wall z +3.5, window wall x −4, door wall x +4.
- **Board:** green chalkboard 3.6 × 1.2, center (0, 1.5, −3.47), chalk tray at
  y 0.88. Fixed chalk content: top-left "KUVVET VE HAREKET", top-right
  "9 Ekim, Cuma". Written during the story: center-left "Dengelenmiş
  kuvvetler" (underlined, `open`), right half x 0.25…1.7, y 1.15…1.75, in a
  slanted hand: "Dengelenmiş kuvvetlerin etkisindeki cisim, duruyorsa
  durmaya devam eder." (`board` u 0.45–0.98) and below it, smaller,
  "Hareket ediyorsa, aynı süratle hareketine devam eder." (`light`).
- Above the board: a framed portrait (gilt frame 0.5 × 0.62 at (0, 2.6,
  −3.47); **generic** sepia blur, no face), a flag (0.9 × 0.6 at (−1.2, 2.55,
  −3.47)), a framed text panel at (1.2, 2.55, −3.47) (unreadable lines).
- **Clock:** round, Ø 0.32, white face, black hands, thin red second hand, at
  (3.0, 2.45, −3.46) — directly above the bin corner. Drive it with
  `wallClock(p)` from `timeline.ts` (15.12 at the start; 15.40 at the bell).
- **Teacher's desk:** 1.2 × 0.6, top 0.76, center (−2.5, 0.38, −2.45), wood;
  chair behind it. On it: thermos (−2.85, 0.9, −2.5), red ballpoint, a lesson
  notebook (−2.3, 0.77, −2.45), a small stack of graded quizzes, a chalk box.
- **Bin corner:** blue plastic bin Ø 0.32 × 0.42 at (3.55, 0.21, −3.15),
  crumpled paper inside; a broom and dustpan leaning at (3.85, 0.7, −3.38).
  A tile seam runs parallel to the front wall at **z −2.62** (the "line").
- **Door:** right wall, x 3.98, z −2.6…−1.6, wood with a small window and a
  "6-B" plate. On the threshold, a low aluminum ramp 0.4 × 1.0 at (3.9, 0.02,
  −2.1) (discovery; keep it plain).
- **Windows:** left wall, three tall windows 1.5 wide, y 1.0…2.9, centered at
  z −2.2, 0, +2.2; outside, a bright, slightly overexposed schoolyard and
  trees. **Radiators** (cream, ribbed) under each window at x −3.88, y
  0.15…0.75; cold and silent this early in October (the heating is not on
  yet). The room's ticking sound is the **wall clock**.
- **Back wall:** a cork bulletin board x −3.2…0.2, y 1.0…2.0 (kids' drawings,
  a "KUVVET VE HAREKET" poster); coat hooks x 1.0…3.9 at y 1.55 with parkas
  and coats hanging down to y ≈ 0.7 (they curtain the back-right corner).
- **Ceiling:** fluorescent fittings (off); an Africa-shaped water stain ~0.6 m
  at (2.0, 3.19, 0.6) (discovery; Salim stares at it).

### 2.2 Desks (important for the twist)

Twelve double desks (Turkish school "sıra"): 1.2 wide × 0.5 deep, top at
**0.72**, with a **full-height front panel (y 0.10…0.72)** and **solid side
panels**, a book shelf under the top. Separate chairs (seat 0.42, back to
0.80), set 0.45 behind each desk.

- Column centers x: −2.4 (window), 0 (middle), +2.4 (door). Seats at center
  ± 0.3 (left seat = −0.3).
- Row desk centers z: −1.3 (row 1), −0.1 (row 2), 1.1 (row 3), 2.3 (row 4);
  chairs at z −0.85, 0.35, 1.55, 2.75.
- Aisles: x −1.8…−0.6 and **x 0.6…1.8 (the "runway")**; right lane x 3.0…3.98
  along the door wall.

### 2.3 Seating (21 figures + the reader)

| seat | who |
|---|---|
| door col, row 3, left (2.1, z 1.55) | **SALİM** |
| door col, row 3, right (2.7, z 1.55) | girl, long dark ponytail (Salim's desk-mate) |
| door col, row 4, left (2.1, z 2.75) | **İBRAHİM** — his backpack hangs on the right side of his chair (toward Eren) |
| door col, row 4, right (2.7, z 2.8) | **EREN** — no chair; his wheelchair is pushed in under the desk |
| middle col, row 2, right (0.3, z 0.35) | **R — the reader's seat** (no figure; camera at eye (0.3, 1.1, 0.35)); on the desk an open notebook with "Dengelenmiş kuvvetler" underlined, a pencil case, a carved heart at (0.42, 0.73, −0.05). The chair is pulled out a hand's width, so in wide shots from the front the seat reads as "yours", not as an absent classmate |
| middle col, row 2, left (−0.3) | a boy, glasses |
| all other seats except window col row 4 (both) and middle col row 4 right | 15 more students (boys and girls) |

### 2.4 Cast

- **ÖĞRETMEN** — man, ~54, height factor 1.0, slightly heavy, slow. Grey-
  brown wool cardigan over a white shirt, dark grey trousers, black shoes;
  rectangular glasses; short grey hair, receding. Chalk dust on his right
  sleeve. Poses: write on board (right arm raised), stand, turn (fast), bend
  to pick up, hold an object at chest height, point (arm out with the
  plane), lower the arm; in ch. 5 once takes off his glasses and pinches the
  bridge of his nose.
- **SALİM** — boy, 12, **lanky**, height factor 0.88 (tallest in class),
  messy black hair; navy V-neck sweater, light-blue shirt **untucked**,
  sleeves pushed up; dark trousers; worn white canvas sneakers, right lace
  untied. Talent: folding. Tic: stares at the ceiling when innocent.
- **İBRAHİM** — boy, 12, **stocky**, height factor 0.80, round face,
  brown buzz cut; navy sweater a size too small; black sports sneakers. His
  **ears turn red** (tint the ear material from `turn` on; deeper red in
  `hush` for the "İbrahim’e" branch). Thrower.
- **EREN** — boy, 12, **thin**, height factor 0.80 (always seated), neat
  combed light-brown hair, **calm eyes**, navy sweater, a clean collar, dark
  trousers, clean navy sneakers with **spotless soles**; an olive parka
  draped over his backrest. Holds a black felt-tip in `pass`.
- **The wheelchair** — a child's **active, rigid-frame** manual wheelchair:
  graphite frame, black rear tires Ø 0.56 with brushed hand rims, small front
  casters, a single footplate, **low backrest (top at y 0.70), no push
  handles**, desk-length side guards. On the side guard that faces İbrahim in
  the corner: two marker-drawn wings and "S.E.I · Uçak No. 1" (discovery).
- **Students** — 17 more, height factor 0.78–0.86, navy sweaters/vests,
  light-blue shirts; girls with ponytails/long hair, boys short hair; a few
  cardigans. Idle: write, chew pen, lean on hand.

### 2.5 Final positions in the bin corner (from `walk` on)

All face the class (+z), backs to the front wall.

| who | position | note |
|---|---|---|
| SALİM | (3.15, 0, −2.78), toes on the seam z −2.62 | next to the bin |
| İBRAHİM | (2.60, 0, −2.78), toes on the seam | |
| EREN | wheelchair seat center (2.05, 0.48, −3.05); rear axle z −3.2; footplate tip over the seam (shoe tips at y 0.12, directly above z −2.62) | just right of the board's right edge; the chalk law is beside his head |

Off-screen paths (never shown): all three go down the right lane (x 3.5);
Eren goes first and rolls to the far end, then İbrahim, then Salim.

---

## 3. Twist protection (binding)

1. **Nothing below Eren's chest — wheels, frame, footplate, his legs — may
   be in frame or reachable by the reader's look before `lift` u 0.62.** His
   face, shoulders, arms and hands above the desktop are fine.
2. The set does most of the work: desktops at 0.72 with full-height front
   panels and solid sides; the wheelchair is entirely below 0.70 (low
   backrest, no handles, wheels Ø 0.56), pushed in under the desk; the
   parka over the backrest; İbrahim's backpack on his right; coats hanging
   on the back-wall hooks behind Eren. From any seated or standing eye
   point in front of row 4 the chair is hidden by the desks.
3. **Look modes** (Shot `locked` / `limits`): use the table below. FREE
   shots must be sweep-tested: render the wheelchair in flat magenta in a
   dev build, sweep the full look range, and confirm no magenta pixel. If a
   FREE shot fails, add an occluder or downgrade it to LOCK.
4. The wheelchair casts no shadow into any pre-reveal frame (the back-right
   corner is out of direct sun; set `castShadow` off until `lift` if needed).
4a. **Every aspect ratio.** LOCK shots must hold from a 9:19.5 phone to a
   21:9 monitor. The horizontal field of view grows with the aspect, so
   test the frustum, not one screenshot: before `lift` u 0.62 the chair's
   bounding box (at the desk: x 2.40…3.00, y 0…0.72, z 2.30…3.25; in the
   corner: x 1.75…2.36, y 0…0.72, z −3.50…−2.60) must be outside the camera
   frustum or fully occluded. Where a wide aspect would let it in (`lineUp`,
   the start of `lift`), clamp the horizontal fov instead of widening the
   shot (narrow the vfov on wide screens).
5. Sound: the wheels are never isolated in the mix before `lift`. The one
   "[linolyumda lastik gıcırtısı]" in `rise` must read as sneakers.
6. The text never names the chair before `still`; nobody is ever shown
   walking or standing when that could be Eren. "kalktılar" in `rise` is the
   author's misdirection — the camera stays on the teacher there.
7. Fair play: the chair is really there the whole time (pushed in under
   Eren's desk, then in the corner). Never swap in an ordinary chair or a
   floating torso; hide it with framing and the desks, not by deleting it.
   Two honest clues exist for the curious: the door ramp (discovery) and,
   in `rise`, only **two** chairs scraping.

Pre-reveal look modes:

| seg | mode | why |
|---|---|---|
| open | FREE | camera at the board; desks hide everything |
| board u<0.44 | LOCK | wide from the back-left; a right turn would reach row 4's side |
| board u≥0.44 | FREE | side medium near the windows |
| light, rows | FREE | front of room |
| under | LOCK | camera near/below desk height in the runway |
| fold, pass, aim | LOCK | within 1.5 m of Eren |
| whisper | FREE | at the board |
| flight u<0.44 | LOCK (chase cam) | starts beside İbrahim |
| flight u≥0.44 … summon (incl. `tip`, `mock`) | FREE (sweep-test R and the board area) | R and front positions are occluded by rows 3–4; the `hush` clock insert is LOCK |
| rise, order, walk, lineUp, lift | LOCK | cameras point at/near the corner and the right lane |
| reveal → end | FREE | the secret is out |

---

## 4. Segment table

Text ids in **bold**; `from–to` are the item's segment fractions. "Image:"
says what is on screen while the line is up.

### 01 — DERS (open → rows) · 15.12 · 7.2 screens

Ambience: a quiet classroom — the wall clock, pens scratching, a far-off
whistle from the schoolyard.

**open** · 1.2 · board close-up
- Action: fade from black u 0–0.3. The teacher's right hand (cardigan cuff,
  chalk) enters from the left and writes "Dengelenmiş kuvvetler" at the
  center-left of the board (u 0.2–0.85), then underlines it (0.85–0.95).
- Camera: (−0.2, 1.68, −2.7) → (−0.1, 1.72, −3.47), vfov 30, tiny drift
  left-to-right with the writing.
- Sound: chalk scratch and taps.
- Text: **friday** (center, −1–0.92) "Cuma, son ders. / Zile yirmi sekiz
  dakika var." — Image: chalk letters forming in close-up.

**board** · 2.2 · the class from behind, then the teacher in profile
- u 0–0.44 WIDE from the back-left, high: (−3.3, 2.2, 3.0) → (0.3, 1.2, −3.2),
  vfov 50, slow push to (−2.9, 2.0, 2.4). Twenty backs bent over notebooks,
  sun beams across the left half, the teacher's back at the board. Frame
  must not include the back-right corner (LOCK).
- u 0.44 cut, side MEDIUM from near the front window: (−1.6, 1.6, −1.9) →
  (0.9, 1.5, −3.3), vfov 36. The teacher, in profile, dictates and writes the
  law on the right half of the board; the words appear in sync with the line.
- Text: **back** 0.03–0.42 "Öğretmen, sırtı sınıfa dönük hâlde tahtada
  dersini anlatıyordu." — Image: the wide; his back to twenty bowed heads.
  **law** (ÖĞRETMEN) 0.46–0.98 "— Dengelenmiş kuvvetlerin etkisindeki bir
  cisim, duruyorsa durmaya devam eder." — Image: the chalk sentence being
  written word by word.

**light** · 2.1 · the dust beam
- Camera: (−0.9, 1.55, −1.7) → (0.2, 1.65, −3.4), vfov 34, slow lateral drift
  right. Chalk motes turn slowly in the sun beam in front of the board; behind
  them, his hand finishes "…devam eder." and adds the smaller second line.
  At u ≈ 0.5 the drift reveals his face in profile: tired eyes behind the
  glasses, chalk on the sleeve. At u 0.8 a gentle tilt up-right finds the
  clock (15.12 → 15.13).
- Sound: clock tick.
- Text: **light** 0.03–0.98, two lines — line 1 (dust) "Ekim güneşi yüksek
  pencerelerden içeri uzanıyor, tebeşir tozu ışığın içinde ağır ağır
  dönüyordu." — Image: the motes in the beam. Line 2 (from u ≈ 0.5) "Öğretmen
  bu cümleyi otuz yıldır, her güz, aynı yatık harflerle yazıyordu." — Image:
  his tired profile and the slanted chalk letters.

**rows** · 1.7 · the class from the front
- Camera: (−1.4, 1.65, −3.1) → (0.6, 0.95, 1.6), vfov 44, still until u 0.5;
  then a slow push-in (to vfov 34) toward the back-right, target easing to
  (2.4, 1.0, 2.2). All heads bowed, pens moving, perfectly quiet — too
  perfectly: at the back right, Salim's head is a little too low (hands
  under the desk), İbrahim's shoulders twitch, Eren looks down at something
  on his desk, all three bent a few degrees further than anyone else. Upper
  bodies only (the desks hide the rest; see 4a for the push-in).
- Text: **quiet** 0.06–0.98, two lines — line 1 "Sınıf her zamanki gibi
  sessiz görünüyordu." — Image: twenty innocent heads. Line 2 (u ≈ 0.5)
  "Bütün başlar defterlere eğilmişti; arka köşedeki üçü, biraz fazla." —
  Image: the push-in arrives on the three too-low heads.

### 02 — UÇAK (under → flight) · 15.13–15.16 · 9.7 screens

Ambience: same room, closer: paper, a felt-tip squeak, snorts held back.

**under** · 2.4 · beneath the desks
- u 0–0.45: a low glide along the runway aisle at y 0.42, (1.2, 0.42, −1.6) →
  (1.35, 0.45, 0.85), looking back (+z) under the desktops: swinging feet, a
  sock with a hole, a dropped eraser, bags on hooks — the class's underworld.
  It ends on **Salim's hands under his desk** smoothing a sheet with red ink
  on it. (Row 4's front panel must close off everything behind; LOCK.)
- u 0.45: the camera rises above the desk line in the aisle: (0.9, 1.05, 0.9)
  → (2.4, 1.0, 2.2), vfov 38 — the three, chests up: Salim (row 3) turned
  half round, İbrahim and Eren (row 4) leaning in. Eren is visible only above
  his desk.
- Text: **below** 0.03–0.42 "Sıraların üstünde fen dersi işleniyordu;
  altında ise havacılık." — Image: the under-desk glide. **trio** 0.45–0.98
  "Arka sıralarda Salim, Eren ve İbrahim oturuyordu. / Üçü bir araya geldi
  mi, bir şey olurdu." — Image: the three faces, conspiratorial.

**fold** · 1.6 · Salim's hands
- Camera low beside his knee: (1.65, 0.62, 1.2) → (2.05, 0.55, 1.5), vfov 30.
  u 0.1 middle crease, 0.35 corners, 0.6 wings; u 0.5 cut-in to his face
  (tongue between his teeth); u 0.9 the finished dart. The red ink shows
  (a circled number, unreadable here). LOCK.
- Text: **folding** 0.04–0.98 "Uçağı Salim katlıyordu: önce ortadan, sonra
  köşeleri, en son kanatları." — Image: the three folds in sync (middle
  crease u 0.1, corners 0.35, wings 0.6). Line 2 (u ≈ 0.5) "Karnede bunun
  dersi yoktu; olsaydı, Salim okul birincisi olurdu." — Image: the cut-in
  to his face, then his proud grin over the finished dart.

**pass** · 1.7 · Eren writes
- Salim passes the plane back over his shoulder (u 0–0.1). Camera at Salim's
  head height in front of Eren's desk: (2.2, 1.12, 1.75) → (2.68, 0.98, 2.55),
  vfov 32. Eren's face and hands on the desktop; the desk's front panel fills
  the bottom of the frame. u 0.15 he pulls the felt-tip's cap off with his
  teeth; u 0.3–0.7 writes along the wing — **the wing is angled away, the
  letters are not readable**; his shoulders shake, he bites his lip. İbrahim's
  elbow at frame left. LOCK.
- Text: **write** 0.04–0.98 "Uçak arkaya, Eren’e geçti. Eren keçeli kalemin
  kapağını dişleriyle açıp kanada bir şeyler yazdı. / Gülmemeye çalıştığı
  için harfler biraz kaydı." — Image: cap in teeth, the pen moving, the
  suppressed laugh.

**aim** · 1.1 · the runway
- Over İbrahim's left shoulder: (1.72, 1.22, 3.15) → (1.0, 1.55, −3.0),
  vfov 36. The plane in his right hand at eye level, sharp; one eye closes
  (his cheek bunches); the aisle runs ahead like a runway to the teacher's
  back, soft. Eren is off-frame right. LOCK.
- Text: **aim** 0.06–0.98 "Sonra İbrahim’e. İbrahim bir gözünü kapattı;
  pist, sıraların arasındaki koridordu." — Image: the plane lined up on the
  teacher's head.

**whisper** · 1.3 · the teacher's ear
- Close from the front-right: (1.55, 1.7, −2.35) → (0.7, 1.68, −3.05), vfov
  28. The chalk keeps writing until u 0.4, then stops mid-letter; his head
  tilts a fraction (u 0.5); his eyes slide sideways behind the glasses
  (u 0.75). The class blurred behind.
- Sound: whispers, a "şşş", two snorts held back.
- Text: **until** 0.06–0.98 "Sınıf hâlâ sessiz görünüyordu; / ta ki
  öğretmenin kulağına fısıltılar ve bastırılmaya çalışılan gülüşmeler gelene
  kadar." — line 1 on the chalk still moving; line 2 (u ≈ 0.43) on the chalk
  frozen mid-letter and the head tilting toward the sound.

**flight** · 1.6 · the plane (QUIET until 0.44)
- u 0–0.06: İbrahim's launch (from the aim angle). u 0.06–0.43: **chase
  camera** 0.5 m behind the plane down the runway; plane path (1.9, 1.3, 2.5)
  → (0.72, 1.64, −2.95), a slight rise and a last dip; slow motion; at u
  0.33–0.4 it crosses the dust beam (motes burst). u 0.44 the nose taps the
  back of his head. u 0.44–0.7 it drops, spinning, to the floor at (0.85, 0,
  −2.7). Settle: (1.5, 1.45, −1.4) → (0.75, 1.1, −2.95), vfov 38 — his back
  frozen, the plane by his heel. LOCK until 0.44, then FREE.
- Text: **hit** 0.43–1.02 "Tam o anda, kafasına kâğıttan yapılmış bir uçak
  çarptı." — Image: the impact and the fall.

### 03 — SESSİZLİK (anger → summon) · 15.16–15.17 · 12.0 screens

Ambience: a dead hush after the hit; the wall clock becomes the loudest
thing in the room.

**anger** · 1.7 · his face, from the board
- Camera between him and the board: (0.68, 1.62, −3.38) → (0.7, 1.6, −2.5),
  vfov 38. He still faces the board (and us): eyes close, a breath, the jaw
  sets. u 0.32 the chalk **snaps** in his fist (cut-in on the hand). u 0.46
  rack focus past his shoulder to the back-right: three heads — Salim staring
  at the ceiling, İbrahim and Eren looking down. LOCK.
- Text: **anger** 0.04–0.98 "İçinde bir öfke kabardı. / Bu işin Salim, Eren
  ve İbrahim’den başkası olamayacağını biliyordu." — line 1 on the closed
  eyes and the snapped chalk; line 2 (u ≈ 0.46) on the rack focus to the
  three heads.

**turn** · 1.8 · from R (the reader's seat)
- Camera R: (0.3, 1.1, 0.35) → (0.7, 1.55, −3.0), vfov 40. u 0.08–0.2 he whips
  round, cardigan swinging, the plane at his feet. u 0.5 the shout: a quick
  push-in to vfov 34. Every student freezes.
- Text: **turned** 0.03–0.46 "Sert bir hareketle arkasını döndü." — Image:
  the spin. **who** (ÖĞRETMEN) 0.5–0.98 "— Bunu kim attı?" — Image: his face,
  red, glasses flashing, straight down the room.

**hush** · 2.3 · from R, the silence — CHOICE at 0.51
- u 0–0.15 from R: nobody moves; one pen rolls and stops. u 0.15–0.32
  insert (LOCK): the wall clock above the bin corner, (2.7, 2.3, −2.6) →
  (3.0, 2.45, −3.46), vfov 22 — the red second hand stepping, 15.16. u 0.32
  back to R: the teacher's eyes scan the rows, left to right, slowly.
- Text **hush** 0.03–0.45 "Sınıfta derin bir sessizlik oldu; duvar
  saatinin tıkırtısı bile duyuluyordu." — Image: twenty frozen students,
  then the clock's second hand.
- u 0.51: the gate (section 5). After the answer the view turns (look
  request, ~0.8 s) to where the reader looked, and holds while the reply
  shows; then u 0.59 cut back to the teacher (camera R), whose head turns to
  the same place.
- Text (one of four, 0.59–0.99): **glance-salim** "Öğretmenin gözleri,
  senin baktığın yere, Salim’e kaydı. Salim tavanı incelemeyi sürdürdü." /
  **glance-ibrahim** "… İbrahim’e kaydı. Kulakları bir ton daha kızardı." /
  **glance-eren** "… Eren’e kaydı. Bir an öylece bakıştılar." /
  **glance-desk** "Öğretmenin senin bakışına ihtiyacı yoktu; gözü zaten arka
  köşedeydi." — Image: the teacher's head turning to the same boy the
  reader chose (desk: his eyes are already on the back-right corner and
  do not move).

**smooth** · 1.9 · his hands
- u 0.04–0.2 he bends and picks up the plane; u 0.25–0.45 straightens and
  smooths the crumpled nose between thumb and forefinger. Camera (1.05, 1.4,
  −2.3) → (0.72, 1.25, −2.85), vfov 30.
- u 0.5 insert, the wing: (0.82, 1.32, −2.6) → (0.72, 1.27, −2.83), vfov 22:
  black marker, sloppy capitals **"S.E.I Havayolları"** (the I has no dot;
  a small doodled wing logo).
- Text: **smoothed** 0.04–0.47 "Öğretmen, yere düşen kâğıdı aldı, dikkatlice
  düzeltti." — Image: careful fingers on a creased nose. **airline**
  0.5–0.98 "Uçağın yan tarafında özensiz harflerle “S.E.I Havayolları”
  yazıyordu." — Image: the wing, legible. The letters slope and wobble
  (Eren wrote them trying not to laugh); the last letter is a plain "I"
  without the Turkish dot.

**tip** · 1.5 · the nose (ECU)
- He unfolds the crushed nose a little and turns the plane; ECU (0.78, 1.36,
  −2.62) → (0.72, 1.3, −2.85), vfov 22. u 0–0.45 the inside of the paper:
  printed quiz questions, blue-pen answers in a neat hand. u 0.5 the turn
  brings **his own red ink** into frame inside the nose fold: a circled
  "100" and, below it, "Aferin" in his slanted hand; "Eren Y." in pencil at
  the paper's corner (small, readable only in the ECU). LOCK not needed.
- Text: **quiz** 0.04–0.97, two lines — line 1 "Uçak, geçen haftaki sınavın
  kâğıtlarından biriydi." — Image: printed questions and answers in the
  folds. Line 2 (u ≈ 0.5) "Ucunda, kendi kırmızı kalemiyle yazdığı 100 ve
  “Aferin” duruyordu." — Image: the red "100" and "Aferin" legible.

**mock** · 1.8 · his face (MCU)
- MCU from the front: (0.5, 1.45, −1.9) → (0.7, 1.62, −3.0), vfov 30, slow
  push. u 0–0.4 he looks down at the nose; his lips move fast (an angry
  mutter, words not audible); jaw tight. u 0.42 his eyes lift and look over
  the glasses toward the back-right; the anger slides into a thin, mocking
  smile; he speaks.
- Text: **mock** 0.04–0.97, two lines (stagger 0.42) — line 1 "Ucuna bakarken
  ağzından öfke dolu sözler dökülüyordu." — Image: eyes down on the plane,
  lips moving. Line 2 (u ≈ 0.43) "“Eren… sen de mi bunlara katıldın? Aferin
  oğlum,” dedi, alayla karışık bir tonla." — Image: the look over the
  glasses, the mocking smile.

**summon** · 1.0 · from R
- He slaps the plane into his palm and points it at the back of the room.
  Camera R, vfov 34.
- Text: **summon** (ÖĞRETMEN) 0.06–0.98 "— Üçünüz de tahtaya gelin." —
  Image: the plane pointed like a finger.

### 04 — CEZA (rise → reveal) · 15.17–15.19 · 8.4 screens

Ambience: chair legs, steps, then the room holding its breath.

**rise** · 1.8 · the teacher looks at the plane, not at them
- Camera close on his hands and lowered face: (0.62, 1.42, −2.25) → (0.7,
  1.35, −2.95), vfov 30; the class is behind the camera. Off-screen: two
  chairs scrape back (u 0.06), a rubber squeak (u 0.3), steps. He turns the
  plane over, flicks a speck of chalk off the wing (u 0.6). His eyes never
  rise. LOCK.
- Text: **rose** 0.04–0.98 "Salim, Eren ve İbrahim başlarını öne eğerek
  kalktılar. / Öğretmen onlara bakmadı bile; gözü hâlâ elindeki uçaktaydı."
  — Image: his hands and the plane; the sounds of three getting up.

**order** · 1.1 · the empty corner
- He turns to face the corner (+x) and raises his right arm with the plane.
  Camera behind him, over his right shoulder: (−0.4, 1.7, −2.6) → (3.4, 0.9,
  −3.1), vfov 36; his shoulder and arm soft in the foreground, the plane
  sharp, pointing at the corner: the blue bin, the broom, the clock above
  (15.17) — empty. The three are still at the back (right lane, z > 1.5),
  out of frame; they move only in `walk`. LOCK.
- Text: **corner** (ÖĞRETMEN) 0.06–0.98 "— Çöp köşesinde, ayakta
  duracaksınız. Hemen oraya." — Image: plane-as-pointer; the empty corner.

**walk** · 1.1 · faces turning
- From the teacher's desk: (−3.1, 1.5, −2.9) → (−1.4, 1.0, 1.6), vfov 42,
  framing the window and middle columns only. Heads turn in a wave from the
  back-right to the front-right, following something out of frame right (the
  right lane); two kids lean into the aisle to see. LOCK.
- Text: **walked** 0.06–0.98 "Üçü de sırayla çöpün yanına geçip dizildi." —
  Image: twenty heads tracking an unseen procession.

**lineUp** · 1.1 · shoes on a seam
- **Floor-level**: (3.05, 0.17, −1.95) → (3.0, 0.12, −3.05), vfov 34. Tiles,
  the seam at z −2.62, the bin at frame right. Salim's white canvas shoes
  (lace untied) are already toes-on-seam; İbrahim's black sneakers settle
  beside them (u 0.1). Frame spans only x ≈ 2.5…3.6 — Eren (x 2.05; his
  right tire's outer edge at x 2.34) is out of frame left. At 16:9 the left
  edge sits only ~2° clear of the tire: on wider screens clamp the
  horizontal fov (4a). LOCK.
- Text: **oneFoot** (ÖĞRETMEN, off-screen) 0.06–0.98 "— Bir ayağınızı
  kaldırın. Tek ayak, zil çalana kadar." — Image: four shoes waiting.

**lift** · 1.9 · the tracking shot (the reveal begins)
- Same low camera; u 0.38–0.9 it tracks left (−x) along the line at shoe
  height to (1.95, 0.17, −1.95), target leading by −0.05 in x.
- u 0.08 **Salim's** right foot lifts off the linoleum, wobbling. u 0.35
  **İbrahim's** left foot lifts, heavier; his hand slaps the wall for balance
  (sound only). u 0.62–0.8 a **black tire and hand rim** slide into frame;
  u 0.8 the footplate and **two clean navy sneakers resting on it**, side by
  side, motionless, their tips exactly above the seam, soles spotless. Hold.
  QUIET from 0.62. LOCK.
- Text: **first** 0.04–0.62 "Önce Salim ayağını yerden kaldırdı, / sonra
  İbrahim…" — line 1 as Salim's foot lifts (u 0.08), line 2 (u ≈ 0.33) as
  İbrahim's does (u 0.35). 0.62–1.0 no words: only the wheel.
- Aspect guard (4a): at u 0–0.38 the frame must not reach x < 2.40 at
  z −3.2 on any screen; the track left starts only at 0.38 and the tire may
  enter frame no earlier than 0.62.

**reveal** · 1.4 · the wide
- WIDE from the runway, standing height: (0.9, 1.55, 0.6) → (2.55, 0.95,
  −3.0), vfov 46. The corner: Salim and İbrahim on one foot, arms out,
  wobbling; **Eren in his wheelchair** beside them, hands resting on the
  rims, looking out at the room; the clock above (15.19); the chalk law on
  the board just left of his head; the teacher at frame left, plane still
  raised, frozen. Foreground: students' heads turn toward Eren in a cascade,
  front rows first (u 0–0.3). FREE from here on.
- Text: **looked** / **looked-desk** 0.08–0.98 "Bir an sonra hepsi Eren’e
  baktı. / Sen de." (desk branch: "Bu kez sen de.") — line 1 on the turning
  heads, line 2 (u ≈ 0.58) as the look settles on Eren.

### 05 — SAHNE (burst → end) · 15.19 → 15.40 · 8.6 screens

Ambience: the laugh, then the laugh pushed far away (low-pass) into a hum;
the clock ticking faster; the bell.

**burst** · 2.0 · the whisper, the laugh
- u 0–0.45 two-shot: (2.95, 1.12, −1.75) → (2.85, 1.0, −2.8), vfov 34. On one
  foot, Salim and İbrahim lean their heads together and whisper out of the
  corners of their mouths, eyes sliding toward Eren (his shoulder and wheel
  at frame left).
- u 0.46 İbrahim snorts; they lose balance, Salim grabs İbrahim, İbrahim
  grabs the bin's rim (it rocks, does not fall). u 0.5 cut WIDE: (−0.6, 1.5,
  1.2) → (2.0, 1.0, −2.6), vfov 52 — the class laughing: heads back, a hand
  slapping a desk, a girl hiding her face in her sleeve; the laugh spreads
  front to back (u 0.72). The teacher lowers the plane; his mouth opens,
  closes.
- Text: **escaped** (SALİM İLE İBRAHİM, FISILTIYLA) 0.04–0.44 "— Cezadan
  yırttı piç!" — Image: the two whispering heads. **laugh** 0.47–0.98
  "Ardından bastıramadıkları bir kahkaha patladı. / Önce ikisinden, sonra
  bütün sınıftan." — line 1 on the two collapsing, line 2 on the wide.

**laughs** · 1.3 · from R, inside the laugh
- Camera R: (0.3, 1.1, 0.35) → (2.4, 1.0, −3.0), vfov 44. The reader's
  desk-mates shake with laughter in the foreground, one wiping his eyes;
  far front-right, Salim and İbrahim cling to each other on one foot,
  laughing too; between them and the room, Eren, still. At frame left the
  teacher takes off his glasses and pinches the bridge of his nose (u 0.5).
- Text: **whom** 0.06–0.98 "Kime güldüklerini kimse tam bilmiyordu:
  öğretmene mi, cezaya mı, Eren’e mi?" — Image: the three targets of the
  laugh in one frame (the teacher at left, the two on one foot, Eren),
  laughter all around you.

**still** · 2.0 · Eren
- u 0–0.5 MCU: (2.0, 1.0, −1.85) → (2.05, 0.8, −3.0), vfov 34 — Eren in his
  chair from the front, hands resting on the hand rims, the tops of both
  wheels in the lower frame, his eyes moving slowly across the room;
  around him, out of focus, motion and laughter. u 0.5–1.0 a slow push-in
  to a CU of the face: (2.03, 1.02, −2.3) → (2.05, 0.98, −3.0), vfov 30 → 26,
  soft indirect light. He does not move; he blinks once (u 0.75).
- Text: **still** 0.04–0.5 "Eren ise tekerlekli sandalyesinde sessizce
  duruyor, olan biteni izliyordu." — Image: the chair, the still hands, the
  watching eyes. **face** 0.53–0.98 "Yüzünde ne bir şaşkınlık ne de bir
  üzüntü vardı." — Image: the CU; nothing in the face changes.

**flow** · 2.0 · what Eren sees (time-lapse) — QUIET
- Over his right shoulder: (1.85, 1.1, −3.35) → (0.2, 0.95, 1.8), vfov 44.
  The class as he sees it. From u 0.25, `lapse(p)` ramps to 1: the laugh
  sound smears into a hum; figures move in fast motion — the class settles,
  returns to notebooks; the teacher walks back to the board, writes, turns,
  writes; at the right edge Salim and İbrahim switch feet again and again;
  the sun beams slide across the desks and warm. **Eren's shoulder and ear in
  the foreground do not move at all.**
- Text: **nothing** 0.04–0.98 "Hayatında hiçbir şey değişmemişti; / sınıfta
  olup bitenler, onun için sadece akıp giden bir sahneden ibaretti." — line
  1 as the room starts to race, line 2 (u ≈ 0.43) over the full time-lapse.

**end** · 1.3 · the whole room — QUIET
- High wide from the back-left: (−2.8, 2.75, 2.9) → (2.2, 0.9, −3.0), vfov 46,
  slow drift. The time-lapse continues; the clock above the corner sweeps to
  15.40; at u ≈ 0.5 a sun beam finally reaches the corner and lands on Eren.
  u 0.6 **the bell**: real time snaps back — everyone moves at once (kids
  stand, bags swing up, Salim and İbrahim drop their feet and run for their
  bags, the teacher slips the plane into his cardigan pocket). Eren stays
  exactly as he is, in the light. Hold this to the last frame.
- Text: **end** (center final) 0.64→ "TEK AYAK" — sub "Sadece akıp giden bir
  sahne." — Image: the room emptying around Eren, who has not moved.

---

## 5. The choice — `glance` (hush 0.51)

Title **BUNU KİM ATTI?** · prompt "Sen de o sıralardan birindesin. Gözlerin
nereye kaçıyor?" The reader is the student at seat R. The outcome never
changes (the teacher already knows); one line, the view and one echo change.

| option | sets | view after picking (look request from R) | reply | later |
|---|---|---|---|---|
| Salim’e. | `look:salim` | turn to Salim (2.1, 1.08, 1.55): he stares up at the ceiling stain (2.0, 3.19, 0.6), very interested | "Salim tavandaki su lekesine bakıyordu. / Onu hayatında ilk kez görüyormuş gibi." | **glance-salim**: the teacher's head turns to Salim; Salim keeps looking up |
| İbrahim’e. | `look:ibrahim` | turn to İbrahim (2.1, 1.0, 2.75): ears deep red, eyes on his desk | "İbrahim’in kulakları kıpkırmızıydı. / Kulakları her zaman ondan önce itiraf ederdi." | **glance-ibrahim**: teacher looks at İbrahim; the ears redden further |
| Eren’e. | `look:eren` | turn to Eren (2.7, 1.02, 2.8): head up, calm, looking straight at the teacher (chest-up over the desk — sweep-test this view) | "Eren başını kaldırmış, öğretmene bakıyordu. / Sınıfta gözünü kaçırmayan tek kişi oydu." | **glance-eren**: teacher and Eren hold each other's gaze a beat |
| Önüne. | `look:desk` | pitch down to R's own desktop: the carved heart and "2011", the reader's notebook with "Dengelenmiş kuvvetler" underlined | "Sırana baktın: pergel ucuyla kazınmış eski bir kalp. / Kimseyi ele vermedin." | **glance-desk**: teacher's eyes are already on the back-right corner; at **reveal** line 2 becomes "Bu kez sen de." |

Everyone else: line 2 of **looked** is "Sen de." The trio's behaviors (Salim
staring up, İbrahim's red ears, Eren's level gaze) are the same in every
branch; the choice decides which one the reader sees.

---

## 6. Discoveries

| id | where (m) | when | vis. | why |
|---|---|---|---|---|
| teacher-desk | (−2.5, 0.8, −2.45) | board → end of ch. 1 | subtle | thermos, red pen; notebook: "31. yıl. Son yıl?" — the teacher is tired, near the end |
| ramp | (3.9, 0.03, −2.1) | light → rows | subtle | a fair-play clue for the curious: a door ramp, edges polished by daily use. Keep it plain; no highlight |
| ceiling-stain | (2.0, 3.19, 0.6) | turn → smooth | hidden | the Africa-shaped stain Salim studies; "zor bir soru sorulduğunda sınıfın yarısı ona bakardı" |
| carved-heart | (0.42, 0.73, −0.05) | hush | subtle | R's desk: a heart and "2011"; "senden önce on beş kişi oturmuştu; hepsi gelip geçmiş, kalp kalmıştı" — the desk as another still thing that watches people flow past (echoes the ending) |
| no-dot | (0.72, 1.27, −2.83) | smooth u 0.45 → end of tip | visible | the wing: İbrahim's İ lost its dot; "İbrahim bunu bütün hafta sonu dert edecekti" (it is Friday, last period — no break after) |
| fleet | (2.33, 0.5, −3.05) | reveal → end | subtle | on the wheelchair's side panel (the +x side, facing İbrahim): two marker-drawn wings, "S.E.I · Uçak No. 1" in Eren's neat hand — the airline always included him |
| board-law | (1.0, 1.45, −3.46) | still → end | subtle | the law beside Eren: "duruyorsa durmaya devam eder" |

---

## 7. Sound

- **Ch. 1:** room tone; chalk scratches and taps; the wall clock's tick (a
  slightly sticky second hand); pens; a far whistle and a ball from the
  yard through the glass. (The radiators are cold: no radiator ticks
  anywhere in the story.)
- **Ch. 2:** crisp paper folds; a felt-tip cap popped off; a marker squeak;
  snorts held in, "şşş"; the plane's soft whoosh (slow-motion, pitched down);
  a dry paper tap on the head; the plane skittering on linoleum.
- **Ch. 3:** silence after the hit; the chalk snap; the wall clock ticking
  as the loudest thing (close and dry on the `hush` insert); the shout (a single sharp voice burst, no words needed
  in audio); paper being smoothed; in `mock` a low, fast, unintelligible
  angry mutter (no words); the plane slapped into a palm.
- **Ch. 4:** two chair legs scraping; one rubber squeak (ambiguous); steps
  (masking any rolling); then quiet; a sole leaving the floor, a hand
  slapping the wall; from `lift` 0.62 near-silence, only the clock.
- **Ch. 5:** the whisper (sibilant, close); a snort; the laugh bursting and
  spreading to fill the room; in `flow` it low-passes into a distant hum
  while the clock's tick accelerates with `lapse(p)`; at `end` 0.6 the
  electric school bell, then chairs and voices rushing — and under the title,
  the room tone again.

One-shots and their captions are in `CAPTIONS` (text.ts).

---

## 8. Story-select card art

A paper plane frozen mid-air in a slanted beam of October light, chalk dust
glittering around it; behind, out of focus, a green chalkboard and the back
of a teacher in a grey-brown cardigan. On the wing, in sloppy black marker:
"S.E.I Havayolları". No students' faces, no Eren.

---

## 9. Helpers in `timeline.ts`

- `wallClock(p)` → seconds since midnight for the wall clock (real minutes
  in scenes, time-lapse 15.20 → 15.40 across `flow`/`end`); `clockText(s)` →
  "15.12".
- `lapse(p)` → 0…1, how strongly the room runs in time-lapse (0 before
  `flow` 0.25, 1 through `end` 0.56, back to 0 at the bell `end` 0.6). Apply
  it to everyone and everything except Eren.
