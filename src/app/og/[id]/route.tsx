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
      {/* The titles in rows of three. */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 48, fontSize: 18, letterSpacing: 8, opacity: 0.55 }}>
        {Array.from({ length: Math.ceil(STORY_ORDER.length / 3) }, (_, r) => STORY_ORDER.slice(r * 3, r * 3 + 3)).map((row, r) => (
          <div key={r} style={{ display: 'flex', marginTop: r ? 14 : 0, paddingLeft: 8 }}>
            {row.map((id, i) => (
              <div key={id} style={{ display: 'flex', marginLeft: i ? 34 : 0 }}>
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
  clinical: { bg: 'radial-gradient(ellipse at 50% 0%, #cdd6da 0%, #4a5459 45%, #0d1113 100%)', fg: '#f2f6f7', accent: '#d44a35', round: true },
  temporal: { bg: 'radial-gradient(ellipse at 50% 70%, #3a2a18 0%, #0b0d12 65%)', fg: '#f3e6d4', accent: '#ffb766', round: false },
  cosmic: { bg: 'radial-gradient(ellipse at 50% 110%, #231c40 0%, #040309 62%)', fg: '#ece8f6', accent: '#b9a4ff', round: true },
  chalk: { bg: 'radial-gradient(ellipse at 50% 40%, #2f3b2c 0%, #0b0f0a 70%)', fg: '#f2efe4', accent: '#e8d36a', round: false },
  dread: { bg: 'radial-gradient(ellipse at 30% 60%, #2a1a12 0%, #050302 65%)', fg: '#ece2d6', accent: '#c0402f', round: false },
  vertigo: { bg: 'radial-gradient(ellipse at 50% 0%, #4a3324 0%, #0a0c10 68%)', fg: '#f1ece4', accent: '#ff9b54', round: true },
  neural: { bg: 'radial-gradient(ellipse at 50% 50%, #0f2a2c 0%, #020606 66%)', fg: '#e9f2f1', accent: '#ff5a7a', round: true },
  state: { bg: 'radial-gradient(ellipse at 50% 120%, #1a2230 0%, #050505 62%)', fg: '#e6ecf2', accent: '#e2b062', round: false },
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
