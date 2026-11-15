#!/usr/bin/env python3
"""
Full 16:9 YouTube Master Video Renderer for Waaree Energies (WAAREEENER) Support/Resistance Masterclass.
Renders all 3,915 frames (1920x1080 @ 30fps) with Edge Angle/WebGL acceleration,
muxes EBU R128 -14 LUFS zero-overlap master audio, and creates the widescreen YouTube master.
"""

import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

BASE_DIR = Path(r"c:\VideoGen\web motion\claude\Thales")
REMOTION_DIR = BASE_DIR / "modi-remotion"
SUITE_VIDEOS = BASE_DIR / "DEMA_Daily_Suite_20261113" / "01_Videos"
AUDIO_DIR = BASE_DIR / "DEMA_Daily_Suite_20261113" / "03_Audio"
TMP_OUT = REMOTION_DIR / "out" / "waaree_yt16x9_tmp"

SUITE_VIDEOS.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TMP_OUT.mkdir(parents=True, exist_ok=True)

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"
FFPROBE = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffprobe.exe")
if not Path(FFPROBE).exists():
    FFPROBE = "ffprobe"

RAW_MP4 = TMP_OUT / "waaree_yt16x9_raw.mp4"
FINAL_MP4 = SUITE_VIDEOS / "WAAREEENER_Support_Resistance_Explainer_16x9.mp4"
AUDIO_FILE = REMOTION_DIR / "public" / "audio" / "waaree_explainer_master.mp3"
ROOT_COPY = BASE_DIR / "waaree-support-resistance-explainer-16x9.mp4"


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
    print("==================================================")
    print("RENDERING WAAREE ENERGIES 16:9 YOUTUBE VIDEO (1080p)")
    print("==================================================")

    if not AUDIO_FILE.exists():
        print(f"[ERROR] Missing audio file: {AUDIO_FILE}")
        sys.exit(1)

    # 1. Remotion Render
    cmd = (
        f'npx.cmd remotion render src/dema-suite-entry.jsx WaareeYouTubeExplainer16x9 "{RAW_MP4}" '
        f'--concurrency=4 --gl=angle '
        f'--browser-executable="{EDGE}" '
        f'--ffmpeg-executable="{FFMPEG}" '
        f'--overwrite'
    )
    print("\n>>> [1/3] Executing Remotion render (3,915 frames @ 30fps | 1920x1080)...", flush=True)
    t0 = time.time()
    subprocess.run(cmd, cwd=str(REMOTION_DIR), shell=True, check=True)
    print(f"  [OK] Rendered raw MP4 in {time.time() - t0:.1f}s", flush=True)

    # 2. AV Muxing
    print("\n>>> [2/3] Muxing 1080p video and master audio track...", flush=True)
    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(RAW_MP4),
            "-i", str(AUDIO_FILE),
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "256k",
            "-ar", "48000",
            "-ac", "2",
            "-shortest",
            "-movflags", "+faststart",
            str(FINAL_MP4),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )

    # 3. Copy to root for instant access
    print("\n>>> [3/3] Copying to workspace root...", flush=True)
    shutil.copy2(FINAL_MP4, ROOT_COPY)

    info = ffprobe_info(FINAL_MP4)
    print("\n==================================================")
    print("SUCCESS! WAAREE ENERGIES 16:9 YOUTUBE VIDEO RENDERED:")
    print(f"Output:   {FINAL_MP4}")
    print(f"Root:     {ROOT_COPY}")
    print(f"Duration: {info['duration_sec']}s ({int(info['duration_sec']//60)}m {int(info['duration_sec']%60)}s)")
    print(f"Size:     {info['size_mb']} MB")
    print(f"Format:   {info['video']} | Audio: {info['audio']}")
    print("==================================================")


if __name__ == "__main__":
    main()
