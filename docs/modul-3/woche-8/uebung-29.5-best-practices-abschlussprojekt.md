---
tags:
  - Docker
  - Dockerfile
  - Docker-Compose
---
# Best Practices & Abschlussprojekt – Praktische Übungen

## Übersicht

In dieser Übung lernst du:

- Wie **Multi-Stage Builds** deine Docker-Images deutlich kleiner machen
- Wie du ein **Multi-Container-Projekt** sauber strukturierst (Ordnerstruktur, Dockerfiles, compose.yaml)
- Wann du Docker **während der Entwicklung** einsetzt und wann nicht
- Wie du ein vollständiges Projekt mit **React + FastAPI + PostgreSQL + MongoDB** containerisierst
- Wie **nginx als Reverse-Proxy** Frontend und Backend verbindet
- Was sich beim **Deployment auf EC2** gegenüber deinem Laptop ändert
- Welche **Best Practices** professionelle Docker-Projekte auszeichnen

## Inhaltsverzeichnis

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Wiederholung Tag 4 (Docker Compose) | 10 min (lesen) |
| **Teil 1** | Multi-Stage Builds | 20 min |
| **Teil 2** | Projektstruktur planen | 15 min (lesen) |
| **Teil 3** | Wann Docker nutzen? | 10 min (lesen) |
| **Teil 4** | Datenbank-Services aufsetzen | 25 min |
| **Teil 5** | Backend entwickeln | 30 min |
| **Teil 6** | Frontend entwickeln | 25 min |
| **Teil 7** | Alles zusammenführen | 20 min |
| **Teil 8** | Testen & Debugging | 15 min |
| **Teil 9** | Ausblick: EC2-Deployment | 10 min (lesen) |
| **Bonus** | Best Practices Review | 15 min (optional) |
| | **Gesamt** | **ca. 3–3,5 Stunden** |

### Minimalpfad (wenn du wenig Zeit hast)

**In 90–120 Minuten das Abschlussprojekt bauen:**

1. **Rückblick** – Tag 4 auffrischen (Compose-Grundlagen)
2. **Teil 2** – Projektstruktur verstehen
3. **Teil 4** – Datenbanken aufsetzen (Übung 2)
4. **Teil 5** – Backend entwickeln (Übung 3)
5. **Teil 7** – Alles zusammenführen (Übung 5)
6. **Teil 8** – Testen (Übung 6)

---

## Voraussetzungen & Setup

**Bevor du startest:**

1. Docker Desktop ist installiert und läuft
2. Docker Compose ist verfügbar (bei Docker Desktop bereits enthalten)
3. Ein Terminal ist geöffnet (Git Bash empfohlen unter Windows)
4. Die Übungen von Tag 1–4 wurden durchgearbeitet (insbesondere Tag 4: Docker Compose)

**Überprüfe deine Installation:**

```bash
docker --version
docker compose version
```

> Du solltest die Docker-Version und die Compose-Version sehen. Falls `docker compose version` einen Fehler zeigt, aktualisiere Docker Desktop auf die neueste Version. (→ siehe Übung 29.4, Voraussetzungen)

---

## Rückblick: Wiederholung Tag 4 – Docker Compose

Gestern hast du gelernt, mehrere Container mit einer einzigen Datei zu steuern. Bevor wir heute ein ganzes Projekt bauen, frischen wir die wichtigsten Konzepte auf.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
  ENV[".env-Datei"] -->|"${…} Interpolation"| COMPOSE["compose.yaml"]
  COMPOSE -->|"services:"| S1["Service 1<br/>(z.B. api)"]
  COMPOSE -->|"services:"| S2["Service 2<br/>(z.B. db)"]
  COMPOSE -->|"volumes:"| VOL[(Named Volume)]
  subgraph "Automatisches Netzwerk"
    S1 -->|"Service-Name<br/>als Hostname"| S2
  end
  VOL -->|"mount"| S2
  BR["🌐 Browser"] -->|"ports: ..."| S1
```

**Was du gestern gelernt hast:**
- **compose.yaml** definiert alle Services, Volumes und Netzwerke in einer Datei
- **`docker compose up -d`** startet alles — Netzwerk wird automatisch erstellt
- **Service-Namen** funktionieren als Hostnamen (Docker-DNS)
- **`.env`-Dateien** halten Secrets aus der compose.yaml heraus
- **Healthchecks + `depends_on`** sorgen für die richtige Startreihenfolge

---

### Wissensfrage 1

**Was erstellt `docker compose up -d` automatisch, das du an Tag 3 noch manuell anlegen musstest?**

<details>
<summary>Antwort anzeigen</summary>

Ein **Bridge-Netzwerk** für alle Services in der Datei. An Tag 3 musstest du `docker network create mein-netzwerk` manuell ausführen und bei jedem Container `--network mein-netzwerk` angeben. Compose übernimmt das automatisch — alle Services können sich über ihren Service-Namen erreichen. Named Volumes müssen im Top-Level `volumes:` deklariert werden, werden dann aber beim ersten `up` automatisch erstellt. (→ siehe Übung 29.4, Teil 1 + Teil 5)

</details>

---

### Wissensfrage 2

**Warum sollte eine `.env`-Datei in `.gitignore` stehen, aber eine `.env.example` im Repository?**

<details>
<summary>Antwort anzeigen</summary>

Die **`.env`-Datei** enthält echte Passwörter und Secrets — wenn sie in Git landet, sind diese für jeden sichtbar, der Zugriff auf das Repository hat. Deshalb gehört `.env` in die `.gitignore`.

Die **`.env.example`** zeigt, welche Variablen benötigt werden (mit Platzhaltern wie `CHANGE_ME`), und dient als Dokumentation für Teammitglieder. Sie wird eingecheckt, damit jeder weiß, welche Variablen er in seiner eigenen `.env` setzen muss. (→ siehe Übung 29.4, Teil 6)

</details>

---

### Wissensfrage 3

**Was ist der Unterschied zwischen `depends_on: [db]` (einfach) und `depends_on: db: condition: service_healthy`?**

<details>
<summary>Antwort anzeigen</summary>

- **Einfach (`depends_on: [db]`):** Wartet nur darauf, dass der Container **gestartet** wurde — nicht darauf, dass die Anwendung darin bereit ist.
- **Mit Condition (`condition: service_healthy`):** Wartet darauf, dass der **Healthcheck** des abhängigen Services erfolgreich ist — die Datenbank also wirklich Verbindungen annimmt.

In der Praxis ist die zweite Variante fast immer besser, weil eine Datenbank einige Sekunden braucht, bis sie bereit ist. Ohne Healthcheck startet deine App, bevor die DB Verbindungen annimmt → `Connection refused`. (→ siehe Übung 29.4, Teil 3)

> **Hinweis:** `condition: service_healthy` gilt für `docker compose` (Compose CLI). In anderen Orchestratoren (z.B. Docker Swarm) wird das nicht identisch unterstützt.

</details>

---

## Teil 1: Multi-Stage Builds

### Warum sind Docker-Images oft zu groß?

Wenn du ein Docker-Image baust, enthält es alles, was während des Builds benötigt wurde — auch Dinge, die zur Laufzeit nicht mehr gebraucht werden:

| Was wird gebraucht? | Beim Build | Zur Laufzeit |
|---|---|---|
| Python-Interpreter | ✅ | ✅ |
| pip (Package-Manager) | ✅ | ❌ |
| gcc/Compiler | ✅ (für manche Packages) | ❌ |
| Header-Dateien | ✅ (für Kompilierung) | ❌ |
| Installierte Packages | ✅ | ✅ |
| Dein Code | ✅ | ✅ |

**Das Problem:** `python:3.11` (das volle Image) enthält Compiler, Build-Tools und Header-Dateien — alles zusammen über **1 GB**. Dein Code und die installierten Packages sind vielleicht nur 50 MB.

### Die Lösung: Multi-Stage Builds

Ein Multi-Stage Build verwendet **mehrere `FROM`-Anweisungen** in einem Dockerfile. Jede `FROM`-Anweisung startet eine neue "Stage". Du kannst Dateien von einer früheren Stage in eine spätere kopieren — und alles andere wird verworfen.

**Das Prinzip:**

```
Stage 1 (builder):     Großes Image → installiere alles → baue alles
                            ↓ COPY --from=builder
