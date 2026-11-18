import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import marketData from '../../public/data/dema_suite_20261113.json';

let audioManifest = {};
try {
  audioManifest = require('../../public/data/dema_pack_audio_manifest_20261113.json');
} catch (e) {
  try {
    audioManifest = require('../../public/data/dema_suite_audio_manifest_en.json');
  } catch (e2) {}
}

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
  SlantedStamp,
  SpecBarRow,
  SplitFlapChar,
  StingBrandPlate,
  VerticalBandWipe,
} from '../AdaniSuite/SharedNewsPackage';

const getTiming = (reelId) => {
  const m = audioManifest?.chapters?.[reelId] || audioManifest?.reels?.[reelId];
  if (m) {
    const totalFrames = m.frames_30fps || 900;
    if (m.cue_frames && m.cue_frames.length >= 3) {
      return {
        ...m,
        cue_frames: m.cue_frames,
        end_wipe_frame: m.end_wipe_frame || totalFrames - 45,
      };
    }
    const c1 = m.chunks?.[1]?.start_frame ?? Math.round(totalFrames * 0.35);
    const c2 = m.chunks?.[2]?.start_frame ?? Math.round(totalFrames * 0.70);
    return {
      ...m,
      cue_frames: [48, c1, c2],
      end_wipe_frame: m.end_wipe_frame || totalFrames - 45,
    };
  }
  const fallbacks = {
    reel_1_macro: { frames_30fps: 846, cue_frames: [48, 280, 560], end_wipe_frame: 801 },
    reel_2_losers: { frames_30fps: 819, cue_frames: [48, 270, 540], end_wipe_frame: 774 },
    reel_3_gainers: { frames_30fps: 822, cue_frames: [48, 270, 540], end_wipe_frame: 777 },
    reel_4_momentum: { frames_30fps: 756, cue_frames: [48, 250, 500], end_wipe_frame: 711 },
    reel_5_itc: { frames_30fps: 846, cue_frames: [48, 280, 560], end_wipe_frame: 801 },
    reel_6_adanient: { frames_30fps: 729, cue_frames: [48, 240, 480], end_wipe_frame: 684 },
    reel_7_cochinship: { frames_30fps: 753, cue_frames: [48, 250, 500], end_wipe_frame: 708 },
    reel_8_goldbees: { frames_30fps: 747, cue_frames: [48, 250, 500], end_wipe_frame: 702 },
  };
  return fallbacks[reelId] || { frames_30fps: 800, cue_frames: [48, 260, 520], end_wipe_frame: 755 };
};

