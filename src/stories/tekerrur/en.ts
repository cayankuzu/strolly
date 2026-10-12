/**
 * English edition of TEKERRÜR — RECURRENCE (strings only, keyed by the
 * Turkish original's ids; see text.ts, timeline.ts and docs/stories/tekerrur.md).
 *
 * The word on the screens is RECURRENCE ("tekerrür": history repeating
 * itself). The machine already speaks English on its screens (ANOMALY,
 * TODAY/RECORD, SUBJECT, ITERATION, OBSERVER DETECTED, the engine's six
 * words), so those lines are kept exactly, tokens and all. The archive's
 * plates stay Turkish in the set; the one the reader can examine (ODA) is
 * glossed in its lines. Times are written 05:12; the generic "you" of the
 * original's aphorisms is kept.
 */
import type { StoryTranslation } from '../types'

export const EN: StoryTranslation = {
  meta: {
    title: 'RECURRENCE',
    hook: 'If history repeats itself, can the future be known?',
    tags: 'HISTORY · PATTERN · LOOP',
    description: 'A room whose walls open onto a forest, a machine that never forgets, and a single word that appears on the screens.',
    mood: 'NIGHT · ARCHIVE',
  },

  chapters: {
    awakening: 'AWAKENING',
    outside: 'OUTSIDE',
    routine: 'ROUTINE',
    archive: 'ARCHIVE',
    history: 'HISTORY',
    pattern: 'PATTERN',
    anomaly: 'ANOMALY',
    tekerrur: 'RECURRENCE',
    observer: 'OBSERVER',
  },

  text: {
    // 01 — AWAKENING
    opening: { lines: ['In Arif’s room, the day began before nature did.'], sub: 'SCROLL' },
    paranoid: { lines: ['He slept a paranoid sleep.', 'His head lay on the touchscreen desk; his arms hung down on either side.'] },
    drool: { lines: ['Drool from his mouth had touched the surface of the desk.'] },
    screens: { lines: ['The giant screen in front of him was off; two more giant screens stood to his right and left.', 'The desk looked like an enormous computer room.'] },
    working: { lines: ['Even in sleep, the work went on.'] },
    walls: { lines: ['Every wall of the room was covered in screens.', 'The images made you think you were not indoors at all, but in a forest, at the edge of a stream.'] },
    real: { lines: ['The sound of the stream, the three-hundred-and-sixty-degree view…', 'It was all extraordinarily realistic.'] },
    'not-real': { lines: ['The world outside was not real.', 'But look at it long enough, and you could not tell it from the real thing.'] },
    square: { lines: ['The room was square. In the exact middle of the two side walls, two doors faced each other.'] },
    brutal: { lines: ['The doors were clad in screens too, but their heavy, brutalist frames set them apart from the walls.', 'They were plainly doors.'] },
    sky: { lines: ['Clouds and a gentle sunlight decorated the ceiling.'] },
    season: {
      lines: [
        'The passing day was cast onto the ceiling; as the hours moved on, the cycle came full circle.',
        'It kept a season between late summer and early spring; the place was practically a seasonal experience room.',
      ],
    },
    glasses: { lines: ['With the right arm that hung from the desk, he straightened the glasses sitting crooked on his nose.'] },
    eyes: { lines: ['Slowly, he opened his eyes. He sat up and rubbed his face with his hands to bring himself round.'] },
    cheek: { lines: ['With the back of his hand he wiped off the drool that had gathered on his cheek as he slept.'] },
    cloth: { lines: ['He took a cloth from under his chair and cleaned the drool off the desk.'] },
    throw: { lines: ['Then, without looking, he shot the cloth at the box in the room’s front corner, like a basketball.'] },
    placed: { lines: ['Nothing in this room had been placed by chance.'] },

    // 02 — OUTSIDE
    stood: { lines: ['He stood up.', 'The desk stood in the exact center of the room.'] },
    heavy: { lines: ['He walked with heavy steps toward the door on his right.'] },
    dusk: { lines: ['It was close to nightfall, and the air had cooled. Perhaps it would even drizzle tonight.', 'Arif’s mornings always began with the evening.'] },
    treehouse: { lines: ['The floor was wood, as if someone had built a tree house and left it without walls or a roof.'] },
    handle: { lines: ['He reached slowly for the handle and opened the door.', 'Beyond the door the forest went on; water ran beneath the planks.'] },
    'same-stream': { lines: ['Every morning he listened to the same stream.', 'He went in and closed the door.'] },
    nobody: { lines: ['The room went on playing the forest for no one.'] },
    drizzle: { lines: ['The drizzle began without waiting for night.'] },
    different: { lines: ['Every morning it looked a little different.'] },

    // 03 — ROUTINE
    'forty-min': { lines: ['About forty minutes later, the door opened again.'] },
    changed: { lines: ['He had changed his clothes; his hair was still wet.', 'Three robots followed him.'] },
    trays: { lines: ['One of the robots carried a coffee set; the next, snacks.'] },
    third: { lines: ['The third, as far as anyone could see, carried nothing.'] },
    sat: { lines: ['Arif sat down at his desk again.', 'The third robot stopped a little way off. Its lens was turned toward him.'] },
    hand: { lines: ['He held his hand out into the empty air to his right; the robot glided over and pushed the coffee into it.'] },
    'not-looking': { lines: ['He didn’t so much as glance at the robot; his eyes were on the dark screen.'] },
    sip: { lines: ['He took a sip, then held the cup out to the same spot and let go.'] },
    caught: { lines: ['Fortunately, the robot caught it; not that it had ever missed.'] },
    thousands: { lines: ['Some movements you make without thinking.', 'Because you have made them thousands of times before.'] },

    // 04 — ARCHIVE
    button: { lines: ['He was about to press the big black button beneath the giant monitor in front of him.'] },
    stopped: { lines: ['He stopped. He got up and headed for the left door.'] },
    fear: { lines: ['He was afraid less of what he didn’t know than of what he didn’t remember.'] },
    slowly: { lines: ['He opened the door slowly.'] },
    forgets: { lines: ['People forgot.'] },
    machine: { lines: ['The machine never forgot.'] },
    believed: { lines: ['At least, that was what Arif believed.'] },
    vast: {
      lines: [
        'Inside was a deep, wide room that stretched as far as the eye could see.',
        'The aisles were like a library’s, but the shelves held no books, only rows of digital data carriers.',
      ],
    },
    categories: { lines: ['The whole history of the world: books, films, biographies, events…', 'All of it sorted into categories, kept in the memory of the aisle it belonged to.'] },
    brain: { lines: ['The computer’s brain was here too.', 'Unlike Arif, it never slept.'] },
    'all-history': { lines: ['The entire history of the world could be found here.'] },
    switch: { lines: ['He stepped through the door and pulled down the switch on the right.'] },
    duty: { lines: ['For him, not forgetting was no virtue.', 'It was a necessity.'] },
    whistle: { lines: ['Keeping time with a soft whistle, he went back to his room and sat down at his desk.', 'He left the archive door open.'] },

    // 05 — HISTORY
    red: { lines: ['The black button now glowed red.'] },
    sorting: { lines: ['The system was combing through all of history so far, sorting events and news into categories.'] },
    'year-1914': { lines: ['1914'] },
    'year-1917': { lines: ['1917'], sub: 'WAR' },
    'year-1931': { lines: ['1931'], sub: 'CRISIS' },
    'year-1944': { lines: ['1944'], sub: 'RUINS' },
    'year-1962': { lines: ['1962'], sub: 'RECOVERY' },
    'year-1991': { lines: ['1991'], sub: 'NEW CONFLICT' },
    'year-2008': { lines: ['2008'], sub: 'NEW CRISIS' },
    'year-2029': { lines: ['2029'] },
    'year-2041': { lines: ['2041'] },
    'by-heart': { lines: ['Arif knew this square by heart: the clock tower, the fountain, the bakery on the corner.'] },
    'same-place': { lines: ['The machine always looked at the square from the same spot, so that everything that changed would show.'] },
    'fear-names': { lines: ['The same fear turned up in different years under other names.'] },
    clock: { lines: ['The tower fell; its clock stopped at the minute it fell.'] },
    'first-time': { lines: ['Then everyone began again, believing, every time, that it was the first.'] },

    // 06 — PATTERN
    buildings: { lines: ['The buildings changed.'] },
    people: { lines: ['The people changed.'] },
    story: { lines: ['The story did not.'] },
    network: { lines: ['Out of events, the machine wove a multidimensional web.', 'Much like a human brain, it used advanced models to connect everything to everything else.'] },
    deleted: { lines: ['Unlike a human being, this machine had no such thing as forgetting;', 'a thing was forgotten only if its data was deleted.'] },
    purpose: { lines: ['Its purpose was to look at the past and predict what the future would bring.'] },
    periods: { lines: ['History repeated itself at regular intervals.', 'Societies and states always went back to the same behavior: wars, crises…'] },
    loop: { lines: ['It was as if the world had fallen into a loop of its own.'] },
    order: { lines: ['Inside the chaos there was a hidden order.', 'And Arif was using this machine to decode that order.'] },

    // 07 — ANOMALY
    today: { lines: ['The spiral ended at today.', 'Its topmost node was this evening: a waking, a coffee, a switch.'] },
    anomaly: { lines: ['ANOMALY'] },
    'one-more': { lines: ['But there was one more record: after today.'] },
    error: { lines: ['At first Arif took it for an error.'] },
    dates: { lines: ['TODAY {TODAY}', 'RECORD {NEXT} · 05:12'] },
    checked: { lines: ['Then he checked the date.', 'The record belonged to tomorrow morning. 05:12.'] },
    'impossible-who': { lines: ['ARIF'] },
    impossible: { lines: ['— That’s impossible.'] },
    details: { lines: ['He knew every detail of the room: the box in the corner, the robots waiting behind the desk.'] },
    sleeper: { lines: ['A man was asleep at the desk.', 'His head lay on the desk; his arms hung down on either side.'] },
    subject: { lines: ['SUBJECT · {NEXT} · 05:12'] },
    unlived: { lines: ['But this record had not yet been lived.'] },
    lens: { lines: ['Arif turned his head. The third robot was standing where the record had been shot from.', 'Once again, its lens was turned toward him.'] },

    // 08 — RECURRENCE
    'still-red': { lines: ['The button still glowed red.', 'It was hours yet until 05:12.'] },
    'no-stop': { lines: ['This time he did not stop.', 'He pressed the button.'] },
    'one-word': { lines: ['After a while, a single word appeared on the screens.'] },
    word: { lines: ['RECURRENCE'] },
    booted: { lines: ['The system had come online…'] },
    'not-seeing': { lines: ['The machine did not see the future.'] },
    resemblance: { lines: ['It calculated how closely the future resembled the past.'] },

    // 09 — OBSERVER
    it0: { lines: ['ITERATION {IT0}'] },
    it1: { lines: ['ITERATION {IT1}'] },
    it2: { lines: ['ITERATION {IT2}'] },
    it3: { lines: ['ITERATION {IT3}'] },
    it4: { lines: ['ITERATION {IT4}'] },
    opened: { lines: ['The records opened one after another; all of them shot from the same low angle.'] },
    wrong: { lines: ['But something was wrong.'] },
    'not-first': { lines: ['None of these records was the first.'] },
    'same-room': { lines: ['The same room. The same robot.'] },
    'same-motion': { lines: ['The same door. The same movement.'] },
    engine: { lines: ['PAST', 'PATTERN', 'SIMULATION', 'OBSERVATION', 'CORRECTION', 'REPEAT'] },
    'believed-again': { lines: ['Arif believed he was using the machine to decode that order.'] },
    'asleep-again': { lines: ['At 05:12 he was asleep at the desk. Just as in the record.'] },
    again: { lines: ['His glasses were crooked again. Again, the cloth dropped into the box.'] },
    walked: { lines: ['He walked toward the door on his right, with the same heavy steps.'] },
    'not-recorded': { lines: ['Halfway there, he stopped. This was in none of the records.'] },
    turned: { lines: ['He turned back to the desk.', 'The third robot’s lens turned, for the first time, toward something other than him.'] },
    detected: { lines: ['OBSERVER DETECTED', 'SCROLL INPUT'] },
    looked: { lines: ['Arif looked at the screen. Then at where the screen was looking.'] },
    future: { lines: ['Perhaps the future was not something yet to be lived.'] },
    remember: { lines: ['Perhaps it was only something we had not remembered yet.'] },
    final: { lines: ['RECURRENCE'], sub: 'SCROLL TO REPEAT' },
  },

  choices: {},

  discoveries: {
    'cheek-window': { title: 'The window under his cheek', verb: 'READ', lines: ['The touch surface had opened a window under his cheek:', '“Resume from the last record?”'] },
    seam: { title: 'The seam', verb: 'LOOK', lines: ['Where two panels met, the water slipped by one pixel as it flowed.'] },
    'cloth-box': { title: 'The cloth box', verb: 'LOOK', lines: ['The box was full to the brim with cloths.', 'All the same cloth; all crumpled the same way.'] },
    'worn-floor': { title: 'Worn planks', verb: 'LOOK', lines: ['Where the robot would stop, the wood was worn.', 'A perfect circle, exactly the width of a wheel’s track.'] },
    'recorder-lens': { title: 'The third robot’s lens', verb: 'LOOK', lines: ['A small white light burned at the rim of the lens.', 'It never went out.'] },
    'room-row': { title: 'The ROOM aisle', verb: 'READ', lines: ['The plate at the head of an aisle read ODA: the room.', 'Every record on its shelves was the same length: one night.'] },
    erased: { title: 'The empty shelf', verb: 'LOOK', lines: ['On one shelf the labels were still in place; the carriers were gone.', 'They had not been forgotten. They had been deleted.'] },
    bakery: { title: 'The corner bakery', verb: 'LOOK', lines: ['The bakery on the corner was there in every era.', 'Its sign changed; its door never did.'] },
    'street-clock': { title: 'The street clock', verb: 'LOOK', lines: ['The street clock in front of the bakery had stopped too.', 'Twelve minutes past five.'] },
    'same-cloud': { title: 'The same cloud', verb: 'LOOK', lines: ['The hooked cloud on the ceiling sat where it had sat on the first evening.', 'Even its shape was the same.'] },
  },

  captions: {
    '[bir röle tıklar; duvar panelleri birer birer açılır]': '[a relay clicks; the wall panels come on one by one]',
    '[akarsu sesi]': '[the sound of a stream]',
    '[ağır, düzensiz bir nefes]': '[heavy, uneven breathing]',
    '[dokunmatik masanın kısa uyarı sesleri]': '[short alert tones from the touch desk]',
    '[yapraklarda rüzgâr, uzakta bir kuş]': '[wind in the leaves, a distant bird]',
    '[derin bir nefes; koltuk gıcırdar]': '[a deep breath; the chair creaks]',
    '[bez kutuya düşer]': '[the cloth drops into the box]',
    '[koltuk tahtada geri itilir]': '[the chair scrapes back across the wood]',
    '[tahta zeminde ağır adımlar]': '[heavy footsteps on the wooden floor]',
    '[ağır kapı kolu döner]': '[the heavy door handle turns]',
    '[akarsu birden yakından duyulur]': '[the stream is suddenly close]',
    '[kapı kapanır]': '[the door closes]',
    '[ince yağmur]': '[light rain]',
    '[duvarlardan alçak bir elektrik vızıltısı]': '[a low electrical hum from the walls]',
    '[kapı açılır; küçük tekerlekler tahtada]': '[the door opens; small wheels on wood]',
    '[porselen fincan tabağında tıkırdar]': '[a porcelain cup rattles on its saucer]',
    '[tepsiye yumuşak bir tık]': '[a soft click on the tray]',
    '[aynı yumuşak tık]': '[the same soft click]',
    '[ağır bir kapı; ardından soğuk, derin bir uğultu]': '[a heavy door; then a cold, deep hum]',
    '[derinden gelen makine sesi]': '[machine sound from somewhere deep]',
    '[şalter iner; röleler sırayla uzaklara doğru açılır]': '[the switch comes down; relays click on, one after another, into the distance]',
    '[ıslıkla tutulan bir ritim]': '[a rhythm, whistled]',
    '[tek, alçak bir bip]': '[a single low beep]',
    '[usul bir piyano motifi başlar]': '[a quiet piano motif begins]',
    '[tramvay zili, kalabalık; camın ardından boğuk]': '[a tram bell, a crowd; muffled, as if behind glass]',
    '[uzakta bir siren]': '[a distant siren]',
    '[enkazın üstünde rüzgâr]': '[wind over the rubble]',
    '[aynı siren]': '[the same siren]',
    '[yağmur, şemsiyeler]': '[rain, umbrellas]',
    '[alçak, düzenli nabızlar]': '[low, steady pulses]',
    '[müzik kesilir]': '[the music stops]',
    '[alçak bir uyarı tonu]': '[a low warning tone]',
    '[kayıttan gelen oda sesi: akarsu, uğultu, yavaş bir nefes]': '[room tone from the record: the stream, a hum, slow breathing]',
    '[düğmenin tıkı]': '[the click of the button]',
    '[bütün sesler kesilir]': '[every sound cuts out]',
    '[tek bir röle tıkı]': '[a single relay click]',
    '[alçak bir makine uğultusu başlar]': '[a low machine hum begins]',
    '[kayıt başlangıç sesi, her kayıtta yeniden]': '[a record-start tone, again with each record]',
    '[akarsu sesi geri gelir]': '[the sound of the stream returns]',
    '[adımlar kesilir]': '[the footsteps stop]',
    '[robotun başı ince bir vızıltıyla döner]': '[the robot’s head turns with a thin whir]',
    '[yalnızca makine uğultusu]': '[only the machine hum]',
    '[röle tıkı, makine uğultusu, uzakta su; sonra sessizlik]': '[a relay click, a machine hum, distant water; then silence]',
  },

  transcript: {
    awakening:
      'At first there was darkness. Then the wall panels lit up one by one, and a forest was drawn onto them, starting from the water: in Arif’s room, the day began before nature did. Arif slept a paranoid sleep. His head lay on the touchscreen desk, his arms hung down on either side; drool from his mouth had touched the surface of the desk. On the left side of the room a small robot stood motionless, its single lens turned toward the sleeping man. The giant screen in front of him was off; two more giant screens stood to his right and left. The desk looked like an enormous computer room. With every breath, the glass under his cheek opened and closed a small window: even in sleep, the work went on. Every wall of the room was covered in screens. The images made you think you were not indoors at all, but in a forest, at the edge of a stream. The sound of the stream, the three-hundred-and-sixty-degree view… It was all extraordinarily realistic. The world outside was not real. But look at it long enough, and you could not tell it from the real thing; only where two panels met did the water slip by one pixel as it flowed. The room was square. In the exact middle of the two side walls, two doors faced each other. The doors were clad in screens too, but their heavy, brutalist frames set them apart from the walls; they were plainly doors. Clouds and a gentle sunlight decorated the ceiling. The passing day was cast onto the ceiling; as the hours moved on, the cycle came full circle. It was a season somewhere between late summer and early spring; the place was practically a seasonal experience room. With the right arm that hung from the desk, Arif straightened the glasses sitting crooked on his nose. Slowly, he opened his eyes, sat up, and rubbed his face with his hands to bring himself round. With the back of his hand he wiped off the drool that had gathered on his cheek as he slept. He took a cloth from under his chair and cleaned the drool off the desk; then, without looking, he shot the cloth at the box in the room’s front corner, like a basketball. The cloth dropped into the box. Nothing in this room had been placed by chance.',
    outside:
      'He stood up. The desk stood in the exact center of the room. He walked with heavy steps toward the door on his right; the small robot followed a few paces behind. It was close to nightfall, and the air had cooled. Perhaps it would even drizzle tonight. Arif’s mornings always began with the evening. The floor was wood, as if someone had built a tree house and left it without walls or a roof. He reached slowly for the handle and opened the door. Beyond it the forest went on: a narrow wooden walkway, ferns close enough to touch, water running beneath the planks; two robots waiting in their niches, and one empty niche. Arif paused on the threshold and listened. Every morning he listened to the same stream. He went in; the robot with the lens glided after him. He closed the door. The room went on playing the forest for no one. On the ceiling, evening turned to night. The drizzle began without waiting for night. Then a thin, bright line passed over the walls, and behind it the forest was redrawn a little differently: a branch had moved, a stone had shifted, the ferns had grown thicker. Every morning it looked a little different.',
    routine:
      'About forty minutes later, the door opened again. Arif had changed his clothes; his hair was still wet. Three robots followed him. One of them carried a coffee set; the next, snacks. The third, as far as anyone could see, carried nothing; it had only a small head and a single lens. Arif sat down at his desk again. The robots stopped where the wood had worn into circles; the third stayed a little way off, its lens turned toward him. Arif held his hand out into the empty air to his right; the robot glided over and pushed the coffee into it. He didn’t so much as glance at the robot; his eyes were on the dark screen. He took a sip, then held the cup out to the same spot and let go. Fortunately, the robot caught it; not that it had ever missed. He took another sip and let the cup go in the same place; again the robot caught it. Some movements you make without thinking. Because you have made them thousands of times before.',
    archive:
      'Arif was about to press the big black button beneath the giant monitor in front of him. His finger stopped a centimeter above it. He got up and headed for the left door. He was afraid less of what he didn’t know than of what he didn’t remember. He opened the door slowly; a cold white light spilled across the planks. People forgot. The machine never forgot. At least, that was what Arif believed. Inside was a deep, wide room that stretched as far as the eye could see. The aisles were like a library’s, but the shelves held no books, only rows of digital data carriers. The whole history of the world: books, films, biographies, events… All of it sorted into categories, kept in the memory of the aisle it belonged to: war, economy, faith, migration, science, collapse, recovery. At the end of the main aisle, in the middle of a ring of black columns, stood the computer’s brain. Unlike Arif, it never slept. The entire history of the world could be found here. Arif stepped through the door and pulled down the switch on the right. The lights came on shelf by shelf, all the way to the brain. For him, not forgetting was no virtue. It was a necessity. Keeping time with a soft whistle, he went back to his room and sat down at his desk. He left the archive door open.',
    history:
      'The black button now glowed red. The system was combing through all of history so far, sorting events and news into categories; the screens on the desk filled with thousands of tiny images. One of them grew and became a city square. Arif knew this square by heart: the clock tower, the fountain, the bakery on the corner. It was 1914: a sunny morning, a tram on the rails, flags on the facades, a crowd. The machine always looked at the square from the same spot, so that everything that changed would show. In 1917 the war came: smoke, a military truck beside the fountain, an empty square. In 1931, the crisis: a long queue on the bank’s steps, shops with their shutters down. The same fear turned up in different years under other names. In 1944, ruins: the tower fell; its clock stopped at the minute it fell. In 1962, recovery: scaffolding, a repaired clock, people again. Then everyone began again, believing, every time, that it was the first.',
    pattern:
      'The square went on turning through the years. In 1991, a new conflict: barricades across the tram rails, broken glass. The buildings changed. In 2008, a new crisis: other clothes, other umbrellas, but the same queue, in the same shape, at the same bank door. The people changed. In 2029, glass facades. In 2041, smoke behind the tower, in the same place as in 1917. The story did not. Then the square came apart into points; every person, every vehicle, every window became a node. Out of events, the machine wove a multidimensional web. Much like a human brain, it used advanced models to connect everything to everything else. Unlike a human being, this machine had no such thing as forgetting; a thing was forgotten only if its data was deleted. Its purpose was to look at the past and predict what the future would bring. The nodes gathered into a spiral rising from 1914 to today. History repeated itself at regular intervals. Societies and states always went back to the same behavior: wars, crises… Seen from above, every turn of the spiral sat on one single circle. It was as if the world had fallen into a loop of its own. Inside the chaos there was a hidden order. And Arif was using this machine to decode that order.',
    anomaly:
      'The spiral ended at today. Its topmost node was this evening: a waking, a coffee, a switch. But there was one more record: after today. Just above the tip of the spiral a pale red node appeared, connected to nothing; on the screen it said ANOMALY. At first Arif took it for an error. Then he checked the date. The screen on the right showed two dates: today’s and tomorrow’s. The record belonged to tomorrow morning. 05:12. “That’s impossible,” he said. He opened the record. On the screen, in the blue light before dawn, a room appeared, shot from a low angle. He knew every detail of the room: the box in the corner, the robots waiting behind the desk. A man was asleep at the desk. His head lay on the desk; his arms hung down on either side. But this record had not yet been lived. Arif turned his head. The third robot was standing where the record had been shot from. Once again, its lens was turned toward him.',
    tekerrur:
      'The button still glowed red. It was hours yet until 05:12. Arif’s finger came down to the button again. This time he did not stop. He pressed the button. One after another the screens went dark: first the ones on the desk, then the forest on the walls, last of all the sky on the ceiling. Only the button’s red ring was left; then that went out too. The sound went as well: no stream, no hum. After a while, a single word appeared on the screens: RECURRENCE. The system had come online… The screens returned in a dim light; where the forest had been, all four walls showed a single circle. The machine did not see the future. It calculated how closely the future resembled the past.',
    observer:
      'The records opened one after another; all of them shot from the same low angle, from where the third robot stood. In the corner of each it said ITERATION, and the number beside it went up by one with every record. In one, Arif was straightening his glasses. But something was wrong. In the next, a cloth, thrown without looking, dropped into the box. None of these records was the first. Then a finger hung a centimeter above the black button. A cup was let go into empty air, and the robot caught it. The same room. The same robot. Arif was walking toward the door on the right. The same door. The same movement. The machine’s loop appeared on the screen: PAST, PATTERN, SIMULATION, OBSERVATION, CORRECTION, REPEAT. The room was seen from above: the desk in the middle, a motionless man at the desk, robots on the worn circles. Arif believed he was using the machine to decode that order. At 05:12 he was asleep at the desk. Just as in the record. On the ceiling the sun rose, passed noon and turned to evening; the room began again. His glasses were crooked again. Again, the cloth dropped into the box. He walked toward the door on his right, with the same heavy steps. Halfway there, he stopped. This was in none of the records. He turned back to the desk. The third robot’s lens turned, for the first time, toward something other than him: toward whoever was watching the record. Two lines appeared on the center screen: OBSERVER DETECTED. SCROLL INPUT. Arif looked at the screen. Then at where the screen was looking. The room slowly went dark; the last thing left was the small white light at the rim of the lens. Perhaps the future was not something yet to be lived. Perhaps it was only something we had not remembered yet.',
  },
}
