---
title: "FAQ – Häufige Fragen & Probleme"
---

# FAQ – Häufige Fragen & Probleme

Hier findest du Lösungen für die häufigsten Probleme und Fehlermeldungen im Kurs.

---

## Python

<details markdown>
<summary><strong>Python wird nicht gefunden ("python is not recognized")</strong></summary>

**Problem:** Beim Ausführen von `python` oder `pip` in der Kommandozeile erscheint die Meldung `'python' is not recognized as an internal or external command`.

**Lösung:**

1. Prüfe, ob Python installiert ist: Öffne den Windows-Installer erneut
2. Stelle sicher, dass **"Add Python to PATH"** bei der Installation aktiviert war
3. Nachträglich PATH setzen:
   - Windows-Suche → "Umgebungsvariablen"
   - System-PATH bearbeiten → Python-Pfad hinzufügen (z.B. `C:\Users\DEINNAME\AppData\Local\Programs\Python\Python312\`)
4. Terminal neu starten

```powershell
# Prüfe ob Python im PATH ist
python --version
```

</details>

<details markdown>
<summary><strong>Virtual Environment lässt sich nicht aktivieren</strong></summary>

**Problem:** `venv\Scripts\activate` schlägt fehl mit "execution of scripts is disabled".

**Lösung (PowerShell):**

```powershell
# Execution Policy temporär ändern
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Dann venv aktivieren
.\venv\Scripts\activate
```

**Lösung (Git Bash):**

```bash
source venv/Scripts/activate
```

</details>

<details markdown>
<summary><strong>ModuleNotFoundError bei import</strong></summary>

**Problem:** `ModuleNotFoundError: No module named 'xyz'`

**Lösung:**

1. Stelle sicher, dass dein Virtual Environment aktiv ist (Prompt zeigt `(venv)`)
2. Installiere das fehlende Paket:

```bash
pip install xyz
```

3. Falls du eine `requirements.txt` hast:

```bash
pip install -r requirements.txt
```

</details>

<details markdown>
<summary><strong>IndentationError oder TabError</strong></summary>

**Problem:** Python meldet `IndentationError: unexpected indent` oder `TabError: inconsistent use of tabs and spaces`.

**Lösung:**

- Python nutzt Einrückungen (Indentation) statt geschweifter Klammern
- Verwende immer **4 Leerzeichen** pro Ebene (nicht Tabs)
- In VS Code: `Strg+Shift+P` → "Convert Indentation to Spaces"
- VS Code Einstellung: `"editor.insertSpaces": true`

</details>

---

## Docker

<details markdown>
<summary><strong>Docker Desktop startet nicht (Windows)</strong></summary>

**Problem:** Docker Desktop zeigt Fehlermeldungen oder startet nicht.

**Lösung:**

1. Prüfe, ob **WSL 2** installiert ist:

```powershell
wsl --status
```

2. Falls nicht, installiere WSL:

```powershell
wsl --install
```

3. Starte den Computer neu
4. Docker Desktop erneut starten

</details>

<details markdown>
<summary><strong>Permission denied (Linux/Mac)</strong></summary>

**Problem:** `Got permission denied while trying to connect to the Docker daemon socket`

**Lösung:**

```bash
# Benutzer zur docker-Gruppe hinzufügen
sudo usermod -aG docker $USER

# Abmelden und wieder anmelden, dann testen:
docker ps
```

</details>

<details markdown>
<summary><strong>Port already in use</strong></summary>

**Problem:** `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Lösung:**

```bash
# Finde den Prozess, der den Port nutzt
# Windows:
netstat -ano | findstr :8000

# Linux/Mac:
lsof -i :8000

# Stoppe den Prozess oder nutze einen anderen Port:
docker run -p 8001:8000 mein-image
```

</details>

<details markdown>
<summary><strong>Image Build schlägt fehl</strong></summary>

**Problem:** `docker build` bricht mit Fehlern ab.

**Checkliste:**

1. Bist du im richtigen Verzeichnis (dort wo das `Dockerfile` liegt)?
2. Heißt die Datei genau `Dockerfile` (Groß-/Kleinschreibung)?
3. Prüfe die Fehlermeldung – oft fehlt eine Datei im Build-Kontext
4. `.dockerignore` prüfen – wird eine benötigte Datei ausgeschlossen?

</details>

---

## Git

<details markdown>
<summary><strong>Merge Conflicts lösen</strong></summary>

**Problem:** Git zeigt `CONFLICT (content): Merge conflict in datei.py`

**Lösung:**

1. Öffne die Datei – Git markiert Konflikte so:

```
<<<<<<< HEAD
Dein Code
=======
Code vom anderen Branch
>>>>>>> branch-name
```

2. Entscheide, welchen Code du behalten willst
3. Entferne die Markierungen (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Speichere und committe:

```bash
git add datei.py
git commit -m "Merge conflict resolved"
```

</details>

<details markdown>
<summary><strong>Push wird abgelehnt (rejected)</strong></summary>

**Problem:** `! [rejected] main -> main (non-fast-forward)`

**Lösung:**

```bash
# Erst pullen, dann pushen
git pull origin main
# Falls Konflikte: lösen, committen
git push origin main
```

</details>

<details markdown>
<summary><strong>"Detached HEAD" Zustand</strong></summary>

**Problem:** Git zeigt `HEAD detached at abc1234`.

**Lösung:**

```bash
# Zurück zum Branch wechseln
git checkout main

# Falls du Änderungen behalten willst:
git checkout -b mein-neuer-branch
```

</details>

---

## Linux / Bash

<details markdown>
<summary><strong>Permission denied bei Skript-Ausführung</strong></summary>

**Problem:** `bash: ./script.sh: Permission denied`

**Lösung:**

```bash
# Ausführungsrechte setzen
chmod +x script.sh

# Dann ausführen
./script.sh
```

</details>

<details markdown>
<summary><strong>Command not found</strong></summary>

**Problem:** Ein Befehl wird nicht gefunden, obwohl das Programm installiert sein sollte.

**Lösung:**

```bash
# Prüfe ob das Paket installiert ist
which befehl

# Falls nicht, installiere es (Ubuntu/Debian)
sudo apt update && sudo apt install paketname
```

</details>

---

## React / JavaScript

<details markdown>
<summary><strong>npm install schlägt fehl</strong></summary>

**Problem:** Fehler bei `npm install` (z.B. Berechtigungen, Cache, Versionen).

**Lösung:**

```bash
# Cache leeren
npm cache clean --force

# node_modules löschen und neu installieren
rm -rf node_modules package-lock.json
npm install
```

</details>

<details markdown>
<summary><strong>CORS-Fehler bei API-Aufrufen</strong></summary>

**Problem:** `Access to fetch at 'http://localhost:8000' has been blocked by CORS policy`

**Lösung (FastAPI Backend):**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Dev Server
    allow_methods=["*"],
    allow_headers=["*"],
)
```

</details>

<details markdown>
<summary><strong>useEffect Endlosschleife</strong></summary>

**Problem:** Die Komponente rendert sich unendlich oft, der Browser wird langsam.

**Ursache:** `useEffect` ohne oder mit falschem Dependency-Array.

**Lösung:**

```jsx
// FALSCH – läuft bei jedem Render
useEffect(() => {
  fetchData();
});

// RICHTIG – läuft nur einmal beim Mount
useEffect(() => {
  fetchData();
}, []);  // Leeres Array = nur beim Mount

// RICHTIG – läuft wenn sich 'id' ändert
useEffect(() => {
  fetchData(id);
}, [id]);
```

</details>

<details markdown>
<summary><strong>"Module not found" bei Import</strong></summary>

**Problem:** React zeigt `Module not found: Can't resolve './Component'`

**Lösung:**

1. Prüfe den Dateinamen (Groß-/Kleinschreibung zählt!)
2. Prüfe den Pfad – ist die Datei dort wo du sie importierst?
3. Bei installierten Paketen: `npm install paketname`
4. Dev-Server neustarten: `Strg+C` dann `npm run dev`

</details>

---

## Datenbanken

<details markdown>
<summary><strong>Datenbankverbindung fehlgeschlagen</strong></summary>

**Problem:** Die Verbindung zur Datenbank schlägt fehl.

**Checkliste:**

1. Läuft der Datenbankserver? (Docker Container, lokaler Service)
2. Stimmen die Zugangsdaten (Host, Port, User, Passwort)?
3. Stimmt der Datenbankname?
4. Firewall/Netzwerk-Einstellungen prüfen

```bash
# Docker: Container-Status prüfen
docker ps

# PostgreSQL: Verbindung testen
psql -h localhost -U admin -d meine_db
```

</details>

<details markdown>
<summary><strong>SQLite "database is locked"</strong></summary>

**Problem:** `sqlite3.OperationalError: database is locked`

**Lösung:**

- Stelle sicher, dass nur **eine Anwendung** gleichzeitig auf die Datei zugreift
- Schließe andere DB-Browser (z.B. DB Browser for SQLite)
- Verwende `timeout` bei der Verbindung:

```python
import sqlite3
conn = sqlite3.connect("meine_db.db", timeout=10)
```

</details>

---

## AWS

<details markdown>
<summary><strong>AWS CLI Credentials nicht konfiguriert</strong></summary>

**Problem:** `Unable to locate credentials`

**Lösung:**

```bash
# AWS CLI konfigurieren
aws configure

# Eingeben:
# - Access Key ID
# - Secret Access Key
# - Region: eu-central-1
# - Output: json
```

</details>

<details markdown>
<summary><strong>EC2 Instance nicht erreichbar (SSH timeout)</strong></summary>

**Problem:** SSH-Verbindung zur EC2-Instanz läuft in Timeout.

**Checkliste:**

1. Ist die Instanz gestartet? (AWS Console → EC2 → Instances)
2. Prüfe die **Security Group** – Port 22 (SSH) muss geöffnet sein
3. Richtige **Public IP** verwenden (ändert sich bei Neustart!)
4. Richtiger **Key-Datei-Pfad**:

```bash
ssh -i ~/.ssh/mein-key.pem ec2-user@PUBLIC_IP
```

</details>

---

## Allgemein

<details markdown>
<summary><strong>Empfohlene VS Code Extensions</strong></summary>

| Extension | Für |
|-----------|-----|
| Python | Python-Entwicklung |
| Pylance | Python IntelliSense |
| ES7+ React/Redux | React Snippets |
| Prettier | Code-Formatierung |
| Docker | Docker-Unterstützung |
| GitLens | Git-Visualisierung |
| Thunder Client | API-Testing |
| SQLite Viewer | SQLite-Datenbanken |

</details>

<details markdown>
<summary><strong>Tastenkürzel für VS Code</strong></summary>

| Kürzel | Aktion |
|--------|--------|
| ++ctrl+shift+p++ | Befehlspalette |
| ++ctrl+grave++ | Terminal öffnen |
| ++ctrl+b++ | Seitenleiste ein/aus |
| ++ctrl+d++ | Nächstes Vorkommen markieren |
| ++alt+up++ / ++alt+down++ | Zeile verschieben |
| ++ctrl+shift+k++ | Zeile löschen |
| ++ctrl+slash++ | Kommentar umschalten |

</details>
