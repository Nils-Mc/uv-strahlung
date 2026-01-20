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
<title>UV‑Simulator – Einfach & iPad‑freundlich</title>
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

  /* Scene (vereinfacht) */
  .scene{ width:100%; height:auto; display:block; background:linear-gradient(#78b7ff 0%, #c0e4ff 45%, #ffeec6 100%) }
  .layer-label{ font-size:10px; fill:#e6f0ff; opacity:.85 }
  .layer{ fill: rgba(35,67,130,.08) }
  .ozone{ fill: rgba(80,0,255,.10) }
  .beach{ fill:#f2d49b }
  .water{ fill:#86c5da }
  .human{ fill:#4d3f3b }
  .sun{ fill:#ffd24d; filter: drop-shadow(0 0 6px rgba(255,210,77,.8)); animation: pulse 2.6s ease-in-out infinite }
  .ray{ stroke:#ffd24d; stroke-width:2.5; stroke-linecap:round; opacity:.55 }
  @keyframes pulse{ 0%{opacity:.55} 50%{opacity:1} 100%{opacity:.55} }

  /* Controls minimal */
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

  /* Duration slider */
  .range-wrap{ display:flex; gap:10px; align-items:center }
  input[type="range"]{ -webkit-appearance:none; width:100%; height:44px; background:transparent; padding:10px 0 }
  input[type="range"]::-webkit-slider-runnable-track{ height:12px; background:#24385f; border-radius:999px; border:1px solid #2c4473 }
  input[type="range"]::-webkit-slider-thumb{
    -webkit-appearance:none; margin-top:-10px; width:28px; height:28px; background:var(--accent); border-radius:50%; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,.25)
  }

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

  /* Simple timeline bar */
  .bar{
    width:100%; height:16px; background:#223458; border:1px solid #28406e; border-radius:10px; position:relative; overflow:hidden;
  }
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
  <p>Wähle kurz die Situation – sieh sofort Risiko & Zeit bis Rötung.</p>
</header>

<main>
  <!-- Linke Seite: Szene, knapper -->
  <section class="card">
    <h2>Visualisierung</h2>
    <div class="content" style="padding:0">
      <svg id="scene" class="scene" viewBox="0 0 900 460" role="img" aria-label="Sonne, Atmosphäre, Mensch am Boden">
        <rect x="0" y="0" width="900" height="460" fill="url(#skygrad)"/>
        <defs>
          <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#78b7ff"/>
            <stop offset="45%" stop-color="#c0e4ff"/>
            <stop offset="100%" stop-color="#ffeec6"/>
          </linearGradient>
        </defs>

        <!-- Sonne -->
        <g transform="translate(120,80)">
          <circle class="sun" r="42" cx="0" cy="0"/>
          <g id="rays"></g>
        </g>

        <!-- Atmosphärenschichten (nur Labels) -->
        <g>
          <rect class="layer" x="0" y="160" width="900" height="40"></rect>
          <text class="layer-label" x="12" y="185">Stratosphäre (Ozon)</text>
          <rect class="layer" x="0" y="200" width="900" height="40"></rect>
          <text class="layer-label" x="12" y="225">Troposphäre</text>
        </g>

        <!-- Boden -->
        <g id="ground">
          <rect class="water" id="waterRect" x="0" y="360" width="900" height="100" opacity="0"/>
          <rect class="beach" x="0" y="360" width="900" height="100"/>
        </g>

        <!-- Mensch -->
        <g transform="translate(640, 320) scale(1.0)">
          <path class="human" id="humanBody"
            d="M-110,60 C-90,20 -40,5 10,10 C40,12 80,20 105,30
               L110,40 L-100,40 Z
               M80,15 a16,16 0 1,0 0.1,0"
            opacity="0.95"/>
        </g>
      </svg>
    </div>
  </section>

  <!-- Rechte Seite: Minimal-Steuerung + Ergebnis -->
  <section class="card">
    <h2>Dein Setup & Ergebnis</h2>
    <div class="content">
      <!-- Ergebnis (kompakt) -->
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
        <div class="hint">Vereinfacht: von bewölkt bis intensiver Hochsommer/Mittag.</div>
      </div>

      <!-- Himmel -->
      <div class="group">
        <div class="label">Himmel</div>
        <div class="chips" id="sky" role="radiogroup" aria-label="Himmel">
          <label class="chip active"><input type="radio" name="sky" value="klar" checked> <span class="seg-label">Klar</span></label>
          <label class="chip"><input type="radio" name="sky" value="leicht"> <span class="seg-label">Leicht bewölkt</span></label>
          <label class="chip"><input type="radio" name="sky" value="bewoelkt"> <span class="seg-label">Bewölkt</span></label>
        </div>
        <div class="hint">Wolken dämpfen UV – aber nie zu 100 %.</div>
      </div>

      <!-- Ort -->
      <div class="group">
        <div class="label">Ort</div>
        <div class="chips" id="place" role="radiogroup" aria-label="Ort">
          <label class="chip active"><input type="radio" name="place" value="strand" checked> <span class="seg-label">Strand</span></label>
          <label class="chip"><input type="radio" name="place" value="berg"> <span class="seg-label">Berg + Schnee</span></label>
          <label class="chip"><input type="radio" name="place" value="wasser"> <span class="seg-label">Im Wasser</span></label>
        </div>
        <div class="hint">Berge/Schnee verstärken (Höhe + Reflexion). Wasser dämpft im Körper, spiegelt an der Oberfläche.</div>
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
        <div class="hint">SPF/UPF ≈ wie viel an die Haut durchkommt (vereinfacht 1/SPF).</div>
      </div>

      <!-- Haut-Empfindlichkeit + Kinder -->
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

      <!-- Dauer + Timeline -->
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

      <!-- Erklärung -->
      <details style="margin-top:8px">
        <summary style="cursor:pointer"><strong>Hilfe & Erklärungen</strong></summary>
        <div class="hint" style="margin-top:8px">
          <p><strong>Sonnenstärke</strong>: 5 Stufen von „Niedrig“ bis „Extrem“. Intern wird ein UV‑Index verwendet (z. B. „Hoch“ ≈ UVI 6–7).</p>
          <p><strong>Himmel</strong>: Wolken mindern UV (stark bewölkt dämpft deutlich, aber nicht vollständig).</p>
          <p><strong>Ort</strong>: In Bergen steigt UV (Höhe), Schnee reflektiert zusätzlich. Im Wasser wird UV im Körper gedämpft, aber es reflektiert an der Oberfläche.</p>
          <p><strong>Schutz</strong>: SPF/UPF gibt an, wie viel UV die Haut erreicht (vereinfacht 1/SPF). Regelmäßig nachcremen.</p>
          <p><strong>Haut/Kinder</strong>: Sehr helle Haut und Kinderhaut reagieren schneller. Die Zeiten sind didaktische Näherungswerte und ersetzen keine medizinische Beratung.</p>
        </div>
      </details>

      <div style="margin-top:12px; display:flex; gap:10px; justify-content:space-between; flex-wrap:wrap; align-items:center">
        <span class="hint">Didaktisches Modell – individuelle Reaktion kann abweichen.</span>
        <button id="resetBtn">Zurücksetzen</button>
      </div>
    </div>
  </section>
</main>

<div class="footer">© 2026 UV‑Simulator · Lernzwecke · Faktoren sind heuristisch (Wolken/Ort/Schutz/Haut/Kinder).</div>

<script>
(function(){
  // Sonnenstrahlen erzeugen
  const raysGroup = document.getElementById('rays');
  for(let i=0;i<22;i++){
    const a = (Math.PI*2)*(i/22);
    const x1 = Math.cos(a)*62, y1 = Math.sin(a)*62;
    const x2 = Math.cos(a)*112, y2 = Math.sin(a)*112;
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1); l.setAttribute('y1',y1);
    l.setAttribute('x2',x2); l.setAttribute('y2',y2);
    l.setAttribute('class','ray');
    raysGroup.appendChild(l);
  }

  // Elements
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
  const waterRect = document.getElementById('waterRect');
  const humanBody = document.getElementById('humanBody');
  const resetBtn = document.getElementById('resetBtn');

  // Aktiv-Optik
  function markActives(){
    document.querySelectorAll('label.chip').forEach(l=>l.classList.remove('active'));
    [sun, sky, place, protect, skin].flat().forEach(inp=>{
      if (inp.checked) inp.closest('label.chip')?.classList.add('active');
    });
  }

  // Mapping (vereinfachte Stufen)
  function mapSun(val){
    // Niedrig, Moderat, Hoch, Sehr hoch, Extrem → typische UVI-Mitten
    return {low:2, mod:4, high:6.5, vhigh:9, ext:11.5}[val] ?? 4;
  }
  function mapSky(val){
    // Klar (0%), Leicht (40%), Bewölkt (80%) → Wolkenfaktor
    const pct = {klar:0, leicht:40, bewoelkt:80}[val] ?? 0;
    let f = 1 - 0.8*(pct/100); // bis ~80% Dämpfung
    return Math.max(0.2, Math.min(1.1, f));
  }
  function mapPlace(val){
    return {strand:1.0, berg:1.6, wasser:0.7}[val] ?? 1.0;
  }
  function mapProtect(val){
    return {none:1.0, spf30:(1/30), spf50:(1/50), upf50:(1/50)}[val] ?? 1.0;
  }
  function baseT10(skinVal){ // Basiszeit bis Rötung bei UVI=10 (min)
    return { verylight:15, light:25, medium:40, dark:80 }[skinVal] ?? 25;
  }
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

  function getSel(arr){ const r=arr.find(i=>i.checked); return r ? r.value : null }

  function compute(){
    const sunVal = mapSun(getSel(sun));
    const fSky   = mapSky(getSel(sky));
    const fLoc   = mapPlace(getSel(place));
    const fProt  = mapProtect(getSel(protect));
    const skinVal= getSel(skin);
    const isChild= child.checked;

    const uviEnv = sunVal * fSky * fLoc;
    const uviSkin= uviEnv * fProt;

    // Zeit bis Rötung (didaktisch)
    let t10 = baseT10(skinVal);
    if (isChild) t10 *= 0.7;
    const ttb = (uviSkin<=0.01) ? Infinity : t10 * (10 / uviSkin);

    return { uviEnv, uviSkin, ttb };
  }

  function update(){
    markActives();

    // Wasser-Hintergrund
    const loc = getSel(place);
    waterRect.setAttribute('opacity', loc==='wasser' ? '1' : '0');

    const { uviEnv, uviSkin, ttb } = compute();

    // Anzeigen
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

    // Balken füllen (0–180 min Skala)
    const fillPct = Math.max(0, Math.min(100, (dur/180)*100));
    barFill.style.width = fillPct + '%';

    // Schwellen-Marker platzieren
    let markLeft;
    if (ttb===Infinity) markLeft = '100%';
    else{
      const rel = Math.max(0, Math.min(1, ttb/180));
      markLeft = (rel*100) + '%';
    }
    barMark.style.left = markLeft;

    // Visuelle „Rötung“
    const redness = (ttb===Infinity) ? 0 : Math.max(0, Math.min(0.8, frac*0.8));
    humanBody.setAttribute('fill', mixColor('#4d3f3b', '#a33b3b', redness));
  }

  // Events
  [ ...sun, ...sky, ...place, ...protect, ...skin ].forEach(inp=>{
    inp.addEventListener('change', update);
    inp.addEventListener('input', update, {passive:true});
  });
  child.addEventListener('change', update);
  duration.addEventListener('input', update, {passive:true});

  // Reset
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    // Sonnenstärke
    sun.forEach(i=>i.checked = (i.value==='low'));
    // Himmel
    sky.forEach(i=>i.checked = (i.value==='klar'));
    // Ort
    place.forEach(i=>i.checked = (i.value==='strand'));
    // Schutz
    protect.forEach(i=>i.checked = (i.value==='none'));
    // Haut
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
