---
title: JavaScript Cheat Sheet
tags:
  - JavaScript
  - Cheat-Sheet
---

# JavaScript Cheat Sheet

Kompakte Referenz fuer die wichtigsten JavaScript-Konzepte und -Methoden.

---

## Variablen

```javascript
// let - veraenderbar, Block-Scope
let zaehler = 0;
zaehler = 1;

// const - unveraenderbar, Block-Scope
const PI = 3.14159;
// PI = 3; // Fehler!

// const bei Objekten/Arrays: Referenz ist fest, Inhalt aenderbar
const liste = [1, 2, 3];
liste.push(4);        // Erlaubt
// liste = [5, 6];    // Fehler!
```

!!! warning "var vermeiden"
    `var` hat Function-Scope statt Block-Scope und wird gehoisted. Verwende stattdessen immer `let` oder `const`.

---

## Datentypen

| Typ | Beispiel | Pruefung |
|---|---|---|
| `string` | `"Hallo"`, `'Welt'`, `` `Template` `` | `typeof x === "string"` |
| `number` | `42`, `3.14`, `NaN`, `Infinity` | `typeof x === "number"` |
| `boolean` | `true`, `false` | `typeof x === "boolean"` |
| `undefined` | `undefined` | `typeof x === "undefined"` |
| `null` | `null` | `x === null` |
| `object` | `{}`, `[]`, `new Date()` | `typeof x === "object"` |
| `symbol` | `Symbol("id")` | `typeof x === "symbol"` |

```javascript
// Typkonvertierung
String(42)        // "42"
Number("42")      // 42
Boolean(0)        // false
Boolean("")       // false
Boolean(null)     // false
Boolean(undefined) // false
parseInt("42px")  // 42
parseFloat("3.14") // 3.14

// Falsy-Werte: false, 0, "", null, undefined, NaN
// Alles andere ist truthy
```

---

## Arrays & Array-Methoden

=== "map"

    Erstellt ein neues Array, indem eine Funktion auf jedes Element angewendet wird.

    ```javascript
    const zahlen = [1, 2, 3, 4, 5];

    const verdoppelt = zahlen.map(x => x * 2);
    // [2, 4, 6, 8, 10]

    const namen = ["max", "anna", "tom"];
    const gross = namen.map(name => name.toUpperCase());
    // ["MAX", "ANNA", "TOM"]

    // Mit Index
    const mitIndex = namen.map((name, index) => `${index}: ${name}`);
    // ["0: max", "1: anna", "2: tom"]
    ```

=== "filter"

    Erstellt ein neues Array mit allen Elementen, die eine Bedingung erfuellen.

    ```javascript
    const zahlen = [1, 2, 3, 4, 5, 6, 7, 8];

    const gerade = zahlen.filter(x => x % 2 === 0);
    // [2, 4, 6, 8]

    const produkte = [
        { name: "Laptop", preis: 999 },
        { name: "Maus", preis: 29 },
        { name: "Monitor", preis: 450 },
    ];

    const teuer = produkte.filter(p => p.preis > 100);
    // [{ name: "Laptop", preis: 999 }, { name: "Monitor", preis: 450 }]
    ```

=== "reduce"

    Reduziert ein Array auf einen einzelnen Wert.

    ```javascript
    const zahlen = [1, 2, 3, 4, 5];

    // Summe berechnen
    const summe = zahlen.reduce((acc, curr) => acc + curr, 0);
    // 15

    // Objekt aufbauen
    const fruechte = ["Apfel", "Birne", "Apfel", "Kirsche", "Birne", "Apfel"];
    const anzahl = fruechte.reduce((acc, frucht) => {
        acc[frucht] = (acc[frucht] || 0) + 1;
        return acc;
    }, {});
    // { Apfel: 3, Birne: 2, Kirsche: 1 }
    ```

=== "forEach"

    Fuehrt eine Funktion fuer jedes Element aus (kein Rueckgabewert).

    ```javascript
    const namen = ["Max", "Anna", "Tom"];

    namen.forEach(name => {
        console.log(`Hallo, ${name}!`);
    });

    // Mit Index
    namen.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
    });
    ```

