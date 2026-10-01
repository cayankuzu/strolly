/**
 * The 360° look: where the reader turns their head inside the scene.
 *
 * The story camera says where the shot is and what it frames; the look is an
 * offset on top of it (yaw around the vertical, pitch up/down). Input is
 * deliberate — press and drag (mouse) or drag (touch); moving the mouse alone
 * never turns the camera. Release keeps a little inertia, then settles.
 *
 * States:
 *   idle         nothing is steering; may drift home after a while (auto-center)
 *   looking      the reader is dragging
 *   inertia      released, still gliding
 *   focusing     the story is gently guiding the view (the reader can take over)
 *   transitioning / locked   the story holds the frame (offsets ease to zero)
 */
export type LookState = 'idle' | 'looking' | 'inertia' | 'focusing' | 'transitioning' | 'locked'

export type LookLimits = {
  /** Max |yaw| in radians, or null for a full turn. */
  yaw: number | null
  pitchMin: number
  pitchMax: number
}

export const FULL: LookLimits = { yaw: null, pitchMin: -0.95, pitchMax: 0.8 }

export type LookOptions = {
  sensitivity: number
  invertY: boolean
  autoCenter: boolean
  /** Reduced camera motion: slower, no inertia, no auto drift. */
  reduced: boolean
  enabled: boolean
}

