---
tags:
  - Auth
  - JWT
  - Security
  - FastAPI
  - React
---
# JWT Authentication mit FastAPI - Praktische Übungen

## Übersicht

In dieser Übung baust du JWT-basierte Authentication in dein FastAPI-Backend:

- **JWT-Grundlagen verstehen** - Aufbau, Signatur und Payload eines JSON Web Tokens
- **JWT-Tokens erstellen** - Access Tokens mit python-jose generieren
- **Login mit JWT-Response** - Der Login-Endpoint gibt jetzt einen echten Token zurück
- **`get_current_user` Dependency** - Das zentrale Pattern: Wer ist der aktuelle User?
- **Geschützte Endpoints** - Endpoints, die nur für eingeloggte User oder bestimmte Rollen zugänglich sind

Diese Übung baut auf **01 – Password Hashing** auf. Du hast bereits `app/auth.py` mit `hash_password()` und `verify_password()`, sowie Register- und Login-Endpoints. Jetzt kommt der JWT-Token dazu.

| Teil | Thema | Zeitbedarf |
|------|-------|------------|
| **Rückblick** | Was sind JWTs und warum? | 10 min (lesen) |
| **Teil 1** | JWT-Grundlagen: Aufbau und Funktionsweise | 20 min |
| **Teil 2** | JWT-Tokens erstellen mit python-jose | 25 min |
| **Teil 3** | Login-Endpoint mit JWT-Response | 20 min |
| **Teil 4** | `get_current_user` Dependency | 30 min |
| **Teil 5** | Geschützte Endpoints und Rollen | 25 min |
| **Bonus** | Refresh-Token-Konzept (Ausblick) | 10 min (lesen) |
| | **Gesamt** | **ca. 2–2,5 Stunden** |

**Minimalpfad (ca. 105 Minuten):** Rückblick + Teil 1 + Teil 2 + Teil 3 + Teil 4. Teil 5 (Rollen) ist optional, aber sehr empfohlen für ein vollständiges Auth-System.

---

## Rückblick: Was sind JWTs und warum?

### Der Login-Flow mit JWT

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
sequenceDiagram
    participant C as 🖥️ React
    participant B as ⚙️ FastAPI

    C->>B: POST /login {email, password}
    B->>B: Passwort prüfen ✅
    B->>B: JWT erstellen (User-ID + Rolle + Ablaufzeit)
    B-->>C: {"access_token": "eyJhbG...", "token_type": "bearer"}

    Note over C: Token speichern (localStorage)

    C->>B: GET /me<br/>Authorization: Bearer eyJhbG...
    B->>B: Token prüfen (Signatur + Ablaufzeit)
    B-->>C: {"id": 1, "name": "Max", "role": "user"}

    C->>B: GET /admin<br/>Authorization: Bearer eyJhbG...
    B->>B: Token prüfen + Rolle prüfen
    B-->>C: 403 Forbidden (keine Admin-Rolle)
