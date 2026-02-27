---
title: Docker Cheat Sheet
tags:
  - Docker
  - Docker-Compose
  - Cheat-Sheet
---

# Docker Cheat Sheet

Kompakte Referenz fuer die wichtigsten Docker- und Docker-Compose-Befehle.

---

## Container

### Wichtige Befehle

| Befehl | Beschreibung |
|---|---|
| `docker run <image>` | Neuen Container starten |
| `docker run -d <image>` | Im Hintergrund starten (detached) |
| `docker run -p 8080:80 <image>` | Port-Mapping (Host:Container) |
| `docker run --name mein-app <image>` | Container mit Namen starten |
| `docker run -it <image> bash` | Interaktiv mit Shell starten |
| `docker ps` | Laufende Container anzeigen |
| `docker ps -a` | Alle Container anzeigen (inkl. gestoppte) |
| `docker stop <container>` | Container stoppen |
| `docker start <container>` | Gestoppten Container starten |
| `docker restart <container>` | Container neu starten |
| `docker rm <container>` | Container loeschen |
| `docker logs <container>` | Logs anzeigen |
| `docker logs -f <container>` | Logs live verfolgen |
| `docker exec -it <container> bash` | Shell in laufendem Container oeffnen |

### Praktische Beispiele

```bash
# Nginx Webserver starten
docker run -d --name webserver -p 8080:80 nginx

# Container mit Umgebungsvariablen
docker run -d --name db \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=geheim \
    -e POSTGRES_DB=meine_db \
    -p 5432:5432 \
    postgres

# Container mit Volume (Daten persistent speichern)
docker run -d --name db \
    -v postgres_daten:/var/lib/postgresql/data \
    postgres

# Lokales Verzeichnis einbinden (Bind Mount)
docker run -d --name app \
    -v $(pwd)/src:/app/src \
    -p 3000:3000 \
    node:20

# Alle gestoppten Container loeschen
docker rm $(docker ps -aq -f status=exited)
```

---

## Images

| Befehl | Beschreibung |
|---|---|
| `docker build -t mein-image .` | Image aus Dockerfile bauen |
| `docker build -t mein-image:v1.0 .` | Mit Tag/Version |
| `docker pull <image>` | Image herunterladen |
| `docker push <image>` | Image hochladen (Registry) |
| `docker images` | Lokale Images auflisten |
| `docker rmi <image>` | Image loeschen |
| `docker tag <image> <neuer-name>` | Image taggen |
| `docker image prune` | Unbenutzte Images loeschen |

```bash
# Image bauen und taggen
docker build -t meine-app:latest .
docker build -t meine-app:v1.0 .

# Image fuer Docker Hub taggen
docker tag meine-app:latest benutzername/meine-app:latest

# Image pushen (nach docker login)
docker login
docker push benutzername/meine-app:latest
```

---

## Volumes & Netzwerke

=== "Volumes"

    ```bash
    # Volume erstellen
    docker volume create meine_daten

    # Alle Volumes anzeigen
    docker volume ls

    # Volume-Details anzeigen
    docker volume inspect meine_daten

    # Volume loeschen
    docker volume rm meine_daten

    # Unbenutzte Volumes loeschen
    docker volume prune
    ```

    | Typ | Syntax | Verwendung |
    |---|---|---|
    | Named Volume | `-v name:/pfad/im/container` | Persistente Daten (z.B. Datenbanken) |
    | Bind Mount | `-v /host/pfad:/container/pfad` | Entwicklung (Live-Code-Aenderungen) |
    | tmpfs | `--tmpfs /pfad` | Temporaere Daten (nur im RAM) |

=== "Netzwerke"

    ```bash
    # Netzwerk erstellen
    docker network create mein_netzwerk

    # Alle Netzwerke anzeigen
    docker network ls

    # Container mit Netzwerk starten
    docker run -d --name api --network mein_netzwerk mein-api
    docker run -d --name db --network mein_netzwerk postgres

    # Container im selben Netzwerk erreichen sich ueber den Namen
    # z.B. api kann db ueber "db:5432" ansprechen

    # Netzwerk-Details anzeigen
    docker network inspect mein_netzwerk

    # Netzwerk loeschen
    docker network rm mein_netzwerk
    ```

---

## Dockerfile

### Aufbau und Befehle

