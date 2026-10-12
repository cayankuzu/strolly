# TEKERRÜR — screenplay

The first version of TEKERRÜR, restored and told in full. Code: `src/stories/tekerrur/timeline.ts`
(segments, `ERAS`, `eraAt`, `recordAt`, `BASE_ITERATION = 7184`, `SCREEN_VH = 80`) and
`src/stories/tekerrur/text.ts` (every word, discoveries, captions, `resolveTokens`, `iterationDate`,
`RECORDER_LENS`, `CUES`).

This document is the contract: at every line, the image shows what the line is about.

Chapter order follows the author's text (he goes through the right door before the robots bring the
coffee), so the first version's RUTİN and DIŞARISI are swapped: UYANIŞ · DIŞARISI · RUTİN · ARŞİV ·
TARİH · ÖRÜNTÜ · ANOMALİ · TEKERRÜR · GÖZLEMCİ.

---

## 1. Logline, tone, palette, light

**Logline.** A man sleeps at his desk in a square room whose walls are a forest. He wakes, cleans up,
goes through the right door and comes back forty minutes later with three robots; the third carries
nothing, because its lens is always on him. He opens the archive behind the left door, pulls a switch,
and the machine he built reads the whole of history: one square across a century, a network, a spiral
whose every turn sits on the same circle. Above today there is one more record — tomorrow, 05:12, a man
asleep at this desk. He presses the button anyway. One word: **TEKERRÜR**. Then the records of every
night, none of them the first, and a room that starts over — until it notices that someone is watching.

**Tone.** Calm, dry, human; never horror, never neon. The first third is curiosity and small comedy
(drool, a three-pointer with a cloth), the middle third is pattern recognition, the last third is unease
and reflection. The camera is an observer, not a game camera — and at the end it is noticed. Rule from
the author's first brief: *the second time we see the same thing, we do not see the same thing, because
now we remember it.* Repeated shots use the same framing on purpose: `hover` = `back`; `walk` ≈ `halt`;
`throw` = `again` (second half); the opening corner = `forty` = `press` (second half); the feed =
`again` (first half) = every record (`RECORDER_LENS`).

**Palette.** Near-black, warm charcoal, off-white; restrained forest green, muted blue, desaturated
earth. System text neutral white. **Red appears in only two places:** the button's ring light (with its
glow on Arif's face) from `red` to `press`, and the anomaly node (from `anomaly` u 0.1 to the cut into `checked`; see 2.5). No
cyan, no purple, no glow-fog.

**Light per chapter.**

| Chapter | Time | Light |
|---|---|---|
| 01 UYANIŞ | 17:30 → 17:50 | Low golden sun on the ceiling screen; the wall forest lit warm from one side; the room is lit only by its screens plus a warm 2700 K strip under the desk lip. Face always readable. |
| 02 DIŞARISI | 18:00 → 18:55 | Sunset → dusk → blue hour (the forty-minute time-lapse in `forty`); drizzle on the wall screens from `forty` u 0.38. |
| 03 RUTİN | ~19:00, night | Walls dark blue-green with light drizzle, a faint moon on the ceiling; desk strip light; robots' small white status rings. |
| 04 ARŞİV | night | Room as above; the archive is cool, even, white (not blue), with depth fog; after the switch, warmer white bands come on row by row. |
| 05 TARİH / 06 ÖRÜNTÜ | eras | Each era of the square has its own daylight (table 3.5). The network void is near-black with off-white nodes and thin grey lines. |
| 07 ANOMALİ | late night; the feed is 05:12 | The feed: cold pre-dawn blue room, ceiling dark with a thin dawn line. The present: red ring glow, screen light on Arif. |
| 08 TEKERRÜR | night → black | Everything goes out panel by panel; then only the word; then dim grey circles. |
| 09 GÖZLEMCİ | records (evenings), then 05:12 → late afternoon | Records: each record's own evening light through the lens (slight vignette, timecode). `again`: 05:12 blue time-lapses to 17:30 gold. End: black. |

---

## 2. World layout (meters)

Axes: x right, y up, z toward the default camera. Arif, seated, faces **−z** (so his right hand is on
the +x side). Each set has its own area; cuts between sets are camera jumps.

### 2.1 The room — origin

- **Shell.** Square, 10 × 10 m: x ∈ [−5, 5], z ∈ [−5, 5]. Ceiling at y 4.6. Floor: warm oak planks
  (0.18 m wide, running along z), slightly worn; no skirting — the planks meet the wall screens directly
  ("a tree house without walls or roof").
- **Wall screens.** Every wall is 5 panels, 2 m wide × 4.6 m tall, with 1 cm dark seams. They show a
  continuous forest by a stream (procedural canvases: trunks, canopy, light shafts, ferns). The
  **stream** runs across the front wall (z = −5) at floor level, x −5 → +5, and continues onto the right
  wall. The image is perspective-correct for a viewer near the center (360° illusion). Seams are visible
  only up close (`stream`). The door leaves are panels of the same image, outlined by their frames.
- **Ceiling screen.** Sky: clouds and a sun disc whose position/colour follows the room's clock. One
  distinctive **hooked cloud** (long, with a curl at its −x end) sits at (0.5, 4.55, −1.5) on the first
  evening — and exactly there again in `again` (discovery `same-cloud`). The ceiling is hidden (cutaway)
  only in the top-down shot `engine`.
- **Desk.** Center (0, 0.76, 0); top 3.4 (x) × 1.5 (z) m, 4 cm dark glass = touch surface (faint UI glyphs
  and small pale windows when touched); two slab legs. A warm LED strip under the front lip.
- **Chair.** Low-backed office chair at (0, 0, 1.05) facing −z; pushed back to (0, 0, 1.35) when he
  stands. A folded grey cloth on a small shelf under the seat.
- **Three giant screens** on the desk's far edge: center 2.2 × 1.25 m, bottom edge at y 0.95, centered
  (0, 1.58, −0.6), facing +z; left (−2.15, 1.58, −0.25) yawed 25° toward the chair; right (2.15, 1.58,
  −0.25) yawed −25°. Off = black glass reflecting the forest.
- **The button.** On the desk under the center screen at (0, 0.79, −0.32): Ø 0.14 m, 4 cm tall, matte black
  cap, a thin ring light around it (off → deep red from `red` u 0.08 → fades out at the end of `press`).
- **Cloth box.** Open oak box 0.5 × 0.45 × 0.5 m in the **front-right corner** at (4.3, 0, −4.3), full to
  the brim with identical grey cloths (discovery `cloth-box`). From the chair the throw is ~6.9 m — a
  three-pointer, and it goes in.
- **Right door.** Center of the right wall (5, 0, 0). Leaf 1.4 × 2.8 m (z ∈ [−0.7, 0.7]), screen-clad.
  **Brutalist frame:** raw grey concrete, 0.3 m deep, 0.25 m jambs, exposed steel bolts, a heavy horizontal
  steel handle at (5, 1.05, 0.45). Opens **outward** into the walkway, hinge at z −0.7.
- **Left door.** Center of the left wall (−5, 0, 0). Identical frame, slightly heavier handle at
  (−5, 1.05, −0.45). Opens outward into the archive, hinge at z +0.7. **Stays open** from `whistle` to
  the end: a long strip of white archive light lies across the planks.
- **Robot stops (worn marks).** Circular worn patches in the planks, Ø 0.45 m, where the robots always
  stop: coffee robot (0.95, 0, 1.45) — right-behind the chair; snack robot (−0.95, 0, 1.6) — left-behind;
  recorder (−3.2, 0, 0.35). Discovery `worn-floor` is the snack robot's mark.
