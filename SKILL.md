---
name: dema-broadcast-master
description: Ultra-parallel multi-agent financial broadcast and video generation studio orchestrating Remotion, Lemo-Opuscar, kinetic motion graphics, viral hook engineering, humanized scriptwriting, and multi-platform publishing. Automatically coordinates 25+ specialized subskills across pre-production intelligence, 3-second virality hooks, velocity-matched easing, zero-clipping TradingView chart presentations, interactive beat-by-beat playbook approvals, hardware Turbo Mode rendering, and direct zero-browser YouTube Studio API uploads via ytstudio.
version: 4.3.0
---

# DEMA Broadcast Master: Unified Multi-Skill Autonomous Video Production Studio

Produce institutional **16:9 Master Financial Broadcasts**, **16:9 Widescreen Technical Masterclasses**, **9:16 Viral Social Reels**, **Multi-Slide Carousels**, and **X Analytical Threads** with zero friction. Version 4.3.0 transforms `dema-broadcast-master` into a fully autonomous, API-first studio featuring:
1. **Interactive Pre-Render Beat Playbook Gate**: Formulates and presents a complete beat-by-beat playbook (narration, kinetic text, visual radar, telemetry, and packaging) with attached frame stills for each beat and custom thumbnail for user approval before rendering.
2. **Pure Dark Slate Background Law (Non-Negotiable)**: Strictly enforces black / dark slate background (`#131722` / `#0B0F19`) across all TradingView lightweight chart captures and visual containers; white chart backgrounds are prohibited.
3. **Mandatory Directional Target Arrow Law (Non-Negotiable)**: Fully renders dynamic animated directional arrows from Live CMP (downward solid red with delta badge to support floors; upward solid green with delta badge to upside targets) AND explicitly discusses these arrow paths and percentage deltas in spoken narration.
4. **Mandatory Volume Surge Law (Non-Negotiable)**: Prominently highlights session volume surge bars and Point of Control (POC) accumulation footprint on the chart, with vocal narrative emphasis proving institutional conviction.
5. **Direct YouTube Studio API Uploads (`ytstudio`)**: Zero-browser, lightning-fast video and custom thumbnail uploads directly through the YouTube Data API with automatic YAML sidecars.

```mermaid
graph TD
    User["Market Snapshot / Attached TradingView Charts"] --> Orchestrator["DEMA Master Showrunner<br>(dema-broadcast-master)"]

    subgraph Phase 1: Market Intelligence & Audience Sensing
        Orchestrator --> Sub_Intel["agent-reach + trend-spotter + content-research<br>audience-personas + social-listening + competitor-teardown"]
    end

    subgraph Phase 2: Hook Engineering & Humanized Scriptwriting
        Sub_Intel --> Sub_Hook["virality + viral-hook-writer + ab-hook-tester<br>(3-Second Visual Hook Rule: Frames 0-90)"]
        Sub_Hook --> Sub_Script["reel-scripter + reel-builder + humanizer<br>(4-Beat Technical Core + Stripped AI Tells)"]
        Sub_Script --> Sub_Text["on-screen-text-writer + cta-writer<br>(Kinetic Overlays for 80% Silent Mobile Viewers)"]
    end

    subgraph Mandatory Gate: Beat Playbook Approval
        Sub_Text --> Gate["Interactive Beat-by-Beat Playbook Review<br>(Narration, Kinetic Text, Radar Levels & Metadata)<br>⏸ PAUSE FOR USER APPROVAL"]
    end

    subgraph Phase 3: Visual Identity, Motion Graphics & Sound Studio
        Gate -- Approved --> Sub_Visual["lemo-opuscar (news-package) + cut-the-curve<br>motion-doctrine + 60fps-animation + oversized-cursor"]
        Sub_Visual --> Sub_Motion["remotion-kinetic-kit + captions-overlay + glassmorphism<br>(Unclipped 590px Stage + Spring Reveals)"]
        Gate -- Approved --> Sub_Audio["parallel_audio_synthesizer.py + sound-design<br>(Async edge-tts + 120 BPM Bed + -14 LUFS Mix)"]
    end

    subgraph Phase 4: Hardware-Accelerated Cluster Rendering
        Sub_Motion --> RenderCluster["remotion-render + parallel_remotion_cluster.py<br>(Permanent Turbo Mode: --concurrency=8, ANGLE WebGL)"]
        Sub_Audio --> RenderCluster
        RenderCluster --> Concat["FFmpeg Zero-Loss Stream-Copy Concat<br>(16:9 Master in < 2.0s)"]
    end

    subgraph Phase 5: Packaging & Direct API Publishing
        Concat --> Sub_Package["cover-thumbnail-brief + generate_viral_thumbnail.py<br>(High-CTR Hinglish 16:9 & 9:16 Custom Thumbnails)"]
        Concat --> Sub_Repurpose["content-repurposer + carousel-builder + x-thread-strategy<br>(Instagram/LinkedIn Carousels + 6-Tweet X Threads)"]
        Sub_Package --> Sub_Publish["ytstudio_publisher.py + ytstudio API<br>(Direct Zero-Browser Upload + Auto YAML Sidecar)"]
        Sub_Publish --> Sub_Loop["comment-responder + dm-script-writer<br>(Automated Community Conversion Funnel)"]
    end
```

