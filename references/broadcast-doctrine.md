# Broadcast Visual Doctrine & Layout Architecture

The **DEMA Broadcast Master** layout is designed for institutional financial television aesthetics (Bloomberg / CNBC / TradingView desk) scaled for modern 16:9 1080p broadcast rendering (1920×1080) and 9:16 vertical viral reels (1080×1920).

---

## 1. Frame Geometry & Layer Hierarchy (16:9 Master Broadcast)

Every 16:9 chapter composition adheres to an absolute coordinate grid with 24px edge margins:

```text
+-----------------------------------------------------------------------------------+ 0px
| [MARGIN 24px]                                                                     |
| +-------------------------------------------------------------------------------+ | 24px
| | [TOP HEADER STRAP] (H: 72px) DEMA Brand | Session Chip | Date | LIVE REC      | |
| +-------------------------------------------------------------------------------+ | 96px
| | [MARGIN 16px]                                                                 | |
| +-------------------------------------------------------------------------------+ | 112px
| |                                                                               | |
| |                             MAIN STAGE AREA                                   | |
| |                           (Height: 838px)                                     | |
| |                                                                               | |
| |   [Act 1: Split-Flap Matrix]       [Act 2: Macro Multi-Cards]                 | |
| |   [Act 3: Sector Heatmap Table]    [Act 4: 200 DEMA Order Flow Chart]         | |
| |   [Act 5: Tomorrow's Range Plan & Tactical Playbook]                          | |
| |                                                                               | |
| |                                                                               | |
| |      +-----------------------------------------------------------------+      | | 912px (bottom: 122px)
| |      | [BROADCAST CAPTION OVERLAY] (CC · EN) Synchronized Capsule      |      | |
| |      +-----------------------------------------------------------------+      | | 958px
| | +-------------------------------------------------------------------------------+ | 964px
| | [MARGIN 12px]                                                                 | |
| +-------------------------------------------------------------------------------+ | 976px
| | [LOWER THIRD STRAP] (H: 92px) Dual-Rail: Major Indices + Fast Marquee Ticker  | |
| +-------------------------------------------------------------------------------+ | 1056px
| [MARGIN 24px]                                                                     |
+-----------------------------------------------------------------------------------+ 1080px
```

---

## 2. Five-Act Master Broadcast Narrative Structure (16:9)

* **Act 1: Executive Briefing & Post-Market Telemetry (~31.5s)**
  - Split-flap matrix reveals market stance.
  - Mandatory educational disclaimer and institutional context.
* **Act 2: Global Macro, Crude & Precious Metals (~47.5s)**
  - Multi-card split view: Gold ($3,886), Silver ATH, WTI ($89.14) & Brent ($96.81) energy surge, US 10Y Yield, DXY.
* **Act 3: Sectoral Heatmap, Gainers & Volume Titans (~49.0s)**
  - Top gainers table, top losers breakdown, and high-volume breakout radar (e.g. Moneyview 96M volume).
* **Act 4: Technical Deep Dive & Order Flow (~56.5s)**
  - Featured stock technical analysis (e.g. TMCV 200 DEMA squeeze, Volume Profile footprint, RSI momentum).
* **Act 5: Tomorrow's Strategy & Trade Range Plan (~30.0s)**
  - Exact Support, Pivot, and Resistance levels, action plan, and CTA subscription bumper.

---

## 3. 9:16 Vertical Viral Reel Architecture (1080×1920 @ 30fps)

Vertical reels are engineered for high-retention social distribution (YouTube Shorts, Instagram Reels, TikTok) while upholding strict institutional accuracy.

```text
+---------------------------------------------------+ 0px
| [TOP SAFE ZONE: 180px] Reserved for App Header    |
| +-----------------------------------------------+ | 60px
| | [TELEMETRY HEADER] Symbol | CMP | Session Δ%  | |
| +-----------------------------------------------+ | 140px
|                                                   |
|                ACTIVE STAGE AREA                  |
|                 (Y: 180px - 1450px)               |
|                                                   |
|   1. Intro Shockwave & Brand Sting (0:00 - 0:03.5)|
|   2. 3D Background Watermark Words                |
|   3. TradingView High-Res Technical Footprint     |
|   4. Continuous Causal Camera Moves               |
|   5. POC Golden Laser & Sonar Volume Radar Pulse  |
|   6. 50/200 DEMA Squeeze Dynamic Targets          |
|                                                   |
|   +-------------------------------------------+   | 1680px (bottom: 240px)
|   | [KINETIC KARAOKE CAPTIONS] 7-Word Window  |   |
|   +-------------------------------------------+   | 1780px
|                                                   |
|   +-------------------------------------------+   | 1808px (bottom: 112px)
|   | [VERTICAL LOWER THIRD] Key Price Levels   |   |
|   +-------------------------------------------+   | 1888px
| [BOTTOM SAFE ZONE: 120px] Reserved for Social UI  |
+---------------------------------------------------+ 1920px
```

