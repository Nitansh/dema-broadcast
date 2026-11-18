#!/usr/bin/env python3
"""
Automated 16:9 Master Broadcast Video Renderer for DEMA Broadcast Master.
Renders all 5 broadcast acts with concurrency, auto-muxes English audio,
and concatenates into the final 16:9 master video.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
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

CHAPTERS = [
    {"comp": "FullVideoCh1Intro", "audio_id": "fv_ch1_intro", "name": "fv_ch1_intro"},
    {"comp": "FullVideoCh2Macro", "audio_id": "fv_ch2_macro", "name": "fv_ch2_macro"},
    {"comp": "FullVideoCh3Movers", "audio_id": "fv_ch3_movers", "name": "fv_ch3_movers"},
    {"comp": "FullVideoCh4DeepDive", "audio_id": "fv_ch4_deepdive", "name": "fv_ch4_deepdive"},
    {"comp": "FullVideoCh5Recap", "audio_id": "fv_ch5_recap", "name": "fv_ch5_recap"},
]


def render_comp(entry: str, comp_id: str, raw_mp4: Path, concurrency: int = 8):
    cmd = (
        f'npx.cmd remotion render "{entry}" {comp_id} "{raw_mp4}" '
        f'--concurrency={concurrency} --gl=angle '
        f'--browser-executable="{EDGE}" '
        f'--ffmpeg-executable="{FFMPEG}" '
        f'--overwrite'
    )
    print(f"\n[REMOTION] Rendering {comp_id} -> {raw_mp4.name}", flush=True)
    subprocess.run(cmd, cwd=str(REMOTION_DIR), shell=True, check=True)


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
        "video": f"{v.get('width')}x{v.get('height')} {v.get('codec_name')}",
        "audio": a.get("codec_name", "none"),
    }


def main():
    parser = argparse.ArgumentParser(description="Render 16:9 DEMA Master Broadcast.")
    parser.add_argument("--entry", default="src/dema-suite-entry.jsx", help="Remotion entry file relative to modi-remotion")
    parser.add_argument("--concurrency", type=int, default=8, help="Render concurrency (Turbo default: 8 cores)")
    parser.add_argument("--turbo", action="store_true", default=True, help="Force hardware Turbo Mode (concurrency=8, ANGLE WebGL)")
    parser.add_argument("--audio-dir", default=None, help="Directory containing fv_chX_*.mp3 audio files")
    parser.add_argument("--out-dir", default=None, help="Output directory for rendered video files")
    parser.add_argument("--output-name", default="DEMA_Analysis_Daily_Broadcast_16x9_EN.mp4", help="Final master filename")
    args = parser.parse_args()

    # Enforce Turbo Mode: default concurrency is 8 cores for rapid single/batch renders
    if args.turbo and args.concurrency < 6:
        args.concurrency = 8

    audio_dir = Path(args.audio_dir) if args.audio_dir else WORKSPACE_ROOT / "DEMA_Daily_Suite_20261113" / "03_Audio_EN"
    out_dir = Path(args.out_dir) if args.out_dir else WORKSPACE_ROOT / "DEMA_Daily_Suite_20261113" / "01_Videos"
    tmp_out = REMOTION_DIR / "out" / "dema_broadcast_tmp"

    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_out.mkdir(parents=True, exist_ok=True)

    muxed_chapters = []
    chapter_timestamps = []
    running_time = 0.0

    print("==================================================")
    print("DEMA BROADCAST MASTER: 16:9 RENDER PIPELINE")
    print(f"Output Directory: {out_dir}")
    print(f"Audio Source:     {audio_dir}")
    print("==================================================")

    for ch in CHAPTERS:
        comp_id = ch["comp"]
        raw_mp4 = tmp_out / f"{ch['name']}_raw.mp4"
        muxed_mp4 = out_dir / f"{ch['name']}_muxed.mp4"
        audio_file = audio_dir / f"{ch['audio_id']}.mp3"

        if not audio_file.exists():
            print(f"[ERROR] Audio file not found: {audio_file}")
            sys.exit(1)

        # 1. Render raw video if needed
        if not raw_mp4.exists():
            render_comp(args.entry, comp_id, raw_mp4, concurrency=args.concurrency)
        else:
            print(f"[CACHE] Found existing raw render: {raw_mp4.name}")

        # 2. Mux audio and video
        print(f"[MUX] Muxing {raw_mp4.name} + {audio_file.name} -> {muxed_mp4.name}")
        mux_av(raw_mp4, audio_file, muxed_mp4)
        info = ffprobe_info(muxed_mp4)
        muxed_chapters.append(info)

        m = int(running_time // 60)
        s = int(running_time % 60)
        chapter_timestamps.append({
            "id": ch["name"],
            "start": f"{m}:{s:02d}",
            "duration": info["duration_sec"]
        })
        running_time += info["duration_sec"]

    # 3. Concatenate all chapters into master video
    concat_txt = tmp_out / "concat_list.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for ch in CHAPTERS:
            muxed_mp4 = out_dir / f"{ch['name']}_muxed.mp4"
            f.write(f"file '{muxed_mp4.resolve().as_posix()}'\n")

    master_path = out_dir / args.output_name
    print(f"\n[CONCAT] Merging {len(CHAPTERS)} chapters -> {master_path.name}")
    subprocess.run(
        [
            FFMPEG, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_txt),
            "-c", "copy",
            "-movflags", "+faststart",
            str(master_path),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )

    full_info = ffprobe_info(master_path)
    report = {
        "full_video": full_info,
        "chapters": muxed_chapters,
        "chapter_timestamps": chapter_timestamps,
    }

    report_path = out_dir / "render_report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    # Also copy to root working copy
    root_copy = WORKSPACE_ROOT / "master-broadcast-16x9.mp4"
    shutil.copy2(master_path, root_copy)

    print("\n==================================================")
    print(f"[COMPLETE] Master Broadcast Rendered Successfully!")
    print(f"Path:     {master_path}")
    print(f"Duration: {full_info['duration_sec']}s ({int(full_info['duration_sec']//60)}m {int(full_info['duration_sec']%60)}s)")
    print(f"Size:     {full_info['size_mb']} MB")
    print(f"Root:     {root_copy}")
    print("==================================================")


if __name__ == "__main__":
    main()

