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

let defaultManifest = {};
try {
  defaultManifest = require('../../public/data/cummins_explainer_manifest.json');
} catch (e) {}

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
} from '../AdaniSuite/SharedNewsPackage';
import { DemaIntro } from '../DemaIntroOutro/DemaIntro';
import { DemaOutro } from '../DemaIntroOutro/DemaOutro';
import brand from '../DemaIntroOutro/brand.json';

let coalindiaManifest = {};
try {
  coalindiaManifest = require('../../public/data/coalindia_explainer_manifest.json');
} catch (e) {}

let iiflcapsManifest = {};
try {
  iiflcapsManifest = require('../../public/data/iiflcaps_explainer_manifest.json');
} catch (e) {}

let bluestarcoManifest = {};
try {
  bluestarcoManifest = require('../../public/data/bluestarco_explainer_manifest.json');
} catch (e) {}

let abbManifest = {};
try {
  abbManifest = require('../../public/data/abb_explainer_manifest.json');
} catch (e) {}

let waareeManifest = {};
try {
  waareeManifest = require('../../public/data/waaree_explainer_manifest.json');
} catch (e) {}

const MANIFEST_MAP = {
  cummins: defaultManifest,
  cumminsind: defaultManifest,
  coalindia: coalindiaManifest,
  iiflcaps: iiflcapsManifest,
  bluestarco: bluestarcoManifest,
  abb: abbManifest,
  waaree: waareeManifest,
  waareeener: waareeManifest,
};

export const fmtPrice = (v, fallback = 1000) => {
  if (typeof v === 'number' && !isNaN(v)) return v.toFixed(2);
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^\d.]/g, ''));
    if (!isNaN(n)) return n.toFixed(2);
  }
  return Number(fallback).toFixed(2);
};

