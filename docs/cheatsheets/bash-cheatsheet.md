---
title: Bash & Linux Cheat Sheet
tags:
  - Bash
  - Linux
  - Cheat-Sheet
---

# Bash & Linux Cheat Sheet

Kompakte Referenz fuer die wichtigsten Befehle der Linux-Kommandozeile.

---

## Navigation

| Befehl | Beschreibung | Beispiel |
|---|---|---|
| `pwd` | Aktuelles Verzeichnis anzeigen | `pwd` |
| `ls` | Verzeichnisinhalt auflisten | `ls -la` |
| `cd` | Verzeichnis wechseln | `cd /home/user` |
| `cd ..` | Ein Verzeichnis nach oben | `cd ../..` |
| `cd ~` | Ins Home-Verzeichnis | `cd ~` |
| `cd -` | Zum vorherigen Verzeichnis | `cd -` |

```bash
# Nuetzliche ls-Optionen
ls -l       # Detaillierte Ansicht
ls -a       # Versteckte Dateien anzeigen
ls -la      # Kombiniert
ls -lh      # Mit lesbaren Dateigroessen
ls -lt      # Sortiert nach Aenderungsdatum
```

---

## Dateien & Verzeichnisse

=== "Erstellen"

    ```bash
    # Datei erstellen / Zeitstempel aktualisieren
    touch datei.txt

    # Verzeichnis erstellen
    mkdir neuer_ordner

    # Verschachtelte Verzeichnisse erstellen
    mkdir -p projekt/src/components

    # Datei mit Inhalt erstellen
    echo "Hallo Welt" > datei.txt
    ```

=== "Kopieren & Verschieben"

    ```bash
    # Datei kopieren
    cp quelle.txt ziel.txt

    # Verzeichnis rekursiv kopieren
    cp -r ordner/ kopie/

    # Datei verschieben / umbenennen
    mv alte_datei.txt neue_datei.txt

    # In anderes Verzeichnis verschieben
    mv datei.txt /pfad/zum/ziel/
    ```

=== "Loeschen"

    ```bash
    # Datei loeschen
    rm datei.txt

    # Verzeichnis loeschen (leer)
    rmdir leerer_ordner

    # Verzeichnis rekursiv loeschen
    rm -r ordner/

    # Ohne Nachfrage loeschen (VORSICHT!)
    rm -rf ordner/
    ```

=== "Anzeigen"

    ```bash
    # Gesamte Datei anzeigen
    cat datei.txt

    # Seitenweise anzeigen
    less datei.txt

    # Erste / letzte Zeilen
    head -n 20 datei.txt
    tail -n 20 datei.txt

    # Datei live verfolgen (z.B. Logs)
    tail -f /var/log/syslog

    # Zeilenanzahl / Wortanzahl
    wc -l datei.txt    # Zeilen
    wc -w datei.txt    # Woerter
    wc -c datei.txt    # Bytes
    ```

---

## Rechte & Besitz

```bash
# Rechte anzeigen
ls -la
# Ausgabe: -rwxr-xr-- 1 user gruppe 4096 Jan 15 10:30 datei.txt
# r=lesen(4), w=schreiben(2), x=ausfuehren(1)
# Besitzer | Gruppe | Andere
```

| Befehl | Beschreibung | Beispiel |
|---|---|---|
| `chmod` | Rechte aendern | `chmod 755 script.sh` |
| `chmod +x` | Ausfuehrbar machen | `chmod +x script.sh` |
| `chmod -R` | Rekursiv aendern | `chmod -R 644 ordner/` |
| `chown` | Besitzer aendern | `chown user:gruppe datei.txt` |
| `chown -R` | Besitzer rekursiv | `chown -R user:gruppe ordner/` |

!!! info "Haeufige Berechtigungen"
    | Wert | Bedeutung | Verwendung |
    |---|---|---|
    | `755` | rwxr-xr-x | Verzeichnisse, Skripte |
    | `644` | rw-r--r-- | Normale Dateien |
    | `600` | rw------- | Private Dateien (z.B. SSH-Keys) |
    | `777` | rwxrwxrwx | Vollzugriff (vermeiden!) |

---

## Suchen & Filtern

=== "find"

    ```bash
    # Datei nach Name suchen
    find /pfad -name "*.py"

    # Gross-/Kleinschreibung ignorieren
    find . -iname "readme*"

    # Nach Typ suchen (f=Datei, d=Verzeichnis)
    find . -type f -name "*.log"
    find . -type d -name "node_modules"

    # Nach Groesse suchen
    find . -size +100M    # Groesser als 100 MB
    find . -size -1k      # Kleiner als 1 KB

    # Nach Aenderungsdatum
    find . -mtime -7      # In letzten 7 Tagen geaendert

    # Gefundene Dateien loeschen
    find . -name "*.tmp" -delete
    ```

