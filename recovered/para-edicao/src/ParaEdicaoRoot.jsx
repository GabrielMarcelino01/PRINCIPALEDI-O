import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ParaEdicaoReel} from './ParaEdicaoReel.jsx';
import project from '../para-edicao-project.json';

function ParaEdicaoRoot() {
  return (
    <Composition
      id="ParaEdicaoReel"
      component={ParaEdicaoReel}
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

registerRoot(ParaEdicaoRoot);
