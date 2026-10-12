/** English edition (strings only, keyed by the Turkish original's ids). */
import type { StoryTranslation } from '../types'

export const EN: StoryTranslation = {
  meta: {
    title: 'OBSESSION',
    hook: 'What is your mother sewing at midnight?',
    tags: 'NIGHT · FAMILY · HORROR',
    description: 'A mother who sits down at her sewing machine at midnight, a boy who cannot send her back to bed, and everything in that house that nobody uses any more.',
    mood: 'DARK · UNSETTLING',
    warning: 'Contains graphic violence and body horror.',
  },

  chapters: {
    midnight: 'MIDNIGHT',
    stairs: 'THE STAIRS',
    door: 'THE DOOR',
    pedal: 'THE TREADLE',
    dawn: 'DAWN',
    morning: 'MORNING',
    kitchen: 'THE KITCHEN',
  },

  text: {
    // 01 — MIDNIGHT
    nothing: { lines: ['Nothing in this house ever went to waste.'], sub: 'SCROLL' },
    getup: {
      lines: ['At midnight he climbed slowly out of bed to go to the toilet.', 'Shafts of streetlight kept the room from pitch darkness; he had no trouble finding his way.'],
    },
    sounds: {
      lines: ['On his way to the toilet he heard sounds coming from downstairs.', 'Were they real, or was he still half asleep, caught in the tail of a dream? He couldn’t tell.'],
    },
    whispers: {
      lines: ['Without taking it too seriously, he went into the toilet; he didn’t switch on the light.', 'But the sounds went on, and woven through them, it seemed, were whispers and moans.'],
    },
    hers: {
      lines: ['It was his mother’s voice.', 'She was at the sewing machine again in the dead of night, turning whatever came to hand into rags.'],
    },

    // 02 — THE STAIRS
    decide: {
      lines: ['He decided to go down. He had told her a hundred times to do it in the morning; it never did any good.', 'The cupboard at the top of the stairs was full of folded rags. Each had once been something else.'],
    },
    louder: {
      lines: ['As he went down the stairs, the sounds swelled in the silence of the night until they were unbearable.', 'His mother’s moans were giving way to words.'],
    },
    'below-who': { lines: ['MOTHER'] },
    below: { lines: ['— Hee-hee-hee… yesss… just like that.', 'You’ll be someone useful now.'] },
    'worn-who': { lines: ['MOTHER'] },
    worn: { lines: ['— Nobody used you any more, you were all worn out… heh-heh-heh-heh…'] },
    sure: {
      lines: ['Hearing that, he was certain she was making rags again, and he grew angry.', 'He quickened his pace.'],
    },
    saw: {
      lines: ['Through the half-open door he saw the shadow cast on the wall.', 'The shadow of the long, scrawny, wrinkled figure at the sewing machine was a terrible thing to see.'],
    },

    // 03 — THE DOOR
    'enter-in': { lines: ['He went in. His mother sat in front of the window, her back to the door.', 'Beside her lay a heap of fabric.'] },
    'enter-call': { lines: ['Through the gap he could see only the shadow on the wall.', 'With every stitch, the shadow’s elbow rose and fell.'] },
    'shout-who': { lines: ['BOY'] },
    shout: { lines: ['— Mum, that’s enough. Please go to sleep, finish it tomorrow.', 'I can’t sleep, enouuugh!'] },
    'trance-in': {
      lines: ['His mother seemed to be in a trance; unresponsive, she worked the treadle, moaning between the creaks.', 'Even this close, in the dark of the room, he couldn’t make out what she was sewing.'],
    },
    'trance-call': {
      lines: ['His mother seemed to be in a trance; unresponsive, she worked the treadle, moaning between the creaks.', 'In the dark of the room he couldn’t quite make out what she was sewing.'],
    },
    closed: { lines: ['He shut the door to her room and went back upstairs to sleep.'] },
    kept: { lines: ['His mother went on sewing.'] },

    // 04 — THE TREADLE
    body: { lines: ['Beside the sewing machine, in the corner the light didn’t reach, there was a lifeless body.'] },
    'corner-in': { lines: ['Moments ago, the boy had stood only a few steps away from it.'] },
    'corner-call': { lines: ['Looking in through the gap in the door, the boy hadn’t been able to tell this corner from the dark.'] },
    sitting: { lines: ['It sat in the dark, propped against the wall; its feet stretched out into the streetlamp’s light.', 'There was no skin on its feet.'] },
    hard: {
      lines: ['The mother pressed the treadle so hard that with every press the lifeless body slid, little by little.', 'It was dragged toward the light, leaving streaks of blood on the wall.'],
    },
    count: { lines: ['Once,', 'twice,', 'three times…'] },
    fell: { lines: ['One last press, and the body fell fully into the light.', 'Behind it, on the wall and on the floor: streaks of blood, pools of blood.'] },

    // 05 — DAWN
    seen: { lines: ['In the light it was easier to make out: all of its skin had been stripped away.'] },
    peeled: {
      lines: ['The muscles of its back lay bare; blood had pooled on them and clotted.', 'No skin was left anywhere on it; from scalp to toes, every inch had been meticulously peeled away.'],
    },
    day: { lines: ['The streetlamp went out. Slowly the day was breaking; the room grew light.', 'The first rays of the sun fell on the mother’s sewing table.'] },
    'not-cloth': { lines: ['The pieces lying on the table were not cloth.', 'They were the skin of the lifeless body, meticulously flayed.'] },
    works: { lines: ['The mother fed the skins through her sewing machine, muttering to herself.'] },
    'good-boy-who': { lines: ['MOTHER'] },
    'good-boy': { lines: ['— Yesss… you’re a good boy, you are.', 'Now you’ll be good for something… hee-hee-hee…'] },
    'remake-who': { lines: ['MOTHER'] },
    remake: { lines: ['— I’m creating you all over again… You should thank me…'] },
    joins: {
      lines: ['She hadn’t been able to take the skin off in one piece, so she was joining it back together, bit by bit.', 'The scalp had come off whole; but the arms, the torso and the legs were all separate.'],
    },
    order: { lines: ['First she had sewn the head to the torso. Now she was working at fitting the arms and legs…'] },

    // 06 — MORNING
    woke: {
      lines: ['The boy woke up. The room was full of ordinary morning light.', 'His brother wasn’t in his bed; he’d probably got up first and was downstairs making coffee.'],
    },
    lately: {
      lines: ['He thought of how withdrawn his brother had been lately: headphones on, face to the wall.', 'They weren’t close the way they used to be. A sadness settled over his whole body.'],
    },
    'make-up': {
      lines: ['He wanted to go to him right away, make things right between them, help him with whatever was wrong.', 'They could play games together again, like before.'],
    },
    ran: { lines: ['Without even washing his face he dashed for the stairs and took them two at a time.'] },
    passed: { lines: ['He hurried past his mother’s room. The door was open.'] },
    could: { lines: ['Had he looked in, he could have seen the carnage.'] },

    // 07 — THE KITCHEN
    back: {
      lines: ['When he reached the kitchen, his mother was wiping the floor, her back to him.', 'The stove was cold; nobody had made coffee. Not seeing his brother anywhere, he asked:'],
    },
    'where-who': { lines: ['BOY'] },
    where: { lines: ['— Mum, have you seen Osman?'] },
    how: { lines: ['In a cold, thin, moaning voice, cheerful and sorrowful at once, his mother answered:'] },
    rag: { lines: ['— You weren’t using him, son, so I made him into a rag.'] },
    end: { lines: ['OBSESSION'], sub: 'Nothing in this house goes to waste.' },
  },

  choices: {
    door: {
      title: 'THE HALF-OPEN DOOR',
      prompt: 'What will you do?',
      options: {
        in: { label: 'Go in.', reply: ['He pushed the door. The hinges moaned.'] },
        call: { label: 'Call from the door.', reply: ['He stopped on the threshold and laid his hand on the edge of the door.'] },
      },
    },
  },

  discoveries: {
    'empty-bed': {
      title: 'The other bed',
      verb: 'LOOK',
      lines: ['The other bed was empty.', 'The duvet had been pushed to the foot. On the pillow lay a pair of headphones, the cable tangled.'],
    },
    'rag-towel': {
      title: 'The towel rail',
      verb: 'LOOK',
      lines: ['There was no towel on the rail.', 'Instead hung a rag cut from an old pair of pyjamas, its edges hemmed with dense stitches.'],
    },
    labels: {
      title: 'The rag cupboard',
      verb: 'READ',
      lines: ['A little slip of paper had been sewn to the corner of every rag.', '“Living-room curtain.” “School smock.” “Red sweater — nobody wore it.”'],
    },
    'dress-form': {
      title: 'Someone in the corner',
      verb: 'LOOK',
      lines: ['Someone was standing in the corner.', 'No: it was his mother’s dressmaker’s dummy. It had no head.'],
    },
    thread: {
      title: 'The spool',
      verb: 'LOOK',
      lines: ['The thread on the spool was the colour of skin.', 'No fabric in the house was that colour.'],
    },
    controllers: {
      title: 'Two controllers',
      verb: 'LOOK',
      lines: ['Two game controllers lay side by side. One of them had gathered dust.', 'They both knew whose was whose.'],
    },
    'open-door': {
      title: 'The open door',
      verb: 'LOOK',
      lines: ['Sunlight struck the sewing table; flies circled in the air.', 'On the wall, a hand’s breadth above the floor, were long dark streaks. The heap of fabric was bigger than last night.'],
    },
    mop: {
      title: 'The mop',
      verb: 'LOOK',
      lines: ['The mop stood in the corner, bone-dry.', 'His mother hadn’t used it this morning.'],
    },
    bucket: {
      title: 'The bucket',
      verb: 'LOOK',
      lines: ['The water in the bucket was faintly pink.', 'The rag’s edges had been carefully hemmed.'],
    },
  },

  captions: {
    '[sokak lambasının vızıltısı]': '[the streetlamp hums]',
    '[evin içinden, boğuk ve düzenli bir takırtı]': '[from inside the house, a muffled, steady rattle]',
    '[yatak yayları gıcırdar]': '[bedsprings creak]',
    '[aşağıdan, dikiş makinesinin takırtısı]': '[from below, the rattle of a sewing machine]',
    '[kapı aralık kalır]': '[the door is left ajar]',
    '[musluk damlar]': '[the tap drips]',
    '[fısıltılar; bir inilti]': '[whispers; a moan]',
    '[annesinin sesi: kısık bir kıkırdama]': '[his mother’s voice: a low giggle]',
    '[pedal gıcırdar, iğne takırdar]': '[the treadle creaks, the needle rattles]',
    '[tuvalet kapısı açılır]': '[the toilet door opens]',
    '[basamaklar tek tek gıcırdar]': '[the stairs creak, one by one]',
    '[annesinin sesi, aşağıdan]': '[his mother’s voice, from below]',
    '[kıkırdama]': '[giggling]',
    '[hızlanan çıplak ayak sesleri]': '[bare feet, quickening]',
    '[makinenin takırtısı, çok yakından]': '[the machine’s rattle, very close]',
    '[menteşeler inler]': '[the hinges moan]',
    '[ayağını yere vurur; makine durmaz]': '[he stamps his foot; the machine doesn’t stop]',
    '[pedal; inilti; pedal]': '[treadle; moan; treadle]',
    '[kapı kapanır; makinenin sesi boğuklaşır]': '[the door closes; the machine goes muffled]',
    '[basamaklar gıcırdar, uzaklaşır]': '[the stairs creak, fading upward]',
    '[makine durmadan takırdar]': '[the machine rattles on and on]',
    '[pedal sertçe iner]': '[the treadle slams down]',
    '[ıslak bir sürtünme]': '[a wet scrape]',
    '[pedal çarpar; ıslak bir kayma]': '[the treadle slams; a wet slide]',
    '[ağır, yumuşak bir düşüş]': '[a heavy, soft fall]',
    '[makine susar]': '[the machine falls silent]',
    '[makine yeniden takırdamaya başlar]': '[the machine starts rattling again]',
    '[sokak lambası tık diye söner]': '[the streetlamp clicks off]',
    '[uzakta ilk kuşlar]': '[the first birds, far off]',
    '[makas sesi]': '[a snip of scissors]',
    '[iğnenin boğuk takırtısı]': '[the muffled rattle of the needle]',
    '[makine durur, yeniden başlar]': '[the machine stops, starts again]',
    '[sabah: uzakta bir araba, kuşlar]': '[morning: a distant car, birds]',
    '[basamaklarda koşan ayaklar]': '[feet running down the stairs]',
    '[açık kapının ardında sinek vızıltısı]': '[flies buzzing beyond the open door]',
    '[ıslak bezin karolara sürtünmesi]': '[a wet rag rubbing the tiles]',
    '[bez durur]': '[the rag stops]',
    '[bez kovaya daldırılır, sıkılır]': '[the rag is dipped in the bucket and wrung out]',
  },

  transcript: {
    midnight:
      'Nothing in this house ever went to waste. At midnight he climbed slowly out of bed to go to the toilet. Shafts of streetlight kept the room from pitch darkness; he had no trouble finding his way. On his way to the toilet he heard sounds coming from downstairs. Were they real, or was he still half asleep, caught in the tail of a dream? He couldn’t tell. Without taking it too seriously, he went into the toilet; he didn’t switch on the light. But the sounds went on, and woven through them, it seemed, were whispers and moans. It was his mother’s voice. She was at the sewing machine again in the dead of night, turning whatever came to hand into rags.',
    stairs:
      'He decided to go down. He had told her a hundred times to do it in the morning; it never did any good. The cupboard at the top of the stairs was full of folded rags. Each had once been something else. As he went down the stairs, the sounds swelled in the silence of the night until they were unbearable. His mother’s moans were giving way to words: “Hee-hee-hee… yesss… just like that. You’ll be someone useful now. Nobody used you any more, you were all worn out… heh-heh-heh-heh…” Hearing that, he was certain she was making rags again, and he grew angry. He quickened his pace. Through the half-open door he saw the shadow cast on the wall. The shadow of the long, scrawny, wrinkled figure at the sewing machine was a terrible thing to see. He stopped at the door: would he go in, or call to her from the doorway?',
    door:
      'If he went in: he pushed the door, and the hinges moaned. He went in. His mother sat in front of the window, her back to the door; beside her lay a heap of fabric. If he called from the door: he stopped on the threshold and laid his hand on the edge of the door. Through the gap he could see only the shadow on the wall; with every stitch, the shadow’s elbow rose and fell. Either way, he shouted the same words: “Mum, that’s enough. Please go to sleep, finish it tomorrow. I can’t sleep, enouuugh!” His mother seemed to be in a trance; unresponsive, she worked the treadle, moaning between the creaks. Inside, even that close, he couldn’t make out in the dark of the room what she was sewing; from the threshold, he couldn’t quite make it out either. He shut the door to her room and went back upstairs to sleep. His mother went on sewing.',
    pedal:
      'Beside the sewing machine, in the corner the light didn’t reach, there was a lifeless body. If the boy had gone in, moments ago he had stood only a few steps away from it; if he had called from the door, looking in through the gap, he hadn’t been able to tell this corner from the dark. The body sat in the dark, propped against the wall; its feet stretched out into the streetlamp’s light. There was no skin on its feet. The mother pressed the treadle so hard that with every press the lifeless body slid, little by little, and was dragged toward the light, leaving streaks of blood on the wall. Once, twice, three times… One last press, and the body fell fully into the light. Behind it, on the wall and on the floor: streaks of blood, pools of blood.',
    dawn:
      'In the light it was easier to make out: all of its skin had been stripped away. The muscles of its back lay bare; blood had pooled on them and clotted. No skin was left anywhere on it; from scalp to toes, every inch had been meticulously peeled away. The streetlamp went out. Slowly the day was breaking; the room grew light. The first rays of the sun fell on the mother’s sewing table. The pieces lying on the table were not cloth; they were the skin of the lifeless body, meticulously flayed. The mother fed the skins through her sewing machine, muttering to herself: “Yesss… you’re a good boy, you are. Now you’ll be good for something… hee-hee-hee… I’m creating you all over again… You should thank me…” She hadn’t been able to take the skin off in one piece, so she was joining it back together, bit by bit. The scalp had come off whole; but the arms, the torso and the legs were all separate. First she had sewn the head to the torso. Now she was working at fitting the arms and legs…',
    morning:
      'The boy woke up. The room was full of ordinary morning light. His brother wasn’t in his bed; he’d probably got up first and was downstairs making coffee. He thought of how withdrawn his brother had been lately: headphones on, face to the wall. They weren’t close the way they used to be. A sadness settled over his whole body. He wanted to go to him right away, make things right between them, help him with whatever was wrong. They could play games together again, like before. Without even washing his face he dashed for the stairs and took them two at a time. He hurried past his mother’s room. The door was open. Had he looked in, he could have seen the carnage.',
    kitchen:
      'When he reached the kitchen, his mother was wiping the floor, her back to him. The stove was cold; nobody had made coffee. Not seeing his brother anywhere, he asked: “Mum, have you seen Osman?” In a cold, thin, moaning voice, cheerful and sorrowful at once, his mother answered: “You weren’t using him, son, so I made him into a rag.” Then she dipped the rag in the bucket, wrung it out and went on wiping the floor. Nothing in this house goes to waste.',
  },
}
