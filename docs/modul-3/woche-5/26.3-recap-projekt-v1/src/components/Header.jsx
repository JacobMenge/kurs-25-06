// ===========================================================================
// HEADER.JSX - Einfache Anzeigekomponente
// ===========================================================================
//
// Diese Datei zeigt eine einfache praesentative Komponente
// Sie hat keinen eigenen State und zeigt nur Daten an die sie per Props bekommt
//
// React-Konzepte in dieser Datei:
// - Praesentative Komponenten: Komponenten ohne eigenen State
// - Props: Daten von der Elternkomponente empfangen
// - Props Destructuring: Props direkt in der Funktionssignatur auspacken
// - JSX: HTML-aehnliche Syntax in JavaScript
// - Ternaerer Operator: Bedingte Darstellung in JSX
//
// ===========================================================================

// Props Destructuring direkt in der Funktionssignatur
// statt function Header(props) und dann props.itemCount
// koennen wir die Props direkt auspacken mit { itemCount }
// das macht den Code kuerzer und lesbarer
function Header({ itemCount }) {
  // JSX wird zurueckgegeben
  // bei einfachen Komponenten ohne Logik kann man direkt returnen
  return (
    // semantisches HTML Element fuer den Kopfbereich
    // header hat Bedeutung fuer Screenreader und SEO
    <header className="header">
      {/* Container fuer Titel und Untertitel */}
      <div className="header-content">
        {/* h1 ist die Hauptueberschrift der Seite
            es sollte nur eine h1 pro Seite geben */}
        <h1 className="header-title">Mini-Hub</h1>
        <p className="header-subtitle">
          Deine Linksammlung & Notizen
        </p>
      </div>

      {/* Bereich fuer Statistiken */}
      <div className="header-stats">
        {/* Anzeige der Anzahl der Items
            geschweifte Klammern {} erlauben JavaScript in JSX
            hier verwenden wir einen ternaeren Operator fuer die Grammatik
            bei genau 1 Item zeigen wir Item sonst Items */}
        <span className="item-count">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>
    </header>
  );
}

// default export der Komponente
// andere Dateien koennen sie mit import Header from './Header' laden
export default Header;
