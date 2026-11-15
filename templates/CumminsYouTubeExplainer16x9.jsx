import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import manifest from '../public/data/cummins_explainer_manifest.json';
import {
  BroadcastEndCard,
  ChannelBug,
  clamp01,
  COLORS,
  easeOutCubic,
  EducationalRibbon,
  FONTS,
  KineticBroadcastCaptions,
  LowerThirdStrap,
  SlantedEndWipe,
  VerticalBandWipe,
} from './AdaniSuite/SharedNewsPackage';
import { DemaIntro } from './DemaIntroOutro/DemaIntro';
import { DemaOutro } from './DemaIntroOutro/DemaOutro';
import brand from './DemaIntroOutro/brand.json';

export const CUMMINS_YT_INTRO_FRAMES = manifest.intro_frames || 105;
export const CUMMINS_YT_BODY_FRAMES = manifest.body_frames || 3401;
export const CUMMINS_YT_OUTRO_FRAMES = manifest.outro_frames || 150;
export const CUMMINS_YT_TOTAL_FRAMES =
  CUMMINS_YT_INTRO_FRAMES + CUMMINS_YT_BODY_FRAMES + CUMMINS_YT_OUTRO_FRAMES;

/* =========================================================================
   16:9 WIDESCREEN YOUTUBE EXPLAINER CORE COMPONENT (1920x1080 @ 30fps)
   Decluttered, High-Engagement Edition with Left-to-Right Laser Sweeps,
   Live Price Circle-Out Sonar Pings, and Single-Level Focus Zooming.
   ========================================================================= */
