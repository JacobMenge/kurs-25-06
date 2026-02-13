// ===========================================================================
// STORAGE.JS - Hilfsfunktionen fuer localStorage
// ===========================================================================
//
// Diese Datei bleibt aus Kompatibilitätsgründen erhalten
// Der Custom Hook useLocalStorageState nutzt localStorage direkt
// Diese Funktionen können für Debug-Zwecke verwendet werden
//
// ===========================================================================

const STORAGE_KEY = 'mini-hub-items';

export function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Fehler beim Laden der Items:', error);
    return null;
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Fehler beim Speichern der Items:', error);
  }
}

export function clearItems() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Fehler beim Loeschen der Items:', error);
  }
}
