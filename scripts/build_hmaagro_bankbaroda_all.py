#!/usr/bin/env python3
"""
Build Complete Explainer & 30s Short Audio Suites for HMAAGRO and BANKBARODA
- 16:9 Masterclasses: 6-beat institutional masterclass audio + manifest + subtitles
- 9:16 30s Shorts: 4-beat high-retention audio + manifest (<= 30.00s)
"""

import asyncio
import json
import math
import os
import re
import shutil
import ssl
import subprocess
import sys
import wave
from pathlib import Path
import numpy as np

# SSL fix for edge-tts
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

import edge_tts
edge_tts.voices._SSL_CTX = ctx
edge_tts.communicate._SSL_CTX = ctx

SR = 48000
FPS = 30
DEFAULT_VOICE = "en-IN-PrabhatNeural"

WORKSPACE = Path(r"c:\VideoGen\web motion\claude\Thales")
REMOTION_DIR = WORKSPACE / "modi-remotion"
PUBLIC_DATA = REMOTION_DIR / "public" / "data"
PUBLIC_AUDIO = REMOTION_DIR / "public" / "audio"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"

TMP_BASE = WORKSPACE / "tmp_hma_bob"
TMP_BASE.mkdir(parents=True, exist_ok=True)
PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)

INTRO_SEC = 3.50
INTRO_FRAMES = 105
OUTRO_SEC = 5.00
OUTRO_FRAMES = 150

STOCKS_MASTER_DATA = [
    {
        "symbol": "HMAAGRO",
        "name": "HMA Agro Industries",
        "cmp": 33.91,
        "cmp_str": "33 rupees 91 paise",
        "vol_str": "112 Million",
        "turnover_cr": 361,
        "image": "charts/HMAAGRO_1D_chart.png",
        "levels": {
            "cmp": 33.91,
            "val": 29.44,
            "poc": 33.72,
            "d20": 29.98,
            "d50": 27.70,
            "d100": 25.38,
            "d200": 23.66,
            "vah": 33.91,
            "target1": 36.50,
            "target2": 39.80,
            "stop": 29.98,
            "turnover_cr": 361,
        },
        "calib": { "m": 3.5586, "c": -49.375 },
        "scripts_16x9": [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": "Here is the golden trading rule for HMA Agro at current market price 33 rupees 91 paise. Any level below current price becomes support. Any level above becomes resistance and upward targets."
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": "During consolidation, price established a firm base at Value Area Low 29 rupees 44 paise and Point of Control 33 rupees 72 paise. A surge of 112 million shares confirmed heavy institutional accumulation."
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": "As buying momentum expanded, HMA Agro surged above the 20 DEMA at 29 rupees 98 paise, decisively converting short-term moving average resistance into a dynamic cushion."
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": "With the stock trading comfortably above 50 DEMA 27.70, price is actively breaking out above Value Area High 33 rupees 91 paise, signaling the start of a strong momentum expansion."
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": "Sustaining above 33.91 opens up our primary upside target corridor: Target 1 at 36 rupees 50 paise, backed by continuous institutional accumulation."
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": "If turnover stays above 350 Crore, the secondary expansion target stands at 39 rupees 80 paise. Keep trailing stop at 20 DEMA 29 rupees 98 paise. Trade with the levels, confirm with volume."
            }
        ],
        "scripts_30s": {
            "hook": "HMA Agro mein 361 Crore ka volume blast! 33 point 9 par DEMA breakout!",
            "supports": "Key supports: 20 DEMA 29 point 9, VAL 29 point 4 aur 50 DEMA 27 point 7.",
            "targets": "Upside targets: Target 1 36 point 5 aur Target 2 39 point 8!",
            "bridge": "Full institutional masterclass dekhne ke liye niche Related Video par tap karein!",
        }
    },
    {
        "symbol": "BANKBARODA",
        "name": "Bank of Baroda",
        "cmp": 287.00,
        "cmp_str": "287 rupees",
        "vol_str": "22.5 Million",
        "turnover_cr": 645,
        "image": "charts/BANKBARODA_1D_chart.png",
        "levels": {
            "cmp": 287.00,
            "val": 233.27,
            "poc": 275.06,
            "d20": 280.15,
            "d50": 256.94,
            "d100": 246.05,
            "d200": 250.25,
            "vah": 287.00,
            "target1": 295.00,
            "target2": 308.00,
            "stop": 275.00,
            "turnover_cr": 645,
        },
        "calib": { "m": 0.76992, "c": -148.515 },
        "scripts_16x9": [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": "Here is the golden trading rule for Bank of Baroda at current market price 287 rupees. Any level below current price becomes support. Any level above becomes resistance and upward targets."
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": "During the banking rally, price defended the Monthly Point of Control at 275 rupees 06 paise, well above Value Area Low 233 rupees. Turnover of 645 Crore confirmed aggressive institutional absorption."
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": "Price quickly accelerated above the 20 DEMA at 280 rupees 15 paise, flipping overhead resistance into a powerful trend-following support cushion."
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": "Today, Bank of Baroda is printing a clean breakout above Value Area High at 287 rupees, trading above all 4 DEMAs with bullish moving average alignment."
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": "Holding above 287 unlocks the immediate upside highway: Target 1 at 295 rupees, clearing the recent swing resistance."
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": "With sustained banking momentum, the macro expansion target stands at 308 rupees. Protect positions with a trailing stop at Point of Control 275 rupees. Trade with the levels, confirm with volume."
            }
        ],
        "scripts_30s": {
            "hook": "Bank of Baroda mein 645 Crore ka institutional surge! 287 par VAH breakout!",
            "supports": "Key supports: 20 DEMA 280, POC 275 aur 50 DEMA 257.",
            "targets": "Upside targets: Target 1 295 aur Target 2 308!",
            "bridge": "Full institutional masterclass dekhne ke liye niche Related Video par tap karein!",
        }
    }
]

