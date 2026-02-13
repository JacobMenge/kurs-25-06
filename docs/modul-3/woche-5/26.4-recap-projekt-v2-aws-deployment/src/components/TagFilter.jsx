// ===========================================================================
// TAGFILTER.JSX - Tag-Filter Buttons (Feature 2)
// ===========================================================================
//
// Zeigt alle verfügbaren Tags als klickbare Buttons
// Ein Klick filtert die Liste auf Items mit diesem Tag
//
// React-Konzepte:
// - Listen rendern mit map
// - Dynamische CSS-Klassen basierend auf State
// - Event Handling mit Callbacks
//
// ===========================================================================

function TagFilter({ tags, activeTag, onTagClick }) {
  // Wenn keine Tags vorhanden sind, nichts anzeigen
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="tag-filter">
      {/* "Alle" Button zum Zurücksetzen */}
      <button
        className={`tag-filter-btn ${activeTag === null ? 'tag-filter-btn--active' : ''}`}
        onClick={() => onTagClick(null)}
      >
        Alle
      </button>

      {/* Ein Button pro Tag */}
      {tags.map(tag => (
        <button
          key={tag}
          className={`tag-filter-btn ${activeTag === tag ? 'tag-filter-btn--active' : ''}`}
          onClick={() => onTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default TagFilter;
