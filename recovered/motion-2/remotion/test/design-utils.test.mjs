import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESIGN_SETTINGS,
  REELS_SETTINGS,
  buildCaptionPages,
  captionAtFrame,
  easeOutBack,
  easeOutBounce,
  makeTimedWords,
  progress,
  sceneIndexAt,
} from '../src/design-utils.mjs';

test('as composições mantêm duração e taxa esperadas', () => {
  assert.equal(DESIGN_SETTINGS.durationInFrames / DESIGN_SETTINGS.fps, 20);
  assert.equal(REELS_SETTINGS.durationInFrames / REELS_SETTINGS.fps, 18);
  assert.equal(DESIGN_SETTINGS.fps, 60);
  assert.equal(REELS_SETTINGS.fps, 60);
});

test('progresso é limitado e easings terminam em um', () => {
  assert.equal(progress(10, 20, 30), 0);
  assert.equal(progress(30, 20, 30), 1);
  assert.equal(easeOutBack(0), 0);
  assert.equal(easeOutBack(1), 1);
  assert.equal(easeOutBounce(0), 0);
  assert.equal(easeOutBounce(1), 1);
  assert.ok(easeOutBack(0.7) > 1);
});

test('cortes de cena respeitam as fronteiras', () => {
  const durations = [180, 180, 180];
  assert.equal(sceneIndexAt(0, durations), 0);
  assert.equal(sceneIndexAt(179, durations), 0);
  assert.equal(sceneIndexAt(180, durations), 1);
  assert.equal(sceneIndexAt(540, durations), 2);
  assert.equal(sceneIndexAt(0, []), -1);
});

test('legendas são agrupadas sem perder palavras', () => {
  const words = makeTimedWords('um dois três quatro cinco', 0.2, 0.4);
  const pages = buildCaptionPages(words, 2);
  assert.deepEqual(pages.map((page) => page.length), [2, 2, 1]);
  assert.equal(pages.flat().length, words.length);
  assert.equal(captionAtFrame(words, 30, 60, 2).absoluteIndex, 0);
  assert.equal(captionAtFrame(words, 78, 60, 2).absoluteIndex, 2);
  assert.equal(captionAtFrame(words, 78, 60, 2).pageIndex, 1);
});
