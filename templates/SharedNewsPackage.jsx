import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const COLORS = {
  ink: '#121417',
  ink2: '#1B1E23',
  ink3: '#22262C',
  accent: '#F2CF1D',
  gold: '#D4B064',
  paper: '#F4F1E8',
  muted: '#8B94A5',
  bullish: '#10B981',
  bullishBright: '#34D399',
  breaking: '#FE6B3D',
  red: '#EF4444',
  cyan: '#22D3EE',
  border: 'rgba(244, 241, 232, 0.14)',
};

export const FONTS = {
  display: "'Barlow Condensed', 'Impact', 'Arial Narrow', sans-serif",
  mono: "'IBM Plex Mono', 'Consolas', monospace",
  ui: "'Inter', 'Segoe UI', sans-serif",
};

let defaultAudioManifest = null;
try {
  defaultAudioManifest = require('../../public/data/dema_suite_audio_manifest_en.json');
} catch (e) {
  try {
    defaultAudioManifest = require('../../public/data/dema_pack_audio_manifest_20261113.json');
  } catch (e2) {}
}

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOutCubic = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/* ---------- Mechanical Split-Flap Tile ---------- */
export const SplitFlapChar = ({
  fromChar,
  toChar,
  flipFrame,
  frame,
  width = 86,
  height = 132,
  highlight = false,
  tone = 'gold',
}) => {
  const progress = clamp01((frame - flipFrame) / 7);
  const flipped = progress >= 0.5;
  const char = flipped ? toChar : fromChar;
  const tilt = progress > 0 && progress < 1 ? Math.sin(progress * Math.PI) * 74 : 0;

  const hiColor =
    tone === 'green'
      ? COLORS.bullishBright
      : tone === 'red'
      ? COLORS.breaking
      : COLORS.accent;
  const borderHi =
    tone === 'green'
      ? 'rgba(52, 211, 153, 0.55)'
      : tone === 'red'
      ? 'rgba(254, 107, 61, 0.6)'
      : 'rgba(242, 207, 29, 0.55)';

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 10,
        backgroundColor: '#0C0E11',
        border: `2px solid ${flipped && highlight ? borderHi : 'rgba(255,255,255,0.12)'}`,
        boxShadow: 'inset 0 8px 18px rgba(0,0,0,0.85), 0 6px 14px rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `perspective(600px) rotateX(${tilt}deg)`,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: Math.round(height * 0.72),
          lineHeight: 1,
          letterSpacing: '0.01em',
          color: flipped && highlight ? hiColor : COLORS.paper,
        }}
      >
        {char}
      </span>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 3,
          marginTop: -1.5,
          backgroundColor: '#050608',
          boxShadow: '0 1px 0 rgba(255,255,255,0.08)',
        }}
      />
    </div>
  );
};

/* ---------- Top-Right Persistent Channel Bug ---------- */
export const ChannelBug = ({ compact = false, opacity = 1, scale = 1 }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: compact ? 8 : 10,
      padding: compact ? '7px 12px' : '8px 14px',
      backgroundColor: 'rgba(18, 20, 23, 0.94)',
      border: `2px solid ${COLORS.accent}`,
      borderRadius: 6,
      opacity,
      transform: `scale(${scale})`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
    }}
  >
    <div
      style={{
        width: compact ? 8 : 10,
        height: compact ? 8 : 10,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
      }}
    />
    <span
      style={{
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: compact ? 20 : 22,
        letterSpacing: '0.09em',
        color: COLORS.paper,
        whiteSpace: 'nowrap',
      }}
    >
      DEMA ANALYSIS
    </span>
  </div>
);

/* ---------- Top Educational Disclaimer Ribbon ---------- */
export const EducationalRibbon = ({ leftLabel, compact = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    }}
  >
    <div
      style={{
        backgroundColor: 'rgba(242, 207, 29, 0.14)',
        border: '1px solid rgba(242, 207, 29, 0.45)',
        color: COLORS.accent,
        fontFamily: FONTS.mono,
        fontWeight: 700,
        fontSize: compact ? 13 : 14,
        letterSpacing: '0.1em',
        padding: compact ? '5px 10px' : '6px 12px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
      }}
    >
      EDUCATIONAL ONLY · NO TIPS
    </div>
    {leftLabel && (
      <span
        style={{
          fontFamily: FONTS.mono,
          fontWeight: 600,
          fontSize: compact ? 14 : 16,
          letterSpacing: '0.14em',
          color: COLORS.muted,
          whiteSpace: 'nowrap',
        }}
      >
        {leftLabel}
      </span>
    )}
  </div>
);

