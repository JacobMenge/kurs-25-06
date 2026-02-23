# Redis mit Docker Compose - Praktische Übungen

## Übersicht

In dieser Übung baust du ein vollständiges Multi-Container-Setup mit Docker Compose:

- **Redis als Docker-Container** - Redis im Container starten und erkunden
- **Docker Compose** - FastAPI + PostgreSQL + Redis in einer `docker-compose.yml`
- **Persistenz** - Redis-Daten überleben Container-Neustarts
- **Health Checks** - Sicherstellen, dass Services in der richtigen Reihenfolge starten

Diese Übung baut auf den Docker-Grundlagen aus Woche 8 und dem Redis-Wissen der vorherigen Übungen auf.

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Docker Compose & Multi-Container-Apps | 10 min (lesen) |
| **Teil 1** | Redis als Docker-Container | 20 min |
| **Teil 2** | Docker Compose: FastAPI + PostgreSQL + Redis | 35 min |
| **Teil 3** | Persistenz und Volumes für Redis | 20 min |
| **Teil 4** | Health Checks und Abhängigkeiten | 25 min |
| **Bonus** | Redis Commander (Web-GUI) | 15 min |
| | **Gesamt** | **ca. 2–2,5 Stunden** |

**Minimalpfad (ca. 90 Minuten):** Teil 1 (Redis im Container) und Teil 2 (Docker Compose). Persistenz und Health Checks sind optional, aber für produktionsnahe Setups empfohlen.

---

## Rückblick: Docker Compose & Multi-Container-Apps

### Von einzelnen Containern zu Multi-Container-Apps

In Woche 8 habt ihr einzelne Container gestartet (`docker run ...`). In der Praxis besteht eine Anwendung aber aus **mehreren Services** – und die sollen zusammenarbeiten.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    subgraph compose ["docker-compose.yml"]
        F["⚙️ <b>fastapi</b><br/>Port 8000"]
        P["🐘 <b>postgres</b><br/>Port 5432"]
        R["⚡ <b>redis</b><br/>Port 6379"]
    end
    F -->|SQL| P
    F -->|GET/SET| R
    U["🖥️ Browser"] -->|HTTP| F
```

### Ohne vs. mit Docker Compose

| Ohne Compose | Mit Compose |
|-------------|------------|
| `docker run ... postgres` | `docker compose up` |
| `docker run ... redis` | (startet alles auf einmal) |
| `docker run ... fastapi` | |
| 3 separate Befehle | **1 Befehl** |
| Manuelles Netzwerk-Setup | **Automatisches Netzwerk** |
| Port-Mapping pro Container | **Alles in einer Datei** |

> **Voraussetzung:** Diese Übung nutzt **Docker Compose v2** (das `docker compose`-Kommando ohne Bindestrich). Das ist in Docker Desktop standardmäßig enthalten. Falls du stattdessen das ältere `docker-compose` (v1, mit Bindestrich) hast, funktionieren Features wie `condition: service_healthy` möglicherweise nicht. Prüfe mit `docker compose version` – du brauchst mindestens v2.

### Wissensfrage 1

Warum ist Docker Compose besser als drei einzelne `docker run`-Befehle?

<details markdown>
<summary>Antwort anzeigen</summary>

1. **Ein Befehl:** `docker compose up` startet alle Services gleichzeitig.
2. **Gemeinsames Netzwerk:** Compose erstellt automatisch ein Netzwerk. Services finden sich über ihren Namen (z.B. `redis:6379` statt `172.17.0.3:6379`).
3. **Deklarativ:** Die `docker-compose.yml` beschreibt den **Soll-Zustand**. Du sagst *was* du willst, nicht *wie* es gestartet werden soll.
4. **Reproduzierbar:** Jeder im Team kann mit derselben Datei das gleiche Setup starten.
5. **Abhängigkeiten:** `depends_on` steuert die Startreihenfolge.

</details>

---

## Teil 1: Redis als Docker-Container

### Übung 1: Redis-Container starten und erkunden

> **Ziel:** Redis als eigenständigen Container starten und die CLI nutzen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du per `docker exec` in redis-cli arbeitest

Falls du noch einen Redis-Container aus der ersten Übung hast, stoppe ihn zuerst:

```bash
docker stop redis
docker rm redis
```

**Starte einen frischen Redis-Container:**

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Erkunde den Container:**

```bash
# redis-cli im Container öffnen
docker exec -it redis redis-cli

