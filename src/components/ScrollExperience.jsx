import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
            scrub: 0.5,
          },
        })
      }

      // Page 2: scrub hands in from off-screen as the sphere is pinned
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
              end: '+=100%',
              scrub: 0.5,
            },
          },
        )
      }
    })

    const onRefresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onRefresh)

    return () => {
      window.removeEventListener('resize', onRefresh)
      ctx.revert()
    }
  }, [])

  return children
}
