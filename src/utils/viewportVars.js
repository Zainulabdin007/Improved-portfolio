/**
 * Writes live viewport metrics to :root so CSS can scale with the actual
 * device instead of hard-coded vw assumptions (which break on ultrawide,
 * mobile, and when scrollbars eat into 100vw).
 */
export function syncViewportVars() {
  if (typeof window === 'undefined') return

  const w = window.innerWidth
  const h = window.innerHeight
  const vmin = Math.min(w, h)
  const vmax = Math.max(w, h)
  const root = document.documentElement

  root.style.setProperty('--site-vw', `${w * 0.01}px`)
  root.style.setProperty('--site-vh', `${h * 0.01}px`)
  root.style.setProperty('--site-vmin', `${vmin * 0.01}px`)
  root.style.setProperty('--site-vmax', `${vmax * 0.01}px`)
  root.style.setProperty('--site-width', `${w}px`)
  root.style.setProperty('--site-height', `${h}px`)
}

export function initViewportVars() {
  syncViewportVars()
  window.addEventListener('resize', syncViewportVars, { passive: true })
  window.addEventListener('orientationchange', syncViewportVars, { passive: true })
  return () => {
    window.removeEventListener('resize', syncViewportVars)
    window.removeEventListener('orientationchange', syncViewportVars)
  }
}

/** Measure a container and publish hand-specific layout vars on it.
 *  Targets laptop/desktop only — same visual footprint everywhere in that range. */
export function syncHandLayoutVars(stageEl) {
  if (!stageEl) return

  const w = stageEl.clientWidth
  const h = stageEl.clientHeight
  if (w <= 0 || h <= 0) return

  /* Original design: min(38vw, 400) × min(75vh, 760), scale(3) */
  const handWidth = Math.round(Math.min(w * 0.38, 400))
  const handHeight = Math.round(Math.min(h * 0.75, 760))

  /* Always scale(3) on laptop/desktop. Only taper slightly on ultrawide
   * (21:9+) so palms don't balloon past the frame. */
  const scale = w / h > 2.15 ? 2.85 : 3

  /* Original off-screen travel: 120vw, expressed in stage pixels */
  const travel = Math.round(w * 1.2)

  const edgeLeft = Math.round(-(w * 0.04))
  const edgeRight = Math.round(-(w * 0.01))

  stageEl.style.setProperty('--hand-width', `${handWidth}px`)
  stageEl.style.setProperty('--hand-height', `${handHeight}px`)
  stageEl.style.setProperty('--hand-scale', scale.toFixed(3))
  stageEl.style.setProperty('--hand-travel', `${travel}px`)
  stageEl.style.setProperty('--hand-edge-left', `${edgeLeft}px`)
  stageEl.style.setProperty('--hand-edge-right', `${edgeRight}px`)
  stageEl.style.setProperty('--hand-y-left', '-46%')
  stageEl.style.setProperty('--hand-y-right', '-44%')
}
