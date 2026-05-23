import { useLayoutEffect, useRef, useState } from 'react'
import './HeroHints.css'

function scrollToNextSection() {
  document.getElementById('page-2')?.scrollIntoView({ behavior: 'smooth' })
}

/** Optical center of the navbar note — nudge left vs. button box center. */
const MUSIC_HINT_OFFSET_X = -1

function quadPoint(x1, y1, cx, cy, x2, y2, t) {
  const mt = 1 - t
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
  }
}

export default function HeroHints() {
  const musicLabelRef = useRef(null)
  const [musicPath, setMusicPath] = useState('')
  const [musicVisible, setMusicVisible] = useState(true)
  const [musicLabelStyle, setMusicLabelStyle] = useState(null)

  useLayoutEffect(() => {
    const home = document.getElementById('home')
    const musicBtn = document.getElementById('navbar-music')

    const update = () => {
      const label = musicLabelRef.current
      if (!home || !musicBtn || !label) return

      const homeRect = home.getBoundingClientRect()
      const onHero = homeRect.bottom > 80 && homeRect.top < window.innerHeight * 0.85
      setMusicVisible(onHero)
      if (!onHero) return

      const musicRect = musicBtn.getBoundingClientRect()
      const noteEl = musicBtn.querySelector('svg')
      const noteRect = noteEl ? noteEl.getBoundingClientRect() : musicRect
      const anchorX =
        noteRect.left + noteRect.width / 2 + MUSIC_HINT_OFFSET_X
      const gap = 24
      const labelTop = musicRect.bottom + gap

      setMusicLabelStyle({
        left: `${anchorX}px`,
        top: `${labelTop}px`,
        transform: 'translateX(-50%)',
      })

      requestAnimationFrame(() => {
        const labelRect = label.getBoundingClientRect()

        // Tail: top-center of the “Music” hint label
        const x1 = labelRect.left + labelRect.width / 2
        const y1 = labelRect.top

        // Tip target: optical center of the note icon
        const x2 = anchorX
        const y2 = noteRect.top + noteRect.height / 2

        const dy = y1 - y2
        const cx = (x1 + x2) / 2
        const cy = y2 + dy * 0.35

        // Stop short of the icon — arrow points toward the note but keeps clear space
        const arrowReach = 0.72
        const lineEnd = quadPoint(x1, y1, cx, cy, x2, y2, arrowReach)

        setMusicPath(`M ${x1} ${y1} Q ${cx} ${cy} ${lineEnd.x} ${lineEnd.y}`)
      })
    }

    const scheduleUpdate = () => {
      requestAnimationFrame(() => requestAnimationFrame(update))
    }

    update()
    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('orientationchange', scheduleUpdate)

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null
    const nav = document.querySelector('.navbar')
    if (ro) {
      if (musicBtn) ro.observe(musicBtn)
      if (nav) ro.observe(nav)
    }

    return () => {
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
      ro?.disconnect()
    }
  }, [])

  return (
    <div className="hero-hints" aria-hidden="true">
      <button
        type="button"
        className="hero-hint hero-hint--scroll"
        onClick={scrollToNextSection}
        aria-label="Scroll to next section"
      >
        <span className="hero-hint__label">Scroll</span>
        <span className="hero-hint__chevron" />
      </button>

      <svg
        className={`hero-hint__music-overlay${musicVisible ? '' : ' hero-hint__music-overlay--hidden'}`}
        aria-hidden="true"
      >
        <defs>
          <marker
            id="hero-music-arrowhead"
            viewBox="0 0 10 10"
            refX="9.2"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M 0.5 0.5 L 9 5 L 0.5 9.5"
              fill="none"
              stroke="rgba(245, 245, 247, 0.92)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        {musicPath ? (
          <path
            d={musicPath}
            className="hero-hint__music-path"
            markerEnd="url(#hero-music-arrowhead)"
          />
        ) : null}
      </svg>

      <span
        ref={musicLabelRef}
        className={`hero-hint hero-hint--music${musicVisible ? '' : ' hero-hint--music--hidden'}`}
        style={musicLabelStyle ?? undefined}
      >
        <span className="hero-hint__label">Music</span>
      </span>
    </div>
  )
}
