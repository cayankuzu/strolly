/**
 * ÖFKE's sound (temporary: being rewritten against the new timeline).
 */
import type { AudioFrame, AudioKit, AudioProfile } from '@/lib/audio/core'

export function createOfkeAudio(kit: AudioKit): AudioProfile {
  void kit
  return {
    update(frame: AudioFrame) {
      void frame
    },
  }
}
