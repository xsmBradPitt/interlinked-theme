# Research: VS Code Marketplace 與 Open VSX 的註冊與發布步驟

> 狀態：研究完成，給維護者（`xsmBradPitt`）照著操作 ｜ 查證日期：2026-10-13
> 相關文件：`docs/spec/0001-interlinked-v1.md` 第 113、142–144 行；名詞見 `CONTEXT.md`。
> 約定：每條事實後面的 `[S#]` 是來源連結，完整清單與「實際讀到的頁面標題」見文末。
> 「需登入後確認」＝ 該畫面要登入才看得到，公開來源無法驗證，文件不編造 UI 文字。
> 命令、網址、scope 名稱逐字抄自來源；範例一律用 `<YOUR_TOKEN>` 佔位符，不含任何真實 token。
> 修訂（2026-10-14）：4.1 的 A1–A3、A6、A7 與 5.1 的 B1 改寫成「每一步都寫明要填的值」；重讀 [S1-publisher]、[S1-publish]、[S13] 的對應段落。標「建議」的值是本文的建議，不是官方規定。

## 摘要

1. **最大風險**：Azure DevOps「全域 PAT」於 **2026-12-01** 全數停用（距查證日約 7 週）[S1][S8][S9]，而 Marketplace 端的無 PAT 發布（`vsce publish --oidc`）後端**尚未上線**（維護者 2026-10-05 親口說明）[S6-benibenj]。spec 的「Marketplace PAT 最長一年」在官方文件讀不到，且 12-01 之後無論多久都失效；對 GitHub Actions 而言，Marketplace 目前沒有官方可長期使用的全自動路徑（Entra ID 路線官方只文件化 Azure Pipelines [S1-entra]），可長期依賴的只有「管理頁手動上傳 `.vsix`」[S1-publish]。
2. **Marketplace**（操作約 30–60 分鐘，估計值；新建 Azure DevOps organization 需 Azure subscription [S11]）：Microsoft 帳號 → 建 publisher `xsmbradpitt` → 首版手動上傳 `.vsix`（或在 12-01 前用 PAT 發布）。
3. **Open VSX**（操作約 20–30 分鐘，估計值；namespace 審核**無官方 SLA**）：Eclipse 帳號 → 簽 Publisher Agreement → token（正式環境設定 **90 天**到期 [S22-prod]）→ `ovsx create-namespace xsmbradpitt` → 在 EclipseFdn/open-vsx.org 開 claim issue；之後可改用 trusted publishing，不再存 token [S18]。
4. **順序有硬性影響**：先在 Marketplace 發布第一版（`package.json` 帶 `repository`），再申請 Open VSX namespace ownership，`granted` 之後 CI 才能正常發布到 Open VSX；否則第一版會卡在「under review」[S21][S22-tpl][S20-scanner]。
5. **只能本人做**：所有登入、同意條款、建 token、開 claim issue、註冊 trusted publisher；CI 與 Claude 只負責打包、檢查、workflow 與文件。

---

## 1. 目的與範圍

- 目的：讓維護者從零開始，到「CI 在 `v*` tag 觸發後，用同一個 `.vsix` 先後發布到 VS Code Marketplace 與 Open VSX」。已定案的前提（擴充套件 ID `xsmbradpitt.interlinked-theme`、CI 只用 `vsce` 與 `ovsx` 官方 CLI）不在此討論。
- 本文只整理官方來源（VS Code 文件、learn.microsoft.com、vsce / Open VSX 官方 repo 與 wiki、open-vsx.org、eclipse.org）。非官方線索（社群 issue 中的使用者回報）一律明確標為「線索」，不當作依據。
- 本文不執行任何會與服務互動的指令；所有命令是給維護者本人在自己的環境執行。

---

## 2. 誰做什麼

| 步驟 | 只有維護者本人 | CI 可做 | Claude 可代跑（需維護者明確授權） |
|---|---|---|---|
| 登入 Microsoft 帳號、進 Marketplace 管理頁 | 是（登入、可能的 MFA） | 否 | 否 |
| 建立 Azure subscription / Azure DevOps organization | 是（帳務、同意條款） | 否 | 否 |
| 建立 PAT 或 Entra ID 身分 | 是（token 只顯示一次 [S9]） | 否 | 否，不經手 token 值 |
| 建立 Marketplace publisher、同意 Marketplace Publisher Agreement | 是 [S13] | 否 | 否 |
| 手動上傳 `.vsix` 到管理頁 | 是（瀏覽器） | 否 | 可先產出 `.vsix`（`vsce package` 不連網） |
| 註冊 Eclipse 帳號（email、ToU、captcha）[S26] | 是 | 否 | 否 |
| 以 GitHub 登入 open-vsx.org、「Log in with Eclipse」、簽 Publisher Agreement [S16] | 是 | 否 | 否 |
| 產生 Open VSX token | 是（值只顯示一次 [S16]） | 否 | 否 |
| 把 token 存進 GitHub repo secrets | 建議維護者自己做（先用 `gh auth status` 確認 active 帳號是 `xsmBradPitt`；以 `gh secret set <NAME>` 從標準輸入貼上值） | 否 | 不建議，避免 token 經過對話 |
| `ovsx create-namespace` | 是（一次性，本機執行） | 否 | 否 |
| 開 namespace claim issue [S22-tpl] | 是（公開動作） | 否 | 可起草內容 |
| 註冊 Open VSX trusted publisher [S18] | 是（需 owner 身分、網頁操作） | 否 | 否 |
| Domain verification（Marketplace，選用）[S1-verify] | 是（DNS） | 否 | 否 |
| 打包 `.vsix`、跑測試、檢查 manifest | 否 | 是 | 是 |
| 兩個市集的 `publish`、建立 GitHub Release | 否 | 是（tag 觸發） | 不建議（會與服務互動） |
| 撰寫 workflow、檢查清單、claim issue 文字 | 否 | 否 | 是 |
| 行事曆提醒（token 到期、2026-12-01） | 是 | 否 | 否 |

---

## 3. 建議順序與首次發布策略

以下順序由官方文件的限制推得，不是任意排列：

1. **確認名稱不撞**（spec 待辦）：Marketplace 要求 extension `name` 與 `displayName` 都獨一無二 [S1-faq]；Open VSX 發布時會做 namespace 相似度檢查 [S16]。
2. **Marketplace 先上**：建 publisher → 發布第一版（`package.json` 要有 `repository`，指向 `https://github.com/xsmBradPitt/interlinked-theme`）。原因：Open VSX claim 的 Option 1 要求「Marketplace 上已發布、且 `package.json` 指定了 repo 的擴充套件」[S22-tpl]；官方 wiki 也寫明 repo 組織與申請者的 GitHub ID 相符時「nothing more is required」[S21-ns]。
3. **Open VSX 帳號與 namespace**（可與第 2 步並行）：Eclipse 帳號 → Publisher Agreement → token → `create-namespace`。
4. **開 claim issue，等 `granted`**。原因：只要擴充套件（`namespace.extension`）已存在於 Marketplace，你就必須先擁有 Open VSX namespace 的 owner 權限才能發布，否則停在「under review」[S21][S17]；正式環境的 `namespace-ownership-check` 掃描器為 enabled 且 enforced [S22-prod][S20-scanner]。
5. **第一次發布到 Open VSX**：`ovsx publish <同一個 .vsix>`（用第 3 步的 token）。
6. **註冊 trusted publisher**（需 owner、且擴充套件至少有一個 active 版本 [S18]），之後 CI 可移除 `OVSX_PAT`。
7. **CI 全自動**：從下一個 tag 起，tag → 打包 → Marketplace → Open VSX → GitHub Release。

首次 `v1.0.0` tag 建議：workflow 先只跑「打包 + GitHub Release」，兩個市集的第一版由維護者手動送出；claim 通過、Marketplace 認證路線確定之後，再打開 CI 的發布步驟。這樣不會因為 ownership 未核准或 PAT 問題讓第一次 tag 半途失敗（重跑時兩個 CLI 都有 `--skip-duplicate` 可避免「版本已存在」錯誤 [S5-main][S19-main]）。

> 原始碼層面的推論（**非文件保證，不建議依賴**）：Open VSX 掃描器只在「Marketplace 上已有該 publisher 的擴充套件」時才會攔，且 `check-active-extensions: false` 表示已 active 的擴充套件不再檢查 [S20-scanner][S22-prod]。換言之理論上可以先發 Open VSX 再發 Marketplace，但這與官方 wiki 的規則精神相反，也讓 claim 失去 Option 1 的證據。

---

## 4. 平台 A：VS Code Marketplace

### 4.0 認證路線（先選路線，因為 PAT 即將退役）

| 路線 | 2026-10-13 的狀態 | 需要什麼 | CI 要存的 secret | 備註 |
|---|---|---|---|---|
| **R1 管理頁手動上傳 `.vsix`** | 官方支援 [S1-publish] | Microsoft 帳號、publisher | 無 | 每版需人工一次；CI 只產 `.vsix` 與 GitHub Release |
| **R2 PAT + `VSCE_PAT`** | 可用到 2026-12-01，之後全域 PAT 全數失效 [S1][S8][S9] | Azure DevOps organization（新建需 Azure subscription [S11]） | `VSCE_PAT` | 官方 CI 範例仍是這條 [S2-gha]；vsce 預期 PAT 是「all accessible accounts」[S5-main] |
| **R3 Microsoft Entra ID + `vsce publish --azure-credential`** | 官方推薦 [S12]，但文件只示範 Azure Pipelines [S1-entra]；GitHub Actions 版本**官方未文件化** | Azure subscription、managed identity、federated credential，並把該身分加進 publisher 為 Contributor [S1-entra] | 無長期 secret | vsce 需 >= v2.26.1 [S1-entra]；社群指南見 [S15-1422]（線索，非官方） |
| **R4 `vsce publish --oidc`（trusted publishing）** | README 已寫 [S4-oidc]，但 **Marketplace 後端尚未支援** [S6-benibenj]；無設定頁、無時程 | GitHub Actions `id-token: write`、Marketplace 端 trusted publishing policy（尚不存在） | 無 | 追蹤 [S6]、[S15-2121] |

