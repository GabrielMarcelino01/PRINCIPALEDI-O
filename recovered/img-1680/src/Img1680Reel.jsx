import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, cancelRender, continueRender, delayRender,
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
  const emphasis = small ? 0 : 0.035;
  const scale = 0.91 + enter * 0.09 + release * emphasis * enter;
  const color = item.color || '#fff8f0';
  const underline = item.color && !small
    ? interpolate(time, [item.start, item.end], [0, 100], clamp)
    : 0;
  const underlineOpacity = active ? 0.92 : time >= item.end
    ? interpolate(time, [item.end, item.end + 0.15], [0.92, 0], clamp)
    : 0;

  return (
    <span style={{
      position: 'relative', display: 'inline-block', whiteSpace: 'nowrap',
      fontFamily: serif ? '"Playfair Display", Georgia, serif' : 'Inter, Arial, sans-serif',
      fontStyle: serif ? 'italic' : 'normal',
      fontSize: small ? captionStyle.smallFontSize : serif ? captionStyle.serifFontSize : captionStyle.fontSize,
      fontWeight: serif ? 600 : small ? 700 : 850,
      letterSpacing: serif ? -2 : small ? 0.7 : -2.2,
      lineHeight: serif ? 1.02 : 1.06,
      color,
      opacity: interpolate(enter, [0, 1], [0, 1], clamp),
      WebkitTextStroke: `${small ? 0.8 : 1.2}px rgba(18, 10, 14, 0.46)`,
      textShadow: '0 3px 5px rgba(0,0,0,0.96), 0 8px 24px rgba(0,0,0,0.88)',
      transform: `translateY(${(1 - enter) * (small ? 10 : 18)}px) scale(${scale})`,
      transformOrigin: 'center bottom',
      padding: small ? '0 1px 9px' : '0 3px',
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
  if (!group || group.embeddedOnly) return null;
  const captionStyle = project.captionStyles[group.layout];
  const exit = interpolate(time, [group.end - 0.03, group.end], [1, 0], clamp);
  return (
    <div style={{
      position: 'absolute', left: 50, right: 50, top: captionStyle.top, zIndex: 12,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      opacity: exit, transform: `translateY(${(1 - exit) * 14}px)`,
      pointerEvents: 'none',
    }}>
      {group.lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{
          width: '100%', maxWidth: captionStyle.maxWidth,
          display: 'flex', justifyContent: 'center', textAlign: 'center',
          alignItems: 'baseline', flexWrap: 'nowrap', columnGap: group.layout === 'app' ? 14 : 18,
        }}>
          {line.map((item, index) => (
            <CaptionWord key={`${item.text}-${index}`} item={item} time={time} frame={frame} fps={fps} captionStyle={captionStyle} />
          ))}
        </div>
      ))}
    </div>
  );
}

function zoomAt(project, time) {
  const scene = project.zoomScenes.find((item) => time >= item.start && time < item.end) || project.zoomScenes[project.zoomScenes.length - 1];
  const progress = Math.max(0, Math.min(1, (time - scene.start) / Math.max(0.0001, scene.end - scene.start)));
  const eased = progress * progress * (3 - 2 * progress);
  return scene.from + (scene.to - scene.from) * eased;
}

function DoubleScene({project, fps}) {
  const frame = useCurrentFrame();
  const startFrame = Math.round(project.doubleScene.start * fps);
  const endFrame = Math.round(project.doubleScene.end * fps);
  const durationInFrames = endFrame - startFrame;
  const local = frame - startFrame;
  const labelOpacity = interpolate(local, [0, 8], [0, 1], clamp);
  const halfVideo = {
    position: 'absolute', left: -270, top: 0, width: 1080, height: 1920,
    objectFit: 'cover', maxWidth: 'none',
  };
  const label = {
    position: 'absolute', top: 82, zIndex: 5, padding: '12px 22px',
    borderRadius: 999, background: 'rgba(105, 20, 46, 0.92)', color: '#fff8f0',
    fontFamily: 'Inter, Arial, sans-serif', fontSize: 34, fontWeight: 800,
    letterSpacing: 4, lineHeight: 1, opacity: labelOpacity,
    boxShadow: '0 5px 20px rgba(0,0,0,0.28)',
  };
  return (
    <Sequence from={startFrame} durationInFrames={durationInFrames}>
      <AbsoluteFill style={{backgroundColor: '#151013'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, overflow: 'hidden'}}>
          <OffthreadVideo muted src={staticFile(project.beforeVideo)} style={halfVideo} />
          <div style={{...label, left: 32}}>{project.doubleScene.leftLabel}</div>
        </div>
        <div style={{position: 'absolute', left: 540, top: 0, width: 540, height: 1920, overflow: 'hidden'}}>
          <OffthreadVideo muted startFrom={startFrame} src={staticFile(project.video)} style={halfVideo} />
          <div style={{...label, right: 32}}>{project.doubleScene.rightLabel}</div>
        </div>
        <div style={{position: 'absolute', left: 538, top: 0, bottom: 0, width: 4, background: '#f0c792', zIndex: 6, opacity: 0.85}} />
      </AbsoluteFill>
    </Sequence>
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

export function Img1680Reel({project}) {
  useEditorialFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const inDoubleScene = time >= project.doubleScene.start && time < project.doubleScene.end;
  const zoom = zoomAt(project, time);
  return (
    <AbsoluteFill style={{background: '#151013', color: '#fff8f0', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden', WebkitFontSmoothing: 'antialiased'}}>
      {inDoubleScene ? (
        <DoubleScene project={project} fps={fps} />
      ) : (
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: 'center center'}}>
          <OffthreadVideo muted src={staticFile(project.video)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      )}
      <Audio src={staticFile(project.audio)} />
      <Captions project={project} time={time} frame={frame} fps={fps} />
      <SafeZones project={project} />
    </AbsoluteFill>
  );
}
