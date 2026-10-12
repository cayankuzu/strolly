/**
 * B — the line (x −300): an endless navy-black void, a glass filament you
 * can hardly see, a nine-year-old walking it with his hands in his pockets,
 * and under it, upside down, his translucent twin mirroring every step.
 * A can with two white wings; a banner far off to his right.
 */
import * as THREE from 'three'
import { clamp, lerp } from '@/lib/math'
import { addWalk, blendPose, makePose } from '../../figure/Figure'
import { keyed, type ShotKeys } from '../../kit/direct'
import { mesh } from '../../util'
import { PI, rng, ss, win, canvasTexture, type Ctx, type Dir, type PSet } from '../common'
import { lineMaterial, particleMaterial } from '../shaders'
import * as PP from '../poses'
import { H9 } from '../cast'
import type { SkyPreset } from '../env'

const X = -300
const VOID: SkyPreset = { zenith: 0x05070e, horizon: 0x0a0f1f, below: 0x0c1838, haze: 0x0b1226, hazeAmt: 0.4, sunColor: 0x000000, disc: 0, glow: 0, cloud: 0, cloudLit: 0, cloudShade: 0, power: 1 }

/** The can's label: silver-blue, two white wings, the word. */
function canLabel() {
  return canvasTexture(512, 256, (g, W, H) => {
    const grad = g.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#b8cbe6')
    grad.addColorStop(0.5, '#8ea6c8')
    grad.addColorStop(1, '#6f86a8')
    g.fillStyle = grad
    g.fillRect(0, 0, W, H)
    // Brushed streaks.
    for (let i = 0; i < 220; i++) {
      g.fillStyle = `rgba(255,255,255,${0.03 + (i % 5) * 0.012})`
      g.fillRect(0, (i * 37) % H, W, 1)
    }
    // Two wings around the front (the front is the middle of the label).
    const wing = (cx: number, cy: number, s: number, dir: number) => {
      g.save()
      g.translate(cx, cy)
      g.scale(dir * s, s)
      g.fillStyle = '#ffffff'
      for (let k = 0; k < 5; k++) {
        g.beginPath()
        g.moveTo(0, 0)
        g.quadraticCurveTo(30 + k * 6, -40 + k * 14, 70 - k * 4, -30 + k * 16)
        g.quadraticCurveTo(40, -6 + k * 6, 0, 8)
        g.closePath()
        g.fill()
      }
      g.restore()
    }
    wing(W / 2 - 16, 92, 1.0, -1)
    wing(W / 2 + 16, 92, 1.0, 1)
    g.fillStyle = '#0d2a5c'
    g.font = '800 40px sans-serif'
    g.textAlign = 'center'
    g.fillText('KANATLANDIRIR', W / 2, 182)
    g.fillStyle = '#ffffff'
    g.fillRect(W / 2 - 120, 198, 240, 3)
  })
}

function bannerTexture() {
  return canvasTexture(1024, 288, (g, W, H) => {
    const grad = g.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1d3f86')
    grad.addColorStop(1, '#14306a')
    g.fillStyle = grad
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#ffffff'
    const wing = (dir: number) => {
      g.save()
      g.translate(W / 2 + dir * 18, 120)
      g.scale(dir * 2.1, 2.1)
      for (let k = 0; k < 6; k++) {
        g.beginPath()
        g.moveTo(0, 0)
        g.quadraticCurveTo(30 + k * 7, -42 + k * 12, 78 - k * 5, -32 + k * 14)
        g.quadraticCurveTo(44, -4 + k * 5, 0, 9)
        g.closePath()
        g.fill()
      }
      g.restore()
    }
    wing(-1)
    wing(1)
    g.font = '400 15px sans-serif'
    g.textAlign = 'center'
    g.fillStyle = 'rgba(255,255,255,0.75)'
    g.fillText('Kullanmadan önce uyarıları okuyunuz.', W / 2, H - 22)
  })
}

