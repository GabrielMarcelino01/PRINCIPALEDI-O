import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, cancelRender, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

function useEditorialFonts() {
  const [handle] = React.useState(() => delayRender('Carregando Inter e Playfair Display'));
  const interUrl = staticFile('fonts/inter-latin-wght-normal.woff2');
  const playfairUrl = staticFile('fonts/playfair-display-latin-wght-italic.woff2');
  React.useEffect(() => {
    let active = true;
    const inter = new FontFace('Inter', `url("${interUrl}") format("woff2")`, {style: 'normal', weight: '100 900'});
    const playfair = new FontFace('Playfair Display', `url("${playfairUrl}") format("woff2")`, {style: 'italic', weight: '400 900'});
    Promise.all([inter.load(), playfair.load()]).then(([interLoaded, playfairLoaded]) => {
      if (!active) return;
      document.fonts.add(interLoaded);
      document.fonts.add(playfairLoaded);
      continueRender(handle);
    }).catch((error) => cancelRender(error));
    return () => { active = false; };
  }, [handle, interUrl, playfairUrl]);
}

function sceneAt(project, time) {
  return project.scenes.find((scene) => time >= scene.start && time < scene.end) || project.scenes[project.scenes.length - 1];
}

function Header({project, scene, time, frame, fps}) {
  const enter = spring({frame: Math.max(0, frame - scene.start * fps), fps, config: {damping: 24, stiffness: 220, mass: 0.75}});
  const showCta = time >= project.cta.start;
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 100, top: 176, display: 'flex', alignItems: 'center', zIndex: 5}}>
        <div style={{fontSize: 19, fontWeight: 800, letterSpacing: 3.4, color: 'rgba(255,255,255,0.82)'}}>GUIA DE CORES</div>
        <div style={{marginLeft: 'auto', fontSize: 18, fontWeight: 700, letterSpacing: 2.2, color: 'rgba(255,255,255,0.68)'}}>{scene.number}</div>
      </div>
      <div style={{
        position: 'absolute', left: 60, right: 100, top: 222, zIndex: 5,
        opacity: enter * (showCta ? 0 : 1), transform: `translateY(${(1 - enter) * 18}px)`,
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <span style={{fontSize: 27, fontWeight: 900, letterSpacing: 2.2, color: scene.accent}}>{scene.label}</span>
          <span style={{width: 34, height: 2, background: scene.accent}} />
          <span style={{fontSize: 29, fontWeight: 760, letterSpacing: -0.4, color: '#fff'}}>{scene.header}</span>
          <div style={{marginLeft: 'auto', display: 'flex', gap: 7}}>
            {scene.colors.map((color, index) => <span key={index} style={{width: 17, height: 17, borderRadius: '50%', background: color, border: '1px solid rgba(255,255,255,0.65)'}} />)}
          </div>
        </div>
      </div>
      {showCta && (
        <div style={{
          position: 'absolute', left: 60, right: 100, top: 222, zIndex: 6, textAlign: 'center',
          color: '#fff4d2', fontSize: 31, fontWeight: 850, letterSpacing: 0.7,
          opacity: interpolate(time, [project.cta.start, project.cta.start + 0.20], [0, 1], clamp),
          textShadow: '0 3px 16px rgba(0,0,0,0.65)',
        }}>{project.cta.text}</div>
      )}
    </>
  );
}

function CaptionWord({item, time, frame, fps}) {
  const serif = item.style === 'serif';
  const small = item.style === 'small';
  const active = time >= item.start && time < item.end;
  const pop = active ? spring({frame: Math.max(0, frame - item.start * fps), fps, config: {damping: 17, stiffness: 220}}) : 1;
  const color = item.color || '#ffffff';
  return (
    <span style={{
      display: 'inline-block', whiteSpace: 'nowrap',
      fontFamily: serif ? '"Playfair Display", Georgia, serif' : 'Inter, Arial, sans-serif',
      fontStyle: serif ? 'italic' : 'normal',
      fontSize: small ? 36 : serif ? 78 : 62,
      fontWeight: serif ? 600 : small ? 650 : 850,
      letterSpacing: serif ? -1.8 : small ? 0.8 : -2.1,
      lineHeight: serif ? 1.02 : 1.08,
      color,
      textShadow: active ? `0 3px 4px rgba(0,0,0,0.82), 0 5px 24px ${color}55` : '0 3px 5px rgba(0,0,0,0.90), 0 7px 22px rgba(0,0,0,0.72)',
      transform: `scale(${active ? 1.06 - pop * 0.06 : 1})`, transformOrigin: 'center',
      padding: small ? '0 1px 8px' : '0 2px',
      background: serif ? `linear-gradient(transparent 74%, ${color}30 74%)` : 'none',
      borderRadius: 4,
    }}>{serif ? item.text.toLowerCase() : item.text}</span>
  );
}

