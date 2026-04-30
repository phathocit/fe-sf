import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
// --- THÊM DÒNG NÀY ---
import { registerSW } from 'virtual:pwa-register'

// Tự động cập nhật ứng dụng khi có thay đổi
registerSW({ immediate: true })
// ----------------------

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
