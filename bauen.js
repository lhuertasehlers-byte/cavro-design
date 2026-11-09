// =====================================================================
//  Baut aus den Dateien in inhalt/ die Datei daten.js, die die Seite lädt.
//  Netlify führt das bei jeder Änderung automatisch aus (siehe netlify.toml).
//  Selbst ausprobieren:  node bauen.js
// =====================================================================
const fs = require('fs');
const path = require('path');

const ORDNER = path.join(__dirname, 'inhalt', 'produkte');
const AUSSCHNITT = { links: '35% 50%', rechts: '70% 50%' };

// "Salbeigrün" → "salbeigruen", "Ring Astrea" → "ringastrea" (für Links wie #p-vera-salbeigruen)
function kurzname(text) {
  return String(text || '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}
// "/img/foto.jpg" → "img/foto.jpg", damit die Seite überall funktioniert
const bildpfad = f => String(f || '').replace(/^\/+/, '');

const fehler = [];
const produkte = fs.readdirSync(ORDNER).filter(f => f.endsWith('.json')).map(datei => {
  const d = JSON.parse(fs.readFileSync(path.join(ORDNER, datei), 'utf8'));
  const id = kurzname(datei.replace(/\.json$/, '')) || kurzname(d.name);
  const varianten = (d.varianten || []).filter(v => v && v.foto);
  if (!d.name) fehler.push(`${datei}: Name fehlt`);
  if (!varianten.length) fehler.push(`${datei}: kein Foto`);
  if (!(Number(d.preis) > 0)) fehler.push(`${datei}: Preis fehlt`);
  const p = {
    id, name: d.name, art: d.art === 'ring' ? 'ring' : 'ohrring', preis: Number(d.preis) || 0,
    position: Number(d.position) || 999, startseite: !!d.startseite
  };
  if (d.ausverkauft) p.ausverkauft = true;
  if (d.beschreibung && d.beschreibung.trim()) p.beschreibung = d.beschreibung.trim();
  if (AUSSCHNITT[d.bildausschnitt]) p.pos = AUSSCHNITT[d.bildausschnitt];
  // mehrere Farben/Metalle → Auswahl; nur ein Foto ohne Farbe → einfaches Produkt
  if (varianten.length > 1 || (varianten[0] && varianten[0].farbe)) {
    p.varianten = varianten.map((v, i) => ({
      farbe: kurzname(v.farbe) || 'variante' + (i + 1),
      farbname: v.farbe || 'Variante ' + (i + 1),
      bild: bildpfad(v.foto),
      ...(v.namensfarbe ? { ton: v.namensfarbe } : {})
    }));
  } else if (varianten[0]) {
    p.bild = bildpfad(varianten[0].foto);
    if (varianten[0].namensfarbe) p.ton = varianten[0].namensfarbe;
  }
  return p;
}).filter(p => p.bild || p.varianten)
  .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, 'de'));

// Startseite: die ersten vier mit Häkchen „Auf der Startseite zeigen“
const startseite = produkte.filter(p => p.startseite && !p.ausverkauft).slice(0, 4).map(p => p.id);

let texte = {};
try { texte = JSON.parse(fs.readFileSync(path.join(__dirname, 'inhalt', 'texte.json'), 'utf8')); } catch (e) {}

// Auf Netlify werden Fotos automatisch verkleinert (Netlify Image CDN), damit große Handyfotos die Seite nicht bremsen
const netlifyBilder = !!process.env.NETLIFY;
const daten = { produkte: produkte.map(({ position, startseite, ...rest }) => rest), startseite, texte, netlifyBilder };
fs.writeFileSync(path.join(__dirname, 'daten.js'),
  '// Automatisch erzeugt von bauen.js – nicht von Hand ändern, sondern im Verwaltungsbereich (/admin).\n' +
  'window.CAVRO_DATEN = ' + JSON.stringify(daten, null, 1) + ';\n');

fehler.forEach(f => console.warn('Achtung:', f));
console.log(`daten.js gebaut: ${produkte.length} Produkte, Startseite: ${startseite.join(', ')}`);