function Captions({project, time, frame, fps}) {
  const group = project.groups.find((item) => time >= item.start && time < item.end);
  if (!group) return null;
  const enter = spring({frame: Math.max(0, frame - group.start * fps), fps, config: {damping: 24, stiffness: 250, mass: 0.7}});
  const exit = interpolate(time, [group.end - 0.06, group.end], [1, 0], clamp);
  return (
    <div style={{
      position: 'absolute', left: 60, right: 100, top: project.captionStyle.top, zIndex: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      opacity: enter * exit, transform: `translateY(${(1 - enter) * 22}px)`,
    }}>
      {group.lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{maxWidth: project.captionStyle.maxWidth, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 15, rowGap: 4}}>
          {line.map((item, index) => <CaptionWord key={`${item.text}-${index}`} item={item} time={time} frame={frame} fps={fps} />)}
        </div>
      ))}
    </div>
  );
}

function CutEffects({project, time}) {
  return (
    <>
      {project.cuts.map((cut, index) => {
        if (time < cut - 0.06 || time > cut + 0.18) return null;
        const flash = interpolate(time, [cut - 0.035, cut, cut + 0.09], [0, 0.52, 0], clamp);
        const swipe = interpolate(time, [cut - 0.06, cut + 0.16], [-360, 1440], clamp);
        const accent = project.scenes[index + 1].accent;
        return (
          <React.Fragment key={cut}>
            <AbsoluteFill style={{background: '#fff8ed', opacity: flash, pointerEvents: 'none', zIndex: 12}} />
            <div style={{
              position: 'absolute', top: -80, bottom: -80, left: swipe, width: 210, zIndex: 13,
              background: `linear-gradient(90deg, transparent, ${accent}88, #ffffffaa, transparent)`,
              transform: 'skewX(-12deg)', opacity: 0.58, pointerEvents: 'none',
            }} />
          </React.Fragment>
        );
      })}
    </>
  );
}

function SafeZones({project}) {
  if (!project.showSafeZones) return null;
  const zone = project.safeZones;
  return (
    <AbsoluteFill style={{zIndex: 30, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: zone.left, right: zone.right, top: zone.top, bottom: zone.bottom, border: '3px dashed #67e8f9', boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', top: 10, left: 10, padding: 9, background: '#081018', color: '#67e8f9', fontSize: 20, fontWeight: 750}}>SAFE ZONE — REVISAR NO CELULAR</div>
      </div>
    </AbsoluteFill>
  );
}

export function FashionReel({project}) {
  useEditorialFonts();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const time = frame / fps;
  const scene = sceneAt(project, time);
  const progress = Math.max(0, Math.min(1, (time - scene.start) / (scene.end - scene.start)));
  const pulse = project.emphasisTimes.reduce((total, center) => total + Math.exp(-Math.pow((time - center) / 0.17, 2)) * 0.017, 0);
  const scale = 1.012 + progress * 0.024 + pulse;
  return (
    <AbsoluteFill style={{background: '#111', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(project.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: 'center center'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 390, background: 'linear-gradient(rgba(0,0,0,0.40), transparent)', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.60) 82%, rgba(0,0,0,0.70))', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.16) 100%)', pointerEvents: 'none'}} />
      <Header project={project} scene={scene} time={time} frame={frame} fps={fps} />
      <Captions project={project} time={time} frame={frame} fps={fps} />
      <CutEffects project={project} time={time} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 6, width: `${Math.min(100, frame / durationInFrames * 100)}%`, background: '#f5db78', zIndex: 20}} />
      <Audio src={staticFile(project.audio)} />
      <SafeZones project={project} />
    </AbsoluteFill>
  );
}
