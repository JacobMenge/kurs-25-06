---
title: Python Cheat Sheet
tags:
  - Python
  - Cheat-Sheet
---

# Python Cheat Sheet

Kompakte Referenz der wichtigsten Python-Konzepte und -Befehle.

---

## Datentypen

=== "Strings"

    ```python
    # Erstellen
    name = "Hallo Welt"
    mehrzeilig = """Zeile 1
    Zeile 2"""

    # Wichtige Methoden
    name.upper()          # "HALLO WELT"
    name.lower()          # "hallo welt"
    name.strip()          # Leerzeichen entfernen
    name.split(" ")       # ["Hallo", "Welt"]
    name.replace("Welt", "Python")  # "Hallo Python"
    name.startswith("Ha") # True
    name.find("Welt")     # 6

    # f-Strings (Formatierung)
    alter = 25
    text = f"Ich bin {alter} Jahre alt"

    # Slicing
    name[0:5]   # "Hallo"
    name[-4:]   # "Welt"
    name[::2]   # "HloWl"
    ```

=== "Listen"

    ```python
    # Erstellen
    zahlen = [1, 2, 3, 4, 5]
    gemischt = [1, "zwei", 3.0, True]

    # Zugriff & Slicing
    zahlen[0]     # 1
    zahlen[-1]    # 5
    zahlen[1:3]   # [2, 3]

    # Wichtige Methoden
    zahlen.append(6)       # Hinzufuegen am Ende
    zahlen.insert(0, 0)    # An Position einfuegen
    zahlen.remove(3)       # Wert entfernen
    zahlen.pop()           # Letztes Element entfernen
    zahlen.sort()          # Sortieren (in-place)
    zahlen.reverse()       # Umkehren
    len(zahlen)            # Laenge

    # List Comprehension
    quadrate = [x**2 for x in range(10)]
    gerade = [x for x in range(20) if x % 2 == 0]
    ```

=== "Dictionaries"

    ```python
    # Erstellen
    person = {
        "name": "Max",
        "alter": 30,
        "stadt": "Berlin"
    }

    # Zugriff
    person["name"]            # "Max"
    person.get("email", "-")  # "-" (Standardwert)

    # Aendern & Hinzufuegen
    person["alter"] = 31
    person["email"] = "max@mail.de"

    # Wichtige Methoden
    person.keys()      # dict_keys(["name", "alter", ...])
    person.values()    # dict_values(["Max", 31, ...])
    person.items()     # dict_items([("name", "Max"), ...])
    person.pop("stadt") # Entfernen und zurueckgeben

    # Dictionary Comprehension
    quadrate = {x: x**2 for x in range(5)}
    ```

=== "Tuples"

    ```python
    # Erstellen (unveraenderlich)
    koordinaten = (10.5, 20.3)
    rgb = (255, 128, 0)

    # Zugriff
    koordinaten[0]   # 10.5
    x, y = koordinaten  # Unpacking

    # Tuple mit einem Element
    einzel = (42,)   # Komma notwendig!

    # Nuetzlich fuer
    # - Rueckgabewerte von Funktionen
    # - Dictionary-Keys
    # - Unveraenderliche Sequenzen
    ```

=== "Sets"

    ```python
    # Erstellen (keine Duplikate, unsortiert)
    farben = {"rot", "gruen", "blau"}
    aus_liste = set([1, 2, 2, 3, 3])  # {1, 2, 3}

    # Wichtige Methoden
    farben.add("gelb")
    farben.remove("rot")
    farben.discard("pink")  # Kein Fehler wenn nicht vorhanden

    # Mengenoperationen
    a = {1, 2, 3}
    b = {2, 3, 4}
    a | b   # Vereinigung: {1, 2, 3, 4}
    a & b   # Schnittmenge: {2, 3}
    a - b   # Differenz: {1}
    ```

---

## Kontrollstrukturen

