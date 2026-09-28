"""WarHeatMap live card + live map for GitHub.

Reads the PUBLIC warheatmap.app event feed (no credentials; the app is public without login and
serves CORS *), renders two static SVGs and the mini-app bundle into ./_site for GitHub Pages.
Standard library only. Every title is untrusted news text and is XML-escaped before rendering.
House style (Pete's written standard): solid backgrounds, real <title>/<desc> text nodes, a stroke
on every mark, no animation, no glow, no gradients behind text.
"""
import json, os, re, shutil, sys, urllib.request, datetime as dt
from xml.sax.saxutils import escape

APP = "69a98e80dfb929a404aaf775"
FEED = f"https://warheatmap.app/api/apps/{APP}/entities/Event?limit=500&sort=-event_date"
SITEMAP = "https://warheatmap.app/functions/sitemap"
EVENT_URL = "https://warheatmap.app/functions/eventPage?e="
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "_site")

BG, CARD, CARD2, BORDER = "#0B1015", "#161E27", "#1E2833", "#33424F"
TEXT, MUTED, TEAL = "#F3F7F9", "#A7B6C2", "#2DD4E8"
SEV = {"critical": "#FB7185", "high": "#F5A524", "medium": "#2DD4E8", "low": "#4ADE80"}
SEV_R = {"critical": 5.0, "high": 4.0, "medium": 3.2, "low": 2.6}
MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"

