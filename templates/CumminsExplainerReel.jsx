import React from 'react';
import {
  AbsoluteFill,
  Audio,
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

export const CUMMINS_EXPLAINER_INTRO_FRAMES = manifest.intro_frames || 105;
export const CUMMINS_EXPLAINER_BODY_FRAMES = manifest.body_frames || 3401;
export const CUMMINS_EXPLAINER_OUTRO_FRAMES = manifest.outro_frames || 150;
export const CUMMINS_EXPLAINER_TOTAL_FRAMES =
  CUMMINS_EXPLAINER_INTRO_FRAMES + CUMMINS_EXPLAINER_BODY_FRAMES + CUMMINS_EXPLAINER_OUTRO_FRAMES;

/* =========================================================================
   CUMMINS INDIA EXPLAINER CORE (Body Component)
   ========================================================================= */
export const CumminsExplainerCore = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  // Live Price (CMP) circle-out sonar ping animation (every 40 frames = 1.33s)
  const pingCycle = 40;
  const pingProgress = ((frame % pingCycle) / pingCycle);
  const pingScale = interpolate(pingProgress, [0, 1], [0.8, 3.6]);
  const pingOpacity = interpolate(pingProgress, [0, 0.25, 1], [0.95, 0.75, 0]);

  // Opening punch-in: 1.08x -> 1.0x over first 24 frames
  const introPunchProgress = clamp01(frame / 24);
  const introZoomScale = interpolate(introPunchProgress, [0, 1], [1.08, 1.0], {
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  // Flash cut opacities at cuts
  const flashTimes = [0, cue1, cue2, cue3, cue4, cue5];
  let flashOpacity = 0;
  for (const ft of flashTimes) {
    if (frame >= ft && frame <= ft + 5) {
      flashOpacity = Math.max(flashOpacity, interpolate(frame - ft, [0, 5], [0.70, 0]));
    }
  }

  // Camera Motion (motion-doctrine)
  let cameraScale = 1.0;
  let cameraPanX = 0;
  let cameraPanY = 0;

  if (frame < cue1) {
    // Phase 0: Full chart overview (showing complete picture)
    const p0 = clamp01(frame / cue1);
    cameraScale = interpolate(p0, [0, 1], [1.02, 1.06]);
    cameraPanX = interpolate(p0, [0, 1], [0, 0]);
    cameraPanY = interpolate(p0, [0, 1], [0, 0]);
  } else if (frame < cue2) {
    // Phase 1: Zoom into VAL & POC floor
    const p1 = clamp01((frame - cue1) / (cue2 - cue1));
    cameraScale = interpolate(p1, [0, 1], [1.06, 1.28]);
    cameraPanX = interpolate(p1, [0, 1], [0, -25]);
    cameraPanY = interpolate(p1, [0, 1], [0, -55]);
  } else if (frame < cue3) {
    // Phase 2: Track upward rebound to DEMA 20
    const p2 = clamp01((frame - cue2) / (cue3 - cue2));
    cameraScale = interpolate(p2, [0, 1], [1.28, 1.26]);
    cameraPanX = interpolate(p2, [0, 1], [-25, 10]);
    cameraPanY = interpolate(p2, [0, 1], [-55, -20]);
  } else if (frame < cue4) {
    // Phase 3: Lock on DEMA 50 hurdle & CMP
    const p3 = clamp01((frame - cue3) / (cue4 - cue3));
    const recoil = Math.sin(clamp01((frame - cue3) / 22) * Math.PI) * 14;
    cameraScale = interpolate(p3, [0, 1], [1.26, 1.35]);
    cameraPanX = interpolate(p3, [0, 1], [10, 35]);
    cameraPanY = interpolate(p3, [0, 1], [-20 + recoil, 15]);
  } else if (frame < cue5) {
    // Phase 4: Pan up to VAH expansion target
    const p4 = clamp01((frame - cue4) / (cue5 - cue4));
    cameraScale = interpolate(p4, [0, 1], [1.35, 1.25]);
    cameraPanX = interpolate(p4, [0, 1], [35, 20]);
    cameraPanY = interpolate(p4, [0, 1], [15, 45]);
  } else {
    // Phase 5: Pull back for macro reversal targets (DEMA 100 & 200) + summary
    const p5 = clamp01((frame - cue5) / Math.max(1, endWipe - cue5));
    cameraScale = interpolate(p5, [0, 1], [1.25, 1.08]);
    cameraPanX = interpolate(p5, [0, 1], [20, 0]);
    cameraPanY = interpolate(p5, [0, 1], [45, 15]);
  }

  const strapConfig = {
    0: {
      tabLabel: 'CORE TRADING LAW',
      tabBg: COLORS.gold,
      tabColor: COLORS.ink,
      contextChip: 'NSE · CUMMINSIND',
      headline: 'BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE',
      rightSource: 'CMP ₹4,369.00',
    },
    1: {
      tabLabel: 'VAL & POC FLOOR',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: 'ABSORPTION CLUSTER',
      headline: '1.10M VOL DEFENDS POC ₹4,136.30 ABOVE VAL ₹3,950.14',
      rightSource: 'BUY VOL CONFIRMS',
    },
    2: {
      tabLabel: 'DEMA 20 RECLAIMED',
      tabBg: COLORS.bullish,
      tabColor: COLORS.ink,
      contextChip: 'DYNAMIC SUPPORT',
      headline: 'RALLY UP RECLAIMS 20 DEMA (₹4,241) · FLIPPED TO SUPPORT',
      rightSource: 'OI EXPANSION',
    },
    3: {
      tabLabel: '50 DEMA HURDLE',
      tabBg: COLORS.accent,
      tabColor: COLORS.ink,
      contextChip: 'INFLECTION THRESHOLD',
      headline: 'CMP ₹4,369 TESTS 50 DEMA (₹4,368.15) · BREAKOUT OR REJECTION',
      rightSource: 'KEY DECISION POINT',
    },
    4: {
      tabLabel: 'VAH EXPANSION',
      tabBg: '#22D3EE',
      tabColor: COLORS.ink,
      contextChip: 'PRIMARY TARGET',
      headline: 'CLEARING 50 DEMA UNLOCKS VALUE AREA HIGH ₹4,648.24',
      rightSource: 'TARGET ₹4,648',
    },
    5: {
      tabLabel: 'MACRO REVERSAL',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: '100 & 200 DEMA',
      headline: 'EXTENDED TARGETS: 100 DEMA ₹4,727 & 200 DEMA ₹5,155.80',
      rightSource: 'TREND REVERSAL',
    },
  }[phase];

  const watermarkWord = {
    0: 'UNIVERSAL LAW',
    1: 'ABSORPTION FLOOR',
    2: 'RECLAIMED SUPPORT',
    3: 'INFLECTION HURDLE',
    4: 'TARGET CORRIDOR',
    5: 'MACRO REVERSAL',
  }[phase];

  const borderRotateDeg = (frame * 3.5) % 360;

  // Chart y-coordinates as percentages of image height:
  // DEMA 200: 33.3% from top  -> bottom: 66.7%
  // DEMA 100: 53.3% from top  -> bottom: 46.7%
  // VAH:      56.9% from top  -> bottom: 43.1%
  // LIVE CMP: 69.2% from top  -> bottom: 30.8%
  // DEMA 50:  70.4% from top  -> bottom: 29.6%
  // DEMA 20:  76.7% from top  -> bottom: 23.3%
  // POC:      80.8% from top  -> bottom: 19.2%
  // VAL:      89.6% from top  -> bottom: 10.4%

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07090C',
        overflow: 'hidden',
        transform: `scale(${introZoomScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. BACKGROUND RADIAL GRADIENT & WATERMARK CLIMAX WORD */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 45%, rgba(20, 26, 36, 0.65) 0%, rgba(7, 9, 12, 0.98) 85%)',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '36%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-6deg)',
          fontFamily: FONTS.display,
          fontSize: 120,
          fontWeight: 900,
          color: 'rgba(244, 241, 232, 0.045)',
          letterSpacing: '0.12em',
          whiteSpace: 'nowrap',
          zIndex: 2,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {watermarkWord}
      </div>

      {/* 2. THE HERO CHART CONTAINER */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraScale}) translate(${cameraPanX}px, ${cameraPanY}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s linear',
          zIndex: 5,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 1040,
            height: 980,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1.5px solid rgba(244, 241, 232, 0.18)',
            boxShadow: '0 28px 72px rgba(0,0,0,0.92)',
            backgroundColor: '#0C0E12',
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
            }}
          />

          {/* =========================================================
              ISOLATED ACTIVE LEVEL OVERLAYS & LASER HIGHLIGHTS
              (Inactive lines completely hidden to eliminate visual clutter)
             ========================================================= */}

          {/* FOCUS VIGNETTE MASK (Dims background during focused beats) */}
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
              bottom: '40.5%',
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
                left: 14,
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
              bottom: '40.5%',
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
              BEAT 1: ONLY POC (₹4,136.30) & VAL (₹3,950.14) SHOWN
             ========================================================= */}
          {phase === 1 && (
            <>
              {/* POC Golden Beam with Left-to-Right Glowing Sweep */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '34.7%',
                  height: 4.5,
                  backgroundColor: '#F2CF1D',
                  boxShadow:
                    '0 0 16px #F2CF1D, 0 0 35px #F2CF1D, 0 0 70px rgba(242, 207, 29, 0.8)',
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
                    right: 14,
                    bottom: 8,
                    backgroundColor: 'rgba(242, 207, 29, 0.98)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                  }}
                >
                  ★ POC: ₹4,136.30 (1.10M VOLUME DEFENSE FLOOR)
                </div>
              </div>

              {/* Concentric Radar Pulse Ring at POC absorption cluster */}
              <div
                style={{
                  position: 'absolute',
                  left: '73.5%',
                  bottom: '34.7%',
                  transform: 'translate(-50%, 50%)',
                  width: 28 + ((frame - cue1) * 5) % 110,
                  height: 28 + ((frame - cue1) * 5) % 110,
                  borderRadius: '50%',
                  border: '2.5px solid rgba(242, 207, 29, 0.9)',
                  opacity: 1 - (((frame - cue1) * 5) % 110) / 110,
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
                  bottom: '30.3%',
                  height: 3.5,
                  backgroundColor: '#EF4444',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.8)',
                  zIndex: 24,
                  clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 7,
                    backgroundColor: 'rgba(239, 68, 68, 0.95)',
                    color: '#FFFFFF',
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  VAL: ₹3,950.14 [VALUE AREA SUPPORT FLOOR]
                </div>
              </div>

              {/* Connecting Distance Delta between CMP and POC */}
              <div
                style={{
                  position: 'absolute',
                  left: '52%',
                  bottom: '34.7%',
                  height: '5.8%', // from 34.7% to 40.5%
                  width: 2,
                  borderLeft: '2px dashed #F2CF1D',
                  zIndex: 22,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(9, 13, 20, 0.94)',
                    border: '1px solid #F2CF1D',
                    padding: '2px 6px',
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

              {/* Bottom Context Badge */}
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  bottom: '22%',
                  backgroundColor: 'rgba(9, 13, 20, 0.94)',
                  border: '1.5px solid #F2CF1D',
                  padding: '8px 16px',
                  borderRadius: 8,
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: '#F2CF1D', fontSize: 20, fontWeight: 900 }}>↘</span>
                <div>
                  <div style={{ color: '#F2CF1D', fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900 }}>
                    RALLY DOWN EXHAUSTION
                  </div>
                  <div style={{ color: '#F4F1E8', fontFamily: FONTS.ui, fontSize: 11 }}>
                    1.10M Buy Volume absorbs cascade at POC
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              BEAT 2: ONLY DEMA 20 (₹4,241.10) SHOWN
             ========================================================= */}
          {phase === 2 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '36.7%',
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
                    right: 14,
                    bottom: 8,
                    backgroundColor: 'rgba(16, 185, 129, 0.98)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
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
                  bottom: '36.7%',
                  height: '3.8%', // from 36.7% to 40.5%
                  width: 2,
                  borderLeft: '2px dashed #10B981',
                  zIndex: 22,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(9, 13, 20, 0.94)',
                    border: '1px solid #10B981',
                    padding: '2px 6px',
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

              {/* Bottom Context Badge */}
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  bottom: '22%',
                  backgroundColor: 'rgba(9, 13, 20, 0.94)',
                  border: '1.5px solid #10B981',
                  padding: '8px 16px',
                  borderRadius: 8,
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: '#10B981', fontSize: 20, fontWeight: 900 }}>↗</span>
                <div>
                  <div style={{ color: '#10B981', fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900 }}>
                    RALLY UP CONFIRMED
                  </div>
                  <div style={{ color: '#F4F1E8', fontFamily: FONTS.ui, fontSize: 11 }}>
                    Rising Buy Vol + OI push price above DEMA 20
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              BEAT 3: ONLY DEMA 50 (₹4,368.15) & CMP SHOWN
             ========================================================= */}
          {phase === 3 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '39.9%',
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
                    right: 14,
                    bottom: 8,
                    backgroundColor: 'rgba(242, 207, 29, 0.98)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
                  }}
                >
                  ⚔ DEMA 50: ₹4,368.15 [INFLECTION HURDLE]
                </div>
              </div>

              {/* Bottom Context Badge */}
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  bottom: '22%',
                  backgroundColor: 'rgba(9, 13, 20, 0.94)',
                  border: '1.5px solid #F2CF1D',
                  padding: '8px 16px',
                  borderRadius: 8,
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: '#F2CF1D', fontSize: 20, fontWeight: 900 }}>⚔</span>
                <div>
                  <div style={{ color: '#F2CF1D', fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900 }}>
                    50 DEMA INFLECTION HURDLE
                  </div>
                  <div style={{ color: '#F4F1E8', fontFamily: FONTS.ui, fontSize: 11 }}>
                    CMP ₹4,369 kissing hurdle · Breakout turns resistance to support
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              BEAT 4: ONLY VAH (₹4,648.24) SHOWN
             ========================================================= */}
          {phase === 4 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '46.6%',
                  height: 4.5,
                  backgroundColor: '#22D3EE',
                  boxShadow:
                    '0 0 16px #22D3EE, 0 0 35px #22D3EE, 0 0 70px rgba(34, 211, 238, 0.8)',
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
                    right: 14,
                    bottom: 8,
                    backgroundColor: 'rgba(34, 211, 238, 0.98)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
                  }}
                >
                  ↗ VAH: ₹4,648.24 [PRIMARY UPSIDE TARGET]
                </div>
              </div>

              {/* Connecting Distance Delta between CMP and VAH */}
              <div
                style={{
                  position: 'absolute',
                  left: '52%',
                  bottom: '40.5%',
                  height: '6.1%', // from 40.5% to 46.6%
                  width: 2,
                  borderLeft: '2px dashed #22D3EE',
                  zIndex: 22,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(9, 13, 20, 0.94)',
                    border: '1px solid #22D3EE',
                    padding: '2px 6px',
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

              {/* Bottom Context Badge */}
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  bottom: '22%',
                  backgroundColor: 'rgba(9, 13, 20, 0.94)',
                  border: '1.5px solid #22D3EE',
                  padding: '8px 16px',
                  borderRadius: 8,
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: '#22D3EE', fontSize: 20, fontWeight: 900 }}>🎯</span>
                <div>
                  <div style={{ color: '#22D3EE', fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900 }}>
                    EXPANSION TARGET: VAH
                  </div>
                  <div style={{ color: '#F4F1E8', fontFamily: FONTS.ui, fontSize: 11 }}>
                    Next overhead resistance corridor at ₹4,648.24
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              BEAT 5: ONLY DEMA 100 (₹4,727.45) & DEMA 200 (₹5,155.80) SHOWN
             ========================================================= */}
          {phase === 5 && (
            <>
              {/* DEMA 100 */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '48.4%',
                  height: 3.5,
                  backgroundColor: '#FB7185',
                  boxShadow: '0 0 14px rgba(251, 113, 133, 0.8)',
                  zIndex: 24,
                  clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 7,
                    backgroundColor: 'rgba(251, 113, 133, 0.95)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  DEMA 100: ₹4,727.45 [SECONDARY TARGET]
                </div>
              </div>

              {/* DEMA 200 */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '58.3%',
                  height: 4.5,
                  backgroundColor: '#EF4444',
                  boxShadow:
                    '0 0 16px #EF4444, 0 0 35px #EF4444, 0 0 70px rgba(239, 68, 68, 0.8)',
                  zIndex: 25,
                  clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.98)',
                    color: '#FFFFFF',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
                  }}
                >
                  DEMA 200: ₹5,155.80 [MACRO TREND REVERSAL TARGET]
                </div>
              </div>

              {/* Summary Playbook Card at Bottom */}
              <div
                style={{
                  position: 'absolute',
                  left: 20,
                  right: 20,
                  bottom: 24,
                  backgroundColor: 'rgba(9, 13, 20, 0.96)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(242, 207, 29, 0.6)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  zIndex: 25,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#F2CF1D',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  SUMMARY PLAYBOOK · CMP ₹4,369.00
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#10B981', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800 }}>
                      SUPPORTS (BELOW CMP)
                    </div>
                    <div style={{ color: '#F4F1E8', fontFamily: FONTS.ui, fontSize: 11 }}>
                      DEMA 20 (₹4,241) → POC (₹4,136) → VAL (₹3,950)
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#22D3EE', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800 }}>
                      TARGETS (ABOVE CMP)
                    </div>
                    <div style={{ color: '#F4F1E8', fontFamily: FONTS.ui, fontSize: 11 }}>
                      DEMA 50 (₹4,368) → VAH (₹4,648) → 100/200 DEMA
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    borderTop: '1px solid rgba(244, 241, 232, 0.12)',
                    paddingTop: 4,
                    color: '#F2CF1D',
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  CONFIRM DIRECTION WITH BUY/SELL VOLUME & OPEN INTEREST (OI)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. TOP TELEMETRY HEADER & LIVE BADGE */}
      {showHud && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 36,
            right: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: COLORS.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: 22,
                color: COLORS.ink,
                boxShadow: '0 0 16px rgba(242, 207, 29, 0.45)',
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
                  lineHeight: 1.1,
                }}
              >
                CUMMINS INDIA
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  color: 'rgba(244, 241, 232, 0.55)',
                  letterSpacing: '0.08em',
                }}
              >
                NSE · CUMMINSIND-EQ · 1D STUDY
              </div>
            </div>
          </div>

          {/* Live Quote Badge with rotating conic gradient rim */}
          <div
            style={{
              position: 'relative',
              padding: 2,
              borderRadius: 12,
              background: `conic-gradient(from ${borderRotateDeg}deg, #10B981, #22D3EE, #F2CF1D, #10B981)`,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(9, 13, 20, 0.95)',
                padding: '6px 14px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: COLORS.bullish,
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                ₹4,369.00
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.bullish,
                }}
              >
                +1.88%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Universal Law Sticky Pill (Top Center) */}
      {showHud && (
        <div
          style={{
            position: 'absolute',
            top: 122,
            left: 36,
            right: 36,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 31,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(9, 13, 20, 0.92)',
              border: '1.5px solid rgba(242, 207, 29, 0.55)',
              borderRadius: 20,
              padding: '6px 18px',
              fontFamily: FONTS.mono,
              fontSize: 12,
              fontWeight: 800,
              color: '#F2CF1D',
              letterSpacing: '0.06em',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
            }}
          >
            RULE: BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE
          </div>
        </div>
      )}

      {/* 4. REAL-TIME WORD-BY-WORD KINETIC KARAOKE CAPTIONS */}
      {showHud && (
        <KineticBroadcastCaptions
          chunks={manifest.body_chunks || manifest.chunks}
          frame={frame}
          fps={fps}
          vertical
          bottom={240}
        />
      )}

      {/* 5. BOTTOM TELEMETRY STRAP */}
      {showHud && strapConfig && (
        <LowerThirdStrap
          tabLabel={strapConfig.tabLabel}
          tabBg={strapConfig.tabBg}
          tabColor={strapConfig.tabColor}
          contextChip={strapConfig.contextChip}
          headline={strapConfig.headline}
          rightSource={strapConfig.rightSource}
          vertical
          bottom={112}
        />
      )}

      {/* 6. EDUCATIONAL COMPLIANCE WATERMARK BANNER */}
      {showHud && (
        <EducationalRibbon
          text="FOR TECHNICAL CHART STUDY ONLY · NOT SEBI REGISTERED FINANCIAL ADVICE"
          vertical
        />
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

      {/* 8. SLANTED END WIPE AT CLOSE */}
      {frame >= endWipe && (
        <SlantedEndWipe
          progress={clamp01((frame - endWipe) / 18)}
          vertical
        />
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   FULL MASTER COMPOSITION WITH DEMA INTRO AND OUTRO (3 Acts)
   ========================================================================= */
export const CumminsExplainerReel = () => {
  return (
    <Series>
      {/* 1. Master DEMA Branded Intro Sting (3.5s = 105 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_EXPLAINER_INTRO_FRAMES}>
        <DemaIntro brand={brand} />
      </Series.Sequence>

      {/* 2. Cummins India Support/Resistance Masterclass (113.37s = 3401 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_EXPLAINER_BODY_FRAMES}>
        <CumminsExplainerCore />
      </Series.Sequence>

      {/* 3. Master DEMA Outro End Card (5.0s = 150 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_EXPLAINER_OUTRO_FRAMES}>
        <DemaOutro brand={brand} showGuides={false} />
      </Series.Sequence>
    </Series>
  );
};

