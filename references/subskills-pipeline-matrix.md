# DEMA Broadcast Master: Subskills Pipeline Matrix & Inter-Agent Contracts

This reference document defines the complete interoperability matrix and contract specifications between **`dema-broadcast-master`** and all specialized subskills in the video production pipeline.

---

## 1. End-to-End Subskills Choreography Matrix

| Pipeline Stage | Subskill | Invocation Role | Input Data Required | Output Artifact Delivered | Enforced Doctrine |
|---|---|---|---|---|---|
| **Phase 1: Intelligence** | `agent-reach` | Deep Web & Catalyst Lookup | Ticker, date, price shock | Verified news headlines, sector catalyst summary | Fact-based verification; zero hallucination. |
| **Phase 1: Intelligence** | `trend-spotter` | Market Buzz & Angle Detection | Market movers, top gainers/losers | High-resonance narrative angle (e.g. breakout vs trap) | Grounded in current retail trader conversation. |
| **Phase 1: Intelligence** | `audience-personas` & `social-listening` | Retail Trader Sentiment Audit | Comment logs, trade queries | Retail pain points, common confusion zones | Direct answer to retail questions (e.g. "Is 26,000 safe?"). |
| **Phase 1: Intelligence** | `competitor-teardown` | Competitive Format Benchmarking | Competitor video links/data | Pacing & retention benchmarks | Outperform competitor retention in first 5 seconds. |
| **Phase 2: Script & Hook** | `virality` | 3-Second Retention Architect | Raw chart + price move | Frame 0–3s visual disruption script | **Golden Rule**: Anomaly/event on screen within 90 frames. No logo/title cards. |
| **Phase 2: Script & Hook** | `viral-hook-writer` | Hook Formula Generator | Symbol, % change, key zone | 3 distinct hook scripts (Curiosity, Contrarian, Negation) | Formatted under 15 words; spoken in under 3.0s. |
| **Phase 2: Script & Hook** | `ab-hook-tester` | Split-Test Hook Evaluator | Winning hook pair | Variant A & B with isolated single-variable testing | Distinct psychological trigger per variant. |
| **Phase 2: Script & Hook** | `reel-scripter` & `reel-builder` | 4-Beat Core Script Author | Verified OHLC, DEMA, VP levels | 30–45s timed beat-sheet with visual directions | Strict 4-beat structure (CMP → D20 → D50/POC → Shelf). |
| **Phase 2: Script & Hook** | `humanizer` | AI Tell Eliminator & Voice Polish | Raw TTS narration draft | Natural, conversational Hindi/Hinglish spoken script | Strips stock AI triads, passive voice, and fake hype. |
| **Phase 2: Script & Hook** | `on-screen-text-writer` | Silent-Viewer Caption Crafter | Timed script beats | Bold, 2-to-4 word kinetic screen overlays | Designed for 80% silent mobile viewers. |
| **Phase 2: Script & Hook** | `cta-writer` | High-Intent Conversion CTA | Video objective | 4-second closing action (Save, Comment, Subscribe) | Single friction-free prompt without multi-step asks. |
| **Phase 3: Motion & Audio** | `lemo-opuscar` | Broadcast Visual Director | Data points, chart snapshots | Color tokens (`#121417`, `#D4B064`), typography specs | `news-package` styling, split-flap board, structure stamps. |
| **Phase 3: Motion & Audio** | `cut-the-curve` & `motion-doctrine` | Animation Physics & Easing | Remotion keyframe configs | Easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`), spring physics | Velocity-matched deceleration; zero linear motion. |
| **Phase 3: Motion & Audio** | `60fps-animation` | Render Performance Tuning | Remotion JSX components | GPU-composited CSS (`transform`, `opacity`) | Zero layout thrashing; hardware rasterization. |
| **Phase 3: Motion & Audio** | `remotion-kinetic-kit` & `remotion-bits` | Kinetic Component Library | Level pills, ticker chips | Spring-driven text entrances, cards, laser sweeps | Sub-frame smooth motion; spring stiffness=180, damping=22. |
| **Phase 3: Motion & Audio** | `captions-overlay` | Kinetic Subtitle Rail | Word-level Whisper timestamps | Overlay captions with active word karaoke highlights | True overlay on top of chart; zero reserved blank space. |
| **Phase 3: Motion & Audio** | `oversized-cursor` | Educational Pointer Directing | Candlestick & level coordinates | Animated cursor path targeting DEMA cross / VAH shelf | Targets exact coordinates; enters off-screen, taps, departs. |
| **Phase 3: Motion & Audio** | `glassmorphism` & `reel-css-animations` | Telemetry HUD Styling | Level matrices, POC boxes | Frosted backdrop blur, glowing neon border gradients | High legibility against dark charts; WCAG AA contrast. |
| **Phase 3: Motion & Audio** | `parallel_audio_synthesizer.py` | Audio & Procedural Sound Studio | Humanized script text | 48kHz audio chunks, 120 BPM bed, sub-bass drops | Zero voice overlap; EBU R128 loudness `-14.0 LUFS`. |
| **Phase 4: Hardware Render** | `remotion-render` & `remotion-studio` | Hardware Turbo Cluster | Remotion bundle, manifests | Rendered MP4 files (16:9 Master + 9:16 Reels) | Permanent Turbo Mode (`--concurrency=8`, `--gl=angle`). |
| **Phase 4: Hardware Render** | Zero Clipping Law | Chart Layout Validator | 16:9 TradingView snapshots | Verified unclipped viewport (`height: 590px`, `contain`) | 100% visible candlesticks, time axis, and price axis. |
| **Phase 4: Hardware Render** | FFmpeg Zero-Loss Concat | Master Broadcast Assembler | Chapter 1 to Chapter 8 MP4s | Concat Master Video (`1920×1080 @ 30fps`) | Stream-copy stitching in < 2.0s with zero generation loss. |
| **Phase 5: Packaging & Pub** | `cover-thumbnail-brief` | High-CTR Thumbnail Spec | Core dilemma, chart crop | Thumbnail design brief (Title, Sub, Color, Expression) | Extreme contrast, curiosity gap, zero tiny text. |
| **Phase 5: Packaging & Pub** | `generate_viral_thumbnail.py` | High-Res Thumbnail Generator | Thumbnail brief, chart image | 16:9 & 9:16 JPG thumbnails (`< 2MB`, 1080p/720p) | Gold/Emerald neon glow, Hinglish hook, verified chart zoom. |
| **Phase 5: Packaging & Pub** | `content-repurposer` | Multiformat Asset Atomizer | Master 16:9 script & levels | 9:16 Shorts, Carousel slides, X thread, Telegram note | Repurpose core study across 4 distinct native formats. |
| **Phase 5: Packaging & Pub** | `carousel-builder` & `viral-carousel` | Swipeable Visual Carousel | Stock levels, 4-beat breakdown | 5-slide PDF/PNG carousel for Instagram & LinkedIn | Slide 1 hook, Slide 2-4 chart breakdown, Slide 5 levels cheat-sheet. |
| **Phase 5: Packaging & Pub** | `x-thread-strategy` | Viral Market Recap Thread | Macro summary, movers, levels | 6-tweet structured analytical thread with chart attachments | Concise, data-driven, formatting with clean whitespace. |
| **Phase 5: Packaging & Pub** | `caption-and-hashtags` | Metadata & SEO Engine | Stock info, levels, disclaimer | YouTube title, description, timestamps, tags, hashtags | Compliance-checked SEBI disclaimer + chapter marks. |
| **Phase 5: Packaging & Pub** | `parallel_youtube_publisher.mjs` | Multi-Tab Browser Automation | Upload manifest, cookies | Published YouTube videos + Shorts with verified URLs | 2-3 isolated concurrent tabs; automated metadata entry. |
| **Phase 5: Packaging & Pub** | `comment-responder` & `dm-script-writer` | Community Conversion Engine | Audience comments, FAQ | Pinned comment prompt, educational follow-up flow | Converts viewers into engaged community members. |

---

## 2. Inter-Agent Communication Contracts

### Contract 1: Telemetry Ingestion to Script Engine
```json
{
  "symbol": "HEROMOTOCO",
  "cmp": 5556.00,
  "netChange": "+303.00 (+5.77%)",
  "ohlc": { "open": 5282.00, "high": 5560.50, "low": 5261.50, "close": 5556.00 },
  "volume": "1.34 M",
  "oiSentiment": "85% Bullish (Long Buildup)",
  "rsi14": 60.91,
  "dema": { "d20": 5385.92, "d50": 5309.92, "d100": 5282.91, "d200": 5200.88 },
  "volumeProfile": { "vah": 5498.15, "poc": 5324.60, "val": 5151.05 },
  "chartPath": "modi-remotion/public/charts/HEROMOTOCO_1D_chart.png"
}
```

### Contract 2: Script Engine to Audio & Motion Engine
```json
{
  "beats": [
    {
      "id": "beat1_hook",
      "text": "Hero MotoCorp ne banaya naya breakout, 5,556 par closing. Lekin kya yeh rally sustain hogi?",
      "onScreenText": "HERO MOTOCORP\n₹5,556 BREAKOUT",
      "visualFocus": "CMP_STAMP",
      "cursorTarget": { "x": 0.85, "y": 0.38 }
    },
    {
      "id": "beat2_dema",
      "text": "Stock ne 20 DEMA 5,385 aur 50 DEMA 5,310 ko aggressively cross kiya hai. Trend fully bullish hai.",
      "onScreenText": "20 DEMA DEFENDED\n₹5,385 SUPPORT",
      "visualFocus": "DEMA_STACK",
      "cursorTarget": { "x": 0.72, "y": 0.44 }
    },
    {
      "id": "beat3_vp",
      "text": "Volume Profile par Month VAH 5,498 ke upar acceptance mil chuki hai, jabki POC 5,324 par strong demand base hai.",
      "onScreenText": "ABOVE MONTH VAH\n₹5,498 CLEARED",
      "visualFocus": "POC_VAH_GRID",
      "cursorTarget": { "x": 0.88, "y": 0.40 }
    },
    {
      "id": "beat4_invalidation",
      "text": "Jab tak price 5,385 ke upar trade kar raha hai, structure safe hai. 5,324 break hone par invalidation trigger hoga.",
      "onScreenText": "SUPPORT: ₹5,385\nINVALIDATION: ₹5,324",
      "visualFocus": "SUPPORT_SHELF",
      "cursorTarget": { "x": 0.78, "y": 0.52 }
    }
  ]
}
```

---

## 3. Subskill Integration Rules

1. **The 3-Second Golden Rule (`virality` + `viral-hook-writer`)**:
   Every generated video or reel MUST execute an anomaly or visual shock event in the first 90 frames (3 seconds). Do NOT open with a static brand plate, generic title card, or slow voiceover greeting. Open with the live price spike, an animated cursor targeting the breakout candle, or a bold split-flap count-up.

2. **The Humanizer Doctrine (`humanizer`)**:
   Never feed AI-generated filler to `parallel_audio_synthesizer.py`. Always pass scripts through `humanizer` to eliminate corporate jargon, passive sentence constructs, and predictable rhythmic cadences. Narration must read like a senior institutional market analyst speaking directly and urgently to a trader.

3. **The 60 FPS Composite Rule (`60fps-animation` + `cut-the-curve`)**:
   All dynamic overlays, split-flap flippers, cursor movements, and level callouts in Remotion must animate strictly using CSS `transform` (translate3d, scale) and `opacity`. Never animate `top`, `left`, `width`, or `height` directly during playback to prevent frame drops. Use `cubic-bezier(0.16, 1, 0.3, 1)` easing.

4. **The Zero Chart Clipping Mandate**:
   The TradingView technical chart is the supreme source of truth. The chart container must maintain a minimum height of `590px` with `objectFit: 'contain'`. Candlestick wicks, DEMA ribbon traces, top ticker details, and both bottom (time) and right (price) axes must be 100% visible at all times.

5. **Multi-Format Repurposing Pipeline (`content-repurposer` + `carousel-builder` + `x-thread-strategy`)**:
   No technical chart study is complete until it has produced:
   - 16:9 YouTube Widescreen Masterclass
   - 9:16 Vertical Reel (Shorts/TikTok/Instagram)
   - 5-Slide PDF Carousel (LinkedIn/Instagram)
   - 6-Tweet Analytical Thread (X/Twitter)
   - High-CTR Hinglish Custom Thumbnails (16:9 & 9:16)