Stage 2 (production):  Kleines Image → nur das Ergebnis → fertig!
```

---

### Übung 1: Multi-Stage Python-Image

> **Ziel:** Ein Python-Image mit und ohne Multi-Stage Build erstellen und den Größenunterschied sehen.
>
> **Zeitbedarf:** ca. 15 Minuten
>
> **Du bist fertig, wenn:** `docker image ls` zeigt, dass dein Multi-Stage-Image deutlich kleiner ist als das Standard-Image.

**Schritt 1: Projektordner erstellen**

```bash
mkdir multistage-test && cd multistage-test
```

**Schritt 2: Einfache App erstellen**

Erstelle `app.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def hallo():
    return {"message": "Hello Multi-Stage!"}
```

Erstelle `requirements.txt`:

```
fastapi~=0.133.0
uvicorn~=0.41.0
```

**Schritt 3: Dockerfile OHNE Multi-Stage**

Erstelle `Dockerfile`:

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t api-gross .
```

**Schritt 4: Dockerfile MIT Multi-Stage**

Ersetze den Inhalt von `Dockerfile` durch:

```dockerfile
# Stage 1: Dependencies in virtuellem Environment installieren
FROM python:3.11 AS builder
WORKDIR /build
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Schlankes Production-Image (ohne pip, gcc, Build-Tools)
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY app.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

> **Was passiert hier?**
> - **Stage 1 (`builder`):** Nutzt das volle `python:3.11` Image und installiert alle Packages in einem isolierten **virtuellen Environment** (`/opt/venv`).
> - **Stage 2:** Nutzt das schlanke `python:3.11-slim` Image und kopiert **nur das fertige venv** aus Stage 1 — kein pip, kein Build-Cache, keine Build-Tools.
> - **Hauptgewinn:** Der Wechsel von `python:3.11` (~1 GB, mit gcc/Build-Tools) auf `python:3.11-slim` (~150 MB). Durch das venv-Copy wird sauber nur das Nötige übertragen. Bei Packages, die C-Kompilierung brauchen (z.B. `psycopg2` ohne `-binary`), wäre Multi-Stage sogar zwingend nötig — Build mit gcc in Stage 1, Runtime ohne.

```bash
docker build -t api-klein .
```

**Schritt 5: Größenvergleich**

```bash
docker image ls --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep api
```

<details>
<summary>PowerShell</summary>

```powershell
docker image ls --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}" | Select-String api
```

</details>

<details>
<summary>CMD</summary>

```cmd
docker image ls --format "table {{.Repository}}	{{.Tag}}	{{.Size}}" | findstr api
```

</details>

Du solltest ungefähr sehen:

```
api-gross    latest    ~1.05 GB
api-klein    latest    ~200 MB
```

> **~5x kleiner!** Weniger Speicher, schnelleres Deployment, weniger Angriffsfläche.

**Schritt 6: Testen (optional)**

```bash
docker run --rm -d -p 8000:8000 --name test-multi api-klein
```

> **Port-Hinweis:** Falls Port 8000 belegt ist, verwende `-p 8001:8000` und öffne `http://localhost:8001`.

Browser: `http://localhost:8000` → `{"message": "Hello Multi-Stage!"}`

```bash
docker stop test-multi
```

**Aufräumen:**

```bash
docker image rm api-gross api-klein
```

<details>
<summary>Git Bash / macOS / Linux</summary>

```bash
cd ..
rm -rf multistage-test
```

</details>

<details>
<summary>PowerShell</summary>

```powershell
cd ..
Remove-Item -Recurse -Force multistage-test
```

</details>

<details>
<summary>CMD</summary>

```cmd
cd ..
rmdir /s /q multistage-test
```

</details>

> **Vorschau:** In Teil 6 nutzen wir Multi-Stage für das React-Frontend — dort ist der Unterschied noch dramatischer: Ein Node.js-Build-Image (~1 GB) wird zu einem nginx-Image (~40 MB), das nur die fertigen HTML/JS-Dateien enthält.

---

### Wissensfrage 4

**Was ist der Hauptvorteil eines Multi-Stage Builds? Nenne ein konkretes Beispiel.**

<details>
<summary>Antwort anzeigen</summary>

**Kleinere Images** — weniger Speicherverbrauch, schnelleres Deployment, weniger Angriffsfläche (keine unnötigen Tools im Production-Image).

**Beispiel React-Frontend:** Stage 1 nutzt `node:20` (~1 GB) für `npm install` und `npm run build`. Stage 2 nutzt `nginx:alpine` (~40 MB) und kopiert nur den `dist/`-Ordner (die fertigen HTML/CSS/JS-Dateien). Das finale Image ist ~50 MB statt ~1 GB.

**Beispiel Python-Backend:** Stage 1 nutzt `python:3.11` (mit Compiler, ~1 GB) für `pip install`. Stage 2 nutzt `python:3.11-slim` (~150 MB) und kopiert nur die installierten Packages.

</details>

---

## Teil 2: Projektstruktur planen

Bevor wir Code schreiben, planen wir die Ordnerstruktur. Bei Multi-Container-Projekten ist eine klare Organisation entscheidend.

### Das Abschlussprojekt: Rezeptbuch

Wir bauen ein **Rezeptbuch** — eine Web-App zum Sammeln und Anzeigen von Rezepten:

| Komponente | Technologie | Container | Warum? |
|---|---|---|---|
| **Frontend** | React (Vite) | nginx:alpine | UI im Browser |
| **Backend** | FastAPI (Python) | python:3.11-slim | REST-API |
| **SQL-Datenbank** | PostgreSQL | postgres:16 | Kategorien (strukturiert) |
| **NoSQL-Datenbank** | MongoDB | mongo:7 | Rezepte (flexibles Schema) |

> **Warum zwei Datenbanken?** Das ist "Polyglot Persistence" (→ siehe Lektion 28.3): Verschiedene Datentypen in der jeweils passenden Datenbank speichern. Kategorien sind strukturiert und relational → SQL. Rezepte haben flexible Felder (verschiedene Rezepte brauchen unterschiedliche Informationen) → NoSQL/Dokumente.

### Die Ordnerstruktur

```
rezeptbuch/
├── compose.yaml            ← Steuert alles (im Projekt-Root)
├── .env                    ← Echte Secrets (in .gitignore!)
├── .env.example            ← Vorlage für Teammitglieder (in Git)
├── .gitignore              ← .env, node_modules, __pycache__
│
├── backend/                ← Eigener Ordner pro Service
│   ├── Dockerfile          ← Eigenes Dockerfile pro Service
│   ├── .dockerignore       ← Dateien vom Build ausschließen
│   ├── requirements.txt
│   └── app.py
│
└── frontend/               ← Eigener Ordner pro Service
    ├── Dockerfile          ← Eigenes Dockerfile pro Service
    ├── .dockerignore
    ├── nginx.conf          ← nginx-Konfiguration
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx
```

