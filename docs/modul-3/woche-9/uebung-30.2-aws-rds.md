---
title: "30.2: AWS RDS: Managed PostgreSQL in der Cloud"
tags:
  - AWS
  - RDS
  - PostgreSQL
  - FastAPI
---
# AWS RDS: Managed PostgreSQL in der Cloud

## Übersicht

In dieser Übung bringst du die Datenbank deiner CloudNotes-App in die AWS Cloud:

- **Managed Database verstehen** - Warum AWS die Datenbank für dich betreibt
- **Security Group erstellen** - Netzwerkzugriff auf die Datenbank absichern
- **RDS PostgreSQL erstellen** - Eine Cloud-Datenbank Schritt für Schritt einrichten
- **Verbindung testen** - Per psql oder pgAdmin auf die Cloud-DB zugreifen
- **CloudNotes anbinden** - Deine FastAPI-App mit der Cloud-Datenbank verbinden
- **Alembic Migrations** - Schema-Änderungen auf RDS anwenden

Gestern hast du die CloudNotes-App mit SQLite lokal getestet. Heute wechselst du auf eine **echte PostgreSQL-Datenbank in der Cloud**. Das Erstaunliche: Am Code ändert sich fast nichts!

### Warum RDS heute?

> **Architektur-Kontext:** Gestern hast du das Docker Image in ECR gepusht. Bevor wir das Backend am Mittwoch auf EC2 deployen, brauchen wir zuerst die **Datenbank in der Cloud**. RDS muss laufen, damit der EC2-Container morgen eine `DATABASE_URL` hat, gegen die er arbeiten kann.
>
> ```
> ✅ ECR ← Gestern (Mo)
> 🗄️ RDS ← Heute (Di)
> 🖥️ EC2 ← Morgen (Mi)
> 📦 S3  ← Donnerstag
> ```

---

## Inhaltsverzeichnis

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | PostgreSQL: Lokal, Docker, Cloud | 10 min (lesen) |
| **Teil 1** | Warum Managed Database? | 15 min |
| **Teil 2** | Security Group für RDS erstellen | 20 min |
| **Teil 3** | RDS PostgreSQL Instanz erstellen | 30 min |
| **Teil 4** | Verbindung testen | 20 min |
| **Teil 5** | CloudNotes mit RDS verbinden | 25 min |
| **Teil 6** | Alembic Migrations auf RDS | 20 min |
| **Bonus** | RDS Snapshots & Monitoring | 15 min |
| | **Gesamt** | **ca. 2,5–3 Stunden** |

### Minimalpfad (wenn du wenig Zeit hast)

**In 60–90 Minuten die wichtigsten Schritte:**

1. **Teil 2** - Security Group erstellen - *Netzwerk absichern*
2. **Teil 3** - RDS Instanz erstellen - *Kernübung*
3. **Teil 5** - CloudNotes anbinden - *App verbinden*

---

## Voraussetzungen & Setup

**Bevor du startest:**

1. **Übung 30.1 abgeschlossen:** AWS Sandbox funktioniert, CLI konfiguriert
2. **CloudNotes Backend** aus gestern liegt bereit (der `backend/` Ordner)
3. **psql** oder **pgAdmin** ist installiert (aus Woche 28)

<details markdown>
<summary>psql nicht installiert? (Schnellinstallation)</summary>

**Windows:**

1. Lade PostgreSQL herunter: https://www.postgresql.org/download/windows/
2. Während der Installation: Nur den **Command Line Tools** Haken setzen (du brauchst nicht den ganzen Server)
3. Alternativ: Nutze **pgAdmin** als grafisches Tool

**macOS:**

```bash
brew install libpq
brew link --force libpq
```

**Linux:**

```bash
sudo apt install postgresql-client
```

</details>

**Prüfe deine AWS CLI:**

```bash
aws sts get-caller-identity
```

Falls das funktioniert, bist du startklar!

**Folgende Werte bereithalten:**

| Was | Wo findest du es | Beispiel |
|-----|-------------------|----------|
| **AWS Account-ID** | `aws sts get-caller-identity` → `Account` | `123456789012` |
| **Region** | Sandbox-Einstellungen | `eu-central-1` |
| **ECR Repository URI** | Aus Übung 30.1 | `123456789012.dkr.ecr.eu-central-1.amazonaws.com/cloudnotes-api` |

> **Tipp:** Halte diese Werte in einem Texteditor bereit. Du brauchst sie mehrfach.

---

## Rückblick: PostgreSQL (Lokal, Docker, Cloud)

In [Woche 7](../woche-7/uebung-28.1-datenbanken.md) hast du PostgreSQL lokal installiert und [mit FastAPI verbunden](../woche-7/uebung-28.2-fastapi-postgresql.md). In [Woche 8](../woche-8/uebung-29.4-docker-compose.md) hast du PostgreSQL als Docker-Container betrieben. Heute kommt der nächste Schritt: PostgreSQL in der Cloud.

