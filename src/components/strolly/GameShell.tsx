'use client'

/**
 * The game shell: title screen, stories, settings, pause, the story itself,
 * and the systems they share. The canvas, renderer, scroll, look and sound
 * live here for the whole visit; stories come and go inside them (runtime.ts).
 *
 *   TITLE ─┬─ HİKÂYELER ── play ──▶ STORY ⇄ PAUSE ── end ──▶ COMPLETE
 *          ├─ AYARLAR (also from pause)        │   └─ GÜNLÜK · KEŞİFLER
 *          ├─ ARŞİV                            └─ choices hold the reading
 *          └─ ÇIKIŞ
 *
 * URLs: `/` title · `/?menu=hikayeler` stories · `/?story=<id>` a story.
 * Deep links render straight into the story's loading state on the server.
 * Browser back/forward moves between them.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { STORIES, STORY_ORDER, isStoryId } from '@/stories/registry'
import type { ChoiceGate, Discovery, StoryId, StoryTheme } from '@/stories/types'
import { isDev } from '@/lib/env'
import { settings, useSettings } from '@/lib/settings'
import { saves, type StorySave } from '@/lib/save'
import { selectorAudio } from '@/lib/audio/selector'
import type { UiSound } from '@/lib/audio/core'
import NarrativeLayer, { type NarrativeHandle } from './NarrativeLayer'
import GameHUD, { useHudMessages, type HudHandle } from './GameHUD'
import TitleScreen, { type ContinueInfo } from './TitleScreen'
import StorySelect from './StorySelect'
import PauseMenu from './PauseMenu'
import SettingsMenu from './SettingsMenu'
import Cursor, { type CursorHandle } from './Cursor'
import MenuBackdrop from './MenuBackdrop'
import { ArchiveScreen, CompleteScreen, ConfirmDialog, Farewell, SceneError } from './Screens'
import ChoicePanel from './ChoicePanel'
import BrandMark from './BrandMark'
import Journal, { type JournalTab } from './Journal'
import { UiSoundContext } from './ui'
import { StoryRuntime, type JournalEntry, type Mode, type Phase } from './runtime'
import type { DebugApi } from './debug'

export type Screen = 'title' | 'stories' | 'archive' | 'farewell' | 'story'

const SOUND_KEY = 'strolly:sound'
const ONBOARD_KEY = 'strolly:onboarded'
const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key: string, v: string) => {
  try {
    localStorage.setItem(key, v)
  } catch {
    /* storage unavailable: lasts for this visit only */
  }
}

const TINT: Record<StoryTheme | 'menu', string> = {
  menu: '#d8cfc2',
  archival: '#b9d3c4',
  memory: '#ffd29e',
  clinical: '#dbe8ee',
  temporal: '#ffbf7a',
  uncertain: '#e9c9a0',
  perception: '#a9c2ff',
}

const pageTitle = (screen: Screen, id: StoryId | null) =>
  screen === 'story' && id ? `${STORIES[id].meta.title} — STROLLY` : screen === 'stories' ? 'Hikâyeler — STROLLY' : 'STROLLY'

const urlFor = (screen: Screen, id: StoryId | null) => (screen === 'story' && id ? `?story=${id}` : screen === 'stories' ? '?menu=hikayeler' : window.location.pathname)

function readSaves() {
  const all: Partial<Record<StoryId, StorySave | null>> = {}
  for (const id of STORY_ORDER) all[id] = saves.story(id)
  return all
}

