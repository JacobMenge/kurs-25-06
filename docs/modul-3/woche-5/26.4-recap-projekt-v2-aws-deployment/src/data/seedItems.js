// ===========================================================================
// SEEDITEMS.JS - Initiale Beispieldaten
// ===========================================================================
//
// Demo-Daten fuer den ersten Start der App
// Zeigt verschiedene Anwendungsfaelle: mit/ohne URL, verschiedene Tags
//
// ===========================================================================

export const seedItems = [
  {
    id: 'seed-1',
    title: 'React Dokumentation',
    url: 'https://react.dev',
    tags: ['react', 'docs', 'learning'],
    favorite: true,
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
    id: 'seed-6',
    title: 'Notizen zum useState Hook',
    url: '',
    tags: ['react', 'hooks', 'notizen'],
    favorite: false,
    createdAt: '2024-01-20T08:15:00.000Z'
  }
];