### Drei Wege zur Datenbank

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    subgraph lokal ["Woche 28: Lokal"]
        L_APP["FastAPI"] --> L_DB["PostgreSQL<br/>(auf deinem PC)"]
    end
    subgraph docker ["Woche 29: Docker"]
        D_APP["FastAPI Container"] --> D_DB["PostgreSQL Container"]
    end
    subgraph cloud ["Heute: AWS Cloud"]
        C_APP["FastAPI<br/>(lokal oder EC2)"] --> C_DB["RDS PostgreSQL<br/>(AWS managed)"]
    end
```

| Aspekt | Lokal (Woche 28) | Docker (Woche 29) | RDS (heute) |
|--------|-------------------|-------------------|-------------|
| **Installation** | Du installierst alles | Docker-Image | AWS erstellt alles |
| **Updates** | Du updatest manuell | Neues Image pullen | AWS patcht automatisch |
| **Backups** | Du musst selbst sichern | Volume-Backup | Automatische Backups |
| **Verfügbarkeit** | Nur wenn dein PC läuft | Nur wenn Docker läuft | 24/7 in der Cloud |
| **Skalierung** | Nicht einfach | Begrenzt | Ein Klick (Resize) |

### Wissensfrage 1

Was passiert mit deiner lokalen PostgreSQL-Datenbank, wenn du deinen Laptop zuklappst?

<details markdown>
<summary>Antwort anzeigen</summary>

Der PostgreSQL-Server wird **pausiert oder gestoppt**. Er ist nicht mehr erreichbar. Alle laufenden Verbindungen brechen ab.

Das ist das Problem mit lokalen Datenbanken:
- Sie sind nur verfügbar, wenn dein Rechner läuft
- Andere Entwickler oder Server können nicht darauf zugreifen
- Es gibt keine automatischen Backups

Eine **Cloud-Datenbank wie RDS** läuft dagegen 24/7 auf AWS-Servern, unabhängig von deinem Rechner. Das ist einer der Hauptgründe, warum man in der Praxis Cloud-Datenbanken nutzt.

</details>

---

## Teil 1: Warum Managed Database?

> **Ziel:** Du verstehst, was RDS für dich übernimmt
> **Zeitbedarf:** ca. 15 Minuten

### Was bedeutet "Managed"?

Bei einer **managed Database** kümmert sich AWS um alles, was nichts mit deinen Daten und deiner App zu tun hat:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    subgraph aws ["AWS kümmert sich um:"]
        A["🔧 Hardware & Server"]
        B["🔄 Software-Updates"]
        C["💾 Automatische Backups"]
        D["📊 Monitoring"]
        E["🔒 Netzwerk & Verschlüsselung"]
        F["🔁 Failover (Hochverfügbarkeit)"]
    end
    subgraph du ["Du kümmerst dich um:"]
        G["📝 Tabellen & Schema"]
        H["🔍 Queries & Logik"]
        I["🔑 Zugangsdaten"]
        J["⚙️ App-Konfiguration"]
    end
```

### RDS auf einen Blick

**Amazon RDS** (Relational Database Service) unterstützt mehrere Datenbank-Engines:

| Engine | Beschreibung |
|--------|-------------|
| **PostgreSQL** | Das nutzen wir heute! Open Source, leistungsstark |
| MySQL | Weit verbreitet, Open Source |
| MariaDB | MySQL-Fork, Open Source |
| Oracle | Enterprise-Datenbank |
| SQL Server | Microsoft-Datenbank |
| Aurora | AWS-eigene Engine (PostgreSQL/MySQL-kompatibel) |

Wir nutzen **PostgreSQL**, weil du es bereits aus Woche 28 kennst.

### Was kostet das?

| Ressource | Free Tier | Danach |
|-----------|-----------|--------|
| **db.t3.micro** | 750 Stunden/Monat (12 Monate) | ~15€/Monat |
| **Storage** | 20 GB | ~0,12€/GB/Monat |
| **Backups** | Bis zur DB-Größe kostenlos | ~0,10€/GB/Monat |

> **Wichtig für die Sandbox:** Wir nutzen die kleinste Instanz (db.t3.micro oder db.t4g.micro) und 20 GB Storage. Am Donnerstag löschen wir alles wieder, um das Budget zu schonen.
>
> **Hinweis:** Die Free-Tier-Angaben gelten für reguläre AWS-Accounts. In der Sandbox fallen die Kosten sofort an (siehe Hinweis in Übung 30.1).

### Wissensfrage 2

Nenne drei Dinge, die AWS bei RDS automatisch für dich übernimmt, die du bei einer lokalen PostgreSQL-Installation selbst machen müsstest.

