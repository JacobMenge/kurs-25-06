---
title: "26.4 – React-App auf AWS deployen"
tags:
  - React
  - Context-API
  - AWS
  - Deployment
---
# Übung 26.4: React-App auf AWS deployen

## Lernziele

Nach dieser Übung kannst du:
- Verstehen, warum Cloud-Hosting für moderne Webanwendungen wichtig ist
- Die verschiedenen AWS-Deployment-Optionen kennen und vergleichen
- Eine React-Anwendung für die Produktion bauen
- Deine App auf einer EC2-Instanz deployen (Hauptweg)
- Alternative Deployment-Wege wie S3 + CloudFront kennenlernen

---

## Teil 1: Einführung in AWS und Cloud-Hosting

### Warum Cloud-Hosting?

Wenn du eine Webanwendung entwickelt hast, stellt sich die Frage: Wie mache ich sie für andere zugänglich? Hier kommen Cloud-Provider ins Spiel.

**Vorteile von Cloud-Hosting:**

| Aspekt | Eigener Server | Cloud-Hosting |
|--------|----------------|---------------|
| **Kosten** | Hohe Anfangsinvestition | Pay-as-you-go |
| **Skalierung** | Manuell, zeitaufwändig | Automatisch, in Minuten |
| **Wartung** | Du bist verantwortlich | Provider übernimmt Hardware |
| **Verfügbarkeit** | Abhängig von deiner Infrastruktur | 99.9%+ SLA garantiert |
| **Sicherheit** | Selbst implementieren | Enterprise-grade Standards |

### Warum AWS?

Amazon Web Services (AWS) ist der Marktführer im Cloud-Computing mit einem Marktanteil von ca. 30% (je nach Studie/Quartal). Die Vorteile:

1. **Größtes Ökosystem**: Über 200 Services für jeden Anwendungsfall
2. **Globale Präsenz**: Rechenzentren weltweit für niedrige Latenz
3. **Free Tier**: 12 Monate kostenlose Nutzung vieler Services
4. **Industrie-Standard**: Die meisten Unternehmen nutzen AWS
5. **Exzellente Dokumentation**: Umfangreiche Tutorials und Support

### AWS-Services für Web-Deployment im Überblick

Es gibt mehrere Wege, eine React-App auf AWS zu hosten. Hier ein Vergleich:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS Deployment-Optionen                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐    │
│  │     EC2         │   │   S3 + CDN      │   │    Amplify      │    │
│  │  (Server)       │   │   (Statisch)    │   │  (Full-Stack)   │    │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘    │
│           │                     │                     │             │
│           ▼                     ▼                     ▼             │
│  • Volle Kontrolle      • Am günstigsten       • Am einfachsten     │
│  • Beliebige Software   • Extrem schnell       • Git-Integration    │
│  • Lernintensiv         • Nur statisch         • Wenig Kontrolle    │
│                                                                     │
│  Schwierigkeit:         Schwierigkeit:         Schwierigkeit:       │
│  ████████░░ (8/10)      ██████░░░░ (6/10)      ████░░░░░░ (4/10)    │
│                                                                     │
│  Kosten (Free Tier):    Kosten:                Kosten:              │
│  750h/Monat gratis      ~$0.50/Monat           Gratis bis 1GB       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Detaillierter Vergleich der Deployment-Optionen

#### 1. EC2 (Elastic Compute Cloud) - **Unser Hauptweg**

EC2 gibt dir eine virtuelle Maschine (VM) in der Cloud. Du hast volle Kontrolle und kannst alles installieren, was du willst.

**Wann EC2 wählen:**
- Du willst lernen, wie Server funktionieren
- Du brauchst Backend-Logik (Node.js, Python, etc.)
- Du willst volle Kontrolle über die Umgebung
- Du planst, die App später zu erweitern

**Vorteile:**
- Volle Kontrolle über das System
- Kann jede Art von Anwendung hosten
- Gute Lernmöglichkeit für DevOps
- Free Tier: 750 Stunden t2.micro oder t3.micro pro Monat (gilt für neue AWS-Accounts, 12 Monate; in der Sandbox ggf. andere Konditionen)

