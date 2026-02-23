# Schnellreferenz: Redis

Diese Referenz enthält alle wichtigen Befehle und Code-Snippets für die Arbeit mit Redis.

---

## Verbindung herstellen

### redis-cli (Docker)

```bash
# Redis-Container starten
docker run -d --name redis -p 6379:6379 redis:7-alpine

# redis-cli öffnen
docker exec -it redis redis-cli

# Verbindung testen
PING
# → PONG
```

### Python (redis-py)

```python
import redis

# Einfache Verbindung
r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# Verbindung über URL (empfohlen für Docker)
r = redis.from_url("redis://localhost:6379/0", decode_responses=True)

# Verbindung testen
r.ping()  # True
```

---

## String-Befehle

Strings sind der einfachste Datentyp – Text, Zahlen oder serialisiertes JSON.

| Befehl | Beschreibung | Beispiel |
|--------|-------------|----------|
| `SET key value` | Wert speichern | `SET name "Max"` |
| `GET key` | Wert lesen | `GET name` → `"Max"` |
| `DEL key [key ...]` | Key(s) löschen | `DEL name alter` |
| `EXISTS key` | Prüfen ob Key existiert | `EXISTS name` → `1` oder `0` |
| `INCR key` | Wert um 1 erhöhen | `INCR zaehler` |
| `DECR key` | Wert um 1 verringern | `DECR zaehler` |
| `INCRBY key n` | Wert um n erhöhen | `INCRBY zaehler 5` |
| `MSET k1 v1 k2 v2` | Mehrere Werte setzen | `MSET a "1" b "2"` |
| `MGET k1 k2` | Mehrere Werte lesen | `MGET a b` |
| `APPEND key value` | Text anhängen | `APPEND name " Müller"` |

**Python:**

```python
r.set("name", "Max")
r.get("name")            # "Max"
r.incr("zaehler")        # 1
r.mset({"a": "1", "b": "2"})
r.mget("a", "b")         # ["1", "2"]
```

---

## Listen-Befehle

Listen sind geordnete Sammlungen (wie Arrays). Gut für Queues, Activity Feeds, Chat-Verläufe.

| Befehl | Beschreibung | Beispiel |
|--------|-------------|----------|
| `LPUSH key value` | Am Anfang einfügen | `LPUSH liste "neu"` |
| `RPUSH key value` | Am Ende einfügen | `RPUSH liste "hinten"` |
| `LRANGE key start stop` | Bereich lesen | `LRANGE liste 0 -1` (alle) |
| `LPOP key` | Erstes Element entfernen | `LPOP liste` |
| `RPOP key` | Letztes Element entfernen | `RPOP liste` |
| `LLEN key` | Länge der Liste | `LLEN liste` |
| `LINDEX key index` | Element an Position lesen | `LINDEX liste 0` |
| `LTRIM key start stop` | Liste auf Bereich kürzen | `LTRIM liste 0 99` |

**Python:**

```python
r.lpush("feed", "Neuer Eintrag")
r.rpush("feed", "Am Ende")
r.lrange("feed", 0, -1)   # Alle Elemente
r.lpop("feed")             # Erstes Element
r.llen("feed")             # Länge
```

---

## Hash-Befehle

Hashes speichern Feld-Wert-Paare unter einem Key (wie Python-Dicts oder JS-Objekte).

| Befehl | Beschreibung | Beispiel |
|--------|-------------|----------|
| `HSET key feld wert` | Feld setzen | `HSET user:1 name "Max"` |
| `HGET key feld` | Einzelnes Feld lesen | `HGET user:1 name` |
| `HGETALL key` | Alle Felder lesen | `HGETALL user:1` |
| `HDEL key feld` | Feld löschen | `HDEL user:1 alter` |
| `HEXISTS key feld` | Prüfen ob Feld existiert | `HEXISTS user:1 email` |
| `HKEYS key` | Alle Feldnamen | `HKEYS user:1` |
| `HVALS key` | Alle Werte | `HVALS user:1` |
| `HINCRBY key feld n` | Zahlenwert erhöhen | `HINCRBY user:1 punkte 10` |

**Python:**

```python
r.hset("user:1", mapping={"name": "Max", "email": "max@example.com"})
r.hget("user:1", "name")        # "Max"
r.hgetall("user:1")             # {"name": "Max", "email": "max@example.com"}
r.hdel("user:1", "email")
```

---

## Set-Befehle

Sets sind ungeordnete Sammlungen ohne Duplikate. Gut für Unique-Tracking, Tags, Berechtigungen.

| Befehl | Beschreibung | Beispiel |
|--------|-------------|----------|
| `SADD key member` | Element hinzufügen | `SADD tags "python"` |
| `SMEMBERS key` | Alle Elemente anzeigen | `SMEMBERS tags` |
| `SISMEMBER key member` | Prüfen ob enthalten | `SISMEMBER tags "python"` → `1` |
| `SREM key member` | Element entfernen | `SREM tags "python"` |
| `SCARD key` | Anzahl der Elemente | `SCARD tags` |
| `SUNION key1 key2` | Vereinigung zweier Sets | `SUNION tags1 tags2` |
| `SINTER key1 key2` | Schnittmenge zweier Sets | `SINTER tags1 tags2` |

