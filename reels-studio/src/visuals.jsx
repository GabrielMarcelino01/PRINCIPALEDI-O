import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

function entrance(frame, fps, delay = 0) {
  return spring({frame: Math.max(0, frame - delay), fps, config: {damping: 200}});
}

function Rise({frame, fps, delay = 0, children, style = {}}) {
  const value = entrance(frame, fps, delay);
  return (
    <div style={{opacity: value, transform: `translateY(${(1 - value) * 42}px)`, ...style}}>
      {children}
    </div>
  );
}

function Panel({children, style = {}}) {
  return (
    <div style={{
      position: 'absolute', border: '1px solid rgba(255,255,255,0.11)',
      background: 'linear-gradient(145deg, rgba(22,28,40,0.94), rgba(8,12,19,0.91))',
      boxShadow: '0 34px 90px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)',
      borderRadius: 38, overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

function MicroLabel({children, color = 'rgba(255,255,255,0.55)', style = {}}) {
  return <div style={{fontSize: 23, fontWeight: 700, letterSpacing: 3.2, color, ...style}}>{children}</div>;
}

function ArrowIcon({size = 64, right = false}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{display: 'block'}}>
      {right ? (
        <path d="M12 32 H52 M35 15 L52 32 L35 49" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M16 48 L48 16 M22 16 H48 V42" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function Backdrop({accent, children}) {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 75) * 34;
  return (
    <AbsoluteFill style={{background: '#171c28', overflow: 'hidden'}}>
      <div style={{
        position: 'absolute', inset: -180,
        background: `radial-gradient(circle at ${24 + drift / 4}% 24%, ${accent}25, transparent 38%), radial-gradient(circle at 82% 70%, ${accent}14, transparent 40%)`,
        transform: `translate3d(${drift}px, ${-drift / 2}px, 0)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.18,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)',
        backgroundSize: '90px 90px', backgroundPosition: `0 ${frame * 0.18}px`,
        maskImage: 'linear-gradient(to bottom, black, transparent 78%)',
      }} />
      <div style={{
        position: 'absolute', width: 850, height: 850, borderRadius: '50%',
        border: `1px solid ${accent}20`, right: -460, top: 190,
        transform: `rotate(${frame * 0.12}deg)`, boxShadow: `0 0 120px ${accent}0c`,
      }} />
      {children}
    </AbsoluteFill>
  );
}

export function HookVisual({scene}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = spring({frame: Math.max(0, frame - 8), fps, config: {damping: 13, stiffness: 90}});
  const ring = interpolate(frame, [0, 175], [100, 9], clamp);
  const bars = [0.34, 0.52, 0.43, 0.72, 0.58, 0.9, 0.68, 0.96, 0.78, 1];
  return (
    <Backdrop accent={scene.accent}>
      <Panel style={{left: 96, right: 96, top: 356, height: 690}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${scene.accent}14, transparent 48%)`}} />
        <MicroLabel style={{position: 'absolute', top: 42, left: 48}}>PRIMEIRA IMPRESSÃO</MicroLabel>
        <MicroLabel color={scene.accent} style={{position: 'absolute', top: 42, right: 48}}>00—03s</MicroLabel>
        <div style={{
          position: 'absolute', width: 470, height: 470, left: 209, top: 118, borderRadius: '50%',
          background: `conic-gradient(${scene.accent} ${ring}%, rgba(255,255,255,0.07) 0)`,
          transform: `rotate(-90deg) scale(${0.86 + pulse * 0.14})`,
          boxShadow: `0 0 90px ${scene.accent}18`,
        }}>
          <div style={{position: 'absolute', inset: 12, borderRadius: '50%', background: '#111722'}} />
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 100, textAlign: 'center',
          fontSize: 410, lineHeight: 1.15, fontWeight: 900, letterSpacing: -28, color: '#fff',
          transform: `scale(${0.76 + pulse * 0.24})`, textShadow: '0 18px 60px rgba(0,0,0,0.38)',
        }}>3</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 608, textAlign: 'center'}}>
          <span style={{fontSize: 35, fontWeight: 800, letterSpacing: 8, color: scene.accent}}>SEGUNDOS</span>
        </div>
      </Panel>
      <Rise frame={frame} fps={fps} delay={18} style={{position: 'absolute', left: 96, right: 96, top: 1076}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 11, height: 75}}>
          {bars.map((bar, index) => (
            <div key={index} style={{
              width: 16, height: 16 + bar * 52, borderRadius: 8,
              background: index > 6 ? scene.accent : 'rgba(255,255,255,0.23)',
              transform: `scaleY(${0.8 + Math.sin(frame / 8 + index) * 0.16})`, transformOrigin: 'bottom',
            }} />
          ))}
          <div style={{marginLeft: 'auto', textAlign: 'right'}}>
            <MicroLabel color="#fff" style={{fontSize: 25, letterSpacing: 1.5}}>PARE O SCROLL</MicroLabel>
            <div style={{fontSize: 22, color: 'rgba(255,255,255,0.48)', marginTop: 7}}>clareza antes de explicação</div>
          </div>
        </div>
      </Rise>
    </Backdrop>
  );
}

