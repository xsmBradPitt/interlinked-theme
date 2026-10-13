# Spec: Interlinked v1.0 — VS Code / Cursor 深色主題

> 狀態：ready-for-agent（GitHub repo 建好後，會轉成帶有 `ready-for-agent` 標籤的 issue）
> 名詞定義見 `CONTEXT.md`；相關決策見 `docs/adr/0001`、`docs/adr/0002`。

## Problem Statement

我喜歡上游 Zed 主題「Blade Runner 2049」的視覺風格：黑底、發光的青綠色終端字，加上琥珀色點綴。但我日常用的是 VS Code 和 Cursor，這兩個編輯器沒辦法使用 Zed 主題。上游只維護 Zed 版，而且它的配色是為 Zed 的 UI 結構和 tree-sitter 語法分類設計的，不能直接套用到 VS Code。上游的 `background` 還用了 Zed 才支援的視窗半透明效果。我希望 VS Code / Cursor 的使用者（包括我自己）可以從擴充套件市集一鍵安裝這個風格，而且在我常用的語言和日常會看到的每個介面區域裡，看起來都完整、一致、好讀。

## Solution

建立一個獨立的擴充套件 **Interlinked**（`xsmbradpitt.interlinked-theme`），同時發布到 VS Code Marketplace 和 Open VSX（Cursor 從 Open VSX 安裝）。v1.0 只提供一個深色主題。以 **Reference Theme** 作為配色規格，把它的顏色整理成一組有名字的 **Palette**，再由一個產生器用 Palette 組出完整的 VS Code 主題：工作區配色依 **UI Area** 清單完整覆蓋，語法配色同時提供 TextMate scope 和 semantic token 兩套。產出的主題由自動化測試檢查結構、Palette 紀律和對比度，再用 **Sample** 檔在 VS Code 和 Cursor 裡目視驗證。推送版本 tag 時，CI 會把同一個 `.vsix` 發布到兩個市集，並建立 GitHub Release。

## User Stories

### 安裝與選用
1. As a VS Code user, I want to search "Blade Runner" or "Interlinked" in the Marketplace and find the extension, so that I can install it without knowing the exact ID.
2. As a Cursor user, I want to install Interlinked from Cursor's extension panel (Open VSX), so that I get the same theme as VS Code users.
3. As a user, I want to select "Interlinked" in `Preferences: Color Theme`, so that the theme applies immediately.
4. As a user, I want the theme listed under the Dark themes group, so that it appears where I expect.
5. As a user on an offline or corporate network, I want to download the `.vsix` from GitHub Releases, so that I can install it manually.
6. As a user browsing the extension page, I want to see real VS Code and Cursor screenshots at the top, so that I know what I'm getting before installing.
7. As a user browsing the extension page, I want an inspiration section at the bottom of the README with credits, so that I understand the film reference without it dominating the page.
8. As a Marketplace visitor, I want a recognisable icon and a gallery banner colour that match the theme, so that the extension looks polished in search results.

### 編輯器（editor）
9. As a developer, I want an opaque deep background that preserves the look of the reference screenshots, so that the editor is readable without transparency support.
10. As a developer, I want the default foreground text to meet WCAG 4.5:1 contrast against the editor background, so that long sessions are comfortable.
11. As a developer, I want comments to be visibly subdued but still readable (at least 3:1), so that they recede without disappearing.
12. As a developer, I want the cursor, current line highlight, selection, and word highlight in the theme's teal accents, so that focus is obvious.
13. As a developer, I want find-match and find-match-highlight colours that are distinguishable from selection, so that search results stand out.
14. As a developer, I want bracket-pair colorization colours drawn from the Palette, so that nested brackets are distinguishable and on-theme.
15. As a developer, I want indent guides and whitespace rendering to be subtle, so that they don't add noise.
16. As a developer, I want error, warning, info, and hint squiggles in clearly distinct colours, so that diagnostic severity is obvious at a glance.
17. As a developer, I want inlay hints styled distinctly from real code, so that I don't confuse hints with source.
18. As a developer, I want the gutter (line numbers, active line number, folding, git change markers) themed, so that the editor edge matches the rest.
19. As a developer, I want the minimap and scrollbar slider themed, so that no default grey-blue shows.
20. As a developer, I want sticky scroll and breadcrumbs themed, so that the editor header matches.
21. As a developer, I want peek view (references, definitions) themed, so that inline panels don't look foreign.
22. As a developer, I want hover widgets, suggestion (IntelliSense) widgets, and parameter hints themed, so that popups are consistent.

