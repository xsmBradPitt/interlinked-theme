# Interlinked v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 產出可打包、可發布的 Interlinked 擴充套件：一份由 Palette 產生、通過結構／Palette 紀律／對比度測試的深色主題，加上 Sample、素材與 CI/CD。

**Architecture:** `palette.mjs`（純資料）→ `buildTheme(palette)`（唯一 seam，內部依 UI Area 與語法三層分模組組裝）→ `scripts/build.mjs` 寫出 `themes/interlinked-color-theme.json`。測試只透過 `buildTheme(palette)` 的輸出檢查；UI Area 的必要 key 清單是獨立資料檔，測試與產生器各讀各的，互相對照。

**Tech Stack:** Node.js ES modules（`.mjs`）、Node 內建 test runner、零執行期依賴；打包用 `@vscode/vsce`、發布用 `ovsx`（皆以 `npx` 呼叫，不進 `package.json`）。

**Spec:** `docs/spec/0001-interlinked-v1.md`（執行者必須一併閱讀；名詞見 `CONTEXT.md`；決策見 `docs/adr/`；發布細節見 `docs/research/0001-marketplace-and-open-vsx-publishing.md`）。

> 本計畫依 repo 現有的 `docs/<類別>/NNNN-名稱.md` 慣例放在 `docs/plan/`，而不是 skill 預設的 `docs/superpowers/plans/`。要搬的話只需移動檔案。
> 每個 commit 訊息沿用 repo 的 `type: 中文描述` 風格；結尾的 Co-Authored-By 依 session 設定附加。
> 執行時請先用 `superpowers:using-git-worktrees` 開一條 `feat/v1-implementation` 分支；`main` 不直接寫入。

---

## 實作順序一覽

| # | Task | 交付物 | 驗證方式 |
|---|---|---|---|
| 1 | Manifest 與專案骨架 | `package.json`、`.gitignore`、`.vscodeignore`、manifest 測試 | `npm test` |
| 2 | Palette 與 `withAlpha` | `src/palette.mjs`、`src/color.mjs` | 由 Task 3 的紀律測試檢查 |
| 3 | 測試基礎建設（先紅） | `ui-areas.mjs` 清單、結構／紀律／對比度／可區分性測試 | 全部失敗，且失敗原因正確 |
| 4 | `buildTheme` 骨架與 build 腳本 | `build-theme.mjs`、`scripts/build.mjs`、主題 JSON | 結構測試中「非 key 缺漏」項轉綠 |
| 5 | UI Area：chrome | activityBar、sideBar、statusBar、titleBar、tabs、panel、badge、focus、global | 對應 UI Area 子測試與對比度轉綠 |
| 6 | UI Area：editor 本體 | editor、gutter、括號、診斷、inlay hint、sticky scroll | 同上 + 可區分性 |
| 7 | UI Area：editor 周邊 | minimap、scrollbar、breadcrumbs、peek view、widgets | 同上 |
| 8 | UI Area：controls | lists/trees、input/dropdown/checkbox/button、quick input、notifications | 同上 |
| 9 | UI Area：terminal 與 SCM | terminal（16 ANSI）、git decorations、diff、merge conflict | 同上 + 可區分性 |
| 10 | 語法 layer 2：通用 TextMate | 39 個 capture 對應的通用 scope | 覆蓋測試、註解對比度 |
| 11 | 語法 layer 1 與 3：semantic token 與 11 種語言 | `semanticTokenColors`、語言專屬 scope | 覆蓋測試 |
| 12 | Sample 與目視驗證（手動） | `samples/` 11 個檔、VS Code 與 Cursor 檢查紀錄 | 檢查清單 |
| 13 | 發布素材 | icon、README、CHANGELOG、`.vscodeignore`、`check-vsix` | 測試 + 本機 `vsce package` |
| 14 | CI 與 Release workflow | `ci.yml`、`release.yml` | push 後綠燈；dry-run |

**為什麼是這個順序：** 先固定「什麼叫完成」（Task 3 的紅燈），再用最小骨架讓測試能跑（Task 4），之後每個 Task 只負責讓一批已存在的測試轉綠。工作區先於語法，是因為 chrome 的底色決策已定案、風險低；語法是主題辨識度的來源，但需要 Sample 目視，排在 Task 12 前面最後收斂。

---

## Global Constraints

（逐字取自 spec 與 `CLAUDE.md`；每個 Task 都隱含這一節。）

- 擴充套件 ID：`xsmbradpitt.interlinked-theme`；publisher `xsmbradpitt`；displayName「Interlinked — Blade Runner 2049 inspired」；category `Themes`；keywords 包含 blade runner、cyberpunk、teal、dark、terminal。
- `contributes.themes` 只有一項：`label` 為「Interlinked」，`uiTheme` 為 `vs-dark`。
- 純 Node ES modules（`.mjs`），**不需要執行期依賴**；測試用 Node 內建的 test runner，不引入測試框架。
- **主題裡的每個顏色都必須來自 Palette，不准直接寫 hex。** 需要透明度時以「Palette 色 + alpha」組合。
- 產生器對外唯一 seam：`buildTheme(palette) → themeObject`；自動化測試只透過它的輸出檢查。
- 輸出包含 `colors`、`tokenColors`、`semanticHighlighting: true`、`semanticTokenColors`。
- 底色類 key 必須不透明。UI Area 清單約 250 到 300 個 key；清單外的 key 交給 VS Code 預設值。
- 對比度：主要文字（editor、sideBar、statusBar、tabs、terminal 前景）至少 4.5:1；次要文字（註解、行號、inactive tab）至少 3:1。
- 16 個 ANSI 色齊全。
- 底色決策（定案 2026-10-14）：chrome（titleBar、statusBar、activityBar）`#001313`；tab bar `#002022`；editor `#001F1F`；sideBar `#001A1A`；terminal `#062A40`。
- 字體樣式（斜體、粗體）沿用 Reference Theme；斜體只用在 Reference Theme 用到的地方。
- 驗證語言清單：TypeScript/JavaScript、C#、Kotlin、Java、HTML、CSS、SQL、Bash、JSON、YAML、Markdown。
- `reference/` 不修改、不打包進 `.vsix`；`.vsix` 另排除 `samples/`、`docs/`、測試與不需要的原始碼。
- README 圖片一律 https 絕對網址，非徽章類圖片不用 SVG；電影畫面外連到上游、附版權說明、只放在底部靈感段落（ADR 0002）。
- 版本號手動維護在 manifest，CHANGELOG 手寫；不用 Changesets、release-please。
- CI 的 Node.js >= 22（`@vscode/vsce`、`ovsx` 的需求）。
- VS Code Marketplace **不由 CI 發布**；workflow 不放 `VSCE_PAT`，也不加 Marketplace 發布步驟。
- 命名一律使用 `CONTEXT.md` 的名詞：Palette、UI Area、Reference Theme、Sample。

## Review Focus

spec 沒有明說、但最可能咬到使用者的五件事；每一條都在擁有該程式碼的 Task 裡有對應測試。

1. **診斷嚴重度顏色必須可區分。** Reference Theme 的 `error` 是 `#05F283`，與註解、terminal 前景同色；直接照搬會讓錯誤波浪線看起來像「一切正常」。使用者預期 error／warning／info／hint 四種顏色兩兩可分辨。→ Task 3 `distinct.test.mjs`，Task 6 轉綠。
2. **帶 alpha 的前景要合成後再算對比度。** Reference Theme 的行號 `#FFE5B450` 合成到 `#001F1F` 上只有約 2.5:1，用原值（不合成）算會誤判通過。使用者預期行號和註解真的讀得到。→ Task 3 `contrast.test.mjs` 的 `flatten`，Task 5、6 轉綠。
3. **沒有 semantic token 的語言不能掉色。** HTML、CSS、SQL、Bash、JSON、YAML、Markdown 只靠 TextMate scope；漏一個 scope 就整類元素變成預設前景。使用者預期這些語言和 TS 一樣完整。→ Task 10、11 `syntax-coverage.test.mjs`。
4. **`.vsix` 不能夾帶 `reference/`、`samples/`、`docs/`。** 預期是只含主題與必要文件。→ Task 13 `scripts/check-vsix.mjs`，CI 執行。
5. **README 不能有相對路徑圖片或非徽章 SVG。** 市集頁會顯示破圖或被擋下。→ Task 13 `package.test.mjs` 的 README 檢查。

## 計畫層級的決策（spec 沒涵蓋，執行前請確認）

這些是為了讓計畫可執行而做的選擇，全部可逆。

| # | 決策 | 理由 | 反悔的代價 |
|---|---|---|---|
| D1 | 產生出的 `themes/interlinked-color-theme.json` **進 git**，CI 檢查它與 `buildTheme` 同步 | F5 開 Extension Development Host 不需先 build；package 測試能直接比對 | 改成 `.gitignore` + `vscode:prepublish` 產生，刪兩處檢查 |
| D2 | **註解色**不用 Reference 的 `#05F283`，改用新增的 `fgMuted`（`#4A7A7A`，3.58:1） | spec 故事 11 要求「subdued 但 ≥3:1」；`#05F283` 並不 subdued，Reference 的 `hint #406060` 只有 2.5:1 | 改 Palette 一個值 |
| D3 | **error 色**用 Reference 的 `bright_red`（`coral #FF6E6E`），不用其 `error`（`#05F283`） | Review Focus 1 | 改 Palette 對應 |
| D4 | **find match**用 `amber`，不用 Reference 的 `#1AFFA350`（綠，與 selection 太近） | spec 故事 13 要求與 selection 可區分 | 同上 |
| D5 | **HTML 屬性名**用 `aquamarine`，不與 tag 同為 `teal` | spec 故事 44 要求 tag／屬性／屬性值可區分 | 同上 |
| D6 | font weight ≥600 視為 bold（function、property、title、strong），500 的 string 視為一般 | VS Code 只有 bold／italic 兩種 | 改一條規則 |
| D7 | **terminal 背景維持 `#062A40`**，不隨 editor | 底色決策的 prototype 就是這樣呈現，你選了 A；但 spec 故事 34 字面寫「match the editor」，兩者有張力 | 改 `terminal.background` 一個值 |
| D8 | README 以**英文**撰寫（市集讀者），維護文件維持中文 | 市集頁面語言 | 改寫 README |
| D9 | `engines.vscode` 取 `^1.75.0`；Task 13 要用 Cursor 的 About 確認其 VS Code 基底版本不低於此值 | spec 只說「夠低」；semantic token 主題支援自 1.43，新 key 在舊版會被忽略 | 改一個字串 |
| D10 | Release workflow 先建 GitHub Release，再發布 Open VSX；Open VSX 步驟以 repo variable `OPEN_VSX_PUBLISH == 'true'` 為條件 | 首次發布必須先手動上傳 Marketplace、再等 namespace `granted`；先有 Release，維護者才拿得到同一個 `.vsix` | 調整 workflow |
| D11 | Open VSX 認證**第一版用 token（`OVSX_PAT`）** | trusted publishing 需要 namespace owner 與至少一個 active 版本，第一版做不到；研究文件 B8 建議之後再遷移 | 之後遷移為獨立 commit |

---

## File Structure

