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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f172a">
<title>UV‑Simulator – Minimal</title>
<style>
  :root{
    --bg:#0f172a; --panel:#0f1525; --text:#e6eefc; --muted:#9fb0d6; --accent:#6aa9ff;
    --ok:#34d399; --warn:#fbbf24; --danger:#fb5a59; --focus:#93c5fd;
    --chip:#0b1223; --chip-border:#223356;
    --bar:#223458; --bar-stroke:#2b416e;
    /* UV-Style (wird auch inline auf <g> gesetzt für Safari) */
    --uvOpacity:.75; --uvWidth:3; --uvSpeed:3.2s;
  }
  *{ box-sizing:border-box }
  html,body{ height:100% }
  body{
    margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color:var(--text); background:linear-gradient(180deg, #0f172a, #0b1324 40%, #0a1120 100%);
    -webkit-tap-highlight-color: transparent; font-size:17px; padding-bottom: env(safe-area-inset-bottom);
  }
  header{ padding: max(16px, env(safe-area-inset-top)) 16px 4px; text-align:center }
  header h1{ margin:0 0 6px; font-size: clamp(20px, 3.6vw, 30px) }
  header p{ margin:0; color:var(--muted); font-size:14px }

  main{ max-width:1100px; margin:0 auto; padding:16px; display:grid; gap:16px; grid-template-columns: 1.1fr 1fr }
  @media (max-width: 980px){ main{ grid-template-columns: 1fr } }

  .card{ background:var(--panel); border:1px solid rgba(120,141,190,.22); border-radius:16px; overflow:hidden }
  .card h2{ margin:0; padding:12px 16px; font-size:16px; color:#bcd0f3; border-bottom:1px solid rgba(120,141,190,.18) }
  .content{ padding:14px }

  /* Minimal Scene */
  .scene{ width:100%; height:auto; display:block; background:linear-gradient(#78b7ff 0%, #c0e4ff 45%, #ffeec6 100%) }
  .label-sky{ font-size:10px; fill:#e6f0ff; opacity:.85 }
  .layer{ fill: rgba(35,67,130,.08) }
  .ozone{ fill: rgba(120,0,255,.10) }
  .ground{ fill:#e9d3a4 }
  .water{ fill:#86c5da }
  .snow{ fill:#f6fbff }
  .sun-core{ fill:#ffd24d }
  /* Sonnenstrahlen (dekorativ) ohne Filter für Safari-Stabilität */
  .sun-ray{ stroke:#ffd24d; stroke-width:2; stroke-linecap:round; opacity:.5 }

  /* Wolken */
  .cloud{ fill:#ffffff; opacity:.65 }
  .cloud.dark{ opacity:.85 }

  /* Person */
  .skin-fill{ fill:#5b4a44 }
  .skin-stroke{ stroke:#5b4a44; stroke-width:8; stroke-linecap:round; fill:none }

  /* UV-Pfade */
  .uvray{ fill:none; stroke:url(#uvGrad); stroke-width: var(--uvWidth); stroke-linecap:round;
          stroke-dasharray: 12 14; animation: flow var(--uvSpeed) linear infinite; opacity: var(--uvOpacity); }
  .uvray-oz{ opacity: calc(var(--uvOpacity) * .6) }
  .uvray-reflect{ stroke:url(#uvGrad); stroke-width: calc(var(--uvWidth) * .85); opacity: calc(var(--uvOpacity) * .75) }
  @keyframes flow{ to { stroke-dashoffset:-240 } }

  /* Schutz-Aura */
  .shield{ fill:url(#shieldGrad); opacity:0; transition: opacity .18s ease }

  /* Controls minimal */
  .group{ margin:8px 0 10px }
  .label{ display:block; font-weight:700; margin:0 0 6px }
  .hint{ color:var(--muted); font-size:13px }
  .chips{ display:flex; gap:8px; flex-wrap:wrap }
  .chip{ background:var(--chip); border:1.5px solid var(--chip-border); color:var(--text);
         border-radius:999px; padding:10px 14px; min-height:44px; display:inline-flex; align-items:center; gap:8px; cursor:pointer; user-select:none }
  .chip input{ appearance:none; width:18px; height:18px; border-radius:50%; border:2px solid #5d77a8; background:transparent }
  .chip input:checked{ border-color: var(--accent); background: radial-gradient(circle at 50% 50%, var(--accent) 0 45%, transparent 46%) }
  .chip.active{ border-color: var(--accent); outline:2px solid rgba(106,169,255,.25) }
  label.chip:focus-within{ outline:3px solid var(--focus); outline-offset: 2px }

  .switch{ background:var(--chip); border:1px solid var(--chip-border); border-radius:12px; display:inline-flex; align-items:center; gap:10px; padding:8px 12px; min-height:44px }
  .switch input{ width:44px; height:28px; appearance:none; background:#233a64; border-radius:999px; position:relative; outline:none }
  .switch input:before{ content:""; position:absolute; width:24px; height:24px; border-radius:50%; background:#fff; top:2px; left:2px; transition:left .15s }
  .switch input:checked{ background:#6aa9ff66 }
  .switch input:checked:before{ left:18px }

  .range-wrap{ display:flex; gap:10px; align-items:center }
  input[type="range"]{ -webkit-appearance:none; width:100%; height:44px; background:transparent; padding:10px 0 }
  input[type="range"]::-webkit-slider-runnable-track{ height:10px; background:#24385f; border-radius:999px; border:1px solid #2c4473 }
  input[type="range"]::-webkit-slider-thumb{ -webkit-appearance:none; margin-top:-9px; width:26px; height:26px; background:var(--accent); border-radius:50%; border:2px solid white }

  /* Summary */
  .summary{ display:flex; gap:12px; flex-wrap:wrap; align-items:center; background:#0b1324; border:1px solid rgba(120,141,190,.2); border-radius:12px; padding:10px 12px; margin-bottom:10px }
  .badge{ display:inline-flex; align-items:center; gap:6px; padding:8px 12px; border-radius:999px; font-weight:800 }
  .b-low{ background:#102b18; color:#b4f1c9; border:1px solid #1c5c36 }
  .b-mod{ background:#2a2a12; color:#f4f1a3; border:1px solid #69691f }
  .b-high{ background:#3b1c1c; color:#f5b7b7; border:1px solid #7a2f2f }
  .b-vhigh{ background:#3b1a2f; color:#ffb8e3; border:1px solid #7a2f58 }
  .b-ext{ background:#3b1025; color:#ffb0d8; border:1px solid #7a1f4e }
  .kpi{ font-size:24px; font-weight:800 }

  /* Duration bar */
  .bar{ width:100%; height:14px; background:var(--bar); border:1px solid var(--bar-stroke); border-radius:10px; position:relative; overflow:hidden }
  .bar-fill{ position:absolute; left:0; top:0; bottom:0; background: linear-gradient(90deg, #6aa9ff, #3b82f6); width:0% }
  .bar-mark{ position:absolute; top:-3px; width:2px; height:20px; background: var(--danger) }
  .bar-label{ font-size:12px; color:#cbd6f2; margin-top:6px }

  .footer{ padding:14px; text-align:center; color:var(--muted); font-size:12px }
  button{ border:1px solid var(--chip-border); background:var(--chip); color:var(--text); padding:12px 16px; border-radius:12px; cursor:pointer; min-height:44px }
</style>
</head>
<body>
<header>
  <h1>UV‑Simulator (minimal)</h1>
  <p>Animation zeigt den UV‑Weg durch die Atmosphäre bis zur Haut – inkl. Wolken, Ort, Schutz & Reflexionen.</p>
</header>

<main>
  <!-- Szene -->
  <section class="card">
    <h2>Visualisierung</h2>
    <div class="content" style="padding:0">
      <svg id="scene" class="scene" viewBox="0 0 900 480" role="img" aria-label="Sonne, Atmosphäre, UV-Strahlen und Person">
        <defs>
          <linearGradient id="uvGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#b59cff"/>
            <stop offset="100%" stop-color="#7d00ff"/>
          </linearGradient>
          <!-- Keine rgba() in stop-color: stop-opacity verwenden (Safari-freundlich) -->
          <radialGradient id="shieldGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#6aa9ff" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#6aa9ff" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Himmel -->
        <rect x="0" y="0" width="900" height="480" fill="url(#skygrad)"/>
        <defs>
          <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#78b7ff"/>
            <stop offset="45%" stop-color="#c0e4ff"/>
            <stop offset="100%" stop-color="#ffeec6"/>
          </linearGradient>
        </defs>

        <!-- Sonne -->
        <g id="sun" transform="translate(120,80)">
          <circle class="sun-core" r="42" cx="0" cy="0"/>
          <g id="sunRays"></g>
        </g>

        <!-- Wolken -->
        <g id="clouds"></g>

        <!-- Atmosphäre (vereinfacht) -->
        <g id="atm">
          <rect class="ozone" x="0" y="150" width="900" height="40"></rect>
          <text class="label-sky" x="12" y="174">Stratosphäre (Ozon)</text>
          <rect class="layer" x="0" y="190" width="900" height="40"></rect>
          <text class="label-sky" x="12" y="214">Troposphäre</text>
        </g>

        <!-- UV-Pfade -->
        <g id="uvPaths" style="--uvOpacity:.75; --uvWidth:3; --uvSpeed:3.2s"></g>

        <!-- Bodenvarianten -->
        <g id="ground">
          <rect id="waterRect" class="water" x="0" y="360" width="900" height="120" opacity="0"/>
          <rect class="ground" x="0" y="360" width="900" height="120"/>
          <g id="mountain" transform="translate(0,0)" opacity="0">
            <path d="M0,400 L160,330 L240,370 L340,320 L460,360 L560,330 L640,370 L900,370 L900,480 L0,480 Z" fill="#9fb5c8"/>
            <rect x="0" y="360" width="900" height="120" class="snow"/>
          </g>
        </g>

        <!-- Person -->
        <g id="person" transform="translate(620, 320)">
          <!-- Handtuch -->
          <rect x="-170" y="22" width="240" height="70" rx="8" ry="8" fill="#2d6eea" opacity=".75"/>
          <!-- Mensch (schlicht) -->
          <g id="human">
            <circle cx="120" cy="18" r="11" class="skin-fill"/>
            <path d="M55,40 Q92,25 120,30 Q148,33 176,44 L180,54 L55,54 Z" class="skin-fill"/>
            <path d="M105,38 Q96,45 86,47" class="skin-stroke"/>
            <path d="M55,54 Q66,66 78,68" class="skin-stroke" stroke-width="9"/>
          </g>
          <!-- Schutz-Aura -->
          <ellipse id="shield" class="shield" cx="-5" cy="52" rx="150" ry="58"></ellipse>
          <!-- Impact-Punkt (global → lokal gesetzt) -->
          <circle id="impact" r="8" fill="#a56bff" opacity="0"/>
          <!-- Kinder-Badge nach Aura, damit sichtbar -->
          <g id="childBadge" transform="translate(88,-10)" opacity="0">
            <rect x="-16" y="-12" width="36" height="22" rx="11" ry="11" fill="#12213e" stroke="#28406e"/>
            <text x="2" y="4" font-size="14" text-anchor="middle" fill="#e6eefc">👶</text>
          </g>
        </g>
      </svg>
    </div>
  </section>

  <!-- Steuerung + Ergebnis (minimal) -->
  <section class="card">
    <h2>Setup & Ergebnis</h2>
    <div class="content">
      <div class="summary" role="status" aria-live="polite">
        <span id="riskBadge" class="badge">RISIKO</span>
        <span class="kpi" id="ttb">–</span>
        <span>bis Rötung</span>
        <span>•</span>
        <span><strong>UVI an der Haut:</strong> <span id="uviEff">–</span></span>
      </div>

      <div class="group">
        <span class="label">Sonnenstärke</span>
        <div class="chips" id="sunStrength" role="radiogroup" aria-label="Sonnenstärke">
          <label class="chip active"><input type="radio" name="sun" value="low" checked> Niedrig</label>
          <label class="chip"><input type="radio" name="sun" value="mod"> Moderat</label>
          <label class="chip"><input type="radio" name="sun" value="high"> Hoch</label>
          <label class="chip"><input type="radio" name="sun" value="vhigh"> Sehr hoch</label>
          <label class="chip"><input type="radio" name="sun" value="ext"> Extrem</label>
        </div>
      </div>

      <div class="group">
        <span class="label">Himmel</span>
        <div class="chips" id="sky" role="radiogroup" aria-label="Himmel">
          <label class="chip active"><input type="radio" name="sky" value="klar" checked> Klar</label>
          <label class="chip"><input type="radio" name="sky" value="leicht"> Leicht bewölkt</label>
          <label class="chip"><input type="radio" name="sky" value="bewoelkt"> Bewölkt</label>
        </div>
      </div>

      <div class="group">
        <span class="label">Ort</span>
        <div class="chips" id="place" role="radiogroup" aria-label="Ort">
          <label class="chip active"><input type="radio" name="place" value="strand" checked> Strand</label>
          <label class="chip"><input type="radio" name="place" value="berg"> Berg + Schnee</label>
          <label class="chip"><input type="radio" name="place" value="wasser"> Im Wasser</label>
        </div>
      </div>

      <div class="group">
        <span class="label">Schutz</span>
        <div class="chips" id="protect" role="radiogroup" aria-label="Hautschutz">
          <label class="chip active"><input type="radio" name="prot" value="none" checked> Kein</label>
          <label class="chip"><input type="radio" name="prot" value="spf30"> SPF 30</label>
          <label class="chip"><input type="radio" name="prot" value="spf50"> SPF 50+</label>
          <label class="chip"><input type="radio" name="prot" value="upf50"> Kleidung</label>
        </div>
      </div>

      <div class="group">
        <span class="label">Haut</span>
        <div class="chips" id="skin" role="radiogroup" aria-label="Hautempfindlichkeit">
          <label class="chip active"><input type="radio" name="skin" value="verylight" checked> Sehr hell</label>
          <label class="chip"><input type="radio" name="skin" value="light"> Hell</label>
          <label class="chip"><input type="radio" name="skin" value="medium"> Mittel</label>
          <label class="chip"><input type="radio" name="skin" value="dark"> Dunkel</label>
        </div>
        <div class="switch" style="margin-top:8px">
          <input id="child" type="checkbox" aria-label="Kinderhaut berücksichtigen">
          <span>Kinderhaut berücksichtigen</span>
        </div>
      </div>

      <div class="group">
        <span class="label">Dauer in der Sonne</span>
        <div class="range-wrap">
          <input id="duration" type="range" min="0" max="180" step="5" value="30" aria-label="Minuten in der Sonne">
          <div id="durationVal" style="min-width:88px; text-align:center; font-weight:700">30 min</div>
        </div>
        <div class="bar" style="margin-top:8px">
          <div id="barFill" class="bar-fill"></div>
          <div id="barMark" class="bar-mark"></div>
        </div>
        <div class="bar-label" id="barInfo">Schwelle: –</div>
        <div class="hint" id="doseText">Erreichte UV‑Dosis: –</div>
      </div>

      <details style="margin-top:8px">
        <summary><strong>Hilfe & Erklärungen</strong></summary>
        <div class="hint" style="margin-top:8px">
          <p>Die Animation zeigt **UV‑Pfadsegmente** von der Sonne durch die **Ozon‑Schicht** zur **Haut**. Wolken dämpfen sichtbar, **Berg/Schnee** & **Wasser** erzeugen **Reflexionen**. **Schutz** bildet eine **Aureole** über der Person.</p>
          <p>Didaktisches Modell – echte Reaktion hängt u. a. von Auftragsmenge, Nachcremen, Winkel, Uhrzeit ab.</p>
        </div>
      </details>

      <div style="margin-top:12px; display:flex; gap:10px; justify-content:space-between; align-items:center; flex-wrap:wrap">
        <span class="hint">Lernzwecke – keine medizinische Beratung.</span>
        <button id="resetBtn">Zurücksetzen</button>
      </div>
    </div>
  </section>
</main>

<div class="footer">© 2026 UV‑Simulator · Faktoren heuristisch (Wolken/Ort/Schutz/Haut/Kinder/Ozon).</div>

<script>
(function(){
  /* ---------- UI Query Helpers ---------- */
  const chips = id => Array.from(document.querySelectorAll('#'+id+' label.chip input'));
  const sun = chips('sunStrength');
  const sky = chips('sky');
  const place = chips('place');
  const protect = chips('protect');
  const skin = chips('skin');
  const child = document.getElementById('child');
  const duration = document.getElementById('duration');
  const durationVal = document.getElementById('durationVal');

  const riskBadge = document.getElementById('riskBadge');
  const uviEffEl = document.getElementById('uviEff');
  const ttbEl = document.getElementById('ttb');
  const doseText = document.getElementById('doseText');
  const barFill = document.getElementById('barFill');
  const barMark = document.getElementById('barMark');
  const barInfo = document.getElementById('barInfo');
  const resetBtn = document.getElementById('resetBtn');

  /* ---------- Scene Elements ---------- */
  const cloudsGroup = document.getElementById('clouds');
  const mountain = document.getElementById('mountain');
  const waterRect = document.getElementById('waterRect');
  const uvPaths = document.getElementById('uvPaths');
  const shield = document.getElementById('shield');
  const childBadge = document.getElementById('childBadge');
  const impact = document.getElementById('impact');

  // Person-Transform (global → lokal)
  const PERSON_TX = 620, PERSON_TY = 320;
  const HUMAN_TARGET = { x: 610, y: 375 }; // globaler Zielpunkt auf der Brust
  // Impact lokal positionieren:
  impact.setAttribute('cx', (HUMAN_TARGET.x - PERSON_TX).toFixed(1));
  impact.setAttribute('cy', (HUMAN_TARGET.y - PERSON_TY).toFixed(1));

  /* ---------- Decorative sun rays ---------- */
  const sunRays = document.getElementById('sunRays');
  if (sunRays && sunRays.childNodes.length === 0) {
    for (let i=0;i<22;i++){
      const a = (Math.PI*2)*(i/22);
      const x1 = Math.cos(a)*62, y1 = Math.sin(a)*62;
      const x2 = Math.cos(a)*108, y2 = Math.sin(a)*108;
      const l = document.createElementNS('http://www.w3.org/2000/svg','line');
      l.setAttribute('x1',x1); l.setAttribute('y1',y1);
      l.setAttribute('x2',x2); l.setAttribute('y2',y2);
      l.setAttribute('class','sun-ray');
      sunRays.appendChild(l);
    }
  }

  /* ---------- Selections & Active Chips ---------- */
  function getSel(arr){ const r = arr.find(i=>i.checked); return r ? r.value : null; }
  function markActives(){
    document.querySelectorAll('label.chip').forEach(l=>l.classList.remove('active'));
    [sun, sky, place, protect, skin].flat().forEach(inp=>{
      if (inp.checked) inp.closest('label.chip')?.classList.add('active');
    });
  }

  /* ---------- Mappings (minimal) ---------- */
  function mapSun(val){ return ({low:2, mod:4, high:6.5, vhigh:9, ext:11.5}[val] ?? 4); }
  function mapSky(val){
    const pct = ({klar:0, leicht:40, bewoelkt:80}[val] ?? 0);
    let f = 1 - 0.8*(pct/100); // bis 80% Dämpfung
    return Math.max(0.2, Math.min(1.1, f));
  }
  function mapPlace(val){ return ({strand:1.0, berg:1.6, wasser:0.7}[val] ?? 1.0); }
  function mapProtect(val){ return ({none:1.0, spf30:1/30, spf50:1/50, upf50:1/50}[val] ?? 1.0); }
  function baseT10(v){ return ({ verylight:15, light:25, medium:40, dark:80 }[v] ?? 25); }
  function riskCategory(uviEnv){
    if (uviEnv < 3) return {label:'niedrig', class:'b-low'};
    if (uviEnv < 6) return {label:'moderat', class:'b-mod'};
    if (uviEnv < 8) return {label:'hoch', class:'b-high'};
    if (uviEnv < 11) return {label:'sehr hoch', class:'b-vhigh'};
    return {label:'extrem', class:'b-ext'};
  }
  function mixColor(a,b,t){
    const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
    const ra=(pa>>16)&255, ga=(pa>>8)&255, ba=pa&255;
    const rb=(pb>>16)&255, gb=(pb>>8)&255, bb=pb&255;
    const r=Math.round(ra+(rb-ra)*t), g=Math.round(ga+(gb-ga)*t), bl=Math.round(ba+(bb-ba)*t);
    return '#'+[r,g,bl].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  /* ---------- Model ---------- */
  function compute(){
    const sunVal = mapSun(getSel(sun));
    const fSky   = mapSky(getSel(sky));
    const fLoc   = mapPlace(getSel(place));
    const fProt  = mapProtect(getSel(protect));
    const isChild= child.checked;
    const skinVal= getSel(skin);

    const uviEnv = sunVal * fSky * fLoc;
    const uviSkin= uviEnv * fProt;

    let t10 = baseT10(skinVal);
    if (isChild) t10 *= 0.7; // Kinder empfindlicher
    const ttb = (uviSkin<=0.01) ? Infinity : t10 * (10 / uviSkin);
    return { uviEnv, uviSkin, ttb, fSky, fLoc, fProt };
  }

  /* ---------- Clouds (nur neu bei Moduswechsel) ---------- */
  let lastSky = null;
  function renderClouds(mode){
    if (lastSky === mode) return;
    lastSky = mode;
    cloudsGroup.innerHTML = '';
    if (mode === 'klar') return;
    const isLight = (mode === 'leicht');
    const cfg = isLight
      ? [{x:260,y:80,s:1.1,op:.5},{x:520,y:60,s:1.2,op:.45},{x:720,y:90,s:.9,op:.5}]
      : [{x:160,y:70,s:1.4,op:.85},{x:360,y:60,s:1.2,op:.8},{x:560,y:85,s:1.3,op:.8},{x:760,y:70,s:1.1,op:.85},{x:460,y:110,s:1.0,op:.8}];
    cfg.forEach(c=>{
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform', \`translate(\${c.x},\${c.y}) scale(\${c.s})\`);
      const p = document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d','M-40,10a20,16 0 0,1 30,-14a24,20 0 0,1 38,8a20,16 0 0,1 22,6a24,18 0 0,1 -20,16h-80a18,14 0 0,1 10,-16z');
      p.setAttribute('class', isLight ? 'cloud' : 'cloud dark');
      p.setAttribute('opacity', c.op.toString());
      g.appendChild(p); cloudsGroup.appendChild(g);
    });
  }

  /* ---------- UV paths (main + reflection groups) ---------- */
  const SUN = {x:120, y:80};
  const OZONE_TOP = 150, OZONE_BOTTOM = 190;

  // Baue Strahlen immer neu (geringe Anzahl ⇒ performant), aber in einer Gruppe
  function buildUVPaths(count=6){
    uvPaths.innerHTML = '';
    // Hauptpfade
    for(let i=0;i<count;i++){
      const spread = i - (count-1)/2;
      const mid1 = { x: lerp(SUN.x, HUMAN_TARGET.x, 0.28) + spread*12, y: OZONE_TOP + spread*3 };
      const mid2 = { x: lerp(SUN.x, HUMAN_TARGET.x, 0.52) + spread*8,  y: OZONE_BOTTOM + spread*2 };
      appendUVSegment([SUN, mid1], false);
      appendUVSegment([mid1, mid2], true);  // im Ozon gedämpft
      appendUVSegment([mid2, HUMAN_TARGET], false);
    }
    // Reflexionen (Berg/Wasser)
    const loc = getSel(place);
    if (loc === 'berg' || loc === 'wasser'){
      const baseY = 360;
      const srcX = (loc === 'berg') ? HUMAN_TARGET.x - 90 : HUMAN_TARGET.x - 50;
      for (let r=0; r<3; r++){
        const from = {x: srcX + r*18, y: baseY + 16 + r*4};
        const to   = {x: HUMAN_TARGET.x - 12 + r*6, y: HUMAN_TARGET.y - 12 - r*4};
        const p = mkPath(dFrom([from,to]), 'uvray uvray-reflect');
        uvPaths.appendChild(p);
      }
    }
  }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function dFrom(pts){ let d='M'+pts[0].x+','+pts[0].y; for(let i=1;i<pts.length;i++) d+=' L'+pts[i].x+','+pts[i].y; return d; }
  function mkPath(d, cls){ const p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d', d); p.setAttribute('class', cls); return p; }
  function appendUVSegment(pts, inOzone){
    const cls = inOzone ? 'uvray uvray-oz' : 'uvray';
    uvPaths.appendChild(mkPath(dFrom(pts), cls));
  }

  /* ---------- Visuals (vars + aura + impact + scene assets) ---------- */
  function applyVisuals(uviEnv, uviSkin, fProt){
    const envRatio = Math.max(0, Math.min(1, uviEnv / 12));
    const skinRatio= Math.max(0, Math.min(1, uviSkin / 12));
    const uvOpacity = 0.35 + envRatio*0.55;  // 0.35–0.90
    const uvWidth   = 2.3 + envRatio*1.7;    // 2.3–4.0
    const uvSpeedS  = (4.2 - envRatio*2.6).toFixed(2) + 's';

    // CSS Vars sowohl global als auch am <g> setzen (Safari)
    document.documentElement.style.setProperty('--uvOpacity', uvOpacity.toFixed(2));
    document.documentElement.style.setProperty('--uvWidth', uvWidth.toFixed(2));
    document.documentElement.style.setProperty('--uvSpeed', uvSpeedS);
    uvPaths.style.setProperty('--uvOpacity', uvOpacity.toFixed(2));
    uvPaths.style.setProperty('--uvWidth', uvWidth.toFixed(2));
    uvPaths.style.setProperty('--uvSpeed', uvSpeedS);

    // Schutz-Aura: dichter je geringer Transmission
    const shieldOpacity = Math.min(0.85, Math.max(0, 1 - fProt));
    shield.setAttribute('opacity', shieldOpacity.toFixed(2));

    // Kinder-Badge
    childBadge.setAttribute('opacity', child.checked ? '1' : '0');

    // Impact: Sichtbarkeit & Radius ~ uviSkin
    const impactOpacity = Math.min(0.95, 0.15 + skinRatio*0.85);
    const impactR = 6 + skinRatio*7;
    impact.setAttribute('opacity', impactOpacity.toFixed(2));
    impact.setAttribute('r', impactR.toFixed(1));

    // Haut leicht röten nach uviSkin
    const tint = Math.min(.55, skinRatio*.55);
    const mix = mixColor('#5b4a44', '#a33b3b', tint);
    document.querySelectorAll('.skin-fill').forEach(el => el.setAttribute('fill', mix));
    document.querySelectorAll('.skin-stroke').forEach(el => el.setAttribute('stroke', mix));
  }

  /* ---------- UI Update ---------- */
  function update(){
    // Active state
    markActives();

    // Szene Assets
    const loc = getSel(place);
    waterRect.setAttribute('opacity', loc==='wasser' ? '1' : '0');
    mountain.setAttribute('opacity', loc==='berg' ? '1' : '0');

    // Wolken nur neu bei Moduswechsel
    renderClouds(getSel(sky));

    // Pfade neu (geringe Anzahl → schnell)
    buildUVPaths(6);

    // Model
    const { uviEnv, uviSkin, ttb, fSky, fLoc, fProt } = compute();

    // Summary
    const risk = riskCategory(Math.max(0,uviEnv));
    riskBadge.textContent = 'RISIKO: ' + risk.label.toUpperCase();
    riskBadge.className = 'badge ' + risk.class;
    uviEffEl.textContent = Math.max(0,uviSkin).toFixed(1);
    ttbEl.textContent = (ttb===Infinity) ? '–' : (ttb<120 ? Math.round(ttb)+' min' : (ttb/60).toFixed(1)+' h');

    // Dauer/Leiste
    const dur = Number(duration.value);
    durationVal.textContent = dur + ' min';
    const frac = (ttb===Infinity) ? 0 : (dur/ttb);
    const pct = Math.max(0, frac*100);
    doseText.textContent = 'Erreichte UV‑Dosis: ' + (pct>=1000 ? '>1000%' : Math.round(pct)+'%');

    // Fill (0–180 min Skala) & Marker (Schwelle)
    barFill.style.width = Math.max(0, Math.min(100, (dur/180)*100)) + '%';
    if (ttb===Infinity || ttb>180){
      barMark.style.left = '100%';
      barInfo.textContent = 'Schwelle: > 3 h';
    } else {
      barMark.style.left = (Math.max(0, Math.min(1, ttb/180)) * 100) + '%';
      barInfo.textContent = 'Schwelle: ' + Math.round(ttb) + ' min';
    }

    // Visual Intensitäten
    applyVisuals(uviEnv, uviSkin, fProt);
  }

  /* ---------- Events (ohne setInterval) ---------- */
  [ ...sun, ...sky, ...place, ...protect, ...skin ].forEach(inp=>{
    inp.addEventListener('change', update);
    inp.addEventListener('input', update, {passive:true});
  });
  child.addEventListener('change', update);
  duration.addEventListener('input', update, {passive:true});

  // Reset (erst Active markieren, dann Update)
  resetBtn.addEventListener('click', ()=>{
    sun.forEach(i=> i.checked = (i.value==='low'));
    sky.forEach(i=> i.checked = (i.value==='klar'));
    place.forEach(i=> i.checked = (i.value==='strand'));
    protect.forEach(i=> i.checked = (i.value==='none'));
    skin.forEach(i=> i.checked = (i.value==='verylight'));
    child.checked = false;
    duration.value = 30;
    markActives();
    update();
  });

  // Erste Darstellung
  update();
})();
</script>
</body>
</html>`;
