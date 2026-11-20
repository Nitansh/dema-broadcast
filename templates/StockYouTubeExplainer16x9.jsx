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

let itcManifest = {};
try {
  itcManifest = require('../../public/data/itc_explainer_manifest.json');
} catch (e) {}

let adanientManifest = {};
try {
  adanientManifest = require('../../public/data/adanient_explainer_manifest.json');
} catch (e) {}

let cochinshipManifest = {};
try {
  cochinshipManifest = require('../../public/data/cochinship_explainer_manifest.json');
} catch (e) {}

let goldbeesManifest = {};
try {
  goldbeesManifest = require('../../public/data/goldbees_explainer_manifest.json');
} catch (e) {}

let bharatforgManifest = {};
try {
  bharatforgManifest = require('../../public/data/bharatforg_explainer_manifest.json');
} catch (e) {}

let nhpcManifest = {};
try {
  nhpcManifest = require('../../public/data/nhpc_explainer_manifest.json');
} catch (e) {}

let titanManifest = {};
try {
  titanManifest = require('../../public/data/titan_explainer_manifest.json');
} catch (e) {}

let hindunilvrManifest = {};
try {
  hindunilvrManifest = require('../../public/data/hindunilvr_explainer_manifest.json');
} catch (e) {}

let marutiManifest = {};
try {
  marutiManifest = require('../../public/data/maruti_explainer_manifest.json');
} catch (e) {}

let lenskartManifest = {};
try {
  lenskartManifest = require('../../public/data/lenskart_explainer_manifest.json');
} catch (e) {}

let geshipManifest = {};
try {
  geshipManifest = require('../../public/data/geship_explainer_manifest.json');
} catch (e) {}

