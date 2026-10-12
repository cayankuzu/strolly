/**
 * The room's clock: what the ceiling and the walls show, and how the room is
 * lit by them, from late afternoon through dusk and night to the pre-dawn of
 * the record and back. Each look is a full set of numbers; the director
 * blends two of them by progress.
 */
import * as THREE from 'three'
import { lerp } from '@/lib/math'
import type { ForestUniforms } from './forest'

export type SkyLook = {
  top: number
  hor: number
  /** Sun elevation and azimuth (degrees; azimuth 0 = front wall, +90 = right wall). */
  el: number
  az: number
  sun: number
  sunSize: number
  cloud: number
  cloudCol: number
  cloudShade: number
  grade: number
  bright: number
  sat: number
  stars: number
  moon: number
  dawn: number
  shaft: number
  /** Room light: HDRI intensity, hemisphere colour/intensity, the key from the bright side. */
  env: number
  hemiSky: number
  hemiGround: number
  hemi: number
  key: number
  keyCol: number
  lamp: number
}

export const LOOKS = {
  afternoon: { top: 0x5a83bf, hor: 0xf3d9b4, el: 40, az: -38, sun: 0xffd9a0, sunSize: 0.04, cloud: 0.55, cloudCol: 0xfff3e0, cloudShade: 0x9a9aa8, grade: 0xfff2dc, bright: 1.08, sat: 0.95, stars: 0, moon: 0, dawn: 0, shaft: 0.7, env: 0.45, hemiSky: 0xffe6c0, hemiGround: 0x5a4430, hemi: 0.35, key: 1.1, keyCol: 0xffd6a0, lamp: 1 },
  golden: { top: 0x5f78ad, hor: 0xffc58a, el: 31, az: -48, sun: 0xffb868, sunSize: 0.045, cloud: 0.6, cloudCol: 0xffe2b8, cloudShade: 0x8a7a88, grade: 0xffe0b8, bright: 1.0, sat: 0.95, stars: 0, moon: 0, dawn: 0, shaft: 0.85, env: 0.4, hemiSky: 0xffcf98, hemiGround: 0x4a3420, hemi: 0.32, key: 1.05, keyCol: 0xffbf80, lamp: 1 },
  sunset: { top: 0x45558a, hor: 0xff9a5c, el: 20, az: -60, sun: 0xff8a48, sunSize: 0.05, cloud: 0.65, cloudCol: 0xffa878, cloudShade: 0x6a5068, grade: 0xffc49a, bright: 0.82, sat: 0.9, stars: 0, moon: 0, dawn: 0, shaft: 0.5, env: 0.3, hemiSky: 0xffb07a, hemiGround: 0x3a2a20, hemi: 0.28, key: 0.75, keyCol: 0xff9a60, lamp: 1 },
  dusk: { top: 0x2a3762, hor: 0xb4786e, el: 4, az: -66, sun: 0xd06a50, sunSize: 0.05, cloud: 0.6, cloudCol: 0xc88a8a, cloudShade: 0x40384c, grade: 0xb89aa0, bright: 0.6, sat: 0.8, stars: 0.05, moon: 0, dawn: 0, shaft: 0, env: 0.18, hemiSky: 0x9a7a8a, hemiGround: 0x2a2228, hemi: 0.24, key: 0.3, keyCol: 0xc08a90, lamp: 1 },
  blue: { top: 0x142247, hor: 0x46557c, el: -6, az: -70, sun: 0x6a5a7a, sunSize: 0.04, cloud: 0.5, cloudCol: 0x5a6688, cloudShade: 0x1c2234, grade: 0x6c7fa4, bright: 0.45, sat: 0.65, stars: 0.3, moon: 0.4, dawn: 0, shaft: 0, env: 0.1, hemiSky: 0x5a6a9a, hemiGround: 0x1a1c24, hemi: 0.22, key: 0.15, keyCol: 0x8a9ac8, lamp: 1 },
  night: { top: 0x070c1a, hor: 0x142038, el: -20, az: -70, sun: 0x000000, sunSize: 0.04, cloud: 0.45, cloudCol: 0x2a3550, cloudShade: 0x0a0e18, grade: 0x3a5068, bright: 0.36, sat: 0.55, stars: 1, moon: 1, dawn: 0, shaft: 0, env: 0.06, hemiSky: 0x3a4a6c, hemiGround: 0x12141a, hemi: 0.2, key: 0.12, keyCol: 0x8aa0c8, lamp: 1 },
  predawn: { top: 0x0b1222, hor: 0x2a3550, el: -12, az: 80, sun: 0x000000, sunSize: 0.04, cloud: 0.35, cloudCol: 0x3a4660, cloudShade: 0x10141e, grade: 0x40567a, bright: 0.34, sat: 0.4, stars: 0.4, moon: 0.2, dawn: 1, shaft: 0, env: 0.07, hemiSky: 0x4a5a80, hemiGround: 0x101218, hemi: 0.26, key: 0.12, keyCol: 0x8a9cc8, lamp: 0 },
  dawn: { top: 0x52648c, hor: 0xf2b494, el: 8, az: 85, sun: 0xffb080, sunSize: 0.05, cloud: 0.5, cloudCol: 0xffd0b8, cloudShade: 0x6a6a80, grade: 0xd8c0b4, bright: 0.75, sat: 0.8, stars: 0, moon: 0, dawn: 0.4, shaft: 0.3, env: 0.25, hemiSky: 0xd8b8a8, hemiGround: 0x3a3028, hemi: 0.28, key: 0.5, keyCol: 0xffc0a0, lamp: 0 },
  noon: { top: 0x3f74c4, hor: 0xd6e6f4, el: 72, az: 20, sun: 0xfff6e8, sunSize: 0.035, cloud: 0.5, cloudCol: 0xffffff, cloudShade: 0xa8b0c0, grade: 0xffffff, bright: 1.12, sat: 1, stars: 0, moon: 0, dawn: 0, shaft: 0.4, env: 0.5, hemiSky: 0xf2f4f8, hemiGround: 0x5a4a38, hemi: 0.35, key: 1.2, keyCol: 0xfff4e0, lamp: 0.6 },
} satisfies Record<string, SkyLook>