**Nachteile:**
- Mehr Konfiguration erforderlich
- Du bist für Updates/Sicherheit verantwortlich
- Overkill für rein statische Seiten

#### 2. S3 + CloudFront (Static Website Hosting)

S3 ist eigentlich ein Speicherdienst, kann aber auch statische Websites hosten. Mit CloudFront (CDN) wird die Seite weltweit schnell ausgeliefert.

**Wann S3 wählen:**
- Reine Frontend-App ohne Backend
- Maximale Performance gewünscht
- Kosten minimieren
- Einfaches Setup

**Vorteile:**
- Extrem günstig (Cents pro Monat)
- Automatische Skalierung
- Globale CDN-Distribution
- Kein Server-Management

**Nachteile:**
- Nur statische Dateien
- Keine Server-Side Logik möglich
- HTTPS erfordert CloudFront

#### 3. AWS Amplify

Amplify ist eine "Platform as a Service" (PaaS) speziell für Frontend-Apps.

**Wann Amplify wählen:**
- Schnellstes Setup gewünscht
- Git-basierter Workflow
- Automatische CI/CD

**Vorteile:**
- Einfachstes Setup
- Automatische Builds bei Git Push
- Integrierte Backend-Services

**Nachteile:**
- Weniger Kontrolle
- Vendor Lock-in
- Kann teurer werden bei viel Traffic

---

## Teil 2: Vorbereitung

### 2.1 AWS Sandbox aufrufen

Für diese Übung nutzen wir die bereitgestellten AWS Sandboxes:

1. Gehe zu **https://sandboxes.techstarter.de/**
2. Melde dich mit deinen Zugangsdaten an
3. Starte eine neue AWS Sandbox oder nutze eine bestehende

> **Hinweis:** Die Sandbox ist bereits vorkonfiguriert und du hast alle nötigen Berechtigungen. Du brauchst keine eigene Kreditkarte oder AWS-Account.

### 2.2 React-App für Produktion bauen

Bevor wir deployen, müssen wir die App bauen:

```bash
# Im Projektverzeichnis
cd 26.4-recap-projekt-v2-aws-deployment

# Dependencies installieren (falls noch nicht geschehen)
npm install

# Produktions-Build erstellen
npm run build
```

**Was passiert beim Build?**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vite Build-Prozess                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   src/                          dist/                           │
│   ├── App.jsx      ────────►    ├── index.html                  │
│   ├── App.css                   └── assets/                     │
│   ├── main.jsx                      ├── index-a1b2c3.js         │
│   └── components/                   └── index-d4e5f6.css        │
│       └── *.jsx                                                 │
│                                                                 │
│   Optimierungen:                                                │
│   • JavaScript wird minifiziert (Leerzeichen/Kommentare weg)    │
│   • CSS wird minifiziert                                        │
│   • Dateien werden gehasht (für Cache-Busting)                  │
│   • Tree-Shaking entfernt ungenutzten Code                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Nach dem Build findest du im `dist/` Ordner:
- `index.html` - Die Einstiegsseite
- `assets/` - JavaScript und CSS Dateien (minifiziert und gehasht)

### 2.3 Build lokal testen

```bash
# Preview-Server starten
npm run preview
```

Öffne http://localhost:4173 und teste, ob alles funktioniert.

---

## Teil 3: Deployment auf EC2 (Hauptweg)

Dies ist der ausführlichste Weg, aber du lernst dabei am meisten über Server-Administration.

### 3.1 EC2-Instanz erstellen

**Schritt 1: AWS Console öffnen**
1. Öffne die AWS Console über deine Sandbox
2. Suche nach "EC2" und öffne den Service

**Schritt 2: Instanz starten**
1. Klicke auf "Instanz starten" (Launch instance)
2. Konfiguriere die Instanz:

```
┌─────────────────────────────────────────────────────────────────┐
│                    EC2 Instanz-Konfiguration                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Name:           mini-hub-server                                │
│                                                                 │
│  AMI:            Amazon Linux 2023  ← EMPFOHLEN für diese Übung │
│                  (Alternative: Ubuntu 22.04 LTS)                │
│                                                                 │
│  Instanztyp:     t2.micro oder t3.micro (Free Tier)             │
│                  • 1 vCPU                                       │
│                  • 1 GB RAM                                     │
│                  • Ausreichend für kleine Apps                  │
│                                                                 │
│  Key Pair:       Neues Key Pair erstellen                       │
│                  Name: mini-hub-key                             │
│                  Format: .pem (für Mac/Linux/Windows)           │
│                  ⚠️  SPEICHERE DEN KEY SICHER!                  │
│                                                                 │
│  Netzwerk:       ✓ SSH (Port 22) - Für Zugriff                  │
│                  ✓ HTTP (Port 80) - Für Webseite                │
│                  ✓ HTTPS (Port 443) - Optional                  │
│                                                                 │
│  Speicher:       8 GB gp3 (Standard ist OK)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Schritt 3: Security Group konfigurieren**

Die Security Group ist wie eine Firewall. Füge diese Regeln hinzu:

| Typ | Port | Quelle | Beschreibung |
|-----|------|--------|--------------|
| SSH | 22 | Deine IP | Für Server-Zugriff |
| HTTP | 80 | 0.0.0.0/0 | Für Webseiten-Zugriff |
| HTTPS | 443 | 0.0.0.0/0 | Nur nötig bei HTTPS mit Zertifikat |

> **Hinweis zu Port 443:** HTTPS funktioniert auf EC2 nicht "automatisch" nur weil der Port offen ist. Du brauchst zusätzlich ein SSL-Zertifikat (z.B. via Let's Encrypt). In dieser Übung nutzen wir nur HTTP.

> ⚠️ **Wichtig:** Wenn SSH plötzlich nicht mehr funktioniert ("Connection timed out"), prüfe zuerst die Security Group! Hat sich deine IP geändert (z.B. durch WLAN-Wechsel, VPN, Hotspot)? Dann musst du die SSH-Regel auf deine neue IP anpassen.

**Schritt 4: Instanz starten**
1. Klicke auf "Instanz starten"
2. Warte bis der Status "Running" ist
3. Notiere dir die **Public IPv4 address** (z.B. `54.123.45.67`)

> ⚠️ **Wichtig:** Nutze die **Public IPv4** oder **Public DNS**, nicht die Private IP! Die Private IP ist nur innerhalb von AWS erreichbar.

### 3.2 Mit der Instanz verbinden

#### Für Mac/Linux:

```bash
# Key-Berechtigungen setzen (nur einmal nötig)
chmod 400 ~/Downloads/mini-hub-key.pem

# Verbinden (ersetze IP mit deiner Public IPv4)
ssh -i ~/Downloads/mini-hub-key.pem ec2-user@54.123.45.67
```

#### Für Windows (PowerShell):

```powershell
# Verbinden (ersetze IP mit deiner Public IPv4)
ssh -i "$env:USERPROFILE\Downloads\mini-hub-key.pem" ec2-user@54.123.45.67
```

> **Hinweis zum Benutzernamen:**
> - Amazon Linux 2023: `ec2-user`
> - Ubuntu: `ubuntu`

### 3.3 Server einrichten

Nach der Verbindung bist du auf dem Server. Die Befehle unterscheiden sich je nach Betriebssystem:

#### Für Amazon Linux 2023 (empfohlen):

```bash
# System aktualisieren (AL2023 nutzt dnf, nicht yum!)
sudo dnf update -y

# Nginx Webserver installieren
sudo dnf install -y nginx

# Nginx starten und bei Boot aktivieren
sudo systemctl start nginx
sudo systemctl enable nginx

# Prüfen ob Nginx läuft
sudo systemctl status nginx
```

#### Für Ubuntu 22.04:

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Nginx Webserver installieren
sudo apt install -y nginx

# Nginx starten und bei Boot aktivieren
sudo systemctl start nginx
sudo systemctl enable nginx

# Prüfen ob Nginx läuft
sudo systemctl status nginx
```

**Test:** Öffne http://DEINE-PUBLIC-IP im Browser. Du solltest die Nginx-Willkommensseite sehen.

### 3.4 App auf den Server hochladen

