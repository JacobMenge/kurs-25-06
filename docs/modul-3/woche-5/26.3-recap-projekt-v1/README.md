# React Recap Mini-Hub

Ein React-Projekt zum Wiederholen und Vertiefen der React-Grundlagen.

## Projekt-Beschreibung

Mini-Hub ist eine einfache Bookmark/Link-Verwaltung. Du kannst:
- Links mit Titel, URL und Tags speichern
- Notizen ohne URL anlegen
- Items als Favoriten markieren
- Daten werden im localStorage persistiert

## Technologien

- React 18
- Vite
- Plain CSS (keine UI-Library)
- localStorage für Persistenz

## Schnellstart

```bash
# Repository klonen oder herunterladen
cd react-recap-mini-hub

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann unter `http://localhost:5173`

## Projektstruktur

```
src/
├── components/
│   ├── Header.jsx      # App-Header mit Titel und Item-Anzahl
│   ├── ItemCard.jsx    # Einzelnes Item als Card
│   ├── ItemForm.jsx    # Formular zum Hinzufügen neuer Items
│   └── ItemList.jsx    # Liste aller Items mit Empty-State
├── data/
│   └── seedItems.js    # Demo-Daten für den ersten Start
├── utils/
│   └── storage.js      # localStorage Helper-Funktionen
├── App.jsx             # Hauptkomponente mit State-Management
├── App.css             # Alle Styles der App
├── index.css           # Globale Styles und CSS-Reset
└── main.jsx            # Entry Point
```

## Datenmodell

Jedes Item hat folgende Struktur:

```javascript
{
  id: string,           // Eindeutige ID (crypto.randomUUID())
  title: string,        // Titel (Pflichtfeld)
  url: string,          // URL (optional)
  tags: string[],       // Tags (optional, z.B. ['react', 'docs'])
  favorite: boolean,    // Favorit-Status
  createdAt: string     // ISO Timestamp
}
```

## Features (v1 - Basis)

- [x] Items als Cards anzeigen
- [x] Neues Item hinzufügen (Formular mit Validierung)
- [x] Item löschen
- [x] Favorit togglen (Stern-Symbol)
- [x] localStorage Persistenz
- [x] Empty State

## Übungen (Nachmittag)

Die Nachmittags-Übungen findest du in `docs/02_tasks_day1.md`:

1. **Suche** - Textfilter für Items implementieren
2. **Tag-Filter** - Nach Tags filtern
3. **Edit** - Items bearbeiten
4. **Custom Hook** (Bonus) - localStorage-Logik extrahieren

Lösungen findest du im `solutions/` Ordner.

## Hilfe & Troubleshooting

### Problem: localStorage wird nicht geladen

Prüfe die Browser-Konsole (F12) auf Fehler. Falls Daten korrupt sind:

```javascript
// In Browser-Konsole ausführen
localStorage.removeItem('mini-hub-items')
```

Dann Seite neu laden - die Seed-Daten werden verwendet.

### Problem: npm install schlägt fehl

Stelle sicher, dass Node.js >= 18 installiert ist:

```bash
node -v
```

### Problem: App zeigt leere Seite

1. Prüfe die Konsole auf Fehler
2. Stelle sicher, dass der Dev-Server läuft (`npm run dev`)
3. Lösche den Browser-Cache und lade neu

## Lernziele

Dieses Projekt deckt folgende React-Konzepte ab:

- **Komponenten**: Funktionale Komponenten, Props, Komposition
- **State**: useState, State-Updates, Arrays im State
- **Side Effects**: useEffect für localStorage-Sync
- **Events**: onClick, onChange, onSubmit, preventDefault
- **Controlled Components**: Formulare mit State
- **Conditional Rendering**: Empty States, bedingte Anzeige
- **Listen**: map(), Keys, Array-Methoden (filter, map)
- **Projektstruktur**: Komponenten-Organisation, Utils, Data

## Nächste Schritte (Tag 2)

- Deployment auf einem Server
- Umgebungsvariablen
- Build-Prozess verstehen
