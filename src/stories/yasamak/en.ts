/** English edition (strings only, keyed by the Turkish original's ids). */
import type { StoryTranslation } from '../types'

const KEMAL = 'KEMAL'
const EMRE = 'EMRE'
const ME = 'ME'
const GRANDPA = 'GRANDPA'
const MOTHER = 'MOTHER'
const EXPIRED = 'YOUR TIME HAS EXPIRED'
const REFUSED = 'There’s no extending time.'

export const EN: StoryTranslation = {
  meta: {
    title: 'LIVING',
    hook: 'If you knew you could never buy more time, would you still start the game?',
    tags: 'DEATH · TIME · GOODBYE',
    description: 'As a boy he could buy another half hour for fifty kurus. At the same internet-café desk, he lives a life whose time never shows, and watches the people he loves leave one by one.',
    mood: 'WARM · WISTFUL',
    warning: 'Deals with the death of loved ones and with terminal illness.',
  },

  chapters: {
    breath: 'BREATH',
    child: 'CHILD',
    time: 'TIME',
    illness: 'TERMINAL ILLNESS',
    oneByOne: 'ONE BY ONE',
    nothing: 'NOTHINGNESS',
    farewell: 'GOODBYE',
    defiance: 'IN DEFIANCE',
  },

  text: {
    // 01 — BREATH
    dying: { lines: ['I am dying.'], sub: 'SCROLL' },
    anxiety: { lines: ['Death anxiety. The fact that I am dying, a little more each day, is no longer a thought I can ignore.'] },
    breath: { lines: ['Feeling death’s breath on my neck every moment, trying to get used to living with it, wears a person down.', 'It wore me out, at least.'] },

    // 02 — CHILD
    cafe: { lines: ['When I was a little boy, I used to go to the internet café to play games.', 'Straight from school, my bag on my back, running all the way.'] },
    'one-step': { lines: ['My best friend Emre was always one step behind me; I was the first to reach the counter.'] },
    'how-long-who': { lines: [KEMAL] },
    'how-long': { lines: ['— How long, young man?'] },
    price: { lines: ['An hour was one lira; half an hour, fifty kurus.', 'I learned that before my times tables.'] },
    'admin-hour': { lines: ['DESK 4 · 1 HOUR'] },
    sixty: { lines: ['TIME LEFT · 60:00'] },
    knew: { lines: ['I knew my time would run out, of course.', 'Still, I’d start the game, thrilled, and make the most of the moment.'] },
    'no-panic': { lines: ['I didn’t have anxiety attacks over the time running out, or trip over my own feet.', 'I’d glance at the number in the corner now and then. That was all.'] },
    expired: { lines: [EXPIRED] },
    'almost-who': { lines: [EMRE] },
    almost: { lines: ['— I was just about to win!'] },
    'best-part': { lines: ['The game always ended at the best part.'] },
    'last-coin': { lines: ['I had my last fifty kurus in my pocket.'] },
    extra: { lines: ['TIME LEFT · 30:00'] },
    more: { lines: ['I played another half hour. Then my mother appeared in the doorway.'] },
    home: { lines: ['Outside, the streetlights had come on. My mother was waiting at the door.'] },
    'dinner-who': { lines: [MOTHER] },
    dinner: { lines: ['— Dinner’s getting cold. Come on.'] },
    tomorrow: { lines: ['Time would run out; the next day, it would start again.'] },

    // 03 — TIME
    'years-home': { lines: ['Years went by. The desk was the same desk.', 'The fifty kurus I had saved for tomorrow was still in the crack of the desk.'] },
    'years-more': { lines: ['Years went by. The desk was the same desk.', 'I had spent every half hour I had right here, and begrudged not one of them.'] },
    soul: { lines: ['Now my soul seems to sit at a computer desk of eighty or ninety years, playing that one last game.'] },
    'no-time': { lines: ['TIME LEFT · —'] },
    'a-line': { lines: ['There should have been a number in the corner. There was a dash.'] },
    uncertainty: { lines: ['This is exactly where life and that game part ways: uncertainty.'] },
    'child-knows': { lines: ['A child knows how much money it takes to extend his time.', 'I still thought I knew.'] },
    'how-much-who': { lines: [KEMAL] },
    'how-much': { lines: ['— How long?'] },
    'no-extension': { lines: ['NO TIME EXTENSIONS'] },
    'no-chance': { lines: ['But we have no chance of extending our time, whatever the price.'] },

    // 04 — TERMINAL ILLNESS
    room: { lines: ['Going back to my desk, I truly saw the room for the first time. At the desks sat the people of my life.', 'My grandfather, my father, Emre, my mother; faces I didn’t know yet, and would come to know.'] },
    'same-line': { lines: ['Every screen had the same dash in its corner.', 'No one could see their own time; nor anyone else’s.'] },
    'door-again': { lines: ['Every time the door behind me opened, the same cold on my neck.', 'Whoever came opened that door; so did whoever left.'] },
    disease: { lines: ['I have come down with a terminal illness called “Living.”'] },
    'all-of-us': { lines: ['I am dying.', 'We all are.'] },

    // 05 — ONE BY ONE
    ignored: { lines: ['I used to ignore it. “It won’t find me,” I’d say.'] },
    understood: { lines: ['I understood how real that sense of an ending was when I began losing the people close to me, one by one.'] },
    'grandpa-screen': { lines: [EXPIRED] },
    'grandpa-first': { lines: ['My grandfather was the first to go. He read the words on his screen and nodded; he wasn’t even surprised.'] },
    'take-care-who': { lines: [GRANDPA] },
    'take-care': { lines: ['— Look after your mother.'] },
    'saturday-who': { lines: [EMRE] },
    saturday: { lines: ['— There’s a match on Saturday. You’re coming, right?'] },
    'ill-come-who': { lines: [ME] },
    'ill-come': { lines: ['— I’ll be there. This time I win.'] },
    'friend-screen': { lines: [EXPIRED] },
    'thirty-four': { lines: ['Emre was thirty-four.', 'He always came one step behind me; this time he went first.'] },
    vanish: { lines: ['How can someone who stood before me yesterday, flesh and blood, voice and breath, suddenly be “nothing”?'] },
    'father-screen': { lines: [EXPIRED] },
    father: { lines: ['One winter night it was my father’s turn. He folded his glasses and put them in his shirt pocket.', 'He turned and looked at me. He said nothing; that was always his way.'] },
    witness: { lines: ['In fact, what really breaks a person is not facing the consequences of their own actions or choices;', 'it is bearing witness to the deaths of those they love.'] },
    heavier: { lines: ['It is a burden heavier even than death itself.'] },

    // 06 — NOTHINGNESS
    traces: { lines: ['What they had left was still on the desks: my grandfather’s cap, Emre’s lighter.', 'Their chairs were still warm.'] },
    'high-scores': { lines: ['HIGH SCORES · 1. EMRE · 48,200'] },
    'top-score': { lines: ['Emre’s name was still at the top of the high scores.'] },
    'cannot-vanish': { lines: ['Because I exist, I know I can never become entirely “nothing”;', 'for if I truly became nothing, it would mean I had never existed at all.'] },
    illusion: { lines: ['Where there is being, nothingness is only a trick of perception.'] },
    'most-nights': { lines: ['What has been can never not have been. That was enough for me; most nights.'] },

    // 07 — GOODBYE
    'still-worry': { lines: ['Even so, my worry is less about my own end than about the leaving of those I love.', 'My mother was at the desk on my right. In her lap lay half a scarf.'] },
    flicker: { lines: ['Every so often her screen went dark, then came back.', 'Of everything the doctor said, one word had stayed with me: terminal.'] },
    'tap-who': { lines: [MOTHER] },
    tap: { lines: ['— They’re old, these. Give it a tap and it’s fine.'] },
    'for-whom-half': { lines: ['That day I had asked Kemal for another half hour.', 'Now I knew who I wanted to spend it with.'] },
    'for-whom-year': { lines: ['That day I had asked Kemal for another year.', 'Now I knew who I wanted to spend it with.'] },
    'for-whom-all': { lines: ['That day I had been ready to give Kemal everything I had.', 'Now I knew who it was for.'] },
    'which-key-who': { lines: [MOTHER] },
    'which-key': { lines: ['— Which one was I meant to press again?'] },
    laughed: { lines: ['She laughed. Not once did I look at the corner of her screen.'] },
    missed: { lines: ['Beside me, she laughed at something. I was still looking at that corner.'] },
    'turned-anyway': { lines: ['When I looked, her laugh was over. I turned my chair to her anyway.'] },
    longest: { lines: ['The scarf grew a few rows longer every day.', 'And every morning the goodbye began again. That was the longest goodbye.'] },
    'mother-screen': { lines: [EXPIRED] },
    'dont-be-cold-who': { lines: [MOTHER] },
    'dont-be-cold': { lines: ['— Keep warm.'] },
    shortest: { lines: ['Then, all at once, it was over. It was the shortest goodbye, too.'] },

    // 08 — IN DEFIANCE
    'scarf-turn': { lines: ['One spring afternoon the door opened again. That cold on my neck.', 'Around my neck, my mother’s scarf; in my head, her laugh.'] },
    'scarf-watch': { lines: ['One spring afternoon the door opened again. That cold on my neck.', 'Around my neck, my mother’s scarf; in my head, half her laugh.'] },
    'boy-sixty': { lines: ['TIME LEFT · 60:00'] },
    joy: { lines: ['A boy sat down at the next desk without taking his bag off his back.', 'He knew his time would run out, of course. Still, he started his game, thrilled.'] },
    'own-game': { lines: ['There was still that dash in my corner. I took my eyes off it; I started my game.'] },
    defiance: { lines: ['Living with someone who has a terminal illness is not preparing for that moment of goodbye;', 'it is living every moment in the shadow of that end, yet in defiance of it.'] },
    end: { lines: ['LIVING'], sub: 'The longest and the shortest goodbye.' },
  },

  choices: {
    coin: {
      title: 'FIFTY KURUS',
      prompt: 'Time’s up. In my palm, my last fifty kurus.',
      options: {
        more: { label: 'Another half hour.', reply: ['I put the fifty kurus down on the counter.', 'Kemal pressed a key: 30:00.'] },
        home: { label: 'Go home.', reply: ['I wedged the fifty kurus into the crack in the desk.', 'For tomorrow.'] },
      },
    },
    extend: {
      title: 'THE COUNTER',
      prompt: 'My wallet is on the counter. Kemal is waiting.',
      options: {
        half: { label: 'Another half hour.', speaker: KEMAL, reply: [REFUSED] },
        year: { label: 'Another year.', speaker: KEMAL, reply: [REFUSED] },
        all: { label: 'I’ll pay whatever you ask.', speaker: KEMAL, reply: ['It’s not about the money, son.', REFUSED] },
      },
    },
    mother: {
      title: 'MOTHER',
      prompt: 'Her screen went dark again. My mother went back to her knitting.',
      options: {
        turn: { label: 'Turn to her.', reply: ['I turned my chair toward her.'] },
        watch: { label: 'Watch her screen.', reply: ['My eyes stayed on the corner of her screen.'] },
      },
    },
  },

  discoveries: {
    prices: {
      title: 'The price list',
      verb: 'READ',
      lines: ['1 HOUR · 1 LIRA — HALF AN HOUR · 50 KURUS — TEA · 25 KURUS', 'Added underneath in pencil: “No children during school hours.”'],
    },
    'saved-coin': {
      title: 'Fifty kurus in the desk',
      verb: 'LOOK',
      lines: ['An old fifty-kurus coin, wedged in the crack of the desk.', 'Half an hour, saved for tomorrow.'],
    },
    seasons: {
      title: 'Seasons in the window',
      verb: 'LOOK',
      lines: ['Beyond the glass the plane tree shed its leaves, held the snow, turned green again.', 'I didn’t count how many times.'],
    },
    'wall-clock': {
      title: 'The wall clock',
      verb: 'LOOK',
      lines: ['The wall clock never stopped.', 'No one ever wound it, either.'],
    },
    note: {
      title: 'The note on the counter',
      verb: 'READ',
      lines: ['A yellowed sheet, taped to the counter at all four corners: NO TIME EXTENSIONS.', 'A price list used to hang on the wall. Now there is no price written anywhere.'],
    },
    'admin-screen': {
      title: 'The cashier’s screen',
      verb: 'READ',
      lines: ['Every desk is listed on the cashier’s screen, one under another: DESK 1 to DESK 13.', 'The time-left column is completely empty. Kemal doesn’t know either.'],
    },
    lighter: {
      title: 'Emre’s lighter',
      verb: 'LOOK',
      lines: ['He had given up smoking ten years ago; he never could give up the lighter.', 'I flicked it once. It lit.'],
    },
    cap: {
      title: 'My grandfather’s cap',
      verb: 'LOOK',
      lines: ['Inside, a faded tailor’s label: “Sivas, 1971.”', 'A backgammon die is caught under the lining. He always kept one in his pocket.'],
    },
    'high-scores': {
      title: 'The high scores',
      verb: 'READ',
      lines: ['HIGH SCORES — 1. EMRE · 48,200 — 2. ARİF · 47,950', 'Below it, a game saved on the server: HASAN · BACKGAMMON · 5–3. My grandfather was ahead.'],
    },
    knitting: {
      title: 'My mother’s knitting',
      verb: 'LOOK',
      lines: ['Half a scarf, brick red; the needles still in the stitches.', 'Pinned to its end, a note in my mother’s hand: “120 rows.” Below, she kept count; the last number is 84.'],
    },
  },

  captions: {
    '[gece; tek bir monitörün vızıltısı, dışarıda rüzgâr]': '[night; the hum of a single monitor, wind outside]',
    '[arkada kapı açılır, zil çalar]': '[behind him the door opens; the bell rings]',
    '[içeri soğuk bir rüzgâr dolar]': '[a cold wind rushes in]',
    '[kapı zili; koşan ayak sesleri]': '[the bell over the door; running footsteps]',
    '[bir el tezgâha vurur; iki çocuk güler]': '[a hand slaps the counter; two boys laugh]',
    '[bozuk paralar tezgâha dökülür]': '[coins spill onto the counter]',
    '[kasada tuşlara basılır]': '[keys tapped at the till]',
    '[oturum açılış sesi]': '[session start chime]',
    '[klavyeler, oyun sesleri, iki çocuğun kahkahası]': '[keyboards, game sounds, two boys laughing]',
    '[kısa bir uyarı sesi; ekran kilitlenir]': '[a short alert tone; the screen locks]',
    '[bozukluk tezgâha bırakılır]': '[a coin is set down on the counter]',
    '[uyarı sesi; kapı zili]': '[alert tone; the bell over the door]',
    '[akşam; sokak sesleri]': '[evening; street sounds]',
    '[kapı zili]': '[the bell over the door]',
    '[kapı kapanır; zil titrer]': '[the door closes; the bell shivers]',
    '[yağmur, rüzgâr, kar, ağustos böcekleri; art arda, hızla]': '[rain, wind, snow, cicadas; one after another, fast]',
    '[duvar saatinin tıkırtısı]': '[the wall clock ticking]',
    '[cüzdan tezgâha bırakılır]': '[a wallet is set down on the counter]',
    '[parmak uçları kâğıda iki kez vurur]': '[fingertips tap the paper twice]',
    '[salonun uğultusu; klavyeler]': '[the murmur of the room; keyboards]',
    '[kapı zili; bebek arabasının tekerlekleri]': '[the bell; baby carriage wheels]',
    '[bir bebek mırıldanır]': '[a baby coos]',
    '[uğultu çekilir; saat ve tek, uzun bir piyano notası]': '[the murmur fades; the clock and a single long piano note]',
    '[çakmağın kapağı; gülüşmeler]': '[a lighter’s lid; laughter]',
    '[kısa bir uyarı sesi]': '[a short alert tone]',
    '[geri itilen sandalye]': '[a chair pushed back]',
    '[kapı zili; içeri kar savrulur]': '[the bell; snow blows in]',
    '[çakmağın kapağı açılıp kapanır]': '[a lighter’s lid flips open and shut]',
    '[kısa bir uyarı sesi; salon susar]': '[a short alert tone; the room falls silent]',
    '[uzakta kapı zili]': '[the bell, far off]',
    '[çakmak bir kez çakar]': '[the lighter strikes once]',
    '[kapı kapanır; dışarıda kar]': '[the door closes; snow outside]',
    '[yalnızca duvar saati]': '[only the wall clock]',
    '[ekran uyanır]': '[a screen wakes]',
    '[kar sessizliği; seyrek bir piyano]': '[the hush of snow; sparse piano]',
    '[örgü şişlerinin tıkırtısı]': '[the click of knitting needles]',
    '[monitör cızırdar]': '[the monitor crackles]',
    '[monitörün kenarına iki hafif vuruş]': '[two light taps on the side of the monitor]',
    '[ikisinin kahkahası]': '[the two of them laughing]',
    '[yanında bir kahkaha]': '[a laugh beside him]',
    '[şişlerin tıkırtısı, günler boyu]': '[needles clicking, day after day]',
    '[kapı zili; içeri soğuk dolar]': '[the bell; cold pours in]',
    '[kapı zili; dışarıda kuş sesleri]': '[the bell; birdsong outside]',
    '[çocuğun sevinç çığlığı]': '[the boy whoops with joy]',
    '[iki klavye; gülüşmeler]': '[two keyboards; laughter]',
    '[kafenin uğultusu; duvar saati]': '[the murmur of the café; the wall clock]',
  },

  transcript: {
    breath:
      'Night. In a dark internet café a single screen is lit, and I am sitting in front of it. I am dying. Death anxiety: the fact that I am dying, a little more each day, is no longer a thought I can ignore. The door behind me opens by itself, the bell rings, cold pours in; my hand goes to the back of my neck, but I don’t turn around. Feeling death’s breath on my neck every moment, trying to get used to living with it, wears a person down. It wore me out, at least.',
    child:
      'When I was a little boy, I used to go to the internet café to play games. Straight from school, my bag on my back, running all the way. My best friend Emre was always one step behind me; I was the first to reach the counter. I’d spill my coins onto the counter and Kemal would ask: “How long, young man?” An hour was one lira, half an hour fifty kurus; I learned that before my times tables. In the corner of the screen at desk four the time would start: 60:00, 59:59… I knew my time would run out, of course; still, I’d start the game, thrilled, and make the most of the moment. I didn’t have anxiety attacks over the time running out, or trip over my own feet. I’d glance at the number in the corner now and then. That was all. When the number reached zero the screen locked: YOUR TIME HAS EXPIRED. Emre would fling his arms out: “I was just about to win!” The game always ended at the best part. That day I had my last fifty kurus in my pocket. Here the reader chooses. If they say “Another half hour”: I put the fifty kurus down on the counter, Kemal pressed a key, and I played another half hour; when the time ran out, my mother appeared in the doorway. If they say “Go home”: I wedged the fifty kurus into the crack in the desk, for tomorrow; when I stepped outside, the streetlights had come on and my mother was waiting at the door. She held out her hand: “Dinner’s getting cold. Come on.” Time would run out; the next day, it would start again.',
    time:
      'Years went by; beyond the glass the seasons turned and turned. The desk was the same desk. If I had saved the fifty kurus, it was still in the crack of the desk; if I had spent it, I had spent every half hour I had right here, and begrudged not one of them. Now my soul seems to sit at a computer desk of eighty or ninety years, playing that one last game. There should have been a number in the corner of the screen; there was a dash: TIME LEFT —. This is exactly where life and that game part ways: uncertainty. A child knows how much money it takes to extend his time. I still thought I knew. I took my wallet and went to the counter. Kemal, his hair gone grey, looked at me over his glasses and asked the question of all those years ago: “How long?” Here the reader names a price: another half hour, another year, or whatever Kemal asks. The answer is always the same: “There’s no extending time.” If I had spilled all my money onto the counter, Kemal gathered it up and pushed it back: “It’s not about the money, son.” Then he tapped two fingers on a yellowed sheet taped to the counter: NO TIME EXTENSIONS. But we have no chance of extending our time, whatever the price.',
    illness:
      'Going back to my desk, I truly saw the room for the first time. At the desks sat the people of my life: my grandfather, my father, Emre, my mother; faces I didn’t know yet, and would come to know. Every screen had the same dash in its corner. No one could see their own time; nor anyone else’s. The door behind me opened, the bell rang; a young couple came in with a baby carriage. Every time the door opened, the same cold on my neck. Whoever came opened that door; so did whoever left. I have come down with a terminal illness called “Living.” I am dying. We all are.',
    oneByOne:
      'I used to ignore it; “It won’t find me,” I’d say. I understood how real that sense of an ending was when I began losing the people close to me, one by one. My grandfather was the first to go. One winter day the words YOUR TIME HAS EXPIRED appeared on his screen; he read them, nodded, wasn’t even surprised. He put on his coat and, as he left, rested his hand on my shoulder: “Look after your mother.” His cap stayed on the desk. One summer evening Emre, flicking the lid of his lighter open and shut, asked: “There’s a match on Saturday. You’re coming, right?” “I’ll be there. This time I win.” His screen went dark while he was laughing. He looked at me, set the lighter down on the desk, stood up and left without looking back. Emre was thirty-four. He always came one step behind me; this time he went first. I struck his lighter once. How can someone who stood before me yesterday, flesh and blood, voice and breath, suddenly be “nothing”? One winter night it was my father’s turn. He folded his glasses and put them in his shirt pocket. He turned and looked at me. He said nothing; that was always his way. In fact, what really breaks a person is not facing the consequences of their own actions or choices; it is bearing witness to the deaths of those they love. It is a burden heavier even than death itself.',
    nothing:
      'Outside, it was snowing. What they had left was still on the desks: my grandfather’s cap, Emre’s lighter. Their chairs were still warm. I sat down at Emre’s desk and woke his screen; his name was still at the top of the high scores. Because I exist, I know I can never become entirely “nothing”; for if I truly became nothing, it would mean I had never existed at all. Where there is being, nothingness is only a trick of perception. What has been can never not have been. That was enough for me; most nights.',
    farewell:
      'Even so, my worry is less about my own end than about the leaving of those I love. My mother was at the desk on my right; in her lap lay half a scarf. Every so often her screen went dark, then came back. Of everything the doctor said, one word had stayed with me: terminal. My mother tapped the side of her monitor twice: “They’re old, these. Give it a tap and it’s fine.” Whatever I had asked Kemal for that day, now I knew who I wanted to spend it with. Her screen went dark again; my mother went back to her knitting. Here the reader chooses. If they say “Turn to her”: I turned my chair toward her and we played together; she mixed up the keys, asked “Which one was I meant to press again?” and laughed. Not once did I look at the corner of her screen. If they say “Watch her screen”: my eyes stayed on the corner of her screen; beside me she laughed at something, and I was still looking at that corner. When I looked, her laugh was over. I turned my chair to her anyway. The scarf grew a few rows longer every day. And every morning the goodbye began again; that was the longest goodbye. One morning those words appeared on her screen. She turned to me and wound the unfinished scarf, needles and all, around my neck: “Keep warm.” She stood, touched my hair once, and went out the door. Then, all at once, it was over. It was the shortest goodbye, too.',
    defiance:
      'One spring afternoon the door opened again; that cold on my neck. Around my neck, my mother’s scarf; in my head, her laugh, or half of it. A boy ran in through the door, spilled his coins onto the counter and sat down at the next desk without taking his bag off his back. In the corner of his screen: 60:00. He knew his time would run out, of course. Still, he started his game, thrilled. There was still that dash in my corner. I took my eyes off it; I started my game. The boy leaned over toward my screen, and I turned my chair toward him; we played side by side, and laughed. Living with someone who has a terminal illness is not preparing for that moment of goodbye; it is living every moment in the shadow of that end, yet in defiance of it. LIVING. The longest and the shortest goodbye.',
  },
}
