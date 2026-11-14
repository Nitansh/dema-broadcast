# Broadcast Audio & Procedural Sound Design Doctrine

The audio landscape for the DEMA Broadcast Master combines crystal-clear neural voiceover with an algorithmic financial score bed, tactile physical foley, and specialized sound design for viral short-form reels.

---

## 1. Narration Engine (`edge_tts`)

* **Default Voice:** `en-IN-PrabhatNeural`
  - Articulate, authoritative, and internationally clear Indian English financial broadcast delivery.
  - Recommended rate: `rate="+4%"` to `rate="+5%"` to match television newsroom cadence (~155-165 words per minute).
  - Alternative voices: `en-US-AndrewMultilingualNeural`, `en-GB-RyanNeural`.
* **Phonetic & Financial Nuances:**
  - Say numbers in full words for TTS clarity: "twenty-five thousand one hundred forty-four point thirty" rather than "25144.30".
  - Spell acronyms with periods or spaces when needed: "D-E-M-A" or "DEMA".
  - SEBI pronounced as "Say-bee".
  - Rupee values formatted as "four thousand one hundred sixteen rupees".

---

## 2. Zero Voice Overlap Engine (Dynamic Sequential Placement)

### The Defect of Static Timestamps
In complex multi-beat scripts, hardcoding speech cue timestamps (e.g. `0.8s, 8.5s, 18.0s, 27.5s`) inevitably causes audio collision defects whenever actual synthesized audio duration exceeds the allocated slot (e.g., an 11.2s sentence starting at `0.8s` continues playing until `12.0s`, colliding directly with beat 2 starting at `8.5s`).

### The Dynamic Sequential Formula
The `build_reel_audio.py` engine computes sequential placement dynamically by measuring actual WAV sample durations:

```python
start_sec[0] = LEAD_IN_SEC  # 0.50s
end_sec[0]   = start_sec[0] + wav_duration[0]

for i in range(1, len(chunks)):
    start_sec[i] = end_sec[i - 1] + INTER_CHUNK_PAUSE_SEC  # 0.45s to 0.50s
    end_sec[i]   = start_sec[i] + wav_duration[i]
```

This guarantees **zero audio overlap**, deterministic frame cues (`start_frame = round(start_sec * 30)`), and seamless sentence pacing.

---

## 3. Algorithmic Opuscar 120 BPM Score Bed & Cinematic SFX

Synthesized programmatically in Python using `numpy` and `scipy.signal` (`build_audio.py` / `build_reel_audio.py`):

1. **Sub-Bass Fundamental:**
   - 120 BPM quarter-note pulses (0.5s period).
   - Frequency: 55.0 Hz (A1) fundamental with fast exponential decay (`np.exp(-t * 8.0)`).
2. **Deep 45 Hz Sub-Bass Drop (POC Impact):**
   - Synthesized at the exact timestamp of Point of Control volume absorption:
     $$\text{sub\_impact}(t) = 1.8 \cdot \exp\left(-\frac{t - t_{\text{poc}}}{0.75}\right) \cdot \sin(2\pi \cdot 45.0 \cdot t)$$
   - Provides physical visceral feedback through headphones and phone speakers.
3. **Opening Shutter Snap & Whoosh (0.0s – 0.6s):**
   - White noise shaped with fast exponential envelope (`exp(-t / 0.18)`), layered with an 1800 Hz transient click (`exp(-t / 0.008)`).
4. **Tension Riser (Pre-Breakout / DEMA Test):**
   - Exponential frequency sweep from 180 Hz to 800 Hz over 2.2s preceding critical moving average tests.
5. **Arpeggio Synthesizer (A Minor Pentatonic):**
   - High-register arpeggio notes (`440, 523.25, 659.25, 783.99 Hz`) operating on sixteenth notes (`beat_sec / 4.0`) to keep viewer momentum high.

---

## 4. Multi-Act Audio Concatenation Pipeline (Intro + Body + Outro)

Vertical reels assemble a 3-act master audio track using FFmpeg filter-complex:

```bash
ffmpeg -y \
  -i dema_intro_sting.mp3 \
  -i symbol_body_14lufs.mp3 \
  -i dema_outro_bed.mp3 \
  -filter_complex \
    "[0:a]atrim=0:3.50,asetpts=PTS-STARTPTS[a0]; \
     [1:a]atrim=0:55.87,asetpts=PTS-STARTPTS[a1]; \
     [2:a]atrim=0:5.00,asetpts=PTS-STARTPTS,afade=t=out:st=3.5:d=1.5[a2]; \
     [a0][a1][a2]concat=n=3:v=0:a=1[aout]" \
  -map "[aout]" -b:a 256k -ar 48000 symbol_master_complete.mp3
```

---

## 5. Mixing & Loudness Standards

* **Master 16:9 Broadcast Suite:**
  - Integrated Loudness: **`-19.0 LUFS`** (EBU R128 TV broadcast target).
  - True Peak Ceiling: **`-2.0 dBFS`**.
* **9:16 Vertical Viral Reels (Shorts / Reels / TikTok):**
  - Integrated Loudness: **`-14.0 LUFS`** (Optimized for mobile speakers & social media algorithms).
  - True Peak Ceiling: **`-1.5 dBFS`**.
* **Export Specifications:**
  - 48,000 Hz sample rate, 2-channel stereo, 256 kbps AAC or 320 kbps MP3.
