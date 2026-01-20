export default {
  async fetch(request, env, ctx) {
    // 1) Versuche, die angeforderte Resource aus den Assets zu holen
    let res = await env.ASSETS.fetch(request);

    // 2) Wenn nicht gefunden (404), rendere index.html (so funktionieren Deep-Links)
    if (res.status === 404) {
      const url = new URL(request.url);
      // Nur für GET und HTML akzeptieren wir den SPA-Fallback
      const accept = request.headers.get("Accept") || "";
      const wantsHTML = accept.includes("text/html");
      if (request.method === "GET" && wantsHTML) {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        res = await env.ASSETS.fetch(indexRequest);
      }
    }

    // 3) Sichere Defaults: Caching & Security Headers (minimal)
    const newHeaders = new Headers(res.headers);

    // Dezentes Caching für statische Assets
    const pathname = new URL(request.url).pathname;
    const isAsset = pathname.match(/\.(css|js|png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf)$/i);
    if (isAsset) {
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      newHeaders.set("Cache-Control", "no-cache");
    }

    // Basale Security Headers (mit Canvas/Inline-Styles zulassen)
    newHeaders.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "font-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
      ].join("; ")
    );
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(res.body, { status: res.status, headers: newHeaders });
  },
};