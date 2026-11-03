/* ARMÁRIO-6: toda imagem é função pura de t; não há relógio, sorteio ou loop de animação. */
(() => {
  "use strict";
  const P = window.PROJECT;
  const $ = (id) => document.getElementById(id);
  let sourceImage = new Image();
  const canvas = $("source-canvas");
  const context = canvas.getContext("2d", { alpha: false });
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
    set.style.display = "none";
    set.style.alignItems = "center";
    set.style.gap = "22px";
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
    const scale = lerp(camera[0], camera[1], eased) + 0.038 * cutEnergy;
    const x = lerp(camera[2], camera[3], eased) + (sceneIndex % 2 ? -1 : 1) * 36 * cutEnergy;
    const y = lerp(camera[4], camera[5], eased) - 14 * cutEnergy;
    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    canvas.style.transform = `translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) scale(${scale.toFixed(6)})`;
    const brightness = 0.92 + 0.15 * cutEnergy;
    const saturation = 0.93 + 0.05 * cutEnergy;
    canvas.style.filter = `brightness(${brightness.toFixed(4)}) contrast(1.10) saturate(${saturation.toFixed(4)}) sepia(.04)`;

    $("color-wash").style.background = `linear-gradient(125deg,${rgba(scene.accent, .34)} 0%,rgba(255,255,255,.025) 42%,rgba(7,19,25,.42) 100%)`;
    const lightX = 13 + 35 * u + 60 * cutEnergy;
    const lightY = 3 + 9 * Math.sin(Math.PI * u);
    $("spotlight").style.background = `radial-gradient(circle at ${lightX.toFixed(2)}% ${lightY.toFixed(2)}%,rgba(255,238,205,.22) 0%,${rgba(scene.accent, .11)} 25%,transparent 62%)`;
    $("spotlight").style.opacity = String(0.52 + 0.28 * cutEnergy);

    const frame = Math.round(t * P.fps);
    $("grain").style.backgroundPosition = `${(frame * 37) % 256}px ${(frame * 61) % 256}px`;
    $("bottom-shade").style.opacity = String(t >= P.commentStart ? 1 : 0.82);

    const headerOut = smooth(P.ctaStart - 0.32, P.ctaStart - 0.06, t);
    $("hud").style.opacity = String(1 - headerOut);
    $("look-counter").textContent = `LOOK ${pad(sceneIndex + 1)} / 05`;
    progressFills.forEach((fill, index) => {
      const value = index < sceneIndex ? 1 : index === sceneIndex ? u : 0;
      fill.style.transform = `scaleX(${value})`;
      fill.style.background = index === sceneIndex ? scene.accent : "#ffffff";
    });

    const introOut = smooth(0.72, 0.98, t);
    $("intro").style.opacity = String(1 - introOut);
    $("intro-serif").style.color = scene.accent;

    const paletteIn = sceneIndex === 0 ? smooth(0.82, 1.05, t) : spring(dt);
    const paletteOut = headerOut;
    $("palette").style.opacity = String(clamp(paletteIn) * (1 - paletteOut));
    paletteSets.forEach((set, index) => { set.style.display = index === sceneIndex ? "flex" : "none"; });

    const numberEnergy = Math.exp(-2.8 * dt);
    $("scene-number").textContent = pad(sceneIndex + 1);
    $("scene-number").style.opacity = String((0.10 + 0.24 * numberEnergy) * (1 - headerOut));
    $("scene-number").style.webkitTextStroke = `2px ${scene.accent}`;

    const wipePhase = clamp(dt / 0.44);
    const wipeOpacity = sceneIndex > 0 && dt < 0.44 ? Math.sin(Math.PI * wipePhase) * 0.32 : 0;
    $("cut-wipe").style.opacity = String(wipeOpacity);
    $("cut-wipe").style.transform = `translateX(${lerp(-125, 125, wipePhase)}%) skewX(-12deg)`;
    $("cut-wipe").style.background = `linear-gradient(105deg,transparent 32%,${rgba(scene.accent, .72)} 50%,transparent 68%)`;
    $("cut-flash").style.opacity = String(sceneIndex > 0 ? 0.18 * Math.exp(-18 * dt) : 0);

    const groupIndex = groupIndexAt(t);
    groupElements.forEach((element, index) => { element.style.display = index === groupIndex ? "flex" : "none"; });
    const caption = $("caption");
    if (groupIndex >= 0) {
      const group = P.groups[groupIndex];
      const groupDt = Math.max(0, t - group.start);
      const exit = 1 - smooth(group.holdEnd - 0.10, group.holdEnd, t);
      caption.style.opacity = String(clamp(groupDt / 0.08) * exit);
      $("caption-kicker").textContent = `CÓDIGO ${pad(sceneIndex + 1)}`;
      $("caption-kicker").style.color = scene.accent;
      $("caption-rule").style.background = scene.accent;
      $("caption-rule").style.width = `${80 + 100 * clamp((t - group.start) / (group.holdEnd - group.start))}px`;
      group.lines.flat().forEach((wordIndex) => {
        const word = P.words[wordIndex];
        const element = wordElements[wordIndex];
        const wordDt = t - word.start;
        const entered = smooth(0, 0.075, wordDt);
        const active = t >= word.start && t < word.end;
        element.style.opacity = String(wordDt < 0 ? 0 : entered * (t >= word.end ? 0.94 : 1));
        element.style.color = word.accent ? scene.accent : "#ffffff";
        element.style.backgroundSize = active ? "100% 5px" : "0% 5px";
        element.style.textShadow = active
          ? `0 0 24px ${rgba(scene.accent, .45)},0 4px 9px rgba(0,0,0,.9),0 12px 30px rgba(0,0,0,.72)`
          : "0 4px 8px rgba(0,0,0,.88),0 10px 28px rgba(0,0,0,.72)";
      });
    } else {
      caption.style.opacity = "0";
    }

    const ctaDt = t - P.ctaStart;
    const ctaIn = ctaDt >= 0 ? spring(ctaDt) : 0;
    $("cta").style.opacity = String(ctaDt >= 0 ? smooth(0, 0.18, ctaDt) : 0);
    $("cta-rule").style.background = scene.accent;
    $("cta-rule").style.width = `${80 + 80 * clamp(ctaIn)}px`;

    const commentDt = t - P.commentStart;
    $("comment-cta").style.opacity = String(commentDt >= 0 ? smooth(0, 0.10, commentDt) : 0);
    commentNumbers.forEach((number, index) => {
      const itemDt = commentDt - index * 0.055;
      number.style.opacity = String(itemDt >= 0 ? smooth(0, 0.08, itemDt) : 0);
    });

    window.__frameState = { t, frame, scene: sceneIndex + 1, caption: groupIndex + 1, cta: t >= P.ctaStart, comment: t >= P.commentStart };
    document.getElementById("stage").dataset.scene = String(sceneIndex + 1);
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
