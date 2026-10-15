# Interlinked — VS Code / Cursor 深色主題

改作自上游 Zed 主題「Blade Runner 2049」（Takk8IS），發布到 VS Code Marketplace 和 Open VSX（Cursor 從 Open VSX 安裝）。擴充套件 ID：`xsmbradpitt.interlinked-theme`。

## 先讀這些
- `docs/spec/0001-interlinked-v1.md`：v1.0 的完整 spec，所有實作都以這份為準
- `docs/plan/0001-interlinked-v1-implementation.md`：v1.0 的實作計畫（已執行完畢；D1–D11 是計畫層級的決策，要反悔的代價寫在表裡）
- `CONTEXT.md`：名詞表。寫程式、寫文件時，一律使用裡面的名詞（Palette、UI Area、Reference Theme、Sample）
- `docs/adr/`：已定案、不要「順手修正」的決策
- `reference/`：上游 Zed 主題原樣保存，是配色規格。不要修改，也不要打包進 `.vsix`

## 目前狀態（2026-10-15）
- **v1.0.0 已發布到 VS Code Marketplace**（2026-10-15，手動上傳）：<https://marketplace.visualstudio.com/items?itemName=xsmbradpitt.interlinked-theme>。搜尋、下載、安裝都已驗證（安裝來源 `gallery`）。**Open VSX 尚未發布**，所以 Cursor 目前只能裝 GitHub Release 的 `.vsix`（README 已照實說明）。
- 實作已合併：PR #1 → `main`（`d19a54e`），tag `v1.0.0`，GitHub Release 附 `interlinked-theme-1.0.0.vsix`。測試 68 項；`main`、tag `v1.0.0`、PR 分支上的 CI 與 Release workflow 都是 success。
- 目視驗證（計畫 Task 12）：VS Code 的 11 個 Sample 與各 UI Area、Cursor 畫面都已由維護者看過，初步通過。維護者覺得「樣式偏少」，微調留待之後（見下方「待補」）。
- Cursor 的 VS Code 基底版本（2026-10-15 查）：Cursor 3.24.18 → `1.128.0`；`engines.vscode` 是 `^1.75.0`，滿足 D9。
- 本機 git 身分與 `gh` active 帳號都是 `xsmBradPitt`，`gh` 的 token 已含 `workflow` scope（`xsmJohnnyDepp` 保留為第二個帳號）。**注意**：Git Credential Manager 仍快取 `xsmJohnnyDepp`，直接 `git push` 會 403。可用 `gh auth setup-git` 改成走 `gh` 的憑證，或對單次指令臨時指定：`git -c credential.helper= -c 'credential.helper=!"<gh.exe 路徑>" auth git-credential' push ...`。
- 撞名搜尋（2026-10-13）：Open VSX 搜尋 `interlinked` 為 0 筆，namespace `xsmbradpitt` 未被占用；VS Code Marketplace 只有 `GQ.interlink`（`InterLink`），ID 不衝突。
- 尚未建立 `ready-for-agent` label 與 spec issue；打算之後再決定用哪個 skill 把 spec 轉成 ticket。
- Marketplace publisher 已建立（2026-10-14）：ID `xsmbradpitt`、Name `xsmBradPitt`，角色 Owner。建立時沒有 Azure subscription 也成功。
- **發布的認證路線已定案（2026-10-14）：Marketplace 手動上傳**（研究文件的 R1）。維護者沒有 Azure subscription，PAT 路線走不通；全域 PAT 也在 2026-12-01 停用，Marketplace 的無 PAT 發布（`vsce publish --oidc`）後端尚未上線。CI 只做 build、測試、package、發布 Open VSX、建立 GitHub Release；維護者從 GitHub Release 下載同一個 `.vsix` 上傳到 Marketplace。workflow 不放 `VSCE_PAT`，也不加 Marketplace 發布步驟。依據見 `docs/research/0001-marketplace-and-open-vsx-publishing.md` 第 4.0 節，spec 第 113 行已同步。Open VSX 的認證（計畫 D11：第一版用 token `OVSX_PAT`，之後再遷移 trusted publishing）。
- spec 是在上游 fork（`../blade-runner-2049-theme-for-zed`）的 Claude Code session 裡，經過 grilling 訪談後寫出來的。決策已經定案，不要重新討論。
- 底色決策時的 prototype 在另一份 clone 的本機分支 `prototype/background-color`（未推送；這份 clone 沒有）。決策本身已寫進 spec 與 Palette，不依賴它。

