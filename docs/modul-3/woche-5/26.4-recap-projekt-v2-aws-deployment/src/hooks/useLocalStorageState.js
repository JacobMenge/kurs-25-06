// ===========================================================================
// USELOCALSTORAGESTATE.JS - Custom Hook fuer localStorage Synchronisation
// ===========================================================================
//
// Dieser Custom Hook kapselt die localStorage-Logik
// Er verhält sich wie useState aber persistiert den Wert automatisch
//
// React-Konzepte in dieser Datei:
// - Custom Hooks: Wiederverwendbare Hook-Logik extrahieren
// - Lazy Initialization: Initialen Wert nur einmal berechnen
// - useEffect: Seiteneffekte beim State-Update ausfuehren
// - Generischer Code: Hook funktioniert mit beliebigen Datentypen
//
// ===========================================================================

import { useState, useEffect } from 'react';

/**
 * Custom Hook der sich wie useState verhält aber automatisch im localStorage speichert
 *
 * @param {string} key - Der Schlüssel unter dem der Wert im localStorage gespeichert wird
 * @param {*} initialValue - Der Anfangswert wenn nichts im localStorage ist
 * @returns {[*, Function]} - Array mit [currentValue, setValue] wie bei useState
 *
 * Beispiel:
 * const [items, setItems] = useLocalStorageState('my-items', []);
 */
export function useLocalStorageState(key, initialValue) {
  // useState mit Lazy Initialization
  // Die Funktion wird nur beim ersten Render ausgefuehrt
  // Das verhindert wiederholte localStorage-Zugriffe bei jedem Re-Render
  const [value, setValue] = useState(() => {
    try {
      // Versuche den gespeicherten Wert aus localStorage zu laden
      const storedValue = localStorage.getItem(key);

      // Wenn ein Wert vorhanden ist, parse ihn aus JSON
      if (storedValue !== null) {
        return JSON.parse(storedValue);
      }

      // Wenn nichts gespeichert ist, verwende den Initialwert
      // Falls initialValue eine Funktion ist, rufe sie auf (wie bei useState)
      if (typeof initialValue === 'function') {
        return initialValue();
      }
      return initialValue;

    } catch (error) {
      // Bei Fehlern (z.B. ungültiges JSON) verwende den Initialwert
      console.error(`Fehler beim Laden von localStorage key "${key}":`, error);
      if (typeof initialValue === 'function') {
        return initialValue();
      }
      return initialValue;
    }
  });

  // useEffect synchronisiert den State mit localStorage
  // Bei jeder Änderung von value oder key wird der Wert gespeichert
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Fehler beim Speichern in localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Rückgabe im gleichen Format wie useState: [value, setValue]
  return [value, setValue];
}
