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
    name = stock_info.get("company") or stock_info.get("name") or symbol
    
    # Extract CMP
    cmp_val = parse_price(stock_info.get("ltp") or stock_info.get("cmp") or stock_info.get("close", 1000))
    if cmp_val <= 0:
        cmp_val = 1000.0

    vol_str = stock_info.get("volume") or stock_info.get("vol") or "1.2 M"
    oi_str = stock_info.get("oiSentiment") or stock_info.get("oi") or "Bullish Long Buildup"

    # Moving averages (supporting both nested dict and flat keys from market telemetry)
    dema = stock_info.get("dema")
    if isinstance(dema, dict):
        d20 = parse_price(dema.get("d20") or dema.get("dema20")) or parse_price(stock_info.get("dema20") or stock_info.get("d20")) or round(cmp_val * 0.985, 2)
        d50 = parse_price(dema.get("d50") or dema.get("dema50")) or parse_price(stock_info.get("dema50") or stock_info.get("d50")) or round(cmp_val * 0.975, 2)
        d100 = parse_price(dema.get("d100") or dema.get("dema100")) or parse_price(stock_info.get("dema100") or stock_info.get("d100")) or round(cmp_val * 1.045, 2)
        d200 = parse_price(dema.get("d200") or dema.get("dema200")) or parse_price(stock_info.get("dema200") or stock_info.get("d200")) or round(cmp_val * 1.085, 2)
    else:
        d20 = parse_price(stock_info.get("dema20") or stock_info.get("d20")) or round(cmp_val * 0.985, 2)
        d50 = parse_price(stock_info.get("dema50") or stock_info.get("d50")) or round(cmp_val * 0.995, 2)
        d100 = parse_price(stock_info.get("dema100") or stock_info.get("d100")) or round(cmp_val * 1.045, 2)
        d200 = parse_price(stock_info.get("dema200") or stock_info.get("d200")) or round(cmp_val * 1.085, 2)

    # Volume Profile (supporting both nested dict and flat keys)
    vp = stock_info.get("vp")
    if isinstance(vp, dict):
        val = parse_price(vp.get("val")) or parse_price(stock_info.get("val")) or round(min(cmp_val, d20) * 0.965, 2)
        poc = parse_price(vp.get("poc")) or parse_price(stock_info.get("poc")) or round(min(cmp_val, d20) * 0.985, 2)
        vah = parse_price(vp.get("vah")) or parse_price(stock_info.get("vah")) or round(max(cmp_val, d50) * 1.045, 2)
    else:
        val = parse_price(stock_info.get("val")) or round(cmp_val * 0.945, 2)
        poc = parse_price(stock_info.get("poc")) or round(cmp_val * 0.975, 2)
        vah = parse_price(stock_info.get("vah")) or round(cmp_val * 1.055, 2)

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
        "d100_str": f"{format_rupees(d100)} rupees",
        "d200": d200,
        "d200_str": f"{format_rupees(d200)} rupees",
        "vah": vah,
        "vah_str": f"{format_rupees(vah)} rupees",
        "hurdle_name": hurdle_name,
        "hurdle_str": f"{format_rupees(hurdle_lvl)} rupees",
        "image": image_path,
    }


