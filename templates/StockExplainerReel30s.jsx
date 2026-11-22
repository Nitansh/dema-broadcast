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

// Load manifests safely
let sunpharmaManifest = {};
try {
  sunpharmaManifest = require('../../public/data/sunpharma_30s_reel_manifest.json');
} catch (e) {}

let trentManifest = {};
try {
  trentManifest = require('../../public/data/trent_30s_reel_manifest.json');
} catch (e) {}

let tvsmotorManifest = {};
try {
  tvsmotorManifest = require('../../public/data/tvsmotor_30s_reel_manifest.json');
} catch (e) {}

let axisbankManifest = {};
try {
  axisbankManifest = require('../../public/data/axisbank_30s_reel_manifest.json');
} catch (e) {}

const MANIFEST_MAP = {
  sunpharma: sunpharmaManifest,
  trent: trentManifest,
  tvsmotor: tvsmotorManifest,
  axisbank: axisbankManifest,
};

export const getShortManifest = (manifestPath, propManifest) => {
  if (propManifest && propManifest.symbol) return propManifest;
  if (!manifestPath) return sunpharmaManifest;
  const cleanSym = String(manifestPath)
    .replace(/^data\//, '')
    .replace(/_30s_reel_manifest\.json$/, '')
    .replace(/_explainer_manifest\.json$/, '')
    .toLowerCase();
  
  if (MANIFEST_MAP[cleanSym] && MANIFEST_MAP[cleanSym].symbol) {
    return MANIFEST_MAP[cleanSym];
  }
  try {
    const dyn = require(`../../public/data/${cleanSym}_30s_reel_manifest.json`);
    if (dyn && dyn.symbol) return dyn;
  } catch (e) {}

  return sunpharmaManifest;
};

export const StockExplainerReel30s = ({ manifest: propManifest, manifestPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const manifest = getShortManifest(manifestPath, propManifest);

  const cues = manifest.cue_frames || [0, 220, 445, 650];
  const cue0 = cues[0] || 0;
  const cue1 = cues[1] || 220; // Supports start
  const cue2 = cues[2] || 445; // Targets start
  const cue3 = cues[3] || 650; // Related video bridge start

  // Active Phase: 0 = Hook, 1 = Supports, 2 = Targets, 3 = Bridge
  const phase =
    frame < cue1 ? 0 :
    frame < cue2 ? 1 :
    frame < cue3 ? 2 : 3;

  // Camera Motion
  let cameraScale = 1.0;
  let cameraPanY = 0;

  if (phase === 0) {
    // Punch-in hook
    const p0 = Math.min(1, frame / 20);
    cameraScale = interpolate(p0, [0, 1], [1.08, 1.0], {
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  } else if (phase === 1) {
    // Focus down towards supports
    const p1 = Math.min(1, (frame - cue1) / 30);
    cameraScale = interpolate(p1, [0, 1], [1.0, 1.06]);
    cameraPanY = interpolate(p1, [0, 1], [0, -35]);
  } else if (phase === 2) {
    // Sweep up towards targets
    const p2 = Math.min(1, (frame - cue2) / 30);
    cameraScale = interpolate(p2, [0, 1], [1.06, 1.08]);
    cameraPanY = interpolate(p2, [0, 1], [-35, 30]);
  } else {
    // Overview for Related Video Bridge
    const p3 = Math.min(1, (frame - cue3) / 25);
    cameraScale = interpolate(p3, [0, 1], [1.08, 1.0]);
    cameraPanY = interpolate(p3, [0, 1], [30, 0]);
  }

  // Flash cut opacity at transitions
  let flashOpacity = 0;
  const cutFrames = [0, cue1, cue2, cue3];
  for (const cf of cutFrames) {
    if (frame >= cf && frame <= cf + 4) {
      flashOpacity = Math.max(flashOpacity, interpolate(frame - cf, [0, 4], [0.6, 0]));
    }
  }

  // Active Subtitle Chunk
  const activeChunk = (manifest.chunks || []).find(
    (c) => frame >= c.start_frame && frame <= c.end_frame
  ) || (manifest.chunks ? manifest.chunks[manifest.chunks.length - 1] : null);

  // Price calculations for center-mapped arrows
  const levels = manifest.levels || {};
  const cmp = Number(manifest.cmp || 1000);
  const d20 = Number(levels.d20 || cmp * 0.985);
  const d50 = Number(levels.d50 || cmp * 0.97);
  const poc = Number(levels.poc || cmp * 0.96);
  const val = Number(levels.val || cmp * 0.93);
  const target1 = Number(levels.target1 || cmp * 1.025);
  const target2 = Number(levels.target2 || cmp * 1.05);

  const allLevels = [val, poc, d50, d20, cmp, target1, target2].filter(Boolean);
  const minPrice = Math.min(...allLevels) * 0.99;
  const maxPrice = Math.max(...allLevels) * 1.01;

  // Chart Box Dimensions: width: 1000, height: 1020, top: 290, left: 40
  const CHART_H = 1020;
  const priceToY = (price) => {
    if (maxPrice === minPrice) return CHART_H / 2;
    const norm = (price - minPrice) / (maxPrice - minPrice);
    // Invert because higher price is higher up (smaller Y)
    return CHART_H - (norm * (CHART_H - 160) + 80);
  };

  const cmpY = priceToY(cmp);
  const d20Y = priceToY(d20);
  const pocY = priceToY(poc);
  const valY = priceToY(val);
  const t1Y = priceToY(target1);
  const t2Y = priceToY(target2);

  // Stagger overlapping labels if prices are too close
  let pocLabelY = pocY;
  let d20LabelY = d20Y;
  if (Math.abs(d20LabelY - pocLabelY) < 32) {
    d20LabelY = pocLabelY + 32;
  }

  // Arrow draw animation progresses
  const supportsProgress = Math.min(1, Math.max(0, (frame - cue1) / 24));
  const targetsProgress = Math.min(1, Math.max(0, (frame - cue2) / 24));

  // Pulse effect for bridge
  const bridgePulse = 1 + Math.sin(frame * 0.2) * 0.04;
  const bounceY = Math.sin(frame * 0.3) * 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070B14',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        color: '#F8FAFC',
        overflow: 'hidden',
      }}
    >
      {/* 1. AUDIO TRACK */}
      {manifest.audio_file && (
        <Audio src={staticFile(`audio/${manifest.audio_file}`)} />
      )}

      {/* 2. DYNAMIC BROADCAST BACKGROUND GRID */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 25%, rgba(30, 58, 138, 0.22) 0%, rgba(7, 11, 20, 0.98) 75%)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
          zIndex: 1,
        }}
      />

      {/* 3. TOP BROADCAST HEADER (0 - 270px) */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 10,
        }}
      >
        {/* Brand Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 8,
              padding: '6px 14px',
            }}
          >
            <span
              style={{
                backgroundColor: '#F59E0B',
                color: '#000',
                fontWeight: 900,
                fontSize: 18,
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              D
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.08em', color: '#FCD34D' }}>
              DEMA BROADCAST · 30s STUDY
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 16,
              fontWeight: 800,
              color: '#FCA5A5',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
            INSTITUTIONAL RADAR
          </div>
        </div>

        {/* Stock Title & CMP & Surge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 8,
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            paddingBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 62, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {manifest.symbol}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#94A3B8', marginTop: 4 }}>
              {manifest.name} · NSE DAILY
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#CBD5E1' }}>
              LIVE PRICE (CMP)
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                color: '#10B981',
                lineHeight: 1,
                textShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              ₹{Number(manifest.cmp || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Volume Surge Highlight Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(249, 115, 22, 0.12)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            borderRadius: 10,
            padding: '10px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#FB923C', letterSpacing: '0.04em' }}>
              TURNOVER VOLUME SURGE: ₹{manifest.turnover_cr} CRORE
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#FDBA74' }}>
            INSTITUTIONAL BUYING
          </div>
        </div>
      </div>

      {/* 4. CENTRAL CHART BOX WITH CENTER-MAPPED DYNAMIC ARROWS (290px - 1310px) */}
      <div
        style={{
          position: 'absolute',
          top: 290,
          left: 40,
          width: 1000,
          height: CHART_H,
          borderRadius: 20,
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0,0,0,0.5)',
          backgroundColor: '#0A0F1D',
          zIndex: 5,
        }}
      >
        {/* Animated Camera Container for the Chart */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${cameraScale}) translateY(${cameraPanY}px)`,
            transformOrigin: '500px 500px',
            transition: 'transform 0.1s linear',
          }}
        >
          {/* Pure Dark Theme TradingView Chart */}
          <Img
            src={staticFile(manifest.chart_image)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'brightness(1.08) contrast(1.12)',
            }}
          />

          {/* SVG Overlay for Center-Mapped Arrows */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <defs>
              {/* Green Target Arrowhead */}
              <marker
                id="arrow-green"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>

              {/* Cyan Target Arrowhead */}
              <marker
                id="arrow-cyan"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#06B6D4" />
              </marker>

              {/* Red Support Arrowhead */}
              <marker
                id="arrow-red"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
              </marker>

              {/* Amber POC Arrowhead */}
              <marker
                id="arrow-amber"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
              </marker>
            </defs>

            {/* CMP Center Pivot Horizontal Line */}
            <line
              x1="60"
              y1={cmpY}
              x2="940"
              y2={cmpY}
              stroke="#10B981"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.85"
            />
            {/* CMP Center Dot */}
            <circle cx="500" cy={cmpY} r="7" fill="#10B981" />
            <circle cx="500" cy={cmpY} r="14" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.6" />

            {/* ============================================================ */}
            {/* PHASE 1: ALL DYNAMIC SUPPORTS (RED ARROWS DOWN FROM CMP)   */}
            {/* ============================================================ */}
            {phase >= 1 && (
              <g opacity={phase === 1 ? 1 : 0.45}>
                {/* 1. Arrow from CMP down to 20 DEMA */}
                {(() => {
                  const targetY = cmpY + (d20Y - cmpY) * supportsProgress;
                  const targetX = 500 + (380 - 500) * supportsProgress;
                  return (
                    <>
                      <line
                        x1="500"
                        y1={cmpY}
                        x2={targetX}
                        y2={targetY}
                        stroke="#EF4444"
                        strokeWidth="4"
                        markerEnd="url(#arrow-red)"
                        filter="drop-shadow(0 0 6px #EF4444)"
                      />
                      <line
                        x1="100"
                        y1={d20Y}
                        x2="900"
                        y2={d20Y}
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity={supportsProgress * 0.7}
                      />
                    </>
                  );
                })()}

                {/* 2. Arrow from CMP down to POC */}
                {(() => {
                  const targetY = cmpY + (pocY - cmpY) * supportsProgress;
                  return (
                    <>
                      <line
                        x1="500"
                        y1={cmpY}
                        x2="500"
                        y2={targetY}
                        stroke="#F59E0B"
                        strokeWidth="4"
                        markerEnd="url(#arrow-amber)"
                        filter="drop-shadow(0 0 6px #F59E0B)"
                      />
                      <line
                        x1="100"
                        y1={pocY}
                        x2="900"
                        y2={pocY}
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity={supportsProgress * 0.7}
                      />
                    </>
                  );
                })()}

                {/* 3. Arrow from CMP down to VAL */}
                {(() => {
                  const targetY = cmpY + (valY - cmpY) * supportsProgress;
                  const targetX = 500 + (620 - 500) * supportsProgress;
                  return (
                    <>
                      <line
                        x1="500"
                        y1={cmpY}
                        x2={targetX}
                        y2={targetY}
                        stroke="#DC2626"
                        strokeWidth="4"
                        markerEnd="url(#arrow-red)"
                        filter="drop-shadow(0 0 6px #DC2626)"
                      />
                      <line
                        x1="100"
                        y1={valY}
                        x2="900"
                        y2={valY}
                        stroke="#DC2626"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity={supportsProgress * 0.7}
                      />
                    </>
                  );
                })()}
              </g>
            )}

            {/* ============================================================ */}
            {/* PHASE 2: ALL BREAKOUT TARGETS (GREEN ARROWS UP FROM CMP)   */}
            {/* ============================================================ */}
            {phase >= 2 && (
              <g opacity={phase === 2 ? 1 : 0.55}>
                {/* 1. Arrow from CMP up to Target 1 */}
                {(() => {
                  const targetY = cmpY + (t1Y - cmpY) * targetsProgress;
                  const targetX = 500 + (430 - 500) * targetsProgress;
                  return (
                    <>
                      <line
                        x1="500"
                        y1={cmpY}
                        x2={targetX}
                        y2={targetY}
                        stroke="#06B6D4"
                        strokeWidth="4.5"
                        markerEnd="url(#arrow-cyan)"
                        filter="drop-shadow(0 0 8px #06B6D4)"
                      />
                      <line
                        x1="100"
                        y1={t1Y}
                        x2="900"
                        y2={t1Y}
                        stroke="#06B6D4"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        opacity={targetsProgress * 0.85}
                      />
                    </>
                  );
                })()}

                {/* 2. Arrow from CMP up to Target 2 */}
                {(() => {
                  const targetY = cmpY + (t2Y - cmpY) * targetsProgress;
                  const targetX = 500 + (570 - 500) * targetsProgress;
                  return (
                    <>
                      <line
                        x1="500"
                        y1={cmpY}
                        x2={targetX}
                        y2={targetY}
                        stroke="#10B981"
                        strokeWidth="4.5"
                        markerEnd="url(#arrow-green)"
                        filter="drop-shadow(0 0 8px #10B981)"
                      />
                      <line
                        x1="100"
                        y1={t2Y}
                        x2="900"
                        y2={t2Y}
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        opacity={targetsProgress * 0.85}
                      />
                    </>
                  );
                })()}
              </g>
            )}
          </svg>

          {/* Level Labels on the Chart */}
          {/* CMP Label */}
          <div
            style={{
              position: 'absolute',
              top: cmpY - 22,
              right: 50,
              backgroundColor: '#10B981',
              color: '#000',
              fontWeight: 900,
              fontSize: 18,
              padding: '4px 10px',
              borderRadius: 6,
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
              zIndex: 30,
            }}
          >
            CMP ₹{cmp.toFixed(2)} (CENTER PIVOT)
          </div>

          {/* Support Labels (Phase 1) */}
          {phase >= 1 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: d20LabelY - 14,
                  left: 60,
                  backgroundColor: 'rgba(239, 68, 68, 0.95)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: 16,
                  padding: '3px 10px',
                  borderRadius: 6,
                  zIndex: 30,
                }}
              >
                ▼ 20 DEMA: ₹{d20.toFixed(2)}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: pocLabelY - 14,
                  left: 60,
                  backgroundColor: 'rgba(245, 158, 11, 0.95)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 16,
                  padding: '3px 10px',
                  borderRadius: 6,
                  zIndex: 30,
                }}
              >
                ▼ POC FLOOR: ₹{poc.toFixed(2)}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: valY - 14,
                  left: 60,
                  backgroundColor: 'rgba(220, 38, 38, 0.95)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: 16,
                  padding: '3px 10px',
                  borderRadius: 6,
                  zIndex: 30,
                }}
              >
                ▼ VAL SUPPORT: ₹{val.toFixed(2)}
              </div>
            </>
          )}

          {/* Target Labels (Phase 2) */}
          {phase >= 2 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: t1Y - 16,
                  right: 50,
                  backgroundColor: '#06B6D4',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 18,
                  padding: '4px 12px',
                  borderRadius: 6,
                  boxShadow: '0 0 14px rgba(6, 182, 212, 0.6)',
                  zIndex: 30,
                }}
              >
                ▲ TARGET 1: ₹{target1.toFixed(2)}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: t2Y - 16,
                  right: 50,
                  backgroundColor: '#10B981',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 18,
                  padding: '4px 12px',
                  borderRadius: 6,
                  boxShadow: '0 0 14px rgba(16, 185, 129, 0.6)',
                  zIndex: 30,
                }}
              >
                ▲ TARGET 2: ₹{target2.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. TELEMETRY STATUS RIBBON (1330px - 1410px) */}
      <div
        style={{
          position: 'absolute',
          top: 1330,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          padding: '12px 20px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: phase === 0 ? '#F59E0B' : phase === 1 ? '#EF4444' : phase === 2 ? '#10B981' : '#38BDF8',
              boxShadow: '0 0 10px currentColor',
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.04em', color: '#F1F5F9' }}>
            {phase === 0 && 'PHASE 1: HOOK · TURNOVER VOLUME SURGE'}
            {phase === 1 && 'PHASE 2: ALL SUPPORTS · 20 DEMA / POC / VAL'}
            {phase === 2 && 'PHASE 3: ALL TARGETS · T1 & T2 CORRIDOR'}
            {phase === 3 && 'PHASE 4: MASTERCLASS BRIDGE · TAP RELATED VIDEO'}
          </span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: '#94A3B8' }}>
          {manifest.symbol} · STUDY
        </div>
      </div>

      {/* 6. KINETIC BROADCAST CAPTIONS (1430px - 1620px) */}
      {activeChunk && (
        <div
          style={{
            position: 'absolute',
            top: 1430,
            left: 40,
            right: 40,
            minHeight: 160,
            backgroundColor: 'rgba(11, 19, 43, 0.95)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 16,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 15,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.35,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              textShadow: '0 3px 10px rgba(0,0,0,0.8)',
            }}
          >
            {activeChunk.text}
          </div>
        </div>
      )}

      {/* 7. RELATED VIDEO CALLOUT BRIDGE BANNER (1640px - 1880px) */}
      {/* Prominently visible in Phase 3, with persistent hint earlier */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          right: 40,
          height: 220,
          backgroundColor: phase === 3 ? 'rgba(8, 20, 48, 0.98)' : 'rgba(15, 23, 42, 0.85)',
          border: phase === 3 ? '2.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: phase === 3 ? '0 0 35px rgba(56, 189, 248, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.2)' : 'none',
          transform: phase === 3 ? `scale(${bridgePulse})` : 'scale(1)',
          transition: 'all 0.2s ease-out',
          zIndex: 25,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                backgroundColor: '#EF4444',
                color: '#FFF',
                fontWeight: 900,
                fontSize: 18,
                padding: '4px 10px',
                borderRadius: 6,
                letterSpacing: '0.05em',
              }}
            >
              FULL MASTERCLASS
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#38BDF8' }}>
              16:9 INSTITUTIONAL ANALYSIS
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38BDF8',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 16,
              fontWeight: 800,
              color: '#7DD3FC',
            }}
          >
            YOUTUBE SHORTS LINK
          </div>
        </div>

        {/* Call to action instruction with bouncing down chevrons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 12,
            padding: '12px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              ▶
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#F8FAFC' }}>
                Tap "Related video" link below
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>
                For Complete Volume Profile & Trade Playbook
              </div>
            </div>
          </div>

          {/* Animated Bouncing Pointer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `translateY(${bounceY}px)`,
            }}
          >
            <span style={{ fontSize: 32 }}>👇</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
              TAP HERE
            </span>
          </div>
        </div>

        {/* Safe zone note */}
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#64748B' }}>
          STRICTLY EDUCATIONAL TECHNICAL STUDY · NO SEBI ADVISORY CLAIMS
        </div>
      </div>

      {/* 8. FLASH CUT RESET */}
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
    </AbsoluteFill>
  );
};
