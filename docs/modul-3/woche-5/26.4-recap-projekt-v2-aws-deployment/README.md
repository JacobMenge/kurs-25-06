# Mini-Hub V2 - React Recap Projekt

Das ist die vollständige Version 2 des Mini-Hub Projekts mit allen implementierten Features aus Übung 26.3.

## Implementierte Features

### Feature 1: Textsuche
- Live-Filterung nach Titel (ohne Button)
- Case-insensitive Suche
- Bonus: Auch in Tags wird gesucht
- "Keine Ergebnisse"-Anzeige wenn Filter keine Treffer hat

### Feature 2: Tag-Filter
- Clickable Tag-Filter Buttons oberhalb der Liste
- Ein Klick auf einen Tag filtert die Liste
- "Alle" Button zum Zurücksetzen
- Filter kombinierbar mit Textsuche (AND-Logik)

### Feature 3: Item bearbeiten
- "Bearbeiten" Button in jeder Card
- Edit-Modus zeigt Formular statt normaler Anzeige
- Formular vorbefüllt mit aktuellen Werten
- "Speichern" übernimmt Änderungen (auch mit Ctrl+Enter)
- "Abbrechen" verwirft Änderungen (auch mit Escape)
- localStorage wird korrekt aktualisiert

### Feature 4: Custom Hook useLocalStorageState
- Wiederverwendbarer Hook für localStorage-Synchronisation
- Interface: `const [items, setItems] = useLocalStorageState('key', initialValue)`
- Lazy Initialization für Performance
- Automatische Persistierung bei Änderungen

## Projektstruktur

```
26.4-recap-projekt-v2-aws-deployment/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Kopfzeile mit Item-Anzahl
│   │   ├── SearchBar.jsx      # Suchfeld (Feature 1)
│   │   ├── TagFilter.jsx      # Tag-Filter Buttons (Feature 2)
│   │   ├── ItemForm.jsx       # Formular für neue Items
│   │   ├── ItemList.jsx       # Listen-Komponente
│   │   └── ItemCard.jsx       # Item-Karte mit Edit-Modus (Feature 3)
│   ├── hooks/
│   │   └── useLocalStorageState.js  # Custom Hook (Feature 4)
│   ├── utils/
│   │   └── storage.js         # localStorage Hilfsfunktionen
│   ├── data/
│   │   └── seedItems.js       # Demo-Daten
│   ├── App.jsx                # Hauptkomponente
│   ├── App.css                # Styles
│   ├── index.css              # Globale Styles
│   └── main.jsx               # Entry Point
├── docs/
│   └── uebung-26.4-aws-deployment.md  # AWS Deployment Anleitung
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation & Start

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Build testen
npm run preview
```

## Übung

Die Hauptübung für diesen Tag ist das Deployment der App auf AWS.
Siehe `docs/uebung-26.4-aws-deployment.md` für die vollständige Anleitung.

## Technologien

- React 18
- Vite 6
- Plain CSS
- localStorage für Datenpersistenz
