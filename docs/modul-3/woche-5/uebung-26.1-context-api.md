---
title: "26.1 – Context API"
tags:
  - React
  - Context-API
  - AWS
  - Deployment
---
# Context API - Praktische Übung

## Übersicht

Willkommen zur Übung über React's Context API! Hier lernst du, wie du Daten global in deiner Anwendung teilen kannst, ohne sie durch jede Komponenten-Ebene als Props durchreichen zu müssen.

In dieser Übung lernst du:
- **Das Prop Drilling Problem** - Warum Props manchmal nicht ausreichen
- **Context erstellen** - Mit `createContext` einen gemeinsamen Datenkontext anlegen
- **Provider einrichten** - Daten für den Komponentenbaum bereitstellen
- **Context konsumieren** - Mit `useContext` auf die Daten zugreifen
- **Props vs Context** - Wann du welchen Ansatz wählen solltest

Diese Übung baut auf "24.2 Komponenten & Props" und "25.2 Hooks in React" auf – stelle sicher, dass du Props und useState verstanden hast!

> **Hinweis zum Styling:** In dieser Übung verwenden wir Inline-Styles, um sofortiges visuelles Feedback zu haben ohne zusätzliches CSS-Setup. In echten Projekten würdest du CSS-Dateien oder CSS-in-JS verwenden.

---

## Inhaltsverzeichnis

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Das Prop Drilling Problem | 10 min (lesen) |
| **Teil 1** | Context erstellen | 15 min |
| **Teil 2** | Provider einrichten | 20 min |
| **Teil 3** | Context mit useContext nutzen | 15 min |
| **Teil 4** | Context änderbar machen | 20 min |
| **Teil 5** | Props vs Context - Wann was? | 10 min |
| **Teil 6** | Praxis: Theme-Switcher (Dark/Light Mode) | 35 min |
| **Teil 7** | Praxis: User-Authentifizierung | 40 min |
| | **Gesamt** | **ca. 2,5 Stunden** |

### Minimalpfad (wenn du wenig Zeit hast)

**In 60-90 Minuten die wichtigsten Konzepte:**

1. **Rückblick** - Prop Drilling verstehen
2. **Teil 1-3** - Context erstellen und nutzen - *Kernkonzept*
3. **Teil 5** - Props vs Context - *Wichtige Entscheidungshilfe*
4. **Teil 6** - Theme-Switcher - *Praktische Anwendung*

---

## Voraussetzungen & Setup

**Bevor du startest:**

1. Du hast ein funktionierendes React-Projekt (aus den vorherigen Übungen)
2. Der Dev-Server läuft (`npm run dev`)
3. Du kannst Änderungen im Browser sehen

Falls du kein Projekt hast, erstelle schnell eines:

```bash
npm create vite@latest context-uebung -- --template react
cd context-uebung
npm install
npm run dev
```

> **Tipp für diese Übung:** Du wirst mehrere Contexts und Komponenten bauen. Um die Übersicht zu behalten, lege einen eigenen Ordner `src/contexts/` für deine Context-Dateien an. Wir verwenden `.jsx` konsistent für alle React-nahen Module (Contexts, Provider, Hooks) – auch wenn nicht überall JSX vorkommt.

---

## Rückblick: Das Prop Drilling Problem

### Was ist Prop Drilling?

**Prop Drilling** bezeichnet das Weitergeben von Daten durch mehrere Komponenten-Ebenen, obwohl die mittleren Komponenten diese Daten gar nicht selbst brauchen:

```
┌─────────────────────────────────────────────────────────────┐
│                    PROP DRILLING                            │
│                                                             │
│   App (hat: user, theme)                                    │
│    │                                                        │
│    ├── Header (braucht: nichts, gibt weiter: user, theme)   │
│    │    │                                                   │
│    │    ├── Navigation (braucht: nichts, gibt weiter: user) │
│    │    │    │                                              │
│    │    │    └── UserMenu (braucht: user) ← Endlich!        │
│    │    │                                                   │
│    │    └── ThemeToggle (braucht: theme)                    │
│    │                                                        │
│    └── Main                                                 │
│         │                                                   │
│         └── Sidebar                                         │
│              │                                              │
│              └── UserInfo (braucht: user) ← Auch hier!      │
│                                                             │
│   Problem: Header und Navigation sind nur "Durchreicher"    │
└─────────────────────────────────────────────────────────────┘
```

### Das Problem im Code

```javascript
// ❌ PROP DRILLING - Unübersichtlich!

function App() {
  const [user, setUser] = useState({ name: 'Max', role: 'Admin' });
  const [theme, setTheme] = useState('light');

  return (
    <div>
      {/* Header braucht user und theme nur zum Weitergeben */}
      <Header user={user} theme={theme} setTheme={setTheme} />
      <Main user={user} />
    </div>
  );
}

function Header({ user, theme, setTheme }) {
  return (
    <header>
      {/* Navigation braucht user nur zum Weitergeben */}
      <Navigation user={user} />
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  );
}

function Navigation({ user }) {
  return (
    <nav>
      <a href="/">Home</a>
      {/* Erst hier wird user wirklich gebraucht! */}
      <UserMenu user={user} />
    </nav>
  );
}

function UserMenu({ user }) {
  return <span>Hallo, {user.name}!</span>;
}
```

### Warum ist das schlecht?

1. **Unklarheit:** Komponenten haben Props, die sie selbst nicht nutzen
2. **Wartbarkeit:** Änderst du die Datenstruktur, musst du alle Durchreicher anpassen
3. **Wiederverwendbarkeit:** Komponenten sind schwerer anderswo einsetzbar
4. **Spaghetticode:** Der Code wird schnell unübersichtlich

