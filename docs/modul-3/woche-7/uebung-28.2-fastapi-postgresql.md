---
tags:
  - PostgreSQL
  - Datenbanken
  - MongoDB
  - FastAPI
---
# FastAPI & PostgreSQL – Praktische Übungen

## Übersicht

In dieser Übung verbindest du FastAPI mit der PostgreSQL-Datenbank, die du gestern eingerichtet hast:

- **Projekt aufsetzen** - Python-Projekt mit FastAPI, SQLAlchemy und Alembic einrichten
- **SQLAlchemy-Modelle definieren** - ORM-Modelle für die bestehende kursapp-Datenbank
- **Pydantic-Schemas erstellen** - Request/Response-Validierung getrennt von der DB-Schicht
- **CRUD-Endpunkte implementieren** - FastAPI-Endpoints für Users und Orders
- **Alembic-Migrationen einrichten** - Schema-Änderungen versioniert verwalten
- **Konfiguration und Secrets** - Umgebungsvariablen sauber vom Code trennen

Diese Übung baut auf dem PostgreSQL-Setup von gestern (Tag 1) auf – deine `kursapp`-Datenbank mit `users`- und `orders`-Tabellen ist die Grundlage. Aus Woche 6 kennst du bereits FastAPI, Pydantic und uvicorn.

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Architektur & ORM-Grundlagen | 10 min (lesen) |
| **Teil 1** | Projekt-Setup & Datenbankverbindung | 25 min |
| **Teil 2** | SQLAlchemy-Modelle & Pydantic-Schemas | 25 min |
| **Teil 3** | CRUD-Endpunkte mit FastAPI | 25 min |
| **Teil 4** | Migrationen mit Alembic | 25 min |
| **Teil 5** | Konfiguration & Secrets (.env) | 15 min |
| | **Gesamt** | **ca. 2–2,5 Stunden** |

**Minimalpfad (ca. 90 Minuten):** Teil 1 (Projekt-Setup), Teil 2 (Modelle & Schemas), Teil 3 (CRUD-Endpunkte). Alembic und .env-Formalisierung sind optional, werden aber für das Wochenprojekt empfohlen.

---

## Rückblick: Architektur & ORM-Grundlagen

Bevor wir loslegen, ein kurzer Rückblick auf die wichtigsten Punkte vom Vormittag.

### Euer Stack heute

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph LR
    subgraph presentation ["Presentation Tier"]
        R["🖥️ <b>React</b><br/>Frontend"]
    end
    subgraph logic ["Logic Tier"]
        F["⚙️ <b>FastAPI</b><br/>Backend + ORM"]
    end
    subgraph data ["Data Tier"]
        P["🐘 <b>PostgreSQL</b><br/>Datenbank"]
    end
    R <-->|HTTP + JSON| F
    F <-->|SQL| P
