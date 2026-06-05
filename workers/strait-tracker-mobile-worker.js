// StraitTracker Mobile — Cloudflare Edge Worker v2.2 (May 28 — MOU framing)
// mobile.tracker.warheatmap.app | Built by Bumboclaat for Pete McVries
// Mobile-first rebuild: bottom-sheet drawer, touch-optimized Leaflet, safe-area insets
// Separate CF Worker: strait-tracker-mobile
// bundle-bust-1776778594

const TOKEN_WINDOW_MS = 30 * 60 * 1000;

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
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<meta name="theme-color" content="#070b12"/>
<title>StraitTracker | Access Required</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#070b12;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
.card{max-width:360px;width:100%;text-align:center}
.icon{font-size:3rem;margin-bottom:1rem}
.title{font-size:1.6rem;font-weight:900;letter-spacing:-0.02em;margin-bottom:0.25rem}
.title span{color:#ff3a3a}
.sub{font-size:0.7rem;color:#64748b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2rem}
.msg{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.5rem;margin-bottom:1.5rem}
.msg p{color:#e8edf2;font-size:0.9rem;font-weight:600;line-height:1.5;margin-bottom:0.5rem}
.msg p.sub2{color:#64748b;font-size:0.8rem;font-weight:400;line-height:1.6;margin:0}
.cta{display:inline-block;background:linear-gradient(135deg,#00c896,#00a878);color:#080c10;font-weight:700;font-size:0.9rem;padding:0.75rem 2rem;border-radius:50px;text-decoration:none;box-shadow:0 0 24px rgba(0,200,150,0.35)}
.foot{color:#334155;font-size:0.65rem;margin-top:1.25rem}
</style>
</head>
<body>
<div class="card">
  <div class="icon">⚓</div>
  <div class="title">STRAIT<span>TRACKER</span></div>
  <div class="sub">HORMUZ OSINT · MOBILE</div>
  <div class="msg">
    <p>Access via WarHeatMap →</p>
    <p class="sub2">StraitTracker is embedded exclusively inside warheatmap.app. Open the map from there to access this tool.</p>
  </div>
  <a class="cta" href="https://warheatmap.app">Open WarHeatMap →</a>
  <p class="foot">warheatmap.app · OSINT · Live</p>
</div>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/proxy') return handleProxy(request, url, env);

    const isEmbedded = url.searchParams.get('embed') === '1';
    const isGated = !isEmbedded && !checkAccess(request);

    if (isGated) return new Response(getGatePage(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' }
    });

    return new Response(getMobileHTML(), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=300, s-maxage=60, stale-while-revalidate=3600',
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, */*',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      }
    });
    const data = await resp.text();
    return new Response(data, {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function getMobileHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover"/>
<meta name="theme-color" content="#070b12"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="description" content="Live OSINT tracking of the Strait of Hormuz — mobile view."/>
<title>Strait of Hormuz Live · Mobile | Project Freedom 2026</title>
<link rel="preconnect" href="https://basemaps.cartocdn.com" crossorigin/>
<link rel="preconnect" href="https://query1.finance.yahoo.com" crossorigin/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css"/>

<style>
/* ── RESET + ROOT ─────────────────────────────────── */
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#070b12;--surface:#0d1420;--card:#111827;--border:#1e2d42;
  --red:#ff3a3a;--orange:#ff7a00;--yellow:#ffd600;--green:#00e676;
  --blue:#00b4ff;--cyan:#00f5d4;--purple:#a855f7;
  --text:#e2e8f0;--muted:#64748b;--dim:#94a3b8;
  /* safe area insets for notch/home-bar */
  --sat: env(safe-area-inset-top, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);
  /* drawer heights */
  --drawer-collapsed: 48px;
  --drawer-peek: 220px;
  --drawer-full: 72vh;
  --header-h: 48px;
}

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  overflow: hidden;
  overscroll-behavior: none;
}

/* ── LOADING SCREEN ──────────────────────────────── */
#loader{
  position:fixed;inset:0;z-index:9999;background:var(--bg);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
}
.loader-logo{font-size:1.6rem;font-weight:900;letter-spacing:-0.5px;color:#fff}
.loader-logo span{color:var(--red)}
.loader-bar{width:160px;height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden}
.loader-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--blue));border-radius:2px;animation:loadFill 1.8s ease-in-out forwards}
@keyframes loadFill{0%{width:0%}60%{width:75%}100%{width:100%}}
.loader-sub{font-size:10px;font-family:ui-monospace,monospace;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase}

/* ── APP SHELL ───────────────────────────────────── */
#app{
  display:none;
  position:fixed;inset:0;
  display:grid;
  grid-template-rows: calc(var(--header-h) + var(--sat)) 1fr;
  height: 100dvh; /* dynamic viewport height — respects browser chrome */
}

/* ── HEADER ──────────────────────────────────────── */
#header{
  background:linear-gradient(90deg,#0d1420,#111827);
  border-bottom:1px solid var(--border);
  display:flex;align-items:flex-end;justify-content:space-between;
  padding:0 14px calc(8px) 14px;
  padding-top: calc(var(--sat) + 6px);
  z-index:1000;position:relative;overflow:hidden;
  flex-shrink:0;
}
#header::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,var(--red),var(--orange),var(--yellow),var(--cyan),var(--blue),var(--red));
  background-size:400% 100%;animation:borderFlow 4s linear infinite;
}
@keyframes borderFlow{0%{background-position:0%}100%{background-position:400%}}
.hdr-left{display:flex;align-items:center;gap:8px}
.hdr-logo{font-size:14px;font-weight:900;letter-spacing:-0.5px;color:#fff;white-space:nowrap}
.hdr-logo span{color:var(--red)}
.live-pill{
  display:flex;align-items:center;gap:5px;
  background:rgba(255,58,58,0.12);border:1px solid rgba(255,58,58,0.3);
  border-radius:20px;padding:3px 8px;
  font-size:9px;font-family:ui-monospace,monospace;color:var(--red);letter-spacing:1px;
}
.live-dot{width:5px;height:5px;border-radius:50%;background:var(--red);animation:pulse 1.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.7)}}
.hdr-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
#countdown{
  font-size:10px;font-family:ui-monospace,monospace;
  background:rgba(255,214,0,0.08);border:1px solid rgba(255,214,0,0.25);
  border-radius:6px;padding:3px 8px;color:var(--yellow);letter-spacing:0.5px;white-space:nowrap;
}

