#!/usr/bin/env python3
"""
Audio Generator for Waaree Energies (WAAREEENER) Support/Resistance & Target Explainer (16:9 YouTube).
Synthesizes 6-beat zero-overlap narration, procedural 120 BPM financial score bed,
sub-bass drops, DEMA Intro & Outro concatenation, and generates time-shifted subtitles.
"""

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
VOICE = "en-IN-PrabhatNeural"

BASE_DIR = Path(__file__).resolve().parent
REMOTION_DIR = BASE_DIR / "modi-remotion"
PUBLIC_DATA = REMOTION_DIR / "public" / "data"
PUBLIC_AUDIO = REMOTION_DIR / "public" / "audio"
FFMPEG = str(REMOTION_DIR / "ffmpeg" / "ffmpeg-master-latest-win64-gpl" / "bin" / "ffmpeg.exe")
if not Path(FFMPEG).exists():
    FFMPEG = "ffmpeg"

TMP_DIR = BASE_DIR / "tmp_waaree_explainer_audio"
TMP_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)

CHUNKS = [
    {
        "id": "w0_master_rule",
        "phase": 0,
        "text": "Here is the golden trading rule for Waaree Energies at current market price 2,546 rupees. Any level below current price becomes support. Any level above becomes resistance and upward targets.",
    },
    {
        "id": "w1_val_poc",
        "phase": 1,
        "text": "During the corrective dip, price found solid demand at Value Area Low 2,278 rupees, and built a massive institutional accumulation shelf at the Monthly Point of Control at 2,316 rupees, absorbing over 1.09 million shares.",
    },
    {
        "id": "w2_dema50_100",
        "phase": 2,
        "text": "Surging off this Point of Control, expanding buy volume pushed Waaree above both the 50 DEMA at 2,358 and the 100 DEMA at 2,383 rupees. Because current price is above them, both now serve as dynamic support floors.",
    },
    {
        "id": "w3_dema20_200",
        "phase": 3,
        "text": "In a major milestone, price surged through the short-term 20 DEMA at 2,442 and reclaimed the critical 200 DEMA at 2,509 rupees. With Waaree trading at 2,546, this 200 DEMA is now our primary reclaimed support.",
    },
    {
        "id": "w4_vah",
        "phase": 4,
        "text": "Looking upward, because current price is below Value Area High at 2,584 rupees, it stands as the immediate overhead resistance hurdle and target one. A daily close above 2,584 confirms a Value Area expansion breakout.",
    },
    {
        "id": "w5_macro_target",
        "phase": 5,
        "text": "Sustained buy volume and fresh Open Interest above VAH unlock the macro swing target at 2,807 rupees. Keep 2,509 as your trailing dynamic defense line. Trade with the levels, confirm with volume.",
    },
]


async def generate_chunk_tts(text: str, out_wav: Path):
    mp3_tmp = out_wav.with_suffix(".mp3")
    comm = edge_tts.Communicate(text, VOICE, rate="+5%", pitch="+0Hz")
    for attempt in range(5):
        try:
            await comm.save(str(mp3_tmp))
            if mp3_tmp.exists() and mp3_tmp.stat().st_size > 100:
                break
        except Exception as e:
            if attempt == 4:
                raise e
            await asyncio.sleep(2.0)

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


def synth_procedural_bed_with_sfx(
    duration_sec: float,
    poc_hit_sec: float = 12.0,
    dema_test_sec: float = 28.0,
) -> np.ndarray:
    """120 BPM procedural electronic financial broadcast score bed + cinematic SFX."""
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

    # 6. Tension riser leading into DEMA test
    riser_start = max(0.0, dema_test_sec - 2.2)
    riser_t = np.clip((t - riser_start) / 2.2, 0, 1)
    riser = np.sin(2 * np.pi * (180.0 + riser_t * 620.0) * t) * riser_t * 0.075

    bed = whoosh + click + bass + kick + arp + riser
    fade_in = np.clip(t / 0.3, 0, 1)
    fade_out = np.clip((duration_sec - t) / 1.6, 0, 1)
    return bed * fade_in * fade_out