### Die Lösung: Context API

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT API                              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  UserContext                        │   │
│   │                  ThemeContext                       │   │
│   └─────────────────────────────────────────────────────┘   │
│         ↑               ↑               ↑                   │
│         │               │               │                   │
│   App ──┼───────────────┼───────────────┼────────────────   │
│    │    │               │               │                   │
│    ├── Header           │               │                   │
│    │    │               │               │                   │
│    │    ├── Navigation  │               │                   │
│    │    │    │          │               │                   │
│    │    │    └── UserMenu ← useContext(UserContext)         │
│    │    │                               │                   │
│    │    └── ThemeToggle ← useContext(ThemeContext)          │
│    │                                                        │
│    └── Main                                                 │
│         │                                                   │
│         └── Sidebar                                         │
│              │                                              │
│              └── UserInfo ← useContext(UserContext)         │
│                                                             │
│   Jede Komponente holt sich NUR was sie braucht!            │
└─────────────────────────────────────────────────────────────┘
```

---

## Teil 1: Context erstellen

### Wie erstellt man einen Context?

Ein Context wird mit `createContext` aus React erstellt:

```javascript
import { createContext } from 'react';

// Context mit Default-Wert erstellen
// Wir verwenden von Anfang an ein Objekt, damit wir später
// auch eine Setter-Funktion hinzufügen können
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {}  // Placeholder-Funktion
});

export default ThemeContext;
```

> **Wichtig:** Wir definieren den Context von Anfang an als Objekt mit `theme` und `setTheme`. So ist die Struktur konsistent und wir müssen später nichts ändern, wenn wir die Setter-Funktion wirklich nutzen wollen.

### Die drei Schritte der Context API

```
┌─────────────────────────────────────────────────────────────┐
│               DIE DREI SCHRITTE                             │
│                                                             │
│   1. ERSTELLEN     →  createContext(defaultValue)           │
│                        Definiert den Context                │
│                                                             │
│   2. BEREITSTELLEN →  <Context.Provider value={...}>        │
│                        Provider macht Daten verfügbar       │
│                                                             │
│   3. KONSUMIEREN   →  useContext(Context)                   │
│                        Komponenten lesen die Daten          │
└─────────────────────────────────────────────────────────────┘
```

### Übung 1: Ersten Context erstellen

> **Ziel:** Einen einfachen Context für das Theme erstellen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Du einen ThemeContext erstellt und exportiert hast

**Aufgabe:**

1. Erstelle einen Ordner `src/contexts/` für deine Context-Dateien.

2. Erstelle die Datei `src/contexts/ThemeContext.jsx`:

```javascript
// src/contexts/ThemeContext.jsx

import { createContext } from 'react';

// Aufgabe: Erstelle einen Context für das Theme
// Der Default-Wert soll ein Objekt sein mit:
// - theme: 'light'
// - setTheme: eine leere Funktion () => {}

// const ThemeContext = createContext({ ??? });

// Vergiss nicht zu exportieren!
// export default ThemeContext;
```

3. Der Context soll später die Werte `'light'` oder `'dark'` speichern können.

<details markdown>
<summary>Musterlösung anzeigen</summary>

```javascript
// src/contexts/ThemeContext.jsx

import { createContext } from 'react';

// Context mit Default-Wert als Objekt erstellen
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {}
});

export default ThemeContext;
```

> **Was passiert hier?**
> - `createContext({...})` erstellt ein Context-Objekt
> - Der Default-Wert ist ein Objekt mit `theme` und einer Placeholder-Funktion `setTheme`
> - Dieser Default-Wert wird nur verwendet, wenn KEIN Provider vorhanden ist
> - Der Context wird exportiert, damit andere Dateien ihn importieren können

</details>

### Wissensfrage 1

Was ist der Unterschied zwischen dem Default-Wert bei `createContext` und dem `value` beim Provider?

<details markdown>
<summary>Antwort anzeigen</summary>

**Default-Wert (`createContext(defaultValue)`):**
- Wird nur verwendet, wenn eine Komponente den Context nutzt, aber KEIN Provider darüber existiert
- Ist ein Fallback für den "Notfall"
- Wird in der Praxis selten genutzt, da man meist einen Provider hat

**Provider-Wert (`<Context.Provider value={...}>`):**
- Überschreibt den Default-Wert
- Wird für alle Kind-Komponenten verwendet
- Kann dynamisch sein (z.B. aus State)

```javascript
// Ohne Provider → Default-Wert { theme: 'light', setTheme: () => {} }
const { theme } = useContext(ThemeContext); // 'light'

// Mit Provider → Provider-Wert
<ThemeContext.Provider value={{ theme: 'dark', setTheme }}>
  <Child /> {/* useContext gibt { theme: 'dark', setTheme } */}
</ThemeContext.Provider>
```

</details>

---

## Teil 2: Provider einrichten

### Was ist ein Provider?

Ein **Provider** ist eine spezielle Komponente, die den Context-Wert für alle Kind-Komponenten bereitstellt. Du verwendest `Context.Provider`:

```javascript
import ThemeContext from './contexts/ThemeContext';

