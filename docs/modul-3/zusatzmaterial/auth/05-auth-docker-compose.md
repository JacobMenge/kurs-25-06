---
title: "Authentication 5 – Auth mit Docker Compose"
tags:
  - Auth
  - JWT
  - Security
  - FastAPI
  - React
---
# Auth mit Docker Compose - Praktische Übungen

## Übersicht

In dieser Übung containerisierst du das komplette Auth-System:

- **Secrets in Docker Compose** - Sichere Konfiguration mit `.env`-Dateien
- **Docker Compose Setup** - FastAPI + PostgreSQL als Container mit Auth
- **Frontend Build mit Auth** - React-App für die Produktion bauen
- **Vollständiger Test** - Das komplette System in Containern testen

In Woche 8 habt ihr Docker-Grundlagen gelernt (Images, Container, Volumes, docker-compose). Jetzt nutzt ihr dieses Wissen, um euer Auth-System in Container zu packen.

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Auth-Stack als Container | 10 min (lesen) |
| **Teil 1** | Secrets in Docker Compose (.env) | 20 min |
| **Teil 2** | Docker Compose: FastAPI + PostgreSQL mit Auth | 30 min |
| **Teil 3** | Frontend Build mit Auth | 20 min |
| **Teil 4** | Vollständiger Test des Auth-Stacks | 20 min |
| **Bonus** | HTTPS-Ausblick | 15 min (lesen) |
| | **Gesamt** | **ca. 1,5–2 Stunden** |

**Minimalpfad (ca. 50 Minuten):** Teil 1 + Teil 2. Secrets-Management und Docker Compose sind das Wichtigste. Frontend-Build und HTTPS sind optional.

> **Voraussetzung:** Docker Desktop muss installiert und gestartet sein. Docker Compose v2 (`docker compose` statt `docker-compose`) wird verwendet. Prüfe mit `docker compose version`.

---

## Rückblick: Auth-Stack als Container

### Eure Architektur in Docker

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TB
    subgraph docker ["🐳 Docker Compose"]
        direction TB
        F["⚙️ <b>FastAPI</b><br/>Port 8000<br/>SECRET_KEY aus .env"]
        P["🐘 <b>PostgreSQL</b><br/>Port 5432<br/>POSTGRES_PASSWORD aus .env"]
        F <-->|"SQL via ORM<br/>Host: <code>postgres</code>"| P
    end
    R["🖥️ <b>React</b><br/>Dev: localhost:5173<br/>Prod: nginx"] <-->|"HTTP + JWT"| F

    ENV[".env<br/>SECRET_KEY=...<br/>DATABASE_URL=...<br/>POSTGRES_PASSWORD=..."] -.->|"Secrets"| docker
```

> **Wichtig:** In Docker Compose erreichen sich Container über ihren **Service-Namen** als Hostname. Die FastAPI-App spricht PostgreSQL also über `postgres:5432` an, nicht über `localhost`.

### Wissensfrage 1

> Warum darf man den SECRET_KEY nicht direkt im Code oder Dockerfile hardcoden?

<details markdown>
<summary>Antwort anzeigen</summary>

1. **Git-Gefahr:** Hardcodierte Secrets landen im Repository. Jeder mit Zugriff auf den Code hat dann den Key – inklusive Public Repos auf GitHub.
2. **Verschiedene Environments:** Dev, Staging und Produktion brauchen verschiedene Keys. Hardcoded Keys machen das unmöglich.
3. **Docker-Images werden geteilt:** Ein Image mit hardcodetem Secret gibt den Key an jeden weiter, der das Image hat.
4. **Best Practice:** Secrets kommen aus Environment-Variablen (`.env`-Datei), die **nicht** ins Repository commitet wird (`.gitignore`).

</details>

---

## Teil 1: Secrets in Docker Compose

### Übung 1: .env für Docker einrichten

> **Ziel:** Eine `.env`-Datei mit allen Secrets erstellen, die Docker Compose verwenden kann
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Alle Secrets in `.env` stehen und `.gitignore` die Datei ignoriert

**Schritt 1: Secret Key generieren**

```bash
python -c "import secrets; print(secrets.token_hex(32))"
# → z.B.: a3f4b8c9d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1
```

**Schritt 2: `.env`-Datei erstellen**

```bash
# .env – NICHT ins Repository committen!

# PostgreSQL
POSTGRES_USER=kursapp
POSTGRES_PASSWORD=sicheres-passwort-hier
POSTGRES_DB=kursapp

# FastAPI Auth
SECRET_KEY=a3f4b8c9d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database URL (für FastAPI/SQLAlchemy)
DATABASE_URL=postgresql://kursapp:sicheres-passwort-hier@postgres:5432/kursapp
```

> **Beachte:** In `DATABASE_URL` ist der Host `postgres` – das ist der Service-Name aus docker-compose.yml, nicht `localhost`!

**Schritt 3: `.env.example` erstellen (kommt ins Repository)**

```bash
# .env.example – Template für das Team (ohne echte Werte!)

