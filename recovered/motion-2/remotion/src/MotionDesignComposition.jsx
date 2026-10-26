import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  captionAtFrame,
  easeOutBack,
  easeOutBounce,
  makeTimedWords,
  progress,
} from './design-utils.mjs';

const FONT = 'Inter, Arial, sans-serif';
const SCENES = [
  {id: 'easing', label: '01 / EASING', start: 0, end: 150, color: '#09090b'},
  {id: 'karaoke', label: '02 / KARAOKÊ', start: 150, end: 330, color: '#111827'},
  {id: 'split', label: '03 / SPLIT SCREEN', start: 330, end: 510, color: '#f4f1ea'},
  {id: 'liquid', label: '04 / LIQUID', start: 510, end: 660, color: '#4f46e5'},
  {id: 'css3d', label: '05 / CSS 3D', start: 660, end: 840, color: '#09090b'},
  {id: 'vox', label: '06 / VOX', start: 840, end: 1020, color: '#e7e5e4'},
  {id: 'final', label: '07 / DELIVERY', start: 1020, end: 1200, color: '#09090b'},
];

const karaokeWords = makeTimedWords('A SUA IDEIA AGORA TEM RITMO', 0.2, 0.36);

function Label({children, dark = false}) {
  return <div style={{
    position: 'absolute', top: 48, left: 64, color: dark ? '#18181b' : '#d4d4d8',
    font: '600 20px/1.2 monospace', letterSpacing: 3,
  }}>{children}</div>;
}

function Scene({frame, config, children}) {
  if (frame < config.start || frame >= config.end) return null;
  const local = frame - config.start;
  const duration = config.end - config.start;
  const intro = progress(local, 0, 22);
  const outro = 1 - progress(local, duration - 14, duration);
  const scale = 0.965 + easeOutBack(intro) * 0.035;
  const dark = config.id === 'split' || config.id === 'vox';
  return <AbsoluteFill style={{
    background: config.color, color: dark ? '#18181b' : '#fff', fontFamily: FONT,
    opacity: Math.min(intro * 1.4, 1) * outro, transform: `scale(${scale})`,
    overflow: 'hidden',
  }}>
    <Label dark={dark}>{config.label}</Label>
    {children(local, duration)}
  </AbsoluteFill>;
}

function EasingScene({frame}) {
  const title = easeOutBack(progress(frame, 12, 62));
  const badge = easeOutBounce(progress(frame, 58, 118));
  return <>
    <div style={{position: 'absolute', left: 90, top: 250, width: 1120}}>
      <div style={{color: '#a78bfa', fontSize: 28, fontWeight: 700, letterSpacing: 8}}>MOTION DESIGN</div>
      <div style={{
        marginTop: 24, fontSize: 116, lineHeight: 0.95, fontWeight: 900, letterSpacing: -7,
        transform: `translateY(${90 * (1 - title)}px) scale(${0.8 + title * 0.2})`,
        transformOrigin: 'left center', opacity: progress(frame, 12, 35),
      }}>MOVIMENTO<br/>COM INTENÇÃO.</div>
    </div>
    {[0, 1, 2].map((index) => {
      const enter = easeOutBack(progress(frame, 42 + index * 12, 92 + index * 12));
      return <div key={index} style={{
        position: 'absolute', right: 150 + index * 65, top: 260 + index * 145,
        width: 270, height: 112, borderRadius: 28,
        background: ['#8b5cf6', '#fbbf24', '#34d399'][index],
        transform: `translateX(${420 * (1 - enter)}px) rotate(${(1 - enter) * 24}deg)`,
        boxShadow: '0 28px 80px #0006',
      }}/>;
    })}
    <div style={{
      position: 'absolute', left: 94, bottom: 100, padding: '18px 28px', borderRadius: 999,
      background: '#fff', color: '#18181b', fontSize: 25, fontWeight: 800,
      transform: `scale(${badge})`,
    }}>BACK + BOUNCE / 60 FPS</div>
  </>;
}

