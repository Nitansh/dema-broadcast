---
name: dema-broadcast-master
description: Production pipeline for daily DEMA financial broadcasts and viral reels (16:9 full-screen newsroom suite, 9:16 high-retention viral reels, zero-overlap synthesized voiceover, procedural 120 BPM score bed, DEMA Intro & Outro stings, kinetic word-by-word karaoke captions, split-flap telemetry, and automated FFmpeg AV muxing). Use when asked to generate daily market broadcasts, create viral 9:16 stock reels, execute motion doctrine technical breakdowns, or replicate the DEMA master video templates.
version: 2.0.0
---

# DEMA Broadcast Master: Dual-Format Financial Video & Viral Reels Pipeline

Create institutional-grade **16:9 Master Financial Broadcasts** and **9:16 Viral Social Reels** from daily technical chart studies and post-market telemetry data. This skill packages the end-to-end production workflow: daily data validation, zero-overlap synthesized voiceover, procedural 120 BPM newsroom score synthesis, physical foley & sub-bass drops, branded DEMA Intro (3.5s) & Outro (5.0s) integration, kinetic word-by-word karaoke captions, hardware-accelerated Remotion rendering, automated FFmpeg AV muxing, and interactive web playback.

---

## 1. When to Use This Skill

Activate this skill whenever the user asks to:
- "Generate today's DEMA analysis video" or "make daily market broadcast"
- "Create a viral 9:16 reel for a stock" (e.g. Cummins India, Coal India, Adani Power)
- "Apply motion-doctrine on a stock chart" or "make technical breakdown reel"
- "Add DEMA intro and outro to the video"
- "Produce 16:9 financial newsroom broadcast with split-flap board and charts"
- "Fix voice overlap in video audio" or "render batch vertical reels"
- "Update the daily market data and export full video suite"

---

## 2. Dual-Format Production Matrix

| Feature | 16:9 Master Television Broadcast | 9:16 Viral Social Reels (Shorts/Reels/TikTok) |
|---|---|---|
| **Resolution** | `1920 × 1080` (Horizontal 16:9) | `1080 × 1920` (Vertical 9:16) |
| **Frame Rate** | 30.00 fps | 30.00 fps |
| **Narrative Structure** | 5 Acts (~3m 34s to 25m) | 3 Acts (`DemaIntro` 3.5s + Breakdown Core + `DemaOutro` 5.0s) |
| **Audio Engine** | `build_audio.py` (5 chapters, procedural bed, foley) | `build_reel_audio.py` (Zero-overlap dynamic scheduling, SFX) |
| **Loudness Spec** | EBU R128 `-19.0 LUFS` (Peak: `-2.0 dBFS`) | EBU R128 `-14.0 LUFS` (Peak: `-1.5 dBFS`) |
| **Caption Overlay** | `BroadcastCaptionOverlay` (10-word sliding window, `bottom: 122px`) | `KineticBroadcastCaptions` (7-word sliding window, `bottom: 240px`) |
| **Visual Hooks** | Split-flap mechanical board, global macro split-cards | `IntroZoom` (1.09x -> 1.0x), white `FlashCut`, conic gradient rims |
| **Render Script** | `scripts/render_broadcast.py` | `scripts/render_reels.py` |

---

## 3. The 6-Pillar Engagement Formula (Vertical Reels)

All DEMA vertical reels combine six specialized motion and retention frameworks:

1. **`viral-hooks` (First 3-Second Retention Trigger)**
   - Opens immediately with institutional volume or high-stakes level defense: *"Big institutions just absorbed 1.1 million shares in Cummins India..."*
   - Avoids generic welcomes; engages the viewer's curiosity in Frame 1.
2. **`remotion-kinetic-kit` (High-Energy Visual Dynamics)**
   - `IntroZoom`: Decelerates from 1.09x to 1.0x over the first 24 frames to establish immediate visual depth.
   - White `FlashCut`: 1-frame to 2-frame opacity flash on major chart cuts to reset cognitive attention.
3. **`motion-doctrine` (Continuous Causal Camera Motion)**
   - The camera acts as a single continuous lens tracking price momentum.
   - Downward slide (-Y) tracks liquidation selling cascades.
   - **16px Physical Recoil**: Squash-and-bounce spring recoil upon hitting structural POC floor.
   - Forward drive (+Z) zooms into moving average hurdles (e.g. 50 DEMA / 200 DEMA).
   - **Stillness-Before-Climax**: 0.45s hold before major level breakout or target reveal.
4. **`reel-css-animations` (Hardware-Accelerated Glow & Radar UI)**
   - Rotating conic gradient rim (`#10B981`, `#22D3EE`, `#F2CF1D`) behind live quote badges.
   - Multi-tier neon golden floor (`box-shadow` diffusion) highlighting Point of Control defense.
   - Expanding sonar radar pulse rings centered on institutional volume spike candles.
5. **`captions-overlay` (Word-by-Word Kinetic Karaoke & 3D Typography)**
   - 7-word sliding window anchored at `bottom: 240px` with active-word gold pop pill (`#F2CF1D`, scale 1.10).
   - Large translucent 3D watermark climax words (`ACCUMULATION`, `LIQUIDATION`, `ABSORPTION`, `BREAKOUT`) composited behind the chart plane.
6. **`glassmorphism` (Obsidian Technical Finishes)**
   - Dark obsidian frosted capsules (`rgba(9, 13, 20, 0.94)`) with 20px blur, 1.5px gold borders, and subtle top specular highlights.

---

## 4. Quickstart Production Runbooks

### Runbook A: 9:16 Viral Reel Production (e.g. Cummins India)

