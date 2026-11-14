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
  audioManifest = require('../../public/data/dema_suite_audio_manifest_en.json');
} catch (e) {
  try {
    audioManifest = require('../../public/data/dema_pack_audio_manifest_20261113.json');
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
  const m = audioManifest?.reels?.[reelId];
  if (m) return m;
  const fallbacks = {
    reel_1_macro: { frames_30fps: 1140, cue_frames: [48, 300, 560, 810], end_wipe_frame: 1065 },
    reel_2_losers: { frames_30fps: 1080, cue_frames: [48, 345, 585, 825], end_wipe_frame: 1005 },
    reel_3_gainers: { frames_30fps: 1080, cue_frames: [48, 345, 585, 840], end_wipe_frame: 1005 },
    reel_4_momentum: { frames_30fps: 1080, cue_frames: [48, 360, 615, 825], end_wipe_frame: 1005 },
    reel_5_coalindia: { frames_30fps: 1260, cue_frames: [48, 315, 600, 915], end_wipe_frame: 1185 },
    reel_6_iiflcaps: { frames_30fps: 1260, cue_frames: [48, 330, 630, 930], end_wipe_frame: 1185 },
    reel_7_bluestarco: { frames_30fps: 1260, cue_frames: [48, 345, 660, 975], end_wipe_frame: 1185 },
  };
  return fallbacks[reelId] || { frames_30fps: 1020, cue_frames: [48, 220, 480, 740], end_wipe_frame: 930 };
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
  const niftyTiles = [
    { from: '2', to: '2', flipAt: 55, hi: true },
    { from: '5', to: '5', flipAt: 60, hi: true },
    { from: ',', to: ',', flipAt: 64, hi: true, w: 28 },
    { from: '2', to: '1', flipAt: 69, hi: true },
    { from: '9', to: '4', flipAt: 74, hi: true },
    { from: '9', to: '4', flipAt: 80, hi: true },
    { from: '.', to: '.', flipAt: 85, hi: true, w: 28 },
    { from: '3', to: '3', flipAt: 90, hi: true },
    { from: '5', to: '0', flipAt: 95, hi: true },
  ];

  return (
    <VerticalReelShell
      reelId="reel_1_macro"
      stingKicker="REEL 1 · DAILY MACRO PULSE"
      stingTitle="GLOBAL & NIFTY 50"
      leftBreadcrumb="MACRO BENCHMARK · NOV 13"
      strapHero={{
        tabLabel: 'NIFTY 50',
        tabBg: COLORS.breaking,
        tabColor: COLORS.ink,
        contextChip: 'NSE INDEX PULLBACK',
        headline: 'NIFTY 50 SLIPS -0.44% (-110.80 PTS) TO ₹25,144.30',
        rightSource: 'RANGE ₹25,054.40 – ₹25,246.35',
      }}
      strapChart={{
        tabLabel: 'COMMODITIES',
        tabBg: COLORS.gold,
        tabColor: COLORS.ink,
        contextChip: 'METALS & CRUDE',
        headline: 'GOLD $3,886.30 (+0.03%) · SILVER $49.12 (-1.89%) · BRENT $95.84',
        rightSource: 'SILVER TESTING $48.41 SUPPORT',
      }}
      endTitle="DAILY MACRO PULSE"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 13"
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
                <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.breaking }}>
                  {nifty.change}
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
                    ₹25,054.40
                  </div>
                </div>
                <div style={{ backgroundColor: COLORS.ink3, borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>SESSION HIGH</div>
                  <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.bullishBright, marginTop: 4 }}>
                    ₹25,246.35
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
                  barColor={item.bullish ? COLORS.bullishBright : COLORS.breaking}
                  pct={item.bullish ? 0.65 : Math.min(1, Math.abs(item.pct) / 2.2)}
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
  const losers = marketData.top_losers;
  return (
    <VerticalReelShell
      reelId="reel_2_losers"
      stingKicker="REEL 2 · DAILY DRAGS"
      stingTitle="TOP 5 LOSERS"
      leftBreadcrumb="SELLING PRESSURE · NOV 13"
      strapHero={{
        tabLabel: 'TOP LOSERS',
        tabBg: COLORS.breaking,
        tabColor: COLORS.ink,
        contextChip: 'NIFTY 100 DRAGS',
        headline: 'PIDILITIND -3.42% (₹1,525.70) · SHRIRAMFIN -3.37% (₹970.00)',
        rightSource: 'BPCL -3.05% · RVNL -2.89% · GRASIM -2.60%',
      }}
      strapChart={{
        tabLabel: 'KEY SUPPORT',
        tabBg: COLORS.breaking,
        tabColor: COLORS.ink,
        contextChip: 'BROKEN 20 DEMA',
        headline: 'PIDILITE BREACHES 20 DEMA · SHRIRAMFIN TESTS ₹970 SUPPORT FLOOR',
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle="TOP LOSERS WRAP"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 13"
      endBullet="PIDILITIND · SHRIRAMFIN · BPCL · RVNL · GRASIM"
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
                  pct={Math.min(1, Math.abs(item.pct) / 3.5)}
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
                PIDILITE (₹1,525.70)
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: COLORS.breaking, marginTop: 8 }}>
                -3.42% SLIPPAGE
              </div>
              <div style={{ fontFamily: FONTS.ui, fontSize: 20, color: '#D3D7DF', lineHeight: 1.5, marginTop: 18 }}>
                Breached its short-term 20 DEMA support amidst broad chemical sector distribution. Shriram Finance also saw heavy volume profit taking.
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
  const gainers = marketData.top_gainers;
  return (
    <VerticalReelShell
      reelId="reel_3_gainers"
      stingKicker="REEL 3 · MARKET LEADERS"
      stingTitle="TOP 5 GAINERS"
      leftBreadcrumb="OUTPERFORMERS · NOV 13"
      strapHero={{
        tabLabel: 'TOP GAINERS',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'ABOVE 20 DEMA',
        headline: 'CHOLAFIN +2.60% (₹1,862) · CUMMINSIND +2.60% (₹4,369)',
        rightSource: 'ABB +1.90% · ICICIGI +1.41% · EICHERMOT +1.34%',
      }}
      strapChart={{
        tabLabel: 'BREAKOUT',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'MOMENTUM LEADERS',
        headline: 'CHOLAFIN RSI 73.0 · CUMMINSIND FRESH ACCUMULATION ABOVE 20 DEMA',
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle="TOP GAINERS WRAP"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 13"
      endBullet="CHOLAFIN · CUMMINSIND · ABB · ICICIGI · EICHERMOT"
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
                  pct={Math.max(0.35, item.pct / 2.6)}
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
                CHOLAFIN (₹1,862)
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: COLORS.bullishBright, marginTop: 8 }}>
                +2.60% SURGE · RSI 73.0
              </div>
              <div style={{ fontFamily: FONTS.ui, fontSize: 20, color: '#D3D7DF', lineHeight: 1.5, marginTop: 18 }}>
                Leading the rally alongside Cummins India (+2.60%). Both counters holding cleanly above rising 20 DEMA support floors.
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
  const momentum = marketData.momentum_stocks;
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
        headline: 'HDFCBANK 23.44M VOL (RSI 73.4) · HINDALCO 8.86M · SHRIRAMFIN 6.33M',
        rightSource: 'M&M 1.99M · CUMMINSIND 1.10M',
      }}
      strapChart={{
        tabLabel: 'TURNOVER',
        tabBg: COLORS.bullishBright,
        tabColor: COLORS.ink,
        contextChip: 'HEAVY ACCUMULATION',
        headline: 'HDFCBANK ABSORBS OVER 23M SHARES · CUMMINSIND POSTS HIGH-CONVICTION BREAKOUT',
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle="VOLUME RADAR"
      endSubtitle="DAILY TELEVISION BRIEF · NOV 13"
      endBullet="HDFCBANK · HINDALCO · SHRIRAMFIN · CUMMINSIND"
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
                HDFC BANK (23.44M VOL)
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: COLORS.cyan, marginTop: 8 }}>
                LTP ₹804.00 · RSI 73.4
              </div>
              <div style={{ fontFamily: FONTS.ui, fontSize: 20, color: '#D3D7DF', lineHeight: 1.5, marginTop: 18 }}>
                Absorbed over 23.4M shares of turnover while holding bullish moving average posture. Institutional liquidity highly active.
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
   ========================================================================= */
const VerticalStockReel = ({
  reelId,
  stockKey,
  reelNum,
  stingKicker,
}) => {
  const stock = marketData.deep_dive_stocks[stockKey] || {};
  const pctNum = typeof stock.pct === 'number' ? stock.pct : parseFloat(stock.changeStr || '0');
  const isBullish = pctNum >= 0;
  const themeColor = isBullish ? COLORS.bullishBright : COLORS.breaking;

  const ltpStr = typeof stock.ltp === 'number' ? `₹${stock.ltp.toFixed(2)}` : String(stock.ltp || '');
  const changeStr = stock.changeStr || '';
  const volStr = stock.volume || stock.vol || '';
  const oiStr = stock.oiSentiment || stock.oi || '85% Long Buildup';
  const companyName = stock.company || stock.name || stock.symbol;

  const dema20Str = typeof stock.dema20 === 'number' ? `₹${stock.dema20.toFixed(2)}` : String(stock.dema20 || stock.dema?.d20 || '');
  const dema200Str = typeof stock.dema200 === 'number' ? `₹${stock.dema200.toFixed(2)}` : String(stock.dema200 || stock.dema?.d200 || '');
  const rsiStr = typeof stock.rsi14 === 'number' ? stock.rsi14.toFixed(1) : String(stock.rsi || stock.rsi14 || '55.0');
  const pocStr = typeof stock.poc === 'number' ? `₹${stock.poc.toFixed(2)}` : String(stock.poc || stock.vp?.poc || '');
  const vahStr = typeof stock.vah === 'number' ? `₹${stock.vah.toFixed(2)}` : String(stock.vah || stock.vp?.vah || '');
  const valStr = typeof stock.val === 'number' ? `₹${stock.val.toFixed(2)}` : String(stock.val || stock.vp?.val || '');
  const chartImg = stock.image || stock.chartImage || 'charts/COALINDIA_1D_chart.png';

  return (
    <VerticalReelShell
      reelId={reelId}
      stingKicker={stingKicker}
      stingTitle={stock.symbol}
      leftBreadcrumb="CHART STUDY · NOV 13"
      strapHero={{
        tabLabel: stock.symbol,
        tabBg: themeColor,
        tabColor: COLORS.ink,
        contextChip: '1D TRADINGVIEW',
        headline: `${companyName} LTP ${ltpStr} (${changeStr}) · VOL ${volStr}`,
        rightSource: `OI: ${oiStr}`,
      }}
      strapChart={{
        tabLabel: 'DEMA & VP',
        tabBg: COLORS.gold,
        tabColor: COLORS.ink,
        contextChip: `POC ${pocStr}`,
        headline: `20 DEMA ${dema20Str} · 200 DEMA ${dema200Str} · VAH ${vahStr}`,
        rightSource: 'DEMA ANALYSIS RADAR',
      }}
      endTitle={stock.symbol}
      endSubtitle="DAILY TELEVISION BRIEF · NOV 13"
      endBullet={`20 DEMA ${dema20Str} · POC ${pocStr}`}
      renderHeroShot={({ frame, fps }) => {
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center' }}>
            <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${themeColor}`, borderRadius: 20, padding: '34px 28px' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>{stock.symbol} · {companyName}</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 58, color: COLORS.paper, marginTop: 4 }}>
                {ltpStr}
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: themeColor, marginTop: 6 }}>
                {changeStr}
              </div>

              <div style={{ height: 280, borderRadius: 12, overflow: 'hidden', marginTop: 18, border: `1px solid ${COLORS.border}` }}>
                <Img src={staticFile(chartImg)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '14px' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>20 DEMA</div>
                  <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.cyan, marginTop: 4 }}>
                    {dema20Str}
                  </div>
                </div>
                <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '14px' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>RSI(14)</div>
                  <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: themeColor, marginTop: 4 }}>
                    {rsiStr}
                  </div>
                </div>
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
      renderBreakdownShot={({ frame, fps, timing }) => {
        return (
          <AbsoluteFill style={{ padding: '160px 48px 240px', justifyContent: 'center' }}>
            <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.gold}`, borderRadius: 20, padding: '34px 28px' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>VOLUME PROFILE FOOTPRINT</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 52, color: COLORS.paper, marginTop: 4 }}>
                POC: {pocStr}
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: COLORS.gold, marginTop: 4 }}>
                VAH: {vahStr} · VAL: {valStr}
              </div>
              <div style={{ marginTop: 16, fontFamily: FONTS.ui, fontSize: 19, color: '#D3D7DF', lineHeight: 1.5 }}>
                {stock.symbol} institutional technical study. Open Interest: {oiStr}. Volume: {volStr}.
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
    />
  );
};

