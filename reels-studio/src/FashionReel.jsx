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
  const position = project.captionPositions[group.position] || {top: project.captionStyle.top, align: 'center'};
  const align = position.align;
  const enter = spring({frame: Math.max(0, frame - group.start * fps), fps, config: {damping: 25, stiffness: 210, mass: 0.75}});
  const exit = interpolate(time, [group.end - 0.08, group.end], [1, 0], clamp);
  const direction = align === 'flex-start' ? -24 : align === 'flex-end' ? 24 : 0;
  const textAlign = align === 'flex-start' ? 'left' : align === 'flex-end' ? 'right' : 'center';
  return (
    <div style={{
      position: 'absolute', left: 60, right: 100, top: position.top, zIndex: 8,
      display: 'flex', flexDirection: 'column', alignItems: align, gap: 12,
      opacity: exit, transform: `translateX(${(1 - enter) * direction}px) translateY(${(1 - exit) * 14}px)`,
    }}>
      {group.lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{
          width: '100%', maxWidth: project.captionStyle.maxWidth, display: 'flex', justifyContent: align,
          textAlign, alignItems: 'baseline', flexWrap: 'wrap', columnGap: 18, rowGap: 6,
        }}>
          {line.map((item, index) => (
            <CaptionWord key={`${item.text}-${index}`} item={item} time={time} frame={frame} fps={fps} />
          ))}
        </div>
      ))}
    </div>
  );
}

function FollowButton({project, time, frame, fps}) {
  const cta = project.followCta;
  if (!cta || time < cta.start) return null;
  const local = time - cta.start;
  const enter = spring({frame: Math.max(0, frame - cta.start * fps), fps, config: {damping: 15, stiffness: 190, mass: 0.8}});
  const pulse = local > 0.55 ? 1 + Math.sin((local - 0.55) * Math.PI * 2 * 1.15) * 0.018 : 1;
  const shine = interpolate(local % 1.9, [0, 0.65], [-150, 380], clamp);
  return (
    <div style={{
      position: 'absolute', left: '50%', top: cta.top, zIndex: 10,
      transform: 'translateX(-50%)', opacity: interpolate(enter, [0, 1], [0, 1], clamp),
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative', width: 286, height: 86, borderRadius: 999, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15,
        background: 'linear-gradient(135deg, #ff526d, #e51e4f 70%, #c81342)',
        border: '2px solid rgba(255,255,255,0.30)', color: '#fff',
        boxShadow: '0 12px 38px rgba(213,25,70,0.38), inset 0 1px 0 rgba(255,255,255,0.25)',
        transform: `scale(${(0.72 + enter * 0.28) * pulse})`, transformOrigin: 'center',
        fontSize: 31, fontWeight: 850, letterSpacing: 1.4,
      }}>
        <span style={{
          position: 'absolute', top: -20, bottom: -20, left: 0, width: 100,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent)',
          transform: `translateX(${shine}px) skewX(-18deg)`, pointerEvents: 'none',
        }} />
        <span style={{
          position: 'relative', zIndex: 2, width: 42, height: 42, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.20)', fontSize: 34, fontWeight: 500, lineHeight: 1,
        }}>+</span>
        <span style={{position: 'relative', zIndex: 2}}>{cta.text}</span>
      </div>
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
  const scene = sceneAt(project, time);
  const motion = scene.motion;
  const linear = Math.max(0, Math.min(1, (time - scene.start) / (scene.end - scene.start)));
  const progress = linear * linear * (3 - 2 * linear);
  const scale = interpolate(progress, [0, 1], [motion.scaleFrom, motion.scaleTo]);
  const x = interpolate(progress, [0, 1], [motion.xFrom, motion.xTo]);
  const y = interpolate(progress, [0, 1], [motion.yFrom, motion.yTo]);
  return (
    <AbsoluteFill style={{background: '#111', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden', WebkitFontSmoothing: 'antialiased'}}>
      <OffthreadVideo src={staticFile(project.video)} muted style={{
        width: '100%', height: '100%', objectFit: 'cover',
        transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: 'center center',
      }} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.58) 72%, rgba(0,0,0,0.70))', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.12) 100%)', pointerEvents: 'none'}} />
      <Captions project={project} time={time} frame={frame} fps={fps} />
      <FollowButton project={project} time={time} frame={frame} fps={fps} />
      <Audio src={staticFile(project.audio)} />
      <SafeZones project={project} />
    </AbsoluteFill>
  );
}
