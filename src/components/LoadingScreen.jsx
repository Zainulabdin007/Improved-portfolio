import { useEffect, useRef, useState } from 'react'
import { finalizeSiteBoot } from '../utils/bootReadiness'
import './LoadingScreen.css'

/**
 * Terminal boot sequence — variable pacing per line (see useBootTerminal).
 * @type {Array<{ id: string, kind: string, label: string, dots?: string, status?: string, statusTone?: string, waitMs?: number, loadMs?: number }>}
 */
const BOOT_LINES = [
  { id: 'sub2', kind: 'subheader', label: '// 3D ASSET PIPELINE' },
  {
    id: 'p1',
    kind: 'pending',
    label: 'Streaming Draco-compressed meshes ...',
    waitMs: 520,
    loadMs: 560,
  },
  {
    id: 't3',
    kind: 'task',
    label: 'Parsing sphere morph targets',
    dots: '............',
    status: 'OK',
    statusTone: 'ok',
    waitMs: 380,
    loadMs: 920,
  },
  {
    id: 't4',
    kind: 'task',
    label: 'Hydrating workstation GLB',
    dots: '..........',
    status: 'OK',
    statusTone: 'ok',
    waitMs: 320,
    loadMs: 1280,
  },
  {
    id: 't5',
    kind: 'task',
    label: 'Syncing chrome dino walk cycle',
    dots: '........',
    status: 'LOCK',
    statusTone: 'cyan',
    waitMs: 280,
    loadMs: 1040,
  },
  {
    id: 't6',
    kind: 'metric',
    label: 'VRAM budget',
    dots: '................',
    status: '1.2 GB',
    statusTone: 'muted',
    waitMs: 240,
    loadMs: 680,
  },
  { id: 'sub3', kind: 'subheader', label: '// SCROLL CHOREOGRAPHY', waitMs: 480 },
  {
    id: 'p2',
    kind: 'pending',
    label: 'Measuring pin zones & scrub curves ...',
    waitMs: 540,
    loadMs: 520,
  },
  {
    id: 't7',
    kind: 'task',
    label: 'Calibrating horizontal flow track',
    dots: '..........',
    status: 'SYNC',
    statusTone: 'cyan',
    waitMs: 360,
    loadMs: 860,
  },
  {
    id: 't8',
    kind: 'task',
    label: 'Indexing projects · contact panels',
    dots: '........',
    status: 'OK',
    statusTone: 'ok',
    waitMs: 300,
    loadMs: 620,
  },
  {
    id: 't9',
    kind: 'task',
    label: 'Resetting scroll state to origin',
    dots: '..........',
    status: '0,0',
    statusTone: 'muted',
    waitMs: 260,
    loadMs: 540,
  },
  {
    id: 't10',
    kind: 'task',
    label: 'Refreshing ScrollTrigger graph',
    dots: '........',
    status: 'DONE',
    statusTone: 'ok',
    waitMs: 280,
    loadMs: 780,
  },
  { id: 'sub4', kind: 'subheader', label: '// MEDIA & TYPE', waitMs: 460 },
  {
    id: 'p3',
    kind: 'pending',
    label: 'Prefetching textures & project stills ...',
    waitMs: 580,
    loadMs: 540,
  },
  {
    id: 't11',
    kind: 'task',
    label: 'Resolving Google Fonts stack',
    dots: '............',
    status: 'OK',
    statusTone: 'ok',
    waitMs: 300,
    loadMs: 640,
  },
  {
    id: 't12',
    kind: 'task',
    label: 'Decoding hero hand sprites',
    dots: '..........',
    status: 'OK',
    statusTone: 'ok',
    waitMs: 320,
    loadMs: 880,
  },
  {
    id: 't13',
    kind: 'task',
    label: 'Compiling wave displacement fields',
    dots: '......',
    status: 'OK',
    statusTone: 'ok',
    waitMs: 260,
    loadMs: 560,
  },
  { id: 'sub5', kind: 'subheader', label: '// FINAL CHECKS', waitMs: 500 },
  {
    id: 'p4',
    kind: 'pending',
    label: 'Awaiting first hero frame composite ...',
    waitMs: 620,
    loadMs: 580,
  },
  {
    id: 't14',
    kind: 'task',
    label: 'Validating scene readiness gates',
    dots: '........',
    status: '7/7',
    statusTone: 'cyan',
    waitMs: 340,
    loadMs: 1120,
  },
  {
    id: 't15',
    kind: 'task',
    label: 'Stabilizing viewport @ 1920 ref',
    dots: '......',
    status: '100%',
    statusTone: 'ok',
    waitMs: 300,
    loadMs: 720,
  },
  {
    id: 'fin',
    kind: 'final',
    label: 'All systems online — entering experience.',
    waitMs: 720,
    loadMs: 620,
  },
]

/** Global scale for boot pacing — lower = shorter loader (line timings are design-time ms). */
const BOOT_PACE = 0.44

