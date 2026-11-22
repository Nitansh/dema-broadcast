#!/usr/bin/env python3
"""
Upload and Link HMAAGRO and BANKBARODA Masterclasses & 30s Shorts:
1. Upload 16:9 Masterclasses with Sagility-style custom thumbnails
2. Capture masterclass YouTube IDs
3. Upload 9:16 30s Shorts with Related Masterclass link injected prominently
"""

import json
import os
import sys
import time
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

WORKSPACE = Path(r"c:\VideoGen\web motion\claude\Thales")
ARTIFACT_DIR = Path(r"C:\Users\T0263544\.gemini\antigravity\brain\5c1716f0-9208-4e85-937f-49a7d35ae8c3")
CREDS_FILE = Path.home() / ".config" / "ytstudio-cli" / "profiles" / "default" / "credentials.json"
STATUS_FILE = WORKSPACE / "hmaagro_bankbaroda_upload_status.json"

MASTERCLASSES = [
    {
        "symbol": "HMAAGRO",
        "company": "HMA Agro Industries",
        "video_path": WORKSPACE / "hmaagro-support-resistance-explainer-16x9.mp4",
        "thumb_path": ARTIFACT_DIR / "hmaagro-youtube-16x9-thumbnail.jpg",
        "title": "HMA AGRO ₹33.91 BREAKOUT! 361 Cr Volume Surge & Target Highway | DEMA Masterclass",
        "description": """HMA Agro Industries Ltd. (NSE: HMAAGRO) Institutional Technical Analysis Masterclass.

Analyzing live market price ₹33.91 trading strictly above all 4 key DEMA moving averages (20, 50, 100, 200). Featuring ₹361 Cr turnover volume surge (112 Million shares), Value Area High (VAH) breakout at ₹33.91, Monthly Point of Control (POC) accumulation at ₹33.72, and upward green arrow targets to ₹36.50 and ₹39.80.

⏱️ TIMESTAMPS:
0:00 - Introduction & 3-Second Hook
0:04 - Core Trading Law (Support vs Target Arrows)
0:22 - ₹361 Cr Volume Surge & POC ₹33.72 Base
0:42 - 20 DEMA Dynamic Defense (₹29.98 Cushion)
1:02 - Value Area High ₹33.91 Breakout Inflection
1:21 - Upward Green Arrow Targets (₹36.50 & ₹39.80)
1:39 - Trailing Stop & Risk Management

⚠️ DISCLAIMER:
This video is created strictly for educational purposes and market structure study. We are not SEBI registered advisors. Please consult your financial advisor before making any investment decisions.""",
        "tags": ["HmaAgro", "HMAAGRO", "DEMA", "BreakoutStocks", "SmallCapStocks", "StockMarketIndia", "TechnicalAnalysis", "VolumeProfile"],
    },
    {
        "symbol": "BANKBARODA",
        "company": "Bank of Baroda",
        "video_path": WORKSPACE / "bankbaroda-support-resistance-explainer-16x9.mp4",
        "thumb_path": ARTIFACT_DIR / "bankbaroda-youtube-16x9-thumbnail.jpg",
        "title": "BANK OF BARODA ₹287 SURGE! 645 Cr Institutional Flow & All Targets | DEMA Masterclass",
        "description": """Bank of Baroda (NSE: BANKBARODA) Institutional Technical Masterclass.

Analyzing Bank of Baroda's strong PSU banking momentum trading strictly above all 4 key DEMAs (20, 50, 100, 200). Examining the ₹645 Cr turnover volume surge (22.5M volume), Value Area High (VAH) breakout at ₹287.00, Point of Control (POC) accumulation floor at ₹275.06, and upward green arrow targets to ₹295.00 and ₹308.00.

⏱️ TIMESTAMPS:
0:00 - Introduction & 3-Second Hook
0:04 - Core Trading Law (Support vs Target Arrows)
0:20 - ₹645 Cr Volume Surge & POC ₹275.06 Floor
0:40 - 20 DEMA Cushion (₹280.15 Reclaim)
1:00 - Value Area High ₹287 Breakout Boundary
1:18 - Upward Green Arrow Targets (₹295 & ₹308)
1:35 - Trailing Stop & Risk Management

⚠️ DISCLAIMER:
This video is created strictly for educational purposes and market structure study. We are not SEBI registered advisors. Please consult your financial advisor before making any investment decisions.""",
        "tags": ["BankOfBaroda", "BANKBARODA", "PSUBanks", "BankNifty", "DEMA", "BreakoutStocks", "TechnicalAnalysis", "StockMarketIndia", "VolumeProfile"],
    }
]

