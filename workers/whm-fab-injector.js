// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ext = [".js", ".css", ".png", ".jpg", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".json", ".map"];
    if (ext.some((e) => url.pathname.endsWith(e))) return fetch(request);
    if (["/api/", "/static/", "/assets/"].some((p) => url.pathname.startsWith(p))) return fetch(request);
    const modReq = new Request(request.url, {
      method: request.method,
      headers: (() => {
        const h = new Headers(request.headers);
        h.set("Accept-Encoding", "identity");
        return h;
      })(),
      redirect: "follow"
    });
    const orig = await fetch(modReq);
    const ct = orig.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return orig;
    let html = await orig.text();
    const T = "WAR 3.0 Live Map \u2013 Operation Epic Fury, Strait of Hormuz Crisis &amp; Real-Time Global Conflict Intelligence | WarHeatMap.app";
    const D = "WarHeatMap.app \u2014 Free real-time OSINT tracking 1,000+ verified events. Operation Epic Fury (U.S.-Iran), Strait of Hormuz crisis 2026, Russia-Ukraine, Israel-Gaza/Lebanon, Sudan, Myanmar, DRC and more. 19 naval assets live. Brent crude at $114. Free forever.";
    const K = "War 3.0, WW3 live map, world war 3 tracker 2026, real-time conflict map, OSINT intelligence, Operation Epic Fury, Strait of Hormuz crisis 2026, Hormuz blockade 2026, US Iran war map, Russia Ukraine war tracker, Israel Gaza war, Israel Lebanon Hezbollah 2026, naval asset tracker 2026, WarHeatMap, warheatmap.app, where is WW3, active wars 2026, open source intelligence, CENTCOM tracker, Houthi Red Sea 2026";
    const NK = "War 3.0, WW3 map, Operation Epic Fury, Strait of Hormuz 2026, Hormuz blockade, US Iran war 2026, Russia Ukraine 2026, Israel Gaza Lebanon 2026, OSINT tracker, Hormuz crisis";
    const OLD = "WAR 3.0 \u2013 Real-Time Global Conflict Tracker &amp; Intelligence";
    const OLD_DESC = "WAR 3.0 \u2013 Real-Time Global Conflict Tracker &amp; Intelligence manages 5 data types including events.";
    html = html.split(OLD + "\n  </title>").join(T + "\n  </title>");
    html = html.split('<meta content="' + OLD_DESC + '" name="description"/>').join('<meta content="' + D + '" name="description"/>');
    html = html.split('<meta content="' + OLD + '" property="og:title"/>').join('<meta content="' + T + '" property="og:title"/>');
    html = html.split('<meta content="' + OLD_DESC + '" property="og:description"/>').join('<meta content="' + D + '" property="og:description"/>');
    html = html.split('<meta content="' + OLD + '" name="twitter:title"/>').join('<meta content="' + T + '" name="twitter:title"/>');
    html = html.split('<meta content="' + OLD + '" name="twitter:description"/>').join('<meta content="' + D + '" name="twitter:description"/>');
    html = html.split('North Korea missile tracker, Israel Gaza war, naval asset tracker, geopolitical crisis map, military events live, conflict heat map, war casualty tracker, conflict intelligence tool, WarHeatMap, warheatmap.app, where is WW3, active wars 2026, live war news map, open source intelligence, CENTCOM tracker, naval strike group map" name="keywords"/>').join(K + '" name="keywords"/>');
    html = html.split('North Korea missiles, Israel Gaza 2026, OSINT tracker, global conflict intelligence" name="news_keywords"/>').join(NK + '" name="news_keywords"/>');
    html = html.split('<meta content="2026-03-30" name="last-modified"/>').join('<meta content="2026-05-09" name="last-modified"/>');
    const EXTRA = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is Operation Epic Fury?","acceptedAnswer":{"@type":"Answer","text":"Operation Epic Fury is the U.S. military operation launched February 28, 2026. WarHeatMap.app tracks all Operation Epic Fury events including naval operations in the Strait of Hormuz."}},{"@type":"Question","name":"What is happening in the Strait of Hormuz in 2026?","acceptedAnswer":{"@type":"Answer","text":"Iran has threatened closure of the Strait of Hormuz in response to Operation Epic Fury. WarHeatMap.app tracks all Strait of Hormuz naval incidents in real time."}},{"@type":"Question","name":"What does WarHeatMap.app track?","acceptedAnswer":{"@type":"Answer","text":"WarHeatMap.app tracks 1,000+ verified events across 16 active theaters including Operation Epic Fury, Strait of Hormuz crisis, Russia-Ukraine, Israel-Gaza/Lebanon, Sudan, Myanmar, DRC, and Red Sea Houthi operations."}}]}<\/script><script type="application/ld+json">{"@context":"https://schema.org","@type":"LiveBlogPosting","@id":"https://warheatmap.app/#liveblog","headline":"WAR 3.0: Real-Time Global Conflict Intelligence - Operation Epic Fury, Strait of Hormuz Crisis and 14 More Active Theaters","url":"https://warheatmap.app/","datePublished":"2026-02-27T00:00:00Z","dateModified":"2026-05-09T00:00:00Z","keywords":["War 3.0","WW3","Operation Epic Fury","Strait of Hormuz 2026","US Iran war 2026","global conflict","OSINT","naval assets","Russia Ukraine","Israel Gaza Lebanon"],"author":{"@type":"Organization","name":"WarHeatMap.app","url":"https://warheatmap.app"},"publisher":{"@type":"Organization","name":"WarHeatMap.app","url":"https://warheatmap.app"}}<\/script>';
    const FAB = '<style>#whm-btc-fab{position:fixed;bottom:28px;right:28px;z-index:99999;width:52px;height:52px;border-radius:50%;background:#f7931a;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);animation:btc-pulse 2.8s ease-in-out infinite;transition:transform .18s;text-decoration:none;font-family:monospace;font-size:22px;font-weight:700;color:#fff}#whm-btc-fab:hover{transform:scale(1.12)}#whm-btc-fab-tip{position:fixed;bottom:88px;right:28px;z-index:99998;background:#0a1520;border:1px solid rgba(247,147,26,0.35);color:#f7931a;font-family:monospace;font-size:9px;font-weight:700;padding:6px 10px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s}#whm-btc-fab:hover+#whm-btc-fab-tip{opacity:1}@keyframes btc-pulse{0%,100%{box-shadow:0 0 0 0 rgba(247,147,26,0),0 4px 20px rgba(0,0,0,0.5)}60%{box-shadow:0 0 0 10px rgba(247,147,26,0),0 4px 20px rgba(0,0,0,0.5)}}@media(max-width:480px){#whm-btc-fab{bottom:18px;right:16px;width:46px;height:46px}}</style><a id="whm-btc-fab" href="https://support.warheatmap.app" target="_blank" rel="noopener" title="Support WAR 3.0 with Bitcoin">&#8383;</a><div id="whm-btc-fab-tip">SUPPORT WAR 3.0 &#8383;</div>';
    html = html.replace("</head>", EXTRA + "\n</head>");
    html = html.replace("</body>", FAB + "\n</body>");
    const headers = new Headers(orig.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(html, { status: orig.status, statusText: orig.statusText, headers });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map