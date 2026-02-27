---
title: SQL Cheat Sheet
tags:
  - SQL
  - Datenbanken
  - Cheat-Sheet
---

# SQL Cheat Sheet

Kompakte Referenz fuer die wichtigsten SQL-Befehle und -Konzepte.

---

## Grundlegende Abfragen

```sql
-- Alle Spalten abfragen
SELECT * FROM kunden;

-- Bestimmte Spalten
SELECT vorname, nachname, email FROM kunden;

-- Alias fuer Spalten
SELECT vorname AS "Vorname", nachname AS "Nachname" FROM kunden;

-- Eindeutige Werte
SELECT DISTINCT stadt FROM kunden;
```

### Filtern mit WHERE

```sql
-- Vergleichsoperatoren
SELECT * FROM produkte WHERE preis > 50;
SELECT * FROM produkte WHERE preis BETWEEN 10 AND 50;
SELECT * FROM produkte WHERE kategorie IN ('Elektronik', 'Buecher');
SELECT * FROM kunden WHERE email IS NULL;

-- Textsuche mit LIKE
SELECT * FROM kunden WHERE nachname LIKE 'M%';      -- Beginnt mit M
SELECT * FROM kunden WHERE email LIKE '%@gmail.com'; -- Endet mit @gmail.com
SELECT * FROM kunden WHERE name LIKE '_a%';          -- Zweiter Buchstabe ist a

-- Logische Operatoren
SELECT * FROM produkte
WHERE preis > 20 AND kategorie = 'Elektronik';

SELECT * FROM produkte
WHERE kategorie = 'Buecher' OR kategorie = 'Musik';

SELECT * FROM produkte
WHERE NOT kategorie = 'Sonstiges';
```

### Sortieren und Limitieren

```sql
-- Sortieren
SELECT * FROM produkte ORDER BY preis ASC;       -- Aufsteigend (Standard)
SELECT * FROM produkte ORDER BY preis DESC;      -- Absteigend
SELECT * FROM produkte ORDER BY kategorie, preis DESC;  -- Mehrere Spalten

-- Ergebnisse begrenzen
SELECT * FROM produkte ORDER BY preis DESC LIMIT 10;

-- Mit Offset (fuer Paginierung)
SELECT * FROM produkte ORDER BY id LIMIT 10 OFFSET 20;
```

---

## Daten veraendern

=== "INSERT"

    ```sql
    -- Einzelnen Datensatz einfuegen
    INSERT INTO kunden (vorname, nachname, email)
    VALUES ('Max', 'Mustermann', 'max@mail.de');

    -- Mehrere Datensaetze
    INSERT INTO kunden (vorname, nachname, email)
    VALUES
        ('Anna', 'Schmidt', 'anna@mail.de'),
        ('Tom', 'Mueller', 'tom@mail.de'),
        ('Lisa', 'Weber', 'lisa@mail.de');
    ```

=== "UPDATE"

    ```sql
    -- Einzelnen Datensatz aktualisieren
    UPDATE kunden
    SET email = 'neu@mail.de'
    WHERE id = 1;

    -- Mehrere Spalten aktualisieren
    UPDATE produkte
    SET preis = preis * 0.9, aktualisiert_am = CURRENT_TIMESTAMP
    WHERE kategorie = 'Sale';
    ```

    !!! warning "WHERE nicht vergessen!"
        Ein `UPDATE` ohne `WHERE` aendert **alle** Datensaetze der Tabelle.

=== "DELETE"

    ```sql
    -- Datensaetze loeschen
    DELETE FROM kunden WHERE id = 5;

    -- Mit Bedingung
    DELETE FROM bestellungen
    WHERE status = 'storniert'
    AND erstellt_am < '2024-01-01';

    -- Alle Datensaetze loeschen (Tabelle bleibt)
    DELETE FROM log_eintraege;
    ```

    !!! warning "WHERE nicht vergessen!"
        Ein `DELETE` ohne `WHERE` loescht **alle** Datensaetze der Tabelle.

---

## Tabellen verwalten

=== "CREATE TABLE"

    ```sql
    CREATE TABLE kunden (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vorname TEXT NOT NULL,
        nachname TEXT NOT NULL,
        email TEXT UNIQUE,
        alter_jahre INTEGER CHECK(alter_jahre >= 0),
        stadt TEXT DEFAULT 'Unbekannt',
        erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE bestellungen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kunden_id INTEGER NOT NULL,
        betrag REAL NOT NULL,
        status TEXT DEFAULT 'offen',
        FOREIGN KEY (kunden_id) REFERENCES kunden(id)
    );
    ```

=== "ALTER TABLE"

    ```sql
    -- Spalte hinzufuegen
    ALTER TABLE kunden ADD COLUMN telefon TEXT;

    -- Spalte umbenennen
    ALTER TABLE kunden RENAME COLUMN telefon TO tel;

    -- Tabelle umbenennen
    ALTER TABLE kunden RENAME TO klientel;
    ```

=== "DROP TABLE"

    ```sql
    -- Tabelle loeschen
    DROP TABLE IF EXISTS alte_tabelle;
    ```

### Wichtige Datentypen

| Typ | Beschreibung | Beispiel |
|---|---|---|
| `INTEGER` | Ganzzahl | `42` |
| `REAL` / `FLOAT` | Fliesskommazahl | `3.14` |
| `TEXT` / `VARCHAR(n)` | Zeichenkette | `'Hallo Welt'` |
| `BOOLEAN` | Wahrheitswert | `TRUE` / `FALSE` |
| `DATE` | Datum | `'2024-06-15'` |
| `TIMESTAMP` | Datum + Uhrzeit | `'2024-06-15 14:30:00'` |
| `BLOB` | Binaerdaten | Bilder, Dateien |

