// facemap-intel-worker.js
// Daily intel ingestion pipeline for FaceHeatMap
// Pulls RSS feeds → filters → deduplicates → writes to D1
// Cron: 0 11 * * * (6am ET daily)
// Manual trigger: GET /refresh with secret header

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ ok: true, worker: 'facemap-intel', time: new Date().toISOString() });
    }
    
    // Manual trigger (protected)
    if (url.pathname === '/refresh') {
      const secret = request.headers.get('X-Intel-Secret') || url.searchParams.get('secret');
      if (secret !== env.INTEL_SECRET) {
        return Response.json({ error: 'unauthorized' }, { status: 401 });
      }
      const result = await runIngestion(env);
      return Response.json(result);
    }

    return Response.json({ error: 'not found' }, { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runIngestion(env));
  }
};

// ── CONFIGURATION ────────────────────────────────────────────
const SOURCES = [
  { name: 'Google News: Facial Recognition', url: 'https://news.google.com/rss/search?q=facial+recognition+law+enforcement+surveillance&hl=en-US&gl=US&ceid=US:en', maxItems: 30 },
  { name: 'Google News: Biometric Police', url: 'https://news.google.com/rss/search?q=biometric+surveillance+police+privacy&hl=en-US&gl=US&ceid=US:en', maxItems: 20 },
  { name: 'Google News: Clearview AI', url: 'https://news.google.com/rss/search?q=Clearview+AI+Idemia+face+recognition+police&hl=en-US&gl=US&ceid=US:en', maxItems: 15 },
  { name: 'Google News: FR Bans & Laws', url: 'https://news.google.com/rss/search?q=facial+recognition+ban+law+civil+liberties+ACLU&hl=en-US&gl=US&ceid=US:en', maxItems: 15 },
  { name: 'Google News: FOIA Surveillance', url: 'https://news.google.com/rss/search?q=FOIA+surveillance+camera+government+facial&hl=en-US&gl=US&ceid=US:en', maxItems: 10 },
  { name: 'EFF Updates', url: 'https://www.eff.org/rss/updates.xml', maxItems: 20 },
  { name: 'The Intercept', url: 'https://theintercept.com/feed/?rss', maxItems: 10 },
  { name: 'ProPublica', url: 'https://feeds.propublica.org/propublica/main', maxItems: 10 },
];

// Must contain at least one of these (case-insensitive)
const MUST_CONTAIN = [
  'facial recognition', 'face recognition', 'faceprint', 'biometric', 'biometrics',
  'clearview', 'idemia', 'nec corporation', 'amazon rekognition',
  'surveillance camera', 'face scan', 'facial scan',
  'predictive policing', 'live facial', 'automated face',
  'aclu', 'fourth amendment', 'civil liberties', 'eff.org',
  'foia', 'public records surveillance', 'gang database',
  'palantir', 'dragnet', 'license plate reader', 'alpr',
];

// Reject articles containing these (noise reduction)
const BLOCKLIST_PHRASES = [
  'recipe', 'cooking', 'sports score', 'nfl', 'nba', 'mlb', 'nhl',
  'celebrity', 'kardashian', 'royal family', 'disney theme park',
  'movie review', 'box office', 'video game review',
  'stock tip', 'crypto price', 'bitcoin price',
  'weather forecast', 'fashion week', 'makeup tutorial',
];

// ── RELEVANCE FILTER ─────────────────────────────────────────
function isRelevant(headline, sourceName) {
  const text = (headline + ' ' + sourceName).toLowerCase();
  const hasKeyword = MUST_CONTAIN.some(kw => text.includes(kw));
  if (!hasKeyword) return false;
  const isNoise = BLOCKLIST_PHRASES.some(bl => text.includes(bl));
  return !isNoise;
}