### 工作區（workbench）
23. As a user, I want the activity bar, side bar, and side bar section headers themed, so that the left edge matches the editor.
24. As a user, I want editor tabs (active, inactive, modified, hover) themed with a clear active-tab indicator, so that I know which file is focused.
25. As a user, I want the title bar themed in both custom and native title-bar modes where VS Code allows, so that the window frame is consistent.
26. As a user, I want the status bar themed, including debugging and no-folder states, so that state changes remain visible.
27. As a user, I want the panel (terminal, output, problems) themed, so that the bottom area matches.
28. As a user, I want lists and trees (explorer, search results, outline) to have themed hover, selection, focus, and inactive-selection states, so that navigation is clear.
29. As a user, I want inputs, dropdowns, checkboxes, and buttons (primary and secondary) themed, so that settings and dialogs match.
30. As a user, I want the command palette and quick input themed, so that the most-used popup matches.
31. As a user, I want notifications and notification toasts themed, so that alerts are on-brand but still noticeable.
32. As a user, I want badges and progress bars in accent colours, so that counts and progress are visible.
33. As a user, I want focus borders visible for keyboard navigation, so that accessibility is preserved.

### 終端機、Git、diff
34. As a developer, I want the integrated terminal background and foreground to match the editor, so that the terminal feels integrated.
35. As a developer, I want all 16 ANSI colours defined from the Palette, so that CLI tools (git, test runners, ls) render on-theme and legibly.
36. As a developer, I want terminal selection and cursor themed, so that terminal interaction is clear.
37. As a developer, I want git decorations in the explorer (added, modified, deleted, untracked, ignored, conflicting) distinguishable, so that I can see repository state.
38. As a developer, I want diff editor inserted and removed backgrounds (line and text level) that remain readable with syntax colours on top, so that reviewing changes is easy.
39. As a developer, I want merge-conflict decorations themed, so that resolving conflicts is clear.

### 語法高亮
40. As a TypeScript/JavaScript developer, I want keywords, functions, types, variables, parameters, properties, strings, and numbers coloured per the Reference Theme's intent, so that the code reads like the original theme.
41. As a C# developer, I want correct highlighting in both VS Code (C# Dev Kit) and Cursor (its C# extension), so that the experience doesn't depend on which editor I use.
42. As a Java developer, I want annotations, types, and methods highlighted consistently, so that Java code is as readable as TS.
43. As a Kotlin developer, I want reasonable highlighting from TextMate scopes even without rich semantic tokens, so that Kotlin is usable.
44. As a web developer, I want HTML tags, attributes, and attribute values distinctly coloured, so that markup is scannable.
45. As a web developer, I want CSS selectors, properties, values, units, and colour literals distinctly coloured, so that stylesheets are scannable.
46. As a database developer, I want SQL keywords, identifiers, strings, and functions highlighted, so that queries are readable.
47. As a shell scripter, I want Bash variables, expansions, commands, and strings highlighted, so that scripts are readable.
48. As a developer, I want JSON keys distinct from values, with nested keys readable, so that config files are scannable.
49. As a developer, I want YAML keys, values, anchors, and comments distinct, so that CI and config files are scannable.
50. As a writer, I want Markdown headings, emphasis, bold, links, inline code, code fences, and lists styled, so that docs are pleasant to edit.
51. As a developer, I want string escapes and regex literals visually distinct within strings, so that special characters stand out.
52. As a developer, I want semantic highlighting enabled by default, so that languages with language servers get richer, more accurate colouring.
53. As a developer, I want readonly/constant variables and default-library symbols subtly distinguished, so that I get the same semantic cues the Reference Theme intended (e.g. `variable.special`).
54. As a developer, I want italics used only where the Reference Theme uses them, so that the style stays faithful.

### Cursor 專屬
55. As a Cursor user, I want Cursor's AI chat, Composer, and inline-diff UI to inherit theme colours wherever they use standard workbench keys, so that AI features don't look out of place.

### 維護者
56. As the maintainer, I want every colour to come from a named Palette entry, so that adjusting a hue is a one-line change.
57. As the maintainer, I want a single build command that regenerates the theme JSON, so that output is always in sync with the Palette.
58. As the maintainer, I want automated tests that fail when a required UI Area key is missing, so that coverage doesn't regress.
59. As the maintainer, I want automated tests that fail when a stray colour not in the Palette appears in the output, so that Palette discipline is enforced.
60. As the maintainer, I want automated contrast tests for key foreground/background pairs, so that readability regressions are caught.
61. As the maintainer, I want a Sample file per verified language, so that I can visually check highlighting and reproduce screenshots.
62. As the maintainer, I want the Reference Theme kept verbatim in the repo with its provenance, so that I can diff upstream updates and prove attribution.
63. As the maintainer, I want pushing a `v*` tag to build, test, package, and publish the identical `.vsix` to both marketplaces, so that the two never drift.
64. As the maintainer, I want CI to attach the `.vsix` to a GitHub Release, so that manual installs are possible.
65. As the maintainer, I want CI to run build and tests on every push and PR, so that broken themes never reach a tag.
66. As the maintainer, I want a hand-written CHANGELOG, so that users see what changed on the extension page.
67. As the maintainer, I want marketplace tokens stored only as repository secrets, so that credentials never sit in the repo.

