# Interlinked

一個 VS Code / Cursor 用的深色顏色主題擴充套件，改作自上游的 Zed 主題「Blade Runner 2049」。

## Language

### 產品

**Interlinked**:
本擴充套件本身，ID 是 `xsmbradpitt.interlinked-theme`，同時發布到 VS Code Marketplace 與 Open VSX。
_Avoid_: Blade Runner theme、BR2049

**Reference Theme**:
上游 Zed 主題 JSON 的原樣副本，作為配色的規格來源；不打包、不發布。
_Avoid_: 原始主題、Zed 主題、source theme

### 配色

**Palette**:
有名字的顏色集合，是主題裡每一個顏色的唯一來源。
_Avoid_: 色票、colors、tokens

**UI Area**:
VS Code 工作區裡的一個區域（例如 sideBar、statusBar、terminal），是工作區配色覆蓋範圍的單位；清單內的 UI Area 必須完整上色。
_Avoid_: section、panel（panel 是其中一個 UI Area 的名字）

### 驗證

**Sample**:
特定語言的範例原始碼檔，用來目視驗證語法高亮與截圖。
_Avoid_: fixture、demo file
