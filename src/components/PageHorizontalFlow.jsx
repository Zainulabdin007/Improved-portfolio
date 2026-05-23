import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Bounds,
  Center,
  Environment,
  Lightformer,
  useAnimations,
  useGLTF,
} from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiReact,
  SiNextdotjs,
  SiHtml5,
  SiTailwindcss,
  SiOpenjdk,
  SiCplusplus,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiNumpy,
  SiPandas,
  SiDocker,
  SiGithub,
  SiSupabase,
  SiGit,
  SiBlender,
} from 'react-icons/si'
import { TbCursorText } from 'react-icons/tb'
import HeroWaveDivider from './HeroWaveDivider'
import Waves from './Waves'
import TopoPattern from './TopoPattern'
import {
  HFLOW_PAN1_END,
  HFLOW_PAN2_END,
  HFLOW_SPIN_END,
} from '../utils/hflowScrollPhases'
import { markBootGate, signalScrollSetup } from '../utils/bootReadiness'
import { resetScrollDrivenStyles } from '../utils/scrollNav'
import { renderBoldSegments } from '../utils/renderBoldSegments'
import { SCROLL_SCRUB_HFLOW } from '../utils/scrollConfig'
import './PageHorizontalFlow.css'

gsap.registerPlugin(ScrollTrigger)

const COMPUTER_URL = '/my_computer.glb'
const DINO_URL = '/3d_chrome_dino_walking.glb'
useGLTF.preload(COMPUTER_URL)
useGLTF.preload(DINO_URL)

/*
 * 24 logos on an 8 × 4 grid that frames the computer at the center cells
 * (cols 3-6, rows 2-3). `Icon` is a bundled react-icons component (no
 * network calls); `src` is a local override the user provided in /public.
 * Thresholds map onto the spin-phase progress (post horizontal pan).
 */
const TECH_LOGOS = [
  { col: 1, row: 1, name: 'Python',       Icon: SiPython,       threshold: 0.03 },
  { col: 2, row: 1, name: 'JavaScript',   Icon: SiJavascript,   threshold: 0.07 },
  { col: 3, row: 1, name: 'TypeScript',   Icon: SiTypescript,   threshold: 0.11 },
  { col: 4, row: 1, name: 'Node.js',      Icon: SiNodedotjs,    threshold: 0.15 },
  { col: 5, row: 1, name: 'React',        Icon: SiReact,        threshold: 0.19 },
  { col: 6, row: 1, name: 'Next.js',      Icon: SiNextdotjs,    threshold: 0.23 },
  { col: 7, row: 1, name: 'HTML',         Icon: SiHtml5,        threshold: 0.27 },
  { col: 8, row: 1, name: 'CSS',          src: '/CSS3_logo.svg.png',                    threshold: 0.31 },
  { col: 1, row: 2, name: 'Tailwind',     Icon: SiTailwindcss,  threshold: 0.35 },
  { col: 2, row: 2, name: 'Java',         Icon: SiOpenjdk,      threshold: 0.39 },
  { col: 7, row: 2, name: 'C++',          Icon: SiCplusplus,    threshold: 0.43 },
  { col: 8, row: 2, name: 'TensorFlow',   Icon: SiTensorflow,   threshold: 0.47 },
  { col: 1, row: 3, name: 'PyTorch',      Icon: SiPytorch,      threshold: 0.51 },
  { col: 2, row: 3, name: 'scikit-learn', Icon: SiScikitlearn,  threshold: 0.55 },
  { col: 7, row: 3, name: 'NumPy',        Icon: SiNumpy,        threshold: 0.59 },
  { col: 8, row: 3, name: 'Pandas',       Icon: SiPandas,       threshold: 0.63 },
  { col: 1, row: 4, name: 'OpenAI',       src: '/openai.svg',                           threshold: 0.67 },
  { col: 2, row: 4, name: 'VS Code',      src: '/Visual_Studio_Code_1.35_icon.svg.png', threshold: 0.71 },
  { col: 3, row: 4, name: 'Cursor',       Icon: TbCursorText,   threshold: 0.75 },
  { col: 4, row: 4, name: 'Docker',       Icon: SiDocker,       threshold: 0.79 },
  { col: 5, row: 4, name: 'GitHub',       Icon: SiGithub,       threshold: 0.83 },
  { col: 6, row: 4, name: 'Supabase',     Icon: SiSupabase,     threshold: 0.87 },
  { col: 7, row: 4, name: 'Git',          Icon: SiGit,          threshold: 0.91 },
  { col: 8, row: 4, name: 'Blender',      Icon: SiBlender,      threshold: 0.95 },
]

