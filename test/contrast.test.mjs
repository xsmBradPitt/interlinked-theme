// test/contrast.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { contrast } from './support/color.mjs';
import { resolveRef } from './support/collect.mjs';
import { PAIRS } from './contrast-pairs.mjs';

test('contrast calculator sanity: black/white is 21:1', () => {
  assert.equal(Math.round(contrast('#FFFFFF', '#000000')), 21);
});

const theme = buildTheme(palette);
for (const pair of PAIRS) {
  test(`${pair.name} meets ${pair.min}:1`, () => {
    const fg = resolveRef(theme, pair.fg);
    const bg = resolveRef(theme, pair.bg);
    assert.ok(fg, `foreground ${pair.fg.join(':')} is not defined`);
    assert.ok(bg, `background ${pair.bg.join(':')} is not defined`);
    const ratio = contrast(fg, bg);   // fg 帶 alpha 時會先合成
    assert.ok(ratio >= pair.min, `${fg} on ${bg} is ${ratio.toFixed(2)}:1, need ${pair.min}:1`);
  });
}