export const CumminsYouTubeExplainerCore = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cues = manifest.body_cue_frames || [15, 527, 1152, 1647, 2202, 2721];
  const cue0 = cues[0] || 15;
  const cue1 = cues[1] || 527;
  const cue2 = cues[2] || 1152;
  const cue3 = cues[3] || 1647;
  const cue4 = cues[4] || 2202;
  const cue5 = cues[5] || 2721;
  const endWipe = manifest.end_wipe_frame || 3356;
  const showHud = frame >= 10 && frame < endWipe + 8;

  // Active Phase (0 to 5)
  const phase =
    frame < cue1 ? 0 :
    frame < cue2 ? 1 :
    frame < cue3 ? 2 :
    frame < cue4 ? 3 :
    frame < cue5 ? 4 : 5;

  const activeCueStart =
    phase === 0 ? cue0 :
    phase === 1 ? cue1 :
    phase === 2 ? cue2 :
    phase === 3 ? cue3 :
    phase === 4 ? cue4 : cue5;

  // Left-to-Right Glowing Laser Beam Sweep Progress (22 frames = 0.73s)
  const sweepProgress = clamp01((frame - activeCueStart) / 22);

  // Flash cut opacity at phase transitions
  const flashTimes = [0, cue1, cue2, cue3, cue4, cue5];
  let flashOpacity = 0;
  for (const ft of flashTimes) {
    if (frame >= ft && frame <= ft + 5) {
      flashOpacity = Math.max(flashOpacity, interpolate(frame - ft, [0, 5], [0.55, 0]));
    }
  }

  // Camera Motion (Targeted Deep Zoom directly on the active level being discussed)
  let cameraScale = 1.0;
  let cameraPanX = 0;
  let cameraPanY = 0;

  if (phase === 0) {
    // Phase 0: Full chart overview
    const p0 = clamp01(frame / cue1);
    cameraScale = interpolate(p0, [0, 1], [1.0, 1.03]);
    cameraPanX = 0;
    cameraPanY = 0;
  } else if (phase === 1) {
    // Phase 1: Deep zoom into POC (₹4,136.30) & VAL (₹3,950.14) floor
    const p1 = clamp01((frame - cue1) / 24);
    cameraScale = interpolate(p1, [0, 1], [1.03, 1.34]);
    cameraPanX = interpolate(p1, [0, 1], [0, -25]);
    cameraPanY = interpolate(p1, [0, 1], [0, -68]);
  } else if (phase === 2) {
    // Phase 2: Deep zoom into DEMA 20 (₹4,241.10)
    const p2 = clamp01((frame - cue2) / 24);
    cameraScale = interpolate(p2, [0, 1], [1.34, 1.38]);
    cameraPanX = interpolate(p2, [0, 1], [-25, 12]);
    cameraPanY = interpolate(p2, [0, 1], [-68, -32]);
  } else if (phase === 3) {
    // Phase 3: Ultra zoom locked directly onto DEMA 50 (₹4,368.15) & CMP
    const p3 = clamp01((frame - cue3) / 24);
    const recoil = Math.sin(clamp01((frame - cue3) / 22) * Math.PI) * 12;
    cameraScale = interpolate(p3, [0, 1], [1.38, 1.44]);
    cameraPanX = interpolate(p3, [0, 1], [12, 38]);
    cameraPanY = interpolate(p3, [0, 1], [-32 + recoil, 18]);
  } else if (phase === 4) {
    // Phase 4: Zoom into VAH Target Corridor (₹4,648.24)
    const p4 = clamp01((frame - cue4) / 24);
    cameraScale = interpolate(p4, [0, 1], [1.44, 1.30]);
    cameraPanX = interpolate(p4, [0, 1], [38, 20]);
    cameraPanY = interpolate(p4, [0, 1], [18, 54]);
  } else {
    // Phase 5: Pull back to reveal Macro 100 & 200 DEMA targets
    const p5 = clamp01((frame - cue5) / 24);
    cameraScale = interpolate(p5, [0, 1], [1.30, 1.05]);
    cameraPanX = interpolate(p5, [0, 1], [20, 0]);
    cameraPanY = interpolate(p5, [0, 1], [54, 16]);
  }

  // Live Price (CMP) circle-out sonar ping animation (every 40 frames = 1.33s)
  const pingCycle = 40;
  const pingProgress = ((frame % pingCycle) / pingCycle);
  const pingScale = interpolate(pingProgress, [0, 1], [0.8, 3.6]);
  const pingOpacity = interpolate(pingProgress, [0, 0.25, 1], [0.95, 0.75, 0]);

  const strapConfig = {
    0: {
      tabLabel: 'UNIVERSAL LAW',
      tabBg: COLORS.gold,
      tabColor: COLORS.ink,
      contextChip: 'NSE · CUMMINSIND',
      headline: 'LEVELS BELOW CMP = SUPPORT | LEVELS ABOVE CMP = TARGET & RESISTANCE',
      rightSource: 'CMP ₹4,369.00',
    },
    1: {
      tabLabel: 'VAL & POC ABSORPTION',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: 'DEMAND FLOOR',
      headline: '1.10M VOLUME SURGE DEFENDS MONTHLY POC ₹4,136.30 ABOVE VAL ₹3,950.14',
      rightSource: 'BUY VOL CONFIRMS',
    },
    2: {
      tabLabel: 'DEMA 20 RECLAIMED',
      tabBg: COLORS.bullish,
      tabColor: COLORS.ink,
      contextChip: 'DYNAMIC SUPPORT',
      headline: 'RALLY UP RECLAIMS 20 DEMA (₹4,241) · FLIPPED TO SUPPORT WITH OI EXPANSION',
      rightSource: 'OI EXPANSION',
    },
    3: {
      tabLabel: '50 DEMA INFLECTION',
      tabBg: COLORS.accent,
      tabColor: COLORS.ink,
      contextChip: 'IMMEDIATE HURDLE',
      headline: 'CMP ₹4,369 TESTS 50 DEMA (₹4,368.15) · DECISIVE CLOSE TURNS RESISTANCE TO SUPPORT',
      rightSource: 'CRITICAL THRESHOLD',
    },
    4: {
      tabLabel: 'VAH TARGET CORRIDOR',
      tabBg: '#22D3EE',
      tabColor: COLORS.ink,
      contextChip: 'PRIMARY TARGET',
      headline: 'CLEARING 50 DEMA UNLOCKS VALUE AREA HIGH TARGET AT ₹4,648.24',
      rightSource: 'TARGET ₹4,648',
    },
    5: {
      tabLabel: 'MACRO REVERSAL',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: '100 & 200 DEMA',
      headline: 'EXTENDED TARGETS: 100 DEMA ₹4,727 & TREND REVERSAL 200 DEMA ₹5,155.80',
      rightSource: 'MACRO REVERSAL',
    },
  }[phase];

  const borderRotateDeg = (frame * 3.5) % 360;

  // Chart coordinate bottom percentages:
  // DEMA 200: 66.7%
  // DEMA 100: 46.7%
  // VAH:      43.1%
  // LIVE CMP: 30.8%
  // DEMA 50:  29.6%
  // DEMA 20:  23.3%
  // POC:      19.2%
  // VAL:      10.4%

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080A0E',
        overflow: 'hidden',
        fontFamily: FONTS.ui,
      }}
    >
      {/* 1. BACKGROUND GRID & AMBIENT RADIAL LIGHTING */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 45% 45%, rgba(22, 28, 40, 0.70) 0%, rgba(8, 10, 14, 0.98) 85%)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(244, 241, 232, 0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.55,
          zIndex: 2,
        }}
      />

      {/* 2. TOP INSTITUTIONAL TELEMETRY HEADER STRAP */}
      {showHud && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 28,
            right: 28,
            height: 58,
            backgroundColor: 'rgba(12, 16, 24, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(244, 241, 232, 0.14)',
            borderRadius: 12,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {/* Brand & Market Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: COLORS.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: 22,
                color: COLORS.ink,
                boxShadow: '0 0 14px rgba(242, 207, 29, 0.5)',
              }}
            >
              D
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                CUMMINS INDIA
                <span
                  style={{
                    backgroundColor: 'rgba(244, 241, 232, 0.12)',
                    color: '#F4F1E8',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  NSE · CUMMINSIND-EQ
                </span>
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  color: COLORS.accent,
                  letterSpacing: '0.06em',
                }}
              >
                DAILY SUPPORT / RESISTANCE & TARGET MASTERCLASS
              </div>
            </div>
          </div>

          {/* Golden Law Pill (Center) */}
          <div
            style={{
              backgroundColor: 'rgba(9, 13, 20, 0.92)',
              border: '1.5px solid rgba(242, 207, 29, 0.65)',
              borderRadius: 20,
              padding: '6px 20px',
              fontFamily: FONTS.mono,
              fontSize: 12,
              fontWeight: 800,
              color: '#F2CF1D',
              letterSpacing: '0.08em',
              boxShadow: '0 0 16px rgba(242, 207, 29, 0.25)',
            }}
          >
            RULE: BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE
          </div>

          {/* Right Live Quote & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                position: 'relative',
                padding: 2,
                borderRadius: 10,
                background: `conic-gradient(from ${borderRotateDeg}deg, #10B981, #22D3EE, #F2CF1D, #10B981)`,
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(9, 13, 20, 0.96)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: COLORS.bullish,
                    boxShadow: '0 0 6px #10B981',
                  }}
                />
                <span style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                  ₹4,369.00
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.bullish }}>
                  +1.88%
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: FONTS.mono,
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.breaking,
                backgroundColor: 'rgba(254, 107, 61, 0.12)',
                border: '1px solid rgba(254, 107, 61, 0.4)',
                padding: '5px 10px',
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: COLORS.breaking,
                  boxShadow: '0 0 6px #FE6B3D',
                }}
              />
              LIVE REC
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE (LEFT CHART + RIGHT TELEMETRY SIDEBAR) */}
      <div
        style={{
          position: 'absolute',
          top: 154,
          left: 28,
          right: 28,
          bottom: 124,
          display: 'flex',
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* LEFT WORKSTATION: HERO TRADINGVIEW CHART CONTAINER (Width: 1390px) */}
        <div
          style={{
            flex: '0 0 1390px',
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: '#0C0E12',
            border: '1.5px solid rgba(244, 241, 232, 0.16)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Chart Display Area with Camera Movement */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              transform: `scale(${cameraScale}) translate(${cameraPanX}px, ${cameraPanY}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.05s linear',
            }}
          >
            {/* Chart Image */}
            <Img
              src={staticFile('charts/CUMMINSIND_MotionDoctrine_chart.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                opacity: phase === 0 ? 1.0 : 0.88,
              }}
            />

            {/* FOCUS VIGNETTE MASK (Dims inactive areas during deep zoom beats) */}
            {phase > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(5, 7, 10, 0.22)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            )}

            {/* =========================================================
                LIVE PRICE (CMP ₹4,369.00) PERMANENT HIGHLIGHT & SONAR CIRCLE-OUT
               ========================================================= */}
            {/* Horizontal Continuous Anchor Line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '30.8%',
                height: 2.5,
                backgroundColor: '#10B981',
                boxShadow: '0 0 12px #10B981, 0 0 24px rgba(16, 185, 129, 0.5)',
                zIndex: 20,
              }}
            >
              {/* CMP Left Tag */}
              <div
                style={{
                  position: 'absolute',
                  left: 20,
                  bottom: 6,
                  backgroundColor: 'rgba(16, 185, 129, 0.95)',
                  color: '#121417',
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                }}
              >
                ● LIVE CMP: ₹4,369.00
              </div>
            </div>

            {/* Live Price Expanding Circle-Out Sonar Pulse (On latest candle x=73.5%) */}
            <div
              style={{
                position: 'absolute',
                left: '73.5%',
                bottom: '30.8%',
                transform: 'translate(-50%, 50%)',
                pointerEvents: 'none',
                zIndex: 22,
              }}
            >
              {/* Inner Solid Core */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 10px #FFFFFF, 0 0 20px #10B981',
                }}
              />
              {/* Expanding Circle-Out Wave 1 */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '2.5px solid #10B981',
                  transform: `translate(-50%, -50%) scale(${pingScale})`,
                  opacity: pingOpacity,
                  boxShadow: '0 0 16px #10B981',
                }}
              />
              {/* Expanding Circle-Out Wave 2 (Phase Offset) */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1.5px solid #22D3EE',
                  transform: `translate(-50%, -50%) scale(${interpolate((frame + 20) % pingCycle / pingCycle, [0, 1], [0.8, 3.6])})`,
                  opacity: interpolate((frame + 20) % pingCycle / pingCycle, [0, 0.25, 1], [0.95, 0.75, 0]),
                  boxShadow: '0 0 14px #22D3EE',
                }}
              />
            </div>

            {/* =========================================================
                ISOLATED ACTIVE LEVEL OVERLAYS (OTHER LINES DISAPPEAR)
               ========================================================= */}

            {/* BEAT 1: ONLY POC (₹4,136.30) & VAL (₹3,950.14) SHOWN */}
            {phase === 1 && (
              <>
                {/* POC Golden Beam with Left-to-Right Glowing Sweep */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '19.2%',
                    height: 4.5,
                    backgroundColor: '#F2CF1D',
                    boxShadow:
                      '0 0 16px #F2CF1D, 0 0 35px #F2CF1D, 0 0 80px rgba(242, 207, 29, 0.8)',
                    zIndex: 25,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
                  {/* Leading Laser Spark */}
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
                        boxShadow: '0 0 20px #FFFFFF, 0 0 35px #F2CF1D',
                      }}
                    />
                  )}
                  {/* Label Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 8,
                      backgroundColor: 'rgba(242, 207, 29, 0.98)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
                    }}
                  >
                    ★ MONTHLY POC: ₹4,136.30 (1.10M VOLUME ABSORPTION FLOOR)
                  </div>
                </div>

                {/* Concentric Radar Rings on the 1.10M volume spike candle */}
                <div
                  style={{
                    position: 'absolute',
                    left: '73.5%',
                    bottom: '19.2%',
                    transform: 'translate(-50%, 50%)',
                    width: 32 + ((frame - cue1) * 6) % 130,
                    height: 32 + ((frame - cue1) * 6) % 130,
                    borderRadius: '50%',
                    border: '3px solid rgba(242, 207, 29, 0.9)',
                    opacity: 1 - (((frame - cue1) * 6) % 130) / 130,
                    pointerEvents: 'none',
                    zIndex: 26,
                  }}
                />

                {/* VAL Structural Floor */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '10.4%',
                    height: 3.5,
                    backgroundColor: '#EF4444',
                    boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
                    zIndex: 24,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 7,
                      backgroundColor: 'rgba(239, 68, 68, 0.95)',
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 5,
                    }}
                  >
                    VAL: ₹3,950.14 [ULTIMATE VALUE AREA SUPPORT FLOOR]
                  </div>
                </div>

                {/* Connecting Distance Delta between CMP and POC */}
                <div
                  style={{
                    position: 'absolute',
                    left: '52%',
                    bottom: '19.2%',
                    height: '11.6%', // from 19.2% to 30.8%
                    width: 2,
                    borderLeft: '2px dashed #F2CF1D',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.94)',
                      border: '1px solid #F2CF1D',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontFamily: FONTS.mono,
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#F2CF1D',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ -₹232.70 (-5.3%) SUPPORT FLOOR
                  </div>
                </div>
              </>
            )}

            {/* BEAT 2: ONLY DEMA 20 (₹4,241.10) SHOWN */}
            {phase === 2 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '23.3%',
                    height: 4.5,
                    backgroundColor: '#10B981',
                    boxShadow:
                      '0 0 16px #10B981, 0 0 32px #10B981, 0 0 70px rgba(16, 185, 129, 0.8)',
                    zIndex: 25,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
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
                        boxShadow: '0 0 20px #FFFFFF, 0 0 35px #10B981',
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 8,
                      backgroundColor: 'rgba(16, 185, 129, 0.98)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    ✔ DEMA 20: ₹4,241.10 [RECLAIMED DYNAMIC SUPPORT]
                  </div>
                </div>

                {/* Connecting Distance Delta between CMP and DEMA 20 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '52%',
                    bottom: '23.3%',
                    height: '7.5%',
                    width: 2,
                    borderLeft: '2px dashed #10B981',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.94)',
                      border: '1px solid #10B981',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontFamily: FONTS.mono,
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#10B981',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ -₹127.90 (-2.9%) RECLAIMED SUPPORT
                  </div>
                </div>
              </>
            )}

            {/* BEAT 3: ONLY DEMA 50 (₹4,368.15) & CMP SHOWN */}
            {phase === 3 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '29.6%',
                    height: 4.5,
                    backgroundColor: '#F2CF1D',
                    boxShadow:
                      '0 0 16px #F2CF1D, 0 0 35px #F2CF1D, 0 0 80px rgba(242, 207, 29, 0.85)',
                    zIndex: 25,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
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
                        boxShadow: '0 0 20px #FFFFFF, 0 0 35px #F2CF1D',
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 8,
                      backgroundColor: 'rgba(242, 207, 29, 0.98)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    ⚔ DEMA 50: ₹4,368.15 [IMMEDIATE INFLECTION HURDLE]
                  </div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: '52%',
                    bottom: '33%',
                    backgroundColor: 'rgba(9, 13, 20, 0.94)',
                    border: '1.5px solid #F2CF1D',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#F2CF1D',
                    zIndex: 28,
                  }}
                >
                  CMP ₹4,369 KISSING DEMA 50 · BREAKOUT CONVERTS TO SUPPORT
                </div>
              </>
            )}

            {/* BEAT 4: ONLY VAH (₹4,648.24) SHOWN */}
            {phase === 4 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '43.1%',
                    height: 4.5,
                    backgroundColor: '#22D3EE',
                    boxShadow:
                      '0 0 16px #22D3EE, 0 0 35px #22D3EE, 0 0 80px rgba(34, 211, 238, 0.8)',
                    zIndex: 25,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
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
                        boxShadow: '0 0 20px #FFFFFF, 0 0 35px #22D3EE',
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 8,
                      backgroundColor: 'rgba(34, 211, 238, 0.98)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    ↗ VAH: ₹4,648.24 [PRIMARY UPSIDE TARGET CORRIDOR]
                  </div>
                </div>

                {/* Connecting Distance Delta between CMP and VAH */}
                <div
                  style={{
                    position: 'absolute',
                    left: '52%',
                    bottom: '30.8%',
                    height: '12.3%', // from 30.8% to 43.1%
                    width: 2,
                    borderLeft: '2px dashed #22D3EE',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.94)',
                      border: '1px solid #22D3EE',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontFamily: FONTS.mono,
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#22D3EE',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ +₹279.24 (+6.4%) TARGET EXPANSION
                  </div>
                </div>
              </>
            )}

            {/* BEAT 5: ONLY DEMA 100 (₹4,727.45) & DEMA 200 (₹5,155.80) SHOWN */}
            {phase === 5 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '46.7%',
                    height: 3.5,
                    backgroundColor: '#FB7185',
                    boxShadow: '0 0 16px rgba(251, 113, 133, 0.8)',
                    zIndex: 24,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 7,
                      backgroundColor: 'rgba(251, 113, 133, 0.98)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '3px 10px',
                      borderRadius: 5,
                    }}
                  >
                    DEMA 100: ₹4,727.45 [SECONDARY TARGET]
                  </div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '66.7%',
                    height: 4.5,
                    backgroundColor: '#EF4444',
                    boxShadow:
                      '0 0 16px #EF4444, 0 0 35px #EF4444, 0 0 80px rgba(239, 68, 68, 0.8)',
                    zIndex: 25,
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 8,
                      backgroundColor: 'rgba(239, 68, 68, 0.98)',
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    DEMA 200: ₹5,155.80 [MACRO TREND REVERSAL TARGET]
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT WORKSTATION: SYNCHRONIZED TELEMETRY SIDEBAR SPOTLIGHT (Width: 470px) */}
        <div
          style={{
            flex: '1 1 auto',
            backgroundColor: 'rgba(12, 16, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 14,
            border: '1.5px solid rgba(242, 207, 29, 0.35)',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          }}
        >
          <div>
            {/* Sidebar Title */}
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 19,
                fontWeight: 900,
                color: '#F2CF1D',
                letterSpacing: '0.08em',
                borderBottom: '1px solid rgba(244, 241, 232, 0.12)',
                paddingBottom: 10,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              LEVEL MATRIX TELEMETRY
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  color: COLORS.muted,
                  fontWeight: 600,
                }}
              >
                1D STUDY
              </span>
            </div>

            {/* LEVEL CARDS STACK WITH SYNCHRONIZED SPOTLIGHT */}

            {/* 1. RESISTANCE & TARGETS (ABOVE CMP) */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fontWeight: 800,
                  color: COLORS.breaking,
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                }}
              >
                ▲ RESISTANCE & TARGETS (ABOVE CMP)
              </div>

              {/* DEMA 200 Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 5 ? 'rgba(239, 68, 68, 0.28)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 5 ? '1.5px solid #EF4444' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: phase === 5 ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none',
                  transform: phase === 5 ? 'scale(1.03)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 5 ? 1.0 : 0.32,
                  marginBottom: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
                  DEMA 200 (Macro)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#EF4444' }}>
                  ₹5,155.80
                </span>
              </div>

              {/* DEMA 100 Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 5 ? 'rgba(251, 113, 133, 0.28)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 5 ? '1.5px solid #FB7185' : '1px solid rgba(244, 241, 232, 0.06)',
                  transform: phase === 5 ? 'scale(1.03)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 5 ? 1.0 : 0.32,
                  marginBottom: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
                  DEMA 100 (Target)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#FB7185' }}>
                  ₹4,727.45
                </span>
              </div>

              {/* VAH Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 4 ? 'rgba(34, 211, 238, 0.30)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 4 ? '2px solid #22D3EE' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: phase === 4 ? '0 0 20px rgba(34, 211, 238, 0.45)' : 'none',
                  transform: phase === 4 ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 4 ? 1.0 : 0.32,
                  marginBottom: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800, color: '#22D3EE' }}>
                  ↗ VAH Corridor
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#22D3EE' }}>
                  ₹4,648.24
                </span>
              </div>

              {/* DEMA 50 Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 3 ? 'rgba(242, 207, 29, 0.30)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 3 ? '2px solid #F2CF1D' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: phase === 3 ? '0 0 20px rgba(242, 207, 29, 0.45)' : 'none',
                  transform: phase === 3 ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 3 ? 1.0 : 0.32,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800, color: '#F2CF1D' }}>
                  ⚔ DEMA 50 (Hurdle)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#F2CF1D' }}>
                  ₹4,368.15
                </span>
              </div>
            </div>

            {/* 2. ACTIVE PIVOT (CMP) - ALWAYS PROMINENT */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.20)',
                border: '1.5px solid #10B981',
                borderRadius: 8,
                padding: '8px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '10px 0',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
              }}
            >
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#10B981' }}>
                  ● CMP CURRENT PIVOT
                </div>
                <div style={{ fontFamily: FONTS.ui, fontSize: 10, color: COLORS.muted }}>
                  Active Boundary Threshold
                </div>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                ₹4,369.00
              </div>
            </div>

            {/* 3. DYNAMIC SUPPORTS (BELOW CMP) */}
            <div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fontWeight: 800,
                  color: COLORS.bullish,
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                }}
              >
                ▼ DYNAMIC SUPPORTS (BELOW CMP)
              </div>

              {/* DEMA 20 Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 2 ? 'rgba(16, 185, 129, 0.28)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 2 ? '2px solid #10B981' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: phase === 2 ? '0 0 20px rgba(16, 185, 129, 0.45)' : 'none',
                  transform: phase === 2 ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 2 ? 1.0 : 0.32,
                  marginBottom: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800, color: '#10B981' }}>
                  ✔ DEMA 20 (Support)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#10B981' }}>
                  ₹4,241.10
                </span>
              </div>

              {/* POC Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 1 ? 'rgba(242, 207, 29, 0.30)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 1 ? '2px solid #F2CF1D' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: phase === 1 ? '0 0 20px rgba(242, 207, 29, 0.45)' : 'none',
                  transform: phase === 1 ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 1 ? 1.0 : 0.32,
                  marginBottom: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800, color: '#F2CF1D' }}>
                  ★ POC (1.10M Floor)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#F2CF1D' }}>
                  ₹4,136.30
                </span>
              </div>

              {/* VAL Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 6,
                  backgroundColor: phase === 1 ? 'rgba(239, 68, 68, 0.28)' : 'rgba(244, 241, 232, 0.03)',
                  border: phase === 1 ? '1.5px solid #EF4444' : '1px solid rgba(244, 241, 232, 0.06)',
                  transform: phase === 1 ? 'scale(1.03)' : 'scale(1.0)',
                  opacity: phase === 0 || phase === 1 ? 1.0 : 0.32,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
                  VAL (Value Area Low)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#EF4444' }}>
                  ₹3,950.14
                </span>
              </div>
            </div>
          </div>

          {/* CONFIRMATION GAUGES (BOTTOM OF SIDEBAR) */}
          <div
            style={{
              borderTop: '1px solid rgba(244, 241, 232, 0.12)',
              paddingTop: 12,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.accent,
                marginBottom: 8,
              }}
            >
              DIRECTIONAL CONFIRMATION
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>
                1.10M Buy Vol Absorption:
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#10B981' }}>
                CONFIRMED
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>
                Open Interest (OI) Trend:
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#22D3EE' }}>
                +14.2% (LONG ACCUM)
              </span>
            </div>

            {/* Mini Progress Ratio Bar */}
            <div
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(244, 241, 232, 0.1)',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div style={{ width: '74%', backgroundColor: '#10B981' }} />
              <div style={{ width: '26%', backgroundColor: '#EF4444' }} />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: FONTS.mono,
                fontSize: 9,
                color: COLORS.muted,
                marginTop: 4,
              }}
            >
              <span>BUY VOL: 74%</span>
              <span>SELL: 26%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WIDESCREEN KINETIC KARAOKE CAPTIONS (Positioned at TOP of screen to eliminate any collision with video) */}
      {showHud && (
        <KineticBroadcastCaptions
          chunks={manifest.body_chunks || manifest.chunks}
          frame={frame}
          fps={fps}
          vertical={false}
          top={86}
        />
      )}

      {/* 5. BOTTOM DUAL-RAIL LOWER THIRD STRAP */}
      {showHud && (
        <LowerThirdStrap
          tabLabel={strapConfig.tabLabel}
          tabBg={strapConfig.tabBg}
          tabColor={strapConfig.tabColor}
          contextChip={strapConfig.contextChip}
          headline={strapConfig.headline}
          rightSource={strapConfig.rightSource}
          vertical={false}
        />
      )}

      {/* 6. EDUCATIONAL COMPLIANCE WATERMARK RIBBON */}
      {showHud && (
        <div style={{ position: 'absolute', bottom: 18, right: 96, zIndex: 25 }}>
          <EducationalRibbon
            text="FOR TECHNICAL CHART STUDY ONLY · NOT SEBI REGISTERED INVESTMENT ADVICE"
            vertical={false}
          />
        </div>
      )}

      {/* 7. WHITE FLASH CUT AT BEAT TRANSITIONS */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
            zIndex: 90,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 8. SLANTED FINALE WIPE */}
      {frame >= endWipe && (
        <SlantedEndWipe
          progress={clamp01((frame - endWipe) / 18)}
          vertical={false}
        />
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   FULL 16:9 MASTER YOUTUBE COMPOSITION (121.87s / 3,656 frames @ 30fps)
   ========================================================================= */
export const CumminsYouTubeExplainer16x9 = () => {
  return (
    <Series>
      {/* 1. Master DEMA Branded Intro Sting (3.5s = 105 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_YT_INTRO_FRAMES}>
        <DemaIntro brand={brand} />
      </Series.Sequence>

      {/* 2. Cummins India Support/Resistance Masterclass 16:9 (113.37s = 3401 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_YT_BODY_FRAMES}>
        <CumminsYouTubeExplainerCore />
      </Series.Sequence>

      {/* 3. Master DEMA Outro End Card (5.0s = 150 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_YT_OUTRO_FRAMES}>
        <DemaOutro brand={brand} showGuides={false} />
      </Series.Sequence>
    </Series>
  );
};
