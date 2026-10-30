(() => {
  'use strict';

  let config = null;
  const $ = (id) => document.getElementById(id);
  const elements = {
    scenes: [$('scene-1'), $('scene-2'), $('scene-3')],
    cameras: [$('camera-1'), $('camera-2'), $('camera-3')],
    words: Array.from(document.querySelectorAll('[data-enter]')),
    lines: Array.from(document.querySelectorAll('[data-line]')),
    bars: Array.from(document.querySelectorAll('#rhythm-bars span')),
    chapter: $('chapter'), timecode: $('timecode'), footer: $('footer-label'),
    progress: $('progress'), progressTrack: $('progress-track'), topline: $('topline'),
    orbit1: $('orbit-1'), orbit2: $('orbit-2'), maskEdge: $('mask-edge'),
    precision: $('precision-main'), finalLockup: $('final-lockup'),
    ticks: $('ticks'), playhead: $('playhead'), hud: $('hud'),
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, p) => a + (b - a) * p;
  const range = (t, start, end) => clamp((t - start) / (end - start));
  const smooth = (p) => p * p * (3 - 2 * p);
  const outCubic = (p) => 1 - Math.pow(1 - p, 3);
  const spring = (t, start, duration = 0.62) => {
    const p = range(t, start, start + duration);
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return 1 - Math.exp(-6.4 * p) * (Math.cos(11.5 * p) + 0.42 * Math.sin(11.5 * p));
  };
  const setTransform = (element, value) => { element.style.transform = value; };
  const setOpacity = (element, value) => { element.style.opacity = String(clamp(value)); };

  function buildTicks() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 60; index += 1) {
      const tick = document.createElement('span');
      if (index % 10 === 0) tick.className = 'major';
      fragment.appendChild(tick);
    }
    elements.ticks.replaceChildren(fragment);
  }

  function renderWords(t) {
    for (const element of elements.words) {
      const start = Number(element.dataset.enter);
      const value = spring(t, start);
      const opacity = range(t, start, start + 0.16);
      const rise = (1 - value) * (element.classList.contains('pill') || element.classList.contains('spec') ? 34 : 74);
      const scale = 0.92 + 0.08 * value;
      setOpacity(element, opacity);
      setTransform(element, `translate3d(0,${rise.toFixed(4)}px,0) scale(${scale.toFixed(6)})`);
    }
    for (const element of elements.lines) {
      const value = outCubic(range(t, Number(element.dataset.line), Number(element.dataset.line) + 0.5));
      setTransform(element, `scaleX(${value.toFixed(6)})`);
    }
  }

  function renderScenes(t) {
    const enter2 = smooth(range(t, 1.65, 2.20));
    const enter3 = smooth(range(t, 3.60, 4.25));
    const scene1Visible = t < 2.20;
    const scene2Visible = t >= 1.65 && t < 4.25;
    const scene3Visible = t >= 3.60;
    elements.scenes[0].style.display = scene1Visible ? 'block' : 'none';
    elements.scenes[1].style.display = scene2Visible ? 'block' : 'none';
    elements.scenes[2].style.display = scene3Visible ? 'block' : 'none';
    elements.scenes[1].style.clipPath = `inset(0 ${(100 * (1 - enter2)).toFixed(5)}% 0 0)`;
    elements.scenes[2].style.clipPath = `circle(${(155 * enter3).toFixed(5)}% at 50% 47%)`;
    elements.maskEdge.style.left = `${(enter2 * 1080).toFixed(4)}px`;
    setOpacity(elements.maskEdge, scene2Visible && enter2 < 1 ? 1 : 0);
  }

  function renderCameras(t) {
    const p1 = smooth(range(t, 0, 2.2));
    const p2 = smooth(range(t, 1.65, 4.25));
    const p3 = smooth(range(t, 3.6, 6));
    setTransform(elements.cameras[0], `translate3d(${mix(0, -22, p1).toFixed(4)}px,${mix(14, -8, p1).toFixed(4)}px,0) scale(${mix(1.075, 1.025, p1).toFixed(6)})`);
    setTransform(elements.cameras[1], `translate3d(${mix(-34, 24, p2).toFixed(4)}px,0,0) scale(${mix(1.025, 1.065, p2).toFixed(6)})`);
    setTransform(elements.cameras[2], `translate3d(0,${mix(26, -12, p3).toFixed(4)}px,0) scale(${mix(1.075, 1.025, p3).toFixed(6)})`);
  }

  function renderGraphics(t) {
    setTransform(elements.orbit1, `rotate(${(t * 31).toFixed(5)}deg)`);
    setTransform(elements.orbit2, `rotate(${(-t * 43).toFixed(5)}deg)`);
    elements.bars.forEach((bar, index) => {
      const phase = (t - 2.45) * 5.2 + index * 0.72;
      const height = 64 + 154 * (0.5 + 0.5 * Math.sin(phase));
      const enter = spring(t, 2.55 + index * 0.035, 0.5);
      bar.style.height = `${height.toFixed(4)}px`;
      setTransform(bar, `scaleY(${enter.toFixed(6)})`);
      setOpacity(bar, range(t, 2.50 + index * 0.035, 2.68 + index * 0.035));
    });
    const tickP = range(t, 3.8, 5.0);
    elements.playhead.style.left = `calc(${(tickP * 100).toFixed(5)}% - 13px)`;
    const finalIn = smooth(range(t, 5.0, 5.34));
    const introOut = smooth(range(t, 4.86, 5.16));
    setOpacity(elements.precision, 1 - introOut);
    setTransform(elements.precision, `translate3d(0,${(-55 * introOut).toFixed(4)}px,0)`);
    setOpacity(elements.finalLockup, finalIn);
    elements.finalLockup.style.visibility = t < 5 ? 'hidden' : 'visible';
  }

  function renderHud(t, frame) {
    const chapter = t < 1.925 ? 1 : (t < 3.925 ? 2 : 3);
    elements.chapter.textContent = `0${chapter} / 03`;
    elements.timecode.textContent = `T ${t.toFixed(3)} / F ${String(frame).padStart(3, '0')}`;
    elements.footer.textContent = chapter === 1 ? 'Função do tempo' : (chapter === 2 ? 'Ritmo com intenção' : 'Precisão em 60 fps');
    elements.hud.style.color = '#ffffff';
    elements.hud.style.mixBlendMode = 'difference';
    elements.progressTrack.style.background = 'rgba(255,255,255,.24)';
    setTransform(elements.progress, `scaleX(${clamp(t / config.durationSeconds).toFixed(7)})`);
    setTransform(elements.topline, `scaleX(${(0.22 + 0.78 * clamp(t / config.durationSeconds)).toFixed(7)})`);
  }

  function seek(timeSeconds) {
    if (!config) throw new Error('Timeline não configurada.');
    const t = clamp(Number(timeSeconds), 0, config.durationSeconds);
    const frame = Math.min(config.durationInFrames - 1, Math.max(0, Math.round(t * config.fps)));
    renderScenes(t);
    renderCameras(t);
    renderWords(t);
    renderGraphics(t);
    renderHud(t, frame);
    return { time: t, frame, fps: config.fps };
  }

  window.__setTimeline = (nextConfig) => {
    config = nextConfig;
    buildTicks();
    window.__temporalReady = true;
  };
  window.seek = seek;
})();
