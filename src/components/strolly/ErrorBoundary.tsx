'use client'

/** If the experience itself fails, the reader gets the stories back — never a blank page. */
import { Component, type ReactNode } from 'react'
import { settings } from '@/lib/settings'
import { t } from '@/lib/i18n'

type State = { failed: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    // Only ever rendered in the browser, after something broke: the stored language is known.
    const lang = settings.get().lang
    return (
      <div className="crash" role="alert">
        <p>{t(lang, 'crash.line')}</p>
        {/* A full reload: whatever broke does not come along. */}
        <button type="button" onClick={() => window.location.assign(window.location.pathname)}>
          {t(lang, 'common.stories')}
        </button>
        <a href="#metin">{t(lang, 'crash.read')}</a>
      </div>
    )
  }
}