<details markdown>
<summary>Antwort anzeigen</summary>

1. **Automatische Backups:** RDS erstellt täglich automatische Snapshots und erlaubt Point-in-Time Recovery. Lokal müsstest du `pg_dump` regelmäßig ausführen.

2. **Software-Updates (Patching):** AWS installiert Sicherheits-Updates für das Betriebssystem und die PostgreSQL-Version. Lokal müsstest du das manuell machen.

3. **Hardware-Wartung:** Wenn der physische Server ausfällt, migriert AWS deine Datenbank automatisch auf neue Hardware. Lokal wäre dein Server einfach weg.

Weitere: Monitoring (CloudWatch), Verschlüsselung, Netzwerk-Isolation (VPC), Skalierung (Resize der Instanz).

</details>

---

## Teil 2: Security Group für RDS erstellen

> **Ziel:** Eine Security Group die den Zugriff auf deine Datenbank regelt
> **Zeitbedarf:** ca. 20 Minuten

> **Rückblick:** Security Groups kennst du bereits aus [Modul 2, Woche 4: EC2 erstellen](../../modul-2/woche-4/ec2-erstellen.md), wo du Ports für SSH und HTTP freigeschaltet hast. Hier erstellst du eine **eigene** Security Group speziell für die Datenbank.

### Warum eine eigene Security Group?

Eine **Security Group** ist wie eine Firewall: Sie bestimmt, wer auf deine Datenbank zugreifen darf. Standardmäßig ist alles blockiert. Du musst explizit erlauben, wer rein darf.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph LR
    DEV["👨‍💻 Dein PC<br/>(deine IP)"] -->|Port 5432 ✅| SG["🔒 Security Group<br/>rds-cloudnotes-sg"]
    SG --> RDS["🗄️ RDS<br/>PostgreSQL"]
    HACKER["🏴‍☠️ Unbekannt<br/>(andere IP)"] -->|Port 5432 ❌| SG
