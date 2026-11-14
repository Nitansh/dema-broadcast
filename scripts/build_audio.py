#!/usr/bin/env python3
"""
Automated Broadcast Audio Generator for DEMA Master Broadcast Suite.
Generates English voiceover via edge-tts, procedural 120 BPM financial score bed,
foley wipes/split-flap clicks, and synchronized .srt / .vtt subtitles.
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

# Path Discovery
SKILL_ROOT = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = SKILL_ROOT.parent.parent
REMOTION_DIR = WORKSPACE_ROOT / "modi-remotion"
LEMO_SFX_DIR = WORKSPACE_ROOT / ".agents" / "skills" / "lemo-opuscar" / "core" / "audio"
if LEMO_SFX_DIR.exists():
    sys.path.insert(0, str(LEMO_SFX_DIR))
    import sfx
else:
    sfx = None

FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"
FFPROBE = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffprobe.exe")
if not Path(FFPROBE).exists():
    FFPROBE = "ffprobe"

SR = 48000


def synth_chord(freqs, dur, decay=1.5):
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    sig = np.zeros_like(t)
    for i, f in enumerate(freqs):
        amp = 1.0 / (i + 1)
        sig += amp * np.sin(2 * np.pi * f * t)
        sig += 0.25 * amp * np.sin(4 * np.pi * f * t)
    env = np.exp(-t * decay)
    return sig * env


def synth_whoosh_wipe(dur=0.38):
    n_samples = int(SR * dur)
    t = np.linspace(0, dur, n_samples, endpoint=False)
    noise = np.random.uniform(-1, 1, n_samples)
    from scipy.signal import butter, sosfilt
    sos = butter(4, [600, 2800], btype="bandpass", fs=SR, output="sos")
    filtered = sosfilt(sos, noise)
    env = np.sin(np.pi * t / dur) ** 2
    return filtered * env * 0.45


def synth_splitflap_click(dur=0.045):
    n_samples = int(SR * dur)
    t = np.linspace(0, dur, n_samples, endpoint=False)
    noise = np.random.uniform(-1, 1, n_samples)
    env = np.exp(-t * 90)
    sig = noise * env * 0.35
    sig += 0.30 * np.sin(2 * np.pi * 1250 * t) * np.exp(-t * 70)
    return sig


def synth_sub_impact(dur=1.2):
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    freq = 65.0 * np.exp(-t * 2.5) + 32.0
    phase = 2 * np.pi * np.cumsum(freq) / SR
    sig = np.sin(phase) * np.exp(-t * 2.0)
    return sig * 0.65


def synth_sirca_style_bed(total_dur: float, silence_window: tuple, hits: list):
    n_total = int(SR * total_dur)
    bed = np.zeros(n_total, dtype=np.float32)
    bpm = 120.0
    spb = 60.0 / bpm
    bass_pitches = [55.0, 55.0, 55.0, 55.0, 49.0, 49.0, 58.27, 58.27]
    idx = 0
    while (idx + 0.5) * spb < total_dur:
        t_hit = idx * spb
        note_dur = spb * 0.45
        note_samples = int(SR * note_dur)
        if int(t_hit * SR) + note_samples < n_total:
            p = bass_pitches[idx % len(bass_pitches)]
            t_sub = np.linspace(0, note_dur, note_samples, endpoint=False)
            pulse = np.sin(2 * np.pi * p * t_sub) * np.exp(-t_sub * 8.0)
            pulse += 0.3 * np.sin(4 * np.pi * p * t_sub) * np.exp(-t_sub * 12.0)
            bed[int(t_hit * SR):int(t_hit * SR) + note_samples] += pulse * 0.22
        idx += 1

    bar_len = spb * 4.0
    bar_idx = 0
    chords = [
        [110.0, 130.81, 164.81],
        [110.0, 130.81, 164.81],
        [98.00, 123.47, 146.83],
        [116.54, 138.59, 174.61],
    ]
    while bar_idx * bar_len < total_dur:
        t_bar = bar_idx * bar_len
        chord_dur = bar_len * 0.85
        chord_sig = synth_chord(chords[bar_idx % len(chords)], chord_dur, decay=0.9)
        chord_len = min(len(chord_sig), n_total - int(t_bar * SR))
        if chord_len > 0:
            bed[int(t_bar * SR):int(t_bar * SR) + chord_len] += chord_sig[:chord_len] * 0.16
        bar_idx += 1

    if silence_window:
        s_start, s_end = silence_window
        i_s = int(s_start * SR)
        i_e = min(int(s_end * SR), n_total)
        f_len = int(0.06 * SR)
        if i_e > i_s + 2 * f_len:
            bed[i_s:i_s + f_len] *= np.linspace(1, 0, f_len)
            bed[i_s + f_len:i_e - f_len] = 0.0
            bed[i_e - f_len:i_e] *= np.linspace(0, 1, f_len)

    for h in hits:
        t_h = h["t"]
        htype = h["type"]
        i_h = int(t_h * SR)
        if i_h >= n_total:
            continue
        if htype == "sting":
            sub = synth_sub_impact(1.2)
            c = synth_chord([220.0, 277.18, 329.63, 440.0], 1.4, decay=2.2)
            sig = sub[:min(len(sub), len(c))] + c[:min(len(sub), len(c))] * 0.4
        elif htype == "whoosh":
            sig = synth_whoosh_wipe(0.38)
        elif htype == "splitflap":
            sig = synth_splitflap_click(0.045)
        else:
            continue
        l = min(len(sig), n_total - i_h)
        bed[i_h:i_h + l] += sig[:l] * 0.55

    return bed


async def gen_voice_chunk(text: str, out_wav: Path, voice: str = "en-IN-PrabhatNeural", rate: str = "+4%"):
    tmp_mp3 = out_wav.with_suffix(".mp3")
    comm = edge_tts.Communicate(text, voice, rate=rate)
    await comm.save(str(tmp_mp3))
    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(tmp_mp3),
            "-ar", str(SR),
            "-ac", "1",
            str(out_wav),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    if tmp_mp3.exists():
        tmp_mp3.unlink()


def read_wav_mono(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as wf:
        n_samples = wf.getnframes()
        data = wf.readframes(n_samples)
        arr = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
        return arr


def save_wav_mono(path: Path, arr: np.ndarray):
    arr_clipped = np.clip(arr, -1.0, 1.0)
    arr_int16 = (arr_clipped * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(arr_int16.tobytes())


def format_srt_time(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    ms = int(round((sec - int(sec)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def format_vtt_time(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    ms = int(round((sec - int(sec)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


DEFAULT_CHAPTERS = [
    {
        "id": "fv_ch1_intro",
        "title": "Intro & Educational Disclaimer",
        "rate": "+4%",
        "target_dur": 31.5,
        "silence_drop": (4.5, 5.0),
        "chunks": [
            {"t": 1.2, "text": "Welcome to DEMA Analysis, your daily algorithmic market briefing."},
            {"t": 8.0, "text": "Mandatory educational disclaimer: All charts, moving averages, and Volume Profile footprints in this broadcast are strictly for technical education and analytical chart study only."},
            {"t": 20.0, "text": "We are not SEBI-registered advisors, and nothing here constitutes financial or investment advice. Let us examine today's verified market telemetry and institutional order flow."}
        ],
        "hits": [{"t": 0.05, "type": "sting"}, {"t": 4.8, "type": "whoosh"}],
    },
    {
        "id": "fv_ch2_macro",
        "title": "Market Summary: Nifty 50, Gold, Silver & Crude",
        "rate": "+4%",
        "target_dur": 47.5,
        "silence_drop": (16.0, 16.5),
        "chunks": [
            {"t": 1.4, "text": "Starting with the macro summary: The benchmark Nifty fifty pulled back to settle at key levels, trading within an intraday channel."},
            {"t": 17.5, "text": "In global commodities, Gold held steady near highs, while Silver experienced high-beta consolidation."},
            {"t": 32.5, "text": "Energy markets showed firm strength: WTI Crude climbed firmly alongside Brent Crude, posting solid multi-session gains."}
        ],
        "hits": [{"t": 0.05, "type": "sting"}, {"t": 1.9, "type": "splitflap"}, {"t": 16.2, "type": "whoosh"}, {"t": 31.8, "type": "whoosh"}],
    },
    {
        "id": "fv_ch3_movers",
        "title": "Nifty 50 Movers & Order Flow Breadth",
        "rate": "+4%",
        "target_dur": 49.0,
        "silence_drop": (15.5, 16.0),
        "chunks": [
            {"t": 1.4, "text": "Examining market breadth and top movers: In the green, auto and consumer staples held firm above their twenty DEMA support floors."},
            {"t": 17.5, "text": "On the downside, select financials faced institutional profit taking, alongside energy and metal constituents under selling pressure."},
            {"t": 33.0, "text": "High momentum breakouts were led by high-volume leaders, demonstrating heavy liquidity accumulation."}
        ],
        "hits": [{"t": 0.05, "type": "sting"}, {"t": 1.8, "type": "whoosh"}, {"t": 16.0, "type": "whoosh"}, {"t": 32.0, "type": "whoosh"}],
    },
    {
        "id": "fv_ch4_deepdive",
        "title": "Deep Dive & Order Flow Footprint",
        "rate": "+4%",
        "target_dur": 56.5,
        "silence_drop": (17.5, 18.0),
        "chunks": [
            {"t": 1.4, "text": "Moving to our featured technical deep-dive: Looking closely at the daily chart structure and exponential moving average alignment."},
            {"t": 18.5, "text": "The price has reclaimed the critical twenty DEMA, while the fifty and one hundred DEMA provide solid structural trend support."},
            {"t": 34.5, "text": "Volume Profile footprint confirms major liquidity absorption at the Point of Control, indicating heavy institutional participation."}
        ],
        "hits": [{"t": 0.05, "type": "sting"}, {"t": 18.0, "type": "whoosh"}, {"t": 34.0, "type": "whoosh"}],
    },
    {
        "id": "fv_ch5_recap",
        "title": "Tomorrow's Strategy & Trade Range Plan",
        "rate": "+4%",
        "target_dur": 30.0,
        "silence_drop": (7.0, 7.5),
        "chunks": [
            {"t": 1.2, "text": "To recap tomorrow's tactical action plan: Key support sits at the Value Area Low and twenty DEMA pivot floor."},
            {"t": 11.5, "text": "Resistance is pegged near recent swing highs and Value Area High. Trade with strict risk management."},
            {"t": 21.0, "text": "Subscribe for daily post-market technical breakdowns. Stay disciplined, and trade safe."}
        ],
        "hits": [{"t": 0.05, "type": "sting"}, {"t": 7.2, "type": "whoosh"}, {"t": 20.5, "type": "whoosh"}],
    }
]


async def build_suite_audio(output_dir: Path, voice: str = "en-IN-PrabhatNeural", chapters=None):
    if chapters is None:
        chapters = DEFAULT_CHAPTERS

    tmp_dir = output_dir / "_tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    manifest = {"generated_voice": voice, "sample_rate": SR, "chapters": {}}
    global_srt_lines = []
    global_vtt_lines = ["WEBVTT", ""]
    global_subtitle_index = 1
    running_timeline_sec = 0.0

    for spec in chapters:
        cid = spec["id"]
        target_dur = spec["target_dur"]
        rate = spec.get("rate", "+4%")
        silence_drop = spec.get("silence_drop")
        hits = spec.get("hits", [])
        chunks = spec["chunks"]

        print(f"\n[BUILD AUDIO] Chapter: {cid} ({spec['title']}) -> {target_dur}s")

        cue_times = []
        cue_frames = []
        chunk_metadata = []
        voice_bus = np.zeros(int(SR * target_dur), dtype=np.float32)

        for i, chk in enumerate(chunks):
            t_start = chk["t"]
            text = chk["text"]
            wav_chunk = tmp_dir / f"{cid}_chunk_{i}.wav"

            await gen_voice_chunk(text, wav_chunk, voice=voice, rate=rate)
            arr = read_wav_mono(wav_chunk)
            dur_chunk = len(arr) / SR

            cue_times.append(round(t_start, 2))
            cue_frames.append(int(round(t_start * 30.0)))

            i_start = int(t_start * SR)
            i_end = min(i_start + len(arr), len(voice_bus))
            voice_bus[i_start:i_end] += arr[: i_end - i_start] * 1.15

            abs_start = running_timeline_sec + t_start
            abs_end = running_timeline_sec + t_start + dur_chunk

            global_srt_lines.append(f"{global_subtitle_index}")
            global_srt_lines.append(f"{format_srt_time(abs_start)} --> {format_srt_time(abs_end)}")
            global_srt_lines.append(text)
            global_srt_lines.append("")

            global_vtt_lines.append(f"{format_vtt_time(abs_start)} --> {format_vtt_time(abs_end)}")
            global_vtt_lines.append(text)
            global_vtt_lines.append("")

            global_subtitle_index += 1
            chunk_metadata.append({
                "start_sec": round(t_start, 2),
                "duration_sec": round(dur_chunk, 2),
                "start_frame": int(round(t_start * 30.0)),
                "text": text
            })

        bed_foley = synth_sirca_style_bed(target_dur, silence_drop, hits)
        final_mix = bed_foley * 0.70 + voice_bus

        pk = np.max(np.abs(final_mix))
        if pk > 0.95:
            final_mix = final_mix / pk * 0.95

        wav_out = output_dir / f"{cid}.wav"
        mp3_out = output_dir / f"{cid}.mp3"
        save_wav_mono(wav_out, final_mix)

        subprocess.run(
            [
                FFMPEG, "-y",
                "-i", str(wav_out),
                "-c:a", "libmp3lame",
                "-b:a", "256k",
                "-ar", str(SR),
                str(mp3_out),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )

        manifest["chapters"][cid] = {
            "title": spec["title"],
            "duration_sec": target_dur,
            "frames_30fps": int(round(target_dur * 30.0)),
            "cue_times": cue_times,
            "cue_frames": cue_frames,
            "chunks": chunk_metadata,
            "end_wipe_frame": int(round((target_dur - 2.8) * 30.0)),
        }

        print(f"  [OK] Generated {mp3_out.name} ({target_dur}s)")
        running_timeline_sec += target_dur

    manifest_path = output_dir / "dema_suite_audio_manifest_en.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (output_dir / "subtitles_en.srt").write_text("\n".join(global_srt_lines), encoding="utf-8")
    (output_dir / "subtitles_en.vtt").write_text("\n".join(global_vtt_lines), encoding="utf-8")

    print(f"\n[AUDIO COMPLETE] Manifest & Subtitles written to {output_dir}")
    return manifest_path


def main():
    parser = argparse.ArgumentParser(description="Build English audio suite with score bed and subtitles.")
    parser.add_argument("--out-dir", default=None, help="Directory to save generated audio and manifests")
    parser.add_argument("--voice", default="en-IN-PrabhatNeural", help="TTS voice name")
    args = parser.parse_args()

    out_dir = Path(args.out_dir) if args.out_dir else SKILL_ROOT / "outputs" / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)

    asyncio.run(build_suite_audio(out_dir, voice=args.voice))


if __name__ == "__main__":
    main()

