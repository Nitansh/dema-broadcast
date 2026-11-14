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
import audioManifest from '../../public/data/dema_suite_audio_manifest_en.json';
import {
  BroadcastCaptionOverlay,
  BroadcastEndCard,
  ChannelBug,
  clamp01,
  COLORS,
  easeOutCubic,
  EducationalRibbon,
  FONTS,
  LowerThirdStrap,
  SlantedEndWipe,
  SlantedStamp,
  SpecBarRow,
  SplitFlapChar,
  StingBrandPlate,
  VerticalBandWipe,
} from '../AdaniSuite/SharedNewsPackage';

const getChTiming = (id) => {
  const m = audioManifest?.chapters?.[id];
  if (m) return m;
  return {
    frames_30fps: 720,
    cue_frames: [47, 240, 460],
    end_wipe_frame: 640,
  };
};

const WideChapterShell = ({
  chapterId,
  stingKicker,
  stingTitle,
  leftBreadcrumb,
  getStrap,
  wipes = [],
  children,
  endTitle = 'NEXT CHAPTER',
  endSubtitle = 'DEMA ANALYSIS · NOV 13, 2026',
  endBullet = 'EDUCATIONAL CHART STUDY',
  finalChapter = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getChTiming(chapterId);
  const endWipe = timing.end_wipe_frame ?? timing.frames_30fps - 75;
  const showHud = frame >= 45 && frame < endWipe + 6;
  const strap = getStrap(frame, timing);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@500;600;700;800&display=swap');
      `}</style>

      {/* Subtle Background Pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.45,
        }}
      />

      {/* Opening Chapter TV News Sting */}
      {frame < 45 && (
        <StingBrandPlate
          frame={frame}
          fps={fps}
          kicker={stingKicker}
          title={stingTitle}
          subTag="EDUCATIONAL CHART LEARNING · ZERO SEBI CLAIMS"
        />
      )}

      {/* Dynamic Content */}
      {frame >= 45 && frame < endWipe + 6 && children({ frame, fps, timing })}

      {/* End Card */}
      {frame >= endWipe + 6 && (
        <BroadcastEndCard
          frame={frame}
          startFrame={endWipe + 6}
          fps={fps}
          title={endTitle}
          subtitle={endSubtitle}
          bullet={endBullet}
          cta={finalChapter ? 'SUBSCRIBE FOR DAILY EDUCATIONAL CHART STUDIES' : 'CONTINUING TO NEXT SEGMENT...'}
        />
      )}

      {/* TV News HUD */}
      {showHud && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 96,
              right: 96,
              top: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 25,
            }}
          >
            <EducationalRibbon leftLabel={leftBreadcrumb} />
            <ChannelBug />
          </div>

          <BroadcastCaptionOverlay chunks={timing.chunks} frame={frame} fps={fps} />
          <LowerThirdStrap {...strap} animProgress={clamp01((frame - 45) / 10)} />
        </>
      )}

      {/* Transitions */}
      <VerticalBandWipe frame={frame} startFrame={37} duration={13} />
      {wipes.map((w, idx) => (
        <VerticalBandWipe key={idx} frame={frame} startFrame={w} duration={14} />
      ))}
      <SlantedEndWipe frame={frame} startFrame={endWipe} duration={16} />
    </AbsoluteFill>
  );
};

/* =========================================================================
   CHAPTER 1: INTRO & EDUCATIONAL DISCLAIMER
   ========================================================================= */
export const Ch1Intro = () => {
  const timing = getChTiming('fv_ch1_intro');
  const c1 = timing.cue_frames[1] ?? 180;

  return (
    <WideChapterShell
      chapterId="fv_ch1_intro"
      stingKicker="DAILY MARKET & STOCK STUDY · NOV 13, 2026"
      stingTitle="DEMA ANALYSIS"
      leftBreadcrumb="CHAPTER 1 · BRIEFING & DISCLAIMER"
      endTitle="CHAPTER 2: MACRO SUMMARY"
      endBullet="NIFTY 50 · GOLD · SILVER · WTI & BRENT CRUDE"
      getStrap={(frame) => ({
        tabLabel: frame < c1 ? 'WELCOME' : 'DISCLAIMER',
        tabBg: COLORS.accent,
        tabColor: COLORS.ink,
        contextChip: 'NOV 13, 2026 · NSE STUDY',
        headline:
          frame < c1
            ? 'TODAY: NIFTY PULLBACK, TOP MOVERS & TMCV / MONEYVIEW DEEP DIVE'
            : 'STRICTLY FOR EDUCATIONAL CHART READING · NOT BUY/SELL ADVICE',
        rightSource: 'VOICE: EN-IN-PRABHATNEURAL · NEWS-PACKAGE',
      })}
    >
      {({ frame, fps }) => {
        const cardIn = spring({ frame: Math.max(0, frame - 48), fps, config: { damping: 16, stiffness: 150 } });
        const roadmap = [
          ['01', 'MACRO PULSE', 'Nifty 50 Pullback (25,144), Bullion & Crude'],
          ['02', 'BREADTH RADAR', 'Top 5 Gainers, Top 5 Losers & Momentum Radar'],
          ['03', 'TMCV (TATA MOTORS)', '200 DEMA (₹432.75) Retest & Volume Floor'],
          ['04', 'MONEYVIEW BREAKOUT', 'Colossal 96.80M Vol Surge & VAH Breakout'],
        ];

        return (
          <AbsoluteFill style={{ padding: '115px 96px 175px', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 38, alignItems: 'center' }}>
              <div
                style={{
                  backgroundColor: COLORS.ink2,
                  border: `2px solid ${COLORS.accent}`,
                  borderRadius: 16,
                  padding: '38px 42px',
                  transform: `translateY(${interpolate(cardIn, [0, 1], [30, 0])}px)`,
                  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.accent, letterSpacing: '0.18em', marginBottom: 10 }}>
                  MANDATORY EDUCATIONAL NOTICE
                </div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 66, lineHeight: 0.96, color: COLORS.paper }}>
                  EDUCATIONAL CHART STUDY ONLY
                </div>
                <div style={{ fontFamily: FONTS.ui, fontSize: 23, lineHeight: 1.5, color: '#D3D7DF', marginTop: 18 }}>
                  All prices, DEMA crossovers, RSI(14) values, and Monthly Volume Profile levels are strictly for technical education. Zero buy or sell advice.
                </div>
                <div style={{ marginTop: 22, display: 'inline-block', padding: '10px 18px', borderRadius: 6, backgroundColor: 'rgba(254, 107, 61, 0.14)', border: `1px solid ${COLORS.breaking}`, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 16, color: COLORS.breaking }}>
                  ZERO INVENTED DATA · VERIFIED TRADINGVIEW TELEMETRY
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {roadmap.map(([num, ttl, sub], idx) => (
                  <SpecBarRow
                    key={num}
                    label={`${num} · ${ttl}`}
                    subLabel={sub}
                    valueText="LIVE"
                    barColor={idx === 2 ? COLORS.breaking : idx === 3 ? COLORS.bullishBright : COLORS.accent}
                    pct={0.82}
                    anim={clamp01((frame - 56 - idx * 8) / 12)}
                    compact
                  />
                ))}
              </div>
            </div>
          </AbsoluteFill>
        );
      }}
    </WideChapterShell>
  );
};

/* =========================================================================
   CHAPTER 2: MACRO SUMMARY (NIFTY 50, GOLD, SILVER, CRUDE)
   ========================================================================= */
export const Ch2Macro = () => {
  const timing = getChTiming('fv_ch2_macro');
  const c1 = timing.cue_frames[1] ?? 320;
  const c2 = timing.cue_frames[2] ?? 620;

  const nifty = marketData.market_summary[0];
  // Split-flap tiles flipping to 25,144.30
  const niftyTiles = [
    { from: '2', to: '2', flipAt: 58, hi: true },
    { from: '5', to: '5', flipAt: 63, hi: true },
    { from: ',', to: ',', flipAt: 67, hi: true, w: 38 },
    { from: '2', to: '1', flipAt: 72, hi: true },
    { from: '9', to: '4', flipAt: 77, hi: true },
    { from: '9', to: '4', flipAt: 83, hi: true },
    { from: '.', to: '.', flipAt: 88, hi: true, w: 38 },
    { from: '3', to: '3', flipAt: 93, hi: true },
    { from: '5', to: '0', flipAt: 98, hi: true },
  ];

  return (
    <WideChapterShell
      chapterId="fv_ch2_macro"
      stingKicker="CHAPTER 2 · MACRO DESK"
      stingTitle="GLOBAL & NIFTY 50"
      leftBreadcrumb="NIFTY 50 · GOLD · SILVER · CRUDE"
      wipes={[c1 - 5, c2 - 5]}
      endTitle="CHAPTER 3: MARKET BREADTH"
      endBullet="TOP GAINERS · TOP LOSERS · HIGH VOLUME"
      getStrap={(frame) => {
        if (frame < c1) {
          return {
            tabLabel: 'MARKETS',
            tabBg: COLORS.breaking,
            tabColor: COLORS.ink,
            contextChip: 'NIFTY 50 PULLBACK',
            headline: 'NIFTY 50 DROPS -0.61% (-154.50 PTS) TO ₹25,144.30',
            rightSource: 'RANGE ₹25,054.00 – ₹25,246.00',
          };
        }
        if (frame < c2) {
          return {
            tabLabel: 'BULLION',
            tabBg: COLORS.gold,
            tabColor: COLORS.ink,
            contextChip: 'COMEX METALS',
            headline: 'GOLD FLAT AT $3,886.00 · SILVER DROPS -1.14% ($49.49)',
            rightSource: 'SILVER TESTING KEY $49.20 SUPPORT',
          };
        }
        return {
          tabLabel: 'ENERGY',
          tabBg: COLORS.bullishBright,
          tabColor: COLORS.ink,
          contextChip: 'CRUDE OIL SURGE',
          headline: 'WTI CRUDE $89.14 (+0.80%) · BRENT CRUDE $96.81 (+1.00%)',
          rightSource: 'ENERGY SECTOR RESILIENCE',
        };
      }}
    >
      {({ frame, fps }) => {
        if (frame < c1) {
          const local = frame - 45;
          const boardIn = spring({ frame: local, fps, config: { damping: 16, stiffness: 150 } });
          return (
            <AbsoluteFill style={{ padding: '112px 96px 175px', justifyContent: 'center' }}>
              <div
                style={{
                  backgroundColor: COLORS.ink2,
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: 16,
                  padding: '38px 46px',
                  transform: `translateY(${interpolate(boardIn, [0, 1], [30, 0])}px)`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold, letterSpacing: '0.16em' }}>
                      INDIA BENCHMARK INDEX · NSE
                    </div>
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 64, color: COLORS.paper }}>
                      NIFTY 50 (^NSEI)
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(239,68,68,0.16)', border: `2px solid ${COLORS.breaking}`, color: COLORS.breaking, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, padding: '10px 22px', borderRadius: 8 }}>
                    {nifty.change}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 88, color: COLORS.gold }}>₹</span>
                  {niftyTiles.map((t, i) => (
                    <SplitFlapChar
                      key={i}
                      fromChar={t.from}
                      toChar={t.to}
                      flipFrame={t.flipAt}
                      frame={frame}
                      width={t.w ?? 110}
                      height={162}
                      highlight={t.hi}
                    />
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 28 }}>
                  {[
                    ['SESSION RANGE', nifty.range],
                    ['PREVIOUS CLOSE', nifty.prevClose],
                    ['STRUCTURE', 'TESTING 20 DEMA SUPPORT'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ backgroundColor: COLORS.ink3, borderRadius: 10, padding: '16px 20px' }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.muted }}>{k}</div>
                      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.paper, marginTop: 6 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </AbsoluteFill>
          );
        }

        if (frame < c2) {
          const local = frame - c1;
          const metals = marketData.market_summary.slice(1, 3);
          return (
            <AbsoluteFill style={{ padding: '115px 96px 175px', justifyContent: 'center', gap: 24 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 64, color: COLORS.paper }}>
                PRECIOUS METALS · GOLD & SILVER
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                {metals.map((m, idx) => (
                  <div key={m.id} style={{ backgroundColor: COLORS.ink2, border: `2px solid ${m.pct >= 0 ? COLORS.gold : COLORS.breaking}`, borderRadius: 16, padding: '32px 34px', opacity: clamp01((local - idx * 10) / 12) }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>{m.name} ({m.ticker})</div>
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 82, color: COLORS.paper, marginTop: 6 }}>{m.price}</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, color: m.pct >= 0 ? COLORS.bullishBright : COLORS.breaking, marginTop: 6 }}>{m.change}</div>
                    <div style={{ marginTop: 18, fontFamily: FONTS.mono, fontSize: 16, color: COLORS.muted }}>
                      Range: {m.range} · Prev: {m.prevClose}
                    </div>
                  </div>
                ))}
              </div>
            </AbsoluteFill>
          );
        }

        const local = frame - c2;
        return (
          <AbsoluteFill style={{ padding: '115px 96px 175px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 58, color: COLORS.paper }}>
                COMPLETE MACRO DASHBOARD · NOV 13
              </div>
              {frame >= c2 + 35 && (
                <SlantedStamp text="CRUDE OIL EXPANSION" color={COLORS.bullishBright} frame={frame} startFrame={c2 + 35} fps={fps} size={38} />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {marketData.market_summary.map((item, idx) => (
                <SpecBarRow
                  key={item.id}
                  label={`${item.name} · ${item.price}`}
                  subLabel={`Range ${item.range} · Prev ${item.prevClose}`}
                  valueText={item.change}
                  barColor={item.bullish ? COLORS.bullishBright : COLORS.breaking}
                  pct={item.bullish ? 0.65 : Math.min(1, Math.abs(item.pct) / 2.2)}
                  anim={clamp01((local - idx * 6) / 12)}
                  compact
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      }}
    </WideChapterShell>
  );
};

/* =========================================================================
   CHAPTER 3: MOVERS (GAINERS / LOSERS / MOMENTUM)
   ========================================================================= */
export const Ch3Movers = () => {
  const timing = getChTiming('fv_ch3_movers');
  const c1 = timing.cue_frames[1] ?? 320;
  const c2 = timing.cue_frames[2] ?? 640;

  return (
    <WideChapterShell
      chapterId="fv_ch3_movers"
      stingKicker="CHAPTER 3 · NSE BREADTH"
      stingTitle="GAINERS · LOSERS · VOLUME"
      leftBreadcrumb="TOP MOVERS · MOMENTUM RADAR"
      wipes={[c1 - 5, c2 - 5]}
      endTitle="CHAPTER 4: TMCV & MONEYVIEW"
      endBullet="TATA MOTORS 200 DEMA TEST · MONEYVIEW 96.80M BREAKOUT"
      getStrap={(frame) => {
        if (frame < c1) {
          return {
            tabLabel: 'TOP GAINERS',
            tabBg: COLORS.bullishBright,
            tabColor: COLORS.ink,
            contextChip: 'ABOVE 20 DEMA',
            headline: 'EICHERMOT +1.34% (₹7,650) · HINDUNILVR +0.96% · HEROMOTOCO +0.53%',
            rightSource: 'ASIANPAINT +0.43% · BHARTIARTL +0.41%',
          };
        }
        if (frame < c2) {
          return {
            tabLabel: 'TOP LOSERS',
            tabBg: COLORS.breaking,
            tabColor: COLORS.ink,
            contextChip: 'BELOW 20 DEMA',
            headline: 'SHRIRAMFIN -3.37% (₹970) · BPCL -2.89% · GRASIM -2.44%',
            rightSource: 'HINDALCO -2.22% · ADANIENT -1.95%',
          };
        }
        return {
          tabLabel: 'HIGH VOLUME',
          tabBg: COLORS.cyan,
          tabColor: COLORS.ink,
          contextChip: 'LIQUIDITY RADAR',
          headline: 'HDFCBANK 23.40M VOL (RSI 73.4) · MONEYVIEW 96.80M SURGE',
          rightSource: 'SHRIRAMFIN 4.12M · GRASIM 3.51M',
        };
      }}
    >
      {({ frame, fps }) => {
        const mode = frame < c1 ? 'gainers' : frame < c2 ? 'losers' : 'momentum';
        const local = mode === 'gainers' ? frame - 45 : mode === 'losers' ? frame - c1 : frame - c2;
        const rows =
          mode === 'gainers'
            ? marketData.top_gainers
            : mode === 'losers'
              ? marketData.top_losers
              : marketData.momentum_stocks;

        const heading =
          mode === 'gainers'
            ? 'TOP 5 NIFTY 50 GAINERS · HOLDING ABOVE 20 DEMA'
            : mode === 'losers'
              ? 'TOP 5 NIFTY 50 LOSERS · UNDER 20 DEMA PRESSURE'
              : 'HIGH-VOLUME & MOMENTUM ORDER FLOW';
        const stampText =
          mode === 'gainers'
            ? 'BULLISH MOMENTUM'
            : mode === 'losers'
              ? 'WEAK STRUCTURE'
              : 'INSTITUTIONAL LIQUIDITY';
        const barColor =
          mode === 'gainers' ? COLORS.bullishBright : mode === 'losers' ? COLORS.breaking : COLORS.cyan;

        return (
          <AbsoluteFill style={{ padding: '115px 96px 175px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 58, color: COLORS.paper }}>{heading}</div>
              {local > 30 && (
                <SlantedStamp text={stampText} color={barColor} frame={local} startFrame={30} fps={fps} size={36} />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rows.map((item, idx) => (
                <SpecBarRow
                  key={item.symbol}
                  label={`${idx + 1}. ${item.symbol} · LTP ${item.ltp}`}
                  subLabel={`${item.vol ? `Vol: ${item.vol} · ` : ''}${item.dema} · RSI(14): ${item.rsi}`}
                  valueText={`${item.pct > 0 ? '+' : ''}${item.pct.toFixed(2)}%`}
                  barColor={item.pct < 0 ? COLORS.breaking : barColor}
                  pct={mode === 'gainers' ? Math.max(0.3, item.pct / 1.5) : mode === 'losers' ? Math.min(1, Math.abs(item.pct) / 3.5) : 0.75}
                  anim={clamp01((local - idx * 6) / 12)}
                  compact
                />
              ))}
            </div>
          </AbsoluteFill>
        );
      }}
    </WideChapterShell>
  );
};

/* =========================================================================
   CHAPTER 4: FEATURED CHART STUDY: TMCV & MONEYVIEW
   ========================================================================= */
export const Ch4DeepDive = () => {
  const tmcv = marketData.deep_dive_stocks.tmcv;
  const mv = marketData.deep_dive_stocks.moneyview;
  const timing = getChTiming('fv_ch4_deepdive');
  const c1 = timing.cue_frames[1] ?? 320;
  const c2 = timing.cue_frames[2] ?? 640;
  const c3 = timing.cue_frames[3] ?? 960;

  // Split-flap tiles for TMCV (433.55)
  const tmcvTiles = [
    { from: '4', to: '4', flipAt: 58, hi: true },
    { from: '4', to: '3', flipAt: 64, hi: true },
    { from: '5', to: '3', flipAt: 70, hi: true },
    { from: '.', to: '.', flipAt: 75, hi: true, w: 38 },
    { from: '0', to: '5', flipAt: 80, hi: true },
    { from: '0', to: '5', flipAt: 86, hi: true },
  ];

  return (
    <WideChapterShell
      chapterId="fv_ch4_deepdive"
      stingKicker="CHAPTER 4 · FEATURED CHART STUDY"
      stingTitle="TMCV & MONEYVIEW"
      leftBreadcrumb="NSE 1D · TRADINGVIEW FOOTPRINT"
      wipes={[c1 - 5, c2 - 5, c3 - 5]}
      endTitle="CHAPTER 5: WATCHLIST RECAP"
      endBullet="TMCV 200 DEMA FLOOR ₹432.75 · MONEYVIEW COMPRESSION BREAKOUT"
      getStrap={(frame) => {
        if (frame < c1) {
          return {
            tabLabel: 'TMCV STUDY',
            tabBg: COLORS.breaking,
            tabColor: COLORS.ink,
            contextChip: 'TATA MOTORS CV 1D',
            headline: 'GAP-DOWN TO ₹433.55 (-4.38%) · TESTING 200 DEMA ₹432.75',
            rightSource: '65% SHORT BUILDUP · VOL 6.88M',
          };
        }
        if (frame < c2) {
          return {
            tabLabel: 'DEMA & VP',
            tabBg: COLORS.gold,
            tabColor: COLORS.ink,
            contextChip: 'MONTHLY POC ₹433.55',
            headline: '200 DEMA ₹432.75 + POC FLOOR · 20 DEMA RESISTANCE ₹458.20',
            rightSource: 'DECISIVE STRUCTURAL BOUNCE ZONE',
          };
        }
        if (frame < c3) {
          return {
            tabLabel: 'MONEYVIEW',
            tabBg: COLORS.bullishBright,
            tabColor: COLORS.ink,
            contextChip: '96.80M COLOSSAL VOL',
            headline: 'MASSIVE COMPRESSION BREAKOUT +3.88% AT ₹58.15',
            rightSource: '85% LONG BUILDUP · VAH SMASHED',
          };
        }
        return {
          tabLabel: 'STRUCTURE',
          tabBg: COLORS.accent,
          tabColor: COLORS.ink,
          contextChip: 'TECHNICAL RADAR',
          headline: 'TMCV DEFENDS ₹432.75 · MONEYVIEW TARGETS ₹62+ EXPANSION',
          rightSource: 'EDUCATIONAL CHART STUDY ONLY',
        };
      }}
    >
      {({ frame, fps }) => {
        // Beat 1: TMCV Hero Card & TradingView Chart
        if (frame < c1) {
          const local = frame - 45;
          const oiPct = interpolate(easeOutCubic((local - 45) / 36), [0, 1], [0, 65]);
          return (
            <AbsoluteFill style={{ padding: '112px 96px 175px', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 36, alignItems: 'center' }}>
                <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.breaking}`, borderRadius: 16, padding: '34px 36px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>TATA MOTORS CV (TMCV) · NSE</span>
                    <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.breaking, backgroundColor: 'rgba(239,68,68,0.16)', border: `1px solid ${COLORS.breaking}`, padding: '6px 14px', borderRadius: 6 }}>
                      {tmcv.changeStr}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 82, color: COLORS.gold }}>₹</span>
                    {tmcvTiles.map((t, i) => (
                      <SplitFlapChar
                        key={i}
                        fromChar={t.from}
                        toChar={t.to}
                        flipFrame={t.flipAt}
                        frame={frame}
                        width={t.w ?? 96}
                        height={146}
                        highlight={t.hi}
                        tone="red"
                      />
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 22 }}>
                    {[
                      ['OPEN', `₹${(tmcv.open ?? 445).toFixed(2)}`],
                      ['HIGH', `₹${(tmcv.high ?? 446.2).toFixed(2)}`],
                      ['LOW', `₹${(tmcv.low ?? 431.8).toFixed(2)}`],
                      ['CLOSE', `₹${(tmcv.close ?? tmcv.ltp ?? 433.55).toFixed(2)}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                        <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>{k}</div>
                        <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.paper, marginTop: 4 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.mono, fontSize: 15, color: COLORS.paper, marginBottom: 8 }}>
                      <span>OI SENTIMENT: 65% SHORT BUILDUP</span>
                      <span style={{ color: COLORS.accent }}>VOL {tmcv.volume}</span>
                    </div>
                    <div style={{ height: 12, backgroundColor: '#0C0E11', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${oiPct}%`, height: '100%', backgroundColor: COLORS.breaking }} />
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.gold, marginBottom: 10 }}>
                    TRADINGVIEW FOOTPRINT · 200 DEMA TEST
                  </div>
                  <div style={{ height: 470, overflow: 'hidden', borderRadius: 10 }}>
                    <Img src={staticFile(tmcv.chartImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </AbsoluteFill>
          );
        }

        // Beat 2: TMCV SVG Technical Ribbon & Confluence
        if (frame < c2) {
          const local = frame - c1;
          const curveP = easeOutCubic(local / 80);
          const svgPathD = 'M 30 50 L 140 65 L 260 85 L 400 120 L 550 145 L 700 185 L 860 215';

          return (
            <AbsoluteFill style={{ padding: '112px 96px 175px', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 34, alignItems: 'stretch' }}>
                <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.mono, fontSize: 14, color: COLORS.gold, marginBottom: 10 }}>
                    <span>ZOOMED 200 DEMA CLUSTER</span>
                    <span style={{ color: COLORS.breaking }}>LTP ₹433.55</span>
                  </div>
                  <div style={{ flex: 1, minHeight: 460, overflow: 'hidden', borderRadius: 10, backgroundColor: '#0B0E14' }}>
                    <Img
                      src={staticFile(tmcv.chartImage)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transformOrigin: '75% 75%',
                        transform: 'scale(1.15)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.breaking, letterSpacing: '0.14em' }}>
                      200 DEMA & MONTHLY POC CONFLUENCE
                    </div>
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 48, color: COLORS.paper, lineHeight: 1.0, marginTop: 4 }}>
                      ₹432.75 SUPPORT RETEST
                    </div>
                  </div>

                  <svg viewBox="0 0 900 265" style={{ width: '100%', height: 245, overflow: 'visible' }}>
                    <line x1="20" y1="38" x2="880" y2="38" stroke={COLORS.accent} strokeWidth="2.5" strokeDasharray="8 6" />
                    <text x="880" y="28" fill={COLORS.accent} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" textAnchor="end">
                      20 DEMA RESISTANCE: ₹{tmcv.dema20.toFixed(2)}
                    </text>

                    <line x1="20" y1="100" x2="880" y2="100" stroke={COLORS.muted} strokeWidth="2" strokeDasharray="5 5" />
                    <text x="20" y="90" fill={COLORS.muted} fontFamily={FONTS.mono} fontSize="15">
                      VAH ₹{tmcv.vah.toFixed(2)} · 50 DEMA ₹{tmcv.dema50.toFixed(2)}
                    </text>

                    <line x1="20" y1="215" x2="880" y2="215" stroke={COLORS.bullishBright} strokeWidth="3" />
                    <text x="20" y="205" fill={COLORS.bullishBright} fontFamily={FONTS.mono} fontSize="16" fontWeight="700">
                      200 DEMA FLOOR: ₹{tmcv.dema200.toFixed(2)} + POC ₹{tmcv.poc.toFixed(2)}
                    </text>

                    <path
                      d={svgPathD}
                      fill="none"
                      stroke={COLORS.breaking}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="1100"
                      strokeDashoffset={1100 * (1 - curveP)}
                    />
                    {curveP > 0.9 && (
                      <circle cx="860" cy="215" r="10" fill={COLORS.bullishBright} stroke={COLORS.ink} strokeWidth="3" />
                    )}
                  </svg>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>200 DEMA FLOOR</div>
                      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.bullishBright, marginTop: 4 }}>
                        ₹432.75 – ₹433.55
                      </div>
                    </div>
                    <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>RSI(14) MOMENTUM</div>
                      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: COLORS.breaking, marginTop: 4 }}>
                        38.6 (OVERSOLD TEST)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AbsoluteFill>
          );
        }

        // Beat 3: MONEYVIEW Colossal 96.80M Breakout
        if (frame < c3) {
          const local = frame - c2;
          return (
            <AbsoluteFill style={{ padding: '112px 96px 175px', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center' }}>
                <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.bullishBright}`, borderRadius: 16, padding: '34px 36px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold }}>MONEYVIEW · 1D BREAKOUT</span>
                    <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.bullishBright, backgroundColor: 'rgba(16,185,129,0.16)', border: `1px solid ${COLORS.bullish}`, padding: '6px 14px', borderRadius: 6 }}>
                      {mv.changeStr}
                    </span>
                  </div>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 88, color: COLORS.paper }}>
                    ₹{mv.ltp.toFixed(2)}
                  </div>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 38, color: COLORS.bullishBright, marginTop: 6 }}>
                    COLOSSAL 96.80M VOLUME SURGE
                  </div>
                  <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>VAH SMASHED</div>
                      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.bullishBright, marginTop: 4 }}>
                        ₹{mv.vah.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ backgroundColor: COLORS.ink3, borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>20 DEMA SUPPORT</div>
                      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.accent, marginTop: 4 }}>
                        ₹{mv.dema20.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: COLORS.ink2, border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.gold, marginBottom: 10 }}>
                    MONEYVIEW FOOTPRINT CHART
                  </div>
                  <div style={{ height: 470, overflow: 'hidden', borderRadius: 10 }}>
                    <Img src={staticFile(mv.chartImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </AbsoluteFill>
          );
        }

        // Beat 4: Summary Scorecard of both stocks
        const local = frame - c3;
        return (
          <AbsoluteFill style={{ padding: '115px 96px 175px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 60, color: COLORS.paper }}>
                KEY STOCK TECHNICAL SCORECARD
              </div>
              <SlantedStamp text="ACTIONABLE LEVELS" color={COLORS.accent} frame={frame} startFrame={c3 + 4} fps={fps} size={46} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SpecBarRow label="TMCV: 200 DEMA FLOOR" subLabel="Crucial long-term trend support zone" valueText={`₹${tmcv.dema200.toFixed(2)}`} barColor={COLORS.bullishBright} pct={0.92} anim={clamp01(local / 12)} compact />
              <SpecBarRow label="TMCV: 20 DEMA OVERHEAD" subLabel="First major resistance hurdle" valueText={`₹${tmcv.dema20.toFixed(2)}`} barColor={COLORS.breaking} pct={0.85} anim={clamp01((local - 5) / 12)} compact />
              <SpecBarRow label="MONEYVIEW: 96.80M BREAKOUT" subLabel="Massive institutional long buildup" valueText={`₹${mv.ltp.toFixed(2)} (+3.88%)`} barColor={COLORS.bullishBright} pct={0.88} anim={clamp01((local - 10) / 12)} compact />
              <SpecBarRow label="MONEYVIEW: 20 DEMA CRADLE" subLabel="Rising daily moving average support" valueText={`₹${mv.dema20.toFixed(2)}`} barColor={COLORS.accent} pct={0.72} anim={clamp01((local - 15) / 12)} compact />
              <SpecBarRow label="IIFLCAPS: 20 DEMA RECLAIM" subLabel="85% Bullish OI sentiment intact" valueText="₹351.14 / POC ₹347.58" barColor={COLORS.bullishBright} pct={0.78} anim={clamp01((local - 20) / 12)} compact />
              <SpecBarRow label="COALINDIA: POC CONSOLIDATION" subLabel="Coiling at monthly POC boundary" valueText="POC ₹403.50 / 20D ₹388" barColor={COLORS.cyan} pct={0.65} anim={clamp01((local - 25) / 12)} compact />
            </div>
          </AbsoluteFill>
        );
      }}
    </WideChapterShell>
  );
};

/* =========================================================================
   CHAPTER 5: WATCHLIST RECAP & CLOSING
   ========================================================================= */
export const Ch5Recap = () => {
  const timing = getChTiming('fv_ch5_recap');
  const c1 = timing.cue_frames[1] ?? 360;

  return (
    <WideChapterShell
      chapterId="fv_ch5_recap"
      stingKicker="CHAPTER 5 · CLOSING SUMMARY"
      stingTitle="WATCHLIST & LEVELS"
      leftBreadcrumb="NEXT-DAY RADAR · RISK DISCIPLINE"
      endTitle="DEMA ANALYSIS"
      endSubtitle="DAILY TECHNICAL BROADCAST · NOV 13, 2026"
      endBullet="SUBSCRIBE FOR DAILY INSTITUTIONAL FOOTPRINT BRIEFS"
      finalChapter
      getStrap={(frame) => ({
        tabLabel: frame < c1 ? 'WATCHLIST' : 'SUBSCRIBE',
        tabBg: COLORS.accent,
        tabColor: COLORS.ink,
        contextChip: 'KEY LEVELS TOMORROW',
        headline:
          frame < c1
            ? 'TMCV DEFENDS ₹432.75 · MONEYVIEW TARGETS ₹62 · NIFTY 25,144 PIVOT'
            : 'DISCLAIMER: TECHNICAL CHART EDUCATION ONLY · NO FINANCIAL ADVICE',
        rightSource: 'DEMA ANALYSIS DAILY DESK',
      })}
    >
      {({ frame, fps }) => {
        const local = frame - 45;
        const watchItems = [
          { sym: 'NIFTY 50', lvl: '₹25,054 – ₹25,246', bias: 'RANGE RETEST', col: COLORS.breaking },
          { sym: 'TMCV', lvl: '200 DEMA ₹432.75', bias: 'FLOOR REBOUND', col: COLORS.bullishBright },
          { sym: 'MONEYVIEW', lvl: 'VAH ₹58.15 / ₹62+', bias: 'EXPANSION', col: COLORS.bullishBright },
          { sym: 'IIFLCAPS', lvl: '20 DEMA ₹351.14', bias: 'BULLISH STACK', col: COLORS.accent },
          { sym: 'COALINDIA', lvl: 'POC ₹403.50', bias: 'CONSOLIDATION', col: COLORS.cyan },
        ];

        return (
          <AbsoluteFill style={{ padding: '115px 96px 175px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold, letterSpacing: '0.14em' }}>
                  SESSION RECAP · TOMORROW\'S WATCHLIST
                </div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 58, color: COLORS.paper, marginTop: 4 }}>
                  CRITICAL PIVOTS & CONFLUENCE ZONES
                </div>
              </div>
              <SlantedStamp text="TRADE SAFE" color={COLORS.accent} frame={frame} startFrame={55} fps={fps} size={42} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {watchItems.map((item, idx) => (
                <div
                  key={item.sym}
                  style={{
                    backgroundColor: COLORS.ink2,
                    border: `1.5px solid ${COLORS.border}`,
                    borderTop: `6px solid ${item.col}`,
                    borderRadius: 12,
                    padding: '24px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 240,
                    opacity: clamp01((local - idx * 6) / 12),
                    transform: `translateY(${interpolate(clamp01((local - idx * 6) / 12), [0, 1], [24, 0])}px)`,
                  }}
                >
                  <div>
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 28, color: COLORS.paper }}>
                      {item.sym}
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 14, color: item.col, marginTop: 4 }}>
                      {item.bias}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>KEY LEVEL</div>
                    <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, color: COLORS.paper, marginTop: 4 }}>
                      {item.lvl}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: COLORS.ink2,
                borderRadius: 10,
                padding: '14px 24px',
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.muted }}>
                CAPITAL PRESERVATION IS RULE NUMBER ONE · ALWAYS RESPECT INVALIDATION LEVELS
              </span>
              <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 14, color: COLORS.accent }}>
                SUBSCRIBE TO DEMA ANALYSIS
              </span>
            </div>
          </AbsoluteFill>
        );
      }}
    </WideChapterShell>
  );
};

