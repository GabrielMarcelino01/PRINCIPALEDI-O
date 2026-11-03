import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FashionReel} from './FashionReel.jsx';
import project from '../fashion-project.json';

function FashionRoot() {
  return (
    <Composition
      id="FashionReel"
      component={FashionReel}
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

registerRoot(FashionRoot);