**Wichtige Regeln:**

1. **`compose.yaml` im Projekt-Root** — sie steuert alle Services und wird als erstes gelesen
2. **Jeder eigene Service** (Backend, Frontend) hat einen **eigenen Ordner mit eigenem Dockerfile**
3. **Fertige Images** (PostgreSQL, MongoDB) brauchen **kein Dockerfile** — sie werden direkt aus Docker Hub gezogen
4. **`.env` neben der compose.yaml** — Compose lädt sie automatisch

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
  ROOT["📄 compose.yaml<br/>(Projekt-Root)"]
  ROOT -->|"build: ./backend"| BE["📁 backend/<br/>Dockerfile + app.py"]
  ROOT -->|"build: ./frontend"| FE["📁 frontend/<br/>Dockerfile + App.jsx"]
  ROOT -->|"image: postgres:16"| PG["🐘 PostgreSQL<br/>(kein Dockerfile nötig)"]
  ROOT -->|"image: mongo:7"| MO["🍃 MongoDB<br/>(kein Dockerfile nötig)"]
```

> **Merke:** `build: ./backend` sagt Compose: "Baue das Image aus dem Dockerfile im Ordner `backend/`". `image: postgres:16` sagt: "Ziehe das fertige Image von Docker Hub." (→ siehe Übung 29.4, Teil 3: `image:` vs `build:`)

---

### Wissensfrage 5

**Warum hat jeder Service (Backend, Frontend) seinen eigenen Ordner mit eigenem Dockerfile, statt alles in ein Dockerfile zu packen?**

<details>
<summary>Antwort anzeigen</summary>

**Separation of Concerns:** Jeder Service hat andere Technologien und Build-Schritte — das Backend braucht Python und pip, das Frontend braucht Node.js und npm. Ein gemeinsames Dockerfile wäre riesig und schwer wartbar.

**Eigener Build-Context:** Jeder Ordner ist ein eigener Build-Context → Docker sendet nur die relevanten Dateien an den Build-Daemon. Das macht Builds schneller und Images kleiner.

**Unabhängige Entwicklung:** Backend und Frontend können von verschiedenen Personen gleichzeitig entwickelt, gebaut und getestet werden.

</details>

---

## Teil 3: Wann Docker nutzen?

Eine häufige Frage: "Soll ich von Anfang an alles in Docker entwickeln?" Die Antwort: **Nein — aber Datenbanken sofort.**

### Der empfohlene Development-Workflow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph LR
  A["1️⃣ Docker-DBs<br/>starten"] --> B["2️⃣ Code lokal<br/>schreiben"]
  B --> C["3️⃣ Lokal testen<br/>(gegen Docker-DBs)"]
  C --> D["4️⃣ Dockerfiles<br/>schreiben"]
  D --> E["5️⃣ compose.yaml<br/>erstellen"]
  E --> F["6️⃣ Alles testen<br/>(docker compose up)"]
  F --> G["7️⃣ Deploy<br/>(EC2)"]
```

| Phase | Was tun? | Warum? |
|-------|----------|--------|
| **1. Datenbanken** | `docker compose up -d` (nur DB-Services) | Kein lokales PostgreSQL/MongoDB installieren! Docker macht es einfach. |
| **2. Code schreiben** | Backend/Frontend in deiner IDE | Hot-Reload, Debugging, schnelle Iteration |
| **3. Lokal testen** | `uvicorn app:app --reload` / `npm run dev` | Direkte Ausführung ist schneller als Docker-Rebuild |
| **4. Dockerfiles** | Erstellen, wenn der Code funktioniert | Erst containerisieren, wenn klar ist, was gebraucht wird |
| **5. compose.yaml** | Alle Services zusammen definieren | Ein Befehl startet alles — reproduzierbar |
| **6. Alles testen** | `docker compose up -d --build` | End-to-End-Test im containerisierten Setup |
| **7. Deployment** | Gleiche compose.yaml auf EC2 | Was lokal läuft, läuft auch auf dem Server |

> **Faustregel:** Docker für Datenbanken ab Tag 1. Code containerisieren erst, wenn er läuft.

> **Warum nicht sofort alles im Container?** Lokale Entwicklung bietet Hot-Reload (Code-Änderungen sofort sichtbar), bessere IDE-Integration (Debugging, Autocomplete), und schnellere Iteration (kein Image-Rebuild nötig).

**In dieser Übung** erstellen wir alle Dateien und bauen dann alles zusammen mit Docker Compose. In einem echten Projekt würdest du Schritte 2–3 vor 4–5 machen.

---

## Teil 4: Datenbank-Services aufsetzen

Wir starten mit den Datenbanken — genau wie im empfohlenen Workflow.

### Übung 2: PostgreSQL + MongoDB in compose.yaml

> **Ziel:** Beide Datenbanken per Compose starten und testen, dass sie laufen.
>
> **Zeitbedarf:** ca. 20 Minuten
>
> **Du bist fertig, wenn:** Beide Datenbanken laufen, Healthchecks grün sind, und du per `docker compose exec` SQL- bzw. MongoDB-Befehle ausführen kannst.

**Schritt 1: Projektordner erstellen**

```bash
mkdir rezeptbuch && cd rezeptbuch
```

**Schritt 2: `.env`-Datei erstellen**

Erstelle `.env`:

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=geheim123
POSTGRES_DB=rezepte
MONGO_USER=admin
MONGO_PASSWORD=geheim123
```

> **Erinnerung:** `.env` = Werte für `${…}`-Ersetzung in der compose.yaml (Compose-Interpreter). In den Container kommen Variablen nur, wenn du sie unter `environment:` oder `env_file:` explizit setzt. Bei Konflikten gilt eine [feste Reihenfolge (Precedence)](https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/). (→ siehe Übung 29.4, Teil 6)

Erstelle `.env.example`:

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_DB=rezepte
MONGO_USER=admin
MONGO_PASSWORD=CHANGE_ME
```

**Schritt 3: `compose.yaml` erstellen**

Erstelle `compose.yaml`:

> **Erinnerung:** Standard-Dateiname ist `compose.yaml` (empfohlen) oder `compose.yml`. Der ältere Name `docker-compose.yml` funktioniert weiterhin (Backward Compatibility). Und denke daran: **2 Spaces, keine Tabs!** (→ siehe Übung 29.4, Teil 2)

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pg-daten:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo-daten:/data/db
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mongosh --quiet -u $$MONGO_INITDB_ROOT_USERNAME -p $$MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval \"db.adminCommand('ping').ok\" | grep 1",
        ]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 20s

volumes:
  pg-daten:
  mongo-daten:
```

> **Warum `$$`?** In Compose-Dateien ersetzt `${VAR}` eine Variable aus der `.env`-Datei (Compose-Interpolation). Wenn du stattdessen die **Container-Umgebungsvariable** ansprechen willst (die zur Laufzeit im Container existiert), musst du `$$` schreiben — Compose gibt dann ein einfaches `$` an die Shell weiter.

> **Hinweis:** Die `POSTGRES_*`-Umgebungsvariablen werden nur beim **ersten Start** ausgewertet (wenn das Data-Directory noch leer ist). Wenn du Benutzername oder Passwort ändern willst, musst du das Volume löschen: `docker compose down -v`. (→ siehe Übung 29.4, Teil 3)

> **Sicherheitstipp:** Wenn du die Datenbank-Ports zum Testen exponierst (z.B. `ports: - "5432:5432"`), verwende `"127.0.0.1:5432:5432"` — damit ist der Port nur lokal erreichbar, nicht im LAN. Für diese Übung exponieren wir die DB-Ports **nicht** — nur das Backend wird später darauf zugreifen.

**Schritt 4: Starten und prüfen**

```bash
docker compose up -d
```

```bash
docker compose ps
```

Beide Services sollten `running` (healthy) zeigen. Falls ein Service noch startet, warte einen Moment und prüfe erneut.

**Schritt 5: PostgreSQL testen**

```bash
docker compose exec postgres psql -U admin -d rezepte -c "SELECT 'PostgreSQL läuft!' AS status;"
```

Du solltest sehen:

```
       status