- **Where the robots are.** Evening start (UYANIŞ–DIŞARISI): coffee and snack robots in their niches in
  the walkway (2.2); the recorder at its stop in the room. From `sits` on, all night: coffee and snack
  robots on their marks behind the chair (rings dimmed after RUTİN), the recorder at its stop or
  following Arif. In `again`'s time-lapse the two roll back out through the right door: the room resets.

### 2.2 Beyond the right door — x 5 … 9

A narrow walkway: same oak planks, 1.6 m wide (z ∈ [−0.8, 0.8]), 4 m long, ending at a plain warm-lit
door at x 9 (the dressing room; never entered on screen). Its walls and ceiling are screens showing the
forest **close** (ferns at arm's length); the stream passes **under** the walkway (a screen strip in a
floor gap at x 6.2, z ∈ [−0.8, 0.8], with water motion). Three shallow niches on the +z side at x 6.4,
7.2, 8.0: two hold the coffee and snack robots, status rings glowing; the third is empty (its robot is in
the room, watching Arif). Seen only through the opened right door in `rightDoor` and `reopen`.

### 2.3 The archive — behind the left door, x −5.3 … −60 (fog beyond)

- A hall far beyond human scale: floor y 0, ceiling lost in haze at ~14 m. Concrete floor, brushed steel
  shelving. Cool white light from long ceiling bands; depth fog from x −25.
- **Main aisle** along −x, z ∈ [−1.6, 1.6], from the door to the core.
- **Shelf rows** perpendicular to the aisle on both sides, centered at x = −8 − 2.6k (k 0…13, i.e.
  −8 … −41.8), each 1.4 m thick, 9 m tall, running from z ±1.6 to z ±15.6, with catwalks at y 4 and 8.
  Side corridors between rows are 1.2 m wide ("like library aisles"). Shelves hold **data carriers**:
  slim dark cartridges 0.3 × 0.04 × 0.22 m with a pale label strip and a tiny white status pixel
  (instanced, thousands). The row ends facing the aisle are shelved too.
- **Category plates.** At each row's aisle end, hanging at y 3.0, 1.2 × 0.4 m, off-white enamel with black
  Turkish caps, **facing +x** (readable head-on while travelling down the aisle), centered at
  (x_row + 0.72, 3.0, ±2.4): SAVAŞ, EKONOMİ, İNANÇ, GÖÇ, BİLİM, ÇÖKÜŞ, TOPARLANMA, KİTAPLAR, FİLMLER,
  BİYOGRAFİLER, OLAYLAR, HABERLER (cycle them). Row k 5 (x −21.0), +z side, reads **ODA** at
  (−20.3, 3.0, 2.4) (discovery `room-row`).
- **Empty run.** In the side corridor between rows k 6 (x −23.6) and k 7 (x −26.2) — corridor center
  x −24.9 — on row k 6's −x face (x −24.3): z 5.5–7.5, y 1.2–3.2, labels in place, no carriers
  (discovery `erased`, center (−24.3, 2.2, 6.5)).
- **The switch.** Just inside, on the archive side of the door wall, to the right of a person entering
  (entering faces −x, so right is −z): heavy lever switch on a steel plate at (−5.7, 1.3, −1.25); lever
  0.5 m, up = off, down = on.
- **The core** ("the computer's brain"): at the end of the aisle, center (−52, 0, 0). A round chamber,
  radius 7 m: twelve black server columns 11 m tall in a ring around a dark circular well (Ø 4 m). A soft
  white band of light travels slowly down all columns together (idle, ~6 s period). Low mechanical hum.
  **Not** a glowing brain, no hologram.

### 2.4 The city square — x 300

A procedural European-ish square seen from the mouth of a street. Open paved area x ∈ [282, 318],
z ∈ [−18, 10]. **Clock tower** at the back, base 5 × 5 m centered (300, 0, −20), 22 m tall; clock face
Ø 2.2 m at y 15 on its +z face. **Fountain** (basin Ø 5) at (300, 0, −4). **Bank** on the left: facade
along x 282 facing +x, z −14 … −2, wide steps, door at (283, 0, −8). **Tram rails** along x at z 2. Low
facades close the sides and the back.

The **street** enters the square from the front: x ∈ [297, 303], z ∈ [10.3, 24], with 1.2 m sidewalks.
The **corner bakery** is the right-hand corner building: a chamfered corner entrance facing the camera
diagonally at (303.0, 0, 10.3) — door, small shop window, sign board above at y 3.2 — its long shopfront
continuing along z 10.3 into the square. On the right sidewalk in front of it, a **street clock** on a
cast-iron post at (302.2, 0, 11.4), double-faced clock (Ø 0.6) at y 3.0 facing ±z.

**Locked camera** for all nine eras: (300, 1.7, 16) → target (300, 6, −12), vfov 42 — the bakery corner
and the street clock at the right edge, the bank at the left, fountain center, tower at the back (its top
just inside the frame). The reader may still look around. Era states are in 3.5.

### 2.5 The network void — x 600

Near-black space. Nodes: small off-white spheres (Ø 0.08–0.15); links: thin grey lines (opacity 0.25,
the newest link brighter for a moment). The **helix**: axis (600, y, 0), radius 6 m, 1.25 m rise per
turn, 12 turns from 1914 (y 0) to **today** (y 15, this evening). It is not uniform in time: its turns are
periods, and events of the same kind sit at the same angle (wars at 90°, crises at 180°, rebuilding at
270°), so they stack when seen from above. Today's node is at angle 0: (606, 15, 0). Year labels
(1914 … 2047) float beside the main nodes (scene-drawn). The **anomaly node** appears in `anomaly`
directly above the helix's end, at (606, 15.6, 0): connected to nothing, pale red, a small blinking
cursor mark beside it — from above it sits exactly on today.

### 2.6 Cast

- **ARİF** — male, height factor 1.0, about 45. Short dark hair greying at the temples, light stubble,
  thin round glasses (askew on his nose until `wake`). **Before** the right door: worn dark-olive
  cardigan over a grey T-shirt, dark trousers, grey socks, no shoes. **After** (`reopen` onward): clean
  off-white shirt, sleeves rolled, charcoal trousers, hair damp and combed back. In `again` and after:
  the cardigan again: the 05:12 sleeper in the feed and in `again` wears it too — the room has started
  over. Habit: drums two fingers on the desk while whistling (`whistle`).
- **ROBOT 1 · KAHVE** — 0.95 m, cylinder body Ø 0.38, matte warm grey, a round tray on top (Ø 0.42) that
  can rise 0.25 m and tilt; on it a small white coffee set (pot, cup on saucer). White status ring at the
  base. Glides; never bumps.
- **ROBOT 2 · ATIŞTIRMALIK** — same body, 0.9 m, tray with a small bowl of nuts and a plate of dried
  fruit. Arif never touches it.
- **ROBOT 3 · KAYIT** — same base, no tray: a slim 0.15 m neck and a small head with a single round lens
  (Ø 6 cm, lens center at y 0.95) and a tiny white light at the lens rim that never goes out. **Its head
  always turns to keep Arif centered** (track his head every frame) — until `turn`, where it turns away
  from him toward the camera. It is **in the room from the very first frame**, standing still at its
  stop while Arif sleeps — never mentioned until RUTİN, never hidden either. It follows him at ~2.5 m
  wherever he goes (through the right door too, and to the archive door) and returns to its stop.
  From its stop the lens sees Arif in 3/4 from his left-front, the desk, the coffee robot and the right
  door: that position is `RECORDER_LENS` (pos (−3.2, 0.95, 0.35), rest aim (0.1, 0.95, 0.9)) and it is the
  position of **every record** (the 05:12 feed, `thousands`, the five records, `again`). The lens may
  pan and zoom; its position never changes.
