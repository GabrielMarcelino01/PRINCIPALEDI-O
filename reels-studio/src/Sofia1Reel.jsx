import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, cancelRender, continueRender,
  delayRender, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

function useEditorialFonts() {
  const [handle] = React.useState(() => delayRender('Carregando fontes SOFIA-1'));
  React.useEffect(() => {
    let active = true;
    const inter = new FontFace('Inter', `url("${staticFile('fonts/inter-latin-wght-normal.woff2')}") format("woff2")`, {style: 'normal', weight: '100 900'});
    const playfair = new FontFace('Playfair Display', `url("${staticFile('fonts/playfair-display-latin-wght-italic.woff2')}") format("woff2")`, {style: 'italic', weight: '400 900'});
    Promise.all([inter.load(), playfair.load()]).then(([a, b]) => {
      if (!active) return;
      document.fonts.add(a);
      document.fonts.add(b);
      continueRender(handle);
    }).catch(cancelRender);
    return () => { active = false; };
  }, [handle]);
}

function sceneAt(project, time) {
  const frame = Math.round(time * project.fps);
  return project.scenes.find((scene) => frame >= scene.startFrame && frame < scene.endFrame) || project.scenes[project.scenes.length - 1];
}

function cameraAt(scene, time) {
  const local = time - scene.start;
  if (scene.cta) return {scale: 1.015, x: 0, y: -8};
  const entrance = ease(local / 0.36);
  const drift = ease(local / scene.duration);
  const scale = 1.065 - 0.035 * entrance + 0.014 * drift;
  const direction = scene.index % 2 === 0 ? 1 : -1;
  return {scale, x: direction * (1 - entrance) * 12, y: -10 - 7 * drift};
}

