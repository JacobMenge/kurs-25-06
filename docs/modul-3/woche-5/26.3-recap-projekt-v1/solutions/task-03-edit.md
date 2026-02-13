# Lösung: Übung 3 - Item bearbeiten

## Konzept: Conditional Rendering mit editingId

Statt in jeder Card einen eigenen `isEditing` State zu haben, speichert App.jsx die ID des Items das gerade editiert wird. So kann nur eine Card gleichzeitig editiert werden.

## Änderungen in App.jsx

### 1. State für editingId

```javascript
const [editingId, setEditingId] = useState(null);
```

### 2. Handler-Funktionen

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

### 3. Props an ItemList weitergeben

```jsx
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

## Änderungen in ItemList.jsx

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
  // ... empty state ...

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

## Änderungen in ItemCard.jsx

### Lokaler State für Formular

```javascript
import { useState, useEffect } from 'react';

function ItemCard({ item, isEditing, onDelete, onToggleFavorite, onStartEdit, onCancelEdit, onUpdateItem }) {
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url || '');
  const [editTags, setEditTags] = useState(item.tags?.join(', ') || '');

  // Formular-Werte aktualisieren wenn Item sich ändert
  useEffect(() => {
    setEditTitle(item.title);
    setEditUrl(item.url || '');
    setEditTags(item.tags?.join(', ') || '');
  }, [item]);

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

  // ...
}
```

### Conditional Rendering

```javascript
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
          <button className="edit-btn edit-btn--cancel" onClick={onCancelEdit}>
            Abbrechen
          </button>
          <button className="edit-btn edit-btn--save" onClick={handleSave}>
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
    {/* ... normale Card-Inhalte ... */}
    <div className="item-card-footer">
      <span className="item-date">Erstellt: {formattedDate}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="edit-btn edit-btn--cancel" onClick={() => onStartEdit(item.id)}>
          Bearbeiten
        </button>
        <button className="delete-btn" onClick={() => onDelete(item.id)}>
          Löschen
        </button>
      </div>
    </div>
  </article>
);
```

## Betroffene Dateien

- `src/App.jsx` - editingId State, Handler
- `src/components/ItemList.jsx` - Props durchreichen
- `src/components/ItemCard.jsx` - Edit-Formular, Conditional Rendering
- `src/App.css` - Styles sind bereits vorbereitet

## Häufige Fehler

1. **Props nicht durchreichen** - Alle Handler müssen von App → ItemList → ItemCard fließen
2. **Formular-State fehlt** - Das Edit-Formular braucht eigenen lokalen State
3. **useEffect vergessen** - Formular-Werte müssen bei Item-Änderung aktualisiert werden
4. **Validierung vergessen** - Leerer Titel sollte nicht gespeichert werden können

## Testen

1. Klicke "Bearbeiten" → Formular erscheint mit aktuellen Werten
2. Ändere Werte und klicke "Speichern" → Änderungen werden übernommen
3. Klicke "Abbrechen" → Änderungen werden verworfen
4. Lade Seite neu → Änderungen sind im localStorage gespeichert
