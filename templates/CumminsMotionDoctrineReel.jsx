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

import manifest from '../public/data/cummins_motion_doctrine_manifest.json';
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

// Total: Intro (105f = 3.5s) + Breakdown (1676f = 55.87s) + Outro (150f = 5.0s) = 1931 frames (64.37s)
export const CUMMINS_INTRO_FRAMES = 105;
export const CUMMINS_BODY_FRAMES = manifest.total_frames_30fps || 1676;
export const CUMMINS_OUTRO_FRAMES = 150;
export const CUMMINS_MOTION_DOCTRINE_FRAMES =
  CUMMINS_INTRO_FRAMES + CUMMINS_BODY_FRAMES + CUMMINS_OUTRO_FRAMES;

/* =========================================================================
   CUMMINS INDIA BREAKDOWN CORE COMPONENT (55.87s / 1676 frames @ 30fps)
   ========================================================================= */
export const CumminsBreakdownCore = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cues = manifest.cue_frames || [15, 314, 609, 922, 1279];
  const cue0 = cues[0] || 15;
  const cue1 = cues[1] || 314;
  const cue2 = cues[2] || 609;
  const cue3 = cues[3] || 922;
  const cue4 = cues[4] || 1279;
  const endWipe = manifest.end_wipe_frame || 1616;
  const showHud = frame >= 12 && frame < endWipe + 8;

  // Active Phase (0 to 4)
  const phase = frame < cue1 ? 0 : frame < cue2 ? 1 : frame < cue3 ? 2 : frame < cue4 ? 3 : 4;

  // Opening punch-in: 1.09x -> 1.0x over first 24 frames
  const introPunchProgress = clamp01(frame / 24);
  const introZoomScale = interpolate(introPunchProgress, [0, 1], [1.09, 1.0], {
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  // Flash cut opacities at cuts
  const flashTimes = [0, cue1, cue2, cue3, cue4];
  let flashOpacity = 0;
  for (const ft of flashTimes) {
    if (frame >= ft && frame <= ft + 5) {
      flashOpacity = Math.max(flashOpacity, interpolate(frame - ft, [0, 5], [0.75, 0]));
    }
  }

  // Camera Motion (motion-doctrine)
  let cameraScale = 1.0;
  let cameraPanX = 0;
  let cameraPanY = 0;

  if (frame < cue1) {
    const p0 = clamp01(frame / cue1);
    cameraScale = interpolate(p0, [0, 1], [1.14, 1.18]);
    cameraPanX = interpolate(p0, [0, 1], [10, 0]);
    cameraPanY = interpolate(p0, [0, 1], [0, 15]);
  } else if (frame < cue2) {
    const p1 = clamp01((frame - cue1) / (cue2 - cue1));
    cameraScale = interpolate(p1, [0, 1], [1.18, 1.25]);
    cameraPanX = interpolate(p1, [0, 1], [0, -35]);
    cameraPanY = interpolate(p1, [0, 1], [15, -55]);
  } else if (frame < cue3) {
    const p2 = clamp01((frame - cue2) / (cue3 - cue2));
    const impactRecoil = Math.sin(clamp01((frame - cue2) / 22) * Math.PI) * 16;
    cameraScale = interpolate(p2, [0, 1], [1.28, 1.22]);
    cameraPanX = interpolate(p2, [0, 1], [-35, -10]);
    cameraPanY = interpolate(p2, [0, 1], [-55 + impactRecoil, -20]);
  } else if (frame < cue4) {
    const p3 = clamp01((frame - cue3) / (cue4 - cue3));
    cameraScale = interpolate(p3, [0, 1], [1.22, 1.36]);
    cameraPanX = interpolate(p3, [0, 1], [-10, 55]);
    cameraPanY = interpolate(p3, [0, 1], [-20, 42]);
  } else {
    const holdFrames = 20;
    const p4 = clamp01((frame - (cue4 + holdFrames)) / Math.max(1, endWipe - (cue4 + holdFrames)));
    cameraScale = interpolate(p4, [0, 1], [1.36, 1.18]);
    cameraPanX = interpolate(p4, [0, 1], [55, 18]);
    cameraPanY = interpolate(p4, [0, 1], [42, 10]);
  }

  const strapConfig = {
    0: {
      tabLabel: 'INSTITUTIONAL ALERT',
      tabBg: COLORS.gold,
      tabColor: COLORS.ink,
      contextChip: 'NSE · CUMMINSIND',
      headline: '1.10M SHARES DEFEND KEY VALUE CORRIDOR',
      rightSource: 'SMART MONEY DEFENSE',
    },
    1: {
      tabLabel: 'LIQUIDATION',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: 'CASCADE EVENT',
      headline: 'MULTI-WEEK CASCADE BREACHES KEY MOVING AVERAGES',
      rightSource: 'SELLING EXHAUSTION',
    },
    2: {
      tabLabel: 'POC DEFENSE',
      tabBg: COLORS.gold,
      tabColor: COLORS.ink,
      contextChip: 'ABSORPTION CLUSTER',
      headline: '1.10M VOLUME SURGE AT MONTHLY POC ₹4,116.10',
      rightSource: 'DEMAND FLOOR CONFIRMED',
    },
    3: {
      tabLabel: '50 DEMA HURDLE',
      tabBg: COLORS.accent,
      tabColor: COLORS.ink,
      contextChip: 'MEAN REVERSION',
      headline: 'REBOUND +2.60% RECLAIMS 20 DEMA, TESTS 50 DEMA (₹4,368)',
      rightSource: 'CMP ₹4,369.00',
    },
    4: {
      tabLabel: 'EXPANSION PLAN',
      tabBg: COLORS.bullish,
      tabColor: COLORS.ink,
      contextChip: 'TACTICAL PLAYBOOK',
      headline: 'BREAKOUT ABOVE ₹4,370 TARGETS VAH CORRIDOR ₹4,648',
      rightSource: 'TARGET ₹4,648.24',
    },
  }[phase];

  const watermarkWord = {
    0: 'ACCUMULATION',
    1: 'LIQUIDATION',
    2: 'ABSORPTION',
    3: 'MEAN REVERSION',
    4: 'BREAKOUT',
  }[phase];

  const borderRotateDeg = (frame * 3.5) % 360;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07090C',
        overflow: 'hidden',
        transform: `scale(${introZoomScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. BACKGROUND AMBIENT GRID & WATERMARK CLIMAX WORD */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 45%, rgba(22, 28, 38, 0.55) 0%, rgba(7, 9, 12, 0.98) 85%)',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-6deg)',
          fontFamily: FONTS.display,
          fontSize: 128,
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
          <Img
            src={staticFile('charts/CUMMINSIND_MotionDoctrine_chart.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
            }}
          />

          {/* POC Golden Laser Beam (Phase 2+) */}
          {frame >= cue2 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '27.4%',
                height: 3.5,
                backgroundColor: '#F2CF1D',
                boxShadow:
                  '0 0 8px #F2CF1D, 0 0 20px #F2CF1D, 0 0 40px rgba(242, 207, 29, 0.7), 0 0 80px rgba(242, 207, 29, 0.35)',
                zIndex: 12,
                opacity: interpolate(clamp01((frame - cue2) / 12), [0, 1], [0, 1]),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 14,
                  bottom: 7,
                  backgroundColor: 'rgba(242, 207, 29, 0.96)',
                  color: '#121417',
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 5,
                  letterSpacing: '0.06em',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                }}
              >
                ★ POC ACCUMULATION: ₹4,116.10 (1.10M VOL)
              </div>
            </div>
          )}

          {/* Concentric Radar Pulse Ring at POC absorption cluster (Beat 2) */}
          {frame >= cue2 && frame < cue3 && (
            <div
              style={{
                position: 'absolute',
                left: '73.5%',
                bottom: '27.4%',
                transform: 'translate(-50%, 50%)',
                width: 24 + ((frame - cue2) * 5) % 90,
                height: 24 + ((frame - cue2) * 5) % 90,
                borderRadius: '50%',
                border: '2px solid rgba(242, 207, 29, 0.85)',
                opacity: 1 - (((frame - cue2) * 5) % 90) / 90,
                pointerEvents: 'none',
                zIndex: 14,
              }}
            />
          )}

          {/* 50 DEMA Target Laser Beam (Phase 3+) */}
          {frame >= cue3 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '47.8%',
                height: 3.5,
                backgroundColor: '#22D3EE',
                boxShadow:
                  '0 0 8px #22D3EE, 0 0 20px #22D3EE, 0 0 40px rgba(34, 211, 238, 0.7), 0 0 80px rgba(34, 211, 238, 0.35)',
                zIndex: 12,
                opacity: interpolate(clamp01((frame - cue3) / 14), [0, 1], [0, 1]),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  bottom: 7,
                  backgroundColor: 'rgba(34, 211, 238, 0.96)',
                  color: '#121417',
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 5,
                  letterSpacing: '0.06em',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                }}
              >
                🎯 50 DEMA HURDLE: ₹4,368.15 · CURRENT: ₹4,369.00
              </div>
            </div>
          )}

          {/* VAH Target Beam (Phase 4) */}
          {frame >= cue4 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '38.5%',
                height: 2.5,
                borderTop: '2px dashed #10B981',
                boxShadow: '0 0 16px #10B981',
                zIndex: 12,
                opacity: interpolate(clamp01((frame - cue4) / 12), [0, 1], [0, 1]),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 6,
                  backgroundColor: 'rgba(16, 185, 129, 0.96)',
                  color: '#FFFFFF',
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 5,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                }}
              >
                ▲ VAH EXPANSION CORRIDOR: ₹4,648.24
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. FLOATING TELEMETRY CHIPS */}
      {showHud && (
        <div
          style={{
            position: 'absolute',
            top: 136,
            left: 44,
            right: 44,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 35,
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
              style={{
                position: 'absolute',
                inset: -2.5,
                borderRadius: 14,
                background: `conic-gradient(from ${borderRotateDeg}deg, #10B981, #22D3EE, #F2CF1D, #10B981)`,
                filter: 'blur(4px)',
                zIndex: -1,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                backgroundColor: 'rgba(18, 20, 23, 0.95)',
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 12,
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 8px 26px rgba(0,0,0,0.7)',
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 12px #10B981',
                }}
              />
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: '#8B94A5', letterSpacing: '0.08em' }}>
                  CUMMINS INDIA · NSE
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                  ₹4,369.00 <span style={{ color: '#10B981', fontSize: 20 }}>+2.60%</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(18, 20, 23, 0.94)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(244, 241, 232, 0.18)',
              borderRadius: 12,
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontFamily: FONTS.mono,
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.65)',
            }}
          >
            <div style={{ color: '#F2CF1D', fontWeight: 800 }}>50 DEMA: ₹4,368.15</div>
            <div style={{ color: '#22D3EE', fontWeight: 800 }}>20 DEMA: ₹4,241.10</div>
          </div>
        </div>
      )}

      {/* 4. KINETIC BROADCAST CAPTIONS */}
      {showHud && (
        <KineticBroadcastCaptions
          chunks={manifest.chunks}
          frame={frame}
          fps={fps}
          vertical
          bottom={232}
        />
      )}

      {/* 5. NEWSROOM HUD STRAP & HEADER */}
      {showHud && (
        <>
          <ChannelBug
            frame={frame}
            fps={fps}
            leftBreadcrumb="CUMMINS INDIA · MOTION DOCTRINE"
            sessionBadge="NSE STUDY"
            vertical
          />
          <EducationalRibbon frame={frame} fps={fps} vertical />
          <LowerThirdStrap
            frame={frame}
            fps={fps}
            tabLabel={strapConfig.tabLabel}
            tabBg={strapConfig.tabBg}
            tabColor={strapConfig.tabColor}
            contextChip={strapConfig.contextChip}
            headline={strapConfig.headline}
            rightSource={strapConfig.rightSource}
            vertical
          />
        </>
      )}

      {/* 6. PATTERN INTERRUPT TRANSITIONS & FLASH CUTS */}
      <VerticalBandWipe frame={frame} startFrame={cue1 - 5} color={COLORS.gold} vertical />
      <VerticalBandWipe frame={frame} startFrame={cue2 - 5} color={COLORS.breaking} vertical />
      <VerticalBandWipe frame={frame} startFrame={cue3 - 5} color={COLORS.accent} vertical />
      <VerticalBandWipe frame={frame} startFrame={cue4 - 5} color={COLORS.cyan} vertical />
      <SlantedEndWipe frame={frame} startFrame={endWipe} fps={fps} vertical />

      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 60,
          }}
        />
      )}

      {/* End Card */}
      {frame >= endWipe + 6 && (
        <BroadcastEndCard
          frame={frame}
          startFrame={endWipe + 6}
          fps={fps}
          title="CUMMINS INDIA STUDY"
          subtitle="MOTION DOCTRINE · DEMA CONFLUENCE"
          bullet="POC ₹4,116 · 20 DEMA ₹4,241 · 50 DEMA ₹4,368"
          cta="SUBSCRIBE FOR DAILY LEVEL ANALYSIS"
          vertical
        />
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   FULL MASTER COMPOSITION WITH DEMA INTRO AND OUTRO (64.37s / 1931 frames)
   ========================================================================= */
export const CumminsMotionDoctrineReel = () => {
  return (
    <Series>
      {/* 1. Master DEMA Branded Intro Sting (3.5s = 105 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_INTRO_FRAMES}>
        <DemaIntro brand={brand} />
      </Series.Sequence>

      {/* 2. Cummins India Motion Doctrine Breakdown (55.87s = 1676 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_BODY_FRAMES}>
        <CumminsBreakdownCore />
      </Series.Sequence>

      {/* 3. Master DEMA Outro End Card (5.0s = 150 frames) */}
      <Series.Sequence durationInFrames={CUMMINS_OUTRO_FRAMES}>
        <DemaOutro brand={brand} showGuides={false} />
      </Series.Sequence>
    </Series>
  );
};
