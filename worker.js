// worker.js
// Cloudflare Worker – Animation: Mineralischer vs. Chemischer Sonnenschutz

export default {
  fetch(request) {
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
};

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Sonnenschutz – Mineralisch vs. Chemisch</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
/* ===============================
   BASIS & RESET
   =============================== */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: Arial, Helvetica, sans-serif;
  background: #eef1f4;
  color: #222;
}
h1 { text-align: center; padding: 20px; }

/* ===============================
   LAYOUT
   =============================== */
.wrapper {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}
.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.panel {
  background: #fff;
  border-radius: 14px;
  height: 420px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}
.panel h2 {
  text-align: center;
  padding: 12px;
  background: #f7f7f7;
}

/* ===============================
   HAUT
   =============================== */
.skin {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 110px;
  background: linear-gradient(#f3caa2, #e0ae7f);
}

/* ===============================
   UV-STRAHLEN
   =============================== */
.ray {
  position: absolute;
  width: 6px;
  height: 60px;
  background: gold;
  top: -80px;
}

/* ===============================
   MINERALISCHER FILTER
   =============================== */
.filter-mineral {
  position: absolute;
  bottom: 110px;
  width: 100%;
  height: 24px;
  background: rgba(220,220,220,0.85);
}

@keyframes reflectRay {
  0% { top: -80px; opacity: 1; }
  45% { top: 160px; opacity: 1; }
  55% { top: 160px; }
  100% { top: -120px; opacity: 0; }
}
.reflect { animation: reflectRay 4s linear infinite; }

/* ===============================
   CHEMISCHER FILTER
   =============================== */
@keyframes absorbRay {
  0% { top: -80px; opacity: 1; }
  60% { top: 260px; opacity: 1; }
  100% { top: 260px; opacity: 0; }
}
.absorb { animation: absorbRay 4s linear infinite; }

/* ===============================
   LABELS
   =============================== */
.label {
  position: absolute;
  background: rgba(0,0,0,0.65);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}

/* ===============================
   DOKU-BEREICH
   =============================== */
.doc {
  margin-top: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
}
</style>
</head>
<body>

<h1>Mineralischer vs. Chemischer Sonnenschutz</h1>

<div class="wrapper">
  <div class="panels">

    <div class="panel">
      <h2>Mineralisch / Physikalisch</h2>
      <div class="filter-mineral"></div>
      <div class="skin"></div>
      <div class="ray reflect" style="left:20%"></div>
      <div class="ray reflect" style="left:40%; animation-delay:1s"></div>
      <div class="ray reflect" style="left:60%; animation-delay:2s"></div>
      <div class="ray reflect" style="left:80%; animation-delay:3s"></div>
      <div class="label" style="top:140px; left:10px">UV wird reflektiert</div>
    </div>

    <div class="panel">
      <h2>Chemisch</h2>
      <div class="skin"></div>
      <div class="ray absorb" style="left:20%"></div>
      <div class="ray absorb" style="left:40%; animation-delay:1s"></div>
      <div class="ray absorb" style="left:60%; animation-delay:2s"></div>
      <div class="ray absorb" style="left:80%; animation-delay:3s"></div>
      <div class="label" style="top:240px; left:10px">UV wird absorbiert</div>
    </div>

  </div>

  <div class="doc">
    <h2>Dokumentation (1 Seite)</h2>
    <p><b>Ziel:</b> Visualisierung der unterschiedlichen Wirkmechanismen von mineralischem und chemischem Sonnenschutz.</p>
    <p><b>Umsetzung:</b> Cloudflare Worker liefert eine HTML-Seite aus. Animationen erfolgen ausschließlich über CSS.</p>
    <p><b>Mineralisch:</b> Physikalische Filter reflektieren UV-Strahlung an der Hautoberfläche.</p>
    <p><b>Chemisch:</b> Chemische Filter absorbieren UV-Strahlung und wandeln sie in Wärme um.</p>
    <p><b>Einsatz:</b> Schulunterricht, Präsentationen, Selbstlernprojekte.</p>
  </div>
</div>

</body>
</html>`;
