/**
 * GSAP ScrollTrigger scrub — higher values lag behind the wheel for smoother motion.
 */
export const SCROLL_SCRUB = 1.55

/** About / computer / experience horizontal-flow + projects/contact pans. */
export const SCROLL_SCRUB_HFLOW = 2.1

/**
 * #page-2 height (svh) — keep PageTwo.css height in sync.
 * Extra runway after hands finish eases sphere → about without rushing the hand scrub.
 */
export const SPHERE_SECTION_SCROLL_SVH = 385

/** Hand scrub end — finishes while section is still pinned (see SPHERE_SECTION_SCROLL_SVH). */
export const SPHERE_HANDS_SCROLL_END = '+=115%'
