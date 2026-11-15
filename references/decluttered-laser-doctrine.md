# Decluttered Single-Level Laser Protocol & Universal Support/Resistance Doctrine

This document formalizes the visual and narrative doctrine for high-retention technical chart studies across both 16:9 widescreen YouTube videos and 9:16 vertical reels.

---

## 1. The Core Problem: Visual Cognitive Clutter

When multiple indicator lines (DEMA 20, 50, 100, 200, VAH, POC, VAL, VWAP, pivot points) are displayed simultaneously on a stock chart:
- Viewers experience immediate cognitive overload and cannot discern which level is being discussed.
- Competing lines distract from the primary narrative beat.
- The chart feels dense, overwhelming, and unapproachable.

---

## 2. The Solution: Dynamic Level Isolation Doctrine

### Rule 1: The Inactive Level Disappearance Law
- During any individual discussion beat, **all inactive overlay lines MUST be completely hidden**.
- Only two elements remain visible on the chart:
  1. **The Active Level** being analyzed in the current narration chunk.
  2. **The Current Market Price (CMP)** acting as the permanent reference boundary.

### Rule 2: Universal Support, Resistance & Target Law
- **Levels BELOW Current Price $\rightarrow$ Support / Safety Floor**:
  - If price cascades down, the lower levels act as sequential defense boundaries.
  - In Cummins India (`CUMMINSIND` CMP ₹4,369.00):
    - DEMA 20 (₹4,241.10) $\rightarrow$ Dynamic Rebound Support
    - Monthly POC (₹4,136.30) $\rightarrow$ 1.10M Volume Defense Floor
    - VAL (₹3,950.14) $\rightarrow$ Structural Value Area Low Baseline
- **Levels ABOVE Current Price $\rightarrow$ Resistance / Upside Targets**:
  - If price rallies up, higher levels serve as hurdles and profit targets.
  - In Cummins India:
    - DEMA 50 (₹4,368.15) $\rightarrow$ Immediate Inflection Hurdle
    - VAH (₹4,648.24) $\rightarrow$ Primary Target Corridor (+6.4%)
    - DEMA 100 (₹4,727.45) $\rightarrow$ Secondary Target
    - DEMA 200 (₹5,155.80) $\rightarrow$ Macro Trend Reversal Target (+18.0%)

### Rule 3: Directional Volume & OI Confirmation
- Support hold must be confirmed by **Buy Volume Absorption Spike**.
- Upward breakout must be confirmed by **Fresh Open Interest (OI) Accumulation**.

---

## 3. High-Engagement Motion Grammar

### A. Left-to-Right Glowing Laser Beam Sweep
Instead of instantly appearing, each level line draws on dynamically from left to right:
```jsx
// Sweep progress over 22 frames (0.73s @ 30fps)
const sweepProgress = clamp01((frame - activeCueStart) / 22);

<div
  style={{
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: `${levelBottomPct}%`,
    height: 4.5,
    backgroundColor: levelColor,
    boxShadow: `0 0 16px ${levelColor}, 0 0 35px ${levelColor}, 0 0 70px ${levelColor}CC`,
    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
    zIndex: 25,
  }}
>
  {/* Leading laser spark particle */}
  {sweepProgress < 1 && (
    <div
      style={{
        position: 'absolute',
        left: `${sweepProgress * 100}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        boxShadow: `0 0 20px #FFFFFF, 0 0 35px ${levelColor}`,
      }}
    />
  )}
</div>
```

### B. Live Price (CMP) Dual-Wave Circle-Out Sonar Radar Ping
The live price candle is permanently tracked with an expanding sonar echo:
```jsx
const pingCycle = 40; // 1.33s per pulse
const pingProgress = (frame % pingCycle) / pingCycle;
const pingScale = interpolate(pingProgress, [0, 1], [0.8, 3.6]);
const pingOpacity = interpolate(pingProgress, [0, 0.25, 1], [0.95, 0.75, 0]);

<div style={{ position: 'absolute', left: '73.5%', bottom: `${cmpBottomPct}%`, transform: 'translate(-50%, 50%)' }}>
  {/* White core */}
  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '0 0 10px #FFF, 0 0 20px #10B981' }} />
  {/* Expanding wave 1 */}
  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid #10B981', transform: `translate(-50%, -50%) scale(${pingScale})`, opacity: pingOpacity }} />
  {/* Expanding wave 2 (phase offset) */}
  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #22D3EE', transform: `translate(-50%, -50%) scale(${pingScaleOffset})`, opacity: pingOpacityOffset }} />
</div>
```

### C. Vertical Dashed Dimension Delta Indicator
A connecting dashed guide between CMP and the highlighted level:
```jsx
<div
  style={{
    position: 'absolute',
    left: '52%',
    bottom: `${Math.min(cmpBottom, levelBottom)}%`,
    height: `${Math.abs(cmpBottom - levelBottom)}%`,
    width: 2,
    borderLeft: `2px dashed ${levelColor}`,
    zIndex: 22,
  }}
>
  <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
    Δ -₹232.70 (-5.3%) SUPPORT FLOOR
  </div>
</div>
```

### D. Synchronized Telemetry Sidebar Spotlight
In 16:9 widescreen broadcast, the right telemetry matrix spotlights only the active level:
- Inactive level cards dim to `opacity: 0.32` and `scale(1.0)`.
- Active level card illuminates to `opacity: 1.0`, `scale(1.04)`, and gains a vivid glowing border (`box-shadow: 0 0 20px rgba(...)`).
- Volume confirmation and Open Interest gauges confirm directional bias.
