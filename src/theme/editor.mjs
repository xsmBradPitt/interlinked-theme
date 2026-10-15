// src/theme/editor.mjs
import { withAlpha as a } from '../color.mjs';
import { ALPHA, tints } from './shared.mjs';

export function editorColors(p) {
  const t = tints(p);
  return {
    'editor.background': p.bgEditor,
    'editor.foreground': p.fg,
    'editorCursor.foreground': p.mint,
    'editor.lineHighlightBackground': a(p.seaGreen, ALPHA.soft),
    'editor.lineHighlightBorder': t.none,
    'editor.selectionBackground': a(p.mint, ALPHA.soft),
    'editor.inactiveSelectionBackground': a(p.mint, ALPHA.faint),
    'editor.selectionHighlightBackground': a(p.mint, ALPHA.faint),
    'editor.wordHighlightBackground': a(p.tealBright, ALPHA.read),
    'editor.wordHighlightStrongBackground': p.bgRaised,
    'editor.findMatchBackground': a(p.amber, ALPHA.find),
    'editor.findMatchHighlightBackground': a(p.amber, ALPHA.findDim),
    'editor.findRangeHighlightBackground': a(p.tealBright, ALPHA.faint),
    'editor.hoverHighlightBackground': a(p.tealBright, ALPHA.faint),
    'editor.rangeHighlightBackground': a(p.tealBright, ALPHA.faint),
    'editor.foldBackground': a(p.tealBright, ALPHA.faint),
    'editorLink.activeForeground': p.aquamarine,
    'editorLineNumber.foreground': t.textDim,
    'editorLineNumber.activeForeground': p.seaGreen,
    'editorIndentGuide.background1': a(p.fg, ALPHA.guide),
    'editorIndentGuide.activeBackground1': a(p.mint, ALPHA.guideActive),
    'editorWhitespace.foreground': a(p.fg, ALPHA.invisible),
    'editorRuler.foreground': a(p.fg, ALPHA.guide),

    'editorBracketMatch.background': a(p.mint, ALPHA.soft),
    'editorBracketMatch.border': a(p.mint, ALPHA.strong),
    'editorBracketHighlight.foreground1': p.tealBright,
    'editorBracketHighlight.foreground2': p.amber,
    'editorBracketHighlight.foreground3': p.pink,
    'editorBracketHighlight.foreground4': p.springGreen,
    'editorBracketHighlight.foreground5': p.lavender,
    'editorBracketHighlight.foreground6': p.peach,
    'editorBracketHighlight.unexpectedBracket.foreground': p.coral,

    'editorGutter.background': p.bgEditor,
    'editorGutter.modifiedBackground': p.iceBlue,
    'editorGutter.addedBackground': p.grass,
    'editorGutter.deletedBackground': p.coral,
    'editorGutter.foldingControlForeground': t.textDim,

    // 診斷：四種嚴重度必須可區分（D3；Reference 的 error 是 #05F283，不可用）
    'editorError.foreground': p.coral,
    'editorWarning.foreground': p.lemon,
    'editorInfo.foreground': p.aqua,
    'editorHint.foreground': p.fgMuted,

    // inlay hint：與原始碼有別（背景底色＋mint 字）
    'editorInlayHint.foreground': p.mint,
    'editorInlayHint.background': a(p.mint, ALPHA.faint),
    'editorInlayHint.typeForeground': p.mint,
    'editorInlayHint.parameterForeground': p.mintPale,

    'editorStickyScroll.background': p.bgSide,
    'editorStickyScrollHover.background': p.bgRaised,
    'editorCodeLens.foreground': p.fgMuted,
    'editorOverviewRuler.border': t.none,
    'editorOverviewRuler.errorForeground': p.coral,
    'editorOverviewRuler.warningForeground': p.lemon,
    'editorOverviewRuler.infoForeground': p.aqua,
  };
}