| Anweisung | Beschreibung |
|---|---|
| `FROM` | Basis-Image festlegen |
| `WORKDIR` | Arbeitsverzeichnis setzen |
| `COPY` | Dateien vom Host in den Container kopieren |
| `RUN` | Befehl waehrend des Builds ausfuehren |
| `EXPOSE` | Port dokumentieren (oeffnet den Port nicht!) |
| `CMD` | Standardbefehl beim Containerstart |
| `ENTRYPOINT` | Hauptprozess festlegen (nicht ueberschreibbar) |
| `ENV` | Umgebungsvariable setzen |
| `ARG` | Build-Argument definieren |

### Beispiel: Python-Anwendung

```dockerfile
# Basis-Image
FROM python:3.12-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhaengigkeiten zuerst kopieren (Cache-Optimierung)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungscode kopieren
COPY . .

# Port dokumentieren
EXPOSE 5000

# Umgebungsvariable setzen
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Startbefehl
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
```

### Beispiel: Node.js-Anwendung

```dockerfile
FROM node:20-alpine

WORKDIR /app

# package.json zuerst kopieren (Cache-Optimierung)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

!!! tip "Best Practices"
    - Verwende spezifische Image-Tags (z.B. `python:3.12-slim` statt `python:latest`)
    - Kopiere `requirements.txt` / `package.json` vor dem restlichen Code fuer besseres Caching
    - Verwende `-slim` oder `-alpine` Varianten fuer kleinere Images
    - Kombiniere `RUN`-Befehle mit `&&` um Layer zu reduzieren
    - Erstelle eine `.dockerignore`-Datei

### .dockerignore Beispiel

```
node_modules
venv
__pycache__
.git
.env
*.log
dist
build
.DS_Store
```

---

## Docker Compose

### compose.yaml Beispiel

```yaml
services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    depends_on:
      - api
    environment:
      - REACT_APP_API_URL=http://localhost:8000

  # Backend API
  api:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://admin:geheim@db:5432/meine_db
      - SECRET_KEY=mein-geheimer-schluessel

  # Datenbank
  db:
    image: postgres:16
    ports:
      - "5432:5432"
    volumes:
      - postgres_daten:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=geheim
      - POSTGRES_DB=meine_db

volumes:
  postgres_daten:
```

### Compose-Befehle

| Befehl | Beschreibung |
|---|---|
| `docker compose up` | Alle Services starten |
| `docker compose up -d` | Im Hintergrund starten |
| `docker compose up --build` | Images neu bauen und starten |
| `docker compose down` | Alle Services stoppen und entfernen |
| `docker compose down -v` | Inkl. Volumes loeschen |
| `docker compose ps` | Status der Services anzeigen |
| `docker compose logs` | Logs aller Services |
| `docker compose logs -f api` | Logs eines Services live |
| `docker compose exec api bash` | Shell in Service oeffnen |
| `docker compose build` | Nur Images bauen |
| `docker compose pull` | Images aktualisieren |
| `docker compose restart` | Services neu starten |

```bash
# Typischer Workflow
docker compose up -d          # Starten
docker compose logs -f        # Logs beobachten
docker compose exec api bash  # In Container gehen
docker compose down           # Alles stoppen
```

---

## Nuetzliche Kombinationen

```bash
# Alle ungenutzten Ressourcen loeschen (Images, Container, Netzwerke)
docker system prune

# Inkl. ungenutzter Volumes (VORSICHT!)
docker system prune -a --volumes

# Speicherverbrauch anzeigen
docker system df

# Detaillierter Speicherverbrauch
docker system df -v

# Container-Ressourcenverbrauch live anzeigen
docker stats

# Alle laufenden Container stoppen
docker stop $(docker ps -q)

# Alle Container loeschen
docker rm $(docker ps -aq)

# Alle Images loeschen
docker rmi $(docker images -q)

# Container-IP-Adresse herausfinden
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container>

# Dateien zwischen Host und Container kopieren
docker cp datei.txt container:/pfad/im/container/
docker cp container:/pfad/im/container/datei.txt ./lokal/
```

!!! warning "Vorsicht mit prune"
    `docker system prune -a --volumes` loescht **alle** ungenutzten Images, Container, Netzwerke und Volumes. Persistierte Daten in Volumes gehen dabei unwiderruflich verloren. Pruefe vorher mit `docker system df`, was geloescht wird.