**建議**：基線採 R1（不依賴任何即將失效或未上線的東西）；若要 CI 全自動，在 R3 與 R4 之間二選一，決策依據是 R4 是否在 12-01 前上線（目前未知）。PAT（R2）只適合當短期橋接。

### 4.1 步驟

**先看你要走哪條路線（A1–A9 不是每個人都要全做）：**

| 路線 | 要做的步驟 | 需要 Azure subscription？ |
|---|---|---|
| **R1 手動上傳（沒有 Azure subscription 就走這條）** | A1 → A2 → A7（R1）；A3–A6 跳過；A8 選用 | 否（第 4.0 節表格）。A2 也不要求：2026-10-14 維護者在沒有 Azure subscription 的情況下建立 publisher 成功 |
| R2 PAT | A1 → A2 → A3 → A4 → A5 → A6 → A7（R2） | 是：A3 新建 organization 需要 [S11] |
| R3 Entra ID | A1 → A2 → A3 → A9 | 是 |
| R4 `--oidc` | 後端尚未支援，無步驟可做 | — |

**A1. 備妥 Microsoft 帳號**

- 準備一個 Microsoft 帳號。你用哪個帳號建立 publisher，之後就用同一個帳號管理它，請選會長期使用的。
- 走 R2（PAT）時，建立 PAT（A4）與登入管理頁建立 publisher（A2）必須是**同一個**帳號。官方原文：「Log in with the same Microsoft account you used to create the Personal Access Token」[S1-publisher]。
- 做完後：能開啟 <https://marketplace.visualstudio.com/manage> 並看到自己已登入（畫面需登入後確認）。
- 未能驗證：能否直接用 GitHub 帳號登入管理頁（見第 10 節）。

**A2. 建立 publisher**（R1–R4 都需要）

建立畫面有兩個要填的欄位（ID 與 Name），其餘為選填。先看要填什麼：

| 畫面欄位 | 填什麼 | 說明 |
|---|---|---|
| **ID** | `xsmbradpitt`（全小寫） | 官方：「the unique identifier for your publisher in Marketplace that will be used in your extension URLs」，且「ID cannot be changed once created」[S1-publisher]。它是擴充套件 ID 的前半段（`xsmbradpitt.interlinked-theme`），也是 `package.json` 的 `publisher` 值 |
| **Name** | `xsmBradPitt`（建議） | 官方：「the unique name of your publisher that will be displayed in Marketplace with your extensions. This can be your company or brand name」[S1-publisher]。這是 Marketplace 顯示在每個擴充套件旁的**發布者名稱**，不是擴充套件的名稱（擴充套件名稱由 `package.json` 的 `name` / `displayName` 決定） |
| 其餘欄位 | 留空 | 官方：「Optionally, fill out the rest of the fields」[S1-publisher]；官方文字沒有列出這些欄位的名稱（只有截圖） |

Name 建議填 `xsmBradPitt` 的理由：publisher 是你的發布者身分，之後別的主題也掛在它底下，所以不用主題名；與 ID、GitHub 帳號用同一個名字，之後做 Open VSX 驗證（5.2）時最容易對照。想改成別的公司名或品牌名也可以；已知的條件是「唯一」與「16 字元以內」（見下方命名限制，伺服器端是否另有限制未能驗證）。

步驟：

1. 用 A1 的帳號開啟 <https://marketplace.visualstudio.com/manage/createpublisher?managePageRedirect=true>（Azure DevOps 文件給的建立入口 [S13]）並登入。若停在管理頁而不是建立畫面，點左側窗格的 **Create publisher**（VS Code 文件 [S1-publisher]；Azure DevOps 文件寫成 **+ Create a publisher** [S13]，實際按鈕文字需登入後確認）。
2. **先填 Name**：`xsmBradPitt`。Azure DevOps 文件寫「the ID field autofills based on your entry」[S13]，所以 Name 填了之後 ID 才會被自動帶入。
3. **再檢查 ID**：自動帶入的值若不是 `xsmbradpitt`，手動改成 `xsmbradpitt`（全小寫）。ID 建立後改不了，按 **Create** 前再核對一次。
4. 其餘欄位留空。
5. 閱讀 Marketplace Publisher Agreement，點 **Create** [S13][S1-publisher]。（[S13] 寫的是 Azure DevOps 擴充套件，但入口與表單同為 Visual Studio Marketplace 的 publisher 管理頁，與 [S1-publisher] 的步驟合併屬推論。）

- 做完後（2026-10-14 實際畫面）：左側窗格列出 `xsmBradPitt`，右側標 **Owner**；右側標題為 `xsmBradPitt (xsmbradpitt)`，即 Name（ID）；分頁為 **Extensions**、**Details**、**Members**，旁邊有 **+ New extension** 下拉選單；Extensions 分頁是空的，顯示「It's lonely here! Upload an extension for this publisher.」與藍色的 **+ New extension** 按鈕。左側窗格另有 **+ Create publisher**（可再建別的 publisher，不需要）。走 R2 的話，可再用 A5 的 `verify-pat` 確認 PAT 對得上這個 publisher。
- 命名限制：官方文件只說 ID 與 Name 必須唯一、ID 不可改 [S1-publisher]；Azure DevOps 文件另有備註「Ensure your publisher name is within 16 characters for multibyte characters」[S13]（語意不明確；`xsmBradPitt` 為 11 字元，兩種解讀都符合）。`vsce` 在本機驗證 `publisher` 與 `name` 的格式為 `/^[a-z0-9][a-z0-9\-]*$/i` [S5-validation]，`xsmbradpitt` 符合；伺服器端是否有其他限制：未能驗證。
- 填錯時：
  - ID 填錯：官方只說「cannot be changed」，補救方式官方文件未說明；所以按 **Create** 前再核對。
  - Name 被占用：官方只說 Name 必須唯一，錯誤文字未能驗證。換一個 16 字元以內的名稱即可，ID 維持 `xsmbradpitt`。
  - ID 被占用：擴充套件 ID 已定案為 `xsmbradpitt.interlinked-theme`，遇到時先停下來回報，不要自行換 ID。
  - 之後想改 Name：做過 domain verification（A8）的話，改 Name 會撤銷 verified badge [S1-verify]；沒做過則不受影響。改 Name 的畫面位置需登入後確認。
- 查證註記：2026-10-14 對 <https://marketplace.visualstudio.com/publishers/xsmbradpitt> 回 HTTP 404。這只代表該公開頁不存在，不能證明 ID 或 Name 沒被占用，以 **Create** 的結果為準。

**A3.（僅 R2、R3）建立 Azure DevOps organization**

已經有 Azure DevOps organization 的話跳過這步（VS Code 文件 [S1-pat]）。**沒有 Azure subscription 的話也跳過這步，改走 R1**（見 4.1 開頭的路線表）。沒有 organization 但有 subscription 的話：

1. 前提：要有一個有效的 Azure subscription。官方原文：「You need an active Azure subscription to create new organizations. Existing organizations and free tier limits aren't affected.」[S11]（2026-10-14 重讀）。沒有 subscription 就無法完成這步。
2. 開 <https://dev.azure.com> 登入。可用 personal Microsoft account、GitHub account 或 work/school account [S11]。
3. 點 **New organization**，依序填 [S11]：
   - organization 名稱：自訂（建議 `xsmbradpitt`；建議值，非官方規定）。官方規則：只能用英文字母、數字、連字號，以字母或數字開頭與結尾，少於 50 字元；違規會顯示「VS850015: The specified name is not allowed to be used」[S11]
   - hosting geography：依所在地選（官方步驟只列出此欄位，沒有指定選哪個）
   - 計費用的 Azure subscription：選前面備妥的那個
4. 點 **Continue** [S11]。
- 做完後：能登入 `https://dev.azure.com/{Your_Organization}` [S11]。
- 未能驗證：取得 Azure subscription 是否一定要信用卡（社群使用者回報需要 [S15-1926]，屬線索）。

**A4.（僅 R2）建立 PAT**

依官方步驟 [S1-pat]：

1. 進 Azure DevOps portal → 選 organization → 個人頭像旁 User settings → **Personal access tokens** → **New Token**。
2. 設定：
   - Name：任意（建議 `interlinked-vsce`）
   - Organization：**All accessible organizations**
   - Expiration (optional)：建議選距今 30 天內的日期（建議值，非官方規定）。理由：全域 PAT 在 2026-12-01 一律失效 [S8]，PAT 只用在首次發布與 12-01 前的過渡，不需要放長（最長能設多久，官方文件未載明，見下方「到期」）
   - Scopes：**Custom defined** → 點 **Show all scopes** → 捲到 **Marketplace** → 勾 **Manage**