SHORTS = [
    {
        "symbol": "HMAAGRO",
        "file": WORKSPACE / "HMAAGRO_30s_Short.mp4",
        "cmp": "33.91",
        "turnover_cr": "361",
        "title": "HMA AGRO ₹33.91 BREAKOUT! All Targets & Supports #Shorts",
        "supports": "20 DEMA ₹29.98, VAL ₹29.44, 50 DEMA ₹27.70",
        "targets": "Target 1 ₹36.50, Target 2 ₹39.80",
    },
    {
        "symbol": "BANKBARODA",
        "file": WORKSPACE / "BANKBARODA_30s_Short.mp4",
        "cmp": "287.00",
        "turnover_cr": "645",
        "title": "BANK OF BARODA ₹287 VAH SURGE! Key Targets & Supports #Shorts",
        "supports": "20 DEMA ₹280.15, POC ₹275.06, 50 DEMA ₹256.94",
        "targets": "Target 1 ₹295.00, Target 2 ₹308.00",
    }
]

def get_youtube_client():
    if not CREDS_FILE.exists():
        raise FileNotFoundError(f"Credentials not found at {CREDS_FILE}")
    creds = Credentials.from_authorized_user_file(str(CREDS_FILE))
    if creds.expired and creds.refresh_token:
        print("[AUTH] Refreshing YouTube OAuth token...")
        creds.refresh(Request())
    return build("youtube", "v3", credentials=creds)

def load_status():
    if STATUS_FILE.exists():
        try:
            return json.loads(STATUS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"masterclasses": {}, "shorts": {}}

def save_status(status):
    STATUS_FILE.write_text(json.dumps(status, indent=2), encoding="utf-8")

def upload_masterclass(youtube, item):
    sym = item["symbol"]
    file_path = item["video_path"]
    thumb_path = item["thumb_path"]

    print(f"\n=======================================================")
    print(f"UPLOADING 16:9 MASTERCLASS: {sym}")
    print(f"  File: {file_path.name} ({file_path.stat().st_size / 1e6:.2f} MB)")
    print(f"=======================================================")

    body = {
        "snippet": {
            "title": item["title"],
            "description": item["description"],
            "tags": item["tags"],
            "categoryId": "27",
            "defaultLanguage": "hi",
            "defaultAudioLanguage": "hi",
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
        }
    }

    media = MediaFileUpload(str(file_path), mimetype="video/mp4", resumable=True, chunksize=10*1024*1024)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"  [Progress] Uploaded {int(status.progress() * 100)}%")

    vid_id = response.get("id")
    video_url = f"https://youtu.be/{vid_id}"
    print(f"  [OK] Masterclass LIVE: {video_url}")

    # Set Custom Thumbnail
    if thumb_path and thumb_path.exists():
        try:
            print(f"  Setting Sagility-style custom thumbnail: {thumb_path.name}...")
            thumb_media = MediaFileUpload(str(thumb_path), mimetype="image/jpeg")
            youtube.thumbnails().set(videoId=vid_id, media_body=thumb_media).execute()
            print("  [OK] Custom Thumbnail attached successfully!")
        except Exception as te:
            print(f"  [WARN] Thumbnail upload error: {te}")

    return vid_id, video_url