/* REEL 5: COAL INDIA */
export const Reel5CoalIndia = () => (
  <VerticalStockReel
    reelId="reel_5_coalindia"
    stockKey="coalindia"
    reelNum={5}
    stingKicker="REEL 5 · COAL INDIA DEEP DIVE"
  />
);

/* REEL 6: IIFL CAPITAL */
export const Reel6IiflCaps = () => (
  <VerticalStockReel
    reelId="reel_6_iiflcaps"
    stockKey="iiflcaps"
    reelNum={6}
    stingKicker="REEL 6 · IIFL CAPITAL DEEP DIVE"
  />
);

/* REEL 7: BLUE STAR */
export const Reel7BlueStarCo = () => (
  <VerticalStockReel
    reelId="reel_7_bluestarco"
    stockKey="bluestarco"
    reelNum={7}
    stingKicker="REEL 7 · BLUE STAR DEEP DIVE"
  />
);

/* REEL 8: INDIGO */
export const Reel8Indigo = () => (
  <VerticalStockReel
    reelId="reel_8_indigo"
    stockKey="indigo"
    reelNum={8}
    stingKicker="REEL 8 · INDIGO DEEP DIVE"
  />
);

/* REEL 9: CUMMINS INDIA */
export const Reel9CumminsInd = () => (
  <VerticalStockReel
    reelId="reel_9_cumminsind"
    stockKey="cumminsind"
    reelNum={9}
    stingKicker="REEL 9 · CUMMINS INDIA DEEP DIVE"
  />
);

/* REEL 10: ABB INDIA */
export const Reel10Abb = () => (
  <VerticalStockReel
    reelId="reel_10_abb"
    stockKey="abb"
    reelNum={10}
    stingKicker="REEL 10 · ABB INDIA DEEP DIVE"
  />
);

/* Backward compatibility aliases */
export const Reel5DeepDive = Reel5CoalIndia;
