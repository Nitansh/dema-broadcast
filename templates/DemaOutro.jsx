import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const DemaOutro = ({ brand, showGuides = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const b = brand || {};
  const bg = b.bg || '#0C0E11';
  const fg = b.fg || '#F4F1E8';
  const surface = b.surface || '#121417';
  const accent = b.accent || '#F2CF1D';
  const gold = b.gold || '#D4B064';
  const muted = b.muted || '#8B94A5';

  // Smooth fade-in over the first 18 frames, then quiet held plate
  const fade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  if (isVertical) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: bg,
          opacity: fade,
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 44px 80px 44px',
          boxSizing: 'border-box',
        }}
      >
        {b.outroBed && <Audio src={staticFile(b.outroBed)} />}
        {/* Subtle background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(244, 241, 232, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(244, 241, 232, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />
        {/* Top Header Strip */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(244, 241, 232, 0.12)',
            paddingBottom: 14,
            color: muted,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.12em',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: accent,
                boxShadow: `0 0 10px ${accent}`,
              }}
            />
            <span>DEMA ALGORITHMIC SUITE</span>
          </div>
          <div style={{ color: gold }}>{b.ctaSub || 'DAILY 3:45 PM IST'}</div>
        </div>

        {/* Center Brand Stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 10,
            marginTop: 40,
          }}
        >
          {b.logo ? (
            <Img
              src={staticFile(b.logo)}
              style={{
                width: 220,
                height: 220,
                objectFit: 'contain',
                filter: 'drop-shadow(0 16px 36px rgba(0,0,0,0.8))',
              }}
            />
          ) : (
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 24,
                backgroundColor: surface,
                border: `2px solid ${accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: fg,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 48,
                fontWeight: 900,
              }}
            >
              DEMA
            </div>
          )}

          <div
            style={{
              fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: fg,
              letterSpacing: '0.04em',
              marginTop: 24,
              textShadow: '0 4px 20px rgba(0,0,0,0.85)',
            }}
          >
            {b.name || 'DEMA ANALYSIS'}
          </div>

          <div
            style={{
              color: gold,
              fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: '0.08em',
              marginTop: 8,
            }}
          >
            {b.tagline || 'ALGORITHMIC TECHNICAL CHART STUDIES'}
          </div>

          <div
            style={{
              marginTop: 40,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 36px',
              backgroundColor: accent,
              color: '#121417',
              borderRadius: 10,
              fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: '0.08em',
              boxShadow: `0 10px 30px rgba(242, 207, 29, 0.4)`,
            }}
          >
            <span>{b.cta || 'Subscribe for Daily Telemetry →'}</span>
          </div>
        </div>

        {/* Regulatory Compliance Box at bottom */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 8,
            backgroundColor: 'rgba(18, 20, 23, 0.94)',
            border: '1px solid rgba(244, 241, 232, 0.14)',
            color: '#9CA3AF',
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            lineHeight: 1.5,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <strong style={{ color: gold, letterSpacing: '0.04em' }}>
            EDUCATIONAL NOTICE:
          </strong>{' '}
          {b.disclaimer ||
            'Strictly for technical analysis and educational purposes only. Not SEBI-registered financial advice.'}
        </div>
      </AbsoluteFill>
    );
  }

  // Subtle pulsing border/glow on guides when enabled
  const guidePulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.35, 0.75]
  );

  const guideBoxStyle = showGuides
    ? {
        border: `2px dashed rgba(242, 207, 29, ${guidePulse})`,
        borderRadius: 12,
        backgroundColor: 'rgba(242, 207, 29, 0.04)',
        boxShadow: 'inset 0 0 24px rgba(242, 207, 29, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent,
        fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
        fontSize: 13,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }
    : {};

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        opacity: fade,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Outro procedural financial score bed */}
      {b.outroBed && <Audio src={staticFile(b.outroBed)} />}

      {/* Institutional Dark Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(244, 241, 232, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(244, 241, 232, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Atmospheric Left-Side Gradient Glow (Keeps Left Third Lit, Right Two-Thirds Deep & Clean) */}
      <div
        style={{
          position: 'absolute',
          left: -120,
          top: 0,
          bottom: 0,
          width: 760,
          background: `radial-gradient(ellipse at 30% 50%, rgba(242, 207, 29, 0.12) 0%, rgba(18, 20, 23, 0.95) 75%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Telemetry Strip */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 80,
          right: 90,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(244, 241, 232, 0.10)',
          paddingBottom: 14,
          color: muted,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.14em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: accent,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />
          <span>DEMA ALGORITHMIC TELEMETRY SUITE</span>
        </div>
        <div style={{ color: gold }}>
          {b.ctaSub || 'DAILY POST-MARKET BRIEFING · 3:45 PM IST'}
        </div>
      </div>

      {/* ========================================================
          LEFT THIRD (Safe from YouTube Overlays): Your Branding
          ======================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 110,
          width: 540,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 10,
        }}
      >
        {/* Brand Logo */}
        {b.logo ? (
          <Img
            src={staticFile(b.logo)}
            style={{
              width: 170,
              height: 170,
              objectFit: 'contain',
              filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.75))',
            }}
          />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 20,
              backgroundColor: surface,
              border: `2px solid ${accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: fg,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 36,
              fontWeight: 900,
            }}
          >
            DEMA
          </div>
        )}

        {/* Channel Name */}
        <div
          style={{
            fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize: 56,
            lineHeight: 1.05,
            color: fg,
            letterSpacing: '0.04em',
            marginTop: 22,
          }}
        >
          {b.name || 'DEMA ANALYSIS'}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: gold,
            fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '0.08em',
            marginTop: 8,
            lineHeight: 1.4,
          }}
        >
          {b.tagline || 'ALGORITHMIC TECHNICAL CHART STUDIES'}
        </div>

        {/* Subscribe CTA Button Pill */}
        <div
          style={{
            marginTop: 32,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 26px',
            backgroundColor: accent,
            color: '#121417',
            borderRadius: 8,
            fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '0.08em',
            boxShadow: `0 8px 24px rgba(242, 207, 29, 0.35)`,
          }}
        >
          <span>{b.cta || 'Subscribe for Daily Telemetry →'}</span>
        </div>

        {/* Badge: Schedule Notice */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: muted,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.06em',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              backgroundColor: '#10B981',
            }}
          />
          <span>NSE TRADING DAYS · LIVE 3:45 PM IST</span>
        </div>

        {/* Educational Disclaimer Box: Positioned at bottom of left-third */}
        <div
          style={{
            marginTop: 36,
            padding: '14px 18px',
            borderRadius: 8,
            backgroundColor: 'rgba(18, 20, 23, 0.92)',
            border: '1px solid rgba(244, 241, 232, 0.12)',
            color: '#9CA3AF',
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          <strong style={{ color: gold, letterSpacing: '0.04em' }}>
            EDUCATIONAL COMPLIANCE:
          </strong>{' '}
          {b.disclaimer ||
            'Strictly for technical analysis and educational purposes only. Not SEBI-registered financial advice.'}
        </div>
      </div>

      {/* ========================================================
          RIGHT TWO-THIRDS (Reserved Quiet Space for YouTube Cards)
          ======================================================== */}
      {/* Element 1: Next-Video Card Placeholder (615×345, right: 90, top: 110) */}
      <div
        style={{
          position: 'absolute',
          width: 615,
          height: 345,
          right: 90,
          top: 110,
          ...guideBoxStyle,
        }}
      >
        {showGuides && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: fg,
                marginBottom: 6,
              }}
            >
              YOUTUBE NEXT-VIDEO CARD
            </div>
            <div style={{ fontSize: 13, color: gold }}>
              Native YouTube Element: 615 × 345 px
            </div>
            <div
              style={{
                fontSize: 11,
                color: muted,
                marginTop: 8,
                letterSpacing: '0.05em',
              }}
            >
              Anchor: right 90px · top 110px
            </div>
            <div
              style={{
                marginTop: 18,
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid rgba(242, 207, 29, 0.4)',
                backgroundColor: 'rgba(18, 20, 23, 0.8)',
                display: 'inline-block',
                color: accent,
                fontSize: 11,
              }}
            >
              [Best for Viewer / Latest Upload]
            </div>
          </div>
        )}
      </div>

      {/* Element 2: Subscribe Circle Placeholder (294×294, right: 250, bottom: 150) */}
      <div
        style={{
          position: 'absolute',
          width: 294,
          height: 294,
          right: 250,
          bottom: 150,
          borderRadius: 999,
          ...guideBoxStyle,
        }}
      >
        {showGuides && (
          <div style={{ textAlign: 'center', padding: 18 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: fg,
                marginBottom: 4,
              }}
            >
              SUBSCRIBE CIRCLE
            </div>
            <div style={{ fontSize: 12, color: gold }}>294 × 294 px</div>
            <div
              style={{
                fontSize: 10,
                color: muted,
                marginTop: 6,
                letterSpacing: '0.05em',
              }}
            >
              Anchor: right 250px · bottom 150px
            </div>
          </div>
        )}
      </div>

      {/* Guide Banner Notice (Shown only when showGuides=true) */}
      {showGuides && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(242, 207, 29, 0.15)',
            border: `1px solid ${accent}`,
            padding: '6px 20px',
            borderRadius: 4,
            color: accent,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.08em',
          }}
        >
          PREVIEW MODE: YouTube Element Safe Zones Visible · Final Render Leaves Zones Clean
        </div>
      )}
    </AbsoluteFill>
  );
};
