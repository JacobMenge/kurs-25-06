// Macht alle <abbr>-Elemente klickbar und verlinkt sie zum Glossar
document.addEventListener("DOMContentLoaded", function () {
  // Glossar-Pfad relativ zur Site-Root ermitteln
  var basePath = document.querySelector('meta[name="site_url"]');
  var siteUrl = basePath ? basePath.getAttribute("content") : "";
  // Fallback: relativer Pfad zum Glossar
  var glossarBase = siteUrl ? siteUrl + "glossar/#" : "/kurs-25-06/glossar/#";

  document.querySelectorAll("abbr").forEach(function (abbr) {
    // Nur wenn wir nicht bereits auf der Glossar-Seite sind
    if (window.location.pathname.indexOf("glossar") !== -1) return;

    var term = abbr.textContent.trim().toLowerCase();
    // Sonderzeichen fuer IDs bereinigen (z.B. CI/CD -> ci/cd)
    var anchor = term.replace(/\s+/g, "-");

    var link = document.createElement("a");
    link.href = glossarBase + anchor;
    link.title = abbr.title + " – Klicke fuer Details im Glossar";
    link.className = "glossar-link";

    abbr.parentNode.insertBefore(link, abbr);
    link.appendChild(abbr);
  });
});
