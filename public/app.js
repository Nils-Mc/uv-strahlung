/*
  UV – Hautfokus (nur 2 Controls):
  - Schutz-Switch: mineralisch ↔ chemisch
  - Beschriftung-Toggle: an/aus
  - UVA/UVB/UVC als animierte Pfeile
  - UVC wird an der Atmosphäre absorbiert
  - Hautschichten (Stratum corneum, Epidermis, Dermis)
  - Mineralisch: sichtbarer Film + Reflex-Streaks
  - Chemisch: kein Film + Absorptions-Glows
*/
(() => {
  'use strict';
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resizeCanvas(){ const rect = canvas.getBoundingClientRect(); canvas.width = Math.floor(rect.width * DPR); canvas.height = Math.floor(rect.height * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);} window.addEventListener('resize', resizeCanvas); resizeCanvas();

  const btnMineral = document.getElementById('btnMineral');
  const btnChemical = document.getElementById('btnChemical');
  const toggleLabels = document.getElementById('toggleLabels');

  const PROTECTION = { mineral:{transmission:0.08, kind:'mineral'}, chemical:{transmission:0.06, kind:'chemical'} };
  const COLORS = { uva:'rgba(138,92,255,1)', uvb:'rgba(77,165,255,1)', uvc:'rgba(67,255,157,1)'};

  const state = { prot:'mineral', labels:true, time:0, arrows:[], pool:[], maxArrows:420, sun:{x:120,y:80,r:36}, atmY:90, skin:{x:160,y:260,w:520,h:220}, layers:null, redness:0, effects:[], paused:false };

  function setProt(kind){ state.prot = kind; btnMineral.classList.toggle('active', kind==='mineral'); btnMineral.setAttribute('aria-pressed', String(kind==='mineral')); btnChemical.classList.toggle('active', kind==='chemical'); btnChemical.setAttribute('aria-pressed', String(kind==='chemical')); }
  btnMineral.addEventListener('click', ()=>setProt('mineral'));
  btnChemical.addEventListener('click', ()=>setProt('chemical'));
  toggleLabels.addEventListener('change', ()=>{ state.labels = toggleLabels.checked; });
  setProt('mineral');

  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }
  function rand(a=0,b=1){ return a + Math.random()*(b-a); }

  function computeSkinLayers(){ const s=state.skin; const sc={y:s.y+8,h:14,name:'Stratum corneum'}; const epi={y:sc.y+sc.h+4,h:60,name:'Epidermis'}; const der={y:epi.y+epi.h+4,h:s.h-(epi.h+sc.h+16),name:'Dermis'}; state.layers={sc,epi,der}; }

  function drawGradientSky(){ const w=canvas.clientWidth,h=canvas.clientHeight; const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(20,60,120,1)'); g.addColorStop(1,'rgba(12,16,24,1)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); }
  function drawSun(){ const s=state.sun; const glow=ctx.createRadialGradient(s.x,s.y,s.r*0.3,s.x,s.y,s.r*2); glow.addColorStop(0,'rgba(255,219,112,0.95)'); glow.addColorStop(1,'rgba(255,219,112,0)'); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*2,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over'; const core=ctx.createRadialGradient(s.x,s.y,s.r*0.3,s.x,s.y,s.r); core.addColorStop(0,'#fff4cf'); core.addColorStop(1,'#ffd36c'); ctx.fillStyle=core; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); }
  function drawAtmosphere(){ const w=canvas.clientWidth,y=state.atmY; ctx.fillStyle='rgba(120,200,255,0.12)'; ctx.fillRect(0,y-18,w,36); ctx.strokeStyle='rgba(160,220,255,0.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,y-18); ctx.lineTo(w,y-18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,y+18); ctx.lineTo(w,y+18); ctx.stroke(); if(state.labels){ ctx.fillStyle='rgba(220,240,255,0.85)'; ctx.font='12px system-ui, sans-serif'; ctx.fillText('Atmosphäre – UVC wird hier blockiert', 16, y-24); } }

  function drawSkin(){ const s=state.skin; if(!state.layers) computeSkinLayers(); const {sc,epi,der}=state.layers; const g=ctx.createLinearGradient(0,s.y,0,s.y+s.h); g.addColorStop(0,'rgba(255,223,200,0.95)'); g.addColorStop(1,'rgba(210,160,130,0.95)'); ctx.fillStyle=g; ctx.fillRect(s.x,s.y,s.w,s.h); ctx.strokeStyle='rgba(0,0,0,0.15)'; ctx.lineWidth=1; const layers=[sc,epi,der]; layers.forEach(L=>{ ctx.beginPath(); ctx.moveTo(s.x,L.y); ctx.lineTo(s.x+s.w,L.y); ctx.stroke(); if(state.labels){ ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.font='12px system-ui, sans-serif'; ctx.fillText(L.name, s.x+8, L.y+12); } }); if(state.redness>0){ const r=clamp(state.redness,0,1); ctx.fillStyle=`rgba(255,110,96,${0.12*r})`; ctx.fillRect(s.x, s.y, s.w, s.h*0.4); }
    const prot=PROTECTION[state.prot]; if(prot.kind==='mineral'){ const filmH=8,y=s.y-filmH; const fg=ctx.createLinearGradient(0,y,0,y+filmH); fg.addColorStop(0,'rgba(255,255,255,0.9)'); fg.addColorStop(1,'rgba(255,255,255,0.6)'); ctx.fillStyle=fg; ctx.fillRect(s.x,y,s.w,filmH); ctx.globalCompositeOperation='screen'; const sheen=ctx.createLinearGradient(s.x,y,s.x+s.w,y); sheen.addColorStop(0,'rgba(255,255,255,0)'); sheen.addColorStop(0.5,'rgba(255,255,255,0.35)'); sheen.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=sheen; ctx.fillRect(s.x,y,s.w,filmH); ctx.globalCompositeOperation='source-over'; } else { const ag=ctx.createLinearGradient(0,s.y-12,0,s.y+8); ag.addColorStop(0,'rgba(87,255,199,0.14)'); ag.addColorStop(1,'rgba(87,255,199,0.04)'); ctx.fillStyle=ag; ctx.fillRect(s.x, s.y-12, s.w, 20); } }

  function spawnArrow(type){ let a=state.pool.pop(); if(!a) a={}; a.type=type; a.life=2.2+Math.random()*1.8; a.age=0; a.alpha=0; a.energy=1; a.width=(type==='UVA'?3.2:type==='UVB'?3.6:3.0); a.len=(type==='UVA'?28:type==='UVB'?24:22); const s=state.sun, sk=state.skin; const tx=sk.x+sk.w*0.5+rand(-60,60), ty=sk.y+rand(-10,10); const ang=Math.atan2(ty-s.y, tx-s.x)+rand(-0.08,0.08); const speed=rand(120,170); a.x=s.x+Math.cos(ang)*s.r; a.y=s.y+Math.sin(ang)*s.r; a.vx=Math.cos(ang)*speed; a.vy=Math.sin(ang)*speed; a.absorbed=false; a.reflected=false; state.arrows.push(a); return a; }
  function recycleArrow(i){ const a=state.arrows[i]; const last=state.arrows.pop(); if(i<state.arrows.length) state.arrows[i]=last; state.pool.push(a); }

  function drawArrow(a){ const base = a.type==='UVA'? COLORS.uva : a.type==='UVB'? COLORS.uvb : COLORS.uvc; const alpha = clamp(a.alpha * a.energy, 0, 1); const stroke = base.replace(',1)', `,${alpha})`).replace('rgb','rgba'); const ang = Math.atan2(a.vy, a.vx); const nx=Math.cos(ang), ny=Math.sin(ang); const x2=a.x, y2=a.y, x1=x2-nx*a.len, y1=y2-ny*a.len; ctx.strokeStyle=stroke; ctx.lineWidth=a.width; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); const head=6+a.width, left=ang+Math.PI*0.9, right=ang-Math.PI*0.9; ctx.fillStyle=stroke; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-Math.cos(left)*head, y2-Math.sin(left)*head); ctx.lineTo(x2-Math.cos(right)*head, y2-Math.sin(right)*head); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle = stroke.replace(/rgba\(([^)]+),([0-9.]+)\)/, (m, rgb, a) => `rgba(${rgb},${alpha*0.25})`); ctx.beginPath(); ctx.arc(x2,y2,10,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over'; }

  function addEffect(type,x,y){ state.effects.push({type,x,y,age:0,life:(type==='ABSORB'?0.6:0.4)}); }
  function drawEffects(){ for(let i=state.effects.length-1;i>=0;i--){ const e=state.effects[i]; const t=e.age/e.life; const a=1-t; if(e.type==='ABSORB'){ const r=lerp(3,22,t); ctx.strokeStyle=`rgba(87,255,199,${0.5*a})`; ctx.lineWidth=lerp(2.5,0.5,t); ctx.beginPath(); ctx.arc(e.x,e.y,r,0,Math.PI*2); ctx.stroke(); } else { ctx.strokeStyle=`rgba(255,255,255,${0.8*a})`; ctx.lineWidth=1.5; const len=lerp(12,2,t); ctx.beginPath(); ctx.moveTo(e.x-len,e.y); ctx.lineTo(e.x+len,e.y); ctx.stroke(); } e.age += 0.016 + Math.random()*0.010; if(e.age>=e.life) state.effects.splice(i,1); } }

  function updateArrows(dt){ const atmY=state.atmY, s=state.skin, prot=PROTECTION[state.prot], scTop=s.y; for(let i=state.arrows.length-1;i>=0;i--){ const a=state.arrows[i]; a.age+=dt; if(a.age>=a.life || a.energy<=0.02){ recycleArrow(i); continue; } const t=a.age/a.life; a.alpha = (t<0.25? t/0.25 : (t>0.85? (1-(t-0.85)/0.15) : 1)); a.x += a.vx*dt; a.y += a.vy*dt; if(a.type==='UVC' && a.y >= atmY - 16){ addEffect('ABSORB', a.x, atmY); recycleArrow(i); continue; } if(a.y >= scTop){ if(prot.kind==='mineral' && !a.reflected){ if(Math.random() > prot.transmission){ a.reflected=true; a.vy *= -1; a.vx += rand(-40,40); a.energy *= 0.7; addEffect('REFLECT', a.x, scTop); } else { a.energy *= 0.6; } } if(prot.kind==='chemical' && !a.absorbed){ if(Math.random() > prot.transmission){ a.absorbed = true; a.energy *= 0.5; addEffect('ABSORB', a.x, scTop+8); if(a.type==='UVB') state.redness = clamp(state.redness + 0.02, 0, 1); recycleArrow(i); continue; } } const {epi, der} = state.layers || {}; if(a.type==='UVB'){ if(a.y > epi.y + epi.h - 4){ addEffect('ABSORB', a.x, epi.y + epi.h - 6); state.redness = clamp(state.redness + 0.01, 0, 1); recycleArrow(i); continue; } a.vy *= 0.96; a.energy *= 0.995; } else if(a.type==='UVA'){ if(a.y > der.y + der.h - 8){ addEffect('ABSORB', a.x, der.y + der.h - 10); recycleArrow(i); continue; } a.vy *= 0.985; a.energy *= 0.996; } }
      if(a.x < -60 || a.x > canvas.clientWidth+60 || a.y < -60 || a.y > canvas.clientHeight+60){ recycleArrow(i); }
    } }

  function emitArrows(dt){ const rate=160; let n=Math.min(rate*dt, 320*dt); for(let i=0;i<n;i++){ if(state.arrows.length>=state.maxArrows) break; const r=Math.random(); const type = (r<0.03)? 'UVC' : (r<0.20? 'UVB' : 'UVA'); spawnArrow(type); } }

  function drawScene(){ drawGradientSky(); drawSun(); drawAtmosphere(); const s=state.skin; ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1.5; ctx.strokeRect(s.x-1, s.y-1, s.w+2, s.h+2); drawSkin(); for(const a of state.arrows) drawArrow(a); drawEffects(); }

  let last=performance.now();
  function frame(now){ const dt=Math.min(0.033, (now-last)/1000); last=now; if(!state.paused){ state.time += dt; emitArrows(dt); updateArrows(dt); } drawScene(); requestAnimationFrame(frame); }

  computeSkinLayers(); requestAnimationFrame(frame); document.addEventListener('visibilitychange',()=>{ state.paused=document.hidden; });
})();
