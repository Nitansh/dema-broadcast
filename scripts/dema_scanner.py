#!/usr/bin/env python3
"""
dema_scanner.py
DEMA Stock Scanner & End-to-End Broadcast Automation CLI.
Integrates:
1. Healthcheck verification against heartbeat backend
2. Full universe NSE moving average scanning
3. Turnover (> ₹200 Cr) & Proximity (±0.2% VAH/POC/VAL/DEMA) filtering
4. Automated 1080p chart screenshot capture
5. /dema-broadcast-master playbook formulation, turbo rendering, and YouTube Studio API upload
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: 'requests' is required. Run 'pip install requests'")
    sys.exit(1)

# URLs
RENDER_BACKEND_URL = os.environ.get("RENDER_BACKEND_URL", "https://movingaverage-sh7s.onrender.com")
APP_FRONTEND_URL = os.environ.get("APP_FRONTEND_URL", "https://moving-average-alpha.vercel.app")
CHROME_PATH = r"C:\Users\T0263544\AppData\Local\Google\Chrome\Application\chrome.exe"
PUPPETEER_MOD_PATH = r"file:///C:/Users/T0263544/AppData/Local/Programs/Antigravity/resources/app.asar.unpacked/node_modules/chrome-devtools-mcp/build/src/third_party/index.js"
WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
CHARTS_DIR = WORKSPACE_ROOT / "modi-remotion" / "public" / "charts"


def check_backend_health() -> dict:
    """Check if the backend and Cloudflare tunnel from heartbeat.sh are active."""
    url = f"{RENDER_BACKEND_URL}/api/scan/status"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            return {
                "online": True,
                "status_code": 200,
                "data": data,
                "message": "Backend is online and responding."
            }
        else:
            return {
                "online": False,
                "status_code": r.status_code,
                "message": f"Backend returned HTTP {r.status_code}."
            }
    except Exception as e:
        return {
            "online": False,
            "status_code": None,
            "message": f"Connection error: {e}"
        }


def print_health_banner(health: dict):
    if health["online"]:
        d = health["data"]
        print(f"\n\033[92m✓ Backend Active\033[0m: {RENDER_BACKEND_URL}")
        print(f"  • Total Stocks: {d.get('totalStocks', 0)}")
        print(f"  • Evaluated: {d.get('processedCount', 0)} / {d.get('totalStocks', 0)}")
        print(f"  • Active Workers: {d.get('activeWorkers', 0)}")
        print(f"  • Scan Complete: {'Yes' if d.get('isComplete') else 'In Progress'}")
    else:
        print(f"\n\033[91m✗ Backend Offline or Unreachable\033[0m: {health['message']}")
        print("\033[93m>>> ACTION REQUIRED: Please run 'sh ./heartbeat.sh' on Google Cloud Shell to activate the backend and Cloudflare tunnel.\033[0m\n")


def trigger_scan(wait: bool = False, poll_interval: int = 5):
    """Trigger a full scan across all NSE moving average stocks."""
    health = check_backend_health()
    if not health["online"]:
        print_health_banner(health)
        sys.exit(1)

    print(f"\nTriggering full universe scan on {RENDER_BACKEND_URL}...")
    try:
        r = requests.post(f"{RENDER_BACKEND_URL}/api/scan/start", timeout=15)
        print(r.json().get("message", "Scan triggered."))
    except Exception as e:
        print(f"Failed to trigger scan: {e}")
        sys.exit(1)

    if wait:
        print("Waiting for full scan to complete...")
        while True:
            time.sleep(poll_interval)
            h = check_backend_health()
            if not h["online"]:
                print(f"[Wait] Health check failed: {h['message']}")
                continue
            d = h["data"]
            processed = d.get("processedCount", 0)
            total = d.get("totalStocks", 0)
            is_complete = d.get("isComplete", False)
            print(f"  [Scanning] {processed} / {total} stocks processed...")
            if is_complete:
                print("\033[92m✓ Full scan completed!\033[0m")
                break


def fetch_scanned_stocks() -> list:
    """Fetch all scanned stock data from the backend."""
    url = f"{RENDER_BACKEND_URL}/api/scan/results"
    try:
        r = requests.get(url, timeout=25)
        if r.status_code == 200:
            return r.json()
        print(f"Error fetching scan results: HTTP {r.status_code}")
        return []
    except Exception as e:
        print(f"Error fetching scan results: {e}")
        return []


def fetch_batch_value_areas(symbols: list[str], period: str = "month") -> dict:
    """Fetch Value Area footprint levels (POC, VAH, VAL) for symbols."""
    if not symbols:
        return {}
    url = f"{RENDER_BACKEND_URL}/api/stocks/batch-footprint"
    params = {"symbols": ",".join(symbols[:150]), "period": period}
    try:
        r = requests.get(url, params=params, timeout=25)
        if r.status_code == 200:
            return r.json().get("levels", {})
        return {}
    except Exception as e:
        print(f"Warning: Failed to fetch footprint levels: {e}")
        return {}


def filter_stocks(
    min_turnover_cr: float = 200.0,
    proximity_pct: float = 0.2,
    target_level: str = "any",
    period: str = "month",
    category: str = "all",
    limit: int = 25
) -> list:
    """
    Filter scanned stocks by:
    1. Turnover >= min_turnover_cr (₹ Cr)
    2. Current price proximity <= proximity_pct (e.g. 0.2%) of target_level (vah, poc, val, dema20, etc.)
    """
    stocks = fetch_scanned_stocks()
    if not stocks:
        print("No scanned stocks returned from backend.")
        return []

    # 1. Filter by minimum turnover in Cr
    high_turnover = []
    for s in stocks:
        price = s.get("price") or 0.0
        vol = s.get("volume") or 0
        turnover_cr = round((vol * price) / 10000000.0, 2)
        s["turnover_cr"] = turnover_cr
        s["app_url"] = f"{APP_FRONTEND_URL}/stock/{s['symbol']}"

        if turnover_cr >= min_turnover_cr:
            if category == "bullish" and not s.get("isBullish"):
                continue
            if category == "bearish" and not s.get("isBearish"):
                continue
            if category == "gc" and not s.get("isGoldenCrossApproaching"):
                continue
            high_turnover.append(s)

    if not high_turnover:
        return []

    # 2. Enrich with Value Area levels (VAH, POC, VAL)
    sym_list = [s["symbol"] for s in high_turnover]
    va_levels = fetch_batch_value_areas(sym_list, period=period)

    for s in high_turnover:
        sym = s["symbol"]
        lvl = va_levels.get(sym) or va_levels.get(f"{sym}.NS") or {}
        s["vah"] = lvl.get("vah")
        s["poc"] = lvl.get("poc") or lvl.get("pocPrice")
        s["val"] = lvl.get("val")

    # 3. Apply Proximity Filter
    matched = []
    for s in high_turnover:
        price = s.get("price") or 0.0
        if price <= 0:
            continue

        levels_to_test = {}
        if target_level in ["vah", "any"] and s.get("vah"):
            levels_to_test["VAH"] = s["vah"]
        if target_level in ["poc", "any"] and s.get("poc"):
            levels_to_test["POC"] = s["poc"]
        if target_level in ["val", "any"] and s.get("val"):
            levels_to_test["VAL"] = s["val"]
        if target_level in ["dema20", "any"] and s.get("DMA_20"):
            levels_to_test["20 DEMA"] = s["DMA_20"]
        if target_level in ["dema50", "any"] and s.get("DMA_50"):
            levels_to_test["50 DEMA"] = s["DMA_50"]
        if target_level in ["dema100", "any"] and s.get("DMA_100"):
            levels_to_test["100 DEMA"] = s["DMA_100"]
        if target_level in ["dema200", "any"] and s.get("DMA_200"):
            levels_to_test["200 DEMA"] = s["DMA_200"]

        best_match = None
        min_delta_pct = 9999.0

        for lvl_name, lvl_val in levels_to_test.items():
            if not lvl_val or lvl_val <= 0:
                continue
            delta_val = price - lvl_val
            delta_pct = abs(delta_val) / lvl_val * 100.0

            if delta_pct <= proximity_pct:
                if delta_pct < min_delta_pct:
                    min_delta_pct = delta_pct
                    best_match = {
                        "level_name": lvl_name,
                        "level_price": lvl_val,
                        "delta_val": round(delta_val, 2),
                        "delta_pct": round(delta_pct, 3),
                        "position": "ABOVE" if delta_val >= 0 else "BELOW"
                    }

        if best_match:
            s["proximity_match"] = best_match
            matched.append(s)

    # Sort by closest proximity
    matched.sort(key=lambda x: x["proximity_match"]["delta_pct"])
    return matched[:limit]


def capture_chart_screenshot(symbol: str, out_path: Path | None = None) -> Path:
    """Capture a 1080p chart screenshot of the stock from the Vercel web app with automatic guest login."""
    clean_sym = symbol.strip().upper()
    CHARTS_DIR.mkdir(parents=True, exist_ok=True)
    target_out = out_path or (CHARTS_DIR / f"{clean_sym}_1D_chart.png")

    script_path = WORKSPACE_ROOT / ".agents" / "skills" / "dema-broadcast-master" / "scripts" / "capture_stock_chart.mjs"
    print(f"\nCapturing chart screenshot for {clean_sym} via autonomous guest login pipeline...")

    cmd = [
        "node", str(script_path),
        "--symbol", clean_sym,
        "--out", str(target_out),
        "--app", APP_FRONTEND_URL
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode == 0 and target_out.exists():
        print(f"\033[92m✓ Chart screenshot saved to:\033[0m {target_out} ({target_out.stat().st_size} bytes)")
        return target_out
    else:
        print(f"\033[91m✗ Screenshot capture failed:\033[0m {res.stderr}\n{res.stdout}")
        return target_out


def formulate_playbook(stock: dict) -> dict:
    """Construct the Beat-by-Beat Playbook according to /dema-broadcast-master doctrine."""
    sym = stock["symbol"]
    name = stock.get("name", sym)
    cmp_price = stock.get("price", 0.0)
    chg = stock.get("change", 0.0)
    chg_pct = stock.get("changePercent", 0.0)
    turnover = stock.get("turnover_cr", 0.0)

    dema20 = stock.get("DMA_20") or cmp_price
    dema50 = stock.get("DMA_50") or cmp_price
    dema100 = stock.get("DMA_100") or cmp_price
    dema200 = stock.get("DMA_200") or cmp_price
    poc = stock.get("poc") or round(cmp_price * 0.98, 2)
    vah = stock.get("vah") or round(cmp_price * 1.02, 2)
    val = stock.get("val") or round(cmp_price * 0.96, 2)

    target1 = round(cmp_price * 1.05, 2)
    target2 = round(cmp_price * 1.10, 2)
    stop_loss = round(min(dema20, poc) * 0.98, 2)

    match = stock.get("proximity_match", {})
    lvl_name = match.get("level_name", "KEY LEVEL")
    delta_pct = match.get("delta_pct", 0.1)

    title = f"{sym} ₹{cmp_price} BREAKOUT! {lvl_name} Blast & 20 DEMA Institutional Study"
    headline = f"{sym} ₹{cmp_price}"
    sub_hook = f"{lvl_name} Breakout या Trap?"

    playbook = {
        "symbol": sym,
        "name": name,
        "cmp": cmp_price,
        "change_pct": chg_pct,
        "turnover_cr": turnover,
        "app_url": stock.get("app_url", f"{APP_FRONTEND_URL}/stock/{sym}"),
        "levels": {
            "cmp": cmp_price,
            "dema20": dema20,
            "dema50": dema50,
            "dema100": dema100,
            "dema200": dema200,
            "poc": poc,
            "vah": vah,
            "val": val,
            "target1": target1,
            "target2": target2,
            "stop_loss": stop_loss
        },
        "hook_anomaly": f"Live CMP beeping green pulse at ₹{cmp_price} with split-flap snapping into place as price tests {lvl_name} (±{delta_pct}%).",
        "beats": [
            {
                "beat": 1,
                "title": "The Event & CMP Stamp",
                "duration": "~7s",
                "narration": f"Aaj {name} mein live price action ₹{cmp_price} par trade kar raha hai. {chg_pct}% ke session move ke saath institutional turnover ₹{turnover} Crore cross ho chuka hai.",
                "kinetic_text": f"₹{cmp_price} BREAKOUT",
                "radar_action": "CMP Beeping Sonar anchored at latest candle tip with live badge.",
                "level_highlighted": f"● ₹{cmp_price} LIVE"
            },
            {
                "beat": 2,
                "title": "Trend Alignment & 20 DEMA Defense",
                "duration": "~9s",
                "narration": f"20 DEMA ₹{dema20} par sharply upsloping hai, jo price ko dynamic support provide kar rahi hai. 50 aur 100 DEMA ribbon intact hai.",
                "kinetic_text": "20 DEMA DEFENDED",
                "radar_action": f"Downward Red Arrow pointing from CMP to 20 DEMA (₹{dema20}).",
                "level_highlighted": f"◈ 20 DEMA: ₹{dema20}"
            },
            {
                "beat": 3,
                "title": "Volume Profile & Institutional Footprint",
                "duration": "~11s",
                "narration": f"Monthly Volume Profile par Point of Control ₹{poc} par heavy accumulation show kar raha hai. VAH ₹{vah} par breakout confirmation trigger ho rahi hai.",
                "kinetic_text": f"POC ₹{poc} DEMAND",
                "radar_action": "Neon Laser Sweep across volume histogram, lighting up Point of Control node.",
                "level_highlighted": f"◈ POC: ₹{poc} | VAH: ₹{vah}"
            },
            {
                "beat": 4,
                "title": "Upside Targets & Value Corridor",
                "duration": "~10s",
                "narration": f"Agar yeh breakout hold hota hai, toh upside targets ₹{target1} aur ₹{target2} open hote hain.",
                "kinetic_text": f"TARGET ₹{target1}",
                "radar_action": f"Upward Green Arrow pointing to Target 1 (₹{target1}) with delta badge.",
                "level_highlighted": f"◈ TARGET 1: ₹{target1}"
            },
            {
                "beat": 5,
                "title": "Risk Floor & Mandatory Disclaimer",
                "duration": "~8s",
                "narration": f"Invalidation level strictly ₹{stop_loss} par placed hai. Yeh analysis purely educational purpose ke liye hai. Kal market open se pehle levels save kar lijiye.",
                "kinetic_text": f"STOP ₹{stop_loss} | EDU ONLY",
                "radar_action": "Horizontal Red Warning Line at invalidation floor + Closing Save CTA.",
                "level_highlighted": f"◈ STOP: ₹{stop_loss}"
            }
        ],
        "metadata": {
            "title": title,
            "headline": headline,
            "sub_hook": sub_hook,
            "tags": [sym, "DEMA", "Breakout", "StockMarket", "TechnicalAnalysis", "NseIndia"],
            "category_id": "27",
            "privacy": "public"
        }
    }
    return playbook


def display_playbook(playbook: dict):
    """Print the Playbook in a structured, readable format."""
    print("\n" + "=" * 78)
    print(f"  🎬 BEAT-BY-BEAT PLAYBOOK: {playbook['symbol']} ({playbook['name']})")
    print("=" * 78)
    print(f"• CMP: ₹{playbook['cmp']} ({playbook['change_pct']}%)  |  Turnover: ₹{playbook['turnover_cr']} Cr")
    print(f"• App URL: {playbook['app_url']}")
    print(f"• 3-Second Visual Hook: {playbook['hook_anomaly']}\n")

    print("-" * 78)
    for b in playbook["beats"]:
        print(f"[{b['duration']}] Beat {b['beat']}: {b['title']}")
        print(f"  • Spoken Narration : \"{b['narration']}\"")
        print(f"  • Kinetic Overlay  : [{b['kinetic_text']}]")
        print(f"  • Visual & Radar   : {b['radar_action']}")
        print(f"  • Level Highlight  : {b['level_highlighted']}\n")

    print("-" * 78)
    print("📋 PUBLISHING METADATA BLUEPRINT:")
    print(f"  • Title       : {playbook['metadata']['title']}")
    print(f"  • Thumbnail   : {playbook['metadata']['headline']} | {playbook['metadata']['sub_hook']}")
    print(f"  • Tags        : {', '.join(playbook['metadata']['tags'])}")
    print("=" * 78 + "\n")


def print_filtered_table(stocks: list):
    """Print the candidate stocks in a clear CLI table."""
    if not stocks:
        print("\n\033[93mNo stocks matched the specified filter criteria.\033[0m")
        return

    print("\n" + "=" * 105)
    print(f"  🎯 QUALIFIED CANDIDATE STOCKS ({len(stocks)} Matched)")
    print("=" * 105)
    header = f"{'Symbol':<12} {'CMP (₹)':<10} {'Turnover':<13} {'Level':<10} {'Level (₹)':<11} {'Delta %':<10} {'App URL'}"
    print(header)
    print("-" * 105)

    for s in stocks:
        sym = s["symbol"]
        price = f"₹{s.get('price', 0):.2f}"
        turnover = f"₹{s.get('turnover_cr', 0):.1f} Cr"
        m = s.get("proximity_match", {})
        lvl_name = m.get("level_name", "N/A")
        lvl_price = f"₹{m.get('level_price', 0):.2f}"
        delta = f"{m.get('delta_pct', 0):.2f}% {m.get('position', '')}"
        app_url = s.get("app_url", "")
        print(f"{sym:<12} {price:<10} {turnover:<13} {lvl_name:<10} {lvl_price:<11} {delta:<10} {app_url}")

    print("=" * 105 + "\n")


def execute_production(playbook: dict, auto_approve: bool = False):
    """Ask for approval, then execute render and ytstudio upload."""
    display_playbook(playbook)

    if not auto_approve:
        confirm = input("\033[93mDo you approve this playbook to proceed with automated Rendering & YouTube Upload? (y/N): \033[0m").strip().lower()
        if confirm not in ["y", "yes"]:
            print("Operation aborted by user.")
            return

    sym = playbook["symbol"]
    chart_path = CHARTS_DIR / f"{sym}_1D_chart.png"
    if not chart_path.exists():
        capture_chart_screenshot(sym, chart_path)

    print("\n\033[92m[Pipeline 1/4]\033[0m Synthesizing humanized 6-beat audio...")
    audio_script = WORKSPACE_ROOT / ".agents" / "skills" / "dema-broadcast-master" / "scripts" / "build_stock_explainer_audio.py"
    subprocess.run([sys.executable, str(audio_script), "--symbol", sym], check=True)

    print("\n\033[92m[Pipeline 2/4]\033[0m Rendering 16:9 Widescreen Masterclass in Turbo Mode (--concurrency=8)...")
    render_script = WORKSPACE_ROOT / ".agents" / "skills" / "dema-broadcast-master" / "scripts" / "render_stock_explainers.py"
    subprocess.run([sys.executable, str(render_script), "--symbol", sym, "--format", "16x9", "--turbo"], check=True)

    print("\n\033[92m[Pipeline 3/4]\033[0m Generating high-CTR custom thumbnail...")
    thumb_script = WORKSPACE_ROOT / ".agents" / "skills" / "dema-broadcast-master" / "scripts" / "generate_viral_thumbnail.py"
    thumb_out = WORKSPACE_ROOT / f"{sym.lower()}-youtube-16x9-thumbnail.jpg"
    subprocess.run([
        sys.executable, str(thumb_script),
        "--format", "16x9",
        "--out", str(thumb_out),
        "--headline", playbook["metadata"]["headline"],
        "--sub", playbook["metadata"]["sub_hook"],
        "--chart", str(chart_path)
    ], check=True)

    print("\n\033[92m[Pipeline 4/4]\033[0m Uploading directly to YouTube via ytstudio API...")
    publisher_script = WORKSPACE_ROOT / ".agents" / "skills" / "dema-broadcast-master" / "scripts" / "ytstudio_publisher.py"
    video_out = WORKSPACE_ROOT / f"{sym.lower()}-support-resistance-explainer-16x9.mp4"
    if not video_out.exists():
        # Check alternative common locations
        candidates = list(WORKSPACE_ROOT.glob(f"*{sym.lower()}*.mp4"))
        if candidates:
            video_out = candidates[0]

    subprocess.run([
        sys.executable, str(publisher_script),
        "--video", str(video_out),
        "--thumbnail", str(thumb_out),
        "--title", playbook["metadata"]["title"],
        "--description", f"Institutional DEMA & Volume Profile Technical Masterclass for {playbook['name']} ({sym}).\n\nLevels:\nCMP: ₹{playbook['cmp']}\n20 DEMA: ₹{playbook['levels']['dema20']}\nPOC: ₹{playbook['levels']['poc']}\nVAH: ₹{playbook['levels']['vah']}\n\nSEBI Disclaimer: For educational purposes only.",
        "--tags", ",".join(playbook["metadata"]["tags"]),
        "--privacy", "public"
    ], check=True)

    print(f"\n\033[92m🎉 COMPLETE!\033[0m Video for {sym} rendered and published to DEMA ANALYSIS.")


def main():
    parser = argparse.ArgumentParser(description="DEMA Stock Scanner & Autonomous Broadcast Studio CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: status / check
    subparsers.add_parser("check", help="Check backend health and heartbeat status")

    # Command: scan
    scan_parser = subparsers.add_parser("scan", help="Trigger full universe stock scan")
    scan_parser.add_argument("--wait", action="store_true", help="Wait and poll until scan completes")

    # Command: filter
    filter_parser = subparsers.add_parser("filter", help="Filter stocks by turnover and level proximity")
    filter_parser.add_argument("-v", "--min-turnover", type=float, default=200.0, help="Min turnover in ₹ Cr (default: 200.0)")
    filter_parser.add_argument("-p", "--proximity", type=float, default=0.2, help="Proximity threshold %% (default: 0.2)")
    filter_parser.add_argument("-l", "--level", choices=["vah", "poc", "val", "dema20", "dema50", "dema100", "dema200", "any"], default="any", help="Target level to match (default: any)")
    filter_parser.add_argument("--period", choices=["month", "week", "today"], default="month", help="Value Area horizon")
    filter_parser.add_argument("-c", "--category", choices=["all", "bullish", "bearish", "gc"], default="all", help="Scan category")
    filter_parser.add_argument("-n", "--limit", type=int, default=20, help="Max results to return")
    filter_parser.add_argument("--json", action="store_true", help="Output raw JSON")

    # Command: screenshot (and chart alias)
    shot_parser = subparsers.add_parser("screenshot", aliases=["chart"], help="Capture 1080p chart screenshot from web app")
    shot_parser.add_argument("symbol_pos", nargs="?", default="", help="Stock symbol (e.g. UGROCAP)")
    shot_parser.add_argument("-s", "--symbol", default="", help="Stock symbol (optional flag)")
    shot_parser.add_argument("-o", "--out", help="Output file path")

    # Command: playbook
    play_parser = subparsers.add_parser("playbook", help="Formulate Beat-by-Beat Playbook for a stock")
    play_parser.add_argument("symbol_pos", nargs="?", default="", help="Stock symbol")
    play_parser.add_argument("-s", "--symbol", default="", help="Stock symbol (optional flag)")

    # Command: produce
    prod_parser = subparsers.add_parser("produce", help="Formulate Playbook, render, and upload to YouTube")
    prod_parser.add_argument("symbol_pos", nargs="?", default="", help="Stock symbol")
    prod_parser.add_argument("-s", "--symbol", default="", help="Stock symbol (optional flag)")
    prod_parser.add_argument("--yes", action="store_true", help="Auto-approve playbook without interactive confirmation")

    args = parser.parse_args()

    if args.command == "check":
        health = check_backend_health()
        print_health_banner(health)

    elif args.command == "scan":
        trigger_scan(wait=args.wait)

    elif args.command == "filter":
        health = check_backend_health()
        if not health["online"]:
            print_health_banner(health)
            sys.exit(1)

        print(f"\nFiltering universe: Turnover >= ₹{args.min_turnover} Cr | Proximity <= ±{args.proximity}% to {args.level.upper()}...")
        results = filter_stocks(
            min_turnover_cr=args.min_turnover,
            proximity_pct=args.proximity,
            target_level=args.level,
            period=args.period,
            category=args.category,
            limit=args.limit
        )

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print_filtered_table(results)

    elif args.command in ["screenshot", "chart"]:
        sym = args.symbol or args.symbol_pos
        if not sym:
            print("Error: stock symbol required (e.g. dema-scan screenshot UGROCAP)")
            sys.exit(1)
        capture_chart_screenshot(sym, Path(args.out) if args.out else None)

    elif args.command in ["playbook", "produce"]:
        sym = args.symbol or args.symbol_pos
        if not sym:
            print("Error: stock symbol required (e.g. dema-scan playbook UGROCAP)")
            sys.exit(1)
        stocks = fetch_scanned_stocks()
        target_stock = next((s for s in stocks if s["symbol"].upper() == sym.upper()), None)
        if not target_stock:
            target_stock = {"symbol": sym.upper(), "price": 0.0, "volume": 0}

        price = target_stock.get("price") or 0.0
        vol = target_stock.get("volume") or 0
        target_stock["turnover_cr"] = round((vol * price) / 10000000.0, 2)
        target_stock["app_url"] = f"{APP_FRONTEND_URL}/stock/{target_stock['symbol']}"

        # Enrich with Value Area levels
        va_levels = fetch_batch_value_areas([target_stock["symbol"]], period="month")
        lvl = va_levels.get(target_stock["symbol"]) or va_levels.get(f"{target_stock['symbol']}.NS") or {}
        if lvl:
            target_stock["poc"] = lvl.get("poc") or lvl.get("pocPrice")
            target_stock["vah"] = lvl.get("vah")
            target_stock["val"] = lvl.get("val")

        playbook = formulate_playbook(target_stock)

        if args.command == "playbook":
            display_playbook(playbook)
        else:
            execute_production(playbook, auto_approve=args.yes)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