```

### 2.1 Security Group erstellen

1. Gehe in die **AWS Console** → suche nach **"VPC"** oder **"EC2"**
2. Im linken Menü: **"Security Groups"**
3. Klicke **"Create security group"**

Fülle das Formular aus:

| Feld | Wert |
|------|------|
| **Security group name** | `rds-cloudnotes-sg` |
| **Description** | `Zugriff auf CloudNotes RDS PostgreSQL` |
| **VPC** | Die Standard-VPC (sollte vorausgewählt sein) |

### 2.2 Inbound Rule hinzufügen

Unter **"Inbound rules"** klicke auf **"Add rule"**:

| Feld | Wert | Erklärung |
|------|------|-----------|
| **Type** | PostgreSQL | Setzt automatisch Port 5432 |
| **Source** | My IP | Erlaubt nur deine aktuelle IP-Adresse |

> **Achtung:** Wähle **niemals** "Anywhere" (0.0.0.0/0) für eine Datenbank! Das würde die Datenbank für das gesamte Internet öffnen. Auch wenn wir hier mit Testdaten arbeiten, gute Gewohnheiten beginnen jetzt.

### 2.3 Outbound Rules

Die Standard-Outbound-Rule (alles erlauben) kannst du so lassen.

### 2.4 Security Group erstellen

Klicke auf **"Create security group"**.

Notiere dir die **Security Group ID** (z.B. `sg-0abc123def456...`), du brauchst sie gleich.

### 2.5 Vorausdenken: EC2-Zugriff

> **Tipp für morgen:** Am Mittwoch (Übung 30.3) wird dein EC2-Server auf diese Datenbank zugreifen müssen. Dann fügen wir eine zweite Inbound Rule hinzu, die den Zugriff von der EC2 Security Group erlaubt. Aber eins nach dem anderen!

### Wissensfrage 3

Warum ist es gefährlich, eine Datenbank-Security-Group für "Anywhere" (0.0.0.0/0) zu öffnen?

<details markdown>
<summary>Antwort anzeigen</summary>

Wenn die Security Group für 0.0.0.0/0 geöffnet ist, kann **jeder Computer im Internet** versuchen, sich mit deiner Datenbank zu verbinden:

1. **Brute-Force-Angriffe:** Automatisierte Bots versuchen ständig, Datenbank-Passwörter zu erraten
2. **SQL Injection:** Falls es eine Schwachstelle gibt, kann sie von überall ausgenutzt werden
3. **Datenleck:** Bei schwachem Passwort können Fremde alle Daten lesen
4. **Kosten:** Unerwünschter Traffic kann Kosten verursachen

**Best Practice:** Zugriff nur von bekannten IP-Adressen (z.B. dein Büro) oder von anderen Security Groups (z.B. dein EC2-Server) erlauben.

</details>

---

## Teil 3: RDS PostgreSQL Instanz erstellen

> **Ziel:** Eine laufende PostgreSQL-Datenbank in der AWS Cloud
> **Zeitbedarf:** ca. 30 Minuten (inkl. Wartezeit)
> **Du bist fertig, wenn:** Der Status "Available" anzeigt

### 3.1 RDS Dashboard öffnen

1. Gehe in die **AWS Console**
2. Suche nach **"RDS"** in der Suchleiste
3. Klicke auf **"RDS"**
4. Du siehst das RDS Dashboard

### 3.2 Datenbank erstellen

1. Klicke auf **"Create database"** (oder "Datenbank erstellen")
2. Du siehst ein umfangreiches Formular. Keine Sorge, wir gehen es Schritt für Schritt durch!

### 3.3 Engine wählen

| Einstellung | Wert |
|-------------|------|
| **Database creation method** | Standard create |
| **Engine type** | PostgreSQL |
| **Engine version** | PostgreSQL 16.x (neueste verfügbare) |

### 3.4 Templates

Wähle: **Free tier**

> **Wichtig:** Durch die Auswahl von "Free tier" werden automatisch die richtigen Einstellungen gesetzt (kleine Instanz, kein Multi-AZ).

### 3.5 Settings

| Einstellung | Wert | Erklärung |
|-------------|------|-----------|
| **DB instance identifier** | `cloudnotes-db` | Name deiner DB-Instanz in AWS |
| **Master username** | `cloudnotes_admin` | Dein DB-Benutzername |
| **Master password** | (wähle ein sicheres Passwort) | Mindestens 8 Zeichen |
| **Confirm password** | (Passwort wiederholen) | |

> **Wichtig:** Notiere dir **Benutzername** und **Passwort** sofort! Du brauchst sie für die Verbindung. AWS zeigt das Passwort danach nicht mehr an.

### 3.6 Instance Configuration

| Einstellung | Wert |
|-------------|------|
| **DB instance class** | db.t3.micro (oder db.t4g.micro) |

Beide sind Free-Tier-fähig: 1 vCPU, 1 GB RAM, ausreichend für unsere Übung.

### 3.7 Storage

| Einstellung | Wert |
|-------------|------|
| **Storage type** | General Purpose SSD (gp2 oder gp3, je nach Verfügbarkeit) |
| **Allocated storage** | 20 GB |
| **Storage autoscaling** | Deaktiviert |

> **Hinweis:** AWS bietet je nach Region und Zeitpunkt `gp2` oder `gp3` als Standard an. Beide funktionieren für unsere Übung. 20 GB ist das Free-Tier-Maximum. Autoscaling deaktivieren, damit die Sandbox-Kosten kontrollierbar bleiben.

### 3.8 Connectivity

| Einstellung | Wert | Erklärung |
|-------------|------|-----------|
| **VPC** | Default VPC | Standard-Netzwerk |
| **Subnet group** | default | Standard-Subnetze |
| **Public access** | **Yes** | Damit du von deinem PC zugreifen kannst |
| **VPC security group** | Choose existing → `rds-cloudnotes-sg` | Unsere Security Group aus Teil 2 |
| **Availability Zone** | No preference | AWS wählt automatisch |
| **Database port** | 5432 | Standard PostgreSQL Port |

> **Achtung:** "Public access: Yes" bedeutet, dass die Datenbank eine öffentliche IP bekommt. Das ist für unsere Übung nötig (damit du von deinem PC zugreifen kannst), aber in Produktion würde man das **deaktivieren** und nur über ein VPN oder von EC2 innerhalb des gleichen VPCs zugreifen.

### 3.9 Database authentication

| Einstellung | Wert |
|-------------|------|
| **Authentication** | Password authentication |

### 3.10 Additional configuration

Klappe **"Additional configuration"** auf:

| Einstellung | Wert |
|-------------|------|
| **Initial database name** | `cloudnotes` |
| **Automated backups** | Aktiviert (Standard) |
| **Backup retention** | 7 Tage |
| **Deletion protection** | **Deaktiviert** (damit wir am Donnerstag löschen können!) |

> **Wichtig:** "Deletion protection" muss deaktiviert sein, sonst kannst du die DB am Donnerstag nicht löschen (Cleanup).

### 3.11 Erstellen!

Klicke auf **"Create database"**.

**Jetzt heißt es warten.** Die Erstellung dauert **5-10 Minuten**. Du siehst den Status "Creating..."

Nutze die Wartezeit für die Wissensfragen!

### 3.12 Endpoint notieren

Sobald der Status auf **"Available"** wechselt:

1. Klicke auf deine Datenbank **cloudnotes-db**
2. Unter **"Connectivity & security"** findest du den **Endpoint**:

```
cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com
```

**Notiere dir diesen Endpoint!** Er ist die "Adresse" deiner Cloud-Datenbank.

### Wissensfrage 4

Warum wählen wir "Public Access: Yes", obwohl das in Produktion keine gute Idee wäre?

<details markdown>
<summary>Antwort anzeigen</summary>

**Für unsere Übung:** Wir wollen von unserem lokalen PC (über das Internet) auf die Datenbank zugreifen können, um sie zu testen und zu konfigurieren. Ohne Public Access könnten wir nur von Ressourcen **innerhalb des gleichen VPCs** (z.B. EC2) zugreifen.

**In Produktion:** Würde man Public Access deaktivieren und stattdessen:
- Nur von EC2-Instanzen im gleichen VPC zugreifen
- Ein VPN für Entwickler-Zugriff nutzen
- AWS Systems Manager Session Manager verwenden

Die Security Group bietet zwar bereits Schutz (nur deine IP), aber "Defense in Depth" (mehrere Schutzschichten) ist besser als nur eine.

</details>

---

## Teil 4: Verbindung testen

> **Ziel:** Du kannst dich von deinem PC mit der Cloud-Datenbank verbinden
> **Zeitbedarf:** ca. 20 Minuten

### 4.1 Connection String zusammenbauen

Aus den Informationen, die du notiert hast, baust du jetzt den Connection String:

```
Host:     cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com
Port:     5432
Database: cloudnotes
Username: cloudnotes_admin
Password: (dein Passwort)
```

### 4.2 Mit psql verbinden

```bash
psql -h cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com -U cloudnotes_admin -d cloudnotes
```

Du wirst nach dem Passwort gefragt. Nach erfolgreicher Verbindung siehst du:

```
cloudnotes=>
```

!!! tip "Verbindung klappt nicht? Port 5432 könnte blockiert sein"
    Manche Netzwerke (Firmen-WLAN, Uni, Hotspots) blockieren ausgehenden Traffic auf Port 5432. Falls `psql` hängt oder "Connection timed out" zeigt, obwohl die Security Group korrekt ist: Teste die Verbindung später über deinen **EC2-Server** per SSH (das funktioniert immer, weil EC2 und RDS im gleichen VPC sind). In Übung 30.3 zeigen wir, wie du `psql` direkt auf EC2 installierst.

**Teste die Verbindung:**

```sql
SELECT version();
```

Du solltest die PostgreSQL-Version sehen (z.B. `PostgreSQL 16.x on x86_64-pc-linux-gnu`).

```sql
SELECT current_database();
```

Sollte `cloudnotes` anzeigen.

Verlasse psql:

```sql
\q
```

### 4.3 Alternative: pgAdmin

Falls du pgAdmin nutzt:

1. Öffne pgAdmin
2. Rechtsklick auf **"Servers"** → **"Register"** → **"Server"**
3. **General Tab:** Name: `CloudNotes RDS`
4. **Connection Tab:**

| Feld | Wert |
|------|------|
| Host | `cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com` |
| Port | `5432` |
| Maintenance DB | `cloudnotes` |
| Username | `cloudnotes_admin` |
| Password | (dein Passwort) |
| Save password | Ja |

5. Klicke **"Save"**

<details markdown>
<summary>Hilfe: Verbindung schlägt fehl?</summary>

**"Connection timed out":**
- Prüfe, ob deine Security Group deine aktuelle IP erlaubt
- Deine IP könnte sich geändert haben → Security Group aktualisieren
- Prüfe, ob "Public Access" auf "Yes" steht

**"password authentication failed":**
- Tippfehler im Passwort?
- Richtiger Username? (cloudnotes_admin)

**"could not translate host name":**
- Tippfehler im Endpoint?
- Kopiere den Endpoint direkt aus der AWS Console

**Security Group aktualisieren:**
1. Gehe zu EC2 → Security Groups
2. Wähle `rds-cloudnotes-sg`
3. Edit Inbound Rules → Source auf "My IP" ändern

</details>

### Wissensfrage 5

Was ist der Unterschied zwischen dem "DB instance identifier" (cloudnotes-db) und dem "Endpoint"?

<details markdown>
<summary>Antwort anzeigen</summary>

- **DB instance identifier** (`cloudnotes-db`) ist der **Name** deiner Datenbank-Instanz in AWS. Damit identifizierst du sie in der Console und CLI. Er ist **kein** Hostname.

- **Endpoint** (`cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com`) ist der **DNS-Name** (Hostname), über den du dich tatsächlich verbindest. Er wird von AWS automatisch generiert und zeigt auf den Server, auf dem deine Datenbank läuft.

**Analogie:** Der Identifier ist wie der Name deines Hauses ("Villa Sonnenschein"), der Endpoint ist die Postadresse ("Musterstraße 42, 12345 Frankfurt").

</details>

---

## Teil 5: CloudNotes mit RDS verbinden

> **Ziel:** Deine FastAPI-App nutzt die Cloud-Datenbank statt SQLite
> **Zeitbedarf:** ca. 25 Minuten
> **Du bist fertig, wenn:** CRUD-Operationen in Swagger gegen RDS funktionieren

### 5.1 .env Datei anpassen

Öffne die `.env` Datei in deinem `backend/` Ordner und ändere die `DATABASE_URL`:

**Vorher (SQLite):**
```env
DATABASE_URL=sqlite:///./notes.db
```

**Nachher (RDS PostgreSQL):**
```env
DATABASE_URL=postgresql+psycopg://cloudnotes_admin:<dein-passwort>@cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com:5432/cloudnotes
```

> **Wichtig:** Ersetze `<dein-passwort>` und den Endpoint mit deinen tatsächlichen Werten!

### 5.2 Das Format der DATABASE_URL

```
postgresql+psycopg://USERNAME:PASSWORD@HOST:PORT/DATABASE
                     ^^^^^^^^ ^^^^^^^^  ^^^^  ^^^^  ^^^^^^^^
                     |        |         |     |     |
                     |        |         |     |     Datenbankname
                     |        |         |     Port (5432)
                     |        |         RDS Endpoint
                     |        Dein Passwort
                     Dein Username
