---
tags:
  - Auth
  - JWT
  - Security
  - FastAPI
  - React
  - Schnellreferenz
---
# Schnellreferenz: Authentication

Diese Referenz enthält alle wichtigen Code-Snippets und Patterns für JWT-basierte Authentication mit FastAPI + React.

---

## Abhängigkeiten

### Python (Backend)

```bash
pip install "passlib[bcrypt]" "python-jose[cryptography]"
```

### Frontend

Keine neuen Pakete nötig – `fetch`, `react-router-dom` und Context API reichen.

---

## Token im Request mitschicken

Jeder authentifizierte Request braucht diesen Header:

```
Authorization: Bearer <access_token>
```

Beispiel mit curl:

```bash
curl http://localhost:8000/me -H "Authorization: Bearer eyJhbGciOiJIUzI1NiI..."
```

---

## Password Hashing

### passlib/bcrypt

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Passwort hashen
hashed = pwd_context.hash("geheim123")

# Passwort prüfen
pwd_context.verify("geheim123", hashed)  # True
pwd_context.verify("falsch", hashed)     # False
```

### Utility-Funktionen (`app/auth.py`)

```python
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

---

## JWT-Tokens

### Token erstellen und decodieren

```python
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### Refresh Token

```python
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### JWT-Aufbau

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3MzUwMDB9.K7xRf3xG9mQ2...
 ↑ Header                ↑ Payload                                                   ↑ Signature
```

| Claim | Bedeutung | Beispiel |
|-------|-----------|----------|
| `sub` | User-ID | `"1"` |
| `role` | Rolle | `"user"`, `"admin"` |
| `exp` | Ablaufdatum | Unix-Timestamp |
| `iat` | Erstelldatum | Unix-Timestamp |
| `type` | Token-Typ (bei Refresh) | `"refresh"` |

---

## FastAPI Dependencies

### get_current_user

```python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token ungültig")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token ungültig oder abgelaufen")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User nicht gefunden")
    return user
```

### require_role

```python
def require_role(required_role: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        return current_user
    return role_checker
```

### Verwendung in Endpoints

```python
# Nur eingeloggte User
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Nur Admins
@app.get("/admin/users")
def admin_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(User).all()
```

---

## Pydantic Schemas

```python
from pydantic import BaseModel


class UserRegister(BaseModel):
    email: str
    name: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshRequest(BaseModel):
    refresh_token: str
```

---

## FastAPI Endpoints

```python
# Registrierung
@app.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email bereits registriert")
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role="user",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login
@app.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    token_data = {"sub": str(user.id), "role": user.role}
    return {
        "access_token": create_access_token(data=token_data),
        "refresh_token": create_refresh_token(data=token_data),
        "token_type": "bearer",
    }

# Refresh
@app.post("/refresh")
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Kein Refresh Token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token ungültig")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User nicht gefunden")
    return {
        "access_token": create_access_token(data={"sub": str(user.id), "role": user.role}),
        "token_type": "bearer",
    }
```

---

## React Auth Patterns

### AuthContext

```jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, setRefreshToken, removeTokens, authFetch } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      authFetch("/me")
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then(setUser)
        .catch(() => removeTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const data = await res.json();
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    const me = await authFetch("/me");
    setUser(await me.json());
  }

  function logout() {
    removeTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb AuthProvider verwendet werden");
  return ctx;
}
```

### ProtectedRoute

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) return <p>Laden...</p>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
```

### authFetch (mit Refresh)

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function authFetch(url, options = {}) {
  const token = getToken();

  // Headers zusammenbauen
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      };
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      removeTokens();
      window.location.href = "/login";
    }
  }
  return response;
}
```

---

## CORS-Konfiguration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> **Wichtig:** Keine Wildcard `"*"` bei `allow_origins` wenn `allow_credentials=True`!

---

## Docker Environment Variables

### .env

```bash
POSTGRES_USER=kursapp
POSTGRES_PASSWORD=sicheres-passwort
POSTGRES_DB=kursapp
SECRET_KEY=generiert-mit-secrets-token-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://kursapp:sicheres-passwort@postgres:5432/kursapp
```

### Secret Key generieren

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### docker-compose.yml (Minimal)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: ${ALGORITHM}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES}
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

---

## Security Checklist

| ✅ Do | ❌ Don't |
|------|---------|
| Passwörter mit bcrypt hashen | Passwörter im Klartext speichern |
| SECRET_KEY aus .env laden | SECRET_KEY im Code hardcoden |
| .env in .gitignore | .env ins Repository committen |
| Generische Login-Fehlermeldungen | "Email nicht gefunden" / "Passwort falsch" |
| Access Tokens kurz (15-30 min) | Access Tokens tagelang gültig |
| HTTPS in Produktion | Auth-Daten über HTTP senden |
| Mindestlänge 8+ Zeichen | Sinnlose Zeichenklassen-Regeln |
| Backend-seitig prüfen | Nur Frontend-Schutz (ProtectedRoute) |
| `UserResponse` ohne Passwort-Hash | Hash in API-Response leaken |

**Token-Speicherung Faustregel:**
- **Lernprojekte:** `localStorage` + kurze Access Tokens + Logout bei 401
- **Produktion:** httpOnly Cookie + SameSite/Secure + CSRF-Schutz + Token-Rotation

---

## HTTP Status Codes für Auth

| Code | Bedeutung | Wann |
|------|-----------|------|
| `200 OK` | Erfolgreich | Login, Refresh, GET /me |
| `201 Created` | Erstellt | Registrierung |
| `401 Unauthorized` | Nicht authentifiziert | Kein/ungültiger Token, falsches Passwort |
| `403 Forbidden` | Nicht berechtigt | Falsche Rolle (User statt Admin) |
| `409 Conflict` | Konflikt | Email bereits registriert |
| `422 Unprocessable Entity` | Validierungsfehler | Fehlende/falsche Felder im Request |
| `429 Too Many Requests` | Rate Limit | Zu viele Login-Versuche |

---

## Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `ModuleNotFoundError: passlib` | Nicht installiert | `pip install "passlib[bcrypt]"` |
| `ModuleNotFoundError: jose` | Nicht installiert | `pip install "python-jose[cryptography]"` |
| `401` obwohl Token vorhanden | Format falsch | `Authorization: Bearer <token>` (mit "Bearer "!) |
| `401` sofort nach Login | SECRET_KEY stimmt nicht | Gleicher Key für Erstellen und Prüfen |
| `422` bei Login | Body falsch | JSON-Body senden, nicht Query-Parameter |
| CORS-Fehler | Origins oder Credentials falsch | Exakte Origins, `allow_credentials=True` |
| `ExpiredSignatureError` | Token abgelaufen | Neuer Login oder Refresh Token verwenden |
| Frontend-Loop | ProtectedRoute auf Login-Seite | `/login` darf NICHT in ProtectedRoute sein |
| User `null` nach Reload | Token in localStorage, aber `/me` fehlt | `loadUser()` im AuthContext `useEffect` |
