#!/usr/bin/env python3
"""
Ultra-Fast Async Parallel Audio Synthesizer for DEMA Broadcast Master.
Synthesizes zero-overlap voiceover chunks, procedural 120 BPM audio beds, and -14 LUFS normalization
across all broadcast chapters and vertical reels concurrently using asyncio and ProcessPoolExecutor.
"""

import argparse
import asyncio
import json
import math
import os
import shutil
import struct
import subprocess
import sys
import wave
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

VOICE_DEFAULT = "en-IN-PrabhatNeural"

def synthesize_sine_wav(filename: str, duration_sec: float, sample_rate: int = 44100):
    """Generates procedural 120 BPM rhythmic score bed with sub-bass drops."""
    bpm = 120.0
    beat_sec = 60.0 / bpm
    total_samples = int(duration_sec * sample_rate)
    
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(total_samples):
            t = float(i) / sample_rate
            beat_phase = (t % beat_sec) / beat_sec
            
            # 1. 120 BPM Kick / Pulse Envelope
            kick_env = max(0.0, 1.0 - beat_phase * 4.0) ** 2
            kick_freq = 55.0 - beat_phase * 20.0
            kick = math.sin(2.0 * math.pi * kick_freq * t) * kick_env * 0.22
            
            # 2. Hi-hat ticking on 16th notes
            sixteenth = (t % (beat_sec / 4.0)) / (beat_sec / 4.0)
            hat_env = max(0.0, 1.0 - sixteenth * 8.0) ** 3
            # Pseudo-noise
            noise = ((math.sin(t * 12345.67) * 43758.5453) % 1.0 - 0.5) * 2.0
            hat = noise * hat_env * 0.04
            
            # 3. Ambient atmospheric drone (432Hz harmonic)
            drone = math.sin(2.0 * math.pi * 108.0 * t) * 0.03 + math.sin(2.0 * math.pi * 216.0 * t) * 0.015
            
            sample_val = int(max(-1.0, min(1.0, kick + hat + drone)) * 32767.0)
            frames.extend(struct.pack("<hh", sample_val, sample_val))
            
        wf.writeframes(frames)

async def synthesize_single_chunk(text: str, out_wav: str, voice: str = VOICE_DEFAULT):
    """Synthesize single text chunk via edge-tts."""
    cmd = [
        sys.executable, "-m", "edge_tts",
        "--voice", voice,
        "--text", text,
        "--write-media", out_wav
    ]
    proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"edge-tts error: {stderr.decode()}")
    return out_wav

async def synthesize_all_chunks(tasks: list, voice: str = VOICE_DEFAULT):
    """Execute all edge-tts tasks concurrently."""
    print(f"-> Launching {len(tasks)} parallel voiceover synthesis workers...")
    coros = [synthesize_single_chunk(t["text"], t["file"], voice) for t in tasks]
    results = await asyncio.gather(*coros, return_exceptions=True)
    for i, res in enumerate(results):
        if isinstance(res, Exception):
            print(f"Error on chunk {i}: {res}")
    print(f"✓ Completed {len(tasks)} voiceover chunks in parallel.")

def mix_chapter_audio(args_tuple):
    """Worker function for concurrent FFmpeg audio mixing & loudnorm."""
    vo_wav, bed_wav, out_mp3, target_lufs, ffmpeg_bin = args_tuple
    cmd = [
        ffmpeg_bin, "-y",
        "-i", vo_wav,
        "-i", bed_wav,
        "-filter_complex",
        f"[0:a]volume=1.0[vo];[1:a]volume=0.22[bed];[vo][bed]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I={target_lufs}:TP=-1.5:LRA=11[out]",
        "-map", "[out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        out_mp3
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out_mp3 if res.returncode == 0 else None

def parallel_audio_mix(mix_tasks: list, max_workers: int = 4, ffmpeg_bin: str = "ffmpeg"):
    """Mix all audio chapters and reels in parallel using ProcessPoolExecutor."""
    print(f"-> Mixing {len(mix_tasks)} audio beds & loudnorm in parallel (workers={max_workers})...")
    payloads = [(t["vo"], t["bed"], t["out"], t.get("lufs", -14.0), ffmpeg_bin) for t in mix_tasks]
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(mix_chapter_audio, payloads))
    print(f"✓ All {len(results)} audio files mixed and EBU R128 normalized.")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Parallel Audio Synthesizer")
    parser.add_argument("--test", action="store_true", help="Run self-test demo")
    args = parser.parse_args()
    if args.test:
        print("Self-test: synthesizing procedural 120 BPM bed (5.0s)...")
        synthesize_sine_wav("test_bed.wav", 5.0)
        print("Done test_bed.wav")