/* ── MAP AREA ────────────────────────────────────── */
#map-container{
  position:relative;
  overflow:hidden;
  /* height is: total - header - drawer-collapsed - sab */
  height:100%;
}
#map{
  position:absolute;inset:0;
  width:100%;height:100%;
  background:#0a1628;
  touch-action:none; /* let Leaflet own all touch events */
}
.leaflet-container{background:#0a1628!important}
/* Keep zoom controls above the drawer */
.leaflet-bottom.leaflet-right{
  bottom:calc(var(--drawer-peek) + 8px)!important;
  right:8px!important;
  z-index:600!important;
}
.leaflet-control-zoom{
  border:1px solid var(--border)!important;
  border-radius:8px!important;
  overflow:hidden;
  background:rgba(7,11,18,0.88)!important;
  backdrop-filter:blur(8px);
  box-shadow:none!important;
}
.leaflet-control-zoom a{
  background:transparent!important;
  color:#e0e6f0!important;
  border-bottom:1px solid var(--border)!important;
  width:32px!important;height:32px!important;
  line-height:32px!important;
  font-size:18px!important;
}
.leaflet-control-zoom a:last-child{border-bottom:none!important}
.leaflet-control-zoom a:hover{background:rgba(255,255,255,0.08)!important}

/* ── MAP OVERLAYS — compact mobile versions ──────── */
#map-status{
  position:absolute;top:8px;left:8px;z-index:500;
  background:rgba(7,11,18,0.88);border:1px solid var(--border);
  border-radius:8px;padding:7px 10px;backdrop-filter:blur(12px);
  min-width:170px;max-width:calc(50vw - 12px);
}
.ms-title{font-size:8px;font-family:ui-monospace,monospace;color:var(--muted);letter-spacing:1.5px;
  margin-bottom:5px;text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:4px}
.ms-row{display:flex;justify-content:space-between;align-items:center;font-size:9px;
  padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.ms-row:last-child{border-bottom:none}
.ms-label{color:var(--muted)}
.ms-val{font-weight:700;font-family:ui-monospace,monospace;font-size:9px}

/* Layer controls — right side, compact */
#layers{
  position:absolute;top:8px;right:8px;z-index:500;
  background:rgba(7,11,18,0.88);border:1px solid var(--border);
  border-radius:8px;padding:7px 10px;backdrop-filter:blur(12px);
  display:flex;flex-direction:column;gap:4px;min-width:120px;
}
.layers-title{font-size:8px;font-family:ui-monospace,monospace;color:var(--muted);
  letter-spacing:1.5px;text-transform:uppercase;margin-bottom:2px;
  padding-bottom:4px;border-bottom:1px solid var(--border)}
.layer-btn{
  display:flex;align-items:center;gap:6px;cursor:pointer;
  padding:4px 4px;border-radius:4px;transition:background 0.15s;
  font-size:10px;user-select:none;min-height:28px; /* touch target */
}
.layer-btn:active{background:rgba(255,255,255,0.08)}
.layer-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;border:2px solid;transition:opacity 0.2s}
.layer-label{color:var(--text);font-weight:600;font-size:10px;transition:color 0.2s}
.layer-count{margin-left:auto;font-size:8px;font-family:ui-monospace,monospace;color:var(--muted)}
.layer-btn.off .layer-label{color:var(--muted)}
.layer-btn.off .layer-dot{opacity:0.25}

/* ── BOTTOM DRAWER ───────────────────────────────── */
#drawer{
  position:absolute;
  bottom:0;left:0;right:0;
  z-index:800;
  background:var(--surface);
  border-top:1px solid var(--border);
  border-radius:16px 16px 0 0;
  height:var(--drawer-peek);
  transition:height 0.32s cubic-bezier(0.4,0,0.2,1);
  display:flex;flex-direction:column;
  /* account for home bar */
  padding-bottom:var(--sab);
  overflow:hidden;
  box-shadow:0 -4px 24px rgba(0,0,0,0.5);
  will-change:height;
}
#drawer.collapsed{height:var(--drawer-collapsed)}
#drawer.full{height:var(--drawer-full)}

/* Drag handle */
#drawer-handle{
  display:flex;align-items:center;justify-content:center;
  height:36px;flex-shrink:0;cursor:grab;touch-action:none;
}
#drawer-handle:active{cursor:grabbing}
.handle-pill{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15)}

/* Tabs inside drawer */
#tabs{
  display:flex;border-bottom:1px solid var(--border);flex-shrink:0;
}
.tab{
  flex:1;padding:8px 4px;font-size:10px;font-weight:700;letter-spacing:0.8px;
  text-transform:uppercase;font-family:ui-monospace,monospace;cursor:pointer;
  color:var(--muted);border-bottom:2px solid transparent;transition:all 0.15s;
  text-align:center;min-height:36px; /* touch target */
  display:flex;align-items:center;justify-content:center;
}
.tab.active{color:var(--cyan);border-bottom-color:var(--cyan)}
.tab:active:not(.active){background:rgba(255,255,255,0.04)}

/* Panel content */
#panel-content{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:8px 12px;
  -webkit-overflow-scrolling:touch;
  overscroll-behavior:contain;
}

/* ── PRICES TAB ──────────────────────────────────── */
#prices-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  padding-bottom:8px;
}
/* Tablet: 3 columns */
@media(min-width:600px){#prices-grid{grid-template-columns:repeat(3,1fr)}}
.price-card{
  background:var(--card);border:1px solid var(--border);border-radius:8px;
  padding:8px 10px;display:flex;flex-direction:column;gap:4px;
  transition:border-color 0.3s;
}
.price-card.flash-up{border-color:var(--green);animation:flashUp 1s ease-out}
.price-card.flash-down{border-color:var(--red);animation:flashDown 1s ease-out}
@keyframes flashUp{0%{box-shadow:0 0 10px rgba(0,230,118,0.5)}100%{box-shadow:none}}
@keyframes flashDown{0%{box-shadow:0 0 10px rgba(255,58,58,0.5)}100%{box-shadow:none}}
.pc-label{font-size:8px;font-family:ui-monospace,monospace;color:var(--muted);letter-spacing:1px;text-transform:uppercase}
.pc-val{font-size:14px;font-weight:900;font-family:ui-monospace,monospace;color:var(--text)}
.pc-chg{font-size:9px;font-family:ui-monospace,monospace;font-weight:600}
.pc-chg.up{color:var(--green)}
.pc-chg.dn{color:var(--red)}
.loading-pulse{animation:loadPulse 1.5s ease-in-out infinite}
@keyframes loadPulse{0%,100%{opacity:1}50%{opacity:0.3}}

/* Refresh row */
#refresh-row{
  display:flex;align-items:center;justify-content:space-between;
  font-size:9px;font-family:ui-monospace,monospace;color:var(--muted);
  padding:4px 0;flex-shrink:0;
}
#refresh-btn{
  background:rgba(0,245,212,0.08);border:1px solid rgba(0,245,212,0.2);
  color:var(--cyan);border-radius:20px;padding:4px 12px;
  font-size:9px;font-family:ui-monospace,monospace;cursor:pointer;
  min-height:32px; /* touch target */
  display:flex;align-items:center;gap:4px;
}
#refresh-btn:active{background:rgba(0,245,212,0.15)}

/* ── SITUATION TAB ───────────────────────────────── */
#status-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;padding-bottom:8px;
}
.stat-card{
  background:var(--card);border:1px solid var(--border);border-radius:8px;
  padding:10px 10px;
}
.stat-label{font-size:8px;font-family:ui-monospace,monospace;color:var(--muted);
  letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.stat-val{font-size:13px;font-weight:800;font-family:ui-monospace,monospace}
.stat-note{font-size:9px;color:var(--muted);margin-top:3px;line-height:1.3}

/* ── INTEL FEED TAB ──────────────────────────────── */
#news-list{display:flex;flex-direction:column;gap:6px;padding-bottom:8px}
.news-item{
  background:var(--card);border:1px solid var(--border);border-radius:6px;
  padding:8px 10px;display:flex;align-items:flex-start;gap:8px;
}
.news-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:4px}
.news-body{flex:1;min-width:0}
.news-time{font-size:8px;font-family:ui-monospace,monospace;color:var(--muted);margin-bottom:2px}
.news-text{font-size:11px;color:var(--text);line-height:1.4;font-weight:500}
.news-src{font-size:8px;color:var(--muted);margin-top:3px}