---

## 1. When to Use This Skill

Activate this skill whenever the user asks to:
- "Produce today's DEMA analysis video" or "make daily market broadcast"
- "Create stock study for [TICKER]" (e.g. Lenskart, Maruti, Hero MotoCorp, Cummins, Waaree, NHPC)
- "Update/run the video generation pipeline with all subskills"
- "Make a viral 9:16 reel with hooks and unclipped chart"
- "Produce 16:9 YouTube masterclass with split-flap boards and telemetry"
- "Generate multi-format pack: Master Video + Reels + Carousel + X Thread"
- "Upload all videos to YouTube Studio in parallel"
- "Make high-retention video using motion-doctrine and lemo-opuscar"

---

## 2. Integrated Subskills Inventory & Functional Role

`dema-broadcast-master` coordinates the following subskills as native modular engines:

| Category | Subskills Orchestrated | Core Functional Mandate |
|---|---|---|
| **Intelligence & Context** | `agent-reach`, `trend-spotter`, `content-research`, `audience-personas`, `social-listening`, `competitor-teardown` | Gathers verified sector catalysts, detects retail trader questions and objections, and benchmarks format structure against top-performing financial media. |
| **Hook & Retention** | `virality`, `viral-hook-writer`, `viral-hooks`, `hook-mining`, `ab-hook-tester` | Implements the **3-Second Visual Anomaly Law** (frames 0–90) to halt feed scrolling. Authors 3 ranked psychological hook options (curiosity, contrarian, negation). |
| **Script & Human Voice** | `reel-scripter`, `reel-builder`, `humanizer`, `on-screen-text-writer`, `cta-writer`, `series-planner`, `b-roll-shot-list` | Constructs the institutional 4-beat technical script. Passes narration through `humanizer` to eliminate AI tells, stiff corporate jargon, and forced triads. Formulates 2-4 word kinetic overlays for silent viewers. |
| **Visual Grammar & Motion** | `lemo-opuscar` (`news-package`), `cut-the-curve`, `motion-doctrine`, `60fps-animation`, `oversized-cursor`, `glassmorphism`, `reel-css-animations` | Implements the `#121417` ink and `#D4B064` gold broadcast palette, mechanical split-flap boards, velocity-matched cubic bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`), animated educational cursor pointers, and frosted glass telemetry HUDs. |
| **Kinetic Video Engine** | `remotion-best-practices`, `remotion-render`, `remotion-kinetic-kit`, `remotion-bits`, `remotion-captions`, `captions-overlay`, `hyperframes` | Assembles modular React/Remotion compositions with sub-frame spring physics (`stiffness: 180, damping: 22`), word-by-word active karaoke captions, and unclipped 590px chart containers. |
| **Hardware Turbo Render** | `parallel_remotion_cluster.py`, `render_stock_explainers.py`, `render_reels.py`, `render_broadcast.py` | Permanent hardware acceleration (`--concurrency=8`, Angle/WebGL GPU rasterization, multi-worker process pools). FFmpeg zero-loss stream copy concatenation in < 2 seconds. |
| **Packaging & Repurposing** | `cover-thumbnail-brief`, `generate_viral_thumbnail.py`, `content-repurposer`, `cross-platform-reformatter`, `carousel-builder`, `viral-carousel`, `x-thread-strategy` | Generates high-CTR Hinglish custom thumbnails (`< 2MB`), 5-slide visual technical study carousels for Instagram/LinkedIn, and 6-tweet analytical X threads from a single chart study. |
| **Publishing & Lead Loop** | `ytstudio`, `ytstudio_publisher.py`, `caption-and-hashtags`, `comment-responder`, `dm-script-writer`, `social-analytics-report` | Direct zero-browser YouTube uploads via official `ytstudio` CLI and YouTube Data API with auto-generated YAML sidecars, automated SEO tags, and community funnels. |

---

## 3. End-to-End Pipeline Execution: The 6 Phases

### Phase 1: Pre-Production, Market Telemetry & Intelligence Sensing
1. **Verified Telemetry Ingestion**:
   - Extract raw figures strictly from user inputs or attached TradingView screenshots (CMP, 24h change, OHLC, Volume, OI Sentiment, DEMA stack 20/50/100/200, Volume Profile VAH/POC/VAL).
   - Never invent numbers or pull stale data from previous sessions.
2. **Context & Trend Spotting (`agent-reach` + `trend-spotter`)**:
   - Spot current retail sentiment and sector themes (e.g. "Auto sector breakout", "Defense pullback", "IT margin pressure").
3. **Audience Intent Sensing (`social-listening` + `audience-personas`)**:
   - Formulate the primary question retail traders are asking: *"Is this a real breakout or an institutional bull trap?"*

---

### Phase 2: Hook Architecture, Scriptwriting & Human Voice Polish
1. **The 3-Second Golden Rule (`virality` + `viral-hook-writer`)**:
   - **Frames 0–90 (First 3.0 Seconds)**: An unmistakable visual event must occur on screen immediately.
   - Prohibited: Static title cards, fading logos, "Hello viewers", or dead air.
   - Permitted: Live price counter surging, split-flap flipper clicking into place, oversized cursor snapping to a breakout candle, or a glowing VAH threshold break.
2. **4-Beat Narrative Architecture (`reel-scripter` + `reel-builder`)**:
   - **Beat 1: The Event & CMP Stamp (~7s)**: Live price action, 24h gain, session volume explosion, and market structure stamp.
   - **Beat 2: The Trend Alignment & 20 DEMA Defense (~9s)**: 20 DEMA slope, moving average ribbon (20/50/100/200), RSI(14) momentum.
   - **Beat 3: Volume Profile & Institutional Hurdle (~11s)**: Point of Control (POC) high-volume node, Month VAH barrier, and volume distribution.
   - **Beat 4: Invalidation Shelf & Mandatory SEBI Disclaimer (~8s)**: Precise numeric invalidation price floor, risk boundary, and educational disclaimer.
   - **MANDATORY VERBAL TARGET ARROW & VOLUME SURGE DOCTRINE (Non-Negotiable)**:
     * In every single broadcast and explainer script, the narration **MUST explicitly discuss**:
       1. **The Downward Red Arrow to Support Floors**: Pointing from live CMP downwards to critical cushions (e.g. 20 DEMA, POC, VAL) with exact rupee drop and percentage discount.
       2. **The Upward Green Arrow to Upside Targets**: Pointing from live CMP upwards to breakout thresholds (Target 1, Target 2, VAH) with exact rupee gain and percentage expansion.
       3. **The Session Volume Surge**: The visual volume surge histogram and Point of Control footprint proving institutional conviction rather than retail drift.
3. **The Voice Humanization Gate (`humanizer`)**:
   - Run draft narration through `humanizer`:
     * Strip predictable AI triads (*"It's not just X, it's Y and Z"*).
     * Eliminate stiff corporate buzzwords (*"testament"*, *"delve"*, *"paramount"*, *"game-changer"*).
     * Use natural, urgent, spoken Hindi/Hinglish phrasing with active verbs.
4. **Silent Viewer Text Overlays (`on-screen-text-writer`)**:
   - Author bold 2-to-4 word kinetic text overlays (e.g. `₹5,556 BREAKOUT`, `20 DEMA DEFENDED`, `POC ₹5,324 DEMAND`) that guide viewers watching with muted sound.
5. **High-Intent Closing CTA (`cta-writer`)**:
   - Formulate a clean 1-action closing trigger: *"Save this chart before tomorrow's 9:15 AM market open."*

---

### Phase 2.5: Interactive Beat-by-Beat Playbook & Approval Gate (Mandatory)

> [!IMPORTANT]
> **MANDATORY APPROVAL GATE WITH VISUAL PROOF**: The system MUST NEVER proceed to Phase 4 (Full Video Rendering) or Phase 5 (Publishing) without first generating frame stills for each beat, creating the custom viral thumbnail, presenting the complete Beat-by-Beat Playbook with attached visual screenshots, and receiving explicit user approval.

1. **Visual Frame Proof & Thumbnail Generation**:
   Before presenting the Playbook to the user:
   - **Render Beat Frame Screenshots**: Use `remotion still` to render high-definition JPEG frame stills at the exact midpoint frame of each beat:
     * `f00_intro.jpg`: 3-second hook visual anomaly (Frames 0–90)
     * `f01_law.jpg`: Beat 1 (Core Law & CMP Stamp)
     * `f02_poc.jpg`: Beat 2 (Institutional Floor Defense & VAL/POC)
     * `f03_dema20.jpg`: Beat 3 (Dynamic Moving Average Cushion)
     * `f04_vah.jpg`: Beat 4 (VAH Inflection & Hurdle)
     * `f05_targets.jpg`: Beat 5 (Upside Target Corridor)
     * `f06_macro.jpg`: Beat 6 (Macro Floor, Trailing Stop & SEBI Disclaimer)
   - **Render 16:9 Viral Thumbnail**: Execute `generate_viral_thumbnail.py` to create the broadcast-grade, high-CTR custom thumbnail (`*-youtube-16x9-thumbnail.jpg`) with Glowing Levels, CMP callout, and attached technical chart.
   - **Copy to Artifact Directory**: Copy all generated proof frame stills and the thumbnail to the active artifact directory so they can be embedded directly in the Playbook markdown and user chat.

2. **Playbook Presentation Format**:
   Present a structured artifact (`*_youtube_explainer_playbook.md`) and direct chat briefing containing:
   - **Thumbnail Visual Preview**: Embedded custom thumbnail image with CTR headline and badges.
   - **Market Telemetry Summary**: Symbol, CMP, 24h change, DEMA Stack (20, 50, 100, 200), Volume Profile (VAH, POC, VAL), Support floor, Upside targets.
   - **3-Second Hook Visual Anomaly**: Exact visual hook triggering at frames 0–90 with embedded `f00_intro` screenshot.
   - **Beat-by-Beat Production Table with Embedded Screenshots**:
     Each beat must feature:
     * **Visual Proof Screenshot**: Embedded direct image link to that beat's rendered frame still.
     * **Duration & Timestamp**: Timing in seconds and frame range.
     * **Narration**: Spoken Hindi/Hinglish narration stripped of AI tells.
     * **Kinetic Text Overlay**: Active on-screen HUD badge.
     * **Active Levels Highlighted**: Numeric prices and visual cues.
   - **Publishing Metadata Blueprint**:
     * **Title**: High-CTR Hinglish title (under 95 chars).
     * **Description**: Multi-line description with chapter timestamps and SEBI disclaimer.
     * **Tags**: Verified YouTube search tags.
     * **Thumbnail Sidecar**: Direct reference to the generated thumbnail file.

3. **Review & Approval Pause**:
   - Conclude turn with: *"Here is your Beat-by-Beat Playbook for {SYMBOL} with visual proof screenshots for each beat and the custom thumbnail. Do you approve this playbook to proceed with automated Rendering (Remotion Turbo Mode) & direct YouTube Upload via the ytstudio API?"*
   - Stop and wait for the user to approve (e.g. *"Approved"*, *"Proceed"*, *"Yes"*).

4. **Automated Post-Approval Chain**:
   - Immediately upon receiving user approval, execute the downstream pipeline autonomously without further prompts:
     `render_stock_explainers.py --turbo` &rarr; `ytstudio_publisher.py` &rarr; Return Live Video URL.

---

### Phase 3: Visual Identity, Motion Graphics & Audio Studio

> [!IMPORTANT]
> **THE THREE NON-NEGOTIABLE VISUAL & VERBAL LAWS**:
> 1. **Pure Dark Slate Background Law (Strictly Black / Dark Mode)**: All chart captures and visual compositions MUST strictly use the institutional dark slate background (`themeMode: "dark"`, `#131722` / `#0B0F19`). White or light chart backgrounds are strictly prohibited. The capture tool injects `localStorage.setItem('themeMode', 'dark')` to guarantee dark background with colored wicks and volume bars.
> 2. **Mandatory Directional Target Arrow Law (Full-Spectrum SVG + Spoken Narration)**: Every technical beat MUST render dynamic SVG directional arrows originating from the live candle tip ($P_{\text{CMP}}$) to the active level (downward red arrow with collision-free delta badge `↘ DOWN -₹{delta} (-{pct}%) BELOW LIVE` for supports; upward green arrow with delta badge `↗ UP +₹{delta} (+{pct}%) ABOVE LIVE` for targets). Furthermore, the narration **MUST explicitly speak and discuss these arrows, their exact direction, price level, and percentage distance from CMP**.
> 3. **Mandatory Volume Surge Law (Prominent Histogram + Narrative Proof)**: The bottom session volume surge bars and left Volume Profile Point of Control (POC) accumulation footprint MUST be prominently visible on the chart canvas, highlighted with laser sweeps/bounding boxes, and vocally analyzed in the script as the bedrock of institutional volume validation.

