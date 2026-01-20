// UV-Simulator – High-End Präsentation
const app = document.getElementById('app');
app.innerHTML = `
<section>
  <h2>Mineralischer Sonnenschutz</h2>
  <canvas id="mineralCanvas" width="400" height="300"></canvas>
</section>
<section>
  <h2>Chemischer Sonnenschutz</h2>
  <canvas id="chemicalCanvas" width="400" height="300"></canvas>
</section>
<footer>© 2026 UV-Simulator · Demo für Präsentation</footer>
`;

class Photon {
  constructor(x, y, vy, color) {
    this.x = x; this.y = y; this.vy = vy; this.color = color;
    this.bounced = false;
  }
  update(height) {
    this.y += this.vy;
    if(this.y > height-50 && !this.bounced) {
      if(this.color==='mineral') { this.vy*=-0.6; this.x+= (Math.random()-0.5)*10; this.bounced=true; }
      else if(this.color==='chemical') this.bounced=true;
    }
  }
}

function simulate(canvasId, type) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const photons = [];
  const width = canvas.width;
  const height = canvas.height;

  function spawn() {
    if(photons.length<120) photons.push(new Photon(Math.random()*width,0,1+Math.random()*2,type));
  }

  function drawSun() {
    ctx.beginPath();
    ctx.arc(50,50,25,0,Math.PI*2);
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 30;
    ctx.fill();
  }

  function drawPhoton(p) {
    ctx.beginPath();
    ctx.arc(p.x,p.y,3,0,Math.PI*2);
    ctx.fillStyle = type==='mineral' ? 'rgba(255,255,255,0.9)' : 'rgba(124,58,237,0.9)';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 6;
    ctx.fill();

    if(p.bounced && type==='mineral') {
      ctx.beginPath();
      ctx.arc(p.x,p.y,6,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.2)';
      ctx.fill();
    }
  }

  function animate() {
    // Hintergrund
    const bg = ctx.createLinearGradient(0,0,0,height);
    bg.addColorStop(0,'#60a5fa'); bg.addColorStop(1,'#1e3a8a');
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);

    drawSun();
    spawn();

    photons.forEach((p,i)=>{
      p.update(height);
      drawPhoton(p);
      if(p.y>height+10) photons.splice(i,1);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

simulate('mineralCanvas','mineral');
simulate('chemicalCanvas','chemical');