```

### Sessions vs JWT – Wann was?

In der letzten Übung hat der Login einfach `{"message": "Login erfolgreich"}` zurückgegeben. Aber wie weiß der Server bei der nächsten Anfrage, wer du bist? Dafür gibt es zwei Ansätze:

| Eigenschaft | Sessions (Stateful) | JWT (Stateless) |
|-------------|-------------------|-----------------|
| Server speichert Status | ✅ Ja (in Redis oder DB) | ❌ Nein – alles steckt im Token |
| Was bekommt der Client? | Nur eine Session-ID | Token mit User-Daten + Signatur |
| Jeder Server kann prüfen | ❌ Nur der mit Session-Zugriff | ✅ Ja – nur der Secret Key nötig |
| Sofort widerrufen | ✅ Session löschen | ⚠️ Erst wenn Token abläuft |
| Typischer Einsatz | Klassische Server-Apps | SPAs, APIs, Microservices |

> **Warum JWT für uns?** Eure React-App ist eine SPA (Single Page Application), die über HTTP mit der API kommuniziert. JWT ist dafür der Standard – der Token enthält alles, was der Server braucht, ohne extra Lookup.

### Wissensfrage 1

> Warum ist Stateless Authentication (JWT) besonders gut für SPAs und APIs geeignet?

<details markdown>
<summary>Antwort anzeigen</summary>

Bei JWT muss der Server keinen Zustand speichern. Jeder Request enthält den Token mit allen nötigen Informationen (User-ID, Rolle, Ablaufdatum). Der Server prüft nur die Signatur – das funktioniert auf jedem Server gleich, ohne Zugriff auf eine Session-Datenbank. Das ist besonders gut für SPAs, weil Frontend und Backend oft auf verschiedenen Servern/Domains laufen und der Token einfach als HTTP-Header mitgeschickt wird.

</details>

---

## Teil 1: JWT-Grundlagen

### Übung 1: JWT-Aufbau verstehen

> **Ziel:** Den Aufbau eines JWT verstehen – Header, Payload, Signature
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** Du erklären kannst, was in einem JWT steckt und warum er sicher ist

Ein JWT besteht aus drei Teilen, getrennt durch Punkte:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3MzUwMDAwMDB9.K7xRf3xG9mQ2vN8bJkHp5TcY1wZqR3n6Lm4sD0hA9fE
```

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph LR
    H["🔵 <b>Header</b><br/>Algorithmus + Typ<br/><code>alg: HS256</code><br/><code>typ: JWT</code>"]
    P["🟢 <b>Payload</b><br/>Daten (Claims)<br/><code>sub: '1'</code><br/><code>role: 'user'</code><br/><code>exp: 1735000000</code>"]
    S["🟠 <b>Signature</b><br/>Schutz vor Manipulation<br/><code>HMAC-SHA256(</code><br/><code>  header + payload,</code><br/><code>  SECRET_KEY</code><br/><code>)</code>"]
    H --- P --- S
```

### Die drei Teile im Detail

**1. Header** (Base64-encoded, NICHT verschlüsselt):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**2. Payload** (Base64-encoded, NICHT verschlüsselt):
```json
{
  "sub": "1",
  "role": "user",
  "exp": 1735000000,
  "iat": 1734998200
}
```

| Claim | Bedeutung | Beispiel |
|-------|-----------|----------|
| `sub` | Subject – Wer ist das? (User-ID) | `"1"` |
| `exp` | Expiration – Wann läuft der Token ab? | Unix-Timestamp |
| `iat` | Issued At – Wann wurde der Token erstellt? | Unix-Timestamp |
| `role` | Custom Claim – Welche Rolle hat der User? | `"user"`, `"admin"` |

**3. Signature** (Schutz vor Manipulation):
```
HMAC-SHA256(
  base64(header) + "." + base64(payload),
  SECRET_KEY
)
```

> **Wichtig: JWT ist signiert, NICHT verschlüsselt!** Jeder kann den Payload lesen (Base64 decodieren). Aber niemand kann den Payload **ändern**, ohne die Signatur ungültig zu machen. Der Server prüft: "Stimmt die Signatur? Dann wurde der Payload nicht manipuliert."

### Was bedeutet das praktisch?

| Frage | Antwort |
|-------|---------|
| Kann jemand meinen JWT lesen? | ✅ Ja – der Payload ist nur Base64-encoded |
| Kann jemand meinen JWT manipulieren? | ❌ Nein – die Signatur würde nicht mehr stimmen |
| Sollte ich Passwörter in den JWT packen? | ❌ Niemals! Nur nicht-sensible Daten (ID, Rolle) |
| Was braucht der Server zum Prüfen? | Nur den `SECRET_KEY` – keine DB nötig |

### Wissensfrage 2

> Kann jemand den Inhalt eines JWT lesen? Kann jemand ihn verändern?

<details markdown>
<summary>Antwort anzeigen</summary>

**Lesen: Ja.** Der Payload ist nur Base64-encoded, nicht verschlüsselt. Jeder, der den Token hat, kann den Inhalt lesen. Deshalb gehören keine sensiblen Daten (Passwörter, Kreditkarten) in den Payload.

**Verändern: Nein** (nicht unbemerkt). Wenn jemand den Payload ändert, stimmt die Signatur nicht mehr. Der Server bemerkt die Manipulation sofort und lehnt den Token ab. Nur wer den SECRET_KEY kennt, kann eine gültige Signatur erstellen.

</details>

---

## Teil 2: JWT-Tokens erstellen mit python-jose

### Übung 2: python-jose installieren und JWT erstellen

> **Ziel:** JWT-Tokens in Python erstellen und decodieren können
> **Zeitbedarf:** ca. 25 Minuten
> **Du bist fertig, wenn:** Du einen JWT erstellen, decodieren und die Ablaufzeit prüfen kannst

**Schritt 1: python-jose installieren**

```bash
pip install "python-jose[cryptography]"
```

**Schritt 2: In der Python-Shell ausprobieren**

```python
from jose import jwt
from datetime import datetime, timedelta, timezone