## 待辦（依序）
1. ~~使用者檢查文件 → 做第一個 commit。~~ 已完成（2026-10-13）。
2. ~~`gh` 切到 `xsmBradPitt`。~~ 已完成（2026-10-13）。`gh` 原本只登入了 `xsmJohnnyDepp`，`gh auth switch` 無處可切，是用 `gh auth login --scopes workflow` 另外登入 `xsmBradPitt`。
3. ~~建立 GitHub repo `xsmBradPitt/interlinked-theme`。~~ 已完成（2026-10-13，對外操作需先取得使用者確認）。**待做**：把 spec 開成帶有 `ready-for-agent` 標籤的 issue（label 也還沒建）。
4. ~~在 VS Code Marketplace 和 Open VSX 搜尋 `interlinked`，確認沒有撞名。~~ 已完成（2026-10-13），結果見上方「目前狀態」。
5. 使用者本人註冊。~~Marketplace publisher `xsmbradpitt`~~ 已完成（2026-10-14）。**待做**：Open VSX 用 Eclipse 帳號簽 Publisher Agreement，建立 namespace `xsmbradpitt` 並申請驗證。操作步驟見 `docs/research/0001-marketplace-and-open-vsx-publishing.md` 第 5 節；B1–B3（帳號與協議）可先做，B4–B5（token 與建立 namespace）建議接近首次發布再做，因為正式環境的 token 約 90 天到期。
6. ~~依 spec 開始實作。~~ 已完成（2026-10-15）：PR #1 合併進 `main`。底色決策（2026-10-14）選定「疊在黑底上」，chrome `#001313`、tab bar `#002022`，見 spec「底色決策」。
7. 首次發布：~~`vsce package` 產出 `.vsix` → 手動上傳 Marketplace~~ 已完成（2026-10-15）。**待做**：開 Open VSX 的 namespace claim issue → `granted` 後設定 repo secret `OVSX_PAT` 與 repo variable `OPEN_VSX_PUBLISH=true`，重跑 release workflow（`release.yml` 在該變數為 `true` 時才會發布 Open VSX）。順序是硬性的，原因見研究文件第 3 節。發布後把 README 的 Cursor 安裝說明改回 Open VSX 連結。
8. **待補（v1.0.1 起；依下方分類，沒有先後順序）**
   - **補截圖**（README 打包在 `.vsix` 裡，所以補圖要升版並再手動上傳一次 Marketplace）：
     - `images/terminal-git-diff.png`：第一版拍到的 `git diff` 沒有輸出（工作樹乾淨）。重拍請讓它有 diff 輸出，例如 `git diff HEAD~1 -- src/theme/editor.mjs`，並最好同時看得到 ANSI 顏色。
     - `images/cursor.png`：第一版有滑鼠懸停的提示框，露出本機完整路徑與使用者名稱。重拍請移開滑鼠、避免露出本機路徑。
     - 補好後把兩行加回 README 頂部（`![Terminal with git diff](https://raw.githubusercontent.com/xsmBradPitt/interlinked-theme/main/images/terminal-git-diff.png)`、`![Cursor](.../images/cursor.png)`），升 `package.json` 版本與 `CHANGELOG.md`。有測試擋「README 引用本 repo 的圖片必須存在」。
   - **目視發現、尚未解決**：
     - `samples/sample.sh` 第一行 shebang 呈紅色，原因不明（主題只有 `invalid` scope 用 coral，VS Code 的 bash 語法把它標成 `comment.line.number-sign.shell`，使用者設定也沒有覆寫）。用 `Developer: Inspect Editor Tokens and Scopes` 在該行查實際 scope。
     - `samples/sample.ts` 顯示 3 個錯誤而不是預期的 1 個（`node:fs/promises` 無型別、`@sealed` 未定義），拍截圖前改成剛好 1 個刻意錯誤。
     - 維護者的主觀感受：「樣式偏少」。變數與參數與一般文字同色，大面積是同一個米黃色。可考慮的方向：參數／區域變數自成一色、區分 interface／enum／class、把目前只用在括號與 ANSI 的 pink、lavender 派上用場（斜體仍須遵守 spec 故事 54）。
   - **最終審查延後的 Minor**（多數需要目視決定）：
     - `list.focusBackground` 與 `list.activeSelectionBackground` 同值，focus 只靠 `list.focusOutline` 區分。
     - `variable.readonly = mint` 會讓 TS 所有 `const` 變 mint（`src/theme/syntax-semantic.mjs`）。
     - Java 的 `storage.type.java*` 在沒有 language server 時落入 keyword（teal）規則；C# 的 `keyword.type.cs` 同理。
     - `terminal.ansiRed` 是 gold（Reference 的對應），`git diff` 刪除行偏黃；考慮與 coral 對調。
     - `engines.vscode ^1.75.0` 早於 `editorIndentGuide.background1`（1.83）；Cursor 基底 1.128，調到 `^1.83.0` 不會排除它。
     - TextMate `fontStyle` 繼承讓 constructor、decorator、CSS／JSON 屬性名、SQL／Shell 函式規則意外變粗體。
     - 字串引號是 teal（吃到 `punctuation` 規則），內容是 peach。
     - 註解在目前行高亮上只有 2.16:1、選取上 2.07:1；與 spec 故事 12（行高亮要明顯）互相取捨。
     - `inputValidation.warningBackground` 與 `infoBackground` 同值。
     - `release.yml` 把 `steps.pkg.outputs.vsix` 直接內插進 `run:`（值來自 `package.json`，風險低）；`scripts/check-vsix.mjs` 需要 `unzip`。
   - **測試與工具的建議**：`test/syntax-coverage.test.mjs` 目前只做 scope 前綴覆蓋，可為 spec 故事 44、45、48、49 補「各 scope 解析出的顏色兩兩不同」的測試；`test/distinct.test.mjs` 可加 list 四種狀態的配對；`release.yml` 可加一步檢查 `CHANGELOG.md` 有對應版本標題；補 `.vscode/launch.json`（計畫 Task 12 寫「按 F5」，但 repo 裡沒有這個檔，需同步在 `.vscodeignore` 排除 `.vscode/**`）。