```

> **Rückblick [Woche 7](../woche-7/uebung-28.2-fastapi-postgresql.md):** Du hast dieses Format bereits bei der lokalen PostgreSQL-Verbindung gesehen. Der einzige Unterschied ist der **Host**: statt `localhost` steht dort jetzt der RDS-Endpoint.

### 5.3 FastAPI starten und testen

Stelle sicher, dass du im `backend/` Ordner bist und das Virtual Environment aktiv ist:

```bash
cd backend
source venv/bin/activate   # Git Bash / macOS / Linux
```

Starte die App:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Hinweis:** Beim ersten Start erstellt SQLAlchemy automatisch die `notes`-Tabelle auf RDS (`Base.metadata.create_all`). Das ist ein Komfort-Shortcut für Lernprojekte. In echtem Produktivcode würde man `create_all` entfernen und stattdessen Alembic-Migrationen nutzen (siehe Teil 6). Für euer **Abschlussprojekt** empfehlen wir ebenfalls Alembic.

### 5.4 CRUD testen

Öffne **http://localhost:8000/docs** im Browser und teste:

**1. Notiz erstellen (POST /notes):**

```json
{
  "title": "Meine erste Cloud-Notiz",
  "content": "Diese Notiz liegt auf AWS RDS!"
}
```

**2. Notizen abrufen (GET /notes):**

Du solltest die gerade erstellte Notiz sehen.

**3. In RDS verifizieren:**

Öffne ein zweites Terminal und verbinde dich per psql:

```bash
psql -h cloudnotes-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com -U cloudnotes_admin -d cloudnotes
```

```sql
SELECT * FROM notes;
```

Du solltest deine Notiz in der Cloud-Datenbank sehen!

```sql
\q
```

### 5.5 Die entscheidende Erkenntnis

Vergleiche den Code von gestern (SQLite) mit heute (RDS PostgreSQL):

| Was hat sich geändert? | Gestern (SQLite) | Heute (RDS) |
|------------------------|-----------------|-------------|
| `main.py` | Keine Änderung | Keine Änderung |
| `models.py` | Keine Änderung | Keine Änderung |
| `schemas.py` | Keine Änderung | Keine Änderung |
| `database.py` | Keine Änderung | Keine Änderung |
| `.env` (DATABASE_URL) | `sqlite:///./notes.db` | `postgresql+psycopg://...@rds...` |

