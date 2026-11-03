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

function CaptionWord({item, time, frame, fps, captionStyle}) {
  const serif = item.style === 'serif';
  const small = item.style === 'small';
  const active = time >= item.start && time < item.end;
  const localFrame = frame - item.start * fps;
  const enter = spring({
    frame: Math.max(0, localFrame), fps,
    config: {damping: serif ? 20 : 22, stiffness: 250, mass: 0.68},
  });
  const release = active ? 1 : time >= item.end
    ? interpolate(time, [item.end, item.end + 0.14], [1, 0], clamp)
    : 0;
  const emphasis = small ? 0 : 0.04;
  const scale = 0.90 + enter * 0.10 + release * emphasis * enter;
  const color = item.color || '#ffffff';
  const underline = item.color && !small
    ? interpolate(time, [item.start, item.end], [0, 100], clamp)
    : 0;
  const underlineOpacity = active ? 0.95 : time >= item.end
    ? interpolate(time, [item.end, item.end + 0.15], [0.95, 0], clamp)
    : 0;

  return (
    <span style={{
      position: 'relative', display: 'inline-block', whiteSpace: 'nowrap',
      fontFamily: serif ? '"Playfair Display", Georgia, serif' : 'Inter, Arial, sans-serif',
      fontStyle: serif ? 'italic' : 'normal',
      fontSize: small ? captionStyle.smallFontSize : serif ? captionStyle.serifFontSize : captionStyle.fontSize,
      fontWeight: serif ? 600 : small ? 650 : 850,
      letterSpacing: serif ? -2 : small ? 0.8 : -2.4,
      lineHeight: serif ? 1.02 : 1.06,
      color,
      opacity: interpolate(enter, [0, 1], [0, 1], clamp),
      textShadow: active
        ? `0 3px 5px rgba(0,0,0,0.94), 0 7px 24px ${color}55`
        : '0 3px 5px rgba(0,0,0,0.96), 0 8px 24px rgba(0,0,0,0.82)',
      transform: `translateY(${(1 - enter) * (small ? 12 : 22)}px) scale(${scale})`,
      transformOrigin: 'center bottom',
      padding: small ? '0 1px 10px' : '0 3px',
    }}>
      {serif ? item.text.toLowerCase() : item.text}
      {item.color && !small && (
        <span style={{
          position: 'absolute', left: 4, bottom: -5, height: 4,
          width: `${underline}%`, background: color, borderRadius: 999,
          opacity: underlineOpacity, boxShadow: `0 0 12px ${color}55`,
          pointerEvents: 'none',
        }} />
      )}
    </span>
  );
}

function Captions({project, time, frame, fps}) {
  const group = project.groups.find((item) => time >= item.start && time < item.end);
  if (!group) return null;
  const position = project.captionPositions[group.position];
  const enter = spring({frame: Math.max(0, frame - group.start * fps), fps, config: {damping: 25, stiffness: 210, mass: 0.75}});
  const exit = interpolate(time, [group.end - 0.08, group.end], [1, 0], clamp);
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top: position.top, zIndex: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity: exit, transform: `translateY(${(1 - exit) * 14}px)`,
    }}>
      {group.lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{
          width: '100%', maxWidth: project.captionStyle.maxWidth,
          display: 'flex', justifyContent: 'center', textAlign: 'center',
          alignItems: 'baseline', flexWrap: 'wrap', columnGap: 18, rowGap: 6,
        }}>
          {line.map((item, index) => (
            <CaptionWord key={`${item.text}-${index}`} item={item} time={time} frame={frame} fps={fps} captionStyle={project.captionStyle} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SafeZones({project}) {
  if (!project.showSafeZones) return null;
  const zone = project.safeZones;
  return (
    <AbsoluteFill style={{zIndex: 30, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: zone.left, right: zone.right, top: zone.top, bottom: zone.bottom, border: '3px dashed #67e8f9', boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', top: 10, left: 10, padding: 9, background: '#081018', color: '#67e8f9', fontSize: 20, fontWeight: 750}}>SAFE ZONE — REVISÃO</div>
      </div>
    </AbsoluteFill>
  );
}

export function ParaEdicaoReel({project}) {
  useEditorialFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  return (
    <AbsoluteFill style={{background: '#111', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden', WebkitFontSmoothing: 'antialiased'}}>
      <OffthreadVideo src={staticFile(project.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <Captions project={project} time={time} frame={frame} fps={fps} />
      <Audio src={staticFile(project.audio)} />
      <SafeZones project={project} />
    </AbsoluteFill>
  );
}