/* ---------- Generic Vertical Frame Shell (9:16 - 1080x1920) ---------- */
const VerticalReelShell = ({
  reelId,
  stingKicker,
  stingTitle,
  leftBreadcrumb,
  strapHero,
  strapChart,
  renderHeroShot,
  renderBreakdownShot,
  endTitle,
  endSubtitle,
  endBullet,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getTiming(reelId);
  const c2 = timing.cue_frames[2] ?? 480;
  const endWipe = timing.end_wipe_frame ?? timing.frames_30fps - 75;

  const showHud = frame >= 45 && frame < endWipe + 6;
  const isBreakdown = frame >= c2;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@500;600;700;800&display=swap');
      `}</style>

      {/* Grid Pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
        }}
      />

      {/* Opening Sting (0-45 frames) */}
      {frame < 45 && (
        <StingBrandPlate
          frame={frame}
          fps={fps}
          kicker={stingKicker}
          title={stingTitle}
          subTag="TECHNICAL CHART EDUCATION ONLY"
          vertical
        />
      )}

      {/* Hero Content (45 to c2) */}
      {frame >= 45 && frame < c2 && renderHeroShot({ frame, fps, timing })}

      {/* Breakdown Shot (c2 to endWipe) */}
      {frame >= c2 && frame < endWipe + 6 && renderBreakdownShot({ frame, fps, timing })}

      {/* End Card */}
      {frame >= endWipe + 6 && (
        <BroadcastEndCard
          frame={frame}
          startFrame={endWipe + 6}
          fps={fps}
          title={endTitle}
          subtitle={endSubtitle}
          bullet={endBullet}
          cta="SUBSCRIBE FOR DAILY REELS"
          vertical
        />
      )}

      {/* Wipe between Hero and Breakdown */}
      <VerticalBandWipe frame={frame} startFrame={c2 - 6} color={COLORS.accent} vertical />
      <SlantedEndWipe frame={frame} startFrame={endWipe} fps={fps} vertical />

      {/* Newsroom HUD Overlays */}
      {showHud && (
        <>
          <ChannelBug
            frame={frame}
            fps={fps}
            leftBreadcrumb={leftBreadcrumb}
            sessionBadge="NSE STUDY"
            vertical
          />
          <EducationalRibbon frame={frame} fps={fps} vertical />
          <KineticBroadcastCaptions
            reelId={reelId}
            frame={frame}
            fps={fps}
            manifest={audioManifest}
            vertical
          />
          <LowerThirdStrap
            frame={frame}
            fps={fps}
            tabLabel={isBreakdown ? strapChart.tabLabel : strapHero.tabLabel}
            tabBg={isBreakdown ? strapChart.tabBg : strapHero.tabBg}
            tabColor={isBreakdown ? strapChart.tabColor : strapHero.tabColor}
            contextChip={isBreakdown ? strapChart.contextChip : strapHero.contextChip}
            headline={isBreakdown ? strapChart.headline : strapHero.headline}
            rightSource={isBreakdown ? strapChart.rightSource : strapHero.rightSource}
            vertical
          />
        </>
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   REEL 1: DAILY MACRO PULSE (9:16)
   ========================================================================= */
export const Reel1Macro = () => {
  const nifty = marketData.market_summary[0];
  const gold = marketData.market_summary[1];
  const silver = marketData.market_summary[2];
  const crudeBrent = marketData.market_summary[4];
  const dateStr = marketData.date ? marketData.date.toUpperCase() : 'NOV 18';

  // Dynamic split flap for Nifty 50
  const prevNum = nifty.prevClose ? nifty.prevClose.replace(/[^0-9.]/g, '') : '25291.10';
  const currNum = nifty.ltp ? nifty.ltp.replace(/[^0-9.]/g, '') : '25387.40';

  const formatWithCommas = (str) => {
    const parts = str.split('.');
    const intPart = parts[0];
    const decPart = parts.length > 1 ? '.' + parts[1] : '';
    let formatted = '';
    if (intPart.length > 3) {
      formatted = intPart.slice(0, intPart.length - 3) + ',' + intPart.slice(intPart.length - 3);
    } else {
      formatted = intPart;
    }
    return formatted + decPart;
  };

  const formattedPrev = formatWithCommas(prevNum);
  const formattedCurr = formatWithCommas(currNum);

  const niftyTiles = formattedCurr.split('').map((toCh, i) => {
    const fromCh = formattedPrev[i] || toCh;
    return {
      from: fromCh,
      to: toCh,
      flipAt: 55 + i * 5,
      hi: true,
      w: toCh === '.' || toCh === ',' ? 28 : 68,
    };
  });

  return (
    <VerticalReelShell
      reelId="reel_1_macro"
      stingKicker="REEL 1 · DAILY MACRO PULSE"
      stingTitle="GLOBAL & NIFTY 50"
      leftBreadcrumb={`MACRO BENCHMARK · ${dateStr}`}
      strapHero={{
        tabLabel: 'NIFTY 50',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'NSE INDEX REBOUND',
        headline: `NIFTY 50 ADVANCES ${nifty.pct} (${nifty.change_num > 0 ? '+' : ''}${nifty.change_num} PTS) TO ${nifty.ltp}`,
        rightSource: `RANGE ${nifty.range} · PREV ${nifty.prevClose}`,
      }}
      strapChart={{
        tabLabel: 'COMMODITIES',
        tabBg: COLORS.gold,
        tabColor: COLORS.ink,
        contextChip: 'METALS & CRUDE',
        headline: `GOLD ${gold.ltp} (${gold.pct}) · SILVER ${silver.ltp} (${silver.pct}) · BRENT ${crudeBrent.ltp}`,
        rightSource: `SILVER RANGE ${silver.range}`,
      }}
      endTitle="DAILY MACRO PULSE"
      endSubtitle={`DAILY TELEVISION BRIEF · ${dateStr}`}
      endBullet="NIFTY 50 · GOLD · SILVER · CRUDE"
      renderHeroShot={({ frame, fps }) => {
        const local = frame - 45;
        const cardIn = spring({ frame: local, fps, config: { damping: 16, stiffness: 150 } });
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center' }}>
            <div
              style={{
                backgroundColor: COLORS.ink2,
                border: `2px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: '36px 32px',
                transform: `translateY(${interpolate(cardIn, [0, 1], [30, 0])}px)`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>NIFTY 50 · NSE</span>
                <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.bullishBright }}>
                  {nifty.change || '+96.30 (+0.38%)'}
                </span>
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 58, color: COLORS.paper, marginTop: 4 }}>
                INDIA BENCHMARK
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18 }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 54, color: COLORS.gold }}>₹</span>
                {niftyTiles.map((t, i) => (
                  <SplitFlapChar
                    key={i}
                    fromChar={t.from}
                    toChar={t.to}
                    flipFrame={t.flipAt}
                    frame={frame}
                    width={t.w ?? 68}
                    height={108}
                    highlight={t.hi}
                    vertical
                  />
                ))}
              </div>

              <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: COLORS.ink3, borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>SESSION LOW</div>
                  <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.breaking, marginTop: 4 }}>
                    {nifty.low}
                  </div>
                </div>
                <div style={{ backgroundColor: COLORS.ink3, borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>SESSION HIGH</div>
                  <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.bullishBright, marginTop: 4 }}>
                    {nifty.high}
                  </div>
                </div>
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
      renderBreakdownShot={({ frame, fps, timing }) => {
        const local = frame - (timing.cue_frames[2] ?? 480);
        const commodities = marketData.market_summary.slice(1);
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.paper }}>
              GLOBAL COMMODITIES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {commodities.map((item, idx) => (
                <SpecBarRow
                  key={item.id}
                  label={`${item.name} · ${item.price}`}
                  subLabel={`Range: ${item.range} · Prev: ${item.prevClose}`}
                  valueText={item.change}
                  barColor={item.bullish || item.pct_num >= 0 ? COLORS.bullishBright : COLORS.breaking}
                  pct={item.bullish || item.pct_num >= 0 ? 0.65 : Math.min(1, Math.abs(item.pct_num || 0) / 2.2)}
                  anim={clamp01((local - idx * 7) / 12)}
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      }}
    />
  );
};

