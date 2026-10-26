import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {MotionDesignComposition} from './MotionDesignComposition.jsx';
import {DEFAULT_REEL_SCENES, ReelsViralComposition} from './ReelsViralComposition.jsx';
import {DESIGN_SETTINGS, REELS_SETTINGS} from './design-utils.mjs';

function Root() {
  return <>
    <Composition
      id="MotionDesign"
      component={MotionDesignComposition}
      width={DESIGN_SETTINGS.width}
      height={DESIGN_SETTINGS.height}
      fps={DESIGN_SETTINGS.fps}
      durationInFrames={DESIGN_SETTINGS.durationInFrames}
      defaultProps={{}}
    />
    <Composition
      id="ReelsViral"
      component={ReelsViralComposition}
      width={REELS_SETTINGS.width}
      height={REELS_SETTINGS.height}
      fps={REELS_SETTINGS.fps}
      durationInFrames={REELS_SETTINGS.durationInFrames}
      defaultProps={{
        videoUrl: null,
        scenes: DEFAULT_REEL_SCENES,
        accent: '#fbbf24',
        showAudioBars: true,
      }}
    />
  </>;
}

registerRoot(Root);