async def generate_chunk_tts(text: str, out_wav: Path, voice: str = DEFAULT_VOICE, rate: str = "+5%"):
    mp3_tmp = out_wav.with_suffix(".mp3")
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch="+0Hz")
    for attempt in range(5):
        try:
            await comm.save(str(mp3_tmp))
            if mp3_tmp.exists() and mp3_tmp.stat().st_size > 100:
                break
        except Exception as e:
            if attempt == 4:
                raise e
            await asyncio.sleep(1.5)

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

def synth_16x9_bed(duration_sec: float) -> np.ndarray:
    samples = int(math.ceil(duration_sec * SR))
    t = np.linspace(0, duration_sec, samples, endpoint=False)
    bpm = 120.0
    beat_sec = 60.0 / bpm

    whoosh_env = np.where((t >= 0.0) & (t <= 0.6), np.exp(-t / 0.18), 0.0)
    white_noise = np.random.uniform(-1, 1, samples)
    whoosh = white_noise * whoosh_env * 0.14

    beat_idx = (t / beat_sec).astype(int)
    freq = np.where(beat_idx % 4 == 0, 55.0, 65.4)
    bass_env = np.exp(-((t % beat_sec) / 0.22))
    bass = np.sin(2 * np.pi * freq * t) * bass_env * 0.18

    arp_notes = [440.0, 523.25, 659.25, 783.99]
    step_sec = beat_sec / 2.0
    note_idx = (t / step_sec).astype(int) % len(arp_notes)
    arp_freqs = np.array([arp_notes[i] for i in note_idx])
    arp_env = np.exp(-((t % step_sec) / 0.10))
    arp = np.sin(2 * np.pi * arp_freqs * t) * arp_env * 0.045

    bed = whoosh + bass + arp
    fade_in = np.clip(t / 0.4, 0, 1)
    fade_out = np.clip((duration_sec - t) / 1.0, 0, 1)
    return bed * fade_in * fade_out

