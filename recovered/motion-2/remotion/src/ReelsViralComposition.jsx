import React from 'react';
import {AbsoluteFill, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {easeOutBack, progress, sceneIndexAt} from './design-utils.mjs';

const FONT = 'Inter, Arial, sans-serif';
const SCENE_FRAMES = 180;

export const DEFAULT_REEL_SCENES = [
  {tag: 'GANCHO', title: 'PARE DE ROLAR', words: ['SEU', 'VÍDEO', 'TEM', '3', 'SEGUNDOS'], colors: ['#4f46e5', '#09090b']},
  {tag: 'MEIO 1/2', title: 'CORTE O EXCESSO', words: ['UM', 'CORTE', 'EM', 'CADA', 'IDEIA'], colors: ['#0f766e', '#09090b']},
  {tag: 'MEIO 2/2', title: 'DÊ RITMO', words: ['MOVIMENTO', 'NA', 'PALAVRA', 'CERTA'], colors: ['#be123c', '#09090b']},
  {tag: 'CLÍMAX', title: 'ENTREGUE O PONTO', words: ['CLAREZA', 'ANTES', 'DO', 'EXAGERO'], colors: ['#7c3aed', '#09090b']},
  {tag: 'FECHAMENTO', title: 'FECHE A PROMESSA', words: ['REVISE', 'OUÇA', 'CONFIRA', 'EXPORTE'], colors: ['#1d4ed8', '#09090b']},
  {tag: 'CTA', title: 'SALVE PARA EDITAR', words: ['SALVE', 'ESSE', 'FLUXO', 'AGORA'], colors: ['#b45309', '#09090b']},
];

function mediaSource(value) {
  if (!value) return null;
  return value.startsWith('static://') ? staticFile(value.slice('static://'.length)) : value;
}

function DemoBackdrop({frame, scene}) {
  return <AbsoluteFill style={{background: `linear-gradient(155deg, ${scene.colors[0]}, ${scene.colors[1]} 72%)`}}>
    <div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: -330, top: 160, border: '140px solid #ffffff10', transform: `rotate(${frame * 0.2}deg)`}}/>
    <div style={{position: 'absolute', width: 560, height: 560, borderRadius: 80, right: -240, bottom: 250, background: '#ffffff0b', transform: `rotate(${28 + frame * 0.12}deg)`}}/>
    <div style={{position: 'absolute', left: 90, right: 90, top: 480, height: 600, borderRadius: 48, background: '#00000025', border: '2px solid #ffffff18', display: 'grid', placeItems: 'center', textAlign: 'center'}}>
      <div>
        <div style={{fontSize: 28, color: '#ffffff99', letterSpacing: 7}}>PRÉVIA AUTÔNOMA</div>
        <div style={{fontSize: 72, fontWeight: 900, marginTop: 30}}>ADICIONE<br/>SEU VÍDEO</div>
        <div style={{fontSize: 25, color: '#ffffff88', marginTop: 28}}>--props {'{"videoUrl":"video.mp4"}'}</div>
      </div>
    </div>
  </AbsoluteFill>;
}

