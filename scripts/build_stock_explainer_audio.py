#!/usr/bin/env python3
"""
DEMA Broadcast Master — Universal Stock Explainer Audio & Manifest Generator
Synthesizes institutional 6-beat zero-overlap narration, procedural 120 BPM score bed,
sub-bass drops, DEMA Intro & Outro concatenation, time-shifted subtitles, and manifest
for ANY stock that has a technical chart image attached (the Cummins India standard).

Usage:
  python build_stock_explainer_audio.py --symbol COALINDIA
  python build_stock_explainer_audio.py --all-images
"""

import argparse
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

def find_workspace(start_dir: Path) -> Path:
    for p in [start_dir] + list(start_dir.parents):
        if (p / "modi-remotion" / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe").exists():
            return p
    return Path(r"c:\VideoGen\web motion\claude\Thales")

SKILL_DIR = Path(__file__).resolve().parent.parent
WORKSPACE = find_workspace(SKILL_DIR)
REMOTION_DIR = WORKSPACE / "modi-remotion"
PUBLIC_DATA = REMOTION_DIR / "public" / "data"
PUBLIC_AUDIO = REMOTION_DIR / "public" / "audio"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"

TMP_BASE = WORKSPACE / "tmp_stock_explainers"
TMP_BASE.mkdir(parents=True, exist_ok=True)
PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)


def parse_price(val) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = re.sub(r"[^\d.]", "", val)
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    return 0.0


def format_rupees(val: float) -> str:
    if val >= 1000:
        return f"{val:,.2f}".replace(".00", "")
    return f"{val:.2f}".replace(".00", "")


def extract_stock_levels(stock_info: dict) -> dict:
    symbol = stock_info.get("symbol", "STOCK").upper()
    name = stock_info.get("name", symbol)
    
    # Extract CMP
    cmp_val = parse_price(stock_info.get("ltp") or stock_info.get("cmp") or stock_info.get("close", 1000))
    if cmp_val <= 0:
        cmp_val = 1000.0

    vol_str = stock_info.get("vol", "1.2 M")
    oi_str = stock_info.get("oi", "Bullish Long Buildup")

    # Moving averages
    dema = stock_info.get("dema", {})
    if isinstance(dema, dict):
        d20 = parse_price(dema.get("d20")) or round(cmp_val * 0.985, 2)
        d50 = parse_price(dema.get("d50")) or round(cmp_val * 0.975, 2)
        d100 = parse_price(dema.get("d100")) or round(cmp_val * 1.045, 2)
        d200 = parse_price(dema.get("d200")) or round(cmp_val * 1.085, 2)
    else:
        d20 = round(cmp_val * 0.985, 2)
        d50 = round(cmp_val * 0.995, 2)
        d100 = round(cmp_val * 1.045, 2)
        d200 = round(cmp_val * 1.085, 2)

    # Volume Profile
    vp = stock_info.get("vp", {})
    if isinstance(vp, dict):
        val = parse_price(vp.get("val")) or round(min(cmp_val, d20) * 0.965, 2)
        poc = parse_price(vp.get("poc")) or round(min(cmp_val, d20) * 0.985, 2)
        vah = parse_price(vp.get("vah")) or round(max(cmp_val, d50) * 1.045, 2)
    else:
        val = round(cmp_val * 0.945, 2)
        poc = round(cmp_val * 0.975, 2)
        vah = round(cmp_val * 1.055, 2)

    image_path = stock_info.get("image") or f"charts/{symbol}_1D_chart.png"

    # Identify primary hurdle (closest moving average or VAH above CMP)
    above_levels = [("50 DEMA", d50), ("100 DEMA", d100), ("200 DEMA", d200), ("Value Area High", vah)]
    hurdles = [(lbl, lvl) for lbl, lvl in above_levels if lvl >= cmp_val]
    if hurdles:
        hurdle_name, hurdle_lvl = hurdles[0]
    else:
        hurdle_name, hurdle_lvl = "50 DEMA", d50

    return {
        "symbol": symbol,
        "name": name,
        "cmp": cmp_val,
        "cmp_str": f"{format_rupees(cmp_val)} rupees",
        "vol_str": vol_str,
        "oi_str": oi_str,
        "val": val,
        "val_str": f"{format_rupees(val)} rupees",
        "poc": poc,
        "poc_str": f"{format_rupees(poc)} rupees",
        "d20": d20,
        "d20_str": f"{format_rupees(d20)} rupees",
        "d50": d50,
        "d50_str": f"{format_rupees(d50)} rupees",
        "d100": d100,
        "d100_str": f"{format_rupees(d100)}",
        "d200": d200,
        "d200_str": f"{format_rupees(d200)} rupees",
        "vah": vah,
        "vah_str": f"{format_rupees(vah)} rupees",
        "hurdle_name": hurdle_name,
        "hurdle_str": f"{format_rupees(hurdle_lvl)} rupees",
        "image": image_path,
    }


