---
title: Lernpfade
---

# Lernpfade – Dein Weg durch den Kurs

Diese Seite zeigt dir, wie die verschiedenen Themen des Kurses zusammenhängen und aufeinander aufbauen.

---

## Gesamtübersicht

```mermaid
flowchart LR
    A[IT Grundlagen] --> B[Linux & Bash]
    B --> C[Python Basics]
    C --> D[Python OOP]
    D --> E[FastAPI & REST]
    E --> F[SQL & Datenbanken]

    A --> G[HTML & CSS]
    G --> H[JavaScript]
    H --> I[React]
    I --> J[React Advanced]
    J --> K[Fullstack]
    K --> L[Docker]

    F --> K
    E --> K

    style A fill:#060F38,color:#fff
    style B fill:#060F38,color:#fff
    style L fill:#060F38,color:#fff
```

---

## Backend-Pfad

Vom ersten Python-Skript bis zur fertigen API in der Cloud.

```mermaid
flowchart TD
    A["Python Syntax & Operatoren
    (Modul 2, Woche 5)"] --> B["Schleifen & Datenstrukturen
    (Modul 2, Woche 6)"]
    B --> C["Funktionen
    (Modul 2, Woche 6)"]
    C --> D["OOP – Klassen & Objekte
    (Modul 2, Woche 7)"]
    D --> E["Git Versionskontrolle
    (Modul 2, Woche 7)"]
    E --> F["HTTP & REST Grundlagen
    (Modul 2, Woche 8)"]
    F --> G["FastAPI Basics
    (Modul 2, Woche 8)"]
    G --> H["SQL & SQLite
    (Modul 2, Woche 9)"]
    H --> I["Mini-API Projekt
    (Modul 2, Woche 10)"]
    I --> J["PostgreSQL
    (Modul 3, Woche 7)"]
    J --> K["Docker & Deployment
    (Modul 3, Woche 8)"]

    style A fill:#060F38,color:#fff
    style K fill:#060F38,color:#fff
```

---

## Frontend-Pfad

Von der ersten HTML-Seite bis zur interaktiven React-Anwendung.

```mermaid
flowchart TD
    A["Webarchitektur & HTTP
    (Modul 3, Woche 1)"] --> B["HTML Struktur & Formulare
    (Modul 3, Woche 1)"]
    B --> C["CSS Grundlagen & Layout
    (Modul 3, Woche 1)"]
    C --> D["Responsive Design
    (Modul 3, Woche 1)"]
    D --> E["JavaScript Fundamentals
    (Modul 3, Woche 2)"]
    E --> F["DOM & Events
    (Modul 3, Woche 2)"]
    F --> G["Fetch & APIs
    (Modul 3, Woche 2)"]
    G --> H["React Setup & JSX
    (Modul 3, Woche 3)"]
    H --> I["Komponenten & Props
    (Modul 3, Woche 3)"]
    I --> J["useState & State
    (Modul 3, Woche 3)"]
    J --> K["Hooks & useEffect
    (Modul 3, Woche 4)"]
    K --> L["React Router
    (Modul 3, Woche 4)"]
    L --> M["Context API
    (Modul 3, Woche 5)"]
    M --> N["Fullstack Projekt
    (Modul 3, Woche 6)"]

    style A fill:#060F38,color:#fff
    style N fill:#060F38,color:#fff
```

---

## DevOps-Pfad

Vom Terminal bis zur Cloud-Infrastruktur.

```mermaid
flowchart TD
    A["Linux Grundlagen
    (Modul 2, Woche 1)"] --> B["Bash Befehle & Scripting
    (Modul 1, Woche 7)"]
    B --> C["Git & GitHub
    (Modul 2, Woche 7)"]
    C --> D["AWS CLI
    (Modul 2, Woche 4)"]
    D --> E["EC2 & S3
    (Modul 2, Woche 4)"]
    E --> F["Docker Grundlagen
    (Modul 3, Woche 8)"]
    F --> G["Dockerfile & Images
    (Modul 3, Woche 8)"]
    G --> H["Docker Networking
    (Modul 3, Woche 8)"]
    H --> I["Docker Compose
    (Modul 3, Woche 8)"]
    I --> J["Deployment auf EC2
    (Modul 2, Woche 10)"]

    style A fill:#060F38,color:#fff
    style J fill:#060F38,color:#fff
```

---

## Legende

!!! info "Wie liest man die Diagramme?"
    - **Pfeile** zeigen Abhängigkeiten: Du solltest das Thema oben verstanden haben, bevor du zum nächsten gehst
    - **Modul- und Wochenangaben** helfen dir, das Thema im Kurs zu finden
    - Die Pfade überschneiden sich – z.B. brauchst du Backend-Wissen für das Fullstack-Projekt
    - Du musst nicht jeden Pfad linear durcharbeiten – nutze die Pfade als Orientierung
