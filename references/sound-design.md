# Broadcast Audio & Procedural Sound Design Doctrine

The audio landscape for the DEMA Broadcast Master combines crystal-clear neural voiceover with an algorithmic financial score bed and tactile physical foley.

---

## 1. Narration Engine (`edge_tts`)

* **Default Voice:** `en-IN-PrabhatNeural`
  - Articulate, authoritative, and internationally clear Indian English financial broadcast delivery.
  - Recommended rate: `rate="+4%"` to match television newsroom cadence (~155-165 words per minute).
  - Alternative voices: `en-US-AndrewMultilingualNeural`, `en-GB-RyanNeural`.
* **Phonetic & Financial Nuances:**
  - Say numbers in full words for TTS clarity: "twenty-five thousand one hundred forty-four point thirty" rather than "25144.30".
  - Spell acronyms with periods or spaces when needed: "D-E-M-A" or "DEMA".
  - SEBI pronounced as "Say-bee".

---

## 2. Algorithmic Opuscar 120 BPM Score Bed

Synthesized programmatically in Python using `numpy` and `scipy.signal` (`sfx.py` / `build_audio.py`):

1. **Sub-Bass Pulse:**
   - 120 BPM quarter-note pulses (0.5s period).
   - Frequency cycle: 55.0 Hz (A1) -> 49.0 Hz (G1) -> 58.27 Hz (Bb1).
   - Fast exponential decay (`np.exp(-t * 8.0)`) with 2nd harmonic overtone for laptop speaker audibility.
2. **Warm Analog Synth Chords:**
   - Bar-length lush chords (4 beats = 2.0s duration).
   - Frequencies:
     - A minor: `[110.0, 130.81, 164.81]`
     - G major: `[98.00, 123.47, 146.83]`
     - Bb major: `[116.54, 138.59, 174.61]`
   - Decay rate: `0.9` for sustained cinematic atmosphere.
3. **The "1-Beat Silence Drop" (Dramatic Tension Cut):**
   - 0.5s window of absolute silence on the bed track immediately preceding key inflection points.
   - 60ms linear crossfade in and out to prevent speaker popping.
   - Leaves voice in stark, hyper-focused dry acoustic space before kicking the beat back in with a sub-impact.

---

## 3. Physical & Foley Sound Elements

* **Split-Flap Mechanical Flutter:**
  - Synthesized via high-frequency transient: 1250 Hz damped sine wave (`exp(-t * 70)`) layered with sharp white noise pulse (`exp(-t * 90)`).
  - Fires in synchronization with character flip transitions on the board.
* **Whoosh Wipes:**
  - Bandpassed noise (4th order Butterworth filter between 600 Hz and 2800 Hz).
  - Hanning-style sine-squared envelope (`sin(pi * t / dur)**2`).
  - Fires at act boundaries and major section card slides.
* **Sub-Bass Stings:**
  - Pitch drop from 65 Hz down to 32 Hz over 1.2s with exponential decay.
  - Layered with high-register major triad chord (`[220, 277, 329, 440] Hz`) for punch.

---

## 4. Mixing & Loudness Standards

```text
Final Mix = (Bed & Foley * 0.70) + (Voice Bus * 1.15)
```

* **Integrated Loudness:** `-19.0 LUFS` (broadcast target).
* **Peak Ceiling:** `-3.2 dBFS` (guarantees zero digital clipping or inter-sample clipping).
* **Export Specs:** 48,000 Hz, 16-bit / 24-bit PCM WAV master, 256 kbps AAC MP4 stream.

