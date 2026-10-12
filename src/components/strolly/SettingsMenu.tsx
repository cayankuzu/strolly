'use client'

/** Settings, as a game has them: display, sound, controls, accessibility. Every change applies at once and is remembered. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { settings, useSettings, type Lang, type QualityChoice, type Settings, type TextSize } from '@/lib/settings'
import { t as translate, useT, type Key } from '@/lib/i18n'
import { MenuButton, useUiSound } from './ui'

type Tab = 'display' | 'audio' | 'controls' | 'access'

const TABS: Array<[Tab, Key]> = [
  ['display', 'settings.tabDisplay'],
  ['audio', 'settings.tabAudio'],
  ['controls', 'settings.tabControls'],
  ['access', 'settings.tabAccess'],
]

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="set-row">
      <div className="set-label">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <div className="set-control">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const play = useUiSound()
  const t = useT()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      className="set-toggle"
      onClick={() => {
        play('click')
        onChange(!value)
      }}
    >
      <span>{value ? t('settings.on') : t('settings.off')}</span>
      <i aria-hidden="true" />
    </button>
  )
}

/** Options are [value, text], or [value, text, the language the text is in]. */
function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<[T, string] | [T, string, Lang]>; onChange: (v: T) => void; label: string }) {
  const play = useUiSound()
  return (
    <div className="set-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text, lang]) => (
        <button
          key={v}
          type="button"
          role="radio"
          lang={lang}
          aria-checked={v === value}
          onClick={() => {
            play('click')
            onChange(v)
          }}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

function Slider({ value, min, max, step, onChange, label, format }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; label: string; format: (v: number) => string }) {
  const id = useId()
  return (
    <div className="set-slider">
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--fill' as string]: `${((value - min) / (max - min)) * 100}%` }} />
      <output htmlFor={id}>{format(value)}</output>
    </div>
  )
}

const pct = (v: number) => `${Math.round(v * 100)}`

export default function SettingsMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useSettings()
  const t = useT()
  const [tab, setTab] = useState<Tab>('display')
  const [full, setFull] = useState(false)
  const [canFull, setCanFull] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const play = useUiSound()
  const set = (patch: Partial<Settings>) => settings.set(patch)

  useEffect(() => {
    if (!open) return
    const sync = () => setFull(!!document.fullscreenElement)
    queueMicrotask(() => {
      setCanFull(!!document.fullscreenEnabled)
      sync()
    })
    document.addEventListener('fullscreenchange', sync)
    root.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true })
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [open])

  // On a narrow screen the tabs scroll sideways: the chosen one is kept in view.
  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [open, tab])

  if (!open) return null

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else document.documentElement.requestFullscreen().catch(() => undefined)
  }

  return (
    <div ref={root} className="overlay settings" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-inner">
        <header className="settings-head">
          <h2 id="settings-title">{t('common.settings')}</h2>
          {/* The language comes first, and is named in both languages so it can be found without reading either. */}
          <div className="settings-lang">
            <Row label={t('lang.label')} hint={translate(s.lang === 'tr' ? 'en' : 'tr', 'lang.label')}>
              <Segmented<Lang>
                label={t('lang.switch')}
                value={s.lang}
                onChange={(v) => set({ lang: v })}
                options={[
                  ['tr', t('lang.tr'), 'tr'],
                  ['en', t('lang.en'), 'en'],
                ]}
              />
            </Row>
          </div>
          <div className="tabbar settings-tabs" role="tablist" aria-label={t('settings.groups')}>
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`settings-tab-${id}`}
                aria-selected={tab === id}
                aria-controls="settings-panel"
                onClick={() => {
                  play('click')
                  setTab(id)
                }}
                onKeyDown={(e) => {
                  const i = TABS.findIndex(([x]) => x === tab)
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault()
                    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length][0]
                    setTab(next)
                    play('hover')
                    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus())
                  }
                }}
              >
                {t(label)}
              </button>
            ))}
          </div>
        </header>

        <div id="settings-panel" className="settings-body" role="tabpanel" aria-labelledby={`settings-tab-${tab}`}>
          {tab === 'display' && (
            <>
              <Row label={t('settings.quality')} hint={t('settings.qualityHint')}>
                <Segmented<QualityChoice>
                  label={t('settings.quality')}
                  value={s.quality}
                  onChange={(v) => set({ quality: v })}
                  options={[
                    ['auto', t('settings.auto')],
                    ['high', t('settings.high')],
                    ['mid', t('settings.mid')],
                    ['low', t('settings.low')],
                  ]}
                />
              </Row>
              <Row label={t('settings.resolution')} hint={t('settings.resolutionHint')}>
                <Slider label={t('settings.resolution')} value={s.resolution} min={0.6} max={1} step={0.05} onChange={(v) => set({ resolution: v })} format={(v) => t('common.percent', { n: pct(v) })} />
              </Row>
              {canFull && (
                <Row label={t('settings.fullscreen')}>
                  <Toggle label={t('settings.fullscreen')} value={full} onChange={toggleFull} />
                </Row>
              )}
              <Row label={t('settings.motion')} hint={t('settings.motionHint')}>
                <Toggle label={t('settings.motion')} value={s.motion} onChange={(v) => set({ motion: v })} />
              </Row>
            </>
          )}

          {tab === 'audio' && (
            <>
              <Row label={t('settings.master')}>
                <Slider label={t('settings.master')} value={s.master} min={0} max={1} step={0.05} onChange={(v) => set({ master: v })} format={pct} />
              </Row>
              <Row label={t('settings.music')}>
                <Slider label={t('settings.music')} value={s.music} min={0} max={1} step={0.05} onChange={(v) => set({ music: v })} format={pct} />
              </Row>
              <Row label={t('settings.ambient')}>
                <Slider label={t('settings.ambient')} value={s.ambient} min={0} max={1} step={0.05} onChange={(v) => set({ ambient: v })} format={pct} />
              </Row>
              <Row label={t('settings.sfx')}>
                <Slider label={t('settings.sfx')} value={s.sfx} min={0} max={1} step={0.05} onChange={(v) => set({ sfx: v })} format={pct} />
              </Row>
              <Row label={t('settings.ui')}>
                <Slider label={t('settings.uiLabel')} value={s.ui} min={0} max={1} step={0.05} onChange={(v) => set({ ui: v })} format={pct} />
              </Row>
              <Row label={t('settings.spatial')} hint={t('settings.spatialHint')}>
                <Toggle label={t('settings.spatial')} value={s.spatial} onChange={(v) => set({ spatial: v })} />
              </Row>
            </>
          )}

          {tab === 'controls' && (
            <>
              <Row label={t('settings.look')} hint={t('settings.lookHint')}>
                <Toggle label={t('settings.lookLabel')} value={s.look} onChange={(v) => set({ look: v })} />
              </Row>
              <Row label={t('settings.sensitivity')}>
                <Slider label={t('settings.sensitivity')} value={s.sensitivity} min={0.4} max={2} step={0.1} onChange={(v) => set({ sensitivity: v })} format={(v) => `${v.toFixed(1)}×`} />
              </Row>
              <Row label={t('settings.invertY')}>
                <Toggle label={t('settings.invertY')} value={s.invertY} onChange={(v) => set({ invertY: v })} />
              </Row>
              <Row label={t('settings.autoCenter')} hint={t('settings.autoCenterHint')}>
                <Toggle label={t('settings.autoCenter')} value={s.autoCenter} onChange={(v) => set({ autoCenter: v })} />
              </Row>
              <p className="set-keys">
                <span>
                  <kbd>←</kbd> <kbd>→</kbd> {t('settings.keyLook')}
                </span>
                <span>
                  <kbd>⇧</kbd> + <kbd>↑</kbd> <kbd>↓</kbd> {t('settings.keyUpDown')}
                </span>
                <span>
                  <kbd>C</kbd> {t('settings.keyCenter')}
                </span>
                <span>
                  <kbd>E</kbd> {t('settings.keyExamine')}
                </span>
                <span>
                  <kbd>ESC</kbd> {t('settings.keyPause')}
                </span>
              </p>
            </>
          )}

          {tab === 'access' && (
            <>
              <Row label={t('settings.reducedMotion')} hint={t('settings.reducedMotionHint')}>
                <Toggle label={t('settings.reducedMotion')} value={s.reducedMotion} onChange={(v) => set({ reducedMotion: v })} />
              </Row>
              <Row label={t('settings.reducedCamera')} hint={t('settings.reducedCameraHint')}>
                <Toggle label={t('settings.reducedCamera')} value={s.reducedCamera} onChange={(v) => set({ reducedCamera: v })} />
              </Row>
              <Row label={t('settings.captions')} hint={t('settings.captionsHint')}>
                <Toggle label={t('settings.captions')} value={s.captions} onChange={(v) => set({ captions: v })} />
              </Row>
              <Row label={t('settings.textSize')}>
                <Segmented<TextSize>
                  label={t('settings.textSize')}
                  value={s.textSize}
                  onChange={(v) => set({ textSize: v })}
                  options={[
                    ['S', t('settings.textS')],
                    ['M', t('settings.textM')],
                    ['L', t('settings.textL')],
                    ['XL', t('settings.textXL')],
                  ]}
                />
              </Row>
              <Row label={t('settings.contrast')}>
                <Toggle label={t('settings.contrast')} value={s.contrast} onChange={(v) => set({ contrast: v })} />
              </Row>
              <Row label={t('settings.immersion')} hint={t('settings.immersionHint')}>
                <Toggle label={t('settings.immersion')} value={s.immersion} onChange={(v) => set({ immersion: v })} />
              </Row>
            </>
          )}
        </div>

        <footer className="settings-foot">
          <MenuButton tier="utility" sound="warning" onClick={() => settings.reset()}>
            {t('settings.defaults')}
          </MenuButton>
          <MenuButton tier="primary" sound="close" onClick={onClose}>
            {t('settings.done')}
          </MenuButton>
        </footer>
      </div>
    </div>
  )
}