```

> **Goldene Regel:** React spricht **nur** mit FastAPI (HTTP + JSON) – **niemals** direkt mit der Datenbank! Datenbank-Credentials gehören ins Backend, nicht ins Frontend.

### SQL vs ORM

Die gleiche Abfrage – einmal als SQL, einmal als SQLAlchemy-ORM:

```sql
-- Raw SQL
SELECT * FROM users WHERE email = 'max@example.com';
```

```python
# SQLAlchemy ORM
user = db.query(User).filter(User.email == "max@example.com").first()
```

| Aspekt | Raw SQL | ORM (SQLAlchemy) |
|--------|---------|------------------|
| Kontrolle | Volle Kontrolle über jede Query | ORM generiert SQL |
| Produktivität | Mehr Boilerplate | Weniger Code, automatisches Mapping |
| Typ-Sicherheit | Strings → Fehler erst zur Laufzeit | Python-Objekte → IDE-Support |
| Migrationen | Manuell (`ALTER TABLE ...`) | Automatisch generiert (Alembic) |

**Fazit:** Für die meisten Web-Apps: ORM für Standard-CRUD, Raw SQL für komplexe Queries. Beides gleichzeitig ist okay.

### Unser Stack diese Woche

| Schicht | Technologie | Aufgabe |
|---------|------------|---------|
| **API-Layer** | Pydantic | Validierung & Serialisierung |
| **DB-Layer** | SQLAlchemy 2.0 | ORM & Queries |
| **Schema-Management** | Alembic | Versionierte Migrationen |
| **Persistenz** | PostgreSQL | Datenspeicherung |

### Wissensfrage 1

Nenne zwei Gründe, warum das React-Frontend niemals direkt mit der Datenbank kommunizieren sollte.

<details markdown>
<summary>Antwort anzeigen</summary>

1. **Sicherheit:** Datenbank-Credentials (Passwort, Host) müssten ins Frontend – das ist öffentlich sichtbar und manipulierbar.

2. **Konsistenz:** Geschäftslogik (Validierung, Berechtigungen) wäre verteilt statt zentral im Backend. Mehrere Clients (Web, Mobile, CLI) müssten dieselbe Logik duplizieren.

Weitere Gründe: Wiederverwendbarkeit der API für verschiedene Clients, bessere Testbarkeit der Backend-Logik.

</details>

### Wissensfrage 2

Was ist der Hauptvorteil eines ORM gegenüber direktem SQL – und was ist ein Nachteil?

<details markdown>
<summary>Antwort anzeigen</summary>

- **Vorteil:** Produktivität – man arbeitet mit Python-Objekten statt SQL-Strings. Typ-Sicherheit, IDE-Autocomplete, weniger Boilerplate. Migrationen werden automatisch generiert.

- **Nachteil:** Weniger Kontrolle über die exakten SQL-Queries. Bei komplexen Abfragen kann die Performance schwerer zu optimieren sein.

</details>

---

## Teil 1: Projekt-Setup & Datenbankverbindung

### Übung 1: Python-Projekt einrichten

> **Ziel:** FastAPI-Projekt mit allen Abhängigkeiten aufsetzen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** `pip list` die Pakete `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg`, `python-dotenv` und `alembic` zeigt

**Schritt 1: Projektordner anlegen**

Erstelle einen neuen Ordner für dein Backend-Projekt:

```bash
mkdir backend
cd backend
```

**Schritt 2: Virtual Environment erstellen und aktivieren**

```bash
python -m venv .venv
```

Aktivierung je nach Betriebssystem:

| OS | Befehl |
|----|--------|
| **Windows (PowerShell)** | `.venv\Scripts\Activate.ps1` |
| **Windows (CMD)** | `.venv\Scripts\activate.bat` |
| **macOS / Linux** | `source .venv/bin/activate` |

> **Hinweis:** Nach der Aktivierung siehst du `(.venv)` vor deinem Prompt.

**Schritt 3: Abhängigkeiten installieren**

```bash
pip install "fastapi[standard]" sqlalchemy "psycopg[binary]" python-dotenv alembic
```

> **Was installieren wir?**
> - `fastapi[standard]` – FastAPI + uvicorn (Server)
> - `sqlalchemy` – ORM für Datenbankzugriff
> - `psycopg[binary]` – PostgreSQL-Treiber (Psycopg v3)
> - `python-dotenv` – `.env`-Dateien laden
> - `alembic` – Datenbank-Migrationen

**Schritt 4: Projektstruktur anlegen**

Erstelle folgende Dateien und Ordner:

```
backend/
├── app/
│   ├── __init__.py        # Leere Datei (macht app zum Python-Paket)
│   ├── main.py            # FastAPI App + Endpoints
│   ├── database.py        # Engine, Session, get_db
│   ├── models.py          # SQLAlchemy Models
│   └── schemas.py         # Pydantic Schemas
├── .env                   # DB-Credentials (NICHT committen!)
├── .env.example           # Vorlage für das Team
├── .gitignore
└── requirements.txt
```

> **Windows-Tipp:** Die leere `__init__.py` kannst du mit `echo. > app\__init__.py` erstellen (CMD) oder `New-Item app\__init__.py` (PowerShell).

**Schritt 5: requirements.txt erstellen**

```bash
pip freeze > requirements.txt
```

**Überprüfung:**

```bash
pip list | grep -i -E "fastapi|uvicorn|sqlalchemy|psycopg|dotenv|alembic"
```

> **Windows (PowerShell):** `pip list | Select-String "fastapi|uvicorn|sqlalchemy|psycopg|dotenv|alembic"`

<details markdown>
<summary>Hilfe: psycopg lässt sich nicht installieren?</summary>

Falls `psycopg[binary]` Probleme macht, probiere die alternative Installation:

```bash
pip install psycopg2-binary
```

In diesem Fall musst du den Connection String in der `.env` anpassen: `postgresql+psycopg2://` statt `postgresql+psycopg://`.

</details>

---

### Übung 2: Datenbankverbindung herstellen (database.py)

> **Ziel:** SQLAlchemy Engine und Session-Factory einrichten
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Der Schnelltest `python -c "from app.database import engine; print(engine.url)"` die Datenbank-URL anzeigt

**Schritt 1: .env-Datei erstellen**

Erstelle die Datei `.env` im `backend/`-Ordner:

```bash
DATABASE_URL=postgresql+psycopg://postgres:DEIN_PASSWORT@localhost:5432/kursapp
```

> **Wichtig:** Ersetze `DEIN_PASSWORT` durch das Passwort, das du gestern bei der PostgreSQL-Installation vergeben hast.
>
> **Linux:** Falls du gestern `sudo -u postgres psql` ohne Passwort verwendet hast, nutze: `DATABASE_URL=postgresql+psycopg://postgres@localhost:5432/kursapp`

**Schritt 2: .env.example erstellen**

```bash
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/kursapp
```

