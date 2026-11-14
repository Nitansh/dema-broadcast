# Caption System & Subtitle Integration

The DEMA Broadcast Master employs a two-tier caption architecture:
1. **On-Screen Synchronized Kinetic Word-by-Word Karaoke Overlay (`KineticBroadcastCaptions` / `BroadcastCaptionOverlay`)** burned into Remotion for both 16:9 master broadcasts and 9:16 vertical reels.
2. **External Subtitle Tracks (`.srt` and `.vtt`)** for YouTube Closed Captions (CC) and interactive web players.

---

## 1. On-Screen Kinetic Karaoke Overlay (`KineticBroadcastCaptions`)

Captions follow the gold-standard viral reel kinetic styling (`PageindReel` / Vox-style kinetic typography):
- **Word-by-Word Highlight**: The exact spoken word pops in real time using edge-tts timestamp progress derived from audio chunks.
- **Active Word Pill**: The current active word is highlighted with a radiant yellow/gold pill (`#F2CF1D`), dark ink text (`#121417`), bold weight `800`, scale `1.10`, and glowing accent shadow.
- **Past Words**: Rendered in high-contrast crisp white (`#FFFFFF`, weight `700`).
- **Upcoming Words**: Rendered in translucent paper (`rgba(244, 241, 232, 0.45)`).
- **Paged Word Window**: Displays 7 words on 9:16 vertical reels and 10 words on 16:9 master broadcasts to maintain maximum legibility without cluttering charts or screens.
- **Manifest Auto-Resolution**: Detects `chapterId` or `reelId` and automatically grabs matching speech chunks from `dema_suite_audio_manifest_en.json`.

### Component Implementation (`SharedNewsPackage.jsx`):
```jsx
export const KineticBroadcastCaptions = ({
  chunks = [],
  manifest = null,
  chapterId = null,
  reelId = null,
  frame = 0,
  fps = 30,
  vertical = false,
  bottom = undefined,
}) => {
  const resolvedManifest = manifest || defaultAudioManifest;
  let chunkList = chunks;
  if ((!chunkList || chunkList.length === 0) && resolvedManifest) {
    if (chapterId && resolvedManifest.chapters?.[chapterId]?.chunks) {
      chunkList = resolvedManifest.chapters[chapterId].chunks;
    } else if (reelId && resolvedManifest.reels?.[reelId]?.chunks) {
      chunkList = resolvedManifest.reels[reelId].chunks;
    } else if (resolvedManifest.chunks) {
      chunkList = resolvedManifest.chunks;
    }
  }

  if (!chunkList || chunkList.length === 0) return null;

  const activeChunk = chunkList.find((c) => {
    const endF = c.end_frame || (c.start_frame + Math.round((c.duration_sec || 0) * fps));
    return frame >= c.start_frame && frame <= endF + 12;
  });

  if (!activeChunk) return null;

  const startF = activeChunk.start_frame;
  const endF = activeChunk.end_frame || (startF + Math.round((activeChunk.duration_sec || 0) * fps));
  const progress = clamp01((frame - startF) / Math.max(1, endF - startF));

  const words = (activeChunk.text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const activeWordIdx = Math.min(words.length - 1, Math.floor(progress * words.length));

  // Paged word window for high legibility
  const windowSize = vertical ? 7 : 10;
  const startIdx = Math.max(0, Math.min(words.length - windowSize, activeWordIdx - 2));
  const visibleWords = words.slice(startIdx, startIdx + windowSize);

  const fadeProgress = clamp01((frame - startF) / 6);
  const isEnding = frame > endF;
  const opacity = isEnding ? clamp01((endF + 12 - frame) / 12) : fadeProgress;

  const containerBottom = bottom !== undefined ? bottom : (vertical ? 228 : 122);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: containerBottom,
        left: vertical ? 44 : '50%',
        right: vertical ? 44 : 'auto',
        transform: vertical ? 'none' : 'translateX(-50%)',
        maxWidth: vertical ? 'none' : 1380,
        backgroundColor: 'rgba(9, 13, 20, 0.94)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(242, 207, 29, 0.50)',
        borderRadius: 14,
        boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 20px rgba(242, 207, 29, 0.20)',
        padding: vertical ? '14px 20px' : '10px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vertical ? 12 : 16,
        opacity,
        zIndex: 85,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.accent,
          color: COLORS.ink,
          fontFamily: FONTS.mono,
          fontWeight: 800,
          fontSize: vertical ? 12 : 13,
          letterSpacing: '0.12em',
          padding: '4px 10px',
          borderRadius: 6,
          flexShrink: 0,
          boxShadow: '0 0 10px rgba(242, 207, 29, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: COLORS.ink }} />
        CC · EN
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? '6px 8px' : '6px 10px',
          fontFamily: FONTS.ui,
          fontSize: vertical ? 26 : 21,
          lineHeight: 1.35,
          fontWeight: 600,
        }}
      >
        {visibleWords.map((word, relIdx) => {
          const absIdx = startIdx + relIdx;
          const isCurrent = absIdx === activeWordIdx;
          const isPast = absIdx < activeWordIdx;

          return (
            <span
              key={`${word}-${absIdx}`}
              style={{
                display: 'inline-block',
                padding: isCurrent ? '2px 8px' : '2px 4px',
                borderRadius: 6,
                backgroundColor: isCurrent ? COLORS.accent : 'transparent',
                color: isCurrent ? COLORS.ink : isPast ? '#FFFFFF' : 'rgba(244, 241, 232, 0.45)',
                fontWeight: isCurrent ? 800 : isPast ? 700 : 500,
                transform: isCurrent ? 'scale(1.10)' : 'scale(1.0)',
                boxShadow: isCurrent ? `0 0 16px ${COLORS.accent}` : 'none',
                transition: 'all 0.08s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
```

### Layout Safe-Zone Rules:
- **16:9 Master Broadcast (`bottom: 122px`)**: Sits cleanly above the Lower Third Strap (`bottom: 24px`, height `92px`, top `964px`).
- **9:16 Vertical Reels (`bottom: 228px`)**: Sits above the vertical Lower Third Strap (`bottom: 112px`) and below main chart graphics (Y: 200–1450).
- **Non-Destructive Doctrine**: Captions never resize or squash underlying charts; the dark frosted glass guarantees readability over any candlestick or technical overlay.

---

## 2. External Subtitle Formats (`.srt` & `.vtt`)

Generated automatically by `build_audio.py` from spoken audio chunks:

1. **SubRip Format (`subtitles_master.srt`)**:
   - Consecutive numeric counter with `HH:MM:SS,mmm --> HH:MM:SS,mmm`.
   - Used for direct upload to YouTube Studio under `Subtitles -> Add English`.

2. **WebVTT Format (`subtitles_master.vtt`)**:
   - `WEBVTT` header with `HH:MM:SS.mmm --> HH:MM:SS.mmm`.
   - Used in HTML5 `<video>` tags:
     ```html
     <track id="en-subtitles" src="subtitles_master.vtt" kind="subtitles" srclang="en" label="English (CC)" default>
     ```
