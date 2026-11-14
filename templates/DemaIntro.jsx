import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const DemaIntro = ({ brand }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const b = brand || {};
  const bg = b.bg || '#0C0E11';
  const fg = b.fg || '#F4F1E8';
  const accent = b.accent || '#F2CF1D';
  const gold = b.gold || '#D4B064';
  const muted = b.muted || '#8B94A5';

  // Hard rule: sting impact transient sits at exactly 0.8s (frame 24 @ 30fps)
  const IMPACT = Math.round(0.8 * fps);
  const f = frame - IMPACT;

  // Windup: 0..0.8s (frames 0..24)
  const windup = interpolate(frame, [0, IMPACT], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const windupScale = interpolate(frame, [0, IMPACT], [0.8, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Impact: spring overshoots from 1.18 -> 1.0 (the snap)
  const scale = spring({
    frame: f,
    fps,
    from: 1.18,
    to: 1.0,
    config: { damping: 9, mass: 0.5 },
  });

  const logoOpacity = f < 0 ? 0 : 1;

  // White/gold flash on hit, decaying over 6 frames
  const flash = interpolate(f, [0, 6], [0.95, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Shockwave horizontal laser on impact
  const shockwaveW = interpolate(f, [0, 8], [0, width], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shockwaveOpacity = interpolate(f, [0, 8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tagline & badge fade in during settle
  const taglineOpacity = interpolate(f, [8, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(f, [8, 20], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeOpacity = interpolate(f, [14, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const disclaimerOpacity = interpolate(f, [20, 32], [0, 0.75], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Audio sting muxed frame-exact */}
      {b.sting && <Audio src={staticFile(b.sting)} />}

      {/* Subtle Terminal Background Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(244, 241, 232, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(244, 241, 232, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.8,
        }}
      />

      {/* Ambient Accent Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          borderRadius: 999,
          background: accent,
          filter: 'blur(160px)',
          opacity: (f < 0 ? windup * 0.35 : 0.42),
          transform: `scale(${f < 0 ? windupScale : 1})`,
        }}
      />

      {/* Pre-hit scanning crosshair wireframe (windup tension) */}
      {f < 0 && (
        <div
          style={{
            position: 'absolute',
            width: 440,
            height: 440,
            borderRadius: 48,
            border: `2px dashed rgba(242, 207, 29, ${windup * 0.4})`,
            transform: `scale(${interpolate(frame, [0, IMPACT], [0.65, 1.0])}) rotate(${interpolate(frame, [0, IMPACT], [-20, 0])}deg)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Brand Core Stack */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Top Kicker Badge */}
        <div
          style={{
            opacity: badgeOpacity,
            marginBottom: 20,
            padding: '6px 18px',
            borderRadius: 6,
            backgroundColor: 'rgba(242, 207, 29, 0.12)',
            border: `1.5px solid ${accent}`,
            color: accent,
            fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {b.badge || 'NSE · COMMODITIES · INSTITUTIONAL TELEMETRY'}
        </div>

        {/* Master Brand Logo (Snaps on Impact) */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${scale})`,
            willChange: 'transform, opacity',
          }}
        >
          {b.logo ? (
            <Img
              src={staticFile(b.logo)}
              style={{
                width: 380,
                height: 380,
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.85))',
              }}
            />
          ) : (
            <div
              style={{
                width: 380,
                height: 380,
                borderRadius: 40,
                background: '#121417',
                border: `3px solid ${accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: fg,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 64,
                fontWeight: 900,
              }}
            >
              {b.name || 'DEMA ANALYSIS'}
            </div>
          )}
        </div>

        {/* Channel Name */}
        <div
          style={{
            marginTop: 26,
            color: fg,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 54,
            letterSpacing: '0.08em',
            textShadow: '0 4px 18px rgba(0,0,0,0.8)',
          }}
        >
          {b.name || 'DEMA ANALYSIS'}
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 8,
            color: gold,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '0.12em',
          }}
        >
          {b.tagline || 'ALGORITHMIC TECHNICAL CHART STUDIES'}
        </div>
      </div>

      {/* Shockwave Energy Line on Impact */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          width: shockwaveW,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          opacity: shockwaveOpacity,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          boxShadow: `0 0 20px ${accent}`,
        }}
      />

      {/* Mandatory Regulatory / Educational Disclaimer Banner at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: height > width ? 80 : 40,
          width: height > width ? '88%' : 'auto',
          opacity: disclaimerOpacity,
          padding: '8px 24px',
          borderRadius: 4,
          backgroundColor: 'rgba(18, 20, 23, 0.85)',
          border: '1px solid rgba(244, 241, 232, 0.12)',
          color: muted,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.06em',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {b.disclaimer || 'EDUCATIONAL PURPOSE ONLY · NOT SEBI REGISTERED'}
      </div>

      {/* The White/Gold Impact Flash (Decays in 6 frames) */}
      <AbsoluteFill
        style={{
          backgroundColor: '#FFFFFF',
          opacity: flash,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};
