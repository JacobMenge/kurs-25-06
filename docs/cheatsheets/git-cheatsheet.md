---
title: Git Cheat Sheet
tags:
  - Git
  - Cheat-Sheet
---

# Git Cheat Sheet

Kompakte Referenz fuer die wichtigsten Git-Befehle und Workflows.

---

## Grundlegende Befehle

| Befehl | Beschreibung |
|---|---|
| `git init` | Neues Repository initialisieren |
| `git clone <url>` | Repository klonen |
| `git status` | Status des Arbeitsverzeichnisses anzeigen |
| `git add <datei>` | Datei zur Staging Area hinzufuegen |
| `git add .` | Alle Aenderungen zum Staging hinzufuegen |
| `git commit -m "Nachricht"` | Commit mit Nachricht erstellen |
| `git push` | Commits zum Remote-Repository senden |
| `git pull` | Aenderungen vom Remote holen und mergen |

!!! info "Staging Area"
    Git verwendet eine Staging Area (Index) als Zwischenschritt. Aenderungen muessen zuerst mit `git add` gestaged werden, bevor sie committet werden koennen.

---

## Branches

```bash
# Alle Branches anzeigen
git branch              # Lokale Branches
git branch -a           # Alle (inkl. Remote)

# Neuen Branch erstellen
git branch feature-login

# Branch wechseln
git checkout feature-login
git switch feature-login        # Neuere Alternative

# Erstellen und sofort wechseln
git checkout -b feature-login
git switch -c feature-login     # Neuere Alternative

# Branch mergen (in aktuellen Branch)
git merge feature-login

# Branch loeschen
git branch -d feature-login     # Sicher (nur wenn gemerged)
git branch -D feature-login     # Erzwingen
```

---

## History & Vergleiche

=== "Log"

    ```bash
    # Commit-Verlauf anzeigen
    git log

    # Kompakte Ansicht
    git log --oneline

    # Mit Grafik
    git log --oneline --graph --all

    # Letzte N Commits
    git log -5

    # Commits eines bestimmten Autors
    git log --author="Max"

    # Commits fuer eine Datei
    git log -- pfad/zur/datei.py
    ```

=== "Diff"

    ```bash
    # Unstaged Aenderungen anzeigen
    git diff

    # Staged Aenderungen anzeigen
    git diff --staged

    # Vergleich zwischen Branches
    git diff main..feature-login

    # Vergleich einer bestimmten Datei
    git diff -- datei.py

    # Vergleich mit einem Commit
    git diff HEAD~3
    ```

=== "Show"

    ```bash
    # Details eines Commits anzeigen
    git show <commit-hash>

    # Letzten Commit anzeigen
    git show HEAD

    # Datei in einem bestimmten Commit anzeigen
    git show HEAD:pfad/zur/datei.py
    ```

---

## Rueckgaengig machen

=== "Unstaged Aenderungen"

    ```bash
    # Einzelne Datei zuruecksetzen
    git checkout -- datei.py
    git restore datei.py          # Neuere Alternative

    # Alle Aenderungen verwerfen
    git checkout -- .
    git restore .                 # Neuere Alternative
    ```

=== "Staging rueckgaengig"

    ```bash
    # Datei aus Staging entfernen
    git reset HEAD datei.py
    git restore --staged datei.py  # Neuere Alternative
    ```

=== "Commits rueckgaengig"

    ```bash
    # Letzten Commit rueckgaengig (Aenderungen bleiben staged)
    git reset --soft HEAD~1

    # Letzten Commit rueckgaengig (Aenderungen unstaged)
    git reset --mixed HEAD~1

    # Letzten Commit komplett verwerfen (VORSICHT!)
    git reset --hard HEAD~1

    # Commit rueckgaengig mit neuem Commit (sicher fuer Remote)
    git revert <commit-hash>
    ```

=== "Stash"

    ```bash
    # Aenderungen zwischenspeichern
    git stash

    # Mit Beschreibung
    git stash push -m "Login-Feature halbfertig"

    # Stash-Liste anzeigen
    git stash list

    # Letzten Stash wiederherstellen
    git stash pop

    # Bestimmten Stash anwenden (ohne zu loeschen)
    git stash apply stash@{1}

    # Stash loeschen
    git stash drop stash@{0}
    ```

---

## Remote

```bash
# Remote-Repositories anzeigen
git remote -v

# Remote hinzufuegen
git remote add origin https://github.com/user/repo.git

# Remote-URL aendern
git remote set-url origin <neue-url>

# Remote-Aenderungen holen (ohne Merge)
git fetch origin

# Remote-Branch auschecken
git checkout -b feature origin/feature

# Lokalen Branch zum Remote pushen
git push -u origin feature-login

# Remote-Branch loeschen
git push origin --delete feature-login
```

---

## .gitignore Beispiel

```gitignore
# Virtual Environments
venv/
.env

# Python
__pycache__/
*.pyc
*.pyo

# IDE
.vscode/
.idea/

# Betriebssystem
.DS_Store
Thumbs.db

# Node.js
node_modules/
dist/

# Umgebungsvariablen
.env
.env.local

# Logs
*.log
```

!!! warning "Bereits getrackte Dateien"
    `.gitignore` wirkt nur auf neue, ungetrackte Dateien. Bereits committete Dateien muessen zuerst entfernt werden:

    ```bash
    git rm --cached datei.txt
    git commit -m "Datei aus Tracking entfernen"
    ```

---

## Typischer Workflow

```bash
# 1. Aktuellen Stand holen
git pull origin main

# 2. Neuen Feature-Branch erstellen
git checkout -b feature/neue-funktion

# 3. Arbeiten und Aenderungen committen
git add .
git commit -m "Neue Funktion implementiert"

# 4. Zwischendurch main-Aenderungen einarbeiten
git checkout main
git pull origin main
git checkout feature/neue-funktion
git merge main

# 5. Feature-Branch pushen
git push -u origin feature/neue-funktion

# 6. Pull Request erstellen (auf GitHub/GitLab)

# 7. Nach dem Merge: Branch loeschen
git checkout main
git pull origin main
git branch -d feature/neue-funktion
```

!!! tip "Gute Commit-Nachrichten"
    Verwende aussagekraeftige Commit-Nachrichten im Imperativ:

    - "Login-Formular hinzufuegen" (statt "Login-Formular hinzugefuegt")
    - "Bug in Benutzerregistrierung beheben"
    - "Unit-Tests fuer API-Endpunkte ergaenzen"