### 授權與署名
68. As the upstream author, I want my copyright notice preserved and my work credited with a link, so that MIT and CC BY 4.0 obligations are met.
69. As a reader of the README, I want a Credits section stating the original author, original repo, both stated licences, and that this is a modified adaptation, so that provenance is transparent.
70. As the rights holders of the film, I want stills shown only as attributed, hotlinked references, so that they aren't redistributed in the package (ADR 0002).

## Implementation Decisions

- **套件結構**：標準的 VS Code 主題擴充套件，`contributes.themes` 只有一項，`label` 為「Interlinked」，`uiTheme` 為 `vs-dark`。displayName 是「Interlinked — Blade Runner 2049 inspired」，publisher 是 `xsmbradpitt`，category 是 Themes。keywords 包含 blade runner、cyberpunk、teal、dark、terminal。另設 `galleryBanner` 和 PNG `icon`（至少 128×128）。engine 版本下限設得夠低，讓 Cursor 目前使用的 VS Code 版本也能安裝。
- **Palette 模組**：純資料，匯出有名字的顏色，例如 `bgDeep`、`teal`、`tealBright`、`mint`、`amber`、`gold`、`peach`、`fgMuted`。命名表達用途或色相，不寫 hex。顏色以 Reference Theme 為起點萃取；Reference Theme 的主調是青綠色（`#00CC99` 系列），琥珀色只是點綴。
- **Theme 產生器模組**：輸入 Palette，輸出完整的主題物件，包含 `colors`、`tokenColors`、`semanticHighlighting: true`、`semanticTokenColors`。需要透明度時，由小工具以「Palette 色 + alpha」組合，不准直接寫 hex。build 指令把這個物件寫成打包用的主題 JSON。只用純 Node ES modules，不需要執行期依賴。
- **介面約定（產生器對外的唯一 seam）**：`buildTheme(palette) → themeObject`。其他模組（build 腳本、測試）都只透過這個函式取得主題。
- **UI Area 清單（v1.0 必須完整覆蓋）**：editor（含 gutter、bracket pair、diagnostics、inlay hints、sticky scroll）、sideBar、activityBar、statusBar、titleBar、tabs（editorGroupHeader / tab）、panel、terminal（含 16 個 ANSI 色）、lists/trees、input / dropdown / checkbox / button、notifications、peek view、diff editor、merge conflict、git decorations、minimap、scrollbar、breadcrumbs、quick input / command palette、widgets（hover / suggest / find）、badges / progress、focus border。清單以資料形式存在 repo 裡，測試也讀同一份資料。預估約 250 到 300 個 key。清單外的 key 交給 VS Code 預設值。
- **底色決策**：VS Code / Cursor 不支援視窗透明，因此把 Reference Theme 的半透明 `background` 改定為不透明實色，目標是保留上游截圖的觀感。具體的值在實作時用 prototype 目視決定。所有底色類的 key 都必須不透明。
- **語法對應策略**：把 Reference Theme 的 39 個 tree-sitter capture（如 `keyword`、`function`、`type`、`variable.special`、`string.escape`、`punctuation.bracket`、`link_uri`）對應到三層：(1) semantic token 類型與修飾詞；(2) 通用 TextMate scope；(3) 針對驗證清單語言的特定 scope。因為 HTML、CSS、SQL、Bash、JSON、YAML、Markdown 只有 TextMate grammar，第 2、3 層是主力，不是備援。字體樣式（斜體、粗體）沿用 Reference Theme 的設定。
- **驗證語言清單**：TypeScript/JavaScript、C#、Kotlin、Java、HTML、CSS、SQL、Bash、JSON、YAML、Markdown。C# 必須在 VS Code 和 Cursor 都驗證過。
- **Reference Theme**：原樣保存，旁邊附 provenance 說明（上游 repo、fork 的 commit、授權）。不打包進 `.vsix`。上游更新的流程是：fork 同步上游 → 複製檔案過來 → diff → 手動調整 Palette 和產生器。
- **發布流程**：GitHub Actions。每次 push 和 PR 都跑 build 與測試；推送 `v*` tag 時，額外執行 package → 用同一個 `.vsix` 先後發布到 VS Code Marketplace 和 Open VSX → 建立 GitHub Release 並附上 `.vsix`。token 存在 repo secrets（Marketplace PAT、Open VSX token）。版本號手動維護在套件 manifest，CHANGELOG 手寫。
- **授權與署名**：MIT，`LICENSE` 保留 `Copyright (c) 2024 Takk8IS` 並加上 `Copyright (c) 2026 xsmBradPitt`（已完成）。README 的 Credits 段落註明原作者 David C Cavalcante / Takk™ Innovate Studio、上游 repo 連結、上游標示的 MIT 與 CC BY 4.0 兩種授權，並註明「已修改並改作為 VS Code 主題」。
- **README 素材**：頂部放自製截圖，至少包含 TS 程式碼加側邊欄、終端機加 git diff、Markdown，以及一張 Cursor 畫面。電影畫面依 ADR 0002 處理：外連到上游、附版權說明、只放在底部的靈感段落。README 中的圖片一律用 https 絕對網址，非徽章類的圖片不用 SVG。`.vsix` 透過 ignore 設定排除 `reference/`、`samples/`、`docs/`、測試與原始碼裡不需要的部分。

