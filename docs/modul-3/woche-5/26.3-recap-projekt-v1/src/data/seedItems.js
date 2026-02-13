// ===========================================================================
// SEEDITEMS.JS - Initiale Beispieldaten
// ===========================================================================
//
// Diese Datei enthaelt die Demo-Daten fuer den ersten Start der App
// Sie zeigt wie man Daten strukturiert und exportiert
//
// Konzepte in dieser Datei:
// - Datenstruktur: Wie Items aufgebaut sind
// - Named Export: Export mit geschweiften Klammern beim Import
// - Array von Objekten: Typische Datenstruktur in React
// - ISO-Datumsformat: Standard fuer Zeitstempel
//
// ===========================================================================

// named export statt default export
// bei named exports muss man beim Import die geschweiften Klammern verwenden
// import { seedItems } from './seedItems'
// der Vorteil ist dass man mehrere Dinge aus einer Datei exportieren kann

// das Array enthaelt Beispiel-Items mit allen moeglichen Feldern
// so sieht der User sofort wie die App funktioniert
export const seedItems = [
  {
    // jedes Item braucht eine eindeutige ID
    // bei Seed-Daten verwenden wir feste IDs
    // bei neuen Items generiert crypto.randomUUID eine zufaellige ID
    id: 'seed-1',

    // der Titel ist das wichtigste Feld und Pflicht
    title: 'React Dokumentation',

    // URL ist optional
    // wenn vorhanden wird ein klickbarer Link angezeigt
    url: 'https://react.dev',

    // Tags als Array von Strings
    // ermoeglicht spaeter Filterung nach Kategorien
    tags: ['react', 'docs', 'learning'],

    // Favoriten-Status als Boolean
    // favorisierte Items werden hervorgehoben dargestellt
    favorite: true,

    // Erstellungsdatum als ISO-8601 String
    // ISO-Format ist international eindeutig und gut zu parsen
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 'seed-2',
    title: 'Vite Getting Started',
    url: 'https://vitejs.dev/guide/',
    tags: ['vite', 'tooling', 'build'],
    favorite: false,
    createdAt: '2024-01-16T14:20:00.000Z'
  },
  {
    id: 'seed-3',
    title: 'MDN Web Docs - JavaScript',
    url: 'https://developer.mozilla.org/de/docs/Web/JavaScript',
    tags: ['javascript', 'docs', 'mdn'],
    favorite: true,
    createdAt: '2024-01-17T09:00:00.000Z'
  },
  {
    id: 'seed-4',
    title: 'CSS Tricks - Flexbox Guide',
    url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    tags: ['css', 'flexbox', 'layout'],
    favorite: false,
    createdAt: '2024-01-18T11:45:00.000Z'
  },
  {
    id: 'seed-5',
    title: 'GitHub - React Projekt Ideen',
    url: 'https://github.com/topics/react',
    tags: ['github', 'react', 'inspiration'],
    favorite: false,
    createdAt: '2024-01-19T16:30:00.000Z'
  },
  {
    // Beispiel fuer ein Item ohne URL
    // zeigt dass URL optional ist
    // praktisch fuer reine Notizen ohne Verlinkung
    id: 'seed-6',
    title: 'Notizen zum useState Hook',
    url: '',
    tags: ['react', 'hooks', 'notizen'],
    favorite: false,
    createdAt: '2024-01-20T08:15:00.000Z'
  }
];
