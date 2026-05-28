import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Design reference resolution — layout tuned for this size. */
export const REF_WIDTH = 1920
export const REF_HEIGHT = 1080

const SCALE_MIN = 0.68
const SCALE_MAX = 1.18

/** Hero hand layout @ 1920×1080 (before --ui-scale). Tune these to resize hands. */
export const HAND_REF_W = 436
export const HAND_REF_H = 827
export const HAND_SCALE = 3.17

const scaleListeners = new Set()

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

/** Layout viewport in CSS px (tracks resolution + browser zoom). */
export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: REF_WIDTH, height: REF_HEIGHT }
  }
  const vv = window.visualViewport
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
  }
}

/**
 * Uniform scale vs 1920×1080.
 * - Wider than 16:9: limited by height (short viewports shrink).
 * - Taller than 16:9: limited by width but not upscaled past 1080p fit, so
 *   e.g. 1920×1200 matches 1920×1080 instead of growing with extra height.
 */
export function getUiScale(w, h) {
  const size =
    w == null || h == null ? getViewportSize() : { width: w, height: h }
  const width = size.width
  const height = size.height
  if (width <= 0 || height <= 0) return 1

  const scaleW = width / REF_WIDTH
  const scaleH = height / REF_HEIGHT
  const refAspect = REF_WIDTH / REF_HEIGHT
  const vpAspect = width / height

  const ui =
    vpAspect >= refAspect
      ? Math.min(scaleW, scaleH)
      : Math.min(scaleW, 1)

  return clamp(ui, SCALE_MIN, SCALE_MAX)
}

/**
 * Pull the camera back when the stage is taller than 16:9 so the model matches
 * 1920×1080 framing (vertical FOV is fixed; extra height shrinks horizontal FOV).
 */
export function getTallViewportCameraFactor(w, h) {
  if (w <= 0 || h <= 0) return 1
  const aspect = w / h
  const refAspect = REF_WIDTH / REF_HEIGHT
  if (aspect >= refAspect) return 1
  return refAspect / aspect
}

/** Scale for a pinned stage / canvas host (uses its box, not the full window). */
export function getUiScaleForElement(el) {
  if (!el) return getUiScale()
  const w = el.clientWidth
  const h = el.clientHeight
  if (w <= 0 || h <= 0) return getUiScale()
  return getUiScale(w, h)
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

  const { width: w, height: h } = getViewportSize()
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
  root.style.setProperty('--ref-hand-w', `${HAND_REF_W * ui}px`)
  root.style.setProperty('--ref-hand-h', `${HAND_REF_H * ui}px`)
  root.style.setProperty('--ref-hand-mult', String(HAND_SCALE))
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
    document
      .querySelectorAll('.hero__stage, .sphere-pin')
      .forEach(syncHandLayoutVars)

    if (Math.abs(next - lastScale) > 0.001) {
      lastScale = next
      notifyScaleListeners()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }

  run()
  window.addEventListener('resize', run, { passive: true })
  window.addEventListener('orientationchange', run, { passive: true })

  const vv = window.visualViewport
  if (vv) {
    vv.addEventListener('resize', run, { passive: true })
    vv.addEventListener('scroll', run, { passive: true })
  }

  return () => {
    window.removeEventListener('resize', run)
    window.removeEventListener('orientationchange', run)
    if (vv) {
      vv.removeEventListener('resize', run)
      vv.removeEventListener('scroll', run)
    }
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

  const handWidth = Math.round(HAND_REF_W * ui)
  const handHeight = Math.round(HAND_REF_H * ui)
  const travel = Math.round(REF_WIDTH * 1.2 * ui)

  stageEl.style.setProperty('--ui-scale', ui.toFixed(4))
  stageEl.style.setProperty('--watcard-ui-scale', ui.toFixed(4))
  stageEl.style.setProperty('--hand-width', `${handWidth}px`)
  stageEl.style.setProperty('--hand-height', `${handHeight}px`)
  stageEl.style.setProperty('--hand-scale', String(HAND_SCALE))
  stageEl.style.setProperty('--hand-travel', `${travel}px`)
  stageEl.style.setProperty('--hand-edge-left', `${Math.round(-REF_WIDTH * 0.04 * ui)}px`)
  stageEl.style.setProperty('--hand-edge-right', `${Math.round(-REF_WIDTH * 0.01 * ui)}px`)
  stageEl.style.setProperty('--hand-y-left', '-46%')
  stageEl.style.setProperty('--hand-y-right', '-44%')
}
