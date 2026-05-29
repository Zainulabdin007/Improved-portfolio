import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HFLOW_CONTACT_NAV_PROGRESS,
  HFLOW_EXPERIENCE_NAV_PROGRESS,
  HFLOW_PROJECTS_NAV_PROGRESS,
} from './hflowScrollPhases'

/** Force window scroll (and URL hash) back to the hero on a fresh visit. */
export function resetScrollToTop({ clearHash = true } = {}) {
  if (typeof window === 'undefined') return

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  if (clearHash && window.location.hash) {
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      /* ignore restricted environments */
    }
  }

  ScrollTrigger.update()
  requestAnimationFrame(() => {
    ScrollTrigger.refresh(true)
    ScrollTrigger.update()
  })
}

/** Reset scrub-driven transforms to their scroll-zero defaults. */
export function resetScrollDrivenStyles() {
  if (typeof document === 'undefined') return

  const hflowTrack = document.querySelector('.hflow-track')
  if (hflowTrack) hflowTrack.style.transform = 'translate3d(0, 0, 0)'

  const expStrip = document.querySelector('.hflow-experience-strip')
  if (expStrip) expStrip.style.transform = 'translate3d(0px, 0, 0)'

  const spherePin = document.querySelector('.sphere-pin')
  if (spherePin) spherePin.style.setProperty('--logo-progress', '0')

  document.querySelectorAll('#page-2 .hero__hand').forEach((hand) => {
    hand.style.setProperty('--hand-progress', '0')
  })

  const projectsShell = document.querySelector(
    '.hflow-panel--projects .projects-shell',
  )
  if (projectsShell) projectsShell.style.transform = 'translate3d(0, 0, 0)'

  const hero = document.querySelector('#home')
  if (hero) hero.style.opacity = ''
}

/** Nav scroll targets within unified #about horizontal flow. */
const ABOUT_PROGRESS = 0

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', sectionId: 'home', progress: 0 },
  { key: 'about', label: 'About Me', sectionId: 'about', progress: ABOUT_PROGRESS },
  {
    key: 'projects',
    label: 'Projects',
    sectionId: 'about',
    progress: HFLOW_PROJECTS_NAV_PROGRESS,
  },
  {
    key: 'experience',
    label: 'Experience',
    sectionId: 'about',
    progress: HFLOW_EXPERIENCE_NAV_PROGRESS,
  },
  {
    key: 'contact',
    label: 'Contact',
    sectionId: 'about',
    progress: HFLOW_CONTACT_NAV_PROGRESS,
  },
]

function findSectionScrollTrigger(el) {
  const matches = ScrollTrigger.getAll().filter((t) => t.trigger === el)
  if (!matches.length) return null
  return matches.reduce((best, t) =>
    t.end - t.start > best.end - best.start ? t : best,
  )
}

function resolveScrollY(sectionId, progress = 0, extraPx = 0) {
  const el = document.getElementById(sectionId)
  if (!el) return null

  const trigger = findSectionScrollTrigger(el)
  if (trigger) {
    return (
      trigger.start +
      (trigger.end - trigger.start) * progress +
      extraPx
    )
  }

  return el.getBoundingClientRect().top + window.scrollY + extraPx
}

export function scrollToNavItem(item, behavior = 'smooth') {
  const y = resolveScrollY(
    item.sectionId,
    item.progress ?? 0,
    item.extraPx ?? 0,
  )
  if (y == null) return

  window.scrollTo({ top: Math.max(0, y), behavior })

  try {
    history.replaceState(null, '', `#${item.key}`)
  } catch {
    /* ignore restricted environments */
  }
}

export function initNavFromHash() {
  const hash = window.location.hash.slice(1)
  if (!hash) return

  const item = NAV_ITEMS.find((n) => n.key === hash)
  if (!item) return

  requestAnimationFrame(() => {
    scrollToNavItem(item, 'instant')
    ScrollTrigger.refresh()
  })
}