# Secret Key – in Produktion aus .env laden!
SECRET_KEY = "mein-super-geheimer-key-den-niemand-kennt"
ALGORITHM = "HS256"

# Token erstellen
payload = {
    "sub": "1",                                          # User-ID
    "role": "user",                                       # Rolle
    "exp": datetime.now(timezone.utc) + timedelta(minutes=30),  # Ablauf in 30 Min
}
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print(token)
# → eyJhbGciOiJIUzI1NiI...

# Token decodieren
decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
print(decoded)
# → {'sub': '1', 'role': 'user', 'exp': 1735000000}
```

**Schritt 3: Was passiert bei abgelaufenem Token?**

```python
from jose import ExpiredSignatureError

# Token der schon abgelaufen ist
expired_payload = {
    "sub": "1",
    "exp": datetime.now(timezone.utc) - timedelta(hours=1),  # 1 Stunde in der Vergangenheit
}
expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm=ALGORITHM)

try:
    jwt.decode(expired_token, SECRET_KEY, algorithms=[ALGORITHM])
except ExpiredSignatureError:
    print("Token ist abgelaufen!")  # ← Das passiert!
```

**Schritt 4: Was passiert bei manipuliertem Token?**

```python
from jose import JWTError

# Token mit falschem Key decodieren
try:
    jwt.decode(token, "falscher-key", algorithms=[ALGORITHM])
except JWTError:
    print("Token-Signatur ungültig!")  # ← Das passiert!
```

**Schritt 5: `app/auth.py` erweitern**

Füge die JWT-Funktionen zu deinem bestehenden `app/auth.py` hinzu:

```python
# app/auth.py – JWT-Funktionen hinzufügen

