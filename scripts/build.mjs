// 單一 build 指令：npm run build
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';

const out = fileURLToPath(new URL('../themes/interlinked-color-theme.json', import.meta.url));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(buildTheme(palette), null, 2) + '\n');
console.log(`wrote ${out}`);
