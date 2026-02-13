// ===========================================================================
// MAIN.JSX - Einstiegspunkt der React-Anwendung
// ===========================================================================
//
// Diese Datei ist der Startpunkt jeder React-App
// Hier wird React initialisiert und die App-Komponente in den DOM eingehaengt
//
// React-Konzepte in dieser Datei:
// - createRoot: moderne Methode zum Starten einer React-App seit React 18
// - StrictMode: Entwicklungshilfe die auf moegliche Probleme hinweist
// - Komponenten-Mounting: wie React die Kontrolle ueber einen DOM-Bereich uebernimmt
//
// ===========================================================================

// StrictMode ist ein Entwicklungswerkzeug von React
// es aktiviert zusaetzliche Warnungen und Pruefungen waehrend der Entwicklung
// zum Beispiel werden Komponenten absichtlich doppelt gerendert um Seiteneffekte zu finden
// StrictMode hat keinen Einfluss auf die Produktionsversion
import { StrictMode } from 'react'

// createRoot ist die moderne Art eine React-App zu starten seit React 18
// es ersetzt das alte ReactDOM.render und ermoeglicht Concurrent Features
import { createRoot } from 'react-dom/client'

// globale CSS-Datei mit Reset und Basisstyles
import './index.css'

// die Hauptkomponente der App
// in React baut sich alles aus Komponenten auf wie ein Baum
// App ist die Wurzel dieses Baums
import App from './App.jsx'

// document.getElementById('root') holt das DOM-Element aus der index.html
// createRoot erzeugt einen React-Wurzelknoten an dieser Stelle
// render startet das Rendern der Komponenten
// ab hier uebernimmt React die Kontrolle ueber diesen Teil des DOM
createRoot(document.getElementById('root')).render(
  // StrictMode umschliesst die gesamte App
  // alles innerhalb wird auf moegliche Probleme geprueft
  <StrictMode>
    <App />
  </StrictMode>,
)
