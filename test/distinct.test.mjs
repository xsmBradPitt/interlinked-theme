// test/distinct.test.mjs — 使用者「一眼分辨」的需求（spec 故事 13、16、37、38）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { flatten, distance } from './support/color.mjs';

const theme = buildTheme(palette);
const BG = theme.colors['editor.background'];

function pairwiseDistinct(keys, min, over = BG) {
  const colours = keys.map(k => {
    assert.ok(theme.colors[k], `${k} is not defined`);
    return [k, flatten(theme.colors[k], over)];
  });
  const close = [];
  for (let i = 0; i < colours.length; i++) {
    for (let j = i + 1; j < colours.length; j++) {
      const d = distance(colours[i][1], colours[j][1]);
      if (d < min) close.push(`${colours[i][0]} vs ${colours[j][0]}: ${d.toFixed(0)}`);
    }
  }
  assert.deepEqual(close, []);
}

test('diagnostic severities are pairwise distinguishable', () => {
  pairwiseDistinct(
    ['editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground', 'editorHint.foreground'], 60);
});

test('selection, find match and find highlight are distinguishable', () => {
  pairwiseDistinct(
    ['editor.selectionBackground', 'editor.findMatchBackground', 'editor.findMatchHighlightBackground'], 40);
});

test('git decorations are pairwise distinguishable', () => {
  pairwiseDistinct([
    'gitDecoration.addedResourceForeground', 'gitDecoration.modifiedResourceForeground',
    'gitDecoration.deletedResourceForeground', 'gitDecoration.untrackedResourceForeground',
    'gitDecoration.ignoredResourceForeground', 'gitDecoration.conflictingResourceForeground',
  ], 60);
});

test('diff inserted and removed text backgrounds are distinguishable', () => {
  pairwiseDistinct(['diffEditor.insertedTextBackground', 'diffEditor.removedTextBackground'], 40);
});
