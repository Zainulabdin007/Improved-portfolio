import { useEffect, useState } from 'react'
import { finalizeSiteBoot } from '../utils/bootReadiness'
import './LoadingScreen.css'

/**
 * Terminal boot sequence — paced for readability and to cover real preload time.
 * @type {Array<{ id: string, kind: string, label: string, dots?: string, status?: string, statusTone?: string }>}
 */
const BOOT_LINES = [
  { id: 'hdr', kind: 'header', label: 'ZB PORTFOLIO · SYSTEM BOOT v2.4.1' },
  { id: 'sub1', kind: 'subheader', label: '// CORE RUNTIME' },
  { id: 'p0', kind: 'pending', label: 'Handshaking WebGL2 context ...' },
  { id: 't0', kind: 'task', label: 'Allocating framebuffers', dots: '..............', status: 'OK', statusTone: 'ok' },
  { id: 't1', kind: 'task', label: 'Binding aurora fragment shaders', dots: '..........', status: 'OK', statusTone: 'ok' },
  { id: 't2', kind: 'task', label: 'Warming noise & gradient pipelines', dots: '........', status: 'READY', statusTone: 'cyan' },
  { id: 'sub2', kind: 'subheader', label: '// 3D ASSET PIPELINE' },
  { id: 'p1', kind: 'pending', label: 'Streaming Draco-compressed meshes ...' },
  { id: 't3', kind: 'task', label: 'Parsing sphere morph targets', dots: '............', status: 'OK', statusTone: 'ok' },
  { id: 't4', kind: 'task', label: 'Hydrating workstation GLB', dots: '..........', status: 'OK', statusTone: 'ok' },
  { id: 't5', kind: 'task', label: 'Syncing chrome dino walk cycle', dots: '........', status: 'LOCK', statusTone: 'cyan' },
  { id: 't6', kind: 'metric', label: 'VRAM budget', dots: '................', status: '1.2 GB', statusTone: 'muted' },
  { id: 'sub3', kind: 'subheader', label: '// SCROLL CHOREOGRAPHY' },
  { id: 'p2', kind: 'pending', label: 'Measuring pin zones & scrub curves ...' },
  { id: 't7', kind: 'task', label: 'Calibrating horizontal flow track', dots: '..........', status: 'SYNC', statusTone: 'cyan' },
  { id: 't8', kind: 'task', label: 'Indexing projects · contact panels', dots: '........', status: 'OK', statusTone: 'ok' },
  { id: 't9', kind: 'task', label: 'Resetting scroll state to origin', dots: '..........', status: '0,0', statusTone: 'muted' },
  { id: 't10', kind: 'task', label: 'Refreshing ScrollTrigger graph', dots: '........', status: 'DONE', statusTone: 'ok' },
  { id: 'sub4', kind: 'subheader', label: '// MEDIA & TYPE' },
  { id: 'p3', kind: 'pending', label: 'Prefetching textures & project stills ...' },
  { id: 't11', kind: 'task', label: 'Resolving Google Fonts stack', dots: '............', status: 'OK', statusTone: 'ok' },
  { id: 't12', kind: 'task', label: 'Decoding hero hand sprites', dots: '..........', status: 'OK', statusTone: 'ok' },
  { id: 't13', kind: 'task', label: 'Compiling wave displacement fields', dots: '......', status: 'OK', statusTone: 'ok' },
  { id: 'sub5', kind: 'subheader', label: '// FINAL CHECKS' },
  { id: 'p4', kind: 'pending', label: 'Awaiting first hero frame composite ...' },
  { id: 't14', kind: 'task', label: 'Validating scene readiness gates', dots: '........', status: '7/7', statusTone: 'cyan' },
  { id: 't15', kind: 'task', label: 'Stabilizing viewport @ 1920 ref', dots: '......', status: '100%', statusTone: 'ok' },
  { id: 'fin', kind: 'final', label: 'All systems online — entering experience.' },
]

const LINE_DELAY_MS = 240
const POST_SEQUENCE_MS = 1600
const MIN_BOOT_MS = 12000
const FADE_MS = 700

const SEQUENCE_MS = BOOT_LINES.length * LINE_DELAY_MS + POST_SEQUENCE_MS
const MIN_VISIBLE_MS = Math.max(MIN_BOOT_MS, SEQUENCE_MS)

function lineDelay(index) {
  return index * LINE_DELAY_MS
}

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

/** Boot overlay — waits for assets, paints hero under cover, then crossfades out. */
export default function LoadingScreen({ onBeforeFade, onDone }) {
  const [done, setDone] = useState(false)
  const [bootProgress, setBootProgress] = useState(0)
  /* boot → prompt (mobile only) → declined | exiting */
  const [phase, setPhase] = useState('boot')

  useEffect(() => {
    const minTime = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS))

    let cancelled = false
    let exitTimer
    let progressTimer

    const progressStart = performance.now()
    progressTimer = window.setInterval(() => {
      if (cancelled) return
      const elapsed = performance.now() - progressStart
      const pct = Math.min(99, Math.round((elapsed / MIN_VISIBLE_MS) * 100))
      setBootProgress(pct)
    }, 120)

    const enterSite = async () => {
      if (cancelled) return
      setBootProgress(100)
      try {
        await onBeforeFade?.()
      } catch {
        /* still reveal if paint wait fails */
      }
      if (cancelled) return
      setPhase('exiting')
      setDone(true)
      exitTimer = window.setTimeout(() => {
        if (!cancelled) onDone?.()
      }, FADE_MS)
    }

    Promise.all([finalizeSiteBoot(), minTime]).then(() => {
      if (cancelled) return
      if (isMobileExperience()) {
        setPhase('prompt')
      } else {
        void enterSite()
      }
    })

    return () => {
      cancelled = true
      if (exitTimer) window.clearTimeout(exitTimer)
      if (progressTimer) window.clearInterval(progressTimer)
    }
  }, [onDone])

  const handleContinue = async () => {
    setBootProgress(100)
    try {
      await onBeforeFade?.()
    } catch {
      /* still reveal */
    }
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
            <div className="loading-screen__terminal-wrap">
              <div className="loading-screen__terminal" role="status" aria-live="polite">
                {BOOT_LINES.map((line, i) => (
                  <div
                    key={line.id}
                    className={`loading-screen__line is-${line.kind}`}
                    style={{ animationDelay: `${lineDelay(i)}ms` }}
                  >
                    <span className="loading-screen__prompt">{'>'}</span>{' '}
                    <span className="loading-screen__label">{line.label}</span>
                    {line.dots && (
                      <span className="loading-screen__dots"> {line.dots} </span>
                    )}
                    {line.status && (
                      <span
                        className={`loading-screen__status${
                          line.statusTone ? ` is-${line.statusTone}` : ''
                        }`}
                      >
                        {line.status}
                      </span>
                    )}
                  </div>
                ))}
                <div
                  className="loading-screen__line is-cursor"
                  style={{ animationDelay: `${lineDelay(BOOT_LINES.length)}ms` }}
                >
                  <span className="loading-screen__prompt">{'>'}</span>{' '}
                  <span className="loading-screen__blink">_</span>
                </div>
              </div>

              <div
                className="loading-screen__progress"
                role="progressbar"
                aria-valuenow={bootProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Boot progress"
              >
                <div className="loading-screen__progress-track">
                  <div
                    className="loading-screen__progress-fill"
                    style={{ width: `${bootProgress}%` }}
                  />
                </div>
                <span className="loading-screen__progress-label">
                  SYS_LOAD {String(bootProgress).padStart(3, ' ')}%
                </span>
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
