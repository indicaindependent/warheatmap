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
![Conflicts](https://img.shields.io/badge/Active_Conflicts_Tracked-15+-ef4444?style=flat-square)
![Coverage](https://img.shields.io/badge/Coverage-Global-6d28d9?style=flat-square)
![Speed](https://img.shields.io/badge/Response_Time-<50ms-0ea5e9?style=flat-square)
![VPDLNY](https://img.shields.io/badge/VPDLNY-Community_Tool-8B0000?style=flat-square)

</div>

---

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
| ₿ **BTC Support** | Fund anonymously — on-chain, no accounts |
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
🌍 + 9 more active zones
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