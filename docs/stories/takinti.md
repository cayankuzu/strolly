# TAKINTI — screenplay

The contract between the words (`src/stories/takinti/text.ts`, `timeline.ts`)
and the set (`src/three/takinti/`). Every segment below says what the image
shows while each line is on screen. Positions are in meters; tune lights and
cameras freely as long as the relationships marked **(must)** still read.

- 33 segments · 7 chapters · **68.6 screens** · `SCREEN_VH = 88`
- 1 choice (at the half-open door) · 9 discoveries · 40 sound captions
- Rail: right (keep the subject of each frame left of centre)
- Pacing rule used: a one-line item stays ≥ 0.9 screens, a two-line item
  ≥ 1.6. In a two-line item the second line arrives later (`stagger`); the
  table gives the local time `u` at which it arrives — the image change the
  screenplay names for that line happens at that `u`.

---

## 1. Logline, tone, palette, light

**Logline.** At midnight a boy hears his mother at her sewing machine again,
turning things nobody uses into rags. He shouts at her through the half-open
door and goes back to bed. The camera stays. In the morning he runs down to
make up with his withdrawn older brother and asks his mother where he is.

**Tone.** Quiet domestic horror. An ordinary old house, an ordinary machine,
an ordinary morning. The camera is patient, mostly still or slowly dollying,
often low. Horror lives in sound (the treadle's creak, the needle's rattle, a
wet drag), in a shadow on a wall, in a strip of streetlight on the floor, in
dark streaks — never in a lit close-up of a wound.

**Palette.**

| Time | Base | Key light | Accents |
|---|---|---|---|
| Night (ch 1–4) | blue-black `#0b1220`, walls `#1a2333` | streetlight, cold white-green `#cfe3d6`, hard edges | blood marks near-black `#241010`, never saturated red |
| Dawn (ch 5) | pre-dawn blue `#33415a` | low sun, sick yellow `#d9b75a` | pale "cloth" pieces `#e6d3c2` |
| Morning (ch 6–7) | pale, flat `#e8e4da`, tiles cream `#efe6cf` / pale green `#b9cdb4` | soft overcast daylight; harsh yellow sun only inside the sewing room | the rag `#e2cfbf` with a darker seam |

**Light per chapter.**

1. GECE YARISI — night. No interior lamp is ever switched on. The streetlamp
   across the street is the only key: through the boys' blind it lays bright
   bars; the toilet has only a frosted window's faint blue.
2. MERDİVEN — night. Stairwell nearly black. A faint cold spill comes out of
   the sewing room's half-open door at the bottom (a cheat: a dim bounce
   light just inside the gap — the real beam lands on the room's north side)
   and grows as he descends.
3. KAPI — night. The sewing room is lit only by the streetlight band.
4. PEDAL — night, harder contrast, same band.
5. ŞAFAK — the streetlamp clicks off (`sunrise` u 0.08); blue pre-dawn; then a
   low yellow sun through the same east window onto the sewing table.
6. SABAH — morning, flat ordinary daylight upstairs; through the open sewing
   room door, a harsh over-exposed yellow.
7. MUTFAK — morning, cold even daylight from the kitchen's north window. The
   horror of normal light: clean, bright, nothing hidden but the meaning.

---

## 2. World layout

Axes: x right (east = street side), y up, z toward the default camera.
One house, built once; cuts are camera jumps inside it. Ground floor y 0–2.7,
upper floor y 3.0–5.7 (0.3 slab). Old plaster walls, faded patterned
wallpaper in the halls, worn wooden floors upstairs and in the halls.

### Exterior (street) — `street`

- East façade of the house at x 5.0 (outer face x 5.25), two storeys,
  pitched roof (ridge along z, y ≈ 7.6), house spans z −11.0 … +2.0.
- Two windows on the façade, one above the other, both at z −2.9 … −1.7:
  - ground: **sewing room window** (y 0.85–2.2), lace curtain over its north half;
  - upper: **boys' room window** (y 3.85–5.2), venetian blind, slats tilted open.
- Pavement x 5.25 → 7.0, road x 7.0 → 12.0, far pavement x 12.0 → 13.5.
- **Streetlamp** across the road: pole at (12.6, 0, 1.5), 6 m; arm reaching
  −x; lamp head at (11.8, 6.0, 1.5). Cold white-green, faint buzz, a few moth
  specks. It is the key light for both east windows (a SpotLight aimed at
  (5.0, 2.5, −2.3), wide cone, hard shadows). Its rays travel west, down and
  north (−x, −y, −z): that is why the band in the sewing room runs toward the
  north wall.
- Dark neighbouring façades across the street; deep blue sky, no moon.

### Upper floor (y = 3.0)

- **Boys' room** x 0.8 → 5.0, z −4.4 → −0.4 (directly above the sewing room).
  - Door: west wall, z −2.0 → −1.15 (open at night).
  - Window: east wall (see above), blind → 6–8 bright parallel bars falling
    north-west across the floor, the boy's bed and the north wall.
  - **Boy's bed**: along the north wall, centre (3.3, 3.0, −3.9), 2.0 × 0.95,
    mattress top y 3.45, headboard east; grey-blue duvet. In the bars of light.
  - **Brother's bed**: along the south wall, centre (3.3, 3.0, −0.9), same
    size; dark maroon duvet pushed to the foot; pillow; **empty** (night and
    morning). In shadow at night. Two dark posters above it on the south wall.
    Black over-ear headphones with a tangled cable on the pillow (night: barely
    readable; morning: clearly).
  - **TV cabinet**: west wall, centre (1.05, 3.0, −3.3), 0.45 × 1.2 × 0.5; small
    CRT TV at (1.05, 3.5, −3.5); console box (1.1, 3.52, −3.05); **two
    controllers** at (1.1, 3.53, −3.0) and (1.1, 3.53, −3.2) — the second one
    under a grey film of dust (lighter, matte).
  - A rug between the beds.
- **Upper hallway** x −0.8 → 0.8, z −4.4 → 5.6. Bare ceiling bulb (off).
  - Toilet door in the west wall, centre z −2.9, 0.75 wide.
  - **Linen cupboard** built into the east wall at z 3.6 → 4.5, 2.1 tall, door
    ajar (~40°, opening into the hall). Five shelves of folded rags in faded
    mixed colours, each with a tiny white paper tag sewn to a corner.
  - Stairwell opening x −1.8 → −0.8, z 0.9 → 4.6, wooden banister along
    x −0.8 (rail y 3.9). Landing x −1.8 → 0.8, z 4.6 → 5.6, small window in
    its south wall (y 4.2, for morning light only).
