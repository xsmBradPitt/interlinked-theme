import { chromeColors } from './theme/chrome.mjs';
import { editorColors } from './theme/editor.mjs';
import { editorExtrasColors } from './theme/editor-extras.mjs';
import { controlsColors } from './theme/controls.mjs';
import { terminalScmColors } from './theme/terminal-scm.mjs';
import { textmateRules } from './theme/syntax-textmate.mjs';
import { languageRules } from './theme/syntax-languages.mjs';
import { semanticColors } from './theme/syntax-semantic.mjs';

// 對外唯一 seam：其他模組與測試都只透過這個函式取得主題。
export function buildTheme(p) {
  return {
    $schema: 'vscode://schemas/color-theme',
    name: 'Interlinked',
    type: 'dark',
    semanticHighlighting: true,
    colors: {
      ...chromeColors(p),
      ...editorColors(p),
      ...editorExtrasColors(p),
      ...controlsColors(p),
      ...terminalScmColors(p),
    },
    tokenColors: [...textmateRules(p), ...languageRules(p)],
    semanticTokenColors: semanticColors(p),
  };
}