=== "Weitere"

    ```javascript
    const zahlen = [3, 1, 4, 1, 5, 9];

    // find - Erstes Element das Bedingung erfuellt
    zahlen.find(x => x > 4);          // 5

    // findIndex - Index des ersten Treffers
    zahlen.findIndex(x => x > 4);     // 4

    // some - Mindestens ein Element erfuellt Bedingung
    zahlen.some(x => x > 8);          // true

    // every - Alle Elemente erfuellen Bedingung
    zahlen.every(x => x > 0);         // true

    // includes - Element vorhanden?
    zahlen.includes(4);               // true

    // sort - Sortieren (veraendert Original!)
    zahlen.sort((a, b) => a - b);     // Aufsteigend
    zahlen.sort((a, b) => b - a);     // Absteigend

    // slice - Teilarray (ohne Original zu aendern)
    zahlen.slice(1, 3);               // [1, 4]

    // splice - Elemente entfernen/einfuegen (veraendert Original)
    zahlen.splice(2, 1);              // Entfernt 1 Element ab Index 2

    // flat - Verschachtelte Arrays flach machen
    [[1, 2], [3, 4]].flat();          // [1, 2, 3, 4]

    // join - Array zu String
    ["Hallo", "Welt"].join(" ");      // "Hallo Welt"
    ```

---

## Objekte

```javascript
// Erstellen
const person = {
    vorname: "Max",
    nachname: "Mustermann",
    alter: 30,
    adresse: {
        stadt: "Berlin",
        plz: "10115"
    },
    vorstellen() {
        return `Ich bin ${this.vorname} ${this.nachname}`;
    }
};

// Zugriff
person.vorname;           // "Max"
person["nachname"];       // "Mustermann"
person.adresse.stadt;     // "Berlin"

// Hinzufuegen / Aendern
person.email = "max@mail.de";
person.alter = 31;

// Loeschen
delete person.email;

// Pruefen ob Eigenschaft existiert
"vorname" in person;              // true
person.hasOwnProperty("email");   // false

// Nuetzliche Methoden
Object.keys(person);     // ["vorname", "nachname", "alter", ...]
Object.values(person);   // ["Max", "Mustermann", 31, ...]
Object.entries(person);  // [["vorname", "Max"], ...]
```

---

## Funktionen

=== "Arrow Functions"

    ```javascript
    // Kurzform (ein Parameter, ein Ausdruck)
    const verdoppeln = x => x * 2;

    // Mehrere Parameter
    const addieren = (a, b) => a + b;

    // Mehrere Zeilen
    const begruessen = (name) => {
        const nachricht = `Hallo, ${name}!`;
        return nachricht;
    };

    // Objekt zurueckgeben (Klammern noetig)
    const erstellePerson = (name, alter) => ({ name, alter });
    ```

=== "Regulaere Funktionen"

    ```javascript
    // Funktionsdeklaration (wird gehoisted)
    function addieren(a, b) {
        return a + b;
    }

    // Funktionsausdruck (wird NICHT gehoisted)
    const multiplizieren = function(a, b) {
        return a * b;
    };

    // Standardwerte
    function begruessen(name = "Welt") {
        return `Hallo, ${name}!`;
    }

    // Rest-Parameter
    function summe(...zahlen) {
        return zahlen.reduce((a, b) => a + b, 0);
    }
    summe(1, 2, 3, 4); // 10
    ```

!!! info "Arrow vs. Regular"
    Arrow Functions haben kein eigenes `this`. Sie eignen sich fuer Callbacks und kurze Ausdruecke. Fuer Methoden in Objekten oder Konstruktoren verwende regulaere Funktionen.

---

## DOM-Manipulation