# Redis-Version prüfen
INFO server
# Suche nach "redis_version"

# Speicher-Infos
INFO memory
# Suche nach "used_memory_human"
```

**Den Container von außen inspizieren:**

```bash
# Container-Logs anzeigen
docker logs redis

# Container-Details
docker inspect redis | grep -i "ipaddress"
```

### Übung 2: Warum redis:7-alpine?

> **Ziel:** Verstehen, warum wir das Alpine-Image verwenden
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du den Unterschied zwischen `redis` und `redis:7-alpine` erklären kannst

```bash
# Vergleiche die Image-Größen
docker images redis
```

| Image | Größe | Basis |
|-------|-------|-------|
| `redis:7` | ~130 MB | Debian |
| `redis:7-alpine` | ~13 MB | Alpine Linux |

Alpine Linux ist eine minimale Linux-Distribution – perfekt für Container, weil sie **10x kleiner** ist. Weniger Speicher, schnellerer Download, kleinere Angriffsfläche.

> **Faustregel:** Wenn ein `-alpine`-Variante existiert, bevorzuge sie. Nur wenn du spezielle Pakete brauchst, greif zum vollständigen Image.

---

## Teil 2: Docker Compose – FastAPI + PostgreSQL + Redis

### Übung 3: docker-compose.yml erstellen

> **Ziel:** Eine Docker-Compose-Datei schreiben, die alle drei Services startet
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** `docker compose up` alle Services startet und FastAPI auf Redis zugreifen kann

**Schritt 1:** Stoppe den einzelnen Redis-Container (damit der Port frei wird):

```bash
docker stop redis
docker rm redis
```

**Schritt 2:** Erstelle diese `docker-compose.yml` im Projektordner:

```yaml
services:
  fastapi:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kursapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: kursapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

**Was passiert hier?**

| Zeile | Bedeutung |
|-------|-----------|
| `build: ./backend` | FastAPI-Image aus dem `backend/`-Ordner bauen (dort liegt das Dockerfile) |
| `@postgres:5432` | Service-Name als Hostname (nicht `localhost`!) |
| `redis://redis:6379` | Gleiches Prinzip – `redis` ist der Service-Name |
| `depends_on` | FastAPI startet erst, nachdem PostgreSQL und Redis laufen |
| `volumes: pgdata:` | PostgreSQL-Daten auf einem Docker Volume (persistent) |

> **Wichtig:** Innerhalb von Docker Compose verwenden Services **Service-Namen als Hostnames**. Also `redis:6379` statt `localhost:6379` und `postgres:5432` statt `localhost:5432`. Das ist der häufigste Fehler!

**Schritt 3:** Passe deine `redis_client.py` an (falls noch nicht geschehen):

```python
# redis_client.py
import redis
import os

# Im Docker: REDIS_URL=redis://redis:6379/0
# Lokal: Fallback auf localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)
```

**Schritt 4:** Starte alles:

```bash
docker compose up -d
```

**Schritt 5:** Prüfe, ob alles läuft:

```bash
# Alle Container anzeigen
docker compose ps

# Logs eines bestimmten Services
docker compose logs fastapi
docker compose logs redis

# Health-Check
curl http://localhost:8000/health
```

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `Connection refused` zu Redis | FastAPI startet vor Redis bereit ist | Health Checks hinzufügen (Teil 4) |
| `REDIS_URL` wird ignoriert | `.env`-Datei oder Dockerfile überschreibt die Variable | `docker compose config` prüfen |
| `build: ./backend` schlägt fehl | Kein Dockerfile im `backend/`-Ordner | Dockerfile erstellen (siehe Woche 8) |
| Port-Konflikte | Lokaler Redis/PostgreSQL belegt den Port | Lokale Services stoppen oder andere Ports nutzen |

### Übung 4: Docker Compose steuern

> **Ziel:** Die wichtigsten Docker-Compose-Befehle kennen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Du Services starten, stoppen, neu bauen und Logs lesen kannst

| Befehl | Was passiert |
|--------|-------------|
| `docker compose up -d` | Alle Services im Hintergrund starten |
| `docker compose down` | Alle Services stoppen und Container entfernen |
| `docker compose ps` | Status aller Services anzeigen |
| `docker compose logs -f` | Logs aller Services live verfolgen |
| `docker compose logs redis` | Logs nur für Redis |
| `docker compose restart fastapi` | Nur FastAPI neu starten |
| `docker compose build` | Images neu bauen (nach Code-Änderungen) |
| `docker compose up -d --build` | Neu bauen **und** starten (ein Befehl) |