```
package.json                         # manifest + scripts
.gitignore  .vscodeignore
src/
  palette.mjs                        # 純資料：有名字的顏色（唯一的 hex 出處）
  color.mjs                          # withAlpha(hex, alpha)：唯一的透明度工具
  ui-areas.mjs                       # UI Area 清單（資料）與 OPAQUE_KEYS；測試讀同一份
  build-theme.mjs                    # buildTheme(palette) → themeObject（唯一 seam）
  theme/
    shared.mjs                       # ALPHA 常數與 tints(p)：各 UI Area 共用的透明度色
    chrome.mjs                       # activityBar/sideBar/statusBar/titleBar/tabs/panel/badge/focus/global
    editor.mjs                       # editor 本體
    editor-extras.mjs                # minimap/scrollbar/breadcrumbs/peek/widgets
    controls.mjs                     # lists/input/dropdown/checkbox/button/quick input/notifications
    terminal-scm.mjs                 # terminal/ANSI/git/diff/merge
    syntax-textmate.mjs              # layer 2：通用 TextMate scope
    syntax-languages.mjs             # layer 3：驗證語言專屬 scope
    syntax-semantic.mjs              # layer 1：semanticTokenColors
scripts/
  build.mjs                          # 寫出 themes/interlinked-color-theme.json
  make-icon.mjs                      # 產生 icon.png
  check-vsix.mjs                     # CI 打包冒煙測試
themes/interlinked-color-theme.json  # 產生物（進 git，見 D1）
test/
  support/color.mjs                  # 測試專用：parseHex / flatten / contrast（獨立於 src）
  support/collect.mjs                # collectColors / resolveRef
  contrast-pairs.mjs                 # 前景／背景配對清單（資料）
  required-scopes.mjs                # 各語言必須被覆蓋的 scope（資料）
  package.test.mjs  structure.test.mjs  palette-discipline.test.mjs
  contrast.test.mjs  distinct.test.mjs  syntax-coverage.test.mjs
samples/                             # 11 種語言的 Sample
images/                              # README 截圖（不進 .vsix）
icon.png  README.md  CHANGELOG.md
.github/workflows/ci.yml  release.yml
```

---

### Task 1: Manifest 與專案骨架

**Files:**
- Create: `package.json`, `.gitignore`, `.vscodeignore`
- Test: `test/package.test.mjs`

**Interfaces:**
- Produces: `package.json` 的 `scripts.build`、`scripts.test`；`contributes.themes[0].path = "./themes/interlinked-color-theme.json"`（Task 4、13、14 依賴）。

- [ ] **Step 1: 寫失敗的測試**

```js
// test/package.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('manifest identifies the extension', () => {
  assert.equal(pkg.name, 'interlinked-theme');
  assert.equal(pkg.publisher, 'xsmbradpitt');
  assert.equal(pkg.displayName, 'Interlinked — Blade Runner 2049 inspired');
  assert.equal(pkg.license, 'MIT');
  assert.deepEqual(pkg.categories, ['Themes']);
  for (const k of ['blade runner', 'cyberpunk', 'teal', 'dark', 'terminal']) {
    assert.ok(pkg.keywords.includes(k), `keyword missing: ${k}`);
  }
});

test('manifest contributes exactly one dark theme', () => {
  const themes = pkg.contributes.themes;
  assert.equal(themes.length, 1);
  assert.equal(themes[0].label, 'Interlinked');
  assert.equal(themes[0].uiTheme, 'vs-dark');
  assert.equal(themes[0].path, './themes/interlinked-color-theme.json');
});

test('manifest has a bounded engine floor and a repository', () => {
  assert.match(pkg.engines.vscode, /^\^1\.\d+\.\d+$/);
  assert.equal(pkg.repository.url, 'https://github.com/xsmBradPitt/interlinked-theme.git');
});
```

- [ ] **Step 2: 執行並確認失敗**

Run: `node --test test/package.test.mjs`
Expected: FAIL（`ENOENT: no such file or directory ... package.json`）

- [ ] **Step 3: 建立 `package.json`、`.gitignore`、`.vscodeignore`**

```json
{
  "name": "interlinked-theme",
  "displayName": "Interlinked — Blade Runner 2049 inspired",
  "description": "A dark teal terminal-glow theme inspired by Blade Runner 2049, adapted from the Zed theme by Takk8IS.",
  "version": "1.0.0",
  "publisher": "xsmbradpitt",
  "license": "MIT",
  "engines": { "vscode": "^1.75.0" },
  "categories": ["Themes"],
  "keywords": ["blade runner", "cyberpunk", "teal", "dark", "terminal", "theme"],
  "icon": "icon.png",
  "galleryBanner": { "color": "#001313", "theme": "dark" },
  "repository": { "type": "git", "url": "https://github.com/xsmBradPitt/interlinked-theme.git" },
  "bugs": { "url": "https://github.com/xsmBradPitt/interlinked-theme/issues" },
  "homepage": "https://github.com/xsmBradPitt/interlinked-theme#readme",
  "contributes": {
    "themes": [
      { "label": "Interlinked", "uiTheme": "vs-dark", "path": "./themes/interlinked-color-theme.json" }
    ]
  },
  "scripts": {
    "build": "node scripts/build.mjs",
    "test": "node --test test/*.test.mjs",
    "vscode:prepublish": "node scripts/build.mjs"
  }
}
```

`.gitignore`：

```
node_modules/
*.vsix
```

`.vscodeignore`：

```
.github/**
.gitignore
CLAUDE.md
CONTEXT.md
docs/**
images/**
prototype/**
reference/**
samples/**
scripts/**
src/**
test/**
*.vsix
```

- [ ] **Step 4: 執行並確認通過**

Run: `node --test test/package.test.mjs`
Expected: PASS（3 tests）

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore .vscodeignore test/package.test.mjs
git commit -m "feat: 新增擴充套件 manifest 與骨架"
```

---

### Task 2: Palette 與 `withAlpha`

**Files:**
- Create: `src/palette.mjs`, `src/color.mjs`

**Interfaces:**
- Produces: `palette`（`Object.freeze` 的 `{ [name]: '#RRGGBB' }`，大寫 hex）；`withAlpha(hex: '#RRGGBB', alpha: number /*0–1*/): '#RRGGBBAA'`。後續所有 Task 都依賴這兩個名稱。

Palette 以 Reference Theme 為起點萃取；標「新增」者不在 Reference Theme 裡，是為了 VS Code 或對比度需要。**Palette 值本身的紀律由 Task 3 的 `palette-discipline.test.mjs` 檢查**（此 Task 沒有獨立測試，因為 Palette 是資料、`withAlpha` 的行為由 Task 3 的測試間接覆蓋）。

- [ ] **Step 1: 建立 `src/color.mjs`**

```js
// 唯一的透明度工具：產生器只准用「Palette 色 + alpha」，不准手寫 hex。
const HEX6 = /^#[0-9A-F]{6}$/;

export function withAlpha(hex, alpha) {
  if (!HEX6.test(hex)) throw new Error(`withAlpha: expected #RRGGBB (uppercase), got ${hex}`);
  if (!(alpha >= 0 && alpha <= 1)) throw new Error(`withAlpha: alpha out of range: ${alpha}`);
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
  return `${hex}${a}`;
}
```

- [ ] **Step 2: 建立 `src/palette.mjs`**

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add src/color.mjs src/palette.mjs
git commit -m "feat: 新增 Palette 與 withAlpha"
```

---

### Task 3: 測試基礎建設（先紅）

**Files:**
- Create: `src/ui-areas.mjs`
- Create: `test/support/color.mjs`, `test/support/collect.mjs`, `test/contrast-pairs.mjs`
- Create: `test/structure.test.mjs`, `test/palette-discipline.test.mjs`, `test/contrast.test.mjs`, `test/distinct.test.mjs`

**Interfaces:**
- Consumes: `palette`（Task 2）；`buildTheme`（Task 4 才存在，此 Task 的測試因此全紅）。
- Produces:
  - `UI_AREAS: Record<string, string[]>`、`OPAQUE_KEYS: string[]`（`src/ui-areas.mjs`）
  - `parseHex(hex) → {r,g,b,a}`、`flatten(fg, bg) → {r,g,b}`、`contrast(fg, bg) → number`（`test/support/color.mjs`）
  - `collectColors(theme) → {path, value}[]`、`resolveRef(theme, ['color'|'token', id]) → string|undefined`（`test/support/collect.mjs`）
  - `PAIRS`（`test/contrast-pairs.mjs`）

- [ ] **Step 1: 建立 UI Area 清單 `src/ui-areas.mjs`**

