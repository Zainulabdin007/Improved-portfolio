import { Suspense, useEffect, useRef } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'

import { Center, useAnimations, useGLTF } from '@react-three/drei'

import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

import HeroWaveDivider from './HeroWaveDivider'

import Waves from './Waves'

import TopoPattern from './TopoPattern'

import ProjectsShell from './ProjectsShell'

import ContactPanel from './ContactPanel'

import {

  HFLOW_ABOUT_HOLD_END,

  HFLOW_EXP_STRIP_END,
  HFLOW_PAN_TO_CONTACT_END,
  HFLOW_PAN_TO_EXP_END,
  HFLOW_PAN_TO_PROJECTS_END,
  HFLOW_PROJECTS_SCROLL_END,
} from '../utils/hflowScrollPhases'

import { markBootGate, signalScrollSetup } from '../utils/bootReadiness'

import { resetScrollDrivenStyles } from '../utils/scrollNav'

import { renderBoldSegments } from '../utils/renderBoldSegments'

import { HFLOW_SECTION_PIN_MULT, SCROLL_SCRUB_HFLOW } from '../utils/scrollConfig'

import { salFadeAttrs } from '../utils/salAttrs'
import { destroySal, initSal, refreshSal } from '../utils/salScroll'

import './PageHorizontalFlow.css'

import './PageBlank.css'



gsap.registerPlugin(ScrollTrigger)



const DINO_URL = '/3d_chrome_dino_walking.glb'

useGLTF.preload(DINO_URL)



const PANEL_PCT = 25



const ABOUT_HOLD_END = HFLOW_ABOUT_HOLD_END

const PAN_TO_PROJ_END = HFLOW_PAN_TO_PROJECTS_END

const PROJ_SCROLL_END = HFLOW_PROJECTS_SCROLL_END

const PAN_TO_EXP_END = HFLOW_PAN_TO_EXP_END

const EXP_STRIP_END = HFLOW_EXP_STRIP_END
const PAN_TO_CONTACT_END = HFLOW_PAN_TO_CONTACT_END



const EXP_ENTER_OFFSET = 0.2

const LAST_CARD_VIEWPORT_X = 0.45

const TAIL_AFTER_LAST_CARD = 0

const EXP_ENTER_EASE_FRAC = 0.4

const PROJECTS_ENTRY_EASE_FRAC = 0.28



const DINO_OFFSCREEN_X = -3

const DINO_WALK_START_X = -1.4

const DINO_WALK_END_X = -0.4

const DINO_WALK_SCROLL_FRAC = 0.38



const easeInOut = (t) =>

  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2



/** Softer ease for horizontal panel pans (less harsh mid-transition). */

const easePan = (t) =>

  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2



/** Very slow ease for experience → contact pan. */

const easeContactPan = (t) => {
  const u = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
  return u
}



function projectsScrollProgress(local) {

  if (local >= PROJECTS_ENTRY_EASE_FRAC) return local

  return easeInOut(local / PROJECTS_ENTRY_EASE_FRAC) * PROJECTS_ENTRY_EASE_FRAC

}



function trackOffsetPercent(p) {

  if (p < ABOUT_HOLD_END) return 0



  if (p < PAN_TO_PROJ_END) {

    const t = easePan((p - ABOUT_HOLD_END) / (PAN_TO_PROJ_END - ABOUT_HOLD_END))

    return -t * PANEL_PCT

  }



  if (p < PROJ_SCROLL_END) return -PANEL_PCT



  if (p < PAN_TO_EXP_END) {

    const t = easePan((p - PROJ_SCROLL_END) / (PAN_TO_EXP_END - PROJ_SCROLL_END))

    return -PANEL_PCT - t * PANEL_PCT

  }



  if (p < EXP_STRIP_END) return -2 * PANEL_PCT

  if (p < PAN_TO_CONTACT_END) {
    const t = easeContactPan(
      (p - EXP_STRIP_END) / (PAN_TO_CONTACT_END - EXP_STRIP_END),
    )
    return -2 * PANEL_PCT - t * PANEL_PCT
  }

  return -3 * PANEL_PCT

}