async def main():
    print("==================================================")
    print("SYNTHESIZING WAAREE ENERGIES EXPLAINER AUDIO (ZERO OVERLAP)")
    print("==================================================")

    raw_chunks = []
    for ch in CHUNKS:
        cid = ch["id"]
        out_wav = TMP_DIR / f"{cid}.wav"
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
        print(f"    -> Duration: {dur:.2f}s")

    # Dynamic sequential placement: NO OVERLAP GUARANTEED
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

    # Build speech track array
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

    # Procedural score bed
    poc_hit_sec = chunk_manifests[1]["start_sec"]
    dema_test_sec = chunk_manifests[3]["start_sec"]
    music_track = synth_procedural_bed_with_sfx(body_dur_sec, poc_hit_sec, dema_test_sec)

    # Mix
    mix_len = min(len(speech_track), len(music_track))
    mix = (speech_track[:mix_len] * 0.92) + (music_track[:mix_len] * 0.22)
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix = mix * (0.95 / peak)

    raw_wav = TMP_DIR / "waaree_explainer_body_raw.wav"
    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        stereo = np.column_stack((mix, mix))
        wf.writeframes((stereo * 32767).astype(np.int16).tobytes())

    # Loudnorm to -14 LUFS
    body_mp3 = TMP_DIR / "waaree_explainer_body_14lufs.mp3"
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

    # Concatenate with Intro & Outro
    intro_mp3 = PUBLIC_AUDIO / "dema_intro_sting.mp3"
    outro_mp3 = PUBLIC_AUDIO / "dema_outro_bed.mp3"
    INTRO_SEC = 3.50
    INTRO_FRAMES = 105
    OUTRO_SEC = 5.00
    OUTRO_FRAMES = 150

    final_master_mp3 = PUBLIC_AUDIO / "waaree_explainer_master.mp3"
    suite_audio_copy = BASE_DIR / "DEMA_Daily_Suite_20261113" / "03_Audio" / "waaree_explainer_master.mp3"
    suite_audio_copy.parent.mkdir(parents=True, exist_ok=True)

    print(f"\n>>> Concatenating Intro ({INTRO_SEC}s) + Body ({body_dur_sec:.2f}s) + Outro ({OUTRO_SEC}s)...")
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
    shutil.copy2(final_master_mp3, suite_audio_copy)

    # Subtitles (.srt and .vtt) with +3.50s time shift
    srt_path = BASE_DIR / "waaree_explainer_subtitles.srt"
    vtt_path = BASE_DIR / "waaree_explainer_subtitles.vtt"

    def fmt_srt(t):
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = int(t % 60)
        ms = int(round((t - int(t)) * 1000))
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    def fmt_vtt(t):
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = int(t % 60)
        ms = int(round((t - int(t)) * 1000))
        return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

    srt_lines = []
    vtt_lines = ["WEBVTT", ""]
    for i, cm in enumerate(chunk_manifests, start=1):
        s_shifted = cm["start_sec"] + INTRO_SEC
        e_shifted = cm["end_sec"] + INTRO_SEC
        srt_lines.append(f"{i}\n{fmt_srt(s_shifted)} --> {fmt_srt(e_shifted)}\n{cm['text']}\n")
        vtt_lines.append(f"{i}\n{fmt_vtt(s_shifted)} --> {fmt_vtt(e_shifted)}\n{cm['text']}\n")

    srt_path.write_text("\n".join(srt_lines), encoding="utf-8")
    vtt_path.write_text("\n".join(vtt_lines), encoding="utf-8")
    shutil.copy2(srt_path, BASE_DIR / "DEMA_Daily_Suite_20261113" / "01_Videos" / "waaree_explainer_subtitles.srt")
    shutil.copy2(vtt_path, BASE_DIR / "DEMA_Daily_Suite_20261113" / "01_Videos" / "waaree_explainer_subtitles.vtt")

    # Shifted cues for Full Video (accounting for 105-frame / 3.5s Intro)
    total_video_frames = INTRO_FRAMES + body_frames + OUTRO_FRAMES
    full_cues = [c + INTRO_FRAMES for c in cue_frames]

    manifest_data = {
        "stock": "WAAREEENER",
        "ticker": "WAAREEENER-EQ",
        "exchange": "NSE",
        "cmp": 2546.00,
        "levels": {
            "macro_high": 2807.15,
            "vah": 2584.28,
            "cmp": 2546.00,
            "dema200": 2509.55,
            "dema20": 2442.80,
            "dema100": 2383.30,
            "dema50": 2358.55,
            "poc": 2316.44,
            "poc_volume": "1.09M",
            "val": 2278.18,
        },
        "intro_sec": INTRO_SEC,
        "intro_frames": INTRO_FRAMES,
        "body_dur_sec": round(body_dur_sec, 2),
        "body_frames": body_frames,
        "outro_sec": OUTRO_SEC,
        "outro_frames": OUTRO_FRAMES,
        "total_video_frames": total_video_frames,
        "total_duration_sec": round(INTRO_SEC + body_dur_sec + OUTRO_SEC, 2),
        "body_cue_frames": cue_frames,
        "full_cue_frames": full_cues,
        "end_wipe_frame": end_wipe_frame,
        "chunks": chunk_manifests,
        "body_chunks": chunk_manifests,
    }

    manifest_file = PUBLIC_DATA / "waaree_explainer_manifest.json"
    manifest_file.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")
    shutil.copy2(manifest_file, BASE_DIR / "waaree_explainer_manifest.json")

    print("\n==================================================")
    print("SUCCESS! WAAREE AUDIO GENERATION COMPLETE")
    print(f"Master MP3:  {final_master_mp3}")
    print(f"Body Frames: {body_frames} ({body_dur_sec:.2f}s)")
    print(f"Total Video: {total_video_frames} frames ({manifest_data['total_duration_sec']}s)")
    print(f"Cue Frames:  {cue_frames}")
    print(f"Manifest:    {manifest_file}")
    print(f"Subtitles:   {srt_path} | {vtt_path}")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(main())
