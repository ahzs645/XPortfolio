// Initialize audio manager first (patches Audio constructor for master volume control)
import './utils/audioManager'
import './utils/cursorManager'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/xpandeder-entry.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
