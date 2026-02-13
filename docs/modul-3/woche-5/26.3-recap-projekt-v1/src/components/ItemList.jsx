// ===========================================================================
// ITEMLIST.JSX - Listen-Komponente mit Conditional Rendering
// ===========================================================================
//
// Diese Datei zeigt wie man Listen rendert und zwischen verschiedenen
// Ansichten wechselt je nach Datenstand
//
// React-Konzepte in dieser Datei:
// - Listen rendern: Array.map um Komponenten zu erzeugen
// - key Prop: Eindeutige Identifikation von Listen-Elementen
// - Conditional Rendering: Verschiedene UI je nach Zustand
// - Early Return: Fruehes Beenden bei bestimmten Bedingungen
// - Props Drilling: Props durch Komponenten durchreichen
// - Komponenten-Komposition: Kindkomponenten einbetten
//
// ===========================================================================

// Import der ItemCard Komponente
// ItemList ist selbst eine Kindkomponente von App
// und ItemCard ist eine Kindkomponente von ItemList
// so entsteht die Komponentenhierarchie
import ItemCard from './ItemCard';

// Props Destructuring
// items ist das Array mit allen Items
// onDelete und onToggleFavorite sind Callback-Funktionen
// die wir an ItemCard weiterreichen
function ItemList({ items, onDelete, onToggleFavorite }) {
  // Conditional Rendering: wenn keine Items vorhanden sind
  // zeigen wir einen Empty-State statt einer leeren Liste
  // das ist bessere UX weil der User Feedback bekommt
  //
  // Early Return Pattern: wenn die Bedingung erfuellt ist
  // geben wir sofort JSX zurueck und der Rest der Funktion wird nicht ausgefuehrt
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

  // wenn wir hier ankommen gibt es mindestens ein Item
  // wir rendern die Liste mit allen Items
  return (
    <div className="item-list">
      {/* map transformiert das items-Array in ein Array von JSX-Elementen
          fuer jedes item im Array erzeugen wir eine ItemCard Komponente

          die key Prop ist bei Listen in React Pflicht
          React nutzt den key um Elemente zu identifizieren
          wenn sich die Liste aendert kann React effizient updaten
          der key muss eindeutig und stabil sein
          hier nutzen wir item.id weil jedes Item eine unique ID hat

          WICHTIG: niemals den Array-Index als key verwenden
          das fuehrt zu Problemen wenn Items hinzugefuegt geloescht oder sortiert werden */}
      {items.map(item => (
        <ItemCard
          key={item.id}
          // item als Prop weitergeben
          // ItemCard bekommt alle Daten des Items
          item={item}
          // Callback-Funktionen durchreichen
          // ItemList ruft diese nicht selbst auf
          // sondern gibt sie an ItemCard weiter
          // das nennt man Props Drilling
          // bei tieferen Hierarchien kann man Context oder State-Management nutzen
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default ItemList;
