import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Closet3Reel} from './Closet3Reel.jsx';
import project from '../closet-3-project.json';

function Closet3Root() {
  return (
    <Composition
      id="Closet3Reel"
      component={Closet3Reel}
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

registerRoot(Closet3Root);
