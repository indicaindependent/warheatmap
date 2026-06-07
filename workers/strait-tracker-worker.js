const TOKEN_WINDOW_MS = 60 * 60 * 1000;

function checkAccess(request) {
  const url = new URL(request.url);
  if (url.pathname === '/proxy') return true;
  if (url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff2?|ttf)$/)) return true;
  const referer = request.headers.get('Referer') || '';
  const origin  = request.headers.get('Origin') || '';
  if (referer.includes('warheatmap.app') || origin.includes('warheatmap.app')) return true;
  const fetchSite = request.headers.get('Sec-Fetch-Site') || '';
  if (fetchSite === 'same-origin') return true;
  const ref = url.searchParams.get('ref') || '';
  if (ref.startsWith('WHM-')) {
    try {
      const ts = parseInt(atob(ref.slice(4)), 10);
      if (!isNaN(ts) && Date.now() - ts < TOKEN_WINDOW_MS) return true;
    } catch {}
  }
  return false;
}

function getGatePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>StraitTracker — Restricted Access</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#070b12;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
.card{max-width:420px;width:100%;text-align:center}
.icon{font-size:3.5rem;margin-bottom:1rem}
.title{font-size:1.8rem;font-weight:900;letter-spacing:-0.02em;margin-bottom:0.25rem}
.title span{color:#ff3a3a}
.sub{font-size:0.75rem;color:#64748b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2.5rem}
.msg{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:2rem;margin-bottom:2rem}
.msg p{color:#e8edf2;font-size:1rem;font-weight:600;line-height:1.5;margin-bottom:0.75rem}
.msg p.sub2{color:#64748b;font-size:0.875rem;font-weight:400;line-height:1.6;margin:0}
.cta{display:inline-block;background:linear-gradient(135deg,#00c896,#00a878);color:#080c10;font-weight:700;font-size:1rem;padding:0.875rem 2.5rem;border-radius:50px;text-decoration:none;box-shadow:0 0 24px rgba(0,200,150,0.35);transition:transform 0.15s}
.cta:hover{transform:scale(1.04)}
.foot{color:#334155;font-size:0.72rem;margin-top:1.5rem}
</style>
</head>
<body>
<div class="card">
  <div class="icon">⚓</div>
  <div class="title"><span>STRAIT</span>TRACKER</div>
  <div class="sub">Hormuz OSINT Dashboard</div>
  <div class="msg">
    <p>StraitTracker is accessed through WarHeatMap.</p>
    <p class="sub2">This live naval intelligence dashboard is embedded within WarHeatMap.app. Open WarHeatMap and tap the ⚓ STRAIT TRACKER button in the layers panel.</p>
  </div>
  <a class="cta" href="https://warheatmap.app">Open WarHeatMap →</a>
  <p class="foot">warheatmap.app · Free · OSINT · Live</p>
</div>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/lf.js') return new Response(LEAFLET_JS, {headers:{'Content-Type':'application/javascript','Cache-Control':'public,max-age=86400','Access-Control-Allow-Origin':'*'}});
    if (url.pathname === '/lf.css') return new Response(LEAFLET_CSS, {headers:{'Content-Type':'text/css','Cache-Control':'public,max-age=86400','Access-Control-Allow-Origin':'*'}});
    if (url.pathname === '/proxy') return handleProxy(request, url, env);

    const ua = request.headers.get('User-Agent') || '';
    const isMobile = /Mobi/i.test(ua) && !/iPad/i.test(ua);
    if (isMobile && !url.searchParams.get('desktop')) {
      const mobileUrl = new URL(request.url);
      mobileUrl.hostname = 'mobile.tracker.warheatmap.app';
      return Response.redirect(mobileUrl.toString(), 302);
    }

    const isEmbedded = url.searchParams.get('embed') === '1';
    const isGated = !isEmbedded && !checkAccess(request);
    if (isGated) return new Response(getGatePage(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' }
    });

    return new Response(getHTML(), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "frame-ancestors 'self' https://warheatmap.app https://*.warheatmap.app https://*.base44.com https://app.base44.com https://localhost:*",
      }
    });
  }
};

async function handleProxy(request, url, env) {
  const target = url.searchParams.get('url');
  if (!target) return new Response('Missing url param', { status: 400 });
  const allowed = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com', 'api.coingecko.com'];
  try {
    const targetHost = new URL(target).hostname;
    if (!allowed.includes(targetHost)) return new Response('Domain not allowed', { status: 403 });
    const resp = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StraitTracker/1.0)', 'Accept': 'application/json' }
    });
    const data = await resp.text();
    return new Response(data, {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Strait of Hormuz Live | Operation Project Freedom | US-Iran War 2026</title>
<!-- SVG map — no external deps needed -->
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#070b12;--panel:#0d1420;--border:rgba(255,255,255,0.07);
  --red:#ff3a3a;--orange:#ff7a00;--green:#00e676;--blue:#00b4ff;
  --purple:#a855f7;--yellow:#ffd700;--teal:#00c896;
  --text:#e2e8f0;--muted:#64748b;
}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}

/* ── LAYOUT ── */
#app{display:grid;grid-template-rows:auto auto auto auto 1fr auto;grid-template-columns:340px 1fr 300px;height:100vh;gap:0;overflow:hidden}
#topbar{grid-column:1/-1;background:var(--panel);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:1rem;padding:0.5rem 1rem;flex-wrap:wrap;z-index:999}
#ticker-bar{grid-column:1/-1;background:#080d17;border-bottom:1px solid var(--border);overflow:hidden;height:32px;display:flex;align-items:center}
#left-panel{background:var(--panel);border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;gap:0;min-height:0}
#map-wrap{position:relative;background:#05090f;height:100%;min-height:300px;overflow:hidden;display:flex;flex-direction:column}
#right-panel{background:var(--panel);border-left:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;min-height:0}
#statusbar{grid-column:1/-1;background:#050810;border-top:1px solid var(--border);display:flex;align-items:center;gap:2rem;padding:0.25rem 1rem;font-size:0.7rem;color:var(--muted)}

/* ── MAP ── */
#map{display:block;width:100%;flex:1;min-height:300px}
.leaflet-container{background:#05090f}

/* ── TOPBAR ── */
.logo{font-size:1.3rem;font-weight:900;letter-spacing:-0.02em;white-space:nowrap}
.logo span{color:var(--red)}
.logo sub{font-size:0.55rem;color:var(--muted);font-weight:400;margin-left:4px}
.threat-badge{padding:0.3rem 0.85rem;border-radius:20px;font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;animation:pulsebadge 1.8s ease-in-out infinite}
@keyframes pulsebadge{0%,100%{box-shadow:0 0 0 0 rgba(255,58,58,0.5)}50%{box-shadow:0 0 0 8px rgba(255,58,58,0)}}
.badge-critical{background:rgba(255,58,58,0.2);border:1px solid var(--red);color:var(--red)}
.badge-high{background:rgba(255,122,0,0.2);border:1px solid var(--orange);color:var(--orange)}
.price-pill{display:flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:20px;padding:0.25rem 0.75rem;font-size:0.75rem}
.price-pill .label{color:var(--muted);font-size:0.65rem;text-transform:uppercase}
.price-pill .val{font-weight:700;font-family:monospace}
.price-pill .chg{font-size:0.65rem}
.chg-up{color:var(--green)}.chg-dn{color:var(--red)}.chg-flat{color:var(--muted)}
#countdown-pill{display:flex;align-items:center;gap:0.5rem;background:rgba(0,200,150,0.1);border:1px solid rgba(0,200,150,0.4);border-radius:20px;padding:0.25rem 0.85rem;font-size:0.72rem}
#countdown-pill .cd-label{color:var(--teal);font-weight:700;letter-spacing:0.06em;font-size:0.62rem;text-transform:uppercase}
#countdown-pill .cd-time{font-family:monospace;font-weight:900;color:#fff;font-size:0.85rem}
.refresh-btn{margin-left:auto;background:rgba(0,200,150,0.1);border:1px solid rgba(0,200,150,0.3);color:var(--teal);border-radius:8px;padding:0.3rem 0.75rem;font-size:0.72rem;cursor:pointer;font-weight:700;transition:background 0.15s}
.refresh-btn:hover{background:rgba(0,200,150,0.2)}
#last-refresh{font-size:0.65rem;color:var(--muted);white-space:nowrap}
#auto-refresh-badge{font-size:0.62rem;color:var(--green);background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:20px;padding:0.2rem 0.6rem;animation:pulsebadge 3s ease-in-out infinite}

/* ── TICKER ── */
#ticker-inner{display:flex;gap:3rem;white-space:nowrap;animation:ticker 90s linear infinite;padding:0 2rem;font-size:0.72rem;color:var(--muted)}
#ticker-inner span{display:inline-flex;align-items:center;gap:0.4rem}
#ticker-inner strong{color:var(--text);font-weight:600}
@keyframes ticker{0%{transform:translateX(100vw)}100%{transform:translateX(-200%)}}

/* ── LEFT PANEL ── */
.panel-section{border-bottom:1px solid var(--border);padding:0.75rem}
.panel-title{font-size:0.62rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem}
.stat-row{display:flex;align-items:center;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.stat-row:last-child{border-bottom:0}
.stat-label{font-size:0.72rem;color:var(--muted)}
.stat-val{font-size:0.8rem;font-weight:700;font-family:monospace}
.stat-val.green{color:var(--green)}.stat-val.red{color:var(--red)}.stat-val.orange{color:var(--orange)}.stat-val.blue{color:var(--blue)}.stat-val.yellow{color:var(--yellow)}.stat-val.purple{color:var(--purple)}
.layer-row{display:flex;align-items:center;justify-content:space-between;padding:0.3rem 0}
.layer-label{font-size:0.72rem;color:var(--muted)}
.toggle{width:34px;height:18px;border-radius:9px;border:none;cursor:pointer;position:relative;transition:background 0.2s}
.toggle.on{background:var(--teal)}.toggle.off{background:#1e2d42}
.toggle::after{content:'';position:absolute;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left 0.2s}
.toggle.on::after{left:18px}.toggle.off::after{left:2px}

/* ── INTEL EVENTS ── */
.event-item{padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.event-item:last-child{border-bottom:0}
.event-header{display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.25rem}
.event-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:3px}
.event-title{font-size:0.75rem;font-weight:700;color:var(--text);line-height:1.3}
.event-meta{font-size:0.67rem;color:var(--muted);line-height:1.5;margin-left:1.1rem;margin-bottom:0.2rem}
.event-src{font-size:0.6rem;color:#334155;margin-left:1.1rem}

/* ── RIGHT PANEL ── */
.intel-card{padding:0.75rem;border-bottom:1px solid var(--border)}
.intel-card:last-child{border-bottom:0}
.intel-header{display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.5rem}
.intel-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.intel-title{font-size:0.78rem;font-weight:700;color:var(--text);line-height:1.3}
.intel-body{font-size:0.7rem;color:#94a3b8;line-height:1.6;margin-bottom:0.4rem}
.intel-src{font-size:0.6rem;color:#334155}
.intel-tag{display:inline-block;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.58rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem;background:rgba(255,58,58,0.15);border:1px solid rgba(255,58,58,0.3);color:var(--red)}
.intel-tag.orange{background:rgba(255,122,0,0.15);border-color:rgba(255,122,0,0.3);color:var(--orange)}
.intel-tag.blue{background:rgba(0,180,255,0.15);border-color:rgba(0,180,255,0.3);color:var(--blue)}
.intel-tag.green{background:rgba(0,230,118,0.15);border-color:rgba(0,230,118,0.3);color:var(--green)}
.intel-tag.purple{background:rgba(168,85,247,0.15);border-color:rgba(168,85,247,0.3);color:var(--purple)}
.intel-tag.yellow{background:rgba(255,215,0,0.15);border-color:rgba(255,215,0,0.3);color:var(--yellow)}

/* ── POPUP ── */
.leaflet-popup-content-wrapper{background:#0d1420;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text);box-shadow:0 4px 20px rgba(0,0,0,0.5)}
.leaflet-popup-tip{background:#0d1420}
.popup-label{font-size:0.85rem;font-weight:800;margin-bottom:0.3rem}
.popup-status{display:inline-block;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.65rem;font-weight:700;margin-bottom:0.4rem}
.popup-detail{font-size:0.72rem;color:#94a3b8;line-height:1.6;margin-bottom:0.4rem}
.popup-src{font-size:0.62rem;color:#334155}

/* ── MAP LEGEND ── */
#legend{position:absolute;bottom:12px;left:12px;background:rgba(7,11,18,0.92);border:1px solid var(--border);border-radius:10px;padding:0.6rem 0.8rem;z-index:500;font-size:0.65rem}
.leg-row{display:flex;align-items:center;gap:0.5rem;padding:0.1rem 0;color:var(--muted)}
.leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.leg-line{width:14px;height:2px;flex-shrink:0}

/* ── STATUSBAR ── */
.sb-item{display:flex;align-items:center;gap:0.35rem}
.sb-dot{width:7px;height:7px;border-radius:50%;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.sb-dot.live{background:var(--green)}.sb-dot.warn{background:var(--orange)}.sb-dot.dead{background:var(--red)}


/* ── OP FREEDOM BANNER ── */
#op-banner{grid-column:1/-1;display:flex;align-items:center;gap:0.75rem;padding:0.4rem 1rem;font-size:0.72rem;font-weight:700;letter-spacing:0.04em;border-bottom:1px solid;transition:all 0.3s}
#op-banner.active{background:rgba(255,58,58,0.12);border-color:rgba(255,58,58,0.4);color:var(--red)}
#op-banner.paused{background:rgba(255,122,0,0.1);border-color:rgba(255,122,0,0.35);color:var(--orange)}
#op-banner.suspended{background:rgba(100,116,139,0.1);border-color:rgba(100,116,139,0.3);color:var(--muted)}
#op-banner.ended{background:rgba(0,230,118,0.08);border-color:rgba(0,230,118,0.3);color:var(--green)}
.op-icon{font-size:1.1rem;flex-shrink:0}
.op-name{font-size:0.75rem;font-weight:900;letter-spacing:0.06em}
.op-status-text{font-size:0.68rem;opacity:0.9}
.op-detail-text{font-size:0.63rem;opacity:0.7;font-weight:400;margin-left:0.5rem}
@keyframes op-pulse{0%,100%{opacity:1}50%{opacity:0.6}}
#op-banner.active .op-icon{animation:op-pulse 1.2s ease-in-out infinite}

/* ── STALE DATA WARNING ── */
#stale-warning{display:none;background:rgba(255,122,0,0.12);border-bottom:1px solid rgba(255,122,0,0.3);color:var(--orange);font-size:0.65rem;padding:0.25rem 1rem;text-align:center;grid-column:1/-1}

/* ── FRESHNESS BADGE ── */
#freshness-badge{font-size:0.6rem;color:var(--muted);padding:0.15rem 0.5rem;background:rgba(255,255,255,0.04);border-radius:3px}
#freshness-badge.fresh{color:var(--green)}
#freshness-badge.stale{color:var(--red)}

/* ── UPDATED INTEL CARD ── */
.intel-card{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;padding:0.85rem;margin-bottom:0.75rem;transition:border-color 0.2s}
.intel-card:hover{border-color:rgba(255,255,255,0.15)}
.intel-tag{display:inline-block;padding:0.15rem 0.5rem;border-radius:3px;font-size:0.6rem;font-weight:800;letter-spacing:0.08em;border:1px solid;margin-bottom:0.5rem}
.intel-header{display:flex;align-items:flex-start;gap:0.6rem;margin-bottom:0.4rem}
.intel-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0}
.intel-title{font-size:0.78rem;font-weight:700;line-height:1.3}
.intel-body{font-size:0.72rem;color:#94a3b8;line-height:1.5;margin-bottom:0.4rem}
.intel-src{font-size:0.6rem;color:#475569}

/* ── UPDATED SITREP STATS ── */
.stat-val.loading{opacity:0.4}

/* scrollbar */
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1e2d3d;border-radius:2px}
</style>
</head>
<body>
<div id="app">

<!-- STALE DATA WARNING -->
<div id="stale-warning">⚠ INTELLIGENCE DATA MAY BE DELAYED — <span id="stale-age"></span> — Retrying...</div>

<!-- OPERATION PROJECT FREEDOM BANNER -->
<div id="op-banner" class="paused">
  <span class="op-icon">⚡</span>
  <div>
    <span class="op-name">OPERATION PROJECT FREEDOM</span>
    <span class="op-status-text" id="op-status-text"> · LOADING...</span>
    <span class="op-detail-text" id="op-detail-text"></span>
  </div>
  <span id="freshness-badge" style="margin-left:auto">⟳ LOADING</span>
</div>

<!-- TOP BAR -->
<div id="topbar">
  <div class="logo"><span>STRAIT</span>TRACKER<sub>v6.1 · LIVE · MAY 28</sub></div><div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:0.4rem 0.7rem;border-radius:6px;font-size:0.7rem;font-weight:700;color:#fff;display:inline-block;margin-left:0.5rem">🟥 MOU FRAMEWORK NEGOTIATING — $24B • USS/IRGC FIRE EXCHANGE MAY 27</div>
  <div class="threat-badge badge-critical" id="threat-level">🔴 CRITICAL — LOADING LIVE INTEL...</div>
  <div id="countdown-pill">
    <span class="cd-label">WAR DAY</span>
    <span class="cd-time" id="countdown">--</span>
  </div>
  <div class="price-pill">
    <span class="label">WTI</span>
    <span class="val" id="wti-price">--</span>
    <span class="chg" id="wti-chg">--</span>
  </div>
  <div class="price-pill">
    <span class="label">BRENT</span>
    <span class="val" id="brent-price">--</span>
    <span class="chg" id="brent-chg">--</span>
  </div>
  <div class="price-pill">
    <span class="label">BTC</span>
    <span class="val" id="btc-price">--</span>
    <span class="chg" id="btc-chg">--</span>
  </div>
  <div class="price-pill">
    <span class="label">DAY</span>
    <span class="val" id="war-day">--</span>
    <span class="chg chg-dn">WAR</span>
  </div>
  <span id="auto-refresh-badge">⟳ AUTO 15m</span>
  <button class="refresh-btn" onclick="forceRefresh()">↻ NOW</button>
  <span id="last-refresh">Initializing...</span>
</div>

<!-- TICKER — Live intelligence feed -->
<div id="ticker-bar">
  <div id="ticker-inner"><span>⏳ Loading live intelligence feed...</span></div>
</div>

<!-- LEFT PANEL -->
<div id="left-panel">

  <!-- SITREP STATS -->
  <div class="panel-section">
    <div class="panel-title">📊 SITREP — <span id="sitrep-date">LOADING...</span></div>
    <div class="stat-row"><span class="stat-label">War Day</span><span class="stat-val red loading" id="war-day-stat">--</span></div>
    <div class="stat-row"><span class="stat-label">Ceasefire Status</span><span class="stat-val yellow" id="st-ceasefire">MOU TIER 1 ACTIVE — TRUMP "WON'T RUSH"</span></div>
    <div class="stat-row"><span class="stat-label">US Blockade</span><span class="stat-val red loading" id="st-blockade">LOADING...</span></div>
    <div class="stat-row"><span class="stat-label">Hormuz Status</span><span class="stat-val red loading" id="st-hormuz">LOADING...</span></div>
    <div class="stat-row"><span class="stat-label">Today: Ships Fired On</span><span class="stat-val red" id="st-fired">USS/IRGC EXCHANGE — MAY 27</span></div>
    <div class="stat-row"><span class="stat-label">Today: Ships Seized</span><span class="stat-val orange" id="st-seized">0 (24H) — MOU WINDOW</span></div>
    <div class="stat-row"><span class="stat-label">Total Vessels Interdicted</span><span class="stat-val orange" id="st-interdicted">34+ TURNED BACK (US)</span></div>
    <div class="stat-row"><span class="stat-label">Vessels Trapped in Gulf</span><span class="stat-val orange" id="st-trapped">~800</span></div>
    <div class="stat-row"><span class="stat-label">AIS-Dark VLCCs</span><span class="stat-val purple">HERO II + HEDY (4M BBL)</span></div>
    <div class="stat-row"><span class="stat-label">Iranian Tankers Crossed</span><span class="stat-val yellow">25+ (TUE MAY 26 — IRGC CLAIM)</span></div>
    <div class="stat-row"><span class="stat-label">US Navy Boardings</span><span class="stat-val blue">2 (SANCTIONED VESSELS)</span></div>
    <div class="stat-row"><span class="stat-label">Asian Waters Intercepts</span><span class="stat-val blue">3 (TODAY)</span></div>
    <div class="stat-row"><span class="stat-label">Peace Talks Status</span><span class="stat-val orange" id="st-talks">MOU PHASE 1 — TEXT NEGOTIATING ($24B)</span></div>
    <div class="stat-row"><span class="stat-label">Supply Eliminated</span><span class="stat-val red" id="st-supply">1B BARRELS</span></div>
  </div>

  <!-- LAYER CONTROLS -->
  <div class="panel-section">
    <div class="panel-title">🗺 MAP LAYERS</div>
    <div class="layer-row">
      <span class="layer-label">🟢 Safe Transit / Transited</span>
      <button class="toggle on" id="t-tankers" onclick="toggleLayer('tankers',this)"></button>
    </div>
    <div class="layer-row">
      <span class="layer-label">🔴 Seized / Fired Upon</span>
      <button class="toggle on" id="t-interdicted" onclick="toggleLayer('interdicted',this)"></button>
    </div>
    <div class="layer-row">
      <span class="layer-label">🔵 US Navy Assets</span>
      <button class="toggle on" id="t-navy" onclick="toggleLayer('navy',this)"></button>
    </div>
    <div class="layer-row">
      <span class="layer-label">🟣 AIS-Dark Contacts</span>
      <button class="toggle on" id="t-dark" onclick="toggleLayer('dark',this)"></button>
    </div>
    <div class="layer-row">
      <span class="layer-label">🔴 IRGCN Assets</span>
      <button class="toggle on" id="t-iran" onclick="toggleLayer('iran',this)"></button>
    </div>
    <div class="layer-row">
      <span class="layer-label">🟡 Mine Fields / Zones</span>
      <button class="toggle on" id="t-mines" onclick="toggleLayer('mines',this)"></button>
    </div>
    <div class="layer-row">
      <span class="layer-label">Transit Lanes</span>
      <button class="toggle on" id="t-lanes" onclick="toggleLayer('lanes',this)"></button>
    </div>
  </div>

  <!-- INTEL EVENTS -->
  <div class="panel-section" style="flex:1">
    <div class="panel-title">📡 INTEL EVENTS</div>
    <div id="intel-events"></div>
  </div>
</div>

<!-- MAP -->
<div id="map-wrap">
  <div id="map"></div>
  <div id="legend">
    <div class="leg-row"><div class="leg-dot" style="background:#00e676"></div> Safe Transit</div>
    <div class="leg-row"><div class="leg-dot" style="background:#ff7a00"></div> Turned Back</div>
    <div class="leg-row"><div class="leg-dot" style="background:#ff3a3a"></div> Seized / Fired Upon</div>
    <div class="leg-row"><div class="leg-dot" style="background:#00b4ff"></div> US Navy / Coalition</div>
    <div class="leg-row"><div class="leg-dot" style="background:#a855f7"></div> AIS-Dark Contact</div>
    <div class="leg-row"><div class="leg-dot" style="background:#ff3a3a;opacity:0.5"></div> IRGCN Asset</div>
    <div class="leg-row"><div class="leg-dot" style="background:#ffd700"></div> Mine Zone</div>
  </div>
</div>

<!-- RIGHT PANEL — INTEL BRIEFS -->
<div id="right-panel">
  <div style="padding:0.6rem 0.75rem;font-size:0.62rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)">📰 INTEL BRIEFS</span></div><div id="intel-briefs"><span id="intel-updated" style="font-size:0.55rem;font-weight:400;color:#334155;font-family:monospace">LIVE</span></div>

  <div class="intel-card">
    <div class="intel-tag">FLASH — TODAY</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(255,58,58,0.15)">🚢</div><div class="intel-title">IRGC Seizes MSC Francesca + Epaminondas</div></div>
    <div class="intel-body">Iran's Revolutionary Guard fired on 3 ships in Hormuz, seizing <strong>MSC Francesca</strong> (container ship) and <strong>Epaminondas</strong> (container ship). Third vessel, <strong>MV Euphoria</strong>, was also attacked. IRGCN brought both seized ships to shore "for inspection." UK Maritime Trade Operations (UKMTO) confirmed: container ship hit at 02:55 UTC — heavy bridge damage. Cargo ship stopped after fire ~3hrs later. Iran called seizures retaliation for US "capture" of Iranian commercial vessel.</div>
    <div class="intel-src">UKMTO / Reuters / WSJ / Iranian state media — April 22, 2026</div>
  </div>

  <div class="intel-card">
    <div class="intel-tag">FLASH — TODAY</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(168,85,247,0.15)">🛢</div><div class="intel-title">Hero II + Hedy Supertankers Go Dark</div></div>
    <div class="intel-body">Two Iranian VLCCs — <strong>Hero II</strong> and <strong>Hedy</strong> — entered the Arabian Sea with AIS transponders OFF, carrying <strong>~4 million barrels</strong> combined. Vortexa used satellite imagery to confirm positions. A third VLCC, the <strong>Diona</strong>, appeared to turn back. The tankers last broadcast positions in Feb-Mar 2026. Ultimate destination unclear — likely China. US Navy has pledged to intercept any sanctioned vessels regardless of location. Vessels not yet in the clear.</div>
    <div class="intel-src">Vortexa / Bloomberg / TankerTrackers.com — April 22, 2026</div>
  </div>

  <div class="intel-card">
    <div class="intel-tag blue">TODAY</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(0,180,255,0.15)">🇺🇸</div><div class="intel-title">US Intercepts 3 Iranian Tankers in Asian Waters</div></div>
    <div class="intel-body">The US military intercepted at least <strong>3 Iranian-flagged tankers</strong> in Asian waters and is redirecting them, per Reuters exclusive sources. The intercept zone has expanded well beyond Hormuz — US is now targeting Iranian shipping across the Indo-Pacific. The USS boarding of an oil tanker in the Indian Ocean last week showed Washington making good on its pledge to track Iran-linked vessels globally. Iran called it "piracy on the high seas."</div>
    <div class="intel-src">Reuters Exclusive / CNN / Al Jazeera — April 22, 2026</div>
  </div>

  <div class="intel-card">
    <div class="intel-tag green">CEASEFIRE UPDATE</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(0,230,118,0.15)">🕊</div><div class="intel-title">Trump Extends Ceasefire Indefinitely — Blockade Stays</div></div>
    <div class="intel-body">President Trump announced the US will <strong>indefinitely extend the ceasefire</strong> with Iran — but the US naval blockade remains fully in place. Iran says it has <strong>"yet to decide"</strong> whether to join new peace talks. Around <strong>800 vessels remain trapped</strong> in the Persian Gulf. The International Maritime Organization says it's working on an evacuation plan contingent on de-escalation. Asian shipowners may begin crossing before Western firms — they have higher risk tolerance and can pay potential Iranian tolls.</div>
    <div class="intel-src">AP / CNBC / gCaptain / IMO — April 22, 2026</div>
  </div>

  <div class="intel-card">
    <div class="intel-tag orange">SUPPLY SHOCK</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(255,122,0,0.15)">💣</div><div class="intel-title">1 Billion Barrels Eliminated — Dual Blockade Holds</div></div>
    <div class="intel-body">Top traders estimate the Iran war has <strong>eliminated 1 billion barrels</strong> of oil supply. Ship traffic is still far below the pre-war norm of <strong>100+ vessels/day</strong> through Hormuz. At least 34 Iran-linked tankers + gas carriers have crossed the blockade line since early last week, 17 carrying cargo — but many using ghost fleet tactics (AIS off, transponders dark, alternate routes). Washington initially encouraged Iranian barrels to flow to contain prices, then reversed with blockade on April 13.</div>
    <div class="intel-src">Bloomberg / CNBC / gCaptain — April 22, 2026</div>
  </div>

  <div class="intel-card">
    <div class="intel-tag purple">M/V TOUSKA — PRIOR</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(168,85,247,0.15)">⚓</div><div class="intel-title">Touska Seizure — Marines Rappel Aboard (Apr 19-20)</div></div>
    <div class="intel-body">USS Spruance (DDG-111) fired on engine room of Iranian-flagged <strong>M/V Touska</strong> after 6-hour standoff in Gulf of Oman. US Marines rappelled from <strong>USS Tripoli (LHA-7)</strong>. Ship under US Treasury sanctions. Iran's Khatam al-Anbiya HQ vowed retaliation. Today's seizures appear to be direct response. Iran Al Jazeera piece: "Iran calls US ship seizure piracy — is it?"</div>
    <div class="intel-src">CENTCOM / Truth Social / J-Post — April 19-20, 2026</div>
  </div>

  <div class="intel-card">
    <div class="intel-tag yellow">OIL MARKETS</div>
    <div class="intel-header"><div class="intel-icon" style="background:rgba(255,215,0,0.15)">📈</div><div class="intel-title">Oil Prices — Hormuz Barometer</div></div>
    <div class="intel-body">The number of ships passing through Hormuz has become a <strong>real-time barometer</strong> of how the war is affecting global energy. NYT: "Iran Again Tightens Its Grip on Shipping." Petroleum-derived products — clothes, crayons, plastics — seeing cost pressure. Netherlands gov spending <strong>$1.1B</strong> to offset fuel costs. India cut off from Iranian crude after US waiver expired. Oil prices updating live in topbar above.</div>
    <div class="intel-src">NYT / CNBC / Al Jazeera — April 22, 2026</div>
  </div>
</div>

<!-- STATUSBAR -->
<div id="statusbar">
  <div class="sb-item"><div class="sb-dot live"></div><span id="sb-vessels">Vessels: loading...</span></div>
  <div class="sb-item"><div class="sb-dot live"></div><span id="sb-prices">Prices: loading...</span></div>
  <div class="sb-item"><div class="sb-dot warn"></div><span>Data: OSINT · Reuters · AP · gCaptain · Bloomberg</span></div>
  <div class="sb-item" style="margin-left:auto"><span id="sb-time">--</span></div>
</div>
</div>

<script>

  // ── WAR DAY COUNTER ─────────────────────────────────────────────
  var WAR_START_DATE = new Date('2026-02-27T00:00:00Z');
  function updateWarDay() {
    var dayNum = Math.floor((Date.now() - WAR_START_DATE.getTime()) / 86400000);
    var el = document.getElementById('war-day-pill');
    if (el) el.textContent = 'WAR DAY ' + dayNum;
    var el2 = document.getElementById('sb-war-day');
    if (el2) el2.textContent = 'Day ' + dayNum;
    // Also update any element with id="war-day" or id="war-day-stat"
    var wd = document.getElementById('war-day');
    if (wd) wd.textContent = dayNum;
    var wds = document.getElementById('war-day-stat');
    if (wds) wds.textContent = dayNum;
    var cd = document.getElementById('countdown');
    if (cd) cd.textContent = dayNum;
    return dayNum;
  }

  // ── PRICE CACHE (once per day) ───────────────────────────────────
  var PRICE_CACHE_KEY = 'strait_prices_v1';
  var PRICE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  function getPriceCache() {
    try {
      var raw = localStorage.getItem(PRICE_CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.ts) return null;
      if (Date.now() - obj.ts > PRICE_CACHE_TTL) return null; // stale
      return obj;
    } catch(e) { return null; }
  }

  function setPriceCache(data) {
    try {
      localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch(e) {}
  }

  function applyPrices(prices) {
    function setPrice(priceId, chgId, price, change) {
      var pe = document.getElementById(priceId);
      var ce = document.getElementById(chgId);
      if (pe && price) pe.textContent = '$' + parseFloat(price).toFixed(2);
      if (ce && change !== undefined && change !== null) {
        var chg = parseFloat(change);
        ce.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
        ce.className = 'chg ' + (chg >= 0 ? 'up' : 'down');
      }
    }
    if (prices.brent)  setPrice('brent-price','brent-chg', prices.brent, prices.brent_change);
    if (prices.wti)    setPrice('wti-price','wti-chg', prices.wti, prices.wti_change);
    if (prices.btc)    setPrice('btc-price','btc-chg', prices.btc, prices.btc_change);
    // Update statusbar
    var sb = document.getElementById('sb-prices');
    if (sb && prices.brent && prices.wti) {
      sb.textContent = 'Brent $' + parseFloat(prices.brent).toFixed(2) + ' | WTI $' + parseFloat(prices.wti).toFixed(2) + (prices.btc ? ' | BTC $' + Math.round(parseFloat(prices.btc)).toLocaleString() : '');
    }
    // Topbar uses id="wti-price", "brent-price", "btc-price" — already set by setPrice() above
  }

  function fetchPricesFromAPI() {
    // Get oil from our intel API (pre-fetched server-side) — avoids CORS entirely
    fetch(INTEL_API + '/oil-live')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var prices = {
          brent: d.brent || d.brent_price,
          brent_change: d.brent_change,
          wti: d.wti || d.wti_price,
          wti_change: d.wti_change,
          btc: d.btc,
          btc_change: d.btc_change
        };
        // Also check if intel payload already has oil
        if (!prices.brent && d.oil) {
          prices.brent = d.oil.brent;
          prices.wti = d.oil.wti;
        }
        applyPrices(prices);
        setPriceCache(prices);
      })
      .catch(function(e) {
        console.warn('[StraitTracker] Price fetch failed:', e);
        // Try to use prices from cached intel
        try {
          var cached = JSON.parse(localStorage.getItem('strait_intel_v3') || 'null');
          if (cached && cached.oil) applyPrices({ brent: cached.oil.brent, wti: cached.oil.wti });
        } catch(ee) {}
      });
  }

  function refreshPrices() {
    // Check daily cache first
    var cached = getPriceCache();
    if (cached) {
      applyPrices(cached.data);
      console.log('[StraitTracker] Prices loaded from daily cache');
      return;
    }
    // Cache stale or missing — fetch fresh
    console.log('[StraitTracker] Fetching fresh prices from API...');
    fetchPricesFromAPI();
  }

  function autoRefresh() {
    // Called every 5 min for non-price data; prices refresh once per day
    var priceCache = getPriceCache();
    if (!priceCache) fetchPricesFromAPI(); // only re-fetch prices if cache expired
    // Always re-check freshness badge
    try {
      var c = JSON.parse(localStorage.getItem('strait_intel_v3') || 'null');
      if (c && c.updated) updateFreshnessBadge(c.updated);
    } catch(e) {}
  }

  function updateStatusbar() {
    // Set vessels count from current data
    var sb = document.getElementById('sb-vessels');
    if (sb) sb.textContent = 'Vessels: 34+ turned back';
  }

  function forceRefresh() {
    // Clear price cache to force re-fetch
    localStorage.removeItem(PRICE_CACHE_KEY);
    // Show loading state
    var pb = document.getElementById('brent-price');
    var pw = document.getElementById('wti-price');
    if (pb) pb.textContent = '...';
    if (pw) pw.textContent = '...';
    // Re-fetch everything
    loadLiveIntel();
    fetchPricesFromAPI();
    updateWarDay();
    // Flash NOW button
    var btn = document.querySelector('.refresh-btn');
    if (btn) {
      btn.textContent = '⟳ FETCHING...';
      setTimeout(function() { btn.textContent = '↻ NOW'; }, 3000);
    }
  }


  window.addEventListener("load", function() {
  const PROXY = '/proxy?url=';
  // War started late Feb 2026 (~Feb 27)
  const WAR_START = new Date('2026-02-27T00:00:00Z');
  
  // ═══════════════════════════════════════════════════════════════
  // VESSEL + ASSET DATA — April 22, 2026
  // ═══════════════════════════════════════════════════════════════
  const ASSETS = {
    tankers: [
      {
        lat:26.45, lng:56.95, label:'Chinese VLCC Alpha', flag:'CN', status:'TRANSITED MAY 20',
        color:'#00e676',
        detail:'CHINESE SUPERTANKER #1 — One of two Chinese VLCCs that exited the Strait of Hormuz on May 20, 2026 carrying ~2 million barrels of crude. Combined with sister vessel, China extracted 4M barrels — the largest single-day blockade-easing signal since the war began. Indicates tentative diplomatic thaw post Trump-Xi Beijing summit (May 14-15).',
        src:'Reuters / Gulf News — May 20, 2026'
      },
      {
        lat:26.41, lng:56.92, label:'Chinese VLCC Bravo', flag:'CN', status:'TRANSITED MAY 20',
        color:'#00e676',
        detail:'CHINESE SUPERTANKER #2 — Sister vessel to Alpha. Both exited Hormuz May 20 carrying combined ~4M barrels. Vance + Trump simultaneously talking up Iran deal prospects same day.',
        src:'Reuters — May 20, 2026'
      },
      {
        lat:26.50, lng:56.85, label:'India-bound Crude Carrier', flag:'IN', status:'INBOUND',
        color:'#00b0ff',
        detail:'INDIA SECURES SUPPLY — New Delhi announces dispatch of oil tankers through Strait of Hormuz to secure crude supply amid Iran-conflict disruptions. Third-largest Iranian oil customer historically positioning to capitalize on transit thaw.',
        src:'Times of India — May 20, 2026'
      },
      {
        lat:26.32, lng:57.1, label:'Rich Starry', flag:'SG', status:'TRANSITED',
        color:'#00e676',
        detail:'Singapore-flagged VLCC. First confirmed transit through blockade corridor — May 20, 2026. Vessel was already at sea when blockade declared, not departing Iranian port. Opened the "loophole" debate.',
        src:'Reuters / MarineTraffic — April 14, 2026'
      },
      {
        lat:26.4, lng:56.1, label:'Al Salam', flag:'SA', status:'SAFE TRANSIT',
        color:'#00e676',
        detail:'Saudi Aramco-chartered VLCC. Non-Iranian port of origin. Transited southbound via non-blockaded corridor. Confirms blockade applies only to vessels bound for Iranian ports.',
        src:'Ship tracking / Reuters — April 14, 2026'
      },
      {
        lat:26.22, lng:57.4, label:'Emirates Star', flag:'AE', status:'SAFE TRANSIT',
        color:'#00e676',
        detail:'UAE-flagged LPG carrier. Cleared transit corridor unimpeded. UAE-origin cargo, no Iranian port destination.',
        src:'Ship tracking — April 13, 2026'
      },
    ],
    interdicted: [
      {
        lat:23.5, lng:62.0, label:'Iran-Linked Tanker', flag:'IR', status:'SEIZED MAY 19',
        color:'#ff3a3a',
        detail:'INDIAN OCEAN SEIZURE — US Navy intercepted and seized Iranian-affiliated oil tanker in Indian Ocean (WSJ exclusive). Treasury economic-pressure track running parallel to Trump deal rhetoric. Demonstrates sanctions enforcement continues despite summit talk.',
        src:'WSJ exclusive — May 19, 2026'
      },
      {
        lat:26.35, lng:56.8, label:'MSC Francesca', flag:'--', status:'SEIZED',
        color:'#ff3a3a',
        detail:'SEIZED APR 22: Container ship fired on and seized by Iranian Revolutionary Guard Corps in Strait of Hormuz. IRGCN brought vessel to shore "for inspection." Part of coordinated attack on 3 vessels. UKMTO confirmed attack at 02:55 UTC. Iran claims seizure was retaliation for US capture of Iranian vessel.',
        src:'Reuters / UKMTO / WSJ / Iranian state media — April 22, 2026'
      },
      {
        lat:26.28, lng:56.6, label:'Epaminondas', flag:'--', status:'SEIZED',
        color:'#ff3a3a',
        detail:'SEIZED APR 22: Second container ship seized by IRGCN in same Hormuz operation as MSC Francesca. Brought to shore for "inspection." Third vessel in coordinated attack was MV Euphoria (attacked but outcome unclear). Seizures represent significant IRGCN escalation — first major dual seizure since war began.',
        src:'Reuters / UKMTO / Iranian state media — April 22, 2026'
      },
      {
        lat:26.15, lng:56.9, label:'MV Euphoria', flag:'--', status:'UNDER THREAT',
        color:'#ff7a00',
        detail:'ATTACKED APR 22: Third vessel in coordinated IRGCN attack. Fired upon in Strait of Hormuz. Cargo ship came to a stop after being fired upon ~3 hours after the MSC Francesca attack (approx 05:55 UTC). UKMTO confirmed: not damaged but stopped.',
        src:'WSJ / UKMTO — April 22, 2026'
      },
      {
        lat:25.2, lng:57.1, label:'M/V Touska', flag:'IR', status:'SEIZED',
        color:'#ff3a3a',
        detail:'SEIZED APR 19-20: Iranian-flagged cargo ship under US Treasury sanctions. USS Spruance (DDG-111) fired on engine room after 6-hour standoff in Gulf of Oman. US Marines rappelled from USS Tripoli (LHA-7). Iran\u2019s Khatam al-Anbiya vows retaliation — today\u2019s IRGC seizures appear to be direct response.',
        src:'CENTCOM / Truth Social / J-Post — April 19-20, 2026'
      },
      {
        lat:26.18, lng:56.4, label:'BW Larimar', flag:'NO', status:'TURNED BACK',
        color:'#ff7a00',
        detail:'Norwegian-flagged LNG carrier. Intercepted by USS Gravely (DDG-107) on April 12. Bound for Bandar Abbas. Returned to UAE anchorage off Fujairah.',
        src:'CENTCOM Press Release — April 13, 2026'
      },
      {
        lat:26.55, lng:57.8, label:'Pacific Zircon', flag:'MH', status:'TURNED BACK',
        color:'#ff7a00',
        detail:'Marshall Islands-flagged crude carrier. Intercepted northeast of Hormuz on April 11. Diverted away from Iranian waters.',
        src:'CENTCOM — April 13, 2026'
      },
      {
        lat:26.1, lng:57.6, label:'Hafnia Lise', flag:'DK', status:'TURNED BACK',
        color:'#ff7a00',
        detail:'Danish-flagged product tanker. Interdicted inbound to Bandar Abbas. Diverted to Fujairah anchorage.',
        src:'CENTCOM — April 13, 2026'
      },
      {
        lat:25.7, lng:57.8, label:'Indian Vessels (2)', flag:'IN', status:'UNDER THREAT',
        color:'#ff3a3a',
        detail:'TWO Indian-flagged vessels attacked by Iran Apr 19-20. Part of escalating Iranian response to US blockade. India monitoring situation.',
        src:'ABC News — April 20, 2026'
      },
    ],
    darkFleet: [
      {
        lat:23.5, lng:59.8, label:'VLCC Hero II — AIS DARK', color:'#a855f7',
        detail:'APRIL 22: Iranian supertanker carrying ~2M barrels with AIS OFF. Entered Arabian Sea from Gulf of Oman April 20 per Vortexa satellite imagery. Ultimate destination unclear — likely China. US has pledged to intercept sanctioned vessels regardless of location. Last broadcast: 1+ month ago in Strait of Malacca.',
        src:'Vortexa / Bloomberg / TankerTrackers.com — April 22, 2026'
      },
      {
        lat:22.8, lng:60.5, label:'VLCC Hedy — AIS DARK', color:'#a855f7',
        detail:'APRIL 22: Second Iranian supertanker carrying ~2M barrels with AIS OFF. Confirmed in Arabian Sea by satellite. Last broadcast position: off Khor Fakkan (UAE) late February. Together with Hero II = 4M barrels attempting to evade US blockade.',
        src:'Vortexa / Bloomberg — April 22, 2026'
      },
      {
        lat:25.4, lng:58.2, label:'VLCC Diona — TURNED BACK?', color:'#a855f7',
        detail:'Iranian VLCC that appeared to enter Arabian Sea then turned back per TankerTrackers.com. May have been deterred by US Navy presence. AIS status unclear.',
        src:'TankerTrackers.com — April 22, 2026'
      },
      {
        lat:26.5, lng:57.9, label:'AIS-DARK Contact Alpha', color:'#a855f7',
        detail:'Unidentified vessel, AIS transponder off. SAR satellite detection April 19. Estimated course: Chabahar outbound. Suspected Chinese-chartered Iranian crude carrier operating in shadow fleet mode.',
        src:'TankerTrackers.com SAR — April 19, 2026'
      },
      {
        lat:14.2, lng:67.5, label:'3 Tankers Intercepted (Asian Waters)', color:'#a855f7',
        detail:'APRIL 22 EXCLUSIVE: US military intercepted at least 3 Iranian-flagged tankers in Asian waters. Redirecting away from destinations per Reuters. US enforcement has expanded well beyond Hormuz into the Indo-Pacific. Location approximate.',
        src:'Reuters Exclusive — April 22, 2026'
      },
    ],
    navy: [
      {
        lat:26.10, lng:57.50, label:'USS Makin Island (LHD-8)', flag:'US', status:'PREP-FOR-DEPLOY',
        color:'#00b0ff',
        detail:'USS MAKIN ISLAND — Wasp-class amphibious assault ship being prepared for Persian Gulf deployment as of May 19. Would add amphibious capability to existing 20-warship Iran-blockade force.',
        src:'National Interest / USNI News — May 19, 2026'
      },
      {
        lat:25.80, lng:57.20, label:'USS Gerald R. Ford (CVN-78)', flag:'US', status:'IN-THEATER',
        color:'#00b0ff',
        detail:'USS GERALD R. FORD — Primary carrier on Hormuz station. USS Eisenhower remains at Norfolk Naval Shipyard after April fire (not deployable). USS Nimitz on circumnavigation home via Rio per USNI May 18 fleet tracker.',
        src:'USNI Fleet Tracker — May 18, 2026'
      },
      {
        lat:25.6, lng:57.5, label:'USS Gravely (DDG-107)', type:'Arleigh Burke Destroyer',
        color:'#00b4ff',
        detail:'Primary intercept vessel — confirmed 3+ tanker intercepts. Hormuz patrol rotation. BW Larimar intercept confirmed April 12. Arleigh Burke-class guided-missile destroyer.',
        src:'CENTCOM / USNI — April 2026'
      },
      {
        lat:25.3, lng:57.2, label:'USS Spruance (DDG-111)', type:'Arleigh Burke Destroyer',
        color:'#00b4ff',
        detail:'KEY VESSEL: Fired on M/V Touska engine room April 19, enabling Marine boarding. Also participating in post-seizure enforcement ops.',
        src:'CENTCOM — April 19-20, 2026'
      },
      {
        lat:25.0, lng:57.4, label:'USS Tripoli (LHA-7)', type:'America-class Amphibious Assault',
        color:'#00b4ff',
        detail:'Amphibious assault ship. Launched Marine helicopters for Touska boarding. Carries Marine Expeditionary Unit. Critical for any future boarding operations.',
        src:'CENTCOM — April 19-20, 2026'
      },
      {
        lat:25.9, lng:56.9, label:'USS Cole (DDG-67)', type:'Arleigh Burke Destroyer',
        color:'#00b4ff',
        detail:'Second intercept destroyer on Hormuz patrol. Conducting routine enforcement operations.',
        src:'USNI — April 2026'
      },
      {
        lat:24.5, lng:58.0, label:'USV Mine Clearance Ops', type:'Autonomous Surface Vehicles',
        color:'#00c896',
        detail:'US autonomous sea drones conducting active mine-clearance in Hormuz and Gulf of Oman approaches. Iranian mines remain highest-risk threat to commercial shipping.',
        src:'J-Post — April 21, 2026'
      },
      {
        lat:7.5, lng:74.2, label:'US Navy — Indian Ocean Boarding', type:'Guided Missile Destroyer',
        color:'#00b4ff',
        detail:'APRIL 21: US Navy boarded sanctioned oil tanker in Indian Ocean east of Sri Lanka. Shows Washington expanding enforcement zone across the Indo-Pacific. Three more Iranian tankers intercepted in Asian waters April 22.',
        src:'CNN / Reuters — April 21-22, 2026'
      },
    ],
    iran: [
      {
        lat:27.1, lng:56.3, label:'IRGCN Fast Boat Group', color:'#ff3a3a',
        detail:'ACTIVE APR 22: IRGCN fast attack boats conducted coordinated strike on 3 vessels in Hormuz. MSC Francesca and Epaminondas seized. Iran says operating under orders from IRGCN command in response to US blockade enforcement.',
        src:'Iranian state media / UKMTO — April 22, 2026'
      },
      {
        lat:27.35, lng:56.7, label:'Bandar Abbas Naval Base', color:'#ff3a3a',
        detail:'Primary Iranian naval base. IRGCN operating base for Hormuz interdiction. Seized vessels brought here for "inspection." All commercial vessel traffic to/from Bandar Abbas subject to US blockade.',
        src:'CENTCOM — ongoing'
      },
      {
        lat:27.05, lng:55.95, label:'Hormuz Island Battery', color:'#ff3a3a',
        detail:'Iranian coastal defense on Hormuz Island. Surface-to-ship missile batteries cover transit lane approaches. Mines reportedly laid in adjacent approaches.',
        src:'ISW / OSINT — April 2026'
      },
    ],
    mines: [
      {
        lat:26.45, lng:56.55, label:'Mine Zone Alpha', color:'#ffd700',
        detail:'Suspected Iranian mine field in western Hormuz approaches. US sea drones conducting active clearance. Commercial vessels advised to use eastern transit corridor.',
        src:'J-Post / maritime advisories — April 21, 2026'
      },
      {
        lat:26.3, lng:57.55, label:'Mine Zone Bravo', color:'#ffd700',
        detail:'Second suspected mine concentration near eastern narrows. ISR assets monitoring. Sea drone clearance ongoing.',
        src:'Maritime advisories — April 20, 2026'
      },
    ],
  };
  
  // ═══════════════════════════════════════════════════════════════
  // INTEL EVENT FEED — April 22 UPDATED
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // LIVE INTEL FEED — Auto-refreshes every 15 minutes
  // Source: strait-news-worker (Claude + NewsAPI aggregation)
  // ═══════════════════════════════════════════════════════════════
  const INTEL_API = 'https://strait-news-worker.thom-rvr.workers.dev';
  const TAG_COLORS = {
    red:    'rgba(255,58,58,0.15)',
    orange: 'rgba(255,122,0,0.15)',
    blue:   'rgba(0,180,255,0.15)',
    green:  'rgba(0,230,118,0.15)',
    purple: 'rgba(168,85,247,0.15)',
    yellow: 'rgba(255,215,0,0.15)',
  };
  const TAG_TEXT = {
    red:'var(--red)',orange:'var(--orange)',blue:'var(--blue)',
    green:'var(--green)',purple:'var(--purple)',yellow:'var(--yellow)'
  };
  const TAG_BORDER = {
    red:'rgba(255,58,58,0.3)',orange:'rgba(255,122,0,0.3)',blue:'rgba(0,180,255,0.3)',
    green:'rgba(0,230,118,0.3)',purple:'rgba(168,85,247,0.3)',yellow:'rgba(255,215,0,0.3)'
  };

  function renderIntelCards(items) {
    var container = document.getElementById('intel-briefs');
    if (!container || !items || !items.length) return;
    container.innerHTML = '';
    items.forEach(function(ev) {
      var col = ev.tag_color || 'red';
      var html = '<div class="intel-card">';
      html += '<div class="intel-tag" style="background:'+TAG_COLORS[col]+';border-color:'+TAG_BORDER[col]+';color:'+TAG_TEXT[col]+'">'+ev.tag+'</div>';
      html += '<div class="intel-header">';
      html += '<div class="intel-icon" style="background:'+TAG_COLORS[col]+'">'+ev.icon+'</div>';
      html += '<div class="intel-title">'+ev.title+'</div>';
      html += '</div>';
      html += '<div class="intel-body">'+ev.body+'</div>';
      html += '<div class="intel-src">'+ev.source+' — '+ev.date+'</div>';
      html += '</div>';
      container.innerHTML += html;
    });
  }

  function renderTicker(tickers) {
    var inner = document.getElementById('ticker-inner');
    if (!inner || !tickers || !tickers.length) return;
    inner.innerHTML = tickers.map(function(t){ return '<span>'+t+'</span>'; }).join('');
  }

  function updateStats(status, oil, stats, warDay) {
    function set(id, val) { var el=document.getElementById(id); if(el&&val!==undefined&&val!==null) { el.textContent=val; el.classList.remove('loading'); } }
    if (warDay) {
      set('war-day', warDay);
      set('war-day-stat', warDay);
      // Update countdown pill
      var cd = document.getElementById('countdown');
      if (cd) cd.textContent = warDay;
    }
    if (status) {
      // Update topbar threat badge
      var tb = document.getElementById('threat-level');
      if (tb) {
        var lvl = (status.threat_level || 'HIGH').toUpperCase();
        var emoji = {CRITICAL:'🔴',HIGH:'🟠',ELEVATED:'🟡',MODERATE:'🟢',LOW:'🟢'}[lvl] || '🔴';
        tb.textContent = emoji + ' ' + lvl + ' — ' + (status.summary_one_line || '').slice(0,60);
        tb.className = 'threat-badge badge-' + lvl.toLowerCase();
      }
      // Stat rows — map new field names + old field names
      set('st-ceasefire', status.ceasefire || status.ceasefire_status);
      set('st-blockade', status.blockade || status.blockade_status);
      set('st-hormuz', status.hormuz || status.hormuz_status);
      set('st-talks', status.talks || status.peace_talks);
      set('st-supply', status.supply_eliminated);
      set('st-trapped', (stats && stats.vessels_trapped) || status.vessels_trapped);
    }
    if (stats) {
      set('st-trapped', stats.vessels_trapped);
      if (stats.seafarers_trapped) {
        var srEl = document.getElementById('st-seafarers');
        if (!srEl) {
          // Insert new stat row if doesn't exist
          var lastRow = document.querySelector('#left-panel .stat-row:last-of-type');
          if (lastRow) {
            var newRow = document.createElement('div');
            newRow.className = 'stat-row';
            newRow.innerHTML = '<span class="stat-label">Seafarers Affected</span><span class="stat-val orange" id="st-seafarers">'+stats.seafarers_trapped+'</span>';
            lastRow.parentNode.insertBefore(newRow, lastRow.nextSibling);
          }
        } else { srEl.textContent = stats.seafarers_trapped; }
      }
    }
    if (oil) {
      // Update price pills
      function setPrice(id, chgId, val, chg) {
        var el=document.getElementById(id), cel=document.getElementById(chgId);
        if(el&&val) el.textContent='$'+parseFloat(val).toFixed(2);
        if(cel&&chg) { cel.textContent=chg; cel.className='chg '+(chg.startsWith('+')?'chg-up':(chg.startsWith('-')?'chg-dn':'chg-flat')); }
      }
      applyPrices({ brent: oil.brent, brent_change: oil.brent_change, wti: oil.wti, wti_change: oil.wti_change });
      // Status bar prices
      var sb=document.getElementById('sb-prices');
      if(sb&&oil.brent) sb.textContent='Brent $'+parseFloat(oil.brent).toFixed(2)+' | WTI $'+(oil.wti?parseFloat(oil.wti).toFixed(2):'--');
    }
  }

  function updateIntelTimestamp(ts) {
    var el = document.getElementById('intel-updated');
    if (el && ts) {
      var d = new Date(ts);
      el.textContent = 'UPDATED ' + d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'America/New_York'}) + ' ET';
    }
  }

  // ── OFFLINE CACHE ──
  var CACHE_KEY = 'strait_intel_v3';
  function loadCachedIntel() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c) { renderAll(c); console.log('[StraitTracker] Rendered from localStorage cache'); }
    } catch(e) {}
  }

  function renderAll(d) {
    // Events / intel cards
    if (d.events && d.events.length) renderIntelCards(d.events);
    else if (d.items && d.items.length) renderIntelCards(d.items);
    // Ticker
    if (d.ticker && d.ticker.length) renderTicker(d.ticker);
    // Stats / status
    updateStats(d.status, d.oil, d.stats, d.war_day);
    // Operation Freedom banner
    if (d.operation) updateOpBanner(d.operation);
    // Freshness badge
    if (d.updated) updateFreshnessBadge(d.updated);
    // Sitrep date
    var sd = document.getElementById('sitrep-date');
    if (sd && d.updated) {
      var dt = new Date(d.updated);
      sd.textContent = dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}).toUpperCase() + ' ' + dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'America/New_York'}) + ' ET';
    }
  }

  function loadLiveIntel() {
    fetch(INTEL_API + '/intel')
      .then(function(r){ return r.json(); })
      .then(function(d) {
        renderAll(d);
        // Save to localStorage
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch(e) {}
        // Clear stale warning
        var sw = document.getElementById('stale-warning');
        if (sw) sw.style.display = 'none';
      })
      .catch(function(e){
        console.warn('[StraitTracker] Intel fetch error:', e);
        // Show stale warning
        var sw = document.getElementById('stale-warning');
        if (sw) sw.style.display = 'block';
        var sa = document.getElementById('stale-age');
        if (sa) sa.textContent = 'fetch failed — using cached data';
      });
  }

  function updateOpBanner(op) {
    var banner = document.getElementById('op-banner');
    var statusEl = document.getElementById('op-status-text');
    var detailEl = document.getElementById('op-detail-text');
    if (!banner) return;
    var colorMap = { 'active':'active', 'paused':'paused', 'suspended':'suspended', 'ended':'ended', 'red':'active', 'orange':'paused', 'yellow':'paused', 'green':'ended' };
    var cls = colorMap[(op.color || op.status || '').toLowerCase()] || 'paused';
    banner.className = cls;
    if (statusEl) statusEl.textContent = ' · ' + (op.status || '');
    if (detailEl) detailEl.textContent = op.detail || '';
  }

  function updateFreshnessBadge(updated) {
    var el = document.getElementById('freshness-badge');
    if (!el || !updated) return;
    var ageMs = Date.now() - new Date(updated).getTime();
    var ageMin = Math.round(ageMs / 60000);
    if (ageMin < 2) { el.textContent = '⟳ LIVE'; el.className = 'fresh'; }
    else if (ageMin < 60) { el.textContent = '⟳ ' + ageMin + 'm ago'; el.className = 'fresh'; }
    else if (ageMin < 120) { el.textContent = '⟳ ' + Math.round(ageMin/60) + 'h ago'; el.className = ''; }
    else { el.textContent = '⚠ ' + Math.round(ageMin/60) + 'h old'; el.className = 'stale'; }
  }

  // Load cache immediately (instant render) then fetch live
  loadCachedIntel();
  loadLiveIntel();
  setInterval(loadLiveIntel, 15 * 60 * 1000);
  // Update freshness badge every minute
  setInterval(function(){
    try {
      var c = JSON.parse(localStorage.getItem('strait_intel_v3') || 'null');
      if (c && c.updated) updateFreshnessBadge(c.updated);
    } catch(e) {}
  }, 60000);


  const EVENTS = []; // Populated from /intel API
  
  // ═══════════════════════════════════════════════════════════════
  // MAP INIT — wrapped in function, called via setTimeout to ensure
  // CSS grid has completed layout before Leaflet measures the container
  // ═══════════════════════════════════════════════════════════════
  let map;
  function initMap() {
    var wrap = document.getElementById('map-wrap');
    var mapEl = document.getElementById('map');
    var SVG_W = 800, SVG_H = 500;
    var IRAN_COAST = "22.9,36.4 91.4,18.2 171.4,27.3 228.6,45.5 285.7,54.5 342.9,63.6 400.0,81.8 457.1,100.0 514.3,109.1 571.4,118.2 628.6,109.1 685.7,100.0 742.9,109.1 800.0,118.2 800.0,0.0 22.9,0.0";
    var OMAN_COAST = "0.0,272.7 57.1,290.9 114.3,318.2 171.4,336.4 228.6,363.6 251.4,390.9 285.7,427.3 342.9,454.5 400.0,472.7 457.1,481.8 514.3,472.7 571.4,454.5 628.6,463.6 685.7,472.7 742.9,481.8 800.0,481.8 800.0,500.0 0.0,500.0";
    var MUSANDAM   = "240.0,109.1 262.9,127.3 285.7,145.5 320.0,163.6 331.4,181.8 308.6,200.0 274.3,190.9 240.0,172.7 217.1,145.5 205.7,127.3 228.6,118.2";
    var QESHM      = "171.4,63.6 205.7,54.5 251.4,45.5 285.7,50.0 320.0,63.6 297.1,81.8 262.9,86.4 217.1,81.8 182.9,72.7";
    var MINE_ZONE  = "251.4,90.9 320.0,86.4 365.7,100.0 342.9,127.3 285.7,131.8 251.4,118.2";
    var LANE_IO    = "262.9,104.5 320.0,100.0 377.1,101.8 434.3,118.2";
    var LANE_II    = "262.9,118.2 320.0,113.6 377.1,115.5 434.3,131.8";
    var LANE_OO    = "262.9,127.3 320.0,122.7 377.1,124.5 434.3,140.9";
    var LANE_OI    = "262.9,140.9 320.0,136.4 377.1,138.2 434.3,154.5";
    var GRID_SVG   = '<line x1="114.3" y1="0" x2="114.3" y2="500" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="116.3" y="496" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">55°E</text><line x1="228.6" y1="0" x2="228.6" y2="500" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="230.6" y="496" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">56°E</text><line x1="342.9" y1="0" x2="342.9" y2="500" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="344.9" y="496" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">57°E</text><line x1="457.1" y1="0" x2="457.1" y2="500" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="459.1" y="496" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">58°E</text><line x1="571.4" y1="0" x2="571.4" y2="500" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="573.4" y="496" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">59°E</text><line x1="685.7" y1="0" x2="685.7" y2="500" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="687.7" y="496" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">60°E</text><line x1="0" y1="409.1" x2="800" y2="409.1" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="2" y="407.1" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">23°N</text><line x1="0" y1="318.2" x2="800" y2="318.2" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="2" y="316.2" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">24°N</text><line x1="0" y1="227.3" x2="800" y2="227.3" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="2" y="225.3" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">25°N</text><line x1="0" y1="136.4" x2="800" y2="136.4" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="2" y="134.4" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">26°N</text><line x1="0" y1="45.5" x2="800" y2="45.5" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><text x="2" y="43.5" fill="rgba(255,255,255,0.15)" font-size="8" font-family="monospace">27°N</text>';
    var chokeX = 285.7, chokeY = 113.6;
    var TYPE_COLOR = {seized:'#ff3a3a',navy:'#00b4ff',dark:'#a855f7',transit:'#00e676',turned:'#ff7a00',irgcn:'#ff4444'};
    var VESSELS = [
      [280.0, 104.5, 'seized', 'MSC Francesca'],
      [291.4, 100.0, 'seized', 'Epaminondas'],
      [365.7, 145.5, 'navy', 'USS Lincoln CSG'],
      [320.0, 163.6, 'navy', 'USS Bulkeley'],
      [514.3, 245.5, 'navy', 'USS Carter Hall'],
      [594.3, 290.9, 'dark', 'Hero II'],
      [662.9, 309.1, 'dark', 'Hedy'],
      [434.3, 127.3, 'transit', 'MV Atlas'],
      [491.4, 154.5, 'transit', 'Nordic Hawk'],
      [205.7, 136.4, 'turned', 'MSC Vera'],
      [171.4, 122.7, 'turned', 'Pacific Star'],
      [262.9, 81.8, 'irgcn', 'IRGCN Patrol'],
      [308.6, 72.7, 'irgcn', 'IRGCN Patrol 2']
    ];
    var markerSVG = '';
    for (var i=0; i<VESSELS.length; i++) {
      var vx=VESSELS[i][0], vy=VESSELS[i][1], vtype=VESSELS[i][2], vlabel=VESSELS[i][3];
      var col = TYPE_COLOR[vtype] || '#fff';
      if (vtype==='seized'||vtype==='irgcn') {
        markerSVG += '<circle cx="'+vx+'" cy="'+vy+'" r="12" fill="'+col+'" opacity="0.25" class="pulse-ring"/>';
      }
      markerSVG += '<circle cx="'+vx+'" cy="'+vy+'" r="6" fill="'+col+'" stroke="#0d1420" stroke-width="1.5"/>';
      markerSVG += '<text x="'+(vx+8)+'" y="'+(vy-4)+'" fill="'+col+'" font-size="8" font-family="monospace" opacity="0.85">'+vlabel+'</text>';
    }
    var s = '<svg id="map-svg" viewBox="0 0 '+SVG_W+' '+SVG_H+'" style="width:100%;height:100%;display:block;background:#05090f;cursor:grab" xmlns="http://www.w3.org/2000/svg">';
    s += '<defs><style>.pulse-ring{animation:pulse 2s ease-out infinite}@keyframes pulse{0%{r:8;opacity:0.6}100%{r:22;opacity:0}}</style>';
    s += '<linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#051520"/><stop offset="100%" stop-color="#071825"/></linearGradient></defs>';
    s += '<rect width="'+SVG_W+'" height="'+SVG_H+'" fill="url(#waterGrad)"/>';
    s += GRID_SVG;
    s += '<polygon points="'+IRAN_COAST+'" fill="#1a2318" stroke="#2a3a28" stroke-width="1.5"/>';
    s += '<polygon points="'+OMAN_COAST+'" fill="#1a2318" stroke="#2a3a28" stroke-width="1.5"/>';
    s += '<polygon points="'+MUSANDAM+'" fill="#1e2a1c" stroke="#2a3a28" stroke-width="1"/>';
    s += '<polygon points="'+QESHM+'" fill="#1a2318" stroke="#2a3a28" stroke-width="0.5"/>';
    s += '<polygon points="'+MINE_ZONE+'" fill="rgba(255,214,0,0.08)" stroke="#ffd700" stroke-width="1" stroke-dasharray="4 3"/>';
    s += '<text x="320.0" y="104.5" fill="#ffd700" font-size="7.5" font-family="monospace" opacity="0.7">MINE ZONE</text>';
    s += '<polyline points="'+LANE_IO+'" fill="none" stroke="rgba(0,180,255,0.3)" stroke-width="1.5" stroke-dasharray="6 3"/>';
    s += '<polyline points="'+LANE_II+'" fill="none" stroke="rgba(0,180,255,0.5)" stroke-width="8" stroke-linecap="butt" opacity="0.07"/>';
    s += '<polyline points="'+LANE_OO+'" fill="none" stroke="rgba(0,230,118,0.3)" stroke-width="1.5" stroke-dasharray="6 3"/>';
    s += '<polyline points="'+LANE_OI+'" fill="none" stroke="rgba(0,230,118,0.5)" stroke-width="8" stroke-linecap="butt" opacity="0.07"/>';
    s += '<text x="342.9" y="107.3" fill="rgba(0,180,255,0.6)" font-size="8" font-family="monospace">INBOUND LANE</text>';
    s += '<text x="342.9" y="130.0" fill="rgba(0,230,118,0.6)" font-size="8" font-family="monospace">OUTBOUND LANE</text>';
    s += '<circle cx="'+chokeX+'" cy="'+chokeY+'" r="40" fill="none" stroke="rgba(255,58,58,0.15)" stroke-width="2" stroke-dasharray="8 4"/>';
    s += '<text x="'+chokeX+'" y="'+(chokeY+14)+'" text-anchor="middle" fill="rgba(255,58,58,0.5)" font-size="9" font-family="monospace">HORMUZ</text>';
    s += '<text x="'+chokeX+'" y="'+(chokeY+25)+'" text-anchor="middle" fill="rgba(255,58,58,0.4)" font-size="7.5" font-family="monospace">CHOKE POINT</text>';
    s += '<text x="171.4" y="36.4" fill="rgba(200,200,200,0.3)" font-size="11" font-family="monospace" font-weight="bold">IRAN</text>';
    s += '<text x="137.1" y="363.6" fill="rgba(200,200,200,0.3)" font-size="10" font-family="monospace" font-weight="bold">UAE</text>';
    s += '<text x="514.3" y="409.1" fill="rgba(200,200,200,0.3)" font-size="10" font-family="monospace" font-weight="bold">OMAN</text>';
    s += '<text x="628.6" y="154.5" fill="rgba(200,200,200,0.25)" font-size="9" font-family="monospace">GULF OF OMAN</text>';
    s += '<text x="137.1" y="181.8" fill="rgba(200,200,200,0.25)" font-size="9" font-family="monospace">PERSIAN GULF</text>';
    s += markerSVG;
    s += '<line x1="20" y1="480" x2="84" y2="480" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>';
    s += '<text x="42" y="492" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8" font-family="monospace">~50 km</text>';
    s += '<text x="796" y="494" text-anchor="end" fill="rgba(255,255,255,0.12)" font-size="7.5" font-family="monospace">OSINT · INDICAINDEPENDENT · v5</text>';
    s += '</svg>';
    mapEl.style.cssText = 'display:block;width:100%;height:100%;min-height:300px;flex:1';
    wrap.style.cssText = 'position:relative;background:#05090f;height:100%;min-height:400px;overflow:hidden';
    mapEl.innerHTML = s;
    var vbX=0,vbY=0,vbW=SVG_W,vbH=SVG_H,dragging=false,lastX=0,lastY=0;
    var svg = mapEl.querySelector('#map-svg');
    function setVB() { svg.setAttribute('viewBox',vbX+' '+vbY+' '+vbW+' '+vbH); }
    svg.addEventListener('mousedown',function(e){dragging=true;lastX=e.clientX;lastY=e.clientY;svg.style.cursor='grabbing';});
    window.addEventListener('mouseup',function(){dragging=false;if(svg)svg.style.cursor='grab';});
    window.addEventListener('mousemove',function(e){
      if(!dragging)return;
      var dx=(e.clientX-lastX)/svg.clientWidth*vbW, dy=(e.clientY-lastY)/svg.clientHeight*vbH;
      vbX=Math.max(-100,Math.min(SVG_W-100,vbX-dx));
      vbY=Math.max(-100,Math.min(SVG_H-100,vbY-dy));
      lastX=e.clientX;lastY=e.clientY;setVB();
    });
    svg.addEventListener('wheel',function(e){
      e.preventDefault();
      var f=e.deltaY>0?1.15:0.87;
      var cx=vbX+(e.offsetX/svg.clientWidth)*vbW, cy=vbY+(e.offsetY/svg.clientHeight)*vbH;
      vbW=Math.max(150,Math.min(SVG_W*1.5,vbW*f));
      vbH=Math.max(100,Math.min(SVG_H*1.5,vbH*f));
      vbX=cx-(e.offsetX/svg.clientWidth)*vbW;
      vbY=cy-(e.offsetY/svg.clientHeight)*vbH;
      setVB();
    },{passive:false});
    var zin=document.getElementById('btn-zoom-in'),zout=document.getElementById('btn-zoom-out'),zrst=document.getElementById('btn-reset');
    if(zin)zin.addEventListener('click',function(){vbX+=vbW*0.1;vbY+=vbH*0.1;vbW*=0.8;vbH*=0.8;setVB();});
    if(zout)zout.addEventListener('click',function(){vbX-=vbW*0.12;vbY-=vbH*0.12;vbW=Math.min(SVG_W*1.5,vbW*1.25);vbH=Math.min(SVG_H*1.5,vbH*1.25);setVB();});
    if(zrst)zrst.addEventListener('click',function(){vbX=0;vbY=0;vbW=SVG_W;vbH=SVG_H;setVB();});
} // end initMap()

  // ─── defer map init until AFTER browser has painted the grid layout ───
  // Robust map init: retry until Leaflet is loaded (handles slow script loads)
  // SVG map — no external deps, call initMap directly
  setTimeout(function() {
    try {
      initMap();
    } catch(e) {
      console.error('initMap error:', e);
      var m = document.getElementById('map');
      if (m) m.innerHTML = '<div style="color:#ff3a3a;padding:20px;font-family:monospace">MAP ERROR: ' + e.message + '</div>';
    }
  }, 100);

  // Non-map init runs immediately
  updateWarDay();
  refreshPrices();
  updateStatusbar();
  
  // Price auto-refresh every 5 minutes
  setInterval(autoRefresh, 5 * 60 * 1000);
  
  // Update statusbar clock every second
  setInterval(() => {
    document.getElementById('sb-time').textContent = 'UTC: ' + new Date().toUTCString().slice(17,25);
  }, 1000);
  
});
<\/script>
</body>
</html>`;
}