import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT-Konfiguration – aus .env laden!
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def hash_password(password: str) -> str:
    """Hasht ein Klartext-Passwort mit bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Prüft ein Klartext-Passwort gegen einen bcrypt-Hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Erstellt einen JWT Access Token mit Ablaufdatum."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decodiert und prüft einen JWT Access Token."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

> **Wichtig:** `SECRET_KEY` muss in Produktion ein langer, zufälliger String sein und aus der `.env`-Datei kommen. Generiere ihn mit: `python -c "import secrets; print(secrets.token_hex(32))"`

**Füge zu deiner `.env`-Datei hinzu:**

```bash
# .env
SECRET_KEY=dein-generierter-key-hier
```

### Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `ModuleNotFoundError: No module named 'jose'` | python-jose nicht installiert | `pip install "python-jose[cryptography]"` |
| `ExpiredSignatureError` | Token ist abgelaufen | Neuen Token erstellen (Login) |
| `JWTError` | Signatur ungültig oder Token manipuliert | SECRET_KEY prüfen – muss beim Erstellen und Prüfen gleich sein |

---

## Teil 3: Login-Endpoint mit JWT-Response

### Übung 3: Login überarbeiten

> **Ziel:** Der Login-Endpoint gibt jetzt einen JWT-Token zurück
> **Zeitbedarf:** ca. 20 Minuten
> **Du bist fertig, wenn:** POST `/login` einen JWT-Token zurückgibt, den du in Swagger UI sehen kannst

**Schritt 1: TokenResponse-Schema hinzufügen**

In `app/schemas.py`:

```python
class TokenResponse(BaseModel):
    """Schema für die Login-Response mit JWT."""
    access_token: str
    token_type: str
```

**Schritt 2: Login-Endpoint aktualisieren**

Ersetze den bisherigen Login-Endpoint in `app/main.py`:

<details markdown>
<summary>Musterlösung anzeigen</summary>

```python
# In app/main.py

from app.schemas import LoginRequest, TokenResponse, UserRegister, UserResponse
from app.auth import hash_password, verify_password, create_access_token


@app.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # User per Email suchen
    user = db.query(User).filter(User.email == login_data.email).first()

    # Prüfen: User existiert UND Passwort stimmt
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Ungültige Anmeldedaten"
        )

    # JWT erstellen – User-ID und Rolle im Payload
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return {"access_token": access_token, "token_type": "bearer"}
```

</details>

**Teste mit Swagger UI:**

1. Logge dich ein: `POST /login` mit `{"email": "max@example.com", "password": "geheim123"}`
2. Du bekommst:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer"
   }
   ```
3. Kopiere den `access_token` – du brauchst ihn gleich!

---

## Teil 4: `get_current_user` Dependency

### Übung 4: Die zentrale Auth-Dependency

> **Ziel:** Eine FastAPI Dependency bauen, die den aktuellen User aus dem JWT-Token extrahiert
> **Zeitbedarf:** ca. 30 Minuten
> **Du bist fertig, wenn:** `GET /me` den eingeloggten User zurückgibt und `401` bei fehlendem/ungültigem Token

Das ist **das wichtigste Pattern** in diesem Material. `get_current_user` wird als Dependency in jeden geschützten Endpoint eingebaut:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
graph LR
    R["🖥️ Request<br/>Authorization: Bearer eyJ..."] --> O["🔑 <b>OAuth2PasswordBearer</b><br/>Token extrahieren"]
    O --> D["🔍 <b>decode_access_token</b><br/>Token prüfen"]
    D --> DB["🐘 <b>PostgreSQL</b><br/>User laden"]
    DB --> E["✅ <b>Endpoint</b><br/>current_user steht bereit"]
```

**Schritt 1: OAuth2PasswordBearer einrichten**

FastAPI hat ein eingebautes Tool, das den Token aus dem `Authorization`-Header extrahiert:

```python
from fastapi.security import OAuth2PasswordBearer

# Sagt FastAPI: "Der Token kommt im Authorization-Header
# und kann über /login geholt werden"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
```

**Schritt 2: `get_current_user` Dependency erstellen**

Erstelle die Datei `app/dependencies.py`:

<details markdown>
<summary>Musterlösung anzeigen</summary>

```python
# app/dependencies.py

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import decode_access_token
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extrahiert den aktuellen User aus dem JWT-Token.

    Wird als Dependency in geschützte Endpoints eingebaut:
    @app.get("/me")
    def me(current_user: User = Depends(get_current_user)):
        return current_user
    """
    # Token decodieren
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token ungültig")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token ungültig oder abgelaufen")

    # User aus der DB laden
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User nicht gefunden")

    return user
```

</details>

**Schritt 3: GET `/me` Endpoint bauen**

In `app/main.py`:

```python
from app.dependencies import get_current_user