---------------------
 PostgreSQL läuft!
```

**Schritt 6: MongoDB testen**

```bash
docker compose exec mongo mongosh -u admin -p geheim123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

Du solltest `{ ok: 1 }` sehen.

**Schritt 7: Logs prüfen (bei Problemen)**

```bash
docker compose logs postgres
docker compose logs mongo
```

> **Nicht aufräumen!** Wir bauen in den nächsten Teilen auf diesem Projekt weiter. Die Datenbanken sollen laufen bleiben.

---

### Wissensfrage 6

**Warum starten wir die Datenbanken zuerst, bevor wir das Backend oder Frontend entwickeln?**

<details>
<summary>Antwort anzeigen</summary>

Weil Backend und Frontend **gegen die Datenbanken entwickelt und getestet werden**. Ohne laufende Datenbank kannst du keine API-Endpoints testen, die Daten lesen oder schreiben.

Docker macht das einfach: `docker compose up -d` startet PostgreSQL und MongoDB in Sekunden — ohne lokale Installation, ohne Konfiguration, ohne Versionskonflikte. Das ist einer der größten Vorteile von Docker in der Entwicklung.

</details>

---

## Teil 5: Backend entwickeln

Jetzt erstellen wir die FastAPI-API, die beide Datenbanken nutzt.

### Die API-Endpoints

| Methode | Pfad | Datenbank | Beschreibung |
|---------|------|-----------|-------------|
| GET | `/api/kategorien` | PostgreSQL | Alle Kategorien abrufen |
| POST | `/api/kategorien` | PostgreSQL | Neue Kategorie anlegen |
| GET | `/api/rezepte` | MongoDB | Alle Rezepte abrufen |
| GET | `/api/rezepte?kategorie=1` | MongoDB | Rezepte nach Kategorie filtern |
| POST | `/api/rezepte` | MongoDB | Neues Rezept anlegen |
| GET | `/api/health` | Beide | Status beider Datenbanken prüfen |

> **Beachte:** PostgreSQL-Endpoints nutzen `psycopg2` (synchron, `def`) — wie in Übung 29.3/29.4. MongoDB-Endpoints nutzen `motor` (asynchron, `async def`) — wie in Lektion 28.3. FastAPI kann beides in derselben App.

### Übung 3: FastAPI-Backend erstellen

> **Ziel:** Ein FastAPI-Backend erstellen, das Kategorien in PostgreSQL und Rezepte in MongoDB speichert.
>
> **Zeitbedarf:** ca. 25 Minuten
>
> **Du bist fertig, wenn:** Alle Endpoints funktionieren und du per Browser Kategorien und Rezepte anlegen und abrufen kannst.

**Schritt 1: Backend-Ordner erstellen**

```bash
mkdir backend
```

**Schritt 2: `backend/requirements.txt` erstellen**

```
fastapi~=0.133.0
uvicorn~=0.41.0
psycopg2-binary~=2.9.0
motor~=3.6.0
```

**Schritt 3: `backend/app.py` erstellen**

```python
from fastapi import FastAPI
from pydantic import BaseModel
import os
import psycopg2
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# --- Datenbank-Verbindungen ---

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:geheim123@postgres:5432/rezepte"
)
MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb://admin:geheim123@mongo:27017/?authSource=admin"
)

mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client.rezeptbuch


def get_pg():
    return psycopg2.connect(DATABASE_URL)


@app.on_event("startup")
def startup():
    conn = get_pg()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kategorien (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        )
    """)
    conn.commit()
    cur.close()
    conn.close()


# --- Kategorien (PostgreSQL) ---

class KategorieInput(BaseModel):
    name: str


@app.get("/api/kategorien")
def get_kategorien():
    conn = get_pg()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM kategorien ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r[0], "name": r[1]} for r in rows]


@app.post("/api/kategorien")
def add_kategorie(kat: KategorieInput):
    conn = get_pg()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO kategorien (name) VALUES (%s) RETURNING id",
        (kat.name,)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": new_id, "name": kat.name}


# --- Rezepte (MongoDB) ---

class RezeptInput(BaseModel):
    titel: str
    kategorie_id: int
    zutaten: list[str]
    schritte: list[str]


@app.get("/api/rezepte")
async def get_rezepte(kategorie: int = None):
    query = {}
    if kategorie is not None:
        query["kategorie_id"] = kategorie

    rezepte = []
    async for doc in mongo_db.rezepte.find(query):
        doc["_id"] = str(doc["_id"])
        rezepte.append(doc)
    return rezepte


@app.post("/api/rezepte")
async def add_rezept(rezept: RezeptInput):
    doc = rezept.model_dump()
    result = await mongo_db.rezepte.insert_one(doc)
    return {"id": str(result.inserted_id), "titel": rezept.titel}


# --- Health ---

@app.get("/api/health")
async def health():
    status = {"postgres": "error", "mongo": "error"}
    try:
        conn = get_pg()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        status["postgres"] = "connected"
    except Exception as e:
        status["postgres"] = str(e)
    try:
        await mongo_client.admin.command("ping")
        status["mongo"] = "connected"
    except Exception as e:
        status["mongo"] = str(e)
    return status
```