**Schritt 3: .gitignore erstellen**

```gitignore
.env
__pycache__/
.venv/
*.pyc
```

**Schritt 4: database.py schreiben**

Erstelle die Datei `app/database.py`:

```python
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Was passiert hier?**

- `load_dotenv()` – lädt die `.env`-Datei
- `create_engine(...)` – erstellt die Verbindung zur Datenbank. `pool_size=5` hält 5 Verbindungen offen, `max_overflow=10` erlaubt 10 zusätzliche bei Lastspitzen.
- `SessionLocal` – Factory für Datenbank-Sessions
- `Base` – Basisklasse für alle SQLAlchemy-Modelle
- `get_db()` – Dependency für FastAPI: gibt eine Session aus und schließt sie nach dem Request

> **Warum `yield` statt `return`?** `yield` gibt die Session an den Endpoint weiter. Nach dem Request (auch bei Fehlern!) wird der `finally`-Block ausgeführt und die Session geschlossen. So vermeidet ihr Session-Leaks.

**Überprüfung:**

```bash
python -c "from app.database import engine; print(engine.url)"
```

Du solltest deine Datenbank-URL sehen (Passwort wird maskiert angezeigt).

<details markdown>
<summary>Musterlösung anzeigen</summary>

Die Ausgabe sollte so aussehen:

```
postgresql+psycopg://postgres:***@localhost:5432/kursapp
```

Falls du einen Fehler bekommst:
- `ModuleNotFoundError: No module named 'dotenv'` → `pip install python-dotenv`
- `ModuleNotFoundError: No module named 'psycopg'` → `pip install "psycopg[binary]"`
- `could not translate host name` → Prüfe, ob dein PostgreSQL-Server läuft

</details>

### Wissensfrage 3

Warum verwenden wir `yield` in der `get_db()`-Funktion statt `return`?

<details markdown>
<summary>Antwort anzeigen</summary>

`yield` stellt sicher, dass die Session **nach dem Request geschlossen** wird (Cleanup). FastAPI's Dependency-Injection-System ruft den Code nach `yield` automatisch auf – auch bei Fehlern (dank `finally`). So werden offene Datenbankverbindungen vermieden.

Mit `return` hätten wir keine Möglichkeit, die Session nach dem Request aufzuräumen. Die Verbindung würde offen bleiben, bis der Garbage Collector sie irgendwann schließt.

</details>

---

## Teil 2: SQLAlchemy-Modelle & Pydantic-Schemas

### Übung 3: SQLAlchemy-Modelle definieren (models.py)

> **Ziel:** ORM-Modelle für die bestehenden users- und orders-Tabellen erstellen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** `python -c "from app.models import User, Order; print(User.__tablename__)"` die Ausgabe `users` zeigt

> **Wichtig:** Die Tabellen `users` und `orders` existieren bereits in eurer `kursapp`-Datenbank von gestern. Die SQLAlchemy-Modelle beschreiben dieselbe Struktur nochmal in Python – sie *erstellen* die Tabellen nicht neu. So kann SQLAlchemy Python-Objekte auf Datenbankzeilen abbilden (ORM = Object-Relational Mapping).

Erstelle die Datei `app/models.py`:

```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    created = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    orders = relationship("Order", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    total = Column(Integer, nullable=False)
    status = Column(String, default="pending")

    user = relationship("User", back_populates="orders")
```

**Was passiert hier?**

- Jede Klasse (`User`, `Order`) entspricht einer Tabelle
- `__tablename__` muss genau zum Tabellennamen in der DB passen
- `Column(...)` definiert Spaltentyp und Constraints (`nullable`, `unique`, etc.)
- `relationship(...)` erstellt keine DB-Spalte, sondern einen Python-Zugriff: `user.orders` gibt alle Orders eines Users zurück, `order.user` gibt den zugehörigen User zurück
- `back_populates` synchronisiert beide Seiten der Beziehung

**Überprüfung:**

```bash
python -c "from app.models import User, Order; print(User.__tablename__, Order.__tablename__)"
```

Erwartete Ausgabe: `users orders`

<details markdown>
<summary>Hilfe: ImportError bei app.database?</summary>

Falls `from app.database import Base` fehlschlägt:

1. Stelle sicher, dass `app/__init__.py` existiert (kann leer sein)
2. Führe den Befehl aus dem `backend/`-Ordner aus (nicht aus `app/`)
3. Prüfe, dass dein venv aktiviert ist (`(.venv)` im Prompt)

</details>

---

### Übung 4: Pydantic-Schemas definieren (schemas.py)

> **Ziel:** Request- und Response-Schemas getrennt von den DB-Modellen erstellen
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** `python -c "from app.schemas import UserCreate, UserResponse, OrderCreate, OrderResponse; print('OK')"` die Ausgabe `OK` zeigt

> **Warum getrennte Schemas?** Pydantic-Schemas (schemas.py) definieren, was der Client senden und empfangen darf. SQLAlchemy-Modelle (models.py) definieren, was in der DB liegt. Zum Beispiel hat `UserCreate` kein `id`-Feld (wird vom Server erzeugt), aber `UserResponse` schon.

Erstelle die Datei `app/schemas.py`:

```python
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# --- User Schemas ---

class UserCreate(BaseModel):
    email: str
    name: str
    age: int | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    age: int | None = None
    created: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# --- Order Schemas ---

class OrderCreate(BaseModel):
    user_id: UUID
    total: int


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    total: int
    status: str | None = None

    model_config = ConfigDict(from_attributes=True)
```

**Was macht `from_attributes = True`?** Damit kann Pydantic SQLAlchemy-Objekte direkt in Response-Schemas umwandeln. Ohne dieses Setting müsstest du die Daten manuell als Dict übergeben.

**Überprüfung:**

```bash
python -c "from app.schemas import UserCreate, UserResponse, OrderCreate, OrderResponse; print('OK')"
```

<details markdown>
<summary>Musterlösung anzeigen</summary>

Die Trennung im Überblick:

| Datei | Klasse | Zweck |
|-------|--------|-------|
| `schemas.py` | `UserCreate` | Was der Client beim POST sendet (email, name, age) |
| `schemas.py` | `UserResponse` | Was die API zurückgibt (id, email, name, age, created) |
| `models.py` | `User` | Was in der DB gespeichert wird (alle Spalten + Defaults) |

Der Datenfluss: `UserCreate` → Validierung → `User` (ORM) → DB → `UserResponse` → JSON

</details>

### Wissensfrage 4

Warum haben wir getrennte Dateien für `models.py` (SQLAlchemy) und `schemas.py` (Pydantic)?

<details markdown>
<summary>Antwort anzeigen</summary>

- **models.py** definiert die **Datenbankstruktur** – wie Daten gespeichert werden (Tabellen, Spalten, Constraints, Beziehungen).

- **schemas.py** definiert die **API-Schnittstelle** – was der Client senden darf und was er zurückbekommt.

Die Trennung ermöglicht:
- `UserCreate` hat kein `id`-Feld (wird vom Server erzeugt)
- `UserResponse` hat kein Passwort-Feld (soll nicht zurückgegeben werden)
- Verschiedene Schemas für verschiedene Endpoints (z.B. `UserUpdate` für PATCH)

**Faustregel:** Pydantic = Was rein/rausgeht (API). SQLAlchemy = Was in der DB liegt.

</details>

---

## Teil 3: CRUD-Endpunkte mit FastAPI

### Übung 5: Erste Endpunkte erstellen (main.py)

> **Ziel:** POST /users und GET /users implementieren und über Swagger UI testen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Du über `http://localhost:8000/docs` einen User anlegen und alle User abrufen kannst

Erstelle die Datei `app/main.py`:

```python
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, User
from app.schemas import (
    OrderCreate,
    OrderResponse,
    UserCreate,
    UserResponse,
)

app = FastAPI(title="Kursapp API")


@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Duplikat-Check
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email existiert bereits")

    new_user = User(
        email=user_data.email,
        name=user_data.name,
        age=user_data.age,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
```

**Was passiert hier?**

- `Depends(get_db)` – FastAPI ruft `get_db()` automatisch auf und gibt die Session an den Endpoint weiter (Dependency Injection)
- `db.add()` – INSERT vorbereiten
- `db.commit()` – Transaktion speichern
- `db.refresh()` – Generierte Werte (id, created) aus der DB laden
- `response_model=UserResponse` – Pydantic validiert und formatiert die Antwort

**Server starten:**

```bash
uvicorn app.main:app --reload
```

> **Windows-Tipp:** Falls `uvicorn` nicht gefunden wird: `python -m uvicorn app.main:app --reload`

Öffne im Browser: `http://localhost:8000/docs`

Du siehst die Swagger UI mit deinen Endpoints. Teste:

1. **POST /users** – Klicke auf "Try it out", gib einen Body ein:
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "age": 25
   }
   ```
   Klicke "Execute" – du solltest Status `201` und die Antwort mit generierter UUID sehen.

2. **GET /users** – Klicke "Try it out" → "Execute" – du siehst alle User (auch die von gestern!).

### Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `Connection refused` | PostgreSQL-Server läuft nicht | Server starten (siehe Tag 1, Übung 2) |
| `relation "users" does not exist` | Falsche Datenbank in .env | Prüfe, dass `.env` auf `kursapp` zeigt |
| `password authentication failed` | Falsches Passwort in .env | Passwort in `.env` korrigieren |
| `ModuleNotFoundError` | Paket nicht installiert oder venv nicht aktiv | venv aktivieren, `pip install ...` |
| `no module named 'app'` | Falsches Arbeitsverzeichnis | Befehl aus `backend/`-Ordner ausführen |

<details markdown>
<summary>Musterlösung anzeigen</summary>

Erwartete Ausgabe im Terminal beim Starten:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Wenn du POST /users mit `{"email": "test@example.com", "name": "Test User", "age": 25}` testest, sollte die Antwort so aussehen:

```json
{
  "id": "a1b2c3d4-...",
  "email": "test@example.com",
  "name": "Test User",
  "age": 25,
  "created": "2025-06-15T14:30:00+00:00"
}
```

</details>

---

### Übung 6: CRUD erweitern

> **Ziel:** Weitere Endpunkte hinzufügen: einzelne User, Orders erstellen und auflisten
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** Alle 5 Endpunkte über `/docs` funktionieren

Erweitere `app/main.py` um diese Endpoints:

```python
@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nicht gefunden")
    return user


