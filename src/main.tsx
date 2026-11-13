import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled with the app, so a child's device never contacts a font server.
import '@fontsource/andika/400.css'
import '@fontsource/andika/700.css'
import '@fontsource-variable/fredoka'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