/* =========================================================================
   REEL 2: TOP LOSERS (9:16)
   ========================================================================= */
export const Reel2Losers = () => {
  const losers = marketData.top_losers || [];
  const top1 = losers[0] || { symbol: 'HCLTECH', ltp: '₹1,355.70', pct: -2.09 };
  const top2 = losers[1] || { symbol: 'WIPRO', ltp: '₹189.89', pct: -1.89 };
  const rest = losers.slice(2).map((l) => `${l.symbol} ${l.pct.toFixed(2)}%`).join(' · ');
  const bullet = losers.map((l) => l.symbol).join(' · ');

  return (
    <VerticalReelShell
      reelId="reel_2_losers"
      stingKicker="REEL 2 · DAILY DRAGS"
      stingTitle="TOP 5 LOSERS"
      leftBreadcrumb="SELLING PRESSURE · NOV 18"
      strapHero={{
        tabLabel: 'TOP LOSERS',
        tabBg: COLORS.breaking,
        tabColor: COLORS.ink,
        contextChip: 'NIFTY 50 DRAGS',
        headline: `${top1.symbol} ${top1.pct.toFixed(2)}% (${top1.ltp}) · ${top2.symbol} ${top2.pct.toFixed(2)}% (${top2.ltp})`,
        rightSource: rest || 'DEMA ANALYSIS RADAR',
      }}
      strapChart={{
        tabLabel: 'KEY SUPPORT',
        tabBg: COLORS.breaking,
        tabColor: COLORS.ink,
        contextChip: 'BROKEN 20 DEMA',
        headline: `${top1.symbol} BELOW 20 DEMA · ${top2.symbol} TESTS MONTH POC SUPPORT FLOOR`,
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle="TOP LOSERS WRAP"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 18"
      endBullet={bullet || 'HCLTECH · WIPRO · POWERGRID · HDFCLIFE · ONGC'}
      renderHeroShot={({ frame, fps }) => {
        const local = frame - 45;
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.paper }}>
                TOP 5 MARKET LOSERS
              </div>
              <SlantedStamp text="PRESSURE" color={COLORS.breaking} frame={frame} startFrame={55} fps={fps} size={38} vertical />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {losers.map((item, idx) => (
                <SpecBarRow
                  key={item.symbol}
                  label={`${idx + 1}. ${item.symbol} · LTP ${item.ltp}`}
                  subLabel={`${item.dema} · RSI(14): ${item.rsi}`}
                  valueText={`${item.pct.toFixed(2)}%`}
                  barColor={COLORS.breaking}
                  pct={Math.min(1, Math.abs(item.pct) / 2.5)}
                  anim={clamp01((local - idx * 7) / 12)}
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      }}
      renderBreakdownShot={({ frame, fps, timing }) => {
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center' }}>
            <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.breaking}`, borderRadius: 20, padding: '36px 32px' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>BIGGEST DRAG</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 62, color: COLORS.paper, marginTop: 4 }}>
                {top1.symbol} ({top1.ltp})
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: COLORS.breaking, marginTop: 8 }}>
                {top1.pct.toFixed(2)}% SLIPPAGE
              </div>
              <div style={{ fontFamily: FONTS.ui, fontSize: 20, color: '#D3D7DF', lineHeight: 1.5, marginTop: 18 }}>
                Breached its short-term 20 DEMA support amidst broad technology sector distribution. Wipro and Power Grid also saw profit taking.
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
    />
  );
};

/* =========================================================================
   REEL 3: TOP GAINERS (9:16)
   ========================================================================= */
export const Reel3Gainers = () => {
  const gainers = marketData.top_gainers || [];
  const top1 = gainers[0] || { symbol: 'ADANIENT', ltp: '₹2,745.10', pct: 3.24, rsi: 54.2 };
  const top2 = gainers[1] || { symbol: 'EICHERMOT', ltp: '₹7,828.00', pct: 3.01 };
  const rest = gainers.slice(2).map((g) => `${g.symbol} +${g.pct.toFixed(2)}%`).join(' · ');
  const bullet = gainers.map((g) => g.symbol).join(' · ');

  return (
    <VerticalReelShell
      reelId="reel_3_gainers"
      stingKicker="REEL 3 · MARKET LEADERS"
      stingTitle="TOP 5 GAINERS"
      leftBreadcrumb="OUTPERFORMERS · NOV 18"
      strapHero={{
        tabLabel: 'TOP GAINERS',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'ABOVE 20 DEMA',
        headline: `${top1.symbol} +${top1.pct.toFixed(2)}% (${top1.ltp}) · ${top2.symbol} +${top2.pct.toFixed(2)}% (${top2.ltp})`,
        rightSource: rest || 'DEMA ANALYSIS RADAR',
      }}
      strapChart={{
        tabLabel: 'BREAKOUT',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'MOMENTUM LEADERS',
        headline: `${top1.symbol} RSI ${top1.rsi} · ${top2.symbol} FRESH ACCUMULATION ABOVE 20 DEMA`,
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle="TOP GAINERS WRAP"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 18"
      endBullet={bullet || 'ADANIENT · EICHERMOT · ASIANPAINT · AXISBANK · INDUSINDBK'}
      renderHeroShot={({ frame, fps }) => {
        const local = frame - 45;
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.paper }}>
                TOP 5 MARKET GAINERS
              </div>
              <SlantedStamp text="MOMENTUM" color={COLORS.bullishBright} frame={frame} startFrame={55} fps={fps} size={38} vertical />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {gainers.map((item, idx) => (
                <SpecBarRow
                  key={item.symbol}
                  label={`${idx + 1}. ${item.symbol} · LTP ${item.ltp}`}
                  subLabel={`${item.dema} · RSI(14): ${item.rsi}`}
                  valueText={`+${item.pct.toFixed(2)}%`}
                  barColor={COLORS.bullishBright}
                  pct={Math.max(0.35, item.pct / 3.5)}
                  anim={clamp01((local - idx * 7) / 12)}
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      }}
      renderBreakdownShot={({ frame, fps, timing }) => {
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center' }}>
            <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.bullishBright}`, borderRadius: 20, padding: '36px 32px' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>TOP PERFORMER</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 62, color: COLORS.paper, marginTop: 4 }}>
                {top1.symbol} ({top1.ltp})
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: COLORS.bullishBright, marginTop: 8 }}>
                +{top1.pct.toFixed(2)}% SURGE · RSI {top1.rsi}
              </div>
              <div style={{ fontFamily: FONTS.ui, fontSize: 20, color: '#D3D7DF', lineHeight: 1.5, marginTop: 18 }}>
                Leading the rally alongside Eicher Motors (+3.01%). All top five counters holding cleanly above rising 20 DEMA support floors.
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
    />
  );
};

