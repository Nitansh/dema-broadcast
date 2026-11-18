---
name: dema-broadcast-master
description: Ultra-parallel multi-agent production pipeline for daily DEMA financial broadcasts, viral reels, and full stock explainer video suites. Features permanent hardware Turbo Mode (concurrency=8 for single videos/reels, multi-worker clusters for batch suites), unclipped TradingView chart presentation, concurrent voiceover & procedural 120 BPM audio synthesis, and multi-tab parallel YouTube Studio publishing via CDP.
version: 3.1.0
---

# DEMA Broadcast Master: Ultra-Parallel Multi-Agent Financial Video & Stock Explainer Pipeline

Produce broadcast-grade **16:9 Master Financial Broadcasts**, **16:9 Widescreen Technical Masterclasses**, and **9:16 Viral Social Reels** in record time. Version 3.1 introduces **Permanent Turbo Mode by Default**: whether rendering a single reel, single YouTube explainer, or full master broadcast, the engine automatically unleashes maximum hardware acceleration (`--concurrency=8`, Angle/WebGL GPU rasterization, multi-worker process pools), while guaranteeing **100% unclipped TradingView chart visibility** and strict audio-beat synchronization.

```mermaid
graph TD
    User["User Request / Daily Market Figures / Charts"] --> Master["Master Coordinator Agent"]
    
    subgraph Parallel Stage 1: Async Pre-Production
        Master --> Sub1["Subagent 1: Audio Synthesizer<br>(Async edge-tts + 120 BPM bed)"]
        Master --> Sub2["Subagent 2: Viral Thumbnail Artist<br>(16:9 & 9:16 Hinglish high-CTR)"]
    end
    
    subgraph Parallel Stage 2: Hardware Render Cluster
        Sub1 --> RenderCluster["Subagent 3: Multi-Process Remotion Cluster<br>(Parallel CPU/GPU Workers)"]
        RenderCluster --> Concat["Instant FFmpeg Stream-Copy Concat<br>(Master 16:9 in < 2s)"]
    end
    
    subgraph Parallel Stage 3: Multi-Tab Distribution
        Sub2 --> UploadSwarm["Subagent 4: Parallel YouTube Publisher<br>(Isolated Multi-Tab CDP Workers)"]
        Concat --> UploadSwarm
        UploadSwarm --> LiveYT["YouTube Live: Master 16:9 + 8 Standalone Reels"]
    end
```

---

## 1. When to Use This Skill

Activate this skill whenever the user asks to:
- "Generate today's DEMA analysis video" or "make daily market broadcast"
- "Create videos in parallel" or "make video generation faster with subagents"
- "Create viral thumbnails in Hinglish/English" while rendering
- "Upload all reels and videos to YouTube in parallel"
- "Create a viral 9:16 reel for a stock" (e.g. Cummins India, Coal India, IIFL Cap, Blue Star, ABB, Waaree)
- "Render full explainer video like Cummins" for any stock with an attached chart image
- "Produce 16:9 single-stock YouTube explainer" or "16:9 technical masterclass"
- "Apply motion-doctrine on a stock chart" or "make technical breakdown reel"
- "Add DEMA intro and outro to the video"
- "Produce 16:9 financial newsroom broadcast with split-flap board and charts"

---

## 2. Ultra-Parallel Multi-Agent Roles

| Role | Engine / Script | Concurrency Model | Execution Output |
|---|---|---|---|
| **Master Coordinator** | `run_parallel_broadcast.py` | Orchestration thread pool | Validates inputs, coordinates subagents, generates run report. |
| **Voice & Score Synthesizer** | `parallel_audio_synthesizer.py` | Asyncio + ProcessPoolExecutor | Parallel `edge-tts` chunks (`en-IN-PrabhatNeural`), 120 BPM bed, `-14 LUFS` EBU R128 mix. |
| **Viral Thumbnail Artist** | `generate_viral_thumbnail.py` | Background ThreadPool | Simultaneous 16:9 Master Viral Thumbnail + 9:16 Reel Thumbnails with Hinglish punchlines. |
| **Remotion Render Cluster** | `parallel_remotion_cluster.py` | Multi-Process Worker Pool (2-4 workers) | Concurrent Remotion composition renders + instant FFmpeg zero-loss stream copy concat. |
| **Parallel YouTube Publisher** | `parallel_youtube_publisher.mjs` | Multi-Tab Puppeteer / CDP (2-3 tabs) | Concurrent video file uploads, metadata population, custom thumbnail assignment, and publishing. |

---

## 3. Format & Production Matrix

