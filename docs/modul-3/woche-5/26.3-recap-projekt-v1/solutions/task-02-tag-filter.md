# Lösung: Übung 2 - Tag-Filter

## Konzept: Kombinierte Filter mit AND-Logik

Suche und Tag-Filter arbeiten zusammen: Ein Item muss **beide** Kriterien erfüllen.

## Änderungen in App.jsx

### 1. Alle Tags sammeln

```javascript
// Alle einzigartigen Tags aus allen Items sammeln
const allTags = [...new Set(
  items.flatMap(item => item.tags || [])
)].sort();
```

**Erklärung:**
- `flatMap`: Sammelt alle Tag-Arrays und "flacht" sie
- `new Set(...)`: Entfernt Duplikate
- `[...Set]`: Wandelt Set zurück in Array
- `.sort()`: Sortiert alphabetisch

### 2. State für ausgewählten Tag

```javascript
const [selectedTag, setSelectedTag] = useState('');
```

### 3. Erweiterte Filterlogik

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

  // Tag-Filter
  let matchesTag = true;
  if (selectedTag !== '') {
    matchesTag = item.tags?.includes(selectedTag) || false;
  }

  // Beide Filter müssen passen (AND)
  return matchesSearch && matchesTag;
});
```

### 4. Tag-Filter UI

```jsx
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

## Betroffene Dateien

- `src/App.jsx` - State, Tags sammeln, Filterlogik, UI
- `src/App.css` - Styles sind bereits vorbereitet (`.tag-filter`, `.tag-filter-btn`)

## Häufige Fehler

1. **Tags nicht als Set sammeln** - Führt zu Duplikaten
2. **AND statt OR** - Filter sollen kombiniert werden (AND), nicht alternativ (OR)
3. **Leeren Tag nicht abfangen** - Bei `selectedTag === ''` alle zeigen
4. **Key vergessen** - Jeder Button braucht einen `key` prop

## Testen

1. Klicke auf "react" → Nur Items mit Tag "react" erscheinen
2. Klicke auf "Alle" → Alle Items erscheinen wieder
3. Wähle Tag + tippe Suchbegriff → Beide Filter arbeiten zusammen
