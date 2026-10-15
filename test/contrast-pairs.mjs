// test/contrast-pairs.mjs — 資料。要擴充只需新增一列。
const c = id => ['color', id];
const t = id => ['token', id];

export const PAIRS = [
  // 主要文字：≥ 4.5:1
  { name: 'editor text',        fg: c('editor.foreground'),        bg: c('editor.background'),            min: 4.5 },
  { name: 'side bar text',      fg: c('sideBar.foreground'),       bg: c('sideBar.background'),           min: 4.5 },
  { name: 'status bar text',    fg: c('statusBar.foreground'),     bg: c('statusBar.background'),         min: 4.5 },
  { name: 'active tab text',    fg: c('tab.activeForeground'),     bg: c('tab.activeBackground'),         min: 4.5 },
  { name: 'terminal text',      fg: c('terminal.foreground'),      bg: c('terminal.background'),          min: 4.5 },
  // 次要文字：≥ 3:1
  { name: 'comment',            fg: t('comment'),                  bg: c('editor.background'),            min: 3 },
  { name: 'line number',        fg: c('editorLineNumber.foreground'), bg: c('editor.background'),         min: 3 },
  { name: 'inactive tab text',  fg: c('tab.inactiveForeground'),   bg: c('tab.inactiveBackground'),       min: 3 },
];
