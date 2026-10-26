export const DESIGN_SETTINGS = Object.freeze({
  width: 1920,
  height: 1080,
  fps: 60,
  durationInFrames: 1200,
});

export const REELS_SETTINGS = Object.freeze({
  width: 1080,
  height: 1920,
  fps: 60,
  durationInFrames: 1080,
});

export const clamp01 = (value) => Math.max(0, Math.min(1, value));

export function progress(frame, start, end) {
  if (end <= start) return frame >= end ? 1 : 0;
  return clamp01((frame - start) / (end - start));
}

export function easeOutBack(value) {
  const t = clamp01(value);
  if (t === 0 || t === 1) return t;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export function easeOutBounce(value) {
  const t = clamp01(value);
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) {
    const x = t - 1.5 / d1;
    return n1 * x * x + 0.75;
  }
  if (t < 2.5 / d1) {
    const x = t - 2.25 / d1;
    return n1 * x * x + 0.9375;
  }
  const x = t - 2.625 / d1;
  return n1 * x * x + 0.984375;
}

export function sceneIndexAt(frame, durations) {
  if (!Array.isArray(durations) || durations.length === 0) return -1;
  let cursor = 0;
  for (let index = 0; index < durations.length; index += 1) {
    cursor += Math.max(0, durations[index]);
    if (frame < cursor) return index;
  }
  return durations.length - 1;
}

export function makeTimedWords(text, start = 0, step = 0.4) {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({
      text: word,
      start: start + index * step,
      end: start + (index + 1) * step,
    }));
}

export function buildCaptionPages(words, pageSize = 4) {
  const size = Math.max(1, Math.floor(pageSize));
  const pages = [];
  for (let index = 0; index < words.length; index += size) {
    pages.push(words.slice(index, index + size));
  }
  return pages;
}

export function captionAtFrame(words, frame, fps, pageSize = 4) {
  const pages = buildCaptionPages(words, pageSize);
  if (pages.length === 0) {
    return {pages, page: [], pageIndex: 0, activeIndex: -1, absoluteIndex: -1};
  }
  const time = frame / fps;
  let absoluteIndex = words.findIndex((word) => time >= word.start && time < word.end);
  if (absoluteIndex === -1 && time >= words[words.length - 1].end) {
    absoluteIndex = words.length - 1;
  }
  const anchor = absoluteIndex === -1 ? 0 : absoluteIndex;
  const pageIndex = Math.floor(anchor / Math.max(1, Math.floor(pageSize)));
  return {
    pages,
    page: pages[pageIndex],
    pageIndex,
    activeIndex: absoluteIndex === -1 ? -1 : absoluteIndex % Math.max(1, Math.floor(pageSize)),
    absoluteIndex,
  };
}