/* ---------- Persistent Lower-Third Paper Strap ---------- */
export const LowerThirdStrap = ({
  tabLabel = 'MARKETS',
  tabBg = COLORS.accent,
  tabColor = COLORS.ink,
  contextChip = 'NOV 12, 2026 · NSE',
  headline = '',
  rightSource = 'EDUCATIONAL CHART STUDY',
  animProgress = 1,
  vertical = false,
}) => {
  const slideY = interpolate(clamp01(animProgress), [0, 1], [60, 0]);
  const opacity = clamp01(animProgress * 1.4);

  if (vertical) {
    return (
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          bottom: 112,
          opacity,
          transform: `translateY(${slideY}px)`,
          zIndex: 25,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: tabBg,
              color: tabColor,
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '0.13em',
              padding: '7px 16px',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            {tabLabel}
          </div>
          <div
            style={{
              backgroundColor: COLORS.ink3,
              color: COLORS.gold,
              fontFamily: FONTS.mono,
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.09em',
              padding: '7px 14px',
              borderTopRightRadius: 6,
              borderTop: `1px solid ${COLORS.border}`,
              borderRight: `1px solid ${COLORS.border}`,
            }}
          >
            {contextChip}
          </div>
        </div>
        <div
          style={{
            minHeight: 74,
            backgroundColor: COLORS.paper,
            borderRadius: '0 8px 8px 8px',
            borderLeft: `8px solid ${tabBg}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '10px 20px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.58)',
          }}
        >
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 33,
              lineHeight: 1.04,
              letterSpacing: '0.02em',
              color: COLORS.ink,
              textTransform: 'uppercase',
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#475060',
              marginTop: 4,
            }}
          >
            {rightSource}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        right: 96,
        bottom: 58,
        opacity,
        transform: `translateY(${slideY}px)`,
        zIndex: 25,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            backgroundColor: tabBg,
            color: tabColor,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.14em',
            padding: '8px 20px',
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          }}
        >
          {tabLabel}
        </div>
        <div
          style={{
            backgroundColor: COLORS.ink3,
            color: COLORS.gold,
            fontFamily: FONTS.mono,
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '0.1em',
            padding: '8px 18px',
            borderTopRightRadius: 6,
            borderTop: `1px solid ${COLORS.border}`,
            borderRight: `1px solid ${COLORS.border}`,
          }}
        >
          {contextChip}
        </div>
      </div>

      <div
        style={{
          height: 76,
          backgroundColor: COLORS.paper,
          borderRadius: '0 8px 8px 8px',
          borderLeft: `8px solid ${tabBg}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.55)',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: '0.02em',
            color: COLORS.ink,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '72%',
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '0.08em',
            color: '#475060',
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {rightSource}
        </div>
      </div>
    </div>
  );
};

/* ---------- Vertical 3-Stripe Band Wipe Overlay ---------- */
export const VerticalBandWipe = ({ frame, startFrame, duration = 14 }) => {
  const { width } = useVideoConfig();
  const p = (frame - startFrame) / duration;
  if (p < 0 || p > 1.05) return null;

  const scaleW = width / 1920;
  const stripes = [
    { color: COLORS.accent, delay: 0, width: Math.round(420 * scaleW) },
    { color: COLORS.ink, delay: 0.08, width: Math.round(520 * scaleW) },
    { color: COLORS.gold, delay: 0.16, width: Math.round(260 * scaleW) },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden', zIndex: 40 }}>
      {stripes.map((s, idx) => {
        const sp = clamp01((p - s.delay) / 0.82);
        const x = interpolate(sp, [0, 1], [-s.width - 140, width + 180]);
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: -60,
              bottom: -60,
              left: 0,
              width: s.width,
              backgroundColor: s.color,
              transform: `translateX(${x}px) skewX(-6deg)`,
              boxShadow: '0 0 30px rgba(0,0,0,0.45)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Slanted Finale Band Wipe Overlay ---------- */
export const SlantedEndWipe = ({ frame, startFrame, duration = 16 }) => {
  const { width } = useVideoConfig();
  const p = (frame - startFrame) / duration;
  if (p < 0 || p > 1.05) return null;

  const scaleW = width / 1920;
  const bands = [
    { color: COLORS.accent, delay: 0.0, w: Math.round(380 * scaleW) },
    { color: COLORS.gold, delay: 0.07, w: Math.round(240 * scaleW) },
    { color: COLORS.ink, delay: 0.14, w: Math.round(560 * scaleW) },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      {bands.map((b, i) => {
        const bp = clamp01((p - b.delay) / 0.8);
        const x = interpolate(easeInOutCubic(bp), [0, 1], [-b.w - 300, width + 320]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -120,
              bottom: -120,
              width: b.w,
              backgroundColor: b.color,
              transform: `translateX(${x}px) skewX(-14deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Brand-Plate Opening Sting (0..45f) ---------- */
export const StingBrandPlate = ({
  frame,
  fps,
  kicker = 'DAILY TECHNICAL STUDY · NOV 12, 2026',
  title = 'DEMA ANALYSIS',
  subTag = 'FOR EDUCATIONAL PURPOSES ONLY',
  vertical = false,
}) => {
  const { width, height } = useVideoConfig();
  const slam = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.8 },
  });

  const flyT = easeInOutCubic((frame - 34) / 10);
  const baseScale = interpolate(slam, [0, 1], [1.45, 1.0]);
  const flyScale = interpolate(flyT, [0, 1], [1.0, vertical ? 0.38 : 0.34]);
  const targetTx = vertical ? width / 2 - 140 : 765;
  const targetTy = vertical ? -height / 2 + 64 : -464;
  const tx = interpolate(flyT, [0, 1], [0, targetTx]);
  const ty = interpolate(flyT, [0, 1], [0, targetTy]);

  const ringScale = interpolate(clamp01((frame - 7) / 16), [0, 1], [0.85, 1.55]);
  const ringOpacity = interpolate(clamp01((frame - 7) / 16), [0, 0.2, 1], [0, 0.65, 0]);
  const glintX = interpolate(clamp01((frame - 24) / 8), [0, 1], [-320, 620]);

  const slash1X = interpolate(clamp01(frame / 10), [0, 1], [-600, width + 300]);
  const slash2X = interpolate(clamp01((frame - 2) / 10), [0, 1], [-700, width + 400]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: -100,
          bottom: -100,
          width: 140,
          backgroundColor: COLORS.accent,
          opacity: 0.9,
          transform: `translateX(${slash1X - width / 2}px) skewX(-18deg)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -100,
          bottom: -100,
          width: 75,
          backgroundColor: COLORS.gold,
          opacity: 0.75,
          transform: `translateX(${slash2X - width / 2}px) skewX(-18deg)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: vertical ? 640 : 680,
          height: vertical ? 210 : 220,
          borderRadius: 16,
          border: `3px solid ${COLORS.accent}`,
          opacity: ringOpacity,
          transform: `scale(${ringScale})`,
        }}
      />

      <div
        style={{
          position: 'relative',
          padding: vertical ? '28px 46px' : '34px 68px',
          backgroundColor: COLORS.ink2,
          border: `4px solid ${COLORS.accent}`,
          borderRadius: 14,
          boxShadow: '0 24px 70px rgba(0,0,0,0.75), 0 0 50px rgba(242,207,29,0.16)',
          transform: `translate(${tx}px, ${ty}px) scale(${baseScale * flyScale})`,
          opacity: frame < 5 ? 0 : 1,
          overflow: 'hidden',
          maxWidth: vertical ? 920 : 980,
        }}
      >
        {frame >= 24 && frame <= 33 && (
          <div
            style={{
              position: 'absolute',
              top: -40,
              bottom: -40,
              width: 90,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
              transform: `translateX(${glintX}px) skewX(-20deg)`,
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 22,
              height: vertical ? 68 : 74,
              backgroundColor: COLORS.accent,
              borderRadius: 4,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: vertical ? 16 : 18,
                letterSpacing: '0.22em',
                color: COLORS.gold,
                marginBottom: 4,
              }}
            >
              {kicker}
            </div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: vertical ? 72 : 82,
                lineHeight: 0.95,
                letterSpacing: '0.07em',
                color: COLORS.paper,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontWeight: 600,
                fontSize: vertical ? 13 : 14,
                letterSpacing: '0.16em',
                color: COLORS.accent,
                marginTop: 8,
              }}
            >
              {subTag}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Slanted Verdict / Structure Stamp ---------- */
export const SlantedStamp = ({
  text = 'BULLISH STRUCTURE',
  color = COLORS.bullishBright,
  frame,
  startFrame,
  fps,
  size = 54,
}) => {
  const local = frame - startFrame;
  const slam = spring({
    frame: Math.max(0, local),
    fps,
    config: { damping: 12, stiffness: 250, mass: 0.7 },
  });
  const scale = interpolate(slam, [0, 1], [2.1, 1.0]);
  const opacity = clamp01(local / 4);

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '10px 26px',
        border: `4px solid ${color}`,
        outline: `2px solid ${color}`,
        outlineOffset: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(12, 14, 17, 0.86)',
        color,
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transform: `rotate(-5deg) scale(${scale})`,
        opacity,
        boxShadow: '0 14px 36px rgba(0,0,0,0.65)',
      }}
    >
      {text}
    </div>
  );
};

/* ---------- Proportional Bar Row ---------- */
export const SpecBarRow = ({
  label,
  subLabel,
  valueText,
  barColor = COLORS.accent,
  pct = 0.75,
  anim = 1,
  compact = false,
}) => {
  const wPct = Math.max(6, Math.min(100, pct * 100 * clamp01(anim)));
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: COLORS.ink2,
        border: `1px solid ${COLORS.border}`,
        borderLeft: `6px solid ${barColor}`,
        borderRadius: 8,
        padding: compact ? '12px 16px' : '14px 20px',
        overflow: 'hidden',
        opacity: clamp01(anim * 1.4),
        transform: `translateY(${interpolate(clamp01(anim), [0, 1], [16, 0])}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${wPct}%`,
          backgroundColor: barColor,
          opacity: 0.11,
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: compact ? 30 : 34,
              lineHeight: 1.0,
              color: COLORS.paper,
              letterSpacing: '0.03em',
            }}
          >
            {label}
          </div>
          {subLabel && (
            <div
              style={{
                fontFamily: FONTS.mono,
                fontWeight: 500,
                fontSize: compact ? 13 : 14,
                color: COLORS.muted,
                marginTop: 3,
              }}
            >
              {subLabel}
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: compact ? 22 : 26,
            color: barColor,
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {valueText}
        </div>
      </div>
    </div>
  );
};

/* ---------- Clean End Card ---------- */
export const BroadcastEndCard = ({
  frame,
  startFrame,
  fps,
  title = 'DEMA ANALYSIS',
  subtitle = 'NOV 12, 2026 · DAILY CHART STUDY PACK',
  bullet = 'NIFTY 25,299 · GOLD $3,941 · ADANIPOWER ₹207.90',
  cta = 'SUBSCRIBE FOR DAILY EDUCATIONAL CHART STUDIES',
  vertical = false,
}) => {
  const local = frame - startFrame;
  const enter = spring({
    frame: Math.max(0, local - 4),
    fps,
    config: { damping: 16, stiffness: 170 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        alignItems: 'center',
        justifyContent: 'center',
        padding: vertical ? 52 : 96,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: vertical ? 960 : 1280,
          backgroundColor: COLORS.ink2,
          border: `3px solid ${COLORS.accent}`,
          borderRadius: 18,
          padding: vertical ? '48px 40px' : '56px 68px',
          textAlign: 'center',
          transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
          opacity: clamp01(local / 8),
          boxShadow: '0 28px 80px rgba(0,0,0,0.75)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: COLORS.accent,
            color: COLORS.ink,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: vertical ? 15 : 17,
            letterSpacing: '0.16em',
            padding: '7px 18px',
            borderRadius: 6,
            marginBottom: 22,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: vertical ? 82 : 96,
            lineHeight: 0.95,
            color: COLORS.paper,
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontWeight: 600,
            fontSize: vertical ? 20 : 24,
            color: COLORS.gold,
            marginTop: 18,
          }}
        >
          {bullet}
        </div>

        <div
          style={{
            marginTop: 32,
            padding: vertical ? '16px 20px' : '16px 28px',
            backgroundColor: 'rgba(244, 241, 232, 0.06)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            fontFamily: FONTS.mono,
            fontSize: vertical ? 15 : 16,
            lineHeight: 1.5,
            color: COLORS.muted,
          }}
        >
          EDUCATIONAL DISCLAIMER: ALL LEVELS, DEMA LINES & VOLUME PROFILE DATA ARE FOR TECHNICAL STUDY ONLY. NOT SEBI-REGISTERED INVESTMENT ADVICE OR BUY/SELL TIPS.
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: vertical ? 34 : 38,
            letterSpacing: '0.08em',
            color: COLORS.accent,
          }}
        >
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Kinetic Broadcast Captions (Reel & Master Word-by-Word Karaoke) ---------- */
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

  // Paged word window for high legibility (no screen-flooding)
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

export const BroadcastCaptionOverlay = KineticBroadcastCaptions;

