---
name: dema-broadcast-master
description: Production pipeline for daily DEMA financial broadcasts, viral reels, and full stock explainer video suites (16:9 full-screen newsroom suite, 16:9 widescreen YouTube technical masterclass, 9:16 high-retention viral reels, zero-overlap synthesized voiceover, procedural 120 BPM score bed, DEMA Intro & Outro stings, kinetic word-by-word karaoke captions, split-flap telemetry, and automated FFmpeg AV muxing). Use when asked to generate daily market broadcasts, create viral 9:16 stock reels, render full explainer videos for any chart-attached stock (Cummins, Coal India, IIFL, Blue Star, ABB), execute motion doctrine technical breakdowns, or replicate the DEMA master video templates.
version: 2.1.0
---

# DEMA Broadcast Master: Dual-Format Financial Video & Stock Explainer Pipeline

Create institutional-grade **16:9 Master Financial Broadcasts**, **16:9 Widescreen Technical Masterclasses**, and **9:16 Viral Social Reels** from daily technical chart studies and market telemetry data. This skill packages the end-to-end production workflow: daily data validation, zero-overlap synthesized voiceover, procedural 120 BPM newsroom score synthesis, physical foley & sub-bass drops, branded DEMA Intro (3.5s) & Outro (5.0s) integration, kinetic word-by-word karaoke captions, hardware-accelerated Remotion rendering, automated FFmpeg AV muxing, and interactive web playback.

---

## 1. When to Use This Skill

Activate this skill whenever the user asks to:
- "Generate today's DEMA analysis video" or "make daily market broadcast"
- "Create a viral 9:16 reel for a stock" (e.g. Cummins India, Coal India, IIFL Cap, Blue Star, ABB, Waaree)
- "Render full explainer video like Cummins" for any stock with an attached chart image
- "Produce 16:9 single-stock YouTube explainer" or "16:9 technical masterclass"
- "Apply motion-doctrine on a stock chart" or "make technical breakdown reel"
- "Add DEMA intro and outro to the video"
- "Produce 16:9 financial newsroom broadcast with split-flap board and charts"
- "Fix voice overlap in video audio" or "render batch vertical reels"
- "Update the daily market data and export full video suite"

---

## 2. Format & Production Matrix

| Feature | 16:9 Master Television Broadcast | 16:9 Stock YouTube Masterclass | 9:16 Viral Stock Reel (Shorts/Reels) |
|---|---|---|---|
| **Resolution** | `1920 × 1080` (Horizontal 16:9) | `1920 × 1080` (Horizontal 16:9) | `1080 × 1920` (Vertical 9:16) |
| **Frame Rate** | 30.00 fps | 30.00 fps | 30.00 fps |
| **Narrative Structure** | 5 Acts (~3m 34s to 25m) | 3 Acts (`DemaIntro` 3.5s + 6-Beat Body + `DemaOutro` 5.0s) | 3 Acts (`DemaIntro` 3.5s + 6-Beat Body + `DemaOutro` 5.0s) |
| **Audio Engine** | `build_audio.py` (5 chapters, procedural bed, foley) | `build_stock_explainer_audio.py` (6-beat narration, 120 BPM bed, sub-bass drop) | `build_stock_explainer_audio.py` or `build_reel_audio.py` |
| **Loudness Spec** | EBU R128 `-19.0 LUFS` (Peak: `-2.0 dBFS`) | EBU R128 `-14.0 LUFS` (Peak: `-1.5 dBFS`) | EBU R128 `-14.0 LUFS` (Peak: `-1.5 dBFS`) |
| **Caption Overlay** | `BroadcastCaptionOverlay` (10-word window, `bottom: 122px`) | `KineticBroadcastCaptions` (10-word window, `top: 86px`) | `KineticBroadcastCaptions` (7-word window, `bottom: 240px`) |
| **Layout Dynamics** | Full-width split-flap mechanical board & cards | 1390px Chart + 470px Level Matrix Telemetry Sidebar | Centered 1040x980 Chart Canvas + Watermark Climax |
| **Visual Protocol** | Split-flap board, macro index charts | Decluttered Single-Level Laser Sweeps + Sonar Radar | Decluttered Single-Level Laser Sweeps + Sonar Radar |
| **Render Scripts** | `scripts/render_broadcast.py` | `scripts/render_stock_explainers.py` | `scripts/render_stock_explainers.py` / `render_reels.py` |

---

## 3. The Cummins Benchmark Pattern for Stock Explainers

Every stock that has a technical chart image attached (`"image": "charts/<SYMBOL>_1D_chart.png"` in telemetry) qualifies for the **Full Explainer Video Suite** (both 9:16 Reel and 16:9 YouTube Masterclass). Both formats strictly adhere to the Cummins India benchmark doctrine:

### A. The 6-Phase Analytical Structure
1. **Phase 0: The Core Trading Rule & Chart Overview (Cues 0-1)**
   - Displays the foundational law: `RULE: BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE`.
   - Camera: Gentle pull-in establishing the entire daily technical landscape.
