#!/usr/bin/env python3
"""
DEMA Broadcast Master — Vertical Reel Audio Generator
Production pipeline for synthesizing non-overlapping voiceover, procedural 120 BPM score bed,
sub-bass chart impact SFX, DEMA Intro & Outro audio track concatenation, and time-aligned subtitles.

Features:
- Guaranteed zero voice overlap via dynamic sequential chunk scheduling
- Procedural 120 BPM score bed with sub-bass drop on POC impact & tension riser on DEMA hurdle
- Automated concatenation of DEMA Intro Sting (3.5s) and DEMA Outro Bed (5.0s)
- EBU R128 Loudness Normalization to -14 LUFS
- Generates frame-accurate JSON manifest, .srt, and .vtt subtitles
"""

import argparse
import asyncio
import json
import math
import os
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


async def generate_chunk_tts(text: str, out_wav: Path, voice: str = DEFAULT_VOICE, rate: str = "+5%", ffmpeg: str = "ffmpeg"):
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
            await asyncio.sleep(2.0)

    # Convert to 48kHz WAV mono
    subprocess.run(
        [
            ffmpeg, "-y",
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


def synth_procedural_bed_with_sfx(
    duration_sec: float,
    poc_hit_sec: float = 12.0,
    dema_test_sec: float = 24.0,
) -> np.ndarray:
    """120 BPM procedural electronic financial broadcast score bed + cinematic SFX."""
    samples = int(math.ceil(duration_sec * SR))
    t = np.linspace(0, duration_sec, samples, endpoint=False)
    bpm = 120.0
    beat_sec = 60.0 / bpm  # 0.5s per beat

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

    # 3. Deep 45 Hz sub-bass drop on POC absorption impact
    sub_impact = np.where(
        (t >= poc_hit_sec - 0.1) & (t <= poc_hit_sec + 2.5),
        1.8 * np.exp(-((t - poc_hit_sec) / 0.75)),
        0.0
    )
    bass = np.sin(2 * np.pi * bass_freq * t) * (bass_env * 0.20 + sub_impact * 0.40)

    # 4. Kick pulse on beat 1 & 3
    kick_pulse = np.exp(-((t % (beat_sec * 2)) / 0.08)) * np.sin(2 * np.pi * 65.0 * np.exp(-t * 2.5) * t)
    kick = kick_pulse * 0.16

    # 5. Arpeggio synth (A minor / Pentatonic: 440, 523.25, 659.25, 783.99)
    arp_notes = [440.0, 523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25]
    step_sec = beat_sec / 4.0
    note_idx = (t / step_sec).astype(int) % len(arp_notes)
    arp_freqs = np.array([arp_notes[i] for i in note_idx])
    arp_env = np.exp(-((t % step_sec) / 0.05))
    arp = np.sin(2 * np.pi * arp_freqs * t) * arp_env * 0.065

    # 6. Tension riser leading into DEMA test
    riser_start = max(0.0, dema_test_sec - 2.2)
    riser_t = np.clip((t - riser_start) / 2.2, 0, 1)
    riser = np.sin(2 * np.pi * (180.0 + riser_t * 620.0) * t) * riser_t * 0.075

    bed = whoosh + click + bass + kick + arp + riser
    fade_in = np.clip(t / 0.3, 0, 1)
    fade_out = np.clip((duration_sec - t) / 1.6, 0, 1)
    return bed * fade_in * fade_out


async def build_reel_audio(
    chunks: list,
    out_dir: Path,
    symbol: str = "CUMMINSIND",
    include_intro_outro: bool = True,
    intro_mp3: Path = None,
    outro_mp3: Path = None,
    ffmpeg: str = "ffmpeg",
    voice: str = DEFAULT_VOICE,
):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = out_dir / f"tmp_{symbol.lower()}_audio"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print(f"BUILDING REEL AUDIO: {symbol} (Zero Overlap Engine)")
    print("=" * 60)

    # 1. Synthesize chunks
    raw_chunks = []
    for ch in chunks:
        cid = ch["id"]
        out_wav = tmp_dir / f"{cid}.wav"
        print(f"  Synthesizing chunk '{cid}'...")
        await generate_chunk_tts(ch["text"], out_wav, voice=voice, ffmpeg=ffmpeg)
        dur = get_wav_duration(out_wav)
        with wave.open(str(out_wav), "rb") as wf:
            n = wf.getnframes()
            data = wf.readframes(n)
            s_arr = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
        raw_chunks.append({
            "id": cid,
            "text": ch["text"],
            "phase": ch.get("phase", 0),
            "dur": dur,
            "samples": s_arr,
        })
        print(f"    -> Duration: {dur:.2f}s")

    # 2. Dynamic sequential placement with zero overlap
    LEAD_IN_SEC = 0.50
    INTER_CHUNK_PAUSE_SEC = 0.45
    POST_SPEECH_SEC = 2.50

    current_time = LEAD_IN_SEC
    chunk_manifests = []
    cue_frames = []

    for i, rc in enumerate(raw_chunks):
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
        print(f"  [Phase {rc['phase']}] {start_sec:.2f}s -> {end_sec:.2f}s (frames {start_frame} -> {end_frame})")
        current_time = end_sec + INTER_CHUNK_PAUSE_SEC

    body_dur_sec = current_time - INTER_CHUNK_PAUSE_SEC + POST_SPEECH_SEC
    body_frames = int(round(body_dur_sec * FPS))
    end_wipe_frame = chunk_manifests[-1]["end_frame"] + 15

    # 3. Build speech track array
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

    # 4. Synthesize procedural bed
    poc_hit_sec = chunk_manifests[min(2, len(chunk_manifests) - 1)]["start_sec"]
    dema_test_sec = chunk_manifests[min(3, len(chunk_manifests) - 1)]["start_sec"]
    music_track = synth_procedural_bed_with_sfx(body_dur_sec, poc_hit_sec, dema_test_sec)

    # 5. Mix & Normalize
    mix_len = min(len(speech_track), len(music_track))
    mix = (speech_track[:mix_len] * 0.92) + (music_track[:mix_len] * 0.22)
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix = mix * (0.95 / peak)

    raw_wav = tmp_dir / f"{symbol.lower()}_body_raw.wav"
    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        stereo = np.column_stack((mix, mix))
        wf.writeframes((stereo * 32767).astype(np.int16).tobytes())

    body_mp3 = out_dir / f"{symbol.lower()}_body_14lufs.mp3"
    subprocess.run(
        [
            ffmpeg, "-y",
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

    # 6. Concatenate with Intro & Outro if requested
    INTRO_SEC = 3.50 if include_intro_outro and intro_mp3 and intro_mp3.exists() else 0.0
    INTRO_FRAMES = int(round(INTRO_SEC * FPS))
    OUTRO_SEC = 5.00 if include_intro_outro and outro_mp3 and outro_mp3.exists() else 0.0
    OUTRO_FRAMES = int(round(OUTRO_SEC * FPS))

    final_master_mp3 = out_dir / f"{symbol.lower()}_master_complete.mp3"
    if include_intro_outro and intro_mp3 and intro_mp3.exists() and outro_mp3 and outro_mp3.exists():
        print(f"\n>>> Concatenating Intro ({INTRO_SEC}s) + Body ({body_dur_sec:.2f}s) + Outro ({OUTRO_SEC}s)...")
        filter_str = (
            f"[0:a]atrim=0:{INTRO_SEC},asetpts=PTS-STARTPTS[a0]; "
            f"[1:a]atrim=0:{body_dur_sec:.2f},asetpts=PTS-STARTPTS[a1]; "
            f"[2:a]atrim=0:{OUTRO_SEC},asetpts=PTS-STARTPTS,afade=t=out:st={OUTRO_SEC - 1.5}:d=1.5[a2]; "
            f"[a0][a1][a2]concat=n=3:v=0:a=1[aout]"
        )
        cmd = [
            ffmpeg, "-y",
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
    else:
        shutil.copy2(body_mp3, final_master_mp3)

    # 7. Subtitles (.srt and .vtt) with time-shift accounting for intro
    srt_path = out_dir / f"{symbol.lower()}_subtitles.srt"
    vtt_path = out_dir / f"{symbol.lower()}_subtitles.vtt"

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

    # 8. Complete Manifest
    total_dur_sec = round(INTRO_SEC + body_dur_sec + OUTRO_SEC, 2)
    total_frames = INTRO_FRAMES + body_frames + OUTRO_FRAMES

    manifest_data = {
        "title": f"{symbol} DEMA Motion Breakdown (Viral Social Reel)",
        "symbol": symbol,
        "intro_frames": INTRO_FRAMES,
        "body_frames": body_frames,
        "outro_frames": OUTRO_FRAMES,
        "total_frames_30fps": total_frames,
        "total_duration_sec": total_dur_sec,
        "cue_frames": [f + INTRO_FRAMES for f in cue_frames],
        "end_wipe_frame": end_wipe_frame + INTRO_FRAMES,
        "audio_file": final_master_mp3.name,
        "chunks": shifted_chunks,
    }

    manifest_path = out_dir / f"{symbol.lower()}_manifest.json"
    manifest_path.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")

    print("\n" + "=" * 60)
    print(f"SUCCESS! Output: {final_master_mp3}")
    print(f"Total Duration: {total_dur_sec}s ({total_frames} frames @ 30fps)")
    print(f"Subtitles: {srt_path.name} | {vtt_path.name}")
    print(f"Manifest: {manifest_path.name}")
    print("=" * 60)
    return manifest_data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build zero-overlap audio for DEMA vertical reels")
    parser.add_argument("--symbol", default="CUMMINSIND", help="Stock ticker symbol")
    parser.add_argument("--out-dir", default="outputs/audio", help="Output directory")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="TTS voice")
    parser.add_argument("--no-intro-outro", action="store_true", help="Exclude DEMA Intro and Outro stings")
    args = parser.parse_args()

    default_chunks = [
        {
            "id": "c0_hook",
            "phase": 0,
            "text": f"Big institutions just absorbed massive volume in {args.symbol}. Here is the exact level they defended.",
        },
        {
            "id": "c1_cascade",
            "phase": 1,
            "text": "A sharp multi-week liquidation cascade breached every key moving average, driving price straight toward the lower value boundary.",
        },
        {
            "id": "c2_poc_impact",
            "phase": 2,
            "text": "Until absorbing heavy institutional demand right at the Monthly Point of Control, with explosive volume confirming the floor.",
        },
        {
            "id": "c3_dema_test",
            "phase": 3,
            "text": "The spring recoil reclaimed the twenty DEMA, surging strongly into the critical fifty DEMA hurdle.",
        },
        {
            "id": "c4_verdict",
            "phase": 4,
            "text": "A decisive breakout above key resistance unlocks the Value Area High corridor. Follow the levels, manage your risk.",
        },
    ]

    intro = Path(r"c:\VideoGen\web motion\claude\Thales\modi-remotion\public\audio\dema_intro_sting.mp3")
    outro = Path(r"c:\VideoGen\web motion\claude\Thales\modi-remotion\public\audio\dema_outro_bed.mp3")

    asyncio.run(
        build_reel_audio(
            chunks=default_chunks,
            out_dir=Path(args.out_dir),
            symbol=args.symbol,
            include_intro_outro=not args.no_intro_outro,
            intro_mp3=intro,
            outro_mp3=outro,
            voice=args.voice,
        )
    )
