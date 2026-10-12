/**
 * English edition (strings only, keyed by the Turkish original's ids).
 *
 * ONE FOOT — notes for the translation:
 * - Names keep their Turkish spelling but drop the dotted capital
 *   (Ibrahim, SALIM): the English edition never uses Turkish letters.
 * - "kalktılar" (rose / got up) is the author's misdirection and stays one:
 *   "got up". Nothing calls the chair a chair before `still`; nobody "walks"
 *   or "wheels" before the reveal.
 * - The law on the board is the familiar English phrasing ("at rest, stays at
 *   rest"), so it echoes Eren at the end; "Aferin" (red ink) and the
 *   teacher's "Aferin oğlum" are both "Well done", to keep the echo.
 * - In-world writing (the wing, the chair's side panel) is given in English
 *   as a subtitle: "S.E.I Havayolları" → "S.E.I Airlines".
 */
import type { StoryTranslation } from '../types'

export const EN: StoryTranslation = {
  meta: {
    title: 'ONE FOOT',
    hook: 'Who threw this?',
    tags: 'CLASSROOM · PUNISHMENT · GLANCE',
    description: 'Friday, last period: a paper plane hits the teacher on the head, and three friends are sentenced to stand on one foot in the bin corner.',
    mood: 'DAYLIGHT · BITTERSWEET',
  },

  chapters: {
    lesson: 'LESSON',
    plane: 'PLANE',
    silence: 'SILENCE',
    punishment: 'PUNISHMENT',
    scene: 'SCENE',
  },

  text: {
    // 01 — LESSON
    friday: { lines: ['Friday, last period.', 'Twenty-eight minutes to the bell.'], sub: 'SCROLL' },
    back: { lines: ['The teacher stood at the board, his back to the class, talking his way through the lesson.'] },
    'law-who': { lines: ['TEACHER'] },
    law: { lines: ['— An object acted on by balanced forces, if it is at rest, stays at rest.'] },
    light: {
      lines: [
        'The October sun reached in through the tall windows; chalk dust turned slowly in the light.',
        'He had written this sentence every autumn for thirty years, in the same slanting hand.',
      ],
    },
    quiet: { lines: ['The class looked as quiet as ever.', 'Every head was bent over a notebook; the three in the back corner, a little too low.'] },

    // 02 — PLANE
    below: { lines: ['Above the desks, the lesson was science; below them, aviation.'] },
    trio: { lines: ['Salim, Eren and Ibrahim sat in the back rows.', 'Put the three of them together and something always happened.'] },
    folding: {
      lines: [
        'Salim did the folding: first down the middle, then the corners, last of all the wings.',
        'It wasn’t a subject on the report card; if it had been, Salim would have been top of the school.',
      ],
    },
    write: {
      lines: [
        'The plane went back to Eren. He pulled the cap off a felt-tip with his teeth and wrote something on the wing.',
        'He was trying not to laugh, so the letters wobbled a little.',
      ],
    },
    aim: { lines: ['Then to Ibrahim. Ibrahim shut one eye; the runway was the aisle between the desks.'] },
    until: { lines: ['The class still looked quiet,', 'until whispers and half-smothered giggles reached the teacher’s ear.'] },
    hit: { lines: ['At that very moment, a plane made of paper hit him on the head.'] },

    // 03 — SILENCE
    anger: { lines: ['Anger welled up in him.', 'He knew it could be nobody but Salim, Eren and Ibrahim.'] },
    turned: { lines: ['He spun round sharply.'] },
    'who-who': { lines: ['TEACHER'] },
    who: { lines: ['— Who threw this?'] },
    hush: { lines: ['A deep silence fell over the class; you could even hear the wall clock ticking.'] },
    'glance-salim': { lines: ['The teacher’s eyes slid to where you were looking: to Salim. Salim went on studying the ceiling.'] },
    'glance-ibrahim': { lines: ['The teacher’s eyes slid to where you were looking: to Ibrahim. His ears went a shade redder.'] },
    'glance-eren': { lines: ['The teacher’s eyes slid to where you were looking: to Eren. For a moment they just looked at each other.'] },
    'glance-desk': { lines: ['The teacher didn’t need your glance; his eyes were already on the back corner.'] },
    smoothed: { lines: ['The teacher picked the paper up off the floor and carefully smoothed it out.'] },
    airline: { lines: ['On the side of the plane, in sloppy letters, someone had written “S.E.I Airlines”.'] },
    quiz: { lines: ['The plane was one of the papers from last week’s test.', 'On its nose sat the 100 and the “Well done” he had written in his own red pen.'] },
    mock: {
      lines: ['Angry words spilled out of him as he stared at the nose.', '“Eren… so you’ve joined this lot too? Well done, son,” he said, his voice edged with mockery.'],
    },
    'summon-who': { lines: ['TEACHER'] },
    summon: { lines: ['— All three of you, up to the board.'] },

    // 04 — PUNISHMENT
    rose: { lines: ['Heads bowed, Salim, Eren and Ibrahim got up.', 'The teacher didn’t even look at them; his eyes were still on the plane in his hand.'] },
    'corner-who': { lines: ['TEACHER'] },
    corner: { lines: ['— You’ll stand in the bin corner. Over there, now.'] },
    walked: { lines: ['One by one, the three went over and lined up beside the bin.'] },
    'oneFoot-who': { lines: ['TEACHER'] },
    oneFoot: { lines: ['— Lift one foot. One foot, until the bell rings.'] },
    first: { lines: ['First Salim lifted his foot off the floor,', 'then Ibrahim…'] },
    looked: { lines: ['A moment later, everyone looked at Eren.', 'So did you.'] },
    'looked-desk': { lines: ['A moment later, everyone looked at Eren.', 'This time, so did you.'] },

    // 05 — SCENE
    'escaped-who': { lines: ['SALIM AND IBRAHIM, IN A WHISPER'] },
    escaped: { lines: ['— Lucky bastard got out of it!'] },
    laugh: { lines: ['Then came a laugh they couldn’t hold in.', 'First from the two of them, then from the whole class.'] },
    whom: { lines: ['Nobody was quite sure what they were laughing at: the teacher, the punishment, Eren?'] },
    still: { lines: ['Eren, meanwhile, sat still in his wheelchair, quietly watching it all.'] },
    face: { lines: ['There was neither surprise nor sadness in his face.'] },
    nothing: { lines: ['Nothing in his life had changed;', 'whatever went on in the classroom was, to him, just a scene flowing past.'] },
    end: { lines: ['ONE FOOT'], sub: 'Just a scene, flowing past.' },
  },

  choices: {
    glance: {
      title: 'WHO THREW THIS?',
      prompt: 'You’re at one of those desks too. Where do your eyes dart?',
      options: {
        salim: { label: 'To Salim.', reply: ['Salim was gazing at the water stain on the ceiling.', 'As if he were seeing it for the first time in his life.'] },
        ibrahim: { label: 'To Ibrahim.', reply: ['Ibrahim’s ears were bright red.', 'His ears always confessed before he did.'] },
        eren: { label: 'To Eren.', reply: ['Eren had raised his head and was looking at the teacher.', 'He was the only one in the class who didn’t look away.'] },
        desk: { label: 'At your desk.', reply: ['You looked at your desk: an old heart, scratched in with a compass point.', 'You gave nobody away.'] },
      },
    },
  },

  discoveries: {
    'teacher-desk': {
      title: 'The teacher’s desk',
      verb: 'LOOK',
      lines: ['A thermos of tea, a red ballpoint, the class logbook.', 'On the logbook’s first page, in pencil: “Year 31. The last one?”'],
    },
    ramp: {
      title: 'The ramp at the door',
      verb: 'LOOK',
      lines: ['A low aluminium ramp, screwed to the threshold.', 'Its edges had worn shiny from being crossed in the same place every day.'],
    },
    'ceiling-stain': {
      title: 'The stain on the ceiling',
      verb: 'LOOK',
      lines: ['A water stain on the ceiling, shaped like Africa.', 'Whenever a hard question was asked, half the class would look up at it.'],
    },
    'carved-heart': {
      title: 'The heart on the desk',
      verb: 'READ',
      lines: ['A heart scratched in with a compass point, and a date: 2011.', 'Fifteen people had sat at this desk before you. They had all come and gone; the heart had stayed.'],
    },
    'no-dot': {
      title: 'The I without a dot',
      verb: 'READ',
      lines: ['“S.E.I Airlines.”', 'In Turkish, Ibrahim’s capital I wears a dot. This one had none. He would fret about it all weekend.'],
    },
    fleet: {
      title: 'Plane No. 1',
      verb: 'LOOK',
      lines: ['On the wheelchair’s side panel, two wings drawn in felt-tip.', 'Beneath them, in Eren’s neat hand: “S.E.I · Plane No. 1”.'],
    },
    'board-law': {
      title: 'The sentence on the board',
      verb: 'READ',
      lines: ['“An object acted on by balanced forces, if it is at rest, stays at rest.”', 'Below it, smaller: “If it is moving, it keeps moving at the same speed.”'],
    },
  },

  captions: {
    '[tebeşir tahtada gıcırdar]': '[chalk squeaks on the board]',
    '[duvar saatinin tıkırtısı]': '[the wall clock ticks]',
    '[kalemler kâğıtta hışırdar]': '[pens scratch on paper]',
    '[kâğıt katlanır]': '[paper being folded]',
    '[kalem kapağı çıt diye açılır]': '[a pen cap pops off]',
    '[bastırılmış kıkırtılar]': '[stifled giggles]',
    '[fısıltılar]': '[whispers]',
    '[tebeşirin sesi kesilir]': '[the chalk stops]',
    '[kâğıt uçak kafaya çarpar]': '[a paper plane hits his head]',
    '[uçak yere düşer]': '[the plane drops to the floor]',
    '[tebeşir kırılır]': '[the chalk snaps]',
    '[öğretmen bağırır]': '[the teacher shouts]',
    '[kâğıt hışırdar]': '[paper rustles]',
    '[öfkeli mırıltılar]': '[angry muttering]',
    '[uçak avuca vurulur]': '[the plane slaps into a palm]',
    '[sandalyeler geri itilir]': '[chairs scrape back]',
    '[linolyumda lastik gıcırtısı]': '[a rubber squeak on linoleum]',
    '[adım sesleri]': '[footsteps]',
    '[bir el duvara çarpar]': '[a hand slaps the wall]',
    '[sessizlik]': '[silence]',
    '[fısıltı]': '[a whisper]',
    '[kahkaha patlar]': '[laughter bursts out]',
    '[bir el sıraya vurur, kahkahalar]': '[a hand bangs a desk; laughter]',
    '[kahkaha uzaklaşır, uğultuya döner]': '[the laughter recedes into a hum]',
    '[saatin tıkırtısı hızlanır]': '[the clock ticks faster]',
    '[okul zili çalar]': '[the school bell rings]',
  },

  transcript: {
    lesson:
      'Friday, last period. Twenty-eight minutes to the bell. The teacher stood at the board, his back to the class, talking his way through the lesson. In the top left corner of the board it said “Force and Motion”. “An object acted on by balanced forces, if it is at rest, stays at rest,” he said, and wrote the sentence on the right half of the board. The October sun reached in through the tall windows; chalk dust turned slowly in the light. He had written this sentence every autumn for thirty years, in the same slanting hand. The wall clock said 15:12. The class looked as quiet as ever. Every head was bent over a notebook; the three in the back corner, a little too low.',
    plane:
      'Above the desks, the lesson was science; below them, aviation. Salim, Eren and Ibrahim sat in the back rows; put the three of them together and something always happened. Salim did the folding: under the desk he took a sheet with red ink at its edge and folded it first down the middle, then at the corners, last of all into wings. It wasn’t a subject on the report card; if it had been, Salim would have been top of the school. The plane went back to Eren. He pulled the cap off a felt-tip with his teeth and wrote something on the wing; he was trying not to laugh, so the letters wobbled a little. Then the plane went to Ibrahim. Ibrahim shut one eye; the runway was the aisle between the desks. The class still looked quiet, until whispers and half-smothered giggles reached the teacher’s ear. The chalk stopped in the middle of a letter. At that very moment, a plane made of paper hit him on the head and dropped at his feet.',
    silence:
      'Anger welled up in him; the chalk snapped between his fingers. He knew it could be nobody but Salim, Eren and Ibrahim. He spun round sharply. “Who threw this?” he shouted. A deep silence fell over the class; you could even hear the wall clock ticking. You were at one of those desks too, and your eyes darted somewhere. If you looked at Salim: Salim was gazing at the water stain on the ceiling as if he were seeing it for the first time in his life; the teacher’s eyes slid to where you were looking, to Salim, and Salim went on studying the ceiling. If you looked at Ibrahim: Ibrahim’s ears were bright red, because his ears always confessed before he did; the teacher’s eyes slid to Ibrahim, and the ears went a shade redder. If you looked at Eren: Eren had raised his head and was looking at the teacher, the only one in the class who didn’t look away; the teacher’s eyes slid to Eren, and for a moment they just looked at each other. If you looked at your desk: an old heart was scratched into it with a compass point; you gave nobody away, but the teacher didn’t need your glance, his eyes were already on the back corner. The teacher picked the paper up off the floor and carefully smoothed it out. On the side of the plane, in sloppy letters, someone had written “S.E.I Airlines”. The plane was one of the papers from last week’s test; on its nose sat the 100 and the “Well done” he had written in his own red pen. Angry words spilled out of him as he stared at the nose. “Eren… so you’ve joined this lot too? Well done, son,” he said, his voice edged with mockery. Then he slapped the plane into his palm and added sharply: “All three of you, up to the board.”',
    punishment:
      'Heads bowed, Salim, Eren and Ibrahim got up. The teacher didn’t even look at them; his eyes were still on the plane in his hand. He raised the plane like a pointer and aimed it at the corner beside the board: “You’ll stand in the bin corner. Over there, now.” With every head following them, the three went over one by one and lined up beside the bin. “Lift one foot. One foot, until the bell rings.” First Salim lifted his foot off the floor, then Ibrahim… A moment later, everyone looked at Eren. So did you; even if you had looked down at your desk a moment before, this time, so did you.',
    scene:
      '“Lucky bastard got out of it!” Salim and Ibrahim whispered; then came a laugh they couldn’t hold in, first from the two of them, then from the whole class. Nobody was quite sure what they were laughing at: the teacher, the punishment, Eren? The teacher took off his glasses and pinched the bridge of his nose. Eren, meanwhile, sat still in his wheelchair, quietly watching it all. There was neither surprise nor sadness in his face. Nothing in his life had changed; whatever went on in the classroom was, to him, just a scene flowing past. Around him the minutes flowed past: the laughter died down, the teacher turned back to the board, Salim and Ibrahim switched feet again and again, and the sun slid across the desks until at last it fell on the corner, on Eren. At 15:40 the bell rang and everyone got up at once. Eren, in the light, stayed just as he was.',
  },
}