function App() {
  return (
    // WICHTIG: .Provider verwenden!
    <ThemeContext.Provider value={{ theme: 'dark', setTheme: () => {} }}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}
```

> **Achtung:** Der Provider ist `ThemeContext.Provider`, nicht einfach `<ThemeContext>`. Das Context-Objekt selbst ist keine Komponente – es hat aber eine `.Provider`-Eigenschaft, die eine Komponente ist!

### Provider mit State

Um den Context-Wert änderbar zu machen, kombinieren wir ihn mit `useState`:

```javascript
import { useState } from 'react';
import ThemeContext from './contexts/ThemeContext';

function App() {
  // State für den Context-Wert
  const [theme, setTheme] = useState('light');

  return (
    // State UND Setter als value übergeben
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
    </ThemeContext.Provider>
  );
}
```

### Visualisierung: Provider-Hierarchie

```
┌─────────────────────────────────────────────────────────────┐
│                    PROVIDER-HIERARCHIE                      │
│                                                             │
│   <ThemeContext.Provider value={{theme: 'dark', ...}}>      │
│     │                            ↑ Provider setzt Wert      │
│     ├── <Header />               ← Kann 'dark' lesen        │
│     │                                                       │
│     ├──<ThemeContext.Provider value={{theme: 'light', ...}}>│
│     │     │                      ↑ Nested Provider!         │
│     │     └── <Sidebar />        ← Liest 'light' (näher!)   │
│     │                                                       │
│     └── <Main />                 ← Liest 'dark'             │
│                                                             │
│   Jede Komponente nutzt den NÄCHSTEN Provider darüber!      │
└─────────────────────────────────────────────────────────────┘
```

### Übung 2: Provider einrichten

> **Ziel:** Einen Provider für den ThemeContext einrichten
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Der Provider den Theme-Wert bereitstellt

**Aufgabe:**

1. Öffne `src/App.jsx` und richte den Provider ein:

```javascript
// src/App.jsx

import { useState } from 'react';
import ThemeContext from './contexts/ThemeContext';

function App() {
  // Aufgabe 1: Erstelle einen State für das Theme
  // const [theme, setTheme] = useState(???);

  // Aufgabe 2: Funktion zum Umschalten des Themes
  function toggleTheme() {
    // Dein Code hier
  }

  return (
    // Aufgabe 3: Wrappe alles in ThemeContext.Provider
    // WICHTIG: Verwende .Provider und übergib { theme, setTheme }
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app">
        <h1>Context API Demo</h1>
        <p>Aktuelles Theme: {theme}</p>

        <button onClick={toggleTheme}>
          Theme wechseln
        </button>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
```

2. Der Button soll zwischen `'light'` und `'dark'` wechseln.

<details markdown>
<summary>Musterlösung anzeigen</summary>

```javascript
// src/App.jsx

import { useState } from 'react';
import ThemeContext from './contexts/ThemeContext';

function App() {
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app">
        <h1>Context API Demo</h1>
        <p>Aktuelles Theme: {theme}</p>

        <button onClick={toggleTheme}>
          Theme wechseln
        </button>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
```

> **Warum useState mit Context?**
> - Der Context selbst speichert keine Daten – er ist ein Verteilmechanismus
> - State lebt im Provider, Context verteilt ihn an alle Kinder
> - Der State-Wert wird über den Provider an alle Kinder weitergegeben
> - Wenn sich der State ändert, re-rendern alle Komponenten, die den Context nutzen

</details>

---

## Teil 3: Context mit useContext nutzen

### Der useContext Hook

Mit `useContext` liest eine Komponente den aktuellen Context-Wert:

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function ThemedButton() {
  // Context-Objekt destructuren um theme zu bekommen
  const { theme } = useContext(ThemeContext);

  return (
    <button className={`btn btn-${theme}`}>
      Ich bin {theme}!
    </button>
  );
}
```

> **Wichtig:** Da unser Context ein Objekt ist (`{ theme, setTheme }`), müssen wir destructuren: `const { theme } = useContext(ThemeContext)`

### Wie useContext funktioniert

```
┌─────────────────────────────────────────────────────────────┐
│                    useContext                               │
│                                                             │
│   const { theme } = useContext(ThemeContext);               │
│                                   │                         │
│                                   ▼                         │
│   React sucht den NÄCHSTEN ThemeContext.Provider            │
│   in der Komponenten-Hierarchie ÜBER dieser Komponente      │
│                                   │                         │
│                                   ▼                         │
│   ┌─────────────────────────────────────────────┐           │
│   │  Provider gefunden?                         │           │
│   │                                             │           │
│   │  JA  → Gibt dessen value zurück             │           │
│   │  NEIN → Gibt Default-Wert aus createContext │           │
│   └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Übung 3: Context konsumieren

> **Ziel:** useContext in Komponenten verwenden
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Deine Komponenten den Theme-Wert aus dem Context lesen

**Aufgabe:**

1. Erstelle eine Datei `src/components/ThemedBox.jsx`:

```javascript
// src/components/ThemedBox.jsx

import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function ThemedBox({ children }) {
  // Aufgabe 1: Lies das Theme aus dem Context
  // WICHTIG: Destructure, weil Context ein Objekt ist!
  // const { theme } = ???

  // Aufgabe 2: Style basierend auf dem Theme
  const style = {
    padding: '20px',
    borderRadius: '8px',
    background: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    border: `2px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    transition: 'all 0.3s ease'
  };

  return (
    <div style={style}>
      <p>Aktuelles Theme: <strong>{theme}</strong></p>
      {children}
    </div>
  );
}

export default ThemedBox;
```

2. Erstelle eine weitere Komponente `src/components/ThemedButton.jsx`:

```javascript
// src/components/ThemedButton.jsx

import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function ThemedButton({ onClick, children }) {
  // Aufgabe: Lies das Theme und style den Button entsprechend
  // const { theme } = ???

  const style = {
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: theme === 'dark' ? '#6c5ce7' : '#0984e3',
    color: '#fff',
    transition: 'all 0.3s ease'
  };

  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export default ThemedButton;
```

3. Verwende beide Komponenten in `App.jsx`:

```javascript
// In App.jsx
import ThemedBox from './components/ThemedBox';
import ThemedButton from './components/ThemedButton';

// Im return:
<ThemeContext.Provider value={{ theme, setTheme }}>
  <div className="app">
    <ThemedBox>
      <p>Diese Box passt sich dem Theme an!</p>
      <ThemedButton onClick={toggleTheme}>
        Theme wechseln
      </ThemedButton>
    </ThemedBox>
  </div>
</ThemeContext.Provider>
```

<details markdown>
<summary>Musterlösung anzeigen</summary>

**src/components/ThemedBox.jsx:**

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function ThemedBox({ children }) {
  const { theme } = useContext(ThemeContext);

  const style = {
    padding: '20px',
    borderRadius: '8px',
    background: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    border: `2px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    transition: 'all 0.3s ease'
  };

  return (
    <div style={style}>
      <p>Aktuelles Theme: <strong>{theme}</strong></p>
      {children}
    </div>
  );
}

export default ThemedBox;
```

**src/components/ThemedButton.jsx:**

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function ThemedButton({ onClick, children }) {
  const { theme } = useContext(ThemeContext);

  const style = {
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: theme === 'dark' ? '#6c5ce7' : '#0984e3',
    color: '#fff',
    transition: 'all 0.3s ease'
  };

  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export default ThemedButton;
```

**src/App.jsx:**

```javascript
import { useState } from 'react';
import ThemeContext from './contexts/ThemeContext';
import ThemedBox from './components/ThemedBox';
import ThemedButton from './components/ThemedButton';

function App() {
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div style={{
        minHeight: '100vh',
        padding: '40px',
        background: theme === 'dark' ? '#1a1a2e' : '#f5f5f5',
        transition: 'all 0.3s ease'
      }}>
        <h1 style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
          Context API Demo
        </h1>

        <ThemedBox>
          <p>Diese Box passt sich dem Theme an!</p>
          <ThemedButton onClick={toggleTheme}>
            Theme wechseln
          </ThemedButton>
        </ThemedBox>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
```

</details>

---

## Teil 4: Context änderbar machen (von tief verschachtelten Komponenten)

### Das Problem: Tief verschachtelte Komponenten

Bisher haben wir `toggleTheme` direkt in `App.jsx` aufgerufen. Aber was, wenn eine tief verschachtelte Komponente den Wert ändern soll?

```javascript
// Settings ist tief verschachtelt: App → Layout → Sidebar → Settings
function Settings() {
  const { theme } = useContext(ThemeContext);

  // Wie kann Settings das Theme ändern?
  // toggleTheme gibt es hier nicht als Prop!
}
```

### Die Lösung: setTheme ist bereits im Context!

Da wir den Context von Anfang an als Objekt mit `setTheme` definiert haben, können wir es einfach destructuren:

```javascript
function Settings() {
  // Wir holen uns SOWOHL theme ALS AUCH setTheme!
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme('light')}>Hell</button>
      <button onClick={() => setTheme('dark')}>Dunkel</button>
    </div>
  );
}
```

### Visualisierung: Context mit Setter

```
┌─────────────────────────────────────────────────────────────┐
│           CONTEXT MIT WERT UND SETTER                       │
│                                                             │
│   ThemeContext.Provider value = {                           │
│     theme: 'light',        ← Aktueller Wert (lesbar)        │
│     setTheme: function()   ← Funktion zum Ändern            │
│   }                                                         │
│                                                             │
│   ┌──────────────────────────────────────────────────┐      │
│   │  Tief verschachtelte Kind-Komponente             │      │
│   │                                                  │      │
│   │  const { theme, setTheme } = useContext(Theme);  │      │
│   │                                                  │      │
│   │  // Lesen:                                       │      │
│   │  console.log(theme);  // 'light'                 │      │
│   │                                                  │      │
│   │  // Ändern:                                      │      │
│   │  setTheme('dark');    // Aktualisiert den State  │      │
│   └──────────────────────────────────────────────────┘      │
│                                                             │
│   Der State lebt im Provider, aber alle können ihn ändern!  │
└─────────────────────────────────────────────────────────────┘
```

### Übung 4: Tief verschachtelte Komponente ändert Context

> **Ziel:** Eine tief verschachtelte Komponente soll den Context ändern können
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Ein tief verschachteltes Child den Theme-Wert ändern kann

**Aufgabe:**

1. Erstelle eine tief verschachtelte Komponente `src/components/Settings.jsx`:

```javascript
// src/components/Settings.jsx

import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Settings() {
  // Aufgabe: Destructure BEIDE: theme UND setTheme aus dem Context
  // const { ???, ??? } = useContext(ThemeContext);

  const buttonStyle = (isActive) => ({
    padding: '8px 16px',
    margin: '0 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: isActive ? '#2ecc71' : '#95a5a6',
    color: '#fff',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  return (
    <div style={{
      padding: '16px',
      background: theme === 'dark' ? '#2d2d2d' : '#ecf0f1',
      borderRadius: '8px'
    }}>
      <h3 style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
        Einstellungen
      </h3>
      <p style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
        Aktuelles Theme: <strong>{theme}</strong>
      </p>

      <div>
        {/* Aufgabe: Buttons sollen setTheme aufrufen */}
        <button
          style={buttonStyle(theme === 'light')}
          onClick={() => /* setTheme aufrufen */}
        >
          Hell
        </button>
        <button
          style={buttonStyle(theme === 'dark')}
          onClick={() => /* setTheme aufrufen */}
        >
          Dunkel
        </button>
      </div>
    </div>
  );
}

export default Settings;
```

2. Baue eine verschachtelte Struktur in `App.jsx`:

```javascript
// Erstelle diese Wrapper-Komponenten (können einfach sein)
// Layout → Main → Sidebar → Settings

<ThemeContext.Provider value={{ theme, setTheme }}>
  <Layout>
    <Header />
    <Main>
      <Sidebar>
        <Settings />  {/* Tief verschachtelt, kann aber Theme ändern! */}
      </Sidebar>
    </Main>
  </Layout>
</ThemeContext.Provider>
```

> **Hinweis:** Die Wrapper-Komponenten (Layout, Main, Sidebar) können wirklich simpel sein – sie müssen nur `{children}` rendern. Es geht hier nur darum, Tiefe in der Hierarchie zu erzeugen, um zu zeigen, dass Context diese Ebenen überspringen kann.

<details markdown>
<summary>Musterlösung anzeigen</summary>

**src/components/Settings.jsx:**

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Settings() {
  const { theme, setTheme } = useContext(ThemeContext);

  const buttonStyle = (isActive) => ({
    padding: '8px 16px',
    margin: '0 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: isActive ? '#2ecc71' : '#95a5a6',
    color: '#fff',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  return (
    <div style={{
      padding: '16px',
      background: theme === 'dark' ? '#2d2d2d' : '#ecf0f1',
      borderRadius: '8px'
    }}>
      <h3 style={{ color: theme === 'dark' ? '#fff' : '#333', marginTop: 0 }}>
        Einstellungen
      </h3>
      <p style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
        Aktuelles Theme: <strong>{theme}</strong>
      </p>

      <div>
        <button
          style={buttonStyle(theme === 'light')}
          onClick={() => setTheme('light')}
        >
          Hell
        </button>
        <button
          style={buttonStyle(theme === 'dark')}
          onClick={() => setTheme('dark')}
        >
          Dunkel
        </button>
      </div>
    </div>
  );
}

export default Settings;
```

**src/components/Layout.jsx:**

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Layout({ children }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#1a1a2e' : '#f5f5f5',
      color: theme === 'dark' ? '#fff' : '#333',
      transition: 'all 0.3s ease'
    }}>
      {children}
    </div>
  );
}

export default Layout;
```

**src/components/Header.jsx:**

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Header() {
  const { theme } = useContext(ThemeContext);

  return (
    <header style={{
      padding: '20px',
      background: theme === 'dark' ? '#16213e' : '#fff',
      borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`
    }}>
      <h1 style={{ margin: 0 }}>Meine App</h1>
    </header>
  );
}

export default Header;
```

**src/components/Main.jsx:**

```javascript
function Main({ children }) {
  return (
    <main style={{ padding: '20px' }}>
      {children}
    </main>
  );
}

export default Main;
```

**src/components/Sidebar.jsx:**

```javascript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Sidebar({ children }) {
  const { theme } = useContext(ThemeContext);

  return (
    <aside style={{
      padding: '20px',
      background: theme === 'dark' ? '#0f0f23' : '#fff',
      borderRadius: '8px',
      maxWidth: '300px'
    }}>
      <h2 style={{ marginTop: 0 }}>Sidebar</h2>
      {children}
    </aside>
  );
}

export default Sidebar;
```

**src/App.jsx:**

```javascript
import { useState } from 'react';
import ThemeContext from './contexts/ThemeContext';
import Layout from './components/Layout';
import Header from './components/Header';
import Main from './components/Main';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout>
        <Header />
        <Main>
          <p>Hauptinhalt der Seite...</p>
          <Sidebar>
            <Settings />
          </Sidebar>
        </Main>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default App;
```

> **Wichtiger Punkt:**
> Die `Settings`-Komponente ist tief verschachtelt (App → Layout → Main → Sidebar → Settings), aber sie kann trotzdem den Theme-State ändern, der in `App` lebt. Das ist die Magie von Context!

</details>

---

## Teil 5: Props vs Context - Wann was?

### Die wichtige Entscheidung

Nicht alles gehört in einen Context! Die Wahl zwischen Props und Context sollte bewusst getroffen werden.

### Vergleich auf einen Blick

```
┌──────────────────────────────────────────────────────────────┐
│                  PROPS vs CONTEXT                            │
│                                                              │
│   PROPS                          CONTEXT                     │
│   ─────                          ───────                     │
│   • Explizit                     • Implizit                  │
│   • Lokal (Parent → Child)       • Global (Ganze App)        │
│   • Klarer Vertrag               • "Magische" Abhängigkeit   │
│   • Einfach zu verstehen         • Kann verwirrend sein      │
│   • Gut für spezifische Daten    • Gut für globale Daten     │
│                                                              │
│   WANN PROPS?                    WANN CONTEXT?               │
│   ──────────                     ────────────                │
│   • Form-Daten                   • Theme (Light/Dark)        │
│   • Event-Handler                • Sprache/Locale            │
│   • Layout-Parameter             • Angemeldeter User         │
│   • Spezifische Komponentendaten • App-weite Einstellungen   │
│   • 1-2 Ebenen durchreichen      • Viele Ebenen überspringen │
└──────────────────────────────────────────────────────────────┘
```

### Typische Context-Anwendungsfälle

| Anwendungsfall | Warum Context? |
|----------------|---------------|
| **Theme (Light/Dark)** | Betrifft fast alle UI-Komponenten |
| **Angemeldeter User** | Wird in Header, Sidebar, Profil, etc. gebraucht |
| **Sprache/Locale** | Betrifft alle Texte in der App |
| **Warenkorb** | Wird in Header, Produkt-Cards, Checkout gebraucht |
| **Toast/Notifications** | Können von überall ausgelöst werden |

### Typische Props-Anwendungsfälle

| Anwendungsfall | Warum Props? |
|----------------|-------------|
| **Form-Daten** | Gehören nur zum Formular |
| **onClick Handler** | Spezifisch für diese eine Komponente |
| **children** | Komposition von Komponenten |
| **Komponenten-Konfiguration** | size, variant, disabled, etc. |
| **Listen-Items** | Jedes Item hat eigene Daten |

### Die Faustregel

```
┌─────────────────────────────────────────────────────────────┐
│                    FAUSTREGEL                               │
│                                                             │
│   Frage dich: "Wie viele Komponenten brauchen diese Daten?" │
│                                                             │
│   1-3 Komponenten, nah beieinander?    → Props              │
│   Viele Komponenten, weit verstreut?   → Context            │
│                                                             │
│   Und: "Wie oft ändern sich die Daten?"                     │
│                                                             │
│   Häufig (z.B. Formulareingaben)?      → Props              │
│   Selten (z.B. User Login)?            → Context            │
└─────────────────────────────────────────────────────────────┘
```

### Wissensfrage 2

Für welche dieser Daten würdest du Context verwenden?

A) Die Items einer Todo-Liste
B) Der aktuell angemeldete Benutzer
C) Der `onChange`-Handler eines Input-Felds
D) Die gewählte Farbpalette der App
E) Die Breite eines bestimmten Containers

<details markdown>
<summary>Antwort anzeigen</summary>

**Context:** B und D

- **B) Angemeldeter Benutzer:** Wird in vielen Komponenten gebraucht (Header, Profil, Berechtigungen)
- **D) Farbpalette:** Betrifft das Styling der gesamten App

**Props:** A, C und E

- **A) Todo-Items:** Gehören zur Todo-Komponente, werden als Props an TodoItem übergeben
- **C) onChange-Handler:** Spezifisch für ein Input-Feld
- **E) Container-Breite:** Spezifische Konfiguration einer einzelnen Komponente

</details>

---

## Teil 6: Praxis - Theme-Switcher (Dark/Light Mode)

Zeit für ein vollständiges Projekt!

> **Upgrade: Provider-Pattern**
>
> Ab jetzt wechseln wir auf das **Provider-Pattern** – ein Best-Practice-Ansatz in echten React-Projekten. Die Änderungen:
>
> 1. **Default-Wert wird `null`** statt einem Objekt – so siehst du sofort einen Fehler, wenn du den Provider vergisst
> 2. **Custom Hook mit Fehlerprüfung** – `useTheme()` wirft einen klaren Fehler, wenn kein Provider vorhanden ist
> 3. **Alles in einer Datei** – Context, Provider und Hook gehören zusammen
>
> Das ist kein Widerspruch zu Teil 1–4, sondern ein Upgrade für produktionsreife Apps!

> **Ziel:** Einen kompletten Theme-Switcher mit Context implementieren
> **Zeitbedarf:** ca. 35 Minuten
> **Du bist fertig, wenn:** Die gesamte App zwischen Light und Dark Mode wechselt

### Aufgabe: Vollständiger Theme-Switcher

Baue eine App mit:

1. **ThemeContext** - Speichert `theme`, `setTheme` und `toggleTheme`
2. **ThemeProvider** - Wrapper-Komponente mit der Logik
3. **useTheme** - Custom Hook für einfacheren Zugriff
4. **Mehrere Themed Components** - Die das Theme nutzen

**Dateistruktur:**

```
src/
├── contexts/
│   └── ThemeContext.jsx      # Context + Provider + Hook
├── components/
│   ├── ThemeToggle.jsx       # Button zum Umschalten
│   ├── Card.jsx              # Themed Card
│   └── Navbar.jsx            # Themed Navigation
└── App.jsx
```

### Schritt 1: Context mit Provider und Hook

```javascript
// src/contexts/ThemeContext.jsx

import { createContext, useContext, useState } from 'react';

// 1. Context erstellen
const ThemeContext = createContext(null);

// 2. Provider-Komponente mit Logik
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  // Wert, der allen Kindern zur Verfügung steht
  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom Hook für einfachen Zugriff
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme muss innerhalb eines ThemeProviders verwendet werden');
  }

  return context;
}
```

> **Best Practice: Provider-Pattern**
>
> Das Muster, das wir hier verwenden, ist ein gängiges Pattern:
> 1. **Context** - Definiert die Datenstruktur
> 2. **Provider** - Komponente, die die Logik kapselt
> 3. **Custom Hook** - Vereinfacht den Zugriff und fügt Fehlerbehandlung hinzu
>
> Dieses Pattern macht den Code sauberer und leichter wartbar.

> **Performance-Hinweis für größere Apps:**
> In echten Projekten würde man das `value`-Objekt oft mit `useMemo` memoisieren, um unnötige Re-Renders zu vermeiden:
> ```javascript
> const value = useMemo(() => ({
>   theme,
>   setTheme,
>   toggleTheme,
>   isDark: theme === 'dark'
> }), [theme]);
> ```
> Für diese Übung ist das nicht nötig, aber gut zu wissen!

### Schritt 2: Themed Components erstellen

```javascript
// src/components/ThemeToggle.jsx

import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        background: isDark ? '#f1c40f' : '#2c3e50',
        color: isDark ? '#2c3e50' : '#f1c40f',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {isDark ? '☀️' : '🌙'}
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

export default ThemeToggle;
```

```javascript
// src/components/Card.jsx

import { useTheme } from '../contexts/ThemeContext';

function Card({ title, children }) {
  const { isDark } = useTheme();

  return (
    <div style={{
      padding: '20px',
      borderRadius: '12px',
      background: isDark ? '#2d3436' : '#fff',
      color: isDark ? '#dfe6e9' : '#2d3436',
      boxShadow: isDark
        ? '0 4px 6px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      transition: 'all 0.3s ease'
    }}>
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {children}
    </div>
  );
}

export default Card;
```

```javascript
// src/components/Navbar.jsx

import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

function Navbar() {
  const { isDark } = useTheme();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      background: isDark ? '#1e272e' : '#fff',
      borderBottom: `1px solid ${isDark ? '#485460' : '#ddd'}`,
      transition: 'all 0.3s ease'
    }}>
      <h1 style={{
        margin: 0,
        color: isDark ? '#fff' : '#2d3436',
        fontSize: '24px'
      }}>
        MyApp
      </h1>
      <ThemeToggle />
    </nav>
  );
}