| Feature | 16:9 Master Television Broadcast | 16:9 Stock YouTube Masterclass | 9:16 Viral Stock Reel (Shorts/Reels) |
|---|---|---|---|
| **Resolution** | `1920 × 1080` (Horizontal 16:9) | `1920 × 1080` (Horizontal 16:9) | `1080 × 1920` (Vertical 9:16) |
| **Frame Rate** | 30.00 fps | 30.00 fps | 30.00 fps |
| **Narrative Structure** | 5-8 Acts (~11m to 25m total) | 3 Acts (`DemaIntro` 3.5s + 6-Beat Body + `DemaOutro` 5.0s) | 3 Acts (`DemaIntro` 3.5s + 6-Beat Body + `DemaOutro` 5.0s) |
| **Audio Engine** | `parallel_audio_synthesizer.py` | `build_stock_explainer_audio.py` | `parallel_audio_synthesizer.py` / `build_reel_audio.py` |
| **Loudness Spec** | EBU R128 `-19.0 LUFS` / `-14.0 LUFS` (Peak: `-1.5 dBFS`) | EBU R128 `-14.0 LUFS` (Peak: `-1.5 dBFS`) | EBU R128 `-14.0 LUFS` (Peak: `-1.5 dBFS`) |
| **Caption Overlay** | `BroadcastCaptionOverlay` (10-word window) | `KineticBroadcastCaptions` (10-word window, `top: 86px`) | `KineticBroadcastCaptions` (7-word window, `bottom: 240px`) |
| **Layout Dynamics** | Full-width split-flap mechanical board & cards | 1390px Chart + 470px Level Matrix Telemetry Sidebar | Centered 1040x980 Chart Canvas + Watermark Climax |
| **Parallel Render** | `parallel_remotion_cluster.py` | `parallel_remotion_cluster.py` | `parallel_remotion_cluster.py` |

---

## 4. Permanent Turbo Mode & Visual Sync Doctrine

### 4.1 Turbo Mode Concurrency Standards
Turbo Mode is **permanently enabled by default** across all render scripts (`render_reels.py`, `render_stock_explainers.py`, `render_broadcast.py`, and `parallel_remotion_cluster.py`):

| Scope | Turbo Concurrency | Engine Flags | Hardware Core Utilization | Speed Benchmark |
|---|---|---|---|---|
| **Single Reel (9:16)** | `--concurrency=8` | `--gl=angle` | 8 dedicated CPU/GPU threads | 36-40s reel renders in **~22s** |
| **Single Explainer (16:9 / 9:16)** | `--concurrency=8` | `--gl=angle` | 8 dedicated CPU/GPU threads | 130s explainer renders in **~70s** |
| **Full Broadcast Single Chapter** | `--concurrency=8` | `--gl=angle` | 8 dedicated CPU/GPU threads | 300s chapter renders in **~160s** |
| **Batch / Parallel Cluster** | `concurrency=4` per worker | Multi-Process Worker Pool (2-3 workers) | 8-12 logical cores distributed | 8 reels + 8 chapters rendered in parallel |

> [!IMPORTANT]
> **Why Turbo Defaults to 8 Cores for Single Videos:**
> On modern 12-to-16-core workstations, running a single composition at `--concurrency=8` utilizes half the machine's thread capacity to render frames concurrently without saturating memory or thrashing the GPU context. For cluster jobs with multiple compositions, the system automatically dials each worker to `concurrency=4` across 2-3 processes, preventing VRAM overflow and browser crashes.

---

### 4.2 Zero Chart Clipping Law (100% Technical Visibility)
TradingView technical charts are 16:9 widescreen captures (`1920×1080`). When rendered in 9:16 vertical reels (`1080×1920`), applying `objectFit: 'cover'` or constrained heights (< 400px) cuts off critical candlesticks, price axes, indicators, and timestamps.

- **Mandatory Container Height**: The chart container MUST be allocated a minimum of `560px` to `600px` height (standard: `height: 590px`).
- **Mandatory Object Fit**: Always use `objectFit: 'contain'` and `objectPosition: 'center center'`.
- **Zero Pixel Crop Guarantee**:
  - Top header (Ticker, 1D, Candle type) is 100% visible.
  - Candlestick price action and DEMA curves are 100% unclipped.
  - Bottom date/time axis is 100% visible.
  - Right price axis (numbers, CMP labels) is 100% visible.
- **Dynamic Floating HUD Pill**: Displays active beat, CMP, DEMA levels, or POC in high-contrast glassmorphism without obscuring the chart.

---