def get(url, timeout=90):
    req = urllib.request.Request(url, headers={"User-Agent": "warheatmap-github-live/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r: return r.read()

def when(e):
    # A few feed rows carry no zone suffix. The rest of the feed is UTC ("Z"), so a zoneless value is
    # read as UTC. ASSUMPTION, stated here rather than hidden: it shifts no event by more than the
    # site's own clock would.
    try: t = dt.datetime.fromisoformat(str(e.get("event_date", "")).replace("Z", "+00:00"))
    except ValueError: return None
    return t if t.tzinfo else t.replace(tzinfo=dt.timezone.utc)

def T(x, y, s, size=11, fill=TEXT, w=400, anchor="start", ls=0):
    return (f'<text x="{x}" y="{y}" font-family="{MONO}" font-size="{size}" fill="{fill}" font-weight="{w}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}">{escape(str(s))}</text>')

def clip(s, n):
    s = re.sub(r"\s+", " ", str(s or "")).strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "\u2026"

def main():
    now = dt.datetime.now(dt.timezone.utc)
    events = [e for e in json.loads(get(FEED)) if when(e)]
    if len(events) < 10: sys.exit(f"feed returned {len(events)} events; refusing to publish a near-empty card")
    try: indexed = get(SITEMAP, 120).decode("utf-8", "replace").count("eventPage?e=")
    except Exception: indexed = None
    d24 = [e for e in events if (now - when(e)).total_seconds() <= 86400]
    d7 = [e for e in events if (now - when(e)).total_seconds() <= 7 * 86400]
    sev7 = {k: sum(1 for e in d7 if str(e.get("severity", "")).lower() == k) for k in SEV}
    countries7 = sorted({e.get("country") for e in d7 if e.get("country")})
    stamp = now.strftime("%Y-%m-%d %H:%M UTC")
    os.makedirs(OUT, exist_ok=True)

    # ---------------- live card ----------------
    W, H = 980, 440
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t d">',
         '<title id="t">WarHeatMap, live status</title>',
         f'<desc id="d">Read from the public warheatmap.app event feed at {stamp}. '
         f'{len(d24)} events in the last 24 hours, {len(d7)} in the last 7 days across {len(countries7)} countries'
         + (f', {indexed:,} indexed event pages' if indexed else '') + '. Latest: '
         + escape("; ".join(clip(e.get("title"), 90) for e in events[:5])) + '.</desc>',
         f'<rect width="{W}" height="{H}" fill="{BG}"/>',
         f'<rect x="12" y="12" width="{W-24}" height="{H-24}" rx="10" fill="none" stroke="{BORDER}"/>',
         T(36, 48, "WARHEATMAP · LIVE", 18, TEXT, 700, ls=1),
         T(36, 68, f"read {stamp} from warheatmap.app · refreshes about every 30 minutes", 11, MUTED)]
    tiles = [(f"{indexed:,}" if indexed else "n/a", "indexed event pages", TEAL),
             (str(len(d24)), "events, last 24 hours", SEV["high"]),
             (str(len(d7)), "events, last 7 days", TEAL),
             (str(len(countries7)), "countries, last 7 days", SEV["low"])]
    tw = (W - 72 - 3 * 12) // 4
    for i, (big, lab, col) in enumerate(tiles):
        x = 36 + i * (tw + 12)
        o += [f'<rect x="{x}" y="86" width="{tw}" height="60" rx="7" fill="{CARD}" stroke="{BORDER}"/>',
              f'<rect x="{x}" y="86" width="4" height="60" rx="2" fill="{col}" stroke="{col}"/>',
              T(x + 16, 113, big, 21, col, 700), T(x + 16, 134, lab, 10, MUTED)]
    # severity strip (7 days)
    o.append(T(36, 172, "SEVERITY, LAST 7 DAYS", 10, MUTED, 700, ls=1.2))
    total = sum(sev7.values()) or 1; x = 36; bw = W - 72
    for k in ["critical", "high", "medium", "low"]:
        w = round(bw * sev7[k] / total)
        if w: o.append(f'<rect x="{x}" y="180" width="{w}" height="12" fill="{SEV[k]}" stroke="{BG}" stroke-width="1"/>'); x += w
    lx = 36
    for k in ["critical", "high", "medium", "low"]:
        o += [f'<rect x="{lx}" y="202" width="9" height="9" rx="2" fill="{SEV[k]}" stroke="{BG}"/>',
              T(lx + 14, 210, f"{k.upper()} {sev7[k]}", 10, TEXT)]; lx += 150
    # latest five
    o.append(T(36, 240, "LATEST EVENTS", 10, MUTED, 700, ls=1.2))
    o.append(f'<line x1="36" y1="248" x2="{W-36}" y2="248" stroke="{BORDER}"/>')
    y = 270
    for e in events[:5]:
        s = str(e.get("severity", "")).lower(); col = SEV.get(s, MUTED)
        o += [f'<rect x="36" y="{y-10}" width="8" height="12" rx="2" fill="{col}" stroke="{BG}"/>',
              T(54, y, when(e).strftime("%m-%d %H:%M"), 11, MUTED),
              T(160, y, clip(e.get("country"), 14), 11, TEXT, 700),
              T(290, y, clip(e.get("title"), 62), 11, TEXT),
              T(W - 36, y, clip(e.get("source_name"), 20), 10, MUTED, anchor="end")]
        y += 26
    o.append(f'<line x1="36" y1="{H-54}" x2="{W-36}" y2="{H-54}" stroke="{BORDER}"/>')
    o.append(T(36, H - 32, "Times UTC. Counts are the newest 500 events in the public feed, windowed by event time. Click through for the interactive map.", 10, MUTED))
    o.append("</svg>")
    open(os.path.join(OUT, "live-card.svg"), "w").write("".join(o))

    # ---------------- live map ----------------
    land = json.load(open(os.path.join(HERE, "land.json")))
    S, L0, L1 = land["step"], land["lat0"], land["lat1"]
    MW, MH, PX, PY = 980, 470, 20, 64
    sx = (MW - 2 * PX) / 360.0; sy = (MH - PY - 58) / float(L0 - L1)
    cw, ch = S * sx * 0.62, S * sy * 0.62
    path = "".join(f"M{PX + (c * S) * sx:.1f} {PY + (r * S) * sy:.1f}h{cw:.1f}v{ch:.1f}h-{cw:.1f}z" for c, r in land["cells"])
    m = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {MW} {MH}" width="{MW}" height="{MH}" role="img" aria-labelledby="mt md">',
         '<title id="mt">WarHeatMap, last 7 days on the map</title>',
         f'<desc id="md">{len(d7)} events from the public warheatmap.app feed, plotted by location and coloured by severity, read {stamp}. '
         f'Countries: {escape(", ".join(countries7[:40]))}.</desc>',
         f'<rect width="{MW}" height="{MH}" fill="{BG}"/>',
         f'<rect x="12" y="12" width="{MW-24}" height="{MH-24}" rx="10" fill="none" stroke="{BORDER}"/>',
         T(36, 44, "WARHEATMAP · LAST 7 DAYS", 16, TEXT, 700, ls=1),
         T(MW - 36, 44, f"{len(d7)} events · read {stamp}", 11, MUTED, anchor="end"),
         f'<path d="{path}" fill="{CARD2}"/>']
    order = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    for e in sorted(d7, key=lambda e: order.get(str(e.get("severity", "")).lower(), 0)):
        try: lat, lng = float(e["lat"]), float(e["lng"])
        except (KeyError, TypeError, ValueError): continue
        if not (L1 <= lat <= L0 and -180 <= lng <= 180): continue
        s = str(e.get("severity", "")).lower()
        m.append(f'<circle cx="{PX + (lng + 180) * sx:.1f}" cy="{PY + (L0 - lat) * sy:.1f}" r="{SEV_R.get(s, 3)}" '
                 f'fill="{SEV.get(s, MUTED)}" stroke="{BG}" stroke-width="1.2"/>')
    lx = 36
    for k in ["critical", "high", "medium", "low"]:
        m += [f'<circle cx="{lx + 5}" cy="{MH - 36}" r="{SEV_R[k]}" fill="{SEV[k]}" stroke="{BG}" stroke-width="1.2"/>',
              T(lx + 16, MH - 32, f"{k.upper()} {sev7[k]}", 10, TEXT)]; lx += 140
    m.append(T(MW - 36, MH - 32, "land: Natural Earth 110m · data: warheatmap.app", 10, MUTED, anchor="end"))
    m.append("</svg>")
    open(os.path.join(OUT, "live-map.svg"), "w").write("".join(m))

    # ---------------- mini app bundle ----------------
    shutil.copy(os.path.join(HERE, "index.html"), os.path.join(OUT, "index.html"))
    shutil.copy(os.path.join(HERE, "land.json"), os.path.join(OUT, "land.json"))
    json.dump({"read_utc": now.isoformat(), "events_24h": len(d24), "events_7d": len(d7), "countries_7d": len(countries7),
               "indexed_event_pages": indexed, "severity_7d": sev7}, open(os.path.join(OUT, "status.json"), "w"), indent=1)
    print(f"ok {stamp}: 24h={len(d24)} 7d={len(d7)} countries={len(countries7)} indexed={indexed} sev7={sev7}")

if __name__ == "__main__":
    main()