```js
// UI Area 清單（spec「UI Area 清單」）：資料，不含任何顏色。測試與產生器各自對照這份清單。
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i + 1));

export const UI_AREAS = {
  editor: [
    'editor.background', 'editor.foreground', 'editorCursor.foreground',
    'editor.lineHighlightBackground', 'editor.lineHighlightBorder',
    'editor.selectionBackground', 'editor.inactiveSelectionBackground', 'editor.selectionHighlightBackground',
    'editor.wordHighlightBackground', 'editor.wordHighlightStrongBackground',
    'editor.findMatchBackground', 'editor.findMatchHighlightBackground', 'editor.findRangeHighlightBackground',
    'editor.hoverHighlightBackground', 'editor.rangeHighlightBackground', 'editor.foldBackground',
    'editorLink.activeForeground', 'editorLineNumber.foreground', 'editorLineNumber.activeForeground',
    'editorIndentGuide.background1', 'editorIndentGuide.activeBackground1',
    'editorWhitespace.foreground', 'editorRuler.foreground',
    'editorBracketMatch.background', 'editorBracketMatch.border',
    ...range(6, i => `editorBracketHighlight.foreground${i}`),
    'editorBracketHighlight.unexpectedBracket.foreground',
    'editorGutter.background', 'editorGutter.modifiedBackground', 'editorGutter.addedBackground',
    'editorGutter.deletedBackground', 'editorGutter.foldingControlForeground',
    'editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground', 'editorHint.foreground',
    'editorInlayHint.foreground', 'editorInlayHint.background',
    'editorInlayHint.typeForeground', 'editorInlayHint.parameterForeground',
    'editorStickyScroll.background', 'editorStickyScrollHover.background',
    'editorCodeLens.foreground',
    'editorOverviewRuler.border', 'editorOverviewRuler.errorForeground',
    'editorOverviewRuler.warningForeground', 'editorOverviewRuler.infoForeground',
  ],
  sideBar: [
    'sideBar.background', 'sideBar.foreground', 'sideBar.border',
    'sideBarTitle.foreground', 'sideBarSectionHeader.background',
    'sideBarSectionHeader.foreground', 'sideBarSectionHeader.border',
  ],
  activityBar: [
    'activityBar.background', 'activityBar.foreground', 'activityBar.inactiveForeground',
    'activityBar.border', 'activityBar.activeBorder',
    'activityBarBadge.background', 'activityBarBadge.foreground',
  ],
  statusBar: [
    'statusBar.background', 'statusBar.foreground', 'statusBar.border',
    'statusBar.debuggingBackground', 'statusBar.debuggingForeground', 'statusBar.debuggingBorder',
    'statusBar.noFolderBackground', 'statusBar.noFolderForeground', 'statusBar.noFolderBorder',
    'statusBarItem.hoverBackground', 'statusBarItem.activeBackground',
    'statusBarItem.prominentBackground', 'statusBarItem.prominentForeground',
    'statusBarItem.remoteBackground', 'statusBarItem.remoteForeground',
    'statusBarItem.errorBackground', 'statusBarItem.errorForeground',
    'statusBarItem.warningBackground', 'statusBarItem.warningForeground',
  ],
  titleBar: [
    'titleBar.activeBackground', 'titleBar.activeForeground',
    'titleBar.inactiveBackground', 'titleBar.inactiveForeground', 'titleBar.border',
    'menubar.selectionBackground', 'menubar.selectionForeground',
    'menu.background', 'menu.foreground', 'menu.selectionBackground', 'menu.selectionForeground',
    'menu.separatorBackground', 'menu.border',
  ],
  tabs: [
    'editorGroupHeader.tabsBackground', 'editorGroupHeader.noTabsBackground', 'editorGroupHeader.tabsBorder',
    'editorGroup.border', 'editorGroup.dropBackground',
    'tab.activeBackground', 'tab.activeForeground', 'tab.activeBorder', 'tab.activeBorderTop',
    'tab.activeModifiedBorder', 'tab.inactiveBackground', 'tab.inactiveForeground', 'tab.inactiveModifiedBorder',
    'tab.unfocusedActiveBackground', 'tab.unfocusedActiveForeground',
    'tab.unfocusedInactiveBackground', 'tab.unfocusedInactiveForeground',
    'tab.hoverBackground', 'tab.hoverForeground', 'tab.hoverBorder', 'tab.border', 'tab.lastPinnedBorder',
  ],
  panel: [
    'panel.background', 'panel.border', 'panel.dropBorder',
    'panelTitle.activeBorder', 'panelTitle.activeForeground', 'panelTitle.inactiveForeground',
    'panelSection.border', 'panelSectionHeader.background', 'panelInput.border',
  ],
  terminal: [
    'terminal.background', 'terminal.foreground', 'terminal.border',
    'terminal.selectionBackground', 'terminal.inactiveSelectionBackground',
    'terminalCursor.foreground', 'terminalCursor.background',
    'terminal.findMatchBackground', 'terminal.findMatchHighlightBackground', 'terminal.tab.activeBorder',
    ...['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White']
      .flatMap(n => [`terminal.ansi${n}`, `terminal.ansiBright${n}`]),
  ],
  listsTrees: [
    'list.activeSelectionBackground', 'list.activeSelectionForeground',
    'list.inactiveSelectionBackground', 'list.inactiveSelectionForeground',
    'list.hoverBackground', 'list.hoverForeground', 'list.focusBackground', 'list.focusForeground',
    'list.focusOutline', 'list.highlightForeground', 'list.focusHighlightForeground', 'list.dropBackground',
    'list.errorForeground', 'list.warningForeground', 'list.invalidItemForeground',
    'list.deemphasizedForeground', 'list.filterMatchBackground',
    'listFilterWidget.background', 'listFilterWidget.outline', 'listFilterWidget.noMatchesOutline',
    'tree.indentGuidesStroke', 'tree.inactiveIndentGuidesStroke',
  ],
  controls: [
    'input.background', 'input.foreground', 'input.border', 'input.placeholderForeground',
    'inputOption.activeBackground', 'inputOption.activeBorder', 'inputOption.activeForeground',
    'inputValidation.errorBackground', 'inputValidation.errorBorder', 'inputValidation.errorForeground',
    'inputValidation.warningBackground', 'inputValidation.warningBorder', 'inputValidation.warningForeground',
    'inputValidation.infoBackground', 'inputValidation.infoBorder', 'inputValidation.infoForeground',
    'dropdown.background', 'dropdown.foreground', 'dropdown.border', 'dropdown.listBackground',
    'checkbox.background', 'checkbox.foreground', 'checkbox.border',
    'button.background', 'button.foreground', 'button.hoverBackground', 'button.border',
    'button.secondaryBackground', 'button.secondaryForeground', 'button.secondaryHoverBackground',
  ],
  quickInput: [
    'quickInput.background', 'quickInput.foreground', 'quickInputTitle.background',
    'quickInputList.focusBackground', 'quickInputList.focusForeground', 'quickInputList.focusIconForeground',
    'pickerGroup.foreground', 'pickerGroup.border',
  ],
  notifications: [
    'notifications.background', 'notifications.foreground', 'notifications.border',
    'notificationCenter.border', 'notificationCenterHeader.background', 'notificationCenterHeader.foreground',
    'notificationToast.border', 'notificationLink.foreground',
    'notificationsErrorIcon.foreground', 'notificationsWarningIcon.foreground', 'notificationsInfoIcon.foreground',
  ],
  peekView: [
    'peekView.border', 'peekViewEditor.background', 'peekViewEditor.matchHighlightBackground',
    'peekViewEditorGutter.background', 'peekViewResult.background', 'peekViewResult.fileForeground',
    'peekViewResult.lineForeground', 'peekViewResult.matchHighlightBackground',
    'peekViewResult.selectionBackground', 'peekViewResult.selectionForeground',
    'peekViewTitle.background', 'peekViewTitleLabel.foreground', 'peekViewTitleDescription.foreground',
  ],
  diffEditor: [
    'diffEditor.insertedTextBackground', 'diffEditor.removedTextBackground',
    'diffEditor.insertedLineBackground', 'diffEditor.removedLineBackground',
    'diffEditor.insertedTextBorder', 'diffEditor.removedTextBorder', 'diffEditor.border', 'diffEditor.diagonalFill',
    'diffEditorGutter.insertedLineBackground', 'diffEditorGutter.removedLineBackground',
    'diffEditorOverview.insertedForeground', 'diffEditorOverview.removedForeground',
  ],
  mergeConflict: [
    'merge.currentHeaderBackground', 'merge.currentContentBackground',
    'merge.incomingHeaderBackground', 'merge.incomingContentBackground',
    'merge.commonHeaderBackground', 'merge.commonContentBackground', 'merge.border',
    'editorOverviewRuler.currentContentForeground', 'editorOverviewRuler.incomingContentForeground',
    'editorOverviewRuler.commonContentForeground',
  ],
  gitDecorations: [
    'gitDecoration.addedResourceForeground', 'gitDecoration.modifiedResourceForeground',
    'gitDecoration.deletedResourceForeground', 'gitDecoration.renamedResourceForeground',
    'gitDecoration.untrackedResourceForeground', 'gitDecoration.ignoredResourceForeground',
    'gitDecoration.conflictingResourceForeground', 'gitDecoration.stageModifiedResourceForeground',
    'gitDecoration.stageDeletedResourceForeground', 'gitDecoration.submoduleResourceForeground',
  ],
  minimap: [
    'minimap.background', 'minimap.selectionHighlight', 'minimap.findMatchHighlight',
    'minimap.errorHighlight', 'minimap.warningHighlight',
    'minimapSlider.background', 'minimapSlider.hoverBackground', 'minimapSlider.activeBackground',
    'minimapGutter.addedBackground', 'minimapGutter.modifiedBackground', 'minimapGutter.deletedBackground',
  ],
  scrollbar: [
    'scrollbar.shadow', 'scrollbarSlider.background', 'scrollbarSlider.hoverBackground',
    'scrollbarSlider.activeBackground',
  ],
  breadcrumbs: [
    'breadcrumb.foreground', 'breadcrumb.focusForeground', 'breadcrumb.activeSelectionForeground',
    'breadcrumbPicker.background',
  ],
  widgets: [
    'editorWidget.background', 'editorWidget.foreground', 'editorWidget.border', 'editorWidget.resizeBorder',
    'editorHoverWidget.background', 'editorHoverWidget.foreground', 'editorHoverWidget.border',
    'editorHoverWidget.statusBarBackground',
    'editorSuggestWidget.background', 'editorSuggestWidget.foreground', 'editorSuggestWidget.border',
    'editorSuggestWidget.selectedBackground', 'editorSuggestWidget.selectedForeground',
    'editorSuggestWidget.selectedIconForeground', 'editorSuggestWidget.highlightForeground',
    'editorSuggestWidget.focusHighlightForeground',
  ],
  badgesProgress: ['badge.background', 'badge.foreground', 'progressBar.background'],
  focusBorder: ['focusBorder', 'sash.hoverBorder'],
  global: [
    'foreground', 'descriptionForeground', 'errorForeground', 'icon.foreground', 'selection.background',
    'textLink.foreground', 'textLink.activeForeground', 'textCodeBlock.background', 'widget.shadow',
    'toolbar.hoverBackground', 'toolbar.activeBackground',
  ],
};

// 「底色類」key：必須是不透明的 #RRGGBB（或 alpha 為 FF）。
export const OPAQUE_KEYS = [
  'editor.background', 'editorGutter.background', 'editorStickyScroll.background',
  'sideBar.background', 'sideBarSectionHeader.background', 'activityBar.background',
  'statusBar.background', 'statusBar.debuggingBackground', 'statusBar.noFolderBackground',
  'titleBar.activeBackground', 'titleBar.inactiveBackground',
  'editorGroupHeader.tabsBackground', 'editorGroupHeader.noTabsBackground',
  'tab.activeBackground', 'tab.inactiveBackground',
  'tab.unfocusedActiveBackground', 'tab.unfocusedInactiveBackground',
  'panel.background', 'terminal.background',
  'input.background', 'dropdown.background', 'dropdown.listBackground',
  'quickInput.background', 'notifications.background', 'notificationCenterHeader.background',
  'menu.background', 'minimap.background', 'breadcrumbPicker.background',
  'editorWidget.background', 'editorHoverWidget.background', 'editorSuggestWidget.background',
  'peekViewEditor.background', 'peekViewResult.background', 'peekViewTitle.background',
];
```

- [ ] **Step 2: 建立測試支援檔**

```js
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
```

```js
// test/support/collect.mjs
export function collectColors(theme) {
  const out = [];
  for (const [k, v] of Object.entries(theme.colors ?? {})) out.push({ path: `colors.${k}`, value: v });
  (theme.tokenColors ?? []).forEach((r, i) => {
    for (const f of ['foreground', 'background']) {
      if (r.settings?.[f] !== undefined) out.push({ path: `tokenColors[${i}].${f}`, value: r.settings[f] });
    }
  });
  for (const [k, v] of Object.entries(theme.semanticTokenColors ?? {})) {
    const value = typeof v === 'string' ? v : v.foreground;
    if (value !== undefined) out.push({ path: `semanticTokenColors.${k}`, value });
  }
  return out;
}

// ['color', 'editor.foreground'] 或 ['token', 'comment']（取第一條 scope 含該字串的規則）
export function resolveRef(theme, [kind, id]) {
  if (kind === 'color') return theme.colors[id];
  const rule = (theme.tokenColors ?? []).find(r => [].concat(r.scope ?? []).includes(id));
  return rule?.settings?.foreground;
}
```

- [ ] **Step 3: 建立對比度配對清單**

```js
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
```

- [ ] **Step 4: 寫四個測試檔**

```js
// test/structure.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { UI_AREAS, OPAQUE_KEYS } from '../src/ui-areas.mjs';
import { collectColors } from './support/collect.mjs';

const theme = buildTheme(palette);
const HEX = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;

test('every colour value is #RRGGBB or #RRGGBBAA', () => {
  const bad = collectColors(theme).filter(c => !HEX.test(c.value));
  assert.deepEqual(bad, []);
});

for (const [area, keys] of Object.entries(UI_AREAS)) {
  test(`UI Area "${area}" defines every required key`, () => {
    const missing = keys.filter(k => !(k in theme.colors));
    assert.deepEqual(missing, []);
  });
}

test('surface keys are opaque', () => {
  const bad = OPAQUE_KEYS.filter(k => {
    const v = theme.colors[k];
    return v === undefined || (v.length === 9 && !/FF$/i.test(v));
  });
  assert.deepEqual(bad, []);
});

test('all 16 ANSI colours are defined', () => {
  const keys = ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White']
    .flatMap(n => [`terminal.ansi${n}`, `terminal.ansiBright${n}`]);
  assert.equal(keys.length, 16);
  assert.deepEqual(keys.filter(k => !(k in theme.colors)), []);
});

test('theme metadata and syntax layers', () => {
  assert.equal(theme.name, 'Interlinked');
  assert.equal(theme.type, 'dark');
  assert.equal(theme.semanticHighlighting, true);
  assert.ok(theme.tokenColors.length > 0, 'tokenColors is empty');
  assert.ok(Object.keys(theme.semanticTokenColors).length > 0, 'semanticTokenColors is empty');
});

test('token foregrounds are opaque (no alpha in tokenColors)', () => {
  const bad = theme.tokenColors
    .filter(r => r.settings.foreground && r.settings.foreground.length !== 7)
    .map(r => r.name);
  assert.deepEqual(bad, []);
});
```

