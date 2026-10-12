# PARALEL-LEŞ — screenplay and scene contract

Code: `src/stories/paralel/timeline.ts` (segments, chapters) and
`src/stories/paralel/text.ts` (every word, the choice, discoveries, captions).
Total **89.5 screens**, 49 segments, 11 chapters, 1 choice, 10 discoveries.
`SCREEN_VH = 80`. Rail on the **left**: compose subjects centre-right.

Times below: `u` = local progress 0–1 inside the segment; `@` = absolute
screen where the segment starts. Text ids are given with their `from–to`
(fractions of the segment) and, for two-line items, the `u` where the
second line arrives.

---

## 1. Logline, tone, palette, light

**Logline.** A man sits on a swing hung from an old tree at the edge of a
cliff, at dusk, and remembers a childhood spent walking the nearly
transparent line between him and death — roofs, glass, a bridge, stones,
the sea, a bicycle, a hollow slope, a socket. In every memory there is an
instant where the picture splits and another, translucent he goes on into
the fall. Those are the universes where it happened. Then the friends he
took along, the archive where every "almost" is kept on a shelf — and the
swing, now.

**Source.** The author's prose poem is the narration, nearly verbatim and in
order. Additions (one sensory line per vignette, Emre's line, the mother's
line, "Bu evrende, her seferinde", "Ateş yok…", "Bu evrende büyüdük…") only
make the moments play; nothing in the plot changes.

**Tone.** Wind, height, vertigo; calm first person. Childhood is told in the
habitual past ("-ırdım"), the swing in the present. Never gory: nobody is
ever seen hitting anything. Falls end in light, foam, dust, darkness or
distance. The dread is in the *almost*, the silence and the scale.

**The motif: the split (the other self).** At the critical instant of each
vignette the figure divides. The real one (solid, full colour) goes on and
survives; a translucent copy — the "other me", **the ghost** — continues
into the fall and fades out before any impact. Same rig, same clothes, same
pose at the moment of division. See §2.0 for the exact look and §3 for every
split's timing.

**Palette.**
- Ghost: unlit pale cyan-white #CFEFFF, opacity 0.32, additive, brighter
  fresnel rim #FFFFFF; never casts shadows.
- ÇİZGİ void: navy-black #070A14, the line cyan-white #BFEFFF; the can
  silver-blue #9FB7D6 with white wings.
- ÇATILAR: golden hour, sun #F2A65A, concrete #9A948C, gravel #8C857B,
  city haze #D9B48A. Blue hour (friends): sky #3A4A78, city lights #FFD08A.
- CAM: glass blue-green #9CC9C2 reflections, steel rails #5B6268, warm rooms
  below #FFD9A0.
- KÖPRÜ: overcast #8E959A, wet steel #3E4A45, river brown-green #5C5A3C,
  foam #F2F2EC.
- TAŞLAR: pale limestone #D8CFBF, dry grass #C9B46A, ravine shadow #2E3F66.
- DALGA: storm grey #6E7782, sea #2F4A47, flag red #C8322B / yellow #E8C23A,
  underwater #0B2A22 with a paler patch #3E6B5C.
- TOPRAK: ochre dust #C49A5C, scree grey-brown #7D6E5E, the hollow black.
- KIVILCIM: night blue #1A2238, nightlight #5C8BFF, door light #FFC27A,
  spark #DCEBFF; flashlight warm white.
- The five absences (`glassBroke`…`powerKept`): the same sets, desaturated
  70 %, cooled to grey-blue, fog up.
- ODA: plain blue-black #05070D with glowing ghosts; archive brown-black
  #140E0A, lamp pools amber #E8B46A, a faint red at the far vanishing point
  #5A1A14.
- ŞU AN: dusk sky violet #5B4A7A → orange #F08A4B at the horizon, last sun
  on the far ridge #FFB46A, valley blue shadow #1E2A44; the man's jacket
  olive #4B5A3A.

**Light per chapter.**
1. ÇİZGİ — `open`: dusk over the valley. Void: one soft top-front key that
   follows the boy; the line glows only within ~3 m of his feet.
2. ÇATILAR — golden hour, sun from −x at 8°, long shadows over gravel.
3. CAM — late afternoon, sun 25°; light shafts into the atrium.
4. KÖPRÜ — flat overcast, wet speculars, cold.
5. TAŞLAR — noon, hard top light, short shadows; ravine in deep shadow.
6. DALGA — storm, flat grey; underwater diffuse green from everywhere.
7. TOPRAK — late afternoon, dusty ochre from +x.
8. KIVILCIM — night; nightlight + door sliver; after the spark, darkness and
   one flashlight.
9. BAZI EVRENLERDE — rooftop at blue hour; the present-day path at dusk; the
   absences grey.
10. ODA — no sun: ghost glow on the plain, amber lamp pools in the archive.
11. ŞU AN — dusk; the sun touches the far ridge during `grows` and leaves it
    during `end`.

---

## 2. World layout (metres; x right, y up, z toward the default camera)

Every set sits far from the others on x; a cut is a camera jump. **Show only
the active set** (sets have deep drops and fog; toggle visibility per
segment). People face −z unless stated.

### 2.0 The ghost (used in every set)

- A second instance of the same figure (same look, clothes, hair, age),
  material swapped for the ghost material (see palette). No shadows, no
  depth write (or depth write off + render after opaque).
- **Division:** at the split frame the ghost is exactly coincident with the
  real figure. Over the next ~0.03 of the segment it slides off along its own
  path (the fall); at the moment of division a thin white rim flash runs over
  both bodies (0.03 of the segment) and a thin glass ring sounds.
- **Motion trail:** while falling, 2–3 previous positions at 0.5/0.25/0.12 of
  the ghost's opacity.
- **Fade:** opacity → 0 over the distance given in each split (always
  before the bottom, the water, the floor, the rock). The ghost never lands.
- Other ghosts: the inverted twin under the line (`line`, `can`), the trio
  (`fell`), the eight on the plinths (`bodies`), the falling men and the
  ghost swing (`grows`).

### A — Valley swing cliff (opening, present day) · x 1000

- **Ledge:** rock, top y = 0 for z > 0; cliff edge along z = 0 from x 985 to
  1015; sheer face down to the **valley floor y = −400** (forest, a river
  thread along x at z = −600). **Opposite ridge** at z = −1600, crest
  y = +150, catches the last sun.
- **Rock outcrop** behind the swing: a rock face at z = +3.2 (the block
  extends toward +z), 3 m tall, x 997–1004.
- **Old tree:** gnarled trunk (radius 0.35) rooted at (1001.5, 0, 1.4),
  straight up to y 2.5, then bending toward −z so that at y 4.6 it reaches
  (1001.4, 4.6, −0.4); from there one thick branch runs horizontally along
  −x at y 4.6, z −0.4, out to x 998.8. Sparse leaves that thrash in wind.
  The trunk stays ≥ 0.8 m from the swing plane (x 999.7–1000.3).
- **Swing:** two ropes from (999.7, 4.55, −0.4) and (1000.3, 4.55, −0.4),
  length 3.7 m, plank seat 0.6 × 0.2 × 0.04. Pivot line (1000, 4.55, −0.4);
  swing plane y–z. At rest the seat is at (1000, 0.85, −0.4) — already past
  the edge: feet over the void even at rest. At −40° (back) the seat is at
  z ≈ +2.0, y ≈ 1.7 (his back ~1 m from the rock face); at +40° (forward)
  z ≈ −2.8, y ≈ 1.7. **Maximum amplitude ±52°** (back: seat z ≈ 2.5, his
  back ~0.4 m from the rock; forward: z ≈ −3.3, y ≈ 2.3). Never more, or the
  man goes through the rock.
- **Path** (`today`): switchbacks from (1040, −30, 60) up to (1006, 0, 6)
  across a grassy slope; from the path the tree is a silhouette. **Hide the
  swing (ropes and seat) during `today`.**
- **Tally marks** carved on the trunk's +z face at (1001.5, 1.4, 1.75).

### B — The line (void) · x −300

- Endless navy-black space, faint deep-blue fog below, a few dust motes.
- **The line:** a glass filament 0.03 m thick at y = 0, x = −300, from
  z = +30 to z = −400; refractive, nearly invisible; a soft cyan glow travels
  under the boy's feet (radius ~3 m).
- **Inverted twin:** the 9-year-old's ghost hangs upside down under the line,
  soles touching the line from below, mirroring every step.
- **Banner** (discovery): (−282, 6, −60), 18 × 5 m, turned ~35° toward the
  line, blue with two white wings and fine print. It hangs to the right of
  the boy's walking direction and stays out of frame in the `can` shots: the
  reader finds it by turning.
- **Can:** cylinder r 0.033, h 0.16, brushed silver-blue, a pair of white
  wings and the band word **KANATLANDIRIR** (world text). Generic, no brand.

