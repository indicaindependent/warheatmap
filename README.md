<div align="center">

<img src="https://img.shields.io/badge/🌍_WARHEATMAP-LIVE-ef4444?style=for-the-badge" alt="WarHeatMap"/>

# 🌍 WarHeatMap
### *Live Global Conflict Intelligence Platform*

<br/>

[![🔴 Live App](https://img.shields.io/badge/🔴_LIVE-warheatmap.app-ef4444?style=for-the-badge&logo=firefoxbrowser&logoColor=white)](https://warheatmap.app)
[![⚓ Strait Tracker](https://img.shields.io/badge/⚓_STRAIT_TRACKER-tracker.warheatmap.app-0ea5e9?style=for-the-badge&logo=googlemaps&logoColor=white)](https://tracker.warheatmap.app)
[![OSINT Network](https://img.shields.io/badge/OSINT-osintnet.uk-1e293b?style=for-the-badge&logo=googlemaps&logoColor=white)](https://osintnet.uk)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

<br/>

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![D1 SQLite](https://img.shields.io/badge/D1_SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Leaflet.js](https://img.shields.io/badge/Leaflet.js-199900?style=flat-square&logo=leaflet&logoColor=white)
![AT Protocol](https://img.shields.io/badge/AT_Protocol-Bluesky-0085ff?style=flat-square&logo=bluesky&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![KV Storage](https://img.shields.io/badge/Cloudflare_KV-F38020?style=flat-square&logo=cloudflare&logoColor=white)

<br/>

![Status](https://img.shields.io/badge/Status-🟢_Live-22c55e?style=flat-square)
![Events](https://img.shields.io/badge/Verified_Events_Tracked-4,000+-ef4444?style=flat-square)
![Coverage](https://img.shields.io/badge/Coverage-Global-6d28d9?style=flat-square)
![Speed](https://img.shields.io/badge/Response_Time-<50ms-0ea5e9?style=flat-square)
![VPDLNY](https://img.shields.io/badge/VPDLNY-Community_Tool-8B0000?style=flat-square)

</div>

---


## 📋 Changelog

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
- 🔧 **CORS fix** — removed `User-Agent` from browser fetch; added `Access-Control-Allow-Headers: *` to strait-news-worker
- 🔧 **Fixed `updateWarDay` / `forceRefresh` / `refreshPrices`** — functions were called at boot but never defined (caused full UI freeze)
- 💰 **Daily price cache** — Brent/WTI/BTC now ingested once per day via `localStorage` TTL (24h), not on every page visit
- ⚡ **`applyPrices()`** — unified price rendering function, eliminates duplicate DOM updates
- 🔄 **`autoRefresh()`** — 5-min background refresh respects daily price cache
- ✅ **NOW button** — `forceRefresh()` clears price cache, re-fetches all live data, flashes UI confirmation

### v6.0 — May 7, 2026
- 🗺️ Full SVG map rebuild — no external Leaflet dependency (WARP-safe)
- 📰 Live intel brief panel — auto-populates from strait-news-worker
- 🎯 IRGCN asset positions + US Navy carrier group overlays
- ⚓ Mine field / exclusion zone layers
- 📅 War Day counter (since Feb 27, 2026)
- 🔴 Threat level badge — pulls from intel API status object

### strait-news-worker v3.1 — May 9, 2026
- 🔧 **CORS fix** — `Access-Control-Allow-Headers: *` added to all responses + preflight
- ✅ `/oil-live` endpoint confirmed operational
- ✅ All secrets restored: NEWSAPI, ANTHROPIC, GEMINI, TELEGRAM, AISSTREAM, ALPHA_VANTAGE, FINNHUB


## 🔍 What Is WarHeatMap?

**WarHeatMap** is a free, open-source live conflict intelligence platform that aggregates geopolitical flashpoints, overlays them on an interactive world map, and auto-posts intelligence threads to **Bluesky** via the AT Protocol — all running at the edge on **Cloudflare Workers**.

Built for researchers, journalists, activists, and anyone tracking global instability in real time — without paywalls, login walls, or corporate bias.

---

## ⚡ Features

| Feature | Description |
|---|---|
| 🌍 **Interactive Heatmap** | Leaflet.js world map with live conflict zones, severity overlay |
| ⚓ **Strait Tracker** | Dedicated Hormuz/naval OSINT sub-dashboard |
| 📡 **Bluesky Auto-Post** | Intelligence threads fire to Bluesky via AT Protocol |
| 🔴 **Hot Zone Detection** | Algorithmic severity classification (RED/ORANGE/YELLOW) |
| 📰 **Intel Feed** | Aggregated live news across all active theaters |
| 💾 **Event Archive** | D1 SQLite database of all tracked incidents |
| 📊 **Escalation Index** | Real-time tension scoring per conflict zone |
| 🚢 **Naval OSINT** | Ship tracking, blockade status, tanker incident log |
| 🏷️ **Category Filters** | Filter the map & feed by event type — airstrike, naval, missile, cyber, nuclear, diplomacy, sanctions, and more |
| 📱 **Mobile-First** | Full responsive layout with dedicated mobile worker |

---

## 🗺️ Conflict Zones Tracked

```
🇮🇷 Strait of Hormuz     — BLOCKADE ACTIVE | Naval interdiction | IRGC incidents
🇺🇦 Ukraine              — Front line updates | ISW-sourced | Daily briefings
🇵🇸 Gaza / West Bank     — IDF operations | Casualty tracking | Ceasefire status
🇸🇩 Sudan                — RSF vs SAF | Humanitarian corridor status
🇨🇩 DRC / M23            — Eastern Congo offensive tracking
🇲🇲 Myanmar              — Junta vs. resistance | KIO/KNLA operations
🌍 + many more active theatres · 4,000+ verified events
```

---

## 🛠️ Tech Stack

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

## 🏗️ Architecture

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

## 📁 Repo Structure

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

## 🚀 Deploy Your Own

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

# Deploy strait tracker
wrangler deploy workers/strait-tracker-worker.js
```

---

## 🌐 Data Sources

- 📋 **ISW (Institute for the Study of War)** — Daily Ukraine/conflict assessments
- 🛢️ **MarineTraffic / VesselFinder** — Real-time AIS ship positioning
- 📰 **Reuters, AP, Al Jazeera** — Breaking news aggregation
- 🔓 **FOIA / Open Source** — Government procurement & military contracts
- 🌊 **USNI News** — Naval Institute conflict reporting
- 📡 **OSINT Community** — Verified open-source intelligence

---

## 🤝 Contributing

PRs welcome. If you spot a conflict zone we're missing or a broken data feed — [open an issue](https://github.com/indicaindependent/warheatmap/issues).

---

<div align="center">

**Built by [Indica Independent Media](https://osintnet.uk) · [VPDLNY](https://osintnet.uk) · Staten Island, NYC**

*The world is on fire. Someone has to map it.*

[![Follow on Bluesky](https://img.shields.io/badge/Bluesky-@indicaindependent-0085ff?style=flat-square&logo=bluesky&logoColor=white)](https://bsky.app/profile/indicaindependent.bsky.social)
[![FaceHeatMap](https://img.shields.io/badge/Also_See-FaceHeatMap-ef4444?style=flat-square)](https://github.com/indicaindependent/faceheatmap)
[![SENTINEL](https://img.shields.io/badge/Also_See-SENTINEL-7C3AED?style=flat-square)](https://github.com/indicaindependent/sentinel)

</div>


---

## ⚡ Support the Mission

This is free, ad-free, independent infrastructure — no VC, no gov funding, no strings. If it served you, a tip keeps it alive and funds the next tool.

[![Donate via SkyGive](https://img.shields.io/badge/💜_Donate_via_SkyGive-8A5CF6?style=for-the-badge&logoColor=white)](https://donate.skygive.app/)
[![Lightning](https://img.shields.io/badge/⚡_tips@skygive.app-F7931A?style=for-the-badge&logo=lightning&logoColor=white)](https://donate.skygive.app/)

<sub>🧡 Sovereign Lightning + on-chain via SkyGive. Your sats fund uptime, not ads.</sub>