```js
// test/palette-discipline.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { collectColors } from './support/collect.mjs';

test('palette entries are well-formed and unique', () => {
  const values = Object.values(palette);
  for (const [name, hex] of Object.entries(palette)) assert.match(hex, /^#[0-9A-F]{6}$/, name);
  assert.equal(new Set(values).size, values.length, 'two palette names share one colour');
});

test('every theme colour, ignoring alpha, is a palette colour', () => {
  const allowed = new Set(Object.values(palette));
  const strays = collectColors(buildTheme(palette))
    .filter(c => !allowed.has(c.value.slice(0, 7).toUpperCase()))
    .map(c => `${c.path} = ${c.value}`);
  assert.deepEqual(strays, []);
});
```

```js
// test/contrast.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { contrast } from './support/color.mjs';
import { resolveRef } from './support/collect.mjs';
import { PAIRS } from './contrast-pairs.mjs';

test('contrast calculator sanity: black/white is 21:1', () => {
  assert.equal(Math.round(contrast('#FFFFFF', '#000000')), 21);
});

const theme = buildTheme(palette);
for (const pair of PAIRS) {
  test(`${pair.name} meets ${pair.min}:1`, () => {
    const fg = resolveRef(theme, pair.fg);
    const bg = resolveRef(theme, pair.bg);
    assert.ok(fg, `foreground ${pair.fg.join(':')} is not defined`);
    assert.ok(bg, `background ${pair.bg.join(':')} is not defined`);
    const ratio = contrast(fg, bg);   // fg 帶 alpha 時會先合成
    assert.ok(ratio >= pair.min, `${fg} on ${bg} is ${ratio.toFixed(2)}:1, need ${pair.min}:1`);
  });
}
```

```js
// test/distinct.test.mjs — 使用者「一眼分辨」的需求（spec 故事 13、16、37、38）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { flatten, distance } from './support/color.mjs';

const theme = buildTheme(palette);
const BG = theme.colors['editor.background'];

function pairwiseDistinct(keys, min, over = BG) {
  const colours = keys.map(k => {
    assert.ok(theme.colors[k], `${k} is not defined`);
    return [k, flatten(theme.colors[k], over)];
  });
  const close = [];
  for (let i = 0; i < colours.length; i++) {
    for (let j = i + 1; j < colours.length; j++) {
      const d = distance(colours[i][1], colours[j][1]);
      if (d < min) close.push(`${colours[i][0]} vs ${colours[j][0]}: ${d.toFixed(0)}`);
    }
  }
  assert.deepEqual(close, []);
}

test('diagnostic severities are pairwise distinguishable', () => {
  pairwiseDistinct(
    ['editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground', 'editorHint.foreground'], 60);
});

test('selection, find match and find highlight are distinguishable', () => {
  pairwiseDistinct(
    ['editor.selectionBackground', 'editor.findMatchBackground', 'editor.findMatchHighlightBackground'], 40);
});

test('git decorations are pairwise distinguishable', () => {
  pairwiseDistinct([
    'gitDecoration.addedResourceForeground', 'gitDecoration.modifiedResourceForeground',
    'gitDecoration.deletedResourceForeground', 'gitDecoration.untrackedResourceForeground',
    'gitDecoration.ignoredResourceForeground', 'gitDecoration.conflictingResourceForeground',
  ], 60);
});

test('diff inserted and removed text backgrounds are distinguishable', () => {
  pairwiseDistinct(['diffEditor.insertedTextBackground', 'diffEditor.removedTextBackground'], 40);
});
```

- [ ] **Step 5: 執行並確認失敗，且原因正確**

Run: `node --test test/structure.test.mjs test/palette-discipline.test.mjs test/contrast.test.mjs test/distinct.test.mjs`
Expected: 全部 FAIL，原因是 `Cannot find module '../src/build-theme.mjs'`（尚未建立）。**不是**語法錯誤或 import 路徑拼錯；若是後者，先修測試。

- [ ] **Step 6: Commit**

```bash
git add src/ui-areas.mjs test/
git commit -m "test: 新增 UI Area 清單與結構、Palette 紀律、對比度、可區分性測試（先紅）"
```

---

### Task 4: `buildTheme` 骨架與 build 腳本

**Files:**
- Create: `src/build-theme.mjs`, `src/theme/shared.mjs`
- Create（空殼，之後各 Task 填入）: `src/theme/chrome.mjs`, `editor.mjs`, `editor-extras.mjs`, `controls.mjs`, `terminal-scm.mjs`, `syntax-textmate.mjs`, `syntax-languages.mjs`, `syntax-semantic.mjs`
- Create: `scripts/build.mjs`, `themes/interlinked-color-theme.json`（產生物）
- Modify: `test/package.test.mjs`

**Interfaces:**
- Consumes: `palette`、`withAlpha`。
- Produces（後續每個 Task 依賴這些名稱與簽章）：
  - `buildTheme(palette) → { $schema, name, type, semanticHighlighting, colors, tokenColors, semanticTokenColors }`
  - `chromeColors(p)`、`editorColors(p)`、`editorExtrasColors(p)`、`controlsColors(p)`、`terminalScmColors(p)` → `Record<string,string>`
  - `textmateRules(p)`、`languageRules(p)` → `{name, scope, settings}[]`
  - `semanticColors(p)` → `Record<string, string | {foreground?, bold?, italic?}>`
  - `ALPHA`（命名的 alpha 常數）與 `tints(p)`（共用的透明度色）

- [ ] **Step 1: 擴充 package 測試（先紅）**

在 `test/package.test.mjs` 的**頂部**補兩行 import：

```js
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
```

並在檔案**末尾**追加這個測試：

```js
test('declared theme file exists, parses, and matches buildTheme output', () => {
  const rel = pkg.contributes.themes[0].path.replace(/^\.\//, '');
  const onDisk = JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));
  assert.deepEqual(onDisk, JSON.parse(JSON.stringify(buildTheme(palette))));
});
```

Run: `node --test test/package.test.mjs`
Expected: FAIL（`Cannot find module '../src/build-theme.mjs'`）

- [ ] **Step 2: 建立 `src/theme/shared.mjs`**

```js
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
```

- [ ] **Step 3: 建立八個空殼模組**

每個檔案只含下列內容（各自替換函式名）。這是明確的「讓測試能 import、之後各 Task 填入」的鷹架，不是待辦：

```js
// src/theme/chrome.mjs
export function chromeColors(_p) { return {}; }
```

對應函式名：`editor.mjs`→`editorColors`、`editor-extras.mjs`→`editorExtrasColors`、`controls.mjs`→`controlsColors`、`terminal-scm.mjs`→`terminalScmColors`（皆回傳 `{}`）；`syntax-textmate.mjs`→`textmateRules`、`syntax-languages.mjs`→`languageRules`（皆回傳 `[]`）；`syntax-semantic.mjs`→`semanticColors`（回傳 `{}`）。

- [ ] **Step 4: 建立 `src/build-theme.mjs`**

```js
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
```

- [ ] **Step 5: 建立 `scripts/build.mjs` 並產生主題 JSON**

```js
// 單一 build 指令：npm run build
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';

const out = fileURLToPath(new URL('../themes/interlinked-color-theme.json', import.meta.url));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(buildTheme(palette), null, 2) + '\n');
console.log(`wrote ${out}`);
```

Run: `npm run build`
Expected: 印出 `wrote .../themes/interlinked-color-theme.json`

- [ ] **Step 6: 執行全部測試，確認「剩下的紅」都是預期的**

Run: `npm test`
Expected：共 47 項，**9 項通過、38 項失敗**（數字已用計畫中的程式碼實測；此時還沒有 `syntax-coverage` 測試，它們在 Task 10、11 才加入）。
- 通過（9）：`package.test.mjs` 的 4 項、`palette-discipline` 的 2 項（空主題沒有雜色）、`every colour value is #RRGGBB or #RRGGBBAA`、`token foregrounds are opaque`、`contrast calculator sanity`。
- 失敗且原因正確（38）：23 個 UI Area 的「defines every required key」（缺 key）、`surface keys are opaque`、`all 16 ANSI colours`、`theme metadata and syntax layers`（tokenColors 為空）、8 個 contrast 配對（前景未定義）、4 個 `distinct`（未定義）。
- 不應有 import 或語法錯誤；若有，是測試或鷹架寫錯，先修。

- [ ] **Step 7: Commit**

```bash
git add src/ scripts/build.mjs themes/ test/package.test.mjs
git commit -m "feat: 新增 buildTheme 骨架與 build 腳本"
```

> **之後每個 Task 的 commit 都要包含重新 `npm run build` 產生的 `themes/interlinked-color-theme.json`**；忘記時 `package.test.mjs` 會失敗提醒你。

---

### Task 5: UI Area — chrome

**Files:**
- Modify: `src/theme/chrome.mjs`

**Interfaces:**
- Consumes: `tints(p)`、`ALPHA`、`withAlpha`、`palette` 名稱（Task 2、4）。
- Produces: `chromeColors(p)`：涵蓋 UI Area `activityBar`、`sideBar`、`statusBar`、`titleBar`、`tabs`、`panel`、`badgesProgress`、`focusBorder`、`global`。

注意：spec 故事 25「原生標題列在 VS Code 允許的範圍內」——native title bar 只能由 OS 控制，`titleBar.*` 只影響自訂標題列；這裡不需要額外處理。

- [ ] **Step 1: 實作**

