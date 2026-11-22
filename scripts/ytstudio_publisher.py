#!/usr/bin/env python3
"""
ytstudio_publisher.py
Unified, zero-browser YouTube publisher using official ytstudio CLI / YouTube Data API.
Replaces brittle DOM/Puppeteer automation with reliable, direct API sidecar uploads.
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# YouTube Category 27 = Education, 25 = News & Politics
DEFAULT_CATEGORY_ID = "27"


def generate_sidecar(
    video_path: Path,
    title: str,
    description: str,
    tags: list[str],
    privacy: str = "public",
    category_id: str = DEFAULT_CATEGORY_ID,
    thumbnail_path: Path | None = None,
    publish_at: str | None = None,
) -> Path:
    """Generate YAML sidecar next to video file for ytstudio upload."""
    sidecar_path = video_path.with_suffix(".yaml")

    # If publish_at is specified, privacy MUST be private for YouTube scheduled releases
    if publish_at:
        privacy = "private"

    # Format tags safely for YAML
    tags_formatted = json.dumps(tags)

    publish_line = f"publish_at: {publish_at}\n" if publish_at else ""

    content = f"""title: {json.dumps(title)}
description: |
{chr(10).join('  ' + line for line in description.splitlines())}
privacy: {privacy}
{publish_line}tags: {tags_formatted}
category_id: "{category_id}"
default_language: en
default_audio_language: hi
made_for_kids: false
"""
    sidecar_path.write_text(content, encoding="utf-8")
    print(f"Generated sidecar: {sidecar_path}")

    # If thumbnail is provided and different from same-basename jpg, copy or ensure it matches
    if thumbnail_path and thumbnail_path.exists():
        target_thumb = video_path.with_suffix(thumbnail_path.suffix)
        if target_thumb != thumbnail_path:
            import shutil
            shutil.copy2(thumbnail_path, target_thumb)
            print(f"Paired thumbnail: {target_thumb}")

    return sidecar_path


def upload_video(
    video_path: Path,
    execute: bool = True,
) -> dict:
    """Upload video via ytstudio CLI."""
    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    cmd = ["ytstudio", "videos", "upload", str(video_path)]
    if execute:
        cmd.append("--execute")

    print(f"Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)

    stdout = result.stdout
    stderr = result.stderr
    print(stdout)
    if stderr:
        print(stderr, file=sys.stderr)

    if result.returncode != 0:
        raise RuntimeError(f"ytstudio upload failed with exit code {result.returncode}:\n{stderr}\n{stdout}")

    # Parse resulting sidecar to extract video_id if available
    sidecar_path = video_path.with_suffix(".yaml")
    video_id = None
    if sidecar_path.exists():
        for line in sidecar_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("video_id:"):
                video_id = line.split(":", 1)[1].strip()
                break

    return {
        "status": "success",
        "video_path": str(video_path),
        "video_id": video_id,
        "youtube_url": f"https://youtu.be/{video_id}" if video_id else None,
        "stdout": stdout,
    }


def main():
    parser = argparse.ArgumentParser(description="Upload video to YouTube via ytstudio CLI")
    parser.add_argument("--video", required=True, help="Path to video file (.mp4)")
    parser.add_argument("--title", required=True, help="Video title")
    parser.add_argument("--description", default="", help="Video description")
    parser.add_argument("--tags", default="DEMA,StockMarket,Trading,TechnicalAnalysis", help="Comma-separated tags")
    parser.add_argument("--thumbnail", default=None, help="Path to custom thumbnail (.jpg/.png)")
    parser.add_argument("--privacy", default="public", choices=["public", "unlisted", "private"], help="Privacy status")
    parser.add_argument("--category", default=DEFAULT_CATEGORY_ID, help="YouTube Category ID")
    parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without uploading")

    args = parser.parse_args()

    video_path = Path(args.video).resolve()
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    thumb_path = Path(args.thumbnail).resolve() if args.thumbnail else None

    # Generate sidecar
    generate_sidecar(
        video_path=video_path,
        title=args.title,
        description=args.description,
        tags=tags,
        privacy=args.privacy,
        category_id=args.category,
        thumbnail_path=thumb_path,
    )

    # Perform upload
    res = upload_video(video_path, execute=not args.dry_run)
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
