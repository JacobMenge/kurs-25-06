# Persistenz & Networking - Praktische Übungen

## Übersicht

In dieser Übung lernst du, wie Container Daten dauerhaft speichern und miteinander kommunizieren:

- **Das Stateless-Problem** - Verstehen, warum Container-Daten flüchtig sind
- **Docker Volumes** - Daten unabhängig vom Container-Lifecycle speichern
- **Bind Mounts** - Host-Verzeichnisse in Container einbinden (ideal für Entwicklung)
- **Docker Networking** - Container miteinander verbinden und kommunizieren lassen
- **Der localhost-Fehler** - Den häufigsten Anfängerfehler bei Container-Netzwerken verstehen
- **Datenbanken im Container** - PostgreSQL mit Persistenz und Netzwerk betreiben
- **App + Datenbank** - Eine Anwendung mit einer Datenbank im Container verbinden

Du kennst bereits Docker-Grundlagen (Tag 1) und kannst eigene Images bauen (Tag 2). Heute lernst du die zwei fehlenden Puzzle-Teile: **Persistenz** und **Networking** – damit deine Container Daten behalten und miteinander sprechen können!

---

## Inhaltsverzeichnis

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Wiederholung Tag 2 | 10 min (lesen) |
| **Teil 1** | Das Stateless-Problem | 15 min |
| **Teil 2** | Docker Volumes | 25 min |
| **Teil 3** | Bind Mounts | 20 min |
| **Teil 4** | Docker Networking | 25 min |
| **Teil 5** | Datenbank mit Persistenz | 30 min |
| **Teil 6** | App mit Datenbank verbinden | 20 min |
| **Teil 7** | Typische Fehler & Debugging | 15 min |
| **Bonus** | Redis Cache hinzufügen | 20 min |
| | **Gesamt** | **ca. 2,5–3 Stunden** |

### Minimalpfad (wenn du wenig Zeit hast)

**In 60–90 Minuten die wichtigsten Konzepte:**

1. **Rückblick** - Tag 2 auffrischen
2. **Teil 1** - Stateless-Problem - *Problem verstehen*
3. **Teil 2** - Volumes - *Kernkonzept Persistenz*
4. **Teil 4** - Networking - *Kernkonzept Kommunikation*
5. **Teil 5** - Datenbank mit Persistenz - *Alles zusammen*

---

## Voraussetzungen & Setup

**Bevor du startest:**

1. **Docker Desktop** ist installiert und läuft (das Docker-Symbol ist in der Taskleiste sichtbar)
2. Du hast ein **Terminal** offen (PowerShell, CMD, oder Git Bash unter Windows; Terminal unter macOS/Linux)
3. Du kannst ein **eigenes Image bauen und starten** (Tag 2 Wissen)

<details markdown>
<summary>Welche Shell nutze ich? (wichtig für Windows)</summary>

Unter Windows gibt es mehrere Shells – und sie verhalten sich unterschiedlich:

| Shell | Wo zu finden | Empfehlung |
|-------|-------------|------------|
| **Git Bash** | Wird mit Git installiert | Empfohlen – verhält sich wie Linux |
| **CMD** (Eingabeaufforderung) | `cmd` im Startmenü | Funktioniert gut |
| **PowerShell 7+** | `pwsh` im Startmenü | Funktioniert gut |
| **PowerShell 5.1** | `powershell` im Startmenü | Kann Probleme machen |

> **Achtung:** Windows PowerShell 5.1 (die Standard-PowerShell auf vielen Windows-Systemen) unterstützt **kein `&&`** zum Verketten von Befehlen. In dieser Übung schreiben wir Befehle deshalb immer einzeln untereinander. Falls du trotzdem zwei Befehle in einer Zeile verketten willst, nutze in PowerShell 5.1 ein Semikolon: `docker stop db; docker rm db`.

> **Bind Mounts unter Windows:** Bei Bind Mounts (Teil 3) gibt es Shell-spezifische Unterschiede bei Pfadangaben. Wir geben jeweils Varianten für alle Shells an.

</details>

**Überprüfe deine Installation:**

```bash
docker --version
```

Du solltest eine Versionsnummer sehen (z.B. `Docker version 27.x` oder höher – jede aktuelle Version funktioniert).

**Teste, ob du Container starten und stoppen kannst:**

```bash
docker run -d --name test-setup -p 9999:80 nginx
docker stop test-setup
docker rm test-setup
```

Falls alles ohne Fehler durchläuft, bist du startklar!

<details markdown>
<summary>Hilfe: Docker ist nicht installiert?</summary>

1. Gehe zu [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) und lade Docker Desktop herunter
2. Installiere es und starte den Computer ggf. neu
3. Starte Docker Desktop – warte, bis das Docker-Symbol in der Taskleiste **nicht mehr animiert**
4. Teste erneut mit `docker --version`

**Windows-spezifisch:** Falls WSL2 nicht installiert ist, folge den Anweisungen im Docker-Desktop-Installer. Du brauchst WSL2 für Docker unter Windows.

</details>

---

## Rückblick: Wiederholung Tag 2

Bevor wir Persistenz und Networking angehen, frischen wir die Dockerfile-Grundlagen vom Vortag auf.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph LR
    CODE["📁 <b>Dein Code</b><br/>+ Dockerfile"] -->|docker build| IMG["🐳 <b>Image</b><br/>(fertige Vorlage)"]
    IMG -->|docker run| CON["📦 <b>Container</b><br/>(laufende App)"]
    CON -->|docker stop / rm| DEL["🗑️ <b>Gelöscht</b><br/>(Daten weg!)"]