**Probiere aus:**

```bash
# Alles stoppen
docker compose down

# Wieder starten
docker compose up -d

# Nur Redis-Logs anschauen
docker compose logs redis

# In den Redis-Container springen
docker compose exec redis redis-cli
PING
```

> **Tipp:** `docker compose exec redis redis-cli` ist das Compose-Äquivalent zu `docker exec -it redis redis-cli`. Du brauchst kein `-it`, weil Compose das automatisch erkennt.

---

## Teil 3: Persistenz und Volumes für Redis

### Übung 5: Das Persistenz-Problem

> **Ziel:** Verstehen, dass Redis-Daten standardmäßig verloren gehen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du das Problem selbst beobachtet hast

**Experiment: Daten gehen verloren**

```bash
# 1. Daten in Redis schreiben
docker compose exec redis redis-cli SET wichtig "diese Daten sind wertvoll"
docker compose exec redis redis-cli GET wichtig
# "diese Daten sind wertvoll"

# 2. Container stoppen und neu starten
docker compose down
docker compose up -d

# 3. Daten prüfen
docker compose exec redis redis-cli GET wichtig
# (nil) – VERLOREN!
```

> **Warum?** Redis speichert Daten standardmäßig nur im RAM. Wenn der Container gestoppt wird, ist der RAM weg – und damit die Daten.

### Übung 6: Persistenz aktivieren

> **Ziel:** Redis-Daten überleben Container-Neustarts
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Daten nach `docker compose down` + `up` noch vorhanden sind

Ändere den Redis-Service in deiner `docker-compose.yml`:

```yaml
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
```

Und füge das Volume unten hinzu:

```yaml
volumes:
  pgdata:
  redisdata:
```

**Was bedeuten die neuen Zeilen?**

| Zeile | Bedeutung |
|-------|-----------|
| `command: redis-server --appendonly yes` | Aktiviert AOF (Append Only File) – Redis protokolliert Schreiboperationen auf der Festplatte |
| `volumes: - redisdata:/data` | Docker Volume für Redis-Daten (persistent) |

**Teste es:**

```bash
# Compose neu starten (mit der neuen Konfiguration)
docker compose down
docker compose up -d

# Daten schreiben
docker compose exec redis redis-cli SET wichtig "diese Daten bleiben"

# Compose komplett herunterfahren und neu starten
docker compose down
docker compose up -d

# Daten prüfen
docker compose exec redis redis-cli GET wichtig
# "diese Daten bleiben" – PERSISTIERT!
```

### Redis-Persistenz-Modi

| Modus | Wie | Wann sinnvoll |
|-------|-----|---------------|
| Kein Modus (Standard) | Nur RAM | Reine Caches (Datenverlust akzeptabel) |
| **AOF** (Append Only File) | Jede Schreiboperation wird protokolliert | Sessions, Rate-Limits, wichtige Caches |
| RDB (Snapshot) | Periodische Snapshots (z.B. alle 60 Sek) | Weniger I/O, akzeptiert kleinen Datenverlust |
| AOF + RDB | Beides kombiniert | Maximale Sicherheit |

> **Für unseren Zweck:** AOF (`--appendonly yes`) ist der beste Kompromiss – einfach zu konfigurieren und **minimiert Datenverlust**. Standard-AOF (`appendfsync everysec`) synchronisiert jede Sekunde – im schlimmsten Fall (Absturz) verlierst du also maximal die Writes der letzten Sekunde. Für Caches ist das völlig egal, für Sessions akzeptabel. Nur bei harten Durability-Anforderungen (z.B. Zahlungsdaten) braucht man `appendfsync always` – aber dafür nimmt man besser PostgreSQL.

### Wissensfrage 2

Was passiert mit den Redis-Daten, wenn du `docker compose down -v` statt `docker compose down` verwendest?

<details markdown>
<summary>Antwort anzeigen</summary>

Das `-v` Flag löscht auch die **Volumes**. Das heißt: Sowohl die PostgreSQL-Daten (`pgdata`) als auch die Redis-Daten (`redisdata`) werden **unwiderruflich gelöscht**!

- `docker compose down` → Container weg, Volumes bleiben
- `docker compose down -v` → Container **und** Volumes weg