export type LookName = keyof typeof LOOKS

const ca = new THREE.Color()
const cb = new THREE.Color()
const mixHex = (a: number, b: number, t: number, out: THREE.Color) => out.copy(ca.set(a)).lerp(cb.set(b), t)

/** The resolved, blended look (colours as THREE.Color). */
export class Sky {
  top = new THREE.Color()
  hor = new THREE.Color()
  sunCol = new THREE.Color()
  cloudCol = new THREE.Color()
  cloudShade = new THREE.Color()
  grade = new THREE.Color()
  hemiSky = new THREE.Color()
  hemiGround = new THREE.Color()
  keyCol = new THREE.Color()
  sunDir = new THREE.Vector3()
  el = 0
  az = 0
  sunSize = 0.04
  cloud = 0
  bright = 1
  sat = 1
  stars = 0
  moon = 0
  dawn = 0
  shaft = 0
  env = 0
  hemi = 0
  key = 0
  lamp = 1

  set(a: SkyLook, b: SkyLook, t: number) {
    mixHex(a.top, b.top, t, this.top)
    mixHex(a.hor, b.hor, t, this.hor)
    mixHex(a.sun, b.sun, t, this.sunCol)
    mixHex(a.cloudCol, b.cloudCol, t, this.cloudCol)
    mixHex(a.cloudShade, b.cloudShade, t, this.cloudShade)
    mixHex(a.grade, b.grade, t, this.grade)
    mixHex(a.hemiSky, b.hemiSky, t, this.hemiSky)
    mixHex(a.hemiGround, b.hemiGround, t, this.hemiGround)
    mixHex(a.keyCol, b.keyCol, t, this.keyCol)
    this.el = lerp(a.el, b.el, t)
    this.az = lerp(a.az, b.az, t)
    this.sunSize = lerp(a.sunSize, b.sunSize, t)
    this.cloud = lerp(a.cloud, b.cloud, t)
    this.bright = lerp(a.bright, b.bright, t)
    this.sat = lerp(a.sat, b.sat, t)
    this.stars = lerp(a.stars, b.stars, t)
    this.moon = lerp(a.moon, b.moon, t)
    this.dawn = lerp(a.dawn, b.dawn, t)
    this.shaft = lerp(a.shaft, b.shaft, t)
    this.env = lerp(a.env, b.env, t)
    this.hemi = lerp(a.hemi, b.hemi, t)
    this.key = lerp(a.key, b.key, t)
    this.lamp = lerp(a.lamp, b.lamp, t)
    const el = (this.el * Math.PI) / 180
    const az = (this.az * Math.PI) / 180
    this.sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el))
    return this
  }

  /** Writes the look into a forest material's uniforms. */
  apply(u: ForestUniforms) {
    u.uSkyTop.value.copy(this.top)
    u.uSkyHor.value.copy(this.hor)
    u.uSunDir.value.copy(this.sunDir)
    u.uSunCol.value.copy(this.sunCol).multiplyScalar(this.el > -2 ? 1 : 0)
    u.uSunSize.value = this.sunSize
    u.uCloud.value = this.cloud
    u.uCloudCol.value.copy(this.cloudCol)
    u.uCloudShade.value.copy(this.cloudShade)
    u.uGrade.value.copy(this.grade)
    u.uBright.value = this.bright
    u.uSat.value = this.sat
    u.uStars.value = this.stars
    u.uMoon.value = this.moon
    u.uDawn.value = this.dawn
    u.uShaft.value = this.shaft
  }
}
