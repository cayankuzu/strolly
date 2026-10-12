/**
 * Staging for the mission room on Earth (set G): the frozen frame reddening
 * on the big screen, the packets thinning out; the official reading the one
 * report aloud and closing the file; the room going back to work, the cart
 * with the new folders and the form's header; the expedition wall; the
 * keyhole the camera falls into.
 */
import * as THREE from 'three'
import { clamp, lerp, smoothstep } from '@/lib/math'
import { makePath } from '../figure/paths'
import * as P from '../figure/poses'
import { makePose } from '../figure/Figure'
import { G, DESK_TOP } from './mission'
import { POSES } from './cast'
import { env, hemi, point, pulse, show, spot, sunAt, type Rig, type St } from './rig'

const PI = Math.PI
const v = new THREE.Vector3()

/** The official, a tablet held at the chest in his right hand (his left is free for the folder). */
const TABLET_R = makePose({ neck: [0.1, 0, 0], head: [0.2, 0, 0], rUpper: [-0.32, 0, -0.18], lUpper: [-0.1, 0, 0.1], rFore: [-1.35, -0.4, 0], lFore: [-0.5, 0, 0] })
/** Reading from it, chin down a little more. */
const READ_R = makePose({ neck: [0.16, 0, 0], head: [0.3, 0, 0] }, TABLET_R)
/** Operators at the keyboards, eyes up on the big screen. */
const WATCH = makePose({ spine: [0.06, 0, 0], neck: [-0.04, 0, 0], head: [-0.06, 0, 0] }, P.SIT_TYPE)
/** Pushing the cart: arms forward, hands on the handle. */
const PUSH = makePose({ spine: [0.12, 0, 0], lUpper: [-0.9, 0, 0.1], rUpper: [-0.9, 0, -0.1], lFore: [-0.5, 0, 0], rFore: [-0.5, 0, 0] }, P.STAND)

const CART_PATH = makePath([
  [-94.6, 0.5],
  [-95.15, -0.85],
  [-95.6, G.cartPark.z],
  [G.cartPark.x, G.cartPark.z],
])

/** The tablet in a hand. */
function holdTablet(r: Rig, a: ReturnType<typeof show>, side: 'l' | 'r') {
  const tab = r.A.tablet
  tab.visible = true
  const grip = side === 'l' ? a.figure.lGrip : a.figure.rGrip
  grip.getWorldPosition(v)
  tab.position.copy(v)
  tab.rotation.set(-1.0, a.yaw, 0, 'YXZ')
}

/** The operators: B1–B4 at their desks (B4 stands at the side table for the stamp in `readout`). */
function operators(r: Rig, st: St) {
  const { seg, u } = st
  const ids = ['B1', 'B2', 'B3', 'B4'] as const
  for (const id of ids) {
    const [x, z] = G.ops[id]
    const a = show(r, id).place(x, z + 0.05, PI).hold(WATCH)
    // Hands on the keyboard in front of them.
    a.reach('l', 1, x + 0.1, DESK_TOP + 0.03, z - 0.75, 0.3)
    a.reach('r', 1, x - 0.1, DESK_TOP + 0.03, z - 0.75, 0.3)
    if (seg === 'mission') a.lookAt(-100.5, -7, 0.5)
    if (seg === 'routine') {
      if (id === 'B1') {
        // The room relaxes: a long stretch.
        const k = pulse(0.04, 0.42, u)
        a.blend(
          [
            [0, WATCH],
            [1, POSES.STRETCH],
          ],
          k,
        )
        a.reach('l', 0, 0, 0, 0)
      }
      if (id === 'B3') a.lookAt(-99, -1.0, smoothstep(0.1, 0.3, u))
    }
  }
}