1. **Broadcast Visual Grammar (`lemo-opuscar` news-package)**:
   - Palette: Deep Ink `#121417`, Card Surface `#1B1E23`, Alert Gold `#D4B064`, High-Contrast Accent `#F2CF1D`, Paper Straps `#F4F1E8`, Bullish Emerald `#10B981`, Bearish Flame `#FE6B3D`.
   - Typography: `Barlow Condensed` (Headlines & Numbers) + `IBM Plex Mono` (Telemetry & Levels).
   - Visual Modules: Split-flap mechanical price boards, persistent top-right `DEMA ANALYSIS` bug, and bottom status ticker.
2. **Motion Physics & Easing (`cut-the-curve` + `motion-doctrine` + `60fps-animation`)**:
   - All entrances and transitions use velocity-matched deceleration: `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Strictly animate GPU composite layers (`transform: translate3d(...)`, `opacity`). Never animate `width`, `height`, `top`, or `left`.
3. **Twin Radar Sonar & Directional Arrow Doctrine (Strictly Referenced from Live Price)**:
   - **All Technical Levels Defined from Live Price**: Every technical level (VAH, VAL, POC, 20 DEMA, 50 DEMA, 100 DEMA, 200 DEMA, Target 1, Target 2, and Trailing Stop) is systematically mapped and visually referenced from the current market price ($P_{\text{CMP}}$).
   - **Live CMP Beeping Sonar**: Anchored strictly at the latest candle tip ($X \approx 50.5\%, Y = P_{\text{CMP}}$) with an expanding green radar pulse and attached floating badge showing the live price (`● ₹{CMP} LIVE`).
   - **Active Level Radar Sonar & Price Over It**: In every single phase and beat, a dedicated radar beeping sonar pulses along the active level line in the open canvas ($X \approx 66\% - 80\%$), with a floating badge placed directly OVER the beeping sonar (`◈ {LEVEL_NAME}: ₹{LEVEL_PRICE}`).
   - **Full-Spectrum Directional Arrow from Live Price to Given Level**:
     * **Origin**: Arrow originates strictly at the Live Candle Tip ($X_1 = 50.5\%, Y_1 = P_{\text{CMP}}$).
     * **Level Below Live Price ($P_{\text{Level}} < P_{\text{CMP}}$)**: Applies to downward support levels (VAL, POC, 20 DEMA, 50 DEMA, 100 DEMA, 200 DEMA, Trailing Stop). The arrow points **DOWNWARDS** to the given level in solid **RED (`#FE6B3D`)** with a red arrowhead marker (`url(#arrow-red-point)`), accompanied by a collision-free delta badge ($X_{\text{mid}} \approx 40\%$): `↘ DOWN -₹{delta} (-{pct}%) BELOW LIVE`.
     * **Level Above Live Price ($P_{\text{Level}} > P_{\text{CMP}}$)**: Applies to upward upside targets (Target 1 / Session High, Target 2 / Value Corridor). The arrow points **UPWARDS** to the given level in solid **GREEN (`#10B981`)** with a green arrowhead marker (`url(#arrow-green-point)`), accompanied by a delta badge: `↗ UP +₹{delta} (+{pct}%) ABOVE LIVE`.
     * **Dynamic Multi-Level State Tracking**: Audio cues dynamically resolve the active level across all 6 phases (`poc`, `val`, `dema20`, `vah`, `target1`, `target2`, `dema50`, `dema100`, `dema200`, `stop`).
