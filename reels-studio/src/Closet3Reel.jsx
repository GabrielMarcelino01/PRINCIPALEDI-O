import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, cancelRender, continueRender, delayRender,
  staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

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

function CaptionWord({item, style}) {
  const serif = item.style === 'serif';
  const small = item.style === 'small';
  const fontSize = serif ? style.serifFontSize : small ? style.smallFontSize : style.fontSize;
  const color = item.color || '#fff4e2';
  return (
    <span style={{
      position: 'relative',
      display: 'inline-block',
      fontFamily: serif ? '"Playfair Display", Georgia, serif' : 'Inter, Arial, sans-serif',
      fontSize,
      fontWeight: small ? 600 : serif ? 600 : 900,
      fontStyle: serif ? 'italic' : 'normal',
      lineHeight: small ? 1.05 : serif ? 1.05 : 0.94,
      letterSpacing: small ? -1.2 : serif ? -3 : -4.5,
      color,
      textShadow: '0 4px 18px rgba(0,0,0,0.68), 0 1px 3px rgba(0,0,0,0.9)',
      whiteSpace: 'pre',
    }}>
      {serif ? item.text.toLowerCase() : item.text}
      {item.color && (
        <span style={{
          position: 'absolute', left: '4%', right: '4%', bottom: -10, height: 5,
          borderRadius: 3, background: item.color, boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
        }} />
      )}
    </span>
  );
}

function Captions({project, time}) {
  const group = project.groups.find((candidate) => time >= candidate.start && time < candidate.end);
  if (!group) return null;
  return (
    <div style={{
      position: 'absolute', left: 64, right: 100, top: '50%',
      transform: 'translateY(-50%)', textAlign: 'center', pointerEvents: 'none',
    }}>
      <div style={{maxWidth: project.captionStyle.maxWidth, width: '100%', margin: '0 auto'}}>
        <div style={{width: 64, height: 5, margin: '0 auto 8px', borderRadius: 3, background: '#f2e8d8'}} />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          {group.lines.map((line, index) => (
            <div key={`${group.id}-${index}`} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 16, rowGap: 6}}>
              {line.map((item) => <CaptionWord key={`${group.id}-${item.text}-${item.start}`} item={item} style={project.captionStyle} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditorialHeader({project, sceneIndex, scenes}) {
  const scene = scenes[sceneIndex];
  return (
    <div style={{position: 'absolute', top: 84, left: 64, right: 64}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24}}>
        <div style={{fontFamily: 'Inter, Arial, sans-serif', fontSize: 23, fontWeight: 800, letterSpacing: 3.6, color: '#fff4e2', textShadow: '0 2px 12px rgba(0,0,0,0.5)'}}>
          {project.design?.title || 'ARMÁRIO • COLOR EDIT'}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {(scene?.colors || ['#a8e6bd', '#ffffff']).map((color, index) => (
            <div key={`${color}-${index}`} style={{width: 13, height: 13, borderRadius: '50%', background: color, border: '1px solid rgba(255,255,255,0.55)'}} />
          ))}
          <span style={{marginLeft: 7, fontFamily: 'Inter, Arial, sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: 2, color: '#fff4e2'}}>
            0{sceneIndex + 1} / 0{scenes.length}
          </span>
        </div>
      </div>
      <div style={{marginTop: 18, height: 2, background: scene?.accent || '#d6bb8d', opacity: 0.68}} />
    </div>
  );
}

function FollowButton({project}) {
  const cta = project.followCta;
  return (
    <div style={{position: 'absolute', top: cta.top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 15, padding: '17px 34px 17px 24px',
        borderRadius: 18, background: 'linear-gradient(135deg,#fff9ec,#e8d7b9)',
        color: '#211d18', border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 10px 32px rgba(0,0,0,0.30)',
        fontFamily: 'Inter, Arial, sans-serif', fontSize: 34, fontWeight: 900, letterSpacing: 1.4,
      }}>
        <div style={{width: 47, height: 47, borderRadius: 14, background: '#24201b', color: '#fff4e2', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5" /><path d="M3.5 20c.3-4 2.3-6 5.5-6s5.2 2 5.5 6M18 7v8M14 11h8" />
          </svg>
        </div>
        <span>+</span><span>{cta.text}</span>
      </div>
    </div>
  );
}

function SafeZones({project}) {
  const {top, bottom, left, right} = project.safeZones;
  const zone = (style, label) => <div style={{position: 'absolute', background: 'rgba(255,60,80,0.13)', border: '1px dashed rgba(255,100,110,0.8)', color: '#ffacb5', fontSize: 20, padding: 10, ...style}}>{label}</div>;
  return <>{zone({top: 0, left: 0, right: 0, height: top}, 'TOP UI')}{zone({bottom: 0, left: 0, right: 0, height: bottom}, 'BOTTOM UI')}{zone({top, bottom, left: 0, width: left}, '')}{zone({top, bottom, right: 0, width: right}, '')}</>;
}

export function Closet3Reel({project}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  useEditorialFonts();
  const sceneIndex = project.scenes.findIndex((scene) => time >= scene.start && time < scene.end);
  const safeSceneIndex = sceneIndex < 0 ? project.scenes.length - 1 : sceneIndex;
  const scene = project.scenes[safeSceneIndex];
  const motion = scene.motion;
  return (
    <AbsoluteFill style={{backgroundColor: '#0d0f0e', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${motion.xFrom}px, ${motion.yFrom}px) scale(${motion.scaleFrom})`, transformOrigin: '50% 50%'}}>
        <OffthreadVideo src={staticFile(project.video)} muted preload="auto" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(4,6,5,0.28),transparent 28%,transparent 68%,rgba(3,5,4,0.38))'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 180px rgba(0,0,0,0.30)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile(project.grain)})`, backgroundRepeat: 'repeat', opacity: 0.032, mixBlendMode: 'soft-light'}} />
      <EditorialHeader project={project} sceneIndex={safeSceneIndex} scenes={project.scenes} />
      <Captions project={project} time={time} />
      {project.followCta && time >= project.followCta.start && <FollowButton project={project} />}
      {project.showSafeZones && <SafeZones project={project} />}
      <Audio src={staticFile(project.audio)} volume={1} />
    </AbsoluteFill>
  );
}
