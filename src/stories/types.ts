import type { Chapter, Segment } from './timeline'

/** What the shared runtime needs from a story's screenplay (ids widened to string). */
export type TimelineView = {
  SEG: Record<string, Segment>
  SEGMENT_LIST: Segment[]
  TOTAL_SCREENS: number
  CHAPTERS: Chapter[]
  segmentAt(p: number): Segment
  chapterAt(p: number): Chapter
}

export type StoryId = 'tekerrur' | 'emanet' | 'ofke' | 'yasamak' | 'kalan' | 'esik'

/**
 * Where a piece of text lives:
 * rail     — the narrative column beside the image
 * caption  — the small line above the rail text (a year, a speaker, a tag)
 * center   — revelations and closing lines, alone on screen
 * top      — machine labels
 */
export type TextSlot = 'rail' | 'caption' | 'center' | 'top'

export type TextKind = 'narration' | 'dialogue' | 'machine' | 'year' | 'system' | 'alert' | 'word' | 'reveal' | 'final' | 'iteration' | 'engine'

/** Why the line exists — keeps the writing honest (no captions that repeat the image). */
export type TextPurpose = 'mood' | 'context' | 'foreshadow' | 'turn' | 'reveal' | 'dialogue' | 'system' | 'title' | 'question'

/** A condition on the reading's flags (what the reader chose). */
export type When = { all?: string[]; none?: string[] }

/** Whether a condition holds for a set of flags (no condition always holds). */
export const meets = (when: When | undefined, flags: ReadonlySet<string>) => !when || ((when.all ?? []).every((f) => flags.has(f)) && !(when.none ?? []).some((f) => flags.has(f)))

export type TextSegment<Id extends string = string> = {
  id: string
  seg: Id
  /** Fractions of `seg`; `to` may exceed 1 and spill into later segments. */
  from: number
  to: number
  slot: TextSlot
  kind: TextKind
  purpose: TextPurpose
  lines: string[]
  sub?: string
  strong?: boolean
  /** Lines arrive one after another, as a fraction of the segment's span. */
  stagger?: number
  /** Fade length in screens. */
  fade?: number
  /** Text that lives on an in-world screen; mirrored in the DOM only when WebGL is unavailable. */
  world?: boolean
  /** Shown only when the reading's flags meet this. */
  when?: When
}

/** The game UI keeps one design system; each story tints it slightly. */
export type StoryTheme = 'archival' | 'memory' | 'clinical' | 'temporal' | 'uncertain' | 'perception'

export type StoryMeta = {
  id: StoryId
  index: number
  title: string
  hook: string
  tags: string
  description: string
  mood: string
  /** Rough reading time, minutes. */
  minutes: number
  theme: StoryTheme
  rail: 'left' | 'right'
  /** Scroll length of one "screen" of the screenplay, in viewport-height percent. */
  screenVh: number
  /** Keeps going into the next iteration after the last frame. */
  loops: boolean
}

export type DiscoveryKind = 'visual' | 'audio' | 'character' | 'environment' | 'anomaly' | 'reflection' | 'text' | 'object'

/**
 * Something in the set that rewards looking. Positions are in the story's
 * world space. Nothing is collected; the system only remembers what was seen.
 *
 * visible — part of the frame's intent; may be hinted at when missed
 * subtle  — off to the side; never hinted
 * hidden  — behind the reader or briefly true; found only by curiosity
 */
export type Discovery<Id extends string = string> = {
  id: string
  seg: Id
  from: number
  to: number
  pos: readonly [number, number, number]
  /** Rough size in meters (how far off-center it still counts as seen). */
  size?: number
  kind: DiscoveryKind
  visibility: 'visible' | 'subtle' | 'hidden'
  /** If set, the reader can examine it: the verb in the prompt, and what it reveals. */
  examine?: { verb: string; lines: string[] }
  /** How the journal names it once found. */
  title: string
}

/** One answer the reader can give at a choice: a question to ask, a thing to do. */
export type ChoiceOption = {
  id: string
  /** A small category above the option (WORLD, SELF…) for queries. */
  tag?: string
  label: string
  /** Who answers, and what (shown after picking, line by line). */
  speaker?: string
  reply?: string[]
  /** Flags this answer sets for the rest of the reading ("mem:" flags are kept across readings). */
  sets?: string[]
  /** Offered only when the reading's flags meet this. */
  when?: When
}

/**
 * A moment where the story waits for the reader: a query typed into a system,
 * a decision to make. The scroll holds at `at` (a fraction of `seg`) until
 * `picks` answers are given; what was chosen becomes flags that later text,
 * scenes and endings read.
 */
export type ChoiceGate<Id extends string = string> = {
  id: string
  seg: Id
  at: number
  style: 'query' | 'choice'
  title: string
  prompt?: string
  options: ChoiceOption[]
  picks?: number
  /** The gate appears only when the reading's flags meet this. */
  when?: When
}

/** Captions for sounds, shown when captions are on (independent of audio being on). */
export type CaptionCue<Id extends string = string> = { seg: Id; at: number; text: string; when?: When }

export type StoryContent = {
  meta: StoryMeta
  timeline: TimelineView
  text: TextSegment[]
  discoveries: Discovery[]
  captions: CaptionCue[]
  /** Moments where the reading waits for a choice (empty for stories without any). */
  choices: ChoiceGate[]
  /** Plain prose per chapter for screen readers, crawlers and the no-WebGL path. */
  transcript: Record<string, string>
  /** Progress ranges where the HUD steps back for the image. */
  quiet: Array<readonly [number, number]>
  /** Resolves story tokens (dates, iteration numbers) for the current pass. */
  resolve: (text: string, iteration: number) => string
  baseIteration: number
}
