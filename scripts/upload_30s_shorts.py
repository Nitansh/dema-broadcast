#!/usr/bin/env python3
"""
DEMA Broadcast Master — 30-Second Shorts YouTube Uploader
Uploads 9:16 Shorts to YouTube with:
- #Shorts in title
- Related 16:9 Masterclass URL prominently placed in description
- Tags: #Shorts, #DEMA, #StockMarketIndia, etc.
- Category: Education (27)
- Privacy: Public

Stocks:
1. SUNPHARMA -> Masterclass: https://youtu.be/TC1RqjLaNdw
2. TRENT -> Masterclass: https://youtu.be/6o4Ii5mVLZQ
3. TVSMOTOR -> Masterclass: https://youtu.be/8YAjQnXIq0Y
4. AXISBANK -> Masterclass: https://youtu.be/ywGWDA7wkIA
"""

import json
import time
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

WORKSPACE = Path(r"c:\VideoGen\web motion\claude\Thales")
CREDS_FILE = Path.home() / ".config" / "ytstudio-cli" / "profiles" / "default" / "credentials.json"
STATUS_FILE = WORKSPACE / "shorts_upload_status.json"

SHORTS_CONFIG = [
    {
        "symbol": "SUNPHARMA",
        "file": WORKSPACE / "SUNPHARMA_30s_Short.mp4",
        "masterclass_id": "TC1RqjLaNdw",
        "cmp": "1884.90",
        "turnover_cr": "361",
        "title": "SUNPHARMA ₹1884 BREAKOUT! All Targets & Supports #Shorts",
        "supports": "20 DEMA ₹1879, 50 DEMA ₹1830, VAL ₹1736",
        "targets": "Target 1 ₹1901, Target 2 ₹1940",
    },
    {
        "symbol": "TRENT",
        "file": WORKSPACE / "TRENT_30s_Short.mp4",
        "masterclass_id": "6o4Ii5mVLZQ",
        "cmp": "3256.10",
        "turnover_cr": "408",
        "title": "TRENT ₹3256 ALL-TIME HIGH BREAKOUT! Targets & Supports #Shorts",
        "supports": "20 DEMA ₹3236, POC ₹3024, VAL ₹2793",
        "targets": "Target 1 ₹3350, Target 2 ₹3480",
    },
    {
        "symbol": "TVSMOTOR",
        "file": WORKSPACE / "TVSMOTOR_30s_Short.mp4",
        "masterclass_id": "8YAjQnXIq0Y",
        "cmp": "4590.00",
        "turnover_cr": "511",
        "title": "TVSMOTOR ₹4590 BUYER SURGE! Key Targets & Supports #Shorts",
        "supports": "20 DEMA ₹4555, POC ₹4447, 50 DEMA ₹4418",
        "targets": "Target 1 ₹4720, Target 2 ₹4850",
    },
    {
        "symbol": "AXISBANK",
        "file": WORKSPACE / "AXISBANK_30s_Short.mp4",
        "masterclass_id": "ywGWDA7wkIA",
        "cmp": "1446.00",
        "turnover_cr": "3106",
        "title": "AXISBANK ₹1446 ₹3106 CR SURGE! Breakout Targets #Shorts",
        "supports": "20 DEMA ₹1385, 50 DEMA ₹1314, VAL ₹1197",
        "targets": "Target 1 ₹1490, Target 2 ₹1540",
    },
]

def get_youtube_client():
    if not CREDS_FILE.exists():
        raise FileNotFoundError(f"Credentials not found at {CREDS_FILE}")
    creds = Credentials.from_authorized_user_file(str(CREDS_FILE))
    if creds.expired and creds.refresh_token:
        print("[AUTH] Refreshing YouTube OAuth token...")
        creds.refresh(Request())
    return build("youtube", "v3", credentials=creds)

def upload_short(youtube, item):
    sym = item["symbol"]
    file_path = item["file"]
    mid = item["masterclass_id"]

    print(f"\n=======================================================")
    print(f"UPLOADING YOUTUBE SHORT: {sym}")
    print(f"  File: {file_path.name} ({file_path.stat().st_size / 1e6:.2f} MB)")
    print(f"  Related Masterclass: https://youtu.be/{mid}")
    print(f"=======================================================")

    desc = (
        f"⚡ Watch Full 16:9 Institutional Masterclass:\n"
        f"👉 https://youtu.be/{mid}\n\n"
        f"{sym} high-velocity 30s technical study using 20/50 DEMA, Volume Profile (POC/VAH/VAL) and Institutional Flow.\n\n"
        f"📊 Live Telemetry Matrix:\n"
        f"• CMP: ₹{item['cmp']}\n"
        f"• Turnover Surge: ₹{item['turnover_cr']} Cr\n"
        f"• Key Dynamic Supports: {item['supports']}\n"
        f"• Breakout Targets: {item['targets']}\n\n"
        f"👉 For complete volume profile and trade playbook, tap 'Related video' on your screen or the link above!\n\n"
        f"⚠️ Strictly educational technical study. No SEBI advisory claims.\n\n"
        f"#Shorts #{sym} #DEMA #StockMarketIndia #TradingStrategy #OptionTrading #PriceAction #Nifty"
    )

    tags = [
        "Shorts",
        sym,
        "DEMA",
        "StockMarketIndia",
        "TradingStrategy",
        "OptionTrading",
        "PriceAction",
        "Nifty",
        "Breakout",
    ]

    body = {
        "snippet": {
            "title": item["title"],
            "description": desc,
            "tags": tags,
            "categoryId": "27",  # Education
            "defaultLanguage": "hi",
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(
        str(file_path),
        mimetype="video/mp4",
        resumable=True,
        chunksize=1024 * 1024 * 4,
    )

    req = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    response = None
    retry_count = 0
    while response is None:
        try:
            status, response = req.next_chunk()
            if status:
                print(f"  Upload progress: {int(status.progress() * 100)}%")
        except Exception as e:
            retry_count += 1
            if retry_count > 5:
                raise e
            print(f"  Transient error: {e}. Retrying in 5s...")
            time.sleep(5)

    video_id = response.get("id")
    video_url = f"https://youtube.com/shorts/{video_id}"
    print(f"  ✅ Uploaded successfully! Video ID: {video_id}")
    print(f"  URL: {video_url}")

    return {
        "symbol": sym,
        "video_id": video_id,
        "shorts_url": video_url,
        "masterclass_id": mid,
        "masterclass_url": f"https://youtu.be/{mid}",
        "uploaded_at": time.strftime("%Y-%m-%d %H:%M:%S IST"),
    }

def main():
    youtube = get_youtube_client()
    status_records = []
    if STATUS_FILE.exists():
        try:
            with open(STATUS_FILE) as f:
                status_records = json.load(f)
        except:
            pass

    for item in SHORTS_CONFIG:
        if not item["file"].exists():
            print(f"[SKIP] Video file not found: {item['file']}")
            continue
        record = upload_short(youtube, item)
        status_records.append(record)
        with open(STATUS_FILE, "w") as f:
            json.dump(status_records, f, indent=2)

    print("\n🎉 ALL YOUTUBE SHORTS UPLOADED SUCCESSFULLY!")
    print(json.dumps(status_records, indent=2))

if __name__ == "__main__":
    main()