### 4.3 Audio-Chunk Keyed 4-Beat Architecture
To eliminate visual drift and guarantee synchronization between voice and screen:
- **Beat 1 (`c0` to `c1`)**: Live CMP, 24h change, OHLC session stats, market structure stamp.
- **Beat 2 (`c1` to `c2`)**: 20 DEMA defense, 20/50/200 DEMA ribbon, RSI(14) momentum telemetry.
- **Beat 3 (`c2` to `c3`)**: 50 DEMA hurdle, 3-box POC/VAH/VAL volume profile grid.
- **Beat 4 (`c3` to `endWipe`)**: Risk invalidation shelf, primary support floor, mandatory educational SEBI disclaimer.
- **Beat 5 (`endWipe` to end)**: Responsive DEMA outro plate and channel call-to-action.

---

## 5. Production Runbooks

### Runbook A: End-to-End Parallel Suite Execution (Recommended)

Run the entire pipeline—audio, video rendering, viral thumbnail design, and multi-tab YouTube publishing—in parallel:

```bash
# 1. Master Parallel Command (All tasks in parallel)
python .agents/skills/dema-broadcast-master/scripts/run_parallel_broadcast.py \
  --market-data data/dema_suite_20261113.json \
  --out-dir DEMA_Daily_Study_Pack \
  --render-workers 3 \
  --upload-workers 2 \
  --upload
```

---

### Runbook B: Parallel Audio & Viral Thumbnail Generation

While Remotion is preparing or rendering, generate audio and thumbnails concurrently:

```bash
# Generate audio chunks asynchronously
python .agents/skills/dema-broadcast-master/scripts/parallel_audio_synthesizer.py

# Generate 16:9 Viral Thumbnail with Hinglish punchline
python .agents/skills/dema-broadcast-master/scripts/generate_viral_thumbnail.py \
  --format 16x9 \
  --out outputs/thumbnails/DEMA_Master_Viral_Thumbnail.jpg \
  --headline "NIFTY 50 BREAKOUT & GOLD SURGE" \
  --sub "136M Volume Blast! बड़ा उलटफेर शुरू?" \
  --chart modi-remotion/public/charts/FIRSTCRY_1D_chart.png

# Generate 9:16 Vertical Reel Thumbnail
python .agents/skills/dema-broadcast-master/scripts/generate_viral_thumbnail.py \
  --format 9x16 \
  --out outputs/thumbnails/DEMA_Reel_FIRSTCRY_9x16_thumb.jpg \
  --headline "FIRSTCRY BREAKOUT" \
  --sub "12.8% Blast या Trap?" \
  --ticker "FIRSTCRY" \
  --chart modi-remotion/public/charts/FIRSTCRY_1D_chart.png
```

---

### Runbook C: Parallel Multi-Process Remotion Video Cluster

Distribute Remotion rendering across worker processes:

```bash
# Render all 8 chapters and 8 reels concurrently (workers=3)
python .agents/skills/dema-broadcast-master/scripts/parallel_remotion_cluster.py
```
- Chapter 1 through Chapter 8 render in parallel.
- Standalone Reels render in parallel.
- Fast FFmpeg stream-copy concatenates the 16:9 master broadcast with zero re-encoding loss in under 2 seconds.

---

### Runbook D: Multi-Tab Parallel YouTube Studio Publisher

Upload multiple videos and reels concurrently via isolated browser tabs:

```bash
# Upload all videos from manifest across 2-3 concurrent Studio tabs
node .agents/skills/dema-broadcast-master/scripts/parallel_youtube_publisher.mjs upload_manifest.json 2
```
- Each worker tab operates independently on `https://studio.youtube.com`.
- Automatically assigns Title, Description, Audience (`VIDEO_MADE_FOR_KIDS_NOT_MFK`), Custom Thumbnail, and Public Visibility.
- Generates `upload_manifest_published.json` with verified live links.

---

### Runbook E: Single 9:16 Vertical Reel Render (Turbo Mode Default)

Render any single vertical reel in lightning speed with 8-thread hardware concurrency and ANGLE WebGL acceleration:

```bash
# Turbo render a single reel (e.g. NETWEB or Reel 5)
python .agents/skills/dema-broadcast-master/scripts/render_reels.py \
  --reel reel5 \
  --turbo

# Concurrency automatically defaults to 8 cores. 
# Total render duration: ~20-25 seconds for a 40-second vertical reel.
```

---

### Runbook F: Single 16:9 Stock Explainer Masterclass (Turbo Mode Default)

Render an individual institutional widescreen technical breakdown for any stock with attached TradingView chart:

```bash
# Turbo render single 16:9 YouTube video (e.g. WAAREEENER or NHPC)
python .agents/skills/dema-broadcast-master/scripts/render_stock_explainers.py \
  --symbol WAAREEENER \
  --format 16x9 \
  --turbo

# Concurrency automatically defaults to 8 cores.
# Features unclipped 1390px chart stage, dynamic DEMA laser sweeps, and 14 LUFS voiceover.
```