**Nur die URL hat sich geändert!** Der gesamte Python-Code ist identisch. Das ist die Stärke eines ORM wie SQLAlchemy: du programmierst gegen eine Abstraktion, nicht gegen eine bestimmte Datenbank.

### Wissensfrage 6

Was müsstest du im Python-Code ändern, wenn du von PostgreSQL auf MySQL wechseln wolltest?

<details markdown>
<summary>Antwort anzeigen</summary>

**Fast nichts!** Du müsstest:

1. Die `DATABASE_URL` ändern: `mysql+pymysql://user:pass@host:3306/db` statt `postgresql+psycopg://...`
2. Den MySQL-Treiber installieren: `pip install pymysql` statt `psycopg`

Der Rest des Codes (Models, Schemas, Endpoints) bleibt **identisch**. Das ORM übersetzt automatisch in den richtigen SQL-Dialekt.

Das ist einer der wichtigsten Vorteile eines ORM: **Datenbank-Unabhängigkeit**. In der Praxis wechselt man selten die Datenbank, aber es ermöglicht z.B. SQLite für Tests und PostgreSQL für Produktion zu nutzen.

</details>

---

## Teil 6: Alembic Migrations auf RDS

> **Ziel:** Schema-Management mit Alembic gegen die Cloud-Datenbank
> **Zeitbedarf:** ca. 20 Minuten

