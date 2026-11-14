import React from 'react';
import { Composition } from 'remotion';
import audioManifest from '../../public/data/dema_suite_audio_manifest_20261113.json';
import {
  Reel1Macro,
  Reel2Losers,
  Reel3Gainers,
  Reel4Momentum,
  Reel5DeepDive,
} from './DemaVerticalReels';
import {
  Ch1Intro,
  Ch2Macro,
  Ch3Movers,
  Ch4DeepDive,
  Ch5Recap,
} from './DemaFullChapters';

const rDur = (id) => audioManifest?.reels?.[id]?.frames_30fps ?? 1020;
const cDur = (id) => audioManifest?.chapters?.[id]?.frames_30fps ?? 720;

export const DemaSuiteRoot = () => {
  return (
    <>
      {/* 5 STANDALONE ENGAGING 9:16 VERTICAL REELS (1080x1920 @ 30fps) */}
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
        id="DemaReel5DeepDive"
        component={Reel5DeepDive}
        durationInFrames={rDur('reel_5_deepdive')}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 5 CHAPTERS FOR NATURAL-PACE 16:9 BROADCAST VIDEO (1920x1080 @ 30fps) */}
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
        id="DemaFullCh4DeepDive"
        component={Ch4DeepDive}
        durationInFrames={cDur('fv_ch4_deepdive')}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DemaFullCh5Recap"
        component={Ch5Recap}
        durationInFrames={cDur('fv_ch5_recap')}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