def generate_6_beat_script(info: dict) -> list:
    name = info["name"]
    cmp_str = info["cmp_str"]
    poc_str = info["poc_str"]
    val_str = info["val_str"]
    vol_str = info["vol_str"]
    d20_str = info["d20_str"]
    hurdle_name = info["hurdle_name"]
    hurdle_str = info["hurdle_str"]
    vah_str = info["vah_str"]
    d100_str = info["d100_str"]
    d200_str = info["d200_str"]

    return [
        {
            "id": "c0_master_rule",
            "phase": 0,
            "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
        },
        {
            "id": "c1_val_poc",
            "phase": 1,
            "text": f"During the cascade down, price breached every short-term average until hitting the Monthly Point of Control at {poc_str}, right above Value Area Low {val_str}. Heavy institutional buy volume of {vol_str} shares confirmed the accumulation floor.",
        },
        {
            "id": "c2_dema20",
            "phase": 2,
            "text": f"As price rallied up from Point of Control, expanding buy volume and fresh Open Interest pushed {name} above the 20 DEMA at {d20_str}, officially flipping it from overhead resistance into dynamic support.",
        },
        {
            "id": "c3_dema50",
            "phase": 3,
            "text": f"Today, {name} is testing the key inflection threshold at {hurdle_name} around {hurdle_str}. A decisive daily close above turns this hurdle into fresh support, while rejection keeps it as immediate resistance.",
        },
        {
            "id": "c4_vah",
            "phase": 4,
            "text": f"Clearing this inflection hurdle unlocks the primary upside target: Value Area High at {vah_str}. Because current price is below VAH, it stands as the major overhead resistance ceiling for this rally.",
        },
        {
            "id": "c5_macro",
            "phase": 5,
            "text": f"If buy volume and Open Interest sustain momentum, the next macro resistance targets are the 100 DEMA at {d100_str} and the trend-reversal 200 DEMA at {d200_str}. Trade with the levels, confirm with volume.",
        },
    ]


async def generate_chunk_tts(text: str, out_wav: Path, voice: str = DEFAULT_VOICE):
    mp3_tmp = out_wav.with_suffix(".mp3")
    comm = edge_tts.Communicate(text, voice, rate="+5%", pitch="+0Hz")
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


