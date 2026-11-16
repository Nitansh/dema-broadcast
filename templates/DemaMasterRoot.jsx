import React from 'react';
import { Composition } from 'remotion';

let audioManifest = {};
try {
  audioManifest = require('../../public/data/dema_pack_audio_manifest_20261113.json');
} catch (e) {
  try {
    audioManifest = require('../../public/data/dema_suite_audio_manifest_en.json');
  } catch (e2) {}
}

import {
  CumminsMotionDoctrineReel,
  CUMMINS_MOTION_DOCTRINE_FRAMES,
} from '../CumminsMotionDoctrineReel';
import {
  CumminsExplainerReel,
  CUMMINS_EXPLAINER_TOTAL_FRAMES,
} from '../CumminsExplainerReel';
import {
  CumminsYouTubeExplainer16x9,
  CUMMINS_YT_TOTAL_FRAMES,
} from '../CumminsYouTubeExplainer16x9';
import {
  WaareeYouTubeExplainer16x9,
  WAAREE_YT_TOTAL_FRAMES,
} from '../WaareeYouTubeExplainer16x9';
import {
  StockExplainerReel,
} from '../StockExplainer/StockExplainerReel';
import {
  StockYouTubeExplainer16x9,
} from '../StockExplainer/StockYouTubeExplainer16x9';
import {
  Reel1Macro,
  Reel2Losers,
  Reel3Gainers,
  Reel4Momentum,
  Reel5Itc,
  Reel6Adanient,
  Reel7Cochinship,
  Reel8Goldbees,
  Reel5CoalIndia,
  Reel6IiflCaps,
  Reel7BlueStarCo,
  Reel8Indigo,
  Reel9CumminsInd,
  Reel10Abb,
  Reel5DeepDive,
} from './DemaVerticalReels';
import {
  Ch1Intro,
  Ch2Macro,
  Ch3Movers,
  Ch4Itc,
  Ch5Adanient,
  Ch6Cochinship,
  Ch7Goldbees,
  Ch8Recap,
  Ch4DeepDive,
  Ch5Recap,
} from './DemaFullChapters';

const rDur = (id) => audioManifest?.reels?.[id]?.frames_30fps ?? 1080;
const cDur = (id) => {
  if (audioManifest?.chapters?.[id]?.frames_30fps) {
    return audioManifest.chapters[id].frames_30fps;
  }
  const fallbacks = {
    fv_ch1_intro: 2250,      // 75s
    fv_ch2_macro: 7650,      // 255s
    fv_ch3_movers: 7200,     // 240s
    fv_ch4_coalindia: 6300,  // 210s
    fv_ch5_iiflcaps: 6300,   // 210s
    fv_ch6_bluestarco: 6300, // 210s
    fv_ch7_recap: 1800,      // 60s
  };
  return fallbacks[id] || 2250;
};