export default Navbar;
```

### Schritt 3: App zusammenbauen

```javascript
// src/App.jsx

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Card from './components/Card';

// Separater Content-Bereich, der useTheme nutzt
function AppContent() {
  const { isDark } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0f0f23' : '#f5f6fa',
      transition: 'all 0.3s ease'
    }}>
      <Navbar />

      <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card title="Willkommen!">
          <p>Diese App verwendet die Context API für das Theme-Management.</p>
          <p>Klicke auf den Button oben rechts, um zwischen Light und Dark Mode zu wechseln.</p>
        </Card>

        <Card title="Wie es funktioniert">
          <ol style={{ paddingLeft: '20px' }}>
            <li>Ein <strong>ThemeContext</strong> speichert den aktuellen Theme-Status</li>
            <li>Der <strong>ThemeProvider</strong> wrapt die gesamte App</li>
            <li>Jede Komponente kann mit <strong>useTheme()</strong> auf das Theme zugreifen</li>
            <li>Änderungen am Theme aktualisieren automatisch alle Komponenten</li>
          </ol>
        </Card>

        <Card title="Vorteile">
          <ul style={{ paddingLeft: '20px' }}>
            <li>Kein Prop Drilling nötig</li>
            <li>Zentrale Theme-Logik</li>
            <li>Einfach erweiterbar</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
