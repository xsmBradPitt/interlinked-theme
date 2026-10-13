# Interlinked — VS Code / Cursor 深色主題

改作自上游 Zed 主題「Blade Runner 2049」（Takk8IS），發布到 VS Code Marketplace 和 Open VSX（Cursor 從 Open VSX 安裝）。擴充套件 ID：`xsmbradpitt.interlinked-theme`。

## 先讀這些
- `docs/spec/0001-interlinked-v1.md`：v1.0 的完整 spec，所有實作都以這份為準
- `CONTEXT.md`：名詞表。寫程式、寫文件時，一律使用裡面的名詞（Palette、UI Area、Reference Theme、Sample）
- `docs/adr/`：已定案、不要「順手修正」的決策
- `reference/`：上游 Zed 主題原樣保存，是配色規格。不要修改，也不要打包進 `.vsix`

## 目前狀態（2026-10-13）
- repo 已用 `git init` 建立，**還沒有任何 commit**。只有文件、`LICENSE`、`reference/`，還沒有程式碼。
- spec 是在上游 fork（`../blade-runner-2049-theme-for-zed`）的 Claude Code session 裡，經過 grilling 訪談後寫出來的。決策已經定案，不要重新討論。

## 待辦（依序）
1. 使用者檢查文件 → 做第一個 commit。
2. `gh` 目前登入的是 `xsmJohnnyDepp`。建 GitHub repo、開 issue 之前，要請使用者執行 `! gh auth switch`，切到 `xsmBradPitt`。
3. 建立 GitHub repo `xsmBradPitt/interlinked-theme`（對外操作，要先取得使用者確認），並把 spec 開成帶有 `ready-for-agent` 標籤的 issue。可以考慮先跑 `/setup-matt-pocock-skills`。
4. 在 VS Code Marketplace 和 Open VSX 搜尋 `interlinked`，確認沒有撞名。
5. 使用者本人註冊：Marketplace publisher `xsmbradpitt`；Open VSX 用 Eclipse 帳號簽 Publisher Agreement，建立 namespace `xsmbradpitt` 並申請驗證。
6. 依 spec 開始實作。第一步先用 prototype 目視決定不透明的底色，因為上游的 `background` 帶有 VS Code 不支援的半透明。

## 慣例
- 純 Node ES modules（`.mjs`），不需要執行期依賴；測試用 Node 內建的 test runner。
- 主題裡的每個顏色都必須來自 Palette，不准直接寫 hex。
- 自動化測試只透過 `buildTheme(palette)` 的輸出來檢查。