## Testing Decisions

- **好測試的定義**：只檢查 `buildTheme(palette)` 輸出的主題物件，也就是使用者實際會拿到的東西，不測試產生器的內部組合方式。重構產生器時，只要輸出不變，測試就不應該失敗。
- **唯一的自動化 seam**：`buildTheme(palette)` 的回傳值。用 Node 內建的 test runner，不引入測試框架。
- **測試項目**：
  1. **結構契約**：每個色值都符合 `#RRGGBB` 或 `#RRGGBBAA`；UI Area 清單裡的每個 key 都存在；底色類 key 不透明；16 個 ANSI 色齊全；`semanticHighlighting` 為 true；`tokenColors` 和 `semanticTokenColors` 不是空的。
  2. **Palette 紀律**：輸出中每個顏色去掉 alpha 後，都必須是某個 Palette 顏色。
  3. **對比度**：用一份前景／背景配對清單計算 WCAG 對比度。主要文字（editor、sideBar、statusBar、tabs、terminal 前景）至少 4.5:1；次要文字（註解、行號、inactive tab）至少 3:1。配對清單是資料，方便擴充。
  4. **打包冒煙測試（CI）**：package 成功；manifest 宣告的主題檔存在，而且能被解析。
- **手動驗證（發布前檢查清單）**：在 Extension Development Host 裡逐一打開 Sample 檔，用 VS Code 和 Cursor 檢查各個 UI Area 與語法高亮；C# 必須兩邊都看過；截圖也從這一步產出。
- **Prior art**：新 repo 目前沒有任何測試。上游 Zed 專案也沒有測試或 build 流程，所以這裡沒有可以沿用的前例。

## Out of Scope

- 淺色、高對比、無斜體等其他變體（v1.0 只有一個深色主題；產生器架構預留了擴充空間，但不實作）。
- 維護 Zed 版本，或從同一份 Palette 產生 Zed 主題。
- 檔案圖示主題（file icon theme）和產品圖示主題。
- 驗證清單以外語言的專屬 scope 調校；這部分等使用者回報再補。
- Cursor 自有、不經由 workbench color key 控制的 UI 樣式。
- 「清單外」的少見 UI Area，例如 notebook、testing、Live Share、SCM graph 的細節顏色。
- 自動化的視覺回歸測試（截圖比對）。
- Changesets、release-please 等自動版本工具。

## Further Notes

- **上架前**：先在 VS Code Marketplace 和 Open VSX 搜尋 `interlinked`，確認沒有撞名。
- **帳號**：在 Marketplace 建立 publisher `xsmbradpitt`。在 Open VSX 用 Eclipse 帳號簽 Publisher Agreement、建立 namespace `xsmbradpitt`，並申請 namespace 驗證。`vsce` 的驗證方式，實作時要查最新的官方文件。
- **Marketplace PAT 最長一年就到期**：要在行事曆設提醒，否則 CI 會發布失敗。
- **`gh` 目前登入的是 `xsmJohnnyDepp`**：建 GitHub repo、開 issue 之前，要先切換到 `xsmBradPitt`。
- 上游 fork（`xsmBradPitt/blade-runner-2049-theme-for-zed`）保持原樣，並與上游同步，作為 Reference Theme 的更新來源。
- 原作 README 寫主色是「amber-orange 和 cyan」，但實際統計的結果，主調是青綠色、琥珀色只是點綴。命名和行銷文字要以實際配色為準。
