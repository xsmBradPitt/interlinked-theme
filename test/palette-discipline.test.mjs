// test/palette-discipline.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { collectColors } from './support/collect.mjs';

test('palette entries are well-formed and unique', () => {
  const values = Object.values(palette);
  for (const [name, hex] of Object.entries(palette)) assert.match(hex, /^#[0-9A-F]{6}$/, name);
  assert.equal(new Set(values).size, values.length, 'two palette names share one colour');
});

test('every theme colour, ignoring alpha, is a palette colour', () => {
  const allowed = new Set(Object.values(palette));
  const strays = collectColors(buildTheme(palette))
    .filter(c => !allowed.has(c.value.slice(0, 7).toUpperCase()))
    .map(c => `${c.path} = ${c.value}`);
  assert.deepEqual(strays, []);
});