3. 點 **Create**，複製 token 存進密碼管理器。
- 做完後：畫面顯示新 token，之後不再顯示 [S1-pat][S9]。
- **必須是「All accessible organizations」**：選特定 organization 或 scope 不是 `Marketplace (Manage)` 會得到 403 / 401 [S1-faq]；`vsce` 遇到 `Unauthorized(401)` 會提示「Be sure to use a Personal Access Token which has access to **all accessible accounts**」[S5-main]。
- **官方文件互相矛盾**：Azure DevOps 的 PAT 文件說「Create only organization-scoped PATs. Global PATs stop working on December 1, 2026」[S9]，與上面 VS Code 文件與 `vsce` 的要求衝突；Marketplace 是否接受 organization-scoped PAT，官方 issue 已有人提問、尚無答覆 [S15-2121]。目前畫面是否仍提供「All accessible organizations」與「Marketplace」scope：需登入後確認（社群曾回報找不到 Marketplace scope [S15-1926]，屬線索）。
- **到期**：PAT 的最長有效期限，官方 PAT 文件與 REST API 文件都沒有寫出數字 [S9][S14]；管理員可另設「maximum lifespan」政策，預設關閉 [S10]。因此 spec 的「最長一年」**未能驗證**。無論你設多久，全域 PAT 在 2026-12-01 一律失效 [S8]。
- 到期通知：Azure DevOps 會在建立時與到期前寄通知 [S9]。

**A5.（僅 R2）驗證 PAT 與 publisher 對得上**

```bash
# 維護者本機執行；用安全輸入，不要把 token 寫進 shell history
read -rs VSCE_PAT && export VSCE_PAT
npx @vscode/vsce verify-pat xsmbradpitt
```

- 預期輸出：`The Personal Access Token verification succeeded for the publisher 'xsmbradpitt'.` [S5-store]（VS Code 文件的 `vsce login <publisher id>` 範例輸出為同一句 [S1-publisher]）。
- `vsce login <publisher id>` 會把 PAT 存進本機憑證庫（Linux 用 Secret Service，可用 `VSCE_STORE=file` 改回檔案儲存）[S4]；CI 不需要 login，只要提供 `VSCE_PAT` 環境變數 [S2]。
- 驗證邏輯：呼叫者在該 publisher 上只要有 Creator / Owner / Contributor / Reader 任一角色即回 200，否則 403 [S5-store]。

**A6. 存進 GitHub repo secret（僅 R2）**

名稱固定為 `VSCE_PAT`（`vsce publish` 預設讀這個環境變數 [S2][S5-main]）。在維護者本機執行：

```bash
gh auth status                                          # 確認 active 帳號是 xsmBradPitt
gh secret set VSCE_PAT --repo xsmBradPitt/interlinked-theme
```

- 第二行沒帶 `--body` 時，`gh` 會出現互動提示讓你貼上 token，值不會進 shell history（`gh secret set --help` 的說明：「reads from standard input if not specified」，2026-10-14 本機查證）。
- 想改放 GitHub environment secrets（第 6 節建議）：加 `--env <environment 名稱>`。
- 做完後：`gh secret list --repo xsmBradPitt/interlinked-theme` 的清單裡有 `VSCE_PAT`。
- CI 中以 `env: VSCE_PAT: ${{ secrets.VSCE_PAT }}` 傳入 [S2-gha]；GitHub 自身的 secrets 文件不在本次來源範圍。

**A7. 發布第一版**

- **R1（手動）**：
  1. 在專案根目錄產出 `.vsix`：`npx @vscode/vsce package`。產物在專案根目錄，檔名形如 `interlinked-theme-<version>.vsix`（官方範例為 `my-extension-0.0.1.vsix`）[S1]。
  2. 開 <https://marketplace.visualstudio.com/manage>，用 A1 的帳號登入，選到 publisher `xsmbradpitt`（Azure DevOps 文件：從頁面上方的下拉選單選 publisher [S13]）。
  3. 點 publisher 頁面的 **+ New extension**（2026-10-14 實際畫面：頁籤列上的下拉選單，Extensions 分頁為空時中央另有同名的藍色按鈕），在下拉選單選 VS Code 對應的項目，再選取步驟 1 的 `.vsix`。VS Code 文件只寫「Upload that file on the … management page」並附截圖，沒有寫按鈕名稱 [S1-publish]；Azure DevOps 文件的對應操作是 **New extension** → 選擴充套件類型 → 拖放或選取 `.vsix` → **Upload** [S13]，與實際畫面的入口名稱一致。下拉選單內的項目名稱尚未觀察（2026-10-14 的畫面沒有展開）。
  4. 上傳後等待驗證完成。Azure DevOps 文件寫明 Marketplace 對每個新增與更新的套件做病毒掃描，掃描通過前不會公開 [S13]；該段針對 Azure DevOps 擴充套件，VS Code 擴充套件是否相同屬推論。
- **R2（PAT）**：`npx @vscode/vsce publish --packagePath <file>.vsix`（`--packagePath` 用法見 [S1] 的 platform-specific 段落；環境變數 `VSCE_PAT`）。
- 做完後 CLI 會印出 `Publishing '<publisher>.<name> v<version>'...`、`Extension URL (might take a few minutes): …`、`Hub URL: …`、`Published … .` [S5-publish]。擴充套件頁面可能要幾分鐘才出現 [S5-publish]。
- 重跑保護：`vsce publish --skip-duplicate`，版本已存在時只印 `Version <x> is already published. Skipping publish.` 並成功結束 [S5-publish]。

**A8.（選用）Domain verification**

- **不是發布的必要條件**；它的作用是在 publisher 名稱旁加 verified badge [S1-verify]。
- 條件：publisher 在 Marketplace 上至少有一個擴充套件滿 6 個月，且網域註冊也滿 6 個月 [S1-verify]。網域必須是你能改 DNS（加 TXT）的非子網域，使用 HTTPS，且對 HEAD 請求回 200；`{subdomain}.github.io` 這類子網域不合格 [S1-eligible]。
- 流程：管理頁 → publisher → **Details** 分頁 → **Verified domain** 輸入網域 → **Save** → **Verify** → 照指示加 TXT → 再按 **Verify**；Marketplace 團隊 5 個工作天內回覆 [S1-verify]。
- 之後若修改 publisher 顯示名稱，badge 會被撤銷 [S1-verify]。
- 對本專案：維護者是否擁有符合條件的網域，未能驗證；Open VSX 的 namespace 驗證與此無關（見第 5 節）。

**A9.（若選 R3）Entra ID 路線的官方八步驟摘要**（官方原文只針對 Azure Pipelines，GitHub Actions 版需自行對應，官方未文件化）[S1-entra]

1. Azure DevOps：Project Settings → Service Connections → 建 **Azure Resource Manager**，選 **Workload Identity Federation (manual)**，先存為草稿。
2. Azure：建 **user-assigned managed identity**，指派 **Reader**，記下 Client ID、Tenant ID、Subscription。
3. 在 managed identity 加 federated credential，與 Azure DevOps 互換 issuer / subject 與 client ID / tenant ID / subscription，Azure DevOps 端按 **Verify and save**。
4. 把 pipeline 對該 service connection 的存取授權。
5. 一次性：以 `AzureCLI@2` 跑 `az rest -u https://app.vssps.visualstudio.com/_apis/profile/profiles/me --resource <官方文件所列的 resource ID>`，從輸出 JSON 取 `id`（managed identity resource ID）。
6. 到 Marketplace，把該身分以 resource ID 加為 publisher 成員，角色 **Contributor**。
7. pipeline 取代 PAT 驗證。
8. `vsce publish --azure-credential`（vsce >= v2.26.1）。

補充（原始碼）：`--azure-credential` 依序嘗試 `EnvironmentCredential`、`AzureCliCredential`、`ManagedIdentityCredential`、`AzurePowerShellCredential`、`AzureDeveloperCliCredential` [S5-auth]；若環境裡同時還有 `VSCE_PAT`，`getPAT` 會**先用 PAT**、不會走 Azure credential [S5-publish][S5-main]，遷移時務必刪掉舊的 `VSCE_PAT`。

---

## 5. 平台 B：Open VSX

> 註：官方 repo 已從 `eclipse/openvsx` 改名為 `eclipse-openvsx/openvsx`，舊網址會轉址 [S19]；wiki 內仍有舊連結。

### 5.1 步驟

**B1. 建立 Eclipse 帳號**

網址：<https://accounts.eclipse.org/user/register> [S26]。表單欄位為 2026-10-13 讀到的 [S26]，每欄填法如下：

| 欄位 | 填什麼 |
|---|---|
| Email address | 你收得到信的信箱（驗證信相關細節需登入後確認） |
| Username | 自訂。Open VSX 比對的是 profile 裡另外的 GitHub username 設定，不是這一欄 [S20-oauth] |
| First name、Last name | 依實際資料 |
| 就業狀態（四選一：Work for an Eclipse Member Organization / Student / Self-employed / Other） | 依實際情況選；官方來源沒有說這欄會影響發布（未能驗證） |
| Eclipse Member Organization | 只在上一欄選 Work for an Eclipse Member Organization 時才會出現 |
| New Password、Confirm new password | 自訂，兩欄相同 |
| Country | 依實際資料 |
| 「I agree to the Eclipse.org Terms of Use, Privacy Policy and Code of Conduct.」 | **必勾**，否則無法送出 |
| newsletter | 選填，不勾也能完成 |
| captcha | 照畫面完成 |

- **GitHub username 要另外補填**：Open VSX wiki 寫「fill in the _GitHub Username_ field … use exactly the same GitHub account as when you log in to open-vsx.org」[S16]；FAQ 寫「include your GitHub username in the account information」[S24]。但上面的註冊表單**沒有這個欄位**（wiki 的描述已過時）。做法：註冊並登入 accounts.eclipse.org 後，進入編輯個人資料的頁面（頁面名稱與欄位位置需登入後確認），在 GitHub username 欄填 `xsmBradPitt`。找不到欄位時，B3 點 **Log in with Eclipse** 會出現「Your Eclipse profile is missing a GitHub username.」[S20-oauth]，那就代表這欄還沒補。
- 這個值必須與你登入 open-vsx.org 的 GitHub 帳號（`xsmBradPitt`）相同，比對不分大小寫；缺值時錯誤為「Your Eclipse profile is missing a GitHub username.」，不符時為「The GitHub username setting in your Eclipse profile (…) does not match your GitHub authentication (…).」[S20-oauth]。
- 不需要簽 Eclipse Contributor Agreement（ECA）[S16][S24]。
- 做完後：能登入 accounts.eclipse.org（email 驗證等細節需登入後確認）。