Deshalb ist `-v` gefährlich und sollte nur verwendet werden, wenn du bewusst alle Daten löschen willst (z.B. für einen Clean Start).

</details>

---

## Teil 4: Health Checks und Abhängigkeiten

### Übung 7: Das Timing-Problem

> **Ziel:** Verstehen, warum `depends_on` allein nicht ausreicht
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du weißt, warum Health Checks nötig sind

`depends_on` steuert nur die **Startreihenfolge** – aber nicht, ob ein Service **tatsächlich bereit** ist.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
sequenceDiagram
    participant D as Docker Compose
    participant P as PostgreSQL
    participant R as Redis
    participant F as FastAPI

    D->>P: Container starten
    D->>R: Container starten
    Note over P: Initialisierung...<br/>(dauert 2-5 Sek)
    Note over R: Bereit!<br/>(sofort)
    D->>F: Container starten
    F->>P: Verbindung versuchen
    Note over F,P: ❌ Fehler! PostgreSQL<br/>ist noch nicht bereit!
```

**Die Lösung:** Health Checks – Docker prüft regelmäßig, ob ein Service wirklich bereit ist.

### Übung 8: Health Checks konfigurieren

> **Ziel:** Health Checks für PostgreSQL und Redis hinzufügen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** FastAPI erst startet, nachdem PostgreSQL und Redis tatsächlich bereit sind

Erweitere deine `docker-compose.yml`:

```yaml
services:
  fastapi:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kursapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: kursapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

**Was ist neu?**

| Konfiguration | Bedeutung |
|--------------|-----------|
| `healthcheck: test` | Befehl, der prüft ob der Service bereit ist |
| `pg_isready -U postgres` | PostgreSQL-eigenes Tool: "Bist du bereit?" |
| `redis-cli ping` | Gibt `PONG` zurück wenn Redis bereit ist |
| `interval: 5s` | Alle 5 Sekunden prüfen |
| `timeout: 5s` | Nach 5 Sekunden als fehlgeschlagen werten |
| `retries: 5` | 5 Versuche, bevor der Service als "unhealthy" gilt |
| `condition: service_healthy` | Warte nicht nur auf Start, sondern auf **"healthy"** |

**Teste es:**

```bash
docker compose down
docker compose up -d

# Status prüfen – achte auf "healthy"
docker compose ps
```

Du solltest sehen:
```
NAME       STATUS                   PORTS
fastapi    Up 5 seconds             0.0.0.0:8000->8000/tcp
postgres   Up 10 seconds (healthy)  0.0.0.0:5432->5432/tcp
redis      Up 10 seconds (healthy)  0.0.0.0:6379->6379/tcp
```

FastAPI startet jetzt erst, wenn PostgreSQL **und** Redis `(healthy)` sind.

---

## Zusammenfassung: Vollständige docker-compose.yml

Hier die komplette Datei mit allen Features aus dieser Übung:

```yaml
services:
  fastapi:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kursapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: kursapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

---

## Bonus: Redis Commander (Web-GUI)

> **Ziel:** Redis-Daten über eine Web-Oberfläche anschauen
> **Zeitbedarf:** ca. 15 Minuten

Manchmal ist eine grafische Oberfläche praktischer als redis-cli. **Redis Commander** ist ein Web-Tool dafür.

Füge diesen Service zu deiner `docker-compose.yml` hinzu:

```yaml
  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      REDIS_HOSTS: local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      redis:
        condition: service_healthy
```

```bash
docker compose up -d
```

Öffne `http://localhost:8081` im Browser. Du siehst alle Redis-Keys, kannst Werte anschauen, bearbeiten und löschen – alles über die Web-Oberfläche.

> **Hinweis:** Redis Commander ist ein Entwicklungs-Tool und sollte **nicht** in Produktion eingesetzt werden (kein Passwortschutz).

---

## Checkliste

- [ ] Redis als eigenständigen Docker-Container gestartet und erkundet
- [ ] Docker Compose mit FastAPI + PostgreSQL + Redis funktioniert
- [ ] `docker compose up -d` startet alle Services mit einem Befehl
- [ ] Service-Namen als Hostnames verstanden (`redis:6379` statt `localhost:6379`)
- [ ] Redis-Daten überleben Container-Neustarts (AOF + Volume)
- [ ] Health Checks konfiguriert – FastAPI wartet auf healthy Services
- [ ] Kannst den Unterschied zwischen `docker compose down` und `docker compose down -v` erklären
