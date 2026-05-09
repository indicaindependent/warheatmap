export default {
  async fetch(req, env) {
    const url  = new URL(req.url);
    const path = url.pathname;
    const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Headers': '*' };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type' }});
    }

    // ── SMOKE TEST ──
    if (path === '/smoke-test' && req.method === 'POST') {
      const _auth = req.headers.get('Authorization') || '';
      if (_auth !== (env.SMOKE_TEST_TOKEN ? 'Bearer ' + env.SMOKE_TEST_TOKEN : 'Bearer __disabled__')) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      return Response.json({ ok: true, worker: 'strait-news-worker', version: '3.0', updated: new Date().toISOString() });
    }

    // ── PUBLIC ENDPOINTS ──
    if (path === '/intel' || path === '/news/latest' || path === '/news') return handleGetIntel(env, CORS, path);
    if (path === '/status')      return handleGetStatus(env, CORS);
    if (path === '/oil-live')    return handleGetOilLive(env, CORS);
    if (path === '/ais')         return handleGetAIS(env, CORS);
    if (path === '/vessels')     return handleGetVessels(env, CORS);
    if (path === '/ticker')      return handleGetTicker(env, CORS);
    if (path === '/health')      return Response.json({ ok: true, version: '3.0', ts: new Date().toISOString() }, { headers: CORS });

    // ── ADMIN ENDPOINTS ──
    const auth = req.headers.get('Authorization') || '';
    const WORKER_SECRET = env.WORKER_SECRET || '2xht-vqg7-gxse-csfk';
    if (auth !== `Bearer ${WORKER_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });
    }
    if (path === '/admin/refresh' && req.method === 'POST') return handleAdminRefresh(env, CORS);
    if (path === '/admin/status'  && req.method === 'GET')  return handleAdminStatus(env, CORS);

    return Response.json({ ok: true, version: '3.0', endpoints: ['/intel', '/news/latest', '/status', '/oil-live', '/ais', '/vessels', '/ticker', '/health'] }, { headers: CORS });
  },

  // ── CRON: every 30 minutes ──
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runFullCycle(env));
  },
};

// ─── UNIFIED INTEL HANDLER ────────────────────────────────────────────────────
async function handleGetIntel(env, CORS, path) {
  try {
    const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json');
    if (cached) {
      // backward compat: /news/latest returns items-only format
      if (path === '/news/latest' || path === '/news') {
        return new Response(JSON.stringify({
          items: (cached.events || []).slice(0, 8),
          status: cached.status,
          updated: cached.updated,
          oil: cached.oil,
          ticker: cached.ticker,
        }), { headers: CORS });
      }
      return new Response(JSON.stringify(cached), { headers: CORS });
    }
    // No data yet — return static backstop
    const warDay = Math.floor((Date.now() - WAR_START) / 86400000);
    return new Response(JSON.stringify(buildBackstopPayload(warDay)), { headers: CORS });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message, events: BACKSTOP_EVENTS, vessels: STATIC_VESSELS }), { status: 500, headers: CORS });
  }
}

async function handleGetStatus(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  return new Response(JSON.stringify(cached?.status || {}), { headers: CORS });
}

async function handleGetOilLive(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('oil_cache', 'json').catch(() => null);
  return new Response(JSON.stringify(cached || { brent: null, wti: null, note: 'cache empty' }), { headers: CORS });
}

async function handleGetAIS(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_ais', 'json').catch(() => null);
  return new Response(JSON.stringify(cached || { vessels: [], count: 0 }), { headers: CORS });
}

async function handleGetVessels(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  return new Response(JSON.stringify(cached?.vessels || STATIC_VESSELS), { headers: CORS });
}

async function handleGetTicker(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  return new Response(JSON.stringify(cached?.ticker || []), { headers: CORS });
}

async function handleAdminRefresh(env, CORS) {
  try {
    const result = await runFullCycle(env);
    return Response.json({ ok: true, result }, { headers: CORS });
  } catch(e) {
    return Response.json({ ok: false, error: e.message }, { status: 500, headers: CORS });
  }
}

async function handleAdminStatus(env, CORS) {
  const intel  = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  const oil    = await env.STRAIT_NEWS_KV.get('oil_cache', 'json').catch(() => null);
  const hash   = await env.STRAIT_NEWS_KV.get('article_hash').catch(() => null);
  return Response.json({
    intel_updated: intel?.updated || null,
    intel_events: intel?.events?.length || 0,
    oil_brent: oil?.brent || null,
    article_hash: hash,
    worker_version: '3.0',
  }, { headers: CORS });
}

// ─── FULL CYCLE ───────────────────────────────────────────────────────────────
async function runFullCycle(env) {
  const now = new Date();
  console.log(`[runFullCycle] Starting at ${now.toISOString()}`);

  // Article hash dedup — skip Claude if news hasn't changed
  const [articles, oil, aisData] = await Promise.allSettled([
    fetchNewsArticles(env),
    fetchOilPrices(env),
    fetchAISData(env),
  ]);

  const safeArticles = articles.status === 'fulfilled' ? articles.value : [];
  const safeOil      = oil.status      === 'fulfilled' ? oil.value      : { brent: null, wti: null };
  const safeAIS      = aisData.status  === 'fulfilled' ? aisData.value  : { vessels: [], count: 0 };

  console.log(`[runFullCycle] Articles: ${safeArticles.length}, Oil: Brent=$${safeOil.brent}, AIS: ${safeAIS.count} vessels`);

  // Hash dedup — only re-synthesize if articles changed
  const newHash = simpleHash(safeArticles.map(a => a.title).join('|'));
  const prevHash = await env.STRAIT_NEWS_KV.get('article_hash').catch(() => null);
  const prevCached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  const cacheAge = prevCached ? (Date.now() - new Date(prevCached.updated).getTime()) : Infinity;

  let intel;
  if (newHash === prevHash && cacheAge < 3600000 && prevCached) {
    // Articles unchanged and cache < 1h old — just update oil + timestamp
    console.log(`[runFullCycle] Articles unchanged (hash=${newHash}), skipping synthesis. Cache age: ${Math.round(cacheAge/60000)}m`);
    intel = { ...prevCached, oil: safeOil };
  } else {
    // Synthesize fresh intel
    intel = await synthesizeIntel(env, safeArticles, safeOil, safeAIS, now);
    await env.STRAIT_NEWS_KV.put('article_hash', newHash);
    console.log(`[runFullCycle] Synthesis complete. Events: ${intel.events?.length}, Threat: ${intel.status?.threat_level}`);
  }

  // Always update oil cache
  if (safeOil.brent) {
    await env.STRAIT_NEWS_KV.put('oil_cache', JSON.stringify({ ...safeOil, ts: now.toISOString() }), { expirationTtl: 21600 }).catch(() => {});
  }

  // Build full v3 payload
  const warDay = Math.floor((now - WAR_START) / 86400000);
  const payload = {
    version: 3,
    updated: now.toISOString(),
    war_day: warDay,
    operation: intel.operation || buildOpFreedomStatus(intel),
    status: intel.status || {},
    stats: intel.stats || buildDefaultStats(safeOil),
    events: (intel.events && intel.events.length > 0) ? intel.events : BACKSTOP_EVENTS,
    ticker: intel.ticker || buildDefaultTicker(),
    vessels: intel.vessels || STATIC_VESSELS,
    naval_assets: STATIC_NAVAL_ASSETS,
    oil: safeOil,
    ais: { count: safeAIS.count, updated: now.toISOString() },
  };

  await env.STRAIT_NEWS_KV.put('hormuz_intel_v3', JSON.stringify(payload), { expirationTtl: 86400 * 2 });

  // Threat escalation alert
  const prevThreat = await env.STRAIT_NEWS_KV.get('prev_threat_level').catch(() => null);
  const newThreat  = payload.status?.threat_level || '';
  if (prevThreat && prevThreat !== newThreat && (newThreat === 'CRITICAL' || newThreat === 'WAR')) {
    await sendTelegramAlert(env, `<b>⚠️ HORMUZ THREAT ESCALATION</b>\n${prevThreat} → <b>${newThreat}</b>\n${payload.status?.summary_one_line || ''}`);
  }
  await env.STRAIT_NEWS_KV.put('prev_threat_level', newThreat).catch(() => {});

  return { events: payload.events.length, updated: now.toISOString(), oil: safeOil, ais_vessels: safeAIS.count, hash: newHash };
}

// ─── NEWS FETCH ───────────────────────────────────────────────────────────────
async function fetchNewsArticles(env) {
  const articles = [];
  const seen = new Set();
  const queries = [
    'Strait of Hormuz May 2026',
    'Operation Project Freedom Iran US Navy',
    'Iran US ceasefire Hormuz ship attack May 2026',
    'IRGC tanker seized Gulf Oman 2026',
    'Iran nuclear deal Hormuz Rubio negotiations',
    'US Iran strikes Hormuz tanker May 2026',
    'Iran Hormuz transit rules shipping blockade',
  ];

  for (const q of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=8&language=en&apiKey=${env.NEWSAPI_KEY}`;
      const resp = await fetch(url, { headers: { 'User-Agent': 'StraitTracker/3.0' } });
      if (!resp.ok) { console.warn(`[fetchNewsArticles] Query "${q}" returned ${resp.status}`); continue; }
      const data = await resp.json();
      for (const a of (data.articles || [])) {
        if (!a.title || seen.has(a.title)) continue;
        if (a.title === '[Removed]') continue;
        seen.add(a.title);
        articles.push({
          title: a.title,
          description: a.description || '',
          source: a.source?.name || 'Unknown',
          published: a.publishedAt || '',
          url: a.url || '',
        });
      }
    } catch(e) { console.warn(`[fetchNewsArticles] Error on "${q}":`, e.message); }
  }

  // Sort by date, return top 40
  articles.sort((a, b) => new Date(b.published) - new Date(a.published));
  console.log(`[fetchNewsArticles] Total unique articles: ${articles.length}`);
  return articles.slice(0, 40);
}