```

### Wissensfrage 1

Was macht ein Dockerfile und welche fünf Befehle hast du am häufigsten verwendet?

<details markdown>
<summary>Antwort anzeigen</summary>

Ein **Dockerfile** ist eine Textdatei mit Anweisungen zum Aufbau eines Images. Die fünf wichtigsten Befehle:

1. **`FROM`** – Basis-Image festlegen (z.B. `FROM python:3.11-slim`)
2. **`WORKDIR`** – Arbeitsverzeichnis setzen (z.B. `WORKDIR /app`)
3. **`COPY`** – Dateien ins Image kopieren (z.B. `COPY requirements.txt .`)
4. **`RUN`** – Befehle zur Build-Zeit ausführen (z.B. `RUN pip install -r requirements.txt`)
5. **`CMD`** – Startbefehl definieren (z.B. `CMD ["python", "app.py"]`)

</details>

### Wissensfrage 2

Warum werden Dependencies (requirements.txt / package.json) **VOR** dem App-Code kopiert?

<details markdown>
<summary>Antwort anzeigen</summary>

Wegen **Layer-Caching**! Wenn sich ein Layer ändert, werden alle folgenden Layer neu gebaut.

- Dependencies ändern sich selten → Layer wird gecacht
- App-Code ändert sich oft → nur dieser Layer wird neu gebaut

Wenn Dependencies vor dem App-Code kopiert werden, muss `pip install` / `npm install` nur dann erneut laufen, wenn sich die Dependency-Datei wirklich ändert. Das spart bei jedem Build Minuten.

</details>

### Wissensfrage 3

Was ist eine `.dockerignore` und warum ist sie wichtig?

<details markdown>
<summary>Antwort anzeigen</summary>

Eine `.dockerignore` funktioniert wie `.gitignore` und schließt Dateien vom **Build-Context** aus:

1. **Sicherheit:** Sensible Dateien wie `.env` (mit Passwörtern) landen nicht im Image
2. **Performance:** Kleinerer Build-Context = schnellere Builds
3. **Sauberkeit:** Unnötige Dateien wie `.git`, `__pycache__`, `venv` werden ausgeschlossen

Besonders kritisch bei `COPY . .` – ohne `.dockerignore` landet alles aus dem Ordner im Image.

</details>

---

## Teil 1: Das Stateless-Problem

### Container sind flüchtig

Am Tag 1 hast du gelernt: `docker rm` löscht einen Container und alle seine Daten. Das ist **kein Bug, sondern Absicht**! Container sollen austauschbar und skalierbar sein.

Aber was passiert mit den Daten einer Datenbank? Mit hochgeladenen Dateien? Mit Logs? Diese gehen bei `docker rm` verloren – das ist das **Stateless-Problem**.

### Die Container-Schichten

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    WR["✏️ <b>Writeable Layer</b><br/>(temporär – geht bei docker rm verloren!)"] --> L3["📄 <b>Image Layer 3:</b> App-Code"]
    L3 --> L2["📦 <b>Image Layer 2:</b> Dependencies"]
    L2 --> L1["💿 <b>Image Layer 1:</b> Basis-Image"]
    style WR fill:#fff3e0,stroke:#ffcc80,color:#e65100
```

- Die **Image-Layer** (unten) sind read-only und gehören zum Image
- Der **Writeable Layer** (oben) gehört zum Container – hier landen alle Änderungen zur Laufzeit
- Bei `docker rm` wird **nur der Writeable Layer** gelöscht – und damit alle Laufzeit-Daten!

### Übung 1: Datenverlust beweisen

> **Ziel:** Selbst erleben, dass Container-Daten bei `docker rm` verloren gehen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du gesehen hast, dass eine im Container erstellte Datei nach `docker rm` weg ist

**Schritt 1:** Starte einen Container und erstelle eine Datei darin:

```bash
docker run -d --name daten-test ubuntu sleep infinity
```

> **Hinweis:** `sleep infinity` hält den Container am Laufen, damit wir darin arbeiten können. Ohne einen laufenden Prozess würde der Container sofort beendet.

```bash
docker exec daten-test sh -c "echo 'Wichtige Daten!' > /tmp/meine-daten.txt"
```

**Schritt 2:** Prüfe, dass die Datei existiert:

```bash
docker exec daten-test cat /tmp/meine-daten.txt
```

Du solltest `Wichtige Daten!` sehen.

**Schritt 3:** Stoppe und lösche den Container:

```bash
docker stop daten-test
docker rm daten-test
```

**Schritt 4:** Starte einen neuen Container mit dem gleichen Image:

```bash
docker run -d --name daten-test ubuntu sleep infinity
```

**Schritt 5:** Prüfe, ob die Datei noch da ist:

```bash
docker exec daten-test cat /tmp/meine-daten.txt
```

<details markdown>
<summary>Lösung anzeigen</summary>

Du bekommst: `cat: /tmp/meine-daten.txt: No such file or directory`

Die Datei ist **weg**! Sie existierte nur im Writeable Layer des alten Containers. Der neue Container hat einen frischen, leeren Writeable Layer.

**Das ist das Stateless-Problem:** Alles, was ein Container zur Laufzeit schreibt, geht bei `docker rm` verloren.

</details>

**Aufräumen:**

```bash
docker stop daten-test
docker rm daten-test
```

### Wissensfrage 4

Warum sind Container absichtlich "stateless" – warum werden Daten bei `docker rm` gelöscht?

<details markdown>
<summary>Antwort anzeigen</summary>

Container sind absichtlich stateless, weil sie **austauschbar** und **skalierbar** sein sollen:

1. **Austauschbarkeit:** Wenn ein Container defekt ist, kann er einfach gelöscht und durch einen neuen ersetzt werden – ohne Altlasten
2. **Skalierbarkeit:** Man kann jederzeit weitere Container aus dem gleichen Image starten – jeder startet identisch
3. **Reproduzierbarkeit:** Jeder Container startet mit dem gleichen Zustand (dem Image) – keine "Drift" durch angesammelte Änderungen
4. **Updates:** Neue Version? Alten Container löschen, neuen aus dem aktualisierten Image starten

**Die Lösung für Daten, die bleiben müssen:** Daten **außerhalb** des Containers speichern – mit **Volumes** oder **Bind Mounts**.

</details>

---

## Teil 2: Docker Volumes

### Was sind Volumes?

Docker Volumes sind **von Docker verwaltete Speicherbereiche** auf dem Host-System. Sie existieren unabhängig vom Container-Lifecycle – eine Volume bleibt erhalten, auch wenn der Container gelöscht wird.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    subgraph container1 ["📦 Container 1 (gelöscht)"]
        C1["/data"]
    end
    subgraph container2 ["📦 Container 2 (neu)"]
        C2["/data"]
    end
    VOL["💾 <b>Docker Volume</b><br/>(bleibt erhalten!)"]
    C1 -.->|"docker rm"| VOL
    C2 -->|"-v myvol:/data"| VOL
    style VOL fill:#e8f5e9,stroke:#a5d6a7,color:#1b5e20
