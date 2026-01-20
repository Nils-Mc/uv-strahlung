export default {
  async fetch(req) {
    return new Response(HTML, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
};

const HTML = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>UV-Schutz-Simulator – Mineralisch vs Chemisch</title>
<link rel="stylesheet" href="/app.css">
</head>
<body>
<header>
  <h1>UV-Schutz-Simulator</h1>
  <p>Visualisierung: Mineralischer vs. Chemischer Sonnenschutz</p>
</header>
<div id="app"></div>
<script type="module" src="/app.js"></script>
</body>
</html>`;