```js
// src/theme/chrome.mjs
import { withAlpha as a } from '../color.mjs';
import { ALPHA, tints } from './shared.mjs';

export function chromeColors(p) {
  const t = tints(p);
  return {
    // activityBar（上游沒有此區域，沿用 chrome 底色）
    'activityBar.background': p.bgChrome,
    'activityBar.foreground': p.tealBright,
    'activityBar.inactiveForeground': t.textDim,
    'activityBar.border': t.border,
    'activityBar.activeBorder': p.tealBright,
    'activityBarBadge.background': p.teal,
    'activityBarBadge.foreground': p.bgChrome,

    // sideBar
    'sideBar.background': p.bgSide,
    'sideBar.foreground': p.fg,
    'sideBar.border': t.border,
    'sideBarTitle.foreground': p.mintPale,
    'sideBarSectionHeader.background': p.bgRaised,
    'sideBarSectionHeader.foreground': p.mintPale,
    'sideBarSectionHeader.border': t.border,

    // statusBar
    'statusBar.background': p.bgChrome,
    'statusBar.foreground': p.fg,
    'statusBar.border': t.border,
    'statusBar.debuggingBackground': p.amber,
    'statusBar.debuggingForeground': p.bgChrome,
    'statusBar.debuggingBorder': t.border,
    'statusBar.noFolderBackground': p.bgRaised,
    'statusBar.noFolderForeground': p.fg,
    'statusBar.noFolderBorder': t.border,
    'statusBarItem.hoverBackground': t.hoverBg,
    'statusBarItem.activeBackground': t.activeBg,
    'statusBarItem.prominentBackground': p.bgRaised,
    'statusBarItem.prominentForeground': p.tealBright,
    'statusBarItem.remoteBackground': p.teal,
    'statusBarItem.remoteForeground': p.bgChrome,
    'statusBarItem.errorBackground': p.coral,
    'statusBarItem.errorForeground': p.bgChrome,
    'statusBarItem.warningBackground': p.lemon,
    'statusBarItem.warningForeground': p.bgChrome,

    // titleBar 與選單
    'titleBar.activeBackground': p.bgChrome,
    'titleBar.activeForeground': p.fg,
    'titleBar.inactiveBackground': p.bgChrome,
    'titleBar.inactiveForeground': t.textDim,
    'titleBar.border': t.border,
    'menubar.selectionBackground': t.hoverBg,
    'menubar.selectionForeground': p.fg,
    'menu.background': p.bgSide,
    'menu.foreground': p.fg,
    'menu.selectionBackground': t.activeBg,
    'menu.selectionForeground': p.fg,
    'menu.separatorBackground': t.border,
    'menu.border': t.border,

    // tabs
    'editorGroupHeader.tabsBackground': p.bgTabBar,
    'editorGroupHeader.noTabsBackground': p.bgEditor,
    'editorGroupHeader.tabsBorder': t.border,
    'editorGroup.border': t.border,
    'editorGroup.dropBackground': t.activeBg,
    'tab.activeBackground': p.bgEditor,
    'tab.activeForeground': p.fg,
    'tab.activeBorder': t.none,
    'tab.activeBorderTop': p.tealBright,            // 作用中分頁的指示線（spec 故事 24）
    'tab.activeModifiedBorder': p.amber,
    'tab.inactiveBackground': p.bgTabBar,
    'tab.inactiveForeground': t.textDim,
    'tab.inactiveModifiedBorder': a(p.amber, ALPHA.strong),
    'tab.unfocusedActiveBackground': p.bgEditor,
    'tab.unfocusedActiveForeground': t.textDim,
    'tab.unfocusedInactiveBackground': p.bgTabBar,
    'tab.unfocusedInactiveForeground': t.textDimmer,
    'tab.hoverBackground': p.bgRaised,
    'tab.hoverForeground': p.fg,
    'tab.hoverBorder': t.none,
    'tab.border': t.border,
    'tab.lastPinnedBorder': t.border,

    // panel
    'panel.background': p.bgPanel,
    'panel.border': t.border,
    'panel.dropBorder': p.tealBright,
    'panelTitle.activeBorder': p.tealBright,
    'panelTitle.activeForeground': p.fg,
    'panelTitle.inactiveForeground': t.textDim,
    'panelSection.border': t.border,
    'panelSectionHeader.background': p.bgRaised,
    'panelInput.border': t.border,

    // badge / progress / focus
    'badge.background': p.teal,
    'badge.foreground': p.bgChrome,
    'progressBar.background': p.tealBright,
    'focusBorder': t.borderStrong,
    'sash.hoverBorder': p.tealBright,

    // global
    'foreground': p.fg,
    'descriptionForeground': t.textDim,
    'errorForeground': p.coral,
    'icon.foreground': p.fg,
    'selection.background': a(p.mint, ALPHA.soft),
    'textLink.foreground': p.aquamarine,
    'textLink.activeForeground': p.springGreen,
    'textCodeBlock.background': p.bgSide,
    'widget.shadow': a(p.bgChrome, 0.6),
    'toolbar.hoverBackground': t.hoverBg,
    'toolbar.activeBackground': t.activeBg,
  };
}
```

- [ ] **Step 2: 重新 build 並執行測試**

Run: `npm run build && npm test`
Expected 轉綠：UI Area `sideBar`、`activityBar`、`statusBar`、`titleBar`、`tabs`、`panel`、`badgesProgress`、`focusBorder`、`global`；對比度 `side bar text`、`status bar text`、`active tab text`、`inactive tab text`。其餘仍紅（屬後續 Task）。

若 `inactive tab text` 失敗：`textDim` 合成後的比值低於 3，調高 `ALPHA.dim`（`shared.mjs`），不要改測試。

- [ ] **Step 3: Commit**

```bash
git add src/theme/chrome.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作 chrome UI Area（activityBar、sideBar、statusBar、titleBar、tabs、panel）"
```

---

### Task 6: UI Area — editor 本體

**Files:**
- Modify: `src/theme/editor.mjs`

**Interfaces:**
- Consumes: `tints(p)`、`ALPHA`、`withAlpha`。
- Produces: `editorColors(p)`：涵蓋 UI Area `editor`。

- [ ] **Step 1: 實作**

```js
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
```

- [ ] **Step 2: 重新 build 並執行測試**

Run: `npm run build && npm test`
Expected 轉綠：UI Area `editor`；對比度 `editor text`、`line number`；`distinct` 的「diagnostic severities」「selection, find match…」。`surface keys are opaque` 仍紅（缺其他區域的 key）。

- [ ] **Step 3: Commit**

```bash
git add src/theme/editor.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作 editor UI Area（含 gutter、括號、診斷、inlay hint、sticky scroll）"
```

---

### Task 7: UI Area — editor 周邊

**Files:**
- Modify: `src/theme/editor-extras.mjs`

**Interfaces:**
- Consumes: 同 Task 6。
- Produces: `editorExtrasColors(p)`：涵蓋 `minimap`、`scrollbar`、`breadcrumbs`、`peekView`、`widgets`。

- [ ] **Step 1: 實作**

```js
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
    'scrollbar.shadow': t.none,
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
```

- [ ] **Step 2: 重新 build 並執行測試**

Run: `npm run build && npm test`
Expected 轉綠：UI Area `minimap`、`scrollbar`、`breadcrumbs`、`peekView`、`widgets`。

- [ ] **Step 3: Commit**

```bash
git add src/theme/editor-extras.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作 minimap、scrollbar、breadcrumbs、peek view、widgets"
```

---

### Task 8: UI Area — controls

**Files:**
- Modify: `src/theme/controls.mjs`

**Interfaces:**
- Consumes: 同 Task 6。
- Produces: `controlsColors(p)`：涵蓋 `listsTrees`、`controls`、`quickInput`、`notifications`。

- [ ] **Step 1: 實作**

```js
// src/theme/controls.mjs
import { withAlpha as a } from '../color.mjs';
import { ALPHA, tints } from './shared.mjs';

export function controlsColors(p) {
  const t = tints(p);
  return {
    // lists / trees：hover、selection、focus、inactive selection 四種狀態彼此不同（spec 故事 28）
    'list.activeSelectionBackground': t.activeBg,
    'list.activeSelectionForeground': p.fg,
    'list.inactiveSelectionBackground': p.bgRaised,
    'list.inactiveSelectionForeground': p.fg,
    'list.hoverBackground': a(p.tealBright, ALPHA.faint),
    'list.hoverForeground': p.fg,
    'list.focusBackground': t.activeBg,
    'list.focusForeground': p.fg,
    'list.focusOutline': p.tealBright,
    'list.highlightForeground': p.tealBright,
    'list.focusHighlightForeground': p.tealBright,
    'list.dropBackground': t.activeBg,
    'list.errorForeground': p.coral,
    'list.warningForeground': p.lemon,
    'list.invalidItemForeground': p.coral,
    'list.deemphasizedForeground': p.fgMuted,
    'list.filterMatchBackground': a(p.amber, ALPHA.find),
    'listFilterWidget.background': p.bgRaised,
    'listFilterWidget.outline': p.tealBright,
    'listFilterWidget.noMatchesOutline': p.coral,
    'tree.indentGuidesStroke': t.border,
    'tree.inactiveIndentGuidesStroke': a(p.fg, ALPHA.guide),

    // input / dropdown / checkbox / button
    'input.background': p.bgChrome,
    'input.foreground': p.fg,
    'input.border': t.border,
    'input.placeholderForeground': t.textDim,
    'inputOption.activeBackground': t.activeBg,
    'inputOption.activeBorder': p.tealBright,
    'inputOption.activeForeground': p.fg,
    'inputValidation.errorBackground': p.bgRemoved,
    'inputValidation.errorBorder': p.coral,
    'inputValidation.errorForeground': p.fg,
    'inputValidation.warningBackground': p.bgRaised,
    'inputValidation.warningBorder': p.lemon,
    'inputValidation.warningForeground': p.fg,
    'inputValidation.infoBackground': p.bgRaised,
    'inputValidation.infoBorder': p.aqua,
    'inputValidation.infoForeground': p.fg,
    'dropdown.background': p.bgChrome,
    'dropdown.foreground': p.fg,
    'dropdown.border': t.border,
    'dropdown.listBackground': p.bgRaised,
    'checkbox.background': p.bgChrome,
    'checkbox.foreground': p.fg,
    'checkbox.border': t.borderStrong,
    'button.background': p.teal,
    'button.foreground': p.bgChrome,
    'button.hoverBackground': p.springGreen,
    'button.border': t.none,
    'button.secondaryBackground': p.bgRaised,
    'button.secondaryForeground': p.fg,
    'button.secondaryHoverBackground': t.activeBg,

    // quick input / command palette
    'quickInput.background': p.bgRaised,
    'quickInput.foreground': p.fg,
    'quickInputTitle.background': p.bgSide,
    'quickInputList.focusBackground': t.activeBg,
    'quickInputList.focusForeground': p.fg,
    'quickInputList.focusIconForeground': p.tealBright,
    'pickerGroup.foreground': p.tealBright,
    'pickerGroup.border': t.border,

    // notifications
    'notifications.background': p.bgRaised,
    'notifications.foreground': p.fg,
    'notifications.border': t.borderStrong,
    'notificationCenter.border': t.borderStrong,
    'notificationCenterHeader.background': p.bgSide,
    'notificationCenterHeader.foreground': p.fg,
    'notificationToast.border': p.tealBright,
    'notificationLink.foreground': p.aquamarine,
    'notificationsErrorIcon.foreground': p.coral,
    'notificationsWarningIcon.foreground': p.lemon,
    'notificationsInfoIcon.foreground': p.aqua,
  };
}
```

- [ ] **Step 2: 重新 build 並執行測試**

Run: `npm run build && npm test`
Expected 轉綠：UI Area `listsTrees`、`controls`、`quickInput`、`notifications`。

- [ ] **Step 3: Commit**

```bash
git add src/theme/controls.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作 lists、input、button、quick input、notifications"
```

---

### Task 9: UI Area — terminal 與 SCM

**Files:**
- Modify: `src/theme/terminal-scm.mjs`

**Interfaces:**
- Consumes: 同 Task 6。
- Produces: `terminalScmColors(p)`：涵蓋 `terminal`、`gitDecorations`、`diffEditor`、`mergeConflict`。

- [ ] **Step 1: 實作**

```js
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
```

- [ ] **Step 2: 重新 build 並執行測試**

Run: `npm run build && npm test`
Expected 轉綠：UI Area `terminal`、`gitDecorations`、`diffEditor`、`mergeConflict`；`surface keys are opaque`；`all 16 ANSI`；對比度 `terminal text`；`distinct` 的「git decorations」「diff inserted and removed」。

此時 `npm test` 剩下的紅應該只有：`theme metadata and syntax layers`（tokenColors 為空）與對比度 `comment`。

- [ ] **Step 3: Commit**

```bash
git add src/theme/terminal-scm.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作 terminal、ANSI、git decorations、diff、merge conflict"
```

---

### Task 10: 語法 layer 2 — 通用 TextMate scope

**Files:**
- Modify: `src/theme/syntax-textmate.mjs`
- Create: `test/required-scopes.mjs`, `test/syntax-coverage.test.mjs`

**Interfaces:**
- Consumes: `palette` 名稱。
- Produces: `textmateRules(p) → {name, scope: string[], settings: {foreground, fontStyle?}}[]`。規則 `name` 沿用 Reference Theme 的 capture 名稱（`variable.special`、`emphasis` 等），測試靠它檢查斜體。

Reference Theme 39 個 capture 的處理：`predictive`、`primary` 的色值為 null，且 `predictive` 是 Zed AI 專用，不對應；`hint` 對應 inlay hint（Task 6 已做）；其餘 36 個在下表對應到 scope。

- [ ] **Step 1: 寫失敗的測試**