2. **Phase 1: Institutional Accumulation Floor (Cues 1-2)**
   - Highlights **Point of Control (POC)** and **Value Area Low (VAL)**.
   - Deep zoom directly into the accumulation cluster where institutional buyers absorbed high volume.
3. **Phase 2: Reclaimed Dynamic Support (Cues 2-3)**
   - Focuses on **20 DEMA**.
   - Camera tracks the upward rebound confirming dynamic price support after floor absorption.
4. **Phase 3: Critical Inflection Hurdle (Cues 3-4)**
   - Focuses on **50 DEMA**.
   - Camera locks onto the 50 DEMA hurdle with physical spring recoil as price kisses resistance.
5. **Phase 4: Primary Expansion Target (Cues 4-5)**
   - Focuses on **Value Area High (VAH)**.
   - Pan up through the target corridor toward the upper volume boundary.
6. **Phase 5: Macro Trend Reversal Gateway (Cue 5 to End)**
   - Highlights **100 DEMA** and **200 DEMA**.
   - Camera pulls back into wide macro perspective outlining the ultimate breakout targets.

### B. Visual & Motion Elements
- **Decluttered Single-Level Laser Protocol**: Inactive levels disappear during each phase. The discussed level animates smoothly from left to right using `sweepProgress` (22 frames / 0.73s) with a leading spark particle.
- **Continuous CMP Anchor Line & Sonar Radar**: The live price (`#10B981`) remains permanently anchored with a continuous line and an expanding dual-wave sonar pulse ring on the active candle.
- **Institutional Telemetry Header**: Top strap featuring the yellow `D` brand box, full stock name, ticker badge, rotating conic gradient live quote rim, and central rule pill.
- **Right Sidebar Matrix (16:9 YouTube)**: 470px frosted glass sidebar organizing levels into `RESISTANCE & TARGETS (ABOVE CMP)`, `CMP CURRENT PIVOT`, and `DYNAMIC SUPPORTS (BELOW CMP)`, with dynamic spotlight scale and border glow matching the active phase.
- **Top Floating Karaoke Captions**: Synchronized word-by-word captions with active-word gold pop pill (`#F2CF1D`, scale 1.10).
- **LowerThirdStrap**: Updating dynamically per phase with specific price levels and institutional volume context.

---

## 4. Production Runbooks

### Runbook A: Full Stock Explainer Video Suite (The Cummins Pattern)

Use this runbook to render both the 9:16 Viral Reel and 16:9 YouTube Masterclass for any stock with an attached chart image.

#### Step 1: Synthesize Audio & Generate Manifest
```bash
# For a single stock (e.g. Coal India)
python .agents/skills/dema-broadcast-master/scripts/build_stock_explainer_audio.py --symbol COALINDIA

# Or batch generate for ALL stocks with attached chart images
python .agents/skills/dema-broadcast-master/scripts/build_stock_explainer_audio.py --all-images
```
This script:
- Reads stock telemetry and computes missing levels (`val`, `poc`, `d20`, `cmp`, `d50`, `d100`, `d200`, `vah`).
- Synthesizes the 6-beat institutional script using `edge-tts` (`en-IN-PrabhatNeural`).
- Synthesizes procedural 120 BPM newsroom bed with 45Hz sub-bass drop on POC impact.
- Normalizes to EBU R128 `-14.0 LUFS` and concatenates `DemaIntro` (3.5s) and `DemaOutro` (5.0s).
- Exports `<symbol>_explainer_manifest.json` and time-shifted `.srt` and `.vtt` subtitles.

#### Step 2: Render Explainer Video Suite (Remotion + FFmpeg)
```bash
# Render both 9:16 Reel and 16:9 YouTube Masterclass for a stock
python .agents/skills/dema-broadcast-master/scripts/render_stock_explainers.py --symbol COALINDIA --format all

# Or render only 9:16 Reel
python .agents/skills/dema-broadcast-master/scripts/render_stock_explainers.py --symbol COALINDIA --format 9x16

# Or render only 16:9 YouTube Masterclass
python .agents/skills/dema-broadcast-master/scripts/render_stock_explainers.py --symbol COALINDIA --format 16x9

# Or batch render ALL image-attached stocks across both formats
python .agents/skills/dema-broadcast-master/scripts/render_stock_explainers.py --all-images --format all --concurrency 4
```

---

### Runbook B: 16:9 Master Television Broadcast

#### Step 1: Validate Daily Market Telemetry
```bash
python .agents/skills/dema-broadcast-master/scripts/validate_market_data.py path/to/daily_market_data.json
```

#### Step 2: Synthesize Broadcast Audio Suite
```bash
python .agents/skills/dema-broadcast-master/scripts/build_audio.py --voice "en-IN-PrabhatNeural" --out-dir "outputs/audio"
```

#### Step 3: Render & Concatenate Master 16:9 Video
```bash
python .agents/skills/dema-broadcast-master/scripts/render_broadcast.py --concurrency 4 --audio-dir "outputs/audio" --out-dir "outputs/videos"
```

