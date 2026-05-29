import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { signalScrollSetup } from '../utils/bootReadiness'
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

      /* Hand scrub for #page-2 lives in PageTwo.jsx (same trigger as computer spin). */
    })

    signalScrollSetup('scroll-experience')

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
