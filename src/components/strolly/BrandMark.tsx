import { BRAND, COPYRIGHT } from '@/lib/brand'

/** © and "powered by MeMoDe": quiet, in a corner, on every screen outside the story itself. */
export default function BrandMark({ visible }: { visible: boolean }) {
  return (
    <footer className="brand-mark" data-visible={visible} aria-hidden={!visible}>
      <span>{COPYRIGHT}</span>
      <span>
        powered by{' '}
        <a href={BRAND.studioUrl} target="_blank" rel="noopener noreferrer" tabIndex={visible ? 0 : -1}>
          {BRAND.studio}
        </a>
      </span>
    </footer>
  )
}