### C — Rooftops · x 0

- **Roof A:** top y = 0, x −10…10, z −10…10; warm-grey gravel; parapet
  0.45 m tall, 0.4 m wide on all edges. Building down to the **street at
  y = −60** (20 floors of windows).
- **Roof B:** top y = −1.0, x 12.4…32, z −10…10; gravel; its west edge only a
  0.15 m curb (the landing). Building down to y = −60.
- **The gap:** x 10…12.4 — an alley 2.4 m wide, 60 m deep. At its south end
  (z = −10) it opens onto the **avenue** (along x, z −30…−10): six lanes of
  small moving cars, a bus, people as dots on the pavements.
- **Props on A:** water tank (cylinder r 1.2, h 2.2 on 1.5 m legs) at
  (−5, 0, −4); antenna mast 7 m at (5, 0, 6); stair hut 2.6 × 2.6 × 2.6 at
  (−7, 0, 7) with a steel door facing +x at (−5.7, 1.0, 7); two satellite
  dishes at (2, 0, 9).
- **Skyline:** towers 30–90 m tall at 80–400 m; low sun to −x.
- **Tally marks** (discovery) on A's east parapet top at (10, 0.47, −3.7).

### D — Glass atrium roof · x 100

- **Glass roof** at y = 0: x 94…106, z −9…9, panes 1.5 × 1.5 m in steel
  T-rails 0.08 m wide; a concrete rim 1.5 m wide around it. Pane centres on
  x: 94.75, 96.25, 97.75, **99.25** (ghost's column), **100.75** (boy's
  column), 102.25, 103.75, 105.25; on z: −8.25, −6.75 … 6.75, 8.25 (rails at
  z = −9 + 1.5k). He always stands on a pane centre, never on a rail.
- **Atrium:** the void under the roof to a mosaic floor at y = −24;
  galleries (1.8 m deep, railings) at y = −4, −8, −12, −16, −20 on all four
  sides; rooms open onto them with lit windows. Seen inside: a woman folding
  laundry (room at (93.2, −8, −3)), an old man asleep in an armchair before a
  flickering TV (room at (107, −12, 4)), a child at a table (−16 level), an
  empty office with a desk lamp, a couple eating. Nobody looks up.
- **Sign** (discovery) on a post at the rim (100, 0.6, 10.4):
  "CAM ÇATI · ÜZERİNE BASMAYINIZ"; small dusty footprints on the first pane.
- **Breaking pane:** (99.25, 0, −2.25).

### E — Steel bridge over a river in flood · x 200

- **River** at y = 0 flowing toward −z, banks (concrete embankments) at
  x = 185 and x = 215; brown-green, fast (texture scroll ~3 m/s), standing
  waves, white foam.
- **Bridge:** spans x 182 → 218; deck top y = 11; four steel I-girders along
  x at z = −3, −1, +1, +3 (1.0 m deep, **bottom flange y = 9.8**, 0.3 wide),
  cross-beams every 3 m; rivet rows; drips.
- **West abutment** (concrete) x 180–183, top y = 11, ledge at y = 9 where
  the boy starts.
- **Truck:** a box 8 × 3 × 2.5 crossing the deck in `slip`.
- **Flood mark** (discovery) painted on the abutment's river-facing face
  (x = 183) at (183.05, 10.6, 2.5): red line + "TAŞKIN SEVİYESİ" (above the
  flange the boy hangs from, y 9.8).

### F — Hilltop cliff · x 300

- Plateau y = 0 for z > −2: limestone, dry grass tufts, a thorn bush.
  **Edge along z = −2**, vertical face to the **ravine floor y = −100**
  (boulders, a dry creek); the far side at z = −60 rises again.
- Boy sits at (300, 0, −1.6), legs over the edge; a small pile of fist-size
  stones at (300.5, 0, −1.2). Black digital watch on his left wrist
  (world text **00:04.6** on its face in `stone`).

### G — Storm beach and underwater · x 400

- Sand y = 0 for z 0…30 (wet and dark for z 0…4); sea for z < 0; swells 3 m
  rolling toward +z every ~6 s, breaking at z ≈ −8; foam sheets; blowing
  sand.
- **Flagpole** 5 m at (408, 0, 10), red-over-yellow flag snapping toward +x.
- **Sign** board 1.4 × 0.9 on two posts at (409.5, 1.7, 4.5), facing +z
  (right of centre and readable in the `flag` shot):
  **DİKKAT · RİP AKINTISI · YÜZMEK YASAKTIR** (world text) and a pencilled
  note under it (discovery).
- Towel on the sand at (401, 0.02, 6).
- **Underwater pocket** around (400, −4, −20): dark green fog volume,
  suspended sand, bubble streams; the surface (y = 0) seen from below as a
  moving silver sheet; one slightly paler patch overhead that drifts.

### H — Bike jump over a cleft · x 500

- Dirt track from (500, 6, 30) down to the **lip** at (500, 0, 0) (the last
  2 m rise 0.5 m); the **cleft** z −6…0, 30 m deep, dark; the **landing
  bank** begins at z = −6, y = −3, sloping down toward −z at 25°; dry scrub,
  a few pines; sun from +x.
- Tire marks (discovery) at the lip (500, 0.05, 0.6).
- Black BMX (wheels r 0.25, frame tubes).

### I — Hollow mountain slope · x 600

- A 30° scree slope falling toward −z; a goat path traversing along x at
  z = 0, y = 0.
- **The crust:** between x = 598 and 606 the path is a 0.3 m overhanging
  crust over a **hollow** (an eroded void ~3 m deep, 2 m into the slope,
  black). Its lip crumbles.
- **Rock outcrop** at x ≥ 606.5 (solid).
- **Collapse patch:** x 602.8–604.2.
- Below the path, scree down to a gully 80 m lower.

### J — Bedroom at night · x 700

- Room x 698…702, z −2…2, y 0…2.6; pale blue walls.
- **Wall socket** (white, two round holes) on the back wall at
  (700.4, 0.3, −1.99); after `spark` a scorch mark and a thin smoke wisp.
- Bed along the left wall (x 698–699, z −1.8…0.2); desk with an unlit lamp
  at (701.2, 0, −1.5); a poster; **child's drawing** (discovery) taped on the
  left wall at (698.02, 1.3, −0.6).
- Nightlight (blue) at (701.8, 0.3, −1.99).
- Door in the right wall at x = 702, z 0.4…1.3, ajar 20°: warm hallway light,
  TV murmur. The mother appears only as a silhouette in it.
- Hairpin: black wire bobby pin opened into a V (0.06 m).

### K — The plain and the archive · x 900

- **Plain:** endless dark floor y = 0 (blue-black, faintly reflective), low
  fog.
- **Plinths:** eight stone blocks 0.6 × 0.6. Plinth k (k = 0…7) sits at
  angle θ = −60° + k · 17.14°, position (900 + 9 sin θ, 0, −8 − 9 cos θ): an
  arc from (892.2, −12.5) through z ≈ −17 to (907.8, −12.5), bowing away from
  the camera.
  Left → right, with the ghost on top (age · place · plinth height):
  9 · roofs · 3.0 m; 9 · glass · 1.6 m; 12 · bridge · 1.0 m;
  12 · stones · 2.4 m; 12 · sea · 0 (stands on the floor, hair wet);
  15 · bike · 1.2 m; 15 · slope · 0.8 m; 9 · socket · 0 (pyjamas).
- **Archive:** from z = −14 on. Main aisle centred on x = 900 running to
  z = −300 (fog); shelving units 4.2 m tall, 5 tiers, 1.2 m deep, aisle
  2.4 m; parallel aisles every 4 m from x = 860 to 940. On every tier small
  glass cases (0.35 × 0.25 × 0.25) with still dioramas — a boy on broken
  glass, a boy under a curling resin wave, a boy at a socket, a boy on a
  parapet, a bike nose-down, a hand on a beam — each with a brass label
  plate ("9 · CAM ÇATI", "12 · DENİZ", "9 · PRİZ"…). Floor lamps every 12 m;
  dust in the cones. Old parquet floor.
- **Cross-wall** of shelving closing the aisle at z = −36. **Bare-bulb floor
  lamp** at (900, 0.3, −28.5). The boy (devil) stands at (900, 0, −31).
- **Labels insert** (discovery) at (898.8, 1.5, −20).
- **Empty slot:** top tier at (902.0, 3.9, −48.0) — the only dark case in
  the grid; in `diorama` a new case lights there: a tiny cliff, a tiny old
  tree, a tiny swing with an empty seat, its rope swinging; label plate
  **ŞU AN · SALINCAK** (world text). The case's glass front faces −x (the
  aisle side); the miniature inside is oriented so that the view through the
  front matches the opening frame of `swing`.