/* =========================================================================
   REEL 4: HIGH-VOLUME & MOMENTUM (9:16)
   ========================================================================= */
export const Reel4Momentum = () => {
  const momentum = marketData.momentum_stocks || [];
  const top1 = momentum[0] || { symbol: 'RELIANCE', ltp: '₹1,367.00', pct: 1.65, volume: '15.86 M', rsi: 74.7 };
  const top2 = momentum[1] || { symbol: 'SBIN', ltp: '₹1,108.60', pct: 1.66, volume: '16.31 M', rsi: 76.3 };
  const rest = momentum.slice(2).map((m) => `${m.symbol} ${m.volume}`).join(' · ');
  const bullet = momentum.map((m) => m.symbol).join(' · ');

  return (
    <VerticalReelShell
      reelId="reel_4_momentum"
      stingKicker="REEL 4 · ORDER FLOW RADAR"
      stingTitle="HIGH-VOLUME RADAR"
      leftBreadcrumb="INSTITUTIONAL LIQUIDITY"
      strapHero={{
        tabLabel: 'LIQUIDITY',
        tabBg: COLORS.cyan,
        tabColor: COLORS.ink,
        contextChip: 'MASSIVE ORDER FLOW',
        headline: `${top1.symbol} ${top1.volume} VOL (RSI ${top1.rsi}) · ${top2.symbol} ${top2.volume}`,
        rightSource: rest || 'DEMA ANALYSIS RADAR',
      }}
      strapChart={{
        tabLabel: 'TURNOVER',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'HEAVY ACCUMULATION',
        headline: `${top1.symbol} ABSORBS OVER 15M SHARES · ${top2.symbol} POSTS HIGH-CONVICTION BREAKOUT`,
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle="VOLUME RADAR"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 18"
      endBullet={bullet || 'RELIANCE · SBIN · ICICIBANK · AXISBANK · ADANIENT'}
      renderHeroShot={({ frame, fps }) => {
        const local = frame - 45;
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.paper }}>
                HIGH-VOLUME LIQUIDITY
              </div>
              <SlantedStamp text="SURGE" color={COLORS.cyan} frame={frame} startFrame={55} fps={fps} size={38} vertical />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {momentum.map((item, idx) => (
                <SpecBarRow
                  key={item.symbol}
                  label={`${idx + 1}. ${item.symbol} · LTP ${item.ltp}`}
                  subLabel={`Vol: ${item.volume} · ${item.dema} · RSI: ${item.rsi}`}
                  valueText={`${item.pct > 0 ? '+' : ''}${item.pct.toFixed(2)}%`}
                  barColor={item.pct < 0 ? COLORS.breaking : COLORS.cyan}
                  pct={0.78}
                  anim={clamp01((local - idx * 7) / 12)}
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      }}
      renderBreakdownShot={({ frame, fps, timing }) => {
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center' }}>
            <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.cyan}`, borderRadius: 20, padding: '36px 32px' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>VOLUME LEADER</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 62, color: COLORS.paper, marginTop: 4 }}>
                {top1.symbol} ({top1.volume} VOL)
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: COLORS.cyan, marginTop: 8 }}>
                LTP {top1.ltp} · RSI {top1.rsi}
              </div>
              <div style={{ fontFamily: FONTS.ui, fontSize: 20, color: '#D3D7DF', lineHeight: 1.5, marginTop: 18 }}>
                Absorbed over 15.8M shares of turnover while holding bullish moving average posture. Institutional liquidity highly active.
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
    />
  );
};

/* =========================================================================
   GENERIC STOCK VERTICAL REEL (REELS 5 TO 10)
   Synchronized 4-Beat Architecture:
   - Chunk 0 (c0-c1): Session Overview, CMP, Net Change & OI
   - Chunk 1 (c1-c2): 20 DEMA Defense & RSI(14) Momentum
   - Chunk 2 (c2-c3): 50 DEMA Overhead Hurdle & Volume Profile (POC/VAH/VAL)
   - Chunk 3 (c3-endWipe): Invalidation Level, Key Risk Rules & Compliance
   - Full Unclipped TradingView Chart (<Img objectFit="contain" />)
   ========================================================================= */
const VerticalStockReel = ({
  reelId,
  stockKey,
  reelNum,
  stingKicker,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stock = marketData.deep_dive_stocks[stockKey] || {};
  const pctNum = typeof stock.pct === 'number' ? stock.pct : parseFloat(stock.changeStr || '0');
  const isBullish = pctNum >= 0;
  const themeColor = isBullish ? COLORS.bullishBright : COLORS.breaking;

  const ltpStr = typeof stock.ltp === 'number' ? `₹${stock.ltp.toFixed(2)}` : String(stock.ltp || '');
  const changeStr = stock.changeStr || '';
  const volStr = stock.volume || stock.vol || '';
  const oiStr = stock.oiSentiment || stock.oi || '85% Long Buildup';
  const companyName = stock.company || stock.name || stock.symbol;

  const dema20Str = typeof stock.dema20 === 'number' ? `₹${stock.dema20.toFixed(2)}` : String(stock.dema20 || '');
  const dema50Str = typeof stock.dema50 === 'number' ? `₹${stock.dema50.toFixed(2)}` : String(stock.dema50 || '');
  const dema100Str = typeof stock.dema100 === 'number' ? `₹${stock.dema100.toFixed(2)}` : String(stock.dema100 || '');
  const dema200Str = typeof stock.dema200 === 'number' ? `₹${stock.dema200.toFixed(2)}` : String(stock.dema200 || '');
  const rsiVal = typeof stock.rsi14 === 'number' ? stock.rsi14 : parseFloat(stock.rsi || '50.0');
  const rsiStr = rsiVal.toFixed(1);
  const pocStr = typeof stock.poc === 'number' ? `₹${stock.poc.toFixed(2)}` : String(stock.poc || '');
  const vahStr = typeof stock.vah === 'number' ? `₹${stock.vah.toFixed(2)}` : String(stock.vah || '');
  const valStr = typeof stock.val === 'number' ? `₹${stock.val.toFixed(2)}` : String(stock.val || '');
  const chartImg = stock.image || stock.chartImage || 'charts/NETWEB_1D_chart.png';

  const timing = getTiming(reelId);
  const totalFrames = timing.frames_30fps || 1200;
  const c0 = timing.chunks?.[0]?.start_frame ?? 36;
  const c1 = timing.chunks?.[1]?.start_frame ?? 330;
  const c2 = timing.chunks?.[2]?.start_frame ?? 630;
  const c3 = timing.chunks?.[3]?.start_frame ?? 930;
  const endWipe = timing.end_wipe_frame ?? totalFrames - 75;

  const isBeat0 = frame >= 45 && frame < c1;
  const isBeat1 = frame >= c1 && frame < c2;
  const isBeat2 = frame >= c2 && frame < c3;
  const isBeat3 = frame >= c3 && frame < endWipe + 6;
  const isEndCard = frame >= endWipe + 6;
  const showHud = frame >= 45 && frame < endWipe + 6;

  // Dynamic strap values synced with each chunk
  let strapData = {
    tabLabel: 'SESSION CMP',
    tabBg: themeColor,
    tabColor: COLORS.ink,
    contextChip: '1D TELEMETRY',
    headline: `${stock.symbol} TRADES AT ${ltpStr} (${changeStr}) · VOL ${volStr}`,
    rightSource: `OI: ${oiStr}`,
  };

  if (isBeat1) {
    strapData = {
      tabLabel: 'DEMA SUPPORT',
      tabBg: COLORS.cyan,
      tabColor: COLORS.ink,
      contextChip: '20 DEMA DEFENSE',
      headline: `DEFENDING 20 DEMA AT ${dema20Str} · RSI(14) MOMENTUM AT ${rsiStr}`,
      rightSource: 'DEMA RADAR',
    };
  } else if (isBeat2) {
    strapData = {
      tabLabel: 'VOLUME PROFILE',
      tabBg: COLORS.gold,
      tabColor: COLORS.ink,
      contextChip: `POC ${pocStr}`,
      headline: `50 DEMA HURDLE ${dema50Str} · MONTHLY VAH ${vahStr} · VAL ${valStr}`,
      rightSource: 'INSTITUTIONAL VP',
    };
  } else if (isBeat3) {
    strapData = {
      tabLabel: 'COMPLIANCE',
      tabBg: COLORS.breaking,
      tabColor: COLORS.ink,
      contextChip: 'EDUCATIONAL ONLY',
      headline: `SUPPORT FLOOR ${dema20Str || valStr} · TECHNICAL CHART STUDY ONLY · NO TIPS`,
      rightSource: 'DEMA ANALYSIS',
    };
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@500;600;700;800&display=swap');
      `}</style>

      {/* Grid Pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
        }}
      />

      {/* Opening Sting (0-45 frames) */}
      {frame < 45 && (
        <StingBrandPlate
          frame={frame}
          fps={fps}
          kicker={stingKicker}
          title={stock.symbol}
          subTag="TECHNICAL CHART EDUCATION ONLY"
          vertical
        />
      )}

      {/* MAIN CONTENT (frame 45 to endWipe + 6) */}
      {showHud && (
        <AbsoluteFill style={{ padding: '130px 40px 220px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 1. TOP STOCK TELEMETRY CARD */}
          <div
            style={{
              backgroundColor: COLORS.ink2,
              border: `2px solid ${themeColor}`,
              borderRadius: 16,
              padding: '16px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.gold, letterSpacing: '0.06em' }}>
                {stock.symbol} · {companyName}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4 }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 50, color: COLORS.paper, lineHeight: 1 }}>
                  {ltpStr}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 24,
                    color: COLORS.ink,
                    backgroundColor: themeColor,
                    padding: '3px 10px',
                    borderRadius: 6,
                    lineHeight: 1,
                  }}
                >
                  {changeStr}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>VOLUME / OI</div>
              <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, color: COLORS.cyan, marginTop: 2 }}>
                {volStr}
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: themeColor, marginTop: 2 }}>
                {oiStr}
              </div>
            </div>
          </div>

          {/* 2. HERO TRADINGVIEW CHART CONTAINER (Guaranteed 100% UNCLIPPED & FULLY VISIBLE) */}
          <div
            style={{
              backgroundColor: '#090C11',
              border: '2px solid rgba(244, 241, 232, 0.22)',
              borderRadius: 16,
              overflow: 'hidden',
              height: 590,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            }}
          >
            {/* Chart Bezel Header */}
            <div
              style={{
                height: 38,
                backgroundColor: 'rgba(18, 20, 23, 0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 16px',
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.gold, fontWeight: 700 }}>
                TRADINGVIEW · {stock.symbol} 1D CANDLESTICK & VOLUME PROFILE
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: themeColor, fontWeight: 700 }}>
                ● CMP {ltpStr}
              </div>
            </div>

            {/* Unclipped Chart Image */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#090C11' }}>
              <Img
                src={staticFile(chartImg)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center center',
                }}
              />

              {/* Dynamic Floating HUD Pill Synced with Voice */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  backgroundColor: 'rgba(10, 14, 20, 0.92)',
                  border: `1.5px solid ${isBeat1 ? COLORS.cyan : isBeat2 ? COLORS.gold : isBeat3 ? COLORS.breaking : themeColor}`,
                  borderRadius: 8,
                  padding: '6px 14px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.7)',
                }}
              >
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.gold }}>
                  {isBeat0 ? 'BEAT 1 · SESSION CLOSE' : isBeat1 ? 'BEAT 2 · DEMA FLOOR' : isBeat2 ? 'BEAT 3 · RESISTANCE & VP' : 'BEAT 4 · TECHNICAL RISK'}
                </div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.paper, marginTop: 2 }}>
                  {isBeat0 && `CMP: ${ltpStr} · ${stock.structure}`}
                  {isBeat1 && `20 DEMA: ${dema20Str} · RSI(14): ${rsiStr}`}
                  {isBeat2 && `50 DEMA: ${dema50Str} · POC: ${pocStr}`}
                  {isBeat3 && `SUPPORT: ${dema20Str || valStr} · RISK MANAGED`}
                </div>
              </div>
            </div>
          </div>

          {/* 3. LOWER INTERACTIVE TECH SHELF (Synced with 4 Chunks) */}
          <div
            style={{
              flex: 1,
              backgroundColor: COLORS.ink2,
              border: `2px solid ${isBeat2 ? COLORS.gold : isBeat1 ? COLORS.cyan : COLORS.border}`,
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            }}
          >
            {/* BEAT 0: Session OHLC & Breadth */}
            {isBeat0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.gold, fontWeight: 700 }}>
                    1. SESSION OHLC & BREADTH TELEMETRY
                  </div>
                  <SlantedStamp text="REBOUND" color={themeColor} frame={frame} startFrame={50} fps={fps} size={30} vertical />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>OPEN</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, color: COLORS.paper, marginTop: 2 }}>
                      ₹{stock.open?.toFixed(2) || ltpStr}
                    </div>
                  </div>
                  <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.bullishBright, marginTop: 2 }}>
                      DAY HIGH
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, color: COLORS.bullishBright, marginTop: 2 }}>
                      ₹{stock.high?.toFixed(2) || ltpStr}
                    </div>
                  </div>
                  <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.breaking, marginTop: 2 }}>
                      DAY LOW
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, color: COLORS.breaking, marginTop: 2 }}>
                      ₹{stock.low?.toFixed(2) || ltpStr}
                    </div>
                  </div>
                  <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>PREV CLOSE</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, color: COLORS.muted, marginTop: 2 }}>
                      ₹{stock.prevClose?.toFixed(2) || ltpStr}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: FONTS.ui, fontSize: 16, color: '#D3D7DF', lineHeight: 1.45 }}>
                  {stock.symbol} closed session at {ltpStr}. {stock.verdict}
                </div>
              </div>
            )}

            {/* BEAT 1: DEMA Stack & RSI Momentum */}
            {isBeat1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.cyan, fontWeight: 700 }}>
                    2. DEMA LADDER & RSI(14) MOMENTUM
                  </div>
                  <SlantedStamp text="20 DEMA FLOOR" color={COLORS.cyan} frame={frame} startFrame={c1} fps={fps} size={30} vertical />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SpecBarRow
                    label="20 DEMA (Short-Term Floor)"
                    subLabel="Immediate Dynamic Baseline"
                    valueText={dema20Str}
                    barColor={COLORS.cyan}
                    pct={0.88}
                    anim={1}
                    compact
                  />
                  <SpecBarRow
                    label="50 DEMA (Intermediate Hurdle)"
                    subLabel="Secondary Trend Overhead"
                    valueText={dema50Str}
                    barColor={COLORS.gold}
                    pct={0.72}
                    anim={1}
                    compact
                  />
                  <SpecBarRow
                    label="200 DEMA (Institutional Base)"
                    subLabel="Long-Term Structural Anchor"
                    valueText={dema200Str}
                    barColor={COLORS.breaking}
                    pct={0.55}
                    anim={1}
                    compact
                  />
                </div>

                <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>RSI(14) MOMENTUM:</span>
                  <span style={{ fontFamily: FONTS.mono, fontWeight: 800, fontSize: 17, color: rsiVal <= 35 ? COLORS.breaking : rsiVal >= 70 ? COLORS.bullishBright : COLORS.cyan }}>
                    {rsiStr} ({rsiVal <= 35 ? 'DEEP OVERSOLD' : rsiVal >= 70 ? 'OVERBOUGHT SQUEEZE' : 'BALANCED ACCUMULATION'})
                  </span>
                </div>
              </div>
            )}

            {/* BEAT 2: Monthly Volume Profile */}
            {isBeat2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.gold, fontWeight: 700 }}>
                    3. MONTHLY VOLUME PROFILE FOOTPRINT
                  </div>
                  <SlantedStamp text="POC ALIGNMENT" color={COLORS.gold} frame={frame} startFrame={c2} fps={fps} size={30} vertical />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div style={{ backgroundColor: COLORS.ink3, border: `1.5px solid ${COLORS.gold}`, borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.gold, fontWeight: 700 }}>POC</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 800, fontSize: 18, color: COLORS.paper, marginTop: 4 }}>
                      {pocStr}
                    </div>
                    <div style={{ fontFamily: FONTS.ui, fontSize: 10, color: COLORS.muted, marginTop: 2 }}>Max Volume</div>
                  </div>
                  <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.bullishBright, fontWeight: 700 }}>VAH</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 800, fontSize: 18, color: COLORS.bullishBright, marginTop: 4 }}>
                      {vahStr}
                    </div>
                    <div style={{ fontFamily: FONTS.ui, fontSize: 10, color: COLORS.muted, marginTop: 2 }}>Value High</div>
                  </div>
                  <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.breaking, fontWeight: 700 }}>VAL</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 800, fontSize: 18, color: COLORS.breaking, marginTop: 4 }}>
                      {valStr}
                    </div>
                    <div style={{ fontFamily: FONTS.ui, fontSize: 10, color: COLORS.muted, marginTop: 2 }}>Value Low</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(212, 176, 100, 0.12)', borderLeft: `3px solid ${COLORS.gold}`, padding: '10px 14px', borderRadius: 4 }}>
                  <div style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.paper, lineHeight: 1.4 }}>
                    {stock.verdict}
                  </div>
                </div>
              </div>
            )}

            {/* BEAT 3: Risk Invalidation & Compliance Notice */}
            {isBeat3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.breaking, fontWeight: 700 }}>
                    4. TECHNICAL RISK BOUNDARY & RECAP
                  </div>
                  <SlantedStamp text="STUDY ONLY" color={COLORS.breaking} frame={frame} startFrame={c3} fps={fps} size={30} vertical />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ backgroundColor: COLORS.ink3, border: `1px solid ${COLORS.cyan}`, borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.cyan }}>SUPPORT FLOOR</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 800, fontSize: 20, color: COLORS.paper, marginTop: 4 }}>
                      {dema20Str || valStr}
                    </div>
                    <div style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Invalidation Shelf</div>
                  </div>
                  <div style={{ backgroundColor: COLORS.ink3, border: `1px solid ${COLORS.gold}`, borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.gold }}>OVERHEAD HURDLE</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 800, fontSize: 20, color: COLORS.paper, marginTop: 4 }}>
                      {dema50Str || vahStr}
                    </div>
                    <div style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Breakout Confirmation</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(254, 107, 61, 0.12)', border: `1px solid ${COLORS.breaking}`, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.breaking, fontWeight: 700 }}>
                    MANDATORY REGULATORY COMPLIANCE
                  </div>
                  <div style={{ fontFamily: FONTS.ui, fontSize: 13, color: '#D3D7DF', marginTop: 4, lineHeight: 1.4 }}>
                    Strictly educational technical chart analysis. Not SEBI registered. No financial advice or buy/sell calls.
                  </div>
                </div>
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* Dynamic Band Wipe between Bezel and End Card */}
      <SlantedEndWipe frame={frame} startFrame={endWipe} fps={fps} vertical />

      {/* Broadcast End Card */}
      {isEndCard && (
        <BroadcastEndCard
          frame={frame}
          startFrame={endWipe + 6}
          fps={fps}
          title={stock.symbol}
          subtitle={`DAILY TECHNICAL STUDY · NOV 18`}
          bullet={`20 DEMA ${dema20Str} · POC ${pocStr} · VAH ${vahStr}`}
          cta="SUBSCRIBE FOR DAILY REELS"
          vertical
        />
      )}

      {/* Newsroom HUD Overlays */}
      {showHud && (
        <>
          <ChannelBug
            frame={frame}
            fps={fps}
            leftBreadcrumb={`CHART STUDY · NOV 18`}
            sessionBadge="NSE STUDY"
            vertical
          />
          <EducationalRibbon frame={frame} fps={fps} vertical />
          <KineticBroadcastCaptions
            reelId={reelId}
            frame={frame}
            fps={fps}
            manifest={audioManifest}
            vertical
          />
          <LowerThirdStrap
            frame={frame}
            fps={fps}
            tabLabel={strapData.tabLabel}
            tabBg={strapData.tabBg}
            tabColor={strapData.tabColor}
            contextChip={strapData.contextChip}
            headline={strapData.headline}
            rightSource={strapData.rightSource}
            vertical
          />
        </>
      )}
    </AbsoluteFill>
  );
};