**B2. 以 GitHub 登入 open-vsx.org**

- 開 <https://open-vsx.org>，右上角帳號圖示 → 以 GitHub 授權 [S16]。確認瀏覽器此刻登入的是 `xsmBradPitt` 而不是其他 GitHub 帳號。
- 必須先用 GitHub 登入，才能連結 Eclipse（否則「Please log in with GitHub before connecting your Eclipse account.」[S20-oauth]）。

**B3. 連結 Eclipse 並簽 Publisher Agreement**

1. 開 <https://open-vsx.org/user-settings/profile>（頭像 → _Settings_）[S16]。
2. 點 **Log in with Eclipse**，授權存取 eclipse.org 帳號 [S16]。
3. 成功後會出現 **Show Publisher Agreement** 按鈕；讀到底，點 **Agree** [S16]。
- 做完後：profile 頁顯示「Publisher Agreement signed」與「You signed the … Publisher Agreement …」及時間 [S20-agreement-ui]（v1.2.0 原始碼的字串）。
- 協議文件：Eclipse Foundation Open VSX Publisher Agreement，查證時為 Version 1.1 – September 2025 [S25]。協議版本更新後舊簽署會變 outdated，發布會被擋：「Your Publisher Agreement with the Eclipse Foundation is outdated (version …). The current version is ….」[S20-eclipse]。
- 沒簽就發布的錯誤：「You must sign a Publisher Agreement with the Eclipse Foundation before publishing any extension.」[S20-eclipse]。

**B4. 建立 access token**

1. 開 <https://open-vsx.org/user-settings/tokens>（頭像 → _Settings_ → _Access Tokens_）[S16]。
2. 點 _Generate New Token_（wiki 寫法 [S16]；v1.2.0 原始碼按鈕字串為 `Generate new token` [S20-token-ui]，以畫面為準），輸入說明（建議 `interlinked-ci`，每個環境一個 token [S16]），點 _Generate Token_。
3. 複製值存進密碼管理器；關閉對話框後不再顯示，遺失只能刪掉重建 [S16]。
- 到期：wiki 說「An access token can be used … until it is deleted」[S16]，但**正式環境設定檔寫 `expiration: P90D`（90 天）、到期前 `notification: P7D` 寄信、`send-expired-mail: true`** [S22-prod]，伺服器預設值也是 `P90D`（設為 `0` 才不過期）[S20-config]。以 tokens 頁每筆的 **Expires** 欄為準（v1.2.0 原始碼顯示 `Expires <時間>`，沒有到期日時顯示 `never`）[S20-tokens-ui]。（設定檔頂部註解自陳數值需對照實際環境確認 [S22-prod]，故標為「以畫面為準」。）

**B5. 建立 namespace**

```bash
read -rs OVSX_PAT && export OVSX_PAT
npx ovsx create-namespace xsmbradpitt
```

- 用法：`ovsx create-namespace <name>`，「The name must correspond to the `publisher` of your extension」；token 以 `-p` / `--pat` 或環境變數 `OVSX_PAT` 提供 [S19][S19-util]。wiki 的寫法是 `npx ovsx create-namespace <name> -p <token>` [S16]。
- 名稱規則：伺服器端 regex 為 `[\w\-\+\$~]+` [S20-validator]（`xsmbradpitt` 符合）。
- 若已存在：回 `Namespace already exists: xsmbradpitt` [S20-registry]；此時你多半無法使用該 namespace [S21]。
- **建立 namespace 不會讓你成為 verified owner**，只是 contributor [S16][S17]。
- 大小寫：namespace 在 UI 上「exactly as it has been created」[S21-guide]；trusted publishing 要求 `package.json` 的 `publisher` 與 namespace 大小寫完全一致 [S18]。請明確用全小寫 `xsmbradpitt` 建立，不要靠網頁上傳時自動建立（wiki 說自動建立的 namespace 對應你的 GitHub ID [S21]，可能帶大寫 `xsmBradPitt`；實際行為未能驗證）。
- 做完後：`ovsx` 無錯誤結束；成功訊息文字未能驗證。可用 `npx ovsx verify-pat xsmbradpitt` 確認 token 能發布到該 namespace [S19-main]。

**B6. 申請 namespace 擁有權驗證（verified）** —— 見 5.2。

**B7. 第一次發布**

```bash
npx ovsx publish interlinked-theme-<version>.vsix   # 讀取環境變數 OVSX_PAT
```

- `ovsx publish <file>` 發布已打包的檔案；`ovsx publish` 不帶檔案則先用 `vsce` 打包 [S19]。**Node.js 需 >= 22**（`ovsx` 與 `@vscode/vsce` 的 npm engines 皆為 22 以上 [S27-ovsx][S27-vsce]）。
- 發布時的自動檢查：secret detection、blocklist、namespace similarity，另有「Match with VS Code Marketplace Extension」（檢查 `namespace.extension` 是否對應到 Marketplace 的 `publisher.extension`）[S16][S21]。
- 做完後：擴充套件先在你的 settings 以「Deactivated」狀態出現，約 5–10 秒後轉為 active；大型擴充套件或伺服器忙碌時更久 [S21]。
- 若命中掃描：被拒絕並附原因，或進入「under review」；與 Marketplace 同名但你不是 owner 也會停在「under review」，需到 EclipseFdn/open-vsx.org 開 issue [S21]。
- 重跑保護：`--skip-duplicate`（「Fail silently if version already exists on the marketplace」）[S19-main]。

**B8.（建議）改用 trusted publishing，移除 token**

先決條件（缺一不可）[S18]：

- 你是該 namespace 的 **owner**（contributor 不夠）。
- 已簽 Publisher Agreement。
- 擴充套件已存在且至少有一個 **active 版本**（第一版必須先用 token 發布）。
- `package.json` 的 `publisher` 與 namespace 大小寫完全一致（已知限制 [S18]，issue #2279）。

註冊：Settings → **Trusted Publishers**（`/user-settings/trusted-publishers`）→ 選 namespace → 選 provider（GitHub）→ 填 [S18]：

| 欄位 | 意義 | 本專案的值 |
|---|---|---|
| Organization or User name | repo 擁有者 | `xsmBradPitt` |
| Repository name | repo 名稱 | `interlinked-theme` |
| Workflow filename | 只填檔名，必須在 `.github/workflows/` | 實作 workflow 時決定 |
| Environment name | 選填；填了就只信任該 environment 的執行 | 建議設一個，並加 required reviewers [S18] |

- workflow 需要 `permissions: { contents: read, id-token: write }`，發布用 `npx ovsx publish --trusted-publishing` [S18][S19]。與已打包檔案併用 `npx ovsx publish <file> --trusted-publishing`，由原始碼推得可行（namespace 與 extension 取自 `.vsix` 的 manifest [S19-publish]），官方 README 只示範不帶檔案的形式。
- 若同時給了 `OVSX_PAT`，PAT 優先 [S18][S19]；要走 trusted publishing 就不要在該步驟傳 `OVSX_PAT`。
- 簽發的 token 只活 5 分鐘（正式環境 `PT5M` [S22-prod]），且只能發布那一個擴充套件 [S18]。
- 註冊與 branch / tag 無關：任何 ref 只要跑了註冊的 workflow 檔就被信任；要限制 tag 觸發，靠 workflow 自己的 `on:`，要更嚴就綁 environment [S18]。
- 註冊不能編輯，只能刪掉重建；註冊者不再是 owner 時會被自動刪除 [S18]。
- 正式站是否啟用：`https://open-vsx.org/api/version` 回傳含 `trustedPublishingAudience` 且版本 `v1.2.0` [S23]，設定檔為 `enabled: true` [S22-prod]；設定頁實際外觀需登入後確認。

### 5.2 Namespace 擁有權驗證（verified badge）

| 問題 | 答案 |
|---|---|
| 在哪裡提 | <https://github.com/EclipseFdn/open-vsx.org/issues/new/choose>，選 **Claim namespace ownership**（標題預設「Claiming namespace [name]」，標籤 `namespace`、`operations`）[S22-tpl][S22-readme] |
| 誰審 | Open VSX 管理員（Eclipse Foundation 營運）；審核過程公開在 issue 裡，處理後標 `granted` 或 `denied`；內部作業程序不公開 [S21-guide] |
| 多久 | 官方文件未訂 SLA：未能驗證 |
| 前置條件 | 已登入過 open-vsx.org、已簽 Publisher Agreement [S21-guide]；namespace 尚無 owner；申請者 GitHub ID 至少 12 個月歷史 [S22-tpl][S21-ns]（`xsmBradPitt` 帳號建立於 2025-04-22 [S28]，已滿足）；namespace 與其他 namespace 有足夠差異 [S21-ns] |
| 要附什麼 | 依「namespace 是否同時是 Marketplace publisher」分四種 Option，見下 |
| 結果 | 取得 owner 後該 namespace 變 verified，可管理成員、註冊 trusted publisher [S17][S18] |
| 未驗證時使用者看到什麼 | 擴充套件頁有警告圖示（title「Unverified publisher」）與橫幅：「This version of the “…” extension was published by …. That user account is not a verified publisher of the namespace “…” of this extension.」[S20-banner]；wiki 敘述為「shown as _unverified_ with a warning icon and an explanatory banner」[S17]。驗證後顯示盾牌圖示（「Verified publisher」）[S17] |

