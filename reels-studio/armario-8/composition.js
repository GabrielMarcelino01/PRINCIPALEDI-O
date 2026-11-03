/* ARMÁRIO-8: vídeo integral + falas legendadas + SEGUIR final; cada quadro depende somente de t. */
(() => {
  "use strict";
  const P = window.PROJECT;
  const $ = (id) => document.getElementById(id);
  let sourceImage = new Image();
  const canvas = $("source-canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => {
    const u = clamp((v - a) / (b - a || 1));
    return u * u * (3 - 2 * u);
  };

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
  $("follow-text").textContent = P.followCta.text;

  function sceneIndexAt(t) {
    for (let index = P.scenes.length - 1; index >= 0; index -= 1) {
      if (t >= P.scenes[index].start) return index;
    }
    return 0;
  }

  function groupIndexAt(t) {
    for (let index = P.groups.length - 1; index >= 0; index -= 1) {
      if (t >= P.groups[index].start && t < P.groups[index].holdEnd) return index;
    }
    return -1;
  }

  function renderFollow(t) {
    const cta = P.followCta;
    const follow = $("follow-cta");
    if (t < cta.start) {
      follow.style.display = "none";
      follow.style.opacity = "0";
      return false;
    }
    // Entrada power3.out do instagram-follow, calculada sem GSAP, timer ou histórico.
    const progress = clamp((t - cta.start) / 0.5);
    const entrance = 1 - Math.pow(1 - progress, 3);
    follow.style.display = "flex";
    follow.style.opacity = String(entrance);
    follow.style.top = `${cta.top + Math.round((1 - entrance) * 80)}px`;
    return true;
  }

  function renderAt(t) {
    const sceneIndex = sceneIndexAt(t);
    const scene = P.scenes[sceneIndex];
    const frame = Math.round(t * P.fps);
    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

    const groupIndex = groupIndexAt(t);
    groupElements.forEach((element, index) => { element.style.display = index === groupIndex ? "flex" : "none"; });
    const caption = $("caption");
    if (groupIndex >= 0) {
      const group = P.groups[groupIndex];
      const groupDt = Math.max(0, t - group.start);
      const exit = 1 - smooth(group.holdEnd - 0.10, group.holdEnd, t);
      caption.style.opacity = String(clamp(groupDt / 0.08) * exit);
      group.lines.flat().forEach((wordIndex) => {
        const word = P.words[wordIndex];
        const element = wordElements[wordIndex];
        const wordDt = t - word.start;
        const entered = smooth(0, 0.075, wordDt);
        const color = word.accent ? scene.accent : word.secondary ? scene.secondary : "#ffffff";
        element.style.opacity = String(wordDt < 0 ? 0 : entered * (t >= word.end ? 0.94 : 1));
        element.style.color = color;
      });
    } else {
      caption.style.opacity = "0";
    }

    const follow = renderFollow(t);
    window.__frameState = { t, frame, scene: sceneIndex + 1, caption: groupIndex + 1, follow };
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
