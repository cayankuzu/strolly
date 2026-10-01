'use client'

/**
 * The living room behind the menus: dust drifting through a slow beam of
 * light, tinted by whatever story has focus. A 2D canvas, a few dozen
 * particles — cheap, and asleep whenever a story is on screen.
 */
import { useEffect, useRef } from 'react'
import { useSettings } from '@/lib/settings'

type Props = { active: boolean; tint: string }

type Mote = { x: number; y: number; z: number; vx: number; vy: number; tw: number }

export default function MenuBackdrop({ active, tint }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const tintRef = useRef(tint)
  const reduced = useSettings().reducedMotion
  // Without motion the picture is drawn once, so a new tint needs a redraw.
  const staticTint = reduced ? tint : null

  useEffect(() => {
    tintRef.current = tint
  }, [tint])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !active) return
    const ctx = canvas.getContext('2d')!
    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const motes: Mote[] = Array.from({ length: 70 }, () => ({ x: rand(), y: rand(), z: 0.3 + rand() * 0.7, vx: (rand() - 0.5) * 0.004, vy: -0.004 - rand() * 0.008, tw: rand() * 6 }))
    let frame = 0
    let last = performance.now()
    let t = 0
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      ctx.clearRect(0, 0, w, h)
      // A beam of light from the upper left, breathing slowly.
      const beam = ctx.createLinearGradient(w * 0.1, 0, w * 0.75, h)
      const a = 0.05 + 0.02 * Math.sin(t * 0.3)
      beam.addColorStop(0, `${tintRef.current}${Math.round(a * 255).toString(16).padStart(2, '0')}`)
      beam.addColorStop(0.6, `${tintRef.current}05`)
      beam.addColorStop(1, `${tintRef.current}00`)
      ctx.fillStyle = beam
      ctx.beginPath()
      ctx.moveTo(w * 0.12, 0)
      ctx.lineTo(w * 0.42, 0)
      ctx.lineTo(w * 0.95, h)
      ctx.lineTo(w * 0.35, h)
      ctx.closePath()
      ctx.fill()
      for (const m of motes) {
        if (!reduced) {
          m.x += m.vx * dt * m.z
          m.y += m.vy * dt * m.z
          if (m.y < -0.02) {
            m.y = 1.02
            m.x = rand()
          }
          if (m.x < -0.02) m.x = 1.02
          if (m.x > 1.02) m.x = -0.02
        }
        const flicker = 0.5 + 0.5 * Math.sin(t * 0.8 + m.tw)
        ctx.globalAlpha = (0.12 + 0.25 * flicker) * m.z
        ctx.fillStyle = tintRef.current
        ctx.beginPath()
        ctx.arc(m.x * w, m.y * h, 0.6 + m.z * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!reduced) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [active, reduced, staticTint])

  return <canvas ref={ref} className="menu-backdrop" data-active={active} aria-hidden="true" />
}
