# Broadcast Visual Doctrine & Layout Architecture

The **DEMA Broadcast Master** layout is designed for institutional financial television aesthetics (Bloomberg / CNBC / TradingView desk) scaled for modern 16:9 1080p rendering (1920×1080).

---

## 1. Frame Geometry & Layer Hierarchy

Every chapter composition adheres to an absolute coordinate grid with 24px edge margins:

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
| +-------------------------------------------------------------------------------+ | 964px
| | [MARGIN 12px]                                                                 | |
| +-------------------------------------------------------------------------------+ | 976px
| | [LOWER THIRD STRAP] (H: 92px) Dual-Rail: Major Indices + Fast Marquee Ticker  | |
| +-------------------------------------------------------------------------------+ | 1056px
| [MARGIN 24px]                                                                     |
+-----------------------------------------------------------------------------------+ 1080px
```

---

## 2. Core UI Atoms (`SharedNewsPackage.jsx`)

1. **`WideChapterShell`**:
   - Manages top brand chrome, background micro-grid, timecode clock, watermark, and footer straps.
   - Houses the `<BroadcastCaptionOverlay />` to ensure identical styling and flawless alignment across every act.
2. **`LowerThirdStrap`**:
   - **Top Rail**: Primary index telemetry badges (`NIFTY 50`, `BANKNIFTY`, `SENSEX`, `INDIA VIX`) with real-time green/red delta pills.
   - **Bottom Rail**: Continuous scrolling ticker displaying full-market stock quotes and commodity prices.
3. **`SplitFlapBoard` & `SplitFlapChar`**:
   - Authentic 3D mechanical split-flap simulation with top/bottom flap leaves, shadow crease, and stepped character flipping.
   - Synchronized to high-frequency mechanical click foley audio.
4. **`BroadcastCaptionOverlay`**:
   - High-contrast obsidian glass capsule (`rgba(9, 13, 20, 0.94)`) with signature gold border (`rgba(242, 207, 29, 0.55)`).
   - Positioned at `bottom: 122px`, ensuring zero visual overlap with either the main stage cards or the lower third strap.
5. **`TradingViewFootprint`**:
   - Algorithmic technical chart with candlestick/volume profile bars, 20/50/100/200 DEMA ribbons, POC (Point of Control) golden dashed line, and VAH/VAL value area zones.

---

## 3. Five-Act Narrative Structure

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