/* ── LEAFLET POPUP MOBILE TWEAKS ─────────────────── */
.leaflet-popup-content-wrapper{
  background:rgba(13,20,32,0.97)!important;
  border:1px solid var(--border)!important;
  border-radius:10px!important;
  box-shadow:0 8px 32px rgba(0,0,0,0.6)!important;
  color:var(--text)!important;
  max-width:min(280px,80vw)!important;
}
.leaflet-popup-content{margin:10px 12px!important;font-size:11px!important;line-height:1.5!important}
.leaflet-popup-tip-container{display:none!important}
.leaflet-popup-close-button{color:var(--muted)!important;font-size:18px!important;
  width:32px!important;height:32px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.pop-title{font-weight:800;font-size:12px;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid var(--border)}
.pop-row{display:flex;justify-content:space-between;align-items:flex-start;
  padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05);gap:8px}
.pop-row:last-child{border-bottom:none}
.pop-label{color:var(--muted);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;flex-shrink:0}
.pop-val{font-size:9px;font-weight:700;font-family:ui-monospace,monospace;text-align:right;color:var(--text)}
.pop-detail{font-size:10px;color:var(--dim);margin-top:5px;line-height:1.4;font-style:italic}
.pop-src{font-size:8px;color:var(--muted);margin-top:4px}

/* ── VESSEL LABELS ───────────────────────────────── */
.vessel-label{
  background:rgba(7,11,18,0.82);border:1px solid rgba(255,255,255,0.12);
  border-radius:4px;padding:2px 5px;
  font-size:9px;font-weight:700;color:var(--text);
  white-space:nowrap;pointer-events:none;
}

/* ── COUNTER BADGES ──────────────────────────────── */
#event-ticker{
  position:absolute;bottom:calc(var(--drawer-peek) + 8px);left:0;right:0;
  z-index:700;overflow:hidden;height:26px;pointer-events:none;
}
.ticker-track{display:flex;gap:16px;white-space:nowrap;animation:tickerScroll 30s linear infinite}
@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker-item{
  font-size:9px;font-family:ui-monospace,monospace;color:var(--muted);
  background:rgba(7,11,18,0.8);padding:4px 8px;border-radius:4px;
  border:1px solid var(--border);flex-shrink:0;
}
.ticker-item.hot{color:var(--red);border-color:rgba(255,58,58,0.3)}
.ticker-item.warm{color:var(--yellow);border-color:rgba(255,214,0,0.3)}
.ticker-item.ok{color:var(--green);border-color:rgba(0,230,118,0.2)}

/* ── BLOCKADE COUNTER ────────────────────────────── */
#blockade-hud{
  position:absolute;bottom:calc(var(--drawer-peek) + 36px);right:8px;
  z-index:700;
  background:rgba(7,11,18,0.9);border:1px solid rgba(255,58,58,0.35);
  border-radius:8px;padding:7px 10px;backdrop-filter:blur(10px);
  text-align:center;min-width:80px;
}
.hud-num{font-size:22px;font-weight:900;font-family:ui-monospace,monospace;color:var(--red);line-height:1}
.hud-label{font-size:7px;font-family:ui-monospace,monospace;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:2px}

/* ── DEAD ZONE HELPER ────────────────────────────── */
/* tap anywhere on map to collapse drawer */
#map-tap-overlay{position:absolute;inset:0;z-index:799;display:none}
#drawer.full ~ #map-tap-overlay,
#drawer.peek ~ #map-tap-overlay{display:none}
</style>
</head>
<body>

<!-- LOADER -->
<div id="loader">
  <div class="loader-logo">STRAIT<span>TRACKER</span></div>
  <div class="loader-bar"><div class="loader-fill"></div></div>
  <div class="loader-sub" id="loader-msg">LOADING OSINT ASSETS...</div>
</div>

