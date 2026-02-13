# Lösung: Übung 4 - Custom Hook useLocalStorageState

## Konzept: Wiederverwendbare Logik extrahieren

Der Hook kapselt die gesamte localStorage-Synchronisation. Er verhält sich wie `useState`, speichert aber automatisch im localStorage.

## Neuer Hook: src/hooks/useLocalStorageState.js

```javascript
import { useState, useEffect } from 'react';

/**
 * Custom Hook: Synchronisiert State mit localStorage
 * @param {string} key - Der localStorage-Schlüssel
 * @param {any} initialValue - Der Startwert falls nichts gespeichert ist
 * @returns {[any, function]} - [state, setState] wie bei useState
 */
export function useLocalStorageState(key, initialValue) {
  // State mit Lazy Initialization
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return initialValue;
    } catch (error) {
      console.error(`Fehler beim Laden von "${key}":`, error);
      return initialValue;
    }
  });

  // Bei State-Änderung: In localStorage speichern
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Fehler beim Speichern von "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
```

## Änderungen in App.jsx

### Vorher:

```javascript
import { useState, useEffect } from 'react';
import { loadItems, saveItems } from './utils/storage';
import { seedItems } from './data/seedItems';

function App() {
  const [items, setItems] = useState(() => {
    const stored = loadItems();
    return stored || seedItems;
  });

  useEffect(() => {
    saveItems(items);
  }, [items]);

  // ...
}
```

### Nachher:

```javascript
import { useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { seedItems } from './data/seedItems';

function App() {
  // Eine Zeile statt useState + useEffect!
  const [items, setItems] = useLocalStorageState('mini-hub-items', seedItems);

  // ...
}
```

## Betroffene Dateien

- `src/hooks/useLocalStorageState.js` - Neuer Hook (erstellen)
- `src/App.jsx` - Hook verwenden, useEffect entfernen

## Key Points

### Lazy Initialization

```javascript
// Die Funktion wird nur beim ERSTEN Render ausgeführt
const [state, setState] = useState(() => {
  return localStorage.getItem(key); // Nur einmal!
});
```

### Dependency Array

```javascript
useEffect(() => {
  localStorage.setItem(key, JSON.stringify(state));
}, [key, state]); // Beides im Array!
```

Der `key` muss im Dependency Array sein, falls er sich ändern könnte (auch wenn das in unserer App nicht passiert).

### Error Handling

```javascript
try {
  return JSON.parse(stored);
} catch (error) {
  console.error(`Fehler beim Laden von "${key}":`, error);
  return initialValue; // Fallback!
}
```

Korrupte Daten im localStorage führen nicht zum Crash.

## Häufige Fehler

1. **Lazy Initialization vergessen** - `useState(localStorage.getItem())` lädt bei jedem Render
2. **Key nicht im Dependency Array** - Kann zu Bugs führen wenn Key sich ändert
3. **JSON.parse ohne try/catch** - Korrupte Daten können die App crashen
4. **Rückgabewert falsch** - Muss `[state, setState]` Array sein, nicht Objekt

## Testen

1. App verhält sich exakt wie vorher
2. Items werden beim Hinzufügen/Löschen automatisch gespeichert
3. Nach Reload sind alle Änderungen noch da
4. Bei korrupten localStorage-Daten: App startet mit initialValue

## Bonus: Hook für andere Daten wiederverwenden

```javascript
// Beispiel: User-Präferenzen speichern
const [theme, setTheme] = useLocalStorageState('theme', 'light');
const [sortOrder, setSortOrder] = useLocalStorageState('sortOrder', 'date');
```

Der Hook ist generisch und funktioniert mit jedem Datentyp!
