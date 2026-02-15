# PostgreSQL & Datenbanken - Praktische Übungen

## Übersicht

In dieser Übung setzt du die Theorie vom Vormittag in die Praxis um:

- **PostgreSQL installieren** - Lokales Setup auf Windows, macOS und Linux
- **psql kennenlernen** - Die wichtigsten Terminal-Befehle für PostgreSQL
- **Datenbanken und Tabellen anlegen** - CREATE DATABASE, CREATE TABLE
- **Datentypen und Constraints** - Die PostgreSQL-Grundlagen anwenden
- **Daten einfügen und abfragen** - INSERT und SELECT
- **pgAdmin** - Die grafische Oberfläche kennenlernen

Diese Übung baut auf eurem Wissen mit SQLite aus Woche 6 auf – jetzt wechseln wir zum professionellen DB-Server.

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Warum PostgreSQL? | 5 min (lesen) |
| **Teil 1** | PostgreSQL installieren und einrichten | 30 min |
| **Teil 2** | psql Grundlagen | 20 min |
| **Teil 3** | Tabellen erstellen mit Datentypen und Constraints | 30 min |
| **Teil 4** | Daten einfügen und abfragen | 25 min |
| **Teil 5** | pgAdmin kennenlernen | 15 min |
| | **Gesamt** | **ca. 2 Stunden** |

**Minimalpfad (ca. 60–90 Minuten):** Teil 1 (Installation), Teil 2 (psql), Teil 3 (Tabellen), Teil 4 (Daten). pgAdmin und Bonus sind optional.

---

## Rückblick: Warum PostgreSQL?

Bevor wir loslegen, ein kurzer Rückblick auf die wichtigsten Punkte vom Vormittag.

### Euer Stack verändert sich

```
Bisher:                            Jetzt neu:
React  ↔  FastAPI  ↔  SQLite      React  ↔  FastAPI  ↔  PostgreSQL
                      (Datei)                             (Server-Prozess)
```

SQLite war perfekt für den Einstieg – eine einzelne Datei, kein Server nötig. Aber für eine Web-Anwendung mit mehreren Nutzern braucht ihr einen richtigen DB-Server. PostgreSQL bringt Concurrency (viele parallele Verbindungen), Benutzer-/Rechteverwaltung und professionelle Backup-Tools mit.

### Datenbanktypen auf einen Blick

| Typ | Beispiel | Stärke | Typischer Einsatz |
|-----|----------|--------|-------------------|
| Relational | PostgreSQL | Konsistenz, Beziehungen | Geschäftslogik, CRUD-Apps |
| Dokument | MongoDB | Flexibles Schema | Logs, CMS, Events |
| Key-Value | Redis | Geschwindigkeit | Cache, Sessions |
| Managed | AWS RDS | Betrieb ausgelagert | Produktion in der Cloud |

**Unser Fokus diese Woche:** PostgreSQL als relationale Datenbank.

### Wissensfrage 1

Nenne zwei Gründe, warum SQLite für eine Web-API mit vielen gleichzeitigen Nutzern nicht ausreicht.

<details>
<summary>Antwort anzeigen</summary>

1. **Concurrency:** SQLite erlaubt nur einen Writer gleichzeitig. Bei vielen parallelen Requests wird das zum Flaschenhals. PostgreSQL nutzt MVCC (Multi-Version Concurrency Control) und kann viele Transaktionen parallel verarbeiten.

2. **Benutzer/Rechte:** SQLite hat keine eigene Benutzerverwaltung – Zugriffskontrolle läuft nur über Dateisystem-Berechtigungen. PostgreSQL hat Rollen, Passwörter und feingranulare Grants.

</details>

### Wissensfrage 2

Was ist der Unterschied zwischen einem PostgreSQL-**Cluster** und einer **Database**?

<details>
<summary>Antwort anzeigen</summary>

- **Cluster** = Eine laufende PostgreSQL-Server-Instanz (der gesamte Server-Prozess).
- **Database** = Logische Trennung der Daten innerhalb eines Clusters (wie ein Ordner).

Ein Cluster kann mehrere Databases enthalten. Innerhalb einer Database gibt es Schemas (Standard: `public`), und innerhalb eines Schemas liegen die Tabellen.