### Cast

| Figure | Build / height factor | Look |
| --- | --- | --- |
| **BOY 9** (the narrator at 9) | m, 0.78 | thin; short messy dark-brown hair; red windbreaker #C0392B over a grey T-shirt; blue jeans; **white sneakers with a red side stripe** (the motif shoe). In `socket`/`spark`/`normal`: grey-blue pyjamas, barefoot. |
| **BOY 12** | m, 0.88 | buzz-cut dark hair; olive-green T-shirt #6B7A3A; grey knee shorts; the white-red sneakers; black digital watch, left wrist. Sea: navy swim shorts, bare torso. |
| **BOY 15** | m, 0.97 | dark hair falling over the forehead; black hoodie; grey cargo trousers; worn white-red sneakers. |
| **THE MAN** (now) | m, 1.0, about 34 | short dark hair, light stubble; olive field jacket #4B5A3A; grey T-shirt; dark jeans; white sneakers with a red stripe (adult version). Hands in his jacket pockets when walking (the boy's gesture on the line). |
| **EMRE** (12) | m, 0.90 | curly black hair; yellow T-shirt #E1B12C; jeans. |
| **BARIŞ** (11) | m, 0.82 | short light-brown hair; round glasses; blue-white striped shirt; shorts. |
| **ANNE** | f, 1.0 | only a silhouette in the doorway with a flashlight; long dark hair tied; a long cardigan. |
| **Ghosts** | as their owners | ghost material (§2.0). |

---

## 3. Segment table

### 01 — ÇİZGİ (6.6 screens) · `open` → `can`

**open** · 1.0 · @0.0 · set A (valley)
- Nobody in frame. We look **straight down** from the swing's forward
  point into the valley 400 m below: forest, the river thread, the cliff face
  falling away at the top of the frame. The camera sways slowly along z like
  a pendulum (time-driven, period ~5.5 s, ±1.0 m), never revealing ropes,
  seat or tree.
- Camera: (1000, 1.3, −1.6) → (1000, −400, −1.8), vfov 50.
- Light: dusk; valley in blue shadow, warm haze. Sound: high wind; at 0.6 a
  faint rope creak at each end of the sway.
- `carcasses` (center, −1 → 0.86): "Paralel evrenlerde çok leşim vardır." —
  the void below, swaying; we do not yet know what holds us.

**line** · 2.8 · @1.0 · set B (void)
- u 0–1: BOY 9 walks the line toward −z, z 0 → −5, slow steps (one per
  ~0.06). u 0–0.55 arms slightly out at shoulder height. **u 0.62** he lowers
  them and pushes his hands into his jacket pockets; keeps walking. Under the
  line his inverted ghost twin mirrors every step from u 0.
- Camera: u 0–0.5 side tracking (−296, 0.4, b.z + 2) → his chest, vfov 40;
  u 0.5–1 slow crane down to line level (−297.5, −0.6, b.z + 3) so he and
  the upside-down twin share the frame, the bright thread between them.
- Sound: a thin glass ring with each step; a deep drone.
- `transparent` (0.04–0.54; line 2 at 0.25): the boy on a line you can hardly
  see; line 2 "O çizginin üzerinde yürümeyi seviyordum." as the crane shows
  how thin it is and who walks beneath it.
- `courage` (0.57–1.04; line 2 at 0.77): "Dengemi değil…" as his arms drop;
  "Kollarımı açmazdım; ellerim cebimde yürürdüm." — hands in pockets.

**can** · 2.8 · @3.8 · set B
- u 0.04 he stops, takes the can from his right pocket; 0.12 opens it (hiss);
  0.16–0.4 drinks, head back; 0.42–0.62 holds it out toward the camera, label
  facing us (wings, **KANATLANDIRIR**); the banner hangs far off to the
  right, out of frame (a subtle discovery). 0.66 dents it in his fist;
  **0.72 lets it drop** off the side of the line; 0.72–1.0 the can tumbles away into the dark past the inverted twin
  (whose mirrored hand closes on nothing), shrinking, never landing, no
  sound. The boy stays on the line looking down.
- Camera: u 0–0.42 medium close (−298.6, 0.6, b.z + 1.6) → hands/can, vfov
  35; u 0.42–0.64 insert 0.5 m from the can, label legible; u 0.66–1.0 from
  beside the line, tilt down with the falling can (his sneakers at the top of
  the frame).
- Light: a cold rim on the can; a white glint on the wings.
- `sponsor` (0.06–0.64; line 2 at 0.28): line 1 while he drinks; line 2
  "…ben de gerçekten uçabileceğime inanıyordum." as he raises the can like a
  toast to the camera.
- `label` (world, 0.08–0.64): KANATLANDIRIR on the can.
- `only-the-can` (0.68–1.10; line 2 at 0.88): "Kutuyu bitirir, boşluğa
  bırakırdım." on the drop; "Düşen sadece kutuydu." as the can disappears
  below and the boy is still standing.

### 02 — ÇATILAR (8.0) · `roofs` → `jump` · BOY 9 · golden hour

**roofs** · 1.8 · @6.6 · set C
- u 0–0.2 the stair-hut door swings open, BOY 9 steps out; 0.2–1 walks over
  the open gravel to the east parapet ((−5, 0, 6) → (8.6, 0, −3)), the water
  tank and the antenna mast behind him; wind in his hair.
- Camera: u 0–0.5 wide, high (−14, 6, 16) → (0, 0.5, 0), vfov 45, slow push;
  u 0.5–1 cut low beside his feet (b.x + 0.6, 0.15, b.z + 0.8) → sneakers,
  vfov 40, tracking; gravel kicks with each step.
- Sound: gusts, gravel crunch per step, distant traffic.
- `age-roofs` + `giants` (0.2–1.02; line 2 at 0.54): line 1 on the wide;
  "Ayakkabımın tabanı çakıllara sürtünür…" on the gravel close-up.

**gap** · 2.4 · @8.4 · set C
- u 0–0.5 he stands at the parapet at (9.4, 0, −3), one sneaker up on it,
  looks across at roof B (1 m lower), counting with four small nods
  (0.1–0.4). u 0.5–1 hands on the parapet, he leans and looks down.
- Camera: u 0–0.55 over his right shoulder (7.5, 1.4, −1.5) → roof B
  (13.6, −1, −3), vfov 42, the gap a dark slot; u 0.58–1 slow push to his
  profile (9.6, 1.0, −1.8) → eyes looking down, vfov 35.
- Sound: the wind starts to thin.
- `steps` (0.03–0.55; line 2 at 0.25): "İki çatının arası dört adımdı…" on
  the four nods; "Karşı çatı bir metre aşağıdaydı. Dizlerim bunu bilirdi."
  frames the drop to B.
- `look-down` (0.58 → down 0.5; line 2 at down ≈0.04): line 1 on his
  profile; line 2 arrives with the cut to the street.

**down** · 1.8 · @10.8 · set C · QUIET 0.04–0.5
- POV straight down the alley to the avenue 60 m below: matchbox cars moving
  without sound, dots of people, a bus; a pigeon crosses below the lens.
  u 0.4 his two hands enter the bottom of the frame gripping the parapet.
- Camera: his eye point over the parapet (10.05, 1.0, −3.3) → (11.2, −60,
  −16): the alley floor at the bottom of frame, the avenue's mouth in the
  upper half; slow vertigo pull: the camera backs 0.3 m while vfov narrows
  55 → 47.
- Sound: **all** city sound and wind cut at 0.04 → near silence and his
  breathing.
- `look-down` line 2 (until 0.5): "arabalar kibrit kutusu kadar küçük,
  insanlar nokta, hayat ise sessizdi."
- `short-sound` (0.55–1.04): the still, silent street.

**jump** · 2.0 · @12.6 · set C · QUIET 0.46–0.66
- u 0–0.3 he walks ten steps back to (4.5, 0, −3), turns; 0.3–0.48 sprints;
  **0.48** plants a foot on the parapet top (9.95, 0.45, −3) and leaps;
  0.5–0.6 airborne over the gap (apex y +0.8 at x 11.2).
- **SPLIT u 0.52:** the ghost's arc falls short; it drops into the alley
  between the facades, turning slowly, fading out by y = −14 (u 0.52–0.66).
- u 0.6 the real boy lands on B's gravel at (13.8, −1.0, −3), deep knee
  bend, one hand down; 0.66–1 stands, brushes his palms, looks back at the
  empty gap.
- Camera: u 0–0.46 behind him on A (2, 1.2, −1) → (11, 0, −3), vfov 45;
  u 0.46–0.66 cut to a high side-on over the gap (11.2, 4, 9) → (11.2, −2,
  −3), vfov 50 — both arcs and the depth in one frame; u 0.66–1 slow push to
  the landed boy.