def synth_procedural_bed_with_sfx(duration_sec: float, poc_hit_sec: float = 12.0, hurdle_sec: float = 28.0) -> np.ndarray:
    samples = int(math.ceil(duration_sec * SR))
    t = np.linspace(0, duration_sec, samples, endpoint=False)
    bpm = 120.0
    beat_sec = 60.0 / bpm

    # 1. Opening shutter snap & whoosh SFX (0.0s - 0.5s)
    whoosh_env = np.where((t >= 0.0) & (t <= 0.6), np.exp(-t / 0.18), 0.0)
    white_noise = np.random.uniform(-1, 1, samples)
    whoosh = white_noise * whoosh_env * 0.14
    click_t = t - 0.08
    click = np.where(
        (click_t >= 0) & (click_t <= 0.04),
        np.sin(2 * np.pi * 1800.0 * click_t) * np.exp(-click_t / 0.008),
        0.0
    ) * 0.28

    # 2. Sub-bass pulse (55 Hz A1 fundamental)
    bass_env = np.exp(-((t % beat_sec) / 0.12))
    bass_freq = 55.0

    # 3. Deep 45 Hz sub-bass drop on POC impact
    sub_impact = np.where(
        (t >= poc_hit_sec - 0.1) & (t <= poc_hit_sec + 2.5),
        1.8 * np.exp(-((t - poc_hit_sec) / 0.75)),
        0.0
    )
    bass = np.sin(2 * np.pi * bass_freq * t) * (bass_env * 0.20 + sub_impact * 0.40)

    # 4. Kick pulse on beat 1 & 3
    kick_pulse = np.exp(-((t % (beat_sec * 2)) / 0.08)) * np.sin(2 * np.pi * 65.0 * np.exp(-t * 2.5) * t)
    kick = kick_pulse * 0.16

    # 5. Arpeggio synth (A minor pentatonic: 440, 523.25, 659.25, 783.99)
    arp_notes = [440.0, 523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25]
    step_sec = beat_sec / 4.0
    note_idx = (t / step_sec).astype(int) % len(arp_notes)
    arp_freqs = np.array([arp_notes[i] for i in note_idx])
    arp_env = np.exp(-((t % step_sec) / 0.05))
    arp = np.sin(2 * np.pi * arp_freqs * t) * arp_env * 0.065

    # 6. Tension riser leading into hurdle test
    riser_start = max(0.0, hurdle_sec - 2.2)
    riser_t = np.clip((t - riser_start) / 2.2, 0, 1)
    riser = np.sin(2 * np.pi * (180.0 + riser_t * 620.0) * t) * riser_t * 0.075

    bed = whoosh + click + bass + kick + arp + riser
    fade_in = np.clip(t / 0.3, 0, 1)
    fade_out = np.clip((duration_sec - t) / 1.6, 0, 1)
    return bed * fade_in * fade_out


