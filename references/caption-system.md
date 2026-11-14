# Caption System & Subtitle Integration

The DEMA Broadcast Master employs a two-tier caption architecture:
1. **On-Screen Synchronized Kinetic Word-by-Word Karaoke Overlay (`KineticBroadcastCaptions` / `BroadcastCaptionOverlay`)** burned into Remotion for both 16:9 master broadcasts and 9:16 vertical reels.
2. **External Subtitle Tracks (`.srt` and `.vtt`)** for YouTube Closed Captions (CC) and interactive web players.

---

## 1. On-Screen Kinetic Karaoke Overlay (`KineticBroadcastCaptions`)

Captions follow the gold-standard viral reel kinetic styling:
- **Word-by-Word Highlight**: The exact spoken word pops in real time using edge-tts timestamp progress derived from audio chunks.
- **Active Word Pill**: The current active word is highlighted with a radiant yellow/gold pill (`#F2CF1D`), dark ink text (`#121417`), bold weight `800`, scale `1.10`, and glowing accent shadow.
- **Past Words**: Rendered in high-contrast crisp white (`#FFFFFF`, weight `700`).
- **Upcoming Words**: Rendered in translucent paper (`rgba(244, 241, 232, 0.45)`).
- **Paged Word Window**: Displays 7 words on 9:16 vertical reels and 10 words on 16:9 master broadcasts to maintain maximum legibility without cluttering charts or screens.
- **Manifest Auto-Resolution**: Detects `chapterId` or `reelId` and automatically grabs matching speech chunks from `dema_suite_audio_manifest_en.json` or `manifest.json`.

---

## 2. 3D Background Watermark Typography

In vertical reels (`CumminsMotionDoctrineReel.jsx`), high-impact technical terms appear as giant, translucent 3D typographic watermarks floating directly behind the chart layer:

```jsx
const WATERMARK_WORDS = [
  { text: 'ACCUMULATION', startFrame: 0, endFrame: 240, color: 'rgba(34, 211, 238, 0.07)' },
  { text: 'LIQUIDATION',  startFrame: 240, endFrame: 540, color: 'rgba(239, 68, 68, 0.08)' },
  { text: 'ABSORPTION',   startFrame: 540, endFrame: 960, color: 'rgba(242, 207, 29, 0.08)' },
  { text: 'MEAN REVERSION', startFrame: 960, endFrame: 1350, color: 'rgba(16, 185, 129, 0.07)' },
  { text: 'BREAKOUT',     startFrame: 1350, endFrame: 1800, color: 'rgba(242, 207, 29, 0.09)' },
];
```

* Rendered at `fontSize: 110px`, `fontWeight: 900`, `letterSpacing: '0.18em'`.
* Subtly scales and translates along the Z/Y axes in tandem with camera momentum.

---

## 3. Time-Shifted Subtitles for Multi-Act Sequences (Intro/Outro Offset)

When an intro sting (e.g. `DemaIntro` 3.5s / 105 frames) is prepended before the body breakdown, subtitle timestamps must be offset uniformly to maintain absolute synchronization:

```python
INTRO_SEC = 3.50
INTRO_FRAMES = 105

shifted_chunks = []
for c in chunk_manifests:
    sc = dict(c)
    sc["start_sec"] = round(c["start_sec"] + INTRO_SEC, 3)
    sc["end_sec"] = round(c["end_sec"] + INTRO_SEC, 3)
    sc["start_frame"] = c["start_frame"] + INTRO_FRAMES
    sc["end_frame"] = c["end_frame"] + INTRO_FRAMES
    shifted_chunks.append(sc)
```

The resulting time-shifted `.srt` and `.vtt` files align with the final composite video timeline starting at `0:00:03.500`.

---

## 4. External Subtitle Formats (`.srt` & `.vtt`)

Generated automatically by `build_audio.py` and `build_reel_audio.py`:

1. **SubRip Format (`subtitles.srt`)**:
   - Consecutive numeric counter with `HH:MM:SS,mmm --> HH:MM:SS,mmm`.
   - Used for direct upload to YouTube Studio under `Subtitles -> Add English`.

2. **WebVTT Format (`subtitles.vtt`)**:
   - `WEBVTT` header with `HH:MM:SS.mmm --> HH:MM:SS.mmm`.
   - Used in HTML5 `<video>` tags:
     ```html
     <track id="en-subtitles" src="cummins_motion_doctrine_full.vtt" kind="subtitles" srclang="en" label="English (CC)" default>
     ```
