// 純資料。命名表達用途或色相，不寫 hex 在名稱裡。這是整個專案唯一出現 hex 的地方。
export const palette = Object.freeze({
  // —— 底色 ——
  bgEditor: '#001F1F',     // Reference editor.background
  bgChrome: '#001313',     // title / status / activity bar；底色決策（疊在黑底上）
  bgTabBar: '#002022',     // tab bar；底色決策（截圖取樣）
  bgSide: '#001A1A',       // side bar、peek view；Reference panel / element.background
  bgPanel: '#002424',      // panel 標題列（截圖取樣）
  bgRaised: '#002929',     // hover / selected / widget；Reference element.hover
  bgTerminal: '#062A40',   // Reference terminal.background
  bgAdded: '#222E1D',      // Reference created.background
  bgRemoved: '#301B1B',    // Reference deleted.background

  // —— 青綠 ——
  tealBright: '#00FFE5',   // Reference text.accent / border.focused（發光色）
  mintPale: '#7FFFF2',     // Reference text.muted
  mint: '#00FFB7',         // Reference constant / number / cursor
  aquamarine: '#4DFFBD',   // Reference type / property / link_uri / ansi cyan
  springGreen: '#1AFFA3',  // Reference function / ansi green
  seaGreen: '#05F2AF',     // Reference editor.active_line_number
  neonGreen: '#05F283',    // Reference terminal.foreground
  teal: '#00CC99',         // Reference keyword / punctuation / ansi magenta
  fgMuted: '#4A7A7A',      // 新增（D2）：Reference hint #406060 提亮到 ≥3:1，用於註解與次要標記

  // —— 暖色 ——
  fg: '#FFE5B4',           // Reference text / editor.foreground
  peach: '#FFDAB9',        // Reference string / ansi yellow
  amber: '#FFB74D',        // Reference emphasis.strong / players
  gold: '#FFD700',         // Reference string.regex / ansi red

  // —— 狀態 ——
  coral: '#FF6E6E',        // Reference terminal bright_red；用於 error（D3）
  lemon: '#E6E373',        // Reference warning
  aqua: '#73ECE5',         // Reference info
  grass: '#73FB95',        // Reference created（git added）
  iceBlue: '#A2EDFD',      // Reference modified
  sand: '#DEC184',         // Reference conflict

  // —— ANSI 專用（Reference terminal.ansi.*）——
  ink: '#21222C',          // ansi black
  violet: '#9580FF',       // ansi blue
  slate: '#919CBF',        // bright black
  lime: '#69FF94',         // bright green
  butter: '#FFFFA5',       // bright yellow
  lavender: '#D6ACFF',     // bright blue
  pink: '#FF92DF',         // bright magenta
  ice: '#A4FFFF',          // bright cyan
  white: '#FFFFFF',        // bright white（上游原值漏了 `#`，此處修正）
});
