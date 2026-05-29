/** Scroll progress breakpoints for #about — keep in sync with PageHorizontalFlow.jsx */

/** Short dwell on about when entering from #page-2 (keep small to avoid dead scroll). */
export const HFLOW_ABOUT_HOLD_END = 0.04

/** End of pan about → projects. */
export const HFLOW_PAN_TO_PROJECTS_END = 0.24

/** End of vertical projects scroll (still on panel 2). */
export const HFLOW_PROJECTS_SCROLL_END = 0.46

/** End of pan projects → experience (panel 3). */
export const HFLOW_PAN_TO_EXP_END = 0.64

/** End of experience strip scroll; contact pan begins immediately (no dwell). */
export const HFLOW_EXP_STRIP_END = 0.78

/** End of pan experience → contact (0.78–1.0 = slow continuous pan, no dead scroll). */
export const HFLOW_PAN_TO_CONTACT_END = 1

/** Navbar targets */
export const HFLOW_PROJECTS_NAV_PROGRESS =
  (HFLOW_PAN_TO_PROJECTS_END + HFLOW_PROJECTS_SCROLL_END) / 2

export const HFLOW_EXPERIENCE_NAV_PROGRESS =
  (HFLOW_PAN_TO_EXP_END + HFLOW_EXP_STRIP_END) / 2

export const HFLOW_CONTACT_NAV_PROGRESS =
  (HFLOW_EXP_STRIP_END + HFLOW_PAN_TO_CONTACT_END) / 2