function dinoPositionForProgress(p) {

  if (p < PAN_TO_EXP_END) return DINO_OFFSCREEN_X



  if (p < EXP_STRIP_END) {

    const panProgress = easeInOut(

      (p - PAN_TO_EXP_END) / (EXP_STRIP_END - PAN_TO_EXP_END),

    )

    if (panProgress < 0.35) {

      return (

        DINO_OFFSCREEN_X +

        (panProgress / 0.35) * (DINO_WALK_START_X - DINO_OFFSCREEN_X)

      )

    }

    const walkT = Math.min((panProgress - 0.35) / DINO_WALK_SCROLL_FRAC, 1)

    return DINO_WALK_START_X + easeInOut(walkT) * (DINO_WALK_END_X - DINO_WALK_START_X)

  }



  return DINO_WALK_END_X

}



function experienceExpProgress(p) {

  if (p < PAN_TO_EXP_END) return 0

  if (p >= EXP_STRIP_END) {

    const linear = 1

    return linear >= EXP_ENTER_EASE_FRAC

      ? linear

      : easeInOut(linear / EXP_ENTER_EASE_FRAC) * EXP_ENTER_EASE_FRAC

  }

  const linear = (p - PAN_TO_EXP_END) / (EXP_STRIP_END - PAN_TO_EXP_END)

  if (linear >= EXP_ENTER_EASE_FRAC) return linear

  return easeInOut(linear / EXP_ENTER_EASE_FRAC) * EXP_ENTER_EASE_FRAC

}



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



    if (actionRef.current) {

      const lastActive = scrollActiveRef?.current ?? 0

      const isScrolling = performance.now() - lastActive < 150

      actionRef.current.paused = !isScrolling

    }

  })



  return (

    <group ref={groupRef} scale={0.5} position={[0, -1, 0]}>

      <Center>

        <primitive object={scene} />

      </Center>

    </group>

  )

}