```js
// test/required-scopes.mjs — 資料。每個 scope 都必須被某條規則覆蓋（前綴比對，與 TextMate 一致）。
// 這份清單是「我們預期會遇到的 scope」；Task 12 目視時發現漏的，先加在這裡（先紅），再補規則。
export const REQUIRED_SCOPES = {
  generic: [
    'comment', 'comment.block.documentation', 'string', 'constant.numeric', 'constant.language.boolean',
    'constant.character.escape', 'string.regexp', 'keyword.control', 'keyword.operator', 'storage.type',
    'storage.modifier', 'entity.name.function', 'entity.name.type', 'entity.name.class',
    'variable.parameter', 'variable.language', 'variable.other.property', 'meta.decorator',
    'punctuation.definition.string', 'invalid',
  ],
};
```

```js
// test/syntax-coverage.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette } from '../src/palette.mjs';
import { buildTheme } from '../src/build-theme.mjs';
import { REQUIRED_SCOPES } from './required-scopes.mjs';

const theme = buildTheme(palette);
const covered = theme.tokenColors.flatMap(r => [].concat(r.scope));
const isCovered = s => covered.some(c => s === c || s.startsWith(`${c}.`));

for (const [group, scopes] of Object.entries(REQUIRED_SCOPES)) {
  test(`TextMate scopes for "${group}" are covered`, () => {
    assert.deepEqual(scopes.filter(s => !isCovered(s)), []);
  });
}

test('italic is used only where the Reference Theme uses it', () => {
  const italic = theme.tokenColors
    .filter(r => /italic/.test(r.settings.fontStyle ?? ''))
    .map(r => r.name)
    .sort();
  assert.deepEqual(italic, ['emphasis', 'variable.special']);
});
```

Run: `npm test`
Expected: `syntax-coverage` 的 generic 覆蓋測試 FAIL（tokenColors 為空）；italic 測試 FAIL（空陣列 ≠ 預期）。

- [ ] **Step 2: 實作**

```js
// src/theme/syntax-textmate.mjs
const rule = (name, scope, foreground, fontStyle) => ({
  name,
  scope,
  settings: fontStyle ? { foreground, fontStyle } : { foreground },
});

export function textmateRules(p) {
  return [
    // 註解（D2：不用 Reference 的 #05F283）
    rule('comment', ['comment', 'punctuation.definition.comment'], p.fgMuted),
    rule('comment.doc', ['comment.block.documentation', 'comment.block.javadoc', 'string.quoted.docstring'], p.teal),

    // 關鍵字與運算子
    rule('keyword', ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier'], p.teal),
    rule('operator', ['keyword.operator'], p.teal),
    rule('preproc', ['meta.preprocessor', 'punctuation.definition.directive'], p.fgMuted),

    // 函式與型別（D6：weight ≥600 → bold）
    rule('function', ['entity.name.function', 'support.function', 'meta.function-call.generic', 'variable.function'],
      p.springGreen, 'bold'),
    rule('constructor', ['entity.name.function.constructor'], p.teal),
    rule('type', ['entity.name.type', 'entity.name.class', 'entity.name.namespace',
      'entity.other.inherited-class', 'support.type', 'support.class'], p.aquamarine),
    rule('enum', ['entity.name.type.enum', 'variable.other.enummember'], p.mint),

    // 變數
    rule('variable', ['variable', 'variable.other', 'variable.parameter', 'entity.name.variable'], p.fg),
    rule('variable.special', ['variable.language'], p.mint, 'italic'),
    rule('property', ['variable.other.property', 'variable.other.object.property', 'support.type.property-name',
      'meta.object-literal.key', 'entity.name.variable.property', 'entity.name.variable.field'],
      p.aquamarine, 'bold'),
    rule('label', ['entity.name.label'], p.fg),

    // 常數與字面值
    rule('constant', ['constant', 'constant.language', 'support.constant', 'variable.other.constant'], p.mint),
    rule('boolean', ['constant.language.boolean'], p.teal),
    rule('number', ['constant.numeric'], p.mint),
    rule('string', ['string'], p.peach),
    rule('string.escape', ['constant.character.escape'], p.teal),
    rule('string.regex', ['string.regexp', 'constant.regexp'], p.gold),
    rule('string.special', ['string.other', 'punctuation.definition.template-expression',
      'punctuation.section.embedded'], p.teal),
    rule('string.special.symbol', ['constant.other.symbol'], p.mint),

    // 標點
    rule('punctuation', ['punctuation'], p.teal),
    rule('punctuation.bracket', ['meta.brace', 'punctuation.section', 'punctuation.definition.block',
      'punctuation.definition.parameters', 'punctuation.definition.arguments'], p.fg),
    rule('punctuation.delimiter', ['punctuation.separator', 'punctuation.terminator', 'punctuation.accessor'], p.teal),
    rule('punctuation.list_marker', ['punctuation.definition.list'], p.aquamarine),

    // 標記與註記
    rule('tag', ['entity.name.tag', 'punctuation.definition.tag'], p.teal),
    rule('attribute', ['entity.other.attribute-name'], p.aquamarine),            // D5
    rule('annotation', ['meta.decorator', 'storage.type.annotation', 'punctuation.definition.annotation',
      'entity.name.function.decorator'], p.teal),
    rule('title', ['markup.heading', 'entity.name.section'], p.mint, 'bold'),
    rule('emphasis', ['markup.italic'], p.peach, 'italic'),
    rule('emphasis.strong', ['markup.bold'], p.amber, 'bold'),
    rule('link_text', ['string.other.link.title', 'markup.underline.link.image'], p.teal),
    rule('link_uri', ['markup.underline.link', 'string.other.link'], p.aquamarine),
    rule('text.literal', ['markup.inline.raw', 'markup.fenced_code', 'markup.raw'], p.springGreen),
    rule('embedded', ['meta.embedded', 'source.embedded'], p.fg),
    rule('invalid', ['invalid'], p.coral),
  ];
}
```

- [ ] **Step 3: 重新 build 並執行測試**

Run: `npm run build && npm test`
Expected: `syntax-coverage` 兩項 PASS；對比度 `comment` PASS（`fgMuted` 在 `bgEditor` 上 3.58:1）；`theme metadata and syntax layers` 仍可能因 `semanticTokenColors` 為空而 FAIL（Task 11 解）。

- [ ] **Step 4: Commit**

```bash
git add src/theme/syntax-textmate.mjs test/required-scopes.mjs test/syntax-coverage.test.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作通用 TextMate 語法對應（Reference capture → scope）"
```

---

### Task 11: 語法 layer 1 與 3 — semantic token 與 11 種語言

**Files:**
- Modify: `src/theme/syntax-semantic.mjs`, `src/theme/syntax-languages.mjs`
- Modify: `test/required-scopes.mjs`, `test/syntax-coverage.test.mjs`

**Interfaces:**
- Consumes: `textmateRules` 的 `name` 慣例（Task 10）。
- Produces: `semanticColors(p)`、`languageRules(p)`。

C#、Java、Kotlin 的 scope 前綴（`entity.name.type.*`、`entity.name.function.*`、`storage.*`、`keyword.*`）已被 Task 10 的通用規則覆蓋；`languageRules` 只放通用規則涵蓋不到的語言專屬 scope。下列 scope 是**起始清單**，真實 grammar 的 scope 以 Task 12 的 `Developer: Inspect Editor Tokens and Scopes` 為準，發現落差時先把 scope 加進 `required-scopes.mjs`（先紅）再補規則。

- [ ] **Step 1: 擴充測試資料與測試（先紅）**

在 `test/required-scopes.mjs` 的 `REQUIRED_SCOPES` 內追加：

```js
  typescript: ['support.type.primitive.ts', 'punctuation.definition.template-expression.begin.ts', 'meta.decorator.ts'],
  csharp: ['entity.name.type.class.cs', 'entity.name.function.cs', 'entity.name.variable.parameter.cs',
    'entity.name.variable.property.cs', 'keyword.other.using.cs', 'storage.modifier.cs'],
  java: ['storage.type.annotation.java', 'entity.name.type.class.java', 'entity.name.function.java',
    'storage.modifier.java'],
  kotlin: ['keyword.hard.kotlin', 'keyword.soft.kotlin', 'entity.name.function.kotlin', 'entity.name.type.kotlin'],
  html: ['entity.name.tag.html', 'entity.other.attribute-name.html', 'string.quoted.double.html',
    'punctuation.definition.tag.begin.html'],
  css: ['entity.name.tag.css', 'entity.other.attribute-name.class.css', 'support.type.property-name.css',
    'support.constant.property-value.css', 'keyword.other.unit.css', 'constant.other.color.rgb-value.hex.css'],
  sql: ['keyword.other.DML.sql', 'storage.type.sql', 'support.function.aggregate.sql', 'string.quoted.single.sql',
    'constant.numeric.sql'],
  shell: ['variable.other.normal.shell', 'entity.name.command.shell', 'string.quoted.double.shell',
    'keyword.control.shell', 'support.function.builtin.shell'],
  json: ['support.type.property-name.json', 'string.quoted.double.json', 'constant.numeric.json',
    'constant.language.json'],
  yaml: ['entity.name.tag.yaml', 'string.quoted.double.yaml', 'comment.line.number-sign.yaml',
    'entity.name.type.anchor.yaml'],
  markdown: ['markup.heading.markdown', 'markup.bold.markdown', 'markup.italic.markdown',
    'markup.underline.link.markdown', 'markup.inline.raw.string.markdown', 'markup.fenced_code.block.markdown',
    'punctuation.definition.list.begin.markdown'],
```

在 `test/syntax-coverage.test.mjs` 末尾追加：

```js
test('semantic tokens cover the core types and the defaultLibrary / readonly cues', () => {
  const keys = Object.keys(theme.semanticTokenColors);
  for (const k of ['function', 'type', 'variable', 'property', 'parameter', 'enumMember',
    'variable.readonly', 'variable.defaultLibrary']) {
    assert.ok(keys.includes(k), `semanticTokenColors.${k} is missing`);
  }
});

test('semantic italic is limited to defaultLibrary variables', () => {
  const italic = Object.entries(theme.semanticTokenColors)
    .filter(([, v]) => typeof v === 'object' && v.italic)
    .map(([k]) => k);
  assert.deepEqual(italic, ['variable.defaultLibrary']);
});
```

Run: `npm test`
Expected: 新增的語言覆蓋測試與兩個 semantic 測試 FAIL。

- [ ] **Step 2: 實作 semantic token（layer 1）**

```js
// src/theme/syntax-semantic.mjs
export function semanticColors(p) {
  return {
    namespace: p.aquamarine,
    type: p.aquamarine,
    class: p.aquamarine,
    struct: p.aquamarine,
    interface: p.aquamarine,
    typeParameter: p.aquamarine,
    enum: p.mint,
    enumMember: p.mint,
    function: { foreground: p.springGreen, bold: true },
    method: { foreground: p.springGreen, bold: true },
    property: { foreground: p.aquamarine, bold: true },
    variable: p.fg,
    parameter: p.fg,
    decorator: p.teal,
    macro: p.teal,
    // spec 故事 53：readonly / 預設函式庫符號「微妙地」區分，對應 Reference 的 variable.special
    'variable.readonly': p.mint,
    'variable.defaultLibrary': { foreground: p.mint, italic: true },
  };
}
```

- [ ] **Step 3: 實作語言專屬 scope（layer 3）**