=== "if / else"

    ```python
    alter = 18

    if alter >= 18:
        print("Volljaehrig")
    elif alter >= 16:
        print("Teilweise muendig")
    else:
        print("Minderjaehrig")

    # Ternary Operator
    status = "Erwachsen" if alter >= 18 else "Kind"

    # Logische Operatoren
    if alter >= 18 and alter < 65:
        print("Erwerbsfaehig")

    if not ist_gesperrt or ist_admin:
        print("Zugang erlaubt")
    ```

=== "for-Schleife"

    ```python
    # Ueber Liste iterieren
    fruechte = ["Apfel", "Birne", "Kirsche"]
    for frucht in fruechte:
        print(frucht)

    # Mit Index
    for i, frucht in enumerate(fruechte):
        print(f"{i}: {frucht}")

    # Range
    for i in range(5):       # 0, 1, 2, 3, 4
        print(i)
    for i in range(2, 10, 2): # 2, 4, 6, 8
        print(i)

    # Ueber Dictionary
    person = {"name": "Max", "alter": 30}
    for key, value in person.items():
        print(f"{key}: {value}")
    ```

=== "while-Schleife"

    ```python
    zaehler = 0
    while zaehler < 5:
        print(zaehler)
        zaehler += 1

    # break und continue
    while True:
        eingabe = input("Befehl: ")
        if eingabe == "quit":
            break        # Schleife verlassen
        if eingabe == "":
            continue     # Naechste Iteration
        print(f"Ausfuehren: {eingabe}")
    ```

=== "List Comprehension"

    ```python
    # Grundform
    zahlen = [x for x in range(10)]

    # Mit Bedingung
    gerade = [x for x in range(20) if x % 2 == 0]

    # Mit Transformation
    namen = ["max", "anna", "tom"]
    gross = [n.capitalize() for n in namen]

    # Verschachtelt
    matrix = [[i * j for j in range(3)] for i in range(3)]

    # Dict Comprehension
    wort_laengen = {w: len(w) for w in namen}

    # Set Comprehension
    einzigartig = {x % 5 for x in range(20)}
    ```

---

## Funktionen

```python
# Einfache Funktion
def begruessen(name):
    return f"Hallo, {name}!"

# Standardwerte
def potenz(basis, exponent=2):
    return basis ** exponent

potenz(3)      # 9
potenz(3, 3)   # 27

# Beliebig viele Argumente
def summe(*zahlen):
    return sum(zahlen)

summe(1, 2, 3, 4)  # 10

# Keyword-Argumente
def profil(**daten):
    for key, val in daten.items():
        print(f"{key}: {val}")

profil(name="Max", alter=30, stadt="Berlin")

# Lambda-Funktionen
verdoppeln = lambda x: x * 2
sortiert = sorted(namen, key=lambda x: len(x))

# Type Hints
def addieren(a: int, b: int) -> int:
    return a + b
```

---

## Klassen & OOP

```python
class Tier:
    # Klassenattribut
    art = "Lebewesen"

    # Konstruktor
    def __init__(self, name: str, alter: int):
        self.name = name      # Instanzattribut
        self.alter = alter

    # Methode
    def vorstellen(self) -> str:
        return f"Ich bin {self.name}, {self.alter} Jahre alt."

    # String-Darstellung
    def __str__(self) -> str:
        return f"Tier({self.name})"

# Vererbung
class Hund(Tier):
    def __init__(self, name: str, alter: int, rasse: str):
        super().__init__(name, alter)
        self.rasse = rasse

    def bellen(self) -> str:
        return "Wuff!"

# Verwendung
hund = Hund("Rex", 5, "Schaeferhund")
print(hund.vorstellen())  # "Ich bin Rex, 5 Jahre alt."
print(hund.bellen())      # "Wuff!"
```

---

## Wichtige Built-in Funktionen

