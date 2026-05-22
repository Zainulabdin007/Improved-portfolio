import { useEffect, useState } from 'react'
import './LoadingScreen.css'

const BOOT_LINES = [
  { kind: 'header', label: 'SYSTEM BOOT v1.0.0' },
  { kind: 'pending', label: 'Initializing render pipeline ...' },
  { kind: 'task', label: 'Loading geometry buffers', dots: '............', status: 'OK' },
  { kind: 'task', label: 'Decompressing Draco meshes', dots: '..........', status: 'OK' },
  { kind: 'task', label: 'Mounting aurora shaders', dots: '............', status: 'OK' },
  { kind: 'task', label: 'Resolving typefaces', dots: '.................', status: 'OK' },
  { kind: 'task', label: 'Calibrating waves', dots: '...................', status: 'OK' },
  { kind: 'final', label: 'All systems online.' },
]

const LINE_DELAY_MS = 160
const FADE_MS = 600
const MIN_VISIBLE_MS = BOOT_LINES.length * LINE_DELAY_MS + 700

/** Phones / small touch viewports — show opt-in before entering the site. */
function isMobileExperience() {
  if (typeof window === 'undefined') return false
  const narrow = window.matchMedia('(max-width: 768px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return narrow || (coarse && window.innerWidth < 900)
}

function TopographicCard() {
  return (
    <div className="loading-screen__map" aria-hidden="true">
      <svg viewBox="0 0 240 280" className="loading-screen__map-svg">
        <g fill="none" stroke="rgba(245, 245, 247, 0.55)" strokeWidth="0.6">
          <path
            d="M30,140 C30,80 80,30 130,30 C190,30 220,90 220,140 C220,200 180,250 130,250 C70,250 30,200 30,140 Z"
            opacity="0.28"
          />
          <path
            d="M48,140 C48,90 88,50 130,50 C185,50 205,98 205,140 C205,195 175,230 130,230 C80,230 48,195 48,140 Z"
            opacity="0.36"
          />
          <path
            d="M65,138 C65,100 95,68 132,68 C175,68 190,108 190,138 C190,182 170,212 132,212 C92,212 65,182 65,138 Z"
            opacity="0.44"
          />
          <path
            d="M82,140 C82,110 105,86 132,86 C168,86 178,114 178,140 C178,170 158,198 132,198 C103,198 82,170 82,140 Z"
            opacity="0.52"
          />
          <path
            d="M100,140 C100,122 116,108 132,108 C155,108 165,124 165,140 C165,158 152,178 132,178 C115,178 100,158 100,140 Z"
            opacity="0.62"
          />
          <path
            d="M115,138 C115,128 122,120 132,120 C145,120 152,128 152,138 C152,150 145,160 132,160 C120,160 115,150 115,138 Z"
            opacity="0.78"
          />
        </g>

        <g stroke="rgba(245, 245, 247, 0.16)" strokeWidth="0.3" strokeDasharray="2,3">
          <line x1="0" y1="140" x2="240" y2="140" />
          <line x1="132" y1="0" x2="132" y2="280" />
        </g>

        <g className="loading-screen__map-ticks">
          <text x="10" y="14">43.46° N</text>
          <text x="180" y="14">80.52° W</text>
          <text x="10" y="272">ONTARIO · CA</text>
          <text x="160" y="272">ELEV 334 m</text>
        </g>
      </svg>

      <div className="loading-screen__map-overlay">
        <p className="loading-screen__map-kicker">YOU ARE HERE</p>
        <h2 className="loading-screen__map-title">Waterloo</h2>
        <p className="loading-screen__map-meta">Canada · Ontario</p>
      </div>
    </div>
  )
}

function MobileWarningPrompt({ onContinue, onDecline }) {
  return (
    <div
      className="loading-screen__mobile-prompt"
      role="dialog"
      aria-labelledby="mobile-warning-title"
      aria-describedby="mobile-warning-desc"
    >
      <p className="loading-screen__mobile-kicker">Viewport advisory</p>
      <h2 id="mobile-warning-title" className="loading-screen__mobile-title">
        Mobile device detected
      </h2>
      <p id="mobile-warning-desc" className="loading-screen__mobile-desc">
        This portfolio is built for scroll-driven 3D scenes and wide layouts.
        It will run on your phone, but animations may feel slower and some panels
        are easier to explore on a laptop or desktop.
      </p>
      <p className="loading-screen__mobile-question">
        Are you sure you want to continue and load the full experience?
      </p>
      <div className="loading-screen__mobile-actions">
        <button
          type="button"
          className="loading-screen__btn loading-screen__btn--primary"
          onClick={onContinue}
        >
          Yes, continue
        </button>
        <button
          type="button"
          className="loading-screen__btn loading-screen__btn--ghost"
          onClick={onDecline}
        >
          Not now
        </button>
      </div>
    </div>
  )
}

function MobileDeclinedPanel({ onContinueAnyway }) {
  return (
    <div className="loading-screen__mobile-declined" role="status">
      <p className="loading-screen__mobile-kicker">Standing by</p>
      <h2 className="loading-screen__mobile-title">Best on a larger screen</h2>
      <p className="loading-screen__mobile-desc">
        No worries — open this site on a laptop or desktop when you can for the
        full scroll experience. You can still load it here if you need to.
      </p>
      <button
        type="button"
        className="loading-screen__btn loading-screen__btn--link"
        onClick={onContinueAnyway}
      >
        Load on this device anyway
      </button>
    </div>
  )
}

/** Boot-style loading overlay shown until fonts + window assets are ready. */
export default function LoadingScreen({ onDone }) {
  const [done, setDone] = useState(false)
  /* boot → prompt (mobile only) → declined | exiting */
  const [phase, setPhase] = useState('boot')

  useEffect(() => {
    const fonts =
      typeof document !== 'undefined' && document.fonts
        ? document.fonts.ready
        : Promise.resolve()

    const winLoad =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) =>
            window.addEventListener('load', resolve, { once: true }),
          )

    const minTime = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS))

    let cancelled = false
    let exitTimer

    const enterSite = () => {
      if (cancelled) return
      setPhase('exiting')
      setDone(true)
      exitTimer = window.setTimeout(() => {
        if (!cancelled) onDone?.()
      }, FADE_MS)
    }

    Promise.all([fonts, winLoad, minTime]).then(() => {
      if (cancelled) return
      if (isMobileExperience()) {
        setPhase('prompt')
      } else {
        enterSite()
      }
    })

    document.body.style.overflow = 'hidden'

    return () => {
      cancelled = true
      if (exitTimer) window.clearTimeout(exitTimer)
      document.body.style.overflow = ''
    }
  }, [onDone])

  const handleContinue = () => {
    setPhase('exiting')
    setDone(true)
    window.setTimeout(() => onDone?.(), FADE_MS)
  }

  const showBoot = phase === 'boot'
  const showPrompt = phase === 'prompt'
  const showDeclined = phase === 'declined'

  return (
    <div
      className={`loading-screen${done ? ' is-done' : ''}${showPrompt || showDeclined ? ' is-mobile-gate' : ''}`}
      aria-hidden={done}
    >
      <div className="loading-screen__scanlines" aria-hidden="true" />

      <div className="loading-screen__inner">
        {showBoot && (
          <>
            <div className="loading-screen__terminal" role="status" aria-live="polite">
              {BOOT_LINES.map((line, i) => (
                <div
                  key={line.label}
                  className={`loading-screen__line is-${line.kind}`}
                  style={{ animationDelay: `${i * LINE_DELAY_MS}ms` }}
                >
                  <span className="loading-screen__prompt">{'>'}</span>{' '}
                  <span className="loading-screen__label">{line.label}</span>
                  {line.dots && (
                    <span className="loading-screen__dots"> {line.dots} </span>
                  )}
                  {line.status && (
                    <span className="loading-screen__status">{line.status}</span>
                  )}
                </div>
              ))}
              <div
                className="loading-screen__line is-cursor"
                style={{ animationDelay: `${BOOT_LINES.length * LINE_DELAY_MS}ms` }}
              >
                <span className="loading-screen__prompt">{'>'}</span>{' '}
                <span className="loading-screen__blink">_</span>
              </div>
            </div>

            <TopographicCard />
          </>
        )}

        {showPrompt && (
          <MobileWarningPrompt
            onContinue={handleContinue}
            onDecline={() => setPhase('declined')}
          />
        )}

        {showDeclined && (
          <MobileDeclinedPanel onContinueAnyway={handleContinue} />
        )}
      </div>
    </div>
  )
}
