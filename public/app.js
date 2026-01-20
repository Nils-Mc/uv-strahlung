
(() => {
  'use strict';

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * DPR);
    canvas.height = Math.floor(rect.height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const selSun = document.getElementById('sunStrength');
  const selProt = document.getElementById('protection');
  const rngDuration = document.getElementById('duration');
  const lblDuration = document.getElementById('durationValue');
  const lblDose = document.getElementById('doseValue');
  const lblSkin = document.getElementById('skinStatus');

  selSun.value = 'moderate';
  selProt.value = 'mineral';

  const SUN_STRENGTH = {
    low: { uvi: 2, cloudAtten: 0.05 },
    moderate: { uvi: 5, cloudAtten: 0.12 },
    high: { uvi: 7, cloudAtten: 0.18 },
    veryhigh: { uvi: 9, cloudAtten: 0.22 },
    extreme: { uvi: 11, cloudAtten: 0.28 },
  };

  // Nur zwei Schutzarten
  const PROTECTION = {
    mineral: { transmission: 0.05, kind: 'mineral' }, // sichtbar + reflektiert
    chemical: { transmission: 0.03, kind: 'chemical' } // unsichtbar + absorbiert
  };

  const state = {
    time: 0,
    dayPhase: 0,
    sun: { x: 0, y: 0, r: 60 },
    clouds: [],
    particles: [],
    particlePool: [],
    maxParticles: 500,
    waterPhase: 0,
    mountain: { baseY: 0 },
    person: {
      x: 0, y: 0, width: 68, height: 160, aura: 30,
      skinBase: { r: 233, g: 189, b: 164 }, redness: 0
    },
    dose: 0,
    env: { water: 0.12, snow: 0.55 },
    uvaRatio: 0.8,
    paused: false,
    skinEffects: [] // {x,y,type,age,life}
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixColor(c1, c2, t) { return { r: Math.round(lerp(c1.r, c2.r, t)), g: Math.round(lerp(c1.g, c2.g, t)), b: Math.round(lerp(c1.b, c2.b, t)) }; }
  function rand(a=0,b=1){ return a + Math.random()*(b-a); }
  function angleBetween(ax,ay,bx,by){ return Math.atan2(by-ay, bx-ax); }

  function spawnParticle(){ let p = state.particlePool.pop(); if(!p) p={}; state.particles.push(p); return p; }
  function recycleParticle(i){ const p=state.particles[i]; const last=state.particles.pop(); if(i<state.particles.length) state.particles[i]=last; state.particlePool.push(p); }

  function updateSunPosition(dt){
    state.dayPhase = (state.dayPhase + dt / 30) % 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const margin = 40; const x=lerp(margin, w-margin, state.dayPhase);
    const y = lerp(h*0.8, h*0.2, Math.sin(state.dayPhase*Math.PI));
    state.sun.x=x; state.sun.y=y; state.sun.r=Math.max(40, Math.min(80, h*0.07));
  }

  function drawSky(){
    const w=canvas.clientWidth, h=canvas.clientHeight;
    const grd=ctx.createLinearGradient(0,0,0,h);
    const elev = 1 - clamp(state.sun.y/h,0,1);
    const skyTop = `rgba(${Math.round(lerp(16,60,elev))}, ${Math.round(lerp(32,120,elev))}, ${Math.round(lerp(58,200,elev))}, 1)`;
    const skyBottom = `rgba(${Math.round(lerp(10,12,elev))}, ${Math.round(lerp(14,20,elev))}, ${Math.round(lerp(20,30,elev))}, 1)`;
    grd.addColorStop(0, skyTop); grd.addColorStop(1, skyBottom);
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
  }

  function drawSunAndRays(){
    const {x,y,r}=state.sun;
    const glow=ctx.createRadialGradient(x,y,r*0.2,x,y,r*2.2);
    glow.addColorStop(0,'rgba(255,219,112,0.95)'); glow.addColorStop(0.3,'rgba(255,219,112,0.65)'); glow.addColorStop(1,'rgba(255,219,112,0)');
    ctx.globalCompositeOperation='lighter'; ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x,y,r*2.2,0,Math.PI*2); ctx.fill();
    const core=ctx.createRadialGradient(x,y,r*0.2,x,y,r); core.addColorStop(0,'#fff4cf'); core.addColorStop(1,'#ffd36c');
    ctx.globalCompositeOperation='source-over'; ctx.fillStyle=core; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    const rayCount=24; const baseAng=state.time*0.15;
    for(let i=0;i<rayCount;i++){
      const a=baseAng + (i/rayCount)*Math.PI*2; const len=r*lerp(2.8,3.6, Math.sin(i*4+state.time*0.6)*0.5+0.5);
      const w=lerp(2,5, (Math.sin(i*3+state.time*0.9)*0.5+0.5));
      const x2=x+Math.cos(a)*len, y2=y+Math.sin(a)*len; const grad=ctx.createLinearGradient(x,y,x2,y2);
      grad.addColorStop(0,'rgba(255,231,140,0.35)'); grad.addColorStop(1,'rgba(255,231,140,0)');
      ctx.strokeStyle=grad; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke();
    }
  }

  class Cloud{ constructor(x,y,scale,speed){ this.x=x; this.y=y; this.scale=scale; this.speed=speed; this.puffs=Array.from({length:5+Math.floor(scale*3)},()=>({ox:rand(-40,40)*scale, oy:rand(-10,12)*scale, r:rand(16,28)*scale})); }
    update(dt,w){ this.x+=this.speed*dt; if(this.x>w+120) this.x=-120; }
    draw(ctx){ ctx.save(); ctx.globalAlpha=0.65; ctx.fillStyle='rgba(230,240,255,0.9)'; ctx.beginPath(); for(const p of this.puffs){ ctx.moveTo(this.x+p.ox, this.y+p.oy); ctx.arc(this.x+p.ox, this.y+p.oy, p.r, 0, Math.PI*2);} ctx.fill(); ctx.globalAlpha=0.25; ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.beginPath(); for(const p of this.puffs){ ctx.moveTo(this.x+p.ox+4, this.y+p.oy+6); ctx.arc(this.x+p.ox+4, this.y+p.oy+6, p.r, 0, Math.PI*2);} ctx.fill(); ctx.restore(); }
  }

  function initClouds(){ const w=canvas.clientWidth,h=canvas.clientHeight; state.clouds=[ new Cloud(rand(0,w*0.6), rand(h*0.08,h*0.26), rand(0.9,1.3), rand(8,16)), new Cloud(rand(0,w*0.9), rand(h*0.15,h*0.35), rand(0.6,1.0), rand(10,18)), new Cloud(rand(0,w*0.7), rand(h*0.28,h*0.42), rand(0.5,0.8), rand(12,22)), ]; }

  function computeCloudAttenuation(){ const sel=SUN_STRENGTH[selSun.value]||SUN_STRENGTH.moderate; let extra=0; for(const c of state.clouds){ const dx=Math.abs(c.x-state.sun.x); const dy=Math.abs(c.y-state.sun.y); if(dx<120 && dy<60) extra+=0.15; } return clamp(sel.cloudAtten+extra,0,0.7); }

  function initTerrain(){ const h=canvas.clientHeight; state.mountain.baseY=Math.floor(h*0.62); }

  function drawWater(dt){ const w=canvas.clientWidth,h=canvas.clientHeight; const waterY=Math.floor(h*0.78); state.waterPhase+=dt*0.6; const grd=ctx.createLinearGradient(0,waterY,0,h); grd.addColorStop(0,'rgba(60,110,160,0.75)'); grd.addColorStop(1,'rgba(20,45,70,0.9)'); ctx.fillStyle=grd; ctx.beginPath(); ctx.moveTo(0,waterY); for(let x=0;x<=w;x+=8){ const y=waterY + Math.sin((x*0.02)+state.waterPhase)*3 + Math.sin((x*0.05)-state.waterPhase*1.6)*2; ctx.lineTo(x,y);} ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fill(); const bandY = waterY - 4 + Math.sin(state.waterPhase*0.7)*2; const grad=ctx.createLinearGradient(0,bandY-8,0,bandY+18); grad.addColorStop(0,'rgba(255,255,255,0)'); grad.addColorStop(0.5,'rgba(255,255,255,0.25)'); grad.addColorStop(1,'rgba(255,255,255,0)'); ctx.globalCompositeOperation='screen'; ctx.fillStyle=grad; ctx.fillRect(state.sun.x-120, bandY-8, 240, 26); ctx.globalCompositeOperation='source-over'; }

  function drawMountainAndSnow(){ const w=canvas.clientWidth,h=canvas.clientHeight; const baseY=state.mountain.baseY; ctx.fillStyle='rgba(30,35,50,1)'; ctx.beginPath(); ctx.moveTo(0, baseY+40); ctx.lineTo(w*0.18, baseY-30); ctx.lineTo(w*0.32, baseY+20); ctx.lineTo(w*0.48, baseY-40); ctx.lineTo(w*0.66, baseY+30); ctx.lineTo(w*0.82, baseY-10); ctx.lineTo(w, baseY+50); ctx.lineTo(w, h); ctx.lineTo(0,h); ctx.closePath(); ctx.fill(); const mx=w*0.82; const my=baseY-20; const peak={x:mx,y:my-140}; ctx.fillStyle='rgba(48,56,78,1)'; ctx.beginPath(); ctx.moveTo(mx-160,my+80); ctx.lineTo(peak.x, peak.y); ctx.lineTo(mx+140,my+80); ctx.lineTo(mx-160,my+80); ctx.closePath(); ctx.fill(); const snowGrad=ctx.createLinearGradient(peak.x, peak.y, peak.x, my+80); snowGrad.addColorStop(0,'rgba(255,255,255,0.95)'); snowGrad.addColorStop(1,'rgba(220,235,255,0.3)'); ctx.fillStyle=snowGrad; ctx.beginPath(); ctx.moveTo(mx-40,my+10); ctx.lineTo(peak.x,peak.y); ctx.lineTo(mx+20,my+18); ctx.lineTo(mx-40,my+10); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.moveTo(mx+10,my+20); ctx.lineTo(mx+50,my+50); ctx.lineTo(mx+20,my+80); ctx.closePath(); ctx.fill(); }

  function personBounds(){ const w=canvas.clientWidth,h=canvas.clientHeight; const px=Math.floor(w*0.28); const py=Math.floor(h*0.74); state.person.x=px; state.person.y=py; return {x:px,y:py,w:state.person.width,h:state.person.height}; }

  function pointInSkin(x,y){ // simple hit test for head & arms
    const p=personBounds(); const head={cx:p.x, cy:p.y - p.h + 16, r:20};
    const inHead = Math.hypot(x-head.cx, y-head.cy) <= head.r;
    const armL = (x>=p.x-36 && x<=p.x-28 && y>=p.y-p.h+40 && y<=p.y-p.h+84);
    const armR = (x>=p.x+28 && x<=p.x+36 && y>=p.y-p.h+40 && y<=p.y-p.h+84);
    return inHead || armL || armR;
  }

  function emitSkinEffect(type, x, y){ state.skinEffects.push({ type, x, y, age:0, life: type==='ABSORB'?0.5:0.35 }); }

  function skinClipPath(p){ // clip to head & arms
    ctx.beginPath();
    // head
    ctx.arc(p.x, p.y - p.h + 16, 20, 0, Math.PI*2);
    // arms rectangles
    ctx.rect(p.x-36, p.y-p.h+40, 8, 44);
    ctx.rect(p.x+28, p.y-p.h+40, 8, 44);
  }

  function drawPerson(){
    const p = personBounds();
    const base = state.person.skinBase;
    const red = mixColor(base, {r:255,g:110,b:90}, clamp(state.person.redness,0,1));
    const skinColor = `rgb(${red.r}, ${red.g}, ${red.b})`;

    // Aura
    const prot = PROTECTION[selProt.value];
    const auraR = Math.max(p.w, p.h)*0.85 + state.person.aura;
    ctx.save();
    if (prot.kind==='mineral'){
      const g = ctx.createRadialGradient(p.x, p.y - p.h*0.5, auraR*0.7, p.x, p.y - p.h*0.5, auraR);
      g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(0.8,'rgba(255,255,255,0.25)'); g.addColorStop(1,'rgba(255,255,255,0.85)');
      ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2; ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.h*0.5, auraR, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else { // chemical
      const g = ctx.createRadialGradient(p.x, p.y - p.h*0.5, auraR*0.2, p.x, p.y - p.h*0.5, auraR*1.05);
      g.addColorStop(0,'rgba(87,255,199,0.22)'); g.addColorStop(1,'rgba(87,255,199,0.04)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x, p.y - p.h*0.5, auraR, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // Body base
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.fillStyle = '#293041'; ctx.fillRect(-20, -10, 16, 60); ctx.fillRect(4, -10, 16, 60);
    const shirtGrad=ctx.createLinearGradient(0,-p.h+40,0,-10); shirtGrad.addColorStop(0,'#2e3a58'); shirtGrad.addColorStop(1,'#1f2740');
    ctx.fillStyle=shirtGrad; ctx.fillRect(-28, -p.h+40, 56, 80);
    ctx.restore();

    // --- Skin (head + arms) with clip for effects ---
    ctx.save();
    // base skin shapes
    ctx.fillStyle = skinColor;
    // head
    ctx.beginPath(); ctx.arc(p.x, p.y - p.h + 16, 20, 0, Math.PI*2); ctx.fill();
    // arms
    ctx.fillRect(p.x-36, p.y-p.h+40, 8, 44);
    ctx.fillRect(p.x+28, p.y-p.h+40, 8, 44);

    // facial hints
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.arc(p.x-6, p.y - p.h + 12, 2.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x+6, p.y - p.h + 12, 2.2, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(p.x-6, p.y - p.h + 24, 12, 2);

    // --- Emphasize skin difference ---
    ctx.save();
    // Clip to skin shapes for in-skin visuals
    ctx.beginPath(); skinClipPath(p); ctx.clip();

    if (prot.kind==='mineral'){
      // visible white mineral film – animated sheen
      const t = state.time; // simple shimmer
      const grad = ctx.createLinearGradient(0, p.y - p.h, 0, p.y);
      grad.addColorStop(0, `rgba(255,255,255,${0.16 + 0.06*Math.sin(t*2)})`);
      grad.addColorStop(1, `rgba(255,255,255,${0.10 + 0.04*Math.cos(t*1.6)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(p.x-80, p.y-p.h-10, 160, 120);

      // micro sparkle (mineral particles glint)
      for (let i=0;i<6;i++){
        const sx = p.x + Math.sin(state.time*2 + i*1.3)*14 + (i%2?8:-8);
        const sy = (p.y - p.h + 16) + Math.cos(state.time*3 + i)*6 + (i<3? -8: 18);
        ctx.globalCompositeOperation='screen';
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
        g.addColorStop(0,'rgba(255,255,255,0.75)'); g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';
    } else {
      // chemical: under-skin absorption glow based on recent events and dose
      const baseGlow = Math.min(0.25, state.dose*0.06);
      const grad = ctx.createRadialGradient(p.x, p.y - p.h + 16, 6, p.x, p.y - p.h + 16, 40);
      grad.addColorStop(0, `rgba(87,255,199,${0.18 + baseGlow})`);
      grad.addColorStop(1, 'rgba(87,255,199,0)');
      ctx.fillStyle=grad; ctx.fillRect(p.x-80, p.y-p.h-10, 160, 120);
    }

    // draw transient skin effects (from particle interactions)
    for (let i=state.skinEffects.length-1; i>=0; i--){
      const e = state.skinEffects[i];
      const lifeT = e.age / e.life;
      let alpha = 1 - lifeT;
      if (e.type==='ABSORB'){
        // teal expanding ring
        const r = lerp(2, 14, lifeT);
        ctx.strokeStyle = `rgba(87,255,199,${0.5*alpha})`;
        ctx.lineWidth = lerp(2, 0.5, lifeT);
        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI*2); ctx.stroke();
        // core glow
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 10);
        g.addColorStop(0, `rgba(87,255,199,${0.28*alpha})`);
        g.addColorStop(1, 'rgba(87,255,199,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(e.x, e.y, 10, 0, Math.PI*2); ctx.fill();
      } else if (e.type==='REFLECT'){
        // white spark streak
        ctx.strokeStyle = `rgba(255,255,255,${0.7*alpha})`;
        ctx.lineWidth = 1.5;
        const len = lerp(8, 2, lifeT);
        ctx.beginPath(); ctx.moveTo(e.x-len, e.y); ctx.lineTo(e.x+len, e.y); ctx.stroke();
      }
      e.age += Math.min(0.033, 0.016 + 0.017*Math.random());
      if (e.age >= e.life) state.skinEffects.splice(i,1);
    }

    ctx.restore(); // end clip

    // Shorts & shadow (top of skin visuals)
    ctx.save(); ctx.translate(p.x, p.y); ctx.fillStyle='#20273a'; ctx.fillRect(-28, -p.h+120, 56, 30);
    ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(0, 12, 48, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }

  function emitUVParticles(dt){
    const desiredPerSec=140; const strength=SUN_STRENGTH[selSun.value]||SUN_STRENGTH.moderate;
    const cloudK = 1 - computeCloudAttenuation();
    const elev = 1 - clamp(state.sun.y / canvas.clientHeight, 0, 1);
    const emission = desiredPerSec * (strength.uvi/5) * lerp(0.5, 1.2, elev) * cloudK;
    const reflExtra = emission * (0.15*state.env.water + 0.35*state.env.snow*elev);
    let toSpawn = Math.min((emission+reflExtra)*dt, 650*dt);

    for(let i=0;i<toSpawn;i++){
      if (state.particles.length >= state.maxParticles) break;
      const fromReflection = Math.random() < (reflExtra/(emission+reflExtra));
      const p = spawnParticle(); const tUVA = Math.random() < state.uvaRatio;
      p.type = tUVA ? 'UVA' : 'UVB'; p.size = tUVA ? rand(1.4,2.2) : rand(1.6,2.6);
      p.alpha=0; p.life=rand(1.6,3.2); p.age=0; p.absorbed=false; p.reflected=false;
      const person=personBounds(); const target={x:person.x, y:person.y - person.h*0.5};
      if (!fromReflection){ const spawnR=14+Math.random()*22; const a=Math.random()*Math.PI*2; p.x=state.sun.x+Math.cos(a)*spawnR; p.y=state.sun.y+Math.sin(a)*spawnR; const ang=angleBetween(p.x,p.y,target.x,target.y)+rand(-0.2,0.2); const speed=rand(60,140)*lerp(0.8,1.2,Math.random()); p.vx=Math.cos(ang)*speed; p.vy=Math.sin(ang)*speed; }
      else { const waterY=Math.floor(canvas.clientHeight*0.78); const pickSnow=Math.random()<0.6; if(pickSnow){ p.x=canvas.clientWidth*rand(0.72,0.92); p.y=state.mountain.baseY - rand(30,120);} else { p.x=state.sun.x+rand(-80,80); p.y=waterY+rand(-4,16);} const ang=angleBetween(p.x,p.y,target.x+rand(-20,20),target.y+rand(-10,10)); const speed=rand(70,120); p.vx=Math.cos(ang)*speed; p.vy=Math.sin(ang)*speed; }
    }
  }

  function updateParticles(dt){
    const prot = PROTECTION[selProt.value] || PROTECTION.mineral;
    const person=personBounds(); const center={x:person.x, y:person.y - person.h*0.5};
    const aura = Math.max(person.w, person.h)*0.85 + state.person.aura;

    for(let i=state.particles.length-1;i>=0;i--){
      const p=state.particles[i]; p.age+=dt; if(p.age>=p.life){ recycleParticle(i); continue; }
      p.x+=p.vx*dt; p.y+=p.vy*dt; const t=p.age/p.life; p.alpha = t<0.3 ? t/0.3 : (t>0.8 ? (1-(t-0.8)/0.2):1);

      const dx=p.x-center.x, dy=p.y-center.y; const dist=Math.hypot(dx,dy);
      if (dist < aura){
        const passProb = clamp(prot.transmission, 0, 1);
        if (prot.kind==='mineral' && !p.reflected){
          if (Math.random() > passProb){
            const nx=dx/(dist||1), ny=dy/(dist||1); const dot=p.vx*nx + p.vy*ny; p.vx = p.vx - 2*dot*nx + rand(-12,12); p.vy = p.vy - 2*dot*ny + rand(-12,12); p.reflected=true; p.size*=0.9; p.type='SPARK'; p.life = Math.min(p.life, p.age + rand(0.2,0.6));
            // if reflection close to skin, show reflect streak
            if (pointInSkin(p.x, p.y)) emitSkinEffect('REFLECT', p.x, p.y);
          }
        } else if (prot.kind==='chemical' && !p.absorbed){
          if (Math.random() > passProb){ p.absorbed=true; p.vx*=0.4; p.vy*=0.4; p.life=Math.min(p.life, p.age + rand(0.18,0.4)); if (pointInSkin(p.x, p.y)) emitSkinEffect('ABSORB', p.x, p.y); }
        } else {
          // should not occur since only two kinds exist
        }
      }

      if (p.x < -50 || p.x > canvas.clientWidth+50 || p.y < -50 || p.y > canvas.clientHeight+50){ recycleParticle(i); }
    }
  }

  function drawParticles(){
    ctx.save();
    for(const p of state.particles){ const col=(p.type==='UVA')?'rgba(138,92,255,':'rgba(77,165,255,'; const gA=(0.35*p.alpha).toFixed(3); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=`${col}${gA})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size*3, 0, Math.PI*2); ctx.fill(); }
    for(const p of state.particles){ const col=(p.type==='UVA')?'rgba(138,92,255,':'rgba(77,165,255,'; const gA=(0.9*p.alpha).toFixed(3); ctx.globalCompositeOperation='screen'; ctx.fillStyle=`${col}${gA})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); }
    ctx.restore();
  }

  function computeDose(minutes){
    const sel=SUN_STRENGTH[selSun.value]||SUN_STRENGTH.moderate; const prot=PROTECTION[selProt.value]||PROTECTION.mineral; const uvi=sel.uvi; const cloudK=1-computeCloudAttenuation(); const elev=1 - clamp(state.sun.y/canvas.clientHeight,0,1); const elevK=lerp(0.6, 1.25, elev); const reflectionK=1 + (state.env.water*0.1 + state.env.snow*0.5*elev); const T=clamp(prot.transmission,0,1); return uvi * elevK * cloudK * reflectionK * T * (minutes/60);
  }

  function updateSkinRedness(dose){
    let r=0; if(dose<=1) r=dose*0.35; else if(dose<=2) r=0.35+(dose-1)*0.35; else if(dose<=3) r=0.70+(dose-2)*0.2; else r=0.90+Math.min(0.1,(dose-3)*0.05); state.person.redness=clamp(r,0,1);
    let status='neutral'; if(dose<0.8) status='niedrig'; else if(dose<1.6) status='mittel'; else if(dose<2.4) status='hoch'; else if(dose<3.4) status='sehr hoch'; else status='extrem'; lblSkin.textContent=status;
  }

  let last=performance.now();
  function frame(now){ const dt=Math.min(0.033, (now-last)/1000); last=now; if(!state.paused){ state.time+=dt; updateSunPosition(dt); emitUVParticles(dt); updateParticles(dt); }
    drawSky(); initTerrain(); drawSunAndRays(); for(const c of state.clouds) c.update(dt, canvas.clientWidth); for(const c of state.clouds) c.draw(ctx); drawMountainAndSnow(); drawWater(dt); drawPerson(); drawParticles(); requestAnimationFrame(frame); }

  function updateUI(){ const mins=parseInt(rngDuration.value,10)||0; lblDuration.textContent=String(mins); const dose=computeDose(mins); state.dose=dose; lblDose.textContent=dose.toFixed(2); updateSkinRedness(dose); }

  selSun.addEventListener('change', updateUI); selProt.addEventListener('change', updateUI); rngDuration.addEventListener('input', updateUI);
  initClouds(); updateUI(); requestAnimationFrame(frame);

  document.addEventListener('visibilitychange',()=>{ state.paused=document.hidden; });
})();