=== "grep"

    ```bash
    # In Datei suchen
    grep "suchbegriff" datei.txt

    # Rekursiv in Verzeichnis suchen
    grep -r "TODO" ./src/

    # Gross-/Kleinschreibung ignorieren
    grep -i "fehler" log.txt

    # Zeilennummern anzeigen
    grep -n "error" log.txt

    # Nur Dateinamen anzeigen
    grep -rl "import flask" ./

    # Regulaere Ausdruecke
    grep -E "^[0-9]{3}-" telefon.txt

    # Invertiert (Zeilen OHNE Treffer)
    grep -v "debug" log.txt

    # Kontext anzeigen (3 Zeilen davor/danach)
    grep -C 3 "error" log.txt
    ```

---

## Pipes & Redirects

```bash
# Pipe: Ausgabe eines Befehls als Eingabe fuer den naechsten
ls -la | grep ".py"
cat log.txt | sort | uniq -c | sort -rn | head -10

# Redirect: Ausgabe in Datei umleiten
echo "Hallo" > datei.txt        # Ueberschreiben
echo "Welt" >> datei.txt        # Anhaengen

# Fehlerausgabe umleiten
command 2> fehler.log            # Nur Fehler
command > ausgabe.log 2>&1       # Beides zusammen
command &> alles.log             # Kurzform

# Eingabe aus Datei
sort < unsortiert.txt

# /dev/null (Ausgabe verwerfen)
command > /dev/null 2>&1
```

!!! tip "Nuetzliche Pipe-Kombinationen"
    ```bash
    # Haeufigstes Wort finden
    cat text.txt | tr ' ' '\n' | sort | uniq -c | sort -rn | head -5

    # Doppelte Zeilen entfernen
    sort datei.txt | uniq

    # Prozess nach Name suchen
    ps aux | grep python

    # Dateigroessen sortiert anzeigen
    du -sh * | sort -rh | head -10
    ```

---

## Prozesse

| Befehl | Beschreibung |
|---|---|
| `ps aux` | Alle laufenden Prozesse anzeigen |
| `ps aux \| grep python` | Nach bestimmtem Prozess suchen |
| `top` | Prozesse live anzeigen |
| `htop` | Bessere Version von top (falls installiert) |
| `kill <PID>` | Prozess beenden (SIGTERM) |
| `kill -9 <PID>` | Prozess erzwingen (SIGKILL) |
| `killall python` | Alle Prozesse mit Namen beenden |
| `bg` | Gestoppten Prozess in Hintergrund |
| `fg` | Prozess in Vordergrund bringen |
| `jobs` | Hintergrundprozesse anzeigen |
| `nohup command &` | Prozess auch nach Logout weiterlaufen lassen |
| `Ctrl + C` | Laufenden Prozess abbrechen |
| `Ctrl + Z` | Laufenden Prozess stoppen (pausieren) |

---

## Netzwerk

```bash
# Erreichbarkeit testen
ping google.com
ping -c 4 google.com     # Nur 4 Pakete senden

# HTTP-Anfragen mit curl
curl https://api.example.com/daten
curl -X POST -H "Content-Type: application/json" \
     -d '{"name": "Max"}' https://api.example.com/users

# Datei herunterladen
curl -O https://example.com/datei.zip
wget https://example.com/datei.zip

# SSH-Verbindung
ssh user@server.de
ssh -p 2222 user@server.de      # Anderer Port

# Dateien per SCP kopieren
scp datei.txt user@server.de:/pfad/
scp -r ordner/ user@server.de:/pfad/

# Offene Ports anzeigen
ss -tuln
netstat -tuln
```

---

## Paketmanagement (apt)

| Befehl | Beschreibung |
|---|---|
| `sudo apt update` | Paketlisten aktualisieren |
| `sudo apt upgrade` | Alle Pakete aktualisieren |
| `sudo apt install <paket>` | Paket installieren |
| `sudo apt remove <paket>` | Paket deinstallieren |
| `sudo apt autoremove` | Nicht mehr benoetigte Pakete entfernen |
| `apt search <suchbegriff>` | Nach Paketen suchen |
| `apt list --installed` | Installierte Pakete anzeigen |
| `dpkg -l` | Alle installierten Pakete (detailliert) |

!!! warning "sudo"
    `sudo` fuehrt einen Befehl mit Root-Rechten aus. Verwende es nur, wenn es noetig ist, und pruefe den Befehl vorher sorgfaeltig.
