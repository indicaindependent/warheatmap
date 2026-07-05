// FaceMap USA — Data Pipeline Cron Worker
// Runs weekly: scrapes USASpending + MuckRock + sends Telegram digest
// DB: facemap-db (evilempire-db reused) | Worker: facemap-cron

const ACCOUNT_ID = '91e3df7c6e6ad68916abed8239621648';
const PETE_TELEGRAM_ID = '1484600451403091981';

const FACEREC_VENDORS = [
  'clearview', 'idemia', 'nec corporation', 'veritone', 'vigilant',
  'rank one', 'cognitec', 'nec', 'dataworks', 'aware inc', 'ayonix',
  'neurotechnology', 'paravision', 'sightcorp'
];

const FACEREC_KEYWORDS = [
  'facial recognition', 'face recognition', 'biometric identification',
  'face match', 'facewatch', 'facerec'
];

async function d1Query(db, sql, params = []) {
  const result = await db.prepare(sql).bind(...params).all();
  return result;
}

async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
}

async function scrapeUSASpending(db, telegramToken) {
  console.log('Scraping USASpending...');
  const newContracts = [];

  for (const keyword of FACEREC_KEYWORDS) {
    try {
      const resp = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'FaceMapUSA/2.0 VPDLNY' },
        body: JSON.stringify({
          subawards: false,
          limit: 25,
          page: 1,
          filters: {
            keywords: [keyword],
            award_type_codes: ['A', 'B', 'C', 'D'],
            time_period: [{ start_date: '2024-01-01', end_date: '2027-12-31' }]
          },
          fields: [
            'Award ID', 'Recipient Name', 'Award Amount',
            'Awarding Agency', 'Place of Performance City Name',
            'Place of Performance State Code', 'Start Date', 'End Date', 'Description'
          ],
          sort: 'Award Amount',
          order: 'desc'
        })
      });

      if (!resp.ok) continue;
      const data = await resp.json();
      const results = data.results || [];

      for (const award of results) {
        const awardId = award['Award ID'] || '';
        if (!awardId) continue;

        // Check if already in DB
        const existing = await db.prepare(
          'SELECT award_id FROM federal_contracts WHERE award_id = ?'
        ).bind(awardId).first();

        if (!existing) {
          const vendor = (award['Recipient Name'] || '').toUpperCase();
          const amount = award['Award Amount'] || 0;
          const agency = award['Awarding Agency'] || '';
          const city = award['Place of Performance City Name'] || '';
          const state = award['Place of Performance State Code'] || '';
          const desc = (award['Description'] || '').substring(0, 500);

          await db.prepare(`
            INSERT OR IGNORE INTO federal_contracts 
            (award_id, vendor, agency, description, amount, start_date, end_date, location_city, location_state, detected_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)
          `).bind(
            awardId, vendor, agency, desc, amount,
            award['Start Date'] || '', award['End Date'] || '',
            city, state, new Date().toISOString()
          ).run();

          newContracts.push({ vendor, agency, amount, city, state, awardId });
        }
      }
    } catch (err) {
      console.error(`USASpending error for "${keyword}":`, err.message);
    }
  }

  return newContracts;
}

async function scrapeMuckRock(db) {
  console.log('Checking MuckRock FOIA...');
  const newFOIAs = [];
  try {
    const resp = await fetch(
      'https://www.muckrock.com/api_v1/foia/?format=json&search=facial+recognition&page_size=20',
      { headers: { 'User-Agent': 'FaceMapUSA/2.0 VPDLNY' } }
    );
    if (!resp.ok) return newFOIAs;
    const data = await resp.json();
    const foias = data.results || [];
    // Just count them for the digest — we don't store FOIAs separately yet
    return foias.slice(0, 5).map(f => ({
      title: f.title || 'Untitled',
      agency: f.agency || 'Unknown',
      status: f.status || 'unknown'
    }));
  } catch (e) {
    console.error('MuckRock error:', e.message);
    return [];
  }
}

