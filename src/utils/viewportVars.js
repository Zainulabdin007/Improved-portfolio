import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Design reference resolution — layout tuned for this size. */
export const REF_WIDTH = 1920
export const REF_HEIGHT = 1080

const SCALE_MIN = 0.68
const SCALE_MAX = 1.18

const scaleListeners = new Set()

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

/**
 * Uniform scale vs 1920×1080. Uses the smaller of width/height ratio so
 * the layout always fits the viewport and keeps the same proportions.
 */
export function getUiScale(
  w = typeof window !== 'undefined' ? window.innerWidth : REF_WIDTH,
  h = typeof window !== 'undefined' ? window.innerHeight : REF_HEIGHT,
) {
  if (w <= 0 || h <= 0) return 1
  return clamp(Math.min(w / REF_WIDTH, h / REF_HEIGHT), SCALE_MIN, SCALE_MAX)
}

/** Read the live --ui-scale from :root (after syncViewportVars). */
export function readUiScale() {
  if (typeof document === 'undefined') return 1
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    '--ui-scale',
  )
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 1
}

/** Subscribe to scale changes (resize / orientation). Returns unsubscribe. */
export function onViewportScaleChange(fn) {
  scaleListeners.add(fn)
  return () => scaleListeners.delete(fn)
}

function notifyScaleListeners() {
  scaleListeners.forEach((fn) => fn())
}

/**
 * Publishes global CSS variables derived from the current viewport.
 * Everything sized for 1920×1080 should use calc(REFpx * var(--ui-scale)).
 */
export function syncViewportVars() {
  if (typeof window === 'undefined') return

  const w = window.innerWidth
  const h = window.innerHeight
  const vmin = Math.min(w, h)
  const vmax = Math.max(w, h)
  const ui = getUiScale(w, h)
  const root = document.documentElement

  root.style.setProperty('--ui-scale', ui.toFixed(4))
  root.style.setProperty('--site-vw', `${w * 0.01}px`)
  root.style.setProperty('--site-vh', `${h * 0.01}px`)
  root.style.setProperty('--site-vmin', `${vmin * 0.01}px`)
  root.style.setProperty('--site-vmax', `${vmax * 0.01}px`)
  root.style.setProperty('--site-width', `${w}px`)
  root.style.setProperty('--site-height', `${h}px`)

  /* Reference design tokens × ui-scale (use in calc across CSS) */
  root.style.setProperty('--ref-hand-w', `${400 * ui}px`)
  root.style.setProperty('--ref-hand-h', `${760 * ui}px`)
  root.style.setProperty('--ref-hand-mult', '3')
  root.style.setProperty('--ref-grid-w', `${1400 * ui}px`)
  root.style.setProperty('--ref-grid-h', `${780 * ui}px`)
  root.style.setProperty('--ref-card-w', `${1280 * ui}px`)
  root.style.setProperty('--ref-nav-h', `${56 * ui}px`)
}

export function initViewportVars() {
  let lastScale = -1

  const run = () => {
    const next = getUiScale()
    syncViewportVars()
    document.querySelectorAll('.hero__stage').forEach(syncHandLayoutVars)

    if (Math.abs(next - lastScale) > 0.001) {
      lastScale = next
      notifyScaleListeners()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }

  run()
  window.addEventListener('resize', run, { passive: true })
  window.addEventListener('orientationchange', run, { passive: true })

  return () => {
    window.removeEventListener('resize', run)
    window.removeEventListener('orientationchange', run)
    scaleListeners.clear()
  }
}

/** Hand layout on the sphere stage — reference 1920×1080 sizing × ui-scale. */
export function syncHandLayoutVars(stageEl) {
  if (!stageEl) return

  const w = stageEl.clientWidth
  const h = stageEl.clientHeight
  if (w <= 0 || h <= 0) return

  const ui = getUiScale(w, h)

  const handWidth = Math.round(400 * ui)
  const handHeight = Math.round(760 * ui)
  const handMult = 3
  const travel = Math.round(REF_WIDTH * 1.2 * ui)

  stageEl.style.setProperty('--ui-scale', ui.toFixed(4))
  stageEl.style.setProperty('--hand-width', `${handWidth}px`)
  stageEl.style.setProperty('--hand-height', `${handHeight}px`)
  stageEl.style.setProperty('--hand-scale', String(handMult))
  stageEl.style.setProperty('--hand-travel', `${travel}px`)
  stageEl.style.setProperty('--hand-edge-left', `${Math.round(-REF_WIDTH * 0.04 * ui)}px`)
  stageEl.style.setProperty('--hand-edge-right', `${Math.round(-REF_WIDTH * 0.01 * ui)}px`)
  stageEl.style.setProperty('--hand-y-left', '-46%')
  stageEl.style.setProperty('--hand-y-right', '-44%')
}