@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Gibt den aktuell eingeloggten User zurück."""
    return current_user
```

**So einfach ist das!** `Depends(get_current_user)` erledigt die ganze Arbeit:
1. Token aus Header extrahieren
2. Token decodieren und prüfen
3. User aus DB laden
4. Wenn irgendwas fehlschlägt → automatisch `401`

**Teste mit Swagger UI:**

1. Klicke oben rechts auf **"Authorize"** 🔐
2. Gib deinen Token ein (den du vom Login bekommen hast)
3. Rufe `GET /me` auf
4. Du siehst deine User-Daten!

**Oder mit curl:**

```bash
# Erst einloggen
TOKEN=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "max@example.com", "password": "geheim123"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Dann /me aufrufen
curl http://localhost:8000/me \
  -H "Authorization: Bearer $TOKEN"
```

### Wissensfrage 3

> Warum laden wir den User bei jedem Request aus der DB, obwohl die User-ID schon im JWT steht?

<details markdown>
<summary>Antwort anzeigen</summary>

Die User-ID im JWT reicht, um den User zu identifizieren. Aber wir brauchen die aktuellen Daten aus der DB, weil:
1. **Rolle könnte sich geändert haben** – Wenn ein Admin einem User die Rolle entzieht, steht die alte Rolle noch im JWT (bis er abläuft).
2. **Account könnte deaktiviert sein** – Ohne DB-Check könnte ein gesperrter User weiter zugreifen.
3. **Aktuelle Daten** – Name, Email etc. könnten sich seit der Token-Erstellung geändert haben.

Der DB-Lookup ist der Preis für Aktualität. In hochperformanten Systemen kann man den User-Lookup cachen (z.B. mit Redis).

</details>

### Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `401` obwohl Token vorhanden | Token-Format falsch | `Authorization: Bearer <token>` (mit "Bearer " davor!) |
| `401` sofort nach Login | SECRET_KEY stimmt nicht überein | Prüfe, dass `create_access_token` und `decode_access_token` denselben Key verwenden |
| Swagger UI zeigt kein 🔐 Icon | `OAuth2PasswordBearer` nicht registriert | Prüfe ob `oauth2_scheme` korrekt importiert wird |
| `422` statt `401` bei fehlendem Header | Du nutzt `Header()` statt `OAuth2PasswordBearer` | `OAuth2PasswordBearer` gibt automatisch `401` bei fehlendem Token. `422` passiert nur bei `Header()`-Validation – das vermeiden wir hier |

---

## Teil 5: Geschützte Endpoints und Rollen

### Übung 5: Rollenbasierte Zugriffskontrolle

> **Ziel:** Endpoints bauen, die nur für bestimmte Rollen zugänglich sind
> **Zeitbedarf:** ca. 25 Minuten
> **Du bist fertig, wenn:** `/admin/users` nur für Admins zugänglich ist und andere User `403 Forbidden` bekommen

**Schritt 1: `require_role` Dependency-Factory**

Füge in `app/dependencies.py` hinzu:

```python
def require_role(required_role: str):
    """Dependency-Factory: Erstellt eine Dependency, die eine bestimmte Rolle erfordert.

    Verwendung:
    @app.get("/admin/users")
    def admin_users(current_user: User = Depends(require_role("admin"))):
        ...
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="Keine Berechtigung für diese Aktion"
            )
        return current_user
    return role_checker
```

> **403 vs 401:** `401 Unauthorized` = "Wer bist du? Bitte einloggen." `403 Forbidden` = "Ich weiß wer du bist, aber du darfst das nicht."

**Schritt 2: Admin-Endpoint bauen**

In `app/main.py`:

```python
from app.dependencies import get_current_user, require_role


