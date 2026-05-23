import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_ITEMS, initNavFromHash, scrollToNavItem } from '../utils/scrollNav'
import './NavBar.css'

const TRACK_SRC = '/Calima - Autumn Bliss (freetouse.com).mp3'

function MusicNoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}

function handleNavClick(e, item) {
  e.preventDefault()
  scrollToNavItem(item)
}

export default function NavBar() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      initNavFromHash()
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  async function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      return
    }

    try {
      await audio.play()
    } catch {
      setPlaying(false)
    }
  }

  const home = NAV_ITEMS[0]

  return (
    <header className="navbar-wrap">
      <nav className="navbar" aria-label="Main">
        <a
          className="navbar__brand"
          href={`#${home.key}`}
          aria-label="Home"
          onClick={(e) => handleNavClick(e, home)}
        >
          <img src="/ZBicon.svg" alt="" className="navbar__logo" />
        </a>
        <ul className="navbar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <a
                className="navbar__link"
                href={`#${item.key}`}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          id="navbar-music"
          type="button"
          className={`navbar__music${playing ? ' navbar__music--playing' : ''}`}
          onClick={toggleMusic}
          aria-label={playing ? 'Pause soundtrack' : 'Play soundtrack'}
          aria-pressed={playing}
        >
          <MusicNoteIcon />
        </button>
        <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />
      </nav>
    </header>
  )
}