<!-- APP -->
<div id="app" style="display:none">

  <!-- HEADER -->
  <div id="header">
    <div class="hdr-left">
      <div class="hdr-logo">STRAIT<span>TRACKER</span></div>
      <div class="live-pill"><div class="live-dot"></div>LIVE</div>
    </div>
    <div class="hdr-right">
      <div id="countdown">LOADING...</div>
    </div>
  </div>

  <!-- MAP CONTAINER (fills remaining height) -->
  <div id="map-container">
    <div id="map"></div>

    <!-- STATUS OVERLAY — top left -->
    <div id="map-status">
      <div class="ms-title">STRAIT STATUS · MAY 28</div>
      <div class="ms-row"><span class="ms-label">Ceasefire</span><span class="ms-val" style="color:var(--orange)">MOU NEGOTIATING <span id="mou-day">D+0</span></span></div>
      <div class="ms-row"><span class="ms-label">Blockade</span><span class="ms-val" style="color:var(--orange)">EASING (MOU TIER 1)</span></div>
      <div class="ms-row"><span class="ms-label">Ships Backed Up</span><span class="ms-val" style="color:var(--red)">~800</span></div>
      <div class="ms-row"><span class="ms-label">IRGC Claim</span><span class="ms-val" style="color:var(--yellow)">25 PASSED TUE</span></div>
      <div class="ms-row"><span class="ms-label">Iran Asset Hold</span><span class="ms-val" style="color:var(--yellow)">$24B PENDING</span></div>
    </div>

    <!-- LAYERS — top right -->
    <div id="layers">
      <div class="layers-title">LAYERS</div>
      <div class="layer-btn active" id="btn-tankers" onclick="toggleLayer('tankers')">
        <div class="layer-dot" style="background:rgba(255,122,0,0.25);border-color:#ff7a00"></div>
        <span class="layer-label">Tankers</span><span class="layer-count">8</span>
      </div>
      <div class="layer-btn active" id="btn-navy" onclick="toggleLayer('navy')">
        <div class="layer-dot" style="background:rgba(0,180,255,0.25);border-color:#00b4ff"></div>
        <span class="layer-label">Navy</span><span class="layer-count">4</span>
      </div>
      <div class="layer-btn active" id="btn-iran" onclick="toggleLayer('iran')">
        <div class="layer-dot" style="background:rgba(255,58,58,0.25);border-color:#ff3a3a"></div>
        <span class="layer-label">IRGC</span><span class="layer-count">6</span>
      </div>
      <div class="layer-btn active" id="btn-dark" onclick="toggleLayer('dark')">
        <div class="layer-dot" style="background:rgba(168,85,247,0.25);border-color:#a855f7"></div>
        <span class="layer-label">Dark</span><span class="layer-count">~13</span>
      </div>
      <div class="layer-btn active" id="btn-zones" onclick="toggleLayer('zones')">
        <div class="layer-dot" style="background:rgba(255,214,0,0.25);border-color:#ffd600"></div>
        <span class="layer-label">Zones</span><span class="layer-count">4</span>
      </div>
    </div>

    <!-- BLOCKADE HUD -->
    <div id="blockade-hud">
      <div class="hud-num" id="hud-num">8</div>
      <div class="hud-label">BLOCKED</div>
    </div>

    <!-- TICKER -->
    <div id="event-ticker">
      <div class="ticker-track" id="ticker-track">
        <span class="ticker-item hot">🟥 BREAKING: MOU framework close — Trump "won't rush" — May 27</span>
        <span class="ticker-item hot">🔫 USS destroyer + IRGC craft exchange live fire — May 27</span>
        <span class="ticker-item hot">🚢 IRGC claims 25 vessels passed Hormuz Tuesday — May 26</span>
        <span class="ticker-item warm">💸 $24B Iranian asset release — MOU Phase 1 sweetener</span>
        <span class="ticker-item warm">🛢 China + India quietly resuming crude pulls — Kpler May 23-27</span>
        <span class="ticker-item warm">📜 IRGC + Tehran claim "regulatory jurisdiction" over Hormuz — May 26</span>
        <span class="ticker-item warm">🥷 Houthis threaten to resume maritime ops if talks collapse — May 25</span>
        <span class="ticker-item warm">🕊 Oman shuttling US + Iran delegations in Muscat — through May 27</span>
        <span class="ticker-item ok">⚓ 800+ ships backed up — Lloyd's war-risk premiums at multi-yr highs</span>
        <span class="ticker-item ok">🛢 Chinese supertankers extracted 4M bbls — May 20 (prior signal)</span>
        <span class="ticker-item ok">🤝 Trump-Xi summit (May 14-15) — no breakthrough at time</span>
        <!-- duplicated for seamless loop -->
        <span class="ticker-item hot">🟥 BREAKING: MOU framework close — Trump "won't rush" — May 27</span>
        <span class="ticker-item hot">🔫 USS destroyer + IRGC craft exchange live fire — May 27</span>
        <span class="ticker-item hot">🚢 IRGC claims 25 vessels passed Hormuz Tuesday — May 26</span>
        <span class="ticker-item warm">💸 $24B Iranian asset release — MOU Phase 1 sweetener</span>
        <span class="ticker-item warm">🛢 China + India quietly resuming crude pulls — Kpler May 23-27</span>
        <span class="ticker-item warm">📜 IRGC + Tehran claim "regulatory jurisdiction" over Hormuz — May 26</span>
        <span class="ticker-item warm">🥷 Houthis threaten to resume maritime ops if talks collapse — May 25</span>
        <span class="ticker-item warm">🕊 Oman shuttling US + Iran delegations in Muscat — through May 27</span>
        <span class="ticker-item ok">⚓ 800+ ships backed up — Lloyd's war-risk premiums at multi-yr highs</span>
        <span class="ticker-item ok">🛢 Chinese supertankers extracted 4M bbls — May 20 (prior signal)</span>
        <span class="ticker-item ok">🤝 Trump-Xi summit (May 14-15) — no breakthrough at time</span>
      </div>
    </div>

    <!-- BOTTOM DRAWER -->
    <div id="drawer" class="peek">
      <div id="drawer-handle" id="drawer-drag">
        <div class="handle-pill"></div>
      </div>

      <!-- TABS -->
      <div id="tabs">
        <div class="tab active" id="tab-prices" onclick="switchTab('prices')">PRICES</div>
        <div class="tab" id="tab-status" onclick="switchTab('status')">SITUATION</div>
        <div class="tab" id="tab-news" onclick="switchTab('news')">INTEL</div>
      </div>

      <!-- PANEL CONTENT -->
      <div id="panel-content">

        <!-- PRICES -->
        <div id="tab-prices-content">
          <div id="refresh-row">
            <span id="last-update-label">Updating...</span>
            <div id="refresh-btn" onclick="manualRefresh()">↻ REFRESH</div>
          </div>
          <div id="prices-grid">
            <div class="price-card" id="card-wti">
              <div class="pc-label">WTI CRUDE</div>
              <div class="pc-val loading-pulse" id="p-wti">--</div>
              <div class="pc-chg" id="c-wti">--</div>
            </div>
            <div class="price-card" id="card-brent">
              <div class="pc-label">BRENT</div>
              <div class="pc-val loading-pulse" id="p-brent">--</div>
              <div class="pc-chg" id="c-brent">--</div>
            </div>
            <div class="price-card" id="card-ng">
              <div class="pc-label">NAT GAS</div>
              <div class="pc-val loading-pulse" id="p-ng">--</div>
              <div class="pc-chg" id="c-ng">--</div>
            </div>
            <div class="price-card" id="card-uso">
              <div class="pc-label">USO ETF</div>
              <div class="pc-val loading-pulse" id="p-uso">--</div>
              <div class="pc-chg" id="c-uso">--</div>
            </div>
            <div class="price-card" id="card-xle">
              <div class="pc-label">XLE ETF</div>
              <div class="pc-val loading-pulse" id="p-xle">--</div>
              <div class="pc-chg" id="c-xle">--</div>
            </div>
            <div class="price-card" id="card-btc">
              <div class="pc-label">BTC/USD</div>
              <div class="pc-val loading-pulse" id="p-btc">--</div>
              <div class="pc-chg" id="c-btc">--</div>
            </div>
          </div>
        </div>

        <!-- SITUATION -->
        <div id="tab-status-content" style="display:none">
          <div id="status-grid">
            <div class="stat-card">
              <div class="stat-label">Blockade</div>
              <div class="stat-val" style="color:var(--orange)">ENFORCED</div>
              <div class="stat-note">US Navy active intercept ops since Apr 11</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Ceasefire</div>
              <div class="stat-val" style="color:var(--yellow)">ACTIVE</div>
              <div class="stat-note">Expires Apr 22 00:00Z — talks ongoing</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tankers Blocked</div>
              <div class="stat-val" style="color:var(--red)">8 CONFIRMED</div>
              <div class="stat-note">Intercepted bound for Iranian ports</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Dark Fleet Est.</div>
              <div class="stat-val" style="color:var(--purple)">12–15</div>
              <div class="stat-note">AIS-off vessels — SAR satellite tracking</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">US Navy On Stn</div>
              <div class="stat-val" style="color:var(--cyan)">4 VESSELS</div>
              <div class="stat-note">DDG-107, DDG-67, CVN-77 inbound, T-AO-204</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">IRGC Readiness</div>
              <div class="stat-val" style="color:var(--red)">ELEVATED</div>
              <div class="stat-note">FIAC flotilla — 6–8 fast boats active</div>
            </div>
          </div>
        </div>

        <!-- INTEL FEED -->
        <div id="tab-news-content" style="display:none">
          <div id="news-list">
            <div class="news-item" id="mob-intel-loading">
              <div class="news-dot" style="background:var(--blue)"></div>
              <div class="news-body">
                <div class="news-time">📡 LIVE FEED</div>
                <div class="news-text">Loading live Strait of Hormuz intel…</div>
                <div class="news-src">strait-news-worker — live</div>
              </div>
            </div>
      </div><!-- /panel-content -->
    </div><!-- /drawer -->

  </div><!-- /map-container -->
