/** Lens helpers shared by every story's camera. */

const SAFE_ASPECT = 1.05

/** Vertical fov for `aspect` that keeps a 16:9-authored composition readable. */
export function fitFov(fov16: number, aspect: number) {
  const t = Math.tan((fov16 * Math.PI) / 360)
  const needW = t * Math.min(16 / 9, Math.max(aspect, SAFE_ASPECT))
  return (Math.atan(Math.max(t, needW / aspect)) * 360) / Math.PI
}
