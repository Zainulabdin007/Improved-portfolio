import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * Global ScrollTrigger tuning. The higher `syncInterval` (defaults to 17ms)
 * stays in step with the browser's 60fps render. `ignoreMobileResize`
 * stops ScrollTrigger from re-measuring every time iOS hides/shows the
 * URL bar, which used to cause stutters near section boundaries.
 */
ScrollTrigger.config({ ignoreMobileResize: true })

/* Smoothed scrub feel — higher values = more lerp delay = silkier */
const SMOOTH_SCRUB = 1.1

export default function ScrollExperience({ children }) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const hero = document.querySelector('#home')
      if (hero) {
        gsap.to(hero, {
          opacity: 0.92,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: SMOOTH_SCRUB,
          },
        })
      }

      // Page 2: scrub hands in from off-screen as the sphere is pinned.
      // End extended to 130% so the hands take longer to glide in, which
      // dramatically smooths the motion under the new heavier scrub.
      const sphereSection = document.querySelector('#page-2')
      const hands = document.querySelectorAll('#page-2 .hero__hand')
      if (sphereSection && hands.length) {
        gsap.fromTo(
          hands,
          { '--hand-progress': 0 },
          {
            '--hand-progress': 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sphereSection,
              start: 'top top',
              end: '+=130%',
              scrub: SMOOTH_SCRUB,
            },
          },
        )
      }
    })

    const onRefresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onRefresh)
    window.addEventListener('orientationchange', onRefresh)

    return () => {
      window.removeEventListener('resize', onRefresh)
      window.removeEventListener('orientationchange', onRefresh)
      ctx.revert()
    }
  }, [])

  return children
}