---

### Runbook C: 9:16 Daily Market Recap Reels

#### Step 1: Synthesize Reel Audio
```bash
python .agents/skills/dema-broadcast-master/scripts/build_reel_audio.py --symbol "CUMMINSIND" --out-dir "outputs/audio"
```

#### Step 2: Render Vertical Reels
```bash
# Render single reel
python .agents/skills/dema-broadcast-master/scripts/render_reels.py --reel cummins --out-dir "outputs/reels"

# Batch render all daily reels
python .agents/skills/dema-broadcast-master/scripts/render_reels.py --all --concurrency 4 --out-dir "outputs/reels"
```

---

## 5. Directory Structure & Key Assets

```text
.agents/skills/dema-broadcast-master/
├── SKILL.md                                 # Master instruction manual
├── README.md                                # Public repository documentation
├── scripts/
│   ├── build_stock_explainer_audio.py       # Universal 6-beat stock explainer audio + manifest + subtitles
│   ├── render_stock_explainers.py           # Universal stock explainer renderer (9:16 & 16:9 + FFmpeg muxing)
│   ├── build_audio.py                       # 16:9 broadcast TTS + 120 BPM bed + foley + auto-SRT/VTT
│   ├── build_reel_audio.py                  # 9:16 Zero-overlap TTS engine + SFX + Intro/Outro concatenation
│   ├── render_broadcast.py                  # 16:9 Remotion concurrency render + FFmpeg muxing + concat
│   ├── render_reels.py                      # 9:16 Vertical reels renderer (single & batch) + FFmpeg muxing
│   └── validate_market_data.py              # JSON schema validator for daily telemetry
├── templates/
│   ├── StockExplainerReel.jsx               # Universal 9:16 Vertical Explainer Reel (Cummins pattern)
│   ├── StockYouTubeExplainer16x9.jsx        # Universal 16:9 Widescreen Explainer Masterclass (Chart + Sidebar)
│   ├── CumminsYouTubeExplainer16x9.jsx      # Benchmark 16:9 Widescreen YouTube Explainer
│   ├── CumminsExplainerReel.jsx             # Benchmark 9:16 Support/Resistance Masterclass Reel
│   ├── CumminsMotionDoctrineReel.jsx        # 3-Act Next-Gen Cummins Reel with 6-Pillar motion
│   ├── DemaIntro.jsx                        # Master DEMA branded intro sting (3.5s / 105 frames @ 30fps)
│   ├── DemaOutro.jsx                        # Master DEMA responsive outro end card (5.0s / 150 frames @ 30fps)
│   ├── DemaMasterRoot.jsx                   # Universal Remotion Root with pre-registered explainer compositions
│   ├── SharedNewsPackage.jsx                # UI components: KineticBroadcastCaptions, LowerThirdStrap, Wipes
│   ├── DemaMasterChapters.jsx               # Complete 5-act broadcast Remotion component
│   └── brand.json                           # Canonical brand tokens (colors, fonts, metadata)
├── schemas/
│   ├── market_data_schema.json              # JSON Schema definition for daily market telemetry
│   └── sample_market_data.json              # Example daily market data with image references
└── references/
    ├── decluttered-laser-doctrine.md        # Single-level isolation, laser sweep, sonar pulse specs
    ├── broadcast-doctrine.md                # 16:9 and 9:16 screen geometry, safe zones, 6-pillar engagement
    ├── sound-design.md                      # Zero voice overlap engine, 120 BPM procedural formulas
    └── caption-system.md                    # Kinetic word-by-word karaoke specs, time-shifted subtitles
```

---

## 6. Verification Checklist

Before publishing or delivering any generated video:
- [ ] **Zero Voice Overlap**: Confirm sequential chunks have `start_sec[i] >= end_sec[i-1] + 0.45s`.
- [ ] **Audio Loudness**: Verify with FFprobe/FFmpeg:
  - 16:9 Broadcast: integrated loudness ~ `-19 LUFS` (peak < `-2.0 dBFS`).
  - 9:16 Reel & 16:9 Stock Explainer: integrated loudness ~ `-14 LUFS` (peak < `-1.5 dBFS`).
- [ ] **3-Act Structure**: Verify all stock explainers include `DemaIntro` (3.5s), 6-Beat Technical Core, and `DemaOutro` (5.0s).
- [ ] **Decluttered Single-Level Isolation**: Verify inactive overlay lines disappear during each audio beat, revealing only the level being discussed.
- [ ] **Left-to-Right Laser Sweeps**: Verify level lines draw on with a leading spark particle (`sweepProgress`).
- [ ] **Live Price Radar Ping**: Verify CMP maintains a continuous anchor line and dual-wave expanding sonar pulse.
- [ ] **16:9 Telemetry Sidebar**: Verify the Level Matrix sidebar synchronizes spotlight scale and border glow to the active phase.
- [ ] **Subtitles & Caption Clearance**: Verify `.srt` and `.vtt` timestamps match spoken audio and captions do not overlap the LowerThirdStrap or header strap.
