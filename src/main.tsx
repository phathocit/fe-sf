import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { offlineService } from './utils/offlineService'

// Initialize offline service
offlineService.initialize().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
