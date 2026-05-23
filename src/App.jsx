import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import AuroraSection from './components/AuroraSection'
import HeroAuroraContent from './components/HeroAuroraContent'
import HeroWaveDivider from './components/HeroWaveDivider'
import HeroHints from './components/HeroHints'
import LoadingScreen from './components/LoadingScreen'
import PageTwo from './components/PageTwo'
import PageHorizontalFlow from './components/PageHorizontalFlow'
import PageBlank from './components/PageBlank'
import ScrollExperience from './components/ScrollExperience'
import './App.css'

export default function App() {
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('is-booting', booting)
    document.body.style.overflow = booting ? 'hidden' : ''
    return () => {
      document.documentElement.classList.remove('is-booting')
      document.body.style.overflow = ''
    }
  }, [booting])

  return (
    <>
      <NavBar />
      <ScrollExperience>
        <main className="site-main">
          <section id="home" className="hero-viewport page-section--aurora-first">
            <AuroraSection />
            <HeroAuroraContent />
            <HeroHints />
            <HeroWaveDivider placement="hero-end" />
          </section>
          <PageTwo />
          <PageHorizontalFlow />
          <PageBlank />
        </main>
      </ScrollExperience>
      {booting && <LoadingScreen onDone={() => setBooting(false)} />}
    </>
  )
}
