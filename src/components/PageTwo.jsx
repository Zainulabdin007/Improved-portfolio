import HeroHands from './HeroHands'
import HeroScene from './HeroScene'
import HeroWaveDivider from './HeroWaveDivider'
import RippleGrid from './RippleGrid/RippleGrid'
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
          <RippleGrid
            enableRainbow={false}
            gridColor="#5227FF"
            rippleIntensity={0.01}
            gridSize={13}
            gridThickness={41}
            mouseInteraction={false}
            mouseInteractionRadius={0.2}
            opacity={0.55}
            fadeDistance={1.5}
            vignetteStrength={1.5}
            glowIntensity={1}
            gridRotation={0}
          />
        </div>
        <HeroScene />
        <HeroHands layoutRootClass="sphere-pin" />
      </div>
      <HeroWaveDivider placement="hero-end" />
    </section>
  )
}
