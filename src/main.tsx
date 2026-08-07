import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ToastProvider from './Componentes/Toast'
import { initTema } from './utils/theme.ts'

// Aplica el tema (claro/oscuro) guardado antes del primer render
initTema()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Los avisos viven por encima del router: cualquier página puede usarlos */}
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
