---
title: React Cheat Sheet
tags:
  - React
  - Cheat-Sheet
---

# React Cheat Sheet

Kompakte Referenz fuer die wichtigsten React-Konzepte und -Patterns.

---

## Komponenten

```jsx
// Functional Component (Standard)
function Begruessung({ name }) {
    return (
        <div>
            <h1>Hallo, {name}!</h1>
        </div>
    );
}

// Als Arrow Function
const Begruessung = ({ name }) => {
    return (
        <div>
            <h1>Hallo, {name}!</h1>
        </div>
    );
};

// Verwendung
<Begruessung name="Max" />
```

---

## JSX Regeln

```jsx
// 1. Nur EIN Root-Element (oder Fragment)
return (
    <div>
        <h1>Titel</h1>
        <p>Text</p>
    </div>
);

// Fragment (kein zusaetzliches DOM-Element)
return (
    <>
        <h1>Titel</h1>
        <p>Text</p>
    </>
);

// 2. className statt class
<div className="container">Inhalt</div>

// 3. htmlFor statt for
<label htmlFor="email">E-Mail</label>

// 4. Selbstschliessende Tags
<img src="bild.jpg" alt="Beschreibung" />
<input type="text" />

// 5. JavaScript-Ausdruecke in geschweiften Klammern
const name = "Max";
<h1>{name.toUpperCase()}</h1>
<p>{2 + 2}</p>
<p>{istAktiv ? "Ja" : "Nein"}</p>

// 6. Inline-Styles als Objekt
<div style={{ color: "red", fontSize: "16px" }}>Text</div>
```

---

## Props

```jsx
// Props empfangen (mit Destructuring)
function ProduktKarte({ name, preis, bild, onKlick }) {
    return (
        <div className="karte" onClick={onKlick}>
            <img src={bild} alt={name} />
            <h2>{name}</h2>
            <p>{preis.toFixed(2)} EUR</p>
        </div>
    );
}

// Props mit Standardwerten
function Button({ text = "Klick mich", variante = "primary", onClick }) {
    return (
        <button className={`btn btn-${variante}`} onClick={onClick}>
            {text}
        </button>
    );
}

// Children-Prop
function Karte({ titel, children }) {
    return (
        <div className="karte">
            <h2>{titel}</h2>
            <div className="karte-inhalt">{children}</div>
        </div>
    );
}

// Verwendung mit Children
<Karte titel="Willkommen">
    <p>Das ist der Inhalt der Karte.</p>
    <button>Mehr erfahren</button>
</Karte>
```

---

## useState

```jsx
import { useState } from "react";

function Zaehler() {
    // [wert, setterFunktion] = useState(startwert)
    const [zaehler, setZaehler] = useState(0);
    const [name, setName] = useState("");
    const [liste, setListe] = useState([]);
    const [formular, setFormular] = useState({
        email: "",
        passwort: "",
    });

    return (
        <div>
            {/* Einfacher Wert */}
            <p>Zaehler: {zaehler}</p>
            <button onClick={() => setZaehler(zaehler + 1)}>+1</button>
            <button onClick={() => setZaehler(prev => prev - 1)}>-1</button>

            {/* Eingabefeld */}
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            {/* Array aktualisieren (immer neues Array!) */}
            <button onClick={() => setListe([...liste, "Neu"])}>
                Hinzufuegen
            </button>
            <button onClick={() => setListe(liste.filter((_, i) => i !== 0))}>
                Erstes entfernen
            </button>

            {/* Objekt aktualisieren (immer neues Objekt!) */}
            <input
                value={formular.email}
                onChange={(e) => setFormular({
                    ...formular,
                    email: e.target.value,
                })}
            />
        </div>
    );
}
```

!!! warning "State niemals direkt aendern"
    ```jsx
    // FALSCH - State direkt aendern
    liste.push("Neu");
    setListe(liste);

    // RICHTIG - Neues Array/Objekt erstellen
    setListe([...liste, "Neu"]);
    ```

---

## useEffect