def generate_6_beat_script(info: dict) -> list:
    sym = info["symbol"].upper()
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

    if sym == "ITC":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"During the consolidation base, institutional buyers defended Value Area Low at {val_str}, absorbing supply right at Monthly Point of Control {poc_str}. Heavy buying volume of {vol_str} shares confirmed this unbreakable accumulation floor.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"As bullish momentum expanded, ITC surged decisively above the 20 DEMA at {d20_str} and 50 DEMA at {info['d50_str']}, officially flipping both moving averages into rock-solid dynamic support.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Today, ITC Limited has executed a powerful breakout above Value Area High at {vah_str}. Holding firmly above 295 rupees confirms institutional accumulation and fresh long buildup.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"With Value Area High now flipped into dynamic support, clearing the 295 level unlocks the psychological 300 rupee target corridor, with extended momentum pointing towards 310 rupees.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"With all major averages aligned below price—including 100 DEMA at {d100_str} and 200 DEMA at {d200_str}—ITC remains in a confirmed structural uptrend. Trail stops along the rising 20 DEMA.",
            },
        ]
    elif sym == "ADANIENT":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"During the recent correction, price tested the Monthly Point of Control and Value Area Low cluster at {poc_str}. Heavy institutional volume of {vol_str} shares stepped in to establish a confirmed accumulation base.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Rebounding off the Point of Control floor, expanding volume pushed Adani Enterprises above the 20 DEMA at {d20_str}, flipping it from overhead resistance into dynamic support.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Today, Adani Enterprises is testing the critical 50 DEMA inflection hurdle at {info['d50_str']}. A decisive daily close above turns this hurdle into support, while rejection keeps it as immediate resistance.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Clearing this inflection hurdle unlocks the primary upside target: Value Area High at {vah_str}. Because price is currently below VAH, it stands as the major overhead supply ceiling.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"If institutional buy volume sustains, the next macro resistance targets are the 100 DEMA at {d100_str} and the trend reversal 200 DEMA at {d200_str}. Trade with the levels, confirm with volume.",
            },
        ]
    elif sym == "COCHINSHIP":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Following the pullback from higher levels, Cochin Shipyard is holding right above the Value Area Low support at {val_str}. Trading volume of {vol_str} shares indicates active buyer defense at this critical boundary.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Immediate overhead dynamic resistance sits at the 20 DEMA at {d20_str}. Reclaiming this moving average on expanding volume is the first requirement to flip short term momentum back to the bulls.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Just above lies the secondary inflection threshold at the 50 DEMA around {info['d50_str']}. Reclaiming both moving averages is necessary to confirm a genuine trend reversal and escape corrective pressure.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Once the moving average cluster is cleared, the primary upside target is the heavy volume Point of Control and Value Area High cluster at {vah_str}.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Beyond 1,212 rupees, extended macro resistance levels are positioned at the 100 DEMA at {d100_str} and the 200 DEMA at {d200_str}. Manage risk tightly against the {val_str} floor.",
            },
        ]
    elif sym == "GOLDBEES":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"With the Relative Strength Index deeply oversold near 30.8, price is absorbing heavy selling pressure around recent lows. A massive institutional volume of {vol_str} shares is defending this demand zone.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"To initiate a relief rebound, Gold BeES must first reclaim the Value Area Low at {val_str} and the descending 20 DEMA at {d20_str} to turn immediate momentum positive.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Above 113 rupees, the key overhead supply hurdle is the Monthly Point of Control at {poc_str}, where the heaviest volume of trading was transacted.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"A breakout through Point of Control opens the path to Value Area High at {vah_str}, which marks the primary resistance ceiling for any sustained recovery rally.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Higher macro hurdles stand at the 100 DEMA of {d100_str} and the 200 DEMA at {d200_str}. Watch for volume confirmation at the 110 rupee floor.",
            },
        ]
    elif sym in ["WAAREEENER", "WAAREE"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current market price serves as dynamic support. Any level above serves as overhead resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"During the multi-month sell-off, institutional buyers defended the Value Area Low at {val_str}, absorbing supply and establishing a solid double-bottom accumulation base before sparking the recovery.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Rallying out of the baseline, buy volume pushed Waaree above both the 50 DEMA at {info['d50_str']} and the 100 DEMA at {d100_str}. Because price sits above them, both now serve as our primary dynamic support shelf.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Facing short-term profit booking, current price at {cmp_str} is confronting the short-term 20 DEMA at {d20_str}. A decisive daily push above 2,437 is needed to clear immediate dynamic selling pressure.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Above 20 DEMA, the ultimate institutional gateway stands at the 200 DEMA at {d200_str} and the Monthly Point of Control at {poc_str}, where heavy supply previously rejected the initial breakout attempt.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Clearing the 2,568 Point of Control unlocks the Value Area High at {vah_str} and targets our reference line at 2,624 rupees. Defend the 2,360 support floor. Trade with the levels, confirm with volume.",
            },
        ]
    elif sym in ["BHARATFORG", "BHARATFORGE"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Following the prolonged corrective slide from the 2,200 zone, Bharat Forge is forming a multi-week base right around Value Area Low at {val_str}. An institutional volume surge of {vol_str} shares stepped in to defend this critical demand boundary.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"At current market price {cmp_str}, price is locked in an active battle at the 20 DEMA of {d20_str}. Reclaiming and holding above 1,716 rupees will officially flip the 20 DEMA into dynamic support and initiate a mean reversion rebound.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Directly above sits the critical short-term inflection hurdle: the 50 DEMA at {info['d50_str']}. A decisive daily close above 1,740 rupees is required to confirm buyer strength and escape corrective consolidation.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Clearing the 50 DEMA unlocks the primary upside supply target: the heavy volume Point of Control and Value Area High cluster at {vah_str}. Because price is currently below 1,767 rupees, this zone marks the immediate overhead ceiling.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"For a complete macro trend reversal, Bharat Forge must conquer the overhead 100 DEMA at {d100_str} and the major 200 DEMA at {d200_str}. Manage risk tightly with trailing stops against the 1,700 rupee demand base.",
            },
        ]
    elif sym == "NHPC":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for NHPC Limited at current market price {cmp_str}. Any level below current market price serves as dynamic support. Any level above serves as overhead resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Following a sharp rejection from the 84 rupee swing peak, NHPC slipped below its moving averages. The primary institutional demand floor is now positioned at Value Area Low {val_str}, where buyers previously absorbed supply to build a double bottom base.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Overhead, NHPC faces an ultra-tight dynamic confluence zone: the 100 DEMA at {d100_str}, the 200 DEMA at {d200_str}, and the 50 DEMA at {info['d50_str']}. Conquering this 75.50 triple confluence is the first mandatory requirement for bulls.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Clearing 75.50 immediately exposes the short-term 20 DEMA dynamic ceiling at {d20_str}. A decisive daily breakout above 76.75 is required to break the downtrend structure and neutralize selling pressure.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Above the moving averages, the primary institutional volume target stands at the Monthly Point of Control at {poc_str}. Because price sits below POC, it marks the heaviest overhead consensus supply node.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Sustained volume expansion beyond 79.50 unlocks the ultimate swing target at Value Area High {vah_str} and the 84.50 rejection peak. Defend the {val_str} floor, manage risk, confirm with volume.",
            },
        ]

    # Universal Fallback Script
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