```

### Volume-Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `docker volume create <name>` | Volume erstellen |
| `docker volume ls` | Alle Volumes anzeigen |
| `docker volume inspect <name>` | Details einer Volume anzeigen |
| `docker volume rm <name>` | Volume löschen |
| `docker volume prune` | Alle ungenutzten Volumes löschen |

### Volume beim Container-Start mounten

```bash
docker run -v <volume_name>:/pfad/im/container <image>
```

> **Tipp:** Wenn die Volume noch nicht existiert, erstellt Docker sie automatisch beim `docker run`.

### Wissensfrage 5

Was ist der Unterschied zwischen dem Writeable Layer eines Containers und einer Docker Volume?

<details markdown>
<summary>Antwort anzeigen</summary>

| Eigenschaft | Writeable Layer | Docker Volume |
|-------------|----------------|---------------|
| **Lebensdauer** | Stirbt mit `docker rm` | Bleibt nach `docker rm` erhalten |
| **Verwaltet von** | Docker (intern, an Container gebunden) | Docker (extern, unabhängig) |
| **Performance** | Langsamer (Copy-on-Write) | Schneller (direkter Zugriff) |
| **Teilen** | Nicht möglich | Mehrere Container können dieselbe Volume nutzen |
| **Backup** | Schwierig | Einfach (bekannter Speicherort) |

**Merke:** Writeable Layer = temporär (für Laufzeit-Daten, die nicht bleiben müssen). Volume = persistent (für Daten, die Container-Neustarts überleben sollen).

</details>

### Übung 2: Volume-Persistenz testen

> **Ziel:** Beweisen, dass Daten in einer Volume einen `docker rm` überleben
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Du Daten geschrieben, den Container gelöscht und die Daten in einem neuen Container wiedergefunden hast

**Schritt 1:** Erstelle eine Volume:

```bash
docker volume create meine-daten
```

**Schritt 2:** Prüfe die Volume:

```bash
docker volume ls
docker volume inspect meine-daten
```

> **Beobachte:** `docker volume inspect` zeigt dir den `Mountpoint` – den tatsächlichen Speicherort auf dem Host. Unter Docker Desktop (Windows/macOS) liegt dieser innerhalb der Docker-VM und ist nicht direkt zugänglich.

**Schritt 3:** Starte einen Container mit der Volume und schreibe Daten:

```bash
docker run -d --name writer -v meine-daten:/data ubuntu sleep infinity
docker exec writer sh -c "echo 'Diese Daten überleben!' > /data/persistent.txt"
docker exec writer sh -c "date >> /data/persistent.txt"
```

**Schritt 4:** Prüfe die Datei:

```bash
docker exec writer cat /data/persistent.txt
```

**Schritt 5:** Lösche den Container:

```bash
docker stop writer
docker rm writer
```

**Schritt 6:** Starte einen **neuen** Container mit der **gleichen** Volume:

```bash
docker run -d --name reader -v meine-daten:/data ubuntu sleep infinity
docker exec reader cat /data/persistent.txt
```

<details markdown>
<summary>Lösung anzeigen</summary>

Du siehst die Daten aus Schritt 3 – `Diese Daten überleben!` und das Datum. Die Daten haben den `docker rm` überlebt!

**Zusammenfassung:**

1. Container "writer" hat Daten in die Volume geschrieben
2. Container "writer" wurde gelöscht (`docker rm`)
3. Container "reader" (ein komplett neuer Container) mountet die gleiche Volume
4. Die Daten sind noch da!

Das ist der Kernvorteil von Volumes: **Daten überleben den Container-Lifecycle.**

</details>

**Aufräumen:**

```bash
docker stop reader
docker rm reader
docker volume rm meine-daten
```

**Verifiziere:**

```bash
docker volume ls
```

Die Volume `meine-daten` sollte nicht mehr auftauchen.

> **Vorsicht mit `docker volume prune`:** Dieser Befehl löscht **alle** ungenutzten Volumes auf deinem System – nicht nur die aus dieser Übung. Nutze lieber `docker volume rm <name>` für gezieltes Aufräumen.

---

## Teil 3: Bind Mounts

### Was sind Bind Mounts?

Bind Mounts verbinden ein **Verzeichnis auf deinem Host** direkt mit einem Verzeichnis im Container. Änderungen sind **sofort in beide Richtungen** sichtbar – perfekt für die Entwicklung!

### Volumes vs. Bind Mounts

| Eigenschaft | Docker Volume | Bind Mount |
|-------------|--------------|------------|
| **Syntax** | `-v mein_volume:/data` (Name) | `-v /absoluter/pfad:/data` (Pfad) |
| **Verwaltet von** | Docker | Du selbst |
| **Speicherort** | Docker-intern (VM bei Desktop) | Beliebiger Host-Ordner |
| **Portabilität** | Hoch (Docker-unabhängig) | Host-abhängig |
| **Performance** | Optimal auf Linux | Kann langsamer sein (Win/Mac) |
| **Ideal für** | Produktion, Datenbanken | Entwicklung, Configs |

> **Faustregel:** Wenn der Wert vor dem `:` ein **Name** ist (z.B. `myvol`) → Volume. Wenn es ein **Pfad** ist (z.B. `/home/user/code` oder `$(pwd)`) → Bind Mount.

### Wissensfrage 6

Wann verwendest du eine Docker Volume und wann einen Bind Mount?

<details markdown>
<summary>Antwort anzeigen</summary>

**Docker Volume** verwenden für:
- **Datenbanken** (PostgreSQL, MongoDB, Redis) – Daten sollen dauerhaft gespeichert werden
- **Produktion** – Docker verwaltet den Speicherort, kein Pfad-Chaos
- **Teilen zwischen Containern** – mehrere Container greifen auf dieselbe Volume zu

**Bind Mount** verwenden für:
- **Entwicklung** – Code auf dem Host bearbeiten und sofort im Container sehen (ohne Rebuild!)
- **Konfigurationsdateien** – z.B. nginx.conf vom Host in den Container einbinden
- **Logs** – Container-Logs direkt auf dem Host lesen

**Merksatz:** Volume = "Docker, verwalte meine Daten!" / Bind Mount = "Ich bestimme, wo die Daten liegen!"

</details>

### Übung 3: Live-Code-Editing mit Bind Mounts

> **Ziel:** Eine HTML-Datei auf dem Host bearbeiten und die Änderung sofort im Browser sehen – ohne Image-Rebuild
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Du eine Datei auf dem Host geändert hast und die Änderung sofort im Browser sichtbar war

**Schritt 1:** Erstelle einen Projektordner mit einer HTML-Datei:

```bash
mkdir bind-mount-test
cd bind-mount-test
```

Erstelle die Datei `index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Bind Mount Demo</title></head>
<body>
    <h1>Version 1</h1>
    <p>Diese Seite wird vom Host geladen!</p>
