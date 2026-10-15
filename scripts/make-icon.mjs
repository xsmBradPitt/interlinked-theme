// scripts/make-icon.mjs — node scripts/make-icon.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { palette } from '../src/palette.mjs';

const N = 256;
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const colours = [palette.bgChrome, palette.teal, palette.bgChrome, palette.tealBright, palette.bgChrome, palette.mint]
  .map(rgb);

const raw = Buffer.alloc((N * 3 + 1) * N);
for (let y = 0; y < N; y++) {
  raw[y * (N * 3 + 1)] = 0;
  for (let x = 0; x < N; x++) {
    const ring = Math.max(Math.abs(x - N / 2), Math.abs(y - N / 2));       // 到中心的方形距離
    const band = Math.min(colours.length - 1, Math.floor((N / 2 - ring) / 18));
    const [r, g, b] = ring >= N / 2 ? rgb(palette.bgChrome) : colours[band];
    const o = y * (N * 3 + 1) + 1 + x * 3;
    raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
  }
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const sum = Buffer.alloc(4); sum.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, sum]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 2;   // 8-bit RGB
writeFileSync(new URL('../icon.png', import.meta.url), Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
]));
console.log('wrote icon.png');