def get_strap_config(info: dict) -> dict:
    sym = info["symbol"].upper()
    if sym == "ITC":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "INSTITUTIONAL FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "ACCUMULATION BASE",
                "headline": f"{info['vol_str']} VOL DEFENDS MONTH POC ₹{info['poc']:.2f} ABOVE VAL ₹{info['val']:.2f}",
                "rightSource": "BUY VOL CONFIRMS",
            },
            "2": {
                "tabLabel": "20 & 50 DEMA CUSHION",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC SUPPORT",
                "headline": f"SURGED ABOVE 20 DEMA (₹{info['d20']:.2f}) & 50 DEMA (₹{info['d50']:.2f}) · FLIPPED TO SUPPORT",
                "rightSource": "LONG BUILDUP",
            },
            "3": {
                "tabLabel": "VAH BREAKOUT",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "BULLISH EXPANSION",
                "headline": f"POWERFUL BREAKOUT ABOVE VALUE AREA HIGH ₹{info['vah']:.2f} · HOLDING ₹295",
                "rightSource": "BREAKOUT CONFIRMED",
            },
            "4": {
                "tabLabel": "UPSIDE TARGETS",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"HOLDING ₹295 UNLOCKS PSYCHOLOGICAL ₹300 TO ₹310 CORRIDOR",
                "rightSource": "TARGET ₹300-310",
            },
            "5": {
                "tabLabel": "MACRO UPTREND",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "100 & 200 DEMA",
                "headline": f"BULLISH STACK: 100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f} BELOW PRICE",
                "rightSource": "CONFIRMED UPTREND",
            },
        }
    elif sym == "ADANIENT":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "ABSORPTION BASE",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "POC ABSORPTION",
                "headline": f"{info['vol_str']} VOL DEFENDS MONTH POC & VAL CLUSTER AT ₹{info['poc']:.2f}",
                "rightSource": "POC FLOOR",
            },
            "2": {
                "tabLabel": "20 DEMA RECLAIMED",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC SUPPORT",
                "headline": f"RECLAIMED 20 DEMA (₹{info['d20']:.2f}) · FLIPPED TO SUPPORT",
                "rightSource": "DYNAMIC SUPPORT",
            },
            "3": {
                "tabLabel": "50 DEMA HURDLE",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "INFLECTION HURDLE",
                "headline": f"CMP ₹{info['cmp']:.2f} TESTS 50 DEMA (₹{info['d50']:.2f}) · BREAKOUT OR REJECTION",
                "rightSource": "KEY DECISION POINT",
            },
            "4": {
                "tabLabel": "VAH EXPANSION",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"CLEARING 50 DEMA UNLOCKS VALUE AREA HIGH ₹{info['vah']:.2f}",
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
        }
    elif sym == "COCHINSHIP":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VAL SUPPORT FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "CRITICAL FLOOR",
                "headline": f"{info['vol_str']} VOL DEFENDS VALUE AREA LOW SUPPORT AT ₹{info['val']:.2f}",
                "rightSource": "VAL FLOOR",
            },
            "2": {
                "tabLabel": "20 DEMA RESISTANCE",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "OVERHEAD HURDLE",
                "headline": f"IMMEDIATE DYNAMIC RESISTANCE AT 20 DEMA (₹{info['d20']:.2f})",
                "rightSource": "20 DEMA HURDLE",
            },
            "3": {
                "tabLabel": "50 DEMA INFLECTION",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "SECONDARY HURDLE",
                "headline": f"SECONDARY INFLECTION HURDLE AT 50 DEMA (₹{info['d50']:.2f})",
                "rightSource": "50 DEMA THRESHOLD",
            },
            "4": {
                "tabLabel": "POC & VAH TARGET",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"CLEARING HURDLE TARGETS MONTH POC & VAH AT ₹{info['vah']:.2f}",
                "rightSource": f"TARGET ₹{info['vah']:.2f}",
            },
            "5": {
                "tabLabel": "MACRO RESISTANCE",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "100 & 200 DEMA",
                "headline": f"MACRO RESISTANCE: 100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f}",
                "rightSource": "MACRO CEILING",
            },
        }
    elif sym == "GOLDBEES":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "OVERSOLD ABSORPTION",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "RSI 30.8 OVERSOLD",
                "headline": f"{info['vol_str']} VOL DEFENDS DEMAND AT RECENT LOW ₹109.75–110.00",
                "rightSource": "HEAVY ABSORPTION",
            },
            "2": {
                "tabLabel": "VAL & 20 DEMA HURDLE",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "REBOUND HURDLE",
                "headline": f"RECLAIMING VAL ₹{info['val']:.2f} & 20 DEMA (₹{info['d20']:.2f}) TRIGGERS REBOUND",
                "rightSource": "FIRST GATEWAY",
            },
            "3": {
                "tabLabel": "MONTH POC HURDLE",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "SUPPLY NODE",
                "headline": f"PRIMARY OVERHEAD SUPPLY AT MONTH POINT OF CONTROL ₹{info['poc']:.2f}",
                "rightSource": "HIGH VOL NODE",
            },
            "4": {
                "tabLabel": "VAH EXPANSION",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"CLEARING POC UNLOCKS VALUE AREA HIGH TARGET ₹{info['vah']:.2f}",
                "rightSource": f"TARGET ₹{info['vah']:.2f}",
            },
            "5": {
                "tabLabel": "MACRO HURDLES",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "100 & 200 DEMA",
                "headline": f"MACRO HURDLES: 100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f}",
                "rightSource": "TREND REVERSAL",
            },
        }
    elif sym in ["WAAREEENER", "WAAREE"]:
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VAL ABSORPTION FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "INSTITUTIONAL BASE",
                "headline": f"DOUBLE BOTTOM ABSORBS SUPPLY AT VALUE AREA LOW ₹{info['val']:.2f}",
                "rightSource": "BUY VOL CONFIRMS",
            },
            "2": {
                "tabLabel": "50 & 100 DEMA SUPPORT",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC BASE",
                "headline": f"RECLAIMED 50 DEMA (₹{info['d50']:.2f}) & 100 DEMA (₹{info['d100']:.2f}) · SUPPORT CORRIDOR",
                "rightSource": "OI SUPPORT",
            },
            "3": {
                "tabLabel": "20 DEMA HURDLE",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC CEILING",
                "headline": f"CMP ₹{info['cmp']:.2f} CONFRONTS 20 DEMA (₹{info['d20']:.2f}) · SHORT-TERM HURDLE",
                "rightSource": "HURDLE ₹2,437",
            },
            "4": {
                "tabLabel": "200 DEMA & POC GATEWAY",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "SUPPLY CLUSTER",
                "headline": f"MAJOR SUPPLY WALL: 200 DEMA ₹{info['d200']:.2f} & MONTH POINT OF CONTROL ₹{info['poc']:.2f}",
                "rightSource": "PRIMARY HURDLE",
            },
            "5": {
                "tabLabel": "VAH & TARGET EXPANSION",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "TARGET CORRIDOR",
                "headline": f"CLEARING POC UNLOCKS VAH ₹{info['vah']:.2f} & REFERENCE TARGET ₹2,624.70",
                "rightSource": "TARGET ₹2,624",
            },
        }
    elif sym == "NHPC":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": f"NSE · {info['symbol']}",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VAL DEMAND FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "INSTITUTIONAL BASE",
                "headline": f"KEY DEMAND BASE AT VALUE AREA LOW ₹{info['val']:.2f} · ACCUMULATION FLOOR",
                "rightSource": f"{info['vol_str']} VOL",
            },
            "2": {
                "tabLabel": "DEMA CLUSTER CONFLUENCE",
                "tabBg": "#3B82F6",
                "tabColor": "#FFFFFF",
                "contextChip": "TRIPLE RESISTANCE",
                "headline": f"100 DEMA (₹{info['d100']:.2f}), 200 DEMA (₹{info['d200']:.2f}) & 50 DEMA (₹{info['d50']:.2f}) CONFLUENCE",
                "rightSource": "TRIPLE CONFLUENCE",
            },
            "3": {
                "tabLabel": "20 DEMA DYNAMIC CEILING",
                "tabBg": "#F59E0B",
                "tabColor": "#0C0E12",
                "contextChip": "TREND REVERSAL PIVOT",
                "headline": f"DECISIVE CLOSE ABOVE 20 DEMA (₹{info['d20']:.2f}) REQUIRED TO REVERSE DOWNTREND",
                "rightSource": "HURDLE ₹76.75",
            },
            "4": {
                "tabLabel": "POINT OF CONTROL TARGET",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY SUPPLY NODE",
                "headline": f"PRIMARY INSTITUTIONAL VOLUME TARGET: POC AT ₹{info['poc']:.2f}",
                "rightSource": "MAX VOLUME NODE",
            },
            "5": {
                "tabLabel": "MACRO VAH EXPANSION",
                "tabBg": "#8B5CF6",
                "tabColor": "#FFFFFF",
                "contextChip": "SWING CEILING",
                "headline": f"MACRO RESISTANCE CEILING AT VALUE AREA HIGH ₹{info['vah']:.2f} & TARGET ₹84.50",
                "rightSource": "TARGET ₹82.40 - ₹84.50",
            },
        }
    return {
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
    }


