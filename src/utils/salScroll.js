import sal from 'sal.js'
import 'sal.js/dist/sal.css'

let salInstance = null

const DEFAULT_OPTIONS = {
  once: true,
  threshold: 0.18,
  rootMargin: '0% 8%',
}

/** Initialize Sal once; no-ops when reduced motion is preferred. */
export function initSal(options = {}) {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  salInstance = sal({ ...DEFAULT_OPTIONS, ...options })
  return salInstance
}

/** Re-scan elements (e.g. after horizontal strip moves). */
export function refreshSal() {
  salInstance?.update?.()
}

export function destroySal() {
  if (!salInstance) return
  salInstance.disable?.()
  salInstance = null
}
