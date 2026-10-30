import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Img1680Reel} from './Img1680Reel.jsx';
import project from '../img-1680-project.json';

function Img1680Root() {
  return (
    <Composition
      id="Img1680Reel"
      component={Img1680Reel}
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

registerRoot(Img1680Root);