**Python:**

```python
r.sadd("besucher", "user:1", "user:2", "user:1")  # user:1 nur 1x
r.smembers("besucher")        # {"user:1", "user:2"}
r.sismember("besucher", "user:1")  # True
r.scard("besucher")           # 2
```

---

## TTL & Expiry

TTL (Time To Live) lässt Keys automatisch nach einer bestimmten Zeit verschwinden.

| Befehl | Beschreibung | Beispiel |
|--------|-------------|----------|
| `SET key value EX sekunden` | Setzen mit TTL | `SET token "abc" EX 3600` |
| `EXPIRE key sekunden` | TTL nachträglich setzen | `EXPIRE name 60` |
| `TTL key` | Verbleibende Sekunden | `TTL token` → `3540` |
| `PTTL key` | Verbleibende Millisekunden | `PTTL token` → `3540000` |
| `PERSIST key` | TTL entfernen (permanent) | `PERSIST token` |

**TTL-Rückgabewerte:**

| Wert | Bedeutung |
|------|-----------|
| Positive Zahl | Verbleibende Sekunden |
| `-1` | Key existiert, keine TTL gesetzt |
| `-2` | Key existiert nicht |

**Python:**

```python
r.set("session", "daten", ex=1800)  # 30 Min TTL
r.ttl("session")                     # Verbleibende Sekunden
r.expire("name", 60)                 # TTL nachträglich setzen
r.persist("name")                    # TTL entfernen
```

---

## Server-Befehle

| Befehl | Beschreibung | Beispiel |
|--------|-------------|----------|
| `PING` | Verbindung testen | `PING` → `PONG` |
| `INFO [section]` | Server-Informationen | `INFO memory` |
| `DBSIZE` | Anzahl aller Keys | `DBSIZE` → `42` |
| `FLUSHDB` | Aktuelle DB leeren | `FLUSHDB` |
| `FLUSHALL` | Alle DBs leeren | `FLUSHALL` |
| `KEYS pattern` | Keys suchen (**nur Dev!**) | `KEYS user:*` |
| `SCAN cursor MATCH pattern COUNT n` | Keys suchen (**produktionssicher**) | `SCAN 0 MATCH user:* COUNT 100` |

**Python:**

```python
r.ping()                     # True
r.info("memory")             # Dict mit Speicher-Infos
r.dbsize()                   # Anzahl Keys
r.keys("user:*")             # ⚠️ Nur in Dev! Blockiert bei vielen Keys

# Produktionssicher: scan_iter statt keys
for key in r.scan_iter(match="user:*", count=100):
    print(key)
```

---

## Patterns für FastAPI

### Cache-Aside

```python
import json

CACHE_TTL = 60

def get_cached(key):
    """Cache lesen – gibt None zurück bei MISS."""
    cached = redis_client.get(f"cache:{key}")
    return json.loads(cached) if cached else None

def set_cached(key, data, ttl=CACHE_TTL):
    """Daten in den Cache schreiben (mit cache: Prefix)."""
    redis_client.set(f"cache:{key}", json.dumps(data), ex=ttl)

def invalidate(key):
    """Cache-Eintrag löschen."""
    redis_client.delete(f"cache:{key}")

def clear_all_cache():
    """Alle Cache-Einträge löschen (Sessions/Rate-Limits bleiben)."""
    for key in redis_client.scan_iter(match="cache:*", count=100):
        redis_client.delete(key)
```

### Session-Store

```python
import secrets

def create_session(user_data, ttl=1800):
    token = secrets.token_hex(32)
    redis_client.hset(f"session:{token}", mapping=user_data)
    redis_client.expire(f"session:{token}", ttl)
    return token

def get_session(token):
    return redis_client.hgetall(f"session:{token}")

def delete_session(token):
    redis_client.delete(f"session:{token}")
```

### Rate Limiting

```python
def is_rate_limited(client_ip, limit=10, window=60):
    key = f"rate:{client_ip}"
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, window)
    return current > limit
```

---

## Docker

### Einzelner Container

```bash
# Starten
docker run -d --name redis -p 6379:6379 redis:7-alpine

# redis-cli
docker exec -it redis redis-cli

# Stoppen & Entfernen
docker stop redis && docker rm redis
```

### Docker Compose (Minimal)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Docker Compose (Mit Persistenz + Health Check)

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  redisdata:
```

---

## Namenskonventionen

Nutze einheitliche Prefixe, damit du Keys gezielt finden und löschen kannst (z.B. alle Cache-Keys mit `scan_iter(match="cache:*")`):

| Prefix | Pattern | Beispiel | Verwendung |
|--------|---------|----------|-----------|
| `cache:` | `cache:typ:id` | `cache:user:42` | Gecachtes Einzelobjekt |
| `cache:` | `cache:typ:all` | `cache:items:all` | Gecachte Liste |
| `session:` | `session:token` | `session:abc123...` | Session-Daten |
| `rate:` | `rate:ip` | `rate:192.168.1.1` | Rate-Limit-Zähler |

> **Faustregel:** Ein klares Prefix-Schema macht Cache-Invalidierung trivial und verhindert Key-Wildwuchs.
