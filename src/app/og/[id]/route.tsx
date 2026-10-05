/** Social preview images: STROLLY, and one per story. Generated at build time. */
import { ImageResponse } from 'next/og'
import { STORIES, STORY_ORDER, isStoryId } from '@/stories/registry'
import type { StoryId, StoryTheme } from '@/stories/types'
import { BRAND } from '@/lib/brand'

const size = { width: 1200, height: 630 }

export const dynamicParams = false

export function generateStaticParams() {
  return ['strolly', ...STORY_ORDER].map((id) => ({ id }))
}

function Brand() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 120%, #1d1a17 0%, #050505 62%)',
        color: '#ece8e1',
      }}
    >
      <div style={{ fontSize: 84, letterSpacing: 40, fontWeight: 300, paddingLeft: 40 }}>STROLLY</div>
      {/* Six titles do not fit one line at this size: two rows of three. */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 56, fontSize: 20, letterSpacing: 10, opacity: 0.55 }}>
        {[STORY_ORDER.slice(0, 3), STORY_ORDER.slice(3)].map((row, r) => (
          <div key={r} style={{ display: 'flex', marginTop: r ? 18 : 0, paddingLeft: 10 }}>
            {row.map((id, i) => (
              <div key={id} style={{ display: 'flex', marginLeft: i ? 40 : 0 }}>
                {String(r * 3 + i + 1).padStart(2, '0')} {STORIES[id].meta.title}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Credit />
    </div>
  )
}

/** "powered by MeMoDe", along the bottom edge. */
function Credit() {
  return (
    <div style={{ position: 'absolute', bottom: 34, display: 'flex', fontSize: 15, letterSpacing: 6, opacity: 0.42 }}>
      © {BRAND.year} · POWERED BY {BRAND.studio.toUpperCase()}
    </div>
  )
}

const OG_THEME: Record<StoryTheme, { bg: string; fg: string; accent: string; round: boolean }> = {
  archival: { bg: 'radial-gradient(ellipse at 50% 120%, #1a2230 0%, #050505 62%)', fg: '#ece8e1', accent: '#d6463a', round: false },
  memory: { bg: 'radial-gradient(ellipse at 70% 30%, #6d5440 0%, #1a130e 60%, #0b0806 100%)', fg: '#f4ebdd', accent: '#e0a35c', round: true },
  clinical: { bg: 'radial-gradient(ellipse at 50% 0%, #cdd6da 0%, #4a5459 45%, #0d1113 100%)', fg: '#f2f6f7', accent: '#d44a35', round: true },
  temporal: { bg: 'radial-gradient(ellipse at 50% 70%, #3a2a18 0%, #0b0d12 65%)', fg: '#f3e6d4', accent: '#ffb766', round: false },
  uncertain: { bg: 'radial-gradient(ellipse at 35% 60%, #4a3826 0%, #17130f 65%)', fg: '#efe3d1', accent: '#ff5a3c', round: true },
  perception: { bg: 'radial-gradient(ellipse at 50% 100%, #1b2638 0%, #05070c 65%)', fg: '#e6ecf7', accent: '#8fb8ff', round: true },
}

function Story({ id }: { id: StoryId }) {
  const { meta } = STORIES[id]
  const t = OG_THEME[meta.theme]
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.bg,
        color: t.fg,
      }}
    >
      <div style={{ fontSize: 20, letterSpacing: 16, opacity: 0.6, marginBottom: 36 }}>STROLLY</div>
      <div style={{ fontSize: 80, letterSpacing: 34, fontWeight: 300, paddingLeft: 34 }}>{meta.title}</div>
      <div style={{ marginTop: 44, fontSize: 26, opacity: 0.75, maxWidth: 820, textAlign: 'center' }}>{meta.hook}</div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 40, fontSize: 15, letterSpacing: 8, opacity: 0.45 }}>
        <div style={{ width: 10, height: 10, background: t.accent, marginRight: 16, borderRadius: t.round ? 5 : 0 }} />
        {meta.tags}
      </div>
      <Credit />
    </div>
  )
}

export async function GET(_request: Request, ctx: RouteContext<'/og/[id]'>) {
  const { id } = await ctx.params
  return new ImageResponse(isStoryId(id) ? <Story id={id} /> : <Brand />, size)
}
