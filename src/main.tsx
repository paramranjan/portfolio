import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}
document.documentElement.scrollTop = 0
document.body.scrollTop = 0

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
