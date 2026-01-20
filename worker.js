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
<title>UV-Simulator High-End</title>
<link rel="stylesheet" href="/app.css">
<style>
  body{ margin:0; background:#0a1120; color:#fff; font-family:ui-sans-serif, system-ui, sans-serif; overflow:hidden;}
  #ui{position:absolute; top:16px; left:16px; z-index:10; max-width:360px;}
  .group{margin-bottom:12px;}
  label{display:block;margin-bottom:4px; font-weight:600;}
  select,input[type="range"]{width:100%;}
  button{padding:8px 16px; border-radius:8px; border:none; cursor:pointer; background:#6aa9ff; color:#fff; font-weight:600;}
</style>
</head>
<body>
<canvas id="canvas"></canvas>

<div id="ui">
  <div class="group">
    <label for="uvType">UV-Schutz Typ</label>
    <select id="uvType">
      <option value="mineral">Mineralisch</option>
      <option value="chemisch">Chemisch</option>
    </select>
  </div>
  <div class="group">
    <label for="spf">SPF / Schutz</label>
    <select id="spf">
      <option value="none">Kein</option>
      <option value="spf30">SPF 30</option>
      <option value="spf50">SPF 50+</option>
    </select>
  </div>
  <div class="group">
    <label for="duration">Dauer in Minuten</label>
    <input type="range" id="duration" min="0" max="180" value="30">
  </div>
  <div class="group">
    <button id="resetBtn">Zurücksetzen</button>
  </div>
</div>

<script type="module" src="/app.js"></script>
</body>
</html>`;
