/**
 * GSAP ScrollTrigger scrub — higher values lag behind the wheel for smoother motion.
 */
export const SCROLL_SCRUB = 1.55

/** About / computer / experience horizontal-flow + projects/contact pans. */
export const SCROLL_SCRUB_HFLOW = 3.6

/** Extra pin height multiplier for #about — more scroll = slower panel transitions. */
export const HFLOW_SECTION_PIN_MULT = 5

/**
 * #page-2 height (svh) — applied on PageTwo section (see PageTwo.css fallback).
 * ~100svh pin + hand scrub + longer tail before #about for a slower handoff.
 */
export const SPHERE_SECTION_SCROLL_SVH = 380

/** Extra scrub lag on #page-2 (hands, logos) — smoother exit into #about. */
export const SPHERE_SCROLL_SCRUB = 2.35

/** Hand scrub end — finishes while section is still pinned (see SPHERE_SECTION_SCROLL_SVH). */
export const SPHERE_HANDS_SCROLL_END = '+=118%'

/**
 * Section scroll fraction (0–1) when all logos have faded in.
 * Remaining scroll is dwell time before #about (logo-progress stays at 1).
 */
export const SPHERE_LOGO_PROGRESS_END = 0.83