## 慣例
- 純 Node ES modules（`.mjs`），不需要執行期依賴；測試用 Node 內建的 test runner。
- 主題裡的每個顏色都必須來自 Palette，不准直接寫 hex。
- 自動化測試只透過 `buildTheme(palette)` 的輸出來檢查。
- 產生物 `themes/interlinked-color-theme.json` 進 git；改了 Palette 或規則後要 `npm run build` 並一起 commit，CI 會檢查同步。
- README 的圖片一律用 https 絕對網址；指向本 repo `images/` 的圖片必須真的存在（有測試擋）。
- 打包一律用 `npx --yes @vscode/vsce package --no-dependencies`；`vsce` 讀檔案系統而不是 `.gitignore`，本機工具資料夾（`.claude/`、`.superpowers/`）要在 `.vscodeignore` 排除。打包後用 `node scripts/check-vsix.mjs <vsix>` 檢查。
- 發布備忘：推 `v*` tag → `release.yml` 建 GitHub Release 並附 `.vsix` → 維護者下載同一個檔案手動上傳 Marketplace。通過驗證後仍要等數分鐘才會在各節點查得到（v1.0.0 實測：發布約 4 分鐘時 `code --install-extension` 回「not found」、頁面 404，約 6 分鐘後正常），剛發布查不到屬正常，稍等重試。市集會重新封裝 `.vsix`，檔案雜湊與 Release 的不同，內容相同。