- Sound: running crunch, a breath, landing thud 0.58; **0.72 a short dry
  sound from very far below** (caption only conveys it; nothing shown).
- `then` (0.04–0.48): the run-up. `this-universe` (0.62–1.06): "Karşı çatıya
  inerdim. Bu evrende, her seferinde." — the boy upright on B, the gap
  behind him empty.

### 03 — CAM (6.5) · `glass` → `crack` · BOY 9 · late afternoon

**glass** · 1.7 · @14.6 · set D
- u 0–0.3 he walks the rim to the sign; 0.3 steps onto a steel rail; **0.48
  moves his foot off the rail onto the centre of the pane** (100.75, 0, 8.25);
  0.5–1 walks pane centres toward −z (z 8.25 → 3.75).
- Camera: u 0–0.45 three-quarter from the rim (103, 1.7, 12) → boy, vfov 40;
  u 0.45–1 low at the glass (101.6, 0.25, b.z − 1.2) looking back at the
  sneaker landing; the atrium's depth shows through.
- Sound: lighter wind; soft "thock" of rubber on glass; a hum.
- `glass-walk` (0.1–1.02; line 2 at 0.49): "Çelik çerçevelere basmam
  gerekirdi; ben camın tam ortasına basardım." lands on the foot on the pane.

**rooms** · 2.2 · @16.3 · set D
- He walks on slowly, pane centre to pane centre, z 3.75 → −0.75.
- Camera: u 0–0.46 POV straight down through the pane under his feet
  (100.75, 1.3, b.z) → (100.75, −24, b.z − 1), vfov 55: the rail grid, then
  the void: galleries stepping down, lit rooms, the mosaic 24 m below.
  u 0.46–1 cut **below the glass** to (97, −6, 2), panning across the
  galleries: the woman folding laundry, the old man asleep before the TV;
  at u 0.72 tilt up to the small silhouette walking on the glass ceiling.
- Light: warm rooms against the cool sky.
- Sound: rising room tones — TV murmur, a washing machine, a radio.
- `below` (0.04–0.44): the POV down. `nobody-up` (0.48–1.04; line 2 at 0.72):
  line 1 on the laundry and the sleeper; "Kimse yukarı bakmazdı." on the
  tilt up to the boy above them.

**crack** · 2.6 · @18.5 · set D
- u 0–0.1 he steps onto the pane centre (100.75, 0, −2.25) and stands.
  u 0–0.5 close on his sneaker; the pane vibrates (specular ripple,
  shimmer); **u 0.22 a door slams somewhere below** — a tremor through the
  pane, dust motes jump.
- **SPLIT u 0.5:** the ghost steps sideways onto the next column's pane
  (99.25, 0, −2.25); a star crack blooms under its foot (0.54–0.6); **0.6
  the pane shatters**; ghost and shards drop into the atrium, the shards
  glittering through the light shafts; the ghost fades out by the −8 gallery
  (0.6–0.75); the shards keep falling, small.
- u 0.62–1 the real boy, on his intact pane, steps onto the next steel rail
  (z −3, u 0.7) and walks on toward −z; he does not look back.
- Camera: u 0–0.5 low close (101.2, 0.2, b.z − 0.6) → sneaker, vfov 35;
  u 0.5–0.75 two-shot from above-side (103.5, 2.6, −2.25) → between the two
  panes, vfov 45; u 0.75–1 pull back high (106, 6, 6) → (100, −6, −2): the
  roof grid with one black square, the boy walking on.
- Sound: glass hum; door slam 0.22; crack 0.56; shatter 0.6, then a tinkle
  descending floor by floor.
- `tremble` (0.04–0.5; line 2 at 0.23): line 2 "Aşağıda bir kapı kapansa,
  ayaklarımın altında duyardım." lands with the slam.
- `chosen` (0.54–1.04; line 2 at 0.75): "Bir çatlak çıksa…" on the star crack;
  "yerçekimi beni seçerdi." as the ghost and the shards drop.

### 04 — KÖPRÜ (5.6) · `river` → `slip` · BOY 12 · overcast

**river** · 1.4 · @21.1 · set E
- u 0–1 wide establishing from the east bank: the steel bridge over the
  swollen river, spray. BOY 12 climbs down from the road onto the west
  abutment ledge (183, 9, 0) and (0.5–0.9) swings under the deck, hanging by
  his hands from the bottom flange of girder z = −1.
- Camera: (222, 4, 18) → (196, 8, 0), vfov 48.
- Sound: the river's roar dominates.
- `age-bridge` + `under-bridge` (0.12–1.04): the small figure going under
  the steel above the flood.

**beams** · 1.8 · @22.5 · set E
- He goes hand over hand along the flange +x (183.5 → 192), legs dangling
  9 m over white water; drips fall from rivets; cross-beams pass over him.
  u 0.5–0.65 insert: his palm on the flange — rust, a rivet head under it.
- Camera: dolly under the deck beside him (b.x − 1.5, 9.4, 2.2) → hands and
  face, vfov 42.
- Light: dim, cold, wet speculars. Sound: roar, drips, breath.
- `cold` (0.06–1.0; line 2 at 0.45): line 1 on the dripping beam; "Perçinler
  avucuma batar…" on the palm insert.

**slip** · 2.4 · @24.3 · set E
- u 0.06–0.3 **a truck crosses overhead**: the deck booms, grit and water
  shake down, 2 cm camera shake. u 0.3–0.5 his right fingers creep on the
  wet flange (close-up, water beading); the roar swells.
- **SPLIT u 0.52:** the ghost's hands open; it drops straight down 9 m into
  the white water and is gone in the foam (0.52–0.6), only a white puff.
- u 0.56–0.7 the real hand clamps back; 0.7–0.9 he swings a knee over the
  cross-beam and hangs there, breathing.
- Camera: u 0–0.5 close on the hands from just above flange level
  (b.x + 0.4, 10.0, −0.6) → fingers, vfov 30; u 0.5–0.66 low wide from the
  water (194, 0.8, 6) → (192, 8, −1): him hanging, the ghost falling past
  into the foam; u 0.66–1 close on his wet face, eyes open.
- Sound: truck boom 0.08; roar peaks at 0.5 then falls back.
- `roar` (0.06–0.6; line 2 at 0.29): line 1 on the truck shake; line 2 on the
  slipping fingers.
- `never-back` (0.64–1.06): the foam where the ghost went, then his face.

### 05 — TAŞLAR (5.4) · `cliff` → `rehearsal` · BOY 12 · noon

**cliff** · 1.5 · @26.7 · set F
- u 0–0.6 he climbs the last rocks from (303, −0.5, 6) and walks to the edge;
  0.6–1 sits at (300, 0, −1.6), legs over, scoops stones into his lap.
- Camera: wide side view from out over the ravine (312, 1.5, −6) →
  (300, −0.5, −2), vfov 50, showing the face dropping away beneath him.
- Sound: wind in grass, insects.
- `hills` (0.1–1.04; line 2 at 0.49): line 1 climbing; line 2 as he sits at
  the edge with the stones.

**stone** · 2.4 · @28.2 · set F
- u 0–0.22 he holds a stone out over the edge at arm's length, the watch
  on his left wrist, thumb on its button; **0.22 he opens his hand and
  presses the watch** (beep); 0.22–0.76 the stone falls along the face,
  knocking twice (0.34, 0.5), shrinking, while the watch digits run;
  **0.76** a tiny dust puff on the ravine floor — the tick; he stops the
  watch: **00:04.6**; 0.8–1 he picks another stone and weighs it.
- Camera: u 0–0.22 close on hand, stone and watch (300.4, 0.6, −1.0), vfov
  30; u 0.22–0.76 follow the stone down the face (stone at one-third frame),
  y 0 → −90, vfov 45, reaching the floor as it lands; u 0.76–1 back up: the
  watch face (00:04.6), then his face.
- `measured` (0.04–0.56; line 2 at 0.26): line 1 on the held stone; "Taşı
  bırakır bırakmaz kolumdaki saatin düğmesine basardım." just after the beep
  (0.22), the stone already falling.
- `stopwatch` (world, 0.76–1.0): 00:04.6 on the stopped watch (before 0.76
  the digits are running).
- `seconds` (0.6–1.04; line 2 at 0.78): "Dört saniye, bazen beş." on the last
  stretch of the fall; "Sonra çok aşağıdan küçücük bir tık." just after the
  puff (0.76).

**rehearsal** · 1.5 · @30.6 · set F
- u 0–0.3 he leans out over the edge, hands on the rim, to see where it fell.
- **SPLIT u 0.3:** the ghost leans further, past the balance point, and slides
  off the edge without a sound, following the stone's line; fades out by
  y = −30 (0.3–0.55).
