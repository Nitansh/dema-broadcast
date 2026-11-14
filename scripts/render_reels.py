#!/usr/bin/env python3
"""
DEMA Broadcast Master — Vertical Reel Video Renderer (9:16 | 1080x1920 @ 30fps)
Automates rendering of engaging short-form vertical reels (Reels 1-10 + Motion Doctrine)
using Remotion, Microsoft Edge/Chrome, and FFmpeg audio-video muxing.

Features:
- Single reel or batch rendering across all 10 standard market reels and Motion Doctrine studies
- Remotion headless rendering with hardware-accelerated Angle/WebGL
- Automatic AV muxing with zero-overlap 14 LUFS master audio tracks
- Generates ffprobe verification metrics and JSON render reports
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = SKILL_ROOT.parent.parent
REMOTION_DIR = WORKSPACE_ROOT / "modi-remotion"

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"
FFPROBE = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffprobe.exe")
if not Path(FFPROBE).exists():
    FFPROBE = "ffprobe"

REEL_CATALOG = [
    {
        "id": "cummins",
        "comp": "CumminsMotionDoctrine",
        "name": "CUMMINSIND_MotionDoctrine_9x16",
        "audio": "cummins_master_with_intro_outro.mp3",
        "fallback_audio": "cummins_motion_doctrine.mp3",
        "title": "Cummins India Motion Doctrine (POC & DEMA Breakout)",
        "duration_sec": 64.37,
    },
    {
        "id": "reel1",
        "comp": "DemaReel1Macro",
        "name": "DEMA_Reel1_Macro_9x16",
        "audio": "reel_1_macro.mp3",
        "fallback_audio": "dema_reel1.mp3",
        "title": "Nifty & Bank Nifty Market Overview",
        "duration_sec": 36.0,
    },
    {
        "id": "reel2",
        "comp": "DemaReel2Losers",
        "name": "DEMA_Reel2_Losers_9x16",
        "audio": "reel_2_losers.mp3",
        "fallback_audio": "dema_reel2.mp3",
        "title": "Top Losers Liquidation Breakdown",
        "duration_sec": 36.0,
    },
    {
        "id": "reel3",
        "comp": "DemaReel3Gainers",
        "name": "DEMA_Reel3_Gainers_9x16",
        "audio": "reel_3_gainers.mp3",
        "fallback_audio": "dema_reel3.mp3",
        "title": "Top Gainers Momentum Surge",
        "duration_sec": 36.0,
    },
    {
        "id": "reel4",
        "comp": "DemaReel4Momentum",
        "name": "DEMA_Reel4_Momentum_9x16",
        "audio": "reel_4_momentum.mp3",
        "fallback_audio": "dema_reel4.mp3",
        "title": "Breakout Radar & Momentum Scan",
        "duration_sec": 36.0,
    },
    {
        "id": "reel5",
        "comp": "DemaReel5CoalIndia",
        "name": "DEMA_Reel5_CoalIndia_9x16",
        "audio": "reel_5_coalindia.mp3",
        "fallback_audio": "dema_reel5.mp3",
        "title": "Coal India Structural Rebound",
        "duration_sec": 36.0,
    },
    {
        "id": "reel6",
        "comp": "DemaReel6IiflCaps",
        "name": "DEMA_Reel6_IiflCaps_9x16",
        "audio": "reel_6_iiflcaps.mp3",
        "fallback_audio": "dema_reel6.mp3",
        "title": "IIFL Capital Services Volume Absorption",
        "duration_sec": 36.0,
    },
    {
        "id": "reel7",
        "comp": "DemaReel7BlueStarCo",
        "name": "DEMA_Reel7_BlueStarCo_9x16",
        "audio": "reel_7_bluestarco.mp3",
        "fallback_audio": "dema_reel7.mp3",
        "title": "Blue Star DEMA Hurdle Test",
        "duration_sec": 36.0,
    },
    {
        "id": "reel8",
        "comp": "DemaReel8Indigo",
        "name": "DEMA_Reel8_Indigo_9x16",
        "audio": "reel_8_indigo.mp3",
        "fallback_audio": "dema_reel8.mp3",
        "title": "InterGlobe Aviation Value Area Defense",
        "duration_sec": 36.0,
    },
    {
        "id": "reel9",
        "comp": "DemaReel9CumminsInd",
        "name": "DEMA_Reel9_CumminsInd_9x16",
        "audio": "reel_9_cumminsind.mp3",
        "fallback_audio": "cummins_motion_doctrine.mp3",
        "title": "Cummins India Daily Level Recap",
        "duration_sec": 36.0,
    },
    {
        "id": "reel10",
        "comp": "DemaReel10Abb",
        "name": "DEMA_Reel10_Abb_9x16",
        "audio": "reel_10_abb.mp3",
        "fallback_audio": "dema_reel10.mp3",
        "title": "ABB India High-Beta Trend Exhaustion",
        "duration_sec": 36.0,
    },
]


def render_comp(entry: str, comp_id: str, raw_mp4: Path, concurrency: int = 4):
    cmd = (
        f'npx.cmd remotion render "{entry}" {comp_id} "{raw_mp4}" '
        f'--concurrency={concurrency} --gl=angle '
        f'--browser-executable="{EDGE}" '
        f'--ffmpeg-executable="{FFMPEG}" '
        f'--overwrite'
    )
    print(f"\n[REMOTION] Rendering {comp_id} -> {raw_mp4.name}", flush=True)
    start = time.time()
    subprocess.run(cmd, cwd=str(REMOTION_DIR), shell=True, check=True)
    print(f"[REMOTION] Rendered {raw_mp4.name} in {time.time() - start:.1f}s", flush=True)


def mux_av(raw_mp4: Path, audio_mp3: Path, final_mp4: Path):
    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(raw_mp4),
            "-i", str(audio_mp3),
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "256k",
            "-ar", "48000",
            "-ac", "2",
            "-shortest",
            "-movflags", "+faststart",
            str(final_mp4),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )


def ffprobe_info(path: Path) -> dict:
    proc = subprocess.run(
        [
            FFPROBE, "-v", "error",
            "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height",
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
        "resolution": f"{v.get('width')}x{v.get('height')}",
        "codec_video": v.get("codec_name"),
        "codec_audio": a.get("codec_name", "none"),
    }


def find_audio_file(item: dict, audio_dirs: list) -> Path:
    candidates = [item["audio"], item.get("fallback_audio")]
    for ad in audio_dirs:
        for c in candidates:
            if not c:
                continue
            p = ad / c
            if p.exists() and p.stat().st_size > 1000:
                return p
    return None


def main():
    parser = argparse.ArgumentParser(description="Render DEMA 9:16 Vertical Reels.")
    parser.add_argument("--reel", default=None, help="Specific reel ID to render (e.g. cummins, reel1..reel10)")
    parser.add_argument("--all", action="store_true", help="Render all reels in catalog")
    parser.add_argument("--entry", default="src/dema-suite-entry.jsx", help="Remotion entry file relative to modi-remotion")
    parser.add_argument("--concurrency", type=int, default=4, help="Render concurrency")
    parser.add_argument("--out-dir", default=None, help="Directory to save final muxed reels")
    parser.add_argument("--audio-dir", default=None, help="Directory containing audio tracks")
    parser.add_argument("--list", action="store_true", help="List all available reels in catalog")
    args = parser.parse_args()

    if args.list:
        print("\n================ DEMA VERTICAL REEL CATALOG ================")
        for r in REEL_CATALOG:
            print(f"[{r['id']:<8}] Comp: {r['comp']:<24} Title: {r['title']}")
        print("============================================================\n")
        return

    # Target Selection
    targets = []
    if args.all:
        targets = REEL_CATALOG
    elif args.reel:
        tgt = next((r for r in REEL_CATALOG if r["id"].lower() == args.reel.lower() or r["comp"].lower() == args.reel.lower()), None)
        if not tgt:
            print(f"[ERROR] Unknown reel: {args.reel}. Run with --list to view available reels.")
            sys.exit(1)
        targets = [tgt]
    else:
        # Default to cummins motion doctrine
        targets = [REEL_CATALOG[0]]

    out_dir = Path(args.out_dir) if args.out_dir else WORKSPACE_ROOT / "DEMA_Daily_Suite_20261113" / "02_Reels_9x16"
    tmp_out = REMOTION_DIR / "out" / "dema_reels_tmp"
    audio_dirs = []
    if args.audio_dir:
        audio_dirs.append(Path(args.audio_dir))
    audio_dirs.extend([
        WORKSPACE_ROOT / "DEMA_Daily_Suite_20261113" / "03_Audio",
        WORKSPACE_ROOT / "DEMA_Daily_Suite_20261113" / "03_Audio_EN",
        REMOTION_DIR / "public" / "audio",
        WORKSPACE_ROOT,
    ])

    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_out.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("DEMA BROADCAST MASTER: 9:16 VERTICAL REELS PIPELINE")
    print(f"Target Count:     {len(targets)}")
    print(f"Output Directory: {out_dir}")
    print("==================================================")

    results = []
    for item in targets:
        comp_id = item["comp"]
        raw_mp4 = tmp_out / f"{item['name']}_raw.mp4"
        final_mp4 = out_dir / f"{item['name']}.mp4"

        audio_file = find_audio_file(item, audio_dirs)
        if not audio_file:
            print(f"[WARNING] No audio file found for {comp_id} (searched for {item['audio']}). Skipping mux or using silent output.")

        # 1. Render raw video
        if not raw_mp4.exists():
            render_comp(args.entry, comp_id, raw_mp4, concurrency=args.concurrency)
        else:
            print(f"\n[CACHE] Found existing raw render: {raw_mp4.name}")

        # 2. Mux audio and video
        if audio_file and audio_file.exists():
            print(f"[MUX] Muxing {raw_mp4.name} + {audio_file.name} -> {final_mp4.name}")
            mux_av(raw_mp4, audio_file, final_mp4)
        else:
            print(f"[COPY] No audio track available; copying raw video as output.")
            shutil.copy2(raw_mp4, final_mp4)

        info = ffprobe_info(final_mp4)
        info["title"] = item["title"]
        info["comp"] = comp_id
        results.append(info)
        print(f"[SUCCESS] {item['name']} -> {info['duration_sec']}s, {info['size_mb']} MB, {info['resolution']}")

    report_path = out_dir / "reels_render_report.json"
    report_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print("\n==================================================")
    print(f"[COMPLETE] Rendered {len(results)} vertical reels successfully!")
    print(f"Summary Report: {report_path}")
    print("==================================================")


if __name__ == "__main__":
    main()
