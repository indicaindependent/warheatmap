<div align="center">

# 🌍 WarHeatMap

**Global conflict intelligence platform — live war zone tracking with Bluesky integration**

[![Live](https://img.shields.io/badge/LIVE-warheatmap.app-EF4444?style=for-the-badge&logo=firefoxbrowser&logoColor=white)](https://warheatmap.app)
[![Bluesky](https://img.shields.io/badge/Bluesky-0085ff?style=for-the-badge&logo=bluesky&logoColor=white)](https://bsky.app/profile/indicaindependent.bsky.social)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## What Is This

WarHeatMap is a live conflict intelligence dashboard that aggregates geopolitical flashpoints, overlays them on an interactive world map, and auto-posts intelligence threads to Bluesky via the AT Protocol.

Built for researchers, journalists, and anyone who needs to track global instability in real time — without paywalls, without corporate bias.

---

## Features

- 🗺️ **Interactive War Heatmap** — Leaflet.js world map with live conflict zones
- 📡 **Bluesky Integration** — auto-posts conflict updates via AT Protocol
- ⚡ **Cloudflare Edge** — sub-50ms global response times
- 📰 **Intel Feed** — aggregated news from multiple sources
- 🔴 **Hot Zone Detection** — algorithmic severity classification
- 🌐 **VoxTerrae Integration** — multilingual community reports

---

## Architecture

```
Cloudflare Cron Trigger (every 15min)
        │
        ▼
  bsky-worker ──► AT Protocol (Bluesky posts)
        │
  strait-news-worker ──► NewsAPI ──► KV Cache
        │
  warheatmap-worker ──► D1 (events) ──► Leaflet UI
```

**Stack:** Cloudflare Workers · D1 · KV · AT Protocol · Leaflet.js · NewsAPI

---

## Self-Hosting

```bash
git clone https://github.com/indicaindependent/warheatmap
cd warheatmap

cp wrangler.toml.example wrangler.toml

# Set secrets
wrangler secret put BSKY_APP_PASS
wrangler secret put NEWS_API_KEY

wrangler d1 create warheatmap-db
wrangler deploy
```

---

## License

[MIT](LICENSE)

---

<div align="center">
<sub>Built by <a href="https://osintnet.uk">Indica Independent</a> | Follow on <a href="https://bsky.app/profile/indicaindependent.bsky.social">Bluesky</a></sub>
</div>
