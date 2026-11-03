import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ParaEdicao2Reel} from './ParaEdicao2Reel.jsx';
import project from '../para-edicao-2-project.json';

function ParaEdicao2Root() {
  return (
    <Composition
      id="ParaEdicao2Reel"
      component={ParaEdicao2Reel}
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

registerRoot(ParaEdicao2Root);
