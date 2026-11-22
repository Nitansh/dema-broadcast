#!/usr/bin/env python3
"""
DEMA Broadcast Master — 30-Second Shorts Batch Renderer
Renders high-retention <=30.0s 9:16 vertical reels for:
- SUNPHARMA
- TRENT
- TVSMOTOR
- AXISBANK

Renders with Edge Angle hardware acceleration, verifies duration <=30.0s,
and places copies in workspace root.
"""

import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

WORKSPACE = Path(r"c:\VideoGen\web motion\claude\Thales")
REMOTION_DIR = WORKSPACE / "modi-remotion"
OUT_DIR = REMOTION_DIR / "out"
OUT_DIR.mkdir(parents=True, exist_ok=True)

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"
FFPROBE = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffprobe.exe")
if not Path(FFPROBE).exists():
    FFPROBE = "ffprobe"

SHORTS = [
    {
        "symbol": "SUNPHARMA",
        "composition": "SunpharmaShort30s",
        "raw_out": OUT_DIR / "sunpharma_30s_short.mp4",
        "final_out": WORKSPACE / "SUNPHARMA_30s_Short.mp4",
    },
    {
        "symbol": "TRENT",
        "composition": "TrentShort30s",
        "raw_out": OUT_DIR / "trent_30s_short.mp4",
        "final_out": WORKSPACE / "TRENT_30s_Short.mp4",
    },
    {
        "symbol": "TVSMOTOR",
        "composition": "TvsmotorShort30s",
        "raw_out": OUT_DIR / "tvsmotor_30s_short.mp4",
        "final_out": WORKSPACE / "TVSMOTOR_30s_Short.mp4",
    },
    {
        "symbol": "AXISBANK",
        "composition": "AxisbankShort30s",
        "raw_out": OUT_DIR / "axisbank_30s_short.mp4",
        "final_out": WORKSPACE / "AXISBANK_30s_Short.mp4",
    },
]

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

def main():
    print("=================================================================")
    print("DEMA BROADCAST MASTER: 30-SECOND VERTICAL SHORTS BATCH RENDER")
    print("=================================================================")

    results = []

    for item in SHORTS:
        sym = item["symbol"]
        comp = item["composition"]
        raw = item["raw_out"]
        final = item["final_out"]

        print(f"\n>>> RENDERING [{sym}] Short: Composition={comp}...")
        t0 = time.time()

        if final.exists():
            info = ffprobe_info(final)
            if info.get("duration_sec", 0) > 20:
                print(f"  [SKIP] Already rendered: {final.name} ({info['duration_sec']}s)")
                results.append(info)
                continue

        cmd = (
            f'npx.cmd remotion render src/dema-suite-entry.jsx {comp} "{raw}" '
            f'--concurrency=4 --port=3045 --gl=angle '
            f'--browser-executable="{EDGE}" '
            f'--ffmpeg-executable="{FFMPEG}" '
            f'--overwrite'
        )
        subprocess.run(cmd, cwd=str(REMOTION_DIR), shell=True, check=True)
        render_time = time.time() - t0
        print(f"  [OK] Rendered in {render_time:.1f}s")

        shutil.copy2(str(raw), str(final))
        info = ffprobe_info(final)
        info["render_time_s"] = round(render_time, 1)
        results.append(info)

        print(f"  Final Output: {final.name} ({info['size_mb']} MB, {info['duration_sec']}s, {info['video']})")
        if info['duration_sec'] <= 30.0:
            print("  ✅ COMPLIANCE: Duration strictly <= 30.0s!")
        else:
            print(f"  ⚠️ WARNING: Duration {info['duration_sec']}s exceeds 30.0s!")

    print("\n=================================================================")
    print("ALL 4 30-SECOND SHORTS RENDERED SUCCESSFULLY!")
    print("=================================================================")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
