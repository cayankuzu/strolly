import type { Metadata } from 'next'
import GameShell, { type Screen } from '@/components/strolly/GameShell'
import StoryTranscript from '@/components/strolly/StoryTranscript'
import ErrorBoundary from '@/components/strolly/ErrorBoundary'
import { STORIES, isStoryId } from '@/stories/registry'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

async function storyFrom(searchParams: Props['searchParams']) {
  const { story } = await searchParams
  return isStoryId(story) ? story : null
}

async function screenFrom(searchParams: Props['searchParams']): Promise<Screen> {
  const { menu } = await searchParams
  return menu === 'hikayeler' ? 'stories' : 'title'
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const id = await storyFrom(searchParams)
  if (!id) return {}
  const { meta } = STORIES[id]
  const title = `${meta.title} — STROLLY`
  const description = `${meta.hook} ${meta.description}`
  return {
    title,
    description,
    alternates: { canonical: `/?story=${id}` },
    openGraph: { title, description, type: 'website', locale: 'tr_TR', images: [{ url: `/og/${id}`, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [`/og/${id}`] },
  }
}

export default async function Home({ searchParams }: Props) {
  // An unknown or missing story id simply opens the title screen.
  const initialStory = await storyFrom(searchParams)
  const initialScreen = await screenFrom(searchParams)
  return (
    <main>
      <a href="#metin" className="skip-link">
        Hikâyeleri metin olarak oku
      </a>
      <ErrorBoundary>
        <GameShell initialStory={initialStory} initialScreen={initialScreen} />
      </ErrorBoundary>
      <StoryTranscript />
    </main>
  )
}
