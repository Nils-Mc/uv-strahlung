export default {
  async fetch(req) {
    return new Response(HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};

const HTML = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0f172a" />
<title>UV‑Simulator – iPad‑freundlich</title>
<style>
  :root{
    --bg:#0f172a;            /* Hintergrund */
    --panel:#101c34;         /* Panel-Farbe */
    --panel2:#0b1326;        /* Panel-Verlauf */
    --text:#e6eefc;          /* Primärtext */
    --muted:#a7b3d2;         /* Sekundärtext */
    --accent:#22c3ff;        /* Akzent */
    --ok:#34d399;            /* Grün */
    --warn:#fbbf24;          /* Gelb */
    --danger:#fb5a59;        /* Rot */
    --chip:#0a1430;          /* Chip-Hintergrund */
    --chip-border:#223356;   /* Chip-Rand */
    --focus:#93c5fd;         /* Fokusrahmen */
  }

  @media (prefers-color-scheme: light) {
    :root{
      --bg:#f5f7fb; --panel:#ffffff; --panel2:#f9fbff; --text:#0f172a; --muted:#586a92;
      --chip:#f3f6ff; --chip-border:#c8d6f7; --accent:#0ea5e9;
    }
    body{ background: #eef4ff; }
  }

  *{ box-sizing: border-box }
  html, body{ height:100% }
  body{
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
    font-size: 17px; /* iPad: baseline >=16px */
    color: var(--text);
    background:
      radial-gradient(1200px 800px at 70% -260px, #1a2f57 0%, var(--bg) 42%, #0a1324 100%);
    -webkit-tap-highlight-color: transparent;
    padding-bottom: env(safe-area-inset-bottom);
  }

  header{
    padding: max(16px, env(safe-area-inset-top)) 16px 6px;
    text-align:center;
  }
  header h1{
    margin: 0 0 4px;
    font-size: clamp(20px, 3.8vw, 34px);
    letter-spacing: .2px;
  }
  header p{ margin:0; color:var(--muted); font-size: 15px }

  main{
    display:grid; gap:16px;
    grid-template-columns: 1.2fr 1fr;
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }
  @media (max-width: 1100px){ main{ grid-template-columns: 1fr } }

  .card{
    background: linear-gradient(180deg, var(--panel) 0%, var(--panel2) 100%);
    border: 1px solid rgba(120,141,190,.25);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 26px rgba(0,0,0,.18);
  }
  .card h2{
    margin:0; padding:12px 16px;
    font-size: 16px; letter-spacing: .2px;
    background: rgba(10,17,34,.35);
    border-bottom: 1px solid rgba(120,141,190,.22);
  }
  .content{ padding: 14px }

  /* Touchfreundliche Controls */
  label, .label{ font-weight: 650; margin: 12px 0 6px; display:block }
  .hint{ color:var(--muted); font-size: 14px }
  .row{ display:grid; gap:12px; grid-template-columns: 1fr; align-items: center }
  @media (min-width: 700px){ .row{ grid-template-columns: 1fr auto } }

  select, input[type="range"], button, .chip{
    font-size: 16px;
  }

  /* Range (iPad Safari) */
  input[type="range"]{
    -webkit-appearance: none; width: 100%; height: 44px; background: transparent; padding: 10px 0;
  }
  input[type="range"]::-webkit-slider-runnable-track{
    height: 12px; background: #24385f; border-radius: 999px; border:1px solid #2c4473;
  }
  input[type="range"]::-webkit-slider-thumb{
    -webkit-appearance: none; margin-top: -10px; width: 28px; height: 28px;
    background: var(--accent); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,.25);
  }
  input[type="range"]:focus-visible{ outline: 3px solid var(--focus); outline-offset: 2px; border-radius: 12px }

  select, .select{
    background: var(--chip);
    color: var(--text);
    border: 1px solid var(--chip-border);
    border-radius: 12px;
    padding: 12px 12px;
    width: 100%;
  }

  /* Segmented/Chips (für Standort) */
  .chips{ display:flex; gap:10px; flex-wrap: wrap }
  .chip{
    background: var(--chip);
    color: var(--text);
    border: 1.5px solid var(--chip-border);
    border-radius: 999px;
    padding: 10px 14px;
    min-height: 44px; display:flex; align-items:center; gap:8px;
    cursor: pointer; user-select: none;
    transition: transform .05s ease, background .2s;
  }
  .chip input{ appearance: none; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #5d77a8; display:inline-block; position: relative }
  .chip input:checked{ border-color: var(--accent); background: radial-gradient(circle at 50% 50%, var(--accent) 0 45%, transparent 46%) }
  .chip.active{ border-color: var(--accent); background: rgba(34,195,255,.12) }
  .chip:active{ transform: scale(.98) }
  .seg-label{ font-weight: 600 }

  .summary{
    display:flex; gap:10px; flex-wrap:wrap; align-items:center;
    background: rgba(10,17,34,.35);
    border: 1px solid rgba(120,141,190,.22);
    border-radius: 14px; padding: 10px 12px; margin-bottom: 8px;
  }
  .badge{
    display:inline-flex; align-items:center; gap:8px;
    padding: 8px 12px; border-radius: 999px; font-weight: 800; letter-spacing: .3px;
  }
  .b-low{ background:#10391f; color:#a6f1c3; border:1px solid #1f6b3a }
  .b-mod{ background:#2b2b12; color:#f4f1a3; border:1px solid #6b6a1f }
  .b-high{ background:#3b1c1c; color:#f5b7b7; border:1px solid #7a2f2f }
  .b-vhigh{ background:#3b1a2f; color:#ffb8e3; border:1px solid #7a2f58 }
  .b-ext{ background:#3b1025; color:#ffb0d8; border:1px solid #7a1f4e }

  .kpi{ background: rgba(10,17,35,.45); border:1px solid rgba(120,141,190,.22); padding:12px; border-radius:12px }
  .kpi h3{ margin:0 0 6px; font-size: 14px; color:#c6d1ec }
  .kpi .val{ font-size: 24px; font-weight: 800 }
  .out{ display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px }
  @media (max-width: 580px){ .out{ grid-template-columns: 1fr } }

  /* Szene */
  .scene-wrap{ padding:0; position:relative }
  .scene{ width:100%; height:auto; display:block; background:linear-gradient(#78b7ff 0%, #c0e4ff 45%, #ffeec6 100%) }
  .layer-label{ font-size:10px; fill:#e6f0ff; opacity:.85 }
  .ozone{ fill: rgba(80, 0, 255, .10) }
  .layer{ fill: rgba(35,67,130,.07) }
  .beach{ fill:#f2d49b }
  .water{ fill:#86c5da }
  .human{ fill:#4d3f3b }
  .sun{ fill:#ffd24d; filter: drop-shadow(0 0 6px rgba(255,210,77,.8)); animation: pulse 2.4s ease-in-out infinite }
  .ray{ stroke:#ffd24d; stroke-width:2.5; stroke-linecap:round; opacity:.55 }
  @keyframes pulse{ 0%{opacity:.55} 50%{opacity:1} 100%{opacity:.55} }

  /* Timeline */
  .timeline-wrap{ margin-top: 10px }
  .timeline{
    width:100%; background: rgba(10,17,34,.35);
    border:1px solid rgba(120,141,190,.22);
    border-radius:14px; padding:12px
  }
  .legend{ display:flex; gap:10px; flex-wrap:wrap; color:#b5c5e6; font-size: 13px; align-items:center }
  .dot{ width:10px; height:10px; border-radius: 50%; display:inline-block }
  .dot.cur{ background: var(--accent) }
  .dot.burn{ background: var(--danger) }

  .footer{
    padding: 14px; text-align:center; color: var(--muted); font-size: 13px
  }

  button{
    border: 1px solid var(--chip-border);
    background: var(--chip);
    color: var(--text);
    padding: 12px 16px;
    border-radius: 12px;
    cursor: pointer;
    min-height: 44px;
  }
  button:focus-visible{ outline: 3px solid var(--focus); outline-offset: 2px }
</style>
</head>
<body>
<header>
  <h1>UV‑Simulator: Sonne · Atmosphäre · Schutz</h1>
  <p>Für iPad optimiert – klare Chips, große Slider, sofortige Auswertung.</p>
</header>

<main>
  <!-- Szene & Animation -->
  <section class="card scene-wrap" aria-label="Visualisierung: Sonne, Atmosphäre, Mensch am Boden">
    <h2>Animation</h2>
    <div class="content" style="padding:0">
      <svg id="scene" class="scene" viewBox="0 0 900 520" role="img">
        <rect x="0" y="0" width="900" height="520" fill="url(#skygrad)"/>
        <defs>
          <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#78b7ff"/>
            <stop offset="45%" stop-color="#c0e4ff"/>
            <stop offset="100%" stop-color="#ffeec6"/>
          </linearGradient>
        </defs>

        <!-- Sonne -->
        <g transform="translate(120,90)">
          <circle class="sun" r="42" cx="0" cy="0"/>
          <g id="rays"></g>
        </g>

        <!-- Atmosphärenschichten -->
        <g id="layers">
          <rect class="layer" x="0" y="140" width="900" height="60" opacity=".20"></rect>
          <text class="layer-label" x="12" y="170">Thermosphäre</text>

          <rect class="layer" x="0" y="200" width="900" height="60" opacity=".18"></rect>
          <text class="layer-label" x="12" y="230">Mesosphäre</text>

          <rect class="layer ozone" x="0" y="260" width="900" height="60"></rect>
          <text class="layer-label" x="12" y="290">Stratosphäre (Ozon)</text>

          <rect class="layer" x="0" y="320" width="900" height="60" opacity=".12"></rect>
          <text class="layer-label" x="12" y="350">Troposphäre</text>
        </g>

        <!-- Boden -->
        <g id="ground">
          <rect class="water" id="waterRect" x="0" y="420" width="900" height="100" opacity="0"/>
          <rect class="beach" x="0" y="420" width="900" height="100"/>
        </g>

        <!-- Mensch -->
        <g id="human" transform="translate(640, 360) scale(1.08)">
          <path class="human" id="humanBody"
            d="M-110,60 C-90,20 -40,5 10,10 C40,12 80,20 105,30
               L110,40 L-100,40 Z
               M80,15 a16,16 0 1,0 0.1,0"
            opacity="0.95"/>
        </g>
      </svg>
    </div>
  </section>

  <!-- Steuerung & Auswertung -->
  <section class="card controls" aria-label="Einstellungen & Ergebnisse">
    <h2>Einstellungen & Ergebnisse</h2>
    <div class="content">
      <!-- Kompakte Zusammenfassung -->
      <div class="summary" role="status" aria-live="polite">
        <span class="badge" id="riskBadge">RISIKO</span>
        <span><strong>UVI (Haut):</strong> <span id="uviEff">–</span></span>
        <span>•</span>
        <span><strong>bis Rötung:</strong> <span id="ttb">–</span></span>
      </div>

      <div class="row">
        <div>
          <span class="label">Sonnenstärke (UV‑Index)</span>
          <div style="display:flex; gap:10px; align-items:center">
            <input id="uvBase" type="range" min="0" max="12" step="0.5" value="6" aria-label="UV-Index" />
            <div class="kpi" style="min-width:84px; text-align:center"><div class="val" id="uvBaseVal">6</div><div class="hint">von 12</div></div>
          </div>
          <div class="hint">0–2 niedrig · 3–5 moderat · 6–7 hoch · 8–10 sehr hoch · 11+ extrem</div>
        </div>
      </div>

      <div class="row">
        <div>
          <span class="label">Bewölkung</span>
          <div style="display:flex; gap:10px; align-items:center">
            <input id="clouds" type="range" min="0" max="100" step="5" value="20" aria-label="Bewölkung in Prozent" />
            <div class="kpi" style="min-width:84px; text-align:center"><div class="val" id="cloudsVal">20%</div><div class="hint">0–100%</div></div>
          </div>
        </div>
      </div>

      <div class="label">Standort</div>
      <div class="chips" role="radiogroup" aria-label="Standort">
        <label class="chip active"><input type="radio" name="loc" value="strand" checked aria-label="Strand"><span class="seg-label">Strand</span></label>
        <label class="chip"><input type="radio" name="loc" value="strasse" aria-label="Straße"><span class="seg-label">Straße</span></label>
        <label class="chip"><input type="radio" name="loc" value="hoch_schnee" aria-label="Hochgebirge und Schnee"><span class="seg-label">Berg + Schnee</span></label>
        <label class="chip"><input type="radio" name="loc" value="wasser" aria-label="Im Wasser"><span class="seg-label">Im Wasser</span></label>
      </div>

      <div class="row" style="margin-top:6px">
        <div>
          <span class="label">Hautschutz</span>
          <select id="protection" class="select" aria-label="Hautschutz">
            <option value="none">Kein Schutz</option>
            <option value="spf15">Sonnencreme SPF 15</option>
            <option value="spf30" selected>Sonnencreme SPF 30</option>
            <option value="spf50">Sonnencreme SPF 50+</option>
            <option value="upf50">Kleidung (UPF 50)</option>
          </select>
        </div>
        <div>
          <span class="label">Hauttyp</span>
          <select id="skin" class="select" aria-label="Hauttyp">
            <option value="I">I – sehr hell</option>
            <option value="II" selected>II – hell</option>
            <option value="III">III – mittel</option>
            <option value="IV">IV – oliv</option>
            <option value="V">V – dunkel</option>
            <option value="VI">VI – sehr dunkel</option>
          </select>
        </div>
      </div>

      <div class="inline" style="display:flex; gap:10px; align-items:center; margin:10px 0">
        <label class="chip" id="childChip" style="border-radius:12px">
          <input id="child" type="checkbox" aria-label="Kinderhaut berücksichtigen">
          <span class="seg-label">Kinderhaut berücksichtigen</span>
        </label>
      </div>

      <div class="row">
        <div>
          <span class="label">Expositionsdauer</span>
          <div style="display:flex; gap:10px; align-items:center">
            <input id="duration" type="range" min="0" max="240" step="5" value="30" aria-label="Expositionsdauer in Minuten"/>
            <div class="kpi" style="min-width:110px; text-align:center"><div class="val" id="durationVal">30 min</div><div class="hint">0–240 min</div></div>
          </div>
        </div>
      </div>

      <div class="out" style="margin-top:12px">
        <div class="kpi">
          <h3>Effektiver UV‑Index (an der Haut)</h3>
          <div class="val"><span id="uviEff2">–</span></div>
          <div class="hint" id="uviExplain">–</div>
        </div>
        <div class="kpi">
          <h3>Erreichte UV‑Dosis</h3>
          <div class="val"><span id="dosePct">–</span></div>
          <div class="hint">Anteil der Erythem‑Schwelle bei gewählter Dauer.</div>
        </div>
        <div class="kpi">
          <h3>Folgen bei gewählter Dauer</h3>
          <div id="consequence">–</div>
        </div>
        <div class="kpi">
          <h3>Empfehlung</h3>
          <div id="advice">–</div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline-wrap">
        <div class="timeline">
          <div class="label" style="margin:0 0 8px">Zeitleiste</div>
          <svg id="timelineSvg" viewBox="0 0 600 76" width="100%" height="76" role="img" aria-label="Zeitleiste: aktuelle Dauer und Sonnenbrand-Schwelle">
            <defs>
              <linearGradient id="gradFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#22c3ff"/>
                <stop offset="100%" stop-color="#0ea5e9"/>
              </linearGradient>
            </defs>
            <!-- Track -->
            <line x1="20" y1="36" x2="580" y2="36" stroke="#2a3a5a" stroke-width="10" stroke-linecap="round"/>
            <!-- Filled to current -->
            <line id="tlFill" x1="20" y1="36" x2="220" y2="36" stroke="url(#gradFill)" stroke-width="10" stroke-linecap="round"/>
            <!-- Current marker -->
            <line id="tlCur" x1="220" y1="18" x2="220" y2="54" stroke="#22c3ff" stroke-width="3"/>
            <!-- Burn marker -->
            <line id="tlBurn" x1="420" y1="14" x2="420" y2="58" stroke="#fb5a59" stroke-width="3" stroke-dasharray="4 4"/>
            <!-- Labels -->
            <text id="tlCurLabel" x="220" y="72" text-anchor="middle" font-size="12" fill="#c9d4ee">Dauer</text>
            <text id="tlBurnLabel" x="420" y="12" text-anchor="middle" font-size="12" fill="#f1a7a6">Sonnenbrand‑Schwelle</text>
            <text x="20" y="70" font-size="12" fill="#8aa0cc">0 min</text>
            <text x="580" y="70" font-size="12" fill="#8aa0cc">240 min</text>
          </svg>
          <div class="legend" aria-hidden="true">
            <span class="dot cur"></span> aktuelle Dauer
            <span class="dot burn"></span> Schwelle
          </div>
        </div>
      </div>

      <div style="margin-top:12px; display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap">
        <span class="hint">Didaktisches Modell – keine medizinische Beratung.</span>
        <button id="resetBtn" aria-label="Einstellungen zurücksetzen">Zurücksetzen</button>
      </div>
    </div>
  </section>
</main>

<div class="footer">© 2026 UV‑Simulator · Lernzwecke · Faktoren sind heuristisch (Höhe/Schnee/Wasser/Wolken/SPF/UPF/Kinderhaut).</div>

<script>
(function(){
  // Rays (SVG)
  const raysGroup = document.getElementById('rays');
  for(let i=0;i<24;i++){
    const angle = (Math.PI*2) * (i/24);
    const x1 = Math.cos(angle)*62, y1 = Math.sin(angle)*62;
    const x2 = Math.cos(angle)*112, y2 = Math.sin(angle)*112;
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('class','ray');
    raysGroup.appendChild(l);
  }

  // Elements
  const uvBase = document.getElementById('uvBase');
  const uvBaseVal = document.getElementById('uvBaseVal');
  const clouds = document.getElementById('clouds');
  const cloudsVal = document.getElementById('cloudsVal');
  const protection = document.getElementById('protection');
  const skin = document.getElementById('skin');
  const child = document.getElementById('child');
  const childChip = document.getElementById('childChip');
  const duration = document.getElementById('duration');
  const durationVal = document.getElementById('durationVal');
  const locChips = Array.from(document.querySelectorAll('label.chip input[type="radio"]'));

  const uviEffElTop = document.getElementById('uviEff');
  const uviEffEl2 = document.getElementById('uviEff2');
  const riskBadge = document.getElementById('riskBadge');
  const uviExplain = document.getElementById('uviExplain');
  const ttbEl = document.getElementById('ttb');
  const dosePctEl = document.getElementById('dosePct');
  const consequence = document.getElementById('consequence');
  const advice = document.getElementById('advice');
  const resetBtn = document.getElementById('resetBtn');

  const humanBody = document.getElementById('humanBody');
  const waterRect = document.getElementById('waterRect');

  // Timeline elements
  const tlFill = document.getElementById('tlFill');
  const tlCur = document.getElementById('tlCur');
  const tlBurn = document.getElementById('tlBurn');
  const tlCurLabel = document.getElementById('tlCurLabel');
  const tlBurnLabel = document.getElementById('tlBurnLabel');
  const TL_MIN = 0, TL_MAX = 240, TL_X1 = 20, TL_X2 = 580;

  // Helpers
  function tlX(t){
    const clamped = Math.max(TL_MIN, Math.min(TL_MAX, t));
    const ratio = (clamped - TL_MIN) / (TL_MAX - TL_MIN);
    return TL_X1 + ratio * (TL_X2 - TL_X1);
  }
  function getLoc(){
    const r = locChips.find(ch => ch.checked);
    return r ? r.value : 'strand';
  }
  function markActiveChip(){
    document.querySelectorAll('label.chip').forEach(l => l.classList.remove('active'));
    const checked = locChips.find(ch => ch.checked);
    if (checked) checked.closest('label.chip')?.classList.add('active');
  }

  // Model-Logik (heuristisch/didaktisch)
  function factors(){
    const uv = Number(uvBase.value);
    const cloudPct = Number(clouds.value);

    // Wolkenfaktor (bis ~80% Dämpfung, Rest 20% minimal; kleiner Rand-Boost)
    let fCloud = 1 - 0.8*(cloudPct/100);
    fCloud = Math.max(0.2, Math.min(1.1, fCloud));

    const loc = getLoc();
    const locMap = {
      strand:     { f: 1.00 },
      strasse:    { f: 0.95 },
      hoch_schnee:{ f: 1.60 }, // Höhe + Schneealbedo
      wasser:     { f: 0.70 }  // Dämpfung durchs Wasser (schultertief)
    };
    const fLoc = (locMap[loc]||locMap.strand).f;

    // Schutz: Transmission zur Haut
    const protMap = { none:1.0, spf15:1/15, spf30:1/30, spf50:1/50, upf50:1/50 };
    const fProt = protMap[protection.value] ?? 1.0;

    const uviEnv = uv * fCloud * fLoc;  // Umgebung an der Oberfläche
    const uviSkin = uviEnv * fProt;     // an der Haut
    return { uviEnv, uviSkin, fCloud, fLoc, loc };
  }

  function burnTimeMinutes(uviSkin, skinType, isChild){
    if (uviSkin <= 0.01) return Infinity;
    const base = { I:10, II:20, III:30, IV:50, V:80, VI:120 }; // bei UVI=10
    let t10 = base[skinType] || 20;
    if (isChild) t10 *= 0.7; // Kinderhaut empfindlicher (~30%)
    return t10 * (10 / uviSkin);
  }

  function riskCategory(uviEnv){
    if (uviEnv < 3) return {label:'niedrig', class:'b-low'};
    if (uviEnv < 6) return {label:'moderat', class:'b-mod'};
    if (uviEnv < 8) return {label:'hoch', class:'b-high'};
    if (uviEnv < 11) return {label:'sehr hoch', class:'b-vhigh'};
    return {label:'extrem', class:'b-ext'};
  }

  function consequenceText(frac, loc){
    if (!isFinite(frac) || frac <= 0) return 'Keine unmittelbare Rötung zu erwarten.';
    let base;
    if (frac < 0.3) base = 'Unkritisch bei den meisten Hauttypen; leichte Rötung bei empfindlicher Haut möglich.';
    else if (frac < 0.7) base = 'Erste Rötung möglich – Schutz/Schattierung sinnvoll.';
    else if (frac < 1.0) base = 'Rötung wahrscheinlich – Schutz erhöhen, Dauer verkürzen.';
    else if (frac < 1.5) base = 'Sonnenbrand wahrscheinlich – sofort Schutz/Schatten, Haut kühlen und beobachten.';
    else base = 'Deutlich erhöhte Dosis – Sonnenbrand sehr wahrscheinlich; Exposition beenden und Schutzmaßnahmen ergreifen.';
    if (loc==='hoch_schnee') base += ' Schnee reflektiert viel UV; Augen mit UV‑400 Brille schützen.';
    if (loc==='wasser') base += ' Wasser reflektiert an der Oberfläche; Schultern/Gesicht besonders exponiert.';
    return base;
  }

  function mixColor(a,b,t){
    const pa = parseInt(a.slice(1),16), pb = parseInt(b.slice(1),16);
    const ra=(pa>>16)&255, ga=(pa>>8)&255, ba=pa&255;
    const rb=(pb>>16)&255, gb=(pb>>8)&255, bb=pb&255;
    const r = Math.round(ra+(rb-ra)*t);
    const g = Math.round(ga+(gb-ga)*t);
    const bl= Math.round(ba+(bb-ba)*t);
    return '#' + [r,g,bl].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  // Timeline Update
  function updateTimeline(ttb, dur){
    const curX = tlX(dur);
    const burnT = Math.min(ttb===Infinity ? TL_MAX+1 : ttb, TL_MAX);
    const burnX = tlX(burnT);

    tlFill.setAttribute('x2', curX);
    tlCur.setAttribute('x1', curX); tlCur.setAttribute('x2', curX);
    tlBurn.setAttribute('x1', burnX); tlBurn.setAttribute('x2', burnX);
    tlCurLabel.setAttribute('x', curX);
    tlCurLabel.textContent = dur + ' min';
    tlBurnLabel.setAttribute('x', burnX);
    tlBurnLabel.textContent = (ttb===Infinity) ? 'Schwelle: sehr hoch / nicht erreicht' : ('Schwelle: ' + Math.round(ttb) + ' min');
  }

  // Hauptupdate (nur bei Interaktion)
  function update(){
    // Werte lesen
    const uv = Number(uvBase.value);
    const cl = Number(clouds.value);
    const dur = Number(duration.value);
    uvBaseVal.textContent = uv;
    cloudsVal.textContent = cl + '%';
    durationVal.textContent = dur + ' min';

    // Standort-UI (Wasserband, Chips)
    markActiveChip();
    const { uviEnv, uviSkin, fCloud, fLoc, loc } = factors();
    waterRect.setAttribute('opacity', loc==='wasser' ? '1' : '0');

    const uviEnvC = Math.max(0, uviEnv);
    const uviSkinC = Math.max(0, uviSkin);

    // UVI Anzeigen
    const uviDisp = uviSkinC.toFixed(1);
    uviEffElTop.textContent = uviDisp;
    uviEffEl2.textContent = uviDisp;

    // Risiko
    const risk = riskCategory(uviEnvC);
    riskBadge.textContent = 'RISIKO: ' + risk.label.toUpperCase();
    riskBadge.className = 'badge ' + risk.class;

    const childSuffix = child.checked ? ' · Kinderhaut' : '';
    uviExplain.textContent = \`Umgebung: UVI \${uviEnvC.toFixed(1)} · Wolken \${fCloud.toFixed(2)} · Standort \${fLoc.toFixed(2)} · Schutz wirkt danach\${childSuffix}.\`;

    // Zeit bis Sonnenbrand
    const ttb = burnTimeMinutes(uviSkinC, skin.value, child.checked);
    ttbEl.textContent = (ttb===Infinity) ? 'keine akute Gefahr' : (ttb < 120 ? \`\${ttb.toFixed(0)} min\` : \`\${(ttb/60).toFixed(1)} h\`);

    // Dosis & Folge
    const doseFrac = (ttb===Infinity) ? 0 : (dur / ttb);
    const dosePct = Math.max(0, doseFrac*100);
    dosePctEl.textContent = (dosePct>=1000) ? '>1000%' : \`\${dosePct.toFixed(0)}%\`;
    consequence.textContent = consequenceText(doseFrac, loc);

    // Tipps
    let tips = [];
    if (protection.value==='none') tips.push('Sonnencreme (mind. SPF 30) großzügig & regelmäßig nachcremen.');
    else tips.push('Regelmäßig nachcremen, v. a. nach Wasser/Kontakt.');
    if (loc==='hoch_schnee' || uviEnvC>=6) tips.push('Sonnenbrille UV‑400 & Kopfbedeckung tragen.');
    tips.push('Schatten suchen, 11–15 Uhr besonders vorsichtig; Kleidung (UPF) schützt zuverlässig.');
    if (child.checked) tips.push('Kinderhaut: direkte Sonne begrenzen, Hut/T‑Shirt, sensitives SPF 50+.');
    advice.textContent = tips.join(' ');

    // Visuelle Hauttönung nach Dosis
    const redness = (ttb===Infinity) ? 0 : Math.max(0, Math.min(0.8, doseFrac * 0.8));
    humanBody.setAttribute('fill', mixColor('#4d3f3b', '#a33b3b', redness));

    // Timeline
    updateTimeline(ttb, dur);
  }

  // Events (input/change – keine Intervalle, flüssig & batterie-schonend)
  [uvBase, clouds, protection, skin, child, duration, ...locChips].forEach(el=>{
    el.addEventListener('input', update, {passive:true});
    el.addEventListener('change', update);
  });

  // Klick auf Kinderhaut-Chip toggelt die Optik
  child.addEventListener('change', ()=>{
    childChip.classList.toggle('active', child.checked);
  });

  // Reset
  resetBtn.addEventListener('click', ()=>{
    uvBase.value = 6;
    clouds.value = 20;
    protection.value = 'spf30';
    skin.value = 'II';
    child.checked = false; childChip.classList.remove('active');
    duration.value = 30;
    // Standort zurücksetzen
    locChips.forEach(r=> r.checked = (r.value==='strand'));
    update();
  });

  // Erste Darstellung
  update();
})();
</script>
</body>
</html>`;