const TAU = Math.PI * 2
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export class LookController {
  yaw = 0
  pitch = 0
  state: LookState = 'idle'
  private tYaw = 0
  private tPitch = 0
  private vYaw = 0
  private vPitch = 0
  private idleFor = 0
  private focusTime = 0
  /** Where recenter and auto-center return to: the shot's framing, or the direction the story last guided toward (until the next cut). */
  private homeYaw = 0
  private homePitch = 0
  private keys = { left: false, right: false, up: false, down: false }
  limits: LookLimits = FULL
  options: LookOptions = { sensitivity: 1, invertY: false, autoCenter: true, reduced: false, enabled: true }
  /** Set by the shell while a story is loading/leaving or the reader is in a menu. */
  held = false

  /** Pointer delta in CSS pixels while dragging. */
  drag(dx: number, dy: number, viewportWidth: number) {
    if (!this.canSteer()) return
    // A drag across the whole screen turns roughly 120°.
    const k = ((2.1 / Math.max(320, viewportWidth)) * this.options.sensitivity) * (this.options.reduced ? 0.6 : 1)
    const yaw = dx * k
    const pitch = dy * k * (this.options.invertY ? -1 : 1)
    this.tYaw += yaw
    this.tPitch += pitch
    this.vYaw = yaw * 60
    this.vPitch = pitch * 60
    this.state = 'looking'
    this.idleFor = 0
    this.clampTargets()
  }

  release() {
    if (this.state !== 'looking') return
    this.state = this.options.reduced ? 'idle' : 'inertia'
    if (this.options.reduced) this.vYaw = this.vPitch = 0
  }

  key(dir: 'left' | 'right' | 'up' | 'down', down: boolean) {
    this.keys[dir] = down
    if (down) this.idleFor = 0
  }

  /** Gently turns toward a direction (story guidance). The reader can always take over. */
  focus(yaw: number, pitch = 0, seconds = 1.6) {
    if (!this.canSteer() || this.state === 'looking') return
    this.tYaw = this.yaw + wrap(yaw - this.yaw)
    this.tPitch = pitch
    this.vYaw = this.vPitch = 0
    this.focusTime = seconds
    this.idleFor = 0
    this.state = 'focusing'
  }

  /**
   * Story guidance: turn toward a direction, which stays "home" until the shot
   * cuts. If the reader is mid-drag they keep control; home still moves.
   * Returns false when guidance cannot be honored right now (held or locked).
   */
  guide(yaw: number, pitch = 0, seconds = 1.6) {
    if (!this.canSteer()) return false
    this.homeYaw = yaw
    this.homePitch = pitch
    this.focus(yaw, pitch, seconds)
    return true
  }

  /**
   * The story camera cut to a new shot: home is the shot's framing again. If
   * the reader was looking far behind, the view comes back toward it, softly.
   * Call before guide() so guidance that arrives with the cut survives it.
   */
  cut() {
    this.homeYaw = this.homePitch = 0
    if (this.state !== 'looking' && Math.abs(wrap(this.yaw)) > 1.75) this.recenter(1.4)
  }

  recenter(seconds = 1.2) {
    this.focus(this.homeYaw, this.homePitch, seconds)
  }

  /** Snap home with no motion (a new story, a restart). */
  reset() {
    this.yaw = this.pitch = this.tYaw = this.tPitch = this.vYaw = this.vPitch = 0
    this.homeYaw = this.homePitch = 0
    this.idleFor = 0
    this.state = 'idle'
  }

  private canSteer() {
    return this.options.enabled && !this.held && this.state !== 'locked'
  }

  private clampTargets() {
    const l = this.limits
    if (l.yaw !== null) this.tYaw = clamp(this.tYaw, -l.yaw, l.yaw)
    this.tPitch = clamp(this.tPitch, l.pitchMin, l.pitchMax)
  }

  /**
   * @param locked the story holds the frame right now
   */
  update(dt: number, locked: boolean) {
    const o = this.options
    if (!o.enabled || locked || this.held) {
      this.state = this.held ? 'transitioning' : 'locked'
      // Home by the shortest way round.
      this.tYaw = this.yaw - wrap(this.yaw)
      this.tPitch = 0
      this.vYaw = this.vPitch = 0
    } else if (this.state === 'locked' || this.state === 'transitioning') {
      this.state = 'idle'
    }

    // Keyboard look (arrow keys while the story has focus).
    const kx = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0)
    const ky = (this.keys.down ? 1 : 0) - (this.keys.up ? 1 : 0)
    if ((kx || ky) && this.canSteer()) {
      const speed = 1.3 * o.sensitivity * (o.reduced ? 0.6 : 1)
      this.tYaw += kx * speed * dt
      this.tPitch += ky * speed * 0.7 * dt * (o.invertY ? -1 : 1)
      this.state = 'looking'
      this.idleFor = 0
    } else if (this.state === 'looking' && !this.dragging) this.state = this.options.reduced ? 'idle' : 'inertia'

    if (this.state === 'inertia') {
      const decay = Math.exp(-dt * 4.2)
      this.vYaw *= decay
      this.vPitch *= decay
      this.tYaw += this.vYaw * dt
      this.tPitch += this.vPitch * dt
      if (Math.abs(this.vYaw) + Math.abs(this.vPitch) < 0.01) this.state = 'idle'
    }

    if (this.state === 'focusing') {
      this.focusTime -= dt
      if (this.focusTime <= 0) this.state = 'idle'
    }

    if (this.state === 'idle') {
      this.idleFor += dt
      const off = Math.abs(wrap(this.yaw - this.homeYaw)) > 0.05 || Math.abs(this.pitch - this.homePitch) > 0.05
      if (o.autoCenter && !o.reduced && this.idleFor > 9 && off) this.recenter(2.6)
    }
    this.clampTargets()

    // Damped follow: smooth, never instant (no snapping).
    const rate = this.state === 'focusing' || this.state === 'locked' || this.state === 'transitioning' ? 2.4 : this.state === 'looking' ? 14 : 7
    const t = 1 - Math.exp(-dt * rate)
    let dy = this.tYaw - this.yaw
    if (this.limits.yaw === null) {
      // Keep the numbers small without a visible jump.
      if (Math.abs(this.yaw) > TAU) {
        const turns = Math.trunc(this.yaw / TAU) * TAU
        this.yaw -= turns
        this.tYaw -= turns
        dy = this.tYaw - this.yaw
      }
    }
    this.yaw += dy * t
    this.pitch += (this.tPitch - this.pitch) * t
  }

  /** True while a pointer is held down on the scene. */
  dragging = false

  /** How far the view is turned from the story's framing (0 ahead … 1 directly behind). */
  get away() {
    return Math.abs(wrap(this.yaw)) / Math.PI
  }

  /** Angle (radians) between where the reader looks and where recenter would bring them. */
  get offHome() {
    return Math.hypot(wrap(this.yaw - this.homeYaw), this.pitch - this.homePitch)
  }
}