// ─── OIL PRICES ──────────────────────────────────────────────────────────────
async function fetchOilPrices(env) {
  const AV_KEY = (env && env.ALPHA_VANTAGE_KEY) || '';
  const FH_KEY = (env && env.FINNHUB_API_KEY) || '';
  const oil = { brent: null, wti: null, brent_prev: null, wti_prev: null, brent_change: null, wti_change: null };

  // Strategy 1: Alpha Vantage BRENT
  try {
    if (AV_KEY) {
      const r = await fetch(`https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${AV_KEY}`, { headers: { 'User-Agent': 'StraitTracker/3.0' } });
      if (r.ok) {
        const d = await r.json();
        const data = d['data'] || [];
        if (data.length >= 2) {
          oil.brent = parseFloat(data[0]?.value);
          oil.brent_prev = parseFloat(data[1]?.value);
          const pct = ((oil.brent - oil.brent_prev) / oil.brent_prev * 100).toFixed(2);
          oil.brent_change = (pct > 0 ? '+' : '') + pct + '%';
        }
      }
    }
  } catch(e) { console.warn('[fetchOilPrices] AV Brent error:', e.message); }

  // Strategy 2: Alpha Vantage WTI
  try {
    if (AV_KEY) {
      const r = await fetch(`https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${AV_KEY}`, { headers: { 'User-Agent': 'StraitTracker/3.0' } });
      if (r.ok) {
        const d = await r.json();
        const data = d['data'] || [];
        if (data.length >= 2) {
          oil.wti = parseFloat(data[0]?.value);
          oil.wti_prev = parseFloat(data[1]?.value);
          const pct = ((oil.wti - oil.wti_prev) / oil.wti_prev * 100).toFixed(2);
          oil.wti_change = (pct > 0 ? '+' : '') + pct + '%';
        }
      }
    }
  } catch(e) { console.warn('[fetchOilPrices] AV WTI error:', e.message); }

  // Strategy 3: Finnhub fallback for BNO (Brent ETF proxy)
  if (!oil.brent && FH_KEY) {
    try {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=BNO&token=${FH_KEY}`);
      if (r.ok) {
        const d = await r.json();
        if (d.c) {
          // BNO trades at ~1/3 of Brent spot — rough proxy
          oil.brent = parseFloat((d.c * 3.1).toFixed(2));
          const pct = ((d.c - d.pc) / d.pc * 100).toFixed(2);
          oil.brent_change = (pct > 0 ? '+' : '') + pct + '%';
          console.log('[fetchOilPrices] Used Finnhub BNO proxy for Brent');
        }
      }
    } catch(e) { console.warn('[fetchOilPrices] Finnhub BNO error:', e.message); }
  }

  // Strategy 4: Yahoo Finance proxy for CL=F (WTI futures)
  if (!oil.wti) {
    try {
      const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=2d', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (r.ok) {
        const d = await r.json();
        const price = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) { oil.wti = parseFloat(price.toFixed(2)); console.log('[fetchOilPrices] Yahoo WTI:', oil.wti); }
      }
    } catch(e) { console.warn('[fetchOilPrices] Yahoo WTI error:', e.message); }
  }

  // Strategy 5: Last known cache fallback
  if (!oil.brent || !oil.wti) {
    try {
      const cached = await env.STRAIT_NEWS_KV.get('oil_cache', 'json');
      if (cached) {
        if (!oil.brent && cached.brent) { oil.brent = cached.brent; oil.brent_change = cached.brent_change; }
        if (!oil.wti && cached.wti) { oil.wti = cached.wti; oil.wti_change = cached.wti_change; }
        console.log('[fetchOilPrices] Used KV cache fallback');
      }
    } catch(e) {}
  }

  console.log(`[fetchOilPrices] Final: Brent=$${oil.brent} (${oil.brent_change}), WTI=$${oil.wti} (${oil.wti_change})`);
  return oil;
}

// ─── AIS DATA ─────────────────────────────────────────────────────────────────
async function fetchAISData(env) {
  // AISstream requires WebSocket — use HTTP snapshot/bounding-box if available
  // For now use cached data + count from KV
  try {
    const cached = await env.STRAIT_NEWS_KV.get('hormuz_ais', 'json');
    if (cached && (Date.now() - new Date(cached.updated || 0).getTime()) < 3600000) {
      return cached;
    }
  } catch(e) {}
  return { vessels: [], count: 0, tanker_count: 0, military_count: 0, updated: new Date().toISOString() };
}

// ─── CLAUDE SYNTHESIS ─────────────────────────────────────────────────────────
async function synthesizeIntel(env, articles, oil, aisData, now) {
  const warDay = Math.floor((now - WAR_START) / 86400000);
  const oilCtx = `Brent: $${oil.brent || 'N/A'} (${oil.brent_change || '—'}). WTI: $${oil.wti || 'N/A'} (${oil.wti_change || '—'}).`;
  const aisCtx = aisData.count > 0
    ? `AIS LIVE: ${aisData.count} vessels in Hormuz region. Tankers: ${aisData.tanker_count}. Military: ${aisData.military_count}.`
    : 'AIS: No live vessel data this cycle.';

  const articleText = articles.slice(0, 30).map((a, i) =>
    `[${i+1}] ${a.published?.slice(0,16)} | ${a.source} | ${a.title} | ${a.description?.slice(0,200) || ''}`
  ).join('\n');

  const prompt = `CURRENT DATE/TIME: ${now.toUTCString()} | WAR DAY: ${warDay}
OIL PRICES: ${oilCtx}
${aisCtx}

GROUND TRUTH CONTEXT — MAY 9, 2026 (authoritative, use this as baseline):
- Iran-US-Israel war began ~Feb 27, 2026. WAR DAY ${warDay}.
- Operation Project Freedom: LAUNCHED May 4 (15,000 troops, 100+ aircraft), PAUSED May 5 for diplomacy.
- Trump warned today he may RESUME Project Freedom if Iran doesn't respond to US peace proposal.
- Ceasefire: FRAGILE. US struck Iranian tankers M/T Hasna + Sea Star III (F/A-18 strafing) May 9.
- Iran seized tanker Ocean Koi in Gulf of Oman May 8-9 (IRGC "special operation").
- Iran imposed new Hormuz transit RULES — Tehran declares itself "regulator" of the Strait.
- US/Iran exchanged fire May 7 — both claim self-defense. Ceasefire nominally holds.
- Bahrain detained 41 people for alleged IRGC links (May 9).
- US awaiting Iran response to peace proposal (Rubio). Oman mediating.
- Brent crude: ~$109-115/bbl. Shipping insurance: 20x normal rates.
- Hundreds of vessels still stranded. 20,000+ seafarers affected.
- Key threat: Trump could restart Project Freedom at any time.

RECENT NEWS ARTICLES:
${articleText || 'No new articles available this cycle — use ground truth context above.'}

You are a naval OSINT intelligence analyst producing structured JSON for a live crisis tracker.
Respond ONLY with valid JSON — no markdown, no explanation, just the JSON object.

{
  "operation": {
    "name": "Operation Project Freedom",
    "status": "one of: ACTIVE | PAUSED | SUSPENDED | THREATENED | ENDED",
    "detail": "1-2 sentence current status of the operation",
    "color": "one of: red | orange | yellow | green"
  },
  "status": {
    "ceasefire": "string max 50 chars — e.g. FRAGILE — ACTIVE STRIKES",
    "hormuz": "string max 50 chars — e.g. CONTESTED — IRAN IMPOSING RULES",
    "blockade": "string max 50 chars — e.g. PARTIAL — US/IRAN BOTH ENFORCING",
    "talks": "string max 60 chars — e.g. AWAITING IRAN RESPONSE (Oman)",
    "threat_level": "CRITICAL | HIGH | ELEVATED | MODERATE | LOW",
    "war_day": ${warDay},
    "summary_one_line": "string max 120 chars — current situation summary"
  },
  "stats": {
    "vessels_trapped": "string e.g. 200+ VESSELS",
    "seafarers_trapped": "20,000+",
    "oil_brent": ${oil.brent || 'null'},
    "oil_wti": ${oil.wti || 'null'},
    "ships_escort_convoy": "number or string",
    "us_forces_theater": "90,000+",
    "insurance_premium_multiplier": "20x"
  },
  "events": [
    {
      "id": "unique 4-char string",
      "date": "May 9, 2026",
      "tag": "FLASH | BREAKING | UPDATE | CEASEFIRE | SUPPLY | NAVAL | DIPLOMATIC | INTEL | ECONOMIC",
      "tag_color": "red | orange | blue | green | purple | yellow",
      "icon": "single emoji",
      "title": "ALL CAPS TITLE MAX 65 CHARS",
      "body": "2-3 sentences. Military intelligence style. Specific facts only.",
      "source": "Source Name — Date",
      "severity": "critical | high | medium | low"
    }
  ],
  "ticker": [
    "Short breaking-news string max 90 chars — present tense, factual"
  ],
  "vessels": null
}

Produce 8-12 events covering the most important developments from May 1-9, 2026.
Prioritize CRITICAL severity events first. Include exactly 6-8 ticker items.
Events must be factual and sourced — do not invent events not in the articles or context above.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic ${response.status}: ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const raw  = data.content?.[0]?.text || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[synthesizeIntel] Claude success. Events: ${parsed.events?.length}, Threat: ${parsed.status?.threat_level}`);

    // Merge vessels: always use static (Claude doesn't produce them)
    parsed.vessels = STATIC_VESSELS;
    return parsed;

  } catch(e) {
    console.error('[synthesizeIntel] Claude failed:', e.message);
    // Gemini fallback
    return await synthesizeWithGemini(env, articles, oil, warDay, prompt, e.message);
  }
}

// ─── GEMINI FALLBACK ──────────────────────────────────────────────────────────
async function synthesizeWithGemini(env, articles, oil, warDay, prompt, claudeError) {
  console.log('[synthesizeWithGemini] Attempting Gemini fallback. Claude error:', claudeError);
  try {
    const GEMINI_KEY = env.GEMINI_API_KEY || '';
    if (!GEMINI_KEY) throw new Error('No GEMINI_API_KEY');

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3000, temperature: 0.3 },
      }),
    });

    if (!r.ok) throw new Error(`Gemini ${r.status}`);
    const d = await r.json();
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);
    parsed.vessels = STATIC_VESSELS;
    parsed._synthesizer = 'gemini-fallback';
    console.log('[synthesizeWithGemini] Gemini success. Events:', parsed.events?.length);
    return parsed;

  } catch(e) {
    console.error('[synthesizeWithGemini] Gemini also failed:', e.message);
    // Ultimate fallback: return backstop payload
    return buildBackstopPayload(warDay);
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function buildBackstopPayload(warDay) {
  return {
    version: 3,
    updated: new Date().toISOString(),
    war_day: warDay,
    _source: 'static-backstop',
    operation: {
      name: 'Operation Project Freedom',
      status: 'PAUSED',
      detail: 'Launched May 4. Paused May 5 for diplomacy. Trump threatens resumption if Iran stalls.',
      color: 'orange',
    },
    status: {
      ceasefire: 'FRAGILE — ACTIVE STRIKES',
      hormuz: 'CONTESTED — IRAN IMPOSING RULES',
      blockade: 'PARTIAL — US/IRAN BOTH ENFORCING',
      talks: 'AWAITING IRAN RESPONSE (OMAN)',
      threat_level: 'CRITICAL',
      war_day: warDay,
      summary_one_line: 'US struck 2 Iranian tankers May 9; Iran seized Ocean Koi; Project Freedom paused pending deal',
    },
    stats: {
      vessels_trapped: 'HUNDREDS',
      seafarers_trapped: '20,000+',
      oil_brent: null,
      oil_wti: null,
      us_forces_theater: '90,000+',
      insurance_premium_multiplier: '20x',
    },
    events: BACKSTOP_EVENTS,
    ticker: buildDefaultTicker(),
    vessels: STATIC_VESSELS,
    naval_assets: STATIC_NAVAL_ASSETS,
    oil: { brent: null, wti: null },
    ais: { count: 0 },
  };
}

function buildOpFreedomStatus(intel) {
  const threat = intel?.status?.threat_level || 'HIGH';
  return {
    name: 'Operation Project Freedom',
    status: 'PAUSED',
    detail: 'Launched May 4 by CENTCOM. Paused May 5 for Iran deal negotiations. Trump threatens resumption.',
    color: threat === 'CRITICAL' ? 'red' : 'orange',
  };
}

function buildDefaultStats(oil) {
  return {
    vessels_trapped: 'HUNDREDS',
    seafarers_trapped: '20,000+',
    oil_brent: oil?.brent || null,
    oil_wti: oil?.wti || null,
    us_forces_theater: '90,000+',
    insurance_premium_multiplier: '20x',
  };
}

function buildDefaultTicker() {
  return [
    '⚡ US F/A-18s strafe Iranian tankers in Gulf of Oman — May 9, 2026',
    '🚢 Iran seizes Ocean Koi tanker — IRGC "special operation" in Gulf of Oman',
    '⏸ Operation Project Freedom PAUSED — Trump threatens resumption if Iran stalls',
    '🕊 Ceasefire nominally holds despite active exchanges of fire — May 9',
    '📜 Iran imposing new Hormuz transit rules — declares itself strait "regulator"',
    '🔒 Bahrain detains 41 alleged IRGC operatives — May 9, 2026',
    '🛢 Brent crude elevated — shipping insurance 20x normal rates',
    '🌐 US awaiting Iran response to peace proposal — Oman mediation ongoing',
  ];
}