**四種 Option（逐字依 issue template [S22-tpl]）**

- Option 1「VS Code Publisher with Repo」：namespace 也是 Marketplace publisher，且已發布帶 `repository` 的擴充套件。二選一：repo 由申請的 GitHub ID 擁有（same org）；否則提供該 repo 中由申請者提交的 commit URL。
- Option 2「VS Code Publisher without Repo」：Marketplace publisher 沒有擴充套件，或沒有 GitHub repo。三選一：給 Open VSX 管理員臨時 reader 權限（完成後要撤銷）；與 namespace 同名網域的 DNS TXT；用該網域的 email 寄信到 openvsx@eclipse-foundation.org。
- Option 3「Not a VS Code Marketplace Publisher」：namespace 不是 Marketplace publisher。namespace 與申請者 GitHub ID 相符，或網域 TXT / email。
- Option 4「All Other Cases」：以上都辦不到，處理最久。

**本專案適用 Option 1**（推理：`xsmbradpitt` 會同時是 Marketplace publisher，因此不適用 Option 3；Option 2 需要網域或臨時授權；Option 1 只要 repo 屬於你的 GitHub ID）。操作：

1. 先確認第 4.1 節 A7 已完成，且 <https://marketplace.visualstudio.com/publishers/xsmbradpitt>（template 提供的檢查網址格式 [S22-tpl]）能看到擴充套件、其 `repository` 指向 `xsmBradPitt/interlinked-theme`。
2. 開 issue，欄位：**Namespace** 填 `xsmbradpitt`；勾 **Ownership**「The namespace is not currently owned on Open VSX …」；勾 **Account Age**「The GitHub ID making this request has at least 12 months of public history」；勾 Option 1 的核取方塊。
3. Option 1 下的「Choose one」兩行在 template 是 markdown 區塊而非表單欄位（由 YAML 結構推得）；請在 **Claim evidence** 欄用文字寫明：「repo `https://github.com/xsmBradPitt/interlinked-theme` 由申請的 GitHub ID 擁有」。
4. 送出後留意 issue 標籤是否變 `granted`。
- 做完後：`granted` 後，在 <https://open-vsx.org/user-settings/namespaces> 可看到你是 owner（頁面需登入後確認）；擴充套件頁警告消失 [S17][S21-ns]。

---

## 6. Repo secrets 與到期日

| GitHub secret 名稱 | 內容 | 建立處 | 到期時間 | 到期後症狀 | 提醒建議 |
|---|---|---|---|---|---|
| `VSCE_PAT`（僅 R2） | Marketplace PAT：Organization = All accessible organizations、Scope = `Marketplace (Manage)` [S1-faq] | Azure DevOps portal → User settings → Personal access tokens [S1-pat] | 建立時自訂（最長值未能驗證）；**無論如何 2026-12-01 起全域 PAT 失效** [S8][S9] | `vsce` 報錯含「Personal Access Token used has expired」並附「You're using an expired Personal Access Token, please get a new PAT.」，或「Invalid Resource」並附「You're likely using an expired Personal Access Token」[S5-publish]；401 時附「Be sure to use a Personal Access Token which has access to **all accessible accounts**」[S5-main] | 到期日前 14 天；另設 2026-11-15 提醒決定遷移路線 |
| `OVSX_PAT` | Open VSX access token | <https://open-vsx.org/user-settings/tokens> [S16] | 正式環境設定 90 天（`P90D`），到期前 7 天寄信 [S22-prod]；實際以 tokens 頁 **Expires** 欄為準 | `Invalid access token.` [S20-registry]；`ovsx publish` 失敗 | 建立日 + 80 天；成功改用 trusted publishing（5.1 B8）後刪除此 secret 與 token |
| （無）trusted publishing | `ovsx`：`id-token: write` 即可，不存 secret [S18]；`vsce --oidc` 後端尚未支援 [S6-benibenj] | — | 簽發的 token 約 5 分鐘 [S18]（Marketplace 側 session token 最長 15 分鐘 [S4-oidc]） | 登記不符時回「No trusted publisher matches the presented token」[S18] | — |
| （R3 才需要）`AZURE_CLIENT_ID`、`AZURE_TENANT_ID` | managed identity 的 Client ID / Tenant ID，非機密但建議放 repo variables | Azure Portal | federated credential 的到期行為未能驗證 | `Can not acquire a Microsoft Entra ID access token.` [S5-auth] | — |

補充：

- 名稱建議與 CLI 預設環境變數同名：`VSCE_PAT` [S2][S5-main]、`OVSX_PAT` [S19]，workflow 只要 `env:` 對映，不需額外參數。
- 建議把這些 secret 放在綁定 GitHub environment（含 required reviewers）的 environment secrets，而非 repo-wide secrets（Open VSX 官方也建議 trusted publisher 綁 environment [S18]）。
- 建立 GitHub Release 用內建的 `GITHUB_TOKEN`，不需另存。
- CI 兩段發布命令對照（僅示意 env 與參數，workflow 本身在實作階段撰寫）：

```bash
npx @vscode/vsce publish --packagePath "$VSIX" --skip-duplicate   # env: VSCE_PAT（R2）
npx ovsx publish "$VSIX" --skip-duplicate                          # env: OVSX_PAT，或改 --trusted-publishing
```

---

## 7. 發布前檢查清單

### A. VS Code Marketplace

- [ ] `package.json` 必填：`name`（全小寫、無空白）、`version`（SemVer）、`publisher`、`engines.vscode`（不可為 `*`）[S3]。
- [ ] `publisher` 是 publisher **ID** `xsmbradpitt`，不是顯示名稱；`vsce` 會擋「Expected the identifier of a publisher, not its human-friendly name」[S5-validation]。擴充套件 ID 由 `${publisher}.${name}` 組成 [S3]。
- [ ] `name` 與 `displayName` 在 Marketplace 上都要唯一，否則「ERROR The extension 'name' already exists in the Marketplace」[S1-faq]。
- [ ] `icon` 為 PNG、至少 128x128，**不可是 SVG** [S1][S3]；`galleryBanner.color` 為 hex [S1]。
- [ ] `keywords` 不超過 30 個，否則「You exceeded the number of allowed tags of 30」[S1-faq]。
- [ ] `categories` 使用允許值（含 `Themes`）[S3]。
- [ ] 根目錄有 `README.md`，且不是範本文字（`vsce` 會擋「It seems the README.md still contains template text」）[S5-package]；README 與 CHANGELOG 的圖片必須是 `https`，且不可是 SVG（受信任的 badge 供應商除外）[S1]。
- [ ] 根目錄有 `LICENSE`；沒有時 `vsce` 會互動詢問「Do you want to continue? [y/N]」，CI 非互動環境會中止（可用 `--skip-license`）[S5-package][S1]。
- [ ] `package.json` 有 `repository`；沒有時同樣互動詢問，且 README 相對連結需靠它或 `--baseContentUrl` / `--baseImagesUrl` 還原 [S5-package][S1]。
- [ ] `.vscodeignore` 排除 `reference/`（Reference Theme）、`samples/`（Sample）、`docs/`、測試與原始碼 [S1]；`vscode:prepublish` 腳本會在每次打包前執行，可放 build [S1]。
- [ ] CI 的 Node.js >= 22（`@vscode/vsce` 4.x 的需求）[S4][S27-vsce]；套件管理員只支援 npm 或 yarn v1 [S1-faq][S4]。
- [ ] 認證路線已決定（4.0 節），對應的 secret / 身分已就緒。

### B. Open VSX

- [ ] Eclipse 帳號的 GitHub username = `xsmBradPitt`（不分大小寫）[S20-oauth]。
- [ ] Publisher Agreement 為現行版本（查證時 v1.1）[S25][S20-eclipse]。
- [ ] namespace `xsmbradpitt` 已存在，大小寫與 `package.json` 的 `publisher` 完全一致 [S18][S21-guide]。
- [ ] 若 `xsmbradpitt.interlinked-theme` 已在 Marketplace：已取得該 namespace 的 owner，或接受第一版停在「under review」[S21][S17]。
- [ ] `package.json` 有 `license` 欄位（license expression，如 `MIT`）：Open VSX FAQ 要求所有擴充套件都要有授權並建議寫在 `package.json` [S24]；協議也規定未指定授權時以 MIT 提供 [S25]。
- [ ] 同一擴充套件在兩個市集使用相同 ID（same extension name、same publisher / namespace）[S21]。
- [ ] 發布內容不含看似 secret 的字串；誤判時可用 `// secret-detector:ignore` 標記 [S16]。
- [ ] token 未過期（tokens 頁 Expires 欄）或 trusted publisher 已註冊 [S18]。
- [ ] CI 的 Node.js >= 22 [S27-ovsx]。

---

## 8. 已知坑

### A. VS Code Marketplace