```

<details markdown>
<summary>Vollständige Musterlösung anzeigen</summary>

Die Lösung entspricht dem Code oben. Hier noch die CSS-Datei für zusätzliches Styling:

**src/App.css:**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
}

/* Smooth transitions für alles */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

</details>

---

## Teil 7: Praxis - User-Authentifizierung

Ein weiteres wichtiges Beispiel!

> **Ziel:** Einen UserContext für Authentifizierung implementieren
> **Zeitbedarf:** ca. 40 Minuten
> **Du bist fertig, wenn:** Du Login/Logout-Funktionalität mit Context hast

### Aufgabe: User-Authentifizierung

Baue ein Authentifizierungssystem mit:

1. **UserContext** - Speichert den aktuellen Benutzer (oder `null`)
2. **UserProvider** - Mit `login` und `logout` Funktionen
3. **useUser** - Custom Hook für Zugriff
4. **Komponenten:**
   - `LoginForm` - Formular zum Einloggen
   - `UserBadge` - Zeigt angemeldeten User oder Login-Button
   - `ProtectedContent` - Wird nur angezeigt, wenn eingeloggt

**Dateistruktur:**

```
src/
├── contexts/
│   └── UserContext.jsx       # Context + Provider + Hook
├── components/
│   ├── LoginForm.jsx         # Login-Formular
│   ├── UserBadge.jsx         # User-Anzeige in der Navbar
│   └── ProtectedContent.jsx  # Geschützter Bereich
└── App.jsx
```

### Starter-Code

**src/contexts/UserContext.jsx:**

```javascript
// src/contexts/UserContext.jsx