export function GuideVisual({scene}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scan = interpolate(frame, [10, 135], [0, 760], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const words = ['GUIA', 'O', 'OLHAR.'];
  return (
    <Backdrop accent={scene.accent}>
      <Panel style={{left: 70, right: 70, top: 342, height: 770}}>
        <MicroLabel style={{position: 'absolute', left: 46, top: 40}}>HIERARQUIA DE LEITURA</MicroLabel>
        <div style={{position: 'absolute', left: 46, right: 46, top: 100, height: 1, background: 'rgba(255,255,255,0.10)'}} />
        {[0, 1, 2].map((index) => (
          <div key={index} style={{
            position: 'absolute', left: 48, right: 48, top: 142 + index * 74, height: 46,
            borderRadius: 12, background: `rgba(255,255,255,${0.10 - index * 0.022})`,
            width: 690 - index * 105,
          }} />
        ))}
        <div style={{
          position: 'absolute', left: 48, right: 48, top: 405, height: 184, borderRadius: 28,
          background: 'rgba(0,0,0,0.34)', border: `1px solid ${scene.accent}38`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
          boxShadow: `0 22px 60px rgba(0,0,0,0.24), 0 0 50px ${scene.accent}0a`,
        }}>
          {words.map((word, index) => {
            const active = Math.floor(frame / 28) % 3 === index;
            return <span key={word} style={{
              fontSize: 58, fontWeight: 850, letterSpacing: -2, padding: '5px 12px', borderRadius: 12,
              color: active ? '#10141d' : '#fff', background: active ? scene.accent : 'transparent',
              transform: `scale(${active ? 1.04 : 1})`,
            }}>{word}</span>;
          })}
        </div>
        <div style={{
          position: 'absolute', left: 46, right: 46, top: 646, display: 'flex', justifyContent: 'space-between',
          color: 'rgba(255,255,255,0.52)', fontSize: 22, fontWeight: 650,
        }}>
          <span>GRUPOS CURTOS</span><span>CONTRASTE ALTO</span><span>PALAVRA ATIVA</span>
        </div>
        <div style={{
          position: 'absolute', left: 32, right: 32, top: 124 + scan * 0.63, height: 2,
          background: `linear-gradient(90deg, transparent, ${scene.accent}, transparent)`,
          boxShadow: `0 0 18px ${scene.accent}`, opacity: 0.65,
        }} />
      </Panel>
      <Rise frame={frame} fps={fps} delay={12} style={{position: 'absolute', left: 80, right: 80, top: 1140, textAlign: 'center'}}>
        <div style={{fontSize: 26, color: 'rgba(255,255,255,0.62)', letterSpacing: 0.4}}>o olho entende antes de ler duas vezes</div>
      </Rise>
    </Backdrop>
  );
}

export function CutsVisual({scene, project}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const playhead = interpolate(frame, [0, 175], [0, 870], clamp);
  const clips = [
    {name: 'AÇÃO', width: 222, color: '#67e8f9'},
    {name: 'REAÇÃO', width: 175, color: '#fb7185'},
    {name: 'DETALHE', width: 250, color: '#c4b5fd'},
    {name: 'PROVA', width: 191, color: '#6ee7b7'},
  ];
  const flash = Math.max(...[28, 73, 124].map((cut) => interpolate(frame, [cut, cut + 3], [0.25, 0], clamp)));
  const wave = project.waveform.slice(42, 78);
  return (
    <Backdrop accent={scene.accent}>
      <Rise frame={frame} fps={fps} style={{position: 'absolute', left: 74, top: 354}}>
        <MicroLabel color={scene.accent}>TIMELINE / 60 FPS</MicroLabel>
        <div style={{fontSize: 76, lineHeight: 1.02, letterSpacing: -3.5, fontWeight: 850, marginTop: 22}}>UM CORTE.<br />UM MOTIVO.</div>
      </Rise>
      <Panel style={{left: 64, right: 64, top: 674, height: 412}}>
        <div style={{position: 'absolute', left: 38, right: 38, top: 42, display: 'flex', gap: 8}}>
          {clips.map((clip) => (
            <div key={clip.name} style={{
              width: clip.width, height: 116, borderRadius: 16, background: `${clip.color}1f`,
              border: `1px solid ${clip.color}75`, padding: '18px 14px', boxSizing: 'border-box',
            }}>
              <div style={{width: 38, height: 5, borderRadius: 4, background: clip.color}} />
              <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 1.2, marginTop: 39, color: clip.color}}>{clip.name}</div>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 38, right: 38, top: 211, height: 104, display: 'flex', alignItems: 'center', gap: 5}}>
          {wave.map((value, index) => <div key={index} style={{
            flex: 1, height: 12 + value * 74, borderRadius: 4,
            background: index / wave.length < playhead / 870 ? scene.accent : 'rgba(255,255,255,0.16)',
          }} />)}
        </div>
        <div style={{position: 'absolute', left: 38 + playhead, top: 24, bottom: 46, width: 2, background: '#fff', boxShadow: '0 0 16px rgba(255,255,255,0.65)'}}>
          <div style={{position: 'absolute', top: -2, left: -8, width: 18, height: 18, borderRadius: '50%', background: '#fff'}} />
        </div>
        <div style={{position: 'absolute', left: 38, right: 38, bottom: 23, display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.43)', fontWeight: 650}}>
          <span>00:06:24</span><span>00:07:12</span><span>00:08:00</span><span>00:09:24</span>
        </div>
      </Panel>
      <AbsoluteFill style={{background: scene.accent, opacity: flash, pointerEvents: 'none'}} />
    </Backdrop>
  );
}

export function AudioVisual({scene, project}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wave = project.waveform.slice(76, 108);
  return (
    <Backdrop accent={scene.accent}>
      <Panel style={{left: 72, right: 72, top: 350, height: 670}}>
        <MicroLabel style={{position: 'absolute', top: 40, left: 44}}> MIXAGEM / VOZ PRIORITÁRIA</MicroLabel>
        <div style={{position: 'absolute', left: 44, right: 44, top: 126, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div><span style={{fontSize: 30, fontWeight: 800}}>VOZ</span><span style={{fontSize: 21, color: scene.accent, marginLeft: 18, fontWeight: 750}}>CLARA E PRESENTE</span></div>
          <div style={{fontSize: 20, color: 'rgba(255,255,255,0.46)'}}>48 kHz</div>
        </div>
        <div style={{position: 'absolute', left: 44, right: 44, top: 192, height: 190, display: 'flex', alignItems: 'center', gap: 8}}>
          {wave.map((value, index) => {
            const movement = 0.88 + Math.sin(frame / 5 + index * 0.7) * 0.12;
            return <div key={index} style={{flex: 1, height: 22 + value * 145 * movement, maxHeight: 174, borderRadius: 6, background: index % 4 === 0 ? '#fff' : scene.accent, opacity: 0.55 + value * 0.45}} />;
          })}
        </div>
        <div style={{position: 'absolute', left: 44, right: 44, top: 426, height: 1, background: 'rgba(255,255,255,0.10)'}} />
        <div style={{position: 'absolute', left: 44, top: 468, fontSize: 23, fontWeight: 750, color: 'rgba(255,255,255,0.68)'}}>MÚSICA / DUCKING</div>
        {[0, 1, 2].map((row) => <div key={row} style={{position: 'absolute', left: 44, right: 44, top: 521 + row * 42, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.08)'}}>
          <div style={{width: `${[58, 37, 46][row]}%`, height: '100%', borderRadius: 6, background: row === 1 ? scene.accent : 'rgba(255,255,255,0.28)'}} />
        </div>)}
      </Panel>
      <Rise frame={frame} fps={fps} delay={14} style={{position: 'absolute', left: 72, right: 72, top: 1050, display: 'flex', gap: 16}}>
        <div style={{flex: 1, padding: '24px 28px', borderRadius: 24, background: `${scene.accent}18`, border: `1px solid ${scene.accent}45`}}>
          <div style={{fontSize: 43, fontWeight: 850, color: scene.accent}}>−14 LUFS</div><MicroLabel style={{fontSize: 17, marginTop: 6}}>LOUDNESS INTEGRADO</MicroLabel>
        </div>
        <div style={{flex: 1, padding: '24px 28px', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)'}}>
          <div style={{fontSize: 43, fontWeight: 850}}>−1 dBTP</div><MicroLabel style={{fontSize: 17, marginTop: 6}}>PICO MÁXIMO</MicroLabel>
        </div>
      </Rise>
    </Backdrop>
  );
}

export function MotionVisual({scene}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = interpolate(frame, [12, 150], [0, 1], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});
  const x = interpolate(progress, [0, 0.5, 1], [120, 430, 745]);
  const y = interpolate(progress, [0, 0.5, 1], [770, 485, 690]);
  const rotate = interpolate(progress, [0, 1], [-12, 8]);
  const trail = Array.from({length: 7}, (_, index) => {
    const p = Math.max(0, progress - (7 - index) * 0.035);
    return {x: interpolate(p, [0, 0.5, 1], [120, 430, 745]), y: interpolate(p, [0, 0.5, 1], [770, 485, 690]), opacity: (index + 1) / 15};
  });
  return (
    <Backdrop accent={scene.accent}>
      <Rise frame={frame} fps={fps} style={{position: 'absolute', left: 72, top: 354}}>
        <MicroLabel color={scene.accent}>CURVAS / KEYFRAMES / PROPÓSITO</MicroLabel>
      </Rise>
      <Panel style={{left: 66, right: 66, top: 425, height: 640, background: 'rgba(8,12,19,0.66)'}}>
        <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} viewBox="0 0 948 640">
          <path d="M120 345 C310 90 530 20 745 265" fill="none" stroke={`${scene.accent}55`} strokeWidth="3" strokeDasharray="8 13" />
          <path d="M120 345 C310 90 530 20 745 265" fill="none" stroke={scene.accent} strokeWidth="4" pathLength="1" strokeDasharray={`${progress} 1`} />
        </svg>
        {trail.map((point, index) => <div key={index} style={{position: 'absolute', left: point.x, top: point.y - 425, width: 122, height: 122, borderRadius: 28, border: `2px solid ${scene.accent}`, opacity: point.opacity, transform: 'translate(-50%, -50%)'}} />)}
        <div style={{
          position: 'absolute', left: x, top: y - 425, width: 154, height: 154, borderRadius: 34,
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
          background: `linear-gradient(145deg, ${scene.accent}, #fff)`, boxShadow: `0 24px 60px ${scene.accent}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#151924',
        }}><ArrowIcon size={74} /></div>
        {[['ENTRADA', 120, 345], ['ÊNFASE', 430, 60], ['SAÍDA', 745, 265]].map(([label, px, py]) => <div key={label} style={{position: 'absolute', left: px, top: py + 100, transform: 'translateX(-50%)'}}>
          <div style={{width: 14, height: 14, background: scene.accent, transform: 'rotate(45deg)', margin: '0 auto 16px'}} />
          <MicroLabel color="#fff" style={{fontSize: 17, letterSpacing: 1.6}}>{label}</MicroLabel>
        </div>)}
      </Panel>
      <Rise frame={frame} fps={fps} delay={20} style={{position: 'absolute', left: 72, right: 72, top: 1100, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 32, fontWeight: 760}}>movimento explica.</div>
        <div style={{fontSize: 24, color: 'rgba(255,255,255,0.48)'}}>excesso distrai.</div>
      </Rise>
    </Backdrop>
  );
}

export function CtaVisual({scene}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const icon = entrance(frame, fps, 8);
  const button = entrance(frame, fps, 30);
  return (
    <Backdrop accent={scene.accent}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center'}}>
        <div style={{
          width: 142, height: 142, margin: '0 auto 50px', borderRadius: '50%', background: scene.accent,
          color: '#171c28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, fontWeight: 900,
          transform: `scale(${icon}) rotate(${(1 - icon) * -30}deg)`, boxShadow: `0 0 90px ${scene.accent}40`,
        }}><ArrowIcon size={76} /></div>
        <Rise frame={frame} fps={fps} delay={12}>
          <div style={{fontSize: 82, lineHeight: 1.03, letterSpacing: -4.2, fontWeight: 880}}>SEU PRÓXIMO<br />CORTE COMEÇA<br /><span style={{color: scene.accent}}>AQUI.</span></div>
        </Rise>
        <Rise frame={frame} fps={fps} delay={24} style={{marginTop: 34, fontSize: 27, color: 'rgba(255,255,255,0.57)'}}>edição, motion e som na mesma direção</Rise>
      </div>
      <div style={{
        position: 'absolute', left: 180, right: 180, top: 1060, height: 116, borderRadius: 60,
        background: scene.accent, color: '#171c28', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
        fontSize: 32, fontWeight: 900, letterSpacing: 1.4, transform: `scale(${button})`, opacity: button,
        boxShadow: `0 24px 70px ${scene.accent}30`,
      }}>VAMOS EDITAR <ArrowIcon size={42} right /></div>
    </Backdrop>
  );
}

export function SceneVisual({scene, project}) {
  if (scene.visual === 'hook') return <HookVisual scene={scene} />;
  if (scene.visual === 'guide') return <GuideVisual scene={scene} />;
  if (scene.visual === 'cuts') return <CutsVisual scene={scene} project={project} />;
  if (scene.visual === 'audio') return <AudioVisual scene={scene} project={project} />;
  if (scene.visual === 'motion') return <MotionVisual scene={scene} />;
  return <CtaVisual scene={scene} />;
}
