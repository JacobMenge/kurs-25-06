---
title: "26.3 – React Recap Mini-Hub - Nachmittags-Übungen (Tag 1)"
tags:
  - React
  - Context-API
  - AWS
  - Deployment
---
# React Recap Mini-Hub - Nachmittags-Übungen (Tag 1)

## Übersicht

Willkommen zur Nachmittags-Session! Du hast heute Morgen das Basis-Projekt kennengelernt und die wichtigsten React-Konzepte aufgefrischt. Jetzt erweiterst du das Projekt um praktische Features und vertiefst dabei dein Verständnis.

In dieser Übung lernst du:
- **Textfilter/Suche** - Items nach Titel durchsuchen (Derived State)
- **Tag-Filter** - Items nach Tags filtern (kombinierte Filter)
- **Edit-Funktion** - Bestehende Items bearbeiten (Conditional Rendering, Form State)
- **Custom Hooks** - Wiederverwendbare Logik extrahieren

Diese Übung baut auf den React-Grundlagen auf – stelle sicher, dass du `useState`, `useEffect`, und Controlled Components verstanden hast!

---

## Inhaltsverzeichnis

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Übung 1** | Suche (Textfilter) | 30-40 min |
| **Übung 2** | Tag-Filter | 25-35 min |
| **Übung 3** | Item bearbeiten | 35-45 min |
| **Übung 4** | Custom Hook (Bonus) | 20-30 min |
| | **Gesamt** | **ca. 2-2,5 Stunden** |

### Minimalpfad (wenn du wenig Zeit hast)

**In 60-90 Minuten die wichtigsten Konzepte:**

1. **Übung 1** - Suche - *Filterlogik & Derived State verstehen*
2. **Übung 3** - Item bearbeiten - *Conditional Rendering & State-Management*

---

## Voraussetzungen & Setup

**Bevor du startest:**

1. Du hast das Basis-Projekt `react-recap-mini-hub` geklont/heruntergeladen
2. Dependencies sind installiert (`npm install`)
3. Der Dev-Server läuft (`npm run dev`)
4. Du siehst die App im Browser mit den Demo-Items

Falls noch nicht geschehen:

```bash
cd react-recap-mini-hub
npm install
npm run dev
```

> **Tipp für diese Übung:** Arbeite immer in kleinen Schritten. Teste nach jeder Änderung, ob die App noch funktioniert. Bei Problemen: Browser-Konsole (F12) prüfen!

---

## Ausgangslage: Das Basis-Projekt

Das Projekt hat bereits folgende Features:

