import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Closet5Reel} from './Closet5Reel.jsx';
import project from '../closet-5-project.json';

function Closet5Root() {
  return (
    <Composition
      id="Closet5Reel"
      component={Closet5Reel}
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

registerRoot(Closet5Root);
