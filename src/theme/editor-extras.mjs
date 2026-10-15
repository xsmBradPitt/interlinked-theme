// src/theme/editor-extras.mjs
import { withAlpha as a } from '../color.mjs';
import { ALPHA, tints } from './shared.mjs';

export function editorExtrasColors(p) {
  const t = tints(p);
  return {
    // minimap
    'minimap.background': p.bgEditor,
    'minimap.selectionHighlight': a(p.mint, ALPHA.strong),
    'minimap.findMatchHighlight': a(p.amber, ALPHA.strong),
    'minimap.errorHighlight': p.coral,
    'minimap.warningHighlight': p.lemon,
    'minimapSlider.background': a(p.tealBright, ALPHA.faint),
    'minimapSlider.hoverBackground': a(p.tealBright, ALPHA.hover),
    'minimapSlider.activeBackground': a(p.tealBright, ALPHA.active),
    'minimapGutter.addedBackground': p.grass,
    'minimapGutter.modifiedBackground': p.iceBlue,
    'minimapGutter.deletedBackground': p.coral,

    // scrollbar（Reference scrollbar.thumb）
    // VS Code 的 sticky scroll 陰影預設取自 scrollbar.shadow；全透明會讓釘住的行融進編輯區。
    'scrollbar.shadow': p.bgChrome,
    'scrollbarSlider.background': a(p.tealBright, ALPHA.strong),
    'scrollbarSlider.hoverBackground': p.tealBright,
    'scrollbarSlider.activeBackground': p.tealBright,

    // breadcrumbs
    'breadcrumb.foreground': t.textDim,
    'breadcrumb.focusForeground': p.mintPale,
    'breadcrumb.activeSelectionForeground': p.tealBright,
    'breadcrumbPicker.background': p.bgRaised,

    // peek view
    'peekView.border': p.tealBright,
    'peekViewEditor.background': p.bgSide,
    'peekViewEditor.matchHighlightBackground': a(p.amber, ALPHA.find),
    'peekViewEditorGutter.background': p.bgSide,
    'peekViewResult.background': p.bgRaised,
    'peekViewResult.fileForeground': p.fg,
    'peekViewResult.lineForeground': t.textDim,
    'peekViewResult.matchHighlightBackground': a(p.amber, ALPHA.find),
    'peekViewResult.selectionBackground': t.activeBg,
    'peekViewResult.selectionForeground': p.fg,
    'peekViewTitle.background': p.bgRaised,
    'peekViewTitleLabel.foreground': p.fg,
    'peekViewTitleDescription.foreground': t.textDim,

    // widgets（hover / suggest / find / parameter hints）
    'editorWidget.background': p.bgRaised,
    'editorWidget.foreground': p.fg,
    'editorWidget.border': t.borderStrong,
    'editorWidget.resizeBorder': p.tealBright,
    'editorHoverWidget.background': p.bgRaised,
    'editorHoverWidget.foreground': p.fg,
    'editorHoverWidget.border': t.borderStrong,
    'editorHoverWidget.statusBarBackground': p.bgSide,
    'editorSuggestWidget.background': p.bgRaised,
    'editorSuggestWidget.foreground': p.fg,
    'editorSuggestWidget.border': t.borderStrong,
    'editorSuggestWidget.selectedBackground': t.activeBg,
    'editorSuggestWidget.selectedForeground': p.fg,
    'editorSuggestWidget.selectedIconForeground': p.tealBright,
    'editorSuggestWidget.highlightForeground': p.mint,
    'editorSuggestWidget.focusHighlightForeground': p.tealBright,
  };
}
