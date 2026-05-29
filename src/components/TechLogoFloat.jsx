import { TECH_LOGOS } from '../data/techLogos'
import './TechLogoFloat.css'

/** Stagger thresholds so the last logo is fully in before logo-progress hits 1. */
function thresholdForIndex(index, total) {
  if (total <= 1) return 0.5
  const t = index / (total - 1)
  return 0.06 + t * 0.82
}

function LogoTile({ logo, index, total }) {
  const Icon = logo.Icon
  return (
    <li
      className="tech-logo-float__tile"
      aria-label={logo.name}
      style={{
        left: `${logo.x}%`,
        top: `${logo.y}%`,
        '--threshold': thresholdForIndex(index, total),
      }}
    >
      <div className="tech-logo-float__tile-inner">
        {Icon ? (
          <Icon className="tech-logo-float__icon" aria-hidden="true" focusable="false" />
        ) : (
          <img src={logo.src} alt="" className="tech-logo-float__img" loading="eager" />
        )}
        <span className="tech-logo-float__label">{logo.name}</span>
      </div>
    </li>
  )
}

/** Tech logos on page 2 — Sal-style fade, scroll-scrubbed via --logo-progress. */
export default function TechLogoFloat() {
  const total = TECH_LOGOS.length

  return (
    <div className="tech-logo-float" aria-hidden="true">
      <ul className="tech-logo-float__scatter">
        {TECH_LOGOS.map((logo, index) => (
          <LogoTile key={logo.name} logo={logo} index={index} total={total} />
        ))}
      </ul>
    </div>
  )
}
