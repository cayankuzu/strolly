/** English edition (strings only, keyed by the Turkish original's ids). */
import type { StoryTranslation } from '../types'

/**
 * ÖFKESEL DENEYİM SİMÜLASYONU → ANGER EXPERIENCE SIMULATION.
 * The service ÖFKE NÖBETİ is RAGE SHIFT everywhere (the shift your rage is
 * moved onto someone else); the chapter NÖBET, the fit itself, is THE FIT.
 * "Yaka" stays a collar in both places it matters: the boss's collar Arif
 * seizes and the number on the convict's collar. American spelling.
 */
const ARIF = 'ARIF'
const BOSS = 'BOSS'
const STAFF = 'ATTENDANT'

const LAUGH = '— Hahaha… Sorry, Arif, I can’t let you go.'
const MONEY = '— You make us a lot of money.'
const SHH = '— Shh… Go on, out. Close the door behind you.'

export const EN: StoryTranslation = {
  meta: {
    title: 'ANGER EXPERIENCE SIMULATION',
    hook: 'If the state gave you a room to vent your anger in, would you go in?',
    tags: 'ANGER · STATE · HALLUCINATION',
    description: 'When his boss won’t accept his resignation, Arif turns to a free service run by the state: Rage Shift. Then the same room, from the other side.',
    mood: 'CLINICAL · TENSE',
    warning: 'Contains violence and an execution; sexual crime is mentioned.',
  },

  chapters: {
    resign: 'RESIGNATION',
    road: 'THE ROAD',
    service: 'THE SERVICE',
    room: 'THE ROOM',
    fit: 'THE FIT',
    price: 'THE PRICE OF SERVICE',
    clean: 'CLEANUP',
    convict: '333',
    door: 'THE DOOR',
  },

  text: {
    // 01 — RESIGNATION
    rehearsed: { lines: ['For four months he had been rehearsing the same sentence.'], sub: 'SCROLL' },
    stood: { lines: ['He got up from his desk, sure of himself.'] },
    look: { lines: ['He took a long look around, at the people near him.', 'Every head was bowed over a desk.'] },
    sigh: { lines: ['He let out a deep sigh.', 'He straightened his glasses and his tie.'] },
    steps: { lines: ['With short, hard steps he walked toward the door across from him. He knocked.'] },
    'come-in-who': { lines: ['FROM INSIDE'] },
    'come-in': { lines: ['— Come in.'] },
    sweat: { lines: ['Wiping the beads of sweat from his forehead with one hand, he opened the door with the other.', 'He stepped in quickly and closed the door behind him.'] },
    feet: { lines: ['The man across from him had his feet up on the desk, scrolling through something on his phone.'] },
    'what-who': { lines: [BOSS] },
    what: { lines: ['— What is it?'] },
    'ask-1-who': { lines: [ARIF] },
    'ask-1': { lines: ['— Sir, if I may, would you accept my resignation? I can’t take it anymore.'] },
    'ask-2-who': { lines: [ARIF] },
    'ask-2': { lines: ['— You’ve been putting me off for four months. Please, give me my severance and accept my resignation…'] },
    'haha-who': { lines: [BOSS] },
    haha: { lines: [LAUGH] },
    'earn-who': { lines: [BOSS] },
    earn: { lines: ['— You make us a lot of money. Now, straight back to work.'] },
    'but-who': { lines: [ARIF] },
    but: { lines: ['— But sir…'] },
    'shh-who': { lines: [BOSS] },
    shh: { lines: [SHH] },
    'okay-who': { lines: [ARIF] },
    okay: { lines: ['— Yes, sir.'] },
    ajar: { lines: ['He walked out with quick steps. He left the door open on purpose.'] },
    curse: { lines: ['Walking back to his seat, he was chewing curses under his breath.'] },

    // 02 — THE ROAD
    'six-who': { lines: ['18:00'] },
    pack: { lines: ['When the workday ended, he packed up quickly and headed for the elevator.'] },
    full: { lines: ['But the elevator was full. The doors closed in his face.'] },
    stairs: { lines: ['He went straight for the stairs.', 'Down he went, taking the steps three and five at a time.'] },
    out: { lines: ['At last he reached the outer door.', 'He jumped into his car and set the route on the digital screen.'] },
    'route-screen': { lines: ['ROUTE · RAGE SHIFT · 23 MIN · ARRIVAL 18:32'] },
    clear: { lines: ['He knew exactly where he was going:'] },
    destination: { lines: ['RAGE SHIFT'] },
    radio: { lines: ['He didn’t turn on the radio the whole way.', 'His lips were moving; he was lining up everything he hadn’t been able to say in four months.'] },
    billboard: { lines: ['DON’T TAKE YOUR ANGER HOME · RAGE SHIFT'] },

    // 03 — THE SERVICE
    sign: { lines: ['RAGE SHIFT · A FREE PUBLIC SERVICE'] },
    in: { lines: ['He got out of the car and went straight into the building.'] },
    'welcome-1-who': { lines: [STAFF] },
    'welcome-1': { lines: ['— Welcome to Rage Shift, sir.'] },
    'welcome-2-who': { lines: [STAFF] },
    'welcome-2': { lines: ['— I do hope you’re furious, and that it’s been a dreadful day for you…'] },
    device: { lines: ['They sat him down in a chair at once and lowered a device over his head.', 'Reaching down to his neck, it scanned his memory and mapped every moment he had been angry.'] },
    scanning: { lines: ['SCANNING MEMORY'] },
    uploaded: { lines: ['UPLOAD COMPLETE'] },
    peaks: { lines: ['On the screen before him was the whole day’s anger, hour by hour.', 'One of the peaks stood far above the rest.'] },
    'map-label': { lines: ['ANGER MAP · TODAY · 18:44'] },
    picked: { lines: ['Arif chose the moment with his boss in it.'] },
    'how-many-who': { lines: [STAFF] },
    'how-many': { lines: ['— Number of copies? One or more, on request.'] },
    'one-shape': { lines: ['A single silhouette appeared on the screen.'] },
    'two-shapes': { lines: ['Two silhouettes appeared on the screen, side by side.'] },
    lens: { lines: ['Then the attendants fitted lenses to his eyes with a machine.', 'For a moment everything blurred, then came sharp again.'] },
    pill: { lines: ['Next, they had him swallow a pill.'] },
    clothes: { lines: ['They asked him to change and handed him a set of special clothes.'] },
    'glasses-who': { lines: [STAFF] },
    glasses: { lines: ['— Leave your glasses too. You won’t need them in there.'] },

    // 04 — THE ROOM
    five: { lines: ['About five minutes later they took him to a pure white room.'] },
    closed: { lines: ['They left him in the room and closed the door.', 'Where the door had been, only a thin line remained in the wall.'] },
    color: { lines: ['All at once, everything began to take on color.'] },
    pixels: { lines: ['The whiteness began to give way to an office.', 'Looking around, he could watch the white walls turn into an office pixel by pixel, step by step.'] },
    towel: { lines: ['Just as water slowly takes over the dry patches of a towel dropped in a puddle,', 'the office’s pigments were slowly taking over the white…'] },
    same: { lines: ['The room had become his boss’s office, exactly as it was this morning.', 'It was that moment exactly, down to every detail he could remember.'] },
    appear: { lines: ['A man appeared, his feet stretched out on the desk.', 'He looked just like his boss; he was the very same.'] },
    'appear-two': { lines: ['A man appeared, his feet stretched out on the desk. Another, by the window.', 'Both looked just like his boss; both were the very same.'] },

    // 05 — THE FIT
    'copy-laugh-who': { lines: [BOSS] },
    'copy-laugh': { lines: [LAUGH] },
    'copy-money-who': { lines: [BOSS] },
    'copy-money': { lines: [MONEY] },
    'copy-shh-who': { lines: [BOSS] },
    'copy-shh': { lines: [SHH] },
    lost: { lines: ['Beside himself, he began to shout and seized his boss by the collar.', 'He spat out every curse that came to his tongue.'] },
    'shout-1-who': { lines: [ARIF] },
    'shout-1': { lines: ['— Enough! Everything I’ve put up with from you…'] },
    'shout-2-who': { lines: [ARIF] },
    'shout-2': { lines: ['— You can’t keep me here like a slave! Damn you!'] },
    blows: { lines: ['He threw punch after punch; the boss’s mouth, nose, face, eyes were coming apart.', 'He slammed him from wall to wall. He was spewing out all his rage.'] },
    could: { lines: ['The man he was thrashing was his boss, exactly.', 'What he could not do then, he could do now.'] },
    monitor: { lines: ['His rage had not subsided. He slammed the man’s head into the monitor, then into the wall.', 'Then he reached for the pens in the pen holder…'] },
    subside: { lines: ['Then it subsided.'] },
    'subside-two': { lines: ['The other one was still looking at his phone. Arif turned to him.', 'Then it subsided.'] },

    // 06 — THE PRICE OF SERVICE
    done: { lines: ['Arif had finished the job.'] },
    free: { lines: ['He felt happy to have made use of this service, which the state provided free of charge.'] },
    'how-cap': { lines: ['RAGE SHIFT · HOW DOES IT WORK?'] },
    'how-1': { lines: ['Here we recreate the person who angers you: their physical features, their looks, all of that moment.'] },
    'how-2': { lines: ['With the lenses we fit and the pill we give you, you see the person in the room as the one who angered you.'] },
    'how-3': { lines: ['The person in the room is a serious offender whose death sentence is final: a rapist, a murderer, etc.'] },
    'how-4': { lines: ['One or more copies, on request.'] },
    'how-5': { lines: ['Then you relive the moment you got angry.'] },
    hallu: { lines: ['In fact, you only think you are reliving it. You are seeing a kind of schizophrenic hallucination.'] },
    'say-do': { lines: ['With your anger at its peak, you say what you couldn’t say then, and do what you couldn’t do.'] },
    'no-limit': { lines: ['There are no limits, and everything is allowed.'] },
    executed: { lines: ['This way, the convict is executed, and you get to let off some steam.'] },
    dress: { lines: ['Arif tidied himself up. He took off the clothes he had been given and put on his own.', 'He put on his glasses.'] },
    gone: { lines: ['He left the way he had come, got into his car and drove away.'] },

    // 07 — CLEANUP
    'staff-in': { lines: ['Attendants came into the room.'] },
    corner: { lines: ['Everything was pure white except for one corner of the room.', 'In that corner, on the floor, lay a body; around it, traces of blood.'] },
    'corner-two': { lines: ['Everything was pure white except for one corner of the room.', 'In that corner, on the floor, lay two bodies; around them, traces of blood.'] },
    drag: { lines: ['The attendants walked in with sure steps.', 'They dragged the body out of the room.'] },
    'drag-two': { lines: ['The attendants walked in with sure steps.', 'They dragged the bodies out of the room.'] },
    cleaners: { lines: ['Then the cleaners came into the room.'] },
    restart: { lines: ['Everything was cleaned, and the process began again.'] },
    ready: { lines: ['ROOM 3 · READY'] },

    // 08 — 333
    'evening-who': { lines: ['THE SAME EVENING · 18:21'] },
    transfer: { lines: ['He had been transferred from the prison to this center.'] },
    crime: { lines: ['His crime was rape and murder.', 'The number on his collar was 333.'] },
    bound: { lines: ['His hands were cuffed, his feet shackled, a black bag over his head.', 'For clothing he had only his underwear.'] },
    platform: { lines: ['He was taken out of the van. He was put on a moving platform.'] },
    'platform-two': { lines: ['He was taken out of the van. He was put on a moving platform.', 'Another was taken out behind him. The number on his collar was 334.'] },
    wash: { lines: ['Here he passed into a system just like a car wash:', 'foam, water, brushes…'] },
    reading: { lines: ['Then the platform moved on; this time it came to a room with giant speakers and screens.'] },
    crimes: { lines: ['Here his crimes were read out down to the last detail, with fitting sounds played in the background.'] },
    inject: { lines: ['The platform moved on once more. He was given a pill, lenses were fitted to his eyes, and he was injected.'] },
    resist: { lines: ['All of these procedures were to keep the criminal from resisting or fighting back.'] },

    // 09 — THE DOOR
    arrived: { lines: ['Then the platform moved on and came to a pure white room.', 'There he lay, half conscious.'] },
    'arrived-two': { lines: ['Then the platform moved on and came to a pure white room.', 'There he lay beside 334, half conscious.'] },
    'door-opens': { lines: ['Across the room, a door opened.'] },
    man: { lines: ['A man came in;', 'he was coming at him, hurling curses…'] },
    end: { lines: ['ANGER EXPERIENCE SIMULATION'], sub: 'RAGE SHIFT · A FREE PUBLIC SERVICE' },
  },

  choices: {
    moment: {
      title: 'ANGER MAP · 09:14 · THE BOSS’S OFFICE',
      prompt: 'Choose the moment you want to relive.',
      options: {
        laugh: { tag: '09:14:31 · 91%', label: '“Hahaha… Sorry, Arif, I can’t let you go.”', speaker: STAFF, reply: ['The laugh. An excellent choice, sir.'] },
        money: { tag: '09:14:38 · 94%', label: '“You make us a lot of money.”', speaker: STAFF, reply: ['That line has been very popular this month.'] },
        shh: { tag: '09:14:52 · 97%', label: '“Shh… Go on, out. Close the door behind you.”', speaker: STAFF, reply: ['The highest peak. Most people choose that one.'] },
      },
    },
    copies: {
      title: 'NUMBER OF COPIES',
      prompt: 'How many copies?',
      options: {
        one: { label: 'One will do.', speaker: STAFF, reply: ['A single copy. A classic choice.'] },
        two: { label: 'Make it two.', speaker: STAFF, reply: ['Two copies. No extra charge, sir.', 'The state covers it.'] },
      },
    },
  },

  discoveries: {
    letter: { title: 'Resignation letter', verb: 'READ', lines: ['A letter of resignation. The date has been crossed out and rewritten four times.', 'The last date: today.'] },
    'boss-phone': { title: 'The boss’s phone', verb: 'LOOK', lines: ['A vacation listing was open on the boss’s phone.', 'Seven nights, all inclusive. “Added to cart.”'] },
    'visit-card': { title: 'Membership card', verb: 'READ', lines: ['A membership card lay on the passenger seat.', 'RAGE SHIFT · Arif K. · 17th visit.'] },
    'anger-map': {
      title: 'Anger map',
      verb: 'READ',
      lines: ['08:31 · Traffic · 31%', '09:14 · The boss’s office · 97%', '09:16 · The door left open · 64%', '12:40 · The cafeteria line · 19%', '18:02 · The elevator · 38%'],
    },
    shadow: { title: 'The shadow in the corner', verb: 'LOOK', lines: ['In the corner lay a shadow that nothing was casting.'] },
    'morning-window': { title: 'Morning window', verb: 'LOOK', lines: ['Morning sun was coming in through the window.', 'Outside, it had been evening for an hour.'] },
    'collar-tag': { title: 'The tag in the collar', verb: 'LOOK', lines: ['Inside the shirt collar, for an instant, a white tag appeared: 333.', 'Then it was just a collar again.'] },
    'fine-print': { title: 'The fine print', verb: 'READ', lines: ['At the bottom of the screen, in small letters:', '“Convicts are assigned in order of execution. The convict’s identity is not shared with the user.”'] },
    'cleaning-log': { title: 'Cleaning log', verb: 'READ', lines: ['Cleaning log · ROOM 3', 'Seventh use today. Average duration: twelve minutes.'] },
    manifest: { title: 'Transfer list', verb: 'READ', lines: ['Transfer list: 331 ✓ · 332 ✓ · 333 · 334', 'Next to 333, in handwriting: ROOM 3.'] },
  },

  captions: {
    '[klavye tıkırtıları, uzakta çalan bir telefon]': '[keyboards clicking, a phone ringing in the distance]',
    '[kapıya iki kez vurulur]': '[two knocks on the door]',
    '[kapı kapanır]': '[the door closes]',
    '[patron kahkaha atar]': '[the boss bursts out laughing]',
    '[kapı açılır ve açık kalır]': '[the door opens and stays open]',
    '[mırıltıyla küfürler]': '[muttered curses]',
    '[mesai biter: sandalyeler, fermuarlar]': '[the workday ends: chairs, zippers]',
    '[asansör zili]': '[elevator chime]',
    '[asansör kapıları kapanır]': '[the elevator doors close]',
    '[merdivende hızlı adımlar]': '[fast footsteps on the stairs]',
    '[ağır bir kapı açılır, sokak gürültüsü]': '[a heavy door opens; street noise]',
    '[araba kapısı kapanır]': '[a car door shuts]',
    '[ekranda bir onay sesi]': '[a confirmation tone from the screen]',
    '[motor, akşam trafiği]': '[engine; evening traffic]',
    '[otomatik kapı açılır; yumuşak bir müzik]': '[automatic doors slide open; soft music]',
    '[aygıt iner; alçak bir vızıltı]': '[the device lowers; a low hum]',
    '[yükleme tamamlandı sesi]': '[upload-complete chime]',
    '[kısa bir tıslama]': '[a short hiss]',
    '[bir yudum su]': '[a sip of water]',
    '[dolap kapağı açılır]': '[a locker door opens]',
    '[koridorda adımlar]': '[footsteps in the corridor]',
    '[kapı tıslayarak kapanır]': '[the door hisses shut]',
    '[sessizlik]': '[silence]',
    '[alçak bir uğultu yükselir]': '[a low drone rises]',
    '[buz çatırtısına benzer ince bir çıtırtı]': '[a faint crackle, like ice cracking]',
    '[ofis sesleri belirir: klavye, uzakta bir telefon]': '[office sounds fade in: keyboards, a distant phone]',
    '[aynı kahkaha]': '[the same laugh]',
    '[aynı ses, iki ağızdan]': '[the same voice, from two mouths]',
    '[sandalye devrilir]': '[a chair topples]',
    '[bağırış]': '[shouting]',
    '[boğuk darbeler]': '[muffled blows]',
    '[duvara çarpan bir gövde; bir çerçeve düşer]': '[a body hits the wall; a frame falls]',
    '[monitör patlar]': '[the monitor bursts]',
    '[kalemlik devrilir, kalemler yere saçılır]': '[the pen holder tips over; pens scatter across the floor]',
    '[sessizlik; yalnızca soluk]': '[silence; only breathing]',
    '[yumuşak bir zil]': '[a soft chime]',
    '[kapı tıslayarak açılır]': '[the door hisses open]',
    '[tanıtım filminin neşeli müziği]': '[the cheerful music of the promotional film]',
    '[müzik neşeli bir notayla biter]': '[the music ends on a cheerful note]',
    '[motor çalışır]': '[an engine starts]',
    '[zeminde sürüklenen bir yük]': '[a weight dragged across the floor]',
    '[kova, paspas, zemin makinesi]': '[bucket, mop, floor scrubber]',
    '[bir bip; duvarın ardında bir mekanizma çalışır]': '[a beep; behind the wall, a mechanism starts]',
    '[minibüsün arka kapıları açılır]': '[the van’s rear doors open]',
    '[zincir şıkırtısı]': '[chains rattle]',
    '[yürüyen bant çalışır]': '[the conveyor starts]',
    '[köpük püskürür; su; dönen fırçalar]': '[foam sprays; water; spinning brushes]',
    '[dev hoparlörlerden bir ses suçları tek tek okur]': '[from giant speakers, a voice reads out the crimes one by one]',
    '[arkada siren, mahkeme salonu uğultusu, tokmak]': '[behind it: sirens, a courtroom murmur, a gavel]',
    '[robot kol; kısa bir tıslama]': '[a robotic arm; a short hiss]',
    '[iğnenin klik sesi]': '[the click of the needle]',
    '[ağır, ilaçlı bir soluk]': '[heavy, drugged breathing]',
    '[boğuk küfürler; yaklaşan kısa, sert adımlar]': '[muffled curses; short, hard steps coming closer]',
  },

  transcript: {
    resign:
      'It was morning; keyboards were clicking in the open-plan office. For four months Arif had been rehearsing the same sentence. He got up from his desk, sure of himself. He took a long look around, at the people near him; every head was bowed over a desk. He let out a deep sigh and straightened his glasses and his tie. With short, hard steps he walked toward the door across from him and knocked. From inside, a voice: “Come in.” Wiping the beads of sweat from his forehead with one hand, he opened the door with the other; he stepped in quickly and closed the door behind him. The man across from him had his feet up on the desk, scrolling through something on his phone. Without looking up, he asked: “What is it?” “Sir, if I may, would you accept my resignation? I can’t take it anymore. You’ve been putting me off for four months. Please, give me my severance and accept my resignation…” The boss laughed: “Hahaha… Sorry, Arif, I can’t let you go. You make us a lot of money. Now, straight back to work.” Before Arif could get further than “But sir…”, the boss raised a finger to his lips: “Shh… Go on, out. Close the door behind you.” “Yes, sir,” said Arif. He walked out with quick steps. He left the door open on purpose. Walking back to his seat, he was chewing curses under his breath.',
    road:
      'At 18:00 the workday ended. Arif packed up quickly and headed for the elevator. But the elevator was full; the people inside looked at him, nobody moved, and the doors closed in his face. He went straight for the stairs and went down, taking the steps three and five at a time. At last he reached the outer door. He jumped into his car and set the route on the digital screen. He knew exactly where he was going: RAGE SHIFT. The screen said twenty-three minutes, arrival 18:32. He didn’t turn on the radio the whole way. His lips were moving; he was lining up everything he hadn’t been able to say in four months. As the city lights came on, a billboard went by at the side of the road: “Don’t take your anger home. Rage Shift.”',
    service:
      'He got out of the car and went straight into the building. On the facade, green letters spelled RAGE SHIFT, and beneath them, “A free public service.” The attendants greeted him with smiles: “Welcome to Rage Shift, sir. I do hope you’re furious, and that it’s been a dreadful day for you…” They sat him down in a chair at once and lowered a device over his head. Reaching down to his neck, the device scanned his memory and mapped every moment he had been angry. Upload complete. On the screen before him was the whole day’s anger, hour by hour: the morning traffic, the cafeteria line, the elevator that evening… One of the peaks stood far above the rest: 09:14, the boss’s office, ninety-seven percent. The screen opened that moment second by second: the laugh, “You make us a lot of money,” and “Shh… Go on, out.” (The reader chooses which one is relived.) Arif chose the moment with his boss in it. The attendant asked how many copies: one or more, on request. (The reader chooses one copy or two.) A single silhouette appeared on the screen; if two copies were requested, two silhouettes side by side. There was no extra charge; the state covered it. Arif took off his glasses and held them in his palm. Then the attendants fitted lenses to his eyes with a machine; for a moment everything blurred, then came sharp again. Next, they had him swallow a pill. They asked him to change and handed him a set of special clothes, pale gray. “Leave your glasses too. You won’t need them in there,” said the attendant. Arif left his glasses in the locker, on top of his folded shirt.',
    room:
      'About five minutes later they took him to a pure white room. They left him in the room and closed the door. Where the door had been, only a thin line remained in the wall. The room was empty; only in one corner was there a faint shadow that nothing was casting. All at once, everything began to take on color. The whiteness began to give way to an office. Looking around, he could watch the white walls turn into an office pixel by pixel, step by step. Just as water slowly takes over the dry patches of a towel dropped in a puddle, the office’s pigments were slowly taking over the white… The room had become his boss’s office, exactly as it was this morning. It was that moment exactly, down to every detail he could remember; morning sun was coming in through the window, though outside it had been evening for an hour. A man appeared, his feet stretched out on the desk. He looked just like his boss; he was the very same. If two copies had been requested, another one appeared in front of the window; he, too, was looking at his phone.',
    fit:
      'The man at the desk said the line of the chosen moment: “Hahaha… Sorry, Arif, I can’t let you go,” or “You make us a lot of money,” or “Shh… Go on, out. Close the door behind you.” Beside himself, Arif began to shout and seized his boss by the collar. He spat out every curse that came to his tongue: “Enough! Everything I’ve put up with from you… You can’t keep me here like a slave! Damn you!” He threw punch after punch; the boss’s mouth, nose, face, eyes were coming apart. He slammed him from wall to wall. He was spewing out all his rage. The man he was thrashing was his boss, exactly. What he could not do then, he could do now. With every blow the light flashed, and patches of the walls turned white before becoming the office again. His rage had not subsided. He slammed the man’s head into the monitor, then into the wall. Then he reached for the pens in the pen holder… If there were two copies, the other one had been looking at his phone the whole time; Arif turned to him next. Then it subsided.',
    price:
      'Arif had finished the job. When the door opened, he was smiling. He felt happy to have made use of this service, which the state provided free of charge. On the screen in the locker room, the service’s cheerful promotional film was playing: Rage Shift, how does it work? Here we recreate the person who angers you: their physical features, their looks, all of that moment. With the lenses we fit and the pill we give you, you see the person in the room as the one who angered you. The person in the room is a serious offender whose death sentence is final: a rapist, a murderer, etc. One or more copies, on request. Then you relive the moment you got angry. In fact, you only think you are reliving it. You are seeing a kind of schizophrenic hallucination. With your anger at its peak, you say what you couldn’t say then, and do what you couldn’t do. There are no limits, and everything is allowed. This way, the convict is executed, and you get to let off some steam. Arif was not looking at the screen. He tidied himself up. He took off the clothes he had been given and put on his own. He put on his glasses. He left the way he had come, got into his car and drove away.',
    clean:
      'Attendants came into the room. Everything was pure white except for one corner of the room. In that corner, on the floor, lay a body; if two copies had been requested, two bodies. Around them were traces of blood. The attendants walked in with sure steps. They dragged the body out of the room. Then the cleaners came into the room. Everything was cleaned, and the process began again. The light above the door turned green: ROOM 3 · READY.',
    convict:
      'The same evening, 18:21. He had been transferred from the prison to this center. His crime was rape and murder. The number on his collar was 333. His hands were cuffed, his feet shackled, a black bag over his head. For clothing he had only his underwear. He was taken out of the van. He was put on a moving platform. If two copies had been requested, another was taken out behind him; the number on his collar was 334. Here he passed into a system just like a car wash: foam, water, brushes… Then the platform moved on; this time it came to a room with giant speakers and screens. Here his crimes were read out down to the last detail, with fitting sounds played in the background. The platform moved on once more. He was given a pill, lenses were fitted to his eyes, and he was injected. All of these procedures were to keep the criminal from resisting or fighting back.',
    door:
      'Then the platform moved on and came to a pure white room. There he lay, half conscious; if two copies had been requested, beside 334. On the far wall, a thin line showed where the door was. Across the room, a door opened. A man came in. He wore special clothes, pale gray; he had no glasses. The door closed behind him. The man stood still for a moment and looked at the white walls, as if he were watching something spread across them. Then he turned toward the corner. Hurling curses, with short, hard steps, he was coming at him… Everything went black.',
  },
}