async def process_single_stock(stock_info: dict, voice: str = DEFAULT_VOICE) -> dict:
    info = extract_stock_levels(stock_info)
    sym = info["symbol"].lower()
    print(f"\n=======================================================")
    print(f"PROCESSING EXPLAINER SUITE: {info['symbol']} ({info['name']})")
    print(f"  CMP: ₹{info['cmp']:.2f} | Chart: {info['image']}")
    print(f"=======================================================")

    stock_tmp = TMP_BASE / sym
    stock_tmp.mkdir(parents=True, exist_ok=True)

    chunks = generate_6_beat_script(info)

    raw_chunks = []
    for ch in chunks:
        cid = ch["id"]
        out_wav = stock_tmp / f"{cid}.wav"
        print(f"  Synthesizing chunk '{cid}'...")
        await generate_chunk_tts(ch["text"], out_wav, voice=voice)
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
        print(f"    -> Duration: {dur:.2f}s")

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
        print(f"  [Beat {rc['phase']}] {start_sec:.2f}s -> {end_sec:.2f}s (frames {start_frame} -> {end_frame})")
        current_time = end_sec + INTER_CHUNK_PAUSE_SEC

    body_dur_sec = current_time - INTER_CHUNK_PAUSE_SEC + POST_SPEECH_SEC
    body_frames = int(round(body_dur_sec * FPS))
    end_wipe_frame = chunk_manifests[-1]["end_frame"] + 15

    # Speech track assembly
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

    # Score bed
    poc_hit_sec = chunk_manifests[1]["start_sec"]
    hurdle_sec = chunk_manifests[3]["start_sec"]
    music_track = synth_procedural_bed_with_sfx(body_dur_sec, poc_hit_sec, hurdle_sec)

    # Mix
    mix_len = min(len(speech_track), len(music_track))
    mix = (speech_track[:mix_len] * 0.92) + (music_track[:mix_len] * 0.22)
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix = mix * (0.95 / peak)

    raw_wav = stock_tmp / f"{sym}_explainer_body_raw.wav"
    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        stereo = np.column_stack((mix, mix))
        wf.writeframes((stereo * 32767).astype(np.int16).tobytes())

    # Loudnorm to -14 LUFS
    body_mp3 = stock_tmp / f"{sym}_explainer_body_14lufs.mp3"
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

    # Concatenate DEMA Intro (3.5s) & Outro (5.0s)
    intro_mp3 = PUBLIC_AUDIO / "dema_intro_sting.mp3"
    outro_mp3 = PUBLIC_AUDIO / "dema_outro_bed.mp3"
    INTRO_SEC = 3.50
    INTRO_FRAMES = 105
    OUTRO_SEC = 5.00
    OUTRO_FRAMES = 150

    master_audio_name = f"{sym}_explainer_master.mp3"
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

    # Subtitles (.srt and .vtt) with +3.50s time shift for Intro (saved in workspace root)
    srt_path = WORKSPACE / f"{sym}_explainer_subtitles.srt"
    vtt_path = WORKSPACE / f"{sym}_explainer_subtitles.vtt"

    def fmt_srt(t):
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = int(t % 60)
        ms = int(round((t - int(t)) * 1000))
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    def fmt_vtt(t):
        return fmt_srt(t).replace(",", ".")

    shifted_chunks = []
    for c in chunk_manifests:
        sc = dict(c)
        sc["start_sec"] = round(c["start_sec"] + INTRO_SEC, 3)
        sc["end_sec"] = round(c["end_sec"] + INTRO_SEC, 3)
        sc["start_frame"] = c["start_frame"] + INTRO_FRAMES
        sc["end_frame"] = c["end_frame"] + INTRO_FRAMES
        shifted_chunks.append(sc)

    with open(srt_path, "w", encoding="utf-8") as fs, open(vtt_path, "w", encoding="utf-8") as fv:
        fv.write("WEBVTT\n\n")
        for i, c in enumerate(shifted_chunks):
            s_s = c["start_sec"]
            s_e = c["end_sec"]
            fs.write(f"{i+1}\n{fmt_srt(s_s)} --> {fmt_srt(s_e)}\n{c['text']}\n\n")
            fv.write(f"{fmt_vtt(s_s)} --> {fmt_vtt(s_e)}\n{c['text']}\n\n")

    # Final Manifest JSON
    total_dur_sec = round(INTRO_SEC + body_dur_sec + OUTRO_SEC, 2)
    total_frames = INTRO_FRAMES + body_frames + OUTRO_FRAMES

    manifest_data = {
        "title": f"{info['name']} Support, Resistance & Target Masterclass",
        "symbol": info["symbol"],
        "name": info["name"],
        "cmp": info["cmp"],
        "chart_image": info["image"],
        "levels": {
            "cmp": info["cmp"],
            "val": info["val"],
            "poc": info["poc"],
            "d20": info["d20"],
            "d50": info["d50"],
            "d100": info["d100"],
            "d200": info["d200"],
            "vah": info["vah"],
        },
        "intro_frames": INTRO_FRAMES,
        "body_frames": body_frames,
        "outro_frames": OUTRO_FRAMES,
        "total_frames_30fps": total_frames,
        "total_duration_sec": total_dur_sec,
        "cue_frames": [c["start_frame"] for c in shifted_chunks],
        "body_cue_frames": cue_frames,
        "end_wipe_frame": end_wipe_frame,
        "audio_file": master_audio_name,
        "body_audio_file": f"{sym}_explainer_body_14lufs.mp3",
        "chunks": shifted_chunks,
        "body_chunks": chunk_manifests,
        "strap_config": {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VAL & POC FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "ABSORPTION CLUSTER",
                "headline": f"{info['vol_str']} VOL DEFENDS POC ₹{info['poc']:.2f} ABOVE VAL ₹{info['val']:.2f}",
                "rightSource": "BUY VOL CONFIRMS",
            },
            "2": {
                "tabLabel": "DEMA 20 RECLAIMED",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC SUPPORT",
                "headline": f"RALLY RECLAIMS 20 DEMA (₹{info['d20']:.2f}) · FLIPPED TO SUPPORT",
                "rightSource": "OI EXPANSION",
            },
            "3": {
                "tabLabel": f"{info['hurdle_name']} HURDLE",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "INFLECTION THRESHOLD",
                "headline": f"CMP ₹{info['cmp']:.2f} TESTS {info['hurdle_name']} (₹{info['d50']:.2f}) · BREAKOUT OR REJECTION",
                "rightSource": "KEY DECISION POINT",
            },
            "4": {
                "tabLabel": "VAH EXPANSION",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"CLEARING HURDLE UNLOCKS VALUE AREA HIGH ₹{info['vah']:.2f}",
                "rightSource": f"TARGET ₹{info['vah']:.2f}",
            },
            "5": {
                "tabLabel": "MACRO REVERSAL",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "100 & 200 DEMA",
                "headline": f"EXTENDED TARGETS: 100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f}",
                "rightSource": "TREND REVERSAL",
            },
        },
        "watermark_words": {
            "0": "UNIVERSAL LAW",
            "1": "ABSORPTION FLOOR",
            "2": "RECLAIMED SUPPORT",
            "3": "INFLECTION HURDLE",
            "4": "TARGET CORRIDOR",
            "5": "MACRO REVERSAL",
        },
    }

    manifest_path = PUBLIC_DATA / f"{sym}_explainer_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as fm:
        json.dump(manifest_data, fm, indent=2)

    # Mirror copy in root workspace
    workspace_manifest = WORKSPACE / f"{sym}_explainer_manifest.json"
    shutil.copy2(manifest_path, workspace_manifest)

    print(f"\n[SUCCESS] Generated Explainer Suite for {info['symbol']}:")
    print(f"  Audio:    {final_master_mp3}")
    print(f"  Manifest: {manifest_path}")
    print(f"  Subtitles:{srt_path}")
    print(f"  Total Duration: {total_dur_sec}s ({total_frames} frames @ 30fps)")

    return manifest_data


