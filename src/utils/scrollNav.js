import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Start of #about — card is fixed in place (no rise animation). */
const ABOUT_PROGRESS = 0
/** Past PAN2_END (0.575) once the experience strip has scrolled into view. */
const EXPERIENCE_PROGRESS = 0.62
/** End of #projects + small overscroll so smooth scroll finishes the contact pan. */
const CONTACT_PROGRESS = 1
const CONTACT_EXTRA_PX = 120

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', sectionId: 'home', progress: 0 },
  { key: 'about', label: 'About Me', sectionId: 'about', progress: ABOUT_PROGRESS },
  {
    key: 'experience',
    label: 'Experience',
    sectionId: 'about',
    progress: EXPERIENCE_PROGRESS,
  },
  { key: 'projects', label: 'Projects', sectionId: 'projects', progress: 0 },
  {
    key: 'contact',
    label: 'Contact',
    sectionId: 'projects',
    progress: CONTACT_PROGRESS,
    extraPx: CONTACT_EXTRA_PX,
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
