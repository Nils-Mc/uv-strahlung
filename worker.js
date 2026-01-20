export default {
  async fetch() {
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
<meta name="theme-color" content="#0b1020">
<title>UV-Simulator · Scientific</title>

<style>
:root{
  --bg:#0b1020;
  --panel:#111830;
  --text:#eef2ff;
  --muted:#aab4da;

  --accent:#7aa2ff;
  --danger:#fb7185;

  --uvOpacity:.65;
  --uvWidth:2.6;
  --uvSpeed:4.5s;
}

*{box-sizing:border-box}
html,body{height:100%}

body{
  margin:0;
  font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial;
  background:
    radial-gradient(1200px 500px at 15% 0%, rgba(255,255,255,.08), transparent 60%),
    var(--bg);
  color:var(--text);
}

header{
  padding:20px;
  text-align:center;
}

main{
  max-width:1100px;
  margin:0 auto;
  padding:16px;
  display:grid;
  grid-template-columns:1.1fr 1fr;
  gap:16px;
}
@media(max-width:900px){
  main{grid-template-columns:1fr}
}

.card{
  background:
    linear-gradient(180deg, rgba(255,255,255,.04), rgba(0,0,0,.15)),
    var(--panel);
  border:1px solid rgba(255,255,255,.12);
  border-radius:18px;
  box-shadow:0 20px 60px rgba(0,0,0,.5);
  overflow:hidden;
}

.card h2{
  margin:0;
  padding:12px 16px;
  font-size:16px;
  border-bottom:1px solid rgba(255,255,255,.08);
}

.content{padding:14px}

/* Szene */
.scene{
  width:100%;
  height:auto;
  display:block;
  background:
    radial-gradient(900px 320px at 15% 10%, rgba(255,255,255,.45), transparent 60%),
    linear-gradient(#7db8ff 0%, #bfe6ff 42%, #fff0c8 100%);
}

/* UV */
.uvray{
  fill:none;
  stroke:url(#uvGrad);
  stroke-width:var(--uvWidth);
  stroke-linecap:round;
  stroke-dasharray:6 18;
  animation:
    uvFlow var(--uvSpeed) linear infinite,
    uvFlicker 1.8s ease-in-out infinite;
  opacity:var(--uvOpacity);
}
.uvray-oz{
  opacity:calc(var(--uvOpacity) * .45);
  filter:blur(.4px);
}
.uvray-reflect{
  opacity:.35;
}

@keyframes uvFlow{
  to{stroke-dashoffset:-320}
}
@keyframes uvFlicker{
  0%,100%{opacity:var(--uvOpacity)}
  50%{opacity:calc(var(--uvOpacity)*.75)}
}

/* Schutz */
.shield{
  fill:url(#shieldGrad);
  filter:
    drop-shadow(0 0 16px rgba(122,162,255,.6))
    blur(.6px);
  transition:opacity .25s ease;
}

/* Controls */
.group{margin-bottom:12px}
.label{font-weight:700;display:block;margin-bottom:6px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{
  background:#0e1530;
  border:1px solid rgba(255,255,255,.15);
  padding:10px 14px;
  border-radius:999px;
  cursor:pointer;
}
.chip input{display:none}
.chip.active{
  border-color:var(--accent);
  box-shadow:0 0 0 2px rgba(122,162,255,.25);
}

/* Summary */
.summary{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  align-items:center;
  background:#0b1326;
  padding:10px 12px;
  border-radius:12px;
  margin-bottom:12px;
}
.badge{
  padding:6px 12px;
  border-radius:999px;
  font-weight:800;
  background:#2a1c28;
  color:#ffb3cf;
}
.kpi{font-size:24px;font-weight:800}
</style>
</head>

<body>
<header>
  <h1>UV-Simulator</h1>
  <p style="color:var(--muted)">Didaktisches, visuelles UV-Modell</p>
</header>

<main>
<section class="card">
  <h2>Visualisierung</h2>
  <svg id="scene" class="scene" viewBox="0 0 900 480">
    <defs>
      <linearGradient id="uvGrad">
        <stop offset="0%" stop-color="#c7b5ff"/>
        <stop offset="100%" stop-color="#7d00ff"/>
      </linearGradient>
      <radialGradient id="shieldGrad">
        <stop offset="0%" stop-color="#7aa2ff" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#7aa2ff" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Sonne -->
    <circle cx="120" cy="80" r="42" fill="#ffd24d"/>

    <!-- Atmosphäre -->
    <rect x="0" y="150" width="900" height="40" fill="rgba(130,0,255,.12)"/>
    <rect x="0" y="190" width="900" height="40" fill="rgba(40,80,160,.1)"/>

    <!-- UV -->
    <g id="uvPaths"></g>

    <!-- Boden -->
    <rect x="0" y="360" width="900" height="120" fill="#e9d3a4"/>

    <!-- Mensch -->
    <g transform="translate(620,320)">
      <circle cx="120" cy="18" r="11" fill="#5b4a44" class="skin"/>
      <path d="M55,40 Q92,25 120,30 Q148,33 176,44 L180,54 L55,54 Z"
            fill="#5b4a44" class="skin"/>
      <ellipse class="shield" cx="-5" cy="52" rx="150" ry="58" opacity="0"/>
    </g>
  </svg>
</section>

<section class="card">
  <h2>Setup & Ergebnis</h2>
  <div class="content">
    <div class="summary">
      <span class="badge" id="risk">RISIKO</span>
      <span class="kpi" id="ttb">–</span>
      <span>bis Rötung</span>
    </div>

    <div class="group">
      <span class="label">Sonnenstärke</span>
      <div class="chips" id="sun">
        <label class="chip active"><input type="radio" name="sun" value="low" checked> Niedrig</label>
        <label class="chip"><input type="radio" name="sun" value="high"> Hoch</label>
        <label class="chip"><input type="radio" name="sun" value="ext"> Extrem</label>
      </div>
    </div>
  </div>
</section>
</main>

<script>
const uvPaths = document.getElementById('uvPaths');
const ORIGINAL_SKIN = '#5b4a44';
const SUN = {x:120,y:80};
const TARGET = {x:610,y:375};

function buildUV(){
  uvPaths.innerHTML='';
  for(let i=0;i<9;i++){
    const jitter = ()=>(Math.random()-.5)*12;
    const p1={x:SUN.x+jitter(),y:SUN.y};
    const p2={x:TARGET.x*(.35)+jitter(),y:160};
    const p3={x:TARGET.x*(.6)+jitter(),y:200};
    const p4={x:TARGET.x+jitter(),y:TARGET.y};

    add([p1,p2],'uvray');
    add([p2,p3],'uvray uvray-oz');
    add([p3,p4],'uvray');
  }
}

function add(pts,cls){
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d','M'+pts.map(p=>p.x+','+p.y).join(' L '));
  p.setAttribute('class',cls);
  uvPaths.appendChild(p);
}

buildUV();
</script>
</body>
</html>`;
