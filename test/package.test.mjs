// test/package.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('manifest identifies the extension', () => {
  assert.equal(pkg.name, 'interlinked-theme');
  assert.equal(pkg.publisher, 'xsmbradpitt');
  assert.equal(pkg.displayName, 'Interlinked — Blade Runner 2049 inspired');
  assert.equal(pkg.license, 'MIT');
  assert.deepEqual(pkg.categories, ['Themes']);
  for (const k of ['blade runner', 'cyberpunk', 'teal', 'dark', 'terminal']) {
    assert.ok(pkg.keywords.includes(k), `keyword missing: ${k}`);
  }
});

test('manifest contributes exactly one dark theme', () => {
  const themes = pkg.contributes.themes;
  assert.equal(themes.length, 1);
  assert.equal(themes[0].label, 'Interlinked');
  assert.equal(themes[0].uiTheme, 'vs-dark');
  assert.equal(themes[0].path, './themes/interlinked-color-theme.json');
});

test('manifest has a bounded engine floor and a repository', () => {
  assert.match(pkg.engines.vscode, /^\^1\.\d+\.\d+$/);
  assert.equal(pkg.repository.url, 'https://github.com/xsmBradPitt/interlinked-theme.git');
});

test('declared theme file exists, parses, and matches buildTheme output', () => {
  const rel = pkg.contributes.themes[0].path.replace(/^\.\//, '');
  const onDisk = JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));
  assert.deepEqual(onDisk, JSON.parse(JSON.stringify(buildTheme(palette))));
});