function EditorialHeader({project, scene, time}) {
  const local = time - scene.start;
  const enter = scene.index === 0 || scene.cta ? spring({frame: Math.max(0, local * project.fps), fps: project.fps, durationInFrames: 20, config: {damping: 16, stiffness: 160, mass: 0.7}}) : 1;
  return (
    <div style={{position: 'absolute', top: 88, left: 58, right: 118, color: '#fffaf2', opacity: clamp(enter * 1.4)}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontFamily: 'Inter, Arial, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: 3.2, textShadow: '0 2px 14px rgba(0,0,0,.5)'}}>{project.title}</div>
        {!scene.cta && <div style={{fontFamily: 'Inter, Arial, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: 2}}>0{scene.index + 1} / 04</div>}
      </div>
      <div style={{marginTop: 15, height: 2, background: 'rgba(255,255,255,.26)'}}>
        <div style={{height: '100%', width: `${clamp(local / scene.duration) * 100}%`, background: scene.new, boxShadow: `0 0 12px ${scene.new}`}} />
      </div>
    </div>
  );
}

function Palette({scene, time, fps}) {
  if (scene.cta) return null;
  const turned = time >= scene.switchOutput;
  const local = time - scene.start;
  const enter = scene.index === 0 ? spring({frame: Math.max(0, local * fps), fps, durationInFrames: 22, config: {damping: 15, stiffness: 150, mass: 0.7}}) : 1;
  const turn = spring({frame: Math.max(0, (time - scene.switchOutput) * fps), fps, durationInFrames: 22, config: {damping: 14, stiffness: 170, mass: 0.65}});
  const accentName = turned ? scene.newName : scene.oldName;
  const accent = turned ? scene.new : scene.old;
  const descriptor = turned ? scene.newDescriptor : scene.oldDescriptor;
  return (
    <div style={{
      position: 'absolute', top: 168, left: 58, right: 118, height: 170,
      borderRadius: 25, padding: '22px 26px', boxSizing: 'border-box',
      background: 'linear-gradient(120deg,rgba(17,18,20,.82),rgba(20,20,22,.61))',
      border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 16px 45px rgba(0,0,0,.22)',
      backdropFilter: 'blur(14px)', opacity: clamp(enter * 1.5),
      transform: `translateY(${(1 - enter) * 18}px)`,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{display: 'flex', alignItems: 'center', minWidth: 300}}>
          <div style={{width: 58, height: 58, borderRadius: '50%', background: scene.base, border: '2px solid rgba(255,255,255,.72)', boxShadow: '0 5px 18px rgba(0,0,0,.25)'}} />
          <div style={{marginLeft: 14, fontFamily: 'Inter, Arial, sans-serif', color: '#fff', fontSize: 22, fontWeight: 850, letterSpacing: 1.2}}>{scene.baseName}</div>
        </div>
        <div style={{fontFamily: 'Inter, Arial, sans-serif', color: 'rgba(255,255,255,.62)', fontSize: 27, fontWeight: 400}}>+</div>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', flex: 1, transform: `scale(${turned ? 1 + 0.035 * Math.sin(Math.PI * clamp((time - scene.switchOutput) / 0.45)) : 1})`}}>
          <div style={{width: 58, height: 58, borderRadius: '50%', background: accent, border: '2px solid rgba(255,255,255,.72)', boxShadow: turned ? `0 0 24px ${accent}55` : 'none'}} />
          <div style={{marginLeft: 14, fontFamily: 'Inter, Arial, sans-serif', color: '#fff', fontSize: 22, fontWeight: 850, letterSpacing: 1.1}}>{accentName}</div>
        </div>
        <div style={{width: 11, height: 11, borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}`, transform: `scale(${turned ? turn : 1})`}} />
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 17}}>
        <div style={{fontFamily: 'Inter, Arial, sans-serif', fontSize: 15, fontWeight: 750, letterSpacing: 3.2, color: 'rgba(255,255,255,.55)'}}>{turned ? 'A VIRADA' : 'O CLÁSSICO'}</div>
        <div style={{
          fontFamily: turned ? '"Playfair Display", Georgia, serif' : 'Inter, Arial, sans-serif',
          fontStyle: turned ? 'italic' : 'normal', fontWeight: turned ? 600 : 800,
          fontSize: turned ? 29 : 20, letterSpacing: turned ? -0.5 : 2.2,
          color: turned ? (scene.textAccent || accent) : 'rgba(255,255,255,.78)',
          transform: `translateY(${turned ? (1 - turn) * 10 : 0}px)`, opacity: turned ? clamp(turn * 1.5) : 1,
        }}>{descriptor}</div>
      </div>
    </div>
  );
}

function CaptionWord({word, time, fps, accent, fontSize}) {
  const active = time >= word.startOutput && time < word.endOutput;
  const local = time - word.startOutput;
  const enter = spring({frame: Math.max(0, local * fps), fps, durationInFrames: 12, config: {damping: 15, stiffness: 190, mass: 0.55}});
  return (
    <span style={{
      display: 'inline-block', whiteSpace: 'pre', fontFamily: 'Inter, Arial, sans-serif',
      fontSize, fontWeight: active ? 900 : 750, lineHeight: 1.08, letterSpacing: -1.8,
      color: active ? accent : '#fffaf4',
      textShadow: '0 3px 14px rgba(0,0,0,.88), 0 1px 3px rgba(0,0,0,.95)',
      transform: `translateY(${(1 - enter) * 7}px) scale(${active ? 1.025 : 1})`,
      opacity: clamp(0.88 + enter * 0.12),
    }}>{word.text}</span>
  );
}

function Captions({project, scene, time, fps}) {
  const frame = Math.round(time * fps);
  const group = project.captions.find((item) => frame >= Math.round(item.start * fps) && frame < Math.round(item.end * fps));
  if (!group) return null;
  const enter = spring({frame: Math.max(0, (time - group.start) * fps), fps, durationInFrames: 14, config: {damping: 16, stiffness: 170, mass: 0.6}});
  const turned = scene.switchOutput !== null && time >= scene.switchOutput;
  const accent = scene.cta ? '#E8C9D3' : turned ? (scene.textAccent || scene.new) : '#fffaf4';
  return (
    <div style={{
      position: 'absolute', left: 58, right: 118, top: project.captionStyle.top,
      transform: 'translateY(-100%)', textAlign: 'center', pointerEvents: 'none',
      opacity: clamp(enter * 1.5),
    }}>
      <div style={{display: 'inline-block', padding: '17px 25px 19px', borderRadius: 21, background: 'rgba(12,12,14,.56)', border: '1px solid rgba(255,255,255,.13)', backdropFilter: 'blur(8px)'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
          {group.lines.map((line, index) => (
            <div key={`${group.id}-${index}`} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 13, rowGap: 5}}>
              {line.map((word, wordIndex) => <CaptionWord key={`${group.id}-${index}-${wordIndex}`} word={word} time={time} fps={fps} accent={accent} fontSize={project.captionStyle.fontSize} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FollowCta({scene, time, fps}) {
  if (!scene.cta) return null;
  const enter = spring({frame: Math.max(0, (time - scene.start - 0.65) * fps), fps, durationInFrames: 24, config: {damping: 14, stiffness: 160, mass: 0.7}});
  return (
    <div style={{position: 'absolute', top: 1460, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: clamp(enter * 1.4), transform: `translateY(${(1 - enter) * 18}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '19px 34px', borderRadius: 22, background: 'linear-gradient(135deg,#fff8ef,#e7d4bd)', color: '#25191e', boxShadow: '0 14px 36px rgba(0,0,0,.30)', fontFamily: 'Inter, Arial, sans-serif', fontSize: 32, fontWeight: 900, letterSpacing: 1.2}}>
        <span style={{width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#711F3B', color: '#fff', fontSize: 31}}>+</span>
        SEGUIR PARA MAIS
      </div>
    </div>
  );
}

function TrackedAccent({project, scene, time}) {
  const tracking = project.tracking;
  if (!tracking || scene.index !== 0) return null;
  const useUntil = tracking.useUntil ?? 1.0;
  if (time > useUntil) return null;
  const samples = tracking.samples;
  if (!samples || samples.length < 2) return null;
  const sourceTime = time + scene.sourceStart;
  let right = samples.findIndex((sample) => sample.time >= sourceTime);
  if (right < 1) right = 1;
  if (right >= samples.length) right = samples.length - 1;
  const a = samples[right - 1];
  const b = samples[right];
  const mix = clamp((sourceTime - a.time) / Math.max(1e-6, b.time - a.time));
  if (!a.visible[0] || !b.visible[0]) return null;
  const x = (a.positions_xy[0][0] + (b.positions_xy[0][0] - a.positions_xy[0][0]) * mix) * 1.5;
  const y = (a.positions_xy[0][1] + (b.positions_xy[0][1] - a.positions_xy[0][1]) * mix) * 1.5;
  const camera = cameraAt(scene, time);
  const cx = 540 + (x - 540) * camera.scale + camera.x;
  const cy = 960 + (y - 960) * camera.scale + camera.y;
  const appear = ease(time / 0.18) * ease((useUntil - time) / 0.18);
  const pulse = 1 + 0.10 * Math.sin(time * Math.PI * 4);
  return (
    <div style={{position: 'absolute', left: cx, top: cy, width: 0, height: 0, opacity: appear, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -42, top: -42, width: 84, height: 84, borderRadius: '50%', border: `3px solid ${scene.new}`, boxShadow: `0 0 24px ${scene.new}88`, transform: `scale(${pulse})`}} />
      <div style={{position: 'absolute', left: -1.5, top: 42, width: 3, height: 18, background: scene.new}} />
      <div style={{position: 'absolute', left: 0, top: 58, transform: 'translateX(-50%)', padding: '10px 16px', borderRadius: 12, background: scene.new, color: '#25301c', fontFamily: 'Inter, Arial, sans-serif', fontSize: 18, fontWeight: 900, letterSpacing: 1.4, whiteSpace: 'nowrap'}}>TOQUE DE COR</div>
    </div>
  );
}

function SafeZones({project}) {
  const zone = (style, label) => <div style={{position: 'absolute', background: 'rgba(255,50,80,.12)', border: '1px dashed rgba(255,90,110,.8)', color: '#ffb3bd', fontSize: 18, padding: 8, ...style}}>{label}</div>;
  const {top, bottom, left, right} = project.safeZones;
  return <>{zone({top: 0, left: 0, right: 0, height: top}, 'TOP UI')}{zone({bottom: 0, left: 0, right: 0, height: bottom}, 'BOTTOM UI')}{zone({top, bottom, left: 0, width: left}, '')}{zone({top, bottom, right: 0, width: right}, '')}</>;
}

export function Sofia1Reel({project}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  useEditorialFonts();
  const scene = sceneAt(project, time);
  const localFrame = Math.round((time - scene.start) * fps);
  const camera = cameraAt(scene, time);
  return (
    <AbsoluteFill style={{background: '#111113', overflow: 'hidden'}}>
      {project.scenes.map((item) => (
        <Sequence key={item.id} from={item.startFrame} durationInFrames={item.durationInFrames} premountFor={30}>
          <AbsoluteFill style={{transform: `translate(${cameraAt(item, item.start + localFrame / fps).x}px, ${cameraAt(item, item.start + localFrame / fps).y}px) scale(${cameraAt(item, item.start + localFrame / fps).scale})`, transformOrigin: '50% 50%'}}>
            <OffthreadVideo
              src={staticFile(project.video)}
              muted
              preload="auto"
              startFrom={Math.round(item.sourceStart * fps)}
              style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.035) contrast(1.025) brightness(1.015)'}}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(8,8,10,.30),transparent 25%,transparent 63%,rgba(8,8,10,.30))'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 150px rgba(0,0,0,.18)'}} />
      <EditorialHeader project={project} scene={scene} time={time} />
      <Palette scene={scene} time={time} fps={fps} />
      <TrackedAccent project={project} scene={scene} time={time} />
      <Captions project={project} scene={scene} time={time} fps={fps} />
      <FollowCta scene={scene} time={time} fps={fps} />
      {project.showSafeZones && <SafeZones project={project} />}
      <Audio src={staticFile(project.audio)} volume={1} />
    </AbsoluteFill>
  );
}
