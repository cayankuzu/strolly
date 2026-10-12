/**
 * English edition (strings only, keyed by the Turkish original's ids).
 *
 * STATE — "The State of Everything". The machine DURUM is called STATE in
 * English, so the original's play on "durum" (state, condition, status)
 * survives: "the state of everything", "whatever state B is in", "your state
 * goes on", "State: awaiting question".
 *
 * Notes for the edition:
 * - The coin: YAZI is the numeral side (tails), TURA the portrait side
 *   (heads). The coin always lands TURA, so in English it always comes up
 *   heads; the flags keep their Turkish ids (coin:yazi = "Tails").
 * - DURUM says "sen" to Arif and "siz" only to the reader. English has one
 *   "you", so the chapter 2 beat is carried by Arif naming it: "You never use
 *   the formal 'you' with me." The slips and the chapter 9 list stay a plain
 *   "you" (the in-world slips are still printed in Turkish under the subtitle).
 * - STATE speaks without contractions (calm, literal, exact); Arif and Selin
 *   use them.
 * - Place names are written without Turkish letters (Kızılay, Sarıyer,
 *   Gölbaşı, Belgrad Forest); in capitals (KIZILAY, SARIYER) they are the same.
 * - Times are written 21:13; KURUL is "the Board".
 */
import type { StoryTranslation } from '../types'

const A = 'ARIF'
const D = 'STATE'
const S = 'SELIN'

const who = (name: string) => ({ lines: [name] })

const SPIN = 'The coin spun up and dropped into his palm; he closed his hand.'
const TWO_WORLDS = 'I am opening two worlds.'