4. **Interactive Volume Profile Highlight Animation**:
   - **Trigger**: Activates automatically whenever the script discusses volume accumulation, institutional footprint, or Point of Control (Phase 1, $frame \ge 1100$).
   - **Visual Components**:
     * **Neon Scanner Bounding Box**: Highlight border (`#F2CF1D`, 2px dashed with glowing shadow) framing the left volume profile histogram (`x: 0%` to `35%`).
     * **Laser Sweep Beam**: High-energy vertical laser sweep bar scanning through the volume distribution with harmonic oscillation.
     * **POC Node Illumination**: Highlighting the Point of Control bar in vibrant flame (`#FE6B3D`) with glowing depth.
     * **Floating Telemetry Card**: High-contrast glass badge reading `VOLUME PROFILE ACCUMULATION: 16.01M NODE` with pulsing indicator.
     * **Dynamic Energy Ray**: Animated dashed connection line linking the highest volume node directly to the Live Price candlestick, proving institutional accumulation.
5. **Telemetry Matrix Real-Time Synchronization**:
   - The right-hand sidebar level matrix (VAH, 20 DEMA, POC, VAL, Target 1, Target 2) dynamically illuminates the active level card in real-time with an active glow border and color-coded accent tag as the narration progresses through the beats.
6. **Interactive Visual Guidance (`oversized-cursor`)**:
   - Educational pointer enters from off-screen, snaps to the decisive candlestick or DEMA crossover point with a micro-click pulse, and guides the viewer's eye to the support shelf.