### The 3-Act Reel Sequence

1. **Act 1: DEMA Master Intro Sting (`0:00 – 0:03.5` | Frames `0 – 105`)**
   - High-tech scanning wireframe crosshair windup snapping to an impact flash at `0.8s` (Frame 24).
   - Horizontal laser beam shockwave, DEMA logo drop, and *Algorithmic Technical Chart Studies* tagline.
   - Synchronized to `dema_intro_sting.mp3` with sub-bass drop and shutter snap.
2. **Act 2: Dynamic Technical Core Breakdown (`0:03.5 – 0:59.37` | Frames `105 – 1781`)**
   - Seamless cut into the TradingView chart with `IntroZoom` (1.09x -> 1.0x).
   - 4-Beat or 5-Beat causal camera choreography tracking liquidation cascades and rebounds.
   - Zero-overlap synthesized voiceover accompanied by procedural 120 BPM newsroom bed.
3. **Act 3: DEMA Master Outro End Card (`0:59.37 – 1:04.37` | Frames `1781 – 1931`)**
   - Responsive vertical terminal layout with top telemetry header, centered brand stack, glowing `Subscribe for Daily Telemetry →` CTA button, and regulatory compliance banner.
   - Native `dema_outro_bed.mp3` with smooth 1.5s outro fade-out.

---

## 5. Support, Resistance & Target Doctrine (The Stock Explainer Formula)

Every individual stock breakdown reel adheres to the universal institutional level hierarchy:

### The Fundamental Rule:
* **CMP (Current Market Price) is the Active Pivot**:
  - **Any level BELOW CMP $\rightarrow$ Acts as SUPPORT / SAFETY FLOOR**.
  - **Any level ABOVE CMP $\rightarrow$ Acts as RESISTANCE / UPWARD TARGET**.

```text
       +---------------------------------------------+
       | DEMA 200 (Macro Resistance / Reversal Target)|  ▲
       +---------------------------------------------+  |
       | DEMA 100 (Secondary Macro Target)           |  | RALLY UP
       +---------------------------------------------+  | TARGETS
       | VAH (Value Area High Expansion Corridor)     |  | (Resistance)
       +---------------------------------------------+  |
       | DEMA 50 (Immediate Inflection Hurdle)       |  ▲
============================================================= LIVE CMP (Current Price)
       | DEMA 20 (Reclaimed Dynamic Support)         |  ▼
       +---------------------------------------------+  |
       | POC (Point of Control / High Volume Floor)  |  | RALLY DOWN
       +---------------------------------------------+  | SUPPORTS
       | VAL (Value Area Low / Structural Floor)     |  | (Safety Nets)
       +---------------------------------------------+  ▼
```

### Directional Confirmation Rules:
1. **Falling Sequence (Cascade Down)**:
   - When a stock liquidates, price breaches short-term moving averages toward lower value boundaries.
   - The primary safety net is the **Point of Control (POC)** and **Value Area Low (VAL)**.
   - **Exhaustion Confirmation**: Massive institutional **Buy Volume** at the POC confirms absorption and marks the bottom.
2. **Rising Sequence (Rally Up & Reversal)**:
   - When price rebounds from POC, it first reclaims **DEMA 20**, which instantly flips from former resistance into dynamic support.
   - The immediate inflection battleground is **DEMA 50**. A daily close above DEMA 50 converts it into support and targets **VAH (Value Area High)**.
   - Breakout above VAH opens the corridor to macro institutional targets: **DEMA 100** and the trend-reversal **DEMA 200**.
   - **Momentum Confirmation**: Rebounds must be validated by expanding **Buy Volume** and fresh **Open Interest (OI) buildup**. Breakouts without volume/OI expansion are flagged as bull traps.


To maximize organic viewer retention while maintaining institutional credibility, all DEMA vertical reels combine six specialized skills:

1. **`viral-hooks` (First 3-Second Retention Trigger)**
   - Opens with curiosity or institutional money revelation: *"Big institutions just absorbed 1.1 million shares in Cummins India..."*
   - Avoids generic welcomes or channel pleasantries; hits the core thesis in Frame 1.
2. **`remotion-kinetic-kit` (High-Energy Camera Dynamics)**
   - `IntroZoom`: Smooth deceleration from 1.09x to 1.0x over the first 24 frames to establish immediate visual depth.
   - White `FlashCut`: 1-frame to 2-frame opacity flash on major chart phase transitions to reset cognitive attention.
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