function bootMs(ms) {
  return Math.max(60, Math.round(ms * BOOT_PACE))
}

const POST_SEQUENCE_MS = 500
const MIN_BOOT_MS = 5200
/** Split-door reveal duration after boot completes. */
const DOOR_REVEAL_MS = 1000
const STATUS_ANIM_MS = bootMs(200)
const CURSOR_AFTER_MS = bootMs(360)

/** @param {typeof BOOT_LINES[number]} line */
function defaultWaitMs(line) {
  switch (line.kind) {
    case 'subheader':
      return 360
    case 'pending':
      return 480
    case 'task':
      return 340
    case 'metric':
      return 280
    case 'final':
      return 640
    default:
      return 320
  }
}

/** @param {typeof BOOT_LINES[number]} line */
function defaultLoadMs(line) {
  const heavy =
    /GLB|meshes|composite|gates|sprites|morph|dino|ScrollTrigger/i.test(
      line.label,
    )
  switch (line.kind) {
    case 'subheader':
      return 320
    case 'pending':
      return 520
    case 'task':
      return heavy ? 880 : 620
    case 'metric':
      return 560
    case 'final':
      return 560
    default:
      return 480
  }
}

function lineLoadMs(line) {
  return bootMs(line.loadMs ?? defaultLoadMs(line))
}

function lineWaitMs(line) {
  return bootMs(line.waitMs ?? defaultWaitMs(line))
}

function buildBootSequenceMs(lines) {
  let t = bootMs(200)
  for (const line of lines) {
    t += lineWaitMs(line) + lineLoadMs(line)
    if (line.status) t += STATUS_ANIM_MS
  }
  return t + bootMs(CURSOR_AFTER_MS / BOOT_PACE) + POST_SEQUENCE_MS
}

const BOOT_SEQUENCE_MS = buildBootSequenceMs(BOOT_LINES)
const MIN_VISIBLE_MS = Math.max(MIN_BOOT_MS, BOOT_SEQUENCE_MS)

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/** Strip trailing ellipses from pending copy — animated dots are shown while loading. */
function lineDisplayLabel(line) {
  if (line.kind === 'pending') {
    return line.label.replace(/\s*\.{2,}\s*$/, '')
  }
  return line.label
}

function LoadingDots() {
  return (
    <span className="loading-screen__dots-anim" aria-hidden="true">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  )
}

/**
 * Drives which boot lines are visible and which is actively loading.
 * @returns {{ lineIndex: number, showStatus: boolean, sequenceDone: boolean }}
 */
