// ===========================================================================
// ITEMFORM.JSX - Formular mit Controlled Components
// ===========================================================================
//
// Diese Datei zeigt wie man Formulare in React baut
// React kontrolliert die Eingabewerte ueber State
//
// React-Konzepte in dieser Datei:
// - Controlled Components: React kontrolliert Formularwerte
// - useState fuer Formulare: Jedes Feld hat einen eigenen State
// - Event Handling: onChange und onSubmit
// - Form Submission: Daten sammeln und an Eltern senden
// - preventDefault: Standard-Browser-Verhalten unterdruecken
// - Callback Props: Daten an Elternkomponente senden
//
// ===========================================================================

// useState importieren fuer die Formularfelder
import { useState } from 'react';

// onAdd ist die Callback-Funktion die beim Submit aufgerufen wird
// sie kommt von der App-Komponente und fuegt dort das neue Item hinzu
function ItemForm({ onAdd }) {
  // separate State-Variablen fuer jedes Formularfeld
  // man koennte auch ein Objekt verwenden aber separate States sind einfacher
  // bei Aenderung eines Feldes werden nur die betroffenen Komponenten neu gerendert

  // State fuer den Titel des Items
  // useState('') initialisiert mit leerem String
  const [title, setTitle] = useState('');

  // State fuer die URL
  const [url, setUrl] = useState('');

  // State fuer die Tags als kommaseparierter String
  // die Umwandlung in ein Array passiert erst beim Submit
  const [tagsInput, setTagsInput] = useState('');

  // Handler fuer das Absenden des Formulars
  // bekommt das Event-Objekt als Parameter
  function handleSubmit(event) {
    // preventDefault verhindert das Standard-Verhalten des Browsers
    // normalerweise wuerde das Formular die Seite neu laden
    // bei einer Single Page App wollen wir das nicht
    event.preventDefault();

    // Validierung: Titel ist Pflichtfeld
    // trim entfernt Leerzeichen am Anfang und Ende
    // wenn nur Leerzeichen eingegeben wurden ist der String leer
    if (title.trim() === '') {
      return;
    }

    // Tags aus dem kommaseparierten String in ein Array umwandeln
    // split teilt den String an jedem Komma
    // map wendet trim und toLowerCase auf jeden Tag an
    // filter entfernt leere Strings die durch mehrere Kommas entstehen
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    // neues Item-Objekt erstellen
    // nur die Felder die vom Formular kommen
    // id createdAt und favorite werden in App.jsx hinzugefuegt
    const newItem = {
      title: title.trim(),
      url: url.trim(),
      tags: tags
    };

    // Callback-Funktion aus den Props aufrufen
    // die App-Komponente kuemmert sich um das Hinzufuegen zum State
    onAdd(newItem);

    // Formular zuruecksetzen indem wir die States leeren
    // die Inputs zeigen automatisch die leeren Werte
    // weil sie Controlled Components sind
    setTitle('');
    setUrl('');
    setTagsInput('');
  }

  return (
    // onSubmit wird ausgefuehrt wenn das Formular abgeschickt wird
    // entweder durch Klick auf Submit-Button oder Enter-Taste
    <form className="item-form" onSubmit={handleSubmit}>
      <h2 className="item-form-title">Neues Item hinzufügen</h2>

      {/* Formular-Gruppe fuer den Titel */}
      <div className="form-group">
        {/* htmlFor statt for weil for ein reserviertes Wort in JS ist
            es verbindet das Label mit dem Input fuer bessere Accessibility */}
        <label htmlFor="title" className="form-label">
          Titel <span className="required">*</span>
        </label>

        {/* Controlled Input: value kommt aus dem State
            onChange aktualisiert den State bei jeder Eingabe

            bei einem Controlled Input:
            1. User tippt einen Buchstaben
            2. onChange wird aufgerufen mit dem Event
            3. setTitle aktualisiert den State
            4. React rendert den Input mit dem neuen Wert

            das passiert so schnell dass der User nichts merkt */}
        <input
          type="text"
          id="title"
          className="form-input"
          placeholder="z.B. React Dokumentation"
          // value bindet den Input an den State
          value={title}
          // e.target.value ist der aktuelle Inhalt des Inputs
          onChange={(e) => setTitle(e.target.value)}
          // required ist HTML5 Validierung
          // verhindert das Absenden wenn leer
          required
        />
      </div>

      {/* Formular-Gruppe fuer die URL */}
      <div className="form-group">
        <label htmlFor="url" className="form-label">
          URL <span className="optional">(optional)</span>
        </label>
        <input
          // type url aktiviert URL-Validierung im Browser
          type="url"
          id="url"
          className="form-input"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          // kein required weil optional
        />
      </div>

      {/* Formular-Gruppe fuer die Tags */}
      <div className="form-group">
        <label htmlFor="tags" className="form-label">
          Tags <span className="optional">(optional, kommagetrennt)</span>
        </label>
        <input
          type="text"
          id="tags"
          className="form-input"
          placeholder="z.B. react, docs, learning"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      {/* Submit-Button
          type submit ist wichtig damit das Formular abgeschickt wird
          ohne type waere es ein normaler Button ohne Formular-Funktion */}
      <button type="submit" className="submit-btn">
        Item hinzufügen
      </button>
    </form>
  );
}

export default ItemForm;