@app.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # Prüfen, ob der User existiert
    user = db.query(User).filter(User.id == order_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nicht gefunden")

    new_order = Order(
        user_id=order_data.user_id,
        total=order_data.total,
    )
    try:
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order
    except Exception:
        db.rollback()
        raise


@app.get("/orders", response_model=list[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()
```

**Was ist neu?**

- `GET /users/{user_id}` – Einzelnen User per UUID abfragen, 404 wenn nicht gefunden
- `POST /orders` – Prüft zuerst, ob der User existiert (Foreign Key), dann INSERT
- `try/except` mit `db.rollback()` – Falls der Commit fehlschlägt (z.B. Constraint-Verletzung), wird die Transaktion zurückgerollt

**Teste über /docs:**

1. **GET /users** → Kopiere eine User-ID
2. **GET /users/{user_id}** → Setze die kopierte ID ein
3. **POST /orders** → Verwende die User-ID und einen `total`-Wert > 0
4. **GET /orders** → Zeigt alle Orders

> **Teste auch Fehlerfälle:** Was passiert, wenn du POST /orders mit einer nicht existierenden User-ID aufrufst? Du solltest einen 404-Fehler bekommen.

<details markdown>
<summary>Musterlösung anzeigen</summary>

Nach dem Erweitern sollte dein `app/main.py` diese 5 Endpoints haben:

| Methode | Pfad | Funktion | Status |
|---------|------|----------|--------|
| `POST` | `/users` | User erstellen | 201 |
| `GET` | `/users` | Alle User auflisten | 200 |
| `GET` | `/users/{user_id}` | Einzelnen User abrufen | 200 / 404 |
| `POST` | `/orders` | Order erstellen | 201 / 404 |
| `GET` | `/orders` | Alle Orders auflisten | 200 |

Alle Endpoints sind über `http://localhost:8000/docs` testbar. Dank `--reload` werden Änderungen automatisch übernommen.

</details>

### Wissensfrage 5

Was passiert, wenn ein `db.commit()` fehlschlägt – z.B. weil ein UNIQUE-Constraint verletzt wird? Was muss man dann tun?

<details markdown>
<summary>Antwort anzeigen</summary>

Die Transaktion ist dann in einem **fehlerhaften Zustand**. Man muss `db.rollback()` aufrufen, um die Session wieder in einen sauberen Zustand zu bringen. Erst danach kann man die Session wieder für neue Operationen verwenden.

Deshalb verwenden wir `try/except` mit `db.rollback()`:
```python
try:
    db.add(new_item)
    db.commit()
except Exception:
    db.rollback()  # Session zurücksetzen
    raise           # Fehler weiterwerfen
```

</details>

---

## Teil 4: Migrationen mit Alembic

### Übung 7: Alembic initialisieren

> **Ziel:** Alembic im Projekt einrichten und mit der Datenbank verbinden
> **Zeitbedarf:** ca. 10 Minuten
> **Du bist fertig, wenn:** `alembic current` ohne Fehler läuft

> **Was ist Alembic?** Alembic ist wie **Git für euer Datenbank-Schema**. Statt Code-Änderungen versioniert ihr damit Schema-Änderungen (neue Tabellen, neue Spalten, etc.). Jede Änderung hat eine `upgrade()`- und `downgrade()`-Funktion – ihr könnt also immer vor und zurück.

**Warum nicht einfach `Base.metadata.create_all()`?** Das kann nur neue Tabellen erstellen. Es kann keine Spalten ändern, umbenennen oder löschen. Außerdem ist es nicht versioniert – ihr wisst nicht, welchen Stand eure DB gerade hat. Alembic löst genau diese Probleme.

**Schritt 1: Alembic initialisieren**

Stelle sicher, dass du im `backend/`-Ordner bist, dann:

```bash
alembic init alembic
```

> **Windows-Tipp:** Falls `alembic` nicht gefunden wird: `python -m alembic init alembic`

Das erstellt:

```
backend/
├── alembic/
│   ├── versions/          # Hier landen eure Migrationen
│   ├── env.py             # Konfiguration: welche Models, welche DB
│   └── script.py.mako     # Template für Migrationen
├── alembic.ini            # Connection String + Settings
├── app/
│   └── ...
└── ...
```

**Schritt 2: Connection String konfigurieren**

Öffne `alembic.ini` und ändere die Zeile `sqlalchemy.url`:

```ini
sqlalchemy.url = postgresql+psycopg://postgres:DEIN_PASSWORT@localhost:5432/kursapp
```

> **Alternativ (besser):** Du kannst den Connection String auch aus der `.env`-Datei laden. Dafür wird in Schritt 3 die `env.py` angepasst.

**Schritt 3: Models in env.py einbinden**

Öffne `alembic/env.py` und passe diese Stellen an:

Am Anfang der Datei (nach den bestehenden Imports) hinzufügen:

```python
from app.database import Base
from app import models  # noqa: F401 – damit Alembic die Models kennt
```

Suche die Zeile `target_metadata = None` und ändere sie zu:

```python
target_metadata = Base.metadata
```

**Schritt 4: Bestehende Tabellen erfassen**

Da eure Tabellen bereits in der Datenbank existieren (von gestern), müssen wir Alembic den aktuellen Stand mitteilen:

```bash
alembic stamp head
```

Das sagt Alembic: "Die Datenbank ist auf dem neuesten Stand" – ohne etwas zu ändern. Alembic erstellt dafür eine Tabelle `alembic_version` in eurer Datenbank.

**Überprüfung:**

```bash
alembic current
```

Du solltest `(head)` sehen – Alembic kennt jetzt den aktuellen Stand.

<details markdown>
<summary>Musterlösung anzeigen</summary>

Die kompletten Änderungen in `alembic/env.py`:

```python
# Am Anfang der Datei (nach den bestehenden Imports):
from app.database import Base
from app import models  # noqa: F401

# Die Zeile target_metadata ändern:
target_metadata = Base.metadata
```

In `alembic.ini`:
```ini
sqlalchemy.url = postgresql+psycopg://postgres:DEIN_PASSWORT@localhost:5432/kursapp
```

Die Ausgabe von `alembic current`:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
```

Falls du `alembic stamp head` ausgeführt hast, gibt es jetzt eine `alembic_version`-Tabelle in deiner Datenbank. Prüfe mit psql:

```sql
SELECT * FROM alembic_version;
```

</details>

<details markdown>
<summary>Hilfe: alembic-Befehl nicht gefunden?</summary>

Auf Windows wird `alembic` manchmal nicht als Befehl erkannt. Nutze stattdessen:

```bash
python -m alembic current
```

Das gilt für alle Alembic-Befehle in dieser Übung.

</details>

---

### Übung 8: Erste Migration erstellen und ausführen

> **Ziel:** Eine autogenerierte Migration erstellen, anwenden und zurückrollen
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** `alembic current` den Hash deiner Migration zeigt und `\d users` in psql die neue Spalte `is_active` enthält

Jetzt erleben wir den vollen Migrations-Zyklus: Eine Spalte hinzufügen, die Migration ausführen und dann zurückrollen.

**Schritt 1: Model ändern**

Füge dem `User`-Model in `app/models.py` eine neue Spalte hinzu:

```python
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    is_active = Column(Boolean, server_default=text("true"))  # NEU
    created = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    orders = relationship("Order", back_populates="user")
```

> **Hinweis:** `server_default=text("true")` setzt den Default-Wert direkt in PostgreSQL (nicht in Python). Bestehende Zeilen bekommen automatisch `true`.

**Schritt 2: Migration generieren**

```bash
alembic revision --autogenerate -m "add is_active to users"
```

Das erstellt eine Datei in `alembic/versions/` – z.B. `a1b2c3d4_add_is_active_to_users.py`.

**Schritt 3: Migration inspizieren**

Öffne die generierte Datei. Sie sollte in etwa so aussehen:

```python
def upgrade():
    op.add_column("users", sa.Column("is_active", sa.Boolean(),
                  server_default=sa.text("true"), nullable=True))

def downgrade():
    op.drop_column("users", "is_active")
```

> **Wichtig:** Autogenerate hat Grenzen! Es erkennt neue/gelöschte Spalten und Typ-Änderungen. Es erkennt aber **nicht** Umbenennungen (sieht drop + add statt rename) und keine Daten-Migrationen. **Immer die generierte Datei prüfen**, bevor ihr sie anwendet.

**Schritt 4: Migration anwenden**

```bash
alembic upgrade head
```

**Schritt 5: In psql überprüfen**

```bash
psql -h localhost -U postgres -d kursapp
```

```sql
\d users
```

Du solltest die neue Spalte `is_active` mit Default `true` sehen.

**Schritt 6: Downgrade testen**

```bash
alembic downgrade -1
```

Prüfe in psql: `\d users` – die Spalte `is_active` ist wieder weg.

**Schritt 7: Wieder upgraden**

```bash
alembic upgrade head
```

Die Spalte ist wieder da. So funktioniert der Migrations-Zyklus.

**Überprüfung:**

```bash
alembic current
alembic history --verbose
```

`current` zeigt den Hash eurer Migration, `history` listet alle Migrationen auf.

<details markdown>
<summary>Musterlösung anzeigen</summary>

Der vollständige Ablauf:

```
$ alembic revision --autogenerate -m "add is_active to users"
INFO  [alembic.autogenerate.compare] Detected added column 'users.is_active'
  Generating alembic/versions/a1b2c3d4_add_is_active_to_users.py ...  done

$ alembic upgrade head
INFO  [alembic.runtime.migration] Running upgrade  -> a1b2c3d4, add is_active to users

$ alembic current
a1b2c3d4 (head)

$ alembic downgrade -1
INFO  [alembic.runtime.migration] Running downgrade a1b2c3d4 -> , add is_active to users

$ alembic upgrade head
INFO  [alembic.runtime.migration] Running upgrade  -> a1b2c3d4, add is_active to users
```

Der Workflow in Kurzform:

```
Model ändern → alembic revision --autogenerate → Datei prüfen → alembic upgrade head
```

</details>

### Wissensfrage 6

Was ist "Schema Drift" und wie verhindert Alembic dieses Problem?

<details markdown>
<summary>Antwort anzeigen</summary>

**Schema Drift** bedeutet, dass der Code eine andere Datenbankstruktur erwartet als tatsächlich vorhanden ist – z.B. weil jemand manuell eine Spalte hinzugefügt hat oder ein Teammitglied eine andere Datenbankversion hat.

**Alembic verhindert das**, indem Schema-Änderungen als versionierte Migrations-Dateien im Code-Repository liegen. Alle Teammitglieder können mit `alembic upgrade head` ihren lokalen Stand synchronisieren – genau wie `git pull` den Code synchronisiert.

| Git | Alembic |
|-----|---------|
| Trackt Code-Änderungen | Trackt Schema-Änderungen |
| `git commit` | `alembic revision` |
| `git pull` | `alembic upgrade head` |
| `git revert` | `alembic downgrade -1` |

</details>

---

## Teil 5: Konfiguration & Secrets

### Übung 9: Konfiguration sauber trennen

> **Ziel:** Sicherstellen, dass die Konfiguration sauber vom Code getrennt ist
> **Zeitbedarf:** ca. 15 Minuten
> **Du bist fertig, wenn:** Deine App die Datenbank-URL nur aus der `.env`-Datei liest und `.env.example` für das Team dokumentiert ist

> **Warum?** Connection Strings enthalten Passwörter – die gehören nicht in den Code. Verschiedene Umgebungen (lokal, Staging, Produktion) brauchen verschiedene Konfigurationen. Das 12-Factor-App-Prinzip sagt: Konfiguration kommt aus der Umgebung, nicht aus dem Code.

**Schritt 1: .env prüfen**

Deine `.env` sollte mindestens diese Variable enthalten:

```bash
DATABASE_URL=postgresql+psycopg://postgres:DEIN_PASSWORT@localhost:5432/kursapp
```

**Schritt 2: .env.example aktualisieren**

Diese Datei wird committed und zeigt dem Team, welche Variablen nötig sind:

```bash
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/kursapp
```

Neue Teammitglieder kopieren diese Datei:

```bash
cp .env.example .env
```

Und tragen ihre eigenen Werte ein.

**Schritt 3: .gitignore prüfen**

Stelle sicher, dass deine `.gitignore` mindestens enthält:

```gitignore
# Secrets – niemals committen!
.env

# Python
__pycache__/
.venv/
*.pyc

# Lokale DB-Dateien
*.db
```

**Schritt 4: Verschiedene Umgebungen verstehen**

Gleicher Code – unterschiedliche Konfiguration:

| Umgebung | Connection String | Wer nutzt es? |
|----------|------------------|---------------|
| **Lokal** | `...://postgres:kurspass@localhost:5432/kursapp` | Ihr auf eurem Rechner |
| **Dev/Staging** | `...://devuser:devpass@dev-server:5432/kursapp` | Team-Server zum Testen |
| **Produktion** | `...://produser:***@rds-endpoint:5432/kursapp` | Echte Nutzer (Cloud) |

> **Wichtig:** Die `.env`-Datei gehört **niemals** ins Git-Repository! Sie enthält Passwörter und andere Secrets. Die `.env.example` hingegen **soll** committed werden – sie zeigt dem Team, welche Variablen benötigt werden.

<details markdown>
<summary>Musterlösung anzeigen</summary>

Eure Projektstruktur sollte jetzt so aussehen:

```
backend/
├── alembic/
│   ├── versions/
│   │   └── a1b2c3d4_add_is_active_to_users.py
│   ├── env.py
│   └── script.py.mako
├── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── schemas.py
├── .env                   # Eure echten Credentials (in .gitignore!)
├── .env.example           # Vorlage (wird committed)
├── .gitignore
└── requirements.txt
```

**Trennung der Verantwortung:**

| Datei | Aufgabe |
|-------|---------|
| `database.py` | Verbindungslogik (Engine, Session, get_db) |
| `models.py` | Datenbankstruktur (was in der DB liegt) |
| `schemas.py` | API-Validierung (was rein/rausgeht) |
| `main.py` | Endpoints (verbindet alles) |
| `.env` | Credentials und Konfiguration |

</details>

---

## Zusammenfassung

### Was du heute gelernt hast

| Konzept | Beschreibung | Beispiel |
|---------|-------------|---------|
| **3-Tier-Architektur** | React → FastAPI → PostgreSQL | Frontend spricht nur mit Backend |
| **ORM (SQLAlchemy)** | Python-Objekte statt SQL-Strings | `db.query(User).filter(...)` |
| **Engine + Pool** | Datenbankverbindung mit Connection Pool | `create_engine(URL, pool_size=5)` |
| **Session per Request** | Dependency Injection mit yield | `Depends(get_db)` |
| **Pydantic Schemas** | Request/Response-Validierung | `UserCreate`, `UserResponse` |
| **CRUD-Endpunkte** | Create, Read über HTTP | `POST /users`, `GET /users` |
| **Alembic** | Versionierte Datenbank-Migrationen | `alembic upgrade head` |
| **Autogenerate** | Migration aus Model-Diff erzeugen | `alembic revision --autogenerate` |
| **.env + dotenv** | Secrets vom Code trennen | `DATABASE_URL` in `.env` |

### Ausblick: Tag 3

Morgen geht es um **Performance-Basics und MongoDB**! Ihr lernt:

- **Indexes** – Was bringen sie und was kosten sie?
- **EXPLAIN / EXPLAIN ANALYZE** – Queries analysieren
- **MongoDB** – Dokument-Datenbank als Alternative (Logs, Events, flexible Daten)
- **Polyglot Persistence** – Verschiedene DBs für verschiedene Aufgaben

Stellt sicher, dass eure FastAPI-App mit PostgreSQL verbunden ist und Alembic funktioniert – das ist die Voraussetzung für morgen.

---

## Bonus

### Bonus 1: SQL-Queries sichtbar machen

Aktiviere den Echo-Modus, um zu sehen, welche SQL-Queries SQLAlchemy generiert:

```python
# In database.py – echo=True hinzufügen
engine = create_engine(DATABASE_URL, echo=True, pool_size=5, max_overflow=10)
```

Starte den Server neu und rufe einen Endpoint auf. Im Terminal siehst du jetzt die generierten SQL-Statements.

> **Hinweis:** `echo=True` ist nur für die Entwicklung gedacht – in Produktion ausschalten! Die Ausgabe zeigt euch genau, was das ORM unter der Haube macht.

### Bonus 2: Orders mit User-Details abfragen (JOIN)

Erstelle einen Endpoint, der Orders zusammen mit dem User-Namen zurückgibt:

```python
from sqlalchemy.orm import joinedload

@app.get("/orders/details")
def list_orders_with_users(db: Session = Depends(get_db)):
    orders = db.query(Order).options(joinedload(Order.user)).all()
    return [
        {
            "id": str(order.id),
            "total": order.total,
            "status": order.status,
            "user_name": order.user.name,
            "user_email": order.user.email,
        }
        for order in orders
    ]
```

> `joinedload` sorgt dafür, dass SQLAlchemy den User in derselben Query mitlädt (statt eine separate Query pro Order). Das ist effizienter – morgen lernt ihr mehr über Query-Optimierung.

---

## Checkliste

Bevor du in den Feierabend gehst – hast du alles geschafft?

- [ ] Python-Projekt mit venv und allen Abhängigkeiten eingerichtet
- [ ] `database.py` verbindet sich erfolgreich mit PostgreSQL
- [ ] SQLAlchemy-Modelle für `users` und `orders` definiert (`models.py`)
- [ ] Pydantic-Schemas für Request und Response erstellt (`schemas.py`)
- [ ] `POST /users` und `GET /users` funktionieren über `/docs`
- [ ] Du verstehst den Unterschied zwischen `models.py` und `schemas.py`
- [ ] Alembic ist initialisiert und deine erste Migration ist erstellt
- [ ] Du hast `alembic upgrade head` und `alembic downgrade -1` ausprobiert
- [ ] Deine Datenbank-URL steht in `.env` (nicht im Code)
- [ ] `.env` steht in `.gitignore`

**Alles abgehakt? Dann hast du eine vollständige FastAPI + PostgreSQL Anwendung mit Migrations-Setup gebaut!**
