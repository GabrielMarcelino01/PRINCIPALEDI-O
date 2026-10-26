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

function CaptionWord({item, time, frame, fps}) {
  const serif = item.style === 'serif';
  const small = item.style === 'small';
  const active = time >= item.start && time < item.end;
  const minimal = item.text === 'MINIMALISTA';
  const localFrame = frame - item.start * fps;
  const enter = spring({
    frame: Math.max(0, localFrame), fps,
    config: {damping: minimal ? 24 : serif ? 20 : 17, stiffness: minimal ? 190 : 250, mass: 0.68},
  });
  const release = active ? 1 : time >= item.end
    ? interpolate(time, [item.end, item.end + 0.14], [1, 0], clamp)
    : 0;
  const emphasis = small ? 0 : item.text === 'VIVO' ? 0.075 : 0.045;
  const scale = 0.88 + enter * 0.12 + release * emphasis * enter;
  const shake = item.text === 'HORRÍVEL' && localFrame >= 0 && localFrame < 14
    ? Math.sin(localFrame * 2.2) * (1 - localFrame / 14) * 7
    : 0;
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
      fontSize: small ? 42 : serif ? 96 : 76,
      fontWeight: serif ? 600 : small ? 650 : 850,
      letterSpacing: serif ? -2 : small ? 0.8 : -2.4,
      lineHeight: serif ? 1.02 : 1.06,
      color,
      opacity: interpolate(enter, [0, 1], [0, 1], clamp),
      textShadow: active
        ? `0 3px 5px rgba(0,0,0,0.92), 0 7px 26px ${color}66`
        : '0 3px 5px rgba(0,0,0,0.94), 0 8px 24px rgba(0,0,0,0.78)',
      transform: `translateX(${shake}px) translateY(${(1 - enter) * (minimal ? 10 : small ? 12 : 24)}px) rotate(${serif && !minimal ? (1 - enter) * -2.5 : 0}deg) scale(${scale})`,
      transformOrigin: 'center bottom',
      padding: small ? '0 1px 10px' : '0 3px',
    }}>
      {serif ? item.text.toLowerCase() : item.text}
      {item.color && !small && (
        <span style={{
          position: 'absolute', left: 4, bottom: small ? 3 : -5, height: 4,
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
  const exit = interpolate(time, [group.end - 0.08, group.end], [1, 0], clamp);
  return (
    <div style={{
      position: 'absolute', left: 60, right: 100, top: project.captionStyle.top, zIndex: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity: exit, transform: `translateY(${(1 - exit) * 14}px)`,
    }}>
      {group.lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{
          maxWidth: project.captionStyle.maxWidth, display: 'flex', justifyContent: 'center',
          alignItems: 'baseline', flexWrap: 'wrap', columnGap: 18, rowGap: 6,
        }}>
          {line.map((item, index) => (
            <CaptionWord key={`${item.text}-${index}`} item={item} time={time} frame={frame} fps={fps} />
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
        <div style={{position: 'absolute', top: 10, left: 10, padding: 9, background: '#081018', color: '#67e8f9', fontSize: 20, fontWeight: 750}}>SAFE ZONE — REVISAR NO CELULAR</div>
      </div>
    </AbsoluteFill>
  );
}

export function FashionReel({project}) {
  useEditorialFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  return (
    <AbsoluteFill style={{background: '#111', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden', WebkitFontSmoothing: 'antialiased'}}>
      <OffthreadVideo src={staticFile(project.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.58) 72%, rgba(0,0,0,0.70))', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.12) 100%)', pointerEvents: 'none'}} />
      <Captions project={project} time={time} frame={frame} fps={fps} />
      <Audio src={staticFile(project.audio)} />
      <SafeZones project={project} />
    </AbsoluteFill>
  );
}
