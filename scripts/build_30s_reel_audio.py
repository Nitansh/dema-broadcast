#!/usr/bin/env python3
"""
DEMA Broadcast Master — 30-Second Viral Short/Reel Audio & Manifest Generator
Generates high-retention <=30.0s vertical reel audio and timing manifests for:
- SUNPHARMA
- TRENT
- TVSMOTOR
- AXISBANK

Content:
Beat 0: Viral Hook (0 to ~6-7s) -> Turnover surge + CMP breakout
Beat 1: All Key Supports (~7 to ~14s) -> 20 DEMA, POC, VAL
Beat 2: All Targets (~14 to ~20s) -> Target 1, Target 2
Beat 3: Related Video Bridge (~20 to ~27s) -> Tap Related Video below for full masterclass
"""

import asyncio
import json
import math
import os
import re
import ssl
import subprocess
import wave
from pathlib import Path
import numpy as np

# Corporate/Windows SSL patch for edge-tts
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

import edge_tts
edge_tts.voices._SSL_CTX = ctx
edge_tts.communicate._SSL_CTX = ctx

SR = 48000
FPS = 30
DEFAULT_VOICE = "en-IN-PrabhatNeural"
VOICE_RATE = "+16%"

WORKSPACE = Path(r"c:\VideoGen\web motion\claude\Thales")
REMOTION_DIR = WORKSPACE / "modi-remotion"
PUBLIC_DATA = REMOTION_DIR / "public" / "data"
PUBLIC_AUDIO = REMOTION_DIR / "public" / "audio"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"

TMP_BASE = WORKSPACE / "tmp_30s_reels"
TMP_BASE.mkdir(parents=True, exist_ok=True)
PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)

STOCK_SPECS = [
    {
        "symbol": "SUNPHARMA",
        "name": "Sun Pharma",
        "cmp": 1884.90,
        "turnover_cr": 361,
        "chart_image": "charts/SUNPHARMA_1D_chart.png",
        "related_video_id": "TC1RqjLaNdw",
        "levels": {
            "cmp": 1884.90,
            "val": 1736.13,
            "poc": 1884.90,
            "d20": 1879.02,
            "d50": 1829.65,
            "d100": 1846.25,
            "d200": 1857.70,
            "vah": 1901.43,
            "target1": 1901.43,
            "target2": 1940.00,
            "stop": 1857.70,
        },
        "scripts": {
            "hook": "Sun Pharma mein 361 Crore ka volume surge! 1884 par DEMA breakout!",
            "supports": "Key supports: 20 DEMA 1879, 50 DEMA 1830 aur VAL 1736.",
            "targets": "Upside targets: Target 1 1901 aur Target 2 1940!",
            "bridge": "Full trade setup dekhne ke liye niche Related Video par tap karein!",
        }
    },
    {
        "symbol": "TRENT",
        "name": "Trent Ltd",
        "cmp": 3256.10,
        "turnover_cr": 408,
        "chart_image": "charts/TRENT_1D_chart.png",
        "related_video_id": "6o4Ii5mVLZQ",
        "levels": {
            "cmp": 3256.10,
            "val": 2792.66,
            "poc": 3024.38,
            "d20": 3236.09,
            "d50": 3087.20,
            "d100": 2933.45,
            "d200": 2586.95,
            "vah": 3256.10,
            "target1": 3350.00,
            "target2": 3480.00,
            "stop": 3200.00,
        },
        "scripts": {
            "hook": "Trent mein 408 Crore ka massive flow! 3256 all-time high breakout!",
            "supports": "Key supports: 20 DEMA 3236, POC 3024 aur VAL 2793.",
            "targets": "Upside targets: Target 1 3350 aur Target 2 3480!",
            "bridge": "Full trade setup dekhne ke liye niche Related Video par tap karein!",
        }
    },
    {
        "symbol": "TVSMOTOR",
        "name": "TVS Motor",
        "cmp": 4590.00,
        "turnover_cr": 511,
        "chart_image": "charts/TVSMOTOR_1D_chart.png",
        "related_video_id": "8YAjQnXIq0Y",
        "levels": {
            "cmp": 4590.00,
            "val": 3946.59,
            "poc": 4447.02,
            "d20": 4555.41,
            "d50": 4418.66,
            "d100": 4348.06,
            "d200": 4191.74,
            "vah": 4590.00,
            "target1": 4720.00,
            "target2": 4850.00,
            "stop": 4520.00,
        },
        "scripts": {
            "hook": "TVS Motor mein 511 Crore ka buyer accumulation! 4590 par fresh breakout!",
            "supports": "Key supports: 20 DEMA 4555, POC 4447 aur 50 DEMA 4418.",
            "targets": "Upside targets: Target 1 4720 aur Target 2 4850!",
            "bridge": "Full trade setup dekhne ke liye niche Related Video par tap karein!",
        }
    },
    {
        "symbol": "AXISBANK",
        "name": "Axis Bank",
        "cmp": 1446.00,
        "turnover_cr": 3106,
        "chart_image": "charts/AXISBANK_1D_chart.png",
        "related_video_id": "ywGWDA7wkIA",
        "levels": {
            "cmp": 1446.00,
            "val": 1197.00,
            "poc": 1221.90,
            "d20": 1385.05,
            "d50": 1314.49,
            "d100": 1282.60,
            "d200": 1291.59,
            "vah": 1446.00,
            "target1": 1490.00,
            "target2": 1540.00,
            "stop": 1385.05,
        },
        "scripts": {
            "hook": "Axis Bank mein 3106 Crore ka mega institutional flow! 1446 par breakout!",
            "supports": "Key supports: 20 DEMA 1385, 50 DEMA 1314 aur VAL 1197.",
            "targets": "Upside targets: Target 1 1490 aur Target 2 1540!",
            "bridge": "Full trade setup dekhne ke liye niche Related Video par tap karein!",
        }
    },
]

