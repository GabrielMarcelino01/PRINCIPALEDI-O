import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Sofia1Reel} from './Sofia1Reel.jsx';
import project from '../sofia-1-project.json';

function Root() {
  return (
    <Composition
      id="Sofia1Reel"
      component={Sofia1Reel}
      durationInFrames={project.durationInFrames}
      fps={project.fps}
      width={project.width}
      height={project.height}
      defaultProps={{project}}
    />
  );
}

registerRoot(Root);