function Footage({videoUrl, frame}) {
  const src = mediaSource(videoUrl);
  if (!src) return null;
  const zoom = 1.01 + Math.sin(frame / 80) * 0.012;
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(38px) brightness(0.42)', transform: 'scale(1.14)'}}/>
    <OffthreadVideo src={src} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${zoom})`}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #00000055 0%, transparent 24%, transparent 58%, #000000b0 100%)'}}/>
  </AbsoluteFill>;
}

function LiquidCut({frame}) {
  if (frame > 28) return null;
  const enter = progress(frame, 0, 28);
  return <>
    <svg width="0" height="0" style={{position: 'absolute'}}><defs><filter id="reels-goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur"/>
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -13"/>
    </filter></defs></svg>
    <div style={{position: 'absolute', inset: 0, filter: 'url(#reels-goo)', opacity: 1 - enter, pointerEvents: 'none'}}>
      {[0, 1, 2].map((index) => <div key={index} style={{
        position: 'absolute', left: -220 + index * 390 + enter * 420, top: 300 + index * 330,
        width: 520, height: 520, borderRadius: '50%', background: index === 1 ? '#fbbf24' : '#8b5cf6',
      }}/>) }
    </div>
  </>;
}

function AudioBars({frame, accent}) {
  return <div style={{position: 'absolute', left: 90, right: 90, bottom: 175, height: 86, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: 0.7}}>
    {Array.from({length: 28}, (_, index) => {
      const height = 12 + Math.abs(Math.sin(frame / 8 + index * 0.72)) * 66;
      return <div key={index} style={{width: 10, height, borderRadius: 8, background: index % 5 === 0 ? accent : '#ffffff85'}}/>;
    })}
  </div>;
}

function SaveCard({frame, accent}) {
  const enter = easeOutBack(progress(frame, 30, 85));
  if (enter <= 0) return null;
  return <div style={{position: 'absolute', right: 76, top: 360, perspective: 800}}>
    <div style={{
      width: 250, height: 300, borderRadius: 34, background: '#ffffff12', border: '2px solid #ffffff45',
      backdropFilter: 'blur(18px)', display: 'grid', placeItems: 'center', textAlign: 'center',
      transform: `rotateY(${-32 + enter * 20}deg) rotateX(${16 - enter * 8}deg) translateY(${120 * (1 - enter)}px)`,
      boxShadow: '0 40px 100px #0008', color: accent, fontSize: 45, fontWeight: 950,
    }}>SALVE<br/><span style={{color: '#fff', fontSize: 24}}>PARA DEPOIS</span></div>
  </div>;
}

function Caption({words, frame, fps, accent}) {
  const active = Math.min(words.length - 1, Math.max(-1, Math.floor((frame - 12) / 24)));
  return <div style={{position: 'absolute', left: 60, right: 60, bottom: 320, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 12px'}}>
    {words.map((word, index) => {
      const entrance = spring({frame: Math.max(0, frame - index * 5), fps, config: {damping: 14, stiffness: 150, mass: 0.7}});
      const isActive = index === active;
      return <span key={`${word}-${index}`} style={{
        padding: '16px 20px', borderRadius: 22, fontSize: words.length > 4 ? 59 : 66, fontWeight: 950,
        lineHeight: 1, letterSpacing: -2, color: isActive ? '#18181b' : '#fff',
        background: isActive ? accent : '#00000038', textShadow: isActive ? 'none' : '0 4px 18px #000',
        transform: `translateY(${40 * (1 - entrance)}px) scale(${isActive ? 1.07 : 1})`,
        opacity: entrance, boxShadow: isActive ? `0 16px 50px ${accent}55` : 'none',
      }}>{word}</span>;
    })}
  </div>;
}

export function ReelsViralComposition({videoUrl = null, scenes = DEFAULT_REEL_SCENES, accent = '#fbbf24', showAudioBars = true}) {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const safeScenes = Array.isArray(scenes) && scenes.length === 6 ? scenes : DEFAULT_REEL_SCENES;
  const sceneIndex = sceneIndexAt(frame, safeScenes.map(() => SCENE_FRAMES));
  const scene = safeScenes[sceneIndex];
  const local = frame - sceneIndex * SCENE_FRAMES;
  const titleEnter = easeOutBack(progress(local, 0, 34));
  return <AbsoluteFill style={{fontFamily: FONT, color: '#fff', background: scene.colors[1], overflow: 'hidden'}}>
    {videoUrl ? <Footage videoUrl={videoUrl} frame={frame}/> : <DemoBackdrop frame={frame} scene={scene}/>}
    <div style={{position: 'absolute', top: 64, left: 70, right: 70, height: 10, borderRadius: 10, background: '#ffffff25'}}>
      <div style={{width: `${(frame / durationInFrames) * 100}%`, height: '100%', borderRadius: 10, background: accent}}/>
    </div>
    <div style={{position: 'absolute', top: 112, left: 70, padding: '12px 20px', borderRadius: 999, background: '#00000055', border: '1px solid #ffffff30', font: '700 22px monospace', letterSpacing: 3}}>
      {String(sceneIndex + 1).padStart(2, '0')} / {scene.tag}
    </div>
    <div style={{
      position: 'absolute', top: 220, left: 70, right: 70, fontSize: 72, lineHeight: 1.02, fontWeight: 950,
      letterSpacing: -3, textShadow: '0 6px 30px #000', transform: `translateY(${70 * (1 - titleEnter)}px)`, opacity: progress(local, 0, 20),
    }}>{scene.title}</div>
    {sceneIndex === 5 ? <SaveCard frame={local} accent={accent}/> : null}
    <Caption words={scene.words} frame={local} fps={fps} accent={accent}/>
    {showAudioBars ? <AudioBars frame={frame} accent={accent}/> : null}
    <LiquidCut frame={local}/>
  </AbsoluteFill>;
}
