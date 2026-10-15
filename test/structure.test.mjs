// test/structure.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { UI_AREAS, OPAQUE_KEYS } from '../src/ui-areas.mjs';
import { collectColors } from './support/collect.mjs';

const theme = buildTheme(palette);
const HEX = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;

test('every colour value is #RRGGBB or #RRGGBBAA', () => {
  const bad = collectColors(theme).filter(c => !HEX.test(c.value));
  assert.deepEqual(bad, []);
});

for (const [area, keys] of Object.entries(UI_AREAS)) {
  test(`UI Area "${area}" defines every required key`, () => {
    const missing = keys.filter(k => !(k in theme.colors));
    assert.deepEqual(missing, []);
  });
}

test('surface keys are opaque', () => {
  const bad = OPAQUE_KEYS.filter(k => {
    const v = theme.colors[k];
    return v === undefined || (v.length === 9 && !/FF$/i.test(v));
  });
  assert.deepEqual(bad, []);
});

test('all 16 ANSI colours are defined', () => {
  const keys = ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White']
    .flatMap(n => [`terminal.ansi${n}`, `terminal.ansiBright${n}`]);
  assert.equal(keys.length, 16);
  assert.deepEqual(keys.filter(k => !(k in theme.colors)), []);
});

test('theme metadata and syntax layers', () => {
  assert.equal(theme.name, 'Interlinked');
  assert.equal(theme.type, 'dark');
  assert.equal(theme.semanticHighlighting, true);
  assert.ok(theme.tokenColors.length > 0, 'tokenColors is empty');
  assert.ok(Object.keys(theme.semanticTokenColors).length > 0, 'semanticTokenColors is empty');
});

test('token foregrounds are opaque (no alpha in tokenColors)', () => {
  const bad = theme.tokenColors
    .filter(r => r.settings.foreground && r.settings.foreground.length !== 7)
    .map(r => r.name);
  assert.deepEqual(bad, []);
});
