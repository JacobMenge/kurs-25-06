// ===========================================================================
// ITEMCARD.JSX - Item-Karte mit Edit-Modus (Feature 3)
// ===========================================================================
//
// Zeigt ein Item als Karte an
// Kann zwischen Anzeige-Modus und Edit-Modus wechseln
//
// React-Konzepte:
// - Conditional Rendering für Edit-Modus vs Normal-Modus
// - Lokaler State für Edit-Formular
// - Event Handling mit Callbacks
//
// ===========================================================================

import { useState, useEffect } from 'react';

function ItemCard({
  item,
  isEditing,
  onDelete,
  onToggleFavorite,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}) {
  // Lokaler State für das Edit-Formular
  // Wird mit aktuellen Item-Werten initialisiert wenn Edit-Modus startet
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url || '');
  const [editTagsInput, setEditTagsInput] = useState(
    item.tags ? item.tags.join(', ') : ''
  );

  // Wenn der Edit-Modus startet, Formular mit aktuellen Werten füllen
  useEffect(() => {
    if (isEditing) {
      setEditTitle(item.title);
      setEditUrl(item.url || '');
      setEditTagsInput(item.tags ? item.tags.join(', ') : '');
    }
  }, [isEditing, item]);

  // Handler: Änderungen speichern
  function handleSave() {
    // Validierung: Titel darf nicht leer sein
    if (editTitle.trim() === '') {
      return;
    }

    // Tags parsen
    const tags = editTagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    // Callback an Parent mit aktualisierten Daten
    onSaveEdit(item.id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      tags: tags
    });
  }

  // Handler: Abbrechen (ESC-Taste oder Cancel-Button)
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onCancelEdit();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  }

  // Datum formatieren
  const formattedDate = new Date(item.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // =========================================================================
  // EDIT MODUS
  // =========================================================================
  if (isEditing) {
    return (
      <article className="item-card item-card--editing">
        <div className="edit-form" onKeyDown={handleKeyDown}>
          {/* Titel Input */}
          <input
            type="text"
            className="edit-input"
            placeholder="Titel"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />

          {/* URL Input */}
          <input
            type="url"
            className="edit-input"
            placeholder="URL (optional)"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
          />

          {/* Tags Input */}
          <input
            type="text"
            className="edit-input"
            placeholder="Tags (kommagetrennt)"
            value={editTagsInput}
            onChange={(e) => setEditTagsInput(e.target.value)}
          />

          {/* Action Buttons */}
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

          <p className="edit-hint">
            Tipp: Ctrl+Enter zum Speichern, Escape zum Abbrechen
          </p>
        </div>
      </article>
    );
  }

  // =========================================================================
  // NORMAL MODUS (Anzeige)
  // =========================================================================
  return (
    <article className={`item-card ${item.favorite ? 'item-card--favorite' : ''}`}>
      <div className="item-card-header">
        <h3 className="item-title">{item.title}</h3>

        <button
          className={`favorite-btn ${item.favorite ? 'favorite-btn--active' : ''}`}
          onClick={() => onToggleFavorite(item.id)}
          title={item.favorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufuegen'}
          aria-label={item.favorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufuegen'}
        >
          {item.favorite ? '★' : '☆'}
        </button>
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="item-url"
        >
          {item.url}
        </a>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="item-tags">
          {item.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="item-card-footer">
        <span className="item-date">
          Erstellt: {formattedDate}
        </span>

        <div className="item-card-actions">
          {/* Edit Button - NEU in V2 */}
          <button
            className="edit-btn-trigger"
            onClick={() => onStartEdit(item.id)}
            title="Item bearbeiten"
            aria-label="Item bearbeiten"
          >
            Bearbeiten
          </button>

          <button
            className="delete-btn"
            onClick={() => onDelete(item.id)}
            title="Item loeschen"
            aria-label="Item loeschen"
          >
            Loeschen
          </button>
        </div>
      </div>
    </article>
  );
}

export default ItemCard;