def upload_short(youtube, item, masterclass_id):
    sym = item["symbol"]
    file_path = item["file"]

    print(f"\n=======================================================")
    print(f"UPLOADING 9:16 SHORT: {sym}")
    print(f"  File: {file_path.name} ({file_path.stat().st_size / 1e6:.2f} MB)")
    print(f"  Linked Masterclass: https://youtu.be/{masterclass_id}")
    print(f"=======================================================")

    desc = (
        f"⚡ Watch Full 16:9 Institutional Masterclass:\n"
        f"👉 https://youtu.be/{masterclass_id}\n\n"
        f"{sym} high-velocity 30s technical breakdown using 20/50 DEMA, Volume Profile (POC/VAH/VAL) and Institutional Flow.\n\n"
        f"📊 Live Telemetry Matrix:\n"
        f"• CMP: ₹{item['cmp']}\n"
        f"• Turnover Surge: ₹{item['turnover_cr']} Cr\n"
        f"• Key Dynamic Supports: {item['supports']}\n"
        f"• Breakout Targets: {item['targets']}\n\n"
        f"⚠️ Strictly educational study. No SEBI advisory claims.\n\n"
        f"#Shorts #{sym} #DEMA #StockMarketIndia #TradingStrategy #PriceAction #TechnicalAnalysis #Nifty50"
    )

    tags = ["Shorts", sym, "DEMA", "StockMarketIndia", "TechnicalAnalysis", "BreakoutStocks", "TradingStrategy"]

    body = {
        "snippet": {
            "title": item["title"],
            "description": desc,
            "tags": tags,
            "categoryId": "27",
            "defaultLanguage": "hi",
            "defaultAudioLanguage": "hi",
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
        }
    }

    media = MediaFileUpload(str(file_path), mimetype="video/mp4", resumable=True, chunksize=5*1024*1024)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"  [Progress] Uploaded {int(status.progress() * 100)}%")

    vid_id = response.get("id")
    short_url = f"https://youtube.com/shorts/{vid_id}"
    print(f"  [OK] Short LIVE: {short_url}")
    return vid_id, short_url

def main():
    print("=================================================================")
    print("DEMA BROADCAST MASTER: HMAAGRO & BANKBARODA YOUTUBE DISPATCHER")
    print("=================================================================")

    youtube = get_youtube_client()
    status = load_status()

    # 1. Upload Masterclasses
    for mc in MASTERCLASSES:
        sym = mc["symbol"]
        if sym in status["masterclasses"] and status["masterclasses"][sym].get("status") == "success":
            print(f"[SKIP] {sym} masterclass already uploaded: {status['masterclasses'][sym]['url']}")
            continue

        if not mc["video_path"].exists():
            print(f"[WAIT] {mc['video_path'].name} not found yet, still rendering...")
            continue

        vid_id, url = upload_masterclass(youtube, mc)
        status["masterclasses"][sym] = {
            "status": "success",
            "video_id": vid_id,
            "url": url,
            "title": mc["title"],
            "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        save_status(status)

    # 2. Upload Shorts
    for sh in SHORTS:
        sym = sh["symbol"]
        if sym in status["shorts"] and status["shorts"][sym].get("status") == "success":
            print(f"[SKIP] {sym} short already uploaded: {status['shorts'][sym]['url']}")
            continue

        if not sh["file"].exists():
            print(f"[WAIT] {sh['file'].name} not found yet, still rendering...")
            continue

        mc_info = status["masterclasses"].get(sym, {})
        mc_id = mc_info.get("video_id", "PENDING")

        vid_id, url = upload_short(youtube, sh, mc_id)
        status["shorts"][sym] = {
            "status": "success",
            "video_id": vid_id,
            "url": url,
            "title": sh["title"],
            "linked_masterclass_id": mc_id,
            "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        save_status(status)

    print("\n=================================================================")
    print("ALL UPLOADS COMPLETED SUCCESSFULLY!")
    print("=================================================================")

if __name__ == "__main__":
    main()
