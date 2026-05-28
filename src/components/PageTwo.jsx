import HeroHands from './HeroHands'
import HeroScene from './HeroScene'
import HeroWaveDivider from './HeroWaveDivider'
import PatternPadBackground from './PatternPadBackground/PatternPadBackground'
import './PageTwo.css'

/**
 * Tall section with the sphere/hands sticky-pinned for the duration of page 2.
 * Hands scrub in from off-screen via GSAP (see ScrollExperience).
 */
export default function PageTwo() {
  return (
    <section id="page-2" className="page-section page-section--sphere" aria-label="WATCARD scene">
      <HeroWaveDivider placement="below" />
      <div className="sphere-pin">
        <div className="sphere-pin__bg">
          <PatternPadBackground />
        </div>
        <HeroScene />
        <HeroHands layoutRootClass="sphere-pin" />
      </div>
      <HeroWaveDivider placement="hero-end" />
    </section>
  )
}
