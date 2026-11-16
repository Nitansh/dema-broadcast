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

let defaultManifest = {};
try {
  defaultManifest = require('../../public/data/cummins_explainer_manifest.json');
} catch (e) {}

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

export const fmtPrice = (v, fallback = 1000) => {
  if (typeof v === 'number' && !isNaN(v)) return v.toFixed(2);
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^\d.]/g, ''));
    if (!isNaN(n)) return n.toFixed(2);
  }
  return Number(fallback).toFixed(2);
};

export const parseNum = (v, fallback = 1000) => {
  if (typeof v === 'number' && !isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^\d.]/g, ''));
    if (!isNaN(n)) return n;
  }
  return fallback;
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
   UNIVERSAL 16:9 WIDESCREEN YOUTUBE EXPLAINER CORE (1920x1080 @ 30fps)
   Decluttered Single-Level Laser Protocol + Institutional Telemetry Sidebar
   Exact Cummins India Master Benchmark Standard
   ========================================================================= */
export const StockYouTubeExplainerCore = ({ manifest: propManifest, manifestPath }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

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

  // Ping pulse cycles
  const pingCycle = 40;
  const pingProgress = ((frame % pingCycle) / pingCycle);
  const pingScale = interpolate(pingProgress, [0, 1], [0.8, 3.6]);
  const pingOpacity = interpolate(pingProgress, [0, 0.25, 1], [0.95, 0.75, 0]);

  // Flash cut opacity at phase transitions
  const flashTimes = [0, cue1, cue2, cue3, cue4, cue5];
  let flashOpacity = 0;
  for (const ft of flashTimes) {
    if (frame >= ft && frame <= ft + 5) {
      flashOpacity = Math.max(flashOpacity, interpolate(frame - ft, [0, 5], [0.55, 0]));
    }
  }

  const borderRotateDeg = (frame * 3.5) % 360;

  // Camera Motion (Targeted Deep Zoom directly on the active level being discussed)
  let cameraScale = 1.0;
  let cameraPanX = 0;
  let cameraPanY = 0;

  if (phase === 0) {
    const p0 = clamp01(frame / cue1);
    cameraScale = interpolate(p0, [0, 1], [1.0, 1.03]);
    cameraPanX = 0;
    cameraPanY = 0;
  } else if (phase === 1) {
    const p1 = clamp01((frame - cue1) / 24);
    cameraScale = interpolate(p1, [0, 1], [1.03, 1.28]);
    cameraPanX = interpolate(p1, [0, 1], [0, -20]);
    cameraPanY = interpolate(p1, [0, 1], [0, -45]);
  } else if (phase === 2) {
    const p2 = clamp01((frame - cue2) / 24);
    cameraScale = interpolate(p2, [0, 1], [1.28, 1.22]);
    cameraPanX = interpolate(p2, [0, 1], [-20, 15]);
    cameraPanY = interpolate(p2, [0, 1], [-45, -15]);
  } else if (phase === 3) {
    const p3 = clamp01((frame - cue3) / 24);
    const recoil = Math.sin(clamp01((frame - cue3) / 22) * Math.PI) * 12;
    cameraScale = interpolate(p3, [0, 1], [1.22, 1.30]);
    cameraPanX = interpolate(p3, [0, 1], [15, 30]);
    cameraPanY = interpolate(p3, [0, 1], [-15 + recoil, 10]);
  } else if (phase === 4) {
    const p4 = clamp01((frame - cue4) / 24);
    cameraScale = interpolate(p4, [0, 1], [1.30, 1.24]);
    cameraPanX = interpolate(p4, [0, 1], [30, 20]);
    cameraPanY = interpolate(p4, [0, 1], [10, 30]);
  } else {
    const p5 = clamp01((frame - cue5) / Math.max(1, endWipe - cue5));
    cameraScale = interpolate(p5, [0, 1], [1.24, 1.06]);
    cameraPanX = interpolate(p5, [0, 1], [20, 0]);
    cameraPanY = interpolate(p5, [0, 1], [30, 10]);
  }

  const strapConfig = manifest.strap_config?.[String(phase)] || {
    tabLabel: 'CORE TRADING LAW',
    tabBg: COLORS.gold,
    tabColor: COLORS.ink,
    contextChip: `NSE · ${manifest.symbol || 'STOCK'}`,
    headline: 'BELOW CMP = SUPPORT | ABOVE CMP = TARGET & RESISTANCE',
    rightSource: `CMP ₹${fmtPrice(manifest.cmp || 1000)}`,
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
    poc: parseNum(manifest.cmp, 1000) * 0.95,
    val: parseNum(manifest.cmp, 1000) * 0.91,
    d20: parseNum(manifest.cmp, 1000) * 0.97,
    d50: parseNum(manifest.cmp, 1000) * 1.00,
    d100: parseNum(manifest.cmp, 1000) * 1.08,
    d200: parseNum(manifest.cmp, 1000) * 1.18,
    vah: parseNum(manifest.cmp, 1000) * 1.06,
  };

  // Adaptive Price-to-Position Mapper
  const allLevelVals = [levels.val, levels.poc, levels.d20, levels.cmp, levels.d50, levels.vah, levels.d100, levels.d200]
    .map((v) => parseNum(v))
    .filter(Boolean);
  const minPrice = Math.min(...allLevelVals) * 0.985;
  const maxPrice = Math.max(...allLevelVals) * 1.015;
  const priceToYPct = (price) => {
    const p = parseNum(price);
    if (maxPrice === minPrice) return 50;
    const norm = (p - minPrice) / (maxPrice - minPrice);
    return Math.max(14, Math.min(86, 16 + norm * 68));
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
          background: 'radial-gradient(circle at 45% 45%, rgba(22, 28, 40, 0.70) 0%, rgba(8, 10, 14, 0.98) 85%)',
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
                {manifest.name || manifest.symbol}
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
                  NSE · {manifest.symbol}
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
                  ₹{fmtPrice(levels.cmp)}
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: COLORS.accent }}>
                  ACT {phase + 1} / 6
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
              src={staticFile(chartImg)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                opacity: phase === 0 ? 1.0 : 0.88,
              }}
            />

            {/* FOCUS VIGNETTE MASK */}
            {phase > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(5, 7, 10, 0.20)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            )}

            {/* LIVE CMP CONTINUOUS ANCHOR LINE & SONAR RADAR */}
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

            {/* PHASE 1: POC & VAL ACCUMULATION FLOOR */}
            {phase === 1 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${pocBottom}%`,
                    height: 4.5,
                    backgroundColor: '#F2CF1D',
                    boxShadow: '0 0 16px #F2CF1D, 0 0 35px #F2CF1D, 0 0 80px rgba(242, 207, 29, 0.8)',
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
                    ★ POC: ₹{fmtPrice(levels.poc)} [INSTITUTIONAL ACCUMULATION FLOOR]
                  </div>
                </div>

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
                    VAL: ₹{fmtPrice(levels.val)} [VALUE AREA LOW]
                  </div>
                </div>
              </>
            )}

            {/* PHASE 2: 20 DEMA RECLAIMED SUPPORT */}
            {phase === 2 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${d20Bottom}%`,
                  height: 4.5,
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 16px #10B981, 0 0 35px #10B981, 0 0 80px rgba(16, 185, 129, 0.8)',
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
                  ✔ DEMA 20: ₹{fmtPrice(levels.d20)} [RECLAIMED DYNAMIC SUPPORT]
                </div>
              </div>
            )}

            {/* PHASE 3: 50 DEMA INFLECTION HURDLE */}
            {phase === 3 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${d50Bottom}%`,
                  height: 4.5,
                  backgroundColor: '#00E5FF',
                  boxShadow: '0 0 16px #00E5FF, 0 0 35px #00E5FF, 0 0 80px rgba(0, 229, 255, 0.8)',
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
                    right: 20,
                    bottom: 8,
                    backgroundColor: 'rgba(0, 229, 255, 0.98)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    fontWeight: 900,
                    padding: '4px 12px',
                    borderRadius: 6,
                  }}
                >
                  ⚔ DEMA 50: ₹{fmtPrice(levels.d50)} [CRITICAL INFLECTION HURDLE]
                </div>
              </div>
            )}

            {/* PHASE 4: VAH TARGET CORRIDOR */}
            {phase === 4 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${vahBottom}%`,
                  height: 4.5,
                  backgroundColor: '#22D3EE',
                  boxShadow: '0 0 16px #22D3EE, 0 0 35px #22D3EE, 0 0 80px rgba(34, 211, 238, 0.8)',
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
                  ↗ VAH: ₹{fmtPrice(levels.vah)} [PRIMARY EXPANSION TARGET]
                </div>
              </div>
            )}

            {/* PHASE 5: 100 & 200 DEMA MACRO REVERSAL */}
            {phase === 5 && (
              <>
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
                      right: 20,
                      bottom: 7,
                      backgroundColor: 'rgba(255, 184, 0, 0.95)',
                      color: '#121417',
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '3px 10px',
                      borderRadius: 5,
                    }}
                  >
                    100 DEMA: ₹{fmtPrice(levels.d100)} [INTERMEDIATE TARGET]
                  </div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${d200Bottom}%`,
                    height: 4.5,
                    backgroundColor: '#FF3366',
                    boxShadow: '0 0 18px #FF3366, 0 0 38px #FF3366, 0 0 80px rgba(255, 51, 102, 0.8)',
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
                      right: 20,
                      bottom: 8,
                      backgroundColor: 'rgba(255, 51, 102, 0.98)',
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    🚀 200 DEMA: ₹{fmtPrice(levels.d200)} [TREND REVERSAL GATEWAY]
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
                  ₹{fmtPrice(levels.d200)}
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
                  ₹{fmtPrice(levels.d100)}
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
                  ₹{fmtPrice(levels.vah)}
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
                  ₹{fmtPrice(levels.d50)}
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
                ₹{fmtPrice(levels.cmp)}
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
                  ₹{fmtPrice(levels.d20)}
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
                  ★ POC (Point of Control)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#F2CF1D' }}>
                  ₹{fmtPrice(levels.poc)}
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
                  ₹{fmtPrice(levels.val)}
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
                Volume Absorption:
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

      {/* 4. WIDESCREEN KINETIC KARAOKE CAPTIONS */}
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
   16:9 3-ACT EXPLAINER WRAPPER: DEMA INTRO (3.5s) + BODY + DEMA OUTRO (5.0s)
   ========================================================================= */
export const StockYouTubeExplainer16x9 = (props) => {
  const manifest = getStockManifest(props.manifestPath, props.manifest);

  const introFrames = manifest.intro_frames || 105;
  const bodyFrames = manifest.body_frames || 3401;
  const outroFrames = manifest.outro_frames || 150;

  return (
    <Series>
      <Series.Sequence durationInFrames={introFrames}>
        <DemaIntro brand={brand} />
      </Series.Sequence>

      <Series.Sequence durationInFrames={bodyFrames}>
        <StockYouTubeExplainerCore manifest={manifest} />
      </Series.Sequence>

      <Series.Sequence durationInFrames={outroFrames}>
        <DemaOutro brand={brand} showGuides={false} />
      </Series.Sequence>
    </Series>
  );
};
