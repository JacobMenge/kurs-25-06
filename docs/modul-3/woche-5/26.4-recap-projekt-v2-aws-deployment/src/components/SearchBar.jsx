// ===========================================================================
// SEARCHBAR.JSX - Suchfeld-Komponente (Feature 1)
// ===========================================================================
//
// Diese Komponente implementiert die Live-Suche
// Sie ist ein Controlled Component: der Wert kommt aus dem Parent-State
//
// React-Konzepte:
// - Controlled Input: value und onChange aus Props
// - Callback Props: Änderungen an Parent melden
// - Einfache präsentative Komponente ohne eigenen State
//
// ===========================================================================

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <input
      type="text"
      className="search-input"
      placeholder="Suche nach Titel oder Tags..."
      // Controlled: Wert kommt aus dem Parent-State
      value={searchTerm}
      // Bei Eingabe: Callback an Parent mit neuem Wert
      onChange={(e) => onSearchChange(e.target.value)}
      // Accessibility
      aria-label="Items durchsuchen"
    />
  );
}

export default SearchBar;
