import HeroHands from './HeroHands'
import HeroScene from './HeroScene'
import HeroWaveDivider from './HeroWaveDivider'
import Waves from './Waves'
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
        <div className="sphere-pin__bg" aria-hidden="true">
          <Waves
            lineColor="rgba(255, 214, 0, 0.24)"
            backgroundColor="#000000"
            waveSpeedX={0.0125}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        </div>
        <HeroScene />
        <HeroHands layoutRootClass="sphere-pin" />
      </div>
      <HeroWaveDivider placement="hero-end" />
    </section>
  )
}