</div><!-- /app -->

<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>
<script>
// ── DRAWER DRAG ──────────────────────────────────────────────────────────────
const drawer = document.getElementById('drawer');
const handle = document.getElementById('drawer-handle');
let dragStartY = 0, dragStartH = 0, isDragging = false;
const COLLAPSED = 48, PEEK = 220, FULL = Math.round(window.innerHeight * 0.72);

function setDrawerH(h) {
  h = Math.max(COLLAPSED, Math.min(FULL, h));
  drawer.style.height = h + 'px';
  // Update ticker + blockade HUD position
  const ticker = document.getElementById('event-ticker');
  const hud = document.getElementById('blockade-hud');
  if (ticker) ticker.style.bottom = (h + 8) + 'px';
  if (hud) hud.style.bottom = (h + 36) + 'px';
  // Invalidate Leaflet map size
  if (window._map) window._map.invalidateSize();
}

function snapDrawer(h) {
  // Snap to nearest: COLLAPSED / PEEK / FULL
  const snaps = [COLLAPSED, PEEK, FULL];
  const nearest = snaps.reduce((a, b) => Math.abs(b - h) < Math.abs(a - h) ? b : a);
  drawer.style.transition = 'height 0.32s cubic-bezier(0.4,0,0.2,1)';
  setDrawerH(nearest);
  setTimeout(() => { drawer.style.transition = ''; }, 350);
  if (window._map) setTimeout(() => window._map.invalidateSize(), 350);
}

handle.addEventListener('touchstart', e => {
  isDragging = true;
  dragStartY = e.touches[0].clientY;
  dragStartH = drawer.offsetHeight;
  drawer.style.transition = 'none';
}, { passive: true });

handle.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const dy = dragStartY - e.touches[0].clientY;
  setDrawerH(dragStartH + dy);
}, { passive: true });

handle.addEventListener('touchend', () => {
  isDragging = false;
  snapDrawer(drawer.offsetHeight);
});

// Mouse drag (desktop fallback)
handle.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartY = e.clientY;
  dragStartH = drawer.offsetHeight;
  drawer.style.transition = 'none';
});
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dy = dragStartY - e.clientY;
  setDrawerH(dragStartH + dy);
});
document.addEventListener('mouseup', () => {
  if (isDragging) { isDragging = false; snapDrawer(drawer.offsetHeight); }
});

// Tap handle to cycle states
let lastTap = 0;
handle.addEventListener('click', () => {
  const h = drawer.offsetHeight;
  if (h <= COLLAPSED + 10) { snapDrawer(PEEK); }
  else if (h <= PEEK + 30) { snapDrawer(FULL); }
  else { snapDrawer(PEEK); }
});

// ── TAB SWITCHING ────────────────────────────────────────────────────────────
function switchTab(name) {
  ['prices','status','news'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === name);
    const c = document.getElementById('tab-' + t + '-content');
    if (c) c.style.display = t === name ? '' : 'none';
  });
  // Expand drawer to peek if collapsed
  if (drawer.offsetHeight <= COLLAPSED + 10) snapDrawer(PEEK);
}

// ── COUNTDOWN ────────────────────────────────────────────────────────────────
const MOU_NEGOTIATING_START = new Date('2026-05-24T00:00:00Z'); // MOU framework first reported
const WAR_START_DATE = new Date('2026-02-27T00:00:00Z');
function updateCountdown() {
  const el = document.getElementById('countdown');
  const mouEl = document.getElementById('mou-day');
  const warDay = Math.floor((Date.now() - WAR_START_DATE) / 86400000);
  const mouDay = Math.floor((Date.now() - MOU_NEGOTIATING_START) / 86400000);
  if (el) {
    el.textContent = 'WAR DAY ' + warDay + ' · MOU D+' + mouDay;
    el.style.color = '#ffd600';
  }
  if (mouEl) mouEl.textContent = 'D+' + mouDay;
}updateCountdown();
setInterval(updateCountdown, 60000);

// ── LAYER TOGGLE ─────────────────────────────────────────────────────────────
const layerVis = { tankers:true, navy:true, iran:true, dark:true, zones:true };
const layerGroups = {};
function toggleLayer(name) {
  layerVis[name] = !layerVis[name];
  const btn = document.getElementById('btn-' + name);
  btn && btn.classList.toggle('off', !layerVis[name]);
  const g = layerGroups[name];
  if (!g || !window._map) return;
  layerVis[name] ? g.addTo(window._map) : g.remove();
}