Es gibt mehrere Wege, deine Dateien hochzuladen. Hier der einfachste mit `scp`:

**Von deinem lokalen Computer (nicht vom Server!):**

Erst prüfen ob der dist-Ordner existiert:

```bash
# Mac/Linux:
ls -la dist

# Windows (PowerShell):
dir .\dist
# oder: Get-ChildItem .\dist -Force
```

Wenn "No such file or directory" bzw. "Cannot find path": `npm run build` wurde nicht ausgeführt!

#### Für Mac/Linux:

```bash
# Amazon Linux 2023:
scp -i ~/Downloads/mini-hub-key.pem -r dist ec2-user@54.123.45.67:/tmp/

# Ubuntu:
scp -i ~/Downloads/mini-hub-key.pem -r dist ubuntu@54.123.45.67:/tmp/
```

#### Für Windows (PowerShell):

```powershell
# Erst prüfen ob SSH/SCP verfügbar ist:
ssh -V

# Falls "command not found": OpenSSH Client installieren
# → Windows-Einstellungen → Apps → Optionale Features → OpenSSH Client
```

```powershell
# Amazon Linux 2023:
scp -i "$env:USERPROFILE\Downloads\mini-hub-key.pem" -r dist ec2-user@54.123.45.67:/tmp/

# Ubuntu:
scp -i "$env:USERPROFILE\Downloads\mini-hub-key.pem" -r dist ubuntu@54.123.45.67:/tmp/
```

> **Hinweis:** Passe den Pfad zur `.pem`-Datei an, falls du sie woanders gespeichert hast (z.B. Desktop oder Dokumente).

**Dann auf dem Server:**

```bash
# Dateien an den richtigen Ort verschieben
sudo cp -r /tmp/dist/* /usr/share/nginx/html/

# Alte Standard-Seiten entfernen (falls vorhanden)
sudo rm -f /usr/share/nginx/html/index.nginx-debian.html
sudo rm -f /usr/share/nginx/html/50x.html

# Berechtigungen setzen (Nginx braucht nur Leserechte)
sudo chmod -R a+rX /usr/share/nginx/html/
```

### 3.5 Nginx für React konfigurieren

React verwendet Client-Side Routing. Nginx muss so konfiguriert werden, dass alle Anfragen an `index.html` gehen.

**Die Konfigurationsdatei liegt je nach OS an unterschiedlichen Orten:**

```bash
# Optional: Prüfen welche Config-Dateien Nginx tatsächlich lädt
# (hilft wenn "ich hab's editiert aber es ändert sich nichts")
sudo nginx -T | head -50
```

#### Für Amazon Linux 2023:

```bash
sudo nano /etc/nginx/conf.d/default.conf
```

#### Für Ubuntu 22.04:

```bash
sudo nano /etc/nginx/sites-available/default
```

> **Hinweis zum Webroot:** Wir nutzen `/usr/share/nginx/html` als Webroot (gängiger Default bei Amazon Linux). Ubuntu kennt auch `/var/www/html` - entscheidend ist, dass `root` in der Config und der Copy-Pfad übereinstimmen.

