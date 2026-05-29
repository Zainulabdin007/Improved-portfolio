import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ComputerScene from './ComputerScene'
import HeroHands from './HeroHands'
import HeroWaveDivider from './HeroWaveDivider'
import PatternPadBackground from './PatternPadBackground/PatternPadBackground'
import TechLogoFloat from './TechLogoFloat'
import {
  SPHERE_HANDS_SCROLL_END,
  SPHERE_LOGO_PROGRESS_END,
  SPHERE_SCROLL_SCRUB,
  SPHERE_SECTION_SCROLL_SVH,
} from '../utils/scrollConfig'
import './PageTwo.css'

gsap.registerPlugin(ScrollTrigger)

/** Tall section — computer auto-rotates; logos + hands scroll-scrubbed. */
export default function PageTwo() {
  const pinRef = useRef(null)

  useLayoutEffect(() => {
    const section = document.getElementById('page-2')
    const pin = pinRef.current
    if (!section || !pin) return

    const ctx = gsap.context(() => {
      const hands = section.querySelectorAll('.hero__hand')
      if (hands.length) {
        gsap.fromTo(
          hands,
          { '--hand-progress': 0 },
          {
            '--hand-progress': 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: SPHERE_HANDS_SCROLL_END,
              scrub: SPHERE_SCROLL_SCRUB,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: SPHERE_SCROLL_SCRUB,
        onUpdate: (self) => {
          const logoP = Math.min(1, self.progress / SPHERE_LOGO_PROGRESS_END)
          pin.style.setProperty('--logo-progress', String(logoP))
        },
      })
    }, section)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="page-2"
      className="page-section page-section--sphere"
      aria-label="Computer and tech stack"
      style={{ height: `${SPHERE_SECTION_SCROLL_SVH}svh` }}
    >
      <HeroWaveDivider placement="below" />
      <div ref={pinRef} className="sphere-pin">
        <div className="sphere-pin__bg">
          <PatternPadBackground />
        </div>
        <ComputerScene />
        <TechLogoFloat />
        <HeroHands layoutRootClass="sphere-pin" />
      </div>
      <HeroWaveDivider placement="hero-end" />
    </section>
  )
}