</body>
</html>
```

**Schritt 2:** Starte einen nginx-Container mit Bind Mount:

<details markdown>
<summary>Git Bash (empfohlen unter Windows)</summary>

```bash
docker run -d --name web -p 8080:80 -v "$(pwd)":/usr/share/nginx/html:ro nginx
```

</details>

<details markdown>
<summary>PowerShell</summary>

```powershell
docker run -d --name web -p 8080:80 -v "${PWD}:/usr/share/nginx/html:ro" nginx
```

</details>

<details markdown>
<summary>CMD (Eingabeaufforderung)</summary>

```cmd
docker run -d --name web -p 8080:80 -v "%cd%":/usr/share/nginx/html:ro nginx
```

</details>

<details markdown>
<summary>macOS / Linux</summary>

```bash
docker run -d --name web -p 8080:80 -v "$(pwd)":/usr/share/nginx/html:ro nginx
```

</details>

> **Was bedeutet `:ro`?** Read-only – der Container kann die Dateien lesen, aber nicht verändern. Das ist eine Sicherheitsmaßnahme für Bind Mounts.

> **Falls Port 8080 bei dir belegt ist**, nimm einen anderen Port: `-p 8081:80` oder `-p 3000:80`. Passe dann die URL im Browser entsprechend an.

**Schritt 3:** Öffne im Browser:

```
http://localhost:8080
```

Du solltest "Version 1" sehen.

**Schritt 4:** Ändere die HTML-Datei auf dem Host – öffne `index.html` in deinem Editor und ändere den Inhalt:

```html
<!DOCTYPE html>
<html>
<head><title>Bind Mount Demo</title></head>
<body>
    <h1>Version 2 - Live Update!</h1>
    <p>Auf dem Host bearbeitet, sofort im Container sichtbar!</p>
    <p>Kein docker build nötig!</p>
</body>
</html>
```

**Schritt 5:** Lade die Seite im Browser neu (F5 oder Strg+R).

<details markdown>
<summary>Lösung anzeigen</summary>

Du siehst sofort "Version 2 - Live Update!" – **ohne** den Container neu zu starten oder das Image neu zu bauen!

**Das ist der Vorteil von Bind Mounts für die Entwicklung:**
- Code auf dem Host bearbeiten → sofort im Container wirksam
- Kein `docker build` nötig
- Kein `docker restart` nötig (bei statischen Dateien wie HTML)
- Ideal für Frontend-Entwicklung, Konfigurationsdateien, etc.

> **Bei App-Servern** (z.B. FastAPI, Express) brauchst du zusätzlich ein Auto-Reload-Feature (z.B. `uvicorn --reload`), damit Code-Änderungen automatisch erkannt werden. Statische Dateien (HTML, CSS, JS) werden von nginx aber sofort ohne Neustart ausgeliefert.

</details>

**Aufräumen:**

```bash
docker stop web
docker rm web
```

Lösche den Testordner:

<details markdown>
<summary>Git Bash / macOS / Linux</summary>

```bash
cd ..
rm -rf bind-mount-test
```

</details>

<details markdown>
<summary>PowerShell</summary>

```powershell
cd ..
Remove-Item -Recurse -Force bind-mount-test
```

</details>

<details markdown>
<summary>CMD</summary>

```cmd
cd ..
rmdir /s /q bind-mount-test
```

</details>

---

## Teil 4: Docker Networking

### Container sind isoliert

Container sind isoliert. Im sogenannten **default bridge** können Container sich zwar über IP-Adressen erreichen – aber **Namensauflösung** (Container-Name als Hostname) funktioniert dort **nicht**. Das bedeutet: Kein Service-Discovery, kein zuverlässiges Verlinken.

Darum erstellen wir immer ein eigenes **User-defined Bridge Network**. Erst dort funktioniert Docker-DNS: Container-Name = Hostname.

### Netzwerk-Typen

| Typ | Beschreibung | Use Case |
|-----|-------------|----------|
| **bridge** | Standard-Netzwerk, isoliert | Container auf einem Host verbinden |
| **host** | Container nutzt Host-Netzwerk | Performance, direkter Port-Zugriff |
| **none** | Kein Netzwerk | Maximale Isolation |

> **Achtung:** `--network host` war lange nur auf Linux verfügbar. Auf Docker Desktop funktioniert es ab Version 4.34 (Feature muss aktiviert werden). Für diesen Kurs nutzen wir **bridge networks** – die funktionieren überall.

> Für uns relevant: **Bridge-Netzwerke** – der Standard für die meisten Anwendungen.

### Der häufigste Fehler: localhost

> **Das ist der #1-Anfängerfehler bei Docker-Networking – verstehe ihn jetzt, dann sparst du dir Stunden Debugging!**

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    subgraph host ["🖥️ Dein Rechner"]
        BR["🌐 Browser<br/>localhost:8000 ✅"]
    end
    subgraph netzwerk ["🔗 Docker Network"]
        APP["📦 <b>App-Container</b><br/>localhost:5432 ❌<br/>db:5432 ✅"]
        DB["📦 <b>DB-Container</b><br/>Name: db<br/>Port 5432"]
    end
    BR -->|"-p 8000:8000"| APP
    APP -->|"Container-Name = Hostname"| DB
```

**Das Problem:**

- Auf deinem Rechner bedeutet `localhost` → "mein eigener Rechner"
- **Im Container** bedeutet `localhost` → "der Container selbst" (NICHT dein Rechner, NICHT andere Container!)
- Wenn deine App im Container `localhost:5432` anspricht, sucht sie die Datenbank **in sich selbst** – und findet nichts

**Die Lösung:**

- Container im **gleichen Docker-Netzwerk** können sich über ihren **Container-Namen** erreichen
- Docker hat einen eingebauten **DNS-Server**: Container-Name = Hostname
- Statt `localhost:5432` → `db:5432` (wobei `db` der Name des Datenbank-Containers ist)

> **Merke:** Im Docker-Netzwerk gilt: **Container-Name = Hostname. Nie IPs verwenden, nie `localhost`!**

### Network-Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `docker network create <name>` | Netzwerk erstellen |
| `docker network ls` | Alle Netzwerke anzeigen |
| `docker network inspect <name>` | Details eines Netzwerks anzeigen (welche Container sind drin?) |
| `docker network rm <name>` | Netzwerk löschen |

### Wissensfrage 7

Warum funktioniert `localhost` nicht, wenn ein Container einen anderen Container erreichen will?

<details markdown>
<summary>Antwort anzeigen</summary>

Weil `localhost` (127.0.0.1) in jedem Container auf den **Container selbst** zeigt – nicht auf den Host und nicht auf andere Container.

Jeder Container hat seinen eigenen Netzwerk-Namespace mit eigenem `localhost`. Wenn die App in Container A `localhost:5432` anspricht, sucht sie Port 5432 **in Container A** – nicht in Container B, wo die Datenbank läuft.

**Lösung:** Container im gleichen Docker-Netzwerk verwenden den **Container-Namen als Hostname**:

- `localhost:5432` ❌ → sucht in sich selbst
- `db:5432` ✅ → Docker-DNS löst "db" zum richtigen Container auf