- u 0.45–1 the real boy sits back and takes the next stone.
- Camera: on the cliff face below and in front of the rim (300, −2.5, −4.5)
  → (300, 0.5, −1.6), vfov 45 — his face over the rim; the ghost comes over
  it toward and past the lens.
- `rehearsal` (0.12–1.05): "Kendi düşüşümün provasını yapar gibi." — arrives
  as he leans out; the ghost goes over the rim while it is on screen.

### 06 — DALGA (6.4) · `flag` → `up` · BOY 12 · storm

**flag** · 1.6 · @32.1 · set G
- He drops the towel at (401, 0, 6) and walks to the waterline (z 6 → 0)
  into the wind; the flag snaps in the foreground at u ~0.5.
- Camera: (412, 2.2, 14) → (400, 1, −6), vfov 50, low handheld sway; the
  flag in the foreground, the sign right of centre and readable.
- Sound: flag flapping, surf roar.
- `bad-weather` (0.1–1.02; line 2 at 0.49): line 2 "Rip akıntısı uyarıları
  vardı. Bayrak rüzgârda yırtılacak gibi çırpınırdı." on the flag.
- `rip-sign` (world, 0.1–1.0): the sign board text.

**waves** · 1.4 · @33.7 · set G
- Waist-deep at (400, 0, −5): a 3 m wall of dark green water rises, crest
  curling white; **u 0.6 he dives into its face**; 0.7 it breaks over the spot.
- Camera: low at the water behind him (400.6, 0.6, −1.8) → (400, 1.8, −10),
  vfov 55; the wave face backlit translucent green.
- `swallow` (0.06–1.0; line 2 at 0.45): "Kaçmazdım; dalganın tam altına
  dalardım." → the dive at 0.6.

**under** · 1.8 · @35.1 · underwater pocket · QUIET
- He tumbles slowly (1.5 turns on all axes over the segment), bubbles
  streaming in different directions, sand clouds, light from everywhere, no
  surface. At u 0.5 the camera stops tumbling while he keeps turning;
  u 0.4–0.9 the green darkens to almost black-green, the light ebbing from
  every side.
- Camera: close, tumbling with him (roll ±40°), (400.8, −4, −19.2) → him,
  vfov 60.
- Sound: muffled roar, a heartbeat rising.
- `nothingness` (0.1–0.9; line 2 at 0.44): line 2 as everything sinks to
  almost black-green.

**up** · 1.6 · @36.9 · underwater → surface
- u 0–0.3 he stops tumbling, hangs, chest heaving, bubbles from his mouth,
  looks around.
- **SPLIT u 0.3:** two boys turn two ways — the real one kicks toward the
  slightly paler patch (up-right); the ghost kicks down-left into darker green
  and dissolves into it (0.3–0.55).
- u 0.6–0.78 he swims up; **0.78 breaks the surface** (camera half in, half
  out of the water) and gasps; the beach far off.
- Camera: u 0–0.6 wide underwater (402, −5, −17) → between the two, vfov 60;
  u 0.6–0.78 follow him up; u 0.78–1 at the waterline.
- Sound: muffled → at 0.78 the full roar and a big breath.
- `guess-up` (0.06–1.02; line 2 at 0.59): line 1 on his heaving chest and
  the split (0.3); line 2 "yukarıyı tahmin ederek yüzeye çıkardım." as he
  swims up toward the paler patch.

### 07 — TOPRAK (7.4) · `bike` → `bargain` · BOY 15 · dusty late afternoon

**bike** · 1.4 · @38.5 · set H
- He barrels down the track on the BMX (z 30 → 2), standing on the pedals,
  dust plume; u 0.48–0.62 insert: his fingers on the grips, brake levers
  untouched.
- Camera: u 0–0.48 low trackside (503, 0.6, 12) panning; u 0.48–0.62 the
  insert; u 0.62–1 chase from behind (500.5, 2.5, b.z + 5) → the lip and the
  dark cleft.
- Sound: chain, tyres on dirt, wind.
- `age-bike` + `bike` (0.1–1.04; line 2 at 0.49): line 2 "Rampaya yaklaşırken
  frene hiç dokunmazdım." with the brake insert.

**air** · 1.9 · @39.9 · set H · slow motion
- u 0–0.92 airborne over the cleft from the lip (500, 0.4, 0) to the bank
  (500, −3, −7.5); front wheel spinning free, dust hanging.
- **SPLIT u 0.5:** a ghost rider and bike separate; its front wheel drops, it
  noses into the cleft's darkness, fading by y = −12 (0.5–0.68).
- **u 0.92** the real bike lands; dust burst, rear wheel skids.
- Camera: u 0–0.5 side-on wide at the cleft (507, 0, −3) → bike, vfov 50,
  slow lateral track, the cleft's depth below; u 0.5–0.7 tilt down with the
  ghost; u 0.7–1 back to the rider, slow push as the bank rises to meet him.
- Sound: a free wheel ticking, wind, heartbeat; landing at 0.92.
- `hang` (0.06–0.48): the frozen moment in the air.
- `widen` (0.52–1.06; line 2 at 0.75): "Zaman genişlerdi." as the ghost drops;
  "Toprak yaklaşırdı." as the bank fills the frame.

**slope** · 1.5 · @41.8 · set I
- He walks the path +x (595 → 600.5) onto the crust; the black hollow under
  the overhang is visible below his feet.
- Camera: from below the path, downslope, looking up at the crust edge
  (599, −1.6, −2.4) → (599, 0.3, 0), vfov 45.
- Sound: wind, small trickles of earth.
- `hollow` (0.1–1.04): the crust, the void under his sneakers.

**bargain** · 2.6 · @43.3 · set I
- u 0–0.44 close on his sneaker at (601.5, 0, 0): the edges crumble, pebbles
  trickle into the hollow, the foot sinks ~2 cm; he takes another step
  (602.5).
- **SPLIT u 0.5:** he steps onto (603.5, 0, 0), the middle of the collapse
  patch (x 602.8–604.2). The real boy walks straight on (604.5, 605.5) and
  is on the rock outcrop at 606.6 by u 0.62. The ghost stays on the patch,
  shifts its weight once (a small bounce at 0.56) and takes one more step;
  **u 0.62 the patch collapses** into the hollow with a muffled thump and the
  ghost sinks with it into rising dust (0.62–0.75).
- u 0.66–1 the real boy, on the rock, turns and looks at the hole; the dust
  rises past him.
- Camera: u 0–0.44 low close (601.2, 0.25, 0.6) → foot, vfov 32;
  u 0.44–1 medium wide from further along (609, 1.4, 1.5) → (603.5, 0, 0),
  vfov 45: the split, the walk on and the collapse in one frame.
- Sound: crumbling; the thump at 0.62; a dust hiss.
- `loosen` (0.03–0.46; line 2 at 0.21): "Kenarlardan çakıllar karanlığa
  dökülürdü." on the trickle.
- `bargain` (0.5–1.06; line 2 at 0.74): "Sanki yer benimle pazarlık
  yapıyordu." at the split, the ghost lingering on the patch; "Bir adım
  daha, diyordu. Sonra bir adım daha." just after the collapse, dust rising.

### 08 — KIVILCIM (6.9) · `socket` → `normal` · BOY 9 · night

**socket** · 1.7 · @45.9 · set J
- u 0–0.4 BOY 9 (pyjamas) kneels at the socket (700.4, 0, −1.5); takes a
  black hairpin from his pocket; 0.4–0.8 bends it open into a V.
- Camera: u 0–0.5 over his shoulder (701.2, 0.9, −0.6) → socket, vfov 40;
  u 0.5–1 insert on his fingers bending the pin (700.45, 0.35, −1.75), vfov 30.
- Light: nightlight blue on his face, warm sliver from the door.
- Sound: TV murmur down the hall.
- `age-spark` + `hairpins` (0.12–1.04; line 2 at 0.51): "Tokaları annemin
  tarağının yanından alırdım." on the pin close-up.

**spark** · 1.9 · @47.6 · set J · QUIET 0.16–0.3
- u 0–0.18 the two prongs approach the holes (macro). **0.18 contact:** a
  white-blue flash (full-frame bloom 0.18–0.24, brief), a crack; **0.22 the
  house goes dark** (nightlight, hall light, TV off).
- **SPLIT u 0.18:** in the afterglow, two boys: the real one thrown back onto
  his bottom (0.24), shaking his hand; the ghost stays kneeling at the
  socket, still, outlined in faint blue that slowly goes out (0.24–0.7).
  A thin smoke wisp from the socket.
- Camera: u 0–0.24 macro (700.4, 0.32, −1.8) → holes, vfov 25; u 0.24–1 pull
  back low and wide (701.6, 0.5, 0.8) → (700.3, 0.3, −1.6): two silhouettes,
  the ghost's blue line fading.