import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // null = nicht eingeloggt
  const [user, setUser] = useState(null);

  // Aufgabe 1: Login-Funktion implementieren
  // Sie soll username und role entgegennehmen und den user setzen
  function login(username, role = 'User') {
    // Dein Code hier
    // Setze user auf ein Objekt mit name, role und loginTime
  }

  // Aufgabe 2: Logout-Funktion implementieren
  function logout() {
    // Dein Code hier
  }

  const value = {
    user,
    login,
    logout,
    isLoggedIn: user !== null
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error('useUser muss innerhalb eines UserProviders verwendet werden');
  }

  return context;
}
```

**src/components/LoginForm.jsx:**

```javascript
// src/components/LoginForm.jsx

import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('User');

  // Aufgabe 3: useUser Hook verwenden und login aufrufen
  const { login } = useUser();

  function handleSubmit(e) {
    e.preventDefault();
    if (username.trim() === '') return;

    // Aufgabe 4: Login durchführen
    login(username, role);

    setUsername('');
  }

  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '100%',
    marginBottom: '12px'
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '300px',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginTop: 0 }}>Login</h3>

      <input
        type="text"
        placeholder="Benutzername"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={inputStyle}
      >
        <option value="User">User</option>
        <option value="Admin">Admin</option>
        <option value="Moderator">Moderator</option>
      </select>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '10px',
          background: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Einloggen
      </button>
    </form>
  );
}