async def generate_chunk_tts(text: str, out_wav: Path, voice: str = DEFAULT_VOICE, rate: str = VOICE_RATE):
    mp3_tmp = out_wav.with_suffix(".mp3")
    comm = edge_tts.Communicate(text, voice, rate=rate)
    for attempt in range(5):
        try:
            await comm.save(str(mp3_tmp))
            if mp3_tmp.exists() and mp3_tmp.stat().st_size > 100:
                break
        except Exception as e:
            if attempt == 4:
                raise e
            await asyncio.sleep(1.0)

    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(mp3_tmp),
            "-ar", str(SR),
            "-ac", "1",
            "-c:a", "pcm_s16le",
            str(out_wav),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    mp3_tmp.unlink(missing_ok=True)

def get_wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wf:
        return wf.getnframes() / wf.getframerate()

def synth_short_bed(duration_sec: float, targets_sec: float = 14.0) -> np.ndarray:
    samples = int(math.ceil(duration_sec * SR))
    t = np.linspace(0, duration_sec, samples, endpoint=False)
    bpm = 124.0
    beat_sec = 60.0 / bpm

    # 1. Opening hook whoosh (0s - 0.4s)
    whoosh_env = np.where((t >= 0.0) & (t <= 0.5), np.exp(-t / 0.14), 0.0)
    white_noise = np.random.uniform(-1, 1, samples)
    whoosh = white_noise * whoosh_env * 0.12

    # 2. Driving Bass Pulse (55Hz / 65Hz alternating)
    beat_idx = (t / beat_sec).astype(int)
    freq = np.where(beat_idx % 2 == 0, 55.0, 65.4)
    bass_env = np.exp(-((t % beat_sec) / 0.15))
    bass = np.sin(2 * np.pi * freq * t) * bass_env * 0.15

    # 3. Target Breakout Shimmer at targets_sec
    shimmer_env = np.where((t >= targets_sec) & (t <= targets_sec + 1.2), np.exp(-(t - targets_sec) / 0.35), 0.0)
    shimmer = np.sin(2 * np.pi * 1760.0 * t) * shimmer_env * 0.08

    # 4. Subtle melodic arpeggio
    arp_notes = [440.0, 523.25, 659.25, 783.99]
    step_sec = beat_sec / 4.0
    note_idx = (t / step_sec).astype(int) % len(arp_notes)
    arp_freqs = np.array([arp_notes[i] for i in note_idx])
    arp_env = np.exp(-((t % step_sec) / 0.06))
    arp = np.sin(2 * np.pi * arp_freqs * t) * arp_env * 0.04

    bed = whoosh + bass + shimmer + arp
    fade_in = np.clip(t / 0.2, 0, 1)
    fade_out = np.clip((duration_sec - t) / 0.8, 0, 1)
    return bed * fade_in * fade_out

