'use client'

import { BRAND } from '@/lib/brand'
import { useT } from '@/lib/i18n'

/** © and "powered by MeMoDe": quiet, in a corner, on every screen outside the story itself. */
export default function BrandMark({ visible }: { visible: boolean }) {
  const t = useT()
  return (
    <footer className="brand-mark" data-visible={visible} aria-hidden={!visible}>
      <span>{t('common.rights', { year: BRAND.year, owner: BRAND.owner })}</span>
      <span>
        powered by{' '}
        <a href={BRAND.studioUrl} target="_blank" rel="noopener noreferrer" tabIndex={visible ? 0 : -1}>
          {BRAND.studio}
        </a>
      </span>
    </footer>
  )
}