```jsx
import { useState, useEffect } from "react";

function BenutzerProfil({ userId }) {
    const [benutzer, setBenutzer] = useState(null);
    const [laden, setLaden] = useState(true);

    // Bei jedem Render ausfuehren (selten noetig)
    useEffect(() => {
        console.log("Komponente wurde gerendert");
    });

    // Nur beim ersten Render (Mount)
    useEffect(() => {
        console.log("Komponente wurde eingebunden");
    }, []);

    // Wenn sich eine Abhaengigkeit aendert
    useEffect(() => {
        async function datenLaden() {
            setLaden(true);
            try {
                const res = await fetch(`/api/users/${userId}`);
                const daten = await res.json();
                setBenutzer(daten);
            } catch (fehler) {
                console.error(fehler);
            } finally {
                setLaden(false);
            }
        }
        datenLaden();
    }, [userId]); // Wird bei Aenderung von userId erneut ausgefuehrt

    // Cleanup-Funktion (bei Unmount oder vor erneutem Aufruf)
    useEffect(() => {
        const timer = setInterval(() => {
            console.log("Tick");
        }, 1000);

        return () => {
            clearInterval(timer); // Aufraeumen
        };
    }, []);

    if (laden) return <p>Lade...</p>;
    if (!benutzer) return <p>Benutzer nicht gefunden</p>;

    return <h1>{benutzer.name}</h1>;
}
```

| Dependency Array | Wann wird der Effect ausgefuehrt? |
|---|---|
| Nicht angegeben | Nach **jedem** Render |
| `[]` | Nur beim **ersten** Render (Mount) |
| `[a, b]` | Beim Mount und wenn sich `a` oder `b` aendert |

---

## Conditional Rendering

```jsx
function StatusAnzeige({ istAngemeldet, istAdmin, nachrichten }) {
    // Mit if/else (vor dem return)
    if (!istAngemeldet) {
        return <p>Bitte anmelden</p>;
    }

    return (
        <div>
            {/* Mit Ternary-Operator */}
            <p>{istAdmin ? "Admin-Bereich" : "Benutzer-Bereich"}</p>

            {/* Mit logischem UND (nur anzeigen wenn true) */}
            {nachrichten.length > 0 && (
                <span>{nachrichten.length} neue Nachrichten</span>
            )}

            {/* Mehrere Bedingungen */}
            {istAdmin && <button>Benutzer verwalten</button>}
        </div>
    );
}
```

---

## Listen rendern

```jsx
function AufgabenListe() {
    const [aufgaben, setAufgaben] = useState([
        { id: 1, text: "React lernen", erledigt: false },
        { id: 2, text: "Projekt starten", erledigt: true },
        { id: 3, text: "Tests schreiben", erledigt: false },
    ]);

    const toggleErledigt = (id) => {
        setAufgaben(aufgaben.map(aufgabe =>
            aufgabe.id === id
                ? { ...aufgabe, erledigt: !aufgabe.erledigt }
                : aufgabe
        ));
    };

    const loeschen = (id) => {
        setAufgaben(aufgaben.filter(aufgabe => aufgabe.id !== id));
    };

    return (
        <ul>
            {aufgaben.map(aufgabe => (
                <li key={aufgabe.id}>
                    <span
                        style={{
                            textDecoration: aufgabe.erledigt
                                ? "line-through"
                                : "none"
                        }}
                        onClick={() => toggleErledigt(aufgabe.id)}
                    >
                        {aufgabe.text}
                    </span>
                    <button onClick={() => loeschen(aufgabe.id)}>X</button>
                </li>
            ))}
        </ul>
    );
}
```

!!! danger "key-Prop nicht vergessen"
    Jedes Element in einer Liste benoetigt eine eindeutige `key`-Prop. Verwende eine stabile ID, **nicht** den Array-Index.

    ```jsx
    // FALSCH - Index als Key
    {aufgaben.map((aufgabe, index) => (
        <li key={index}>{aufgabe.text}</li>
    ))}

    // RICHTIG - Eindeutige ID als Key
    {aufgaben.map(aufgabe => (
        <li key={aufgabe.id}>{aufgabe.text}</li>
    ))}
    ```

