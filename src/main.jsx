import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { resetScrollToTop } from './utils/scrollNav'
import { initViewportVars } from './utils/viewportVars'
import './index.css'

if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  resetScrollToTop()
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) resetScrollToTop()
  })
}

initViewportVars()

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
