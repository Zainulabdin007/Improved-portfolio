/**
 * GSAP ScrollTrigger scrub — higher values lag behind the wheel for smoother motion.
 */
export const SCROLL_SCRUB = 1.55

/** About / computer / experience horizontal-flow + projects/contact pans. */
export const SCROLL_SCRUB_HFLOW = 2.1

/**
 * #page-2 height (svh) — keep PageTwo.css height in sync.
 * ~100svh pin + hand scrub + short tail before #about (avoid dead scroll).
 */
export const SPHERE_SECTION_SCROLL_SVH = 270

/** Hand scrub end — finishes while section is still pinned (see SPHERE_SECTION_SCROLL_SVH). */
export const SPHERE_HANDS_SCROLL_END = '+=112%'
