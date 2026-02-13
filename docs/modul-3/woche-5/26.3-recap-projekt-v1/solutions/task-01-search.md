# Lösung: Übung 1 - Suche (Textfilter)

## Konzept: Derived State

Die gefilterten Items werden nicht als eigener State gespeichert, sondern bei jedem Render aus `items` und `searchTerm` berechnet. Das vermeidet Synchronisationsprobleme.

## Änderungen in App.jsx

### 1. Neuer State für Suchbegriff

```javascript
const [searchTerm, setSearchTerm] = useState('');
```

### 2. Filterlogik (vor dem return)

```javascript
// Gefilterte Items basierend auf Suchbegriff
const filteredItems = items.filter(item => {
  // Wenn kein Suchbegriff, zeige alle Items
  if (searchTerm.trim() === '') {
    return true;
  }

  const search = searchTerm.toLowerCase();

  // Suche im Titel (case-insensitive)
  const titleMatch = item.title.toLowerCase().includes(search);

  // Bonus: Auch in Tags suchen
  const tagsMatch = item.tags?.some(tag =>
    tag.toLowerCase().includes(search)
  );

  return titleMatch || tagsMatch;
});
```

### 3. Suchfeld im JSX

```jsx
<section className="app-content">
  {/* Suchfeld */}
  <input
    type="text"
    className="search-input"
    placeholder="Items durchsuchen..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  {/* Wichtig: filteredItems statt items! */}
  <ItemList
    items={filteredItems}
    onDelete={handleDeleteItem}
    onToggleFavorite={handleToggleFavorite}
  />
</section>
```

## Betroffene Dateien

- `src/App.jsx` - State, Filterlogik, Suchfeld
- `src/App.css` - Styles sind bereits vorbereitet (`.search-input`)

## Häufige Fehler

1. **`items` statt `filteredItems` übergeben** - Die ItemList muss die gefilterten Items erhalten
2. **Case-sensitivity vergessen** - `.toLowerCase()` auf beiden Seiten des Vergleichs
3. **Leeren String nicht abfangen** - Bei leerem Suchbegriff alle Items zeigen
4. **Optional Chaining vergessen** - `item.tags?.some()` für Items ohne Tags

## Testen

1. Tippe "React" → Nur Items mit "React" im Titel (oder Tags) erscheinen
2. Lösche den Suchbegriff → Alle Items erscheinen
3. Tippe "xyz" (nicht existierend) → Empty State erscheint