// ── VESSEL DATA ──────────────────────────────────────────────────────────────
const ASSETS = {
  tankers: [
    { lat:26.45,lng:56.95,label:'Chinese VLCC Alpha',flag:'CN',status:'TRANSITED MAY 20',color:'#00e676',
      detail:'CHINESE SUPERTANKER #1 — Exited Hormuz May 20 carrying ~2M bbls crude. Combined with sister vessel, China extracted 4M bbls — largest single-day blockade easing since war began. Diplomatic thaw post Trump-Xi summit (May 14-15).',
      src:'Reuters / Gulf News — May 20, 2026' },
    { lat:26.41,lng:56.92,label:'Chinese VLCC Bravo',flag:'CN',status:'TRANSITED MAY 20',color:'#00e676',
      detail:'CHINESE SUPERTANKER #2 — Sister vessel to Alpha. Both exited May 20 carrying combined ~4M bbls. Vance + Trump simultaneously talking up Iran deal prospects same day.',
      src:'Reuters — May 20, 2026' },
    { lat:26.50,lng:56.85,label:'India Crude Carrier',flag:'IN',status:'INBOUND',color:'#00b0ff',
      detail:'INDIA SECURES SUPPLY — New Delhi announces dispatch of oil tankers through Hormuz to secure crude amid Iran disruptions. Third-largest Iranian customer historically positioning to capitalize on transit thaw.',
      src:'Times of India — May 20, 2026' },
    { lat:23.5,lng:62.0,label:'Iran-linked Tanker',flag:'IR',status:'SEIZED MAY 19',color:'#ff3a3a',
      detail:'INDIAN OCEAN SEIZURE — US Navy intercepted and seized Iranian-affiliated oil tanker in Indian Ocean (WSJ exclusive). Treasury economic-pressure track running parallel to Trump deal rhetoric.',
      src:'WSJ exclusive — May 19, 2026' },
    { lat:24.5,lng:58.6,label:'M/T Hasna (DISABLED)',flag:'IR',status:'DISABLED MAY 9',color:'#ff3a3a',
      detail:'Iranian tanker. Disabled by US F/A-18 strafing attack May 9, 2026. Part of US enforcement action in Gulf of Oman.',
      src:'Army Recognition — May 9, 2026' },
    { lat:24.3,lng:58.4,label:'Ocean Koi (SEIZED)',flag:'IR',status:'SEIZED MAY 9',color:'#ff3a3a',
      detail:'Sanctioned tanker. IRGC Navy commandos seized vessel in Gulf of Oman special operation May 8-9. Escorted to Iran south coast.',
      src:'OilPrice.com / Marine Insight — May 9, 2026' },
    { lat:26.35,lng:56.8,label:'MSC Francesca (SEIZED)',flag:'--',status:'SEIZED APR 22',color:'#ff3a3a',
      detail:'Container ship seized by IRGCN Apr 22. Still held at Bandar Abbas.',
      src:'Reuters / UKMTO — Apr 22, 2026' },
    { lat:26.32,lng:57.1,label:'Rich Starry',flag:'SG',status:'TRANSITED',color:'#00e676',
      detail:'Singapore-flagged VLCC. Completed transit Apr 14, 2026. First confirmed transit of the blockade.',src:'Reuters / MarineTraffic — Apr 14, 2026' },
    { lat:26.18,lng:56.4,label:'BW Larimar',flag:'NO',status:'TURNED BACK',color:'#ff7a00',
      detail:'Norwegian LNG carrier. Intercepted by USS Gravely (DDG-107) Apr 12. Returned to UAE anchorage off Fujairah.',src:'CENTCOM — Apr 13, 2026' },
    { lat:26.55,lng:57.8,label:'Pacific Zircon',flag:'MH',status:'TURNED BACK',color:'#ff7a00',
      detail:'Marshall Islands crude carrier. Intercepted northeast of Hormuz Apr 11. Diverted from Iranian waters.',src:'CENTCOM — Apr 13, 2026' },
    { lat:26.1,lng:57.6,label:'Hafnia Lise',flag:'DK',status:'TURNED BACK',color:'#ff7a00',
      detail:'Danish product tanker. Interdicted while inbound to Bandar Abbas. Diverted to Fujairah.',src:'CENTCOM — Apr 13, 2026' },
    { lat:26.4,lng:56.1,label:'Al Salam',flag:'SA',status:'SAFE TRANSIT',color:'#00e676',
      detail:'Saudi Aramco VLCC. Transited southbound via corridor. Non-Iranian port of origin.',src:'Ship tracking / Reuters — Apr 14, 2026' },
    { lat:26.22,lng:57.4,label:'Emirates Star',flag:'AE',status:'SAFE TRANSIT',color:'#00e676',
      detail:'UAE LPG carrier. Cleared transit corridor unimpeded.',src:'Ship tracking — Apr 13, 2026' },
  ],
  darkFleet: [
    { lat:26.5,lng:57.9,label:'HERO II (AIS DARK)',color:'#a855f7',
      detail:'Unidentified vessel, AIS off. SAR satellite detection Apr 12. Suspected Chinese-chartered Iranian crude carrier.',src:'TankerTrackers.com SAR — Apr 12, 2026' },
    { lat:25.8,lng:56.7,label:'HEDY (AIS DARK)',color:'#a855f7',
      detail:'Second Iranian VLCC gone dark. 2M bbl capacity. SAR satellite tracking.',src:'TankerTrackers — Apr 22, 2026' },
{ lat:26.0,lng:60.1,label:'41 TRAPPED (Est.)',color:'#a855f7',
detail:'41 tankers 69M bbls $6B+ trapped in Iranian ports by US blockade.',src:'CENTCOM — Apr 30, 2026',src:'TankerTrackers.com SAR — Apr 12, 2026' },
  ],
  navy: [
    { lat:26.10,lng:57.50,label:'USS Makin Island (LHD-8)',type:'Wasp-class Amphib (PREP)',color:'#00b0ff',
      detail:'USS MAKIN ISLAND — Being prepped for Gulf deployment as of May 19. Would add amphibious capability to existing 20-warship Iran-blockade force.',
      src:'USNI News / National Interest — May 19, 2026' },
    { lat:25.6,lng:57.5,label:'USS Gravely (DDG-107)',type:'Arleigh Burke Destroyer',color:'#00b4ff',
      detail:'Primary intercept vessel — 3+ tanker intercepts confirmed. Hormuz patrol rotation since Apr 11.',src:'CENTCOM / USNI — Apr 13, 2026' },
    { lat:25.9,lng:56.9,label:'USS Cole (DDG-67)',type:'Arleigh Burke Destroyer',color:'#00b4ff',
      detail:'Northern corridor patrol. Works in tandem with USS Gravely. 5th Fleet command, Bahrain.',src:'USNI Fleet Tracker — Apr 13, 2026' },
    { lat:23.5,lng:59.5,label:'USS George H.W. Bush (CVN-77)',type:'Nimitz Carrier Strike Group',color:'#00f5d4',
      detail:'Repositioning from Arabian Sea toward Hormuz. ETA ~48-72h from Apr 13.',src:'USNI — Apr 13, 2026' },
    { lat:25.3,lng:57.0,label:'USNS Rappahannock (T-AO-204)',type:'Combat Logistics Force',color:'#00b4ff',
      detail:'Replenishment oiler. Providing underway replenishment for DDGs on station.',src:'USNI — Apr 2026' },
  ],
  iran: [
    { lat:26.96,lng:56.27,label:'Bandar Abbas — IRGC HQ',type:'Command & Submarine Base',color:'#ff3a3a',
      detail:'IRGC Navy HQ and primary submarine pen. Main command node for all Strait operations.',src:'ISW / CENTCOM' },
    { lat:26.73,lng:55.88,label:'Qeshm Island Forward Base',type:'IRGC Fast Boat Staging',color:'#ff3a3a',
      detail:'Forward staging base for IRGC fast attack craft (FIAC). ISW confirmed elevated readiness Apr 13.',src:'ISW Iran Update — Apr 13, 2026' },
    { lat:26.86,lng:56.61,label:'Larak Island (Est.)',type:'IRGC Estimated Position',color:'#ff6b00',
      detail:'Estimated IRGC position based on historical deployment patterns.',src:'ISW historical assessment' },
    { lat:26.25,lng:57.05,label:'IRGC Fast Boat Flotilla',type:'Active Patrol — FIAC',color:'#ff3a3a',
      detail:'Estimated 6-8 IRGC Fast Inshore Attack Craft in northern Strait approach lanes.',src:'CENTCOM / ISW — Apr 13, 2026' },
    { lat:26.5,lng:57.4,label:'Mine Threat Zone',type:'Threat Assessment — Not Confirmed',color:'#ff6b00',
      detail:'Estimated mine-laying risk zone — IRGC historical doctrine. NOT confirmed as actively mined.',src:'CENTCOM threat assessment' },
    { lat:25.87,lng:54.52,label:'Abu Musa Island',type:'IRGC Garrison — Disputed',color:'#ff3a3a',
      detail:'Permanent IRGC garrison, radar, and reported anti-ship missile battery. Controls western Strait.',src:'Permanent IRGC position' },
  ],
};