def load_all_image_stocks(market_data_file: Path) -> list:
    with open(market_data_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    found_stocks = []
    seen_symbols = set()

    # 1. Check deep_dive_stocks
    deep_dive = data.get("deep_dive_stocks", {})
    if isinstance(deep_dive, dict):
        for k, v in deep_dive.items():
            sym = v.get("symbol", "").upper()
            if sym and sym not in seen_symbols and v.get("image"):
                found_stocks.append(v)
                seen_symbols.add(sym)

    # 2. Check top_gainers, top_losers, momentum_stocks
    for category in ["top_gainers", "momentum_stocks", "top_losers"]:
        items = data.get(category, [])
        for item in items:
            sym = item.get("symbol", "").upper()
            if sym and sym not in seen_symbols and item.get("image"):
                found_stocks.append(item)
                seen_symbols.add(sym)

    return found_stocks


async def main_async():
    parser = argparse.ArgumentParser(description="Universal Stock Explainer Audio & Manifest Generator")
    parser.add_argument("--symbol", type=str, default="", help="Stock symbol to generate explainer audio for (e.g. COALINDIA)")
    parser.add_argument("--all-images", action="store_true", help="Process ALL stocks in market data having an image attached")
    parser.add_argument("--market-data", type=str, default="", help="Path to market data JSON file")
    parser.add_argument("--voice", type=str, default=DEFAULT_VOICE, help="TTS voice")
    args = parser.parse_args()

    # Find market data
    if args.market_data and Path(args.market_data).exists():
        market_file = Path(args.market_data)
    else:
        candidates = [
            SKILL_DIR / "sample_market_data.json",
            WORKSPACE / "sample_market_data.json",
            PUBLIC_DATA / "dema_market_data_20261113.json",
            PUBLIC_DATA / "dema_market_data.json",
        ]
        market_file = next((c for c in candidates if c.exists()), None)

    if not market_file:
        print("[ERROR] No market data file found.")
        sys.exit(1)

    all_image_stocks = load_all_image_stocks(market_file)
    print(f"Loaded {len(all_image_stocks)} stocks with attached technical images from {market_file.name}:")
    for s in all_image_stocks:
        print(f"  - {s.get('symbol')}: {s.get('image')}")

    if args.all_images:
        for s in all_image_stocks:
            await process_single_stock(s, voice=args.voice)
    elif args.symbol:
        sym_req = args.symbol.upper()
        match = next((s for s in all_image_stocks if s.get("symbol", "").upper() == sym_req), None)
        if not match:
            # Create minimal stock payload with attached chart image
            chart_img = f"charts/{sym_req}_1D_chart.png"
            match = {
                "symbol": sym_req,
                "name": sym_req,
                "ltp": 1000.0,
                "image": chart_img,
            }
            print(f"[NOTE] Symbol {sym_req} not found in market data, generated default payload with {chart_img}")
        await process_single_stock(match, voice=args.voice)
    else:
        print("\nPlease specify either --symbol <SYM> or --all-images.")
        print("Example: python build_stock_explainer_audio.py --symbol COALINDIA")


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
