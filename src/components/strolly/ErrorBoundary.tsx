'use client'

/** If the experience itself fails, the reader gets the stories back — never a blank page. */
import { Component, type ReactNode } from 'react'

type State = { failed: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="crash" role="alert">
        <p>Bu hikâye şu anda açılamadı.</p>
        {/* A full reload: whatever broke does not come along. */}
        <button type="button" onClick={() => window.location.assign(window.location.pathname)}>
          HİKÂYELER
        </button>
        <a href="#metin">Metin olarak oku</a>
      </div>
    )
  }
}