POSTGRES_USER=kursapp
POSTGRES_PASSWORD=change-me
POSTGRES_DB=kursapp

SECRET_KEY=generate-with-python-secrets-token-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

DATABASE_URL=postgresql://kursapp:change-me@postgres:5432/kursapp
```

**Schritt 4: `.gitignore` prüfen**

```bash
# .gitignore
.env
*.pyc
__pycache__/
```

### Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `.env` wird nicht geladen | Datei nicht im Projektroot | `.env` muss neben `docker-compose.yml` liegen |
| `DATABASE_URL` hat `localhost` statt `postgres` | Lokaler Wert statt Docker-Wert | In Docker: Hostname = Service-Name (`postgres`) |
| Passwort mit Sonderzeichen funktioniert nicht | URL-Encoding in DATABASE_URL | Sonderzeichen URL-encoden oder einfacheres Passwort wählen |

---

## Teil 2: Docker Compose Setup

### Übung 2: docker-compose.yml mit Auth

> **Ziel:** Eine vollständige docker-compose.yml mit FastAPI + PostgreSQL und Auth-Konfiguration
> **Zeitbedarf:** ca. 30 Minuten
> **Du bist fertig, wenn:** `docker compose up` die App startet und du dich registrieren/einloggen kannst

**Schritt 1: Dockerfile für FastAPI (falls nicht vorhanden)**

```dockerfile
# Dockerfile

FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Alembic-Migration beim Start + Server starten
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

> **Prod-Hinweis:** In echten Deployments läuft `alembic upgrade head` als separater CI/CD-Step (z.B. GitHub Actions), nicht beim Container-Start. Bei parallelen Deployments könnten sonst mehrere Container gleichzeitig migrieren. Für Lernprojekte ist der aktuelle Ansatz pragmatisch und einfach.

**Schritt 2: requirements.txt aktualisieren**

```
fastapi[standard]
sqlalchemy
psycopg2-binary
python-dotenv
alembic
passlib[bcrypt]
python-jose[cryptography]
```

**Schritt 3: docker-compose.yml erstellen**

<details markdown>
<summary>Musterlösung anzeigen</summary>

```yaml
# docker-compose.yml

services:
  # PostgreSQL-Datenbank
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # FastAPI-Backend
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: ${ALGORITHM}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES}
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

</details>

**Schritt 4: `app/auth.py` anpassen für Environment-Variablen**

Stelle sicher, dass `auth.py` die Variablen aus der Umgebung liest (nicht aus `.env` direkt – Docker setzt die Variablen):

```python
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-fallback-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
```

**Schritt 5: Starten und testen**

```bash
# Starten
docker compose up --build

# In einem neuen Terminal testen
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test", "password": "geheim123"}'

curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "geheim123"}'
```

### Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `backend` startet vor `postgres` bereit ist | Health Check fehlt oder falsch | `depends_on: postgres: condition: service_healthy` |
| `alembic upgrade head` schlägt fehl | Datenbank-Tabellen existieren schon | `alembic stamp head` einmalig ausführen |
| `SECRET_KEY` ist `None` | Environment Variable nicht gesetzt | `.env` neben `docker-compose.yml`, Variablenname prüfen |
| `psycopg2` Installationsfehler im Docker-Build | Build-Dependencies fehlen | `psycopg2-binary` statt `psycopg2` in requirements.txt |

---

## Teil 3: Frontend Build mit Auth

### Übung 3: React-App für Production bauen

> **Ziel:** Die React-App so bauen, dass sie die richtige API-URL für Docker verwendet
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Das Frontend als statische Dateien gebaut ist und die richtige API-URL verwendet

**Schritt 1: `.env.production` für Vite**

Erstelle im Frontend-Ordner:

```bash
# frontend/.env.production
VITE_API_BASE=http://localhost:8000
```

> **Erinnerung:** Vite-Environment-Variablen müssen mit `VITE_` beginnen, damit sie im Build verfügbar sind.

**Schritt 2: Frontend-Dockerfile**

```dockerfile
# frontend/Dockerfile

# Build-Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production-Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Schritt 3: Nginx-Konfiguration für SPA**

```nginx
# frontend/nginx.conf

server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    # SPA: Alle Routen auf index.html umleiten
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> **Warum `try_files`?** Eine SPA hat nur eine `index.html`. Wenn jemand direkt `/dashboard` aufruft, muss Nginx die `index.html` ausliefern – React Router übernimmt dann das Routing im Browser.

**Schritt 4: docker-compose.yml erweitern**

```yaml
services:
  # ... postgres und backend wie vorher ...

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

<details markdown>
<summary>Vollständige docker-compose.yml anzeigen</summary>

