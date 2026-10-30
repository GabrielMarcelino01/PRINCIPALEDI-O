import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Closet10Reel} from './Closet10Reel.jsx';
import project from '../closet-10-project.json';

function Closet10Root() {
  return (
    <Composition
      id="Closet10Reel"
      component={Closet10Reel}
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

registerRoot(Closet10Root);