const ZONES = [
  { type:'polygon',coords:[[27.2,55.2],[27.2,58.8],[25.2,58.8],[25.2,55.2]],
    color:'#00b4ff',label:'Transit Corridor',note:'Primary shipping lane — ~20% of global oil transits here daily.',opacity:0.06,borderOpacity:0.35 },
  { type:'polygon',coords:[[25.2,55.2],[25.2,58.8],[24.5,58.8],[24.5,55.2]],
    color:'#ff3a3a',label:'US Blockade Enforcement Line',note:'USS Gravely and Cole patrolling this boundary.',opacity:0.10,borderOpacity:0.55,dash:'6,4' },
  { type:'circle',center:[26.5,57.4],radius:28000,
    color:'#ff6b00',label:'Mine Threat Assessment Zone',note:'Historical doctrine — NOT confirmed active.',opacity:0.08,borderOpacity:0.4,dash:'4,4' },
  { type:'circle',center:[26.96,56.27],radius:12000,
    color:'#ff3a3a',label:'Bandar Abbas Control Zone',note:'IRGC Navy operational perimeter.',opacity:0.1,borderOpacity:0.5 },
];

// ── MAP INIT ─────────────────────────────────────────────────────────────────
function makeCircleSVG(color, size) {
  const s = size || 16;
  return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${s}" height="\${s}" viewBox="0 0 \${s} \${s}">
    <circle cx="\${s/2}" cy="\${s/2}" r="\${s/2-2}" fill="\${color}33" stroke="\${color}" stroke-width="2"/>
  </svg>\`;
}

function makeIcon(color, size) {
  return L.divIcon({
    className:'',
    html: makeCircleSVG(color, size || 18),
    iconSize:[size||18, size||18],
    iconAnchor:[(size||18)/2,(size||18)/2],
  });
}

function popupHTML(title, titleColor, rows, detail, src) {
  const rowsHTML = rows.map(r =>
    \`<div class="pop-row"><span class="pop-label">\${r.label}</span><span class="pop-val" style="color:\${r.color||'var(--text)'}">\${r.val}</span></div>\`
  ).join('');
  return \`<div class="pop-title" style="color:\${titleColor}">\${title}</div>\${rowsHTML}
    \${detail ? \`<div class="pop-detail">\${detail}</div>\` : ''}
    \${src ? \`<div class="pop-src">📡 \${src}</div>\` : ''}\`;
}

function initMap() {
  const map = L.map('map', {
    center: [26.2, 56.8],
    zoom: window.innerWidth < 420 ? 7 : 7,
    zoomControl: false,
    attributionControl: false,
    tapTolerance: 15,       // more forgiving tap detection on mobile
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: false, // disable accidental scroll zoom
    dragging: true,
  });
  window._map = map;

  // Add zoom control top-left (avoid overlap with overlays)
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 19, detectRetina: true
  }).addTo(map);

  // ── ZONES
  layerGroups.zones = L.layerGroup();
  ZONES.forEach(z => {
    let shape;
    const opts = {
      color: z.color, weight: 1.5, opacity: z.borderOpacity,
      fillColor: z.color, fillOpacity: z.opacity,
      dashArray: z.dash || null,
    };
    if (z.type === 'polygon') {
      shape = L.polygon(z.coords, opts);
    } else {
      shape = L.circle(z.center, { radius: z.radius, ...opts });
    }
    shape.bindPopup(popupHTML(z.label, z.color, [], z.note, null), { maxWidth: 250 });
    layerGroups.zones.addLayer(shape);
  });
  layerGroups.zones.addTo(map);

  // ── TANKERS
  layerGroups.tankers = L.layerGroup();
  ASSETS.tankers.forEach(v => {
    const m = L.marker([v.lat, v.lng], { icon: makeIcon(v.color, 20) });
    m.bindPopup(popupHTML(v.label, v.color, [
      { label:'Flag', val: v.flag || '?', color: 'var(--text)' },
      { label:'Status', val: v.status, color: v.color },
    ], v.detail, v.src), { maxWidth: 260 });
    layerGroups.tankers.addLayer(m);
  });
  layerGroups.tankers.addTo(map);

  // ── DARK FLEET
  layerGroups.dark = L.layerGroup();
  ASSETS.darkFleet.forEach(v => {
    const m = L.marker([v.lat, v.lng], { icon: makeIcon(v.color, 18) });
    m.bindPopup(popupHTML(v.label, v.color, [
      { label:'AIS', val: 'DARK / OFF', color: 'var(--purple)' },
      { label:'Source', val: 'SAR Satellite', color: 'var(--muted)' },
    ], v.detail, v.src), { maxWidth: 260 });
    layerGroups.dark.addLayer(m);
  });
  layerGroups.dark.addTo(map);

  // ── US NAVY
  layerGroups.navy = L.layerGroup();
  ASSETS.navy.forEach(v => {
    const m = L.marker([v.lat, v.lng], { icon: makeIcon(v.color, 22) });
    m.bindPopup(popupHTML(v.label, v.color, [
      { label:'Type', val: v.type, color: 'var(--dim)' },
    ], v.detail, v.src), { maxWidth: 270 });
    layerGroups.navy.addLayer(m);
  });
  layerGroups.navy.addTo(map);

  // ── IRAN / IRGC
  layerGroups.iran = L.layerGroup();
  ASSETS.iran.forEach(v => {
    const m = L.marker([v.lat, v.lng], { icon: makeIcon(v.color, 18) });
    m.bindPopup(popupHTML(v.label, v.color, [
      { label:'Type', val: v.type, color: 'var(--dim)' },
    ], v.detail, v.src), { maxWidth: 270 });
    layerGroups.iran.addLayer(m);
  });
  layerGroups.iran.addTo(map);

  // Close popups on map click (good UX on mobile)
  map.on('click', () => map.closePopup());

  // On map interaction, collapse drawer to peek
  map.on('dragstart', () => {
    if (drawer.offsetHeight > PEEK + 30) snapDrawer(PEEK);
  });
}

// ── PRICE FETCHING ───────────────────────────────────────────────────────────
const PROXY = '/proxy?url=';
const SYMBOLS = {
  wti:   { sym:'CL=F',    label:'WTI CRUDE', id:'card-wti',    pId:'p-wti',    cId:'c-wti'    },
  brent: { sym:'BZ=F',    label:'BRENT',     id:'card-brent',  pId:'p-brent',  cId:'c-brent'  },
  ng:    { sym:'NG=F',    label:'NAT GAS',   id:'card-ng',     pId:'p-ng',     cId:'c-ng'     },
  uso:   { sym:'USO',     label:'USO ETF',   id:'card-uso',    pId:'p-uso',    cId:'c-uso'    },
  xle:   { sym:'XLE',     label:'XLE ETF',   id:'card-xle',    pId:'p-xle',    cId:'c-xle'    },
  btc:   { sym:'BTC-USD', label:'BTC/USD',   id:'card-btc',    pId:'p-btc',    cId:'c-btc'    },
};
const prevPrices = {};

async function fetchOneSym(entry) {
  const url = PROXY + encodeURIComponent(
    'https://query1.finance.yahoo.com/v8/finance/chart/' + entry.sym
  );
  const r = await fetch(url);
  const j = await r.json();
  const meta = j?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const chgPct = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
  return { entry, price, chgPct };
}

async function fetchPrices() {
  try {
    const results = await Promise.allSettled(
      Object.values(SYMBOLS).map(fetchOneSym)
    );
    results.forEach(res => {
      if (res.status !== 'fulfilled' || !res.value) return;
      const { entry, price, chgPct } = res.value;
      const pEl = document.getElementById(entry.pId);
      const cEl = document.getElementById(entry.cId);
      const card = document.getElementById(entry.id);
      if (!pEl || !cEl || !card) return;

      const prev = prevPrices[entry.sym];
      if (prev !== undefined && price !== prev) {
        card.classList.remove('flash-up','flash-down');
        void card.offsetWidth;
        card.classList.add(price > prev ? 'flash-up' : 'flash-down');
        setTimeout(() => card.classList.remove('flash-up','flash-down'), 1500);
      }
      prevPrices[entry.sym] = price;

      const fmt = entry.sym === 'BTC-USD'
        ? '$' + Math.round(price).toLocaleString()
        : '$' + price.toFixed(2);
      pEl.textContent = fmt;
      pEl.classList.remove('loading-pulse');

      const sign = chgPct >= 0 ? '+' : '';
      cEl.textContent = sign + chgPct.toFixed(2) + '%';
      cEl.className = 'pc-chg ' + (chgPct >= 0 ? 'up' : 'dn');
    });
    const label = document.getElementById('last-update-label');
    if (label) {
      const now = new Date();
      label.textContent = 'Updated ' + now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    }
  } catch(e) {
    console.warn('Price fetch error:', e);
  }
}

let refreshTimer;
function scheduleRefresh() {
  clearInterval(refreshTimer);
  fetchPrices();
  refreshTimer = setInterval(fetchPrices, 5 * 60 * 1000); // 5-min auto refresh
}

function manualRefresh() {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.textContent = '↻ REFRESHING...';
  fetchPrices().then(() => {
    if (btn) btn.textContent = '↻ REFRESH';
  });
}


// ── LIVE INTEL FROM strait-news-worker v3 ────────────────────────────────────
const INTEL_API = 'https://strait-news-worker.thom-rvr.workers.dev';
const MOBILE_CACHE_KEY = 'strait_intel_mobile_v3';

function loadMobileCachedIntel() {
  try {
    var c = JSON.parse(localStorage.getItem(MOBILE_CACHE_KEY) || 'null');
    if (c) applyMobileIntel(c);
  } catch(e) {}
}

function fetchLiveIntel() {
  fetch(INTEL_API + '/intel', { headers: { 'User-Agent': 'StraitTrackerMobile/20' } })
    .then(r => r.json())
    .then(d => {
      applyMobileIntel(d);
      try { localStorage.setItem(MOBILE_CACHE_KEY, JSON.stringify(d)); } catch(e) {}
    })
    .catch(e => console.warn('[Mobile] Intel fetch error:', e));
}


function renderMobileEvents(events) {
  var list = document.getElementById('news-list');
  if (!list || !events || !events.length) return;
  var COLOR = { red:'var(--red)', orange:'var(--orange)', blue:'var(--blue)', green:'var(--green)', purple:'#a855f7', yellow:'#ffd700' };
  var html = '';
  events.forEach(function(ev) {
    var dot = COLOR[ev.tag_color] || 'var(--red)';
    var icon = ev.icon ? (ev.icon + ' ') : '';
    var date = (ev.date || '').toUpperCase();
    var tag = ev.tag ? (' · ' + ev.tag) : '';
    var title = ev.title || '';
    var body = ev.body || '';
    var src = ev.source || '';
    html += '<div class="news-item">';
    html += '<div class="news-dot" style="background:' + dot + '"></div>';
    html += '<div class="news-body">';
    html += '<div class="news-time">' + icon + date + tag + '</div>';
    html += '<div class="news-text"><strong>' + title + '</strong> — ' + body + '</div>';
    html += '<div class="news-src">' + src + '</div>';
    html += '</div></div>';
  });
  list.innerHTML = html;
}

function applyMobileIntel(d) {
  // Render live event feed into #news-list (mobile INTEL tab)
  if (d.events && d.events.length) renderMobileEvents(d.events);
  // Update ticker with live items
  if (d.ticker && d.ticker.length) {
    var track = document.getElementById('ticker-track');
    if (track) {
      var items = d.ticker.concat(d.ticker); // duplicate for seamless loop
      track.innerHTML = items.map(t => {
        var cls = t.startsWith('⚡') || t.startsWith('🚢') || t.includes('FLASH') ? 'hot' :
                  t.startsWith('🕊') || t.startsWith('✅') ? 'ok' : 'warm';
        return '<span class="ticker-item ' + cls + '">' + t + '</span>';
      }).join('');
    }
  }

  // Update war day display
  if (d.war_day) {
    var wdEl = document.getElementById('war-day-header');
    if (!wdEl) {
      // Try any element showing war day text
      document.querySelectorAll('*').forEach(el => {
        if (el.textContent && el.textContent.includes('WAR DAY')) {
          el.textContent = el.textContent.replace(/WAR DAY \d+/, 'WAR DAY ' + d.war_day);
        }
      });
    } else { wdEl.textContent = d.war_day; }
  }

  // Update status pills (ceasefire / hormuz / blockade)
  if (d.status) {
    function setStatus(id, val) {
      var el = document.getElementById(id);
      if (el && val) el.textContent = val;
    }
    setStatus('ms-ceasefire', d.status.ceasefire || d.status.ceasefire_status);
    setStatus('ms-hormuz', d.status.hormuz || d.status.hormuz_status);
    setStatus('ms-blockade', d.status.blockade || d.status.blockade_status);
    setStatus('ms-talks', d.status.talks || d.status.peace_talks);
  }

  // Update oil prices
  if (d.oil && d.oil.brent) {
    var oilEl = document.getElementById('ms-oil');
    if (oilEl) oilEl.textContent = 'BRENT $' + parseFloat(d.oil.brent).toFixed(2);
  }

  // Update operation Project Freedom status
  if (d.operation) {
    var opEl = document.getElementById('ms-operation');
    if (!opEl) {
      // inject into stat grid
      var grid = document.querySelector('.mini-stat-grid, .stats-grid, .ms-grid');
      if (grid) {
        var newRow = document.createElement('div');
        newRow.className = 'ms-row';
        newRow.innerHTML = '<span class="ms-label">Project Freedom</span><span class="ms-val" id="ms-operation" style="color:var(--orange)">' + d.operation.status + '</span>';
        grid.appendChild(newRow);
      }
    } else {
      opEl.textContent = d.operation.status;
    }
  }
}

// Auto-refresh intel every 15 minutes
setInterval(fetchLiveIntel, 15 * 60 * 1000);

// ── BOOT ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const msg = document.getElementById('loader-msg');
  const app = document.getElementById('app');
  const loader = document.getElementById('loader');

  if (msg) msg.textContent = 'INITIALIZING MAP...';
  setTimeout(() => {
    initMap();
    if (msg) msg.textContent = 'FETCHING INTEL...';
    scheduleRefresh();
    loadMobileCachedIntel();
    fetchLiveIntel();
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s';
      app.style.display = 'grid';
      setTimeout(() => { loader.style.display = 'none'; }, 500);
      // Initial drawer state — peek
      setDrawerH(PEEK);
      if (window._map) window._map.invalidateSize();
    }, 800);
  }, 200);
});
</script>
</body>
</html>`;
}