### 6.1 Alembic initialisieren

Falls du Alembic noch nicht im Projekt hast, initialisiere es:

```bash
pip install alembic
alembic init alembic
```

### 6.2 Alembic konfigurieren

Bearbeite `alembic/env.py`, füge am Anfang der Datei folgendes hinzu:

```python
import os
import sys
from dotenv import load_dotenv

# Projektverzeichnis zum Path hinzufügen
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

load_dotenv()
```

Finde die Zeile mit `target_metadata` und ändere sie:

```python
from database import Base
target_metadata = Base.metadata
```

Finde die Funktion `run_migrations_online()` und passe die Engine-Konfiguration an:

```python
def run_migrations_online():
    from database import engine

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()
```

### 6.3 Erste Migration erstellen

```bash
alembic revision --autogenerate -m "initial notes table"
```

Alembic erkennt automatisch dein `Note`-Model und erstellt eine Migration.

Erwartete Ausgabe (ähnlich):

```
INFO  [alembic.autogenerate.compare] Detected added table 'notes'
  Generating .../alembic/versions/xxxx_initial_notes_table.py ...  done
```

### 6.4 Migration ausführen

```bash
alembic upgrade head
```

Erwartete Ausgabe:

```
INFO  [alembic.runtime.migration] Running upgrade  -> xxxx, initial notes table
```

> **Hinweis:** Falls die Tabelle bereits existiert (durch `Base.metadata.create_all` in `main.py`), kann es eine Warnung geben. Das ist in Ordnung. Alembic überspringt dann die bereits existierenden Tabellen.

### 6.5 Migrations-Status prüfen

```bash
alembic current
```

Erwartete Ausgabe (deine Revisions-ID):

```
xxxxxxxxxxxx (head)
```

```bash
alembic history
```

Zeigt alle Migrationen:

```
xxxxxxxxxxxx -> (head), initial notes table
```

### 6.6 Docker Image aktualisieren

Da die App jetzt für PostgreSQL bereit ist, bauen wir ein neues Docker Image und pushen es nach ECR:

> **Zur Klarstellung:** Der Docker-Tag (`v1.1`) ist die **Image-Version** und zeigt, dass sich das Image geändert hat (z.B. neue Dependencies, Code-Änderungen). Die App-Version in der FastAPI-Response (`"version":"1.0.0"`) ist die **API-Version** und bleibt gleich, solange sich die API-Schnittstelle nicht ändert. Beides ist unabhängig voneinander.

```bash
docker build -t cloudnotes-api:v1.1 .
```

Taggen und pushen:

```bash
docker tag cloudnotes-api:v1.1 <deine-account-id>.dkr.ecr.eu-central-1.amazonaws.com/cloudnotes-api:v1.1
```

```bash
docker tag cloudnotes-api:v1.1 <deine-account-id>.dkr.ecr.eu-central-1.amazonaws.com/cloudnotes-api:latest
```

Falls dein ECR-Login abgelaufen ist (>12 Stunden):

```bash
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <deine-account-id>.dkr.ecr.eu-central-1.amazonaws.com
```

```bash
docker push <deine-account-id>.dkr.ecr.eu-central-1.amazonaws.com/cloudnotes-api:v1.1
```

```bash
docker push <deine-account-id>.dkr.ecr.eu-central-1.amazonaws.com/cloudnotes-api:latest
```

> **Tipp:** Der Push geht schnell, weil sich nur die geänderten Layers unterscheiden!

### Wissensfrage 7

Warum sollte man in Produktion `Base.metadata.create_all()` durch Alembic-Migrationen ersetzen?

<details markdown>
<summary>Antwort anzeigen</summary>

`create_all()` hat Einschränkungen:

1. **Keine Änderungen:** Es erstellt nur neue Tabellen, kann aber bestehende nicht ändern (z.B. Spalten hinzufügen/umbenennen)
2. **Keine Versionierung:** Du weißt nicht, welcher Schema-Stand auf der Datenbank ist
3. **Kein Rollback:** Du kannst nicht zu einem früheren Schema zurückkehren

**Alembic** dagegen:

1. **Versioniert** jede Schema-Änderung (wie Git für die Datenbank)
2. **Unterstützt ALTER:** Spalten hinzufügen, umbenennen, löschen
3. **Rollback:** `alembic downgrade` macht Änderungen rückgängig
4. **Team-fähig:** Alle Entwickler haben den gleichen Schema-Stand

Für Lernprojekte ist `create_all()` okay, in Produktion nutzt man **immer** Alembic (oder ein vergleichbares Tool).

</details>

---

