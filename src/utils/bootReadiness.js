import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { runBootPreload } from './bootPreload'
import { resetScrollDrivenStyles, resetScrollToTop } from './scrollNav'

/** @typedef {'aurora' | 'heroGltf' | 'hflowComputer' | 'hflowDino' | 'gradientBlinds' | 'projectsLayout' | 'scrollLayout'} BootGateName */

function createGate() {
  let settled = false
  /** @type {(value?: unknown) => void} */
  let resolve = () => {}
  let promise = new Promise((r) => {
    resolve = r
  })

  const gate = {
    get promise() {
      return promise
    },
    isSettled: () => settled,
    markReady() {
      if (settled) return
      settled = true
      resolve()
    },
    reset() {
      settled = false
      promise = new Promise((r) => {
        resolve = r
      })
    },
  }

  return gate
}

/** @type {Record<BootGateName, ReturnType<typeof createGate>>} */
const gates = {
  aurora: createGate(),
  heroGltf: createGate(),
  hflowComputer: createGate(),
  hflowDino: createGate(),
  gradientBlinds: createGate(),
  projectsLayout: createGate(),
  scrollLayout: createGate(),
}

const SCROLL_LAYOUT_SOURCES = new Set([
  'scroll-experience',
  'page-horizontal-flow',
  'page-blank',
])

let pendingScrollSources = new Set(SCROLL_LAYOUT_SOURCES)
let scrollFlushScheduled = false

function waitFrames(count) {
  return new Promise((resolve) => {
    let n = 0
    const step = () => {
      n += 1
      if (n >= count) resolve()
      else requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

function syncScrollTriggersToViewport() {
  resetScrollToTop({ clearHash: true })
  resetScrollDrivenStyles()
  ScrollTrigger.update()
  ScrollTrigger.refresh(true)
}

function flushScrollLayout() {
  if (gates.scrollLayout.isSettled()) return

  requestAnimationFrame(() => {
    syncScrollTriggersToViewport()
    requestAnimationFrame(() => {
      syncScrollTriggersToViewport()
      gates.scrollLayout.markReady()
    })
  })
}

/** Mark a runtime readiness gate (WebGL, parsed GLTF, etc.). */
export function markBootGate(name) {
  gates[name]?.markReady()
}

export function signalScrollSetup(source) {
  if (!SCROLL_LAYOUT_SOURCES.has(source)) return
  pendingScrollSources.delete(source)
  if (pendingScrollSources.size > 0) return
  if (scrollFlushScheduled) return
  scrollFlushScheduled = true
  flushScrollLayout()
}

export function waitForBootGates(names, timeoutMs = 45000) {
  const ready = Promise.all(names.map((name) => gates[name]?.promise))
  const timeout = new Promise((resolve) => {
    window.setTimeout(resolve, timeoutMs)
  })
  return Promise.race([ready, timeout])
}

function isElementVisible(el) {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) return false
  const style = window.getComputedStyle(el)
  return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0'
}

function waitForHeroReady(timeoutMs = 12000) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs

    const tick = () => {
      const home = document.getElementById('home')
      const auroraCanvas = document.querySelector('#home .aurora-container canvas')
      const heroTitle = document.querySelector('#home .hero-aurora__name')
      const scrollOk = window.scrollY <= 2
      const homeTop =
        home?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const homeInPlace = homeTop >= -4 && homeTop <= 4
      const canvasReady =
        auroraCanvas &&
        auroraCanvas.width > 16 &&
        auroraCanvas.height > 16 &&
        isElementVisible(auroraCanvas)

      if (
        scrollOk &&
        homeInPlace &&
        canvasReady &&
        isElementVisible(heroTitle) &&
        gates.aurora.isSettled()
      ) {
        resolve()
        return
      }
      if (Date.now() >= deadline) {
        resolve()
        return
      }
      requestAnimationFrame(tick)
    }

    tick()
  })
}

/**
 * After scroll sync — wait until the hero is actually painted (not just mounted).
 * Call while the opaque loader still covers the page.
 */
export async function waitForSitePainted() {
  syncScrollTriggersToViewport()
  window.dispatchEvent(new Event('resize'))

  for (let pass = 0; pass < 6; pass += 1) {
    await waitFrames(2)
    syncScrollTriggersToViewport()
  }

  await waitForHeroReady(15000)
  await waitFrames(4)
  syncScrollTriggersToViewport()
}

const BOOT_GATE_NAMES = [
  'aurora',
  'heroGltf',
  'hflowComputer',
  'hflowDino',
  'gradientBlinds',
  'projectsLayout',
  'scrollLayout',
]

/**
 * Run after assets mount: lock scroll at the hero, sync scrub state, then paint.
 * Called while the loading overlay still covers the page.
 */
export async function finalizeSiteBoot() {
  syncScrollTriggersToViewport()

  await Promise.all([
    runBootPreload(),
    waitForBootGates(BOOT_GATE_NAMES),
  ])

  for (let pass = 0; pass < 4; pass += 1) {
    syncScrollTriggersToViewport()
    await waitFrames(2)
  }

  await waitForHeroReady()
  syncScrollTriggersToViewport()
}

function resetAllGates() {
  Object.values(gates).forEach((gate) => gate.reset())
  pendingScrollSources = new Set(SCROLL_LAYOUT_SOURCES)
  scrollFlushScheduled = false
}

if (import.meta.hot) {
  import.meta.hot.dispose(resetAllGates)
}