let liciManifest = {};
try {
  liciManifest = require('../../public/data/lici_explainer_manifest.json');
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
  itc: itcManifest,
  adanient: adanientManifest,
  cochinship: cochinshipManifest,
  goldbees: goldbeesManifest,
  bharatforg: bharatforgManifest,
  bharatforge: bharatforgManifest,
  nhpc: nhpcManifest,
  titan: titanManifest,
  hindunilvr: hindunilvrManifest,
  hul: hindunilvrManifest,
  maruti: marutiManifest,
  marutisuzuki: marutiManifest,
  lenskart: lenskartManifest,
  lenskartsolutions: lenskartManifest,
  geship: geshipManifest,
  greateastern: geshipManifest,
  lici: liciManifest,
  lic: liciManifest,
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

  const cues = manifest.cue_frames || manifest.body_cue_frames || [120, 691, 1359, 1842, 2335, 2803];
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
    cmp: parseNum(manifest.cmp, 1000),
    poc: parseNum(manifest.cmp, 1000) * 0.95,
    val: parseNum(manifest.cmp, 1000) * 0.91,
    d20: parseNum(manifest.cmp, 1000) * 0.97,
    d50: parseNum(manifest.cmp, 1000) * 1.00,
    d100: parseNum(manifest.cmp, 1000) * 1.08,
    d200: parseNum(manifest.cmp, 1000) * 1.18,
    vah: parseNum(manifest.cmp, 1000) * 1.06,
    target1: parseNum(manifest.cmp, 1000) * 1.01,
    target2: parseNum(manifest.cmp, 1000) * 1.03,
  };

  // Adaptive Price-to-Position Mapper
  const allLevelVals = [levels.val, levels.poc, levels.d20, levels.cmp, levels.d50, levels.vah, levels.d100, levels.d200, levels.target1, levels.target2]
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

  const customBottom = manifest.levels_bottom_pct_16x9 || manifest.levels_bottom_pct || {};
  const cmpBottom = customBottom.cmp ?? priceToYPct(levels.cmp);
  const pocBottom = customBottom.poc ?? priceToYPct(levels.poc);
  const valBottom = customBottom.val ?? priceToYPct(levels.val);
  const d20Bottom = customBottom.d20 ?? priceToYPct(levels.d20);
  const d50Bottom = customBottom.d50 ?? priceToYPct(levels.d50);
  const vahBottom = customBottom.vah ?? customBottom.buy ?? priceToYPct(levels.vah);
  const d100Bottom = customBottom.d100 ?? priceToYPct(levels.d100);
  const d200Bottom = customBottom.d200 ?? priceToYPct(levels.d200);
  const target1Bottom = customBottom.target1 ?? priceToYPct(levels.target1 || 414.0);
  const target2Bottom = customBottom.target2 ?? priceToYPct(levels.target2 || 422.5);

  // Active Technical Level & Directional Geometry across every spoken frame
  let activeLevel = null;
  let isVolumeActive = false;

  if (phase === 0) {
    if (frame < 360) {
      activeLevel = {
        key: 'cmp',
        name: 'LIVE CMP',
        label: 'LIVE CMP',
        price: parseNum(levels.cmp),
        bottom: cmpBottom,
        color: '#10B981',
        context: 'CURRENT MARKET PIVOT',
      };
    } else if (frame < 520) {
      activeLevel = {
        key: 'poc',
        name: 'POC',
        label: 'POC (SUPPORT)',
        price: parseNum(levels.poc),
        bottom: pocBottom,
        color: '#F2CF1D',
        context: 'DYNAMIC SUPPORT (BELOW LIVE)',
      };
    } else {
      activeLevel = {
        key: 'target1',
        name: 'TARGET 1',
        label: 'TARGET 1 (RESISTANCE)',
        price: parseNum(levels.target1 || 414.0),
        bottom: target1Bottom,
        color: '#10B981',
        context: 'UPSIDE RESISTANCE (ABOVE LIVE)',
      };
    }
  } else if (phase === 1) {
    if (frame < 910) {
      activeLevel = {
        key: 'poc',
        name: 'POC',
        label: 'POC',
        price: parseNum(levels.poc),
        bottom: pocBottom,
        color: '#F2CF1D',
        context: 'MONTHLY POINT OF CONTROL',
      };
    } else if (frame < 1110) {
      activeLevel = {
        key: 'val',
        name: 'VAL',
        label: 'VAL (VALUE AREA LOW)',
        price: parseNum(levels.val),
        bottom: valBottom,
        color: '#EF4444',
        context: 'VALUE AREA LOW ACCUMULATION FLOOR',
      };
    } else {
      isVolumeActive = true;
      activeLevel = {
        key: 'val_volume',
        name: 'VOLUME DEMAND',
        label: '16.01M VOL DEMAND',
        price: parseNum(levels.poc),
        bottom: pocBottom,
        color: '#F2CF1D',
        context: '16.01M INSTITUTIONAL ACCUMULATION CLUSTER',
      };
    }
  } else if (phase === 2) {
    activeLevel = {
      key: 'd20',
      name: '20 DEMA',
      label: '20 DEMA',
      price: parseNum(levels.d20),
      bottom: d20Bottom,
      color: '#10B981',
      context: 'RECLAIMED DYNAMIC SUPPORT',
    };
  } else if (phase === 3) {
    activeLevel = {
      key: 'vah',
      name: 'VAH',
      label: 'VAH',
      price: parseNum(levels.vah),
      bottom: vahBottom,
      color: '#00E5FF',
      context: 'MONTHLY VAH BREAKOUT LEVEL',
    };
  } else if (phase === 4) {
    if (frame < 2570) {
      activeLevel = {
        key: 'target1',
        name: 'TARGET 1',
        label: 'TARGET 1 (SESSION HIGH)',
        price: parseNum(levels.target1 || 414.0),
        bottom: target1Bottom,
        color: '#10B981',
        context: 'SESSION HIGH BREAKOUT TARGET',
      };
    } else {
      activeLevel = {
        key: 'target2',
        name: 'TARGET 2',
        label: 'TARGET 2 (CORRIDOR)',
        price: parseNum(levels.target2 || 422.5),
        bottom: target2Bottom,
        color: '#22D3EE',
        context: 'EXPANSION CORRIDOR (₹420-₹425)',
      };
    }
  } else if (phase === 5) {
    if (frame < 3040) {
      activeLevel = {
        key: 'd50',
        name: '50 DEMA',
        label: '50 DEMA',
        price: parseNum(levels.d50),
        bottom: d50Bottom,
        color: '#00E5FF',
        context: '50-DAY EXPONENTIAL AVERAGE',
      };
    } else if (frame < 3280) {
      activeLevel = {
        key: 'd100',
        name: '100 DEMA',
        label: '100 DEMA',
        price: parseNum(levels.d100),
        bottom: d100Bottom,
        color: '#FFB800',
        context: '100-DAY EXPONENTIAL AVERAGE',
      };
    } else if (frame < 3520) {
      activeLevel = {
        key: 'd200',
        name: '200 DEMA',
        label: '200 DEMA',
        price: parseNum(levels.d200),
        bottom: d200Bottom,
        color: '#FF3366',
        context: '200-DAY MACRO MOVING AVERAGE',
      };
    } else {
      activeLevel = {
        key: 'trailing_d20',
        name: 'TRAILING STOP',
        label: 'TRAILING STOP (20 DEMA)',
        price: parseNum(levels.d20),
        bottom: d20Bottom,
        color: '#10B981',
        context: 'BULLISH TRAILING STOP ANCHOR',
      };
    }
  }

  const livePriceVal = parseNum(levels.cmp);
  const isLevelBelow = activeLevel ? activeLevel.price < livePriceVal : true;
  const levelDiff = activeLevel ? Math.abs(livePriceVal - activeLevel.price) : 0;
  const levelPct = activeLevel && livePriceVal > 0 ? (levelDiff / livePriceVal) * 100 : 0;
  const arrowColor = isLevelBelow ? '#FE6B3D' : '#10B981';

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

            {/* LIVE CMP CONTINUOUS ANCHOR LINE */}
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

            {/* LIVE PRICE EXPANDING SONAR PULSE & PRICE DISPLAY (AT CANDLE TIP X=50.5%) */}
            <div
              style={{
                position: 'absolute',
                left: '50.5%',
                bottom: `${cmpBottom}%`,
                transform: 'translate(-50%, 50%)',
                pointerEvents: 'none',
                zIndex: 32,
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

            {/* PRICE SHOWN NEAR BEEPING SONAR AT CANDLE TIP */}
            <div
              style={{
                position: 'absolute',
                left: '50.5%',
                bottom: `${cmpBottom}%`,
                transform: 'translate(-50%, -100%) translateY(-14px)',
                backgroundColor: 'rgba(18, 20, 23, 0.96)',
                border: '2px solid #10B981',
                borderRadius: 7,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 6px 18px rgba(0,0,0,0.85), 0 0 14px rgba(16, 185, 129, 0.5)',
                zIndex: 35,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                }}
              >
                ₹{fmtPrice(levels.cmp)}
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                LIVE
              </span>
            </div>

            {/* ACTIVE TALKING LEVEL: RADAR BEEPING SONAR, PRICE OVER IT & DIRECTIONAL ARROW FROM LIVE PRICE */}
            {activeLevel && activeLevel.key !== 'cmp' && (() => {
              const Y_live = 600 * (1 - cmpBottom / 100);
              const Y_level = 600 * (1 - activeLevel.bottom / 100);
              const x1 = 505; // Starts at Live Candle Tip
              const y1 = Y_live;
              const dy = Y_level - Y_live;
              const absDy = Math.abs(dy);

              // Target level sonar dynamically positioned in right open chart canvas (clean spacing >= 710)
              const x2 = Math.min(830, Math.max(710, 505 + Math.max(160, absDy * 1.10)));
              const y2 = Y_level;

              // Position delta badge at 40% along the arrow vector to guarantee zero collision
              const X_delta = x1 + (x2 - x1) * 0.40;
              const Y_delta = y1 + (y2 - y1) * 0.40;

              return (
                <>
                  {/* 1. ACTIVE LEVEL RADAR BEEPING SONAR AT (x2, y2) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(x2 / 1000) * 100}%`,
                      bottom: `${activeLevel.bottom}%`,
                      transform: 'translate(-50%, 50%)',
                      pointerEvents: 'none',
                      zIndex: 34,
                    }}
                  >
                    {/* Radar Ripple Ring 1 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: `2.5px solid ${activeLevel.color}`,
                        transform: `translate(-50%, -50%) scale(${pingScale})`,
                        opacity: pingOpacity,
                        boxShadow: `0 0 16px ${activeLevel.color}`,
                      }}
                    />
                    {/* Radar Ripple Ring 2 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `1.5px solid ${activeLevel.color}`,
                        transform: `translate(-50%, -50%) scale(${pingScale * 0.6})`,
                        opacity: pingOpacity * 0.8,
                      }}
                    />
                    {/* Center Core Radar Ping */}
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
                        boxShadow: `0 0 10px #FFFFFF, 0 0 20px ${activeLevel.color}`,
                      }}
                    />
                  </div>

                  {/* 2. PRICE BADGE DIRECTLY OVER ACTIVE LEVEL RADAR BEEPING */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(x2 / 1000) * 100}%`,
                      bottom: `${activeLevel.bottom}%`,
                      transform: 'translate(-50%, -100%) translateY(-18px)',
                      backgroundColor: 'rgba(18, 20, 23, 0.96)',
                      border: `2px solid ${activeLevel.color}`,
                      borderRadius: 8,
                      padding: '4px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: `0 6px 20px rgba(0,0,0,0.85), 0 0 16px ${activeLevel.color}66`,
                      whiteSpace: 'nowrap',
                      zIndex: 36,
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 11,
                        fontWeight: 900,
                        color: activeLevel.color,
                        letterSpacing: 0.5,
                      }}
                    >
                      ◈ {activeLevel.label}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 14,
                        fontWeight: 900,
                        color: '#FFFFFF',
                        letterSpacing: 0.5,
                      }}
                    >
                      ₹{fmtPrice(activeLevel.price)}
                    </span>
                  </div>

                  {/* 3. SVG DIRECTIONAL ARROW: DEFINED STRICTLY FROM LIVE PRICE */}
                  <svg
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 33,
                    }}
                    viewBox="0 0 1000 600"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <marker
                        id="arrow-green-point"
                        viewBox="0 0 14 14"
                        refX="12"
                        refY="7"
                        markerWidth="10"
                        markerHeight="10"
                        orient="auto"
                      >
                        <path d="M 1 2 L 13 7 L 1 12 Z" fill="#10B981" />
                      </marker>
                      <marker
                        id="arrow-red-point"
                        viewBox="0 0 14 14"
                        refX="12"
                        refY="7"
                        markerWidth="10"
                        markerHeight="10"
                        orient="auto"
                      >
                        <path d="M 1 2 L 13 7 L 1 12 Z" fill="#FE6B3D" />
                      </marker>
                    </defs>

                    {/* Level Guide Trace across right open area */}
                    <line
                      x1={480}
                      y1={y2}
                      x2={960}
                      y2={y2}
                      stroke={activeLevel.color}
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                      strokeOpacity="0.45"
                    />

                    {/* Directional Arrow: Starts at Live Price (x1, y1) -> points to target (x2, y2) */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={arrowColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      markerEnd={isLevelBelow ? 'url(#arrow-red-point)' : 'url(#arrow-green-point)'}
                      style={{
                        filter: `drop-shadow(0 0 8px ${arrowColor})`,
                      }}
                    />
                  </svg>

                  {/* 4. DELTA PILL BADGE ALONG ARROW (DOWN FOR RED / UP FOR GREEN) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(X_delta / 1000) * 100}%`,
                      top: `${(Y_delta / 600) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(18, 20, 23, 0.96)',
                      border: `1.5px solid ${arrowColor}`,
                      borderRadius: 6,
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: `0 4px 16px rgba(0,0,0,0.85), 0 0 12px ${isLevelBelow ? 'rgba(254,107,61,0.45)' : 'rgba(16,185,129,0.45)'}`,
                      zIndex: 35,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 900, color: arrowColor }}>
                      {isLevelBelow ? '↘ DOWN' : '↗ UP'}
                    </span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 900, color: '#FFFFFF' }}>
                      {isLevelBelow ? `-₹${fmtPrice(levelDiff)}` : `+₹${fmtPrice(levelDiff)}`} ({levelPct.toFixed(2)}%)
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 10,
                        fontWeight: 800,
                        color: arrowColor,
                        backgroundColor: isLevelBelow ? 'rgba(254,107,61,0.18)' : 'rgba(16,185,129,0.18)',
                        padding: '2px 5px',
                        borderRadius: 4,
                      }}
                    >
                      {isLevelBelow ? 'BELOW LIVE' : 'ABOVE LIVE'}
                    </span>
                  </div>
                </>
              );
            })()}

            {/* =========================================================
               INTERACTIVE VOLUME PROFILE SCANNER & HIGHLIGHT OVERLAY
               ========================================================= */}
            {(isVolumeActive || (phase === 1 && frame >= 1100)) && (
              <>
                {/* 1. Neon Glowing Bounding Box over Horizontal Volume Profile */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: `${Math.min(valBottom, pocBottom) - 4}%`,
                    width: '24%',
                    height: `${Math.abs(vahBottom - valBottom) + 8}%`,
                    border: '2px solid #F2CF1D',
                    borderRadius: 8,
                    backgroundColor: 'rgba(242, 207, 29, 0.10)',
                    boxShadow: '0 0 35px rgba(242, 207, 29, 0.7), inset 0 0 25px rgba(242, 207, 29, 0.3)',
                    zIndex: 26,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                  }}
                >
                  {/* High-speed Laser Scanner Sweep Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: 40,
                      left: `${((frame * 5.0) % 130) - 20}%`,
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), rgba(242, 207, 29, 0.95), transparent)',
                      boxShadow: '0 0 25px #F2CF1D',
                    }}
                  />
                </div>

                {/* 2. POC Max Volume Node Bar Pulsing Highlight */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: `${pocBottom - 1.2}%`,
                    width: '21%',
                    height: '3%',
                    backgroundColor: 'rgba(242, 207, 29, 0.85)',
                    boxShadow: '0 0 30px #F2CF1D, 0 0 60px rgba(242, 207, 29, 0.8)',
                    border: '1.5px solid #FFFFFF',
                    borderRadius: 4,
                    zIndex: 28,
                    pointerEvents: 'none',
                  }}
                />

                {/* 3. Floating Interactive Volume Telemetry Badge */}
                <div
                  style={{
                    position: 'absolute',
                    left: '25%',
                    bottom: `${pocBottom}%`,
                    transform: 'translateY(50%)',
                    backgroundColor: 'rgba(12, 16, 24, 0.96)',
                    border: '2px solid #F2CF1D',
                    borderRadius: 10,
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(242, 207, 29, 0.6)',
                    zIndex: 35,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#F2CF1D',
                      boxShadow: '0 0 12px #F2CF1D',
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#F2CF1D', letterSpacing: 0.5 }}>
                      ⚡ 16.01M ACCUMULATION VOLUME
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: '#FFFFFF', opacity: 0.9 }}>
                      INSTITUTIONAL DEMAND CLUSTER CONFIRMED
                    </div>
                  </div>
                </div>

                {/* 4. Energy Flow Connector from Volume Node to Live Candle */}
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 31,
                  }}
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                >
                  <line
                    x1={220}
                    y1={600 * (1 - pocBottom / 100)}
                    x2={505}
                    y2={600 * (1 - cmpBottom / 100)}
                    stroke="#F2CF1D"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    strokeDashoffset={-frame * 3}
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(242, 207, 29, 0.8))',
                    }}
                  />
                </svg>
              </>
            )}

            {/* =========================================================
               DYNAMIC TECHNICAL LEVEL LINES ACROSS ALL ACTS
               ========================================================= */}
            {/* POC LINE */}
            {(phase === 1 || activeLevel?.key === 'poc' || activeLevel?.key === 'val_volume') && (
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
                  ★ POC: ₹{fmtPrice(levels.poc)} [MONTHLY POINT OF CONTROL]
                </div>
              </div>
            )}

            {/* VAL LINE */}
            {(phase === 1 || activeLevel?.key === 'val') && (
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
                  VAL: ₹{fmtPrice(levels.val)} [VALUE AREA LOW FLOOR]
                </div>
              </div>
            )}

            {/* 20 DEMA LINE */}
            {(phase === 2 || activeLevel?.key === 'd20' || activeLevel?.key === 'trailing_d20') && (
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

            {/* VAH LINE */}
            {(phase === 3 || activeLevel?.key === 'vah') && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${vahBottom}%`,
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
                  ↗ VAH: ₹{fmtPrice(levels.vah)} [MONTHLY BREAKOUT LEVEL]
                </div>
              </div>
            )}

            {/* TARGET 1 (SESSION HIGH 414) LINE */}
            {(phase === 4 || activeLevel?.key === 'target1') && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${target1Bottom}%`,
                  height: 4.0,
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 16px #10B981, 0 0 35px #10B981, 0 0 70px rgba(16, 185, 129, 0.8)',
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
                  🎯 TARGET 1: ₹{fmtPrice(levels.target1 || 414)} [SESSION HIGH BREAKOUT]
                </div>
              </div>
            )}

            {/* TARGET 2 (CORRIDOR 422.50) LINE */}
            {(phase === 4 || activeLevel?.key === 'target2') && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${target2Bottom}%`,
                  height: 4.0,
                  backgroundColor: '#22D3EE',
                  boxShadow: '0 0 16px #22D3EE, 0 0 35px #22D3EE, 0 0 70px rgba(34, 211, 238, 0.8)',
                  zIndex: 25,
                  clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                }}
              >
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
                  🎯 TARGET 2: ₹{fmtPrice(levels.target2 || 422.5)} [EXPANSION CORRIDOR ₹420-₹425]
                </div>
              </div>
            )}

            {/* 50 DEMA LINE */}
            {(phase === 5 || activeLevel?.key === 'd50') && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${d50Bottom}%`,
                  height: 3.5,
                  backgroundColor: '#00E5FF',
                  boxShadow: '0 0 14px rgba(0, 229, 255, 0.8)',
                  zIndex: 24,
                  clipPath: `inset(0 ${100 - sweepProgress * 100}% 0 0)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 20,
                    bottom: 7,
                    backgroundColor: 'rgba(0, 229, 255, 0.95)',
                    color: '#121417',
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 5,
                  }}
                >
                  ⚔ 50 DEMA: ₹{fmtPrice(levels.d50)} [INFLECTION HURDLE]
                </div>
              </div>
            )}

            {/* 100 DEMA LINE */}
            {(phase === 5 || activeLevel?.key === 'd100') && (
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
            )}

            {/* 200 DEMA LINE */}
            {(phase === 5 || activeLevel?.key === 'd200') && (
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
            <div style={{ marginBottom: 10 }}>
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
                ▲ RESISTANCE & TARGETS (ABOVE CMP)
              </div>

              {/* Target 2 Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: activeLevel?.key === 'target2' ? 'rgba(34, 211, 238, 0.32)' : 'rgba(244, 241, 232, 0.03)',
                  border: activeLevel?.key === 'target2' ? '2px solid #22D3EE' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: activeLevel?.key === 'target2' ? '0 0 18px rgba(34, 211, 238, 0.5)' : 'none',
                  transform: activeLevel?.key === 'target2' ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: phase === 0 || activeLevel?.key === 'target2' ? 1.0 : 0.35,
                  marginBottom: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
                  🎯 Target 2 (Corridor)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#22D3EE' }}>
                  ₹{fmtPrice(levels.target2 || 422.5)}
                </span>
              </div>

              {/* Target 1 Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: activeLevel?.key === 'target1' ? 'rgba(16, 185, 129, 0.32)' : 'rgba(244, 241, 232, 0.03)',
                  border: activeLevel?.key === 'target1' ? '2px solid #10B981' : '1px solid rgba(244, 241, 232, 0.06)',
                  boxShadow: activeLevel?.key === 'target1' ? '0 0 18px rgba(16, 185, 129, 0.5)' : 'none',
                  transform: activeLevel?.key === 'target1' ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: phase === 0 || activeLevel?.key === 'target1' ? 1.0 : 0.35,
                  marginBottom: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
                  🎯 Target 1 (Session High)
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 900, color: '#10B981' }}>
                  ₹{fmtPrice(levels.target1 || 414.0)}
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

  const audioFile = manifest.audio_file ? `audio/${manifest.audio_file}` : null;

  return (
    <>
      {audioFile && <Audio src={staticFile(audioFile)} />}
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
    </>
  );
};
