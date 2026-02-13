// ===========================================================================
// APP.JSX - Hauptkomponente und State-Management
// ===========================================================================
//
// Diese Datei ist das Herzstück der Anwendung
// Hier wird der globale State verwaltet und an Kindkomponenten weitergegeben
//
// React-Konzepte in dieser Datei:
// - useState: Hook zum Verwalten von State in Funktionskomponenten
// - useEffect: Hook fuer Seiteneffekte wie localStorage-Zugriffe
// - Lazy Initialization: State nur beim ersten Render berechnen
// - Lifting State Up: State in der Elternkomponente halten
// - Props: Daten und Funktionen an Kindkomponenten weitergeben
// - Immutability: State nie direkt aendern sondern neue Objekte erstellen
// - Spread-Operator: Objekte kopieren und erweitern
// - Array-Methoden: filter und map fuer State-Updates
//
// ===========================================================================

// useState ist ein React Hook zum Verwalten von State in Funktionskomponenten
// State ist Daten die sich aendern koennen und bei Aenderung ein Re-Render ausloesen
// useEffect ist ein Hook fuer Seiteneffekte wie API-Calls oder localStorage-Zugriffe
import { useState, useEffect } from 'react';

// Import der Kindkomponenten
// jede Komponente hat ihre eigene Datei was den Code uebersichtlich haelt
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';

// Hilfsfunktionen fuer localStorage ausgelagert in eigene Datei
// so bleibt die Komponente sauber und die Logik wiederverwendbar
import { loadItems, saveItems } from './utils/storage';

// Beispieldaten die beim ersten Start der App verwendet werden
import { seedItems } from './data/seedItems';

// CSS-Import fuer Styles die zu dieser Komponente gehoeren
import './App.css';

// Funktionskomponente App
// in React definiert man Komponenten als Funktionen die JSX zurueckgeben
// der Funktionsname muss mit Grossbuchstaben beginnen
function App() {
  // useState Hook zum Verwalten der Items-Liste
  // die Syntax ist immer const [state, setState] = useState(initialValue)
  // state ist der aktuelle Wert
  // setState ist die Funktion zum Aendern des Wertes
  //
  // Hier verwenden wir Lazy Initialization indem wir eine Funktion uebergeben
  // diese Funktion wird nur beim ersten Render ausgefuehrt nicht bei jedem Re-Render
  // das ist wichtig weil localStorage-Zugriffe langsam sind
  // ohne Lazy Init wuerde loadItems bei jedem Render aufgerufen werden
  const [items, setItems] = useState(() => {
    // versuche Items aus localStorage zu laden
    const stored = loadItems();
    // wenn nichts gespeichert ist verwende die Seed-Daten
    // das || ist der logische Oder-Operator
    // wenn stored null oder undefined ist wird seedItems verwendet
    return stored || seedItems;
  });

  // useEffect Hook fuer Seiteneffekte
  // der erste Parameter ist eine Funktion die ausgefuehrt wird
  // der zweite Parameter ist das Dependency Array
  //
  // das Dependency Array [items] bedeutet dass der Effekt nur laeuft
  // wenn sich items aendert
  // bei leerem Array [] wuerde der Effekt nur einmal beim Mounting laufen
  // ohne Array wuerde er bei jedem Render laufen was meist falsch ist
  //
  // dieser Effekt synchronisiert den State mit dem localStorage
  // jedes Mal wenn sich items aendert wird es gespeichert
  useEffect(() => {
    saveItems(items);
  }, [items]);

  // Handler-Funktion zum Hinzufuegen eines neuen Items
  // diese Funktion wird als Prop an ItemForm weitergegeben
  // wenn dort das Formular abgeschickt wird ruft ItemForm diese Funktion auf
  //
  // das Prinzip heisst Lifting State Up
  // der State liegt in der Elternkomponente App
  // Kindkomponenten bekommen Funktionen um den State zu aendern
  function handleAddItem(newItemData) {
    // neues Item-Objekt erstellen mit allen benoetigten Feldern
    const newItem = {
      // Spread-Operator kopiert alle Eigenschaften von newItemData
      // also title url und tags
      ...newItemData,
      // crypto.randomUUID erzeugt eine eindeutige ID
      // jedes Item braucht eine ID damit React es identifizieren kann
      id: crypto.randomUUID(),
      // neues Item ist erstmal kein Favorit
      favorite: false,
      // Erstellungsdatum als ISO-String speichern
      createdAt: new Date().toISOString()
    };

    // State aktualisieren mit der Setter-Funktion
    // wir verwenden die Funktions-Form von setItems
    // prevItems ist der vorherige State
    // diese Form ist wichtig wenn der neue State vom alten abhaengt
    // sie stellt sicher dass wir immer den aktuellsten State haben
    //
    // [newItem, ...prevItems] erstellt ein neues Array
    // mit newItem am Anfang und allen bisherigen Items dahinter
    // wir mutieren nie den State direkt sondern erstellen immer neue Objekte
    setItems(prevItems => [newItem, ...prevItems]);
  }

  // Handler-Funktion zum Loeschen eines Items
  // bekommt die ID des zu loeschenden Items als Parameter
  function handleDeleteItem(id) {
    // filter erstellt ein neues Array ohne das Item mit der gegebenen ID
    // filter behaelt nur Items fuer die die Bedingung true ergibt
    // item.id !== id ist true fuer alle Items ausser dem zu loeschenden
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }

  // Handler-Funktion zum Umschalten des Favoriten-Status
  function handleToggleFavorite(id) {
    // map erstellt ein neues Array mit transformierten Elementen
    // fuer jedes Item pruefen wir ob es das gesuchte ist
    setItems(prevItems =>
      prevItems.map(item =>
        // wenn die ID uebereinstimmt
        item.id === id
          // erstelle ein neues Objekt mit umgekehrtem favorite-Wert
          // Spread-Operator kopiert alle anderen Eigenschaften
          ? { ...item, favorite: !item.favorite }
          // sonst das Item unveraendert zurueckgeben
          : item
      )
    );
  }

  // die return-Anweisung gibt JSX zurueck
  // JSX sieht aus wie HTML ist aber JavaScript
  // es wird von React in echte DOM-Elemente umgewandelt
  return (
    // className statt class weil class ein reserviertes Wort in JS ist
    <div className="app">
      {/* Header bekommt die Anzahl der Items als Prop
          Props sind wie Funktionsargumente fuer Komponenten
          sie fliessen immer von oben nach unten also von Eltern zu Kindern */}
      <Header itemCount={items.length} />

      <main className="app-main">
        {/* aside fuer die Seitenleiste mit dem Formular */}
        <aside className="app-sidebar">
          {/* ItemForm bekommt die Handler-Funktion als Prop
              wenn das Formular abgeschickt wird ruft ItemForm onAdd auf
              die Namen der Props koennen frei gewaehlt werden
              hier heisst die Prop onAdd und der Wert ist handleAddItem */}
          <ItemForm onAdd={handleAddItem} />
        </aside>

        {/* Hauptbereich mit der Liste der Items */}
        <section className="app-content">
          {/* ItemList bekommt drei Props
              items ist das Array mit allen Items
              onDelete und onToggleFavorite sind Handler-Funktionen
              ItemList reicht diese an ItemCard weiter */}
          <ItemList
            items={items}
            onDelete={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      </main>
    </div>
  );
}

// export default macht die Komponente in anderen Dateien verfuegbar
// pro Datei kann es nur ein default export geben
// beim Import kann der Name frei gewaehlt werden
export default App;