async function refreshNewsCache(db, newsApiKey) {
  if (!newsApiKey) return 0;
  console.log('Refreshing news cache...');
  
  const queries = [
    'facial recognition police contract',
    'clearview AI surveillance',
    'facial recognition ban city',
    'biometric surveillance law enforcement'
  ];

  let total = 0;
  for (const q of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${newsApiKey}`;
      const resp = await fetch(url, { headers: { 'User-Agent': 'FaceMapUSA/2.0' } });
      if (!resp.ok) continue;
      const data = await resp.json();
      
      for (const article of (data.articles || [])) {
        if (!article.url || !article.title) continue;
        const id = btoa(article.url).substring(0, 32);
        await db.prepare(`
          INSERT OR IGNORE INTO news_cache (id, city, state, headline, url, source_name, published_at, fetched_at)
          VALUES (?,?,?,?,?,?,?,?)
        `).bind(
          id, 'NATIONAL', 'US',
          article.title.substring(0, 200),
          article.url,
          article.source?.name || 'Unknown',
          article.publishedAt || '',
          new Date().toISOString()
        ).run();
        total++;
      }
    } catch (e) {
      console.error('News error:', e.message);
    }
  }
  return total;
}

async function sendWeeklyDigest(env, newContracts, foias, newsCount) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const now = new Date().toLocaleDateString('en-US', { 
    timeZone: 'America/New_York', 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

  let msg = `<b>📡 FaceMap USA — Weekly Intel Digest</b>\n<i>${now}</i>\n\n`;

  if (newContracts.length > 0) {
    msg += `<b>🚨 NEW CONTRACTS DETECTED (${newContracts.length})</b>\n`;
    for (const c of newContracts.slice(0, 5)) {
      const amt = c.amount > 0 ? `$${c.amount.toLocaleString()}` : 'undisclosed';
      msg += `• <b>${c.vendor}</b> → ${c.agency}\n  ${c.city || 'Unknown'}, ${c.state || 'US'} — ${amt}\n`;
    }
    if (newContracts.length > 5) msg += `  ...and ${newContracts.length - 5} more\n`;
    msg += '\n';
  } else {
    msg += `✅ <b>No new contracts detected this week</b>\n\n`;
  }

  if (foias.length > 0) {
    msg += `<b>📋 Recent FOIA Activity (MuckRock)</b>\n`;
    for (const f of foias.slice(0, 3)) {
      msg += `• ${f.title.substring(0, 60)} — <i>${f.status}</i>\n`;
    }
    msg += '\n';
  }

  msg += `<b>📰 News Cache:</b> +${newsCount} articles refreshed\n\n`;
  msg += `<a href="https://facemap.ptsdtree.com">🗺️ View FaceMap USA</a>`;

  await sendTelegram(token, PETE_TELEGRAM_ID, msg);
}


// ─── TELEGRAM ERROR ALERT ─────────────────────────────────────────────────────
async function sendTelegramAlert(env, msg, prefix) {
  try {
    const BOT  = (env && env.TELEGRAM_BOT_TOKEN) || "__REDACTED_TG_BOT__";
    const CHAT = (env && env.TELEGRAM_PETE_ID)   || '1484600451403091981';
    const tag  = prefix || 'WORKER';
    await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text: `[${tag}] ${msg}`.slice(0, 4000) }),
    });
  } catch(_) {}
}

export default {
  async scheduled(event, env, ctx) {
    console.log('FaceMap cron firing...');
    const db = env.FACEMAP_DB;
    
    const newContracts = await scrapeUSASpending(db, env.TELEGRAM_BOT_TOKEN);
    const foias = await scrapeMuckRock(db);
    const newsCount = await refreshNewsCache(db, env.NEWS_API_KEY);

    // Update meta
    await db.prepare("INSERT OR REPLACE INTO meta (key,value) VALUES (?,?)")
      .bind('last_cron_run', new Date().toISOString()).run();
    await db.prepare("INSERT OR REPLACE INTO meta (key,value) VALUES (?,?)")
      .bind('last_new_contracts', String(newContracts.length)).run();

    await sendWeeklyDigest(env, newContracts, foias, newsCount);
    console.log(`Done. New contracts: ${newContracts.length} | News: ${newsCount}`);
  },

  async fetch(request, env) {
    // Manual trigger endpoint for testing
    const url = new URL(request.url);

    // ── SMOKE TEST ───────────────────────────────────────────────────────────
    if (url.pathname === '/smoke-test' && request.method === 'POST') {
      const _auth = request.headers.get('Authorization') || '';
      if (_auth !== 'Bearer smoke-9f8e7d6c5b4a3f2e1d0c') return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      const _t0 = Date.now();
      return Response.json({ ok: true, elapsed_ms: Date.now() - _t0, worker: 'facemap-cron' });
    }

    if (url.pathname === '/run' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader !== `Bearer ${env.WORKER_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      const db = env.FACEMAP_DB;
      const newContracts = await scrapeUSASpending(db, env.TELEGRAM_BOT_TOKEN);
      const foias = await scrapeMuckRock(db);
      const newsCount = await refreshNewsCache(db, env.NEWS_API_KEY);
      await sendWeeklyDigest(env, newContracts, foias, newsCount);
      return Response.json({ ok: true, new_contracts: newContracts.length, news: newsCount });
    }

    const db = env.FACEMAP_DB;
    const meta = await db.prepare('SELECT key, value FROM meta').all();
    const entries = await db.prepare('SELECT COUNT(*) as n FROM surveillance_entries').first();
    const contracts = await db.prepare('SELECT COUNT(*) as n FROM federal_contracts').first();
    
    return Response.json({
      status: 'FaceMap Cron Worker',
      entries: entries?.n || 0,
      federal_contracts: contracts?.n || 0,
      meta: Object.fromEntries((meta.results || []).map(r => [r.key, r.value]))
    });
  }
};