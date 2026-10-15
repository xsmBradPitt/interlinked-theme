import { withAlpha } from '../color.mjs';

const byte = n => n / 255;

// Reference Theme 的 alpha 位元組，依用途命名。
export const ALPHA = Object.freeze({
  faint: byte(0x25),        // border.variant、ghost_element.selected
  hover: byte(0x35),        // ghost_element.hover
  active: byte(0x50),       // ghost_element.active
  soft: byte(0x33),         // editor.active_line、players.selection
  read: byte(0x40),         // editor.document_highlight.read
  strong: byte(0x77),       // border.focused、scrollbar.thumb
  solid: byte(0xBB),        // border.selected
  guide: byte(0x28),        // editor.wrap_guide
  invisible: byte(0x30),    // editor.invisible
  guideActive: byte(0x65),  // editor.active_wrap_guide
  find: 0.45,               // 新增：find match（D4）
  findDim: 0.22,            // 新增：find match highlight
  dim: 0.5,                 // 新增：次要文字；合成後在 #001F1F 上約 4.4:1（Reference 的 0x50 僅 2.5:1）
});

export function tints(p) {
  const a = withAlpha;
  return {
    none: a(p.bgEditor, 0),
    border: a(p.tealBright, ALPHA.faint),
    borderStrong: a(p.tealBright, ALPHA.strong),
    hoverBg: a(p.tealBright, ALPHA.hover),
    activeBg: a(p.tealBright, ALPHA.active),
    textDim: a(p.fg, ALPHA.dim),
    textDimmer: a(p.fg, 0.4),
  };
}