7. **Kinetic Caption Overlays (`captions-overlay` + `remotion-kinetic-kit`)**:
   - Active word karaoke highlighting with `#F2CF1D` gold pill text on a translucent dark rail.
   - Placed at safe bounds: `top: 86px` for 16:9 Master; `bottom: 240px` for 9:16 Vertical Reels. Zero reserved empty space.
8. **Audio Studio & Procedural Score (`parallel_audio_synthesizer.py` + `sound-design`)**:
   - Synthesize all broadcasts and explainer masterclasses in natural **Hinglish** using `edge-tts` with voice **`hi-IN-SwaraNeural` (Hindi Female)** matching institutional daily market broadcasts.
   - Procedural 120 BPM newsroom electronic score bed mixed under speech.
   - 45Hz sub-bass impact drops on beat transitions.
   - Strict EBU R128 Loudness Normalization: integrated `-14.0 LUFS` (Peak: `-1.5 dBFS`).
   - Zero voice overlap: guaranteed `450ms` clean pause between sequential audio chunks.

---

### Phase 4: Hardware-Accelerated Cluster Rendering & Quality Gate
1. **Permanent Turbo Mode Standard**:
   - All render commands default to `--concurrency=8` with ANGLE WebGL rasterization.
   - Single 40s vertical reel renders in **~22s**.
   - Single 130s widescreen masterclass renders in **~70s**.
   - Multi-process cluster distributes batch jobs across worker pools at `concurrency=4` per worker.
2. **Zero Chart Clipping Mandate (100% Technical Visibility)**:
   - Container allocated a minimum height of `590px` (standard: `590px` to `600px`).
   - CSS `objectFit: 'contain'` and `objectPosition: 'center center'`.
   - Candlesticks, DEMA curves, top ticker metadata, bottom date/time axis, and right price axis must remain 100% visible and unclipped.
3. **Zero-Loss Stream-Copy Concatenation**:
   - Stitch individual chapter MP4s into the 16:9 Master Broadcast using FFmpeg stream-copy (`-c copy`) in under 2.0 seconds with zero re-encoding loss.

---

### Phase 5: Packaging, Cross-Platform Repurposing & Direct YouTube API Publishing
1. **Viral Thumbnail Generation (`cover-thumbnail-brief` + `generate_viral_thumbnail.py`)**:
   - Simultaneous authoring of 16:9 Master (`1920×1080`) and 9:16 Reel (`1080×1920`) thumbnails.
   - High-contrast typography, Hinglish curiosity hook (*"बड़ा उलटफेर शुरू?"*), gold/emerald glows, and unclipped chart crop.
