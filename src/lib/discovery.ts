/**
 * What the reader has noticed. Each frame, for every discovery that exists
 * at this moment of the story, the tracker asks: is it in the middle of the
 * view, near enough, for long enough? Seen things are remembered for this
 * reading of the story only (a replay starts fresh); the save keeps the union.
 *
 * It also picks the one examinable thing at the center of the view (for the
 * interaction prompt) and, for a visible clue about to be missed, a quiet hint.
 */
import type { Discovery, StoryContent } from '@/stories/types'

type V3 = { x: number; y: number; z: number }

export type DiscoveryFrame = {
  /** The examinable thing at the center of the view, if any. */
  focus: Discovery | null
  /** A whisper for the HUD when a visible clue is about to pass unseen. */
  hint: 'around' | 'behind' | null
}

const SEEN_AFTER = { visible: 0.35, subtle: 0.5, hidden: 0.6 }
const MAX_DIST = 14
const EXAMINE_DIST = 7

export class DiscoveryTracker {
  readonly seen = new Set<string>()
  readonly examined = new Set<string>()
  private dwell = new Map<string, number>()
  private spans: Array<{ d: Discovery; a: number; b: number }>
  private out: DiscoveryFrame = { focus: null, hint: null }

  constructor(
    story: StoryContent,
    private onSeen: (d: Discovery) => void,
  ) {
    this.spans = story.discoveries.map((d) => {
      const s = story.timeline.SEG[d.seg]
      return { d, a: s.start + s.len * Math.max(0, d.from), b: s.start + s.len * d.to }
    })
  }

  get total() {
    return this.spans.length
  }

  update(p: number, dt: number, cam: V3, fwd: V3): DiscoveryFrame {
    let focus: Discovery | null = null
    let focusScore = Infinity
    let hint: DiscoveryFrame['hint'] = null
    for (const { d, a, b } of this.spans) {
      if (p < a || p > b) continue
      const dx = d.pos[0] - cam.x
      const dy = d.pos[1] - cam.y
      const dz = d.pos[2] - cam.z
      const dist = Math.hypot(dx, dy, dz) || 1e-3
      const cos = (dx * fwd.x + dy * fwd.y + dz * fwd.z) / dist
      const angle = Math.acos(Math.max(-1, Math.min(1, cos)))
      const reach = Math.min(0.5, Math.atan2(d.size ?? 0.4, dist)) + 0.14
      if (angle < reach && dist < MAX_DIST) {
        const t = (this.dwell.get(d.id) ?? 0) + dt
        this.dwell.set(d.id, t)
        if (!this.seen.has(d.id) && t >= SEEN_AFTER[d.visibility]) {
          this.seen.add(d.id)
          this.onSeen(d)
        }
        if (d.examine && dist < EXAMINE_DIST && angle < reach * 0.8 && angle < focusScore) {
          focus = d
          focusScore = angle
        }
      } else this.dwell.set(d.id, 0)
      // A visible clue in the last third of its moment, still unseen: whisper.
      if (d.visibility === 'visible' && !this.seen.has(d.id) && p > a + (b - a) * 0.66) hint = cos < -0.2 ? 'behind' : 'around'
    }
    this.out.focus = focus
    this.out.hint = hint
    return this.out
  }

  examine(d: Discovery) {
    this.examined.add(d.id)
    if (!this.seen.has(d.id)) {
      this.seen.add(d.id)
      this.onSeen(d)
    }
  }
}