- **Square crowds** (TARİH/ÖRÜNTÜ): generic simple figures, era-tinted clothes; never close enough for
  faces.

---

## 3. Segment table

`@` = start in screens from the top; `u` = local 0–1 progress in the segment. Text items list their
from–to (fractions of the segment) and what the image shows at that moment. Total **114.9 screens**,
`SCREEN_VH = 80`.

### 01 — UYANIŞ (20.5 sc)

**`black` 1.3 @0.0 · room** — the room's day begins before nature.
- Action: u 0–0.3 full black. u 0.3 a relay click; a hairline of light runs along the floor edge of all
  four walls. u 0.4–0.9 the 20 wall panels switch on **one by one to flat warm grey** (light first, no
  image yet) — the silhouette of a square room, a desk, a slumped man and, at the left, a small robot
  standing still. u 0.9–1.0 the forest begins to paint in from the floor up (stream first).
- Camera: high corner (−4.2, 3.6, 4.4) → target (0.4, 0.9, −0.2), vfov 50, static, very slow push (0.3 m).
- Sound: relay click (u 0.3), mains hum rises, stream fades in at u 0.75.
- Text: `opening` (center, −1–0.92) "Arif’in odasında gün, doğadan önce başlıyordu." → black, then panels
  lighting up before any forest exists on them.

**`asleep` 2.5 @1.3 · room** — paranoid sleep.
- Action: Arif slumped forward in the chair, head on the desk (left cheek down, face turned toward −x),
  glasses askew; both arms hang straight down beside the chair; shallow, uneven breathing (shoulders).
  A thin line of drool from his mouth touches the glass. From u 0.3, with each breath the touch surface
  under his cheek opens and closes a small pale window.
- Camera: u 0–0.6 slow dolly along his hanging **left** arm up to his face: (−1.4, 1.05, 1.6) →
  (−0.8, 0.95, 0.65), target (0.05, 0.86, 0.42), vfov 35. u 0.6–1.0 macro push to the drool on the glass:
  (−0.45, 0.86, 0.5) → target (−0.12, 0.77, 0.42), vfov 28.
- Light: late-afternoon forest light from the walls, warm desk strip from below.
- Sound: uneven breath, stream, room tone.
- Text: `paranoid` (0.03–0.58) → the hanging arm, then the head on the desk, glasses askew (line 2 at
  ~0.26 on the head and both arms). `drool` (0.62–1.0) → the drool touching the glass.

**`desk` 2.4 @3.8 · room** — the desk as a computer room.
- Action: still asleep; the three giant screens are off (black glass reflecting the forest). u 0.6–1.0
  the window under his cheek opens with every breath, small glyphs scroll in it.
- Camera: u 0–0.6 rising over his shoulder: (0.9, 1.4, 2.0) → (0.6, 1.8, 1.7), target (0, 1.45, −0.6),
  vfov 46 — the three screens span the frame, his head small at the bottom. u 0.62 cut: top-down onto the
  glass under his cheek: (−0.3, 1.5, 0.45) → target (−0.12, 0.77, 0.32), vfov 34.
- Sound: soft touch-UI ticks at u 0.66.
- Text: `screens` (0.04–0.6) → the three dark screens, wide. `working` (0.64–1.03) → the window opening
  under his cheek.

**`walls` 2.4 @6.2 · room** — the forest that is a wall.
- Action: Arif asleep (breathing). The forest is alive: leaves move, light shafts drift, the stream flows.
- Camera: crane up and back from the desk to the opposite high corner: (0.5, 1.6, 2.6) → (−3.4, 3.4, 4.3),
  target (0.5, 1.6, −5), vfov 55. The reader is invited to look around (360°).
- Sound: stream, wind in leaves, a distant bird.
- Text: `walls` (0.04–0.56) → the reveal of four walls of forest. `real` (0.6–1.03) → the stream across the
  front wall, wide and convincing.

**`stream` 1.6 @8.6 · room** — the seam.
- Action: none from Arif. The stream on the front wall; at x 1.0 a panel seam crosses the water — the
  water slips by one pixel where two panels meet.
- Camera: low, near the front wall: (1.7, 0.5, −3.1) → (1.3, 0.48, −3.9), target (1.0, 0.45, −5), vfov 40,
  slow push toward the seam.
- Text: `not-real` (0.06–1.02) → line 1 on the beautiful water; line 2 (~0.43) as the seam becomes
  visible.

**`doors` 2.2 @10.2 · room** — two doors facing each other.
- Camera: u 0–0.48 from (0, 1.7, 3.9), vfov 55, a slow pan from the right door (target (5, 1.4, 0)) across
  Arif asleep at the desk (target (0, 1.2, −1)) to the left door (target (−5, 1.4, 0)) — both doors read
  as the middles of opposite walls. u 0.5–1.0 push toward the left door: (−2.2, 1.6, 1.6) → target
  (−5, 1.5, 0), vfov 40 — concrete jambs, bolts, the heavy handle.
- Text: `square` (0.04–0.46) → the pan from door to door. `brutal` (0.5–1.02) → the left door's frame in
  close-up; line 2 "Kapı oldukları belliydi." (~0.72) on the handle.

**`ceiling` 2.3 @12.4 · room** — the sky that keeps the time.
- Action: ceiling time-lapse hint: clouds drift faster than real, the sun disc slides lower and warmer
  (u 0.4–1.0). The hooked cloud is clearly in frame.
- Camera: (0, 1.5, 2.4) tilting up to target (0, 4.6, −1), vfov 60.
- Text: `sky` (0.03–0.42) → clouds and soft sun. `season` (0.46–1.02) → the sun moving, light warming.

**`wake` 1.9 @14.7 · room** — glasses, eyes.
- Action: u 0.05–0.4 his hanging **right** arm rises from beside the chair; two fingers push the glasses
  straight on his nose (his head still on the desk). u 0.45–0.6 eyes open slowly. u 0.62–0.8 he
  straightens up (chair creaks). u 0.8–1.0 both hands to his face, rubbing.
- Camera: 3/4 from his left-front: (−1.6, 1.2, 0.2) → target (0, 1.05, 0.85), vfov 38; tiny push.
- Text: `glasses` (0.03–0.5) → the arm rising, the glasses fixed. `eyes` (0.54–1.02) → eyes open,
  straightening, rubbing the face.

**`wipe` 2.0 @16.6 · room** — cleaning.
- Action: u 0.05–0.4 the back of his hand wipes the drool off his cheek. u 0.5–0.65 bends, takes the cloth
  from under the seat; u 0.65–0.95 wipes the glass where his cheek was (the small windows close under the
  cloth).
- Camera: same angle, wider: (−1.9, 1.3, 0.45) → target (0, 0.95, 0.7), vfov 42.
- Text: `cheek` (0.03–0.47) → the hand wiping the cheek. `cloth` (0.51–1.02) → cloth out, desk wiped.

**`throw` 1.9 @18.6 · room** — a three-pointer.
- Action: u 0.1–0.25 he balls the cloth and, **without looking** (eyes on the dark center screen), throws
  it in a high arc toward the front-right corner; u 0.25–0.48 the cloth flies; u 0.48 it drops into the box.
- Camera: u 0–0.25 (−1.5, 1.4, 2.4) → target (0, 1.2, 1.0), vfov 45; u 0.25–0.48 the camera stays put and
  pans with the arc to the box (4.3, 0.45, −4.3); u 0.5–0.75 slow push toward the box to (1.6, 1.5, −1.0)
  (the box full of identical cloths readable, ~4 m away); u 0.75–1.0 pull up and back to (−1.0, 3.0, 2.8),
  target (1.5, 0.6, −2.0): the box sits exactly where the arc ends, Arif small at the desk.
