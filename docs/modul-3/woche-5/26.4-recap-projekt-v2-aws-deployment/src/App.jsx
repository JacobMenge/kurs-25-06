// ===========================================================================
// APP.JSX - Hauptkomponente mit allen V2 Features
// ===========================================================================
//
// Version 2 enthält alle Features:
// - Textsuche (live-Filterung nach Titel)
// - Tag-Filter (klickbare Tag-Buttons)
// - Item bearbeiten (inline Edit-Modus)
// - Custom Hook useLocalStorageState
//
// React-Konzepte in dieser Datei:
// - Custom Hooks: useLocalStorageState für persistente Daten
// - Derived State: filteredItems wird berechnet, nicht gespeichert
// - Kombinierte Filter: Suche UND Tag-Filter arbeiten zusammen
// - Event Handler: Add, Delete, Toggle, Edit, Search, Filter
//
// ===========================================================================

import { useState } from 'react';

// Custom Hook für localStorage Synchronisation
import { useLocalStorageState } from './hooks/useLocalStorageState';

// Import der Kindkomponenten
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import ItemList from './components/ItemList';

// Seed-Daten für den ersten Start
import { seedItems } from './data/seedItems';

import './App.css';

function App() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // Custom Hook ersetzt useState + useEffect für localStorage
  // Verhält sich wie useState aber speichert automatisch
  const [items, setItems] = useLocalStorageState('mini-hub-items', seedItems);

  // State für die Textsuche
  const [searchTerm, setSearchTerm] = useState('');

  // State für den aktiven Tag-Filter (null = "Alle")
  const [activeTag, setActiveTag] = useState(null);

  // State für den Edit-Modus: speichert die ID des Items das bearbeitet wird
  // null bedeutet kein Item wird gerade bearbeitet
  const [editingId, setEditingId] = useState(null);

  // =========================================================================
  // DERIVED STATE (berechnete Werte)
  // =========================================================================

  // Alle eindeutigen Tags aus allen Items sammeln
  // Set entfernt automatisch Duplikate
  // flatMap "flacht" das Array von Arrays zu einem Array
  const allTags = [...new Set(items.flatMap(item => item.tags || []))].sort();

  // Gefilterte Items basierend auf Suche UND Tag-Filter
  // Das ist "Derived State" - wir speichern das nicht extra
  // sondern berechnen es bei jedem Render neu
  const filteredItems = items.filter(item => {
    // Suche: Prüfe ob der Suchbegriff im Titel vorkommt (case-insensitive)
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Bonus: Auch in Tags suchen
      (item.tags && item.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    // Tag-Filter: Prüfe ob der aktive Tag im Item vorhanden ist
    const matchesTag = activeTag === null ||
      (item.tags && item.tags.includes(activeTag));

    // AND-Logik: Item muss beide Bedingungen erfüllen
    return matchesSearch && matchesTag;
  });

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  // Handler: Neues Item hinzufügen
  function handleAddItem(newItemData) {
    const newItem = {
      ...newItemData,
      id: crypto.randomUUID(),
      favorite: false,
      createdAt: new Date().toISOString()
    };
    setItems(prevItems => [newItem, ...prevItems]);
  }

  // Handler: Item löschen
  function handleDeleteItem(id) {
    // Falls das gelöschte Item gerade bearbeitet wird, Edit-Modus beenden
    if (editingId === id) {
      setEditingId(null);
    }
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }

  // Handler: Favorit umschalten
  function handleToggleFavorite(id) {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, favorite: !item.favorite }
          : item
      )
    );
  }

  // Handler: Item bearbeiten (Edit-Modus starten)
  function handleStartEdit(id) {
    setEditingId(id);
  }

  // Handler: Bearbeitung abbrechen
  function handleCancelEdit() {
    setEditingId(null);
  }

  // Handler: Änderungen speichern
  function handleSaveEdit(id, updatedData) {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, ...updatedData }
          : item
      )
    );
    setEditingId(null);
  }

  // Handler: Suchbegriff ändern
  function handleSearchChange(term) {
    setSearchTerm(term);
  }

  // Handler: Tag-Filter ändern
  function handleTagFilter(tag) {
    // Wenn der gleiche Tag nochmal geklickt wird, Filter zurücksetzen
    setActiveTag(tag === activeTag ? null : tag);
  }

  // Handler: Alle Filter zurücksetzen
  function handleResetFilters() {
    setSearchTerm('');
    setActiveTag(null);
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="app">
      <Header itemCount={items.length} />

      <main className="app-main">
        <aside className="app-sidebar">
          <ItemForm onAdd={handleAddItem} />
        </aside>

        <section className="app-content">
          {/* Suchfeld */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          {/* Tag-Filter Buttons */}
          <TagFilter
            tags={allTags}
            activeTag={activeTag}
            onTagClick={handleTagFilter}
          />

          {/* Item-Liste */}
          <ItemList
            items={filteredItems}
            totalCount={items.length}
            editingId={editingId}
            onDelete={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
