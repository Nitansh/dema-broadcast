# DEMA Broadcast Master 📺⚡
> **Unified Multi-Skill Autonomous Financial Video & Media Production Studio for Antigravity & Remotion**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Remotion](https://img.shields.io/badge/Remotion-v4.0+-blue.svg)](https://www.remotion.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-brightgreen.svg)](https://python.org)
[![Audio Standard](https://img.shields.io/badge/Audio-EBU%20R128%20--14%20LUFS-orange.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Unified%20Multi--Skill%20Studio%20v4.0-purple.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

**DEMA Broadcast Master (v4.0.0)** is an enterprise-grade, multi-agent automated media studio that orchestrates 25+ specialized subskills to transform raw market telemetry and TradingView charts into a complete multi-format video and publishing pack:

1. **16:9 Television Newsroom Master Broadcast** (`1920×1080 @ 30fps`, 5–8 structured acts, split-flap mechanical price boards, global macro matrix, and order flow footprints).
2. **16:9 Widescreen Technical Masterclasses** (institutional deep-dive per stock with animated DEMA laser sweeps and live telemetry HUDs).
3. **9:16 Viral Social Reels** (`1080×1920 @ 30fps`, Shorts/Reels/TikTok ready, powered by the **3-Second Retention Rule** and kinetic overlays).
4. **5-Slide Visual Technical Carousels** (LinkedIn & Instagram PDF/PNG carousels with chart breakdowns and cheat-sheets).
5. **6-Tweet Analytical X Threads** (High-engagement post-market data recaps with chart attachments).
6. **High-CTR Hinglish Viral Thumbnails** (16:9 Master & 9:16 vertical thumbnails with neon glows and verified chart zooms).
7. **Multi-Tab Parallel YouTube Studio Publisher** (CDP Puppeteer uploader that publishes master broadcasts and reels concurrently across isolated browser tabs).

---

## 🏛️ Unified Multi-Skill Architecture

```mermaid
graph TD
    User["Market Snapshot / Attached TradingView Charts"] --> Orchestrator["DEMA Master Showrunner<br>(dema-broadcast-master)"]

    subgraph Phase 1: Pre-Production & Intelligence
        Orchestrator --> Sub_Intel["agent-reach + trend-spotter + content-research<br>audience-personas + social-listening + competitor-teardown"]
    end

    subgraph Phase 2: Hook Architecture & Humanized Scriptwriting
        Sub_Intel --> Sub_Hook["virality + viral-hook-writer + ab-hook-tester<br>(3-Second Visual Hook Rule: Frames 0-90)"]
        Sub_Hook --> Sub_Script["reel-scripter + reel-builder + humanizer<br>(4-Beat Technical Core + Stripped AI Tells)"]
        Sub_Script --> Sub_Text["on-screen-text-writer + cta-writer<br>(Kinetic Overlays for 80% Silent Mobile Viewers)"]
    end

    subgraph Phase 3: Visual Identity, Motion Graphics & Audio Studio
        Sub_Text --> Sub_Visual["lemo-opuscar (news-package) + cut-the-curve<br>motion-doctrine + 60fps-animation + oversized-cursor"]
        Sub_Visual --> Sub_Motion["remotion-kinetic-kit + captions-overlay + glassmorphism<br>(Unclipped 590px Stage + Spring Reveals)"]
        Sub_Script --> Sub_Audio["parallel_audio_synthesizer.py + sound-design<br>(Async edge-tts + 120 BPM Bed + -14 LUFS Mix)"]
    end

    subgraph Phase 4: Hardware-Accelerated Cluster Rendering
        Sub_Motion --> RenderCluster["remotion-render + parallel_remotion_cluster.py<br>(Permanent Turbo Mode: --concurrency=8, ANGLE WebGL)"]
        Sub_Audio --> RenderCluster
        RenderCluster --> Concat["FFmpeg Zero-Loss Stream-Copy Concat<br>(16:9 Master in < 2.0s)"]
    end

    subgraph Phase 5: Packaging, Repurposing & Multi-Tab Distribution
        Concat --> Sub_Package["cover-thumbnail-brief + generate_viral_thumbnail.py<br>(High-CTR Hinglish 16:9 & 9:16 Custom Thumbnails)"]
        Concat --> Sub_Repurpose["content-repurposer + carousel-builder + x-thread-strategy<br>(Instagram/LinkedIn Carousels + 6-Tweet X Threads)"]
        Sub_Package --> Sub_Publish["parallel_youtube_publisher.mjs + caption-and-hashtags<br>(Multi-Tab CDP Studio Upload + Compliance SEBI Tags)"]
        Sub_Publish --> Sub_Loop["comment-responder + dm-script-writer<br>(Automated Community Conversion Funnel)"]
    end
```

---

## ⚡ Quick Start: Production Runbooks

### 1. Full Multi-Skill Autonomous Suite Execution
Ingest market data, synthesize humanized audio, render videos in Turbo Mode, author thumbnails, and publish to YouTube Studio:
```bash
python scripts/run_parallel_broadcast.py \
  --market-data data/dema_suite_20261119.json \
  --render-workers 3 \
  --upload-workers 2 \
  --upload
```

### 2. Single Stock Technical Explainer (16:9 & 9:16)
```bash
# 1. Synthesize 6-beat audio & manifest
python scripts/build_stock_explainer_audio.py --symbol HEROMOTOCO

# 2. Render 16:9 YouTube Masterclass (Turbo concurrency=8)
python scripts/render_stock_explainers.py --symbol HEROMOTOCO --format 16x9 --turbo

# 3. Render 9:16 Vertical Reel (Turbo concurrency=8)
python scripts/render_stock_explainers.py --symbol HEROMOTOCO --format 9x16 --turbo
```

### 3. Multi-Tab Parallel YouTube Studio Publisher
```bash
node scripts/parallel_youtube_publisher.mjs upload_manifest.json 2
```

---

## 📁 Repository Structure

```text
.agents/skills/dema-broadcast-master/
├── SKILL.md                                 # Master Orchestrator Manual (v4.0.0)
├── README.md                                # Public documentation
├── references/
│   ├── subskills-pipeline-matrix.md         # Complete Subskills Interoperability Matrix
│   ├── broadcast-doctrine.md                # Screen geometry, safe zones, 6-pillar formula
│   ├── decluttered-laser-doctrine.md        # Single-level isolation & laser sweep specs
│   ├── sound-design.md                      # Zero voice overlap engine & 120 BPM formulas
│   └── caption-system.md                    # Kinetic word-by-word karaoke specs
├── scripts/
│   ├── run_parallel_broadcast.py            # Master parallel pipeline coordinator
│   ├── parallel_audio_synthesizer.py        # Async edge-tts + 120 BPM score + loudnorm
│   ├── parallel_remotion_cluster.py         # Multi-process Remotion render cluster + FFmpeg concat
│   ├── generate_viral_thumbnail.py          # High-CTR 16:9 and 9:16 viral thumbnail generator
│   ├── parallel_youtube_publisher.mjs       # Multi-tab concurrent YouTube Studio uploader
│   ├── build_stock_explainer_audio.py       # Universal 6-beat stock explainer audio + manifest
│   ├── render_stock_explainers.py           # Universal stock explainer renderer (Turbo concurrency=8)
│   ├── build_audio.py                       # 16:9 broadcast TTS + 120 BPM bed + foley
│   ├── build_reel_audio.py                  # 9:16 Zero-overlap TTS engine + SFX
│   ├── render_broadcast.py                  # 16:9 Remotion concurrency render (Turbo concurrency=8)
│   ├── render_reels.py                      # 9:16 Vertical reels renderer (Turbo concurrency=8)
│   └── validate_market_data.py              # Telemetry JSON schema validator
├── templates/
│   ├── StockExplainerReel.jsx               # Universal 9:16 Vertical Explainer Reel
│   ├── StockYouTubeExplainer16x9.jsx        # Universal 16:9 Widescreen Explainer Masterclass
│   ├── DemaIntro.jsx                        # Master DEMA branded intro sting (3.5s)
│   ├── DemaOutro.jsx                        # Master DEMA responsive outro end card (5.0s)
│   ├── DemaMasterRoot.jsx                   # Universal Remotion Root
│   ├── SharedNewsPackage.jsx                # UI components: Captions, Straps, Wipes
│   ├── DemaMasterChapters.jsx               # Complete 5-act broadcast Remotion component
│   ├── DemaVerticalReels.jsx                # Synchronized 4-beat unclipped vertical reels
│   └── brand.json                           # Canonical brand tokens
└── schemas/
    ├── market_data_schema.json              # JSON Schema definition for daily market telemetry
    ├── sample_market_data.json              # Example daily market data with image references
    └── sample_reel_manifest.json            # Manifest structure for audio-visual sync
```

---

## 📜 Regulatory Disclaimer & Compliance

Strictly designed for educational, chart-reading, and technical study production. Does not constitute financial advice, investment advisory services, or SEBI-registered buy/sell recommendations.
