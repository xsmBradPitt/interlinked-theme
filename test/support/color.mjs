// test/support/color.mjs — 測試專用，刻意獨立於 src/，避免 src 的 bug 同時讓測試失準。
export function parseHex(hex) {
  const m = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})?$/.exec(hex);
  if (!m) throw new Error(`not a hex colour: ${hex}`);
  return {
    r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16),
    a: m[4] ? parseInt(m[4], 16) / 255 : 1,
  };
}

// 把（可能帶 alpha 的）前景合成到不透明背景上。
export function flatten(fg, bg) {
  const f = parseHex(fg), b = parseHex(bg);
  const mix = (x, y) => Math.round(x * f.a + y * (1 - f.a));
  return { r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b) };
}

const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);

// WCAG 對比度。fg 可帶 alpha（先合成）；bg 必須不透明。
export function contrast(fg, bg) {
  const l1 = lum(flatten(fg, bg));
  const l2 = lum(parseHex(bg));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function distance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}