/** Re-exported phase breakpoints live in hflowScrollPhases.js (nav shares PAN2_END). */
const PAN1_END = HFLOW_PAN1_END
const SPIN_END = HFLOW_SPIN_END
const PAN2_END = HFLOW_PAN2_END
/** Strip enter offset — 40% of prior 0.5 so the header appears sooner. */
const EXP_ENTER_OFFSET = 0.2
/** Last card rests just past center at section end — reads smoother than dead-center. */
const LAST_CARD_VIEWPORT_X = 0.45
/** No extra strip travel after the last card — avoids dead scroll at section end. */
const TAIL_AFTER_LAST_CARD = 0
/** Ease the first portion of experience scroll so the header glides in slowly. */
const EXP_ENTER_EASE_FRAC = 0.4

/** Dino world-x positions (see DinoModel group scale). */
const DINO_OFFSCREEN_X = -3
const DINO_WALK_START_X = -1.4
const DINO_WALK_END_X = -0.4
/** Fraction of phase-3 progress used for the on-screen walk after entry. */
const DINO_WALK_SCROLL_FRAC = 0.38

const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

/** Dino glides in during the computer → experience pan; then walks across the panel. */
function dinoPositionForProgress(p) {
  if (p < SPIN_END) return DINO_OFFSCREEN_X

  if (p < PAN2_END) {
    const panProgress = easeInOut((p - SPIN_END) / (PAN2_END - SPIN_END))
    return (
      DINO_OFFSCREEN_X + panProgress * (DINO_WALK_START_X - DINO_OFFSCREEN_X)
    )
  }

  const phase3 = (p - PAN2_END) / (1 - PAN2_END)
  const walkT = Math.min(phase3 / DINO_WALK_SCROLL_FRAC, 1)
  return DINO_WALK_START_X + easeInOut(walkT) * (DINO_WALK_END_X - DINO_WALK_START_X)
}

function experienceExpProgress(p) {
  if (p < PAN2_END) return 0
  const linear = (p - PAN2_END) / (1 - PAN2_END)
  if (linear >= EXP_ENTER_EASE_FRAC) return linear
  return easeInOut(linear / EXP_ENTER_EASE_FRAC) * EXP_ENTER_EASE_FRAC
}

function ComputerModel({ rotationRef }) {
  const { scene } = useGLTF(COMPUTER_URL)
  const groupRef = useRef()

  useEffect(() => {
    if (scene) markBootGate('hflowComputer')
  }, [scene])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationRef.current
    }
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

/*
 * The Chrome dino walking model — plays its built-in walking clip and
 * traverses the bottom-left of the experience panel as the user scrolls
 * through Phase 4. Position is driven externally via positionRef.x.
 */
