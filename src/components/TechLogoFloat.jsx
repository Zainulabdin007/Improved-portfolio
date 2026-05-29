import { useEffect, useMemo, useRef } from 'react'
import { TECH_LOGOS } from '../data/techLogos'
import { createLogoFloatMotion, logoFloatOffset } from '../utils/logoFloatMotion'
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
      <div className="tech-logo-float__tile-inner" data-logo-float>
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

/** Tech logos on page 2 — scroll fade + gentle random drift (no particles / hover). */
export default function TechLogoFloat() {
  const scatterRef = useRef(null)
  const motions = useMemo(() => TECH_LOGOS.map((_, i) => createLogoFloatMotion(i)), [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const nodes = scatterRef.current?.querySelectorAll('[data-logo-float]')
    if (!nodes?.length) return undefined

    let raf = 0
    const t0 = performance.now()

    const tick = (now) => {
      const t = (now - t0) * 0.001
      nodes.forEach((el, i) => {
        const { x, y } = logoFloatOffset(motions[i], t)
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [motions])

  const total = TECH_LOGOS.length

  return (
    <div className="tech-logo-float" aria-hidden="true">
      <ul ref={scatterRef} className="tech-logo-float__scatter">
        {TECH_LOGOS.map((logo, index) => (
          <LogoTile key={logo.name} logo={logo} index={index} total={total} />
        ))}
      </ul>
    </div>
  )
}
