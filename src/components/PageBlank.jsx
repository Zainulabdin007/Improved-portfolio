import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroWaveDivider from './HeroWaveDivider'
import GradientBlinds from './GradientBlinds'
import BorderGlow from './BorderGlow'
import { markBootGate, signalScrollSetup } from '../utils/bootReadiness'
import { resetScrollDrivenStyles } from '../utils/scrollNav'
import { renderBoldSegments } from '../utils/renderBoldSegments'
import { SCROLL_SCRUB_HFLOW } from '../utils/scrollConfig'
import './PageBlank.css'

gsap.registerPlugin(ScrollTrigger)

const SOCIALS = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/Zainulabdin007',
    path: 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.19 1.18a11 11 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.07.78 2.17v3.22c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/zain-bughio-869586367/',
    path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.44-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/zainulabdin_bughio?igsh=MWc1bjU3Y2dtOGZnYw%3D%3D&utm_source=qr',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zm0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  },
]

function SocialIcon({ path, label }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <title>{label}</title>
      <path d={path} />
    </svg>
  )
}

const PROJECTS = [
  {
    index: '01',
    title: 'Wanderers',
    subtitle: 'Hack Canada · campus social platform',
    image: '/wanderers.png',
    accent: '#22d3ee',
    glowHSL: '188 95% 60%',
    glowColors: ['#22d3ee', '#7cf9ff', '#a5f3fc'],
    stack: [
      'Next.js 15',
      'Supabase',
      'Google Gemini',
      'Cloudinary',
      'FastAPI',
      'scikit-learn',
      'Tailwind',
      'Vercel',
    ],
    highlights: [
      {
        title: 'Real-time activity bubbles',
        body:
          'Full-stack social app with live join flows, **map integration**, and an **end-event flow** with on-the-fly **camera capture**.',
      },
      {
        title: 'Moments feed + sharing',
        body:
          '**Likes**, **comments**, and **Web Share API** across campus events — designed to keep engagement loops short and addictive.',
      },
      {
        title: 'ML-driven recommendations',
        body:
          '**K-Means** clustering (**K=6**, **72.2% Hit Rate@6**) blending cluster popularity, interest match, time, and proximity. **Gemini** handles server-side intent parsing.',
      },
    ],
  },
  {
    index: '02',
    title: 'CoopTrack',
    subtitle: 'Co-op application tracker for UWaterloo students',
    image: '/cooptrack.png',
    accent: '#a78bfa',
    glowHSL: '258 90% 76%',
    glowColors: ['#a78bfa', '#f472b6', '#c4b5fd'],
    stack: [
      'React 18',
      'TypeScript',
      'Supabase Postgres',
      'Tailwind',
      'shadcn/ui',
      'Gemini',
      'Vercel',
    ],
    highlights: [
      {
        title: 'Scaled schema, sharp UI',
        body:
          'Normalized **Postgres** schema with **250k+** entries, dynamic per-term filtering, **JWT-based Google OAuth**, and **row-level security** for multi-tenant isolation.',
      },
      {
        title: '30+ users in 24 hours',
        body:
          'Automated **CI/CD** on **Vercel**, optimistic UI for **1,000+** concurrent users, and a mobile-responsive component library built on **shadcn/ui**.',
      },
      {
        title: 'Gemini-powered autofill',
        body:
          'Paste a job description; the **LLM** parses it into structured fields and **pre-populates** the application — kills the busywork that breaks momentum.',
      },
    ],
  },
]

/* After this progress, projects shell is fully scrolled — pan to contact begins */
const PAN_START = 0.62
/* Extra scroll runway for the projects → contact transition (wide = slow pan) */
const PAN_HEIGHT_PX = 3600
/** Ease only the first slice so entry from experience feels soft but still moves immediately. */
const PROJECTS_ENTRY_EASE_FRAC = 0.22

const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