## Zusammenfassung: Was du heute geschafft hast

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph TD
    subgraph gestern ["✅ Tag 1"]
        A["CloudNotes API gebaut"] --> B["Docker Image → ECR"]
    end
    subgraph heute ["✅ Tag 2: Heute"]
        C["Security Group erstellt"] --> D["RDS PostgreSQL erstellt"]
        D --> E["App mit RDS verbunden"]
        E --> F["Neues Image v1.1 → ECR"]
    end
    subgraph morgen ["📋 Tag 3: Morgen"]
        G["EC2 + Docker<br/>Deployment"]
    end
    subgraph do ["📋 Tag 4"]
        H["React Frontend<br/>auf S3"]
    end
    B -.-> C
    F -.-> G
    G -.-> H
```

**Heute hast du:**

1. Verstanden, warum managed Databases (RDS) besser sind als selbst-gehostete
2. Eine Security Group für die Datenbank erstellt
3. Eine PostgreSQL-Instanz auf AWS RDS eingerichtet
4. Die Verbindung von deinem PC zur Cloud-DB getestet
5. Die CloudNotes-App mit nur einer geänderten URL auf RDS umgestellt
6. Ein aktualisiertes Docker Image (v1.1) nach ECR gepusht

**Morgen** deployen wir das Backend auf einem EC2-Server und verbinden alles!

---

## Bonus: RDS Snapshots & Monitoring

> **Zeitbedarf:** ca. 15 Minuten

### Automatische Backups

RDS erstellt automatisch tägliche Backups (Snapshots):

1. Gehe in der **RDS Console** auf deine Instanz
2. Klicke auf **"Maintenance & backups"**
3. Du siehst das Backup-Fenster und die Retention Period

Du kannst auch **manuelle Snapshots** erstellen:

1. Wähle deine DB-Instanz aus
2. Klicke **"Actions"** → **"Take snapshot"**
3. Gib einen Namen ein, z.B. `cloudnotes-before-changes`

### RDS Monitoring

1. Gehe in der RDS Console auf deine Instanz
2. Klicke auf den Tab **"Monitoring"**
3. Du siehst Metriken wie:
   - **CPU Utilization:** Wie ausgelastet ist der Server?
   - **Database Connections:** Wie viele aktive Verbindungen?
   - **Free Storage Space:** Wie viel Speicher ist noch frei?
   - **Read/Write IOPS:** Wie viele Lese-/Schreiboperationen?

> **Tipp:** Für unsere kleine Übung werden die Werte sehr niedrig sein. In Produktion mit vielen Nutzern siehst du hier, ob deine Datenbank skaliert werden muss.

---

---

## Aufräumen (Definition of Done)

> **Wichtig:** Heute hast du eine RDS-Instanz gestartet, die laufend Kosten verursacht. Prüfe am Ende des Tages:

- [ ] **RDS-Instanz:** Bleibt laufen, du brauchst sie morgen und übermorgen! Falls du heute aufhörst und morgen **nicht** weiterarbeitest, **stoppe** sie: RDS Console → Instanz auswählen → Actions → Stop temporarily
- [ ] **Security Group `rds-cloudnotes-sg`:** Bleibt bestehen, brauchen wir die ganze Woche
- [ ] **ECR Repository:** Noch da? Gut, brauchen wir weiterhin
- [ ] **Lokale `.env` Datei:** Enthält Passwort, nicht in Git committen!

> **Budget-Check:** Die RDS-Instanz (db.t3.micro) kostet ca. 0,50€/Tag. Wir nutzen bewusst die kleinste Instanz. In Sandbox-Accounts fallen die Kosten sofort an (kein Free Tier, siehe Hinweis oben). **Am Donnerstag wird alles aufgeräumt.**

---

## Checkliste

Prüfe, ob du alle Ziele erreicht hast:

- [ ] Managed Database Konzept verstanden (was AWS übernimmt vs. was du tust)
- [ ] Security Group `rds-cloudnotes-sg` erstellt (nur deine IP auf Port 5432)
- [ ] RDS PostgreSQL Instanz läuft (Status: Available)
- [ ] Verbindung per psql oder pgAdmin erfolgreich
- [ ] CloudNotes FastAPI-App verbindet sich mit RDS (nur URL geändert!)
- [ ] CRUD-Operationen funktionieren gegen die Cloud-Datenbank
- [ ] Aktualisiertes Docker Image (v1.1) nach ECR gepusht
- [ ] Ich kann erklären, warum sich am Code fast nichts geändert hat
- [ ] Budget-Check: RDS läuft oder ist gestoppt (je nach Plan für morgen)

> **Ausblick:** Morgen in Übung 30.3 deployen wir das CloudNotes-Backend auf einen EC2-Server. Der Server pullt das Docker Image aus ECR und verbindet sich mit der RDS-Datenbank. Dann läuft dein Backend komplett in der Cloud!
