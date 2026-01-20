// ============================================================================
// UV PROTECTION COMPARISON – HIGH-END VISUAL SIMULATION
// Mineralischer vs. Chemischer Sonnenschutz
// ----------------------------------------------------------------------------
// Single-file Cloudflare Worker + HTML + Canvas Engine
// Fokus: visuelle, didaktische UND hochwertige Animation
// ----------------------------------------------------------------------------
// DISCLAIMER:
// - Qualitatives Modell (keine medizinische Beratung)
// - Physikalisch inspiriert, visuell realistisch
// ============================================================================

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
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mineralischer vs. Chemischer Sonnenschutz – UV Simulation</title>

<style>
/* ============================================================================
   DESIGN SYSTEM – HIGH-END SCIENCE VISUAL
   ============================================================================ */
:root{
  --bg:#070b18;
  --panel:#0e1633;
  --glass:rgba(255,255,255,.06);
  --border:rgba(255,255,255,.12);

  --text:#eef1ff;
  --muted:#9aa4d6;

  --uv:#7d00ff;
  --uv-soft:#d5c9ff;

  --mineral:#7dd3fc;
  --chemical:#f472b6;

  --danger:#fb7185;
  --safe:#2dd4bf;

  --radius:18px;
}

*{box-sizing:border-box}
html,body{margin:0;height:100%}

body{
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  background:
    radial-gradient(900px 500px at 20% 0%, rgba(120,160,255,.15), transparent 60%),
    linear-gradient(180deg, #0b1330, var(--bg));
  color:var(--text);
}

header{
  padding:26px 20px 16px;
  text-align:center;
}

header h1{
  margin:0 0 6px;
  font-size:clamp(26px,4vw,40px);
}

header p{margin:0;color:var(--muted)}

main{
  max-width:1400px;
  margin:0 auto;
  padding:20px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
}

@media(max-width:1000px){main{grid-template-columns:1fr}}

.card{
  background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(0,0,0,.25)), var(--panel);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:0 30px 80px rgba(0,0,0,.55);
  overflow:hidden;
}

.card h2{
  margin:0;
  padding:14px 18px;
  font-size:16px;
  border-bottom:1px solid rgba(255,255,255,.1);
}

.canvas-wrap{
  position:relative;
  height:420px;
}

canvas{
  width:100%;
  height:100%;
  display:block;
}

.legend{
  padding:14px 18px;
  font-size:14px;
  color:var(--muted);
}

.legend span{
  display:inline-flex;
  align-items:center;
  gap:8px;
  margin-right:18px;
}

.dot{width:10px;height:10px;border-radius:50%}

.footer{
  text-align:center;
  padding:18px;
  font-size:12px;
  color:var(--muted);
}
</style>
</head>

<body>
<header>
  <h1>UV-Schutz im Vergleich</h1>
  <p>Mineralischer vs. chemischer Sonnenschutz – visuelle Simulation</p>
</header>

<main>

<!-- MINERAL -->
<section class="card">
<h2>Mineralischer Sonnenschutz (Reflexion & Streuung)</h2>
<div class="canvas-wrap"><canvas id="mineral"></canvas></div>
<div class="legend">
  <span><i class="dot" style="background:var(--uv)"></i>UV-Photonen</span>
  <span><i class="dot" style="background:var(--mineral)"></i>Reflektierte Energie</span>
</div>
</section>

<!-- CHEMICAL -->
<section class="card">
<h2>Chemischer Sonnenschutz (Absorption & Umwandlung)</h2>
<div class="canvas-wrap"><canvas id="chemical"></canvas></div>
<div class="legend">
  <span><i class="dot" style="background:var(--uv)"></i>UV-Photonen</span>
  <span><i class="dot" style="background:var(--chemical)"></i>Absorbierte Energie</span>
</div>
</section>

</main>

<div class="footer">© 2026 · UV Protection Visual Simulation · Educational</div>

<script>
// ============================================================================
// CANVAS ENGINE – PHOTON BASED MODEL
// ============================================================================

class Photon{
  constructor(x,y,vy){
    this.x=x;this.y=y;this.vy=vy;
    this.life=1;
  }
  step(){this.y+=this.vy}
}

function setup(canvas,type){
  const ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const w=canvas.clientWidth*dpr;
  const h=canvas.clientHeight*dpr;
  canvas.width=w;canvas.height=h;

  const photons=[];

  function spawn(){
    if(photons.length<260)
      photons.push(new Photon(Math.random()*w,-20,1.2+Math.random()));
  }

  function drawSkin(){
    ctx.fillStyle='#5b4a44';
    ctx.fillRect(0,h-80,w,80);
  }

  function animate(){
    ctx.clearRect(0,0,w,h);

    // Atmosphere
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'rgba(120,160,255,.15)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.fillRect(0,0,w,h);

    drawSkin();

    spawn();

    for(let i=photons.length-1;i>=0;i--){
      const p=photons[i];
      p.step();

      // Interaction layer
      const interactionY=h-120;

      if(p.y>interactionY && p.life){
        if(type==='mineral'){
          // Reflect & scatter
          p.vy*=-0.6;
          p.x+= (Math.random()-.5)*18;
          p.life=0;
        }else{
          // Absorb & dissipate
          p.life=0;
        }
      }

      // Draw photon
      ctx.beginPath();
      ctx.arc(p.x,p.y,2.1,0,Math.PI*2);
      ctx.fillStyle='rgba(125,0,255,.8)';
      ctx.fill();

      // Secondary effect
      if(!p.life){
        ctx.beginPath();
        ctx.arc(p.x,p.y,10,0,Math.PI*2);
        ctx.fillStyle=type==='mineral'
          ?'rgba(125,211,252,.18)'
          :'rgba(244,114,182,.22)';
        ctx.fill();
        photons.splice(i,1);
      }

      if(p.y>h+30) photons.splice(i,1);
    }

    requestAnimationFrame(animate);
  }

  animate();
}

setup(document.getElementById('mineral'),'mineral');
setup(document.getElementById('chemical'),'chemical');
</script>
</body>
</html>