```
Cluster (Server-Instanz)
  └── Database: kursapp
        └── Schema: public
              ├── Table: users
              └── Table: orders
  └── Database: postgres (Standard-DB)
```

</details>

---

## Teil 1: PostgreSQL installieren und einrichten

### Übung 1: PostgreSQL installieren

> **Ziel:** PostgreSQL lokal installieren
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** `psql --version` erfolgreich eine Versionsnummer anzeigt

Wähle die Anleitung für dein Betriebssystem:

#### Windows 11 (Empfohlen: Installer)

1. Öffne [postgresql.org/download](https://www.postgresql.org/download/) und wähle **Windows**
2. Lade den **Interactive Installer von EDB** herunter
3. Starte den Installer und gehe die Schritte durch:
   - **Installationsverzeichnis:** Standard beibehalten
   - **Komponenten:** Alle auswählen (PostgreSQL Server, pgAdmin, Command Line Tools)
   - **Datenverzeichnis:** Standard beibehalten
   - **Passwort:** Setze ein Passwort für den `postgres`-Benutzer
   - **Port:** Standard `5432` beibehalten
   - **Locale:** Standard beibehalten
4. Installation abschließen (Stack Builder kannst du überspringen)

> **Wichtig:** Merke dir das Passwort! Du brauchst es gleich, um dich zu verbinden.

**Überprüfung:** Öffne eine neue Eingabeaufforderung (CMD) oder PowerShell und tippe:

```bash
psql --version
```

Falls `psql` nicht gefunden wird, nutze alternativ **"SQL Shell (psql)"** aus dem Startmenü – das funktioniert immer.

<details>
<summary>Hilfe: psql unter Windows nicht gefunden?</summary>

Der PostgreSQL `bin`-Ordner ist nicht automatisch im PATH. Du hast zwei Optionen:

**Option A:** Nutze die **"SQL Shell (psql)"** Verknüpfung im Startmenü – die funktioniert unabhängig vom PATH.

**Option B:** Füge den Pfad manuell hinzu. Typischer Pfad:
```
C:\Program Files\PostgreSQL\17\bin
```

So fügst du ihn hinzu:
1. Startmenü → "Umgebungsvariablen" suchen → "Umgebungsvariablen für dieses Konto bearbeiten"
2. Variable `Path` auswählen → Bearbeiten → Neu
3. Den Pfad `C:\Program Files\PostgreSQL\17\bin` einfügen
4. **Neue** Eingabeaufforderung öffnen (alte Fenster kennen den neuen PATH nicht)

</details>

**Alternative via Paketmanager:**

```bash
winget install PostgreSQL.PostgreSQL
```

#### macOS

```bash
brew install postgresql@17
```

Nach der Installation den Server starten:

```bash
brew services start postgresql@17
```

Falls `psql` nicht gefunden wird, füge den Pfad zur Shell hinzu:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Überprüfung:**

```bash
psql --version
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Der Server startet automatisch. Aktiviere ihn für den Autostart:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Überprüfung:**

```bash
psql --version
```

> **Hinweis für Linux:** PostgreSQL erstellt automatisch einen System-Benutzer `postgres`. Die Verbindung funktioniert über `sudo -u postgres psql` (mehr dazu in Übung 3).

---

### Übung 2: Server-Status prüfen

> **Ziel:** Sicherstellen, dass der PostgreSQL-Server läuft
> **Zeitbedarf:** ca. 5 Minuten
> **Du bist fertig, wenn:** Du den Server starten und stoppen kannst

Überprüfe, ob dein PostgreSQL-Server läuft, und teste das Starten und Stoppen:

| Aktion | Windows | macOS | Linux |
|--------|---------|-------|-------|
| **Status** | Dienste-App: nach `postgresql` suchen | `brew services list` | `sudo systemctl status postgresql` |
| **Starten** | Dienste-App → Rechtsklick → Starten | `brew services start postgresql@17` | `sudo systemctl start postgresql` |
| **Stoppen** | Dienste-App → Rechtsklick → Beenden | `brew services stop postgresql@17` | `sudo systemctl stop postgresql` |

> **Windows-Tipp:** Öffne die Dienste-App über das Startmenü (suche nach "Dienste" oder `services.msc`). Suche dort nach einem Eintrag wie `postgresql-x64-17`.

**Aufgabe:** Stoppe den Server, starte ihn wieder, und prüfe den Status.

### Wissensfrage 3

Was passiert mit euren Daten, wenn ihr den PostgreSQL-Server stoppt?

<details>
<summary>Antwort anzeigen</summary>

**Die Daten bleiben erhalten.** Sie sind auf der Festplatte gespeichert (im sogenannten Data Directory). Der Server-Prozess muss nur laufen, damit Clients (wie `psql` oder eure App) auf die Daten zugreifen können. Wenn ihr den Server stoppt und wieder startet, sind alle Daten noch da.

</details>

---

### Übung 3: Erste Verbindung mit psql

> **Ziel:** Sich mit psql zum PostgreSQL-Server verbinden
> **Zeitbedarf:** ca. 5 Minuten
> **Du bist fertig, wenn:** Du den psql-Prompt siehst (`postgres=#`)

**Verbinde dich mit dem Server:**

```bash
psql -h localhost -U postgres -d postgres
```

- `-h localhost` = Host (dein lokaler Rechner)
- `-U postgres` = Benutzername
- `-d postgres` = Standard-Datenbank

> **Windows:** Wenn du die "SQL Shell (psql)" aus dem Startmenü nutzt, wirst du nach Host, Port, Datenbank, Benutzer und Passwort gefragt – drücke bei den ersten vier einfach Enter für die Standardwerte und gib dann dein Passwort ein.

> **Linux:** Nutze `sudo -u postgres psql` (damit verbindest du dich als System-Benutzer `postgres` ohne Passwort).

Du solltest jetzt den Prompt sehen:

```
postgres=#
```

**Erster Test:** Führe diese Abfrage aus:

```sql
SELECT version();
```

Du solltest eine Ausgabe sehen wie:

```
                          version
-------------------------------------------------------------
 PostgreSQL 17.x on ...
```

### Troubleshooting

Falls die Verbindung nicht klappt, prüfe diese häufigen Probleme:

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Port 5432 belegt | Alter Dienst läuft noch | Dienst stoppen oder Port im Installer ändern |
| `psql` nicht gefunden | Nicht im PATH | SQL Shell aus Startmenü (Win) oder PATH anpassen |
| Passwort-/Auth-Fehler | Falscher User oder Passwort | `postgres`-User + Installer-Passwort prüfen |
| Service läuft nicht | Nicht gestartet nach Install | Dienste-App (Win), `brew services` (Mac), `systemctl` (Linux) |
| pgAdmin verbindet nicht | Falsche Einstellungen | Host: `localhost`, Port: `5432`, DB: `postgres` |

<details>
<summary>Hilfe: Passwort wird nicht angenommen (Linux)?</summary>

Auf Linux verwendet PostgreSQL standardmäßig die **Peer-Authentifizierung** – das heißt, dein System-Benutzername muss mit dem PostgreSQL-Benutzernamen übereinstimmen. Deshalb funktioniert `sudo -u postgres psql` (du wechselst zum System-Benutzer `postgres`).

Wenn du stattdessen mit Passwort verbinden möchtest, kannst du die Datei `pg_hba.conf` anpassen (fortgeschritten). Für den Kurs reicht `sudo -u postgres psql` völlig aus.

</details>

---

## Teil 2: psql Grundlagen

### Übung 4: psql-Befehle kennenlernen

> **Ziel:** Die wichtigsten psql-Meta-Befehle anwenden
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du alle Befehle aus der Tabelle ausprobiert hast

psql hat eigene Befehle, die mit einem Backslash (`\`) beginnen. Diese sind keine SQL-Befehle, sondern psql-spezifische Kommandos:

| Befehl | Beschreibung |
|--------|-------------|
| `\l` | Alle Datenbanken auflisten |
| `\c dbname` | Zu einer Datenbank wechseln |
| `\dt` | Alle Tabellen im aktuellen Schema anzeigen |
| `\d tabellenname` | Tabellenstruktur anzeigen (Spalten, Typen, Constraints) |
| `\du` | Alle Rollen/User anzeigen |
| `\q` | psql beenden |
| `\?` | Hilfe zu allen psql-Befehlen |

**Aufgabe:** Probiere jeden Befehl einmal aus:

1. Verbinde dich mit psql (falls noch nicht verbunden)
2. Führe `\l` aus – du siehst die Standard-Datenbanken (`postgres`, `template0`, `template1`)
3. Führe `\du` aus – du siehst den `postgres`-User
4. Führe `\?` aus – scrolle durch die Hilfe (mit `q` beenden)
5. Führe `\dt` aus – die Ausgabe ist vermutlich leer (noch keine eigenen Tabellen)

---

### Übung 5: Eigene Datenbank erstellen

> **Ziel:** Eine eigene Datenbank anlegen und dorthin wechseln
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du mit `\c` in deine neue Datenbank gewechselt hast

Erstelle deine erste eigene Datenbank:

```sql
-- Datenbank anlegen
CREATE DATABASE kursapp;
```

Wechsle in die neue Datenbank:

```sql
\c kursapp
```

Du solltest diese Meldung sehen:

```
You are now connected to database "kursapp" as user "postgres".
```

Aktiviere die UUID-Funktion (brauchen wir gleich für die Tabellen):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

> **Was macht pgcrypto?** Diese Extension stellt die Funktion `gen_random_uuid()` bereit, mit der PostgreSQL automatisch eindeutige IDs (UUIDs) generieren kann. Das ist sicherer und skalierbarer als fortlaufende Nummern.

**Überprüfung:** Führe `\l` aus – `kursapp` sollte jetzt in der Liste stehen.

<details>
<summary>Musterlösung anzeigen</summary>

So sollte die gesamte Sitzung aussehen:

```
postgres=# CREATE DATABASE kursapp;
CREATE DATABASE
postgres=# \c kursapp
You are now connected to database "kursapp" as user "postgres".
kursapp=# CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION
kursapp=# \l
                                  List of databases
   Name    |  Owner   | Encoding | ...
-----------+----------+----------+-----
 kursapp   | postgres | UTF8     | ...
 postgres  | postgres | UTF8     | ...
 template0 | postgres | UTF8     | ...
 template1 | postgres | UTF8     | ...
```

Beachte, dass sich der Prompt von `postgres=#` zu `kursapp=#` geändert hat – das zeigt dir immer, in welcher Datenbank du gerade bist.

</details>

---

## Teil 3: Tabellen erstellen mit Datentypen und Constraints

In diesem Teil erstellst du Tabellen und nutzt dabei die Datentypen und Constraints, die ihr am Vormittag kennengelernt habt.

### Datentypen-Referenz

| Typ | Beschreibung | Beispiel |
|-----|-------------|---------|
| `text` / `varchar(n)` | Zeichenketten | `'Hallo Welt'` |
| `integer` / `bigint` | Ganzzahlen | `42`, `9999999` |
| `boolean` | Wahrheitswert | `true` / `false` |
| `uuid` | Universally Unique Identifier | `gen_random_uuid()` |
| `timestamptz` | Zeitstempel mit Zeitzone | `now()` |
| `jsonb` | JSON (binär, indexierbar) | `'{"key":"value"}'::jsonb` |

### Constraints-Referenz

| Constraint | Bedeutung | Beispiel |
|-----------|-----------|---------|
| `PRIMARY KEY` | Eindeutige ID jeder Zeile | `id uuid PRIMARY KEY` |
| `FOREIGN KEY` | Referenz auf andere Tabelle | `REFERENCES users(id)` |
| `UNIQUE` | Wert darf nur einmal vorkommen | `email TEXT UNIQUE` |
| `NOT NULL` | Wert darf nicht leer sein | `name TEXT NOT NULL` |
| `CHECK` | Eigene Bedingung prüfen | `CHECK (age >= 0)` |

---

### Übung 6: Users-Tabelle erstellen

> **Ziel:** Eine Tabelle mit verschiedenen Datentypen und Constraints erstellen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** `\d users` die korrekte Tabellenstruktur anzeigt

Stelle sicher, dass du in der `kursapp`-Datenbank bist (Prompt zeigt `kursapp=#`). Falls nicht: `\c kursapp`

Erstelle die Users-Tabelle:

```sql
CREATE TABLE users (
    id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email    TEXT NOT NULL UNIQUE,
    name     TEXT NOT NULL,
    age      INTEGER CHECK (age >= 0),
    created  TIMESTAMPTZ DEFAULT now()
);
```

**Was passiert hier?**
- `id` bekommt automatisch eine UUID, wenn du keine angibst
- `email` muss angegeben werden (`NOT NULL`) und darf nicht doppelt vorkommen (`UNIQUE`)
- `name` muss angegeben werden (`NOT NULL`)
- `age` ist optional, darf aber nicht negativ sein (`CHECK`)
- `created` wird automatisch auf den aktuellen Zeitpunkt gesetzt

**Überprüfung:** Schau dir die Tabellenstruktur an:

```sql
\d users
```

Du solltest die Spalten mit ihren Typen und Constraints sehen.

### Wissensfrage 4

Welche Constraints hat die `users`-Tabelle? Nenne sie mit den zugehörigen Spalten.

<details>
<summary>Antwort anzeigen</summary>

Die `users`-Tabelle hat folgende Constraints:

| Constraint | Spalte | Bedeutung |
|-----------|--------|-----------|
| `PRIMARY KEY` | `id` | Eindeutige Identifikation (impliziert auch `NOT NULL` und `UNIQUE`) |
| `NOT NULL` | `email` | Email muss angegeben werden |
| `UNIQUE` | `email` | Keine doppelten Email-Adressen |
| `NOT NULL` | `name` | Name muss angegeben werden |
| `CHECK` | `age` | Alter muss >= 0 sein (falls angegeben) |

Beachte: `PRIMARY KEY` ist eine Kombination aus `NOT NULL` und `UNIQUE`. Die `id`-Spalte hat also effektiv drei Constraints.

</details>

---

### Übung 7: Orders-Tabelle mit Foreign Key

> **Ziel:** Eine zweite Tabelle mit FOREIGN KEY erstellen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** `\d orders` die Referenz auf `users(id)` zeigt

Erstelle die Orders-Tabelle:

```sql
CREATE TABLE orders (
    id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id  uuid NOT NULL REFERENCES users(id),
    total    INTEGER NOT NULL CHECK (total > 0),
    status   TEXT DEFAULT 'pending'
);
```

**Was macht der FOREIGN KEY?** `REFERENCES users(id)` stellt sicher, dass jede Order einem existierenden User gehört. PostgreSQL lehnt eine Order ab, wenn die `user_id` nicht in der `users`-Tabelle existiert. So werden ungültige Beziehungen verhindert.

**Überprüfung:**

```sql
\dt
```

Du solltest jetzt beide Tabellen sehen:

```
         List of relations
 Schema |  Name  | Type  |  Owner
--------+--------+-------+----------
 public | users  | table | postgres
 public | orders | table | postgres
```

Schau dir auch die Struktur der Orders-Tabelle an:

```sql
\d orders
```

<details>
<summary>Musterlösung anzeigen</summary>

Die Ausgabe von `\d orders` zeigt die Spalten, Typen und Constraints:

```
                        Table "public.orders"
 Column  |  Type  | Collation | Nullable |    Default
---------+--------+-----------+----------+--------------------
 id      | uuid   |           | not null | gen_random_uuid()
 user_id | uuid   |           | not null |
 total   | integer|           | not null |
 status  | text   |           |          | 'pending'::text

Indexes:
    "orders_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "orders_total_check" CHECK (total > 0)
Foreign-key constraints:
    "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
```

</details>

---

### Übung 8: Events-Tabelle mit jsonb (Optional)

> **Ziel:** Den jsonb-Datentyp ausprobieren
> **Zeitbedarf:** ca. 5 Minuten
> **Du bist fertig, wenn:** Die `events`-Tabelle existiert

Diese Übung ist ein **Ausblick** – `jsonb` ist ein mächtiger Datentyp, den PostgreSQL zusätzlich zu klassischen Spalten bietet. Heute nutzen wir primär klassische Spalten, aber es ist gut zu wissen, dass es `jsonb` gibt.

```sql
CREATE TABLE events (
    id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type    TEXT NOT NULL,
    payload jsonb NOT NULL
);
```

Mit `jsonb` kann PostgreSQL beliebige JSON-Strukturen speichern und sogar darauf indexieren. Das ist nützlich für Logs, Konfigurationen oder variable Felder.

**Überprüfung:** `\dt` sollte jetzt drei Tabellen zeigen (`users`, `orders`, `events`).

---

## Teil 4: Daten einfügen und abfragen

### Übung 9: Daten einfügen

> **Ziel:** Daten in die Tabellen einfügen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** `SELECT * FROM users;` mindestens 3 Zeilen zeigt

Füge einige Test-User ein:

```sql
INSERT INTO users (email, name, age)
VALUES ('max@example.com', 'Max Muster', 28);

INSERT INTO users (email, name, age)
VALUES ('anna@example.com', 'Anna Schmidt', 34);

INSERT INTO users (email, name)
VALUES ('tom@example.com', 'Tom Berger');
```

> **Beachte:** Bei Tom haben wir kein `age` angegeben – das ist erlaubt, weil `age` keinen `NOT NULL`-Constraint hat. Die Spalten `id` und `created` werden automatisch befüllt (UUID und aktueller Zeitstempel).

Zeige alle User an:

```sql
SELECT * FROM users;
```

Du solltest drei Zeilen sehen, mit automatisch generierten UUIDs und Zeitstempeln.

**Jetzt eine Order einfügen:** Dafür brauchst du die UUID eines existierenden Users.

```sql
-- Zuerst die IDs der User anzeigen
SELECT id, name FROM users;
```

Kopiere eine der angezeigten UUIDs und verwende sie im nächsten INSERT:

```sql
-- Ersetze die UUID durch eine echte ID aus deiner users-Tabelle!
INSERT INTO orders (user_id, total)
VALUES ('hier-die-uuid-einsetzen', 4999);
```

> **Tipp:** Du kannst auch einen Subquery nutzen, um die UUID nicht manuell kopieren zu müssen:
> ```sql
> INSERT INTO orders (user_id, total)
> VALUES ((SELECT id FROM users WHERE email = 'max@example.com'), 4999);
> ```

---

### Übung 10: Constraints testen

> **Ziel:** Verstehen, wie Constraints fehlerhafte Daten verhindern
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Du 4 verschiedene Constraint-Fehler provoziert hast

Jetzt testen wir gezielt, ob die Constraints funktionieren. **Jeder dieser INSERTs soll fehlschlagen** – das ist beabsichtigt!

**1. UNIQUE testen – Doppelte Email:**

```sql
INSERT INTO users (email, name)
VALUES ('max@example.com', 'Anderer Max');
```

**2. NOT NULL testen – Fehlender Name:**

```sql
INSERT INTO users (email)
VALUES ('test@example.com');
```

**3. CHECK testen – Negatives Alter:**

```sql
INSERT INTO users (email, name, age)
VALUES ('neg@example.com', 'Test User', -5);
```

**4. FOREIGN KEY testen – Nicht existierender User:**

```sql
INSERT INTO orders (user_id, total)
VALUES ('00000000-0000-0000-0000-000000000000', 100);
```

<details>
<summary>Musterlösung anzeigen</summary>

Die erwarteten Fehlermeldungen:

**1. UNIQUE:**
```
ERROR:  duplicate key value violates unique constraint "users_email_key"
DETAIL:  Key (email)=(max@example.com) already exists.
```

**2. NOT NULL:**
```
ERROR:  null value in column "name" of relation "users" violates not-null constraint
```

**3. CHECK:**
```
ERROR:  new row for relation "users" violates check constraint "users_age_check"
```

**4. FOREIGN KEY:**
```
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_user_id_fkey"
DETAIL:  Key (user_id)=(00000000-0000-0000-0000-000000000000) is not present in table "users".
```

Das ist genau das gewünschte Verhalten – die Datenbank schützt eure Daten vor ungültigen Einträgen.

</details>

---

### Übung 11: Daten abfragen

> **Ziel:** Verschiedene SELECT-Queries schreiben
> **Zeitbedarf:** ca. 5 Minuten
> **Du bist fertig, wenn:** Du 3 verschiedene SELECT-Abfragen ausgeführt hast

Probiere verschiedene Abfragen aus:

```sql
-- Alle Spalten aller User
SELECT * FROM users;

-- Nur Name und Email
SELECT name, email FROM users;

-- User mit bestimmtem Namen
SELECT * FROM users WHERE name = 'Max Muster';

-- User mit Alter über 30
SELECT name, age FROM users WHERE age > 30;

-- Alle Orders anzeigen
SELECT * FROM orders;
```

> **Hinweis:** Bei der `WHERE age > 30`-Abfrage wird Tom nicht angezeigt, weil sein `age`-Wert `NULL` ist. `NULL` ist kein Wert, sondern bedeutet "unbekannt" – Vergleiche mit `NULL` ergeben weder `true` noch `false`.

---

## Teil 5: pgAdmin kennenlernen

### Übung 12: Mit pgAdmin verbinden

> **Ziel:** pgAdmin starten und die Datenbank visuell erkunden
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Du deine Tabellen in pgAdmin siehst und eine Query ausgeführt hast

pgAdmin ist eine grafische Oberfläche für PostgreSQL. Sie macht es einfacher, die Datenbank zu erkunden, ohne alle Befehle auswendig kennen zu müssen.

**Schritt 1: pgAdmin starten**

- **Windows:** pgAdmin wurde mit dem PostgreSQL-Installer installiert. Suche im Startmenü nach "pgAdmin".
- **macOS / Linux:** Falls nicht installiert, lade pgAdmin von [pgadmin.org](https://www.pgadmin.org/download/) herunter.

Beim ersten Start wirst du nach einem Master-Passwort gefragt – das ist ein separates Passwort für pgAdmin selbst (nicht das PostgreSQL-Passwort).

**Schritt 2: Server-Verbindung anlegen**

Falls nicht automatisch eingerichtet:
1. Rechtsklick auf "Servers" → "Register" → "Server..."
2. Tab **General:** Name = `Lokal` (oder ein beliebiger Name)
3. Tab **Connection:**
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: Dein Installer-Passwort
4. "Save" klicken

**Schritt 3: Datenbank erkunden**

Navigiere in der linken Seitenleiste:

```
Servers
  └── Lokal
        └── Databases
              └── kursapp
                    └── Schemas
                          └── public
                                └── Tables
                                      ├── users
                                      ├── orders
                                      └── events
```

Klicke mit Rechtsklick auf `users` → "View/Edit Data" → "All Rows" – du siehst deine eingefügten Daten.

**Schritt 4: Query Tool nutzen**

1. Klicke auf `kursapp` in der Seitenleiste
2. Öffne das Query Tool: Menü "Tools" → "Query Tool"
3. Gib ein: `SELECT * FROM users;`
4. Klicke auf den Play-Button (▶) oder drücke F5

### Wissensfrage 5

Wann würdest du `psql` verwenden und wann `pgAdmin`?

<details>
<summary>Antwort anzeigen</summary>

| psql | pgAdmin |
|------|---------|
| Schnelle Befehle im Terminal | Visuelles Erkunden der Datenbank |
| Scripting und Automatisierung | Tabellenstruktur grafisch betrachten |
| Wenn du schon im Terminal arbeitest | Wenn du die Datenbank kennenlernen willst |
| Profis nutzen es im Alltag | Gut zum Lernen und für komplexe Queries |

Beide verbinden sich zum selben PostgreSQL-Server – es sind nur unterschiedliche Werkzeuge. Du kannst frei wählen, was dir besser liegt.

</details>

---

## Zusammenfassung

### Was du heute gelernt hast

| Konzept | Beschreibung | Beispiel |
|---------|-------------|---------|
| **Installation** | PostgreSQL lokal installieren und starten | `brew install postgresql@17` |
| **psql** | Terminal-Client für PostgreSQL | `psql -h localhost -U postgres` |
| **Meta-Befehle** | psql-eigene Befehle mit Backslash | `\l`, `\dt`, `\d users` |
| **CREATE DATABASE** | Neue Datenbank anlegen | `CREATE DATABASE kursapp;` |
| **CREATE TABLE** | Tabelle mit Datentypen definieren | `id uuid PRIMARY KEY` |
| **Constraints** | Datenqualität sicherstellen | `NOT NULL`, `UNIQUE`, `CHECK`, `REFERENCES` |
| **INSERT** | Daten einfügen | `INSERT INTO users (...) VALUES (...);` |
| **SELECT** | Daten abfragen | `SELECT * FROM users WHERE ...;` |
| **pgAdmin** | Grafische Oberfläche für PostgreSQL | Server-Verbindung → Query Tool |

### Ausblick: Tag 2

Morgen verbinden wir **FastAPI mit PostgreSQL**! Ihr lernt:

- **SQLAlchemy 2.0** als ORM (Object-Relational Mapping) für Python
- **Alembic** für Datenbank-Migrationen
- **Konfiguration und Secrets** sauber trennen

Stellt sicher, dass euer PostgreSQL-Server läuft und ihr euch mit `psql` verbinden könnt – das ist die Voraussetzung für morgen.

---

## Bonus

### Bonus 1: Connection Strings verstehen

In der Praxis verbinden sich Anwendungen über einen **Connection String** mit der Datenbank. So ist er aufgebaut:

```
postgresql://kursuser:kurspass@localhost:5432/kursapp
\________/   \______/ \______/ \_______/ \__/ \____/
 Protokoll    User    Passwort   Host    Port  Datenbank
```

| Teil | Beschreibung | Wert |
|------|-------------|------|
| Protokoll | Datenbanktyp | `postgresql://` |
| User | Benutzername | `kursuser` |
| Passwort | Passwort des Benutzers | `kurspass` |
| Host | Server-Adresse | `localhost` (= dein Rechner) |
| Port | PostgreSQL-Standard-Port | `5432` |
| Datenbank | Name der Ziel-Datenbank | `kursapp` |

> **Wichtig:** Dieser Connection String kommt in eine `.env`-Datei oder einen Secret Manager – **niemals direkt in den Code committen!**

---

### Bonus 2: Schema für eure App entwerfen

**Aufgabe:** Denke an die App aus Woche 6 (z.B. den Mini-Hub / Bookmark Manager). Entwirf 2–3 Tabellen mit passenden Datentypen und Constraints. Schreibe die `CREATE TABLE`-Statements.

**Hinweis-Tabelle:**

| Entity | Mögliche Spalten |
|--------|-----------------|
| items | id (uuid), title (text), url (text), favorite (boolean), created_at (timestamptz) |
| tags | id (uuid), name (text, UNIQUE) |
| item_tags | item_id (uuid, FK), tag_id (uuid, FK) |

<details>
<summary>Musterlösung anzeigen</summary>

```sql
-- Items-Tabelle (z.B. Bookmarks)
CREATE TABLE items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    url         TEXT NOT NULL,
    favorite    BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tags-Tabelle
CREATE TABLE tags (
    id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name  TEXT NOT NULL UNIQUE
);

-- Verknüpfungstabelle (n:m Beziehung)
CREATE TABLE item_tags (
    item_id  uuid NOT NULL REFERENCES items(id),
    tag_id   uuid NOT NULL REFERENCES tags(id),
    PRIMARY KEY (item_id, tag_id)
);
```

**Erklärung der Verknüpfungstabelle:** Ein Item kann mehrere Tags haben und ein Tag kann zu mehreren Items gehören – das ist eine n:m-Beziehung (many-to-many). Die `item_tags`-Tabelle verbindet beide über Foreign Keys. Der zusammengesetzte Primary Key `(item_id, tag_id)` stellt sicher, dass dieselbe Kombination nur einmal existiert.

</details>

---

## Checkliste

Bevor du in den Feierabend gehst – hast du alles geschafft?

- [ ] PostgreSQL ist installiert und der Server läuft
- [ ] Du kannst dich mit `psql` verbinden
- [ ] Du kennst die wichtigsten psql-Befehle (`\l`, `\c`, `\dt`, `\d`, `\du`, `\q`)
- [ ] Du hast eine eigene Datenbank (`kursapp`) angelegt
- [ ] Du hast Tabellen mit Datentypen und Constraints erstellt
- [ ] Du verstehst, was PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL und CHECK tun
- [ ] Du hast Daten eingefügt und abgefragt
- [ ] Du hast Constraint-Verletzungen provoziert und die Fehlermeldungen gesehen
- [ ] Du kannst pgAdmin verwenden, um die Datenbank visuell zu erkunden

**Alles abgehakt? Dann bist du bereit für Tag 2!**