---

## JOINs

=== "INNER JOIN"

    Gibt nur Datensaetze zurueck, die in **beiden** Tabellen uebereinstimmen.

    ```sql
    SELECT k.vorname, k.nachname, b.betrag, b.status
    FROM kunden k
    INNER JOIN bestellungen b ON k.id = b.kunden_id;
    ```

    ```
    kunden          bestellungen         Ergebnis
    +----+------+   +----+-----------+   +------+--------+
    | id | name |   | id | kunden_id |   | name | betrag |
    +----+------+   +----+-----------+   +------+--------+
    | 1  | Max  |   | 1  | 1         |   | Max  | 50.00  |
    | 2  | Anna |   | 2  | 1         |   | Max  | 30.00  |
    | 3  | Tom  |   | 3  | 3         |   | Tom  | 20.00  |
    +----+------+   +----+-----------+   +------+--------+
                    Anna hat keine Bestellung -> nicht im Ergebnis
    ```

=== "LEFT JOIN"

    Gibt **alle** Datensaetze der linken Tabelle zurueck, auch ohne Uebereinstimmung.

    ```sql
    SELECT k.vorname, k.nachname, b.betrag
    FROM kunden k
    LEFT JOIN bestellungen b ON k.id = b.kunden_id;
    ```

    ```
    Ergebnis
    +------+--------+
    | name | betrag |
    +------+--------+
    | Max  | 50.00  |
    | Max  | 30.00  |
    | Anna | NULL   |   <- Anna dabei, aber ohne Bestellung
    | Tom  | 20.00  |
    +------+--------+
    ```

=== "RIGHT JOIN"

    Gibt **alle** Datensaetze der rechten Tabelle zurueck, auch ohne Uebereinstimmung.

    ```sql
    SELECT k.vorname, b.betrag, b.status
    FROM kunden k
    RIGHT JOIN bestellungen b ON k.id = b.kunden_id;
    ```

    !!! info "Hinweis"
        SQLite unterstuetzt kein `RIGHT JOIN`. Verwende stattdessen `LEFT JOIN` mit vertauschten Tabellen.

---

## Aggregation

```sql
-- Anzahl
SELECT COUNT(*) FROM kunden;
SELECT COUNT(DISTINCT stadt) FROM kunden;

-- Summe, Durchschnitt, Min, Max
SELECT
    SUM(betrag) AS gesamtumsatz,
    AVG(betrag) AS durchschnitt,
    MIN(betrag) AS kleinste_bestellung,
    MAX(betrag) AS groesste_bestellung
FROM bestellungen;
```

### GROUP BY und HAVING

```sql
-- Umsatz pro Kunde
SELECT
    k.vorname,
    k.nachname,
    COUNT(b.id) AS anzahl_bestellungen,
    SUM(b.betrag) AS gesamtumsatz
FROM kunden k
LEFT JOIN bestellungen b ON k.id = b.kunden_id
GROUP BY k.id, k.vorname, k.nachname;

-- Nur Kunden mit mehr als 3 Bestellungen (HAVING filtert nach GROUP BY)
SELECT
    kunden_id,
    COUNT(*) AS anzahl,
    SUM(betrag) AS gesamt
FROM bestellungen
GROUP BY kunden_id
HAVING COUNT(*) > 3
ORDER BY gesamt DESC;
```

!!! info "WHERE vs. HAVING"
    - `WHERE` filtert **einzelne Zeilen** vor der Gruppierung
    - `HAVING` filtert **Gruppen** nach der Aggregation

---

## SQLite mit Python

```python
import sqlite3

# Verbindung herstellen (erstellt Datei falls noetig)
conn = sqlite3.connect("meine_datenbank.db")
cursor = conn.cursor()

# Tabelle erstellen
cursor.execute("""
    CREATE TABLE IF NOT EXISTS aufgaben (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titel TEXT NOT NULL,
        erledigt BOOLEAN DEFAULT FALSE,
        erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# Daten einfuegen (mit Parametern gegen SQL-Injection)
cursor.execute(
    "INSERT INTO aufgaben (titel) VALUES (?)",
    ("Python lernen",)
)

# Mehrere Datensaetze einfuegen
aufgaben = [
    ("Git lernen",),
    ("SQL lernen",),
    ("Docker lernen",),
]
cursor.executemany(
    "INSERT INTO aufgaben (titel) VALUES (?)",
    aufgaben
)

# Daten abfragen
cursor.execute("SELECT * FROM aufgaben WHERE erledigt = FALSE")
offene_aufgaben = cursor.fetchall()

for aufgabe in offene_aufgaben:
    print(f"[{aufgabe[0]}] {aufgabe[1]}")

# Als Dictionary abrufen
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT * FROM aufgaben")
for zeile in cursor.fetchall():
    print(zeile["titel"], zeile["erledigt"])

# Aenderungen speichern und Verbindung schliessen
conn.commit()
conn.close()
```

!!! danger "SQL-Injection vermeiden"
    Verwende **immer** Parameter (`?`) statt String-Formatierung:

    ```python
    # FALSCH - anfaellig fuer SQL-Injection
    cursor.execute(f"SELECT * FROM kunden WHERE name = '{name}'")

    # RICHTIG - sicher mit Parametern
    cursor.execute("SELECT * FROM kunden WHERE name = ?", (name,))
    ```
