/*
  ------------------------------------------------------
  UV-Visualisierung – Interaktive Lern-App (Canvas)
  ------------------------------------------------------
  Features (Kurzüberblick):
  - Dynamischer Himmel mit Sonnenposition, Glow und Strahlen
  - Wolken, Wasser, Schnee/Berg als Reflexionsflächen
  - UV-Partikel (UVA/UVB) mit Lebenszyklus, Streuung, Fade-Out
  - Unterscheidung der Schutzarten: SPF30, SPF50+, mineralisch, chemisch
  - Schutz-Aura um die Person (Reflexion vs. Absorption)
  - Hautrötung abhängig von UV-Dosis und Schutz
  - UI: Sonnenstärke, Schutzart, Dauer (0–180 min) + Dosis/Status
  - Responsiv (Desktop/Tablet/Phone)

  Didaktische Vereinfachung:
  - Kein medizinischer Rat. Modell reduziert komplexe Prozesse: UV-Index,
    Reflexion, Absorption/Reflexion von Sonnencreme (mineralisch vs. chemisch),
    Hautreaktion (Erythem) auf eine intuitive Visualisierung.
*/

(() => {
  'use strict';

  // ---------------------- Utility & Setup ----------------------
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * DPR);
    canvas.height = Math.floor(rect.height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // Draw in CSS pixels
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --------------- DOM elements & UI state ---------------------
  const selSun = document.getElementById('sunStrength');
  const selProt = document.getElementById('protection');
  const rngDuration = document.getElementById('duration');
  const lblDuration = document.getElementById('durationValue');
  const lblDose = document.getElementById('doseValue');
  const lblSkin = document.getElementById('skinStatus');

  // Provide default selections
  selSun.value = 'moderate';
  selProt.value = 'none';

  // Map categories to UV Index (simplified ranges -> representative value)
  const SUN_STRENGTH = {
    low: { uvi: 2, cloudAtten: 0.05 },         // low cloud attenuation expected
    moderate: { uvi: 5, cloudAtten: 0.12 },
    high: { uvi: 7, cloudAtten: 0.18 },
    veryhigh: { uvi: 9, cloudAtten: 0.22 },
    extreme: { uvi: 11, cloudAtten: 0.28 },
  };

  // Protection transmission (fraction reaching skin). Mineral = reflect, Chemical = absorb visual.
  const PROTECTION = {
    none: { transmission: 1.0, kind: 'none' },
    spf30: { transmission: 1/30, kind: 'spf' },            // ~3.3% pass
    spf50: { transmission: 0.02, kind: 'spf' },            // ~2% pass (50+)
    mineral: { transmission: 0.05, kind: 'mineral' },      // strongly reflective
    chemical: { transmission: 0.03, kind: 'chemical' }     // strongly absorptive
  };

  // Scene state
  const state = {
    time: 0,                 // animation time (sec)
    dayPhase: 0,             // 0..1 for sun position cycle
    sun: { x: 0, y: 0, r: 60 },
    clouds: [],
    particles: [],
    particlePool: [],
    maxParticles: 450,
    waterPhase: 0,
    mountain: { baseY: 0 },
    person: {
      x: 0,
      y: 0,
      width: 68,
      height: 160,
      aura: 30, // aura padding around person
      skinBase: { r: 233, g: 189, b: 164 },
      redness: 0 // 0..1
    },
    dose: 0,
    // environment reflectivity weights (approximate, dynamic with sun elevation)
    env: { water: 0.12, snow: 0.55 },
    uvaRatio: 0.8, // UVA fraction vs total UV photons
    paused: false,
  };

  // ---------------------- Helpers ------------------------------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixColor(c1, c2, t) { return {
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t)),
  }; }

  function rand(a=0, b=1) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b+1)); }
  function angleBetween(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

  // Perf: particle pool
  function spawnParticle() {
    let p = state.particlePool.pop();
    if (!p) p = {};
    state.particles.push(p);
    return p;
  }
  function recycleParticle(i) {
    const p = state.particles[i];
    const last = state.particles.pop();
    if (i < state.particles.length) state.particles[i] = last;
    state.particlePool.push(p);
  }

  // ---------------------- Sky & Sun ----------------------------
  function updateSunPosition(dt) {
    // Create a slow cycle: dayPhase 0..1 over ~30 seconds for demo
    state.dayPhase = (state.dayPhase + dt / 30) % 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // Sun path: x from left to right, y forming a high arc
    const margin = 40;
    const x = lerp(margin, w - margin, state.dayPhase);
    const arcHeight = h * 0.55;
    const y = lerp(h * 0.8, h * 0.2, Math.sin(state.dayPhase * Math.PI));
    state.sun.x = x; state.sun.y = y; state.sun.r = Math.max(40, Math.min(80, h * 0.07));
  }

  function drawSky() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    // Change colors with sun elevation
    const elev = 1 - clamp(state.sun.y / h, 0, 1); // 0 (low) .. 1 (high)
    const skyTop = `rgba(${Math.round(lerp(16, 60, elev))}, ${Math.round(lerp(32, 120, elev))}, ${Math.round(lerp(58, 200, elev))}, 1)`;
    const skyBottom = `rgba(${Math.round(lerp(10, 12, elev))}, ${Math.round(lerp(14, 20, elev))}, ${Math.round(lerp(20, 30, elev))}, 1)`;
    grd.addColorStop(0, skyTop);
    grd.addColorStop(1, skyBottom);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  function drawSunAndRays() {
    const { x, y, r } = state.sun;
    // Glow
    const glow = ctx.createRadialGradient(x, y, r*0.2, x, y, r*2.2);
    glow.addColorStop(0, 'rgba(255, 219, 112, 0.95)');
    glow.addColorStop(0.3, 'rgba(255, 219, 112, 0.65)');
    glow.addColorStop(1, 'rgba(255, 219, 112, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r*2.2, 0, Math.PI*2);
    ctx.fill();

    // Sun core
    const core = ctx.createRadialGradient(x, y, r*0.2, x, y, r);
    core.addColorStop(0, '#fff4cf');
    core.addColorStop(1, '#ffd36c');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();

    // Rays: rotating, soft
    const rayCount = 24;
    const baseAng = state.time * 0.15;
    for (let i = 0; i < rayCount; i++) {
      const a = baseAng + (i / rayCount) * Math.PI * 2;
      const len = r * lerp(2.8, 3.6, Math.sin(i*4 + state.time*0.6)*0.5 + 0.5);
      const w = lerp(2, 5, (Math.sin(i*3 + state.time*0.9)*0.5+0.5));
      const x2 = x + Math.cos(a) * len;
      const y2 = y + Math.sin(a) * len;
      const grad = ctx.createLinearGradient(x, y, x2, y2);
      grad.addColorStop(0, 'rgba(255,231,140,0.35)');
      grad.addColorStop(1, 'rgba(255,231,140,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    }
  }

  // ---------------------- Clouds -------------------------------
  class Cloud {
    constructor(x, y, scale, speed) {
      this.x = x; this.y = y; this.scale = scale; this.speed = speed;
      this.puffs = Array.from({length: 5 + Math.floor(scale*3)}, () => ({
        ox: rand(-40, 40) * scale, oy: rand(-10, 12) * scale, r: rand(16, 28) * scale
      }));
    }
    update(dt, w) { this.x += this.speed * dt; if (this.x > w + 120) this.x = -120; }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = 'rgba(230,240,255,0.9)';
      ctx.beginPath();
      for (const p of this.puffs) {
        ctx.moveTo(this.x + p.ox, this.y + p.oy);
        ctx.arc(this.x + p.ox, this.y + p.oy, p.r, 0, Math.PI*2);
      }
      ctx.fill();
      // subtle shadow
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      for (const p of this.puffs) {
        ctx.moveTo(this.x + p.ox + 4, this.y + p.oy + 6);
        ctx.arc(this.x + p.ox + 4, this.y + p.oy + 6, p.r, 0, Math.PI*2);
      }
      ctx.fill();
      ctx.restore();
    }
  }

  function initClouds() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    state.clouds = [
      new Cloud(rand(0, w*0.6), rand(h*0.08, h*0.26), rand(0.9, 1.3), rand(8, 16)),
      new Cloud(rand(0, w*0.9), rand(h*0.15, h*0.35), rand(0.6, 1.0), rand(10, 18)),
      new Cloud(rand(0, w*0.7), rand(h*0.28, h*0.42), rand(0.5, 0.8), rand(12, 22)),
    ];
  }

  // approximate cloud attenuation factor based on coverage
  function computeCloudAttenuation() {
    // use configured by SUN_STRENGTH + dynamic based on clouds crossing the sun
    const sel = SUN_STRENGTH[selSun.value] || SUN_STRENGTH.moderate;
    // Check if a cloud is near the sun position to increase attenuation
    let extra = 0;
    for (const c of state.clouds) {
      const dx = Math.abs(c.x - state.sun.x);
      const dy = Math.abs(c.y - state.sun.y);
      if (dx < 120 && dy < 60) extra += 0.15; // cloud in front of sun
    }
    return clamp(sel.cloudAtten + extra, 0, 0.7);
  }

  // ---------------------- Water & Mountain ---------------------
  function initTerrain() {
    const h = canvas.clientHeight;
    state.mountain.baseY = Math.floor(h * 0.62);
  }

  function drawWater(dt) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const waterY = Math.floor(h * 0.78);
    state.waterPhase += dt * 0.6;

    // Water gradient
    const grd = ctx.createLinearGradient(0, waterY, 0, h);
    grd.addColorStop(0, 'rgba(60,110,160,0.75)');
    grd.addColorStop(1, 'rgba(20,45,70,0.9)');

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    for (let x = 0; x <= w; x += 8) {
      const y = waterY + Math.sin((x*0.02) + state.waterPhase) * 3 + Math.sin((x*0.05) - state.waterPhase*1.6) * 2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fill();

    // Specular glints (sun reflection) – simple band under sun
    const bandY = waterY - 4 + Math.sin(state.waterPhase*0.7)*2;
    const grad = ctx.createLinearGradient(0, bandY-8, 0, bandY+18);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grad;
    ctx.fillRect(state.sun.x - 120, bandY-8, 240, 26);
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawMountainAndSnow() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const baseY = state.mountain.baseY;

    // Far mountains silhouette
    ctx.fillStyle = 'rgba(30,35,50,1)';
    ctx.beginPath();
    ctx.moveTo(0, baseY + 40);
    ctx.lineTo(w*0.18, baseY - 30);
    ctx.lineTo(w*0.32, baseY + 20);
    ctx.lineTo(w*0.48, baseY - 40);
    ctx.lineTo(w*0.66, baseY + 30);
    ctx.lineTo(w*0.82, baseY - 10);
    ctx.lineTo(w, baseY + 50);
    ctx.lineTo(w, h); ctx.lineTo(0, h);
    ctx.closePath(); ctx.fill();

    // Main snowy mountain (reflective)
    const mx = w*0.82; const my = baseY - 20; const peak = { x: mx, y: my - 140 };
    ctx.fillStyle = 'rgba(48,56,78,1)';
    ctx.beginPath();
    ctx.moveTo(mx-160, my+80);
    ctx.lineTo(peak.x, peak.y);
    ctx.lineTo(mx+140, my+80);
    ctx.lineTo(mx-160, my+80);
    ctx.closePath();
    ctx.fill();

    // Snow cap
    const snowGrad = ctx.createLinearGradient(peak.x, peak.y, peak.x, my+80);
    snowGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
    snowGrad.addColorStop(1, 'rgba(220,235,255,0.3)');
    ctx.fillStyle = snowGrad;
    ctx.beginPath();
    ctx.moveTo(mx-40, my+10);
    ctx.lineTo(peak.x, peak.y);
    ctx.lineTo(mx+20, my+18);
    ctx.lineTo(mx-40, my+10);
    ctx.closePath();
    ctx.fill();

    // Shadow fold
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(mx+10, my+20);
    ctx.lineTo(mx+50, my+50);
    ctx.lineTo(mx+20, my+80);
    ctx.closePath();
    ctx.fill();
  }

  // ---------------------- Person & Aura ------------------------
  function personBounds() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const px = Math.floor(w*0.28); const py = Math.floor(h*0.74);
    state.person.x = px; state.person.y = py;
    return { x: px, y: py, w: state.person.width, h: state.person.height };
  }

  function drawPerson() {
    const p = personBounds();
    const base = state.person.skinBase;
    const red = mixColor(base, {r: 255, g: 110, b: 90}, clamp(state.person.redness, 0, 1));
    const skin = `rgb(${red.r}, ${red.g}, ${red.b})`;

    // Aura (protection visualization)
    const prot = PROTECTION[selProt.value];
    const auraR = Math.max(p.w, p.h) * 0.85 + state.person.aura;
    ctx.save();
    if (prot.kind === 'mineral') {
      // reflective: bright rim
      const g = ctx.createRadialGradient(p.x, p.y - p.h*0.5, auraR*0.7, p.x, p.y - p.h*0.5, auraR);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.8, 'rgba(255,255,255,0.25)');
      g.addColorStop(1, 'rgba(255,255,255,0.8)');
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.h*0.5, auraR, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else if (prot.kind === 'chemical') {
      // absorptive: soft teal halo
      const g = ctx.createRadialGradient(p.x, p.y - p.h*0.5, auraR*0.2, p.x, p.y - p.h*0.5, auraR*1.05);
      g.addColorStop(0, 'rgba(87,255,199,0.22)');
      g.addColorStop(1, 'rgba(87,255,199,0.04)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.h*0.5, auraR, 0, Math.PI*2); ctx.fill();
    } else if (prot.kind === 'spf') {
      // neutral soft halo indicating a filter
      const g = ctx.createRadialGradient(p.x, p.y - p.h*0.5, auraR*0.2, p.x, p.y - p.h*0.5, auraR*1.05);
      g.addColorStop(0, 'rgba(108,192,255,0.18)');
      g.addColorStop(1, 'rgba(108,192,255,0.03)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.h*0.5, auraR, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // Simple person figure (silhouette with skin color)
    ctx.save();
    ctx.translate(p.x, p.y);

    // Legs
    ctx.fillStyle = '#293041';
    ctx.fillRect(-20, -10, 16, 60);
    ctx.fillRect(  4, -10, 16, 60);

    // Torso (shirt)
    const shirtGrad = ctx.createLinearGradient(0, -p.h+40, 0, -10);
    shirtGrad.addColorStop(0, '#2e3a58');
    shirtGrad.addColorStop(1, '#1f2740');
    ctx.fillStyle = shirtGrad;
    ctx.fillRect(-28, -p.h+40, 56, 80);

    // Arms (skin) – exposed
    ctx.fillStyle = skin;
    ctx.fillRect(-36, -p.h+40, 8, 44);
    ctx.fillRect( 28, -p.h+40, 8, 44);

    // Head (skin)
    ctx.beginPath(); ctx.arc(0, -p.h+16, 20, 0, Math.PI*2); ctx.fill();

    // Simple face hint
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.arc(-6, -p.h+12, 2.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( 6, -p.h+12, 2.2, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-6, -p.h+24, 12, 2);

    // Shorts
    ctx.fillStyle = '#20273a';
    ctx.fillRect(-28, -p.h+120, 56, 30);

    // Ground shadow under person
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 12, 48, 8, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------------- Particles (UV) -----------------------
  function emitUVParticles(dt) {
    const desiredPerSec = 140; // base emission
    const strength = SUN_STRENGTH[selSun.value] || SUN_STRENGTH.moderate;
    const cloudK = 1 - computeCloudAttenuation();
    const elev = 1 - clamp(state.sun.y / canvas.clientHeight, 0, 1); // 0..1

    // Effective emission factor based on UVI, elevation and clouds
    const emission = desiredPerSec * (strength.uvi/5) * lerp(0.5, 1.2, elev) * cloudK;

    // Add reflection sources: water/snow -> spawn fraction aiming to person
    const reflExtra = emission * (0.15 * state.env.water + 0.35 * state.env.snow * elev);

    let toSpawn = (emission + reflExtra) * dt;
    toSpawn = Math.min(toSpawn, 600 * dt); // cap

    for (let i = 0; i < toSpawn; i++) {
      if (state.particles.length >= state.maxParticles) break;
      // spawn from sun direction most of the time
      const fromReflection = Math.random() < (reflExtra/(emission+reflExtra));
      const p = spawnParticle();
      const tUVA = Math.random() < state.uvaRatio;
      p.type = tUVA ? 'UVA' : 'UVB';
      p.size = tUVA ? rand(1.4, 2.2) : rand(1.6, 2.6);
      p.alpha = 0;
      p.life = rand(1.6, 3.2);
      p.age = 0;
      p.absorbed = false; // flag for chemical
      p.reflected = false; // flag for mineral

      const person = personBounds();
      const target = { x: person.x, y: person.y - person.h*0.5 };

      if (!fromReflection) {
        // Start near sun with some spread
        const spawnR = 14 + Math.random()*22;
        const a = Math.random() * Math.PI * 2;
        p.x = state.sun.x + Math.cos(a) * spawnR;
        p.y = state.sun.y + Math.sin(a) * spawnR;
        // Velocity roughly towards person
        const ang = angleBetween(p.x, p.y, target.x, target.y) + rand(-0.2, 0.2);
        const speed = rand(60, 140) * lerp(0.8, 1.2, Math.random());
        p.vx = Math.cos(ang) * speed;
        p.vy = Math.sin(ang) * speed;
      } else {
        // Reflection source: water band or mountain snow
        const waterY = Math.floor(canvas.clientHeight * 0.78);
        const pickSnow = Math.random() < 0.6; // snow is strong reflector
        if (pickSnow) {
          p.x = canvas.clientWidth * rand(0.72, 0.92);
          p.y = state.mountain.baseY - rand(30, 120);
        } else {
          p.x = state.sun.x + rand(-80, 80);
          p.y = waterY + rand(-4, 16);
        }
        const ang = angleBetween(p.x, p.y, target.x+rand(-20,20), target.y+rand(-10,10));
        const speed = rand(70, 120);
        p.vx = Math.cos(ang) * speed; p.vy = Math.sin(ang) * speed;
      }
    }
  }

  function updateParticles(dt) {
    const prot = PROTECTION[selProt.value] || PROTECTION.none;
    const person = personBounds();
    const center = { x: person.x, y: person.y - person.h*0.5 };
    const aura = Math.max(person.w, person.h) * 0.85 + state.person.aura;

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.age += dt;
      if (p.age >= p.life) { recycleParticle(i); continue; }

      p.x += p.vx * dt; p.y += p.vy * dt;
      // Fade in/out
      const t = p.age / p.life;
      p.alpha = t < 0.3 ? t/0.3 : (t > 0.8 ? (1 - (t-0.8)/0.2) : 1);

      // Interaction with protection aura
      const dx = p.x - center.x; const dy = p.y - center.y;
      const dist = Math.hypot(dx, dy);
      if (dist < aura) {
        const transmission = prot.transmission;
        const passProb = transmission; // simplified: fraction that can pass

        if (prot.kind === 'mineral' && !p.reflected) {
          // Reflect most particles based on (1 - pass)
          if (Math.random() > passProb) {
            // reflect: bounce away along normal
            const nx = dx / (dist || 1); const ny = dy / (dist || 1);
            const dot = p.vx*nx + p.vy*ny;
            p.vx = p.vx - 2*dot*nx + rand(-10,10);
            p.vy = p.vy - 2*dot*ny + rand(-10,10);
            p.reflected = true;
            p.size *= 0.9;
            // make a quick spark visual
            p.type = 'SPARK';
            p.life = Math.min(p.life, p.age + rand(0.2, 0.6));
          }
        } else if (prot.kind === 'chemical' && !p.absorbed) {
          // Absorb most particles
          if (Math.random() > passProb) {
            p.absorbed = true; // start fading
            p.vx *= 0.4; p.vy *= 0.4;
            p.life = Math.min(p.life, p.age + rand(0.18, 0.4));
          }
        } else {
          // SPF generic: probabilistic cull
          if (Math.random() > passProb) {
            recycleParticle(i);
            continue;
          }
        }
      }

      // Cull if far off-screen
      if (p.x < -50 || p.x > canvas.clientWidth + 50 || p.y < -50 || p.y > canvas.clientHeight + 50) {
        recycleParticle(i);
      }
    }
  }

  function drawParticles() {
    ctx.save();
    // Draw in two passes for glow
    for (const p of state.particles) {
      const col = (p.type === 'UVA') ? 'rgba(138,92,255,' : (p.type === 'UVB') ? 'rgba(77,165,255,' : 'rgba(255,255,255,';
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `${col}${(0.35 * p.alpha).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size*3.0, 0, Math.PI*2); ctx.fill();
    }

    for (const p of state.particles) {
      const col = (p.type === 'UVA') ? 'rgba(138,92,255,' : (p.type === 'UVB') ? 'rgba(77,165,255,' : 'rgba(255,255,255,';
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `${col}${(0.9 * p.alpha).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------- Dose & Skin --------------------------
  function computeDose(minutes) {
    const sel = SUN_STRENGTH[selSun.value] || SUN_STRENGTH.moderate;
    const prot = PROTECTION[selProt.value] || PROTECTION.none;

    const uvi = sel.uvi; // simplified measure

    // Cloud attenuation
    const cloudK = 1 - computeCloudAttenuation();

    // Sun elevation factor (more overhead -> higher intensity)
    const elev = 1 - clamp(state.sun.y / canvas.clientHeight, 0, 1); // 0..1
    const elevK = lerp(0.6, 1.25, elev);

    // Environmental reflections (water+snow). Enhanced when sun high
    const reflectionK = 1 + (state.env.water*0.1 + state.env.snow*0.5*elev);

    // Protection transmission (fraction reaches skin)
    const T = clamp(prot.transmission, 0, 1);

    // Dose model (didactic units):
    // dose = uvi * elevK * cloudK * reflectionK * T * (minutes/60)
    const dose = uvi * elevK * cloudK * reflectionK * T * (minutes / 60);
    return dose;
  }

  function updateSkinRedness(dose) {
    // Normalized erythema index. Use soft thresholds for school-level explanation.
    // 0-1: neutral, 1-2: leicht, 2-3: deutlich, >3: stark
    let redness = 0;
    if (dose <= 1) redness = dose * 0.35; // slight tint
    else if (dose <= 2) redness = 0.35 + (dose-1) * 0.35;
    else if (dose <= 3) redness = 0.70 + (dose-2) * 0.2;
    else redness = 0.90 + Math.min(0.1, (dose-3) * 0.05);
    state.person.redness = clamp(redness, 0, 1);

    // Status label
    let status = 'neutral'; let col = 'var(--good)';
    if (dose < 0.8) { status = 'niedrig'; col = 'var(--good)'; }
    else if (dose < 1.6) { status = 'mittel'; col = 'var(--warn)'; }
    else if (dose < 2.4) { status = 'hoch'; col = 'var(--bad)'; }
    else if (dose < 3.4) { status = 'sehr hoch'; col = 'var(--bad)'; }
    else { status = 'extrem'; col = 'var(--bad)'; }
    lblSkin.textContent = status;
    lblSkin.style.color = getComputedStyle(document.documentElement).getPropertyValue(col.replace('var(', '').replace(')','')) || '';
  }

  // ---------------------- Main Render Loop ---------------------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000); // clamp dt to ~30 FPS step max
    last = now;
    if (!state.paused) {
      state.time += dt;
      updateSunPosition(dt);
      emitUVParticles(dt);
      updateParticles(dt);
    }

    drawSky();
    initTerrain();
    drawSunAndRays();
    for (const c of state.clouds) c.update(dt, canvas.clientWidth);
    for (const c of state.clouds) c.draw(ctx);
    drawMountainAndSnow();
    drawWater(dt);
    drawPerson();
    drawParticles();

    requestAnimationFrame(frame);
  }

  // ---------------------- UI Wiring ----------------------------
  function updateUI() {
    const mins = parseInt(rngDuration.value, 10) || 0;
    lblDuration.textContent = String(mins);
    const dose = computeDose(mins);
    state.dose = dose;
    lblDose.textContent = dose.toFixed(2);
    updateSkinRedness(dose);
  }

  selSun.addEventListener('change', updateUI);
  selProt.addEventListener('change', updateUI);
  rngDuration.addEventListener('input', updateUI);

  // Initialize clouds once size known
  initClouds();
  updateUI();
  requestAnimationFrame(frame);

  // ---------------------- Accessibility touch-ups --------------
  // Allow space/enter to trigger hint tooltips through focus
  document.querySelectorAll('.hint').forEach(h => {
    h.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // toggle: simply blur or focus again to show native :focus tooltip
        if (document.activeElement === h) h.blur(); else h.focus();
      }
    });
  });

  // Pause animation when tab unfocused to save CPU
  document.addEventListener('visibilitychange', () => {
    state.paused = document.hidden;
  });

})();
