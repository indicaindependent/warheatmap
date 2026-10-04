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

**Full build history, from the first production deploy on 2026-03-05: [CHANGELOG.md](CHANGELOG.md).** It is built
from the app's own deploy record. warheatmap.app has never carried a version number. The v6.x numbers belong to
StraitTracker, a separate Cloudflare mini app that is now retired, and are listed under its own heading below.

From 2026-09-28 on, every change to the app or this repo gets a dated entry here.

### warheatmap.app updates since August 13

- **2026-10-03 to 2026-10-04** Duplicate events merged at ingest and in a one-time backfill; canonical event
  pages at `/e/<id>` with structured data and a visible source line; a sitemap index; the feed shows critical
  and high severity; every emoji replaced with an SVG icon.
- **2026-09-28** Talk page (#warheatmap on EFnet, VoxTerrae download); Ukraine tracker and September briefing;
  intelligent event clustering; Gaza card fixes; news analysis moved server-side.
- **2026-09-07** Share-card images rendered inside the app with a local pure-JS stack.
- **2026-08-27 to 2026-08-31** Server-rendered event pages, canonical classification, richer social previews,
  streaming event load and feed virtualisation. Push notifications launched 08-29 and switched off 08-30.
- **2026-08-15 to 2026-08-23** Pagination, real-time filtering overhaul, redesigned interface, share pipeline
  rebuilt with short links and dynamic cards.

### Repository updates since August 13

- **2026-10-04: Coverage re-measured, and the live map follows deduplication.** Coverage now counts all 6,103
  verified live events rather than a 260-page sample. The live card, 7-day map and mini map skip merged and
  unverified events and link to the canonical event pages.
- **2026-09-28: Live Right Now.** A status card and a world map of the last 7 days, rebuilt about every 30 minutes
  from the public warheatmap.app feed, plus an interactive mini map on GitHub Pages
  ([`live/`](live/), [`.github/workflows/live.yml`](.github/workflows/live.yml)).
- **2026-09-20: Coverage, Measured.** Event count re-measured from the live sitemap (6,983 indexed event pages),
  with a coverage chart, event-type and severity shares, and a sourcing breakdown. Replaced the stale "4,000+".
- **2026-08-27 to 2026-09-20: README cleanup.** Emoji and twenty third-party badges removed, a self-hosted header
  added, one donation path, the secret inventory and retired StraitTracker promises removed, the Discord line
  removed.

### StraitTracker repo syncs, not previously logged

- **2026-06-14: strait-news-worker v3.2** synced from the live source (sanitized).
- **2026-06-05: mobile Strait Tracker worker** added (bottom-sheet UI, touch map, live feed).

### August 13, 2026: deep-link grammar v2 (warheatmap.app)

- **Dynamic deep-link grammar v2** — every shareable/OG card can now steer the app precisely: `?country=X` focuses the map, `?feed-country=X` focuses and loads that country's feed, `?tag=<category>` filters the feed to a category, `?events=critical` jumps to critical-only, and `?criticalevents-country=X` combines both. Powers click-backs from the OSINT auto-post threads.
- **OSINT auto-posting desks** — WarDesk (daily conflict brief), SpyDesk (surveillance), and WarChest (markets-at-war) compose OG-card threads to Bluesky and deep-link back into the exact map view for each story.
- **Category tag bar** — filter the live map/feed by event type (AIRSTRIKE, GROUND, NAVAL, MISSILE, EXPLOSION, TERRORISM, CYBER, NUCLEAR, DIPLOMACY, SANCTIONS, INFRA, and more) plus STATS and FEED tabs.
- **Scale** — now plotting 4,000+ verified events across every active theatre.

### July 18, 2026: SEO and crawlability (warheatmap.app)

- **AI/SEO crawlability**: served-side answer block, FAQ + JSON-LD schema (WebSite, Organization, FAQPage) injected at the origin so AI crawlers and search engines can ground on real content instead of an empty SPA shell.
- **Bot-prerender pattern**: crawlers receive fully-rendered, structured HTML while human visitors keep the live SPA experience.
- **Search Console loop**: automated weekly performance reporting to track ranking lift after SEO deploys.

### StraitTracker (retired Cloudflare mini app, archived)

Not part of warheatmap.app. Kept for the record; the v6.x numbers are its own.

### StraitTracker v6.1 — May 9, 2026
- **CORS fix** — removed `User-Agent` from browser fetch; added `Access-Control-Allow-Headers: *` to strait-news-worker
- **Fixed `updateWarDay` / `forceRefresh` / `refreshPrices`** — functions were called at boot but never defined (caused full UI freeze)
- **Daily price cache** — Brent/WTI/BTC now ingested once per day via `localStorage` TTL (24h), not on every page visit
- **`applyPrices()`** — unified price rendering function, eliminates duplicate DOM updates
- **`autoRefresh()`** — 5-min background refresh respects daily price cache
- **NOW button** — `forceRefresh()` clears price cache, re-fetches all live data, flashes UI confirmation

### StraitTracker v6.0 — May 7, 2026
- Full SVG map rebuild — no external Leaflet dependency (WARP-safe)
- Live intel brief panel — auto-populates from strait-news-worker
- IRGCN asset positions + US Navy carrier group overlays
- Mine field / exclusion zone layers
- War Day counter (since Feb 27, 2026)
- Threat level badge — pulls from intel API status object

### strait-news-worker v3.1 — May 9, 2026
- **CORS fix** — `Access-Control-Allow-Headers: *` added to all responses + preflight
- `/oil-live` endpoint confirmed operational


## Live Right Now

<a href="https://indicaindependent.github.io/warheatmap/"><img src="https://indicaindependent.github.io/warheatmap/live-card.svg" alt="WarHeatMap live status, rebuilt about every 30 minutes from the public warheatmap.app feed: events in the last 24 hours and 7 days, countries covered, severity mix, and the five newest events with their sources." width="100%"></a>

<a href="https://indicaindependent.github.io/warheatmap/"><img src="https://indicaindependent.github.io/warheatmap/live-map.svg" alt="The last 7 days of WarHeatMap events plotted on a world map and coloured by severity: critical, high, medium, low." width="100%"></a>

These two images rebuild themselves about every 30 minutes from the public WarHeatMap feed. Click either one
for the **[mini map](https://indicaindependent.github.io/warheatmap/)**: filter by severity and event type, open any event and its source. It reads the
feed live in your browser, with no login and no tracking.

Built by [`live/build_live.py`](live/build_live.py) and [`.github/workflows/live.yml`](.github/workflows/live.yml).
No secret is involved: the feed is public, and the pages are deployed as a Pages artifact, so the
refreshes add nothing to this repo's history.

---

## What Is WarHeatMap?

**WarHeatMap** is a free, open-source live conflict intelligence platform that aggregates geopolitical flashpoints, overlays them on an interactive world map, and auto-posts intelligence threads to **Bluesky** via the AT Protocol — all running at the edge on **Cloudflare Workers**.

Built for researchers, journalists, activists, and anyone tracking global instability in real time — without paywalls, login walls, or corporate bias.

---

## Coverage, Measured

Every figure in this section was **measured from the live site on 2026-10-04 at 13:55 ET**, and these are
**totals, not a sample**. Every one of the **6,103 verified, live events** in the public event feed was read and
counted. Events the site has merged as duplicates, and events it has not verified, are excluded.

<img src="https://raw.githubusercontent.com/indicaindependent/warheatmap/main/assets/charts/warheatmap-coverage.svg" alt="WarHeatMap coverage measured 2026-10-04: all 6,103 verified live events, 18 event types, 192 named conflicts, 169 countries. Largest event types: airstrike 18.3%, ground battle 15.3%, diplomacy 13.9%, protest 7.9%, other 7.5%, missile 7.4%. Severity: HIGH 49.8%, MEDIUM 32.5%, CRITICAL 14.2%, LOW 3.6%." width="100%">

```
6,103   verified, live events, each with its own server-rendered page   (event feed, 2026-10-04 13:55 ET)
6,099   of them listed in the sitemap at the same reading
    8   static pages
   18   distinct event types
  192   named conflicts
  169   countries
  574   events that absorbed at least one merged duplicate report
```

The live card above is rebuilt about every 30 minutes; the figures here are a dated reading of a number that moves.

### Event types

| Event type | Events | Share | | Event type | Events | Share |
|---|---:|---:|---|---|---:|---:|
| Airstrike | 1,115 | 18.3% | | Terrorism | 170 | 2.8% |
| Ground battle | 931 | 15.3% | | Sanctions | 133 | 2.2% |
| Diplomacy | 849 | 13.9% | | Explosion | 130 | 2.1% |
| Protest | 484 | 7.9% | | Border crossing | 94 | 1.5% |
| Other | 455 | 7.5% | | Assassination | 81 | 1.3% |
| Missile | 452 | 7.4% | | Migration | 68 | 1.1% |
| Naval | 437 | 7.2% | | Cyber | 35 | 0.6% |
| Infrastructure | 318 | 5.2% | | Nuclear | 26 | 0.4% |
| Humanitarian | 318 | 5.2% | | Coup | 7 | 0.1% |

### Severity distribution

| Severity | Events | Share |
|---|---:|---:|
| CRITICAL | 865 | 14.2% |
| HIGH | 3,037 | 49.8% |
| MEDIUM | 1,983 | 32.5% |
| LOW | 218 | 3.6% |

### Sourcing is the differentiator

Every verified event names its source. The most cited are Al Jazeera (259 events), Anadolu Agency (237), The
Guardian (230), Sudan Tribune (169), The Hindu (149), Reuters (136) and Associated Press (131). **No single outlet
exceeds 4.2% of events.** That distribution is what separates an event record from an aggregator reprinting one
wire. Across all events, 1,677 distinct source names are recorded; spelling variants and combined credits count
separately there, so the number of distinct outlets is lower.

**1,711 events carry a casualty count and 1,217 carry a displacement figure**, because an event without a number
attached is just a claim.

Coverage runs continuously from **late February 2026 to the present day**.

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

## How It Is Built

warheatmap.app is a Base44 application, and has been since 2026-03-05. Events are Base44 entities, and the
public feed is Base44's entity API. Cloudflare fronts the domain and hosts the satellite services on subdomains:
the OSINT desks that post to Bluesky and the share cards. StraitTracker, an earlier Cloudflare mini app, is
retired and archived here. The D1 databases belong to those
services. The app's own source is platform-managed and is not in this repository. The `workers/` tree here is the
Cloudflare side only, and the Tech Stack, Architecture and Deploy Your Own sections below describe those
satellite services, not the map app.

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