> **Hinweis:** `@app.on_event("startup")` funktioniert, ist aber zugunsten der [Lifespan-API](https://fastapi.tiangolo.com/advanced/events/#lifespan) als deprecated markiert. Für diese Übung ist es ausreichend.

> **Beachte den Code:**
> - **PostgreSQL-Endpoints** (`get_kategorien`, `add_kategorie`) sind `def` (synchron) → FastAPI führt sie in einem Thread-Pool aus. `psycopg2` ist ein synchroner Treiber. (→ siehe Übung 29.3/29.4)
> - **MongoDB-Endpoints** (`get_rezepte`, `add_rezept`) sind `async def` (asynchron) → nutzen `motor`, den asynchronen MongoDB-Treiber. (→ siehe Lektion 28.3)
> - Beide Ansätze funktionieren problemlos in derselben FastAPI-App.

> **Hinweis zu psycopg2-binary:** Für Übungen und Entwicklung ist `psycopg2-binary` ideal — es funktioniert ohne System-Dependencies. In echten Produktionsumgebungen nutzt man oft [psycopg (v3)](https://www.psycopg.org/psycopg3/) oder baut `psycopg2` gegen die System-libpq.

**Schritt 4: `backend/Dockerfile` erstellen**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

> **Warum kein Multi-Stage hier?** Unsere Python-Packages (fastapi, motor, psycopg2-binary) sind alle als vorkompilierte Wheels verfügbar und brauchen keinen Compiler. `python:3.11-slim` reicht als Basis. Den echten Multi-Stage-Vorteil siehst du beim React-Frontend in Teil 6. (→ siehe Übung 29.2 für Dockerfile-Grundlagen)

**Schritt 5: `backend/.dockerignore` erstellen**

```
__pycache__
*.pyc
.env
```

**Schritt 6: compose.yaml erweitern**

Füge den `api`-Service zur bestehenden `compose.yaml` hinzu (unter den bestehenden Services, vor `volumes:`):

```yaml
  api:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      mongo:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
      MONGO_URL: "mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongo:27017/?authSource=admin"
```

> **Port-Hinweis:** Falls Port 8000 belegt ist, verwende `"8001:8000"` und öffne `http://localhost:8001`.

> **Beachte:** Die Service-Namen `postgres` und `mongo` aus der compose.yaml werden als Hostnamen in den URLs verwendet — genau wie in Übung 29.3 (Container-Name = Hostname) und Übung 29.4 (Service-Name = Hostname). (→ siehe Übung 29.3, Teil 4)

**Schritt 7: Backend starten und testen**

```bash
docker compose up -d --build
```

```bash
docker compose ps
```

Alle drei Services sollten laufen. Prüfe die Logs bei Problemen:

```bash
docker compose logs api
```

**Schritt 8: API testen**

FastAPI erstellt automatisch eine interaktive API-Dokumentation. Öffne im Browser:

`http://localhost:8000/docs`

Dort kannst du alle Endpoints direkt testen:

1. **Health-Check:** Klicke auf `GET /api/health` → "Try it out" → "Execute"
   → Sollte `{"postgres": "connected", "mongo": "connected"}` zeigen

2. **Kategorie anlegen:** Klicke auf `POST /api/kategorien` → "Try it out"
   → Gib ein: `{"name": "Hauptgerichte"}` → "Execute"

3. **Kategorien abrufen:** `GET /api/kategorien` → "Try it out" → "Execute"
   → Sollte deine Kategorie zeigen

4. **Rezept anlegen:** `POST /api/rezepte` → "Try it out"
   → Gib ein:
   ```json
   {
     "titel": "Spaghetti Carbonara",
     "kategorie_id": 1,
     "zutaten": ["Spaghetti", "Eier", "Pecorino", "Guanciale", "Pfeffer"],
     "schritte": ["Wasser kochen", "Pasta kochen", "Sauce zubereiten", "Alles vermischen"]
   }
   ```
   → "Execute"

5. **Rezepte abrufen:** `GET /api/rezepte` → "Try it out" → "Execute"
   → Sollte dein Rezept zeigen

> **Tipp:** Du kannst die API auch direkt im Browser testen: `http://localhost:8000/api/kategorien` zeigt die Kategorien als JSON.

<details>
<summary>Troubleshooting: API startet nicht oder Connection refused</summary>

1. **Logs prüfen:**
   ```bash
   docker compose logs api
   ```

2. **Häufige Fehler:**
   - `ModuleNotFoundError: No module named 'motor'` → `requirements.txt` prüfen, dann `docker compose up -d --build`
   - `Connection refused` zur DB → Healthchecks prüfen: `docker compose ps`. Laufen alle DBs?
   - `authentication failed` bei MongoDB → `.env`-Werte prüfen: `MONGO_USER` und `MONGO_PASSWORD` müssen mit `MONGO_INITDB_ROOT_USERNAME`/`PASSWORD` übereinstimmen

3. **compose.yaml validieren:**
   ```bash
   docker compose config
   ```

4. **Manuell testen (im API-Container):**
   ```bash
   docker compose exec api python -c "import psycopg2; print('psycopg2 OK')"
   docker compose exec api python -c "import motor; print('motor OK')"
   ```

</details>

---

### Wissensfrage 7

**Der Backend-Code verbindet sich zu `postgres:5432` und `mongo:27017`. Warum funktionieren diese Hostnamen, obwohl kein DNS-Server konfiguriert wurde?**

<details>
<summary>Antwort anzeigen</summary>

Docker Compose erstellt automatisch ein **Bridge-Netzwerk** für alle Services in der compose.yaml. In diesem Netzwerk läuft ein **eingebauter DNS-Server**, der Service-Namen auf Container-IP-Adressen auflöst.

`postgres` → IP des postgres-Containers, `mongo` → IP des mongo-Containers. Kein manuelles `docker network create` nötig — Compose übernimmt das automatisch. (→ siehe Übung 29.3, Teil 4: Docker-Netzwerke + Übung 29.4, Teil 5: Compose-Netzwerk)

</details>

---

## Teil 6: Frontend entwickeln

Jetzt erstellen wir ein einfaches React-Frontend, das die API nutzt.

### Das Konzept: nginx als Reverse-Proxy

Das Frontend wird als statische Dateien gebaut (HTML, CSS, JavaScript) und von nginx ausgeliefert. Zusätzlich konfigurieren wir nginx als **Reverse-Proxy**: Alle Anfragen an `/api/` werden intern an den Backend-Service weitergeleitet.

```
Browser → http://localhost:3000/            → nginx → index.html (React-App)
Browser → http://localhost:3000/api/rezepte → nginx → http://api:8000/api/rezepte
```

> **Warum ein Proxy?** Ohne Proxy müsste der Browser direkt `http://localhost:8000` aufrufen — das wäre ein **anderer Origin** → CORS-Probleme. Mit dem Proxy läuft alles über **einen Eingang** (Port 3000). In der Produktion gibt es kein `localhost:8000`.

### Übung 4: React-Frontend erstellen

> **Ziel:** Ein einfaches React-Frontend erstellen, das die API nutzt, und per Multi-Stage Build in einen nginx-Container verpacken.
>
> **Zeitbedarf:** ca. 20 Minuten
>
> **Du bist fertig, wenn:** Das Frontend unter `http://localhost:3000` die Rezepte anzeigt.

**Schritt 1: Frontend-Ordner erstellen**

```bash
mkdir -p frontend/src
```

**Schritt 2: `frontend/package.json` erstellen**

```json
{
  "name": "rezeptbuch",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.4.0"
  }
}
```

**Schritt 3: `frontend/vite.config.js` erstellen**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

**Schritt 4: `frontend/index.html` erstellen**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rezeptbuch</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

**Schritt 5: `frontend/src/main.jsx` erstellen**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Schritt 6: `frontend/src/App.jsx` erstellen**

```jsx
import { useState, useEffect } from "react"

function App() {
  const [kategorien, setKategorien] = useState([])
  const [rezepte, setRezepte] = useState([])
  const [neueKategorie, setNeueKategorie] = useState("")
  const [titel, setTitel] = useState("")
  const [kategorieId, setKategorieId] = useState("")
  const [zutaten, setZutaten] = useState("")
  const [schritte, setSchritte] = useState("")

  useEffect(() => {
    laden()
  }, [])

  function laden() {
    fetch("/api/kategorien").then(r => r.json()).then(setKategorien)
    fetch("/api/rezepte").then(r => r.json()).then(setRezepte)
  }

  function kategorieAnlegen(e) {
    e.preventDefault()
    fetch("/api/kategorien", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: neueKategorie })
    }).then(() => {
      setNeueKategorie("")
      laden()
    })
  }

  function rezeptAnlegen(e) {
    e.preventDefault()
    fetch("/api/rezepte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titel,
        kategorie_id: Number(kategorieId),
        zutaten: zutaten.split("\n").filter(z => z.trim()),
        schritte: schritte.split("\n").filter(s => s.trim())
      })
    }).then(() => {
      setTitel("")
      setKategorieId("")
      setZutaten("")
      setSchritte("")
      laden()
    })
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>Rezeptbuch</h1>

      <section>
        <h2>Kategorien</h2>
        <form onSubmit={kategorieAnlegen} style={{ marginBottom: 10 }}>
          <input
            value={neueKategorie}
            onChange={e => setNeueKategorie(e.target.value)}
            placeholder="Neue Kategorie..."
            required
          />
          <button type="submit">Hinzufuegen</button>
        </form>
        <ul>
          {kategorien.map(k => <li key={k.id}>{k.name}</li>)}
        </ul>
      </section>

      <section>
        <h2>Neues Rezept</h2>
        <form onSubmit={rezeptAnlegen}>
          <input
            value={titel}
            onChange={e => setTitel(e.target.value)}
            placeholder="Titel"
            required
            style={{ width: "100%", marginBottom: 5 }}
          />
          <br />
          <select
            value={kategorieId}
            onChange={e => setKategorieId(e.target.value)}
            required
            style={{ marginBottom: 5 }}
          >
            <option value="">Kategorie waehlen...</option>
            {kategorien.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
          <br />
          <textarea
            value={zutaten}
            onChange={e => setZutaten(e.target.value)}
            placeholder="Zutaten (eine pro Zeile)"
            rows={3}
            style={{ width: "100%", marginBottom: 5 }}
          />
          <br />
          <textarea
            value={schritte}
            onChange={e => setSchritte(e.target.value)}
            placeholder="Schritte (einer pro Zeile)"
            rows={3}
            style={{ width: "100%", marginBottom: 5 }}
          />
          <br />
          <button type="submit">Rezept speichern</button>
        </form>
      </section>

      <section>
        <h2>Alle Rezepte ({rezepte.length})</h2>
        {rezepte.length === 0 && <p>Noch keine Rezepte vorhanden.</p>}
        {rezepte.map(r => (
          <div key={r._id} style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
            borderRadius: 5
          }}>
            <h3 style={{ margin: "0 0 10px" }}>{r.titel}</h3>
            <p><strong>Zutaten:</strong></p>
            <ul>{r.zutaten.map((z, i) => <li key={i}>{z}</li>)}</ul>
            <p><strong>Zubereitung:</strong></p>
            <ol>{r.schritte.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
        ))}
      </section>
    </div>
  )
}

export default App
```

> **Hinweis zum Code:** Das Frontend nutzt `fetch("/api/...")` mit **relativen Pfaden** — keine absoluten URLs wie `http://localhost:8000`. Das funktioniert, weil nginx alle `/api/`-Anfragen an das Backend weiterleitet (Reverse-Proxy). So gibt es keine CORS-Probleme und der Code funktioniert gleich in Development und Production.

**Schritt 7: `frontend/nginx.conf` erstellen**

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Was macht diese Konfiguration?**
> - `location /` → Liefert die React-App (statische Dateien) aus
> - `try_files ... /index.html` → SPA-Routing: Alle Pfade laden die React-App (Client-Side-Routing)
> - `location /api/` → **Reverse-Proxy:** Leitet alle API-Anfragen an den Backend-Container weiter
> - `http://api:8000` → `api` ist der Service-Name aus der compose.yaml (Docker-DNS)

**Schritt 8: `frontend/Dockerfile` erstellen (Multi-Stage!)**

```dockerfile
# Stage 1: React-App bauen
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Fertige Dateien mit nginx ausliefern
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

> **Best Practice mit Lockfile:** Wenn du ein `package-lock.json` hast (z.B. nach lokalem `npm install`), nutze `RUN npm ci` statt `npm install` — das installiert exakt die Versionen aus dem Lockfile und ist reproduzierbarer. Für diese Übung reicht `npm install`, da wir kein Lockfile haben.

> **DAS ist Multi-Stage in Aktion!**
> - **Stage 1 (`build`):** `node:20-alpine` (~180 MB) installiert npm-Packages und baut die App → erzeugt `dist/`-Ordner mit HTML/CSS/JS
> - **Stage 2:** `nginx:alpine` (~40 MB) kopiert **nur den `dist/`-Ordner** → kein Node.js, kein npm, keine node_modules im finalen Image!
> - **Ergebnis:** Statt ~300 MB (Node + node_modules + dist) nur ~45 MB (nginx + dist)

**Schritt 9: `frontend/.dockerignore` erstellen**

```
node_modules
dist
.env
```

> **Wichtig:** `node_modules` ausschließen! Sonst werden lokale node_modules (falls vorhanden) in den Build-Context kopiert und überschreiben die im Container installierte Version. Das kann zu Fehlern führen.

---

### Wissensfrage 8

**Warum konfigurieren wir im nginx einen Reverse-Proxy für `/api/`, statt das Frontend direkt mit dem Backend kommunizieren zu lassen?**

<details>
<summary>Antwort anzeigen</summary>

**Ohne Proxy:** Der Browser müsste `http://localhost:8000/api/rezepte` aufrufen — das ist ein **anderer Origin** als `http://localhost:3000` (das Frontend). Browser blockieren solche Cross-Origin-Anfragen wegen der **Same-Origin-Policy** (CORS).

**Mit Proxy:** Alles läuft über **einen Eingang** (Port 3000). Für den Browser kommt alles vom gleichen Origin. nginx leitet `/api/`-Anfragen intern an den Backend-Container weiter — davon merkt der Browser nichts.

**Zusätzlicher Vorteil:** In der Produktion (z.B. auf EC2) gibt es kein `localhost:8000`. Der Proxy macht die Architektur flexibel — das Frontend muss nicht wissen, wo das Backend physisch läuft.

</details>

---

## Teil 7: Alles zusammenführen

Jetzt verbinden wir alle vier Services in einer einzigen compose.yaml.

### Übung 5: Komplette compose.yaml

> **Ziel:** Alle 4 Services in einer compose.yaml vereinen und das gesamte Projekt starten.
>
> **Zeitbedarf:** ca. 15 Minuten
>
> **Du bist fertig, wenn:** `docker compose up -d --build` alle 4 Services startet und das Frontend unter `http://localhost:3000` die Rezepte anzeigt.

**Schritt 1: Bestehende compose.yaml aktualisieren**

Ersetze die bestehende `compose.yaml` durch die vollständige Version:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pg-daten:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo-daten:/data/db
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mongosh --quiet -u $$MONGO_INITDB_ROOT_USERNAME -p $$MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval \"db.adminCommand('ping').ok\" | grep 1",
        ]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 20s

  api:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
      mongo:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
      MONGO_URL: "mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongo:27017/?authSource=admin"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  pg-daten:
  mongo-daten:
```

> **Was hat sich geändert gegenüber Teil 5?**
> - Der `api`-Service hat **keine `ports:` mehr** — er ist nicht mehr direkt von außen erreichbar. Stattdessen leitet nginx (im Frontend-Container) die API-Anfragen intern weiter.
> - Der `frontend`-Service ist neu und exponiert nur **Port 3000:80**.
> - **Nur ein Port** ist von außen erreichbar (3000) — das ist Best Practice! Datenbanken und Backend sind nur intern im Docker-Netzwerk sichtbar.

> **Port-Hinweis:** Falls Port 3000 belegt ist, verwende `"3001:80"` und öffne `http://localhost:3001`.

> **Best Practice — Restart-Policy:** In Produktionsumgebungen (z.B. auf EC2) solltest du `restart: unless-stopped` setzen, damit Container nach einem Server-Neustart automatisch wieder hochfahren:
> ```yaml
> api:
>   build: ./backend
>   restart: unless-stopped
>   # ...
>
> frontend:
>   build: ./frontend
>   restart: unless-stopped
>   # ...
> ```
> Für lokale Entwicklung ist das optional — Docker Desktop startet Container ohnehin nicht automatisch.

**Schritt 2: `.gitignore` erstellen**

Erstelle `.gitignore` im Projekt-Root:

```
.env
node_modules/
dist/
__pycache__/
*.pyc
```

**Schritt 3: Alles neu bauen und starten**

Stoppe zuerst alle laufenden Container und baue alles neu:

```bash
docker compose down
docker compose up -d --build
```

> **Hinweis:** Der erste Build des Frontends dauert einige Minuten, da `npm install` alle Packages herunterlädt. Folgende Builds sind dank Docker Layer-Caching deutlich schneller.

**Schritt 4: Status prüfen**

```bash
docker compose ps
```

Du solltest 4 Services sehen:

```
NAME                    SERVICE     STATUS
rezeptbuch-postgres-1   postgres    running (healthy)
rezeptbuch-mongo-1      mongo       running (healthy)
rezeptbuch-api-1        api         running
rezeptbuch-frontend-1   frontend    running
```

Falls ein Service nicht startet, prüfe die Logs:

```bash
docker compose logs api
docker compose logs frontend
```

### Die finale Architektur

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
  subgraph "compose.yaml"
    subgraph "Netzwerk (automatisch)"
      FE["🌐 frontend<br/>(nginx:alpine)<br/>Port 3000:80"]
      API["🐍 api<br/>(python:3.11-slim)"]
      PG["🐘 postgres<br/>(postgres:16)"]
      MO["🍃 mongo<br/>(mongo:7)"]
    end
    V1[(pg-daten)]
    V2[(mongo-daten)]
  end
  BR["🌐 Browser"] -->|"Port 3000"| FE
  FE -->|"/api/ → Proxy"| API
  API -->|"postgres:5432"| PG
  API -->|"mongo:27017"| MO
  V1 --> PG
  V2 --> MO
```

**Der Datenfluss im Detail:**

1. Browser öffnet `http://localhost:3000` → nginx liefert die React-App aus
2. React ruft `fetch("/api/rezepte")` auf → Browser sendet an Port 3000
3. nginx erkennt `/api/` → leitet weiter an `http://api:8000/api/rezepte`
4. FastAPI empfängt die Anfrage → fragt MongoDB nach Rezepten
5. MongoDB gibt Daten zurück → FastAPI → nginx → Browser

**4 Container, ein Befehl, ein Port.** Alles andere ist intern.

---

## Teil 8: Testen & Debugging

### Übung 6: End-to-End Test

> **Ziel:** Das gesamte Setup testen — Funktionalität und Persistenz.
>
> **Zeitbedarf:** ca. 10 Minuten
>
> **Du bist fertig, wenn:** Du Kategorien und Rezepte angelegt hast, der Persistenz-Test bestanden ist, und der Health-Endpoint beide Datenbanken als "connected" meldet.

**Schritt 1: Frontend öffnen**

Browser: `http://localhost:3000`

Du solltest das Rezeptbuch-Frontend sehen.

**Schritt 2: Kategorie hinzufügen**

1. Gib "Hauptgerichte" in das Kategorien-Feld ein
2. Klicke "Hinzufuegen"
3. Die Kategorie sollte in der Liste erscheinen

Füge noch eine hinzu: "Desserts"

**Schritt 3: Rezept hinzufügen**

1. Titel: "Spaghetti Carbonara"
2. Kategorie: "Hauptgerichte" (aus Dropdown)
3. Zutaten (eine pro Zeile):
   ```
   Spaghetti
   Eier
   Pecorino
   Guanciale
   Pfeffer
   ```
4. Schritte (einer pro Zeile):
   ```
   Wasser kochen und Pasta al dente kochen
   Eier mit geriebenem Pecorino vermischen
   Guanciale knusprig braten
   Alles vermischen und sofort servieren
   ```
5. Klicke "Rezept speichern"

Das Rezept sollte in der Liste erscheinen.

**Schritt 4: Health-Check**

Browser: `http://localhost:3000/api/health`

Sollte zeigen:

```json
{"postgres": "connected", "mongo": "connected"}
```

**Schritt 5: Persistenz-Test (der wichtigste Test!)**

```bash
# Container stoppen und löschen (Volumes bleiben!)
docker compose down

# Alles wieder starten
docker compose up -d
```

Browser: `http://localhost:3000` → **Deine Kategorien und Rezepte sind noch da!**

> Das funktioniert, weil die Named Volumes `pg-daten` und `mongo-daten` von `docker compose down` (ohne `-v`!) **nicht gelöscht** werden. Die Daten leben auf dem Host-Dateisystem, unabhängig von den Containern. (→ siehe Übung 29.3, Teil 2: Volumes + Übung 29.4, Teil 4: down vs. down -v)

<details>
<summary>Troubleshooting: Häufige Probleme und Lösungen</summary>

| Problem | Mögliche Ursache | Lösung |
|---------|------------------|--------|
| Frontend zeigt leere Seite | Build-Fehler im Frontend | `docker compose logs frontend` prüfen |
| "Network Error" im Browser | API nicht erreichbar | `docker compose logs api` prüfen |
| `/api/health` zeigt "error" | DB-Verbindung fehlgeschlagen | `docker compose ps` — laufen die DBs? |
| Rezepte werden nicht gespeichert | MongoDB-Auth-Fehler | `.env` prüfen: MONGO_USER/PASSWORD |
| Frontend zeigt "502 Bad Gateway" | API-Container nicht gestartet | `docker compose logs api` — Fehler? |

**Debugging-Workflow:**

1. `docker compose ps` — laufen alle 4 Container?
2. `docker compose logs <service>` — Fehlermeldungen?
3. `docker compose config` — compose.yaml korrekt? Variablen aufgelöst?
4. `docker compose exec api python -c "import psycopg2; print('OK')"` — Packages installiert?

</details>

---

## Teil 9: Ausblick — Deployment auf EC2

Dein Projekt läuft lokal. Wie bekommst du es auf einen Server? Hier ein kurzer Überblick. Die Details findest du in Übung 26.4 (AWS-Deployment).

### Was brauchst du auf EC2?

| Schritt | Befehl / Aktion |
|---------|-----------------|
| 1. Docker installieren | `sudo dnf install docker` + `sudo systemctl start docker` + `sudo systemctl enable docker` |
| 2. Docker Compose installieren | `sudo dnf install docker-compose-plugin` |
| 3. Projektdateien hochladen | `git clone ...` oder `scp -r` |
| 4. `.env`-Datei erstellen | Manuell auf dem Server (nicht aus Git!) |
| 5. Starten | `docker compose up -d --build` |
| 6. Security Group | Port 80 öffnen (→ siehe Übung 26.4, Teil 3.1) |

> **Docker ohne `sudo`:** Standardmäßig braucht jeder Docker-Befehl `sudo`. Um das zu vermeiden, füge deinen User zur `docker`-Gruppe hinzu:
> ```bash
> sudo usermod -aG docker $USER
> ```
> Danach **neu einloggen** (SSH-Session schließen und neu verbinden), damit die Gruppenänderung wirkt. Ab dann funktioniert `docker compose up -d` ohne `sudo`.

### Was ändert sich gegenüber lokal?

| Aspekt | Lokal | EC2 |
|--------|-------|-----|
| Frontend-Port | `3000:80` | `80:80` (Standard-HTTP-Port) |
| Port-Binding | `"127.0.0.1:3000:80"` (optional) | `"80:80"` (Security Group regelt Zugriff) |
| `.env`-Datei | Im Projektordner | Manuell auf dem Server erstellen |
| Images | Werden lokal gebaut | Werden auf dem Server gebaut |
| Zugriff | `http://localhost:3000` | `http://DEINE-PUBLIC-IP` |

> **Tipp:** Ändere in der compose.yaml nur den Frontend-Port auf `"80:80"` — alles andere bleibt gleich. Das ist die Stärke von Docker: Was lokal läuft, läuft (fast) identisch auf dem Server.

> **Für die vollständige EC2-Anleitung** (Instanz erstellen, SSH-Zugang, Security Groups, Server einrichten): → siehe **Übung 26.4: React-App auf AWS deployen**, Teil 3.

---

### Wissensfrage 9

**Welche zwei Dinge musst du auf einem EC2-Server zusätzlich installieren, die auf deinem Laptop durch Docker Desktop bereits vorhanden sind?**

<details>
<summary>Antwort anzeigen</summary>

1. **Docker Engine** — die Container-Runtime. Auf EC2 installierst du die Engine direkt (z.B. `sudo dnf install docker` auf Amazon Linux 2023), da es kein Docker Desktop gibt.

2. **Docker Compose Plugin** — das Compose-CLI. `sudo dnf install docker-compose-plugin` installiert den `docker compose`-Befehl.

Auf deinem Laptop übernimmt **Docker Desktop** beides: Es installiert die Docker Engine und das Compose Plugin zusammen mit einer grafischen Oberfläche. Auf einem Server brauchst du die GUI nicht — nur die CLI-Tools.

</details>

---

## Bonus: Best Practices Review

### Übung 7: "Schlechte" compose.yaml verbessern

> **Ziel:** Eine absichtlich schlecht geschriebene compose.yaml erkennen und nach Best Practices überarbeiten.
>
> **Zeitbedarf:** ca. 15 Minuten
>
> **Du bist fertig, wenn:** Du alle Probleme gefunden und eine verbesserte Version erstellt hast.

**Die "schlechte" compose.yaml (8 Probleme finden):**

```yaml
version: "3"

services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: supergeheim123
    ports:
      - "5432:5432"

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"

  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api
```

**Finde die 8 Probleme!** Überlege, was du in den letzten 5 Tagen über Docker-Best-Practices gelernt hast.

<details>
<summary>Hinweise (falls du nicht weiterkommst)</summary>

1. Schau dir die erste Zeile an — wird die noch gebraucht?
2. Welches Image-Tag verwendet `postgres`?
3. Wo sind die Passwörter?
4. Müssen alle Ports nach außen exponiert werden?
5. Gibt es Healthchecks?
6. Wie wartet `api` auf die Datenbank?
7. Wo werden die Daten gespeichert?
8. Welches Image-Tag verwendet `mongo`?

</details>

<details>
<summary>Lösung: Alle 8 Probleme</summary>

| # | Problem | Best Practice |
|---|---------|---------------|
| 1 | `version: "3"` | Nicht mehr nötig — Compose Specification erkennt das Format automatisch. Weglassen. |
| 2 | `image: postgres` (ohne Tag) | Immer **explizite Tags** verwenden: `postgres:16`. Sonst wird `:latest` gezogen → unvorhersehbare Versionen. |
| 3 | `image: mongo:latest` | `:latest` ist **nicht** "die neueste stabile Version" — es ist einfach ein Tag-Name, der sich jederzeit ändern kann. Besser: `mongo:7`. |
| 4 | `POSTGRES_PASSWORD: supergeheim123` | Passwörter **nie** direkt in die compose.yaml! In `.env`-Datei auslagern + `${POSTGRES_PASSWORD}`. |
| 5 | `ports: "5432:5432"` bei DB | Datenbank-Ports **nicht exponieren** wenn nur die API darauf zugreift. Nur der Frontend-Port muss nach außen. |
| 6 | `ports: "27017:27017"` bei Mongo | Gleich wie bei PostgreSQL — MongoDB braucht keinen externen Port. |
| 7 | Kein `depends_on: condition: service_healthy` | Einfaches `depends_on` wartet nicht auf DB-Bereitschaft. Healthchecks ergänzen! |
| 8 | Keine `volumes:` für Datenbanken | Ohne Named Volumes gehen **alle Daten verloren** bei `docker compose down`! |

**Verbesserte Version:**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pg-daten:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo-daten:/data/db
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mongosh --quiet -u $$MONGO_INITDB_ROOT_USERNAME -p $$MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval \"db.adminCommand('ping').ok\" | grep 1",
        ]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 20s

  api:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
      mongo:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  pg-daten:
  mongo-daten:
```

</details>

---

## Aufräumen

Wenn du mit allen Übungen fertig bist:

**Übung 1 (Multi-Stage):** Wurde bereits in Übung 1 aufgeräumt.

**Übungen 2–7 (Rezeptbuch-Projekt):**

```bash
docker compose down --rmi local -v --remove-orphans
```

> **Was machen die Flags?**
> - `--rmi local` → löscht die lokal gebauten Images (api, frontend), nicht die von Docker Hub gezogenen (postgres, mongo)
> - `-v` → löscht die Named Volumes (pg-daten, mongo-daten) → **Daten werden gelöscht!**
> - `--remove-orphans` → entfernt Container von Services, die nicht mehr in der compose.yaml stehen (z.B. nach Umbenennung)
>
> Nur verwenden, wenn du das Projekt wirklich aufräumen willst.

<details>
<summary>Git Bash / macOS / Linux</summary>

```bash
cd ..
rm -rf rezeptbuch
```

</details>

<details>
<summary>PowerShell</summary>

```powershell
cd ..
Remove-Item -Recurse -Force rezeptbuch
```

</details>

<details>
<summary>CMD</summary>

```cmd
cd ..
rmdir /s /q rezeptbuch
```

</details>

---

## Abschluss-Checkliste

Überprüfe, ob du die Lernziele erreicht hast:

- [ ] Ich kann einen **Multi-Stage Build** erstellen und den Größenvorteil erklären
- [ ] Ich kann die **Projektstruktur** für eine Multi-Container-App organisieren (compose.yaml im Root, Dockerfile pro Service)
- [ ] Ich kenne den empfohlenen **Development-Workflow** mit Docker (DBs sofort, Code containerisieren am Ende)
- [ ] Ich kann **PostgreSQL + MongoDB** gemeinsam in Compose konfigurieren (Healthchecks, Volumes, Authentifizierung)
- [ ] Ich kann ein **FastAPI-Backend** mit zwei Datenbanken verbinden (psycopg2 + motor)
- [ ] Ich kann eine **React-App** per Multi-Stage Build in ein nginx-Image verpacken (node → nginx)
- [ ] Ich kann einen **nginx Reverse-Proxy** konfigurieren (SPA-Routing + API-Weiterleitung)
- [ ] Ich kann ein **4-Container-Setup** mit Compose orchestrieren (Frontend + API + PostgreSQL + MongoDB)
- [ ] Ich setze **.env / .env.example / .gitignore** korrekt ein und weiß, warum Secrets nicht in die compose.yaml gehören
- [ ] Ich kann die App **end-to-end testen** (Funktionalität, Persistenz, Health-Endpoint)
- [ ] Ich weiß, was sich beim **EC2-Deployment** gegenüber lokal ändert (Docker installieren, Port 80, Security Group)
- [ ] Ich kann **Docker Best Practices** anwenden (explizite Tags, Healthchecks, keine Secrets in YAML, nur nötige Ports)

> **Glückwunsch!** Du hast in 5 Tagen den kompletten Weg von "Was ist ein Container?" bis zu einem professionellen Multi-Container-Projekt mit Docker Compose gemeistert. Diese Fähigkeiten sind in der modernen Webentwicklung Standard — ob im Team, in CI/CD-Pipelines oder beim Cloud-Deployment.