- Sound: soft cloth landing (u 0.48).
- Text: `throw` (0.03–0.5) → the throw and the flight. `placed` (0.55–1.02) → the box at the end of the arc,
  then the room.

### 02 — DIŞARISI (11.1 sc)

**`rise` 1.3 @20.5 · room**
- Action: u 0.15–0.45 he stands, pushes the chair back; u 0.6–1.0 steps around the desk toward the right.
  The recorder robot leaves its stop and follows at ~2.5 m, head tracking him (never commented on).
- Camera: wide from the front-left corner: (−4.2, 2.2, −4.2) → target (0.4, 1.0, 0.6), vfov 45 — the desk
  dead center of the square.
- Light: the ceiling sun touches the horizon (sunset begins).
- Text: `stood` (0.05–0.98) → standing; line 2 (~0.44) on the wide shot of the desk in the exact center.

**`walk` 2.5 @21.8 · room** — heavy steps; dusk.
- Action: walks slowly along (0.4, 0, 1.4) → (2.2, 0, 1.2) → (3.4, 0, 0.8), heavy steps, not looking where
  he goes. Ceiling: sunset → dusk; wall forest amber → blue-grey.
- Camera: side tracking at 1.3 m: (1.0, 1.3, 2.8) → (3.0, 1.3, 2.3), target following his chest; vfov 45.
- Sound: wood creaks under the steps.
- Text: `heavy` (0.03–0.4) → walking. `dusk` (0.44–1.02) → the light visibly cooling; line 2 (~0.68) as blue
  hour starts on the ceiling.

**`floor` 1.4 @24.3 · room** — the tree house.
- Action: he walks (3.4, 0, 0.8) → (4.35, 0, 0.3) (u 0–0.7) and stops facing the door.
- Camera: very low, along the planks: (2.4, 0.22, 2.1) → (2.9, 0.22, 1.9), target (5, 0.45, 0.9), vfov 52.
  His feet cross the frame at u 0.2–0.6. The planks run straight into the forest of the wall — no visible
  wall.
- Text: `treehouse` (0.05–1.0) → planks running into the forest.

**`rightDoor` 2.6 @25.7 · room → walkway**
- Action: u 0.08–0.25 reaches for the steel handle; u 0.25–0.55 pulls; the leaf swings **outward** slowly:
  the walkway, close ferns, the stream under the planks, two robots in their niches with glowing rings,
  the third niche empty (u 0.45). u 0.55–0.83 he stands on the threshold, head slightly lowered —
  listening. u 0.85–0.95 steps through, the recorder gliding in after him; u 0.97 the door closes behind
  them.
- Camera: behind him: (2.6, 1.6, 0.95) → target (5.6, 1.4, 0), vfov 42; at u 0.55 slow push to (3.2, 1.6, 0.7).
- Sound: handle (u 0.15), the stream suddenly closer and louder through the doorway (u 0.4), door shuts
  (u 0.97).
- Text: `handle` (0.03–0.5) → hand on handle; line 2 (~0.24) as the door opens on the forest that seems to
  go on. `same-stream` (0.55–1.1) → him on the threshold, listening; line 2 "İçeri girdi ve kapıyı
  kapattı." (~0.85) as he steps through and the door shuts.