async def build_stock_short(spec: dict):
    sym = spec["symbol"]
    sym_lower = sym.lower()
    print(f"\n=======================================================")
    print(f"BUILDING 30s SHORT SUITE: {sym} ({spec['name']})")
    print(f"=======================================================")

    stock_tmp = TMP_BASE / sym_lower
    stock_tmp.mkdir(parents=True, exist_ok=True)

    chunks_def = [
        {"id": "c0_hook", "phase": 0, "text": spec["scripts"]["hook"]},
        {"id": "c1_supports", "phase": 1, "text": spec["scripts"]["supports"]},
        {"id": "c2_targets", "phase": 2, "text": spec["scripts"]["targets"]},
        {"id": "c3_bridge", "phase": 3, "text": spec["scripts"]["bridge"]},
    ]

    raw_chunks = []
    for ch in chunks_def:
        cid = ch["id"]
        out_wav = stock_tmp / f"{cid}.wav"
        print(f"  Synthesizing chunk '{cid}'...")
        await generate_chunk_tts(ch["text"], out_wav)
        dur = get_wav_duration(out_wav)
        with wave.open(str(out_wav), "rb") as wf:
            n = wf.getnframes()
            data = wf.readframes(n)
            s_arr = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
        raw_chunks.append({
            "id": cid,
            "phase": ch["phase"],
            "text": ch["text"],
            "dur": dur,
            "samples": s_arr,
        })
        print(f"    -> Duration: {dur:.2f}s ({int(dur*FPS)} frames)")

    # Timeline Placement with tight pacing
    LEAD_IN_SEC = 0.10  # Instant fast hook
    INTER_PAUSE_SEC = 0.15
    OUTRO_HOLD_SEC = 1.50  # Hold the Related Video callout badge

    current_sec = LEAD_IN_SEC
    chunk_manifests = []
    voice_track_list = []

    for rc in raw_chunks:
        dur = rc["dur"]
        s_sec = current_sec
        e_sec = s_sec + dur
        s_fr = int(round(s_sec * FPS))
        e_fr = int(round(e_sec * FPS))

        chunk_manifests.append({
            "id": rc["id"],
            "phase": rc["phase"],
            "text": rc["text"],
            "start_sec": round(s_sec, 2),
            "end_sec": round(e_sec, 2),
            "start_frame": s_fr,
            "end_frame": e_fr,
            "duration_frames": e_fr - s_fr,
        })

        voice_track_list.append((s_sec, rc["samples"]))
        current_sec = e_sec + INTER_PAUSE_SEC

    total_speech_sec = current_sec
    final_dur_sec = round(total_speech_sec + OUTRO_HOLD_SEC, 2)
    # Strictly ensure <= 30.00 seconds
    assert final_dur_sec <= 30.00, f"Error: final duration {final_dur_sec}s exceeds 30.0s!"
    total_frames = int(round(final_dur_sec * FPS))

    print(f"  Total Duration: {final_dur_sec:.2f}s ({total_frames} frames @ {FPS} FPS) [STRICTLY <= 30s]")

    # Mix Voice and Music Bed
    total_samples = int(math.ceil(final_dur_sec * SR))
    voice_master = np.zeros(total_samples, dtype=np.float32)
    for s_sec, arr in voice_track_list:
        start_samp = int(round(s_sec * SR))
        end_samp = min(total_samples, start_samp + len(arr))
        copy_len = end_samp - start_samp
        if copy_len > 0:
            voice_master[start_samp:end_samp] += arr[:copy_len]

    # Target beat time for SFX
    targets_sec = chunk_manifests[2]["start_sec"]
    music_bed = synth_short_bed(final_dur_sec, targets_sec=targets_sec)

    # Voice ducking of music
    voice_env = np.abs(voice_master)
    kernel_size = int(0.12 * SR)
    kernel = np.ones(kernel_size) / kernel_size
    smoothed_voice = np.convolve(voice_env, kernel, mode="same")
    duck_gain = np.where(smoothed_voice > 0.05, 0.20, 0.70)
    ducked_music = music_bed * duck_gain

    mixed = (voice_master * 0.95) + (ducked_music * 0.35)
    peak = np.max(np.abs(mixed))
    if peak > 0.95:
        mixed = mixed / peak * 0.95

    # Export master audio WAV and MP3
    out_master_wav = stock_tmp / f"{sym_lower}_30s_master.wav"
    int16_mixed = (mixed * 32767.0).astype(np.int16)
    with wave.open(str(out_master_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(int16_mixed.tobytes())

    master_mp3_name = f"{sym_lower}_30s_reel_master.mp3"
    final_master_mp3 = PUBLIC_AUDIO / master_mp3_name
    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(out_master_wav),
            "-b:a", "256k",
            "-ar", "48000",
            str(final_master_mp3),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    print(f"  Master MP3 saved: {final_master_mp3.name}")

    # Build 30-Second Manifest JSON
    manifest_data = {
        "title": f"{spec['symbol']} ₹{spec['cmp']} Breakout Analysis #Shorts",
        "symbol": spec["symbol"],
        "name": spec["name"],
        "cmp": spec["cmp"],
        "turnover_cr": spec["turnover_cr"],
        "chart_image": spec["chart_image"],
        "related_video_id": spec["related_video_id"],
        "related_video_url": f"https://youtu.be/{spec['related_video_id']}",
        "levels": spec["levels"],
        "total_frames_30fps": total_frames,
        "total_duration_sec": final_dur_sec,
        "cue_frames": [c["start_frame"] for c in chunk_manifests],
        "audio_file": master_mp3_name,
        "chunks": chunk_manifests,
        "youtube_shorts": {
            "title": f"{spec['symbol']} ₹{spec['cmp']} BREAKOUT! All Targets & Supports #Shorts",
            "description": (
                f"⚡ Watch Full 16:9 Institutional Masterclass:\n"
                f"👉 https://youtu.be/{spec['related_video_id']}\n\n"
                f"{spec['symbol']} technical breakdown using 20/50 DEMA, Volume Profile (POC/VAH/VAL) and Institutional Flow.\n\n"
                f"📊 Live Telemetry:\n"
                f"• CMP: ₹{spec['cmp']}\n"
                f"• Volume Surge: ₹{spec['turnover_cr']} Cr\n"
                f"• Key Supports: 20 DEMA, POC, VAL\n"
                f"• Targets: Target 1 (₹{spec['levels'].get('target1', 'N/A')}), Target 2 (₹{spec['levels'].get('target2', 'N/A')})\n\n"
                f"⚠️ Educational technical study only. No SEBI advisory claims.\n\n"
                f"#Shorts #{spec['symbol']} #DEMA #StockMarketIndia #TradingStrategy #OptionTrading #PriceAction"
            )
        }
    }

    manifest_json_path = PUBLIC_DATA / f"{sym_lower}_30s_reel_manifest.json"
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    print(f"  Manifest JSON saved: {manifest_json_path.name}")
    return manifest_data

async def main():
    for spec in STOCK_SPECS:
        await build_stock_short(spec)
    print("\n✅ ALL 4 STOCKS 30s SHORTS AUDIO & MANIFESTS GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
