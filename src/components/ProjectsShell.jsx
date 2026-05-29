import BorderGlow from './BorderGlow'
import { renderBoldSegments } from '../utils/renderBoldSegments'
import { salFadeAttrs } from '../utils/salAttrs'
import './PageBlank.css'

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

function ProjectShowcase({ project, flipped, index }) {
  return (
    <article
      className={`project-card ${flipped ? 'project-card--flipped' : ''}`}
      style={{ '--accent': project.accent }}
      {...salFadeAttrs(120 + index * 160, 800)}
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
              <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
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
            <ul className="project-card__stack" aria-label={`${project.title} tech stack`}>
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

/** Vertical projects list — scroll driven by parent via shellRef transform. */
export default function ProjectsShell({ shellRef }) {
  return (
    <div ref={shellRef} className="projects-shell">
      <header className="projects-header" {...salFadeAttrs(60, 700)}>
        <h2 className="projects-header__title">Things I've Built</h2>
        <p className="projects-header__lede">
          Two flagship builds — one shipped in 36 hours at a hackathon, the other a
          daily-driver for UWaterloo co-op season.
        </p>
      </header>
      <div className="projects-list">
        {PROJECTS.map((p, i) => (
          <ProjectShowcase key={p.title} project={p} flipped={i % 2 === 1} index={i} />
        ))}
      </div>
    </div>
  )
}
