/**
 * English edition of ÖTE — BEYOND (strings only, keyed by the Turkish original's ids).
 *
 * Notes for the translation:
 * - The narrator is "we": the company's people. The man is "he"; Turkish "onu"
 *   has no gender, so the closing repeat of the first sentence (`again`) is
 *   about the next client, a woman: "her".
 * - The slogan "Hayatınız, hayatımızdır" is "Your life is our business":
 *   a courteous corporate line that also says what the company trades in.
 * - The Turkish title is the first half of "ötenazi" (euthanasia); English
 *   cannot keep that echo, so BEYOND carries the other meaning of "öte".
 * - "büyük veriler" keeps its buzzword: "big data".
 */
import type { StoryTranslation } from '../types'

export const EN: StoryTranslation = {
  meta: {
    title: 'BEYOND',
    hook: 'Who would sign up for a journey with no way back?',
    tags: 'CONTRACT · VOYAGE · UNKNOWN',
    description: 'A signature, an elevator and a one-way ticket to the center of the galaxy, told by the company that watches them from behind the glass.',
    mood: 'COLD · COSMIC',
    warning: 'Deals with themes of death.',
  },

  chapters: {
    imza: 'SIGNATURE',
    kapi: 'THE DOOR',
    yolcular: 'PASSENGERS',
    kalkis: 'LAUNCH',
    yolculuk: 'THE VOYAGE',
    nokta: 'PALE BLUE DOT',
    varis: 'ARRIVAL',
    anahtar: 'THE KEY',
  },

  text: {
    // 01 — SIGNATURE
    watching: { lines: ['We were watching him sign the papers laid out on the table.'], sub: 'SCROLL' },
    serious: { lines: ['It was one of the most serious decisions he would ever make about his life.', 'Perhaps the most serious.'] },
    pen: { lines: ['He turned the blue-ink pen between his fingers, wondering whether he really wanted this.', 'We waited. No one in this room was ever rushed.'] },
    clauses: {
      lines: [
        'Every page in front of him was full of clauses protecting the company that offered this service.',
        'Refunds were paid only to those who could somehow get back in touch with the company.',
      ],
    },
    'clause-label': { lines: ['CLAUSE 14 · REFUND TERMS'] },
    never: { lines: ['It had never happened before,', 'for no one had ever come back from this point.'] },
    'last-page': { lines: ['The last sheet was slid in front of him. At the bottom, a blank line had been left for his signature.'] },
    slogan: { lines: ['“Thank you for choosing us.', 'Your life is our business…”'] },
    stuck: { lines: ['The sentence stuck in his ear and stayed there.'] },
    fortune: { lines: ['He had put almost everything he owned into this service.', 'There wasn’t a penny left in his pocket, and now there was no way back either.'] },
    signed: { lines: ['He put down the pen and handed the papers to the man on the other side of the table.', 'Everything was in order. As it always was.'] },

    // 02 — THE DOOR
    nod: { lines: ['Without a word, the official motioned with his head.', 'He did not even turn to look at the door behind him.'] },
    'other-door': { lines: ['He was asked to go through another door, directly opposite the one he had come in by.'] },
    heavy: { lines: ['The door opened, slow and heavy. Cold white light spilled through the gap.', 'He stepped inside.'] },
    elevator: { lines: ['He was taken into the elevator. Guards and officials stood beside him, in front of him and behind him.', 'No one spoke. No one looked at him, either.'] },
    pressure: { lines: ['As the elevator rose, the pressure inside seemed to build.', 'The floor indicator had long since passed the building’s last floor.'] },
    shuttle: { lines: ['When they reached the top floor, he was no longer in a building but inside a space shuttle.'] },
    'no-return': { lines: ['There was no way back.'] },

    // 03 — PASSENGERS
    others: { lines: ['There were thirty-two others like him.', 'Every head turned to him. He was the thirty-third passenger.'] },
    fortunes: { lines: ['All of them had signed their fortunes over to this company', 'and agreed to set out on a journey toward the same end.'] },
    'no-names': { lines: ['Nobody asked anyone’s name. Asking would only have led to the next question.'] },
    'announce-who': { lines: ['ANNOUNCEMENT'] },
    announce: { lines: ['— Please take any seat. The numbers do not matter.'] },
    random: { lines: ['Everyone sat down at random. Nobody argued over a window.'] },
    seat: { lines: ['The window seat fell to him.', 'An old woman sat down beside him; she laid her knitting in her lap and fastened his belt before her own.'] },

    // 04 — LAUNCH
    countdown: { lines: ['LAUNCH · T−10'] },
    engines: { lines: ['The engines fired.'] },
    gforce: { lines: ['Under crushing g-force, the passengers, strapped tight into their seats, left Earth’s atmosphere.', 'Through all the shaking, the old woman never let go of his hand.'] },
    blue: { lines: ['The clouds fell away below; in the window the blue thinned, then ran out.'] },
    route: { lines: ['The engines fell silent. The old woman’s ball of yarn rose from her lap and hung in the air.', 'The course was set for the center of the galaxy.'] },
    'route-panel': { lines: ['COURSE · GALACTIC CENTER · SGR A*'] },

    // 05 — THE VOYAGE
    years: { lines: ['The voyage would take years. It said so on page two of the contract.'] },
    equipped: { lines: ['The ship was fitted with state-of-the-art systems;', 'there were sufficient provisions, simulation decks, entertainment modules.'] },
    beach: {
      lines: [
        'Each morning the simulation deck opened on the same beach; each morning the waves broke in the same place.',
        'The old couple, hand in hand in their deckchairs, never missed a morning.',
      ],
    },
    guitar: {
      lines: [
        'The young man who had brought his guitar played the same song every evening and never finished it.',
        'The woman with the hospital bracelet on her wrist waited for the last note every time.',
      ],
    },
    holiday: { lines: ['Nobody was bored.', 'It was almost like a holiday.'] },

    // 06 — PALE BLUE DOT
    'pale-dot': { lines: ['Everyone looked out of the windows at the “pale blue dot.”', 'Earth was shrinking fast: first the size of a palm, then of a fingertip.'] },
    'last-time': { lines: ['This was the last time they would see it.'] },
    looked: { lines: ['The dot shrank to a single mote of light.', 'Then it became one of the stars, and he could never again tell which one.'] },
    closed: { lines: ['He would not remember Earth as a dot; he would remember it large, blue and near.', 'When he opened his eyes, there were only stars in the window.'] },
    data: { lines: ['Data and information flowed, if intermittently, between the ship, NASA and the other investor-sponsor partners.'] },
    soldiers: { lines: ['The passengers filed reports, like soldiers sent on a mission.', 'The man in the suit stood at attention every time.'] },
    'report-screen': { lines: ['REPORT IN.'] },
    sent: { lines: ['The reports came to us; we read every one and filed every one.', 'Writing back was not in the contract.'] },
    scarf: { lines: ['Years went by. The old woman’s scarf crossed the lounge end to end, went out the door and down the corridor.', 'No one asked who she was knitting it for.'] },

    // 07 — ARRIVAL
    arrived: { lines: ['At last, they arrived.'] },
    dark: { lines: ['Before them lay a darkness from which not even light could come back.', 'Around it, a ring was burning.'] },
    blueshift: { lines: ['As they drew closer, the light of the stars behind them turned blue.'] },
    faster: { lines: ['The signals from Earth came closer together; the date stamps streamed past too fast to read.', 'Years were passing there; on the ship, a few minutes.'] },
    crossed: { lines: ['The ship crossed the event horizon.'] },
    'no-return-2': { lines: ['Now there was no way back, for certain.', 'They were drifting into the black hole.'] },
    'looked-back': { lines: ['Again he looked out of the window. The whole universe they had left behind now fit inside a bright ring.'] },
    'eyes-open': { lines: ['This time he did not close his eyes. The whole universe they had left behind now fit inside a bright ring.'] },
    'looked-out': { lines: ['He looked out of the window. The whole universe they had left behind now fit inside a bright ring.'] },
    song: { lines: ['For the first time, the young man played the song to the end. The woman with the bracelet heard the last note.', 'The old woman tied off the last stitch of the scarf.'] },

    // 08 — THE KEY
    'our-screens': { lines: ['On our screens, the ship never crossed the event horizon.'] },
    froze: { lines: ['Its last image froze at the edge of the horizon; it reddened, and faded.', 'The packets thinned out. Then none came at all.'] },
    signal: { lines: ['K3 · NO SIGNAL'] },
    'read-ok-who': { lines: ['OFFICIAL'] },
    'read-ok': { lines: ['— Passenger thirty-three. Only report: “All is well.”'] },
    'read-earth-who': { lines: ['OFFICIAL'] },
    'read-earth': { lines: ['— Passenger thirty-three. Only report: “You should have seen Earth.”'] },
    'read-fear-who': { lines: ['OFFICIAL'] },
    'read-fear': { lines: ['— Passenger thirty-three. Only report: “I am not afraid.”'] },
    'read-none-who': { lines: ['OFFICIAL'] },
    'read-none': { lines: ['— Passenger thirty-three. No report.'] },
    filed: { lines: ['He read it without raising his voice, or lowering it.', 'Then we closed the file.'] },
    routine: { lines: ['This was something the company did as a matter of routine.'] },
    euthanasia: { lines: ['It merged requests for euthanasia with scientific discovery,', 'and so, in the name of humanity, big data was gathered.'] },
    third: { lines: ['They were the third team sent to the black hole.'] },
    before: { lines: ['The company had already sent teams to planets, moons, asteroids,', 'to the deepest points of the oceans.'] },
    places: { lines: ['to places where human life was impossible, where no one had been before,', 'and about which too little was known…'] },
    'wall-list': { lines: ['BLACK HOLE III · II · I · VENUS · MERCURY · EUROPA · TITAN · 433 EROS · MARIANA TRENCH'] },
    key: { lines: ['People who wanted to die', 'were the keys it used to open doors onto the unknown.'] },
    again: { lines: ['We were watching her sign the papers laid out on the table.'] },
    end: { lines: ['BEYOND'], sub: 'Your life is our business.' },
  },

  choices: {
    lastLook: {
      title: 'LAST LOOK',
      prompt: 'In the window, Earth was no more than a dot.',
      options: {
        look: { label: 'Look at Earth one last time.', reply: ['He rested his forehead on the cold glass. He did not take his eyes off the dot.'] },
        close: { label: 'Close your eyes.', reply: ['He rested his forehead on the glass and closed his eyes.'] },
      },
    },
    report: {
      title: 'DATA WINDOW · K3-33',
      prompt: 'Report in.',
      options: {
        ok: { tag: 'STATUS', label: 'All is well.', reply: ['He gave the camera a short nod.', 'PACKET SENT.'] },
        earth: { tag: 'OBSERVATION', label: 'You should have seen Earth.', reply: ['He turned the camera to the window. The picture showed only stars.', 'PACKET SENT.'] },
        fear: { tag: 'PERSONAL', label: 'I am not afraid.', reply: ['He looked straight into the lens. He did not blink.', 'PACKET SENT.'] },
      },
    },
  },

  discoveries: {
    watchers: { title: 'Behind the glass', verb: 'LOOK', lines: ['Three people stood behind the glass. One of them was taking notes.', 'Us.'] },
    folder: { title: 'The file', verb: 'READ', lines: ['FILE K3-33', 'Service type: ONE WAY. Missing documents: none.'] },
    tray: { title: 'Personal effects', verb: 'LOOK', lines: ['A keyring, an empty wallet, a photograph lying face down.', 'We did not turn the photograph over. That was not included in the service.'] },
    plaque: { title: 'The corridor plaque', verb: 'READ', lines: ['A brass plaque on the wall:', '“1,287 people have passed through this corridor to date. We thank every one of them.”'] },
    manifest: { title: 'Passenger manifest', verb: 'READ', lines: ['PASSENGER MANIFEST · K3 · 33 PERSONS', 'The “Reason” column was blank from top to bottom. Filling it in was not required.'] },
    pantry: { title: 'Provisions store', verb: 'READ', lines: ['PROVISIONS · 33 PERSONS · ONE WAY', 'Compartment reserved for the return: none.'] },
    'beach-seam': { title: 'The edge of the beach', verb: 'LOOK', lines: ['Where the screens met, the wave hitched for an instant and started over.', 'The old couple never looked that way.'] },
    'other-reports': {
      title: 'Report log',
      verb: 'READ',
      lines: ['Earlier reports:', '“K3-07: The same beach again today. No complaints.”', '“K3-21: What time is it there?”', '“K3-12: —”'],
    },
    'rear-window': { title: 'The rear window', verb: 'LOOK', lines: ['In the rear window, the stars had begun to turn blue.', 'Earth was back there somewhere. It must have grown old long ago.'] },
    refunds: { title: 'Refund counter', verb: 'LOOK', lines: ['REFUND REQUESTS · 0', 'The counter had not changed once since it was installed.'] },
  },

  captions: {
    '[camın ardından boğuk bir oda sesi]': '[muffled room tone through the glass]',
    '[kalem parmakların arasında tıkırdar]': '[a pen ticks between fingers]',
    '[sayfalar çevrilir]': '[pages turn]',
    '[kâğıt masada kayar]': '[paper slides across the table]',
    '[lambanın ince vızıltısı]': '[the thin hum of the lamp]',
    '[kalemin kâğıttaki cızırtısı]': '[the scratch of pen on paper]',
    '[kalem masaya bırakılır]': '[the pen is laid on the table]',
    '[ağır menteşeler gıcırdar, basınçlı bir tıslama]': '[heavy hinges groan; a pressurized hiss]',
    '[koridorda aynı tempoda adım sesleri]': '[footsteps in unison along the corridor]',
    '[asansör kapıları kapanır]': '[the elevator doors close]',
    '[asansörün yükselen uğultusu]': '[the rising hum of the elevator]',
    '[kulaklarda basınç çınlaması]': '[a pressure whine in the ears]',
    '[asansör zili]': '[elevator chime]',
    '[kapı arkasından kilitlenir]': '[the door locks behind him]',
    '[kalabalığın alçak mırıltısı]': '[the low murmur of a crowd]',
    '[mırıltı kesilir]': '[the murmur stops]',
    '[anons zili]': '[announcement chime]',
    '[kemer tokası tık diye kapanır]': '[a buckle clicks shut]',
    '[geri sayım bipleri]': '[countdown beeps]',
    '[motorların gürlemesi]': '[the roar of the engines]',
    '[gövde titrer, metal inler]': '[the hull shudders, metal groans]',
    '[motorlar susar]': '[the engines fall silent]',
    '[kayıttan dalga ve martı sesleri]': '[recorded waves and gulls]',
    '[gitar; şarkı hep aynı yerde kesilir]': '[guitar; the song always breaks off at the same place]',
    '[satranç taşı tahtaya konur]': '[a chess piece is set down on the board]',
    '[uzaktan gemi sistemlerinin uğultusu]': '[the distant hum of the ship’s systems]',
    '[kesik kesik veri sinyalleri]': '[broken bursts of data signal]',
    '[gönderim sinyali]': '[send tone]',
    '[örgü şişlerinin hızlanan tıkırtısı]': '[knitting needles clicking faster and faster]',
    '[derinden gelen bir uğultu]': '[a deep hum]',
    '[gelen sinyallerin bipleri hızlanır, bir uğultuya dönüşür]': '[incoming signal beeps quicken into a drone]',
    '[bütün sesler çekilir]': '[every sound drains away]',
    '[gitar; şarkı bu kez kesilmez]': '[guitar; this time the song does not break off]',
    '[son akor]': '[the last chord]',
    '[alçak, tek bir ton]': '[a single low tone]',
    '[sinyal sesleri seyrekleşir]': '[the signal sounds grow sparse]',
    '[düz, kesintisiz bir sinyal tonu]': '[a flat, unbroken signal tone]',
    '[görevlinin tekdüze sesi]': '[the official’s flat voice]',
    '[dosya kapanır]': '[a file closes]',
    '[damga]': '[a stamp]',
    '[evrak arabasının tekerlekleri]': '[the wheels of a file cart]',
    '[sessizlik]': '[silence]',
  },

  transcript: {
    imza:
      'We were watching him sign the papers laid out on the table. We were on this side of the glass, in the dark; he sat at a dark wooden table lit by a single lamp. It was one of the most serious decisions he would ever make about his life. Perhaps the most serious. He turned the blue-ink pen between his fingers, wondering whether he really wanted this. We waited. No one in this room was ever rushed. Every page in front of him was full of clauses protecting the company that offered this service. He stopped at clause fourteen: refunds were paid only to those who could somehow get back in touch with the company. He looked up at the official across from him; the official did not move. Behind him, the door he had come in by was closed. It had never happened before, for no one had ever come back from this point. The last sheet was slid in front of him. At the bottom, a blank line had been left for his signature; above it, two lines: “Thank you for choosing us. Your life is our business…” The sentence stuck in his ear and stayed there. On a tray at the edge of the table lay a keyring, an empty wallet and a photograph turned face down. He had put almost everything he owned into this service. There wasn’t a penny left in his pocket, and now there was no way back either. He signed. He put down the pen and handed the papers to the man on the other side of the table. Everything was in order. As it always was.',
    kapi:
      'Without a word, the official motioned with his head. He did not even turn to look at the door behind him. He was asked to go through another door, directly opposite the one he had come in by. He walked around the table to that door. The door opened, slow and heavy; cold white light spilled through the gap. He stepped inside. In a white corridor, guards and officials closed in around him; their footsteps echoed in a single rhythm. He was taken into the elevator. Guards and officials stood beside him, in front of him and behind him. No one spoke. No one looked at him, either. As the elevator rose, the pressure inside seemed to build. The floor indicator had long since passed the building’s last floor; the digits were racing too fast to read. When they reached the top floor, he was no longer in a building but inside a space shuttle. The elevator doors closed behind him, and the light above them turned red. There was no way back.',
    yolcular:
      'There were thirty-two others like him. Every head turned to him. He was the thirty-third passenger. All of them had signed their fortunes over to this company and agreed to set out on a journey toward the same end. Among them were an old woman holding a ball of blue yarn, a young man with a guitar case on his back, an elderly couple holding hands, a woman with a white hospital bracelet on her wrist, and a man in a suit who kept checking his watch. They nodded to one another, then looked away. Nobody asked anyone’s name. Asking would only have led to the next question. An announcement came: “Please take any seat. The numbers do not matter.” Everyone sat down at random. Nobody argued over a window. The window seat fell to him. An old woman sat down beside him; she laid her knitting in her lap and fastened his belt before her own.',
    kalkis:
      'The countdown began on the panel. Everyone was strapped in; the old couple held hands across the armrest. The engines fired. Under crushing g-force, the passengers, strapped tight into their seats, left Earth’s atmosphere. The shuttle tore up through the clouds on a column of fire. Through all the shaking, the old woman never let go of his hand. The clouds fell away below; in the window the blue thinned, then ran out. The engines fell silent. The old woman’s ball of yarn rose from her lap and hung in the air. The course appeared on the panel. The course was set for the center of the galaxy.',
    yolculuk:
      'The voyage would take years. It said so on page two of the contract. The ship was fitted with state-of-the-art systems; there were sufficient provisions, simulation decks, entertainment modules. Each morning the simulation deck opened on the same beach; each morning the waves broke in the same place. The old couple, hand in hand in their deckchairs, never missed a morning. In the evenings there was chess in the lounge, and the old woman knitted in her armchair. The young man who had brought his guitar played the same song every evening and never finished it. The woman with the hospital bracelet on her wrist waited for the last note every time. Nobody was bored. It was almost like a holiday.',
    nokta:
      'Everyone looked out of the windows at the “pale blue dot.” Earth was shrinking fast: first the size of a palm, then of a fingertip. This was the last time they would see it. Here the reader chooses. If he looked one last time, he rested his forehead on the cold glass and did not take his eyes off the dot: the dot shrank to a single mote of light; then it became one of the stars, and he could never again tell which one. If he closed his eyes, he rested his forehead on the glass and shut them: he would not remember Earth as a dot; he would remember it large, blue and near. When he opened his eyes, there were only stars in the window. Data and information flowed, if intermittently, between the ship, NASA and the other investor-sponsor partners. The passengers filed reports, like soldiers sent on a mission. The man in the suit stood at attention every time. When his turn came, there was a single line on the booth’s screen: “Report in.” Here, too, the reader chooses. If he said “All is well,” he gave the camera a short nod. If he said “You should have seen Earth,” he turned the camera to the window; the picture showed only stars. If he said “I am not afraid,” he looked straight into the lens without blinking. The packet was sent; the words “Awaiting reply” never left the screen. The reports came to us; we read every one and filed every one. Writing back was not in the contract. Years went by. The old woman’s scarf crossed the lounge end to end, went out the door and down the corridor. No one asked who she was knitting it for.',
    varis:
      'At last, they arrived. Before them lay a darkness from which not even light could come back. Around it, a ring was burning. As they drew closer, the light of the stars behind them turned blue. The signals from Earth came closer together; the date stamps streamed past too fast to read. Years were passing there; on the ship, a few minutes. The ship crossed the event horizon. Inside, nothing changed. Now there was no way back, for certain. They were drifting into the black hole. He turned to the window behind them. If he had looked at Earth one last time, he looked again; if he had closed his eyes, this time he did not. The whole universe they had left behind now fit inside a bright ring. For the first time, the young man with the guitar played the song to the end. The woman with the bracelet heard the note she had been waiting for. The old woman tied off the last stitch of the scarf. Then the ring’s light spilled through the window and drowned everything in white.',
    anahtar:
      'On our screens, the ship never crossed the event horizon. Its last image froze at the edge of the horizon; it reddened, and faded. The packets thinned out. Then none came at all. A single line remained on the screen: K3 · NO SIGNAL. The official from the signing table read his one report aloud: “Passenger thirty-three. Only report: …” Then comes the sentence the reader chose: “All is well,” “You should have seen Earth,” or “I am not afraid.” He read it without raising his voice, or lowering it. Then we closed the file. This was something the company did as a matter of routine. A new stack of files was wheeled into the room; the form on top was headed “Euthanasia Request Form.” It merged requests for euthanasia with scientific discovery, and so, in the name of humanity, big data was gathered. They were the third team sent to the black hole. The plaques on the wall named the places earlier teams had gone: Venus, Mercury, Europa, Titan, 433 Eros, the Mariana Trench… Under every plaque was the same number: thirty-three. The company had already sent teams to planets, moons, asteroids, to the deepest points of the oceans: to places where human life was impossible, where no one had been before, and about which too little was known… People who wanted to die were the keys it used to open doors onto the unknown. In the signing room, under the same lamp, a new client was turning the same blue pen between her fingers. We were watching her sign the papers laid out on the table. BEYOND. Your life is our business.',
  },
}