```js
// src/theme/syntax-languages.mjs
const rule = (name, scope, foreground, fontStyle) => ({
  name,
  scope,
  settings: fontStyle ? { foreground, fontStyle } : { foreground },
});

// 只放 Task 10 的通用規則涵蓋不到的語言專屬 scope。
// C# / Java / Kotlin 目前完全由通用規則覆蓋；Task 12 目視後有落差才補在這裡。
export function languageRules(p) {
  return [
    // HTML
    rule('html.tag-punctuation', ['punctuation.definition.tag.begin.html', 'punctuation.definition.tag.end.html'],
      p.fgMuted),

    // CSS
    rule('css.selector.class-id', ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css',
      'entity.other.attribute-name.pseudo-class.css', 'entity.other.attribute-name.pseudo-element.css'],
      p.springGreen),
    rule('css.property', ['support.type.property-name.css'], p.aquamarine),
    rule('css.value', ['support.constant.property-value.css', 'meta.property-value.css'], p.fg),
    rule('css.unit', ['keyword.other.unit.css', 'constant.numeric.css'], p.mint),
    rule('css.colour', ['constant.other.color.rgb-value.hex.css', 'support.constant.color.css'], p.amber),

    // SQL
    rule('sql.function', ['support.function.aggregate.sql', 'support.function.sql'], p.springGreen),

    // Bash
    rule('shell.variable', ['variable.other.normal.shell', 'punctuation.definition.variable.shell',
      'variable.other.special.shell', 'variable.other.positional.shell'], p.mint),
    rule('shell.command', ['entity.name.command.shell', 'support.function.builtin.shell'], p.springGreen),

    // JSON：鍵與值可區分
    rule('json.key', ['support.type.property-name.json'], p.aquamarine),

    // YAML
    rule('yaml.key', ['entity.name.tag.yaml'], p.aquamarine),
    rule('yaml.anchor', ['entity.name.type.anchor.yaml', 'punctuation.definition.anchor.yaml',
      'variable.other.alias.yaml'], p.amber),

    // Markdown
    rule('markdown.quote', ['markup.quote'], p.fgMuted),
  ];
}
```

- [ ] **Step 4: 重新 build 並執行全部測試**

Run: `npm run build && npm test`
Expected: **全部 PASS**。若 italic 測試失敗，代表有規則的 `name` 不是 `variable.special` / `emphasis` 卻帶了 italic，改規則，不改測試。

- [ ] **Step 5: Commit**

```bash
git add src/theme/syntax-semantic.mjs src/theme/syntax-languages.mjs test/required-scopes.mjs test/syntax-coverage.test.mjs themes/interlinked-color-theme.json
git commit -m "feat: 實作 semantic token 與驗證語言專屬 scope"
```

---

### Task 12: Sample 與目視驗證（手動）

**Files:**
- Create: `samples/sample.ts`, `samples/Sample.cs`, `samples/Sample.kt`, `samples/Sample.java`, `samples/sample.html`, `samples/sample.css`, `samples/sample.sql`, `samples/sample.sh`, `samples/sample.json`, `samples/sample.yaml`, `samples/sample.md`
- Create: `images/`（README 截圖）
- Modify（視目視結果）: `src/palette.mjs`、`src/theme/*.mjs`、`test/required-scopes.mjs`

**Interfaces:**
- Consumes: 全部先前 Task 的輸出。
- Produces: 通過目視的 Palette 與規則；README 用的四張截圖。

這個 Task 是人眼迴圈，不能委派給 subagent。

**Sample 的內容規格**（每個檔 20–40 行，必須能肉眼看出下列元素各自的顏色）：

| 語言 | 必須包含 |
|---|---|
| TypeScript | import、interface、enum、class（含 decorator、泛型、建構子屬性）、async 函式、arrow function、template string（含 `\t` escape）、regex 字面值、數字、boolean／null、`/** */` 與 `//` 註解、`readonly`、`console.log`（defaultLibrary）、一行刻意的型別錯誤（看波浪線） |
| C# | using、namespace、class／record、屬性（property／field）、方法與參數、`async`/`await`、`[Attribute]`、字串插值、`///` XML 註解、LINQ |
| Kotlin | package／import、`data class`、`fun`、`val`/`var`、擴充函式、字串模板、`@Annotation`、`when`、nullable `?` |
| Java | package／import、class、`@Override` 註解、泛型方法、`final`、字串、`/** */ Javadoc` |
| HTML | 文件結構、tag、帶值屬性、布林屬性、註解、行內 `<style>` 與 `<script>` |
| CSS | 標籤／class／id／偽類選擇器、屬性與值、單位、色碼（hex 與 `rgb()`）、`@media`、自訂屬性 `var(--x)`、註解 |
| SQL | `SELECT … JOIN … WHERE … GROUP BY`、`CREATE TABLE`、聚合函式、字串與數字、別名、`--` 註解 |
| Bash | shebang、變數賦值與 `${}` 展開、`if`/`for`、指令與 pipe、雙引號與單引號字串、`$(…)`、函式、註解 |
| JSON | 巢狀物件（至少 3 層）、陣列、字串／數字／boolean／null |
| YAML | 巢狀 map、list、anchor 與 alias、多行字串、註解、字串與數字（模擬 CI 設定） |
| Markdown | 各級標題、粗體、斜體、連結、行內 code、fenced code（帶語言）、清單、引用 |

- [ ] **Step 1: 建立 11 個 Sample**，每個符合上表。TypeScript 範例（其餘依同一風格自行撰寫）：

```ts
// Interlinked sample — TypeScript
import { readFile } from 'node:fs/promises';

/** A theme palette: every colour has a name. */
export interface Palette {
  readonly [name: string]: string;
}

export enum Severity { Error = 1, Warning, Info }

const MAX_RETRIES = 3;
const HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

@sealed
export class ThemeLoader<T extends Palette = Palette> {
  private cache = new Map<string, T>();

  constructor(private readonly root: string, public verbose = false) {}

  async load(name: string, attempt = 0): Promise<T | null> {
    const path = `${this.root}/${name}.json`;
    try {
      const raw = await readFile(path, 'utf8');
      const palette = JSON.parse(raw) as T;
      this.cache.set(name, palette);
      if (this.verbose) console.log(`loaded ${name}\t(${raw.length} bytes)`);
      return palette;
    } catch (err) {
      if (attempt < MAX_RETRIES) return this.load(name, attempt + 1);
      return null;
    }
  }
}

export const isHex = (value: string): boolean => HEX.test(value) && value !== 'none';

const wrong: number = 'intentional type error';   // 看紅色波浪線
```

- [ ] **Step 2: 在 Extension Development Host 目視**

1. VS Code 開啟本 repo，按 `F5`（Run Extension）；在新視窗 `Preferences: Color Theme` 選 **Interlinked**。
2. 逐一開啟 `samples/*`。對每一個，檢查：
   - 上表列的每個元素顏色是否可辨、是否符合 spec 故事 40–54；
   - `Developer: Inspect Editor Tokens and Scopes`：點幾個沒著色的 token，記下實際 scope。
3. 逐一檢查 UI Area：側邊欄、分頁（含 modified）、狀態列（含 debug 狀態：`Run → Start Debugging`）、panel、終端機（執行 `ls --color`、`git diff`、`git log --oneline --graph --color`）、命令面板、通知（`Developer: Show Notification` 或觸發錯誤）、設定頁（input／dropdown／checkbox／按鈕）、搜尋結果、peek view（對符號按 `Alt+F12`）、diff editor（`git diff` 開檔）、merge conflict（造一個衝突）。
4. **C# 必須在 VS Code（C# Dev Kit）與 Cursor 兩邊都看**。

- [ ] **Step 3: Cursor 驗證**

Run: `npx --yes @vscode/vsce package --no-dependencies -o interlinked-dev.vsix`，再 `cursor --install-extension interlinked-dev.vsix`（或 Cursor Extensions 面板 → Install from VSIX）。重複 Step 2 的 Sample 與 UI 檢查，並檢查 Cursor 的 AI chat、Composer、inline diff 是否沿用主題色（spec 故事 55，只用標準 key 的部分）。同時在 Cursor 的 About 記下其 VS Code 版本，確認不低於 `package.json` 的 `engines.vscode` 下限（D9）；若更低就調低下限。

- [ ] **Step 4: 把目視發現的問題修回去，測試先行**

- 顏色不理想：改 `src/palette.mjs` 的值或對應規則，`npm run build && npm test` 必須維持全綠（對比度與可區分性測試會擋住讓可讀性倒退的調整）。
- 發現未被覆蓋的 scope：先加進 `test/required-scopes.mjs`（紅），再補 `languageRules`（綠）。
- 每個修正獨立 commit。

- [ ] **Step 5: 截圖**

存到 `images/`：`typescript-sidebar.png`（TS 程式碼加側邊欄）、`terminal-git-diff.png`（終端機加 git diff）、`markdown.png`、`cursor.png`（一張 Cursor 畫面）。

- [ ] **Step 6: Commit**

```bash
git add samples/ images/ src/ test/ themes/
git commit -m "feat: 新增 Sample 與目視驗證後的配色調整"
```

---

### Task 13: 發布素材

**Files:**
- Create: `scripts/make-icon.mjs`, `icon.png`, `README.md`, `CHANGELOG.md`, `scripts/check-vsix.mjs`
- Modify: `test/package.test.mjs`, `.vscodeignore`（若需要）

**Interfaces:**
- Consumes: `palette`；`images/` 截圖（Task 12）；`package.json` 的 `icon`、`galleryBanner`（Task 1）。
- Produces: `scripts/check-vsix.mjs <file.vsix>`（Task 14 的 CI 使用，非零 exit code 代表失敗）。

- [ ] **Step 1: 寫失敗的 README 測試**

在 `test/package.test.mjs` 末尾追加：

```js
import { existsSync } from 'node:fs';

test('icon is a PNG of at least 128x128', () => {
  assert.equal(pkg.icon, 'icon.png');
  const buf = readFileSync(new URL('../icon.png', import.meta.url));
  assert.equal(buf.subarray(1, 4).toString(), 'PNG');
  assert.ok(buf.readUInt32BE(16) >= 128 && buf.readUInt32BE(20) >= 128, 'icon is smaller than 128x128');
});

test('README images are absolute https URLs and not SVG (badges excepted)', () => {
  assert.ok(existsSync(new URL('../README.md', import.meta.url)), 'README.md is missing');
  const md = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  const urls = [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map(m => m[1]);
  const bad = urls.filter(u =>
    !u.startsWith('https://') ||
    (u.split('?')[0].endsWith('.svg') && !/img\.shields\.io|badge/.test(u)));
  assert.deepEqual(bad, []);
});

test('README credits the upstream author, repo and both stated licences', () => {
  const md = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  for (const s of ['David C Cavalcante', 'Takk', 'https://github.com/Takk8IS/blade-runner-2049-theme-for-zed',
    'MIT', 'CC BY 4.0']) {
    assert.ok(md.includes(s), `README is missing: ${s}`);
  }
});
```

Run: `node --test test/package.test.mjs`
Expected: 三個新測試 FAIL（icon.png、README.md 不存在）。

- [ ] **Step 2: 建立 `scripts/make-icon.mjs` 並產生 `icon.png`**

純 Node（需要 Node ≥ 22.2 的 `zlib.crc32`）：用 Palette 色畫 256×256 的同心方框（呼應 Baseline Test 的 "interlinked"），這是第一版圖示，維護者之後可用自己的設計取代，只要維持 PNG 與 ≥128×128。

```js
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
```

Run: `node scripts/make-icon.mjs`
Expected: `wrote icon.png`；用圖片檢視器打開確認不是全黑或雜訊。

- [ ] **Step 3: 建立 `README.md`（英文，D8）**

結構與必含內容：

1. 標題與一句話描述；徽章（若有，SVG 僅限 shields.io）。
2. **頂部截圖**：`images/` 的四張，URL 一律 `https://raw.githubusercontent.com/xsmBradPitt/interlinked-theme/main/images/<檔名>.png`（merge 到 `main` 後才會顯示）。
3. Install：Marketplace 與 Open VSX（Cursor）一行說明；`.vsix` 從 GitHub Releases 下載的手動安裝說明。
4. What's covered：UI Area 與 11 種驗證語言清單。
5. **Inspiration（放在最底部）**：外連上游電影畫面，不放進本 repo（ADR 0002）：

