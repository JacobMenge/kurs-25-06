// ===========================================================================
// MAIN.JSX - Einstiegspunkt der React-Anwendung
// ===========================================================================
//
// Diese Datei ist der Startpunkt jeder React-App
// Hier wird React initialisiert und die App-Komponente in den DOM eingehaengt
//
// ===========================================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