```yaml
# docker-compose.yml

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: ${ALGORITHM}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES}
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

</details>

---

## Teil 4: Vollständiger Test des Auth-Stacks

### Übung 4: Alles zusammen testen

> **Ziel:** Das komplette System in Docker starten und den Auth-Flow durchspielen
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Du dich über das Frontend registrieren, einloggen und geschützte Seiten aufrufen kannst

**Schritt 1: Alles starten**

```bash
docker compose up --build
```

**Schritt 2: Test-Durchlauf**

| Schritt | Aktion | Erwartung |
|---------|--------|-----------|
| 1 | Öffne `http://localhost:3000` | Frontend lädt |
| 2 | Klicke "Registrieren" | Register-Formular erscheint |
| 3 | Registriere einen User | Weiterleitung zum Login |
| 4 | Logge dich ein | Weiterleitung zum Dashboard |
| 5 | Öffne Browser-DevTools → Application → Local Storage | `access_token` und `refresh_token` sichtbar |
| 6 | Rufe `/dashboard` auf | User-Daten werden angezeigt |
| 7 | Klicke "Ausloggen" | Weiterleitung zum Login, Tokens gelöscht |
| 8 | Rufe `/dashboard` direkt auf | Weiterleitung zum Login (ProtectedRoute) |

**Schritt 3: API direkt testen**

```bash
# Registrieren
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"email": "docker@test.com", "name": "Docker User", "password": "test1234"}'

# Einloggen
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "docker@test.com", "password": "test1234"}'

# Token aus der Antwort kopieren und /me aufrufen
curl http://localhost:8000/me \
  -H "Authorization: Bearer DEIN_TOKEN_HIER"
```

**Schritt 4: Aufräumen**

```bash
# Stoppen
docker compose down

# Stoppen + Daten löschen (PostgreSQL-Volume)
docker compose down -v
```

### Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Frontend kann Backend nicht erreichen | CORS oder falsche URL | `VITE_API_BASE` prüfen, CORS-Config prüfen |
| `502 Bad Gateway` im Frontend | Backend noch nicht gestartet | Warten oder `depends_on` mit Health Check verwenden |
| Daten nach `docker compose down` weg | Volume gelöscht (`-v` Flag) | Ohne `-v` stoppen, oder Daten sind ohnehin temporär |
| `alembic` Fehler beim Backend-Start | Migration-Probleme | `docker compose down -v` und neu starten (löscht DB) |

---

## Bonus: HTTPS-Ausblick

### Warum HTTPS Pflicht ist für Auth

Ohne HTTPS werden Login-Daten (Email + Passwort) und JWT-Tokens im **Klartext** über das Netzwerk gesendet. Jeder, der den Netzwerkverkehr mitlesen kann (WiFi im Café, Man-in-the-Middle), kann die Daten abfangen.

| Ohne HTTPS | Mit HTTPS |
|-----------|-----------|
| Passwort lesbar im Netzwerk | Passwort verschlüsselt |
| JWT-Token stehlbar | JWT-Token geschützt |
| Keine Integritätsprüfung | Daten können nicht manipuliert werden |

### Für lokale Entwicklung

Für die Entwicklung auf `localhost` ist HTTP in Ordnung – das Netzwerk verlässt den Rechner nicht. Aber für alles, was über das Internet erreichbar ist, ist HTTPS Pflicht.

### Für Produktion: Let's Encrypt

In der Praxis setzt man einen Reverse Proxy (z.B. Nginx oder Traefik) vor die App, der HTTPS terminiert:

```
Client → HTTPS → Nginx/Traefik → HTTP → FastAPI (intern)
```

**Let's Encrypt** bietet kostenlose SSL-Zertifikate, die automatisch erneuert werden. Für Docker-Setups ist **Traefik** besonders praktisch, weil es Zertifikate automatisch von Let's Encrypt bezieht.

> **Für diesen Kurs:** HTTPS-Setup geht über den Rahmen dieses Materials hinaus. Wenn du deine App veröffentlichst, ist HTTPS aber ein Muss. Plattformen wie Railway, Render oder Vercel bieten HTTPS automatisch an.

---

## Zusammenfassung

In dieser Übung hast du das Auth-System containerisiert:

| Konzept | Was du gelernt hast |
|---------|-------------------|
| Secrets-Management | `.env` für Docker, `.env.example` fürs Team, `.gitignore` |
| SECRET_KEY generieren | `python -c "import secrets; print(secrets.token_hex(32))"` |
| Docker Compose | FastAPI + PostgreSQL mit Auth-Env-Variablen |
| Health Checks | `pg_isready` + `depends_on: condition: service_healthy` |
| Alembic in Docker | Migration beim Container-Start (`CMD`) |
| Frontend Build | Vite + Nginx für SPA (try_files) |
| HTTPS | Pflicht für Produktion, Let's Encrypt für kostenlose Zertifikate |

---

## Checkliste

- [ ] `.env` enthält SECRET_KEY, DATABASE_URL und POSTGRES_PASSWORD
- [ ] `.env` steht in `.gitignore`
- [ ] `.env.example` existiert (ohne echte Werte)
- [ ] `docker-compose.yml` hat FastAPI + PostgreSQL mit Health Checks
- [ ] Environment-Variablen werden aus `.env` in die Container übergeben
- [ ] `alembic upgrade head` läuft beim Container-Start
- [ ] Register, Login und geschützte Endpoints funktionieren in Docker
- [ ] Ich weiß, warum HTTPS für Produktion Pflicht ist
