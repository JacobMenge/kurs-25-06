// ===========================================================================
// ITEMLIST.JSX - Listen-Komponente mit Filter-Feedback
// ===========================================================================
//
// Zeigt die gefilterte Liste der Items
// Mit speziellen States für "keine Items" und "keine Treffer"
//
// ===========================================================================

import ItemCard from './ItemCard';

function ItemList({
  items,
  totalCount,
  editingId,
  onDelete,
  onToggleFavorite,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onResetFilters
}) {
  // Empty State: Überhaupt keine Items vorhanden
  if (totalCount === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <h3 className="empty-state-title">Keine Items vorhanden</h3>
        <p className="empty-state-text">
          Fuege dein erstes Item hinzu, um loszulegen!
        </p>
      </div>
    );
  }

  // No Results State: Items vorhanden aber Filter hat keine Treffer
  if (items.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">🔍</div>
        <h3 className="no-results-title">Keine Treffer</h3>
        <p className="no-results-text">
          Versuche einen anderen Suchbegriff oder Filter.
        </p>
        <button
          className="reset-filters-btn"
          onClick={onResetFilters}
        >
          Filter zuruecksetzen
        </button>
      </div>
    );
  }

  // Normale Liste mit Items
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
          onSaveEdit={onSaveEdit}
        />
      ))}
    </div>
  );
}

export default ItemList;