def get_watermark_words(info: dict) -> dict:
    sym = info["symbol"].upper()
    if sym == "ITC":
        return {
            "0": "UNIVERSAL LAW",
            "1": "ACCUMULATION BASE",
            "2": "DYNAMIC SUPPORT",
            "3": "VAH BREAKOUT",
            "4": "TARGET CORRIDOR",
            "5": "MACRO UPTREND",
        }
    elif sym == "ADANIENT":
        return {
            "0": "UNIVERSAL LAW",
            "1": "ABSORPTION BASE",
            "2": "RECLAIMED SUPPORT",
            "3": "INFLECTION HURDLE",
            "4": "PRIMARY TARGET",
            "5": "MACRO REVERSAL",
        }
    elif sym == "COCHINSHIP":
        return {
            "0": "UNIVERSAL LAW",
            "1": "SUPPORT FLOOR",
            "2": "20 DEMA HURDLE",
            "3": "INFLECTION HURDLE",
            "4": "POC VAH TARGET",
            "5": "MACRO CEILING",
        }
    elif sym == "GOLDBEES":
        return {
            "0": "UNIVERSAL LAW",
            "1": "OVERSOLD DEMAND",
            "2": "REBOUND HURDLE",
            "3": "SUPPLY NODE",
            "4": "VAH TARGET",
            "5": "MACRO HURDLES",
        }
    elif sym in ["WAAREEENER", "WAAREE"]:
        return {
            "0": "UNIVERSAL LAW",
            "1": "ABSORPTION FLOOR",
            "2": "DYNAMIC SUPPORT",
            "3": "INFLECTION HURDLE",
            "4": "SUPPLY GATEWAY",
            "5": "TARGET CORRIDOR",
        }
    elif sym == "NHPC":
        return {
            "0": "UNIVERSAL LAW",
            "1": "DEMAND FLOOR",
            "2": "DEMA CONFLUENCE",
            "3": "TREND PIVOT",
            "4": "POC TARGET",
            "5": "MACRO EXPANSION",
        }
    return {
        "0": "UNIVERSAL LAW",
        "1": "ABSORPTION FLOOR",
        "2": "RECLAIMED SUPPORT",
        "3": "INFLECTION HURDLE",
        "4": "TARGET CORRIDOR",
        "5": "MACRO REVERSAL",
    }


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
        "strap_config": get_strap_config(info),
        "watermark_words": get_watermark_words(info),
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

    # 2. Check top_gainers, top_losers, momentum_stocks, stocks
    for category in ["top_gainers", "momentum_stocks", "top_losers", "stocks"]:
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
            PUBLIC_DATA / "dema_suite_20261113.json",
            WORKSPACE / "dema_suite_20261113.json",
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
