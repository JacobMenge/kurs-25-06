---
title: "Code-Beispiele \u2013 Rezeptbuch"
---

# Code-Beispiele – Rezeptbuch

[:material-github: Auf GitHub ansehen](https://github.com/JacobMenge/kurs-25-06/tree/master/docs/modul-3/woche-8/code/rezeptbuch){ .md-button }

## Projektstruktur

```
rezeptbuch/
├── compose.yaml
├── .env.example
├── .gitignore
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── nginx.conf
    ├── Dockerfile
    ├── .dockerignore
    └── src/
        ├── App.jsx
        └── main.jsx
```

---

## Root-Dateien

### `compose.yaml`

```yaml
--8<-- "modul-3/woche-8/code/rezeptbuch/compose.yaml"
```

### `.env.example`

```bash
--8<-- "modul-3/woche-8/code/rezeptbuch/.env.example"
```

### `.gitignore`

```text
--8<-- "modul-3/woche-8/code/rezeptbuch/.gitignore"
```

---

## Backend

### `backend/app.py`

```python
--8<-- "modul-3/woche-8/code/rezeptbuch/backend/app.py"
```

### `backend/requirements.txt`

```text
--8<-- "modul-3/woche-8/code/rezeptbuch/backend/requirements.txt"
```

### `backend/Dockerfile`

```dockerfile
--8<-- "modul-3/woche-8/code/rezeptbuch/backend/Dockerfile"
```

### `backend/.dockerignore`

```text
--8<-- "modul-3/woche-8/code/rezeptbuch/backend/.dockerignore"
```

---

## Frontend

### `frontend/index.html`

```html
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/index.html"
```

### `frontend/package.json`

```json
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/package.json"
```

### `frontend/vite.config.js`

```javascript
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/vite.config.js"
```

### `frontend/nginx.conf`

```nginx
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/nginx.conf"
```

### `frontend/Dockerfile`

```dockerfile
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/Dockerfile"
```

### `frontend/.dockerignore`

```text
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/.dockerignore"
```

### `frontend/src/App.jsx`

```jsx
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/src/App.jsx"
```

### `frontend/src/main.jsx`

```jsx
--8<-- "modul-3/woche-8/code/rezeptbuch/frontend/src/main.jsx"
```
