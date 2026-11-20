#!/usr/bin/env python3
"""
DEMA Broadcast Master — Universal Stock Explainer Video Renderer (9:16 & 16:9)
Renders full institutional explainer videos (the Cummins India standard) for ANY stock
that has a technical chart image attached in market telemetry data.

Supports:
- Dual-format output: 9:16 High-Retention Reel (Shorts/Reels) & 16:9 YouTube Master
- Automatic audio & manifest synthesis fallback via build_stock_explainer_audio.py
- Microsoft Edge hardware-accelerated Angle/WebGL rendering
- Zero-overlap audio muxing with EBU R128 loudness normalization
- Batch processing across all image-attached stocks (--all-images)

Usage:
  python render_stock_explainers.py --symbol COALINDIA --format all
  python render_stock_explainers.py --all-images --format 9x16
"""

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path

def get_free_port(start=3600) -> int:
    for p in range(start, start + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', p))
                return p
            except OSError:
                continue
    return start

def find_workspace(start_dir: Path) -> Path:
    for p in [start_dir] + list(start_dir.parents):
        if (p / "modi-remotion" / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe").exists():
            return p
    return Path(r"c:\VideoGen\web motion\claude\Thales")

SKILL_DIR = Path(__file__).resolve().parent.parent
WORKSPACE = find_workspace(SKILL_DIR)
REMOTION_DIR = WORKSPACE / "modi-remotion"
PUBLIC_DATA = REMOTION_DIR / "public" / "data"
PUBLIC_AUDIO = REMOTION_DIR / "public" / "audio"
ENTRY_FILE = "src/dema-suite-entry.jsx"

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"
FFPROBE = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffprobe.exe")
if not Path(FFPROBE).exists():
    FFPROBE = "ffprobe"

DEFAULT_OUT_DIR = WORKSPACE / "DEMA_Daily_Suite_20261113" / "01_Videos"


def ffprobe_info(path: Path) -> dict:
    proc = subprocess.run(
        [
            FFPROBE, "-v", "error",
            "-show_entries", "format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate",
            "-of", "json",
            str(path),
        ],
        capture_output=True, text=True, check=True
    )
    data = json.loads(proc.stdout)
    fmt = data.get("format", {})
    streams = data.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    a = next((s for s in streams if s.get("codec_type") == "audio"), {})
    return {
        "file": path.name,
        "duration_sec": round(float(fmt.get("duration", 0)), 2),
        "size_mb": round(int(fmt.get("size", 0)) / (1024 * 1024), 2),
        "video": f"{v.get('width')}x{v.get('height')} {v.get('codec_name')} @ {v.get('r_frame_rate')}",
        "audio": f"{a.get('codec_name')} {a.get('sample_rate', '48000')}Hz",
    }


def ensure_stock_audio_manifest(symbol: str, market_data_file: Path) -> Path:
    sym = symbol.lower()
    manifest_path = PUBLIC_DATA / f"{sym}_explainer_manifest.json"
    audio_path = PUBLIC_AUDIO / f"{sym}_explainer_master.mp3"

    if manifest_path.exists() and audio_path.exists():
        print(f"[OK] Existing audio & manifest found for {symbol.upper()}")
        return manifest_path

    print(f"\n>>> Auto-generating audio & manifest for {symbol.upper()} via build_stock_explainer_audio.py...")
    script_path = SKILL_DIR / "scripts" / "build_stock_explainer_audio.py"
    cmd = [
        sys.executable, str(script_path),
        "--symbol", symbol,
        "--market-data", str(market_data_file),
    ]
    subprocess.run(cmd, check=True)

    if not manifest_path.exists():
        raise FileNotFoundError(f"Failed to generate {manifest_path}")
    return manifest_path


def render_format(
    comp_id: str,
    props_arg: str,
    raw_mp4: Path,
    final_mp4: Path,
    audio_file: Path,
    concurrency: int = 8,
    port: int = 3500,
):
    print(f"\n--- [REMOTION RENDER] {comp_id} -> {raw_mp4.name} (Port: {port}) ---")
    raw_mp4.parent.mkdir(parents=True, exist_ok=True)
    final_mp4.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "npx.cmd", "remotion", "render",
        ENTRY_FILE,
        comp_id,
        str(raw_mp4),
        f"--concurrency={concurrency}",
        "--gl=angle",
        f"--port={port}",
        f"--browser-executable={EDGE}",
        f"--ffmpeg-executable={FFMPEG}",
        "--overwrite",
    ]
    if props_arg:
        cmd.append(f"--props={props_arg}")

    t0 = time.time()
    subprocess.run(cmd, cwd=str(REMOTION_DIR), check=True)
    t_remotion = time.time() - t0
    print(f"[REMOTION COMPLETE] Rendered in {t_remotion:.1f}s")
    time.sleep(5)

    print(f"\n--- [FFMPEG AV MUX] Muxing master audio {audio_file.name} ---")
    mux_cmd = [
        FFMPEG, "-y",
        "-i", str(raw_mp4),
        "-i", str(audio_file),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "256k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        str(final_mp4),
    ]
    subprocess.run(mux_cmd, check=True)
    time.sleep(5)

    info = ffprobe_info(final_mp4)
    print(f"[FINAL MP4 CREATED] {final_mp4.name}:")
    print(f"  Duration: {info['duration_sec']}s | Size: {info['size_mb']} MB")
    print(f"  Video:    {info['video']}")
    print(f"  Audio:    {info['audio']}")


def render_stock(
    symbol: str,
    market_data_file: Path,
    fmt: str = "all",
    out_dir: Path = DEFAULT_OUT_DIR,
    concurrency: int = 8,
):
    sym = symbol.lower()
    manifest_path = ensure_stock_audio_manifest(symbol, market_data_file)
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    sym_upper = manifest.get("symbol", symbol).upper()
    audio_file = PUBLIC_AUDIO / manifest.get("audio_file", f"{sym}_explainer_master.mp3")
    tmp_out = REMOTION_DIR / "out" / f"{sym}_explainer_tmp"
    tmp_out.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Check for dedicated composition names or fallback to universal
    dedicated_9x16 = {
        "cumminsind": "CumminsExplainer",
        "coalindia": "CoalIndiaExplainer",
        "iiflcaps": "IiflCapsExplainer",
        "bluestarco": "BlueStarCoExplainer",
        "abb": "AbbExplainer",
        "itc": "ItcExplainer",
        "adanient": "AdaniEntExplainer",
        "cochinship": "CochinShipExplainer",
        "goldbees": "GoldBeesExplainer",
        "bharatforg": "BharatForgExplainer",
        "bharatforge": "BharatForgExplainer",
        "waareeener": "WaareeEnerExplainer",
        "waaree": "WaareeEnerExplainer",
        "nhpc": "NhpcExplainer",
        "titan": "TitanExplainer",
        "hindunilvr": "HindunilvrExplainer",
        "hul": "HindunilvrExplainer",
        "maruti": "MarutiExplainer",
        "lenskart": "LenskartExplainer",
        "lenskartsolutions": "LenskartExplainer",
        "geship": "GEShipExplainer",
        "greateastern": "GEShipExplainer",
        "lici": "LiciExplainer",
        "lic": "LiciExplainer",
    }
    dedicated_16x9 = {
        "cumminsind": "CumminsYouTubeExplainer16x9",
        "waareeener": "WaareeEnerYouTubeExplainer16x9",
        "waaree": "WaareeEnerYouTubeExplainer16x9",
        "nhpc": "NhpcYouTubeExplainer16x9",
        "coalindia": "CoalIndiaYouTubeExplainer16x9",
        "iiflcaps": "IiflCapsYouTubeExplainer16x9",
        "bluestarco": "BlueStarCoYouTubeExplainer16x9",
        "abb": "AbbYouTubeExplainer16x9",
        "itc": "ItcYouTubeExplainer16x9",
        "adanient": "AdaniEntYouTubeExplainer16x9",
        "cochinship": "CochinShipYouTubeExplainer16x9",
        "goldbees": "GoldBeesYouTubeExplainer16x9",
        "bharatforg": "BharatForgYouTubeExplainer16x9",
        "bharatforge": "BharatForgYouTubeExplainer16x9",
        "titan": "TitanYouTubeExplainer16x9",
        "hindunilvr": "HindunilvrYouTubeExplainer16x9",
        "hul": "HindunilvrYouTubeExplainer16x9",
        "maruti": "MarutiYouTubeExplainer16x9",
        "lenskart": "LenskartYouTubeExplainer16x9",
        "lenskartsolutions": "LenskartYouTubeExplainer16x9",
        "geship": "GEShipYouTubeExplainer16x9",
        "greateastern": "GEShipYouTubeExplainer16x9",
        "lici": "LiciYouTubeExplainer16x9",
        "lic": "LiciYouTubeExplainer16x9",
    }

    props_json = json.dumps({"manifestPath": f"data/{sym}_explainer_manifest.json"})

    # 1. Render 9:16 Vertical Reel
    if fmt in ["9x16", "all"]:
        comp_9x16 = dedicated_9x16.get(sym, "StockExplainerReel")
        raw_9x16 = tmp_out / f"{sym}_explainer_9x16_raw.mp4"
        final_9x16 = out_dir / f"{sym_upper}_Support_Resistance_Explainer_9x16.mp4"
        root_copy_9x16 = WORKSPACE / f"{sym}-support-resistance-explainer-9x16.mp4"

        print(f"\n=======================================================")
        print(f"RENDERING 9:16 REEL: {sym_upper} ({comp_9x16})")
        print(f"=======================================================")
        render_format(
            comp_id=comp_9x16,
            props_arg=props_json if comp_9x16 == "StockExplainerReel" else "",
            raw_mp4=raw_9x16,
            final_mp4=final_9x16,
            audio_file=audio_file,
            concurrency=concurrency,
            port=get_free_port(3600),
        )
        shutil.copy2(final_9x16, root_copy_9x16)

    # 2. Render 16:9 Full Widescreen YouTube
    if fmt in ["16x9", "all"]:
        comp_16x9 = dedicated_16x9.get(sym, "StockYouTubeExplainer16x9")
        raw_16x9 = tmp_out / f"{sym}_explainer_16x9_raw.mp4"
        final_16x9 = out_dir / f"{sym_upper}_Support_Resistance_Explainer_16x9.mp4"
        root_copy_16x9 = WORKSPACE / f"{sym}-support-resistance-explainer-16x9.mp4"

        print(f"\n=======================================================")
        print(f"RENDERING 16:9 YOUTUBE: {sym_upper} ({comp_16x9})")
        print(f"=======================================================")
        render_format(
            comp_id=comp_16x9,
            props_arg=props_json if comp_16x9 == "StockYouTubeExplainer16x9" else "",
            raw_mp4=raw_16x9,
            final_mp4=final_16x9,
            audio_file=audio_file,
            concurrency=concurrency,
            port=get_free_port(3880),
        )
        shutil.copy2(final_16x9, root_copy_16x9)


def find_all_image_stocks(market_data_file: Path) -> list:
    with open(market_data_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    symbols = []
    seen = set()

    deep_dive = data.get("deep_dive_stocks", {})
    if isinstance(deep_dive, dict):
        for k, v in deep_dive.items():
            sym = v.get("symbol", "").upper()
            if sym and sym not in seen and v.get("image"):
                symbols.append(sym)
                seen.add(sym)

    for cat in ["top_gainers", "momentum_stocks", "top_losers"]:
        for s in data.get(cat, []):
            sym = s.get("symbol", "").upper()
            if sym and sym not in seen and s.get("image"):
                symbols.append(sym)
                seen.add(sym)

    return symbols


def main():
    parser = argparse.ArgumentParser(description="Universal Stock Explainer Video Renderer")
    parser.add_argument("--symbol", type=str, default="", help="Stock symbol to render explainer for (e.g. COALINDIA)")
    parser.add_argument("--all-images", action="store_true", help="Render full explainer videos for ALL stocks having images attached")
    parser.add_argument("--format", type=str, choices=["9x16", "16x9", "all"], default="all", help="Video aspect ratio format")
    parser.add_argument("--concurrency", type=int, default=8, help="Remotion render concurrency (Turbo default: 8 cores)")
    parser.add_argument("--turbo", action="store_true", default=True, help="Force hardware Turbo Mode (concurrency=8, ANGLE WebGL)")
    parser.add_argument("--out-dir", type=str, default=str(DEFAULT_OUT_DIR), help="Output directory")
    parser.add_argument("--market-data", type=str, default="", help="Path to market data JSON file")
    args = parser.parse_args()

    # Enforce Turbo Mode: default concurrency is 8 cores for rapid single/batch explainer renders
    if args.turbo and args.concurrency < 6:
        args.concurrency = 8

    # Locate market data
    if args.market_data and Path(args.market_data).exists():
        market_file = Path(args.market_data)
    else:
        candidates = [
            PUBLIC_DATA / "dema_suite_20261113.json",
            WORKSPACE / "dema_suite_20261113.json",
            SKILL_DIR / "sample_market_data.json",
            WORKSPACE / "sample_market_data.json",
            PUBLIC_DATA / "dema_market_data_20261113.json",
            PUBLIC_DATA / "dema_market_data.json",
        ]
        market_file = next((c for c in candidates if c.exists()), None)

    if not market_file:
        print("[ERROR] No market data file found.")
        sys.exit(1)

    out_dir = Path(args.out_dir)

    if args.all_images:
        stocks = find_all_image_stocks(market_file)
        print(f"\n[DEMA MASTER] Found {len(stocks)} stocks with attached technical images to render:")
        for s in stocks:
            print(f"  * {s}")
        for s in stocks:
            render_stock(
                symbol=s,
                market_data_file=market_file,
                fmt=args.format,
                out_dir=out_dir,
                concurrency=args.concurrency,
            )
    elif args.symbol:
        render_stock(
            symbol=args.symbol,
            market_data_file=market_file,
            fmt=args.format,
            out_dir=out_dir,
            concurrency=args.concurrency,
        )
    else:
        print("\nPlease specify either --symbol <SYM> or --all-images.")
        print("Example: python render_stock_explainers.py --symbol COALINDIA --format all")


if __name__ == "__main__":
    main()
