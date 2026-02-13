// ===========================================================================
// ITEMCARD.JSX - Einzelne Item-Karte mit Interaktionen
// ===========================================================================
//
// Diese Datei zeigt wie man Daten darstellt und Events an Eltern weitergibt
// Die Komponente hat keinen eigenen State aber reagiert auf User-Aktionen
//
// React-Konzepte in dieser Datei:
// - Event Handling: onClick fuer Button-Klicks
// - Callback Props: Funktionen von Eltern aufrufen
// - Conditional Rendering: Elemente nur bei Bedingung anzeigen
// - Dynamische CSS-Klassen: Klassen basierend auf State aendern
// - Listen rendern: map ueber Arrays mit key Prop
// - Template Strings: Dynamische Klassennamen zusammenbauen
//
// ===========================================================================

// Props Destructuring mit drei Werten
// item enthaelt alle Daten des Items wie title url tags usw
// onDelete ist eine Callback-Funktion zum Loeschen
// onToggleFavorite ist eine Callback-Funktion zum Umschalten des Favoriten-Status
function ItemCard({ item, onDelete, onToggleFavorite }) {
  // Datum formatieren fuer die Anzeige
  // new Date() erzeugt ein Datumsobjekt aus dem ISO-String
  // toLocaleDateString formatiert es nach deutschen Konventionen
  // die Optionen bestimmen das Format: 01.01.2024
  const formattedDate = new Date(item.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    // article ist semantisches HTML fuer einen eigenstaendigen Inhalt
    // die CSS-Klasse wird dynamisch zusammengesetzt
    // Template-Strings mit Backticks erlauben eingebettete Ausdruecke
    // wenn item.favorite true ist wird die zusaetzliche Klasse angehaengt
    <article className={`item-card ${item.favorite ? 'item-card--favorite' : ''}`}>
      {/* Kopfbereich der Karte mit Titel und Favoriten-Button */}
      <div className="item-card-header">
        <h3 className="item-title">{item.title}</h3>

        {/* Button zum Umschalten des Favoriten-Status
            onClick erwartet eine Funktion die beim Klick ausgefuehrt wird
            wir verwenden eine Arrow-Function um onToggleFavorite mit der ID aufzurufen
            () => onToggleFavorite(item.id) erzeugt eine neue Funktion
            die beim Klick onToggleFavorite mit item.id als Argument aufruft */}
        <button
          // dynamische Klasse je nach Favoriten-Status
          className={`favorite-btn ${item.favorite ? 'favorite-btn--active' : ''}`}
          onClick={() => onToggleFavorite(item.id)}
          // title erscheint als Tooltip beim Hovern
          title={item.favorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufugen'}
          // aria-label fuer Screenreader wichtig fuer Barrierefreiheit
          aria-label={item.favorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufugen'}
        >
          {/* Stern-Symbol: gefuellt wenn Favorit sonst leer */}
          {item.favorite ? '★' : '☆'}
        </button>
      </div>

      {/* URL-Link wird nur angezeigt wenn eine URL vorhanden ist
          das ist Conditional Rendering mit dem && Operator
          wenn item.url truthy ist wird der rechte Teil gerendert
          wenn item.url leer oder undefined ist wird nichts gerendert */}
      {item.url && (
        <a
          href={item.url}
          // target _blank oeffnet den Link in einem neuen Tab
          target="_blank"
          // rel noopener noreferrer ist wichtig fuer Sicherheit bei target blank
          // verhindert dass die neue Seite Zugriff auf window.opener hat
          rel="noopener noreferrer"
          className="item-url"
        >
          {item.url}
        </a>
      )}

      {/* Tags werden nur angezeigt wenn welche vorhanden sind
          item.tags && prueft ob tags existiert
          item.tags.length > 0 prueft ob das Array nicht leer ist */}
      {item.tags && item.tags.length > 0 && (
        <div className="item-tags">
          {/* map iteriert ueber das Array und erzeugt fuer jeden Tag ein Element
              bei Listen in React braucht jedes Element eine eindeutige key Prop
              React nutzt den key um zu erkennen welche Elemente sich geaendert haben
              hier verwenden wir den Tag selbst als key weil Tags eindeutig sein sollten */}
          {item.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Fussbereich der Karte mit Datum und Loeschen-Button */}
      <div className="item-card-footer">
        <span className="item-date">
          Erstellt: {formattedDate}
        </span>

        {/* Loeschen-Button ruft onDelete mit der Item-ID auf
            die Elternkomponente entscheidet dann was passiert */}
        <button
          className="delete-btn"
          onClick={() => onDelete(item.id)}
          title="Item loeschen"
          aria-label="Item loeschen"
        >
          Löschen
        </button>
      </div>
    </article>
  );
}

export default ItemCard;
