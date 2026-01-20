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
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>UV‑Simulator – Sonne, Atmosphäre, Hautschutz & Zeit</title>
<style>
  :root{
    --bg:#0e1726;
    --panel:#111a2b;
    --panel2:#0b1323;
    --text:#e8eefc;
    --muted:#a9b5d1;
    --accent:#24c8ff;
    --warn:#ffb020;
    --danger:#ff5e5b;
    --ok:#6ee7a8;
  }
  *{box-sizing:border-box}
  body{
    margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
    background: radial-gradient(1000px 600px at 70% -200px, #19304f 0%, var(--bg) 40%, #0a1220 100%);
    color:var(--text); line-height:1.45;
  }
  header{padding:22px 16px 0; text-align:center}
  header h1{margin:0 0 6px; font-size:clamp(20px, 4vw, 32px)}
  header p{margin:0; color:var(--muted)}
  main{display:grid; gap:14px; grid-template-columns: 1.2fr 1fr; padding:16px; max-width:1200px; margin:0 auto}
  @media (max-width: 980px){ main{grid-template-columns: 1fr} }
  .card{
    background: linear-gradient(180deg, var(--panel) 0%, var(--panel2) 100%);
    border: 1px solid #1d2a44; border-radius:14px; overflow:hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
  }
  .card h2{margin:0; padding:12px 14px; font-size:16px; letter-spacing:.3px; background:#0f1a2d; border-bottom:1px solid #1c2a45}
  .card .content{padding:14px}
  .controls .row{display:grid; gap:10px; grid-template-columns: 1fr auto}
  .controls label{display:block; font-weight:600; margin:12px 0 6px}
  .controls input[type="range"]{width:100%}
  .inline{display:flex; gap:8px; flex-wrap:wrap; align-items:center; color:var(--muted)}
  .select, select, input[type="range"]{
    background:#0a1323; color:var(--text); border:1px solid #22314f; border-radius:10px; padding:8px 10px;
  }
  .radio-group{display:flex; gap:10px; flex-wrap:wrap}
  .radio{
    border:1px solid #22314f; border-radius:12px; padding:8px 12px; cursor:pointer; background:#0a1323; color:var(--text)
  }
  .radio input{margin-right:6px}
  .badge{display:inline-block; padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px}
  .b-low{background:#10391f; color:#a6f1c3; border:1px solid #1f6b3a}
  .b-mod{background:#2b2b12; color:#f4f1a3; border:1px solid #6b6a1f}
  .b-high{background:#3b1c1c; color:#f5b7b7; border:1px solid #7a2f2f}
  .b-vhigh{background:#3b1a2f; color:#ffb8e3; border:1px solid #7a2f58}
  .b-ext{background:#3b1025; color:#ffb0d8; border:1px solid #7a1f4e}
  .out{display:grid; grid-template-columns: repeat(2, 1fr); gap:10px}
  @media (max-width: 540px){ .out{grid-template-columns:1fr} }
  .kpi{background:#0a1323; border:1px solid #22314f; padding:12px; border-radius:12px}
  .kpi h3{margin:0 0 6px; font-size:13px; color:#b5c5e6; font-weight:600}
  .kpi .val{font-size:22px; font-weight:800}
  .hint{color:var(--muted); font-size:13px}
  .scene-wrap{padding:0; position:relative}
  .scene{width:100%; height:auto; display:block; background:linear-gradient(#78b7ff 0%, #c0e4ff 45%, #ffeec6 100%)}
  .layer-label{font-size:10px; fill:#e6f0ff; opacity:.85}
  .ozone{fill:rgba(80, 0, 255, .10)}
  .layer{fill:rgba(35,67,130,.07)}
  .beach{fill:#f2d49b}
  .water{fill:#86c5da}
  .human{fill:#4d3f3b}
  .sun{fill:#ffd24d; filter: drop-shadow(0 0 6px rgba(255,210,77,.8))}
  .ray{stroke:#ffd24d; stroke-width:2; stroke-linecap:round; opacity:.5}
  .pulse{animation: pulse 2.2s ease-in-out infinite}
  @keyframes pulse{
    0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4}
  }
  .footer{padding:12px; text-align:center; color:#94a4c9; font-size:12px}
  button.reset{
    border:1px solid #22314f; background:#0a1323; color:var(--text); padding:8px 12px; border-radius:10px; cursor:pointer;
  }
  /* Timeline */
  .timeline-wrap { margin-top:12px; }
  .timeline { width:100%; background:#0a1323; border:1px solid #22314f; border-radius:12px; padding:10px }
  .timeline h3 { margin:0 0 8px; font-size:13px; color:#b5c5e6; font-weight:600}
  .legend { display:flex; gap:10px; flex-wrap:wrap; color:#b5c5e6; font-size:12px; align-items:center }
  .dot { width:10px; height:10px; border-radius:50%; display:inline-block }
  .dot.cur{ background: var(--accent) }
  .dot.burn{ background: var(--danger) }
</style>
</head>
<body>
<header>
  <h1>UV‑Simulator: Sonne ☀️ · Atmosphäre · Hautschutz & Zeit</h1>
  <p>Steuere Sonnenstärke, Bewölkung, Standort, Schutz & Dauer – und sieh, was bei der Haut ankommt.</p>
</header>

<main>
  <!-- Szene & Animation -->
  <section class="card scene-wrap">
    <h2>Animation</h2>
    <div class="content" style="padding:0">
      <svg id="scene" class="scene" viewBox="0 0 900 520" role="img" aria-label="Sonne, Atmosphäre, Mensch am Strand">
        <!-- Himmel -->
        <rect x="0" y="0" width="900" height="520" fill="url(#skygrad)"/>
        <defs>
          <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#78b7ff"/>
            <stop offset="45%" stop-color="#c0e4ff"/>
            <stop offset="100%" stop-color="#ffeec6"/>
          </linearGradient>
        </defs>

        <!-- Sonne -->
        <g id="sunGroup" transform="translate(120,90)">
          <circle class="sun pulse" r="40" cx="0" cy="0"/>
          <!-- Strahlen  -->
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

        <!-- Strand/Wasser -->
        <g id="ground">
          <rect class="water" id="waterRect" x="0" y="420" width="900" height="100" opacity="0"/>
          <rect class="beach" x="0" y="420" width="900" height="100"/>
        </g>

        <!-- Mensch -->
        <g id="human" transform="translate(640, 360) scale(1.1)">
          <!-- einfache liegende Silhouette -->
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
  <section class="card controls">
    <h2>Einstellungen & Ergebnisse</h2>
    <div class="content">
      <div class="row">
        <div>
          <label for="uvBase">Sonnenstärke (UV‑Index): <span class="inline"><span id="uvBaseVal" aria-live="polite">6</span> / 12</span></label>
          <input id="uvBase" type="range" min="0" max="12" step="0.5" value="6" />
        </div>
        <div class="hint">Faustregel: 0–2 niedrig · 3–5 moderat · 6–7 hoch · 8–10 sehr hoch · 11+ extrem</div>
      </div>

      <div class="row">
        <div>
          <label for="clouds">Bewölkung (%): <span id="cloudsVal">20%</span></label>
          <input id="clouds" type="range" min="0" max="100" step="5" value="20" />
        </div>
        <div class="hint">Dichte Wolken dämpfen UV, Wolkenlücken können lokal verstärken.</div>
      </div>

      <label>Standort</label>
      <div class="radio-group" role="radiogroup" aria-label="Standort">
        <label class="radio"><input type="radio" name="loc" value="strand" checked>Strand</label>
        <label class="radio"><input type="radio" name="loc" value="strasse">Straße</label>
        <label class="radio"><input type="radio" name="loc" value="hoch_schnee">Hochgebirge + Schnee</label>
        <label class="radio"><input type="radio" name="loc" value="wasser">Im Wasser (bis schultertief)</label>
      </div>

      <div class="row">
        <div>
          <label for="protection">Hautschutz</label>
          <select id="protection" class="select">
            <option value="none">Kein Schutz</option>
            <option value="spf15">Sonnencreme SPF 15</option>
            <option value="spf30" selected>Sonnencreme SPF 30</option>
            <option value="spf50">Sonnencreme SPF 50+</option>
            <option value="upf50">Kleidung (UPF 50)</option>
          </select>
        </div>
        <div>
          <label for="skin">Hauttyp</label>
          <select id="skin" class="select">
            <option value="I">I – sehr hell, brennt sehr leicht</option>
            <option value="II" selected>II – hell, brennt leicht</option>
            <option value="III">III – mittel</option>
            <option value="IV">IV – oliv</option>
            <option value="V">V – dunkel</option>
            <option value="VI">VI – sehr dunkel</option>
          </select>
        </div>
      </div>

      <div class="inline" style="margin:6px 0 4px">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
          <input id="child" type="checkbox" />
          <span>Kinderhaut berücksichtigen (empfindlicher)</span>
        </label>
      </div>

      <div class="row">
        <div>
          <label for="duration">Expositionsdauer (min): <span id="durationVal">30 min</span></label>
          <input id="duration" type="range" min="0" max="240" step="5" value="30" />
        </div>
        <div class="hint">Zeitleiste unten zeigt aktuelle Dauer (blau) und die Sonnenbrand‑Schwelle (rot).</div>
      </div>

      <div class="out" style="margin-top:14px">
        <div class="kpi">
          <h3>Effektiver UV‑Index (an der Haut)</h3>
          <div class="val"><span id="uviEff">–</span> <span id="riskBadge" class="badge b-low">–</span></div>
          <div class="hint" id="uviExplain">–</div>
        </div>
        <div class="kpi">
          <h3>Geschätzte Zeit bis Sonnenbrand</h3>
          <div class="val"><span id="ttb">–</span></div>
          <div class="hint" id="ttbExplain">Abhängig von Hauttyp, Kinderhaut & Schutz; Näherungswert.</div>
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
          <h3>Kontext</h3>
          <div id="context">–</div>
        </div>
        <div class="kpi">
          <h3>Empfehlung</h3>
          <div id="advice">–</div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline-wrap">
        <div class="timeline">
          <h3>Zeitleiste</h3>
          <svg id="timelineSvg" viewBox="0 0 600 70" width="100%" height="70" role="img" aria-label="Zeitleiste: aktuelle Dauer und Sonnenbrand-Schwelle">
            <!-- Track -->
            <line x1="20" y1="35" x2="580" y2="35" stroke="#2a3a5a" stroke-width="8" stroke-linecap="round"/>
            <!-- Filled to current -->
            <line id="tlFill" x1="20" y1="35" x2="220" y2="35" stroke="#24c8ff" stroke-width="8" stroke-linecap="round"/>
            <!-- Current marker -->
            <line id="tlCur" x1="220" y1="20" x2="220" y2="50" stroke="#24c8ff" stroke-width="3"/>
            <!-- Burn marker -->
            <line id="tlBurn" x1="420" y1="15" x2="420" y2="55" stroke="#ff5e5b" stroke-width="3" stroke-dasharray="4 4"/>
            <!-- Labels -->
            <text id="tlCurLabel" x="220" y="65" text-anchor="middle" font-size="11" fill="#b5c5e6">Dauer</text>
            <text id="tlBurnLabel" x="420" y="12" text-anchor="middle" font-size="11" fill="#f1a7a6">Sonnenbrand‑Schwelle</text>
            <text x="20" y="60" font-size="11" fill="#8aa0cc">0 min</text>
            <text x="580" y="60" font-size="11" fill="#8aa0cc">240 min</text>
          </svg>
          <div class="legend" aria-hidden="true">
            <span class="dot cur"></span> aktuelle Dauer
            <span class="dot burn"></span> Schwelle
          </div>
        </div>
      </div>

      <div style="margin-top:12px; display:flex; gap:10px; align-items:center; justify-content:space-between">
        <span class="hint">Didaktisches Modell – keine medizinische Beratung.</span>
        <button class="reset" id="resetBtn">Zurücksetzen</button>
      </div>
    </div>
  </section>
</main>

<div class="footer">© 2026 UV‑Simulator · Lernzwecke · Faktoren sind heuristisch (Höhe/Schnee/Wasser/Wolken/SPF/UPF/Kinderhaut).</div>

<script>
(function(){
  // Ray geometry
  const raysGroup = document.getElementById('rays');
  for(let i=0;i<24;i++){
    const angle = (Math.PI*2) * (i/24);
    const x1 = Math.cos(angle)*60, y1 = Math.sin(angle)*60;
    const x2 = Math.cos(angle)*110, y2 = Math.sin(angle)*110;
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('class','ray');
    l.style.animationDelay = (i*0.06)+'s';
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
  const duration = document.getElementById('duration');
  const durationVal = document.getElementById('durationVal');
  const locRadios = Array.from(document.querySelectorAll('input[name="loc"]'));

  const uviEffEl = document.getElementById('uviEff');
  const riskBadge = document.getElementById('riskBadge');
  const uviExplain = document.getElementById('uviExplain');
  const ttbEl = document.getElementById('ttb');
  const ttbExplain = document.getElementById('ttbExplain');
  const dosePctEl = document.getElementById('dosePct');
  const consequence = document.getElementById('consequence');
  const context = document.getElementById('context');
  const advice = document.getElementById('advice');
  const resetBtn = document.getElementById('resetBtn');
  const rays = Array.from(document.querySelectorAll('.ray'));
  const humanBody = document.getElementById('humanBody');
  const waterRect = document.getElementById('waterRect');

  // Timeline elements
  const tlSvg = document.getElementById('timelineSvg');
  const tlFill = document.getElementById('tlFill');
  const tlCur = document.getElementById('tlCur');
  const tlBurn = document.getElementById('tlBurn');
  const tlCurLabel = document.getElementById('tlCurLabel');
  const tlBurnLabel = document.getElementById('tlBurnLabel');
  const TL_MIN = 0, TL_MAX = 240, TL_X1 = 20, TL_X2 = 580; // viewBox coords

  function tlX(t){
    const clamped = Math.max(TL_MIN, Math.min(TL_MAX, t));
    const ratio = (clamped - TL_MIN) / (TL_MAX - TL_MIN);
    return TL_X1 + ratio * (TL_X2 - TL_X1);
  }

  function getLoc(){
    return locRadios.find(r=>r.checked)?.value || 'strand';
  }

  function factors(){
    const uv = Number(uvBase.value);
    const cloudPct = Number(clouds.value);
    // Wolkenfaktor (heuristisch)
    let fCloud = 1 - 0.8*(cloudPct/100);
    fCloud = Math.max(0.2, Math.min(1.1, fCloud)); // kleines Plus durch Wolkenränder möglich

    const loc = getLoc();
    const locMap = {
      strand:    { f: 1.00, water: 0 },
      strasse:   { f: 0.95, water: 0 },
      hoch_schnee:{ f: 1.60, water: 0 },
      wasser:    { f: 0.70, water: 1 }
    };
    const fLoc = (locMap[loc]||locMap.strand).f;

    const protMap = {
      none: 1.0,
      spf15: 1/15,
      spf30: 1/30,
      spf50: 1/50,
      upf50: 1/50
    };
    const fProt = protMap[protection.value] ?? 1.0;

    const uviEnv = uv * fCloud * fLoc;     // an der Körperoberfläche
    const uviSkin = uviEnv * fProt;        // nach Schutz

    return { uviEnv, uviSkin, fCloud, fLoc };
  }

  function burnTimeMinutes(uviSkin, skinType, isChild){
    if (uviSkin <= 0.01) return Infinity;
    // Baseline-Zeit bis Sonnenbrand bei UVI=10 (didaktisch/heuristisch)
    const base = { I:10, II:20, III:30, IV:50, V:80, VI:120 };
    let t10 = base[skinType] || 20;
    // Kinderhaut empfindlicher → kürzere Schwelle (heuristisch ~30%)
    if (isChild) t10 *= 0.7;
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
    if (frac < 0.3) base = 'Unkritisch bei den meisten Hauttypen; leichte Rötung bei sehr empfindlicher Haut möglich.';
    else if (frac < 0.7) base = 'Erste Rötung möglich – Schutz/Schattierung sinnvoll.';
    else if (frac < 1.0) base = 'Rötung wahrscheinlich – Schutz erhöhen, Dauer verkürzen.';
    else if (frac < 1.5) base = 'Sonnenbrand wahrscheinlich – sofort Schutz/Schatten, Haut kühlen und beobachten.';
    else base = 'Deutlich erhöhte Dosis – Sonnenbrand sehr wahrscheinlich; Exposition beenden und Schutzmaßnahmen ergreifen.';

    if (loc==='hoch_schnee') base += ' Schnee reflektiert viel UV; auch Augen gefährdet (Schneeblindheit‑Risiko).';
    if (loc==='wasser') base += ' Wasser reflektiert an der Oberfläche; exponierte Partien (Schultern/ Gesicht) bleiben gefährdet.';
    return base;
  }

  function updateTimeline(ttb, dur){
    const curX = tlX(dur);
    const burnT = Math.min(ttb===Infinity ? TL_MAX+1 : ttb, TL_MAX);
    const burnX = tlX(burnT);

    // Update filled portion & markers
    tlFill.setAttribute('x2', curX);
    tlCur.setAttribute('x1', curX); tlCur.setAttribute('x2', curX);
    tlBurn.setAttribute('x1', burnX); tlBurn.setAttribute('x2', burnX);

    tlCurLabel.setAttribute('x', curX);
    tlCurLabel.textContent = dur + ' min';
    tlBurnLabel.setAttribute('x', burnX);
    tlBurnLabel.textContent = (ttb===Infinity) ? 'Schwelle: sehr hoch / nicht erreicht' : ('Schwelle: ' + Math.round(ttb) + ' min');
  }

  function update(){
    uvBaseVal.textContent = uvBase.value;
    cloudsVal.textContent = clouds.value + '%';
    durationVal.textContent = duration.value + ' min';

    const loc = getLoc();
    // Wasserband nur bei "im Wasser"
    waterRect.setAttribute('opacity', loc==='wasser' ? '1' : '0');

    const { uviEnv, uviSkin, fCloud, fLoc } = factors();
    const uviEnvClamped = Math.max(0, uviEnv);
    const uviSkinClamped = Math.max(0, uviSkin);

    // UI numbers
    const uviSkinDisp = uviSkinClamped.toFixed(1);
    uviEffEl.textContent = uviSkinDisp;

    const risk = riskCategory(uviEnvClamped);
    riskBadge.textContent = risk.label.toUpperCase();
    riskBadge.className = 'badge ' + risk.class;

    const childTxt = child.checked ? ' · Kinderhaut berücksichtigt' : '';
    uviExplain.textContent = \`Umgebung: UVI \${uviEnvClamped.toFixed(1)} · Wolkenfaktor \${fCloud.toFixed(2)} · Standortfaktor \${fLoc.toFixed(2)} · Schutz wirkt danach\${childTxt}.\`;

    const ttb = burnTimeMinutes(uviSkinClamped, skin.value, child.checked);
    ttbEl.textContent = (ttb===Infinity) ? 'keine akute Gefahr' : (ttb < 120 ? \`\${ttb.toFixed(0)} min\` : \`\${(ttb/60).toFixed(1)} h\`);

    const dur = Number(duration.value);
    const doseFrac = (ttb===Infinity) ? 0 : (dur / ttb);
    const dosePct = Math.max(0, doseFrac*100);
    dosePctEl.textContent = (dosePct>=1000) ? '>1000%' : \`\${dosePct.toFixed(0)}%\`;

    consequence.textContent = consequenceText(doseFrac, loc);

    // Context & Tips
    let ctx = [];
    if (loc==='hoch_schnee') ctx.push('Schnee reflektiert viel UV → erhöhtes Risiko für Haut & Augen (Schneeblindheit).');
    if (loc==='wasser') ctx.push('Wasser dämpft UV im Körper, aber reflektiert an der Oberfläche; ungeschützte Stellen weiter gefährdet.');
    if (Number(clouds.value) >= 70) ctx.push('Dichte Wolken reduzieren UV deutlich, dennoch kein vollständiger Schutz.');
    if (uviEnvClamped >= 8) ctx.push('Mittagszeit meidet man am besten; Schatten aufsuchen.');
    if (!ctx.length) ctx.push('Direkte Sonne ohne Wolken und am Bodenstandard.');
    context.textContent = ctx.join(' ');

    let tip = [];
    if (protection.value==='none') tip.push('Sonnencreme (mind. SPF 30) großzügig & regelmäßig nachcremen.');
    else tip.push('Regelmäßig nachcremen, v. a. nach Wasser/Kontakt.');
    if (loc==='hoch_schnee' || uviEnvClamped>=6) tip.push('Sonnenbrille mit UV‑400 und Kopfbedeckung tragen.');
    tip.push('Schatten suchen, 11–15 Uhr besonders vorsichtig sein; Kleidung (UPF) schützt zuverlässig.');
    if (child.checked) tip.push('Kinderhaut: direkte Sonne begrenzen, Hut/T‑Shirt, sensitives SPF 50+; Vorbild sein.');
    advice.textContent = tip.join(' ');

    // Visual intensity → ray opacity
    const rayOpacity = Math.min(1, 0.15 + (uviEnvClamped/12)*0.85);
    rays.forEach((r,i)=>{
      r.style.opacity = (rayOpacity * (0.7 + 0.3*Math.sin((Date.now()/600)+(i*0.4)))).toFixed(3);
    });

    // Human redness overlay basierend auf Dosisfraktion
    const redness = (ttb===Infinity) ? 0 : Math.max(0, Math.min(0.8, doseFrac * 0.8));
    humanBody.setAttribute('fill', mixColor('#4d3f3b', '#a33b3b', redness));

    // Timeline aktualisieren
    updateTimeline(ttb, dur);
  }

  // Utility to mix colors
  function mixColor(a,b,t){
    const pa = parseInt(a.slice(1),16);
    const pb = parseInt(b.slice(1),16);
    const ra=(pa>>16)&255, ga=(pa>>8)&255, ba=pa&255;
    const rb=(pb>>16)&255, gb=(pb>>8)&255, bb=pb&255;
    const r = Math.round(ra+(rb-ra)*t);
    const g = Math.round(ga+(gb-ga)*t);
    const bl= Math.round(ba+(bb-ba)*t);
    return '#' + [r,g,bl].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  // Events
  [uvBase, clouds, protection, skin, child, duration, ...locRadios].forEach(el=>{
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  // Reset
  resetBtn.addEventListener('click', ()=>{
    uvBase.value = 6;
    clouds.value = 20;
    protection.value = 'spf30';
    skin.value = 'II';
    child.checked = false;
    duration.value = 30;
    locRadios.forEach(r=> r.checked = (r.value==='strand'));
    update();
  });

  // Animate rays continuously & refresh UI
  setInterval(()=>update(), 300);
  update();
})();
</script>
</body>
</html>`;
