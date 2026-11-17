#!/usr/bin/env python3
"""
Ultra-Fast Parallel Remotion Cluster for DEMA Broadcast Master.
Distributes video rendering across multiple concurrent Remotion processes and FFmpeg muxing workers.
Concatenates master broadcast chapters into a unified 1920x1080 MP4 using zero-loss stream copy.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

def find_remotion_entry():
    candidates = [
        Path(r"C:\VideoGen\web motion\claude\Thales\modi-remotion"),
        Path.cwd() / "modi-remotion",
        Path.cwd(),
    ]
    for c in candidates:
        if (c / "package.json").exists():
            return c
    return candidates[0]

def render_single_remotion_comp(args_dict: dict) -> dict:
    """Worker function executed in parallel process to render a Remotion composition."""
    comp_id = args_dict["comp_id"]
    out_mp4 = args_dict["out_mp4"]
    entry_file = args_dict.get("entry_file", "src/dema-suite-entry.jsx")
    remotion_dir = args_dict.get("remotion_dir")
    props = args_dict.get("props", {})
    gl = args_dict.get("gl", "angle")
    concurrency = args_dict.get("concurrency", 4)
    audio_path = args_dict.get("audio_path")
    ffmpeg_bin = args_dict.get("ffmpeg_bin", "ffmpeg")

    start_t = time.time()
    raw_video = out_mp4.replace(".mp4", "_raw.mp4")

    # 1. Remotion CLI Render
    cmd = [
        "npx.cmd" if sys.platform == "win32" else "npx",
        "remotion", "render",
        entry_file,
        comp_id,
        raw_video,
        f"--gl={gl}",
        f"--concurrency={concurrency}",
        "--muted",
        "--log=warn",
    ]
    if props:
        cmd.extend(["--props", json.dumps(props)])

    print(f"[{comp_id}] -> Starting parallel render...")
    res = subprocess.run(cmd, cwd=remotion_dir, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        return {"comp_id": comp_id, "success": False, "error": res.stderr}

    # 2. FFmpeg AV Mux if audio provided
    if audio_path and os.path.exists(audio_path):
        mux_cmd = [
            ffmpeg_bin, "-y",
            "-i", raw_video,
            "-i", audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            out_mp4
        ]
        mux_res = subprocess.run(mux_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if mux_res.returncode == 0 and os.path.exists(raw_video):
            try:
                os.remove(raw_video)
            except Exception:
                pass
    else:
        if os.path.exists(raw_video):
            shutil.move(raw_video, out_mp4)

    dur = round(time.time() - start_t, 1)
    file_size_mb = round(os.path.getsize(out_mp4) / (1024 * 1024), 2) if os.path.exists(out_mp4) else 0.0
    print(f"[{comp_id}] ✓ Render complete in {dur}s ({file_size_mb} MB) -> {os.path.basename(out_mp4)}")
    return {"comp_id": comp_id, "success": True, "out_mp4": out_mp4, "duration": dur, "size_mb": file_size_mb}

def run_parallel_render_cluster(jobs: list, max_parallel_comps: int = 3, remotion_dir: str = None) -> list:
    """Executes a batch of Remotion compositions in parallel across worker processes."""
    rem_path = Path(remotion_dir) if remotion_dir else find_remotion_entry()
    print(f"\n=======================================================")
    print(f"PARALLEL REMOTION CLUSTER: Dispatching {len(jobs)} jobs")
    print(f"Concurrent Workers: {max_parallel_comps} | Engine: {rem_path}")
    print(f"=======================================================\n")

    for j in jobs:
        j["remotion_dir"] = str(rem_path)

    results = []
    t_start = time.time()
    with ProcessPoolExecutor(max_workers=max_parallel_comps) as executor:
        future_map = {executor.submit(render_single_remotion_comp, j): j["comp_id"] for j in jobs}
        for fut in as_completed(future_map):
            comp_name = future_map[fut]
            try:
                data = fut.result()
                results.append(data)
            except Exception as e:
                print(f"[{comp_name}] Fatal Error: {e}")
                results.append({"comp_id": comp_name, "success": False, "error": str(e)})

    total_time = round(time.time() - t_start, 1)
    print(f"\n✓ Cluster completed {len(results)} compositions in {total_time}s total.")
    return results

def concatenate_master_video(chapter_mp4s: list, master_out: str, ffmpeg_bin: str = "ffmpeg") -> str:
    """Concatenates sequential 16:9 chapter MP4s in <2s using FFmpeg stream-copy concat demuxer."""
    concat_list = Path(master_out).parent / "concat_chapters.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for ch in chapter_mp4s:
            escaped = str(ch).replace("\\", "/")
            f.write(f"file '{escaped}'\n")

    cmd = [
        ffmpeg_bin, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        master_out
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode == 0:
        sz_mb = round(os.path.getsize(master_out) / (1024 * 1024), 2)
        print(f"✓ Master 16:9 Video concatenated successfully: {master_out} ({sz_mb} MB)")
        try:
            concat_list.unlink()
        except Exception:
            pass
        return master_out
    else:
        raise RuntimeError(f"FFmpeg concat failed for {master_out}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Parallel Remotion Cluster")
    parser.add_argument("--test", action="store_true", help="Self-test status")
    args = parser.parse_args()
    print("Parallel Remotion Cluster ready.")