/* REEL 5: NETWEB */
export const Reel5Firstcry = () => (
  <VerticalStockReel
    reelId="reel_5_firstcry"
    stockKey="netweb"
    reelNum={5}
    stingKicker="REEL 5 · NETWEB REBOUND STUDY"
  />
);

/* REEL 6: MANAPPURAM */
export const Reel6Techm = () => (
  <VerticalStockReel
    reelId="reel_6_techm"
    stockKey="manappuram"
    reelNum={6}
    stingKicker="REEL 6 · MANAPPURAM VAL DEFENSE"
  />
);

/* REEL 7: V2 RETAIL */
export const Reel7Ongc = () => (
  <VerticalStockReel
    reelId="reel_7_ongc"
    stockKey="v2retail"
    reelNum={7}
    stingKicker="REEL 7 · V2 RETAIL 101M TURNOVER"
  />
);

/* REEL 8: SILVERBEES */
export const Reel8Tatapower = () => (
  <VerticalStockReel
    reelId="reel_8_tatapower"
    stockKey="silverbees"
    reelNum={8}
    stingKicker="REEL 8 · SILVERBEES RSI 22 OVERSOLD"
  />
);

export const Reel5Netweb = Reel5Firstcry;
export const Reel6Manappuram = Reel6Techm;
export const Reel7V2retail = Reel7Ongc;
export const Reel8Silverbees = Reel8Tatapower;

// Backward-compat aliases
export const Reel5Itc = Reel5Firstcry;
export const Reel6Adanient = Reel6Techm;
export const Reel7Cochinship = Reel7Ongc;
export const Reel8Goldbees = Reel8Tatapower;
export const Reel5CoalIndia = Reel5Firstcry;
export const Reel6IiflCaps = Reel6Techm;
export const Reel7BlueStarCo = Reel7Ongc;
export const Reel8Indigo = Reel8Tatapower;
export const Reel9CumminsInd = Reel5Firstcry;
export const Reel10Abb = Reel6Techm;
export const Reel5DeepDive = Reel5Firstcry;
