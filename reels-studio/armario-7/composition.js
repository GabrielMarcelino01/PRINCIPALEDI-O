/* ARMÁRIO-7: cada pixel é função pura de t; não há relógio, sorteio ou loop de animação. */
(() => {
  "use strict";
  const P = window.PROJECT;
  const $ = (id) => document.getElementById(id);
  let sourceImage = new Image();
  const canvas = $("source-canvas");
  const backdropCanvas = $("backdrop-canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const backdropContext = backdropCanvas.getContext("2d", { alpha: false });
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (a, b, v) => {
    const u = clamp((v - a) / (b - a || 1));
    return u * u * (3 - 2 * u);
  };
  const spring = (dt) => dt <= 0 ? 0 : 1 - Math.exp(-7.5 * dt) * Math.cos(11 * dt);
  const rgba = (hex, alpha) => {
    const n = Number.parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  };
  const pad = (n) => String(n).padStart(2, "0");

  const progressFills = P.scenes.map(() => {
    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    track.appendChild(fill);
    $("progress").appendChild(track);
    return fill;
  });

  const paletteSets = P.scenes.map((scene) => {
    const set = document.createElement("div");
    set.className = "palette-set";
    scene.labels.forEach((label, index) => {
      if (index) {
        const divider = document.createElement("div");
        divider.className = "palette-divider";
        set.appendChild(divider);
      }
      const item = document.createElement("div");
      item.className = "palette-item";
      const dot = document.createElement("span");
      dot.className = "palette-dot";
      dot.style.background = scene.colors[index];
      const text = document.createElement("span");
      text.textContent = label;
      item.append(dot, text);
      set.appendChild(item);
    });
    $("palette").appendChild(set);
    return set;
  });

  const groupElements = [];
  const wordElements = [];
  P.groups.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.className = "caption-group";
    group.lines.forEach((line) => {
      const lineEl = document.createElement("div");
      lineEl.className = "caption-line";
      line.forEach((wordIndex) => {
        const word = P.words[wordIndex];
        const span = document.createElement("span");
        span.className = `word${word.serif ? " serif" : ""}`;
        span.textContent = word.serif ? word.text : word.text.toUpperCase();
        span.dataset.word = String(wordIndex);
        lineEl.appendChild(span);
        wordElements[wordIndex] = span;
      });
      groupEl.appendChild(lineEl);
    });
    $("caption-groups").appendChild(groupEl);
    groupElements.push(groupEl);
  });

  const commentNumbers = P.scenes.map((scene, index) => {
    const number = document.createElement("div");
    number.className = "comment-number";
    number.textContent = pad(index + 1);
    number.style.borderColor = scene.accent;
    $("comment-numbers").appendChild(number);
    return number;
  });

  function sceneIndexAt(t) {
    for (let index = P.scenes.length - 1; index >= 0; index -= 1) {
      if (t >= P.scenes[index].start) return index;
    }
    return 0;
  }

  function groupIndexAt(t) {
    if (t >= P.commentStart) return -1;
    for (let index = P.groups.length - 1; index >= 0; index -= 1) {
      if (t >= P.groups[index].start && t < P.groups[index].holdEnd) return index;
    }
    return -1;
  }

  function renderAt(t) {
    const sceneIndex = sceneIndexAt(t);
    const scene = P.scenes[sceneIndex];
    const sceneDuration = scene.end - scene.start;
    const dt = Math.max(0, t - scene.start);
    const u = clamp(dt / sceneDuration);
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * u);
    const cutEnergy = sceneIndex === 0 ? 0 : Math.exp(-11 * dt);
    const camera = scene.camera;
    const scale = lerp(camera[0], camera[1], eased) + 0.012 * cutEnergy;
    const x = lerp(camera[2], camera[3], eased) + (sceneIndex % 2 ? -1 : 1) * 8 * cutEnergy;
    const y = lerp(camera[4], camera[5], eased) - 3 * cutEnergy;

    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    backdropContext.drawImage(sourceImage, 0, 0, backdropCanvas.width, backdropCanvas.height);
    canvas.style.transform = `translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) scale(${scale.toFixed(6)})`;
    canvas.style.filter = `brightness(${(0.94 + 0.10 * cutEnergy).toFixed(4)}) contrast(1.08) saturate(${(0.96 + 0.08 * cutEnergy).toFixed(4)}) sepia(.02)`;
    backdropCanvas.style.transform = `translate3d(${(-x * 1.7).toFixed(3)}px,0,0) scale(${(1.14 + 0.025 * cutEnergy).toFixed(6)})`;
    backdropCanvas.style.filter = `blur(32px) brightness(${(0.34 + 0.08 * cutEnergy).toFixed(4)}) contrast(1.08) saturate(.84)`;

    $("color-wash").style.background = `linear-gradient(125deg,${rgba(scene.accent, .28)} 0%,rgba(255,255,255,.018) 42%,rgba(7,14,20,.46) 100%)`;
    const lightX = 10 + 38 * u + 58 * cutEnergy;
    const lightY = 4 + 8 * Math.sin(Math.PI * u);
    $("spotlight").style.background = `radial-gradient(circle at ${lightX.toFixed(2)}% ${lightY.toFixed(2)}%,rgba(255,241,214,.18) 0%,${rgba(scene.accent, .10)} 25%,transparent 62%)`;
    $("spotlight").style.opacity = String(0.48 + 0.26 * cutEnergy);

    const frame = Math.round(t * P.fps);
    $("grain").style.backgroundPosition = `${(frame * 37) % 256}px ${(frame * 61) % 256}px`;

    const headerOut = smooth(P.ctaStart - 0.30, P.ctaStart - 0.06, t);
    $("hud").style.opacity = String(1 - headerOut);
    $("look-counter").textContent = `LOOK ${pad(sceneIndex + 1)} / 05`;
    progressFills.forEach((fill, index) => {
      const value = index < sceneIndex ? 1 : index === sceneIndex ? u : 0;
      fill.style.transform = `scaleX(${value})`;
      fill.style.background = index === sceneIndex ? scene.accent : "#ffffff";
    });

    const introOut = smooth(0.76, 0.96, t);
    $("intro").style.opacity = String(1 - introOut);
    const sceneCodeIn = smooth(0.96, 1.08, t);
    $("scene-code").textContent = scene.short;
    $("scene-code").style.color = scene.accent;
    $("scene-code").style.opacity = String(sceneCodeIn * (1 - headerOut));
    $("side-index").textContent = pad(sceneIndex + 1);
    $("side-index").style.webkitTextStroke = `1.5px ${scene.accent}`;
    $("side-index").style.opacity = String(0.62 * (1 - headerOut));

    const wipePhase = clamp(dt / 0.42);
    const wipeOpacity = sceneIndex > 0 && dt < 0.42 ? Math.sin(Math.PI * wipePhase) * 0.30 : 0;
    $("cut-wipe").style.opacity = String(wipeOpacity);
    $("cut-wipe").style.transform = `translateX(${lerp(-125, 125, wipePhase)}%) skewX(-12deg)`;
    $("cut-wipe").style.background = `linear-gradient(105deg,transparent 32%,${rgba(scene.accent, .72)} 50%,transparent 68%)`;
    $("cut-flash").style.opacity = String(sceneIndex > 0 ? 0.15 * Math.exp(-18 * dt) : 0);

    paletteSets.forEach((set, index) => { set.style.display = index === sceneIndex ? "flex" : "none"; });
    $("caption-count").textContent = `MATCH ${pad(sceneIndex + 1)}`;
    $("caption-count").style.color = scene.accent;
    const metaOut = smooth(P.commentStart - 0.12, P.commentStart, t);
    $("caption-top").style.opacity = String(1 - metaOut);

    const groupIndex = groupIndexAt(t);
    groupElements.forEach((element, index) => { element.style.display = index === groupIndex ? "flex" : "none"; });
    const caption = $("caption");
    if (groupIndex >= 0) {
      const group = P.groups[groupIndex];
      const groupDt = Math.max(0, t - group.start);
      const exit = 1 - smooth(group.holdEnd - 0.10, group.holdEnd, t);
      const captionOpacity = clamp(groupDt / 0.08) * exit;
      caption.style.opacity = String(captionOpacity);
      $("caption-rule").style.opacity = String(captionOpacity);
      $("caption-rule").style.background = scene.accent;
      $("caption-rule").style.width = `${80 + 100 * clamp((t - group.start) / (group.holdEnd - group.start))}px`;
      group.lines.flat().forEach((wordIndex) => {
        const word = P.words[wordIndex];
        const element = wordElements[wordIndex];
        const wordDt = t - word.start;
        const entered = smooth(0, 0.075, wordDt);
        const active = t >= word.start && t < word.end;
        const color = word.accent ? scene.accent : word.secondary ? scene.secondary : "#ffffff";
        element.style.opacity = String(wordDt < 0 ? 0 : entered * (t >= word.end ? 0.94 : 1));
        element.style.color = color;
        element.style.backgroundSize = active ? "100% 4px" : "0% 4px";
        element.style.textShadow = active
          ? `0 0 24px ${rgba(color, .42)},0 4px 9px rgba(0,0,0,.9),0 12px 30px rgba(0,0,0,.76)`
          : "0 4px 8px rgba(0,0,0,.9),0 10px 28px rgba(0,0,0,.76)";
      });
    } else {
      caption.style.opacity = "0";
      $("caption-rule").style.opacity = "0";
    }

    const ctaDt = t - P.ctaStart;
    const ctaIn = ctaDt >= 0 ? spring(ctaDt) : 0;
    $("cta").style.opacity = String(ctaDt >= 0 ? smooth(0, 0.18, ctaDt) : 0);
    $("cta-rule").style.background = scene.accent;
    $("cta-rule").style.width = `${80 + 80 * clamp(ctaIn)}px`;

    const commentDt = t - P.commentStart;
    $("comment-cta").style.opacity = String(commentDt >= 0 ? smooth(0, 0.10, commentDt) : 0);
    $("comment-title").style.color = scene.accent;
    commentNumbers.forEach((number, index) => {
      const itemDt = commentDt - index * 0.055;
      number.style.opacity = String(itemDt >= 0 ? smooth(0, 0.08, itemDt) : 0);
    });

    window.__frameState = { t, frame, scene: sceneIndex + 1, caption: groupIndex + 1, cta: t >= P.ctaStart, comment: t >= P.commentStart };
    $("stage").dataset.scene = String(sceneIndex + 1);
    return window.__frameState;
  }

  async function seekAndRender(t) {
    const frame = Math.round(t * P.fps);
    const path = `out/source-frames/${String(frame).padStart(5, "0")}.jpg`;
    const next = new Image();
    next.src = path;
    await next.decode();
    sourceImage = next;
    const state = renderAt(t);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return state;
  }

  async function init() {
    try {
      await document.fonts.ready;
      await seekAndRender(0);
      window.__compositionReady = true;
    } catch (error) {
      window.__compositionError = String(error && error.stack || error);
      throw error;
    }
  }

  window.renderAt = renderAt;
  window.seekAndRender = seekAndRender;
  window.__compositionReady = false;
  init();
})();