```markdown
## Inspiration

Colours are inspired by the film *Blade Runner 2049*. The stills below are hotlinked from the
upstream theme repository and remain the property of their respective rights holders (the film's
studios and Territory Studio); they are not part of this extension.

![Baseline test terminal](https://github.com/Takk8IS/blade-runner-2049-theme-for-zed/blob/main/assets/screenshot-03.jpg?raw=true)
![Interface concept](https://github.com/Takk8IS/blade-runner-2049-theme-for-zed/blob/main/assets/screenshot-04.jpg?raw=true)
```

6. **Credits**（置於 Inspiration 之後）：

```markdown
## Credits

Interlinked is a modified adaptation, as a VS Code theme, of the Zed theme
[Blade Runner 2049](https://github.com/Takk8IS/blade-runner-2049-theme-for-zed)
by David C Cavalcante / Takk™ Innovate Studio.

The upstream project states two licences: MIT (see `LICENSE`, which retains
`Copyright (c) 2024 Takk8IS`) and CC BY 4.0. This adaptation changes the original colour
specification into a VS Code theme and is released under MIT.
```

- [ ] **Step 4: 建立 `CHANGELOG.md`**

```markdown
# Changelog

## 1.0.0

- Initial release: one dark theme covering the editor, workbench, terminal (16 ANSI colours),
  Git decorations, diff and merge views, with TextMate and semantic token colouring for
  TypeScript/JavaScript, C#, Kotlin, Java, HTML, CSS, SQL, Bash, JSON, YAML and Markdown.
```

- [ ] **Step 5: 建立 `scripts/check-vsix.mjs`**

```js
// CI 打包冒煙測試：node scripts/check-vsix.mjs <file.vsix>
import { execFileSync } from 'node:child_process';

const vsix = process.argv[2];
if (!vsix) { console.error('usage: check-vsix.mjs <file.vsix>'); process.exit(2); }

const unzip = (...args) => execFileSync('unzip', args, { encoding: 'utf8' });
const list = unzip('-Z1', vsix).split('\n').filter(Boolean);
// vsce 會把 README.md / CHANGELOG.md 改成小寫、LICENSE 改成 LICENSE.txt（實測 @vscode/vsce 4.0.0），
// 所以一律用小寫比對。
const lower = new Set(list.map(f => f.toLowerCase()));

const must = ['extension/package.json', 'extension/themes/interlinked-color-theme.json',
  'extension/readme.md', 'extension/changelog.md', 'extension/license.txt', 'extension/icon.png'];
const forbidden = ['extension/reference/', 'extension/samples/', 'extension/docs/', 'extension/test/',
  'extension/src/', 'extension/scripts/', 'extension/prototype/', 'extension/images/'];

const problems = [
  ...must.filter(f => !lower.has(f)).map(f => `missing: ${f}`),
  ...list.filter(f => forbidden.some(p => f.toLowerCase().startsWith(p))).map(f => `should be excluded: ${f}`),
];

const manifest = JSON.parse(unzip('-p', vsix, 'extension/package.json'));
for (const t of manifest.contributes.themes) {
  const entry = `extension/${t.path.replace(/^\.\//, '')}`;
  if (!lower.has(entry.toLowerCase())) { problems.push(`declared theme missing: ${entry}`); continue; }
  try { JSON.parse(unzip('-p', vsix, entry)); }
  catch (e) { problems.push(`theme does not parse: ${entry}: ${e.message}`); }
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`ok: ${list.length} files`);
```

- [ ] **Step 6: 本機打包並檢查**

Run: `npm test && npx --yes @vscode/vsce package --no-dependencies -o interlinked-theme.vsix && node scripts/check-vsix.mjs interlinked-theme.vsix`
Expected: 測試全綠；`vsce` 無互動詢問（有 `repository`、`LICENSE`）；`check-vsix` 印出 `ok: 8 files`（`extension.vsixmanifest`、`[Content_Types].xml`，加上 `package.json`、主題 JSON、`readme.md`、`changelog.md`、`LICENSE.txt`、`icon.png`）。若 `vsce` 因 README 內容擋下，依其訊息修 README。

**為什麼一律加 `--no-dependencies`：** 本專案沒有任何依賴；不加時 `vsce` 會用 `npm list` 偵測相依套件，實測在某些環境會回傳空清單，導致**所有檔案被濾掉**（`vsce ls` 無輸出、打包報 icon 找不到）。加上旗標後檔案清單正確，且不依賴 npm 的行為。

- [ ] **Step 7: Commit**

```bash
git add scripts/make-icon.mjs scripts/check-vsix.mjs icon.png README.md CHANGELOG.md test/package.test.mjs .vscodeignore
git commit -m "docs: 新增 icon、README、CHANGELOG 與打包檢查"
```

---

### Task 14: CI 與 Release workflow

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/release.yml`

**Interfaces:**
- Consumes: `npm test`、`npm run build`、`scripts/check-vsix.mjs`（Task 13）。
- Produces: 推送 `v*` tag → GitHub Release 附 `.vsix`；`vars.OPEN_VSX_PUBLISH == 'true'` 時另發布 Open VSX（`secrets.OVSX_PAT`）。

- [ ] **Step 1: 建立 `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
  pull_request:
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm test
      - run: npm run build
      - name: Generated theme is committed and in sync
        run: git diff --exit-code -- themes/
      - name: Package smoke test
        run: |
          npx --yes @vscode/vsce package --no-dependencies -o interlinked-theme.vsix
          node scripts/check-vsix.mjs interlinked-theme.vsix
```

- [ ] **Step 2: 建立 `.github/workflows/release.yml`**

```yaml
name: Release
on:
  push:
    tags: ['v*']
permissions:
  contents: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm test
      - run: npm run build
      - name: Tag matches manifest version
        run: test "v$(node -p "require('./package.json').version")" = "${GITHUB_REF_NAME}"
      - name: Package
        id: pkg
        run: |
          npx --yes @vscode/vsce package --no-dependencies
          VSIX="$(ls interlinked-theme-*.vsix)"
          node scripts/check-vsix.mjs "$VSIX"
          echo "vsix=$VSIX" >> "$GITHUB_OUTPUT"
      # 先建 Release：維護者從這裡下載同一個 .vsix 手動上傳 Marketplace。重跑時已存在就跳過。
      - name: GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release view "$GITHUB_REF_NAME" >/dev/null 2>&1 \
            || gh release create "$GITHUB_REF_NAME" "${{ steps.pkg.outputs.vsix }}" \
                 --title "$GITHUB_REF_NAME" --generate-notes
      # v1.0.0 已於 2026-10-29 本機發布到 Open VSX，不要為了補發而重跑。
      # 下一個版本要讓這步生效：設 repo secret OVSX_PAT 與 variable OPEN_VSX_PUBLISH=true，
      # 或改 trusted publishing（見研究文件 B8）。
      - name: Publish to Open VSX
        if: ${{ vars.OPEN_VSX_PUBLISH == 'true' }}
        env:
          OVSX_PAT: ${{ secrets.OVSX_PAT }}
        run: npx --yes ovsx publish "${{ steps.pkg.outputs.vsix }}" --skip-duplicate
```

- [ ] **Step 3: 本機語法檢查**

Run: `node -e "const y=require('node:fs').readFileSync('.github/workflows/release.yml','utf8'); if(!y.includes('vars.OPEN_VSX_PUBLISH')||y.includes('VSCE_PAT')) process.exit(1)"`
Expected: exit code 0（含 `OPEN_VSX_PUBLISH` 條件，且沒有 `VSCE_PAT`）。YAML 語法在 push 後由 GitHub 驗證。

- [ ] **Step 4: Commit 並推送功能分支，確認 CI 綠燈**

```bash
git add .github/
git commit -m "ci: 新增 CI 與 tag 觸發的 Release workflow"
git push -u origin feat/v1-implementation
```
Expected: GitHub Actions 的 CI 全綠。（推送屬對外操作，執行前先取得使用者確認。）

---

## 本計畫之外：首次發布（`CLAUDE.md` 待辦第 7 項）

實作完成並合併後，依序執行，**順序是硬性的**（研究文件第 3 節）。2026-10-29 的結果：

1. ~~把 `package.json` 的 `version` 與 `CHANGELOG.md` 對齊，推 `v1.0.0` tag → CI 打包並建立 GitHub Release（此時 `OPEN_VSX_PUBLISH` 未設定，不會碰 Open VSX）。~~ 已完成（2026-10-15）。
2. ~~從 GitHub Release 下載 `.vsix`，手動上傳到 Marketplace 管理頁。~~ 已完成（2026-10-15）。
3. ~~完成 Open VSX 的 B1–B5（Eclipse 帳號、Publisher Agreement、token、`create-namespace xsmbradpitt`），開 namespace claim issue（Option 1）。~~ 已完成。claim：[EclipseFdn/open-vsx.org#14795](https://github.com/EclipseFdn/open-vsx.org/issues/14795)，2026-10-29 `granted`。
4. `granted` 之後的發布沒有走「設定 `OVSX_PAT`、`OPEN_VSX_PUBLISH=true`、重跑 workflow」。v1.0.0 是維護者本機 `ovsx publish` 同一份 Release `.vsix`（2026-10-29）。CI 這條仍待下一個版本：secret 與 variable 都還沒設。不要為了補發 1.0.0 去重跑 workflow。
5. 穩定後依研究文件 B8 遷移到 trusted publishing。owner 與 active 版本都已有，這條可以做；做完才刪 token。目前 token 只在維護者本機，repo 裡沒有 `OVSX_PAT`。

---

## Self-Review

**1. Spec coverage**

| Spec 範圍 | 對應 Task |
|---|---|
| 故事 1–8 安裝與選用（manifest、label、Dark 分組、icon、banner、README 截圖與靈感段落） | 1、13、14 |
| 故事 9–22 編輯器 | 6、7 |
| 故事 23–33 工作區 | 5、8 |
| 故事 34–39 終端機、Git、diff | 9（D7 標註與故事 34 的張力） |
| 故事 40–54 語法高亮 | 10、11、12 |
| 故事 55 Cursor | 12 Step 3 |
| 故事 56–61 維護者（Palette、build、三類測試、Sample） | 2、3、4、12 |
| 故事 62 Reference 保存 | 已完成；Task 1、13 確保不進 `.vsix` |
| 故事 63–67 CI／發布／CHANGELOG／secrets | 13、14、首次發布段落 |
| 故事 68–70 授權與署名 | 13（README Credits 與測試） |
| Testing Decisions 1–4（結構、紀律、對比度、打包冒煙） | 3、13、14 |
| Out of Scope 各項 | 無對應 Task（刻意） |

沒有找到無對應 Task 的 spec 要求。

**2. Placeholder 掃描：** 無 TBD／TODO／「類似 Task N」。Task 4 的八個空殼模組是明確列出的鷹架且在後續 Task 取代；Task 12 的 Sample 以內容規格表加一個完整範例定義（Sample 是給人眼看的資料，不是介面）。

**3. 型別一致性：** `buildTheme`、`withAlpha`、`palette`、`ALPHA`、`tints`、`chromeColors`／`editorColors`／`editorExtrasColors`／`controlsColors`／`terminalScmColors`、`textmateRules`／`languageRules`／`semanticColors`、`UI_AREAS`／`OPAQUE_KEYS`、`flatten`／`contrast`／`distance`／`collectColors`／`resolveRef`／`PAIRS`／`REQUIRED_SCOPES` 在定義與使用處名稱一致。Palette 名稱在 Task 5–11 使用的每一個都已在 Task 2 定義（已逐一核對：`leaf` 已移除、未被引用）。

**4. Review Focus：** 五項皆有對應測試與 Task（見該節）。另有兩個未納入前五的風險，已在計畫中處理但未列為 Review Focus：`tokenColors` 帶 alpha（Task 3 structure 測試）、斜體越界（Task 10、11 測試）。