export default function GameShell({ initialStory, initialScreen }: { initialStory: StoryId | null; initialScreen: Screen }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const narrativeRef = useRef<NarrativeHandle>(null)
  const hudRef = useRef<HudHandle>(null)
  const cursorRef = useRef<CursorHandle>(null)
  const runtimeRef = useRef<StoryRuntime | null>(null)
  const s = useSettings()

  const [screen, setScreen] = useState<Screen>(initialStory ? 'story' : initialScreen)
  const [storyId, setStoryId] = useState<StoryId | null>(initialStory)
  const [phase, setPhase] = useState<Phase>(initialStory ? 'loading' : 'idle')
  const [mode, setMode] = useState<Mode>('pending')
  const [iteration, setIteration] = useState(initialStory ? STORIES[initialStory].baseIteration : 0)
  const [soundOn, setSoundOn] = useState(false)
  const [paused, setPaused] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [complete, setComplete] = useState<{ seen: number; total: number } | null>(null)
  const [sceneError, setSceneError] = useState<{ id: StoryId; chapter: number } | null>(null)
  const [prompt, setPrompt] = useState<Discovery | null>(null)
  const [hint, setHint] = useState<'around' | 'behind' | null>(null)
  const [onboarding, setOnboarding] = useState(false)
  const [focusStory, setFocusStory] = useState<StoryId | null>(initialStory)
  const [saveData, setSaveData] = useState<Partial<Record<StoryId, StorySave | null>>>({})
  const [lastStory, setLastStory] = useState<StoryId | null>(null)
  const [touch, setTouch] = useState(false)
  const [choice, setChoice] = useState<{ gate: ChoiceGate; picked: string[] } | null>(null)
  const [flags, setFlags] = useState<string[]>([])
  const [journal, setJournalTab] = useState<JournalTab | null>(null)
  const [journalData, setJournalData] = useState<{ entries: JournalEntry[]; seen: ReadonlySet<string> }>({ entries: [], seen: new Set() })
  const { messages, push, clear } = useHudMessages()

  const story = storyId ? STORIES[storyId] : null
  const uiSound = useCallback((kind: UiSound) => runtimeRef.current?.audio.ui(kind), [])

  // ——— Navigation ———

  const go = useCallback((next: Screen, id: StoryId | null, how: 'push' | 'replace' | 'none' = 'push') => {
    if (how !== 'none') {
      const url = urlFor(next, id)
      if (how === 'push') history.pushState({ strolly: next }, '', url)
      else history.replaceState({ ...(history.state ?? {}), strolly: next }, '', url)
    }
    document.title = pageTitle(next, id)
    setScreen(next)
  }, [])

  const enter = useCallback(
    (id: StoryId, chapter?: number, how: 'push' | 'replace' | 'none' = 'push') => {
      const rt = runtimeRef.current
      if (!rt) return
      setStoryId(id)
      setFocusStory(id)
      setComplete(null)
      setSceneError(null)
      setPaused(false)
      setSettingsOpen(false)
      setPrompt(null)
      setHint(null)
      clear()
      go('story', id, how)
      rt.open(id, { chapter })
    },
    [go, clear],
  )

  /** Leaves the story (if any) for a menu screen. */
  const leaveTo = useCallback(
    (next: Exclude<Screen, 'story'>, how: 'push' | 'replace' | 'none' = 'push') => {
      const rt = runtimeRef.current
      if (!rt) return
      setPaused(false)
      setSettingsOpen(false)
      setComplete(null)
      setPrompt(null)
      setHint(null)
      clear()
      if (!rt.current && rt.currentPhase === 'idle') {
        go(next, null, how)
        return
      }
      rt.close().then(() => {
        if (rt.current !== null || rt.currentPhase !== 'idle') return
        setStoryId(null)
        setSaveData(readSaves())
        go(next, null, how)
      })
    },
    [go, clear],
  )

  // ——— The runtime ———

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // Development-only switches to review the reduced-motion and no-WebGL paths.
    if (isDev && params.get('reduced') === '1') settings.set({ reducedMotion: true })
    const forceFallback = isDev && params.get('fallback') === '1'
    const rt = new StoryRuntime(
      { canvas: canvasRef.current!, track: trackRef.current!, labels: labelsRef.current!, veil: veilRef.current!, backdrop: backdropRef.current! },
      { narrative: () => narrativeRef.current, hud: () => hudRef.current },
      {
        phase: setPhase,
        mode: setMode,
        iteration: (n) => {
          setIteration(n)
          setComplete(null)
        },
        failed: () => {
          const id = rt.current
          if (id) setSceneError({ id, chapter: saves.story(id)?.chapter ?? 1 })
        },
        saved: () => {
          rt.audio.ui('save')
          push({ kind: 'saved', lines: ['İLERLEME KAYDEDİLDİ'] }, 2200)
        },
        chapterComplete: (index, title, total) => {
          rt.audio.ui('transition')
          push({ kind: 'chapter', lines: ['BÖLÜM TAMAMLANDI', title], sub: `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}` }, 3200)
        },
        caption: (text) => push({ kind: 'caption', lines: [text] }, 3400),
        prompt: setPrompt,
        examined: (d) => {
          if (d.examine) push({ kind: 'examine', lines: d.examine.lines }, 2400 + d.examine.lines.join(' ').length * 55)
        },
        hint: setHint,
        completed: (seen, total) => {
          rt.audio.ui('complete')
          setComplete({ seen, total })
          setSaveData(readSaves())
        },
        cursor: (c) => cursorRef.current?.set(c),
        choice: (gate, picked) => setChoice(gate ? { gate, picked } : null),
        flags: setFlags,
      },
      forceFallback,
    )
    runtimeRef.current = rt
    const unsubscribeSaves = saves.subscribe(() => setSaveData(readSaves()))
    queueMicrotask(() => {
      setSaveData(readSaves())
      setLastStory(saves.last)
      setTouch(window.matchMedia('(pointer: coarse)').matches)
    })

    // The entry we landed on is left to Next.js (its router keeps its own state there).
    if (initialStory) rt.open(initialStory)
    else rt.menuAmbience()

    const onPop = () => {
      const q = new URLSearchParams(window.location.search)
      const id = q.get('story')
      if (isStoryId(id)) {
        if (rt.current !== id) enter(id, undefined, 'none')
        return
      }
      const next: Screen = q.get('menu') === 'hikayeler' ? 'stories' : 'title'
      leaveTo(next, 'none')
    }
    window.addEventListener('popstate', onPop)

    // Sound needs a gesture; the first one turns it on unless the player said no.
    const onGesture = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('.hud-sound, .menu-sound')) return
      removeGesture()
      if (read(SOUND_KEY) === 'off' || rt.audio.running) return
      rt.audio
        .enable()
        .then(() => setSoundOn(true))
        .catch(() => undefined)
    }
    const removeGesture = () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)

    if (isDev && params.get('debug') === '1') {
      const api: DebugApi = {
        info: () => {
          const st = rt.current ? STORIES[rt.current] : null
          const p = rt.progress
          const i = rt.stageInfo
          return {
            story: rt.current ?? 'menu',
            phase: rt.currentPhase,
            p,
            segment: st ? st.timeline.segmentAt(p).id : '—',
            chapter: st ? st.timeline.chapterAt(p).title : '—',
            set: i?.set ?? '—',
            sp: i?.sp ?? p,
            camera: i ? [i.camera.x, i.camera.y, i.camera.z] : [0, 0, 0],
            fps: Math.round(rt.fps),
            scale: rt.resScale,
            audio: rt.audio.running ? 'on' : 'off',
            paused: rt.held !== null,
            segments: st ? st.timeline.SEGMENT_LIST.map((x) => x.id) : [],
            chapters: st ? st.timeline.CHAPTERS.map((c) => ({ index: c.index, start: c.start })) : [],
          }
        },
        jump: (p) => rt.jump(p),
        jumpTo: (segment, f = 0.5) => {
          const x = rt.current ? STORIES[rt.current].timeline.SEG[segment] : undefined
          if (x) rt.jump(x.start + x.len * f)
        },
        pause: (p) => {
          rt.held = p
        },
        open: (id) => enter(id),
        close: () => leaveTo('stories'),
      }
      ;(window as unknown as { __strolly: unknown }).__strolly = { ...api, runtime: rt, look: rt.look }
    }

    return () => {
      removeGesture()
      unsubscribeSaves()
      window.removeEventListener('popstate', onPop)
      rt.dispose()
      runtimeRef.current = null
    }
    // The runtime is created once per mount; the initial story is read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ——— Pause ———

  const [pausedAt, setPausedAt] = useState<{ index: number; title: string } | null>(null)
  const pause = useCallback((on: boolean) => {
    const rt = runtimeRef.current
    if (!rt || !rt.current) return
    rt.setPaused(on)
    setPaused(on)
    if (on) setPausedAt(rt.chapter)
    else setSettingsOpen(false)
  }, [])

  // Escape: close the innermost thing; in a story, pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (settingsOpen) {
        setSettingsOpen(false)
        uiSound('close')
        return
      }
      if (confirmNew) {
        setConfirmNew(false)
        return
      }
      if (screen === 'story') {
        if (phase === 'active') {
          uiSound(paused ? 'close' : 'open')
          pause(!paused)
        }
        return
      }
      if (journal) {
        setJournalTab(null)
        uiSound('close')
        return
      }
      if (screen === 'stories' || screen === 'archive') {
        uiSound('close')
        go('title', null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen, confirmNew, journal, screen, phase, paused, pause, go, uiSound])

  // Leaving the tab mid-story pauses it, like a game does.
  useEffect(() => {
    if (screen !== 'story') return
    const onHide = () => {
      if (document.hidden && phase === 'active') pause(true)
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [screen, phase, pause])

  // ——— Onboarding: two lines, once ———

  useEffect(() => {
    if (screen !== 'story' || phase !== 'active' || mode !== 'webgl' || read(ONBOARD_KEY)) return
    const show = setTimeout(() => setOnboarding(true), 900)
    const hide = setTimeout(() => {
      setOnboarding(false)
      write(ONBOARD_KEY, '1')
    }, 7800)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [screen, phase, mode])

  // ——— Menu ambience follows the focused story ———

  const ambienceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusFor = useCallback((id: StoryId) => {
    setFocusStory(id)
    if (ambienceTimer.current) clearTimeout(ambienceTimer.current)
    ambienceTimer.current = setTimeout(() => runtimeRef.current?.menuAmbience(selectorAudio(STORIES[id].meta.theme)), 260)
  }, [])
  useEffect(() => {
    if (screen === 'title' || screen === 'archive') runtimeRef.current?.menuAmbience(selectorAudio())
    if (screen === 'farewell') runtimeRef.current?.menuAmbience(selectorAudio('silence'))
  }, [screen])
  useEffect(() => () => void (ambienceTimer.current && clearTimeout(ambienceTimer.current)), [])

  // ——— Sound ———

  const toggleSound = useCallback(async () => {
    const audio = runtimeRef.current?.audio
    if (!audio) return
    if (audio.running) {
      audio.disable()
      write(SOUND_KEY, 'off')
      setSoundOn(false)
    } else {
      await audio.enable()
      write(SOUND_KEY, 'on')
      setSoundOn(true)
    }
  }, [])

  // ——— Title screen actions ———

  const resume = useMemo<ContinueInfo | null>(() => {
    const id = lastStory && saveData[lastStory] ? lastStory : null
    if (!id) return null
    const sv = saveData[id]!
    const st = STORIES[id]
    const c = st.timeline.CHAPTERS[Math.max(0, sv.chapter - 1)]
    return { title: st.meta.title, chapter: sv.chapter, chapterTitle: c?.title ?? '', percent: Math.round((sv.completed ? 1 : sv.progress) * 100) }
  }, [lastStory, saveData])

  const onContinue = () => {
    if (!lastStory) return
    const sv = saveData[lastStory]
    enter(lastStory, sv && !sv.completed ? sv.chapter : undefined)
  }

  const onExit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    go('farewell', null, 'none')
  }

  const flagSet = useMemo(() => new Set(flags), [flags])
  const pick = useCallback((id: string) => {
    runtimeRef.current?.choose(id)
    setChoice((c) => (c && !c.picked.includes(id) ? { ...c, picked: [...c.picked, id] } : c))
  }, [])
  const release = useCallback(() => runtimeRef.current?.release(), [])
  // The journal shows the reading as it was when it was opened.
  const setJournal = (tab: JournalTab | null) => {
    const rt = runtimeRef.current
    if (tab && rt) setJournalData({ entries: rt.journal(), seen: new Set(rt.seen) })
    setJournalTab(tab)
  }

  const theme: StoryTheme | 'menu' = screen === 'story' && story ? story.meta.theme : screen === 'stories' && focusStory ? STORIES[focusStory].meta.theme : 'menu'
  const reducedText = s.reducedMotion || !s.motion

  return (
    <UiSoundContext.Provider value={uiSound}>
      <div className="strolly" data-screen={screen} data-phase={phase} data-mode={mode} data-story={storyId ?? 'none'} data-theme={theme} data-paused={paused}>
        <MenuBackdrop active={screen !== 'story'} tint={TINT[theme]} />
        <div ref={backdropRef} className="backdrop" data-chapter="1" aria-hidden="true" />
        <canvas ref={canvasRef} className="stage" aria-label={story ? `${story.meta.title}: sahne. Sürükleyerek etrafına bak.` : undefined} role={story ? 'img' : undefined} />
        <div ref={labelsRef} className="labels" aria-hidden="true" />

        {story && <NarrativeLayer key={`narrative-${story.meta.id}`} ref={narrativeRef} story={story} iteration={iteration} fallback={mode === 'fallback'} reduced={reducedText} flags={flags} />}
        {story && screen === 'story' && (
          <GameHUD
            key={`hud-${story.meta.id}`}
            ref={hudRef}
            story={story}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            onMenu={() => {
              uiSound('open')
              pause(true)
            }}
            onRecenter={() => {
              uiSound('click')
              runtimeRef.current?.look.recenter()
            }}
            prompt={paused || choice ? null : prompt}
            hint={paused || choice ? null : hint}
            messages={messages}
            onboarding={onboarding}
            touch={touch}
          />
        )}
        {story && (
          <CompleteScreen
            open={!!complete && screen === 'story' && !paused}
            title={story.meta.title}
            seen={complete?.seen ?? 0}
            total={complete?.total ?? 0}
            loops={story.meta.loops}
            onReplay={() => enter(story.meta.id, undefined, 'replace')}
            onStories={() => leaveTo('stories')}
            onMenu={() => leaveTo('title')}
          />
        )}

        <TitleScreen
          active={screen === 'title' && !settingsOpen && !confirmNew}
          resume={resume}
          onContinue={onContinue}
          onStories={() => go('stories', null)}
          onNewGame={() => (Object.values(saveData).some(Boolean) ? setConfirmNew(true) : go('stories', null))}
          onSettings={() => setSettingsOpen(true)}
          onArchive={() => go('archive', null, 'none')}
          onExit={onExit}
        />
        <StorySelect active={screen === 'stories' && !settingsOpen} saves={saveData} focus={focusStory} onFocus={focusFor} onPlay={(id, chapter) => enter(id, chapter)} onBack={() => go('title', null)} />
        <ArchiveScreen active={screen === 'archive'} saves={saveData} onBack={() => go('title', null, 'none')} />
        {screen === 'story' && !paused && <ChoicePanel gate={choice?.gate ?? null} picked={choice?.picked ?? []} flags={flagSet} reduced={reducedText} onPick={pick} onDone={release} />}
        <Farewell active={screen === 'farewell'} onReturn={() => go('title', null, 'none')} />

        <BrandMark visible={screen !== 'story' || paused} />
        {screen !== 'story' && (
          <button type="button" className="menu-sound" aria-pressed={soundOn} aria-label={soundOn ? 'Sesi kapat' : 'Sesi aç'} onClick={toggleSound}>
            <span className="hud-sound-icon" data-on={soundOn} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            SES
          </button>
        )}

        <PauseMenu
          open={paused && !settingsOpen && !journal && screen === 'story'}
          title={story?.meta.title ?? ''}
          chapter={pausedAt ? `BÖLÜM ${String(pausedAt.index).padStart(2, '0')} ${pausedAt.title}` : ''}
          onResume={() => pause(false)}
          onRestartChapter={() => {
            runtimeRef.current?.restartChapter()
            pause(false)
          }}
          onStories={() => leaveTo('stories')}
          onSettings={() => setSettingsOpen(true)}
          onJournal={setJournal}
          onMainMenu={() => leaveTo('title')}
        />
        {story && (
          <Journal
            open={!!journal && paused && screen === 'story'}
            tab={journal ?? 'journal'}
            story={story}
            entries={journalData.entries}
            seen={journalData.seen}
            onTab={setJournal}
            onClose={() => setJournal(null)}
          />
        )}
        <SettingsMenu open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ConfirmDialog
          open={confirmNew}
          title="YENİ OYUN"
          body="Bütün hikâyelerdeki ilerleme ve keşifler silinecek. Ayarların korunur."
          confirm="SİL VE BAŞLA"
          onCancel={() => setConfirmNew(false)}
          onConfirm={() => {
            saves.clearAll()
            setLastStory(null)
            setConfirmNew(false)
            go('stories', null)
          }}
        />
        <SceneError
          open={!!sceneError}
          onRetry={() => sceneError && enter(sceneError.id, sceneError.chapter, 'replace')}
          onStories={() => {
            setSceneError(null)
            leaveTo('stories')
          }}
        />

        <div className="loading" role="status" aria-live="polite">
          {story && phase === 'loading' && (
            <>
              <span className="loading-brand">STROLLY</span>
              <span className="loading-title">{story.meta.title}</span>
              <span className="loading-chapter">{story.meta.mood}</span>
              <span className="loading-line" aria-hidden="true" />
              <span className="sr-only">yükleniyor</span>
            </>
          )}
        </div>
        <div ref={veilRef} className="veil" data-on="false" aria-hidden="true" />
        {/* Its length is set by the runtime for the story being read. */}
        <div ref={trackRef} className="track" />
        <Cursor ref={cursorRef} />
      </div>
    </UiSoundContext.Provider>
  )
}
