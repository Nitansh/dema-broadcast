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
DEFAULT_VOICE = "hi-IN-SwaraNeural"

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
        "cmp_str": f"{format_rupees(cmp_val)} रुपये",
        "vol_str": vol_str,
        "oi_str": oi_str,
        "val": val,
        "val_str": f"{format_rupees(val)} रुपये",
        "poc": poc,
        "poc_str": f"{format_rupees(poc)} रुपये",
        "d20": d20,
        "d20_str": f"{format_rupees(d20)} रुपये",
        "d50": d50,
        "d50_str": f"{format_rupees(d50)} रुपये",
        "d100": d100,
        "d100_str": f"{format_rupees(d100)} रुपये",
        "d200": d200,
        "d200_str": f"{format_rupees(d200)} रुपये",
        "vah": vah,
        "vah_str": f"{format_rupees(vah)} रुपये",
        "hurdle_name": hurdle_name,
        "hurdle_str": f"{format_rupees(hurdle_lvl)} रुपये",
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
                "text": f"Once the moving average cluster is cleared, the primary upside target is the heavy volume Point of Control at {poc_str}, followed by Value Area High at {vah_str}.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Beyond Value Area High, extended macro resistance levels are positioned at the 100 DEMA at {d100_str} and the trend reversal 200 DEMA at {d200_str}. Manage risk tightly against the {val_str} floor.",
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
    elif sym in ["HINDUNILVR", "HUL", "HINDUSTANUNILEVER"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current market price serves as dynamic support. Any level above serves as overhead resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"During the previous corrective phase, institutional buyers defended Value Area Low at {val_str}, sparking a powerful accumulation rally straight through Monthly Point of Control at {poc_str}. Heavy accumulation volume of {vol_str} shares confirmed this unbreakable accumulation base.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Expanding bullish momentum pushed Hindustan Unilever decisively above the 20 DEMA at {d20_str}. With the stock surging over 2.5 percent to close at {cmp_str}, the 20 DEMA has officially flipped into rock-solid dynamic support.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Providing strong structural cushion below, the 200 DEMA stands at {d200_str}, the 50 DEMA at {info['d50_str']}, and 100 DEMA at {d100_str}. With all major moving averages stacked firmly below price, the medium term uptrend structure is fully confirmed.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Directly overhead, the primary upside resistance target is the institutional Buy Price supply zone at {vah_str}. Because price is trading just 3.5 percent below this ceiling, a continuation push unlocks the path towards 2,118 rupees.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"With the Relative Strength Index at 69.5 and open interest sentiment standing at 85 percent bullish, buyers maintain aggressive control. Trail risk tightly along the rising {d20_str} support. Trade with the levels, confirm with volume.",
            },
        ]
    elif sym in ["MARUTI", "MARUTISUZUKI"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current market price serves as dynamic support. Any level above serves as overhead resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Tracing the macro structure, Maruti formed an extensive accumulation base anchored at Value Area Low {val_str}. Buyers absorbed heavy supply right at the Monthly Point of Control at {poc_str}, creating the launchpad for today's explosive breakout.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"In today's historic session, massive institutional buying ignited a 792 rupee expansion, surging over 6.2 percent to close at {cmp_str}. This expansion blew decisively past the 20 DEMA at {d20_str}, turning it into rock-solid dynamic support.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Crucially, today's rally punched straight through Value Area High at {vah_str} with 909,000 shares traded. Because price closed decisively above Value Area High, this former resistance ceiling has now flipped into a major support zone.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Providing deep structural cushion below, the 200 DEMA stands at {d200_str}, the 50 DEMA at {info['d50_str']}, and 100 DEMA at {d100_str}. With all four major moving averages stacked below price, the broader trend is firmly bullish.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"With Value Area High cleared and bears trapped, Maruti opens the path toward the psychological 13,800 to 14,000 rupee target corridor. Maintain trailing stops along the rising {vah_str} support floor. Trade with the levels, confirm with volume.",
            },
        ]
    elif sym in ["LENSKART", "LENSKARTSOLUTIONS"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current market price serves as dynamic support. Any level above serves as overhead resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Tracing the market structure, Lenskart established an extensive demand floor anchored at Value Area Low {val_str}. Institutional buyers absorbed heavy supply right at the Monthly Point of Control at {poc_str}, creating a powerful accumulation base.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Surging off the Point of Control launchpad with 3.77 million shares traded, expanding bullish momentum pushed Lenskart decisively above the 20 DEMA at {d20_str}, officially flipping it into immediate dynamic support.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Crucially, today's rally punched straight through Value Area High at {vah_str} to close at {cmp_str}. Because price closed decisively above Value Area High, this former supply ceiling has now flipped into a major support buffer.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Providing deep structural cushion below, the 50 DEMA stands at {info['d50_str']}, the 100 DEMA at {d100_str}, and the 200 DEMA at {d200_str}. With all major moving averages stacked firmly below price, the trend structure is decisively bullish.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"With open interest sentiment standing at 85 percent bullish, Lenskart opens upside target pathways toward 760 and the 780 rupee swing corridor. Maintain trailing stops along the rising {d20_str} 20 DEMA support floor. Trade with the levels, confirm with volume.",
            },
        ]
    elif sym in ["GESHIP", "GREAT_EASTERN", "GREATEASTERN"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Here is the golden trading rule for {name} at current market price {cmp_str}. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"The Great Eastern Shipping Company exhibits confirmed structural strength, holding firmly above its key volume profile nodes. Trading volume of {vol_str} shares is defending the massive Point of Control support shelf at {poc_str}.",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Immediate dynamic support is anchored by the 20 DEMA at {d20_str}, tightly confluent with the 50 DEMA at {info['d50_str']}. As long as GESHIP trades above this moving average cluster, short-term momentum favors the bulls.",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Just below, institutional defense is reinforced by the dual 100 DEMA at {d100_str} and 200 DEMA at {d200_str}. This establishes a rock-solid dual support cushion between 1,511 and 1,527 rupees.",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Overhead, the immediate upside hurdle is Value Area High at {vah_str}. A decisive daily breakout above 1,555 rupees clears the local supply zone and targets extended swing highs toward 1,600 and 1,620 rupees.",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"With price sustaining above all four major moving averages, the structural trend remains bullish with 85 percent long buildup sentiment. Manage risk against the {poc_str} Point of Control floor. Trade with the levels, confirm with volume.",
            },
        ]
    elif sym in ["LICI", "LIC"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Life Insurance Corporation of India यानी LIC के लिए golden trading rule समझिए। Current market price {cmp_str} के नीचे के सभी लेवल्स dynamic support बन जाते हैं, और ऊपर के लेवल्स overhead resistance और upside targets।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"निचले consolidation base पर Monthly Point of Control {poc_str} और Value Area Low {val_str} पर institutional buyers ने solid accumulation दिखाई। {vol_str} शेयर्स के heavy volume ने इस demand zone को मजबूत floor confirm कर दिया।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"मोमेंटम बढ़ते ही LIC ने 20 DEMA को {d20_str} पर decisively reclaim कर लिया। अब यह 20 DEMA overhead resistance से flip होकर पहला strong dynamic support बन चुका है।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"आज LIC ने Value Area High यानी {vah_str} के ऊपर solid breakout दिया है। {vah_str} के ऊपर sustain करना institutional long buildup को confirm करता है।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Value Area High अब dynamic support बन चुका है। इसके ऊपर टिकने से 414 रुपये का session high और उसके बाद 420 से 425 रुपये का primary target corridor open हो जाता है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"चार्ट पर सभी major averages—50 DEMA {info['d50_str']}, 100 DEMA {d100_str}, और 200 DEMA {d200_str}—price के नीचे perfectly aligned हैं। ट्रेंड bullish है, 20 DEMA के साथ trailing stop maintain करें।",
            },
        ]
    elif sym in ["SILVERBEES", "SILVER"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Nippon India Silver ETF यानी SilverBees के लिए golden trading rule समझिए। Current market price {cmp_str} के नीचे के सभी लेवल्स dynamic support बन जाते हैं, और ऊपर के सभी लेवल्स overhead resistance और upside relief targets।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"हालिया sharp selloff के बाद price Value Area Low यानी {val_str} के demand zone पर support ले रहा है। {vol_str} शेयर्स के massive volume ने {val_str} को crucial invalidation support floor बना दिया है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"पहला upside relief target 20 DEMA है जो {d20_str} पर स्थित है। Price {cmp_str} के ऊपर rebound करते ही {d20_str} का 20 DEMA पहला immediate overhead hurdle और short-term target 1 रहेगा।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"20 DEMA reclaim होते ही अगला major inflection hurdle 50 DEMA है {info['d50_str']} पर। {info['d50_str']} के ऊपर daily close corrective pressure को neutralize करके fresh buying momentum trigger करेगा।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"चार्ट पर सबसे heavy volume node Monthly Point of Control {poc_str} और Value Area High {vah_str} पर है। यह cluster 176 से 182 रुपये का primary target corridor और major supply ceiling define करता है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Macro recovery के लिए 100 DEMA {d100_str} और 200 DEMA {d200_str} को cross करना जरूरी है, जहां institutional Buy Price 216.78 रुपये mark है। {val_str} के floor पर strict risk manage करें।",
            },
        ]
    elif sym in ["LTIM", "MINDTREE", "LTIMINDTREE"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"LTIMindtree यानी Mindtree के लिए golden trading rule समझिए। Current market price 4,166 रुपये 40 पैसे के नीचे के सभी लेवल्स dynamic support बन जाते हैं, और ऊपर के लेवल्स overhead resistance और upside targets।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"चार्ट पर consolidation base के दौरान 100 DEMA 4,117 रुपये और Value Area Low 4,106 रुपये पर institutional demand confirm हुई है। 833K शेयर्स के steady volume ने 200 DEMA 4,057 रुपये के ऊपर strong accumulation floor बना दिया है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Price 4,166 रुपये पर trade करते हुए immediate overhead resistance 50 DEMA 4,175 रुपये और 20 DEMA 4,180 रुपये को test कर रहा है। 4,180 के ऊपर daily close इन दोनों averages को active support में flip कर देगा।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"20 DEMA reclaim होते ही पहला primary upside target आज का high यानी 4,292 रुपये रहेगा। यह breakout short covering rally को trigger करके fresh long buildup initiate करेगा।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Secondary expansion corridor में Monthly Point of Control 4,398 रुपये और Value Area High 4,431 रुपये पर स्थित हैं। यह cluster stock का major institutional target zone और decisive supply ceiling है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Macro perspective से 100 DEMA 4,117 रुपये और 200 DEMA 4,057 रुपये structural uptrend को protect कर रहे हैं। Value Area Low 4,106 रुपये के नीचे strict risk maintain करते हुए 4,400 target corridor के लिए trade plan करें।",
            },
        ]
    elif sym in ["SAGILITY", "SAGILITYINDIA"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Sagility India के लिए golden trading rule समझिए। Current market price 45 रुपये 25 पैसे के नीचे के सभी लेवल्स dynamic support बन जाते हैं, और ऊपर के लेवल्स overhead resistance और upside targets।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"चार्ट पर consolidation base के दौरान Value Area Low 40 रुपये 25 पैसे पर institutional demand confirm हुई है। Smart money ने Monthly Point of Control 42 रुपये 19 पैसे पर heavy floating supply absorb करके strong accumulation floor बना दिया है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Fresh breakout momentum के साथ Sagility ने 20 DEMA और 50 DEMA के golden convergence 44 रुपये 50 पैसे को decisively reclaim कर लिया है। यह cluster अब immediate overhead resistance से rock-solid dynamic support में flip हो चुका है।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"आज के session में Sagility India ने Value Area High 45 रुपये 25 पैसे पर explosive breakout execute किया है। 45.25 के ऊपर decisive daily close bears को trap करके aggressive short covering rally ignite कर रहा है।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Value Area High clear होते ही upward technical highway खुल जाता है, जहां पहला upside target swing high 47 रुपये रहेगा। Secondary expansion corridor 48 रुपये 50 पैसे से 50 रुपये के psychological milestone की तरफ point कर रहा है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Broader trend को 100 DEMA 44 रुपये 15 पैसे और 200 DEMA 43 रुपये 85 पैसे support provide कर रहे हैं। 43 रुपये 85 पैसे के floor पर strict risk manage करते हुए 47 से 50 रुपये target corridor के लिए trade plan करें।",
            },
        ]
    elif sym in ["UGROCAP", "UGROCAPITAL"]:
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Ugro Capital के लिए golden trading rule समझिए। Current market price 81 रुपये 10 पैसे के नीचे के सभी लेवल्स dynamic support बन जाते हैं, और ऊपर के लेवल्स overhead resistance और upside targets।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"आज के session में 683 करोड़ रुपये के भारी institutional turnover के साथ buyers ने Value Area Low और Monthly Point of Control 80 रुपये 72 पैसे को firmly defend किया है। Smart money ने 8 करोड़ shares absorb करके rock-solid accumulation floor बना दिया है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Recent price surge के साथ Ugro Capital ने 20 DEMA 72 रुपये 89 पैसे और 200 DEMA 72 रुपये 08 पैसे से मजबूत breakout दिया है। यह entire moving average cluster अब major dynamic support में flip हो चुका है।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Day high 84 रुपये 63 पैसे छूने के बाद stock Value Area High 83 रुपये 82 पैसे के consolidation zone में trade कर रहा है। 83.82 के ऊपर sustained breakout fresh upward momentum ignite करेगा।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Value Area High clear होते ही upward technical highway खुल जाता है, जहां primary swing target 88 रुपये 50 पैसे रहेगा, और extended momentum 94 से 96 रुपये के zone की तरफ point कर रहा है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"Broader structural trend को 100 DEMA 71 रुपये 29 पैसे और 50 DEMA 71 रुपये 18 पैसे support provide कर रहे हैं। 80 रुपये के VAL floor पर strict risk manage करते हुए upward targets के लिए trade plan करें।",
            },
        ]
    elif sym == "SUNPHARMA":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Sun Pharma के institutional chart पर golden rule समझिए। Current market price 1,884 रुपये 90 पैसे से नीचे की तरफ solid red arrow point कर रहा है critical dynamic supports की ओर, और ऊपर की तरफ solid green arrow point कर रहा है breakout targets की ओर।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Chart के bottom पर 361 करोड़ रुपये का massive session volume surge देखिए। Buyers ने 1,884 रुपये 90 पैसे के Monthly Point of Control पर भारी institutional volume absorb किया है। Downward red arrow नीचे Value Area Low 1,736 रुपये की ओर rock-solid demand zone को point कर रहा है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Sun Pharma चारों DEMA averages के strictly ऊपर trade कर रहा है। Live price से नीचे red arrow 20 DEMA 1,879 रुपये 02 पैसे की ओर point कर रहा है, जो सिर्फ 0.31 percent नीचे primary dynamic shock absorber का काम कर रहा है।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Price अब Value Area High 1,901 रुपये 43 पैसे के consolidation hurdle को test कर रहा है। 200 DEMA 1,863 रुपये और 100 DEMA 1,846 रुपये trend को strong institutional cushion provide कर रहे हैं।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Value Area High clear होते ही upward green arrow सक्रिय हो जाता है, जो live price से ऊपर Target 1 यानी 1,901 रुपये 43 पैसे, और secondary expansion corridor Target 2 यानी 1,940 रुपये की तरफ point कर रहा है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"200 DEMA 1,863 रुपये को strict trailing stop मानते हुए, institutional buyers 1,901 से 1,940 रुपये के target highway के लिए position manage कर सकते हैं। Keep trailing stops active.",
            },
        ]
    elif sym == "TRENT":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Trent Limited के institutional chart पर golden rule समझिए। Current market price 3,256 रुपये 10 पैसे के नीचे red arrow dynamic cushions को point करता है, और ऊपर green arrow high-probability upside targets को trigger कर रहा है।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Volume histogram पर 408 करोड़ रुपये का institutional turnover surge देखिए। Point of Control 3,024 रुपये और Value Area Low 2,792 रुपये की तरफ red arrow institutional demand base को point कर रहा है, जहां smart money की aggressive buying दर्ज हुई है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Trent चारों DEMA averages 20, 50, 100 और 200 के strictly ऊपर bull run में है। Live price से नीचे red arrow 20 DEMA 3,236 रुपये 09 पैसे की ओर point कर रहा है, जो सिर्फ 0.61 percent के discount पर unshakeable moving average support है।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Stock आज 3,256 रुपये के Value Area High hurdle को test कर रहा है। 50 DEMA 3,088 रुपये और 100 DEMA 2,986 रुपये का steep upward slope institutional expansion को accelerate कर रहा है।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"VAH 3,256 रुपये के ऊपर breakout होते ही green arrow 94 रुपये ऊपर Target 1 यानी 3,350 रुपये, और secondary green arrow 224 रुपये ऊपर Target 2 यानी 3,480 रुपये के all-time high territory की तरफ point कर रहा है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"20 DEMA 3,236 रुपये के cushion पर strict trailing stop maintain करते हुए, Trent 3,350 से 3,480 रुपये upside targets की तरफ momentum ride कर सकता है। Trade with trend discipline.",
            },
        ]
    elif sym == "TVSMOTOR":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"TVS Motor के लिए golden trading rule नोट कीजिए। Current market price 4,590 रुपये से नीचे red arrow critical support cushions को point कर रहा है, और ऊपर green arrow breakout targets को guide कर रहा है।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"Bottom chart पर 511 करोड़ रुपये का massive session volume surge देखिए। Buyers ने Monthly Point of Control 4,447 रुपये पर institutional demand खड़ी की है, जिसकी तरफ downward red arrow solid base indicate कर रहा है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"TVS Motor चारों moving averages के strictly ऊपर ट्रेड कर रहा है। Live price से नीचे red arrow 20 DEMA 4,555 रुपये 41 पैसे की ओर point कर रहा है, जो मात्र 0.75 percent नीचे dynamic support provide कर रहा है।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Stock Value Area High 4,590 रुपये की breakout boundary पर खड़ा है। 50 DEMA 4,418 रुपये और 100 DEMA 4,346 रुपये का multi-month moving average ribbon complete upward alignment में है।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"Breakout trigger होते ही upward green arrow 130 रुपये ऊपर Target 1 यानी 4,720 रुपये, और secondary expansion corridor 260 रुपये ऊपर Target 2 यानी 4,850 रुपये की तरफ point कर रहा है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"20 DEMA 4,555 रुपये के नीचे strict risk boundary maintain करते हुए, TVS Motor 4,720 और 4,850 रुपये के breakout targets के लिए perfectly positioned है। Trade with discipline.",
            },
        ]
    elif sym == "AXISBANK":
        return [
            {
                "id": "c0_master_rule",
                "phase": 0,
                "text": f"Axis Bank के massive volume breakout पर golden rule समझिए। Current market price 1,446 रुपये से नीचे red arrow dynamic moving average floors को point करता है, और ऊपर green arrow ambitious breakout targets को दिशा दे रहा है।",
            },
            {
                "id": "c1_val_poc",
                "phase": 1,
                "text": f"3,106 करोड़ रुपये का jaw-dropping institutional volume surge देखिए। Chart पर Point of Control 1,222 रुपये और Value Area Low 1,197 रुपये की तरफ red arrow smart money accumulation foundation को point कर रहा है।",
            },
            {
                "id": "c2_dema20",
                "phase": 2,
                "text": f"Axis Bank चारों DEMA averages 20, 50, 100 और 200 से काफी ऊपर trade कर रहा है। Live price से नीचे red arrow 20 DEMA 1,385 रुपये 05 पैसे की ओर point कर रहा है, जो trend pullbacks पर key institutional retest zone रहेगा।",
            },
            {
                "id": "c3_dema50",
                "phase": 3,
                "text": f"Stock Value Area High 1,446 रुपये की critical hurdle boundary पर trade कर रहा है। 50 DEMA 1,314 रुपये और 100 DEMA 1,279 रुपये banking pack में institutional momentum boost confirm कर रहे हैं।",
            },
            {
                "id": "c4_vah",
                "phase": 4,
                "text": f"VAH 1,446 रुपये clear होते ही upward green arrow 44 रुपये ऊपर Target 1 यानी 1,490 रुपये, और extended green arrow 104 रुपये ऊपर Target 2 यानी 1,550 रुपये के psychological milestone की तरफ point कर रहा है।",
            },
            {
                "id": "c5_macro",
                "phase": 5,
                "text": f"20 DEMA 1,385 रुपये को macro trailing support मानते हुए, 1,490 से 1,550 रुपये target highway के लिए risk manage करते हुए trade plan करें।",
            },
        ]

    # Universal Fallback Script (Hinglish)
    return [
        {
            "id": "c0_master_rule",
            "phase": 0,
            "text": f"{name} के लिए golden trading rule समझिए। Current market price {cmp_str} के नीचे के सभी लेवल्स dynamic support बन जाते हैं, और ऊपर के लेवल्स overhead resistance और upside targets।",
        },
        {
            "id": "c1_val_poc",
            "phase": 1,
            "text": f"Consolidation base के दौरान institutional buyers ने Value Area Low {val_str} और Monthly Point of Control {poc_str} पर strong demand दिखाई। {vol_str} शेयर्स के heavy volume ने accumulation floor confirm कर दिया।",
        },
        {
            "id": "c2_dema20",
            "phase": 2,
            "text": f"Point of Control से bounce करते ही expanding volume ने price को 20 DEMA {d20_str} के ऊपर push किया, जिससे यह resistance से dynamic support में flip हो गया।",
        },
        {
            "id": "c3_dema50",
            "phase": 3,
            "text": f"आज {name} अपने critical hurdle {hurdle_name} यानी {hurdle_str} को test कर रहा है। इसके ऊपर decisive close fresh support build करेगा।",
        },
        {
            "id": "c4_vah",
            "phase": 4,
            "text": f"इस hurdle के clear होते ही primary upside target Value Area High {vah_str} unlock हो जाता है, जो immediate supply corridor है।",
        },
        {
            "id": "c5_macro",
            "phase": 5,
            "text": f"अगर buy volume और open interest sustain करते हैं, तो अगले macro targets 100 DEMA {d100_str} और 200 DEMA {d200_str} रहेंगे। Levels के साथ trade करें, volume से confirm करें।",
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
    elif sym in ["HINDUNILVR", "HUL", "HINDUSTANUNILEVER"]:
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
                "tabLabel": "POC ACCUMULATION",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "908K VOL SHELF",
                "headline": f"SURGE FROM VAL ₹{info['val']:.2f} · ACCUMULATION AT POC ₹{info['poc']:.2f}",
                "rightSource": "POC ACCUMULATION",
            },
            "2": {
                "tabLabel": "20 DEMA BREAKOUT",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "+2.56% SURGE",
                "headline": f"SURGING DECISIVELY ABOVE 20 DEMA (₹{info['d20']:.2f}) · RECLAIMED SUPPORT",
                "rightSource": "DYNAMIC SUPPORT",
            },
            "3": {
                "tabLabel": "STRUCTURAL BASE",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "50 & 200 DEMA",
                "headline": f"200 DEMA ₹{info['d200']:.2f} & 50 DEMA ₹{info['d50']:.2f} PROVIDE SOLID BASE",
                "rightSource": "STRUCTURAL FLOOR",
            },
            "4": {
                "tabLabel": "₹2,118 TARGET",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"CLEARING ₹2,050 DAY HIGH UNLOCKS BUY PRICE RESISTANCE ₹{info['vah']:.2f}",
                "rightSource": f"TARGET ₹{info['vah']:.2f}",
            },
            "5": {
                "tabLabel": "85% BULLISH OI",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "RSI 69.5 · 85% BULLISH",
                "headline": f"RSI 69.5 EXPANSION · TRAIL ALONG 20 DEMA ₹{info['d20']:.2f} SUPPORT",
                "rightSource": "BULLISH BIAS",
            },
        }
    elif sym in ["LENSKART", "LENSKARTSOLUTIONS"]:
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
                "tabLabel": "POC ACCUMULATION BASE",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "3.77M VOL SHELF",
                "headline": f"DEMAND BASE AT VAL ₹{info['val']:.2f} · ACCUMULATION AT POC ₹{info['poc']:.2f}",
                "rightSource": "POC ACCUMULATION",
            },
            "2": {
                "tabLabel": "20 DEMA RECLAIMED",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "+0.92% EXPANSION",
                "headline": f"RECLAIMED 20 DEMA (₹{info['d20']:.2f}) · FLIPPED INTO DYNAMIC SUPPORT",
                "rightSource": "DYNAMIC SUPPORT",
            },
            "3": {
                "tabLabel": "VAH BREAKOUT",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "SUPPLY CLEARED",
                "headline": f"DECISIVE BREAKOUT OVER VALUE AREA HIGH ₹{info['vah']:.2f} · FLIPPED TO SUPPORT",
                "rightSource": "VAH CLEARED",
            },
            "4": {
                "tabLabel": "DEMA STRUCTURAL BASE",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "50, 100 & 200 DEMA",
                "headline": f"50 DEMA ₹{info['d50']:.2f}, 100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f}",
                "rightSource": "STRUCTURAL CUSHION",
            },
            "5": {
                "tabLabel": "85% BULLISH TARGETS",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "85% BULLISH OI",
                "headline": f"85% BULLISH OPEN INTEREST · UPSIDE TARGET CORRIDOR ₹760 - ₹780",
                "rightSource": "TARGET ₹760 - ₹780",
            },
        }
    elif sym in ["GESHIP", "GREAT_EASTERN", "GREATEASTERN"]:
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
                "tabLabel": "POC SUPPORT FLOOR",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "601.58K VOL",
                "headline": f"DEMAND SHELF AT POC ₹{info['poc']:.2f} · CONFIRMED VALUE AREA BASE",
                "rightSource": "POC SUPPORT",
            },
            "2": {
                "tabLabel": "20 & 50 DEMA SUPPORT",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC SUPPORT",
                "headline": f"CONFLUENT CLUSTER: 20 DEMA (₹{info['d20']:.2f}) & 50 DEMA (₹{info['d50']:.2f})",
                "rightSource": "DEMA SUPPORT",
            },
            "3": {
                "tabLabel": "100 & 200 DEMA BASE",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "DUAL MACRO BUFFER",
                "headline": f"100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f} STRUCTURAL CUSHION",
                "rightSource": "MACRO BUFFER",
            },
            "4": {
                "tabLabel": "VAH SUPPLY HURDLE",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "PRIMARY TARGET",
                "headline": f"PRIMARY OVERHEAD HURDLE AT VALUE AREA HIGH (₹{info['vah']:.2f})",
                "rightSource": f"TARGET ₹{info['vah']:.2f}",
            },
            "5": {
                "tabLabel": "85% BULLISH BIAS",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "SWING TARGETS",
                "headline": "CLEARING ₹1,555.10 TARGETS EXTENDED SWING CORRIDOR ₹1,600 & ₹1,620",
                "rightSource": "BULL EXPANSION",
            },
        }
    elif sym in ["SAGILITY", "SAGILITYINDIA"]:
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "NSE · SAGILITY",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "INSTITUTIONAL FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "ACCUMULATION BASE",
                "headline": f"SMART MONEY DEFENDS MONTH POC ₹{info['poc']:.2f} ABOVE VAL ₹{info['val']:.2f}",
                "rightSource": "ACCUMULATION",
            },
            "2": {
                "tabLabel": "20 & 50 DEMA CONVERGENCE",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "DYNAMIC SUPPORT",
                "headline": f"SURGED ABOVE 20 & 50 DEMA (₹{info['d20']:.2f}) · FLIPPED TO SUPPORT",
                "rightSource": "GOLDEN CROSSOVER",
            },
            "3": {
                "tabLabel": "VAH BREAKOUT",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "BULLISH BREAKOUT",
                "headline": f"EXPLOSIVE BREAKOUT AT VALUE AREA HIGH ₹{info['vah']:.2f} · BEARS TRAPPED",
                "rightSource": "BREAKOUT",
            },
            "4": {
                "tabLabel": "UPSIDE TARGETS",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "EXPANSION TARGET",
                "headline": "CLEARING VAH UNLOCKS TARGET 1 ₹47.00 & TARGET 2 ₹50.00 CORRIDOR",
                "rightSource": "TARGET ₹47-50",
            },
            "5": {
                "tabLabel": "MACRO UPTREND",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "100 & 200 DEMA",
                "headline": f"BULLISH ALIGNMENT: 100 DEMA ₹{info['d100']:.2f} & 200 DEMA ₹{info['d200']:.2f} BELOW PRICE",
                "rightSource": "CONFIRMED TREND",
            },
        }
    elif sym in ["UGROCAP", "UGROCAPITAL"]:
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "NSE · UGROCAP",
                "headline": "BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "INSTITUTIONAL FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "ACCUMULATION BASE",
                "headline": f"SMART MONEY DEFENDS POC & VAL ₹{info['val']:.2f} · ₹683 CR VOL",
                "rightSource": "BUY VOL CONFIRMS",
            },
            "2": {
                "tabLabel": "DYNAMIC SUPPORT",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "20 & 200 DEMA",
                "headline": f"BREAKOUT ABOVE 20 DEMA ₹{info['d20']:.2f} & 200 DEMA ₹{info['d200']:.2f}",
                "rightSource": "BULL EXPANSION",
            },
            "3": {
                "tabLabel": "VAH INFLECTION",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "KEY RESISTANCE",
                "headline": f"TESTING VALUE AREA HIGH ₹{info['vah']:.2f} · DAY HIGH ₹84.63",
                "rightSource": "INFLECTION HURDLE",
            },
            "4": {
                "tabLabel": "UPSIDE TARGETS",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "EXPANSION TARGET",
                "headline": "CLEARING VAH UNLOCKS TARGET 1 ₹88.50 & TARGET 2 ₹94.00-96.00",
                "rightSource": "TARGET ₹88.50",
            },
            "5": {
                "tabLabel": "MACRO UPTREND",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "STRUCTURAL FLOOR",
                "headline": f"CONFIRMED UPTREND: 50 DEMA ₹{info['d50']:.2f} & 100 DEMA ₹{info['d100']:.2f} BELOW PRICE",
                "rightSource": "CONFIRMED TREND",
            },
        }
    elif sym == "SUNPHARMA":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "NSE · SUNPHARMA",
                "headline": "BELOW CMP = SUPPORT (RED ARROW) | ABOVE CMP = TARGET (GREEN ARROW)",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "INSTITUTIONAL ACCUMULATION",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "TURNOVER ₹361 CR",
                "headline": f"MASSIVE VOLUME SURGE AT POC ₹{info['poc']:.2f} · VAL FLOOR ₹{info['val']:.2f}",
                "rightSource": "BUY VOL SURGE",
            },
            "2": {
                "tabLabel": "20 DEMA DEFENSE",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "ALL DEMAS BELOW",
                "headline": f"LIVE PRICE ABOVE 20 DEMA ₹{info['d20']:.2f} · 0.31% DYNAMIC CUSHION",
                "rightSource": "BULL EXPANSION",
            },
            "3": {
                "tabLabel": "VAH CONSOLIDATION",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "BREAKOUT BOUNDARY",
                "headline": f"TESTING VALUE AREA HIGH ₹{info['vah']:.2f} · 200 DEMA ₹{info['d200']:.2f}",
                "rightSource": "INFLECTION HURDLE",
            },
            "4": {
                "tabLabel": "GREEN ARROW TARGETS",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "EXPANSION HIGHWAY",
                "headline": "UPWARD GREEN ARROW UNLOCKS TARGET 1 ₹1,901.43 & TARGET 2 ₹1,940",
                "rightSource": "TARGET ₹1,940",
            },
            "5": {
                "tabLabel": "MACRO RISK FLOOR",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "TRAILING STOP",
                "headline": f"CONFIRMED UPTREND: 200 DEMA ₹{info['d200']:.2f} & 100 DEMA ₹{info['d100']:.2f} SUPPORT",
                "rightSource": "CONFIRMED TREND",
            },
        }
    elif sym == "TRENT":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "NSE · TRENT",
                "headline": "BELOW CMP = SUPPORT (RED ARROW) | ABOVE CMP = TARGET (GREEN ARROW)",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VOLUME SURGE & POC",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "TURNOVER ₹408 CR",
                "headline": f"INSTITUTIONAL TURNOVER SURGE · POC ₹{info['poc']:.2f} & VAL ₹{info['val']:.2f}",
                "rightSource": "BUY VOL SURGE",
            },
            "2": {
                "tabLabel": "BULLISH DEMA STACK",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "ALL DEMAS BELOW",
                "headline": f"20 DEMA CUSHION ₹{info['d20']:.2f} (-0.61%) · 50 DEMA ₹{info['d50']:.2f}",
                "rightSource": "BULL EXPANSION",
            },
            "3": {
                "tabLabel": "VAH BREAKOUT",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "KEY HURDLE",
                "headline": f"PRICE AT VALUE AREA HIGH ₹{info['vah']:.2f} · ALL-TIME MOMENTUM",
                "rightSource": "INFLECTION HURDLE",
            },
            "4": {
                "tabLabel": "UPSIDE EXPANSION",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "TARGET CORRIDOR",
                "headline": "UPWARD GREEN ARROW TO TARGET 1 ₹3,350 & TARGET 2 ₹3,480",
                "rightSource": "TARGET ₹3,480",
            },
            "5": {
                "tabLabel": "MACRO RISK DISCIPLINE",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "TRAILING STOP",
                "headline": f"20 DEMA ₹{info['d20']:.2f} TRAILING STOP · SEBI COMPLIANT STUDY",
                "rightSource": "CONFIRMED TREND",
            },
        }
    elif sym == "TVSMOTOR":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "NSE · TVSMOTOR",
                "headline": "BELOW CMP = SUPPORT (RED ARROW) | ABOVE CMP = TARGET (GREEN ARROW)",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "VOLUME SURGE FLOOR",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "TURNOVER ₹511 CR",
                "headline": f"511 CR VOLUME SURGE · POC ₹{info['poc']:.2f} INSTITUTIONAL DEMAND",
                "rightSource": "BUY VOL SURGE",
            },
            "2": {
                "tabLabel": "20 DEMA DEFENSE",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "ALL DEMAS BELOW",
                "headline": f"LIVE PRICE ABOVE 20 DEMA ₹{info['d20']:.2f} · 0.75% CUSHION",
                "rightSource": "BULL EXPANSION",
            },
            "3": {
                "tabLabel": "VAH INFLECTION",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "BREAKOUT BOUNDARY",
                "headline": f"BREAKOUT AT VALUE AREA HIGH ₹{info['vah']:.2f} · 50 DEMA ₹{info['d50']:.2f}",
                "rightSource": "INFLECTION HURDLE",
            },
            "4": {
                "tabLabel": "UPSIDE TARGET HIGHWAY",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "EXPANSION TARGET",
                "headline": "UPWARD GREEN ARROW UNLOCKS TARGET 1 ₹4,720 & TARGET 2 ₹4,850",
                "rightSource": "TARGET ₹4,850",
            },
            "5": {
                "tabLabel": "MACRO RISK BOUNDARY",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "TRAILING STOP",
                "headline": f"CONFIRMED UPTREND: 20 DEMA ₹{info['d20']:.2f} STRICT RISK FLOOR",
                "rightSource": "CONFIRMED TREND",
            },
        }
    elif sym == "AXISBANK":
        return {
            "0": {
                "tabLabel": "CORE TRADING LAW",
                "tabBg": "#F2CF1D",
                "tabColor": "#0C0E12",
                "contextChip": "NSE · AXISBANK",
                "headline": "BELOW CMP = SUPPORT (RED ARROW) | ABOVE CMP = TARGET (GREEN ARROW)",
                "rightSource": f"CMP ₹{info['cmp']:.2f}",
            },
            "1": {
                "tabLabel": "MASSIVE VOLUME SURGE",
                "tabBg": "#FF4D4D",
                "tabColor": "#0C0E12",
                "contextChip": "TURNOVER ₹3,106 CR",
                "headline": f"₹3,106 CR MEGA VOLUME SURGE · POC ₹{info['poc']:.2f} & VAL ₹{info['val']:.2f}",
                "rightSource": "BUY VOL SURGE",
            },
            "2": {
                "tabLabel": "20 DEMA MOMENTUM",
                "tabBg": "#10B981",
                "tabColor": "#0C0E12",
                "contextChip": "ALL DEMAS BELOW",
                "headline": f"PRICE BLAST ABOVE 20 DEMA ₹{info['d20']:.2f} · BULLISH MOMENTUM",
                "rightSource": "BULL EXPANSION",
            },
            "3": {
                "tabLabel": "VAH BREAKOUT",
                "tabBg": "#00E5FF",
                "tabColor": "#0C0E12",
                "contextChip": "BREAKOUT BOUNDARY",
                "headline": f"TESTING VALUE AREA HIGH ₹{info['vah']:.2f} · 50 DEMA ₹{info['d50']:.2f}",
                "rightSource": "INFLECTION HURDLE",
            },
            "4": {
                "tabLabel": "UPSIDE TARGET HIGHWAY",
                "tabBg": "#22D3EE",
                "tabColor": "#0C0E12",
                "contextChip": "EXPANSION TARGET",
                "headline": "UPWARD GREEN ARROW UNLOCKS TARGET 1 ₹1,490 & TARGET 2 ₹1,550",
                "rightSource": "TARGET ₹1,550",
            },
            "5": {
                "tabLabel": "MACRO RISK MANAGEMENT",
                "tabBg": "#FFB800",
                "tabColor": "#0C0E12",
                "contextChip": "TRAILING STOP",
                "headline": f"20 DEMA ₹{info['d20']:.2f} RETEST FLOOR · SEBI COMPLIANT STUDY",
                "rightSource": "CONFIRMED TREND",
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
    elif sym in ["HINDUNILVR", "HUL", "HINDUSTANUNILEVER"]:
        return {
            "0": "UNIVERSAL LAW",
            "1": "ACCUMULATION BASE",
            "2": "DYNAMIC SUPPORT",
            "3": "STRUCTURAL FLOOR",
            "4": "VAH BREAKOUT",
            "5": "BULLISH BIAS",
        }
    elif sym in ["LENSKART", "LENSKARTSOLUTIONS"]:
        return {
            "0": "UNIVERSAL LAW",
            "1": "ACCUMULATION BASE",
            "2": "DYNAMIC SUPPORT",
            "3": "VAH BREAKOUT",
            "4": "STRUCTURAL CUSHION",
            "5": "85% BULLISH",
        }
    elif sym in ["GESHIP", "GREAT_EASTERN", "GREATEASTERN"]:
        return {
            "0": "UNIVERSAL LAW",
            "1": "POC SUPPORT",
            "2": "DEMA CLUSTER",
            "3": "MACRO SHELF",
            "4": "VAH HURDLE",
            "5": "85% BULLISH",
        }
    elif sym in ["SAGILITY", "SAGILITYINDIA"]:
        return {
            "0": "UNIVERSAL LAW",
            "1": "ACCUMULATION BASE",
            "2": "DEMA CONVERGENCE",
            "3": "VAH BREAKOUT",
            "4": "TARGET CORRIDOR",
            "5": "MACRO UPTREND",
        }
    elif sym in ["UGROCAP", "UGROCAPITAL"]:
        return {
            "0": "UNIVERSAL LAW",
            "1": "ACCUMULATION BASE",
            "2": "DYNAMIC CUSHION",
            "3": "VAH INFLECTION",
            "4": "TARGET HIGHWAY",
            "5": "MACRO UPTREND",
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

    levels_bottom_pct = None
    levels_bottom_pct_9x16 = None
    levels_bottom_pct_16x9 = None
    if sym in ["hindunilvr", "hul"]:
        levels_bottom_pct_9x16 = {
            "vah": 70.80,
            "buy": 70.80,
            "cmp": 61.76,
            "d20": 56.02,
            "poc": 54.84,
            "d200": 46.49,
            "d50": 44.97,
            "d100": 41.72,
            "val": 30.31,
        }
        levels_bottom_pct_16x9 = {
            "vah": 83.97,
            "buy": 83.97,
            "cmp": 69.21,
            "d20": 59.83,
            "poc": 57.91,
            "d200": 44.27,
            "d50": 41.78,
            "d100": 36.47,
            "val": 17.84,
        }
        levels_bottom_pct = levels_bottom_pct_9x16
    elif sym in ["maruti", "marutisuzuki"]:
        levels_bottom_pct_9x16 = {
            "cmp": 57.46,
            "vah": 53.70,
            "d20": 49.71,
            "poc": 47.51,
            "d200": 41.89,
            "d50": 40.40,
            "d100": 39.06,
            "val": 28.95,
        }
        levels_bottom_pct_16x9 = {
            "cmp": 62.19,
            "vah": 56.04,
            "d20": 49.53,
            "poc": 45.94,
            "d200": 36.76,
            "d50": 34.32,
            "d100": 32.13,
            "val": 15.62,
        }
        levels_bottom_pct = levels_bottom_pct_9x16
    elif sym in ["lenskart", "lenskartsolutions"]:
        levels_bottom_pct_9x16 = {
            "cmp": 60.42,
            "vah": 60.37,
            "d20": 58.99,
            "poc": 58.04,
            "d50": 56.69,
            "d100": 54.83,
            "val": 51.05,
            "d200": 47.78,
        }
        levels_bottom_pct_16x9 = {
            "cmp": 67.01,
            "vah": 66.93,
            "d20": 64.68,
            "poc": 63.13,
            "d50": 60.93,
            "d100": 57.89,
            "val": 51.72,
            "d200": 46.37,
        }
        levels_bottom_pct = levels_bottom_pct_9x16
    elif sym in ["lici", "lic"]:
        levels_bottom_pct_9x16 = {
            "cmp": 64.0,
            "vah": 58.0,
            "d20": 48.0,
            "poc": 46.5,
            "d200": 44.5,
            "d100": 39.0,
            "d50": 37.0,
            "val": 22.5,
        }
        levels_bottom_pct_16x9 = {
            "cmp": 64.0,
            "vah": 58.0,
            "d20": 48.0,
            "poc": 46.5,
            "d200": 44.5,
            "d100": 39.0,
            "d50": 37.0,
            "val": 22.5,
        }
        levels_bottom_pct = levels_bottom_pct_16x9
    elif sym in ["ltim", "mindtree", "ltimindtree"]:
        levels_bottom_pct_16x9 = {
            "vah": 61.9,
            "poc": 58.7,
            "target2": 58.7,
            "target1": 48.9,
            "d20": 38.6,
            "d50": 38.0,
            "cmp": 36.5,
            "d100": 27.4,
            "val": 24.9,
            "d200": 21.5,
        }
        levels_bottom_pct_9x16 = levels_bottom_pct_16x9
        levels_bottom_pct = levels_bottom_pct_16x9
    elif sym in ["sagility", "sagilityindia"]:
        levels_bottom_pct_16x9 = {
            "cmp": 81.4,
            "vah": 77.3,
            "d20": 67.1,
            "d50": 62.5,
            "d100": 58.2,
            "d200": 53.5,
            "poc": 48.9,
            "val": 27.5,
            "target1": 89.0,
            "target2": 95.0,
        }
        levels_bottom_pct_9x16 = {
            "cmp": 78.5,
            "vah": 74.8,
            "d20": 65.2,
            "d50": 61.0,
            "d100": 57.0,
            "d200": 52.8,
            "poc": 48.2,
            "val": 28.0,
            "target1": 86.5,
            "target2": 92.0,
        }
        levels_bottom_pct = levels_bottom_pct_16x9
    elif sym in ["silverbees", "silver"]:
        levels_bottom_pct_9x16 = {
            "cmp": 8.5,
            "val": 3.6,
            "d20": 15.0,
            "d50": 26.5,
            "poc": 33.4,
            "vah": 37.4,
            "d100": 41.3,
            "d200": 66.0,
            "target1": 15.0,
            "target2": 33.4,
            "buy": 66.6,
        }
        levels_bottom_pct_16x9 = {
            "cmp": 8.5,
            "val": 3.6,
            "d20": 15.0,
            "d50": 26.5,
            "poc": 33.4,
            "vah": 37.4,
            "d100": 41.3,
            "d200": 66.0,
            "target1": 15.0,
            "target2": 33.4,
            "buy": 66.6,
        }
        levels_bottom_pct = levels_bottom_pct_16x9
    elif sym in ["ltim", "mindtree", "ltimindtree"]:
        levels_bottom_pct_16x9 = {
            "vah": 61.9,
            "poc": 58.7,
            "target2": 58.7,
            "target1": 48.9,
            "d20": 38.6,
            "d50": 38.0,
            "cmp": 36.5,
            "d100": 27.4,
            "val": 24.9,
            "d200": 21.5,
        }
        levels_bottom_pct_9x16 = levels_bottom_pct_16x9
        levels_bottom_pct = levels_bottom_pct_16x9
    elif sym in ["sagility", "sagilityindia"]:
        levels_bottom_pct_16x9 = {
            "cmp": 81.4,
            "vah": 77.3,
            "d20": 67.1,
            "d50": 62.5,
            "d100": 58.2,
            "d200": 53.5,
            "poc": 48.9,
            "val": 27.5,
            "target1": 89.0,
            "target2": 95.0,
        }
        levels_bottom_pct_9x16 = {
            "cmp": 78.5,
            "vah": 74.8,
            "d20": 65.2,
            "d50": 61.0,
            "d100": 57.0,
            "d200": 52.8,
            "poc": 48.2,
            "val": 28.0,
            "target1": 86.5,
            "target2": 92.0,
        }
        levels_bottom_pct = levels_bottom_pct_16x9

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
        "levels_bottom_pct": levels_bottom_pct,
        "levels_bottom_pct_9x16": levels_bottom_pct_9x16,
        "levels_bottom_pct_16x9": levels_bottom_pct_16x9,
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
            if sym_req == "SILVERBEES":
                match = {
                    "symbol": "SILVERBEES",
                    "name": "Nippon India Silver ETF",
                    "cmp": 146.78,
                    "ltp": 146.78,
                    "volume": "189.98 M",
                    "oiSentiment": "Heavy Accumulation Demand",
                    "dema": {
                        "d20": 155.50,
                        "d50": 168.85,
                        "d100": 186.65,
                        "d200": 215.45,
                    },
                    "vp": {
                        "val": 141.77,
                        "poc": 176.84,
                        "vah": 181.85,
                    },
                    "target1": 155.50,
                    "target2": 176.84,
                    "buy": 216.78,
                    "image": "charts/SILVERBEES_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for SILVERBEES from attached chart snapshot.")
            elif sym_req in ["LTIM", "MINDTREE", "LTIMINDTREE"]:
                match = {
                    "symbol": "LTIM",
                    "name": "LTIMindtree Limited",
                    "cmp": 4166.40,
                    "ltp": 4166.40,
                    "volume": "833 K",
                    "oiSentiment": "Bullish Consolidation Breakout",
                    "dema": {
                        "d20": 4180.45,
                        "d50": 4175.05,
                        "d100": 4117.95,
                        "d200": 4057.90,
                    },
                    "vp": {
                        "val": 4106.49,
                        "poc": 4398.28,
                        "vah": 4431.25,
                    },
                    "target1": 4292.00,
                    "target2": 4398.28,
                    "image": "charts/LTIM_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for LTIM / MINDTREE from attached chart snapshot.")
            elif sym_req in ["SAGILITY", "SAGILITYINDIA"]:
                match = {
                    "symbol": "SAGILITY",
                    "name": "Sagility India Limited",
                    "cmp": 45.25,
                    "ltp": 45.25,
                    "volume": "14.2 M",
                    "oiSentiment": "Bullish VAH Breakout",
                    "dema": {
                        "d20": 44.50,
                        "d50": 44.50,
                        "d100": 44.15,
                        "d200": 43.85,
                    },
                    "vp": {
                        "val": 40.25,
                        "poc": 42.19,
                        "vah": 45.25,
                    },
                    "target1": 47.00,
                    "target2": 50.00,
                    "image": "charts/SAGILITY_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for SAGILITY from attached chart snapshot.")
            elif sym_req in ["UGROCAP", "UGROCAPITAL"]:
                match = {
                    "symbol": "UGROCAP",
                    "name": "Ugro Capital Limited",
                    "cmp": 81.10,
                    "ltp": 81.10,
                    "volume": "84.3 M",
                    "oiSentiment": "Heavy Institutional Turnover ₹683 Cr",
                    "dema": {
                        "d20": 72.89,
                        "d50": 71.18,
                        "d100": 71.29,
                        "d200": 72.08,
                    },
                    "vp": {
                        "val": 80.72,
                        "poc": 80.72,
                        "vah": 83.82,
                    },
                    "target1": 83.82,
                    "target2": 88.50,
                    "stop": 79.80,
                    "image": "charts/UGROCAP_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for UGROCAP from attached chart snapshot.")
            elif sym_req == "SUNPHARMA":
                match = {
                    "symbol": "SUNPHARMA",
                    "name": "Sun Pharmaceutical Industries",
                    "cmp": 1884.90,
                    "ltp": 1884.90,
                    "volume": "1.91 M",
                    "oiSentiment": "Turnover ₹361 Cr · POC Consolidation",
                    "dema": {
                        "d20": 1879.02,
                        "d50": 1829.63,
                        "d100": 1846.02,
                        "d200": 1863.63,
                    },
                    "vp": {
                        "val": 1736.13,
                        "poc": 1884.90,
                        "vah": 1901.43,
                    },
                    "target1": 1901.43,
                    "target2": 1940.00,
                    "stop": 1863.63,
                    "image": "charts/SUNPHARMA_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for SUNPHARMA.")
            elif sym_req == "TRENT":
                match = {
                    "symbol": "TRENT",
                    "name": "Trent Limited",
                    "cmp": 3256.10,
                    "ltp": 3256.10,
                    "volume": "1.25 M",
                    "oiSentiment": "Turnover ₹408 Cr · VAH Breakout",
                    "dema": {
                        "d20": 3236.09,
                        "d50": 3087.94,
                        "d100": 2986.68,
                        "d200": 2872.78,
                    },
                    "vp": {
                        "val": 2792.66,
                        "poc": 3024.38,
                        "vah": 3256.10,
                    },
                    "target1": 3350.00,
                    "target2": 3480.00,
                    "stop": 3200.00,
                    "image": "charts/TRENT_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for TRENT.")
            elif sym_req == "TVSMOTOR":
                match = {
                    "symbol": "TVSMOTOR",
                    "name": "TVS Motor Company",
                    "cmp": 4590.00,
                    "ltp": 4590.00,
                    "volume": "1.11 M",
                    "oiSentiment": "Turnover ₹511 Cr · VAH Breakout",
                    "dema": {
                        "d20": 4555.41,
                        "d50": 4418.58,
                        "d100": 4346.11,
                        "d200": 4210.45,
                    },
                    "vp": {
                        "val": 3946.59,
                        "poc": 4447.02,
                        "vah": 4590.00,
                    },
                    "target1": 4720.00,
                    "target2": 4850.00,
                    "stop": 4520.00,
                    "image": "charts/TVSMOTOR_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for TVSMOTOR.")
            elif sym_req == "AXISBANK":
                match = {
                    "symbol": "AXISBANK",
                    "name": "Axis Bank Limited",
                    "cmp": 1446.00,
                    "ltp": 1446.00,
                    "volume": "21.4 M",
                    "oiSentiment": "Turnover ₹3,106 Cr · Huge Volume Breakout",
                    "dema": {
                        "d20": 1385.05,
                        "d50": 1314.46,
                        "d100": 1279.18,
                        "d200": 1271.65,
                    },
                    "vp": {
                        "val": 1197.00,
                        "poc": 1221.90,
                        "vah": 1446.00,
                    },
                    "target1": 1490.00,
                    "target2": 1550.00,
                    "stop": 1385.05,
                    "image": "charts/AXISBANK_1D_chart.png",
                }
                print(f"[NOTE] Loaded verified technical levels for AXISBANK.")
            else:
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
