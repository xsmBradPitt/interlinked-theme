// src/theme/terminal-scm.mjs
import { withAlpha as a } from '../color.mjs';
import { ALPHA, tints } from './shared.mjs';

export function terminalScmColors(p) {
  const t = tints(p);
  return {
    // terminal（D7：背景維持 Reference 的 #062A40）
    'terminal.background': p.bgTerminal,
    'terminal.foreground': p.neonGreen,
    'terminal.border': t.border,
    'terminal.selectionBackground': t.activeBg,
    'terminal.inactiveSelectionBackground': a(p.tealBright, ALPHA.faint),
    'terminalCursor.foreground': p.mint,
    'terminalCursor.background': p.bgTerminal,
    'terminal.findMatchBackground': a(p.amber, ALPHA.find),
    'terminal.findMatchHighlightBackground': a(p.amber, ALPHA.findDim),
    'terminal.tab.activeBorder': p.tealBright,

    // 16 ANSI（Reference terminal.ansi.*；dim_* 在 VS Code 沒有對應槽，略過）
    'terminal.ansiBlack': p.ink,
    'terminal.ansiRed': p.gold,
    'terminal.ansiGreen': p.springGreen,
    'terminal.ansiYellow': p.peach,
    'terminal.ansiBlue': p.violet,
    'terminal.ansiMagenta': p.teal,
    'terminal.ansiCyan': p.aquamarine,
    'terminal.ansiWhite': p.fg,
    'terminal.ansiBrightBlack': p.slate,
    'terminal.ansiBrightRed': p.coral,
    'terminal.ansiBrightGreen': p.lime,
    'terminal.ansiBrightYellow': p.butter,
    'terminal.ansiBrightBlue': p.lavender,
    'terminal.ansiBrightMagenta': p.pink,
    'terminal.ansiBrightCyan': p.ice,
    'terminal.ansiBrightWhite': p.white,

    // git decorations：added / modified / deleted / untracked / ignored / conflicting 兩兩可區分
    'gitDecoration.addedResourceForeground': p.grass,
    'gitDecoration.modifiedResourceForeground': p.iceBlue,
    'gitDecoration.deletedResourceForeground': p.coral,
    'gitDecoration.renamedResourceForeground': p.aquamarine,
    'gitDecoration.untrackedResourceForeground': p.lavender,
    'gitDecoration.ignoredResourceForeground': p.fgMuted,
    'gitDecoration.conflictingResourceForeground': p.sand,
    'gitDecoration.stageModifiedResourceForeground': p.iceBlue,
    'gitDecoration.stageDeletedResourceForeground': p.coral,
    'gitDecoration.submoduleResourceForeground': p.violet,

    // diff editor：行級用 Reference 的實色，文字級用 alpha，疊上語法色仍可讀
    'diffEditor.insertedLineBackground': p.bgAdded,
    'diffEditor.removedLineBackground': p.bgRemoved,
    'diffEditor.insertedTextBackground': a(p.grass, 0.25),
    'diffEditor.removedTextBackground': a(p.coral, 0.25),
    'diffEditor.insertedTextBorder': t.none,
    'diffEditor.removedTextBorder': t.none,
    'diffEditor.border': t.border,
    'diffEditor.diagonalFill': a(p.fg, ALPHA.guide),
    'diffEditorGutter.insertedLineBackground': p.bgAdded,
    'diffEditorGutter.removedLineBackground': p.bgRemoved,
    'diffEditorOverview.insertedForeground': p.grass,
    'diffEditorOverview.removedForeground': p.coral,

    // merge conflict
    'merge.currentHeaderBackground': a(p.aquamarine, ALPHA.active),
    'merge.currentContentBackground': a(p.aquamarine, ALPHA.faint),
    'merge.incomingHeaderBackground': a(p.violet, ALPHA.active),
    'merge.incomingContentBackground': a(p.violet, ALPHA.faint),
    'merge.commonHeaderBackground': a(p.fgMuted, ALPHA.active),
    'merge.commonContentBackground': a(p.fgMuted, ALPHA.faint),
    'merge.border': p.sand,
    'editorOverviewRuler.currentContentForeground': p.aquamarine,
    'editorOverviewRuler.incomingContentForeground': p.violet,
    'editorOverviewRuler.commonContentForeground': p.fgMuted,
  };
}