function KaraokeScene({frame}) {
  const caption = captionAtFrame(karaokeWords, frame, 60, 3);
  return <>
    <div style={{position: 'absolute', top: 180, width: '100%', textAlign: 'center', color: '#93c5fd', fontSize: 28, letterSpacing: 6}}>
      LEGENDA SINCRONIZADA PALAVRA A PALAVRA
    </div>
    <div style={{position: 'absolute', inset: '300px 100px auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '28px 22px'}}>
      {caption.page.map((word, index) => {
        const active = index === caption.activeIndex;
        const entrance = easeOutBack(progress(frame, word.start * 60, word.start * 60 + 18));
        return <span key={`${word.text}-${index}`} style={{
          padding: '20px 28px', borderRadius: 24, fontSize: 76, fontWeight: 900, letterSpacing: -3,
          color: active ? '#111827' : '#fff', background: active ? '#fbbf24' : '#ffffff0c',
          transform: `translateY(${35 * (1 - entrance)}px) scale(${active ? 1.08 : 1})`,
          boxShadow: active ? '0 20px 60px #fbbf2450' : 'none',
        }}>{word.text}</span>;
      })}
    </div>
    <div style={{position: 'absolute', left: 160, right: 160, bottom: 130, height: 8, background: '#ffffff18', borderRadius: 8}}>
      <div style={{height: '100%', width: `${progress(frame, 0, 180) * 100}%`, background: '#fbbf24', borderRadius: 8}}/>
    </div>
  </>;
}

function SplitScene({frame}) {
  const reveal = progress(frame, 0, 45);
  return <>
    <div style={{position: 'absolute', inset: '135px 70px 70px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
      <div style={{background: '#18181b', borderRadius: 30, padding: 42, color: '#d4d4d8', transform: `translateX(${-90 * (1 - reveal)}px)`}}>
        <div style={{color: '#a1a1aa', font: '20px monospace', marginBottom: 34}}>motion.jsx</div>
        {['const idea = "clareza";', 'spring({ frame, fps });', '<Motion duracao={20} />', 'render({ qualidade: true });'].map((line, index) => <div key={line} style={{
          font: '26px/2.1 monospace', color: ['#c4b5fd', '#fbbf24', '#93c5fd', '#6ee7b7'][index],
          opacity: progress(frame, 15 + index * 9, 30 + index * 9),
        }}>{line}</div>)}
      </div>
      <div style={{position: 'relative', overflow: 'hidden', borderRadius: 30, background: 'linear-gradient(145deg, #7c3aed, #2563eb)', transform: `translateX(${90 * (1 - reveal)}px)`}}>
        <div style={{position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '70px solid #ffffff24', right: -60, top: -80}}/>
        <div style={{position: 'absolute', left: 55, bottom: 60, color: '#fff', fontSize: 68, fontWeight: 900, lineHeight: 1}}>CÓDIGO<br/>VIRA CENA.</div>
        <div style={{position: 'absolute', right: 42, bottom: 45, width: 86, height: 86, borderRadius: 24, background: '#fbbf24', transform: `rotate(${frame * 1.2}deg)`}}/>
      </div>
    </div>
  </>;
}

function LiquidScene({frame}) {
  const travel = progress(frame, 0, 150);
  return <>
    <svg width="0" height="0" style={{position: 'absolute'}}><defs><filter id="design-goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="24" result="blur"/>
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 32 -14" result="goo"/>
    </filter></defs></svg>
    <div style={{position: 'absolute', inset: 0, filter: 'url(#design-goo)'}}>
      {[0, 1, 2, 3, 4].map((index) => <div key={index} style={{
        position: 'absolute', width: 300 + index * 35, height: 300 + index * 35, borderRadius: '50%',
        left: -250 + travel * 2200 + index * 85, top: 220 + (index % 2) * 260,
        background: index % 2 ? '#fbbf24' : '#a78bfa',
        transform: `scale(${0.75 + Math.sin(frame / 15 + index) * 0.15})`,
      }}/>) }
    </div>
    <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 104, fontWeight: 950, letterSpacing: -6, mixBlendMode: 'difference'}}>LIQUID TRANSITION</div>
  </>;
}

function Css3dScene({frame}) {
  const enter = easeOutBack(progress(frame, 0, 55));
  return <div style={{position: 'absolute', inset: 0, perspective: 1100, display: 'grid', placeItems: 'center'}}>
    <div style={{
      width: 1050, height: 570, position: 'relative', transformStyle: 'preserve-3d',
      transform: `rotateX(${58 - enter * 8}deg) rotateZ(${-28 + frame * 0.05}deg) scale(${0.65 + enter * 0.35})`,
    }}>
      {['#312e81', '#4f46e5', '#7c3aed', '#a78bfa'].map((color, index) => <div key={color} style={{
        position: 'absolute', inset: index * 46, borderRadius: 44, background: color,
        border: '2px solid #ffffff30', transform: `translateZ(${index * 85}px)`,
        boxShadow: '0 35px 80px #0007', display: 'grid', placeItems: 'center',
        color: '#fff', fontSize: index === 3 ? 76 : 30, fontWeight: 900,
      }}>{index === 3 ? '3D SEM PLUGIN' : ''}</div>)}
    </div>
  </div>;
}

function VoxScene({frame}) {
  return <>
    <div style={{position: 'absolute', left: 80, top: 180, width: 520, fontSize: 78, lineHeight: 1, fontWeight: 950, letterSpacing: -4}}>BLOCOS QUE<br/>SE MONTAM.</div>
    <div style={{position: 'absolute', right: 90, top: 175, width: 1040, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, transform: 'rotate(-4deg)'}}>
      {Array.from({length: 30}, (_, index) => {
        const delay = (index % 6) * 4 + Math.floor(index / 6) * 8;
        const enter = easeOutBounce(progress(frame, delay, delay + 55));
        return <div key={index} style={{
          height: 120, borderRadius: 12,
          background: ['#18181b', '#f59e0b', '#7c3aed', '#60a5fa'][index % 4],
          opacity: enter, transform: `translateY(${-360 * (1 - enter)}px) scale(${0.5 + enter * 0.5})`,
          boxShadow: '10px 14px 0 #00000018',
        }}/>;
      })}
    </div>
  </>;
}

function FinalScene({frame}) {
  const enter = easeOutBack(progress(frame, 5, 60));
  return <>
    <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center'}}>
      <div style={{transform: `scale(${0.75 + enter * 0.25})`, opacity: progress(frame, 5, 30)}}>
        <div style={{color: '#a78bfa', fontSize: 25, letterSpacing: 9, fontWeight: 800}}>DA IDEIA AO MP4</div>
        <div style={{fontSize: 118, lineHeight: 1.05, fontWeight: 950, letterSpacing: -7, margin: '28px 0 42px'}}>EDITE. ANIME.<br/><span style={{color: '#fbbf24'}}>EXPORTE.</span></div>
        <div style={{display: 'flex', gap: 16, justifyContent: 'center'}}>
          {['1920 × 1080', '60 FPS', '20 SEGUNDOS'].map((item) => <span key={item} style={{padding: '15px 24px', border: '1px solid #ffffff30', borderRadius: 999, fontSize: 21, color: '#d4d4d8'}}>{item}</span>)}
        </div>
      </div>
    </div>
  </>;
}

export function MotionDesignComposition() {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#09090b', fontFamily: FONT}}>
    {SCENES.map((scene) => <Scene key={scene.id} frame={frame} config={scene}>
      {(local) => {
        if (scene.id === 'easing') return <EasingScene frame={local}/>;
        if (scene.id === 'karaoke') return <KaraokeScene frame={local}/>;
        if (scene.id === 'split') return <SplitScene frame={local}/>;
        if (scene.id === 'liquid') return <LiquidScene frame={local}/>;
        if (scene.id === 'css3d') return <Css3dScene frame={local}/>;
        if (scene.id === 'vox') return <VoxScene frame={local}/>;
        return <FinalScene frame={local}/>;
      }}
    </Scene>)}
  </AbsoluteFill>;
}