2. **Multi-Format Repurposing Engine (`content-repurposer`)**:
   - **9:16 Vertical Reels** (`cross-platform-reformatter`): Exported for YouTube Shorts, Instagram Reels, and TikTok.
   - **5-Slide Visual Carousel** (`carousel-builder` + `viral-carousel`): Slide 1 Scroll-Stopper, Slide 2 DEMA Stack, Slide 3 Volume Profile Footprint, Slide 4 Support Shelf, Slide 5 Levels Cheat-Sheet.
   - **6-Tweet Analytical Thread** (`x-thread-strategy`): Structured post-market recap on X with attached chart snapshots.
3. **Direct Zero-Browser YouTube API Upload & Native Scheduling (`ytstudio` + `ytstudio_publisher.py`)**:
   - Uses the official `ytstudio` CLI and YouTube Data API v3; zero browser automation, zero DOM selectors.
   - Automatically creates matching YAML sidecars (`{video}.yaml`) with title, description, tags, category ID (27: Education), and optional `publish_at` ISO-8601 timestamp.
   - **Native YouTube Scheduled Releases (Zero Local Sleep)**: For multi-video queues (e.g. hourly drops), videos can be uploaded immediately with `publish_at: "YYYY-MM-DDTHH:MM:SS+05:30"` and `privacy: private`. YouTube natively schedules and releases the video publicly at the exact target time. Eliminates local machine sleep waits while enforcing the 1-hour broadcast cadence on the channel.
   - Pairs custom thumbnails (`{video}.jpg`) with matching basenames.
   - Executes `ytstudio videos upload {video_path} --execute` to upload and schedule seamlessly.
4. **Community Lead Loop (`comment-responder` + `dm-script-writer`)**:
   - Pins an engagement comment prompting viewers to share their watchlist levels.
   - Automates educational DM scripts for viewers requesting technical study cheat-sheets.

---

## 4. Operational Runbooks

### Runbook 1: Complete End-to-End Multi-Skill Suite Execution

Executes the entire 6-phase pipeline with interactive playbook approval:

```bash
# Formulates beat playbooks, pauses for approval, then triggers turbo render & ytstudio upload
python .agents/skills/dema-broadcast-master/scripts/run_parallel_broadcast.py \
  --market-data data/dema_suite_20261119.json \
  --out-dir DEMA_Daily_Study_Pack \
  --render-workers 3 \
  --upload
```

---

### Runbook 2: Single-Stock Deep Dive Explainer (Playbook &rarr; Render &rarr; ytstudio Upload)

Generates a dedicated technical masterclass for any stock with an attached TradingView chart:

```bash
# Step 1: Formulate & Present Beat-by-Beat Playbook to the user
# >>> PAUSE FOR USER APPROVAL <<<

# Step 2: (Post-Approval) Synthesize humanized 6-beat audio and timing manifest
python .agents/skills/dema-broadcast-master/scripts/build_stock_explainer_audio.py \
  --symbol HEROMOTOCO

# Step 3: (Post-Approval) Render 16:9 Widescreen Masterclass in Turbo Mode (concurrency=8)
python .agents/skills/dema-broadcast-master/scripts/render_stock_explainers.py \
  --symbol HEROMOTOCO \
  --format 16x9 \
  --turbo

# Step 4: (Post-Approval) Generate High-CTR Thumbnail
python .agents/skills/dema-broadcast-master/scripts/generate_viral_thumbnail.py \
  --format 16x9 \
  --out DEMA_Daily_Study_Pack/02_Thumbnails/DEMA_Master_HEROMOTOCO.jpg \
  --headline "HERO MOTOCORP ₹5,556" \
  --sub "Breakout या Trap?" \
  --chart modi-remotion/public/charts/HEROMOTOCO_1D_chart.png

# Step 5: (Post-Approval) Automatically Upload to YouTube via ytstudio API
python .agents/skills/dema-broadcast-master/scripts/ytstudio_publisher.py \
  --video DEMA_Daily_Study_Pack/01_Master/HEROMOTOCO_16x9_master.mp4 \
  --thumbnail DEMA_Daily_Study_Pack/02_Thumbnails/DEMA_Master_HEROMOTOCO.jpg \
  --title "HERO MOTOCORP ₹5,556 BREAKOUT! 20 DEMA Defense & Targets" \
  --description "Institutional DEMA and Volume Profile Technical Masterclass..." \
  --tags "HeroMotoCorp,DEMA,StockMarket,Breakout,NiftyAuto" \
  --privacy public
```

---

### Runbook 3: High-CTR Viral Thumbnail Generation

Authors high-contrast Hinglish thumbnails while Remotion renders:

```bash
# 16:9 Master Broadcast Thumbnail
python .agents/skills/dema-broadcast-master/scripts/generate_viral_thumbnail.py \
  --format 16x9 \
  --out DEMA_Daily_Study_Pack/02_Thumbnails/DEMA_Master_Thumbnail.jpg \
  --headline "NIFTY BREAKOUT & AUTO SURGE" \
  --sub "HERO MOTOCORP BLAST! क्या यह असली ब्रेकआउट है?" \
  --badge "DAILY BROADCAST · DEMA MASTER" \
  --chart modi-remotion/public/charts/HEROMOTOCO_1D_chart.png

# 9:16 Vertical Reel Thumbnail
python .agents/skills/dema-broadcast-master/scripts/generate_viral_thumbnail.py \
  --format 9x16 \
  --out DEMA_Daily_Study_Pack/02_Thumbnails/DEMA_Reel_HEROMOTOCO_thumb.jpg \
  --headline "HERO MOTOCORP ₹5,556" \
  --sub "Breakout या Trap?" \
  --ticker "HEROMOTOCO" \
  --chart modi-remotion/public/charts/HEROMOTOCO_1D_chart.png
```

