/** Scroll progress breakpoints for #about — keep in sync with PageHorizontalFlow.jsx */

/** Brief about dwell before computer enters (lower = less dead scroll). */
export const HFLOW_ABOUT_HOLD_END = 0.02

/** End of about → computer fade/slide (from the right) + track pan. */
export const HFLOW_PAN1_END = 0.24
export const HFLOW_SPIN_END = 0.56
export const HFLOW_PAN2_END = 0.73

/** Navbar “Experience” — just into phase 3 (past the computer panel). */
export const HFLOW_EXPERIENCE_NAV_PROGRESS = HFLOW_PAN2_END + 0.05
