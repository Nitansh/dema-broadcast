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
   UNIVERSAL STOCK EXPLAINER REEL CORE (9:16 Vertical | 1080x1920 @ 30fps)
   Decluttered Laser Protocol + Sonar Radar CMP + 6-Phase Motion Tracking
   ========================================================================= */
export const StockExplainerCore = ({ manifest: propManifest, manifestPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
  const allLevelVals = [levels.val, levels.poc, levels.d20, levels.cmp, levels.d50, levels.vah, levels.d100, levels.d200, levels.target1, levels.target2].filter(Boolean);
  const minPrice = Math.min(...allLevelVals) * 0.985;
  const maxPrice = Math.max(...allLevelVals) * 1.015;
  const priceToYPct = (price) => {
    if (maxPrice === minPrice) return 50;
    const norm = (price - minPrice) / (maxPrice - minPrice);
    return Math.max(16, Math.min(84, 18 + norm * 64));
  };

  const customBottom = manifest.levels_bottom_pct_9x16 || manifest.levels_bottom_pct || {};
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

  // Active Technical Level & Directional Geometry across every frame
  let activeLevel = null;
  let isVolumeActive = false;

  if (manifest.symbol === 'SILVERBEES') {
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
          key: 'val',
          name: 'VAL SUPPORT',
          label: 'VAL: ₹141.77 (SUPPORT)',
          price: parseNum(levels.val),
          bottom: valBottom,
          color: '#FE6B3D',
          context: 'DYNAMIC SUPPORT (BELOW LIVE)',
        };
      } else {
        activeLevel = {
          key: 'd20',
          name: '20 DEMA',
          label: '20 DEMA: ₹155.50 (TARGET 1)',
          price: parseNum(levels.d20),
          bottom: d20Bottom,
          color: '#10B981',
          context: 'UPSIDE TARGET 1 (ABOVE LIVE)',
        };
      }
    } else if (phase === 1) {
      if (frame < 910) {
        activeLevel = {
          key: 'val',
          name: 'VAL FLOOR',
          label: 'VAL: ₹141.77 (DEMAND FLOOR)',
          price: parseNum(levels.val),
          bottom: valBottom,
          color: '#FE6B3D',
          context: 'VALUE AREA LOW ACCUMULATION FLOOR',
        };
      } else if (frame < 1110) {
        activeLevel = {
          key: 'val',
          name: 'INVALIDATION',
          label: 'VAL: ₹141.77 (STRICT FLOOR)',
          price: parseNum(levels.val),
          bottom: valBottom,
          color: '#FE6B3D',
          context: 'CRUCIAL INVALIDATION SUPPORT FLOOR',
        };
      } else {
        isVolumeActive = true;
        activeLevel = {
          key: 'val_volume',
          name: '189.98M DEMAND',
          label: '189.98M VOL DEMAND',
          price: parseNum(levels.val),
          bottom: valBottom,
          color: '#F2CF1D',
          context: '189.98M INSTITUTIONAL ACCUMULATION DEMAND',
        };
      }
    } else if (phase === 2) {
      activeLevel = {
        key: 'd20',
        name: '20 DEMA',
        label: '20 DEMA (TARGET 1)',
        price: parseNum(levels.d20),
        bottom: d20Bottom,
        color: '#10B981',
        context: 'IMMEDIATE OVERHEAD HURDLE / TARGET 1',
      };
    } else if (phase === 3) {
      activeLevel = {
        key: 'd50',
        name: '50 DEMA',
        label: '50 DEMA (HURDLE)',
        price: parseNum(levels.d50),
        bottom: d50Bottom,
        color: '#00E5FF',
        context: 'SECONDARY INFLECTION HURDLE',
      };
    } else if (phase === 4) {
      if (frame < 2850) {
        activeLevel = {
          key: 'poc',
          name: 'POC',
          label: 'POC: ₹176.84 (TARGET 2)',
          price: parseNum(levels.poc),
          bottom: pocBottom,
          color: '#10B981',
          context: 'HEAVY VOLUME POINT OF CONTROL NODE',
        };
      } else {
        activeLevel = {
          key: 'vah',
          name: 'VAH',
          label: 'VAH: ₹181.85 (CEILING)',
          price: parseNum(levels.vah),
          bottom: vahBottom,
          color: '#10B981',
          context: 'VALUE AREA HIGH SUPPLY CEILING',
        };
      }
    } else if (phase === 5) {
      if (frame < 3400) {
        activeLevel = {
          key: 'd100',
          name: '100 DEMA',
          label: '100 DEMA',
          price: parseNum(levels.d100),
          bottom: d100Bottom,
          color: '#10B981',
          context: '100-DAY EXPONENTIAL AVERAGE',
        };
      } else if (frame < 3650) {
        activeLevel = {
          key: 'd200',
          name: '200 DEMA',
          label: '200 DEMA (MACRO)',
          price: parseNum(levels.d200),
          bottom: d200Bottom,
          color: '#10B981',
          context: '200-DAY TREND REVERSAL AVERAGE',
        };
      } else if (frame < 3900) {
        activeLevel = {
          key: 'buy',
          name: 'BUY PRICE',
          label: 'BUY PRICE ₹216.78',
          price: parseNum(levels.buy || 216.78),
          bottom: customBottom.buy ?? d200Bottom,
          color: '#10B981',
          context: 'INSTITUTIONAL BUY PRICE ANCHOR',
        };
      } else {
        activeLevel = {
          key: 'val_stop',
          name: 'RISK FLOOR',
          label: 'VAL: ₹141.77 (RISK FLOOR)',
          price: parseNum(levels.val),
          bottom: valBottom,
          color: '#FE6B3D',
          context: 'STRICT RISK MANAGEMENT FLOOR',
        };
      }
    }
  } else if (phase === 0) {
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
              padding: '4px 9px',
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
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
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
                fontSize: 9,
                fontWeight: 800,
                color: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                padding: '1px 4px',
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
            const x1 = 505; // Starting at Live Candle Tip
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
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: `2.5px solid ${activeLevel.color}`,
                      transform: `translate(-50%, -50%) scale(${pingScale})`,
                      opacity: pingOpacity,
                      boxShadow: `0 0 16px ${activeLevel.color}`,
                    }}
                  />
                  {/* Center Core Radar Ping */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 11,
                      height: 11,
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
                    transform: 'translate(-50%, -100%) translateY(-16px)',
                    backgroundColor: 'rgba(18, 20, 23, 0.96)',
                    border: `2px solid ${activeLevel.color}`,
                    borderRadius: 7,
                    padding: '3px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: `0 6px 18px rgba(0,0,0,0.85), 0 0 14px ${activeLevel.color}66`,
                    whiteSpace: 'nowrap',
                    zIndex: 36,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 10,
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
                      fontSize: 13,
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
                      id="arrow-green-point-reel"
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
                      id="arrow-red-point-reel"
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
                    x1={460}
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
                    markerEnd={isLevelBelow ? 'url(#arrow-red-point-reel)' : 'url(#arrow-green-point-reel)'}
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
                    padding: '3px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: `0 4px 16px rgba(0,0,0,0.85), 0 0 12px ${isLevelBelow ? 'rgba(254,107,61,0.45)' : 'rgba(16,185,129,0.45)'}`,
                    zIndex: 35,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 900, color: arrowColor }}>
                    {isLevelBelow ? '↘ DOWN' : '↗ UP'}
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 900, color: '#FFFFFF' }}>
                    {isLevelBelow ? `-₹${fmtPrice(levelDiff)}` : `+₹${fmtPrice(levelDiff)}`} ({levelPct.toFixed(1)}%)
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 8.5,
                      fontWeight: 800,
                      color: arrowColor,
                      backgroundColor: isLevelBelow ? 'rgba(254,107,61,0.18)' : 'rgba(16,185,129,0.18)',
                      padding: '1px 4px',
                      borderRadius: 3,
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
              {/* Neon Glowing Bounding Box over Horizontal Volume Profile */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: `${Math.min(valBottom, pocBottom) - 4}%`,
                  width: '26%',
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
                {/* Laser Sweep Bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: 35,
                    left: `${((frame * 5.0) % 130) - 20}%`,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), rgba(242, 207, 29, 0.95), transparent)',
                    boxShadow: '0 0 25px #F2CF1D',
                  }}
                />
              </div>

              {/* POC Volume Node Glow */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: `${pocBottom - 1.2}%`,
                  width: '23%',
                  height: '3%',
                  backgroundColor: 'rgba(242, 207, 29, 0.85)',
                  boxShadow: '0 0 30px #F2CF1D, 0 0 60px rgba(242, 207, 29, 0.8)',
                  border: '1.5px solid #FFFFFF',
                  borderRadius: 4,
                  zIndex: 28,
                  pointerEvents: 'none',
                }}
              />

              {/* Volume Telemetry Badge */}
              <div
                style={{
                  position: 'absolute',
                  left: '27%',
                  bottom: `${pocBottom}%`,
                  transform: 'translateY(50%)',
                  backgroundColor: 'rgba(12, 16, 24, 0.96)',
                  border: '2px solid #F2CF1D',
                  borderRadius: 8,
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(242, 207, 29, 0.6)',
                  zIndex: 35,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F2CF1D', boxShadow: '0 0 10px #F2CF1D' }} />
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 900, color: '#F2CF1D' }}>
                    ⚡ 16.01M VOLUME CLUSTER
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: '#FFFFFF', opacity: 0.9 }}>
                    INSTITUTIONAL ACCUMULATION
                  </div>
                </div>
              </div>

              {/* Energy Flow Connector */}
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
                  x1={230}
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
                ↗ VAH: ₹{fmtPrice(levels.vah)} [MONTHLY BREAKOUT LEVEL]
              </div>
            </div>
          )}

          {/* TARGET 1 LINE */}
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
                🎯 TARGET 1: ₹{fmtPrice(levels.target1 || 414)} [SESSION HIGH BREAKOUT]
              </div>
            </div>
          )}

          {/* TARGET 2 LINE */}
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
                🎯 TARGET 2: ₹{fmtPrice(levels.target2 || 422.5)} [EXPANSION CORRIDOR]
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
                  right: 14,
                  bottom: 7,
                  backgroundColor: 'rgba(0, 229, 255, 0.95)',
                  color: '#121417',
                  fontFamily: FONTS.mono,
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 4,
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
  const audioFile = manifest.audio_file ? `audio/${manifest.audio_file}` : null;

  return (
    <>
      {audioFile && <Audio src={staticFile(audioFile)} />}
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
    </>
  );
};