export const getStockManifest = (manifestPath, propManifest) => {
  if (propManifest && propManifest.symbol) return propManifest;
  if (!manifestPath) return defaultManifest;
  const cleanSym = String(manifestPath)
    .replace(/^data\//, '')
    .replace(/_explainer_manifest\.json$/, '')
    .toLowerCase();
  const m = MANIFEST_MAP[cleanSym];
  if (m && m.symbol) return m;
  return defaultManifest;
};

/* =========================================================================
   UNIVERSAL STOCK EXPLAINER REEL CORE (9:16 Vertical | 1080x1920 @ 30fps)
   Decluttered Laser Protocol + Sonar Radar CMP + 6-Phase Motion Tracking
   ========================================================================= */
export const StockExplainerCore = ({ manifest: propManifest, manifestPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const manifest = getStockManifest(manifestPath, propManifest);

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

  // Live Price (CMP) Sonar Radar Ping Animation (every 40 frames = 1.33s)
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

  const borderRotateDeg = (frame * 3.5) % 360;

  // Camera Motion (motion-doctrine)
  let cameraScale = 1.0;
  let cameraPanX = 0;
  let cameraPanY = 0;

  if (frame < cue1) {
    // Phase 0: Full chart overview
    const p0 = clamp01(frame / cue1);
    cameraScale = interpolate(p0, [0, 1], [1.02, 1.06]);
    cameraPanX = 0;
    cameraPanY = 0;
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
    // Phase 3: Lock on Inflection Hurdle & CMP with physical recoil
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
    // Phase 5: Pull back for macro reversal targets (100 & 200 DEMA)
    const p5 = clamp01((frame - cue5) / Math.max(1, endWipe - cue5));
    cameraScale = interpolate(p5, [0, 1], [1.25, 1.08]);
    cameraPanX = interpolate(p5, [0, 1], [20, 0]);
    cameraPanY = interpolate(p5, [0, 1], [45, 15]);
  }

  const strapConfig = manifest.strap_config?.[String(phase)] || {
    tabLabel: 'CORE TRADING LAW',
    tabBg: COLORS.gold,
    tabColor: COLORS.ink,
    contextChip: `NSE · ${manifest.symbol || 'STOCK'}`,
    headline: 'BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE',
    rightSource: `CMP ₹${manifest.cmp || 1000}`,
  };

  const watermarkWord = manifest.watermark_words?.[String(phase)] || {
    0: 'UNIVERSAL LAW',
    1: 'ABSORPTION FLOOR',
    2: 'RECLAIMED SUPPORT',
    3: 'INFLECTION HURDLE',
    4: 'TARGET CORRIDOR',
    5: 'MACRO REVERSAL',
  }[phase];

  const chartImg = manifest.chart_image || `charts/${manifest.symbol}_1D_chart.png`;
  const levels = manifest.levels || {
    cmp: manifest.cmp || 1000,
    poc: (manifest.cmp || 1000) * 0.95,
    val: (manifest.cmp || 1000) * 0.91,
    d20: (manifest.cmp || 1000) * 0.97,
    d50: (manifest.cmp || 1000) * 1.00,
    d100: (manifest.cmp || 1000) * 1.08,
    d200: (manifest.cmp || 1000) * 1.18,
    vah: (manifest.cmp || 1000) * 1.06,
  };

  // Adaptive Price-to-Position Mapper
  const allLevelVals = [levels.val, levels.poc, levels.d20, levels.cmp, levels.d50, levels.vah, levels.d100, levels.d200].filter(Boolean);
  const minPrice = Math.min(...allLevelVals) * 0.985;
  const maxPrice = Math.max(...allLevelVals) * 1.015;
  const priceToYPct = (price) => {
    if (maxPrice === minPrice) return 50;
    const norm = (price - minPrice) / (maxPrice - minPrice);
    // Invert because higher price is higher up (lower bottom percentage)
    return Math.max(16, Math.min(84, 18 + norm * 64));
  };

  const cmpBottom = priceToYPct(levels.cmp);
  const pocBottom = priceToYPct(levels.poc);
  const valBottom = priceToYPct(levels.val);
  const d20Bottom = priceToYPct(levels.d20);
  const d50Bottom = priceToYPct(levels.d50);
  const vahBottom = priceToYPct(levels.vah);
  const d100Bottom = priceToYPct(levels.d100);
  const d200Bottom = priceToYPct(levels.d200);

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
            src={staticFile(chartImg)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center center',
            }}
          />

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
              LIVE PRICE (CMP) PERMANENT HIGHLIGHT & SONAR RADAR PING
             ========================================================= */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${cmpBottom}%`,
              height: 2.5,
              backgroundColor: '#10B981',
              boxShadow: '0 0 12px #10B981, 0 0 24px rgba(16, 185, 129, 0.5)',
              zIndex: 20,
            }}
          >
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
              ● LIVE CMP: ₹{fmtPrice(levels.cmp)}
            </div>
          </div>

          {/* Live Price Expanding Sonar Pulse */}
          <div
            style={{
              position: 'absolute',
              left: '73.5%',
              bottom: `${cmpBottom}%`,
              transform: 'translate(-50%, 50%)',
              pointerEvents: 'none',
              zIndex: 22,
            }}
          >
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
          </div>

          {/* =========================================================
              PHASE 1: VAL & POC ACCUMULATION FLOOR
             ========================================================= */}
          {phase === 1 && (
            <>
              {/* POC Laser Line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${pocBottom}%`,
                  height: 4.5,
                  backgroundColor: '#F2CF1D',
                  boxShadow: '0 0 16px #F2CF1D, 0 0 35px #F2CF1D, 0 0 70px rgba(242, 207, 29, 0.8)',
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
                    boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                  }}
                >
                  ★ POC: ₹{fmtPrice(levels.poc)} [INSTITUTIONAL ACCUMULATION FLOOR]
                </div>
              </div>

              {/* VAL Floor Line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${valBottom}%`,
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
                  VAL: ₹{fmtPrice(levels.val)} [VALUE AREA LOW]
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              PHASE 2: 20 DEMA RECLAIMED DYNAMIC SUPPORT
             ========================================================= */}
          {phase === 2 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${d20Bottom}%`,
                height: 4.5,
                backgroundColor: '#10B981',
                boxShadow: '0 0 16px #10B981, 0 0 32px #10B981, 0 0 70px rgba(16, 185, 129, 0.8)',
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
                ✔ DEMA 20: ₹{fmtPrice(levels.d20)} [RECLAIMED DYNAMIC SUPPORT]
              </div>
            </div>
          )}

          {/* =========================================================
              PHASE 3: INFLECTION HURDLE (50 DEMA)
             ========================================================= */}
          {phase === 3 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${d50Bottom}%`,
                height: 4.5,
                backgroundColor: '#00E5FF',
                boxShadow: '0 0 16px #00E5FF, 0 0 35px #00E5FF, 0 0 70px rgba(0, 229, 255, 0.85)',
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
                    boxShadow: '0 0 20px #FFFFFF, 0 0 35px #00E5FF',
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  right: 14,
                  bottom: 8,
                  backgroundColor: 'rgba(0, 229, 255, 0.98)',
                  color: '#121417',
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 5,
                }}
              >
                ⚡ 50 DEMA: ₹{fmtPrice(levels.d50)} [CRITICAL INFLECTION HURDLE]
              </div>
            </div>
          )}

          {/* =========================================================
              PHASE 4: VALUE AREA HIGH (VAH) TARGET CORRIDOR
             ========================================================= */}
          {phase === 4 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${vahBottom}%`,
                height: 4.5,
                backgroundColor: '#22D3EE',
                boxShadow: '0 0 16px #22D3EE, 0 0 35px #22D3EE, 0 0 70px rgba(34, 211, 238, 0.85)',
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
                🎯 VAH: ₹{fmtPrice(levels.vah)} [PRIMARY EXPANSION TARGET]
              </div>
            </div>
          )}

          {/* =========================================================
              PHASE 5: MACRO REVERSAL (100 & 200 DEMA)
             ========================================================= */}
          {phase === 5 && (
            <>
              {/* 100 DEMA */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${d100Bottom}%`,
                  height: 3.5,
                  backgroundColor: '#FFB800',
                  boxShadow: '0 0 14px rgba(255, 184, 0, 0.8)',
                  zIndex: 24,
                  clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 7,
                    backgroundColor: 'rgba(255, 184, 0, 0.95)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  100 DEMA: ₹{fmtPrice(levels.d100)} [INTERMEDIATE TARGET]
                </div>
              </div>

              {/* 200 DEMA */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${d200Bottom}%`,
                  height: 4.5,
                  backgroundColor: '#FF3366',
                  boxShadow: '0 0 18px #FF3366, 0 0 38px #FF3366, 0 0 70px rgba(255, 51, 102, 0.85)',
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
                      boxShadow: '0 0 20px #FFFFFF, 0 0 35px #FF3366',
                    }}
                  />
                )}
                <div
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 8,
                    backgroundColor: 'rgba(255, 51, 102, 0.98)',
                    color: '#FFFFFF',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
                  }}
                >
                  🚀 200 DEMA: ₹{fmtPrice(levels.d200)} [TREND REVERSAL GATEWAY]
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
                {manifest.name || manifest.symbol}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  color: 'rgba(244, 241, 232, 0.55)',
                  letterSpacing: '0.08em',
                }}
              >
                NSE · {manifest.symbol}-EQ · 1D STUDY
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
                ₹{fmtPrice(levels.cmp)}
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

      {/* 7. FLASH CUT RESET */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
            zIndex: 50,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 8. SLANTED TRANSITION WIPE AT END */}
      {frame >= endWipe && (
        <SlantedEndWipe
          frame={frame}
          startFrame={endWipe}
          duration={18}
        />
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   3-ACT EXPLAINER WRAPPER: DEMA INTRO (3.5s) + BODY + DEMA OUTRO (5.0s)
   ========================================================================= */
export const StockExplainerReel = (props) => {
  const manifest = getStockManifest(props.manifestPath, props.manifest);

  const introFrames = manifest.intro_frames || 105;
  const bodyFrames = manifest.body_frames || 3401;
  const outroFrames = manifest.outro_frames || 150;

  return (
    <Series>
      {/* ACT 1: DEMA INTRO STING */}
      <Series.Sequence durationInFrames={introFrames}>
        <DemaIntro />
      </Series.Sequence>

      {/* ACT 2: TECHNICAL EXPLAINER CORE */}
      <Series.Sequence durationInFrames={bodyFrames}>
        <StockExplainerCore manifest={manifest} />
      </Series.Sequence>

      {/* ACT 3: DEMA RESPONSIVE OUTRO */}
      <Series.Sequence durationInFrames={outroFrames}>
        <DemaOutro />
      </Series.Sequence>
    </Series>
  );
};