```javascript
// Elemente auswaehlen
const element = document.querySelector(".klasse");
const element2 = document.querySelector("#id");
const alle = document.querySelectorAll("p");
const byId = document.getElementById("mein-element");

// Inhalt aendern
element.textContent = "Neuer Text";          // Nur Text
element.innerHTML = "<strong>HTML</strong>";  // Mit HTML

// Attribute
element.setAttribute("class", "aktiv");
element.getAttribute("href");
element.removeAttribute("disabled");
element.classList.add("sichtbar");
element.classList.remove("versteckt");
element.classList.toggle("aktiv");

// Styling
element.style.color = "red";
element.style.display = "none";

// Elemente erstellen und einfuegen
const neues = document.createElement("div");
neues.textContent = "Neues Element";
neues.classList.add("karte");
document.body.appendChild(neues);

// Element entfernen
element.remove();
```

### Event Handling

```javascript
// Event Listener hinzufuegen
const button = document.querySelector("#mein-button");

button.addEventListener("click", (event) => {
    console.log("Geklickt!", event.target);
});

// Haeufige Events
// click, dblclick, mouseenter, mouseleave
// keydown, keyup, keypress
// submit, change, input, focus, blur
// load, DOMContentLoaded, scroll, resize

// Formular absenden verhindern
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    console.log(formData.get("benutzername"));
});
```

---

## Fetch & Async/Await

=== "Async/Await"

    ```javascript
    // GET-Anfrage
    async function datenLaden() {
        try {
            const response = await fetch("https://api.example.com/daten");

            if (!response.ok) {
                throw new Error(`HTTP Fehler: ${response.status}`);
            }

            const daten = await response.json();
            console.log(daten);
            return daten;
        } catch (fehler) {
            console.error("Fehler beim Laden:", fehler);
        }
    }

    // POST-Anfrage
    async function datenSenden(nutzerDaten) {
        try {
            const response = await fetch("https://api.example.com/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(nutzerDaten),
            });

            const ergebnis = await response.json();
            return ergebnis;
        } catch (fehler) {
            console.error("Fehler beim Senden:", fehler);
        }
    }
    ```

=== "Promises"

    ```javascript
    // Promise erstellen
    const meinePromise = new Promise((resolve, reject) => {
        const erfolg = true;
        if (erfolg) {
            resolve("Erfolgreich!");
        } else {
            reject("Fehlgeschlagen!");
        }
    });

    // Promise verwenden
    meinePromise
        .then(ergebnis => console.log(ergebnis))
        .catch(fehler => console.error(fehler))
        .finally(() => console.log("Fertig"));

    // Mehrere Promises parallel
    const ergebnisse = await Promise.all([
        fetch("/api/users"),
        fetch("/api/produkte"),
        fetch("/api/bestellungen"),
    ]);

    // Promise.allSettled - Wartet auf alle, auch bei Fehlern
    const alle = await Promise.allSettled([
        fetch("/api/users"),
        fetch("/api/produkte"),
    ]);
    // [{ status: "fulfilled", value: ... }, { status: "rejected", reason: ... }]
    ```

---

## Destructuring & Spread

```javascript
// Array Destructuring
const [a, b, c] = [1, 2, 3];
const [erste, ...rest] = [1, 2, 3, 4, 5]; // erste=1, rest=[2,3,4,5]
const [x, , z] = [1, 2, 3];  // x=1, z=3 (zweites uebersprungen)

// Objekt Destructuring
const { vorname, nachname, alter } = person;
const { vorname: vn, nachname: nn } = person; // Umbenennen
const { stadt = "Unbekannt" } = person;        // Standardwert

// Verschachteltes Destructuring
const { adresse: { stadt, plz } } = person;

// In Funktionsparametern
function anzeigen({ vorname, nachname, alter = 0 }) {
    console.log(`${vorname} ${nachname}, ${alter}`);
}
anzeigen(person);

// Spread-Operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];          // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };        // { a: 1, b: 2, c: 3 }
const obj3 = { ...obj1, b: 99 };       // { a: 1, b: 99 } (ueberschreibt)

// Kopieren (flache Kopie)
const kopie = [...arr1];
const objKopie = { ...obj1 };
```

!!! tip "Template Literals"
    Verwende Backticks fuer mehrzeilige Strings und Variablen-Interpolation:

    ```javascript
    const name = "Max";
    const alter = 30;
    const nachricht = `Hallo ${name},
    du bist ${alter} Jahre alt.
    In 10 Jahren bist du ${alter + 10}.`;
    ```