function useBootTerminal(active) {
  const [lineIndex, setLineIndex] = useState(0)
  const [showStatus, setShowStatus] = useState(false)
  const [sequenceDone, setSequenceDone] = useState(false)

  useEffect(() => {
    if (!active) return undefined

    let cancelled = false

    const run = async () => {
      setLineIndex(-1)
      setShowStatus(false)
      setSequenceDone(false)

      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (cancelled) return

        const line = BOOT_LINES[i]
        if (i > 0) {
          await sleep(lineWaitMs(line))
          if (cancelled) return
        }

        setLineIndex(i)
        setShowStatus(false)

        await sleep(lineLoadMs(line))
        if (cancelled) return

        if (line.status) {
          setShowStatus(true)
          await sleep(STATUS_ANIM_MS)
          if (cancelled) return
          setShowStatus(false)
        }
      }

      setLineIndex(BOOT_LINES.length)
      setShowStatus(false)
      await sleep(bootMs(CURSOR_AFTER_MS / BOOT_PACE))
      if (cancelled) return
      setSequenceDone(true)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [active])

  return { lineIndex, showStatus, sequenceDone }
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

function BootTerminalLine({ line, index, lineIndex, showStatus }) {
  if (index > lineIndex) return null
  const i = index

  const isLoading = i === lineIndex && !showStatus
  const isComplete =
    i < lineIndex || (i === lineIndex && showStatus && Boolean(line.status))

  return (
    <div
      className={`loading-screen__line is-${line.kind} is-visible${
        isLoading ? ' is-loading' : ''
      }${isComplete ? ' is-complete' : ''}`}
    >
      <span className="loading-screen__prompt">{'>'}</span>{' '}
      <span className="loading-screen__label">{lineDisplayLabel(line)}</span>
      {isLoading && (
        <>
          {' '}
          <LoadingDots />
        </>
      )}
      {isComplete && line.dots && (
        <span className="loading-screen__dots"> {line.dots} </span>
      )}
      {isComplete && line.status && (
        <span
          className={`loading-screen__status${
            line.statusTone ? ` is-${line.statusTone}` : ''
          } is-visible`}
        >
          {line.status}
        </span>
      )}
    </div>
  )
}

function BootPanel({
  showBoot,
  showPrompt,
  showDeclined,
  bootProgress,
  lineIndex,
  showStatus,
  showCursor,
  onContinue,
  onDecline,
  onContinueAnyway,
}) {
  return (
    <div
      className={`loading-screen__inner${showPrompt || showDeclined ? ' is-mobile-gate' : ''}`}
    >
      {showBoot && (
        <>
          <div className="loading-screen__terminal-wrap">
            <div className="loading-screen__terminal" role="status" aria-live="polite">
              {BOOT_LINES.map((line, index) => (
                <BootTerminalLine
                  key={line.id}
                  line={line}
                  index={index}
                  lineIndex={lineIndex}
                  showStatus={showStatus}
                />
              ))}
              {showCursor && (
                <div className="loading-screen__line is-cursor is-visible">
                  <span className="loading-screen__prompt">{'>'}</span>{' '}
                  <span className="loading-screen__blink">_</span>
                </div>
              )}
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
        <MobileWarningPrompt onContinue={onContinue} onDecline={onDecline} />
      )}

      {showDeclined && (
        <MobileDeclinedPanel onContinueAnyway={onContinueAnyway} />
      )}
    </div>
  )
}

/** Boot overlay — waits for assets, paints hero under cover, then splits open. */
export default function LoadingScreen({ onBeforeFade, onDone }) {
  const [done, setDone] = useState(false)
  const [bootProgress, setBootProgress] = useState(0)
  /* boot → prompt (mobile only) → declined | exiting */
  const [phase, setPhase] = useState('boot')
  const showBoot = phase === 'boot'
  const { lineIndex, showStatus, sequenceDone } = useBootTerminal(showBoot)

  const sequenceDoneRef = useRef(sequenceDone)
  sequenceDoneRef.current = sequenceDone

  useEffect(() => {
    const minTime = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS))

    let cancelled = false
    let exitTimer
    let sequencePoll

    const sequenceReady = new Promise((resolve) => {
      if (sequenceDoneRef.current) {
        resolve()
        return
      }
      sequencePoll = window.setInterval(() => {
        if (sequenceDoneRef.current) {
          window.clearInterval(sequencePoll)
          resolve()
        }
      }, 40)
    })

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
      exitTimer = window.setTimeout(() => {
        if (cancelled) return
        setDone(true)
        onDone?.()
      }, DOOR_REVEAL_MS)
    }

    Promise.all([finalizeSiteBoot(), minTime, sequenceReady]).then(() => {
      if (cancelled) return
      setBootProgress(100)
      if (isMobileExperience()) {
        setPhase('prompt')
      } else {
        void enterSite()
      }
    })

    return () => {
      cancelled = true
      if (exitTimer) window.clearTimeout(exitTimer)
      if (sequencePoll) window.clearInterval(sequencePoll)
    }
  }, [onBeforeFade, onDone])

  useEffect(() => {
    if (!showBoot) return
    const total = BOOT_LINES.length + 1
    let frac = 0
    if (lineIndex < 0) frac = 0
    else if (lineIndex >= BOOT_LINES.length) frac = 1
    else frac = (lineIndex + (showStatus ? 0.92 : 0.45)) / total
    setBootProgress(Math.min(99, Math.round(frac * 100)))
  }, [showBoot, lineIndex, showStatus])

  useEffect(() => {
    if (!showBoot || !sequenceDone) return
    setBootProgress(100)
  }, [showBoot, sequenceDone])

  const handleContinue = async () => {
    setBootProgress(100)
    try {
      await onBeforeFade?.()
    } catch {
      /* still reveal */
    }
    setPhase('exiting')
    window.setTimeout(() => {
      setDone(true)
      onDone?.()
    }, DOOR_REVEAL_MS)
  }

  const showPrompt = phase === 'prompt'
  const showDeclined = phase === 'declined'
  const showCursor = lineIndex >= BOOT_LINES.length

  const isRevealing = phase === 'exiting'
  const panelProps = {
    showBoot,
    showPrompt,
    showDeclined,
    bootProgress,
    lineIndex,
    showStatus,
    showCursor,
    onContinue: handleContinue,
    onDecline: () => setPhase('declined'),
    onContinueAnyway: handleContinue,
  }

  return (
    <div
      className={`loading-screen${isRevealing ? ' is-revealing' : ''}${done ? ' is-done' : ''}`}
      aria-hidden={done}
    >
      <div className="loading-screen__doors">
        <div className="loading-screen__door loading-screen__door--left">
          <div className="loading-screen__door-scanlines" aria-hidden="true" />
          <div className="loading-screen__door-vignette" aria-hidden="true" />
          <div className="loading-screen__door-viewport">
            <BootPanel {...panelProps} />
          </div>
        </div>
        <div
          className="loading-screen__door loading-screen__door--right"
          aria-hidden="true"
        >
          <div className="loading-screen__door-scanlines" aria-hidden="true" />
          <div className="loading-screen__door-vignette" aria-hidden="true" />
          <div className="loading-screen__door-viewport loading-screen__door-viewport--right">
            <BootPanel {...panelProps} />
          </div>
        </div>
      </div>
    </div>
  )
}