@app.get("/admin/users", response_model=list[UserResponse])
def admin_get_all_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Nur Admins können alle User sehen."""
    return db.query(User).all()
```

**Schritt 3: Testen**

1. **Als normaler User einloggen** → `GET /admin/users` → `403 Forbidden`
2. **Admin-User erstellen** (in der DB die Rolle auf "admin" setzen):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'max@example.com';
   ```
3. **Neu einloggen** (neuer Token nötig!) → `GET /admin/users` → `200 OK` mit User-Liste

**Schritt 4: Swagger UI "Authorize"-Button nutzen**

Das Beste an `OAuth2PasswordBearer`: Swagger UI zeigt automatisch einen "Authorize"-Button oben rechts. Dort kannst du deinen Token eingeben und alle geschützten Endpoints direkt testen – ohne curl oder Postman.

### Übersicht: Deine Auth-Endpoints

| Endpoint | Methode | Schutz | Beschreibung |
|----------|---------|--------|-------------|
| `/register` | POST | Keiner | Neuen User anlegen |
| `/login` | POST | Keiner | JWT-Token erhalten |
| `/me` | GET | Login (Token) | Eigenes Profil sehen |
| `/admin/users` | GET | Admin-Rolle | Alle User sehen |

### Wissensfrage 4

> Was ist der Unterschied zwischen HTTP 401 und 403?

<details markdown>
<summary>Antwort anzeigen</summary>

**401 Unauthorized** bedeutet: "Du bist nicht authentifiziert – ich weiß nicht wer du bist." Das passiert, wenn kein Token mitgeschickt wird oder der Token ungültig/abgelaufen ist. **403 Forbidden** bedeutet: "Du bist authentifiziert (ich weiß wer du bist), aber du hast nicht die nötige Berechtigung." Das passiert z.B. wenn ein normaler User einen Admin-Endpoint aufruft.

</details>

---

## Bonus: Refresh-Token-Konzept

In der aktuellen Implementierung hat der Access Token eine Lebensdauer von 30 Minuten. Danach muss der User sich neu einloggen. In der Praxis ist das nervig – stell dir vor, du wirst mitten in der Arbeit ausgeloggt.

### Das Problem

```
Access Token abgelaufen → User muss Passwort neu eingeben → schlechte UX
```

### Die Lösung: Access Token + Refresh Token

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#e3f2fd', 'primaryTextColor': '#0d47a1', 'primaryBorderColor': '#90caf9', 'secondaryColor': '#e8f5e9', 'secondaryTextColor': '#1b5e20', 'secondaryBorderColor': '#a5d6a7', 'tertiaryColor': '#fff3e0', 'tertiaryTextColor': '#e65100', 'tertiaryBorderColor': '#ffcc80', 'lineColor': '#78909c', 'fontSize': '14px'}}}%%
sequenceDiagram
    participant C as 🖥️ React
    participant B as ⚙️ FastAPI

    C->>B: POST /login
    B-->>C: access_token (30 min) + refresh_token (7 Tage)

    Note over C: Normaler Betrieb mit Access Token

    C->>B: GET /me (Access Token)
    B-->>C: 401 – Token abgelaufen!

    C->>B: POST /refresh (Refresh Token)
    B-->>C: Neuer access_token (30 min)

    Note over C: Weiterarbeiten ohne neu einloggen!
```

| Token | Lebensdauer | Zweck | Speicherort |
|-------|-------------|-------|-------------|
| Access Token | Kurz (15–30 min) | API-Zugriff | Memory oder localStorage |
| Refresh Token | Lang (7–30 Tage) | Neuen Access Token holen | Sicher gespeichert (httpOnly Cookie ideal) |

> **Die vollständige Implementierung** von Refresh Tokens kommt in **Übung 04 – Fullstack Integration**. Dort bauen wir es Backend + Frontend zusammen.

---

## Zusammenfassung

In dieser Übung hast du JWT-basierte Authentication in FastAPI eingebaut:

| Konzept | Was du gelernt hast |
|---------|-------------------|
| JWT-Aufbau | Header + Payload + Signature, signiert aber nicht verschlüsselt |
| python-jose | `jwt.encode()` und `jwt.decode()` für Token-Erstellung/Prüfung |
| `create_access_token()` | JWT erstellen mit User-ID, Rolle und Ablaufdatum |
| `OAuth2PasswordBearer` | FastAPI extrahiert automatisch den Token aus dem Header |
| `get_current_user` | Die zentrale Dependency: Token → User-Objekt |
| `require_role()` | Dependency-Factory für rollenbasierte Zugriffskontrolle |
| 401 vs 403 | Nicht authentifiziert vs nicht berechtigt |

### Was kommt als Nächstes?

Das Backend ist fertig! In der nächsten Übung (**03 – React Frontend**) baust du die andere Seite: Login-Formular, Token-Speicherung und geschützte Routes im React-Frontend.

---

## Checkliste

- [ ] Ich verstehe den Aufbau eines JWT (Header, Payload, Signature)
- [ ] Ich weiß, dass JWTs signiert, aber nicht verschlüsselt sind
- [ ] Ich kann mit python-jose JWT-Tokens erstellen und decodieren
- [ ] `app/auth.py` hat `create_access_token()` und `decode_access_token()`
- [ ] `SECRET_KEY` kommt aus der `.env`-Datei
- [ ] POST `/login` gibt einen JWT-Token zurück
- [ ] `get_current_user` Dependency extrahiert den User aus dem Token
- [ ] GET `/me` gibt den eingeloggten User zurück
- [ ] `require_role()` schützt Admin-Endpoints mit 403
- [ ] Swagger UI "Authorize"-Button funktioniert