export const DemaSuiteRoot = () => {
  return (
    <>
      {/* 7 STANDALONE ENGAGING 9:16 VERTICAL REELS (1080x1920 @ 30fps) */}
      <Composition
        id="DemaReel1Macro"
        component={Reel1Macro}
        durationInFrames={rDur('reel_1_macro')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel2Losers"
        component={Reel2Losers}
        durationInFrames={rDur('reel_2_losers')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel3Gainers"
        component={Reel3Gainers}
        durationInFrames={rDur('reel_3_gainers')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel4Momentum"
        component={Reel4Momentum}
        durationInFrames={rDur('reel_4_momentum')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel5Itc"
        component={Reel5Itc}
        durationInFrames={rDur('reel_5_itc')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel6Adanient"
        component={Reel6Adanient}
        durationInFrames={rDur('reel_6_adanient')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel7Cochinship"
        component={Reel7Cochinship}
        durationInFrames={rDur('reel_7_cochinship')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel8Goldbees"
        component={Reel8Goldbees}
        durationInFrames={rDur('reel_8_goldbees')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel5CoalIndia"
        component={Reel5CoalIndia}
        durationInFrames={rDur('reel_5_coalindia')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel6IiflCaps"
        component={Reel6IiflCaps}
        durationInFrames={rDur('reel_6_iiflcaps')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel7BlueStarCo"
        component={Reel7BlueStarCo}
        durationInFrames={rDur('reel_7_bluestarco')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel8Indigo"
        component={Reel8Indigo}
        durationInFrames={rDur('reel_8_indigo')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel9CumminsInd"
        component={Reel9CumminsInd}
        durationInFrames={rDur('reel_9_cumminsind')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel10Abb"
        component={Reel10Abb}
        durationInFrames={rDur('reel_10_abb')}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemaReel5DeepDive"
        component={Reel5DeepDive}
        durationInFrames={rDur('reel_5_coalindia')}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 7 CHAPTERS FOR 20-25 MIN MASTER 16:9 BROADCAST VIDEO (1920x1080 @ 30fps) */}
      <Composition
        id="FullVideoCh1Intro"
        component={Ch1Intro}
        durationInFrames={cDur('fv_ch1_intro')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh2Macro"
        component={Ch2Macro}
        durationInFrames={cDur('fv_ch2_macro')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh3Movers"
        component={Ch3Movers}
        durationInFrames={cDur('fv_ch3_movers')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh4Itc"
        component={Ch4Itc}
        durationInFrames={cDur('fv_ch4_itc')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh5Adanient"
        component={Ch5Adanient}
        durationInFrames={cDur('fv_ch5_adanient')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh6Cochinship"
        component={Ch6Cochinship}
        durationInFrames={cDur('fv_ch6_cochinship')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh7Goldbees"
        component={Ch7Goldbees}
        durationInFrames={cDur('fv_ch7_goldbees')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh8Recap"
        component={Ch8Recap}
        durationInFrames={cDur('fv_ch8_recap')}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Backward compatibility aliases */}
      <Composition
        id="FullVideoCh4DeepDive"
        component={Ch4DeepDive}
        durationInFrames={cDur('fv_ch4_coalindia')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideoCh5Recap"
        component={Ch5Recap}
        durationInFrames={cDur('fv_ch7_recap')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh1Intro"
        component={Ch1Intro}
        durationInFrames={cDur('fv_ch1_intro')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh2Macro"
        component={Ch2Macro}
        durationInFrames={cDur('fv_ch2_macro')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh3Movers"
        component={Ch3Movers}
        durationInFrames={cDur('fv_ch3_movers')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh4Itc"
        component={Ch4Itc}
        durationInFrames={cDur('fv_ch4_itc')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh5Adanient"
        component={Ch5Adanient}
        durationInFrames={cDur('fv_ch5_adanient')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh6Cochinship"
        component={Ch6Cochinship}
        durationInFrames={cDur('fv_ch6_cochinship')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh7Goldbees"
        component={Ch7Goldbees}
        durationInFrames={cDur('fv_ch7_goldbees')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh8Recap"
        component={Ch8Recap}
        durationInFrames={cDur('fv_ch8_recap')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh4DeepDive"
        component={Ch4DeepDive}
        durationInFrames={cDur('fv_ch4_itc')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh5Recap"
        component={Ch5Recap}
        durationInFrames={cDur('fv_ch8_recap')}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* DEDICATED MOTION DOCTRINE CUMMINS INDIA REEL (1080x1920 @ 30fps) */}
      <Composition
        id="CumminsMotionDoctrine"
        component={CumminsMotionDoctrineReel}
        durationInFrames={CUMMINS_MOTION_DOCTRINE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* CUMMINS INDIA SUPPORT / RESISTANCE & TARGET EXPLAINER (1080x1920 @ 30fps) */}
      <Composition
        id="CumminsExplainer"
        component={CumminsExplainerReel}
        durationInFrames={CUMMINS_EXPLAINER_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* CUMMINS INDIA 16:9 FULL YOUTUBE VIDEO (1920x1080 @ 30fps) */}
      <Composition
        id="CumminsYouTubeExplainer16x9"
        component={CumminsYouTubeExplainer16x9}
        durationInFrames={CUMMINS_YT_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* WAAREE ENERGIES 16:9 FULL YOUTUBE VIDEO (1920x1080 @ 30fps) */}
      <Composition
        id="WaareeYouTubeExplainer16x9"
        component={WaareeYouTubeExplainer16x9}
        durationInFrames={WAAREE_YT_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* UNIVERSAL STOCK EXPLAINER REEL (9:16 | 1080x1920 @ 30fps) */}
      <Composition
        id="StockExplainerReel"
        component={StockExplainerReel}
        durationInFrames={3656}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ manifestPath: 'data/cummins_explainer_manifest.json' }}
      />

      {/* UNIVERSAL STOCK YOUTUBE EXPLAINER (16:9 | 1920x1080 @ 30fps) */}
      <Composition
        id="StockYouTubeExplainer16x9"
        component={StockYouTubeExplainer16x9}
        durationInFrames={3656}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifestPath: 'data/cummins_explainer_manifest.json' }}
      />

      {/* COAL INDIA EXPLAINER SUITE (9:16 & 16:9) */}
      <Composition
        id="CoalIndiaExplainer"
        component={StockExplainerReel}
        durationInFrames={3765}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ manifestPath: 'data/coalindia_explainer_manifest.json' }}
      />
      <Composition
        id="CoalIndiaYouTubeExplainer16x9"
        component={StockYouTubeExplainer16x9}
        durationInFrames={3765}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifestPath: 'data/coalindia_explainer_manifest.json' }}
      />

      {/* IIFL CAPITAL SERVICES EXPLAINER SUITE (9:16 & 16:9) */}
      <Composition
        id="IiflCapsExplainer"
        component={StockExplainerReel}
        durationInFrames={3656}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ manifestPath: 'data/iiflcaps_explainer_manifest.json' }}
      />
      <Composition
        id="IiflCapsYouTubeExplainer16x9"
        component={StockYouTubeExplainer16x9}
        durationInFrames={3656}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifestPath: 'data/iiflcaps_explainer_manifest.json' }}
      />

      {/* BLUE STAR EXPLAINER SUITE (9:16 & 16:9) */}
      <Composition
        id="BlueStarCoExplainer"
        component={StockExplainerReel}
        durationInFrames={3656}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ manifestPath: 'data/bluestarco_explainer_manifest.json' }}
      />
      <Composition
        id="BlueStarCoYouTubeExplainer16x9"
        component={StockYouTubeExplainer16x9}
        durationInFrames={3656}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifestPath: 'data/bluestarco_explainer_manifest.json' }}
      />

      {/* ABB INDIA EXPLAINER SUITE (9:16 & 16:9) */}
      <Composition
        id="AbbExplainer"
        component={StockExplainerReel}
        durationInFrames={3656}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ manifestPath: 'data/abb_explainer_manifest.json' }}
      />
      <Composition
        id="AbbYouTubeExplainer16x9"
        component={StockYouTubeExplainer16x9}
        durationInFrames={3656}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifestPath: 'data/abb_explainer_manifest.json' }}
      />
    </>
  );
};
