import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import AuroraSection from './components/AuroraSection'
import HeroAuroraContent from './components/HeroAuroraContent'
import HeroWaveDivider from './components/HeroWaveDivider'
import HeroHints from './components/HeroHints'
import LoadingScreen from './components/LoadingScreen'
import PageTwo from './components/PageTwo'
import PageHorizontalFlow from './components/PageHorizontalFlow'
import ScrollExperience from './components/ScrollExperience'
import { waitForSitePainted } from './utils/bootReadiness'
import { resetScrollDrivenStyles, resetScrollToTop } from './utils/scrollNav'
import './App.css'

export default function App() {
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    resetScrollToTop()
  }, [])

  useEffect(() => {
    if (!booting) return undefined
    const holdAtTop = () => {
      resetScrollToTop({ clearHash: true })
      resetScrollDrivenStyles()
    }
    holdAtTop()
    const id = window.setInterval(holdAtTop, 200)
    return () => window.clearInterval(id)
  }, [booting])

  useEffect(() => {
    document.documentElement.classList.toggle('is-booting', booting)
    document.body.style.overflow = booting ? 'hidden' : ''
    return () => {
      document.documentElement.classList.remove('is-booting')
      document.body.style.overflow = ''
    }
  }, [booting])

  const prepareReveal = async () => {
    resetScrollToTop({ clearHash: true })
    resetScrollDrivenStyles()
    await waitForSitePainted()
  }

  const finishBoot = () => {
    setBooting(false)
  }

  return (
    <>
      <div className={booting ? 'site-shell site-shell--booting' : 'site-shell'}>
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
          </main>
        </ScrollExperience>
      </div>
      {booting && (
        <LoadingScreen onBeforeFade={prepareReveal} onDone={finishBoot} />
      )}
    </>
  )
}