Das funktioniert nur, wenn beide Container im **gleichen** Docker-Netzwerk sind.

</details>

### Port-Mapping vs. Netzwerk-Kommunikation

| Situation | Methode | Beispiel |
|-----------|---------|---------|
| **Browser → Container** | Port-Mapping (`-p`) | `localhost:8000` im Browser |
| **Container → Container** | Docker-Netzwerk | `db:5432` in der App-Config |
| **Host-Tool → Container** | Port-Mapping (`-p`) | `psql -h localhost -p 5432` |

> **Merke:** `-p` (Port-Mapping) brauchst du nur, wenn du **von außen** (Browser, Host-Tools) auf einen Container zugreifen willst. Container im gleichen Netzwerk brauchen kein Port-Mapping – sie kommunizieren direkt über den Container-Namen.

### Übung 4: Container miteinander verbinden

> **Ziel:** Zwei Container in einem Netzwerk starten und die Kommunikation testen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Ein Container den anderen über seinen Namen erreichen kann

**Schritt 1:** Erstelle ein Docker-Netzwerk:

```bash
docker network create mein-netzwerk
```

**Schritt 2:** Starte zwei Container im gleichen Netzwerk:

```bash
docker run -d --name server1 --network mein-netzwerk nginx
docker run -d --name server2 --network mein-netzwerk nginx
```

> **Beachte:** Wir brauchen hier kein `-p` (Port-Mapping), weil wir die Container nicht vom Browser aus erreichen wollen – nur untereinander!

**Schritt 3:** Teste die Kommunikation – mit einem dedizierten Tool-Container:

```bash
docker run --rm --network mein-netzwerk curlimages/curl http://server1
```

> **Warum ein eigener Container?** Viele Images (auch `nginx`) enthalten **kein** `curl`. Statt Tools im Ziel-Container zu installieren, starten wir einen kleinen Einweg-Container (`--rm`) mit `curlimages/curl` – das ist robuster und funktioniert immer.

<details markdown>
<summary>Lösung anzeigen</summary>

Du siehst die HTML-Ausgabe der nginx-Willkommensseite von `server1`! Das beweist:

1. Der Tool-Container kann `server1` **über den Container-Namen** erreichen
2. Docker-DNS löst den Namen `server1` automatisch zur IP-Adresse auf
3. Kein Port-Mapping nötig – Container im gleichen Netzwerk kommunizieren direkt

**Teste auch den umgekehrten Weg:**

```bash
docker run --rm --network mein-netzwerk curlimages/curl http://server2
```

</details>

**Schritt 4:** Prüfe das Netzwerk:

```bash
docker network inspect mein-netzwerk
```

> **Beobachte:** Du siehst beide Container mit ihren IP-Adressen im Netzwerk. Docker hat jedem Container automatisch eine IP zugewiesen und den DNS-Eintrag erstellt.

**Aufräumen:**

```bash
docker stop server1 server2
docker rm server1 server2
docker network rm mein-netzwerk
```

---

## Teil 5: Datenbank mit Persistenz

### Das Zusammenspiel: Volume + Network

Jetzt verbinden wir die beiden Konzepte: Eine Datenbank braucht **beides** – eine Volume für die Daten und ein Netzwerk für die Kommunikation.

### Übung 5: PostgreSQL mit Volume und Network

> **Ziel:** Eine PostgreSQL-Datenbank im Container betreiben, die Daten über Container-Neustarts hinweg behält
> **Zeitbedarf:** ca. 30 Minuten
> **Du bist fertig, wenn:** Du Daten in PostgreSQL geschrieben, den Container gelöscht, einen neuen gestartet und die Daten wiedergefunden hast

Dies ist die **Hauptübung** – sie verbindet Volumes und Networking!

**Schritt 1:** Erstelle Volume und Netzwerk:

```bash
docker volume create pg-daten
docker network create db-netzwerk
```

**Schritt 2:** Starte PostgreSQL mit Volume, Netzwerk und Umgebungsvariablen:

```bash
docker run -d \
  --name db \
  --network db-netzwerk \
  -v pg-daten:/var/lib/postgresql/data \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=geheim123 \
  -e POSTGRES_DB=meine_db \
  -p 5432:5432 \
  postgres:16
```

<details markdown>
<summary>PowerShell: Zeilenumbrüche</summary>

In PowerShell verwendest du das Backtick `` ` `` statt `\` für Zeilenumbrüche:

```powershell
docker run -d `
  --name db `
  --network db-netzwerk `
  -v pg-daten:/var/lib/postgresql/data `
  -e POSTGRES_USER=admin `
  -e POSTGRES_PASSWORD=geheim123 `
  -e POSTGRES_DB=meine_db `
  -p 5432:5432 `
  postgres:16
```

Alternativ alles in einer Zeile:

```powershell
docker run -d --name db --network db-netzwerk -v pg-daten:/var/lib/postgresql/data -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=geheim123 -e POSTGRES_DB=meine_db -p 5432:5432 postgres:16
```

</details>

Was bedeuten die neuen Flags?

| Flag | Bedeutung |
|------|-----------|
| `--network db-netzwerk` | Container an das Netzwerk anschließen |
| `-v pg-daten:/var/lib/postgresql/data` | Volume für PostgreSQL-Daten mounten |
| `-e POSTGRES_USER=admin` | Umgebungsvariable: Datenbankbenutzer |
| `-e POSTGRES_PASSWORD=geheim123` | Umgebungsvariable: Passwort |
| `-e POSTGRES_DB=meine_db` | Umgebungsvariable: Datenbankname |
| `-p 5432:5432` | Port-Mapping für Zugriff vom Host |

> **Hinweis:** Das PostgreSQL-Image liest die `POSTGRES_*`-Umgebungsvariablen **nur beim ersten Initialisieren** des Data-Verzeichnisses. Wenn die Volume bereits Daten enthält (z.B. nach einem Neustart), werden Änderungen an `POSTGRES_USER`, `POSTGRES_PASSWORD` oder `POSTGRES_DB` **ignoriert** – die DB gilt als "schon initialisiert". Falls du diese Werte wirklich ändern musst: Volume löschen (`docker volume rm pg-daten`) und neu starten.

> **Falls Port 5432 bei dir belegt ist** (z.B. durch eine lokal installierte PostgreSQL), nimm `-p 5433:5432` und passe den Port in den folgenden Befehlen an.

**Schritt 3:** Prüfe, ob PostgreSQL bereit ist:

```bash
docker logs db
```

> Du solltest am Ende `database system is ready to accept connections` sehen. Falls nicht, warte noch einen Moment und prüfe erneut.

> **Tipp:** Mit `pg_isready` kannst du die Bereitschaft auch scriptbar prüfen:
> ```bash
> docker exec db pg_isready -U admin
> ```
> Wenn die Antwort `accepting connections` lautet, ist die DB bereit. In Teil 6 kann es sein, dass `/health` kurz nach dem Start `"error"` zeigt, weil die DB noch initialisiert – das ist normal, einfach kurz warten und neu laden.

**Schritt 4:** Verbinde dich mit der Datenbank und erstelle eine Tabelle:

```bash
docker exec -it db psql -U admin -d meine_db
```

Du bist jetzt in der PostgreSQL-Shell (`meine_db=#`). Führe folgende SQL-Befehle aus:

```sql
CREATE TABLE notizen (
    id SERIAL PRIMARY KEY,
    titel TEXT NOT NULL,
    inhalt TEXT,
    erstellt_am TIMESTAMP DEFAULT NOW()
);

INSERT INTO notizen (titel, inhalt) VALUES ('Erste Notiz', 'Docker Volumes sind großartig!');
INSERT INTO notizen (titel, inhalt) VALUES ('Zweite Notiz', 'Daten überleben docker rm!');

SELECT * FROM notizen;
```

Du solltest die zwei Notizen sehen. Verlasse die PostgreSQL-Shell:

```sql
\q
```

**Schritt 5:** Jetzt der Härtetest – lösche den Container:

```bash
docker stop db
docker rm db
```

> **Moment der Wahrheit:** Der Container ist weg. Sind die Daten auch weg?

**Schritt 6:** Starte einen **komplett neuen** Container mit der **gleichen Volume**:

```bash
docker run -d \
  --name db \
  --network db-netzwerk \
  -v pg-daten:/var/lib/postgresql/data \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=geheim123 \
  -e POSTGRES_DB=meine_db \
  -p 5432:5432 \
  postgres:16
```

<details markdown>
<summary>PowerShell: Zeilenumbrüche</summary>

```powershell
docker run -d `
  --name db `
  --network db-netzwerk `
  -v pg-daten:/var/lib/postgresql/data `
  -e POSTGRES_USER=admin `
  -e POSTGRES_PASSWORD=geheim123 `
  -e POSTGRES_DB=meine_db `
  -p 5432:5432 `
  postgres:16
```

</details>

**Schritt 7:** Prüfe, ob die Daten noch da sind:

```bash
docker exec -it db psql -U admin -d meine_db -c "SELECT * FROM notizen;"
```

<details markdown>
<summary>Lösung anzeigen</summary>

Die Notizen sind noch da! Die Ausgabe zeigt beide Einträge mit `id`, `titel`, `inhalt` und `erstellt_am`.

**Was ist passiert?**

1. Der erste Container hat Daten in die Volume `pg-daten` geschrieben
2. `docker rm` hat den Container gelöscht – aber **nicht** die Volume
3. Der neue Container hat die **gleiche** Volume gemountet
4. PostgreSQL hat die vorhandenen Daten erkannt und verwendet

**Das ist das Standard-Muster für Datenbanken in Docker:**
- Volume für Persistenz
- Netzwerk für Kommunikation
- Umgebungsvariablen für Konfiguration

</details>

**Schritt 8 (optional):** Teste den Zugriff von einem anderen Container im gleichen Netzwerk:

```bash
docker run --rm --network db-netzwerk -e PGPASSWORD=geheim123 postgres:16 \
  psql -h db -U admin -d meine_db -c "SELECT * FROM notizen;"
```

<details markdown>
<summary>PowerShell: Zeilenumbrüche</summary>

```powershell
docker run --rm --network db-netzwerk -e PGPASSWORD=geheim123 postgres:16 `
  psql -h db -U admin -d meine_db -c "SELECT * FROM notizen;"
```

</details>

> **Warum `-e PGPASSWORD=geheim123`?** Ohne diese Umgebungsvariable fragt `psql` interaktiv nach dem Passwort – und im `--rm`-Container hängt die Eingabe manchmal. `PGPASSWORD` übergibt das Passwort direkt.

> **Beobachte:** Der temporäre Container verbindet sich über den Hostnamen `db` (= Container-Name) mit der Datenbank. Kein `localhost`, kein Port-Mapping nötig – nur das gleiche Netzwerk!

**Aufräumen:**

```bash
docker stop db
docker rm db
docker network rm db-netzwerk
docker volume rm pg-daten
```

---

## Teil 6: App mit Datenbank verbinden

### Übung 6: FastAPI + PostgreSQL

> **Ziel:** Eine Anwendung mit einer PostgreSQL-Datenbank im Container verbinden
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Deine FastAPI-App Daten in der PostgreSQL-Datenbank speichert und der Besuchszähler bei jedem Reload steigt

**Schritt 1:** Erstelle Netzwerk und Volume:

```bash
docker network create app-netzwerk
docker volume create app-db-daten
```

**Schritt 2:** Starte PostgreSQL:

```bash
docker run -d \
  --name app-db \
  --network app-netzwerk \
  -v app-db-daten:/var/lib/postgresql/data \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=geheim123 \
  -e POSTGRES_DB=app_db \
  postgres:16
```

<details markdown>
<summary>PowerShell: Zeilenumbrüche</summary>

```powershell
docker run -d `
  --name app-db `
  --network app-netzwerk `
  -v app-db-daten:/var/lib/postgresql/data `
  -e POSTGRES_USER=admin `
  -e POSTGRES_PASSWORD=geheim123 `
  -e POSTGRES_DB=app_db `
  postgres:16
```

</details>

**Schritt 3:** Erstelle einen Projektordner für die App:

```bash
mkdir fastapi-db
cd fastapi-db
```

**Schritt 4:** Erstelle die Datei `app.py`:

```python
from fastapi import FastAPI
import os
import psycopg2

app = FastAPI()

# WICHTIG: Container-Name "app-db" als Hostname, NICHT "localhost"!
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:geheim123@app-db:5432/app_db"
)

def get_connection():
    return psycopg2.connect(DATABASE_URL)

@app.on_event("startup")
def startup():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS besuche (
            id SERIAL PRIMARY KEY,
            zeitpunkt TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

@app.get("/")
def read_root():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO besuche DEFAULT VALUES")
    cur.execute("SELECT COUNT(*) FROM besuche")
    count = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Hello Docker mit Datenbank!", "besuche": count}

@app.get("/health")
def health():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
```

> **Beachte die DATABASE_URL:** `postgresql://admin:geheim123@app-db:5432/app_db` – hier steht **`app-db`** (der Container-Name), **nicht** `localhost`! Das ist der Schlüssel zur Container-Kommunikation.

