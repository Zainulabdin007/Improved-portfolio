import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_ITEMS, initNavFromHash, scrollToNavItem } from '../utils/scrollNav'
import './NavBar.css'

function handleNavClick(e, item) {
  e.preventDefault()
  scrollToNavItem(item)
}

export default function NavBar() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      initNavFromHash()
    })
    return () => cancelAnimationFrame(id)
  }, [])

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
      </nav>
    </header>
  )
}