export default LoginForm;
```

**src/components/UserBadge.jsx:**

```javascript
// src/components/UserBadge.jsx

import { useUser } from '../contexts/UserContext';

function UserBadge() {
  // Aufgabe 5: user, logout und isLoggedIn aus dem Context holen
  const { user, logout, isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return (
      <span style={{ color: '#95a5a6' }}>
        Nicht eingeloggt
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div>
        <strong>{user.name}</strong>
        <span style={{
          marginLeft: '8px',
          padding: '2px 8px',
          background: user.role === 'Admin' ? '#e74c3c' : '#3498db',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#fff'
        }}>
          {user.role}
        </span>
      </div>
      <button
        onClick={logout}
        style={{
          padding: '6px 12px',
          background: '#95a5a6',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default UserBadge;
```

**src/components/ProtectedContent.jsx:**

```javascript
// src/components/ProtectedContent.jsx

import { useUser } from '../contexts/UserContext';
import LoginForm from './LoginForm';

function ProtectedContent() {
  const { user, isLoggedIn } = useUser();

  // Aufgabe 6: Wenn nicht eingeloggt, zeige LoginForm
  // Wenn eingeloggt, zeige den geschützten Inhalt

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Zugriff verweigert</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Bitte logge dich ein, um diesen Inhalt zu sehen.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Geschützter Bereich</h2>
      <p>
        Hallo <strong>{user.name}</strong>!
        Du bist als <strong>{user.role}</strong> eingeloggt.
      </p>
      <p style={{ color: '#666' }}>
        Login-Zeit: {user.loginTime}
      </p>
      <p>Dieser Inhalt ist nur für angemeldete Benutzer sichtbar.</p>

      {/* Bonus: Zeige Admin-Content nur für Admins */}
      {user.role === 'Admin' && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#e74c3c',
          color: '#fff',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>Admin-Bereich</h3>
          <p>Dieser Bereich ist nur für Administratoren sichtbar.</p>
          <ul>
            <li>Benutzer verwalten</li>
            <li>Einstellungen ändern</li>
            <li>Logs einsehen</li>
          </ul>
        </div>
      )}

      {user.role === 'Moderator' && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#9b59b6',
          color: '#fff',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>Moderator-Bereich</h3>
          <p>Dieser Bereich ist nur für Moderatoren sichtbar.</p>
        </div>
      )}
    </div>
  );
}

export default ProtectedContent;
```

<details markdown>
<summary>Vollständige Musterlösung anzeigen</summary>

**src/contexts/UserContext.jsx:**

```javascript
import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(username, role = 'User') {
    setUser({
      name: username,
      role: role,
      loginTime: new Date().toLocaleTimeString()
    });
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    login,
    logout,
    isLoggedIn: user !== null
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error('useUser muss innerhalb eines UserProviders verwendet werden');
  }

  return context;
}
```

**src/App.jsx:**

```javascript
import { UserProvider } from './contexts/UserContext';
import UserBadge from './components/UserBadge';
import ProtectedContent from './components/ProtectedContent';

function App() {
  return (
    <UserProvider>
      <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
        {/* Navbar */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #ddd'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>MyApp</h1>
          <UserBadge />
        </nav>

        {/* Main Content */}
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
          <ProtectedContent />
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
```

</details>

---

## Zusammenfassung

### Was du heute gelernt hast

| Konzept | Beschreibung | Beispiel |
|---------|--------------|----------|
| **Prop Drilling** | Problem: Daten durch viele Ebenen durchreichen | Header → Nav → Menu |
| **createContext** | Context-Objekt erstellen | `createContext({theme: 'light', setTheme: () => {}})` |
| **Provider** | Wert für Komponenten bereitstellen | `<Context.Provider value={...}>` |
| **useContext** | Wert aus Context lesen | `const { theme } = useContext(ThemeContext)` |
| **Custom Hook** | Vereinfacht Context-Zugriff | `useTheme()`, `useUser()` |

### Context API auf einen Blick

```javascript
// 1. Context erstellen (als Objekt für Konsistenz)
const MyContext = createContext({
  value: null,
  setValue: () => {}
});

// 2. Provider mit State
function MyProvider({ children }) {
  const [value, setValue] = useState(initialValue);

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

// 3. Custom Hook
function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext muss innerhalb MyProvider verwendet werden');
  }
  return context;
}

// 4. Verwenden
function App() {
  return (
    <MyProvider>
      <ChildComponent />
    </MyProvider>
  );
}

function ChildComponent() {
  const { value, setValue } = useMyContext();
  // ...
}
```

### Props vs Context - Schnellreferenz

```
┌──────────────────┬─────────────────────┬─────────────────────┐
│ Kriterium        │ Props               │ Context             │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Datenfluss       │ Explizit            │ Implizit            │
│ Reichweite       │ Parent → Child      │ Ganze Teilbäume     │
│ Änderungshäufig. │ Häufig okay         │ Selten besser       │
│ Anwendung        │ Komponentendaten    │ Globale Einstellung │
│ Beispiele        │ onClick, children   │ Theme, User, Locale │
└──────────────────┴─────────────────────┴─────────────────────┘
```

### Wichtige Regeln

1. **Provider-Syntax:** Immer `<Context.Provider>`, nicht `<Context>`!
2. **Nicht alles in Context packen** – Nur wirklich globale Daten
3. **Custom Hooks verwenden** – Für sauberen, wiederverwendbaren Code
4. **Fehlerbehandlung** – Prüfen, ob Provider vorhanden ist
5. **Performance beachten** – Context-Änderungen rendern alle Consumer neu

---

## Typische Fehler & Debugging

Wenn etwas nicht funktioniert, hier die häufigsten Ursachen:

| Fehlermeldung | Ursache | Lösung |
|---------------|---------|--------|
| `Cannot destructure property 'theme' of null` | Provider fehlt oder falscher Import-Pfad | Prüfe, ob `<Context.Provider>` die Komponente wrappt |
| `useTheme must be used within ThemeProvider` | Komponente liegt außerhalb des Providers | Verschiebe den Provider weiter nach oben (z.B. in `App.jsx`) |
| `theme is undefined` | Destructuring vergessen oder falscher Context | Prüfe: `const { theme } = useContext(...)` statt `const theme = ...` |
| Keine Änderung beim Klicken | `setTheme` nicht im Context-Value | Prüfe, ob `value={{ theme, setTheme }}` beide enthält |
| `ThemeContext is not defined` | Import vergessen | Füge `import ThemeContext from '...'` hinzu |

> **Debugging-Tipp:** Füge `console.log('Context value:', useContext(ThemeContext))` ein, um zu sehen, was der Context tatsächlich enthält.

---

## Checkliste

Bevor du mit der nächsten Übung weitermachst, stelle sicher:

- [ ] Du verstehst das Prop Drilling Problem
- [ ] Du kannst mit `createContext` einen Context erstellen
- [ ] Du weißt, dass man `<Context.Provider>` verwenden muss (nicht `<Context>`)
- [ ] Du kannst mit `useContext` Werte aus dem Context lesen
- [ ] Du kannst den Context änderbar machen (mit Setter-Funktion im value-Objekt)
- [ ] Du verstehst, wann Props und wann Context die bessere Wahl ist
- [ ] Du kannst einen Custom Hook für deinen Context erstellen
- [ ] Du hast den Theme-Switcher implementiert
- [ ] Du hast die User-Authentifizierung implementiert

**Alles abgehakt?** Du beherrschst die React Context API!

---

## Bonus: Weiterführende Themen

Wenn du mehr lernen möchtest:

1. **Mehrere Contexts kombinieren:** Verschachtele mehrere Provider
2. **Context mit useReducer:** Für komplexere State-Logik
3. **Performance-Optimierung:** `useMemo` für Context-Values
4. **Testing:** Contexts in Tests mocken

### Weiterführende Ressourcen

- [React Docs: useContext](https://react.dev/reference/react/useContext)
- [React Docs: Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React Docs: Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
