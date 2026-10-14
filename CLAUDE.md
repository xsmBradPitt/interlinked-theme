# Interlinked — VS Code / Cursor 深色主題

改作自上游 Zed 主題「Blade Runner 2049」（Takk8IS），發布到 VS Code Marketplace 和 Open VSX（Cursor 從 Open VSX 安裝）。擴充套件 ID：`xsmbradpitt.interlinked-theme`。

## 先讀這些
- `docs/spec/0001-interlinked-v1.md`：v1.0 的完整 spec，所有實作都以這份為準
- `CONTEXT.md`：名詞表。寫程式、寫文件時，一律使用裡面的名詞（Palette、UI Area、Reference Theme、Sample）
- `docs/adr/`：已定案、不要「順手修正」的決策
- `reference/`：上游 Zed 主題原樣保存，是配色規格。不要修改，也不要打包進 `.vsix`

## 目前狀態（2026-10-14）
- GitHub repo 已建立：<https://github.com/xsmBradPitt/interlinked-theme>（public），`main` 已推送。只有文件、`LICENSE`、`reference/`，還沒有程式碼。
- 本機（`--local`）git 身分與 `gh` active 帳號都是 `xsmBradPitt`（`xsmJohnnyDepp` 保留為第二個帳號，用 `gh auth switch` 切換）。
- 撞名搜尋（2026-10-13）：Open VSX 搜尋 `interlinked` 為 0 筆，namespace `xsmbradpitt` 未被占用；VS Code Marketplace 只有 `GQ.interlink`（`InterLink`），ID 不衝突。
- 尚未建立 `ready-for-agent` label 與 spec issue；打算之後再決定用哪個 skill 把 spec 轉成 ticket。
- Marketplace publisher 已建立（2026-10-14）：ID `xsmbradpitt`、Name `xsmBradPitt`，角色 Owner；還沒上傳任何擴充套件。建立時沒有 Azure subscription 也成功。
- **發布的認證路線已定案（2026-10-14）：Marketplace 手動上傳**（研究文件的 R1）。維護者沒有 Azure subscription，PAT 路線走不通；全域 PAT 也在 2026-12-01 停用，Marketplace 的無 PAT 發布（`vsce publish --oidc`）後端尚未上線。CI 只做 build、測試、package、發布 Open VSX、建立 GitHub Release；維護者從 GitHub Release 下載同一個 `.vsix` 上傳到 Marketplace。workflow 不放 `VSCE_PAT`，也不加 Marketplace 發布步驟。依據見 `docs/research/0001-marketplace-and-open-vsx-publishing.md` 第 4.0 節，spec 第 113 行已同步。Open VSX 的認證（token 或 trusted publishing）等實作 workflow 時再決定。
- spec 是在上游 fork（`../blade-runner-2049-theme-for-zed`）的 Claude Code session 裡，經過 grilling 訪談後寫出來的。決策已經定案，不要重新討論。

## 待辦（依序）
1. ~~使用者檢查文件 → 做第一個 commit。~~ 已完成（2026-10-13）。
2. ~~`gh` 切到 `xsmBradPitt`。~~ 已完成（2026-10-13）。`gh` 原本只登入了 `xsmJohnnyDepp`，`gh auth switch` 無處可切，是用 `gh auth login --scopes workflow` 另外登入 `xsmBradPitt`。
3. ~~建立 GitHub repo `xsmBradPitt/interlinked-theme`。~~ 已完成（2026-10-13，對外操作需先取得使用者確認）。**待做**：把 spec 開成帶有 `ready-for-agent` 標籤的 issue（label 也還沒建）。
4. ~~在 VS Code Marketplace 和 Open VSX 搜尋 `interlinked`，確認沒有撞名。~~ 已完成（2026-10-13），結果見上方「目前狀態」。
5. 使用者本人註冊。~~Marketplace publisher `xsmbradpitt`~~ 已完成（2026-10-14）。**待做**：Open VSX 用 Eclipse 帳號簽 Publisher Agreement，建立 namespace `xsmbradpitt` 並申請驗證。操作步驟見 `docs/research/0001-marketplace-and-open-vsx-publishing.md` 第 5 節；B1–B3（帳號與協議）可先做，B4–B5（token 與建立 namespace）建議接近首次發布再做，因為正式環境的 token 約 90 天到期。
6. 依 spec 開始實作。~~第一步先用 prototype 目視決定不透明的底色，因為上游的 `background` 帶有 VS Code 不支援的半透明。~~ 已完成（2026-10-14）：選定「疊在黑底上」，chrome `#001313`、tab bar `#002022`，見 spec「底色決策」。prototype 保存在本機分支 `prototype/background-color`（未推送，不進 `main`）。**待做**：其餘實作（Palette、`buildTheme`、build 腳本、測試、Sample、manifest）。
7. 首次發布（實作完成後）：`vsce package` 產出 `.vsix` → 手動上傳 Marketplace → 開 Open VSX 的 namespace claim issue → `granted` 後發布 Open VSX。順序是硬性的，原因見研究文件第 3 節。

## 慣例
- 純 Node ES modules（`.mjs`），不需要執行期依賴；測試用 Node 內建的 test runner。
- 主題裡的每個顏色都必須來自 Palette，不准直接寫 hex。
- 自動化測試只透過 `buildTheme(palette)` 的輸出來檢查。
