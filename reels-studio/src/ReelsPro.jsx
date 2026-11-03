import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {SceneVisual} from './visuals.jsx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

function useInterFont() {
  const [handle] = React.useState(() => delayRender('Carregando a fonte Inter local'));
  const fontUrl = staticFile('fonts/inter-latin-wght-normal.woff2');
  React.useEffect(() => {
    let active = true;
    const font = new FontFace('Inter', `url("${fontUrl}") format("woff2")`, {
      style: 'normal', weight: '100 900', display: 'block',
    });
    font.load().then((loaded) => {
      if (!active) return;
      document.fonts.add(loaded);
      continueRender(handle);
    }).catch((error) => cancelRender(error));
    return () => { active = false; };
  }, [fontUrl, handle]);
}

function Scene({scene, project, index}) {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 5], [0, 1], clamp);
  const exit = index === project.scenes.length - 1 ? 1 : interpolate(frame, [scene.durationInFrames - 4, scene.durationInFrames], [1, 0.72], clamp);
  return (
    <AbsoluteFill style={{opacity: enter * exit}}>
      <SceneVisual scene={scene} project={project} />
      <div style={{
        position: 'absolute', left: 64, right: 120, top: 246, display: 'flex', alignItems: 'center', gap: 20,
        opacity: interpolate(frame, [3, 14], [0, 1], clamp),
        transform: `translateY(${interpolate(frame, [3, 14], [16, 0], clamp)}px)`,
      }}>
        <div style={{width: 42, height: 4, borderRadius: 4, background: scene.accent}} />
        <div style={{fontSize: 23, fontWeight: 800, letterSpacing: 3.2, color: '#fff'}}>{scene.label}</div>
        <div style={{marginLeft: 'auto', fontSize: 20, fontWeight: 650, color: 'rgba(255,255,255,0.42)'}}>{String(index + 1).padStart(2, '0')} / {String(project.scenes.length).padStart(2, '0')}</div>
      </div>
    </AbsoluteFill>
  );
}

function Captions({project}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  for (const scene of project.scenes) {
    for (const group of scene.groups) {
      if (time < group.start || time >= group.end) continue;
      const groupFrame = frame - group.start * fps;
      const enter = spring({frame: Math.max(0, groupFrame), fps, config: {damping: 24, stiffness: 240, mass: 0.7}});
      const exit = interpolate(time, [group.end - 0.07, group.end], [1, 0], clamp);
      const textLength = group.words.map((word) => word.text).join(' ').length;
      const fontSize = textLength > 19 ? 64 : textLength > 16 ? 70 : project.captionStyle.fontSize;
      let activeIndex = group.words.findIndex((word) => time >= word.start && time < word.end);
      if (activeIndex < 0) activeIndex = group.words.length - 1;
      return (
        <div key={`${scene.id}-${group.start}`} style={{
          position: 'absolute', top: project.captionStyle.top, left: 60, right: 120,
          display: 'flex', justifyContent: 'center', opacity: enter * exit,
          transform: `translateY(${(1 - enter) * 26}px)`,
        }}>
          <div style={{
            maxWidth: project.captionStyle.maxWidth, boxSizing: 'border-box', padding: '20px 24px 24px',
            borderRadius: 28, background: 'rgba(5,8,13,0.50)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)', boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 10, rowGap: 8,
          }}>
            {group.words.map((word, index) => {
              const active = index === activeIndex;
              const wordFrame = frame - word.start * fps;
              const pop = active ? spring({frame: Math.max(0, wordFrame), fps, config: {damping: 15, stiffness: 170}}) : 1;
              return (
                <span key={`${word.text}-${index}`} style={{
                  display: 'inline-block', padding: '2px 12px', borderRadius: 13,
                  fontSize, lineHeight: 1.06, fontWeight: 850, letterSpacing: -2.2,
                  color: active ? '#111620' : '#fff', background: active ? scene.accent : 'transparent',
                  textShadow: active ? 'none' : '0 4px 18px rgba(0,0,0,0.80)',
                  transform: `scale(${active ? 0.96 + pop * 0.04 : 1})`, transformOrigin: 'center',
                  whiteSpace: 'nowrap',
                }}>{word.text}</span>
              );
            })}
          </div>
        </div>
      );
    }
  }
  return null;
}

function SafeZones({project}) {
  if (!project.showSafeZones) return null;
  const zone = project.safeZones;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 50}}>
      <div style={{position: 'absolute', left: zone.left, right: zone.right, top: zone.top, bottom: zone.bottom, border: '3px dashed rgba(103,232,249,0.85)', boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', top: 12, left: 12, padding: 10, background: '#081018', color: '#67e8f9', fontSize: 22, fontWeight: 750}}>SAFE ZONE CONSERVADORA — REVISAR NO CELULAR</div>
      </div>
    </AbsoluteFill>
  );
}

export function ReelsPro({project}) {
  useInterFont();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#171c28', color: '#fff', fontFamily: 'Inter, Arial, sans-serif'}}>
      {project.scenes.map((scene, index) => (
        <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames} name={scene.label}>
          <Scene scene={scene} project={project} index={index} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 60, right: 120, top: 78, display: 'flex', alignItems: 'center', zIndex: 20}}>
        <div style={{fontSize: 25, fontWeight: 900, letterSpacing: -0.8}}>REELS<span style={{color: '#ffc24b'}}>/</span>PRO</div>
        <div style={{marginLeft: 'auto', fontSize: 17, fontWeight: 700, letterSpacing: 2.5, color: 'rgba(255,255,255,0.48)'}}>EDIÇÃO · MOTION · ÁUDIO</div>
      </div>
      <Captions project={project} />
      <div style={{position: 'absolute', left: 60, right: 120, top: 1518, display: 'flex', gap: 10, opacity: 0.58}}>
        {project.scenes.map((scene) => {
          const active = frame >= scene.startFrame && frame < scene.startFrame + scene.durationInFrames;
          const local = Math.max(0, Math.min(1, (frame - scene.startFrame) / scene.durationInFrames));
          return <div key={scene.id} style={{flex: scene.durationInFrames, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.13)', overflow: 'hidden'}}>
            <div style={{width: `${active ? local * 100 : frame >= scene.startFrame + scene.durationInFrames ? 100 : 0}%`, height: '100%', background: scene.accent}} />
          </div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 0, left: 0, height: 7, width: `${Math.min(100, frame / durationInFrames * 100)}%`, background: '#ffc24b', zIndex: 30}} />
      <Audio src={staticFile(project.audio)} />
      <SafeZones project={project} />
    </AbsoluteFill>
  );
}