---

### Runbook 4: Automated Zero-Browser YouTube API Upload (ytstudio)

Publishes any rendered explainer video or short directly to YouTube with automated sidecars and thumbnails:

```bash
python .agents/skills/dema-broadcast-master/scripts/ytstudio_publisher.py \
  --video "sagility-support-resistance-explainer-16x9.mp4" \
  --thumbnail "sagility-youtube-16x9-thumbnail.jpg" \
  --title "SAGILITY INDIA ₹45.25 BREAKOUT! VAH Blast & 20/50 DEMA Golden Cross" \
  --description "Detailed Institutional Technical Analysis for Sagility India..." \
  --tags "Sagility,DEMA,Breakout,StockMarket,TechnicalAnalysis" \
  --privacy public
```

---

### Runbook 5: Live Universe Scanning & Setup Discovery (dema-scan CLI)

End-to-end stock scanner connecting heartbeat backend, volume/proximity filters, and the video pipeline:

```bash
# 1. Healthcheck backend & verify Google Cloud Shell heartbeat
dema-scan check

# 2. Trigger full universe scan across all NSE moving average stocks
dema-scan scan --wait

# 3. Filter for institutional setups: Turnover >= ₹200 Cr, within ±0.2% of VAH / POC / 20 DEMA
dema-scan filter -v 200 -p 0.2 -l any

# 4. Capture 1080p chart screenshot (autonomous guest login bypasses login gate, captures .tv-lightweight-charts)
dema-scan chart UGROCAP
# or: dema-scan screenshot -s UGROCAP

# 5. Formulate Beat-by-Beat Playbook, wait for approval, render, and upload to YouTube
dema-scan produce -s UGROCAP
```

> [!TIP]
> **Autonomous Guest Login Pipeline (`capture_stock_chart.mjs`)**: The web app at `https://moving-average-alpha.vercel.app` routes unauthenticated requests to `/login`. The screenshot pipeline automatically navigates to `/login`, detects the guest access gate, clicks `Continue as Guest (Instant Access)`, establishes the session, loads the `/stock/{SYMBOL}` chart, waits for `.tv-lightweight-charts` rendering, and saves the isolated chart without any login screen interference.

---

### 5. Fourteen-Point Production Quality Gate (With Non-Negotiables)

Before publishing or delivering any video package, verify all 14 criteria:

- [ ] **1. Pure Dark Slate Background Law (NON-NEGOTIABLE)**: All captured chart screenshots strictly feature a pure black / dark slate background (`#131722` / `#0B0F19`); white or light backgrounds are 100% prohibited.
- [ ] **2. All Targets in Single Picture / Dual View Law (NON-NEGOTIABLE)**: Chart screenshots must be captured with sufficient vertical headroom (by clicking `Center Today` and expanding the vertical price scale downward) so that **ALL TARGETS** (Target 1, Target 2, VAH) and **ALL SUPPORTS** (20 DEMA, 50 DEMA, 100 DEMA, 200 DEMA, POC, VAL) are **100% visible in a single picture**. Alternatively, capture two screenshots per stock: Macro full target view (`{SYMBOL}_macro_chart.png`) and Detail execution view (`{SYMBOL}_detail_chart.png`).
- [ ] **3. Central Origin Mapping Law (NON-NEGOTIABLE)**: In the Remotion visual engine, the Live CMP pivot is positioned at the horizontal center (`X = 50.0%`). **ALL TARGETS AND SUPPORTS MUST MAP DIRECTLY FROM THE CENTRE** (`x1: 500, bottom1: cmpBottom`). Target 2 must never be chained from Target 1; both Target 1 and Target 2 must radiate directly from the central CMP node.
- [ ] **4. Dual Directional Target Arrows in Beat 1 (NON-NEGOTIABLE)**: Beat 1 Core Law must render **BOTH** a downward solid red arrow to the primary dynamic support cushion (20 DEMA) AND an upward solid green arrow to Target 1, each with numerical delta badges (`-₹X.XX (-Y.YY%)` and `+₹X.XX (+Y.YY%)`) radiating from the center Live CMP.
- [ ] **5. Strict Audio-Visual Arrow & Caption Match (NON-NEGOTIABLE)**: Narration and on-screen captions must 100% correspond to visual arrows on screen. When narration discusses support below CMP, screen shows a downward red arrow; when narration discusses breakout targets above CMP, screen shows upward bright green arrows to Target 1 and Target 2. Zero negative/red target arrows for upside levels.
- [ ] **6. Target Highway Expansion Corridor (NON-NEGOTIABLE)**: In Beat 5 (Targets), both Target 1 and Target 2 are visually connected via a highlighted shaded expansion corridor box with active radar pings, and both target arrows emanate from the central CMP.
- [ ] **7. Mandatory Volume Surge Law (NON-NEGOTIABLE)**: Chart prominently displays session volume surge bars, the exact session turnover in Crores (`₹XXX Cr`), and left Volume Profile POC accumulation / VAL floor, with vocal narrative emphasis proving institutional conviction.
- [ ] **8. Strict Level Telemetry Classification (NON-NEGOTIABLE)**: The Level Matrix Telemetry sidebar strictly segregates levels: `▲ UPSIDE TARGETS (ABOVE CMP)` for levels > CMP (Target 1, Target 2, VAH), and `▼ DYNAMIC SUPPORTS (BELOW CMP)` for levels < CMP (20/50/100/200 DEMA, POC, VAL). Supports below CMP must NEVER be labeled as resistance.
- [ ] **9. No-Clip Stable Viewport Law (NON-NEGOTIABLE)**: Camera motion during target phases must maintain a stable scale (`cameraScale = 1.0`, `cameraPanY = 0`) to guarantee that overhead breakout targets are never pushed outside the viewport by artificial zoom.
- [ ] **10. Verified Data Only**: Every price, DEMA level, and volume figure strictly matches verified inputs; zero hallucinated levels.
- [ ] **11. Beat-by-Beat Playbook User-Approved**: The full narration script, kinetic text, radar actions, and publishing metadata were reviewed and explicitly approved by the user prior to rendering.
- [ ] **12. 3-Second Visual Hook (`virality`)**: Frame 0 to 3s contains an active visual event (counter surge, cursor snap, split-flap flip); zero static title cards.
- [ ] **13. Humanized Narration (`humanizer`)**: Audio script reads as natural spoken language; zero robotic AI triads, buzzwords, or corporate filler.
- [ ] **14. Hardware Turbo Execution & Direct API Upload / Native Scheduling (`ytstudio`)**: Remotion renders executed with `--concurrency=8` and ANGLE WebGL acceleration; thumbnail `< 2MB` uploaded directly via `ytstudio_publisher.py`. Multi-video queues leverage native YouTube `publish_at` scheduling (ISO-8601 timestamps spaced 1 hour apart) to dispatch uploads immediately without local computer sleep delays.