```
┌─────────────────────────────────────────────────────────────┐
│                    MINI-HUB v1 (Basis)                      │
│                                                             │
│   Features:                                                 │
│   ✓ Items als Cards anzeigen                                │
│   ✓ Neues Item hinzufügen (Titel, URL, Tags)                │
│   ✓ Item löschen                                            │
│   ✓ Favorit markieren/entfernen                             │
│   ✓ localStorage Persistenz                                 │
│                                                             │
│   Deine Aufgabe heute:                                      │
│   → Übung 1: Suche implementieren                           │
│   → Übung 2: Tag-Filter hinzufügen                          │
│   → Übung 3: Items bearbeiten können                        │
│   → Übung 4: Custom Hook extrahieren (Bonus)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Übung 1: Suche (Textfilter)

> **Ziel:** Ein Suchfeld implementieren, das Items nach Titel filtert
> **Zeitbedarf:** ca. 30-40 Minuten
> **Du bist fertig, wenn:** Die Liste sich beim Tippen live filtert und ein "Keine Ergebnisse" State erscheint

### Anforderungen

- Suchfeld oberhalb der Item-Liste
- Live-Filterung (kein Suchen-Button nötig)
- Case-insensitive Suche (Groß/Kleinschreibung ignorieren)
- Optional: Auch in Tags suchen
- "Keine Ergebnisse" Anzeige wenn Filter keine Treffer hat

### Konzept: Derived State

```
┌─────────────────────────────────────────────────────────────┐
│                   DERIVED STATE                             │
│                                                             │
│   Was ist das?                                              │
│   Ein Wert, der aus anderen State-Werten BERECHNET wird.    │
│   Er braucht keinen eigenen useState!                       │
│                                                             │
│   Beispiel:                                                 │
│   ┌─────────────┐                                           │
│   │   items     │──┐                                        │
│   │   (State)   │  │                                        │
│   └─────────────┘  │   filter()                             │
│                    ├──────────>  filteredItems              │
│   ┌─────────────┐  │             (Derived State)            │
│   │ searchTerm  │──┘                                        │
│   │   (State)   │                                           │
│   └─────────────┘                                           │
│                                                             │
│   filteredItems wird bei jedem Render neu berechnet.        │
│   Das ist performant genug für die meisten Anwendungen!     │
└─────────────────────────────────────────────────────────────┘
```

### Datenfluss

```
┌─────────────────────────────────────────────────────────────┐
│                   SUCH-DATENFLUSS                           │
│                                                             │
│   [Suchfeld]                                                │
│       │                                                     │
│       │ onChange                                            │
│       ▼                                                     │
│   setSearchTerm(e.target.value)                             │
│       │                                                     │
│       ▼                                                     │
│   Komponente rendert neu                                    │
│       │                                                     │
│       ▼                                                     │
│   filteredItems = items.filter(...)                         │
│       │                                                     │
│       ▼                                                     │
│   <ItemList items={filteredItems} />                        │
└─────────────────────────────────────────────────────────────┘
```

### Schritt-für-Schritt

**Schritt 1: State für Suchbegriff anlegen**

Öffne `src/App.jsx` und füge einen neuen State hinzu:

```javascript
// Nach dem items-State
const [searchTerm, setSearchTerm] = useState('');
```

**Schritt 2: Gefilterte Items berechnen**

Füge vor dem `return` die Filterlogik hinzu:

```javascript
// Gefilterte Items basierend auf Suchbegriff
const filteredItems = items.filter(item => {
  // Wenn kein Suchbegriff, zeige alle Items
  if (searchTerm.trim() === '') {
    return true;
  }

  // Suche im Titel (case-insensitive)
  const titleMatch = item.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  return titleMatch;
});
```

**Schritt 3: Suchfeld im JSX hinzufügen**

Füge das Suchfeld in der `app-content` Section ein, oberhalb von `<ItemList>`:

```javascript
<section className="app-content">
  {/* Suchfeld */}
  <input
    type="text"
    className="search-input"
    placeholder="Items durchsuchen..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <ItemList
    items={filteredItems}  // Wichtig: filteredItems statt items!
    onDelete={handleDeleteItem}
    onToggleFavorite={handleToggleFavorite}
  />
</section>
```

> **Wichtig:** Ändere `items={items}` zu `items={filteredItems}` in der ItemList-Komponente!

**Schritt 4: "Keine Ergebnisse" State hinzufügen**

Erweitere die `ItemList.jsx`, um einen speziellen State anzuzeigen, wenn der Filter keine Treffer hat. Öffne `src/components/ItemList.jsx`:

```javascript
function ItemList({ items, onDelete, onToggleFavorite }) {
  // Empty State wenn keine Items vorhanden
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <h3 className="empty-state-title">Keine Items vorhanden</h3>
        <p className="empty-state-text">
          Füge dein erstes Item hinzu, um loszulegen!
        </p>
      </div>
    );
  }

  // ... rest der Komponente
}
```

> **Hinweis:** Der Empty-State zeigt aktuell immer dieselbe Nachricht. Für eine bessere UX könntest du unterscheiden, ob wirklich keine Items existieren oder ob nur der Filter keine Treffer hat. Das ist optional!

**Schritt 5: Teste deine Implementierung**

1. Tippe "React" in das Suchfeld - nur Items mit "React" im Titel sollten erscheinen
2. Lösche den Suchbegriff - alle Items sollten wieder erscheinen
3. Tippe einen Begriff der nicht existiert - Empty State sollte erscheinen

### Bonus: Auch in Tags suchen

Erweitere die Filterlogik, um auch in den Tags zu suchen:

```javascript
const filteredItems = items.filter(item => {
  if (searchTerm.trim() === '') {
    return true;
  }

  const search = searchTerm.toLowerCase();

  // Suche im Titel
  const titleMatch = item.title.toLowerCase().includes(search);

  // Suche in Tags
  const tagsMatch = item.tags?.some(tag =>
    tag.toLowerCase().includes(search)
  );

  return titleMatch || tagsMatch;
});
```

<details markdown>
<summary>Musterlösung anzeigen</summary>

**App.jsx (relevante Teile):**

```javascript
import { useState, useEffect } from 'react';
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import { loadItems, saveItems } from './utils/storage';
import { seedItems } from './data/seedItems';
import './App.css';

