<div align="center">

<img src="https://raw.githubusercontent.com/indicaindependent/warheatmap/main/assets/warheatmap-header.svg" alt="WarHeatMap - live global conflict intelligence platform, built on Cloudflare Workers with D1 SQLite, Cloudflare KV, Leaflet.js, the AT Protocol and JavaScript ES2024, MIT licence. Live status measured by HTTP request." width="100%">


# WarHeatMap
### *Live Global Conflict Intelligence Platform*

<br/>

[Live App](https://warheatmap.app)
[OSINT Network](https://osintnet.uk)
[License: MIT](LICENSE)

<br/>


<br/>


</div>

---


## Changelog

### v6.5 — August 13, 2026 *(Latest)*

- **Dynamic deep-link grammar v2** — every shareable/OG card can now steer the app precisely: `?country=X` focuses the map, `?feed-country=X` focuses and loads that country's feed, `?tag=<category>` filters the feed to a category, `?events=critical` jumps to critical-only, and `?criticalevents-country=X` combines both. Powers click-backs from the OSINT auto-post threads.
- **OSINT auto-posting desks** — WarDesk (daily conflict brief), SpyDesk (surveillance), and WarChest (markets-at-war) compose OG-card threads to Bluesky and deep-link back into the exact map view for each story.
- **Category tag bar** — filter the live map/feed by event type (AIRSTRIKE, GROUND, NAVAL, MISSILE, EXPLOSION, TERRORISM, CYBER, NUCLEAR, DIPLOMACY, SANCTIONS, INFRA, and more) plus STATS and FEED tabs.
- **Scale** — now plotting 4,000+ verified events across every active theatre.

### v6.2 — July 18, 2026

- **AI/SEO crawlability**: served-side answer block, FAQ + JSON-LD schema (WebSite, Organization, FAQPage) injected at the origin so AI crawlers and search engines can ground on real content instead of an empty SPA shell.
- **Bot-prerender pattern**: crawlers receive fully-rendered, structured HTML while human visitors keep the live SPA experience.
- **Search Console loop**: automated weekly performance reporting to track ranking lift after SEO deploys.

### v6.1 — May 9, 2026
- **CORS fix** — removed `User-Agent` from browser fetch; added `Access-Control-Allow-Headers: *` to strait-news-worker
- **Fixed `updateWarDay` / `forceRefresh` / `refreshPrices`** — functions were called at boot but never defined (caused full UI freeze)
- **Daily price cache** — Brent/WTI/BTC now ingested once per day via `localStorage` TTL (24h), not on every page visit
- **`applyPrices()`** — unified price rendering function, eliminates duplicate DOM updates
- **`autoRefresh()`** — 5-min background refresh respects daily price cache
- **NOW button** — `forceRefresh()` clears price cache, re-fetches all live data, flashes UI confirmation

### v6.0 — May 7, 2026
- Full SVG map rebuild — no external Leaflet dependency (WARP-safe)
- Live intel brief panel — auto-populates from strait-news-worker
- IRGCN asset positions + US Navy carrier group overlays
- Mine field / exclusion zone layers
- War Day counter (since Feb 27, 2026)
- Threat level badge — pulls from intel API status object

### strait-news-worker v3.1 — May 9, 2026
- **CORS fix** — `Access-Control-Allow-Headers: *` added to all responses + preflight
- `/oil-live` endpoint confirmed operational


## What Is WarHeatMap?

**WarHeatMap** is a free, open-source live conflict intelligence platform that aggregates geopolitical flashpoints, overlays them on an interactive world map, and auto-posts intelligence threads to **Bluesky** via the AT Protocol — all running at the edge on **Cloudflare Workers**.

Built for researchers, journalists, activists, and anyone tracking global instability in real time — without paywalls, login walls, or corporate bias.

---

## Coverage, Measured

Every figure in this section was **measured from the live site**, not estimated. The event count
comes from the published sitemap; the type, severity and sourcing breakdowns come from reading a
**random sample of 260 event pages** and parsing their fields, so those are proportions rather than
totals.

<img src="https://raw.githubusercontent.com/indicaindependent/warheatmap/main/assets/charts/warheatmap-coverage.svg" alt="WarHeatMap coverage measured 2026-09-20: 6,983 indexed event pages, 17 event types, 32 named conflicts, 168 distinct cited sources in a 260-event sample. Event types by share: airstrike 18.5%, diplomacy 13.5%, ground battle 11.9%, missile 10.4%, protest 9.2%, naval 8.1%. Severity: HIGH 53.1%, MEDIUM 30.8%, CRITICAL 12.3%, LOW 3.8%." width="100%">

```
6,985   individually indexed, server-rendered event pages   (sitemap, 2026-09-20 19:45 ET)
   25   static pages
  260   event pages read in full for the breakdowns below
   17   distinct event types
   32   named conflicts in the sample alone
  168   distinct cited outlets in the sample
```

The chart above was rendered a few hours earlier the same day at **6,983**. The count climbs
continuously, which is the point of a live tracker — treat any exact figure here as a floor.

### Event types

| Event type | Share | | Event type | Share |
|---|---:|---|---|---:|
| Airstrike | 18.5% | | Terrorism | 4.6% |
| Diplomacy | 13.5% | | Humanitarian | 3.5% |
| Ground battle | 11.9% | | Infrastructure | 3.5% |
| Missile | 10.4% | | Sanctions | 3.1% |
| Protest | 9.2% | | Explosion | 1.9% |
| Naval | 8.1% | | Assassination / border / cyber | 1.5% / 1.5% / 1.2% |
| Other | 6.9% | | Migration / nuclear | 0.4% / 0.4% |

### Severity distribution

| Severity | Events in sample | Share |
|---|---:|---:|
| CRITICAL | 32 | 12.3% |
| HIGH | 138 | 53.1% |
| MEDIUM | 80 | 30.8% |
| LOW | 10 | 3.8% |

### Sourcing is the differentiator

The 260 sampled events cite **168 distinct outlets** — Al Jazeera, Reuters, Associated Press, UN
News, Kyiv Independent, Sudan Tribune, Anadolu Agency, The Hindu, Taiwan News, IOM DTM and 158
more. **No single outlet exceeds 5% of the sample.** That distribution is what separates an event
record from an aggregator reprinting one wire.

**77 of the 260 carry a casualty count and 44 carry a displacement figure**, because an event
without a number attached is just a claim.

Coverage runs continuously from **March 2026 to the present day**.

---

## Features

| Feature | Description |
|---|---|
| **Interactive Heatmap** | Leaflet.js world map with live conflict zones, severity overlay |
| **Bluesky Auto-Post** | Intelligence threads fire to Bluesky via AT Protocol |
| **Hot Zone Detection** | Algorithmic severity classification (RED/ORANGE/YELLOW) |
| **Intel Feed** | Aggregated live news across all active theaters |
| **Event Archive** | D1 SQLite database of all tracked incidents |
| **Escalation Index** | Real-time tension scoring per conflict zone |
| **Naval OSINT** | Ship tracking, blockade status, tanker incident log |
| **Category Filters** | Filter the map & feed by event type — airstrike, naval, missile, cyber, nuclear, diplomacy, sanctions, and more |
| **Mobile-First** | Full responsive layout with dedicated mobile worker |

---

## Conflict Zones Tracked

```
Strait of Hormuz        — BLOCKADE ACTIVE | Naval interdiction | IRGC incidents
Ukraine                 — Front line updates | ISW-sourced | Daily briefings
Gaza / West Bank        — IDF operations | Casualty tracking | Ceasefire status
Sudan                   — RSF vs SAF | Humanitarian corridor status
DRC / M23               — Eastern Congo offensive tracking
Myanmar                 — Junta vs. resistance | KIO/KNLA operations
 + many more active theatres · 6,900+ verified events
```

---

## Tech Stack

```
Frontend:     Leaflet.js · Vanilla JS · CSS Grid · WebSocket
Backend:      Cloudflare Workers (Edge Runtime, v8 isolates)
Database:     Cloudflare D1 (SQLite at the edge)
Cache:        Cloudflare KV (analytics + event cache)
Storage:      Cloudflare R2 (media assets)
Social:       AT Protocol → Bluesky (auto campaign drip)
CDN:          Cloudflare Global Network (330+ PoPs)
Mobile:       Dedicated mobile Worker with adaptive layout
```

---

## Architecture

```
News Sources → Cloudflare Worker (strait-news-worker)
             → D1 Database (event log)
             → KV Cache (analytics)
             → Warheatmap Frontend (warheatmap-worker)
                    ↓
            Leaflet.js Interactive Map
                    ↓
            AT Protocol Publisher → Bluesky Thread
```

---

### SEO & Crawlability

WarHeatMap is a client-rendered SPA for speed, but AI crawlers and search engines need
readable HTML. The origin serves a structured **answer block** — an accessible H1, an FAQ,
a live-event summary, and JSON-LD schema (WebSite, Organization, FAQPage) — so bots can
ground citations on real content. Human visitors get the full interactive map; crawlers get
substance. Search performance is tracked on a weekly reporting loop to measure ranking lift.

## Repo Structure

```
/
├── workers/
│   ├── warheatmap-worker.js      # Main frontend + map (CF Worker)
│   ├── strait-tracker-worker.js  # Naval OSINT dashboard (CF Worker)
│   └── credit-tracker.js        # Credit/usage tracking (CF Worker)
├── wrangler.toml.example         # Deploy config template
├── LICENSE                       # MIT
└── README.md
```

---

## Deploy Your Own

```bash
# Clone
git clone https://github.com/indicaindependent/warheatmap
cd warheatmap

# Install Wrangler
npm install -g wrangler

# Copy config
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml — add your D1 binding, KV namespace IDs

# Create D1 database
wrangler d1 create warheatmap-db

# Deploy main worker
wrangler deploy workers/warheatmap-worker.js

```

---

## Data Sources

- **ISW (Institute for the Study of War)** — Daily Ukraine/conflict assessments
- **MarineTraffic / VesselFinder** — Real-time AIS ship positioning
- **Reuters, AP, Al Jazeera** — Breaking news aggregation
- **FOIA / Open Source** — Government procurement & military contracts
- **USNI News** — Naval Institute conflict reporting
- **OSINT Community** — Verified open-source intelligence

---

## Contributing

PRs welcome. If you spot a conflict zone we're missing or a broken data feed — [open an issue](https://github.com/indicaindependent/warheatmap/issues).

---

<div align="center">

**Built by [Indica Independent Media](https://osintnet.uk) · [VPDLNY](https://osintnet.uk) · Staten Island, NYC**

*The world is on fire. Someone has to map it.*

[Follow on Bluesky](https://bsky.app/profile/indicaindependent.bsky.social)

</div>


---

## Support the Mission

This is free, ad-free, independent infrastructure — no VC, no gov funding, no strings. If it served you, a tip keeps it alive and funds the next tool.

[Donate via SkyGive](https://donate.skygive.app/)
[Lightning](https://donate.skygive.app/)

<sub> Sovereign Lightning + on-chain via SkyGive. Your sats fund uptime, not ads.</sub>