- **Toilet** x −2.6 → −0.8, z −4.4 → −2.2. Bowl at (−2.2, 3.0, −3.9) against
  the west wall; sink + dark mirror on the north wall at (−1.25, 3.0, −4.2);
  the tap drips; a small frosted window high in the west wall (y 4.7–5.2,
  z −3.3 → −2.8) with a faint blue glow; **towel rack** on the west wall at
  (−2.55, 4.1, −2.6) holding a rag cut from striped pajamas, edges densely hemmed.

### Stairs

Straight wooden flight, 16 risers (0.1875) × 0.23 treads, x −1.8 → −0.8: top
at (−1.3, 3.0, 4.6), descending toward −z to the bottom at (−1.3, 0, 0.9).
Every tread creaks differently. On the ground floor the stair hall
(x −1.8 → −0.8, z 0 → 4.6) is **open to the lower hallway along x −0.8** (no
wall, just the banister's newel post at (−0.8, 0, 0.9)), so from the foot of
the stairs he steps straight into the hallway.

### Ground floor (y = 0)

- **Lower hallway** x −0.8 → 0.8, z −7.5 → 2.0 (front-door alcove at the
  south end, unused).
- **Sewing room** (the mother's room) x 0.8 → 5.0, z −4.4 → −0.4.
  - **Door**: west wall, z −1.6 → −0.7 (0.9 wide), **hinge on the south jamb**
    (0.8, 0, −0.7), opens inward (+x). Night: half-open (~50°; free edge at
    ≈ (1.49, −1.28)) — the gap is on its north side, and a sight line from the
    hallway at (−0.35, 1.45, 0.6) through the gap lands on the north wall
    around x 2–3.5 **(must)**. `close`: shut. Morning: wide open (~100°).
  - **Window**: east wall, z −2.9 → −1.7, y 0.85 → 2.2, lace on its north half.
  - **Sewing table**: under the window, centre (4.7, 0, −2.4), 0.6 × 1.2, top
    y 0.76, dark wood. An old black **treadle sewing machine** with gold decals
    on it, needle at (4.55, 0.95, −2.4); spool on the pin at (4.7, 1.05, −2.05)
    (thread: skin-coloured). Under the table a cast-iron treadle frame with a
    wide foot plate at (4.4, 0.12, −2.4) that rocks ±12° with each press, and a
    drive wheel at the south end that spins. A pair of black tailor's
    scissors on the table's south end (4.75, 0.77, −1.95).
  - **Stool** at (4.05, 0, −2.4); the mother sits on it **facing the window
    (+x), her back to the door (must)**.
  - **Fabric heap** beside the stool on its south side, centre (3.8, 0, −1.35),
    1.2 × 0.8 × 0.45: old clothes, curtains, muted colours.
  - Basket of cut rags at (4.6, 0, −0.75). **Wardrobe** against the south wall,
    centre (2.5, 0, −0.68), 1.2 × 0.55 × 2.0 (x 1.9 → 3.1: clear of the door,
    whose 0.9 m leaf swings through x 0.8 → 1.7).
  - **Dress form** (headless tailor's dummy on a pole, pale linen, 1.55 tall)
    in the north-west corner at (1.3, 0, −3.95). In the dark it reads as
    someone standing.
  - **The streetlight band ("the lit part of the room") (must)**: through the
    window a hard-edged parallelogram of cold light lies on the floor, running
    north-west from the table's foot (about x 3.5, z −2.4 … −3.6) to the north
    wall between x 1.6 and 2.7, and climbs that wall to y ≈ 1.0. Outside the
    band the room is near black (ambient ≈ 0.04). The north-east corner
    (x 3.0 → 3.8 along the north wall) must stay the darkest place in the room.
  - **The mother's shadow (must, cheat allowed)**: her silhouette is cut out of
    the beam, and her long, thin shadow lies across the band — head bobbing,
    elbow jerking with each stitch, hair hanging — and **climbs the lit patch
    on the north wall at x ≈ 1.8 → 2.6, up to ~1.6 m**. Real geometry puts her
    head's shadow on the floor around (1.7, 0, −3.5); stretch it onto the wall
    with a second, shadow-only light or an animated silhouette decal.
  - **The body** (see cast): sits on the floor with its back against the north
    wall at (3.4, 0, −4.15), facing south, head dropped to the chest, legs
    stretched toward the south-west; the **feet at (3.05, 0.05, −3.35) lie
    inside the band's east edge (must)**; the rest is in darkness. Keep the
    shins dark too (narrow the band's north-east edge or let the lace shadow
    eat it): only the feet are lit. Slide path along the wall during PEDAL:
    x 3.4 → 3.1 → 2.8 → 2.5, then it tips to its left and lies along the wall
    base at (2.2, 0, −3.95), fully inside the band.
  - **Marks**: near-black horizontal smears on the north wall between x 3.6
    and 2.3, y 0.25 → 0.95 (from a hand's breadth above the floor up to
    about knee height of a standing adult), growing with each slide; dark
    irregular floor decals at each resting place. Morning: dried, brown-black;
    floor pools half wiped (smeared arcs). Morning also: the fabric heap has
    been moved over the body along the north wall — a long mound under the
    streaks, bigger than at night. Nothing of the body is visible in the
    morning.
- **Kitchen** x −2.5 → 2.5, z −11.0 → −7.5; open doorway from the hallway at
  z −7.5 (x −0.8 → 0.8).
  - North wall: window centre (0, 1.5, −11.0), 1.4 × 1.0; sink below; counter.
  - Stove on the west wall at (−2.2, 0, −10.2): a cold kettle and an empty
    copper cezve.
  - Fridge (2.15, 0, −10.5). Small table with two chairs at (1.5, 0, −8.4).
  - **Mop** leaning against the east wall at (2.4, 0, −9.2), dry, grey.
  - Floor: 0.3 m checker tiles, cream and pale green.
  - **Mother** kneeling at (−0.5, 0, −9.4), facing −z (back to the doorway),
    wiping in slow circles with a large pale **rag** (hemmed edges, a long
    darker seam across it); **bucket** at (−1.1, 0, −9.1), the water faintly pink.

### Cast

- **ÇOCUK** — the boy, ~13, never named. Male, height factor 0.85, slim.
  Short dark messy hair. Faded navy T-shirt, grey pajama trousers, barefoot.
  Same clothes in the morning.
- **ANNE** — the mother, ~60. Female, height factor 1.06 (tall), very thin,
  long limbs, stooped shoulders, wrinkled thin hands. Long grey hair loose to
  mid-back. Ankle-length, long-sleeved, yellowed off-white cotton nightgown.
  Barefoot. **Her face is never seen**: at night she is a back, a silhouette or
  a shadow; at dawn a head-and-shoulders silhouette against the window from
  behind; in the morning a back and a curtain of hair.
- **The body** (the older brother, ~16; his name is said only in the last
  scene). Male, height factor 0.95, only ever sitting or lying. Bald (no
  scalp). One matte material, dark brown-maroon `#3a1612`, almost no
  specular, low detail; only the feet get a slight wet sheen (`feet` segment
  only). Never standing, never a face, never in a lit close-up. Through
  ch 3 it is an unreadable darker mass in the corner. In the morning it is
  under the fabric heap.

---

## 3. Segment table

`u` = local progress 0–1 in the segment. Camera: position → target, vertical
FOV. Text: id (from–to) — what the image shows *at that moment*; "L2 @ u" is
when the item's second line arrives.

### 01 — GECE YARISI (screens 0.0–9.4)

**street** · 1.3 · EXT. house, night
- Action: empty street, the dark house, the humming lamp; both east windows
  dark. From inside, faint and regular, a machine's tak-tak.
- Camera: across the street (14.5, 1.6, 7.0) → (5.0, 3.6, −2.3), 40°; slow
  dolly to (10.5, 3.2, 2.5), tilting up to the upstairs window by u 1.
- Sound: lamp buzz; the muffled rhythm from inside.
- Text: `nothing` (−1–0.9, centre) "Bu evde hiçbir şey çöpe gitmezdi." — over
  the dark façade and its two windows, the lamp in the foreground.

**wake** · 2.1 · INT. boys' room, night
- Action: u 0–0.3 the boy, lying in his bed (north wall), turns and sits up,
  feet to the floor; u 0.3–0.43 stands; u 0.43–1 walks slowly through the
  light bars to the door (3.0, −3.3) → (0.9, −1.6), fingers brushing the bed.
- Camera: (2.0, 4.6, −1.7) → (3.4, 3.5, −3.6), 45°, looking north-east at
  his bed; the brother's bed is off-frame right, ~85° to the side (hidden
  discovery: the reader must turn). From u 0.45 pan with him to target
  (1.0, 4.0, −1.6).
- Light: blue-black; the blind's bars slide over his body as he walks.
- Text: `getup` (0.05–0.95) L1 "Gece yarısı… yatağından çıktı." — he sits up,
  stands. L2 @ u 0.43 "Sokak lambalarından yansıyan ışık huzmeleri… yönünü
  bulmakta zorlanmadı." — he crosses the barred floor to the door; the bars
  are what the line names.

**hall** · 1.9 · INT. upper hallway, night
- Action: u 0–0.3 he steps out (0.0, 3.0, −1.6), turns toward the toilet
  door; u 0.3 stops, head tilted down toward the stairwell; u 0.3–0.7 still,
  a hand on the wall; u 0.7–1 rubs his eyes, shrugs, goes on to the toilet door.
- Camera: (0.2, 4.55, 1.8) → (0, 4.0, −2.5), 40°: his small figure down the
  corridor; on the left the black stairwell opening with a faint cold glow
  rising from below.
- Text: `sounds` (0.04–0.94) L1 "Tuvalete doğru giderken aşağı kattan sesler
  geldiğini duydu." — he steps out and the sound stops him. L2 @ u 0.45
  "Bunlar gerçek miydi…" — standing still, hand on the wall, then rubbing his
  eyes.

**toilet** · 1.9 · INT. toilet, night
- Action: u 0–0.2 he goes in, pushes the door almost shut (it stays ajar),
  his hand passes the light switch without pressing it; u 0.2–0.45 at the
  toilet, a dim silhouette from behind (nothing explicit); u 0.47–1 he
  freezes and bends his head toward the floor; the tap drips.
- Camera: corner by the door (−1.05, 4.5, −2.45) → (−2.0, 3.9, −3.8), 50°.
  The towel rack with the pajama rag sits ~50° off the left edge (subtle
  discovery).
- Light: only the frosted window's faint blue.
- Text: `whispers` (0.04–0.94) L1 "Çok ciddiye almadan tuvalete girdi; ışığı
  yakmadı." — he enters, the hand passing the switch. L2 @ u 0.47 "Fakat
  sesler devam ediyordu…" — he freezes, head bent toward the floor.

**voice** · 2.2 · INT. toilet → sewing room (insert)
- Action: u 0–0.44 he has moved to the sink, hands on its edge; close on him
  in three-quarter profile beside the dark mirror: recognition, then a tired
  clench of the jaw. u 0.44 CUT to the sewing room, an insert only: extreme
  close-up of the needle pumping in the streetlight, pale fabric sliding under
  the presser foot, two thin wrinkled fingers guiding it. u 0.75 CUT: under the
  table, a bare old foot rocking the iron treadle.
- Camera: u 0–0.44 (−0.95, 4.35, −3.1) → (−1.3, 4.3, −4.0), 35° (from the
  south-east, 0.9 m from him, his right profile and the black mirror).
  u 0.44: (4.25, 1.1, −2.2) → (4.55, 0.85, −2.4), 28°.
  u 0.75: (3.9, 0.3, −2.0) → (4.4, 0.1, −2.4), 32°.
- Sound: at the cut the rhythm becomes loud and present.
- Text: `hers` (0.04–0.96) L1 "Annesinin sesiydi bu." — his face, listening.
  L2 @ u 0.445 "Yine gece gece dikiş makinesine oturmuş… bez hâline
  getiriyordu." — the needle, the pale fabric, her fingers, then the rocking
  treadle.
- Never show what the fabric is; it is pale cloth.

### 02 — MERDİVEN (screens 9.4–20.7)

**landing** · 2.2 · INT. upper hallway → landing, night
- Action: u 0–0.15 the toilet door opens, he comes out (−0.5, 3.0, −2.9);
  u 0.15–0.75 walks +z up the hallway toward the camera, decisive; u 0.5–0.7
  passes the ajar linen cupboard (on his left) and glances in; u 0.75–1
  reaches the landing (−1.3, 3.0, 5.0), turns to face down the stairs, hand on
  the banister.
- Camera: on the landing (0.4, 4.6, 5.4) → (0, 3.9, −2.0), 42°; the open
  cupboard fills the right edge from u 0.45 (shelves of folded rags with tiny
  paper tags, lit by the faint glow from the stairwell). u 0.75–1 pan left to
  look down the stairwell over his shoulder.
- Text: `decide` (0.04–0.96) L1 "Aşağı inmeye karar verdi… nafile." — he comes
  out and walks toward us, decided. L2 @ u 0.5 "Merdiven başındaki dolap
  katlanmış bezlerle doluydu. Hepsi bir zamanlar başka bir şeydi." — the
  cupboard of folded rags beside him, his glance.

**descent** · 2.1 · INT. stairs, night
- Action: he goes down step by step (step 1 → ~11), one hand on the
  banister; at u 0.55 he slows and turns his head toward the sound.
- Camera: from the landing, above and behind (−1.0, 4.9, 5.4) → (−1.3, 1.2,
  1.0), 45°, sinking with him to (−1.1, 3.4, 3.6). At the bottom of the flight
  a slanted patch of cold light on the hallway floor (the spill from the door
  gap) grows brighter as we descend.
- Text: `louder` (0.04–0.96) L1 "Merdivenlerden inerken… dayanılmaz bir hâl
  alıyordu." — the descent into the dark, the glow below. L2 @ u 0.55
  "Annesinin iniltileri yerini kelimelere bırakıyordu." — he slows, head
  turned toward the voice.

**words** · 2.8 · INT. stairs, lowest steps
- Action: he stops on the third step from the bottom (−1.3, 0.56, 1.36),
  frozen, gripping the banister. u 0.31 his grip tightens; u 0.64 his free
  hand closes into a fist.
- Camera: low in the lower hallway looking up at him (−0.2, 0.9, −0.8) →
  (−1.3, 1.5, 1.6), 38°, very slow push-in. The door's cold spill lies on the
  floor beside the camera and reaches his shins; his face half lit: sleepy
  confusion turning to irritation.
- Sound: her voice — breathy, murmured, close; giggles; the machine under it.
- Text (ANNE): `below` (0.02–0.6) L1 "— Hıhıhı… eveeet… işte böyle." — he
  freezes. L2 @ u 0.31 "Artık işe yarar biri olacaksın." — his grip
  tightens. `worn` (0.64–0.99) "— Kimse seni kullanmıyordu, artık
  eskimiştin… hehehehe…" — the fist.

**anger** · 1.8 · INT. lower hallway
- Action: u 0–0.5 he takes the last steps fast and lands in the hallway
  (0, 0, 0.6); u 0.5–1 strides −z toward the door on his right, faster
  (he will stop at (0.45, 0, −0.2) in `shadow`).
- Camera: behind him at shoulder height, slight handheld sway (0.2, 1.4, 1.8)
  → (0.2, 1.2, −3.0), 45°, moving with him.
- Text: `sure` (0.04–0.96) L1 "Bu sözleri duyunca… sinirlendi." — he jumps
  the last steps. L2 @ u 0.55 "Adımlarını hızlandırdı." — the fast stride
  toward the light.

**shadow** · 2.4 · INT. lower hallway at the sewing room door · CHOICE
- Action: u 0–0.3 he arrives at (0.45, 0, −0.2), beside the south jamb of
  the half-open door, and stops; u 0.3–1 he leans to look through the gap,
  one hand half-raised.
- Camera: over his left shoulder (−0.35, 1.45, 0.6) → (2.6, 1.0, −4.4), 40°
  (he stands ~20° right of centre, clear of the sight line); through the gap
  the north wall of the sewing room: inside the band of streetlight, **the
  mother's shadow at the machine — enormous, long, thin, hunched, the hair
  hanging, an elbow jerking with each stitch, the head bobbing** (must).
  u 0.35–0.85 slow push to (−0.15, 1.45, 0.15) (still behind him, still in
  the hallway; the line passes the gap at z ≈ −1.42). We do not see the
  mother herself; the corner right of the shadow is black.
- Text: `saw` (0.04–0.84) L1 "Yarı açık kapıdan duvara vuran gölgeyi
  gördü." — he reaches the door and looks. L2 @ u 0.4 "Dikiş makinesinin
  başındaki uzun, sıska, buruşuk vücudun gölgesi çok korkunç görünüyordu." —
  the push-in on the shadow.
- **Gate `door` at u 0.92**: hold on the gap and the moving shadow; nothing on
  the rail.

### 03 — KAPI (screens 20.7–28.5)

The chapter has two versions. **Branch on the flag `door:call`**: without it
(he went in — the source's version and the default) use IN; with it use CALL.

**enter** · 1.8
- IN: u 0–0.3 he pushes the door to ~95° (hinge creak); u 0.3–0.7 two steps
  in, to (1.5, 0, −1.2). Camera: u 0–0.3 behind him in the hallway
  (−0.3, 1.5, −0.4) → (1.2, 1.2, −1.2) as the door swings; u 0.3–0.7 it
  follows him into the doorway and settles at (0.5, 1.5, −1.05) →
  (4.2, 1.0, −2.6), 42°, over his shoulder: the mother's back on the
  stool, a black silhouette against the lace and the streetlight, the treadle
  rocking under her feet, the fabric heap beside the stool (L2 @ u 0.5 names
  it: let the heap catch a rim of light then). The dress form stands in the
  dark north-west corner, ~45° left of frame (subtle discovery). The corner
  beyond the table is black and unreadable.
- CALL: he steps onto the threshold (0.25, 0, −1.0), hand on the door's
  edge; the door stays half-open. Camera outside, behind him (−0.2, 1.45, 0.2)
  → (2.8, 1.0, −4.4), 36° (this line clears the leaf and passes the gap at
  z ≈ −1.33; he stands ~15° left of it): only the shadow on the wall; L2 @
  u 0.5 — the shadow's elbow rising and falling with each stitch.
- Text: `enter-in` (0.04–0.96) "İçeri girdi. Annesi, sırtı kapıya dönük…" /
  "Yanı başında bir yığın kumaş vardı." · `enter-call` (0.04–0.96)
  "Aralıktan yalnızca duvardaki gölge görünüyordu." / "Gölgenin dirseği her
  dikişte kalkıp iniyordu."

**shout** · 1.9
- Action: u 0.04 he shouts, leaning forward, fists at his sides; u 0.52 on
  "yeteeer" both arms thrown down, a stamp. The mother does not react: the
  treadle keeps rocking, the elbow keeps moving.
- Camera: reverse, from the window behind the mother, (4.9, 1.6, −2.2) →
  (1.0, 1.2, −1.2), 40°: her head and shoulder a dark mass ~27° right of
  centre, 0.9 m from the lens (grey hair, no face); the boy beyond — IN: inside
  the room, two steps from the door; CALL: in the gap between the leaf's free
  edge and the jamb, only his face and one shoulder. A faint cheat fill
  catches his face.
- Text: `shout` (0.04–0.96, ÇOCUK) L1 "— Anne, yeter artık. Lütfen git uyu,
  yarın devam et." — he leans in and shouts. L2 @ u 0.52 "Uyuyamıyorum,
  yeteeer!" — the stamp; her shoulder in the foreground keeps working.

**trance** · 2.1
- Action: the mother pedals on — a press every ~0.18 u, a moan on each creak,
  the head swaying a little. The boy stares.
- Camera: IN — slow push from behind the boy toward her back (1.2, 1.4,
  −0.9) → (3.4, 1.2, −2.4), 38°, ending close on her back and on pale fabric
  pooled on the table beside the machine: only its edges catch light, the
  shapes unreadable. CALL — from the hallway through the gap: the camera moves
  from (−0.2, 1.45, 0.2) to (0.3, 1.45, −0.6), target (2.8, 1.0, −4.4), 36°,
  the boy's head at the left edge; on the wall the shadow's hands pull
  something long through the needle.
- Text: `trance-in` / `trance-call` (0.04–0.96) L1 "Annesi transa geçmiş
  gibiydi; hiçbir tepki vermeden pedala basıyor, gıcırtıların arasında
  inliyordu." — her unbroken rhythm. L2 @ u 0.55 (IN) "Bu kadar yakından bile…
  seçemiyordu." — the unreadable pale shapes on the table / (CALL) "Odanın
  karanlığında ne diktiğini tam olarak seçemiyordu." — the shadow's hands.

**close** · 2.0 · INT. lower hallway
- Action: u 0–0.2 (IN: he steps back out first) he pulls the door shut; the
  spill vanishes; only a thin cold line of light shows under the door.
  u 0.2–0.45 he walks toward the camera and past it (exits frame left, to the
  stairs behind us); we hear the treads creak upward. u 0.5–1 the camera
  stays on the closed door in the dark; the machine goes on behind it.
  u 0.85–1 a slow dolly toward the door begins (pre-lap into ch 4).
- Camera: (0.0, 1.3, 1.6) → (0.8, 1.0, −1.15), 42°.
- Sound: the door closing; stairs creaking upward and away; the machine
  muffled, then clearer as we approach.
- Text: `closed` (0.04–0.49) "Odanın kapısını kapattı ve yeniden uyumak için
  yukarı çıktı." — he shuts the door and leaves. `kept` (0.53–1.02) "Annesi
  dikişine devam etti." — the closed door, the sound.

### 04 — PEDAL (screens 28.5–38.0)

The boy is gone. The camera is inside, a witness: low, still, heavy.

**corner** · 2.1
- Action: the mother at the machine, back to us, pedalling. In the corner
  beside the table, against the north wall, a darker mass sitting in the
  dark, head bowed — barely separable from the black.
- Camera: u 0–0.53 starts where the boy was (IN: (1.5, 1.4, −1.2); CALL: just
  inside the closed door (1.0, 1.45, −1.15)), tracks slowly to (2.2, 1.0, −2.6)
  and pans from her back (4.1, 1.1, −2.4) to the corner (3.4, 0.6, −4.1), 40°.
  u 0.57–1 from near the corner it looks back toward the door ((3.0, 0.8,
  −3.8) → (1.4, 1.0, −1.2)): IN — the floor where he stood, a few steps away,
  lit by a sliver of the band; CALL — the closed door and the narrow line
  where the gap was.
- Text: `body` (0.04–0.53) "Dikiş makinesinin yanında, ışığın vurmadığı
  köşede, cansız bir beden vardı." — the pan arrives at the dark sitting
  shape. `corner-in` / `corner-call` (0.57–1.02) "Çocuk az önce ondan yalnızca
  birkaç adım ötede durmuştu." / "Kapı aralığından bakan çocuk, bu köşeyi
  karanlıktan ayıramamıştı." — the look back at where he stood.

**feet** · 2.1
- Action: still. The mother pedals; her elbow's shadow crosses the band.
  The legs come out of the dark; the feet lie in the light.
- Camera: low on the floor near the dress form (1.9, 0.35, −3.2) → (3.1,
  0.15, −3.5), 45°: the black mass against the wall, the legs leading out of
  the dark, the feet small in frame, in hard light. u 0.57–1 very slow push
  to (2.2, 0.3, −3.3); **never closer than 0.8 m**; the feet read as dark,
  wet-sheened, wrongly coloured shapes — no detail.
- Text: `sitting` (0.04–0.98) L1 "Karanlıklar içinde, oturur hâlde duvara
  yaslanmıştı; ayakları ise sokak lambasının ışığına uzanıyordu." — the mass
  against the wall, the feet in the light. L2 @ u 0.57 "Ayaklarında hiç deri
  yoktu." — the push toward the feet.

**drag** · 1.9
- Action: hard presses at u 0.1, 0.45, 0.8: the treadle slams, the floor
  shudders (subtle camera shake), the body jerks and shifts a few centimetres
  west; a dark smear begins on the wall behind its back.
- Camera: u 0–0.42 under the table on her bare foot slamming the plate (4.0,
  0.25, −1.8) → (4.4, 0.1, −2.4), 35°. u 0.42 CUT wide and low from the west
  (1.4, 0.5, −3.4) → (3.0, 0.4, −4.1), 45°: the body's silhouette against the
  wall, shifting; the smear behind it.
- Text: `hard` (0.04–0.96) L1 "Anne pedala o kadar sert basıyordu ki…
  kayıyordu." — the foot and the pedal. L2 @ u 0.43 "Duvarda kan izleri
  bırakarak aydınlığa doğru sürükleniyordu." — the sliding silhouette and the
  smear.

**thrice** · 1.5 · QUIET
- Action: three presses at u 0.06, 0.34, 0.61. Each: the treadle slams, the
  machine jolts, the body slides 0.3 m west along the wall (x 3.4 → 3.1 → 2.8
  → 2.5), further into the band — shins, knees, then hips in the light; the
  smear lengthens. u 0.8–1 stillness, the needle stopped mid-stroke.
- Camera: locked-off, wide and low from the south-west (1.6, 0.9, −1.2) →
  (2.8, 0.5, −4.2), 40°; the mother's back at the right edge, the body
  left-centre. **Expose for the bright wall patch**: the body against it reads
  as a silhouette with a thin rim, never a lit surface.
- Text: `count` (centre, 0.06–0.98) "Bir kez," / "iki kez," / "üç kez…" —
  each phrase lands with its press (u 0.06, 0.34, 0.61).

**fall** · 1.9 · QUIET until u 0.45
- Action: u 0.05 the last and hardest press: the body tips to its left and
  slumps along the wall base into the band (2.2, 0, −3.95). u 0.1–0.45
  silence, the machine stopped. u 0.45 CUT to the wall: long dark smears and
  the floor pools where it sat. u 0.5 the machine starts again.
- Camera: u 0–0.45 the same locked-off wide; u 0.45 (2.0, 0.9, −2.6) → (3.0,
  0.5, −4.4), 40°: the marks fill the frame; the body is only a dark edge at
  the left border.
- Text: `fell` (0.05–0.96) L1 "Son bir basıştan sonra beden tamamen
  aydınlığa düştü." — the topple into the light. L2 @ u 0.46 "Ondan geriye
  duvarda ve yerde kan izleri, kan birikintileri kaldı." — the smears and
  pools.

### 05 — ŞAFAK (screens 38.0–51.4)

**flayed** · 2.8 · night, last minutes
- Action: the body lies in the band; the mother sews on.
- Camera: u 0–0.4 high and far, from the north-west ceiling corner (1.2,
  2.5, −4.2) → (2.3, 0.1, −3.9), 30°, framed past the dress form's pole: the
  long dark shape on the bright floor, **broken up by the lace curtain's
  shadow pattern** (put a lace gobo/texture in the band) so it never reads
  cleanly. u 0.4–1 the camera drifts away toward the window and the lace,
  the streetlamp beyond, and stays there.
- Text: `seen` (0.03–0.38) "Aydınlıkta daha kolay seçilebiliyordu: bütün
  derisi sökülüp alınmıştı." — the fragmentary high view. `peeled`
  (0.42–1.02) "Sırtındaki kaslar açıktaydı…" / L2 @ u 0.69 "Hiçbir yerinde
  deri kalmamıştı… titizlikle sökülmüştü." — the camera has turned away to
  the window; the words carry what the image refuses.

**sunrise** · 2.1
- Action: u 0.08 the streetlamp clicks off: the band vanishes, the room
  drops into deep blue. u 0.3–0.55 the blue lightens. u 0.55–1 the first sun,
  low through the east window, lays a warm yellow shaft across the sewing
  table, her hands and the far wall. She never stops.
- Camera: u 0–0.5 (3.4, 1.6, −1.0) → (5.0, 1.4, −2.4), 42°, static on the
  window and table from slightly behind her; u 0.5–1 slow tilt down to the
  tabletop as the sun reaches it.
- Light: band → 0 over u 0.08–0.1; ambient blue 0.04 → 0.25; sun (#d9b75a,
  elevation ~8°) ramps up u 0.55 → 1.
- Text: `day` (0.04–0.96) L1 "Sokak lambası söndü. Yavaş yavaş gün doğuyor,
  oda aydınlanıyordu." — the lamp goes out, the blue. L2 @ u 0.55 "Güneşin
  ilk ışınları annenin dikiş masasına düştü." — the shaft of sun lands on
  the table.

**pieces** · 2.8
- Action: on the table, in the sun, flat pale pieces of irregular shape —
  some long, one large and roughly rectangular. **They read as pieces of
  beige-pink cloth** (matte, no hair, no faces, no anatomy). u 0.6 she trims
  a ragged edge with the scissors (one short snip); u 0.64–1 her thin hands
  take one piece and feed it under the presser foot.
- Camera: over her right shoulder (her right is +z) onto the table (4.2, 1.5,
  −2.0) → (4.75, 0.78, −2.6), 32°. The spool with skin-coloured thread is in
  frame (subtle discovery).
- Text: `not-cloth` (0.03–0.6) L1 "Masada parça parça duranlar kumaş
  değildi." — close on the pale pieces. L2 @ u 0.29 "Titizlikle yüzülmüş
  cansız bedenin derisiydi." — the line names them; the image does not
  change. `works` (0.64–1.0) "Anne derileri alıp dikiş makinesinde işliyor,
  kendi kendine sayıklıyordu." — her hands take a piece to the needle.

**mutter** · 2.8
- Action: she sews and talks to the piece, leaning close to the machine,
  head inclined tenderly, nodding with each phrase; small giggles.
- Camera: from behind her left shoulder (2.6, 1.35, −3.2) → (4.6, 1.3, −2.1),
  36°: her head, hair and shoulder in hard silhouette against the bright
  window (the line from the lens through her head meets the window at
  z ≈ −1.9); her face turned away, no facial detail.
- Text (ANNE): `good-boy` (0.02–0.6) L1 "— Eveeet… uslu bir çocuksun sen." —
  a nod toward the cloth. L2 @ u 0.31 "Artık bir işe yarayacaksın… hıhıhı…" —
  a giggle, the shoulders shaking. `remake` (0.64–0.99) "— Seni baştan
  yaratıyorum… Bana teşekkür etmelisin…" — she tilts her head over the piece
  under the needle.

**stitch** · 2.9
- Action: she joins the pieces: a long seam already runs across the large
  piece, a rounded part folded under it (never shown open). She turns a long
  piece and aligns it to the large piece's edge, then another below.
- Camera: top-down over the table (4.7, 2.3, −2.4) → (4.7, 0.76, −2.4), 30°:
  pale flat pieces laid out like a sewing pattern; the outline of a figure
  emerges only from the arrangement — no anatomy, just a pattern in the sun.
- Text: `joins` (0.03–0.6) L1 "Deriyi tek parça hâlinde sökemediği için yavaş
  yavaş birleştiriyordu." — the seams, the separate shapes. L2 @ u 0.3 "Kafa
  derisini tek parça çıkarmıştı; ama kollar, gövde ve bacaklar ayrı ayrıydı."
  — the camera holds on the separate long pieces. `order` (0.64–1.02) "Önce
  başı gövdeye dikmişti. Şimdi kolları ve bacakları yerleştirmeye
  uğraşıyordu…" — the long piece meets the large one's shoulder; the pattern
  becomes a figure.

### 06 — SABAH (screens 51.4–61.0)

**wakeup** · 1.9 · INT. boys' room, morning
- Action: u 0–0.42 he wakes in his bed, stretches, sits up. u 0.44–1 he looks
  across: the other bed is empty, the duvet pushed to the foot exactly as at
  night; headphones on the pillow.
- Camera: **the same set-up as the night `wake`** (2.0, 4.6, −1.7) → (3.4,
  3.5, −3.6), 45° — a deliberate echo; u 0.44–1 pan right to the brother's bed
  (3.3, 3.5, −0.9).
- Light: flat pale morning, blind half raised, no bars.
- Text: `woke` (0.04–0.96) L1 "Çocuk uyandı. Oda sıradan bir sabah ışığıyla
  doluydu." — he wakes in ordinary light. L2 @ u 0.445 "Kardeşi yatağında
  yoktu; muhtemelen… kahve yapıyordu." — the pan to the empty bed.

**brother** · 2.2
- Action: he sits on the edge of his bed, facing the empty one; looks at the
  headphones, then at the wall the bed faces. u 0.55–1 his shoulders sink.
- Camera: u 0–0.55 slow move toward the brother's bed (1.6, 4.1, −2.2) →
  (3.6, 3.5, −0.9), 40°: headphones on the pillow, the wall. u 0.55 CUT to a
  frontal medium of him (3.0, 3.9, −2.0) → (3.0, 3.6, −3.4), 38°.
- Text: `lately` (0.04–0.96) L1 "Aklına, kardeşinin son zamanlarda içine
  kapandığı geldi: kulaklıklarını takıp duvara dönüyordu." — the empty bed,
  the headphones, the wall. L2 @ u 0.55 "Artık eskisi gibi yakın değillerdi.
  Bedenini bir hüzün kapladı." — his sinking shoulders.

**games** · 1.9
- Action: he gets up, goes to the TV cabinet, picks up the dusty controller,
  wipes the dust off with his thumb (u 0.35–0.6), a small smile; u 0.65–1 puts
  it down beside the other and turns to the door with sudden purpose.
- Camera: (1.9, 4.1, −2.5) → (1.1, 3.55, −3.1), 38°: the two controllers in
  the foreground (visible discovery), him entering the frame.
- Text: `make-up` (0.04–0.96) L1 "Hemen yanına gidip arasını düzeltmek…" —
  he crosses to the cabinet and lifts the dusty controller. L2 @ u 0.5
  "Tekrar eskisi gibi oyunlar oynayabileceklerdi." — the thumb on the dust,
  the smile, the turn.

**rush** · 1.3 · INT. stairs, morning
- Action: he runs out along the hallway (past the toilet without stopping)
  and down the stairs two at a time.
- Camera: from the stair foot looking up (−0.6, 1.2, −0.4) → (−1.3, 2.4, 3.5),
  45°: he comes down toward us, fast; morning light from the landing window.
- Text: `ran` (0.05–0.96) "Elini yüzünü yıkamadan apar topar merdivenlere
  koştu; basamakları ikişer ikişer indi." — the run down, two steps at a time.

**pass** · 2.3 · INT. lower hallway, morning
- Action: u 0–0.4 he runs past the sewing room door — **wide open** — without
  turning his head; u 0.4–1 on toward the kitchen at the end of the hall.
- Camera: following behind him, looking −z, from (0.0, 1.5, 1.4) at u 0 to
  (0.0, 1.5, −3.8) at u 1, target (0, 1.2, −9.0), 45°. The open door slides
  past the right edge (u 0.25–0.45), is level with the camera at u ≈ 0.49 and
  ends behind-right of it. **Through it (hidden discovery, only if the reader
  turns, u 0.25–0.8):** the sewing room in over-exposed yellow sun — the table,
  the machine, pale scraps; flies turning in the light; the long dark streaks
  low on the north wall (a hand's breadth above the floor up to ~0.9 m);
  beneath them, along the wall, the fabric heap, now a long mound, bigger
  than at night; smeared half-wiped arcs on the floor. Nothing of the body.
- Sound: running feet; a buzz of flies rising from the right as the camera
  passes the door (u 0.3–0.55), fading behind.
- Text: `passed` (0.03–0.42) "Annesinin odasının önünden hızla geçti. Kapı
  açıktı." — he runs by the open door. `could` (0.47–1.0) "İçeri baksa
  vahşeti görebilirdi." — **exactly when the door is beside and then behind
  the camera**: the reader can turn and look in; the boy does not.

### 07 — MUTFAK (screens 61.0–68.6)

**kitchen** · 1.9 · INT. kitchen, morning
- Action: he stops in the doorway (0, 0, −7.3). The mother on her knees in
  the middle of the room, back to him, wiping the tiles in slow circles with
  a large pale rag; the bucket beside her; her grey hair down her back. The
  stove: cold kettle, empty cezve. The dry mop in the corner (subtle
  discovery). u 0.5–0.9 he looks left (stove) and right (table) for his brother.
- Camera: behind him in the hallway (0.3, 1.45, −6.2) → (−0.5, 0.5, −9.6), 42°.
- Light: cold, even daylight; everything clean and too bright.
- Text: `back` (0.04–0.96) L1 "Mutfağa vardığında annesi, sırtı dönük, yeri
  siliyordu." — her back, kneeling, wiping. L2 @ u 0.5 "Ocak soğuktu; kimse
  kahve yapmamıştı. Kardeşini göremeyince sordu:" — his head turning to the
  cold stove, the empty chairs.

**ask** · 1.3
- Action: he asks. She keeps wiping; does not turn.
- Camera: reverse from the stove side (−2.0, 1.2, −10.2) → (0, 1.3, −7.4),
  40°: the boy in the doorway facing us; in the foreground the mother low on
  her knees, her face hidden under the curtain of hair.
- Text: `where` (0.06–0.94, ÇOCUK) "— Anne, Osman’ı gördün mü?" — his face;
  her rag still circling.

**answer** · 2.4 · QUIET from u 0.47
- Action: u 0–0.4 the rag stops. She straightens on her knees and turns her
  head over her right shoulder (+x) toward him — **away from the camera**: we
  see hair and the edge of a cheek, never the face. u 0.47–1 she answers; her
  head nods gently with the words. The boy's face drains.
- Camera: low at her left side (−1.6, 0.8, −9.9) → (0, 1.35, −7.4), 40°: her
  head and shoulder large in the foreground, the boy in the doorway beyond;
  u 0.47–1 slow push past her toward the boy's face.
- Text: `how` (0.03–0.45) "Annesi de soğuk, iniltili, cılız bir sesle, neşe
  ve hüzünle karşılık verdi:" — she stops and half turns. `rag` (centre,
  0.49–1.15, into `end`) "— Kullanmıyorsunuz diye bez yaptım ben onu oğlum."
  — the boy's face.

**end** · 2.0
- Action: she bends again and resumes. u 0.05–0.3 she dips the rag in the
  bucket (faintly pink water), wrings it, spreads it on the tiles: large,
  pale, its edges carefully hemmed, a long darker seam across it. She wipes.
  Nothing more.
- Camera: low at her left side (−1.2, 0.55, −9.3) → (−0.45, 0.02, −9.75),
  32°: her hands and the rag on the checker tiles; the image dims toward the
  title.
- Text: `end` (centre/final, 0.32–5) **TAKINTI** — sub "Bu evde hiçbir şey
  çöpe gitmez." (the opening line, now in the present tense).

---

## 4. Choice

**`door` — YARI AÇIK KAPI** · `shadow` u 0.92 · prompt "Ne yapacaksın?"

| Option | Reply | Flag | Image | Text |
|---|---|---|---|---|
| İçeri gir. | "Kapıyı itti. Menteşeler inledi." | `door:in` (the default: text uses `none: ['door:call']`) | `enter`: door pushed to ~95°, he stands two steps inside at (1.5, 0, −1.2); her back, the heap; `shout`: he is inside the room, beyond her shoulder; `trance`: the push ends on the pale fabric on the table; `corner`: the camera starts from his spot inside and looks back at it. | `enter-in`, `trance-in`, `corner-in` |
| Kapıdan seslen. | "Eşikte durdu, elini kapının kenarına koydu." | `door:call` | he stays on the threshold, the door half-open; the camera stays in the hallway at the gap: only the wall shadow and its elbow; `shout`: only his face and a shoulder in the gap; `trance` pushes on the shadow's hands; `corner` starts just inside the closed door. | `enter-call`, `trance-call`, `corner-call` |

He shouts the same words either way. The `[menteşeler inler]` caption plays
only without `door:call`. **Scene code must branch on `door:call`** (absent =
IN), so a reading without a choice shows the source's version in both text and
image.

---

## 5. Discoveries

| id | title | seg (from–to) | pos (m) | vis | why |
|---|---|---|---|---|---|
| `empty-bed` | Öbür yatak | wake 0–1 | (3.3, 3.45, −0.9) | hidden | ~85° right of the night shot: the other bed is already empty, a tangled headphone cable on the pillow. Plants the last line without naming anyone. |
| `rag-towel` | Havlu askısı | toilet 0–1.5 (until the cut in `voice`) | (−2.55, 4.1, −2.6) | subtle | No towel, a pajama turned into a rag: the obsession reaches every room. |
| `labels` | Bez dolabı | landing 0.4–1 | (0.7, 4.1, 4.05) | visible | The sewn-on tags list what each rag used to be — "Kırmızı kazak — kimse giymiyordu." Her logic in her own handwriting. |
| `dress-form` | Köşedeki biri | enter 0–3.2 (enter, shout, trance) | (1.3, 1.0, −3.95) | subtle | A headless figure in the dark corner: a false scare that keeps the real corner unread. Visible only from inside (IN); the wall hides it from the hallway (CALL). |
| `thread` | Makara | pieces 0–1.95 (pieces, mutter) | (4.7, 1.05, −2.05) | subtle | Skin-coloured thread; nothing in the house is that colour. |
| `controllers` | İki kol | brother 0.5–1.86 (to the end of `games`) | (1.1, 3.53, −3.1) | visible | One controller gathering dust — the brothers stopped "using" each other. |
| `open-door` | Açık kapı | pass 0.25–0.8 | (2.8, 0.8, −3.0) | hidden | What the boy does not see as he runs past: sun, flies, the streaks, the grown heap. Lands with "İçeri baksa vahşeti görebilirdi." |
| `mop` | Paspas | kitchen 0–1.68 (kitchen, ask) | (2.4, 0.8, −9.2) | subtle | The mop is dry: today she wipes with something else. "Kullanmamıştı." |
| `bucket` | Kova | answer 0.55–1.83 (to the end) | (−1.1, 0.2, −9.1) | subtle | Only after the last line: pinkish water, a carefully hemmed rag. |

---

## 6. Sound

- **Ch 1–2 (night, upstairs):** room tone, the streetlamp's buzz through the
  window, the house creaking; from below, the treadle's two-beat creak and
  the needle's rattle, muffled through floor and walls, growing toward the
  stairs. Whispers and moans are mixed *inside* the machine rhythm.
- **Ch 2 `words`:** the mother's voice close-miked, breathy, giggles soft and
  wet; the machine never stops under it.
- **Ch 3:** the machine in the room, dry and loud; the boy's shout cracks and
  is swallowed by the next creak; his stamp. Door close: the sound drops to
  muffled; treads creak upward and away.
- **Ch 4:** treadle slams (low, heavy, with a floor thump), a wet drag on each
  slide (quiet, short), the fall (soft and heavy), a beat of silence with the
  machine stopped, then the machine again.
- **Ch 5:** lamp click and its buzz cutting out; pre-dawn hush; first birds;
  one scissors snip; the needle muffled as if through something thicker than
  cloth.
- **Ch 6:** ordinary morning outside (a car, birds); running bare feet on
  wood; flies at the open door (spatialised from the right).
- **Ch 7:** a wet rag on tiles, the fridge hum; after the last line, the rag
  dipped and wrung into the bucket.
- One-shots are listed in `CAPTIONS` (40 cues).

---

## 7. Story-select card art

The lower hallway at night: the half-open door, a hard slant of cold
streetlight inside the room, and on the wall the long, thin shadow of a woman
bent over a sewing machine. No body, no face. Palette blue-black and cold
white-green.

---

## 8. Restraint rules (for the builder)

1. The body is never lit frontally and never framed close: dark mass (ch 3–4),
   feet at a distance (`feet`), silhouette against the bright wall patch
   (`thrice`), lace-broken high shot (`flayed`, u 0–0.4 only). Nothing in
   ch 6–7.
2. Blood is near-black streaks and pools, never saturated red, never wet
   highlights except a faint sheen on the floor pools at night.
3. The "skin" is pale, flat, matte cloth-like pieces with no hair, faces or
   anatomy; its horror comes only from the words and from the pattern they
   make on the table.
4. The mother's face is never shown.
5. The brother is never seen alive; the empty bed, the headphones and the
   dusty controller are him.