| Funktion | Beschreibung | Beispiel |
|---|---|---|
| `len()` | Laenge eines Objekts | `len([1,2,3])` --> `3` |
| `type()` | Typ eines Objekts | `type(42)` --> `<class 'int'>` |
| `range()` | Zahlensequenz erzeugen | `list(range(5))` --> `[0,1,2,3,4]` |
| `enumerate()` | Index + Wert | `list(enumerate(["a","b"]))` --> `[(0,"a"),(1,"b")]` |
| `zip()` | Listen zusammenfuehren | `list(zip([1,2],["a","b"]))` --> `[(1,"a"),(2,"b")]` |
| `map()` | Funktion auf alle anwenden | `list(map(str, [1,2,3]))` --> `["1","2","3"]` |
| `filter()` | Elemente filtern | `list(filter(lambda x: x>2, [1,2,3,4]))` --> `[3,4]` |
| `sorted()` | Sortierte Kopie | `sorted([3,1,2])` --> `[1,2,3]` |
| `reversed()` | Umgekehrte Reihenfolge | `list(reversed([1,2,3]))` --> `[3,2,1]` |
| `isinstance()` | Typenpruefung | `isinstance(42, int)` --> `True` |
| `input()` | Benutzereingabe | `name = input("Name: ")` |
| `print()` | Ausgabe | `print("Hallo", end="")` |
| `int()`, `str()`, `float()` | Typkonvertierung | `int("42")` --> `42` |
| `min()`, `max()`, `sum()` | Aggregation | `sum([1,2,3])` --> `6` |
| `abs()` | Absolutwert | `abs(-5)` --> `5` |
| `round()` | Runden | `round(3.14159, 2)` --> `3.14` |

---

## Dateien lesen und schreiben

=== "Lesen"

    ```python
    # Gesamte Datei lesen
    with open("datei.txt", "r", encoding="utf-8") as f:
        inhalt = f.read()

    # Zeilenweise lesen
    with open("datei.txt", "r", encoding="utf-8") as f:
        for zeile in f:
            print(zeile.strip())

    # Alle Zeilen als Liste
    with open("datei.txt", "r", encoding="utf-8") as f:
        zeilen = f.readlines()
    ```

=== "Schreiben"

    ```python
    # Datei schreiben (ueberschreibt)
    with open("ausgabe.txt", "w", encoding="utf-8") as f:
        f.write("Erste Zeile\n")
        f.write("Zweite Zeile\n")

    # Datei anhaengen
    with open("log.txt", "a", encoding="utf-8") as f:
        f.write("Neuer Eintrag\n")
    ```

=== "JSON"

    ```python
    import json

    # JSON lesen
    with open("daten.json", "r", encoding="utf-8") as f:
        daten = json.load(f)

    # JSON schreiben
    with open("daten.json", "w", encoding="utf-8") as f:
        json.dump(daten, f, indent=2, ensure_ascii=False)

    # String <-> JSON
    json_str = json.dumps({"name": "Max"})
    obj = json.loads('{"name": "Max"}')
    ```

=== "CSV"

    ```python
    import csv

    # CSV lesen
    with open("daten.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for zeile in reader:
            print(zeile["name"], zeile["alter"])

    # CSV schreiben
    with open("ausgabe.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Alter"])
        writer.writerow(["Max", 30])
    ```

---

## Virtual Environment

| Befehl | Beschreibung |
|---|---|
| `python -m venv venv` | Neues Virtual Environment erstellen |
| `source venv/bin/activate` | Aktivieren (Linux/macOS) |
| `venv\Scripts\activate` | Aktivieren (Windows) |
| `deactivate` | Deaktivieren |
| `pip install paket` | Paket installieren |
| `pip install -r requirements.txt` | Alle Abhaengigkeiten installieren |
| `pip freeze > requirements.txt` | Abhaengigkeiten speichern |
| `pip list` | Installierte Pakete anzeigen |
| `pip uninstall paket` | Paket deinstallieren |

!!! tip "Best Practice"
    Erstelle immer ein Virtual Environment pro Projekt, um Abhaengigkeitskonflikte zu vermeiden. Fuege `venv/` in die `.gitignore` ein.