**Ersetze den Inhalt mit dieser Konfiguration:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip Kompression für bessere Performance
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # index.html nie cachen (damit Updates sofort sichtbar sind)
    # Wichtig: index.html referenziert die gehashten JS/CSS-Dateien.
    # Wenn index.html gecacht wird, sehen Nutzer nach Deploy noch alte Versionen!
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Alle Anfragen an index.html weiterleiten (für React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache-Header für statische Assets (JS, CSS, Bilder)
    # Vite hasht diese Dateien, daher ist langer Cache sicher
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Speichern mit `Ctrl+O`, Enter, dann `Ctrl+X`.

```bash
# Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

### 3.6 Testen

Öffne http://DEINE-PUBLIC-IP im Browser. Deine Mini-Hub App sollte jetzt laufen!

```
┌─────────────────────────────────────────────────────────────────┐
│                    Erfolg! 🎉                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Deine React-App läuft jetzt auf:                               │
│                                                                 │
│  http://54.123.45.67  (deine Public IP)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Teste auch:**
- Seite neu laden (F5) - funktioniert?
- Items hinzufügen, bearbeiten, löschen
- Suche und Filter

---

## Teil 4: Alternative - S3 + CloudFront (Statisches Hosting)

Dieser Weg ist einfacher und günstiger für rein statische Seiten.

### 4.1 S3-Bucket erstellen

1. Gehe zur S3-Console in deiner Sandbox
2. Klicke auf "Bucket erstellen"

```
┌─────────────────────────────────────────────────────────────────┐
│                    S3 Bucket-Konfiguration                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bucket-Name:    mini-hub-website-DEIN-NAME                     │
│                  (muss global eindeutig sein!)                  │
│                                                                 │
│  Region:         eu-central-1 (Frankfurt)                       │
│                  (wähle eine nahe Region)                       │
│                                                                 │
│  Öffentlicher Zugriff: ✓ ACLs deaktiviert                       │
│                        ✓ Öffentlichen Zugriff blockieren        │
│                           (wir nutzen CloudFront)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Dateien hochladen

1. Öffne den erstellten Bucket
2. Klicke auf "Hochladen"
3. Ziehe den gesamten Inhalt des `dist/` Ordners hinein
4. Klicke auf "Hochladen"

### 4.3 CloudFront Distribution erstellen

CloudFront ist das CDN von AWS und ermöglicht auch HTTPS.

1. Gehe zu CloudFront in deiner AWS Console
2. Klicke auf "Distribution erstellen"

```
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront-Konfiguration                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Origin:                                                        │
│  • Origin Domain: mini-hub-website-XXX.s3.eu-central-1...       │
│    (wähle deinen S3-Bucket aus der Liste)                       │
│  • Origin Access: Origin Access Control (OAC)                   │
│    → "Create control setting" → Defaults OK                     │
│                                                                 │
│  Default Cache Behavior:                                        │
│  • Viewer Protocol Policy: Redirect HTTP to HTTPS               │
│  • Allowed HTTP Methods: GET, HEAD                              │
│                                                                 │
│  Settings:                                                      │
│  • Default Root Object: index.html                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 S3 Bucket Policy aktualisieren

Nach dem Erstellen der Distribution zeigt AWS dir eine Bucket Policy an:

1. Kopiere die angezeigte Bucket Policy
2. Gehe zu S3 → Dein Bucket → Berechtigungen → Bucket Policy
3. Füge die Policy ein

> ⚠️ **Häufiger Fehler (403 Forbidden):** Die Bucket Policy muss exakt zu deiner CloudFront Distribution passen! Achte darauf, dass:
> - Die Distribution-ID in der Policy stimmt
> - Der Bucket-Name korrekt ist
> - Du die Policy wirklich gespeichert hast (blauer "Speichern"-Button)

### 4.5 Error Pages für React Router

React Router braucht spezielle Fehlerseiten-Konfiguration:

In CloudFront unter "Error Pages":

1. Klicke auf "Create custom error response"
2. Konfiguriere für **Error Code 403**:
   - Customize Error Response: Yes
   - Response Page Path: `/index.html`
   - HTTP Response Code: `200`
   - Error Caching Minimum TTL: `0` (für Testzwecke)

3. Wiederhole für **Error Code 404** mit denselben Einstellungen

> **Hinweis:** Diese Konfiguration leitet alle 403/404-Fehler auf die React-App um. Das ist ein gängiger SPA-Workaround für Lern- und Demo-Setups. Beachte: "Echte" 404-Fehler kommen dann auch als 200 zurück (relevant für SEO/Monitoring). Für feinere Kontrolle nutzt man später Edge-Logik (Lambda@Edge oder CloudFront Functions).

### 4.6 Testen

Nach etwa 5-15 Minuten ist die Distribution bereit (Status: "Deployed").

Deine App ist erreichbar unter der CloudFront-Domain:
`https://d1234567890.cloudfront.net`

> **Bei Änderungen:** Wenn du Dateien in S3 aktualisierst und die alte Version noch angezeigt wird, erstelle eine **Invalidation** in CloudFront:
> - CloudFront → Deine Distribution → Invalidations → Create Invalidation
> - Object paths: `/*`

---

## Teil 5: Troubleshooting

### Häufige Probleme und Lösungen

#### Problem: "Permission denied" beim SSH

```bash
# Lösung: Key-Berechtigungen korrigieren (Mac/Linux)
chmod 400 ~/Downloads/mini-hub-key.pem
```

#### Problem: "Connection timed out" beim SSH

- **Häufigste Ursache:** Deine IP hat sich geändert (WLAN-Wechsel, VPN, etc.)
- **Lösung:** Security Group → Inbound Rules → SSH-Regel auf neue IP anpassen
- Prüfe auch: Nutzt du die **Public IP** (nicht Private IP)?

#### Problem: Seite zeigt nur Nginx-Default

```bash
# Prüfen ob deine Dateien da sind
ls -la /usr/share/nginx/html/

# Nginx-Logs prüfen
sudo tail -f /var/log/nginx/error.log
```

#### Problem: React Router funktioniert nicht (404 auf Unterseiten)

Stelle sicher, dass die Nginx-Konfiguration diese Zeile enthält:
```nginx
try_files $uri $uri/ /index.html;
```

#### Problem: Änderungen werden nicht angezeigt

- **EC2:** Browser-Cache leeren (Ctrl+Shift+R) oder Inkognito-Modus
- **CloudFront:** Invalidation erstellen (`/*`)

#### Problem: "Forbidden" (403) bei S3/CloudFront

- **Bucket Policy fehlt oder ist falsch** - Die Policy muss exakt zur Distribution/OAC passen (Distribution-ID, Bucket-ARN)
- **CloudFront OAC nicht korrekt** - Beim Erstellen "Origin Access Control" gewählt?
- **Policy nicht gespeichert** - Hast du nach dem Einfügen auf "Speichern" geklickt?
- **Falscher Bucket** - Stimmt der Bucket-Name in der Policy mit deinem Bucket überein?

### Nützliche Befehle

```bash
# Nginx Logs anzeigen
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Nginx Status prüfen
sudo systemctl status nginx

# Nginx neu starten
sudo systemctl restart nginx

# Nginx Config neu laden (ohne Neustart)
sudo systemctl reload nginx

# Nginx Konfiguration testen
sudo nginx -t

# Disk Space prüfen
df -h

# Speicherverbrauch prüfen
free -m

# Welche Prozesse laufen?
ps aux | grep nginx
```

---

## Zusammenfassung

### Was wir gelernt haben:

1. **Cloud-Hosting Grundlagen**: Warum AWS und was die Optionen sind
2. **EC2 Deployment**: Server einrichten, Nginx konfigurieren, App deployen
3. **S3 + CloudFront**: Statisches Hosting als Alternative
4. **Troubleshooting**: Häufige Probleme und deren Lösung

### Vergleich unserer Deployment-Wege:

| Aspekt | EC2 + Nginx | S3 + CloudFront |
|--------|-------------|-----------------|
| Schwierigkeit | Mittel-Hoch | Mittel |
| Kontrolle | Voll | Begrenzt |
| Kosten | Free Tier | Sehr günstig |
| Performance | Gut | Exzellent (CDN) |
| Skalierung | Manuell | Automatisch |
| Backend möglich | Ja | Nein |

### Empfehlung:

- **Lernzwecke/Volle Kontrolle**: EC2
- **Produktion (nur Frontend)**: S3 + CloudFront
- **Schnellstes Setup**: AWS Amplify

---

## Checkliste

- [ ] Sandbox unter https://sandboxes.techstarter.de/ geöffnet
- [ ] React-App gebaut (`npm run build`)
- [ ] Build lokal getestet (`npm run preview`)
- [ ] EC2-Instanz erstellt (Amazon Linux 2023 oder Ubuntu)
- [ ] SSH-Verbindung hergestellt
- [ ] Nginx installiert (`dnf` für AL2023, `apt` für Ubuntu)
- [ ] Nginx konfiguriert (richtiger Pfad je nach OS)
- [ ] App-Dateien hochgeladen
- [ ] App im Browser getestet
- [ ] (Optional) S3 + CloudFront ausprobiert
