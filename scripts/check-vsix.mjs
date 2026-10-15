// CI 打包冒煙測試：node scripts/check-vsix.mjs <file.vsix>
import { execFileSync } from 'node:child_process';

const vsix = process.argv[2];
if (!vsix) { console.error('usage: check-vsix.mjs <file.vsix>'); process.exit(2); }

const unzip = (...args) => execFileSync('unzip', args, { encoding: 'utf8' });
const list = unzip('-Z1', vsix).split('\n').filter(Boolean);
// vsce 會把 README.md / CHANGELOG.md 改成小寫、LICENSE 改成 LICENSE.txt（實測 @vscode/vsce 4.0.0），
// 所以一律用小寫比對。
const lower = new Set(list.map(f => f.toLowerCase()));

const must = ['extension/package.json', 'extension/themes/interlinked-color-theme.json',
  'extension/readme.md', 'extension/changelog.md', 'extension/license.txt', 'extension/icon.png'];
const forbidden = ['extension/reference/', 'extension/samples/', 'extension/docs/', 'extension/test/',
  'extension/src/', 'extension/scripts/', 'extension/prototype/', 'extension/images/'];

const problems = [
  ...must.filter(f => !lower.has(f)).map(f => `missing: ${f}`),
  ...list.filter(f => forbidden.some(p => f.toLowerCase().startsWith(p))).map(f => `should be excluded: ${f}`),
];

const manifest = JSON.parse(unzip('-p', vsix, 'extension/package.json'));
for (const t of manifest.contributes.themes) {
  const entry = `extension/${t.path.replace(/^\.\//, '')}`;
  if (!lower.has(entry.toLowerCase())) { problems.push(`declared theme missing: ${entry}`); continue; }
  try { JSON.parse(unzip('-p', vsix, entry)); }
  catch (e) { problems.push(`theme does not parse: ${entry}: ${e.message}`); }
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`ok: ${list.length} files`);