- Light: after 0.22 only the ghost's glow and a faint ambient.
- `the-sound` (0.28–1.04; line 2 at 0.6): "Elektriğin görünmezliğini görünür
  kılmak hoşuma giderdi." as the blue outline — the electricity made
  visible — fades.

**normal** · 3.3 · @49.5 · set J
- u 0.02 footsteps; **0.05** a flashlight beam enters through the door —
  the mother's silhouette in the doorway (702, 0, 1.0); the beam sweeps the
  room: across the spot where the ghost knelt (empty), onto the boy on the
  floor. u 0.32 he slides the blackened pin under his knee, squints into the
  beam, shrugs. u 0.62–1 the beam leaves; he stays in the dark looking at the
  scorch mark.
- Camera: u 0–0.6 from behind the boy toward the door (699.8, 0.7, −1.9) →
  (702, 1.3, 1), vfov 42, the beam in our eyes; u 0.6–1 slow push to his face
  lit by the receding beam, then dark.
- `fuse` (ANNE, 0.05–0.31): "— Yine mi sigorta attı?" — the silhouette.
- `dunno` (0.34–0.63): "Bilmem, derdim. Kararmış toka dizimin altında
  olurdu." — the pin going under the knee.
- `not-normal` (0.66–1.06; line 2 at 0.83): line 1 as the beam leaves;
  "Sadece ben öyleymiş gibi davrandım." on his composed face in the dark.

### 09 — BAZI EVRENLERDE (12.9) · `friends` → `powerKept`

**friends** · 1.8 · @52.8 · set C at blue hour
- Three 12-year-olds walk in single file **on top of** roof A's south
  parapet (0.4 m wide, 60 m drop outside), in single file, each holding the
  hand of the one behind (those arms stretched fore and aft, the free arms
  out for balance): BOY 12 leading (x −2 → +4), EMRE, BARIŞ last; city
  lights below.
- Camera: low from the roof side, along the parapet (−6, 0.8, −7.5) →
  (2, 1.0, −10), vfov 45.
- Sound: their laughter, wind.
- `age-friends` + `dragged` (0.14–1.02; line 2 at 0.51): line 2 "Emre arkamdan
  gelirdi, Barış onun arkasından." as the camera shows the order.

**chain** · 2.4 · @54.6 · set C
- u 0–0.38 at the parapet's south-east corner (10, 0.45, −10) EMRE hesitates;
  BOY 12 steps round the corner first. u 0.4–1 they round it, hands locked;
  u 0.55–0.75 insert on the three linked hands; Barış's glasses glint.
- Camera: u 0–0.38 close two-shot (8.5, 1.3, −8.6) → Emre's face and the
  leader's back, vfov 38; u 0.4–1 from the void beyond the corner
  (13, −0.5, −14) → (10, 0.8, −10), vfov 45: the chain on the edge, 60 m of
  facade below.
- `emre` (EMRE, 0.03–0.39): "— Sen geçersen ben de geçerim." — Emre at the corner.
- `took-them` (0.42–1.04; line 2 at 0.68): "Birimiz düşse, hepimiz düşerdik."
  on the linked hands.

**fell** · 1.2 · @57.0 · set C · QUIET
- **SPLIT u 0.1:** a translucent trio peels off the three — hands still
  joined — and tips outward off the parapet together, falling slowly
  backward into the blue dusk, growing small, fading out by y = −25
  (0.1–0.8). No sound. The real three hop down onto the gravel (0.3),
  laughing silently, and run toward the stair hut.
- Camera: from the void (12, −1, −16) → (9, 0, −10), vfov 50; the ghost trio
  falls past below the lens line.
- `we-fell` (0.26–1.08): "Belki bazı evrenlerde düştük."

**today** · 2.4 · @58.2 · set A path · dusk
- THE MAN walks alone up the path ((1030, −22, 44) → (1012, −6, 18)),
  hands in his jacket pockets; at u 0.7 he stops for breath and looks down
  the slope. The old tree is a silhouette at the top; **the swing is not
  shown in this segment** (hide ropes and seat).
- Camera: u 0–0.45 behind, slightly low (b + (2, 1.0, 6)) → ridge/tree,
  vfov 40; u 0.45–1 side profile tracking (b + (6, 1.5, 0)) → face, vfov 35.
- Light: violet dusk, warm rim. Sound: wind in grass.
- `age-today` "ŞİMDİ" + `grew-up` (0.06–0.45; line 2 at 0.21): "Bu evrende
  büyüdük." on the grown man from behind; "Emre’yle Barış o çizgiden çoktan
  indiler." as he climbs on alone.
- `hundreds` (0.49–1.02; line 2 at 0.71): line 2 as he stops and looks down.

**glassBroke** · 1.0 · @60.6 · set D, grey grade
- From the atrium floor (100, −23.6, 0) straight up, vfov 55: the glass roof
  with one black hole at (99.25, −2.25); shards hanging in the light shafts,
  slowly turning. Nobody on the roof.
- `u-glass` (0.06–0.98).

**ironSlipped** · 1.0 · @61.6 · set E, grey grade
- Under the deck: the empty girder at x ≈ 192, a drop of water falling from
  the flange; the camera tilts down with it to the brown water.
  (194, 9.2, 2) → (192, 9.8, −1), vfov 40.
- `u-iron` (0.04–0.98).

**waveKept** · 1.0 · @62.6 · set G, grey grade
- The sea after the wave: flat grey-green, foam lace drifting; the flag tiny
  on the beach behind; no head above the water. Water-level camera
  (400, 0.4, −6) → (400, 0.5, −30), vfov 50.
- `u-wave` (0.04–0.98).

**earthFell** · 1.0 · @63.6 · set I, grey grade
- The path cut in two by a fresh jagged hole into the hollow; dust settling.
  (604, 1.5, 4) → (603.5, −0.5, 0), vfov 45.
- `u-earth` (0.04–0.98).

**powerKept** · 1.1 · @64.6 · set J, dark, grey grade
- The bedroom, door closed: the blackened socket with a thin smoke wisp; the
  hairpin on the carpet; nobody. Low camera (700.6, 0.25, −0.4) → socket,
  vfov 38, slow push.
- `u-power` (0.04–1.0).

### 10 — ODA (10.5) · `bodies` → `diorama`

**bodies** · 2.2 · @65.7 · set K plain
- THE MAN (solid) walks slowly along the arc of eight plinths, between them
  and the camera, left to right. The ghosts stand on them, eyes closed, arms
  at their sides, each in its vignette's clothes (hair wet for bridge and
  sea, dust on the bike and slope boys, the youngest in pyjamas). No wounds,
  no props, no marks — only stillness and the glow.
- Camera: u 0–0.6 wide (900, 2.4, 6) → (900, 1.2, −8), vfov 50, slow lateral
  dolly; u 0.6–1 a pan along the row at mid-height that compares heights
  (0.78 / 0.88 / 0.97).
- Light: blue-black; each ghost a soft light; floor fog. Sound: near silence,
  a low tone.
- `corpses` (0.06–0.6; line 2 at 0.29): "Farklı yaşlarda, farklı
  yüksekliklerde." on the uneven plinths (both meanings: stature and the
  height each fell from).
- `ages` (0.64–1.04): the pan across 9, 12, 15.

**room** · 2.4 · @67.9 · set K archive
- u 0–0.3 the plinths sink; shelving rises from the plain on both sides;
  lamps blink on one by one into the distance. u 0.3–1 the man walks the main
  aisle (z −14 → −24); dust in the cones; u 0.6–0.85 insert on three cases at
  (898.8, 1.5, −20): a boy on broken glass, a boy under a resin wave, a boy at
  a socket; brass plates legible.
- Camera: u 0–0.4 crane rising from floor level (900, 0.4, −10) → (900, 2,
  −40), vfov 50; u 0.4–1 tracking beside him (b + (−1.0, 1.5, 1.8)), then the
  insert.
- Light: amber pools, brown-black; the far vanishing point faintly red.
- Sound: parquet creaks under his steps; a lamp hum.
- `hell` (0.04–0.52; line 2 at 0.24): "Ateş yok. Sadece raflar, etiketler ve
  toz." as the lamps come on.
- `shelves` (0.56–1.02; line 2 at 0.75): "Her biri “az kalsın”ın gerçekleşmiş
  hâli." on the insert.

**devil** · 2.4 · @70.3 · set K
- u 0–0.3 the man stops at z = −24. At the end of the aisle, before the
  cross-wall, BOY 9 stands — **solid, full colour** (red windbreaker, the
  sneakers), holding the winged can. The bare-bulb lamp sits low between
  them. u 0.3–0.54 the boy looks at the man calmly, the hint of a smile.
  **u 0.54–0.8 he slowly raises his arms out to the sides**, the can still in
  his right hand (the arms he never spread on the line); his shadow on the
  shelving wall behind him grows huge — arms become wings.
  u 0.8–1 hold.