> **Hinweis zu `@app.on_event("startup")`:** Dieses Pattern funktioniert, ist aber in neueren FastAPI-Versionen zugunsten der **lifespan**-API markiert. Für diese Übung ist es völlig ausreichend – wer es modern machen möchte, findet Details in der [FastAPI-Dokumentation zu Lifespan Events](https://fastapi.tiangolo.com/advanced/events/).

**Schritt 5:** Erstelle die Datei `requirements.txt`:

```text
fastapi~=0.115.0
uvicorn~=0.34.0
psycopg2-binary~=2.9.0
```

**Schritt 6:** Erstelle die Datei `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Schritt 7:** Baue das Image und starte den Container:

```bash
docker build -t fastapi-db-app .
```

```bash
docker run -d \
  --name app \
  --network app-netzwerk \
  -p 8000:8000 \
  fastapi-db-app
```

<details markdown>
<summary>PowerShell: Zeilenumbrüche</summary>

```powershell
docker build -t fastapi-db-app .
docker run -d `
  --name app `
  --network app-netzwerk `
  -p 8000:8000 `
  fastapi-db-app
```

</details>

> **Falls Port 8000 bei dir belegt ist**, nimm `-p 8001:8000` und passe die URL entsprechend an.

**Schritt 8:** Teste im Browser:

```
http://localhost:8000
http://localhost:8000/health
```

Lade die Hauptseite mehrmals neu – der Besuchszähler sollte bei jedem Reload steigen!

<details markdown>
<summary>Troubleshooting</summary>

| Problem | Mögliche Ursache | Lösung |
|---------|-----------------|--------|
| `Connection refused` | App kann DB nicht erreichen | Beide Container im gleichen Netzwerk? `docker network inspect app-netzwerk` |
| `could not translate host name "app-db"` | Container nicht im Netzwerk | `--network app-netzwerk` bei beiden Containern? |
| `password authentication failed` | Falsches Passwort | Passwort in `app.py` und `-e POSTGRES_PASSWORD` vergleichen |
| `database "app_db" does not exist` | DB-Name stimmt nicht | `-e POSTGRES_DB` und DATABASE_URL vergleichen |
| App startet, aber `/health` zeigt "error" | DB noch nicht bereit | Warte einige Sekunden, lade neu |

**Debugging-Befehle:**

```bash
# App-Logs prüfen
docker logs app

# DB-Logs prüfen
docker logs app-db

# Netzwerk prüfen – sind beide Container drin?
docker network inspect app-netzwerk

# Manuell testen: Kann die App die DB erreichen?
docker exec app python -c "import psycopg2; psycopg2.connect('postgresql://admin:geheim123@app-db:5432/app_db'); print('Verbindung OK!')"
```

</details>

<details markdown>
<summary>Zusammenfassung: Das Setup</summary>

```
app-netzwerk
├── app-db (PostgreSQL, Volume: app-db-daten)
│   ├── Port 5432 (intern, kein -p nötig für App-Zugriff)
│   └── Daten in Volume persistent
└── app (FastAPI)
    ├── Port 8000 → Host (-p 8000:8000 für Browser)
    └── Verbindet sich via "app-db:5432" (Container-Name!)
```

</details>

**Aufräumen:**

```bash
docker stop app app-db
docker rm app app-db
docker network rm app-netzwerk
docker volume rm app-db-daten
docker image rm fastapi-db-app
```

Lösche den Projektordner:

<details markdown>
<summary>Git Bash / macOS / Linux</summary>

```bash
cd ..
rm -rf fastapi-db
```

</details>

<details markdown>
<summary>PowerShell</summary>

```powershell
cd ..
Remove-Item -Recurse -Force fastapi-db
```

</details>

<details markdown>
<summary>CMD</summary>

```cmd
cd ..
rmdir /s /q fastapi-db
```

</details>

---

## Teil 7: Typische Fehler & Debugging

### Häufige Fehler bei Persistenz & Networking

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| `Connection refused` | Container nicht im gleichen Netzwerk, oder Ziel-Container läuft nicht | `docker network inspect` und `docker ps` prüfen |
| `could not translate host name` | DNS-Auflösung fehlgeschlagen | Container-Name und `--network` prüfen |
| Daten nach Neustart weg | Keine Volume gemountet | `-v` Flag beim `docker run` prüfen |
| `port is already allocated` | Port schon belegt | Anderen Host-Port wählen: `-p 5433:5432` |
| `Permission denied` auf Volume | Volume-Berechtigungen | Container-User hat keine Schreibrechte |
| `password authentication failed` | Passwort stimmt nicht überein | `-e POSTGRES_PASSWORD` und DATABASE_URL vergleichen |
| App verbindet mit `localhost` | Der localhost-Fehler! | `localhost` durch **Container-Namen** ersetzen |

### Wichtige Debugging-Befehle

| Befehl | Zweck |
|--------|-------|
| `docker logs <name>` | Container-Logs lesen (Fehlermeldungen!) |
| `docker exec -it <name> sh` | Shell im Container öffnen |
| `docker network inspect <name>` | Welche Container sind im Netzwerk? |
| `docker volume inspect <name>` | Wo liegt die Volume? |
| `docker inspect <name>` | Alle Details eines Containers |
| `docker ps` | Läuft der Container überhaupt? |

### Wissensfrage 8

Du startest eine App und eine Datenbank in Docker. Die App zeigt `Connection refused` beim Verbinden zur Datenbank. Nenne drei mögliche Ursachen und wie du sie diagnostizierst.

<details markdown>
<summary>Antwort anzeigen</summary>

**Drei mögliche Ursachen:**

1. **Container nicht im gleichen Netzwerk:**
   - Diagnose: `docker network inspect <netzwerk>` – sind beide Container aufgelistet?
   - Lösung: Beide mit `--network <name>` starten

2. **Datenbank-Container läuft nicht:**
   - Diagnose: `docker ps` – ist der DB-Container "Up"? `docker logs db` – gibt es Fehler?
   - Lösung: DB-Container starten oder Fehler in den Logs beheben

3. **App verwendet `localhost` statt Container-Name:**
   - Diagnose: DATABASE_URL prüfen – steht dort `localhost` oder der Container-Name?
   - Lösung: `localhost` durch den Container-Namen ersetzen (z.B. `db`)

**Bonus-Ursache:** Die Datenbank braucht nach dem Start noch einen Moment zur Initialisierung. `docker logs db` prüfen, ob `ready to accept connections` erscheint.

</details>

### Wissensfrage 9

Erkläre den Unterschied zwischen `-p 5432:5432` (Port-Mapping) und `--network mein-netzwerk` (Docker-Netzwerk). Wann brauchst du was?

<details markdown>
<summary>Antwort anzeigen</summary>

**Port-Mapping (`-p HOST:CONTAINER`):**
- Macht einen Container-Port von **außen** (Host/Browser) erreichbar
- Brauchst du, wenn du vom Browser oder von Host-Tools auf den Container zugreifen willst
- Beispiel: `-p 8000:8000` → `localhost:8000` im Browser

**Docker-Netzwerk (`--network`):**
- Ermöglicht Kommunikation **zwischen Containern** (DNS über Container-Name)
- Brauchst du, wenn Container miteinander sprechen sollen (z.B. App → DB)
- Beispiel: App erreicht DB über `db:5432`

**In der Praxis:**
- Die **Datenbank** braucht oft **kein** Port-Mapping – sie muss nur von der App erreichbar sein, nicht vom Browser. Port-Mapping für die DB ist nur nötig, wenn du vom Host direkt darauf zugreifen willst (z.B. mit einem DB-Tool).
- Die **App** braucht **beides**: Port-Mapping (Browser → App) und Netzwerk (App → DB).

</details>

---

## Bonus: Redis Cache hinzufügen

### Übung 7 (Bonus): Multi-Container-Setup mit Redis

> **Ziel:** Ein Setup mit drei Containern betreiben – App, PostgreSQL und Redis
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Du PostgreSQL und Redis in einem gemeinsamen Netzwerk betreibst und die Kommunikation funktioniert

**Schritt 1:** Erstelle Netzwerk und Volume:

```bash
docker network create multi-netzwerk
docker volume create multi-pg-daten
```

**Schritt 2:** Starte PostgreSQL und Redis:

```bash
docker run -d \
  --name multi-db \
  --network multi-netzwerk \
  -v multi-pg-daten:/var/lib/postgresql/data \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=geheim123 \
  -e POSTGRES_DB=multi_db \
  postgres:16
```

```bash
docker run -d \
  --name multi-redis \
  --network multi-netzwerk \
  redis:7
```

<details markdown>
<summary>PowerShell: Zeilenumbrüche</summary>

```powershell
docker run -d `
  --name multi-db `
  --network multi-netzwerk `
  -v multi-pg-daten:/var/lib/postgresql/data `
  -e POSTGRES_USER=admin `
  -e POSTGRES_PASSWORD=geheim123 `
  -e POSTGRES_DB=multi_db `
  postgres:16

docker run -d `
  --name multi-redis `
  --network multi-netzwerk `
  redis:7
```

</details>

> **Hinweis:** Redis braucht keine Volume für diese Übung – wir nutzen es als Cache, nicht als dauerhafte Datenbank.

**Schritt 3:** Teste die einzelnen Container:

```bash
# PostgreSQL erreichbar?
docker exec multi-db psql -U admin -d multi_db -c "SELECT 1 AS test;"

# Redis erreichbar?
docker exec multi-redis redis-cli ping
```

Du solltest `test: 1` und `PONG` sehen.

**Schritt 4:** Teste die Netzwerk-Verbindung zwischen den Containern:

```bash
# DNS-Auflösung testen (mit dediziertem Tool-Container):
docker run --rm --network multi-netzwerk busybox nslookup multi-db
docker run --rm --network multi-netzwerk busybox nslookup multi-redis
```

> **Warum nicht `getent` oder `ping`?** Nicht jedes Image hat diese Tools. `busybox` ist ein minimaler Tool-Container mit `nslookup` – das funktioniert zuverlässig.

<details markdown>
<summary>Lösung anzeigen</summary>

`nslookup multi-db` zeigt die IP-Adresse des PostgreSQL-Containers. Das beweist, dass Docker-DNS funktioniert und alle Container sich gegenseitig über ihre Namen erreichen können.

**Das ist das Muster, das du morgen mit Docker Compose automatisieren wirst:**

```
multi-netzwerk
├── multi-db    (PostgreSQL, Port 5432, Volume: multi-pg-daten)
├── multi-redis (Redis, Port 6379)
└── app         (deine Anwendung, verbindet sich mit beiden)
```

Statt alle `docker run`-Befehle einzeln einzutippen, definierst du morgen alles in einer `docker-compose.yml`-Datei – und startest alles mit einem einzigen Befehl: `docker compose up`.

</details>

**Schritt 5:** Prüfe das gesamte Setup:

```bash
# Alle laufenden Container
docker ps

# Netzwerk-Details (welche Container sind verbunden?)
docker network inspect multi-netzwerk
```

**Aufräumen:**

```bash
docker stop multi-db multi-redis
docker rm multi-db multi-redis
docker network rm multi-netzwerk
docker volume rm multi-pg-daten
```

---

## Abschluss-Checkliste

Überprüfe, ob du die Lernziele erreicht hast:

- [ ] Ich kann erklären, warum Container-Daten bei `docker rm` verloren gehen (Stateless-Problem)
- [ ] Ich kenne den Unterschied zwischen dem Writeable Layer und einer Docker Volume
- [ ] Ich kann eine **Docker Volume** erstellen und an einen Container mounten
- [ ] Ich kann einen **Bind Mount** einrichten und weiß, wann er sinnvoll ist
- [ ] Ich kann Volumes vs. Bind Mounts unterscheiden und den richtigen Einsatz wählen
- [ ] Ich kann ein **Docker-Netzwerk** erstellen und Container darin verbinden
- [ ] Ich weiß, warum `localhost` zwischen Containern **nicht** funktioniert
- [ ] Ich kann Container über ihren **Namen als Hostname** ansprechen
- [ ] Ich kann den Unterschied zwischen **Port-Mapping** und **Docker-Netzwerk** erklären
- [ ] Ich kann eine **PostgreSQL-Datenbank** im Container mit Volume und Netzwerk betreiben
- [ ] Ich kann eine **App mit einer Datenbank** im Container verbinden
- [ ] Ich kann typische Netzwerk- und Persistenz-Fehler diagnostizieren

> **Ausblick:** Morgen lernt ihr **Docker Compose** – damit definiert ihr Multi-Container-Setups in einer einzigen YAML-Datei. Statt viele `docker run`-Befehle manuell einzutippen, reicht dann ein `docker compose up`. Alles, was wir heute manuell mit `docker run` getippt haben, bildet morgen 1:1 die Compose-Definitionen: `networks:`, `volumes:`, `services:`, `environment:` – die Konzepte bleiben gleich, nur die Schreibweise wird kompakter. Stellt sicher, dass ihr Volumes, Bind Mounts und Networking sicher beherrscht – Docker Compose baut direkt darauf auf!