---

## 6. Directory Structure & Reference Links

```text
.agents/skills/dema-broadcast-master/
├── SKILL.md                                  # Master Orchestrator Manual (v4.2.0)
├── README.md                                 # Public Architecture & Documentation
├── references/
│   ├── subskills-pipeline-matrix.md          # Complete Subskills Interoperability Matrix
│   ├── broadcast-doctrine.md                 # Screen geometry, safe zones, 6-pillar formula
│   ├── decluttered-laser-doctrine.md         # Single-level isolation & laser sweep specs
│   ├── sound-design.md                       # Zero voice overlap engine & 120 BPM formulas
│   └── caption-system.md                     # Kinetic word-by-word karaoke specs
├── scripts/
│   ├── dema_scanner.py                       # DEMA Stock Scanner & End-to-End Broadcast CLI (dema-scan)
│   ├── ytstudio_publisher.py                 # Direct zero-browser YouTube API publisher (ytstudio)
│   ├── run_parallel_broadcast.py             # Master parallel pipeline coordinator
│   ├── parallel_audio_synthesizer.py         # Async edge-tts + 120 BPM score + loudnorm
│   ├── parallel_remotion_cluster.py          # Multi-process Remotion render cluster + FFmpeg concat
│   ├── generate_viral_thumbnail.py           # High-CTR 16:9 and 9:16 viral thumbnail generator
│   ├── build_stock_explainer_audio.py        # Universal 6-beat stock explainer audio + manifest
│   ├── render_stock_explainers.py            # Universal stock explainer renderer (Turbo concurrency=8)
│   ├── build_audio.py                        # 16:9 broadcast TTS + 120 BPM bed + foley
│   ├── build_reel_audio.py                   # 9:16 Zero-overlap TTS engine + SFX
│   ├── render_broadcast.py                   # 16:9 Remotion concurrency render (Turbo concurrency=8)
│   ├── render_reels.py                       # 9:16 Vertical reels renderer (Turbo concurrency=8)
│   └── validate_market_data.py               # JSON schema validator for daily telemetry
├── templates/
│   ├── StockExplainerReel.jsx                # Universal 9:16 Vertical Explainer Reel
│   ├── StockYouTubeExplainer16x9.jsx         # Universal 16:9 Widescreen Explainer Masterclass
│   ├── DemaIntro.jsx                         # Master DEMA branded intro sting (3.5s)
│   ├── DemaOutro.jsx                         # Master DEMA responsive outro end card (5.0s)
│   ├── DemaMasterRoot.jsx                    # Universal Remotion Root
│   ├── SharedNewsPackage.jsx                 # UI components: Captions, Straps, Wipes
│   ├── DemaMasterChapters.jsx                # Complete 5-act broadcast Remotion component
│   ├── DemaVerticalReels.jsx                 # Synchronized 4-beat unclipped vertical reels
│   └── brand.json                            # Canonical brand tokens
└── schemas/
    ├── market_data_schema.json               # JSON Schema definition for daily market telemetry
    ├── sample_market_data.json               # Example daily market data with image references
    └── sample_reel_manifest.json             # Manifest structure for audio-visual sync
```