#### Step 1: Synthesize Zero-Overlap Audio & Time-Shifted Subtitles
Generates non-overlapping narration, 120 BPM procedural bed, 45Hz sub-bass impact, concatenates Intro (3.5s) & Outro (5.0s), and outputs `.srt`, `.vtt`, and `.json` manifest:
```bash
python .agents/skills/dema-broadcast-master/scripts/build_reel_audio.py --symbol "CUMMINSIND" --out-dir "outputs/audio"
```

#### Step 2: Render & Mux Vertical Reel (Remotion + FFmpeg)
Renders Remotion composition with hardware acceleration, muxes the 14 LUFS master audio track, and probes output metrics:
```bash
# Render single reel (e.g. Cummins India Motion Doctrine)
python .agents/skills/dema-broadcast-master/scripts/render_reels.py --reel cummins --out-dir "outputs/reels"

# Or batch render all 10 daily market reels
python .agents/skills/dema-broadcast-master/scripts/render_reels.py --all --concurrency 4 --out-dir "outputs/reels"
```

---

### Runbook B: 16:9 Master Television Broadcast

#### Step 1: Validate Daily Market Telemetry
```bash
python .agents/skills/dema-broadcast-master/scripts/validate_market_data.py path/to/daily_market_data.json
```

#### Step 2: Synthesize Broadcast Audio Suite
Synthesizes English narration across all 5 acts, 120 BPM procedural score bed, tactile split-flap foley, and auto-generates `.srt` and `.vtt`:
```bash
python .agents/skills/dema-broadcast-master/scripts/build_audio.py --voice "en-IN-PrabhatNeural" --out-dir "outputs/audio"
```

#### Step 3: Render & Concatenate Master 16:9 Video
Renders the 5 chapters with Remotion concurrency, muxes audio, and stitches the continuous master broadcast:
```bash
python .agents/skills/dema-broadcast-master/scripts/render_broadcast.py --concurrency 4 --audio-dir "outputs/audio" --out-dir "outputs/videos"
```

#### Step 4: Preview on Interactive Web Player
```bash
python -m http.server 8080
```
Open: `http://localhost:8080/master-video-player.html`

---

## 5. Directory Structure & Key Assets

```text
.agents/skills/dema-broadcast-master/
├── SKILL.md                          # Master instruction manual
├── README.md                         # Public repository documentation
├── scripts/
│   ├── build_audio.py                # 16:9 TTS + 120 BPM score bed + foley + auto-SRT/VTT generator
│   ├── build_reel_audio.py           # 9:16 Zero-overlap TTS engine + SFX + Intro/Outro concatenation
│   ├── render_broadcast.py           # 16:9 Remotion concurrency render + FFmpeg muxing + concat
│   ├── render_reels.py               # 9:16 Vertical reels renderer (single & batch) + FFmpeg muxing
│   └── validate_market_data.py       # JSON schema validator for daily telemetry
├── templates/
│   ├── CumminsYouTubeExplainer16x9.jsx # 16:9 Full Widescreen YouTube Video (Chart + Sidebar Level Matrix)
│   ├── CumminsExplainerReel.jsx      # 9:16 Support, Resistance & Target Masterclass (Full chart + DEMA 20/50/100/200)
│   ├── CumminsMotionDoctrineReel.jsx # 3-Act Next-Gen Cummins Reel with Intro, Outro & 6-Pillar motion
│   ├── DemaIntro.jsx                 # Master DEMA branded intro sting (3.5s / 105 frames @ 30fps)
│   ├── DemaOutro.jsx                 # Master DEMA responsive outro end card (5.0s / 150 frames @ 30fps)
│   ├── DemaVerticalReels.jsx         # 10 Standalone 9:16 vertical reels for daily market stocks
│   ├── SharedNewsPackage.jsx         # Core UI atoms: KineticBroadcastCaptions, SplitFlapChar, Straps
│   ├── DemaMasterChapters.jsx        # Complete 5-act broadcast Remotion component
│   ├── DemaMasterRoot.jsx            # Remotion composition root configuration
│   ├── brand.json                    # Canonical brand tokens (colors, fonts, metadata, handles)
│   └── master-video-player.html      # Interactive web video player with WebVTT CC support
├── schemas/
│   ├── market_data_schema.json       # JSON Schema definition for daily market telemetry
│   └── sample_market_data.json       # Example daily market data (indices, commodities, stocks)
└── references/
    ├── broadcast-doctrine.md         # 16:9 and 9:16 screen geometry, safe zones, 6-pillar engagement
    ├── sound-design.md               # Zero voice overlap engine, 120 BPM procedural formulas, loudness
    └── caption-system.md             # Kinetic word-by-word karaoke specs, time-shifted subtitles
```

---

## 6. Verification Checklist

Before publishing or delivering any generated video:
- [ ] **Zero Voice Overlap**: Confirm sequential chunks have `start_sec[i] >= end_sec[i-1] + 0.45s`.
- [ ] **Audio Loudness**: Verify with FFprobe/FFmpeg:
  - 16:9 Broadcast: integrated loudness ~ `-19 LUFS` (peak < `-2.0 dBFS`).
  - 9:16 Vertical Reel: integrated loudness ~ `-14 LUFS` (peak < `-1.5 dBFS`).
- [ ] **3-Act Structure**: Verify vertical reels include `DemaIntro` (3.5s), Technical Core, and `DemaOutro` (5.0s).
- [ ] **Subtitles**: Verify `.srt` and `.vtt` timestamps match spoken audio and account for intro offsets.
- [ ] **Visual Proof**: Ensure active-word karaoke pop pill (`#F2CF1D`) is legible without covering key chart levels.
