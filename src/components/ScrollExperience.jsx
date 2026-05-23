import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCROLL_SCRUB } from '../utils/scrollConfig'

gsap.registerPlugin(ScrollTrigger)

/*
 * Global ScrollTrigger tuning. The higher `syncInterval` (defaults to 17ms)
 * stays in step with the browser's 60fps render. `ignoreMobileResize`
 * stops ScrollTrigger from re-measuring every time iOS hides/shows the
 * URL bar, which used to cause stutters near section boundaries.
 */
ScrollTrigger.config({ ignoreMobileResize: true })

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
            scrub: SCROLL_SCRUB,
          },
        })
      }

      // Page 2: scrub hands in from off-screen as the sphere is pinned.
      // Extended runway so hands glide in slowly across the page-2 transition.
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
              end: '+=165%',
              scrub: SCROLL_SCRUB,
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
