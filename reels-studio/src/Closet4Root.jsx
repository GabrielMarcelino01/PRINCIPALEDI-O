import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Closet4Reel} from './Closet4Reel.jsx';
import project from '../closet-4-project.json';

function Closet4Root() {
  return (
    <Composition
      id="Closet4Reel"
      component={Closet4Reel}
      width={project.width}
      height={project.height}
      fps={project.fps}
      durationInFrames={project.durationInFrames}
      defaultProps={{project}}
      calculateMetadata={({props}) => ({
        width: props.project.width,
        height: props.project.height,
        fps: props.project.fps,
        durationInFrames: props.project.durationInFrames,
      })}
    />
  );
}

registerRoot(Closet4Root);