// ── RSS PARSER ───────────────────────────────────────────────
function parseRSS(xml, sourceName, maxItems) {
  const items = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRx.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];
    
    // Extract fields
    const titleM = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkM  = block.match(/<link>([\s\S]*?)<\/link>/);
    const guidM  = block.match(/<guid[^>]*>(https?:\/\/[^\s<]+)<\/guid>/);
    const pubM   = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descM  = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    
    if (!titleM) continue;
    
    let headline = titleM[1].trim();
    let link = (linkM ? linkM[1].trim() : '') || (guidM ? guidM[1].trim() : '');
    let pub = pubM ? pubM[1].trim() : '';
    let itemSource = sourceName;
    
    // Decode HTML entities in headline
    headline = headline
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
      .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—');
    
    // Google News: extract real URL from description href, and clean source from title
    if (sourceName.startsWith('Google News') && descM) {
      const realUrlM = descM[1].match(/href="(https?:\/\/[^"]+)"/);
      if (realUrlM) link = realUrlM[1];
    }
    if (sourceName.startsWith('Google News') && headline.includes(' - ')) {
      const parts = headline.split(' - ');
      itemSource = parts[parts.length - 1].trim();
      headline = parts.slice(0, -1).join(' - ').trim();
    }
    
    // Skip if no link or headline
    if (!link || !headline || link.includes('news.google.com')) continue;
    
    // Parse pub date to ISO
    let pubISO = '';
    if (pub) {
      try {
        pubISO = new Date(pub).toISOString();
      } catch(e) {
        pubISO = pub.slice(0, 10);
      }
    }
    
    if (!isRelevant(headline, itemSource)) continue;
    
    // Create stable ID from URL
    const id = btoa(link.slice(0, 48)).replace(/[+/=]/g, '_').slice(0, 24);
    
    items.push({ id, headline, url: link, source_name: itemSource, published_at: pubISO });
  }
  
  return items;
}

// ── MAIN INGESTION ────────────────────────────────────────────
async function runIngestion(env) {
  const db = env.FACEMAP_DB;
  const today = new Date().toISOString().slice(0, 10);
  const log = [];
  let totalNew = 0;
  let totalSkipped = 0;
  let totalFetched = 0;

  // Get existing article URLs to deduplicate
  const existing = await db.prepare('SELECT url FROM news_cache').all();
  const existingUrls = new Set((existing.results || []).map(r => r.url));
  log.push(`Existing articles in DB: ${existingUrls.size}`);

  // Fetch and parse all sources
  const allArticles = [];
  const seenUrls = new Set(existingUrls);

  for (const source of SOURCES) {
    try {
      const r = await fetch(source.url, {
        headers: { 'User-Agent': 'FaceHeatMap/1.0 (faceheatmap.app surveillance tracker)', 'Accept': 'application/rss+xml, application/xml, */*' },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!r.ok) {
        log.push(`SKIP ${source.name}: HTTP ${r.status}`);
        continue;
      }
      
      const xml = await r.text();
      const items = parseRSS(xml, source.name, source.maxItems);
      totalFetched += items.length;
      
      let newFromSource = 0;
      for (const item of items) {
        if (!seenUrls.has(item.url) && item.url && item.headline) {
          seenUrls.add(item.url);
          allArticles.push(item);
          newFromSource++;
        } else {
          totalSkipped++;
        }
      }
      
      log.push(`${source.name}: ${items.length} parsed, ${newFromSource} new`);
    } catch(e) {
      log.push(`ERROR ${source.name}: ${e.message}`);
    }
  }

  // Sort by published_at descending
  allArticles.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));

  // Insert new articles into D1
  for (const art of allArticles) {
    try {
      await db.prepare(
        `INSERT OR IGNORE INTO news_cache (id, headline, url, source_name, published_at, fetched_at, city, state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        art.id,
        art.headline.slice(0, 500),
        art.url.slice(0, 1000),
        (art.source_name || 'Unknown').slice(0, 100),
        art.published_at || today,
        today,
        'NATIONAL',
        'US'
      ).run();
      totalNew++;
    } catch(e) {
      log.push(`INSERT ERROR: ${e.message.slice(0, 80)}`);
    }
  }

  // Prune old articles beyond 500 (keep newest)
  try {
    const countRes = await db.prepare('SELECT COUNT(*) as cnt FROM news_cache').first();
    const total = countRes?.cnt || 0;
    if (total > 500) {
      const toDelete = total - 500;
      await db.prepare(
        `DELETE FROM news_cache WHERE id IN (
          SELECT id FROM news_cache ORDER BY published_at ASC LIMIT ?
        )`
      ).bind(toDelete).run();
      log.push(`Pruned ${toDelete} oldest articles (keeping newest 500)`);
    }
  } catch(e) {
    log.push(`Prune error: ${e.message}`);
  }

  const summary = `✅ Intel ingestion complete: ${totalNew} new articles added, ${totalSkipped} skipped (duplicates), ${totalFetched} total fetched`;
  log.unshift(summary);

  // Telegram notification
  if (env.TELEGRAM_BOT_TOKEN && totalNew > 0) {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: 'REDACTED3091981',
        text: `📡 FaceHeatMap Intel Update\n${summary}\n\nSources: ${SOURCES.length}\nRun: ${new Date().toISOString().slice(0,19)}Z`
      })
    }).catch(() => {});
  }

  return { ok: true, new: totalNew, skipped: totalSkipped, fetched: totalFetched, log };
}