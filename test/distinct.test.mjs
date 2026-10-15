// test/distinct.test.mjs — 使用者「一眼分辨」的需求（spec 故事 13、16、37、38）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { flatten, distance, parseHex } from './support/color.mjs';

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

// 最終審查補充（spec 故事 12、20）：游標停在變數上時，讀取與寫入兩種 highlight 都要看得見、且彼此可分。
test('word highlights (read and write) are visible against the editor and distinguishable from each other', () => {
  pairwiseDistinct(
    ['editor.background', 'editor.wordHighlightBackground', 'editor.wordHighlightStrongBackground'], 40);
});

test('sticky scroll is separated from the editor body by a visible shadow', () => {
  // VS Code 在未明確設定時，editorStickyScroll.shadow 取自 scrollbar.shadow；全透明會讓釘住的行融進編輯區。
  const shadow = theme.colors['editorStickyScroll.shadow'] ?? theme.colors['scrollbar.shadow'];
  assert.ok(shadow, 'no sticky scroll shadow is defined');
  assert.ok(parseHex(shadow).a > 0, `sticky scroll shadow ${shadow} is fully transparent`);
  const d = distance(flatten(shadow, BG), parseHex(BG));
  assert.ok(d >= 10, `sticky scroll shadow ${shadow} is only ${d.toFixed(0)} away from the editor background`);
});