function App() {
  const [items, setItems] = useState(() => {
    const stored = loadItems();
    return stored || seedItems;
  });

  // NEU: State für Suchbegriff
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    saveItems(items);
  }, [items]);

  // NEU: Gefilterte Items (Derived State)
  const filteredItems = items.filter(item => {
    if (searchTerm.trim() === '') {
      return true;
    }

    const search = searchTerm.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(search);
    const tagsMatch = item.tags?.some(tag =>
      tag.toLowerCase().includes(search)
    );

    return titleMatch || tagsMatch;
  });

  // ... Handler bleiben gleich ...

  return (
    <div className="app">
      <Header itemCount={items.length} />

      <main className="app-main">
        <aside className="app-sidebar">
          <ItemForm onAdd={handleAddItem} />
        </aside>

        <section className="app-content">
          {/* NEU: Suchfeld */}
          <input
            type="text"
            className="search-input"
            placeholder="Items durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* GEÄNDERT: filteredItems statt items */}
          <ItemList
            items={filteredItems}
            onDelete={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
```

> **Beachte:** Der Header zeigt weiterhin `items.length` (Gesamtanzahl), nicht `filteredItems.length`. So sieht der User immer, wie viele Items insgesamt existieren.

</details>

### Wissensfrage 1

Warum berechnen wir `filteredItems` bei jedem Render neu, statt es in einem separaten State zu speichern?

<details markdown>
<summary>Antwort anzeigen</summary>

**Derived State:** `filteredItems` ist "abgeleiteter State" - es kann vollständig aus `items` und `searchTerm` berechnet werden. Einen separaten State dafür zu haben würde:

1. **Redundanz** erzeugen (Daten doppelt speichern)
2. **Synchronisationsprobleme** riskieren (was wenn `items` und `filteredItems` nicht übereinstimmen?)
3. **Mehr Komplexität** durch zusätzliche `useEffect`-Hooks zum Synchronisieren

**Faustregel:** Wenn ein Wert aus anderen State-Werten berechnet werden kann, speichere ihn nicht als eigenen State!

**Performance:** Für kleine bis mittlere Listen (< 1000 Items) ist die Neuberechnung bei jedem Render kein Problem. Für größere Listen gibt es `useMemo`, aber das ist hier nicht nötig.

</details>

---

## Übung 2: Tag-Filter

> **Ziel:** Einen zusätzlichen Filter implementieren, um Items nach Tags zu filtern
> **Zeitbedarf:** ca. 25-35 Minuten
> **Du bist fertig, wenn:** Du Items per Klick auf einen Tag filtern kannst und Suche + Tag-Filter zusammenarbeiten

### Anforderungen

- Clickable Tags/Chips oberhalb der Liste
- Ein Klick auf einen Tag filtert die Liste
- "Alle" Button zum Zurücksetzen des Filters
- Filter kombinierbar mit der Textsuche (AND-Logik)

### Konzept: Kombinierte Filter

```
┌─────────────────────────────────────────────────────────────┐
│                KOMBINIERTE FILTER (AND-LOGIK)               │
│                                                             │
│   items                                                     │
│     │                                                       │
│     ▼                                                       │
│   .filter(item => {                                         │
│     const matchesSearch = ...                               │
│     const matchesTag = ...                                  │
│     return matchesSearch && matchesTag; // AND!             │
│   })                                                        │
│     │                                                       │
│     ▼                                                       │
│   filteredItems                                             │
│                                                             │
│   Beide Bedingungen müssen erfüllt sein!                    │
└─────────────────────────────────────────────────────────────┘
```

### Schritt-für-Schritt

**Schritt 1: Alle einzigartigen Tags sammeln**

Füge in `App.jsx` hinzu:

```javascript
// Alle einzigartigen Tags aus allen Items sammeln
const allTags = [...new Set(
  items.flatMap(item => item.tags || [])
)].sort();
```

> **Erklärung:**
> - `flatMap`: Sammelt alle Tag-Arrays und "flacht" sie zu einem Array
> - `new Set(...)`: Entfernt Duplikate
> - `[...Set]`: Wandelt Set zurück in Array
> - `.sort()`: Sortiert alphabetisch

**Schritt 2: State für ausgewählten Tag**

```javascript
const [selectedTag, setSelectedTag] = useState('');
```

**Schritt 3: Filterlogik erweitern**

Erweitere die bestehende Filterlogik:

```javascript
const filteredItems = items.filter(item => {
  // Suchfilter (aus Übung 1)
  let matchesSearch = true;
  if (searchTerm.trim() !== '') {
    const search = searchTerm.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(search);
    const tagsMatch = item.tags?.some(tag =>
      tag.toLowerCase().includes(search)
    );
    matchesSearch = titleMatch || tagsMatch;
  }

  // Tag-Filter (NEU)
  let matchesTag = true;
  if (selectedTag !== '') {
    matchesTag = item.tags?.includes(selectedTag) || false;
  }

  // Beide Filter müssen passen (AND)
  return matchesSearch && matchesTag;
});
```

**Schritt 4: Tag-Filter UI hinzufügen**

Füge unter dem Suchfeld die Tag-Buttons ein:

```javascript
{/* Tag-Filter */}
{allTags.length > 0 && (
  <div className="tag-filter">
    <button
      className={`tag-filter-btn ${selectedTag === '' ? 'tag-filter-btn--active' : ''}`}
      onClick={() => setSelectedTag('')}
    >
      Alle
    </button>
    {allTags.map(tag => (
      <button
        key={tag}
        className={`tag-filter-btn ${selectedTag === tag ? 'tag-filter-btn--active' : ''}`}
        onClick={() => setSelectedTag(tag)}
      >
        {tag}
      </button>
    ))}
  </div>
)}
```

> **Hinweis:** Die CSS-Klassen `tag-filter`, `tag-filter-btn` und `tag-filter-btn--active` sind bereits in `App.css` vorbereitet!

**Schritt 5: Teste die Kombination**

1. Wähle einen Tag aus - nur Items mit diesem Tag erscheinen
2. Tippe zusätzlich einen Suchbegriff - beide Filter arbeiten zusammen
3. Klicke "Alle" - Tag-Filter wird zurückgesetzt

<details markdown>
<summary>Musterlösung anzeigen</summary>

**App.jsx (relevante Teile):**

```javascript
function App() {
  const [items, setItems] = useState(() => {
    const stored = loadItems();
    return stored || seedItems;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(''); // NEU

  useEffect(() => {
    saveItems(items);
  }, [items]);

  // Alle einzigartigen Tags sammeln
  const allTags = [...new Set(
    items.flatMap(item => item.tags || [])
  )].sort();

  // Kombinierte Filterlogik
  const filteredItems = items.filter(item => {
    // Suchfilter
    let matchesSearch = true;
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(search);
      const tagsMatch = item.tags?.some(tag =>
        tag.toLowerCase().includes(search)
      );
      matchesSearch = titleMatch || tagsMatch;
    }

    // Tag-Filter
    let matchesTag = true;
    if (selectedTag !== '') {
      matchesTag = item.tags?.includes(selectedTag) || false;
    }

    return matchesSearch && matchesTag;
  });

  // ... Handler ...

  return (
    <div className="app">
      <Header itemCount={items.length} />

      <main className="app-main">
        <aside className="app-sidebar">
          <ItemForm onAdd={handleAddItem} />
        </aside>

        <section className="app-content">
          {/* Suchfeld */}
          <input
            type="text"
            className="search-input"
            placeholder="Items durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Tag-Filter */}
          {allTags.length > 0 && (
            <div className="tag-filter">
              <button
                className={`tag-filter-btn ${selectedTag === '' ? 'tag-filter-btn--active' : ''}`}
                onClick={() => setSelectedTag('')}
              >
                Alle
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter-btn ${selectedTag === tag ? 'tag-filter-btn--active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <ItemList
            items={filteredItems}
            onDelete={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      </main>
    </div>
  );
}
```

</details>

### Wissensfrage 2

Was passiert, wenn ein User einen Tag auswählt und dann das einzige Item mit diesem Tag löscht?

<details markdown>
<summary>Antwort anzeigen</summary>

Der Filter bleibt auf dem gewählten Tag gesetzt, aber es werden keine Items mehr angezeigt (Empty State). Das kann verwirrend sein!

**Mögliche Verbesserungen:**
1. Nach dem Löschen prüfen, ob der Tag noch existiert, und ggf. zurücksetzen
2. Im Empty State einen Hinweis geben: "Keine Items mit Tag 'xyz'"
3. Tags im Filter deaktivieren, wenn sie zu keinen Ergebnissen führen würden

Diese Verbesserungen sind optional und wären eine gute Bonus-Aufgabe!

</details>

---

## Übung 3: Item bearbeiten

> **Ziel:** Die Möglichkeit hinzufügen, bestehende Items zu bearbeiten
> **Zeitbedarf:** ca. 35-45 Minuten
> **Du bist fertig, wenn:** Du auf "Bearbeiten" klicken, Werte ändern und speichern kannst

### Anforderungen

- "Bearbeiten" Button in jeder Card
- Edit-Modus zeigt ein Formular statt der normalen Anzeige
- Formular ist mit aktuellen Werten vorbefüllt
- "Speichern" übernimmt Änderungen
- "Abbrechen" verwirft Änderungen
- localStorage wird korrekt aktualisiert

### Konzept: Conditional Rendering für Edit-Modus

```
┌─────────────────────────────────────────────────────────────┐
│              EDIT-MODUS STRATEGIE                           │
│                                                             │
│   Option A: Edit-State pro Card (in ItemCard)               │
│   ─────────────────────────────────────────                 │
│   Jede Card verwaltet ihren eigenen isEditing State         │
│   + Einfach zu implementieren                               │
│   - Schwieriger, nur eine Card gleichzeitig editierbar      │
│                                                             │
│   Option B: editingId in App (empfohlen)                    │
│   ─────────────────────────────────────                     │
│   App speichert die ID des Items das gerade editiert wird   │
│   + Nur eine Card kann gleichzeitig editiert werden         │
│   + Bessere Kontrolle über den Edit-Zustand                 │
│                                                             │
│   Wir verwenden Option B!                                   │
└─────────────────────────────────────────────────────────────┘
```

### Schritt-für-Schritt

**Schritt 1: editingId State in App.jsx**

```javascript
const [editingId, setEditingId] = useState(null);
```

**Schritt 2: Handler für Edit-Aktionen in App.jsx**

```javascript
// Handler: Edit-Modus starten
function handleStartEdit(id) {
  setEditingId(id);
}

// Handler: Edit abbrechen
function handleCancelEdit() {
  setEditingId(null);
}

// Handler: Item aktualisieren
function handleUpdateItem(id, updatedData) {
  setItems(prevItems =>
    prevItems.map(item =>
      item.id === id
        ? { ...item, ...updatedData }
        : item
    )
  );
  setEditingId(null);
}
```

**Schritt 3: Props an ItemList weitergeben**

```javascript
<ItemList
  items={filteredItems}
  onDelete={handleDeleteItem}
  onToggleFavorite={handleToggleFavorite}
  editingId={editingId}
  onStartEdit={handleStartEdit}
  onCancelEdit={handleCancelEdit}
  onUpdateItem={handleUpdateItem}
/>
```

**Schritt 4: ItemList.jsx anpassen**

```javascript
function ItemList({
  items,
  onDelete,
  onToggleFavorite,
  editingId,
  onStartEdit,
  onCancelEdit,
  onUpdateItem
}) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        {/* ... */}
      </div>
    );
  }

  return (
    <div className="item-list">
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          isEditing={editingId === item.id}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onUpdateItem={onUpdateItem}
        />
      ))}
    </div>
  );
}
```

**Schritt 5: ItemCard.jsx mit Edit-Modus erweitern**

Öffne `src/components/ItemCard.jsx` und erweitere die Komponente:

```javascript
import { useState, useEffect } from 'react';

function ItemCard({
  item,
  isEditing,
  onDelete,
  onToggleFavorite,
  onStartEdit,
  onCancelEdit,
  onUpdateItem
}) {
  // Lokaler State für Edit-Formular
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url || '');
  const [editTags, setEditTags] = useState(item.tags?.join(', ') || '');

  // Wenn Item sich ändert, Formular-Werte aktualisieren
  useEffect(() => {
    setEditTitle(item.title);
    setEditUrl(item.url || '');
    setEditTags(item.tags?.join(', ') || '');
  }, [item]);

  // Save Handler
  function handleSave() {
    if (editTitle.trim() === '') return;

    const tags = editTags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    onUpdateItem(item.id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      tags: tags
    });
  }

  // Datum formatieren
  const formattedDate = new Date(item.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // EDIT MODUS
  if (isEditing) {
    return (
      <article className="item-card">
        <div className="edit-form">
          <input
            type="text"
            className="edit-input"
            placeholder="Titel"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />
          <input
            type="url"
            className="edit-input"
            placeholder="URL (optional)"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
          />
          <input
            type="text"
            className="edit-input"
            placeholder="Tags (kommagetrennt)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
          />
          <div className="edit-actions">
            <button
              className="edit-btn edit-btn--cancel"
              onClick={onCancelEdit}
            >
              Abbrechen
            </button>
            <button
              className="edit-btn edit-btn--save"
              onClick={handleSave}
            >
              Speichern
            </button>
          </div>
        </div>
      </article>
    );
  }

  // NORMALE ANZEIGE
  return (
    <article className={`item-card ${item.favorite ? 'item-card--favorite' : ''}`}>
      <div className="item-card-header">
        <h3 className="item-title">{item.title}</h3>
        <button
          className={`favorite-btn ${item.favorite ? 'favorite-btn--active' : ''}`}
          onClick={() => onToggleFavorite(item.id)}
        >
          {item.favorite ? '★' : '☆'}
        </button>
      </div>

      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-url">
          {item.url}
        </a>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="item-tags">
          {item.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="item-card-footer">
        <span className="item-date">Erstellt: {formattedDate}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="edit-btn edit-btn--cancel"
            onClick={() => onStartEdit(item.id)}
          >
            Bearbeiten
          </button>
          <button className="delete-btn" onClick={() => onDelete(item.id)}>
            Löschen
          </button>
        </div>
      </div>
    </article>
  );
}

export default ItemCard;
```

> **Hinweis:** Die CSS-Klassen `edit-form`, `edit-input`, `edit-actions`, `edit-btn--save` und `edit-btn--cancel` sind bereits in `App.css` vorbereitet!

<details markdown>
<summary>Musterlösung anzeigen</summary>

Die vollständige Lösung findest du in der Schritt-für-Schritt Anleitung oben. Hier die wichtigsten Änderungen zusammengefasst:

**App.jsx - Neue States und Handler:**
```javascript
const [editingId, setEditingId] = useState(null);

function handleStartEdit(id) {
  setEditingId(id);
}

function handleCancelEdit() {
  setEditingId(null);
}

function handleUpdateItem(id, updatedData) {
  setItems(prevItems =>
    prevItems.map(item =>
      item.id === id ? { ...item, ...updatedData } : item
    )
  );
  setEditingId(null);
}
```

**ItemList.jsx - Erweiterte Props:**
```javascript
function ItemList({
  items,
  onDelete,
  onToggleFavorite,
  editingId,
  onStartEdit,
  onCancelEdit,
  onUpdateItem
}) {
  // ... isEditing={editingId === item.id} an ItemCard weitergeben
}
```

**ItemCard.jsx - Conditional Rendering:**
```javascript
if (isEditing) {
  return (/* Edit-Formular */);
}
return (/* Normale Anzeige */);
```

</details>

### Wissensfrage 3

Warum verwenden wir `useState` für die Edit-Formular-Werte (`editTitle`, etc.) in der ItemCard, statt die Werte direkt aus `item` zu lesen?

<details markdown>
<summary>Antwort anzeigen</summary>

**Controlled Component Pattern:** Das Formular braucht eigenen State, weil:

1. **Isolation:** Änderungen im Formular sollen erst beim "Speichern" übernommen werden, nicht sofort
2. **Abbrechen möglich:** Mit "Abbrechen" können wir den lokalen State verwerfen, ohne `items` zu ändern
3. **Validation:** Wir können den lokalen Wert prüfen, bevor wir `onUpdateItem` aufrufen

Würden wir direkt `item.title` als `value` verwenden und bei `onChange` sofort `onUpdateItem` aufrufen, gäbe es kein "Abbrechen" - jede Eingabe würde sofort gespeichert!

</details>

---

## Übung 4 (Bonus): Custom Hook useLocalStorageState

> **Ziel:** Die localStorage-Logik in einen wiederverwendbaren Custom Hook extrahieren
> **Zeitbedarf:** ca. 20-30 Minuten
> **Du bist fertig, wenn:** Der Hook funktioniert und die App sich genauso verhält wie vorher

### Warum Custom Hooks?

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOM HOOKS - WIEDERVERWENDBARE LOGIK         │
│                                                             │
│   Vorher (in App.jsx):                                      │
│   ─────────────────────                                     │
│   const [items, setItems] = useState(() => {                │
│     const stored = loadItems();                             │
│     return stored || seedItems;                             │
│   });                                                       │
│                                                             │
│   useEffect(() => {                                         │
│     saveItems(items);                                       │
│   }, [items]);                                              │
│                                                             │
│   Nachher (mit Custom Hook):                                │
│   ─────────────────────────                                 │
│   const [items, setItems] = useLocalStorageState(           │
│     'mini-hub-items',                                       │
│     seedItems                                               │
│   );                                                        │
│                                                             │
│   Vorteile:                                                 │
│   ✓ Wiederverwendbar in anderen Komponenten                │
│   ✓ Logik ist gekapselt                                    │
│   ✓ Weniger Code in App.jsx                                │
│   ✓ Einfacher zu testen                                    │
└─────────────────────────────────────────────────────────────┘
```

### Schritt-für-Schritt

**Schritt 1: Hook-Datei erstellen**

Erstelle `src/hooks/useLocalStorageState.js`:

```javascript
import { useState, useEffect } from 'react';

/**
 * Custom Hook: Synchronisiert State mit localStorage
 * @param {string} key - Der localStorage-Schlüssel
 * @param {any} initialValue - Der Startwert falls nichts gespeichert ist
 * @returns {[any, function]} - [state, setState] wie bei useState
 */
export function useLocalStorageState(key, initialValue) {
  // State mit Lazy Initialization
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return initialValue;
    } catch (error) {
      console.error(`Fehler beim Laden von "${key}":`, error);
      return initialValue;
    }
  });

  // Bei State-Änderung: In localStorage speichern
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Fehler beim Speichern von "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
```

**Schritt 2: Hook in App.jsx verwenden**

```javascript
import { useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
// ... andere imports ...
import { seedItems } from './data/seedItems';

function App() {
  // VORHER:
  // const [items, setItems] = useState(() => {
  //   const stored = loadItems();
  //   return stored || seedItems;
  // });
  // useEffect(() => {
  //   saveItems(items);
  // }, [items]);

  // NACHHER:
  const [items, setItems] = useLocalStorageState('mini-hub-items', seedItems);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editingId, setEditingId] = useState(null);

  // ... rest bleibt gleich ...
}
```

**Schritt 3: Entferne den nicht mehr benötigten useEffect**

Da der Custom Hook die Persistenz übernimmt, kannst du den `useEffect` für `saveItems` aus `App.jsx` entfernen.

**Schritt 4: Teste die App**

1. Füge ein neues Item hinzu
2. Lade die Seite neu
3. Das Item sollte noch da sein
4. Die App sollte sich exakt wie vorher verhalten

<details markdown>
<summary>Musterlösung anzeigen</summary>

**src/hooks/useLocalStorageState.js:**

```javascript
import { useState, useEffect } from 'react';

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return initialValue;
    } catch (error) {
      console.error(`Fehler beim Laden von "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Fehler beim Speichern von "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
```

**App.jsx (geänderte Teile):**

```javascript
import { useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import { seedItems } from './data/seedItems';
import './App.css';

function App() {
  // Mit Custom Hook - ersetzt useState + useEffect
  const [items, setItems] = useLocalStorageState('mini-hub-items', seedItems);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editingId, setEditingId] = useState(null);

  // ... alles andere bleibt gleich ...
}
```

> **Beachte:** Der Import von `useEffect` kann aus App.jsx entfernt werden (falls nicht anderweitig genutzt). Auch die Imports von `loadItems` und `saveItems` aus `utils/storage.js` werden nicht mehr benötigt.

</details>

### Wissensfrage 4

Was bedeutet "Lazy Initialization" bei `useState`?

<details markdown>
<summary>Antwort anzeigen</summary>

**Lazy Initialization** bedeutet, dass wir `useState` eine **Funktion** übergeben statt direkt den Wert:

```javascript
// EAGER (wird bei jedem Render ausgeführt):
const [state, setState] = useState(localStorage.getItem('key'));

// LAZY (wird nur beim ersten Render ausgeführt):
const [state, setState] = useState(() => localStorage.getItem('key'));
```

**Warum ist das wichtig?**

Bei der "eager" Variante würde `localStorage.getItem()` bei **jedem Render** aufgerufen werden, obwohl der Wert nur beim ersten Mal gebraucht wird. Das ist ineffizient.

Bei der "lazy" Variante ruft React die Funktion **nur beim ersten Render** auf. Bei nachfolgenden Renders wird der bereits gespeicherte State verwendet.

**Faustregel:** Verwende Lazy Initialization wenn der Initialwert:
- eine teure Berechnung erfordert
- einen I/O-Zugriff macht (localStorage, etc.)
- von externen Quellen kommt

</details>

---

## Zusammenfassung

### Was du heute gelernt hast

| Feature | Konzepte | Dateien |
|---------|----------|---------|
| **Suche** | Derived State, filter(), case-insensitive | App.jsx |
| **Tag-Filter** | Set, flatMap, kombinierte Filter (AND) | App.jsx |
| **Edit** | Conditional Rendering, lokaler Form-State | ItemCard.jsx, App.jsx |
| **Custom Hook** | Hook-Extraktion, Lazy Initialization | hooks/useLocalStorageState.js |

### React-Pattern auf einen Blick

```javascript
// Derived State (nicht als useState speichern!)
const filteredItems = items.filter(item => ...);

// Conditional Rendering
if (isEditing) {
  return <EditForm />;
}
return <NormalView />;

// Custom Hook
export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => { /* lazy init */ });
  useEffect(() => { /* sync */ }, [key, state]);
  return [state, setState];
}
```

---

## Checkliste

Bevor du den Tag abschließt, stelle sicher:

- [ ] Suchfeld filtert Items live nach Titel
- [ ] Suche ist case-insensitive
- [ ] Tag-Filter zeigt nur Items mit gewähltem Tag
- [ ] Suche und Tag-Filter arbeiten zusammen (AND-Logik)
- [ ] Items können inline bearbeitet werden
- [ ] Edit-Modus hat Save/Cancel Buttons
- [ ] Änderungen werden im localStorage gespeichert
- [ ] (Bonus) useLocalStorageState Hook funktioniert

**Alles abgehakt?** Du bist bereit für Tag 2 - Deployment!

---

## Nächste Schritte (Tag 2)

Morgen lernst du:
- Wie du deine App für Production baust
- Deployment auf einem Server
- Umgebungsvariablen
- Build-Optimierungen