export function stageMission(r: Rig, st: St) {
  const { seg, u, time } = st
  const M = r.G
  M.group.visible = true
  const g = show(r, 'G')
  const L = r.lights
  operators(r, st)
  // ——— The screen: the frozen frame (reddening, dimming), the packets ———
  let red = 1
  let dim = 0.42
  if (seg === 'mission') {
    red = smoothstep(0.42, 0.95, u)
    dim = 1 - 0.58 * smoothstep(0.5, 1, u)
  }
  M.feedMat.uniforms.uRed.value = seg === 'readout' ? 0 : red
  M.feedMat.uniforms.uDim.value = seg === 'readout' ? 0.95 : dim
  M.feedMat.uniforms.uTime.value = seg === 'mission' && u < 0.7 ? time : Math.floor(time / 4)
  // The counter: 88.412 … 88.413 …… 88.414, then nothing.
  const count = seg === 'mission' ? (u < 0.34 ? 88412 : u < 0.62 ? 88413 : 88414) : 88414
  const signal = seg === 'mission' ? 1 - smoothstep(0.2, 0.7, u) : 0
  const lost = seg !== 'mission' || u >= 0.72
  M.setPackets(count, signal, lost, seg === 'mission' && u < 0.7 ? time * (1 - u) : 0)
  M.setOps(lost ? 1 : 0)
  // ——— The official ———
  M.folder.visible = true
  M.folder.position.copy(G.folder)
  M.folderCover.rotation.z = 0
  M.stamp.position.copy(G.stampRest)
  M.stamp.rotation.set(0, 0, 0)
  M.stackDone.visible = true
  if (seg === 'mission') {
    // Standing between the rows, facing the screen, the tablet at his chest.
    g.place(G.official.x, G.official.z, PI).hold(TABLET_R)
    g.lookAt(-100.5, -7, 0.3)
    g.apply(time, true)
    holdTablet(r, g, 'r')
    M.folderCover.rotation.z = PI * 0.97
  } else if (seg === 'readout') {
    // He turns to the room and reads, flat; then closes the folder and lays it on the stack.
    g.place(G.official.x, G.official.z + 0.05, 0).hold(READ_R)
    const close = smoothstep(0.7, 0.78, u)
    const lay = smoothstep(0.78, 0.86, u)
    const handOn = smoothstep(0.64, 0.7, u) * (1 - smoothstep(0.88, 0.94, u))
    M.folderCover.rotation.z = PI * 0.97 * (1 - close)
    const fx = lerp(G.folder.x, G.stack.x, lay)
    const fz = lerp(G.folder.z, G.stack.z, lay)
    const fy = lerp(G.folder.y, G.stack.y + 0.08, lay) + Math.sin(lay * PI) * 0.03
    M.folder.position.set(fx, fy, fz)
    // His left hand: on the cover's edge as it closes, then on the folder as it slides.
    const coverEdge = lerp(fx - 0.22, fx + 0.1, close)
    g.reach('l', handOn, lay > 0 ? fx : coverEdge, fy + 0.02 + 0.08 * Math.sin(close * PI) * (1 - lay), fz + 0.05, 0.6)
    g.lookAt(fx, fz, 0.6 * handOn)
    if (handOn > 0.3) g.pose[2 + 4 * 3] += 0.25 * handOn
    g.apply(time, true)
    holdTablet(r, g, 'r')
    // B4 comes to the side table with the stamp.
    const b4 = show(r, 'B4').place(-98.78, -1.72, -PI / 2).hold(P.STAND)
    const stampT = pulse(0.82, 0.96, u)
    const down = pulse(0.86, 0.92, u)
    const hx = lerp(G.stampRest.x, G.stack.x, smoothstep(0.83, 0.86, u))
    const hz = lerp(G.stampRest.z, G.stack.z, smoothstep(0.83, 0.86, u))
    const hy = (u < 0.86 ? G.stampRest.y : G.stack.y + 0.09) + 0.13 * (1 - down) + 0.1
    if (stampT > 0.01) {
      b4.reach('r', clamp(stampT * 1.6), hx, hy + 0.04, hz, 0.5)
      b4.lookAt(hx, hz, 0.8)
      b4.apply(time, true)
      if (u > 0.825 && u < 0.95) {
        b4.figure.rGrip.getWorldPosition(v)
        M.stamp.position.set(v.x, v.y - 0.1, v.z)
      }
    }
  } else if (seg === 'routine') {
    // Back to work. He comes to the cart and opens the top folder on the form.
    g.place(G.cartPark.x, G.cartPark.z - 0.72, 0).hold(P.STAND)
    const open = smoothstep(0.44, 0.52, u)
    M.formCover.rotation.z = open * PI * 0.97
    const reachK = pulse(0.4, 0.58, u)
    M.cart.updateMatrixWorld(true)
    M.formCover.localToWorld(v.set(0.22, 0.0, 0.1))
    g.reach('r', reachK, v.x, v.y + 0.03, v.z, 0.5)
    g.lookAt(G.cartPark.x, G.cartPark.z, 0.8)
    g.pose[2 + 4 * 3] += 0.35
    M.folder.visible = false
  } else {
    // wall, key: he is at the screen, back to us, the folder gone to the stack.
    g.place(-100.6, -2.1, PI).hold(TABLET_R)
    g.apply(time, true)
    holdTablet(r, g, 'r')
    M.folder.position.set(G.stack.x, G.stack.y + 0.08, G.stack.z)
  }
  // ——— The cart rolls in (routine 0.18–0.36), pushed by O2 ———
  M.cart.visible = seg === 'routine' || seg === 'wall' || seg === 'key'
  if (M.cart.visible) {
    const k = seg === 'routine' ? smoothstep(0.16, 0.38, u) : 1
    const pp = CART_PATH
    const d = k * pp.total
    let i = 1
    while (i < pp.cum.length - 1 && pp.cum[i] < d) i++
    const a0 = pp.pts[i - 1]
    const b0 = pp.pts[i]
    const t = (d - pp.cum[i - 1]) / (pp.cum[i] - pp.cum[i - 1] || 1)
    const cx = lerp(a0[0], b0[0], t)
    const cz = lerp(a0[1], b0[1], t)
    const yaw = Math.atan2(b0[0] - a0[0], b0[1] - a0[1])
    M.cart.position.set(cx, 0, cz)
    // The cart's long side along its travel (the last leg is square to the room).
    M.cart.rotation.y = yaw - PI / 2
    if (seg === 'routine' && u < 0.44) {
      // O2 pushes it in, then steps back out of the way.
      const o2 = show(r, 'O2')
      const bx = cx - Math.sin(yaw) * 0.85
      const bz = cz - Math.cos(yaw) * 0.85
      if (k < 1) o2.walk(CART_PATH, k * 0.999, PUSH, yaw, yaw).place(bx, bz, yaw)
      else o2.place(lerp(bx, bx + 0.3, smoothstep(0.38, 0.44, u)), lerp(bz, bz + 0.6, smoothstep(0.38, 0.44, u)), yaw).hold(P.STAND)
    }
  }
  // The coffee cup is refilled (B3 lifts it, 0.08–0.3).
  M.coffeeCup.position.set(-101.6, DESK_TOP, -2.95)
  // ——— KARA DELİK III's status LED: green, then grey (wall 0.12) ———
  const grey = seg === 'wall' ? smoothstep(0.1, 0.14, u) : seg === 'key' ? 1 : 0
  M.ledMat.color.setRGB(lerp(0.3, 0.22, grey), lerp(1.0, 0.23, grey), lerp(0.53, 0.24, grey))
  // ——— Light: night, blue-grey; the screen's glow; small spots on the plaques ———
  const screenCol = new THREE.Color(0x8fb4e8).lerp(new THREE.Color(0xb0402f), seg === 'readout' ? 0 : red)
  spot(L, { x: -100, y: 3.3, z: 0.2 }, { x: -100, y: 0.6, z: -2.2 }, 0xc8d6ec, seg === 'key' ? 2 : 7, 1.0, 0.85, 9, 1.4)
  point(L, 0, -100.5, 1.9, -6.0, screenCol, (seg === 'readout' ? 4 : 5) * dim + 0.6, 7, 1.5)
  point(L, 1, -104.6, 2.9, -2.0, 0xffdcae, seg === 'wall' ? 5.5 : 2.2, 4.5, 1.4)
  point(L, 2, -95.4, 2.6, -5.2, 0xd8e2f0, seg === 'key' ? 3.5 : 1.4, 4, 1.5)
  hemi(L, 0x2c3a52, 0x0a0c10, 0.22)
  // A cold sweep across the wall from the ceiling track (wall), soft elsewhere.
  sunAt(L, { x: -101.5, y: 3.3, z: 1.5 }, { x: -105.9, y: 1.6, z: -2.0 }, 0xffe6c4, seg === 'wall' ? 1.6 : 0.5, 6)
  env(r, 'hospital_room_2', 0.16)
  r.motion.walking = 0
}