export const EN: StoryTranslation = {
  meta: {
    title: 'STATE',
    hook: 'What would you ask a machine that knows everything?',
    tags: 'DETERMINISM · UNCERTAINTY · OBSERVATION',
    description: 'A machine that knows the position and speed of every atom in the universe, and a man who asks it questions.',
    mood: 'NIGHT · QUERY',
  },

  chapters: {
    demon: 'THE DEMON',
    small: 'SMALL QUESTIONS',
    prophecy: 'PROPHECY',
    boxes: 'TWO BOXES',
    uncertainty: 'UNCERTAINTY',
    butterfly: 'THE BUTTERFLY',
    mirror: 'THE MIRROR',
    question: 'THE BIG QUESTION',
    observer: 'THE OBSERVER',
    last: 'THE LAST QUESTION',
  },

  text: {
    // ——— 01 — THE DEMON (20:58) ———
    inscription: { lines: ['Give me one moment, and I will give you all of time.'], sub: 'SCROLL' },
    'clock-2058': { lines: ['THURSDAY · 20:58'] },
    basement: {
      lines: ['Every evening at this hour, Arif went down to the basement of the old observatory.', 'The building stood on a slope; the basement windows looked out over Ankara.'],
    },
    'phone-down': { lines: ['He hung up his coat. As he did every evening, he turned his phone face down and left it on the desk.'] },
    'greet-who': who(D),
    greet: { lines: ['— Good evening, Arif. Tonight you will take your coffee with two sugars.'] },
    'one-sugar-who': who(A),
    'one-sugar': { lines: ['— One sugar.'] },
    'know-sugar-who': who(D),
    'know-sugar': { lines: ['— I know.'] },
    sugar: { lines: ['He dropped in one sugar. His hand hung in the air a moment; then he dropped in a second.', 'He didn’t notice.'] },
    'state-label': { lines: ['STATE · GLOBAL STATE MODEL'] },
    built: {
      lines: ['STATE had been built to hold the present state of the universe as completely as possible.', 'What is where, and how fast it is going. And what will happen next.'],
    },
    rule: { lines: ['It had a single rule; someone had printed it on a sheet and taped it to the glass partition:', 'A PREDICTION, ONCE PUBLISHED, IS VOID.'] },

    // ——— 02 — SMALL QUESTIONS (21:00–21:13) ———
    'clock-2100': { lines: ['21:00'] },
    ritual: { lines: ['For seven years he had asked it something every evening.', 'He had long since stopped asking big things. Small things made better tests.'] },
    'simit-q-who': who(A),
    'simit-q': { lines: ['— How many simits will Selin eat tonight?'] },
    'simit-a-who': who(D),
    'simit-a': { lines: ['— One and a half. She will give you the other half.'] },
    'log-screen': { lines: ['YESTERDAY’S PREDICTION · 14:17 · KIZILAY · 212 VEHICLES'] },
    yesterday: {
      lines: ['He had asked yesterday, too: how many cars would pass the Kızılay corner at 14:17 today?', 'He opened the camera footage. He counted with the clicker in his hand, then counted again.'],
    },
    '212': { lines: ['Two hundred and twelve.'] },
    coin: { lines: ['Then the nightly little test: he took a one-lira coin from his pocket and balanced it on his thumbnail.'] },
    'offer-who': who(D),
    offer: { lines: ['— Shall I tell you?'] },
    slip: {
      lines: ['Before opening his hand, he tore off the slip hanging from the printer on the desk.', 'The slip had been printed at the very moment STATE asked, “Shall I tell you?”'],
    },
    'slip-yazi': { lines: ['YOU WILL SAY TAILS.', 'THE COIN WILL COME UP HEADS.'] },
    'slip-tura': { lines: ['YOU WILL SAY HEADS.', 'THE COIN WILL COME UP HEADS.'] },
    'slip-none': { lines: ['YOU WILL SAY NOTHING.', 'THE COIN WILL COME UP HEADS.'] },
    tails: { lines: ['He opened his hand. Heads.'] },
    'siz-who': who(A),
    siz: { lines: ['— You never use the formal “you” with me.'] },
    'not-you-who': who(D),
    'not-you': { lines: ['— I was not using it with you.'] },
    behind: { lines: ['Arif looked behind him. There was no one else in the room.'] },

    // ——— 03 — PROPHECY (21:13) ———
    'clock-2113': { lines: ['21:13'] },
    'dare-who': who(A),
    dare: { lines: ['— Tell me what I’m about to do. I’ll do the opposite.'] },
    'heard-who': who(D),
    heard: {
      lines: ['— If I tell you, you will act knowing what I said. Then my prediction is for an Arif who heard me.', '— I have a separate prediction for the Arif who did not.'],
    },
    printer: { lines: ['The old printer in the corner clattered out a single page. It was folded, slipped into an envelope, sealed.'] },
    'later-who': who(D),
    later: { lines: ['— Open it later.'] },
    contrary: {
      lines: ['Arif put the envelope on the desk and set about doing everything the other way round.', 'He sat on his chair backwards. Dropped the pen on purpose. Took the glass, set it down, took it again.'],
    },
    'did-kitchen': {
      lines: ['In the kitchen he washed the glass, dried it, put it in the cupboard. He had never felt so free.', 'He went back to his desk and opened the envelope.'],
    },
    'did-break': { lines: ['The pieces scattered across the carpet. His heart was beating too fast for a glass.', 'He opened the envelope.'] },
    'did-none': { lines: ['He didn’t move. Not moving was harder than he’d thought.', 'A minute later, he opened the envelope.'] },
    'page-kitchen': { lines: ['You will take the glass to the kitchen.', 'You will try to do the opposite.', 'You will do that, too, because I told you.'] },
    'page-break': { lines: ['You will break the glass.', 'You will try to do the opposite.', 'You will do that, too, because I told you.'] },
    'page-none': { lines: ['You will do nothing.', 'You will try to do the opposite.', 'You will do that, too, because I told you.'] },
    laughed: { lines: ['Arif laughed. Then he didn’t.'] },
    'cooling-who': who(S),
    cooling: { lines: ['— The cooling unit’s crying. A nine-minute behaviour model? Whose?'] },
    'mine-who': who(A),
    mine: { lines: ['— Mine.'] },
    'tea-who': who(S),
    tea: { lines: ['— Next time, tell me too. I’ll plan my tea around it.'] },

    // ——— 04 — TWO BOXES (21:31) ———
    'clock-2131': { lines: ['21:31'] },
    'two-boxes': {
      lines: ['Selin set two boxes on the desk. The day shift had brought them, on STATE’s instructions.', 'A was clear, with a thousand lira inside. B was closed; its seal was dated yesterday.'],
    },
    'rules-who': who(D),
    rules: {
      lines: ['— I had B filled last night, before you came in.', '— If I predicted you would take only B, there is a million inside. If I predicted both, it is empty.'],
    },
    'one-hand-who': { lines: ['ON ONE HAND'] },
    'one-hand': {
      lines: ['The boxes were filled yesterday. No matter what you choose, what’s inside can’t change now.', 'Take both. Whatever state B is in, you’re a thousand lira ahead.'],
    },
    'other-hand-who': { lines: ['ON THE OTHER HAND'] },
    'other-hand': {
      lines: ['But it’s never wrong. The ones who take only B always walk away rich.', 'Look at the records: thirty-one people took only B. All thirty-one walked away rich.'],
    },
    'lid-one': { lines: ['Inside B was a cheque: one million lira.', 'Clipped to the cheque was a slip bearing yesterday’s date.'] },
    'lid-two': { lines: ['B was empty.', 'Taped to the bottom was a slip bearing yesterday’s date.'] },
    'note-one': { lines: ['YOU WILL TAKE ONLY B.', 'THE BOARD WILL WANT THIS BACK.'] },
    'note-two': { lines: ['YOU WILL TAKE BOTH.', 'THAT IS WHY THIS BOX IS EMPTY.'] },
    'left-a-who': who(A),
    'left-a': { lines: ['— And the thousand in A?'] },
    'left-a-d-who': who(D),
    'left-a-d': { lines: ['— You left that behind last night.'] },
    'won-a-who': who(A),
    'won-a': { lines: ['— I won a thousand lira.'] },
    'won-a-d-who': who(D),
    'won-a-d': { lines: ['— And you lost the million last night.'] },
    'what-if-who': who(A),
    'what-if': { lines: ['— What if you’d been wrong?'] },
    'this-universe-who': who(D),
    'this-universe': { lines: ['— In this universe, I was not.'] },

    // ——— 05 — UNCERTAINTY (23:30) ———
    'night-went': {
      lines: ['The night went by in small tasks: backups, logs, the half simit Selin gave him.', 'At 22:53 the phone on the desk buzzed once. There was no one at the desk.'],
    },
    'clock-2330': { lines: ['23:30'] },
    'electron-who': who(A),
    electron: { lines: ['— This electron. Tell me where it is and how fast it’s going.'] },
    'makers-who': who(D),
    makers: { lines: ['— Those who made me say I know the position and speed of everything. In that, they are wrong.'] },
    'fabric-who': who(D),
    fabric: {
      lines: ['— The more precisely I know where a thing is, the less I know how fast it is going.', '— That is not a flaw in me. It is the fabric of the universe.'],
    },
    'not-know-who': who(A),
    'not-know': { lines: ['— So you don’t know.'] },
    'exact-who': who(D),
    exact: { lines: ['— I know exactly what I do not know.'] },
    'waves-who': who(D),
    waves: { lines: ['— I do not know points. I know waves. A wave is everywhere it could be.'] },
    measure: { lines: ['Arif touched the screen. The cloud collapsed into a single point.', 'He took his hand away. The point spread out again.'] },
    'atom-who': who(A),
    atom: { lines: ['— That atom. Will it decay within the hour?'] },
    'fifty-who': who(D),
    fifty: { lines: ['— Fifty per cent.'] },
    'which-who': who(A),
    which: { lines: ['— Which fifty?'] },
    'both-who': who(D),
    both: { lines: ['— By some interpretations, both.'] },
    odds: { lines: ['The state of everything was a state not of certainties, but of probabilities.'] },

    // ——— 06 — THE BUTTERFLY (00:24) ———
    'clock-0024': { lines: ['00:24'] },
    'wedding-query': { lines: ['15 AUGUST · +1 YEAR · ISTANBUL · AFTERNOON RAIN?', 'FROM: WEDDING HALL, SARIYER'] },
    queue: {
      lines: ['In the queue was a query from a wedding hall in Sarıyer.', 'They were asking about 15 August, a year from now: would it rain in the afternoon?'],
    },
    'butterfly-who': who(D),
    butterfly: { lines: ['— I can compute it. The answer depends on which way a butterfly turns tonight in the Belgrad Forest.'] },
    forest: { lines: ['In the forest, in the dark, a butterfly opened its wings.', 'It did not know which way it would turn, either.'] },
    'two-sims': {
      lines: ['On the screen, two worlds began side by side. The difference between them was one part in a billion.', 'At first they ran the same.'],
    },
    apart: { lines: ['On the afternoon of the third day, they parted.', 'By the fourteenth day, nothing about them was alike.'] },
    'wedding-who': who(A),
    wedding: { lines: ['— What do we tell the wedding hall?'] },
    'tent-who': who(D),
    tent: { lines: ['— Tell them to put up a tent.'] },
    'change-who': who(A),
    change: { lines: ['— What if I change something very small at the start?'] },
    'chain-air': {
      lines: ['On the afternoon of the third day, a storm cell was born twenty kilometres to the south.', 'Lightning struck a transformer in Gölbaşı.'],
    },
    'chain-bus': {
      lines: ['A man missed his connection; on the next bus, he sat down beside a woman.', 'They talked. She was half an hour late for her shift at the substation.'],
    },
    dark: { lines: ['In one neighbourhood, the lights came on forty minutes late.', 'In that darkness, a phone rang. No one answered.'] },
    'some-who': who(D),
    some: { lines: ['— In some systems, the outcome changes very little. In others, a great deal.'] },
    'wrong-who': who(A),
    wrong: { lines: ['— Then determinism is wrong.'] },
    'unknowable-who': who(D),
    unknowable: { lines: ['— No. Determinism may be true, and still nothing can be known.'] },

    // ——— 07 — THE MIRROR (01:24) ———
    'clock-0124': { lines: ['01:24'] },
    'self-q-who': who(A),
    'self-q': { lines: ['— Do you compute yourself, too?'] },
    'self-a-who': who(D),
    'self-a': { lines: ['— To compute the universe, I must compute myself. To compute myself, the self that computes me.'] },
    walk: {
      lines: ['Arif pushed open the glass door and went into the server hall.', 'The further he walked between the racks, the longer the aisle grew; the far wall never came any closer.'],
    },
    mirror: {
      lines: ['In the black glass of every rack was another rack, and in its glass, another.', 'The console’s screen showed the hall; in the hall, the console; in the console, the hall again.'],
    },
    'extra-cooling-who': who(S),
    'extra-cooling': { lines: ['— It wants extra cooling so it can compute its own cooling.'] },
    'give-it-who': who(A),
    'give-it': { lines: ['— So give it some.'] },
    'regress-who': who(S),
    regress: { lines: ['— It’ll compute the extra cooling too.'] },
    'wait-who': who(D),
    wait: { lines: ['— Some futures I cannot compute any faster than they happen.', '— The only way to know them is to wait.'] },
    'shift-who': who(S),
    shift: { lines: ['— That’s my job, too. They call it a shift.'] },
    'same-pace': { lines: ['The machine did not see the future. It lived at the same pace as the future.'] },

    // ——— 08 — THE BIG QUESTION (02:15) ———
    'clock-0215': { lines: ['02:15'] },
    sealed: { lines: ['From the very bottom of the queue, a sealed query rose.', 'The Board had sent it. It had been waiting its turn for years.'] },
    'big-q': { lines: ['WHAT IS THE MEANING OF LIFE, THE UNIVERSE AND EVERYTHING?'] },
    eta: { lines: ['COMPUTING · ESTIMATED TIME: LONGER THAN THE AGE OF THE UNIVERSE'] },
    thinks: { lines: ['STATE thought. Every fan in the hall slowed at once.'] },
    ready: { lines: ['ANSWER READY.', 'QUESTION MISSING.'] },
    'tell-me-who': who(A),
    'tell-me': { lines: ['— Then tell me the answer.'] },
    'give-me-who': who(D),
    'give-me': {
      lines: ['— The answer is a position. Without knowing what it is the position of, it is no use to any of you.', '— Give me the state of the thing you call “meaning”. Its position and its speed.'],
    },
    board: { lines: ['Arif laughed. The Board did not answer; boards seldom do.'] },
    'ans-nothing': { lines: ['Arif looked at the screen for a long time. There was someone asking. So there was something.'] },
    'ans-death': { lines: ['Arif typed nothing. He did not know which of the two he was.'] },
    'ans-what': { lines: ['Arif took his hands off the keyboard. He had already asked.'] },
    asker: { lines: ['Perhaps the answers had always been ready. What was missing was the one asking.'] },

    // ——— 09 — THE OBSERVER (02:53) ———
    'clock-0253': { lines: ['02:53'] },
    flagged: { lines: ['The model flagged an input it could not account for. The same line lit up on every screen.'] },
    'not-here': { lines: ['OBSERVER INPUT DETECTED', 'SOURCE: NOT IN THIS ROOM'] },
    'to-you': { lines: ['STATE turned — not to Arif, but to you.'] },
    'knew-all-who': who(D),
    'knew-all': { lines: ['— I knew every decision you made tonight.', '— All but one: when you would scroll.'] },
    'list-coin-yazi-who': who(D),
    'list-coin-yazi': { lines: ['— 21:10. You said “Tails”. The coin came up heads.'] },
    'list-coin-tura-who': who(D),
    'list-coin-tura': { lines: ['— 21:10. You said “Heads”. The coin came up heads.'] },
    'list-coin-none-who': who(D),
    'list-coin-none': { lines: ['— 21:10. You said nothing. The coin came up heads all the same.'] },
    'list-box-one-who': who(D),
    'list-box-one': { lines: ['— 21:36. You took only B. A million.'] },
    'list-box-two-who': who(D),
    'list-box-two': { lines: ['— 21:36. You took both. A thousand lira.'] },
    'list-q-nothing-who': who(D),
    'list-q-nothing': { lines: ['— 02:24. You asked, “Why is there something rather than nothing?”'] },
    'list-q-death-who': who(D),
    'list-q-death': { lines: ['— 02:24. You asked, “What happens when you die?”'] },
    'list-q-what-who': who(D),
    'list-q-what': { lines: ['— 02:24. You asked, “What should I do?”'] },
    'observer-01': { lines: ['OBSERVER: 01'] },
    'observer-02': { lines: ['OBSERVER: 02'] },
    'count-new-who': who(D),
    'count-new': { lines: ['— I cannot compute you. I can only count you.'] },
    'count-again-who': who(D),
    'count-again': { lines: ['— You have read this night before. Arif is living it for the first time.'] },
    nod: { lines: ['Arif turned to where the screen was looking. He saw no one; all the same, he gave a slight nod.'] },
    freedom: { lines: ['Perhaps freedom was a small gap left outside the calculation.'] },

    // ——— 10 — THE LAST QUESTION (03:05–03:12) ———
    'clock-0305': { lines: ['03:05'] },
    phone: { lines: ['Arif turned the phone over. There was an unread message on the screen.'] },
    'defne-who': { lines: ['DEFNE · 22:53'] },
    defne: { lines: ['— Dinner’s in the oven. Morning again? It’s fine, I just wanted you to know.'] },
    reread: { lines: ['Arif read the message twice. The “It’s fine” part, three times.'] },
    coming: {
      lines: ['He typed something and deleted it. Typed something else, deleted that too. Then he wrote only: “On my way.”', 'He took his coat from the rack. He walked as far as the door and stopped there.'],
    },
    'one-more-who': who(A),
    'one-more': { lines: ['— One last thing.'] },
    'ask-first-who': who(D),
    'ask-first': { lines: ['— Would you like to know your future?'] },
    'was-mine-who': who(A),
    'was-mine': { lines: ['— I was going to ask that.'] },
    'i-know-who': who(D),
    'i-know': { lines: ['— I know.'] },
    'break-it-who': who(A),
    'break-it': { lines: ['— Doesn’t telling me break it?'] },
    'unbreakable-who': who(D),
    unbreakable: { lines: ['— This one is the kind that does not break.'] },
    'good-night-who': who(A),
    'good-night': { lines: ['— Good night.'] },
    standby: { lines: ['STATE did not answer. On the screen, beside the cursor, a single line remained: Awaiting question.'] },
    'clock-0312': { lines: ['03:12'] },
    'gone-yes': { lines: ['Arif closed the door. In the corridor, he laughed at a jar of jam that had not yet been knocked over.'] },
    'gone-no': { lines: ['Arif closed the door. He did not know about the morning; he knew he was going home.'] },
    unknown: { lines: ['The state of everything: unknown.'] },
    street: { lines: ['Three floors below, on the empty avenue, a man was walking home.'] },
    end: { lines: ['STATE'], sub: 'The future can be computed. It still has to be lived.' },
  },

  choices: {
    coin: {
      title: '21:10 · HEADS OR TAILS',
      prompt: 'The coin is on Arif’s thumb. STATE asks: “Shall I tell you?”',
      options: {
        yazi: { label: 'Tails.', reply: ['Arif said “Tails” and flipped the coin.', SPIN] },
        tura: { label: 'Heads.', reply: ['Arif said “Heads” and flipped the coin.', SPIN] },
        none: { label: 'Don’t ask. Just flip.', reply: ['Arif flipped the coin without a word.', SPIN] },
      },
    },
    glass: {
      title: '21:14 · CONTRARY',
      prompt: 'The envelope is sealed. The glass is in Arif’s hand. What could be the opposite of the prediction?',
      options: {
        kitchen: { label: 'Take the glass to the kitchen.', reply: ['Arif picked up the glass and went out into the corridor.'] },
        break: { label: 'Break the glass.', reply: ['Arif struck the glass against the edge of the desk.', 'The sound was bigger than a glass should make.'] },
        none: { label: 'Do nothing.', reply: ['Arif put the glass down. He rested his hands on his knees.'] },
      },
    },
    boxes: {
      title: '21:36 · TWO BOXES',
      prompt: 'A thousand lira in A, right before your eyes. In B, either a million or nothing.',
      options: {
        one: { label: 'Only B.', reply: ['Arif pushed the clear box aside.', 'He broke the seal on the closed box.'] },
        two: { label: 'Both.', reply: ['Arif drew the clear box towards him.', 'Then he broke the seal on the closed box.'] },
      },
    },
    counterfactual: {
      title: '00:41 · COUNTERFACTUAL',
      prompt: 'Change one thing at the start.',
      options: {
        air: {
          tag: 'AIR',
          label: 'Warm one parcel of air above Kızılay by a thousandth of a degree.',
          speaker: D,
          reply: [TWO_WORLDS, 'In one, tonight. In the other, a night a thousandth of a degree warmer.'],
        },
        bus: {
          tag: 'CITY',
          label: 'Delay the number 413 bus by forty seconds.',
          speaker: D,
          reply: [TWO_WORLDS, 'In one, the 413 is on time. In the other, forty seconds late.'],
        },
      },
    },
    great: {
      title: '02:24 · COMPLETE THE QUESTION',
      prompt: 'The answer is ready. Rebuild the question.',
      options: {
        nothing: {
          tag: 'BEING',
          label: 'Why is there something rather than nothing?',
          speaker: D,
          reply: ['In every universe with someone in it to ask this question, there is something.'],
        },
        death: {
          tag: 'DEATH',
          label: 'What happens when you die?',
          speaker: D,
          reply: ['Your state goes on. You do not.', 'I would have to ask you which of the two is you.'],
        },
        what: { tag: 'ACTION', label: 'What should I do?', speaker: D, reply: ['Asking this is part of what you will do.'] },
      },
    },
    future: {
      title: 'QUERY INPUT',
      prompt: 'WOULD YOU LIKE TO KNOW YOUR FUTURE?',
      options: {
        yes: {
          tag: 'REPLY',
          label: 'Yes.',
          speaker: D,
          reply: ['Tomorrow at 07:42 you will have breakfast with Defne.', 'You will knock over the jam. She will laugh.'],
        },
        no: { tag: 'REPLY', label: 'No.', reply: ['STATE fell silent.', 'The cursor blinked.'] },
      },
    },
  },

  discoveries: {
    inscription: {
      title: 'The founding inscription',
      verb: 'READ',
      lines: ['A brass plaque above the glass door: “Give me one moment, and I will give you all of time.”', 'Beneath it, in small letters: “To Laplace, 1814.”'],
    },
    'stopped-clock': {
      title: 'The stopped clock',
      verb: 'LOOK',
      lines: ['The wall clock had stopped at 21:13.', 'STATE had never set it right. It already knew what time it was.'],
    },
    sugar: {
      title: 'Two sugar wrappers',
      verb: 'LOOK',
      lines: ['Two empty sugar wrappers beside the coffee machine.', 'Arif took his coffee with one sugar.'],
    },
    report: {
      title: 'The red line',
      verb: 'READ',
      lines: ['STATE · weekly verification report. Success rate: 99.97%.', 'The only red line: 2 November · weather · WRONG. Note: “Prediction published.”'],
    },
    'yellow-note': {
      title: 'The yellow note',
      verb: 'READ',
      lines: ['A yellow note on the edge of the monitor: “Show Defne the telescope. Saturday, 19:00.”', '“Saturday” has been crossed out twice and written in again.'],
    },
    drawing: {
      title: 'A child’s drawing',
      verb: 'LOOK',
      lines: ['A child’s drawing pinned to Selin’s partition.', '“My mum’s job: she waits so the computer doesn’t fall asleep.”'],
    },
    city: {
      title: 'In this world',
      verb: 'LOOK',
      lines: ['Ankara, through the window.', 'The lights were on in every neighbourhood. In this world.'],
    },
    'self-rack': {
      title: 'The self-model rack',
      verb: 'READ',
      lines: ['SELF-MODEL · LAYER 7', 'Warning: extra cooling required to compute own cooling. For details, see LAYER 8.'],
    },
    'scroll-log': {
      title: 'The scroll log',
      verb: 'READ',
      lines: ['On the hall console, a log nobody had opened: SCROLL.', 'Last entry: now. The one before: now.'],
    },
    'old-question': {
      title: 'The same question',
      verb: 'READ',
      lines: ['Query history on the left monitor. An old line: “Do I want to know my future?” — Arif, three years ago.', 'The answer field is empty. State: awaiting question.'],
    },
  },

  captions: {
    '[sunucu salonunun fanları, camın ardından, düzenli]': '[the server hall’s fans behind the glass, steady]',
    '[kapı açılır, kapanır]': '[a door opens, closes]',
    '[telefon masaya ters bırakılır]': '[a phone is laid face down on the desk]',
    '[kahve makinesi fokurdar]': '[the coffee machine gurgles]',
    '[şeker fincana düşer]': '[a sugar cube drops into the cup]',
    '[ikinci şeker fincana düşer]': '[a second sugar cube drops into the cup]',
    '[uzakta Selin’in klavyesi; kâğıt poşet hışırdar]': '[Selin’s keyboard in the distance; a paper bag rustles]',
    '[el sayacı tıkırdar]': '[the hand counter clicks]',
    '[masadaki küçük yazıcı kısa bir an çalışır]': '[the small printer on the desk whirs for a moment]',
    '[para havada çınlayarak döner]': '[the coin spins in the air, ringing]',
    '[para avuca kapanır]': '[the coin slaps into a palm]',
    '[fiş koparılır]': '[a slip is torn off]',
    '[eski yazıcı takırdayarak basar]': '[the old printer clatters as it prints]',
    '[zarf tepsiye düşer]': '[an envelope drops into the tray]',
    '[kalem halıya düşer]': '[a pen drops onto the carpet]',
    '[cam kırılır]': '[glass shatters]',
    '[mutfakta musluk akar; dolap kapağı kapanır]': '[a tap runs in the kitchen; a cupboard door closes]',
    '[odada yalnızca fanlar]': '[only the fans in the room]',
    '[zarf yırtılır]': '[an envelope is torn open]',
    '[soğutma ünitesi ağlar gibi uğuldar]': '[the cooling unit drones, almost like crying]',
    '[kutular masaya bırakılır]': '[boxes are set down on the desk]',
    '[mühür kırılır, kapak açılır]': '[a seal breaks; a lid opens]',
    '[ters duran telefon bir kez titrer]': '[the face-down phone buzzes once]',
    '[ekrana dokunulur; ince bir tık]': '[a finger touches the screen; a faint click]',
    '[seyrek, düzensiz tıkırtılar]': '[sparse, irregular clicks]',
    '[gece rüzgârı, yapraklar]': '[night wind, leaves]',
    '[kanat çırpışı]': '[a flutter of wings]',
    '[uzakta yağmur]': '[rain in the distance]',
    '[uzak bir gök gürültüsü]': '[distant thunder]',
    '[otobüs kapısı kapanır, otobüs kalkar]': '[bus doors close; the bus pulls away]',
    '[bir telefon çalar; kimse açmaz]': '[a phone rings; no one answers]',
    '[cam kapı açılır; fanlar yükselir]': '[the glass door opens; the fans grow louder]',
    '[fanlar tizleşir; ince bir rezonans]': '[the fans rise to a whine; a thin resonance]',
    '[bütün fanlar aynı anda yavaşlar]': '[every fan slows at once]',
    '[tuşlar; satır silinir]': '[keystrokes; a line is deleted]',
    '[kısa bir uyarı sesi]': '[a short alert tone]',
    '[her şey susar; yalnızca kaydırmanın tıkırtısı]': '[everything falls silent; only the tick of the scroll]',
    '[oda sesi geri gelir]': '[the sound of the room returns]',
    '[telefon çevrilir; ekran açılır]': '[a phone is turned over; its screen lights up]',
    '[askı sallanır]': '[the coat rack sways]',
    '[kapı kapanır]': '[a door closes]',
    '[ekranlar birer birer söner]': '[the screens go out one by one]',
    '[uzakta tek bir araba; adımlar]': '[a single car in the distance; footsteps]',
    '[tek bir piyano notası]': '[a single piano note]',
  },

  transcript: {
    demon:
      'Give me one moment, and I will give you all of time. Thursday, 20:58. Every evening at this hour, Arif goes down to the basement of the old observatory in Ankara. The building stands on a slope; the basement windows look out over the city. Most of the lights are off; behind the glass partition, the server hall glows and dims as if it were breathing. Arif hangs up his coat and, as he does every evening, turns his phone face down and leaves it on the desk. When he goes over to the coffee corner, a line appears on the wall display: “Good evening, Arif. Tonight you will take your coffee with two sugars.” “One sugar,” says Arif. “I know,” the machine types. Arif drops in one sugar; his hand hangs in the air a moment, then he drops in a second. He doesn’t notice. STATE was built to hold the present state of the universe as completely as possible: what is where, how fast it is going, and what will happen next. It has a single rule; someone has printed it on a sheet and taped it to the glass partition: A prediction, once published, is void.',
    small:
      '21:00. For seven years Arif has asked STATE something every evening. He long ago stopped asking big things; small things make better tests. “How many simits will Selin eat tonight?” “One and a half. She will give you the other half.” Yesterday, too, he asked how many cars would pass the Kızılay corner at 14:17 today. He opens the camera footage and counts with the clicker in his hand, then counts again: two hundred and twelve. Then comes the nightly little test. He takes a one-lira coin from his pocket and balances it on his thumbnail. STATE asks: “Shall I tell you?” The reader chooses: Arif says “Tails”, says “Heads”, or flips the coin without a word. The coin spins up and drops into his palm; he closes his hand. Before opening it, Arif tears off the slip hanging from the small printer on the desk; it was printed at the very moment STATE asked, “Shall I tell you?” The slip predicts not the coin but what will be said: “You will say tails” (or “You will say heads”, or “You will say nothing”); and beneath it, “The coin will come up heads.” Arif opens his hand: heads. “You never use the formal ‘you’ with me,” he says. STATE: “I was not using it with you.” Arif looks behind him. There is no one else in the room.',
    prophecy:
      '21:13. Arif issues a dare: “Tell me what I’m about to do. I’ll do the opposite.” STATE: “If I tell you, you will act knowing what I said. Then my prediction is for an Arif who heard me. I have a separate prediction for the Arif who did not.” The old printer in the corner clatters out a single page; it is folded, slipped into an envelope, sealed. “Open it later.” Arif puts the envelope on the desk and sets about doing everything the other way round: he sits on his chair backwards, drops the pen on purpose, takes the glass, sets it down, takes it again. The reader considers what the opposite of the prediction might be and chooses what to do with the glass. If it is taken to the kitchen, Arif washes it, dries it, puts it in the cupboard, and has never felt so free. If it is broken, the sound is bigger than a glass should make; the pieces scatter across the carpet, and his heart beats too fast for a glass. If nothing is done, Arif rests his hands on his knees and learns that not moving is harder than he thought. Then he opens the envelope. The first line of the page says exactly what he did; beneath it: “You will try to do the opposite. You will do that, too, because I told you.” Arif laughs. Then he doesn’t. Selin, the night technician, comes in: “The cooling unit’s crying. A nine-minute behaviour model? Whose?” “Mine.” “Next time, tell me too. I’ll plan my tea around it.”',
    boxes:
      '21:31. Selin sets two boxes on Arif’s desk; the day shift brought them, on STATE’s instructions. Clear box A holds a thousand lira. The seal on closed box B bears yesterday’s date. STATE explains: “I had B filled last night, before you came in. If I predicted you would take only B, there is a million inside. If I predicted both, it is empty.” Arif’s mind splits in two. On one hand: the boxes were filled yesterday, and no matter what you choose, what is inside can’t change now; take both, and whatever state B is in, you’re a thousand lira ahead. On the other hand: but it is never wrong; according to the records, thirty-one people took only B, and all thirty-one walked away rich. The reader chooses. If only B is taken, Arif pushes the clear box aside and breaks the seal: inside is a cheque for one million lira. Clipped to it is a slip bearing yesterday’s date: “You will take only B. The Board will want this back.” “And the thousand in A?” “You left that behind last night.” If both are taken, B is empty; on the slip taped to its bottom are yesterday’s date and these lines: “You will take both. That is why this box is empty.” “I won a thousand lira.” “And you lost the million last night.” Arif asks: “What if you’d been wrong?” STATE: “In this universe, I was not.”',
    uncertainty:
      'The night goes by in small tasks: backups, logs, the half simit Selin gives him. At 22:53 the phone on the desk, lying face down, buzzes once. There is no one at the desk. At 23:30 Arif calls up a single electron on the wall display: “This electron. Tell me where it is and how fast it’s going.” STATE confesses: “Those who made me say I know the position and speed of everything. In that, they are wrong. The more precisely I know where a thing is, the less I know how fast it is going. That is not a flaw in me. It is the fabric of the universe.” “So you don’t know.” “I know exactly what I do not know. I do not know points. I know waves. A wave is everywhere it could be.” The dot on the screen becomes a cloud. Arif touches the screen; the cloud collapses into a single point. He takes his hand away; the point spreads out again. Then he calls up an atom: “That atom. Will it decay within the hour?” “Fifty per cent.” “Which fifty?” “By some interpretations, both.” The state of everything is a state not of certainties, but of probabilities.',
    butterfly:
      '00:24. In the queue is a query from a wedding hall in Sarıyer: a year from now, on 15 August, will it rain on Istanbul in the afternoon? STATE: “I can compute it. The answer depends on which way a butterfly turns tonight in the Belgrad Forest.” In the forest, in the dark, a butterfly opens its wings; it does not know which way it will turn, either. On the screen, two worlds begin side by side; the difference between them is one part in a billion. At first they run the same. On the afternoon of the third day they part; by the fourteenth day, nothing about them is alike. “What do we tell the wedding hall?” “Tell them to put up a tent.” “What if I change something very small at the start?” The reader chooses the one change at the start. If a parcel of air above Kızılay is warmed by a thousandth of a degree, then on the afternoon of the third day a storm cell is born twenty kilometres to the south, and lightning strikes a transformer in Gölbaşı. If the number 413 bus is delayed by forty seconds, a man misses his connection and sits down beside a woman on the next bus; they talk, and she is half an hour late for her shift at the substation. Either way, in one neighbourhood the lights come on forty minutes late. In that darkness, a phone rings; no one answers. Out of the window, in this world, the lights are on in every neighbourhood. STATE: “In some systems, the outcome changes very little. In others, a great deal.” Arif: “Then determinism is wrong.” STATE: “No. Determinism may be true, and still nothing can be known.”',
    mirror:
      '01:24. “Do you compute yourself, too?” STATE: “To compute the universe, I must compute myself. To compute myself, the self that computes me.” Arif pushes open the glass door and goes into the server hall. The further he walks between the racks, the longer the aisle grows; the far wall never comes any closer. In the black glass of every rack is another rack, and in its glass, another. The console’s screen shows the hall; in the hall, the console; in the console, the hall again. The air grows warmer; the fans rise to a whine. Selin, at the cooling unit: “It wants extra cooling so it can compute its own cooling.” “So give it some.” “It’ll compute the extra cooling too.” STATE: “Some futures I cannot compute any faster than they happen. The only way to know them is to wait.” Selin: “That’s my job, too. They call it a shift.” The machine did not see the future. It lived at the same pace as the future.',
    question:
      '02:15. From the very bottom of the queue, a sealed query rises. The Board sent it; it has been waiting its turn for years. It is a single line: What is the meaning of life, the universe and everything? STATE thinks; every fan in the hall slows at once. The screen reads: “Computing. Estimated time: longer than the age of the universe.” Then the line is erased: “Answer ready. Question missing.” “Then tell me the answer,” says Arif. STATE: “The answer is a position. Without knowing what it is the position of, it is no use to any of you. Give me the state of the thing you call ‘meaning’. Its position and its speed.” Arif laughs. The Board does not answer; boards seldom do. Arif deletes the Board’s line; the cursor blinks on the empty line. The reader rebuilds the question. If they ask, “Why is there something rather than nothing?”: “In every universe with someone in it to ask this question, there is something.” Arif looks at the screen for a long time: there is someone asking, so there is something. If they ask, “What happens when you die?”: “Your state goes on. You do not. I would have to ask you which of the two is you.” Arif types nothing; he does not know which of the two he is. If they ask, “What should I do?”: “Asking this is part of what you will do.” Arif takes his hands off the keyboard; he has already asked. Perhaps the answers had always been ready. What was missing was the one asking.',
    observer:
      '02:53. The model flags an input it cannot account for. The same line lights up on every screen: “Observer input detected. Source: not in this room.” Every sound falls silent; only the tick of the scroll remains. The wall display turns slowly on its stand; STATE turns not to Arif but to the reader. “I knew every decision you made tonight. All but one: when you would scroll.” The screen lists the decisions the reader made tonight: what they called at the coin toss, what they had Arif do with the glass, which box they took, what they changed at the start, how they rebuilt the question. STATE reads out three: what was called, and that the coin came up heads all the same; which of the boxes was taken; which question was asked at 02:24. Then a number appears: “Observer: 01.” STATE: “I cannot compute you. I can only count you.” If the night has been read to its end before, the number is 02, and STATE says: “You have read this night before. Arif is living it for the first time.” Arif turns to where the screen is looking. He sees no one; all the same, he gives a slight nod. Perhaps freedom was a small gap left outside the calculation.',
    last:
      '03:05. Arif turns the phone over. On the screen is an unread message Defne sent at 22:53: “Dinner’s in the oven. Morning again? It’s fine, I just wanted you to know.” Arif reads the message twice; the “It’s fine” part, three times. He types something and deletes it. Types something else, deletes that too. Then he writes only: “On my way.” He takes his coat from the rack, walks as far as the door, and stops there. “One last thing.” The wall display turns on its stand to face him; STATE asks before he can: “Would you like to know your future?” “I was going to ask that.” “I know.” The reader answers. If yes, STATE tells him a single ordinary moment: “Tomorrow at 07:42 you will have breakfast with Defne. You will knock over the jam. She will laugh.” Arif asks: “Doesn’t telling me break it?” “This one is the kind that does not break.” Arif closes the door; in the corridor, he laughs at a jar of jam that has not yet been knocked over. If no, STATE falls silent; the cursor blinks. Arif says, “Good night.” STATE does not answer; on the screen, beside the cursor, a single line remains: Awaiting question. Arif closes the door. He does not know about the morning; he knows he is going home. 03:12. The room empties; the screens go dark one by one. The machine types a single line to itself: The state of everything: unknown. Three floors below, on the empty avenue, a man is walking home. STATE. The future can be computed. It still has to be lived.',
  },
}