1. **全域 PAT 2026-12-01 起全數失效**，官方 PAT 文件甚至建議「Create only organization-scoped PATs」[S9]，與 Marketplace 要求的 All accessible organizations 衝突；官方未回應 [S15-2121]。
2. **`vsce publish --oidc` 在 README 已出現，但 Marketplace 後端不支援**：維護者承認「I should not have added it to the read me already」[S6-benibenj]；該選項曾被刻意從 `--help` 隱藏（「hide the unannounced `--oidc` option」）[S7-1297]。另有第三方觀察 `POST /_apis/gallery/token` 仍回 `TrustedPublishingNotSupportedException`（2026-10-08，線索）[S6]。
3. **npm `latest`（4.0.0，2026-09-14）不含最終的 OIDC 合約**；最終合約（`Authorization: FederatedToken …`、`?api-version=7.2-preview.1`）只在 `4.0.1-1` 之後的 `next` 版 [S27-vsce][S5-oidc][S7-1337]。後端未上線前這點不影響你，上線後要確認用哪個版本。
4. **官方 Entra 流程只涵蓋 Azure Pipelines**；GitHub Actions 版沒有官方文件，Microsoft 回覆者只回貼同一份文件並表示 Trusted Publisher 支援「not complete yet」[S15-2121]。社群指南需要 Azure subscription [S15-1422]（線索）。
5. **新建 Azure DevOps organization 需要 Azure subscription** [S11]，對沒有 organization 的維護者是額外門檻。
6. **`--azure-credential` 會被殘留的 `VSCE_PAT` 蓋掉**（`getPAT` 先判斷 PAT）[S5-publish][S5-main]。
7. **CI 非互動環境下的提示會讓流程中止**：缺 `repository`、缺 LICENSE、`activationEvents` 含 `*` 都會問 `Do you want to continue? [y/N]` [S5-package]；對應旗標 `--allow-missing-repository`、`--skip-license`、`--allow-star-activation`。
8. **名稱永久保留**：移除（Remove）擴充套件後名稱永久保留、不能重用，連原 publisher 也不行；要下架請用 Unpublish [S1]。已刪除的版本號不可重用，且不能刪除最新版本 [S1]。
9. **publisher ID 建立後不可改**；改 publisher 顯示名稱會撤銷 verified badge [S1-publisher][S1-verify]。
10. **在 Windows 打包會丟失 POSIX 檔案屬性（執行位元）**；從 Linux / macOS 發布不受影響 [S1-faq]。
11. 帳號或發布被擋時的官方管道：管理頁的 **Contact Microsoft** 連結 [S1-faq]；issue 中 Marketplace 團隊反覆引導寄信到 `VSMarketplace@microsoft.com` [S15-2215]。曾有首次發布被回「Your extension has suspicious content」且無細節的回報（線索）[S15-2215]；PAT 過期後 CI 重複失敗疑似引發 429 / Concurrency 封鎖的回報（線索，官方未確認原因）[S15-1933]——**PAT 到期要在到期日前換掉，不要讓 CI 反覆重試**。

### B. Open VSX

1. **wiki 說 token 不會過期，正式環境設定是 90 天**（5.1 B4）[S16][S22-prod][S20-config]。
2. **wiki 的 Eclipse 註冊指示過時**：註冊表單沒有 GitHub Username 欄位 [S26]（5.1 B1）。
3. **namespace 已存在於 Marketplace 時，沒有 owner 就不能正常發布**，掃描器為 enforced：「Namespace '…' exists in the referenced gallery, but is not verified.」[S20-scanner][S22-prod]。
4. **claim 的 Option 3 在你建立 Marketplace publisher 後就不適用**（「The namespace is not a publisher account on the VS Code Marketplace」）[S22-tpl]；Option 1 要求 Marketplace 已發布帶 repo 的擴充套件 [S22-tpl]——這是第 3 節順序的來源。
5. **GitHub 帳號歷史至少 12 個月**才能申請；不足時可先用別的帳號申請再加入 [S21-ns]。
6. **GitHub 帳號與 Eclipse profile 不一致**會在「Log in with Eclipse」階段被拒 [S20-oauth]；瀏覽器若登入了別的 GitHub 帳號，容易誤簽到錯的帳號。
7. **Publisher Agreement 版本更新後**，舊簽署變 outdated 且發布被擋 [S20-eclipse]。
8. **trusted publishing 的限制**：必須是 owner；擴充套件需先存在且至少一個 active 版本，刪光所有版本後註冊會失效（「No trusted publisher matches the presented token」）；`publisher` 大小寫需與 namespace 完全一致 [S18]。
9. **PAT 與 OIDC 並存時 PAT 優先** [S18][S19]。
10. **發布後是非同步處理**：先「Deactivated」數秒再 active [S21]；掃描未過會被隔離（quarantined / under review）[S21][S20-scanner]。
11. **只能用 `vsce` 打包出的 `.vsix`**；其他壓縮方式「unreliable and is not supported」[S21]。
12. **官方 repo 改名**（`eclipse/openvsx` → `eclipse-openvsx/openvsx`）：舊連結會轉址，但文件與錯誤訊息仍引用舊網址 [S19][S19-main]。

---

## 9. 與 spec 敘述不一致或需要更新之處

> 2026-10-14：維護者定案 Marketplace 走 R1（手動上傳），spec 已據此更新（Solution 段、User Story 63 與 67、第 113、143、144 行）。下表的「現有敘述」是更新前的原文，保留作為依據。

| spec 位置 | 現有敘述 | 查證結果 | 建議 |
|---|---|---|---|
| 第 142–143 行（帳號） | 「在 Marketplace 建立 publisher `xsmbradpitt`」 | 正確但不完整：需 Microsoft 帳號；PAT 路線需 Azure DevOps organization，新建需 Azure subscription [S11]；建立 publisher 時要同意 Marketplace Publisher Agreement [S13] | 補上前置帳務條件與認證路線選擇（本文 4.0 節） |
| 第 143 行 | 「在 Open VSX 用 Eclipse 帳號簽 Publisher Agreement、建立 namespace、並申請 namespace 驗證」 | 一致。補充：Eclipse 註冊表單沒有 GitHub Username 欄位 [S26]；claim 需 GitHub 帳號 >= 12 個月 [S22-tpl]（已滿足 [S28]）；**順序受「Marketplace 已有同名擴充套件需先有 owner」影響** [S21] | 在 spec 加註發布順序（本文第 3 節） |
| 第 143 行 | 「`vsce` 的驗證方式，實作時要查最新的官方文件」 | 已查：PAT 於 2026-12-01 退役 [S1][S8]；Entra ID 的 `--azure-credential`（vsce >= v2.26.1）[S1-entra]；`--oidc` 已在 CLI 但後端未支援 [S6-benibenj] | 把這條改成具體結論與所選路線 |
| 第 144 行 | 「Marketplace PAT 最長一年就到期」 | 官方文件讀不到「最長一年」[S9][S14]；到期日由建立者設定，管理員可設上限 [S10]；**更關鍵的是全域 PAT 2026-12-01 一律失效** [S8] | 改為「PAT 在 2026-12-01 前後必須遷移」，不再以「一年」為依據 |
| 第 113 行（發布流程） | 「token 存在 repo secrets（Marketplace PAT、Open VSX token）」 | Open VSX token 實為 90 天 [S22-prod]，且可改 trusted publishing 完全不存 token [S18]；Marketplace 端 PAT 即將失效、無 PAT 路線尚未可用 | secrets 清單改為本文第 6 節 |
| 第 113 行 | 「用同一個 `.vsix` 先後發布到 VS Code Marketplace 和 Open VSX」 | 首次發布時 Open VSX 會因 ownership 未核准而卡「under review」[S21] | 首次 release 手動 / 分階段（本文第 3 節） |
| 第 142 行 | 「上架前先在兩個市集搜尋 `interlinked`」 | 另有 Open VSX 發布時的 namespace 相似度檢查 [S16]、Marketplace 的 `name` / `displayName` 唯一性 [S1-faq] | 可補註，非必要 |

---

## 10. 未能驗證項目

1. **Marketplace PAT 的最長有效期限**：官方 PAT 文件與 REST API 文件均未載明數字 [S9][S14]；「max 1 year」僅見於社群使用者的 issue 文字 [S15-1422]，不採用。
2. **建立 Marketplace publisher 是否強制要先有 Azure DevOps organization**：官方文件順序是先 PAT 後 publisher [S1]，但未明說相依關係。**2026-10-14 已實測**：維護者沒有 Azure subscription，用個人 Microsoft 帳號登入管理頁，直接建立 publisher 成功。（該帳號是否早已有 organization 未確認，但沒有 subscription 就無法新建，故可視為不需要。）**能否直接以 GitHub 帳號登入管理頁**仍未驗證。
3. **PAT 建立畫面目前實際選項**：Azure DevOps 文件寫「select one organization」[S9]，VS Code 文件寫「All accessible organizations」並要 Marketplace → Manage [S1-pat]，社群回報找不到 Marketplace scope [S15-1926]；需登入後確認。
4. **organization-scoped PAT 能否發布 Marketplace**：官方文件互相矛盾 [S1][S9]，issue 未獲答覆 [S15-2121]。
5. **2026-12-01 期限是否延期**，以及 Marketplace trusted publishing 上線時程：Marketplace 團隊僅表示「working on」、無日期 [S15-2121][S6]。
6. **GitHub Actions + Entra ID 的官方流程**：官方文件只涵蓋 Azure Pipelines [S1-entra]；若不想用 `azure/login` action，改用 `az login --federated-token` 自行換 token 是否可行，未能驗證（僅為推測，未寫入步驟）。
7. **Azure subscription 是否一定要信用卡**：屬 Azure 帳務，來源不在範圍內；社群回報需要 [S15-1926]。
8. **Eclipse 帳號 GitHub username 欄位在哪個頁面**：需登入後確認 [S26 vs S16/S24]。
9. **namespace claim 審核時間**：官方沒有 SLA [S21-guide]。
10. **open-vsx.org 正式環境 token 是否真的 90 天**：設定檔與 wiki 衝突，設定檔註解自陳需對照實際環境 [S22-prod][S16]；以 tokens 頁 Expires 欄為準。
11. **`ovsx publish` 在「under review」狀態下的輸出與 exit code**：未能驗證。
12. **Open VSX 正式站 Trusted Publishers 設定頁的實際畫面**：只有 wiki 與原始碼描述 [S18]；`api/version` 與設定檔為間接佐證 [S23][S22-prod]。
13. **`ovsx publish <file> --trusted-publishing` 併用**：README 只示範不帶檔案的形式 [S19]；原始碼顯示 namespace 與 extension 取自 `.vsix` manifest [S19-publish]，屬推論。
14. **網頁上傳時自動建立的 namespace 大小寫**：wiki 只說「matching your GitHub ID」[S21]，行為未能驗證，故建議明確 `create-namespace`。
15. **維護者是否擁有符合 domain verification 條件的網域**：未提供資訊 [S1-eligible]。
16. **Marketplace 管理頁上傳 `.vsix` 的按鈕名稱、publisher 建立後頁面細節**：官方文件僅以截圖呈現，需登入後確認 [S1-publish]。
17. **建立 publisher 畫面的「其餘選填欄位」名稱**，以及 **ID / Name 被占用時的錯誤文字**：官方文件只有截圖與「Optionally, fill out the rest of the fields」[S1-publisher]；需登入後確認。
18. **`ID` 自動帶入的轉換規則**（例如是否自動轉小寫）：[S13] 只說「the ID field autofills based on your entry」，A2 因此要求填完 Name 後檢查 ID。
19. **publisher 的 `name` 長度限制「within 16 characters for multibyte characters」的確切語意**：[S13] 的備註原文不明確。

