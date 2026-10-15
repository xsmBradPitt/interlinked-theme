// test/syntax-coverage.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { REQUIRED_SCOPES } from './required-scopes.mjs';

const theme = buildTheme(palette);
const covered = theme.tokenColors.flatMap(r => [].concat(r.scope));
const isCovered = s => covered.some(c => s === c || s.startsWith(`${c}.`));

for (const [group, scopes] of Object.entries(REQUIRED_SCOPES)) {
  test(`TextMate scopes for "${group}" are covered`, () => {
    assert.deepEqual(scopes.filter(s => !isCovered(s)), []);
  });
}

test('italic is used only where the Reference Theme uses it', () => {
  const italic = theme.tokenColors
    .filter(r => /italic/.test(r.settings.fontStyle ?? ''))
    .map(r => r.name)
    .sort();
  assert.deepEqual(italic, ['emphasis', 'variable.special']);
});
