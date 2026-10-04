# WarHeatMap Changelog

The complete build history of [warheatmap.app](https://warheatmap.app), newest first. Dates are UTC.

**Where this comes from.** warheatmap.app is a Base44 application, and Base44 keeps a checkpoint for every change
made to it. This history is built from that record, refreshed daily: 508 checkpoints from 2026-03-05 to
2026-10-04, of which 236 were deployed to production. The full list is in
[docs/history/deploy-record.md](docs/history/deploy-record.md). Entries below are production deploys only, grouped into milestones, in the builder's
own words where possible (they are builder checkpoint titles, not release notes). The app has never carried a
version number, so none is invented here.

**Two projects, kept apart.** Everything above the StraitTracker heading is warheatmap.app. StraitTracker was a
separate Cloudflare Workers mini app. It is retired and kept at the bottom for the record, with its own v6.x
version numbers, which never belonged to warheatmap.app.

From 2026-09-28 on, every change to the app or this repo gets a dated entry here.

## Production deploys by month

| Month | Deploys | What defined it |
|---|---:|---|
| 2026-03 | 117 | The app is built: map, stats dashboard, heatmap, market data, alerts, naval tracker, WAR 3.0 |
| 2026-04 | 27 | A Strait Tracker button links out to the separate StraitTracker mini app |
| 2026-05 | 6 | Maintenance |
| 2026-06 | 3 | Maintenance |
| 2026-07 | 25 | Ukraine Intel Tracker, SEO, MapLibre GL, event deep links |
| 2026-08 | 40 | Deep-link grammar, share pipeline, server-rendered event pages, performance |
| 2026-09 | 7 | Local OG card rendering, Talk page, event clustering, server-side news analysis |
| 2026-10 | 11 | Duplicate merging, canonical event pages, sitemap index, critical and high feed, SVG icons |

Counts are deployed changes per month, by deploy date. They total 236.

## October 2026

- **2026-10-04** Event pages answer crawlers with real HTTP status from an edge layer in front of the app: a live
  event returns 200 with a server-rendered article and its cited source, a merged duplicate returns 301 to the
  surviving event, and an unknown id returns 404 with noindex. `www.warheatmap.app` now redirects to the apex.
  Visitors still get the interactive app. Same-outlet, same-day duplicates are merged at ingest.
- **2026-10-04** (this repo) Coverage, Measured re-measured in full: all 6,103 verified live events counted, replacing
  the 2026-09-20 sample of 260 pages, with a new coverage chart.
- **2026-10-04** (this repo) The live card, the 7-day map and the mini map follow the app's duplicate merging:
  merged and unverified events no longer appear, event links open the canonical `/e/<id>` page, and a merged
  event lists every outlet that reported it.
- **2026-10-04** The feed shows critical and high severity events. A medium and low toggle added earlier the same
  day was removed; a deep link with `?severity=medium` or `?severity=low` still shows that tier.
- **2026-10-04** Duplicate events are merged at ingest, and a one-time backfill folded 831 duplicates into their
  earliest copy, taking live verified events from 6,872 to 6,098. A merged event keeps every outlet's citation.
  Severity values are now always lower case, and an event with no source is no longer marked verified.
- **2026-10-04** Event pages rebuilt at the canonical address `/e/<id>`: server-rendered, with a unique title,
  description, structured data and a visible source line. The sitemap is now an index with one child per month.
- **2026-10-04** Event fetching tuned to cut read traffic; the news ticker carries critical events only.
- **2026-10-04** Every emoji in the app replaced with an SVG icon.
- **2026-10-03** News and displacement ingest restricted to vetted headlines. The sources registry lists 164
  approved outlets and 94 banned, and adds IOM, UNHCR and OCHA for displacement events. Ukraine Ground Truth
  cards now rebuild automatically every morning.

## September 2026

- **2026-09-28** News analysis moved server-side: the app's AI calls now run in a backend service, with a
  new endpoint that analyses each incoming news item.
- **2026-09-28** Talk page: how to reach the WarHeatMap community in #warheatmap on EFnet, with the VoxTerrae
  download, a short explanation of IRC, and a plain-client fallback.
- **2026-09-28** Ukraine tracker updated; September 2026 intelligence briefing and SEO metadata on the About page.
- **2026-09-28** Intelligent event clustering on the map; Gaza card filtering and fallback state fixed.
- **2026-09-28** (this repo) Live Right Now: a status card, a 7-day world map and an interactive mini map on GitHub
  Pages, rebuilt about every 30 minutes from the public feed.
- **2026-09-20** (this repo) Coverage, Measured: 6,983 indexed event pages, with sourcing and severity breakdowns.
- **2026-09-07** Share-card images now rendered inside the app with a local pure-JS stack; colour and text fixes.

## August 2026

- **2026-08-31** Optional description field on multiple record types.
- **2026-08-30** Feed virtualisation for performance. In-browser and push notifications switched off, one day
  after launch.
- **2026-08-29** Background push notifications launched; events stream in on load; lighter UI; faster marker
  rendering and caching.
- **2026-08-27** Canonical event classification by theatre; server-side rendered event pages; oEmbed and richer
  social previews; map tile hosts centralised; canonical event URLs.
- **2026-08-23** Share pipeline rebuilt: short links and dynamic intelligence cards for every shared story.
- **2026-08-22** News story modal fixed on the dashboard.
- **2026-08-17** Unified rounded interface; Ukrainian heart pill; WAR card and top bar redesigned.
- **2026-08-16** Real-time map filtering overhaul; stats panel sized to the viewport; share and donate buttons
  resized.
- **2026-08-15** Database pagination; map and content update; mobile filter updates.
- **2026-08-13 Deep-link grammar v2.** Dashboard URL filtering: `?country=`, `?feed-country=`, `?tag=`,
  `?events=critical`. Powers the click-backs from the OSINT desks' Bluesky threads. Full notes in the
  [README changelog](README.md#changelog).
- **2026-08-06** Authentication required on the app's endpoints.

## July 2026

- **2026-07-26** Map migrated to MapLibre GL on desktop and mobile; event deep linking; severity normalisation
  across all events; share URLs updated.
- **2026-07-18 SEO and crawlability.** SEO deploy; new global donation integration.
- **2026-07-08** Ukraine Intel Tracker launched.

## May and June 2026

- **2026-06** Three maintenance deploys.
- **2026-05-02** (this repo) GitHub repository created.

## April 2026

- **2026-04-15** Strait Tracker button added, linking to the separate StraitTracker mini app (see below).

## March 2026

- **2026-03-30** WAR 3.0 Global Dashboard; dynamic social sharing.
- **2026-03-29** US naval asset tracker; oil price modal; event data restoration and schema fixes.
- **2026-03-21** Alerts system; fly-to buttons; live indicator; event cleanup and validation.
- **2026-03-18** Live market data and regional market cards; faster parallel database operations; legal pages.
- **2026-03-16** Advanced KDE heatmap; dashboard drill-downs; ingestion de-duplication.
- **2026-03-14** Stats dashboard.
- **2026-03-06** Mobile map redesign; responsive layout; fly to event.
- **2026-03-05** First production deploys: the map, the stats panel, the news ticker, social sharing and global
  protest tracking. 23 deploys on day one.

---

## StraitTracker (retired, archived)

A separate mini app built on Cloudflare Workers (strait-tracker, strait-tracker-mobile, strait-news-worker), not
part of warheatmap.app. As of 2026-09-28 the live warheatmap.app no longer links to it, and the tracker itself
serves a restricted-access page. Its source stays in [`workers/`](workers/) for the record. The v6.x numbers are
StraitTracker's own.

- **2026-07-25** Last uploads. StraitTracker labels itself v6.2, strait-news-worker 3.2.
- **2026-06-14** (this repo) strait-news-worker v3.2 synced from the live source.
- **2026-06-05** (this repo) Mobile StraitTracker added.
- **2026-05-09 — v6.1, strait-news-worker v3.1.** CORS and UI-freeze fixes, daily price cache.
- **2026-05-07 — v6.0.** SVG map rebuild, live intel brief, naval overlays, War Day counter. (Cloudflare shows
  uploads on May 1 and May 9 but none on May 7; the date is kept as originally published.)
- **2026-04-15** Created. 84 unnumbered uploads before v6.0, so no earlier versions are listed.