function DinoModel({ positionRef, scrollActiveRef }) {
  const groupRef = useRef()
  const actionRef = useRef(null)
  const { scene, animations } = useGLTF(DINO_URL)
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (scene) markBootGate('hflowDino')
  }, [scene])

  useEffect(() => {
    if (names.length === 0) return
    const preferred =
      names.find((n) => /walk|run|loop|idle/i.test(n)) || names[0]
    const action = actions[preferred]
    if (action) {
      action.reset().fadeIn(0.2).play()
      action.timeScale = 1.1
      actionRef.current = action
    }
    return () => {
      action?.fadeOut(0.2)
      actionRef.current = null
    }
  }, [actions, names])

  const displayXRef = useRef(DINO_OFFSCREEN_X)

  useFrame(() => {
    if (!groupRef.current) return
    const target = positionRef.current
    if (typeof target !== 'number') return

    const prev = displayXRef.current
    const next = prev + (target - prev) * 0.22
    displayXRef.current = next
    groupRef.current.position.x = next

    // Pause the walk loop when the user isn't actively scrubbing. While
    // scrolling, the legs keep cycling — even if the dino has parked at the
    // end of his path he visually walks in place. The instant the user
    // stops, his legs freeze mid-step.
    if (actionRef.current) {
      const lastActive = scrollActiveRef?.current ?? 0
      const isScrolling = performance.now() - lastActive < 150
      actionRef.current.paused = !isScrolling
    }
  })

  // position[1] anchors the dino near the bottom edge of the canvas (in
  // world units, before scaling) — tweak if his feet sit too high/low.
  return (
    <group ref={groupRef} scale={0.5} position={[0, -1, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

/*
 * Scroll choreography across 3 horizontal panels + 3 experience slides.
 *
 *   Phase 0 (0      → PAN1_END)   pan: about → computer    (-100vw)
 *   Phase 1 (PAN1   → SPIN_END)   computer spins, logos reveal
 *   Phase 2 (SPIN   → PAN2_END)   pan: computer → experience (-200vw)
 *   Phase 3 (PAN2   → 1)          header + cards strip scrolls horizontally
 */

const EXPERIENCES = [
  {
    title: 'Information Technology Intern',
    company: 'CDI College',
    dates: 'Jul 2024 — Aug 2024',
    location: 'Mississauga, ON',
    bullets: [
      'Installed, configured, and maintained desktops, laptops, printers, and mobile devices via **Microsoft Intune**.',
      'Troubleshot **hardware**, **software**, and peripheral issues — keeping downtime minimal for **500+** students and staff.',
      'Provided responsive **technical assistance**, contributing to seamless daily **IT operations** across the campus.',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'PixelsBoost',
    dates: 'May 2025 — Dec 2025',
    location: 'Milton, ON',
    bullets: [
      'Engineered and shipped **6** production **full-stack** sites in **React**, **HTML/CSS**, and **JavaScript** — dynamic contact forms, interactive galleries, fully responsive nav — collectively serving **1,500+** monthly active users.',
      'Architected integrations with **3** mission-critical APIs (**Stripe**, **Google Maps**, **SendGrid**), enabling **$10K+** in monthly payment processing and automated email workflows at **99%** uptime.',
      'Delivered **5** simultaneous client projects in an **agile** environment: **200+** commits across **20+** feature branches, mentored **2** designers, and resolved **15+** merge conflicts.',
      'Drove a **40%** performance uplift via **WebP** compression, **lazy loading**, and **Cloudflare CDN** — **Lighthouse** scores **65 → 86**, bounce rates down **15%**.',
    ],
  },
  {
    title: 'IT Support Specialist',
    company: 'Waterloo Regional Health Network',
    dates: 'May 2026 — Present',
    location: 'Kitchener, ON',
    bullets: [
      'Migrate clinical workstations from the legacy **GRHosp** domain to the unified **WRHN** domain, preserving authentication and continuity of care for hospital staff.',
      'Image and reimage laptops via **PXE boot**, then configure device permissions and deploy required software for **physicians**, **nurses**, and administrative teams.',
      'Triage and resolve end-to-end **hardware** and **software** issues alongside a tight-knit IT team, keeping critical **clinical workflows** online.',
      'Operate under strict **patient-privacy** and **healthcare security** standards while supporting doctors and staff across multiple departments.',
    ],
  },
]

function experienceStripX(viewport, strip, expP) {
  const clipWidth = viewport.clientWidth
  const startX = clipWidth * EXP_ENTER_OFFSET
  const lastCard = strip.querySelector('.hflow-slide:last-child')
  let lastCardX = startX - clipWidth * 0.5
  if (lastCard) {
    const lastCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2
    lastCardX = clipWidth * LAST_CARD_VIEWPORT_X - lastCenter
  }
  const mainTravel = startX - lastCardX
  const endX = lastCardX - mainTravel * TAIL_AFTER_LAST_CARD
  return startX + expP * (endX - startX)
}

export default function PageHorizontalFlow() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const computerStageRef = useRef(null)
  const experienceViewportRef = useRef(null)
  const experienceStripRef = useRef(null)
  const rotationRef = useRef(0)
  const dinoPosRef = useRef(-3) // starts off-screen left (world units)
  const scrollActiveRef = useRef(0) // timestamp of last scroll-trigger update

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const stage = computerStageRef.current
    if (!section || !track || !stage) return

    resetScrollDrivenStyles()

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCROLL_SCRUB_HFLOW,
      onUpdate: (self) => {
        const p = self.progress
        scrollActiveRef.current = performance.now()

        if (p < PAN1_END) {
          // Phase 0 — pan to computer (about card stays fixed)
          const panProgress = easeInOut(p / PAN1_END)
          track.style.transform = `translate3d(${-panProgress * (100 / 3)}%, 0, 0)`
          rotationRef.current = 0
          stage.style.setProperty('--progress', '0')
        } else if (p < SPIN_END) {
          // Phase 1 — computer spin + logo reveal
          track.style.transform = 'translate3d(-33.333%, 0, 0)'
          const spinProgress = (p - PAN1_END) / (SPIN_END - PAN1_END)
          rotationRef.current = spinProgress * Math.PI * 4
          stage.style.setProperty('--progress', String(spinProgress))
        } else if (p < PAN2_END) {
          // Phase 2 — pan to experience (eased; short gap kept at 60% reduction)
          const panProgress = easeInOut(
            (p - SPIN_END) / (PAN2_END - SPIN_END),
          )
          track.style.transform = `translate3d(${
            -(100 / 3) - panProgress * (100 / 3)
          }%, 0, 0)`
          rotationRef.current = Math.PI * 4
          stage.style.setProperty('--progress', '1')
        } else {
          // Phase 3 — experience panel pinned in view
          track.style.transform = 'translate3d(-66.666%, 0, 0)'
          rotationRef.current = Math.PI * 4
          stage.style.setProperty('--progress', '1')
        }

        // Experience — header + cards pan together across the full viewport.
        const expViewport = experienceViewportRef.current
        const expStrip = experienceStripRef.current
        if (expStrip && expViewport) {
          const expP = experienceExpProgress(p)
          const x = experienceStripX(expViewport, expStrip, expP)
          expStrip.style.transform = `translate3d(${x}px, 0, 0)`
        }

        dinoPosRef.current = dinoPositionForProgress(p)
      },
    })

    signalScrollSetup('page-horizontal-flow')

    return () => trigger.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="page-section page-section--hflow"
      aria-label="About Zain Bughio and tech stack"
    >
      <HeroWaveDivider placement="below" />

      <div className="hflow-pin">
        <div ref={trackRef} className="hflow-track">
          {/* Panel 1 — About card on vibrant yellow */}
          <div className="hflow-panel hflow-panel--about">
            <div className="hflow-panel__bg" aria-hidden="true">
              <Waves
                lineColor="rgba(0, 0, 0, 0.18)"
                backgroundColor="transparent"
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
            <article className="hflow-card">
              <TopoPattern className="hflow-card__topo" />
              <div className="hflow-card__inner">
                <div className="hflow-photo">
                  <img src="/Pics_to_add.jpg" alt="Zain Bughio" loading="lazy" />
                </div>
                <div className="hflow-text">
                  <h2 className="hflow-text__name">Zain Bughio</h2>
                  <p>
                    A passionate developer with a foundation in coding that
                    began in grade 11, I have since built hands-on experience
                    spanning software development and robotics. I bring a
                    strong technical mindset coupled with a drive for
                    continuous learning and growth.
                  </p>
                  <p>
                    Outside of my technical pursuits, I maintain a disciplined
                    lifestyle through fitness and draw creativity and focus
                    from diverse interests, I'm into anime, hitting the gym,
                    hanging out with friends, and playing video games. I'm
                    someone who thrives on seeking new knowledge and
                    experiences, and I bring that same curiosity and
                    dedication to everything I build.
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* Panel 2 — Computer scene on dark black + orange */}
          <div className="hflow-panel hflow-panel--computer">
            <div className="hflow-panel__bg" aria-hidden="true">
              <Waves
                lineColor="rgba(251, 146, 60, 0.22)"
                backgroundColor="transparent"
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
            <div ref={computerStageRef} className="hflow-stage">
              <ul className="hflow-grid" aria-label="Languages, frameworks, and tools">
                {TECH_LOGOS.map((logo) => (
                  <li
                    key={logo.name}
                    className="hflow-tile"
                    aria-label={logo.name}
                    style={{
                      '--col': logo.col,
                      '--row': logo.row,
                      '--threshold': logo.threshold,
                    }}
                  >
                    <div className="hflow-tile__content">
                      <div className="hflow-tile__media">
                        {logo.Icon ? (
                          <logo.Icon
                            className="hflow-tile__svg"
                            aria-hidden="true"
                            focusable="false"
                          />
                        ) : (
                          <img
                            src={logo.src}
                            alt=""
                            className="hflow-tile__icon"
                            loading="eager"
                          />
                        )}
                      </div>
                      <span className="hflow-tile__label">{logo.name}</span>
                    </div>
                  </li>
                ))}

                <li className="hflow-computer-cell" aria-hidden="true">
                  <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0.6, 4], fov: 32 }}
                    gl={{ antialias: true, alpha: true }}
                  >
                    <ambientLight intensity={0.75} />
                    <directionalLight position={[3, 4, 3]} intensity={1.3} />
                    <directionalLight position={[-3, 2, -3]} intensity={0.55} />
                    <pointLight position={[0, 2, 3]} intensity={6} distance={12} />
                    <Suspense fallback={null}>
                      <Bounds fit clip observe margin={1.15}>
                        <ComputerModel rotationRef={rotationRef} />
                      </Bounds>
                      {/* Local HDR-free environment so we never fetch a preset */}
                      <Environment resolution={256}>
                        <Lightformer
                          form="rect"
                          intensity={1.6}
                          color="#ffffff"
                          position={[0, 3, 4]}
                          rotation={[-Math.PI / 4, 0, 0]}
                          scale={[10, 6, 1]}
                        />
                        <Lightformer
                          form="rect"
                          intensity={0.9}
                          color="#fb923c"
                          position={[-4, -1, 2]}
                          scale={[6, 6, 1]}
                        />
                        <Lightformer
                          form="rect"
                          intensity={0.6}
                          color="#f5f5f7"
                          position={[4, 1, 2]}
                          scale={[6, 6, 1]}
                        />
                      </Environment>
                    </Suspense>
                  </Canvas>
                </li>
              </ul>
            </div>
          </div>

          {/* Panel 3 — Experience on a sunset-to-twilight gradient */}
          <div
            id="experience"
            className="hflow-panel hflow-panel--experience"
          >
            <div className="hflow-panel__bg" aria-hidden="true">
              <Waves
                lineColor="rgba(255, 255, 255, 0.18)"
                backgroundColor="transparent"
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

            {/* Walking chrome dino in the bottom-left corner */}
            <div className="hflow-dino-stage" aria-hidden="true">
              <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 0.4, 4], fov: 30 }}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={0.75} />
                <directionalLight position={[3, 4, 3]} intensity={1.1} />
                <directionalLight position={[-3, 2, -3]} intensity={0.5} />
                <Suspense fallback={null}>
                  <DinoModel
                    positionRef={dinoPosRef}
                    scrollActiveRef={scrollActiveRef}
                  />
                </Suspense>
              </Canvas>
            </div>

            <div
              ref={experienceViewportRef}
              className="hflow-experience-viewport"
            >
              <div ref={experienceStripRef} className="hflow-experience-strip">
                <header className="hflow-experience__header">
                  <h2 className="hflow-experience__title">Where I've Worked</h2>
                  <p className="hflow-experience__lede">
                    Three stops so far — from campus IT to full-stack
                    engineering to clinical infrastructure.
                  </p>
                </header>

                {EXPERIENCES.map((exp) => (
                  <article key={exp.company} className="hflow-slide">
                    <header className="hflow-slide__header">
                      <p className="hflow-slide__dates">{exp.dates}</p>
                      <h3 className="hflow-slide__role">{exp.title}</h3>
                      <p className="hflow-slide__company">
                        <span>{exp.company}</span>
                        <span className="hflow-slide__sep">·</span>
                        <span>{exp.location}</span>
                      </p>
                    </header>
                    <ul className="hflow-slide__bullets">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{renderBoldSegments(b)}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeroWaveDivider placement="hero-end" />
    </section>
  )
}