---

## 6. Directory Structure & Key Assets

```text
.agents/skills/dema-broadcast-master/
├── SKILL.md                                 # Master instruction manual (v3.1.0)
├── README.md                                # Public repository documentation
├── scripts/
│   ├── run_parallel_broadcast.py            # Master parallel pipeline coordinator
│   ├── parallel_audio_synthesizer.py        # Async edge-tts + 120 BPM news bed + loudnorm
│   ├── parallel_remotion_cluster.py         # Multi-process Remotion render cluster + FFmpeg concat
│   ├── generate_viral_thumbnail.py          # High-CTR 16:9 and 9:16 viral thumbnail generator
│   ├── parallel_youtube_publisher.mjs       # Multi-tab concurrent YouTube Studio uploader
│   ├── build_stock_explainer_audio.py       # Universal 6-beat stock explainer audio + manifest
│   ├── render_stock_explainers.py           # Universal stock explainer renderer (Turbo concurrency=8)
│   ├── build_audio.py                       # 16:9 broadcast TTS + 120 BPM bed + foley
│   ├── build_reel_audio.py                  # 9:16 Zero-overlap TTS engine + SFX
│   ├── render_broadcast.py                  # 16:9 Remotion concurrency render (Turbo concurrency=8)
│   ├── render_reels.py                      # 9:16 Vertical reels renderer (Turbo concurrency=8)
│   └── validate_market_data.py              # JSON schema validator for daily telemetry
├── templates/
│   ├── StockExplainerReel.jsx               # Universal 9:16 Vertical Explainer Reel
│   ├── StockYouTubeExplainer16x9.jsx        # Universal 16:9 Widescreen Explainer Masterclass
│   ├── CumminsYouTubeExplainer16x9.jsx      # Benchmark 16:9 Widescreen YouTube Explainer
│   ├── CumminsExplainerReel.jsx             # Benchmark 9:16 Support/Resistance Masterclass Reel
│   ├── CumminsMotionDoctrineReel.jsx        # 3-Act Next-Gen Cummins Reel
│   ├── DemaIntro.jsx                        # Master DEMA branded intro sting (3.5s)
│   ├── DemaOutro.jsx                        # Master DEMA responsive outro end card (5.0s)
│   ├── DemaMasterRoot.jsx                   # Universal Remotion Root
│   ├── SharedNewsPackage.jsx                # UI components: Captions, Straps, Wipes
│   ├── DemaMasterChapters.jsx               # Complete 5-act broadcast Remotion component
│   ├── DemaVerticalReels.jsx                # Synchronized 4-beat unclipped vertical reels
│   └── brand.json                           # Canonical brand tokens
├── schemas/
│   ├── market_data_schema.json              # JSON Schema definition for daily market telemetry
│   └── sample_market_data.json              # Example daily market data with image references
└── references/
    ├── decluttered-laser-doctrine.md        # Single-level isolation, laser sweep specs
    ├── broadcast-doctrine.md                # Screen geometry, safe zones, 6-pillar engagement
    ├── sound-design.md                      # Zero voice overlap engine, 120 BPM formulas
    └── caption-system.md                    # Kinetic word-by-word karaoke specs
```

---

## 7. Verification Checklist

Before publishing or delivering any generated video:
- [ ] **Turbo Mode Execution**: Confirm `--concurrency=8` was utilized for single video/reel or distributed across cluster workers.
- [ ] **Zero Chart Clipping**: Confirm TradingView charts use `objectFit: 'contain'` in a `590px` container with 100% visible candlesticks and axes.
- [ ] **Voice-Screen Synchronization**: Confirm on-screen visual beats align precisely with audio chunks (`c0`, `c1`, `c2`, `c3`).
- [ ] **Zero Voice Overlap**: Confirm sequential chunks have `start_sec[i] >= end_sec[i-1] + 0.45s`.
- [ ] **Audio Loudness**: Verify with FFprobe: Integrated loudness ~ `-14 LUFS` (Peak: `-1.5 dBFS`).
- [ ] **Hinglish Viral Thumbnail**: Verify master thumbnail contains high-contrast title, Hinglish punchline, verified chart zoom, and compliance note.
- [ ] **Zero-Loss Concat**: Verify master 16:9 video chapters are concatenated with clean audio sync and no re-encoding artifacts.
- [ ] **Multi-Tab YouTube Publishing**: Verify all videos are published as `Public` with correct titles, descriptions, and custom thumbnails.
