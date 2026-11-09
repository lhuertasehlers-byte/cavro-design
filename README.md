# CAVRØ Design – Shop

Eigene Seite für CAVRØ Design (handgemachte Ohrringe und Ringe). Zugriff zur Kontrolle über die Website und Veränderung.

- **Produkte und Texte pflegen:** unter `/admin` (Decap CMS). Nichts im Code nötig.
- `inhalt/produkte/` – ein Produkt pro Datei
- `inhalt/texte.json` – Texte der Startseite
- `img/` – Fotos (Uploads aus dem Verwaltungsbereich landen hier)
- `bauen.js` – macht daraus `daten.js`, die die Seite lädt. Netlify führt das automatisch aus (`netlify.toml`).
- `index.html` – die Seite selbst (Design, Shop, Warenkorb)
- `impressum.html`, `datenschutz.html`, `agb.html`, `widerruf.html`, `versand.html` – Rechtstexte (Entwurf, vor dem Livegang prüfen lassen)

Lokal ansehen: `node bauen.js`, dann `index.html` im Browser öffnen.
