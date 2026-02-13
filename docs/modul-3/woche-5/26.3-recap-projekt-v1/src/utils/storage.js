// ===========================================================================
// STORAGE.JS - Hilfsfunktionen fuer localStorage
// ===========================================================================
//
// Diese Datei zeigt wie man Logik aus Komponenten auslagert
// Die Funktionen sind reine JavaScript-Funktionen ohne React
//
// Konzepte in dieser Datei:
// - Separation of Concerns: Logik von UI trennen
// - localStorage API: Daten im Browser speichern
// - JSON stringify/parse: Objekte in Strings umwandeln und zurueck
// - Error Handling: try-catch fuer robuste Funktionen
// - Named Exports: Mehrere Funktionen aus einer Datei exportieren
//
// ===========================================================================

// der Schluessel unter dem die Daten im localStorage gespeichert werden
// als Konstante definiert damit er nicht versehentlich falsch geschrieben wird
const STORAGE_KEY = 'mini-hub-items';

// laedt Items aus dem localStorage
// gibt das Array zurueck oder null wenn nichts gespeichert ist
export function loadItems() {
  // try-catch faengt moegliche Fehler ab
  // localStorage kann Fehler werfen wenn zum Beispiel
  // der Speicher voll ist oder im Private Mode blockiert wird
  try {
    // getItem holt den Wert zu einem Schluessel
    // gibt null zurueck wenn der Schluessel nicht existiert
    const stored = localStorage.getItem(STORAGE_KEY);

    // wenn nichts gespeichert ist geben wir null zurueck
    // die App-Komponente weiss dann dass sie die Seed-Daten verwenden soll
    if (!stored) {
      return null;
    }

    // JSON.parse wandelt den JSON-String zurueck in ein JavaScript-Objekt
    // localStorage kann nur Strings speichern
    // deshalb muessen wir beim Speichern stringify und beim Laden parse verwenden
    return JSON.parse(stored);
  } catch (error) {
    // bei einem Fehler loggen wir ihn in die Konsole
    // und geben null zurueck damit die App trotzdem funktioniert
    console.error('Fehler beim Laden der Items:', error);
    return null;
  }
}

// speichert Items im localStorage
// bekommt das Array als Parameter
export function saveItems(items) {
  try {
    // JSON.stringify wandelt das JavaScript-Array in einen JSON-String
    // setItem speichert den String unter dem Schluessel
    // wenn der Schluessel schon existiert wird der Wert ueberschrieben
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    // bei einem Fehler loggen wir ihn nur
    // die App funktioniert weiter aber die Daten gehen beim Neuladen verloren
    console.error('Fehler beim Speichern der Items:', error);
  }
}

// loescht alle Items aus dem localStorage
// nuetzlich zum Zuruecksetzen der App auf die Seed-Daten
// wird aktuell nicht verwendet aber ist fuer Debugging praktisch
export function clearItems() {
  try {
    // removeItem loescht den Schluessel und seinen Wert
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Fehler beim Loeschen der Items:', error);
  }
}