def synth_30s_bed(duration_sec: float) -> np.ndarray:
    samples = int(math.ceil(duration_sec * SR))
    t = np.linspace(0, duration_sec, samples, endpoint=False)
    bpm = 126.0
    beat_sec = 60.0 / bpm

    whoosh_env = np.where((t >= 0.0) & (t <= 0.4), np.exp(-t / 0.12), 0.0)
    white_noise = np.random.uniform(-1, 1, samples)
    whoosh = white_noise * whoosh_env * 0.15

    beat_idx = (t / beat_sec).astype(int)
    freq = np.where(beat_idx % 2 == 0, 55.0, 65.4)
    bass_env = np.exp(-((t % beat_sec) / 0.14))
    bass = np.sin(2 * np.pi * freq * t) * bass_env * 0.18

    bed = whoosh + bass
    fade_in = np.clip(t / 0.2, 0, 1)
    fade_out = np.clip((duration_sec - t) / 0.6, 0, 1)
    return bed * fade_in * fade_out

async def build_16x9_explainer(stock: dict):
    sym = stock["symbol"]
    sym_lower = sym.lower()
    print(f"\n[16:9 MASTERCLASS] Building audio & manifest for {sym}...")

    stock_tmp = TMP_BASE / f"{sym_lower}_16x9"
    stock_tmp.mkdir(parents=True, exist_ok=True)

    raw_chunks = []
    for ch in stock["scripts_16x9"]:
        cid = ch["id"]
        out_wav = stock_tmp / f"{cid}.wav"
        print(f"  Synthesizing chunk '{cid}'...")
        await generate_chunk_tts(ch["text"], out_wav, voice=DEFAULT_VOICE, rate="+5%")
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

    # Sequential Non-Overlapping Placement
    LEAD_IN_SEC = 0.50
    INTER_CHUNK_PAUSE_SEC = 0.45
    POST_SPEECH_SEC = 2.00

    current_time = LEAD_IN_SEC
    chunk_manifests = []
    cue_frames = []

    for rc in raw_chunks:
        start_sec = current_time
        dur = rc["dur"]
        end_sec = start_sec + dur
        start_frame = int(round(start_sec * FPS))
        end_frame = start_frame + int(round(dur * FPS))

        cue_frames.append(start_frame)
        words = rc["text"].split()

        chunk_manifests.append({
            "id": rc["id"],
            "phase": rc["phase"],
            "start_sec": round(start_sec, 3),
            "end_sec": round(end_sec, 3),
            "duration_sec": round(dur, 2),
            "start_frame": start_frame,
            "end_frame": end_frame,
            "text": rc["text"],
            "words": words,
        })
        current_time = end_sec + INTER_CHUNK_PAUSE_SEC

    body_dur_sec = current_time - INTER_CHUNK_PAUSE_SEC + POST_SPEECH_SEC
    body_frames = int(round(body_dur_sec * FPS))
    end_wipe_frame = chunk_manifests[-1]["end_frame"] + 15

    total_speech_samples = int(math.ceil(body_dur_sec * SR))
    speech_track = np.zeros(total_speech_samples, dtype=np.float32)
    for cm, rc in zip(chunk_manifests, raw_chunks):
        idx_start = int(cm["start_sec"] * SR)
        s_arr = rc["samples"]
        idx_end = idx_start + len(s_arr)
        if idx_end > total_speech_samples:
            idx_end = total_speech_samples
            s_arr = s_arr[: idx_end - idx_start]
        speech_track[idx_start:idx_end] = s_arr

    music_track = synth_16x9_bed(body_dur_sec)
    mix_len = min(len(speech_track), len(music_track))
    mix = (speech_track[:mix_len] * 0.92) + (music_track[:mix_len] * 0.22)
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix = mix * (0.95 / peak)

    raw_wav = stock_tmp / f"{sym_lower}_body_raw.wav"
    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        stereo = np.column_stack((mix, mix))
        wf.writeframes((stereo * 32767).astype(np.int16).tobytes())

    body_mp3 = stock_tmp / f"{sym_lower}_body_14lufs.mp3"
    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(raw_wav),
            "-filter_complex", "loudnorm=I=-14:TP=-1.5:LRA=7",
            "-c:a", "libmp3lame",
            "-b:a", "256k",
            "-ar", "48000",
            str(body_mp3),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )

    # Concat Intro & Outro
    intro_mp3 = PUBLIC_AUDIO / "dema_intro_sting.mp3"
    outro_mp3 = PUBLIC_AUDIO / "dema_outro_bed.mp3"
    master_audio_name = f"{sym_lower}_explainer_master.mp3"
    final_master_mp3 = PUBLIC_AUDIO / master_audio_name

    filter_str = (
        f"[0:a]atrim=0:{INTRO_SEC},asetpts=PTS-STARTPTS[a0]; "
        f"[1:a]atrim=0:{body_dur_sec:.2f},asetpts=PTS-STARTPTS[a1]; "
        f"[2:a]atrim=0:{OUTRO_SEC},asetpts=PTS-STARTPTS,afade=t=out:st={OUTRO_SEC - 1.5}:d=1.5[a2]; "
        f"[a0][a1][a2]concat=n=3:v=0:a=1[aout]"
    )
    cmd = [
        FFMPEG, "-y",
        "-i", str(intro_mp3),
        "-i", str(body_mp3),
        "-i", str(outro_mp3),
        "-filter_complex", filter_str,
        "-map", "[aout]",
        "-b:a", "256k",
        "-ar", "48000",
        str(final_master_mp3),
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    # Subtitles shifted +3.5s
    shifted_chunks = []
    for c in chunk_manifests:
        sc = dict(c)
        sc["start_sec"] = round(c["start_sec"] + INTRO_SEC, 3)
        sc["end_sec"] = round(c["end_sec"] + INTRO_SEC, 3)
        sc["start_frame"] = c["start_frame"] + INTRO_FRAMES
        sc["end_frame"] = c["end_frame"] + INTRO_FRAMES
        shifted_chunks.append(sc)

    srt_path = WORKSPACE / f"{sym_lower}_explainer_subtitles.srt"
    def fmt_srt(t):
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = int(t % 60)
        ms = int(round((t - int(t)) * 1000))
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    with open(srt_path, "w", encoding="utf-8") as fs:
        for i, c in enumerate(shifted_chunks):
            fs.write(f"{i+1}\n{fmt_srt(c['start_sec'])} --> {fmt_srt(c['end_sec'])}\n{c['text']}\n\n")

    # Bottom percent coordinates
    m_val = stock["calib"]["m"]
    c_val = stock["calib"]["c"]
    coords = {}
    for k, v in stock["levels"].items():
        if k == "turnover_cr":
            continue
        pct = round(m_val * float(v) + c_val, 1)
        coords[k] = max(10.0, min(95.0, pct))

    total_dur_sec = round(INTRO_SEC + body_dur_sec + OUTRO_SEC, 2)
    total_frames = INTRO_FRAMES + body_frames + OUTRO_FRAMES

    manifest_data = {
        "title": f"{stock['name']} Support, Resistance & Target Masterclass",
        "symbol": stock["symbol"],
        "name": stock["name"],
        "cmp": stock["cmp"],
        "turnover_cr": stock["turnover_cr"],
        "chart_image": stock["image"],
        "levels": stock["levels"],
        "levels_bottom_pct": coords,
        "levels_bottom_pct_16x9": coords,
        "levels_bottom_pct_9x16": coords,
        "intro_frames": INTRO_FRAMES,
        "body_frames": body_frames,
        "outro_frames": OUTRO_FRAMES,
        "total_frames_30fps": total_frames,
        "total_duration_sec": total_dur_sec,
        "cue_frames": [c["start_frame"] for c in shifted_chunks],
        "body_cue_frames": cue_frames,
        "end_wipe_frame": end_wipe_frame,
        "audio_file": master_audio_name,
        "body_audio_file": f"{sym_lower}_body_14lufs.mp3",
        "chunks": shifted_chunks,
        "body_chunks": chunk_manifests,
        "strap_config": {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {stock['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{stock['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VAL & POC FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "ABSORPTION CLUSTER",
                "headline": f"{stock['vol_str']} VOL DEFENDS POC ₹{stock['levels']['poc']:.2f} ABOVE VAL ₹{stock['levels']['val']:.2f}",
                "rightSource": "BUY VOL CONFIRMS",
            },
            "2": {
                "tabLabel": "DEMA 20 RECLAIMED",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC SUPPORT",
                "headline": f"RALLY RECLAIMS 20 DEMA (₹{stock['levels']['d20']:.2f}) · FLIPPED TO SUPPORT",
                "rightSource": "OI EXPANSION",
            },
            "3": {
                "tabLabel": "VAH BREAKOUT",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "INFLECTION THRESHOLD",
                "headline": f"CMP ₹{stock['cmp']:.2f} PRINTS CLEAN BREAKOUT ABOVE VAH ₹{stock['levels']['vah']:.2f}",
                "rightSource": "BULLISH BREAKOUT",
            },
            "4": {
                "tabLabel": "TARGET 1 CORRIDOR",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"MOMENTUM UNLOCKS TARGET 1 AT ₹{stock['levels']['target1']:.2f}",
                "rightSource": f"TARGET ₹{stock['levels']['target1']:.2f}",
            },
            "5": {
                "tabLabel": "TARGET 2 EXPANSION",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "MACRO EXPANSION",
                "headline": f"EXPANSION TARGET: ₹{stock['levels']['target2']:.2f} · TRAILING STOP ₹{stock['levels']['stop']:.2f}",
                "rightSource": "HIGH RISK-REWARD",
            },
        },
        "watermark_words": {
            "0": "UNIVERSAL LAW",
            "1": "ABSORPTION FLOOR",
            "2": "RECLAIMED SUPPORT",
            "3": "VAH BREAKOUT",
            "4": "TARGET HIGHWAY",
            "5": "MACRO EXPANSION",
        },
    }

    manifest_path = PUBLIC_DATA / f"{sym_lower}_explainer_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as fm:
        json.dump(manifest_data, fm, indent=2, ensure_ascii=False)
    shutil.copy2(manifest_path, WORKSPACE / f"{sym_lower}_explainer_manifest.json")

    print(f"  [OK] 16:9 Manifest saved: {manifest_path.name} ({total_dur_sec}s, {total_frames} frames)")
    return manifest_data

async def build_30s_short(stock: dict):
    sym = stock["symbol"]
    sym_lower = sym.lower()
    print(f"\n[9:16 30s SHORT] Building audio & manifest for {sym}...")

    stock_tmp = TMP_BASE / f"{sym_lower}_30s"
    stock_tmp.mkdir(parents=True, exist_ok=True)

    chunks_def = [
        {"id": "c0_hook", "phase": 0, "text": stock["scripts_30s"]["hook"]},
        {"id": "c1_supports", "phase": 1, "text": stock["scripts_30s"]["supports"]},
        {"id": "c2_targets", "phase": 2, "text": stock["scripts_30s"]["targets"]},
        {"id": "c3_bridge", "phase": 3, "text": stock["scripts_30s"]["bridge"]},
    ]

    raw_chunks = []
    for ch in chunks_def:
        cid = ch["id"]
        out_wav = stock_tmp / f"{cid}.wav"
        print(f"  Synthesizing chunk '{cid}'...")
        await generate_chunk_tts(ch["text"], out_wav, voice=DEFAULT_VOICE, rate="+16%")
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

    LEAD_IN_SEC = 0.10
    INTER_PAUSE_SEC = 0.15
    OUTRO_HOLD_SEC = 1.50

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
    assert final_dur_sec <= 30.00, f"Error: {final_dur_sec}s > 30.00s!"
    total_frames = int(round(final_dur_sec * FPS))

    total_samples = int(math.ceil(final_dur_sec * SR))
    voice_master = np.zeros(total_samples, dtype=np.float32)
    for s_sec, arr in voice_track_list:
        start_samp = int(round(s_sec * SR))
        end_samp = min(total_samples, start_samp + len(arr))
        copy_len = end_samp - start_samp
        if copy_len > 0:
            voice_master[start_samp:end_samp] += arr[:copy_len]

    music_bed = synth_30s_bed(final_dur_sec)
    voice_env = np.abs(voice_master)
    kernel = np.ones(int(0.12 * SR)) / int(0.12 * SR)
    smoothed = np.convolve(voice_env, kernel, mode="same")
    duck_gain = np.where(smoothed > 0.05, 0.20, 0.70)
    ducked_music = music_bed * duck_gain

    mixed = (voice_master * 0.95) + (ducked_music * 0.35)
    peak = np.max(np.abs(mixed))
    if peak > 0.95:
        mixed = mixed / peak * 0.95

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

    manifest_data = {
        "title": f"{stock['symbol']} ₹{stock['cmp']} Breakout Analysis #Shorts",
        "symbol": stock["symbol"],
        "name": stock["name"],
        "cmp": stock["cmp"],
        "turnover_cr": stock["turnover_cr"],
        "chart_image": stock["image"],
        "related_video_id": f"PENDING_{stock['symbol']}",
        "related_video_url": f"https://youtu.be/PENDING_{stock['symbol']}",
        "levels": stock["levels"],
        "total_frames_30fps": total_frames,
        "total_duration_sec": final_dur_sec,
        "cue_frames": [c["start_frame"] for c in chunk_manifests],
        "audio_file": master_mp3_name,
        "chunks": chunk_manifests,
        "youtube_shorts": {
            "title": f"{stock['symbol']} ₹{stock['cmp']} BREAKOUT! All Targets & Supports #Shorts",
            "description": (
                f"⚡ Watch Full 16:9 Institutional Masterclass:\n"
                f"👉 https://youtu.be/PENDING_{stock['symbol']}\n\n"
                f"{stock['symbol']} technical breakdown using 20/50 DEMA, Volume Profile (POC/VAH/VAL) and Institutional Flow.\n\n"
                f"📊 Live Telemetry:\n"
                f"• CMP: ₹{stock['cmp']}\n"
                f"• Volume Surge: ₹{stock['turnover_cr']} Cr\n"
                f"• Key Supports: 20 DEMA, POC, VAL\n"
                f"• Targets: Target 1 (₹{stock['levels']['target1']}), Target 2 (₹{stock['levels']['target2']})\n\n"
                f"⚠️ Educational technical study only. No SEBI advisory claims.\n\n"
                f"#Shorts #{stock['symbol']} #DEMA #StockMarketIndia #TradingStrategy #OptionTrading #PriceAction"
            )
        }
    }

    manifest_json_path = PUBLIC_DATA / f"{sym_lower}_30s_reel_manifest.json"
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    shutil.copy2(manifest_json_path, WORKSPACE / f"{sym_lower}_30s_reel_manifest.json")

    print(f"  [OK] 30s Short Manifest saved: {manifest_json_path.name} ({final_dur_sec}s, {total_frames} frames) [STRICTLY <= 30s]")
    return manifest_data

async def main():
    for stock in STOCKS_MASTER_DATA:
        await build_16x9_explainer(stock)
        await build_30s_short(stock)
    print("\n✅ ALL 16:9 AND 30s SHORT SUITES BUILT SUCCESSFULLY FOR HMAAGRO & BANKBARODA!")

if __name__ == "__main__":
    asyncio.run(main())