- Camera: u 0–0.54 over the man's shoulder (900.6, 1.7, −22.6) → the boy,
  vfov 40; u 0.54–1 slow push past the man, vfov 40 → 32, the shadow wings
  filling the wall.
- Light: the lamp is the only key, low and in front of the boy.
- `not-bad` (0.06–0.5; line 2 at 0.24): an ordinary boy.
- `own-devil` (0.54–1.02; line 2 at 0.74): "Kendi şeytanımdım." when the
  shadow wings are fully open.

**exception** · 2.2 · @72.7 · set K, overhead
- Crane up and out of the aisle until the archive is a grid to the horizon,
  each case top glowing amber; **one slot dark** at (902.0, 3.9, −48.0),
  centred by u 0.6. The man tiny below; the boy gone by u 0.5.
- Camera: (900, 5, −26) → rising to (906, 60, −40), looking straight down at
  (903, 0, −48), vfov 50.
- Sound: the room tone opens into a huge space.
- `exception` (0.04–0.45) on the rise; `deviation` (0.49–1.03; line 2 at
  0.72): "Evrenin hesaplayamadığı bir sapma." with the dark slot centred.

**diorama** · 1.3 · @74.9 · set K · QUIET from 0.6
- u 0–0.15 the dark slot clicks on: a new case: a tiny cliff edge, a tiny
  old tree, a tiny swing, **the seat empty, the rope still swinging**
  (time-driven); label plate **ŞU AN · SALINCAK**. u 0.2–1 the camera
  descends and pushes into the case until the miniature fills the frame;
  u 0.95–1 match-dissolve to `swing` (same composition).
- Camera: from the aisle side (900.6, 4.3, −48.0) → the case front
  (901.85, 3.95, −48.0), vfov 40 → 30.
- Light: the case lit from inside in dusk colours (violet-orange) — the only
  colour in the archive.
- Sound: a tiny creak; wind seeps in.
- `tag` (world, 0.1–1.0); `even-now` (0.08–1.02).

### 11 — ŞU AN (13.3) · `swing` → `end` · THE MAN · dusk

**swing** · 1.8 · @76.2 · set A
- u 0: matched to the diorama: now real — the old tree, the ropes, THE MAN
  on the plank, swinging gently (±25°), the valley vast below, the far ridge
  orange, the sky violet. u 0–1 slow pull back and round to a three-quarter
  side view from over the void.
- Camera: (1000.4, 2.6, 2.9) — just in front of the rock face, above and
  behind the seat — arcing out on the +x side (≥ 1 m from the trunk) to
  (1009, 1.5, −7), always looking at (1000, 1.5, −0.5); vfov 45 → 55,
  revealing the 400 m drop under the seat.
- Sound: a rope creak per half swing; wind.
- `really` (center, 0.12–0.98; line 2 at 0.43): "uçurumun kenarına kurulmuş
  bir salıncaktayım." as the drop is revealed.

**feet** · 1.5 · @78.0 · set A
- Camera rides with the swing (attached to the seat frame, offset y −0.3,
  z +0.6) below and behind the seat, looking down past his white-red
  sneakers into the abyss: target ≈ (1000, −380, −60), vfov 55; the valley
  swings under the shoes.
- `over-void` (0.06–1.02; line 2 at 0.46): line 2 on the river thread far
  below.

**arc** · 2.0 · @79.5 · set A
- Amplitude ±40°, phase scroll-driven here: back peak at u 0.2 (his back
  ~1 m from the rock face), forward peak at 0.5 (legs out over the void, toes
  pointing down toward the abyss, not up to the sky), back at 0.8, on toward
  the next forward peak in `rope`.
- Camera: side profile of the swing plane from just beyond the edge
  (1006, 1.6, −0.6) → (1000, 2, −0.4), vfov 50.
- `arc` (0.04–1.0; line 2 at 0.48): line 1 as the swing travels back to
  the rock (peak 0.2); line 2 lands on the forward peak (0.5) over the void.

**rope** · 1.8 · @81.5 · set A
- u 0–0.48 close-up of the rope round the branch: fibres twisting and
  creaking, bark dust sifting; **u 0.2 the wind rises** — leaves thrash, his
  jacket flaps, the grass flattens. u 0.5–1 reverse shot from deep in the
  valley, 300 m down, looking straight up at the cliff: the tiny swing
  silhouette against the violet sky, swinging — the void's point of view.
- Camera: u 0–0.48 (1000.0, 4.4, −0.1) → knot (999.7, 4.6, −0.4), vfov 30;
  u 0.5–1 (1000, −320, −90) → (1000, 0, −1), vfov 25, very slow drift.
- `creak` (0.03–0.5; line 2 at 0.23): "Rüzgâr hızlanıyor." with the gust.
- `watches` (0.54–1.04): the void's POV.

**choose** · 1.3 · @83.3 · set A · **GATE at u 0.3**
- u 0–0.3 side view at seat level: the swing reaches the back of its arc and
  hangs a heartbeat — **the scroll holds here** (hands on the ropes, the
  rock behind, the void ahead).
- After the answer: **[on]** he kicks forward, the arc widens. **[stop]** he
  lifts his feet and lets them drag — through air: nothing to drag on; the
  swing keeps going, slowly decaying.
- Camera: (1005, 1.4, 1.0) → (1000, 1.6, −0.4), vfov 45.
- `higher` (on) / `slower` (stop) (0.44–1.06).

**grows** · 2.4 · @84.6 · set A · QUIET from 0.62
- **[on]** amplitude grows to ±52° (the maximum, §2 A). At each forward
  peak (u 0.2, 0.55, 0.9) **a translucent man lets go** of the ropes, sails out over the valley and
  falls away, shrinking into the dusk, fading by y = −200 (~0.3 of the
  segment each). The real man stays on.
- **[stop]** the real swing decays to ±15°; overlapping it, **a ghost swing**
  (translucent ropes and seat) keeps going at ±52° with a translucent man on
  it, who lets go at its forward peaks (0.2, 0.55, 0.9) and falls away the
  same way.
- Camera: u 0–0.6 **dolly zoom** from behind and above the seat, above the
  branch and clear of the swing's path, looking down past the man into the
  valley: (1000, 6.5, 3.0) → target (1000, −400, −120); the camera moves
  forward 3 m (to z 0) while vfov widens 35 → 60 — the valley deepens;
  u 0.6–1 wide side view from the void (1012, 0, −14) → (1000, 1, −1), vfov 50, ghosts
  falling through the frame.
- Light: the sun touches the far ridge; colour drains slightly.
- Sound: a deep drone rising from below; the creak louder with amplitude.
- `grows` (0.08–0.6; line 2 at 0.30): "Sallandıkça boşluk büyüyor." on the
  dolly zoom; "Sallandıkça yerçekimi sabırsızlanıyor." as the swing pulls
  hardest at the bottom of the arc.
- `another-me` (0.64–1.04): the first ghost of the wide shot falling away.

**still** · 1.2 · @87.0 · set A
- The swing at its back point; close on the man's face and hands on the
  rope, solid, breathing. Far below, two or three ghosts are pale motes still
  falling. [stop] the swing barely sways (±8°).
- Camera: rides with the seat (fixed to the swing frame at local
  (+0.7, +0.55, −1.1)), looking back at his face, vfov 35; the rock and the
  tree sway behind him.
- `still-here` (center, 0.14–0.96): "Ve ben hâlâ buradayım."

**end** · 1.3 · @88.2 · set A
- The widest shot: from far out over the valley — the cliff, the old tree,
  the tiny swing still moving ([on] high arcs, [stop] a slight sway). The
  last sun leaves the far ridge at u 0.5.
- Camera: (1060, 40, −260) → (1000, 2, 0), vfov 30.
- `end` (center/final, 0.2 → 5): **PARALEL-LEŞ** · sub "Şimdilik…".
- Sound: the creak continues past the last frame.

### Split summary

| Segment | u | The ghost | Fades by | The real one |
| --- | --- | --- | --- | --- |
| line / can | 0 → | inverted twin under the line, mirrors steps | (stays) | walks on, hands in pockets |
| jump | 0.52 | arc falls short into the alley | y −14 | lands on roof B |
| crack | 0.5 | steps onto the next pane, it breaks, falls with shards | −8 gallery | steps onto the steel rail |
| slip | 0.52 | hands open, drops into the foam | water | hand clamps back |
| rehearsal | 0.3 | leans past balance, slides off | y −30 | sits back, takes a stone |
| up | 0.3 | swims down into the dark | dissolves | swims to the light |
| air | 0.5 | front wheel drops, into the cleft | y −12 | lands on the bank |
| bargain | 0.5 (collapse 0.62) | stays on the hollow patch, one more step; the ground gives | dust | walks on to the rock |
| spark | 0.18 | stays kneeling, blue outline | u 0.7 | thrown back, alive |
| fell | 0.1 | the trio tips off the parapet, hands joined | y −25 | hop down, run off |
| grows | 0.2 / 0.55 / 0.9 | a man lets go at the forward peak (ghost swing in [stop]) | y −200 | stays on |