function projectsScrollProgress(p) {
  const linear = p / PAN_START
  if (linear >= PROJECTS_ENTRY_EASE_FRAC) return linear
  return easeInOut(linear / PROJECTS_ENTRY_EASE_FRAC) * PROJECTS_ENTRY_EASE_FRAC
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function ProjectShowcase({ project, flipped }) {
  const ref = useReveal()
  return (
    <article
      ref={ref}
      className={`project-card ${flipped ? 'project-card--flipped' : ''}`}
      style={{ '--accent': project.accent }}
    >
      <BorderGlow
        className="project-card__glow"
        edgeSensitivity={25}
        glowColor={project.glowHSL}
        backgroundColor="rgba(8, 4, 20, 0.55)"
        borderRadius={28}
        glowRadius={48}
        glowIntensity={1.1}
        coneSpread={28}
        colors={project.glowColors}
        fillOpacity={0.4}
      >
        <div className="project-card__inner">
          <div className="project-card__media">
            <div className="project-card__shot">
              <img
                src={project.image}
                alt={`${project.title} preview`}
                loading="lazy"
              />
            </div>
            <div className="project-card__shadow" aria-hidden="true" />
          </div>

          <div className="project-card__body">
            <p className="project-card__index">{project.index}</p>
            <h3 className="project-card__title">{project.title}</h3>
            <p className="project-card__subtitle">{project.subtitle}</p>

            <ul className="project-card__highlights">
              {project.highlights.map((h) => (
                <li key={h.title}>
                  <h4>{h.title}</h4>
                  <p>{renderBoldSegments(h.body)}</p>
                </li>
              ))}
            </ul>

            <ul
              className="project-card__stack"
              aria-label={`${project.title} tech stack`}
            >
              {project.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>
      </BorderGlow>
    </article>
  )
}

export default function PageBlank() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const shellRef = useRef(null)
  const headerRef = useReveal()

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const shell = shellRef.current
    if (!section || !track || !shell) return

    resetScrollDrivenStyles()

    /*
     * Compute the section's pixel height dynamically so the projects shell
     * always gets enough scroll runway. Without this, on a tall mobile
     * portrait viewport the stacked project cards exceeded the available
     * scroll distance and content was skipped past in a blink.
     */
    const measure = () => {
      const pin = section.querySelector('.projects-pin')
      const pinH = pin?.clientHeight ?? window.innerHeight
      const maxScroll = Math.max(0, shell.scrollHeight - pinH)

      /* Total scroll required:
       *   pinH                         — initial sticky window
       * + maxScroll / PAN_START        — scroll needed to translate shell
       * + PAN_HEIGHT_PX                — explicit pan runway after PAN_START
       */
      const sectionHeight = pinH + maxScroll / PAN_START + PAN_HEIGHT_PX
      section.style.height = `${Math.round(sectionHeight)}px`
      return maxScroll
    }

    let maxScroll = measure()
    markBootGate('projectsLayout')

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCROLL_SCRUB_HFLOW,
      onUpdate: (self) => {
        const p = self.progress

        if (p < PAN_START) {
          const scrollProgress = projectsScrollProgress(p)
          track.style.transform = 'translate3d(-50%, 0, 0)'
          shell.style.transform = `translate3d(0, ${-scrollProgress * maxScroll}px, 0)`
        } else {
          const panProgress = easeInOut((p - PAN_START) / (1 - PAN_START))
          shell.style.transform = `translate3d(0, ${-maxScroll}px, 0)`
          /* Pan left: track moves from -100vw → 0, contact panel enters from the left */
          track.style.transform = `translate3d(${-50 + panProgress * 50}%, 0, 0)`
        }
      },
    })

    /* Re-measure whenever the page reflows. Images loading late or font
     * swaps can change shell.scrollHeight after the first paint, so we
     * also observe with ResizeObserver for surgical accuracy. */
    const onResize = () => {
      maxScroll = measure()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    const ro = new ResizeObserver(() => {
      maxScroll = measure()
      ScrollTrigger.refresh()
    })
    ro.observe(shell)

    /* If any images inside the shell load late, re-measure when they do. */
    const imgs = Array.from(shell.querySelectorAll('img'))
    imgs.forEach((img) => {
      if (img.complete) return
      img.addEventListener('load', onResize, { once: true })
      img.addEventListener('error', onResize, { once: true })
    })

    signalScrollSetup('page-blank')

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
      id="projects"
      className="page-section page-section--blank"
      aria-label="Projects and contact"
    >
      <HeroWaveDivider placement="below" />

      <div className="projects-pin">
        <div className="blank-bg" aria-hidden="true">
          <GradientBlinds
            gradientColors={['#FF9FFC', '#5227FF']}
            angle={20}
            noise={0.5}
            blindCount={16}
            blindMinWidth={60}
            spotlightRadius={0.5}
            spotlightSoftness={1}
            spotlightOpacity={1}
            mouseDampening={0.15}
            distortAmount={0}
            shineDirection="left"
            mixBlendMode="lighten"
          />
        </div>

        <div className="blank-veil" aria-hidden="true" />

        <div ref={trackRef} className="projects-track">
          {/* Panel 1 — Contact (revealed when track pans left to 0) */}
          <div
            id="contact"
            className="projects-panel projects-panel--contact"
            aria-label="Contact and inquiries"
          >
            <div className="contact-shell">
              <h2 className="contact-shell__title">Get in Touch</h2>

              <p className="contact-shell__message">
                Feel free to reach out anytime — whether it&apos;s a question,
                an opportunity, or just a hello. I&apos;m always open to
                collaborating on projects, hackathons, and ideas worth building.
              </p>

              <ul className="contact-shell__socials">
                {SOCIALS.map(({ id, label, href, path }) => (
                  <li key={id}>
                    <a
                      className="contact-shell__social-link"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon path={path} label={label} />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <p className="contact-shell__rights">
                Zain Bughio. All rights reserved.
              </p>
            </div>
          </div>

          {/* Panel 2 — Projects (visible first; scroll vertically, then pan away) */}
          <div className="projects-panel projects-panel--projects">
            <div ref={shellRef} className="projects-shell">
              <header ref={headerRef} className="projects-header">
                <h2 className="projects-header__title">Things I've Built</h2>
                <p className="projects-header__lede">
                  Two flagship builds — one shipped in 36 hours at a hackathon,
                  the other a daily-driver for UWaterloo co-op season.
                </p>
              </header>

              <div className="projects-list">
                {PROJECTS.map((p, i) => (
                  <ProjectShowcase
                    key={p.title}
                    project={p}
                    flipped={i % 2 === 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
