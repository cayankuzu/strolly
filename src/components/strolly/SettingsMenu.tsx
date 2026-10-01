'use client'

/** Settings, as a game has them: display, sound, controls, accessibility. Every change applies at once and is remembered. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { settings, useSettings, type QualityChoice, type Settings, type TextSize } from '@/lib/settings'
import { MenuButton, useUiSound } from './ui'

type Tab = 'display' | 'audio' | 'controls' | 'access'

const TABS: Array<[Tab, string]> = [
  ['display', 'GÖRÜNTÜ'],
  ['audio', 'SES'],
  ['controls', 'KONTROLLER'],
  ['access', 'ERİŞİLEBİLİRLİK'],
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
      <span>{value ? 'AÇIK' : 'KAPALI'}</span>
      <i aria-hidden="true" />
    </button>
  )
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<[T, string]>; onChange: (v: T) => void; label: string }) {
  const play = useUiSound()
  return (
    <div className="set-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
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

  if (!open) return null

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else document.documentElement.requestFullscreen().catch(() => undefined)
  }

  return (
    <div ref={root} className="overlay settings" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-inner">
        <header className="settings-head">
          <h2 id="settings-title">AYARLAR</h2>
          <div className="settings-tabs" role="tablist" aria-label="Ayar grupları">
            {TABS.map(([t, label]) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  play('click')
                  setTab(t)
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
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="settings-body" role="tabpanel">
          {tab === 'display' && (
            <>
              <Row label="Kalite" hint="Kenar yumuşatma ve gölgeler bir sonraki hikâyede uygulanır.">
                <Segmented<QualityChoice>
                  label="Kalite"
                  value={s.quality}
                  onChange={(v) => set({ quality: v })}
                  options={[
                    ['auto', 'OTOMATİK'],
                    ['high', 'YÜKSEK'],
                    ['mid', 'ORTA'],
                    ['low', 'DÜŞÜK'],
                  ]}
                />
              </Row>
              <Row label="Çözünürlük ölçeği" hint="Düşük değer daha akıcı, daha yumuşak görüntü.">
                <Slider label="Çözünürlük ölçeği" value={s.resolution} min={0.6} max={1} step={0.05} onChange={(v) => set({ resolution: v })} format={(v) => `%${pct(v)}`} />
              </Row>
              {canFull && (
                <Row label="Tam ekran">
                  <Toggle label="Tam ekran" value={full} onChange={toggleFull} />
                </Row>
              )}
              <Row label="Hareket efektleri" hint="Elde tutulan kamera titreşimi, yumuşak metin geçişleri.">
                <Toggle label="Hareket efektleri" value={s.motion} onChange={(v) => set({ motion: v })} />
              </Row>
            </>
          )}

          {tab === 'audio' && (
            <>
              <Row label="Ana ses">
                <Slider label="Ana ses" value={s.master} min={0} max={1} step={0.05} onChange={(v) => set({ master: v })} format={pct} />
              </Row>
              <Row label="Müzik">
                <Slider label="Müzik" value={s.music} min={0} max={1} step={0.05} onChange={(v) => set({ music: v })} format={pct} />
              </Row>
              <Row label="Ortam">
                <Slider label="Ortam" value={s.ambient} min={0} max={1} step={0.05} onChange={(v) => set({ ambient: v })} format={pct} />
              </Row>
              <Row label="Efektler">
                <Slider label="Efektler" value={s.sfx} min={0} max={1} step={0.05} onChange={(v) => set({ sfx: v })} format={pct} />
              </Row>
              <Row label="Arayüz">
                <Slider label="Arayüz sesleri" value={s.ui} min={0} max={1} step={0.05} onChange={(v) => set({ ui: v })} format={pct} />
              </Row>
              <Row label="Uzamsal ses" hint="Sesler sahnedeki yerlerinden gelir; arkandaki ses arkandan duyulur.">
                <Toggle label="Uzamsal ses" value={s.spatial} onChange={(v) => set({ spatial: v })} />
              </Row>
            </>
          )}

          {tab === 'controls' && (
            <>
              <Row label="360° bakış" hint="Kapalıyken kamera yalnızca hikâyenin gösterdiğine bakar.">
                <Toggle label="360 derece bakış" value={s.look} onChange={(v) => set({ look: v })} />
              </Row>
              <Row label="Kamera hassasiyeti">
                <Slider label="Kamera hassasiyeti" value={s.sensitivity} min={0.4} max={2} step={0.1} onChange={(v) => set({ sensitivity: v })} format={(v) => `${v.toFixed(1)}×`} />
              </Row>
              <Row label="Y eksenini ters çevir">
                <Toggle label="Y eksenini ters çevir" value={s.invertY} onChange={(v) => set({ invertY: v })} />
              </Row>
              <Row label="Kamerayı otomatik ortala" hint="Bir süre bakmadığında görüş yavaşça hikâyeye döner.">
                <Toggle label="Kamerayı otomatik ortala" value={s.autoCenter} onChange={(v) => set({ autoCenter: v })} />
              </Row>
              <p className="set-keys">
                <span>
                  <kbd>←</kbd> <kbd>→</kbd> bak
                </span>
                <span>
                  <kbd>⇧</kbd> + <kbd>↑</kbd> <kbd>↓</kbd> yukarı / aşağı
                </span>
                <span>
                  <kbd>C</kbd> ortala
                </span>
                <span>
                  <kbd>E</kbd> incele
                </span>
                <span>
                  <kbd>ESC</kbd> duraklat
                </span>
              </p>
            </>
          )}

          {tab === 'access' && (
            <>
              <Row label="Azaltılmış hareket" hint="Yumuşak kaydırma ve kamera hareketleri durur.">
                <Toggle label="Azaltılmış hareket" value={s.reducedMotion} onChange={(v) => set({ reducedMotion: v })} />
              </Row>
              <Row label="Azaltılmış kamera hareketi" hint="Bakış daha yavaş; kayma ve otomatik dönüş yok.">
                <Toggle label="Azaltılmış kamera hareketi" value={s.reducedCamera} onChange={(v) => set({ reducedCamera: v })} />
              </Row>
              <Row label="Ses altyazıları" hint="Önemli sesler ekranda yazıyla belirir.">
                <Toggle label="Ses altyazıları" value={s.captions} onChange={(v) => set({ captions: v })} />
              </Row>
              <Row label="Metin boyutu">
                <Segmented<TextSize>
                  label="Metin boyutu"
                  value={s.textSize}
                  onChange={(v) => set({ textSize: v })}
                  options={[
                    ['S', 'KÜÇÜK'],
                    ['M', 'ORTA'],
                    ['L', 'BÜYÜK'],
                    ['XL', 'ÇOK BÜYÜK'],
                  ]}
                />
              </Row>
              <Row label="Yüksek kontrast">
                <Toggle label="Yüksek kontrast" value={s.contrast} onChange={(v) => set({ contrast: v })} />
              </Row>
              <Row label="Sürükleyici mod" hint="Arayüz en aza iner; yalnızca hikâye kalır.">
                <Toggle label="Sürükleyici mod" value={s.immersion} onChange={(v) => set({ immersion: v })} />
              </Row>
            </>
          )}
        </div>

        <footer className="settings-foot">
          <MenuButton tier="utility" sound="warning" onClick={() => settings.reset()}>
            VARSAYILANLAR
          </MenuButton>
          <MenuButton tier="primary" sound="close" onClick={onClose}>
            TAMAM
          </MenuButton>
        </footer>
      </div>
    </div>
  )
}
