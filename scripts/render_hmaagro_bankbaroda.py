#!/usr/bin/env python3
"""
Turbo Mode Batch Renderer for HMAAGRO & BANKBARODA:
1. HmaagroYouTubeExplainer16x9 -> hmaagro-support-resistance-explainer-16x9.mp4
2. BankbarodaYouTubeExplainer16x9 -> bankbaroda-support-resistance-explainer-16x9.mp4
3. HmaagroShort30s -> HMAAGRO_30s_Short.mp4
4. BankbarodaShort30s -> BANKBARODA_30s_Short.mp4
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

RENDERS = [
    {
        "id": "HmaagroYouTubeExplainer16x9",
        "type": "16x9 Masterclass",
        "raw": OUT_DIR / "hmaagro_explainer_16x9.mp4",
        "final": WORKSPACE / "hmaagro-support-resistance-explainer-16x9.mp4",
        "port": 3051,
    },
    {
        "id": "BankbarodaYouTubeExplainer16x9",
        "type": "16x9 Masterclass",
        "raw": OUT_DIR / "bankbaroda_explainer_16x9.mp4",
        "final": WORKSPACE / "bankbaroda-support-resistance-explainer-16x9.mp4",
        "port": 3052,
    },
    {
        "id": "HmaagroShort30s",
        "type": "9:16 Short",
        "raw": OUT_DIR / "hmaagro_30s_short.mp4",
        "final": WORKSPACE / "HMAAGRO_30s_Short.mp4",
        "port": 3053,
    },
    {
        "id": "BankbarodaShort30s",
        "type": "9:16 Short",
        "raw": OUT_DIR / "bankbaroda_30s_short.mp4",
        "final": WORKSPACE / "BANKBARODA_30s_Short.mp4",
        "port": 3054,
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
    print("TURBO MODE RENDERER: HMAAGRO & BANKBARODA (16:9 + 9:16 SHORTS)")
    print("=================================================================")

    for item in RENDERS:
        comp_id = item["id"]
        vtype = item["type"]
        raw = item["raw"]
        final = item["final"]
        port = item["port"]

        print(f"\n>>> RENDERING [{vtype}] {comp_id}...")
        t0 = time.time()

        cmd = (
            f'npx.cmd remotion render src/dema-suite-entry.jsx {comp_id} "{raw}" '
            f'--concurrency=4 --port={port} --gl=angle '
            f'--browser-executable="{EDGE}" '
            f'--ffmpeg-executable="{FFMPEG}" '
            f'--overwrite'
        )
        subprocess.run(cmd, cwd=str(REMOTION_DIR), shell=True, check=True)
        render_time = time.time() - t0
        print(f"  [OK] Rendered in {render_time:.1f}s")

        shutil.copy2(str(raw), str(final))
        info = ffprobe_info(final)
        print(f"  Final File: {final.name}")
        print(f"  Duration:   {info['duration_sec']}s")
        print(f"  Resolution: {info['video']}")
        print(f"  File Size:  {info['size_mb']} MB")

    print("\n✅ ALL 4 VIDEOS RENDERED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