**`forty` 3.3 @28.3 · room (empty)** — forty minutes.
- Action: the room is empty — not even the recorder; time-lapse 18:15 → 18:55. Ceiling: dusk → night
  (stars, a faint moon). The chair is still pushed back; the cloth is in the box. At u 0.38 a **drizzle**
  starts on the wall screens (thin streaks, the stream's surface pocked). At u 0.6–0.72 a thin bright
  **scan line** sweeps up all wall panels from floor to top; behind it the forest is redrawn **slightly
  differently** (a branch moved, a rock shifted, ferns denser).
- Camera: the **opening corner** again: (−4.2, 3.6, 4.4) → target (0.5, 1.0, −0.5), vfov 50, static.
- Sound: forest, then drizzle (u 0.38); a low electrical hum during the scan line.
- Text: `nobody` (0.1–0.37) → the closed right door, the empty room, the forest playing. `drizzle`
  (0.41–0.69) → rain on the walls. `different` (0.73–1.02) → right after the scan line: the redrawn forest.

### 03 — RUTİN (11.4 sc)

**`reopen` 2.0 @31.6 · room**
- Action: u 0.1–0.3 the right door opens; u 0.3–0.55 Arif steps in, changed (off-white shirt, damp hair);
  u 0.55–1.0 the three robots glide out after him in a line: coffee, snacks, recorder.
- Camera: (2.0, 1.4, 2.3) → target (5, 1.3, 0), vfov 42.
- Sound: door, small wheels on wood.
- Text: `forty-min` (0.03–0.47) → the door opening. `changed` (0.51–1.02) → Arif in new clothes, hair wet;
  line 2 (~0.72) on the robots emerging.

**`robots` 1.9 @33.6 · room** — three trays, one lens.
- Action: Arif walks to the desk; the robots head for their stops.
- Camera: low tracking at robot height: (3.0, 0.6, 1.9) → (1.4, 0.6, 2.6), target the robots, vfov 45.
  u 0.55 the third robot passes close: no tray, only the lens — and its head turns to keep Arif in view.
  Ahead of them, the worn circles in the planks.
- Text: `trays` (0.03–0.5) → coffee set, snacks. `third` (0.54–1.02) → the third robot, empty, its lens
  turning.

**`sits` 1.6 @35.5 · room**
- Action: u 0.1–0.4 Arif sits. u 0.2–0.5 the coffee and snack robots roll onto their worn marks. u 0.4–0.75
  the recorder rolls to its stop (−3.2, 0, 0.35) and stops, lens on him.
- Camera: wide (−2.6, 1.8, 3.5) → target (0, 0.9, 0.5), vfov 48.
- Text: `sat` (0.05–1.0) → sitting; line 2 (~0.45) as the third robot stops apart, lens on him.

**`reach` 1.9 @37.1 · room** — the hand into empty space.
- Action: u 0.05–0.25 his right hand goes out into empty air to his right, palm up, **eyes on the dark
  center screen**; u 0.2–0.4 the coffee robot glides forward, tray rises, pushes the cup into the hand
  (u 0.42); u 0.6–0.9 he brings it to his lips, still not looking.
- Camera: (2.0, 1.2, 2.4) → target (0.6, 1.0, 1.2), vfov 35.
- Sound: porcelain (u 0.4).
- Text: `hand` (0.03–0.5) → hand out, robot arriving, cup in hand. `not-looking` (0.55–1.02) → the cup to
  his lips, his eyes on the dark screen.

**`sip` 1.9 @39.0 · room** — the catch.
- Action: u 0.1–0.25 one sip; u 0.25–0.4 he holds the cup out to the same empty place; u 0.42 lets go.
  u 0.42–0.48 the cup falls 4 cm; the tray rises and catches it (soft click at u 0.46) — time-stretched
  (slow-motion feel).
- Camera: same as `reach`, slightly closer: (1.7, 1.1, 2.1), vfov 32.
- Text: `sip` (0.03–0.5) → the sip, the cup held out, released. `caught` (0.54–1.02) → the tray holding the
  cup, steady.

**`thousands` 2.1 @40.9 · room (recorder POV)**
- Action: u 0.05–0.45 Arif reaches into the empty air again without looking, takes the cup, sips; u 0.5
  holds it out, lets go; u 0.55 the robot catches it — **identical** motion. A faint ghost of the previous
  catch (from `sip`) lies over it for a moment (memory motif, opacity ≤ 0.25, no glitch).
- Camera: **`RECORDER_LENS`**: (−3.2, 0.95, 0.35) → target (0.1, 0.95, 0.9), vfov 32, slight vignette. The
  first time we see the recorder's framing.
- Sound: one sustained music note under the whole segment; the same soft click (u 0.55).
- Text: `thousands` (0.04–1.02) → line 1 "Bazı hareketleri düşünmeden yaparsınız." on the blind reach;
  line 2 "Çünkü onları daha önce binlerce kez yapmışsınızdır." (~0.53) on the catch and its ghost.

### 04 — ARŞİV (15.6 sc)

**`hover` 1.9 @43.0 · room**
- Action: u 0.1–0.45 his index finger descends toward the black button; u 0.48 stops 1 cm above it.
  u 0.55–0.7 the hand withdraws; he looks left, toward the left door. u 0.75–1.0 stands.
- Camera: CU on the button: (0.35, 1.05, 0.15) → target (0, 0.79, −0.32), vfov 30; at u 0.75 tilt up with
  him standing. **This framing returns in `back`/`press`.**
- Text: `button` (0.03–0.5) → the finger descending. `stopped` (0.54–1.02) → the finger stops; he stands.

**`toLeft` 1.2 @44.9 · room**
- Action: walks (−0.4, 0, 1.4) → (−2.2, 0, 1.2) → (−4.4, 0, −0.2); the recorder follows at 2.5 m.
- Camera: behind him: (−0.5, 1.6, 1.8) → (−2.6, 1.6, 0.9), target (−5, 1.4, 0), vfov 45.
- Text: `fear` (0.05–1.02) → walking toward the heavy door.

**`leftDoor` 1.9 @46.1 · room → archive**
- Action: u 0.05–0.35 hand on the handle; u 0.35–0.95 the leaf swings outward very slowly; cold white light
  spills across him and the planks; a deep hum.
- Camera: (−3.2, 1.5, 1.3) → target (−5.6, 1.4, 0), vfov 42.
- Text: `slowly` (0.03–0.49) → the hand, the first gap of white light. `forgets` (0.53–1.03) → the door half
  open, his silhouette against the light.

**`deep` 2.0 @48.0 · archive** — the reveal.
- Action: Arif stays on the threshold at (−4.6, 0, −0.3), by the handle side (back to camera at first,
  then left behind).
- Camera: flies past his shoulder through the doorway (at x −5 it is at y ≈ 1.7, z ≈ 0.4 — inside the
  opening, clear of the leaf) and on: (−4.4, 1.6, 0.4) → (−14, 3.5, 0), target (−40, 3, 0), vfov 55.
  Shelves rise on both sides, rows repeat into fog; the first plates pass overhead.
- Text: `machine` (0.04–0.48) → crossing the threshold into the hall. `believed` (0.53–1.02) → the endless
  rows (keep Arif small at frame bottom-left while visible).

**`aisles` 2.9 @50.0 · archive**
- Camera: u 0–0.55 glides along the main aisle: (−14, 3.5, 0) → (−22, 2.4, 0), target (−40, 3, 0), vfov 50
  — plates pass head-on: SAVAŞ, EKONOMİ, İNANÇ, GÖÇ, BİLİM, ÇÖKÜŞ, TOPARLANMA, KİTAPLAR, FİLMLER,
  BİYOGRAFİLER… and, at frame right early on, ODA. u 0.55–0.75 turns into the side corridor between rows
  k 6 and k 7: → (−24.9, 2.0, 2.4), target swinging to (−24.9, 1.8, 14). u 0.75–1.0 creeps down the
  corridor to (−24.9, 1.9, 4.2): carriers in close-up, label strips, status pixels — and, on the left,
  the empty run.
- Text: `vast` (0.03–0.5) → the long aisle, shelves like a library. `categories` (0.54–1.02) → the plates,
  then the carriers up close.

**`core` 2.0 @52.9 · archive** — the brain.
- Camera: back on the main aisle near its end: (−34, 3.0, 0) → (−42, 4.0, 0), target (−52, 5, 0), vfov 45;
  the ring of columns with the slow white band descending.
- Sound: deep machine hum.
- Text: `brain` (0.03–0.5) → the core revealed. `all-history` (0.55–1.02) → wide: core + the archive behind.

**`lever` 2.2 @54.9 · archive (door)**
- Action: u 0.05–0.25 Arif steps inside; u 0.25–0.38 reaches the switch on his right; u 0.38–0.45 pulls it
  down (clunk). u 0.45–1.0 lights come on row by row from near to far, warmer white, all the way to the
  core; the core's band brightens once.
- Camera: inside looking back at the door: (−8, 1.6, −0.8) → target (−5.7, 1.3, −1.0), vfov 45; at u 0.45
  turn 180° to look down the aisle as the cascade runs: target (−52, 3, 0).
- Sound: lever clunk, relays clicking in sequence into the distance.
- Text: `switch` (0.03–0.44) → stepping in, the switch pulled. `duty` (0.48–1.02) → the cascade of light.

**`whistle` 1.5 @57.1 · room**
- Action: walks back from the switch to the chair (−5.7, 0, −0.9) → (−4.4, 0, −0.2) → (−2.2, 0, 1.2) →
  (0, 0, 1.15),
  whistling a rhythm, shoulders bobbing; taps two fingers on the desk; sits (u 0.8). The recorder returns
  to its stop. **The left door stays open**; a long strip of white archive light lies across the planks
  for the rest of the story.
- Camera: (−2.0, 1.5, 2.7) → target (−0.6, 1.1, 0.9), vfov 45 — the open door bright behind him.
- Sound: whistling.
- Text: `whistle` (0.04–1.02) → walk and whistle; line 2 (~0.53) on the open door behind him.

### 05 — TARİH (8.1 sc)

**`red` 2.0 @58.6 · room**
- Action: u 0.08–0.3 the button's ring goes from black to deep red. u 0.5–1.0 the three screens wake:
  thousands of tiny thumbnails (photos, documents, front pages) stream in and sort into columns.
- Camera: u 0–0.5 CU on the button (the `hover` framing); u 0.5 cut to his face lit red from below and by
  the screens: (−1.3, 1.25, 0.1) → target (0, 1.15, 0.9), vfov 38.
- Sound: one low beep (u 0.12), soft data patter; a sparse piano motif begins (u 0.55).
- Text: `red` (0.03–0.48) → the ring turning red. `sorting` (0.53–1.04) → screens sorting thumbnails.

**`dive` 0.9 @60.6 · room → square**
- Camera: push into the center screen: (0, 1.55, 0.9) → (0, 1.58, −0.55), vfov 40, over Arif's head; one
  thumbnail grows to fill it — a photograph of the square — and the frame becomes the 3D square (match
  cut to the locked square camera).
- Text: none (image only).

**`history` 5.2 @61.5 · square** — the same square, five eras (each 0.2 of the segment, see `eraAt`).
- Camera: **locked** (300, 1.7, 16) → (300, 6, −12), vfov 42 (no drift). Eras crossfade over 0.03 at each
  boundary with a brief ghost of the previous era (≤ 0.3 opacity).
- Era states: table 3.5 (1914, 1917, 1931, 1944, 1962).
- Text: years in the caption slot (`year-1914`…`year-1962`, each era's own fifth). `by-heart` (0.02–0.195)
  → 1914: tower, fountain, bakery corner all visible. `same-place` (0.215–0.395) → 1917: the same frame
  now smoke and an empty square. `fear-names` (0.415–0.595) → 1931: the queue on the bank's steps.
  `clock` (0.615–0.795) → 1944: the tower's top third gone, its clock face cracked and stopped at
  **5:12**. `first-time` (0.815–1.03) → 1962: scaffolding, the clock repaired, people back.

### 06 — ÖRÜNTÜ (11.1 sc)

**`repeat` 3.6 @66.7 · square** — four more eras (each 0.25).
- Same locked camera. 1991 YENİ ÇATIŞMA, 2008 YENİ KRİZ, 2029, 2041 (3.5).
- Sound: the same far siren as 1917 at the start of 1991.
- Text: years in the caption slot. `buildings` (0.05–0.3) → 1991: new facades, barricades. `people`
  (0.35–0.6) → 2008: different clothes, umbrellas, **the same queue shape** at the same bank door.
  `story` (0.66–1.02) → 2029, then 2041: glass facades, then smoke behind the tower exactly where it was in
  1917.

**`network` 2.8 @70.3 · square → void**
- Action: u 0–0.3 the square dissolves into points — every person, vehicle, window becomes a node; nodes
  lift away; links draw between nodes of different years (1931 ↔ 2008, 1917 ↔ 2041 …). u 0.3–1.0 the
  network grows, unhurried. u 0.72 a few nodes flicker out and leave a gap.
- Camera: from the square's framing, pull back into the void: (600, 6, 22) → (600, 8, 14), target
  (600, 7, 0), vfov 50.
- Sound: low regular pulses, one per new link.
- Text: `network` (0.03–0.5) → the dissolve and first links. `deleted` (0.54–1.02) → a dense, still-growing
  web; line 2 (~0.74) as the nodes go out (only deletion makes it forget).

**`spiral` 2.5 @73.1 · void**
- Action: nodes gather into the helix (1914 at the bottom, today at the top); year labels appear beside
  the main nodes.
- Camera: slow orbit: (614, 9, 14) → (600, 12, 18), target (600, 7.5, 0), vfov 45.
- Text: `purpose` (0.03–0.44) → the helix forming. `periods` (0.49–1.02) → turns stacking; the war nodes
  (1917, 1944, 1991, 2041) visibly at the same angle.

**`above` 2.2 @75.6 · void**
- Camera: rises to top-down: (600, 34, 0.01) → target (600, 0, 0), vfov 35. Every turn collapses onto
  **one circle**; the war/crisis nodes stack into single bright points.
- Text: `loop` (0.03–0.44) → the circle closing. `order` (0.48–1.02) → the perfect circle, still.

### 07 — ANOMALİ (10.0 sc)

**`beyond` 1.6 @77.8 · void**
- Action: the top view holds, then u 0.45 the topmost node (today) pulses once. u 0.6 the camera tilts down
  to a side view: the helix ends at y 15. The piano motif stops (u 0.1).
- Camera: (600, 34, 0.01) → (612, 15, 12), target (602, 14, 0), vfov 40.
- Text: `today` (0.05–0.98) → the top of the spiral; line 2 (~0.44) on the topmost node pulsing (this
  evening).

**`anomaly` 1.9 @79.4 · void**
- Action: u 0.1 a new node blinks into existence just above the helix's end, at (606, 15.6, 0): pale
  **red**, connected to nothing, a small cursor mark blinking beside it.
- Camera: (612, 15.5, 10) → target (606, 15.4, 0), slow push, vfov 35.
- Sound: one low warning tone (u 0.1).
- Text: `anomaly` (top, DOM, 0.1–1.0) "ANOMALY". `one-more` (0.03–0.48) → the node appearing.
  `error` (0.53–1.02) → the cursor blinking beside it.

**`checked` 2.1 @81.3 · room**
- Action: Arif leans in. The right screen shows two lines (world text `dates`, white on black, mono):
  "TODAY 11.03.2047" and "RECORD 12.03.2047 · 05:12" (resolve with `resolveTokens(…, iteration)`).
  u 0.56 he sits back slowly.
- Camera: u 0–0.22 his face (−1.3, 1.25, 0.1) → target (0, 1.15, 0.9), vfov 38; u 0.22–0.56 insert on the
  right screen: (1.3, 1.6, 0.85) → target (2.15, 1.6, −0.25), vfov 30; u 0.56–1.0 back to his face.
- Text: `checked` (0.03–0.54) → his face, then (line 2, ~0.24) the insert of the two dates.
  `impossible` (ARİF, 0.58–1.02) → his face.

**`feed` 2.2 @83.4 · room → the record**
- Action: u 0–0.25 he opens the record; the center screen plays it; the camera pushes into the screen.
  From u 0.25 the frame **is** the record: the room at 05:12 (pre-dawn blue, ceiling dark with a thin
  dawn line, drizzle stopped), from **`RECORDER_LENS`**. u 0.25–0.55 wide (lens aim (3.3, 0.85, 0.27),
  vfov 55): the cloth box in its corner, the desk, the coffee and snack robots on their marks behind the
  chair (rings dim), the right door, and a man asleep at the desk — in the **olive cardigan** of the
  first evening, not the shirt Arif is wearing now (a quiet wrongness; never mentioned). u 0.55–1.0 a slow lens zoom to the
  sleeper (aim (0.1, 0.95, 0.9), vfov 34): head on the desk, both arms hanging, glasses askew. A small
  timecode label in the frame's **top-right** corner (world text `subject`: "SUBJECT · 12.03.2047 ·
  05:12"), slight vignette, no VHS look. The recorder itself is **not** in the frame (it is the camera).
- Camera: (0, 1.55, 0.9) → (0, 1.58, −0.55) push (u 0–0.25), then the record framing as above.
- Sound: the recording's own room tone: stream, hum, a slower breath.
- Text: `details` (0.03–0.46) → the push into the screen, then the room wide: box, robots behind the chair.
  `sleeper` (0.51–1.02) → the zoom to the man asleep (same pose as `asleep`).

**`feedWide` 2.2 @85.6 · record → room**
- Action: u 0–0.48 the record holds on the sleeper. u 0.5 cut to the present room, night: from behind
  Arif, toward the recorder; u 0.6–0.75 he turns his head to the third robot, standing exactly where the
  record was shot from, lens on him, white rim light on.
- Camera: u 0–0.48 record framing (vfov 34 → 30); u 0.5–1.0 (0.6, 1.5, 2.2) → target (−3.2, 0.9, 0.35),
  vfov 40.
- Text: `unlived` (0.04–0.5) → the record, still. `lens` (0.54–1.02) → Arif turning; line 2 "Merceği yine
  ona dönüktü." (~0.74) on the robot and its lens.

### 08 — TEKERRÜR (8.7 sc) — the HUD is quiet from `back` to the word

**`back` 1.5 @87.8 · room**
- Action: the red ring glows; his hand comes into frame at u 0.5 and hovers.
- Camera: **the `hover` framing exactly**: (0.35, 1.05, 0.15) → target (0, 0.79, −0.32), vfov 30.
- Text: `still-red` (0.05–0.98) → the red ring; line 2 (~0.44) as his hand enters.

**`press` 1.7 @89.3 · room**
- Action: u 0–0.25 the finger descends; u 0.28 it passes the point where it stopped before — and does
  **not** stop; u 0.32 presses (click). u 0.4–0.75 everything goes black in sequence: the three desk
  screens, then the wall panels one by one (the forest gone), then the ceiling (the sky gone). u 0.75–0.95
  only the red ring remains, fading to nothing.
- Camera: static CU (the `hover` framing) to u 0.4, then a cut to the opening high corner (−4.2, 3.6, 4.4)
  → target (0.4, 0.9, −0.2), vfov 50, to watch the room go out panel by panel; at u 0.75 back to the CU
  for the dying ring.
- Sound: click (u 0.32); the stream fades panel by panel; **all sound cut** at u 0.75: no stream, no hum.
- Text: `no-stop` (0.04–0.75) → line 1 on the finger not stopping; line 2 "Düğmeye bastı." (~0.32) on the
  click, then the blackout.

**`dark` 1.2 @91.0 · black**
- Total black, total silence.
- Text: `one-word` (0.25–1.02) → black.

**`word` 2.2 @92.2 · black room**
- Action: u 0.05 one relay click; the center desk screen shows a single thin horizontal line of light at
  its middle (a cursor). The DOM carries the word; the set must **not** draw the word (only the line).
  u 0.62–1.0 the screens come back very dimly: no forest — black with a faint grey grid.
- Camera: frontal, static: (0, 1.5, 3.2) → target (0, 1.5, −0.6), vfov 40 (Arif a silhouette in the chair).
- Sound: relay click (u 0.05), then a low machine hum begins (u 0.65).
- Text: `word` (center, 0.08–0.58) "TEKERRÜR" → black, the thin line under it. `booted` (0.62–1.04) → the
  screens returning dimly. (The chapter label "08 TEKERRÜR" appears only after the word.)

**`law` 2.1 @94.4 · room**
- Action: on all four walls, faint white on black: the spiral seen from above — **one circle**. Arif's face
  lit by it.
- Camera: (−1.0, 1.3, 0.25) → target (0, 1.15, 0.9), vfov 40, then a slow pull back to (−2.5, 1.8, 3.0) to
  show the circle repeated on all four walls around him.
- Text: `not-seeing` (center, 0.04–0.46) → his face. `resemblance` (center, 0.52–1.02) → the circles around
  him.

### 09 — GÖZLEMCİ (18.4 sc)

**`records` 5.4 @96.5 · records (the room, from `RECORDER_LENS`)** — use `recordAt(p)`.
- u 0–0.02: the center screen flashes and the frame is inside the first record (match cut). Five records,
  one per fifth, each a short loop of an earlier evening seen from the recorder's position, slight
  vignette, a small in-world timecode at the **top-right** (date `iterationDate(iteration + k)` and the
  time below; scene-drawn — the ITERATION labels are DOM `top` items `it0`…`it4`, **do not** draw them).
  Each record is identical to the original moment except one tiny thing (the hooked cloud a little
  shifted; the cup handle turned; one more cloth in the box).
  - k 0 (ITERATION {IT0}, 17:41): his arm rises and fixes the glasses (as `wake`). Lens aim
    (0.05, 1.0, 0.8), vfov 26.
  - k 1 ({IT1}, 17:46): the cloth's arc into the box (as `throw`). Aim (2.4, 0.9, −1.8), vfov 55 — desk and
    box corner both in frame.
  - k 2 ({IT2}, 19:20): the finger stopping above the black button (as `hover`). Aim (0, 0.85, −0.3), vfov 22.
  - k 3 ({IT3}, 19:03): the release and the catch (as `sip`). Aim (0.6, 1.0, 1.2), vfov 30.
  - k 4 ({IT4}, 18:02): the walk toward the right door (as `walk`). Aim (3.0, 1.1, 0.6), vfov 45.
- Sound: a soft "record start" tick at each record.
- Text: `opened` (0.02–0.19) → record 0. `wrong` (0.22–0.39) → record 1. `not-first` (0.42–0.59) → record 2.
  `same-room` "Aynı oda. Aynı robot." (0.62–0.79) → record 3, the robot catching the cup. `same-motion`
  "Aynı kapı. Aynı hareket." (0.82–0.99) → record 4, the walk to the door.

**`engine` 2.4 @101.9 · room, top-down**
- Action: the dark room from straight above (ceiling hidden — a cutaway): the desk at the center, Arif
  seated, still; the coffee and snack robots on their worn circles; the recorder at its stop; the strip of
  archive light from the open left door. The four walls show the faint circle (as in `law`).
- Camera: (0, 14, 0.01) → target (0, 0, 0), vfov 50, very slow rotation (10°).
- Text: `engine` (center, 0.03–0.6) PAST / PATTERN / SIMULATION / OBSERVATION / CORRECTION / REPEAT,
  arriving one by one. `believed-again` (0.64–1.02) "Arif, o düzeni çözmek için makineyi kullandığına
  inanıyordu." → the man in the middle of the board, alone, still.

**`again` 2.0 @104.3 · room** — the room starts over.
- Action: u 0–0.4 05:12, pre-dawn blue: Arif asleep at the desk **exactly as in the feed** (same frame,
  same pose, the two robots on their marks behind the chair). u 0.4–0.55 time-lapse: dawn → day →
  afternoon on the ceiling (sun arc), forest lightening; in it, the coffee and snack robots roll out
  through the right door (it opens and shuts by itself): the room is reset to its first frame. u 0.55–1.0
  quick replay of the waking (cardigan again): glasses fixed, drool wiped, cloth thrown — it drops into
  the box at u 0.9. The hooked cloud is back in its first-evening place.
- Camera: u 0–0.45 `RECORDER_LENS` with the feed's final zoom (aim (0.1, 0.95, 0.9), vfov 34); u 0.45–1.0
  the `throw` framing (−1.5, 1.4, 2.4) → target (0, 1.2, 1.0), vfov 45.
- Sound: the stream returns (u 0.55); cloth landing (u 0.9).
- Text: `asleep-again` (0.03–0.47) → the sleeping man, framed as in the feed. `again` (0.51–1.02) →
  glasses, then the cloth landing.

**`halt` 1.9 @106.3 · room**
- Action: u 0–0.5 he walks toward the right door on the `walk` path; u 0.52 at (2.2, 0, 1.2) — halfway —
  he **stops**. u 0.55–1.0 he stands still, weight shifting once. The recorder, following at 2.5 m, stops
  at (−0.3, 0, 1.9).
- Camera: like `walk`, but lower and tighter: (1.0, 1.15, 2.6) → (2.0, 1.15, 2.5), target following his
  chest, vfov 40.
- Sound: steps; they stop (u 0.48–0.52).
- Text: `walked` (0.03–0.5) → walking. `not-recorded` (0.54–1.02) → standing still, halfway.

**`turn` 1.5 @108.2 · room**
- Action: u 0.05–0.4 he turns back toward the desk and looks at the screens. u 0.45–0.75 the recorder's
  head turns **away from Arif** for the first time, until its lens points straight at the camera; the
  white rim light stays on.
- Camera: from behind the recorder: (−1.6, 1.3, 3.6) → (−1.4, 1.3, 3.3), target (0.6, 1.0, 0.5), vfov 40
  (the line of sight passes behind the chair; nothing between). The recorder in the foreground near
  frame center, 2 m away, at first showing the back of its head (lens on Arif); Arif right of center,
  ~4.5 m away, turning toward the desk; the desk and dark screens behind. Its head then swivels ~140°
  until the lens looks straight into the camera. From here on the lens keeps tracking the camera.
- Sound: a thin servo whir as the head turns (u 0.47).
- Text: `turned` (0.05–1.02) → line 1 on his turn; line 2 (~0.46) as the lens comes round to us.

**`observer` 2.0 @109.7 · room** — no music.
- Action: the center screen shows "OBSERVER DETECTED" (u 0.1) and below it "SCROLL INPUT" (u 0.5) (world
  text `detected`, white on black, small, centered). u 0–0.45 Arif looks at the screen. u 0.55–0.95 he
  slowly turns his head toward the camera — the side the screen is "looking" at.
- Camera: slow push (1.6, 1.45, 3.6) → (1.3, 1.4, 2.9), target (0.8, 1.35, −0.2), vfov 42: the screen near
  center, Arif at frame right. Calm; no shake, no glitch.
- Sound: only the machine hum; music silent.
- Text: `detected` (world). `looked` (0.48–1.02) → his head turning toward us.

**`maybe` 2.2 @111.7 · room → black**
- Action: the room goes dark slowly (u 0–0.8): walls, then ceiling, then the desk screen; the last visible
  thing is the recorder's small white rim light (u 0.8–1.0); then black.
- Camera: static on the frame of `observer`'s end, then a slow pan (u 0.5–0.8) left to find the rim light.
- Text: `future` (center, 0.04–0.47) → the room dimming, Arif still facing us. `remember` (center,
  0.53–1.02) → the white rim light alone in the dark.

**`end` 1.0 @113.9 · black**
- Black. Then a relay click, a machine hum, distant water; then silence.
- Text: `final` (center/final, 0.3 → end) "TEKERRÜR" · sub "SCROLL TO REPEAT". Scrolling past the end wraps
  to the next iteration (story `loops: true`): all `{IT…}`, `{TODAY}`, `{NEXT}` advance by one.

### 3.5 The square's eras (locked frame)

| Era | Light / weather | State |
|---|---|---|
| 1914 | clear morning sun | Crowd (20–30 figures), a tram on the rails, flags on the facades, the clock tower intact (≈ 09:40), the bakery with an awning, the street clock showing the same time. |
| 1917 SAVAŞ | overcast, smoke | Square nearly empty, a boxy military truck by the fountain, a smoke column behind the tower, shutters down. |
| 1931 KRİZ | grey winter | A long queue (12 figures) snaking down the bank's steps, shops shuttered, a few bare trees. |
| 1944 ENKAZ | dust haze, low sun | The tower's top third collapsed above the clock; **the clock face cracked but in place, hands at 5:12**; rubble mounds, the fountain cracked, no people. The bakery's shop window boarded but its **door intact**; the street clock leaning 8°, glass cracked, **stopped at 5:12**. |
| 1962 TOPARLANMA | bright noon | Scaffolding on the tower (repaired clock, ≈ 12:05), people back, a car, the bakery reopened with a new sign. |
| 1991 YENİ ÇATIŞMA | dusk, sodium lights | Barricades across the tram rails, broken windows, a burnt car, figures running far away. |
| 2008 YENİ KRİZ | rainy grey | Shops shuttered again; **the same queue shape** at the bank door, umbrellas. |
| 2029 | cool daylight | Glass facades, screens on two buildings, sparse crowd, the bakery still there (third sign). |
| 2041 | orange haze | Square half-empty, a fence, **smoke behind the tower in the 1917 position**. |

The bakery's door and the street clock post never change across the nine eras (only signs, paint and
the clock's time).

---

## 4. Choices

None (`CHOICES = []`). The story's interactivity is the scroll itself: the loop (`SCROLL TO REPEAT` wraps
into the next iteration with new numbers and dates), the 360° look-around, and the ending, where the
system detects an observer and names its input: the reader's scroll.

**Per-iteration variation (recommended).** On loops (`iteration > BASE_ITERATION`) change one tiny,
harmless detail per pass — the hooked cloud's position by iteration parity, one more cloth in the box,
the cup handle's angle — "Her sabah biraz farklı görünüyordu."

---

## 5. Discoveries

Seen within 14 m, examinable within 7 m of the camera (see `src/lib/discovery.ts`); positions below are
chosen for the cameras above.

| id | where (m) | when | why |
|---|---|---|---|
| `cheek-window` (visible, OKU) | (−0.15, 0.78, 0.3), the glass under his cheek | `asleep` 0.3 → `desk` 0.94 | The touch surface asks "Son kayıttan devam edilsin mi?" — the night is a continuation. |
| `seam` (subtle, BAK) | (1.0, 0.5, −4.98), panel seam on the stream | `stream` | The water slips one pixel at the seam: the outside is a screen. |
| `cloth-box` (subtle, BAK) | (4.3, 0.45, −4.3) | `throw` 0.45–1.0 (camera ~4 m away at u 0.5–0.75) | The box is full of identical cloths: one per evening, for a very long time. |
| `worn-floor` (subtle, BAK) | (−0.95, 0.01, 1.6), the snack robot's mark | `robots` 0.4 → `sits` 0.3 | A worn circle exactly where a robot is about to stop — it has stopped there thousands of times. |
| `recorder-lens` (visible, BAK) | (−3.2, 0.95, 0.35) | `sits` 0.5 → end of `sip` | The white light at the lens rim never goes out. |
| `room-row` (subtle, OKU) | (−20.3, 3.0, 2.4), plate "ODA" | `deep` 0.6 → `aisles` 0.3 | A shelf of records of the room, each exactly one night long. |
| `erased` (subtle, BAK) | (−24.3, 2.2, 6.5), side corridor | `aisles` 0.62–1.0 | Labels without carriers: the only way the machine forgets — and why no record is the first. |
| `bakery` (subtle, BAK) | (303.0, 1.2, 10.3), the bakery's corner door | `history` → end of `repeat` | The bakery's sign changes; its door never does. |
| `street-clock` (subtle, BAK) | (302.2, 3.0, 11.4) | `history` 0.6–0.8 (1944) | The street clock stopped too: 5:12 — the time of the anomaly record. |
| `same-cloud` (hidden, BAK) | (0.5, 4.55, −1.5), ceiling | `again` 0.45 → `turn` 0.87 | The hooked cloud is in its first-evening place: even a cloud repeats. |

---

## 6. Sound

- **UYANIŞ:** stream (main bed), wind in leaves, a distant bird every ~20 s, HVAC hum, low room tone;
  uneven breath while he sleeps; a deep breath and the chair's creak as he straightens. No music — the
  reader listens to the room. Touch-UI ticks. Cloth landing.
- **DIŞARISI:** the chair pushed back, wood creaks, steps; the door handle; the stream louder through the
  open door; door shut. Then drizzle on the "walls", a low electrical hum during the scan line.
- **RUTİN:** small wheels on wood, porcelain, a soft tray click (the catch), the same click again in
  `thousands`. Very sparse music: one sustained note under `thousands`.
- **ARŞİV:** heavy door, cold deep hum, the core's mechanical breath; lever clunk and relays clicking in
  sequence into the distance; whistling (a simple 4-note rhythm, which can recur faintly in `again`).
- **TARİH/ÖRÜNTÜ:** a sparse piano motif from `red` u 0.55 to `beyond` u 0.1. Each era's ambience muffled
  as if through glass: tram bell and crowd (1914), a far siren (1917, and **the same siren** in 1991),
  wind on rubble (1944), rain (2008). The void: low regular pulses, one per link.
- **ANOMALİ:** music cuts at `beyond`; one low warning tone at the anomaly; the feed carries its own slower
  room tone.
- **TEKERRÜR:** button click (`press` u 0.32); the forest's sound goes out with its panels; **total
  silence** from `press` u 0.75 through `dark`; one relay click on the word; a low machine hum returns
  after it (u 0.65).
- **GÖZLEMCİ:** a soft "record start" tick at each record; the stream returns in `again`, the cloth lands;
  steps stop in `halt`; the servo whir of the recorder's head in `turn`; **no music** from `observer` on;
  at `end` a relay click, machine hum, distant water, then silence.

Every caption in `CAPTIONS` (text.ts) has its sound here.

---

## 7. Story-select card art

The square room at dusk from the high corner: four walls of forest by a stream, the ceiling a violet
sky, the oak floor; the dark desk in the exact center with a man asleep on it, arms hanging; a few meters
away, a small robot standing apart with its single lens turned toward the sleeper. One tiny black dot
under the middle screen — the button. No red, no text.
