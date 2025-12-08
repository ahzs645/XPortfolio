// Initialize audio manager first (patches Audio constructor for master volume control)
import './utils/audioManager'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'xp.css/dist/XP.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
