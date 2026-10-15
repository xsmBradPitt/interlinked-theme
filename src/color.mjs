// 唯一的透明度工具：產生器只准用「Palette 色 + alpha」，不准手寫 hex。
const HEX6 = /^#[0-9A-F]{6}$/;

export function withAlpha(hex, alpha) {
  if (!HEX6.test(hex)) throw new Error(`withAlpha: expected #RRGGBB (uppercase), got ${hex}`);
  if (!(alpha >= 0 && alpha <= 1)) throw new Error(`withAlpha: alpha out of range: ${alpha}`);
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
  return `${hex}${a}`;
}