---

## 4. Choice

**`swing` · SALINCAK** — `choose` at u 0.3, the swing hanging at the back of
its arc. Prompt: "Salıncak en geride, bir an asılı kalıyor." (an echo of
"Havada asılı kaldığım o kısa an…").

| Option | Reply | Flag | Image afterwards |
| --- | --- | --- | --- |
| **Sallan.** | "Ayaklarımı ileri atıyorum." / "Salıncak boşluğa doğru açılıyor." | `swing:on` | `choose`→`end`: the arc grows to ±52°; at each forward peak a ghost man lets go and falls away; `still` shows him at the back point, high; `end` the swing still arcing high. Line `higher`: "Her ileri gidişte biraz daha yükseğe çıkıyorum." |
| **Dur.** | "Durmak için ayaklarımı yere sürtmem gerekir." / "Altımda yer yok." | `swing:stop` | The real swing decays (±15° in `grows`, ±8° in `still`, a slight sway in `end`) — it slows but never stops. A ghost swing overlaps it and keeps going at ±52°; its rider lets go at the peaks. Line `slower`: "Salıncak yavaşlıyor. Ama durmuyor." |

The last lines (`grows`, `another-me`, `still-here`, the title) are the same
for both: in one reading he keeps swinging; in the other, another he does.

---

## 5. Discoveries

| id | What | Where (m) | When | Why |
| --- | --- | --- | --- | --- |
| `banner` (subtle) | A huge banner hanging in the void: two white wings; fine print "Kullanmadan önce uyarıları okuyunuz." Off to the right of the line. | (−282, 6, −60), size 6 | `can` 0–1.0 | God as the sponsor; the warnings no one reads. |
| `tally` (subtle) | Notches scratched into the parapet top with a pebble: one per jump; "On yedide saymayı bırakmışım." | (10, 0.47, −3.7), 0.5 | `gap` 0 → `jump` | He counted. Pays off on the tree trunk. |
| `glass-sign` (subtle) | "CAM ÇATI · ÜZERİNE BASMAYINIZ"; small dusty footprints on the first pane. | (100, 0.6, 10.4), 0.9 | `glass` 0–1.6 | The prohibition and the child who ignored it. |
| `flood-mark` (hidden) | A painted flood line on the abutment — above the girder he hangs from. | (183.05, 10.6, 2.5), 1.6 | `beams` 0 → `slip` | The river can rise over the spot. |
| `stopwatch-laps` (visible) | Lap memory: 04.6 · 04.4 · 05.1 · 04.6 · 04.7 — all from the same cliff. | (299.75, 0.45, −1.45), 0.25 | `stone` 0.6 → `rehearsal` | The rehearsal, repeated. |
| `rip-note` (subtle) | Under the rip sign, in pencil: "Akıntıya kapılırsan kıyıya paralel yüz." | (409.5, 1.7, 4.5), 1.4 | `flag` 0–1.8 | The real safety advice — and the title's word. |
| `tracks` (subtle) | Two tyre tracks start side by side at the lip; one lands across, the other ends at the edge. | (500, 0.05, 0.6), 1.2 | `air` 0–1.0 | The split left marks. |
| `drawing` (subtle) | A child's drawing taped to the wall: a boy flying between two buildings, his wings cut from a drink can. | (698.02, 1.3, −0.6), 0.5 | `socket` 0 → `normal` | The belief in "kanatlandırır". |
| `labels` (visible) | The shelf plates: 9 · ÇATI ARASI — 9 · CAM ÇATI — 9 · PRİZ — 12 · KÖPRÜ ALTI — 12 · TEPE — 12 · DENİZ — 15 · BİSİKLET — 15 · YAMAÇ. | (898.8, 1.5, −20), 1.2 | `room` 0.2–1.6 | The whole catalogue. |
| `trunk-tally` (hidden, behind the reader) | Knife notches on the trunk, in the same hand as the parapet: "Saymayı bıraktığımı sanıyordum." | (1001.5, 1.4, 1.75), 0.5 | `rope` 0 → `still` | The present is one more notch. |

---

## 6. Sound

- **ÇİZGİ:** high wind over the valley (`open`), a faint rope creak at the
  sway's ends; in the void a deep drone, a thin glass ring per step, the can's
  hiss, no impact sound for the can.
- **ÇATILAR:** gusts, gravel crunch, distant traffic; in `down` everything
  cuts to breath; `jump` running crunch, landing thud, then the *short sound*
  from far below.
- **CAM:** soft wind, rubber on glass, a hum in the pane; room tones from
  below (TV, washer, radio); door slam; crack; shatter and a tinkle that
  descends floor by floor.
- **KÖPRÜ:** the river's roar throughout, drips, the truck's boom; the roar
  peaks as the fingers slip.
- **TAŞLAR:** wind in dry grass, insects; watch beep; rock knocks; a tiny
  tick from the ravine floor.
- **DALGA:** flag flapping, pounding surf; underwater a muffled roar and a
  heartbeat; the gasp at the surface.
- **TOPRAK:** chain and tyres on dirt; a free wheel ticking in slow motion;
  landing; crumbling earth, a muffled collapse, dust hiss.
- **KIVILCIM:** TV murmur, the spark's crack, power-down hum, silence,
  footsteps, the flashlight's click.
- **BAZI EVRENLERDE:** children's laughter and wind; silence for the falling
  trio; grass in the wind on the path; each absence one small sound (hanging
  shards ringing, a drip, a waveless hiss, settling dust, a crackle → silence).
- **ODA:** near silence and a low tone on the plain; parquet creaks and lamp
  hum in the archive; the space opening in `exception`; a tiny creak from
  the diorama.
- **ŞU AN:** rope creak on every half swing, wind rising in `rope`, a deep
  drone rising from the valley in `grows`, the creak continuing over the
  title.

---

## 7. Story-select card art

A navy-black void. A thin, nearly invisible glass line crosses it
diagonally. A 9-year-old boy in a red windbreaker walks on it with his hands
in his pockets. Under the line, upside down, a pale translucent copy of him
walks with him, sole to sole. No ground anywhere.

---

## 8. Notes for the scene builder

1. **The split is the whole visual idea.** Build one reusable "ghost" helper
   (clone a figure, swap to the ghost material, give it its own path, trail
   and fade). Every split in §3 uses it; nothing ever lands on screen.
2. **Show only the active set.** Sets are 100 m apart on x but have 60–400 m
   drops and fog; hide inactive sets to keep frames clean and cheap.
3. **Time-driven idle motion** (the `open` sway, the swing, flags, waves,
   river, leaves, the diorama's rope) keeps living when the reader stops
   scrolling; the key actions and splits are scroll-driven at the given `u`.
   Exception: in `arc` the swing's phase is scroll-driven (back peak u 0.2,
   forward peak 0.5) so the two halves of the line land on the right
   half-swings.
4. **The swing is never seen before `diorama`.** `open` looks straight down
   from it; `today` does not show it at all (hide ropes and seat).
5. **World text** to draw in the set: KANATLANDIRIR (the can), 00:04.6 (the
   watch), DİKKAT · RİP AKINTISI · YÜZMEK YASAKTIR (the sign), ŞU AN ·
   SALINCAK (the label plate), plus the brass shelf plates and the glass-roof
   sign.
6. **Restraint:** no blood, no bodies on the ground, no impacts. Corpses in
   `bodies` are standing ghosts on plinths with closed eyes. The danger is
   carried by height, scale, silence and the cut away.
7. **Age reads through height and clothes:** 0.78 / 0.88 / 0.97 and the
   white-red sneakers that follow him into adulthood.
8. **The choice changes only the image after `choose`:** [on] growing arcs
   with ghosts letting go; [stop] a decaying real swing with a ghost swing
   overlapping it.
9. **Desaturated absences** (`glassBroke`…`powerKept`) reuse the sets: same
   cameras as the earlier splits, grey-blue grade, fog up, nobody there.
10. **The rail is left:** keep subjects centre-right; for vertical shots
    (`open`, `down`, `exception`) keep the key detail right of centre.
11. **Collision limits at the swing:** amplitude never above ±52°, the rock
    face at z +3.2, the trunk ≥ 0.8 m from the swing plane; the cameras in
    `swing`, `grows` and `still` are placed to stay out of the swing's path.