---

## Event Handling

```jsx
function Formular() {
    const [eingabe, setEingabe] = useState("");

    // Click-Event
    const handleKlick = () => {
        console.log("Geklickt!");
    };

    // Event-Objekt verwenden
    const handleAendern = (event) => {
        setEingabe(event.target.value);
    };

    // Formular absenden
    const handleAbsenden = (event) => {
        event.preventDefault();
        console.log("Abgesendet:", eingabe);
    };

    // Parameter uebergeben
    const handleLoeschen = (id) => {
        console.log("Loesche:", id);
    };

    return (
        <form onSubmit={handleAbsenden}>
            <input value={eingabe} onChange={handleAendern} />
            <button type="submit">Absenden</button>
            <button type="button" onClick={handleKlick}>Klick</button>
            <button type="button" onClick={() => handleLoeschen(42)}>
                Loeschen
            </button>
        </form>
    );
}
```

---

## React Router

```jsx
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    useNavigate,
    useParams,
} from "react-router-dom";

// App mit Router
function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Start</Link>
                <Link to="/about">Ueber uns</Link>
                <NavLink
                    to="/kontakt"
                    className={({ isActive }) =>
                        isActive ? "aktiv" : ""
                    }
                >
                    Kontakt
                </NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<Startseite />} />
                <Route path="/about" element={<UeberUns />} />
                <Route path="/users/:userId" element={<BenutzerDetail />} />
                <Route path="*" element={<NichtGefunden />} />
            </Routes>
        </BrowserRouter>
    );
}

// URL-Parameter auslesen
function BenutzerDetail() {
    const { userId } = useParams();
    return <h1>Benutzer: {userId}</h1>;
}

// Programmatisch navigieren
function LoginFormular() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        // ... Login-Logik
        navigate("/dashboard");          // Weiterleitung
        navigate("/dashboard", { replace: true }); // Ohne History-Eintrag
    };

    return <button onClick={handleLogin}>Anmelden</button>;
}
```

---

## Context API

```jsx
import { createContext, useContext, useState } from "react";

// 1. Context erstellen
const ThemeContext = createContext();

// 2. Provider-Komponente
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("hell");

    const toggleTheme = () => {
        setTheme(prev => (prev === "hell" ? "dunkel" : "hell"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// 3. Custom Hook (Best Practice)
function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme muss innerhalb von ThemeProvider verwendet werden");
    }
    return context;
}

// 4. In Komponenten verwenden
function ThemeButton() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme}>
            Aktuell: {theme}
        </button>
    );
}

// 5. Provider in der App einbinden
function App() {
    return (
        <ThemeProvider>
            <ThemeButton />
        </ThemeProvider>
    );
}
```

---

## Projekt-Setup mit Vite

```bash
# Neues React-Projekt erstellen
npm create vite@latest mein-projekt -- --template react

# In das Projektverzeichnis wechseln
cd mein-projekt

# Abhaengigkeiten installieren
npm install

# Haeufige Zusatzpakete
npm install react-router-dom    # Routing
npm install axios               # HTTP-Client

# Entwicklungsserver starten
npm run dev

# Fuer Produktion bauen
npm run build

# Build testen
npm run preview
```

### Projektstruktur

```
mein-projekt/
├── public/              # Statische Dateien
├── src/
│   ├── assets/          # Bilder, Fonts, etc.
│   ├── components/      # Wiederverwendbare Komponenten
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Button.jsx
│   ├── pages/           # Seitenkomponenten
│   │   ├── Home.jsx
│   │   └── About.jsx
│   ├── hooks/           # Custom Hooks
│   ├── context/         # Context Provider
│   ├── App.jsx          # Hauptkomponente
│   ├── App.css          # Globale Styles
│   └── main.jsx         # Einstiegspunkt
├── index.html
├── package.json
└── vite.config.js
```