---

## 11. 來源列表

查證日期：**2026-10-13**。除另行標示，網頁與原始檔均於當日讀取；原始碼以固定 commit / tag 連結避免漂移。「實際讀到的頁面標題」為瀏覽器 `<title>` 或原始檔 H1 / 檔名。

### VS Code 與 vsce

| 代號 | 實際讀到的頁面標題 | 網址 | 備註 |
|---|---|---|---|
| S1 | Publishing Extensions \| Visual Studio Code Extension API | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension> | 同時讀 `microsoft/vscode-docs` 原始檔，`DateApproved: 10/7/2026` |
| S1-pat | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token> | 錨點 |
| S1-publisher | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#create-a-publisher> | 錨點；2026-10-14 重讀（ID / Name 說明、「Optionally, fill out the rest of the fields」） |
| S1-publish | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publish-an-extension> | 錨點；2026-10-14 重讀，手動上傳只有一句話加截圖，沒有按鈕名稱 |
| S1-entra | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace> | 錨點 |
| S1-verify | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#verify-a-publisher> | 錨點 |
| S1-eligible | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#eligible-domains> | 錨點 |
| S1-faq | 同上 | <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#common-questions> | 錨點 |
| S2 | Continuous Integration \| Visual Studio Code Extension API | <https://code.visualstudio.com/api/working-with-extensions/continuous-integration> | `DateApproved: 10/7/2026` |
| S2-gha | 同上 | <https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions-automated-publishing> | 錨點 |
| S3 | Extension Manifest \| Visual Studio Code Extension API | <https://code.visualstudio.com/api/references/extension-manifest> | 欄位表 |
| S4 | GitHub - microsoft/vscode-vsce: VS Code Extension Manager（README H1：`@vscode/vsce`） | <https://github.com/microsoft/vscode-vsce> | README @ `04811a9`（2026-10-02） |
| S4-oidc | 同上 | <https://github.com/microsoft/vscode-vsce#trusted-publishing> | 「Trusted publishing」段 |
| S5-main | `src/main.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/main.ts> | 指令與旗標、`VSCE_PAT` 預設、401 提示 |
| S5-publish | `src/publish.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/publish.ts> | `getPAT`（L385）、過期訊息（L284–286）、`--skip-duplicate` |
| S5-package | `src/package.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/package.ts> | repository（L601）、README 範本（L800）、LICENSE（L1102）提示 |
| S5-validation | `src/validation.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/validation.ts> | `nameRegex`（L5） |
| S5-store | `src/store.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/store.ts> | `verifyPat` |
| S5-oidc | `src/oidc.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/oidc.ts> | OIDC 交換 |
| S5-auth | `src/auth.ts` | <https://github.com/microsoft/vscode-vsce/blob/04811a9/src/auth.ts> | Azure credential 鏈 |
| S6 | Support trusted publishing · Issue #1275 · microsoft/vscode-vsce | <https://github.com/microsoft/vscode-vsce/issues/1275> | 2026-10-12 狀態 open，11 則留言 |
| S6-benibenj | 同上（留言 5990771209，2026-10-05，vsce 維護者） | <https://github.com/microsoft/vscode-vsce/issues/1275#issuecomment-5990771209> | 「`--oidc` is not yet fully supported by the marketplace backend.」 |
| S7-1297 | Hide OIDC option from publish help · PR #1297 · microsoft/vscode-vsce | <https://github.com/microsoft/vscode-vsce/pull/1297> | 2026-08-05 合併 |
| S7-1337 | oidc: align token exchange with the Marketplace contract · PR #1337 · microsoft/vscode-vsce | <https://github.com/microsoft/vscode-vsce/pull/1337> | 2026-09-29 合併；另讀 commit `c960f2e`「Update OIDC exchange to the final Marketplace contract」，經 `git tag --contains` 確認只在 `v4.0.1-1` 之後的 tag |
| S27-vsce | npm registry 中繼資料 `@vscode/vsce` | <https://registry.npmjs.org/@vscode/vsce> | `latest` = 4.0.0（2026-09-14），`next` = 4.0.1-3（2026-10-03），engines node >= 22 |

### Microsoft / Azure DevOps

| 代號 | 實際讀到的頁面標題 | 網址 | 備註 |
|---|---|---|---|
| S8 | Retirement of Global Personal Access Tokens in Azure DevOps - Azure DevOps Blog | <https://devblogs.microsoft.com/devops/retirement-of-global-personal-access-tokens-in-azure-devops/> | 發表 2025-12-12，更新 2026-03-26 |
| S9 | Use personal access tokens - Azure DevOps \| Microsoft Learn | <https://learn.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate> | 讀 `MicrosoftDocs/azure-devops-docs` 原始檔，`ms.date: 09/21/2026` |
| S10 | Manage personal access tokens using policies - Azure DevOps \| Microsoft Learn | <https://learn.microsoft.com/azure/devops/organizations/accounts/manage-pats-with-policies-for-administrators> | `ms.date: 04/22/2026` |
| S11 | Create an organization - Azure DevOps \| Microsoft Learn | <https://learn.microsoft.com/azure/devops/organizations/accounts/create-organization> | `ms.date: 03/03/2026` |
| S12 | Authenticate to Azure DevOps with Microsoft Entra ID - Azure DevOps \| Microsoft Learn | <https://learn.microsoft.com/azure/devops/integrate/get-started/authentication/entra> | `ms.date: 09/18/2026`；背景，未直接引用 |
| S13 | Package and publish extensions - Azure DevOps \| Microsoft Learn | <https://learn.microsoft.com/azure/devops/extend/publish/overview> | 含 `includes/create-publisher.md`；針對 Azure DevOps 擴充套件，發佈者入口相同；2026-10-14 重讀（`ms.date: 2026-04-03`）：建立入口 `…/manage/createpublisher?managePageRedirect=true`、「ID field autofills」、16 字元備註、範例 `mycompany-myteam` / `My Team` |
| S14 | Pats - Create - REST API (Azure DevOps Tokens) \| Microsoft Learn | <https://learn.microsoft.com/en-us/rest/api/azure/devops/tokens/pats/create?view=azure-devops-rest-7.1> | `validTo` 無最大值說明 |
| S15-2121 | Support publishing extensions with organization-scoped PATs due to global PATs being retired · Issue #2121 · microsoft/vsmarketplace | <https://github.com/microsoft/vsmarketplace/issues/2121> | 2026-09-14 留言（他人留言稱其屬 Marketplace 團隊）：「It's not complete yet. We are still actively working on it.」 |
| S15-1422 | Trusted Publishing for extensions · Issue #1422 · microsoft/vsmarketplace | <https://github.com/microsoft/vsmarketplace/issues/1422> | 含社群 Entra + GitHub Actions 指南（線索） |
| S15-1926 | Clear migration guide from PAT publishing to Microsoft Entra ID · Issue #1926 · microsoft/vsmarketplace | <https://github.com/microsoft/vsmarketplace/issues/1926> | 使用者回報（線索） |
| S15-2215 | VS Code extension first publish rejected as suspicious content · Issue #2215 · microsoft/vsmarketplace | <https://github.com/microsoft/vsmarketplace/issues/2215> | 使用者回報與官方客服指引（線索） |
| S15-1933 | Publisher devsessioncanvas: blocked with 429 and Concurrency error · Issue #1933 · microsoft/vsmarketplace | <https://github.com/microsoft/vsmarketplace/issues/1933> | 使用者回報（線索） |

### Open VSX / Eclipse

