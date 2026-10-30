import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ReelsPro} from './ReelsPro.jsx';
import project from '../project.json';

function Root() {
  return (
    <Composition
      id="ReelsPro"
      component={ReelsPro}
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

registerRoot(Root);
