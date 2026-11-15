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

import manifest from '../public/data/waaree_explainer_manifest.json';
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

export const WAAREE_YT_INTRO_FRAMES = manifest.intro_frames || 105;
export const WAAREE_YT_BODY_FRAMES = manifest.body_frames || 3660;
export const WAAREE_YT_OUTRO_FRAMES = manifest.outro_frames || 150;
export const WAAREE_YT_TOTAL_FRAMES =
  WAAREE_YT_INTRO_FRAMES + WAAREE_YT_BODY_FRAMES + WAAREE_YT_OUTRO_FRAMES;

/* =========================================================================
   16:9 WIDESCREEN YOUTUBE EXPLAINER CORE COMPONENT (1920x1080 @ 30fps)
   Waaree Energies Edition: Decluttered Single-Level Laser Protocol,
   Top Floating Captions (top: 86px), Live Price Sonar Radar Ping,
   and Synchronized Telemetry Spotlight.
   ========================================================================= */
export const WaareeYouTubeExplainerCore = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cues = manifest.body_cue_frames || [15, 530, 1141, 1774, 2439, 3047];
  const cue0 = cues[0] || 15;
  const cue1 = cues[1] || 530;
  const cue2 = cues[2] || 1141;
  const cue3 = cues[3] || 1774;
  const cue4 = cues[4] || 2439;
  const cue5 = cues[5] || 3047;
  const endWipe = manifest.end_wipe_frame || 3614;
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
    // Phase 1: Deep zoom into POC (₹2,316.44) & VAL (₹2,278.18) accumulation base
    const p1 = clamp01((frame - cue1) / 24);
    cameraScale = interpolate(p1, [0, 1], [1.03, 1.35]);
    cameraPanX = interpolate(p1, [0, 1], [0, 40]);
    cameraPanY = interpolate(p1, [0, 1], [0, 75]);
  } else if (phase === 2) {
    // Phase 2: Deep zoom into DEMA 50 (₹2,358.55) & DEMA 100 (₹2,383.30)
    const p2 = clamp01((frame - cue2) / 24);
    cameraScale = interpolate(p2, [0, 1], [1.35, 1.38]);
    cameraPanX = interpolate(p2, [0, 1], [40, 25]);
    cameraPanY = interpolate(p2, [0, 1], [75, 45]);
  } else if (phase === 3) {
    // Phase 3: Ultra zoom locked directly onto 200 DEMA (₹2,509.55) & CMP ₹2,546.00
    const p3 = clamp01((frame - cue3) / 24);
    const recoil = Math.sin(clamp01((frame - cue3) / 22) * Math.PI) * 10;
    cameraScale = interpolate(p3, [0, 1], [1.38, 1.45]);
    cameraPanX = interpolate(p3, [0, 1], [25, 15]);
    cameraPanY = interpolate(p3, [0, 1], [45 + recoil, -10]);
  } else if (phase === 4) {
    // Phase 4: Zoom into VAH Target Corridor (₹2,584.28)
    const p4 = clamp01((frame - cue4) / 24);
    cameraScale = interpolate(p4, [0, 1], [1.45, 1.32]);
    cameraPanX = interpolate(p4, [0, 1], [15, 10]);
    cameraPanY = interpolate(p4, [0, 1], [-10, -50]);
  } else {
    // Phase 5: Pull back to reveal Macro Swing Peak Target (₹2,807.15) & 200 DEMA trailing defense
    const p5 = clamp01((frame - cue5) / 24);
    cameraScale = interpolate(p5, [0, 1], [1.32, 1.06]);
    cameraPanX = interpolate(p5, [0, 1], [10, 0]);
    cameraPanY = interpolate(p5, [0, 1], [-50, -15]);
  }

  // Live Price (CMP) circle-out sonar ping animation (every 40 frames = 1.33s)
  const pingCycle = 40;
  const pingProgress = ((frame % pingCycle) / pingCycle);
  const pingScale = interpolate(pingProgress, [0, 1], [0.8, 3.6]);
  const pingOpacity = interpolate(pingProgress, [0, 0.25, 1], [0.95, 0.75, 0]);

  // Second offset wave
  const pingOffset = ((frame + 20) % pingCycle) / pingCycle;
  const pingScaleOffset = interpolate(pingOffset, [0, 1], [0.8, 3.6]);
  const pingOpacityOffset = interpolate(pingOffset, [0, 0.25, 1], [0.8, 0.6, 0]);

  const strapConfig = {
    0: {
      tabLabel: 'UNIVERSAL LAW',
      tabBg: COLORS.gold,
      tabColor: COLORS.ink,
      contextChip: 'NSE · WAAREEENER',
      headline: 'LEVELS BELOW CMP = SUPPORT | LEVELS ABOVE CMP = TARGET & RESISTANCE',
      rightSource: 'CMP ₹2,546.00',
    },
    1: {
      tabLabel: 'VAL & POC ACCUMULATION',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: 'INSTITUTIONAL BASE',
      headline: '1.09M SHARES ABSORBED AT MONTHLY POC ₹2,316.44 ABOVE VAL ₹2,278.18',
      rightSource: 'BUY VOL CONFIRMS',
    },
    2: {
      tabLabel: 'DEMA 50 & 100 FLIPPED',
      tabBg: COLORS.accent,
      tabColor: COLORS.ink,
      contextChip: 'TREND ACCELERATION',
      headline: 'RALLY SURGES PAST DEMA 50 (₹2,358) & DEMA 100 (₹2,383) · FLIPPED TO DYNAMIC SUPPORT',
      rightSource: 'VOL RECLAIM',
    },
    3: {
      tabLabel: '200 DEMA RECLAIMED',
      tabBg: COLORS.bullish,
      tabColor: COLORS.ink,
      contextChip: 'PRIMARY SUPPORT',
      headline: 'MAJOR TECHNICAL RECLAIM: WAAREE SURGES PAST 200 DEMA (₹2,509.55) · IMMEDIATE DEFENSE',
      rightSource: 'DYNAMIC DEFENSE',
    },
    4: {
      tabLabel: 'VAH OVERHEAD TARGET',
      tabBg: '#22D3EE',
      tabColor: COLORS.ink,
      contextChip: 'IMMEDIATE HURDLE',
      headline: 'PRICE BELOW VAH (₹2,584.28) MARKS IMMEDIATE RESISTANCE · BREAKOUT UNLOCKS EXPANSION',
      rightSource: 'TARGET ₹2,584',
    },
    5: {
      tabLabel: 'MACRO EXPANSION PLAYBOOK',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: 'EXPANSION PATH',
      headline: 'BREAKOUT ABOVE VAH TARGETS ₹2,807 MACRO PEAK · TRAILING STOP ANCHORED AT 200 DEMA ₹2,509',
      rightSource: 'MACRO PLAYBOOK',
    },
  }[phase];

  const borderRotateDeg = (frame * 3.5) % 360;

  // Chart coordinate bottom percentages for WAAREE ENERGIES:
  // Macro High: 92.5% (₹2,807.15)
  // VAH:        63.5% (₹2,584.28)
  // LIVE CMP:   58.8% (₹2,546.00)
  // DEMA 200:   51.9% (₹2,509.55)
  // DEMA 20:    42.5% (₹2,442.80)
  // DEMA 100:   34.5% (₹2,383.30)
  // DEMA 50:    31.0% (₹2,358.55)
  // POC:        26.2% (₹2,316.44)
  // VAL:        19.5% (₹2,278.18)

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
                WAAREE ENERGIES
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
                  NSE · WAAREEENER-EQ
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
                DAILY SUPPORT / RESISTANCE & DEMA TARGET MASTERCLASS
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
                  ₹2,546.00
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.bullish }}>
                  RECLAIMED
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
              src={staticFile('charts/WAAREEENER_1D_chart.png')}
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
                LIVE PRICE (CMP ₹2,546.00) PERMANENT HIGHLIGHT & SONAR CIRCLE-OUT
               ========================================================= */}
            {/* Horizontal Continuous Anchor Line at bottom: 58.8% */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '58.8%',
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
                ● LIVE CMP: ₹2,546.00
              </div>
            </div>

            {/* Live Price Expanding Circle-Out Sonar Pulse (On latest candle x=49.0%) */}
            <div
              style={{
                position: 'absolute',
                left: '49.0%',
                bottom: '58.8%',
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
                  transform: `translate(-50%, -50%) scale(${pingScaleOffset})`,
                  opacity: pingOpacityOffset,
                  boxShadow: '0 0 12px #22D3EE',
                }}
              />
            </div>

            {/* =========================================================
                DECLUTTERED SINGLE-LEVEL LASER PROTOCOL OVERLAYS
               ========================================================= */}

            {/* PHASE 0: FULL LEVEL MAP PREVIEW */}
            {phase === 0 && (
              <>
                {/* 200 DEMA */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '51.9%', height: 1.5, backgroundColor: 'rgba(239, 68, 68, 0.45)', zIndex: 12 }} />
                {/* POC */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '26.2%', height: 2, backgroundColor: 'rgba(242, 207, 29, 0.55)', zIndex: 12 }} />
                {/* VAH */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '63.5%', height: 1.5, backgroundColor: 'rgba(34, 211, 238, 0.45)', zIndex: 12 }} />
                {/* Macro Target */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '92.5%', height: 1.5, borderTop: '2px dashed rgba(254, 107, 61, 0.45)', zIndex: 12 }} />
              </>
            )}

            {/* PHASE 1: POC (₹2,316.44) & VAL (₹2,278.18) */}
            {phase === 1 && (
              <>
                {/* Monthly POC Glowing Laser Line Sweep at 26.2% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '26.2%',
                    height: 4.5,
                    backgroundColor: '#F2CF1D',
                    boxShadow: '0 0 16px #F2CF1D, 0 0 35px #F2CF1D, 0 0 70px rgba(242, 207, 29, 0.8)',
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                    zIndex: 25,
                  }}
                >
                  {/* Leading Spark */}
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
                  {/* POC Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 8,
                      backgroundColor: '#F2CF1D',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    ★ MONTHLY POC: ₹2,316.44
                    <span style={{ backgroundColor: '#121417', color: '#F2CF1D', padding: '1px 6px', borderRadius: 4, fontSize: 10 }}>
                      1.09M SHARES
                    </span>
                  </div>
                </div>

                {/* VAL Line at 19.5% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '19.5%',
                    height: 2.5,
                    backgroundColor: '#F87171',
                    boxShadow: '0 0 10px #F87171',
                    zIndex: 24,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 5,
                      backgroundColor: 'rgba(248, 113, 113, 0.95)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    VAL FLOOR: ₹2,278.18
                  </div>
                </div>

                {/* Dashed Delta Connection: CMP to POC */}
                <div
                  style={{
                    position: 'absolute',
                    left: '49.0%',
                    bottom: '26.2%',
                    height: `${58.8 - 26.2}%`,
                    width: 2,
                    borderLeft: '2.5px dashed #F2CF1D',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.92)',
                      border: '1.5px solid #F2CF1D',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#F2CF1D',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ -₹229.56 (-9.0%) POC DEMAND FLOOR (1.09M)
                  </div>
                </div>
              </>
            )}

            {/* PHASE 2: DEMA 50 (₹2,358.55) & DEMA 100 (₹2,383.30) */}
            {phase === 2 && (
              <>
                {/* DEMA 100 at 34.5% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '34.5%',
                    height: 4.5,
                    backgroundColor: '#F97316',
                    boxShadow: '0 0 16px #F97316, 0 0 35px rgba(249, 115, 22, 0.7)',
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                    zIndex: 25,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 8,
                      backgroundColor: '#F97316',
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.8)',
                    }}
                  >
                    DEMA 100: ₹2,383.30 (DYNAMIC SUPPORT)
                  </div>
                </div>

                {/* DEMA 50 at 31.0% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '31.0%',
                    height: 3,
                    backgroundColor: '#FACC15',
                    boxShadow: '0 0 12px #FACC15',
                    zIndex: 24,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 5,
                      backgroundColor: '#FACC15',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    DEMA 50: ₹2,358.55 (SUPPORT BASE)
                  </div>
                </div>

                {/* Dashed Delta Connection: CMP to DEMA 100 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '49.0%',
                    bottom: '34.5%',
                    height: `${58.8 - 34.5}%`,
                    width: 2,
                    borderLeft: '2.5px dashed #F97316',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.92)',
                      border: '1.5px solid #F97316',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#F97316',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ -₹162.70 (-6.4%) DEMA 100 & 50 SUPPORT
                  </div>
                </div>
              </>
            )}

            {/* PHASE 3: 200 DEMA (₹2,509.55) & 20 DEMA (₹2,442.80) */}
            {phase === 3 && (
              <>
                {/* 200 DEMA Glowing Line at 51.9% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '51.9%',
                    height: 4.5,
                    backgroundColor: '#EF4444',
                    boxShadow: '0 0 16px #EF4444, 0 0 35px #EF4444, 0 0 70px rgba(239, 68, 68, 0.8)',
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                    zIndex: 25,
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
                        boxShadow: '0 0 20px #FFFFFF, 0 0 35px #EF4444',
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 8,
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.8)',
                    }}
                  >
                    ★ 200 DEMA RECLAIMED: ₹2,509.55 (PRIMARY SUPPORT)
                  </div>
                </div>

                {/* 20 DEMA Line at 42.5% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '42.5%',
                    height: 2.5,
                    backgroundColor: '#06B6D4',
                    boxShadow: '0 0 10px #06B6D4',
                    zIndex: 24,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 5,
                      backgroundColor: '#06B6D4',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    20 DEMA: ₹2,442.80 (TRAILING SUPPORT)
                  </div>
                </div>

                {/* Dashed Delta Connection: CMP to 200 DEMA */}
                <div
                  style={{
                    position: 'absolute',
                    left: '49.0%',
                    bottom: '51.9%',
                    height: `${58.8 - 51.9}%`,
                    width: 2,
                    borderLeft: '2.5px dashed #EF4444',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.92)',
                      border: '1.5px solid #EF4444',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#EF4444',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ -₹36.45 (-1.4%) 200 DEMA PRIMARY SUPPORT
                  </div>
                </div>
              </>
            )}

            {/* PHASE 4: VALUE AREA HIGH (₹2,584.28) */}
            {phase === 4 && (
              <>
                {/* VAH Glowing Laser Sweep Line at 63.5% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '63.5%',
                    height: 4.5,
                    backgroundColor: '#22D3EE',
                    boxShadow: '0 0 16px #22D3EE, 0 0 35px #22D3EE, 0 0 70px rgba(34, 211, 238, 0.8)',
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                    zIndex: 25,
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
                      left: 24,
                      bottom: 8,
                      backgroundColor: '#22D3EE',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.8)',
                    }}
                  >
                    ▲ VALUE AREA HIGH (VAH): ₹2,584.28 (OVERHEAD TARGET 1)
                  </div>
                </div>

                {/* Dashed Delta Connection: CMP up to VAH */}
                <div
                  style={{
                    position: 'absolute',
                    left: '49.0%',
                    bottom: '58.8%',
                    height: `${63.5 - 58.8}%`,
                    width: 2,
                    borderLeft: '2.5px dashed #22D3EE',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.92)',
                      border: '1.5px solid #22D3EE',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#22D3EE',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ +₹38.28 (+1.5%) VAH RESISTANCE & TARGET 1
                  </div>
                </div>
              </>
            )}

            {/* PHASE 5: MACRO EXPANSION TARGET (₹2,807.15) & 200 DEMA DEFENSE */}
            {phase === 5 && (
              <>
                {/* Macro Target Line at 92.5% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '92.5%',
                    height: 4,
                    borderTop: '2px dashed #FE6B3D',
                    backgroundColor: 'rgba(254, 107, 61, 0.25)',
                    boxShadow: '0 0 20px rgba(254, 107, 61, 0.6)',
                    clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                    zIndex: 25,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      top: 6,
                      backgroundColor: '#FE6B3D',
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.8)',
                    }}
                  >
                    ▲ MACRO SWING TARGET 2: ₹2,807.15 (+10.3%)
                  </div>
                </div>

                {/* 200 DEMA Trailing Stop Line at 51.9% */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '51.9%',
                    height: 3,
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 14px #10B981',
                    zIndex: 23,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      bottom: 6,
                      backgroundColor: '#10B981',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '2px 10px',
                      borderRadius: 4,
                    }}
                  >
                    🛡️ TRAILING DEFENSE: 200 DEMA (₹2,509.55)
                  </div>
                </div>

                {/* Dashed Delta Connection: CMP to Macro Target */}
                <div
                  style={{
                    position: 'absolute',
                    left: '49.0%',
                    bottom: '58.8%',
                    height: `${92.5 - 58.8}%`,
                    width: 2,
                    borderLeft: '2.5px dashed #FE6B3D',
                    zIndex: 22,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(9, 13, 20, 0.92)',
                      border: '1.5px solid #FE6B3D',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#FE6B3D',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Δ +₹261.15 (+10.3%) MACRO EXPANSION TARGET
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT WORKSTATION: SYNCHRONIZED TELEMETRY MATRIX (Width: 454px) */}
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Telemetry Matrix Header */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.94)',
              border: '1.5px solid rgba(244, 241, 232, 0.14)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: COLORS.accent, letterSpacing: '0.08em' }}>
              LEVEL MATRIX · WAAREEENER
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.paperDim }}>
              AUTO SPOTLIGHT
            </div>
          </div>

          {/* Card: Macro Target 2 (Phase 5 Active) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 5 ? '1.5px solid #FE6B3D' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 5 || phase === 0 ? 1.0 : 0.32,
              transform: phase === 5 ? 'scale(1.03)' : 'scale(1.0)',
              boxShadow: phase === 5 ? '0 0 16px rgba(254, 107, 61, 0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#FE6B3D', fontWeight: 800 }}>
                ▲ MACRO TARGET 2
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,807.15
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#FE6B3D' }}>
              +10.3%
            </div>
          </div>

          {/* Card: VAH Target 1 (Phase 4 Active) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 4 ? '1.5px solid #22D3EE' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 4 || phase === 0 ? 1.0 : 0.32,
              transform: phase === 4 ? 'scale(1.03)' : 'scale(1.0)',
              boxShadow: phase === 4 ? '0 0 16px rgba(34, 211, 238, 0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#22D3EE', fontWeight: 800 }}>
                ▲ VAH HURDLE (TARGET 1)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,584.28
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#22D3EE' }}>
              +1.5%
            </div>
          </div>

          {/* Card: Live CMP Anchor (Always Highlighted) */}
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid #10B981',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#10B981', fontWeight: 800 }}>
                ● CURRENT MARKET PRICE (PIVOT)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,546.00
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#10B981' }}>
              PIVOT
            </div>
          </div>

          {/* Card: 200 DEMA Reclaimed (Phase 3 Active) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 3 ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 3 || phase === 0 ? 1.0 : 0.32,
              transform: phase === 3 ? 'scale(1.03)' : 'scale(1.0)',
              boxShadow: phase === 3 ? '0 0 16px rgba(239, 68, 68, 0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#EF4444', fontWeight: 800 }}>
                ★ 200 DEMA (PRIMARY SUPPORT)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,509.55
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#EF4444' }}>
              -1.4%
            </div>
          </div>

          {/* Card: 20 DEMA Support (Phase 3 Secondary) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 3 ? '1.5px solid #06B6D4' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 3 || phase === 0 ? 1.0 : 0.32,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#06B6D4', fontWeight: 800 }}>
                20 DEMA (TRAILING STOP)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,442.80
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#06B6D4' }}>
              -4.1%
            </div>
          </div>

          {/* Card: 100 DEMA Base (Phase 2 Active) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 2 ? '1.5px solid #F97316' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 2 || phase === 0 ? 1.0 : 0.32,
              transform: phase === 2 ? 'scale(1.03)' : 'scale(1.0)',
              boxShadow: phase === 2 ? '0 0 16px rgba(249, 115, 22, 0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#F97316', fontWeight: 800 }}>
                100 DEMA (SUPPORT BASE)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,383.30
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#F97316' }}>
              -6.4%
            </div>
          </div>

          {/* Card: 50 DEMA Base (Phase 2 Secondary) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 2 ? '1.5px solid #FACC15' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 2 || phase === 0 ? 1.0 : 0.32,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#FACC15', fontWeight: 800 }}>
                50 DEMA (SUPPORT)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,358.55
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#FACC15' }}>
              -7.4%
            </div>
          </div>

          {/* Card: Monthly POC (Phase 1 Active) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 1 ? '1.5px solid #F2CF1D' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 1 || phase === 0 ? 1.0 : 0.32,
              transform: phase === 1 ? 'scale(1.03)' : 'scale(1.0)',
              boxShadow: phase === 1 ? '0 0 16px rgba(242, 207, 29, 0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#F2CF1D', fontWeight: 800 }}>
                ★ POC (1.09M ACCUMULATION)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,316.44
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#F2CF1D' }}>
              -9.0%
            </div>
          </div>

          {/* Card: VAL Macro Floor (Phase 1 Secondary) */}
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              border: phase === 1 ? '1.5px solid #F87171' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 12px',
              opacity: phase === 1 || phase === 0 ? 1.0 : 0.32,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: '#F87171', fontWeight: 800 }}>
                VAL (STRUCTURAL FLOOR)
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                ₹2,278.18
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: '#F87171' }}>
              -10.5%
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
          category="NSE TECHNICAL STUDY"
          urgency="HIGH CONVICTION"
          frame={frame}
          fps={fps}
          animate={true}
        />
      )}

      {/* 6. EDUCATIONAL DISCLAIMER RIBBON */}
      {showHud && (
        <EducationalRibbon
          text="FOR EDUCATIONAL PURPOSES ONLY · NOT SEBI REGISTERED INVESTMENT ADVICE"
          frame={frame}
          fps={fps}
          bottom={18}
          right={96}
        />
      )}

      {/* 7. FLASH CUT TRANSITION FLASH */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 90,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   MASTER 16:9 YOUTUBE COMPOSITION (3-ACT SEQUENCE: INTRO + BODY + OUTRO)
   ========================================================================= */
export const WaareeYouTubeExplainer16x9 = () => {
  return (
    <Series>
      {/* ACT 1: DEMA INTRO STING (3.50s = 105 frames) */}
      <Series.Sequence durationInFrames={WAAREE_YT_INTRO_FRAMES}>
        <DemaIntro />
      </Series.Sequence>

      {/* ACT 2: WAAREE ENERGIES SUPPORT/RESISTANCE EXPLAINER BODY (3660 frames) */}
      <Series.Sequence durationInFrames={WAAREE_YT_BODY_FRAMES}>
        <WaareeYouTubeExplainerCore />
      </Series.Sequence>

      {/* ACT 3: DEMA BRANDED OUTRO (5.00s = 150 frames) */}
      <Series.Sequence durationInFrames={WAAREE_YT_OUTRO_FRAMES}>
        <DemaOutro />
      </Series.Sequence>
    </Series>
  );
};

export default WaareeYouTubeExplainer16x9;
