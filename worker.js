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
<title>UV‑Simulator – Einfach & iPad‑freundlich (verbesserte Animation)</title>
<style>
  :root{
    --bg:#0f172a;
    --panel:#101c34;
    --panel2:#0b1326;
    --text:#e6eefc;
    --muted:#a7b3d2;
    --accent:#22c3ff;
    --ok:#34d399;
    --warn:#fbbf24;
    --danger:#fb5a59;
    --chip:#0a1430;
    --chip-border:#223356;
    --focus:#93c5fd;

    /* Animationsvariablen */
    --uvOpacity: .72;   /* Gesamtopazität UV-Pfade (wird per JS gesetzt) */
    --uvSpeed: 4s;      /* Flussgeschwindigkeit der UV-Dashes */
    --uvWidth: 3;       /* Breite der UV-Pfade */
  }

  *{ box-sizing: border-box }
  html, body{ height:100% }
  body{
    margin:0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
    font-size: 17px; /* iPad baseline 16+ */
    color: var(--text);
    background: radial-gradient(1200px 800px at 70% -260px, #1a2f57 0%, var(--bg) 42%, #0a1324 100%);
    -webkit-tap-highlight-color: transparent;
    padding-bottom: env(safe-area-inset-bottom);
  }

  header{ padding: max(16px, env(safe-area-inset-top)) 16px 6px; text-align:center }
  header h1{ margin:0 0 4px; font-size: clamp(20px, 3.6vw, 32px) }
  header p{ margin:0; color:var(--muted); font-size:15px }

  main{
    display:grid; gap:16px;
    grid-template-columns: 1.1fr 1fr;
    padding:16px; max-width:1100px; margin:0 auto;
  }
  @media (max-width: 980px){ main{ grid-template-columns: 1fr } }

  .card{
    background: linear-gradient(180deg, var(--panel) 0%, var(--panel2) 100%);
    border:1px solid rgba(120,141,190,.24);
    border-radius:16px; overflow:hidden;
    box-shadow: 0 10px 26px rgba(0,0,0,.18);
  }
  .card h2{ margin:0; padding:12px 16px; font-size:16px; background: rgba(10,17,34,.35); border-bottom:1px solid rgba(120,141,190,.22) }
  .content{ padding:14px }

  /* Scene */
  .scene{ width:100%; height:auto; display:block; background:linear-gradient(#78b7ff 0%, #c0e4ff 45%, #ffeec6 100%) }
  .layer-label{ font-size:10px; fill:#e6f0ff; opacity:.85 }
  .layer{ fill: rgba(35,67,130,.08) }
  .ozone{ fill: rgba(120, 0, 255, .10) }
  .beach{ fill:#f2d49b }
  .water{ fill:#86c5da }
  .snow{ fill:#f6fbff; }
  .ground{ fill:#e9d3a4 }
  .human-skin{ fill:#5b4a44 }
  .towel{ fill:#3ab7ff; opacity:.8 }
  .umbrella{ fill:#ff6a6a }
  .umbrella-top{ fill:#ffc36b }
  .sun{ fill:#ffd24d; filter: drop-shadow(0 0 6px rgba(255,210,77,.8)); animation: pulse 2.6s ease-in-out infinite }
  .ray{ stroke:#ffd24d; stroke-width:2.2; stroke-linecap:round; opacity:.55 }
  @keyframes pulse{ 0%{opacity:.55} 50%{opacity:1} 100%{opacity:.55} }

  /* Clouds */
  .cloud{ fill:#ffffff; filter: drop-shadow(0 2px 8px rgba(0,0,0,.08)); opacity:.6 }
  .cloud.dark{ opacity:.85 }

  /* UV path (animated) */
  .uvray{ fill:none; stroke:url(#uvGrad); stroke-width: var(--uvWidth); stroke-linecap:round;
          stroke-dasharray: 12 14; animation: flow var(--uvSpeed) linear infinite; opacity: var(--uvOpacity);
          filter: drop-shadow(0 0 6px rgba(160,90,255,.35)); }
  .uvray-oz{ opacity: calc(var(--uvOpacity) * .6) } /* im Ozon schwächer */
  .uvray-reflect{ stroke:url(#uvGrad); stroke-width: calc(var(--uvWidth) * .85); opacity: calc(var(--uvOpacity) * .75) }
  @keyframes flow{ to { stroke-dashoffset: -240 } }

  /* Schutz-Aura */
  .shield{ fill:url(#shieldGrad); opacity:.0; transition: opacity .2s ease }

  /* Result card */
  .summary{
    display:flex; gap:12px; flex-wrap:wrap; align-items:center;
    background: rgba(10,17,34,.35); border:1px solid rgba(120,141,190,.22);
    border-radius:14px; padding:10px 12px; margin-bottom:10px
  }
  .badge{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; font-weight:800 }
  .b-low{ background:#10391f; color:#a6f1c3; border:1px solid #1f6b3a }
  .b-mod{ background:#2b2b12; color:#f4f1a3; border:1px solid #6b6a1f }
  .b-high{ background:#3b1c1c; color:#f5b7b7; border:1px solid #7a2f2f }
  .b-vhigh{ background:#3b1a2f; color:#ffb8e3; border:1px solid #7a2f58 }
  .b-ext{ background:#3b1025; color:#ffb0d8; border:1px solid #7a1f4e }
  .kpi{ font-size:24px; font-weight:800 }

  /* Controls (vereinfachte, aus deiner letzten Version) */
  .group{ margin-bottom:10px }
  .label{ font-weight:700; margin:8px 0 6px; display:block }
  .hint{ color:var(--muted); font-size:14px }

  .chips{ display:flex; gap:10px; flex-wrap:wrap }
  .chip{
    display:inline-flex; align-items:center; gap:8px;
    background: var(--chip);
    color: var(--text);
    border:1.5px solid var(--chip-border);
    border-radius:999px; padding:10px 14px;
    min-height:44px; cursor:pointer; user-select:none;
  }
  .chip input{ appearance:none; width:18px; height:18px; border-radius:50%; border:2px solid #5d77a8; display:inline-block }
  .chip input:checked{ border-color: var(--accent); background: radial-gradient(circle at 50% 50%, var(--accent) 0 45%, transparent 46%) }
  .chip.active{ border-color: var(--accent); background: rgba(34,195,255,.12) }
  .seg-label{ font-weight:600 }

  .switch{
    display:inline-flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px;
    background: var(--chip); border:1px solid var(--chip-border);
    min-height:44px;
  }
  .switch input{ width:44px; height:28px; appearance:none; background:#233a64; border-radius:999px; position:relative; outline:none }
  .switch input:before{
    content:""; position:absolute; width:24px; height:24px; border-radius:50%; background:#fff; top:2px; left:2px; transition:left .15s;
  }
  .switch input:checked{ background: #22c3ff66 }
  .switch input:checked:before{ left:18px }

  .range-wrap{ display:flex; gap:10px; align-items:center }
  input[type="range"]{ -webkit-appearance:none; width:100%; height:44px; background:transparent; padding:10px 0 }
  input[type="range"]::-webkit-slider-runnable-track{ height:12px; background:#24385f; border-radius:999px; border:1px solid #2c4473 }
  input[type="range"]::-webkit-slider-thumb{
    -webkit-appearance:none; margin-top:-10px; width:28px; height:28px; background:var(--accent); border-radius:50%; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,.25)
  }

  .bar{ width:100%; height:16px; background:#223458; border:1px solid #28406e; border-radius:10px; position:relative; overflow:hidden }
  .bar-fill{ position:absolute; left:0; top:0; bottom:0; background: linear-gradient(90deg, #22c3ff, #0ea5e9); width:0% }
  .bar-mark{ position:absolute; top:-4px; width:2px; height:24px; background: var(--danger) }

  .footer{ padding:14px; text-align:center; color:var(--muted); font-size:13px }

  button{
    border:1px solid var(--chip-border); background:var(--chip); color:var(--text);
    padding:12px 16px; border-radius:12px; cursor:pointer; min-height:44px;
  }
</style>
</head>
<body>
<header>
  <h1>UV‑Simulator (einfach)</h1>
  <p>Animation zeigt jetzt den realen UV‑Weg durch die Atmosphäre bis zur Haut – inkl. Wolken, Ort, Schutz & Reflexionen.</p>
</header>

<main>
  <!-- Szene -->
  <section class="card">
    <h2>Visualisierung</h2>
    <div class="content" style="padding:0">
      <svg id="scene" class="scene" viewBox="0 0 900 500" role="img" aria-label="Sonne, Atmosphäre, UV-Strahlen und Person">
        <defs>
          <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#78b7ff"/>
            <stop offset="45%" stop-color="#c0e4ff"/>
            <stop offset="100%" stop-color="#ffeec6"/>
          </linearGradient>
          <!-- UV-Farbverlauf -->
          <linearGradient id="uvGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#9c7cff"/>
            <stop offset="100%" stop-color="#7d00ff"/>
          </linearGradient>
          <!-- Schutz-Aura -->
          <radialGradient id="shieldGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="rgba(34,195,255,.35)"/>
            <stop offset="100%" stop-color="rgba(34,195,255,0)"/>
          </radialGradient>
        </defs>

        <!-- Himmel -->
        <rect x="0" y="0" width="900" height="500" fill="url(#skygrad)"/>

        <!-- Sonne -->
        <g id="sun" transform="translate(120,80)">
          <circle class="sun" r="44" cx="0" cy="0"/>
          <g id="sunRays"></g>
        </g>

        <!-- Wolken -->
        <g id="clouds"></g>

        <!-- Atmosphärenschichten (vereinfachte Darstellung) -->
        <g id="atm">
          <rect class="layer ozone" x="0" y="160" width="900" height="40"></rect>
          <text class="layer-label" x="12" y="185">Stratosphäre (Ozon)</text>
          <rect class="layer" x="0" y="200" width="900" height="40"></rect>
          <text class="layer-label" x="12" y="225">Troposphäre</text>
        </g>

        <!-- UV-Pfade -->
        <g id="uvPaths"></g>

        <!-- Boden-Varianten -->
        <g id="ground">
          <!-- Wasserfläche (sichtbar bei Ort=wasser) -->
          <rect class="water" id="waterRect" x="0" y="380" width="900" height="120" opacity="0"/>
          <!-- Strand/Standard -->
          <rect class="ground" x="0" y="380" width="900" height="120"/>
          <!-- Berg & Schnee (sichtbar bei Ort=berg) -->
          <g id="mountain" transform="translate(0,0)" opacity="0">
            <path d="M0,420 L180,340 L260,380 L360,320 L460,360 L560,330 L640,380 L900,380 L900,500 L0,500 Z" fill="#9fb5c8"/>
            <path d="M160,340 L180,340 L200,360 L220,350 L240,360 L260,348 L280,358" stroke="#eaf3ff" stroke-width="4" fill="none" opacity=".7"/>
            <rect x="0" y="380" width="900" height="120" class="snow"/>
          </g>
        </g>

        <!-- Person, Handtuch & Schirm -->
        <g id="person" transform="translate(620, 330)">
          <!-- Handtuch -->
          <rect x="-180" y="20" width="260" height="80" class="towel" rx="8" ry="8"/>
          <!-- Schirm -->
          <g transform="translate(-110,-10)">
            <path d="M0,0 L0,70" stroke="#6b3a2e" stroke-width="4"/>
            <path class="umbrella-top" d="M-40,0 Q0,-35 40,0 Z"/>
            <path class="umbrella" d="M-40,0 Q0,-35 40,0 Q32,-3 24,0 Q16,-4 8,0 Q0,-4 -8,0 Q-16,-4 -24,0 Q-32,-3 -40,0 Z"/>
          </g>
          <!-- Mensch (vereinfacht, aber schöner) -->
          <g id="human" transform="translate(-30,0)">
            <!-- Kopf -->
            <circle cx="130" cy="20" r="12" class="human-skin"/>
            <!-- Rumpf -->
            <path d="M60,40 Q95,25 130,30 Q160,33 188,44 L192,54 L60,54 Z" class="human-skin"/>
            <!-- Arm -->
            <path d="M110,38 Q100,46 90,48" stroke="#5b4a44" stroke-width="8" stroke-linecap="round" fill="none"/>
            <!-- Bein -->
            <path d="M60,54 Q70,66 82,68" stroke="#5b4a44" stroke-width="10" stroke-linecap="round" fill="none"/>
          </g>
          <!-- Schutz-Aura (Deckfläche über Person) -->
          <ellipse id="shield" class="shield" cx="-10" cy="55" rx="160" ry="65"></ellipse>
          <!-- Kinder-Badge -->
          <g id="childBadge" transform="translate(90,-12)" opacity="0">
            <rect x="-16" y="-14" width="40" height="24" rx="12" ry="12" fill="#1b2b49" stroke="#28406e"/>
            <text x="4" y="3" font-size="14" text-anchor="middle" fill="#e6eefc">👶</text>
          </g>
          <!-- Auftreff-Indikator (zeigt UVI an der Haut) -->
          <circle id="impact" cx="30" cy="48" r="8" fill="#a56bff" opacity=".0"/>
        </g>
      </svg>
    </div>
  </section>

  <!-- Steuerung & Ergebnis (deine vereinfachte UI bleibt) -->
  <section class="card">
    <h2>Dein Setup & Ergebnis</h2>
    <div class="content">
      <div class="summary" role="status" aria-live="polite">
        <span id="riskBadge" class="badge">RISIKO</span>
        <span class="kpi" id="ttb">–</span>
        <span>bis Rötung</span>
        <span>•</span>
        <span><strong>UVI an der Haut:</strong> <span id="uviEff">–</span></span>
      </div>

      <!-- Sonnenstärke -->
      <div class="group">
        <div class="label">Sonnenstärke</div>
        <div class="chips" id="sunStrength" role="radiogroup" aria-label="Sonnenstärke in Stufen">
          <label class="chip active"><input type="radio" name="sun" value="low" checked> <span class="seg-label">Niedrig</span></label>
          <label class="chip"><input type="radio" name="sun" value="mod"> <span class="seg-label">Moderat</span></label>
          <label class="chip"><input type="radio" name="sun" value="high"> <span class="seg-label">Hoch</span></label>
          <label class="chip"><input type="radio" name="sun" value="vhigh"> <span class="seg-label">Sehr hoch</span></label>
          <label class="chip"><input type="radio" name="sun" value="ext"> <span class="seg-label">Extrem</span></label>
        </div>
        <div class="hint">Von „Niedrig“ bis „Extrem“. Intern typischer UVI-Mittelwert (z. B. „Hoch“ ≈ 6–7).</div>
      </div>

      <!-- Himmel -->
      <div class="group">
        <div class="label">Himmel</div>
        <div class="chips" id="sky" role="radiogroup" aria-label="Himmel">
          <label class="chip active"><input type="radio" name="sky" value="klar" checked> <span class="seg-label">Klar</span></label>
          <label class="chip"><input type="radio" name="sky" value="leicht"> <span class="seg-label">Leicht bewölkt</span></label>
          <label class="chip"><input type="radio" name="sky" value="bewoelkt"> <span class="seg-label">Bewölkt</span></label>
        </div>
        <div class="hint">Wolken dämpfen UV — aber nie komplett.</div>
      </div>

      <!-- Ort -->
      <div class="group">
        <div class="label">Ort</div>
        <div class="chips" id="place" role="radiogroup" aria-label="Ort">
          <label class="chip active"><input type="radio" name="place" value="strand" checked> <span class="seg-label">Strand</span></label>
          <label class="chip"><input type="radio" name="place" value="berg"> <span class="seg-label">Berg + Schnee</span></label>
          <label class="chip"><input type="radio" name="place" value="wasser"> <span class="seg-label">Im Wasser</span></label>
        </div>
        <div class="hint">Berg/Schnee verstärkt (Höhe + Reflexion). Wasser dämpft im Körper, spiegelt an der Oberfläche.</div>
      </div>

      <!-- Schutz -->
      <div class="group">
        <div class="label">Schutz</div>
        <div class="chips" id="protect" role="radiogroup" aria-label="Hautschutz">
          <label class="chip active"><input type="radio" name="prot" value="none" checked> <span class="seg-label">Kein</span></label>
          <label class="chip"><input type="radio" name="prot" value="spf30"> <span class="seg-label">SPF 30</span></label>
          <label class="chip"><input type="radio" name="prot" value="spf50"> <span class="seg-label">SPF 50+</span></label>
          <label class="chip"><input type="radio" name="prot" value="upf50"> <span class="seg-label">Kleidung</span></label>
        </div>
        <div class="hint">SPF/UPF ≈ Anteil der UV‑Strahlung, der **nicht** durchkommt (vereinfacht 1/SPF).</div>
      </div>

      <!-- Haut + Kinder -->
      <div class="group">
        <div class="label">Haut</div>
        <div class="chips" id="skin" role="radiogroup" aria-label="Hautempfindlichkeit">
          <label class="chip active"><input type="radio" name="skin" value="verylight" checked> <span class="seg-label">Sehr hell</span></label>
          <label class="chip"><input type="radio" name="skin" value="light"> <span class="seg-label">Hell</span></label>
          <label class="chip"><input type="radio" name="skin" value="medium"> <span class="seg-label">Mittel</span></label>
          <label class="chip"><input type="radio" name="skin" value="dark"> <span class="seg-label">Dunkel</span></label>
        </div>
        <div class="switch" style="margin-top:8px">
          <input id="child" type="checkbox" aria-label="Kinderhaut berücksichtigen" />
          <span>Kinderhaut berücksichtigen</span>
        </div>
      </div>

      <!-- Dauer + einfache Leiste -->
      <div class="group">
        <div class="label">Dauer in der Sonne</div>
        <div class="range-wrap">
          <input id="duration" type="range" min="0" max="180" step="5" value="30" aria-label="Minuten in der Sonne">
          <div id="durationVal" style="min-width:90px; text-align:center; font-weight:700">30 min</div>
        </div>
        <div class="bar" style="margin-top:8px">
          <div id="barFill" class="bar-fill" style="width:0%"></div>
          <div id="barMark" class="bar-mark" style="left:100%"></div>
        </div>
        <div class="hint" id="doseText">Erreichte UV‑Dosis: –</div>
      </div>

      <details style="margin-top:8px">
        <summary style="cursor:pointer"><strong>Hilfe & Erklärungen</strong></summary>
        <div class="hint" style="margin-top:8px">
          <p>Die Animation zeigt **bewegte UV‑Pfade** von der Sonne zur Haut. In der **Ozon‑Schicht** werden sie sichtbar gedämpft. **Wolken** verringern Intensität, **Berg/Schnee** und **Wasser** erzeugen **Reflex‑Strahlen**. **Schutz** legt eine **Aureole** über die Person.</p>
          <p>**Hinweis:** Didaktisches Modell. Individuelle Reaktionen können abweichen. Regelmäßig nachcremen, Schatten suchen (11–15 Uhr), Augen schützen.</p>
        </div>
      </details>

      <div style="margin-top:12px; display:flex; gap:10px; justify-content:space-between; flex-wrap:wrap; align-items:center">
        <span class="hint">Lernzwecke – keine medizinische Beratung.</span>
        <button id="resetBtn">Zurücksetzen</button>
      </div>
    </div>
  </section>
</main>

<div class="footer">© 2026 UV‑Simulator · Heuristische Faktoren (Wolken/Ort/Schutz/Haut/Kinder/Ozon).</div>

<script>
(function(){
  /* ====== Hilfsfunktionen für UI & Mapping (gleich wie vorher, leicht angepasst) ====== */
  const chips = (id)=>Array.from(document.querySelectorAll('#'+id+' label.chip input'));
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
  const resetBtn = document.getElementById('resetBtn');

  // Szene-Elemente
  const cloudsGroup = document.getElementById('clouds');
  const mountain = document.getElementById('mountain');
  const waterRect = document.getElementById('waterRect');
  const uvPaths = document.getElementById('uvPaths');
  const shield = document.getElementById('shield');
  const childBadge = document.getElementById('childBadge');
  const impact = document.getElementById('impact');
  const humanBody = document.getElementById('human'); // Gruppe
  const humanSkin = document.querySelector('.human-skin');

  // Sonne: dekorative Strahlen
  const sunRays = document.getElementById('sunRays');
  if(sunRays && sunRays.childNodes.length === 0){
    for(let i=0;i<24;i++){
      const a = (Math.PI*2)*(i/24);
      const x1 = Math.cos(a)*64, y1 = Math.sin(a)*64;
      const x2 = Math.cos(a)*116, y2 = Math.sin(a)*116;
      const l = document.createElementNS('http://www.w3.org/2000/svg','line');
      l.setAttribute('x1',x1); l.setAttribute('y1',y1);
      l.setAttribute('x2',x2); l.setAttribute('y2',y2);
      l.setAttribute('class','ray');
      sunRays.appendChild(l);
    }
  }

  function markActives(){
    document.querySelectorAll('label.chip').forEach(l=>l.classList.remove('active'));
    [sun, sky, place, protect, skin].flat().forEach(inp=>{
      if (inp.checked) inp.closest('label.chip')?.classList.add('active');
    });
  }

  function getSel(arr){ const r=arr.find(i=>i.checked); return r ? r.value : null }

  /* Mapping */
  function mapSun(val){
    return {low:2, mod:4, high:6.5, vhigh:9, ext:11.5}[val] ?? 4;
  }
  function mapSky(val){
    const pct = {klar:0, leicht:40, bewoelkt:80}[val] ?? 0;
    let f = 1 - 0.8*(pct/100);
    return Math.max(0.2, Math.min(1.1, f));
  }
  function mapPlace(val){ return {strand:1.0, berg:1.6, wasser:0.7}[val] ?? 1.0; }
  function mapProtect(val){ return {none:1.0, spf30:(1/30), spf50:(1/50), upf50:(1/50)}[val] ?? 1.0; }
  function baseT10(v){ return { verylight:15, light:25, medium:40, dark:80 }[v] ?? 25 }

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

  /* Modell */
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
    if (isChild) t10 *= 0.7;
    const ttb = (uviSkin<=0.01) ? Infinity : t10 * (10 / uviSkin);

    return { uviEnv, uviSkin, ttb, fSky, fLoc, fProt };
  }

  /* Wolken zeichnen */
  function renderClouds(mode){
    cloudsGroup.innerHTML = '';
    const isLight = mode==='leicht';
    const isCloudy = mode==='bewoelkt';
    const clouds = [];
    if (mode==='klar') {
      // keine Wolken
    } else if (isLight) {
      clouds.push({x:260,y:80,s:1.1,op:.5},{x:520,y:60,s:1.3,op:.45},{x:720,y:90,s:.9,op:.5});
    } else if (isCloudy) {
      clouds.push({x:160,y:70,s:1.4,op:.85},{x:360,y:60,s:1.2,op:.8},{x:560,y:85,s:1.3,op:.8},{x:760,y:70,s:1.1,op:.85},{x:460,y:110,s:1.0,op:.8});
    }
    clouds.forEach(c=>{
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform', \`translate(\${c.x},\${c.y}) scale(\${c.s})\`);
      const p = document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d','M-40,10a20,16 0 0,1 30,-14a24,20 0 0,1 38,8a20,16 0 0,1 22,6a24,18 0 0,1 -20,16h-80a18,14 0 0,1 10,-16z');
      p.setAttribute('class', isCloudy ? 'cloud dark' : 'cloud');
      p.setAttribute('opacity', c.op.toString());
      g.appendChild(p);
      cloudsGroup.appendChild(g);
    });
  }

  /* UV-Wege: von Sonne (120,80) zu Person (~610, 385) – als Polyline-Segmente */
  const SUN = {x:120, y:80};
  const OZONE_TOP = 160, OZONE_BOTTOM = 200;
  const HUMAN_TARGET = {x: 610, y: 385}; // nahe am Rumpf

  function buildUVPaths(count=6){
    uvPaths.innerHTML = '';
    // Hauptpfade
    for(let i=0;i<count;i++){
      const jitterX = (i-(count-1)/2)*14; // seitliche Streuung
      const jitterY = (i-(count-1)/2)*4;

      const mid1 = { // an Ozonoberkante
        x: SUN.x + (HUMAN_TARGET.x - SUN.x)*0.28 + jitterX*0.7,
        y: OZONE_TOP + jitterY
      };
      const mid2 = { // an Ozonunterkante
        x: SUN.x + (HUMAN_TARGET.x - SUN.x)*0.52 + jitterX*0.5,
        y: OZONE_BOTTOM + jitterY
      };

      // Drei Segmente: vor Ozon, im Ozon, danach zum Menschen
      const segA = pathFromPoints([SUN, mid1]);
      const segB = pathFromPoints([mid1, mid2]);
      const segC = pathFromPoints([mid2, HUMAN_TARGET]);

      const a = mkPath(segA, 'uvray');     // vor Ozon
      const b = mkPath(segB, 'uvray uvray-oz'); // im Ozon gedämpft
      const c = mkPath(segC, 'uvray');     // in Troposphäre bis Haut

      uvPaths.appendChild(a);
      uvPaths.appendChild(b);
      uvPaths.appendChild(c);
    }

    // Reflexionspfade (vom Boden zur Person)
    const reflectNeeded = (getSel(place) === 'berg' || getSel(place) === 'wasser');
    if (reflectNeeded){
      const baseY = 382;
      const srcX = getSel(place)==='berg' ? HUMAN_TARGET.x - 80 : HUMAN_TARGET.x - 40;
      for(let r=0;r<3;r++){
        const from = {x: srcX + r*18, y: baseY + r*2};
        const to   = {x: HUMAN_TARGET.x - 10 + r*6, y: HUMAN_TARGET.y - 12 - r*4};
        const p = mkPath(pathFromPoints([from,to]), 'uvray uvray-reflect');
        uvPaths.appendChild(p);
      }
    }
  }

  function pathFromPoints(pts){
    let d='M'+pts[0].x+','+pts[0].y;
    for(let i=1;i<pts.length;i++){ d += ' L'+pts[i].x+','+pts[i].y; }
    return d;
  }
  function mkPath(d, cls){
    const p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d', d);
    p.setAttribute('class', cls);
    return p;
  }

  /* Visuelle Stärken anwenden */
  function applyVisuals(uviEnv, uviSkin, fSky, fLoc, fProt){
    // UV-Intensität → Opazität & Breite
    const envRatio = Math.max(0, Math.min(1, uviEnv/12));
    const skinRatio= Math.max(0, Math.min(1, uviSkin/12));

    const uvOpacity = 0.35 + envRatio*0.55; // 0.35–0.90
    const uvWidth   = 2.4 + envRatio*1.6;   // 2.4–4.0
    const uvSpeedS  = (4.8 - envRatio*3.0).toFixed(2) + 's'; // 4.8s → 1.8s

    document.documentElement.style.setProperty('--uvOpacity', uvOpacity.toFixed(2));
    document.documentElement.style.setProperty('--uvWidth', uvWidth.toFixed(2));
    document.documentElement.style.setProperty('--uvSpeed', uvSpeedS);

    // Schutz-Aura-Opazität ~ 1 - Transmission
    const shieldOpacity = Math.min(0.85, Math.max(0, 1 - fProt));
    shield.setAttribute('style', 'opacity:'+shieldOpacity.toFixed(2));

    // Kinder-Badge
    childBadge.setAttribute('opacity', child.checked ? '1' : '0');

    // Ort-Assets
    const loc = getSel(place);
    waterRect.setAttribute('opacity', loc==='wasser' ? '1' : '0');
    mountain.setAttribute('opacity', loc==='berg' ? '1' : '0');

    // Auftreff-Indikator (zeigt uviSkin)
    const impactOpacity = Math.min(0.95, 0.15 + skinRatio*0.85);
    const impactR = 6 + skinRatio*8; // 6–14
    impact.setAttribute('opacity', impactOpacity.toFixed(2));
    impact.setAttribute('r', impactR.toFixed(1));

    // „Rötung“ der Haut (sanfte Tönung) aus Dosis → hier nur leicht nach Skin-UVI
    const tint = Math.min(.6, skinRatio*.6);
    const base = '#5b4a44';
    const red  = '#a33b3b';
    const mix  = mixColor(base, red, tint);
    document.querySelectorAll('.human-skin').forEach(el=> el.setAttribute('fill', mix));
  }

  function update(){
    markActives();

    // Wolken rendern
    renderClouds(getSel(sky));

    // Pfade neu aufbauen (damit Reflexionen je nach Ort passen)
    buildUVPaths(6);

    const { uviEnv, uviSkin, ttb, fSky, fLoc, fProt } = compute();

    // Zusammenfassung
    const risk = riskCategory(Math.max(0,uviEnv));
    riskBadge.textContent = 'RISIKO: ' + risk.label.toUpperCase();
    riskBadge.className = 'badge ' + risk.class;

    uviEffEl.textContent = Math.max(0,uviSkin).toFixed(1);
    ttbEl.textContent = (ttb===Infinity) ? '–' : (ttb<120 ? Math.round(ttb)+' min' : (ttb/60).toFixed(1)+' h');

    // Dauer/Dosis/Leiste
    const dur = Number(duration.value);
    durationVal.textContent = dur + ' min';
    const frac = (ttb===Infinity) ? 0 : (dur/ttb);
    const pct = Math.max(0, frac*100);
    doseText.textContent = 'Erreichte UV‑Dosis: ' + (pct>=1000 ? '>1000%' : Math.round(pct)+'%');

    // Balken-Füllung (0–180 min)
    barFill.style.width = Math.max(0, Math.min(100, (dur/180)*100)) + '%';
    if (ttb===Infinity) barMark.style.left = '100%';
    else barMark.style.left = (Math.max(0, Math.min(1, ttb/180))*100) + '%';

    // Visuelle Stärke (Pfade, Schild, Ort, Auftreff-Indikator)
    applyVisuals(uviEnv, uviSkin, fSky, fLoc, fProt);
  }

  // Events
  [ ...sun, ...sky, ...place, ...protect, ...skin ].forEach(inp=>{
    inp.addEventListener('change', update);
    inp.addEventListener('input', update, {passive:true});
  });
  child.addEventListener('change', update);
  duration.addEventListener('input', update, {passive:true});

  // Reset
  resetBtn.addEventListener('click', ()=>{
    sun.forEach(i=>i.checked = (i.value==='low'));
    sky.forEach(i=>i.checked = (i.value==='klar'));
    place.forEach(i=>i.checked = (i.value==='strand'));
    protect.forEach(i=>i.checked = (i.value==='none'));
    skin.forEach(i=>i.checked = (i.value==='verylight'));
    child.checked = false;
    duration.value = 30;
    update();
  });

  // Init
  update();
})();
</script>
</body>
</html>`;