const EXPERIENCES = [

  {

    title: 'Network Engineer Intern',

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

  const projectsShellRef = useRef(null)

  const experienceViewportRef = useRef(null)

  const experienceStripRef = useRef(null)

  const dinoPosRef = useRef(-3)

  const scrollActiveRef = useRef(0)



  useEffect(() => {

    markBootGate('gradientBlinds')

    const frame = requestAnimationFrame(() => {

      initSal()

      refreshSal()

    })

    return () => {

      cancelAnimationFrame(frame)

      destroySal()

    }

  }, [])



  useEffect(() => {

    const section = sectionRef.current

    const track = trackRef.current

    const shell = projectsShellRef.current

    if (!section || !track || !shell) return



    resetScrollDrivenStyles()



    let lastSalRefresh = 0



    const measure = () => {

      const pin = section.querySelector('.hflow-pin')

      const pinH = pin?.clientHeight ?? window.innerHeight

      const maxScroll = Math.max(0, shell.scrollHeight - pinH)

      const projFrac = PROJ_SCROLL_END - PAN_TO_PROJ_END

      const sectionHeight = Math.round(
        pinH + maxScroll / projFrac + pinH * HFLOW_SECTION_PIN_MULT,
      )

      section.style.height = `${sectionHeight}px`

      markBootGate('projectsLayout')

      return maxScroll

    }



    let maxScroll = measure()



    const trigger = ScrollTrigger.create({

      trigger: section,

      start: 'top top',

      end: 'bottom bottom',

      scrub: SCROLL_SCRUB_HFLOW,

      onUpdate: (self) => {

        const p = self.progress

        scrollActiveRef.current = performance.now()



        track.style.transform = `translate3d(${trackOffsetPercent(p)}%, 0, 0)`



        if (p >= PAN_TO_PROJ_END && p < PROJ_SCROLL_END) {

          const local =

            (p - PAN_TO_PROJ_END) / (PROJ_SCROLL_END - PAN_TO_PROJ_END)

          const scrollProgress = projectsScrollProgress(local)

          shell.style.transform = `translate3d(0, ${-scrollProgress * maxScroll}px, 0)`

        } else if (p >= PROJ_SCROLL_END) {

          shell.style.transform = `translate3d(0, ${-maxScroll}px, 0)`

        } else {

          shell.style.transform = 'translate3d(0, 0, 0)'

        }



        const expViewport = experienceViewportRef.current

        const expStrip = experienceStripRef.current

        if (expStrip && expViewport) {

          const expP = experienceExpProgress(p)

          const x = experienceStripX(expViewport, expStrip, expP)

          expStrip.style.transform = `translate3d(${x}px, 0, 0)`

        }



        dinoPosRef.current = dinoPositionForProgress(p)



        const now = performance.now()

        if (now - lastSalRefresh > 180) {

          lastSalRefresh = now

          refreshSal()

        }

      },

    })



    const onResize = () => {

      maxScroll = measure()

      ScrollTrigger.refresh()

    }

    window.addEventListener('resize', onResize)

    window.addEventListener('orientationchange', onResize)



    const ro = new ResizeObserver(onResize)

    ro.observe(shell)



    shell.querySelectorAll('img').forEach((img) => {

      if (img.complete) return

      img.addEventListener('load', onResize, { once: true })

      img.addEventListener('error', onResize, { once: true })

    })



    signalScrollSetup('page-horizontal-flow')



    return () => {

      window.removeEventListener('resize', onResize)

      window.removeEventListener('orientationchange', onResize)

      ro.disconnect()

      trigger.kill()

    }

  }, [])



  return (

    <section

      ref={sectionRef}

      id="about"

      className="page-section page-section--hflow"

      aria-label="About, projects, experience, and contact"

    >

      <HeroWaveDivider placement="below" />



      <div className="hflow-pin">

        <div ref={trackRef} className="hflow-track">

          {/* Panel 1 — About */}

          <div className="hflow-panel hflow-panel--about">

            <div className="hflow-panel__bg" aria-hidden="true">

              <Waves

                lineColor="rgba(255, 255, 255, 0.2)"

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

            <article className="hflow-card" {...salFadeAttrs(80, 900, { repeat: true })}>

              <TopoPattern className="hflow-card__topo" />

              <div className="hflow-card__inner">

                <div className="hflow-photo">

                  <img src="/Pics_to_add.jpg" alt="Zain Bughio" loading="lazy" />

                </div>

                <div className="hflow-text">

                  <h2 className="hflow-text__name">Zain Bughio</h2>

                  <p>

                    A passionate developer with a foundation in coding that began

                    in grade 11, I have since built hands-on experience spanning

                    software development and robotics. I bring a strong technical

                    mindset coupled with a drive for continuous learning and growth.

                  </p>

                  <p>

                    Outside of my technical pursuits, I maintain a disciplined

                    lifestyle through fitness and draw creativity and focus from

                    diverse interests, I'm into anime, hitting the gym, hanging out

                    with friends, and playing video games. I'm someone who thrives

                    on seeking new knowledge and experiences, and I bring that same

                    curiosity and dedication to everything I build.

                  </p>

                </div>

              </div>

            </article>

          </div>



          {/* Panel 2 — Projects (vertical scroll) */}

          <div id="projects" className="hflow-panel hflow-panel--projects">

            <div className="hflow-panel__bg" aria-hidden="true">

              <Waves

                lineColor="rgba(223, 32, 32, 0.28)"

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

            <ProjectsShell shellRef={projectsShellRef} />

          </div>



          {/* Panel 3 — Experience */}

          <div

            id="experience"

            className="hflow-panel hflow-panel--experience"

          >

            <div className="hflow-panel__bg" aria-hidden="true">

              <Waves

                lineColor="rgba(255, 255, 255, 0.2)"

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

                  <p className="hflow-experience__eyebrow">Experience</p>

                  <h2 className="hflow-experience__title">Where I've Worked</h2>

                  <p className="hflow-experience__lede">

                    Three stops so far — from campus IT to full-stack engineering

                    to clinical infrastructure.

                  </p>

                </header>



                {EXPERIENCES.map((exp, index) => (

                  <article
                    key={exp.company}
                    className="hflow-slide"
                    {...salFadeAttrs(80 + index * 100, 750, { repeat: true })}
                  >

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



          {/* Panel 4 — Contact */}

          <div

            id="contact"

            className="hflow-panel hflow-panel--contact"

            aria-label="Contact and inquiries"

          >

            <div className="hflow-panel__bg" aria-hidden="true">

              <Waves

                lineColor="rgba(223, 32, 32, 0.28)"

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

            <ContactPanel />

          </div>

        </div>

      </div>



      <HeroWaveDivider placement="hero-end" />

    </section>

  )

}