| 代號 | 實際讀到的頁面標題 | 網址 | 備註 |
|---|---|---|---|
| S16 | Publishing Extensions · eclipse-openvsx/openvsx Wiki · GitHub | <https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions> | 頁內 H2：How to Publish an Extension |
| S17 | Namespace Access · eclipse-openvsx/openvsx Wiki · GitHub | <https://github.com/eclipse-openvsx/openvsx/wiki/Namespace-Access> | |
| S18 | Trusted Publishing · eclipse-openvsx/openvsx Wiki · GitHub | <https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing> | wiki 最後更新 2026-10-01 |
| S19 | openvsx/cli/README.md at main · eclipse-openvsx/openvsx · GitHub（H1：`ovsx`） | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/README.md> | 固定 commit `62b42c4`（2026-10-12） |
| S19-main | `cli/src/main.ts` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/src/main.ts> | 指令、`--skip-duplicate`、`verify-pat` |
| S19-util | `cli/src/util.ts` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/src/util.ts> | `OVSX_PAT`（L21） |
| S19-publish | `cli/src/publish.ts` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/src/publish.ts> | trusted publishing 取 manifest 的 publisher / name |
| S20-oauth | `OAuth2UserServices.java` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/security/OAuth2UserServices.java> | Eclipse 連結錯誤訊息（L143–150） |
| S20-eclipse | `EclipseService.java` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/eclipse/EclipseService.java> | Publisher Agreement 檢查訊息（L139–162） |
| S20-registry | `LocalRegistryService.java` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/LocalRegistryService.java> | `Invalid access token.`（L86）、`Namespace already exists`（L764） |
| S20-validator | `ExtensionValidator.java` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/ExtensionValidator.java> | namespace regex（L44） |
| S20-config | `doc/configuration.md` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/doc/configuration.md> | `ovsx.access-token.expiration`（L1455，預設 P90D） |
| S20-scanner | `NamespaceOwnershipCheckScanner.java` | <https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/scanning/NamespaceOwnershipCheckScanner.java> | |
| S20-agreement-ui | `user-publisher-agreement.tsx` @ v1.2.0 | <https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/user/profile/user-publisher-agreement.tsx> | UI 字串 |
| S20-token-ui | `generate-access-token-dialog.tsx` @ v1.2.0 | <https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/user/tokens/generate-access-token-dialog.tsx> | 按鈕字串 |
| S20-tokens-ui | `user-settings-tokens.tsx` @ v1.2.0 | <https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/user/tokens/user-settings-tokens.tsx> | tokens 頁 `Expires` 欄（L130–134） |
| S20-banner | `extension-detail.tsx` @ v1.2.0 | <https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/extension-detail/extension-detail.tsx> | `UnverifiedBanner` 與 `Verified publisher` / `Unverified publisher`（L112、L128） |
| S21 | Publishing Extensions · EclipseFdn/open-vsx.org Wiki · GitHub | <https://github.com/EclipseFdn/open-vsx.org/wiki/Publishing-Extensions> | 2026-09-28 更新版，含「Preserving Identity Across Registries」與 under review 說明 |
| S21-ns | Managing Namespaces · EclipseFdn/open-vsx.org Wiki · GitHub | <https://github.com/EclipseFdn/open-vsx.org/wiki/Managing-Namespaces> | |
| S21-guide | Guidelines on Namespace Requests · EclipseFdn/open-vsx.org Wiki · GitHub | <https://github.com/EclipseFdn/open-vsx.org/wiki/Guidelines-on-Namespace-Requests> | |
| S22-tpl | open-vsx.org/.github/ISSUE_TEMPLATE/claim-namespace-ownership.yml at main · EclipseFdn/open-vsx.org · GitHub | <https://github.com/EclipseFdn/open-vsx.org/blob/460c57a/.github/ISSUE_TEMPLATE/claim-namespace-ownership.yml> | 固定 commit `460c57a`（2026-10-12）；template 名稱「Claim namespace ownership」 |
| S22-prod | `configuration/application-production.yml` | <https://github.com/EclipseFdn/open-vsx.org/blob/460c57a/configuration/application-production.yml> | token 90 天、trusted publishing、掃描器設定 |
| S22-readme | open-vsx.org `README.md` | <https://github.com/EclipseFdn/open-vsx.org/blob/460c57a/README.md> | 「Claiming Namespace Ownership」段 |
| S23 | open-vsx.org `/api/version`（JSON） | <https://open-vsx.org/api/version> | 2026-10-13 回傳 `version: v1.2.0`、含 `trustedPublishingAudience` |
| S24 | Eclipse Foundation Open VSX Registry Frequently Asked Questions (FAQ) \| The Eclipse Foundation | <https://www.eclipse.org/legal/open-vsx-registry-faq/> | Last Updated: 8 May 2024 |
| S25 | Eclipse Foundation Open VSX Publisher Agreement（PDF，Version 1.1 – September 2025） | <https://www.eclipse.org/legal/documents/eclipse-openvsx-publisher-agreement.pdf> | |
| S26 | Create new account \| Eclipse - The Eclipse Foundation open source community website. | <https://accounts.eclipse.org/user/register> | 讀取註冊表單欄位 |
| S27-ovsx | npm registry 中繼資料 `ovsx` | <https://registry.npmjs.org/ovsx> | `latest` = 1.2.0（2026-09-10），engines node >= 22 |
| S28 | GitHub API：users/xsmBradPitt | <https://api.github.com/users/xsmBradPitt> | `created_at: 2025-04-22` |

### 註記

- **UI 字串來源**：Open VSX 的 UI 字串取自 v1.2.0 tag 的 `webui` 原始碼（正式站 `/api/version` 回報 v1.2.0 [S23]），不是對正式站畫面的直接觀察；實際畫面以登入後所見為準。
- 沒有讀取的主要來源：Azure DevOps 與 Marketplace 管理頁（需登入）、Open VSX 網站內部頁面（SPA，需登入）、GitHub 自身文件（不在來源範圍）。
- 社群文章（DEV Community、Classmethod、個人部落格）只作為搜尋線索，沒有被當作依據。

[S1]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
[S1-pat]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token
[S1-publisher]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#create-a-publisher
[S1-publish]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publish-an-extension
[S1-entra]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace
[S1-verify]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#verify-a-publisher
[S1-eligible]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#eligible-domains
[S1-faq]: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#common-questions
[S2]: https://code.visualstudio.com/api/working-with-extensions/continuous-integration
[S2-gha]: https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions-automated-publishing
[S3]: https://code.visualstudio.com/api/references/extension-manifest
[S4]: https://github.com/microsoft/vscode-vsce
[S4-oidc]: https://github.com/microsoft/vscode-vsce#trusted-publishing
[S5-main]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/main.ts
[S5-publish]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/publish.ts
[S5-package]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/package.ts
[S5-validation]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/validation.ts
[S5-store]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/store.ts
[S5-oidc]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/oidc.ts
[S5-auth]: https://github.com/microsoft/vscode-vsce/blob/04811a9/src/auth.ts
[S6]: https://github.com/microsoft/vscode-vsce/issues/1275
[S6-benibenj]: https://github.com/microsoft/vscode-vsce/issues/1275#issuecomment-5990771209
[S7-1297]: https://github.com/microsoft/vscode-vsce/pull/1297
[S7-1337]: https://github.com/microsoft/vscode-vsce/pull/1337
[S8]: https://devblogs.microsoft.com/devops/retirement-of-global-personal-access-tokens-in-azure-devops/
[S9]: https://learn.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate
[S10]: https://learn.microsoft.com/azure/devops/organizations/accounts/manage-pats-with-policies-for-administrators
[S11]: https://learn.microsoft.com/azure/devops/organizations/accounts/create-organization
[S12]: https://learn.microsoft.com/azure/devops/integrate/get-started/authentication/entra
[S13]: https://learn.microsoft.com/azure/devops/extend/publish/overview
[S14]: https://learn.microsoft.com/en-us/rest/api/azure/devops/tokens/pats/create?view=azure-devops-rest-7.1
[S15-2121]: https://github.com/microsoft/vsmarketplace/issues/2121
[S15-1422]: https://github.com/microsoft/vsmarketplace/issues/1422
[S15-1926]: https://github.com/microsoft/vsmarketplace/issues/1926
[S15-2215]: https://github.com/microsoft/vsmarketplace/issues/2215
[S15-1933]: https://github.com/microsoft/vsmarketplace/issues/1933
[S16]: https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions
[S17]: https://github.com/eclipse-openvsx/openvsx/wiki/Namespace-Access
[S18]: https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing
[S19]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/README.md
[S19-main]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/src/main.ts
[S19-util]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/src/util.ts
[S19-publish]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/cli/src/publish.ts
[S20-oauth]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/security/OAuth2UserServices.java
[S20-eclipse]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/eclipse/EclipseService.java
[S20-registry]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/LocalRegistryService.java
[S20-validator]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/ExtensionValidator.java
[S20-config]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/doc/configuration.md
[S20-scanner]: https://github.com/eclipse-openvsx/openvsx/blob/62b42c4/server/src/main/java/org/eclipse/openvsx/scanning/NamespaceOwnershipCheckScanner.java
[S20-agreement-ui]: https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/user/profile/user-publisher-agreement.tsx
[S20-token-ui]: https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/user/tokens/generate-access-token-dialog.tsx
[S20-tokens-ui]: https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/user/tokens/user-settings-tokens.tsx
[S20-banner]: https://github.com/eclipse-openvsx/openvsx/blob/v1.2.0/webui/src/pages/extension-detail/extension-detail.tsx
[S21]: https://github.com/EclipseFdn/open-vsx.org/wiki/Publishing-Extensions
[S21-ns]: https://github.com/EclipseFdn/open-vsx.org/wiki/Managing-Namespaces
[S21-guide]: https://github.com/EclipseFdn/open-vsx.org/wiki/Guidelines-on-Namespace-Requests
[S22-tpl]: https://github.com/EclipseFdn/open-vsx.org/blob/460c57a/.github/ISSUE_TEMPLATE/claim-namespace-ownership.yml
[S22-prod]: https://github.com/EclipseFdn/open-vsx.org/blob/460c57a/configuration/application-production.yml
[S22-readme]: https://github.com/EclipseFdn/open-vsx.org/blob/460c57a/README.md
[S23]: https://open-vsx.org/api/version
[S24]: https://www.eclipse.org/legal/open-vsx-registry-faq/
[S25]: https://www.eclipse.org/legal/documents/eclipse-openvsx-publisher-agreement.pdf
[S26]: https://accounts.eclipse.org/user/register
[S27-vsce]: https://registry.npmjs.org/@vscode/vsce
[S27-ovsx]: https://registry.npmjs.org/ovsx
[S28]: https://api.github.com/users/xsmBradPitt