const SHOTS: Record<'can', ShotKeys> = {
  can: [
    [0, [-298.7, 0.75, 1.55, -300.05, 0.85, -0.05, 35]],
    [0.4, [-298.8, 0.8, 1.45, -300.05, 0.95, -0.1, 33]],
    [0.42, [-299.25, 0.98, 0.42, -300.05, 0.96, -0.2, 32]],
    [0.64, [-299.3, 0.98, 0.36, -300.05, 0.96, -0.2, 30]],
    [0.66, [-299.35, 1.1, 0.7, -300.15, -0.6, -0.55, 46]],
    [1, [-299.4, 0.95, 0.6, -300.25, -3.2, -0.6, 50]],
  ],
}

export class VoidSet implements PSet {
  readonly group = new THREE.Group()
  private line!: THREE.ShaderMaterial
  private can = new THREE.Group()
  private canBody!: THREE.Mesh
  private dust!: THREE.Points
  private dustSeeds: number[] = []
  private pose = makePose({})
  private v = new THREE.Vector3()
  private q = new THREE.Quaternion()

  build(c: Ctx) {
    const g = this.group
    this.line = lineMaterial()
    const filament = mesh(new THREE.CylinderGeometry(0.015, 0.015, 430, 12, 1, true), this.line, X, 0, -185, g)
    filament.rotation.x = PI / 2
    filament.renderOrder = 3

    // The can: brushed silver-blue, label all round, a lid with a tab.
    const label = canLabel()
    label.wrapS = THREE.RepeatWrapping
    const metal = new THREE.MeshStandardMaterial({ color: 0xc9d6ea, metalness: 0.85, roughness: 0.32, map: label })
    const lid = new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 0.95, roughness: 0.25 })
    const body = new THREE.CylinderGeometry(0.033, 0.033, 0.13, 32, 1, true)
    // Turn the label so its middle (the wings) faces local +z.
    body.rotateY(-PI / 2)
    this.canBody = mesh(body, metal, 0, 0, 0, this.can)
    const top = new THREE.LatheGeometry(
      [
        [0.033, 0.065],
        [0.029, 0.075],
        [0.027, 0.0795],
        [0.0, 0.08],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      32,
    )
    mesh(top, lid, 0, 0, 0, this.can)
    const bottom = top.clone()
    bottom.scale(1, -1, 1)
    mesh(bottom, lid, 0, 0, 0, this.can)
    mesh(new THREE.BoxGeometry(0.014, 0.002, 0.024), lid, 0, 0.081, 0.006, this.can)
    this.can.traverse((o) => (o.castShadow = true))
    g.add(this.can)

    // The banner, far off to his right, turned toward the line.
    const banner = mesh(new THREE.PlaneGeometry(18, 5), new THREE.MeshStandardMaterial({ map: bannerTexture(), emissiveMap: null, emissive: 0x000000, roughness: 0.9, side: THREE.DoubleSide }), -282, 6, -60, g)
    ;(banner.material as THREE.MeshStandardMaterial).emissive.set(0x24304a)
    ;(banner.material as THREE.MeshStandardMaterial).emissiveMap = (banner.material as THREE.MeshStandardMaterial).map
    banner.rotation.y = -PI / 2 + 0.61
    // Two cables up into the dark.
    for (const sx of [-8.6, 8.6]) {
      const cable = mesh(new THREE.CylinderGeometry(0.02, 0.02, 60, 4), new THREE.MeshBasicMaterial({ color: 0x1a2236 }), 0, 0, 0, g)
      const p = new THREE.Vector3(sx, 2.5, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), banner.rotation.y).add(banner.position)
      cable.position.set(p.x, p.y + 30, p.z)
    }

    // Dust motes drifting around wherever he is.
    const rand = rng(77)
    const n = 420
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n * 4; i++) this.dustSeeds.push(rand())
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.dust = new THREE.Points(geo, particleMaterial(0x9fb4d8, 0.03, 0.55))
    this.dust.frustumCulled = false
    g.add(this.dust)
    void c
  }

  private boyZ(seg: string, u: number) {
    if (seg === 'line') return -5 * u
    return -5 - 0.18 * ss(0, 0.04, u)
  }

  direct(d: Dir) {
    const { seg, u, cu, f, shot, cast, env } = d
    const t = f.time
    env.sky.set(VOID, new THREE.Vector3(0, 1, 0))
    env.setFog(0x070a14, 0.045)
    env.setHemi(0x26324d, 0x05070d, 0.25)
    env.ibl('moonless_golf', 0.35)
    env.setSun(new THREE.Vector3(X, 0, -3), new THREE.Vector3(0.3, 1, 0.4), 0x9fb4d8, 0.0, 6)
    const bz = this.boyZ(seg, u)
    // One soft key from above and in front, following him.
    env.setSpot(env.spot2, new THREE.Vector3(X + 2.2, 5.5, bz + 3.5), new THREE.Vector3(X, 0.9, bz), 0xd8e6ff, 38, 0.5, 0.7, 14)
    env.setFill(new THREE.Vector3(X - 4, 1, bz - 3), new THREE.Vector3(X, 1, bz), 0x5d78b0, 0.35)
    this.line.uniforms.uFeet.value.set(X, 0, bz)

    const boy = cast.solids.boy9
    boy.begin()
    if (seg === 'line') {
      // Slow tightrope steps; arms out, then (0.62) into the pockets.
      const k = ss(0.52, 0.66, u)
      blendPose(PP.ARMS_OUT, PP.POCKETS, k, this.pose)
      boy.place(X, bz, PI)
      boy.hold(this.pose)
      const phase = u * 16 * PI
      addWalk(boy.pose, phase, 0.55)
      boy.pose[2 + 11 * 3 + 2] -= 0.05
      boy.pose[2 + 14 * 3 + 2] += 0.05
      boy.step = Math.floor(phase / PI)
      boy.walking = 0.6
      // A little balance sway with the arms out.
      boy.pose[2 + 1 * 3 + 2] += Math.sin(t * 1.3) * 0.03 * (1 - k)
    } else {
      this.canAction(d, bz)
    }
    boy.y = 0.015
    boy.apply(t, true)
    d.step = boy.step
    d.walking = seg === 'line' ? 0.6 : 0
    if (seg === 'can') this.placeCan(d, bz)
    else this.can.visible = false

    // The twin hangs under the line, upside down, soles to his soles.
    const twin = cast.ghosts.roofs
    cast.ghost(
      twin,
      u,
      (a) => {
        a.place(boy.x, boy.z, boy.yaw)
        a.hold(boy.pose)
        a.y = -0.015
        return 0.3
      },
      t,
      {
        after: (a) => {
          a.figure.root.scale.set(H9, -H9, H9)
          a.figure.root.updateMatrixWorld(true)
        },
      },
    )

    this.drift(t, bz)

    // Camera.
    if (seg === 'line') {
      const k = ss(0.5, 1, cu)
      shot.pos.set(lerp(-296, -297.5, k), lerp(0.4, -0.6, k), bz + lerp(2, 3, k))
      shot.tgt.set(X, lerp(0.85, -0.05, k), bz + lerp(0.45, 0.7, k))
      shot.fov = 40
      shot.handheld = 0.4
    } else {
      keyed(SHOTS.can, cu, shot)
      // Shift into the walker's frame (keys are written for z = −5.18 → origin offset).
      shot.pos.z += bz
      shot.tgt.z += bz
      if (cu > 0.66) {
        // Tilt down with the falling can.
        const cp = this.can.position
        shot.tgt.y = Math.min(shot.tgt.y, lerp(0.2, cp.y, ss(0.72, 0.8, u)))
        shot.tgt.x = lerp(shot.tgt.x, cp.x, 0.5)
      }
      shot.handheld = 0.3
    }
  }

  /** The can: out of the pocket, opened, drunk, held up to us, crushed, let go. */
  private canAction(d: Dir, bz: number) {
    const boy = d.cast.solids.boy9
    const u = d.u
    boy.place(X, bz, PI)
    const k = ss(0, 0.06, u)
    blendPose(PP.POCKETS, PP.STAND, k, this.pose)
    boy.hold(this.pose)
    // Head back while drinking.
    const drink = win(0.16, 0.22, 0.36, 0.42, u)
    boy.pose[2 + 4 * 3] += -0.55 * drink
    boy.pose[2 + 3 * 3] += -0.2 * drink
    // Looking at us while he raises it; looking down after the drop.
    const down = ss(0.72, 0.8, u)
    boy.pose[2 + 4 * 3] += 0.55 * down
    boy.pose[2 + 3 * 3] += 0.25 * down
    // The settle after the last step.
    if (u < 0.04) {
      addWalk(boy.pose, PI * (16 + u * 10), 0.4 * (1 - u / 0.04))
    }
    const H = H9
    const chest = (y: number) => y * H
    // Right hand targets (world), in sequence.
    const pocket = [X - 0.12 * H, chest(0.92), bz - 0.06]
    const front = [X - 0.06 * H, chest(1.08), bz - 0.22]
    const mouth = [X - 0.02 * H, chest(1.46), bz - 0.12]
    const toast = [X + 0.08, chest(1.32), bz + 0.28]
    const side = [X + 0.32, chest(1.12), bz - 0.06]
    const keys: Array<[number, number[]]> = [
      [0.04, pocket],
      [0.11, front],
      [0.16, front],
      [0.22, mouth],
      [0.38, mouth],
      [0.44, toast],
      [0.62, toast],
      [0.68, front],
      [0.71, side],
      [1, side],
    ]
    let a = keys[0]
    let b = keys[keys.length - 1]
    for (let i = 0; i < keys.length - 1; i++)
      if (u >= keys[i][0] && u <= keys[i + 1][0]) {
        a = keys[i]
        b = keys[i + 1]
        break
      }
    const tt = ss(a[0], b[0], u)
    const tx = lerp(a[1][0], b[1][0], tt)
    const ty = lerp(a[1][1], b[1][1], tt)
    const tz = lerp(a[1][2], b[1][2], tt)
    const w = ss(0.02, 0.08, u) * (1 - ss(0.86, 0.98, u))
    boy.reach('r', w, tx, ty, tz, 0.35)
    // The left hand comes to open the tab.
    const open = win(0.09, 0.12, 0.14, 0.17, u)
    boy.reach('l', open, X + 0.0, chest(1.12), bz - 0.24, 0.4)
    boy.lookAt(X + 2, bz + 2.5, win(0.42, 0.46, 0.6, 0.64, u) * 0.6)
  }

  private placeCan(d: Dir, bz: number) {
    const boy = d.cast.solids.boy9
    const u = d.u
    const can = this.can
    can.visible = u > 0.035
    if (!can.visible) return
    const crush = ss(0.64, 0.68, u)
    this.canBody.scale.set(1 - 0.18 * crush, 1 - 0.1 * crush, 1 - 0.22 * crush)
    if (u < 0.72) {
      boy.figure.rGrip.getWorldPosition(this.v)
      boy.figure.rGrip.getWorldQuaternion(this.q)
      can.position.copy(this.v)
      can.quaternion.copy(this.q)
      // Upright in the hand, label to whoever he shows it to.
      can.rotateX(-PI / 2 + 0.1)
      can.rotateY(PI)
      can.position.y += 0.0
    } else {
      // Let go: it tumbles down into the dark past the twin, never landing.
      const sec = (u - 0.72) * 9
      boy.figure.rGrip.getWorldPosition(this.v)
      const x0 = X + 0.32
      const y0 = H9 * 1.1
      can.position.set(x0 + 0.12 * sec, y0 - 4.9 * sec * sec, bz - 0.06 + 0.05 * sec)
      can.rotation.set(sec * 3.1, sec * 1.3, sec * 2.2)
    }
    void bz
  }

  private drift(t: number, bz: number) {
    const pos = this.dust.geometry.attributes.position as THREE.BufferAttribute
    const s = this.dustSeeds
    const n = pos.count
    for (let i = 0; i < n; i++) {
      const a = s[i * 4]
      const b = s[i * 4 + 1]
      const c = s[i * 4 + 2]
      const e = s[i * 4 + 3]
      const z = bz + 8 - ((c * 30 + t * 0.05 * (0.5 + e)) % 30)
      pos.setXYZ(i, X - 12 + a * 24 + Math.sin(t * 0.2 + e * 9) * 0.3, -10 + b * 18 + Math.sin(t * 0.13 + a * 7) * 0.2, z)
    }
    pos.needsUpdate = true
    void clamp
  }
}
