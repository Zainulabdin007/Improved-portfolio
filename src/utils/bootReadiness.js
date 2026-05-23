import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** @typedef {'aurora' | 'heroGltf' | 'hflowComputer' | 'hflowDino' | 'scrollLayout'} BootGateName */

function createGate() {
  let settled = false
  /** @type {(value?: unknown) => void} */
  let resolve = () => {}
  const promise = new Promise((r) => {
    resolve = r
  })
  return {
    promise,
    isSettled: () => settled,
    markReady() {
      if (settled) return
      settled = true
      resolve()
    },
  }
}

/** @type {Record<BootGateName, ReturnType<typeof createGate>>} */
const gates = {
  aurora: createGate(),
  heroGltf: createGate(),
  hflowComputer: createGate(),
  hflowDino: createGate(),
  scrollLayout: createGate(),
}

const SCROLL_LAYOUT_SOURCES = new Set([
  'scroll-experience',
  'page-horizontal-flow',
  'page-blank',
])

let pendingScrollSources = new Set(SCROLL_LAYOUT_SOURCES)
let scrollFlushScheduled = false

function flushScrollLayout() {
  if (gates.scrollLayout.isSettled()) return

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      gates.scrollLayout.markReady()
    })
  })
}

/** Mark a runtime readiness gate (WebGL, parsed GLTF, etc.). */
export function markBootGate(name) {
  gates[name]?.markReady()
}

/**
 * Each scroll-heavy section calls this after its ScrollTriggers are created.
 * When all have reported in, we refresh measurements before unlocking scroll.
 */
export function signalScrollSetup(source) {
  if (!SCROLL_LAYOUT_SOURCES.has(source)) return
  pendingScrollSources.delete(source)
  if (pendingScrollSources.size > 0) return
  if (scrollFlushScheduled) return
  scrollFlushScheduled = true
  flushScrollLayout()
}

/**
 * Wait for boot gates, but never block longer than `timeoutMs` (slow networks).
 * @param {BootGateName[]} names
 */
export function waitForBootGates(names, timeoutMs = 22000) {
  const ready = Promise.all(names.map((name) => gates[name].promise))
  const timeout = new Promise((resolve) => {
    window.setTimeout(resolve, timeoutMs)
  })
  return Promise.race([ready, timeout])
}

/** Dev HMR — reset gates when the module reloads. */
export function resetBootReadiness() {
  Object.values(gates).forEach((gate) => gate.markReady())
  pendingScrollSources.clear()
  scrollFlushScheduled = true
}

if (import.meta.hot) {
  import.meta.hot.dispose(resetBootReadiness)
}
